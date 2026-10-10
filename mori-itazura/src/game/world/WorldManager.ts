// ワールドの組み立て：地面・湖・植物・建物・小物を配置し、当たり判定と隠れ場所を登録する。
// 静的な背景は区画ごとに 1 つのジオメトリへ結合して描画呼び出しを減らす。
import * as THREE from 'three';
import { CAMPSITE as L, P2 } from '../content/areas/campsite';
import { CollisionSystem, MASK_ALL, MASK_NPC, MASK_PLAYER } from './CollisionSystem';
import { height, groundColor, pathFactor, lakeSdf, WATER_Y, fbm } from './Terrain';
import { GeoBuilder, rand } from '../render/Geo';
import * as P from '../render/Props';
import { worldMat, propMat, glowMat, shared, makeGrassDetailTexture } from '../render/Materials';
import { buildWater } from '../render/Water';
import type { Interactable } from '../entities/Interactable';

type MatKind = 'world' | 'prop' | 'glow';
interface Placed { geo: THREE.BufferGeometry; m: THREE.Matrix4; kind: MatKind; shadow: boolean }

export interface HideSpot { id: string; x: number; z: number; r: number; kind: 'bush' | 'table'; obj?: THREE.Object3D; rustle: number }

const CHUNK = 12;

export class WorldManager {
  readonly group = new THREE.Group();
  readonly col: CollisionSystem;
  readonly hideSpots: HideSpot[] = [];
  readonly interactables: Interactable[] = [];
  private placed: Placed[] = [];
  private treePts: { x: number; z: number; r: number }[] = [];
  private keepOut: { x: number; z: number; r: number }[] = [];
  water!: ReturnType<typeof buildWater>;
  fire!: THREE.Group;
  fireLight!: THREE.PointLight;
  lampLight!: THREE.PointLight;
  cabinRoof!: THREE.Mesh;
  private roofFade = 1;
  private flames: THREE.Mesh[] = [];
  private embers!: THREE.Points;
  private smoke: THREE.Sprite[] = [];
  readonly anim: ((dt: number, t: number) => void)[] = [];
  readonly signs: THREE.Mesh[] = [];

  constructor() {
    this.col = new CollisionSystem(L.radius);
  }

