// フィールド画面：区域の描画、移動（タップ・キーボード）、調べる、出入口
import { MAP_MAP, WALKABLE, type MapDef, type NpcDef, type ObjDef, type Warp } from '../data/maps';
import { ENEMY_MAP } from '../data/enemies';
import { BATTLE_MAP } from '../data/enemies';
import { cond, type GameState } from '../engine/state';
import { charSprite, drawEnemy } from './sprites';
import { renderTiles, TS } from './tiles';

export interface FieldHost {
  state(): GameState;
  busy(): boolean;
  interact(kind: 'npc' | 'obj', id: string): void;
  warp(w: Warp): void;
  encounter(o: ObjDef): void;
  blocked(text: string): void;
  focusChanged(label: string | null): void;
}

type Pt = [number, number];
const DIRS: Pt[] = [[0, -1], [1, 0], [0, 1], [-1, 0]];

export class FieldView {
  readonly canvas: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  map!: MapDef;
  tiles: string[] = [];
  private tileCanvas: HTMLCanvasElement | null = null;
  private tileKey = '';
  // 主人公
  x = 0; y = 0; dir: 0 | 1 | 2 | 3 = 2;
  private fx = 0; private fy = 0;
  private moving = false;
  private from: Pt = [0, 0];
  private prog = 0;
  private walkT = 0;
  private path: Pt[] = [];
  private pending: { kind: 'npc' | 'obj' | 'warpBlocked' | 'enemy'; id: string } | null = null;
  private trail: { x: number; y: number; dir: number }[] = [];
  private keys = new Set<string>();
  private t = 0;
  private scale = 2;
  private camX = 0; private camY = 0;
  private tapMark: { x: number; y: number; t: number } | null = null;
  tempDefeated = new Set<string>();
  private lastFocus: string | null = '';

