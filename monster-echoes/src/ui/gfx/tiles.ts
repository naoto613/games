// マップのタイル（16×16 の設計を 32×32 で描く）と人物（16×20 を 32×40 で描く）
import { E, P, Pix, R, RR, Sub, flipH, mix, shade } from './Pix';
import { eventObject, hiddenDoorOverlay, type EventTileKind } from './eventTiles';
import { doorStyled, flowerBed, lampTile, roofStyled, wallStyled, wellTile, type BldState } from './buildings';

export const TILE = 32;
const S = 2;
export type Theme = 'town' | 'forest' | 'cave' | 'highland' | 'tower' | 'snow' | 'volcano' | 'interior' | 'shrine' | 'ranch' | 'lab' | 'shop' | 'arena';

type Pal = { g: [string, string, string, string]; wall: string; water: string; blade: string };
const PAL: Record<Theme, Pal> = {
  town: { g: ['#4f9a3c', '#62b048', '#78c458', '#94d870'], wall: '#2f7a34', water: '#3a86d8', blade: '#a8e47c' },
  forest: { g: ['#3f8a36', '#509e40', '#66b24e', '#86c866'], wall: '#256c2e', water: '#2f78c8', blade: '#9ad870' },
  cave: { g: ['#7a6454', '#8a725e', '#987e68', '#a68c74'], wall: '#3e3448', water: '#24508e', blade: '#b09a84' },
  highland: { g: ['#8c9a48', '#a2ae58', '#b6c068', '#ccd484'], wall: '#8a6a4c', water: '#3a96d8', blade: '#e4e49a' },
  tower: { g: ['#b8c4e0', '#c8d2ec', '#d6def4', '#e6ecfc'], wall: '#6a84c8', water: '#5ab0f0', blade: '#ffffff' },
  snow: { g: ['#c8d8ec', '#d8e6f6', '#e6f0fc', '#f6faff'], wall: '#7a9ac8', water: '#6ab4ec', blade: '#ffffff' },
  volcano: { g: ['#4a2a28', '#5c3430', '#6e3e36', '#82483c'], wall: '#3a1c20', water: '#f0601c', blade: '#e0a060' },
  lab: { g: ['#484c76', '#525884', '#5a6092', '#646c9e'], wall: '#2a2c4e', water: '#3a86d8', blade: '#8ae0ff' },
  shop: { g: ['#9a6a3c', '#a87648', '#b48254', '#c09060'], wall: '#7a5232', water: '#3a86d8', blade: '#c09060' },
  arena: { g: ['#d4b474', '#dcbe80', '#e4c88c', '#ecd298'], wall: '#7a8098', water: '#3a86d8', blade: '#e8d098' },
  interior: { g: ['#9a6a3c', '#a87648', '#b48254', '#c09060'], wall: '#7a5232', water: '#3a86d8', blade: '#c09060' },
  shrine: { g: ['#8a8ca4', '#9a9cb4', '#a8aac0', '#b6b8cc'], wall: '#4a4c6e', water: '#3a86d8', blade: '#c0c2d6' },
  ranch: { g: ['#4f9a3c', '#62b048', '#78c458', '#94d870'], wall: '#8a5a2a', water: '#3a96e0', blade: '#a8e47c' },
};

// ---- なめらかな ノイズ（タイルどうしが つながるように 世界座標で計算）
const h2 = (x: number, y: number) => {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};
const smooth = (t: number) => t * t * (3 - 2 * t);
function noise(x: number, y: number, f: number) {
  const X = x / f, Y = y / f, x0 = Math.floor(X), y0 = Math.floor(Y);
  const tx = smooth(X - x0), ty = smooth(Y - y0);
  const a = h2(x0, y0), b = h2(x0 + 1, y0), c = h2(x0, y0 + 1), d = h2(x0 + 1, y0 + 1);
  return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
}
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16);

/** 地面のテクスチャ（ディザつき 4 色） */
function ground(p: Pix, cols: string[], wx: number, wy: number, freq = 9) {
  for (let Y = 0; Y < p.H; Y++)
    for (let X = 0; X < p.W; X++) {
      const gx = wx * 32 + X, gy = wy * 32 + Y;
      let v = noise(gx, gy, freq) * 0.65 + noise(gx, gy, 3.2) * 0.35;
      v += (BAYER4[(X & 3) + (Y & 3) * 4] - 0.5) * 0.22;
      const i = Math.max(0, Math.min(cols.length - 1, Math.floor(v * cols.length)));
      p.pxh(X, Y, cols[i]);
    }
}

function grassTile(p: Pix, th: Theme, wx: number, wy: number, deco: boolean) {
  const c = PAL[th];
  ground(p, c.g, wx, wy);
  const r = (i: number) => h2(wx * 7 + i, wy * 13 + i * 3);
  // 草の葉
  const n = th === 'cave' ? 2 : 4;
  for (let i = 0; i < n; i++) {
    const X = Math.floor(r(i) * 26) + 3, Y = Math.floor(r(i + 9) * 24) + 6;
    if (th === 'cave') {
      p.part(E(X / S, Y / S, 1.4, 1), '#9a8a7c', { ol: '#4a3c36' });
      continue;
    }
    p.pxh(X, Y, c.g[0]); p.pxh(X - 1, Y - 1, c.g[0]); p.pxh(X - 2, Y - 2, c.blade);
    p.pxh(X + 1, Y - 1, c.g[0]); p.pxh(X + 2, Y - 2, c.blade); p.pxh(X, Y - 2, c.blade); p.pxh(X, Y - 3, mix(c.blade, '#ffffff', 0.4));
  }
  if (deco && h2(wx * 31, wy * 17) > 0.45) {
    if (th === 'cave') {
      for (let i = 0; i < 3; i++) p.part(E(2 + r(i + 20) * 12, 2 + r(i + 30) * 12, 1.6, 1.1), '#a89888', { ol: '#4a3c36' });
      if (r(40) > 0.5) { p.part(P(10, 13, 11.5, 7, 13, 13), '#7ae0ff', { hi: '#ffffff', ol: '#1a4a7a' }); }
    } else {
      const cols = ['#ff7aa8', '#fff070', '#ffffff', '#b0a0ff', '#ff9a50'];
      const nf = h2(wx, wy * 3) > 0.7 ? 2 : 1;
      for (let i = 0; i < nf; i++) {
        const fx = 2.5 + r(i + 40) * 11, fy = 2.5 + r(i + 50) * 11;
        const col = cols[Math.floor(r(i + 60) * cols.length)];
        for (const [dx, dy] of [[-0.9, 0], [0.9, 0], [0, -0.9], [0, 0.9]]) p.part(E(fx + dx, fy + dy, 0.75, 0.75), col, { flat: true, ol: mix(col, '#203010', 0.6) });
        p.part(E(fx, fy, 0.5, 0.5), '#f0c030', { flat: true, noOl: true });
      }
    }
  }
}

