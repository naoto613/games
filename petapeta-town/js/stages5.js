/* ふえた ステージ（49〜60）：スポーツと おでかけ */
'use strict';
(() => {
  const G = PT.G, B = PT.BG, F = PT.FIX, W = PT.W, H = PT.H;
  const on = (f, k, t) => f[k] && t < f[k];
  const prog = (f, k, t, ms) => (on(f, k, t) ? 1 - (f[k] - t) / ms : -1);
  const cl = (v) => Math.max(0, Math.min(1, v));
  const txt = (c, s, x, y, size, col = '#ffffff') => { c.fillStyle = col; c.font = `900 ${size}px ${PT.FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); };
  const COLS = ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a', '#9b8cff', '#ff8a65'];
  const ball = (c, x, y, r, col = '#ffffff') => { G.circ(c, x, y, r); G.fillO(c, col, 2.5); };
  const soccer = (c, x, y, r, rot = 0) => { G.circ(c, x, y, r); G.fillO(c, '#ffffff', 2.5); c.fillStyle = '#2a2a3a'; for (let i = 0; i < 5; i++) { const a = rot + (i / 5) * PT.TAU; G.circ(c, x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.2); c.fill(); } G.circ(c, x, y, r * 0.26); c.fill(); };
  const steam = (c, t, x, y, n, w, hgt, a = 0.6) => { for (let i = 0; i < n; i++) { const k = ((t * 0.0005 + i / n) % 1); c.fillStyle = `rgba(255,255,255,${a * Math.sin(k * Math.PI)})`; G.circ(c, x + Math.sin(t * 0.002 + i * 2) * 10 + ((i * 53) % w) - w / 2, y - k * hgt, 12 + k * 18); c.fill(); } };

  /* ---------- 49 うんどうかい ---------- */
  F.s5_kusudama = { w: 240, h: 430, tags: ['kusudama', 'party', 'sportsday'], slots: [[-160, 20], [160, 20]],
    draw(c, t, f) {
      for (const x of [-110, 98]) { G.rr(c, x, -410, 12, 410, 4); G.fillO(c, '#ffffff', 2.5); c.fillStyle = '#e2433b'; for (let y = -400; y < -10; y += 60) c.fillRect(x + 2, y, 8, 26); }
      G.rr(c, -120, -420, 240, 16, 6); G.fillO(c, '#c99a64', 3);
      const k = on(f, 'open', t) ? cl(prog(f, 'open', t, 5000) * 4) : 0, a = k * 1.1, pull = on(f, 'pull', t) ? 20 : 0;
      c.strokeStyle = '#8a7a6a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -404); c.lineTo(0, -350); c.stroke();
      if (k > 0) {
        G.rr(c, -36, -300, 72, 180 * k, 6); G.fillO(c, '#ffffff', 3); c.save(); G.rr(c, -36, -300, 72, 180 * k, 6); c.clip(); c.strokeStyle = '#e2433b'; c.lineWidth = 4; c.strokeRect(-30, -296, 60, 172);
        ['お', 'め', 'で', 'と', 'う'].forEach((s, i) => txt(c, s, 0, -276 + i * 32, 26, '#e2433b')); c.restore();
        for (let i = 0; i < 24; i++) { const kk = ((t * 0.0004 + i * 0.137) % 1); c.fillStyle = COLS[i % 6]; c.save(); c.translate(-140 + ((i * 71) % 280) + Math.sin(t * 0.004 + i) * 14, -330 + kk * 330); c.rotate(t * 0.006 + i); c.fillRect(-6, -3, 12, 6); c.restore(); }
      } else {
        c.beginPath(); c.moveTo(0, -250); c.lineTo(0, -170 + pull); c.stroke(); G.rr(c, -8, -172 + pull, 16, 26, 4); G.fillO(c, '#e2433b', 2);
      }
      for (const s of [-1, 1]) { c.save(); c.translate(0, -350); c.rotate(s * -a); c.beginPath(); if (s < 0) c.arc(0, 50, 50, Math.PI / 2, Math.PI * 1.5); else c.arc(0, 50, 50, -Math.PI / 2, Math.PI / 2); c.closePath(); G._bb = { x0: s < 0 ? -50 : 0, y0: 0, x1: s < 0 ? 0 : 50, y1: 100 }; G.fillO(c, '#ffd23f', 3); c.fillStyle = '#e2433b'; c.fillRect(s < 0 ? -50 : 0, 44, 50, 10); c.restore(); }
    } };
  F.s5_tamaire = { w: 200, h: 450, tags: ['basket', 'ball', 'sportsday'], slots: [[-140, 20], [140, 20]],
    draw(c, t, f) {
      G.ell(c, 0, -6, 46, 12); G.fillO(c, '#9aa3b8', 2.5); G.rr(c, -8, -380, 16, 376, 5); G.fillO(c, '#ffffff', 2.5);
      const n = Math.min(9, f.n == null ? 3 : f.n);
      for (let i = 0; i < n; i++) { ball(c, -30 + (i % 5) * 15, -398 - Math.floor(i / 5) * 12 - (i % 2) * 4, 9, i % 2 ? '#ffffff' : '#e2433b'); }
      c.strokeStyle = '#ffffff'; c.lineWidth = 2; for (let i = 0; i <= 6; i++) { const x = -50 + i * (100 / 6); c.beginPath(); c.moveTo(x, -392); c.lineTo(x * 0.7, -330); c.stroke(); } for (const y of [-370, -350]) { c.beginPath(); c.moveTo(-46 + (y + 392) * 0.24, y); c.lineTo(46 - (y + 392) * 0.24, y); c.stroke(); }
      G.ell(c, 0, -392, 52, 14); c.strokeStyle = '#e2433b'; c.lineWidth = 6; c.stroke();
      const k = prog(f, 'toss', t, 1400);
      if (k >= 0) for (let i = 0; i < 4; i++) { const kk = cl(k * 1.6 - i * 0.18); if (kk <= 0 || kk >= 1) continue; const sx = (i % 2 ? 1 : -1) * (120 + i * 20); ball(c, sx * (1 - kk), -60 + (-330) * kk - Math.sin(kk * Math.PI) * 140, 10, i % 2 ? '#ffffff' : '#e2433b'); }
    } };
  F.s5_goaltape = { w: 440, h: 240, tags: ['goal', 'race', 'sportsday'], slots: [[-270, 20], [270, 20]],
    draw(c, t, f) {
      for (const x of [-190, 190]) { G.rr(c, x - 7, -200, 14, 200, 4); G.fillO(c, '#ffffff', 2.5); }
      G.rr(c, -200, -240, 400, 48, 14); G.fillO(c, '#ff6f91', 3.5); txt(c, 'ゴール', 0, -215, 30);
      for (let i = 0; i < 6; i++) { c.fillStyle = COLS[i]; G.star(c, -170 + i * 68, -250, 8, 3.5); c.fill(); }
      const k = prog(f, 'break', t, 3000);
      c.strokeStyle = '#ff5d78'; c.lineWidth = 6; c.lineCap = 'round';
      if (k >= 0) { const fl = Math.sin(t * 0.02) * 10; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 186, -110); c.quadraticCurveTo(s * 140, -60 + fl, s * (120 - k * 30), -20 + fl * s); c.stroke(); } }
      else { c.beginPath(); c.moveTo(-186, -110); c.quadraticCurveTo(0, -104 + Math.sin(t * 0.003) * 4, 186, -110); c.stroke(); }
    } };

  /* ---------- 50 サッカー ---------- */
  F.s5_soccergoal = { w: 440, h: 270, tags: ['goal', 'soccer', 'net'], slots: [[-280, 20], [0, 50]],
    draw(c, t, f) {
      const k = prog(f, 'goal', t, 2200), b = k >= 0.3 ? Math.sin((k - 0.3) * 18) * 30 * (1 - k) + 22 * (1 - k) : 0;
      c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(-190, -236, 380, 236);
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2;
      for (let i = 1; i < 10; i++) { const x = -190 + i * 38; c.beginPath(); c.moveTo(x, -236); c.quadraticCurveTo(x * (1 + b * 0.004), -120 - b, x, 0); c.stroke(); }
      for (let i = 1; i < 6; i++) { const y = -236 + i * 40; c.beginPath(); c.moveTo(-190, y); c.quadraticCurveTo(0, y - b * 1.4, 190, y); c.stroke(); }
      for (const x of [-200, 188]) { G.rr(c, x, -246, 12, 246, 4); G.fillO(c, '#ffffff', 3); }
      G.rr(c, -200, -250, 400, 12, 5); G.fillO(c, '#ffffff', 3);
      if (k >= 0) { if (k < 0.3) { const kk = k / 0.3; soccer(c, -420 + kk * 420, -20 - kk * 100 - Math.sin(kk * Math.PI) * 120, 22, t * 0.02); } else soccer(c, Math.sin(t * 0.02) * 6, -110 - b * 0.6, 22, 0.4); }
    } };
  F.s5_scoreboard = { w: 320, h: 360, tags: ['score', 'soccer'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      for (const x of [-100, 88]) { G.rr(c, x, -170, 12, 170, 4); G.fillO(c, '#9aa3b8', 2.5); }
      G.rr(c, -150, -360, 300, 200, 16); G.fillO(c, '#2a3a5a', 4);
      const fl = on(f, 'flash', t);
      for (let i = 0; i < 8; i++) { G.circ(c, -126 + i * 36, -342, 7); c.fillStyle = fl && (Math.floor(t / 150) + i) % 2 ? '#ffd23f' : '#5a6a8a'; c.fill(); }
      [[-70, '#e2433b', f.a || 0], [70, '#4c9be8', f.b || 0]].forEach(([x, col, v]) => { G.circ(c, x, -296, 16); G.fillO(c, col, 2.5); G.rr(c, x - 44, -272, 88, 90, 10); c.fillStyle = '#10182a'; c.fill(); txt(c, String(v % 100), x, -226, 62, fl ? '#ffe066' : '#ffffff'); });
      txt(c, '-', 0, -226, 50, '#ffffff');
    } };
  F.s5_ballcart = { w: 220, h: 170, tags: ['ball', 'soccer', 'cart'], slots: [[-150, 20], [150, 20]],
    draw(c, t, f) {
      for (const x of [-70, 70]) { G.circ(c, x, -12, 12); G.fillO(c, '#3a3550', 2.5); }
      [[-60, -110], [-10, -116], [40, -110], [-36, -134], [16, -136]].forEach(([x, y], i) => soccer(c, x, y, 22, i));
      c.strokeStyle = '#9aa3b8'; c.lineWidth = 4; G.rr(c, -94, -120, 188, 100, 10); c.stroke(); c.lineWidth = 2; for (let x = -80; x < 94; x += 22) { c.beginPath(); c.moveTo(x, -120); c.lineTo(x, -20); c.stroke(); }
      const k = prog(f, 'head', t, 3000);
      if (k >= 0) soccer(c, f.hx || 0, -200 - Math.abs(Math.sin(k * Math.PI * 5)) * 130, 20, t * 0.01);
      const o = prog(f, 'out', t, 1200);
      if (o >= 0) for (let i = 0; i < 3; i++) soccer(c, (i - 1) * 70 * o, -140 - Math.sin(o * Math.PI) * (120 + i * 30), 18, t * 0.02 + i);
    } };

  /* ---------- 51 やきゅう ---------- */
  F.s5_batbox = { w: 280, h: 200, tags: ['baseball', 'bat', 'home'], slots: [[-180, 20], [-80, 30]],
    draw(c, t, f) {
      G.ell(c, 0, -24, 140, 38); c.fillStyle = '#d9a066'; c.fill();
      c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.strokeRect(-110, -46, 70, 40); c.strokeRect(40, -46, 70, 40);
      G.poly(c, [-16, -36, 16, -36, 16, -22, 0, -12, -16, -22]); G.fillO(c, '#ffffff', 2);
      G.rr(c, 64, -110, 8, 90, 3); G.fillO(c, '#3a3550', 2); G.ell(c, 68, -20, 22, 6); G.fillO(c, '#3a3550', 2);
      const k = prog(f, 'hit', t, 3000);
      if (k < 0) ball(c, 68, -122, 12);
      else { const x = 68 + k * 1300, y = -122 - Math.sin(Math.min(1, k * 1.2) * Math.PI * 0.6) * 900; for (let i = 1; i < 6; i++) { c.fillStyle = `rgba(255,236,140,${0.6 - i * 0.1})`; G.star(c, x - i * 40, y + i * 40 * (k < 0.4 ? 1 : 0.2), 10 - i, 4); c.fill(); } ball(c, x, y, 12); }
    } };
  F.s5_mound = { w: 260, h: 140, tags: ['baseball', 'pitch'], slots: [[-170, 20], [170, 20]],
    draw(c, t, f) {
      G.ell(c, 0, -30, 130, 36); G.fillO(c, '#d9a066', 3); G.ell(c, 0, -40, 90, 20); c.fillStyle = '#e4b57c'; c.fill();
      G.rr(c, -26, -46, 52, 10, 3); G.fillO(c, '#ffffff', 2);
      G.ell(c, 70, -34, 14, 9); G.fillO(c, '#ffffff', 2);
      const k = prog(f, 'pitch', t, 800);
      if (k >= 0) ball(c, -k * 640, -150 + k * 60 - Math.sin(k * Math.PI) * 40, 12);
    } };
  F.s5_cheerstand = { w: 480, h: 270, tags: ['stand', 'cheer', 'baseball'], slots: [[-300, 20], [300, 20]],
    draw(c, t, f) {
      const k = prog(f, 'wave', t, 3000);
      for (let r = 0; r < 3; r++) { const y = -60 - r * 70; G.rr(c, -240 + r * 20, y, 480 - r * 40, 26, 6); G.fillO(c, ['#4c9be8', '#58b9f0', '#7fd0ff'][r], 3);
        for (let i = 0; i < 8; i++) { const x = -200 + r * 18 + i * (400 - r * 36) / 7; const wv = k >= 0 ? Math.max(0, Math.sin((k * 3 - (i / 7)) * Math.PI)) * 34 : Math.abs(Math.sin(t * 0.003 + i + r)) * 3; G.circ(c, x, y - 20 - wv, 17); G.fillO(c, ['#f7d9b8', '#ffd1e0', '#fff1c2', '#d6f0d0'][(i + r) % 4], 2.5); c.fillStyle = '#2a1f35'; G.circ(c, x - 6, y - 23 - wv, 2.5); c.fill(); G.circ(c, x + 6, y - 23 - wv, 2.5); c.fill();
          if (wv > 12) { c.strokeStyle = '#3a3550'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 14, y - 20 - wv); c.lineTo(x + 20, y - 60 - wv); c.stroke(); G.rr(c, x + 20, y - 72 - wv, 26, 18, 3); G.fillO(c, COLS[(i + r) % 6], 2); } } }
      for (const x of [-240, 228]) { G.rr(c, x, -250, 12, 250, 3); G.fillO(c, '#9aa3b8', 2.5); }
    } };

  /* ---------- 52 ボウリング ---------- */
  const PINS = [[250, -56], [272, -66], [272, -46], [294, -76], [294, -56], [294, -36], [316, -86], [316, -66], [316, -46], [316, -26]];
  const pin = (c, x, y, s = 1) => { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-7, 0); c.quadraticCurveTo(-12, -18, -5, -28); c.quadraticCurveTo(-8, -40, 0, -44); c.quadraticCurveTo(8, -40, 5, -28); c.quadraticCurveTo(12, -18, 7, 0); c.closePath(); G._bb = { x0: -12, y0: -44, x1: 12, y1: 0 }; G.fillO(c, '#ffffff', 2); c.fillStyle = '#e2433b'; c.fillRect(-6, -32, 12, 3); c.fillRect(-6, -27, 12, 3); c.restore(); };
  F.s5_lane = { w: 720, h: 170, tags: ['bowling', 'lane'], slots: [[-420, 20], [-300, 40]],
    draw(c, t, f) {
      G.poly(c, [-360, -10, 340, -24, 340, -110, -360, -90]); G.fillO(c, '#e8b878', 3);
      c.strokeStyle = 'rgba(160,110,60,.35)'; c.lineWidth = 2; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(-360, -10 - i * 13.3); c.lineTo(340, -24 - i * 14.3); c.stroke(); }
      for (const s of [0, 1]) { G.poly(c, s ? [-360, -90, 340, -110, 340, -120, -360, -100] : [-360, -10, 340, -24, 340, -14, -360, 0]); G.fillO(c, '#9aa3b8', 2); }
      c.fillStyle = '#c0304a'; for (let i = 0; i < 5; i++) { G.poly(c, [-150 + i * 14, -40 - i * 3, -144 + i * 14, -52 - i * 3, -138 + i * 14, -40 - i * 3]); c.fill(); }
      G.rr(c, 340, -150, 30, 140, 6); G.fillO(c, '#3a3550', 3);
      const k = prog(f, 'roll', t, 2600), hit = k >= 0.5 ? cl((k - 0.5) * 4) : 0;
      PINS.slice().sort((a, b) => a[1] - b[1]).forEach(([x, y], i) => { if (hit > 0) { const dir = (i % 2 ? 1 : -1); c.save(); c.translate(x + dir * hit * 20 + hit * 20, y - Math.sin(hit * Math.PI) * 30); c.rotate(dir * hit * 1.4); pin(c, 0, 0); c.restore(); } else pin(c, x, y); });
      if (k >= 0 && k < 0.55) { const kk = k / 0.5, x = -320 + kk * 600, y = -50 - kk * 10; G.circ(c, x, y - 18, 20); G.fillO(c, f.col || '#9b6fd6', 3); c.fillStyle = '#2a1f35'; const a = kk * 20; for (let i = 0; i < 3; i++) { G.circ(c, x + Math.cos(a + i * 0.6) * 9, y - 18 + Math.sin(a + i * 0.6) * 9, 2.6); c.fill(); } }
      if (k >= 0.55) { c.fillStyle = `rgba(255,236,140,${1 - k})`; for (let i = 0; i < 6; i++) { G.star(c, 280 + Math.cos(i) * 70 * hit, -70 + Math.sin(i * 2) * 50 * hit, 10, 4); c.fill(); } }
    } };
  F.s5_ballreturn = { w: 240, h: 190, tags: ['bowling', 'ball', 'machine'], slots: [[-160, 20], [160, 20]],
    draw(c, t, f) {
      G.rr(c, -110, -80, 220, 80, 16); G.fillO(c, '#58b9f0', 3.5); G.rr(c, -100, -100, 200, 26, 12); G.fillO(c, '#3a4050', 3);
      G.rr(c, -40, -170, 80, 80, 30); G.fillO(c, '#58b9f0', 3.5); G.ell(c, 0, -140, 26, 18); c.fillStyle = '#1a2030'; c.fill();
      const o = prog(f, 'out', t, 1600), sh = o >= 0 ? cl(o * 2) : 0;
      ['#e2433b', '#ffd23f', '#7bd36a', '#9b6fd6'].forEach((col, i) => { const x = -80 + i * 42 + sh * 42 * (i === 3 ? 0 : 1); if (x > 90) return; G.circ(c, x, -114, 19); G.fillO(c, col, 2.5); c.fillStyle = '#2a1f35'; G.circ(c, x - 5, -120, 2.4); c.fill(); G.circ(c, x + 4, -121, 2.4); c.fill(); G.circ(c, x, -112, 2.4); c.fill(); });
      if (o >= 0 && o < 0.5) { G.circ(c, 0, -140 - Math.sin(o * 2 * Math.PI) * 50, 19); G.fillO(c, '#ff8fb1', 2.5); }
    } };
  F.s5_pinmascot = { w: 180, h: 320, tags: ['bowling', 'pin', 'mascot'], slots: [[-130, 20], [130, 20]],
    draw(c, t, f) {
      const d = on(f, 'dance', t), j = d ? Math.abs(Math.sin(t * 0.012)) * 30 : 0, r = d ? Math.sin(t * 0.01) * 0.25 : Math.sin(t * 0.002) * 0.03;
      c.save(); c.translate(0, -j); c.rotate(r);
      c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(-76, -120, -32, -190); c.quadraticCurveTo(-48, -280, 0, -300); c.quadraticCurveTo(48, -280, 32, -190); c.quadraticCurveTo(76, -120, 40, 0); c.closePath(); G._bb = { x0: -76, y0: -300, x1: 76, y1: 0 }; G.fillO(c, '#ffffff', 4);
      c.fillStyle = '#e2433b'; c.fillRect(-36, -206, 72, 12); c.fillRect(-38, -186, 76, 12);
      c.fillStyle = '#2a1f35'; G.ell(c, -12, -250, 5, 7); c.fill(); G.ell(c, 12, -250, 5, 7); c.fill(); c.strokeStyle = '#2a1f35'; c.lineWidth = 3; c.beginPath(); c.arc(0, -236, 10, 0.2, Math.PI - 0.2); c.stroke();
      c.fillStyle = 'rgba(255,120,140,.5)'; G.ell(c, -24, -236, 7, 4); c.fill(); G.ell(c, 24, -236, 7, 4); c.fill();
      const arm = d ? Math.sin(t * 0.02) * 0.8 : 0.2;
      for (const s of [-1, 1]) { c.save(); c.translate(s * 50, -130); c.rotate(s * (-0.6 - arm)); G.rr(c, -7, 0, 14, 60, 7); G.fillO(c, '#ffffff', 2.5); c.restore(); }
      c.restore();
    } };

  /* ---------- 53 ミニゴルフ ---------- */
  const turf = (c, w, h) => { G.ell(c, 0, -h, w, h); G.fillO(c, '#6fcf6a', 3.5); G.ell(c, 0, -h - 4, w - 16, h - 10); c.fillStyle = '#86dc7a'; c.fill(); };
  F.s5_windmillhole = { w: 320, h: 330, tags: ['golf', 'windmill'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      turf(c, 160, 36);
      G.rr(c, -50, -200, 100, 170, 8); G.fillO(c, '#ffb3c8', 3); G.poly(c, [-62, -196, 0, -250, 62, -196]); G.fillO(c, '#e2433b', 3);
      G.rr(c, -22, -62, 44, 32, 16); c.fillStyle = '#2a3a2a'; c.fill();
      const k = prog(f, 'shot', t, 2600), sp = k >= 0 ? 0.012 : 0.002;
      c.save(); c.translate(0, -200); c.rotate(t * sp); for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); G.rr(c, -10, -120, 20, 110, 4); G.fillO(c, '#fff4e2', 2.5); c.strokeStyle = '#c99a64'; c.lineWidth = 1.5; for (let y = -110; y < -20; y += 18) { c.beginPath(); c.moveTo(-10, y); c.lineTo(10, y); c.stroke(); } } c.restore();
      G.circ(c, 0, -200, 10); G.fillO(c, '#ffd23f', 2);
      if (k >= 0) { let x = null; if (k < 0.4) x = -150 + (k / 0.4) * 150; else if (k > 0.6) x = ((k - 0.6) / 0.4) * 150; if (x !== null) ball(c, x, -42, 9); }
    } };
  F.s5_golfcup = { w: 340, h: 260, tags: ['golf', 'cup', 'flag'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      turf(c, 170, 40);
      G.ell(c, 90, -46, 16, 7); c.fillStyle = '#1a2a1a'; c.fill();
      const k = prog(f, 'putt', t, 2400), inn = k >= 0.6, up = inn ? Math.min(1, (k - 0.6) * 5) * 30 : 0;
      c.strokeStyle = '#ffffff'; c.lineWidth = 4; c.beginPath(); c.moveTo(90, -46 - up); c.lineTo(90, -240 - up); c.stroke();
      const wv = Math.sin(t * (inn ? 0.02 : 0.005)) * (inn ? 10 : 4); c.beginPath(); c.moveTo(92, -240 - up); c.quadraticCurveTo(130, -230 - up + wv, 160, -214 - up + wv); c.lineTo(92, -196 - up); c.closePath(); G._bb = { x0: 92, y0: -240 - up, x1: 160, y1: -196 - up }; G.fillO(c, inn ? '#ffd23f' : '#ff5d78', 2.5);
      if (k >= 0 && k < 0.6) { const e = PT.easeOut ? PT.easeOut(k / 0.6) : k / 0.6; ball(c, -130 + e * 220, -40 - e * 6, 9); }
      if (!(k >= 0) ) ball(c, -130, -40, 9);
      if (inn) { c.fillStyle = `rgba(255,236,140,${1 - k})`; for (let i = 0; i < 6; i++) { const a = i * 1.05 + t * 0.003; G.star(c, 90 + Math.cos(a) * 50 * (k - 0.5) * 2, -60 + Math.sin(a) * 30 * (k - 0.5) * 2, 9, 4); c.fill(); } }
    } };
  F.s5_loop = { w: 380, h: 290, tags: ['golf', 'loop'], slots: [[-230, 20], [230, 20]],
    draw(c, t, f) {
      turf(c, 190, 30);
      c.strokeStyle = '#ffd23f'; c.lineWidth = 14; G.circ(c, 40, -140, 92); c.stroke(); c.strokeStyle = '#ff8a65'; c.lineWidth = 4; G.circ(c, 40, -140, 100); c.stroke(); G.circ(c, 40, -140, 84); c.stroke();
      for (const x of [-20, 100]) { G.rr(c, x - 5, -60, 10, 30, 3); G.fillO(c, '#9aa3b8', 2); }
      c.fillStyle = '#ffd23f'; G.star(c, 40, -140, 20, 9); c.fill();
      const k = prog(f, 'go', t, 2600); let x = -160, y = -36;
      if (k >= 0) { if (k < 0.3) { x = -160 + (k / 0.3) * 200; } else if (k < 0.75) { const a = Math.PI / 2 - ((k - 0.3) / 0.45) * PT.TAU; x = 40 + Math.cos(a) * 92; y = -140 + Math.sin(a) * 92 + 8; } else { x = 40 + ((k - 0.75) / 0.25) * 140; } }
      ball(c, x, y, 9);
    } };

  /* ---------- 54 たいいくかん ---------- */
  F.s5_vaultbox = { w: 360, h: 190, tags: ['gym', 'vault', 'jump'], slots: [[-260, 20], [240, 20]],
    draw(c, t, f) {
      const sq = on(f, 'boing', t) ? 6 : 0;
      G.poly(c, [-170, -4, -90, -4, -90, -22 + sq, -170, -8]); G.fillO(c, '#c99a64', 3);
      for (let i = 0; i < 5; i++) { const y = -24 - i * 24, w = 110 - i * 6; G.rr(c, -w + 30, y - 24, w * 2 - 60 + 40, 26, 6); G.fillO(c, '#e8b878', 2.5); }
      G.rr(c, -64, -156, 148, 30, 12); G.fillO(c, '#ffffff', 3); txt(c, '5', 10, -141, 22, '#3a3550');
    } };
  F.s5_mat = { w: 420, h: 90, tags: ['gym', 'mat'], slots: [[-260, 20], [260, 20]],
    draw(c, t, f) {
      G.poly(c, [-200, -6, 200, -6, 180, -56, -180, -56]); G.fillO(c, '#4c9be8', 3.5); G.poly(c, [-200, -6, 200, -6, 200, 4, -200, 4]); G.fillO(c, '#3a7ac8', 2.5);
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; for (const x of [-90, 0, 90]) { c.beginPath(); c.moveTo(x, -6); c.lineTo(x * 0.92, -56); c.stroke(); }
      if (on(f, 'roll', t)) for (let i = 0; i < 5; i++) { c.fillStyle = COLS[i]; G.star(c, -160 + i * 80, -80 - Math.abs(Math.sin(t * 0.01 + i)) * 40, 9, 4); c.fill(); }
    } };
  F.s5_bigball = { w: 260, h: 260, tags: ['gym', 'ball', 'big'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      const k = prog(f, 'roll', t, 3600), dx = k >= 0 ? Math.sin(k * Math.PI) * 280 : 0;
      c.save(); c.translate(dx, -120); c.rotate(dx / 120);
      G.circ(c, 0, 0, 120); G.fillO(c, '#ff6f61', 4); c.save(); G.circ(c, 0, 0, 118); c.clip(); c.fillStyle = '#ffffff'; c.fillRect(-120, -26, 240, 52); c.restore();
      c.fillStyle = 'rgba(255,255,255,.5)'; G.ell(c, -50, -60, 24, 14, -0.6); c.fill();
      c.restore();
    } };

  /* ---------- 55 サーフィン ---------- */
  F.s5_surfwave = { w: 1600, h: 190, area: 'water', tags: ['water', 'sea', 'wave', 'surf'], slots: [[-300, 40], [300, 40]],
    draw(c, t, f) {
      c.fillStyle = G.grad(c, 0, -190, 0, 0, [[0, '#3aa0d8'], [1, '#7fd6f0']]); c.fillRect(-800, -190, 1600, 190);
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { const y = -160 + i * 40, o = (t * 0.03 * (i % 2 ? 1 : -1)) % 120; c.beginPath(); for (let x = -800; x < 800; x += 60) { c.moveTo(x + o, y); c.quadraticCurveTo(x + o + 15, y - 8, x + o + 30, y); } c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.moveTo(-800, 0); for (let x = -800; x <= 800; x += 40) c.lineTo(x, -6 - Math.abs(Math.sin(x * 0.03 + t * 0.003)) * 10); c.lineTo(800, 4); c.lineTo(-800, 4); c.closePath(); c.fill();
      const k = prog(f, 'wave', t, 3400);
      if (k >= 0) { const x = -700 + k * 1400, hh = 150 * Math.sin(Math.min(1, k * 4) * Math.PI / 2) * (k > 0.85 ? (1 - k) / 0.15 : 1);
        c.beginPath(); c.moveTo(x - 260, -40); c.quadraticCurveTo(x - 60, -40 - hh * 0.9, x, -40 - hh); c.quadraticCurveTo(x + 60, -40 - hh * 1.1, x + 70, -40 - hh * 0.6); c.quadraticCurveTo(x + 40, -40 - hh * 0.7, x + 50, -40 - hh * 0.4); c.quadraticCurveTo(x + 120, -40, x + 220, -40); c.closePath(); G._bb = { x0: x - 260, y0: -40 - hh * 1.1, x1: x + 220, y1: -40 }; G.fillO(c, '#58b9f0', 3);
        c.fillStyle = '#ffffff'; for (let i = 0; i < 6; i++) { G.circ(c, x + 40 + Math.sin(t * 0.02 + i) * 14, -40 - hh + i * 10, 8 - i); c.fill(); } }
      const s = prog(f, 'surf', t, 3400);
      if (s >= 0 && f.bx != null) { c.save(); c.translate(f.bx, f.by); c.rotate(Math.sin(t * 0.008) * 0.12); G.ell(c, 0, 0, 70, 12); G.fillO(c, '#ffd23f', 3); c.fillStyle = '#ff6f91'; c.fillRect(-60, -3, 120, 6); c.restore(); }
    } };
  F.s5_lifeguard = { w: 220, h: 380, tags: ['lifeguard', 'chair', 'beach'], slots: [[-150, 20], [150, 20]],
    draw(c, t, f) {
      c.strokeStyle = '#ffffff'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(-70, 0); c.lineTo(-40, -220); c.moveTo(70, 0); c.lineTo(40, -220); c.stroke();
      c.lineWidth = 6; for (const y of [-60, -120, -180]) { c.beginPath(); c.moveTo(-64 + (-y) * 0.13, y); c.lineTo(64 - (-y) * 0.13, y); c.stroke(); }
      G.rr(c, -56, -236, 112, 22, 6); G.fillO(c, '#e2433b', 3); G.rr(c, -50, -300, 14, 70, 5); G.fillO(c, '#e2433b', 2.5); G.rr(c, -50, -300, 100, 14, 5); G.fillO(c, '#e2433b', 2.5);
      const wv = on(f, 'flag', t) ? Math.sin(t * 0.03) * 0.5 : Math.sin(t * 0.004) * 0.1;
      c.strokeStyle = '#3a3550'; c.lineWidth = 4; c.beginPath(); c.moveTo(56, -236); c.lineTo(56, -370); c.stroke();
      c.save(); c.translate(56, -370); c.rotate(wv); G.poly(c, [0, 0, 70, 14, 0, 40]); G.fillO(c, '#ffd23f', 2.5); c.fillStyle = '#e2433b'; G.poly(c, [0, 12, 40, 20, 0, 28]); c.fill(); c.restore();
    } };
  F.s5_shaveice = { w: 260, h: 300, tags: ['shop', 'ice', 'beach'], slots: [[-170, 20], [170, 20]],
    draw(c, t, f) {
      G.rr(c, -120, -120, 240, 120, 8); G.fillO(c, '#ffffff', 3); c.fillStyle = '#58b9f0'; for (let x = -120; x < 120; x += 30) c.fillRect(x, -120, 15, 20);
      G.rr(c, -110, -290, 12, 170, 4); G.fillO(c, '#c99a64', 2); G.rr(c, 98, -290, 12, 170, 4); G.fillO(c, '#c99a64', 2);
      G.rr(c, -130, -300, 260, 40, 10); G.fillO(c, '#58b9f0', 3); txt(c, 'かきごおり', 0, -279, 24);
      const sp = on(f, 'shave', t);
      G.rr(c, -60, -200, 60, 80, 8); G.fillO(c, '#e2433b', 3); c.save(); c.translate(-30, -214); c.rotate(sp ? t * 0.02 : 0); G.rr(c, -4, -24, 8, 24, 3); G.fillO(c, '#9aa3b8', 2); c.restore();
      if (sp) { c.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 6; i++) { G.circ(c, -30 + Math.sin(t * 0.03 + i) * 10, -124 + ((t * 0.08 + i * 6) % 20), 3); c.fill(); } }
      [['#ff6f91', 40], ['#7bd36a', 80]].forEach(([col, x]) => { G.poly(c, [x - 16, -150, x + 16, -150, x + 10, -124, x - 10, -124]); G.fillO(c, '#ffffff', 2); c.beginPath(); c.arc(x, -150, 18, Math.PI, 0); c.closePath(); G._bb = { x0: x - 18, y0: -168, x1: x + 18, y1: -150 }; G.fillO(c, col, 2); });
    } };

  /* ---------- 56 スキー ---------- */
  F.s5_slope = { w: 720, h: 380, tags: ['ski', 'snow', 'slope'], slots: [[380, 20], [300, 40]],
    draw(c, t, f) {
      c.beginPath(); c.moveTo(-360, 0); c.lineTo(-360, -340); c.quadraticCurveTo(-200, -330, 0, -170); c.quadraticCurveTo(200, -20, 360, 0); c.closePath(); G._bb = { x0: -360, y0: -340, x1: 360, y1: 0 }; G.fillO(c, '#ffffff', 4);
      c.fillStyle = '#e3eefb'; c.beginPath(); c.moveTo(-360, -340); c.quadraticCurveTo(-200, -330, 0, -170); c.lineTo(-40, -150); c.quadraticCurveTo(-200, -300, -360, -300); c.closePath(); c.fill();
      [[-250, -300, '#e2433b'], [-120, -230, '#4c9be8'], [20, -140, '#e2433b'], [160, -70, '#4c9be8']].forEach(([x, y, col]) => { c.strokeStyle = '#3a3550'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 50); c.stroke(); G.poly(c, [x, y - 50, x + 26, y - 42, x, y - 34]); G.fillO(c, col, 2); });
      G.rr(c, -350, -400, 90, 60, 8); G.fillO(c, '#c99a64', 3); G.poly(c, [-360, -396, -305, -440, -250, -396]); G.fillO(c, '#e2433b', 3); txt(c, 'スタート', -305, -370, 16);
      if (on(f, 'ski', t) && f.skx != null) { c.save(); c.translate(f.skx, -f.skz + 2); c.rotate(f.ska || 0); c.strokeStyle = '#ff5d78'; c.lineWidth = 6; c.lineCap = 'round'; for (const o of [-6, 6]) { c.beginPath(); c.moveTo(-50, o); c.lineTo(46, o); c.quadraticCurveTo(58, o, 58, o - 10); c.stroke(); } c.restore(); }
    } };
  F.s5_skilift = { w: 320, h: 480, tags: ['ski', 'lift'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      for (const [x, h] of [[-140, 130], [140, 470]]) { G.rr(c, x - 9, -h, 18, h, 4); G.fillO(c, '#9aa3b8', 2.5); G.rr(c, x - 30, -h - 10, 60, 14, 4); G.fillO(c, '#3a4050', 2); }
      c.strokeStyle = '#3a3550'; c.lineWidth = 3; c.beginPath(); c.moveTo(-140, -140); c.lineTo(140, -480); c.stroke();
      const chair = (x, y, col) => { c.strokeStyle = '#3a3550'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 50); c.stroke(); G.rr(c, x - 24, y + 50, 48, 10, 4); G.fillO(c, col, 2); G.rr(c, x - 24, y + 22, 8, 34, 3); G.fillO(c, col, 2); };
      const sp = on(f, 'run', t) ? 0.00045 : 0.00012;
      for (let i = 0; i < 3; i++) { const k = (t * sp + i / 3) % 1; chair(-140 + k * 280, -140 - k * 340, ['#e2433b', '#4c9be8', '#ffd23f'][i]); }
      if (on(f, 'ride', t) && f.lx != null) chair(f.lx, -f.lz - 80, '#7bd36a');
    } };
  F.s5_kamakura = { w: 280, h: 220, tags: ['snow', 'kamakura', 'house'], slots: [[-180, 20], [180, 20]],
    draw(c, t, f) {
      c.beginPath(); c.moveTo(-130, 0); c.bezierCurveTo(-130, -260, 130, -260, 130, 0); c.closePath(); G._bb = { x0: -130, y0: -200, x1: 130, y1: 0 }; G.fillO(c, '#ffffff', 4);
      c.fillStyle = 'rgba(180,200,230,.4)'; G.ell(c, -50, -130, 30, 50, -0.4); c.fill();
      const lit = on(f, 'lit', t);
      c.beginPath(); c.moveTo(-50, 0); c.bezierCurveTo(-50, -120, 50, -120, 50, 0); c.closePath(); c.fillStyle = lit ? '#ffcf70' : '#3a4a6a'; c.fill();
      if (lit) { c.fillStyle = 'rgba(255,220,140,.35)'; G.circ(c, 0, -40, 90); c.fill(); steam(c, t, 0, -90, 3, 40, 80, 0.5); }
      G.rr(c, 70, -60, 24, 30, 6); G.fillO(c, '#ff8a65', 2); G.circ(c, 82, -45, 6); c.fillStyle = '#fff3b0'; c.fill();
      if (on(f, 'peek', t)) { c.fillStyle = 'rgba(255,255,255,.8)'; G.circ(c, 0, -100, 5); c.fill(); }
    } };

  /* ---------- 57 おんせん ---------- */
  const monkey = (c, x, y, t) => { c.save(); c.translate(x, y + Math.sin(t * 0.004) * 3); G.circ(c, 0, 0, 30); G.fillO(c, '#a8733f', 3); G.ell(c, 0, 4, 22, 18); c.fillStyle = '#ffb3a0'; c.fill(); for (const s of [-1, 1]) { G.circ(c, s * 32, -2, 9); G.fillO(c, '#ffb3a0', 2); } c.fillStyle = '#2a1f35'; G.circ(c, -8, 0, 3); c.fill(); G.circ(c, 8, 0, 3); c.fill(); c.strokeStyle = '#2a1f35'; c.lineWidth = 2; c.beginPath(); c.arc(0, 8, 6, 0.2, Math.PI - 0.2); c.stroke(); G.rr(c, -22, -40, 44, 14, 5); G.fillO(c, '#ffffff', 2); c.fillStyle = '#58b9f0'; c.fillRect(-20, -36, 40, 3); c.restore(); };
  F.s5_onsen = { w: 660, h: 220, area: 'water', tags: ['water', 'onsen', 'bath', 'warm'], slots: [[-380, 20], [380, 20]],
    draw(c, t, f) {
      G.ell(c, 0, -100, 330, 110); G.fillO(c, '#8a8a9a', 4);
      for (let i = 0; i < 18; i++) { const a = (i / 18) * PT.TAU; G.ell(c, Math.cos(a) * 316, -100 + Math.sin(a) * 100, 34, 22); G.fillO(c, ['#9aa3b8', '#8a8a9a', '#b0b4c0'][i % 3], 2.5); }
      G.ell(c, 0, -100, 290, 84); c.fillStyle = G.grad(c, 0, -184, 0, -16, [[0, '#9fe0e0'], [1, '#5fc0c8']]); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(Math.sin(i * 2) * 120, -100 + Math.cos(i * 3) * 30, 30 + ((t * 0.02 + i * 10) % 40), 8, 0, 0, PT.TAU); c.stroke(); }
      const hot = on(f, 'hoka', t); steam(c, t, 0, -120, hot ? 12 : 6, 520, hot ? 260 : 160, hot ? 0.75 : 0.5);
      if (on(f, 'monkey', t)) monkey(c, 180, -110, t);
      if (hot) for (let i = 0; i < 4; i++) { const k = ((t * 0.0006 + i * 0.25) % 1); c.fillStyle = `rgba(255,111,145,${1 - k})`; G.heart(c, -200 + i * 130, -150 - k * 120, 12); c.fill(); }
    } };
  F.s5_milkcooler = { w: 180, h: 280, tags: ['milk', 'drink', 'fridge'], slots: [[-130, 20], [130, 20]],
    draw(c, t, f) {
      G.rr(c, -80, -280, 160, 280, 12); G.fillO(c, '#58b9f0', 4); G.rr(c, -66, -250, 132, 200, 8); c.fillStyle = 'rgba(220,240,255,.85)'; c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.stroke();
      txt(c, 'ぎゅうにゅう', 0, -265, 18);
      const o = prog(f, 'pop', t, 1200);
      for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { const x = -45 + i * 30, y = -70 - r * 64; if (o >= 0 && r === 0 && i === 1) continue; G.rr(c, x - 10, y - 46, 20, 46, 6); G.fillO(c, ['#ffffff', '#c9925a', '#ffb04a'][r], 2); G.rr(c, x - 9, y - 50, 18, 6, 2); c.fillStyle = '#e2433b'; c.fill(); }
      if (o >= 0) { const y = -116 - Math.sin(o * Math.PI) * 120; G.rr(c, -25, y - 46, 20, 46, 6); G.fillO(c, '#ffffff', 2); c.fillStyle = '#ffd23f'; G.star(c, 10, y - 60, 10, 4); c.fill(); }
    } };
  F.s5_pingpong = { w: 380, h: 200, tags: ['pingpong', 'table', 'game'], slots: [[-240, 20], [240, 20]],
    draw(c, t, f) {
      for (const x of [-150, 140]) { G.rr(c, x, -90, 10, 90, 3); G.fillO(c, '#3a3550', 2); }
      G.poly(c, [-180, -90, 180, -90, 160, -130, -160, -130]); G.fillO(c, '#3a9a6a', 3.5); c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.moveTo(-170, -110); c.lineTo(170, -110); c.stroke();
      G.rr(c, -3, -150, 6, 60, 2); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill(); c.strokeStyle = '#3a3550'; c.lineWidth = 1; c.strokeRect(-3, -150, 6, 30);
      const k = prog(f, 'rally', t, 3600);
      if (k >= 0) { const ph = (k * 6) % 1, dir = Math.floor(k * 6) % 2 ? -1 : 1, x = dir * (-200 + ph * 400); ball(c, x, -130 - Math.abs(Math.sin(ph * PT.TAU)) * 70, 7, '#fff4c2'); }
      for (const s of [-1, 1]) { c.save(); c.translate(s * 120, -140); c.rotate(s * 0.5); G.ell(c, 0, 0, 16, 18); G.fillO(c, s < 0 ? '#e2433b' : '#2a2a3a', 2); G.rr(c, -3, 14, 6, 16, 2); G.fillO(c, '#c99a64', 1.5); c.restore(); }
    } };

  /* ---------- 58 やまのぼり ---------- */
  F.s5_summit = { w: 520, h: 470, tags: ['mountain', 'summit', 'climb'], slots: [[-300, 20], [300, 20]],
    draw(c, t, f) {
      c.beginPath(); c.moveTo(-260, 0); c.lineTo(-130, -230); c.lineTo(-60, -340); c.lineTo(0, -400); c.lineTo(70, -330); c.lineTo(150, -220); c.lineTo(260, 0); c.closePath(); G._bb = { x0: -260, y0: -400, x1: 260, y1: 0 }; G.fillO(c, '#8fae7a', 4);
      c.fillStyle = '#7a9a68'; c.beginPath(); c.moveTo(0, -400); c.lineTo(70, -330); c.lineTo(150, -220); c.lineTo(260, 0); c.lineTo(60, 0); c.closePath(); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-60, -340); c.lineTo(0, -400); c.lineTo(70, -330); c.lineTo(40, -320); c.lineTo(20, -340); c.lineTo(-10, -316); c.lineTo(-30, -336); c.closePath(); c.fill();
      c.strokeStyle = '#c9a26a'; c.lineWidth = 6; c.setLineDash([12, 10]); c.beginPath(); c.moveTo(-200, -10); c.quadraticCurveTo(-60, -60, -140, -160); c.quadraticCurveTo(-40, -220, -50, -300); c.lineTo(0, -394); c.stroke(); c.setLineDash([]);
      const y = on(f, 'yaho', t); const wv = Math.sin(t * (y ? 0.03 : 0.006)) * (y ? 10 : 4);
      c.strokeStyle = '#3a3550'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -400); c.lineTo(0, -470); c.stroke(); c.beginPath(); c.moveTo(2, -470); c.quadraticCurveTo(30, -462 + wv, 56, -450 + wv); c.lineTo(2, -430); c.closePath(); G._bb = { x0: 2, y0: -470, x1: 56, y1: -430 }; G.fillO(c, y ? '#ffd23f' : '#ff5d78', 2.5);
      for (const [x, yy, s] of [[-180, -40, 0.5], [190, -40, 0.45], [120, -150, 0.35]]) B.pine(c, x, yy, s, '#4f8a5c');
    } };
  F.s5_ropebridge = { w: 480, h: 260, tags: ['bridge', 'mountain'], slots: [[-280, 20], [280, 20]],
    draw(c, t, f) {
      const sw = on(f, 'sway', t) ? Math.sin(t * 0.012) * 18 : Math.sin(t * 0.002) * 3;
      G.ell(c, 0, -10, 150, 26); c.fillStyle = '#5a8ac0'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-100, -12); c.lineTo(-60, -12); c.moveTo(30, -4); c.lineTo(80, -4); c.stroke();
      for (const x of [-220, 220]) { G.ell(c, x, -8, 50, 14); c.fillStyle = '#8a7a6a'; c.fill(); G.rr(c, x - 8, -200, 16, 196, 4); G.fillO(c, '#8a5a3a', 2.5); }
      const by = (x) => -110 + (1 - (x / 220) * (x / 220)) * 50 + sw * (1 - Math.abs(x / 220));
      for (let x = -200; x <= 200; x += 25) { G.rr(c, x - 10 + sw * 0.2, by(x) - 6, 20, 12, 3); G.fillO(c, '#c99a64', 2); }
      c.strokeStyle = '#a8733f'; c.lineWidth = 4; for (const o of [-60, -10]) { c.beginPath(); c.moveTo(-220, -190 - o * 0); c.quadraticCurveTo(sw, by(0) + o * 1.6 + 30, 220, -190); c.stroke(); }
    } };
  F.s5_squirreltree = { w: 280, h: 400, tags: ['tree', 'squirrel', 'acorn'], slots: [[-170, 20], [170, 20]],
    draw(c, t, f) {
      const sh = on(f, 'shake', t) ? Math.sin(t * 0.05) * 0.05 : 0;
      c.save(); c.rotate(sh); B.tree(c, 0, 0, 2, '#6aa84f', '#8a5a3a'); c.restore();
      G.ell(c, 4, -110, 12, 16); c.fillStyle = '#4a2a1a'; c.fill();
      if (on(f, 'peek', t)) { const k = cl(prog(f, 'peek', t, 3000) * 5); c.save(); c.translate(4, -116 - k * 22); G.ell(c, 0, 0, 14, 16); G.fillO(c, '#c27a3e', 2.5); for (const s of [-1, 1]) { G.circ(c, s * 9, -14, 5); G.fillO(c, '#c27a3e', 2); } c.fillStyle = '#2a1f35'; G.circ(c, -5, -2, 2.4); c.fill(); G.circ(c, 5, -2, 2.4); c.fill(); G.ell(c, 0, 10, 6, 7); G.fillO(c, '#a8733f', 2); c.restore(); }
      for (const [x, y] of [[-60, -230], [50, -260], [80, -190], [-30, -300]]) { G.ell(c, x, y, 7, 9); G.fillO(c, '#a8733f', 1.5); G.ell(c, x, y - 7, 8, 4); c.fillStyle = '#6a4a2a'; c.fill(); }
    } };

  /* ---------- 59 ピクニック ---------- */
  F.s5_picnicsheet = { w: 380, h: 140, tags: ['sheet', 'picnic', 'food'], slots: [[-130, -30], [130, -30], [0, 10]],
    draw(c, t, f) {
      G.poly(c, [-190, -6, 190, -6, 160, -100, -160, -100]); G.fillO(c, '#ffffff', 3);
      c.save(); c.clip(); c.fillStyle = 'rgba(255,111,145,.55)'; for (let i = -6; i < 7; i++) c.fillRect(i * 30, -100, 15, 100); for (let y = -100; y < 0; y += 24) c.fillRect(-200, y, 400, 12); c.restore();
      const o = on(f, 'open', t);
      G.rr(c, -50, -110, 100, 56, 8); G.fillO(c, '#c0304a', 3);
      if (o) { G.rr(c, -44, -104, 88, 44, 4); c.fillStyle = '#fff4e2'; c.fill(); for (let i = 0; i < 3; i++) { G.poly(c, [-36 + i * 16, -66, -28 + i * 16, -94, -20 + i * 16, -66]); G.fillO(c, '#ffffff', 1.5); c.fillStyle = '#2a3a2a'; c.fillRect(-34 + i * 16, -74, 12, 8); } G.rr(c, 12, -96, 26, 12, 3); G.fillO(c, '#ffd23f', 1.5); G.circ(c, 18, -72, 7); G.fillO(c, '#ff5d78', 1.5); G.circ(c, 32, -72, 7); G.fillO(c, '#7bd36a', 1.5); G.rr(c, 70, -150, 100, 40, 8); G.fillO(c, '#c0304a', 3); }
      else { G.rr(c, -54, -120, 108, 20, 6); G.fillO(c, '#e2433b', 3); c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -120); c.lineTo(0, -54); c.stroke(); }
      G.rr(c, 90, -90, 30, 40, 8); G.fillO(c, '#58b9f0', 2.5); G.rr(c, 96, -98, 18, 10, 3); G.fillO(c, '#ffffff', 2);
    } };
  const butterfly = (c, x, y, t, col, i) => { const fl = Math.abs(Math.sin(t * 0.02 + i)); c.save(); c.translate(x, y); for (const s of [-1, 1]) { G.ell(c, s * 9 * fl, -4, 9 * fl + 2, 10, s * 0.4); G.fillO(c, col, 1.5); } c.fillStyle = '#3a3550'; c.fillRect(-1.5, -10, 3, 14); c.restore(); };
  F.s5_flowerfield = { w: 360, h: 170, tags: ['flower', 'butterfly', 'field'], slots: [[-220, 20], [220, 20]],
    draw(c, t, f) {
      G.ell(c, 0, -36, 180, 40); c.fillStyle = '#7bcf6a'; c.fill();
      for (let i = 0; i < 16; i++) { const x = -150 + ((i * 47) % 300), y = -20 - ((i * 23) % 50), col = ['#ff8fb1', '#ffd84a', '#ffffff', '#b39ae8'][i % 4]; c.strokeStyle = '#4f9a4a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + 14); c.lineTo(x, y); c.stroke(); c.fillStyle = col; for (let k = 0; k < 5; k++) { const a = (k / 5) * PT.TAU + t * 0.0005; G.circ(c, x + Math.cos(a) * 6, y + Math.sin(a) * 6, 5); c.fill(); } G.circ(c, x, y, 4); c.fillStyle = '#ffb02e'; c.fill(); }
      const k = prog(f, 'fly', t, 3500), n = k >= 0 ? 7 : 3;
      for (let i = 0; i < n; i++) { const up = k >= 0 ? Math.sin(Math.min(1, k * 2) * Math.PI / 2) * (80 + i * 20) : 0; butterfly(c, Math.sin(t * 0.0015 + i * 1.7) * (120 + up * 0.4), -80 - up + Math.sin(t * 0.003 + i) * 16, t, ['#ffd23f', '#ff8fb1', '#9fd8ff', '#c9b2ff', '#ffffff', '#ffb04a', '#7bd36a'][i], i); }
    } };
  F.s5_dandelion = { w: 220, h: 220, tags: ['flower', 'dandelion', 'wind'], slots: [[-150, 20], [150, 20]],
    draw(c, t, f) {
      const k = prog(f, 'blow', t, 3200);
      [[-50, -150, 0], [10, -190, 1], [60, -130, 2]].forEach(([x, y, i]) => {
        c.strokeStyle = '#5a9a4a'; c.lineWidth = 4; c.beginPath(); c.moveTo(x * 0.3, 0); c.quadraticCurveTo(x * 0.6, y * 0.5, x, y); c.stroke();
        if (k >= 0 && i !== 2) { G.circ(c, x, y, 6); c.fillStyle = '#c9b090'; c.fill(); }
        else { G.circ(c, x, y, 30); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill(); c.strokeStyle = 'rgba(200,200,200,.8)'; c.lineWidth = 1; for (let a = 0; a < 12; a++) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a / 2) * 28, y + Math.sin(a / 2) * 28); c.stroke(); } }
      });
      G.ell(c, 0, -10, 70, 14); c.fillStyle = '#5cae6a'; c.fill();
      for (const [x, a] of [[-40, -0.6], [30, 0.6]]) { G.ell(c, x, -20, 30, 8, a); c.fillStyle = '#5cbf5a'; c.fill(); }
      G.circ(c, -90, -40, 14); G.fillO(c, '#ffd23f', 2); G.circ(c, -90, -40, 5); c.fillStyle = '#ffb02e'; c.fill();
      if (k >= 0) for (let i = 0; i < 16; i++) { const kk = cl(k * 1.3 - (i % 4) * 0.08); const x = -20 + kk * (200 + (i * 37) % 260) + Math.sin(t * 0.004 + i) * 20, y = -170 - kk * (100 + (i * 29) % 260); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 12); c.stroke(); for (let a = 0; a < 5; a++) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a * 0.8 - 2.8) * 8, y + Math.sin(a * 0.8 - 2.8) * 8); c.stroke(); } }
    } };

  /* ---------- 60 かわあそび ---------- */
  const fish = (c, x, y, a, col) => { c.save(); c.translate(x, y); c.rotate(a); G.ell(c, 0, 0, 20, 9); G.fillO(c, col, 2); G.poly(c, [-18, 0, -30, -9, -30, 9]); G.fillO(c, col, 2); c.fillStyle = '#2a1f35'; G.circ(c, 10, -2, 2.2); c.fill(); c.restore(); };
  F.s5_river = { w: 1600, h: 160, area: 'water', tags: ['water', 'river', 'fish'], slots: [[-300, 40], [300, 40]],
    draw(c, t, f) {
      c.fillStyle = G.grad(c, 0, -160, 0, 0, [[0, '#6fc8ea'], [1, '#4aa8d8']]); c.beginPath(); c.moveTo(-800, -150); for (let x = -800; x <= 800; x += 100) c.lineTo(x, -156 + Math.sin(x * 0.01) * 8); c.lineTo(800, 0); for (let x = 800; x >= -800; x -= 100) c.lineTo(x, -4 + Math.sin(x * 0.013) * 6); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.65)'; c.lineWidth = 3; for (let i = 0; i < 10; i++) { const x = ((i * 173 + t * 0.06) % 1700) - 850, y = -130 + (i * 37) % 110; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 20, y - 6, x + 40, y); c.stroke(); }
      for (let i = 0; i < 3; i++) { const x = ((t * 0.04 + i * 500) % 1600) - 800; fish(c, x, -70 + i * 20, 0, 'rgba(120,150,170,.5)'); }
      const k = prog(f, 'jump', t, 2400);
      if (k >= 0) for (let i = 0; i < 3; i++) { const kk = cl(k * 1.5 - i * 0.2); if (kk <= 0 || kk >= 1) continue; const bx = (f.jx || 0) + (i - 1) * 140, x = bx - 60 + kk * 120, y = -80 - Math.sin(kk * Math.PI) * 160; fish(c, x, y, (kk - 0.5) * 2, ['#ff8a65', '#9fd8ff', '#ffd23f'][i]); if (kk < 0.15 || kk > 0.85) { c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; G.ell(c, kk < 0.5 ? bx - 60 : bx + 60, -80, 26, 8); c.stroke(); } }
    } };
  F.s5_stones = { w: 460, h: 90, tags: ['stone', 'river', 'jump'], slots: [[-280, 30], [280, 30]],
    draw(c, t, f) {
      for (let i = 0; i < 5; i++) { const x = -200 + i * 100, b = on(f, 'hop', t) && f.si === i ? 4 : 0; G.ell(c, x, -20 + b, 40, 16); G.fillO(c, ['#b0b4c0', '#9aa3b8', '#c0c4d0'][i % 3], 3); c.fillStyle = 'rgba(255,255,255,.4)'; G.ell(c, x - 10, -26 + b, 14, 5); c.fill(); }
    } };
  F.s5_watermill = { w: 300, h: 330, tags: ['watermill', 'water', 'mill'], slots: [[-190, 20], [190, 20]],
    draw(c, t, f) {
      G.rr(c, -10, -240, 150, 200, 6); G.fillO(c, '#c99a64', 3); G.poly(c, [-26, -236, 65, -310, 156, -236]); G.fillO(c, '#8a5a3a', 3); G.rr(c, 40, -170, 44, 40, 4); G.fillO(c, '#fff3d0', 2);
      const fast = on(f, 'spin', t), a = t * (fast ? 0.006 : 0.0015);
      c.save(); c.translate(-60, -110); c.rotate(a); G.circ(c, 0, 0, 96); c.strokeStyle = '#8a5a3a'; c.lineWidth = 8; c.stroke(); for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.strokeStyle = '#a8733f'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -96); c.stroke(); G.rr(c, -14, -112, 28, 22, 3); G.fillO(c, '#c99a64', 2); } c.restore();
      G.circ(c, -60, -110, 14); G.fillO(c, '#6a4a2a', 2);
      c.fillStyle = 'rgba(160,220,255,.8)'; for (let i = 0; i < (fast ? 10 : 4); i++) { const k = ((t * 0.002 + i * 0.13) % 1); G.ell(c, -150 + k * 40 + Math.sin(i) * 20, -200 + k * 190, 4, 7); c.fill(); }
    } };

  /* ================= ステージ ================= */
  const S = (o) => PT.STAGES.push(o);
  const crowd = (c, r, x0, y0, w, h, rows) => { for (let j = 0; j < rows; j++) for (let x = x0 + (j % 2) * 14; x < x0 + w; x += 28) { G.circ(c, x, y0 + j * (h / rows), 10); c.fillStyle = ['#ffd1e0', '#fff1c2', '#d6f0ff', '#e0f5d0', '#ffd6b0'][Math.floor(r() * 5)]; c.fill(); } };
  S({ id: 'sportsday', num: 49, name: 'わくわく うんどうかい', bgm: 'fun', floor: [590, 880], color: '#ff7043',
    tools: ['ball', 'balloon', 'drum', 'trumpet', 'onigiri', 'juice', 'bento', 'camera', 'sheet', 'partyhat', 'confetti'], rides: ['tricycle', 'bicycle'],
    spawn: [['yuto', 600, 790], ['pon', 820, 770], ['mimi', 1020, 810], ['sakura', 420, 820], ['papa', 1460, 850]],
    fixtures: [['s5_kusudama', 800, 640], ['s5_tamaire', 300, 720], ['s5_goaltape', 1250, 800]], favs: ['ball', 'partyhat', 'drum', 'bento', 'confetti'],
    bg(c, r) {
      B.sky(c, '#8fd3ff', '#eaf8ff', 580); B.cloud(c, 180, 90, 1); B.cloud(c, 1200, 70, 0.9);
      G.rr(c, 900, 260, 640, 320, 6); G.fillO(c, '#fff4e2', 3); for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) { G.rr(c, 930 + i * 100, 290 + j * 90, 70, 56, 4); G.fillO(c, '#bfe6ff', 2); }
      G.rr(c, 1170, 180, 140, 90, 8); G.fillO(c, '#fff4e2', 3); G.circ(c, 1240, 225, 30); G.fillO(c, '#ffffff', 3); c.strokeStyle = '#3a3550'; c.lineWidth = 3; c.beginPath(); c.moveTo(1240, 225); c.lineTo(1240, 205); c.moveTo(1240, 225); c.lineTo(1256, 232); c.stroke();
      for (const x of [60, 470]) { G.rr(c, x, 420, 10, 170, 3); G.fillO(c, '#9aa3b8', 2); G.rr(c, x + 320, 420, 10, 170, 3); G.fillO(c, '#9aa3b8', 2); G.poly(c, [x - 20, 430, x + 165, 360, x + 350, 430]); G.fillO(c, '#ffffff', 3); c.save(); c.clip(); c.fillStyle = '#e2433b'; for (let k = 0; k < 8; k++) c.fillRect(x - 20 + k * 50, 350, 25, 90); c.restore(); }
      crowd(c, r, 60, 470, 330, 100, 3); crowd(c, r, 470, 470, 330, 100, 3);
      B.bunting(c, 0, 120, 800, 140, 70); B.bunting(c, 800, 140, 1600, 110, 70);
      c.fillStyle = G.grad(c, 0, 580, 0, H, [[0, '#e6c69a'], [1, '#d8b688']]); c.fillRect(0, 580, W, H - 580);
      c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 5; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(800, 760, 760 - i * 60, 150 - i * 20, 0, 0, PT.TAU); c.stroke(); }
    } });
  S({ id: 'soccer', num: 50, name: 'サッカー じょう', bgm: 'fun', floor: [600, 880], color: '#43a047',
    tools: ['ball', 'juice', 'trumpet', 'drum', 'camera', 'balloon', 'tambourine', 'onigiri', 'banana', 'sunglasses'], rides: ['bus', 'bicycle', 'car'],
    spawn: [['ricky', 600, 790], ['gaku', 820, 770], ['choco', 1020, 810], ['kon', 420, 820], ['yuto', 960, 860]],
    fixtures: [['s5_soccergoal', 1300, 700], ['s5_scoreboard', 230, 650], ['s5_ballcart', 620, 830]], favs: ['ball', 'trumpet', 'drum', 'juice'],
    bg(c, r) {
      B.sky(c, '#7fc8ff', '#dff3ff', 600); B.cloud(c, 300, 70, 0.9); B.cloud(c, 1100, 90, 1);
      c.fillStyle = '#5a6a8a'; c.beginPath(); c.moveTo(0, 260); c.quadraticCurveTo(800, 200, 1600, 260); c.lineTo(1600, 600); c.lineTo(0, 600); c.closePath(); c.fill();
      crowd(c, r, 10, 290, 1590, 240, 7);
      c.fillStyle = '#3a4a6a'; c.fillRect(0, 540, W, 60); for (let i = 0; i < 6; i++) { G.rr(c, 30 + i * 270, 552, 220, 36, 6); G.fillO(c, COLS[i], 2); txt(c, 'ゴール！', 140 + i * 270, 571, 22); }
      for (const x of [100, 1500]) { G.rr(c, x - 6, 60, 12, 220, 3); G.fillO(c, '#9aa3b8', 2); G.rr(c, x - 50, 30, 100, 50, 8); G.fillO(c, '#e8eef5', 3); c.fillStyle = '#fff6b8'; for (let i = 0; i < 4; i++) { G.circ(c, x - 34 + i * 23, 55, 8); c.fill(); } }
      for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#5cb85c' : '#4ca84c'; c.fillRect(i * 200, 600, 200, H - 600); }
      c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 612); c.lineTo(W, 612); c.moveTo(800, 612); c.lineTo(800, H); c.stroke(); G.ell(c, 800, 760, 170, 70); c.stroke();
    } });
  S({ id: 'baseball', num: 51, name: 'カキーン やきゅうじょう', bgm: 'fun', floor: [600, 880], color: '#1e88e5',
    tools: ['ball', 'trumpet', 'drum', 'juice', 'burger', 'icecream', 'camera', 'balloon', 'sunglasses', 'corn'], rides: ['bus', 'car'],
    spawn: [['papa', 600, 800], ['nyan', 820, 780], ['futan', 1100, 820], ['lulu', 520, 860], ['jiji', 1400, 840]],
    fixtures: [['s5_cheerstand', 800, 610], ['s5_batbox', 380, 800], ['s5_mound', 1050, 770]], favs: ['ball', 'trumpet', 'juice', 'icecream'],
    bg(c, r) {
      B.sky(c, '#5ab4f0', '#d8f0ff', 600); B.cloud(c, 160, 80, 1); B.cloud(c, 1300, 60, 0.8);
      c.fillStyle = '#2f7a4a'; c.fillRect(0, 380, W, 220); c.fillStyle = '#ffd23f'; c.fillRect(0, 372, W, 10);
      [['100', 200], ['120', 800], ['100', 1400]].forEach(([s, x]) => txt(c, s, x, 420, 34, '#ffffff'));
      G.rr(c, 600, 120, 400, 200, 12); G.fillO(c, '#2a3a5a', 4); txt(c, 'ホームラン！', 800, 190, 44, '#ffe066'); for (let i = 0; i < 9; i++) { G.rr(c, 630 + i * 40, 250, 30, 40, 4); c.fillStyle = '#10182a'; c.fill(); txt(c, String(i % 3), 645 + i * 40, 270, 22); }
      for (const x of [140, 1460]) { G.rr(c, x - 6, 80, 12, 300, 3); G.fillO(c, '#9aa3b8', 2); G.rr(c, x - 60, 50, 120, 50, 8); G.fillO(c, '#e8eef5', 3); c.fillStyle = '#fff6b8'; for (let i = 0; i < 5; i++) { G.circ(c, x - 44 + i * 22, 75, 8); c.fill(); } }
      B.grass(c, 600, '#7bc86a', '#5cae58');
      c.fillStyle = '#d9a066'; G.poly(c, [380, 820, 800, 650, 1220, 760, 800, 900]); c.fill(); c.fillStyle = '#7bc86a'; G.poly(c, [480, 810, 800, 690, 1110, 765, 800, 860]); c.fill();
      c.fillStyle = '#ffffff'; for (const [x, y] of [[800, 662], [1200, 762], [1060, 760]]) { G.rr(c, x - 12, y - 8, 24, 16, 3); c.fill(); }
      c.strokeStyle = '#ffffff'; c.lineWidth = 4; c.beginPath(); c.moveTo(380, 820); c.lineTo(0, 700); c.moveTo(380, 820); c.lineTo(900, 900); c.stroke();
    } });
  S({ id: 'bowling', num: 52, name: 'ゴロゴロ ボウリング', bgm: 'shop', floor: [600, 880], color: '#8e24aa',
    tools: ['ball', 'juice', 'burger', 'icecream', 'camera', 'sunglasses', 'starglasses', 'balloon', 'phone', 'candy'], rides: ['car'],
    spawn: [['lulu', 600, 800], ['pon', 820, 790], ['mama', 1060, 820], ['moko', 420, 840], ['ricky', 1500, 850]],
    fixtures: [['s5_lane', 850, 700], ['s5_ballreturn', 260, 810], ['s5_pinmascot', 1380, 760]], favs: ['ball', 'sunglasses', 'juice', 'starglasses'],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 600, [[0, '#2a1a4a'], [1, '#5a3a8a']]); c.fillRect(0, 0, W, 600);
      c.strokeStyle = '#ff6fd0'; c.lineWidth = 8; G.rr(c, 520, 50, 560, 100, 30); c.stroke(); txt(c, 'ボウリング', 800, 102, 54, '#ffe066');
      for (let i = 0; i < 4; i++) { const x = 60 + i * 400; G.rr(c, x, 190, 280, 110, 8); G.fillO(c, '#10182a', 3); for (let k = 0; k < 6; k++) { G.rr(c, x + 14 + k * 44, 214, 36, 30, 3); c.fillStyle = '#2a3a5a'; c.fill(); txt(c, ['X', '9', '/', 'X', '8', '7'][(k + i) % 6], x + 32 + k * 44, 230, 20, '#ffe066'); } txt(c, ['A', 'B', 'C', 'D'][i], x + 140, 278, 22); }
      for (let i = 0; i < 4; i++) { const x0 = i * 400; c.fillStyle = '#e8b878'; G.poly(c, [x0 + 40, 600, x0 + 360, 600, x0 + 300, 380, x0 + 100, 380]); c.fill(); for (let k = 0; k < 10; k++) { c.fillStyle = '#ffffff'; G.ell(c, x0 + 160 + (k % 4) * 26, 400 - Math.floor(k / 4) * 6, 5, 12); c.fill(); } }
      c.fillStyle = '#3a2a5a'; c.fillRect(0, 600, W, H - 600); c.fillStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < 40; i++) { c.fillStyle = COLS[i % 6] + '55'; G.star(c, r() * W, 620 + r() * 260, 8, 3.5); c.fill(); }
    } });
  S({ id: 'minigolf', num: 53, name: 'ミニゴルフ', bgm: 'park', floor: [590, 880], color: '#66bb6a',
    tools: ['ball', 'juice', 'camera', 'parasol', 'sunglasses', 'icecream', 'flower', 'pinwheel', 'kite', 'sheet'], rides: ['car', 'tricycle'],
    spawn: [['jiji', 600, 800], ['baba', 820, 790], ['pyoko', 1000, 830], ['penta', 470, 850], ['futan', 1480, 840]],
    fixtures: [['s5_windmillhole', 330, 760], ['s5_loop', 800, 690], ['s5_golfcup', 1220, 810]], favs: ['ball', 'pinwheel', 'sunglasses', 'parasol'],
    bg(c, r) {
      B.sky(c, '#9fd8ff', '#f0fbff', 580); B.cloud(c, 300, 100, 1); B.cloud(c, 1150, 80, 0.9);
      c.fillStyle = '#a6dc8a'; G.ell(c, 300, 590, 600, 160); c.fill(); G.ell(c, 1300, 590, 600, 180); c.fill();
      G.rr(c, 1260, 330, 160, 160, 6); G.fillO(c, '#fff1dc', 3); for (const x of [1250, 1400]) { G.rr(c, x, 290, 30, 200, 4); G.fillO(c, '#ffe3ec', 3); G.poly(c, [x - 8, 292, x + 15, 250, x + 38, 292]); G.fillO(c, '#ff6f91', 3); } G.rr(c, 1315, 420, 50, 70, 25); G.fillO(c, '#c27a3e', 2.5);
      for (let i = 0; i < 6; i++) B.tree(c, 80 + i * 260, 580, 0.7 + r() * 0.3, i % 2 ? '#79c26a' : '#5fae58');
      c.fillStyle = '#fff4e2'; for (let x = 0; x < W; x += 50) { G.rr(c, x + 10, 540, 12, 50, 4); c.fill(); } c.fillRect(0, 556, W, 8);
      B.grass(c, 586, '#9ad882', '#7cc46a'); B.tufts(c, r, 600, 50, '#6fb85e'); B.flowers(c, r, 600, 24);
      txt(c, 'HOLE 1', 160, 640, 26, 'rgba(255,255,255,.7)'); txt(c, 'HOLE 2', 800, 630, 26, 'rgba(255,255,255,.7)'); txt(c, 'HOLE 3', 1440, 640, 26, 'rgba(255,255,255,.7)');
    } });
  S({ id: 'gym', num: 54, name: 'ぴょんぴょん たいいくかん', bgm: 'title', floor: [600, 880], color: '#ffa726',
    tools: ['ball', 'music', 'drum', 'juice', 'blocks', 'cushion', 'balloon', 'camera', 'tambourine'], rides: ['trampoline', 'tricycle', 'seesaw'],
    spawn: [['pyoko', 560, 800], ['yuto', 1000, 790], ['mimi', 1100, 840], ['gaku', 440, 860], ['choco', 1500, 800]],
    fixtures: [['s5_bigball', 260, 720], ['s5_vaultbox', 820, 760], ['s5_mat', 1300, 800]], favs: ['ball', 'music', 'trampoline', 'drum'],
    bg(c, r) {
      B.wallpaper(c, 600, '#f6e2c0', '#efd6ae');
      for (let i = 0; i < 6; i++) B.window(c, 60 + i * 260, 60, 180, 110, (c2, x, y, w, h) => { B.sky(c2, '#9fd8ff', '#e3f6ff', y + h); B.cloud(c2, x + 30, y + 40, 0.5); });
      G.rr(c, 560, 230, 480, 300, 10); G.fillO(c, '#8a5a3a', 4); for (const s of [-1, 1]) { c.fillStyle = '#c0304a'; c.beginPath(); c.moveTo(800 + s * 230, 240); c.quadraticCurveTo(800 + s * 160, 380, 800 + s * 230, 520); c.lineTo(800 + s * 230, 240); c.fill(); } G.rr(c, 580, 236, 440, 30, 6); G.fillO(c, '#c0304a', 2);
      for (const x of [200, 1400]) { G.rr(c, x - 70, 240, 140, 90, 6); G.fillO(c, '#ffffff', 3); c.strokeStyle = '#e2433b'; c.lineWidth = 3; c.strokeRect(x - 26, 280, 52, 40); G.ell(c, x, 340, 32, 8); c.strokeStyle = '#ff6f3d'; c.lineWidth = 5; c.stroke(); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(x - 30 + k * 15, 342); c.lineTo(x - 20 + k * 10, 380); c.stroke(); } }
      for (const x of [460, 1120]) { G.rr(c, x - 50, 440, 100, 60, 8); c.fillStyle = '#ffffff'; c.fill(); txt(c, ['がんばれ', 'ファイト'][x > 800 ? 1 : 0], x, 470, 20, '#e2433b'); }
      B.floorWood(c, 600, '#e0b070');
      c.strokeStyle = '#ffffff'; c.lineWidth = 4; G.ell(c, 800, 760, 200, 60); c.stroke(); c.strokeStyle = '#4c9be8'; c.beginPath(); c.moveTo(0, 650); c.lineTo(W, 650); c.stroke(); c.strokeStyle = '#e2433b'; c.beginPath(); c.moveTo(0, 870); c.lineTo(W, 870); c.stroke();
    } });
  S({ id: 'surf', num: 55, name: 'サーフィン ビーチ', bgm: 'beach', floor: [580, 880], color: '#00acc1',
    tools: ['swimring', 'parasol', 'bucket', 'shell', 'sunglasses', 'juice', 'icecream', 'watermelon', 'sheet', 'ball', 'duck'], rides: ['swimring', 'boat'],
    spawn: [['penta', 560, 820], ['lulu', 820, 840], ['ricky', 1060, 830], ['kon', 400, 860], ['sakura', 900, 700]],
    fixtures: [['s5_surfwave', 800, 760], ['s5_shaveice', 230, 850], ['s5_lifeguard', 1400, 850]], favs: ['swimring', 'sunglasses', 'icecream', 'watermelon', 'parasol'],
    bg(c, r) {
      B.sky(c, '#4fc3f7', '#e8fbff', 520); B.cloud(c, 260, 90, 1); B.cloud(c, 1000, 60, 0.8);
      c.fillStyle = 'rgba(255,240,150,.5)'; G.circ(c, 1350, 120, 90); c.fill(); G.circ(c, 1350, 120, 60); c.fillStyle = '#ffe066'; c.fill();
      c.fillStyle = G.grad(c, 0, 440, 0, 600, [[0, '#2a8ac8'], [1, '#3aa0d8']]); c.fillRect(0, 440, W, 160);
      G.poly(c, [1100, 470, 1180, 380, 1260, 470]); c.fillStyle = '#ffffff'; c.fill(); G.poly(c, [1150, 470, 1180, 400, 1210, 470]); c.fillStyle = '#ff6f91'; c.fill();
      for (const [x, s] of [[80, 1], [1540, 1.1]]) { c.strokeStyle = '#a8733f'; c.lineWidth = 16 * s; c.beginPath(); c.moveTo(x, 900); c.quadraticCurveTo(x + 40 * s, 600, x + 10, 380); c.stroke(); for (let i = 0; i < 6; i++) { const a = (i / 6) * PT.TAU; G.ell(c, x + 10 + Math.cos(a) * 70 * s, 380 + Math.sin(a) * 30 * s, 80 * s, 18 * s, a); G.fillO(c, '#4fae58', 2.5); } }
      c.fillStyle = G.grad(c, 0, 580, 0, H, [[0, '#f8e2b0'], [1, '#f0d090']]); c.fillRect(0, 580, W, H - 580);
      c.fillStyle = 'rgba(200,160,100,.4)'; for (let i = 0; i < 40; i++) { G.circ(c, r() * W, 780 + r() * 120, 2); c.fill(); }
    } });
  S({ id: 'ski', num: 56, name: 'シュプール スキーじょう', bgm: 'title', floor: [590, 880], color: '#5c9ded',
    tools: ['snow', 'snowman', 'blanket', 'juice', 'marshmallow', 'santa', 'camera', 'sunglasses', 'cookie'], rides: ['tricycle', 'slide'],
    spawn: [['penta', 860, 820], ['moko', 1000, 860], ['yume', 680, 860], ['kon', 1300, 860], ['papa', 1500, 820]],
    fixtures: [['s5_slope', 420, 700], ['s5_skilift', 1100, 700], ['s5_kamakura', 1420, 830]], favs: ['snow', 'sunglasses', 'santa', 'marshmallow'],
    ambient: (c, t) => { c.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 26; i++) { const x = ((i * 137 + t * 0.012) % (W + 40)) - 20, y = ((i * 89 + t * 0.025) % (H + 20)) - 10; G.circ(c, x, y, 2 + (i % 2)); c.fill(); } },
    bg(c, r) {
      B.sky(c, '#7fb8f0', '#eaf4ff', 590);
      for (const [x, w, h] of [[200, 420, 380], [700, 520, 460], [1250, 480, 400]]) { G.poly(c, [x - w / 2, 590, x, 590 - h, x + w / 2, 590]); c.fillStyle = '#b8c8e8'; c.fill(); G.poly(c, [x - w * 0.16, 590 - h * 0.68, x, 590 - h, x + w * 0.16, 590 - h * 0.68]); c.fillStyle = '#ffffff'; c.fill(); }
      for (let i = 0; i < 12; i++) { const x = 30 + i * 140; B.pine(c, x, 590, 0.6 + (i % 3) * 0.12, '#3f7a5c'); c.fillStyle = '#ffffff'; G.ell(c, x, 540 - (i % 3) * 8, 22, 6); c.fill(); }
      G.rr(c, 1440, 440, 150, 140, 6); G.fillO(c, '#c99a64', 3); G.poly(c, [1430, 444, 1515, 380, 1600, 444]); G.fillO(c, '#e2433b', 3); G.rr(c, 1470, 480, 40, 40, 4); G.fillO(c, '#fff3b0', 2);
      c.fillStyle = G.grad(c, 0, 580, 0, H, [[0, '#ffffff'], [1, '#e3eefb']]); c.fillRect(0, 580, W, H - 580);
    } });
  S({ id: 'onsen', num: 57, name: 'ほかほか おんせん', bgm: 'camp', floor: [600, 880], color: '#d4826a',
    tools: ['bucket', 'juice', 'blanket', 'duck', 'yukata', 'apple', 'pudding', 'cushion', 'book', 'pinwheel'], rides: ['car', 'bus'],
    spawn: [['baba', 520, 860], ['jiji', 1100, 860], ['pon', 420, 760], ['yume', 1500, 860], ['moko', 1000, 640]],
    fixtures: [['s5_onsen', 800, 820], ['s5_milkcooler', 200, 690], ['s5_pingpong', 1360, 720]], favs: ['yukata', 'duck', 'juice', 'bucket'],
    bg(c, r) {
      B.sky(c, '#ffb07a', '#ffe9c8', 600); B.cloud(c, 200, 90, 0.9, '#fff4e6'); B.cloud(c, 1100, 70, 0.8, '#fff4e6');
      for (const [x, h] of [[300, 300], [800, 380], [1300, 320]]) { c.fillStyle = '#9ab07a'; G.ell(c, x, 560, 380, h); c.fill(); }
      for (let i = 0; i < 12; i++) { const x = 40 + i * 140; G.rr(c, x - 6, 380, 12, 220, 3); G.fillO(c, '#8a5a3a', 2); } c.fillStyle = '#c99a64'; c.fillRect(0, 400, W, 200); c.strokeStyle = '#a8733f'; c.lineWidth = 3; for (let x = 0; x < W; x += 24) { c.beginPath(); c.moveTo(x, 400); c.lineTo(x, 600); c.stroke(); }
      G.rr(c, 640, 150, 320, 240, 10); G.fillO(c, '#8a5a3a', 4); G.poly(c, [600, 160, 800, 70, 1000, 160]); G.fillO(c, '#4a3a4a', 4);
      for (let i = 0; i < 3; i++) { G.rr(c, 680 + i * 84, 260, 76, 130, 4); G.fillO(c, ['#4c6ac8', '#e2433b', '#4c6ac8'][i], 2.5); } txt(c, 'ゆ', 722, 310, 50); txt(c, 'ゆ', 890, 310, 50);
      for (const x of [520, 1080]) { G.rr(c, x - 4, 470, 8, 130, 2); G.fillO(c, '#9aa3b8', 2); G.rr(c, x - 22, 420, 44, 60, 10); G.fillO(c, '#fff3d0', 3); c.fillStyle = 'rgba(255,220,120,.3)'; G.circ(c, x, 450, 50); c.fill(); }
      c.fillStyle = '#b8a890'; c.fillRect(0, 600, W, H - 600); c.fillStyle = '#a89878'; for (let i = 0; i < 60; i++) { G.ell(c, r() * W, 620 + r() * 260, 20 + r() * 20, 10 + r() * 6); c.fill(); }
    } });
  S({ id: 'mountain', num: 58, name: 'やっほー やまのぼり', bgm: 'park', floor: [590, 880], color: '#558b2f',
    tools: ['bag', 'explorer', 'onigiri', 'juice', 'camera', 'magnifier', 'bugnet', 'acorn', 'flower', 'umbrella'], rides: ['bicycle', 'tent', 'horse'],
    spawn: [['papa', 560, 820], ['gaku', 1060, 840], ['kon', 400, 860], ['mama', 1500, 870], ['futan', 680, 860]],
    fixtures: [['s5_summit', 820, 660], ['s5_squirreltree', 220, 720], ['s5_ropebridge', 1340, 830]], favs: ['explorer', 'bag', 'camera', 'onigiri', 'magnifier'],
    bg(c, r) {
      B.sky(c, '#8fd0ff', '#f0faff', 590); B.cloud(c, 140, 120, 1); B.cloud(c, 1240, 90, 0.9);
      for (const [x, w, h, col] of [[150, 600, 330, '#a8c0d8'], [1450, 640, 360, '#a8c0d8'], [500, 700, 240, '#9ac08a'], [1150, 700, 260, '#8ab07a']]) { G.poly(c, [x - w / 2, 590, x, 590 - h, x + w / 2, 590]); c.fillStyle = col; c.fill(); if (col === '#a8c0d8') { G.poly(c, [x - w * 0.12, 590 - h * 0.76, x, 590 - h, x + w * 0.12, 590 - h * 0.76]); c.fillStyle = '#ffffff'; c.fill(); } }
      c.strokeStyle = '#3a3550'; c.lineWidth = 2.5; for (let i = 0; i < 4; i++) { const x = 300 + i * 90, y = 180 + (i % 2) * 30; c.beginPath(); c.moveTo(x - 12, y); c.quadraticCurveTo(x - 6, y - 8, x, y); c.quadraticCurveTo(x + 6, y - 8, x + 12, y); c.stroke(); }
      B.grass(c, 586, '#a6d98a', '#86c46a'); B.tufts(c, r, 600, 50, '#6fb85e'); B.flowers(c, r, 600, 20);
      c.strokeStyle = '#c9a26a'; c.lineWidth = 30; c.beginPath(); c.moveTo(0, 860); c.quadraticCurveTo(500, 760, 700, 640); c.stroke();
    } });
  S({ id: 'picnic', num: 59, name: 'ぽかぽか ピクニック', bgm: 'park', floor: [590, 880], color: '#9ccc65',
    tools: ['sheet', 'bento', 'onigiri', 'juice', 'apple', 'strawberry', 'kite', 'bubbles', 'bugnet', 'basket', 'ball'], rides: ['bicycle', 'tricycle', 'tent'],
    spawn: [['mimi', 560, 820], ['pyoko', 1080, 830], ['mama', 680, 860], ['nyan', 1500, 860], ['choco', 420, 850]],
    fixtures: [['s5_picnicsheet', 800, 820], ['s5_flowerfield', 300, 740], ['s5_dandelion', 1340, 750]], favs: ['bento', 'onigiri', 'kite', 'bubbles', 'sheet'],
    bg(c, r) {
      B.sky(c, '#9fd8ff', '#f4fcff', 580); B.cloud(c, 220, 90, 1.1); B.cloud(c, 900, 60, 0.8); B.cloud(c, 1350, 120, 0.9);
      c.fillStyle = '#ffe066'; G.circ(c, 1450, 90, 46); c.fill();
      c.fillStyle = '#b8e09a'; G.ell(c, 400, 590, 700, 200); c.fill(); c.fillStyle = '#a6d98a'; G.ell(c, 1250, 590, 620, 170); c.fill();
      G.ell(c, 1100, 520, 220, 34); c.fillStyle = '#7fc8ea'; c.fill();
      for (const [x, s] of [[120, 1.1], [700, 0.8], [1500, 1]]) B.tree(c, x, 580, s, '#6dbb5f');
      B.tree(c, 980, 570, 0.7, '#ffb3c8', '#9a6b42');
      c.strokeStyle = '#ffffff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(560, 600); c.lineTo(500, 200); c.stroke(); c.save(); c.translate(500, 200); c.rotate(0.2); G.poly(c, [0, -40, 30, 0, 0, 40, -30, 0]); G.fillO(c, '#ff6f91', 2.5); c.restore();
      B.grass(c, 586, '#a6e08a', '#86c86a'); B.tufts(c, r, 600, 60, '#6fb85e'); B.flowers(c, r, 600, 60);
    } });
  S({ id: 'riverplay', num: 60, name: 'じゃぶじゃぶ かわあそび', bgm: 'camp', floor: [600, 880], color: '#29b6f6',
    tools: ['bucket', 'fishingrod', 'bugnet', 'swimring', 'duck', 'watermelon', 'onigiri', 'juice', 'sheet', 'magnifier', 'shell'], rides: ['boat', 'swimring', 'tent'],
    spawn: [['yuto', 520, 830], ['kon', 820, 860], ['penta', 1100, 840], ['pon', 360, 860], ['jiji', 1500, 860]],
    fixtures: [['s5_river', 800, 770], ['s5_stones', 760, 740], ['s5_watermill', 1380, 690]], favs: ['bucket', 'fishingrod', 'swimring', 'watermelon', 'duck'],
    bg(c, r) {
      B.sky(c, '#8fd3ff', '#eefaff', 560); B.cloud(c, 260, 80, 1); B.cloud(c, 1100, 110, 0.9);
      c.fillStyle = '#7aa86a'; G.ell(c, 300, 560, 500, 260); c.fill(); c.fillStyle = '#6a9a5a'; G.ell(c, 1200, 560, 600, 300); c.fill();
      for (let i = 0; i < 10; i++) B.pine(c, 40 + i * 170, 590, 0.7 + (i % 3) * 0.15, i % 2 ? '#4f8a5c' : '#3f7a4c');
      c.fillStyle = '#c0b49a'; c.fillRect(0, 590, W, 30); for (let i = 0; i < 30; i++) { G.ell(c, r() * W, 600 + r() * 16, 10 + r() * 14, 6 + r() * 4); c.fillStyle = ['#b0b4c0', '#9aa3b8', '#c8c0b0'][i % 3]; c.fill(); }
      B.grass(c, 610, '#9ad882', '#7cc46a'); B.tufts(c, r, 780, 40, '#6fb85e'); B.flowers(c, r, 790, 20);
    } });
})();