  constructor(private host: FieldHost) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'field';
    this.g = this.canvas.getContext('2d')!;
    this.canvas.addEventListener('pointerdown', e => this.onTap(e));
    window.addEventListener('keydown', e => this.onKey(e, true));
    window.addEventListener('keyup', e => this.onKey(e, false));
    window.addEventListener('blur', () => this.keys.clear());
  }

  load(mapId: string, x: number, y: number, dir: 0 | 1 | 2 | 3): void {
    const m = MAP_MAP.get(mapId);
    if (!m) throw new Error('map ' + mapId);
    const changed = !this.map || this.map.id !== mapId;
    this.map = m;
    this.x = x; this.y = y; this.dir = dir;
    this.fx = x; this.fy = y;
    this.moving = false;
    this.path = [];
    this.pending = null;
    if (changed) this.tempDefeated.clear();
    this.refresh(true);
    // 仲間は主人公の後ろに立つ
    const bx = x - DIRS[dir][0], by = y - DIRS[dir][1];
    const behind = WALKABLE.has(this.tiles[by]?.[bx] ?? '#') && this.tiles[by][bx] !== 'D' && this.tiles[by][bx] !== 'S';
    this.trail = [{ x: behind ? bx : x, y: behind ? by : y, dir }, { x: behind ? bx : x, y: behind ? by : y, dir }];
  }

  /** 状態（フラグ）が変わったあとに地形の変化を反映する */
  refresh(force = false): void {
    const s = this.host.state();
    const t = this.map.tiles.map(r => r.split(''));
    for (const p of this.map.patches ?? []) if (cond(s, p.cond)) for (const [x, y, ch] of p.tiles) t[y][x] = ch;
    this.tiles = t.map(r => r.join(''));
    const night = !!this.map.night && cond(s, this.map.night);
    const key = this.map.id + '|' + this.tiles.join('') + '|' + night;
    if (force || key !== this.tileKey) {
      this.tileCanvas = renderTiles(this.tiles, this.map.theme, night);
      this.tileKey = key;
    }
  }

  isNight(): boolean {
    return !!this.map.night && cond(this.host.state(), this.map.night);
  }

  // ---------- 何がどこにいるか ----------

  npcs(): NpcDef[] {
    const s = this.host.state();
    return this.map.npcs.filter(n => cond(s, n.cond));
  }

  objs(): ObjDef[] {
    const s = this.host.state();
    return this.map.objs.filter(o => {
      if (!cond(s, o.cond)) return false;
      if (o.hiddenCond && !cond(s, o.hiddenCond)) return false;
      if (o.kind === 'chest' && s.flags['chest:' + o.id]) return false;
      if (o.kind === 'enemy' && (this.tempDefeated.has(o.id) || (!o.respawn && s.defeated[o.id]))) return false;
      return true;
    });
  }

  npcAt(x: number, y: number): NpcDef | undefined { return this.npcs().find(n => n.x === x && n.y === y); }
  objAt(x: number, y: number): ObjDef | undefined { return this.objs().find(o => o.x === x && o.y === y); }

  private warpAt(x: number, y: number): Warp | undefined {
    return this.map.warps.find(w => w.x === x && w.y === y);
  }

  private walkable(x: number, y: number, forPath = false): boolean {
    const ch = this.tiles[y]?.[x];
    if (ch === undefined || !WALKABLE.has(ch)) return false;
    if (ch === 'D') {
      const w = this.warpAt(x, y);
      if (!w || !cond(this.host.state(), w.cond)) return false;
    }
    if (this.npcAt(x, y)) return false;
    const o = this.objAt(x, y);
    if (o && (o.kind !== 'enemy' || forPath)) return false;
    return true;
  }

  // ---------- 入力 ----------

  private onKey(e: KeyboardEvent, down: boolean): void {
    const k = e.key;
    const map: Record<string, string> = { ArrowUp: 'u', w: 'u', W: 'u', ArrowDown: 'd', s: 'd', S: 'd', ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r' };
    if (map[k]) {
      if (down) { this.keys.add(map[k]); this.path = []; this.pending = null; } else this.keys.delete(map[k]);
      if (document.body.dataset.mode === 'field') e.preventDefault();
      return;
    }
    if (down && (k === 'Enter' || k === ' ' || k === 'z' || k === 'Z') && document.body.dataset.mode === 'field' && !this.host.busy()) {
      e.preventDefault();
      this.interactFacing();
    }
  }

  private onTap(e: PointerEvent): void {
    if (this.host.busy()) return;
    const r = this.canvas.getBoundingClientRect();
    const dpr = this.canvas.width / r.width;
    const sx = (e.clientX - r.left) * dpr, sy = (e.clientY - r.top) * dpr;
    const tile = TS * this.scale;
    const tx = Math.floor((sx + this.camX) / tile);
    const ty = Math.floor((sy + this.camY) / tile);
    this.tapMark = { x: tx, y: ty, t: this.t };
    this.goTo(tx, ty);
  }

  goTo(tx: number, ty: number): void {
    if (tx === this.x && ty === this.y) { this.interactFacing(); return; }
    // 人物・調べもの・敵
    let npc = this.npcAt(tx, ty);
    let obj = this.objAt(tx, ty);
    const ch = this.tiles[ty]?.[tx];
    // カウンター越しの人物
    let viaCounter: Pt | null = null;
    if (!npc && !obj && (ch === 'c' || ch === 's')) {
      for (const [dx, dy] of DIRS) {
        const n = this.npcAt(tx + dx, ty + dy);
        if (n) { npc = n; viaCounter = [tx, ty]; break; }
      }
    }
    if (npc || obj) {
      const target: Pt = npc ? [npc.x, npc.y] : [obj!.x, obj!.y];
      const goals: Pt[] = [];
      for (const [dx, dy] of DIRS) {
        const ax = target[0] + dx, ay = target[1] + dy;
        if (this.walkable(ax, ay) || (ax === this.x && ay === this.y)) goals.push([ax, ay]);
        const mid = this.tiles[ay]?.[ax];
        if ((mid === 'c' || mid === 's') && (viaCounter || npc)) {
          const bx = ax + dx, by = ay + dy;
          if (this.walkable(bx, by) || (bx === this.x && by === this.y)) goals.push([bx, by]);
        }
      }
      if (obj && obj.kind === 'enemy') {
        const p = this.findPath(goals);
        if (p) { this.path = p; this.pending = { kind: 'enemy', id: obj.id }; }
        return;
      }
      const p = this.findPath(goals);
      if (p) { this.path = p; this.pending = npc ? { kind: 'npc', id: npc.id } : { kind: 'obj', id: obj!.id }; this.pendingTarget = target; }
      return;
    }
    // 閉ざされた扉
    const w = this.warpAt(tx, ty);
    if (w && !cond(this.host.state(), w.cond) && w.blocked) {
      const goals = DIRS.map(([dx, dy]) => [tx + dx, ty + dy] as Pt).filter(([ax, ay]) => this.walkable(ax, ay) || (ax === this.x && ay === this.y));
      const p = this.findPath(goals);
      if (p) { this.path = p; this.pending = { kind: 'warpBlocked', id: `${tx},${ty}` }; this.pendingTarget = [tx, ty]; }
      return;
    }
    if (!this.walkable(tx, ty)) {
      // いちばん近い歩ける場所へ
      return;
    }
    const p = this.findPath([[tx, ty]]);
    if (p) { this.path = p; this.pending = null; }
  }

  private pendingTarget: Pt | null = null;

  private findPath(goals: Pt[]): Pt[] | null {
    if (goals.length === 0) return null;
    const key = (x: number, y: number) => y * 1000 + x;
    const goalSet = new Set(goals.map(([x, y]) => key(x, y)));
    if (goalSet.has(key(this.x, this.y))) return [];
    const prev = new Map<number, number>();
    const q: Pt[] = [[this.x, this.y]];
    prev.set(key(this.x, this.y), -1);
    while (q.length) {
      const [x, y] = q.shift()!;
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy;
        const k = key(nx, ny);
        if (prev.has(k)) continue;
        const isGoal = goalSet.has(k);
        if (!isGoal && !this.walkable(nx, ny)) continue;
        if (isGoal && !this.walkable(nx, ny) && !(nx === this.x && ny === this.y)) continue;
        // 途中で出入口を踏まない
        if (!isGoal && this.warpAt(nx, ny) && cond(this.host.state(), this.warpAt(nx, ny)!.cond)) continue;
        prev.set(k, key(x, y));
        if (isGoal) {
          const out: Pt[] = [];
          let c = k;
          while (c !== key(this.x, this.y)) { out.unshift([c % 1000, Math.floor(c / 1000)]); c = prev.get(c)!; }
          return out;
        }
        q.push([nx, ny]);
      }
      if (prev.size > 4000) break;
    }
    return null;
  }

  facingTarget(): { kind: 'npc' | 'obj'; id: string; label: string } | null {
    const [dx, dy] = DIRS[this.dir];
    const fx = this.x + dx, fy = this.y + dy;
    const n = this.npcAt(fx, fy);
    if (n) return { kind: 'npc', id: n.id, label: n.name };
    const o = this.objAt(fx, fy);
    if (o && o.kind !== 'enemy') return { kind: 'obj', id: o.id, label: o.kind === 'chest' ? '宝箱' : o.label ?? '調べる' };
    const ch = this.tiles[fy]?.[fx];
    if (ch === 'c' || ch === 's') {
      const n2 = this.npcAt(fx + dx, fy + dy);
      if (n2) return { kind: 'npc', id: n2.id, label: n2.name };
    }
    return null;
  }

  interactFacing(): void {
    const t = this.facingTarget();
    if (t) { this.host.interact(t.kind, t.id); return; }
    const [dx, dy] = DIRS[this.dir];
    const w = this.warpAt(this.x + dx, this.y + dy);
    if (w && w.blocked && !cond(this.host.state(), w.cond)) this.host.blocked(w.blocked);
  }

  // ---------- 更新 ----------

  update(dt: number): void {
    this.t += dt;
    if (this.host.busy()) { this.keys.clear(); return; }
    const speed = 6.5;
    if (this.moving) {
      this.prog += dt * speed;
      this.walkT += dt;
      if (this.prog >= 1) {
        this.moving = false;
        this.fx = this.x; this.fy = this.y;
        this.arrived();
      } else {
        this.fx = this.from[0] + (this.x - this.from[0]) * this.prog;
        this.fy = this.from[1] + (this.y - this.from[1]) * this.prog;
      }
    }
    if (!this.moving && !this.host.busy()) {
      let want: number | null = null;
      if (this.keys.has('u')) want = 0; else if (this.keys.has('r')) want = 1; else if (this.keys.has('d')) want = 2; else if (this.keys.has('l')) want = 3;
      if (want !== null) this.tryStep(want as 0 | 1 | 2 | 3);
      else if (this.path.length) {
        const [nx, ny] = this.path[0];
        const d = DIRS.findIndex(([dx, dy]) => this.x + dx === nx && this.y + dy === ny);
        if (d >= 0 && this.tryStep(d as 0 | 1 | 2 | 3)) this.path.shift();
        else { this.path = []; this.pending = null; }
      } else if (this.pending) {
        const p = this.pending;
        this.pending = null;
        if (this.pendingTarget) {
          const [tx, ty] = this.pendingTarget;
          const dx = Math.sign(tx - this.x), dy = Math.sign(ty - this.y);
          const d = DIRS.findIndex(([a, b]) => a === dx && b === dy);
          if (d >= 0) this.dir = d as 0 | 1 | 2 | 3;
        }
        if (p.kind === 'npc' || p.kind === 'obj') this.host.interact(p.kind, p.id);
        else if (p.kind === 'warpBlocked') { const [x, y] = p.id.split(',').map(Number); const w = this.warpAt(x, y); if (w?.blocked) this.host.blocked(w.blocked); }
        else if (p.kind === 'enemy') {
          const o = this.objs().find(x => x.id === p.id);
          if (o) { const d = DIRS.findIndex(([a, b]) => this.x + a === o.x && this.y + b === o.y); if (d >= 0) this.tryStep(d as 0 | 1 | 2 | 3); }
        }
        this.pendingTarget = null;
      }
    }
    const f = this.facingTarget();
    const label = f && !this.moving ? f.label : null;
    if (label !== this.lastFocus) { this.lastFocus = label; this.host.focusChanged(label); }
  }

  private tryStep(d: 0 | 1 | 2 | 3): boolean {
    this.dir = d;
    const [dx, dy] = DIRS[d];
    const nx = this.x + dx, ny = this.y + dy;
    const o = this.objAt(nx, ny);
    if (o && o.kind === 'enemy') { this.keys.clear(); this.path = []; this.host.encounter(o); return false; }
    const w = this.warpAt(nx, ny);
    if (w && !cond(this.host.state(), w.cond)) {
      if (w.blocked && this.tiles[ny]?.[nx] === 'D') { this.keys.clear(); this.host.blocked(w.blocked); }
      return false;
    }
    if (!this.walkable(nx, ny)) return false;
    this.trail.unshift({ x: this.x, y: this.y, dir: this.dir });
    if (this.trail.length > 4) this.trail.length = 4;
    this.from = [this.x, this.y];
    this.x = nx; this.y = ny;
    this.moving = true;
    this.prog = 0;
    return true;
  }

  private arrived(): void {
    const s = this.host.state();
    s.x = this.x; s.y = this.y; s.dir = this.dir;
    const w = this.warpAt(this.x, this.y);
    if (w && w.to && cond(s, w.cond)) { this.path = []; this.pending = null; this.keys.clear(); this.host.warp(w); }
  }

  // ---------- 描画 ----------

  resize(): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth, h = window.innerHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    const short = Math.min(this.canvas.width, this.canvas.height);
    this.scale = Math.max(2, Math.floor(short / (TS * 11)));
    if (Math.max(w, h) / Math.min(w, h) > 1.6 && w > h) this.scale = Math.max(2, Math.floor(this.canvas.height / (TS * 10)));
  }

  render(): void {
    const g = this.g;
    const W = this.canvas.width, H = this.canvas.height;
    const tile = TS * this.scale;
    g.imageSmoothingEnabled = false;
    g.fillStyle = this.map.theme === 'corridor' ? '#050408' : '#0e0d12';
    g.fillRect(0, 0, W, H);
    if (!this.tileCanvas) return;
    const mw = this.tiles[0].length * tile, mh = this.tiles.length * tile;
    const cx = (this.fx + 0.5) * tile - W / 2;
    const cy = (this.fy + 0.5) * tile - H / 2;
    this.camX = mw <= W ? (mw - W) / 2 : Math.max(0, Math.min(mw - W, cx));
    this.camY = mh <= H ? (mh - H) / 2 : Math.max(0, Math.min(mh - H, cy));
    this.camX = Math.round(this.camX); this.camY = Math.round(this.camY);
    g.save();
    g.translate(-this.camX, -this.camY);
    g.drawImage(this.tileCanvas, 0, 0, mw, mh);
    this.drawDynamic(g, tile);
    // 人物を奥から順に
    const ents: { y: number; draw: () => void }[] = [];
    for (const n of this.npcs()) ents.push({ y: n.y, draw: () => this.drawChar(g, n.sprite, n.x, n.y, n.dir ?? 2, 0, tile, n.id === 'towa' && !cond(this.host.state(), 'f:end_bell')) });
    for (const o of this.objs()) ents.push({ y: o.y, draw: () => this.drawObj(g, o, tile) });
    const s = this.host.state();
    if (s.party.includes('dran')) {
      const tr = this.trail[0];
      if (tr && (tr.x !== this.x || tr.y !== this.y)) {
        const fx = tr.x + (this.moving ? 0 : 0), fy = tr.y;
        const prevTr = this.trail[1] ?? tr;
        const px = this.moving ? prevTr.x + (tr.x - prevTr.x) * this.prog : fx;
        const py = this.moving ? prevTr.y + (tr.y - prevTr.y) * this.prog : fy;
        ents.push({ y: py, draw: () => this.drawChar(g, 'dran', px, py, tr.dir, this.moving ? Math.floor(this.walkT * 8) % 4 : 0, tile) });
      }
    }
    ents.push({ y: this.fy + 0.01, draw: () => this.drawChar(g, 'seil', this.fx, this.fy, this.dir, this.moving ? Math.floor(this.walkT * 8) % 4 : 0, tile) });
    ents.sort((a, b) => a.y - b.y).forEach(e => e.draw());
    // 調べられる対象の印
    const f = this.facingTarget();
    if (f && !this.moving) {
      const [dx, dy] = DIRS[this.dir];
      let tx = this.x + dx, ty = this.y + dy;
      if (f.kind === 'npc') { const n = this.npcs().find(x => x.id === f.id)!; tx = n.x; ty = n.y; }
      const bob = Math.sin(this.t * 6) * tile * 0.05;
      g.fillStyle = '#e2b45e';
      g.font = `bold ${Math.round(tile * 0.5)}px sans-serif`;
      g.textAlign = 'center';
      g.fillText('！', (tx + 0.5) * tile, ty * tile - tile * 0.3 + bob);
    }
    if (this.tapMark && this.t - this.tapMark.t < 0.5) {
      const a = 1 - (this.t - this.tapMark.t) / 0.5;
      g.strokeStyle = `rgba(226,180,94,${a})`;
      g.lineWidth = 2;
      g.strokeRect(this.tapMark.x * tile + 3, this.tapMark.y * tile + 3, tile - 6, tile - 6);
    }
    g.restore();
    if (this.isNight()) this.drawNight(g, tile);
  }

  private drawDynamic(g: CanvasRenderingContext2D, tile: number): void {
    const x0 = Math.floor(this.camX / tile), y0 = Math.floor(this.camY / tile);
    const x1 = x0 + Math.ceil(this.canvas.width / tile) + 1, y1 = y0 + Math.ceil(this.canvas.height / tile) + 1;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const ch = this.tiles[y]?.[x];
      if (ch === '~') {
        const a = Math.sin(this.t * 2 + x * 0.7 + y * 1.3);
        g.fillStyle = `rgba(160,200,230,${0.08 + a * 0.06})`;
        g.fillRect(x * tile + ((this.t * 6 + y * 5) % 12) * this.scale, y * tile + 7 * this.scale, 4 * this.scale, this.scale);
      } else if (ch === 'v' && Math.sin(this.t * 3 + x * 13 + y * 7) > 0.92) {
        g.fillStyle = 'rgba(154,138,216,0.25)';
        g.fillRect(x * tile + 4 * this.scale, y * tile + 4 * this.scale, 8 * this.scale, 8 * this.scale);
      } else if (ch === 'R' && this.map.id === 'town' && x === 3 && y === 8) {
        // パン屋の煙
        for (let i = 0; i < 4; i++) {
          const p = (this.t * 0.4 + i / 4) % 1;
          g.fillStyle = `rgba(220,220,220,${0.35 * (1 - p)})`;
          g.beginPath();
          g.arc(x * tile + tile * 0.5 + Math.sin(p * 6 + i) * tile * 0.2, y * tile - p * tile * 2, tile * (0.12 + p * 0.2), 0, Math.PI * 2);
          g.fill();
        }
      }
    }
  }

  private drawChar(g: CanvasRenderingContext2D, key: string, x: number, y: number, dir: number, frame: number, tile: number, sleepy = false): void {
    const sp = charSprite(key, dir, frame);
    const kid = key === 'timo' || key === 'towa';
    const sc = this.scale * (kid ? 0.85 : 1);
    const w = sp.width * sc, h = sp.height * sc;
    const px = x * tile + (tile - w) / 2;
    const py = y * tile + tile - h - this.scale;
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.beginPath(); g.ellipse(x * tile + tile / 2, y * tile + tile - this.scale * 2, tile * 0.3, tile * 0.1, 0, 0, Math.PI * 2); g.fill();
    if (sleepy) g.globalAlpha = 0.65 + Math.sin(this.t * 2) * 0.2;
    g.drawImage(sp, Math.round(px), Math.round(py), Math.round(w), Math.round(h));
    g.globalAlpha = 1;
  }

  private enemyIcon = document.createElement('canvas');

  private drawObj(g: CanvasRenderingContext2D, o: ObjDef, tile: number): void {
    const s = this.host.state();
    const cx = (o.x + 0.5) * tile, cy = (o.y + 0.5) * tile;
    if (o.kind === 'chest') {
      const u = this.scale;
      g.fillStyle = '#3a2414'; g.fillRect(cx - 6 * u, cy - 3 * u, 12 * u, 9 * u);
      g.fillStyle = '#8a5a2e'; g.fillRect(cx - 5 * u, cy - 2 * u, 10 * u, 7 * u);
      g.fillStyle = '#a8743a'; g.fillRect(cx - 5 * u, cy - 2 * u, 10 * u, 2 * u);
      g.fillStyle = '#e2b45e'; g.fillRect(cx - 1 * u, cy, 2 * u, 2 * u);
      if (o.hiddenCond) this.glint(g, cx, cy - 6 * u, '#b8a8ff');
      return;
    }
    if (o.kind === 'enemy') {
      const b = o.battle ? BATTLE_MAP.get(o.battle) : undefined;
      const art = o.sprite ?? (b ? ENEMY_MAP.get(b.enemies[0])!.art : 'shade');
      const size = tile * (b?.boss ? 1.6 : 1.1);
      const ic = this.enemyIcon;
      ic.width = ic.height = Math.ceil(size * 1.2);
      const ig = ic.getContext('2d')!;
      ig.clearRect(0, 0, ic.width, ic.height);
      drawEnemy(ig, art, ic.width / 2, ic.height / 2, size, this.t, o.x * 7 + o.y);
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.beginPath(); g.ellipse(cx, cy + tile * 0.38, tile * 0.32, tile * 0.1, 0, 0, Math.PI * 2); g.fill();
      g.drawImage(ic, cx - ic.width / 2, cy - ic.height / 2 - tile * (b?.boss ? 0.3 : 0.05));
      return;
    }
    if (o.sprite === 'shelf') {
      const ic = this.enemyIcon;
      ic.width = ic.height = Math.ceil(tile * 1.8);
      const ig = ic.getContext('2d')!;
      ig.clearRect(0, 0, ic.width, ic.height);
      drawEnemy(ig, 'shelf', ic.width / 2, ic.height / 2, tile * 1.5, 0, 3);
      g.drawImage(ic, cx - ic.width / 2, cy - ic.height / 2 - tile * 0.3);
      return;
    }
    // 調べもの：まだ見ていないものはきらめく
    if (!s.flags['seen:' + this.map.id + ':' + o.id]) this.glint(g, cx, cy - tile * 0.2, o.hiddenCond ? '#b8a8ff' : '#e2b45e');
  }

  private glint(g: CanvasRenderingContext2D, x: number, y: number, color: string): void {
    const a = (Math.sin(this.t * 4 + x) + 1) / 2;
    const r = this.scale * (1.5 + a * 1.5);
    g.fillStyle = color;
    g.globalAlpha = 0.4 + a * 0.6;
    g.beginPath();
    g.moveTo(x, y - r * 2); g.lineTo(x + r * 0.5, y - r * 0.5); g.lineTo(x + r * 2, y); g.lineTo(x + r * 0.5, y + r * 0.5);
    g.lineTo(x, y + r * 2); g.lineTo(x - r * 0.5, y + r * 0.5); g.lineTo(x - r * 2, y); g.lineTo(x - r * 0.5, y - r * 0.5);
    g.fill();
    g.globalAlpha = 1;
  }

  private night = document.createElement('canvas');

  private drawNight(g: CanvasRenderingContext2D, tile: number): void {
    const n = this.night;
    if (n.width !== this.canvas.width || n.height !== this.canvas.height) { n.width = this.canvas.width; n.height = this.canvas.height; }
    const ng = n.getContext('2d')!;
    ng.globalCompositeOperation = 'source-over';
    ng.clearRect(0, 0, n.width, n.height);
    ng.fillStyle = 'rgba(8,10,34,0.62)';
    ng.fillRect(0, 0, n.width, n.height);
    ng.globalCompositeOperation = 'destination-out';
    const light = (x: number, y: number, r: number, a: number) => {
      const gr = ng.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      ng.fillStyle = gr;
      ng.beginPath(); ng.arc(x, y, r, 0, Math.PI * 2); ng.fill();
    };
    light((this.fx + 0.5) * tile - this.camX, (this.fy + 0.5) * tile - this.camY, tile * 3.2, 0.85);
    const x0 = Math.floor(this.camX / tile) - 2, y0 = Math.floor(this.camY / tile) - 2;
    for (let y = y0; y < y0 + this.canvas.height / tile + 4; y++) for (let x = x0; x < x0 + this.canvas.width / tile + 4; x++) {
      const ch = this.tiles[y]?.[x];
      if (ch === 'l') light((x + 0.5) * tile - this.camX, (y + 0.2) * tile - this.camY, tile * 2.6, 0.9);
      else if (ch === 'W') light((x + 0.5) * tile - this.camX, (y + 0.5) * tile - this.camY, tile * 1.2, 0.6);
    }
    g.drawImage(n, 0, 0);
  }
}
