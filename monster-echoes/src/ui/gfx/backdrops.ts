// 戦闘の背景（352×288）。参考画像3「戦闘画面」の 描き方：
// 青空と 雲・雪を かぶった 山なみ・台地の がけ・左右の 木立・花の さく 草原。テーマごとに 一度だけ 描いて キャッシュする。
import { mkCanvas } from './Pix';

export const BD_W = 352, BD_H = 288;
export type Backdrop = 'forest' | 'cave' | 'highland' | 'arena' | 'tower' | 'snow' | 'volcano' | 'temple' | 'grove';
/** 地平線（味方と 敵が 立つ 草原の はじまり） */
export const HORIZON = 168;

type G = CanvasRenderingContext2D;
const rnd = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

function vgrad(g: G, y0: number, y1: number, stops: [number, string][], x = 0, w = BD_W) {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  for (const [k, c] of stops) gr.addColorStop(k, c);
  g.fillStyle = gr; g.fillRect(x, y0, w, y1 - y0);
}
function glow(g: G, x: number, y: number, r: number, col: string, a = 1) {
  const gr = g.createRadialGradient(x, y, 1, x, y, r);
  gr.addColorStop(0, col.replace('A', String(a))); gr.addColorStop(1, col.replace('A', '0'));
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
}
function blob(g: G, x: number, y: number, r: number, c: string) { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
function cloud(g: G, x: number, y: number, s: number, col = '#ffffff', mid = '#eef4fc', shade = '#c6d6ec') {
  const parts: [number, number, number][] = [[0, 6, 10], [13, 0, 14], [30, 4, 12], [44, 8, 9], [-12, 9, 8], [22, 10, 11]];
  for (const [dx, dy, r] of parts) blob(g, x + dx * s, y + dy * s + 3 * s, r * s, shade);
  for (const [dx, dy, r] of parts) blob(g, x + dx * s, y + dy * s, r * s, mid);
  for (const [dx, dy, r] of parts) blob(g, x + dx * s - 2 * s, y + dy * s - 3 * s, r * s * 0.7, col);
  g.fillStyle = shade; g.fillRect(x - 18 * s, y + 13 * s, 70 * s, 2 * s);
}

/** 山（尾根を ぎざぎざに。左が 日なた、右が 日かげ、てっぺんに 雪） */
function mountain(g: G, cx: number, base: number, w: number, h: number, body: string, shade: string, light: string, snowLine = 0.42, seed = 1) {
  const r = rnd(seed);
  const pts: [number, number][] = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = cx - w / 2 + w * t;
    const k = 1 - Math.abs(t - 0.5) * 2;
    const y = base - h * Math.pow(k, 1.15) - (i % 2 ? r() * h * 0.08 : 0);
    pts.push([x, y]);
  }
  const peak = pts.reduce((a, b) => (b[1] < a[1] ? b : a));
  const path = () => { g.beginPath(); g.moveTo(cx - w / 2, base); for (const [x, y] of pts) g.lineTo(x, y); g.lineTo(cx + w / 2, base); g.closePath(); };
  g.fillStyle = body; path(); g.fill();
  g.save(); path(); g.clip();
  // 日かげ（右がわ）と 谷すじ
  g.fillStyle = shade;
  g.beginPath(); g.moveTo(peak[0], peak[1]);
  for (let i = 0; i < 6; i++) g.lineTo(peak[0] + 6 + i * w * 0.06 + r() * 6, peak[1] + (i + 1) * h * 0.16);
  g.lineTo(cx + w / 2, base); g.lineTo(cx + w / 2, peak[1]); g.fill();
  g.strokeStyle = shade; g.lineWidth = 1.5;
  for (let i = 0; i < 7; i++) {
    const sx = cx - w * 0.4 + r() * w * 0.75, sy = base - h * (0.2 + r() * 0.5);
    g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + (r() - 0.3) * 10, sy + 16 + r() * 18); g.stroke();
  }
  // 日なたの ハイライト
  g.fillStyle = light;
  g.beginPath(); g.moveTo(peak[0], peak[1]);
  g.lineTo(peak[0] - w * 0.14, peak[1] + h * 0.35); g.lineTo(peak[0] - w * 0.08, peak[1] + h * 0.3); g.lineTo(peak[0] - 2, peak[1] + h * 0.1); g.fill();
  // 雪
  if (snowLine > 0) {
    const sy = peak[1] + h * snowLine;
    g.fillStyle = '#f6faff';
    g.beginPath(); g.moveTo(cx - w / 2, base);
    for (const [x, y] of pts) g.lineTo(x, y);
    g.lineTo(cx + w / 2, base); g.closePath();
    g.save(); g.clip();
    g.beginPath(); g.moveTo(cx - w / 2, sy);
    for (let x = cx - w / 2; x <= cx + w / 2; x += 6) g.lineTo(x, sy - ((x / 6) % 2 ? 6 : -4) - r() * 8 + Math.abs(x - peak[0]) * 0.25);
    g.lineTo(cx + w / 2, 0); g.lineTo(cx - w / 2, 0); g.fill();
    g.fillStyle = '#c6d4ec';
    g.beginPath(); g.moveTo(peak[0] + 2, peak[1]); g.lineTo(peak[0] + w * 0.2, sy + 4); g.lineTo(peak[0] + 4, sy - 6); g.fill();
    g.restore();
  }
  g.restore();
}

