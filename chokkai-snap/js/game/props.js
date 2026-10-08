// ベクター小道具ライブラリ：フラットなイラスト調の背景・小物（絵文字の代わりに描く）
// drawProp(ctx, kind, x, y, s, opts)：(x, y) は足もと（下端中央）、s は高さの目安
const P = Math.PI;

function circ(ctx, x, y, r, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, P * 2); ctx.fill(); }
function ell(ctx, x, y, rx, ry, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, P * 2); ctx.fill(); }
function rrect(ctx, x, y, w, h, r, fill) {
  r = Math.min(r, w / 2, h / 2);
  ctx.fillStyle = fill; ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill();
}
function poly(ctx, pts, fill) { ctx.fillStyle = fill; ctx.beginPath(); for (let i = 0; i < pts.length; i += 2) (i ? ctx.lineTo : ctx.moveTo).call(ctx, pts[i], pts[i + 1]); ctx.closePath(); ctx.fill(); }
export function shade(hex, k) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return hex;
  let h = m[1]; if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
}
const shadow = (ctx, x, y, w) => ell(ctx, x, y, w, w * 0.22, 'rgba(0,0,0,.14)');

function wheel(ctx, x, y, r) { circ(ctx, x, y, r, '#2b2b2b'); circ(ctx, x, y, r * 0.5, '#bfc5cc'); }