  // ───────── 配置ヘルパー ─────────
  place(b: GeoBuilder | THREE.BufferGeometry, x: number, z: number, rot = 0, s = 1, kind: MatKind = 'world', shadow = true, y?: number) {
    const geo = b instanceof GeoBuilder ? b.build() : b;
    const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y ?? height(x, z), z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rot, 0)), new THREE.Vector3(s, s, s));
    this.placed.push({ geo, m, kind, shadow });
  }
  /** 単独のメッシュとして置く（動かすもの・消すもの） */
  mesh(b: GeoBuilder, x: number, z: number, rot = 0, mat: THREE.Material = propMat, y?: number) {
    const m = new THREE.Mesh(b.build(), mat);
    m.position.set(x, y ?? height(x, z), z);
    m.rotation.y = rot;
    m.castShadow = true;
    m.receiveShadow = true;
    this.group.add(m);
    return m;
  }
  private avoid(x: number, z: number, r: number) { this.keepOut.push({ x, z, r }); }
  private free(x: number, z: number, r: number, path = 1.5) {
    if (pathFactor(x, z) < path) return false;
    if (lakeSdf(x, z) < 1.2 + r) return false;
    for (const k of this.keepOut) if (Math.hypot(x - k.x, z - k.z) < k.r + r) return false;
    return true;
  }
  private local(x: number, z: number, rot: number, lx: number, lz: number): P2 {
    const c = Math.cos(rot), s = Math.sin(rot);
    return [x + lx * c + lz * s, z - lx * s + lz * c];
  }

  build(scene: THREE.Scene) {
    scene.add(this.group);
    this.buildStructures();
    this.buildVegetation();
    this.buildGround();
    this.buildWaterAndShore();
    this.buildGrass();
    this.flushChunks();
  }

  // ───────── 建物・小物 ─────────
  private buildStructures() {
    const col = this.col;
    // おうち（主人公の巣）
    const den = L.den;
    this.place(P.denHouse(), den.pos[0], den.pos[1], den.rot);
    col.addCircle('den', den.pos[0], den.pos[1], 1.55, MASK_ALL, 2.0);
    this.avoid(den.pos[0], den.pos[1], 3.2);
    {
      const [mx, mz] = this.local(den.pos[0], den.pos[1], den.rot, 1.3, 1.9);
      col.addCircle('den_post', mx, mz, 0.2);
    }

    // ピクニック広場
    const t1 = L.picnic.table1, t2 = L.picnic.table2;
    this.place(P.picnicTable(true), t1.pos[0], t1.pos[1], t1.rot, 1, 'prop');
    this.place(P.picnicTable(false), t2.pos[0], t2.pos[1], t2.rot, 1, 'prop');
    for (const [id, t] of [['table1', t1], ['table2', t2]] as const) {
      // 人間は通れないが、小さな主人公はテーブルの下にもぐれる（脚だけ当たる）
      col.addBox(id, t.pos[0], t.pos[1], 2.1, 1.75, t.rot, MASK_NPC, 0);
      for (const sx of [-0.75, 0.75]) for (const sz of [-0.6, 0.6]) {
        const [lx, lz] = this.local(t.pos[0], t.pos[1], t.rot, sx, sz);
        col.addCircle(id + 'leg', lx, lz, 0.07, MASK_PLAYER);
      }
      this.hideSpots.push({ id: id + '_under', x: t.pos[0], z: t.pos[1], r: 0.55, kind: 'table', rustle: 0 });
      this.avoid(t.pos[0], t.pos[1], 2.4);
    }
    this.place(P.blanket(), L.picnic.blanket.pos[0], L.picnic.blanket.pos[1], L.picnic.blanket.rot, 1, 'prop', false);
    this.avoid(L.picnic.blanket.pos[0], L.picnic.blanket.pos[1], 1.6);
    this.place(P.cooler(), L.picnic.cooler[0], L.picnic.cooler[1], 0.3, 1, 'prop');
    col.addBox('cooler', L.picnic.cooler[0], L.picnic.cooler[1], 0.64, 0.42, 0.3);
    this.place(P.parasol(), L.picnic.parasol[0], L.picnic.parasol[1], 0, 1, 'world');
    col.addCircle('parasol', L.picnic.parasol[0], L.picnic.parasol[1], 0.12);

    // 売店
    const sh = L.shop;
    this.place(P.kiosk(), sh.pos[0], sh.pos[1], sh.rot);
    col.addBox('shop', sh.pos[0], sh.pos[1], 3.4, 2.6, sh.rot, MASK_ALL, 2.6);
    {
      const [ix, iz] = this.local(sh.pos[0], sh.pos[1], sh.rot, 2.35, 0.8);
      col.addBox('shop_ice', ix, iz, 1.0, 0.6, sh.rot);
      const [bx, bz] = this.local(sh.pos[0], sh.pos[1], sh.rot, -2.4, 0.9);
      this.place(P.barrel(), bx, bz, 0.4);
      col.addCircle('shop_barrel', bx, bz, 0.32);
      const [cx, cz] = this.local(sh.pos[0], sh.pos[1], sh.rot, -2.3, -0.4);
      this.place(P.crate(), cx, cz, 0.2); this.place(P.crate(), cx, cz, 0.6, 1, 'world', true, height(cx, cz) + 0.5);
      col.addBox('shop_crate', cx, cz, 0.62, 0.52, 0.2);
      for (const [fx, fz, c] of [[-1.2, 1.9, '#f08fb5'], [1.2, 1.9, '#f2c14e']] as const) {
        const [px, pz] = this.local(sh.pos[0], sh.pos[1], sh.rot, fx, fz);
        this.place(P.flowerPot(c), px, pz, 0, 1, 'prop');
        col.addCircle('pot', px, pz, 0.18);
      }
    }
    this.avoid(sh.pos[0], sh.pos[1], 3.4);
    this.sign('ばいてん', 1.6, 0.42, '#5f9c8a', ...this.local(sh.pos[0], sh.pos[1], sh.rot, 0, 1.36), 2.95, sh.rot);

    // 入口のゲートと柵
    const g = L.gate.pos;
    this.place(P.gateArch(), g[0], g[1], 0);
    col.addCircle('gateL', g[0] - 2.4, g[1], 0.3, MASK_ALL, 3);
    col.addCircle('gateR', g[0] + 2.4, g[1], 0.3, MASK_ALL, 3);
    this.sign('もりの キャンプじょう', 3.3, 0.66, '#7f5230', g[0], g[1] + 0.18, 2.95, 0);
    for (const [x0, x1] of [[-22, -2.9], [2.9, 5.2], [18, 28]] as const) {
      const n = Math.ceil((x1 - x0) / 3.2);
      for (let i = 0; i < n; i++) {
        const xa = x0 + (i / n) * (x1 - x0), xb = x0 + ((i + 1) / n) * (x1 - x0);
        const zz = g[1] + Math.sin(xa * 0.2) * 0.3;
        this.place(P.fenceSegment(xb - xa), (xa + xb) / 2, zz, 0, 1, 'prop');
        col.addBox('fence', (xa + xb) / 2, zz, xb - xa, 0.2, 0, MASK_ALL, 0.85);
      }
    }
    // 駐車場の車
    this.place(P.car('#3aa7b8'), L.car.pos[0], L.car.pos[1], L.car.rot, 1, 'world');
    col.addBox('car', L.car.pos[0], L.car.pos[1], 1.8, 3.9, L.car.rot, MASK_ALL, 1.6);
    this.place(P.camperVan(), 14.4, 31.6, Math.PI / 2 + 0.1, 1, 'world');
    col.addBox('van', 14.4, 31.6, 2.1, 4.7, Math.PI / 2 + 0.1, MASK_ALL, 2.4);
    this.avoid(11.5, 33, 6);

    // 案内板
    const sb = L.signboard;
    this.place(P.signboard(), sb.pos[0], sb.pos[1], sb.rot, 1, 'world');
    col.addBox('signboard', sb.pos[0], sb.pos[1], 1.6, 0.25, sb.rot, MASK_ALL, 1.6);
    this.mapSign(sb.pos[0], sb.pos[1] + 0.05, 1.15, sb.rot);
    this.avoid(sb.pos[0], sb.pos[1], 1.4);

    // キャンプファイヤー
    const cf = L.campfire.pos;
    this.place(P.campfireRing(), cf[0], cf[1], 0, 1, 'prop');
    col.addCircle('campfire', cf[0], cf[1], 0.78, MASK_ALL, 0);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4 + 0.1;
      const x = cf[0] + Math.cos(a) * 2.25, z = cf[1] + Math.sin(a) * 2.25;
      this.place(P.logSeat(1.6), x, z, -a + Math.PI / 2, 1, 'prop');
      col.addBox('log', x, z, 1.6, 0.42, -a + Math.PI / 2, MASK_PLAYER, 0.4);
    }
    // ストリングライト（電球の飾り）
    const posts: P2[] = [];
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; posts.push([cf[0] + Math.cos(a) * 4.4, cf[1] + Math.sin(a) * 4.4]); }
    const bulbs = new GeoBuilder();
    const wires = new GeoBuilder();
    posts.forEach((p, i) => {
      this.place(P.stringLightPost(2.7), p[0], p[1], 0, 1, 'world');
      col.addCircle('slpost', p[0], p[1], 0.08);
      const q = posts[(i + 1) % posts.length];
      const ya = height(p[0], p[1]) + 2.6, yb = height(q[0], q[1]) + 2.6;
      const n = 9;
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        const x = p[0] + (q[0] - p[0]) * t, z = p[1] + (q[1] - p[1]) * t;
        const y = ya + (yb - ya) * t - Math.sin(t * Math.PI) * 0.45;
        if (k > 0 && k < n) bulbs.sphere(0.06, k % 3 === 0 ? '#ffd48a' : k % 3 === 1 ? '#fff2c4' : '#ffb870', { pos: [x, y - 0.06, z] }, 8, 6);
        if (k < n) {
          const t2 = (k + 1) / n;
          const x2 = p[0] + (q[0] - p[0]) * t2, z2 = p[1] + (q[1] - p[1]) * t2;
          const y2 = ya + (yb - ya) * t2 - Math.sin(t2 * Math.PI) * 0.45;
          const len = Math.hypot(x2 - x, y2 - y, z2 - z);
          const mid = new THREE.Vector3((x + x2) / 2, (y + y2) / 2, (z + z2) / 2);
          const dir = new THREE.Vector3(x2 - x, y2 - y, z2 - z).normalize();
          const q4 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          const e = new THREE.Euler().setFromQuaternion(q4, 'YXZ');
          wires.cyl(0.008, 0.008, len, '#3a3a3a', { pos: [mid.x, mid.y, mid.z], rot: [e.x, e.y, e.z] }, 4);
        }
      }
    });
    this.place(bulbs, 0, 0, 0, 1, 'glow', false, 0);
    this.place(wires, 0, 0, 0, 1, 'prop', false, 0);
    this.avoid(cf[0], cf[1], 5.2);
    this.buildFire(cf[0], cf[1]);

    // テント
    for (const t of L.tents) {
      const b = t.kind === 'cabin' ? P.cabinTent() : t.kind === 'dome' ? P.domeTent() : P.teepee();
      this.place(b, t.pos[0], t.pos[1], t.rot);
      if (t.kind === 'cabin') col.addBox('tent', t.pos[0], t.pos[1], 2.5, 3.0, t.rot, MASK_ALL, 1.9);
      else col.addCircle('tent', t.pos[0], t.pos[1], t.kind === 'dome' ? 1.35 : 1.15, MASK_ALL, 1.6);
      this.avoid(t.pos[0], t.pos[1], 2.6);
    }
    // 薪とかまど周りの小物
    this.place(P.firewood(), -5.5, -6.0, 0.5, 1, 'prop');
    col.addBox('wood', -5.5, -6.0, 0.9, 0.85, 0.5, MASK_ALL, 0.5);
    this.place(P.cooler(), 1.6, -11.2, -0.3, 1, 'prop');
    col.addBox('cooler2', 1.6, -11.2, 0.64, 0.42, -0.3);
    // 物干し
    const la = L.laundry;
    const mx = (la.a[0] + la.b[0]) / 2, mz = (la.a[1] + la.b[1]) / 2;
    const ang = -Math.atan2(la.b[1] - la.a[1], la.b[0] - la.a[0]);
    this.place(P.laundryPoles(la.a, la.b), mx, mz, ang);
    col.addCircle('lpole', la.a[0], la.a[1], 0.08); col.addCircle('lpole', la.b[0], la.b[1], 0.08);
    this.avoid(mx, mz, 2.4);

    // レンジャー小屋（屋根は中に入ると透ける）
    const cb = L.cabin;
    this.place(P.cabinWalls(cb.w, cb.d), cb.pos[0], cb.pos[1], 0, 1, 'world', true, 0.02);
    this.cabinRoof = new THREE.Mesh(P.cabinRoof(cb.w, cb.d).build(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, transparent: true }));
    this.cabinRoof.position.set(cb.pos[0], 0.02, cb.pos[1]);
    this.cabinRoof.castShadow = true; this.cabinRoof.receiveShadow = true;
    this.group.add(this.cabinRoof);
    {
      const x = cb.pos[0], z = cb.pos[1], W = cb.w, D = cb.d, T = 0.3;
      col.addBox('cabinN', x, z - D / 2, W + 0.3, T, 0, MASK_ALL, 3);
      col.addBox('cabinW', x - W / 2, z, T, D + 0.3, 0, MASK_ALL, 3);
      col.addBox('cabinE', x + W / 2, z, T, D + 0.3, 0, MASK_ALL, 3);
      col.addBox('cabinS1', x - (W / 2 + 0.6) / 2, z + D / 2, W / 2 - 0.6, T, 0, MASK_ALL, 3);
      col.addBox('cabinS2', x + (W / 2 + 0.6) / 2, z + D / 2, W / 2 - 0.6, T, 0, MASK_ALL, 3);
      col.addBox('desk', x + 1.4, z - D / 2 + 0.9, 1.3, 0.7, 0, MASK_PLAYER, 0.9);
      col.addBox('shelf', x - 1.6, z - D / 2 + 0.35, 1.8, 0.45, 0, MASK_ALL, 2);
      col.addBox('chimney', x + W / 2 - 0.9, z - D / 2 + 0.6, 0.75, 0.75, 0, MASK_ALL, 3);
      for (const px of [-W * 0.3 + 0.1, W * 0.3 - 0.1]) col.addCircle('porchpost', x + px, z + D / 2 + 1.5, 0.1);
      this.avoid(x, z + 0.5, 5.6);
      this.place(P.firewood(), x - W / 2 - 0.7, z + 0.5, Math.PI / 2, 1, 'prop');
      col.addBox('wood2', x - W / 2 - 0.7, z + 0.5, 0.9, 0.85, Math.PI / 2, MASK_ALL, 0.5);
      this.place(P.barrel(), x + W / 2 + 0.6, z + 1.6, 0);
      col.addCircle('barrel', x + W / 2 + 0.6, z + 1.6, 0.32, MASK_ALL, 0.7);
      this.place(P.crate(), x + W / 2 + 0.6, z + 0.7, 0.3);
      col.addBox('crate', x + W / 2 + 0.6, z + 0.7, 0.6, 0.5, 0.3, MASK_ALL, 0.5);
      this.sign('レンジャーごや', 1.5, 0.36, '#6f7f45', x, z + D / 2 + 0.16, 2.25, 0);
    }

    // 桟橋
    const dk = L.dock;
    this.place(P.dock(), dk.x0, dk.z, 0, 1, 'prop', true, 0);
    this.avoid((dk.x0 + dk.x1) / 2, dk.z, 4);
    // ベンチ・ゴミ箱・街灯
    for (const b of L.benches) {
      this.place(P.bench(), b.pos[0], b.pos[1], b.rot, 1, 'prop');
      col.addBox('bench', b.pos[0], b.pos[1], 1.7, 0.6, b.rot, MASK_NPC, 0.5);
      this.avoid(b.pos[0], b.pos[1], 1.3);
    }
    L.trashCans.forEach((t, i) => {
      this.place(P.trashCan(), t[0], t[1], 0, 1, 'prop');
      col.addCircle('trash' + i, t[0], t[1], 0.33, MASK_ALL, 0.9);
      this.avoid(t[0], t[1], 0.9);
    });
    const glow = new GeoBuilder();
    for (const lp of L.lampPosts) {
      this.place(P.lampPost(), lp[0], lp[1], 0, 1, 'world');
      col.addCircle('lamp', lp[0], lp[1], 0.12);
      glow.cyl(0.11, 0.1, 0.32, '#ffd98a', { pos: [lp[0], height(lp[0], lp[1]) + 2.76, lp[1]] }, 8);
      this.avoid(lp[0], lp[1], 0.6);
    }
    this.place(glow, 0, 0, 0, 1, 'glow', false, 0);
    // 道しるべ
    for (const [x, z, r, text] of [[2.2, 5.2, -0.5, 'レンジャーごや →'], [-3.4, 7.2, 0.3, '← ピクニック'], [-4.5, -4.0, 0.2, '← みずうみ'], [-24.2, 21.0, 0.6, 'コロの おうち']] as const) {
      this.place(P.woodSign(1.1), x, z, r, 1, 'prop');
      col.addCircle('wsign', x, z, 0.08);
      this.sign(text, 1.05, 0.26, '#d39a5c', x + Math.sin(r) * 0.075, z + Math.cos(r) * 0.075, 1.05, r, '#4a2a18');
    }
  }

  /** 木の看板の文字（キャンバスに描いた板） */
  sign(text: string, w: number, h: number, bg: string, x: number, z: number, y: number, rot: number, fg = '#fff8e6') {
    const c = document.createElement('canvas');
    const px = 96;
    c.width = Math.round(w * px * 2); c.height = Math.round(h * px * 2);
    const g = c.getContext('2d')!;
    g.fillStyle = bg;
    g.fillRect(0, 0, c.width, c.height);
    g.globalAlpha = 0.12;
    for (let i = 0; i < c.height; i += 6) { g.fillStyle = i % 12 ? '#000' : '#fff'; g.fillRect(0, i, c.width, 2); }
    g.globalAlpha = 1;
    g.fillStyle = fg;
    g.font = `900 ${Math.round(c.height * 0.58)}px "Hiragino Maru Gothic ProN","Yu Gothic",sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    let fs = Math.round(c.height * 0.58);
    while (g.measureText(text).width > c.width * 0.9 && fs > 10) { fs -= 2; g.font = `900 ${fs}px "Hiragino Maru Gothic ProN","Yu Gothic",sans-serif`; }
    g.fillText(text, c.width / 2, c.height / 2 + 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }));
    m.position.set(x, height(x, z) + y, z);
    m.rotation.y = rot;
    m.receiveShadow = true;
    this.group.add(m);
    this.signs.push(m);
    return m;
  }

  /** 案内板の地図 */
  private mapSign(x: number, z: number, y: number, rot: number) {
    const c = document.createElement('canvas');
    c.width = 384; c.height = 240;
    const g = c.getContext('2d')!;
    g.fillStyle = '#e9dcb8'; g.fillRect(0, 0, 384, 240);
    const S = 2.6, ox = 192, oz = 120;
    g.fillStyle = '#9cc46a';
    g.beginPath(); g.arc(ox, oz, 40 * S, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#5fbcc8';
    g.beginPath(); g.ellipse(ox + L.lake.c[0] * S, oz + L.lake.c[1] * S, L.lake.rx * S, L.lake.rz * S, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#c99a62'; g.lineCap = 'round';
    for (const p of L.paths) {
      g.lineWidth = p.w * S * 0.8;
      g.beginPath(); p.pts.forEach((q, i) => (i ? g.lineTo : g.moveTo).call(g, ox + q[0] * S, oz + q[1] * S)); g.stroke();
    }
    g.fillStyle = '#9b4a35'; g.fillRect(ox + (L.cabin.pos[0] - 3) * S, oz + (L.cabin.pos[1] - 2.5) * S, 6 * S, 5 * S);
    g.fillStyle = '#e2574c'; g.fillRect(ox + (L.shop.pos[0] - 1.3) * S, oz + (L.shop.pos[1] - 1.6) * S, 2.6 * S, 3.2 * S);
    g.fillStyle = '#f2a93b'; g.beginPath(); g.arc(ox + L.campfire.pos[0] * S, oz + L.campfire.pos[1] * S, 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#d8453b'; g.beginPath(); g.arc(ox + 2.2 * S, oz + 10.5 * S, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.font = '900 13px sans-serif'; g.fillText('いまここ', ox + 2.2 * S + 9, oz + 10.5 * S + 5);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.88), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }));
    m.position.set(x, height(x, z) + y, z);
    m.rotation.y = rot;
    this.group.add(m);
  }

  // ───────── たき火 ─────────
  private buildFire(x: number, z: number) {
    const g = new THREE.Group();
    g.position.set(x, height(x, z) + 0.12, z);
    const mk = (r: number, h: number, col: string, op: number) => {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 10, 1, true).translate(0, h / 2, 0), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      g.add(m);
      this.flames.push(m);
      return m;
    };
    mk(0.36, 0.95, '#ff6a1f', 0.85);
    const a = mk(0.22, 0.8, '#ffb02e', 0.9); a.position.set(0.1, 0, 0.05);
    const b = mk(0.2, 0.65, '#ffb02e', 0.9); b.position.set(-0.12, 0, -0.04);
    mk(0.12, 0.55, '#fff2b0', 1);
    this.fireLight = new THREE.PointLight('#ff9a4a', 4, 12, 1.6);
    this.fireLight.position.set(0, 0.9, 0);
    g.add(this.fireLight);
    // 火の粉
    const n = 40;
    const pos = new Float32Array(n * 3);
    const seeds = new Float32Array(n);
    for (let i = 0; i < n; i++) seeds[i] = Math.random();
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.embers = new THREE.Points(pg, new THREE.PointsMaterial({ color: '#ffb347', size: 0.06, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    g.add(this.embers);
    // 煙
    const sc = document.createElement('canvas'); sc.width = sc.height = 64;
    const sg = sc.getContext('2d')!;
    const gr = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(230,230,230,0.5)'); gr.addColorStop(1, 'rgba(230,230,230,0)');
    sg.fillStyle = gr; sg.fillRect(0, 0, 64, 64);
    const stex = new THREE.CanvasTexture(sc);
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: stex, transparent: true, depthWrite: false, opacity: 0.4 }));
      s.userData.t = i / 6;
      g.add(s);
      this.smoke.push(s);
    }
    this.group.add(g);
    this.fire = g;
    this.anim.push((dt, t) => {
      this.flames.forEach((f, i) => {
        const k = 1 + Math.sin(t * (9 + i * 3) + i) * 0.12 + Math.sin(t * (17 + i * 5)) * 0.06;
        f.scale.set(1 + Math.sin(t * 7 + i) * 0.08, k, 1 + Math.cos(t * 6 + i) * 0.08);
        f.rotation.y = t * (0.5 + i * 0.3);
      });
      const p = this.embers.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < n; i++) {
        const life = (t * 0.45 + seeds[i]) % 1;
        p.setXYZ(i, Math.sin(seeds[i] * 40 + t) * 0.25 * life, life * 2.4, Math.cos(seeds[i] * 30 + t * 0.7) * 0.25 * life);
      }
      p.needsUpdate = true;
      for (const s of this.smoke) {
        const life = (t * 0.12 + s.userData.t) % 1;
        s.position.set(Math.sin(life * 4 + s.userData.t * 9) * 0.3, 1.0 + life * 3.2, Math.cos(life * 3) * 0.2);
        s.scale.setScalar(0.5 + life * 1.6);
        (s.material as THREE.SpriteMaterial).opacity = 0.35 * Math.sin(life * Math.PI);
      }
      this.fireLight.intensity = this.fireLightBase * (0.85 + Math.sin(t * 13) * 0.08 + Math.sin(t * 29) * 0.06);
    });
  }
  fireLightBase = 4;

  // ───────── 植物・岩 ─────────
  private buildVegetation() {
    const r = rand(42);
    const col = this.col;
    // 隠れられる茂み（揺らせるように個別メッシュ）
    L.hideBushes.forEach((h, i) => {
      const b = P.bush(500 + i, 1.25, i % 3 === 0 ? '#f5b4c8' : i % 3 === 1 ? '#fff6e0' : undefined);
      const m = this.mesh(b, h[0], h[1], r() * 6, worldMat);
      m.customDepthMaterial = undefined;
      this.hideSpots.push({ id: 'bush' + i, x: h[0], z: h[1], r: 0.85, kind: 'bush', obj: m, rustle: 0 });
      col.addCircle('hbush' + i, h[0], h[1], 0.75, MASK_NPC, 1.05);
      this.avoid(h[0], h[1], 1.4);
    });
    // りんごの木
    const at = L.appleTree;
    this.place(P.broadTree(77, 1.0, true), at[0], at[1], 0.3);
    col.addCircle('appletree', at[0], at[1], 0.3, MASK_ALL, 2);
    this.treePts.push({ x: at[0], z: at[1], r: 3 });
    this.avoid(at[0], at[1], 2.2);

    // 敷地内の木（散らばり）
    let placed = 0;
    for (let tries = 0; tries < 2500 && placed < 70; tries++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 37;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      const pine = r() < 0.45;
      if (!this.free(x, z, 2.2, 2.4)) continue;
      // 中心部のピクニック〜キャンプ場はあけておく
      if (Math.hypot(x + 4, z - 4) < 9) continue;
      let ok = true;
      for (const t of this.treePts) if (Math.hypot(x - t.x, z - t.z) < 3.6) { ok = false; break; }
      if (!ok) continue;
      const s = 0.85 + r() * 0.4;
      this.place(pine ? P.pineTree(1000 + placed, s) : P.broadTree(1000 + placed, s), x, z, r() * 6, 1);
      col.addCircle('tree', x, z, (pine ? 0.22 : 0.28) * s, MASK_ALL, 3);
      this.treePts.push({ x, z, r: pine ? 1.8 * s : 2.6 * s });
      placed++;
    }
    // 外周の森（丘の上まで）
    for (let i = 0; i < 520; i++) {
      const a = r() * Math.PI * 2, d = 36 + Math.pow(r(), 0.8) * 30;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (lakeSdf(x, z) < 2) continue;
      if (pathFactor(x, z) < 2.2) continue;
      if (z > 30 && Math.abs(x) < 20) continue; // 入口側は少し開ける
      let ok = true;
      for (const t of this.treePts) if (Math.hypot(x - t.x, z - t.z) < 2.6) { ok = false; break; }
      if (!ok) continue;
      const s = 0.9 + r() * 0.55;
      const pine = r() < 0.6;
      this.place(pine ? P.pineTree(3000 + i, s, d > 46 ? 1 : 0) : P.broadTree(3000 + i, s, false, d > 42 ? 1 : 0), x, z, r() * 6, 1, 'world', d < 50);
      if (d < 44) col.addCircle('tree', x, z, 0.3 * s, MASK_ALL, 3);
      this.treePts.push({ x, z, r: 2.2 * s });
    }
    // 茂み・岩・切り株・きのこ
    for (let i = 0; i < 150; i++) {
      const a = r() * Math.PI * 2, d = 6 + Math.sqrt(r()) * 44;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (!this.free(x, z, 0.8, 1.6)) continue;
      const k = r();
      if (k < 0.55) {
        this.place(P.bush(2000 + i, 0.7 + r() * 0.5, r() < 0.3 ? ['#f5b4c8', '#fff6e0', '#f7d35a', '#c9a0e8'][Math.floor(r() * 4)] : undefined), x, z, r() * 6, 1, 'world');
        if (d < 40) col.addCircle('bush', x, z, 0.5, MASK_NPC, 0.8);
      } else if (k < 0.8) {
        const s = 0.6 + r() * 1.1;
        this.place(P.rock(2000 + i, s), x, z, r() * 6, 1, 'world');
        if (d < 41) col.addCircle('rock', x, z, 0.6 * s, MASK_ALL, 0.6 * s);
      } else if (k < 0.9) {
        this.place(P.stump(i), x, z, r() * 6, 1, 'prop');
        if (d < 41) col.addCircle('stump', x, z, 0.38, MASK_ALL, 0.42);
      } else {
        this.place(P.mushrooms(i), x, z, r() * 6, 1, 'prop', false);
      }
      this.avoid(x, z, 0.6);
    }
    // 岸辺のアシ・水面の葉
    for (let i = 0; i < 46; i++) {
      const a = r() * Math.PI * 2;
      const { c, rx, rz } = L.lake;
      const x = c[0] + Math.cos(a) * rx * (0.96 + r() * 0.08), z = c[1] + Math.sin(a) * rz * (0.96 + r() * 0.08);
      if (Math.abs(z - L.dock.z) < 2.2 && x > L.dock.x1 - 1) continue;
      this.place(P.reeds(i), x, z, r() * 6, 1, 'prop', false, Math.max(WATER_Y, height(x, z)));
    }
    for (let i = 0; i < 9; i++) {
      const a = r() * Math.PI * 2;
      const { c, rx, rz } = L.lake;
      const x = c[0] + Math.cos(a) * rx * 0.75, z = c[1] + Math.sin(a) * rz * 0.75;
      if (lakeSdf(x, z) > -1) continue;
      this.place(P.lilyPads(i), x, z, 0, 1, 'prop', false, WATER_Y + 0.01);
    }
    // 島の木
    const is = L.island.c;
    this.place(P.broadTree(9, 0.8), is[0] - 0.9, is[1] - 0.6, 0);
    col.addCircle('tree', is[0] - 0.9, is[1] - 0.6, 0.25, MASK_ALL, 3);
    this.treePts.push({ x: is[0] - 0.9, z: is[1] - 0.6, r: 2 });
    this.place(P.rock(8, 0.7), is[0] + 1.2, is[1] + 0.8, 0);
    col.addCircle('rock', is[0] + 1.2, is[1] + 0.8, 0.45);
  }

  // ───────── 地面 ─────────
  private shadeGrid: Float32Array | null = null;
  private shade = (x: number, z: number) => {
    if (!this.shadeGrid) {
      const N = 140;
      this.shadeGrid = new Float32Array(N * N).fill(1);
      for (const t of this.treePts) {
        for (let j = Math.max(0, Math.floor(t.z + 70 - t.r)); j <= Math.min(N - 1, Math.ceil(t.z + 70 + t.r)); j++)
          for (let i = Math.max(0, Math.floor(t.x + 70 - t.r)); i <= Math.min(N - 1, Math.ceil(t.x + 70 + t.r)); i++) {
            const d = Math.hypot(i - 70 - t.x, j - 70 - t.z) / t.r;
            if (d < 1) this.shadeGrid[j * N + i] *= 1 - 0.28 * (1 - d * d);
          }
      }
    }
    const i = Math.round(x + 70), j = Math.round(z + 70);
    if (i < 0 || j < 0 || i >= 140 || j >= 140) return 1;
    return this.shadeGrid[j * 140 + i];
  };

  private buildGround() {
    const size = 136, seg = 180;
    const geo = new THREE.PlaneGeometry(size, size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const cols = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      pos.setY(i, height(x, z));
      const c = groundColor(x, z, this.shade);
      const srgb = new THREE.Color().setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace);
      cols[i * 3] = srgb.r; cols[i * 3 + 1] = srgb.g; cols[i * 3 + 2] = srgb.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 3.2, pos.getZ(i) / 3.2);
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, map: makeGrassDetailTexture(), roughness: 1, metalness: 0 });
    const m = new THREE.Mesh(geo, mat);
    m.receiveShadow = true;
    this.group.add(m);
  }

  private buildWaterAndShore() {
    this.water = buildWater(shared.uTime);
    this.group.add(this.water.mesh);
  }

  // ───────── 草（インスタンス描画） ─────────
  private buildGrass() {
    const blade = new GeoBuilder();
    const r0 = rand(5);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + r0();
      const h = 0.16 + r0() * 0.14;
      const g = new THREE.ConeGeometry(0.025, h, 3, 1, true);
      g.translate(0, h / 2, 0);
      blade.add(g, (p) => new THREE.Color().lerpColors(new THREE.Color('#3e6a24'), new THREE.Color('#b9d86a'), Math.min(1, p.y / 0.26)),
        { pos: [Math.cos(a) * 0.06, 0, Math.sin(a) * 0.06], rot: [Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35], sway: 2.2 });
    }
    const geo = blade.build();
    // 上向きの法線にして地面となじませる
    const nor = geo.attributes.normal as THREE.BufferAttribute;
    for (let i = 0; i < nor.count; i++) nor.setXYZ(i, nor.getX(i) * 0.3, 1, nor.getZ(i) * 0.3);
    geo.normalizeNormals();
    const r = rand(99);
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    for (let i = 0; i < 26000 && mats.length < 4800; i++) {
      const x = (r() - 0.5) * 100, z = (r() - 0.5) * 100;
      if (Math.hypot(x, z) > 47) continue;
      const pf = pathFactor(x, z);
      if (pf < 1.15) continue;
      const ls = lakeSdf(x, z);
      if (ls < 0.4) continue;
      const n = fbm(x * 0.15, z * 0.15);
      if (r() > 0.25 + n * 0.9) continue;
      let blocked = false;
      for (const k of this.keepOut) if (k.r > 2 && Math.hypot(x - k.x, z - k.z) < k.r * 0.55) { blocked = true; break; }
      if (blocked) continue;
      const s = 0.7 + r() * 0.9;
      mats.push(new THREE.Matrix4().compose(new THREE.Vector3(x, height(x, z) - 0.02, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 6, 0)), new THREE.Vector3(s, s * (0.8 + r() * 0.5), s)));
      const c = new THREE.Color().setHSL(0.24 + (r() - 0.5) * 0.05, 0.55, 0.62 + (r() - 0.5) * 0.15);
      cols.push(c.multiplyScalar(this.shade(x, z)));
    }
    const im = new THREE.InstancedMesh(geo, propMat, mats.length);
    mats.forEach((m, i) => { im.setMatrixAt(i, m); im.setColorAt(i, cols[i]); });
    im.receiveShadow = true;
    im.castShadow = false;
    im.frustumCulled = false;
    this.group.add(im);

    // 花
    const fl = new GeoBuilder();
    fl.cyl(0.008, 0.008, 0.2, '#5c8f3a', { pos: [0, 0.1, 0], sway: 1.5 }, 3);
    fl.ico(0.05, '#ffffff', { pos: [0, 0.21, 0], scale: [1, 0.45, 1], sway: 1.5 }, 0);
    fl.ico(0.02, '#f7d35a', { pos: [0, 0.232, 0], sway: 1.5 }, 0);
    const fgeo = fl.build();
    const fm: THREE.Matrix4[] = [];
    const fc: THREE.Color[] = [];
    const palette = ['#ffffff', '#f7a8c4', '#f7d35a', '#b9a2ef', '#ff8a6a'];
    for (let i = 0; i < 4000 && fm.length < 700; i++) {
      const cx = (r() - 0.5) * 84, cz = (r() - 0.5) * 84;
      if (!this.free(cx, cz, 0.3, 1.3)) continue;
      const pc = new THREE.Color(palette[Math.floor(r() * palette.length)]);
      for (let k = 0; k < 6; k++) {
        const x = cx + (r() - 0.5) * 1.6, z = cz + (r() - 0.5) * 1.6;
        if (pathFactor(x, z) < 1.2 || lakeSdf(x, z) < 0.6) continue;
        const s = 0.8 + r() * 0.6;
        fm.push(new THREE.Matrix4().compose(new THREE.Vector3(x, height(x, z), z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 6, 0)), new THREE.Vector3(s, s, s)));
        fc.push(pc);
      }
    }
    const fim = new THREE.InstancedMesh(fgeo, propMat, fm.length);
    fm.forEach((m, i) => { fim.setMatrixAt(i, m); fim.setColorAt(i, fc[i]); });
    fim.frustumCulled = false;
    fim.receiveShadow = true;
    this.group.add(fim);
  }

  // ───────── 結合 ─────────
  private flushChunks() {
    const groups = new Map<string, { geos: THREE.BufferGeometry[]; kind: MatKind; shadow: boolean }>();
    const tmp = new THREE.Vector3();
    for (const p of this.placed) {
      tmp.setFromMatrixPosition(p.m);
      let cx: number, cz: number;
      if (p.m.elements[12] === 0 && p.m.elements[14] === 0) {
        p.geo.computeBoundingSphere();
        cx = Math.floor(p.geo.boundingSphere!.center.x / CHUNK); cz = Math.floor(p.geo.boundingSphere!.center.z / CHUNK);
      } else { cx = Math.floor(tmp.x / CHUNK); cz = Math.floor(tmp.z / CHUNK); }
      const key = `${cx},${cz},${p.kind},${p.shadow}`;
      let g = groups.get(key);
      if (!g) groups.set(key, (g = { geos: [], kind: p.kind, shadow: p.shadow }));
      const geo = p.geo.clone();
      geo.applyMatrix4(p.m);
      g.geos.push(geo);
    }
    for (const g of groups.values()) {
      const b = new GeoBuilder();
      void b;
      const merged = mergeAll(g.geos);
      const mat = g.kind === 'glow' ? glowMat : g.kind === 'prop' ? propMat : worldMat;
      const m = new THREE.Mesh(merged, mat);
      m.castShadow = g.shadow && g.kind !== 'glow';
      m.receiveShadow = g.kind !== 'glow';
      this.group.add(m);
    }
    this.placed = [];
  }

  // ───────── 毎フレーム ─────────
  update(dt: number, t: number, playerInCabin: boolean) {
    for (const a of this.anim) a(dt, t);
    this.roofFade = THREE.MathUtils.lerp(this.roofFade, playerInCabin ? 0 : 1, Math.min(1, dt * 6));
    const rm = this.cabinRoof.material as THREE.MeshStandardMaterial;
    rm.opacity = this.roofFade;
    rm.depthWrite = this.roofFade > 0.95;
    this.cabinRoof.visible = this.roofFade > 0.02;
    this.cabinRoof.castShadow = this.roofFade > 0.5;
    for (const h of this.hideSpots) {
      if (!h.obj || h.rustle <= 0) { if (h.obj) h.obj.scale.setScalar(1); continue; }
      h.rustle = Math.max(0, h.rustle - dt);
      const k = Math.sin(t * 40) * 0.05 * h.rustle;
      h.obj.scale.set(1 + k, 1 - k, 1 + k);
    }
  }

  isInsideCabin(x: number, z: number) {
    const c = L.cabin;
    return Math.abs(x - c.pos[0]) < c.w / 2 && Math.abs(z - c.pos[1]) < c.d / 2;
  }
}

function mergeAll(geos: THREE.BufferGeometry[]) {
  let vc = 0, ic = 0;
  for (const g of geos) { vc += g.attributes.position.count; ic += g.index!.count; }
  const pos = new Float32Array(vc * 3), nor = new Float32Array(vc * 3), col = new Float32Array(vc * 3), sw = new Float32Array(vc);
  const idx = vc > 65535 ? new Uint32Array(ic) : new Uint16Array(ic);
  let vo = 0, io = 0;
  for (const g of geos) {
    const n = g.attributes.position.count;
    pos.set(g.attributes.position.array as Float32Array, vo * 3);
    nor.set(g.attributes.normal.array as Float32Array, vo * 3);
    col.set(g.attributes.color.array as Float32Array, vo * 3);
    sw.set(g.attributes.aSway.array as Float32Array, vo);
    const gi = g.index!.array;
    for (let k = 0; k < gi.length; k++) idx[io + k] = gi[k] + vo;
    vo += n; io += gi.length;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.setAttribute('aSway', new THREE.BufferAttribute(sw, 1));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  out.computeBoundingSphere();
  return out;
}