function pathTile(p: Pix, wx: number, wy: number) {
  ground(p, ['#b49a6e', '#c4aa7c', '#d2ba8c', '#dcc89c'], wx, wy, 6);
  const r = (i: number) => h2(wx * 11 + i, wy * 17 + i * 5);
  const stones: [number, number, number, number][] = [[1, 1, 6, 4.5], [8, 0.5, 7, 5], [0.5, 6.5, 5, 4.5], [6.5, 6, 6, 5], [12.5, 6.5, 3.5, 4], [2, 11.5, 7, 4], [9.5, 11.5, 6, 4]];
  for (const [i, [x, y, w, hh]] of stones.entries()) {
    const shade0 = ['#c8b8a0', '#bcae98', '#d4c4aa'][Math.floor(r(i) * 3)];
    p.part(RR(x + 0.2, y + 0.2, w - 0.6, hh - 0.6, 1.6), shade0, { ol: '#8a7658', hiT: 0.4 });
  }
}

function treeTile(p: Pix, th: Theme, wx: number, wy: number) {
  grassTile(p, th, wx, wy, false);
  const c = PAL[th].wall;
  p.part(E(8, 14.5, 6, 1.6), mix(PAL[th].g[0], '#000000', 0.35), { flat: true, noOl: true });
  p.part(R(6.5, 10, 3, 5), '#7a4e2a', { hi: '#a87040', ol: '#3a2010' });
  const r = h2(wx * 3, wy * 5);
  p.part(E(4.5, 8.5, 4.2, 3.6), shade(c, 0.9), { ol: '#123a18' });
  p.part(E(11.5, 8.5, 4.2, 3.6), shade(c, 0.9), { ol: '#123a18' });
  p.part(E(8, 5.5, 6.2, 5.2), c, { ol: '#123a18', hi: mix(c, '#d0ff90', 0.35) });
  for (const [x, y] of [[5, 4], [9, 3], [7, 7], [11, 6]]) p.part(E(x, y, 0.9, 0.6), mix(c, '#e0ffa0', 0.45), { flat: true, noOl: true });
  if (r > 0.6) for (const [x, y] of [[4, 8], [12, 8.5], [8, 6.5]]) p.part(E(x, y, 0.8, 0.8), '#ff4a4a', { flat: true, ol: '#6a1010' });
}

function rockWall(p: Pix, th: Theme, wx: number, wy: number) {
  const c = PAL[th].wall;
  p.rect(0, 0, 16, 16, shade(c, 0.45));
  const r = (i: number) => h2(wx * 5 + i, wy * 9 + i);
  // ごつごつした岩を ずらして 積む
  const rocks: [number, number, number, number][] = [[-1, -1, 9, 8], [7, 0, 10, 8], [0, 7, 8, 9], [7.5, 7.5, 9, 9]];
  for (const [i, [x, y, w, hh]] of rocks.entries()) {
    const col = mix(c, i % 2 ? '#ffffff' : '#000000', 0.06 + r(i) * 0.08);
    p.part(RR(x + 0.4 + r(i + 3), y + 0.4, w - 1, hh - 1, 3), col, { ol: shade(c, 0.35), hiT: 0.3 });
  }
  if (th === 'highland' && r(7) > 0.5) for (const [x, y] of [[3, 3], [11, 10]]) { p.part(E(x, y, 1.6, 0.9), '#8aa848', { flat: true, ol: '#3a5020' }); }
  if (th === 'snow' && r(8) > 0.4) p.part(E(5 + r(2) * 6, 2.4, 3.6, 1.4), '#ffffff', { flat: true, noOl: true });
  if (th === 'volcano' && r(6) > 0.78) p.part(E(4 + r(3) * 8, 9 + r(4) * 3, 1.6, 0.8), '#ff8a2a', { flat: true, noOl: true });
  if (th === 'cave' && r(9) > 0.75) p.part(P(9, 9, 10.5, 4, 12, 9), '#8ae0ff', { hi: '#ffffff', ol: '#1a4a7a' });
}

function waterTile(p: Pix, th: Theme, wx: number, wy: number, f: number) {
  const base = PAL[th].water;
  ground(p, [shade(base, 0.82), base, mix(base, '#ffffff', 0.12), mix(base, '#ffffff', 0.22)], wx + f * 0.07, wy, 7);
  for (let i = 0; i < 3; i++) {
    const y = ((i * 5 + f * 0.8 + h2(wx, wy + i) * 10) % 15) + 0.5, x = (h2(wx + i, wy) * 10) | 0;
    p.line(x, y, x + 3, y, mix(base, '#ffffff', 0.6));
    p.line(x + 3, y, x + 4, y - 0.5, mix(base, '#ffffff', 0.35));
  }
}

function chestTile(p: Pix, th: Theme, wx: number, wy: number, open: boolean, bg = true) {
  if (bg) grassTile(p, th, wx, wy, false);
  p.part(E(8, 13.5, 6.5, 1.5), mix(PAL[th].g[0], '#000000', 0.4), { flat: true, noOl: true });
  if (open) {
    p.part(RR(2, 7, 12, 7, 1), '#9a5a24', { ol: '#3a1a08' });
    p.part(R(3, 7.6, 10, 3), '#2a1206', { flat: true, noOl: true });
    p.part(RR(2, 2.5, 12, 4.5, 1.5), '#c47a34', { ol: '#3a1a08' });
    p.part(R(7, 3, 2, 4), '#e8c040', { ol: '#6a4a08' });
  } else {
    p.part(RR(2, 7.5, 12, 6.5, 1), '#b06a2c', { ol: '#3a1a08', hi: '#d89048' });
    p.part(RR(2, 3.5, 12, 5, 2.5), '#c87a34', { ol: '#3a1a08', hi: '#ec9e58' });
    for (const x of [3.5, 11.5]) p.part(R(x, 3.8, 1.2, 10), '#e8c040', { ol: '#6a4a08', hi: '#fff0a0' });
    p.part(RR(6.8, 7, 2.6, 3, 0.6), '#f0d050', { ol: '#6a4a08', hi: '#fff8c0' });
    p.part(E(8.1, 8.6, 0.4, 0.6), '#3a2a08', { flat: true, noOl: true });
  }
}

