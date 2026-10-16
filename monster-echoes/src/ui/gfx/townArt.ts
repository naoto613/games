// 町の 描画（参考画像3「町の画面」）。地面の 層を 1枚の 大きな 絵に まとめて 描き、
// 建物・木・噴水などの 物体は 1つずつ 絵に して、キャラクターと 奥行きじゅんに かさねる。
// 1タイル＝32ドット。いままでの タイル描画（16ドット相当）より 2倍 こまかく 描く。
import type { BuildingStyle, TownArt, TownObject } from '../../data/towns/builder';
import { E, mix, mkCanvas, P, Pix, R, RR, shade } from './Pix';

export const TT = 32;
type G = CanvasRenderingContext2D;

/** 0〜1 の ゆらぎ（座標から きまる） */
export const hash = (x: number, y: number, s = 0) => {
  let n = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};
const rect = (g: G, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

// ---------------------------------------------------------------- 色
export const C = {
  grass: ['#4f9e3c', '#5cae44', '#68bc4c', '#7ccc58', '#3c8432', '#2f6e2a'],
  stone: ['#d6c6a2', '#c8b690', '#e4d6b6', '#a8946e', '#8a7656'],
  plaza: ['#e2d6ba', '#d2c4a4', '#efe6d0', '#b4a482', '#9c8a68'],
  dirt: ['#c99a62', '#b88a54', '#dab07a', '#a07444', '#8a6238'],
  water: ['#2f7fd0', '#3f92de', '#5aaeec', '#8fd2f8', '#1f62ae', '#e8f8ff'],
  bridge: ['#b8ae9a', '#a49884', '#ccc4b2', '#7e7462'],
};

// ---------------------------------------------------------------- 地面
export function grass(g: G, ox: number, oy: number, tx: number, ty: number) {
  const k = C.grass;
  rect(g, ox, oy, TT, TT, k[1]);
  // まだらの 明暗（となりと つながる ように 世界座標で ゆらぐ）
  for (let y = 0; y < TT; y += 4) for (let x = 0; x < TT; x += 4) {
    const n = hash(Math.floor((tx * TT + x) / 12), Math.floor((ty * TT + y) / 12), 3);
    if (n < 0.28) rect(g, ox + x, oy + y, 4, 4, k[0]);
    else if (n > 0.8) rect(g, ox + x, oy + y, 4, 4, k[2]);
  }
  // くさの 葉（たてに 2〜3ドット）
  for (let i = 0; i < 18; i++) {
    const x = Math.floor(hash(tx, ty, i) * 30), y = Math.floor(hash(ty, tx, i + 40) * 28);
    const hi = hash(tx, ty, i + 80) > 0.5;
    rect(g, ox + x, oy + y, 1, 3, hi ? k[3] : k[4]);
    rect(g, ox + x + 1, oy + y + 1, 1, 2, hi ? k[2] : k[0]);
  }
  // ちいさな 花（ときどき）
  if (hash(tx, ty, 9) < 0.18) {
    const cols = ['#fff6e0', '#ffe060', '#ff8ab8', '#b8a8ff'];
    const c = cols[Math.floor(hash(tx, ty, 10) * 4)];
    for (let i = 0; i < 3; i++) {
      const x = 4 + Math.floor(hash(tx, ty, 11 + i) * 24), y = 4 + Math.floor(hash(tx, ty, 21 + i) * 24);
      rect(g, ox + x, oy + y + 2, 1, 2, k[4]);
      rect(g, ox + x - 1, oy + y, 3, 2, c); rect(g, ox + x, oy + y - 1, 1, 4, c);
      rect(g, ox + x, oy + y + 0.5, 1, 1, '#ffd040');
    }
  }
}

/** 石を しきつめた 地面（石畳・円形広場） */
function cobble(g: G, ox: number, oy: number, tx: number, ty: number, pal: string[], ring?: { cx: number; cy: number }) {
  rect(g, ox, oy, TT, TT, pal[3]);
  if (ring) {
    // 円形広場：中心から 同心円と 放射の 目地
    for (let y = 0; y < TT; y++) for (let x = 0; x < TT; x++) {
      const wx = tx * TT + x + 0.5, wy = ty * TT + y + 0.5;
      const dx = wx - ring.cx, dy = wy - ring.cy;
      const d = Math.hypot(dx, dy);
      const band = Math.floor(d / 13);
      const seg = Math.max(8, band * 7);
      const a = ((Math.atan2(dy, dx) / (Math.PI * 2) + 1) * seg + band * 0.5) % 1;
      const fr = d / 13 - band;
      const joint = fr < 0.09 || a < 0.06;
      if (joint) continue;
      const v = hash(band, Math.floor(((Math.atan2(dy, dx) / (Math.PI * 2) + 1) * seg + band * 0.5)), 5);
      let c = v < 0.33 ? pal[1] : v > 0.75 ? pal[2] : pal[0];
      if (fr < 0.22 || a < 0.14) c = mix(c, '#ffffff', 0.25); // 石の 角の ひかり
      else if (fr > 0.86) c = mix(c, pal[4], 0.35);
      g.fillStyle = c; g.fillRect(ox + x, oy + y, 1, 1);
    }
    return;
  }
  // 石畳：ずらして ならべた 角の まるい 石
  for (let row = -1; row < 5; row++) {
    const sy = row * 8 + ((tx & 1) ? 4 : 0) * 0;
    const off = ((ty * 4 + row) & 1) * 5;
    for (let col = -1; col < 4; col++) {
      const sx = col * 10 + off + Math.floor(hash(tx * 7 + col, ty * 5 + row, 1) * 2);
      const w = 8 + Math.floor(hash(tx + col, ty + row, 2) * 2), h = 6;
      const v = hash(tx * 11 + col, ty * 13 + row, 4);
      const base = v < 0.3 ? pal[1] : v > 0.78 ? pal[2] : pal[0];
      const x0 = ox + sx, y0 = oy + sy;
      g.save(); g.beginPath(); g.rect(ox, oy, TT, TT); g.clip();
      rect(g, x0 + 1, y0, w - 2, h, base); rect(g, x0, y0 + 1, w, h - 2, base);
      rect(g, x0 + 1, y0, w - 3, 1, mix(base, '#ffffff', 0.35)); rect(g, x0, y0 + 1, 1, h - 3, mix(base, '#ffffff', 0.25));
      rect(g, x0 + 1, y0 + h - 1, w - 2, 1, mix(base, pal[4], 0.45)); rect(g, x0 + w - 1, y0 + 1, 1, h - 2, mix(base, pal[4], 0.35));
      g.restore();
    }
  }
}

export function dirt(g: G, ox: number, oy: number, tx: number, ty: number) {
  const k = C.dirt;
  rect(g, ox, oy, TT, TT, k[0]);
  for (let y = 0; y < TT; y += 2) for (let x = 0; x < TT; x += 2) {
    const n = hash(tx * TT + x, ty * TT + y, 6);
    if (n < 0.12) rect(g, ox + x, oy + y, 2, 2, k[1]);
    else if (n > 0.93) rect(g, ox + x, oy + y, 2, 1, k[2]);
  }
  for (let i = 0; i < 5; i++) { // 小石
    const x = Math.floor(hash(tx, ty, 30 + i) * 28), y = Math.floor(hash(tx, ty, 40 + i) * 28);
    rect(g, ox + x, oy + y, 3, 2, k[3]); rect(g, ox + x, oy + y, 2, 1, k[2]);
  }
}

/** 水（波の きらめきは frame で うごく）。岸の ふちに 土手と あわ */
export function water(g: G, ox: number, oy: number, tx: number, ty: number, f: number, isW: (x: number, y: number) => boolean) {
  const k = C.water;
  const grd = g.createLinearGradient(0, oy, 0, oy + TT);
  grd.addColorStop(0, k[1]); grd.addColorStop(1, k[0]);
  g.fillStyle = grd; g.fillRect(ox, oy, TT, TT);
  for (let i = 0; i < 6; i++) {
    const x = Math.floor(hash(tx, ty, 50 + i) * 26), y = Math.floor(hash(tx, ty, 60 + i) * 30);
    const ph = (f + Math.floor(hash(tx, ty, 70 + i) * 4)) % 4;
    if (ph === 3) continue;
    rect(g, ox + x, oy + y, 4 + ph * 2, 1, ph === 1 ? k[3] : k[2]);
  }
  // 岸（となりが 陸の 辺）
  const up = !isW(tx, ty - 1), dn = !isW(tx, ty + 1), lf = !isW(tx - 1, ty), rt = !isW(tx + 1, ty);
  if (up) { rect(g, ox, oy, TT, 5, '#8a6a46'); rect(g, ox, oy + 5, TT, 2, k[4]); for (let x = 0; x < TT; x += 3) if (hash(tx * TT + x, ty, 7) < 0.5) rect(g, ox + x, oy + 7, 2, 1, k[5]); }
  if (dn) { for (let x = 0; x < TT; x += 2) rect(g, ox + x, oy + TT - 3 + (hash(tx * TT + x, ty, 8) < 0.5 ? 1 : 0), 2, 3, k[5]); }
  if (lf) { rect(g, ox, oy, 3, TT, '#8a6a46'); rect(g, ox + 3, oy, 1, TT, k[5]); }
  if (rt) { rect(g, ox + TT - 3, oy, 3, TT, '#8a6a46'); rect(g, ox + TT - 4, oy, 1, TT, k[5]); }
}

function bridge(g: G, ox: number, oy: number, tx: number, ty: number, isW: (x: number, y: number) => boolean, isB: (x: number, y: number) => boolean) {
  const k = C.bridge;
  // 川を よこぎる 石の 橋（となりの 橋の ならびで 向きを きめる）
  const horiz = isB(tx - 1, ty) || isB(tx + 1, ty) || isW(tx, ty - 1) || isW(tx, ty + 1);
  rect(g, ox, oy, TT, TT, k[0]);
  if (horiz) {
    for (let x = 0; x < TT; x += 8) { rect(g, ox + x, oy, 1, TT, k[3]); rect(g, ox + x + 1, oy, 6, TT, hash(tx, x, 2) < 0.5 ? k[0] : k[1]); rect(g, ox + x + 1, oy, 6, 1, k[2]); }
    if (!isB(tx, ty - 1)) { rect(g, ox, oy, TT, 7, '#d8d0c0'); rect(g, ox, oy + 6, TT, 2, k[3]); for (let x = 2; x < TT; x += 10) rect(g, ox + x, oy - 4, 5, 10, '#e6e0d4'); }
    if (!isB(tx, ty + 1)) { rect(g, ox, oy + TT - 6, TT, 6, '#d8d0c0'); rect(g, ox, oy + TT - 7, TT, 1, '#fffaf0'); rect(g, ox, oy + TT - 1, TT, 1, k[3]); }
  } else {
    for (let y = 0; y < TT; y += 8) { rect(g, ox, oy + y, TT, 1, k[3]); rect(g, ox, oy + y + 1, TT, 1, k[2]); }
    if (!isB(tx - 1, ty)) rect(g, ox, oy, 6, TT, '#d8d0c0');
    if (!isB(tx + 1, ty)) rect(g, ox + TT - 6, oy, 6, TT, '#d8d0c0');
  }
}

function steps(g: G, ox: number, oy: number) {
  rect(g, ox, oy, TT, TT, '#c8c0b0');
  for (let y = 0; y < TT; y += 8) { rect(g, ox, oy + y, TT, 2, '#f0eadc'); rect(g, ox, oy + y + 6, TT, 2, '#948a78'); }
}

/** 草の ふちを ほかの 地面に すこし はみださせる（なじませる） */
function grassFringe(g: G, ox: number, oy: number, tx: number, ty: number, gnd: (x: number, y: number) => string) {
  const k = C.grass;
  const side = (dx: number, dy: number) => gnd(tx + dx, ty + dy) === ',';
  for (let i = 0; i < TT; i += 2) {
    const r1 = Math.floor(hash(tx * TT + i, ty, 12) * 4), r2 = Math.floor(hash(tx, ty * TT + i, 13) * 4);
    if (side(0, -1)) { rect(g, ox + i, oy, 2, r1 + 1, k[1]); rect(g, ox + i, oy + r1 + 1, 2, 1, k[4]); }
    if (side(0, 1)) { rect(g, ox + i, oy + TT - r1 - 1, 2, r1 + 1, k[1]); rect(g, ox + i, oy + TT - r1 - 2, 2, 1, k[2]); }
    if (side(-1, 0)) rect(g, ox, oy + i, r2 + 1, 2, k[1]);
    if (side(1, 0)) rect(g, ox + TT - r2 - 1, oy + i, r2 + 1, 2, k[1]);
  }
}

/** 地面の 層（町ぜんたい）。水が うごくので 4まい つくる */
export function renderGround(art: TownArt, frame: number): HTMLCanvasElement {
  const [c, g] = mkCanvas(art.w * TT, art.h * TT);
  const gnd = (x: number, y: number) => (x < 0 || y < 0 || x >= art.w || y >= art.h ? ',' : art.ground[y][x]);
  const isW = (x: number, y: number) => gnd(x, y) === '~';
  const isB = (x: number, y: number) => gnd(x, y) === '=';
  // 円形広場の 中心（'o' の まとまりの 重心）
  let sx = 0, sy = 0, n = 0;
  for (let y = 0; y < art.h; y++) for (let x = 0; x < art.w; x++) if (art.ground[y][x] === 'o') { sx += x + 0.5; sy += y + 0.5; n++; }
  const ring = n ? { cx: (sx / n) * TT, cy: (sy / n) * TT } : undefined;
  for (let y = 0; y < art.h; y++) for (let x = 0; x < art.w; x++) {
    const ox = x * TT, oy = y * TT, t = art.ground[y][x];
    switch (t) {
      case '.': cobble(g, ox, oy, x, y, C.stone); grassFringe(g, ox, oy, x, y, gnd); break;
      case 'o': cobble(g, ox, oy, x, y, C.plaza, ring); grassFringe(g, ox, oy, x, y, gnd); break;
      case ':': dirt(g, ox, oy, x, y); grassFringe(g, ox, oy, x, y, gnd); break;
      case '~': water(g, ox, oy, x, y, frame, isW); break;
      case '=': bridge(g, ox, oy, x, y, isW, isB); break;
      case '_': steps(g, ox, oy); break;
      default: grass(g, ox, oy, x, y);
    }
  }
  // 広場の ふち石
  if (ring) {
    let R2 = 0;
    for (let y = 0; y < art.h; y++) for (let x = 0; x < art.w; x++) if (art.ground[y][x] === 'o') R2 = Math.max(R2, Math.hypot((x + 0.5) * TT - ring.cx, (y + 0.5) * TT - ring.cy));
    g.strokeStyle = '#b8a47e'; g.lineWidth = 3;
    g.beginPath(); g.arc(ring.cx, ring.cy, R2 + 6, 0, Math.PI * 2); g.stroke();
  }
  return c;
}

/** 町の そとがわ（森の 屋根） */
let forestTex: HTMLCanvasElement | null = null;
export function forestTexture(): HTMLCanvasElement {
  if (forestTex) return forestTex;
  const p = new Pix(64, 64, 1);
  p.rect(0, 0, 64, 64, '#1f4a22');
  for (const [x, y, r] of [[8, 10, 13], [36, 6, 14], [58, 14, 12], [20, 34, 15], [50, 40, 14], [6, 56, 12], [34, 60, 13], [62, 58, 11]] as [number, number, number][]) {
    p.part(E(x, y, r, r * 0.9), '#2f7a32', { ol: '#173a1a', hi: '#5aa848', lo: '#1f5a24' });
  }
  forestTex = p.canvas();
  return forestTex;
}

// ---------------------------------------------------------------- 物体
export type Sprite = { img: HTMLCanvasElement; dx: number; dy: number; /** 奥行きの 基準（ワールド y・ピクセル） */ base: number };

const cache = new Map<string, HTMLCanvasElement>();
const memo = (key: string, make: () => HTMLCanvasElement) => { let c = cache.get(key); if (!c) { c = make(); cache.set(key, c); } return c; };

export function shadowEllipse(g: G, cx: number, cy: number, rx: number, ry: number, a = 0.28) {
  g.fillStyle = `rgba(20,30,10,${a})`; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill();
}

export function treeImg(v: number) {
  return memo(`tree${v}`, () => {
    const p = new Pix(52, 70, 1);
    const leaf = ['#3f9a3a', '#4aa840', '#368c34', '#56b246'][v];
    // みき
    p.part(R(22, 46, 8, 18), '#7a5432', { ol: '#3a2412', hi: '#a07448' });
    p.part(P(18, 64, 34, 64, 30, 58, 22, 58), '#6a4628', { ol: '#3a2412' });
    // は（まるい かたまりを かさねる）
    const blobs: [number, number, number][] = [[26, 30, 21], [14, 36, 12], [38, 36, 12], [20, 20, 12], [33, 19, 12], [26, 12, 11]];
    for (const [x, y, r] of blobs) p.part(E(x, y, r, r * 0.92), leaf, { ol: '#1f4a1c', hi: mix(leaf, '#d8f8a0', 0.35), lo: mix(leaf, '#14361a', 0.45) });
    // 葉の つぶつぶの ひかり
    const c = p.canvas(), g = c.getContext('2d')!;
    for (let i = 0; i < 26; i++) {
      const x = 8 + hash(v, i, 1) * 36, y = 6 + hash(v, i, 2) * 40;
      if (p.get(x, y)) { g.fillStyle = 'rgba(220,255,170,.45)'; g.fillRect(Math.round(x), Math.round(y), 2, 1); }
    }
    return c;
  });
}

export function bushImg(v: number) {
  return memo(`bush${v}`, () => {
    const p = new Pix(36, 28, 1);
    const leaf = ['#4aa840', '#3f9a3a', '#5ab048'][v];
    for (const [x, y, r] of [[11, 16, 9], [24, 16, 9], [18, 10, 9]] as [number, number, number][]) p.part(E(x, y, r, r * 0.85), leaf, { ol: '#1f4a1c', hi: mix(leaf, '#e0ffb0', 0.35) });
    if (v === 1) for (const [x, y] of [[10, 12], [22, 9], [26, 17], [15, 19]]) p.part(E(x, y, 1.6, 1.6), '#ff7ab0', { flat: true, ol: '#8a2a50' });
    return p.canvas();
  });
}

function fountainImg(f: number) {
  return memo(`fountain${f % 4}`, () => {
    const [c, g] = mkCanvas(112, 120);
    const p = new Pix(112, 120, 1);
    // 外の 池（だ円）と ふちの 石
    p.part(E(56, 82, 50, 26), '#cfc6b4', { ol: '#6a6252', hi: '#f4efe4', lo: '#a8a090' });
    p.part(E(56, 82, 42, 20), '#3a8ad8', { flat: true, ol: '#2a5a8a' });
    // 中の 台と 上の 皿
    p.part(R(50, 50, 12, 30), '#d8d0c0', { ol: '#6a6252', hi: '#ffffff' });
    p.part(E(56, 50, 20, 7), '#d4ccbc', { ol: '#6a6252', hi: '#ffffff' });
    p.part(E(56, 49, 15, 4.5), '#5aaeec', { flat: true, ol: '#3a7ab8' });
    p.part(R(53, 30, 6, 18), '#e0d8c8', { ol: '#6a6252', hi: '#ffffff' });
    p.part(E(56, 30, 8, 3.5), '#e0d8c8', { ol: '#6a6252' });
    g.drawImage(p.canvas(), 0, 0);
    // 水しぶき（うごく）
    g.fillStyle = 'rgba(200,240,255,.95)';
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + f * 0.4;
      const t = ((f + i) % 4) / 4;
      g.fillRect(Math.round(56 + Math.cos(a) * (10 + t * 22)), Math.round(32 - 8 + t * t * 44 - t * 20 + Math.sin(a) * 4), 2, 3);
    }
    g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(55, 20 - (f % 2), 2, 10);
    // 池の きらめき
    for (let i = 0; i < 8; i++) { const x = 22 + hash(i, f, 1) * 68, y = 74 + hash(i, f, 2) * 16; g.fillStyle = 'rgba(220,250,255,.8)'; g.fillRect(Math.round(x), Math.round(y), 5, 1); }
    return c;
  });
}