/** 台地（てっぺんが たいらな がけ。地層の しま） */
function mesa(g: G, x: number, base: number, w: number, h: number, seed: number) {
  const r = rnd(seed);
  const top = base - h;
  g.fillStyle = '#9a7656';
  g.beginPath(); g.moveTo(x, base); g.lineTo(x + w * 0.12, top + 6); g.lineTo(x + w * 0.2, top); g.lineTo(x + w * 0.82, top); g.lineTo(x + w * 0.9, top + 8); g.lineTo(x + w, base); g.fill();
  g.save(); g.clip();
  for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#a8845e' : '#8a6a4c'; g.fillRect(x, top + 10 + i * (h / 7), w, 3 + r() * 3); }
  g.fillStyle = 'rgba(60,40,30,.35)'; g.fillRect(x + w * 0.6, top, w * 0.4, h);
  g.strokeStyle = 'rgba(60,40,30,.45)'; g.lineWidth = 1;
  for (let i = 0; i < 9; i++) { const sx = x + w * (0.15 + r() * 0.7); g.beginPath(); g.moveTo(sx, top + 8); g.lineTo(sx + (r() - 0.5) * 6, base - 4); g.stroke(); }
  g.restore();
  // 上の 草
  g.fillStyle = '#5e9a42'; g.fillRect(x + w * 0.2, top - 3, w * 0.62, 6);
  for (let i = 0; i < 10; i++) blob(g, x + w * (0.22 + r() * 0.58), top - 2, 3 + r() * 4, r() > 0.5 ? '#4e8a3a' : '#6aa84a');
}

