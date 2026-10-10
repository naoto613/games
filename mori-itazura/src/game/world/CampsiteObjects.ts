// キャンプ場の動く物・調べられる物（食べ物・拾える物・ゴミ箱・ドア・ボート・宝など）
import * as THREE from 'three';
import { CAMPSITE as L, P2 } from '../content/areas/campsite';
import { WorldManager } from './WorldManager';
import { height, lakeSdf, onDock, WATER_Y, groundY } from './Terrain';
import { MASK_PLAYER } from './CollisionSystem';
import { GeoBuilder } from '../render/Geo';
import { itemObject } from '../render/ItemModels';
import { propMat, charMat, glowMat } from '../render/Materials';
import { ITEMS } from '../content/items/items';
import type { Interactable, InteractionResult } from '../entities/Interactable';
import type { GameContext } from '../core/Context';

type Def = Omit<Interactable, 'markerY' | 'reach' | 'active' | 'canInteract'> & Partial<Pick<Interactable, 'markerY' | 'reach' | 'active' | 'canInteract'>>;

function make(d: Def): Interactable {
  return { reach: 1.1, markerY: 0.6, active: () => true, canInteract: () => true, ...d };
}

const FAMILY = ['dad', 'mom'];

export interface Pickup {
  id: string;
  itemId: string;
  obj: THREE.Object3D;
  x: number; y: number; z: number;
  persist: boolean;
  vy: number;
  sparkle: boolean;
  activeFn?: (ctx: GameContext) => boolean;
  taken: boolean;
}

export class CampsiteObjects {
  readonly pickups: Pickup[] = [];
  private basketItems: Record<string, THREE.Object3D[]> = {};
  private plateItems: THREE.Object3D[] = [];
  private blanketItems: THREE.Object3D[] = [];
  private door!: THREE.Object3D;
  private doorAngle = 0;
  boat!: THREE.Group;
  private oars: THREE.Object3D[] = [];
  private laundryObj!: THREE.Object3D;
  private hatObj!: THREE.Object3D;
  private digObj!: THREE.Group;
  private chest!: THREE.Object3D;
  private chestT = -1;
  private sparkleTex: THREE.Texture;
  private sparkles: THREE.Sprite[] = [];
  private trashCool: number[] = [];
  private treeCool = 0;
  private basketEmptyT = 0;
  private homeObjs: Record<string, THREE.Object3D> = {};
  private appleSeq = 0;

  constructor(private w: WorldManager) {
    this.sparkleTex = makeSparkle();
  }

  build(ctx: GameContext) {
    this.buildFood(ctx);
    this.buildPickups(ctx);
    this.buildMisc(ctx);
    this.buildCabin(ctx);
    this.buildBoat(ctx);
    this.buildHome(ctx);
    this.buildTreasure(ctx);
    this.syncAll(ctx);
  }

  private add(i: Interactable) { this.w.interactables.push(i); return i; }