function lampImg(lit: boolean) {
  return memo(`lamp${lit}`, () => {
    const p = new Pix(20, 60, 1);
    p.part(R(8, 18, 4, 38), '#3a3e4e', { ol: '#14161e', hi: '#6a7088' });
    p.part(R(5, 54, 10, 4), '#3a3e4e', { ol: '#14161e' });
    p.part(P(4, 8, 16, 8, 14, 20, 6, 20), lit ? '#ffe8a0' : '#c8d0e0', { ol: '#14161e', hi: '#fffbe0' });
    p.part(P(2, 8, 18, 8, 10, 1), '#2a2e3e', { ol: '#14161e', hi: '#5a607a' });
    return p.canvas();
  });
}

function flowerImg(v: number) {
  return memo(`flower${v}`, () => {
    const p = new Pix(32, 30, 1);
    p.part(RR(1, 14, 30, 14, 3), '#8a5a32', { ol: '#3a2412', hi: '#b07a48' });
    p.part(E(16, 14, 14, 7), '#3f8a34', { ol: '#1f4a1c' });
    const cols = [['#ff6aa0', '#fff070'], ['#ffd040', '#ffffff'], ['#b08aff', '#ff8ab8'], ['#ff7a4a', '#ffe0a0']][v];
    for (let i = 0; i < 9; i++) { const x = 5 + (i % 5) * 5 + (i > 4 ? 2 : 0), y = 9 + (i > 4 ? 6 : 0) + (i % 2); p.part(E(x, y, 2.4, 2.2), cols[i % 2], { ol: shade(cols[i % 2], 0.4) }); }
    return p.canvas();
  });
}

