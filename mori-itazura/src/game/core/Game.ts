// ゲーム本体：各システムを組み立て、独立したループで更新し、UI へ必要な状態だけを通知する。
import * as THREE from 'three';
import { EventBus } from './EventBus';
import { GameState, SaveData, newSaveData } from './GameState';
import { GameLoop } from './GameLoop';
import { Input } from './Input';
import { UIStore, DialogueView } from './UIStore';
import { Bubbles } from './Bubbles';
import type { GameContext } from './Context';
import { Renderer, Quality } from '../render/Renderer';
import { shared, glowMat } from '../render/Materials';
import { IconRenderer } from '../render/IconRenderer';
import { WorldManager } from '../world/WorldManager';
import { CampsiteObjects } from '../world/CampsiteObjects';
import { AreaManager } from '../world/AreaManager';
import { CameraController } from '../world/CameraController';
import { NavGrid } from '../world/NavGrid';
import { MASK_NPC, MASK_PLAYER } from '../world/CollisionSystem';
import { groundY, WATER_Y } from '../world/Terrain';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { buildHuman } from '../entities/HumanModel';
import { buildCritter } from '../entities/CritterModel';
import type { Interactable, InteractionResult } from '../entities/Interactable';
import { InventorySystem } from '../systems/InventorySystem';
import { EconomySystem } from '../systems/EconomySystem';
import { QuestSystem } from '../systems/QuestSystem';
import { SaveSystem, createStorage } from '../systems/SaveSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { SuspicionSystem } from '../systems/SuspicionSystem';
import { AIBehaviorSystem } from '../systems/AIBehaviorSystem';
import { DialogueSystem } from '../systems/DialogueSystem';
import { FishingSystem, Catch } from '../systems/FishingSystem';
import { TimeOfDay } from '../systems/TimeOfDay';
import { AudioSystem, Mood, Surface } from '../systems/AudioSystem';
import { onDock, pathFactor, lakeSdf } from '../world/Terrain';
import { CondCtx } from '../systems/Conditions';
import { NPCS, canTalk } from '../content/characters/npcs';
import { QUESTS, ACHIEVEMENTS } from '../content/quests/quests';
import { ITEMS, ITEM_LIST } from '../content/items/items';
import { SHOP } from '../content/items/shop';
import { DIALOGUE, SPEAKER, DialogueEffect } from '../content/dialogue/dialogue';
import { CAMPSITE as L } from '../content/areas/campsite';

export class Game {
  readonly ui = new UIStore();
  readonly bus = new EventBus();
  readonly state = new GameState();
  renderer!: Renderer;
  cam = new CameraController();
  input!: Input;
  world = new WorldManager();
  objects!: CampsiteObjects;
  areas = new AreaManager();
  navNpc!: NavGrid;
  navPlayer!: NavGrid;
  player!: Player;
  npcs: NPC[] = [];
  inv!: InventorySystem;
  eco!: EconomySystem;
  quests!: QuestSystem;
  move!: MovementSystem;
  interact!: InteractionSystem;
  sus!: SuspicionSystem;
  ai!: AIBehaviorSystem;
  dialogue!: DialogueSystem;
  fishing = new FishingSystem();
  tod = new TimeOfDay();
  audio = new AudioSystem();
  private lastInd = new Map<string, string>();
  private lastPhase = 0;
  private wasAir = false;
  private lastFishPhase = '';
  private paddleT = 0;
  saveSys = new SaveSystem(createStorage());
  bubbles!: Bubbles;
  icons: Record<string, string> = {};
  portraits: Record<string, string> = {};
  loop: GameLoop;
  time = 0;
  ctx!: GameContext;
  private w = 1; private h = 1;
  private autosaveT = 0;
  private caught = false;
  private fadeEl!: HTMLDivElement;
  private arrowEl!: HTMLDivElement;
  private questMarker!: THREE.Mesh;
  private bobber!: THREE.Mesh;
  private line!: THREE.Line;
  private toastId = 0;
  private hungerWarned = false;
  private tutorial = 0;
  private tutorialT = 0;
  private startPos = new THREE.Vector3();
  private heistWitnessed = false;
  private uiT = 0;
  private fpsLow = 0;
  private npcInteractables: Interactable[] = [];
  private playerLight!: THREE.PointLight;

  constructor() {
    this.loop = new GameLoop((dt) => this.frame(dt));
  }

