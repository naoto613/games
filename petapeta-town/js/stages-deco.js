/* ステージの かざり（にぎやかな 背景）と うごく 演出 */
'use strict';
(() => {
  const G = PT.G, B = PT.BG, W = PT.W;
  const S = (id) => PT.stageById(id);

  /* ---------- 小物パーツ ---------- */
  const P = (PT.DECO = {});
  P.plant = (c, x, y, s = 1, pot = '#e2865a') => {
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.36; c.save(); c.translate(x, y - 46 * s); c.rotate(a + Math.PI / 2); G.ell(c, 0, -26 * s, 9 * s, 26 * s); G.fillO(c, i % 2 ? '#5fae58' : '#6dbb5f', 2); c.restore(); }
    G.poly(c, [x - 22 * s, y - 48 * s, x + 22 * s, y - 48 * s, x + 16 * s, y, x - 16 * s, y]); G.fillO(c, pot, 3);
    G.rr(c, x - 25 * s, y - 54 * s, 50 * s, 10 * s, 4); G.fillO(c, PT.shade(pot, -0.1), 2.5);
  };
  P.flowerPot = (c, x, y, s = 1, col = '#ff8fab') => {
    G.poly(c, [x - 16 * s, y - 30 * s, x + 16 * s, y - 30 * s, x + 12 * s, y, x - 12 * s, y]); G.fillO(c, '#d9844e', 2.5);
    for (let i = 0; i < 3; i++) { const fx = x + (i - 1) * 12 * s, fy = y - 44 * s - (i % 2) * 8 * s; c.strokeStyle = '#4c9a50'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(fx, y - 30 * s); c.lineTo(fx, fy); c.stroke(); for (let k = 0; k < 5; k++) { const a = (k / 5) * PT.TAU; G.circ(c, fx + Math.cos(a) * 5 * s, fy + Math.sin(a) * 5 * s, 4 * s); c.fillStyle = col; c.fill(); } G.circ(c, fx, fy, 3 * s); c.fillStyle = '#ffd23f'; c.fill(); }
  };
  P.lampPost = (c, x, y, s = 1) => {
    G.rr(c, x - 5 * s, y - 220 * s, 10 * s, 220 * s, 4); G.fillO(c, '#4a5a7a', 2.5);
    G.rr(c, x - 14 * s, y - 14 * s, 28 * s, 14 * s, 4); G.fillO(c, '#4a5a7a', 2);
    G.poly(c, [x - 18 * s, y - 220 * s, x + 18 * s, y - 220 * s, x + 12 * s, y - 250 * s, x - 12 * s, y - 250 * s]); G.fillO(c, '#fff3b0', 2.5);
    G.poly(c, [x - 22 * s, y - 250 * s, x, y - 266 * s, x + 22 * s, y - 250 * s]); G.fillO(c, '#4a5a7a', 2.5);
  };
  P.clock = (c, x, y, r = 40, col = '#ff8a65') => {
    G.circ(c, x, y, r); G.fillO(c, col, 3); G.circ(c, x, y, r * 0.8); c.fillStyle = '#fffaf0'; c.fill();
    c.fillStyle = '#3e3550'; for (let i = 0; i < 12; i++) { const a = (i / 12) * PT.TAU; G.circ(c, x + Math.cos(a) * r * 0.66, y + Math.sin(a) * r * 0.66, 2); c.fill(); }
  };
  P.hands = (c, x, y, r, t) => {
    c.strokeStyle = '#3e3550'; c.lineCap = 'round';
    const m = t * 0.0006, h = t * 0.00005;
    c.lineWidth = 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(h - 1.5) * r * 0.4, y + Math.sin(h - 1.5) * r * 0.4); c.stroke();
    c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(m - 1.5) * r * 0.62, y + Math.sin(m - 1.5) * r * 0.62); c.stroke();
    G.circ(c, x, y, 3.5); c.fillStyle = '#ff6f61'; c.fill();
  };
  P.palm = (c, x, y, s = 1) => {
    c.strokeStyle = '#a5743a'; c.lineWidth = 16 * s; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 30 * s, y - 120 * s, x + 10 * s, y - 230 * s); c.stroke();
    c.strokeStyle = '#c4925a'; c.lineWidth = 3; for (let i = 1; i < 9; i++) { const t = i / 9; const px = x + 2 * (1 - t) * t * 30 * s + t * t * 10 * s, py = y - t * 230 * s; c.beginPath(); c.moveTo(px - 8 * s, py); c.lineTo(px + 8 * s, py + 4); c.stroke(); }
    const tx = x + 10 * s, ty = y - 230 * s;
    for (let i = 0; i < 7; i++) { const a = -Math.PI + (i / 6) * Math.PI + (i % 2) * 0.1; c.save(); c.translate(tx, ty); c.rotate(a); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(50 * s, -26 * s, 100 * s, 14 * s); c.quadraticCurveTo(50 * s, 0, 0, 6); c.closePath(); G.fillO(c, i % 2 ? '#4fae58' : '#5fc468', 2.5); c.restore(); }
    G.circ(c, tx - 8, ty + 10, 9 * s); G.fillO(c, '#8a5a2b', 2); G.circ(c, tx + 10, ty + 12, 9 * s); G.fillO(c, '#8a5a2b', 2);
  };
  P.mushroomSmall = (c, x, y, s = 1, col = '#ff6f61') => {
    G.rr(c, x - 6 * s, y - 22 * s, 12 * s, 22 * s, 4); G.fillO(c, '#fff4e0', 2);
    G.blob(c, [x - 22 * s, y - 18 * s, x - 16 * s, y - 36 * s, x, y - 42 * s, x + 16 * s, y - 36 * s, x + 22 * s, y - 18 * s]); G.fillO(c, col, 2.5);
    c.fillStyle = '#fff'; G.circ(c, x - 8 * s, y - 30 * s, 3.5 * s); c.fill(); G.circ(c, x + 9 * s, y - 27 * s, 3 * s); c.fill();
  };
  P.crystal = (c, x, y, s = 1, col = '#b39ae8') => {
    for (const [dx, h, a] of [[-14, 50, -0.3], [0, 70, 0], [14, 44, 0.3]]) { c.save(); c.translate(x + dx * s, y); c.rotate(a); G.poly(c, [-9 * s, 0, -9 * s, -h * s * 0.8, 0, -h * s, 9 * s, -h * s * 0.8, 9 * s, 0]); G.fillO(c, col, 2.5); c.fillStyle = 'rgba(255,255,255,.45)'; G.poly(c, [-6 * s, -4, -6 * s, -h * s * 0.75, 0, -h * s * 0.9, 0, -4]); c.fill(); c.restore(); }
  };
  P.frameArt = (c, x, y, w, h, col, kind) => {
    B.frame(c, x, y, w, h, col, (c2, ix, iy, iw, ih) => {
      if (kind === 'sun') { G.circ(c2, ix + iw / 2, iy + ih / 2, ih * 0.25); c2.fillStyle = '#ffd23f'; c2.fill(); }
      if (kind === 'house') { G.rr(c2, ix + iw * 0.3, iy + ih * 0.45, iw * 0.4, ih * 0.4, 2); c2.fillStyle = '#ff8a65'; c2.fill(); G.poly(c2, [ix + iw * 0.22, iy + ih * 0.47, ix + iw * 0.5, iy + ih * 0.18, ix + iw * 0.78, iy + ih * 0.47]); c2.fillStyle = '#4c9be8'; c2.fill(); }
      if (kind === 'flower') { for (let k = 0; k < 5; k++) { const a = (k / 5) * PT.TAU; G.circ(c2, ix + iw / 2 + Math.cos(a) * ih * 0.16, iy + ih / 2 + Math.sin(a) * ih * 0.16, ih * 0.12); c2.fillStyle = '#ff8fab'; c2.fill(); } }
      if (kind === 'fish') { G.ell(c2, ix + iw / 2, iy + ih / 2, iw * 0.25, ih * 0.18); c2.fillStyle = '#ff9f43'; c2.fill(); }
      if (kind === 'family') { ['#5f9de3', '#f39c4f', '#f2879d'].forEach((cc, k) => { G.circ(c2, ix + iw * (0.28 + k * 0.22), iy + ih * 0.5, ih * 0.16); c2.fillStyle = cc; c2.fill(); }); }
    });
  };
  P.garland = (c, x1, y1, x2, y2, cols) => {
    c.strokeStyle = '#7f8fa6'; c.lineWidth = 2; c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo((x1 + x2) / 2, y1 + 50, x2, y2); c.stroke();
    const n = Math.floor((x2 - x1) / 50);
    for (let i = 1; i < n; i++) { const t = i / n; const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t * t * x2; const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * (y1 + 50) + t * t * y2; G.circ(c, x, y + 12, 12); G.fillO(c, cols[i % cols.length], 2); }
  };
  P.signpost = (c, x, y, label, col = '#e8a35c') => {
    G.rr(c, x - 6, y - 110, 12, 110, 4); G.fillO(c, '#a5743a', 2.5);
    G.rr(c, x - 60, y - 120, 120, 40, 8); G.fillO(c, col, 3);
    c.fillStyle = '#fff'; c.font = `900 22px ${PT.FONT}`; c.textAlign = 'center'; c.fillText(label, x, y - 92);
  };
  P.bunnyStatue = (c, x, y) => { G.ell(c, x, y - 20, 22, 20); G.fillO(c, '#ffffff', 2.5); G.ell(c, x - 7, y - 54, 6, 16); G.fillO(c, '#ffffff', 2); G.ell(c, x + 7, y - 54, 6, 16); G.fillO(c, '#ffffff', 2); };

  /* ---------- うごく演出パーツ ---------- */
  const A = (PT.AMB = {});
  A.butterflies = (c, t, n, y0, y1, cols = ['#ffb3d0', '#ffe36a', '#9fd8ff', '#c9b3f0']) => {
    for (let i = 0; i < n; i++) {
      const x = ((t * 0.03 + i * 437) % 1900) - 150, y = y0 + (y1 - y0) * (0.5 + 0.5 * Math.sin(t * 0.0011 + i * 2.3));
      const fl = Math.abs(Math.sin(t * 0.02 + i));
      c.save(); c.translate(x, y + Math.sin(t * 0.004 + i) * 14);
      for (const sd of [-1, 1]) { c.save(); c.scale(sd * (0.3 + fl * 0.7), 1); G.ell(c, 8, -5, 9, 7, -0.4); c.fillStyle = cols[i % cols.length]; c.fill(); G.ell(c, 6, 5, 6, 5, 0.4); c.fill(); c.restore(); }
      G.ell(c, 0, 0, 2, 7); c.fillStyle = '#3e3550'; c.fill();
      c.restore();
    }
  };
  A.birds = (c, t, n, y0, col = '#5a6a8a') => {
    c.strokeStyle = col; c.lineWidth = 3; c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = ((t * 0.06 + i * 160) % 2400) - 300, y = y0 + i * 18 + Math.sin(t * 0.002 + i) * 10;
      const f = Math.sin(t * 0.015 + i) * 7;
      c.beginPath(); c.moveTo(x - 14, y - f); c.quadraticCurveTo(x - 6, y - 6, x, y); c.quadraticCurveTo(x + 6, y - 6, x + 14, y - f); c.stroke();
    }
  };
  A.clouds = (c, t, list) => { list.forEach(([x, y, s, sp]) => B.cloud(c, ((x + t * sp) % 2000) - 250, y, s, 'rgba(255,255,255,.85)')); };
  A.fireflies = (c, t, n, y0, y1) => {
    for (let i = 0; i < n; i++) {
      const x = 100 + ((i * 397 + Math.sin(t * 0.0007 + i) * 120) % 1400), y = y0 + ((i * 211) % (y1 - y0)) + Math.sin(t * 0.0013 + i * 1.7) * 30;
      const a = 0.4 + Math.sin(t * 0.004 + i * 2) * 0.4;
      c.fillStyle = `rgba(230,255,140,${a * 0.3})`; G.circ(c, x, y, 13); c.fill();
      c.fillStyle = `rgba(240,255,170,${a})`; G.circ(c, x, y, 4); c.fill();
    }
  };
  A.twinkle = (c, t, pts, col = '#fff6b8') => {
    pts.forEach(([x, y, r], i) => { c.globalAlpha = 0.1 + (0.5 + Math.sin(t * 0.005 + i * 1.3) * 0.45); G.star(c, x, y, (r || 5) * 2, r || 5); c.fillStyle = col; c.fill(); c.globalAlpha = 1; });
  };
  A.bulbs = (c, t, x1, y1, x2, y2, n, cols = ['#ffe36a', '#ff8fab', '#7fd0e8', '#9cf0a0']) => {
    for (let i = 0; i <= n; i++) {
      const k = i / n, x = PT.lerp(x1, x2, k), y = PT.lerp(y1, y2, k) + Math.sin(k * Math.PI) * 30;
      const on = Math.floor(t / 400 + i) % 3 !== 0;
      c.fillStyle = on ? cols[i % cols.length] : 'rgba(255,255,255,.4)';
      if (on) { c.globalAlpha = 0.35; G.circ(c, x, y + 6, 13); c.fill(); c.globalAlpha = 1; }
      G.circ(c, x, y + 6, 6); c.fill();
    }
  };
  A.shootingStar = (c, t, period = 7000, seed = 0) => {
    const k = ((t + seed) % period) / 1200;
    if (k > 1) return;
    const x = 200 + ((Math.floor((t + seed) / period) * 523) % 1100), y = 240 + ((Math.floor((t + seed) / period) * 97) % 120);
    c.save(); c.globalAlpha = 1 - k; c.strokeStyle = '#fff6b8'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x + k * 300, y + k * 140); c.lineTo(x + k * 300 - 80, y + k * 140 - 38); c.stroke();
    G.star(c, x + k * 300, y + k * 140, 8, 3.5); c.fillStyle = '#fff'; c.fill(); c.restore();
  };
  A.balloonsRise = (c, t, n, cols = ['#ff5d78', '#58b9f0', '#ffd23f', '#9b6fd6', '#58c46b']) => {
    for (let i = 0; i < n; i++) {
      const y = 620 - ((t * 0.025 + i * 190) % 800), x = 150 + ((i * 331) % 1300) + Math.sin(t * 0.001 + i) * 20;
      c.save(); c.translate(x, y); c.scale(0.45, 0.45); PT.ITEMS.balloon.draw(c, t, { color: cols[i % cols.length], seed: i }); c.restore();
    }
  };

  const extend = (id, o) => {
    const st = S(id); if (!st) return;
    const bg0 = st.bg, amb0 = st.ambient;
    if (o.deco) st.bg = (c, r) => { bg0(c, r); o.deco(c, PT.seeded(st.num * 131)); };
    if (o.amb) st.ambient = (c, t) => { o.amb(c, t); if (amb0) amb0(c, t); };
    if (o.favs) st.favs = o.favs;
  };

  /* ================= 1 おうち ================= */
  extend('home', {
    favs: ['blocks', 'robottoy', 'panda', 'camera', 'crayons', 'phone', 'letter', 'pancake', 'cookie', 'juice', 'pudding', 'musicbox', 'horse', 'xylophone'],
    deco(c, r) {
      P.garland(c, 30, 190, 560, 200, ['#ff8fab', '#ffd23f', '#7fb6ef', '#9cf0a0']);
      P.garland(c, 1020, 200, 1580, 190, ['#ffd23f', '#ff8fab', '#b39ae8']);
      P.clock(c, 1100, 260, 42, '#ff8a65');
      // かべの たな
      G.rr(c, 180, 330, 230, 14, 5); G.fillO(c, '#c99a64', 2.5);
      P.flowerPot(c, 214, 330, 1.0, '#ff8fab'); G.rr(c, 250, 290, 30, 40, 4); G.fillO(c, '#7fb6ef', 2); G.rr(c, 282, 296, 26, 34, 4); G.fillO(c, '#ffd23f', 2);
      c.save(); c.translate(350, 330); c.scale(0.45, 0.45); PT.ITEMS.teddy.draw(c, 0, {}); c.restore();
      G.rr(c, 1170, 330, 200, 14, 5); G.fillO(c, '#c99a64', 2.5);
      c.save(); c.translate(1210, 330); c.scale(0.5, 0.5); PT.ITEMS.robottoy.draw(c, 0, {}); c.restore();
      P.flowerPot(c, 1290, 330, 1.0, '#b39ae8'); P.flowerPot(c, 1340, 330, 0.8, '#ffd23f');
      // かべの ステッカー
      c.fillStyle = 'rgba(255,200,120,.5)'; [[520, 470], [1040, 430], [140, 450], [1400, 470]].forEach(([x, y], i) => { G.star(c, x, y, 16, 7); c.fill(); });
      P.plant(c, 70, 590, 1.3);
      P.plant(c, 1560, 600, 1.2, '#7fb6ef');
      // ペットの ベッド
      G.ell(c, 1250, 590, 60, 18); G.fillO(c, '#ff9fb8', 3); G.ell(c, 1250, 584, 48, 12); c.fillStyle = '#ffe0ea'; c.fill();
      // つみきと えほん
      ['#ff6f61', '#ffd23f', '#58c46b'].forEach((col, i) => { G.rr(c, 1440 + i * 26, 640 - (i === 1 ? 26 : 0), 24, 24, 3); G.fillO(c, col, 2); });
      G.rr(c, 560, 830, 60, 12, 3); G.fillO(c, '#4c9be8', 2); G.rr(c, 566, 818, 52, 12, 3); G.fillO(c, '#ff8fab', 2);
    },
    amb(c, t) {
      P.hands(c, 1100, 260, 42, t);
      // ねこが すやすや
      c.save(); c.translate(1250, 586); const br = 1 + Math.sin(t * 0.003) * 0.04; c.scale(br, br);
      G.ell(c, 0, -10, 30, 14); G.fillO(c, '#ffffff', 2.5); G.circ(c, 22, -16, 12); G.fillO(c, '#ffffff', 2.5);
      G.poly(c, [16, -24, 18, -34, 24, -26]); G.fillO(c, '#ffffff', 2); G.poly(c, [26, -26, 32, -34, 32, -22]); G.fillO(c, '#ffffff', 2);
      c.strokeStyle = '#2b2440'; c.lineWidth = 2; c.beginPath(); c.arc(22, -16, 4, 0.2, 2.9); c.stroke();
      c.restore();
      if ((t / 1500) % 2 < 1) { c.fillStyle = '#7a8fb8'; c.font = `bold 20px ${PT.FONT}`; c.fillText('z', 1286, 548 - ((t / 30) % 50)); }
      A.bulbs(c, t, 620, 400, 980, 400, 9);
    },
  });

  /* ================= 2 こうえん ================= */
  extend('park', {
    favs: ['kite', 'bugnet', 'seed', 'wateringcan', 'bicycle', 'seesaw', 'pool', 'skateboard', 'icecream', 'juice', 'magnifier', 'pinwheel'],
    deco(c, r) {
      // 花だん
      for (let i = 0; i < 2; i++) { const x0 = i ? 1380 : 420; G.rr(c, x0, 548, 200, 26, 10); G.fillO(c, '#a5743a', 2.5); for (let k = 0; k < 9; k++) { const fx = x0 + 14 + k * 21; c.strokeStyle = '#4c9a50'; c.lineWidth = 3; c.beginPath(); c.moveTo(fx, 552); c.lineTo(fx, 530); c.stroke(); G.ell(c, fx, 524, 7, 9); c.fillStyle = ['#ff6f61', '#ffd23f', '#ff8fab', '#b39ae8'][k % 4]; c.fill(); } }
      P.lampPost(c, 640, 600, 0.9); P.lampPost(c, 1090, 590, 0.85);
      // ふんすい
      G.ell(c, 960, 620, 90, 22); G.fillO(c, '#cfd8ea', 3); G.ell(c, 960, 616, 74, 14); c.fillStyle = '#9fd8f8'; c.fill();
      G.rr(c, 952, 560, 16, 56, 5); G.fillO(c, '#cfd8ea', 2.5); G.ell(c, 960, 560, 30, 9); G.fillO(c, '#cfd8ea', 2.5);
      P.signpost(c, 560, 640, 'こうえん', '#58b07a');
      // ベンチ（奥）
      G.rr(c, 1460, 610, 120, 12, 5); G.fillO(c, '#e8a35c', 2); G.rr(c, 1460, 586, 120, 10, 5); G.fillO(c, '#e8a35c', 2);
      B.bush(c, 340, 640, 0.9); B.bush(c, 1500, 660, 0.9);
      P.mushroomSmall(c, 120, 860, 1.2); P.mushroomSmall(c, 160, 870, 0.8, '#ffd23f');
    },
    amb(c, t) {
      A.clouds(c, t, [[100, 160, 0.7, 0.012], [900, 110, 0.5, 0.008]]);
      // ふんすいの みず
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32; const k = ((t * 0.001 + i * 0.14) % 1); c.fillStyle = 'rgba(160,220,255,.8)'; G.circ(c, 960 + Math.cos(a) * 60 * k, 556 + Math.sin(a) * 50 * k + 140 * k * k, 4); c.fill(); }
      // たこ と ききゅう
      const kx = 1300 + Math.sin(t * 0.0008) * 40, ky = 230 + Math.sin(t * 0.0012) * 20;
      c.strokeStyle = '#7f8fa6'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(kx, ky + 30); c.quadraticCurveTo(kx - 60, ky + 200, kx - 120, 540); c.stroke();
      c.save(); c.translate(kx, ky + 60); c.scale(0.6, 0.6); PT.ITEMS.kite.draw(c, t, {}); c.restore();
      const hx = ((t * 0.01) % 2000) - 200;
      c.save(); c.translate(hx, 300 + Math.sin(t * 0.001) * 10);
      G.circ(c, 0, -40, 40); G.fillO(c, '#ff8a65', 3); c.fillStyle = '#ffd23f'; c.fillRect(-8, -80, 16, 80);
      c.strokeStyle = '#7a5a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-26, -10); c.lineTo(-10, 20); c.moveTo(26, -10); c.lineTo(10, 20); c.stroke();
      G.rr(c, -12, 18, 24, 16, 3); G.fillO(c, '#a5743a', 2); c.restore();
      A.butterflies(c, t, 4, 560, 760);
      A.birds(c, t, 3, 260);
    },
  });

  /* ================= 3 おみせ ================= */
  extend('shop', {
    favs: ['strawberry', 'donut', 'icecream', 'pizza', 'burger', 'grapes', 'carrot', 'juice', 'cookie', 'candy', 'corn', 'bento', 'bicycle', 'bus', 'phone', 'letter', 'camera'],
    deco(c, r) {
      // くだものの はこ（やおや）
      for (let i = 0; i < 3; i++) { const x = 600 + i * 150; G.rr(c, x, 530, 120, 46, 6); G.fillO(c, '#c99a64', 2.5); for (let k = 0; k < 5; k++) { G.circ(c, x + 16 + k * 22, 528, 11); G.fillO(c, ['#ef4b4b', '#ff9f43', '#ffd84a'][i], 2); } }
      // パン屋の かんばん
      G.rr(c, 360, 470, 110, 90, 8); G.fillO(c, '#3e3550', 3); c.fillStyle = '#fff'; c.font = `900 22px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('きょうの', 415, 504); c.fillText('おすすめ', 415, 532);
      c.save(); c.translate(415, 556); c.scale(0.35, 0.35); PT.ITEMS.bread.draw(c, 0, {}); c.restore();
      P.flowerPot(c, 60, 590, 1.3, '#ff6f61'); P.flowerPot(c, 1050, 588, 1.2, '#b39ae8'); P.flowerPot(c, 1560, 590, 1.3, '#ffd23f');
      P.lampPost(c, 1070, 600, 0.95);
      // じてんしゃ
      c.save(); c.translate(1500, 600); c.scale(0.8, 0.8); PT.ITEMS.bicycle.draw(c, 0, {}); c.restore();
      // ふうせん
      for (let i = 0; i < 3; i++) { c.save(); c.translate(1130 + i * 28, 560); c.scale(0.5, 0.5); PT.ITEMS.balloon.draw(c, 0, { color: ['#ff5d78', '#58b9f0', '#ffd23f'][i] }); c.restore(); }
      // スーパーの ポスター
      G.rr(c, 1140, 360, 90, 110, 6); G.fillO(c, '#fff', 2.5); c.save(); c.translate(1185, 450); c.scale(0.6, 0.6); PT.ITEMS.donut.draw(c, 0, {}); c.restore();
      G.rr(c, 1380, 360, 90, 110, 6); G.fillO(c, '#fff', 2.5); c.save(); c.translate(1425, 455); c.scale(0.6, 0.6); PT.ITEMS.icecream.draw(c, 0, {}); c.restore();
    },
    amb(c, t) {
      A.bulbs(c, t, 20, 222, 500, 222, 8); A.bulbs(c, t, 540, 222, 1060, 222, 9); A.bulbs(c, t, 1100, 222, 1580, 222, 8);
      A.birds(c, t, 3, 260, '#7f8fa6');
      // はとが とことこ
      const px = ((t * 0.02) % 1900) - 150;
      c.save(); c.translate(px, 600 + Math.abs(Math.sin(t * 0.01)) * -3); G.ell(c, 0, -12, 16, 11); G.fillO(c, '#9aa3b8', 2); G.circ(c, 14, -22, 8); G.fillO(c, '#9aa3b8', 2); G.poly(c, [21, -22, 28, -20, 21, -18]); c.fillStyle = '#ff9f43'; c.fill(); G.circ(c, 16, -24, 1.8); c.fillStyle = '#2b2440'; c.fill(); c.restore();
    },
  });

  /* ================= 4 ビーチ ================= */
  extend('beach', {
    favs: ['watermelon', 'icecream', 'juice', 'boat', 'kite', 'fishingrod', 'pool', 'corn', 'camera', 'skateboard'],
    deco(c, r) {
      P.palm(c, 120, 640, 1.2); P.palm(c, 1390, 630, 1.0);
      // ライフガードの やぐら
      c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.beginPath(); c.moveTo(1180, 620); c.lineTo(1200, 500); c.moveTo(1260, 620); c.lineTo(1240, 500); c.stroke();
      G.rr(c, 1186, 470, 68, 34, 6); G.fillO(c, '#ff6f61', 3); c.fillStyle = '#fff'; c.fillRect(1214, 476, 12, 24); c.fillRect(1208, 482, 24, 12);
      // とおくの パラソル
      [[300, 610, '#58b9f0'], [520, 600, '#ffd23f'], [960, 606, '#ff8fab']].forEach(([x, y, col]) => { c.strokeStyle = '#8a5a2b'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 60); c.stroke(); c.beginPath(); c.moveTo(x - 40, y - 50); c.quadraticCurveTo(x, y - 90, x + 40, y - 50); c.closePath(); G.fillO(c, col, 2.5); G.rr(c, x - 30, y - 6, 60, 10, 3); c.fillStyle = '#fff'; c.fill(); });
      // ひとで と かいがら
      [[260, 820, '#ff9f43'], [840, 870, '#ff6f91'], [1480, 840, '#ffd23f']].forEach(([x, y, col]) => { G.star(c, x, y, 18, 8, 5); G.fillO(c, col, 2.5); });
      [[460, 860], [1180, 880], [700, 800]].forEach(([x, y]) => { c.save(); c.translate(x, y); c.scale(0.5, 0.5); PT.ITEMS.shell.draw(c, 0, {}); c.restore(); });
      // あしあと
      c.fillStyle = 'rgba(200,160,100,.35)'; for (let i = 0; i < 8; i++) { G.ell(c, 900 + i * 40, 720 + Math.sin(i) * 10 + (i % 2) * 14, 8, 5); c.fill(); }
      // とおくの おしろ
      c.save(); c.translate(640, 680); c.scale(0.5, 0.5); PT.ITEMS.castle.draw(c, 0, { level: 3 }); c.restore();
    },
    amb(c, t) {
      A.clouds(c, t, [[300, 180, 0.6, 0.01], [1100, 140, 0.8, 0.007]]);
      // かもめ
      A.birds(c, t, 4, 260, '#ffffff');
      // ふね
      const bx = ((t * 0.008) % 2000) - 200;
      c.save(); c.translate(bx, 470); G.poly(c, [-40, 0, 40, 0, 30, 14, -30, 14]); G.fillO(c, '#ffffff', 2); c.fillStyle = '#4c9be8'; c.fillRect(-36, 4, 72, 4); G.poly(c, [0, -2, 0, -50, 30, -4]); G.fillO(c, '#ff8fab', 2); c.restore();
      // うみの キラキラ
      for (let i = 0; i < 14; i++) { const a = 0.5 + Math.sin(t * 0.004 + i * 1.7) * 0.5; c.globalAlpha = a; G.star(c, (i * 113) % 1600, 410 + (i * 37) % 150, 6, 2); c.fillStyle = '#fff'; c.fill(); }
      c.globalAlpha = 1;
      // イルカ
      const k = ((t % 9000) / 1600);
      if (k < 1) { const x = 300 + (Math.floor(t / 9000) * 470) % 900; c.save(); c.translate(x + k * 160, 470 - Math.sin(k * Math.PI) * 90); c.rotate(-1 + k * 2); G.ell(c, 0, 0, 34, 13); G.fillO(c, '#7fa8d8', 2.5); G.poly(c, [-6, -10, 4, -22, 10, -10]); G.fillO(c, '#7fa8d8', 2); G.circ(c, 20, -3, 2); c.fillStyle = '#2b2440'; c.fill(); c.restore(); }
    },
  });

  /* ================= 5 キャンプ ================= */
  extend('camp', {
    favs: ['corn', 'bento', 'juice', 'magnifier', 'bugnet', 'fishingrod', 'guitar', 'moon', 'cloud', 'boat', 'horse'],
    deco(c, r) {
      P.signpost(c, 1530, 640, 'キャンプじょう', '#a5743a');
      // まきの やま
      for (let i = 0; i < 6; i++) { G.rr(c, 560 + (i % 3) * 34 + (i > 2 ? 16 : 0), 600 - (i > 2 ? 24 : 0), 34, 24, 10); G.fillO(c, '#9a6b42', 2.5); G.circ(c, 560 + (i % 3) * 34 + (i > 2 ? 16 : 0) + 30, 612 - (i > 2 ? 24 : 0), 9); c.fillStyle = '#e8b878'; c.fill(); }
      // きのこ
      P.mushroomSmall(c, 110, 860, 1.2); P.mushroomSmall(c, 150, 870, 0.8, '#ffd23f'); P.mushroomSmall(c, 1040, 860, 1.0, '#b39ae8');
      // ランタン
      G.rr(c, 205, 680, 24, 34, 6); G.fillO(c, '#ffe08a', 2.5); c.fillStyle = 'rgba(255,230,140,.25)'; G.circ(c, 217, 696, 50); c.fill();
      // ふくろうの いる き
      G.rr(c, 1550, 300, 30, 300, 8); G.fillO(c, '#6b4a3a', 3); G.circ(c, 1565, 380, 14); c.fillStyle = '#3a2a2a'; c.fill();
    },
    amb(c, t) {
      A.fireflies(c, t, 14, 480, 800);
      A.shootingStar(c, t, 6000);
      A.bulbs(c, t, 0, 480, 520, 470, 10, ['#ffe36a', '#ffb547']);
      // ふくろう
      const blink = (t % 3000) < 150;
      c.save(); c.translate(1565, 372); G.ell(c, 0, 0, 16, 18); G.fillO(c, '#9a7a5a', 2);
      for (const sd of [-1, 1]) { G.circ(c, sd * 7, -6, 6); c.fillStyle = '#fff'; c.fill(); if (!blink) { G.circ(c, sd * 7, -6, 3); c.fillStyle = '#2b2440'; c.fill(); } }
      G.poly(c, [-2, -2, 2, -2, 0, 3]); c.fillStyle = '#ffb02e'; c.fill(); c.restore();
    },
  });

  /* ================= 6 ゆうえんち ================= */
  extend('fun', {
    favs: ['candy', 'icecream', 'donut', 'juice', 'mirrorball', 'trumpet', 'tambourine', 'airplane', 'carpet', 'horse', 'bus', 'camera'],
    deco(c, r) {
      // ジェットコースター（奥）
      c.strokeStyle = '#e88aa8'; c.lineWidth = 8; c.beginPath(); c.moveTo(380, 540); for (let x = 380; x <= 1200; x += 20) c.lineTo(x, 400 - Math.sin((x - 380) / 820 * Math.PI * 2) * 90 - Math.sin((x - 380) / 820 * Math.PI) * 60); c.stroke();
      c.strokeStyle = 'rgba(220,150,180,.6)'; c.lineWidth = 4; for (let x = 400; x <= 1200; x += 60) { const y = 400 - Math.sin((x - 380) / 820 * Math.PI * 2) * 90 - Math.sin((x - 380) / 820 * Math.PI) * 60; c.beginPath(); c.moveTo(x, y); c.lineTo(x, 580); c.stroke(); }
      // わたあめ・ポップコーンの ワゴン
      const cart = (x, label, col) => { G.rr(c, x - 50, 660, 100, 56, 8); G.fillO(c, col, 3); c.fillStyle = '#fff'; c.font = `900 18px ${PT.FONT}`; c.textAlign = 'center'; c.fillText(label, x, 696); for (const sx of [-30, 30]) { G.circ(c, x + sx, 720, 12); G.fillO(c, '#3e4a63', 2.5); } c.strokeStyle = '#cfd8ea'; c.lineWidth = 5; c.beginPath(); c.moveTo(x - 46, 660); c.lineTo(x - 46, 600); c.moveTo(x + 46, 660); c.lineTo(x + 46, 600); c.stroke(); G.rr(c, x - 60, 590, 120, 18, 8); G.fillO(c, '#ffffff', 2.5); };
      cart(560, 'わたあめ', '#ff8fab'); cart(1080, 'ポップコーン', '#ffb547');
      G.blob(c, [540, 640, 548, 616, 566, 608, 584, 620, 586, 640]); c.fillStyle = '#ffd1e3'; c.fill();
      for (let i = 0; i < 6; i++) { G.circ(c, 1060 + (i % 3) * 18, 646 - Math.floor(i / 3) * 14, 9); c.fillStyle = '#fff6d8'; c.fill(); }
      // はた
      [[460, '#ff6f61'], [1200, '#58b9f0'], [1460, '#ffd23f']].forEach(([x, col]) => { c.strokeStyle = '#7f8fa6'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, 600); c.lineTo(x, 430); c.stroke(); G.poly(c, [x, 430, x + 50, 445, x, 460]); G.fillO(c, col, 2.5); });
    },
    amb(c, t) {
      A.balloonsRise(c, t, 7);
      A.bulbs(c, t, 470, 380, 1130, 380, 18);
      // コースターの くるま
      const k = (t * 0.00018) % 1, x = 380 + k * 820, y = 400 - Math.sin(k * Math.PI * 2) * 90 - Math.sin(k * Math.PI) * 60;
      c.save(); c.translate(x, y - 10); G.rr(c, -24, -16, 48, 20, 6); G.fillO(c, '#ffd23f', 2.5); c.restore();
      A.clouds(c, t, [[200, 120, 0.6, 0.01]]);
    },
  });

  /* ================= 7 びょういん ================= */
  extend('clinic', {
    favs: ['panda', 'penguin', 'elephant', 'ambulance', 'juice', 'pudding', 'letter', 'phone', 'musicbox', 'flower'],
    deco(c, r) {
      // すいそう
      G.rr(c, 900, 420, 220, 140, 10); G.fillO(c, '#cfe8f5', 3); G.rr(c, 910, 440, 200, 110, 6); c.fillStyle = '#9fd8f8'; c.fill();
      c.fillStyle = '#58b44e'; for (let i = 0; i < 4; i++) { G.ell(c, 930 + i * 50, 535, 6, 22, (i % 2 ? 0.2 : -0.2)); c.fill(); }
      G.rr(c, 900, 560, 220, 30, 4); G.fillO(c, '#c99a64', 2.5);
      // ポスター
      G.rr(c, 380, 160, 160, 210, 8); G.fillO(c, '#ffffff', 3);
      c.fillStyle = '#3e3550'; c.font = `900 22px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('てを あらおう', 460, 200);
      G.circ(c, 460, 280, 50); c.fillStyle = '#d9f1ff'; c.fill(); G.heart(c, 460, 290, 34); c.fillStyle = '#ff8fab'; c.fill();
      // たいじゅうけい
      G.rr(c, 1480, 560, 90, 30, 6); G.fillO(c, '#7fb6ef', 3); G.rr(c, 1514, 430, 22, 132, 5); G.fillO(c, '#cfd8ea', 2.5); G.circ(c, 1525, 430, 26); G.fillO(c, '#ffffff', 3);
      P.plant(c, 70, 600, 1.2); P.plant(c, 1340, 590, 0.9, '#7fb6ef');
      c.fillStyle = 'rgba(255,140,170,.35)'; [[120, 120], [760, 420], [1300, 140], [1500, 300]].forEach(([x, y]) => { G.heart(c, x, y, 18); c.fill(); });
    },
    amb(c, t) {
      for (let i = 0; i < 3; i++) { const x = 930 + ((t * 0.03 + i * 70) % 170), y = 470 + i * 24 + Math.sin(t * 0.003 + i) * 6; c.save(); c.translate(x, y); G.ell(c, 0, 0, 12, 7); c.fillStyle = ['#ff9f43', '#ff6f91', '#ffd23f'][i]; c.fill(); G.poly(c, [-10, 0, -18, -6, -18, 6]); c.fill(); c.restore(); if ((t / 400 + i) % 4 < 1) { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.5; G.circ(c, x + 14, y - 10 - ((t / 20) % 30), 3); c.stroke(); } }
    },
  });

  /* ================= 8 ようちえん ================= */
  extend('kinder', {
    favs: ['crayons', 'blocks', 'xylophone', 'tambourine', 'maracas', 'cookie', 'juice', 'bento', 'seed', 'wateringcan', 'phone', 'panda', 'penguin'],
    deco(c, r) {
      P.frameArt(c, 60, 300, 120, 90, '#ff8fab', 'sun'); P.frameArt(c, 220, 320, 110, 90, '#7fb6ef', 'house'); P.frameArt(c, 1000, 380, 110, 80, '#58c46b', 'flower'); P.frameArt(c, 1130, 400, 110, 80, '#ffd23f', 'family');
      // あいうえお の ガーランド
      const ch = ['あ', 'い', 'う', 'え', 'お', 'か', 'き'];
      ch.forEach((k, i) => { const x = 360 + i * 70; G.rr(c, x, 210, 54, 54, 10); G.fillO(c, ['#ff6f61', '#ffd23f', '#58c46b', '#4c9be8', '#b39ae8', '#ff8fab', '#ffa94d'][i], 3); c.fillStyle = '#fff'; c.font = `900 34px ${PT.FONT}`; c.textAlign = 'center'; c.fillText(k, x + 27, 248); });
      P.clock(c, 1500, 320, 40, '#58c46b');
      P.flowerPot(c, 1300, 600, 1.2, '#ff6f61'); P.flowerPot(c, 1360, 604, 1.0, '#ffd23f');
      // ほんだな
      G.rr(c, 1460, 440, 120, 160, 6); G.fillO(c, '#e8a35c', 3);
      for (let k = 0; k < 2; k++) for (let i = 0; i < 5; i++) { G.rr(c, 1470 + i * 21, 456 + k * 74, 17, 60, 3); c.fillStyle = ['#ff6f61', '#4c9be8', '#ffd23f', '#58c46b', '#b39ae8'][(i + k) % 5]; c.fill(); }
      // ハムスターの かご
      G.rr(c, 1100, 540, 120, 70, 8); c.strokeStyle = '#7f8fa6'; c.lineWidth = 3; c.stroke(); for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(1100 + i * 20, 540); c.lineTo(1100 + i * 20, 610); c.stroke(); }
    },
    amb(c, t) {
      P.hands(c, 1500, 320, 40, t);
      // モビール
      for (let i = 0; i < 3; i++) { const a = Math.sin(t * 0.0015 + i) * 0.2; const x = 940 + i * 70, y = 200; c.save(); c.translate(x, y); c.rotate(a); c.strokeStyle = '#9fb3c8'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 60); c.stroke(); G.star(c, 0, 72, 14, 6); c.fillStyle = ['#ffd23f', '#ff8fab', '#7fd0e8'][i]; c.fill(); c.restore(); }
      // ハムスター
      const hx = 1130 + ((Math.sin(t * 0.0009) + 1) / 2) * 60;
      c.save(); c.translate(hx, 600); G.ell(c, 0, -10, 16, 11); G.fillO(c, '#f2c38a', 2); G.circ(c, 10, -14, 2); c.fillStyle = '#2b2440'; c.fill(); G.circ(c, -6, -20, 4); c.fillStyle = '#f2c38a'; c.fill(); c.restore();
    },
  });

  /* ================= 9 えき ================= */
  extend('station', {
    favs: ['bento', 'juice', 'letter', 'phone', 'camera', 'bus', 'bicycle', 'airplane', 'icecream', 'donut'],
    deco(c, r) {
      P.clock(c, 1240, 250, 38, '#4c9be8');
      // じこくひょう
      G.rr(c, 300, 200, 220, 90, 8); G.fillO(c, '#2f3a5a', 3);
      c.fillStyle = '#ffd23f'; c.font = `900 22px ${PT.FONT}`; c.textAlign = 'left'; c.fillText('つぎの でんしゃ', 316, 234); c.fillStyle = '#9cf0a0'; c.fillText('ゆめの ゆうえんち', 316, 270);
      // じはんき
      G.rr(c, 40, 580, 110, 180, 10); G.fillO(c, '#ff6f61', 3);
      G.rr(c, 52, 594, 86, 90, 6); c.fillStyle = '#e9f6ff'; c.fill();
      for (let i = 0; i < 6; i++) { G.rr(c, 58 + (i % 3) * 27, 600 + Math.floor(i / 3) * 42, 20, 34, 6); c.fillStyle = ['#ffa94d', '#58c46b', '#4c9be8'][i % 3]; c.fill(); }
      G.rr(c, 70, 710, 50, 20, 4); c.fillStyle = '#3e3550'; c.fill();
      P.flowerPot(c, 1560, 640, 1.3, '#ff8fab');
      // ポスター
      G.rr(c, 1340, 190, 120, 160, 6); G.fillO(c, '#ffffff', 3); c.save(); c.translate(1400, 330); c.scale(0.55, 0.55); PT.FIX.ferris.draw(c, 0, {}); c.restore();
    },
    amb(c, t) {
      P.hands(c, 1240, 250, 38, t);
      A.birds(c, t, 3, 300, '#7f8fa6');
      // とおくを はしる でんしゃ
      const x = ((t * 0.05) % 3200) - 800;
      c.save(); c.translate(x, 330); for (let i = 0; i < 4; i++) { G.rr(c, i * 92, -24, 86, 30, 8); G.fillO(c, ['#58c46b', '#ffd23f', '#58c46b', '#ffd23f'][i], 2); for (let k = 0; k < 3; k++) { c.fillStyle = '#e9f6ff'; c.fillRect(i * 92 + 10 + k * 24, -18, 16, 12); } } c.restore();
    },
  });

  /* ================= 10 うちゅう ================= */
  extend('space', {
    favs: ['airplane', 'carpet', 'moon', 'mirrorball', 'egg', 'chest', 'robottoy', 'magnifier', 'camera', 'snow'],
    deco(c, r) {
      // つきの きち（ドーム）
      for (const [x, s] of [[180, 1.2], [330, 0.8]]) { G.ell(c, x, 640, 90 * s, 70 * s); c.fillStyle = 'rgba(180,230,255,.45)'; c.fill(); c.strokeStyle = '#e9f6ff'; c.lineWidth = 4; c.stroke(); G.rr(c, x - 95 * s, 634, 190 * s, 14, 6); G.fillO(c, '#cfd8ea', 2.5); }
      c.save(); c.translate(180, 630); c.scale(0.7, 0.7); PT.ITEMS.robottoy.draw(c, 0, {}); c.restore();
      // はた
      c.strokeStyle = '#e9f6ff'; c.lineWidth = 5; c.beginPath(); c.moveTo(780, 640); c.lineTo(780, 520); c.stroke();
      G.rr(c, 780, 520, 70, 46, 4); G.fillO(c, '#ffd23f', 2.5); G.star(c, 815, 543, 14, 6); c.fillStyle = '#ff6f61'; c.fill();
      // あしあと
      c.fillStyle = 'rgba(110,100,150,.5)'; for (let i = 0; i < 8; i++) { G.rr(c, 860 + i * 46, 720 + (i % 2) * 18, 20, 12, 5); c.fill(); }
      P.crystal(c, 1520, 820, 1.2, '#7fd0e8'); P.crystal(c, 700, 860, 0.9, '#ff8fab');
    },
    amb(c, t) {
      A.shootingStar(c, t, 4200); A.shootingStar(c, t, 6100, 2000);
      // じんこうえいせい
      const a = t * 0.0002;
      c.save(); c.translate(800 + Math.cos(a) * 650, 360 + Math.sin(a) * 60); c.rotate(a * 3);
      G.rr(c, -12, -10, 24, 20, 4); G.fillO(c, '#e9eef8', 2); c.fillStyle = '#4c6fd6'; c.fillRect(-46, -6, 30, 12); c.fillRect(16, -6, 30, 12); c.restore();
      // UFO
      const ux = ((t * 0.02) % 2200) - 300;
      c.save(); c.translate(ux, 300 + Math.sin(t * 0.003) * 14); G.ell(c, 0, 0, 40, 12); G.fillO(c, '#b9c4d8', 2.5); c.beginPath(); c.arc(0, -4, 20, Math.PI, 0); c.fillStyle = 'rgba(190,240,255,.7)'; c.fill(); for (let i = 0; i < 4; i++) { G.circ(c, -27 + i * 18, 2, 3); c.fillStyle = (t / 200 + i) % 2 < 1 ? '#ffd23f' : '#ff6f91'; c.fill(); } c.restore();
      A.twinkle(c, t, [[120, 80, 4], [420, 160, 3], [640, 60, 5], [1180, 90, 4], [1420, 200, 3], [980, 300, 4]], '#ffffff');
    },
  });

  /* ================= 11 まほうの もり ================= */
  extend('forest', {
    favs: ['carpet', 'lamp', 'egg', 'chest', 'petals', 'musicbox', 'moon', 'seed', 'wateringcan', 'bugnet', 'magnifier', 'grapes', 'strawberry'],
    deco(c, r) {
      P.crystal(c, 120, 640, 1.3, '#b39ae8'); P.crystal(c, 1540, 650, 1.1, '#7fd0e8'); P.crystal(c, 980, 880, 0.8, '#ff8fab');
      [[220, 860, '#ff8fab'], [260, 875, '#ffd23f'], [1080, 620, '#7fd0e8'], [1460, 860, '#b39ae8'], [620, 620, '#ff6f61']].forEach(([x, y, col], i) => P.mushroomSmall(c, x, y, 1 + (i % 2) * 0.3, col));
      // おはなの アーチ
      c.strokeStyle = '#6dbb5f'; c.lineWidth = 10; c.beginPath(); c.arc(800, 600, 110, Math.PI, 0); c.stroke();
      for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI; for (let k = 0; k < 5; k++) { const b = (k / 5) * PT.TAU; G.circ(c, 800 + Math.cos(a) * 110 + Math.cos(b) * 7, 600 + Math.sin(a) * 110 + Math.sin(b) * 7, 6); c.fillStyle = ['#ff8fab', '#ffffff', '#ffd23f', '#b39ae8'][i % 4]; c.fill(); } }
      P.bunnyStatue(c, 1180, 860);
    },
    amb(c, t) {
      A.butterflies(c, t, 5, 420, 760, ['#c9b3f0', '#9fe8ff', '#ffd1f0']);
      // ひかりの つぶ
      for (let i = 0; i < 20; i++) { const x = (i * 83 + Math.sin(t * 0.0008 + i) * 40) % 1600, y = 700 - ((t * 0.02 + i * 61) % 500); c.globalAlpha = 0.3 + Math.sin(t * 0.004 + i) * 0.3; G.circ(c, x, y, 3 + (i % 3)); c.fillStyle = ['#fff6b8', '#ffd1f0', '#c9f6ff'][i % 3]; c.fill(); }
      c.globalAlpha = 1;
      A.bulbs(c, t, 690, 490, 910, 490, 6, ['#fff6b8', '#ffd1f0']);
    },
  });

  /* ================= 12 おまつり ================= */
  extend('fest', {
    favs: ['corn', 'candy', 'icecream', 'juice', 'watermelon', 'grapes', 'donut', 'tambourine', 'maracas', 'trumpet', 'kite', 'pinwheel'],
    deco(c, r) {
      // のぼり
      [[60, '#ff6f61', 'まつり'], [470, '#4c9be8', 'わっしょい'], [1130, '#58c46b', 'おまつり'], [1560, '#ffb547', 'まつり']].forEach(([x, col, label]) => {
        c.strokeStyle = '#7a5a3a'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, 620); c.lineTo(x, 330); c.stroke();
        G.rr(c, x + 3, 340, 40, 200, 3); G.fillO(c, col, 2.5);
        c.fillStyle = '#fff'; c.font = `900 26px ${PT.FONT}`; c.textAlign = 'center'; [...label].slice(0, 5).forEach((k, i) => c.fillText(k, x + 23, 376 + i * 34));
      });
      // おめんやさん
      G.rr(c, 560, 470, 160, 110, 8); G.fillO(c, '#f6d8a8', 3);
      [['#ffffff', '#ff8fab'], ['#f6cc55', '#3e3550'], ['#5f9de3', '#ffffff'], ['#f2879d', '#ffffff']].forEach(([col, eye], i) => { const x = 584 + i * 38, y = 506 + (i % 2) * 34; G.circ(c, x, y, 16); G.fillO(c, col, 2); c.fillStyle = eye; G.circ(c, x - 5, y - 2, 3); c.fill(); G.circ(c, x + 5, y - 2, 3); c.fill(); });
      // かきごおり
      G.rr(c, 900, 480, 140, 100, 8); G.fillO(c, '#e9f6ff', 3); c.fillStyle = '#4c9be8'; c.font = `900 26px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('こおり', 970, 520);
      G.poly(c, [945, 570, 995, 570, 985, 545, 955, 545]); G.fillO(c, '#ffffff', 2); G.blob(c, [950, 548, 958, 530, 970, 524, 982, 530, 990, 548]); c.fillStyle = '#ff6f91'; c.fill();
      // ヨーヨーふうせん
      for (let i = 0; i < 5; i++) { G.circ(c, 1210 + i * 30, 610, 13); G.fillO(c, ['#ff6f91', '#7fd0e8', '#ffd23f', '#b39ae8', '#58c46b'][i], 2); }
    },
    amb(c, t) {
      // ちょうちんの ゆらぎ
      for (let i = 0; i < 10; i++) { const x = 80 + i * 160, a = 0.15 + Math.sin(t * 0.006 + i * 1.7) * 0.08; c.fillStyle = `rgba(255,200,120,${a})`; G.circ(c, x, 220, 70); c.fill(); }
      const k = (t % 5000) / 1800;
      if (k < 1) { const x = 300 + (Math.floor(t / 5000) * 410) % 1000, y = 250 + (Math.floor(t / 5000) * 70) % 100; c.save(); c.globalAlpha = 1 - k; for (let i = 0; i < 14; i++) { const a = (i / 14) * PT.TAU, r = 90 * PT.easeOut(Math.min(1, k * 1.6)); G.circ(c, x + Math.cos(a) * r, y + Math.sin(a) * r + k * 20, 4); c.fillStyle = ['#ffd23f', '#ff6f91', '#7fd0e8'][i % 3]; c.fill(); } c.restore(); }
      A.fireflies(c, t, 6, 450, 560);
    },
  });
})();