/** 旅の扉（うずまき） */
function portalTile(p: Pix, th: Theme, wx: number, wy: number, f: number, col: string, bg = true) {
  if (!bg) { /* 地面は 描かない */ } else if (th === 'town') pathTile(p, wx, wy); else grassTile(p, th, wx, wy, false);
  p.part(E(8, 8.5, 7.2, 6.4), shade(col, 0.45), { flat: true, ol: shade(col, 0.25) });
  p.part(E(8, 8.5, 5.8, 5), shade(col, 0.7), { flat: true, noOl: true });
  p.part(E(8, 8.5, 3.6, 3.1), shade(col, 1.0), { flat: true, noOl: true });
  for (let k = 0; k < 3; k++)
    for (let i = 0; i < 14; i++) {
      const a = i * 0.42 + f * 0.5 + k * 2.1, rr = 0.6 + i * 0.4;
      p.pxh(Math.round((8 + Math.cos(a) * rr * 1.15) * S), Math.round((8.5 + Math.sin(a) * rr) * S), i < 6 ? '#ffffff' : mix(col, '#ffffff', 0.6));
    }
  p.part(E(8, 8.5, 1.4, 1.2), '#ffffff', { flat: true, noOl: true });
}

function springTile(p: Pix, th: Theme, wx: number, wy: number, f: number, used: boolean, base?: () => void) {
  if (base) base(); else grassTile(p, th, wx, wy, false);
  p.part(E(8, 9, 7.5, 5.8), '#a8a8b8', { ol: '#4a4a5a', hi: '#e0e0ea' });
  p.part(E(8, 9.2, 5.8, 4.2), used ? '#5a7a90' : '#48b8f0', { flat: true, ol: '#2a4a6a' });
  p.part(E(6.5, 8, 2.2, 1.1), used ? '#7a9ab0' : '#a8ecff', { flat: true, noOl: true });
  if (!used) for (let i = 0; i < 3; i++) { const t = (f + i * 3) % 8; p.part(E(4 + i * 3.5, 10 - t * 0.4, 0.5, 0.5), '#ffffff', { flat: true, noOl: true }); }
}

function roofTile(p: Pix, wx: number) {
  p.rect(0, 0, 16, 16, '#8a2a20');
  for (let row = 0; row < 4; row++)
    for (let i = -1; i < 3; i++) {
      const x = i * 8 + (row % 2) * 4 + (wx % 2) * 0, y = row * 4;
      p.part(Sub(E(x + 4, y + 2.5, 4.2, 3.4), R(x - 1, y - 2, 10, 2.2)), '#c8483a', { ol: '#5a1410', hi: '#ec7a60' });
    }
}
function houseWallTile(p: Pix, wx: number) {
  ground(p, ['#e2d2ae', '#ecdcba', '#f2e4c6', '#f6ead0'], wx, 0, 5);
  p.rect(0, 0, 16, 1.4, '#6a4a2a');
  p.rect(0, 14.6, 16, 1.4, '#7a5a3a');
  if (wx % 2 === 0) {
    p.part(RR(3.5, 3.5, 9, 8, 1), '#6a4a2a', { flat: true, ol: '#3a2410' });
    p.part(R(4.5, 4.5, 7, 6), '#6ab8e8', { flat: true, noOl: true });
    p.part(P(4.5, 4.5, 8, 4.5, 4.5, 8), '#c0e8ff', { flat: true, noOl: true });
    p.rect(7.6, 4.5, 0.8, 6, '#6a4a2a'); p.rect(4.5, 7.2, 7, 0.8, '#6a4a2a');
    p.rect(3, 11.5, 10, 1.2, '#8a6a4a');
  } else { p.rect(1, 1, 1.2, 14, '#8a6a4a'); p.rect(14, 1, 1.2, 14, '#8a6a4a'); }
}
function counterTile(p: Pix) {
  ground(p, ['#e2d2ae', '#ecdcba', '#f2e4c6', '#f6ead0'], 3, 3, 5);
  p.part(R(0, 8, 16, 8), '#9a6230', { ol: '#3a2010', hi: '#c88a4a' });
  p.rect(0, 8, 16, 1.3, '#d8a868');
}
function fountainTile(p: Pix, f: number) {
  pathTile(p, 5, 5);
  p.part(E(8, 10, 7.6, 5.2), '#9aa2b8', { ol: '#3a4256', hi: '#e8eef8' });
  p.part(E(8, 9.8, 5.8, 3.6), '#4ab0f0', { flat: true, ol: '#2a4a6a' });
  p.part(R(7, 3, 2, 7), '#c0c8d8', { ol: '#3a4256' });
  p.part(E(8, 3, 2.4, 1.2), '#d0d8e6', { ol: '#3a4256' });
  for (let i = 0; i < 5; i++) {
    const t = ((f + i * 1.6) % 8) / 8;
    for (const s of [-1, 1]) p.part(E(8 + s * (1 + t * 4.5), 2 + t * 6 - Math.sin(t * Math.PI) * 2.5, 0.55, 0.55), '#d8f4ff', { flat: true, noOl: true });
  }
}
function gateTile(p: Pix, wx: number, wy: number, f: number) {
  portalTile(p, 'town', wx, wy, f, '#a070ff');
}

