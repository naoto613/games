// モンスターのドット絵。48×48 の設計を 2 倍（96×96）で描く。すべてオリジナルのデザイン。
import { E, P, Pix, R, RR, Sub, mix, mkCanvas, tint } from './Pix';

export const MON_SIZE = 48;
/** 描画の倍率 */
export const MON_SCALE = 2;
type Draw = (p: Pix) => void;

// ---------------------------------------------------------------- 共通の小物
const NO = { flat: true, noOl: true } as const;
/** つや（白いハイライト） */
const gloss = (p: Pix, x: number, y: number, rx: number, ry = rx * 0.7) => {
  p.part(E(x, y, rx, ry), '#ffffff', NO);
  p.part(E(x + rx * 1.4, y + ry * 1.3, rx * 0.35, ry * 0.35), '#ffffff', NO);
};
const cheek = (p: Pix, x: number, y: number, c = '#ff94b4') => p.part(E(x, y, 2.4, 1.4), c, NO);
/** ひらいた口（舌つき） */
const mouth = (p: Pix, x: number, y: number, w: number, h: number) => {
  p.part(Sub(E(x, y, w, h), R(x - w - 1, y - h - 1, w * 2 + 2, h)), '#6a1a2a', { flat: true, ol: '#2a0a14' });
  p.part(E(x, y + h * 0.45, w * 0.55, h * 0.4), '#ff7a8a', NO);
};
const fang = (p: Pix, x: number, y: number, h = 1.6) => p.part(P(x - 0.8, y, x + 0.8, y, x, y + h), '#ffffff', { flat: true, ol: '#5a4a5a' });
/** 4方向に光る星 */
const star = (p: Pix, x: number, y: number, s = 2, c = '#fff6b0') => {
  p.part(P(x, y - s * 1.6, x + s * 0.35, y - s * 0.35, x + s * 1.6, y, x + s * 0.35, y + s * 0.35, x, y + s * 1.6, x - s * 0.35, y + s * 0.35, x - s * 1.6, y, x - s * 0.35, y - s * 0.35), c, { flat: true, ol: mix(c, '#806020', 0.5) });
};
/** 毛なみ・模様の短い線 */
const strokes = (p: Pix, c: string, pts: [number, number, number, number][]) => { for (const [a, b, cc, d] of pts) p.line(a, b, cc, d, c); };
/** 炎（外・中・芯の3層） */
const flame = (p: Pix, pts: number[], scale = 1) => {
  const xs = pts.filter((_, i) => i % 2 === 0), ys = pts.filter((_, i) => i % 2 === 1);
  const cx = xs.reduce((a, b) => a + b, 0) / xs.length, cy = ys.reduce((a, b) => a + b, 0) / ys.length;
  const shrink = (k: number) => pts.map((v, i) => (i % 2 === 0 ? cx + (v - cx) * k : cy + (v - cy) * k + (1 - k) * 2.5 * scale));
  p.part(P(...pts), '#e8401c', { ol: '#7a1408', hi: '#ff7a30' });
  p.part(P(...shrink(0.66)), '#ff9a28', { noOl: true, hi: '#ffc850' });
  p.part(P(...shrink(0.36)), '#fff0a0', NO);
};
/** 目（白目つき・まぶた） */
const bigEye = (p: Pix, x: number, y: number, r: number, iris: string, o: { lid?: string; angry?: number; w?: number } = {}) => {
  const w = o.w ?? 0.85;
  p.part(E(x, y, r * w, r), '#ffffff', { flat: true, ol: '#1a1020' });
  p.eye(x + r * 0.08, y + r * 0.12, r * 0.78, iris, { w: 0.82 });
  if (o.lid) p.part(Sub(E(x, y, r * w + 0.6, r + 0.6), R(x - r - 2, y - r * 0.15 + (o.angry ?? 0), r * 2 + 4, r * 2 + 4)), o.lid, { flat: true, ol: '#1a1020' });
};