  // ───────── ピクニックの食べ物 ─────────
  private buildFood(ctx: GameContext) {
    this.defaults(ctx);

    // バスケット
    const t1 = L.picnic.table1.pos;
    const bx = t1[0] + 0.62, bz = t1[1] + 0.0, by = height(t1[0], t1[1]) + 0.79;
    const b = new GeoBuilder();
    const wicker = (p: THREE.Vector3) => new THREE.Color(((Math.floor(p.y * 40) + Math.floor(Math.atan2(p.z, p.x) * 6)) & 1) ? '#c99256' : '#a8743f');
    b.lathe([[0, 0], [0.17, 0], [0.2, 0.06], [0.21, 0.15], [0.19, 0.15], [0.18, 0.06], [0.0, 0.03]], wicker, { scale: [1.25, 1, 0.9] }, 22);
    b.torus(0.19, 0.016, '#8a5a32', { pos: [0, 0.15, 0], rot: [0, 0, 0], scale: [1.25, 1.1, 0.9] }, Math.PI, 6, 18);
    b.box(0.2, 0.012, 0.16, '#d8453b', { pos: [-0.12, 0.15, 0.04], rot: [0.1, 0.3, 0.2] }, 0.004);
    const basket = this.w.mesh(b, bx, bz, 0.2, propMat, by);
    const contents: Record<string, [number, number, number][]> = {
      sandwich: [[-0.08, 0.1, 0.02], [0.06, 0.1, -0.03]],
      apple: [[0.12, 0.08, 0.06], [0.16, 0.08, -0.05]],
      cookie: [[-0.02, 0.14, 0.06], [0.02, 0.15, -0.06]],
    };
    for (const [id, ps] of Object.entries(contents)) {
      this.basketItems[id] = ps.map((p) => {
        const o = itemObject(id, charMat);
        o.position.set(...p);
        o.rotation.set(0.3, Math.random() * 6, 0.2);
        basket.add(o);
        return o;
      });
    }
    this.add(make({
      id: 'basket', type: 'food', position: { x: bx, y: by, z: bz }, markerY: 0.5, reach: 1.15, object: basket,
      label: () => 'ごはんを とる',
      active: (c) => total(c.state.obj('basket')) > 0,
      interact: (c) => {
        const s = c.state.obj<Record<string, number>>('basket')!;
        const id = ['sandwich', 'apple', 'cookie'].find((k) => s[k] > 0);
        if (!id) return { ok: false, message: 'からっぽ…' };
        s[id]--;
        c.inv.add(id, 1, 'basket');
        this.syncFood(c);
        return { ok: true, anim: 'pickup', animTime: 0.6, theftItem: id, owner: FAMILY, noise: 2.5 };
      },
    }));
    // テーブル2のすいか
    const t2 = L.picnic.table2;
    const plate = new GeoBuilder();
    plate.cyl(0.2, 0.16, 0.025, '#ffffff', { pos: [0, 0.012, 0] }, 20);
    const pm = this.w.mesh(plate, t2.pos[0] - 0.4, t2.pos[1] + 0.1, 0, propMat, height(t2.pos[0], t2.pos[1]) + 0.78);
    for (let i = 0; i < 2; i++) {
      const o = itemObject('watermelon', charMat);
      o.position.set(-0.06 + i * 0.12, 0.03, 0); o.rotation.y = i * 0.4;
      pm.add(o); this.plateItems.push(o);
    }
    this.add(make({
      id: 'plate', type: 'food', position: { x: pm.position.x, y: pm.position.y, z: pm.position.z }, markerY: 0.45,
      label: () => 'すいかを とる', active: (c) => (c.state.obj<number>('plate') ?? 0) > 0,
      interact: (c) => {
        c.state.setObj('plate', (c.state.obj<number>('plate') ?? 0) - 1);
        c.inv.add('watermelon', 1, 'plate');
        this.syncFood(c);
        return { ok: true, anim: 'pickup', animTime: 0.6, theftItem: 'watermelon', owner: FAMILY, noise: 2 };
      },
    }));
    // シートのりんご
    const bl = L.picnic.blanket;
    const bpos = { x: bl.pos[0] + 0.48, z: bl.pos[1] + 0.4 };
    for (let i = 0; i < 3; i++) {
      const o = itemObject('apple', charMat);
      o.position.set(bpos.x + (i - 1) * 0.1, height(bl.pos[0], bl.pos[1]) + 0.08, bpos.z + (i % 2) * 0.06);
      o.scale.setScalar(1.2);
      this.w.group.add(o); this.blanketItems.push(o);
    }
    this.add(make({
      id: 'blanket', type: 'food', position: { x: bpos.x, y: height(bl.pos[0], bl.pos[1]), z: bpos.z }, markerY: 0.4,
      label: () => 'りんごを とる', active: (c) => (c.state.obj<number>('blanketApples') ?? 0) > 0,
      interact: (c) => {
        c.state.setObj('blanketApples', (c.state.obj<number>('blanketApples') ?? 0) - 1);
        c.inv.add('apple', 1, 'blanket');
        this.syncFood(c);
        return { ok: true, anim: 'pickup', animTime: 0.6, theftItem: 'apple', owner: FAMILY, noise: 1.5 };
      },
    }));
    // クーラーボックス
    const co = L.picnic.cooler;
    this.add(make({
      id: 'cooler', type: 'container', position: { x: co[0], y: height(co[0], co[1]), z: co[1] }, markerY: 0.75,
      label: () => 'クーラーを あける', active: (c) => (c.state.obj<number>('cooler') ?? 0) > 0,
      interact: (c) => {
        c.state.setObj('cooler', (c.state.obj<number>('cooler') ?? 0) - 1);
        c.inv.add('corn', 1, 'cooler');
        return { ok: true, anim: 'interact', animTime: 0.8, theftItem: 'corn', owner: FAMILY, noise: 3 };
      },
    }));
    this.add(make({
      id: 'cooler2', type: 'container', position: { x: 1.6, y: height(1.6, -11.2), z: -11.2 }, markerY: 0.75,
      label: () => 'クーラーを あける', active: (c) => total(c.state.obj('cooler2')) > 0,
      interact: (c) => {
        const s = c.state.obj<Record<string, number>>('cooler2')!;
        const id = ['marshmallow', 'corn'].find((k) => s[k] > 0)!;
        s[id]--;
        c.inv.add(id, 1, 'cooler2');
        return { ok: true, anim: 'interact', animTime: 0.8, theftItem: id, owner: ['camper'], noise: 3 };
      },
    }));
  }

