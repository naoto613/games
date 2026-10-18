import { BOSSES, getArea } from '../../data/areas';
import { getItem } from '../../data/items';
import { DIRS, findAll, findPath, loadMap, tileAt, type Dir, type TileMap } from '../../domain/dungeon/DungeonEngine';
import type { MoveResult } from '../../application/Game';
import type { Reward } from '../../data/types';
import { playBgm, sfx } from '../../infrastructure/audio/Sound';
import type { App, Key, Screen } from '../App';
import { clear, h } from '../dom';
import { monsterSprite, needFlip } from '../gfx/monsters';
import { mkCanvas } from '../gfx/Pix';
import { bossAccent, personSprite, TILE, tileSprite, type Theme } from '../gfx/tiles';
import { startBattle } from './battle';
import { talkTo } from './town';
import { openFieldMenu, openParty } from './menus';
import { openDex } from './dex';
import { icon, itemIcon } from '../components/icons';
import { buildingAt, TOWN_BUILDINGS } from '../../data/town';
import { EVENT_BY_ID } from '../../data/events';
import { runEvent } from './events';
import { playStory } from './story';
import { openGate } from './gate';
import { displayName } from '../../domain/monster/MonsterFactory';
import { forestTexture, hash, treeImg, labelImg, minimapImg, objectShadow, objectSprite, renderGround, TT } from '../gfx/townArt';
import type { TownArt } from '../../data/towns/builder';
import { ART_THEMES, caveTexture, crystalImg, crystalPillarImg, dungeonGround, dungeonMinimap, drawGimmick, isWallCh, mushroomImg, pillarImg, rockFaceImg, waterfallImg, type ArtTheme } from '../gfx/dungeonArt';
import type { RoomTileMap } from '../../domain/dungeon/RoomGen';
import { overlaySprite } from '../gfx/tiles';

const miniCache = new WeakMap<TileMap, HTMLCanvasElement>();

