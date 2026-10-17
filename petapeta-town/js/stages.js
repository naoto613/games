/* ステージ定義・背景・ステージ固有の遊具（フィクスチャ） */
'use strict';
(() => {
  const G = PT.G;
  const W = PT.W, H = PT.H;

  /* ---------- 背景パーツ ---------- */
  const B = (PT.BG = {});
  B.sky = (c, top, bot, y1 = H) => { c.fillStyle = G.grad(c, 0, 0, 0, y1, [[0, top], [1, bot]]); c.fillRect(0, 0, W, y1); };
  B.cloud = (c, x, y, s, col = '#ffffff') => {
    c.fillStyle = col;
    c.beginPath();
    [[0, 0, 34], [36, -14, 40], [76, 0, 32], [40, 10, 34]].forEach(([dx, dy, r]) => { c.moveTo(x + dx * s + r * s, y + dy * s); c.arc(x + dx * s, y + dy * s, r * s, 0, PT.TAU); });
    c.fill();
  };
  B.tree = (c, x, y, s, col = '#6dbb5f', trunk = '#9a6b42') => {
    G.rr(c, x - 9 * s, y - 70 * s, 18 * s, 72 * s, 6 * s); G.fillO(c, trunk, 3);
    G.blob(c, [x - 60 * s, y - 90 * s, x - 50 * s, y - 150 * s, x, y - 185 * s, x + 50 * s, y - 150 * s, x + 60 * s, y - 90 * s, x, y - 62 * s]);
    G.fillO(c, col, 3);
    c.fillStyle = PT.shade(col, 0.18);
    G.ell(c, x - 18 * s, y - 140 * s, 18 * s, 13 * s); c.fill();
    G.ell(c, x + 22 * s, y - 112 * s, 14 * s, 10 * s); c.fill();
  };
  B.pine = (c, x, y, s, col = '#3f8a5c') => {
    G.rr(c, x - 7 * s, y - 30 * s, 14 * s, 32 * s, 4); G.fillO(c, '#7a5232', 3);
    for (let i = 0; i < 3; i++) { G.poly(c, [x - (60 - i * 14) * s, y - (26 + i * 44) * s, x, y - (110 + i * 44) * s, x + (60 - i * 14) * s, y - (26 + i * 44) * s]); G.fillO(c, PT.shade(col, i * 0.08), 3); }
  };
  B.bush = (c, x, y, s, col = '#7cc56a') => {
    G.blob(c, [x - 50 * s, y, x - 46 * s, y - 34 * s, x - 14 * s, y - 52 * s, x + 22 * s, y - 48 * s, x + 50 * s, y - 26 * s, x + 46 * s, y]);
    G.fillO(c, col, 3);
    c.fillStyle = '#ff8fab'; [[-24, -26], [10, -36], [30, -16]].forEach(([dx, dy]) => { G.circ(c, x + dx * s, y + dy * s, 5 * s); c.fill(); });
  };
  B.house = (c, x, y, w, h, wall, roof) => {
    G.rr(c, x, y - h, w, h, 6); G.fillO(c, wall, 3);
    G.poly(c, [x - 14, y - h + 4, x + w / 2, y - h - w * 0.45, x + w + 14, y - h + 4]); G.fillO(c, roof, 3);
    G.rr(c, x + w * 0.15, y - h * 0.62, w * 0.26, h * 0.26, 4); G.fillO(c, '#d9f1ff', 2.5);
    G.rr(c, x + w * 0.58, y - h * 0.62, w * 0.26, h * 0.26, 4); G.fillO(c, '#d9f1ff', 2.5);
    G.rr(c, x + w * 0.4, y - h * 0.32, w * 0.2, h * 0.32, 5); G.fillO(c, PT.shade(roof, -0.1), 2.5);
  };
  B.grass = (c, y0, col1, col2) => { c.fillStyle = G.grad(c, 0, y0, 0, H, [[0, col1], [1, col2]]); c.fillRect(0, y0, W, H - y0); };
  B.tufts = (c, rnd, y0, n, col) => {
    c.strokeStyle = col; c.lineWidth = 3; c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = rnd() * W, y = y0 + rnd() * (H - y0);
      c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x - 8, y - 9); c.moveTo(x, y); c.lineTo(x, y - 12); c.moveTo(x + 6, y); c.lineTo(x + 9, y - 8); c.stroke();
    }
  };
  B.flowers = (c, rnd, y0, n) => {
    const cols = ['#ff8fab', '#ffd84a', '#ffffff', '#b39ae8'];
    for (let i = 0; i < n; i++) {
      const x = rnd() * W, y = y0 + rnd() * (H - y0);
      c.fillStyle = cols[i % 4];
      for (let k = 0; k < 5; k++) { const a = (k / 5) * PT.TAU; G.circ(c, x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.4); c.fill(); }
      G.circ(c, x, y, 2.6); c.fillStyle = '#ffb02e'; c.fill();
    }
  };
  B.bunting = (c, x1, y1, x2, y2, sag = 40) => {
    c.strokeStyle = '#8a7a9a'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + sag, x2, y2); c.stroke();
    const cols = ['#ff6f61', '#ffd23f', '#58c46b', '#4c9be8', '#b39ae8', '#ff8fab'];
    const n = Math.floor(Math.abs(x2 - x1) / 46);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t * t * x2;
      const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * (Math.max(y1, y2) + sag) + t * t * y2;
      G.poly(c, [x - 13, y, x + 13, y, x, y + 26]); G.fillO(c, cols[i % cols.length], 2);
    }
  };
  B.lanterns = (c, x1, y1, x2, y2, sag = 50) => {
    c.strokeStyle = '#5a4a6a'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + sag, x2, y2); c.stroke();
    const n = Math.floor(Math.abs(x2 - x1) / 80);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t * t * x2;
      const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * (Math.max(y1, y2) + sag) + t * t * y2;
      c.fillStyle = 'rgba(255,200,120,.35)'; G.circ(c, x, y + 26, 34); c.fill();
      G.ell(c, x, y + 26, 18, 24); G.fillO(c, i % 2 ? '#ff6f61' : '#ffb547', 2.5);
      c.fillStyle = '#3e3550'; c.fillRect(x - 9, y, 18, 5); c.fillRect(x - 9, y + 47, 18, 5);
    }
  };
  B.stars = (c, rnd, n, y1) => {
    for (let i = 0; i < n; i++) {
      const x = rnd() * W, y = rnd() * y1, r = rnd() * 2.2 + 0.8;
      c.fillStyle = `rgba(255,255,230,${0.5 + rnd() * 0.5})`; G.circ(c, x, y, r); c.fill();
    }
  };
  B.floorWood = (c, y0, col) => {
    c.fillStyle = G.grad(c, 0, y0, 0, H, [[0, PT.shade(col, -0.05)], [1, PT.shade(col, 0.1)]]);
    c.fillRect(0, y0, W, H - y0);
    c.strokeStyle = PT.shade(col, -0.18); c.lineWidth = 2;
    for (let y = y0 + 30, i = 0; y < H; y += 26 + i * 4, i++) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    c.fillStyle = PT.shade(col, -0.25); c.fillRect(0, y0 - 6, W, 10);
  };
  B.wallpaper = (c, y1, col, stripe) => {
    c.fillStyle = col; c.fillRect(0, 0, W, y1);
    c.fillStyle = stripe;
    for (let x = 0; x < W; x += 60) c.fillRect(x, 0, 22, y1);
  };
  B.window = (c, x, y, w, h, scene) => {
    G.rr(c, x - 10, y - 10, w + 20, h + 20, 14); G.fillO(c, '#ffffff', 3);
    c.save(); G.rr(c, x, y, w, h, 8); c.clip();
    scene(c, x, y, w, h);
    c.restore();
    c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h / 2); c.lineTo(x + w, y + h / 2); c.stroke();
  };
  B.frame = (c, x, y, w, h, col, inner) => {
    G.rr(c, x, y, w, h, 6); G.fillO(c, col, 3);
    G.rr(c, x + 8, y + 8, w - 16, h - 16, 4); c.fillStyle = '#fff8ee'; c.fill();
    inner && inner(c, x + 8, y + 8, w - 16, h - 16);
  };

  /* ---------- ステージ固有の遊具 ---------- */
  const F = (PT.FIX = {});
  F.sofa = { w: 330, h: 170, tags: ['sofa', 'seat', 'furniture', 'cover-base'],
    slots: [[-80, -40], [0, -40], [80, -40]],
    draw(c) {
      const col = '#e87d6c';
      G.rr(c, -150, -170, 300, 110, 34); G.fillO(c, col, 3);
      G.rr(c, -168, -100, 70, 96, 26); G.fillO(c, PT.shade(col, -0.06), 3);
      G.rr(c, 98, -100, 70, 96, 26); G.fillO(c, PT.shade(col, -0.06), 3);
      G.rr(c, -110, -80, 220, 56, 18); G.fillO(c, PT.shade(col, 0.12), 3);
      c.strokeStyle = PT.line(col); c.lineWidth = 3; c.beginPath(); c.moveTo(0, -78); c.lineTo(0, -28); c.stroke();
      for (const x of [-140, 128]) { G.rr(c, x, -12, 12, 14, 4); G.fillO(c, '#8a5a2b', 2); }
      G.rr(c, -120, -150, 64, 50, 18); G.fillO(c, '#ffd23f', 3);
    } };
  F.lowtable = { w: 220, h: 90, tags: ['table', 'surface', 'furniture', 'cover-base'], slots: [[-130, 10], [130, 10], [0, 40]],
    draw(c) {
      const col = '#f2c38a';
      for (const x of [-90, 80]) { G.rr(c, x, -60, 12, 60, 4); G.fillO(c, PT.shade(col, -0.2), 2.5); }
      G.rr(c, -110, -80, 220, 28, 12); G.fillO(c, col, 3);
      G.rr(c, -100, -78, 200, 10, 5); c.fillStyle = PT.shade(col, 0.25); c.fill();
    } };
  F.toybox = { w: 170, h: 130, tags: ['toybox', 'container'], slots: [[-110, 20]],
    draw(c, t, f) {
      const open = f.open && t < f.open;
      G.rr(c, -80, -100, 160, 100, 12); G.fillO(c, '#7fb6ef', 3);
      c.fillStyle = '#ffd23f'; G.star(c, -40, -52, 16, 7); c.fill(); G.circ(c, 4, -50, 12); c.fillStyle = '#ff8fab'; c.fill(); G.poly(c, [32, -38, 46, -66, 60, -38]); c.fillStyle = '#58c46b'; c.fill();
      c.save(); c.translate(-84, -100); c.rotate(open ? -0.6 : 0);
      G.rr(c, 0, -22, 168, 26, 10); G.fillO(c, '#5c9ad8', 3);
      c.restore();
    } };
  F.lamp = { w: 70, h: 260, tags: ['lamp'], deco: true,
    draw(c) {
      c.strokeStyle = '#7a6a5a'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -210); c.stroke();
      G.ell(c, 0, -2, 30, 8); G.fillO(c, '#7a6a5a', 2);
      G.poly(c, [-40, -190, 40, -190, 26, -250, -26, -250]); G.fillO(c, '#ffe08a', 3);
    } };
  F.slideP = { w: 300, h: 260, tags: ['slide', 'playground'], slots: [[-90, 0]],
    draw(c) {
      for (const x of [-120, -60]) { G.rr(c, x - 6, -230, 12, 230, 4); G.fillO(c, '#7a8fb8', 2.5); }
      for (let y = -205; y < 0; y += 34) { c.fillStyle = '#7a8fb8'; c.fillRect(-120, y, 60, 8); }
      G.rr(c, -134, -244, 90, 20, 8); G.fillO(c, '#ff6f61', 3);
      G.poly(c, [-130, -244, -90, -290, -50, -244]); G.fillO(c, '#4c9be8', 3);
      c.beginPath(); c.moveTo(-50, -240); c.quadraticCurveTo(40, -220, 80, -60); c.quadraticCurveTo(92, -12, 150, -8); c.lineTo(150, 10); c.quadraticCurveTo(64, 10, 54, -50); c.quadraticCurveTo(26, -200, -50, -212); c.closePath();
      G.fillO(c, '#ffcf3f', 3);
    } };
  F.swing = { w: 300, h: 300, tags: ['swing', 'playground'], slots: [[-60, -10], [60, -10]],
    draw(c, t, f) {
      const col = '#ff8a65';
      c.lineCap = 'round';
      c.strokeStyle = PT.line(col); c.lineWidth = 16;
      c.beginPath(); c.moveTo(-140, 0); c.lineTo(-110, -290); c.lineTo(110, -290); c.lineTo(140, 0); c.stroke();
      c.strokeStyle = col; c.lineWidth = 11; c.stroke();
      for (const [i, sx] of [[0, -60], [1, 60]]) {
        const a = (f.swingA && f.swingA[i]) ? Math.sin(t * 0.004 + i) * 0.45 : Math.sin(t * 0.001 + i) * 0.03;
        c.save(); c.translate(sx, -286); c.rotate(a);
        c.strokeStyle = '#7f8fa6'; c.lineWidth = 3; c.beginPath(); c.moveTo(-26, 0); c.lineTo(-26, 230); c.moveTo(26, 0); c.lineTo(26, 230); c.stroke();
        G.rr(c, -34, 226, 68, 12, 5); G.fillO(c, '#4c9be8', 2.5);
        c.restore();
      }
    } };
  F.sandbox = { w: 380, h: 120, area: 'sand', tags: ['sand', 'sandbox'], slots: [[-100, -20], [100, -20], [0, 20]],
    draw(c) {
      G.rr(c, -190, -90, 380, 110, 18); G.fillO(c, '#e0a868', 4);
      G.rr(c, -176, -80, 352, 90, 14); c.fillStyle = '#f5dca0'; c.fill();
      c.fillStyle = 'rgba(200,160,90,.4)'; for (let i = 0; i < 18; i++) { G.circ(c, -160 + i * 19, -40 + ((i * 37) % 40), 3); c.fill(); }
    } };
  F.pond = { w: 360, h: 140, area: 'water', tags: ['water', 'pond'], slots: [[-200, 0], [200, 0], [0, 60]],
    draw(c, t) {
      G.ell(c, 0, -50, 180, 64); G.fillO(c, '#7cc6f2', 4);
      G.ell(c, 0, -50, 150, 48); c.fillStyle = '#9fd8f8'; c.fill();
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3;
      for (let i = 0; i < 3; i++) { const k = ((t * 0.0004 + i / 3) % 1); c.globalAlpha = 1 - k; G.ell(c, -40 + i * 40, -50, 20 + k * 40, 6 + k * 12); c.stroke(); }
      c.globalAlpha = 1;
      G.ell(c, 120, -76, 22, 10); c.fillStyle = '#69b866'; c.fill();
      G.ell(c, -120, -34, 18, 8); c.fill();
    } };
  F.bigtree = { w: 220, h: 360, tags: ['tree', 'hide'], slots: [[-100, 10], [100, 10]], deco: false,
    draw(c) { B.tree(c, 0, 0, 1.9, '#5fae58'); } };
  F.counter = { w: 300, h: 160, tags: ['counter', 'shop', 'register', 'surface'], slots: [[0, -60], [0, 110], [-110, 110]],
    draw(c, t, f) {
      G.rr(c, -150, -110, 300, 110, 10); G.fillO(c, '#f6b25e', 3);
      G.rr(c, -160, -122, 320, 22, 8); G.fillO(c, '#c4813a', 3);
      c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 6; i++) c.fillRect(-140 + i * 50, -96, 26, 84);
      // レジ
      G.rr(c, 40, -186, 90, 66, 10); G.fillO(c, '#7fb6ef', 3);
      G.rr(c, 52, -176, 66, 24, 5); c.fillStyle = '#d9fbe0'; c.fill();
      c.fillStyle = '#2f6a3a'; c.font = `bold 18px ${PT.FONT}`; c.textAlign = 'center'; c.fillText(f.price ? f.price : '100', 86, -158);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { G.rr(c, 54 + i * 22, -146 + j * 12, 18, 9, 3); c.fillStyle = '#fff'; c.fill(); }
    } };
  F.shelf = { w: 300, h: 230, tags: ['shelf', 'shop'], slots: [[-170, 20], [170, 20]],
    draw(c) {
      G.rr(c, -150, -230, 300, 230, 10); G.fillO(c, '#c99a64', 3);
      for (let k = 0; k < 3; k++) {
        G.rr(c, -136, -216 + k * 72, 272, 60, 6); c.fillStyle = '#f6e3c4'; c.fill();
        const items = [['#ef4b4b', 'c'], ['#ffd84a', 'b'], ['#69b866', 'c'], ['#ff9f43', 'c'], ['#e9a85a', 'r']];
        for (let i = 0; i < 6; i++) {
          const [col, sh] = items[(i + k * 2) % items.length];
          const x = -116 + i * 46, y = -168 + k * 72;
          if (sh === 'r') { G.rr(c, x - 16, y - 8, 32, 20, 8); G.fillO(c, col, 2); }
          else if (sh === 'b') { G.ell(c, x, y + 2, 18, 9, -0.3); G.fillO(c, col, 2); }
          else { G.circ(c, x, y + 2, 13); G.fillO(c, col, 2); }
        }
      }
    } };
  F.cart = { w: 140, h: 120, tags: ['cart', 'shopping'], slots: [[-80, 10]],
    draw(c) {
      c.strokeStyle = '#7f8fa6'; c.lineWidth = 5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-70, -110); c.lineTo(-50, -110); c.lineTo(-36, -30); c.lineTo(60, -30); c.lineTo(70, -90); c.lineTo(-44, -90); c.stroke();
      c.lineWidth = 2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-40 + i * 22, -90); c.lineTo(-34 + i * 21, -30); c.stroke(); }
      for (const x of [-30, 54]) { G.circ(c, x, -10, 10); G.fillO(c, '#3e4a63', 2.5); }
    } };
  F.sea = { w: 1600, h: 160, area: 'water', tags: ['water', 'sea'], slots: [[-300, 40], [300, 40]], hidden: true, draw() {} };
  F.rock = { w: 200, h: 100, tags: ['rock'], slots: [[0, -80]],
    draw(c) { G.blob(c, [-100, 0, -86, -60, -30, -96, 40, -90, 96, -50, 100, 0]); G.fillO(c, '#b8b2c8', 3); G.ell(c, -30, -70, 22, 10, -0.3); c.fillStyle = 'rgba(255,255,255,.4)'; c.fill(); } };
  F.tentF = { w: 300, h: 230, tags: ['tent', 'camp', 'cover-base'], slots: [[-170, 10], [170, 10]],
    draw(c, t, f) {
      G.poly(c, [-150, 0, 0, -220, 150, 0]); G.fillO(c, '#58b07a', 3);
      G.poly(c, [0, -220, 150, 0, 90, 0]); c.fillStyle = 'rgba(20,80,40,.25)'; c.fill();
      G.poly(c, [-56, 0, 0, -140, 56, 0]); c.fillStyle = f.lit ? '#ffe9a8' : '#2c3a3c'; c.fill();
      c.strokeStyle = PT.line('#58b07a'); c.lineWidth = 3; c.stroke();
      if (f.lit) { c.fillStyle = 'rgba(255,240,170,.3)'; G.circ(c, 0, -60, 90); c.fill(); }
    } };
  F.campfire = { w: 160, h: 130, tags: ['fire', 'camp'], slots: [[-130, 20], [130, 20], [0, 70]],
    draw(c, t) {
      c.fillStyle = 'rgba(255,170,60,.22)'; G.circ(c, 0, -40, 150); c.fill();
      for (let i = 0; i < 7; i++) { const a = (i / 7) * PT.TAU; G.ell(c, Math.cos(a) * 62, -10 + Math.sin(a) * 18, 16, 11); G.fillO(c, '#9a95a8', 2.5); }
      c.save(); c.rotate(0.3); G.rr(c, -60, -24, 120, 18, 8); G.fillO(c, '#8a5a2b', 3); c.restore();
      c.save(); c.rotate(-0.3); G.rr(c, -60, -10, 120, 18, 8); G.fillO(c, '#9a6b42', 3); c.restore();
      const f = Math.sin(t * 0.02) * 6, g = Math.cos(t * 0.027) * 5;
      c.beginPath(); c.moveTo(-36, -18); c.quadraticCurveTo(-40, -70, -8 + g, -116 + f); c.quadraticCurveTo(4, -80, 14, -96 - f); c.quadraticCurveTo(44, -60, 36, -18); c.closePath(); c.fillStyle = '#ff8c2e'; c.fill();
      c.beginPath(); c.moveTo(-18, -20); c.quadraticCurveTo(-18, -54, 0 + g, -76 + f); c.quadraticCurveTo(20, -50, 18, -20); c.closePath(); c.fillStyle = '#ffe36a'; c.fill();
    } };
  F.river = { w: 520, h: 150, area: 'water', tags: ['water', 'river'], slots: [[-280, 10], [280, 10]],
    draw(c, t) {
      c.beginPath(); c.moveTo(-260, 0); c.quadraticCurveTo(-200, -150, -60, -150); c.lineTo(260, -150); c.quadraticCurveTo(200, -40, 260, 0); c.closePath();
      G.fillO(c, '#4f8fc8', 4);
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3;
      for (let i = 0; i < 5; i++) { const x = ((t * 0.04 + i * 110) % 460) - 220; c.beginPath(); c.moveTo(x, -70 - i * 12); c.lineTo(x + 40, -70 - i * 12); c.stroke(); }
    } };
  F.log = { w: 220, h: 60, tags: ['seat', 'log'], slots: [[-60, -34], [60, -34]],
    draw(c) { G.rr(c, -110, -50, 220, 46, 22); G.fillO(c, '#9a6b42', 3); G.ell(c, 100, -27, 14, 21); G.fillO(c, '#d9a46a', 2.5); } };
  F.ferris = { w: 460, h: 560, tags: ['ferris', 'ride'], slots: [[0, 20]],
    draw(c, t, f) {
      const cx = 0, cy = -320, R = 210;
      const rot = t * 0.00018 * (f.fast ? 4 : 1);
      c.strokeStyle = '#7a8fb8'; c.lineWidth = 12; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-120, 0); c.lineTo(cx, cy); c.lineTo(120, 0); c.stroke();
      c.strokeStyle = '#ffffff'; c.lineWidth = 8; G.circ(c, cx, cy, R); c.stroke();
      c.strokeStyle = '#ff8fab'; c.lineWidth = 4; G.circ(c, cx, cy, R); c.stroke();
      c.strokeStyle = '#cfd8ea'; c.lineWidth = 3;
      for (let i = 0; i < 8; i++) { const a = rot + (i / 8) * PT.TAU; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke(); }
      const cols = ['#ff6f61', '#ffd23f', '#58c46b', '#4c9be8', '#b39ae8', '#ff8fab', '#ffa94d', '#7fd0e8'];
      f._cabins = [];
      for (let i = 0; i < 8; i++) {
        const a = rot + (i / 8) * PT.TAU;
        const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        c.strokeStyle = '#7a8fb8'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 14); c.stroke();
        G.rr(c, x - 30, y + 12, 60, 50, 14); G.fillO(c, cols[i], 3);
        G.rr(c, x - 22, y + 18, 44, 20, 6); c.fillStyle = '#e9f6ff'; c.fill();
        f._cabins.push([x, y + 62]);
      }
      G.circ(c, cx, cy, 22); G.fillO(c, '#ffd23f', 3);
    } };
  F.carousel = { w: 360, h: 320, tags: ['carousel', 'ride'], slots: [[-200, 10], [200, 10]],
    draw(c, t, f) {
      const sp = f.fast ? 0.004 : 0.0012;
      G.ell(c, 0, -20, 170, 34); G.fillO(c, '#ff8fab', 3);
      G.ell(c, 0, -30, 160, 28); c.fillStyle = '#ffd1dc'; c.fill();
      c.strokeStyle = '#ffd23f'; c.lineWidth = 8; c.beginPath(); c.moveTo(0, -30); c.lineTo(0, -250); c.stroke();
      for (let i = 0; i < 6; i++) {
        const a = t * sp + (i / 6) * PT.TAU;
        const x = Math.cos(a) * 130, z = Math.sin(a);
        if (z < 0) continue;
        const y = -60 - Math.sin(t * 0.004 + i) * 14;
        c.strokeStyle = '#e8e2f6'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, -250); c.lineTo(x, -20); c.stroke();
        c.save(); c.translate(x, y + z * 10); c.scale(0.55 + z * 0.15, 0.55 + z * 0.15);
        G.ell(c, 0, 0, 40, 22); G.fillO(c, ['#ffffff', '#ffd84a', '#7fd0e8'][i % 3], 3);
        G.blob(c, [24, -8, 36, -40, 56, -42, 54, -24, 36, 2]); G.fillO(c, ['#ffffff', '#ffd84a', '#7fd0e8'][i % 3], 3);
        c.restore();
      }
      G.poly(c, [-190, -240, 0, -320, 190, -240]); G.fillO(c, '#ff6f61', 3);
      c.save(); G.poly(c, [-190, -240, 0, -320, 190, -240]); c.clip(); c.fillStyle = '#fff';
      for (let i = 0; i < 6; i++) { G.poly(c, [0, -320, -190 + i * 76, -240, -152 + i * 76, -240]); c.fill(); }
      c.restore();
      c.fillStyle = '#ffd23f'; for (let i = 0; i < 9; i++) { G.circ(c, -170 + i * 42.5, -236, 7); c.fill(); }
      G.circ(c, 0, -326, 12); G.fillO(c, '#ffd23f', 2.5);
    } };
  F.stageF = { w: 420, h: 300, tags: ['stage', 'music'], slots: [[-100, -90], [0, -90], [100, -90]],
    draw(c, t, f) {
      G.rr(c, -210, -90, 420, 90, 10); G.fillO(c, '#9b6fd6', 3);
      G.rr(c, -210, -96, 420, 16, 6); G.fillO(c, '#ffd23f', 3);
      c.strokeStyle = '#c4a8ee'; c.lineWidth = 10; c.beginPath(); c.moveTo(-196, -96); c.lineTo(-196, -300); c.moveTo(196, -96); c.lineTo(196, -300); c.stroke();
      G.rr(c, -216, -322, 432, 36, 12); G.fillO(c, '#ff6f61', 3);
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 190, -290); c.quadraticCurveTo(s * 130, -200, s * 170, -100); c.lineTo(s * 190, -100); c.closePath(); G.fillO(c, '#e2434b', 2.5); }
      if (f.show) {
        for (let i = 0; i < 3; i++) { const a = Math.sin(t * 0.003 + i * 2) * 0.4; c.save(); c.translate(-120 + i * 120, -300); c.rotate(a); c.fillStyle = ['rgba(255,240,150,.25)', 'rgba(255,170,220,.25)', 'rgba(170,220,255,.25)'][i]; c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.lineTo(60, 210); c.lineTo(-60, 210); c.closePath(); c.fill(); c.restore(); }
      }
    } };
  F.stall = { w: 260, h: 230, tags: ['stall', 'shop', 'food'], slots: [[0, 40]],
    draw(c, t, f) {
      const col = f.col || '#ff6f61';
      G.rr(c, -120, -100, 240, 100, 8); G.fillO(c, '#f6d8a8', 3);
      c.strokeStyle = '#a57a4a'; c.lineWidth = 8; c.beginPath(); c.moveTo(-110, -100); c.lineTo(-110, -210); c.moveTo(110, -100); c.lineTo(110, -210); c.stroke();
      c.beginPath(); c.moveTo(-134, -200); c.lineTo(134, -200); c.lineTo(124, -160); for (let i = 0; i < 6; i++) { const x = 124 - (i + 1) * 41.3; c.quadraticCurveTo(x + 20, -136, x, -160); } c.closePath(); G.fillO(c, col, 3);
      c.save(); c.clip(); c.fillStyle = '#fff'; for (let i = 0; i < 6; i++) c.fillRect(-134 + i * 46, -205, 22, 80); c.restore();
      G.rr(c, -70, -236, 140, 40, 10); G.fillO(c, '#ffffff', 3);
      c.fillStyle = '#3e3550'; c.font = `bold 24px ${PT.FONT}`; c.textAlign = 'center'; c.fillText(f.label || 'おみせ', 0, -207);
      if (f.goods === 'fish') { for (let i = 0; i < 3; i++) { G.ell(c, -60 + i * 60, -60, 26, 16); c.fillStyle = 'rgba(130,200,255,.7)'; c.fill(); G.ell(c, -60 + i * 60 + Math.sin(t * 0.006 + i) * 8, -60, 7, 4); c.fillStyle = '#ff6b3d'; c.fill(); } }
      else if (f.goods === 'food') { for (let i = 0; i < 4; i++) { G.circ(c, -66 + i * 44, -70, 14); G.fillO(c, ['#ffd84a', '#ff8fab', '#e9a85a', '#ffffff'][i], 2); } }
      else if (f.goods === 'balloon') { for (let i = 0; i < 4; i++) { G.ell(c, -60 + i * 40, -260 - (i % 2) * 20, 18, 22); G.fillO(c, ['#ff5d78', '#58b9f0', '#ffd23f', '#9b6fd6'][i], 2.5); } }
    } };
  F.bed = { w: 300, h: 150, tags: ['bed', 'rest', 'cover-base'], slots: [[0, -60], [-180, 10], [180, 10]],
    draw(c) {
      G.rr(c, -150, -150, 26, 150, 8); G.fillO(c, '#9ccbe8', 3);
      G.rr(c, 124, -110, 26, 110, 8); G.fillO(c, '#9ccbe8', 3);
      G.rr(c, -140, -84, 280, 50, 12); G.fillO(c, '#ffffff', 3);
      G.rr(c, -50, -96, 190, 60, 14); G.fillO(c, '#a8e0c4', 3);
      G.rr(c, -124, -110, 70, 34, 14); G.fillO(c, '#ffffff', 3);
      G.rr(c, -140, -40, 280, 14, 4); G.fillO(c, '#9ccbe8', 2.5);
    } };
  F.medshelf = { w: 220, h: 220, tags: ['shelf', 'medicine'], deco: false, slots: [[-140, 10]],
    draw(c) {
      G.rr(c, -110, -220, 220, 220, 10); G.fillO(c, '#ffffff', 3);
      G.rr(c, -40, -210, 80, 40, 6); c.fillStyle = '#e8424a'; c.fillRect(-10, -206, 20, 32); c.fillRect(-26, -196, 52, 12);
      for (let k = 0; k < 2; k++) for (let i = 0; i < 4; i++) { G.rr(c, -92 + i * 46, -150 + k * 70, 34, 50, 8); G.fillO(c, ['#ffd1dc', '#c8f0d8', '#d9ecff', '#fff1b8'][(i + k) % 4], 2); }
    } };
  F.blackboard = { w: 500, h: 260, tags: ['board', 'school'], wall: true, slots: [[0, 380]],
    draw(c, t, f) {
      G.rr(c, -250, -260, 500, 230, 12); G.fillO(c, '#c99a64', 3);
      G.rr(c, -234, -246, 468, 202, 8); c.fillStyle = '#3f7a5c'; c.fill();
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 4; c.lineCap = 'round';
      const d = f.drawing || 0;
      if (d % 4 === 0) { c.beginPath(); c.arc(-120, -150, 40, 0, PT.TAU); c.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * PT.TAU; c.beginPath(); c.moveTo(-120 + Math.cos(a) * 52, -150 + Math.sin(a) * 52); c.lineTo(-120 + Math.cos(a) * 68, -150 + Math.sin(a) * 68); c.stroke(); } }
      if (d % 4 === 1) { G.heart(c, -100, -140, 50); c.stroke(); }
      if (d % 4 === 2) { G.star(c, -110, -150, 56, 24); c.stroke(); }
      if (d % 4 === 3) { c.beginPath(); c.moveTo(-180, -100); c.lineTo(-120, -190); c.lineTo(-60, -100); c.closePath(); c.stroke(); c.strokeRect(-170, -100, 100, 50); }
      c.fillStyle = 'rgba(255,255,255,.9)'; c.font = `bold 40px ${PT.FONT}`; c.textAlign = 'center';
      c.fillText(['あいうえお', 'みんな だいすき', 'きょうは はれ', 'おうち'][d % 4], 90, -130);
      G.rr(c, -200, -44, 400, 14, 4); G.fillO(c, '#a57a4a', 2);
    } };
  F.piano = { w: 240, h: 170, tags: ['piano', 'music'], slots: [[-150, 20], [0, 60]],
    draw(c) {
      G.rr(c, -120, -170, 240, 140, 12); G.fillO(c, '#e86a8a', 3);
      G.rr(c, -110, -80, 220, 34, 4); G.fillO(c, '#ffffff', 2);
      c.fillStyle = '#3e3550'; for (let i = 0; i < 10; i++) { if (i % 7 !== 2 && i % 7 !== 6) c.fillRect(-98 + i * 22, -80, 10, 20); }
      for (const x of [-104, 96]) { G.rr(c, x, -30, 8, 30, 3); G.fillO(c, '#c4506a', 2); }
      G.note(c, 40, -130, 18, '#ffffff'); G.note(c, -40, -120, 14, '#ffffff');
    } };
  F.desk = { w: 280, h: 100, tags: ['table', 'surface', 'school', 'cover-base'], slots: [[-90, 40], [90, 40]],
    draw(c) {
      for (const x of [-120, 108]) { G.rr(c, x, -70, 12, 70, 4); G.fillO(c, '#7fb6ef', 2.5); }
      G.rr(c, -140, -90, 280, 24, 8); G.fillO(c, '#ffd38a', 3);
      G.rr(c, -60, -110, 40, 20, 3); c.fillStyle = '#ff8fab'; c.fill(); G.rr(c, 20, -106, 50, 14, 3); c.fillStyle = '#7fb6ef'; c.fill();
    } };
  F.cubby = { w: 260, h: 200, tags: ['shelf'], deco: true,
    draw(c) {
      G.rr(c, -130, -200, 260, 200, 10); G.fillO(c, '#f6c98a', 3);
      for (let k = 0; k < 2; k++) for (let i = 0; i < 4; i++) { G.rr(c, -118 + i * 60, -188 + k * 92, 52, 80, 6); c.fillStyle = PT.shade('#f6c98a', -0.15); c.fill(); G.circ(c, -92 + i * 60, -130 + k * 92, 12); c.fillStyle = ['#ff8fab', '#7fb6ef', '#58c46b', '#ffd23f'][(i + k) % 4]; c.fill(); }
    } };
  F.trainF = { w: 1100, h: 260, tags: ['train', 'ride', 'station'], slots: [[-200, 40], [100, 40]],
    draw(c, t, f) {
      const off = f.offset || 0;
      c.save(); c.translate(off, 0);
      const cars = [['#4c9be8', -380], ['#58c46b', 0], ['#ff8a65', 380]];
      cars.forEach(([col, x], i) => {
        G.rr(c, x - 180, -230, 360, 200, 30); G.fillO(c, col, 3);
        c.fillStyle = '#ffffff'; c.fillRect(x - 180, -100, 360, 14);
        for (let k = 0; k < 3; k++) { G.rr(c, x - 150 + k * 104, -200, 84, 70, 12); G.fillO(c, '#d9f1ff', 2.5); }
        G.rr(c, x + 120, -190, 0, 0, 0);
        for (const wx of [-120, 120]) { G.circ(c, x + wx, -24, 22); G.fillO(c, '#3e4a63', 3); }
        if (i === 2) { G.rr(c, x + 170, -150, 30, 50, 10); G.fillO(c, col, 3); G.circ(c, x + 190, -60, 10); c.fillStyle = '#ffe36a'; c.fill(); }
      });
      f._windows = [];
      cars.forEach(([, x]) => { for (let k = 0; k < 3; k++) f._windows.push([x - 108 + k * 104 + off, -150]); });
      c.restore();
    } };
  F.bench = { w: 240, h: 100, tags: ['seat', 'bench'], slots: [[-60, -40], [60, -40]],
    draw(c) {
      for (const x of [-100, 92]) { G.rr(c, x, -40, 10, 40, 3); G.fillO(c, '#7f8fa6', 2); }
      G.rr(c, -120, -50, 240, 16, 6); G.fillO(c, '#e8a35c', 3);
      G.rr(c, -120, -96, 240, 16, 6); G.fillO(c, '#e8a35c', 3);
      c.strokeStyle = '#7f8fa6'; c.lineWidth = 5; c.beginPath(); c.moveTo(-100, -80); c.lineTo(-100, -50); c.moveTo(100, -80); c.lineTo(100, -50); c.stroke();
    } };
  F.gate = { w: 260, h: 140, tags: ['gate', 'station'], slots: [[0, 40]],
    draw(c) {
      for (const x of [-110, 50]) { G.rr(c, x, -120, 60, 120, 10); G.fillO(c, '#cfd8ea', 3); G.rr(c, x + 10, -112, 40, 16, 4); c.fillStyle = '#58c46b'; c.fill(); }
      G.rr(c, -50, -70, 100, 10, 4); G.fillO(c, '#ffd23f', 2);
    } };
  F.rocketF = { w: 220, h: 420, tags: ['rocket', 'ride', 'space'], slots: [[-150, 20]],
    draw(c, t, f) {
      const lift = f.lift || 0;
      c.save(); c.translate(0, -lift);
      if (lift > 0) { const fl = 60 + Math.sin(t * 0.05) * 20; c.beginPath(); c.moveTo(-40, -10); c.quadraticCurveTo(0, fl + 40, 40, -10); c.closePath(); c.fillStyle = '#ffb02e'; c.fill(); c.beginPath(); c.moveTo(-20, -10); c.quadraticCurveTo(0, fl, 20, -10); c.closePath(); c.fillStyle = '#fff2a0'; c.fill(); }
      G.blob(c, [-60, -20, -66, -200, -30, -340, 0, -400, 30, -340, 66, -200, 60, -20]); G.fillO(c, '#f4f6fb', 3);
      G.poly(c, [-62, -120, -110, -10, -56, -20]); G.fillO(c, '#ff6f61', 3);
      G.poly(c, [62, -120, 110, -10, 56, -20]); G.fillO(c, '#ff6f61', 3);
      G.circ(c, 0, -240, 34); G.fillO(c, '#4c9be8', 3); G.circ(c, 0, -240, 24); c.fillStyle = f.rider ? '#ffd8a8' : '#9fdcf5'; c.fill();
      c.beginPath(); c.moveTo(-30, -340); c.quadraticCurveTo(0, -410, 30, -340); c.closePath(); G.fillO(c, '#ff6f61', 3);
      c.restore();
    } };
  F.planet = { w: 160, h: 160, tags: ['planet', 'sky'], sky: true, slots: [],
    draw(c, t, f) {
      const col = f.col || '#ff9f6b';
      c.save(); c.translate(0, -80);
      G.circ(c, 0, 0, 62); G.fillO(c, col, 3);
      c.fillStyle = PT.shade(col, -0.12); G.circ(c, -20, -14, 12); c.fill(); G.circ(c, 18, 22, 9); c.fill();
      if (f.ring) { c.strokeStyle = '#ffe08a'; c.lineWidth = 8; G.ell(c, 0, 4, 100, 20, -0.25); c.stroke(); }
      c.restore();
    } };
  F.crater = { w: 240, h: 80, tags: ['crater'], area: 'crater', slots: [[0, -10]],
    draw(c) { G.ell(c, 0, -30, 120, 34); G.fillO(c, '#9b93b8', 3); G.ell(c, 0, -26, 96, 24); c.fillStyle = '#857ca6'; c.fill(); } };
  F.mushroom = { w: 220, h: 220, tags: ['mushroom', 'bounce', 'magic'], slots: [[0, -170], [-150, 10]],
    draw(c, t, f) {
      const sq = f.boing && t < f.boing ? 1 + Math.sin((f.boing - t) * 0.03) * 0.08 : 1;
      c.save(); c.scale(1 / sq, sq);
      G.rr(c, -36, -120, 72, 120, 26); G.fillO(c, '#fff4e0', 3);
      G.blob(c, [-110, -110, -96, -180, 0, -220, 96, -180, 110, -110, 0, -98]); G.fillO(c, '#ff6f91', 3);
      c.fillStyle = '#ffffff'; [[-50, -160, 18], [20, -190, 14], [60, -140, 16], [-10, -134, 10]].forEach(([x, y, r]) => { G.circ(c, x, y, r); c.fill(); });
      c.restore();
      c.fillStyle = 'rgba(255,200,240,.2)'; G.circ(c, 0, -150, 140); c.fill();
    } };
  F.magictree = { w: 300, h: 420, tags: ['tree', 'magic', 'hide'], slots: [[-160, 10], [160, 10]],
    draw(c, t, f) {
      G.blob(c, [-50, 0, -36, -160, -28, -220, 28, -220, 36, -160, 50, 0]); G.fillO(c, '#8a6bb8', 3);
      G.ell(c, 0, -80, 18, 26); c.fillStyle = '#4a3a6c'; c.fill();
      G.blob(c, [-150, -220, -140, -320, -60, -400, 60, -400, 140, -320, 150, -220, 0, -190]); G.fillO(c, '#5fc4b0', 3);
      const glow = f.glow && t < f.glow;
      for (let i = 0; i < 12; i++) {
        const a = i * 2.4, r = 40 + (i * 37) % 90;
        const x = Math.cos(a) * r, y = -300 + Math.sin(a) * r * 0.6;
        const tw = 0.5 + Math.sin(t * 0.004 + i) * 0.5;
        c.fillStyle = glow ? `rgba(255,240,150,${0.6 + tw * 0.4})` : `rgba(255,240,180,${0.3 + tw * 0.5})`;
        G.circ(c, x, y, glow ? 9 : 6); c.fill();
      }
    } };
  F.fairypond = { w: 380, h: 130, area: 'water', tags: ['water', 'pond', 'magic'], slots: [[-210, 0], [210, 0]],
    draw(c, t) {
      G.ell(c, 0, -50, 190, 62); G.fillO(c, '#9b8ce8', 4);
      G.ell(c, 0, -50, 160, 46); c.fillStyle = '#c4b8f8'; c.fill();
      for (let i = 0; i < 6; i++) { const a = t * 0.001 + i; c.fillStyle = 'rgba(255,255,255,.8)'; G.star(c, Math.cos(a) * 120, -50 + Math.sin(a * 1.3) * 30, 6, 2.4); c.fill(); }
      for (const x of [-110, 100]) { G.ell(c, x, -60, 26, 10); c.fillStyle = '#7cd8a8'; c.fill(); G.circ(c, x + 6, -66, 6); c.fillStyle = '#ffd1f0'; c.fill(); }
    } };
  F.yagura = { w: 360, h: 360, tags: ['stage', 'yagura', 'music'], slots: [[-210, 20], [210, 20], [0, 90]],
    draw(c, t, f) {
      c.strokeStyle = '#a5643a'; c.lineWidth = 14; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-150, 0); c.lineTo(-120, -200); c.moveTo(150, 0); c.lineTo(120, -200); c.moveTo(-40, 0); c.lineTo(-36, -200); c.moveTo(40, 0); c.lineTo(36, -200); c.stroke();
      c.lineWidth = 8; c.beginPath(); c.moveTo(-140, -80); c.lineTo(140, -80); c.stroke();
      G.rr(c, -170, -220, 340, 30, 6); G.fillO(c, '#e2434b', 3);
      c.fillStyle = '#fff'; for (let i = 0; i < 8; i++) c.fillRect(-160 + i * 42, -214, 20, 18);
      G.rr(c, -150, -320, 300, 100, 8); c.fillStyle = 'rgba(0,0,0,0)';
      // たいこ
      G.rr(c, -50, -300, 100, 80, 16); G.fillO(c, '#c0603a', 3);
      G.ell(c, 0, -300, 50, 14); G.fillO(c, '#fff3e0', 3);
      if (f.beat && t < f.beat) { c.strokeStyle = 'rgba(255,220,120,.8)'; c.lineWidth = 4; G.circ(c, 0, -300, 70 + (f.beat - t) * 0.05); c.stroke(); }
      c.fillStyle = 'rgba(255,200,120,.25)'; G.circ(c, 0, -160, 220); c.fill();
    } };

  /* ---------- ステージ ---------- */
  const st = (o) => o;
  PT.STAGES = [
    st({ id: 'home', num: 1, name: 'みんなの おうち', bgm: 'home', floor: [560, 880], color: '#ffb36b',
      tools: ['blanket', 'box', 'flashlight', 'teddy', 'bunny', 'dino', 'cushion', 'book', 'chair', 'table', 'plate', 'apple', 'cake', 'onigiri', 'ball', 'bag'],
      rides: ['tent', 'train', 'tricycle', 'trampoline', 'car', 'slide'],
      spawn: [['lulu', 760, 700], ['pon', 980, 760], ['mimi', 600, 780], ['gaku', 1180, 720], ['pyoko', 420, 790], ['futan', 1320, 790], ['ricky', 880, 820]],
      fixtures: [['lamp', 120, 600], ['sofa', 420, 640], ['lowtable', 980, 660], ['toybox', 1380, 610]],
      bg(c, r) {
        B.wallpaper(c, 580, '#fff1dc', '#ffe6c6');
        B.window(c, 620, 110, 340, 250, (c, x, y, w, h) => { B.sky(c, '#9fd8ff', '#e3f6ff', y + h); B.cloud(c, x + 60, y + 70, 0.8); B.tree(c, x + 260, y + h + 40, 1.0); B.bush(c, x + 80, y + h, 1.2); });
        // カーテン
        for (const s of [-1, 1]) { c.beginPath(); const x = s < 0 ? 600 : 980; c.moveTo(x, 90); c.quadraticCurveTo(x + s * 40, 250, x - s * 10, 390); c.lineTo(x + s * 50, 390); c.quadraticCurveTo(x + s * 70, 230, x + s * 50, 90); c.closePath(); G.fillO(c, '#ff9f8a', 3); }
        G.rr(c, 580, 80, 420, 18, 8); G.fillO(c, '#c4813a', 2.5);
        B.frame(c, 200, 150, 150, 120, '#7fb6ef', (c, x, y, w, h) => { B.sky(c, '#cdeaff', '#fff', y + h); c.fillStyle = '#69b866'; G.ell(c, x + w / 2, y + h, w * 0.7, 40); c.fill(); });
        B.frame(c, 1150, 140, 120, 150, '#ff8fab', (c, x, y, w, h) => { G.heart(c, x + w / 2, y + h / 2 + 10, 34); c.fillStyle = '#ff6f91'; c.fill(); });
        B.frame(c, 1300, 200, 140, 100, '#58c46b', (c, x, y, w, h) => { G.star(c, x + w / 2, y + h / 2, 30, 13); c.fillStyle = '#ffd23f'; c.fill(); });
        // 本棚
        G.rr(c, 1450, 300, 130, 280, 8); G.fillO(c, '#c99a64', 3);
        for (let k = 0; k < 3; k++) for (let i = 0; i < 5; i++) { G.rr(c, 1462 + i * 22, 318 + k * 88, 18, 70, 3); c.fillStyle = ['#ff6f61', '#4c9be8', '#ffd23f', '#58c46b', '#b39ae8'][(i + k) % 5]; c.fill(); }
        B.floorWood(c, 580, '#e7b47c');
        G.ell(c, 780, 760, 520, 110); c.fillStyle = '#9fd0f0'; c.fill(); G.ell(c, 780, 760, 470, 92); c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.setLineDash([16, 14]); c.stroke(); c.setLineDash([]);
      } }),
    st({ id: 'park', num: 2, name: 'わくわく こうえん', bgm: 'park', floor: [540, 880], color: '#7cc56a',
      tools: ['ball', 'bucket', 'duck', 'bread', 'blanket', 'sheet', 'apple', 'onigiri', 'teddy', 'dino', 'box', 'bag', 'flashlight', 'parasol'],
      rides: ['slide', 'trampoline', 'tricycle', 'car', 'swimring', 'tent'],
      spawn: [['lulu', 700, 640], ['pon', 900, 700], ['choco', 560, 720], ['moko', 1060, 650], ['pyoko', 1000, 760]],
      fixtures: [['swing', 260, 600], ['bigtree', 80, 560], ['slideP', 1240, 600], ['sandbox', 720, 820], ['pond', 1340, 840]],
      bg(c, r) {
        B.sky(c, '#8fd3ff', '#e8f7ff', 560);
        B.cloud(c, 160, 120, 1.1); B.cloud(c, 760, 80, 0.8); B.cloud(c, 1260, 140, 1.2);
        c.fillStyle = '#b5e3a2'; G.ell(c, 300, 560, 520, 150); c.fill(); G.ell(c, 1200, 570, 620, 170); c.fill();
        B.house(c, 560, 480, 120, 110, '#fff1dc', '#ff8a65'); B.house(c, 720, 470, 100, 90, '#e3f1ff', '#4c9be8'); B.house(c, 1420, 470, 110, 100, '#fff8d6', '#58b07a');
        for (let i = 0; i < 6; i++) B.tree(c, 380 + i * 190 + (i % 2) * 40, 540, 0.7 + (i % 3) * 0.12, i % 2 ? '#79c26a' : '#5fae58');
        c.strokeStyle = '#ffffff'; c.lineWidth = 6;
        for (let x = 0; x < W; x += 40) { c.beginPath(); c.moveTo(x, 520); c.lineTo(x, 560); c.stroke(); }
        c.beginPath(); c.moveTo(0, 530); c.lineTo(W, 530); c.moveTo(0, 548); c.lineTo(W, 548); c.stroke();
        B.grass(c, 556, '#93d27a', '#79c26a');
        c.fillStyle = '#f2dfb0'; c.beginPath(); c.moveTo(560, 900); c.quadraticCurveTo(820, 640, 1100, 560); c.lineTo(1200, 560); c.quadraticCurveTo(980, 680, 860, 900); c.closePath(); c.fill();
        B.tufts(c, r, 570, 60, '#5fae58'); B.flowers(c, r, 600, 40);
        B.bush(c, 1540, 620, 1.2);
      } }),
    st({ id: 'shop', num: 3, name: 'まちの おみせやさん', bgm: 'shop', floor: [560, 880], color: '#ff8a65',
      tools: ['basket', 'apple', 'banana', 'bread', 'cake', 'onigiri', 'box', 'teddy', 'bunny', 'plate', 'table', 'chair', 'ball', 'bag'],
      rides: ['car', 'tricycle', 'train'],
      spawn: [['mimi', 760, 700], ['pon', 1000, 760], ['lulu', 560, 760], ['choco', 1260, 760], ['mama', 1440, 800]],
      fixtures: [['counter', 470, 650], ['shelf', 1080, 620], ['cart', 1420, 700]],
      bg(c, r) {
        B.sky(c, '#9fd8ff', '#eaf7ff', 300);
        B.cloud(c, 300, 70, 0.8); B.cloud(c, 1200, 90, 0.9);
        const shops = [[0, 520, '#fff1dc', '#ff6f61', 'パン'], [520, 560, '#e9f7e4', '#58b07a', 'やおや'], [1080, 520, '#eaf2ff', '#4c9be8', 'スーパー']];
        shops.forEach(([x, w, wall, aw, label]) => {
          G.rr(c, x + 10, 120, w - 20, 470, 8); G.fillO(c, wall, 3);
          G.rr(c, x + 40, 140, w - 80, 70, 14); G.fillO(c, '#ffffff', 3);
          c.fillStyle = PT.shade(aw, -0.2); c.font = `bold 46px ${PT.FONT}`; c.textAlign = 'center'; c.fillText(label, x + w / 2, 192);
          c.beginPath(); c.moveTo(x + 20, 230); c.lineTo(x + w - 20, 230); c.lineTo(x + w - 30, 300);
          const n = Math.floor((w - 50) / 60); for (let i = 0; i < n; i++) { const xx = x + w - 30 - (i + 1) * ((w - 60) / n); c.quadraticCurveTo(xx + (w - 60) / n / 2, 330, xx, 300); }
          c.closePath(); G.fillO(c, aw, 3);
          c.save(); c.clip(); c.fillStyle = '#ffffff'; for (let xx = x + 20; xx < x + w; xx += 56) c.fillRect(xx, 230, 28, 110); c.restore();
          G.rr(c, x + 50, 350, w - 100, 160, 10); G.fillO(c, '#d9f1ff', 3);
          c.strokeStyle = '#ffffff'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 70, 370); c.lineTo(x + 120, 420); c.stroke();
        });
        c.fillStyle = '#e8d6c0'; c.fillRect(0, 580, W, 320);
        c.strokeStyle = '#d4bea4'; c.lineWidth = 3;
        for (let y = 600; y < H; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); for (let x = ((y / 40) % 2) * 50; x < W; x += 100) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 40); c.stroke(); } }
        c.fillStyle = '#cdb69a'; c.fillRect(0, 576, W, 10);
        B.bunting(c, 0, 40, 800, 30, 50); B.bunting(c, 800, 30, 1600, 40, 50);
      } }),
    st({ id: 'beach', num: 4, name: 'ビーチで あそぼう', bgm: 'beach', floor: [590, 880], color: '#4fc3f7',
      tools: ['bucket', 'shell', 'parasol', 'sheet', 'ball', 'apple', 'onigiri', 'banana', 'box', 'blanket', 'duck', 'teddy'],
      rides: ['swimring', 'car', 'trampoline', 'tent'],
      spawn: [['lulu', 620, 720], ['pon', 880, 680], ['gaku', 1100, 760], ['moko', 420, 790], ['pyoko', 780, 800]],
      fixtures: [['sea', 800, 590], ['rock', 1440, 640]],
      ambient(c, t) {
        // なみうちぎわ
        const y = 590 + Math.sin(t * 0.0012) * 10;
        c.fillStyle = 'rgba(255,255,255,.85)';
        c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= W; x += 40) c.quadraticCurveTo(x + 20, y + 12 + Math.sin(x * 0.05 + t * 0.003) * 4, x + 40, y); c.lineTo(W, y - 14); c.lineTo(0, y - 14); c.closePath(); c.fill();
      },
      bg(c, r) {
        B.sky(c, '#7fcfff', '#e8f8ff', 420);
        c.fillStyle = 'rgba(255,240,180,.8)'; G.circ(c, 1380, 120, 60); c.fill();
        B.cloud(c, 220, 110, 1.0); B.cloud(c, 820, 70, 0.7);
        c.fillStyle = G.grad(c, 0, 380, 0, 600, [[0, '#3fa7e8'], [1, '#7fd6f5']]); c.fillRect(0, 380, W, 220);
        c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3;
        for (let i = 0; i < 18; i++) { const x = r() * W, y = 410 + r() * 160; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 15, y - 6, x + 30, y); c.stroke(); }
        // 遠くの島
        c.fillStyle = '#7cc56a'; G.ell(c, 260, 384, 140, 26); c.fill(); B.tree(c, 250, 372, 0.4);
        // ヨット
        G.poly(c, [1120, 430, 1180, 430, 1170, 446, 1130, 446]); G.fillO(c, '#ffffff', 2); G.poly(c, [1150, 428, 1150, 368, 1186, 426]); G.fillO(c, '#ff6f61', 2);
        c.fillStyle = G.grad(c, 0, 580, 0, H, [[0, '#f8e3b0'], [1, '#f2d095']]); c.fillRect(0, 580, W, H - 580);
        G.speckle(c, 0, 600, W, 300, 'rgba(200,160,100,.35)', 220, 2);
        B.pine(c, 1530, 620, 0.9, '#5fae58');
      } }),
    st({ id: 'camp', num: 5, name: 'キャンプと もりの たんけん', bgm: 'night', floor: [560, 880], color: '#5c6bc0', night: true,
      tools: ['flashlight', 'acorn', 'blanket', 'bag', 'onigiri', 'apple', 'sheet', 'book', 'dino', 'teddy', 'box', 'chair'],
      rides: ['tent', 'tricycle', 'trampoline'],
      spawn: [['lulu', 640, 720], ['gaku', 1000, 700], ['choco', 820, 790], ['moko', 1180, 780]],
      fixtures: [['tentF', 330, 640], ['campfire', 820, 680], ['river', 1360, 830], ['log', 1080, 760]],
      skyStars: [[200, 330], [330, 380], [470, 320], [560, 410], [1100, 300], [1220, 370], [1350, 320], [1480, 400], [900, 350], [700, 300]],
      bg(c, r) {
        B.sky(c, '#2c2f6b', '#7a6ab8', 560);
        B.stars(c, r, 120, 420);
        c.fillStyle = '#fff6d0'; G.circ(c, 1450, 300, 46); c.fill(); c.fillStyle = '#4a4890'; G.circ(c, 1472, 286, 40); c.fill();
        c.fillStyle = '#3d4a7c'; G.ell(c, 400, 560, 600, 130); c.fill(); G.ell(c, 1250, 560, 600, 160); c.fill();
        for (let i = 0; i < 14; i++) B.pine(c, i * 120 + r() * 40, 560 + r() * 10, 0.9 + r() * 0.6, i % 2 ? '#2f6a5a' : '#357560');
        B.grass(c, 556, '#4f8a6a', '#3d7058');
        B.tufts(c, r, 570, 50, '#2f5a48');
        c.fillStyle = 'rgba(255,255,200,.08)'; G.circ(c, 820, 650, 260); c.fill();
      } }),
    st({ id: 'fun', num: 6, name: 'ゆめの ゆうえんち', bgm: 'fun', floor: [580, 880], color: '#ba68c8',
      tools: null, rides: null,
      spawn: [['lulu', 700, 760], ['pon', 900, 720], ['mimi', 1080, 780], ['choco', 560, 800], ['gaku', 1250, 770], ['moko', 400, 760], ['pyoko', 980, 830], ['futan', 1440, 820], ['ricky', 820, 700]],
      fixtures: [['ferris', 270, 640], ['stageF', 800, 610], ['carousel', 1330, 660], ['stall', 1530, 760, { label: 'ふうせん', goods: 'balloon', col: '#58b9f0' }]],
      bg(c, r) {
        B.sky(c, '#a8dcff', '#fde8f6', 580);
        B.cloud(c, 560, 90, 0.9, '#fff'); B.cloud(c, 1100, 60, 1.1, '#fff');
        c.fillStyle = '#c9b3ea'; for (let i = 0; i < 6; i++) { G.rr(c, 480 + i * 120, 380 - (i % 3) * 40, 60, 200, 10); c.fill(); G.poly(c, [470 + i * 120, 380 - (i % 3) * 40, 510 + i * 120, 320 - (i % 3) * 40, 550 + i * 120, 380 - (i % 3) * 40]); c.fillStyle = '#ffb3c8'; c.fill(); c.fillStyle = '#c9b3ea'; }
        B.bunting(c, 0, 80, 1600, 80, 80);
        c.fillStyle = G.grad(c, 0, 580, 0, H, [[0, '#ffe3b0'], [1, '#ffd08a']]); c.fillRect(0, 580, W, H - 580);
        c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3;
        for (let x = -200; x < W + 200; x += 80) { c.beginPath(); c.moveTo(x, 580); c.lineTo(x - 160, H); c.stroke(); }
      } }),
    st({ id: 'clinic', num: 7, name: 'どうぶつ びょういん', bgm: 'home', floor: [570, 880], color: '#4db6ac',
      tools: ['teddy', 'bunny', 'dino', 'book', 'chair', 'apple', 'banana', 'blanket', 'cushion', 'plate', 'box', 'bag'],
      rides: ['car', 'tricycle'],
      spawn: [['mimi', 760, 720], ['gaku', 1000, 760], ['choco', 560, 780], ['pyoko', 880, 820]],
      fixtures: [['bed', 360, 660], ['medshelf', 1180, 590], ['bed', 1420, 760]],
      bg(c, r) {
        B.wallpaper(c, 590, '#e3f6f0', '#d3efe6');
        B.window(c, 600, 120, 300, 220, (c, x, y, w, h) => { B.sky(c, '#9fd8ff', '#e3f6ff', y + h); B.tree(c, x + 220, y + h + 30, 0.9); B.cloud(c, x + 40, y + 60, 0.6); });
        G.rr(c, 980, 140, 160, 120, 14); G.fillO(c, '#ffffff', 3); c.fillStyle = '#e8424a'; c.fillRect(1046, 160, 28, 80); c.fillRect(1020, 186, 80, 28);
        B.frame(c, 180, 170, 160, 120, '#ffd23f', (c, x, y, w, h) => { G.heart(c, x + w / 2, y + h / 2 + 12, 36); c.fillStyle = '#ff8fab'; c.fill(); });
        B.floorWood(c, 590, '#cfe8ef');
      } }),
    st({ id: 'kinder', num: 8, name: 'どきどき ようちえん', bgm: 'park', floor: [580, 880], color: '#ffb74d',
      tools: ['book', 'chair', 'table', 'teddy', 'bunny', 'ball', 'box', 'blanket', 'cushion', 'plate', 'apple', 'onigiri', 'bag'],
      rides: ['slide', 'trampoline', 'train', 'tricycle'],
      spawn: [['lulu', 620, 760], ['pon', 860, 780], ['mimi', 1040, 740], ['choco', 1240, 790], ['pyoko', 460, 800]],
      fixtures: [['blackboard', 620, 470], ['piano', 1310, 640], ['desk', 760, 720], ['cubby', 150, 600]],
      bg(c, r) {
        B.wallpaper(c, 600, '#fff6d6', '#ffefc0');
        B.bunting(c, 0, 50, 1600, 50, 60);
        B.window(c, 1000, 140, 260, 200, (c, x, y, w, h) => { B.sky(c, '#9fd8ff', '#e3f6ff', y + h); B.cloud(c, x + 40, y + 60, 0.6); c.fillStyle = '#93d27a'; c.fillRect(x, y + h - 40, w, 40); });
        ['#ff8fab', '#7fb6ef', '#58c46b', '#ffd23f'].forEach((col, i) => { G.rr(c, 1320 + i * 60, 160 + (i % 2) * 30, 50, 60, 6); G.fillO(c, '#fff', 2); G.circ(c, 1345 + i * 60, 190 + (i % 2) * 30, 14); c.fillStyle = col; c.fill(); });
        B.floorWood(c, 600, '#f2c98a');
        G.ell(c, 800, 790, 420, 80); c.fillStyle = '#ffb3c8'; c.fill();
      } }),
    st({ id: 'station', num: 9, name: 'ガタンゴトン えき', bgm: 'shop', floor: [590, 880], color: '#4c9be8',
      tools: ['bag', 'basket', 'box', 'onigiri', 'apple', 'banana', 'bread', 'teddy', 'book', 'chair'],
      rides: ['train', 'car', 'tricycle'],
      spawn: [['lulu', 600, 760], ['gaku', 900, 720], ['pon', 1120, 780], ['papa', 1300, 800], ['futan', 420, 800]],
      fixtures: [['trainF', 800, 560], ['bench', 280, 740], ['gate', 1400, 720]],
      bg(c, r) {
        B.sky(c, '#9fd8ff', '#eaf7ff', 400);
        B.cloud(c, 240, 90, 0.9); B.cloud(c, 1180, 70, 1.0);
        for (let i = 0; i < 6; i++) B.house(c, 60 + i * 270, 360, 140 + (i % 2) * 40, 120 + (i % 3) * 20, ['#fff1dc', '#e3f1ff', '#fff8d6'][i % 3], ['#ff8a65', '#4c9be8', '#58b07a'][i % 3]);
        // 屋根
        G.rr(c, -20, 40, 1640, 40, 10); G.fillO(c, '#7fb6ef', 3);
        for (let x = 100; x < W; x += 300) { G.rr(c, x, 70, 18, 520, 4); G.fillO(c, '#a8b8d0', 2.5); }
        G.rr(c, 640, 110, 320, 60, 14); G.fillO(c, '#ffffff', 3); c.fillStyle = '#2f63ad'; c.font = `bold 40px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('あそびタウンえき', 800, 154);
        c.fillStyle = '#9aa3b8'; c.fillRect(0, 360, W, 200); c.fillStyle = '#7f879c'; for (let x = 0; x < W; x += 40) c.fillRect(x, 520, 24, 14);
        c.fillStyle = '#5a6278'; c.fillRect(0, 512, W, 6); c.fillRect(0, 540, W, 6);
        c.fillStyle = '#d8dce6'; c.fillRect(0, 570, W, H - 570);
        c.fillStyle = '#ffd23f'; c.fillRect(0, 586, W, 12);
        c.fillStyle = '#c8ccd8'; for (let x = 0; x < W; x += 80) for (let y = 620; y < H; y += 80) c.fillRect(x + ((y / 80) % 2) * 40, y, 38, 38);
      } }),
    st({ id: 'space', num: 10, name: 'うちゅう ごっこ', bgm: 'night', floor: [600, 880], color: '#7e57c2', night: true, lowGravity: true,
      tools: ['box', 'flashlight', 'teddy', 'dino', 'ball', 'bag', 'apple', 'onigiri'],
      rides: ['car', 'trampoline', 'tent'],
      spawn: [['lulu', 640, 740], ['gaku', 900, 760], ['choco', 1060, 800]],
      fixtures: [['planet', 300, 520, { col: '#ff9f6b', ring: true }], ['planet', 1000, 470, { col: '#7fd0e8' }], ['crater', 520, 820], ['rocketF', 1320, 690]],
      bg(c, r) {
        B.sky(c, '#141a44', '#4a3a8a', 640);
        B.stars(c, r, 220, 600);
        c.fillStyle = 'rgba(255,170,230,.15)'; G.ell(c, 600, 200, 500, 90, -0.2); c.fill();
        c.fillStyle = 'rgba(160,220,255,.12)'; G.ell(c, 1100, 160, 400, 70, 0.2); c.fill();
        c.fillStyle = '#ffd84a'; G.circ(c, 1500, 90, 26); c.fill();
        c.fillStyle = G.grad(c, 0, 590, 0, H, [[0, '#b9b0d8'], [1, '#9d93c4']]);
        c.beginPath(); c.moveTo(0, 620); for (let x = 0; x <= W; x += 100) c.quadraticCurveTo(x + 50, 580 + Math.sin(x) * 14, x + 100, 610); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
        c.fillStyle = 'rgba(130,120,170,.5)'; for (let i = 0; i < 14; i++) { G.ell(c, r() * W, 660 + r() * 220, 20 + r() * 30, 7 + r() * 8); c.fill(); }
      } }),
    st({ id: 'forest', num: 11, name: 'まほうの もり', bgm: 'camp', floor: [570, 880], color: '#26a69a',
      tools: ['acorn', 'flashlight', 'blanket', 'bag', 'teddy', 'bunny', 'book', 'apple', 'cake', 'box', 'duck', 'sheet'],
      rides: ['tent', 'trampoline'],
      spawn: [['choco', 640, 760], ['mimi', 880, 740], ['moko', 1060, 790], ['pyoko', 520, 820]],
      fixtures: [['mushroom', 360, 680], ['magictree', 1260, 620], ['fairypond', 780, 850]],
      bg(c, r) {
        B.sky(c, '#3fa39a', '#c9f0d8', 580);
        c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 6; i++) { c.save(); c.translate(200 + i * 260, 0); c.rotate(0.25); c.fillRect(0, -40, 50, 700); c.restore(); }
        for (let i = 0; i < 12; i++) B.tree(c, i * 145 + r() * 40, 580, 0.9 + r() * 0.5, ['#4f9e8a', '#5fb08a', '#6a9ed0'][i % 3], '#7a5a8a');
        B.grass(c, 570, '#86d0a0', '#5fae88');
        B.flowers(c, r, 590, 50);
        for (let i = 0; i < 6; i++) { const x = r() * W, y = 620 + r() * 240; G.rr(c, x - 5, y - 20, 10, 20, 4); G.fillO(c, '#fff4e0', 2); G.ell(c, x, y - 22, 16, 10); G.fillO(c, ['#ffd23f', '#b39ae8', '#7fd0e8'][i % 3], 2); }
      } }),
    st({ id: 'fest', num: 12, name: 'おまつり ひろば', bgm: 'fest', floor: [580, 880], color: '#ef5350',
      tools: ['apple', 'banana', 'cake', 'onigiri', 'bread', 'ball', 'teddy', 'bunny', 'box', 'basket', 'sheet', 'plate', 'table'],
      rides: ['car', 'train', 'tricycle'],
      spawn: [['lulu', 560, 780], ['pon', 1040, 760], ['mimi', 1200, 800], ['moko', 400, 820], ['futan', 680, 820], ['ricky', 860, 760], ['mama', 1000, 840], ['papa', 1120, 830]],
      fixtures: [['stall', 230, 650, { label: 'きんぎょ', goods: 'fish', col: '#4c9be8' }], ['yagura', 800, 620], ['stall', 1370, 650, { label: 'たべもの', goods: 'food', col: '#ff6f61' }]],
      bg(c, r) {
        B.sky(c, '#3a3a8a', '#ffb07a', 580);
        B.stars(c, r, 40, 220);
        c.fillStyle = '#5a4a8a'; G.ell(c, 400, 580, 600, 120); c.fill(); G.ell(c, 1300, 580, 600, 140); c.fill();
        for (let i = 0; i < 9; i++) B.tree(c, 40 + i * 190, 580, 0.8, '#4a6a7a', '#4a3a5a');
        B.lanterns(c, 0, 120, 800, 140, 60); B.lanterns(c, 800, 140, 1600, 110, 60);
        c.fillStyle = G.grad(c, 0, 580, 0, H, [[0, '#d9b98a'], [1, '#c9a26a']]); c.fillRect(0, 580, W, H - 580);
        G.speckle(c, 0, 600, W, 300, 'rgba(140,100,60,.25)', 200, 2);
      } }),
  ];
  PT.stageById = (id) => PT.STAGES.find((s) => s.id === id);

  /* ステージ背景をオフスクリーンへ描く */
  PT.renderStageBg = (stage, scale = 1) => {
    const cv = document.createElement('canvas');
    cv.width = Math.round(W * scale); cv.height = Math.round(H * scale);
    const c = cv.getContext('2d');
    c.scale(scale, scale);
    stage.bg(c, PT.seeded(stage.num * 977));
    return cv;
  };
})();
