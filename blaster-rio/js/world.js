'use strict';
// ===== タイル =====
const T = { E: 0, SOLID: 1, ONE: 2, LAD: 3, SPIKE: 4, LAVA: 5, BRK: 6, DOOR: 7, VENT: 8 };
const solidT = t => t === 1 || t === 6 || t === 7 || t === 8;
let S = null; // 現在のステージ

function tAt(c, r) {
  if (c < 0 || c >= S.cols) return 1;
  if (r < 0 || r >= ROWS) return 0;
  return S.grid[r * S.cols + c];
}
function setT(c, r, v) { if (c >= 0 && c < S.cols && r >= 0 && r < ROWS) S.grid[r * S.cols + c] = v; }
const tAtPx = (x, y) => tAt(Math.floor(x / TS), Math.floor(y / TS));

// ===== マップビルダー =====
class MB {
  constructor() { this.cols = []; this.g = 2; this.spawns = []; this.items = []; this.movers = []; this.haz = []; this.zones = []; this.checks = []; this.doorCol = -1; }
  get x() { return this.cols.length; }
  surfY() { return (ROWS - this.g) * TS; }
  ground() { const c = new Array(ROWS).fill(0); for (let r = ROWS - this.g; r < ROWS; r++) c[r] = 1; this.cols.push(c); return c; }
  empty() { const c = new Array(ROWS).fill(0); this.cols.push(c); return c; }
  parse(str) { for (const tok of str.trim().split(/\s+/)) this.tok(tok); }
  tok(t) {
    let m;
    if (t === 'K') { this.checks.push({ x: this.x * TS - 8, y: this.surfY() }); return; }
    if (t === 'BOSS') { this.boss(); return; }
    if (t === 'B') {
      for (let i = 0; i < 2; i++) { const c = this.ground(), s = ROWS - this.g; for (let r = 0; r < s; r++) c[r] = r >= s - 3 ? T.BRK : T.SOLID; }
      return;
    }
    if ((m = t.match(/^E:(\w+)$/))) { this.spawns.push({ type: m[1], x: (this.x - 2) * TS + 8, y: this.surfY() }); return; }
    if ((m = t.match(/^I:(\w+)$/))) { this.items.push({ type: m[1], x: (this.x - 2) * TS + 8, y: this.surfY() }); return; }
    if ((m = t.match(/^X:([a-z]+)(\d*)$/))) { this.hazard(m[1], +m[2] || 0); return; }
    m = t.match(/^([A-Z]+)(\d+)$/);
    if (!m) { console.warn('bad token', t); return; }
    const n = +m[2];
    switch (m[1]) {
      case 'F': for (let i = 0; i < n; i++) this.ground(); break;
      case 'U': this.g = Math.min(11, this.g + n); break;
      case 'D': this.g = Math.max(2, this.g - n); break;
      case 'P': for (let i = 0; i < n; i++) this.empty(); break;
      case 'S':
        for (let i = 0; i < n; i++) {
          if (i % 4 >= 2) this.ground();
          else { const c = this.empty(); c[ROWS - 1] = T.SPIKE; }
        }
        break;
      case 'L': {
        const c = this.ground(), top = ROWS - this.g - n;
        for (let r = top; r < ROWS - this.g; r++) c[r] = T.LAD;
        this.g += n; break;
      }
      case 'O': {
        const s = ROWS - this.g;
        for (let i = 0; i < n; i++) {
          const c = this.empty();
          if (i % 4 === 1 || i % 4 === 2) c[s - 1 - ((i >> 2) & 1)] = T.ONE;
        }
        break;
      }
      case 'M': {
        const x0 = this.x * TS;
        for (let i = 0; i < n; i++) this.empty();
        this.movers.push({ type: 'h', x: x0, y: this.surfY(), w: 32, h: 8, x0, x1: x0 + (n - 2) * TS, v: 0.75 });
        break;
      }
      case 'FP': {
        for (let i = 0; i < n; i++) {
          if (i % 3 === 0) this.movers.push({ type: 'fall', x: this.x * TS, y: this.surfY(), y0: this.surfY(), w: 32, h: 8 });
          this.empty();
        }
        break;
      }
      case 'C':
        for (let i = 0; i < n; i++) { const c = this.ground(), s = ROWS - this.g; for (let r = 0; r < s - 1; r++) c[r] = T.SOLID; }
        break;
    }
  }
  hazard(k, n) {
    const px = (this.x - 2) * TS;
    switch (k) {
      case 'lava': for (let i = 0; i < n; i++) { const c = this.empty(); c[ROWS - 1] = T.LAVA; } break;
      case 'fire': this.cols[this.x - 2][ROWS - this.g] = T.VENT; this.haz.push({ type: 'vent', x: px, y: this.surfY() }); break;
      case 'icicle': this.haz.push({ type: 'icicle', x: px + 3, y: 0 }); break;
      case 'beam': this.haz.push({ type: 'beam', x: px + 4, y: this.surfY() }); break;
      case 'wind': this.zones.push({ type: 'wind', x0: this.x * TS, x1: (this.x + n) * TS }); break;
      case 'rocks': this.zones.push({ type: 'rocks', x0: this.x * TS, x1: (this.x + n) * TS }); break;
    }
  }
  boss() {
    this.checks.push({ x: (this.x - 2) * TS, y: this.surfY() });
    this.g = 2;
    for (let i = 0; i < 3; i++) this.ground();
    const d = this.ground(), s = ROWS - 2;
    for (let r = 0; r < s; r++) d[r] = r >= s - 3 ? T.DOOR : T.SOLID;
    this.doorCol = this.x - 1;
    for (let i = 0; i < 18; i++) this.ground();
    const w = this.empty(); w.fill(T.SOLID);
  }
}