function fenceImg(dir: 'h' | 'v') {
  return memo(`fence${dir}`, () => {
    const p = new Pix(32, 34, 1);
    if (dir === 'h') {
      for (const x of [3, 27]) p.part(R(x, 6, 4, 26), '#a8784a', { ol: '#4a2e14', hi: '#d0a070' });
      p.part(R(0, 12, 32, 4), '#b88a58', { ol: '#4a2e14', hi: '#e0b080' });
      p.part(R(0, 21, 32, 4), '#b88a58', { ol: '#4a2e14', hi: '#e0b080' });
    } else {
      p.part(R(13, 0, 6, 32), '#b88a58', { ol: '#4a2e14', hi: '#e0b080' });
      p.part(R(12, 2, 8, 6), '#a8784a', { ol: '#4a2e14' });
    }
    return p.canvas();
  });
}

function smallImg(kind: string) {
  return memo(kind, () => {
    const p = new Pix(36, 44, 1);
    switch (kind) {
      case 'bench':
        p.part(R(3, 18, 30, 6), '#b07a48', { ol: '#4a2e14', hi: '#e0a870' });
        p.part(R(3, 10, 30, 5), '#a06a3a', { ol: '#4a2e14', hi: '#d09a68' });
        for (const x of [5, 29]) p.part(R(x, 24, 3, 10), '#3a3e4e', { ol: '#14161e' });
        break;
      case 'barrel':
        p.part(RR(6, 12, 24, 28, 6), '#a06a3a', { ol: '#3a2412', hi: '#d09a68' });
        for (const y of [17, 33]) p.rect(6, y, 24, 2, '#5a5e6e');
        p.part(E(18, 13, 11, 4), '#7a4e28', { ol: '#3a2412' });
        break;
      case 'sign':
        p.part(R(16, 18, 4, 24), '#7a5432', { ol: '#3a2412' });
        p.part(RR(3, 6, 30, 16, 2), '#c8965a', { ol: '#4a2e14', hi: '#f0c890' });
        p.line(8, 12, 26, 12, '#6a4628'); p.line(8, 16, 22, 16, '#6a4628');
        break;
      case 'well':
        p.part(R(4, 4, 3, 22), '#7a5432', { ol: '#3a2412' }); p.part(R(29, 4, 3, 22), '#7a5432', { ol: '#3a2412' });
        p.part(P(1, 6, 35, 6, 18, -2), '#b0483a', { ol: '#4a1810', hi: '#e07a60' });
        p.part(E(18, 30, 15, 7), '#a8a090', { ol: '#4a4438', hi: '#d8d0c0' });
        p.part(R(3, 30, 30, 10), '#a8a090', { ol: '#4a4438', hi: '#d8d0c0' });
        p.part(E(18, 30, 11, 4), '#1a2a4a', { flat: true, ol: '#4a4438' });
        break;
      case 'rock0': case 'rock1': case 'rock2':
        p.part(E(18, 32, 14, 9), '#a8a4a0', { ol: '#3a3836', hi: '#e0dcd8' });
        p.part(E(11, 34, 7, 5), '#9a9692', { ol: '#3a3836' });
        break;
      case 'stone':
        p.part(P(8, 40, 28, 40, 26, 10, 18, 4, 10, 10), '#9aa0b0', { ol: '#2a2e3a', hi: '#d0d8e8' });
        p.line(14, 16, 22, 16, '#5ad0ff', 1.4); p.line(18, 12, 18, 30, '#5ad0ff', 1.4); p.line(13, 24, 23, 24, '#5ad0ff', 1.4);
        break;
    }
    return p.canvas();
  });
}