// ---------------------------------------------------------------- へやの中
function woodFloor(p: Pix, wx: number, wy: number) {
  const c = PAL.interior.g;
  for (let row = 0; row < 4; row++) {
    const y = row * 4, off = ((wy * 4 + row) % 2) * 8 + (wx % 2) * 3;
    const col = c[(row + wx + wy) % 4];
    p.rect(0, y, 16, 4, col);
    p.rect(0, y + 3.5, 16, 0.5, '#6a4424');
    p.rect((off + 4) % 16, y, 0.5, 4, '#6a4424');
    p.rect((off + 12) % 16, y, 0.5, 4, '#6a4424');
    p.line(1, y + 1, 5, y + 1, mix(col, '#ffffff', 0.15), 0.5);
  }
}
function stoneFloor(p: Pix, th: Theme, wx: number, wy: number) {
  const c = PAL[th].g;
  for (let j = 0; j < 2; j++)
    for (let i = 0; i < 2; i++) {
      const col = c[(i + j + wx + wy) % 4];
      p.rect(i * 8, j * 8, 8, 8, col);
      p.rect(i * 8, j * 8, 8, 0.6, mix(col, '#ffffff', 0.35));
      p.rect(i * 8, j * 8 + 7.4, 8, 0.6, mix(col, '#000000', 0.25));
      p.rect(i * 8 + 7.4, j * 8, 0.6, 8, mix(col, '#000000', 0.2));
    }
  if (th === 'tower' && h2(wx, wy) > 0.8) p.part(P(7, 9, 8, 6, 9, 9), '#ffffff', { flat: true, noOl: true });
}
function labFloor(p: Pix, wx: number, wy: number) {
  const c = PAL.lab.g;
  for (let j = 0; j < 2; j++)
    for (let i = 0; i < 2; i++) {
      const col = c[(i + j + wx + wy) & 3];
      p.rect(i * 8, j * 8, 8, 8, col);
      p.rect(i * 8, j * 8, 8, 0.6, mix(col, '#8ae0ff', 0.35));
      p.rect(i * 8 + 7.4, j * 8, 0.6, 8, mix(col, '#000000', 0.3));
      p.rect(i * 8, j * 8 + 7.4, 8, 0.6, mix(col, '#000000', 0.3));
    }
  if (h2(wx * 3, wy * 7) > 0.7) { p.rect(3, 4, 5, 0.5, '#8ae0ff'); p.rect(7.5, 4, 0.5, 4, '#8ae0ff'); p.part(E(8, 8.2, 0.9, 0.9), '#7af0c0', { flat: true, noOl: true }); }
}
function arenaFloor(p: Pix, wx: number, wy: number) {
  ground(p, PAL.arena.g, wx, wy, 5);
  const r = (i: number) => h2(wx * 9 + i, wy * 5 + i);
  for (let i = 0; i < 3; i++) p.part(E(2 + r(i) * 12, 2 + r(i + 4) * 12, 0.9, 0.6), '#b89458', { flat: true, noOl: true });
  if (r(9) > 0.8) p.line(2, 4 + r(2) * 8, 14, 4 + r(3) * 8, '#c8a468', 0.5);
}
/** へやの ゆか（たてものごとに ちがう） */
function floorFor(p: Pix, th: Theme, wx: number, wy: number) {
  if (th === 'lab') labFloor(p, wx, wy);
  else if (th === 'arena') arenaFloor(p, wx, wy);
  else if (th === 'shrine' || th === 'tower') stoneFloor(p, th, wx, wy);
  else if (th === 'ranch') grassTile(p, 'ranch', wx, wy, false);
  else woodFloor(p, wx, wy);
}
function carpet(p: Pix, th: Theme, wx: number, wy: number) {
  const base = { shrine: '#2a4aa8', lab: '#4a2a8a', shop: '#2a7a4a', arena: '#8a1a2a' }[th as string] ?? '#b02a3a';
  const trim = { shrine: '#8ac8ff', lab: '#8aecff', shop: '#f0e4c4', arena: '#e8c060' }[th as string] ?? '#e8c060';
  ground(p, [mix(base, '#000000', 0.15), base, base, mix(base, '#ffffff', 0.1)], wx, wy, 4);
  for (let i = 1; i < 16; i += 4) p.rect(i, 7.6, 2, 0.8, trim);
  if (th === 'shop') { p.rect(0, 2, 16, 0.6, trim); p.rect(0, 13.4, 16, 0.6, trim); }
}
function innerWall(p: Pix, th: Theme, wx: number) {
  if (th === 'shrine') {
    p.rect(0, 0, 16, 16, '#3a3c5a');
    p.part(R(1, 0, 14, 16), '#5a5c80', { ol: '#22243a', hiT: 0.3 });
    p.rect(3, 2, 10, 1, '#8a8cb0');
    p.part(E(8, 8, 2.2, 3), '#6ad0ff', { flat: true, ol: '#1a3a6a' });
    p.part(E(8, 8, 1, 1.6), '#e0faff', { flat: true, noOl: true });
    return;
  }
  if (th === 'lab') {
    p.rect(0, 0, 16, 16, '#262848');
    p.part(R(1, 0, 14, 16), '#383c68', { ol: '#14162e', hiT: 0.3 });
    p.rect(2, 11, 12, 1, '#5a5e96');
    if (wx % 2 === 0) { p.part(RR(6, 2, 4, 9, 2), '#1a1c34', { ol: '#0a0a1a' }); p.part(RR(6.8, 4.6, 2.4, 5.8, 1.2), '#5af0c8', { flat: true, noOl: true }); p.part(E(8, 5, 0.8, 0.6), '#c8fff0', { flat: true, noOl: true }); }
    else { p.part(E(8, 6.6, 3.2, 3.2), '#14162e', { ol: '#0a0a1a' }); p.part(E(8, 6.6, 2.2, 2.2), '#8a7aff', { flat: true, noOl: true }); p.part(E(7.2, 5.8, 0.7, 0.7), '#ffffff', { flat: true, noOl: true }); }
    return;
  }
  if (th === 'arena') {
    p.rect(0, 0, 16, 16, '#868ca4');
    for (let row = 0; row < 4; row++) {
      const off = (row + wx) % 2 ? 4 : 0;
      p.rect(0, row * 4, 16, 0.6, '#5a6078');
      for (let i = 0; i < 3; i++) p.rect(off + i * 8, row * 4, 0.6, 4, '#5a6078');
      p.rect(0, row * 4 + 0.6, 16, 0.5, '#b8bed0');
    }
    if (wx % 3 === 0) { p.part(R(7, 5, 2, 6), '#5a3a1a', { ol: '#2a1808' }); p.part(P(8, 1.6, 10.2, 5, 8, 6, 5.8, 5), '#ffb030', { ol: '#7a3a08' }); p.part(P(8, 3, 9.2, 5, 8, 5.4, 6.8, 5), '#fff0a0', { flat: true, noOl: true }); }
    return;
  }
  ground(p, ['#e8d6b0', '#f0dfbc', '#f4e6c6', '#f8ecd2'], wx, 0, 5);
  p.rect(0, 0, 16, 2, th === 'shop' ? '#3a6a3a' : '#6a4424');
  p.rect(0, 10, 16, 6, th === 'shop' ? '#3a7a4a' : '#8a5a32');
  p.rect(0, 10, 16, 1, th === 'shop' ? '#6ab87a' : '#b07a48');
  for (let x = 2; x < 16; x += 5) p.rect(x, 11.5, 0.6, 4, th === 'shop' ? '#245a30' : '#6a4424');
  if (th === 'shop' && wx % 2 === 0) { p.part(E(5, 5.5, 1.5, 1.5), '#e84a4a', { ol: '#6a1010' }); p.part(E(11, 5.5, 1.3, 1.3), '#f0d040', { ol: '#6a4a08' }); }
}
function fence(p: Pix, wx: number, wy: number) {
  grassTile(p, 'ranch', wx, wy, false);
  p.part(R(0, 6, 16, 2), '#b07a3a', { ol: '#4a2a10' });
  p.part(R(0, 11, 16, 2), '#b07a3a', { ol: '#4a2a10' });
  for (const x of [2, 12]) p.part(R(x, 3, 2.4, 12), '#c88a48', { ol: '#4a2a10' });
}
function bookshelf(p: Pix) {
  p.part(R(0.5, 0.5, 15, 15), '#7a4a24', { ol: '#2a1408', flat: true });
  const cols = ['#d84a4a', '#4a7ad8', '#e8c040', '#4aa860', '#a060c8', '#e88a3a'];
  for (let row = 0; row < 3; row++) {
    p.rect(1.5, 1.5 + row * 5, 13, 4, '#3a2210');
    for (let i = 0; i < 6; i++) p.rect(2 + i * 2.1, 2 + row * 5 + (i % 3 === 0 ? 0.6 : 0), 1.8, 3.4 - (i % 3 === 0 ? 0.6 : 0), cols[(i + row * 2) % cols.length]);
  }
}
function table(p: Pix, th: Theme, wx: number, wy: number) {
  floorFor(p, th, wx, wy);
  p.part(E(8, 13.5, 6.5, 1.6), '#000000', { flat: true, noOl: true });
  p.part(E(8, 8, 6.8, 5), '#b8743a', { ol: '#3a1a08', hi: '#e0a060' });
  p.part(E(6, 6.5, 1.4, 2), '#7ae0ff', { ol: '#1a3a6a' });
  p.part(E(10.5, 7.5, 1.8, 1.2), '#ffffff', { ol: '#6a6a7a' });
}
function pottedPlant(p: Pix, th: Theme, wx: number, wy: number) {
  floorFor(p, th, wx, wy);
  p.part(RR(5, 9, 6, 6, 1), '#c8603a', { ol: '#4a1a08' });
  for (const [x, y] of [[6, 6], [10, 6], [8, 3.5], [5, 4], [11, 4]]) p.part(E(x, y, 2.4, 2), '#3aa848', { ol: '#123a18' });
}
function stairs(p: Pix, th: Theme, wx: number, wy: number, up: boolean) {
  floorFor(p, th, wx, wy);
  if (th === 'ranch') { p.part(R(1, 3, 14, 10), '#c88a48', { ol: '#4a2a10' }); p.rect(2, 7, 12, 1, '#7a4a20'); return; }
  for (let i = 0; i < 4; i++) {
    const y = up ? 2 + i * 3 : 2 + i * 3, sh = up ? 0.9 - i * 0.12 : 0.5 + i * 0.12;
    p.part(R(2, y, 12, 3), mix('#8a8ca8', '#000000', 1 - sh), { ol: '#22243a', flat: true });
  }
}
function doorTile(p: Pix, th: Theme, wx: number, wy: number) {
  if (th === 'town') {
    houseWallTile(p, 1);
    p.part(RR(3.5, 2.5, 9, 13.5, 3), '#7a4420', { ol: '#2a1206', hi: '#a86a3a' });
    p.rect(8, 3, 0.5, 13, '#4a2410');
    p.part(E(10.4, 10, 0.8, 0.8), '#f0d040', { flat: true, ol: '#6a4a08' });
    return;
  }
  floorFor(p, th, wx, wy);
  p.part(RR(2, 4, 12, 9, 2), '#3a6a3a', { ol: '#123a12' });
  p.rect(3, 8, 10, 0.8, '#e8c060');
}