  /** 新しいゲーム・古いセーブで足りない状態を補う */
  defaults(ctx: GameContext) {
    const st = ctx.state;
    if (!st.obj('basket')) st.setObj('basket', { sandwich: 2, apple: 2, cookie: 2 });
    if (st.obj('plate') === undefined) st.setObj('plate', 2);
    if (st.obj('blanketApples') === undefined) st.setObj('blanketApples', 3);
    if (st.obj('cooler') === undefined) st.setObj('cooler', 2);
    if (st.obj('cooler2') === undefined) st.setObj('cooler2', { marshmallow: 2, corn: 1 });
  }

  syncFood(ctx: GameContext) {
    const s = ctx.state.obj<Record<string, number>>('basket') ?? {};
    for (const [id, objs] of Object.entries(this.basketItems)) objs.forEach((o, i) => (o.visible = i < (s[id] ?? 0)));
    const p = ctx.state.obj<number>('plate') ?? 0;
    this.plateItems.forEach((o, i) => (o.visible = i < p));
    const a = ctx.state.obj<number>('blanketApples') ?? 0;
    this.blanketItems.forEach((o, i) => (o.visible = i < a));
  }

  /** 朝になったら食べ物を補充 */
  restock(ctx: GameContext) {
    ctx.state.setObj('basket', { sandwich: 2, apple: 2, cookie: 2 });
    ctx.state.setObj('plate', 2);
    ctx.state.setObj('blanketApples', 3);
    ctx.state.setObj('cooler', 2);
    ctx.state.setObj('cooler2', { marshmallow: 2, corn: 1 });
    this.syncFood(ctx);
  }

