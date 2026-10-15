/* ぺたぺた！あそびタウン — 共通ユーティリティ */
'use strict';
const PT = (window.PT = window.PT || {});

PT.W = 1600;
PT.H = 900;
PT.TAU = Math.PI * 2;

PT.rand = (a, b) => a + Math.random() * (b - a);
PT.irand = (a, b) => Math.floor(PT.rand(a, b + 1));
PT.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
PT.shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
PT.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
PT.lerp = (a, b, t) => a + (b - a) * t;
PT.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
PT.easeOut = (t) => 1 - Math.pow(1 - t, 3);
PT.easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
PT.easeBack = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
PT.now = () => performance.now();

/* ---------- 色 ---------- */
const _colorCache = new Map();
PT.shade = (hex, amt) => {
  const key = hex + amt;
  let v = _colorCache.get(key);
  if (v) return v;
  const c = parseInt(hex.slice(1), 16);
  let r = c >> 16, g = (c >> 8) & 255, b = c & 255;
  if (amt < 0) { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
  else { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  v = `rgb(${r | 0},${g | 0},${b | 0})`;
  _colorCache.set(key, v);
  return v;
};
PT.line = (hex) => PT.shade(hex, -0.48);

/* ---------- 描画ヘルパー ---------- */
const G = (PT.G = {});
G.rr = (c, x, y, w, h, r) => {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};
G.ell = (c, x, y, rx, ry, rot = 0) => {
  c.beginPath();
  c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, PT.TAU);
};
G.circ = (c, x, y, r) => { c.beginPath(); c.arc(x, y, Math.max(0.1, r), 0, PT.TAU); };
G.paint = (c, fill, stroke, lw = 3) => {
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
};
/* 塗り色から自動でふち線 */
G.fillO = (c, fill, lw = 3) => G.paint(c, fill, PT.line(fill), lw);
G.poly = (c, pts) => {
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath();
};
/* なめらかな閉曲線（点列を通る） */
G.blob = (c, pts) => {
  const n = pts.length / 2;
  c.beginPath();
  for (let i = 0; i < n; i++) {
    const x0 = pts[((i - 1 + n) % n) * 2], y0 = pts[((i - 1 + n) % n) * 2 + 1];
    const x1 = pts[i * 2], y1 = pts[i * 2 + 1];
    const x2 = pts[((i + 1) % n) * 2], y2 = pts[((i + 1) % n) * 2 + 1];
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    if (i === 0) c.moveTo((x0 + x1) / 2, (y0 + y1) / 2);
    c.quadraticCurveTo(x1, y1, mx, my);
  }
  c.closePath();
};
/* 手足など：ふち付きカプセル */
G.limb = (c, x1, y1, x2, y2, w, fill, stroke) => {
  c.lineCap = 'round';
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
  c.strokeStyle = stroke || PT.line(fill); c.lineWidth = w + 5; c.stroke();
  c.strokeStyle = fill; c.lineWidth = w; c.stroke();
};
G.star = (c, x, y, r1, r2, n = 5, rot = -Math.PI / 2) => {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1;
    const a = rot + (i * Math.PI) / n;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    if (i) c.lineTo(px, py); else c.moveTo(px, py);
  }
  c.closePath();
};
G.heart = (c, x, y, s) => {
  c.beginPath();
  c.moveTo(x, y + s * 0.35);
  c.bezierCurveTo(x - s * 1.1, y - s * 0.35, x - s * 0.45, y - s * 1.05, x, y - s * 0.45);
  c.bezierCurveTo(x + s * 0.45, y - s * 1.05, x + s * 1.1, y - s * 0.35, x, y + s * 0.35);
  c.closePath();
};
G.note = (c, x, y, s, col) => {
  c.fillStyle = col; c.strokeStyle = col; c.lineWidth = s * 0.18;
  G.ell(c, x, y, s * 0.42, s * 0.32, -0.4); c.fill();
  c.beginPath(); c.moveTo(x + s * 0.36, y - s * 0.1); c.lineTo(x + s * 0.36, y - s * 1.2);
  c.quadraticCurveTo(x + s * 0.8, y - s * 0.9, x + s * 0.9, y - s * 0.55); c.stroke();
};
G.shadow = (c, x, y, rx, a = 0.18) => {
  c.fillStyle = `rgba(40,50,80,${a})`;
  G.ell(c, x, y, rx, rx * 0.28); c.fill();
};
/* 木目・紙っぽいざらつき（背景用） */
G.speckle = (c, x, y, w, h, col, n, size = 2) => {
  c.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const px = x + Math.random() * w, py = y + Math.random() * h;
    c.beginPath(); c.arc(px, py, Math.random() * size + 0.5, 0, PT.TAU); c.fill();
  }
};
G.grad = (c, x0, y0, x1, y1, stops) => {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
};
G.rgrad = (c, x, y, r0, r1, stops) => {
  const g = c.createRadialGradient(x, y, r0, x, y, r1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
};

PT.FONT = '"M PLUS Rounded 1c","Hiragino Maru Gothic ProN","Kosugi Maru","Yu Gothic",system-ui,sans-serif';

/* 決まった乱数（背景を毎回同じ見た目にする） */
PT.seeded = (seed) => {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
};

/* 簡易イベント */
PT.bus = {
  h: {},
  on(n, f) { (this.h[n] = this.h[n] || []).push(f); },
  emit(n, ...a) { (this.h[n] || []).forEach((f) => f(...a)); },
};