// ---------------------------------------------------------------- ボスの へや（専用）
type BossPal = { slab: [string, string, string, string]; wall: string; accent: string; flame: string; carpet: string; pillar: string };
const BOSSPAL: Record<string, BossPal> = {
  forest: { slab: ['#34463a', '#3e5242', '#486048', '#547054'], wall: '#1e2c22', accent: '#9aff8a', flame: '#8aff6a', carpet: '#2a5a3a', pillar: '#6a7a5a' },
  cave: { slab: ['#322e48', '#3c3856', '#464264', '#524e72'], wall: '#1a1830', accent: '#8ae0ff', flame: '#6ad8ff', carpet: '#2a3a7a', pillar: '#6a6a9a' },
  highland: { slab: ['#6a5a48', '#7a6854', '#8a7660', '#9a8670'], wall: '#3a2c24', accent: '#ffd870', flame: '#ffa030', carpet: '#8a2a2a', pillar: '#c8b090' },
  tower: { slab: ['#a8b4e0', '#b8c4ec', '#c8d2f6', '#dce4ff'], wall: '#4a5a9a', accent: '#aee8ff', flame: '#c8f0ff', carpet: '#3a54c0', pillar: '#e8f0ff' },
  snow: { slab: ['#a8c4e4', '#b8d2ee', '#c8def8', '#e0eeff'], wall: '#4a6a9a', accent: '#d8f6ff', flame: '#8ad8ff', carpet: '#3a6aa8', pillar: '#d8ecff' },
  volcano: { slab: ['#3a2220', '#4a2a26', '#5c342e', '#6e3e34'], wall: '#1c0e0e', accent: '#ff9a3a', flame: '#ff7a1a', carpet: '#7a1818', pillar: '#2a1a1c' },
};
export const bossAccent = (th: Theme) => (BOSSPAL[th] ?? BOSSPAL.cave).accent;
const bp = (th: Theme) => BOSSPAL[th] ?? BOSSPAL.cave;

