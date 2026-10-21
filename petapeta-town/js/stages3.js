/* ふえた ステージ（25〜36） */
'use strict';
(() => {
  const G = PT.G, B = PT.BG, F = PT.FIX, W = PT.W, H = PT.H;
  const on = (f, k, t) => f[k] && t < f[k];
  const prog = (f, k, t, ms) => (on(f, k, t) ? 1 - (f[k] - t) / ms : -1);

  /* ---------- 25 まほうの がっこう ---------- */
  F.bigcauldron = { w: 260, h: 220, tags: ['magic', 'pot'], slots: [[-170, 20], [170, 20]],
    draw(c, t, f) {
      const hot = on(f, 'brew', t), col = f.col || '#7fe08a';
      for (const x of [-70, 70]) { c.strokeStyle = '#3a3550'; c.lineWidth = 12; c.beginPath(); c.moveTo(x, -20); c.lineTo(x * 1.25, 4); c.stroke(); }
      G.ell(c, 0, -80, 120, 86); G.fillO(c, '#3a3550', 4); G.ell(c, 0, -150, 112, 24); G.fillO(c, '#4a4560', 4); G.ell(c, 0, -150, 98, 17); c.fillStyle = hot ? '#ff8fe0' : col; c.fill();
      for (let i = 0; i < (hot ? 10 : 5); i++) { const k = ((t * 0.0006 * (hot ? 2.2 : 1) + i * 0.19) % 1); G.circ(c, -60 + ((i * 37) % 120), -158 - k * (hot ? 160 : 70), 8 + k * 10); c.fillStyle = hot ? `rgba(255,170,240,${1 - k})` : `rgba(140,230,150,${1 - k})`; c.fill(); }
      c.fillStyle = 'rgba(255,160,80,.85)'; for (let i = 0; i < 5; i++) { G.ell(c, -50 + i * 25, -6, 12, 18 + Math.sin(t * 0.02 + i) * 4); c.fill(); }
    } };
  F.broomrack = { w: 220, h: 220, tags: ['broom', 'magic'], slots: [[-150, 20], [150, 20]],
    draw(c, t) {
      G.rr(c, -100, -200, 200, 18, 6); G.fillO(c, '#8a5a3a', 3); for (const x of [-90, 82]) { G.rr(c, x, -190, 8, 190, 3); G.fillO(c, '#8a5a3a', 2); }
      for (let i = 0; i < 4; i++) { const x = -60 + i * 40, sw = Math.sin(t * 0.003 + i) * 0.06; c.save(); c.translate(x, -184); c.rotate(sw); c.strokeStyle = '#a8733f'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 120); c.stroke(); c.beginPath(); c.moveTo(-14, 116); c.lineTo(14, 116); c.lineTo(18, 170); c.lineTo(-18, 170); c.closePath(); G._bb = { x0: -18, y0: 116, x1: 18, y1: 170 }; G.fillO(c, '#e9c26a', 2); G.rr(c, -10, 110, 20, 8, 3); c.fillStyle = ['#9b6fd6', '#ff8fb1', '#58b9f0', '#7bd36a'][i]; c.fill(); c.restore(); }
    } };
  F.magicmirror = { w: 160, h: 280, tags: ['mirror', 'magic'], slots: [[-110, 20], [110, 20]],
    draw(c, t, f) {
      G.rr(c, -14, -40, 28, 40, 6); G.fillO(c, '#c99a22', 3);
      G.ell(c, 0, -160, 72, 110); G.fillO(c, '#f5c242', 4); G.ell(c, 0, -160, 58, 96);
      c.fillStyle = on(f, 'flash', t) ? '#fff6c8' : G.grad(c, 0, -256, 0, -64, [[0, '#d9e8ff'], [1, '#a9c4f0']]); c.fill();
      c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.moveTo(-30, -220); c.lineTo(-10, -230); c.lineTo(-40, -120); c.lineTo(-52, -130); c.closePath(); c.fill();
      c.fillStyle = '#ff8fb1'; G.heart(c, 0, -272, 14); c.fill();
    } };
  /* ---------- 26 おかしの いえ ---------- */
  F.gingerhouse = { w: 360, h: 330, tags: ['house', 'candy', 'food'], slots: [[-220, 20], [220, 20]],
    draw(c, t, f) {
      G.rr(c, -150, -200, 300, 200, 10); G.fillO(c, '#c9844f', 4);
      c.beginPath(); c.moveTo(-180, -190); c.lineTo(0, -320); c.lineTo(180, -190); c.closePath(); G._bb = { x0: -180, y0: -320, x1: 180, y1: -190 }; G.fillO(c, '#7a4a2e', 4);
      c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.beginPath(); c.moveTo(-176, -192); for (let i = 0; i < 12; i++) { const x = -176 + (i + 1) * 29.3, y = -192 - 130 * (1 - Math.abs(x) / 180); c.quadraticCurveTo(x - 14, y + 16, x, y); } c.stroke();
      [['#ff5d78', -100, -250], ['#58b9f0', 80, -240], ['#ffd23f', 0, -290], ['#7bd36a', -40, -220], ['#ff9a3d', 40, -260]].forEach(([col, x, y]) => { G.circ(c, x, y, 10); G.fillO(c, col, 2); });
      const open = on(f, 'open', t);
      G.rr(c, -40, -120, 80, 120, 36); c.fillStyle = open ? '#5a3a2a' : '#ff8fb1'; c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 5; c.stroke();
      for (const x of [-110, 110]) { G.rr(c, x - 30, -160, 60, 50, 8); c.fillStyle = '#ffe9a8'; c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 5; c.stroke(); c.beginPath(); c.moveTo(x, -160); c.lineTo(x, -110); c.moveTo(x - 30, -135); c.lineTo(x + 30, -135); c.stroke(); }
      c.fillStyle = '#ffffff'; for (let x = -140; x < 150; x += 30) { G.circ(c, x, -10, 7); c.fill(); }
    } };
  F.chocofountain = { w: 220, h: 260, tags: ['chocolate', 'food', 'fountain'], slots: [[-150, 20], [150, 20]],
    draw(c, t, f) {
      const fast = on(f, 'flow', t) ? 2.5 : 1;
      [[110, -20], [80, -100], [50, -170]].forEach(([r, y], i) => { G.ell(c, 0, y, r, r * 0.22); G.fillO(c, '#f5c242', 3); G.ell(c, 0, y - 4, r - 10, r * 0.16); c.fillStyle = '#7a4a2e'; c.fill(); if (i) { c.fillStyle = '#7a4a2e'; for (let k = 0; k < 7; k++) { const x = -r + 10 + k * ((2 * r - 20) / 6); const d = ((t * 0.002 * fast + k * 0.3) % 1); c.fillRect(x - 3, y, 6, 50 + d * 20); } } });
      G.rr(c, -10, -230, 20, 210, 6); G.fillO(c, '#f5c242', 2.5); G.circ(c, 0, -236, 16); G.fillO(c, '#7a4a2e', 3);
      for (const [x, col] of [[-90, '#ff5d78'], [-60, '#ffd23f'], [70, '#58b9f0']]) { G.circ(c, x, -36, 9); G.fillO(c, col, 2); }
    } };
  F.lollitree = { w: 200, h: 340, tags: ['tree', 'candy'], slots: [[-130, 20], [130, 20]],
    draw(c, t, f) {
      c.strokeStyle = '#ffffff'; c.lineWidth = 18; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -200); c.stroke();
      c.strokeStyle = '#ff7aa2'; c.lineWidth = 6; for (let y = -10; y > -200; y -= 26) { c.beginPath(); c.moveTo(-9, y); c.lineTo(9, y - 14); c.stroke(); }
      const sh = on(f, 'shake', t) ? Math.sin(t * 0.04) * 8 : 0;
      [[-60, -250, '#ff8fb1'], [60, -260, '#9fd8ff'], [0, -310, '#ffe066'], [-20, -220, '#b39ae8'], [44, -205, '#7bd36a']].forEach(([x, y, col]) => { G.circ(c, x + sh, y, 38); G.fillO(c, col, 3); c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.beginPath(); c.arc(x + sh, y, 22, 0, 4.4); c.stroke(); });
    } };
  /* ---------- 27 ハロウィン ---------- */
  F.pumpkinhouse = { w: 340, h: 300, tags: ['pumpkin', 'house', 'halloween'], slots: [[-210, 20], [210, 20]],
    draw(c, t, f) {
      for (const [x, w] of [[-90, 110], [90, 110], [0, 130]]) { G.ell(c, x, -130, w, 130); G.fillO(c, '#ff9a3d', 4); }
      c.strokeStyle = '#5c9e3e'; c.lineWidth = 16; c.beginPath(); c.moveTo(0, -256); c.quadraticCurveTo(10, -300, 40, -296); c.stroke();
      const lit = on(f, 'lit', t) || Math.sin(t * 0.002) > 0.3; c.fillStyle = lit ? '#ffe066' : '#5a2a1a';
      G.poly(c, [-90, -170, -40, -170, -65, -210]); c.fill(); G.poly(c, [40, -170, 90, -170, 65, -210]); c.fill();
      c.beginPath(); c.moveTo(-50, -60); c.lineTo(-50, -110); c.arc(0, -110, 50, Math.PI, 0); c.lineTo(50, -60); c.closePath(); c.fill();
      c.fillStyle = '#ffffff'; if (on(f, 'boo', t)) { const k = prog(f, 'boo', t, 1600); const y = -120 - Math.sin(k * Math.PI) * 160; c.beginPath(); c.moveTo(-34, y + 40); c.lineTo(-34, y); c.arc(0, y, 34, Math.PI, 0); c.lineTo(34, y + 40); for (let i = 0; i < 4; i++) c.lineTo(34 - (i + 0.5) * 17, y + 40 - (i % 2 ? 0 : 10)); c.closePath(); c.fill(); c.fillStyle = '#2a1f35'; G.circ(c, -12, y - 4, 5); c.fill(); G.circ(c, 12, y - 4, 5); c.fill(); G.ell(c, 0, y + 14, 7, 9); c.fill(); }
    } };
  F.ghostF = { w: 140, h: 200, tags: ['ghost', 'halloween'], slots: [[-100, 10], [100, 10]],
    draw(c, t, f) {
      const b = Math.sin(t * 0.003) * 10 + (on(f, 'boo', t) ? -40 * Math.sin(prog(f, 'boo', t, 1200) * Math.PI) : 0), y = -110 + b;
      c.fillStyle = 'rgba(0,0,0,.12)'; G.ell(c, 0, -4, 50, 10); c.fill();
      c.beginPath(); c.moveTo(-56, y + 70); c.lineTo(-56, y); c.arc(0, y, 56, Math.PI, 0); c.lineTo(56, y + 70); for (let i = 0; i < 5; i++) c.quadraticCurveTo(56 - (i + 0.5) * 22.4, y + 50 + (i % 2) * 30, 56 - (i + 1) * 22.4, y + 70); c.closePath(); G._bb = { x0: -56, y0: y - 56, x1: 56, y1: y + 70 }; G.fillO(c, '#ffffff', 3);
      c.fillStyle = '#2a1f35'; if (on(f, 'boo', t)) { G.ell(c, -18, y - 6, 8, 11); c.fill(); G.ell(c, 18, y - 6, 8, 11); c.fill(); G.ell(c, 0, y + 22, 14, 16); c.fill(); } else { G.circ(c, -18, y - 4, 6); c.fill(); G.circ(c, 18, y - 4, 6); c.fill(); c.strokeStyle = '#2a1f35'; c.lineWidth = 3; c.beginPath(); c.arc(0, y + 14, 10, 0.2, Math.PI - 0.2); c.stroke(); }
      c.fillStyle = 'rgba(255,140,170,.5)'; G.ell(c, -32, y + 8, 9, 5); c.fill(); G.ell(c, 32, y + 8, 9, 5); c.fill();
    } };
  F.pumpkinpatch = { w: 360, h: 120, tags: ['pumpkin', 'field', 'halloween'], slots: [[-220, 10], [220, 10]],
    draw(c, t) {
      G.ell(c, 0, -14, 180, 26); c.fillStyle = '#6a4a2a'; c.fill();
      [[-130, 0.8], [-50, 1], [40, 0.9], [120, 0.75]].forEach(([x, s]) => { for (const [dx, w] of [[-14, 18], [14, 18], [0, 22]]) { G.ell(c, x + dx * s, -36 * s, w * s, 26 * s); G.fillO(c, '#ff9a3d', 2.5); } c.strokeStyle = '#5c9e3e'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, -60 * s); c.lineTo(x + 6, -72 * s); c.stroke(); });
      c.strokeStyle = '#5c9e3e'; c.lineWidth = 3; c.beginPath(); c.moveTo(-170, -20); for (let x = -170; x < 170; x += 40) c.quadraticCurveTo(x + 20, -40, x + 40, -20); c.stroke();
    } };
  /* ---------- 28 クリスマス ---------- */
  F.xmastree = { w: 300, h: 440, tags: ['tree', 'christmas', 'light'], slots: [[-180, 20], [180, 20]],
    draw(c, t, f) {
      G.rr(c, -20, -60, 40, 60, 6); G.fillO(c, '#8a5a3a', 3);
      [[150, -50, 130], [120, -150, 120], [90, -240, 110]].forEach(([w, y, h]) => { G.poly(c, [-w, y, 0, y - h, w, y]); G.fillO(c, '#3f8a5c', 3); });
      c.strokeStyle = '#ffd23f'; c.lineWidth = 4; c.beginPath(); c.moveTo(-110, -90); c.quadraticCurveTo(0, -60, 100, -120); c.moveTo(-80, -190); c.quadraticCurveTo(0, -160, 80, -210); c.stroke();
      const lit = on(f, 'lit', t) || f.always;
      [[-90, -70], [-30, -110], [50, -90], [100, -60], [-60, -170], [20, -200], [60, -150], [-20, -260], [30, -280], [0, -230]].forEach(([x, y], i) => { G.circ(c, x, y, 9); c.fillStyle = lit && (Math.floor(t / 300) + i) % 3 ? ['#ff5d78', '#ffd23f', '#58b9f0', '#ffffff'][i % 4] : ['#c0304a', '#c99a22', '#2f7fc8', '#c9d6e4'][i % 4]; c.fill(); });
      const k = 1 + Math.sin(t * 0.005) * 0.08; c.save(); c.translate(0, -366); c.scale(k, k); G.star(c, 0, 0, 30, 13); G.fillO(c, '#ffe066', 3); c.restore();
      [[-90, '#ff5d78'], [60, '#58b9f0'], [-20, '#7bd36a']].forEach(([x, col]) => { G.rr(c, x - 24, -48, 48, 44, 5); G.fillO(c, col, 2.5); c.fillStyle = '#ffd23f'; c.fillRect(x - 4, -48, 8, 44); c.fillRect(x - 24, -30, 48, 8); });
    } };
  F.sleigh = { w: 340, h: 200, tags: ['sleigh', 'christmas', 'ride'], slots: [[0, -60], [-220, 20]],
    draw(c, t, f) {
      const up = on(f, 'fly', t) ? Math.sin(prog(f, 'fly', t, 3000) * Math.PI) * 200 : 0;
      c.save(); c.translate(0, -up);
      c.strokeStyle = '#f5c242'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(-150, -10); c.lineTo(110, -10); c.quadraticCurveTo(160, -10, 150, -50); c.stroke();
      c.beginPath(); c.moveTo(-140, -40); c.lineTo(-150, -130); c.quadraticCurveTo(-120, -150, -90, -120); c.lineTo(80, -110); c.quadraticCurveTo(130, -100, 110, -40); c.closePath(); G._bb = { x0: -150, y0: -150, x1: 130, y1: -40 }; G.fillO(c, '#e2433b', 4);
      c.strokeStyle = '#ffd23f'; c.lineWidth = 4; c.beginPath(); c.moveTo(-130, -60); c.lineTo(100, -60); c.stroke();
      G.rr(c, -90, -150, 70, 50, 8); G.fillO(c, '#58b9f0', 2.5); c.fillStyle = '#ffd23f'; c.fillRect(-58, -150, 6, 50);
      c.restore();
    } };
  F.fireplace = { w: 260, h: 260, tags: ['fire', 'christmas', 'warm'], slots: [[-170, 20], [170, 20]],
    draw(c, t, f) {
      G.rr(c, -130, -250, 260, 250, 8); G.fillO(c, '#c9645a', 4);
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; for (let y = -230; y < 0; y += 24) { c.beginPath(); c.moveTo(-126, y); c.lineTo(126, y); c.stroke(); }
      G.rr(c, -150, -270, 300, 28, 6); G.fillO(c, '#8a5a3a', 3);
      G.rr(c, -80, -160, 160, 160, 60); c.fillStyle = '#2a1f1a'; c.fill();
      for (let i = 0; i < 5; i++) { G.ell(c, -40 + i * 20, -40 - Math.abs(Math.sin(t * 0.015 + i)) * 20, 12, 30); c.fillStyle = ['#ff6f3d', '#ffd23f'][i % 2]; c.fill(); }
      const full = on(f, 'gift', t);
      [[-90, '#ff5d78'], [0, '#7bd36a'], [90, '#58b9f0']].forEach(([x, col]) => { c.save(); c.translate(x, -250); G.rr(c, -14, 0, 28, 42, 6); G.fillO(c, col, 2); G.ell(c, 4, 42, 18, 10); G.fillO(c, col, 2); G.rr(c, -16, 0, 32, 10, 3); c.fillStyle = '#ffffff'; c.fill(); if (full) { G.rr(c, -10, -16, 20, 18, 3); G.fillO(c, '#ffd23f', 2); } c.restore(); });
    } };
  /* ---------- 29 にんじゃ やしき ---------- */
  F.spinwall = { w: 200, h: 300, tags: ['wall', 'ninja', 'secret'], slots: [[-130, 20], [130, 20]],
    draw(c, t, f) {
      const k = on(f, 'spin', t) ? Math.cos(prog(f, 'spin', t, 900) * Math.PI * 2) : 1;
      G.rr(c, -110, -300, 220, 300, 4); G.fillO(c, '#e8d6b0', 3);
      c.save(); c.scale(Math.abs(k) < 0.05 ? 0.05 : k, 1);
      G.rr(c, -70, -260, 140, 260, 4); G.fillO(c, k > 0 ? '#f6ecd6' : '#a8733f', 3);
      c.strokeStyle = '#a8733f'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -260); c.lineTo(0, 0); c.moveTo(-70, -130); c.lineTo(70, -130); c.stroke();
      c.restore();
    } };
  F.target = { w: 160, h: 220, tags: ['target', 'ninja'], slots: [[-110, 20], [110, 20]],
    draw(c, t, f) {
      for (const x of [-40, 40]) { G.rr(c, x - 6, -80, 12, 80, 4); G.fillO(c, '#8a5a3a', 2); }
      ['#ffffff', '#e2433b', '#ffffff', '#e2433b'].forEach((col, i) => { G.circ(c, 0, -140, 70 - i * 17); c.fillStyle = col; c.fill(); }); c.strokeStyle = '#a8324a'; c.lineWidth = 3; G.circ(c, 0, -140, 70); c.stroke();
      (f.hits || []).forEach(([x, y]) => { c.save(); c.translate(x, -140 + y); c.rotate(t * 0.001); G.star(c, 0, 0, 12, 4, 4); G.fillO(c, '#9aa3b8', 2); c.restore(); });
    } };
  F.bellrope = { w: 140, h: 360, tags: ['bell', 'ninja'], slots: [[-90, 20], [90, 20]],
    draw(c, t, f) {
      G.rr(c, -70, -360, 140, 20, 6); G.fillO(c, '#8a5a3a', 3);
      const sw = on(f, 'ring', t) ? Math.sin(t * 0.03) * 0.3 : 0;
      c.save(); c.translate(0, -340); c.rotate(sw);
      c.beginPath(); c.moveTo(-34, 70); c.quadraticCurveTo(-34, 10, 0, 6); c.quadraticCurveTo(34, 10, 34, 70); c.closePath(); G._bb = { x0: -34, y0: 6, x1: 34, y1: 70 }; G.fillO(c, '#f5c242', 3); G.circ(c, 0, 74, 8); G.fillO(c, '#c99a22', 2);
      c.strokeStyle = '#e2433b'; c.lineWidth = 8; c.beginPath(); c.moveTo(0, 80); c.lineTo(0, 300); c.stroke(); c.strokeStyle = '#ffffff'; c.lineWidth = 3; for (let y = 100; y < 300; y += 24) { c.beginPath(); c.moveTo(-4, y); c.lineTo(4, y + 10); c.stroke(); }
      c.restore();
    } };
  /* ---------- 30 かいぞくせん ---------- */
  F.shipwheel = { w: 180, h: 240, tags: ['wheel', 'pirate'], slots: [[-120, 20], [120, 20]],
    draw(c, t, f) {
      G.rr(c, -14, -120, 28, 120, 6); G.fillO(c, '#8a5a3a', 3);
      c.save(); c.translate(0, -150); c.rotate((f.rot || 0) + (on(f, 'spin', t) ? (t - (f.spin - 1500)) * 0.006 : 0));
      c.strokeStyle = '#a8733f'; c.lineWidth = 10; c.lineCap = 'round'; for (let i = 0; i < 8; i++) { const a = (i / 8) * PT.TAU; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 82, Math.sin(a) * 82); c.stroke(); }
      G.circ(c, 0, 0, 60); c.strokeStyle = '#8a5a3a'; c.lineWidth = 12; c.stroke(); G.circ(c, 0, 0, 16); G.fillO(c, '#f5c242', 3);
      c.restore();
    } };
  F.cannon = { w: 220, h: 160, tags: ['cannon', 'pirate'], slots: [[-150, 20], [150, 20]],
    draw(c, t, f) {
      const k = on(f, 'boom', t) ? Math.sin(prog(f, 'boom', t, 600) * Math.PI) * 14 : 0;
      c.save(); c.translate(-k, -70); c.rotate(-0.35); G.rr(c, -70, -26, 150, 52, 24); G.fillO(c, '#3a3550', 3); G.ell(c, 80, 0, 10, 28); c.fillStyle = '#1a1a2a'; c.fill(); G.rr(c, -10, -28, 14, 56, 4); c.fillStyle = '#f5c242'; c.fill(); c.restore();
      for (const x of [-40, 40]) { G.circ(c, x, -24, 26); G.fillO(c, '#a8733f', 3); G.circ(c, x, -24, 8); c.fillStyle = '#5a3a2a'; c.fill(); }
    } };
  F.mast = { w: 240, h: 520, tags: ['mast', 'pirate', 'climb'], slots: [[-150, 20], [0, -420]],
    draw(c, t) {
      G.rr(c, -14, -520, 28, 520, 6); G.fillO(c, '#8a5a3a', 3);
      const wv = Math.sin(t * 0.002) * 10;
      c.beginPath(); c.moveTo(14, -470); c.quadraticCurveTo(130 + wv, -380, 14, -240); c.closePath(); G._bb = { x0: 14, y0: -470, x1: 130, y1: -240 }; G.fillO(c, '#fff8e8', 3);
      c.beginPath(); c.moveTo(-14, -440); c.quadraticCurveTo(-120 + wv, -360, -14, -260); c.closePath(); G._bb = { x0: -120, y0: -440, x1: -14, y1: -260 }; G.fillO(c, '#fff8e8', 3);
      G.rr(c, -50, -420, 100, 26, 6); G.fillO(c, '#a8733f', 3);
      c.fillStyle = '#2a1f35'; c.beginPath(); c.moveTo(0, -520); c.lineTo(0, -560); c.lineTo(60 + wv, -548); c.lineTo(0, -536); c.fill(); c.fillStyle = '#ffffff'; G.circ(c, 24 + wv * 0.4, -548, 6); c.fill();
      c.strokeStyle = '#c9a070'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-14, -400 + i * 60); c.lineTo(-110, 0); c.stroke(); }
    } };
  /* ---------- 31 ジャングル ---------- */
  F.waterfall = { w: 300, h: 460, tags: ['water', 'waterfall'], slots: [[-190, 20], [190, 20]],
    draw(c, t, f) {
      G.blob(c, [-150, 0, -140, -400, -60, -460, 60, -460, 140, -400, 150, 0]); G.fillO(c, '#7a8a9a', 4);
      c.fillStyle = G.grad(c, 0, -440, 0, 0, [[0, '#bfe6ff'], [1, '#7fd0ff']]); c.fillRect(-70, -440, 140, 420);
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; for (let i = 0; i < 8; i++) { const x = -60 + i * 17, d = (t * 0.3 + i * 40) % 420; c.beginPath(); c.moveTo(x, -440 + d); c.lineTo(x, -400 + d); c.stroke(); }
      G.ell(c, 0, -14, 140, 26); c.fillStyle = '#7fd0ff'; c.fill(); c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 6; i++) { G.circ(c, -60 + i * 24, -24 - Math.abs(Math.sin(t * 0.01 + i)) * 12, 8); c.fill(); }
      [[-150, -300], [150, -260], [-130, -120], [140, -80]].forEach(([x, y]) => { G.ell(c, x, y, 40, 18, x > 0 ? 0.4 : -0.4); c.fillStyle = '#4fa96a'; c.fill(); });
    } };
  F.vine = { w: 200, h: 460, tags: ['vine', 'swing'], slots: [[0, 20]],
    draw(c, t, f) {
      const a = on(f, 'swing', t) ? Math.sin(t * 0.008) * 0.5 : Math.sin(t * 0.002) * 0.06;
      c.save(); c.translate(0, -460); c.rotate(a);
      c.strokeStyle = '#4a8a3a'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(20, 200, 0, 360); c.stroke();
      for (let y = 40; y < 360; y += 50) { G.ell(c, (y % 100 ? 14 : -14), y, 18, 8, y % 100 ? 0.5 : -0.5); c.fillStyle = '#5cbf5a'; c.fill(); }
      c.restore();
      G.ell(c, 0, -460, 120, 30); c.fillStyle = '#3f8a5c'; c.fill();
    } };
  F.toucan = { w: 160, h: 260, tags: ['bird', 'animal'], slots: [[-100, 20], [100, 20]],
    draw(c, t, f) {
      G.rr(c, -10, -180, 20, 180, 6); G.fillO(c, '#a8733f', 2.5); G.rr(c, -60, -190, 120, 12, 6); G.fillO(c, '#a8733f', 2.5);
      const fly = on(f, 'fly', t) ? prog(f, 'fly', t, 2000) : -1;
      const x = fly >= 0 ? Math.sin(fly * PT.TAU) * 160 : 0, y = -200 - (fly >= 0 ? Math.sin(fly * Math.PI) * 120 : 0);
      c.save(); c.translate(x, y);
      G.ell(c, 0, -30, 26, 34); G.fillO(c, '#2a2a3a', 3); G.ell(c, 6, -42, 14, 14); c.fillStyle = '#ffffff'; c.fill(); c.fillStyle = '#2a1f35'; G.circ(c, 10, -46, 3); c.fill();
      c.beginPath(); c.moveTo(18, -48); c.quadraticCurveTo(70, -50, 76, -34); c.quadraticCurveTo(50, -30, 18, -34); c.closePath(); G._bb = { x0: 18, y0: -50, x1: 76, y1: -30 }; G.fillO(c, '#ff9a3d', 2.5); c.fillStyle = '#ffd23f'; c.fillRect(20, -48, 30, 6);
      if (fly >= 0) { G.ell(c, -18, -40 + Math.sin(t * 0.04) * 10, 30, 10, -0.5); c.fillStyle = '#2a2a3a'; c.fill(); }
      c.restore();
    } };
  /* ---------- 32 さばく ---------- */
  F.camel = { w: 260, h: 260, tags: ['animal', 'camel', 'ride'], slots: [[0, -150], [-170, 20]],
    draw(c, t, f) {
      const sw = on(f, 'walk', t) ? Math.sin(t * 0.012) * 0.2 : 0;
      for (const [x, a] of [[-70, sw], [-40, -sw], [50, sw], [80, -sw]]) { c.save(); c.translate(x, -110); c.rotate(a); G.rr(c, -9, 0, 18, 110, 6); G.fillO(c, '#d9a860', 2.5); c.restore(); }
      G.ell(c, 0, -130, 110, 46); G.fillO(c, '#e2b670', 3); G.ell(c, -40, -170, 40, 40); G.fillO(c, '#e2b670', 3); G.ell(c, 40, -170, 40, 40); G.fillO(c, '#e2b670', 3);
      G.rr(c, -46, -186, 92, 22, 8); G.fillO(c, '#e2433b', 2.5);
      c.save(); c.translate(100, -140); c.rotate(-0.4); G.rr(c, -12, -90, 26, 100, 12); G.fillO(c, '#e2b670', 3); c.restore();
      G.ell(c, 136, -228, 34, 22); G.fillO(c, '#e2b670', 3); c.fillStyle = '#2a1f35'; G.circ(c, 136, -236, 4); c.fill(); c.strokeStyle = '#2a1f35'; c.lineWidth = 2; c.beginPath(); c.moveTo(130, -242); c.lineTo(142, -240); c.stroke();
    } };
  F.pyramidF = { w: 460, h: 300, tags: ['pyramid', 'treasure'], slots: [[-280, 20], [280, 20]],
    draw(c, t, f) {
      G.poly(c, [-230, 0, 0, -290, 230, 0]); G.fillO(c, '#e9c46a', 4);
      c.strokeStyle = 'rgba(160,110,50,.4)'; c.lineWidth = 2; for (let y = -30; y > -280; y -= 30) { const w = 230 * (1 + y / 290); c.beginPath(); c.moveTo(-w, y); c.lineTo(w, y); c.stroke(); }
      G.poly(c, [0, -290, 230, 0, 120, 0]); c.fillStyle = 'rgba(160,110,50,.18)'; c.fill();
      const open = on(f, 'open', t);
      c.beginPath(); c.moveTo(-34, 0); c.lineTo(-34, -60); c.lineTo(0, -90); c.lineTo(34, -60); c.lineTo(34, 0); c.closePath(); c.fillStyle = open ? '#2a1f1a' : '#c9a050'; c.fill(); c.strokeStyle = '#a8803a'; c.lineWidth = 3; c.stroke();
      if (open) { c.fillStyle = 'rgba(255,230,120,.6)'; G.circ(c, 0, -40, 50); c.fill(); for (let i = 0; i < 6; i++) { G.circ(c, -20 + i * 8, -16 - (i % 2) * 8, 6); c.fillStyle = '#f5c242'; c.fill(); } }
      c.fillStyle = '#3a8acf'; G.ell(c, 0, -200, 14, 9); c.fill(); c.fillStyle = '#2a1f35'; G.circ(c, 0, -200, 4); c.fill();
    } };
  F.oasis = { w: 340, h: 360, tags: ['water', 'palm', 'tree'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      G.ell(c, 0, -26, 170, 34); c.fillStyle = '#7fd0ff'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-100, -26); c.quadraticCurveTo(-80, -32, -60, -26); c.stroke();
      c.strokeStyle = '#a8733f'; c.lineWidth = 18; c.lineCap = 'round'; c.beginPath(); c.moveTo(80, -20); c.quadraticCurveTo(110, -170, 60, -300); c.stroke();
      const sw = Math.sin(t * 0.002) * 0.1;
      for (let k = 0; k < 7; k++) { c.save(); c.translate(60, -300); c.rotate(-1.6 + k * 0.5 + sw); G.ell(c, 70, 0, 76, 16); G.fillO(c, '#4fa96a', 2.5); c.restore(); }
      if (!on(f, 'drop', t)) { for (const [x, y] of [[48, -286], [72, -280]]) { G.circ(c, x, y, 12); G.fillO(c, '#8a5a3a', 2); } }
    } };
  /* ---------- 33 きょうりゅうの くに ---------- */
  F.volcano = { w: 480, h: 360, tags: ['volcano', 'fire'], slots: [[-280, 20], [280, 20]],
    draw(c, t, f) {
      G.poly(c, [-240, 0, -60, -320, 60, -320, 240, 0]); G.fillO(c, '#8a6a5a', 4);
      c.fillStyle = '#ff6f3d'; c.beginPath(); c.moveTo(-60, -320); c.lineTo(-30, -250); c.lineTo(-10, -290); c.lineTo(20, -230); c.lineTo(40, -290); c.lineTo(60, -320); c.closePath(); c.fill();
      if (on(f, 'erupt', t)) { const k = prog(f, 'erupt', t, 2500); for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i - 7) * 0.12, d = k * 360 * (0.6 + (i % 3) * 0.2); G.circ(c, Math.cos(a) * d, -330 + Math.sin(a) * d + k * k * 300, 14 * (1 - k * 0.5)); c.fillStyle = ['#ff6f3d', '#ffd23f', '#ff9a3d'][i % 3]; c.fill(); } }
      else { for (let i = 0; i < 3; i++) { const k = ((t * 0.0003 + i * 0.33) % 1); G.circ(c, k * 40, -340 - k * 120, 24 + k * 30); c.fillStyle = `rgba(200,200,210,${0.7 * (1 - k)})`; c.fill(); } }
    } };
  F.dinoegg = { w: 200, h: 140, tags: ['egg', 'dino', 'nest'], slots: [[-130, 10], [130, 10]],
    draw(c, t, f) {
      G.ell(c, 0, -20, 100, 30); c.fillStyle = '#a8733f'; c.fill(); c.strokeStyle = '#7a5232'; c.lineWidth = 3; for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo(-90 + i * 20, -30); c.lineTo(-80 + i * 20, -6); c.stroke(); }
      const wob = Math.sin(t * 0.01) * (on(f, 'hatch', t) ? 0.25 : 0.04);
      [[-40, '#c9f0d0'], [40, '#ffe9a8'], [0, '#e8d6ff']].forEach(([x, col], i) => { c.save(); c.translate(x, -34); c.rotate(wob * (i % 2 ? 1 : -1)); G.ell(c, 0, -30, 30, 40); G.fillO(c, col, 3); c.fillStyle = 'rgba(120,90,60,.3)'; G.circ(c, -10, -40, 5); c.fill(); G.circ(c, 8, -20, 4); c.fill(); c.restore(); });
    } };
  F.bigdino = { w: 420, h: 360, tags: ['dino', 'animal'], slots: [[-260, 20], [260, 20]],
    draw(c, t, f) {
      const roar = on(f, 'roar', t), mo = roar ? 0.4 : 0.05;
      c.strokeStyle = '#5cae6a'; c.lineWidth = 46; c.lineCap = 'round'; c.beginPath(); c.moveTo(-60, -150); c.quadraticCurveTo(-200, -120, -210, -40); c.stroke();
      for (const x of [-40, 60]) { G.rr(c, x - 26, -120, 52, 120, 20); G.fillO(c, '#5cae6a', 3); }
      G.ell(c, 0, -170, 110, 80); G.fillO(c, '#6cc07a', 4); G.ell(c, 10, -150, 70, 50); c.fillStyle = '#c9f0b0'; c.fill();
      c.save(); c.translate(90, -250); G.rr(c, -20, -80, 70, 120, 30); G.fillO(c, '#6cc07a', 3); c.translate(30, -100); G.ell(c, 20, 0, 70, 40); G.fillO(c, '#6cc07a', 3); c.save(); c.translate(10, 20); c.rotate(mo); G.ell(c, 30, 4, 56, 16); G.fillO(c, '#5cae6a', 3); c.restore(); c.fillStyle = '#2a1f35'; G.circ(c, 30, -14, 7); c.fill(); c.fillStyle = '#fff'; G.circ(c, 32, -16, 2.5); c.fill(); c.restore();
      c.fillStyle = '#ffb04a'; for (let i = 0; i < 6; i++) G.poly(c, [-80 + i * 30, -240 + Math.abs(i - 2.5) * 6, -66 + i * 30, -270 + Math.abs(i - 2.5) * 6, -52 + i * 30, -240 + Math.abs(i - 2.5) * 6]), c.fill();
    } };
  /* ---------- 34 ロボット こうじょう ---------- */
  F.conveyor = { w: 560, h: 160, tags: ['machine', 'toy', 'conveyor'], slots: [[-320, 20], [320, 20]],
    draw(c, t, f) {
      for (const x of [-240, 0, 240]) { G.rr(c, x - 10, -80, 20, 80, 4); G.fillO(c, '#9aa3b8', 2); }
      G.rr(c, -280, -110, 560, 40, 20); G.fillO(c, '#5a6278', 3);
      const sp = on(f, 'run', t) ? 0.25 : 0.04; c.fillStyle = '#3a4050'; for (let x = -260 + ((t * sp) % 40); x < 270; x += 40) c.fillRect(x, -104, 16, 28);
      for (const x of [-260, 260]) { G.circ(c, x, -90, 20); G.fillO(c, '#c9ccd8', 2.5); }
      G.rr(c, -310, -230, 90, 130, 10); G.fillO(c, '#58b9f0', 3); G.rr(c, -294, -206, 58, 40, 6); c.fillStyle = on(f, 'run', t) && Math.floor(t / 200) % 2 ? '#ffd23f' : '#3a4050'; c.fill();
    } };
  F.robotarm = { w: 240, h: 360, tags: ['machine', 'robot'], slots: [[-150, 20], [150, 20]],
    draw(c, t, f) {
      G.rr(c, -70, -50, 140, 50, 10); G.fillO(c, '#ff9a3d', 3);
      const k = on(f, 'move', t) ? prog(f, 'move', t, 2000) : 0, a1 = -0.4 + Math.sin(k * PT.TAU) * 0.6, a2 = 1.0 - Math.sin(k * PT.TAU) * 0.8;
      c.save(); c.translate(0, -50); c.rotate(a1); G.rr(c, -16, -170, 32, 170, 14); G.fillO(c, '#ffb04a', 3); c.translate(0, -170); G.circ(c, 0, 0, 22); G.fillO(c, '#5a6278', 3); c.rotate(a2); G.rr(c, -12, -130, 24, 130, 12); G.fillO(c, '#ffb04a', 3); c.translate(0, -130);
      const open = 0.3 + Math.sin(t * 0.01) * 0.2; for (const s of [-1, 1]) { c.save(); c.rotate(s * open); G.rr(c, -6, -46, 12, 46, 5); G.fillO(c, '#9aa3b8', 2); c.restore(); }
      if (f.holding && PT.ITEMS[f.holding]) { c.save(); c.translate(0, -40); c.scale(0.5, 0.5); PT.ITEMS[f.holding].draw(c, t, {}); c.restore(); }
      c.restore();
    } };
  F.buttonpanel = { w: 200, h: 220, tags: ['machine', 'button'], slots: [[-130, 20], [130, 20]],
    draw(c, t, f) {
      G.rr(c, -90, -210, 180, 210, 14); G.fillO(c, '#c9ccd8', 4);
      G.rr(c, -70, -190, 140, 60, 8); c.fillStyle = '#2a3a4a'; c.fill(); c.strokeStyle = '#7fe08a'; c.lineWidth = 3; c.beginPath(); for (let x = -64; x < 64; x += 4) c.lineTo(x, -160 + Math.sin(x * 0.2 + t * 0.01) * (on(f, 'beep', t) ? 20 : 6)); c.stroke();
      [['#ff5d78', -44, -90], ['#ffd23f', 0, -90], ['#58b9f0', 44, -90], ['#7bd36a', -22, -40], ['#9b8cff', 22, -40]].forEach(([col, x, y], i) => { const lit = on(f, 'beep', t) && (Math.floor(t / 150) + i) % 2; G.circ(c, x, y, 16); G.fillO(c, lit ? '#ffffff' : col, 3); });
    } };
  /* ---------- 35 おもちゃの くに ---------- */
  F.jackbox = { w: 160, h: 300, tags: ['toy', 'box', 'surprise'], slots: [[-110, 20], [110, 20]],
    draw(c, t, f) {
      G.rr(c, -60, -120, 120, 120, 10); G.fillO(c, '#ff6f91', 3); c.fillStyle = '#ffd23f'; G.star(c, 0, -60, 26, 11); c.fill();
      const k = on(f, 'pop', t) ? Math.min(1, prog(f, 'pop', t, 2600) * 6) : 0;
      if (k > 0) { const h = 140 * PT.easeBack(k); c.strokeStyle = '#9aa3b8'; c.lineWidth = 6; c.beginPath(); for (let i = 0; i < 10; i++) { const y = -120 - (i / 10) * h; c.lineTo(i % 2 ? 16 : -16, y); } c.stroke(); c.save(); c.translate(0, -130 - h); c.rotate(Math.sin(t * 0.02) * 0.2); G.circ(c, 0, 0, 34); G.fillO(c, '#ffe0c0', 3); c.fillStyle = '#2a1f35'; G.circ(c, -11, -4, 4); c.fill(); G.circ(c, 11, -4, 4); c.fill(); c.strokeStyle = '#e2433b'; c.lineWidth = 4; c.beginPath(); c.arc(0, 8, 12, 0.2, Math.PI - 0.2); c.stroke(); G.circ(c, 0, 4, 6); c.fillStyle = '#e2433b'; c.fill(); G.poly(c, [-30, -20, -40, -60, -10, -30]); c.fillStyle = '#58b9f0'; c.fill(); G.poly(c, [30, -20, 40, -60, 10, -30]); c.fillStyle = '#ffd23f'; c.fill(); c.restore(); }
      else { G.rr(c, -64, -132, 128, 16, 6); G.fillO(c, '#ff8fb1', 3); }
      c.strokeStyle = '#9aa3b8'; c.lineWidth = 5; c.beginPath(); c.moveTo(60, -60); c.lineTo(84, -60); c.lineTo(84, -40); c.stroke();
    } };
  F.bigtop = { w: 200, h: 240, tags: ['toy', 'top', 'spin'], slots: [[-130, 20], [130, 20]],
    draw(c, t, f) {
      const sp = on(f, 'spin', t) ? 0.04 : 0.004, wob = on(f, 'spin', t) ? 0 : Math.sin(t * 0.003) * 0.1;
      c.save(); c.translate(0, -10); c.rotate(wob);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(-90, -110); c.quadraticCurveTo(0, -150, 90, -110); c.closePath(); G._bb = { x0: -90, y0: -150, x1: 90, y1: 0 }; G.fillO(c, '#58b9f0', 3);
      for (let i = 0; i < 6; i++) { const a = t * sp + i; c.fillStyle = ['#ff6f91', '#ffd23f', '#7bd36a'][i % 3]; const x = Math.sin(a) * 70; if (Math.cos(a) > 0) { G.ell(c, x, -100, 12, 14); c.fill(); } }
      G.rr(c, -8, -190, 16, 70, 6); G.fillO(c, '#ff6f91', 2.5);
      c.restore();
    } };
  F.toytrack = { w: 480, h: 160, tags: ['train', 'toy', 'track'], slots: [[-280, 20], [280, 20]],
    draw(c, t, f) {
      G.ell(c, 0, -60, 220, 56); c.strokeStyle = '#a8733f'; c.lineWidth = 16; c.stroke(); c.strokeStyle = '#d9a860'; c.lineWidth = 3; for (let i = 0; i < 24; i++) { const a = (i / 24) * PT.TAU; c.beginPath(); c.moveTo(Math.cos(a) * 208, -60 + Math.sin(a) * 46); c.lineTo(Math.cos(a) * 232, -60 + Math.sin(a) * 66); c.stroke(); }
      const sp = on(f, 'run', t) ? 0.003 : 0.0006;
      for (let k = 0; k < 3; k++) { const a = t * sp - k * 0.32; const x = Math.cos(a) * 220, y = -60 + Math.sin(a) * 56; c.save(); c.translate(x, y - 20); G.rr(c, -26, -24, 52, 34, 6); G.fillO(c, ['#e2433b', '#58b9f0', '#ffd23f'][k], 2.5); if (k === 0) { G.rr(c, -10, -44, 14, 22, 3); G.fillO(c, '#3a3550', 2); } for (const s of [-1, 1]) { G.circ(c, s * 14, 12, 7); c.fillStyle = '#3a3550'; c.fill(); } c.restore(); }
    } };
  /* ---------- 36 サーカス ---------- */
  F.circusball = { w: 200, h: 200, tags: ['ball', 'circus'], slots: [[0, -150], [-140, 20]],
    draw(c, t, f) {
      const r = on(f, 'roll', t) ? t * 0.01 : t * 0.001;
      c.save(); c.translate(on(f, 'roll', t) ? Math.sin(t * 0.004) * 40 : 0, -80); c.rotate(r); G.circ(c, 0, 0, 80); G.fillO(c, '#ffffff', 4);
      for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 80, (i / 6) * PT.TAU, ((i + 0.5) / 6) * PT.TAU); c.closePath(); c.fillStyle = ['#ff5d78', '#58b9f0', '#ffd23f'][i % 3]; c.fill(); }
      G.circ(c, 0, 0, 80); c.strokeStyle = PT.line('#ff5d78'); c.lineWidth = 3; c.stroke(); G.circ(c, 0, 0, 16); G.fillO(c, '#ffffff', 2); c.restore();
    } };
  F.trapeze = { w: 300, h: 480, tags: ['swing', 'circus'], slots: [[0, -300], [-180, 20]],
    draw(c, t, f) {
      G.rr(c, -150, -480, 300, 16, 6); G.fillO(c, '#9b6fd6', 3);
      const a = on(f, 'swing', t) ? Math.sin(t * 0.006) * 0.7 : Math.sin(t * 0.0015) * 0.1;
      c.save(); c.translate(0, -470); c.rotate(a); c.strokeStyle = '#c9a070'; c.lineWidth = 4; c.beginPath(); c.moveTo(-50, 0); c.lineTo(-50, 240); c.moveTo(50, 0); c.lineTo(50, 240); c.stroke(); G.rr(c, -60, 236, 120, 12, 6); G.fillO(c, '#ffd23f', 2.5); c.restore();
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; for (let x = -140; x <= 140; x += 20) { c.beginPath(); c.moveTo(x, -40); c.lineTo(x + 20, -10); c.moveTo(x + 20, -40); c.lineTo(x, -10); c.stroke(); }
    } };
  F.circuscannon = { w: 300, h: 260, tags: ['cannon', 'circus'], slots: [[-180, 20], [180, 20]],
    draw(c, t, f) {
      const k = on(f, 'fire', t) ? Math.sin(Math.min(1, prog(f, 'fire', t, 2600) * 5) * Math.PI) * 16 : 0;
      c.save(); c.translate(-k, -90); c.rotate(-0.7); G.rr(c, -80, -40, 200, 80, 30); G.fillO(c, '#e2433b', 4); c.fillStyle = '#ffd23f'; for (let x = -60; x < 110; x += 40) { G.star(c, x, 0, 14, 6); c.fill(); } G.ell(c, 120, 0, 12, 40); c.fillStyle = '#2a1f35'; c.fill(); c.restore();
      G.rr(c, -110, -50, 220, 50, 16); G.fillO(c, '#58b9f0', 3); for (const x of [-70, 70]) { G.circ(c, x, -6, 26); G.fillO(c, '#ffd23f', 3); }
    } };

  /* ================= ステージ ================= */
  const S = (o) => PT.STAGES.push(o);
  const stars = (c, r, n, y1) => B.stars(c, r, n, y1);
  S({ id: 'magicschool', num: 25, name: 'まほうの がっこう', bgm: 'night', floor: [590, 880], color: '#7e57c2', night: true,
    tools: ['spellbook', 'potion', 'potion2', 'crystalball', 'magichat', 'blackcat', 'owl', 'starwand', 'heartwand', 'moonstaff', 'magicbroom', 'cauldron'], rides: ['magicbroom', 'carpet', 'unicorn'],
    spawn: [['mimi', 600, 780], ['gaku', 820, 760], ['yume', 1020, 800], ['futan', 420, 800], ['nyan', 1240, 800]],
    fixtures: [['bigcauldron', 800, 700], ['broomrack', 280, 640], ['magicmirror', 1300, 640]], favs: () => PT.WITCH_ITEMS || [],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 600, [[0, '#2a2060'], [1, '#5a3a8a']]); c.fillRect(0, 0, W, 600); stars(c, r, 60, 300);
      for (const x of [160, 560, 1040, 1440]) { G.rr(c, x - 60, 120, 120, 300, 60); c.fillStyle = '#1a1a40'; c.fill(); c.strokeStyle = '#c9a032'; c.lineWidth = 8; c.stroke(); c.fillStyle = '#ffe066'; G.circ(c, x + 20, 190, 20); c.fill(); }
      c.fillStyle = 'rgba(255,236,140,.15)'; for (let i = 0; i < 8; i++) { G.circ(c, 100 + i * 200, 80, 30); c.fill(); }
      for (let i = 0; i < 6; i++) { const x = 300 + i * 200, y = 60 + (i % 2) * 40; c.strokeStyle = '#c9a032'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, y); c.stroke(); G.rr(c, x - 8, y, 16, 24, 4); G.fillO(c, '#fff8e8', 2); G.ell(c, x, y - 6, 5, 9); c.fillStyle = '#ffd23f'; c.fill(); }
      c.fillStyle = G.grad(c, 0, 590, 0, H, [[0, '#5a4a8a'], [1, '#3a2a6a']]); c.fillRect(0, 590, W, H - 590);
      c.strokeStyle = 'rgba(255,236,140,.25)'; c.lineWidth = 6; G.circ(c, 800, 780, 200); c.stroke(); G.star(c, 800, 780, 160, 64); c.stroke();
    } });
  S({ id: 'candyhouse', num: 26, name: 'おかしの いえ', bgm: 'fun', floor: [590, 880], color: '#ff8fb1',
    tools: ['cake', 'donut', 'cookie', 'candy', 'icecream', 'pudding', 'strawberry', 'pancake', 'juice', 'royalcake', 'candybag'], rides: ['carriage', 'unicorn', 'tricycle'],
    spawn: [['choco', 600, 780], ['moko', 820, 760], ['sakura', 1020, 800], ['pon', 420, 800], ['ricky', 1240, 820]],
    fixtures: [['gingerhouse', 760, 640], ['chocofountain', 260, 680], ['lollitree', 1340, 650]], favs: ['candy', 'cake', 'donut', 'cookie', 'icecream', 'chef'],
    bg(c, r) {
      B.sky(c, '#ffc9e0', '#fff4e8', 590);
      for (let i = 0; i < 7; i++) B.cloud(c, r() * W, 60 + r() * 200, 0.8 + r() * 0.5, '#ffffff');
      c.fillStyle = '#ffd1e3'; G.ell(c, 400, 590, 600, 140); c.fill(); c.fillStyle = '#ffe0a8'; G.ell(c, 1250, 590, 600, 160); c.fill();
      for (let i = 0; i < 8; i++) { const x = 60 + i * 210; c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.beginPath(); c.moveTo(x, 590); c.lineTo(x, 470); c.stroke(); G.circ(c, x, 450, 30); G.fillO(c, ['#ff8fb1', '#9fd8ff', '#ffe066', '#c9b2ff'][i % 4], 2.5); }
      c.fillStyle = G.grad(c, 0, 590, 0, H, [[0, '#e3a75a'], [1, '#c9844f']]); c.fillRect(0, 590, W, H - 590);
      c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.moveTo(0, 590); for (let x = 0; x <= W; x += 40) c.quadraticCurveTo(x + 20, 620 + (x % 80 ? 10 : 0), x + 40, 590); c.lineTo(W, 590); c.closePath(); c.fill();
      for (let i = 0; i < 40; i++) { G.ell(c, r() * W, 640 + r() * 240, 6, 3, r() * 3); c.fillStyle = ['#ff5d78', '#58b9f0', '#ffd23f', '#7bd36a'][i % 4]; c.fill(); }
    } });
  S({ id: 'halloween', num: 27, name: 'ハロウィン かぼちゃむら', bgm: 'night', floor: [590, 880], color: '#ff9a3d', night: true,
    tools: ['jackolantern', 'candybag', 'blackcat', 'owl', 'candy', 'cookie', 'flashlight', 'cauldron', 'blanket', 'potion'], rides: ['magicbroom', 'carriage'],
    spawn: [['pon', 600, 780], ['nyan', 820, 760], ['kon', 1020, 800], ['futan', 420, 800], ['mimi', 1240, 800]],
    fixtures: [['pumpkinhouse', 800, 650], ['ghostF', 300, 700], ['pumpkinpatch', 1300, 820]], favs: ['witchblack', 'witchdress', 'witchcape', 'jackolantern', 'candybag', 'blackcat'],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 600, [[0, '#2a1a4a'], [1, '#8a4a6a']]); c.fillRect(0, 0, W, 600); stars(c, r, 50, 300);
      c.fillStyle = '#fff3b0'; G.circ(c, 1300, 160, 80); c.fill(); c.fillStyle = 'rgba(42,26,74,.25)'; G.circ(c, 1280, 140, 18); c.fill();
      c.fillStyle = '#2a1a3a'; for (let i = 0; i < 8; i++) { const x = r() * W, y = 100 + r() * 200; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 14, y - 12, x - 24, y + 2); c.quadraticCurveTo(x - 12, y - 2, x, y + 6); c.quadraticCurveTo(x + 12, y - 2, x + 24, y + 2); c.quadraticCurveTo(x + 14, y - 12, x, y); c.fill(); }
      c.fillStyle = '#3a2a4a'; G.ell(c, 400, 600, 600, 120); c.fill(); G.ell(c, 1250, 600, 600, 140); c.fill();
      for (let i = 0; i < 6; i++) { const x = 80 + i * 280; c.strokeStyle = '#3a2a3a'; c.lineWidth = 14; c.beginPath(); c.moveTo(x, 600); c.lineTo(x, 430); c.moveTo(x, 480); c.lineTo(x - 50, 420); c.moveTo(x, 460); c.lineTo(x + 60, 410); c.stroke(); }
      c.fillStyle = G.grad(c, 0, 590, 0, H, [[0, '#5a4a3a'], [1, '#3a2a2a']]); c.fillRect(0, 590, W, H - 590);
      c.fillStyle = 'rgba(255,170,90,.25)'; for (let i = 0; i < 10; i++) { G.circ(c, r() * W, 640 + r() * 240, 30 + r() * 30); c.fill(); }
    } });
  S({ id: 'xmas', num: 28, name: 'クリスマスの まち', bgm: 'title', floor: [590, 880], color: '#43a047', night: true,
    tools: ['present', 'santa', 'cake', 'cookie', 'juice', 'teddy', 'snow', 'snowman', 'blanket', 'musicbox', 'star'], rides: ['train', 'carriage', 'tricycle'],
    spawn: [['lulu', 600, 780], ['mimi', 820, 760], ['papa', 1020, 800], ['mama', 1200, 820], ['ricky', 420, 820], ['jiji', 1380, 800]],
    fixtures: [['xmastree', 780, 660], ['sleigh', 300, 760], ['fireplace', 1320, 640]], favs: ['santa', 'present', 'snow', 'musicbox', 'cookie'],
    ambient: (c, t) => { c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 50; i++) { const x = ((i * 137 + t * 0.02) % (W + 40)) - 20, y = ((i * 89 + t * 0.04 * (1 + (i % 3) * 0.3)) % (H + 20)) - 10; G.circ(c, x + Math.sin(t * 0.002 + i) * 8, y, 2 + (i % 3)); c.fill(); } },
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 590, [[0, '#1a2a5a'], [1, '#4a5a9a']]); c.fillRect(0, 0, W, 590); stars(c, r, 50, 300);
      for (let i = 0; i < 6; i++) { const x = i * 290 - 20, w = 200, h = 200 + (i % 3) * 40; B.house(c, x, 580, w, h, ['#fff1dc', '#e3f1ff', '#ffe3ec'][i % 3], ['#e2433b', '#3f8a5c', '#4c6fd6'][i % 3]); c.fillStyle = '#ffffff'; G.ell(c, x + w / 2, 580 - h - 4, w * 0.6, 14); c.fill(); }
      B.lanterns(c, 0, 80, 800, 100, 50); B.lanterns(c, 800, 100, 1600, 80, 50);
      c.fillStyle = G.grad(c, 0, 580, 0, H, [[0, '#ffffff'], [1, '#e3eefb']]); c.fillRect(0, 580, W, H - 580);
    } });
  S({ id: 'ninja', num: 29, name: 'にんじゃ やしき', bgm: 'fest', floor: [590, 880], color: '#5d4037',
    tools: ['box', 'blanket', 'flashlight', 'onigiri', 'book', 'bag', 'mask', 'drum', 'pinwheel', 'kite'], rides: ['horse', 'tricycle'],
    spawn: [['kon', 600, 780], ['gaku', 820, 760], ['yuto', 1020, 800], ['pon', 420, 800], ['jiji', 1240, 800]],
    fixtures: [['spinwall', 300, 640], ['target', 820, 650], ['bellrope', 1320, 640]], favs: ['mask', 'drum', 'pinwheel', 'onigiri'],
    bg(c, r) {
      B.wallpaper(c, 600, '#f6ecd6', '#efe2c4');
      for (let x = 0; x < W; x += 200) { G.rr(c, x, 80, 14, 520, 2); G.fillO(c, '#8a5a3a', 2); }
      G.rr(c, -10, 60, W + 20, 30, 4); G.fillO(c, '#8a5a3a', 3);
      for (let i = 0; i < 3; i++) { const x = 520 + i * 200; G.rr(c, x, 140, 180, 220, 4); c.fillStyle = '#fff8e8'; c.fill(); c.strokeStyle = '#8a5a3a'; c.lineWidth = 5; c.stroke(); c.lineWidth = 2; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x + k * 45, 140); c.lineTo(x + k * 45, 360); c.stroke(); } }
      c.save(); c.translate(1240, 240); G.circ(c, 0, 0, 70); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#2a1f35'; c.lineWidth = 3; c.stroke(); c.fillStyle = '#2a1f35'; c.font = `900 60px ${PT.FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('忍', 0, 4); c.restore();
      c.fillStyle = '#d9c48a'; c.fillRect(0, 600, W, H - 600); c.strokeStyle = '#b9a46a'; c.lineWidth = 3; for (let x = 0; x < W; x += 160) for (let y = 600; y < H; y += 80) { c.strokeRect(x + ((y / 80) % 2) * 80, y, 160, 80); }
    } });
  S({ id: 'pirate', num: 30, name: 'かいぞくせん', bgm: 'beach', floor: [600, 880], color: '#3e2723',
    tools: ['chest', 'pirate', 'bucket', 'fishingrod', 'shell', 'banana', 'onigiri', 'flashlight', 'camera', 'duck'], rides: ['boat', 'swimring'],
    spawn: [['pon', 600, 780], ['lulu', 820, 760], ['papa', 1020, 800], ['yuto', 420, 800], ['penta', 1240, 800]],
    fixtures: [['mast', 800, 640], ['shipwheel', 1340, 680], ['cannon', 280, 720]], favs: ['pirate', 'chest', 'fishingrod', 'shell'],
    ambient: (c, t) => { c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 6; i++) { const x = (i * 300 + t * 0.03) % (W + 200) - 100; G.ell(c, x, 470 + Math.sin(t * 0.002 + i) * 6, 30, 4); c.fill(); } },
    bg(c, r) {
      B.sky(c, '#8fd3ff', '#eaf8ff', 470); B.cloud(c, 200, 100, 1); B.cloud(c, 1100, 80, 0.9);
      c.fillStyle = G.grad(c, 0, 440, 0, 600, [[0, '#3fa7e8'], [1, '#2a7ac0']]); c.fillRect(0, 440, W, 160);
      c.fillStyle = '#7cc56a'; G.ell(c, 1300, 446, 120, 22); c.fill(); B.pine(c, 1300, 440, 0.4, '#3f8a5c');
      G.rr(c, -20, 520, W + 40, 90, 10); G.fillO(c, '#a8733f', 4); c.fillStyle = '#8a5a3a'; for (let x = 20; x < W; x += 100) { G.rr(c, x, 534, 40, 30, 6); c.fill(); }
      c.fillStyle = '#c99a64'; c.fillRect(0, 600, W, H - 600); c.strokeStyle = '#a8733f'; c.lineWidth = 3; for (let y = 600; y < H; y += 46) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    } });
  S({ id: 'jungle', num: 31, name: 'どきどき ジャングル', bgm: 'camp', floor: [590, 880], color: '#2e7d32',
    tools: ['banana', 'watermelon', 'explorer', 'bugnet', 'magnifier', 'camera', 'bag', 'flashlight', 'juice', 'kite'], rides: ['boat', 'tent', 'car'],
    spawn: [['pon', 600, 780], ['moko', 820, 760], ['kon', 1020, 800], ['yuto', 420, 800], ['lulu', 1240, 800]],
    fixtures: [['waterfall', 1240, 640], ['vine', 600, 640], ['toucan', 260, 680]], favs: ['explorer', 'banana', 'bugnet', 'magnifier'],
    bg(c, r) {
      B.sky(c, '#7fd8a0', '#d8f5c0', 590);
      for (let i = 0; i < 14; i++) { const x = r() * W, y = 590; B.tree(c, x, y, 0.9 + r() * 0.7, ['#3f8a5c', '#4fa96a', '#2e7d4a'][i % 3], '#6a4a2a'); }
      c.fillStyle = 'rgba(255,255,220,.2)'; for (let i = 0; i < 5; i++) { c.save(); c.translate(150 + i * 320, 0); c.rotate(0.2); c.fillRect(0, -40, 60, 680); c.restore(); }
      for (let i = 0; i < 12; i++) { const x = r() * W; c.strokeStyle = '#3f7a3a'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + 30, 150, x - 10, 200 + r() * 150); c.stroke(); }
      B.grass(c, 586, '#6cbf6a', '#4fa056'); B.tufts(c, r, 600, 60, '#3f8a4a');
      for (let i = 0; i < 12; i++) { const x = r() * W, y = 620 + r() * 240; G.ell(c, x, y, 40, 14, r()); c.fillStyle = '#3f8a4a'; c.fill(); }
    } });
  S({ id: 'desert', num: 32, name: 'さばくの オアシス', bgm: 'fest', floor: [590, 880], color: '#f9a825',
    tools: ['watermelon', 'juice', 'parasol', 'sunglasses', 'explorer', 'bucket', 'chest', 'magnifier', 'camera', 'carpet'], rides: ['carpet', 'car', 'horse'],
    spawn: [['lulu', 600, 780], ['nyan', 820, 760], ['kon', 1020, 800], ['moko', 420, 800], ['jiji', 1240, 800]],
    fixtures: [['camel', 300, 700], ['pyramidF', 840, 620], ['oasis', 1340, 720]], favs: ['carpet', 'explorer', 'sunglasses', 'chest'],
    bg(c, r) {
      B.sky(c, '#7fc8ff', '#fff3d6', 560); c.fillStyle = 'rgba(255,240,160,.9)'; G.circ(c, 1400, 110, 64); c.fill();
      c.fillStyle = '#f2d08a'; for (let i = 0; i < 4; i++) { G.ell(c, i * 500, 580, 420, 110); c.fill(); }
      c.fillStyle = '#e9c46a'; G.poly(c, [200, 560, 300, 420, 400, 560]); c.fill(); G.poly(c, [1000, 560, 1120, 400, 1240, 560]); c.fill();
      c.fillStyle = G.grad(c, 0, 570, 0, H, [[0, '#f8e3b0'], [1, '#eac88a']]); c.fillRect(0, 570, W, H - 570);
      c.strokeStyle = 'rgba(200,150,90,.35)'; c.lineWidth = 3; for (let y = 620; y < H; y += 40) { c.beginPath(); for (let x = 0; x <= W; x += 40) c.lineTo(x, y + Math.sin(x * 0.01 + y) * 8); c.stroke(); }
    } });
  S({ id: 'dinoland', num: 33, name: 'きょうりゅうの くに', bgm: 'camp', floor: [590, 880], color: '#558b2f',
    tools: ['dino', 'egg', 'explorer', 'magnifier', 'camera', 'bag', 'banana', 'watermelon', 'flashlight', 'bucket'], rides: ['car', 'tent', 'horse'],
    spawn: [['gaku', 600, 780], ['yuto', 820, 760], ['pon', 1020, 800], ['kon', 420, 800], ['lulu', 1240, 800]],
    fixtures: [['volcano', 1240, 600], ['dinoegg', 300, 780], ['bigdino', 700, 680]], favs: ['dino', 'egg', 'explorer', 'magnifier'],
    bg(c, r) {
      B.sky(c, '#ffc890', '#fff0d0', 590);
      for (let i = 0; i < 5; i++) { c.fillStyle = ['#8aa86a', '#7a9a5a'][i % 2]; G.ell(c, i * 380, 590, 320, 140); c.fill(); }
      for (let i = 0; i < 6; i++) { const x = 100 + i * 280 + r() * 60; c.strokeStyle = '#7a5a3a'; c.lineWidth = 14; c.beginPath(); c.moveTo(x, 590); c.quadraticCurveTo(x + 20, 480, x - 10, 400); c.stroke(); for (let k = 0; k < 6; k++) { c.save(); c.translate(x - 10, 400); c.rotate(-1.6 + k * 0.55); G.ell(c, 50, 0, 56, 14); c.fillStyle = '#4f8a3a'; c.fill(); c.restore(); } }
      c.fillStyle = 'rgba(80,60,90,.4)'; for (const [x, y] of [[300, 160], [420, 200]]) { c.save(); c.translate(x, y); c.beginPath(); c.moveTo(-40, 0); c.lineTo(0, -10); c.lineTo(40, 0); c.lineTo(0, 6); c.closePath(); c.fill(); c.restore(); }
      B.grass(c, 586, '#a6c98a', '#8ab06a'); B.tufts(c, r, 600, 50, '#6a904a');
      for (let i = 0; i < 6; i++) { G.ell(c, r() * W, 640 + r() * 220, 40, 16); c.fillStyle = 'rgba(140,110,80,.4)'; c.fill(); }
    } });
  S({ id: 'robotfactory', num: 34, name: 'ロボット こうじょう', bgm: 'shop', floor: [600, 880], color: '#607d8b',
    tools: ['robottoy', 'box', 'blocks', 'ball', 'teddy', 'car', 'train', 'phone', 'helmet', 'robotsuit'], rides: ['car', 'train', 'tricycle'],
    spawn: [['gaku', 600, 780], ['lulu', 820, 760], ['yuto', 1020, 800], ['papa', 420, 800], ['penta', 1240, 800]],
    fixtures: [['conveyor', 760, 700], ['robotarm', 1320, 680], ['buttonpanel', 220, 680]], favs: ['robottoy', 'blocks', 'box', 'helmet'],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 600, [[0, '#cfd8e6'], [1, '#e8eef5']]); c.fillRect(0, 0, W, 600);
      for (let i = 0; i < 4; i++) { const x = 100 + i * 400; G.circ(c, x, 220, 80); c.strokeStyle = '#9aa3b8'; c.lineWidth = 16; c.stroke(); c.save(); c.translate(x, 220); for (let k = 0; k < 8; k++) { c.rotate(PT.TAU / 8); c.fillStyle = '#9aa3b8'; c.fillRect(-10, -100, 20, 24); } c.restore(); }
      c.strokeStyle = '#ffd23f'; c.lineWidth = 10; c.beginPath(); c.moveTo(0, 80); c.lineTo(W, 80); c.stroke(); c.strokeStyle = '#3a3550'; c.setLineDash([30, 30]); c.stroke(); c.setLineDash([]);
      G.rr(c, 580, 200, 440, 70, 14); G.fillO(c, '#58b9f0', 3); c.fillStyle = '#ffffff'; c.font = `900 40px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('ロボット こうじょう', 800, 248);
      c.fillStyle = '#9aa3b8'; c.fillRect(0, 600, W, H - 600); c.fillStyle = '#c8ccd8'; for (let x = 0; x < W; x += 80) for (let y = 620; y < H; y += 80) c.fillRect(x + 4, y + 4, 72, 72);
    } });
  S({ id: 'toyland', num: 35, name: 'おもちゃの くに', bgm: 'fun', floor: [590, 880], color: '#ec407a',
    tools: ['teddy', 'bunny', 'blocks', 'ball', 'robottoy', 'train', 'dino', 'panda', 'elephant', 'penguin', 'crayons', 'kite'], rides: ['train', 'horse', 'car', 'trampoline'],
    spawn: [['choco', 600, 780], ['pyoko', 820, 760], ['ricky', 1020, 800], ['sakura', 420, 800], ['yuto', 1240, 800]],
    fixtures: [['jackbox', 300, 680], ['bigtop', 1320, 700], ['toytrack', 800, 800]], favs: ['blocks', 'teddy', 'robottoy', 'train'],
    bg(c, r) {
      B.wallpaper(c, 590, '#e3f1ff', '#d3e8ff');
      for (let i = 0; i < 6; i++) { const x = 80 + i * 270; G.rr(c, x, 140, 70, 70, 8); G.fillO(c, ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a', '#9b8cff', '#ff9a3d'][i], 3); c.fillStyle = '#fff'; c.font = `900 40px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('あいうえおか'[i], x + 35, 190); }
      B.bunting(c, 0, 60, 1600, 60, 60);
      for (let i = 0; i < 4; i++) { const x = 200 + i * 380; G.rr(c, x, 300, 200, 18, 6); G.fillO(c, '#c99a64', 2.5); G.circ(c, x + 40, 280, 20); G.fillO(c, '#ff6f91', 2); G.rr(c, x + 80, 252, 30, 48, 6); G.fillO(c, '#58b9f0', 2); G.star(c, x + 150, 276, 22, 10); G.fillO(c, '#ffd23f', 2); }
      B.floorWood(c, 590, '#f2c98a');
      c.fillStyle = 'rgba(255,255,255,.3)'; for (let x = 0; x < W; x += 100) for (let y = 620; y < H; y += 100) if (((x + y) / 100) % 2) c.fillRect(x, y, 100, 100);
    } });
  S({ id: 'circus', num: 36, name: 'わくわく サーカス', bgm: 'fun', floor: [590, 880], color: '#d32f2f',
    tools: ['balloon', 'ball', 'confetti', 'drum', 'trumpet', 'icecream', 'candy', 'partyhat', 'juice', 'musicbox'], rides: ['trampoline', 'horse', 'unicorn', 'tricycle'],
    spawn: [['pon', 600, 780], ['moko', 820, 760], ['choco', 1020, 800], ['ricky', 420, 800], ['papa', 1240, 800]],
    fixtures: [['circusball', 260, 760], ['trapeze', 800, 600], ['circuscannon', 1320, 720]], favs: ['balloon', 'drum', 'trumpet', 'partyhat', 'confetti'],
    bg(c, r) {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, 600);
      for (let i = 0; i < 16; i++) { c.beginPath(); c.moveTo(800, -60); c.lineTo(i * 100 - 50, 600); c.lineTo(i * 100 + 50, 600); c.closePath(); c.fillStyle = i % 2 ? '#e2433b' : '#ffffff'; c.fill(); }
      c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(0, 0, W, 600);
      for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(255,240,160,.25)'; c.beginPath(); c.moveTo(200 + i * 400, 0); c.lineTo(100 + i * 400, 600); c.lineTo(300 + i * 400, 600); c.closePath(); c.fill(); }
      B.bunting(c, 0, 50, 1600, 50, 70);
      c.fillStyle = '#c0303a'; c.fillRect(0, 590, W, H - 590); c.fillStyle = '#e8b04a'; G.ell(c, 800, 760, 700, 150); c.fill(); c.strokeStyle = '#ffd23f'; c.lineWidth = 10; c.stroke();
    } });
  PT.STAGES.forEach((s) => { if (typeof s.favs === 'function') { const f = s.favs; Object.defineProperty(s, 'favs', { get: () => f() || [], set() {}, configurable: true }); } });
})();
