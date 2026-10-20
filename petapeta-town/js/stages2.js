/* ふえた ステージ（13〜24）：はいけい・あそびどうぐ */
'use strict';
(() => {
  const G = PT.G, B = PT.BG, F = PT.FIX, W = PT.W, H = PT.H;

  /* ================= あそびどうぐ（フィクスチャ） ================= */
  F.snowmanF = { w: 170, h: 230, tags: ['snowman', 'snow'], slots: [[-120, 20], [120, 20]],
    draw(c, t, f) {
      const wave = f.wave && t < f.wave ? Math.sin(t * 0.03) * 0.5 : 0;
      G.circ(c, 0, -60, 66); G.fillO(c, '#ffffff', 3); G.circ(c, 0, -160, 48); G.fillO(c, '#ffffff', 3);
      c.fillStyle = '#2a1f35'; G.circ(c, -16, -170, 5); c.fill(); G.circ(c, 16, -170, 5); c.fill(); for (const y of [-80, -56, -32]) { G.circ(c, 0, y, 5); c.fill(); }
      G.poly(c, [0, -158, 30, -152, 0, -148]); c.fillStyle = '#ff9a3d'; c.fill();
      c.strokeStyle = '#2a1f35'; c.lineWidth = 3; c.beginPath(); c.arc(0, -150, 14, 0.3, Math.PI - 0.3); c.stroke();
      G.rr(c, -46, -128, 92, 16, 8); G.fillO(c, f.scarf || '#ff6f91', 2.5);
      G.rr(c, -34, -232, 68, 46, 6); G.fillO(c, '#3a3550', 3); G.rr(c, -50, -196, 100, 12, 5); G.fillO(c, '#3a3550', 3);
      c.strokeStyle = '#8a5a2b'; c.lineWidth = 6; c.lineCap = 'round';
      c.save(); c.translate(-60, -96); c.rotate(-0.5 + wave); c.beginPath(); c.moveTo(0, 0); c.lineTo(-60, -30); c.stroke(); c.restore();
      c.save(); c.translate(60, -96); c.rotate(0.5 - wave); c.beginPath(); c.moveTo(0, 0); c.lineTo(60, -30); c.stroke(); c.restore();
    } };
  F.igloo = { w: 300, h: 190, tags: ['igloo', 'house', 'snow'], slots: [[0, 30], [-180, 20], [180, 20]],
    draw(c, t, f) {
      c.beginPath(); c.moveTo(-150, 0); c.bezierCurveTo(-150, -230, 150, -230, 150, 0); c.closePath(); G._bb = { x0: -150, y0: -175, x1: 150, y1: 0 }; G.fillO(c, '#f4f9ff', 4);
      c.strokeStyle = '#cfe0f2'; c.lineWidth = 3; for (const y of [-40, -80, -120]) { c.beginPath(); c.moveTo(-150 + (-y) * 0.12, y); c.lineTo(150 - (-y) * 0.12, y); c.stroke(); }
      for (let r = 0; r < 4; r++) for (let x = -130 + (r % 2) * 30; x < 130; x += 60) { c.beginPath(); c.moveTo(x, -r * 40); c.lineTo(x, -r * 40 - 40); c.stroke(); }
      c.beginPath(); c.moveTo(-50, 0); c.lineTo(-50, -60); c.arc(0, -60, 50, Math.PI, 0); c.lineTo(50, 0); c.closePath(); c.fillStyle = f.glow && t < f.glow ? '#ffd76a' : '#3a4a7a'; c.fill();
    } };
  F.sledhill = { w: 420, h: 220, tags: ['slope', 'snow'], slots: [[-150, -170], [200, 30]],
    draw(c) {
      c.beginPath(); c.moveTo(-210, 0); c.lineTo(-210, -200); c.quadraticCurveTo(-120, -200, -40, -110); c.quadraticCurveTo(60, -10, 210, 0); c.closePath(); G._bb = { x0: -210, y0: -200, x1: 210, y1: 0 }; G.fillO(c, '#ffffff', 4);
      c.strokeStyle = '#cfe0f2'; c.lineWidth = 3; c.beginPath(); c.moveTo(-180, -170); c.quadraticCurveTo(-90, -160, -20, -86); c.stroke();
      G.rr(c, -200, -232, 70, 18, 8); G.fillO(c, '#ff6f61', 3); c.strokeStyle = '#a8324a'; c.lineWidth = 4; c.beginPath(); c.moveTo(-204, -214); c.quadraticCurveTo(-210, -206, -196, -204); c.lineTo(-130, -204); c.stroke();
    } };
  F.bigtank = { w: 560, h: 330, tags: ['water', 'tank', 'fish'], slots: [[-200, 40], [0, 40], [200, 40]],
    draw(c, t, f) {
      G.rr(c, -280, -330, 560, 320, 20); G.fillO(c, '#5aa9e6', 4);
      c.save(); G.rr(c, -264, -314, 528, 288, 14); c.clip();
      c.fillStyle = G.grad(c, 0, -314, 0, -26, [[0, '#7fd0ff'], [1, '#2f7fc8']]); c.fillRect(-264, -314, 528, 288);
      c.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 4; i++) { c.save(); c.translate(-220 + i * 140, -314); c.rotate(0.3); c.fillRect(0, 0, 30, 360); c.restore(); }
      c.fillStyle = '#f3d58f'; G.ell(c, 0, -26, 300, 30); c.fill();
      for (const [x, col] of [[-200, '#ff6f91'], [-150, '#ffb04a'], [180, '#b39ae8'], [220, '#58c46b']]) { G.ell(c, x, -50, 12, 40); c.fillStyle = col; c.fill(); }
      const sp = f.swirl && t < f.swirl ? 3 : 1;
      for (let i = 0; i < 9; i++) { const k = ((t * 0.00006 * sp * (1 + (i % 3) * 0.3) + i * 0.13) % 1); const x = -260 + k * 520, y = -260 + ((i * 53) % 190) + Math.sin(t * 0.003 + i) * 10; c.save(); c.translate(x, y); if (i % 2) c.scale(-1, 1); G.ell(c, 0, 0, 18 - (i % 3) * 3, 11 - (i % 3) * 2); c.fillStyle = ['#ff8a3d', '#ffd23f', '#ff6f91', '#58e0d0'][i % 4]; c.fill(); G.poly(c, [16, 0, 28, -10, 28, 10]); c.fill(); c.fillStyle = '#2a1f35'; G.circ(c, -9, -2, 2.4); c.fill(); c.restore(); }
      c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 8; i++) { const k = ((t * 0.0003 + i * 0.17) % 1); G.circ(c, -100 + i * 30, -40 - k * 260, 4 + (i % 3)); c.fill(); }
      c.restore();
    } };
  F.dolphinpool = { w: 440, h: 150, area: 'water', tags: ['water', 'pool', 'dolphin'], slots: [[-250, 0], [250, 0]],
    draw(c, t, f) {
      G.ell(c, 0, -50, 220, 62); G.fillO(c, '#cfd8ea', 4); G.ell(c, 0, -52, 196, 48); c.fillStyle = '#58b9f0'; c.fill();
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; for (let i = 0; i < 5; i++) { const x = -150 + i * 70; c.beginPath(); c.moveTo(x, -50); c.quadraticCurveTo(x + 14, -56 + Math.sin(t * 0.004 + i) * 3, x + 28, -50); c.stroke(); }
      const j = f.jump && t < f.jump ? 1 - (f.jump - t) / 1600 : -1;
      if (j >= 0) { const x = -140 + j * 280, y = -50 - Math.sin(j * Math.PI) * 220; c.save(); c.translate(x, y); c.rotate(-0.8 + j * 1.6); G.ell(c, 0, 0, 46, 18); G.fillO(c, '#7fa8d8', 3); G.poly(c, [-6, -14, 8, -30, 12, -14]); c.fillStyle = '#7fa8d8'; c.fill(); G.poly(c, [-44, 0, -62, -14, -62, 14]); c.fill(); c.fillStyle = '#2a1f35'; G.circ(c, 26, -4, 3); c.fill(); c.restore(); }
      else { c.save(); c.translate(80, -60); G.ell(c, 0, 0, 30, 10); c.fillStyle = '#7fa8d8'; c.fill(); G.poly(c, [-4, -6, 6, -22, 10, -6]); c.fill(); c.restore(); }
    } };
  F.penguinrock = { w: 260, h: 170, tags: ['rock', 'penguin'], slots: [[-160, 20], [160, 20]],
    draw(c, t, f) {
      G.blob(c, [-130, 0, -120, -100, -50, -150, 40, -140, 120, -80, 130, 0]); G.fillO(c, '#e8f2ff', 4);
      const n = 3; for (let i = 0; i < n; i++) { const sl = f.slide && t < f.slide ? 1 - (f.slide - t) / 1500 : 0; const x = -60 + i * 50 + (i === 0 ? sl * 140 : 0), y = -140 + i * 28 + (i === 0 ? sl * 130 : 0); const b = Math.sin(t * 0.008 + i) * 2; c.save(); c.translate(x, y + b); G.ell(c, 0, -20, 16, 22); G.fillO(c, '#2f3f5a', 2.5); G.ell(c, 0, -16, 10, 16); c.fillStyle = '#ffffff'; c.fill(); c.fillStyle = '#2a1f35'; G.circ(c, -4, -30, 2); c.fill(); G.circ(c, 4, -30, 2); c.fill(); G.poly(c, [-3, -26, 3, -26, 0, -21]); c.fillStyle = '#ffb04a'; c.fill(); c.restore(); }
    } };
  F.giraffe = { w: 200, h: 380, tags: ['animal', 'giraffe'], slots: [[-130, 20], [130, 20]],
    draw(c, t, f) {
      const stretch = f.eat && t < f.eat ? Math.sin((1 - (f.eat - t) / 1800) * Math.PI) * 40 : 0;
      for (const x of [-40, -16, 20, 44]) { G.rr(c, x - 8, -110, 16, 110, 6); G.fillO(c, '#f5c242', 2.5); }
      G.ell(c, 0, -130, 70, 40); G.fillO(c, '#f5c242', 3);
      c.save(); c.translate(44, -150); c.rotate(-0.25); G.rr(c, -14, -200 - stretch, 28, 210 + stretch, 12); G.fillO(c, '#f5c242', 3);
      c.fillStyle = '#c98a2a'; for (let y = -180; y < 0; y += 40) { G.ell(c, -2, y - stretch * (1 + y / 200), 8, 10); c.fill(); }
      c.translate(0, -210 - stretch); G.ell(c, 14, 0, 34, 20); G.fillO(c, '#f5c242', 3); G.ell(c, 36, 6, 14, 10); c.fillStyle = '#f0d9a0'; c.fill();
      for (const x of [-6, 10]) { c.strokeStyle = '#c98a2a'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, -16); c.lineTo(x, -34); c.stroke(); G.circ(c, x, -36, 5); c.fillStyle = '#c98a2a'; c.fill(); }
      c.fillStyle = '#2a1f35'; G.circ(c, 18, -4, 3.4); c.fill();
      c.restore();
      c.fillStyle = '#c98a2a'; for (const [x, y] of [[-30, -140], [0, -120], [24, -146], [-50, -118]]) { G.ell(c, x, y, 10, 8); c.fill(); }
    } };
  F.elephantF = { w: 280, h: 230, tags: ['animal', 'elephant', 'water'], slots: [[-180, 20], [180, 20]],
    draw(c, t, f) {
      for (const x of [-80, -40, 30, 70]) { G.rr(c, x - 16, -70, 32, 70, 10); G.fillO(c, '#9fb3c8', 2.5); }
      G.ell(c, -10, -110, 110, 66); G.fillO(c, '#a9bccf', 3);
      G.circ(c, 90, -150, 50); G.fillO(c, '#a9bccf', 3);
      G.ell(c, 60, -150, 34, 44); G.fillO(c, '#c7d4e2', 3);
      const up = f.spray && t < f.spray ? 1 : 0;
      c.strokeStyle = '#a9bccf'; c.lineWidth = 24; c.lineCap = 'round'; c.beginPath(); c.moveTo(130, -140); c.quadraticCurveTo(160, up ? -200 : -90, up ? 150 : 140, up ? -250 : -40); c.stroke();
      c.strokeStyle = PT.line('#a9bccf'); c.lineWidth = 3; c.stroke();
      c.fillStyle = '#2a1f35'; G.circ(c, 104, -164, 5); c.fill();
      if (up) { c.fillStyle = 'rgba(160,220,255,.85)'; for (let i = 0; i < 14; i++) { const k = ((t * 0.002 + i * 0.07) % 1); G.circ(c, 150 - 80 * k + i * 4, -250 - Math.sin(k * Math.PI) * 120 + k * 60, 6); c.fill(); } }
    } };
  F.monkeytree = { w: 260, h: 380, tags: ['tree', 'monkey', 'animal'], slots: [[-140, 20], [140, 20]],
    draw(c, t, f) {
      G.rr(c, -18, -260, 36, 260, 12); G.fillO(c, '#a8733f', 3);
      [[-70, -300, 70], [60, -300, 70], [0, -350, 76]].forEach(([x, y, r]) => { G.circ(c, x, y, r); G.fillO(c, '#5cbf5a', 3); });
      const sw = f.swing && t < f.swing ? Math.sin(t * 0.012) * 0.6 : Math.sin(t * 0.003) * 0.15;
      c.save(); c.translate(70, -250); c.rotate(sw); c.strokeStyle = '#5c9e3e'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 90); c.stroke();
      c.translate(0, 110); G.circ(c, 0, 0, 22); G.fillO(c, '#a8733f', 2.5); G.ell(c, 0, 4, 14, 11); c.fillStyle = '#f0d0a0'; c.fill(); for (const s of [-1, 1]) { G.circ(c, s * 22, -4, 8); G.fillO(c, '#a8733f', 2); } c.fillStyle = '#2a1f35'; G.circ(c, -5, -2, 2.6); c.fill(); G.circ(c, 5, -2, 2.6); c.fill();
      c.restore();
      G.ell(c, -40, -230, 10, 18, 0.6); c.fillStyle = '#ffd23f'; c.fill(); G.ell(c, -24, -236, 10, 18, 0.3); c.fill();
    } };
  F.barn = { w: 360, h: 330, tags: ['barn', 'house', 'farm'], slots: [[-220, 20], [220, 20], [0, 60]],
    draw(c, t, f) {
      G.rr(c, -170, -220, 340, 220, 6); G.fillO(c, '#e0514a', 4);
      c.beginPath(); c.moveTo(-190, -210); c.lineTo(-120, -310); c.lineTo(120, -310); c.lineTo(190, -210); c.closePath(); G._bb = { x0: -190, y0: -310, x1: 190, y1: -210 }; G.fillO(c, '#8a5a3a', 4);
      c.strokeStyle = '#ffffff'; c.lineWidth = 8; G.rr(c, -80, -150, 160, 150, 4); c.stroke();
      const open = f.open && t < f.open;
      c.fillStyle = open ? '#4a2a1a' : '#c9443e'; c.fillRect(-76, -146, 152, 146);
      if (!open) { c.beginPath(); c.moveTo(-76, -146); c.lineTo(76, 0); c.moveTo(76, -146); c.lineTo(-76, 0); c.stroke(); }
      G.circ(c, 0, -250, 26); G.fillO(c, '#ffffff', 3); c.fillStyle = '#8a5a3a'; G.circ(c, 0, -250, 14); c.fill();
    } };
  F.cowF = { w: 230, h: 170, tags: ['animal', 'cow', 'farm'], slots: [[-150, 20], [150, 20]],
    draw(c, t, f) {
      for (const x of [-70, -40, 40, 70]) { G.rr(c, x - 10, -60, 20, 60, 6); G.fillO(c, '#ffffff', 2.5); }
      G.ell(c, 0, -90, 100, 46); G.fillO(c, '#ffffff', 3);
      c.fillStyle = '#3a3550'; for (const [x, y, rx, ry] of [[-40, -100, 26, 18], [30, -80, 22, 16], [60, -110, 14, 10]]) { G.ell(c, x, y, rx, ry); c.fill(); }
      const nod = f.moo && t < f.moo ? Math.sin(t * 0.02) * 0.15 : 0;
      c.save(); c.translate(-100, -110); c.rotate(nod); G.ell(c, -20, 0, 34, 30); G.fillO(c, '#ffffff', 3); G.ell(c, -34, 16, 24, 16); G.fillO(c, '#ffc4d6', 2.5); c.fillStyle = '#2a1f35'; G.circ(c, -10, -8, 4); c.fill(); for (const s of [-1, 1]) { G.ell(c, -20 + s * 30, -24, 12, 6, s * 0.4); G.fillO(c, '#ffffff', 2); } c.restore();
      c.strokeStyle = '#3a3550'; c.lineWidth = 4; c.beginPath(); c.moveTo(96, -100); c.quadraticCurveTo(120, -60 + Math.sin(t * 0.006) * 10, 110, -40); c.stroke();
      G.circ(c, -90, -70, 9); G.fillO(c, '#ffd23f', 2);
    } };
  F.henhouse = { w: 200, h: 200, tags: ['chicken', 'farm', 'animal'], slots: [[-130, 20], [130, 20]],
    draw(c, t, f) {
      G.rr(c, -80, -130, 160, 120, 6); G.fillO(c, '#f2c38a', 3);
      c.beginPath(); c.moveTo(-96, -124); c.lineTo(0, -196); c.lineTo(96, -124); c.closePath(); G._bb = { x0: -96, y0: -196, x1: 96, y1: -124 }; G.fillO(c, '#58b9f0', 3);
      G.rr(c, -30, -90, 60, 60, 26); c.fillStyle = '#5a3a2a'; c.fill();
      for (const x of [-60, 60]) { G.rr(c, x - 6, -10, 12, 12, 2); G.fillO(c, '#a8733f', 2); }
      const b = Math.abs(Math.sin(t * 0.008)) * 6; c.save(); c.translate(0, -60 - b); G.ell(c, 0, 0, 18, 15); G.fillO(c, '#ffffff', 2.5); G.circ(c, 12, -12, 9); G.fillO(c, '#ffffff', 2); G.poly(c, [20, -12, 28, -10, 20, -7]); c.fillStyle = '#ffb04a'; c.fill(); G.ell(c, 12, -22, 4, 5); c.fillStyle = '#ff5d5d'; c.fill(); c.fillStyle = '#2a1f35'; G.circ(c, 14, -14, 1.8); c.fill(); c.restore();
    } };
  F.oven = { w: 240, h: 260, tags: ['oven', 'kitchen', 'bake'], slots: [[-150, 20], [150, 20]],
    draw(c, t, f) {
      G.rr(c, -110, -250, 220, 250, 20); G.fillO(c, '#e9b47a', 4);
      c.beginPath(); c.moveTo(-110, -150); c.quadraticCurveTo(-110, -290, 0, -290); c.quadraticCurveTo(110, -290, 110, -150); G._bb = null; c.fillStyle = '#d99a5b'; c.fill();
      G.rr(c, -70, -170, 140, 110, 50); c.fillStyle = '#3a2a2a'; c.fill();
      const on = f.bake && t < f.bake;
      if (on) { for (let i = 0; i < 5; i++) { G.ell(c, -40 + i * 20, -80 - Math.abs(Math.sin(t * 0.02 + i)) * 20, 8, 16); c.fillStyle = ['#ff6f3d', '#ffd23f'][i % 2]; c.fill(); } }
      else { G.ell(c, 0, -80, 40, 10); c.fillStyle = '#5a3a2a'; c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.4)'; for (let x = -90; x < 100; x += 30) for (let y = -230; y < -20; y += 22) if (Math.abs(x) > 72 || y < -176 || y > -56) { G.rr(c, x, y + ((x / 30) % 2) * 11, 24, 10, 3); c.fill(); }
    } };
  F.showcase = { w: 380, h: 200, tags: ['shop', 'cake', 'counter', 'surface'], slots: [[0, 60], [-230, 20], [230, 20]],
    draw(c, t, f) {
      G.rr(c, -190, -110, 380, 110, 10); G.fillO(c, '#ffd1e0', 4);
      G.rr(c, -180, -200, 360, 96, 12); c.fillStyle = 'rgba(220,240,255,.7)'; c.fill(); c.strokeStyle = '#9fc8f0'; c.lineWidth = 3; c.stroke();
      [['#fff4e8', '#ff5d78'], ['#7a4a2e', '#ffffff'], ['#ffe9a8', '#58c46b'], ['#ffb3c8', '#ffd23f']].forEach(([a, b], i) => { const x = -140 + i * 92; G.rr(c, x - 28, -152, 56, 40, 8); G.fillO(c, a, 2.5); c.fillStyle = '#fffaf2'; G.rr(c, x - 30, -160, 60, 12, 6); c.fill(); G.circ(c, x, -166, 7); c.fillStyle = b; c.fill(); });
      c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.moveTo(-160, -196); c.lineTo(-120, -196); c.lineTo(-150, -112); c.lineTo(-190, -112); c.closePath(); c.fill();
      for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-160 + i * 64, -110, 32, 0, Math.PI); c.fillStyle = i % 2 ? '#ffffff' : '#ff9fbd'; c.fill(); }
    } };
  F.throneF = { w: 220, h: 300, tags: ['throne', 'seat', 'royal'], slots: [[0, -60]],
    draw(c, t) {
      c.beginPath(); c.moveTo(-80, -120); c.lineTo(-90, -270); c.quadraticCurveTo(0, -320, 90, -270); c.lineTo(80, -120); c.closePath(); G._bb = { x0: -90, y0: -320, x1: 90, y1: -120 }; G.fillO(c, '#f5c242', 4);
      G.rr(c, -64, -260, 128, 140, 40); G.fillO(c, '#c0304a', 3);
      G.heart(c, 0, -200, 24); c.fillStyle = '#ffd23f'; c.fill();
      G.rr(c, -100, -130, 200, 50, 16); G.fillO(c, '#c0304a', 3);
      for (const x of [-100, 76]) { G.rr(c, x, -150, 24, 150, 8); G.fillO(c, '#f5c242', 3); G.circ(c, x + 12, -156, 14); G.fillO(c, '#ffd84a', 2.5); }
      c.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(t * 0.005)})`; G.star(c, 50, -290, 8, 3); c.fill();
    } };
  F.chandelierF = { w: 300, h: 200, sky: true, tags: ['chandelier', 'light', 'royal'], slots: [],
    draw(c, t, f) {
      c.strokeStyle = '#c9a032'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -200); c.lineTo(0, -120); c.stroke();
      c.beginPath(); c.ellipse(0, -90, 130, 30, 0, 0, Math.PI); c.strokeStyle = '#f5c242'; c.lineWidth = 8; c.stroke();
      G.ell(c, 0, -110, 50, 22); G.fillO(c, '#f5c242', 3);
      for (let i = 0; i < 7; i++) { const x = -120 + i * 40, y = -90 + Math.sin((i / 6) * Math.PI) * 30; G.rr(c, x - 6, y - 30, 12, 26, 3); G.fillO(c, '#fff8e8', 2); const fl = 0.8 + Math.sin(t * 0.01 + i) * 0.2; G.ell(c, x, y - 38, 5 * fl, 9 * fl); c.fillStyle = '#ffd23f'; c.fill(); G.circ(c, x, y + 16, 5); c.fillStyle = 'rgba(200,230,255,.9)'; c.fill(); }
      if (f.shine && t < f.shine) { c.fillStyle = `rgba(255,240,160,${0.3 * Math.sin((f.shine - t) / 1500 * Math.PI)})`; G.circ(c, 0, -60, 260); c.fill(); }
    } };
  F.waterslide = { w: 380, h: 360, tags: ['slide', 'water'], slots: [[-170, -330], [190, 20]],
    draw(c) {
      for (const x of [-170, -120]) { G.rr(c, x - 6, -320, 12, 320, 4); G.fillO(c, '#ffd23f', 2.5); }
      for (let y = -300; y < 0; y += 50) { G.rr(c, -176, y, 62, 8, 3); G.fillO(c, '#ffd23f', 2); }
      c.beginPath(); c.moveTo(-120, -320); c.bezierCurveTo(40, -320, -20, -100, 150, -40); c.lineTo(190, -40); c.bezierCurveTo(20, -100, 80, -360, -110, -350); c.closePath(); G._bb = { x0: -120, y0: -350, x1: 190, y1: -40 }; G.fillO(c, '#58b9f0', 3);
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-100, -332); c.bezierCurveTo(40, -330, 0, -110, 160, -50); c.stroke();
      G.ell(c, 180, -26, 60, 18); c.fillStyle = 'rgba(160,220,255,.9)'; c.fill();
    } };
  F.poolF = { w: 640, h: 170, area: 'water', tags: ['water', 'pool', 'swim'], slots: [[-360, 0], [360, 0]],
    draw(c, t) {
      G.rr(c, -320, -150, 640, 150, 30); G.fillO(c, '#ffffff', 4);
      G.rr(c, -300, -134, 600, 118, 22); c.fillStyle = G.grad(c, 0, -134, 0, -16, [[0, '#7fd8ff'], [1, '#3fa7e8']]); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; for (let i = 0; i < 8; i++) { const x = -260 + i * 70; c.beginPath(); c.moveTo(x, -90); c.quadraticCurveTo(x + 16, -96 + Math.sin(t * 0.004 + i) * 4, x + 32, -90); c.stroke(); }
      c.strokeStyle = '#ff6f91'; c.lineWidth = 6; c.setLineDash([16, 12]); c.beginPath(); c.moveTo(-300, -76); c.lineTo(300, -76); c.stroke(); c.setLineDash([]);
    } };
  F.firetruckF = { w: 460, h: 230, tags: ['car', 'firetruck', 'vehicle'], slots: [[-280, 20], [280, 20]],
    draw(c, t, f) {
      G.rr(c, -220, -170, 440, 130, 18); G.fillO(c, '#e2433b', 4);
      G.rr(c, 100, -210, 120, 80, 14); G.fillO(c, '#e2433b', 3); G.rr(c, 120, -196, 80, 40, 8); c.fillStyle = '#bfe6ff'; c.fill();
      c.strokeStyle = '#d9d9e6'; c.lineWidth = 8; c.beginPath(); c.moveTo(-200, -190); c.lineTo(80, -230); c.stroke(); c.lineWidth = 3; for (let i = 0; i < 9; i++) { const x = -190 + i * 30; c.beginPath(); c.moveTo(x, -192 - i * 4.3); c.lineTo(x, -180 - i * 4.3); c.stroke(); }
      const on = f.siren && t < f.siren && Math.floor(t / 200) % 2; G.rr(c, 140, -228, 40, 16, 6); c.fillStyle = on ? '#ffd23f' : '#ff9a3d'; c.fill();
      if (on) { c.fillStyle = 'rgba(255,230,120,.35)'; G.circ(c, 160, -220, 50); c.fill(); }
      c.fillStyle = '#ffffff'; c.fillRect(-200, -110, 280, 12);
      for (const x of [-140, 140]) { G.circ(c, x, -36, 36); G.fillO(c, '#3a3550', 3); G.circ(c, x, -36, 14); c.fillStyle = '#c9ccd8'; c.fill(); }
      G.circ(c, -30, -140, 18); c.fillStyle = '#ffd23f'; c.fill(); c.fillStyle = '#e2433b'; G.star(c, -30, -140, 12, 5); c.fill();
    } };
  F.firepole = { w: 120, h: 420, tags: ['pole', 'slide'], slots: [[0, 20]],
    draw(c) {
      G.rr(c, -60, -420, 120, 30, 6); G.fillO(c, '#c9443e', 3); c.fillStyle = '#3a3550'; G.ell(c, 0, -394, 40, 8); c.fill();
      G.rr(c, -6, -400, 12, 400, 6); c.fillStyle = G.grad(c, -6, 0, 6, 0, [[0, '#ffe9a0'], [0.5, '#f5c242'], [1, '#c99a22']]); c.fill(); c.strokeStyle = '#a88a22'; c.lineWidth = 2; c.stroke();
      G.ell(c, 0, -4, 50, 12); G.fillO(c, '#58b9f0', 3);
    } };
  F.hydrant = { w: 90, h: 120, tags: ['water', 'hydrant'], slots: [[-80, 10], [80, 10]],
    draw(c, t, f) {
      G.rr(c, -26, -96, 52, 92, 12); G.fillO(c, '#e2433b', 3); G.ell(c, 0, -100, 30, 14); G.fillO(c, '#e2433b', 3); G.circ(c, 0, -112, 8); G.fillO(c, '#c9332d', 2);
      for (const s of [-1, 1]) { G.rr(c, s * 26 - (s < 0 ? 16 : 0), -70, 16, 18, 5); G.fillO(c, '#c9332d', 2); }
      G.rr(c, -32, -12, 64, 12, 4); G.fillO(c, '#c9332d', 2);
      if (f.spray && t < f.spray) { c.fillStyle = 'rgba(160,220,255,.85)'; for (let i = 0; i < 16; i++) { const k = ((t * 0.0025 + i * 0.06) % 1); G.circ(c, 40 + k * 260, -62 - Math.sin(k * Math.PI) * 120, 5 + k * 3); c.fill(); } }
    } };
  F.windmill = { w: 260, h: 420, tags: ['windmill'], slots: [[-160, 20], [160, 20]],
    draw(c, t, f) {
      c.beginPath(); c.moveTo(-70, 0); c.lineTo(-44, -280); c.lineTo(44, -280); c.lineTo(70, 0); c.closePath(); G._bb = { x0: -70, y0: -280, x1: 70, y1: 0 }; G.fillO(c, '#fff4e4', 4);
      c.beginPath(); c.moveTo(-58, -276); c.lineTo(0, -340); c.lineTo(58, -276); c.closePath(); G._bb = { x0: -58, y0: -340, x1: 58, y1: -276 }; G.fillO(c, '#ef5f55', 3);
      G.rr(c, -22, -70, 44, 70, 20); c.fillStyle = '#8a5a3a'; c.fill(); G.circ(c, 0, -190, 18); c.fillStyle = '#bfe6ff'; c.fill();
      const sp = f.spin && t < f.spin ? 0.008 : 0.0015;
      c.save(); c.translate(0, -282); c.rotate(t * sp);
      for (let i = 0; i < 4; i++) { c.save(); c.rotate((i * Math.PI) / 2); G.rr(c, -14, -170, 28, 150, 4); G.fillO(c, '#ffffff', 2.5); c.strokeStyle = '#d6c4a8'; c.lineWidth = 2; for (let y = -160; y < -30; y += 20) { c.beginPath(); c.moveTo(-14, y); c.lineTo(14, y); c.stroke(); } c.restore(); }
      G.circ(c, 0, 0, 14); G.fillO(c, '#8a5a3a', 2.5); c.restore();
    } };
  F.beehive = { w: 110, h: 220, tags: ['bee', 'tree'], slots: [[-90, 10], [90, 10]],
    draw(c, t, f) {
      G.rr(c, -10, -200, 20, 200, 6); G.fillO(c, '#a8733f', 2.5); c.strokeStyle = '#a8733f'; c.lineWidth = 8; c.beginPath(); c.moveTo(0, -180); c.lineTo(50, -200); c.stroke();
      c.save(); c.translate(46, -150); for (let i = 0; i < 4; i++) { G.ell(c, 0, -20 + i * 14, 28 - Math.abs(i - 1.5) * 5, 9); G.fillO(c, '#ffc93c', 2.5); } G.circ(c, 0, 14, 5); c.fillStyle = '#5a3a2a'; c.fill(); c.restore();
      const n = f.buzz && t < f.buzz ? 7 : 2;
      for (let i = 0; i < n; i++) { const a = t * 0.004 * (1 + i * 0.2) + i; const x = 46 + Math.cos(a) * (40 + i * 12), y = -150 + Math.sin(a * 1.3) * (30 + i * 8); c.save(); c.translate(x, y); G.ell(c, 0, 0, 8, 6); c.fillStyle = '#ffd23f'; c.fill(); c.fillStyle = '#3a3550'; c.fillRect(-2, -6, 3, 12); c.fillStyle = 'rgba(255,255,255,.8)'; G.ell(c, -2, -8, 5, 4); c.fill(); c.restore(); }
    } };
  F.flowerarch = { w: 300, h: 340, tags: ['arch', 'flower'], slots: [[0, 20]],
    draw(c, t) {
      c.strokeStyle = '#ffffff'; c.lineWidth = 14; c.beginPath(); c.moveTo(-120, 0); c.lineTo(-120, -200); c.arc(0, -200, 120, Math.PI, 0); c.lineTo(120, 0); c.stroke();
      c.strokeStyle = '#d6c4a8'; c.lineWidth = 2; c.stroke();
      for (let i = 0; i <= 18; i++) { const a = Math.PI + (i / 18) * Math.PI; const x = Math.cos(a) * 120, y = -200 + Math.sin(a) * 120; G.circ(c, x, y, 13); G.fillO(c, ['#ff8fab', '#ffd23f', '#ffffff', '#c9b2ff'][i % 4], 2); }
      for (const s of [-1, 1]) for (let y = -180; y < 0; y += 34) { G.circ(c, s * 120, y, 11); G.fillO(c, ['#ff8fab', '#7bd36a'][(y / 34) & 1], 2); }
    } };
  F.coral = { w: 260, h: 230, tags: ['coral', 'sea'], slots: [[-160, 20], [160, 20]],
    draw(c, t) {
      [['#ff7a9a', -60, 1], ['#ffb04a', 20, 0.8], ['#c38be0', 80, 0.9]].forEach(([col, x, s]) => { c.strokeStyle = col; c.lineWidth = 16 * s; c.lineCap = 'round'; const sw = Math.sin(t * 0.002 + x) * 6; c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x - 10, -100 * s, x - 40 * s + sw, -180 * s); c.moveTo(x - 6, -80 * s); c.quadraticCurveTo(x + 30 * s, -120 * s, x + 40 * s + sw, -170 * s); c.stroke(); });
      G.ell(c, 0, -6, 130, 18); c.fillStyle = '#f3d58f'; c.fill();
    } };
  F.treasure = { w: 200, h: 160, tags: ['treasure', 'chest', 'sea'], slots: [[-140, 20], [140, 20]],
    draw(c, t, f) {
      const open = f.open && t < f.open;
      G.rr(c, -90, -90, 180, 90, 10); G.fillO(c, '#a8733f', 3); c.fillStyle = '#f5c242'; c.fillRect(-90, -60, 180, 10); c.fillRect(-10, -90, 20, 90);
      if (open) { c.fillStyle = 'rgba(255,230,120,.5)'; G.circ(c, 0, -110, 90); c.fill(); for (let i = 0; i < 8; i++) { G.circ(c, -60 + i * 17, -96 - (i % 3) * 6, 9); G.fillO(c, i % 3 ? '#f5c242' : '#7fd0ff', 2); } c.save(); c.translate(-90, -90); c.rotate(-1.2); G.rr(c, 0, -50, 180, 50, 14); G.fillO(c, '#a8733f', 3); c.restore(); }
      else { c.beginPath(); c.moveTo(-90, -90); c.quadraticCurveTo(0, -150, 90, -90); c.closePath(); G._bb = { x0: -90, y0: -130, x1: 90, y1: -90 }; G.fillO(c, '#b9824a', 3); G.rr(c, -12, -102, 24, 24, 4); G.fillO(c, '#f5c242', 2); }
    } };
  F.clam = { w: 170, h: 120, tags: ['clam', 'sea', 'pearl'], slots: [[-120, 10], [120, 10]],
    draw(c, t, f) {
      const open = f.open && t < f.open ? 0.7 : 0.15 + Math.abs(Math.sin(t * 0.0015)) * 0.08;
      G.ell(c, 0, -20, 80, 26); G.fillO(c, '#ffb3c8', 3);
      if (open > 0.3) { G.circ(c, 0, -34, 18); c.fillStyle = G.rgrad(c, -6, -40, 1, 20, [[0, '#ffffff'], [1, '#d9e2ff']]); c.fill(); }
      c.save(); c.translate(0, -26); c.rotate(-open); c.beginPath(); c.moveTo(-80, 0); c.quadraticCurveTo(-60, -80, 0, -84); c.quadraticCurveTo(60, -80, 80, 0); c.closePath(); G._bb = { x0: -80, y0: -84, x1: 80, y1: 0 }; G.fillO(c, '#ff9fbd', 3); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; for (const a of [-0.5, 0, 0.5]) { c.beginPath(); c.moveTo(0, -4); c.lineTo(Math.sin(a) * 70, -Math.cos(a) * 70); c.stroke(); } c.restore();
    } };
  F.rainbowslide = { w: 480, h: 330, tags: ['slide', 'rainbow'], slots: [[-230, -300], [240, 20]],
    draw(c, t) {
      ['#ff6f7a', '#ffa64d', '#ffe066', '#7bd36a', '#58b9f0', '#9b8cff'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 16; c.beginPath(); c.moveTo(-220, -300 + i * 14); c.bezierCurveTo(-40, -300 + i * 14, 0, -40 + i * 6, 230, -20 + i * 4); c.stroke(); });
      for (let i = 0; i < 5; i++) { B.cloud(c, -260 + i * 20 - 40, -300 + (i % 2) * 10, 0.5); }
      B.cloud(c, 190, -10, 0.6);
    } };
  F.cloudbed = { w: 280, h: 140, tags: ['bed', 'cloud', 'soft', 'seat'], slots: [[0, -60]],
    draw(c, t) {
      B.cloud(c, -110, -50, 1.3); B.cloud(c, -10, -60, 1.1);
      G.rr(c, -120, -50, 240, 40, 20); c.fillStyle = '#ffffff'; c.fill();
      G.ell(c, -80, -86, 40, 18); c.fillStyle = '#ffe9f2'; c.fill(); c.strokeStyle = '#ffc4d6'; c.lineWidth = 2; c.stroke();
      c.fillStyle = `rgba(255,236,120,${0.6 + 0.4 * Math.sin(t * 0.004)})`; G.star(c, 100, -110, 10, 4); c.fill();
    } };
  F.starfountain = { w: 240, h: 260, tags: ['fountain', 'star', 'magic'], slots: [[-150, 10], [150, 10]],
    draw(c, t, f) {
      G.ell(c, 0, -30, 110, 32); G.fillO(c, '#d9c9ff', 3); G.ell(c, 0, -34, 92, 22); c.fillStyle = '#bfe6ff'; c.fill();
      G.rr(c, -14, -170, 28, 140, 10); G.fillO(c, '#e9e0ff', 3); G.ell(c, 0, -170, 50, 14); G.fillO(c, '#d9c9ff', 3);
      const hi = f.burst && t < f.burst ? 2 : 1;
      for (let i = 0; i < 10 * hi; i++) { const k = ((t * 0.0012 + i * (0.1 / hi)) % 1); const a = (i / (10 * hi)) * PT.TAU; c.fillStyle = `rgba(255,236,120,${1 - k})`; G.star(c, Math.cos(a) * k * 90 * hi, -180 - Math.sin(k * Math.PI) * 80 * hi + k * 140, 7, 3); c.fill(); }
    } };
  F.dinoskel = { w: 520, h: 330, tags: ['dino', 'bones', 'museum'], slots: [[-300, 20], [300, 20]],
    draw(c, t, f) {
      const dance = f.dance && t < f.dance ? Math.sin(t * 0.015) * 0.12 : 0;
      G.rr(c, -230, -20, 460, 20, 6); G.fillO(c, '#8a7a6a', 3);
      c.strokeStyle = '#fff8e8'; c.lineWidth = 10; c.lineCap = 'round';
      for (const x of [-90, -50, 70, 110]) { c.beginPath(); c.moveTo(x, -20); c.lineTo(x + 10, -130); c.stroke(); }
      c.save(); c.translate(0, -150); c.rotate(dance);
      c.beginPath(); c.moveTo(-230, 30); c.quadraticCurveTo(-120, -10, 0, 0); c.quadraticCurveTo(120, 10, 160, -90); c.stroke();
      for (let i = 0; i < 6; i++) { const x = -60 + i * 26; c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + 4, 40, x - 4, 60); c.stroke(); }
      c.save(); c.translate(170, -110); c.rotate(-dance * 2); G.rr(c, -20, -30, 90, 50, 18); G.fillO(c, '#fff8e8', 3); G.circ(c, 20, -12, 8); c.fillStyle = '#3a3550'; c.fill(); c.strokeStyle = '#3a3550'; c.lineWidth = 3; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(30 + i * 8, 14); c.lineTo(32 + i * 8, 4); c.stroke(); } c.restore();
      c.restore();
      G.rr(c, -60, -10, 120, 26, 6); G.fillO(c, '#fff4e4', 2); c.fillStyle = '#5a4a3a'; c.font = `900 16px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('ティラノ', 0, 9);
    } };
  F.digbox = { w: 300, h: 110, area: 'sand', tags: ['sand', 'dig', 'museum'], slots: [[-190, 0], [190, 0]],
    draw(c) {
      G.rr(c, -150, -70, 300, 70, 10); G.fillO(c, '#c99a64', 4); G.rr(c, -136, -60, 272, 50, 8); c.fillStyle = '#f2d8a0'; c.fill();
      c.fillStyle = 'rgba(160,120,70,.4)'; for (let i = 0; i < 20; i++) { G.circ(c, -120 + ((i * 47) % 240), -50 + ((i * 29) % 36), 3); c.fill(); }
      c.strokeStyle = '#fff8e8'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(40, -40); c.lineTo(80, -30); c.stroke();
    } };
  F.gemcase = { w: 200, h: 220, tags: ['gem', 'museum', 'shiny'], slots: [[-130, 10], [130, 10]],
    draw(c, t) {
      G.rr(c, -60, -110, 120, 110, 8); G.fillO(c, '#8a5a3a', 3);
      G.rr(c, -70, -210, 140, 104, 12); c.fillStyle = 'rgba(220,240,255,.6)'; c.fill(); c.strokeStyle = '#9fc8f0'; c.lineWidth = 3; c.stroke();
      G.poly(c, [0, -190, 30, -160, 0, -120, -30, -160]); G.fillO(c, '#b39ae8', 3); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.moveTo(0, -190); c.lineTo(-12, -160); c.lineTo(-30, -160); c.closePath(); c.fill();
      c.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(t * 0.006)})`; G.star(c, 26, -186, 8, 3); c.fill();
    } };

  /* ================= ステージ ================= */
  const fallSnow = (c, t) => { c.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 60; i++) { const x = ((i * 137 + t * 0.02 * (1 + (i % 3) * 0.3)) % (W + 40)) - 20, y = ((i * 89 + t * 0.05 * (1 + (i % 4) * 0.2)) % (H + 20)) - 10; PT.G.circ(c, x + Math.sin(t * 0.002 + i) * 10, y, 2 + (i % 3)); c.fill(); } };
  const bubblesUp = (c, t) => { c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; for (let i = 0; i < 26; i++) { const x = (i * 211) % W + Math.sin(t * 0.002 + i) * 14, y = H - ((t * 0.04 * (1 + (i % 3) * 0.3) + i * 97) % (H + 40)); PT.G.circ(c, x, y, 4 + (i % 4) * 2); c.stroke(); } };
  const S = (o) => PT.STAGES.push(o);
  S({ id: 'snow', num: 13, name: 'ゆきの ひろば', bgm: 'title', floor: [580, 880], color: '#7fb6ef',
    tools: ['blanket', 'teddy', 'bunny', 'flashlight', 'juice', 'cookie', 'cake', 'onigiri', 'ball', 'bag', 'box', 'chair', 'snowman', 'snow'],
    rides: ['tricycle', 'car', 'trampoline', 'tent'],
    spawn: [['penta', 640, 760], ['lulu', 860, 720], ['pyoko', 1040, 790], ['yuto', 460, 800], ['baba', 1240, 780]],
    fixtures: [['snowmanF', 300, 690], ['igloo', 1250, 660], ['sledhill', 760, 610]],
    favs: ['snowman', 'snow', 'santa', 'blanket', 'juice'],
    ambient: fallSnow,
    bg(c, r) {
      B.sky(c, '#a9d4ff', '#f4f9ff', 580);
      c.fillStyle = '#dfeaf8'; for (let i = -1; i < 5; i++) { const x = i * 380 + 120; c.beginPath(); c.moveTo(x - 260, 580); c.lineTo(x, 260 + (i % 2) * 60); c.lineTo(x + 260, 580); c.fill(); }
      c.fillStyle = '#ffffff'; for (let i = -1; i < 5; i++) { const x = i * 380 + 120, top = 260 + (i % 2) * 60; c.beginPath(); c.moveTo(x - 70, top + 75); c.lineTo(x, top); c.lineTo(x + 70, top + 75); c.lineTo(x + 30, top + 60); c.lineTo(x, top + 80); c.lineTo(x - 30, top + 60); c.fill(); }
      for (let i = 0; i < 9; i++) { const x = 60 + i * 190 + r() * 40; B.pine(c, x, 590, 0.9 + r() * 0.4, '#4f8a74'); c.fillStyle = '#ffffff'; for (let k = 0; k < 3; k++) { G.ell(c, x, 590 - (40 + k * 44) * 1.0, 30 - k * 8, 7); c.fill(); } }
      c.fillStyle = G.grad(c, 0, 570, 0, H, [[0, '#ffffff'], [1, '#e3eefb']]); c.fillRect(0, 570, W, H - 570);
      c.fillStyle = 'rgba(160,190,230,.35)'; for (let i = 0; i < 30; i++) { G.ell(c, r() * W, 620 + r() * 260, 30 + r() * 40, 6); c.fill(); }
    } });
  S({ id: 'aqua', num: 14, name: 'キラキラ すいぞくかん', bgm: 'beach', floor: [600, 880], color: '#29b6f6',
    tools: ['duck', 'shell', 'bucket', 'camera', 'juice', 'icecream', 'teddy', 'bag', 'book', 'magnifier'],
    rides: ['swimring', 'boat', 'pool'],
    spawn: [['lulu', 620, 780], ['mimi', 880, 760], ['penta', 1080, 800], ['sakura', 420, 800], ['futan', 1260, 820]],
    fixtures: [['bigtank', 520, 580], ['dolphinpool', 1240, 830], ['penguinrock', 1350, 620]],
    favs: ['camera', 'shell', 'duck', 'swimring', 'magnifier'],
    ambient: bubblesUp,
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 600, [[0, '#123a7a'], [1, '#2f7fc8']]); c.fillRect(0, 0, W, 600);
      c.fillStyle = 'rgba(160,220,255,.12)'; for (let i = 0; i < 6; i++) { c.save(); c.translate(100 + i * 280, 0); c.rotate(0.2); c.fillRect(0, -40, 60, 680); c.restore(); }
      for (let i = 0; i < 6; i++) { const x = 80 + i * 260, y = 120 + (i % 2) * 120; c.save(); c.translate(x, y); c.fillStyle = 'rgba(200,240,255,.35)'; G.ell(c, 0, 0, 60, 24); c.fill(); G.poly(c, [56, 0, 90, -24, 90, 24]); c.fill(); c.restore(); }
      c.save(); c.translate(1100, 180); c.fillStyle = 'rgba(120,180,240,.4)'; G.ell(c, 0, 0, 170, 50); c.fill(); G.poly(c, [160, 0, 230, -40, 230, 40]); c.fill(); c.restore();
      B.floorWood(c, 600, '#2a5a9a');
      c.fillStyle = 'rgba(160,220,255,.25)'; for (let i = 0; i < 12; i++) { G.ell(c, r() * W, 650 + r() * 220, 60, 10); c.fill(); }
    } });
  S({ id: 'zoo', num: 15, name: 'わいわい どうぶつえん', bgm: 'park', floor: [590, 880], color: '#8bc34a',
    tools: ['banana', 'apple', 'carrot', 'watermelon', 'camera', 'bag', 'juice', 'icecream', 'ball', 'teddy', 'panda', 'elephant', 'penguin'],
    rides: ['bus', 'tricycle', 'horse', 'train'],
    spawn: [['moko', 640, 780], ['pon', 880, 760], ['nyan', 1060, 800], ['yuto', 460, 800], ['papa', 1240, 820], ['ricky', 980, 840]],
    fixtures: [['giraffe', 300, 640], ['elephantF', 820, 640], ['monkeytree', 1360, 640]],
    favs: ['banana', 'carrot', 'camera', 'panda', 'elephant'],
    bg(c, r) {
      B.sky(c, '#8fd3ff', '#eaf8ff', 560);
      B.cloud(c, 200, 100, 1); B.cloud(c, 1100, 80, 0.9);
      c.fillStyle = '#b5e3a2'; G.ell(c, 400, 560, 560, 140); c.fill(); G.ell(c, 1250, 570, 600, 160); c.fill();
      for (let i = 0; i < 7; i++) B.tree(c, 120 + i * 230 + r() * 30, 560, 0.7 + r() * 0.3, i % 2 ? '#79c26a' : '#5fae58');
      G.rr(c, 640, 160, 320, 90, 20); G.fillO(c, '#ffd23f', 4); c.fillStyle = '#5a3a2a'; c.font = `900 50px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('どうぶつえん', 800, 222);
      c.strokeStyle = '#a8733f'; c.lineWidth = 8; for (let x = 0; x < W; x += 60) { c.beginPath(); c.moveTo(x, 560); c.lineTo(x, 610); c.stroke(); } c.lineWidth = 6; c.beginPath(); c.moveTo(0, 576); c.lineTo(W, 576); c.moveTo(0, 598); c.lineTo(W, 598); c.stroke();
      B.grass(c, 606, '#a6d98a', '#8bc97a');
      c.fillStyle = '#e8d6b0'; c.beginPath(); c.moveTo(0, 760); c.quadraticCurveTo(800, 700, W, 780); c.lineTo(W, 840); c.quadraticCurveTo(800, 760, 0, 820); c.closePath(); c.fill();
      B.tufts(c, r, 620, 40, '#6fb85e'); B.flowers(c, r, 640, 20);
    } });
  S({ id: 'farm', num: 16, name: 'のんびり ぼくじょう', bgm: 'park', floor: [580, 880], color: '#a1887f',
    tools: ['carrot', 'corn', 'apple', 'watermelon', 'wateringcan', 'seed', 'basket', 'bucket', 'egg', 'juice', 'bread', 'sheet'],
    rides: ['tricycle', 'horse', 'car', 'tent'],
    spawn: [['jiji', 640, 780], ['baba', 820, 790], ['moko', 1060, 760], ['kon', 460, 800], ['futan', 1220, 820]],
    fixtures: [['barn', 300, 640], ['cowF', 900, 700], ['henhouse', 1380, 680]],
    favs: ['wateringcan', 'seed', 'carrot', 'corn', 'basket', 'egg'],
    bg(c, r) {
      B.sky(c, '#9fd8ff', '#fff6e0', 560);
      c.fillStyle = 'rgba(255,240,160,.8)'; G.circ(c, 1400, 120, 56); c.fill(); B.cloud(c, 300, 100, 1);
      c.fillStyle = '#c9e6a0'; G.ell(c, 500, 570, 700, 150); c.fill(); c.fillStyle = '#b5dc8a'; G.ell(c, 1300, 570, 600, 120); c.fill();
      for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#e6c86a' : '#d9b85a'; c.fillRect(780 + i * 60, 470 + i * 2, 50, 90); }
      c.strokeStyle = '#ffffff'; c.lineWidth = 7; for (let x = 0; x < W; x += 70) { c.beginPath(); c.moveTo(x, 540); c.lineTo(x, 590); c.stroke(); } c.beginPath(); c.moveTo(0, 552); c.lineTo(W, 552); c.moveTo(0, 574); c.lineTo(W, 574); c.stroke();
      B.grass(c, 586, '#9fd27a', '#86c46a');
      c.fillStyle = '#b07a4a'; for (let i = 0; i < 4; i++) { c.fillRect(560 + i * 80, 760, 60, 100); c.fillStyle = '#7bd36a'; for (let k = 0; k < 3; k++) { G.ell(c, 590 + i * 80, 780 + k * 30, 14, 6); c.fill(); } c.fillStyle = '#b07a4a'; }
      B.tufts(c, r, 600, 50, '#6fb85e'); B.flowers(c, r, 620, 24);
    } });
  S({ id: 'bakery', num: 17, name: 'あまーい ケーキやさん', bgm: 'shop', floor: [580, 880], color: '#f48fb1',
    tools: ['cake', 'donut', 'pancake', 'pudding', 'cookie', 'icecream', 'strawberry', 'bread', 'juice', 'plate', 'table', 'chair', 'basket', 'royalcake'],
    rides: ['car', 'tricycle'],
    spawn: [['mimi', 640, 780], ['choco', 880, 760], ['sakura', 1060, 800], ['mama', 1260, 800], ['pyoko', 460, 800]],
    fixtures: [['oven', 260, 640], ['showcase', 860, 680], ['lowtable', 1350, 780]],
    favs: ['cake', 'donut', 'pancake', 'cookie', 'strawberry', 'royalcake', 'chef', 'apron'],
    bg(c, r) {
      B.wallpaper(c, 590, '#fff0f4', '#ffe3ec');
      G.rr(c, 560, 200, 480, 90, 30); G.fillO(c, '#ff8fb1', 4); c.fillStyle = '#ffffff'; c.font = `900 50px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('ケーキやさん', 800, 262);
      c.beginPath(); c.moveTo(520, 300); for (let i = 0; i < 9; i++) { const x = 520 + i * 62; c.lineTo(x, 300); c.quadraticCurveTo(x + 31, 344, x + 62, 300); } c.lineTo(1078, 290); c.lineTo(520, 290); c.closePath(); c.fillStyle = '#ffffff'; c.fill();
      B.window(c, 1150, 230, 260, 200, (c2, x, y, w, h) => { B.sky(c2, '#9fd8ff', '#e3f6ff', y + h); B.cloud(c2, x + 60, y + 60, 0.6); });
      for (let k = 0; k < 2; k++) { G.rr(c, 120, 260 + k * 110, 300, 16, 6); G.fillO(c, '#c99a64', 2.5); for (let i = 0; i < 4; i++) { G.rr(c, 140 + i * 70, 220 + k * 110, 50, 40, 10); G.fillO(c, ['#e3a75a', '#f5c242', '#d99a5b', '#ffd1e0'][(i + k) % 4], 2); } }
      B.floorWood(c, 590, '#f6cfa0');
      c.fillStyle = 'rgba(255,255,255,.4)'; for (let x = 0; x < W; x += 80) for (let y = 620; y < H; y += 80) if (((x + y) / 80) % 2) c.fillRect(x, y, 80, 80);
    } });
  S({ id: 'castle', num: 18, name: 'おしろの ぶとうかい', bgm: 'title', floor: [590, 880], color: '#ce93d8',
    tools: ['teaset', 'rose', 'invitation', 'mirror', 'jewelbox', 'slipper', 'royalcake', 'cake', 'harp', 'scepter', 'chandelier', 'castletoy', 'redcarpet', 'throne'],
    rides: ['carriage', 'whitehorse', 'unicorn'],
    spawn: [['mimi', 600, 780], ['gaku', 820, 760], ['sakura', 1020, 800], ['yume', 1220, 790], ['papa', 420, 800], ['mama', 1380, 820]],
    fixtures: [['throneF', 800, 610], ['chandelierF', 400, 320], ['chandelierF', 1200, 320]],
    favs: () => PT.ROYAL_FAVS,
    bg(c, r) {
      B.wallpaper(c, 600, '#f6eaff', '#efdcff');
      for (let i = 0; i < 4; i++) { const x = 160 + i * 430; G.rr(c, x - 22, 80, 44, 520, 10); G.fillO(c, '#ffffff', 3); G.rr(c, x - 34, 70, 68, 26, 8); G.fillO(c, '#f5c242', 2.5); }
      for (const x of [380, 1220]) { c.beginPath(); c.moveTo(x - 90, 520); c.lineTo(x - 90, 250); c.arc(x, 250, 90, Math.PI, 0); c.lineTo(x + 90, 520); c.closePath(); c.fillStyle = G.grad(c, 0, 160, 0, 520, [[0, '#8fb7ff'], [1, '#ffd6e6']]); c.fill(); c.strokeStyle = '#f5c242'; c.lineWidth = 8; c.stroke(); c.fillStyle = '#ffffff'; G.star(c, x, 250, 16, 7); c.fill(); }
      for (const s of [-1, 1]) { c.beginPath(); const x = 800 + s * 300; c.moveTo(x, 40); c.quadraticCurveTo(x - s * 60, 300, x + s * 10, 560); c.lineTo(x + s * 80, 560); c.quadraticCurveTo(x + s * 60, 300, x + s * 90, 40); c.closePath(); G._bb = null; c.fillStyle = '#c0304a'; c.fill(); }
      c.fillStyle = G.grad(c, 0, 600, 0, H, [[0, '#f0e4ff'], [1, '#e2d0f5']]); c.fillRect(0, 600, W, H - 600);
      c.fillStyle = 'rgba(255,255,255,.35)'; for (let x = 0; x < W; x += 100) for (let y = 620; y < H; y += 100) if (((x + y) / 100) % 2) c.fillRect(x, y, 100, 100);
      c.fillStyle = '#c0304a'; c.beginPath(); c.moveTo(700, 640); c.lineTo(900, 640); c.lineTo(980, H); c.lineTo(620, H); c.closePath(); c.fill(); c.fillStyle = '#f5c242'; c.fillRect(700, 640, 200, 6);
    } });
  S({ id: 'pool', num: 19, name: 'ばしゃばしゃ プール', bgm: 'beach', floor: [590, 880], color: '#4dd0e1',
    tools: ['duck', 'ball', 'bucket', 'parasol', 'sheet', 'juice', 'icecream', 'watermelon', 'sunglasses', 'umbrella'],
    rides: ['swimring', 'boat', 'pool'],
    spawn: [['pon', 600, 780], ['lulu', 820, 760], ['yuto', 1020, 800], ['sakura', 420, 820], ['penta', 1240, 800]],
    fixtures: [['poolF', 760, 820], ['waterslide', 260, 640], ['hydrant', 1420, 650]],
    favs: ['swimring', 'duck', 'ball', 'sunglasses', 'watermelon'],
    bg(c, r) {
      B.sky(c, '#7fcfff', '#e8f8ff', 560);
      c.fillStyle = 'rgba(255,240,170,.9)'; G.circ(c, 1380, 110, 58); c.fill(); B.cloud(c, 300, 90, 1); B.cloud(c, 900, 70, 0.8);
      for (let i = 0; i < 5; i++) { const x = 160 + i * 340; c.strokeStyle = '#a8733f'; c.lineWidth = 14; c.beginPath(); c.moveTo(x, 590); c.quadraticCurveTo(x + 20, 440, x - 10, 330); c.stroke(); for (let k = 0; k < 6; k++) { c.save(); c.translate(x - 10, 330); c.rotate(-1.4 + k * 0.55); G.ell(c, 50, 0, 56, 14); c.fillStyle = '#5cbf5a'; c.fill(); c.restore(); } }
      c.fillStyle = '#d6eef8'; c.fillRect(0, 560, W, 40);
      c.fillStyle = G.grad(c, 0, 590, 0, H, [[0, '#e8f6fc'], [1, '#cfe9f5']]); c.fillRect(0, 590, W, H - 590);
      c.strokeStyle = 'rgba(150,200,230,.6)'; c.lineWidth = 2; for (let x = 0; x < W; x += 60) { c.beginPath(); c.moveTo(x, 590); c.lineTo(x, H); c.stroke(); } for (let y = 620; y < H; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    } });
  S({ id: 'fire', num: 20, name: 'しゅつどう しょうぼうしょ', bgm: 'shop', floor: [590, 880], color: '#e53935',
    tools: ['firehat', 'helmet', 'bucket', 'flashlight', 'phone', 'bag', 'onigiri', 'juice', 'teddy', 'wateringcan', 'police'],
    rides: ['firetruck', 'ambulance', 'car', 'bicycle'],
    spawn: [['gaku', 640, 780], ['papa', 860, 790], ['yuto', 1060, 790], ['lulu', 460, 800], ['kon', 1280, 820]],
    fixtures: [['firetruckF', 720, 700], ['firepole', 1260, 640], ['hydrant', 230, 700]],
    favs: ['firehat', 'firetruck', 'ambulance', 'bucket', 'police'],
    bg(c, r) {
      B.sky(c, '#9fd8ff', '#eaf7ff', 260);
      G.rr(c, 40, 120, 1520, 480, 10); G.fillO(c, '#f6e3d0', 4);
      G.rr(c, 20, 90, 1560, 50, 10); G.fillO(c, '#e2433b', 4); c.fillStyle = '#ffffff'; c.font = `900 40px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('しょうぼうしょ', 800, 130);
      for (let i = 0; i < 2; i++) { const x = 260 + i * 560; G.rr(c, x, 220, 420, 380, 12); c.fillStyle = '#5a4a5a'; c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.stroke(); c.fillStyle = 'rgba(255,255,255,.15)'; for (let y = 240; y < 600; y += 34) c.fillRect(x + 6, y, 408, 14); }
      G.rr(c, 1360, 220, 160, 140, 10); G.fillO(c, '#bfe6ff', 3); G.circ(c, 1440, 180, 30); G.fillO(c, '#ffffff', 3); c.strokeStyle = '#3a3550'; c.lineWidth = 3; c.beginPath(); c.moveTo(1440, 180); c.lineTo(1440, 162); c.moveTo(1440, 180); c.lineTo(1452, 186); c.stroke();
      c.fillStyle = '#9aa3b8'; c.fillRect(0, 600, W, H - 600); c.fillStyle = '#ffd23f'; for (let x = 20; x < W; x += 140) c.fillRect(x, 740, 80, 12);
    } });
  S({ id: 'flower', num: 21, name: 'おはなばたけ', bgm: 'park', floor: [580, 880], color: '#f06292',
    tools: ['wateringcan', 'seed', 'bugnet', 'magnifier', 'basket', 'sheet', 'onigiri', 'juice', 'kite', 'pinwheel', 'flowercrown', 'camera'],
    rides: ['tricycle', 'bicycle', 'tent'],
    spawn: [['pyoko', 640, 780], ['sakura', 860, 790], ['yume', 1060, 760], ['mimi', 460, 800], ['baba', 1260, 800]],
    fixtures: [['windmill', 300, 620], ['flowerarch', 820, 660], ['beehive', 1380, 660]],
    favs: ['wateringcan', 'seed', 'bugnet', 'flowercrown', 'pinwheel', 'kite'],
    bg(c, r) {
      B.sky(c, '#9fd8ff', '#fff3fa', 560);
      B.cloud(c, 200, 110, 1); B.cloud(c, 1000, 80, 0.8);
      c.fillStyle = '#c9e6a0'; G.ell(c, 400, 560, 600, 120); c.fill(); G.ell(c, 1250, 560, 600, 140); c.fill();
      const cols = ['#ff6f91', '#ffd23f', '#9b8cff', '#ff9a3d', '#ffffff', '#ff8fb1'];
      B.grass(c, 556, '#a6d98a', '#86c46a');
      for (let row = 0; row < 7; row++) { const y = 590 + row * 44, col = cols[row % cols.length]; for (let x = (row % 2) * 20; x < W; x += 28 + row * 2) { const s = 0.7 + row * 0.12; c.fillStyle = '#5cae58'; c.fillRect(x - 1, y - 2, 2, 10 * s); c.fillStyle = col; for (let k = 0; k < 5; k++) { const a = (k / 5) * PT.TAU; G.circ(c, x + Math.cos(a) * 4 * s, y - 4 * s + Math.sin(a) * 4 * s, 3.4 * s); c.fill(); } c.fillStyle = '#ffd23f'; G.circ(c, x, y - 4 * s, 2 * s); c.fill(); } }
    } });
  S({ id: 'sea', num: 22, name: 'うみの なかの くに', bgm: 'night', floor: [600, 880], color: '#0288d1', lowGravity: true,
    tools: ['shell', 'duck', 'flashlight', 'chest', 'magnifier', 'camera', 'bubbles', 'swimring', 'gown_mermaid', 'tiara_shell'],
    rides: ['boat', 'swimring'],
    spawn: [['lulu', 640, 780], ['penta', 860, 760], ['mimi', 1060, 800], ['nyan', 460, 800]],
    fixtures: [['coral', 280, 660], ['treasure', 860, 760], ['clam', 1300, 720], ['coral', 1500, 640]],
    favs: ['gown_mermaid', 'tiara_shell', 'shell', 'chest', 'bubbles'],
    ambient: bubblesUp,
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, H, [[0, '#4fc3f7'], [0.5, '#1e88e5'], [1, '#0d47a1']]); c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,255,255,.15)'; for (let i = 0; i < 7; i++) { c.save(); c.translate(80 + i * 240, -20); c.rotate(0.15); c.fillRect(0, 0, 50, 700); c.restore(); }
      for (let i = 0; i < 8; i++) { const x = r() * W, y = 120 + r() * 380, s = 0.6 + r() * 0.6; c.save(); c.translate(x, y); c.scale(i % 2 ? -s : s, s); G.ell(c, 0, 0, 24, 14); c.fillStyle = ['#ffd23f', '#ff8a3d', '#ff6f91', '#58e0d0'][i % 4]; c.fill(); G.poly(c, [22, 0, 36, -12, 36, 12]); c.fill(); c.fillStyle = '#2a1f35'; G.circ(c, -12, -3, 2.6); c.fill(); c.restore(); }
      for (let i = 0; i < 10; i++) { const x = r() * W; c.strokeStyle = '#2e9e6a'; c.lineWidth = 8; c.beginPath(); c.moveTo(x, 640); for (let k = 1; k < 6; k++) c.lineTo(x + Math.sin(k + i) * 12, 640 - k * 34); c.stroke(); }
      c.fillStyle = G.grad(c, 0, 600, 0, H, [[0, '#f3d58f'], [1, '#e0b86a']]); c.beginPath(); c.moveTo(0, 620); for (let x = 0; x <= W; x += 100) c.quadraticCurveTo(x + 50, 600 + Math.sin(x) * 10, x + 100, 616); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
      G.speckle(c, 0, 640, W, 260, 'rgba(255,255,255,.4)', 160, 2);
    } });
  S({ id: 'cloud', num: 23, name: 'にじと くもの おうこく', bgm: 'title', floor: [590, 880], color: '#b39ddb',
    tools: ['star', 'wand', 'rainbow', 'balloon', 'moon', 'cloud', 'petals', 'musicbox', 'teddy', 'cake', 'kite', 'wings'],
    rides: ['carpet', 'unicorn', 'airplane'],
    spawn: [['yume', 640, 780], ['pyoko', 860, 760], ['choco', 1060, 800], ['futan', 460, 800], ['sakura', 1260, 800]],
    fixtures: [['rainbowslide', 400, 640], ['cloudbed', 1000, 760], ['starfountain', 1380, 680]],
    favs: ['wings', 'wand', 'rainbow', 'star', 'balloon', 'unicorn'],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, H, [[0, '#9fc8ff'], [0.6, '#ffd6f0'], [1, '#fff4fa']]); c.fillRect(0, 0, W, H);
      ['#ff6f7a', '#ffa64d', '#ffe066', '#7bd36a', '#58b9f0', '#9b8cff'].forEach((col, i) => { c.strokeStyle = col; c.globalAlpha = 0.55; c.lineWidth = 22; c.beginPath(); c.arc(800, 640, 560 - i * 22, Math.PI, 0); c.stroke(); }); c.globalAlpha = 1;
      for (let i = 0; i < 9; i++) B.cloud(c, r() * W - 60, 60 + r() * 360, 0.8 + r() * 0.8);
      c.fillStyle = '#ffffff'; for (let x = -60; x < W + 60; x += 110) { G.circ(c, x, 600 + (x % 3) * 6, 80); c.fill(); }
      c.fillRect(0, 610, W, H - 610);
      c.fillStyle = 'rgba(200,210,255,.4)'; for (let i = 0; i < 20; i++) { G.ell(c, r() * W, 650 + r() * 230, 70, 14); c.fill(); }
      c.fillStyle = 'rgba(255,236,120,.9)'; for (let i = 0; i < 16; i++) { G.star(c, r() * W, 40 + r() * 300, 5 + r() * 5, 2.4); c.fill(); }
    } });
  S({ id: 'museum', num: 24, name: 'きょうりゅう はくぶつかん', bgm: 'camp', floor: [600, 880], color: '#8d6e63',
    tools: ['dino', 'magnifier', 'camera', 'book', 'bucket', 'bag', 'flashlight', 'egg', 'crayons', 'chest', 'explorer'],
    rides: ['train', 'car', 'tricycle'],
    spawn: [['gaku', 640, 780], ['lulu', 860, 760], ['yuto', 1060, 800], ['jiji', 460, 800], ['kon', 1260, 800]],
    fixtures: [['dinoskel', 760, 640], ['digbox', 300, 830], ['gemcase', 1380, 680]],
    favs: ['dino', 'magnifier', 'explorer', 'egg', 'camera'],
    bg(c, r) {
      B.wallpaper(c, 600, '#f3ead8', '#ebdfc6');
      for (let i = 0; i < 5; i++) { const x = 60 + i * 380; G.rr(c, x, 60, 40, 540, 6); G.fillO(c, '#e2d4b8', 3); }
      B.frame(c, 140, 160, 200, 150, '#a8733f', (c2, x, y, w, h) => { B.sky(c2, '#ffb07a', '#ffe9a8', y + h); c2.fillStyle = '#7a5a8a'; c2.beginPath(); c2.moveTo(x, y + h); c2.lineTo(x + 60, y + 50); c2.lineTo(x + 120, y + h); c2.fill(); c2.fillStyle = '#5c9e3e'; G.ell(c2, x + 150, y + h - 30, 30, 20); c2.fill(); c2.fillRect(x + 146, y + h - 30, 8, 30); });
      B.frame(c, 1260, 150, 220, 170, '#a8733f', (c2, x, y, w, h) => { B.sky(c2, '#cfe8ff', '#fff', y + h); c2.fillStyle = '#7bd36a'; c2.fillRect(x, y + h - 30, w, 30); c2.fillStyle = '#58b07a'; G.ell(c2, x + 100, y + h - 60, 50, 30); c2.fill(); c2.strokeStyle = '#58b07a'; c2.lineWidth = 12; c2.beginPath(); c2.moveTo(x + 140, y + h - 70); c2.quadraticCurveTo(x + 170, y + 40, x + 190, y + 30); c2.stroke(); });
      G.rr(c, 600, 80, 400, 70, 16); G.fillO(c, '#8d6e63', 3); c.fillStyle = '#fff8e8'; c.font = `900 40px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('はくぶつかん', 800, 128);
      B.floorWood(c, 600, '#d9b98a');
      c.fillStyle = 'rgba(120,80,40,.12)'; for (let x = 0; x < W; x += 120) for (let y = 620; y < H; y += 60) c.fillRect(x + ((y / 60) % 2) * 60, y, 116, 56);
    } });
  // favs が かんすうの ステージ
  PT.STAGES.forEach((s) => { if (typeof s.favs === 'function') { const f = s.favs; Object.defineProperty(s, 'favs', { get: () => f() || [], set() {}, configurable: true }); } });
})();