function bossFloor(p: Pix, th: Theme, wx: number, wy: number) {
  const c = bp(th);
  for (let j = 0; j < 2; j++)
    for (let i = 0; i < 2; i++) {
      p.rect(i * 8, j * 8, 8, 8, c.slab[(i + j + wx + wy) & 3]);
    }
  // ひび われ・かけた ゆかの きずあと
  const r = (i: number) => h2(wx * 5 + i, wy * 11 + i);
  for (let j = 0; j < 2; j++)
    for (let i = 0; i < 2; i++) {
      const col = c.slab[(i + j + wx + wy) & 3];
      p.rect(i * 8, j * 8, 8, 0.6, mix(col, '#ffffff', 0.28));
      p.rect(i * 8 + 7.4, j * 8, 0.6, 8, mix(col, '#000000', 0.35));
      p.rect(i * 8, j * 8 + 7.4, 8, 0.6, mix(col, '#000000', 0.3));
    }
  if (r(1) > 0.72) p.line(2 + r(2) * 6, 2 + r(3) * 4, 6 + r(4) * 8, 8 + r(5) * 6, mix(c.slab[0], '#000000', 0.45), 0.5);
  if (th === 'forest' && r(6) > 0.55) p.part(E(3 + r(7) * 10, 3 + r(8) * 10, 1.6, 1), '#4a8a3a', { flat: true, noOl: true });
  if (th === 'snow' && r(6) > 0.6) p.part(E(3 + r(7) * 10, 3 + r(8) * 10, 2, 0.9), '#ffffff', { flat: true, noOl: true });
  if (th === 'volcano' && r(6) > 0.7) p.line(3 + r(7) * 6, 4, 6 + r(8) * 6, 12, '#ff6a20', 0.6);
}
function bossWall(p: Pix, th: Theme, wx: number, wy: number) {
  const c = bp(th);
  p.rect(0, 0, 16, 16, c.wall);
  for (let row = 0; row < 4; row++) {
    const off = (row + wx) % 2 ? 4 : 0;
    p.rect(0, row * 4, 16, 0.6, mix(c.wall, '#000000', 0.4));
    for (let i = 0; i < 3; i++) p.rect(off + i * 8, row * 4, 0.6, 4, mix(c.wall, '#000000', 0.4));
    p.rect(0, row * 4 + 0.6, 16, 0.5, mix(c.wall, '#ffffff', 0.1));
  }
  // ときどき かべに ともる ルーン
  if ((wx * 7 + wy * 3) % 9 === 0) {
    p.part(P(8, 3, 11, 8, 8, 13, 5, 8), mix(c.accent, c.wall, 0.55), { flat: true, noOl: true });
    p.part(P(8, 5, 9.6, 8, 8, 11, 6.4, 8), c.accent, { flat: true, noOl: true });
  }
}
function bossCarpet(p: Pix, th: Theme, wx: number, wy: number) {
  const c = bp(th);
  bossFloor(p, th, wx, wy);
  p.rect(3, 0, 10, 16, c.carpet);
  for (let y = 0; y < 16; y += 4) p.rect(5, y + 1.5, 6, 0.8, mix(c.carpet, '#ffffff', 0.12));
  p.rect(3, 0, 1.2, 16, '#e8c860'); p.rect(11.8, 0, 1.2, 16, '#e8c860');
  p.rect(4.2, 0, 0.6, 16, mix(c.carpet, '#000000', 0.35)); p.rect(11.2, 0, 0.6, 16, mix(c.carpet, '#000000', 0.35));
}
function bossRune(p: Pix, th: Theme, wx: number, wy: number, f: number) {
  const c = bp(th);
  bossFloor(p, th, wx, wy);
  const pulse = 0.55 + 0.35 * Math.sin((f / 16) * Math.PI * 2 + wx + wy);
  p.part(E(8, 8, 5.6, 5.6), mix(c.slab[0], c.accent, 0.22 * pulse), { flat: true, noOl: true });
  p.part(E(8, 8, 4, 4), mix(c.slab[0], c.accent, 0.1), { flat: true, noOl: true });
  p.part(P(8, 2.5, 13, 8, 8, 13.5, 3, 8), mix(c.slab[0], c.accent, 0.55 * pulse), { flat: true, noOl: true });
  p.part(P(8, 5, 11, 8, 8, 11, 5, 8), mix(c.slab[1], c.accent, 0.8 * pulse), { flat: true, noOl: true });
}
function bossPillar(p: Pix, th: Theme, wx: number, wy: number) {
  const c = bp(th);
  bossFloor(p, th, wx, wy);
  p.part(E(8, 14, 6.6, 1.8), '#000000', { flat: true, noOl: true });
  p.part(R(2.5, 12, 11, 3), mix(c.pillar, '#000000', 0.25), { ol: '#14101c', hiT: 0.3 });
  p.part(R(4, 3, 8, 10), c.pillar, { ol: '#14101c', hi: mix(c.pillar, '#ffffff', 0.4) });
  for (const x of [6, 8.3, 10.3]) p.rect(x, 3.5, 0.5, 9, mix(c.pillar, '#000000', 0.22));
  p.part(R(2.5, 1.2, 11, 3), mix(c.pillar, '#ffffff', 0.12), { ol: '#14101c', hiT: 0.4 });
  p.part(E(8, 2.6, 1.3, 0.8), c.accent, { flat: true, noOl: true });
  if (th === 'forest') for (const [x, y] of [[4.5, 6], [11.5, 9], [5, 11]]) p.part(E(x, y, 1.6, 1.2), '#3aa848', { ol: '#123a18' });
  if (th === 'volcano') p.line(7, 4, 9, 12, '#ff6a20', 0.6);
}
function bossBrazier(p: Pix, th: Theme, wx: number, wy: number, f: number) {
  const c = bp(th);
  bossFloor(p, th, wx, wy);
  p.part(E(8, 14, 5, 1.4), '#000000', { flat: true, noOl: true });
  p.part(R(7, 9, 2, 5.5), '#4a4258', { ol: '#14101c' });
  p.part(R(4.5, 13, 7, 2), '#4a4258', { ol: '#14101c' });
  p.part(P(3.5, 6.5, 12.5, 6.5, 11, 10.5, 5, 10.5), '#5a5268', { ol: '#14101c', hi: '#8a8298' });
  const glow = 0.7 + 0.3 * Math.sin(f * 0.9);
  p.part(E(8, 6, 6, 4.2), mix(c.slab[0], c.flame, 0.2 * glow), { flat: true, noOl: true });
  const w = 1 + 0.25 * Math.sin(f * 1.3 + wx);
  p.part(P(8, 0.2 + (1 - w) * 2.5, 10.4, 3.6, 11.2, 6.4, 8, 7.2, 4.8, 6.4, 5.6, 3.6), c.flame, { ol: mix(c.flame, '#000000', 0.5) });
  p.part(P(8, 2.6 + (1 - w) * 2, 9.4, 4.8, 9.6, 6.4, 8, 6.8, 6.4, 6.4, 6.6, 4.8), mix(c.flame, '#ffffff', 0.55), { flat: true, noOl: true });
}
function bossTile(p: Pix, th: Theme, ch: string, x: number, y: number, f: number, state: { open?: boolean; used?: boolean }) {
  switch (ch) {
    case '#': bossWall(p, th, x, y); break;
    case '=': bossCarpet(p, th, x, y); break;
    case ',': bossRune(p, th, x, y, f); break;
    case 'I': bossPillar(p, th, x, y); break;
    case 'f': bossBrazier(p, th, x, y, f); break;
    case '~': waterTile(p, th, x, y, f); break;
    case 'H': springTile(p, th, x, y, f, !!state.used, () => bossFloor(p, th, x, y)); break;
    default: bossFloor(p, th, x, y);
  }
}

