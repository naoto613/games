import { BOSSES, getArea } from '../../data/areas';
import { getItem } from '../../data/items';
import { DIRS, findAll, findPath, loadMap, tileAt, type Dir, type TileMap } from '../../domain/dungeon/DungeonEngine';
import type { MoveResult } from '../../application/Game';
import type { Reward } from '../../data/types';
import { playBgm, sfx } from '../../infrastructure/audio/Sound';
import type { App, Key, Screen } from '../App';
import { clear, h } from '../dom';
import { monsterSprite } from '../gfx/monsters';
import { mkCanvas } from '../gfx/Pix';
import { personSprite, TILE, tileSprite, type Theme } from '../gfx/tiles';
import { startBattle } from './battle';
import { talkTo, TOWN_NPCS } from './town';
import { openFieldMenu, openParty } from './menus';
import { displayName } from '../../domain/monster/MonsterFactory';

const VW = 11;
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
  /** 地図タップで歩く道すじ */
  private path: Dir[] = [];
  private pathGoal: { x: number; y: number } | null = null;
  private held: Dir | null = null;
  private moving: { from: { x: number; y: number }; t0: number; dur: number } | null = null;
  private busy = false;
  private raf = 0;
  private frame = 0;
  private paused = false;
  private map: TileMap;
  private stepAnim = 0;
  private dpadKeys: Record<Dir, HTMLElement> = {} as Record<Dir, HTMLElement>;

  constructor(private app: App) {
    [this.cv, this.g] = mkCanvas(VW * TILE, VH * TILE);
    this.hudL = h('div', { class: 'win hud' });
    this.hudR = h('div', { class: 'win hud right' });
    this.strip = h('div', { class: 'pstrip' });
    this.strip.addEventListener('click', (e) => { e.stopPropagation(); if (this.busy || this.moving) return; sfx('ok'); openParty(this.app, () => this.afterMenu(), { viewOnly: !this.inTown }); });
    const view = h('div', { class: 'view' }, this.cv, this.hudL, this.hudR, this.strip);
    view.addEventListener('click', (e) => this.tapMap(e));
    this.map = this.loadCurrentMap();
    this.el = h('div', { class: 'layer' }, view, this.buildPad());
  }

  private get game() {
    return this.app.game!;
  }
  private get inTown() {
    return !this.game.state.expedition;
  }
  private get theme(): Theme {
    return this.inTown ? 'town' : getArea(this.game.state.expedition!.areaId).theme;
  }
  private loadCurrentMap() {
    return this.inTown ? loadMap('town') : this.game.currentMap()!;
  }
  private get pos() {
    return this.inTown ? this.game.state.player.townPos : this.game.state.expedition!.pos;
  }
  private get dir(): Dir {
    return this.inTown ? this.game.state.player.townDir : this.game.state.expedition!.dir;
  }

  private buildPad() {
    const dpad = h('div', { class: 'dpad' }, h('div', { class: 'c' }));
    for (const d of ['up', 'down', 'left', 'right'] as Dir[]) {
      const k = h('div', { class: `k ${d}` }, { up: '▲', down: '▼', left: '◀', right: '▶' }[d]);
      this.dpadKeys[d] = k;
      dpad.append(k);
    }
    // 中心からの角度で方向を決める（指をすべらせても方向が変わる）
    const fromPoint = (e: PointerEvent): Dir | null => {
      const r = dpad.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(x, y) < 12) return null;
      return Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : y > 0 ? 'down' : 'up';
    };
    const set = (d: Dir | null) => {
      this.held = d;
      for (const [k, el] of Object.entries(this.dpadKeys)) el.classList.toggle('on', k === d);
    };
    dpad.addEventListener('pointerdown', (e) => { dpad.setPointerCapture(e.pointerId); set(fromPoint(e)); });
    dpad.addEventListener('pointermove', (e) => { if (this.held !== null || e.buttons) set(fromPoint(e)); });
    const up = () => set(null);
    dpad.addEventListener('pointerup', up);
    dpad.addEventListener('pointercancel', up);
    const a = h('div', { class: 'round a', role: 'button', 'aria-label': 'しらべる' }, 'A');
    const b = h('div', { class: 'round b', role: 'button', 'aria-label': 'メニュー' }, 'B');
    a.addEventListener('pointerdown', (e) => { e.preventDefault(); this.key('a', true); });
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); this.key('b', true); });
    const menu = h('button', { class: 'btn menu-btn', type: 'button' }, 'メニュー');
    menu.addEventListener('click', () => this.key('menu', true));
    return h('div', { class: 'pad-area' }, dpad, menu, h('div', { class: 'abtn' }, a, b));
  }

  /** 縦長の画面では 見える範囲を 下に広げる */
  private fit() {
    const w = this.el.clientWidth || 390, hgt = this.el.clientHeight || 700;
    const tilePx = w / VW;
    let rows = Math.floor((hgt - 230) / tilePx);
    rows = Math.max(9, Math.min(15, rows - ((rows + 1) % 2)));
    if (rows !== VH || this.cv.height !== rows * TILE) {
      VH = rows;
      this.cv.height = VH * TILE;
      this.g.imageSmoothingEnabled = false;
      (this.cv.parentElement as HTMLElement).style.aspectRatio = `${VW} / ${VH}`;
    }
  }

  enter() {
    this.fit();
    this.map = this.loadCurrentMap();
    playBgm(this.inTown ? 'town' : 'field');
    this.updateHud();
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      if (this.paused) return;
      this.tick();
      this.draw();
    };
    loop();
  }
  leave() {
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

  /** メニューから戻ったとき（かえりのはね などで場所が変わることがある） */
  afterMenu() {
    this.map = this.loadCurrentMap();
    playBgm(this.inTown ? 'town' : 'field');
    this.updateHud();
  }

  updateHud() {
    const s = this.game.state;
    this.hudL.textContent = this.inTown ? 'ルナフィアの まち' : this.game.floor!.floor.name;
    this.hudR.textContent = `${s.player.gold} G`;
    clear(this.strip);
    for (const m of this.game.party) {
      const r = m.stats.hp ? m.hp / m.stats.hp : 0;
      this.strip.append(h('div', { class: `win pm${m.hp <= 0 ? ' dead' : ''}` },
        h('div', { style: 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis' }, displayName(m)),
        h('div', null, m.hp <= 0 ? 'たおれている' : `HP ${m.hp}`),
        h('div', { class: 'bar' }, h('i', { style: `width:${Math.round(r * 100)}%;${r < 0.3 ? 'background:var(--warn)' : ''}` }))));
    }
  }

  /** 地図をタップ: そこまで歩く（人・宝箱などなら となりまで歩いて 話しかける） */
  private tapMap(e: MouseEvent) {
    if (this.busy || this.moving || this.app.panels.length) return;
    const rect = this.cv.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * this.cv.width, cy = ((e.clientY - rect.top) / rect.height) * this.cv.height;
    const camX = this.pos.x - (VW - 1) / 2, camY = this.pos.y - (VH - 1) / 2;
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
    if (/[0-9CHBFG]/.test(t)) {
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

  private pendingResult: MoveResult | null = null;
  private step(dir: Dir) {
    const from = { ...this.pos };
    const r = this.inTown ? this.game.townMove(dir) : this.game.move(dir);
    if (r.kind === 'moved' || r.kind === 'stairs' || r.kind === 'exit') {
      this.stepAnim++;
      this.moving = { from, t0: performance.now(), dur: this.app.settings.reduceMotion ? 1 : 150 };
      this.pendingResult = r;
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
        case 'moved':
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
            await this.app.say(`たからばこを あけた！\n${rewardText(r.reward)}を てにいれた！`);
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
            this.map = this.loadCurrentMap();
          });
          this.app.toast(this.game.floor!.floor.name);
          break;
        case 'exit':
          if (await this.app.confirm('まちへ もどりますか？')) {
            await this.fade(() => {
              this.game.leaveExpedition();
              this.map = this.loadCurrentMap();
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
    const camX = px - (VW - 1) / 2, camY = py - (VH - 1) / 2;
    g.fillStyle = '#000';
    g.fillRect(0, 0, this.cv.width, this.cv.height);
    const th = this.theme;
    const x0 = Math.floor(camX) - 1, y0 = Math.floor(camY) - 1;
    const ex = this.game.state.expedition;
    for (let y = y0; y <= y0 + VH + 1; y++)
      for (let x = x0; x <= x0 + VW + 1; x++) {
        let ch = tileAt(this.map, x, y);
        if (th === 'town' && /[0-9]/.test(ch)) ch = tileAt(this.map, x, y - 1) === 'W' ? 'K' : '.';
        if (ch === 'B') ch = '.';
        const state = { open: ch === 'C' && this.game.isOpened({ x, y }), used: ch === 'H' && !!ex?.springUsed };
        g.drawImage(tileSprite(th, ch, x, y, anim, state), Math.round((x - camX) * TILE), Math.round((y - camY) * TILE));
      }
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
      const sp = monsterSprite(BOSSES[bossId].enemies.find((e) => e.distorted)?.speciesId ?? 'madoidake', { distorted: true });
      const bob = Math.round(Math.sin(this.frame / 12) * 1.5);
      const bx = Math.round((b.x - camX) * TILE), by = Math.round((b.y - camY) * TILE);
      shadow(bx, by, 16);
      g.drawImage(sp, bx - 12, by - 22 + bob, 56, 56);
    }
    // まちの人
    if (th === 'town') {
      for (const [ch, npc] of Object.entries(TOWN_NPCS)) {
        if (!npc.look) continue;
        for (const p of findAll(this.map, ch)) {
          const facing = npc.facing ?? 'down';
          const sx = Math.round((p.x - camX) * TILE), sy = Math.round((p.y - camY) * TILE);
          if (tileAt(this.map, p.x, p.y - 1) !== 'W') shadow(sx, sy);
          g.drawImage(personSprite(npc.look, facing, npc.idle ? anim : 0), sx, sy - 10);
        }
      }
    }
    if (this.pathGoal && Math.floor(this.frame / 8) % 2 === 0) {
      const gx = Math.round((this.pathGoal.x - camX) * TILE), gy = Math.round((this.pathGoal.y - camY) * TILE);
      g.strokeStyle = '#ffe070'; g.lineWidth = 2; g.strokeRect(gx + 3, gy + 3, TILE - 6, TILE - 6);
    }
    // しゅじんこう
    const walk = this.moving ? Math.floor(this.frame / 6) : 0;
    const hx = Math.round((px - camX) * TILE), hy = Math.round((py - camY) * TILE);
    shadow(hx, hy);
    g.drawImage(personSprite('hero', this.dir, walk), hx, hy - 10);
    // どうくつは 暗く、まわりだけ明るく
    if (th === 'cave') {
      const cx = hx + TILE / 2, cy = hy + TILE / 2;
      const rg = g.createRadialGradient(cx, cy, TILE * 1.5, cx, cy, TILE * 6);
      rg.addColorStop(0, 'rgba(10,6,20,0)');
      rg.addColorStop(1, 'rgba(10,6,20,.72)');
      g.fillStyle = rg;
      g.fillRect(0, 0, this.cv.width, this.cv.height);
    }
  }
}