function archImg(w: number) {
  return memo(`arch${w}`, () => {
    const W = w * TT;
    const p = new Pix(W, 72, 1);
    for (const x of [2, W - 16]) p.part(R(x, 18, 14, 54), '#9a8a70', { ol: '#3a3020', hi: '#d0c0a0' });
    p.part(P(0, 22, W, 22, W - 6, 6, 6, 6), '#7a5432', { ol: '#3a2412', hi: '#a87a48' });
    p.part(RR(W / 2 - 22, 0, 44, 16, 3), '#c8965a', { ol: '#4a2e14', hi: '#f0c890' });
    for (let i = 0; i < 9; i++) p.part(E(6 + hash(i, w, 1) * (W - 12), 8 + hash(i, w, 2) * 50, 4, 3.4), '#4aa840', { ol: '#1f4a1c' });
    return p.canvas();
  });
}

// ---------------------------------------------------------------- 建物
type BStyle = { roof: string; roofDark: string; wall: string; trim: string; door: string };
const BSTYLE: Record<BuildingStyle, BStyle> = {
  manor: { roof: '#8a5ac8', roofDark: '#5a3488', wall: '#efe4cc', trim: '#7a5434', door: '#6a4024' },
  dome: { roof: '#3a7ae0', roofDark: '#1f4aa0', wall: '#e8ecf4', trim: '#c8a040', door: '#2a3a6a' },
  shop: { roof: '#3fae5a', roofDark: '#23743a', wall: '#f2e6c8', trim: '#7a5434', door: '#7a4a28' },
  barn: { roof: '#d0483a', roofDark: '#8e2a22', wall: '#b2483a', trim: '#f4ecdc', door: '#7a3020' },
  cottage: { roof: '#e07a3a', roofDark: '#a04a1e', wall: '#f0e2c2', trim: '#7a5434', door: '#7a4a28' },
  hut: { roof: '#4a8a9a', roofDark: '#2a5a6a', wall: '#e8dcc0', trim: '#6a4a30', door: '#5a3a24' },
};