// ===== ステージ生成 =====
function createStage(id) {
  const def = STAGES[id], th = THEMES[def.theme];
  const mb = new MB(); mb.parse(def.map);
  const cols = mb.cols.length, grid = new Uint8Array(cols * ROWS);
  for (let c = 0; c < cols; c++) for (let r = 0; r < ROWS; r++) grid[r * cols + c] = mb.cols[c][r];
  S = {
    id, def, th, cols, grid, bhp: new Map(),
    spawns: mb.spawns.map((s, i) => ({ ...s, id: i, state: 'idle', out: true })),
    placed: mb.items.map((it, i) => ({ ...it, id: i, got: false, out: true, alive: false })),
    haz: mb.haz.map(h => ({ ...h, t: Math.floor(Math.random() * 60), st: 0, hx: h.x, hy: h.y })),
    zones: mb.zones.map(z => ({ ...z, t: 0 })),
    movers: mb.movers.map(m => ({ ...m, dx: 0, dy: 0, st: 0, t: 0, dir: 1 })),
    checks: mb.checks, doorCol: mb.doorCol, roomX: mb.doorCol * TS,
    enemies: [], pb: [], eb: [], items: [], parts: [], fx: [],
    camX: 0, t: 0, shake: 0, flash: 0, phase: 'ready', pt: 0,
    boss: null, rush: null, check: null, wind: 0,
  };
  S.layer = renderLayer();
  S.bg = makeBG(th);
  return S;
}

function stageEnv() {
  const th = S.th;
  if (th.water) return { g: 0.13, jv: -4.3, mf: 3.2 };
  if (th.lowgrav) return { g: 0.16, jv: -4.5, mf: 4.5 };
  return { g: 0.25, jv: -5.0, mf: 7 };
}

