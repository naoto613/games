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
import { personSprite, TILE, tileSprite, type Theme } from '../gfx/tiles';
import { startBattle } from './battle';
import { talkTo } from './town';
import { getArea as areaOf } from '../../data/areas';
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
  private map!: TileMap;
  private stepAnim = 0;

  constructor(private app: App) {
    [this.cv, this.g] = mkCanvas(VW * TILE, VH * TILE);
    this.hudL = h('div', { class: 'win hud' });
    this.hudR = h('div', { class: 'win hud right' });
    this.strip = h('div', { class: 'pstrip' });
    this.strip.addEventListener('click', (e) => { e.stopPropagation(); if (this.busy || this.moving) return; sfx('ok'); openParty(this.app, () => this.afterMenu(), { viewOnly: !this.inTown }); });
    const view = h('div', { class: 'view full' }, this.cv, this.hudL, this.hudR, this.strip);
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
      if (start || (e.target as HTMLElement).closest('.pstrip, .fmenu')) return;
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
      this.held = null;
      if (!wasDrag && !cancel) this.tapMap(e);
    };
    view.addEventListener('pointerup', (e) => end(e, false));
    view.addEventListener('pointercancel', (e) => end(e, true));
    const menu = h('button', { class: 'btn fmenu', type: 'button', 'aria-label': 'メニュー' }, h('span', { class: 'ham' }, '≡'), 'メニュー');
    menu.addEventListener('click', (e) => { e.stopPropagation(); this.key('menu', true); });
    view.append(menu);
  }

  /** 画面いっぱいに マップを ひろげる（たて長でも よこ長でも あまらないように 行数を きめる） */
  private fit() {
    const w = this.el.clientWidth || 390, hgt = this.el.clientHeight || 700;
    const tilePx = w / VW;
    let rows = Math.ceil(hgt / tilePx);
    if (rows % 2 === 0) rows++;
    rows = Math.max(9, Math.min(27, rows));
    if (rows !== VH || this.cv.height !== rows * TILE) {
      VH = rows;
      this.cv.height = VH * TILE;
      this.g.imageSmoothingEnabled = false;
    }
  }

  enter() {
    window.addEventListener('resize', this.onResize);
    this.fit();
    this.reloadMap();
    playBgm(this.inTown ? 'town' : 'field');
    this.updateHud();
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

  /** メニューから戻ったとき（かえりのはね などで場所が変わることがある） */
  afterMenu() {
    this.reloadMap();
    playBgm(this.inTown ? 'town' : 'field');
    this.updateHud();
  }

  updateHud() {
    const s = this.game.state;
    this.hudL.textContent = this.inTown ? this.game.currentTownMap().name : this.game.floor!.floor.name;
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
  private tapMap(e: PointerEvent) {
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
          break;
        case 'locked':
          sfx('bump');
          await this.app.say(r.text);
          break;
        case 'gate': {
          const area = areaOf(r.areaId);
          const ok = this.game.canStartExpedition(r.areaId);
          if (!this.game.state.progress.unlockedAreas.includes(r.areaId)) { await this.app.say('たびのとびらは しずかに うずまいている。まだ むこうへは いけないようだ…。'); break; }
          if (!ok.ok) { await this.app.say(ok.error); break; }
          if (this.game.state.monsters.length >= this.game.state.capacity) await this.app.say('ぼくじょうが いっぱいだ。なかまが ふえても つれて かえれない。');
          if (!(await this.app.confirm(`「${area.name}」への たびのとびらだ。\nとびこみますか？`))) break;
          sfx('stairs');
          await this.fade(() => { this.game.startExpedition(r.areaId); this.reloadMap(); });
          playBgm('field');
          this.app.toast(this.game.floor!.floor.name);
          break;
        }
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
            this.reloadMap();
          });
          this.app.toast(this.game.floor!.floor.name);
          break;
        case 'exit':
          if (await this.app.confirm('まちへ もどりますか？')) {
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
        if (th !== 'town' && !ex && (x < 0 || y < 0 || x >= this.map.w || y >= this.map.h)) continue; // へやの そとは まっくら
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
      const sp = monsterSprite(BOSSES[bossId].enemies.find((e) => e.distorted)?.speciesId ?? 'kinoborg', { distorted: true });
      const bob = Math.round(Math.sin(this.frame / 12) * 1.5);
      const bx = Math.round((b.x - camX) * TILE), by = Math.round((b.y - camY) * TILE);
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
    // しゅじんこう と ついてくる なかま（うしろから じゅんに 描く）
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
    actors.sort((a, b) => a.y - b.y).forEach((a) => a.draw());
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