/** 瓦屋根（3/4 見おろし）。左右の はしは 影に して 奥行きを だす */
function roof(g: G, x: number, y: number, w: number, h: number, s: BStyle, kind: 'tile' | 'plank' = 'tile') {
  const rows = Math.max(3, Math.floor(h / 7));
  for (let r = 0; r < rows; r++) {
    const ry = y + (h * r) / rows, rh = h / rows + 1;
    const t = r / rows;
    const base = mix(s.roof, s.roofDark, t * 0.55);
    rect(g, x, ry, w, rh, base);
    const step = kind === 'plank' ? 6 : 10;
    for (let bx = (r & 1) * (step / 2); bx < w; bx += step) {
      rect(g, x + bx, ry, 1, rh, mix(base, s.roofDark, 0.6));
      rect(g, x + bx + 1, ry + 1, step - 3, 1, mix(base, '#ffffff', 0.28));
    }
    rect(g, x, ry + rh - 2, w, 2, mix(base, s.roofDark, 0.7));
  }
  // 左右の 斜面（影）と 棟
  g.fillStyle = 'rgba(20,10,40,.22)';
  g.beginPath(); g.moveTo(x, y + 6); g.lineTo(x + Math.min(26, w * 0.18), y); g.lineTo(x + Math.min(26, w * 0.18), y + h); g.lineTo(x, y + h); g.fill();
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.beginPath(); g.moveTo(x + w, y + 6); g.lineTo(x + w - Math.min(26, w * 0.18), y); g.lineTo(x + w - Math.min(26, w * 0.18), y + h); g.lineTo(x + w, y + h); g.fill();
  rect(g, x + 6, y, w - 12, 3, mix(s.roof, '#ffffff', 0.35));
  rect(g, x, y + h, w, 3, s.roofDark);
  rect(g, x + 2, y + h + 3, w - 4, 3, 'rgba(0,0,0,.25)');
}

function windowAt(g: G, x: number, y: number, w = 14, h = 16, box = true, s?: BStyle) {
  rect(g, x - 2, y - 2, w + 4, h + 4, s?.trim ?? '#6a4a30');
  rect(g, x, y, w, h, '#4a6a9a');
  rect(g, x, y, w, h / 2, '#8ac4f0');
  rect(g, x + 2, y + 2, 3, 5, '#e8f8ff');
  rect(g, x + w / 2 - 1, y, 2, h, s?.trim ?? '#6a4a30'); rect(g, x, y + h / 2 - 1, w, 2, s?.trim ?? '#6a4a30');
  if (box) {
    rect(g, x - 3, y + h + 1, w + 6, 4, '#8a5a32');
    for (let i = 0; i < 5; i++) rect(g, x - 2 + i * ((w + 2) / 4), y + h - 1, 3, 3, i % 2 ? '#ff6aa0' : '#ffd040');
    for (let i = 0; i < 6; i++) rect(g, x - 2 + i * ((w + 4) / 5), y + h + 1, 2, 2, '#3f8a34');
  }
}