// ===== 当たり判定（アクター × タイル） =====
function moveX(a, dx) {
  if (!dx) return false;
  a.x += dx;
  const r0 = Math.floor(a.y / TS), r1 = Math.floor((a.y + a.h - 0.01) / TS);
  if (dx > 0) {
    const c = Math.floor((a.x + a.w - 0.01) / TS);
    for (let r = r0; r <= r1; r++) if (solidT(tAt(c, r))) { a.x = c * TS - a.w; return true; }
  } else {
    const c = Math.floor(a.x / TS);
    for (let r = r0; r <= r1; r++) if (solidT(tAt(c, r))) { a.x = (c + 1) * TS; return true; }
  }
  return false;
}
function moveY(a, dy, oneway = true) {
  if (!dy) return 0;
  const prevB = a.y + a.h;
  a.y += dy;
  const c0 = Math.floor(a.x / TS), c1 = Math.floor((a.x + a.w - 0.01) / TS);
  if (dy > 0) {
    const r = Math.floor((a.y + a.h - 0.01) / TS);
    if (r < 0) return 0;
    for (let c = c0; c <= c1; c++) {
      const t = tAt(c, r);
      if (solidT(t)) { a.y = r * TS - a.h; return 1; }
      if (oneway && prevB <= r * TS + 0.5 && (t === T.ONE || (t === T.LAD && tAt(c, r - 1) !== T.LAD))) { a.y = r * TS - a.h; return 1; }
    }
  } else {
    const r = Math.floor(a.y / TS);
    if (r < 0) return 0;
    for (let c = c0; c <= c1; c++) if (solidT(tAt(c, r))) { a.y = (r + 1) * TS; return -1; }
  }
  return 0;
}
function rectHitsTile(x, y, w, h, pred) {
  const c0 = Math.floor(x / TS), c1 = Math.floor((x + w - 0.01) / TS), r0 = Math.floor(y / TS), r1 = Math.floor((y + h - 0.01) / TS);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (pred(tAt(c, r), c, r)) return { c, r };
  return null;
}
// 床の上に乗っているか（下 1px）
function onFloor(a) {
  const y = a.y + a.h + 0.5, r = Math.floor(y / TS);
  const c0 = Math.floor(a.x / TS), c1 = Math.floor((a.x + a.w - 0.01) / TS);
  for (let c = c0; c <= c1; c++) { const t = tAt(c, r); if (solidT(t) || t === T.ONE || (t === T.LAD && tAt(c, r - 1) !== T.LAD)) return true; }
  return false;
}
function breakTile(c, r) {
  setT(c, r, T.E);
  const l = S.layer.getContext('2d');
  l.clearRect(c * TS * SC, r * TS * SC, TS * SC, TS * SC);
  for (let i = 0; i < 6; i++) addPart({ x: c * TS + 8, y: r * TS + 8, vx: rnd(-2, 2), vy: rnd(-3, 0), g: 0.2, life: 30, c: S.th.hi, s: 3, kind: 'chunk' });
  SFX.rock();
}
function damageBrk(c, r, d) {
  const k = r * S.cols + c, hp = (S.bhp.get(k) ?? 3) - d;
  if (hp <= 0) {
    // ひびの入った壁は 縦につながった ぶんまで まとめて くずれる
    let r0 = r, r1 = r;
    while (tAt(c, r0 - 1) === T.BRK) r0--;
    while (tAt(c, r1 + 1) === T.BRK) r1++;
    for (let rr = r0; rr <= r1; rr++) { breakTile(c, rr); S.bhp.delete(rr * S.cols + c); }
    return true;
  }
  S.bhp.set(k, hp); SFX.tink(); return false;
}

