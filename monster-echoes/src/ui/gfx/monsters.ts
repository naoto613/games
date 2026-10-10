// モンスターのドット絵（48×48 の設計を 2 倍で描く）。すべてオリジナルのデザイン。
// 方針: 太い輪郭線・3色のアニメ塗り・大きな顔と表情（眉・口・舌・牙）で、ひと目で性格が分かるように。
import { E, P, Pix, R, Sub, U, mix, mkCanvas, tint, type PartOpts, type Shape } from './Pix';

export const MON_SIZE = 48;
export const MON_SCALE = 2;
type Draw = (p: Pix) => void;

const OL = '#1c1424';
const MOUTH = '#5a1426';
const TONGUE = '#ff6f84';
// ---------------------------------------------------------------- 描画の小道具
const part = (p: Pix, sh: Shape, col: string, o: PartOpts = {}) => p.part(sh, col, { ol: OL, ...o });
const flat = (p: Pix, sh: Shape, col: string) => p.part(sh, col, { flat: true, noOl: true });
const line = (p: Pix, x0: number, y0: number, x1: number, y1: number, c = OL, t = 1.2) => p.line(x0, y0, x1, y1, c, t);
const arc = (p: Pix, pts: number[], c = OL, t = 1.2) => { for (let i = 0; i + 3 < pts.length; i += 2) line(p, pts[i], pts[i + 1], pts[i + 2], pts[i + 3], c, t); };

/** 大きな目（白目・黒目・2つの光） lx,ly は 視線 */
function eye(p: Pix, x: number, y: number, rx: number, ry: number, iris = '#1e1a3a', lx = 0, ly = 0) {
  part(p, E(x, y, rx, ry), '#ffffff', { flat: true });
  flat(p, E(x + lx, y + ly + ry * 0.08, rx * 0.62, ry * 0.68), iris);
  flat(p, E(x + lx, y + ly + ry * 0.3, rx * 0.4, ry * 0.32), mix(iris, '#7ab8ff', 0.45));
  flat(p, E(x + lx - rx * 0.22, y + ly - ry * 0.25, Math.max(0.6, rx * 0.26), Math.max(0.6, ry * 0.24)), '#ffffff');
  flat(p, E(x + lx + rx * 0.25, y + ly + ry * 0.32, Math.max(0.4, rx * 0.12), Math.max(0.4, ry * 0.11)), '#ffffff');
}
/** まぶたの かかった目（ねむい・すまし顔） */
function lidEye(p: Pix, x: number, y: number, rx: number, ry: number, lid: string, iris = '#1e1a3a', lx = 0, cut = 0.05) {
  eye(p, x, y, rx, ry, iris, lx, ry * 0.25);
  part(p, Sub(E(x, y, rx + 0.4, ry + 0.4), R(x - rx - 2, y + ry * cut, rx * 2 + 4, ry * 2 + 4)), lid, { cel: true });
  line(p, x - rx - 0.3, y + ry * cut, x + rx + 0.3, y + ry * cut, OL, 1.4);
}
/** にっこり目（＾ ＾） */
const happyEye = (p: Pix, x: number, y: number, w: number) => arc(p, [x - w, y + w * 0.5, x - w * 0.5, y - w * 0.2, x, y - w * 0.45, x + w * 0.5, y - w * 0.2, x + w, y + w * 0.5], OL, 1.5);
const brow = (p: Pix, x0: number, y0: number, x1: number, y1: number, c = OL) => line(p, x0, y0, x1, y1, c, 1.6);
/** 大きく ひらいた口（D字・舌・歯） */
function grin(p: Pix, x: number, y: number, w: number, h: number, o: { teeth?: boolean; tongue?: boolean; fangs?: boolean; tilt?: number } = {}) {
  const t = o.tilt ?? 0;
  const mouth = P(x - w, y - t, x + w, y + t, x + w * 0.75, y + h * 0.75, x + w * 0.3, y + h, x - w * 0.3, y + h, x - w * 0.75, y + h * 0.75);
  part(p, mouth, MOUTH, { flat: true });
  if (o.tongue !== false) flat(p, E(x + w * 0.15, y + h * 0.78, w * 0.55, h * 0.38), TONGUE);
  if (o.teeth) flat(p, P(x - w * 0.8, y - t * 0.8 + 0.3, x + w * 0.8, y + t * 0.8 + 0.3, x + w * 0.7, y + h * 0.3, x - w * 0.7, y + h * 0.3), '#ffffff');
  if (o.fangs) for (const s of [-1, 1]) part(p, P(x + s * w * 0.55 - 0.9, y + s * t * 0.5, x + s * w * 0.55 + 0.9, y + s * t * 0.5, x + s * w * 0.55, y + h * 0.55), '#ffffff', { flat: true, ol: '#5a4a5a' });
}
/** にやり（片側が上がった口） */
const smirk = (p: Pix, x: number, y: number, w: number, s = 1) => arc(p, [x - w * s, y - 0.4, x - w * 0.3 * s, y + 0.8, x + w * 0.4 * s, y + 0.6, x + w * s, y - 1.3], OL, 1.4);
const fang = (p: Pix, x: number, y: number, h = 1.8) => part(p, P(x - 0.9, y, x + 0.9, y, x, y + h), '#ffffff', { flat: true, ol: '#5a4a5a' });
const cheek = (p: Pix, x: number, y: number, c = '#ff8fb0') => flat(p, E(x, y, 2.4, 1.3), c);
const shine = (p: Pix, x: number, y: number, rx: number, ry = rx * 0.6) => { flat(p, E(x, y, rx, ry), '#ffffff'); flat(p, E(x + rx * 1.5, y + ry * 1.2, rx * 0.35, ry * 0.4), '#ffffff'); };
const star = (p: Pix, x: number, y: number, s = 2, c = '#fff3a0') =>
  part(p, P(x, y - s * 1.6, x + s * 0.4, y - s * 0.4, x + s * 1.6, y, x + s * 0.4, y + s * 0.4, x, y + s * 1.6, x - s * 0.4, y + s * 0.4, x - s * 1.6, y, x - s * 0.4, y - s * 0.4), c, { flat: true, ol: mix(c, '#5a3a00', 0.6) });
