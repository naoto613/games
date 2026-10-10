// モンスターのドット絵（40×40）。すべてオリジナルのデザインをコードで描く。
import { E, P, Pix, R, RR, Sub, mkCanvas, shade, tint } from './Pix';

export const MON_SIZE = 40;
type Draw = (p: Pix) => void;

const blush = (p: Pix, x: number, y: number) => { p.px(x, y, '#ff8fa8'); p.px(x + 1, y, '#ff8fa8'); };
const smile = (p: Pix, x: number, y: number, w = 2, c = '#3a2030') => { p.px(x - w, y - 1, c); for (let i = -w + 1; i < w; i++) p.px(x + i, y, c); p.px(x + w, y - 1, c); };
const sparkle = (p: Pix, x: number, y: number, c = '#fff8c0') => { p.px(x, y, c); p.px(x - 1, y, shade(c, 0.85)); p.px(x + 1, y, shade(c, 0.85)); p.px(x, y - 1, shade(c, 0.85)); p.px(x, y + 1, shade(c, 0.85)); };

const SPRITES: Record<string, Draw> = {
  // ---------------- せいれい
  lumipon(p) {
    // 頭の上の ひかりの たま
    p.part(E(20, 7, 3.2), '#ffe866', { hi: '#fffbe0' });
    for (const [x, y] of [[15, 6], [25, 6], [20, 2], [17, 3], [23, 3]]) p.px(x, y, '#fff3a0');
    p.part(R(19, 10, 2, 3), '#ffe866', { flat: true, noOl: true });
    p.part(E(14, 36, 3.5, 1.8), '#4f9ac8');
    p.part(E(26, 36, 3.5, 1.8), '#4f9ac8');
    p.part(E(20, 25, 12.5, 11), '#7cc8f0', { hi: '#c8ecff' });
    p.part(E(7.5, 26, 2.6, 2.2), '#7cc8f0');
    p.part(E(32.5, 26, 2.6, 2.2), '#7cc8f0');
    p.fill(E(20, 30, 6.5, 4), '#bfe6fa');
    p.eye(15, 23, 3, '#26325a');
    p.eye(25, 23, 3, '#26325a');
    blush(p, 10, 28); blush(p, 29, 28);
    smile(p, 20, 29, 2);
  },
  tsukipon(p) {
    p.part(Sub(E(21, 7, 5.5), E(24, 5, 4.5)), '#ffe27a', { hi: '#fff6c8' });
    sparkle(p, 30, 5); sparkle(p, 9, 9, '#e8e0ff');
    p.part(E(14, 36, 3.5, 1.8), '#4a4a90');
    p.part(E(26, 36, 3.5, 1.8), '#4a4a90');
    p.part(E(20, 25, 13, 11), '#7a7ad8', { hi: '#b8b8ff' });
    p.part(E(7, 27, 2.6, 2.2), '#7a7ad8');
    p.part(E(33, 27, 2.6, 2.2), '#7a7ad8');
    p.fill(E(20, 30, 7, 4), '#a8a8f0');
    for (const [x, y] of [[12, 20], [28, 31], [25, 17]]) p.px(x, y, '#fff6c8');
    // ねむたげな め
    p.hline(13, 17, 23, '#26244a'); p.hline(14, 16, 24, '#26244a');
    p.hline(23, 27, 23, '#26244a'); p.hline(24, 26, 24, '#26244a');
    blush(p, 10, 27); blush(p, 29, 27);
    p.px(19, 29, '#26244a'); p.px(20, 29, '#26244a');
  },
  auroran(p) {
    // オーロラの ベール
    const bands = ['#7ff0c8', '#7fd8f0', '#c8a0f8', '#f8a0d0'];
    bands.forEach((c, i) => {
      p.part(P(20, 12 + i, 2 + i * 2, 30 - i * 2, 6 + i, 36 - i), c, { noOl: true, flat: true });
      p.part(P(20, 12 + i, 38 - i * 2, 30 - i * 2, 34 - i, 36 - i), c, { noOl: true, flat: true });
    });
    p.part(E(20, 22, 9, 10), '#e8f8ff', { hi: '#ffffff', lo: '#b8d8f0' });
    p.part(P(14, 13, 16, 4, 18, 11, 20, 2, 22, 11, 24, 4, 26, 13), '#9ff0ff', { hi: '#e8ffff' });
    p.px(20, 6, '#ffffff');
    p.eye(16, 21, 2.5, '#2a5a8a');
    p.eye(24, 21, 2.5, '#2a5a8a');
    blush(p, 13, 25); blush(p, 26, 25);
    smile(p, 20, 27, 2, '#4a6a9a');
    p.part(E(20, 34, 5, 3), '#e8f8ff');
    sparkle(p, 6, 10); sparkle(p, 34, 14); sparkle(p, 31, 4, '#c8fff0');
  },
  // ---------------- けもの
  kogemaru(p) {
    // しっぽの ひのこ
    p.part(P(33, 12, 37, 20, 35, 26, 30, 25, 29, 19), '#ff9a30', { hi: '#ffe070' });
    p.fill(E(33, 21, 1.5, 2.5), '#fff2a0');
    p.part(P(28, 30, 34, 22, 33, 28), '#7a4a2a');
    p.part(E(13, 36, 3.5, 2), '#5a3420'); p.part(E(27, 36, 3.5, 2), '#5a3420');
    p.part(E(20, 30, 10, 7), '#a8683a');
    p.fill(E(20, 32, 5, 4), '#e8c090');
    // あたま
    p.part(P(8, 6, 15, 12, 7, 20), '#3a2418');
    p.part(P(32, 6, 25, 12, 33, 20), '#3a2418');
    p.part(E(20, 17, 11, 9), '#b8743e', { hi: '#e0a060' });
    p.fill(E(20, 21, 6, 4), '#f0d0a0');
    p.part(E(20, 18.5, 1.8, 1.3), '#2a1810', { flat: true });
    p.eye(15, 15, 2.2, '#2a1810');
    p.eye(25, 15, 2.2, '#2a1810');
    p.px(19, 22, '#2a1810'); p.px(21, 22, '#2a1810'); p.px(20, 21, '#2a1810');
    p.fill(R(19, 23, 3, 2), '#ff7a8a');
    for (const [x, y] of [[13, 27], [26, 33]]) p.px(x, y, '#3a2418');
  },
  homurawolf(p) {
    // たてがみの ほのお
    p.part(P(6, 22, 8, 8, 13, 13, 15, 4, 20, 10, 25, 3, 27, 12, 33, 7, 33, 20, 27, 25, 12, 26), '#ff6a20', { hi: '#ffd060', lo: '#c03a10' });
    p.part(R(10, 28, 4, 9), '#6a6a78'); p.part(R(26, 28, 4, 9), '#6a6a78');
    p.part(E(20, 28, 11, 6), '#8a8a98', { hi: '#c0c0d0' });
    p.part(P(14, 9, 17, 2, 19, 10), '#5a5a68'); p.part(P(26, 9, 23, 2, 21, 10), '#5a5a68');
    p.part(E(20, 17, 8, 7), '#9a9aa8', { hi: '#d0d0e0' });
    p.part(E(20, 22, 4.5, 3.2), '#c8c8d8');
    p.part(E(20, 20.5, 1.6, 1.1), '#1a1a22', { flat: true });
    // するどい め
    p.part(P(13, 15, 18, 16, 17, 18), '#ffd040', { flat: true, ol: '#2a1010' });
    p.part(P(27, 15, 22, 16, 23, 18), '#ffd040', { flat: true, ol: '#2a1010' });
    p.px(16, 17, '#2a1010'); p.px(24, 17, '#2a1010');
    p.hline(18, 22, 24, '#2a2a30'); p.px(18, 25, '#ffffff'); p.px(22, 25, '#ffffff');
    p.part(P(30, 26, 38, 18, 36, 28), '#ff8a30', { hi: '#ffe070' });
  },
  mitsugashira(p) {
    p.part(R(9, 30, 5, 8), '#4a3a4a'); p.part(R(26, 30, 5, 8), '#4a3a4a');
    p.part(E(20, 29, 13, 7), '#5a4a5a', { hi: '#8a7a8a' });
    p.fill(R(8, 30, 24, 2), '#c03030');
    const head = (cx: number, cy: number, s: number) => {
      p.part(P(cx - 6 * s, cy - 3, cx - 4 * s, cy - 11 * s, cx - 1, cy - 4), '#3a2a3a');
      p.part(P(cx + 6 * s, cy - 3, cx + 4 * s, cy - 11 * s, cx + 1, cy - 4), '#3a2a3a');
      p.part(E(cx, cy, 6 * s, 5.5 * s), '#6a5a6a', { hi: '#9a8a9a' });
      p.part(E(cx, cy + 3 * s, 3.5 * s, 2.5 * s), '#8a7a8a');
      p.px(cx, cy + 2, '#1a1018');
      p.px(cx - 3, cy - 1, '#ff4040'); p.px(cx - 2, cy - 1, '#ff4040');
      p.px(cx + 2, cy - 1, '#ff4040'); p.px(cx + 3, cy - 1, '#ff4040');
      p.px(cx - 2, cy + 5, '#ffffff'); p.px(cx + 2, cy + 5, '#ffffff');
    };
    head(8, 18, 0.85);
    head(32, 18, 0.85);
    head(20, 13, 1);
  },
  // ---------------- こうせき
  iwatokage(p) {
    p.part(P(2, 33, 10, 28, 12, 33), '#6a8a6a');
    p.part(R(10, 32, 4, 5), '#5a7a5a'); p.part(R(24, 32, 4, 5), '#5a7a5a');
    p.part(E(19, 29, 12, 6), '#7a9a7a', { hi: '#a8c8a8' });
    // せなかの こうせき
    for (const [x, h] of [[12, 7], [17, 10], [22, 8], [27, 6]] as [number, number][]) p.part(P(x - 3, 25, x, 25 - h, x + 3, 25), '#60a8e0', { hi: '#c0e8ff', lo: '#3070b0' });
    p.part(E(31, 26, 7, 5), '#88a888', { hi: '#b8d8b8' });
    p.eye(33, 24, 2, '#202020');
    p.hline(34, 37, 28, '#3a4a3a');
    p.px(36, 25, '#3a4a3a');
  },
  haganegame(p) {
    p.part(R(8, 30, 6, 7), '#6a7080'); p.part(R(26, 30, 6, 7), '#6a7080');
    p.part(E(33, 25, 5.5, 5), '#8a90a0', { hi: '#c0c8d8' });
    p.eye(35, 23, 1.8, '#101018');
    p.hline(34, 37, 27, '#3a3a48');
    // こうら
    p.part(RR(4, 12, 28, 20, 9), '#a8b4c8', { hi: '#f0f6ff', lo: '#6a7890' });
    for (const [x, y] of [[11, 18], [18, 15], [25, 18], [14, 25], [22, 25]]) p.part(RR(x - 3, y - 3, 6, 5, 2), '#c8d4e8', { hi: '#ffffff', ol: '#5a6880' });
    p.fill(R(4, 29, 28, 2), '#5a6070');
    p.px(9, 14, '#ffffff'); p.px(10, 13, '#ffffff');
  },
  suishoryu(p) {
    p.part(P(4, 30, 10, 22, 14, 30), '#8a6ad0');
    p.part(P(24, 10, 36, 4, 32, 18), '#b0e8ff', { hi: '#ffffff' });
    p.part(R(12, 30, 5, 7), '#6a4aa8'); p.part(R(24, 30, 5, 7), '#6a4aa8');
    p.part(E(20, 27, 11, 8), '#8a6ad0', { hi: '#c0a8ff' });
    p.fill(E(20, 30, 6, 4), '#d8c8ff');
    for (const [x, y, h] of [[10, 20, 7], [15, 18, 9], [20, 18, 8]] as [number, number, number][]) p.part(P(x - 2, y + 2, x, y - h, x + 2, y + 2), '#90e0ff', { hi: '#ffffff', lo: '#4090c0' });
    p.part(E(27, 14, 7, 6), '#9a7ae0', { hi: '#d0b8ff' });
    p.part(P(27, 9, 30, 0, 32, 9), '#b0e8ff', { hi: '#ffffff' });
    p.part(E(32, 17, 4, 3), '#a88aec');
    p.eye(28, 13, 2, '#103050');
    p.px(34, 17, '#2a1a4a'); p.hline(30, 35, 19, '#2a1a4a');
    sparkle(p, 5, 12, '#e0ffff'); sparkle(p, 36, 30, '#e0ffff');
  },
  // ---------------- とり
  yorufukuro(p) {
    p.part(P(10, 8, 13, 2, 16, 9), '#2a3060'); p.part(P(30, 8, 27, 2, 24, 9), '#2a3060');
    p.part(E(8, 24, 5, 10), '#3a4290', { hi: '#5a62b0' }); p.part(E(32, 24, 5, 10), '#3a4290', { hi: '#5a62b0' });
    for (const [x, y] of [[7, 21], [9, 27], [33, 21], [31, 27]]) sparkle(p, x, y, '#ffe890');
    p.part(E(20, 22, 11, 13), '#3a4a98', { hi: '#5a6ac0' });
    p.fill(E(20, 28, 7, 7), '#d8d8f0');
    for (const [x, y] of [[17, 26], [22, 28], [19, 31]]) { p.px(x, y, '#8a8ac0'); p.px(x + 1, y + 1, '#8a8ac0'); }
    p.part(E(15, 17, 4.5), '#fff0c0'); p.part(E(25, 17, 4.5), '#fff0c0');
    p.eye(15, 17, 2.6, '#f0a020'); p.eye(25, 17, 2.6, '#f0a020');
    p.px(15, 17, '#101010'); p.px(25, 17, '#101010');
    p.part(P(18, 21, 22, 21, 20, 25), '#f0b030');
    p.part(R(15, 34, 3, 3), '#f0b030'); p.part(R(22, 34, 3, 3), '#f0b030');
  },
  kazetsubame(p) {
    p.part(P(2, 14, 14, 18, 18, 24, 6, 24), '#2a3a8a', { hi: '#4a6ad0' });
    p.part(P(38, 10, 26, 18, 22, 24, 34, 22), '#2a3a8a', { hi: '#4a6ad0' });
    p.part(P(14, 30, 10, 39, 18, 33, 22, 33, 30, 39, 26, 30), '#2a3a8a');
    p.part(E(20, 24, 7, 9), '#3a4aa8', { hi: '#6a8ae0' });
    p.fill(E(20, 28, 4, 5), '#f0f0ff');
    p.part(E(20, 14, 6, 5.5), '#3a4aa8', { hi: '#6a8ae0' });
    p.fill(R(16, 16, 8, 2), '#e04040');
    p.eye(18, 13, 1.6, '#101018'); p.eye(23, 13, 1.6, '#101018');
    p.part(P(19, 16, 21, 16, 20, 19), '#f0c040');
    for (const [x, y] of [[4, 6], [8, 4], [33, 4], [36, 8]]) { p.px(x, y, '#c8e8ff'); p.px(x + 1, y, '#c8e8ff'); p.px(x + 2, y + 1, '#c8e8ff'); }
  },
  nijikujaku(p) {
    const cols = ['#ff6a6a', '#ffb050', '#ffe860', '#80e070', '#60b8ff', '#a080ff'];
    cols.forEach((c, i) => {
      const r = 19 - i * 2.2;
      p.part(Sub(E(20, 22, r, r * 0.85), R(0, 22, 40, 20)), c, { flat: true, noOl: i > 0 });
    });
    for (const [x, y] of [[8, 12], [14, 7], [20, 5], [26, 7], [32, 12]]) { p.part(E(x, y, 2), '#3080e0', { flat: true, ol: '#205020' }); p.px(x, y, '#80ffe0'); }
    p.part(E(20, 28, 6, 8), '#3a8ad8', { hi: '#7ac0ff' });
    p.part(E(20, 17, 4.5, 4.5), '#3a8ad8', { hi: '#7ac0ff' });
    p.part(P(18, 13, 20, 7, 22, 13), '#ffd040');
    p.eye(18, 17, 1.4, '#101018'); p.eye(22, 17, 1.4, '#101018');
    p.part(P(19, 20, 21, 20, 20, 22), '#f0a030');
    p.part(R(17, 35, 2, 3), '#c08030'); p.part(R(21, 35, 2, 3), '#c08030');
  },
  // ---------------- しょくぶつ
  mossglow(p) {
    p.part(P(10, 37, 13, 31, 16, 37), '#6a4a2a'); p.part(P(24, 37, 27, 31, 30, 37), '#6a4a2a'); p.part(P(17, 37, 20, 32, 23, 37), '#6a4a2a');
    p.part(RR(10, 16, 20, 18, 5), '#8a6038', { hi: '#b88a58' });
    p.fill(E(20, 17, 9, 2.5), '#d8b880');
    p.fill(E(20, 17, 6, 1.5), '#b89060');
    // こけ
    p.part(E(12, 28, 3.5, 3), '#6ab040', { flat: true }); p.part(E(28, 24, 3, 2.5), '#6ab040', { flat: true });
    // はっぱの かんむり
    p.part(E(13, 11, 5, 3.5), '#58b048', { hi: '#a0e070' }); p.part(E(27, 11, 5, 3.5), '#58b048', { hi: '#a0e070' });
    p.part(E(20, 8, 4, 5), '#68c058', { hi: '#b0f080' });
    p.px(20, 4, '#f0f080');
    p.eye(16, 23, 2, '#2a1a10'); p.eye(24, 23, 2, '#2a1a10');
    blush(p, 12, 26); blush(p, 27, 26);
    smile(p, 20, 28, 2, '#2a1a10');
  },
  madoidake(p) {
    p.part(RR(13, 20, 14, 16, 4), '#f0e0c8', { hi: '#ffffff' });
    p.part(Sub(E(20, 15, 16, 10), R(0, 21, 40, 20)), '#a03ac0', { hi: '#d070f0', lo: '#702090' });
    for (const [x, y, r] of [[11, 10, 2.5], [21, 7, 3], [29, 12, 2.2], [16, 15, 1.8]] as [number, number, number][]) p.part(E(x, y, r), '#f8e0ff', { flat: true, ol: '#802aa0' });
    p.part(E(20, 20, 15, 3), '#8a2aa8', { flat: true });
    // あやしい め
    p.hline(15, 18, 26, '#3a1030'); p.px(18, 25, '#3a1030'); p.px(16, 27, '#3a1030');
    p.hline(22, 25, 26, '#3a1030'); p.px(22, 25, '#3a1030'); p.px(24, 27, '#3a1030');
    p.hline(17, 23, 31, '#3a1030'); p.px(16, 30, '#3a1030'); p.px(24, 30, '#3a1030');
    for (const [x, y] of [[5, 30], [8, 34], [33, 31], [36, 27], [3, 24]]) { p.px(x, y, '#e8b0ff'); p.px(x + 1, y + 1, '#c890e0'); }
  },
  morinushi(p) {
    p.part(P(6, 38, 11, 30, 14, 38), '#5a3a1a'); p.part(P(26, 38, 29, 30, 34, 38), '#5a3a1a');
    p.part(RR(9, 18, 22, 20, 4), '#7a5028', { hi: '#a87848' });
    for (const y of [22, 27, 33]) p.hline(11, 13, y, '#5a3a1a');
    p.part(E(20, 11, 17, 10), '#3a8a3a', { hi: '#70c060', lo: '#2a6a2a' });
    p.part(E(9, 15, 7, 5), '#4a9a40', { hi: '#80d070' }); p.part(E(31, 15, 7, 5), '#4a9a40', { hi: '#80d070' });
    // とりの す
    p.part(E(28, 6, 4, 2), '#a07838', { flat: true }); p.part(E(28, 4, 1.8), '#ffe060'); p.px(29, 4, '#202020');
    p.eye(16, 26, 2.2, '#201008'); p.eye(24, 26, 2.2, '#201008');
    p.hline(14, 18, 23, '#3a2410'); p.hline(22, 26, 23, '#3a2410');
    p.hline(17, 23, 32, '#3a2410');
    p.part(E(12, 33, 2.5, 2), '#6ab040', { flat: true });
  },
  // ---------------- ？？？
  luxdrago(p) {
    p.part(P(2, 8, 14, 18, 16, 28, 6, 26), '#fff4c0', { hi: '#ffffff', lo: '#e0c060' });
    p.part(P(38, 8, 26, 18, 24, 28, 34, 26), '#fff4c0', { hi: '#ffffff', lo: '#e0c060' });
    for (const x of [6, 10, 30, 34]) p.line(x, 12 + (x % 4), x + (x < 20 ? 4 : -4), 24, '#f0d070');
    p.part(P(10, 34, 4, 38, 14, 30), '#f0c850');
    p.part(R(13, 31, 5, 7), '#d8a830'); p.part(R(23, 31, 5, 7), '#d8a830');
    p.part(E(20, 27, 9, 8), '#f8d860', { hi: '#fff8c0' });
    p.fill(E(20, 30, 5, 4), '#fff0b0');
    p.part(E(20, 14, 7, 6), '#f8d860', { hi: '#fff8c0' });
    p.part(P(14, 10, 12, 2, 17, 9), '#90e8ff', { hi: '#ffffff' }); p.part(P(26, 10, 28, 2, 23, 9), '#90e8ff', { hi: '#ffffff' });
    p.part(P(18, 9, 20, 3, 22, 9), '#ff90c0', { hi: '#ffffff' });
    p.eye(17, 14, 1.8, '#2050a0'); p.eye(23, 14, 1.8, '#2050a0');
    p.hline(17, 23, 18, '#a07020');
    sparkle(p, 4, 32); sparkle(p, 36, 33); sparkle(p, 20, 1, '#ffffff');
  },
};

const cache = new Map<string, HTMLCanvasElement>();

/** モンスターの絵（distorted=ゆがみ：紫のもやをまとう） */
export function monsterSprite(id: string, opts: { distorted?: boolean } = {}): HTMLCanvasElement {
  const key = `${id}:${opts.distorted ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = new Pix(MON_SIZE, MON_SIZE);
  (SPRITES[id] ?? SPRITES.lumipon)(p);
  p.outline('#1a1420');
  let c = p.canvas();
  if (opts.distorted) {
    const [c2, g] = mkCanvas(MON_SIZE, MON_SIZE);
    const aura = tint(c, '#2a0838');
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-2, -1], [2, 1]]) { g.globalAlpha = 0.5; g.drawImage(aura, dx, dy); }
    g.globalAlpha = 1;
    g.drawImage(tint(c, '#6a2a90', 0.35), 0, 0);
    c = c2;
  }
  cache.set(key, c);
  return c;
}

export const hasSprite = (id: string) => id in SPRITES;
export const SPRITE_IDS = Object.keys(SPRITES);