// ===== タイル描画（静的レイヤーにまとめて描く） =====
function renderLayer() {
  const cvs = document.createElement('canvas');
  cvs.width = S.cols * TS * SC; cvs.height = H * SC;
  const prev = ctx; ctx = cvs.getContext('2d'); ctx.scale(SC, SC);
  const rng = mulberry(S.def.seed || 99);
  for (let c = 0; c < S.cols; c++) for (let r = 0; r < ROWS; r++) {
    const t = tAt(c, r); if (t) drawTile(t, c, r, rng());
  }
  ctx = prev;
  return cvs;
}
function drawTile(t, c, r, rv) {
  const x = c * TS, y = r * TS, th = S.th;
  const up = tAt(c, r - 1), exposed = !solidT(up) && r > 0;
  if (t === T.SOLID || t === T.VENT) {
    R(x, y, TS, TS, th.tile);
    const st = th.style;
    if (st === 'metal') {
      R(x + 1, y + 1, TS - 2, TS - 2, shade(th.tile, 0.08));
      R(x + 2, y + 2, TS - 4, TS - 4, th.tile);
      R(x + 1, y + TS - 2, TS - 2, 1, th.lo);
      R(x + TS - 2, y + 1, 1, TS - 2, th.lo);
      for (const [px, py] of [[3, 3], [12, 3], [3, 12], [12, 12]]) R(x + px, y + py, 1, 1, th.hi);
      if (rv < 0.2) R(x + 5, y + 7, 6, 2, th.lo);
    } else if (st === 'rock' || st === 'coral') {
      R(x, y + TS - 3, TS, 3, shade(th.tile, -0.15));
      R(x + (rv * 10 | 0), y + 4 + (rv * 7 | 0) % 8, 3, 2, th.lo);
      R(x + ((rv * 37 | 0) % 12), y + 10, 2, 2, th.hi);
      if (rv > 0.7) R(x + 2, y + 2, 4, 1, th.hi);
    } else if (st === 'ice') {
      R(x, y, TS, TS, th.tile);
      ctx.fillStyle = 'rgba(255,255,255,.45)';
      ctx.beginPath(); ctx.moveTo(x + 2 + rv * 4, y + TS); ctx.lineTo(x + 6 + rv * 4, y + TS); ctx.lineTo(x + 14, y + 2); ctx.lineTo(x + 11, y + 2); ctx.fill();
      R(x, y + TS - 1, TS, 1, th.lo);
    } else if (st === 'cloud') {
      R(x, y, TS, TS, th.tile);
      CIR(x + 4 + rv * 8, y + 8, 3, th.hi, null);
      R(x, y + TS - 2, TS, 2, th.lo);
    } else if (st === 'organic') {
      R(x, y, TS, TS, th.tile);
      R(x + (rv * 12 | 0), y + 6, 3, 3, th.lo);
      R(x + 3, y + 11, 2, 2, th.hi);
      if (rv > 0.6) { ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x + 8, y); ctx.quadraticCurveTo(x + 4, y + 8, x + 10, y + 16); ctx.stroke(); }
    } else if (st === 'brick') {
      R(x, y, TS, TS, th.lo);
      const off = r % 2 ? 4 : 0;
      for (let by = 0; by < 2; by++) for (let bx = -1; bx < 2; bx++) {
        const xx = x + bx * 8 + (by ? off : 0) + (r % 2 ? 0 : 0);
        R(Math.max(x, xx + 0.5), y + by * 8 + 0.5, Math.min(7, x + TS - xx - 0.5), 7, th.tile);
      }
    }
    if (exposed) {
      if (st === 'ice' || st === 'cloud') { R(x, y, TS, 3, th.cap); CIR(x + 4, y + 3, 2.2, th.cap, null); CIR(x + 11, y + 3.5, 2.5, th.cap, null); }
      else if (st === 'organic') { R(x, y, TS, 3, th.cap); for (let i = 0; i < 4; i++) POLY([x + i * 4, y + 3, x + i * 4 + 2, y + 6, x + i * 4 + 4, y + 3], th.cap, null); R(x, y, TS, 1, shade(th.cap, 0.3)); }
      else if (st === 'coral') { R(x, y, TS, 2, th.hi); if (rv > 0.5) { CIR(x + 5, y - 1, 2, th.cap, null); CIR(x + 8, y - 3, 1.5, th.cap, null); } }
      else if (S.def.theme === 'intro') { R(x, y, TS, 3, '#222'); for (let i = 0; i < 4; i++) POLY([x + i * 4, y + 3, x + i * 4 + 2, y, x + i * 4 + 4, y, x + i * 4 + 2, y + 3], th.cap, null); }
      else { R(x, y, TS, 2, th.hi); R(x, y + 2, TS, 1, th.cap); }
    }
    if (!solidT(tAt(c - 1, r))) R(x, y, 1, TS, th.lo);
    if (!solidT(tAt(c + 1, r))) R(x + TS - 1, y, 1, TS, th.lo);
    if (t === T.VENT) {
      R(x + 1, y, TS - 2, 5, '#222');
      for (let i = 0; i < 4; i++) R(x + 2 + i * 3.5, y + 1, 2, 3, '#ff6a20');
    }
  } else if (t === T.BRK) {
    R(x, y, TS, TS, shade(th.tile, 0.12));
    RR(x + 0.5, y + 0.5, TS - 1, TS - 1, 2, shade(th.hi, -0.1), th.lo);
    ctx.strokeStyle = th.lo; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + 3, y + 2); ctx.lineTo(x + 7, y + 7); ctx.lineTo(x + 5, y + 12); ctx.moveTo(x + 7, y + 7); ctx.lineTo(x + 13, y + 9); ctx.stroke();
  } else if (t === T.LAD) {
    if (S.def.theme === 'vine') {
      ctx.strokeStyle = '#3a8a2a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + 5, y); ctx.quadraticCurveTo(x + 2, y + 8, x + 5, y + 16); ctx.moveTo(x + 11, y); ctx.quadraticCurveTo(x + 14, y + 8, x + 11, y + 16); ctx.stroke();
      for (let i = 0; i < 2; i++) { R(x + 4, y + 4 + i * 8, 8, 1.5, '#5ab03a'); POLY([x + 12, y + 3 + i * 8, x + 16, y + 1 + i * 8, x + 14, y + 5 + i * 8], '#6ac040', null); }
    } else {
      R(x + 2, y, 2, TS, '#c8ccd8'); R(x + 12, y, 2, TS, '#c8ccd8');
      R(x + 3, y, 1, TS, '#7a7e8a'); R(x + 13, y, 1, TS, '#7a7e8a');
      for (let i = 0; i < 4; i++) R(x + 2, y + 2 + i * 4, 12, 1.5, '#e8ecf4');
    }
  } else if (t === T.ONE) {
    RR(x, y, TS, 5, 1, th.hi, th.lo);
    R(x + 1, y + 1, TS - 2, 1, '#fff8');
    R(x + 6, y + 5, 4, 3, th.lo);
  } else if (t === T.SPIKE) {
    for (let i = 0; i < 4; i++) {
      POLY([x + i * 4, y + TS, x + i * 4 + 2, y + 5, x + i * 4 + 4, y + TS], '#c8ccd8', '#3a3e4a');
      R(x + i * 4 + 1.6, y + 7, 0.8, 6, '#fff');
    }
  }
}
// 毎フレーム描く動的タイル（溶岩・シャッター）
function drawDynTiles() {
  const c0 = Math.floor(S.camX / TS) - 1, c1 = c0 + W / TS + 2;
  for (let c = c0; c <= c1; c++) for (let r = 0; r < ROWS; r++) {
    const t = tAt(c, r), x = c * TS, y = r * TS;
    if (c < 0 || c >= S.cols) continue;
    if (t === T.LAVA) {
      const ph = S.t * 0.08 + c;
      R(x, y + 3, TS, TS - 3, '#c02a08');
      R(x, y + 6, TS, TS - 6, '#ff5a10');
      for (let i = 0; i < 4; i++) R(x + i * 4, y + 3 + Math.sin(ph + i) * 1.5, 4, 3, '#ffb020');
      if ((S.t + c * 13) % 50 === 0) addPart({ x: x + rnd(16), y: y + 4, vx: 0, vy: -1.5, g: 0.06, life: 30, c: '#ffcc40', s: 2 });
    }
    if (c === S.doorCol && r < ROWS - 2 && r >= ROWS - 5) {
      const open = S.doorOpen || 0; // 0..1
      const hgt = TS * (1 - open);
      if (hgt > 0.5) {
        const yy = y + TS - hgt;
        R(x, yy, TS, hgt, '#6a7088');
        for (let i = 0; i < hgt; i += 4) R(x, yy + i, TS, 1, '#3a3e50');
        R(x, yy, 2, hgt, '#9aa0b8'); R(x + TS - 2, yy, 2, hgt, '#2a2e3a');
        if (r === ROWS - 4) R(x + 6, yy + hgt / 2 - 1, 4, 2, S.boss ? '#ff4040' : '#40ff80');
      }
    }
  }
}