function doorAt(g: G, x: number, y: number, s: BStyle, w = 22, h = 30) {
  rect(g, x - 3, y - 3, w + 6, h + 3, s.trim);
  rect(g, x, y, w, h, s.door);
  g.fillStyle = s.door; g.beginPath(); g.ellipse(x + w / 2, y + 1, w / 2, 7, 0, Math.PI, 0); g.fill();
  rect(g, x + w / 2 - 1, y, 2, h, shade(s.door, 0.6));
  for (let yy = y + 5; yy < y + h; yy += 7) rect(g, x + 2, yy, w - 4, 1, shade(s.door, 0.75));
  rect(g, x + w - 6, y + h / 2, 3, 3, '#ffd040');
  rect(g, x - 4, y + h, w + 8, 4, '#b8b0a0'); rect(g, x - 4, y + h, w + 8, 1, '#e8e2d4');
}

/** 看板（入口の 上の アイコン） */
function emblemAt(g: G, cx: number, cy: number, icon: string) {
  rect(g, cx - 11, cy - 9, 22, 18, '#5a3a1e'); rect(g, cx - 10, cy - 8, 20, 16, '#f2deb0');
  g.fillStyle = '#7a4a1e'; g.font = 'bold 13px "DotGothic16", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(icon, cx, cy + 1);
}

function wallBand(g: G, x: number, y: number, w: number, h: number, s: BStyle, style: BuildingStyle) {
  rect(g, x, y, w, h, s.wall);
  if (style === 'barn') {
    for (let bx = 0; bx < w; bx += 6) { rect(g, x + bx, y, 1, h, shade(s.wall, 0.7)); rect(g, x + bx + 1, y, 1, h, shade(s.wall, 1.15)); }
    rect(g, x, y, w, 3, s.trim); rect(g, x, y + h - 3, w, 3, s.trim); rect(g, x, y, 3, h, s.trim); rect(g, x + w - 3, y, 3, h, s.trim);
  } else {
    // 木組み（ハーフティンバー）
    for (let bx = 0; bx <= w; bx += Math.max(24, Math.floor(w / Math.round(w / 32)))) rect(g, x + bx - 2, y, 4, h, s.trim);
    rect(g, x, y, w, 4, s.trim); rect(g, x, y + h * 0.48, w, 3, s.trim);
    for (let i = 0; i < w * h * 0.02; i++) rect(g, x + hash(i, w, 3) * w, y + hash(i, h, 4) * h, 2, 1, shade(s.wall, 0.92));
  }
  // 土台の 石
  rect(g, x - 2, y + h - 6, w + 4, 6, '#a49a88');
  for (let bx = 0; bx < w; bx += 9) rect(g, x + bx, y + h - 6, 1, 6, '#7a7262');
  rect(g, x - 2, y + h - 6, w + 4, 1, '#d0c8b8');
}

function chimney(g: G, x: number, y: number, h = 22) {
  rect(g, x, y, 12, h, '#a0503a');
  for (let yy = 0; yy < h; yy += 5) rect(g, x, y + yy, 12, 1, '#6a3020');
  rect(g, x - 2, y - 3, 16, 4, '#5a5450');
}

function conicalTower(g: G, x: number, y: number, w: number, h: number, s: BStyle) {
  rect(g, x, y, w, h, s.wall); rect(g, x + w - 5, y, 5, h, shade(s.wall, 0.82));
  windowAt(g, x + w / 2 - 5, y + 10, 10, 13, false, s);
  g.fillStyle = s.roof; g.beginPath(); g.moveTo(x - 4, y + 2); g.lineTo(x + w / 2, y - w * 1.25); g.lineTo(x + w + 4, y + 2); g.fill();
  g.fillStyle = s.roofDark; g.beginPath(); g.moveTo(x + w / 2, y - w * 1.25); g.lineTo(x + w + 4, y + 2); g.lineTo(x + w / 2, y + 2); g.fill();
  rect(g, x + w / 2 - 1, y - w * 1.25 - 8, 2, 9, '#c8a040');
}