/** 3層の炎 */
function flame(p: Pix, pts: number[]) {
  const xs = pts.filter((_, i) => i % 2 === 0), ys = pts.filter((_, i) => i % 2 === 1);
  const cx = xs.reduce((a, b) => a + b, 0) / xs.length, cy = Math.max(...ys);
  const k = (f: number) => pts.map((v, i) => (i % 2 === 0 ? cx + (v - cx) * f : cy + (v - cy) * f));
  part(p, P(...pts), '#ff5a1e', { ol: '#6a1004', cel: true, hi: '#ff8a3a' });
  flat(p, P(...k(0.68)), '#ffa42a');
  flat(p, P(...k(0.38)), '#fff2a0');
}

const SPRITES: Record<string, Draw> = {
  // ================================================================ せいれい
  lumipon(p) {
    // ランタンの しっぽ（くるん）
    arc(p, [23, 19, 22, 15, 23.5, 11, 27, 9.5, 29.5, 10.5], '#e0a830', 1.6);
    for (let a = 0; a < 8; a++) { const t = (a / 8) * Math.PI * 2; line(p, 31 + Math.cos(t) * 6, 8 + Math.sin(t) * 6, 31 + Math.cos(t) * 7.8, 8 + Math.sin(t) * 7.8, '#fff0a0', 1); }
    part(p, E(31, 8, 4.4), '#ffd23a', { hi: '#fff8c8' });
    shine(p, 29.6, 6.6, 1.2);
    part(p, E(8, 29, 3, 3.6), '#4fb4f2');
    part(p, E(40, 33, 3.2, 2.8), '#4fb4f2');
    part(p, U(E(24, 31, 15.5, 13), E(24, 38.5, 16.5, 6.5)), '#5cc0f8', { hi: '#a8e6ff' });
    flat(p, E(24, 44, 14, 1.3), '#3a8ad0');
    shine(p, 14, 24, 3.4, 2.2);
    eye(p, 18.5, 30, 3.6, 4.6, '#1a2a6a', 0.4, -0.3);
    eye(p, 29.5, 30, 3.6, 4.6, '#1a2a6a', 0.4, -0.3);
    cheek(p, 12.5, 36); cheek(p, 35.5, 36);
    grin(p, 24, 36, 5.2, 4.6, { tilt: 0 });
  },
  tsukipon(p) {
    for (const s of [-1, 1]) {
      const x = 24 + s * 9;
      part(p, Sub(E(x, 13, 6, 6.5), E(x + s * 2.6, 11, 5.3, 5.6)), '#ffd23a', { hi: '#fff6c0', ol: '#6a4a08' });
    }
    star(p, 41, 22, 1.4); star(p, 7, 19, 1.1, '#e8e2ff');
    part(p, E(8, 34, 3.2, 2.8), '#7a64dc');
    part(p, E(40, 34, 3.2, 2.8), '#7a64dc');
    part(p, U(E(24, 31, 16, 13.5), E(24, 38.5, 17, 6.5)), '#8a74ea', { hi: '#c2b4ff' });
    flat(p, E(24, 44, 14, 1.3), '#5a48b8');
    for (const [x, y] of [[13, 37], [35, 38], [31, 24]]) star(p, x, y, 0.8, '#fff8d0');
    shine(p, 14, 24, 3, 2);
    lidEye(p, 18.5, 30, 3.6, 3.8, '#8a74ea', '#2a1a5a', 1.2, -0.1);
    lidEye(p, 29.5, 30, 3.6, 3.8, '#8a74ea', '#2a1a5a', 1.2, -0.1);
    cheek(p, 12.5, 35.5, '#ff9ad8'); cheek(p, 35.5, 35.5, '#ff9ad8');
    smirk(p, 24, 37, 3.6);
    fang(p, 25.6, 37.4, 1.6);
  },
  auroran(p) {
    const bands: [string, number][] = [['#68f0c0', 0], ['#6cc8ff', 2], ['#c8a0ff', 4], ['#ff98d0', 6]];
    for (const [c, k] of bands) {
      part(p, P(20, 22 + k * 0.5, 2 + k, 12 + k * 1.6, 4 + k * 0.4, 26 + k, 15, 30), c, { cel: true, ol: mix(c, '#203060', 0.65) });
      part(p, P(28, 22 + k * 0.5, 46 - k, 12 + k * 1.6, 44 - k * 0.4, 26 + k, 33, 30), c, { cel: true, ol: mix(c, '#203060', 0.65) });
    }
    part(p, P(16, 32, 32, 32, 34, 40, 30, 46, 22, 42, 26, 40), '#e8fbff', { hi: '#ffffff', lo: '#a8d8f0' });
    part(p, E(24, 25, 11, 11), '#eefcff', { hi: '#ffffff', lo: '#b0dcf4' });
    part(p, Sub(E(24, 9, 8, 2.6), E(24, 9, 6, 1.4)), '#ffd84a', { flat: true, ol: '#8a5a00' });
    for (const [x, h] of [[19, 5], [24, 7], [29, 5]] as [number, number][]) part(p, P(x - 1.8, 16, x, 16 - h, x + 1.8, 16), '#8ae8ff', { hi: '#ffffff', ol: '#2a6a90' });
    happyEye(p, 20, 25, 2.4); happyEye(p, 28, 25, 2.4);
    cheek(p, 16.5, 29, '#ffb0d8'); cheek(p, 31.5, 29, '#ffb0d8');
    grin(p, 24, 29.5, 2.6, 2.4);
    star(p, 7, 36, 1.3); star(p, 42, 38, 1.1, '#c8fff0');
  },
  // ================================================================ けもの
  kogemaru(p) {
    flame(p, [38, 30, 41, 22, 44, 14, 47, 22, 46, 30, 42, 36]);
    part(p, P(36, 38, 40, 31, 43, 33, 39, 40), '#a8642c');
    part(p, E(17, 45, 4.4, 2.2), '#8a4c22'); part(p, E(31, 45, 4.4, 2.2), '#8a4c22');
    part(p, E(24, 39, 11, 7.5), '#c8823c', { hi: '#f0b06a' });
    flat(p, E(24, 41.5, 6, 4.5), '#f8e2b8');
    part(p, P(14, 33, 34, 33, 33, 36.5, 24, 38.5, 15, 36.5), '#e8443a', { cel: true });
    flat(p, E(24, 37.6, 1.6, 1.4), '#ffd84a');
    // みみ（左は ぴん、右は ぺたん。先っぽが こげている）
    part(p, P(8, 4, 17, 11, 12, 20), '#8a4c22', { cel: true });
    flat(p, P(8, 4, 11, 6.5, 9.5, 8.5), '#2a1a12');
    part(p, P(36, 12, 46, 16, 38, 22), '#8a4c22', { cel: true });
    flat(p, P(46, 16, 43, 15, 43.5, 18), '#2a1a12');
    part(p, E(24, 21, 14, 12), '#d08a42', { hi: '#f4b872' });
    flat(p, E(24, 27.5, 7.5, 5.2), '#f8e2b8');
    part(p, E(24, 23.5, 2.6, 1.8), '#2a1a12', { flat: true });
    shine(p, 23, 23, 0.6);
    eye(p, 17.5, 18.5, 3.2, 3.8, '#2a1608', 0.5);
    eye(p, 30.5, 18.5, 3.2, 3.8, '#2a1608', 0.5);
    brow(p, 14.5, 13.4, 19.5, 13.8); brow(p, 28.5, 13.8, 33.5, 13.4);
    grin(p, 24.5, 26.5, 4.8, 4.6, { tilt: -0.6 });
    flat(p, E(27.5, 31.5, 2.2, 2.6), TONGUE);
    cheek(p, 12.5, 24, '#ff9a80'); cheek(p, 35.5, 24, '#ff9a80');
  },
  homurawolf(p) {
    flame(p, [36, 36, 42, 30, 46, 22, 47, 32, 44, 40]);
    // ほのおの たてがみ
    flame(p, [6, 34, 4, 22, 9, 25, 9, 12, 15, 18, 18, 6, 23, 14, 28, 5, 31, 15, 37, 7, 38, 19, 43, 14, 41, 26, 44, 33, 30, 36, 18, 36]);
    part(p, P(13, 34, 17, 34, 17, 45, 12, 45), '#5c6a88'); part(p, P(31, 34, 35, 34, 36, 45, 31, 45), '#5c6a88');
    part(p, E(14.5, 45.5, 3.2, 1.6), '#3a4660'); part(p, E(33.5, 45.5, 3.2, 1.6), '#3a4660');
    part(p, E(24, 36, 11, 6.5), '#7c8cac', { hi: '#b0bedc' });
    flat(p, P(19, 31, 29, 31, 26, 40, 24, 42, 22, 40), '#eef2ff');
    part(p, P(13, 15, 16, 4, 21, 13), '#5c6a88', { cel: true }); part(p, P(35, 15, 32, 4, 27, 13), '#5c6a88', { cel: true });
    flat(p, P(15, 13, 16.2, 7.5, 19, 13), '#e88a9a'); flat(p, P(33, 13, 31.8, 7.5, 29, 13), '#e88a9a');
    part(p, E(24, 21, 10.5, 9.5), '#8a9abc', { hi: '#c4d0ec' });
    part(p, P(18, 22, 30, 22, 29, 30, 24, 32, 19, 30), '#eef2ff', { cel: true, lo: '#b8c4dc' });
    part(p, E(24, 23, 2.4, 1.6), '#1a1a28', { flat: true });
    for (const s of [-1, 1]) {
      const x = 24 + s * 5.6;
      part(p, P(x - 3 * s, 18.5, x + 3 * s, 17.5, x + 2 * s, 20.6, x - 2.4 * s, 20.6), '#ffd23a', { flat: true });
      flat(p, E(x + 0.6 * s, 19.2, 0.8, 1.3), '#1a0a04');
      brow(p, x - 3.6 * s, 15.6, x + 3.2 * s, 17.2);
    }
    smirk(p, 24, 28.3, 4.2);
    fang(p, 26.4, 28.6, 2);
  },
  mitsugashira(p) {
    part(p, P(9, 36, 15, 36, 15, 45, 9, 45), '#3c2c4a'); part(p, P(33, 36, 39, 36, 39, 45, 33, 45), '#3c2c4a');
    part(p, E(12, 45.5, 4, 1.8), '#24182e'); part(p, E(36, 45.5, 4, 1.8), '#24182e');
    part(p, E(24, 37, 16, 8.5), '#5e4a74', { hi: '#8c76a6' });
    flat(p, E(24, 40, 7, 4.5), '#9c88b8');
    part(p, R(8, 31, 32, 3.4), '#c02a3a', { cel: true });
    for (let x = 10; x <= 38; x += 4) part(p, P(x - 1.2, 31, x, 27.6, x + 1.2, 31), '#e8e8f0', { flat: true });
    const head = (cx: number, cy: number, s: number, mood: 'angry' | 'laugh' | 'sleepy') => {
      part(p, P(cx - 7 * s, cy - 2, cx - 6 * s, cy - 12 * s, cx - 1.5, cy - 6), '#3c2c4a', { cel: true });
      part(p, P(cx + 7 * s, cy - 2, cx + 6 * s, cy - 12 * s, cx + 1.5, cy - 6), '#3c2c4a', { cel: true });
      part(p, E(cx, cy, 7.4 * s, 6.8 * s), '#6e5888', { hi: '#a088c0' });
      flat(p, E(cx, cy + 3.8 * s, 4.6 * s, 3 * s), '#b4a2cc');
      part(p, E(cx, cy + 1.8 * s, 1.7 * s, 1.2 * s), '#140a14', { flat: true });
      if (mood === 'angry') {
        for (const d of [-1, 1]) { part(p, P(cx + d * 1.4 * s, cy - 2 * s, cx + d * 5 * s, cy - 2.8 * s, cx + d * 4 * s, cy), '#ff3a3a', { flat: true }); brow(p, cx + d * 1 * s, cy - 2.6 * s, cx + d * 5.2 * s, cy - 4.6 * s); }
        grin(p, cx, cy + 4.2 * s, 3.4 * s, 2.4 * s, { teeth: true, tongue: false, fangs: true });
      } else if (mood === 'laugh') {
        for (const d of [-1, 1]) happyEye(p, cx + d * 3 * s, cy - 1.4 * s, 1.7 * s);
        grin(p, cx, cy + 3.6 * s, 4 * s, 3.8 * s, { fangs: true });
      } else {
        for (const d of [-1, 1]) line(p, cx + d * 1.4 * s, cy - 1 * s, cx + d * 4.6 * s, cy - 1 * s, OL, 1.4);
        smirk(p, cx, cy + 4.6 * s, 2 * s, -1);
        flat(p, E(cx + 5 * s, cy - 6 * s, 1.1, 1.1), '#c8e8ff');
      }
    };
    head(9.5, 22, 0.8, 'angry');
    head(38.5, 22, 0.8, 'sleepy');
    head(24, 15.5, 1, 'laugh');
  },
  // ================================================================ こうせき
  iwatokage(p) {
    part(p, P(2, 42, 5, 36, 10, 37, 12, 41, 6, 43), '#5ca84a', { cel: true });
    part(p, P(12, 38, 17, 38, 17, 45, 12, 45), '#4a8a3a'); part(p, P(28, 38, 33, 38, 33, 45, 28, 45), '#4a8a3a');
    part(p, E(14.5, 45.5, 3.4, 1.6), '#2e5a26'); part(p, E(30.5, 45.5, 3.4, 1.6), '#2e5a26');
    part(p, E(22, 35, 14, 8.5), '#6cbc58', { hi: '#a8e48c' });
    flat(p, E(23, 39.5, 9, 3.6), '#f0e08a');
    for (const [x, h, w] of [[11, 9, 3], [17, 14, 3.6], [23, 11, 3.2], [28.5, 7, 2.6]] as [number, number, number][]) {
      part(p, P(x - w, 29.5, x - w * 0.2, 29.5 - h, x + w, 29.5), '#3aa8f4', { hi: '#c4f0ff', lo: '#2468c0', ol: '#122a5a', cel: true });
      line(p, x - w * 0.15, 28.5, x - w * 0.25, 31 - h, '#e8faff', 1);
    }
    part(p, E(37.5, 30, 9, 7.5), '#78c864', { hi: '#b4ec98' });
    flat(p, E(41, 34.5, 5, 2.6), '#f0e08a');
    eye(p, 36.5, 26, 3, 3.6, '#1a2a10', 0.8, 0.2);
    grin(p, 41, 32.6, 4.6, 3, { tilt: -1 });
    flat(p, E(44.6, 28.6, 0.6, 0.5), '#2a4a20');
  },
  haganegame(p) {
    part(p, P(9, 36, 16, 36, 16, 45, 9, 45), '#6a7488'); part(p, P(30, 36, 37, 36, 37, 45, 30, 45), '#6a7488');
    part(p, E(12.5, 45.5, 4, 1.8), '#3a4256'); part(p, E(33.5, 45.5, 4, 1.8), '#3a4256');
    part(p, Sub(E(21, 27, 18.5, 15), R(0, 36, 48, 20)), '#a6b4cc', { hi: '#eef4ff', lo: '#6a7a96' });
    for (const [x, y] of [[12, 22], [21, 18.5], [30, 22], [16.5, 30], [25.5, 30]]) part(p, P(x - 4, y, x - 2, y - 3.4, x + 2, y - 3.4, x + 4, y, x + 2, y + 3.4, x - 2, y + 3.4), '#c4d0e6', { hi: '#ffffff', lo: '#8a98b4', ol: '#3a4660', cel: true });
    part(p, P(19, 12, 21, 4, 23, 12), '#ffd23a', { ol: '#6a4a08', cel: true });
    part(p, R(2.5, 35, 37, 3.2), '#5a6478', { cel: true });
    for (let x = 5; x < 38; x += 4) flat(p, E(x, 36.6, 0.8, 0.8), '#d4dcea');
    shine(p, 9, 18, 2.4, 1.3);
    // あたま（がんこな まゆ と へのじ口）
    part(p, E(39.5, 31, 7.6, 7.2), '#9aa6b8', { hi: '#d4dcea' });
    eye(p, 40.5, 30, 2.8, 3.2, '#101828', -0.4, 0.4);
    part(p, P(36.5, 25.8, 45, 26.6, 45, 28.2, 36.8, 27.6), '#f0f2f8', { flat: true });
    arc(p, [37.5, 35.4, 40.5, 34.2, 43.5, 35.4], OL, 1.4);
  },
  suishoryu(p) {
    part(p, P(33, 40, 42, 38, 47, 30, 44, 41, 36, 44), '#7a5ad8', { cel: true });
    part(p, P(44.5, 30, 47.5, 25, 46.5, 32), '#9ae8ff', { ol: '#204a7a', cel: true });
    for (const s of [-1, 1]) part(p, P(24 + s * 8, 27, 24 + s * 20, 16, 24 + s * 18, 24, 24 + s * 21, 28, 24 + s * 12, 33), '#a8e6ff', { hi: '#ffffff', ol: '#2a5a8a', cel: true });
    part(p, P(16, 37, 21, 37, 21, 45, 16, 45), '#5e40b8'); part(p, P(27, 37, 32, 37, 32, 45, 27, 45), '#5e40b8');
    part(p, E(18, 45.5, 3.6, 1.8), '#3a2680'); part(p, E(30, 45.5, 3.6, 1.8), '#3a2680');
    part(p, E(24, 35, 10, 9), '#8a6ae8', { hi: '#c4b0ff' });
    part(p, E(24, 37, 6, 6), '#e6dcff', { cel: true });
    for (let y = 33; y <= 41; y += 2.4) line(p, 19.5, y, 28.5, y, '#b0a0e8', 1);
    part(p, E(24, 19, 11, 9.5), '#9478f0', { hi: '#d0c0ff' });
    for (const s of [-1, 1]) part(p, P(24 + s * 5, 12, 24 + s * 9, 0, 24 + s * 10, 11), '#a8f0ff', { hi: '#ffffff', ol: '#2a5a8a', cel: true });
    part(p, E(24, 24, 6.4, 3.8), '#b4a0ff', { cel: true });
    eye(p, 19.5, 18.5, 2.8, 3.4, '#14306a', 0.4);
    eye(p, 28.5, 18.5, 2.8, 3.4, '#14306a', 0.4);
    brow(p, 16.5, 14.8, 21.5, 15.6); brow(p, 26.5, 15.6, 31.5, 14.8);
    grin(p, 24, 24.4, 4.2, 3, { teeth: true, tongue: false, fangs: true });
    star(p, 5, 10, 1.3, '#e0ffff'); star(p, 43, 6, 1.1, '#e0ffff');
  },
  // ================================================================ とり
  yorufukuro(p) {
    part(p, P(11, 13, 13, 2, 19, 11), '#2a3070', { cel: true }); part(p, P(37, 13, 35, 2, 29, 11), '#2a3070', { cel: true });
    part(p, E(9, 29, 5.6, 11), '#2e3a8e', { hi: '#5866c0' }); part(p, E(39, 29, 5.6, 11), '#2e3a8e', { hi: '#5866c0' });
    for (const [x, y] of [[7.5, 25], [10, 31], [7.6, 36], [40.5, 25], [38, 31], [40.4, 36]]) star(p, x, y, 0.9, '#ffe680');
    part(p, E(24, 28, 13.5, 16), '#3a4aa8', { hi: '#6a7ad6' });
    flat(p, E(24, 35, 9, 8.5), '#e4e4f8');
    for (let y = 31; y < 42; y += 3) for (let x = 18.5 + ((y / 3) % 2) * 1.5; x < 30; x += 3) arc(p, [x - 1, y, x, y + 1, x + 1, y], '#9a9ad0', 1);
    for (const s of [-1, 1]) {
      part(p, E(24 + s * 6, 21, 6.4, 6.4), '#f6ecc6', { flat: true });
      part(p, E(24 + s * 6, 21, 4.4, 4.6), '#ffb21a', { flat: true, ol: '#8a5a00' });
      flat(p, E(24 + s * 6 + 0.6, 21.4, 2.4, 2.8), '#120c06');
      shine(p, 24 + s * 6 - 1.6, 19.4, 1);
    }
    brow(p, 15, 13.8, 21, 15.6); brow(p, 33, 13.8, 27, 15.6);
    part(p, P(21.8, 25, 26.2, 25, 24, 30), '#ffb21a', { ol: '#6a4008', cel: true });
    part(p, R(18, 42.5, 4, 2.6), '#ffb21a', { ol: '#6a4008' }); part(p, R(26, 42.5, 4, 2.6), '#ffb21a', { ol: '#6a4008' });
  },
  kazetsubame(p) {
    for (const [x, y] of [[2, 10], [8, 6], [37, 4], [43, 9]]) arc(p, [x, y, x + 3, y - 0.6, x + 5, y + 1], '#d0ecff', 1);
    // なびく マフラー
    part(p, P(18, 23, 6, 21, 1, 26, 8, 25, 2, 31, 12, 27, 18, 27), '#ff4a4a', { cel: true });
    for (const s of [-1, 1]) part(p, P(24 + s * 4, 27, 24 + s * 23, 12, 24 + s * 21, 18, 24 + s * 24, 21, 24 + s * 19, 24, 24 + s * 22, 28, 24 + s * 14, 30, 24 + s * 5, 34), '#2a3a9a', { hi: '#5070d8', cel: true });
    part(p, P(19, 38, 14, 47, 21, 42, 24, 41, 27, 42, 34, 47, 29, 38), '#2a3a9a', { cel: true });
    part(p, E(24, 32, 7.6, 9), '#3a4cb8', { hi: '#7090ec' });
    flat(p, E(24, 35.5, 4.8, 5.6), '#f6f6ff');
    part(p, E(24, 20, 8, 7.2), '#3a4cb8', { hi: '#7090ec' });
    part(p, R(16.5, 23, 15, 2.6), '#ff4a4a', { cel: true });
    eye(p, 21, 18.6, 2.4, 2.8, '#0e1430', 0.6);
    eye(p, 27.5, 18.6, 2.4, 2.8, '#0e1430', 0.6);
    brow(p, 18.6, 15.2, 22.8, 16.2); brow(p, 25.6, 16.2, 30, 15);
    part(p, P(22.5, 21, 26.5, 21, 24.6, 23.8), '#ffc23a', { ol: '#6a4a08', cel: true });
    smirk(p, 24.6, 24.2, 1.6);
  },
  nijikujaku(p) {
    const cols = ['#ff5a6a', '#ffa040', '#ffe050', '#6ad86a', '#58b0ff', '#a07cff'];
    cols.forEach((c, i) => part(p, Sub(E(24, 28, 23 - i * 2.6, (23 - i * 2.6) * 0.92), R(0, 29, 48, 30)), c, { flat: true, ol: i === 0 ? OL : mix(c, '#000000', 0.5) }));
    for (let a = 0; a < 7; a++) {
      const t = Math.PI * (0.1 + (a / 6) * 0.8), x = 24 - Math.cos(t) * 18, y = 28 - Math.sin(t) * 16.5;
      part(p, E(x, y, 2.4, 2.8), '#1a6ad0', { flat: true, ol: '#0a3a20' });
      flat(p, E(x, y + 0.4, 1.2, 1.4), '#6affd8');
    }
    part(p, E(24, 35, 7, 10), '#2a88dc', { hi: '#78c8ff' });
    flat(p, E(24, 38, 3.6, 5.6), '#bfe6ff');
    part(p, E(24, 22, 6, 6), '#2a88dc', { hi: '#78c8ff' });
    for (const x of [20.5, 24, 27.5]) { line(p, 24, 17, x, 11.5, '#1a4a8a', 1); part(p, E(x, 11, 1.3, 1.3), '#ffd23a', { flat: true }); }
    lidEye(p, 21.6, 21.6, 2, 2.4, '#2a88dc', '#160a30', 0.5, -0.2);
    lidEye(p, 26.4, 21.6, 2, 2.4, '#2a88dc', '#160a30', 0.5, -0.2);
    line(p, 19, 19.6, 20, 18.8, OL, 1); line(p, 29, 19.6, 28, 18.8, OL, 1);
    part(p, P(22.8, 24.8, 25.2, 24.8, 24, 27), '#ffb03a', { ol: '#6a4008', cel: true });
    cheek(p, 20, 25, '#ff9ad0'); cheek(p, 28, 25, '#ff9ad0');
    part(p, R(20.5, 44, 2, 2.4), '#d0902a'); part(p, R(25.5, 44, 2, 2.4), '#d0902a');
  },
  // ================================================================ しょくぶつ
  mossglow(p) {
    for (const [x, d] of [[15, -1], [33, 1]] as [number, number][]) part(p, P(x - 3, 40, x + 3, 40, x + 3 + d * 2, 46, x - 3 + d * 2, 46), '#7a4a24', { cel: true });
    part(p, P(10, 21, 38, 21, 37, 40, 32, 43, 16, 43, 11, 40), '#a06a38', { hi: '#cc9456' });
    for (const [x0, y0, x1, y1] of [[13.5, 27, 13.5, 37], [34.5, 26, 34.5, 36], [19, 39, 19, 42], [29, 39, 29, 42]]) line(p, x0, y0, x1, y1, '#6a4422', 1);
    part(p, E(24, 21, 14, 3.8), '#ecc88e', { cel: true });
    flat(p, E(24, 21, 9, 2.3), '#c8a066'); flat(p, E(24, 21, 4.2, 1.1), '#ecc88e');
    part(p, E(12.5, 36, 4.4, 3.4), '#6ac040', { hi: '#a8ec70' }); part(p, E(36, 30, 3.4, 2.8), '#6ac040', { hi: '#a8ec70' });
    // はっぱの かみがた
    const leaf = (cx: number, cy: number, rx: number, ry: number, rot: number) => {
      part(p, E(cx, cy, rx, ry), '#4cbc44', { hi: '#9cf070' });
      line(p, cx - rx * 0.8 * Math.cos(rot), cy - rx * 0.8 * Math.sin(rot), cx + rx * 0.8 * Math.cos(rot), cy + rx * 0.8 * Math.sin(rot), '#2a7a2a', 1);
    };
    line(p, 24, 18, 24, 11, '#5a8a2a', 1.4);
    leaf(16, 9, 7.4, 4, 0.3); leaf(32, 9, 7.4, 4, -0.3); leaf(24, 5.5, 4.4, 5.4, Math.PI / 2);
    eye(p, 18.5, 29, 3.2, 3.8, '#2a1608', 0, -0.2);
    eye(p, 29.5, 29, 3.2, 3.8, '#2a1608', 0, -0.2);
    cheek(p, 13.5, 33.5); cheek(p, 34.5, 33.5);
    grin(p, 24, 33.6, 4, 3.6);
  },
  madoidake(p) {
    for (const [x, y, r] of [[4, 38, 1.4], [7, 43, 0.9], [43, 36, 1.3], [46, 30, 0.8], [3, 30, 0.8]] as [number, number, number][]) part(p, E(x, y, r, r), '#efc0ff', { flat: true, ol: '#7a3a90' });
    part(p, E(11, 37, 3, 2.4), '#f4e8d0'); part(p, E(37, 35, 3, 2.4), '#f4e8d0');
    part(p, P(15, 26, 33, 26, 34, 43, 29, 45.5, 19, 45.5, 14, 43), '#f6ead2', { hi: '#ffffff', lo: '#cab896' });
    // かさ（すこし かたむいている）
    part(p, E(24, 27, 19, 3.6), '#7a1e9a', { flat: true });
    part(p, Sub(E(23, 21, 21, 16), R(0, 26.5, 48, 30)), '#b03ad0', { hi: '#e490ff', lo: '#701a96' });
    for (const [x, y, r] of [[11, 18, 3.4], [22, 10, 4], [33.5, 15, 3.2], [27, 21.5, 2.2], [16.5, 23, 1.8]] as [number, number, number][]) part(p, E(x, y, r, r * 0.85), '#fff0ff', { flat: true, ol: '#7a1e9a' });
    shine(p, 12, 10, 2.6, 1.4);
    // わるだくみの かお
    for (const s of [-1, 1]) {
      const x = 24 + s * 4.6;
      part(p, Sub(E(x, 33.6, 2.6, 2.2), R(x - 3, 30, 6, 3.4)), '#2a0a26', { flat: true });
      brow(p, x - 3 * s, 30, x + 2.6 * s, 31.6);
    }
    grin(p, 24, 37.2, 5.6, 3.6, { teeth: true, tilt: 0.8 });
    cheek(p, 17, 37, '#e8a0c8'); cheek(p, 31, 37, '#e8a0c8');
  },
  morinushi(p) {
    for (const [a, c2] of [[3, 13], [35, 45], [17, 31]] as [number, number][]) part(p, P(a, 46, (a + c2) / 2 - 2, 37, (a + c2) / 2 + 2, 37, c2, 46), '#5e3a1a', { cel: true });
    part(p, P(11, 22, 37, 22, 38, 42, 33, 45, 15, 45, 10, 42), '#7c4e26', { hi: '#a8763e' });
    for (const [x0, y0, x1, y1] of [[14, 26, 13.5, 40], [34, 25, 34.5, 41], [21, 23, 20, 26]]) line(p, x0, y0, x1, y1, '#55341a', 1);
    // えだの うで
    part(p, P(11, 30, 2, 24, 1, 21, 4, 23, 12, 27), '#6a4220', { cel: true });
    part(p, P(37, 30, 46, 24, 47, 21, 44, 23, 36, 27), '#6a4220', { cel: true });
    const cl = (x: number, y: number, rx: number, ry: number) => part(p, E(x, y, rx, ry), '#3a9a3a', { hi: '#86d868', lo: '#22702a' });
    cl(10, 17, 9, 7); cl(38, 17, 9, 7); cl(24, 12, 15, 10); cl(16, 7, 7, 5); cl(32, 7, 7, 5);
    for (const [x, y] of [[9, 14], [21, 6], [35, 13], [28, 10]]) flat(p, E(x, y, 1, 0.8), '#c8ff90');
    part(p, E(34, 3, 5, 2.2), '#b08440', { cel: true });
    part(p, E(34, 1.4, 2, 2), '#ffd23a', { flat: true });
    // やさしい め と こけの ひげ
    for (const x of [18.5, 29.5]) { eye(p, x, 30, 2.8, 3, '#2a1808', 0, 0.3); brow(p, x - 4, 25.6, x + 3.4, 26.4, '#e8f0d0'); }
    part(p, P(15, 35, 24, 33.5, 33, 35, 30, 38, 24, 36.5, 18, 38), '#6ac040', { hi: '#a8ec70', cel: true });
    grin(p, 24, 37.4, 3, 2.4, { tongue: false });
  },
  // ================================================================ ？？？
  luxdrago(p) {
    for (const s of [-1, 1]) {
      const o = (x: number) => 24 + s * (24 - x);
      part(p, P(o(21), 24, o(2), 4, o(6), 13, o(0), 16, o(5), 21, o(1), 26, o(8), 30, o(17), 33), '#fff2c0', { hi: '#ffffff', lo: '#e8c460', ol: '#7a5a10', cel: true });
      for (const [a, b] of [[6, 13], [5, 21], [8, 30]]) line(p, o(a), b, o(18), 27, '#e0b850', 1);
    }
    part(p, P(16, 40, 5, 46, 10, 41, 17, 37), '#f0c040', { cel: true });
    part(p, P(15, 37, 21, 37, 21, 45, 15, 45), '#d8a428'); part(p, P(27, 37, 33, 37, 33, 45, 27, 45), '#d8a428');
    part(p, E(18, 45.5, 3.8, 1.8), '#a07418'); part(p, E(30, 45.5, 3.8, 1.8), '#a07418');
    part(p, E(24, 34, 10.5, 10), '#f8d450', { hi: '#fff6c0' });
    part(p, E(24, 36.5, 6.4, 6.4), '#fff2b8', { cel: true });
    part(p, P(24, 26.5, 27.2, 30, 24, 33.5, 20.8, 30), '#ff5aa8', { hi: '#ffd0f0', ol: '#6a1040', cel: true });
    part(p, E(24, 17, 9.6, 8.6), '#f8d450', { hi: '#fff6c0' });
    part(p, E(24, 22, 5.4, 3.4), '#ffeeb0', { cel: true });
    for (const s of [-1, 1]) part(p, P(24 + s * 6, 12, 24 + s * 11, 0, 24 + s * 4, 10), '#8ae8ff', { hi: '#ffffff', ol: '#2a5a8a', cel: true });
    eye(p, 20, 16.4, 2.6, 3, '#183ea8', 0.2);
    eye(p, 28, 16.4, 2.6, 3, '#183ea8', 0.2);
    brow(p, 16.8, 12.6, 21.8, 13.6); brow(p, 26.2, 13.6, 31.2, 12.6);
    smirk(p, 24, 23, 3.4);
    star(p, 4, 38, 1.5); star(p, 44, 37, 1.4); star(p, 24, 2.5, 1.4, '#ffffff');
  },
};

const cache = new Map<string, HTMLCanvasElement>();

/** モンスターの絵（distorted=ゆがみ：紫のもやをまとう） */
export function monsterSprite(id: string, opts: { distorted?: boolean } = {}): HTMLCanvasElement {
  const key = `${id}:${opts.distorted ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = new Pix(MON_SIZE, MON_SIZE, MON_SCALE);
  p.cel = true;
  (SPRITES[id] ?? SPRITES.lumipon)(p);
  p.outline(OL);
  p.outline(OL);
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