  // ───────── 拾える物 ─────────
  private addPickup(id: string, itemId: string, p: P2, persist: boolean, activeFn?: (c: GameContext) => boolean, y?: number) {
    const o = itemObject(itemId, charMat);
    o.scale.setScalar(itemId === 'teddy_bear' ? 1.5 : 1.6);
    const yy = y ?? groundY(p[0], p[1]);
    o.position.set(p[0], yy, p[1]);
    o.rotation.y = Math.random() * 6;
    this.w.group.add(o);
    const pk: Pickup = { id, itemId, obj: o, x: p[0], y: yy, z: p[1], persist, vy: 0, sparkle: ITEMS[itemId]?.category === 'collectible' || itemId === 'teddy_bear', activeFn, taken: false };
    this.pickups.push(pk);
    if (pk.sparkle) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.sparkleTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
      s.scale.setScalar(0.5);
      s.userData.pk = pk;
      this.w.group.add(s);
      this.sparkles.push(s);
    }
    this.add(make({
      id: 'pick:' + id, type: 'pickup', position: { x: p[0], y: yy, z: p[1] }, markerY: 0.35, reach: 0.95, object: o,
      label: () => `${ITEMS[itemId].name}を ひろう`,
      active: (c) => !pk.taken && (!pk.activeFn || pk.activeFn(c)),
      interact: (c) => {
        const n = c.inv.add(itemId, 1, 'ground');
        if (!n) return { ok: false };
        pk.taken = true;
        if (persist) c.state.setObj('pick:' + id, this.litterRound(c, id));
        return { ok: true, anim: 'pickup', animTime: 0.55, noise: 0.5 };
      },
    }));
    return pk;
  }

  private litterRound(c: GameContext, id: string) {
    return id.startsWith('litter') ? c.state.obj<number>('litter_round') ?? 0 : true;
  }

  private buildPickups(ctx: GameContext) {
    L.shinyStones.forEach((p, i) => this.addPickup('stone' + i, 'shiny_stone', p, true));
    L.feathers.forEach((p, i) => this.addPickup('feather' + i, 'feather', p, true));
    L.pinecones.forEach((p, i) => this.addPickup('pine' + i, 'pinecone', p, true));
    L.litter.forEach((p, i) => this.addPickup('litter' + i, 'litter', p, true, (c) => c.quests.status('trash_job') === 'Active'));
    this.addPickup('teddy', 'teddy_bear', L.teddy, true, (c) => !c.state.flag('teddy_returned') && !c.inv.has('teddy_bear'));
    void ctx;
  }

  spawnLitter(ctx: GameContext) {
    const r = (ctx.state.obj<number>('litter_round') ?? 0) + 1;
    ctx.state.setObj('litter_round', r);
    for (const p of this.pickups) if (p.id.startsWith('litter')) p.taken = false;
  }

  /** 落ちてくるりんご（保存しない） */
  private dropApple(x: number, z: number) {
    const a = Math.random() * Math.PI * 2, d = 0.9 + Math.random() * 1.2;
    const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    const pk = this.addPickup('apple_drop' + this.appleSeq++, 'apple', [px, pz], false);
    pk.obj.position.y = height(px, pz) + 3.2;
    pk.vy = 0;
    pk.y = height(px, pz);
  }

  // ───────── その他 ─────────
  private buildMisc(ctx: GameContext) {
    // ゴミ箱
    L.trashCans.forEach((t, i) => {
      this.trashCool[i] = 0;
      this.add(make({
        id: 'trash' + i, type: 'container', position: { x: t[0], y: height(t[0], t[1]), z: t[1] }, markerY: 1.15, reach: 1.0,
        label: () => 'ゴミばこを あさる',
        interact: (c) => {
          if (this.trashCool[i] > 0) return { ok: false, message: 'もう なにも なさそう', anim: 'interact', animTime: 0.6 };
          this.trashCool[i] = 90;
          const r = Math.random();
          const id = r < 0.38 ? 'bottle_cap' : r < 0.62 ? 'cookie' : r < 0.72 ? 'old_coin' : r < 0.82 ? 'apple' : null;
          if (id) c.inv.add(id, 1, 'trash');
          else c.toast('からっぽ だった…');
          return { ok: true, anim: 'interact', animTime: 1.0, noise: 7 };
        },
      }));
    });
    // りんごの木
    const at = L.appleTree;
    this.add(make({
      id: 'appletree', type: 'container', position: { x: at[0], y: height(at[0], at[1]), z: at[1] }, markerY: 1.4, reach: 1.3,
      label: () => 'きを ゆらす',
      interact: (c) => {
        if (this.treeCool > 0) return { ok: false, message: 'りんごは もう おちてこない', anim: 'shake', animTime: 0.8 };
        this.treeCool = 120;
        setTimeout(() => { this.dropApple(at[0], at[1]); this.dropApple(at[0], at[1]); }, 450);
        return { ok: true, anim: 'shake', animTime: 1.2, noise: 6 };
      },
    }));
    // 物干しのキャンパーふく
    const la = L.laundry;
    const lx = la.a[0] + (la.b[0] - la.a[0]) * 0.5, lz = la.a[1] + (la.b[1] - la.a[1]) * 0.5;
    const lo = itemObject('camper_outfit', charMat);
    lo.position.set(lx, height(lx, lz) + 1.25, lz);
    lo.rotation.y = -Math.atan2(la.b[1] - la.a[1], la.b[0] - la.a[0]);
    lo.scale.setScalar(1.3);
    this.w.group.add(lo);
    this.laundryObj = lo;
    this.add(make({
      id: 'laundry', type: 'pickup', position: { x: lx, y: height(lx, lz), z: lz }, markerY: 1.9, reach: 1.1, object: lo,
      label: () => 'キャンパーふくを とる',
      active: (c) => !c.state.flag('laundry_taken'),
      interact: (c) => {
        c.state.setFlag('laundry_taken');
        c.inv.add('camper_outfit', 1, 'laundry');
        lo.visible = false;
        return { ok: true, anim: 'jump', animTime: 0.7, theftItem: 'camper_outfit', owner: ['camper'], noise: 2 };
      },
    }));
    // 案内板
    const sb = L.signboard.pos;
    this.add(make({ id: 'signboard', type: 'sign', position: { x: sb[0], y: height(sb[0], sb[1]), z: sb[1] + 0.3 }, markerY: 2.0, reach: 1.4, label: () => 'かんばんを よむ', interact: (c) => { c.openDialogue('sign'); return { ok: true, anim: 'interact', animTime: 0.5 }; } }));
    // たき火
    const cf = L.campfire.pos;
    this.add(make({
      id: 'campfire', type: 'station', position: { x: cf[0], y: height(cf[0], cf[1]), z: cf[1] }, markerY: 1.3, reach: 1.5,
      label: (c) => (cookable(c) ? `${ITEMS[cookable(c)!].name}を やく` : 'あたたまる'),
      interact: (c) => {
        const id = cookable(c);
        if (!id) { c.toast('ぽかぽか あったかい…'); return { ok: true, anim: 'sit', animTime: 1.6 }; }
        const to = ITEMS[id].cook!;
        c.inv.remove(id, 1, 'cook');
        setTimeout(() => { c.inv.add(to, 1, 'cook'); c.bus.emit('item:cooked', { from: id, to }); }, 1300);
        return { ok: true, anim: 'interact', animTime: 1.5 };
      },
    }));
    // つり場
    this.add(make({
      id: 'fishspot', type: 'station', position: { x: L.dock.x1 + 0.35, y: 0.42, z: L.dock.z }, markerY: 0.7, reach: 1.1,
      label: (c) => (c.inv.has('fishing_rod') ? 'つりを する' : 'みずうみを ながめる'),
      interact: (c) => {
        if (!c.inv.has('fishing_rod')) { c.toast('つりざおが あれば つりが できそう'); return { ok: true, anim: 'interact', animTime: 0.6 }; }
        c.startFishing();
        return { ok: true };
      },
    }));
    void ctx;
  }

  // ───────── レンジャー小屋 ─────────
  private buildCabin(ctx: GameContext) {
    const cb = L.cabin;
    const hingeX = cb.pos[0] - 0.6, dz = cb.pos[1] + cb.d / 2;
    const pivot = new THREE.Group();
    pivot.position.set(hingeX, 0.02, dz);
    const db = new GeoBuilder();
    db.box(1.18, 2.0, 0.08, (p) => new THREE.Color(Math.floor((p.x + 2) * 6) % 2 ? '#8a5b33' : '#7a4f2c'), { pos: [0.59, 1.0, 0] }, 0.02);
    db.sphere(0.04, '#d9b14a', { pos: [1.02, 1.0, 0.06] });
    db.box(0.4, 0.4, 0.02, '#a9d4e6', { pos: [0.59, 1.45, 0.045] }, 0.01);
    const dm = new THREE.Mesh(db.build(), propMat);
    dm.castShadow = true;
    pivot.add(dm);
    this.w.group.add(pivot);
    this.door = pivot;
    const dc = this.w.col.addBox('door', cb.pos[0], dz, 1.2, 0.16, 0, MASK_PLAYER, 2.0);
    this.add(make({
      id: 'door', type: 'door', position: { x: cb.pos[0], y: 0, z: dz }, markerY: 2.2, reach: 1.3,
      label: (c) => (c.state.flag('door_open') ? 'ドアを しめる' : 'ドアを あける'),
      interact: (c) => {
        c.state.setFlag('door_open', !c.state.flag('door_open'));
        dc.enabled = !c.state.flag('door_open');
        return { ok: true, anim: 'interact', animTime: 0.5, noise: 3 };
      },
    }));
    // ぼうしかけのレンジャーぼうし
    const hx = cb.pos[0] + cb.w / 2 - 0.32, hz = cb.pos[1] + 0.9;
    const ho = itemObject('ranger_hat', charMat);
    ho.position.set(hx, 1.55, hz);
    ho.rotation.set(0, 0, 0.5);
    this.w.group.add(ho);
    this.hatObj = ho;
    this.add(make({
      id: 'rangerhat', type: 'pickup', position: { x: hx - 0.25, y: 0, z: hz }, markerY: 1.95, reach: 1.0, object: ho,
      label: () => 'ぼうしを とる', active: (c) => !c.state.flag('rangerhat_taken'),
      interact: (c) => {
        c.state.setFlag('rangerhat_taken');
        c.inv.add('ranger_hat', 1, 'cabin');
        ho.visible = false;
        return { ok: true, anim: 'jump', animTime: 0.7, theftItem: 'ranger_hat', owner: ['ranger'], noise: 2 };
      },
    }));
    void ctx;
  }

  isDoorOpen(ctx: GameContext) { return ctx.state.flag('door_open'); }
  openDoorFor(ctx: GameContext) {
    if (!ctx.state.flag('door_open')) { ctx.state.setFlag('door_open', true); const d = this.w.col.get('door'); if (d) d.enabled = false; }
  }

  // ───────── ボート ─────────
  private buildBoat(ctx: GameContext) {
    const g = new THREE.Group();
    const b = new GeoBuilder();
    const hull = (p: THREE.Vector3) => new THREE.Color(p.y > 0.22 ? '#f4efe2' : p.y > 0.12 ? '#d24a3a' : '#e8e2d2');
    b.lathe([[0, -0.02], [0.42, 0.0], [0.5, 0.15], [0.52, 0.32], [0.0, 0.32]], hull, { scale: [1, 1, 2.3] }, 24);
    b.box(0.86, 0.05, 1.8, '#a06c3c', { pos: [0, 0.2, 0] }, 0.01);
    b.box(0.86, 0.05, 0.25, '#b98a57', { pos: [0, 0.3, -0.1] }, 0.02);
    b.box(0.6, 0.05, 0.22, '#b98a57', { pos: [0, 0.3, 0.75] }, 0.02);
    const hm = new THREE.Mesh(b.build(), propMat);
    hm.castShadow = true;
    g.add(hm);
    for (const s of [-1, 1]) {
      const ob = new GeoBuilder();
      ob.cyl(0.02, 0.02, 1.2, '#c99b57', { pos: [0, 0, 0.0], rot: [Math.PI / 2, 0, 0] }, 6);
      ob.box(0.02, 0.14, 0.3, '#c99b57', { pos: [0, 0, 0.6] }, 0.01);
      const oar = new THREE.Mesh(ob.build(), propMat);
      const piv = new THREE.Group();
      piv.position.set(s * 0.5, 0.36, -0.1);
      piv.add(oar);
      oar.position.set(s * 0.15, 0, 0);
      piv.rotation.set(0, s * 1.2, s * -0.3);
      g.add(piv);
      this.oars.push(piv);
    }
    g.position.set(L.boatHome[0], WATER_Y - 0.08, L.boatHome[1]);
    g.rotation.y = Math.PI / 2;
    this.w.group.add(g);
    this.boat = g;
    this.add(make({
      id: 'boat', type: 'vehicle', position: { x: g.position.x, y: 0.2, z: g.position.z }, markerY: 0.8, reach: 1.7,
      label: (c) => (c.player.inBoat ? 'ボートを おりる' : 'ボートに のる'),
      active: (c) => !c.player.inBoat || !!this.landingSpot(c.player.pos.x, c.player.pos.z),
      interact: (c) => {
        const p = c.player;
        if (!p.inBoat) {
          p.inBoat = true;
          p.sneaking = false;
          p.pos.set(g.position.x, WATER_Y + 0.15, g.position.z);
          p.facing = g.rotation.y;
          c.bus.emit('achievement', { id: 'boater' });
          return { ok: true };
        }
        const spot = this.landingSpot(p.pos.x, p.pos.z);
        if (!spot) return { ok: false, message: 'ちかくに りくが ない' };
        p.inBoat = false;
        p.pos.set(spot.x, groundY(spot.x, spot.z), spot.z);
        return { ok: true, anim: 'jump', animTime: 0.5 };
      },
    }));
    void ctx;
  }

  landingSpot(x: number, z: number): { x: number; z: number } | null {
    let best: { x: number; z: number } | null = null, bd = 99;
    for (let r = 0.8; r <= 2.4; r += 0.4)
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
        const ok = onDock(px, pz, -0.25) || lakeSdf(px, pz) > 0.5;
        if (ok && !this.w.col.blocked(px, pz, 0.25, MASK_PLAYER) && r < bd) { bd = r; best = { x: px, z: pz }; }
      }
    return best;
  }

  // ───────── おうち ─────────
  private buildHome(ctx: GameContext) {
    const d = L.den;
    const [ex, ez] = [d.pos[0] + Math.sin(d.rot) * 1.9, d.pos[1] + Math.cos(d.rot) * 1.9];
    this.add(make({ id: 'den', type: 'home', position: { x: ex, y: height(ex, ez), z: ez }, markerY: 1.6, reach: 1.4, label: () => 'おうちに はいる', interact: (c) => { c.openDialogue('den'); return { ok: true }; } }));
    // かざり（ショップで買うと現れる）
    const lan = new THREE.Group();
    const lb = new GeoBuilder();
    lb.cyl(0.03, 0.04, 1.4, '#5a3a24', { pos: [0, 0.7, 0] }, 6);
    lb.box(0.4, 0.04, 0.04, '#5a3a24', { pos: [0.18, 1.38, 0] }, 0.01);
    lb.box(0.2, 0.26, 0.2, '#33473c', { pos: [0.35, 1.18, 0] }, 0.03);
    lan.add(new THREE.Mesh(lb.build(), propMat));
    const gl = new GeoBuilder(); gl.box(0.15, 0.2, 0.15, '#ffd98a', { pos: [0.35, 1.18, 0] }, 0.02);
    lan.add(new THREE.Mesh(gl.build(), glowMat));
    const [lx, lz] = [d.pos[0] + Math.sin(d.rot + 0.7) * 1.9, d.pos[1] + Math.cos(d.rot + 0.7) * 1.9];
    lan.position.set(lx, height(lx, lz), lz);
    this.w.group.add(lan);
    this.homeObjs.lantern = lan;
    const gb = new GeoBuilder();
    const cols = ['#e2574c', '#f2c14e', '#4fa3d1', '#7bc35b', '#f08fb5'];
    for (let i = 0; i < 9; i++) {
      const a = -0.9 + (i / 8) * 1.8;
      const x = Math.sin(a) * 1.52, z = Math.cos(a) * 1.52;
      const y = 1.6 - Math.sin((i / 8) * Math.PI) * 0.3;
      gb.cone(0.08, 0.16, cols[i % 5], { pos: [x, y, z], rot: [Math.PI, 0, 0] }, 3);
    }
    const garland = new THREE.Mesh(gb.build(), propMat);
    garland.position.set(d.pos[0], height(d.pos[0], d.pos[1]), d.pos[1]);
    garland.rotation.y = d.rot;
    this.w.group.add(garland);
    this.homeObjs.garland = garland;
    const bed = new GeoBuilder();
    bed.box(0.9, 0.18, 0.6, '#f2e3c0', { pos: [0, 0.09, 0] }, 0.08);
    bed.sphere(1, '#e86f6f', { pos: [-0.28, 0.22, 0], scale: [0.16, 0.08, 0.2] });
    bed.box(0.6, 0.06, 0.62, '#4fa3d1', { pos: [0.12, 0.2, 0] }, 0.03);
    const bm = new THREE.Mesh(bed.build(), propMat);
    const [bx2, bz2] = [d.pos[0] + Math.sin(d.rot - 0.75) * 2.0, d.pos[1] + Math.cos(d.rot - 0.75) * 2.0];
    bm.position.set(bx2, height(bx2, bz2), bz2);
    bm.rotation.y = d.rot + 0.3;
    bm.castShadow = true;
    this.w.group.add(bm);
    this.homeObjs.bed = bm;
    void ctx;
  }

  // ───────── 宝 ─────────
  private buildTreasure(ctx: GameContext) {
    const [x, z] = L.treasure;
    const g = new THREE.Group();
    const b = new GeoBuilder();
    b.sphere(1, '#8a6038', { pos: [0, 0, 0], scale: [0.55, 0.16, 0.5] }, 16, 8);
    b.box(0.5, 0.04, 0.09, '#d8453b', { pos: [0, 0.14, 0], rot: [0, 0.75, 0] }, 0.01);
    b.box(0.5, 0.04, 0.09, '#d8453b', { pos: [0, 0.14, 0], rot: [0, -0.75, 0] }, 0.01);
    g.add(new THREE.Mesh(b.build(), propMat));
    const cb = new GeoBuilder();
    cb.box(0.5, 0.3, 0.34, '#8a5a32', { pos: [0, 0.15, 0] }, 0.04);
    cb.box(0.52, 0.12, 0.36, '#a06c3c', { pos: [0, 0.34, 0] }, 0.05);
    cb.box(0.08, 0.1, 0.02, '#e8c13a', { pos: [0, 0.25, 0.18] }, 0.01);
    for (const s of [-1, 1]) cb.box(0.04, 0.42, 0.37, '#e8c13a', { pos: [s * 0.2, 0.2, 0] }, 0.01);
    const chest = new THREE.Mesh(cb.build(), propMat);
    chest.visible = false;
    chest.castShadow = true;
    g.add(chest);
    this.chest = chest;
    g.position.set(x, height(x, z), z);
    this.w.group.add(g);
    this.digObj = g;
    this.add(make({
      id: 'treasure', type: 'hidden', position: { x, y: height(x, z), z }, markerY: 0.6, reach: 1.2,
      label: () => 'ほる',
      active: (c) => c.inv.has('treasure_map') && !c.state.flag('treasure_dug'),
      interact: (c) => {
        c.state.setFlag('treasure_dug');
        this.chestT = 0;
        setTimeout(() => { c.inv.add('golden_acorn', 1, 'treasure'); c.inv.add('old_coin', 2, 'treasure'); }, 2300);
        return { ok: true, anim: 'dig', animTime: 2.2, noise: 4 };
      },
    }));
    void ctx;
  }

  // ───────── 状態の反映・毎フレーム ─────────
  syncAll(ctx: GameContext) {
    this.defaults(ctx);
    this.syncFood(ctx);
    for (const p of this.pickups) {
      if (!p.persist) continue;
      const v = ctx.state.obj('pick:' + p.id);
      p.taken = p.id.startsWith('litter') ? v === (ctx.state.obj<number>('litter_round') ?? 0) : !!v;
    }
    this.laundryObj.visible = !ctx.state.flag('laundry_taken');
    this.hatObj.visible = !ctx.state.flag('rangerhat_taken');
    const d = this.w.col.get('door');
    if (d) d.enabled = !ctx.state.flag('door_open');
    this.doorAngle = ctx.state.flag('door_open') ? -1.6 : 0;
    this.door.rotation.y = this.doorAngle;
    if (ctx.state.flag('treasure_dug')) { this.chest.visible = true; this.chest.position.y = 0.05; this.chestT = 99; }
  }

  update(dt: number, t: number, ctx: GameContext) {
    for (let i = 0; i < this.trashCool.length; i++) this.trashCool[i] = Math.max(0, this.trashCool[i] - dt);
    this.treeCool = Math.max(0, this.treeCool - dt);
    // ドア
    const target = ctx.state.flag('door_open') ? -1.6 : 0;
    this.door.rotation.y = THREE.MathUtils.lerp(this.door.rotation.y, target, Math.min(1, dt * 6));
    // 拾える物：ゆらゆら・きらきら、落下
    for (const p of this.pickups) {
      const vis = !p.taken && (!p.activeFn || p.activeFn(ctx));
      p.obj.visible = vis;
      if (!vis) continue;
      if (p.obj.position.y > p.y + 0.001 || p.vy !== 0) {
        p.vy -= 18 * dt;
        p.obj.position.y += p.vy * dt;
        if (p.obj.position.y <= p.y) { p.obj.position.y = p.y; p.vy = p.vy < -2 ? -p.vy * 0.3 : 0; }
      } else if (p.sparkle) {
        p.obj.position.y = p.y + 0.06 + Math.sin(t * 2.5 + p.x) * 0.04;
        p.obj.rotation.y += dt * 1.2;
      }
    }
    for (const s of this.sparkles) {
      const pk = s.userData.pk as Pickup;
      s.visible = pk.obj.visible;
      if (!s.visible) continue;
      s.position.set(pk.x, pk.y + 0.3 + Math.sin(t * 3 + pk.x) * 0.05, pk.z);
      const k = 0.5 + Math.sin(t * 4 + pk.z * 3) * 0.5;
      s.scale.setScalar(0.25 + k * 0.35);
      (s.material as THREE.SpriteMaterial).rotation = t * 0.8;
    }
    // ボート
    const p = ctx.player;
    if (p.inBoat) {
      this.boat.position.set(p.pos.x, WATER_Y - 0.08 + Math.sin(t * 2) * 0.02, p.pos.z);
      this.boat.rotation.y = p.facing;
      this.boat.rotation.z = Math.sin(t * 1.7) * 0.03;
      const row = p.speed > 0.3 ? t * 6 : t * 1.5;
      this.oars.forEach((o, i) => { const s = i ? 1 : -1; o.rotation.set(Math.sin(row) * 0.25, s * (1.2 + Math.sin(row) * 0.5), s * (-0.3 + Math.cos(row) * 0.15)); });
    } else {
      this.boat.position.y = WATER_Y - 0.08 + Math.sin(t * 1.5) * 0.02;
      this.boat.rotation.z = Math.sin(t * 1.3) * 0.02;
    }
    const bi = this.w.interactables.find((i) => i.id === 'boat')!;
    bi.position.x = this.boat.position.x; bi.position.z = this.boat.position.z;
    // 宝箱
    if (this.chestT >= 0 && this.chestT < 3) {
      this.chestT += dt;
      if (this.chestT > 1.9) { this.chest.visible = true; this.chest.position.y = Math.min(0.05, -0.4 + (this.chestT - 1.9) * 1.5); }
    }
    this.digObj.children[0].visible = !ctx.state.flag('treasure_dug') && ctx.inv.has('treasure_map');
    // おうちのかざり
    this.homeObjs.lantern.visible = ctx.state.flag('home_lantern');
    this.homeObjs.garland.visible = ctx.state.flag('home_garland');
    this.homeObjs.bed.visible = ctx.state.flag('home_bed');
    // バスケットが空のまましばらくたつと補充
    if (total(ctx.state.obj('basket')) === 0) {
      this.basketEmptyT += dt;
      if (this.basketEmptyT > 150) {
        this.basketEmptyT = 0;
        ctx.state.setObj('basket', { sandwich: 1, apple: 2, cookie: 1 });
        this.syncFood(ctx);
        const mom = ctx.npcs.find((n) => n.id === 'mom');
        if (mom) ctx.say(mom, 'ごはんを たしておきましょ', 3);
      }
    } else this.basketEmptyT = 0;
  }
}

function total(o: unknown) {
  if (!o || typeof o !== 'object') return 0;
  return Object.values(o as Record<string, number>).reduce((a, b) => a + b, 0);
}

function cookable(c: GameContext): string | null {
  const order = ['marshmallow', 'corn', 'big_fish', 'fish'];
  return order.find((id) => c.inv.has(id)) ?? null;
}

function makeSparkle() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30);
  gr.addColorStop(0, 'rgba(255,255,230,1)');
  gr.addColorStop(0.2, 'rgba(255,240,170,0.6)');
  gr.addColorStop(1, 'rgba(255,240,170,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(255,255,240,0.95)';
  g.beginPath(); g.moveTo(32, 2); g.lineTo(35, 29); g.lineTo(62, 32); g.lineTo(35, 35); g.lineTo(32, 62); g.lineTo(29, 35); g.lineTo(2, 32); g.lineTo(29, 29); g.fill();
  const t = new THREE.CanvasTexture(c);
  return t;
}