const SPRITES: Record<string, Draw> = {
  // ================================================================ せいれい
  lumipon(p) {
    for (let a = 0; a < 12; a++) {
      const t = (a / 12) * Math.PI * 2;
      p.line(24 + Math.cos(t) * 5.5, 8 + Math.sin(t) * 5.5, 24 + Math.cos(t) * 7.5, 8 + Math.sin(t) * 7.5, '#fff3a0');
    }
    p.line(24, 12, 24, 17, '#e8c040', 1.4);
    p.part(E(24, 8, 4.3), '#ffd84a', { hi: '#fff6c0' });
    gloss(p, 22.6, 6.4, 1.2);
    p.part(E(16.5, 44, 5, 2.6), '#3f86c0');
    p.part(E(31.5, 44, 5, 2.6), '#3f86c0');
    p.part(E(8.5, 31, 3.8, 3.2), '#6cbcec');
    p.part(E(39.5, 31, 3.8, 3.2), '#6cbcec');
    p.part(E(24, 30, 16, 14), '#74c4f2', { hiT: 0.45 });
    p.part(E(24, 36.5, 10, 6.5), '#c8ecff', { noOl: true, loT: -0.9 });
    gloss(p, 14, 21, 3.2, 2.2);
    bigEye(p, 18, 28, 4.6, '#1d3f8a');
    bigEye(p, 30, 28, 4.6, '#1d3f8a');
    cheek(p, 11.5, 34);
    cheek(p, 36.5, 34);
    mouth(p, 24, 35, 2.6, 2.2);
  },
  tsukipon(p) {
    p.part(Sub(E(25, 9, 7.5), E(29, 6, 6.5)), '#ffd24a', { hi: '#fff4c0', ol: '#8a5a10' });
    star(p, 38, 6, 1.8); star(p, 9, 12, 1.4, '#e8e4ff'); star(p, 42, 17, 1.1, '#e8e4ff');
    p.part(E(16.5, 44.5, 5, 2.4), '#4a4498');
    p.part(E(31.5, 44.5, 5, 2.4), '#4a4498');
    p.part(E(8, 32, 3.6, 3), '#8a84e6');
    p.part(E(40, 32, 3.6, 3), '#8a84e6');
    p.part(E(24, 30.5, 17, 14), '#8a84e6', { hiT: 0.45 });
    p.part(E(24, 37, 10.5, 6.2), '#c4c0ff', { noOl: true, loT: -0.9 });
    for (const [x, y] of [[13, 24], [33, 38], [30, 20], [16, 39]]) star(p, x, y, 0.9, '#fff8d0');
    gloss(p, 14, 21, 3, 2);
    for (const x of [18, 30]) {
      p.part(Sub(E(x, 28, 4, 3), R(x - 5, 23, 10, 5)), '#2a2660', { flat: true, ol: '#1a1440' });
      p.line(x - 4, 28, x + 4, 28, '#1a1440', 1.2);
      p.line(x + 3.5, 28.5, x + 5, 27, '#1a1440');
    }
    cheek(p, 11.5, 33.5, '#ffa0d0');
    cheek(p, 36.5, 33.5, '#ffa0d0');
    p.part(E(24, 34, 1.6, 1.2), '#6a1a3a', { flat: true, ol: '#2a0a14' });
  },
  auroran(p) {
    const bands: [string, number][] = [['#7af0c8', 0], ['#7ad4f8', 1.6], ['#c4a0ff', 3.2], ['#ff9ad0', 4.8]];
    for (const [c, k] of bands) {
      p.part(P(24, 16 + k, 3 + k * 1.3, 33 - k, 6 + k, 44 - k, 13, 38 - k * 0.5), c, { ol: mix(c, '#203060', 0.6), hiT: 0.3 });
      p.part(P(24, 16 + k, 45 - k * 1.3, 33 - k, 42 - k, 44 - k, 35, 38 - k * 0.5), c, { ol: mix(c, '#203060', 0.6), hiT: 0.3 });
    }
    p.part(E(24, 43, 6.5, 3.5), '#dff6ff');
    p.part(E(24, 27, 11, 13), '#eefaff', { hi: '#ffffff', lo: '#a8d4f0' });
    for (const [x, h, w] of [[17, 7, 2.4], [20.5, 10, 2.6], [24, 13, 3], [27.5, 10, 2.6], [31, 7, 2.4]] as [number, number, number][])
      p.part(P(x - w, 17, x, 17 - h, x + w, 17), '#8ae8ff', { hi: '#ffffff', ol: '#2a7090' });
    gloss(p, 23, 8, 0.8);
    bigEye(p, 19.5, 26, 3.6, '#2a74b8');
    bigEye(p, 28.5, 26, 3.6, '#2a74b8');
    cheek(p, 15, 31.5, '#ffb0d8');
    cheek(p, 33, 31.5, '#ffb0d8');
    mouth(p, 24, 32, 1.8, 1.6);
    star(p, 6, 12, 1.6); star(p, 42, 10, 1.3, '#c8fff0'); star(p, 40, 40, 1.1);
  },
  // ================================================================ けもの
  kogemaru(p) {
    flame(p, [40, 9, 45, 17, 44.5, 25, 40, 30, 35, 27, 34.5, 19, 37, 21]);
    p.part(P(33, 37, 39, 28, 41, 31, 37, 39), '#7a4a26');
    p.part(E(16, 44.5, 4.6, 2.6), '#5a3418');
    p.part(E(32, 44.5, 4.6, 2.6), '#5a3418');
    p.part(E(24, 38, 12, 8.5), '#b06c38');
    p.part(E(24, 40.5, 6.5, 5), '#f0d0a0', { noOl: true });
    for (const [x, y] of [[14, 35], [33, 40], [17, 42]]) p.part(E(x, y, 1.6, 1.2), '#4a2a14', NO);
    p.part(P(6, 9, 15, 13, 16, 21, 9, 27, 5, 20), '#4a2c18', { hi: '#6a4428' });
    p.part(P(42, 9, 33, 13, 32, 21, 39, 27, 43, 20), '#4a2c18', { hi: '#6a4428' });
    p.part(P(8, 13, 13, 15.5, 12, 21, 8.5, 22), '#c87878', NO);
    p.part(P(40, 13, 35, 15.5, 36, 21, 39.5, 22), '#c87878', NO);
    p.part(E(24, 21, 14, 12), '#bc7a42', { hi: '#e8aa68' });
    strokes(p, '#8a5028', [[14, 12, 15.5, 14], [18, 10, 19, 12.5], [32, 12, 30.8, 14.2]]);
    p.part(E(24, 27, 7.5, 5.2), '#f4dcb0', { noOl: true });
    p.part(E(24, 23.5, 2.8, 2), '#2a1810', { flat: true, ol: '#120a06' });
    gloss(p, 23, 22.8, 0.6);
    bigEye(p, 17.5, 19, 3.6, '#3a2010');
    bigEye(p, 30.5, 19, 3.6, '#3a2010');
    mouth(p, 24, 28, 3.2, 2.6);
    cheek(p, 12, 25, '#ff9a8a');
    cheek(p, 36, 25, '#ff9a8a');
  },
  homurawolf(p) {
    flame(p, [38, 30, 47, 22, 45, 33, 40, 38]);
    flame(p, [5, 30, 4, 15, 10, 19, 11, 7, 17, 13, 21, 2, 26, 11, 32, 3, 34, 14, 41, 9, 40, 21, 44, 28, 36, 34, 12, 34], 1.4);
    p.part(R(11, 34, 5, 11), '#5a5a6c'); p.part(R(32, 34, 5, 11), '#5a5a6c');
    p.part(E(13.5, 45, 3.6, 1.8), '#3a3a48'); p.part(E(34.5, 45, 3.6, 1.8), '#3a3a48');
    p.part(E(24, 35, 13, 7), '#8c8ca0');
    p.part(E(24, 38, 6, 4), '#d0d0dc', { noOl: true });
    p.part(P(14, 13, 17, 3, 21, 12), '#6a6a7c'); p.part(P(34, 13, 31, 3, 27, 12), '#6a6a7c');
    p.part(P(16, 11, 17.5, 6, 19.5, 11), '#e87a7a', NO); p.part(P(32, 11, 30.5, 6, 28.5, 11), '#e87a7a', NO);
    p.part(E(24, 21, 10, 9), '#9c9cb0', { hi: '#d4d4e4' });
    p.part(P(18, 22, 30, 22, 28, 30, 20, 30), '#d8d8e6', { lo: '#a8a8bc' });
    p.part(E(24, 23.5, 2.2, 1.5), '#1a1a22', { flat: true, ol: '#0a0a10' });
    for (const s of [-1, 1]) {
      const x = 24 + s * 5.5;
      p.part(P(x - 3 * s, 17, x + 3.2 * s, 18.5, x + 0.5 * s, 21), '#ffd040', { flat: true, ol: '#2a1008' });
      p.part(E(x + 0.4 * s, 19, 0.7, 1.4), '#1a0a04', NO);
      p.line(x - 3.5 * s, 15.5, x + 3 * s, 17.5, '#3a3a48', 1.3);
    }
    p.line(20, 28, 28, 28, '#2a2a34', 1.2);
    fang(p, 21.5, 28); fang(p, 26.5, 28);
  },
  mitsugashira(p) {
    p.part(R(10, 36, 6, 9), '#3a2e3e'); p.part(R(32, 36, 6, 9), '#3a2e3e');
    p.part(E(13, 45, 4, 2), '#24182a'); p.part(E(35, 45, 4, 2), '#24182a');
    p.part(E(24, 36, 16, 9), '#5c4a62', { hi: '#8a7690' });
    p.part(E(24, 39, 7, 5), '#a090a8', { noOl: true });
    p.part(R(8, 31, 32, 3), '#b02838', { ol: '#4a0a10' });
    for (let x = 10; x <= 38; x += 4) p.part(P(x - 1.2, 31, x, 28, x + 1.2, 31), '#d8d8e0', { ol: '#4a4a58' });
    const head = (cx: number, cy: number, s: number) => {
      p.part(P(cx - 7 * s, cy - 2, cx - 5 * s, cy - 12 * s, cx - 1, cy - 5), '#2c2030');
      p.part(P(cx + 7 * s, cy - 2, cx + 5 * s, cy - 12 * s, cx + 1, cy - 5), '#2c2030');
      p.part(E(cx, cy, 7 * s, 6.5 * s), '#6c5a72', { hi: '#a08aa8' });
      p.part(E(cx, cy + 3.5 * s, 4.2 * s, 3 * s), '#9a88a2', { noOl: true });
      p.part(E(cx, cy + 1.8 * s, 1.6 * s, 1.1 * s), '#140a14', NO);
      for (const d of [-1, 1]) {
        p.part(P(cx + d * 1.2 * s, cy - 1.5 * s, cx + d * 5 * s, cy - 2.6 * s, cx + d * 3.4 * s, cy), '#ff3a3a', { flat: true, ol: '#3a0a0a' });
        p.line(cx + d * 1 * s, cy - 2.4 * s, cx + d * 5 * s, cy - 3.8 * s, '#20141e', 1.2);
      }
      p.line(cx - 3 * s, cy + 5 * s, cx + 3 * s, cy + 5 * s, '#20141e');
      fang(p, cx - 1.8 * s, cy + 5 * s, 1.6 * s); fang(p, cx + 1.8 * s, cy + 5 * s, 1.6 * s);
    };
    head(9.5, 22, 0.82);
    head(38.5, 22, 0.82);
    head(24, 16, 1);
  },
  // ================================================================ こうせき
  iwatokage(p) {
    p.part(P(1, 41, 6, 36, 13, 38, 12, 41, 6, 42), '#5e8a5e');
    p.part(R(12, 38, 5, 7), '#4a744a'); p.part(R(29, 38, 5, 7), '#4a744a');
    p.part(E(14.5, 45, 3.6, 1.8), '#38583a'); p.part(E(31.5, 45, 3.6, 1.8), '#38583a');
    p.part(E(22, 35, 15, 8), '#76a476', { hi: '#a8d0a0' });
    p.part(E(22, 39, 9, 3.5), '#c8dca8', { noOl: true });
    for (const [x, y] of [[13, 33], [19, 31], [27, 33], [16, 37]]) p.part(E(x, y, 1.6, 1.1), '#4e7a50', NO);
    for (const [x, h, w] of [[11, 9, 3], [17, 14, 3.6], [23, 12, 3.4], [29, 8, 2.8]] as [number, number, number][]) {
      p.part(P(x - w, 30, x - w * 0.3, 30 - h, x + w, 30), '#4aa4ec', { hi: '#c8f0ff', lo: '#2a68b0', ol: '#18386a' });
      p.line(x - w * 0.15, 29, x - w * 0.3 + 0.2, 31 - h, '#e8faff');
    }
    p.part(E(38, 31, 8.5, 6.5), '#82b082', { hi: '#b8dcb0' });
    p.part(E(41, 34, 5, 2.6), '#a8c8a0', { noOl: true });
    bigEye(p, 39.5, 29, 2.8, '#2a3a20', { lid: '#6a9a6a' });
    p.line(42, 35, 46, 34, '#2a4a2a');
    p.part(E(45.5, 31, 0.6, 0.6), '#2a4a2a', NO);
  },
  haganegame(p) {
    p.part(R(9, 37, 7, 8), '#5a6070'); p.part(R(30, 37, 7, 8), '#5a6070');
    p.part(E(12.5, 45, 4.4, 2), '#3a3e4a'); p.part(E(33.5, 45, 4.4, 2), '#3a3e4a');
    p.part(E(40, 31, 6.5, 6), '#8a92a6', { hi: '#c8d0e0' });
    bigEye(p, 41.5, 29.5, 2.6, '#101828', { lid: '#7a8296', angry: 0.4 });
    p.line(40, 34, 45, 33, '#2a2e3a');
    p.part(RR(3, 13, 35, 25, 12), '#a8b6cc', { hi: '#eef4ff', lo: '#6a7a92', ol: '#2a3040' });
    const plate = (x: number, y: number, r: number) => {
      p.part(P(x - r, y, x - r / 2, y - r * 0.85, x + r / 2, y - r * 0.85, x + r, y, x + r / 2, y + r * 0.85, x - r / 2, y + r * 0.85), '#c4d0e4', { hi: '#ffffff', lo: '#8a98b0', ol: '#4a5670' });
      p.part(E(x, y, 0.7, 0.7), '#6a7890', NO);
    };
    plate(13, 22, 4.6); plate(22, 19, 4.6); plate(31, 22, 4.6); plate(17.5, 30, 4.4); plate(26.5, 30, 4.4);
    p.part(R(3, 34, 35, 3), '#5a6274', { ol: '#2a3040' });
    for (let x = 6; x < 37; x += 4) p.part(E(x, 35.5, 0.8, 0.8), '#c8d0e0', NO);
    gloss(p, 10, 16, 2.2, 1.2);
  },
  suishoryu(p) {
    p.part(P(2, 38, 10, 30, 16, 36, 12, 40), '#7a5ac8');
    p.part(P(18, 22, 9, 8, 22, 16), '#a8ecff', { hi: '#ffffff', ol: '#305a8a' });
    p.part(P(18, 22, 4, 16, 14, 24), '#88d8f8', { hi: '#ffffff', ol: '#305a8a' });
    p.part(R(14, 36, 6, 9), '#5e44a8'); p.part(R(28, 36, 6, 9), '#5e44a8');
    p.part(E(17, 45, 4, 2), '#3e2c78'); p.part(E(31, 45, 4, 2), '#3e2c78');
    p.part(E(24, 33, 13, 9), '#8a6ad8', { hi: '#c4aaff' });
    p.part(E(24, 37, 7.5, 5), '#dcd0ff', { noOl: true });
    for (let y = 33; y <= 40; y += 2.4) p.line(19, y, 29, y, '#b8a8ec');
    for (const [x, y, h] of [[14, 26, 8], [19, 24, 10], [25, 24.5, 8]] as [number, number, number][])
      p.part(P(x - 2.4, y + 2, x - 0.4, y - h, x + 2.4, y + 2), '#90e4ff', { hi: '#ffffff', lo: '#4a90c8', ol: '#204a7a' });
    p.part(E(33, 18, 8, 7), '#9a7ae6', { hi: '#d4c0ff' });
    p.part(P(31, 12, 35, 0, 38, 12), '#b0f0ff', { hi: '#ffffff', ol: '#305a8a' });
    p.part(E(39.5, 21.5, 5, 3.6), '#a88cf0');
    bigEye(p, 34.5, 16.5, 2.8, '#1a3a7a');
    p.line(36, 24, 44, 22.5, '#2a1a5a', 1.1);
    p.part(E(42.5, 20.3, 0.7, 0.7), '#2a1a5a', NO);
    star(p, 5, 12, 1.4, '#e0ffff'); star(p, 43, 38, 1.2, '#e0ffff');
  },
  // ================================================================ とり
  yorufukuro(p) {
    p.part(P(11, 11, 14, 1, 19, 10), '#232a5e'); p.part(P(37, 11, 34, 1, 29, 10), '#232a5e');
    p.part(E(8.5, 29, 6, 12), '#2e3888', { hi: '#5260b8' });
    p.part(E(39.5, 29, 6, 12), '#2e3888', { hi: '#5260b8' });
    for (const [x, y] of [[7, 25], [9.5, 31], [6.5, 36], [41, 25], [38.5, 31], [41.5, 36]]) star(p, x, y, 1, '#ffe890');
    p.part(E(24, 27, 13, 16), '#36469c', { hi: '#6070c8' });
    p.part(E(24, 34, 8.5, 8.5), '#dcdcf2', { noOl: true });
    for (let y = 30; y < 41; y += 3) for (let x = 19 + ((y / 3) % 2) * 1.5; x < 30; x += 3) p.part(P(x - 1, y, x, y + 1.2, x + 1, y), '#9898c8', NO);
    for (const x of [18, 30]) {
      p.part(E(x, 20, 6, 6), '#f0e6c0', { ol: '#2a2a5a' });
      p.part(E(x, 20, 4.2, 4.2), '#ffb820', { flat: true, ol: '#8a5a00' });
      p.part(E(x, 20, 2.2, 2.6), '#120c06', NO);
      gloss(p, x - 1.4, 18.4, 1);
    }
    p.part(P(21.5, 24, 26.5, 24, 24, 29), '#f0a828', { ol: '#6a4008' });
    p.part(R(18, 42, 4, 3), '#f0a828', { ol: '#6a4008' }); p.part(R(26, 42, 4, 3), '#f0a828', { ol: '#6a4008' });
  },
  kazetsubame(p) {
    for (const [x, y] of [[3, 7], [9, 4], [38, 4], [44, 9]]) { p.line(x, y, x + 3, y, '#c8e8ff'); p.line(x + 3, y, x + 4.5, y + 1.5, '#c8e8ff'); }
    const wing = (s: number) => {
      const pts = s < 0 ? [21, 26, 2, 13, 5, 19, 1, 21, 6, 25, 2, 28, 10, 30, 19, 33] : [27, 26, 46, 13, 43, 19, 47, 21, 42, 25, 46, 28, 38, 30, 29, 33];
      p.part(P(...pts), '#24348a', { hi: '#4a64c8' });
      p.line(s < 0 ? 6 : 42, 20, s < 0 ? 18 : 30, 28, '#5a78d8');
    };
    wing(-1); wing(1);
    p.part(P(18, 38, 13, 47, 20, 42, 24, 42, 28, 42, 35, 47, 30, 38), '#24348a', { hi: '#4a64c8' });
    p.part(E(24, 31, 8, 10), '#3448a8', { hi: '#6a86e0' });
    p.part(E(24, 35, 5, 6), '#f4f4ff', { noOl: true });
    p.part(E(24, 19, 7.5, 7), '#3448a8', { hi: '#6a86e0' });
    p.part(E(24, 23, 4, 2.4), '#e03838', NO);
    bigEye(p, 21, 18, 2.4, '#0e1430');
    bigEye(p, 27, 18, 2.4, '#0e1430');
    p.part(P(22.5, 21, 25.5, 21, 24, 24), '#f0c040', { ol: '#6a4a08' });
  },
  nijikujaku(p) {
    const cols = ['#ff5a6a', '#ffa040', '#ffe050', '#70d870', '#58b0ff', '#9a78ff'];
    cols.forEach((c, i) => {
      const r = 23 - i * 2.6;
      p.part(Sub(E(24, 27, r, r * 0.9), R(0, 27, 48, 30)), c, { flat: true, ol: i === 0 ? '#5a1a2a' : mix(c, '#000000', 0.45) });
    });
    for (let a = 0; a < 7; a++) {
      const t = Math.PI * (0.12 + (a / 6) * 0.76);
      const x = 24 - Math.cos(t) * 18, y = 27 - Math.sin(t) * 16;
      p.part(E(x, y, 2.4, 2.8), '#1a6ad0', { flat: true, ol: '#103a20' });
      p.part(E(x, y + 0.3, 1.2, 1.4), '#70ffd8', NO);
    }
    p.part(E(24, 34, 7.5, 10), '#2e86d6', { hi: '#78c4ff' });
    p.part(E(24, 22, 5.5, 5.5), '#2e86d6', { hi: '#78c4ff' });
    for (const x of [21, 24, 27]) { p.line(24, 17, x, 12, '#1a4a8a'); p.part(E(x, 11.5, 1.2, 1.2), '#ffd040', { flat: true, ol: '#6a4a08' }); }
    bigEye(p, 21.8, 21.5, 1.8, '#0a1028');
    bigEye(p, 26.2, 21.5, 1.8, '#0a1028');
    p.part(P(22.8, 24, 25.2, 24, 24, 26.5), '#f0a030', { ol: '#6a4008' });
    p.part(R(20, 43, 2, 3), '#c08030'); p.part(R(26, 43, 2, 3), '#c08030');
  },
  // ================================================================ しょくぶつ
  mossglow(p) {
    for (const x of [13, 24, 35]) p.part(P(x - 3.5, 46, x - 1, 38, x + 1.5, 38, x + 3.5, 46), '#6a4222', { hi: '#8a5a32' });
    p.part(RR(10, 18, 28, 24, 7), '#8e6236', { hi: '#c08a52' });
    strokes(p, '#6a4424', [[15, 26, 15, 37], [33, 25, 33, 36], [20, 38, 20, 40.5], [28, 37, 28, 40.5]]);
    p.part(E(24, 19, 13, 3.6), '#e2c088', { ol: '#6a4424' });
    p.part(E(24, 19, 8.5, 2.2), '#c49a62', NO);
    p.part(E(24, 19, 4, 1), '#e2c088', NO);
    p.part(E(13.5, 34, 4.5, 3.6), '#6ab844', { hi: '#a8e070' }); p.part(E(35, 29, 3.6, 3), '#6ab844', { hi: '#a8e070' });
    for (const [x, y] of [[12, 32], [15, 35], [34, 28]]) p.part(E(x, y, 0.7, 0.7), '#d8ff90', NO);
    const leaf = (cx: number, cy: number, rx: number, ry: number, rot: number) => {
      p.part(E(cx, cy, rx, ry), '#4ea844', { hi: '#9ae070' });
      p.line(cx - rx * 0.8 * Math.cos(rot), cy - rx * 0.8 * Math.sin(rot), cx + rx * 0.8 * Math.cos(rot), cy + rx * 0.8 * Math.sin(rot), '#2e7a2e');
    };
    leaf(14.5, 13, 7, 4, 0.25); leaf(33.5, 13, 7, 4, -0.25); leaf(24, 9, 5, 6.5, Math.PI / 2);
    star(p, 24, 2.5, 1.1, '#fffaa0');
    bigEye(p, 18.5, 28.5, 3, '#2a1a10');
    bigEye(p, 29.5, 28.5, 3, '#2a1a10');
    cheek(p, 13.5, 32.5); cheek(p, 34.5, 32.5);
    mouth(p, 24, 33.5, 2.2, 1.8);
  },
  madoidake(p) {
    for (const [x, y] of [[4, 36], [7, 42], [42, 37], [45, 31], [3, 27], [44, 43]]) { p.part(E(x, y, 1.1, 1.1), '#e8b0ff', NO); p.part(E(x + 1.5, y + 1.4, 0.6, 0.6), '#c890e0', NO); }
    p.part(E(12.5, 36, 3, 2.4), '#ece0c8'); p.part(E(35.5, 36, 3, 2.4), '#ece0c8');
    p.part(RR(15, 24, 18, 21, 6), '#f2e4cc', { hi: '#ffffff', lo: '#c8b498' });
    p.part(E(24, 25, 18, 3.5), '#8a2aa8', { flat: true, ol: '#3a0a4a' });
    for (let x = 9; x <= 39; x += 2.5) p.line(x, 25, 24 + (x - 24) * 0.6, 27.5, '#6a1a88');
    p.part(Sub(E(24, 20, 20, 15), R(0, 25, 48, 30)), '#a43cc8', { hi: '#e08af8', lo: '#6a1a90' });
    for (const [x, y, r] of [[13, 15, 3], [24, 10, 3.6], [34, 15.5, 2.8], [19, 20, 2], [30, 21, 1.8]] as [number, number, number][]) p.part(E(x, y, r, r * 0.85), '#fbe8ff', { flat: true, ol: '#8a2aa8' });
    gloss(p, 12, 10, 2.6, 1.4);
    for (const s of [-1, 1]) {
      const x = 24 + s * 4.2;
      p.part(Sub(E(x, 33, 2.8, 2.2), R(x - 3, 30, 6, 3)), '#3a1030', { flat: true, ol: '#1a0814' });
      p.line(x - 3 * s, 29.5, x + 2.5 * s, 31, '#3a1030', 1.1);
    }
    p.line(19, 38, 24, 39.5, '#3a1030', 1.1); p.line(24, 39.5, 29, 38, '#3a1030', 1.1);
    cheek(p, 17, 36, '#e8a0c8'); cheek(p, 31, 36, '#e8a0c8');
  },
  morinushi(p) {
    for (const [a, b, c2] of [[3, 46, 12], [36, 46, 45], [16, 46, 32]] as [number, number, number][]) p.part(P(a, b, (a + c2) / 2 - 2, 36, (a + c2) / 2 + 2, 36, c2, b), '#5a3818', { hi: '#7a5028' });
    p.part(RR(11, 22, 26, 23, 5), '#7a4e26', { hi: '#a8763e' });
    strokes(p, '#55341a', [[14, 26, 13, 40], [34, 25, 35, 41], [18, 39, 18, 43], [30, 39, 30, 43], [22, 24, 21, 27]]);
    const cl = (x: number, y: number, rx: number, ry: number) => p.part(E(x, y, rx, ry), '#3c8c3c', { hi: '#7ccc60', lo: '#246a2a' });
    cl(10, 17, 9, 7); cl(38, 17, 9, 7); cl(24, 12, 15, 10); cl(16, 7, 7, 5); cl(32, 7, 7, 5);
    for (const [x, y] of [[9, 14], [21, 6], [35, 13], [28, 10], [14, 19]]) p.part(E(x, y, 1, 0.8), '#b8f080', NO);
    p.part(E(33, 3, 5, 2.2), '#a07838', { ol: '#4a3010' });
    p.part(E(33, 1.5, 2, 2), '#ffd84a', { ol: '#6a4a08' });
    p.part(E(34, 1, 0.5, 0.5), '#202020', NO);
    for (const x of [18.5, 29.5]) {
      p.part(E(x, 30, 3.4, 3), '#2a1808', { flat: true, ol: '#120800' });
      p.part(E(x - 0.8, 29, 1, 1), '#ffd060', NO);
      p.line(x - 4, 26, x + 3.5, 26.5, '#3e2410', 1.4);
    }
    p.part(Sub(E(24, 37, 5, 3), R(18, 33, 12, 4)), '#2a1408', { flat: true, ol: '#120800' });
    p.part(E(13.5, 39, 3, 2.2), '#6ab844', { hi: '#a8e070' });
  },
  // ================================================================ ？？？
  luxdrago(p) {
    const wing = (s: number) => {
      const o = (x: number) => (s < 0 ? x : 48 - x);
      p.part(P(o(22), 24, o(3), 6, o(6), 14, o(1), 16, o(6), 22, o(2), 26, o(9), 30, o(18), 32), '#fff2c0', { hi: '#ffffff', lo: '#e8c860', ol: '#8a6a20' });
      for (const [a, b] of [[6, 14], [6, 22], [9, 30]]) p.line(o(a), b, o(19), 27, '#e8c860');
    };
    wing(-1); wing(1);
    p.part(P(14, 40, 4, 45, 9, 41, 16, 36), '#f0c040', { hi: '#ffe080' });
    p.part(R(15, 37, 6, 8), '#d8a428'); p.part(R(27, 37, 6, 8), '#d8a428');
    p.part(E(18, 45, 4, 2), '#a87818'); p.part(E(30, 45, 4, 2), '#a87818');
    p.part(E(24, 33, 11, 10), '#f8d450', { hi: '#fff6c0' });
    p.part(E(24, 36, 6.5, 6), '#fff2b8', { noOl: true });
    for (let y = 32; y <= 41; y += 2.6) p.line(20, y, 28, y, '#f0d070');
    p.part(P(24, 26, 26.8, 29, 24, 32, 21.2, 29), '#ff6ab0', { hi: '#ffd0f0', ol: '#6a1040' });
    p.part(E(24, 17, 9, 8), '#f8d450', { hi: '#fff6c0' });
    p.part(E(24, 21.5, 5, 3.2), '#ffeeb0', { noOl: true });
    p.part(P(16, 13, 13, 1, 20, 10), '#90e8ff', { hi: '#ffffff', ol: '#2a5a8a' });
    p.part(P(32, 13, 35, 1, 28, 10), '#90e8ff', { hi: '#ffffff', ol: '#2a5a8a' });
    bigEye(p, 20, 16.5, 2.6, '#1a4ab0');
    bigEye(p, 28, 16.5, 2.6, '#1a4ab0');
    p.part(E(22.5, 21, 0.6, 0.6), '#8a6010', NO); p.part(E(25.5, 21, 0.6, 0.6), '#8a6010', NO);
    p.line(20, 23.5, 28, 23.5, '#a07020');
    star(p, 4, 38, 1.5); star(p, 44, 37, 1.4); star(p, 24, 3, 1.4, '#ffffff');
  },
};

const cache = new Map<string, HTMLCanvasElement>();

/** モンスターの絵（distorted=ゆがみ：紫のもやをまとう） */
export function monsterSprite(id: string, opts: { distorted?: boolean } = {}): HTMLCanvasElement {
  const key = `${id}:${opts.distorted ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = new Pix(MON_SIZE, MON_SIZE, MON_SCALE);
  (SPRITES[id] ?? SPRITES.lumipon)(p);
  p.outline('#140c1c');
  let c = p.canvas();
  if (opts.distorted) {
    const [c2, g] = mkCanvas(c.width, c.height);
    const aura = tint(c, '#3a0a52');
    for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-3, -2], [3, 2], [-2, 3]]) { g.globalAlpha = 0.45; g.drawImage(aura, dx, dy); }
    g.globalAlpha = 1;
    g.drawImage(tint(c, '#7a2aa8', 0.28), 0, 0);
    c = c2;
  }
  cache.set(key, c);
  return c;
}

export const hasSprite = (id: string) => id in SPRITES;
export const SPRITE_IDS = Object.keys(SPRITES);
