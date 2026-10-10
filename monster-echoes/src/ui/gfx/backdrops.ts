// 戦闘の背景（352×224）。テーマごとに一度だけ描いてキャッシュする。
import { mkCanvas } from './Pix';

export const BD_W = 352, BD_H = 224;
export type Backdrop = 'forest' | 'cave' | 'highland' | 'arena';
const HORIZON = 132;

const rnd = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

function sky(g: CanvasRenderingContext2D, top: string, bottom: string, h = HORIZON) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, top);
  gr.addColorStop(1, bottom);
  g.fillStyle = gr;
  g.fillRect(0, 0, BD_W, h);
}
function cloud(g: CanvasRenderingContext2D, x: number, y: number, s: number, col = '#ffffff', shadow = '#d8e4f4') {
  g.fillStyle = shadow;
  for (const [dx, dy, r] of [[0, 4, 9], [12, 2, 12], [26, 5, 9], [-10, 6, 7]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s + 2, r * s, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = col;
  for (const [dx, dy, r] of [[0, 3, 9], [12, 0, 12], [26, 4, 9], [-10, 5, 7]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); g.fill(); }
}
function hills(g: CanvasRenderingContext2D, base: number, amp: number, col: string, seed: number, step = 22) {
  const r = rnd(seed);
  g.fillStyle = col;
  g.beginPath();
  g.moveTo(0, BD_H);
  for (let x = -step; x <= BD_W + step; x += step) g.quadraticCurveTo(x - step / 2, base - amp * r(), x, base - amp * 0.5 * r());
  g.lineTo(BD_W, BD_H);
  g.fill();
}
function treeLine(g: CanvasRenderingContext2D, base: number, col: string, hi: string, seed: number, size = 16) {
  const r = rnd(seed);
  for (let x = -10; x < BD_W + 20; x += size * 0.9) {
    const h = size * (0.9 + r() * 0.6);
    g.fillStyle = col;
    g.beginPath(); g.arc(x, base - h * 0.6, h * 0.62, 0, Math.PI * 2); g.fill();
    g.fillStyle = hi;
    g.beginPath(); g.arc(x - h * 0.18, base - h * 0.8, h * 0.28, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = col;
  g.fillRect(0, base - size * 0.4, BD_W, size);
}
/** 地面（奥ほど暗いグラデーション＋模様） */
function floor(g: CanvasRenderingContext2D, far: string, near: string, dots: string, seed: number, y0 = HORIZON) {
  const gr = g.createLinearGradient(0, y0, 0, BD_H);
  gr.addColorStop(0, far);
  gr.addColorStop(1, near);
  g.fillStyle = gr;
  g.fillRect(0, y0, BD_W, BD_H - y0);
  const r = rnd(seed);
  g.fillStyle = dots;
  for (let i = 0; i < 160; i++) {
    const y = y0 + Math.pow(r(), 0.7) * (BD_H - y0), x = r() * BD_W, w = 2 + (y - y0) / 18;
    g.fillRect(Math.round(x), Math.round(y), Math.round(w), 1 + ((y - y0) / 50) | 0);
  }
}

function forest(g: CanvasRenderingContext2D) {
  sky(g, '#4a8ee0', '#bfe6ff');
  const sun = g.createRadialGradient(290, 30, 4, 290, 30, 70);
  sun.addColorStop(0, 'rgba(255,250,220,.95)'); sun.addColorStop(1, 'rgba(255,250,220,0)');
  g.fillStyle = sun; g.fillRect(200, 0, 152, 110);
  cloud(g, 60, 34, 1.1); cloud(g, 200, 22, 0.8); cloud(g, 320, 52, 0.7);
  hills(g, 112, 26, '#8ec4b0', 3, 40);
  hills(g, 124, 18, '#5e9a70', 5, 30);
  treeLine(g, 138, '#2f7a3a', '#4e9a48', 11, 22);
  treeLine(g, 146, '#246a30', '#3c8a3c', 17, 18);
  floor(g, '#4e9a3e', '#78c058', 'rgba(30,80,20,.35)', 7, 142);
  g.fillStyle = 'rgba(255,255,220,.10)';
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(240 + i * 30, 0); g.lineTo(270 + i * 30, 0); g.lineTo(180 + i * 40, 224); g.lineTo(150 + i * 40, 224); g.fill(); }
}
function cave(g: CanvasRenderingContext2D) {
  sky(g, '#120e1c', '#2e2638', 150);
  const r = rnd(9);
  g.fillStyle = '#3a3040';
  g.beginPath(); g.moveTo(0, 0);
  for (let x = 0; x <= BD_W; x += 16) { g.lineTo(x, 8 + r() * 10); g.lineTo(x + 8, 22 + r() * 40); }
  g.lineTo(BD_W, 0); g.fill();
  g.fillStyle = '#4a3e52';
  for (let x = 6; x < BD_W; x += 24 + r() * 20) { const h = 18 + r() * 30; g.beginPath(); g.moveTo(x - 6, 0); g.lineTo(x, h); g.lineTo(x + 6, 0); g.fill(); }
  hills(g, 128, 40, '#2a2232', 13, 28);
  // ひかる すいしょう
  for (const [x, y, s] of [[40, 128, 1], [300, 120, 1.3], [180, 112, 0.8]]) {
    const gl = g.createRadialGradient(x, y - 8 * s, 2, x, y - 8 * s, 34 * s);
    gl.addColorStop(0, 'rgba(120,220,255,.45)'); gl.addColorStop(1, 'rgba(120,220,255,0)');
    g.fillStyle = gl; g.fillRect(x - 40 * s, y - 50 * s, 80 * s, 80 * s);
    for (const [dx, h] of [[-5, 14], [0, 22], [6, 16]]) {
      g.fillStyle = '#6ad0f8'; g.beginPath(); g.moveTo(x + dx * s - 3 * s, y); g.lineTo(x + dx * s, y - h * s); g.lineTo(x + dx * s + 3 * s, y); g.fill();
      g.fillStyle = '#dff8ff'; g.fillRect(x + dx * s - 1, y - h * s + 4, 1, h * s * 0.6);
    }
  }
  floor(g, '#3a3036', '#6a5a52', 'rgba(20,10,10,.4)', 21, 136);
  g.fillStyle = 'rgba(60,120,200,.35)';
  g.beginPath(); g.ellipse(270, 196, 70, 10, 0, 0, Math.PI * 2); g.fill();
}
function highland(g: CanvasRenderingContext2D) {
  sky(g, '#f08a5a', '#ffe0a0');
  const sun = g.createRadialGradient(80, 70, 6, 80, 70, 80);
  sun.addColorStop(0, 'rgba(255,240,180,1)'); sun.addColorStop(0.2, 'rgba(255,220,150,.6)'); sun.addColorStop(1, 'rgba(255,200,120,0)');
  g.fillStyle = sun; g.fillRect(0, 0, 200, 150);
  cloud(g, 230, 30, 1, '#fff2dc', '#f4c8a8'); cloud(g, 120, 46, 0.7, '#fff2dc', '#f4c8a8');
  // やま
  for (const [x, w, h, c, snow] of [[80, 120, 80, '#8a7aa0', true], [200, 160, 100, '#7a6a94', true], [320, 120, 70, '#8a7aa0', false]] as [number, number, number, string, boolean][]) {
    g.fillStyle = c; g.beginPath(); g.moveTo(x - w / 2, 132); g.lineTo(x, 132 - h); g.lineTo(x + w / 2, 132); g.fill();
    g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.moveTo(x, 132 - h); g.lineTo(x + w / 2, 132); g.lineTo(x + 6, 132); g.fill();
    if (snow) { g.fillStyle = '#fbf4ff'; g.beginPath(); g.moveTo(x - w * 0.12, 132 - h * 0.76); g.lineTo(x, 132 - h); g.lineTo(x + w * 0.12, 132 - h * 0.76); g.lineTo(x + 4, 132 - h * 0.7); g.lineTo(x - 4, 132 - h * 0.8); g.fill(); }
  }
  hills(g, 136, 16, '#9aa858', 4, 36);
  floor(g, '#a8b45c', '#d0d27a', 'rgba(110,100,40,.35)', 31, 134);
  g.strokeStyle = 'rgba(255,255,240,.5)'; g.lineWidth = 1;
  for (const [x, y] of [[40, 60], [250, 90], [150, 20]]) { g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 20, y - 8, x + 40, y + 8, x + 60, y); g.stroke(); }
}
function arena(g: CanvasRenderingContext2D) {
  sky(g, '#3c78d8', '#a8d8ff', 70);
  cloud(g, 70, 24, 0.8); cloud(g, 270, 30, 0.9);
  // かんきゃくせき
  g.fillStyle = '#c8a878'; g.fillRect(0, 50, BD_W, 86);
  const r = rnd(41);
  for (let row = 0; row < 5; row++) {
    const y = 58 + row * 14;
    g.fillStyle = row % 2 ? '#b89868' : '#a88858'; g.fillRect(0, y + 8, BD_W, 6);
    for (let x = 4; x < BD_W; x += 7) {
      g.fillStyle = ['#e85a5a', '#5a8ae8', '#f0d050', '#6ac06a', '#f0a0c0', '#ffffff'][Math.floor(r() * 6)];
      g.fillRect(x + (row % 2) * 3, y + 2 + (r() > 0.85 ? -1 : 0), 4, 5);
      g.fillStyle = '#f2c8a0'; g.fillRect(x + (row % 2) * 3 + 1, y, 2, 2);
    }
  }
  for (let x = 0; x < BD_W; x += 44) {
    g.fillStyle = '#8a6a48'; g.fillRect(x, 46, 8, 90);
    g.fillStyle = '#e8d0a0'; g.fillRect(x + 1, 46, 3, 90);
    g.fillStyle = x % 88 ? '#d83a3a' : '#3a5ad8'; g.beginPath(); g.moveTo(x + 10, 46); g.lineTo(x + 30, 46); g.lineTo(x + 30, 66); g.lineTo(x + 20, 60); g.lineTo(x + 10, 66); g.fill();
  }
  g.fillStyle = '#6a4a30'; g.fillRect(0, 128, BD_W, 8);
  floor(g, '#c8a26a', '#e8cc94', 'rgba(120,80,40,.3)', 51, 136);
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2;
  g.beginPath(); g.ellipse(176, 190, 130, 24, 0, 0, Math.PI * 2); g.stroke();
}

const cache = new Map<string, HTMLCanvasElement>();
export function backdrop(b: Backdrop): HTMLCanvasElement {
  const hit = cache.get(b);
  if (hit) return hit;
  const [c, g] = mkCanvas(BD_W, BD_H);
  ({ forest, cave, highland, arena })[b](g);
  cache.set(b, c);
  return c;
}