const ovCache = new Map<string, HTMLCanvasElement>();
/** 地面を ぬかない ものだけの 絵（あたらしい ダンジョンの 描き方で 地面の 上に のせる） */
export function overlaySprite(th: Theme, ch: string, x: number, y: number, frame: number, state: { open?: boolean; used?: boolean; ev?: EventTileKind } = {}): HTMLCanvasElement | null {
  if (!'CH>EVZ'.includes(ch)) return null;
  const f = ch === 'C' ? 0 : frame % 16;
  const key = `${th}|${ch}|${f}|${state.open ? 1 : 0}${state.used ? 1 : 0}${state.ev ?? ''}`;
  const hit = ovCache.get(key);
  if (hit) return hit;
  const p = new Pix(16, 16, S);
  if (ch === 'C') chestTile(p, th, x, y, !!state.open, false);
  else if (ch === 'H') springTile(p, th, x, y, f, !!state.used, () => {});
  else if (ch === '>') portalTile(p, th, x, y, f, '#3aa0ff', false);
  else if (ch === 'E') portalTile(p, th, x, y, f, '#ffc030', false);
  else if (ch === 'V') eventObject(p, state.ev ?? 'story', f, PAL[th].g[1]);
  else hiddenDoorOverlay(p, f);
  const c = p.canvas();
  ovCache.set(key, c);
  return c;
}