/** 町の 地面（水の うごき 4まい）を おぼえておく */
const groundCache = new WeakMap<TownArt, HTMLCanvasElement[]>();
function groundFrames(art: TownArt) {
  let a = groundCache.get(art);
  if (!a) { a = [0, 1, 2, 3].map((f) => renderGround(art, f)); groundCache.set(art, a); }
  return a;
}
/** ゲーム内の 時計（あさ 6:00 から、2びょうで 1ぷん すすむ） */
export function clockText(playSec: number) {
  const m = (360 + Math.floor(playSec / 2)) % 1440, hh = Math.floor(m / 60), mm = m % 60;
  return `${hh < 12 ? 'AM' : 'PM'} ${String(hh % 12 || 12).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

let VW = 11;
let VH = 9;

export function rewardText(r: Reward): string {
  if (r.type === 'gold') return `${r.amount}ゴールド`;
  if (r.type === 'item') return `${getItem(r.itemId).name}${r.count > 1 ? `×${r.count}` : ''}`;
  return `ぼくじょうの ひろさ +${r.amount}`;
}

/** まち・旅の扉の中を歩く画面 */
export class FieldScreen implements Screen {
  el: HTMLElement;
  private cv: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  private hudL: HTMLElement;
  private hudR: HTMLElement;
  private strip: HTMLElement;
  private mini: HTMLElement;
  private miniCv: HTMLCanvasElement;
  private miniName: HTMLElement;
  private miniClock: HTMLElement;
  /** 地図タップで歩く道すじ */
  private path: Dir[] = [];
  private pathGoal: { x: number; y: number } | null = null;
  private held: Dir | null = null;
  private moving: { from: { x: number; y: number }; t0: number; dur: number } | null = null;
  private busy = false;
  private raf = 0;
  private frame = 0;
  private paused = false;
  private map!: TileMap;
  private dexBtn!: HTMLElement;
  private stepAnim = 0;

  constructor(private app: App) {
    [this.cv, this.g] = mkCanvas(VW * TILE, VH * TILE);
    this.hudL = h('div', { class: 'win hud' });
    this.hudR = h('div', { class: 'win hud right' });
    this.strip = h('div', { class: 'pstrip' });
    // 右上の ミニマップ（参考画像3：町の名前・地図・時計）
    this.miniCv = document.createElement('canvas');
    this.miniName = h('div', { class: 'mm-name' });
    this.miniClock = h('div', { class: 'mm-clock' });
    this.mini = h('div', { class: 'minimap' }, this.miniName, h('div', { class: 'mm-map' }, this.miniCv), this.miniClock);
    this.strip.addEventListener('click', (e) => { e.stopPropagation(); if (this.busy || this.moving) return; sfx('ok'); openParty(this.app, () => this.afterMenu(), { viewOnly: !this.inTown }); });
    const view = h('div', { class: 'view full' }, this.cv, this.hudL, this.hudR, this.mini, this.strip);
    this.buildTouch(view);
    this.reloadMap();
    this.el = h('div', { class: 'layer' }, view);
  }

  private get game() {
    return this.app.game!;
  }
  private get inTown() {
    return !this.game.state.expedition;
  }
  private get theme(): Theme {
    return this.inTown ? this.game.currentTownMap().theme : getArea(this.game.state.expedition!.areaId).theme;
  }
  private loadCurrentMap() {
    return this.inTown ? loadMap(this.game.currentTownMap().id) : this.game.currentMap()!;
  }
  private get pos() {
    return this.inTown ? this.game.state.player.townPos : this.game.state.expedition!.pos;
  }
  private get dir(): Dir {
    return this.inTown ? this.game.state.player.townDir : this.game.state.expedition!.dir;
  }

  /**
   * スマホ向けの そうさ（十字キーなし）:
   * ・タップ … そこまで あるく（人・たからばこ なら となりまで いって しらべる）
   * ・なぞる … ゆびを おいた ところに スティックが でて、なぞった ほうこうへ あるきつづける
   */
  private buildTouch(view: HTMLElement) {
    const knob = h('div', { class: 'knob' });
    // 参考画像2「UI・操作イメージ」：左下に 仮想スティックを いつも 表示（ゆびを おいた ところに うごいて なぞれる）
    const joy = h('div', { class: 'joy' }, knob);
    view.append(joy);
    let start: { x: number; y: number; id: number; t: number } | null = null;
    let dragging = false;
    const R = 34;
    const setJoy = (x: number, y: number, dx: number, dy: number) => {
      const r = view.getBoundingClientRect();
      joy.style.left = `${x - r.left}px`;
      joy.style.top = `${y - r.top}px`;
      const len = Math.hypot(dx, dy) || 1, k = Math.min(len, R) / len;
      knob.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
    };
    view.addEventListener('pointerdown', (e) => {
      if (start || (e.target as HTMLElement).closest('.pstrip, .fmenu, .fbtns')) return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId, t: performance.now() };
      dragging = false;
      view.setPointerCapture(e.pointerId);
    });
    view.addEventListener('pointermove', (e) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      const len = Math.hypot(dx, dy);
      if (!dragging && len < 14) return;
      if (!dragging) {
        dragging = true;
        this.path = []; this.pathGoal = null;
        joy.classList.add('on');
      }
      // スティックが にげないよう、ゆびが とおくまで いったら 中心を ひきよせる
      if (len > R * 1.8) { start.x = e.clientX - (dx / len) * R * 1.8; start.y = e.clientY - (dy / len) * R * 1.8; }
      setJoy(start.x, start.y, e.clientX - start.x, e.clientY - start.y);
      const ax = Math.abs(dx), ay = Math.abs(dy);
      // ななめ付近では いまの ほうこうを たもつ（ガタつかない）
      let d: Dir = ax > ay ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      if (this.held && Math.abs(ax - ay) < Math.max(ax, ay) * 0.25) d = this.held;
      this.held = d;
    });
    const end = (e: PointerEvent, cancel: boolean) => {
      if (!start || e.pointerId !== start.id) return;
      const wasDrag = dragging;
      start = null;
      dragging = false;
      joy.classList.remove('on');
      joy.style.left = ''; joy.style.top = '';
      knob.style.transform = '';
      this.held = null;
      if (!wasDrag && !cancel) this.tapMap(e);
    };
    view.addEventListener('pointerup', (e) => end(e, false));
    view.addEventListener('pointercancel', (e) => end(e, true));
    // 左下の 縦メニュー（参考画像3：メニュー／図鑑／パーティ／セーブ）
    const fb = (ic: string, label: string, fn: () => void) => {
      const b = h('button', { class: 'fmrow', type: 'button', 'aria-label': label }, icon(ic), h('span', null, label));
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', (e) => { e.stopPropagation(); if (this.busy || this.moving) return; sfx('ok'); this.held = null; fn(); });
      return b;
    };
    this.dexBtn = fb('dex', '図鑑', () => openDex(this.app));
    view.append(h('div', { class: 'fbtns' },
      fb('option', 'メニュー', () => openFieldMenu(this.app, () => this.afterMenu())),
      this.dexBtn,
      fb('monster', 'パーティ', () => openParty(this.app, () => this.afterMenu(), { viewOnly: !this.inTown })),
      fb('save', 'セーブ', () => void this.app.saveNow(true)),
    ));
  }

  /** 画面いっぱいに マップを ひろげる（たて長でも よこ長でも あまらないように 行数を きめる） */
  private fit() {
    const w = this.el.clientWidth || 390, hgt = this.el.clientHeight || 700;
    // 参考画像3 くらいの ひろさ：1タイル 30px ほどに なるよう よこの マス数を きめる（奇数）
    let cols = Math.max(11, Math.min(19, Math.round(w / 30)));
    if (cols % 2 === 0) cols--;
    const tilePx = w / cols;
    let rows = Math.ceil(hgt / tilePx);
    if (rows % 2 === 0) rows++;
    rows = Math.max(9, Math.min(27, rows));
    if (rows !== VH || cols !== VW || this.cv.height !== rows * TILE || this.cv.width !== cols * TILE) {
      VH = rows; VW = cols;
      this.cv.width = VW * TILE;
      this.cv.height = VH * TILE;
      this.g.imageSmoothingEnabled = false;
    }
  }

  enter() {
    window.addEventListener('resize', this.onResize);
    this.fit();
    this.reloadMap();
    playBgm(this.bgm());
    this.updateHud();
    // 戦闘の あとなどに たまった 物語を みせる
    void this.pendingStory();
    if (!this.game.state.progress.tutorialFlags.touchHint) {
      this.game.setTutorial('touchHint');
      this.app.toast('タップで いどう／なぞって あるく', 3200);
    }
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      if (this.paused) return;
      this.tick();
      this.draw();
    };
    loop();
  }
  private onResize = () => this.fit();
  private async pendingStory() {
    if (this.busy) return;
    this.busy = true;
    try {
      if (await playStory(this.app, this.game)) return;
      this.reloadMap();
    } finally { this.busy = false; this.updateHud(); }
  }
  leave() {
    window.removeEventListener('resize', this.onResize);
    cancelAnimationFrame(this.raf);
    this.held = null;
  }
  pause(p: boolean) {
    this.paused = p;
    if (p) this.held = null;
  }

  key(k: Key, down: boolean) {
    if (['up', 'down', 'left', 'right'].includes(k)) {
      if (down) this.held = k as Dir;
      else if (this.held === k) this.held = null;
      return;
    }
    if (!down || this.busy || this.moving) return;
    if (k === 'a') this.check();
    if (k === 'b' || k === 'menu') {
      sfx('ok');
      this.held = null;
      openFieldMenu(this.app, () => this.afterMenu());
    }
  }

  private bgm() {
    return this.inTown ? 'town' : this.game.floor?.floor.bossId ? 'bossroom' : 'field';
  }

  /** メニューから戻ったとき（かえりのはね などで場所が変わることがある） */
  afterMenu() {
    this.reloadMap();
    playBgm(this.bgm());
    this.updateHud();
  }

  updateHud() {
    const s = this.game.state;
    (this.dexBtn as HTMLButtonElement).disabled = !this.game.hasFeature('dex');
    const art = this.inTown ? this.game.currentTownMap().art : undefined;
    this.el.classList.toggle('arttown', !!art);
    const artDun = !this.inTown && ART_THEMES.includes(this.theme);
    this.el.classList.toggle('artdun', artDun);
    if (artDun) { this.miniName.textContent = `${this.game.floor!.index + 1}F`; this.miniClock.textContent = ''; }
    this.hudL.textContent = art ? `${s.player.gold} G` : this.inTown ? this.game.currentTownMap().name : this.game.floor!.floor.name;
    this.hudR.textContent = `${s.player.gold} G`;
    if (art) {
      this.miniName.textContent = this.game.currentTownMap().name;
      const mm = minimapImg(art, 4);
      this.miniCv.width = mm.width; this.miniCv.height = mm.height;
      this.miniClock.textContent = `☀ ${clockText(s.player.playTimeSec)}`;
    }
    clear(this.strip);
    for (const m of this.game.party) {
      const r = m.stats.hp ? m.hp / m.stats.hp : 0;
      this.strip.append(h('div', { class: `win pm${m.hp <= 0 ? ' dead' : ''}` },
        h('div', { style: 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis' }, displayName(m)),
        h('div', null, m.hp <= 0 ? 'たおれている' : `HP ${m.hp}`),
        h('div', { class: 'bar' }, h('i', { style: `width:${Math.round(r * 100)}%;${r < 0.3 ? 'background:var(--warn)' : ''}` }))));
    }
  }

  /** カメラ：ふつうは 主人公が まんなか。町（絵の ある 町）は 町の そとを なるべく みせない */
  private cam(px: number, py: number) {
    let camX = px - (VW - 1) / 2, camY = py - (VH - 1) / 2;
    if (!this.inTown && this.game.floor?.floor.bossId && this.map.h <= VH) camY = (this.map.h - VH) / 2;
    if (this.inTown && this.game.currentTownMap().art) {
      const fitAxis = (c: number, size: number, view: number) => (size <= view ? (size - view) / 2 : Math.max(0, Math.min(size - view, c)));
      camX = fitAxis(camX, this.map.w, VW); camY = fitAxis(camY, this.map.h, VH);
    }
    return { camX, camY };
  }

  /** 地図をタップ: そこまで歩く（人・宝箱などなら となりまで歩いて 話しかける） */
  private tapMap(e: PointerEvent) {
    if (this.busy || this.moving || this.app.panels.length) return;
    const rect = this.cv.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * this.cv.width, cy = ((e.clientY - rect.top) / rect.height) * this.cv.height;
    const { camX, camY } = this.cam(this.pos.x, this.pos.y);
    const tx = Math.floor(camX + cx / TILE), ty = Math.floor(camY + cy / TILE);
    if (tx === this.pos.x && ty === this.pos.y) return void this.key('a', true);
    const path = findPath(this.map, this.pos, { x: tx, y: ty });
    if (!path) return;
    this.path = path;
    this.pathGoal = { x: tx, y: ty };
    sfx('cursor');
  }

  /** A ボタン: 向いている先を調べる */
  private async check() {
    const [dx, dy] = DIRS[this.dir];
    const t = tileAt(this.map, this.pos.x + dx, this.pos.y + dy);
    if (t === '#' || t === 'T' || t === 'W' || t === 'R' || t === '~') {
      return;
    }
    if (/[0-9CHBFGVZ]/.test(t)) {
      const r = this.inTown ? this.game.townMove(this.dir) : this.game.move(this.dir);
      await this.handle(r);
    }
  }

  private tick() {
    this.frame++;
    if (this.moving) {
      const t = (performance.now() - this.moving.t0) / this.moving.dur;
      if (t >= 1) {
        this.moving = null;
        this.afterStep();
      }
      return;
    }
    if (this.busy || this.app.panels.length) return;
    if (this.held) { this.path = []; this.pathGoal = null; this.step(this.held); return; }
    const d = this.path.shift();
    if (d) this.step(d);
    else this.pathGoal = null;
  }

  // 主人公の うしろを ついてくる なかま（ドラクエ式）
  private trail: { x: number; y: number }[] = [];
  private prevTrail: { x: number; y: number }[] = [];
  private reloadMap() {
    this.map = this.loadCurrentMap();
    this.trail = [0, 1, 2].map(() => ({ ...this.pos }));
    this.prevTrail = this.trail.map((p) => ({ ...p }));
  }

  private pendingResult: MoveResult | null = null;
  private step(dir: Dir) {
    const from = { ...this.pos };
    const r = this.inTown ? this.game.townMove(dir) : this.game.move(dir);
    if (r.kind === 'moved' || r.kind === 'stairs' || r.kind === 'exit') {
      this.stepAnim++;
      if (this.trail.length !== 3) this.trail = [0, 1, 2].map(() => ({ ...from }));
      this.prevTrail = this.trail.map((p) => ({ ...p }));
      this.trail = [from, ...this.trail].slice(0, 3);
      this.moving = { from, t0: performance.now(), dur: this.app.settings.reduceMotion ? 1 : 150 };
      this.pendingResult = r;
      return;
    }
    if (r.kind === 'warp') {
      this.held = null;
      this.path = [];
      this.handle(r);
      return;
    }
    if (r.kind === 'blocked') {
      if (this.frame % 20 === 0) sfx('bump');
      this.path = [];
      return;
    }
    this.held = null;
    this.path = [];
    this.handle(r);
  }

  private afterStep() {
    const r = this.pendingResult;
    this.pendingResult = null;
    if (r && (r.kind !== 'moved' || r.encounter)) this.handle(r);
  }

  private async handle(r: MoveResult) {
    this.busy = true;
    this.held = null;
    this.path = [];
    this.pathGoal = null;
    try {
      switch (r.kind) {
        case 'npc':
          await talkTo(this.app, r.id, this);
          break;
        case 'warp':
          sfx('stairs');
          await this.fade(() => { this.reloadMap(); });
          playBgm(this.bgm());
          if (await playStory(this.app, this.game)) return;
          break;
        case 'locked':
          sfx('bump');
          await this.app.say(r.text);
          break;
        case 'gate': {
          if (!r.areaIds.length) { await this.app.say(r.closed ?? 'とびらは しずかに うずまいている。まだ むこうへは いけないようだ…。'); break; }
          const pick = await new Promise<string | null>((res) => openGate(this.app, r.areaIds, (id) => res(id), () => res(null)));
          if (!pick) break;
          const ok = this.game.canStartExpedition(pick);
          if (!ok.ok) { await this.app.say(ok.error); break; }
          sfx('stairs');
          await this.fade(() => { this.game.startExpedition(pick); this.reloadMap(); });
          playBgm(this.bgm());
          this.app.toast(this.game.floor!.floor.name);
          if (await playStory(this.app, this.game)) return;
          break;
        }
        case 'spot':
          if (!this.game.inspect(r.target)) {
            const luna = this.game.lunaSays('emblem');
            await this.app.say(luna ?? 'ふるい 石碑が しずかに たっている。');
          } else {
            sfx('discover');
            if (await playStory(this.app, this.game)) return;
          }
          break;
        case 'storyEvent':
          if (!this.game.inspect(r.id)) await this.app.say('ここには もう なにも ないようだ。');
          else {
            sfx('discover');
            if (await playStory(this.app, this.game)) return;
          }
          break;
        case 'stageClear': {
          const area = this.game.floor!.area;
          if (!(await this.app.confirm(`${area.name}の 出口だ。\nリーフェルへ もどりますか？`))) break;
          await this.fade(() => { this.game.finishStage(); this.reloadMap(); });
          playBgm('town');
          sfx('levelup');
          await this.app.say(`${area.name}を ぬけた！`);
          if (await playStory(this.app, this.game)) return;
          break;
        }
        case 'event':
          await runEvent(this.app, this.game, r.eventId, () => { this.map = this.loadCurrentMap(); });
          break;
        case 'moved':
          if (r.poison) { sfx('bump'); this.app.toast('どくの はなを ふんだ！', 900); }
          if (r.encounter) {
            sfx('encounter');
            await this.flash();
            startBattle(this.app, this.game.startWildBattle(r.encounter));
            return;
          }
          break;
        case 'chest':
          if (!r.reward) await this.app.say('たからばこは からっぽだ。');
          else {
            sfx('chest');
            const rw = r.reward;
            await this.app.say(`たからばこを みつけた！\n「${rewardText(rw)}」を てにいれた！`, { icon: itemIcon(rw.type === 'item' ? getItem(rw.itemId).category : rw.type === 'gold' ? 'gold' : 'key') });
          }
          break;
        case 'spring':
          if (r.used) await this.app.say('いずみの ひかりは よわまっている…。');
          else {
            sfx('heal');
            await this.app.say('いやしの いずみだ！\nパーティの HPと MPが かいふくした！');
          }
          break;
        case 'stairs':
          sfx('stairs');
          await this.fade(() => {
            this.game.descend();
            this.reloadMap();
          });
          playBgm(this.bgm());
          this.app.toast(this.game.floor!.floor.name);
          if (await playStory(this.app, this.game)) return;
          break;
        case 'exit':
          if (await this.app.confirm(`${this.game.currentTownMap().name}へ もどりますか？`)) {
            await this.fade(() => {
              this.game.leaveExpedition();
              this.reloadMap();
            });
            playBgm('town');
          }
          break;
        case 'boss': {
          const boss = BOSSES[r.bossId];
          await this.app.say(boss.intro);
          sfx('encounter');
          await this.flash();
          startBattle(this.app, this.game.startBossBattle(boss.id));
          return;
        }
      }
    } finally {
      this.busy = false;
      this.updateHud();
    }
  }

  private async flash() {
    if (this.app.settings.reduceMotion) return;
    const v = this.cv.parentElement!;
    for (let i = 0; i < 3; i++) {
      v.style.filter = 'invert(1)';
      await new Promise((r) => setTimeout(r, 70));
      v.style.filter = '';
      await new Promise((r) => setTimeout(r, 70));
    }
  }
  private async fade(mid: () => void) {
    const v = this.cv;
    if (!this.app.settings.reduceMotion) {
      v.style.transition = 'opacity .25s';
      v.style.opacity = '0';
      await new Promise((r) => setTimeout(r, 260));
    }
    mid();
    this.updateHud();
    v.style.opacity = '1';
    await new Promise((r) => setTimeout(r, 200));
  }

  /** まちの えんとつの けむり・しんでんの きらめき */
  private drawTownFx(g: CanvasRenderingContext2D, camX: number, camY: number) {
    if (this.app.settings.reduceMotion) return;
    const t = this.frame;
    for (const b of TOWN_BUILDINGS[this.game.currentTownMap().id] ?? []) {
      if (b.style === 'lab' || b.style === 'ranch') {
        const cx = b.x0 + (b.style === 'lab' ? b.x1 - b.x0 - 1 : 1);
        const bx = (cx - camX) * TILE + TILE * 0.68, by = (b.y0 - camY) * TILE;
        for (let i = 0; i < 4; i++) {
          const k = ((t + i * 22) % 88) / 88;
          g.fillStyle = `rgba(240,240,250,${0.55 * (1 - k)})`;
          g.beginPath(); g.arc(bx + Math.sin(k * 5 + i) * 4 + k * 8, by - k * 34, 3 + k * 5, 0, Math.PI * 2); g.fill();
        }
      } else if (b.style === 'shrine') {
        const bx = (b.door - camX) * TILE + TILE / 2, by = (b.y0 - camY) * TILE + 6;
        for (let i = 0; i < 5; i++) {
          const k = ((t + i * 19) % 95) / 95, a = i * 1.7;
          g.fillStyle = `rgba(200,240,255,${0.9 * Math.sin(k * Math.PI)})`;
          g.fillRect(Math.round(bx + Math.cos(a) * (8 + k * 14)), Math.round(by - k * 26 + Math.sin(a) * 4), 2, 2);
        }
      }
    }
  }

  // 牧場で あずけている モンスターが うろうろする（見た目だけ）
  private roam = new Map<string, { x: number; y: number; tx: number; ty: number; t: number; flip: boolean }>();
  private drawRanchMonsters(g: CanvasRenderingContext2D, camX: number, camY: number) {
    const def = this.game.currentTownMap();
    const others = this.game.state.monsters.filter((m) => !this.game.state.partyIds.includes(m.id));
    const list = def.id === 'ranch1' ? others.slice(0, 6) : others.slice(6, 18);
    const free = findAll(this.map, ',');
    list.forEach((m, i) => {
      let r = this.roam.get(m.id + def.id);
      if (!r) {
        const p0 = free[(i * 37 + 11) % free.length];
        r = { x: p0.x, y: p0.y, tx: p0.x, ty: p0.y, t: (i * 53) % 120, flip: false };
        this.roam.set(m.id + def.id, r);
      }
      r.t++;
      if (r.t % 150 === 0) {
        const n = free[Math.floor(Math.random() * free.length)];
        if (Math.abs(n.x - r.x) + Math.abs(n.y - r.y) <= 3) { r.tx = n.x; r.ty = n.y; }
      }
      const dx = r.tx - r.x, dy = r.ty - r.y;
      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) { r.x += Math.sign(dx) * Math.min(Math.abs(dx), 0.02); r.y += Math.sign(dy) * Math.min(Math.abs(dy), 0.02); if (dx) r.flip = dx > 0; }
      const sx = Math.round((r.x - camX) * TILE), sy = Math.round((r.y - camY) * TILE);
      const hop = Math.abs(dx) + Math.abs(dy) > 0.01 ? Math.abs(Math.sin(r.t / 5)) * 3 : 0;
      g.fillStyle = 'rgba(0,0,0,.25)';
      g.beginPath(); g.ellipse(sx + 16, sy + 29, 11, 4, 0, 0, Math.PI * 2); g.fill();
      const sp = monsterSprite(m.speciesId, { small: true });
      g.save();
      if (needFlip(m.speciesId, r.flip)) { g.translate(sx + 34, 0); g.scale(-1, 1); g.drawImage(sp, 0, sy - 10 - hop, 36, 36); }
      else g.drawImage(sp, sx - 2, sy - 10 - hop, 36, 36);
      g.restore();
    });
  }

  /** しゅじんこう と ついてくる なかま（y は タイル単位） */
  private heroActors(px: number, py: number, camX: number, camY: number, shadow: (sx: number, sy: number, w?: number) => void) {
    const g = this.g;
    const walk = this.moving ? Math.floor(this.frame / 6) : 0;
    const hx = Math.round((px - camX) * TILE), hy = Math.round((py - camY) * TILE);
    const t = this.moving ? Math.min(1, (performance.now() - this.moving.t0) / this.moving.dur) : 1;
    const followers = this.game.party.filter((m) => m.hp > 0).slice(0, 3);
    const actors: { y: number; draw: () => void }[] = [{ y: py, draw: () => { shadow(hx, hy); g.drawImage(personSprite('hero', this.dir, walk), hx, hy - 10); } }];
    followers.forEach((m, i) => {
      const to = this.trail[i] ?? this.pos, fr = this.moving ? (this.prevTrail[i] ?? to) : to;
      const fx = fr.x + (to.x - fr.x) * t, fy = fr.y + (to.y - fr.y) * t;
      const mx = Math.round((fx - camX) * TILE), my = Math.round((fy - camY) * TILE);
      const movingNow = this.moving && (fr.x !== to.x || fr.y !== to.y);
      const hop = movingNow && !this.app.settings.reduceMotion ? Math.round(Math.abs(Math.sin(t * Math.PI)) * 3) : 0;
      const faceRight = (to.x > fr.x) || (!movingNow && this.dir === 'right');
      actors.push({ y: fy - 0.01 * (i + 1), draw: () => {
        shadow(mx, my, 10);
        const sp = monsterSprite(m.speciesId, { small: true });
        g.save();
        if (needFlip(m.speciesId, faceRight)) { g.translate(mx + TILE, 0); g.scale(-1, 1); g.drawImage(sp, -2, my - 8 - hop, 36, 36); }
        else g.drawImage(sp, mx - 2, my - 8 - hop, 36, 36);
        g.restore();
      } });
    });
    return { actors, hx, hy };
  }

  /** 参考画像3「町の画面」の 描き方：地面 → 奥行きじゅんに 物体と 人 → 建物の 名前 */
  private drawArtTown(art: TownArt, px: number, py: number, camX: number, camY: number) {
    const g = this.g, W = this.cv.width, H = this.cv.height;
    const ox = Math.round(-camX * TILE), oy = Math.round(-camY * TILE);
    // 町の そと（森）
    const pat = g.createPattern(forestTexture(), 'repeat');
    if (pat) { g.save(); g.translate(ox % 64, oy % 64); g.fillStyle = pat; g.fillRect(-64, -64, W + 128, H + 128); g.restore(); }
    const still = this.app.settings.reduceMotion;
    const gf = groundFrames(art)[still ? 0 : Math.floor(this.frame / 16) % 4];
    g.drawImage(gf, ox, oy);
    const shadow = (sx: number, sy: number, w = 11) => {
      g.fillStyle = 'rgba(0,0,0,.28)';
      g.beginPath(); g.ellipse(sx + TILE / 2, sy + TILE - 3, w, 4, 0, 0, Math.PI * 2); g.fill();
    };
    const items: { base: number; draw: () => void }[] = [];
    const vx0 = -ox - 4 * TT, vx1 = -ox + W + 4 * TT, vy0 = -oy - 3 * TT, vy1 = -oy + H + 6 * TT;
    for (const o of art.objects) {
      const wx = o.x * TT, wy = o.y * TT;
      if (wx < vx0 - 8 * TT || wx > vx1 || wy < vy0 - 6 * TT || wy > vy1) continue;
      const sp = objectSprite(o, still ? 0 : this.frame);
      if (!sp) continue;
      objectShadow(g, o, wx + ox, wy + oy);
      items.push({ base: sp.base, draw: () => g.drawImage(sp.img, sp.dx + ox, sp.dy + oy) });
    }
    const def = this.game.currentTownMap();
    const anim = Math.floor(this.frame / 10);
    for (const [ch, npc] of Object.entries(def.npcs)) {
      for (const p of findAll(this.map, ch)) {
        const sx = Math.round((p.x - camX) * TILE), sy = Math.round((p.y - camY) * TILE);
        items.push({ base: (p.y + 1) * TT - 3, draw: () => { shadow(sx, sy); g.drawImage(personSprite(npc.look, npc.facing ?? 'down', npc.idle ? anim : 0), sx, sy - 10); } });
      }
    }
    const { actors } = this.heroActors(px, py, camX, camY, shadow);
    for (const a of actors) items.push({ base: (a.y + 1) * TT - 3, draw: a.draw });
    if (this.pathGoal && Math.floor(this.frame / 8) % 2 === 0) {
      const gx = Math.round((this.pathGoal.x - camX) * TILE), gy = Math.round((this.pathGoal.y - camY) * TILE);
      g.strokeStyle = '#ffe070'; g.lineWidth = 2; g.strokeRect(gx + 3, gy + 3, TILE - 6, TILE - 6);
    }
    items.sort((a, b) => a.base - b.base).forEach((it) => it.draw());
    // 建物の 名前（青い ふだ）
    for (const o of art.objects) {
      if (o.kind !== 'building' || !o.label) continue;
      const lb = labelImg(o.label);
      const cx = (o.x + o.w / 2) * TT + ox, ly = (o.y + o.h) * TT + oy - TT - lb.height + 4;
      g.drawImage(lb, Math.round(cx - lb.width / 2), Math.round(ly - TT * 0.6));
    }
    // ミニマップ（右上）
    const mg = this.miniCv.getContext('2d');
    if (mg) {
      const mm = minimapImg(art, 4);
      mg.drawImage(mm, 0, 0);
      if (Math.floor(this.frame / 15) % 2 === 0) { mg.fillStyle = '#ff3b3b'; mg.fillRect(this.pos.x * 4 - 1, this.pos.y * 4 - 1, 6, 6); mg.fillStyle = '#fff'; mg.fillRect(this.pos.x * 4, this.pos.y * 4, 4, 4); }
      if (this.frame % 30 === 0) this.miniClock.textContent = `☀ ${clockText(this.game.state.player.playTimeSec)}`;
    }
  }

  /** 森の ダンジョン（参考画像3「ダンジョンの画面」）：地面 → ギミック → 木と 宝箱と 人を 奥行きじゅんに → ミニマップ */
  private drawArtDungeon(theme: ArtTheme, px: number, py: number, camX: number, camY: number) {
    const g = this.g, W = this.cv.width, H = this.cv.height, m = this.map;
    const ex = this.game.state.expedition!;
    const cave = theme === 'cave';
    const ox = Math.round(-camX * TILE), oy = Math.round(-camY * TILE);
    if (cave) {
      const pat = g.createPattern(caveTexture(), 'repeat');
      if (pat) { g.save(); g.translate(ox % 96, oy % 96); g.fillStyle = pat; g.fillRect(-96, -96, W + 192, H + 192); g.restore(); }
    }
    else {
      const pat = g.createPattern(forestTexture(), 'repeat');
      if (pat) { g.save(); g.translate(ox % 64, oy % 64); g.fillStyle = pat; g.fillRect(-64, -64, W + 128, H + 128); g.restore(); }
      g.fillStyle = 'rgba(12,34,14,.4)'; g.fillRect(0, 0, W, H);
    }
    const still = this.app.settings.reduceMotion;
    const bossId = this.game.floor?.floor.bossId;
    g.drawImage(dungeonGround(m, theme, !!bossId)[still ? 0 : Math.floor(this.frame / 16) % 4], ox, oy);
    const x0 = Math.floor(camX) - 2, y0 = Math.floor(camY) - 1, x1 = x0 + VW + 4, y1 = y0 + VH + 4;
    const gm = (m as RoomTileMap).gimmicks;
    const opened = ex.switches ?? [];
    if (gm) for (const [k, v] of Object.entries(gm)) {
      const [gx, gy] = k.split(',').map(Number);
      if (gx < x0 || gx > x1 || gy < y0 || gy > y1) continue;
      drawGimmick(g, v, gx * TT + ox, gy * TT + oy, still ? 0 : this.frame, opened);
    }
    const shadow = (sx: number, sy: number, w = 11) => {
      g.fillStyle = 'rgba(0,0,0,.28)';
      g.beginPath(); g.ellipse(sx + TILE / 2, sy + TILE - 3, w, 4, 0, 0, Math.PI * 2); g.fill();
    };
    const items: { base: number; draw: () => void }[] = [];
    const anim = still ? 0 : Math.floor(this.frame / 10);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (x < 0 || y < 0 || x >= m.w || y >= m.h) continue;
      const ch = m.tiles[y][x];
      const sx = x * TT + ox, sy = y * TT + oy;
      if (isWallCh(ch) && cave) {
        // 洞窟：手前の かべは 岩の がけ。ときどき 水晶、下が 水なら 滝（参考画像3）
        const below = y + 1 < m.h ? m.tiles[y + 1][x] : '#';
        const front = !isWallCh(below);
        if (!front && ch !== 'Z') continue;
        const v = Math.floor(hash(x, y, 5) * 4);
        const crystal = front && below !== '~' && hash(x, y, 8) < 0.22;
        items.push({ base: (y + 1) * TT - 4, draw: () => {
          if (front) g.drawImage(rockFaceImg(v), sx - 2, sy + 32 - 44);
          if (below === '~') g.drawImage(waterfallImg(still ? 0 : Math.floor(this.frame / 4)), sx, sy + 32 - 40);
          if (crystal) g.drawImage(crystalImg(v, still ? 0 : Math.floor(this.frame / 8) + x), sx - 8, sy + 32 - 60);
          if (ch === 'Z') { const ov = overlaySprite('cave', 'Z', x, y, anim); if (ov) g.drawImage(ov, sx, sy); }
        } });
        continue;
      }
      if (isWallCh(ch)) {
        // 手前（下が 道）の かべだけ 1本の 木として 立たせる。おくは 地面の 葉の かたまり
        const front = y + 1 < m.h && !isWallCh(m.tiles[y + 1][x]);
        if (!front && ch !== 'Z') continue;
        const img = treeImg(Math.floor(hash(x, y, 5) * 4));
        const jx = Math.round((hash(x, y, 6) - 0.5) * 6);
        items.push({ base: (y + 1) * TT - 4, draw: () => {
          if (front) g.drawImage(img, sx + 16 - 21 + jx, sy + 32 - 56, 42, 56);
          if (ch === 'Z') { const ov = overlaySprite('forest', 'Z', x, y, anim); if (ov) g.drawImage(ov, sx, sy); }
        } });
        continue;
      }
      if (ch === 'I') { items.push({ base: (y + 1) * TT - 4, draw: () => (cave ? g.drawImage(crystalPillarImg(), sx, sy + 32 - 76) : g.drawImage(pillarImg(), sx, sy + 32 - 72)) }); continue; }
      if (ch === 'f') {
        const fr = still ? 0 : Math.floor(this.frame / 6);
        items.push({ base: (y + 1) * TT - 6, draw: () => (cave ? g.drawImage(crystalImg(x + y, fr), sx - 8, sy + 32 - 60) : g.drawImage(mushroomImg(fr), sx - 8, sy - 12)) });
        continue;
      }
      if (ch === 'B' && bossId) {
        const sp = monsterSprite(BOSSES[bossId].enemies.find((e) => e.distorted)?.speciesId ?? 'kinoborg', { distorted: true });
        items.push({ base: (y + 1) * TT - 2, draw: () => {
          const bob = still ? 0 : Math.round(Math.sin(this.frame / 12) * 1.5);
          const pulse = 0.5 + 0.5 * Math.sin(this.frame / 14);
          const aura = g.createRadialGradient(sx + 16, sy + 10, 4, sx + 16, sy + 10, 52 + pulse * 6);
          aura.addColorStop(0, 'rgba(170,90,230,.55)'); aura.addColorStop(1, 'rgba(170,90,230,0)');
          g.fillStyle = aura; g.fillRect(sx - 48, sy - 56, 128, 128);
          shadow(sx, sy, 20);
          g.imageSmoothingEnabled = true;
          g.drawImage(sp, sx - 20, sy - 40 + bob, 72, 72);
          g.imageSmoothingEnabled = false;
        } });
        continue;
      }
      if (ch === 'V' && cave) {
        // 洞窟の しらべる ところ：ひかる 水たまりと 水晶（森の きりかぶの かわり）
        const fr = still ? 0 : Math.floor(this.frame / 8);
        items.push({ base: (y + 1) * TT - 6, draw: () => {
          const pulse = 0.5 + 0.5 * Math.sin(this.frame / 12);
          g.fillStyle = `rgba(120,220,255,${0.35 + 0.25 * pulse})`; g.beginPath(); g.ellipse(sx + 16, sy + 24, 14, 6, 0, 0, Math.PI * 2); g.fill();
          g.drawImage(crystalImg(2, fr), sx - 8, sy + 32 - 64);
          if (!still && Math.floor(this.frame / 10) % 3 === 0) { g.fillStyle = '#ffffff'; g.fillRect(sx + 22, sy + 4, 2, 2); g.fillRect(sx + 6, sy + 12, 2, 2); }
        } });
        continue;
      }
      if ('CH>EV'.includes(ch)) {
        const ov = overlaySprite(theme, ch, x, y, anim, { open: ch === 'C' && this.game.isOpened({ x, y }), used: ch === 'H' && !!ex.springUsed, ev: ch === 'V' ? EVENT_BY_ID[m.events?.[`${x},${y}`] ?? '']?.kind : undefined });
        if (ov) items.push({ base: (y + 1) * TT - 6, draw: () => { if (ch === 'C' || ch === 'V') shadow(sx, sy, 12); g.drawImage(ov, sx, sy); } });
      }
    }
    const { actors } = this.heroActors(px, py, camX, camY, shadow);
    for (const a of actors) items.push({ base: (a.y + 1) * TT - 3, draw: a.draw });
    if (this.pathGoal && Math.floor(this.frame / 8) % 2 === 0) {
      const gx = Math.round((this.pathGoal.x - camX) * TILE), gy = Math.round((this.pathGoal.y - camY) * TILE);
      g.strokeStyle = '#ffe070'; g.lineWidth = 2; g.strokeRect(gx + 3, gy + 3, TILE - 6, TILE - 6);
    }
    items.sort((a, b) => a.base - b.base).forEach((it) => it.draw());
    // こもれび（森）／くらがりと 水晶の ひかり（洞窟）
    if (cave) {
      const hx = (px - camX) * TILE + TILE / 2, hy = (py - camY) * TILE + TILE / 2;
      const rg = g.createRadialGradient(hx, hy, TILE * 2.5, hx, hy, TILE * 8);
      rg.addColorStop(0, 'rgba(4,10,30,0)'); rg.addColorStop(1, 'rgba(4,10,30,.38)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
      if (!still) { g.fillStyle = 'rgba(160,220,255,.5)'; for (let i = 0; i < 10; i++) { const t = (this.frame * 0.3 + i * 37) % H; g.fillRect((i * 97 + Math.sin((this.frame + i * 20) / 30) * 10) % W, H - t, 1, 2); } }
    } else if (!still) {
      g.fillStyle = 'rgba(255,250,200,.06)';
      for (let i = 0; i < 3; i++) { const bx = ((i * 140 + this.frame * 0.2) % (W + 200)) - 100; g.beginPath(); g.moveTo(bx, 0); g.lineTo(bx + 40, 0); g.lineTo(bx - 60, H); g.lineTo(bx - 100, H); g.fill(); }
    }
    if (bossId) {
      const rg = g.createRadialGradient(W / 2, H / 2, TILE * 3, W / 2, H / 2, TILE * 10);
      rg.addColorStop(0, 'rgba(8,16,10,0)'); rg.addColorStop(1, cave ? 'rgba(4,8,24,.55)' : 'rgba(8,16,10,.55)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }
    this.drawMiniDungeon();
  }

  private drawMiniDungeon() {
    const mg = this.miniCv.getContext('2d');
    if (!mg) return;
    let mm = miniCache.get(this.map);
    if (!mm) { mm = dungeonMinimap(this.map, 3); miniCache.set(this.map, mm); }
    if (this.miniCv.width !== mm.width || this.miniCv.height !== mm.height) { this.miniCv.width = mm.width; this.miniCv.height = mm.height; }
    mg.drawImage(mm, 0, 0);
    if (Math.floor(this.frame / 15) % 2 === 0) { mg.fillStyle = '#ff3b3b'; mg.fillRect(this.pos.x * 3 - 1, this.pos.y * 3 - 1, 5, 5); mg.fillStyle = '#fff'; mg.fillRect(this.pos.x * 3, this.pos.y * 3, 3, 3); }
  }

  // ---------------------------------------------------------------- 描画（状態は読むだけ）
  private draw() {
    const g = this.g;
    const anim = Math.floor(this.frame / 10);
    let px = this.pos.x, py = this.pos.y;
    if (this.moving) {
      const t = Math.min(1, (performance.now() - this.moving.t0) / this.moving.dur);
      px = this.moving.from.x + (this.pos.x - this.moving.from.x) * t;
      py = this.moving.from.y + (this.pos.y - this.moving.from.y) * t;
    }
    const bossRoom = !!this.game.floor?.floor.bossId;
    const { camX, camY } = this.cam(px, py);
    // ボスの へやは ぜんたいが みえるように まんなかに おく
    g.fillStyle = '#000';
    g.fillRect(0, 0, this.cv.width, this.cv.height);
    const art = !this.game.state.expedition ? this.game.currentTownMap().art : undefined;
    if (art) return this.drawArtTown(art, px, py, camX, camY);
    if (this.game.state.expedition && ART_THEMES.includes(this.theme)) return this.drawArtDungeon(this.theme as ArtTheme, px, py, camX, camY);
    const th = this.theme;
    const x0 = Math.floor(camX) - 1, y0 = Math.floor(camY) - 1;
    const ex = this.game.state.expedition;
    for (let y = y0; y <= y0 + VH + 1; y++)
      for (let x = x0; x <= x0 + VW + 1; x++) {
        if ((th !== 'town' && !ex || bossRoom) && (x < 0 || y < 0 || x >= this.map.w || y >= this.map.h)) continue; // へやの そとは まっくら
        let ch = tileAt(this.map, x, y);
        if (th === 'town' && /[0-9]/.test(ch)) ch = tileAt(this.map, x, y - 1) === 'W' ? 'K' : '.';
        if (ch === 'B') ch = '.';
        const b = th === 'town' ? buildingAt(this.game.currentTownMap().id, x, y) : undefined;
        const bld = b && 'RWD'.includes(ch) ? { style: b.style, rel: x - b.x0, w: b.x1 - b.x0 + 1, sign: ch === 'R' && x === b.door } : undefined;
        const state = { open: ch === 'C' && this.game.isOpened({ x, y }), used: ch === 'H' && !!ex?.springUsed, boss: bossRoom, bld, ev: ch === 'V' || ch === 'Z' ? EVENT_BY_ID[this.map.events?.[`${x},${y}`] ?? '']?.kind : undefined };
        g.drawImage(tileSprite(th, ch, x, y, anim, state), Math.round((x - camX) * TILE), Math.round((y - camY) * TILE));
      }
    if (th === 'town') this.drawTownFx(g, camX, camY);
    const shadow = (sx: number, sy: number, w = 11) => {
      g.fillStyle = 'rgba(0,0,0,.28)';
      g.beginPath();
      g.ellipse(sx + TILE / 2, sy + TILE - 3, w, 4, 0, 0, Math.PI * 2);
      g.fill();
    };
    // ボス
    for (const b of findAll(this.map, 'B')) {
      const bossId = this.game.floor?.floor.bossId;
      if (!bossId) continue;
      const sp = monsterSprite(BOSSES[bossId].enemies.find((e) => e.distorted)?.speciesId ?? 'kinoborg', { distorted: true });
      const bob = Math.round(Math.sin(this.frame / 12) * 1.5);
      const bx = Math.round((b.x - camX) * TILE), by = Math.round((b.y - camY) * TILE);
      const pulse = 0.5 + 0.5 * Math.sin(this.frame / 14);
      const acc = bossAccent(th);
      const aura = g.createRadialGradient(bx + 16, by + 18, 4, bx + 16, by + 18, 48 + pulse * 6);
      aura.addColorStop(0, acc + 'aa'); aura.addColorStop(1, acc + '00');
      g.fillStyle = aura; g.fillRect(bx - 40, by - 40, 112, 112);
      shadow(bx, by, 16);
      g.imageSmoothingEnabled = true;
      g.drawImage(sp, bx - 12, by - 22 + bob, 56, 56);
      g.imageSmoothingEnabled = false;
    }
    // まちの人
    if (!ex) {
      const def = this.game.currentTownMap();
      if (def.theme === 'ranch') this.drawRanchMonsters(g, camX, camY);
      for (const [ch, npc] of Object.entries(def.npcs)) {
        for (const p of findAll(this.map, ch)) {
          const facing = npc.facing ?? 'down';
          const sx = Math.round((p.x - camX) * TILE), sy = Math.round((p.y - camY) * TILE);
          if (!['W', 'K', 'L'].includes(tileAt(this.map, p.x, p.y - 1))) shadow(sx, sy);
          g.drawImage(personSprite(npc.look, facing, npc.idle ? anim : 0), sx, sy - 10);
        }
      }
    }
    if (this.pathGoal && Math.floor(this.frame / 8) % 2 === 0) {
      const gx = Math.round((this.pathGoal.x - camX) * TILE), gy = Math.round((this.pathGoal.y - camY) * TILE);
      g.strokeStyle = '#ffe070'; g.lineWidth = 2; g.strokeRect(gx + 3, gy + 3, TILE - 6, TILE - 6);
    }
    const { actors, hx, hy } = this.heroActors(px, py, camX, camY, shadow);
    actors.sort((a, b) => a.y - b.y).forEach((a) => a.draw());
    // どうくつは 暗く、まわりだけ明るく
    if (bossRoom) {
      // ボスの へや: ふちが くらく、ボスの いる おくが ぼうっと あかるい
      const rg = g.createRadialGradient(this.cv.width / 2, this.cv.height / 2, TILE * 3, this.cv.width / 2, this.cv.height / 2, TILE * 9);
      rg.addColorStop(0, 'rgba(8,4,16,0)');
      rg.addColorStop(1, 'rgba(8,4,16,.6)');
      g.fillStyle = rg;
      g.fillRect(0, 0, this.cv.width, this.cv.height);
    } else if (th === 'cave') {
      const cx = hx + TILE / 2, cy = hy + TILE / 2;
      const rg = g.createRadialGradient(cx, cy, TILE * 1.5, cx, cy, TILE * 6);
      rg.addColorStop(0, 'rgba(10,6,20,0)');
      rg.addColorStop(1, 'rgba(10,6,20,.72)');
      g.fillStyle = rg;
      g.fillRect(0, 0, this.cv.width, this.cv.height);
    }
  }
}