/** 建物の 絵。footprint（w×h タイル）の 外に 屋根の はしや 塔が はみだす ぶん、余白（PAD）を つける */
const PADX = 10, PADT = 64;
export function buildingImg(style: BuildingStyle, w: number, h: number, door: number, roofCol?: string): HTMLCanvasElement {
  return memo(`b:${style}:${w}x${h}:${door}:${roofCol ?? ''}`, () => {
    const W = w * TT, H = h * TT;
    const [c, g] = mkCanvas(W + PADX * 2, H + PADT);
    const s = { ...BSTYLE[style], ...(roofCol ? { roof: roofCol, roofDark: shade(roofCol, 0.6) } : {}) };
    const X = PADX, Y = PADT;
    const doorX = X + door * TT + TT / 2;
    if (style === 'dome') {
      // 石の 台座・円柱の 胴・大きな ドーム（旅の扉の祠・闘技場）
      const bodyY = Y + H * 0.42, bodyH = H * 0.58 - 4;
      rect(g, X, Y + H - 14, W, 14, '#c8c0b0'); rect(g, X, Y + H - 14, W, 2, '#ece6da');
      rect(g, X + 8, bodyY, W - 16, bodyH - 10, s.wall);
      const grd = g.createLinearGradient(X + 8, 0, X + W - 8, 0);
      grd.addColorStop(0, 'rgba(0,0,0,.12)'); grd.addColorStop(0.4, 'rgba(255,255,255,.12)'); grd.addColorStop(1, 'rgba(0,0,0,.22)');
      g.fillStyle = grd; g.fillRect(X + 8, bodyY, W - 16, bodyH - 10);
      for (let bx = X + 18; bx < X + W - 18; bx += 26) { rect(g, bx, bodyY + 4, 6, bodyH - 18, '#f8f8ff'); rect(g, bx + 5, bodyY + 4, 2, bodyH - 18, '#b8c0d4'); }
      for (let bx = X + 30; bx < X + W - 30; bx += 26) { if (Math.abs(bx + 7 - doorX) < 20) continue; rect(g, bx, bodyY + 14, 14, 22, '#2a4a8a'); g.fillStyle = '#2a4a8a'; g.beginPath(); g.ellipse(bx + 7, bodyY + 14, 7, 6, 0, Math.PI, 0); g.fill(); rect(g, bx + 2, bodyY + 16, 3, 10, '#8ac4f0'); }
      rect(g, X + 8, bodyY, W - 16, 5, s.trim);
      // ドーム
      const cx = X + W / 2, cy = bodyY, rx = W / 2 - 14, ry = H * 0.42 + 18;
      const dg = g.createRadialGradient(cx - rx * 0.35, cy - ry * 0.6, 4, cx, cy - ry * 0.2, rx * 1.1);
      dg.addColorStop(0, '#9ad0ff'); dg.addColorStop(0.45, s.roof); dg.addColorStop(1, s.roofDark);
      g.fillStyle = dg; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, Math.PI, 0); g.fill();
      g.strokeStyle = 'rgba(255,230,140,.75)'; g.lineWidth = 2;
      for (let k = -3; k <= 3; k++) { g.beginPath(); g.ellipse(cx, cy, Math.abs(k) * rx / 3.5 + 0.1, ry, 0, Math.PI, 0); g.stroke(); }
      g.strokeStyle = '#d8b04a'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, Math.PI, 0); g.stroke();
      rect(g, cx - 3, cy - ry - 18, 6, 18, '#e0b84a'); g.fillStyle = '#ffe070'; g.beginPath(); g.arc(cx, cy - ry - 20, 5, 0, Math.PI * 2); g.fill();
      // 旗
      for (const fx of [X + 10, X + W - 12]) { rect(g, fx, bodyY - 44, 2, 46, '#7a7e8e'); g.fillStyle = '#d83a4a'; g.beginPath(); g.moveTo(fx + 2, bodyY - 44); g.lineTo(fx + 18, bodyY - 38); g.lineTo(fx + 2, bodyY - 32); g.fill(); }
      // 入口（柱つき）
      const dw = 30, dh = 40;
      rect(g, doorX - dw / 2 - 8, Y + H - 14 - dh - 8, dw + 16, dh + 8, '#f4f4fa');
      rect(g, doorX - dw / 2 - 8, Y + H - 14 - dh - 10, dw + 16, 4, s.trim);
      rect(g, doorX - dw / 2, Y + H - 14 - dh, dw, dh, '#1a2a5a');
      g.fillStyle = '#1a2a5a'; g.beginPath(); g.ellipse(doorX, Y + H - 14 - dh, dw / 2, 9, 0, Math.PI, 0); g.fill();
      const gl = g.createRadialGradient(doorX, Y + H - 34, 2, doorX, Y + H - 34, 18);
      gl.addColorStop(0, 'rgba(140,220,255,.9)'); gl.addColorStop(1, 'rgba(140,220,255,0)');
      g.fillStyle = gl; g.fillRect(doorX - 18, Y + H - 56, 36, 40);
      return c;
    }
    // ふつうの 家：下の 段が かべ、上が 屋根
    const wallH = style === 'barn' ? Math.min(H * 0.5, 64) : Math.min(H * 0.45, 56);
    const wallY = Y + H - wallH;
    wallBand(g, X, wallY, W, wallH, s, style);
    // 窓
    for (let k = 0; k < w; k++) {
      const wx = X + k * TT + TT / 2 - 7;
      if (k === door || (style === 'barn' && Math.abs(k - door) <= 0)) continue;
      if (style === 'barn') { if (k % 2 === 0) windowAt(g, wx, wallY + 14, 14, 14, false, s); continue; }
      windowAt(g, wx, wallY + 10, 14, 16, true, s);
    }
    // とびら
    if (style === 'barn') {
      const dw = 40, dh = wallH - 12;
      rect(g, doorX - dw / 2 - 3, wallY + 6, dw + 6, dh + 6, s.trim);
      rect(g, doorX - dw / 2, wallY + 9, dw, dh, s.door);
      g.strokeStyle = s.trim; g.lineWidth = 2;
      g.beginPath(); g.moveTo(doorX - dw / 2, wallY + 9); g.lineTo(doorX, wallY + 9 + dh); g.moveTo(doorX, wallY + 9); g.lineTo(doorX - dw / 2, wallY + 9 + dh);
      g.moveTo(doorX, wallY + 9); g.lineTo(doorX + dw / 2, wallY + 9 + dh); g.moveTo(doorX + dw / 2, wallY + 9); g.lineTo(doorX, wallY + 9 + dh); g.stroke();
      rect(g, doorX - 1, wallY + 9, 2, dh, s.trim);
    } else doorAt(g, doorX - 11, wallY + wallH - 34, s);
    // 屋根
    const roofTop = style === 'barn' ? Y + 6 : Y + 2;
    roof(g, X - 6, roofTop, W + 12, wallY - roofTop, s, style === 'barn' ? 'plank' : 'tile');
    if (style === 'barn') {
      // 干し草の 窓と 白い 縁
      rect(g, doorX - 12, roofTop + 14, 24, 18, s.trim); rect(g, doorX - 10, roofTop + 16, 20, 14, '#5a2a18');
      rect(g, doorX - 9, roofTop + 24, 18, 6, '#e8c860');
    }
    // 屋根の 上の かざり
    if (style === 'manor') {
      conicalTower(g, X - 4, Y - 6, 26, wallY - Y + 6, s);
      conicalTower(g, X + W - 22, Y - 6, 26, wallY - Y + 6, s);
      // 屋根窓（ドーマー）
      for (const dx of [W * 0.38, W * 0.62]) {
        const xx = X + dx - 9;
        rect(g, xx, roofTop + 18, 18, 16, s.wall); windowAt(g, xx + 3, roofTop + 21, 12, 11, false, s);
        g.fillStyle = s.roofDark; g.beginPath(); g.moveTo(xx - 3, roofTop + 19); g.lineTo(xx + 9, roofTop + 8); g.lineTo(xx + 21, roofTop + 19); g.fill();
      }
      emblemAt(g, doorX, wallY - 6, '⚗');
    }
    if (style === 'shop') {
      // しま模様の ひさし
      const ay = wallY - 4;
      for (let k = 0; k < W; k += 8) { rect(g, X + k, ay, 8, 10, (k / 8) % 2 ? '#ffffff' : '#3fae5a'); g.fillStyle = (k / 8) % 2 ? '#ffffff' : '#3fae5a'; g.beginPath(); g.arc(X + k + 4, ay + 10, 4, 0, Math.PI); g.fill(); }
      chimney(g, X + W - 34, roofTop - 14);
      emblemAt(g, doorX, wallY - 18, '袋');
    }
    if (style === 'cottage' || style === 'hut') chimney(g, X + W * 0.72, roofTop - 14);
    if (style === 'hut') emblemAt(g, doorX, wallY - 6, '♪');
    if (style === 'barn') { /* 風見鶏 */ rect(g, X + W / 2 - 1, roofTop - 18, 2, 18, '#5a5e6e'); g.fillStyle = '#3a3e4e'; g.beginPath(); g.moveTo(X + W / 2 - 8, roofTop - 18); g.lineTo(X + W / 2 + 8, roofTop - 14); g.lineTo(X + W / 2 - 4, roofTop - 12); g.fill(); }
    return c;
  });
}