export const PROPS = {
  tree(ctx, x, y, s, o) {
    const c = o.color || '#5bb03b';
    shadow(ctx, x, y, s * 0.3);
    rrect(ctx, x - s * 0.06, y - s * 0.5, s * 0.12, s * 0.5, s * 0.03, '#8a5a2e');
    poly(ctx, [x - s * 0.02, y - s * 0.35, x - s * 0.16, y - s * 0.55, x - s * 0.12, y - s * 0.57, x, y - s * 0.42], '#8a5a2e');
    circ(ctx, x - s * 0.17, y - s * 0.6, s * 0.22, shade(c, -0.18));
    circ(ctx, x + s * 0.17, y - s * 0.62, s * 0.22, shade(c, -0.1));
    circ(ctx, x, y - s * 0.74, s * 0.27, c);
    circ(ctx, x - s * 0.07, y - s * 0.82, s * 0.13, shade(c, 0.18));
    if (o.fruit) for (let i = 0; i < 7; i++) circ(ctx, x + Math.cos(i * 2.3) * s * 0.2, y - s * 0.68 + Math.sin(i * 1.7) * s * 0.14, s * 0.035, o.fruit);
  },
  pine(ctx, x, y, s, o) {
    const c = o.color || '#2f8a4c';
    shadow(ctx, x, y, s * 0.22);
    rrect(ctx, x - s * 0.05, y - s * 0.22, s * 0.1, s * 0.22, 2, '#7a4a26');
    for (let i = 0; i < 3; i++) {
      const by = y - s * 0.15 - i * s * 0.25, w = s * (0.32 - i * 0.07);
      poly(ctx, [x - w, by, x + w, by, x, by - s * 0.38], i % 2 ? c : shade(c, -0.12));
      poly(ctx, [x, by - s * 0.38, x + w, by, x + w * 0.2, by], shade(c, -0.25));
    }
  },
  palm(ctx, x, y, s) {
    ctx.strokeStyle = '#a0703a'; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + s * 0.12, y - s * 0.5, x + s * 0.05, y - s * 0.85); ctx.stroke();
    ctx.fillStyle = '#3fae4a';
    for (let i = 0; i < 6; i++) { const a = -P / 2 + (i - 2.5) * 0.6; ell(ctx, x + s * 0.05 + Math.cos(a) * s * 0.22, y - s * 0.85 + Math.sin(a) * s * 0.12 + s * 0.06, s * 0.24, s * 0.06, i % 2 ? '#3fae4a' : '#2e8f3c'); }
  },
  bush(ctx, x, y, s, o) {
    const c = o.color || '#4fa33a';
    circ(ctx, x - s * 0.35, y - s * 0.3, s * 0.32, shade(c, -0.15)); circ(ctx, x + s * 0.35, y - s * 0.3, s * 0.32, shade(c, -0.08));
    circ(ctx, x, y - s * 0.45, s * 0.42, c); ctx.fillStyle = c; ctx.fillRect(x - s * 0.65, y - s * 0.3, s * 1.3, s * 0.3);
    if (o.flower) for (let i = 0; i < 5; i++) circ(ctx, x + (i - 2) * s * 0.25, y - s * (0.35 + (i % 2) * 0.2), s * 0.06, o.flower);
  },
  flower(ctx, x, y, s, o) {
    const c = o.color || '#ff6fa8';
    ctx.strokeStyle = '#3c9a3c'; ctx.lineWidth = s * 0.08; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - s * 0.6); ctx.stroke();
    ell(ctx, x + s * 0.12, y - s * 0.25, s * 0.14, s * 0.06, '#4fae3c');
    for (let i = 0; i < 5; i++) { const a = i * P * 2 / 5; circ(ctx, x + Math.cos(a) * s * 0.17, y - s * 0.72 + Math.sin(a) * s * 0.17, s * 0.13, c); }
    circ(ctx, x, y - s * 0.72, s * 0.1, o.center || '#ffd23f');
  },
  tulip(ctx, x, y, s, o) {
    ctx.strokeStyle = '#3c9a3c'; ctx.lineWidth = s * 0.08; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - s * 0.55); ctx.stroke();
    const c = o.color || '#ff4d5e';
    poly(ctx, [x - s * 0.2, y - s * 0.55, x - s * 0.22, y - s * 0.92, x - s * 0.07, y - s * 0.75, x, y - s * 0.95, x + s * 0.07, y - s * 0.75, x + s * 0.22, y - s * 0.92, x + s * 0.2, y - s * 0.55], c);
  },
  pot(ctx, x, y, s) {
    poly(ctx, [x - s * 0.22, y - s * 0.35, x + s * 0.22, y - s * 0.35, x + s * 0.16, y, x - s * 0.16, y], '#c8643c');
    PROPS.bush(ctx, x, y - s * 0.32, s * 0.5, { color: '#3e9a43' });
  },
  cactus(ctx, x, y, s) {
    rrect(ctx, x - s * 0.1, y - s * 0.9, s * 0.2, s * 0.9, s * 0.1, '#3b9a4f');
    rrect(ctx, x - s * 0.35, y - s * 0.6, s * 0.14, s * 0.35, s * 0.07, '#3b9a4f'); rrect(ctx, x - s * 0.35, y - s * 0.32, s * 0.3, s * 0.12, s * 0.06, '#3b9a4f');
    rrect(ctx, x + s * 0.21, y - s * 0.75, s * 0.14, s * 0.35, s * 0.07, '#3b9a4f'); rrect(ctx, x + s * 0.05, y - s * 0.47, s * 0.3, s * 0.12, s * 0.06, '#3b9a4f');
  },
  mountain(ctx, x, y, s, o) {
    const c = o.color || '#3d6fa3';
    const w = s * (o.wide || 1.1);
    poly(ctx, [x - w, y, x, y - s, x + w, y], c);
    poly(ctx, [x, y - s, x + w, y, x + w * 0.15, y], shade(c, -0.18));
    ctx.strokeStyle = shade(c, -0.3); ctx.lineWidth = s * 0.015;
    ctx.beginPath(); ctx.moveTo(x - w * 0.1, y - s * 0.75); ctx.lineTo(x - w * 0.25, y - s * 0.45); ctx.moveTo(x + w * 0.05, y - s * 0.7); ctx.lineTo(x + w * 0.15, y - s * 0.35); ctx.stroke();
    if (o.snow) poly(ctx, [x - w * 0.2, y - s * 0.8, x, y - s, x + w * 0.2, y - s * 0.8, x + w * 0.08, y - s * 0.84, x, y - s * 0.78, x - w * 0.08, y - s * 0.84], '#f4f8ff');
  },
  hill(ctx, x, y, s, o) { const c = o.color || '#4f9e3c'; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, s * (o.wide || 2), s, 0, P, 0); ctx.fill(); ctx.fillStyle = shade(c, 0.1); ctx.beginPath(); ctx.ellipse(x - s * 0.4, y, s * (o.wide || 2) * 0.6, s * 0.75, 0, P, 0); ctx.fill(); },
  cloud(ctx, x, y, s) {
    const c = '#ffffff';
    rrect(ctx, x - s * 1.1, y - s * 0.45, s * 2.2, s * 0.45, s * 0.22, c);
    circ(ctx, x - s * 0.45, y - s * 0.45, s * 0.35, c); circ(ctx, x + s * 0.2, y - s * 0.55, s * 0.45, c); circ(ctx, x + s * 0.75, y - s * 0.35, s * 0.28, c);
    ctx.fillStyle = 'rgba(180,200,230,.35)'; ctx.fillRect(x - s * 1.0, y - s * 0.1, s * 2.0, s * 0.1);
  },
  sun(ctx, x, y, s) { circ(ctx, x, y - s / 2, s * 0.32, '#ffd23f'); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = s * 0.05; for (let i = 0; i < 10; i++) { const a = i * P / 5; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * s * 0.4, y - s / 2 + Math.sin(a) * s * 0.4); ctx.lineTo(x + Math.cos(a) * s * 0.5, y - s / 2 + Math.sin(a) * s * 0.5); ctx.stroke(); } },
  house(ctx, x, y, s, o) {
    const c = o.color || '#f2e2c4', r = o.roof || '#c9503c', w = s * 1.1;
    shadow(ctx, x, y, w * 0.6);
    ctx.fillStyle = c; ctx.fillRect(x - w / 2, y - s * 0.6, w, s * 0.6);
    poly(ctx, [x - w * 0.6, y - s * 0.58, x, y - s, x + w * 0.6, y - s * 0.58], r);
    rrect(ctx, x - s * 0.1, y - s * 0.32, s * 0.2, s * 0.32, 3, '#8a5a32');
    for (const dx of [-0.32, 0.32]) { rrect(ctx, x + dx * w - s * 0.1, y - s * 0.48, s * 0.2, s * 0.17, 2, '#8fd0f0'); ctx.fillStyle = '#fff'; ctx.fillRect(x + dx * w - s * 0.005, y - s * 0.48, s * 0.01, s * 0.17); }
  },
  car(ctx, x, y, s, o) {
    const c = o.color || '#e2463c', w = s * 2;
    shadow(ctx, x, y, w * 0.45);
    rrect(ctx, x - w / 2, y - s * 0.62, w, s * 0.42, s * 0.14, c);
    poly(ctx, [x - w * 0.3, y - s * 0.6, x - w * 0.18, y - s, x + w * 0.2, y - s, x + w * 0.32, y - s * 0.6], c);
    poly(ctx, [x - w * 0.25, y - s * 0.62, x - w * 0.16, y - s * 0.92, x - w * 0.02, y - s * 0.92, x - w * 0.02, y - s * 0.62], '#bfe6ff');
    poly(ctx, [x + w * 0.02, y - s * 0.62, x + w * 0.02, y - s * 0.92, x + w * 0.17, y - s * 0.92, x + w * 0.26, y - s * 0.62], '#bfe6ff');
    rrect(ctx, x + w * 0.42, y - s * 0.52, w * 0.07, s * 0.1, 2, '#ffe680');
    if (o.police) { ctx.fillStyle = '#fff'; ctx.fillRect(x - w / 2, y - s * 0.48, w, s * 0.12); circ(ctx, x, y - s * 1.04, s * 0.07, '#ff3030'); }
    wheel(ctx, x - w * 0.3, y - s * 0.18, s * 0.18); wheel(ctx, x + w * 0.3, y - s * 0.18, s * 0.18);
  },
  bus(ctx, x, y, s, o) {
    const c = o.color || '#f2a83a', w = s * 3;
    shadow(ctx, x, y, w * 0.45);
    rrect(ctx, x - w / 2, y - s, w, s * 0.82, s * 0.16, c);
    ctx.fillStyle = shade(c, -0.25); ctx.fillRect(x - w / 2, y - s * 0.32, w, s * 0.08);
    for (let i = 0; i < 5; i++) rrect(ctx, x - w / 2 + s * 0.15 + i * w * 0.18, y - s * 0.88, w * 0.14, s * 0.32, 4, '#bfe6ff');
    wheel(ctx, x - w * 0.32, y - s * 0.18, s * 0.17); wheel(ctx, x + w * 0.32, y - s * 0.18, s * 0.17);
  },
  truck(ctx, x, y, s, o) {
    const c = o.color || '#4a8ad8', w = s * 2.4;
    shadow(ctx, x, y, w * 0.45);
    rrect(ctx, x - w / 2, y - s, w * 0.65, s * 0.8, 6, '#eeeeee');
    rrect(ctx, x + w * 0.17, y - s * 0.75, w * 0.33, s * 0.55, 8, c);
    rrect(ctx, x + w * 0.3, y - s * 0.7, w * 0.15, s * 0.22, 3, '#bfe6ff');
    wheel(ctx, x - w * 0.3, y - s * 0.18, s * 0.17); wheel(ctx, x + w * 0.32, y - s * 0.18, s * 0.17);
  },
  bike(ctx, x, y, s, o) {
    ctx.strokeStyle = o.color || '#2a7ad8'; ctx.lineWidth = s * 0.06;
    ctx.beginPath(); ctx.arc(x - s * 0.4, y - s * 0.3, s * 0.28, 0, P * 2); ctx.arc(x + s * 0.4, y - s * 0.3, s * 0.28, 0, P * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - s * 0.4, y - s * 0.3); ctx.lineTo(x - s * 0.05, y - s * 0.65); ctx.lineTo(x + s * 0.4, y - s * 0.3); ctx.lineTo(x + s * 0.25, y - s * 0.8); ctx.moveTo(x - s * 0.05, y - s * 0.65); ctx.lineTo(x - s * 0.1, y - s * 0.78); ctx.stroke();
  },
  tent(ctx, x, y, s, o) {
    const c = o.color || '#f2c43a', w = s * 1.2;
    shadow(ctx, x, y, w * 0.6);
    poly(ctx, [x - w * 0.6, y, x, y - s, x + w * 0.6, y], c);
    poly(ctx, [x, y - s, x + w * 0.6, y, x + w * 0.1, y], shade(c, -0.15));
    poly(ctx, [x - w * 0.16, y, x, y - s * 0.55, x + w * 0.16, y], shade(c, -0.4));
  },
  dome(ctx, x, y, s, o) {
    const c = o.color || '#3a8ad8';
    shadow(ctx, x, y, s * 0.8);
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, s * 0.85, s, 0, P, 0); ctx.fill();
    ctx.strokeStyle = shade(c, -0.3); ctx.lineWidth = s * 0.03; ctx.beginPath(); ctx.ellipse(x, y, s * 0.4, s, 0, P, 0); ctx.stroke();
    ctx.fillStyle = shade(c, -0.45); ctx.beginPath(); ctx.ellipse(x + s * 0.1, y, s * 0.22, s * 0.45, 0, P, 0); ctx.fill();
  },
  bench(ctx, x, y, s, o) {
    const c = o.color || '#b77a3e', w = s * 1.8;
    ctx.fillStyle = '#555'; ctx.fillRect(x - w * 0.42, y - s * 0.45, s * 0.06, s * 0.45); ctx.fillRect(x + w * 0.38, y - s * 0.45, s * 0.06, s * 0.45);
    rrect(ctx, x - w / 2, y - s * 0.5, w, s * 0.12, 3, c); rrect(ctx, x - w / 2, y - s * 0.9, w, s * 0.12, 3, c); rrect(ctx, x - w / 2, y - s * 0.72, w, s * 0.12, 3, shade(c, -0.1));
  },
  lamp(ctx, x, y, s) {
    ctx.fillStyle = '#5a6068'; ctx.fillRect(x - s * 0.03, y - s, s * 0.06, s);
    rrect(ctx, x - s * 0.1, y - s * 1.08, s * 0.2, s * 0.12, 4, '#5a6068'); ell(ctx, x, y - s * 0.97, s * 0.07, s * 0.04, '#fff4b0');
    rrect(ctx, x - s * 0.08, y - s * 0.04, s * 0.16, s * 0.04, 2, '#5a6068');
  },
  signpost(ctx, x, y, s, o) {
    ctx.fillStyle = '#8a5a32'; ctx.fillRect(x - s * 0.04, y - s, s * 0.08, s);
    rrect(ctx, x - s * 0.4, y - s, s * 0.8, s * 0.32, 4, o.color || '#f4e3b8');
    if (o.text) { ctx.fillStyle = '#5a3a20'; ctx.font = `bold ${s * 0.18}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.text, x, y - s * 0.84); }
  },
  table(ctx, x, y, s, o) {
    const c = o.color || '#b77a3e', w = s * 1.8;
    shadow(ctx, x, y, w * 0.5);
    ctx.fillStyle = shade(c, -0.25); ctx.fillRect(x - w * 0.4, y - s * 0.6, s * 0.08, s * 0.6); ctx.fillRect(x + w * 0.36, y - s * 0.6, s * 0.08, s * 0.6);
    rrect(ctx, x - w / 2, y - s * 0.72, w, s * 0.16, 4, c);
    if (o.cloth) { ctx.fillStyle = o.cloth; ctx.fillRect(x - w * 0.45, y - s * 0.72, w * 0.9, s * 0.1); }
  },
  parasol(ctx, x, y, s, o) {
    ctx.fillStyle = '#ddd'; ctx.fillRect(x - s * 0.025, y - s, s * 0.05, s);
    const c = o.color || '#ff5a5a';
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y - s * 0.95, s * 0.6, s * 0.3, 0, P, 0); ctx.fill();
    ctx.fillStyle = '#fff'; for (let i = -1; i <= 1; i += 2) { ctx.beginPath(); ctx.moveTo(x, y - s * 1.25); ctx.lineTo(x + i * s * 0.2, y - s * 0.95); ctx.lineTo(x + i * s * 0.38, y - s * 0.95); ctx.closePath(); ctx.fill(); }
  },
  rock(ctx, x, y, s, o) { const c = o.color || '#9aa0a6'; ell(ctx, x, y - s * 0.35, s * 0.6, s * 0.4, c); ell(ctx, x - s * 0.15, y - s * 0.48, s * 0.3, s * 0.18, shade(c, 0.2)); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x - s * 0.6, y - s * 0.06, s * 1.2, s * 0.06); },
  logs(ctx, x, y, s) { for (let r = 0; r < 3; r++) for (let i = 0; i <= 2 - r; i++) { const cx = x + (i - (2 - r) / 2) * s * 0.36, cy = y - s * 0.18 - r * s * 0.3; circ(ctx, cx, cy, s * 0.18, '#a8703c'); circ(ctx, cx, cy, s * 0.1, '#e0b07a'); } },
  campfire(ctx, x, y, s) {
    ctx.strokeStyle = '#7a4a26'; ctx.lineWidth = s * 0.12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - s * 0.4, y - s * 0.05); ctx.lineTo(x + s * 0.4, y - s * 0.2); ctx.moveTo(x + s * 0.4, y - s * 0.05); ctx.lineTo(x - s * 0.4, y - s * 0.2); ctx.stroke();
    const t = performance.now() / 120;
    poly(ctx, [x - s * 0.28, y - s * 0.15, x - s * 0.1, y - s * (0.8 + Math.sin(t) * 0.05), x, y - s * 0.5, x + s * 0.1, y - s * (0.9 + Math.cos(t) * 0.06), x + s * 0.28, y - s * 0.15], '#ff8a2a');
    poly(ctx, [x - s * 0.14, y - s * 0.15, x, y - s * (0.55 + Math.sin(t * 1.3) * 0.05), x + s * 0.14, y - s * 0.15], '#ffd23f');
  },
  vending(ctx, x, y, s, o) {
    const c = o.color || '#e2463c', w = s * 0.6;
    rrect(ctx, x - w / 2, y - s, w, s, 6, c);
    rrect(ctx, x - w * 0.4, y - s * 0.9, w * 0.8, s * 0.45, 3, '#e8f4ff');
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) rrect(ctx, x - w * 0.36 + i * w * 0.19, y - s * 0.86 + r * s * 0.14, w * 0.13, s * 0.1, 2, ['#3a8ad8', '#f2c43a', '#5bb03b', '#ff6fa8'][(i + r) % 4]);
    rrect(ctx, x - w * 0.35, y - s * 0.22, w * 0.7, s * 0.1, 3, '#333');
  },
  trash(ctx, x, y, s, o) { const c = o.color || '#7a8a96'; poly(ctx, [x - s * 0.3, y - s * 0.85, x + s * 0.3, y - s * 0.85, x + s * 0.24, y, x - s * 0.24, y], c); rrect(ctx, x - s * 0.34, y - s * 0.95, s * 0.68, s * 0.12, 3, shade(c, -0.2)); ctx.fillStyle = shade(c, -0.12); for (let i = -1; i <= 1; i++) ctx.fillRect(x + i * s * 0.12 - s * 0.02, y - s * 0.75, s * 0.04, s * 0.6); },
  mailbox(ctx, x, y, s) { ctx.fillStyle = '#555'; ctx.fillRect(x - s * 0.05, y - s * 0.4, s * 0.1, s * 0.4); rrect(ctx, x - s * 0.22, y - s, s * 0.44, s * 0.62, s * 0.2, '#e2343c'); ctx.fillStyle = '#222'; ctx.fillRect(x - s * 0.12, y - s * 0.82, s * 0.24, s * 0.04); },
  fountain(ctx, x, y, s) { ell(ctx, x, y - s * 0.12, s, s * 0.22, '#9aa0a6'); ell(ctx, x, y - s * 0.16, s * 0.85, s * 0.15, '#6ec6f0'); rrect(ctx, x - s * 0.1, y - s * 0.6, s * 0.2, s * 0.45, 4, '#b8bec4'); for (let i = -1; i <= 1; i++) { ctx.strokeStyle = 'rgba(110,198,240,.9)'; ctx.lineWidth = s * 0.05; ctx.beginPath(); ctx.moveTo(x, y - s * 0.65); ctx.quadraticCurveTo(x + i * s * 0.3, y - s * 0.95, x + i * s * 0.5, y - s * 0.2); ctx.stroke(); } },
  ferris(ctx, x, y, s) {
    const cy = y - s * 0.55, r = s * 0.45;
    ctx.strokeStyle = '#7a8aa6'; ctx.lineWidth = s * 0.03;
    ctx.beginPath(); ctx.moveTo(x - s * 0.3, y); ctx.lineTo(x, cy); ctx.lineTo(x + s * 0.3, y); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, cy, r, 0, P * 2); ctx.stroke();
    const t = performance.now() / 6000;
    for (let i = 0; i < 8; i++) { const a = t + i * P / 4; ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke(); rrect(ctx, x + Math.cos(a) * r - s * 0.06, cy + Math.sin(a) * r, s * 0.12, s * 0.1, 3, ['#ff5a5a', '#f2c43a', '#3a8ad8', '#5bb03b'][i % 4]); }
  },
  boat(ctx, x, y, s, o) { const c = o.color || '#e2463c'; poly(ctx, [x - s, y - s * 0.4, x + s, y - s * 0.4, x + s * 0.75, y, x - s * 0.75, y], c); ctx.fillStyle = '#fff'; ctx.fillRect(x - s * 0.95, y - s * 0.4, s * 1.9, s * 0.08); },
  grass(ctx, x, y, s, o) { ctx.strokeStyle = o.color || '#3e8f34'; ctx.lineWidth = s * 0.1; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = -2; i <= 2; i++) { ctx.moveTo(x + i * s * 0.12, y); ctx.lineTo(x + i * s * 0.2, y - s * (0.6 + (i % 2 ? 0 : 0.3))); } ctx.stroke(); },
  fence(ctx, x, y, s, o) { const w = s * 2; ctx.fillStyle = o.color || '#e8d6b0'; for (let i = 0; i < 6; i++) rrect(ctx, x - w / 2 + i * w / 5.5, y - s, s * 0.12, s, 3, ctx.fillStyle); ctx.fillRect(x - w / 2, y - s * 0.75, w, s * 0.1); ctx.fillRect(x - w / 2, y - s * 0.35, w, s * 0.1); },
  // ── 室内 ──
  chabudai(ctx, x, y, s, o) {
    const w = o.w || s * 3, c = o.color || '#9a5a2e';
    shadow(ctx, x, y + s * 0.05, w * 0.45);
    ctx.fillStyle = shade(c, -0.35); for (const dx of [-0.42, 0.42]) ctx.fillRect(x + dx * w - s * 0.05, y - s * 0.5, s * 0.1, s * 0.5);
    ctx.fillStyle = shade(c, -0.2); ctx.beginPath(); ctx.ellipse(x, y - s * 0.5, w / 2, s * 0.32, 0, 0, P * 2); ctx.fill();
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y - s * 0.6, w / 2, s * 0.32, 0, 0, P * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(x - w * 0.12, y - s * 0.68, w * 0.28, s * 0.12, 0, 0, P * 2); ctx.fill();
  },
  tvset(ctx, x, y, s, o) {
    const w = o.w || s * 1.6;
    rrect(ctx, x - w / 2, y - s * 0.32, w, s * 0.32, 6, o.cabinet || '#c9443c');
    ctx.fillStyle = shade(o.cabinet || '#c9443c', -0.25); ctx.fillRect(x - w / 2 + 8, y - s * 0.2, w - 16, 4);
    rrect(ctx, x - w * 0.42, y - s * 1.0, w * 0.84, s * 0.64, 10, '#3a3a40');
    rrect(ctx, x - w * 0.38, y - s * 0.96, w * 0.76, s * 0.54, 6, o.on ? (o.screen || '#3a7aa8') : '#1e2024');
    if (!o.on) { ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(x - w * 0.3, y - s * 0.5); ctx.lineTo(x - w * 0.1, y - s * 0.94); ctx.lineTo(x, y - s * 0.94); ctx.lineTo(x - w * 0.2, y - s * 0.5); ctx.fill(); }
    if (o.on && o.text) { ctx.fillStyle = '#fff'; ctx.font = `900 ${s * 0.12}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.text, x, y - s * 0.69, w * 0.7); ctx.font = `${s * 0.16}px sans-serif`; ctx.fillText('☃', x + w * 0.28, y - s * 0.86); }
  },
  roomwindow(ctx, x, y, s, o) {
    const w = o.w || s * 1.3, h = s;
    rrect(ctx, x - w / 2 - 10, y - h - 10, w + 20, h + 20, 8, '#e8d2a8');
    const g = ctx.createLinearGradient(0, y - h, 0, y);
    if (o.open) { g.addColorStop(0, '#1a2448'); g.addColorStop(1, '#3a4a7a'); } else { g.addColorStop(0, '#24345e'); g.addColorStop(1, '#5a6a9a'); }
    ctx.fillStyle = g; ctx.fillRect(x - w / 2, y - h, w, h);
    circ(ctx, x + w * 0.28, y - h * 0.72, h * 0.08, '#fff6c8');
    for (let i = 0; i < 6; i++) circ(ctx, x - w * 0.4 + ((i * 37) % 10) * w * 0.08, y - h * (0.85 - (i * 13 % 5) * 0.08), 2, '#fff');
    ctx.fillStyle = '#2a3050'; ctx.beginPath(); ctx.moveTo(x - w / 2, y - h * 0.18); for (let i = 0; i <= 8; i++) ctx.lineTo(x - w / 2 + i * w / 8, y - h * (0.18 + (i % 2) * 0.1)); ctx.lineTo(x + w / 2, y); ctx.lineTo(x - w / 2, y); ctx.fill();
    if (!o.open) { ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x - w / 2, y - h, w, h); ctx.fillStyle = '#e8d2a8'; ctx.fillRect(x - 5, y - h, 10, h); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.moveTo(x - w * 0.4, y - h * 0.3); ctx.lineTo(x - w * 0.2, y - h * 0.9); ctx.lineTo(x - w * 0.12, y - h * 0.9); ctx.lineTo(x - w * 0.32, y - h * 0.3); ctx.fill(); }
    else { ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x + w * 0.05, y - h, w * 0.45, h); ctx.fillStyle = '#e8d2a8'; ctx.fillRect(x + w * 0.05, y - h, 8, h); }
    // カーテン
    ctx.fillStyle = o.curtain || '#e86a5a';
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + sd * (w / 2 + 14), y - h - 14); ctx.lineTo(x + sd * (w / 2 - w * 0.12), y - h - 14); ctx.quadraticCurveTo(x + sd * (w / 2 - w * 0.02), y - h * 0.5, x + sd * (w / 2 - w * 0.1), y + 8); ctx.lineTo(x + sd * (w / 2 + 14), y + 8); ctx.closePath(); ctx.fill(); }
    rrect(ctx, x - w / 2 - 24, y - h - 24, w + 48, 12, 6, '#8a5a32');
  },
  cabinet(ctx, x, y, s, o) {
    const w = o.w || s * 1.4, c = o.color || '#a8703c';
    rrect(ctx, x - w / 2, y - s, w, s, 6, c);
    ctx.fillStyle = shade(c, -0.2); ctx.fillRect(x - w / 2 + 6, y - s * 0.52, w - 12, 4);
    for (const dx of [-0.25, 0.25]) { rrect(ctx, x + dx * w - w * 0.2, y - s * 0.46, w * 0.4, s * 0.4, 4, shade(c, 0.08)); circ(ctx, x + dx * w + (dx < 0 ? w * 0.15 : -w * 0.15), y - s * 0.26, 4, '#e0b060'); }
    rrect(ctx, x - w * 0.45, y - s * 0.94, w * 0.9, s * 0.36, 4, '#cfe4f0');
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(x - w * 0.4, y - s * 0.9, w * 0.08, s * 0.3);
    for (let i = 0; i < 5; i++) rrect(ctx, x - w * 0.38 + i * w * 0.16, y - s * 0.84, w * 0.1, s * 0.22, 3, ['#fff', '#e0e8f0', '#f4d8c0', '#fff', '#d8e8d0'][i]);
  },
  hanglamp(ctx, x, y, s, o) {
    ctx.strokeStyle = '#444'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y - s * 0.5); ctx.stroke();
    ctx.fillStyle = 'rgba(255,240,180,.18)'; ctx.beginPath(); ctx.moveTo(x - s * 0.5, y); ctx.lineTo(x - s * 2.2, y + s * 4); ctx.lineTo(x + s * 2.2, y + s * 4); ctx.lineTo(x + s * 0.5, y); ctx.fill();
    poly(ctx, [x - s * 0.15, y - s * 0.5, x + s * 0.15, y - s * 0.5, x + s * 0.55, y, x - s * 0.55, y], o.color || '#f2e6c8');
    ell(ctx, x, y, s * 0.55, s * 0.08, '#fff8d0');
  },
  fusuma(ctx, x, y, s, o) {
    const w = o.w || s * 1.6, n = o.n || 2, pw = w / n;
    for (let i = 0; i < n; i++) {
      const px = x - w / 2 + i * pw;
      rrect(ctx, px, y - s, pw, s, 2, '#7a5a3a'); rrect(ctx, px + 8, y - s + 8, pw - 16, s - 16, 2, o.color || '#f4ecd6');
      ell(ctx, px + (i % 2 ? 22 : pw - 22), y - s * 0.5, 7, 14, '#7a5a3a');
      if (o.art) { ctx.fillStyle = 'rgba(120,150,190,.35)'; ctx.beginPath(); ctx.moveTo(px + 10, y - s * 0.3); ctx.quadraticCurveTo(px + pw * 0.4, y - s * 0.55 - i * 20, px + pw - 10, y - s * 0.35); ctx.lineTo(px + pw - 10, y - 10); ctx.lineTo(px + 10, y - 10); ctx.fill(); }
    }
  },
  wallclock(ctx, x, y, s) { circ(ctx, x, y - s / 2, s * 0.5, '#8a5a32'); circ(ctx, x, y - s / 2, s * 0.42, '#fffaf0'); ctx.strokeStyle = '#333'; ctx.lineWidth = s * 0.05; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y - s / 2); ctx.lineTo(x, y - s * 0.78); ctx.moveTo(x, y - s / 2); ctx.lineTo(x + s * 0.2, y - s * 0.42); ctx.stroke(); },
  cushion(ctx, x, y, s, o) { const c = o.color || '#c84a5a'; ell(ctx, x, y - s * 0.15, s * 0.7, s * 0.18, shade(c, -0.25)); ell(ctx, x, y - s * 0.22, s * 0.7, s * 0.18, c); },
  calendar(ctx, x, y, s, o) { rrect(ctx, x - s * 0.35, y - s, s * 0.7, s, 4, '#fff'); ctx.fillStyle = '#e04848'; ctx.fillRect(x - s * 0.35, y - s, s * 0.7, s * 0.25); ctx.fillStyle = '#fff'; ctx.font = `900 ${s * 0.16}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.text || '12', x, y - s * 0.87); ctx.fillStyle = '#999'; for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 5; c2++) ctx.fillRect(x - s * 0.27 + c2 * s * 0.12, y - s * 0.62 + r * s * 0.14, s * 0.07, s * 0.07); },
  stove(ctx, x, y, s, o) {
    rrect(ctx, x - s * 0.8, y - s * 0.35, s * 1.6, s * 0.35, 6, '#e8e4dc');
    ctx.fillStyle = '#3a3a40'; ctx.fillRect(x - s * 0.8, y - s * 0.38, s * 1.6, s * 0.06);
    rrect(ctx, x - s * 0.7, y - s * 0.28, s * 0.5, s * 0.2, 4, '#c9443c');
  },
  // 動物（actor の絵文字の置き換え）
  cat(ctx, x, y, s, o) {
    const c = o.color || '#f0a040', d = shade(c, -0.35);
    ctx.strokeStyle = c; ctx.lineWidth = s * 0.09; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - s * 0.35, y - s * 0.3); ctx.quadraticCurveTo(x - s * 0.62, y - s * 0.45, x - s * 0.5, y - s * 0.75); ctx.stroke();
    ell(ctx, x - s * 0.08, y - s * 0.28, s * 0.34, s * 0.24, c);
    ctx.fillStyle = c; ctx.fillRect(x - s * 0.3, y - s * 0.12, s * 0.1, s * 0.12); ctx.fillRect(x + s * 0.12, y - s * 0.12, s * 0.1, s * 0.12);
    circ(ctx, x + s * 0.25, y - s * 0.55, s * 0.22, c);
    poly(ctx, [x + s * 0.08, y - s * 0.66, x + s * 0.1, y - s * 0.9, x + s * 0.24, y - s * 0.74], c);
    poly(ctx, [x + s * 0.26, y - s * 0.74, x + s * 0.4, y - s * 0.9, x + s * 0.43, y - s * 0.66], c);
    if (o.stripes !== false && c !== '#2a2a2a') { ctx.strokeStyle = d; ctx.lineWidth = s * 0.04; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x - s * 0.25 + i * s * 0.14, y - s * 0.48); ctx.lineTo(x - s * 0.2 + i * s * 0.14, y - s * 0.36); ctx.stroke(); } }
    ell(ctx, x + s * 0.2, y - s * 0.57, s * 0.06, s * 0.08, '#fff'); ell(ctx, x + s * 0.34, y - s * 0.57, s * 0.06, s * 0.08, '#fff');
    circ(ctx, x + s * 0.22, y - s * 0.56, s * 0.035, '#111'); circ(ctx, x + s * 0.36, y - s * 0.56, s * 0.035, '#111');
    circ(ctx, x + s * 0.29, y - s * 0.47, s * 0.025, '#ff8a9a');
  },
  dog(ctx, x, y, s, o) {
    const c = o.color || '#d8a868', d = shade(c, -0.3);
    ell(ctx, x - s * 0.08, y - s * 0.32, s * 0.36, s * 0.22, c);
    ctx.fillStyle = c; for (const dx of [-0.32, -0.18, 0.06, 0.18]) ctx.fillRect(x + dx * s, y - s * 0.18, s * 0.09, s * 0.18);
    ctx.strokeStyle = c; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - s * 0.4, y - s * 0.38); ctx.lineTo(x - s * 0.55, y - s * 0.6); ctx.stroke();
    circ(ctx, x + s * 0.28, y - s * 0.55, s * 0.2, c);
    ell(ctx, x + s * 0.45, y - s * 0.5, s * 0.12, s * 0.08, shade(c, 0.25)); circ(ctx, x + s * 0.55, y - s * 0.52, s * 0.035, '#222');
    ell(ctx, x + s * 0.16, y - s * 0.55, s * 0.08, s * 0.17, d);
    circ(ctx, x + s * 0.32, y - s * 0.6, s * 0.035, '#111');
  },
  bird(ctx, x, y, s, o) {
    const c = o.color || '#8a9aa8';
    ell(ctx, x, y - s * 0.35, s * 0.3, s * 0.22, c); circ(ctx, x + s * 0.24, y - s * 0.55, s * 0.15, c);
    poly(ctx, [x + s * 0.38, y - s * 0.57, x + s * 0.52, y - s * 0.52, x + s * 0.38, y - s * 0.49], '#f2a83a');
    ell(ctx, x - s * 0.06, y - s * 0.38, s * 0.18, s * 0.1, shade(c, -0.2));
    poly(ctx, [x - s * 0.25, y - s * 0.35, x - s * 0.45, y - s * 0.45, x - s * 0.42, y - s * 0.3], shade(c, -0.25));
    circ(ctx, x + s * 0.28, y - s * 0.58, s * 0.03, '#111');
    ctx.strokeStyle = '#d8823a'; ctx.lineWidth = s * 0.03; ctx.beginPath(); ctx.moveTo(x - s * 0.05, y - s * 0.15); ctx.lineTo(x - s * 0.05, y); ctx.moveTo(x + s * 0.06, y - s * 0.15); ctx.lineTo(x + s * 0.06, y); ctx.stroke();
  },
};

// 絵文字 → ベクター小道具の対応（シーン・オブジェクト・動物 actor を自動でイラスト化する）
export const EMOJI_PROPS = {
  '🌳': ['tree', {}], '🌲': ['pine', {}], '🎄': ['pine', {}], '🌴': ['palm', {}], '🌿': ['bush', { color: '#4fa33a' }], '🌱': ['grass', {}], '☘️': ['grass', {}], '🍀': ['grass', {}],
  '🪴': ['pot', {}], '🌸': ['flower', { color: '#ffa8c8' }], '🌼': ['flower', { color: '#ffe066', center: '#f29a2a' }], '🌻': ['flower', { color: '#ffcc22', center: '#7a4a1a' }],
  '🌷': ['tulip', { color: '#ff4d6d' }], '🌺': ['flower', { color: '#ff4d5e' }], '🌹': ['tulip', { color: '#d8203a' }], '💐': ['bush', { color: '#4fa33a', flower: '#ff6fa8' }],
  '🌵': ['cactus', {}], '☁️': ['cloud', {}], '☀️': ['sun', {}], '🏔️': ['mountain', { snow: true }], '⛰️': ['mountain', { color: '#5a8a4a' }], '🗻': ['mountain', { snow: true, color: '#4a6ea8' }],
  '🏠': ['house', {}], '🏡': ['house', { roof: '#3a7ac8' }], '🚗': ['car', {}], '🚙': ['car', { color: '#3a7ad8' }], '🚕': ['car', { color: '#f2c43a' }], '🚓': ['car', { color: '#333', police: true }],
  '🚌': ['bus', {}], '🚚': ['truck', {}], '🚐': ['truck', { color: '#eee' }], '🚲': ['bike', {}], '⛺': ['tent', {}], '🪨': ['rock', {}], '🗑️': ['trash', {}], '🪵': ['logs', {}],
  '⛲': ['fountain', {}], '🎡': ['ferris', {}], '🛶': ['boat', { color: '#c8643c' }], '🚣': ['boat', {}], '📮': ['mailbox', {}], '🔥': ['campfire', {}], '⛱️': ['parasol', {}], '🏖️': ['parasol', {}],
  '🐈': ['cat', { color: '#f0a040' }], '🐈‍⬛': ['cat', { color: '#2a2a2a', stripes: false }], '🐱': ['cat', { color: '#f0a040' }], '🐕': ['dog', {}], '🐶': ['dog', {}], '🐕‍🦺': ['dog', {}], '🐩': ['dog', { color: '#f4f0ea' }],
  '🐦': ['bird', {}], '🕊️': ['bird', { color: '#c8ccd2' }], '🐤': ['bird', { color: '#ffd23f' }],
};
// 中心座標・サイズ s（絵文字の大きさ）で描く。対応がなければ false
export function drawEmojiProp(ctx, e, cx, cy, size, flip) {
  const m = EMOJI_PROPS[e];
  if (!m) return false;
  const [kind, o] = m;
  const fn = PROPS[kind];
  // 横長の物は幅に合わせて高さを縮める
  const wide = { car: 2, bus: 3, truck: 2.4, bench: 1.8, table: 1.8, cloud: 2.2, mountain: 2.2, boat: 2, bike: 1.4, fence: 2, hill: 4 }[kind] || 1;
  const s = size / Math.max(1, wide * 0.75);
  ctx.save();
  ctx.translate(cx, cy + size / 2);
  if (flip) ctx.scale(-1, 1);
  fn(ctx, 0, 0, kind === 'cloud' ? s * 0.8 : s, o);
  ctx.restore();
  return true;
}