const cache = new Map<string, HTMLCanvasElement>();
/** タイルの絵（座標は模様のつながり用、frame はアニメ用） */
export function tileSprite(th: Theme, ch: string, x: number, y: number, frame: number, state: { open?: boolean; used?: boolean; boss?: boolean; bld?: BldState; ev?: EventTileKind } = {}): HTMLCanvasElement {
  const anim = ch === '~' || ch === '>' || ch === 'G' || ch === 'E' || ch === 'H' || ch === 'F' || (!!state.boss && (ch === 'f' || ch === ',')) || ch === 'V' || ch === 'Z' || (th === 'town' && (ch === 'l' || (ch === 'R' && !!state.bld)));
  const f = anim ? frame % 16 : 0;
  const key = `${th}|${ch}|${x},${y}|${f}|${state.open ? 1 : 0}${state.used ? 1 : 0}${state.boss ? 'B' : ''}${state.ev ?? ''}${state.bld ? `${state.bld.style}${state.bld.rel}${state.bld.sign ? 's' : ''}` : ''}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = new Pix(16, 16, S);
  if (state.boss) {
    bossTile(p, th, ch, x, y, f, state);
    const cb = p.canvas();
    if (cache.size > 3000) cache.clear();
    cache.set(key, cb);
    return cb;
  }
  if (th === 'town' && (state.bld || ch === 'l' || ch === 'u' || ch === 'w')) {
    const base = () => grassTile(p, 'town', x, y, false);
    if (ch === 'R' && state.bld) roofStyled(p, state.bld, f);
    else if (ch === 'W' && state.bld) wallStyled(p, state.bld, x);
    else if (ch === 'D' && state.bld) doorStyled(p, state.bld, x);
    else if (ch === 'l') lampTile(p, base, f);
    else if (ch === 'u') flowerBed(p, base, x, y);
    else if (ch === 'w') wellTile(p, base);
    else base();
    const cs = p.canvas();
    if (cache.size > 3000) cache.clear();
    cache.set(key, cs);
    return cs;
  }
  const indoor = th === 'interior' || th === 'shrine' || th === 'ranch' || th === 'lab' || th === 'shop' || th === 'arena';
  if (indoor || (th === 'town' && ch === 'D')) {
    switch (ch) {
      case '#': if (th === 'ranch') fence(p, x, y); else innerWall(p, th, x); break;
      case ',': if (th === 'ranch') grassTile(p, 'ranch', x, y, true); else carpet(p, th, x, y); break;
      case 'L': bookshelf(p); break;
      case 'X': table(p, th, x, y); break;
      case 'K': counterTile(p); break;
      case 'T': pottedPlant(p, th, x, y); break;
      case '>': stairs(p, th, x, y, false); break;
      case '<': stairs(p, th, x, y, true); break;
      case 'D': doorTile(p, th, x, y); break;
      case 'G': gateTile(p, x, y, f); break;
      case '~': waterTile(p, 'town', x, y, f); break;
      default:
        if (th === 'ranch') grassTile(p, 'ranch', x, y, false);
        else floorFor(p, th, x, y);
    }
    const c0 = p.canvas();
    if (cache.size > 3000) cache.clear();
    cache.set(key, c0);
    return c0;
  }
  switch (ch) {
    case '#':
    case 'T':
      if (th === 'forest' || th === 'town') treeTile(p, th, x, y);
      else rockWall(p, th, x, y);
      break;
    case '~': waterTile(p, th, x, y, f); break;
    case ',': grassTile(p, th, x, y, true); break;
    case 'C': chestTile(p, th, x, y, !!state.open); break;
    case 'V': grassTile(p, th, x, y, false); eventObject(p, state.ev ?? 'story', f, PAL[th].g[1]); break;
    case 'Z':
      if (th === 'forest' || th === 'town') treeTile(p, th, x, y); else rockWall(p, th, x, y);
      hiddenDoorOverlay(p, f);
      break;
    case '>': portalTile(p, th, x, y, f, '#3aa0ff'); break;
    case 'G': gateTile(p, x, y, f); break;
    case 'E': portalTile(p, th, x, y, f, '#ffc030'); break;
    case 'H': springTile(p, th, x, y, f, !!state.used); break;
    case 'R': roofTile(p, x); break;
    case 'W': houseWallTile(p, x); break;
    case 'F': fountainTile(p, f); break;
    case 'K': counterTile(p); break;
    default:
      if (th === 'town' && (ch === '.' || ch === 'P' || /[0-9]/.test(ch))) pathTile(p, x, y);
      else if (th === 'tower') stoneFloor(p, th, x, y);
      else grassTile(p, th, x, y, false);
  }
  const c = p.canvas();
  if (cache.size > 3000) cache.clear();
  cache.set(key, c);
  return c;
}

// ---------------------------------------------------------------- 人物（16×20 を 2 倍で）
export type PersonLook = { hair: string; skin?: string; top: string; bottom: string; hat?: string; beard?: boolean; scarf?: string; bald?: boolean; braid?: boolean; staff?: boolean; bag?: string };
export type Facing = 'down' | 'up' | 'left' | 'right';
export const PERSON_W = 32, PERSON_H = 40;

export const LOOKS: Record<string, PersonLook> = {
  hero: { hair: '#6a3c22', top: '#2a8aa0', bottom: '#34405e', scarf: '#e04a3a', bag: '#a87040' },
  doctor: { hair: '#f2f2f2', top: '#6e50a8', bottom: '#4a3080', beard: true, staff: true },
  lily: { hair: '#f2c860', top: '#ef7aa4', bottom: '#fbf2e2', hat: '#ff92bc', braid: true },
  shop: { hair: '#5a3a2a', top: '#e8e2cc', bottom: '#4e7a3a', bald: true },
  arena: { hair: '#2a2a3a', top: '#3a5ab0', bottom: '#2a3a7a', hat: '#3a5ab0' },
  guard: { hair: '#4a3a2a', top: '#a0a8b8', bottom: '#5a6070', hat: '#c0c8d8' },
  kid: { hair: '#3a2a1a', top: '#f0a030', bottom: '#4a6ab0', hat: '#e04040' },
  granny: { hair: '#d4d4dc', top: '#9a7258', bottom: '#6a4a3a' },
  scribe: { hair: '#6a4a3a', top: '#3e8a5a', bottom: '#2e5a44', hat: '#3e8a5a' },
  elder: { hair: '#e8e8e8', top: '#7a9a5a', bottom: '#4a5a3a', beard: true, staff: true },
  wind: { hair: '#4ab0c8', top: '#e8f0f8', bottom: '#5a8ab0', scarf: '#4ab0c8' },
};

function drawPerson(L: PersonLook, dir: Facing, frame: number): Pix {
  const p = new Pix(16, 20, S);
  const skin = L.skin ?? '#f8d4ae';
  const ol = '#2a1820';
  const step = frame % 2;
  const side = dir === 'left';
  // あし・くつ
  const legY = 15.5;
  if (side) {
    p.part(RR(5.2 + step, legY, 2.6, 3.8, 0.8), L.bottom, { ol });
    p.part(RR(8.4 - step, legY, 2.6, 3.8, 0.8), L.bottom, { ol });
    p.part(E(5.6 + step, 19, 1.9, 0.9), '#4a3020', { ol }); p.part(E(8.8 - step, 19, 1.9, 0.9), '#4a3020', { ol });
  } else {
    p.part(RR(5.2, legY, 2.6, step ? 3 : 3.8, 0.8), L.bottom, { ol });
    p.part(RR(8.2, legY, 2.6, step ? 3.8 : 3, 0.8), L.bottom, { ol });
    p.part(E(6.5, step ? 18.4 : 19.1, 1.6, 0.9), '#4a3020', { ol }); p.part(E(9.5, step ? 19.1 : 18.4, 1.6, 0.9), '#4a3020', { ol });
  }
  if (L.staff) { p.line(13.5, 5, 13.5, 19.5, '#7a4a20', 1.1); p.part(E(13.5, 4.2, 1.3, 1.3), '#70e8ff', { ol: '#1a4a6a' }); }
  // からだ
  p.part(RR(3.6, 10.3, 8.8, 6.4, 2.4), L.top, { ol });
  if (L.bag && dir !== 'up') p.part(RR(dir === 'left' ? 9.5 : 2.5, 12.5, 3.2, 3, 0.8), L.bag, { ol });
  p.part(R(4, 14.6, 8, 1.1), shade(L.top, 0.6), { flat: true, noOl: true });
  // うで
  const armSwing = step ? 0.7 : -0.7;
  if (!side) {
    p.part(E(3.4, 13 + armSwing, 1.3, 2), L.top, { ol }); p.part(E(12.6, 13 - armSwing, 1.3, 2), L.top, { ol });
    p.part(E(3.4, 14.8 + armSwing, 0.9, 0.9), skin, { flat: true, ol }); p.part(E(12.6, 14.8 - armSwing, 0.9, 0.9), skin, { flat: true, ol });
  } else p.part(E(8, 13 + armSwing, 1.4, 2), shade(L.top, 0.9), { ol });
  if (L.scarf) {
    p.part(RR(4, 9.6, 8, 2, 1), L.scarf, { ol });
    if (dir === 'up') p.part(P(7, 11, 9, 11, 9.5, 14.5, 7.5, 14), L.scarf, { ol });
    if (side) p.part(P(10, 10.5, 13.5, 11.5 + step, 13, 13.5 + step, 10, 12), L.scarf, { ol });
  }
  // あたま
  p.part(E(8, 6.2, 5.4, 5), skin, { ol, flat: false, hiT: 0.7, loT: -0.75 });
  if (!L.bald) {
    if (dir === 'up') p.part(E(8, 5.6, 5.6, 5), L.hair, { ol });
    else {
      p.part(P(2.4, 7.5, 2.8, 2.5, 5.5, 0.6, 10.5, 0.6, 13.2, 2.5, 13.6, 7.5, 11.8, 4, 10, 5, 8, 3.6, 6, 5, 4, 4), L.hair, { ol });
      if (side) p.part(RR(9, 2, 4.8, 6.5, 2), L.hair, { ol });
    }
  } else p.part(E(8, 2.6, 4, 1.6), shade(skin, 0.9), { flat: true, noOl: true });
  if (L.hat) p.part(RR(2.6, 0.2, 10.8, 3.4, 1.6), L.hat, { ol });
  if (L.braid && dir !== 'left') p.part(E(dir === 'up' ? 8 : 2.6, 10.5, 1.4, 2.8), L.hair, { ol });
  if (dir !== 'up') {
    const ex = side ? [5, 8] : [5.8, 10.2];
    for (const x of ex) {
      p.part(E(x, 7, 0.9, 1.3), '#2a1a28', { flat: true, noOl: true });
      p.pxh(Math.round((x - 0.3) * S), Math.round(6.2 * S), '#ffffff');
    }
    if (!side) { p.part(E(4.4, 8.8, 0.9, 0.5), '#ffa0a0', { flat: true, noOl: true }); p.part(E(11.6, 8.8, 0.9, 0.5), '#ffa0a0', { flat: true, noOl: true }); }
    if (L.beard) p.part(Sub(E(8, 10, 3.8, 3), R(3, 6, 10, 2.6)), '#f4f4f4', { ol: '#9a9aa4' });
  }
  return p;
}

const pcache = new Map<string, HTMLCanvasElement>();
export function personSprite(look: string, dir: Facing, frame: number): HTMLCanvasElement {
  const key = `${look}|${dir}|${frame % 2}`;
  const hit = pcache.get(key);
  if (hit) return hit;
  const L = LOOKS[look] ?? LOOKS.kid;
  const c = dir === 'right' ? flipH(personSprite(look, 'left', frame)) : drawPerson(L, dir, frame).canvas();
  pcache.set(key, c);
  return c;
}