/** ラベル（建物の 名前の 看板：参考画像3 の 青い ふだ） */
export function labelImg(text: string): HTMLCanvasElement {
  return memo(`label:${text}`, () => {
    const [m, mg] = mkCanvas(10, 10);
    mg.font = '15px "DotGothic16", monospace';
    const tw = Math.ceil(mg.measureText(text).width);
    void m;
    const W = tw + 26, H = 26;
    const [c, g] = mkCanvas(W + 4, H + 4);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.roundRect(3, 4, W, H, 8); g.fill();
    const grd = g.createLinearGradient(0, 2, 0, H + 2);
    grd.addColorStop(0, '#2c4aa0'); grd.addColorStop(1, '#162a6a');
    g.fillStyle = grd; g.beginPath(); g.roundRect(1, 1, W, H, 8); g.fill();
    g.strokeStyle = '#e8eeff'; g.lineWidth = 2; g.beginPath(); g.roundRect(2, 2, W - 2, H - 2, 7); g.stroke();
    g.strokeStyle = '#7a9ae8'; g.lineWidth = 1; g.beginPath(); g.roundRect(4.5, 4.5, W - 7, H - 7, 5); g.stroke();
    g.font = '15px "DotGothic16", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ffffff'; g.fillText(text, W / 2 + 1, H / 2 + 2);
    return c;
  });
}

/** 物体の 絵（frame は 噴水などの うごき）。ワールド座標の ピクセル位置と 奥行き */
export function objectSprite(o: TownObject, frame: number): Sprite | null {
  const bx = o.x * TT, by = o.y * TT;
  switch (o.kind) {
    case 'building': {
      const img = buildingImg(o.style, o.w, o.h, o.door, o.roof);
      return { img, dx: bx - PADX, dy: by - PADT, base: by + o.h * TT - 2 };
    }
    case 'tree': { const img = treeImg(o.variant); return { img, dx: bx + TT / 2 - 26, dy: by + TT - 66, base: by + TT - 4 }; }
    case 'bush': { const img = bushImg(o.variant); return { img, dx: bx - 2, dy: by + 4, base: by + TT - 4 }; }
    case 'fountain': { const img = fountainImg(Math.floor(frame / 8)); return { img, dx: bx + 48 - 56, dy: by + 96 - 112, base: by + 80 }; }
    case 'lamp': { const img = lampImg(true); return { img, dx: bx + 6, dy: by + TT - 58, base: by + TT - 4 }; }
    case 'flowers': { const img = flowerImg(o.variant); return { img, dx: bx, dy: by + 2, base: by + TT - 4 }; }
    case 'fence': { const img = fenceImg(o.dir); return { img, dx: bx, dy: by - 2, base: by + TT - 4 }; }
    case 'arch': { const img = archImg(o.w); return { img, dx: bx, dy: by + TT - 72, base: by + TT - 2 }; }
    default: {
      const k = o.kind === 'rock' ? `rock${o.variant}` : o.kind;
      const img = smallImg(k);
      return { img, dx: bx - 2, dy: by + TT - 44, base: by + TT - 4 };
    }
  }
}

/** 影（物体の 足もと） */
export function objectShadow(g: G, o: TownObject, sx: number, sy: number) {
  if (o.kind === 'tree') shadowEllipse(g, sx + TT / 2 + 4, sy + TT - 4, 20, 7);
  else if (o.kind === 'building') { g.fillStyle = 'rgba(20,30,10,.25)'; g.fillRect(sx + 6, sy + o.h * TT - 2, o.w * TT, 8); }
  else if (o.kind === 'fountain') shadowEllipse(g, sx + 48, sy + 84, 50, 14, 0.18);
  else if (o.kind === 'lamp' || o.kind === 'sign' || o.kind === 'bench' || o.kind === 'barrel' || o.kind === 'well' || o.kind === 'stone' || o.kind === 'bush' || o.kind === 'rock') shadowEllipse(g, sx + TT / 2, sy + TT - 4, 12, 4);
}

/** ミニマップ（右上）。1タイル＝ s ドット */
export function minimapImg(art: TownArt, s = 4): HTMLCanvasElement {
  return memo(`mini:${art.w}x${art.h}:${art.ground.join('').length}:${art.objects.length}:${s}`, () => {
    const [c, g] = mkCanvas(art.w * s, art.h * s);
    const col: Record<string, string> = { ',': '#4f9e3c', '.': '#d6c6a2', 'o': '#e8dcc0', ':': '#c99a62', '~': '#3f92de', '=': '#c8c0b0', '_': '#c8c0b0' };
    for (let y = 0; y < art.h; y++) for (let x = 0; x < art.w; x++) { g.fillStyle = col[art.ground[y][x]] ?? '#4f9e3c'; g.fillRect(x * s, y * s, s, s); }
    for (const o of art.objects) {
      if (o.kind === 'tree' || o.kind === 'bush') { g.fillStyle = '#2a6a2a'; g.fillRect(o.x * s, o.y * s, s, s); }
      if (o.kind === 'building') { g.fillStyle = o.roof ?? BSTYLE[o.style].roof; g.fillRect(o.x * s, o.y * s, o.w * s, o.h * s); }
      if (o.kind === 'fountain') { g.fillStyle = '#8fd2f8'; g.fillRect((o.x + 1) * s - 1, (o.y + 1) * s - 1, s + 2, s + 2); }
    }
    return c;
  });
}