  // ───────── 初期化 ─────────
  async init(canvas: HTMLCanvasElement, overlay: HTMLElement) {
    const step = (t: string) => new Promise<void>((r) => { this.ui.set({ loadingText: t }); setTimeout(r, 30); });
    this.renderer = new Renderer(canvas);
    this.input = new Input(canvas);
    // スマホは操作のあとでないと音が出せないので、最初のタッチで音を有効にする
    const unlock = () => this.audio.unlock();
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
    this.bubbles = new Bubbles(overlay);
    this.fadeEl = document.createElement('div');
    this.fadeEl.className = 'fade';
    document.body.appendChild(this.fadeEl);
    this.arrowEl = document.createElement('div');
    this.arrowEl.className = 'qarrow';
    document.body.appendChild(this.arrowEl);
    const savedQ = (localStorage.getItem('mori-quality') as Quality) || 'high';
    this.renderer.quality = savedQ;
    this.ui.set({ quality: savedQ });
    this.onResize();
    window.addEventListener('resize', () => this.onResize());

    await step('もりを そだてています…');
    this.world.build(this.renderer.scene);
    await step('みちを しらべています…');
    this.navNpc = new NavGrid(this.world.col, MASK_NPC, 0.35);
    this.navPlayer = new NavGrid(this.world.col, MASK_PLAYER, 0.22);

    await step('キャンプの ひとたちが あつまっています…');
    this.player = new Player();
    this.renderer.scene.add(this.player.obj, this.player.blob);
    // 夜でも主人公が見えるように、ほんのり照らす
    this.playerLight = new THREE.PointLight('#ffd9a0', 0, 5, 1.5);
    this.playerLight.position.set(0, 1.4, 0.6);
    this.player.obj.add(this.playerLight);
    for (const d of NPCS) {
      const n = new NPC(d);
      this.npcs.push(n);
      this.renderer.scene.add(n.obj, n.blob, n.indicator);
    }

    this.inv = new InventorySystem(this.state, this.bus);
    this.eco = new EconomySystem(this.state, this.bus, this.inv);
    const condCtx = (): CondCtx => ({ state: this.state, itemCount: (id) => this.inv.count(id), questStatus: (id) => this.quests.status(id), isDisguised: () => this.state.player.outfitId !== 'none' });
    this.quests = new QuestSystem(this.state, this.bus, QUESTS, condCtx, {
      addItem: (id, n, s) => this.inv.add(id, n, s),
      removeItem: (id, n) => this.inv.remove(id, n, 'quest'),
      addMoney: (n) => this.eco.add(n),
      achieve: (id) => this.bus.emit('achievement', { id }),
    });
    this.dialogue = new DialogueSystem(condCtx, { effect: (e, id) => this.dialogueEffect(e, id), close: (id) => this.onDialogueClose(id) });
    this.ctx = this.makeCtx();
    this.objects = new CampsiteObjects(this.world);
    this.objects.build(this.ctx);
    this.move = new MovementSystem(this.world.col, this.navPlayer, this.world.hideSpots, (x, z) => this.world.isInsideCabin(x, z));
    this.interact = new InteractionSystem(() => [...this.world.interactables, ...this.npcInteractables], this.move, this.renderer.scene);
    this.interact.onResult = (i, r) => this.onInteraction(i, r);
    this.move.onRustle = () => this.audio.play('rustle');
    this.sus = new SuspicionSystem(this.world.col);
    this.ai = new AIBehaviorSystem(this.navNpc, this.sus, () => this.ctx, this.objects);
    this.ai.onCatch = (n) => this.onCaught(n);
    this.buildNpcInteractables();
    this.buildFx();
    this.wireEvents();

    await step('えのぐを まぜています…');
    const ir = new IconRenderer(this.renderer.renderer);
    for (const it of ITEM_LIST) this.icons[it.id] = ir.item(it.id);
    this.icons.coin = ir.item('coin');
    for (const d of NPCS) {
      const rig = buildHuman({ ...d.look, scale: 1 });
      rig.root.rotation.y = -0.25;
      this.portraits[d.id] = ir.render(rig.root, 'face');
    }
    const pr = buildCritter();
    pr.root.rotation.y = -0.3;
    this.portraits.player = ir.render(pr.root, 'face');
    ir.dispose();
    this.renderer.renderer.setClearColor(0x000000, 1);

    this.fishing.onCatch = (c) => this.onFishCaught(c);
    this.fishing.onMiss = () => { /* */ };
    this.input.onKey = (k) => this.onKey(k);

    // タイトル画面：生きている世界を背景に
    this.player.obj.visible = false; this.player.blob.visible = false;
    this.player.pos.set(L.den.pos[0], 0, L.den.pos[1] + 30);
    this.player.hidden = true;
    this.tod.clock = 16.8; this.tod.apply();
    this.cam.mode = 'orbit';
    const has = await this.saveSys.exists().catch(() => false);
    this.ui.set({ screen: 'title', hasSave: has });
    this.loop.start();
  }

  private makeCtx(): GameContext {
    const g = this;
    return {
      get state() { return g.state; }, get bus() { return g.bus; }, get inv() { return g.inv; }, get eco() { return g.eco; }, get quests() { return g.quests; },
      get player() { return g.player; }, get world() { return g.world; }, get npcs() { return g.npcs; }, get time() { return g.time; },
      toast: (t, k) => g.toast(t, k),
      say: (who, text, sec = 2.4, kind = 'say') => { g.bubbles.say(() => who.bubbleAnchor(), text, sec, g.time, kind); g.voice(who, text, kind === 'shout'); },
      openDialogue: (id) => g.openDialogue(id),
      openShop: (m) => g.ui.set({ shop: m }),
      startFishing: () => g.startFishing(),
      witnesses: () => g.ai.witnesses(g.npcs),
      noise: (x, z, r) => g.ai.onNoise(g.npcs, x, z, r, g.state.player.outfitId),
      isDisguised: () => g.state.player.outfitId !== 'none',
      sleep: () => g.sleep(),
      save: (r) => g.save(r),
    };
  }

  /** 吹き出しに合わせた声（距離で小さくなる） */
  private voice(who: unknown, text: string, shout: boolean) {
    const n = who instanceof NPC ? who : null;
    const pitch = n ? ({ dad: 170, mom: 260, kid: 420, ranger: 140, shop: 300, fisher: 150, camper: 200 } as Record<string, number>)[n.id] ?? 220 : 520;
    const pos = n ? n.pos : this.player.pos;
    const d = pos.distanceTo(this.player.pos);
    this.audio.babble(text, pitch, Math.max(0, 1 - d / 16), shout);
  }

  private buildNpcInteractables() {
    for (const n of this.npcs) {
      this.npcInteractables.push({
        id: 'npc:' + n.id, type: 'npc', position: n.pos, reach: n.def.id === 'shop' ? 2.4 : 1.6, markerY: n.height + 0.25,
        object: n.obj,
        label: (c) => (canTalk(c.state.player.outfitId, n.def.role) || n.def.role === 'fisher' ? `${n.def.name}と はなす` : `${n.def.name}に ちかよる`),
        active: () => n.state !== 'Chasing' && n.state !== 'Investigating',
        canInteract: () => true,
        interact: (c) => {
          const ok = canTalk(c.state.player.outfitId, n.def.role) || n.def.role === 'fisher';
          if (!ok) {
            n.suspicion = Math.min(100, n.suspicion + 40);
            n.lastSeen.x = c.player.pos.x; n.lastSeen.z = c.player.pos.z;
            c.say(n, n.def.greet, 2, 'shout');
            return { ok: false, anim: 'surprise', animTime: 0.6 };
          }
          if (c.state.player.outfitId === 'ranger_hat' && n.def.role === 'ranger') {
            n.suspicion = Math.max(n.suspicion, 60);
          }
          c.openDialogue(n.id);
          return { ok: true };
        },
      });
    }
  }