/** 木（まるい 葉っぱの かたまりを かさねる） */
function tree(g: G, x: number, base: number, s: number, pal = ['#1e5a2a', '#2f7a34', '#4a9a3e', '#7cc456'], seed = 1) {
  const r = rnd(seed);
  g.fillStyle = '#5a3a22'; g.fillRect(x - 2 * s, base - 14 * s, 4 * s, 14 * s);
  g.fillStyle = '#7a5232'; g.fillRect(x - 2 * s, base - 14 * s, 1.5 * s, 14 * s);
  const parts: [number, number, number][] = [[0, -30, 13], [-10, -22, 10], [10, -22, 10], [-6, -38, 9], [7, -36, 9], [0, -46, 7]];
  for (const [dx, dy, rr] of parts) blob(g, x + dx * s, base + dy * s + 2 * s, rr * s, pal[0]);
  for (const [dx, dy, rr] of parts) blob(g, x + dx * s - 1 * s, base + dy * s, rr * s * 0.9, pal[1]);
  for (const [dx, dy, rr] of parts) blob(g, x + dx * s - 3 * s, base + dy * s - 3 * s, rr * s * 0.5, pal[2]);
  for (let i = 0; i < 6; i++) { g.fillStyle = pal[3]; g.fillRect(x + (r() * 22 - 14) * s, base + (-44 + r() * 26) * s, 2 * s, 2 * s); }
}
function pine(g: G, x: number, base: number, s: number, col = '#1f5a3a', hi = '#3a7a4a') {
  for (let i = 0; i < 4; i++) {
    const w = (16 - i * 3) * s, y = base - 8 * s - i * 9 * s;
    g.fillStyle = col; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x, y - 14 * s); g.lineTo(x + w, y); g.fill();
    g.fillStyle = hi; g.beginPath(); g.moveTo(x - w * 0.8, y - 1); g.lineTo(x, y - 14 * s); g.lineTo(x - w * 0.1, y - 1); g.fill();
  }
  g.fillStyle = '#4a3020'; g.fillRect(x - 2 * s, base - 8 * s, 4 * s, 8 * s);
}
/** 遠くの 森の ふち */
function forestEdge(g: G, base: number, col: string, hi: string, seed: number, size = 14) {
  const r = rnd(seed);
  for (let x = -10; x < BD_W + 20; x += size * 0.7) {
    const hh = size * (0.8 + r() * 0.7);
    blob(g, x, base - hh * 0.5, hh * 0.6, col);
    blob(g, x - hh * 0.2, base - hh * 0.75, hh * 0.3, hi);
  }
  g.fillStyle = col; g.fillRect(0, base - size * 0.4, BD_W, size);
}
/** 草原（奥は 暗く、手前は 明るい。草の ふさ・花・小石） */
function meadow(g: G, y0: number, far: string, near: string, tuft: string, tuftHi: string, seed: number, flowers = true) {
  vgrad(g, y0, BD_H, [[0, far], [1, near]]);
  const r = rnd(seed);
  // まだらの もよう
  for (let i = 0; i < 70; i++) {
    const y = y0 + Math.pow(r(), 0.8) * (BD_H - y0), k = (y - y0) / (BD_H - y0);
    g.fillStyle = r() > 0.5 ? 'rgba(255,255,200,.07)' : 'rgba(0,40,0,.08)';
    g.beginPath(); g.ellipse(r() * BD_W, y, 10 + k * 40, 2 + k * 6, 0, 0, Math.PI * 2); g.fill();
  }
  for (let i = 0; i < 360; i++) {
    const y = y0 + 3 + Math.pow(r(), 0.75) * (BD_H - y0), k = (y - y0) / (BD_H - y0), x = r() * BD_W;
    const hh = 2 + k * 6;
    g.fillStyle = r() > 0.4 ? tuft : tuftHi;
    g.fillRect(Math.round(x), Math.round(y - hh), 1, Math.round(hh));
    g.fillRect(Math.round(x - 1 - k * 2), Math.round(y - hh * 0.6), 1, Math.round(hh * 0.6));
    g.fillRect(Math.round(x + 1 + k * 2), Math.round(y - hh * 0.7), 1, Math.round(hh * 0.7));
  }
  if (flowers) {
    const cols = ['#ffffff', '#ffe066', '#ff8ab0', '#b0a0ff'];
    for (let i = 0; i < 70; i++) {
      const y = y0 + 8 + Math.pow(r(), 0.7) * (BD_H - y0 - 8), k = (y - y0) / (BD_H - y0), x = r() * BD_W;
      const s = k > 0.5 ? 2 : 1;
      g.fillStyle = cols[i % 4]; g.fillRect(Math.round(x), Math.round(y), s + 1, s + 1);
      if (k > 0.55) { g.fillStyle = '#ffe9a0'; g.fillRect(Math.round(x) + 1, Math.round(y) + 1, 1, 1); }
    }
  }
}
function sun(g: G, x: number, y: number) {
  glow(g, x, y, 90, 'rgba(255,250,215,A)', 0.85);
  glow(g, x, y, 26, 'rgba(255,255,240,A)', 1);
}
function rays(g: G, x: number, a = 0.08) {
  g.fillStyle = `rgba(255,255,220,${a})`;
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x + i * 28, 0); g.lineTo(x + 18 + i * 28, 0); g.lineTo(x - 80 + i * 44, BD_H); g.lineTo(x - 110 + i * 44, BD_H); g.fill(); }
}

