/* ふえた ステージ（61〜72）：まちの おしごと */
'use strict';
(() => {
  const G = PT.G, B = PT.BG, F = PT.FIX, W = PT.W, H = PT.H;
  const on = (f, k, t) => f[k] && t < f[k];
  const prog = (f, k, t, ms) => (on(f, k, t) ? 1 - (f[k] - t) / ms : -1);
  const P = (c) => { G._bb = null; c.beginPath(); };
  const txt = (c, s, x, y, px, col, stroke) => {
    c.font = `900 ${px}px ${PT.FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = px / 5; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = col; c.fillText(s, x, y);
  };
  const flower = (c, x, y, r, col, mid = '#ffd23f') => {
    for (let i = 0; i < 5; i++) { const a = (i / 5) * PT.TAU; G.circ(c, x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7, r * 0.55); c.fillStyle = col; c.fill(); }
    c.strokeStyle = PT.line(col); c.lineWidth = 1.5; G.circ(c, x, y, r * 0.42); c.fillStyle = mid; c.fill(); c.stroke();
  };
  const glow = (c, x, y, r, col) => { c.fillStyle = G.rgrad(c, x, y, 1, r, [[0, col], [1, 'rgba(255,255,255,0)']]); G.circ(c, x, y, r); c.fill(); };
  const RB = ['#ff6f91', '#ff9f4a', '#ffd23f', '#7bd36a', '#58b9f0', '#7c83e8', '#c38be0', '#ff8fd0'];

  /* ---------- 61 としょかん ---------- */
  const popup = (c, kind, t) => {
    if (kind === 0) { // おしろ
      for (const [x, h] of [[-50, 110], [0, 150], [50, 110]]) { G.rr(c, x - 20, -h, 40, h, 4); G.fillO(c, '#ffb3d1', 2.5); G.poly(c, [x - 26, -h, x + 26, -h, x, -h - 40]); G.fillO(c, '#7c9cf0', 2.5); }
      G.rr(c, -14, -50, 28, 50, 14); G.fillO(c, '#b07a4a', 2); c.fillStyle = '#ff6f91'; P(c); c.moveTo(0, -190); c.lineTo(0, -214); c.lineTo(22, -206); c.lineTo(0, -198); c.fill();
    } else if (kind === 1) { // りんごの き
      G.rr(c, -12, -80, 24, 80, 6); G.fillO(c, '#b07a4a', 2.5); G.circ(c, 0, -120, 66); G.fillO(c, '#7bd36a', 3);
      for (const [x, y] of [[-30, -130], [26, -100], [10, -150], [-14, -96]]) { G.circ(c, x, y, 11); G.fillO(c, '#ff5a5a', 2); }
    } else if (kind === 2) { // きょうりゅう
      G.ell(c, 0, -50, 70, 40); G.fillO(c, '#8fd36a', 3); G.rr(c, 30, -150, 30, 100, 14); G.fillO(c, '#8fd36a', 3); G.ell(c, 56, -150, 34, 22); G.fillO(c, '#8fd36a', 3);
      c.fillStyle = '#2a1f35'; G.circ(c, 66, -156, 4); c.fill(); for (let i = 0; i < 4; i++) { G.poly(c, [-50 + i * 26, -84 + Math.abs(i - 1.5) * 4, -38 + i * 26, -108 + Math.abs(i - 1.5) * 4, -26 + i * 26, -84 + Math.abs(i - 1.5) * 4]); G.fillO(c, '#ffd23f', 2); }
    } else { // にじ と くも
      for (let i = 0; i < 6; i++) { c.strokeStyle = RB[i]; c.lineWidth = 12; c.beginPath(); c.arc(0, 0, 130 - i * 12, Math.PI, PT.TAU); c.stroke(); }
      for (const s of [-1, 1]) { G.circ(c, s * 100, -10, 26); G.fillO(c, '#ffffff', 2.5); G.circ(c, s * 130, -4, 20); G.fillO(c, '#ffffff', 2.5); }
    }
    for (let i = 0; i < 4; i++) { const a = t * 0.004 + i * 1.6; G.star(c, Math.cos(a) * 120, -110 + Math.sin(a) * 60, 9, 4); c.fillStyle = '#ffe066'; c.fill(); }
  };
  F.s6_bigbook = { w: 320, h: 360, tags: ['book', 'read', 'library'], slots: [[-200, 10], [200, 10]],
    draw(c, t, f) {
      G.poly(c, [-60, 0, 60, 0, 34, -130, -34, -130]); G.fillO(c, '#b07a4a', 3);
      G.rr(c, -150, -150, 300, 24, 10); G.fillO(c, '#c98e5a', 3);
      const k = prog(f, 'open', t, 3400);
      if (k < 0) {
        const b = Math.sin(t * 0.003) * 3;
        G.rr(c, -100, -340 + b, 200, 190, 14); G.fillO(c, '#e2533b', 4); G.rr(c, -100, -340 + b, 22, 190, 8); G.fillO(c, '#b8352a', 2);
        G.rr(c, -56, -310 + b, 130, 90, 12); G.fillO(c, '#fff4d6', 2.5); G.star(c, 9, -270 + b, 26, 12); G.fillO(c, '#ffd23f', 2);
        txt(c, 'えほん', 9, -190 + b, 26, '#ffffff');
      } else {
        const o = Math.min(1, k * 5);
        for (const s of [-1, 1]) { P(c); c.moveTo(0, -160); c.quadraticCurveTo(s * 80 * o, -190, s * 165 * o, -170); c.lineTo(s * 165 * o, -300); c.quadraticCurveTo(s * 80 * o, -320, 0, -296); c.closePath(); G.fillO(c, '#fffaf0', 3); c.strokeStyle = '#d9cbb0'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(s * 30 * o, -270 + i * 26); c.lineTo(s * 140 * o, -264 + i * 26); c.stroke(); } }
        const s = k < 0.85 ? PT.easeBack(Math.min(1, Math.max(0, (k - 0.12) * 4))) : (1 - k) / 0.15;
        if (s > 0.02) { c.save(); c.translate(0, -240); c.scale(s, s); popup(c, (f.kind || 0) % 4, t); c.restore(); }
      }
    } };
  F.s6_ladder = { w: 300, h: 430, tags: ['book', 'shelf', 'ladder', 'library'], slots: [[-210, 10], [210, 10]],
    draw(c, t, f) {
      G.rr(c, -130, -420, 260, 420, 10); G.fillO(c, '#a8693d', 4); c.fillStyle = '#6e4226'; c.fillRect(-116, -406, 232, 392);
      const fly = prog(f, 'fly', t, 2800);
      for (let i = 0; i < 4; i++) {
        const y = -406 + i * 98; c.fillStyle = '#c98e5a'; c.fillRect(-116, y + 90, 232, 10);
        let x = -112;
        for (let j = 0; x < 106; j++) { const w = 18 + ((i * 7 + j * 3) % 5) * 3, hh = 58 + ((i + j * 5) % 4) * 8; if (!(fly >= 0 && i === 0 && j < 3)) { G.rr(c, x, y + 90 - hh, w - 2, hh, 3); G.fillO(c, RB[(i * 3 + j) % 8], 1.5); c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(x + 3, y + 90 - hh + 10, w - 8, 4); } x += w; }
      }
      const sl = on(f, 'slide', t) ? Math.sin(prog(f, 'slide', t, 1800) * PT.TAU) * 80 : 0;
      c.strokeStyle = '#e7b56a'; c.lineWidth = 8; c.lineCap = 'round';
      c.beginPath(); c.moveTo(60 + sl, 0); c.lineTo(90 + sl, -400); c.moveTo(120 + sl, 0); c.lineTo(150 + sl, -400); c.stroke();
      c.lineWidth = 6; for (let y = -40; y > -400; y -= 46) { const d = (-y / 400) * 30; c.beginPath(); c.moveTo(60 + sl + d, y); c.lineTo(120 + sl + d, y); c.stroke(); }
      G.circ(c, 90 + sl, -404, 7); G.fillO(c, '#9aa3b8', 2); G.circ(c, 150 + sl, -404, 7); G.fillO(c, '#9aa3b8', 2);
      if (fly >= 0) for (let i = 0; i < 3; i++) {
        const x = -90 + i * 30 + fly * (180 + i * 90) * (i === 1 ? -1 : 1), y = -380 - Math.sin(fly * Math.PI) * (160 + i * 40) + Math.sin(fly * 8 + i) * 20, a = Math.sin(t * 0.03 + i) * 0.7;
        c.save(); c.translate(x, y);
        for (const s of [-1, 1]) { c.save(); c.rotate(s * a); G.rr(c, s > 0 ? 0 : -30, -18, 30, 36, 4); G.fillO(c, RB[i * 2], 2); c.restore(); }
        c.restore();
      }
    } };
  F.s6_storychair = { w: 360, h: 320, tags: ['chair', 'seat', 'book', 'library'], slots: [[-220, 20], [220, 20]],
    draw(c, t, f) {
      const st = on(f, 'story', t);
      c.strokeStyle = '#8a7a6a'; c.lineWidth = 6; c.beginPath(); c.moveTo(150, 0); c.lineTo(150, -280); c.stroke(); G.ell(c, 150, -2, 30, 8); G.fillO(c, '#8a7a6a', 2);
      if (st) glow(c, 150, -270, 150, 'rgba(255,230,140,.55)');
      G.poly(c, [110, -260, 190, -260, 175, -310, 125, -310]); G.fillO(c, st ? '#ffe066' : '#f6d29a', 3);
      G.rr(c, -90, -240, 180, 170, 46); G.fillO(c, '#7bc68a', 4);
      c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 3; i++) { G.circ(c, -40 + i * 40, -190, 8); c.fill(); }
      for (const x of [-80, 60]) { G.rr(c, x, -20, 20, 20, 4); G.fillO(c, '#8a5a3a', 2); }
      G.rr(c, -100, -90, 200, 70, 20); G.fillO(c, '#6ab87a', 4);
      for (const x of [-130, 86]) { G.rr(c, x, -150, 44, 120, 22); G.fillO(c, '#5aa86a', 3); }
      if (st) for (let i = 0; i < 4; i++) { const k = (t * 0.0006 + i * 0.25) % 1; const x = -60 + i * 40 + Math.sin(k * 6 + i) * 14, y = -260 - k * 120; c.globalAlpha = 1 - k; if (i % 2) { G.heart(c, x, y, 14); c.fillStyle = '#ff8fb1'; c.fill(); } else { G.star(c, x, y, 13, 6); c.fillStyle = '#ffd23f'; c.fill(); } c.globalAlpha = 1; }
    } };

  /* ---------- 62 おえかき アトリエ ---------- */
  const PICS = [
    (c) => { c.fillStyle = '#bfe6ff'; c.fillRect(-80, -320, 160, 150); c.fillStyle = '#7bd36a'; P(c); c.moveTo(-80, -170); c.lineTo(-30, -240); c.lineTo(10, -200); c.lineTo(50, -250); c.lineTo(80, -200); c.lineTo(80, -170); c.fill(); G.circ(c, 40, -290, 18); c.fillStyle = '#ffcf3a'; c.fill(); },
    (c) => { c.fillStyle = '#fff3f8'; c.fillRect(-80, -320, 160, 150); c.strokeStyle = '#5aa84a'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -170); c.lineTo(0, -240); c.stroke(); flower(c, 0, -260, 34, '#ff7fa8'); G.ell(c, 18, -200, 16, 7, -0.5); c.fillStyle = '#7bd36a'; c.fill(); },
    (c) => { c.fillStyle = '#fff6dc'; c.fillRect(-80, -320, 160, 150); c.fillStyle = '#ffa94d'; G.poly(c, [-44, -280, -30, -310, -14, -282]); c.fill(); G.poly(c, [44, -280, 30, -310, 14, -282]); c.fill(); G.circ(c, 0, -245, 46); c.fill(); c.fillStyle = '#2a1f35'; G.circ(c, -16, -252, 5); c.fill(); G.circ(c, 16, -252, 5); c.fill(); c.strokeStyle = '#2a1f35'; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, -234); c.quadraticCurveTo(0, -228, 6, -234); c.stroke(); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 20, -238); c.lineTo(s * 56, -244); c.moveTo(s * 20, -232); c.lineTo(s * 56, -228); c.stroke(); } },
    (c) => { c.fillStyle = '#e8f6ff'; c.fillRect(-80, -320, 160, 150); for (let i = 0; i < 6; i++) { c.strokeStyle = RB[i]; c.lineWidth = 9; c.beginPath(); c.arc(0, -180, 70 - i * 9, Math.PI, PT.TAU); c.stroke(); } },
  ];
  F.s6_easel = { w: 240, h: 360, tags: ['art', 'paint', 'easel'], slots: [[-180, 10], [180, 10]],
    draw(c, t, f) {
      c.strokeStyle = '#b07a4a'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(-70, 0); c.lineTo(0, -350); c.lineTo(70, 0); c.moveTo(0, -350); c.lineTo(0, -10); c.stroke();
      G.rr(c, -96, -334, 192, 178, 6); G.fillO(c, '#ffffff', 4);
      const k = prog(f, 'paint', t, 1600), pic = PICS[(f.pic || 0) % PICS.length];
      c.save(); c.beginPath(); c.rect(-80, -320, k >= 0 ? 160 * k : 160, 150); c.clip(); pic(c); c.restore();
      if (k >= 0) { const bx = -80 + 160 * k, by = -245 + Math.sin(t * 0.03) * 55; c.save(); c.translate(bx, by); c.rotate(0.6); G.rr(c, -4, -60, 8, 50, 3); G.fillO(c, '#e7b56a', 2); G.rr(c, -6, -14, 12, 18, 4); G.fillO(c, RB[(f.pic || 0) % 8], 2); c.restore(); }
      G.rr(c, -110, -160, 220, 16, 6); G.fillO(c, '#c98e5a', 3);
      G.ell(c, 70, -172, 34, 14); G.fillO(c, '#f6e6c8', 2); for (let i = 0; i < 4; i++) { G.circ(c, 52 + i * 12, -174, 5); c.fillStyle = RB[i * 2]; c.fill(); }
    } };
  F.s6_paintpots = { w: 300, h: 160, tags: ['art', 'paint', 'color'], slots: [[-200, 10], [200, 10]],
    draw(c, t, f) {
      G.ell(c, 0, -4, 150, 22); c.fillStyle = 'rgba(255,255,255,.4)'; c.fill(); for (let i = 0; i < 5; i++) { G.ell(c, -90 + i * 46, -6 + (i % 2) * 6, 26, 9); c.fillStyle = RB[(i * 2) % 8]; c.globalAlpha = 0.65; c.fill(); c.globalAlpha = 1; }
      ['#ff6f91', '#ffd23f', '#58b9f0'].forEach((col, i) => {
        const x = -80 + i * 80;
        G.rr(c, x - 34, -96, 68, 86, 8); G.fillO(c, '#e8eef5', 3); G.ell(c, x, -96, 34, 10); G.fillO(c, col, 2.5);
        c.fillStyle = col; G.rr(c, x - 20, -96, 12, 30 + i * 6, 6); c.fill(); G.rr(c, x + 10, -96, 10, 18, 5); c.fill();
        G.rr(c, x - 26, -70, 52, 24, 6); c.fillStyle = col; c.fill();
      });
      c.save(); c.translate(-60, -100); c.rotate(-0.4); G.rr(c, -4, -70, 8, 70, 3); G.fillO(c, '#e7b56a', 2); G.rr(c, -6, -84, 12, 18, 5); G.fillO(c, '#ff6f91', 2); c.restore();
      const k = prog(f, 'splash', t, 1600);
      if (k >= 0) for (let i = 0; i < 9; i++) { const x = -110 + i * 28 + Math.sin(i * 3) * 10, y = -100 - Math.sin(Math.min(1, k * 1.3) * Math.PI) * (110 + (i % 3) * 50); G.circ(c, x, y, 10 + (i % 3) * 4); c.fillStyle = RB[i % 8]; c.fill(); }
      (f.prints || []).forEach((col, i) => { G.ell(c, 170 + i * 42, -4 + (i % 2) * 14, 13, 8); c.fillStyle = col; c.fill(); });
    } };
  F.s6_clay = { w: 200, h: 290, tags: ['art', 'clay', 'statue'], slots: [[-160, 10], [160, 10]],
    draw(c, t, f) {
      G.rr(c, -60, -120, 120, 120, 8); G.fillO(c, '#f1ebe0', 3); G.rr(c, -70, -132, 140, 18, 6); G.fillO(c, '#e2d8c8', 2.5);
      const sp = on(f, 'spin', t);
      G.ell(c, 0, -140, 70, 13); G.fillO(c, '#9aa3b8', 3); c.strokeStyle = '#7a8398'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { const a = (sp ? t * 0.02 : 0) + i; c.beginPath(); c.moveTo(Math.cos(a) * 60, -140 + Math.sin(a) * 10); c.lineTo(Math.cos(a) * 66, -140 + Math.sin(a) * 11); c.stroke(); }
      c.save(); c.translate(0, -146); const sx = sp ? 0.35 + 0.65 * Math.abs(Math.cos(t * 0.012)) : 1; c.scale(sx, sp ? 1 + Math.sin(t * 0.03) * 0.04 : 1);
      const col = '#e4986a', sh = (f.shape || 0) % 4;
      if (sh === 0) { G.ell(c, 0, -40, 50, 42); G.fillO(c, col, 3); c.strokeStyle = 'rgba(160,90,50,.4)'; c.lineWidth = 3; c.beginPath(); c.arc(0, -40, 26, 0.5, 2.6); c.stroke(); }
      else if (sh === 1) { G.ell(c, 0, -34, 40, 34); G.fillO(c, col, 3); G.circ(c, 0, -86, 30); G.fillO(c, col, 3); for (const s of [-1, 1]) { G.ell(c, s * 14, -132, 9, 26, s * 0.2); G.fillO(c, col, 3); } c.fillStyle = '#5a3a2a'; G.circ(c, -10, -90, 3.5); c.fill(); G.circ(c, 10, -90, 3.5); c.fill(); }
      else if (sh === 2) { G.heart(c, 0, -110, 46); G.fillO(c, col, 3); G.rr(c, -26, -40, 52, 40, 10); G.fillO(c, col, 3); }
      else { G.rr(c, -36, -80, 72, 80, 16); G.fillO(c, col, 3); G.ell(c, 0, -80, 36, 10); G.fillO(c, '#c9785a', 2); c.strokeStyle = '#5aa84a'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -84); c.lineTo(0, -130); c.stroke(); flower(c, 0, -140, 20, '#ff7fa8'); }
      c.restore();
      if (on(f, 'done', t)) for (let i = 0; i < 5; i++) { const a = t * 0.005 + i * 1.25; G.star(c, Math.cos(a) * 80, -220 + Math.sin(a) * 40, 10, 4); c.fillStyle = '#ffd23f'; c.fill(); }
    } };

  /* ---------- 63 おんがく きょうしつ ---------- */
  const MEL = [60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60];
  const WK = { 60: 0, 62: 1, 64: 2, 65: 3, 67: 4, 69: 5, 71: 6, 72: 7 };
  F.s6_grandpiano = { w: 380, h: 300, tags: ['piano', 'music', 'instrument'], slots: [[-230, 20], [230, 20]],
    draw(c, t, f) {
      for (const x of [-140, 0, 140]) { G.rr(c, x - 8, -90, 16, 90, 5); G.fillO(c, '#2a2530', 2); }
      const pl = on(f, 'play', t), lid = pl ? Math.sin(t * 0.02) * 0.03 : 0;
      c.save(); c.translate(-170, -170); c.rotate(-0.08 + lid); G.poly(c, [0, 0, 330, 0, 200, -120, 40, -90]); G.fillO(c, '#3a3545', 4); c.restore();
      c.strokeStyle = '#c9ccd8'; c.lineWidth = 4; c.beginPath(); c.moveTo(120, -170); c.lineTo(80, -245); c.stroke();
      G.rr(c, -180, -176, 360, 86, 26); G.fillO(c, '#2a2530', 4); c.fillStyle = 'rgba(255,255,255,.18)'; G.rr(c, -160, -168, 200, 10, 5); c.fill();
      G.rr(c, -164, -112, 328, 42, 6); G.fillO(c, '#1e1a24', 2);
      const idx = pl ? Math.floor((t - (f.play - 3400)) / 230) : -1, key = idx >= 0 && idx < MEL.length ? WK[MEL[idx]] : -1;
      for (let i = 0; i < 16; i++) { const x = -158 + i * 20; G.rr(c, x, -108 + (i % 8 === key ? 4 : 0), 19, 36, 3); c.fillStyle = i % 8 === key ? '#ffe066' : '#ffffff'; c.fill(); c.strokeStyle = '#9aa3b8'; c.lineWidth = 1; c.stroke(); }
      for (let i = 0; i < 16; i++) if ([0, 1, 3, 4, 5].includes(i % 7)) { c.fillStyle = '#1e1a24'; c.fillRect(-145 + i * 20, -108, 11, 20); }
      txt(c, '♪', 0, -140, 22, '#ffd23f');
      if (pl) for (let i = 0; i < 4; i++) { const k = (t * 0.0007 + i * 0.25) % 1; G.note(c, -80 + i * 60 + Math.sin(k * 7) * 16, -200 - k * 160, 20, RB[i * 2]); }
    } };
  F.s6_handbells = { w: 360, h: 200, tags: ['bell', 'music', 'instrument'], slots: [[-220, 10], [220, 10]],
    draw(c, t, f) {
      for (const x of [-140, 140]) { G.rr(c, x - 7, -90, 14, 90, 4); G.fillO(c, '#a8693d', 2); }
      G.rr(c, -170, -104, 340, 22, 8); G.fillO(c, '#c98e5a', 3);
      const seq = f.seq || [], st = on(f, 'ring', t) ? Math.floor((t - (f.ring - seq.length * 260 - 500)) / 260) : -9, cur = seq[st];
      for (let i = 0; i < 8; i++) {
        const x = -147 + i * 42, ring = cur === i && st >= 0;
        c.save(); c.translate(x, -106 - (ring ? 26 : 0)); if (ring) c.rotate(Math.sin(t * 0.06) * 0.5);
        G.rr(c, -4, -56, 8, 24, 3); G.fillO(c, '#e8e2d8', 2); G.ell(c, 0, -60, 10, 7); G.fillO(c, '#ffffff', 2);
        P(c); c.moveTo(-16, 0); c.quadraticCurveTo(-16, -34, 0, -36); c.quadraticCurveTo(16, -34, 16, 0); c.closePath(); G.fillO(c, RB[i], 2.5);
        G.circ(c, 0, 3, 4); G.fillO(c, '#ffd23f', 1.5);
        c.restore();
        if (ring) for (let r = 0; r < 2; r++) { const kk = ((t * 0.004) + r * 0.5) % 1; c.strokeStyle = RB[i]; c.globalAlpha = 1 - kk; c.lineWidth = 3; c.beginPath(); c.arc(x, -160, 20 + kk * 40, -2.4, -0.7); c.stroke(); c.globalAlpha = 1; }
      }
    } };
  F.s6_podium = { w: 280, h: 280, tags: ['music', 'conductor', 'stage'], slots: [[-200, 10], [200, 10]],
    draw(c, t, f) {
      const cd = on(f, 'conduct', t);
      G.rr(c, -80, -40, 160, 40, 8); G.fillO(c, '#c0304a', 3); c.fillStyle = '#ffd23f'; c.fillRect(-80, -34, 160, 5);
      c.strokeStyle = '#3a3550'; c.lineWidth = 5; c.beginPath(); c.moveTo(110, 0); c.lineTo(110, -170); c.stroke(); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(110, -10); c.lineTo(110 + s * 26, 0); c.stroke(); }
      c.save(); c.translate(110, -200); c.rotate(-0.2); G.rr(c, -50, -40, 100, 64, 4); G.fillO(c, '#3a3550', 2.5); c.fillStyle = '#ffffff'; c.fillRect(-44, -34, 88, 50); c.strokeStyle = '#9aa3b8'; c.lineWidth = 1; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-40, -26 + i * 8); c.lineTo(40, -26 + i * 8); c.stroke(); } for (let i = 0; i < 3; i++) G.note(c, -24 + i * 22, -10 - (i % 2) * 8, 10, '#2a1f35'); c.restore();
      c.save(); c.translate(-130, 0); G.poly(c, [-24, 0, 24, 0, 10, -90, -10, -90]); G.fillO(c, '#8a5a3a', 3); c.strokeStyle = '#ffd23f'; c.lineWidth = 3; const a = cd ? Math.sin(t * 0.012) * 0.6 : 0.3; c.beginPath(); c.moveTo(0, -20); c.lineTo(Math.sin(a) * 70, -20 - Math.cos(a) * 70); c.stroke(); G.circ(c, Math.sin(a) * 50, -20 - Math.cos(a) * 50, 5); G.fillO(c, '#ffd23f', 1.5); c.restore();
      if (cd) for (let i = 0; i < 3; i++) { const k = (t * 0.0009 + i * 0.33) % 1; G.note(c, -20 + Math.sin(k * 9 + i) * 80, -120 - k * 180, 20, RB[i * 3]); }
    } };

  /* ---------- 64 けいさつしょ ---------- */
  F.s6_patrolcar = { w: 360, h: 230, tags: ['car', 'police', 'vehicle', 'siren'], slots: [[-230, 20], [230, 20]],
    draw(c, t, f) {
      const sr = on(f, 'siren', t), b = sr ? Math.abs(Math.sin(t * 0.02)) * 3 : 0, blink = Math.floor(t / 160) % 2;
      c.save(); c.translate(0, -b);
      G.rr(c, -170, -100, 340, 64, 24); G.fillO(c, '#2a2f45', 4);
      G.rr(c, -160, -130, 320, 44, 18); G.fillO(c, '#ffffff', 4);
      G.rr(c, -96, -186, 190, 70, 26); G.fillO(c, '#ffffff', 4);
      for (const x of [-82, 4]) { G.rr(c, x, -174, 76, 44, 12); G.fillO(c, '#9fd8ff', 2.5); }
      G.star(c, -10, -110, 16, 7); G.fillO(c, '#ffd23f', 2); txt(c, 'POLICE', 90, -110, 22, '#2a3a7a');
      G.rr(c, -62, -212, 124, 28, 10); G.fillO(c, '#3a3550', 3);
      G.rr(c, -56, -208, 56, 20, 8); c.fillStyle = sr && blink ? '#ff3b3b' : '#a83a3a'; c.fill(); G.rr(c, 0, -208, 56, 20, 8); c.fillStyle = sr && !blink ? '#3b8bff' : '#3a5a9a'; c.fill();
      c.restore();
      if (sr) { glow(c, blink ? -30 : 30, -200, 140, blink ? 'rgba(255,80,80,.5)' : 'rgba(80,150,255,.5)'); }
      for (const x of [-100, 100]) { G.circ(c, x, -34, 32); G.fillO(c, '#2a2a3a', 3); G.circ(c, x, -34, 14); G.fillO(c, '#c9ccd8', 2); }
    } };
  F.s6_signal = { w: 180, h: 360, tags: ['signal', 'road', 'police'], slots: [[-140, 10], [160, 30]],
    draw(c, t, f) {
      const s = (f.sig || 0) % 3, wl = on(f, 'walk', t);
      c.strokeStyle = '#9aa3b8'; c.lineWidth = 12; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -300); c.stroke(); G.ell(c, 0, -2, 30, 8); G.fillO(c, '#7a8398', 2);
      G.rr(c, -86, -350, 172, 64, 18); G.fillO(c, '#3a3f55', 4);
      ['#3ad07a', '#ffd23f', '#ff4a4a'].forEach((col, i) => { const lit = i === s; if (lit) glow(c, -56 + i * 56, -318, 50, col); G.circ(c, -56 + i * 56, -318, 22); G.fillO(c, lit ? col : PT.shade(col, -0.55), 2.5); if (lit) { G.circ(c, -62 + i * 56, -324, 6); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); } });
      G.rr(c, 14, -230, 56, 80, 10); G.fillO(c, '#3a3f55', 3);
      const go = s === 0 || wl;
      c.fillStyle = go ? '#3ad07a' : '#ff4a4a'; G.circ(c, 42, -208, 8); c.fill(); c.lineWidth = 6; c.strokeStyle = c.fillStyle; c.beginPath(); c.moveTo(42, -198); c.lineTo(42, -176); const lg = go ? Math.sin(t * 0.02) * 8 : 0; c.moveTo(42, -176); c.lineTo(34 + lg, -160); c.moveTo(42, -176); c.lineTo(50 - lg, -160); c.moveTo(30, -192); c.lineTo(54, -192); c.stroke();
    } };
  F.s6_lostfound = { w: 300, h: 260, tags: ['police', 'counter', 'box'], slots: [[-200, 10], [200, 10]],
    draw(c, t, f) {
      for (const x of [-100, 100]) { G.rr(c, x - 5, -250, 10, 130, 3); G.fillO(c, '#9aa3b8', 2); }
      G.rr(c, -120, -260, 240, 56, 12); G.fillO(c, '#ffffff', 3.5); txt(c, 'おとしもの', 0, -232, 30, '#2f4a8a');
      G.rr(c, -140, -124, 280, 124, 10); G.fillO(c, '#58b9f0', 4); G.rr(c, -150, -132, 300, 18, 6); G.fillO(c, '#ffffff', 3);
      G.star(c, 0, -64, 30, 13); G.fillO(c, '#ffd23f', 3);
      const k = prog(f, 'pop', t, 1400), lid = k >= 0 ? Math.sin(Math.min(1, k * 2) * Math.PI) * 0.9 : 0;
      G.rr(c, 30, -186, 90, 56, 6); G.fillO(c, '#e7b56a', 3); txt(c, '?', 75, -158, 30, '#a8693d');
      c.save(); c.translate(30, -186); c.rotate(-lid); G.rr(c, -4, -12, 98, 14, 5); G.fillO(c, '#d9a25a', 2.5); c.restore();
      if (k >= 0 && k < 0.7) for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.4; G.star(c, 75 + Math.cos(a) * k * 140, -190 + Math.sin(a) * k * 140, 10, 4); c.fillStyle = '#ffd23f'; c.fill(); }
      G.rr(c, -110, -170, 60, 38, 8); G.fillO(c, '#2f4a8a', 2.5); G.ell(c, -80, -170, 34, 8); G.fillO(c, '#26304d', 2); G.star(c, -80, -154, 7, 3); c.fillStyle = '#ffd23f'; c.fill();
    } };

  /* ---------- 65 ゆうびんきょく ---------- */
  const env = (c, x, y, s, col = '#ffffff') => { c.save(); c.translate(x, y); c.scale(s, s); G.rr(c, -26, -18, 52, 36, 4); G.fillO(c, col, 2.5); c.strokeStyle = '#d9a0a0'; c.lineWidth = 2; c.beginPath(); c.moveTo(-26, -18); c.lineTo(0, 4); c.lineTo(26, -18); c.stroke(); G.heart(c, 0, 6, 8); c.fillStyle = '#ff6f91'; c.fill(); c.restore(); };
  F.s6_postbox = { w: 160, h: 260, tags: ['post', 'letter', 'mail'], slots: [[-140, 10], [140, 10]],
    draw(c, t, f) {
      G.rr(c, -26, -30, 52, 30, 6); G.fillO(c, '#3a3550', 3);
      const jig = on(f, 'post', t) ? Math.sin(t * 0.05) * 2 : 0;
      c.save(); c.translate(jig, 0);
      G.rr(c, -54, -230, 108, 204, 26); G.fillO(c, '#e2433b', 4);
      G.rr(c, -62, -244, 124, 34, 16); G.fillO(c, '#e2433b', 4);
      G.rr(c, -36, -190, 72, 12, 5); c.fillStyle = '#4a1a1a'; c.fill();
      G.rr(c, -30, -150, 60, 50, 8); c.fillStyle = '#ffffff'; c.fill();
      c.strokeStyle = '#e2433b'; c.lineWidth = 6; c.beginPath(); c.moveTo(-16, -138); c.lineTo(16, -138); c.moveTo(-16, -126); c.lineTo(16, -126); c.moveTo(0, -126); c.lineTo(0, -108); c.stroke();
      const k = prog(f, 'post', t, 1000);
      if (k >= 0) { c.save(); c.beginPath(); c.rect(-60, -300, 120, 114); c.clip(); env(c, 0, -230 + k * 60, 1); c.restore(); }
      c.restore();
      if (on(f, 'sent', t)) { const kk = prog(f, 'sent', t, 900); c.strokeStyle = '#ffd23f'; c.lineWidth = 4; c.globalAlpha = 1 - kk; c.beginPath(); c.arc(0, -150, 70 + kk * 60, 0, PT.TAU); c.stroke(); c.globalAlpha = 1; }
    } };
  const MARK = [(c) => { G.heart(c, 0, 0, 22); }, (c) => { G.star(c, 0, 0, 20, 9); }, (c) => { for (let i = 0; i < 5; i++) { const a = (i / 5) * PT.TAU; G.circ(c, Math.cos(a) * 11, Math.sin(a) * 11, 8); c.fill(); } G.circ(c, 0, 0, 7); }];
  F.s6_stampdesk = { w: 300, h: 260, tags: ['post', 'stamp', 'desk'], slots: [[-200, 10], [200, 10]],
    draw(c, t, f) {
      for (const x of [-120, 120]) { G.rr(c, x - 7, -90, 14, 90, 4); G.fillO(c, '#a8693d', 2); }
      G.rr(c, -140, -104, 280, 22, 8); G.fillO(c, '#c98e5a', 3);
      c.save(); c.translate(-30, -106); c.rotate(-0.06); G.rr(c, -100, -150, 170, 150, 8); G.fillO(c, '#fffaf0', 3.5); c.strokeStyle = '#ff9f9f'; c.lineWidth = 2; c.strokeRect(10, -136, 46, 54); c.strokeStyle = '#d9cbb0'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-84, -60 + i * 18); c.lineTo(50, -60 + i * 18); c.stroke(); }
      const k = prog(f, 'stamp', t, 900), ms = f.marks || [];
      ms.forEach((m, i) => { if (i === ms.length - 1 && k >= 0 && k < 0.55) return; c.save(); c.translate(m[0], m[1]); c.globalAlpha = 0.85; c.fillStyle = m[2]; MARK[m[3] % 3](c); c.fill(); c.restore(); });
      c.restore();
      G.rr(c, 70, -120, 56, 18, 5); G.fillO(c, '#3a3550', 2.5); G.ell(c, 98, -120, 22, 4); c.fillStyle = '#ff6f91'; c.fill();
      const last = ms[ms.length - 1] || [0, 0];
      let sx = 98, sy = -128;
      if (k >= 0) { const tx = -30 + last[0], ty = -106 + last[1]; const m1 = Math.min(1, k / 0.4); sx = 98 + (tx - 98) * m1; sy = -128 + (ty - -128) * m1 - Math.sin(m1 * Math.PI) * 60; if (k > 0.4) { const pk = (k - 0.4) / 0.6; sy = ty - Math.abs(Math.sin(pk * Math.PI)) * -10 - (pk > 0.5 ? (pk - 0.5) * 120 : 0); } }
      c.save(); c.translate(sx, sy); G.rr(c, -22, -12, 44, 14, 4); G.fillO(c, '#e2433b', 2.5); G.rr(c, -8, -46, 16, 36, 6); G.fillO(c, '#e7b56a', 2.5); G.circ(c, 0, -52, 14); G.fillO(c, '#e7b56a', 2.5); c.restore();
    } };
  F.s6_postbike = { w: 280, h: 220, tags: ['bike', 'post', 'vehicle', 'ride'], slots: [[-200, 10], [200, 10]],
    draw(c, t, f) {
      const rd = on(f, 'ride', t), rot = rd ? t * 0.02 : 0;
      for (const x of [-80, 80]) { G.circ(c, x, -30, 30); G.fillO(c, '#2a2a3a', 3); G.circ(c, x, -30, 12); G.fillO(c, '#c9ccd8', 2); c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + Math.cos(rot) * 10, -30 + Math.sin(rot) * 10); c.lineTo(x - Math.cos(rot) * 10, -30 - Math.sin(rot) * 10); c.stroke(); }
      G.rr(c, -90, -80, 170, 36, 16); G.fillO(c, '#e2433b', 3.5);
      P(c); c.moveTo(40, -80); c.lineTo(90, -160); c.lineTo(110, -150); c.lineTo(80, -50); c.closePath(); G.fillO(c, '#e2433b', 3);
      c.strokeStyle = '#3a3550'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(88, -168); c.lineTo(122, -176); c.stroke(); G.circ(c, 108, -136, 10); G.fillO(c, '#ffe066', 2);
      G.rr(c, -50, -100, 80, 20, 10); G.fillO(c, '#3a3550', 2.5);
      G.rr(c, -140, -170, 84, 72, 8); G.fillO(c, '#e2433b', 3.5); c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.beginPath(); c.moveTo(-116, -148); c.lineTo(-80, -148); c.moveTo(-116, -136); c.lineTo(-80, -136); c.moveTo(-98, -136); c.lineTo(-98, -114); c.stroke();
      if (rd) for (let i = 0; i < 3; i++) { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 4; const y = -60 - i * 30; c.beginPath(); c.moveTo(-170 - i * 10, y); c.lineTo(-210 - i * 10 - Math.sin(t * 0.03 + i) * 10, y); c.stroke(); }
    } };

  /* ---------- 66 こうじげんば ---------- */
  F.s6_excavator = { w: 440, h: 330, tags: ['vehicle', 'dig', 'construction'], slots: [[-280, 20], [280, 30]],
    draw(c, t, f) {
      const k = prog(f, 'dig', t, 3000), pile = f.pile == null ? 2 : f.pile;
      for (let i = 0; i < pile; i++) { G.ell(c, 250 + (i % 2) * 20 - 10, -14 - i * 14, 70 - i * 10, 22); G.fillO(c, '#e2b26a', 2.5); }
      let a1 = -0.95, a2 = 1.3, a3 = 0.6, load = false;
      if (k >= 0) {
        if (k < 0.35) { const m = k / 0.35; a1 = -0.95 + m * 0.75; a2 = 1.3 + m * 0.6; a3 = 0.6 + m * 0.6; }
        else if (k < 0.7) { const m = (k - 0.35) / 0.35; a1 = -0.2 - m * 0.75; a2 = 1.9 - m * 0.6; a3 = 1.2 - m * 0.6; load = true; }
        else { const m = (k - 0.7) / 0.3; a3 = 0.6 - Math.sin(m * Math.PI) * 1.5; load = m < 0.5; }
      }
      G.rr(c, -170, -56, 260, 56, 28); G.fillO(c, '#4a4a5a', 3.5); for (let i = 0; i < 5; i++) { const x = -140 + i * 50 + (k >= 0 ? (t * 0.05) % 10 : 0); G.circ(c, x, -28, 14); G.fillO(c, '#7a7a8a', 2); }
      G.rr(c, -150, -150, 220, 96, 12); G.fillO(c, '#ffc83a', 4); c.fillStyle = '#2a2a3a'; for (let i = 0; i < 6; i++) c.fillRect(-140 + i * 36, -70, 18, 8);
      G.rr(c, -140, -260, 110, 116, 14); G.fillO(c, '#ffc83a', 4); G.rr(c, -128, -246, 86, 70, 8); G.fillO(c, '#9fd8ff', 2.5);
      c.save(); c.translate(50, -130); c.rotate(a1); G.rr(c, 0, -14, 160, 28, 12); G.fillO(c, '#ffb020', 3.5);
      c.translate(160, 0); c.rotate(a2); G.rr(c, 0, -11, 120, 22, 10); G.fillO(c, '#ffb020', 3);
      c.translate(120, 0); c.rotate(a3); G.poly(c, [0, -12, 46, -20, 50, 26, 6, 22]); G.fillO(c, '#9aa3b8', 3); if (load) { G.ell(c, 26, -16, 26, 12); G.fillO(c, '#e2b26a', 2); }
      c.restore();
      G.circ(c, 50, -130, 10); G.fillO(c, '#3a3550', 2);
    } };
  F.s6_crane = { w: 420, h: 540, tags: ['crane', 'construction', 'tall'], slots: [[-220, 20], [220, 30]],
    draw(c, t, f) {
      const fl = f.floors == null ? 2 : f.floors;
      for (let i = 0; i < fl; i++) { G.rr(c, 90, -50 - i * 50, 80, 50, 6); G.fillO(c, RB[(i * 2) % 8], 3); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(102, -40 - i * 50, 18, 18); c.fillRect(140, -40 - i * 50, 18, 18); }
      c.strokeStyle = '#ffb020'; c.lineWidth = 5; c.beginPath(); c.moveTo(-18, 0); c.lineTo(-18, -470); c.moveTo(18, 0); c.lineTo(18, -470); for (let y = 0; y > -470; y -= 40) { c.moveTo(-18, y); c.lineTo(18, y - 40); } c.stroke();
      G.rr(c, -40, -20, 80, 20, 4); G.fillO(c, '#7a7a8a', 2.5);
      c.beginPath(); c.moveTo(-120, -470); c.lineTo(280, -470); c.moveTo(-120, -500); c.lineTo(280, -490); for (let x = -120; x < 280; x += 40) { c.moveTo(x, -470); c.lineTo(x + 20, -496); c.lineTo(x + 40, -470); } c.stroke();
      G.rr(c, -140, -500, 54, 50, 6); G.fillO(c, '#7a7a8a', 3); G.rr(c, -10, -470, 50, 40, 8); G.fillO(c, '#ffc83a', 3); G.rr(c, 0, -462, 30, 22, 4); c.fillStyle = '#9fd8ff'; c.fill();
      const k = prog(f, 'lift', t, 3000), cy = on(f, 'carry', t);
      let hx = 240, hy = -300, blk = false;
      if (k >= 0) {
        const top = -60 - fl * 50 - 10;
        if (k < 0.4) { hx = 240; hy = -40 - (k / 0.4) * 340; } else if (k < 0.6) { hx = 240 - ((k - 0.4) / 0.2) * 110; hy = -380; } else { hx = 130; hy = -380 + ((k - 0.6) / 0.4) * (380 + top); }
        blk = true;
      } else if (cy) { hx = 240; hy = -(f.cz || 0) - 175; }
      else { G.rr(c, 200, -50, 80, 50, 6); G.fillO(c, RB[(fl * 2) % 8], 3); }
      G.rr(c, hx - 16, -478, 32, 14, 4); G.fillO(c, '#3a3550', 2);
      c.strokeStyle = '#3a3550'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(hx, -466); c.lineTo(hx, hy); c.stroke();
      if (blk) { c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx - 34, hy + 14); c.moveTo(hx, hy); c.lineTo(hx + 34, hy + 14); c.stroke(); G.rr(c, hx - 40, hy + 14, 80, 50, 6); G.fillO(c, RB[(fl * 2) % 8], 3); }
      else { c.strokeStyle = '#ffb020'; c.lineWidth = 6; c.beginPath(); c.arc(hx, hy + 12, 12, -Math.PI / 2, Math.PI * 0.9); c.stroke(); }
    } };
  F.s6_mixer = { w: 360, h: 250, tags: ['vehicle', 'construction', 'truck'], slots: [[-230, 20], [230, 20]],
    draw(c, t, f) {
      const mx = on(f, 'mix', t), sp = mx ? 0.08 : 0.01;
      G.rr(c, -170, -78, 330, 28, 8); G.fillO(c, '#7a7a8a', 3);
      G.rr(c, 90, -190, 80, 120, 16); G.fillO(c, '#58b9f0', 4); G.rr(c, 104, -176, 52, 44, 8); G.fillO(c, '#9fd8ff', 2.5);
      c.save(); c.translate(-40, -140); c.rotate(-0.12);
      G.ell(c, 0, 0, 120, 62); G.fillO(c, '#ff9a3a', 4);
      c.save(); G.ell(c, 0, 0, 118, 60); c.clip(); c.strokeStyle = '#ffffff'; c.lineWidth = 14; const o = (t * sp) % 60; for (let x = -200; x < 200; x += 60) { c.beginPath(); c.moveTo(x + o, 70); c.lineTo(x + o + 60, -70); c.stroke(); } c.restore();
      c.restore();
      G.poly(c, [-160, -130, -190, -100, -176, -90, -150, -116]); G.fillO(c, '#9aa3b8', 2.5);
      if (mx) for (let i = 0; i < 4; i++) { const kk = (t * 0.002 + i * 0.25) % 1; G.circ(c, -186 - kk * 10, -90 + kk * 80, 9 - kk * 4); c.fillStyle = '#b9b4ac'; c.fill(); }
      for (const x of [-110, 0, 120]) { G.circ(c, x, -40, 30); G.fillO(c, '#2a2a3a', 3); G.circ(c, x, -40, 12); G.fillO(c, '#c9ccd8', 2); }
      if (mx) txt(c, 'ぐるぐる', -40, -230, 28, '#ff9a3a', '#ffffff');
    } };

  /* ---------- 67 びよういん ---------- */
  const bulbs = (c, x, y, w, h, lit, t) => { for (let i = 0; i < 5; i++) for (const [bx, by] of [[x + (w / 4) * i, y], [x + (w / 4) * i, y + h]]) { G.circ(c, bx, by, 7); c.fillStyle = lit && (i + Math.floor(t / 150)) % 2 ? '#fff6a0' : '#fff2d6'; c.fill(); } };
  F.s6_salonchair = { w: 260, h: 380, tags: ['chair', 'seat', 'salon', 'mirror'], slots: [[-180, 20], [180, 20]],
    draw(c, t, f) {
      const ct = on(f, 'cut', t);
      G.rr(c, -100, -380, 200, 190, 24); G.fillO(c, '#ffd1e0', 4); G.rr(c, -84, -364, 168, 158, 16); c.fillStyle = G.grad(c, 0, -364, 0, -206, [[0, '#e6f6ff'], [1, '#c4e4f6']]); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 6; c.beginPath(); c.moveTo(-60, -260); c.lineTo(-20, -340); c.moveTo(-40, -230); c.lineTo(-6, -296); c.stroke();
      bulbs(c, -90, -386, 180, 202, on(f, 'shine', t) || ct, t);
      G.rr(c, -12, -60, 24, 60, 6); G.fillO(c, '#9aa3b8', 2.5); G.ell(c, 0, -4, 60, 10); G.fillO(c, '#9aa3b8', 2.5);
      G.rr(c, -64, -210, 128, 120, 34); G.fillO(c, '#ff8fb1', 4); G.rr(c, -80, -100, 160, 44, 18); G.fillO(c, '#ff7fa8', 4);
      if (ct) {
        const a = Math.abs(Math.sin(t * 0.03)) * 0.5; c.save(); c.translate(70, -250); for (const s of [-1, 1]) { c.save(); c.rotate(s * a); G.ell(c, 0, -26, 6, 26); G.fillO(c, '#c9ccd8', 2); G.circ(c, s * 0, 8, 9); c.strokeStyle = '#ff6f91'; c.lineWidth = 4; c.stroke(); c.restore(); } c.restore();
        for (let i = 0; i < 6; i++) { const kk = (t * 0.001 + i / 6) % 1; c.strokeStyle = '#8a5a3a'; c.lineWidth = 3; c.beginPath(); const x = -40 + i * 16, y = -200 + kk * 180; c.moveTo(x, y); c.lineTo(x + 6, y + 8); c.stroke(); }
      }
    } };
  F.s6_dryer = { w: 240, h: 360, tags: ['chair', 'seat', 'salon', 'dryer'], slots: [[-180, 20], [180, 20]],
    draw(c, t, f) {
      const dr = on(f, 'dry', t), sh = dr ? Math.sin(t * 0.08) * 2 : 0;
      c.strokeStyle = '#9aa3b8'; c.lineWidth = 8; c.beginPath(); c.moveTo(90, 0); c.lineTo(90, -280); c.lineTo(40, -300); c.stroke(); G.ell(c, 90, -4, 30, 8); G.fillO(c, '#9aa3b8', 2);
      G.rr(c, -60, -200, 120, 110, 30); G.fillO(c, '#b39ae8', 4); G.rr(c, -76, -100, 152, 42, 18); G.fillO(c, '#a58ae0', 4); G.rr(c, -10, -60, 20, 60, 5); G.fillO(c, '#9aa3b8', 2);
      c.save(); c.translate(sh, 0);
      P(c); c.moveTo(-80, -250); c.quadraticCurveTo(-80, -340, 0, -342); c.quadraticCurveTo(80, -340, 80, -250); c.closePath(); G.fillO(c, '#f2e6ff', 4);
      G.ell(c, 0, -250, 80, 16); G.fillO(c, '#c9b2ff', 3); c.fillStyle = dr ? '#ffb070' : '#8a7aa8'; G.circ(c, 52, -310, 6); c.fill();
      c.restore();
      if (dr) for (let i = 0; i < 3; i++) { const kk = (t * 0.003 + i * 0.33) % 1; c.strokeStyle = `rgba(255,160,100,${1 - kk})`; c.lineWidth = 3; c.beginPath(); for (let j = 0; j < 4; j++) { const x = -40 + i * 40 + Math.sin(j * 2 + t * 0.02) * 6, y = -236 + j * 10 + kk * 20; j ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
    } };
  F.s6_shampoo = { w: 300, h: 240, tags: ['salon', 'water', 'bubble'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      const fm = on(f, 'foam', t);
      G.rr(c, -100, -130, 40, 130, 8); G.fillO(c, '#e8eef5', 3);
      G.ell(c, -80, -140, 64, 22); G.fillO(c, '#ffffff', 3.5); G.ell(c, -80, -144, 48, 12); c.fillStyle = '#bfe6ff'; c.fill();
      c.strokeStyle = '#9aa3b8'; c.lineWidth = 6; c.beginPath(); c.moveTo(-120, -150); c.lineTo(-120, -200); c.quadraticCurveTo(-120, -220, -96, -220); c.stroke(); G.ell(c, -90, -212, 14, 9); G.fillO(c, '#c9ccd8', 2);
      G.poly(c, [-30, -120, 150, -90, 150, -60, -30, -84]); G.fillO(c, '#7fd0c8', 3.5); G.rr(c, -40, -150, 40, 70, 14); G.fillO(c, '#6ac0b8', 3);
      for (const x of [20, 120]) { G.rr(c, x - 6, -66, 12, 66, 4); G.fillO(c, '#9aa3b8', 2); }
      for (let i = 0; i < 3; i++) { G.rr(c, 160 + i * 34, -64, 26, 50, 8); G.fillO(c, ['#ff8fb1', '#9fd8ff', '#ffd27a'][i], 2.5); G.rr(c, 166 + i * 34, -76, 14, 14, 4); G.fillO(c, '#ffffff', 2); }
      if (fm) { for (let i = 0; i < 8; i++) { const b = Math.sin(t * 0.008 + i) * 4; G.circ(c, -120 + i * 12, -156 - (i % 3) * 12 + b, 14 + (i % 2) * 6); G.fillO(c, '#ffffff', 2); } for (let i = 0; i < 6; i++) { const kk = (t * 0.003 + i / 6) % 1; G.ell(c, -96 + (i % 3) * 6, -200 + kk * 50, 3, 6); c.fillStyle = '#7fd0f8'; c.fill(); } }
    } };

  /* ---------- 68 ラーメンやさん ---------- */
  F.s6_ramenbowl = { w: 320, h: 330, tags: ['food', 'ramen', 'counter'], slots: [[-210, 20], [210, 20]],
    draw(c, t, f) {
      G.rr(c, -150, -120, 300, 120, 10); G.fillO(c, '#c98e5a', 4); G.rr(c, -160, -130, 320, 18, 6); G.fillO(c, '#a8693d', 3);
      c.strokeStyle = 'rgba(120,70,30,.3)'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-140, -90 + i * 22); c.lineTo(140, -90 + i * 22); c.stroke(); }
      const sl = on(f, 'slurp', t);
      for (let i = 0; i < 3; i++) { const kk = (t * 0.0006 + i * 0.33) % 1; c.strokeStyle = `rgba(255,255,255,${0.7 * (1 - kk)})`; c.lineWidth = 6; c.beginPath(); const x = -40 + i * 40; c.moveTo(x, -210 - kk * 90); c.quadraticCurveTo(x + 20, -230 - kk * 90, x, -250 - kk * 90); c.stroke(); }
      P(c); c.moveTo(-110, -200); c.quadraticCurveTo(-100, -134, -40, -132); c.lineTo(40, -132); c.quadraticCurveTo(100, -134, 110, -200); c.closePath(); G.fillO(c, '#e2433b', 4);
      c.strokeStyle = '#ffffff'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { const x = -80 + i * 32; c.beginPath(); c.moveTo(x, -176); c.lineTo(x + 8, -168); c.lineTo(x + 16, -176); c.stroke(); }
      G.ell(c, 0, -200, 110, 20); G.fillO(c, '#f6c27a', 3);
      c.strokeStyle = '#ffe28a'; c.lineWidth = 4; for (let i = 0; i < 5; i++) { c.beginPath(); for (let x = -80; x <= 80; x += 10) { const y = -200 + Math.sin(x * 0.15 + i * 2) * 4 + (i - 2) * 3; x === -80 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); }
      G.rr(c, -92, -246, 34, 48, 4); G.fillO(c, '#2a4a3a', 2.5);
      G.ell(c, -40, -206, 20, 13); G.fillO(c, '#ffffff', 2); G.ell(c, -40, -206, 10, 7); c.fillStyle = '#ffb020'; c.fill();
      G.circ(c, 40, -206, 16); G.fillO(c, '#ffffff', 2); c.strokeStyle = '#ff6f91'; c.lineWidth = 2.5; c.beginPath(); c.arc(40, -206, 8, 0, 5); c.stroke();
      G.ell(c, 76, -206, 20, 12); G.fillO(c, '#b0704a', 2);
      if (sl) {
        const L = 60 + Math.sin(t * 0.02) * 40;
        c.strokeStyle = '#ffe28a'; c.lineWidth = 4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-6 + i * 6, -202); c.quadraticCurveTo(-20 + i * 10, -202 - L * 0.5, 4 + i * 4, -210 - L); c.stroke(); }
        c.strokeStyle = '#b07a4a'; c.lineWidth = 6; c.beginPath(); c.moveTo(-10, -206 - L); c.lineTo(70, -300 - L); c.moveTo(12, -212 - L); c.lineTo(84, -290 - L); c.stroke();
        txt(c, 'ずるずる', 150, -280, 30, '#e2433b', '#ffffff');
      }
    } };
  F.s6_noodlepot = { w: 260, h: 320, tags: ['food', 'ramen', 'pot', 'cook'], slots: [[-180, 20], [180, 20]],
    draw(c, t, f) {
      const bl = on(f, 'boil', t);
      G.rr(c, -110, -90, 220, 90, 10); G.fillO(c, '#9aa3b8', 4); for (const x of [-60, 60]) { G.circ(c, x, -46, 16); G.fillO(c, '#3a3550', 2); }
      for (let i = 0; i < 5; i++) { G.ell(c, -50 + i * 25, -98, 8, 12 + Math.sin(t * 0.03 + i) * 3); c.fillStyle = '#ff9a3a'; c.fill(); }
      G.rr(c, -90, -210, 180, 114, 16); G.fillO(c, '#c9ccd8', 4); G.rr(c, -104, -200, 16, 16, 6); G.fillO(c, '#9aa3b8', 2); G.rr(c, 88, -200, 16, 16, 6); G.fillO(c, '#9aa3b8', 2);
      G.ell(c, 0, -210, 90, 16); G.fillO(c, '#bfe6ff', 3);
      for (let i = 0; i < 5; i++) { const kk = ((t * (bl ? 0.004 : 0.0015)) + i * 0.2) % 1; G.circ(c, -60 + i * 30, -212 - kk * 10, 4 + kk * 4); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill(); }
      for (let i = 0; i < 3; i++) { const kk = (t * 0.0006 + i * 0.33) % 1; c.strokeStyle = `rgba(255,255,255,${0.6 * (1 - kk)})`; c.lineWidth = bl ? 10 : 6; c.beginPath(); const x = -50 + i * 50; c.moveTo(x, -240 - kk * 100); c.quadraticCurveTo(x + 20, -260 - kk * 100, x, -280 - kk * 100); c.stroke(); }
      const j = bl ? -Math.abs(Math.sin(t * 0.025)) * 50 : 0;
      c.save(); c.translate(30, -220 + j); c.strokeStyle = '#b07a4a'; c.lineWidth = 8; c.beginPath(); c.moveTo(20, -10); c.lineTo(100, -90); c.stroke();
      P(c); c.moveTo(-30, -14); c.lineTo(30, -14); c.lineTo(16, 30); c.lineTo(-16, 30); c.closePath(); G.fillO(c, '#e8eef5', 3); c.strokeStyle = '#9aa3b8'; c.lineWidth = 1.5; for (let i = -20; i < 30; i += 8) { c.beginPath(); c.moveTo(i, -12); c.lineTo(i * 0.6, 28); c.stroke(); }
      c.strokeStyle = '#ffe28a'; c.lineWidth = 3; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-20, -14 + i * 3); c.quadraticCurveTo(0, -30 + i * 4, 20, -14 + i * 3); c.stroke(); }
      c.restore();
      if (bl) { for (let i = 0; i < 5; i++) { const kk = (t * 0.003 + i / 5) % 1; G.ell(c, 30 + (i - 2) * 16 * kk * 3, -200 + j - kk * 40, 3, 5); c.fillStyle = '#7fd0f8'; c.fill(); } txt(c, 'ちゃっ ちゃっ', 0, -310, 26, '#3a6ad0', '#ffffff'); }
    } };
  F.s6_yatai = { w: 400, h: 380, tags: ['food', 'ramen', 'stall', 'lantern'], slots: [[-250, 20], [250, 20]],
    draw(c, t, f) {
      const tt = on(f, 'toot', t);
      for (const x of [-150, 150]) { G.rr(c, x - 6, -330, 12, 200, 3); G.fillO(c, '#8a5a3a', 2); }
      G.rr(c, -170, -160, 340, 120, 10); G.fillO(c, '#b07a4a', 4); c.strokeStyle = 'rgba(80,40,20,.35)'; c.lineWidth = 2; for (let x = -150; x < 170; x += 40) { c.beginPath(); c.moveTo(x, -156); c.lineTo(x, -44); c.stroke(); }
      G.rr(c, -186, -176, 372, 20, 6); G.fillO(c, '#8a5a3a', 3);
      for (const x of [-120, 120]) { G.circ(c, x, -36, 34); G.fillO(c, '#5a3a2a', 3.5); G.circ(c, x, -36, 10); G.fillO(c, '#c98e5a', 2); }
      G.rr(c, -40, -230, 80, 54, 10); G.fillO(c, '#c9ccd8', 3); for (let i = 0; i < 2; i++) { const kk = (t * 0.0007 + i * 0.5) % 1; c.strokeStyle = `rgba(255,255,255,${0.7 * (1 - kk)})`; c.lineWidth = 5; c.beginPath(); c.moveTo(-10 + i * 20, -236 - kk * 60); c.quadraticCurveTo(10 + i * 20, -250 - kk * 60, -10 + i * 20, -266 - kk * 60); c.stroke(); }
      G.poly(c, [-200, -320, 200, -320, 170, -370, -170, -370]); G.fillO(c, '#e2433b', 4);
      ['ら', 'ー', 'め', 'ん'].forEach((ch, i) => { const x = -135 + i * 70, sw = Math.sin(t * 0.003 + i) * 3; G.rr(c, x - 30 + sw, -320, 62, 70, 4); G.fillO(c, '#2a3a7a', 2.5); txt(c, ch, x + 1 + sw, -290, 30, '#ffffff'); });
      for (const s of [-1, 1]) { c.save(); c.translate(s * 190, -310); c.rotate(tt ? Math.sin(t * 0.008 + s) * 0.3 : Math.sin(t * 0.002) * 0.05); if (tt) glow(c, 0, 40, 70, 'rgba(255,120,80,.5)'); c.strokeStyle = '#3a3550'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 14); c.stroke(); G.ell(c, 0, 42, 22, 30); G.fillO(c, tt ? '#ff5a4a' : '#e2433b', 3); G.rr(c, -10, 10, 20, 6, 2); c.fillStyle = '#2a2a3a'; c.fill(); G.rr(c, -10, 68, 20, 6, 2); c.fill(); c.restore(); }
      if (tt) for (let i = 0; i < 3; i++) { const k = (t * 0.0008 + i * 0.33) % 1; G.note(c, 60 + i * 40 + Math.sin(k * 8) * 12, -200 - k * 160, 20, RB[i * 2 + 1]); }
    } };

  /* ---------- 69 アイスクリームやさん ---------- */
  const SC = ['#ffb3c8', '#fff1c2', '#8b5a3c', '#b8f0c8', '#c9b2ff', '#ffd27a', '#ff8fa3', '#a8e0ff'];
  const scoop = (c, x, y, r, col) => { G.circ(c, x, y, r); G.fillO(c, col, 3); for (let i = 0; i < 4; i++) { G.circ(c, x - r * 0.7 + i * r * 0.47, y + r * 0.62, r * 0.25); c.fillStyle = col; c.fill(); } G.ell(c, x - r * 0.35, y - r * 0.4, r * 0.25, r * 0.15, -0.6); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill(); };
  F.s6_icetower = { w: 180, h: 440, tags: ['food', 'icecream', 'sweets'], slots: [[-150, 10], [150, 10]],
    draw(c, t, f) {
      G.ell(c, 0, -4, 50, 12); G.fillO(c, '#ff8fb1', 3); G.rr(c, -8, -130, 16, 126, 5); G.fillO(c, '#ffb3c8', 2.5); G.ell(c, 0, -130, 36, 10); G.fillO(c, '#ff8fb1', 3);
      const n = f.n == null ? 2 : f.n, add = prog(f, 'add', t, 500);
      c.save(); c.translate(0, -170); if (n > 3) c.rotate(Math.sin(t * 0.004) * 0.012 * n);
      G.poly(c, [-36, -14, 36, -14, 0, 66]); G.fillO(c, '#e7b56a', 3); c.strokeStyle = 'rgba(160,100,40,.5)'; c.lineWidth = 2; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 14 - 10, -10); c.lineTo(i * 6 + 10, 40); c.stroke(); }
      for (let i = 0; i < n; i++) { const last = i === n - 1 && add >= 0; scoop(c, Math.sin(i * 2.1) * 4, -30 - i * 42 - (last ? (1 - PT.easeOut(add)) * 220 : 0), 34, SC[i % 8]); }
      if (n >= 8 || on(f, 'full', t)) { G.circ(c, 0, -30 - n * 42 + 4, 12); G.fillO(c, '#e2433b', 2.5); c.strokeStyle = '#5aa84a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -30 - n * 42 - 6); c.quadraticCurveTo(6, -30 - n * 42 - 24, 14, -30 - n * 42 - 26); c.stroke(); }
      c.restore();
      if (on(f, 'full', t)) for (let i = 0; i < 6; i++) { const a = t * 0.004 + i; G.star(c, Math.cos(a) * 90, -300 - (f.n || 0) * 20 + Math.sin(a) * 40, 12, 5); c.fillStyle = RB[i]; c.fill(); }
    } };
  F.s6_softserve = { w: 220, h: 330, tags: ['food', 'icecream', 'machine'], slots: [[-170, 10], [170, 10]],
    draw(c, t, f) {
      const k = prog(f, 'swirl', t, 2000);
      G.rr(c, -90, -320, 180, 220, 20); G.fillO(c, '#e8eef5', 4); G.rr(c, -70, -296, 140, 90, 14); G.fillO(c, '#ffd1e0', 3);
      c.save(); c.translate(0, -240); c.scale(0.7, 0.7); G.poly(c, [-24, 0, 24, 0, 0, 50]); G.fillO(c, '#e7b56a', 2.5); for (let i = 0; i < 3; i++) { G.ell(c, 0, -10 - i * 14, 26 - i * 7, 10); G.fillO(c, '#fffaf0', 2); } c.restore();
      G.rr(c, -80, -110, 160, 110, 10); G.fillO(c, '#c9ccd8', 4); G.rr(c, -60, -100, 120, 84, 8); c.fillStyle = '#7a8398'; c.fill();
      G.rr(c, -14, -116, 28, 26, 6); G.fillO(c, '#9aa3b8', 2.5);
      c.save(); c.translate(70, -150); c.rotate(k >= 0 ? 0.9 : 0); G.rr(c, -4, -60, 10, 60, 4); G.fillO(c, '#3a3550', 2); G.circ(c, 1, -64, 10); G.fillO(c, '#ff6f91', 2); c.restore();
      G.rr(c, -40, -22, 80, 10, 3); G.fillO(c, '#9aa3b8', 2);
      G.poly(c, [-20, -84, 20, -84, 0, -26]); G.fillO(c, '#e7b56a', 2.5);
      if (k >= 0) {
        const n = Math.min(5, Math.floor(k * 6)); for (let i = 0; i < n; i++) { G.ell(c, Math.sin(t * 0.02 + i) * 2, -88 - i * 9, 22 - i * 4, 8); G.fillO(c, i % 2 ? '#ffe6f0' : '#fffaf0', 2); }
        if (k < 0.85) { G.rr(c, -5, -116, 10, Math.max(2, 28 - n * 9), 4); c.fillStyle = '#fffaf0'; c.fill(); }
      }
    } };
  const PL = ['#f2c27a', '#fffaf0', '#ff8fa3', '#8b5a3c', '#fffaf0'];
  F.s6_parfait = { w: 200, h: 400, tags: ['food', 'icecream', 'sweets', 'glass'], slots: [[-160, 10], [160, 10]],
    draw(c, t, f) {
      G.ell(c, 0, -6, 56, 12); G.fillO(c, '#e8f4ff', 3); G.rr(c, -10, -70, 20, 64, 6); G.fillO(c, '#e8f4ff', 2.5);
      const L = f.lay == null ? 3 : f.lay, e = prog(f, 'eat', t, 2400), a = prog(f, 'add', t, 500);
      const show = e >= 0 ? Math.round(L * (1 - e)) : L;
      const glass = [-70, -320, 70, -320, 42, -72, -42, -72];
      c.save(); G.poly(c, glass); c.clip();
      for (let i = 0; i < Math.min(show, 5); i++) { const dy = i === show - 1 && a >= 0 ? -(1 - PT.easeOut(a)) * 120 : 0; c.fillStyle = PL[i]; c.fillRect(-80, -72 - (i + 1) * 46 + dy, 160, 47); if (i === 2) { for (let j = 0; j < 4; j++) { G.circ(c, -45 + j * 30, -72 - i * 46 - 23 + dy, 9); c.fillStyle = '#e2433b'; c.fill(); } } if (i === 0) { c.fillStyle = '#d9a25a'; for (let j = 0; j < 8; j++) c.fillRect(-60 + j * 15, -100 + (j % 3) * 8 + dy, 9, 5); } }
      c.restore();
      G.poly(c, glass); c.fillStyle = 'rgba(220,240,255,.28)'; c.fill(); c.strokeStyle = '#9fc8e8'; c.lineWidth = 3.5; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 5; c.beginPath(); c.moveTo(-52, -290); c.lineTo(-36, -100); c.stroke();
      if (show >= 6) {
        const dy = a >= 0 && show === L ? -(1 - PT.easeOut(a)) * 120 : 0;
        for (let i = 0; i < 3; i++) { G.ell(c, 0, -330 - i * 18 + dy, 56 - i * 16, 16); G.fillO(c, '#fffaf0', 2.5); }
        G.circ(c, 0, -390 + dy, 13); G.fillO(c, '#e2433b', 2.5); c.strokeStyle = '#5aa84a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -402 + dy); c.quadraticCurveTo(6, -420 + dy, 16, -422 + dy); c.stroke();
        G.rr(c, 22, -380 + dy, 14, 50, 4); G.fillO(c, '#e7b56a', 2);
      }
      if (e >= 0) { c.save(); c.translate(60, -330 + Math.sin(t * 0.02) * 30); c.rotate(-0.5); G.rr(c, -4, -70, 8, 70, 3); G.fillO(c, '#c9ccd8', 2); G.ell(c, 0, 4, 10, 14); G.fillO(c, '#c9ccd8', 2); c.restore(); }
    } };

  /* ---------- 70 おはなやさん ---------- */
  const FC = ['#ff6f91', '#ffd23f', '#c38be0', '#ff9f4a', '#ffffff', '#58b9f0'];
  F.s6_bouquet = { w: 300, h: 300, tags: ['flower', 'table', 'present'], slots: [[-200, 10], [200, 10]],
    draw(c, t, f) {
      for (const x of [-120, 120]) { G.rr(c, x - 7, -90, 14, 90, 4); G.fillO(c, '#a8693d', 2); }
      G.rr(c, -140, -104, 280, 22, 8); G.fillO(c, '#c98e5a', 3);
      G.circ(c, 100, -120, 16); G.fillO(c, '#ff6f91', 2.5); G.circ(c, 100, -120, 6); c.fillStyle = '#ffffff'; c.fill();
      const nb = f.nb == null ? 2 : f.nb, a = prog(f, 'add', t, 500), wr = on(f, 'wrap', t);
      const pos = [[-30, -232], [28, -236], [0, -262], [-50, -258], [50, -256]];
      c.strokeStyle = '#5aa84a'; c.lineWidth = 4; for (let i = 0; i < nb; i++) { c.beginPath(); c.moveTo(0, -120); c.lineTo(pos[i][0], pos[i][1]); c.stroke(); }
      for (let i = 0; i < nb; i++) { const dy = i === nb - 1 && a >= 0 ? -(1 - PT.easeOut(a)) * 120 : 0; flower(c, pos[i][0], pos[i][1] + dy + Math.sin(t * 0.003 + i) * 2, 22, FC[i]); }
      P(c); c.moveTo(-70, -230); c.lineTo(70, -230); c.lineTo(10, -106); c.lineTo(-10, -106); c.closePath(); G.fillO(c, '#ffd1e0', 3.5);
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-40, -220); c.lineTo(-6, -120); c.stroke();
      if (nb >= 5 || wr) { G.circ(c, 0, -150, 9); G.fillO(c, '#e2433b', 2); for (const s of [-1, 1]) { G.ell(c, s * 22, -156, 18, 11, s * 0.3); G.fillO(c, '#e2433b', 2.5); G.poly(c, [s * 4, -146, s * 18, -112, s * 26, -118]); G.fillO(c, '#e2433b', 2); } }
      if (wr) for (let i = 0; i < 5; i++) { const ang = t * 0.004 + i * 1.25; G.heart(c, Math.cos(ang) * 110, -220 + Math.sin(ang) * 50, 12); c.fillStyle = '#ff8fb1'; c.fill(); }
    } };
  F.s6_flowerstand = { w: 340, h: 280, tags: ['flower', 'shelf', 'plant'], slots: [[-220, 10], [220, 10]],
    draw(c, t, f) {
      const k = prog(f, 'bloom', t, 2600), s = k >= 0 ? 1 + Math.sin(Math.min(1, k * 2) * Math.PI / 2) * 0.35 * (k > 0.8 ? (1 - k) / 0.2 : 1) : 1;
      for (let r = 0; r < 3; r++) { G.rr(c, -160 + r * 30, -40 - r * 60, 320 - r * 60, 22, 6); G.fillO(c, '#c98e5a', 3); }
      for (const x of [-150, 150]) { G.rr(c, x - 6, -180, 12, 180, 3); G.fillO(c, '#a8693d', 2); }
      let i = 0;
      for (let r = 2; r >= 0; r--) {
        const n = 4 - r, y = -40 - r * 60;
        for (let j = 0; j < n; j++, i++) {
          const x = -((n - 1) * 70) / 2 + j * 70, col = FC[i % 6], sw = Math.sin(t * 0.003 + i) * 0.06;
          c.save(); c.translate(x, y); c.rotate(sw);
          c.strokeStyle = '#5aa84a'; c.lineWidth = 3; for (const dx of [-12, 0, 12]) { c.beginPath(); c.moveTo(0, -20); c.lineTo(dx, -50); c.stroke(); }
          for (const [dx, dy] of [[-14, -54], [12, -56], [0, -70]]) { c.save(); c.translate(dx, dy); c.scale(s, s); flower(c, 0, 0, 13, col); c.restore(); }
          c.restore();
          G.poly(c, [x - 22, y - 34, x + 22, y - 34, x + 16, y, x - 16, y]); G.fillO(c, '#c9ccd8', 2.5);
        }
      }
      if (k >= 0) for (let b = 0; b < 2; b++) { const bx = Math.sin(t * 0.0025 + b * 3) * 150, by = -250 + Math.cos(t * 0.004 + b) * 40, fl = Math.abs(Math.sin(t * 0.03)); c.save(); c.translate(bx, by); for (const sd of [-1, 1]) { G.ell(c, sd * 10 * fl, -4, 11 * fl + 2, 13, sd * 0.4); c.fillStyle = b ? '#ffb3e6' : '#ffe066'; c.fill(); c.strokeStyle = '#3a3550'; c.lineWidth = 1.5; c.stroke(); } G.ell(c, 0, 0, 3, 10); c.fillStyle = '#3a3550'; c.fill(); c.restore(); }
    } };
  F.s6_bigpot = { w: 220, h: 460, tags: ['flower', 'plant', 'grow', 'sunflower'], slots: [[-160, 10], [160, 10]],
    draw(c, t, f) {
      const g = f.g == null ? 1 : f.g, gk = prog(f, 'grow', t, 1000), lv = gk >= 0 ? Math.max(0, g - 1) + PT.easeBack(gk) : g, hh = 60 + lv * 80;
      c.strokeStyle = '#4f9a40'; c.lineWidth = 9; c.beginPath(); c.moveTo(0, -110); c.quadraticCurveTo(Math.sin(t * 0.002) * 10, -110 - hh / 2, 0, -110 - hh); c.stroke();
      for (let i = 0; i < Math.min(3, Math.floor(lv) + 1); i++) { const y = -140 - i * 70, s = i % 2 ? 1 : -1; G.ell(c, s * 28, y, 28, 12, s * -0.4); G.fillO(c, '#7bd36a', 2.5); }
      const fy = -110 - hh, fr = 26 + lv * 8, spin = gk >= 0 ? gk * PT.TAU : 0;
      c.save(); c.translate(0, fy); c.rotate(spin + Math.sin(t * 0.002) * 0.1);
      for (let i = 0; i < 12; i++) { const a = (i / 12) * PT.TAU; G.ell(c, Math.cos(a) * fr, Math.sin(a) * fr, fr * 0.45, fr * 0.2, a); G.fillO(c, '#ffd23f', 1.5); }
      c.restore();
      G.circ(c, 0, fy, fr * 0.7); G.fillO(c, '#8b5a3c', 2.5);
      if (lv >= 2.5) { c.fillStyle = '#2a1f35'; G.circ(c, -fr * 0.25, fy - 4, 4); c.fill(); G.circ(c, fr * 0.25, fy - 4, 4); c.fill(); c.strokeStyle = '#2a1f35'; c.lineWidth = 3; c.beginPath(); c.arc(0, fy + 4, fr * 0.25, 0.3, Math.PI - 0.3); c.stroke(); }
      G.poly(c, [-80, -120, 80, -120, 58, 0, -58, 0]); G.fillO(c, '#d9784a', 4); G.rr(c, -90, -132, 180, 26, 8); G.fillO(c, '#e88a5a', 3.5);
      G.ell(c, 0, -122, 76, 8); c.fillStyle = '#6a4a2a'; c.fill();
      const w = prog(f, 'water', t, 1600);
      if (w >= 0) { c.save(); c.translate(-110, -220); c.rotate(0.5); G.rr(c, -40, -30, 70, 54, 12); G.fillO(c, '#58b9f0', 3); G.poly(c, [30, -10, 74, -40, 80, -30, 30, 10]); G.fillO(c, '#58b9f0', 2.5); c.restore(); for (let i = 0; i < 6; i++) { const kk = (t * 0.003 + i / 6) % 1; G.ell(c, -50 + (i % 3) * 10, -230 + kk * 100, 3, 6); c.fillStyle = '#7fd0f8'; c.fill(); } }
    } };

  /* ---------- 71 ペットショップ ---------- */
  const puppy = (c, x, col, ear, wag, t, i) => {
    const hop = wag ? -Math.abs(Math.sin(t * 0.02 + i)) * 18 : 0, ta = wag ? Math.sin(t * 0.06 + i) * 0.8 : Math.sin(t * 0.004 + i) * 0.2;
    c.save(); c.translate(x, hop);
    c.save(); c.translate(26, -40); c.rotate(-0.8 + ta); G.rr(c, -4, -30, 9, 32, 5); G.fillO(c, col, 2.5); c.restore();
    G.ell(c, 0, -40, 36, 30); G.fillO(c, col, 3); G.circ(c, -6, -92, 32); G.fillO(c, col, 3);
    for (const s of [-1, 1]) { G.ell(c, -6 + s * 30, -88, 11, 22, s * -0.3); G.fillO(c, ear, 2.5); }
    c.fillStyle = '#2a1f35'; G.circ(c, -18, -96, 4); c.fill(); G.circ(c, 6, -96, 4); c.fill(); G.ell(c, -6, -82, 7, 5); c.fill();
    if (wag) { G.ell(c, -6, -70, 6, 8); c.fillStyle = '#ff7f9f'; c.fill(); }
    G.ell(c, -18, -12, 10, 7); G.fillO(c, col, 2); G.ell(c, 8, -12, 10, 7); G.fillO(c, col, 2);
    c.restore();
  };
  F.s6_puppypen = { w: 340, h: 200, tags: ['dog', 'pet', 'animal'], slots: [[-220, 10], [220, 10]],
    draw(c, t, f) {
      const wg = on(f, 'wag', t);
      G.ell(c, 60, -10, 70, 16); G.fillO(c, '#ff8fb1', 2.5);
      puppy(c, -70, '#f2d2a0', '#c9925a', wg, t, 0); puppy(c, 70, '#ffffff', '#b07a4a', wg, t, 2);
      c.strokeStyle = '#ffffff'; c.lineWidth = 3; G.rr(c, -170, -70, 340, 12, 5); G.fillO(c, '#ffe6a0', 2.5);
      for (let x = -160; x <= 160; x += 40) { G.rr(c, x - 7, -84, 14, 84, 5); G.fillO(c, '#fff4d0', 2.5); }
      G.rr(c, -170, -28, 340, 12, 5); G.fillO(c, '#ffe6a0', 2.5);
      if (wg) { txt(c, 'ワン！', -90, -170 + Math.sin(t * 0.02) * 6, 28, '#e2433b', '#ffffff'); txt(c, 'ワン！', 110, -160 + Math.cos(t * 0.02) * 6, 24, '#ff9f4a', '#ffffff'); }
    } };
  F.s6_fishtank = { w: 280, h: 300, tags: ['fish', 'pet', 'water', 'tank'], slots: [[-200, 10], [200, 10]],
    draw(c, t, f) {
      const fd = on(f, 'feed', t), lk = on(f, 'look', t);
      G.rr(c, -130, -110, 260, 110, 10); G.fillO(c, '#58b9f0', 4); for (const x of [-60, 60]) { G.rr(c, x - 40, -90, 80, 70, 6); G.fillO(c, '#7fcaf5', 2); G.circ(c, x, -55, 5); c.fillStyle = '#ffffff'; c.fill(); }
      G.rr(c, -130, -290, 260, 184, 12); c.fillStyle = 'rgba(160,220,255,.75)'; c.fill(); c.strokeStyle = '#4c9be8'; c.lineWidth = 5; c.stroke();
      c.fillStyle = '#e2c08a'; G.ell(c, 0, -112, 124, 14); c.fill();
      c.strokeStyle = '#3aa86a'; c.lineWidth = 6; for (const x of [-100, -80, 90]) { c.beginPath(); c.moveTo(x, -114); for (let y = -114; y > -200; y -= 14) c.lineTo(x + Math.sin(y * 0.1 + t * 0.003) * 8, y); c.stroke(); }
      for (let i = 0; i < 4; i++) { const kk = (t * 0.0006 + i / 4) % 1; G.circ(c, 60 + Math.sin(kk * 10) * 6, -120 - kk * 160, 4 + kk * 3); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2; c.stroke(); }
      ['#ff9f4a', '#ff6f91', '#ffd23f'].forEach((col, i) => {
        const sp = fd ? 0.004 : 0.0012, ph = t * sp + i * 2.1, x = Math.sin(ph) * 90, dir = Math.cos(ph) > 0 ? 1 : -1;
        const y = fd ? -250 + Math.sin(t * 0.01 + i) * 8 : lk ? -180 + i * 10 : -220 + i * 34 + Math.sin(t * 0.002 + i) * 8;
        c.save(); c.translate(lk ? -60 + i * 60 : x, y); c.scale(lk ? 1 : dir, 1);
        G.poly(c, [-18, 0, -34, -12, -34, 12]); G.fillO(c, col, 2); G.ell(c, 0, 0, 22, 14); G.fillO(c, col, 2.5); c.fillStyle = '#2a1f35'; G.circ(c, 10, -3, 3); c.fill();
        c.restore();
      });
      if (fd) for (let i = 0; i < 8; i++) { const kk = ((t * 0.0008) + i / 8) % 1; c.fillStyle = '#c9785a'; c.fillRect(-80 + i * 22, -284 + kk * 60, 6, 4); }
      if (lk) for (let i = 0; i < 3; i++) { G.heart(c, -60 + i * 60, -230 - ((t * 0.05 + i * 20) % 40), 9); c.fillStyle = '#ff8fb1'; c.fill(); }
      G.rr(c, -136, -298, 272, 14, 6); G.fillO(c, '#3a6ad0', 3);
    } };
  F.s6_hamster = { w: 240, h: 260, tags: ['hamster', 'pet', 'animal', 'wheel'], slots: [[-180, 10], [180, 10]],
    draw(c, t, f) {
      const rn = on(f, 'run', t), a = rn ? t * 0.012 : t * 0.0008;
      G.rr(c, -110, -34, 220, 34, 10); G.fillO(c, '#ffb3c8', 3.5);
      c.fillStyle = '#fff1c2'; G.ell(c, -50, -36, 50, 8); c.fill();
      c.save(); c.translate(30, -130);
      G.circ(c, 0, 0, 74); c.strokeStyle = '#58b9f0'; c.lineWidth = 8; c.stroke(); c.lineWidth = 3; for (let i = 0; i < 8; i++) { const b = a + (i / 8) * PT.TAU; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(b) * 70, Math.sin(b) * 70); c.stroke(); }
      G.circ(c, 0, 0, 8); G.fillO(c, '#3a6ad0', 2);
      const bob = rn ? Math.abs(Math.sin(t * 0.04)) * 5 : 0;
      c.save(); c.translate(0, 46 - bob); if (rn) c.rotate(-0.15);
      G.ell(c, 0, 0, 30, 22); G.fillO(c, '#f2b26a', 3); G.ell(c, 6, 6, 18, 12); c.fillStyle = '#ffffff'; c.fill();
      for (const s of [-1, 1]) { G.circ(c, s * 12 + 10, -18, 7); G.fillO(c, '#ffb3c8', 2); }
      c.fillStyle = '#2a1f35'; G.circ(c, 20, -4, 3.5); c.fill(); G.circ(c, 30, 2, 3); c.fillStyle = '#ff7f9f'; c.fill();
      if (rn) { c.strokeStyle = '#c9925a'; c.lineWidth = 4; const l = Math.sin(t * 0.06) * 8; c.beginPath(); c.moveTo(-10, 18); c.lineTo(-10 + l, 26); c.moveTo(10, 18); c.lineTo(10 - l, 26); c.stroke(); }
      c.restore(); c.restore();
      G.poly(c, [-30, -34, 90, -34, 66, -60, -6, -60]); G.fillO(c, '#9aa3b8', 2.5);
      c.strokeStyle = 'rgba(150,160,180,.7)'; c.lineWidth = 3; for (let x = -100; x <= 100; x += 20) { c.beginPath(); c.moveTo(x, -34); c.lineTo(x, -220 + Math.abs(x) * 0.5); c.stroke(); }
      c.beginPath(); c.moveTo(-100, -170); c.quadraticCurveTo(0, -270, 100, -170); c.stroke();
      if (rn) { c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 4; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(30, -130, 86 + i * 8, -0.6 + i * 0.1, 0.2 + i * 0.1); c.stroke(); } }
    } };

  /* ---------- 72 テレビきょく ---------- */
  F.s6_tvcamera = { w: 220, h: 340, tags: ['camera', 'tv', 'studio'], slots: [[-170, 10], [170, 10]],
    draw(c, t, f) {
      const oa = on(f, 'onair', t), bl = Math.floor(t / 300) % 2;
      c.strokeStyle = '#3a3550'; c.lineWidth = 7; c.beginPath(); c.moveTo(0, -120); c.lineTo(-60, 0); c.moveTo(0, -120); c.lineTo(60, 0); c.moveTo(0, -120); c.lineTo(0, 0); c.stroke();
      for (const x of [-60, 0, 60]) { G.circ(c, x, -4, 7); G.fillO(c, '#3a3550', 2); }
      G.rr(c, -20, -140, 40, 24, 6); G.fillO(c, '#7a8398', 2.5);
      G.rr(c, -60, -210, 130, 76, 14); G.fillO(c, '#4a4f66', 4); G.rr(c, -110, -196, 54, 48, 10); G.fillO(c, '#3a3550', 3); G.circ(c, -112, -172, 20); G.fillO(c, '#7fd0ff', 3); G.circ(c, -118, -178, 6); c.fillStyle = '#ffffff'; c.fill();
      G.rr(c, 10, -232, 50, 26, 6); G.fillO(c, '#3a3550', 2.5); G.circ(c, 52, -200, 7); c.fillStyle = oa ? '#ff3b3b' : '#7a3a3a'; c.fill();
      c.strokeStyle = '#3a3550'; c.lineWidth = 5; c.beginPath(); c.moveTo(70, -170); c.lineTo(110, -150); c.stroke();
      if (oa) glow(c, 0, -300, 120, 'rgba(255,80,80,.45)');
      c.strokeStyle = '#3a3550'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -232); c.lineTo(0, -270); c.stroke();
      G.rr(c, -86, -326, 172, 60, 14); G.fillO(c, oa && bl ? '#ff3b3b' : oa ? '#e2433b' : '#5a5060', 4); txt(c, 'ON AIR', 0, -295, 34, oa ? '#ffffff' : '#9a909a');
    } };
  F.s6_newsdesk = { w: 360, h: 420, tags: ['desk', 'tv', 'studio', 'news'], slots: [[-230, 10], [230, 10]],
    draw(c, t, f) {
      const nw = on(f, 'news', t);
      c.strokeStyle = '#7a8398'; c.lineWidth = 8; c.beginPath(); c.moveTo(0, -130); c.lineTo(0, -270); c.stroke();
      G.rr(c, -130, -420, 260, 154, 12); G.fillO(c, '#3a3550', 4); G.rr(c, -118, -408, 236, 120, 6);
      c.save(); c.clip();
      if (nw) { c.fillStyle = '#bfe6ff'; c.fillRect(-118, -408, 236, 120); c.save(); c.translate(-40, -354); c.rotate(t * 0.002); for (let i = 0; i < 8; i++) { c.rotate(PT.TAU / 8); c.fillStyle = '#ffb020'; c.fillRect(30, -4, 18, 8); } c.restore(); G.circ(c, -40, -354, 26); G.fillO(c, '#ffd23f', 2.5); txt(c, 'はれ', 50, -360, 34, '#e2433b'); c.fillStyle = '#2a3a7a'; c.fillRect(-118, -312, 236, 24); const x = 118 - ((t * 0.12) % 520); txt(c, 'きょうも げんきに あそぼう！', x + 160, -300, 18, '#ffffff'); }
      else { c.fillStyle = '#2a3a7a'; c.fillRect(-118, -408, 236, 120); txt(c, 'あそびTV', 0, -348, 34, '#ffd23f'); }
      c.restore();
      G.rr(c, -170, -134, 340, 20, 8); G.fillO(c, '#ffffff', 3);
      G.rr(c, -160, -118, 320, 118, 12); G.fillO(c, '#3a6ad0', 4); c.fillStyle = '#ffd23f'; c.fillRect(-160, -96, 320, 8); txt(c, 'NEWS', 0, -54, 40, '#ffffff');
      c.strokeStyle = '#3a3550'; c.lineWidth = 4; c.beginPath(); c.moveTo(90, -134); c.lineTo(80, -170); c.stroke(); G.ell(c, 78, -178, 8, 12, -0.3); G.fillO(c, '#3a3550', 2);
      G.rr(c, -110, -142, 70, 10, 2); c.fillStyle = '#ffffff'; c.fill();
      if (nw) { G.circ(c, 78, -196, 6 + Math.abs(Math.sin(t * 0.02)) * 3); c.fillStyle = '#ff3b3b'; c.fill(); }
    } };
  const WX = ['はれ', 'あめ', 'ゆき', 'にじ'];
  F.s6_weatherboard = { w: 320, h: 380, tags: ['tv', 'studio', 'weather', 'board'], slots: [[-210, 10], [210, 10]],
    draw(c, t, f) {
      for (const x of [-100, 100]) { G.rr(c, x - 6, -130, 12, 130, 4); G.fillO(c, '#7a8398', 2); }
      G.rr(c, -150, -370, 300, 250, 16); G.fillO(c, '#3a6ad0', 4); G.rr(c, -134, -354, 268, 186, 10); c.fillStyle = '#bfe6ff'; c.fill();
      c.fillStyle = '#8fd36a'; P(c); c.moveTo(-100, -200); c.quadraticCurveTo(-120, -260, -60, -270); c.quadraticCurveTo(-20, -320, 40, -290); c.quadraticCurveTo(110, -300, 100, -240); c.quadraticCurveTo(110, -190, 40, -196); c.quadraticCurveTo(-20, -180, -100, -200); c.fill();
      const w = (f.wx || 0) % 4, k = prog(f, 'change', t, 700), s = k >= 0 ? PT.easeBack(Math.min(1, k * 1.5)) : 1;
      c.save(); c.translate(0, -262); c.scale(s, s);
      if (w === 0) { c.save(); c.rotate(t * 0.001); for (let i = 0; i < 8; i++) { c.rotate(PT.TAU / 8); G.poly(c, [44, -8, 64, 0, 44, 8]); G.fillO(c, '#ffb020', 2); } c.restore(); G.circ(c, 0, 0, 38); G.fillO(c, '#ffd23f', 3); c.fillStyle = '#2a1f35'; G.circ(c, -12, -6, 4); c.fill(); G.circ(c, 12, -6, 4); c.fill(); c.strokeStyle = '#2a1f35'; c.lineWidth = 3; c.beginPath(); c.arc(0, 4, 12, 0.3, Math.PI - 0.3); c.stroke(); }
      else if (w === 1 || w === 2) { for (const [x, y, r] of [[-30, 0, 30], [10, -14, 36], [44, 4, 26]]) { G.circ(c, x, y, r); G.fillO(c, w === 1 ? '#c9ccd8' : '#ffffff', 3); } for (let i = 0; i < 4; i++) { const kk = (t * 0.002 + i / 4) % 1; if (w === 1) { G.ell(c, -36 + i * 24, 36 + kk * 40, 4, 8); c.fillStyle = '#4c9be8'; c.fill(); } else { G.star(c, -36 + i * 24, 36 + kk * 40, 7, 3, 6); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#9fc8e8'; c.lineWidth = 1; c.stroke(); } } }
      else { for (let i = 0; i < 6; i++) { c.strokeStyle = RB[i]; c.lineWidth = 9; c.beginPath(); c.arc(0, 40, 80 - i * 9, Math.PI, PT.TAU); c.stroke(); } }
      c.restore();
      G.rr(c, -60, -164, 120, 36, 12); G.fillO(c, '#ffffff', 2.5); txt(c, WX[w], 0, -146, 24, '#3a6ad0');
    } };

  /* ================= ステージ ================= */
  const S = (o) => PT.STAGES.push(o);
  const bookshelf = (c, r, x, y, w, h) => {
    G.rr(c, x, y, w, h, 6); G.fillO(c, '#a8693d', 3); c.fillStyle = '#6e4226'; c.fillRect(x + 10, y + 10, w - 20, h - 20);
    for (let yy = y + 10; yy < y + h - 20; yy += 86) { let xx = x + 12; while (xx < x + w - 30) { const bw = 12 + r() * 14, bh = 50 + r() * 26; c.fillStyle = RB[Math.floor(r() * 8)]; c.fillRect(xx, yy + 78 - bh, bw - 2, bh); xx += bw; } c.fillStyle = '#c98e5a'; c.fillRect(x + 10, yy + 78, w - 20, 8); }
  };
  S({ id: 'library', num: 61, name: 'しずかな としょかん', bgm: 'title', floor: [600, 880], color: '#8d6e63',
    tools: ['book', 'teddy', 'bunny', 'magnifier', 'crayons', 'cushion', 'blanket', 'roundglasses', 'owl', 'spellbook', 'letter'], rides: ['tricycle', 'carpet'],
    spawn: [['gaku', 600, 780], ['mimi', 820, 760], ['jiji', 1020, 800], ['pyoko', 420, 800], ['sakura', 1240, 800]],
    fixtures: [['s6_bigbook', 800, 700], ['s6_ladder', 260, 680], ['s6_storychair', 1320, 700]], favs: ['book', 'roundglasses', 'owl', 'cushion', 'spellbook'],
    bg(c, r) {
      B.wallpaper(c, 600, '#f6ead6', '#efdcc0');
      for (const x of [0, 190, 1220, 1410]) bookshelf(c, r, x, 150, 180, 450);
      B.window(c, 520, 170, 560, 260, (c2, x, y, w, h) => { B.sky(c2, '#9fd8ff', '#e3f6ff', y + h); B.cloud(c2, x + 120, y + 70, 0.7); B.tree(c2, x + 440, y + h + 40, 0.9); });
      G.rr(c, 600, 40, 400, 80, 30); G.fillO(c, '#8d6e63', 4); txt(c, 'としょかん', 800, 82, 44, '#fff8e8');
      bookshelf(c, r, 400, 460, 800, 140);
      B.floorWood(c, 600, '#d9b07a');
      G.ell(c, 800, 790, 420, 70); c.fillStyle = '#ffd1e0'; c.fill(); G.ell(c, 800, 790, 340, 54); c.fillStyle = '#fff1c2'; c.fill(); G.ell(c, 800, 790, 250, 38); c.fillStyle = '#c9e8ff'; c.fill();
    } });
  S({ id: 'atelier', num: 62, name: 'おえかき アトリエ', bgm: 'home', floor: [600, 880], color: '#ec407a',
    tools: ['crayons', 'beret', 'apron', 'camera', 'flower', 'apple', 'bucket', 'blocks', 'rainbow', 'star', 'mirror'], rides: ['car', 'tricycle'],
    spawn: [['sakura', 600, 780], ['choco', 820, 760], ['yume', 1020, 800], ['pon', 420, 800], ['baba', 1240, 800]],
    fixtures: [['s6_easel', 780, 680], ['s6_paintpots', 300, 770], ['s6_clay', 1320, 700]], favs: ['beret', 'crayons', 'apron', 'rainbow'],
    bg(c, r) {
      B.wallpaper(c, 600, '#fdfaf3', '#f6efe2');
      for (let i = 0; i < 3; i++) { G.poly(c, [300 + i * 400, 0, 500 + i * 400, 0, 470 + i * 400, 90, 330 + i * 400, 90]); G.fillO(c, '#bfe6ff', 3); }
      const pics = [[120, 160, 200, 150], [380, 200, 140, 180], [1060, 180, 180, 140], [1300, 150, 200, 200]];
      pics.forEach(([x, y, w, h], i) => B.frame(c, x, y, w, h, ['#e7b56a', '#ff8fb1', '#58b9f0', '#7bd36a'][i], (c2, xx, yy, ww, hh) => { for (let j = 0; j < 5; j++) { G.circ(c2, xx + r() * ww, yy + r() * hh, 10 + r() * 24); c2.fillStyle = RB[Math.floor(r() * 8)]; c2.globalAlpha = 0.8; c2.fill(); c2.globalAlpha = 1; } }));
      G.rr(c, 620, 140, 360, 70, 30); G.fillO(c, '#ec407a', 4); txt(c, 'アトリエ', 800, 177, 40, '#ffffff');
      for (let i = 0; i < 18; i++) { c.save(); c.translate(80 + i * 85, 420 + Math.sin(i) * 30); G.circ(c, 0, 0, 7); c.fillStyle = RB[i % 8]; c.fill(); c.restore(); }
      B.floorWood(c, 600, '#e8cfa4');
      for (let i = 0; i < 26; i++) { G.ell(c, r() * W, 630 + r() * 240, 10 + r() * 22, 5 + r() * 9); c.fillStyle = RB[Math.floor(r() * 8)]; c.globalAlpha = 0.55; c.fill(); c.globalAlpha = 1; }
    } });
  S({ id: 'musicroom', num: 63, name: 'おんがく きょうしつ', bgm: 'fun', floor: [600, 880], color: '#7e57c2',
    tools: ['music', 'drum', 'trumpet', 'guitar', 'tambourine', 'maracas', 'xylophone', 'musicbox', 'harp', 'bowtie'], rides: ['train', 'horse'],
    spawn: [['yuto', 600, 780], ['mimi', 820, 760], ['pon', 1020, 800], ['yume', 420, 800], ['papa', 1240, 800]],
    fixtures: [['s6_grandpiano', 340, 700], ['s6_handbells', 860, 760], ['s6_podium', 1330, 700]], favs: ['trumpet', 'guitar', 'tambourine', 'xylophone', 'bowtie'],
    bg(c, r) {
      B.wallpaper(c, 600, '#eaf6e6', '#ddf0d6');
      G.rr(c, 460, 120, 680, 280, 12); G.fillO(c, '#a8693d', 4); G.rr(c, 476, 136, 648, 248, 6); c.fillStyle = '#2f5a4a'; c.fill();
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2.5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(520, 200 + i * 22); c.lineTo(1080, 200 + i * 22); c.stroke(); }
      txt(c, '𝄞', 550, 250, 110, '#ffffff');
      [[650, 266], [720, 244], [790, 222], [860, 244], [930, 200], [1000, 222]].forEach(([x, y]) => G.note(c, x, y, 26, '#ffffff'));
      G.rr(c, 500, 400, 600, 14, 4); G.fillO(c, '#c98e5a', 2);
      for (const x of [120, 1340]) B.window(c, x, 150, 160, 200, (c2, xx, y, w, h) => { B.sky(c2, '#9fd8ff', '#e3f6ff', y + h); B.cloud(c2, xx + 60, y + 60, 0.5); });
      for (let i = 0; i < 12; i++) G.note(c, 60 + i * 135, 470 + Math.sin(i * 2) * 30, 22, RB[i % 8]);
      B.floorWood(c, 600, '#d9a86a');
    } });
  S({ id: 'policestation', num: 64, name: 'まちの けいさつしょ', bgm: 'shop', floor: [600, 880], color: '#3949ab',
    tools: ['police', 'phone', 'flashlight', 'magnifier', 'teddy', 'umbrella', 'bag', 'letter', 'sunglasses', 'onigiri'], rides: ['car', 'bicycle', 'bus'],
    spawn: [['papa', 600, 780], ['lulu', 820, 760], ['kon', 1020, 800], ['futan', 420, 800], ['ricky', 1240, 820]],
    fixtures: [['s6_patrolcar', 380, 760], ['s6_signal', 900, 660], ['s6_lostfound', 1320, 700]], favs: ['police', 'flashlight', 'magnifier', 'car'],
    bg(c, r) {
      B.sky(c, '#8fd3ff', '#eaf8ff', 520); B.cloud(c, 160, 90, 0.9); B.cloud(c, 1400, 70, 0.8);
      G.rr(c, 360, 120, 880, 420, 10); G.fillO(c, '#f2f5fb', 4); G.rr(c, 340, 100, 920, 40, 8); G.fillO(c, '#3949ab', 4);
      G.rr(c, 600, 160, 400, 80, 20); G.fillO(c, '#3949ab', 4); txt(c, 'けいさつしょ', 800, 200, 40, '#ffffff');
      G.star(c, 800, 290, 36, 15); G.fillO(c, '#ffd23f', 3);
      for (const x of [420, 520, 1000, 1100]) { G.rr(c, x, 260, 80, 90, 6); G.fillO(c, '#9fd8ff', 3); }
      G.rr(c, 700, 360, 200, 180, 8); G.fillO(c, '#b8c4e0', 3); c.strokeStyle = '#7a8398'; c.lineWidth = 3; c.beginPath(); c.moveTo(800, 360); c.lineTo(800, 540); c.stroke();
      G.circ(c, 660, 380, 16); G.fillO(c, '#ff4a4a', 3);
      for (let i = 0; i < 4; i++) { B.tree(c, 60 + i * 80, 540, 0.6); B.tree(c, 1320 + i * 80, 540, 0.6); }
      c.fillStyle = '#d8dce6'; c.fillRect(0, 520, W, 80); c.fillStyle = '#b8bcc8'; for (let x = 0; x < W; x += 80) c.fillRect(x, 520, 4, 80);
      c.fillStyle = '#8a90a0'; c.fillRect(0, 600, W, H - 600); c.fillStyle = '#ffffff'; for (let x = 20; x < W; x += 160) c.fillRect(x, 830, 90, 10);
    } });
  S({ id: 'postoffice', num: 65, name: 'ゆうびんきょく', bgm: 'shop', floor: [600, 880], color: '#e53935',
    tools: ['letter', 'present', 'box', 'invitation', 'bag', 'phone', 'camera', 'crayons', 'ticket'], rides: ['bicycle', 'car', 'bus', 'airplane'],
    spawn: [['mama', 600, 780], ['pyoko', 820, 760], ['moko', 1020, 800], ['yuto', 420, 800], ['baba', 1240, 800]],
    fixtures: [['s6_postbox', 280, 700], ['s6_stampdesk', 800, 700], ['s6_postbike', 1320, 780]], favs: ['letter', 'present', 'box', 'invitation'],
    bg(c, r) {
      B.wallpaper(c, 600, '#fff1e4', '#ffe6d0');
      G.rr(c, 580, 60, 440, 84, 30); G.fillO(c, '#e53935', 4); txt(c, '〒 ゆうびんきょく', 800, 104, 40, '#ffffff');
      G.rr(c, 80, 200, 400, 300, 8); G.fillO(c, '#c98e5a', 4); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { G.rr(c, 96 + i * 96, 216 + j * 70, 84, 58, 4); c.fillStyle = '#8a5a3a'; c.fill(); if (r() < 0.7) { c.fillStyle = ['#ffffff', '#fff1c2', '#ffd1e0', '#c9e8ff'][(i + j) % 4]; c.fillRect(104 + i * 96, 236 + j * 70, 60, 34); } }
      G.rr(c, 560, 200, 480, 240, 12); G.fillO(c, '#ffffff', 4); for (let i = 0; i < 3; i++) { G.rr(c, 580 + i * 155, 220, 130, 120, 10); G.fillO(c, '#c9e8ff', 2.5); }
      txt(c, 'まどぐち', 800, 400, 34, '#e53935');
      G.rr(c, 1120, 200, 380, 280, 10); G.fillO(c, '#ffffff', 4); c.fillStyle = '#9fd8ff'; c.fillRect(1136, 216, 348, 248);
      for (let i = 0; i < 6; i++) { c.save(); c.translate(1180 + (i % 3) * 110, 280 + Math.floor(i / 3) * 110); c.rotate((i - 2.5) * 0.08); G.rr(c, -40, -26, 80, 52, 4); G.fillO(c, '#ffffff', 2); G.rr(c, 16, -20, 18, 22, 2); c.fillStyle = RB[i]; c.fill(); c.restore(); }
      c.fillStyle = '#e9e2d8'; c.fillRect(0, 600, W, H - 600); c.fillStyle = '#ddd4c8'; for (let x = 0; x < W; x += 100) for (let y = 600; y < H; y += 70) if (((x / 100) + (y - 600) / 70) % 2 === 0) c.fillRect(x, y, 100, 70);
      c.fillStyle = '#e53935'; c.fillRect(0, 596, W, 8);
    } });
  S({ id: 'construction', num: 66, name: 'がんばる こうじげんば', bgm: 'park', floor: [600, 880], color: '#f9a825',
    tools: ['blocks', 'box', 'bucket', 'broom', 'robottoy', 'onigiri', 'juice', 'robotsuit', 'explorer'], rides: ['car', 'tricycle', 'train'],
    spawn: [['papa', 600, 780], ['gaku', 820, 760], ['ricky', 1020, 800], ['kon', 420, 800], ['panda', 1240, 800]],
    fixtures: [['s6_excavator', 360, 760], ['s6_crane', 1140, 700], ['s6_mixer', 800, 820]], favs: ['blocks', 'box', 'bucket', 'explorer'],
    bg(c, r) {
      B.sky(c, '#9fd8ff', '#fff4dc', 560); B.cloud(c, 260, 110, 1); B.cloud(c, 1200, 80, 0.8);
      c.strokeStyle = '#ff9a3a'; c.lineWidth = 12; for (let x = 520; x <= 1080; x += 140) { c.beginPath(); c.moveTo(x, 560); c.lineTo(x, 200); c.stroke(); } for (let y = 200; y <= 560; y += 90) { c.beginPath(); c.moveTo(520, y); c.lineTo(1080, y); c.stroke(); }
      c.strokeStyle = 'rgba(255,154,58,.6)'; c.lineWidth = 4; for (let x = 520; x < 1080; x += 140) for (let y = 200; y < 560; y += 90) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 140, y + 90); c.stroke(); }
      for (const x of [140, 1360]) B.house(c, x - 100, 560, 200, 200, '#fff1dc', '#58b9f0');
      for (let x = 0; x < W; x += 80) { G.rr(c, x + 4, 500, 72, 60, 4); G.fillO(c, x % 160 ? '#ffffff' : '#ff9a3a', 2.5); }
      c.fillStyle = G.grad(c, 0, 560, 0, H, [[0, '#d9b07a'], [1, '#c99a64']]); c.fillRect(0, 560, W, H - 560);
      c.fillStyle = 'rgba(140,100,60,.3)'; for (let i = 0; i < 40; i++) { G.circ(c, r() * W, 600 + r() * 280, 3 + r() * 6); c.fill(); }
      for (const x of [80, 1540]) { G.poly(c, [x - 26, 640, x + 26, 640, x + 8, 570, x - 8, 570]); G.fillO(c, '#ff7a3a', 2.5); c.fillStyle = '#ffffff'; c.fillRect(x - 16, 600, 32, 10); }
    } });
  S({ id: 'hairsalon', num: 67, name: 'キラキラ びよういん', bgm: 'home', floor: [600, 880], color: '#f06292',
    tools: ['mirror', 'ribbon', 'tiara', 'flowercrown', 'hearttiara', 'catears', 'bubbles', 'sunglasses', 'heartglasses', 'juice'], rides: ['car'],
    spawn: [['sakura', 600, 780], ['mama', 820, 760], ['mimi', 1020, 800], ['choco', 420, 800], ['nyan', 1240, 800]],
    fixtures: [['s6_salonchair', 800, 720], ['s6_dryer', 300, 720], ['s6_shampoo', 1300, 740]], favs: ['ribbon', 'mirror', 'tiara', 'flowercrown', 'hearttiara'],
    bg(c, r) {
      B.wallpaper(c, 600, '#ffeef4', '#ffe0ea');
      G.rr(c, 580, 50, 440, 80, 34); G.fillO(c, '#f06292', 4); txt(c, 'びよういん', 800, 92, 42, '#ffffff');
      for (let i = 0; i < 4; i++) { const x = 120 + i * 120 + (i > 1 ? 840 : 0); B.frame(c, x, 170, 100, 120, '#ffd1e0', (c2, xx, yy, ww, hh) => { G.circ(c2, xx + ww / 2, yy + hh / 2 + 10, 24); c2.fillStyle = '#ffe0cc'; c2.fill(); G.circ(c2, xx + ww / 2, yy + hh / 2 - 12, 28); c2.fillStyle = ['#8a5a3a', '#ffb020', '#c38be0', '#2a1f35'][i]; c2.fill(); G.circ(c2, xx + ww / 2, yy + hh / 2 + 14, 20); c2.fillStyle = '#ffe0cc'; c2.fill(); }); }
      for (const x of [140, 1180]) { G.rr(c, x, 340, 280, 16, 4); G.fillO(c, '#ffffff', 2.5); for (let i = 0; i < 6; i++) { G.rr(c, x + 14 + i * 44, 290, 28, 50, 8); G.fillO(c, RB[(i + (x > 600 ? 3 : 0)) % 8], 2); } }
      c.fillStyle = '#fff6fa'; c.fillRect(0, 600, W, H - 600); c.fillStyle = '#ffd6e6'; for (let x = 0; x < W; x += 80) for (let y = 600; y < H; y += 80) if (((x + y - 600) / 80) % 2 === 0) c.fillRect(x, y, 80, 80);
      c.fillStyle = '#f06292'; c.fillRect(0, 594, W, 10);
    } });
  S({ id: 'ramen', num: 68, name: 'ほかほか ラーメンやさん', bgm: 'fest', floor: [600, 880], color: '#d84315',
    tools: ['onigiri', 'bento', 'juice', 'chef', 'apron', 'plate', 'table', 'chair', 'corn', 'carrot'], rides: ['car', 'bicycle'],
    spawn: [['moko', 600, 780], ['jiji', 820, 760], ['panda', 1020, 800], ['futan', 420, 800], ['pon', 1240, 800]],
    fixtures: [['s6_ramenbowl', 800, 720], ['s6_noodlepot', 280, 720], ['s6_yatai', 1300, 720]], favs: ['chef', 'apron', 'bento', 'onigiri'],
    bg(c, r) {
      c.fillStyle = '#e8c79a'; c.fillRect(0, 0, W, 600); c.strokeStyle = 'rgba(140,90,40,.3)'; c.lineWidth = 3; for (let x = 0; x < W; x += 50) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 600); c.stroke(); }
      G.rr(c, 0, 0, W, 60, 0); G.fillO(c, '#7a4a2a', 3);
      ['しょうゆ', 'みそ', 'しお', 'とんこつ', 'ぎょうざ', 'チャーハン'].forEach((s, i) => { const x = 360 + i * 150; G.rr(c, x - 50, 120, 100, 180, 6); G.fillO(c, '#fff4dc', 3); c.save(); c.translate(x, 210); c.rotate(Math.PI / 2); txt(c, s, 0, 0, 28, '#2a1f35'); c.restore(); });
      for (const x of [140, 1460]) { c.strokeStyle = '#3a3550'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, 60); c.lineTo(x, 110); c.stroke(); G.ell(c, x, 170, 50, 66); G.fillO(c, '#e2433b', 4); G.rr(c, x - 24, 100, 48, 10, 3); c.fillStyle = '#2a2a3a'; c.fill(); G.rr(c, x - 24, 230, 48, 10, 3); c.fill(); txt(c, 'ら', x, 170, 40, '#ffffff'); }
      G.rr(c, 0, 400, W, 200, 0); c.fillStyle = '#7a4a2a'; c.fill(); G.rr(c, 0, 400, W, 24, 0); G.fillO(c, '#a8693d', 3);
      for (let i = 0; i < 10; i++) { const x = 80 + i * 160; G.circ(c, x, 470, 26); G.fillO(c, '#e2433b', 3); G.rr(c, x - 6, 490, 12, 110, 3); G.fillO(c, '#9aa3b8', 2); }
      c.fillStyle = '#5a3a2a'; c.fillRect(0, 600, W, H - 600); c.fillStyle = 'rgba(255,255,255,.06)'; for (let x = 0; x < W; x += 60) for (let y = 600; y < H; y += 60) if (((x + y) / 60) % 2) c.fillRect(x, y, 60, 60);
    } });
  S({ id: 'icecreamshop', num: 69, name: 'ひんやり アイスクリームやさん', bgm: 'fun', floor: [600, 880], color: '#f48fb1',
    tools: ['icecream', 'candy', 'cookie', 'strawberry', 'banana', 'juice', 'donut', 'cake', 'pudding', 'parasol'], rides: ['car', 'tricycle'],
    spawn: [['pyoko', 600, 780], ['lulu', 820, 760], ['penta', 1020, 800], ['sakura', 420, 800], ['nyan', 1240, 800]],
    fixtures: [['s6_icetower', 800, 740], ['s6_softserve', 300, 700], ['s6_parfait', 1300, 740]], favs: ['icecream', 'strawberry', 'cookie', 'candy'],
    bg(c, r) {
      B.sky(c, '#a8e0ff', '#fff0f6', 600); B.cloud(c, 160, 80, 0.8); B.cloud(c, 1420, 100, 0.7);
      G.rr(c, 180, 200, 1240, 400, 10); G.fillO(c, '#fff8f0', 4);
      for (let i = 0; i < 16; i++) { P(c); const x = 160 + i * 80; c.moveTo(x, 170); c.lineTo(x + 80, 170); c.lineTo(x + 80, 250); c.quadraticCurveTo(x + 40, 280, x, 250); c.closePath(); c.fillStyle = i % 2 ? '#ffffff' : '#ff8fb1'; c.fill(); c.strokeStyle = '#e06f91'; c.lineWidth = 2; c.stroke(); }
      G.rr(c, 560, 70, 480, 90, 40); G.fillO(c, '#f48fb1', 4); txt(c, 'アイスクリーム', 800, 116, 44, '#ffffff');
      for (const x of [110, 1490]) { G.poly(c, [x - 50, 330, x + 50, 330, x, 560]); G.fillO(c, '#e7b56a', 4); scoop(c, x, 300, 56, x < 800 ? '#ffb3c8' : '#b8f0c8'); scoop(c, x, 230, 46, '#fff1c2'); }
      for (const x of [300, 1100]) { G.rr(c, x, 300, 200, 160, 10); G.fillO(c, '#c9e8ff', 3); for (let i = 0; i < 4; i++) { G.circ(c, x + 30 + i * 46, 420, 18); G.fillO(c, SC[i * 2], 2); } }
      G.rr(c, 640, 300, 320, 300, 10); G.fillO(c, '#ffd1e0', 4); G.rr(c, 670, 330, 260, 270, 8); c.fillStyle = '#fff4f8'; c.fill();
      c.fillStyle = '#fff6fa'; c.fillRect(0, 600, W, H - 600); for (let x = 0; x < W; x += 80) for (let y = 600; y < H; y += 80) { c.fillStyle = ((x + y - 600) / 80) % 2 ? '#d4f2ff' : '#ffe0ec'; c.fillRect(x, y, 80, 80); }
    } });
  S({ id: 'flowershop', num: 70, name: 'いいにおい おはなやさん', bgm: 'park', floor: [600, 880], color: '#66bb6a',
    tools: ['flower', 'rose', 'sunflower', 'wateringcan', 'seed', 'basket', 'petals', 'flowercrown', 'bugnet', 'present'], rides: ['tricycle', 'bicycle'],
    spawn: [['mama', 600, 780], ['pyoko', 820, 760], ['baba', 1020, 800], ['choco', 420, 800], ['lulu', 1240, 800]],
    fixtures: [['s6_bouquet', 800, 720], ['s6_flowerstand', 300, 720], ['s6_bigpot', 1320, 740]], favs: ['rose', 'flower', 'wateringcan', 'flowercrown', 'petals'],
    bg(c, r) {
      B.wallpaper(c, 600, '#eaf8ee', '#dcf2e2');
      G.rr(c, 560, 50, 480, 84, 34); G.fillO(c, '#66bb6a', 4); txt(c, 'おはなやさん', 800, 94, 42, '#ffffff');
      B.window(c, 540, 170, 520, 240, (c2, x, y, w, h) => { B.sky(c2, '#9fd8ff', '#e3f6ff', y + h); B.cloud(c2, x + 100, y + 60, 0.6); for (let i = 0; i < 6; i++) B.tree(c2, x + 40 + i * 90, y + h + 30, 0.6); });
      for (const x of [80, 1120]) { for (let s = 0; s < 3; s++) { G.rr(c, x, 220 + s * 120, 400, 14, 4); G.fillO(c, '#c98e5a', 2.5); for (let i = 0; i < 5; i++) { const px = x + 40 + i * 80, py = 220 + s * 120; G.poly(c, [px - 22, py - 40, px + 22, py - 40, px + 16, py, px - 16, py]); G.fillO(c, '#d9784a', 2); if ((i + s) % 2) { for (const [dx, dy] of [[-12, -60], [10, -64], [0, -76]]) flower(c, px + dx, py + dy, 12, FC[(i + s * 2) % 6]); } else { for (let k = 0; k < 4; k++) { G.ell(c, px - 15 + k * 10, py - 58, 7, 18, (k - 1.5) * 0.3); c.fillStyle = '#6ac06a'; c.fill(); } } } } }
      for (const x of [400, 1200]) { c.strokeStyle = '#8a7a6a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 40); c.stroke(); G.ell(c, x, 60, 46, 26); G.fillO(c, '#c98e5a', 3); for (let k = 0; k < 4; k++) { G.ell(c, x - 30 + k * 20, 90 + (k % 2) * 16, 7, 20); c.fillStyle = '#6ac06a'; c.fill(); } }
      c.fillStyle = '#e8b48a'; c.fillRect(0, 600, W, H - 600); c.strokeStyle = 'rgba(160,100,60,.35)'; c.lineWidth = 3; for (let x = 0; x < W; x += 100) for (let y = 600; y < H; y += 60) c.strokeRect(x + (((y - 600) / 60) % 2) * 50, y, 100, 60);
    } });
  S({ id: 'petshop', num: 71, name: 'なかよし ペットショップ', bgm: 'home', floor: [600, 880], color: '#ffa726',
    tools: ['teddy', 'ball', 'bunny', 'penguin', 'panda', 'duck', 'goldfish', 'catears', 'blackcat', 'owl', 'frog'], rides: ['car', 'tricycle'],
    spawn: [['lulu', 600, 780], ['nyan', 820, 760], ['pyoko', 1020, 800], ['yuto', 420, 800], ['kon', 1240, 800]],
    fixtures: [['s6_puppypen', 800, 760], ['s6_fishtank', 300, 700], ['s6_hamster', 1320, 720]], favs: ['ball', 'catears', 'goldfish', 'teddy'],
    bg(c, r) {
      B.wallpaper(c, 600, '#fff6dc', '#fff0c8');
      G.rr(c, 540, 50, 520, 84, 34); G.fillO(c, '#ffa726', 4); txt(c, 'ペットショップ', 800, 94, 42, '#ffffff');
      for (let i = 0; i < 22; i++) { const x = r() * W, y = 160 + r() * 380; c.fillStyle = 'rgba(255,167,38,.18)'; G.ell(c, x, y, 12, 10); c.fill(); for (let k = 0; k < 3; k++) { G.circ(c, x - 12 + k * 12, y - 14 - (k === 1 ? 4 : 0), 5); c.fill(); } }
      for (const x of [120, 1180]) { for (let s = 0; s < 2; s++) { G.rr(c, x, 300 + s * 140, 300, 14, 4); G.fillO(c, '#c98e5a', 2.5); for (let i = 0; i < 4; i++) { G.rr(c, x + 14 + i * 72, 240 + s * 140, 56, 60, 8); G.fillO(c, RB[(i + s * 3) % 8], 2.5); G.circ(c, x + 42 + i * 72, 268 + s * 140, 12); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); } } }
      G.rr(c, 560, 180, 480, 280, 12); G.fillO(c, '#ffffff', 4); for (let i = 0; i < 3; i++) { G.rr(c, 580 + i * 155, 200, 130, 110, 10); G.fillO(c, '#ffe6a0', 2.5); G.rr(c, 580 + i * 155, 330, 130, 110, 10); G.fillO(c, '#ffe6a0', 2.5); }
      [['#ffffff', 645, 270], ['#f2b26a', 800, 400], ['#c9925a', 955, 270]].forEach(([col, x, y]) => { G.circ(c, x, y, 26); G.fillO(c, col, 2.5); for (const s of [-1, 1]) { G.circ(c, x + s * 18, y - 22, 9); G.fillO(c, col, 2); } c.fillStyle = '#2a1f35'; G.circ(c, x - 8, y - 4, 3); c.fill(); G.circ(c, x + 8, y - 4, 3); c.fill(); });
      c.fillStyle = '#f6e6c8'; c.fillRect(0, 600, W, H - 600); c.fillStyle = '#efd8b0'; for (let x = 0; x < W; x += 80) for (let y = 600; y < H; y += 80) if (((x + y - 600) / 80) % 2 === 0) c.fillRect(x, y, 80, 80);
    } });
  S({ id: 'tvstudio', num: 72, name: 'わくわく テレビきょく', bgm: 'fun', floor: [600, 880], color: '#5c6bc0', night: true,
    tools: ['camera', 'music', 'partyhat', 'bowtie', 'sunglasses', 'mirrorball', 'confetti', 'star', 'phone', 'umbrella'], rides: ['car'],
    spawn: [['yume', 600, 780], ['ricky', 820, 760], ['sakura', 1020, 800], ['gaku', 420, 800], ['mimi', 1240, 800]],
    fixtures: [['s6_tvcamera', 300, 760], ['s6_newsdesk', 800, 680], ['s6_weatherboard', 1320, 690]], favs: ['bowtie', 'sunglasses', 'partyhat', 'camera', 'mirrorball'],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 600, [[0, '#262a4a'], [1, '#3a3f6a']]); c.fillRect(0, 0, W, 600);
      c.strokeStyle = '#7a8398'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 40); c.lineTo(W, 40); c.moveTo(0, 70); c.lineTo(W, 70); c.stroke(); c.lineWidth = 3; for (let x = 0; x < W; x += 40) { c.beginPath(); c.moveTo(x, 40); c.lineTo(x + 40, 70); c.stroke(); }
      for (let i = 0; i < 7; i++) { const x = 120 + i * 230; G.rr(c, x - 22, 70, 44, 40, 8); G.fillO(c, '#3a3550', 2.5); c.fillStyle = 'rgba(255,248,210,.10)'; P(c); c.moveTo(x - 18, 110); c.lineTo(x + 18, 110); c.lineTo(x + 90, 600); c.lineTo(x - 90, 600); c.closePath(); c.fill(); }
      G.rr(c, 300, 150, 1000, 380, 30); c.fillStyle = G.grad(c, 0, 150, 0, 530, [[0, '#7c83e8'], [1, '#c38be0']]); c.fill();
      for (let i = 0; i < 24; i++) { G.star(c, 320 + r() * 960, 170 + r() * 340, 6 + r() * 10, 3 + r() * 3); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill(); }
      G.rr(c, 600, 170, 400, 80, 30); G.fillO(c, '#ffd23f', 4); txt(c, 'あそびTV', 800, 211, 44, '#5c3aa8');
      c.fillStyle = '#2a2a40'; c.fillRect(0, 600, W, H - 600); c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 2; for (let x = 0; x < W; x += 100) { c.beginPath(); c.moveTo(x, 600); c.lineTo(x, H); c.stroke(); } for (let y = 640; y < H; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      G.ell(c, 800, 760, 520, 90); c.fillStyle = 'rgba(255,255,255,.06)'; c.fill();
    } });
})();