  private buildFx() {
    // クエストの目的地マーカー
    const g = new THREE.OctahedronGeometry(0.22, 0);
    this.questMarker = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#5ad1ff', transparent: true, opacity: 0.9, toneMapped: false }));
    this.questMarker.renderOrder = 6;
    this.questMarker.visible = false;
    this.renderer.scene.add(this.questMarker);
    // つりのうき
    this.bobber = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), new THREE.MeshStandardMaterial({ color: '#e23b2f', roughness: 0.5 }));
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#ffffff' }));
    top.position.y = 0.01;
    this.bobber.add(top);
    this.bobber.visible = false;
    this.renderer.scene.add(this.bobber);
    this.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: '#f4f0e6', transparent: true, opacity: 0.8 }));
    this.line.visible = false;
    this.line.frustumCulled = false;
    this.renderer.scene.add(this.line);
  }

  private wireEvents() {
    const b = this.bus;
    b.on('toast', (t) => this.toast(t.text, t.kind ?? 'info'));
    const A = this.audio;
    b.on('item:obtained', (e) => { if (e.source === 'treasure') A.play('treasure'); else if (e.source !== 'shop' && e.source !== 'quest') A.play('pickup'); });
    b.on('money:changed', (e) => { if (e.delta > 0) A.play('coin'); });
    b.on('quest:completed', () => A.play('quest'));
    b.on('quest:started', () => { if (this.ui.get().screen === 'game') A.play('questStart'); });
    b.on('achievement', (e) => { if (!this.state.progress.achievements.includes(e.id)) setTimeout(() => A.play('achieve'), 500); });
    b.on('player:caught', () => A.play('caught'));
    b.on('shop:bought', () => A.play('buy'));
    b.on('shop:sold', () => A.play('coin'));
    b.on('outfit:changed', () => A.play('equip'));
    b.on('item:used', (e) => { if (e.action === 'eat') A.play('eat'); });
    b.on('item:obtained', (e) => {
      const def = ITEMS[e.itemId];
      if (e.source !== 'shop') this.toast(`${def.name}${e.count > 1 ? ' ×' + e.count : ''} を てにいれた！`, 'good', e.itemId);
      this.bumpInv();
      if (e.itemId === 'teddy_bear') this.player.setHeld('teddy_bear');
    });
    b.on('item:removed', (e) => {
      this.bumpInv();
      if (e.itemId === this.player.heldItem && !this.inv.has(e.itemId)) this.player.setHeld(null);
      if (e.itemId === this.state.player.outfitId && !this.inv.has(e.itemId)) this.setOutfit('none');
    });
    b.on('money:changed', (e) => { if (e.delta > 0) this.toast(`+${e.delta} コイン`, 'good', 'coin'); });
    b.on('quest:completed', (e) => {
      const q = this.quests.def(e.questId)!;
      this.banner(`クエスト クリア！\n「${q.title}」`);
      if (!this.player.busy && !this.player.inBoat) this.player.playAction('celebrate', 1.3);
      this.save('quest');
    });
    b.on('quest:started', (e) => {
      const q = this.quests.def(e.questId)!;
      if (this.ui.get().screen === 'game') this.toast(`あたらしい もくてき：${q.title}`, 'info');
    });
    b.on('achievement', (e) => {
      const a = this.state.progress.achievements;
      if (a.includes(e.id)) return;
      a.push(e.id);
      const d = ACHIEVEMENTS[e.id];
      if (d) this.toast(`🏅 じっせき「${d.name}」`, 'good');
    });
    b.on('player:escaped', () => {
      if (!this.ai || this.npcs.some((n) => n.state === 'Chasing')) return;
      this.toast('にげきった！', 'good');
      this.audio.play('escape');
      this.bus.emit('achievement', { id: 'escape_artist' });
    });
    b.on('shop:bought', (e) => {
      if (SHOP.find((s) => s.id === e.itemId)?.kind === 'upgrade') this.bus.emit('achievement', { id: 'home_sweet_home' });
      this.bumpInv();
    });
    b.on('shop:sold', () => this.bumpInv());
  }

  // ───────── 開始・セーブ ─────────
  async start(cont: boolean) {
    let data: SaveData | null = null;
    if (cont) data = await this.saveSys.load().catch(() => null);
    this.state.data = data ?? newSaveData();
    const P = this.state.player;
    this.player.obj.visible = true; this.player.blob.visible = true;
    this.player.hidden = false;
    this.player.pos.set(P.position.x, groundY(P.position.x, P.position.z), P.position.z);
    this.player.facing = data ? 0 : 2.3;
    this.player.hunger = P.hunger;
    this.player.inBoat = false;
    this.setOutfit(P.outfitId, true);
    this.player.setHeld(this.inv.has('teddy_bear') ? 'teddy_bear' : null);
    this.tod.clock = this.state.world.clock;
    this.tod.day = this.state.world.day;
    this.tod.apply();
    this.objects.syncAll(this.ctx);
    this.restoreNpcs();
    this.quests.evaluate();
    this.cam.mode = 'follow';
    this.cam.snap(this.player.pos);
    this.startPos.copy(this.player.pos);
    this.tutorial = data ? 99 : 0;
    this.ui.set({ screen: 'game', panel: null, shop: null, dialogue: null });
    this.bumpInv();
    if (!data) {
      this.banner('もりの いたずらびより');
      setTimeout(() => this.ctx.say(this.player, 'おなか すいたなぁ…', 2.6, 'think'), 1200);
    } else this.banner(`${this.tod.day}にちめ`);
  }

  private restoreNpcs() {
    const st = this.state.world.npcStates as Record<string, { x: number; z: number; ri: number; facing: number }>;
    for (const n of this.npcs) {
      const s = st[n.id];
      n.state = 'Idle'; n.suspicion = 0; n.seated = false; n.path = []; n.pathTarget = null; n.taskStarted = false; n.talking = false; n.knownFood = -1;
      if (s) { n.pos.set(s.x, 0, s.z); n.routineIndex = s.ri; n.facing = s.facing; }
      else { n.pos.set(n.def.start[0], 0, n.def.start[1]); n.routineIndex = 0; }
    }
  }

  collectSave(): SaveData {
    const d = this.state.data;
    d.player.position = { x: this.player.pos.x, y: this.player.pos.y, z: this.player.pos.z };
    if (this.player.inBoat || this.world.isInsideCabin(this.player.pos.x, this.player.pos.z) && false) {
      d.player.position = { x: L.spawn[0], y: 0, z: L.spawn[1] };
    }
    d.player.hunger = this.player.hunger;
    d.player.outfitId = this.state.player.outfitId;
    d.world.clock = this.tod.clock;
    d.world.day = this.tod.day;
    const ns: Record<string, unknown> = {};
    for (const n of this.npcs) ns[n.id] = { x: n.pos.x, z: n.pos.z, ri: n.routineIndex, facing: n.facing };
    d.world.npcStates = ns;
    return d;
  }

  async save(reason: string) {
    if (this.ui.get().screen !== 'game') return;
    try {
      this.ui.set({ saving: true });
      await this.saveSys.save(this.collectSave());
      this.ui.set({ hasSave: true });
      if (reason === 'manual') this.toast('きろく しました', 'info');
    } catch (e) {
      console.warn(e);
      this.toast('きろく できませんでした', 'warn');
    } finally {
      setTimeout(() => this.ui.set({ saving: false }), 600);
    }
  }

  async resetSave() { await this.saveSys.clear(); this.ui.set({ hasSave: false }); }

  // ───────── 毎フレーム ─────────
  private frame(dt: number) {
    this.time += dt;
    shared.uTime.value = this.time;
    const screen = this.ui.get().screen;
    const p = this.player;

    if (screen === 'game') this.updateGame(dt);
    else {
      this.ai.update(dt, this.npcs, p, this.tod.night);
      this.tod.clock = 16.8; this.tod.apply();
    }
    for (const n of this.npcs) n.updateVisual(dt, this.time);
    if (screen === 'game') p.updateVisual(dt, this.time);
    this.objects.update(dt, this.time, this.ctx);
    this.world.update(dt, this.time, p.insideCabin);
    this.applyLighting();
    this.cam.zoom = this.input.zoom;
    this.cam.update(dt, p.pos, this.move.velocity(), p.insideCabin ? 0.8 : 1);
    this.updateSeeThrough();
    this.renderer.followShadow(screen === 'game' ? p.pos : new THREE.Vector3(-6, 0, 8), this.tod.sunDir);
    this.bubbles.update(this.time, this.cam.camera, this.w, this.h);
    this.updateAudio(dt);
    this.renderer.render(this.cam.camera);
    this.adaptQuality(dt);
  }

  private updateGame(dt: number) {
    const p = this.player;
    const ui = this.ui.get();
    const locked = !!ui.dialogue || !!ui.shop || !!ui.panel || this.fishing.active || this.caught;
    this.input.enabled = !locked;
    if (locked) this.input.cancel();
    // 入力
    const inp = this.input.read();
    for (const t of this.input.taps.splice(0)) if (!locked) this.interact.tap(t.x, t.y, this.cam.camera, this.w, this.h, this.ctx);
    p.tickAction(dt);
    this.move.update(dt, p, locked ? { x: 0, y: 0, run: false, active: false } : inp, locked);
    p.recentTheft = Math.max(0, p.recentTheft - dt);
    p.invuln = Math.max(0, p.invuln - dt);
    // おなか
    p.hunger = Math.max(0, p.hunger - dt * (p.running ? 0.16 : 0.1));
    if (p.hunger < 25 && !this.hungerWarned) { this.hungerWarned = true; this.toast('おなかが すいてきた… なにか たべよう', 'warn'); }
    if (p.hunger > 40) this.hungerWarned = false;
    // つり
    this.updateFishing(dt);
    // 世界
    this.interact.update(dt, this.time, this.ctx);
    this.ai.update(dt, this.npcs, p, this.tod.night);
    this.tod.update(dt);
    if (this.areas.update(p.pos.x, p.pos.z)) { /* 場所の名前が変わった */ }
    this.updateQuestMarker();
    this.updateTutorial(dt);
    this.autosaveT += dt;
    if (this.autosaveT > 60) { this.autosaveT = 0; this.save('auto'); }
    this.uiT += dt;
    if (this.uiT > 0.1) { this.uiT = 0; this.syncUI(); }
  }

  private updateAudio(dt: number) {
    const A = this.audio;
    const ui = this.ui.get();
    const inGame = ui.screen === 'game';
    const p = this.player;
    const chased = inGame && this.npcs.some((n) => n.state === 'Chasing');
    const h = this.tod.clock;
    const mood: Mood = !inGame ? 'title' : chased ? 'chase' : this.tod.night > 0.6 ? 'night' : h >= 16.3 && h < 19.5 ? 'evening' : 'day';
    let alert = 0;
    if (inGame) for (const n of this.npcs) if (n.def.role !== 'kid') alert = Math.max(alert, n.suspicion);
    const cf = L.campfire.pos;
    const ref = inGame ? p.pos : new THREE.Vector3(-6, 0, 8);
    A.update(dt, {
      mood, alert, night: this.tod.night, inGame,
      fireDist: Math.hypot(ref.x - cf[0], ref.z - cf[1]),
      waterDist: Math.max(0, lakeSdf(ref.x, ref.z)),
    });
    if (!inGame) return;
    // 足音（足の運びの位相に合わせる）
    const step = Math.floor(p.phase / Math.PI);
    if (step !== this.lastPhase) {
      this.lastPhase = step;
      if (p.speed > 0.4 && p.lift <= 0 && !p.inBoat) {
        const surf: Surface = onDock(p.pos.x, p.pos.z) || p.insideCabin ? 'wood' : pathFactor(p.pos.x, p.pos.z) < 1.1 ? 'dirt' : 'grass';
        A.footstep(surf, p.sneaking ? 0.35 : p.running ? 1.2 : 0.8);
      }
    }
    // 着地
    const air = p.lift > 0;
    if (this.wasAir && !air) A.play('land');
    this.wasAir = air;
    // ボートをこぐ音
    if (p.inBoat && p.speed > 0.3) { this.paddleT -= dt; if (this.paddleT <= 0) { this.paddleT = 0.55; A.play('paddle'); } }
    // NPC の「?」「!」
    for (const n of this.npcs) {
      const prev = this.lastInd.get(n.id) ?? '';
      if (n.indKind !== prev) {
        const near = n.pos.distanceTo(p.pos) < 18;
        if (near && n.indKind === '!' && prev !== '!') A.play('alarm');
        else if (near && n.indKind === '?' && prev === '') A.play('question');
        this.lastInd.set(n.id, n.indKind);
      }
    }
    // つり
    const fp = this.fishing.active ? this.fishing.phase : '';
    if (fp !== this.lastFishPhase) {
      if (fp === 'cast') A.play('cast');
      else if (fp === 'bite') A.play('plop');
      else if (fp === 'result') A.play('splash');
      this.lastFishPhase = fp;
    }
  }

  private applyLighting() {
    const t = this.tod, r = this.renderer;
    r.sun.color.copy(t.sunColor);
    r.sun.intensity = t.sunI;
    r.hemi.color.copy(t.sky);
    r.hemi.groundColor.copy(t.ground);
    r.hemi.intensity = t.hemiI;
    (r.scene.background as THREE.Color).copy(t.bg);
    (r.scene.fog as THREE.Fog).color.copy(t.fog);
    r.warm = t.warm;
    glowMat.color.setScalar(t.glow);
    this.playerLight.intensity = t.night * 2.2;
    this.world.fireLightBase = 2.2 + t.night * 9;
    this.world.fireLight.distance = 9 + t.night * 7;
    const wm = this.world.water.mat.uniforms;
    wm.uLight.value = t.water;
    wm.uNight.value = t.night;
  }

  /** 主人公の手前にある物を透かす */
  private updateSeeThrough() {
    const v = this.player.pos.clone();
    v.y += 0.4;
    const camSpace = v.clone().applyMatrix4(this.cam.camera.matrixWorldInverse);
    v.project(this.cam.camera);
    const pr = this.renderer.pixelRatio;
    shared.uSeeCenter.value.set((v.x * 0.5 + 0.5) * this.w * pr, (v.y * 0.5 + 0.5) * this.h * pr);
    shared.uSeeRadius.value = Math.min(this.w, this.h) * pr * 0.16;
    shared.uSeeDepth.value = -camSpace.z;
    shared.uSeeOn.value = this.ui.get().screen === 'game' ? 1 : 0;
    shared.uSeeMargin.value = this.player.hidden && !this.player.underTable ? -0.6 : 1.2;
    this.renderer.focusY = THREE.MathUtils.clamp(v.y * 0.5 + 0.5, 0.3, 0.7);
  }

  private adaptQuality(dt: number) {
    if (this.ui.get().screen !== 'game') return;
    if (this.loop.fps < 34) this.fpsLow += dt; else this.fpsLow = Math.max(0, this.fpsLow - dt * 0.5);
    if (this.fpsLow > 6) {
      this.fpsLow = 0;
      const q = this.renderer.quality;
      const nq: Quality | null = q === 'high' ? 'medium' : q === 'medium' ? 'low' : null;
      if (nq) { this.setQuality(nq); this.toast('うごきを かるく しました（がしつ：' + (nq === 'medium' ? 'ふつう' : 'かるい') + '）'); }
    }
  }

  setQuality(q: Quality) {
    this.renderer.setQuality(q);
    try { localStorage.setItem('mori-quality', q); } catch { /* */ }
    this.ui.set({ quality: q });
  }

  private syncUI() {
    const p = this.player;
    const tr = this.quests.tracked();
    const f = this.interact.focus;
    let alert = 0, chased = false;
    for (const n of this.npcs) {
      if (n.state === 'Chasing') chased = true;
      if (n.def.role !== 'kid') alert = Math.max(alert, n.suspicion);
    }
    this.ui.set({
      money: this.state.player.currency,
      hunger: Math.round(p.hunger),
      timeLabel: this.tod.label(),
      night: Math.round(this.tod.night * 10) / 10,
      place: this.areas.placeName,
      quest: tr ? { title: tr.quest.title, text: tr.objective.text, progress: tr.progress } : null,
      action: f ? { label: f.label(this.ctx), type: f.type } : null,
      sneaking: p.sneaking, hidden: p.hidden, inBoat: p.inBoat,
      alert: Math.round(alert), chased,
      fishing: this.fishing.view(),
      outfit: this.state.player.outfitId,
      fps: Math.round(this.loop.fps),
    });
  }

  private bumpInv() { this.ui.set({ invVersion: this.ui.get().invVersion + 1 }); }

  toast(text: string, kind: 'info' | 'good' | 'warn' = 'info', icon?: string) {
    const id = ++this.toastId;
    const list = [...this.ui.get().toasts, { id, text, kind, icon }].slice(-4);
    this.ui.set({ toasts: list });
    setTimeout(() => this.ui.set({ toasts: this.ui.get().toasts.filter((t) => t.id !== id) }), 3200);
  }

  banner(text: string) {
    this.ui.set({ banner: text });
    setTimeout(() => { if (this.ui.get().banner === text) this.ui.set({ banner: null }); }, 2600);
  }

  // ───────── インタラクションの結果 ─────────
  private onInteraction(i: Interactable, r: InteractionResult) {
    const p = this.player;
    if (r.anim) p.playAction(r.anim, r.animTime ?? 0.6);
    const A = this.audio;
    if (i.id === 'door') A.play('door');
    else if (i.id.startsWith('trash') && r.ok) A.play('rummage');
    else if (i.id === 'appletree') { A.play('shake'); if (r.ok) setTimeout(() => A.play('thud'), 700); }
    else if (i.id === 'treasure' && r.ok) A.play('dig');
    else if (i.id === 'campfire' && r.anim === 'interact') A.play('sizzle');
    else if (i.id === 'boat') A.play('splash');
    else if (i.type === 'container' && r.ok) A.play('open');
    else if (!r.ok && r.message) A.play('warn');
    if (r.message) this.toast(r.message, r.ok ? 'info' : 'warn');
    if (r.noise) this.ctx.noise(p.pos.x, p.pos.z, r.noise);
    if (r.theftItem) {
      p.recentTheft = 5;
      const w = this.ai.witnesses(this.npcs);
      this.ai.onTheft(this.npcs, w, r.owner ?? [], p);
      this.bus.emit('theft', { objectId: i.id, itemId: r.theftItem, seenBy: w });
      const adults = w.filter((id) => id !== 'kid');
      if (i.id === 'basket') {
        if (adults.length === 0 && w.length === 0 && !this.heistWitnessed) {
          this.toast('だれにも みられなかった！', 'good');
          this.bus.emit('achievement', { id: 'perfect_heist' });
        }
        if (w.length) this.heistWitnessed = true;
      }
    }
    if (i.id === 'boat') this.move.stop();
  }

  private onCaught(n: NPC) {
    if (this.caught) return;
    this.caught = true;
    const p = this.player;
    this.move.stop();
    this.fishing.stop();
    n.anim.play('grab', 0.1);
    this.ctx.say(n, 'つかまえたぞ！', 2, 'shout');
    p.playAction('fall', 1.6);
    this.cam.shake = 0.4;
    this.bus.emit('player:caught', { npcId: n.id });
    this.bus.emit('achievement', { id: 'caught' });
    setTimeout(() => this.fadeTo(1), 1100);
    setTimeout(() => {
      const lost = this.inv.pickPenalty();
      if (lost) { this.inv.remove(lost, 1, 'caught'); this.toast(`${ITEMS[lost].name}を とりあげられた…`, 'warn'); }
      if (this.inv.has('ranger_hat') && n.def.role === 'ranger') { this.inv.remove('ranger_hat', 1, 'caught'); this.state.setFlag('rangerhat_taken', false); this.objects.syncAll(this.ctx); this.toast('ぼうしを とりかえされた…', 'warn'); }
      p.pos.set(L.spawn[0], 0, L.spawn[1]);
      p.pos.y = groundY(p.pos.x, p.pos.z);
      p.facing = 2.3;
      p.invuln = 4;
      p.inBoat = false;
      p.sneaking = false;
      for (const m of this.npcs) {
        m.suspicion = Math.min(m.suspicion, 8);
        if (m.state === 'Chasing' || m.state === 'Investigating' || m.state === 'Suspicious') { m.state = 'Returning'; m.stateTimer = 0; m.path = []; m.pathTarget = null; }
      }
      this.cam.snap(p.pos);
      this.fadeTo(0);
      this.caught = false;
      this.banner('おうちに にげかえった…');
    }, 1800);
  }

  private fadeTo(v: number) { this.fadeEl.style.opacity = String(v); }

  sleep() {
    this.audio.play('sleep');
    this.fadeTo(1);
    this.caught = true;
    setTimeout(() => {
      const t = this.tod;
      if (t.clock > 7) t.day++;
      t.clock = 7.0;
      t.apply();
      this.objects.restock(this.ctx);
      this.player.hunger = Math.max(15, Math.min(100, this.player.hunger + (this.state.flag('home_bed') ? 15 : -10)));
      this.restoreNpcs();
      this.state.world.npcStates = {};
      this.restoreNpcs();
      this.player.pos.set(L.spawn[0], groundY(L.spawn[0], L.spawn[1]), L.spawn[1]);
      this.cam.snap(this.player.pos);
      this.save('sleep');
      this.fadeTo(0);
      this.caught = false;
      this.banner(`${t.day}にちめの あさ`);
    }, 900);
  }

  // ───────── 会話 ─────────
  openDialogue(id: string) {
    if (!DIALOGUE[id]) return;
    this.move.stop();
    if (!this.dialogue.open(id)) return;
    const n = this.npcs.find((m) => m.id === id);
    if (n) { n.talking = true; this.bus.emit('npc:talked', { npcId: id }); }
    this.refreshDialogue();
  }

  private refreshDialogue() {
    const node = this.dialogue.node;
    const id = this.dialogue.npcId;
    if (!node || !id) { this.ui.set({ dialogue: null }); return; }
    const n = this.npcs.find((m) => m.id === id);
    const v: DialogueView = {
      npcId: id, name: n?.def.name ?? SPEAKER[id] ?? '', text: node.text,
      choices: this.dialogue.choices().map((c) => c.text), mood: node.mood,
      portrait: this.portraits[id] ?? (id === 'den' ? this.portraits.player : undefined),
    };
    if (this.ui.get().dialogue?.text !== v.text) this.audio.babble(v.text, ({ dad: 170, mom: 260, kid: 420, ranger: 140, shop: 300, fisher: 150, camper: 200 } as Record<string, number>)[id] ?? 330, 1);
    this.ui.set({ dialogue: v });
  }

  chooseDialogue(i: number) {
    this.audio.play('click');
    const ch = this.dialogue.choices()[i];
    if (!ch) return;
    this.dialogue.choose(ch.idx);
    this.refreshDialogue();
  }

  closeDialogue() { this.dialogue.close(); this.refreshDialogue(); }

  private onDialogueClose(id: string) {
    const n = this.npcs.find((m) => m.id === id);
    if (n) n.talking = false;
    this.ui.set({ dialogue: null });
  }

  private dialogueEffect(e: DialogueEffect, npcId: string) {
    if ('startQuest' in e) this.quests.start(e.startQuest);
    else if ('give' in e) {
      const n = e.count ?? 1;
      if (this.inv.remove(e.give, n, 'given')) this.bus.emit('item:given', { itemId: e.as ?? e.give, npcId });
    } else if ('receive' in e) this.inv.add(e.receive, e.count ?? 1, 'npc');
    else if ('money' in e) this.eco.add(e.money);
    else if ('setFlag' in e) this.state.setFlag(e.setFlag);
    else if ('openShop' in e) { this.dialogue.close(); this.ui.set({ shop: e.openShop }); }
    else if ('spawnLitter' in e) this.objects.spawnLitter(this.ctx);
    else if ('sleep' in e) { this.dialogue.close(); this.sleep(); }
    else if ('save' in e) this.save('manual');
  }

  // ───────── 持ち物の操作（UI から） ─────────
  useItem(id: string): string | null {
    const def = ITEMS[id];
    const p = this.player;
    if (!def || !this.inv.has(id)) return null;
    if (p.busy) return 'いまは つかえない';
    switch (def.useAction) {
      case 'eat': {
        if (p.inBoat) return 'ボートの うえでは たべられない';
        this.inv.remove(id, 1, 'eat');
        p.hunger = Math.min(100, p.hunger + (def.hunger ?? 10));
        p.playAction('eat', 1.7);
        this.bus.emit('item:used', { itemId: id, action: 'eat' });
        this.ctx.say(p, ['もぐもぐ…', 'おいしい！', 'しあわせ〜'][Math.floor(Math.random() * 3)], 1.8);
        this.ui.set({ panel: null });
        return null;
      }
      case 'equip':
        this.setOutfit(this.state.player.outfitId === id ? 'none' : id);
        if (!p.inBoat) p.playAction('celebrate', 1.0);
        this.ui.set({ panel: null });
        return null;
      case 'read':
        this.ui.set({ panel: 'map' });
        return null;
      case 'hold':
        p.setHeld(p.heldItem === id ? null : id);
        this.ui.set({ panel: null });
        return null;
    }
    return 'つかいみちが わからない';
  }

  setOutfit(id: string, silent = false) {
    this.state.player.outfitId = id;
    this.player.setOutfit(id);
    if (!silent) {
      this.bus.emit('outfit:changed', { outfitId: id });
      this.toast(id === 'none' ? 'いつもの すがたに もどった' : `${ITEMS[id].name}を きた！`, 'info');
    }
    this.ui.set({ outfit: id });
  }

  buy(id: string) { const r = this.eco.buy(id); if (!r.ok) this.toast(r.reason!, 'warn'); else this.toast('まいどあり！', 'good'); return r.ok; }
  sell(id: string) { const r = this.eco.sell(id); if (!r.ok) this.toast(r.reason!, 'warn'); return r.ok; }

  toggleSneak() { const p = this.player; if (p.inBoat) return; p.sneaking = !p.sneaking; this.syncUI(); }
  jump() { const air = this.player.lift > 0; this.move.jump(this.player); if (!air && this.player.lift > 0) this.audio.play('jump'); }
  act() { this.interact.act(this.ctx); }
  openPanel(p: 'inventory' | 'map' | 'menu' | 'quests' | null) { this.move.stop(); this.audio.play(p ? 'open' : 'close'); this.ui.set({ panel: p }); }
  closeShop() { this.ui.set({ shop: null }); const n = this.npcs.find((m) => m.id === 'shop'); if (n) n.talking = false; }

  // ───────── つり ─────────
  private startFishing() {
    const p = this.player;
    p.pos.set(L.dock.x1 + 0.45, 0.42, L.dock.z);
    p.facing = -Math.PI / 2;
    p.setHeld('fishing_rod');
    p.anim.play('fish');
    this.fishing.start();
    this.move.stop();
  }
  fishingTap() { const ph = this.fishing.phase; this.fishing.tap(); if (ph === 'reel') this.audio.play('reel'); }
  stopFishing() {
    this.fishing.stop();
    this.bobber.visible = false; this.line.visible = false;
    if (this.player.heldItem === 'fishing_rod') this.player.setHeld(null);
    this.player.anim.play('idle');
    this.syncUI();
  }
  private onFishCaught(c: Catch) {
    this.inv.add(c, 1, 'fishing');
    if (c === 'fish' || c === 'big_fish') this.bus.emit('fish:caught', { itemId: c });
    this.player.playAction('celebrate', 1.0);
  }
  private updateFishing(dt: number) {
    const f = this.fishing;
    if (!f.active) { this.bobber.visible = false; this.line.visible = false; return; }
    f.update(dt);
    const p = this.player;
    if (!p.busy) p.anim.play('fish');
    const bx = L.dock.x1 - 2.6, bz = L.dock.z + 0.3;
    const castT = f.phase === 'cast' ? Math.min(1, (this.time % 10) * 0 + 1) : 1;
    this.bobber.visible = f.phase !== 'cast' || castT > 0.5;
    this.bobber.position.set(bx, WATER_Y + 0.03 - f.bob + Math.sin(this.time * 2.2) * 0.012, bz);
    const tip = new THREE.Vector3(-0.45, 0.25, 0.35);
    p.rig.joints.holdSlot.localToWorld(tip);
    const pos = this.line.geometry.attributes.position as THREE.BufferAttribute;
    pos.setXYZ(0, tip.x, tip.y, tip.z);
    pos.setXYZ(1, bx, this.bobber.position.y + 0.04, bz);
    pos.needsUpdate = true;
    this.line.visible = this.bobber.visible;
  }

  // ───────── クエストの目的地 ─────────
  questTarget(): THREE.Vector3 | null {
    const tr = this.quests.tracked();
    const t = tr?.objective.target;
    if (!t) return null;
    const p = this.player.pos;
    if (t.startsWith('npc:')) { const n = this.npcs.find((m) => m.id === t.slice(4)); return n ? new THREE.Vector3(n.pos.x, n.pos.y + n.height + 0.9, n.pos.z) : null; }
    if (t === 'shop') return new THREE.Vector3(L.shop.pos[0] - 1.6, 3.4, L.shop.pos[1]);
    if (t === 'litter') {
      let best: THREE.Vector3 | null = null, bd = 1e9;
      for (const pk of this.objects.pickups) {
        if (!pk.id.startsWith('litter') || !pk.obj.visible) continue;
        const d = Math.hypot(pk.x - p.x, pk.z - p.z);
        if (d < bd) { bd = d; best = new THREE.Vector3(pk.x, pk.y + 0.9, pk.z); }
      }
      return best;
    }
    const id = t === 'teddy' ? 'pick:teddy' : t;
    const i = this.world.interactables.find((x) => x.id === id);
    if (!i || !i.active(this.ctx)) return null;
    return new THREE.Vector3(i.position.x, i.position.y + i.markerY + 0.7, i.position.z);
  }

  private updateQuestMarker() {
    const t = this.questTarget();
    const m = this.questMarker;
    if (!t || this.ui.get().dialogue) { m.visible = false; this.arrowEl.style.display = 'none'; return; }
    const d = Math.hypot(t.x - this.player.pos.x, t.z - this.player.pos.z);
    m.visible = d > 2.2;
    m.position.set(t.x, t.y + Math.sin(this.time * 3) * 0.12, t.z);
    m.rotation.y = this.time * 1.5;
    // 画面外なら端に矢印
    const v = t.clone().project(this.cam.camera);
    const off = v.z > 1 || Math.abs(v.x) > 0.92 || Math.abs(v.y) > 0.88;
    if (off && d > 4) {
      let x = v.x, y = v.y;
      if (v.z > 1) { x = -x; y = -y; }
      const k = 0.86 / Math.max(Math.abs(x), Math.abs(y));
      x *= k; y *= k;
      const sx = (x * 0.5 + 0.5) * this.w, sy = (-y * 0.5 + 0.5) * this.h;
      this.arrowEl.style.display = 'block';
      this.arrowEl.style.transform = `translate(${sx}px, ${sy}px) translate(-50%,-50%) rotate(${Math.atan2(-y, x)}rad)`;
    } else this.arrowEl.style.display = 'none';
  }

  // ───────── チュートリアル ─────────
  private updateTutorial(dt: number) {
    if (this.tutorial >= 99) return;
    this.tutorialT += dt;
    const p = this.player;
    const set = (h: string | null) => this.ui.set({ hint: h });
    if (this.tutorial === 0) {
      set('がめんの どこでも ドラッグして あるこう。おおきく ひっぱると はしるよ');
      if (p.pos.distanceTo(this.startPos) > 4) { this.tutorial = 1; this.tutorialT = 0; }
    } else if (this.tutorial === 1) {
      set('ピクニックの かぞくの バスケットを ねらおう。しげみや テーブルの したに かくれられるよ');
      if (this.tutorialT > 9) { this.tutorial = 2; this.tutorialT = 0; }
    } else if (this.tutorial === 2) {
      set('「しのびあし」ボタンで みつかりにくく なる。ひとの あたまの「?」「!」に ちゅうい！');
      if (this.tutorialT > 9) { this.tutorial = 3; this.tutorialT = 0; }
    } else if (this.tutorial === 3) {
      set('しらべたい ものに ちかづいて ボタンを おすか、ものを タップしよう');
      if (this.tutorialT > 8) { this.tutorial = 99; set(null); }
    }
  }

  private onKey(k: string) {
    if (this.ui.get().screen !== 'game') return;
    const ui = this.ui.get();
    if (k === 'Escape') {
      if (ui.dialogue) this.closeDialogue();
      else if (ui.shop) this.closeShop();
      else if (ui.panel) this.openPanel(null);
      else if (this.fishing.active) this.stopFishing();
      else this.openPanel('menu');
      return;
    }
    if (ui.dialogue) { if (k === 'Space' || k === 'Enter' || k === 'KeyE') this.chooseDialogue(0); return; }
    if (this.fishing.active) { if (k === 'Space' || k === 'KeyE') this.fishingTap(); return; }
    if (ui.panel || ui.shop) return;
    if (k === 'KeyE' || k === 'Enter') this.act();
    else if (k === 'Space') this.jump();
    else if (k === 'KeyC') this.toggleSneak();
    else if (k === 'KeyI') this.openPanel('inventory');
    else if (k === 'KeyM') this.openPanel('map');
  }

  private onResize() {
    this.w = window.innerWidth; this.h = window.innerHeight;
    this.renderer.resize(this.w, this.h);
    this.cam.resize(this.w, this.h);
  }
}