// ---------------------------------------------------------------- テーマ
function forest(g: G) {
  vgrad(g, 0, HORIZON, [[0, '#3c84e0'], [0.55, '#86c4f4'], [1, '#d6eefc']]);
  sun(g, 300, 30);
  cloud(g, 40, 30, 1.1); cloud(g, 190, 18, 0.8); cloud(g, 300, 64, 0.65); cloud(g, 120, 72, 0.55, '#ffffff', '#f2f6fc', '#d0dcee');
  // とおくの 山なみ
  vgrad(g, 70, HORIZON, [[0, 'rgba(160,190,230,0)'], [1, 'rgba(200,225,245,.6)']]);
  mountain(g, 70, 142, 190, 74, '#8aa2c8', '#6e86b0', '#a8bedc', 0.4, 3);
  mountain(g, 190, 142, 220, 98, '#7e96c0', '#6278a8', '#9fb4d8', 0.36, 5);
  mountain(g, 320, 142, 180, 70, '#8aa2c8', '#6e86b0', '#a8bedc', 0.42, 7);
  vgrad(g, 110, 150, [[0, 'rgba(210,230,250,0)'], [1, 'rgba(210,230,250,.55)']]);
  // 台地（右の おく）
  mesa(g, 214, 158, 110, 34, 9);
  // 中景の 丘と 木立
  g.fillStyle = '#6aa860'; g.beginPath(); g.moveTo(0, 160); g.quadraticCurveTo(90, 136, 190, 154); g.quadraticCurveTo(270, 146, 352, 156); g.lineTo(352, 172); g.lineTo(0, 172); g.fill();
  forestEdge(g, 166, '#2f6e34', '#4a8e42', 11, 14);
  meadow(g, HORIZON - 4, '#5aa040', '#8ccc5a', '#3e8030', '#a8dc72', 7);
  // 左右の 手前の 木
  for (const [x, b, s, sd] of [[18, 178, 1.15, 1], [52, 172, 0.9, 2], [-4, 200, 1.4, 3], [334, 176, 1.1, 4], [304, 170, 0.85, 5], [356, 204, 1.4, 6]] as [number, number, number, number][]) tree(g, x, b, s, undefined, sd);
  rays(g, 250, 0.06);
}
/** ボスの へや（森）：しげみの おくの くらい 広場 */
function grove(g: G) {
  vgrad(g, 0, HORIZON, [[0, '#1a2a3a'], [1, '#3a5a52']]);
  glow(g, 176, 70, 120, 'rgba(180,255,190,A)', 0.25);
  for (let i = 0; i < 10; i++) pine(g, i * 40 - 10, 150 + (i % 3) * 6, 1.4 + (i % 2) * 0.3, '#163a2a', '#24523a');
  forestEdge(g, 168, '#1a4024', '#2e6232', 23, 18);
  meadow(g, HORIZON - 4, '#2e5a2a', '#4a7c38', '#1e4620', '#6a9a4a', 17, false);
  const r = rnd(5);
  for (let i = 0; i < 20; i++) { g.fillStyle = `rgba(190,255,160,${0.3 + r() * 0.5})`; g.fillRect(r() * BD_W, 40 + r() * 200, 2, 2); }
  for (const [x, s] of [[30, 1], [326, 1.1]] as [number, number][]) { // きのこ
    g.fillStyle = '#e8dcc0'; g.fillRect(x - 3 * s, 220, 6 * s, 14 * s);
    g.fillStyle = '#b03a4a'; g.beginPath(); g.ellipse(x, 220, 14 * s, 8 * s, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#fff'; g.fillRect(x - 6, 214, 3, 3); g.fillRect(x + 4, 216, 3, 2);
  }
  vgrad(g, 0, BD_H, [[0, 'rgba(0,0,0,.25)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.3)']]);
}
function cave(g: G) {
  vgrad(g, 0, BD_H, [[0, '#0a1430'], [0.55, '#14305a'], [1, '#1a3a62']]);
  const r = rnd(9);
  // おくの 岩かべ
  for (let i = 0; i < 26; i++) {
    const x = r() * BD_W, y = 30 + r() * 130, s = 14 + r() * 26;
    g.fillStyle = r() > 0.5 ? '#1c3c6c' : '#16325c'; g.beginPath(); g.ellipse(x, y, s, s * 0.7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(120,170,230,.18)'; g.beginPath(); g.ellipse(x - s * 0.3, y - s * 0.3, s * 0.5, s * 0.3, 0, 0, Math.PI * 2); g.fill();
  }
  // つらら
  g.fillStyle = '#0c1c3a';
  g.beginPath(); g.moveTo(0, 0);
  for (let x = 0; x <= BD_W; x += 14) { g.lineTo(x, 10 + r() * 14); g.lineTo(x + 7, 26 + r() * 46); }
  g.lineTo(BD_W, 0); g.fill();
  // すいしょう
  const crystal = (x: number, y: number, s: number) => {
    glow(g, x, y - 16 * s, 46 * s, 'rgba(110,220,255,A)', 0.5);
    for (const [dx, hh, w] of [[-8, 20, 5], [0, 34, 7], [8, 24, 5], [-3, 14, 4]] as [number, number, number][]) {
      const bx = x + dx * s;
      g.fillStyle = '#3aa8e8'; g.beginPath(); g.moveTo(bx - w * s, y); g.lineTo(bx - w * s * 0.7, y - hh * s * 0.8); g.lineTo(bx, y - hh * s); g.lineTo(bx + w * s * 0.7, y - hh * s * 0.8); g.lineTo(bx + w * s, y); g.fill();
      g.fillStyle = '#9ae8ff'; g.beginPath(); g.moveTo(bx - w * s * 0.7, y - hh * s * 0.8); g.lineTo(bx, y - hh * s); g.lineTo(bx, y); g.lineTo(bx - w * s * 0.6, y); g.fill();
      g.fillStyle = '#ffffff'; g.fillRect(bx - 1, y - hh * s + 4, 1, hh * s * 0.5);
    }
  };
  crystal(36, 176, 1.2); crystal(316, 170, 1.4); crystal(250, 150, 0.7); crystal(110, 150, 0.6);
  // ゆか
  vgrad(g, 160, BD_H, [[0, '#1a3456'], [1, '#2c4e78']]);
  for (let i = 0; i < 80; i++) {
    const y = 162 + Math.pow(r(), 0.8) * 126, k = (y - 160) / 128, x = r() * BD_W;
    g.fillStyle = r() > 0.5 ? 'rgba(10,20,40,.45)' : 'rgba(120,170,230,.22)';
    g.beginPath(); g.ellipse(x, y, 6 + k * 18, 2 + k * 5, 0, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = 'rgba(80,190,255,.35)'; g.beginPath(); g.ellipse(270, 250, 70, 12, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(200,240,255,.35)'; g.beginPath(); g.ellipse(262, 248, 40, 4, 0, 0, Math.PI * 2); g.fill();
}
function highland(g: G) {
  vgrad(g, 0, HORIZON, [[0, '#e8784a'], [0.6, '#ffc890'], [1, '#ffe8b8']]);
  glow(g, 80, 80, 100, 'rgba(255,240,180,A)', 0.9);
  cloud(g, 220, 30, 1, '#fff2dc', '#fde4c8', '#f4c0a0'); cloud(g, 110, 48, 0.7, '#fff2dc', '#fde4c8', '#f4c0a0');
  mountain(g, 80, 150, 180, 80, '#8a74a0', '#6a5888', '#a894bc', 0.4, 2);
  mountain(g, 210, 150, 220, 104, '#7a6894', '#5c4c7a', '#9a88b4', 0.38, 4);
  mountain(g, 330, 150, 170, 74, '#8a74a0', '#6a5888', '#a894bc', 0.45, 6);
  mesa(g, 10, 166, 100, 30, 12);
  g.fillStyle = '#9aa858'; g.beginPath(); g.moveTo(0, 164); g.quadraticCurveTo(170, 148, 352, 162); g.lineTo(352, 176); g.lineTo(0, 176); g.fill();
  meadow(g, HORIZON - 2, '#a8b45c', '#d6d880', '#8a9440', '#e8e49a', 31, false);
  for (const [x, b, s] of [[330, 190, 1.1], [16, 186, 0.9]] as [number, number, number][]) pine(g, x, b, s, '#3a5a3a', '#5a7a4a');
}
function arena(g: G) {
  vgrad(g, 0, 90, [[0, '#3c78d8'], [1, '#a8d8ff']]);
  cloud(g, 60, 22, 0.8); cloud(g, 270, 28, 0.9);
  g.fillStyle = '#c8a878'; g.fillRect(0, 64, BD_W, 106);
  const r = rnd(41);
  for (let row = 0; row < 6; row++) {
    const y = 72 + row * 15;
    g.fillStyle = row % 2 ? '#b89868' : '#a88858'; g.fillRect(0, y + 9, BD_W, 6);
    for (let x = 4; x < BD_W; x += 7) {
      g.fillStyle = ['#e85a5a', '#5a8ae8', '#f0d050', '#6ac06a', '#f0a0c0', '#ffffff'][Math.floor(r() * 6)];
      g.fillRect(x + (row % 2) * 3, y + 2 + (r() > 0.85 ? -1 : 0), 4, 6);
      g.fillStyle = '#f2c8a0'; g.fillRect(x + (row % 2) * 3 + 1, y, 2, 2);
    }
  }
  for (let x = 0; x < BD_W; x += 44) {
    g.fillStyle = '#8a6a48'; g.fillRect(x, 58, 8, 112);
    g.fillStyle = '#e8d0a0'; g.fillRect(x + 1, 58, 3, 112);
    g.fillStyle = x % 88 ? '#d83a3a' : '#3a5ad8'; g.beginPath(); g.moveTo(x + 10, 58); g.lineTo(x + 30, 58); g.lineTo(x + 30, 80); g.lineTo(x + 20, 73); g.lineTo(x + 10, 80); g.fill();
  }
  g.fillStyle = '#6a4a30'; g.fillRect(0, 162, BD_W, 8);
  vgrad(g, 170, BD_H, [[0, '#c8a26a'], [1, '#ecd09a']]);
  for (let i = 0; i < 200; i++) { g.fillStyle = 'rgba(120,80,40,.25)'; g.fillRect(r() * BD_W, 170 + Math.pow(r(), 0.8) * 118, 2, 1); }
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2;
  g.beginPath(); g.ellipse(176, 236, 140, 30, 0, 0, Math.PI * 2); g.stroke();
}
function tower(g: G) {
  vgrad(g, 0, HORIZON, [[0, '#0c1440'], [1, '#3a4aa0']]);
  const r = rnd(77);
  for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`; g.fillRect(r() * BD_W, r() * 130, 1, 1); }
  glow(g, 176, 70, 130, 'rgba(160,220,255,A)', 0.5);
  for (const [x, w, hh] of [[30, 26, 140], [100, 20, 104], [252, 20, 110], [322, 26, 146]] as [number, number, number][]) {
    g.fillStyle = '#c8d8f8'; g.fillRect(x - w / 2, 168 - hh, w, hh);
    g.fillStyle = '#8aa0d8'; g.fillRect(x + w * 0.15, 168 - hh, w * 0.35, hh);
    g.fillStyle = '#e8f6ff'; g.beginPath(); g.moveTo(x - w / 2 - 3, 168 - hh); g.lineTo(x, 168 - hh - 18); g.lineTo(x + w / 2 + 3, 168 - hh); g.fill();
  }
  vgrad(g, 166, BD_H, [[0, '#9aa8d8'], [1, '#dce4fa']]);
  for (let i = 0; i < 8; i++) { g.strokeStyle = 'rgba(80,90,150,.25)'; g.beginPath(); g.moveTo(0, 176 + i * i * 2.2); g.lineTo(BD_W, 176 + i * i * 2.2); g.stroke(); }
  g.strokeStyle = 'rgba(120,200,255,.6)'; g.lineWidth = 2;
  g.beginPath(); g.ellipse(176, 236, 130, 26, 0, 0, Math.PI * 2); g.stroke();
}
function snow(g: G) {
  vgrad(g, 0, HORIZON, [[0, '#7a9ac8'], [1, '#e8f2ff']]);
  cloud(g, 60, 30, 1.1, '#f4f8ff', '#e6eef8', '#c8d6ec'); cloud(g, 250, 22, 0.9, '#f4f8ff', '#e6eef8', '#c8d6ec');
  mountain(g, 70, 156, 190, 90, '#9ab2d8', '#7a94c0', '#c0d2ee', 0.62, 3);
  mountain(g, 200, 156, 230, 116, '#8aa4cc', '#6a86b4', '#b4c8e8', 0.6, 5);
  mountain(g, 330, 156, 170, 80, '#9ab2d8', '#7a94c0', '#c0d2ee', 0.62, 7);
  g.fillStyle = '#dce8f8'; g.beginPath(); g.moveTo(0, 166); g.quadraticCurveTo(170, 150, 352, 164); g.lineTo(352, 180); g.lineTo(0, 180); g.fill();
  const r = rnd(14);
  for (let x = 8; x < BD_W; x += 34 + r() * 30) pine(g, x, 172, 0.8 + r() * 0.3, '#2a5a58', '#f4faff');
  vgrad(g, HORIZON, BD_H, [[0, '#d8e6f8'], [1, '#f8fcff']]);
  for (let i = 0; i < 120; i++) { g.fillStyle = 'rgba(120,150,200,.25)'; g.fillRect(r() * BD_W, HORIZON + Math.pow(r(), 0.8) * 120, 3, 1); }
  g.fillStyle = 'rgba(255,255,255,.9)';
  for (let i = 0; i < 70; i++) g.fillRect(r() * BD_W, r() * BD_H, 2, 2);
}
function volcano(g: G) {
  vgrad(g, 0, HORIZON, [[0, '#2a0a10'], [1, '#c0481c']]);
  glow(g, 176, 120, 160, 'rgba(255,190,80,A)', 0.7);
  mountain(g, 70, 166, 170, 80, '#3a1a1c', '#2a1012', '#5a2a24', 0, 3);
  mountain(g, 290, 166, 170, 90, '#3a1a1c', '#2a1012', '#5a2a24', 0, 5);
  g.fillStyle = '#2a1214'; g.beginPath(); g.moveTo(80, 170); g.lineTo(150, 78); g.lineTo(202, 78); g.lineTo(272, 170); g.fill();
  g.fillStyle = '#ff8a2a'; g.beginPath(); g.ellipse(176, 78, 28, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffd860'; g.beginPath(); g.ellipse(176, 77, 18, 3.5, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#ff7a20'; g.lineWidth = 3; g.beginPath(); g.moveTo(170, 82); g.bezierCurveTo(160, 110, 170, 130, 150, 170); g.stroke();
  g.beginPath(); g.moveTo(184, 82); g.bezierCurveTo(196, 110, 188, 132, 206, 170); g.stroke();
  const r = rnd(33);
  for (let i = 0; i < 50; i++) { g.fillStyle = `rgba(255,${150 + (r() * 90) | 0},60,${0.4 + r() * 0.6})`; g.fillRect(r() * BD_W, r() * 150, 2, 2); }
  vgrad(g, HORIZON, BD_H, [[0, '#3a1a18'], [1, '#6a2e22']]);
  for (let i = 0; i < 160; i++) { g.fillStyle = r() > 0.8 ? 'rgba(255,120,40,.5)' : 'rgba(20,6,6,.35)'; g.fillRect(r() * BD_W, HORIZON + Math.pow(r(), 0.8) * 120, 3, 1); }
  g.fillStyle = 'rgba(255,120,30,.55)'; g.beginPath(); g.ellipse(70, 250, 60, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,200,90,.6)'; g.beginPath(); g.ellipse(70, 250, 32, 4, 0, 0, Math.PI * 2); g.fill();
}
/** 原初の神殿（参考画像3「ボスの部屋」）：紫の すいしょうと 柱 */
function temple(g: G) {
  vgrad(g, 0, BD_H, [[0, '#1a0c3a'], [0.6, '#3a1c6a'], [1, '#5a3a8a']]);
  glow(g, 176, 110, 170, 'rgba(200,150,255,A)', 0.55);
  const r = rnd(19);
  // おくの 巨大すいしょう
  const crystal = (x: number, y: number, w: number, hh: number, tilt: number) => {
    g.save(); g.translate(x, y); g.rotate(tilt);
    g.fillStyle = '#7a5ad8'; g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w * 0.8, -hh * 0.85); g.lineTo(0, -hh); g.lineTo(w * 0.8, -hh * 0.85); g.lineTo(w, 0); g.fill();
    g.fillStyle = '#b8a0ff'; g.beginPath(); g.moveTo(-w * 0.8, -hh * 0.85); g.lineTo(0, -hh); g.lineTo(0, 0); g.lineTo(-w * 0.7, 0); g.fill();
    g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(-w * 0.45, -hh * 0.8, 2, hh * 0.6);
    g.restore();
  };
  for (const [x, y, w, hh, t] of [[80, 176, 22, 120, -0.25], [272, 176, 22, 120, 0.25], [130, 170, 14, 80, -0.1], [222, 170, 14, 80, 0.1], [40, 186, 12, 60, -0.4], [312, 186, 12, 60, 0.4]] as [number, number, number, number, number][]) crystal(x, y, w, hh, t);
  // 柱
  for (const x of [14, 338]) {
    g.fillStyle = '#4a3a7a'; g.fillRect(x - 12, 0, 24, 200);
    g.fillStyle = '#6a5aa0'; g.fillRect(x - 12, 0, 7, 200);
    g.fillStyle = '#2a1c50'; g.fillRect(x + 7, 0, 5, 200);
    for (let y = 20; y < 200; y += 40) { g.fillStyle = '#7a6ab8'; g.fillRect(x - 14, y, 28, 5); }
  }
  // ゆか（もようの ある 石だたみ）
  vgrad(g, 176, BD_H, [[0, '#3a2a6a'], [1, '#6a5aa8']]);
  g.strokeStyle = 'rgba(200,180,255,.25)'; g.lineWidth = 1;
  for (let i = 0; i < 7; i++) { const y = 180 + i * i * 2.4; g.beginPath(); g.moveTo(0, y); g.lineTo(BD_W, y); g.stroke(); }
  for (let i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(176 + i * 14, 176); g.lineTo(176 + i * 50, BD_H); g.stroke(); }
  g.strokeStyle = 'rgba(220,190,255,.6)'; g.lineWidth = 2;
  g.beginPath(); g.ellipse(176, 236, 120, 26, 0, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.ellipse(176, 236, 90, 18, 0, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 50; i++) { g.fillStyle = `rgba(230,210,255,${0.3 + r() * 0.6})`; g.fillRect(r() * BD_W, r() * 220, 2, 2); }
}

const cache = new Map<string, HTMLCanvasElement>();
export function backdrop(b: Backdrop): HTMLCanvasElement {
  const hit = cache.get(b);
  if (hit) return hit;
  const [c, g] = mkCanvas(BD_W, BD_H);
  g.imageSmoothingEnabled = true;
  ({ forest, cave, highland, arena, tower, snow, volcano, temple, grove })[b](g);
  cache.set(b, c);
  return c;
}