// ===== 背景 =====
function makeBG(th) {
  const r = mulberry(th.bg.length * 131 + th.sky[1].charCodeAt(2));
  const L = n => Array.from({ length: n }, () => ({ x: r(), y: r(), s: r(), t: r() }));
  return { a: L(24), b: L(18), c: L(40), d: L(60) };
}
function wrapX(x, par, span) { return ((x - S.camX * par) % span + span) % span; }
function drawBG() {
  const th = S.th, bg = S.bg, t = S.t;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, th.sky[0]); g.addColorStop(0.6, th.sky[1]); g.addColorStop(1, th.sky[2]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const span = 520;
  switch (th.bg) {
    case 'city': {
      CIR(250, 46, 18, '#fff4c8', null); CIR(244, 42, 16, th.sky[0] + '00', null);
      for (const b of bg.a) { const x = wrapX(b.x * span, 0.12, span) - 40, h = 50 + b.s * 90, w = 22 + b.t * 26; R(x, H - h - 30, w, h + 30, '#1c2250'); for (let i = 0; i < h / 10; i++) if ((i * 7 + (b.x * 100 | 0)) % 3) R(x + 4 + (i % 2) * (w / 2 - 4), H - h - 26 + i * 10, 4, 3, '#ffe08a55'); }
      for (const b of bg.b) { const x = wrapX(b.x * span, 0.3, span) - 40, h = 30 + b.s * 70, w = 30 + b.t * 20; R(x, H - h - 20, w, h + 20, '#141838'); R(x + 3, H - h - 18, w - 6, 2, '#ff4a6a88'); }
      R(0, H - 46, W, 4, '#0a0c22');
      for (let i = 0; i < 12; i++) { const x = wrapX(i * 44, 0.5, 528) - 4; R(x, H - 80, 1.5, 34, '#2a2e50'); CIR(x + 1, H - 80, 2.5, '#ffe8a0', null); }
      break;
    }
    case 'volcano': {
      for (const b of bg.a.slice(0, 6)) { const x = wrapX(b.x * span, 0.08, span) - 60, h = 70 + b.s * 60; POLY([x, H, x + 70, H - h, x + 90, H - h, x + 170, H], '#2a0c08', null); R(x + 70, H - h, 20, 4, '#ff6a20'); }
      for (const b of bg.b.slice(0, 8)) { const x = wrapX(b.x * span, 0.25, span) - 50, h = 40 + b.s * 40; POLY([x, H, x + 50, H - h, x + 100, H], '#3a120a', null); }
      for (const p of bg.d) { const y = H - ((p.y * H + t * (0.3 + p.s * 0.6)) % H), x = wrapX(p.x * span + Math.sin(t * 0.02 + p.t * 9) * 8, 0.4, span) - 20; R(x, y, 1.5, 1.5, p.s > 0.5 ? '#ffb030' : '#ff5020'); }
      break;
    }
    case 'sea': {
      ctx.fillStyle = 'rgba(160,230,255,.06)';
      for (let i = 0; i < 5; i++) { const x = wrapX(i * 110 + Math.sin(t * 0.01 + i) * 20, 0.1, 550) - 60; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x + 110, H); ctx.lineTo(x + 50, H); ctx.fill(); }
      for (const b of bg.a.slice(0, 10)) { const x = wrapX(b.x * span, 0.15, span) - 40, h = 30 + b.s * 60; RR(x, H - h, 50 + b.t * 40, h + 10, 18, '#062a48', null); }
      for (const b of bg.b) { const x = wrapX(b.x * span, 0.35, span) - 10, h = 40 + b.s * 70; ctx.strokeStyle = '#0a5a4a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, H); for (let i = 1; i <= 6; i++) ctx.lineTo(x + Math.sin(t * 0.03 + i + b.t * 6) * 4 * i / 6, H - h * i / 6); ctx.stroke(); }
      for (const p of bg.c) { const y = H - ((p.y * H + t * (0.3 + p.s)) % (H + 10)), x = wrapX(p.x * span + Math.sin(t * 0.05 + p.t * 9) * 3, 0.5, span) - 10; CIR(x, y, 1 + p.s * 2, 'rgba(200,240,255,.25)', 'rgba(220,250,255,.5)', 0.5); }
      break;
    }
    case 'factory': {
      for (let i = 0; i < 6; i++) { const x = wrapX(i * 96, 0.1, 576) - 50, y = 60 + (i % 3) * 40, rr = 26 + (i % 2) * 14; ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.006 * (i % 2 ? 1 : -1)); for (let k = 0; k < 8; k++) { ctx.rotate(Math.PI / 4); R(-4, -rr - 6, 8, 8, '#22224a'); } CIR(0, 0, rr, '#22224a', null); CIR(0, 0, rr * 0.4, th.sky[0], null); ctx.restore(); }
      for (let i = 0; i < 4; i++) { const y = 110 + i * 26; R(0, y, W, 7, '#1c1838'); R(0, y + 1, W, 1, '#3a3470'); for (let k = 0; k < 6; k++) { const x = wrapX(k * 90 + i * 30, 0.3, 540) - 20; R(x, y - 2, 6, 11, '#2a2650'); } }
      for (let i = 0; i < 10; i++) { const x = wrapX(i * 53, 0.3, 530); if ((t + i * 37) % 90 < 45) CIR(x, 100 + (i * 29) % 100, 1.5, i % 2 ? '#ffe040' : '#ff3050', null); }
      if (t % 300 < 6) { ctx.fillStyle = 'rgba(255,255,200,.08)'; ctx.fillRect(0, 0, W, H); }
      break;
    }
    case 'snow': {
      for (const b of bg.a.slice(0, 7)) { const x = wrapX(b.x * span, 0.06, span) - 80, h = 80 + b.s * 60; POLY([x, H, x + 90, H - h, x + 180, H], '#7aa0d0', null); POLY([x + 62, H - h + 30, x + 90, H - h, x + 118, H - h + 30, x + 100, H - h + 24, x + 90, H - h + 32, x + 78, H - h + 24], '#fff', null); }
      for (const b of bg.b) { const x = wrapX(b.x * span, 0.3, span) - 20, h = 26 + b.s * 30; POLY([x, H - 20, x + 10, H - 20 - h, x + 20, H - 20], '#3a6a8a', null); R(x + 8, H - 20, 4, 20, '#3a4a5a'); }
      for (const p of bg.d) { const y = (p.y * H + t * (0.4 + p.s * 0.6)) % H, x = wrapX(p.x * span + Math.sin(t * 0.02 + p.t * 9) * 10, 0.5, span) - 10; CIR(x, y, 0.8 + p.s, '#fff', null); }
      break;
    }
    case 'canyon': {
      CIR(70, 60, 22, '#ffe0a0', null);
      for (const b of bg.a.slice(0, 8)) { const x = wrapX(b.x * span, 0.08, span) - 60, h = 60 + b.s * 50, w = 60 + b.t * 60; R(x, H - h, w, h, '#8a4a2a'); R(x - 4, H - h, w + 8, 6, '#a05a32'); R(x, H - h + 20, w, 3, '#7a3a20'); }
      for (const b of bg.b.slice(0, 10)) { const x = wrapX(b.x * span, 0.25, span) - 50, h = 30 + b.s * 40, w = 40 + b.t * 40; R(x, H - h, w, h, '#5a3018'); R(x - 3, H - h, w + 6, 4, '#6a3a1e'); }
      for (const p of bg.c) { const x = wrapX(p.x * span + t * (0.5 + p.s), 0.4, span) - 10; R(x, p.y * H, 1, 1, '#f0c890aa'); }
      break;
    }
    case 'sky': {
      for (const b of bg.a.slice(0, 5)) { const x = wrapX(b.x * span, 0.05, span) - 60, y = 120 + b.s * 40; RR(x, y, 60, 18, 8, '#8a9ac0', null); POLY([x + 10, y + 18, x + 30, y + 40, x + 50, y + 18], '#7a6a5a', null); R(x + 8, y - 2, 44, 4, '#5ab060'); }
      for (const b of bg.b) { const x = wrapX(b.x * span + t * 0.1, 0.15, span) - 60, y = 20 + b.s * 160; for (let k = 0; k < 4; k++) CIR(x + k * 14, y + Math.sin(k) * 4, 10 + (k % 2) * 4, 'rgba(255,255,255,.75)', null); }
      for (const b of bg.a.slice(5, 12)) { const x = wrapX(b.x * span + t * 0.3, 0.4, span) - 60, y = 160 + b.s * 70; for (let k = 0; k < 5; k++) CIR(x + k * 16, y + Math.sin(k * 2) * 5, 13, '#fff', null); }
      break;
    }
    case 'space': {
      for (const p of bg.d) { const x = wrapX(p.x * span, 0.04, span) - 10, tw = Math.sin(t * 0.05 + p.t * 30) > 0.6; R(x, p.y * H, tw ? 1.5 : 1, tw ? 1.5 : 1, p.s > 0.8 ? '#ffe8a0' : '#cfd8ff'); }
      ctx.fillStyle = 'rgba(160,60,255,.08)'; for (const b of bg.a.slice(0, 5)) { const x = wrapX(b.x * span, 0.06, span) - 60; ctx.beginPath(); ctx.ellipse(x, 40 + b.s * 120, 70, 30, b.t, 0, 7); ctx.fill(); }
      { const x = wrapX(260, 0.1, 600) - 40; CIR(x, 70, 30, '#5a3aa0', null); CIR(x - 8, 62, 22, '#7a5ac8', null); ctx.strokeStyle = '#ffe07088'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, 72, 52, 10, -0.25, 0, 7); ctx.stroke(); }
      for (const p of bg.c.slice(0, 15)) { const x = wrapX(p.x * span, 0.3, span) - 10; R(x, p.y * H, 2, 2, '#fff'); }
      break;
    }
    case 'jungle': {
      for (const b of bg.a) { const x = wrapX(b.x * span, 0.15, span) - 20, w = 10 + b.s * 12; R(x, 0, w, H, '#0a2a10'); CIR(x + w / 2, 10 + b.t * 40, 26, '#0e3a16', null); }
      for (const b of bg.b) { const x = wrapX(b.x * span, 0.35, span) - 20, w = 14 + b.s * 10; R(x, 0, w, H, '#062010'); ctx.strokeStyle = '#1a5a1a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + w, 0); ctx.quadraticCurveTo(x + w + 20, 60 + b.t * 30, x + w + 8 + Math.sin(t * 0.02 + b.t * 6) * 4, 100 + b.t * 50); ctx.stroke(); }
      for (const p of bg.c.slice(0, 20)) { const x = wrapX(p.x * span + Math.sin(t * 0.02 + p.t * 9) * 12, 0.45, span) - 10, y = p.y * H + Math.cos(t * 0.03 + p.s * 9) * 8; if (Math.sin(t * 0.06 + p.t * 20) > 0) CIR(x, y, 1.2, '#e8ff70', null); }
      break;
    }
    case 'crater': {
      CIR(240, 50, 26, '#4a1030', null); CIR(234, 46, 20, '#6a1a40', null);
      for (const b of bg.a.slice(0, 10)) { const x = wrapX(b.x * span, 0.1, span) - 40, h = 40 + b.s * 60; POLY([x, H, x + 15, H - h, x + 30, H - h * 0.7, x + 45, H - h * 1.1, x + 60, H], '#1a0818', null); }
      for (const b of bg.b.slice(0, 10)) { const x = wrapX(b.x * span, 0.3, span) - 20, h = 16 + b.s * 26; POLY([x, H - 30, x + 6, H - 30 - h, x + 12, H - 30], 'rgba(200,64,255,' + (0.5 + Math.sin(t * 0.05 + b.t * 9) * 0.3) + ')', null); }
      for (const p of bg.d.slice(0, 30)) { const y = H - ((p.y * H + t * 0.3) % H), x = wrapX(p.x * span, 0.4, span); R(x, y, 1, 1, '#ff80c0'); }
      break;
    }
    case 'fortress': {
      for (let i = 0; i < 8; i++) { const x = wrapX(i * 70, 0.2, 560) - 70; R(x, 30, 50, H, '#160c24'); RR(x + 12, 60, 26, 40, 13, '#08040e', null); RR(x + 12, 130, 26, 40, 13, '#08040e', null); if ((t + i * 20) % 60 < 40) CIR(x + 25, 50, 2, '#ff2a5a', null); }
      for (let i = 0; i < 6; i++) { const x = wrapX(i * 96 + 30, 0.4, 576) - 30; R(x, 0, 18, 70, '#5a0a20'); POLY([x, 70, x + 9, 80, x + 18, 70], '#5a0a20', null); CIR(x + 9, 30, 5, '#ff2a5a', null); CIR(x + 9, 30, 2.5, '#5a0a20', null); }
      break;
    }
  }
}
