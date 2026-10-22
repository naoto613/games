/* ふえた ステージ（85〜96）：おしょうがつ〜おたんじょうび パーティー */
'use strict';
(() => {
  const G = PT.G, B = PT.BG, F = PT.FIX, W = PT.W, H = PT.H;
  const on = (f, k, t) => f[k] && t < f[k];
  const prog = (f, k, t, ms) => (on(f, k, t) ? 1 - (f[k] - t) / ms : -1);
  const dot = (c, x, y, r, col) => { G.circ(c, x, y, r); c.fillStyle = col; c.fill(); };
  const eyes = (c, x, y, d = 8, r = 3) => { dot(c, x - d, y, r, '#2a1f35'); dot(c, x + d, y, r, '#2a1f35'); };
  const smile = (c, x, y, r = 6, lw = 2) => { c.strokeStyle = '#2a1f35'; c.lineWidth = lw; c.beginPath(); c.arc(x, y, r, 0.2, Math.PI - 0.2); c.stroke(); };
  const cheeks = (c, x, y, d = 14, r = 4) => { c.fillStyle = 'rgba(255,120,150,.5)'; G.circ(c, x - d, y, r); c.fill(); G.circ(c, x + d, y, r); c.fill(); };
  const txt = (c, s, x, y, size, col, stroke) => { c.font = `900 ${size}px ${PT.FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; if (stroke) { c.lineWidth = 6; c.lineJoin = 'round'; c.strokeStyle = stroke; c.strokeText(s, x, y); } c.fillStyle = col; c.fillText(s, x, y); };
  const RAIN = ['#ff6f91', '#ffd23f', '#7bd36a', '#58b9f0', '#9b8cff'];
  const stroke = (c, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };

  /* うごきの みち（react-stage8.js と きょうつう） */
  const P8 = (PT.S8 = {
    ufo: (k) => [Math.sin(k * PT.TAU) * 280, -Math.sin(k * Math.PI) * 300],
    tube: (k) => [-300 + 600 * k, -40 - Math.sin(k * Math.PI) * 240],
    car: (k) => [Math.sin(k * PT.TAU) * 260, -60 - Math.sin(k * Math.PI) * 220],
    peach: (k) => -260 + 520 * k,
    acorn: (k) => Math.sin(k * Math.PI) * 300,
    boat: (k) => Math.sin(k * PT.TAU) * 280,
    coaster: (k) => [-400 + 800 * k, -60 - 290 * Math.pow(Math.sin(Math.PI * k * 3), 2) * (1 - 0.4 * k)],
    tower: (k) => (k < 0.55 ? (k / 0.55) * 400 : k < 0.68 ? 400 : k < 0.8 ? 400 * (1 - (k - 0.68) / 0.12) : Math.abs(Math.sin(((k - 0.8) / 0.2) * Math.PI * 2)) * 40 * (1 - (k - 0.8) / 0.2)),
  });

  /* ---------- 85 おしょうがつ ---------- */
  F.s8_mochi = { w: 260, h: 240, tags: ['mochi', 'newyear', 'food'], slots: [[-170, 20], [170, 20]],
    draw(c, t, f) {
      const pd = on(f, 'pound', t), ph = pd ? Math.abs(Math.sin(t * 0.012)) : 0.5, dn = pd ? 1 - ph : 0;
      G.rr(c, -78, -96, 156, 96, 26); G.fillO(c, '#b07a48', 4);
      c.strokeStyle = 'rgba(90,50,20,.35)'; c.lineWidth = 3; for (const y of [-66, -36]) { c.beginPath(); c.moveTo(-70, y); c.lineTo(70, y); c.stroke(); }
      G.ell(c, 0, -96, 76, 18); G.fillO(c, '#c99a64', 3);
      G.ell(c, 0, -104, 52 * (1 + dn * 0.25), 18 * (1 - dn * 0.35)); G.fillO(c, '#fffaf0', 3);
      c.save(); c.translate(14, -128 - ph * 80); c.rotate(0.5 - ph * 0.3);
      G.rr(c, -5, -150, 10, 140, 4); G.fillO(c, '#d9a86a', 2.5);
      G.rr(c, -36, -18, 72, 34, 12); G.fillO(c, '#b07a48', 3);
      c.restore();
      if (pd && dn > 0.8) txt(c, 'ぺったん', -120, -210, 30, '#ff6f91', '#ffffff');
    } };
  F.s8_kite = { w: 240, h: 500, tags: ['kite', 'newyear', 'wind'], slots: [[-140, 20], [140, 20]],
    draw(c, t, f) {
      const s = on(f, 'soar', t) ? Math.sin(prog(f, 'soar', t, 3000) * Math.PI) : 0, l = on(f, 'lift', t) ? Math.sin(prog(f, 'lift', t, 3400) * Math.PI) : 0;
      const kx = 40 + Math.sin(t * 0.0015) * 26 + s * 110 * Math.sin(t * 0.004), ky = -400 + Math.sin(t * 0.002) * 14 - s * 160 - l * 90;
      G.rr(c, -8, -90, 16, 90, 4); G.fillO(c, '#a8733f', 2);
      G.circ(c, 0, -98, 24); G.fillO(c, '#e2433b', 3); dot(c, 0, -98, 8, '#ffffff');
      c.beginPath(); c.moveTo(0, -98); c.quadraticCurveTo(kx * 0.2 - 60, (ky - 98) / 2 + 40, kx, ky + 50); stroke(c, '#ffffff', 2.5);
      c.save(); c.translate(kx, ky); c.rotate(Math.sin(t * 0.003) * 0.12 + s * Math.sin(t * 0.012) * 0.35);
      for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 22, 54); for (let i = 1; i <= 5; i++) c.lineTo(sd * 22 + Math.sin(t * 0.007 + i + sd) * 12, 54 + i * 26); stroke(c, sd < 0 ? '#ff6f91' : '#ffd23f', 7); }
      G.rr(c, -54, -64, 108, 122, 6); G.fillO(c, '#fff8e8', 3);
      G.circ(c, 0, -4, 40); G.fillO(c, '#ff6f61', 3);
      eyes(c, 0, -10, 13, 4); smile(c, 0, 4, 9, 3); cheeks(c, 0, 8, 24, 5);
      c.restore();
    } };
  const komaPath = (c) => { c.beginPath(); c.moveTo(0, 0); c.lineTo(-72, -58); c.quadraticCurveTo(-78, -98, -40, -112); c.lineTo(40, -112); c.quadraticCurveTo(78, -98, 72, -58); c.closePath(); };
  F.s8_koma = { w: 260, h: 220, tags: ['top', 'newyear', 'toy'], slots: [[-170, 20], [170, 20]],
    draw(c, t, f) {
      const fast = on(f, 'spin', t), sp = fast ? 0.5 : 0.08;
      G.ell(c, 0, -20, 124, 30); G.fillO(c, '#c0304a', 4); G.ell(c, 0, -26, 106, 22); G.fillO(c, '#ef6a7a', 2);
      c.save(); c.translate(fast ? Math.sin(t * 0.006) * 30 : 0, -36); c.rotate(Math.sin(t * 0.005) * (fast ? 0.04 : 0.1));
      G.rr(c, -6, -150, 12, 42, 4); G.fillO(c, '#8a5a3a', 2);
      komaPath(c); c.fillStyle = '#fff4e2'; c.fill();
      c.save(); c.clip(); const o = (t * sp) % 150; for (let i = -1; i < 6; i++) { c.fillStyle = RAIN[(i + 5) % 5]; c.fillRect(-90 + i * 30 + (o % 30) - 30, -120, 15, 130); } c.restore();
      komaPath(c); stroke(c, '#7a4a2e', 3.5);
      c.restore();
      if (fast) { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 4; for (let i = 0; i < 3; i++) { const a = t * 0.02 + i * 2.1; c.beginPath(); c.ellipse(0, -90, 110, 30, 0, a, a + 1.2); c.stroke(); } }
    } };

  /* ---------- 86 こどもの ひ ---------- */
  const carp = (c, x, y, len, col, t, amp, ph) => {
    const n = 8, top = [], bot = [], s = len / 220;
    for (let i = 0; i <= n; i++) { const k = i / n, xx = x + k * len, w = 28 * s * (1 - k * 0.4), yy = y + Math.sin(t * 0.006 + ph - k * 3) * amp * k; top.push([xx, yy - w]); bot.push([xx, yy + w]); }
    const e = top[n], eb = bot[n], my = (e[1] + eb[1]) / 2;
    c.beginPath(); c.moveTo(top[0][0], top[0][1]); for (const p of top) c.lineTo(p[0], p[1]);
    c.lineTo(e[0] + 34 * s, e[1] - 16 * s); c.lineTo(e[0] + 12 * s, my); c.lineTo(eb[0] + 34 * s, eb[1] + 16 * s);
    for (let i = n; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]);
    c.closePath(); G._bb = { x0: x, y0: y - 40, x1: x + len, y1: y + 40 }; G.fillO(c, col, 3);
    c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2.5; for (let i = 2; i < n; i += 1) { const p = top[i], q = bot[i]; c.beginPath(); c.arc(p[0], (p[1] + q[1]) / 2, (q[1] - p[1]) * 0.28, -1.1, 1.1); c.stroke(); }
    const hy = (top[0][1] + bot[0][1]) / 2; G.circ(c, x + 20 * s, hy - 6 * s, 11 * s); G.fillO(c, '#ffffff', 2); dot(c, x + 22 * s, hy - 6 * s, 5 * s, '#2a1f35');
    G.ell(c, x + 2, hy, 6 * s, 26 * s); c.fillStyle = '#ffd23f'; c.fill();
  };
  F.s8_koinobori = { w: 460, h: 600, tags: ['koinobori', 'wind', 'kodomonohi'], slots: [[-260, 20], [80, 30]],
    draw(c, t, f) {
      const wind = on(f, 'wind', t) || on(f, 'ride', t), amp = wind ? 22 : 8, tt = wind ? t * 1.8 : t;
      G.ell(c, -170, -6, 40, 10); G.fillO(c, '#8a7a6a', 2);
      G.rr(c, -176, -570, 12, 570, 5); G.fillO(c, '#e8e2d0', 2);
      c.save(); c.translate(-170, -560); c.rotate(t * (wind ? 0.02 : 0.004)); for (let i = 0; i < 6; i++) { c.rotate(PT.TAU / 6); G.ell(c, 0, -18, 6, 16); G.fillO(c, RAIN[i % 5], 1.5); } c.restore();
      dot(c, -170, -580, 10, '#ffd23f');
      for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-164, -520 + i * 8); for (let k = 1; k <= 6; k++) c.lineTo(-164 + k * 40, -520 + i * 8 + Math.sin(tt * 0.006 - k) * amp * k * 0.15); stroke(c, RAIN[i], 8); }
      carp(c, -164, -440, 280, '#4a5a9a', tt, amp, 0);
      carp(c, -164, -340, 230, '#ff6f61', tt, amp, 1);
      carp(c, -164, -250, 180, '#58b9f0', tt, amp, 2);
      carp(c, -164, -175, 140, '#7bd36a', tt, amp, 3);
    } };
  F.s8_kabuto = { w: 260, h: 300, tags: ['kabuto', 'kodomonohi'], slots: [[-170, 20], [170, 20]],
    draw(c, t, f) {
      const sh = on(f, 'shine', t), b = sh ? -Math.abs(Math.sin(t * 0.01)) * 12 : 0;
      G.rr(c, -124, -44, 248, 44, 8); G.fillO(c, '#3a3550', 4); c.fillStyle = '#f5c242'; c.fillRect(-120, -40, 240, 5);
      G.rr(c, -100, -78, 200, 36, 8); G.fillO(c, '#c0304a', 3);
      c.save(); c.translate(0, b);
      for (let i = 0; i < 3; i++) { G.rr(c, -96 + i * 6, -130 + i * 16, 192 - i * 12, 20, 8); G.fillO(c, '#4a5a9a', 2.5); c.fillStyle = '#f5c242'; c.fillRect(-90 + i * 6, -114 + i * 16, 180 - i * 12, 3); }
      for (const s of [-1, 1]) { G.ell(c, s * 98, -138, 22, 30, s * 0.4); G.fillO(c, '#4a5a9a', 2.5); }
      c.beginPath(); c.arc(0, -134, 74, Math.PI, 0); c.closePath(); G._bb = { x0: -74, y0: -208, x1: 74, y1: -134 }; G.fillO(c, '#3a4a7a', 4);
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 3; for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) { c.beginPath(); c.moveTo(Math.sin(a) * 70, -134); c.quadraticCurveTo(Math.sin(a) * 40, -200, 0, -206); c.stroke(); }
      G.rr(c, -80, -142, 160, 14, 6); G.fillO(c, '#f5c242', 2);
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 12, -196); c.quadraticCurveTo(s * 40, -230, s * 30, -280); c.quadraticCurveTo(s * 70, -250, s * 64, -296); stroke(c, '#c99a22', 16); c.beginPath(); c.moveTo(s * 12, -196); c.quadraticCurveTo(s * 40, -230, s * 30, -280); c.quadraticCurveTo(s * 70, -250, s * 64, -296); stroke(c, sh ? '#fff2a0' : '#f5c242', 9); }
      G.circ(c, 0, -200, 16); G.fillO(c, '#e2433b', 3);
      c.restore();
      if (sh) for (let i = 0; i < 6; i++) { const a = t * 0.004 + i; c.fillStyle = '#fff3a0'; G.star(c, Math.cos(a) * 130, -170 + Math.sin(a) * 90, 10, 4); c.fill(); }
    } };
  F.s8_shobu = { w: 300, h: 190, tags: ['bath', 'water', 'kodomonohi'], slots: [[-190, 20], [190, 20]],
    draw(c, t, f) {
      const sp = on(f, 'splash', t);
      G.rr(c, -134, -114, 268, 114, 22); G.fillO(c, '#e0b47a', 4);
      c.strokeStyle = 'rgba(140,90,40,.35)'; c.lineWidth = 2; for (let x = -110; x < 130; x += 28) { c.beginPath(); c.moveTo(x, -108); c.lineTo(x, -6); c.stroke(); }
      for (const y of [-86, -30]) { G.rr(c, -136, y, 272, 10, 4); G.fillO(c, '#8a7a6a', 2); }
      G.ell(c, 0, -112, 126, 20); G.fillO(c, '#9fe0f0', 3);
      for (let i = 0; i < 4; i++) { const x = -80 + i * 54, y = -112 + Math.sin(t * 0.004 + i) * (sp ? 5 : 2); G.ell(c, x, y, 40, 6, 0.2 * (i % 2 ? 1 : -1)); G.fillO(c, '#5cae6a', 2); }
      G.ell(c, 70, -118, 10, 7); G.fillO(c, '#9b6fd6', 2);
      for (let i = 0; i < (sp ? 6 : 3); i++) { const k = (t * 0.0005 * (sp ? 2 : 1) + i / (sp ? 6 : 3)) % 1; dot(c, -80 + i * 34 + Math.sin(k * 6 + i) * 10, -130 - k * 110, 10 + k * 14, `rgba(255,255,255,${0.7 * (1 - k)})`); }
    } };

  /* ---------- 87 うちゅうじんの ほし ---------- */
  const alien = (c, x, y, s, col, wave) => {
    c.save(); c.translate(x, y); c.scale(s, s);
    G.rr(c, -14, -34, 28, 34, 10); G.fillO(c, col, 2.5);
    G.circ(c, 0, -50, 20); G.fillO(c, col, 2.5);
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * 8, -66); c.lineTo(d * 14, -84); stroke(c, PT.line(col), 2.5); dot(c, d * 14, -86, 5, '#ffd23f'); }
    G.ell(c, -8, -52, 6, 8); c.fillStyle = '#2a1f35'; c.fill(); G.ell(c, 8, -52, 6, 8); c.fill(); dot(c, -6, -55, 2, '#fff'); dot(c, 10, -55, 2, '#fff');
    smile(c, 0, -42, 5);
    c.beginPath(); c.moveTo(14, -24); c.lineTo(28, -40 - (wave || 0)); stroke(c, col, 6);
    c.restore();
  };
  F.s8_ufo2 = { w: 320, h: 300, tags: ['ufo', 'space', 'alien'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      const k = prog(f, 'fly', t, 4000), [dx, dy] = k >= 0 ? P8.ufo(k) : [0, 0], op = on(f, 'open', t);
      if (k < 0) for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 70, -80); c.lineTo(s * 116, -8); stroke(c, '#8a94b0', 7); G.ell(c, s * 116, -6, 20, 7); G.fillO(c, '#9aa3b8', 2); }
      if (op && k < 0) { const ok = Math.min(1, prog(f, 'open', t, 3500) * 4); G.poly(c, [-40, -84, 40, -84, 50 + ok * 30, -84 + ok * 80, -50 - ok * 30, -84 + ok * 80]); G.fillO(c, '#e8eef5', 2.5); if (ok > 0.9) { alien(c, -50, -6, 0.9, '#8fe07a', Math.sin(t * 0.02) * 10); alien(c, 50, -10, 0.75, '#ff9ad5', Math.sin(t * 0.02 + 1) * 10); } }
      c.save(); c.translate(dx, dy + Math.sin(t * 0.003) * 4);
      if (k >= 0) { c.fillStyle = 'rgba(160,255,200,.3)'; c.beginPath(); c.moveTo(-40, -80); c.lineTo(40, -80); c.lineTo(90, 0); c.lineTo(-90, 0); c.closePath(); c.fill(); }
      c.beginPath(); c.arc(0, -112, 66, Math.PI, 0); c.closePath(); c.fillStyle = 'rgba(170,240,255,.85)'; c.fill(); c.strokeStyle = '#7fc8e0'; c.lineWidth = 3; c.stroke();
      alien(c, 0, -108, 0.8, '#8fe07a', Math.sin(t * 0.01) * 6);
      G.ell(c, 0, -104, 156, 38); G.fillO(c, '#c9b2ff', 4); G.ell(c, 0, -114, 120, 12); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
      for (let i = 0; i < 7; i++) dot(c, -114 + i * 38, -94 + Math.abs(i - 3) * -3, 8, (Math.floor(t / 180) + i) % 2 ? '#ffd23f' : '#7fffd4');
      c.restore();
    } };
  const crys = (c, x, y, w, h, a, col) => { c.save(); c.translate(x, y); c.rotate(a); G.poly(c, [0, -h, w / 2, -h + w * 0.6, w / 2, 0, -w / 2, 0, -w / 2, -h + w * 0.6]); G.fillO(c, col, 3); c.beginPath(); c.moveTo(-w * 0.15, -h + w * 0.5); c.lineTo(-w * 0.15, -8); stroke(c, 'rgba(255,255,255,.6)', 4); c.restore(); };
  F.s8_crystal = { w: 240, h: 300, tags: ['crystal', 'alien', 'music'], slots: [[-160, 20], [160, 20]],
    draw(c, t, f) {
      const r = on(f, 'ring', t), fl = on(f, 'float', t), cyc = r ? Math.floor(t / 150) : 0;
      if (r || fl) { c.fillStyle = 'rgba(200,180,255,.35)'; G.circ(c, 0, -140, 150 + Math.sin(t * 0.01) * 10); c.fill(); }
      G.ell(c, 0, -10, 110, 20); G.fillO(c, '#8a7ab8', 3);
      const cols = ['#7fe8ff', '#ff9ad5', '#b49aff', '#9fffc8', '#ffe680'];
      crys(c, -70, -10, 50, 150, -0.35, cols[(cyc + 1) % 5]);
      crys(c, 72, -10, 46, 130, 0.35, cols[(cyc + 2) % 5]);
      crys(c, 0, -12, 70, 250 + (r ? Math.sin(t * 0.02) * 8 : 0), 0, cols[cyc % 5]);
      crys(c, -26, -6, 34, 90, -0.15, cols[(cyc + 3) % 5]);
      crys(c, 34, -6, 30, 76, 0.2, cols[(cyc + 4) % 5]);
      if (r) for (let i = 0; i < 3; i++) { const k = (t * 0.0008 + i / 3) % 1; G.note(c, -60 + i * 60 + Math.sin(k * 8) * 14, -260 - k * 100, 18, RAIN[i]); }
    } };
  F.s8_jelly = { w: 260, h: 240, tags: ['bounce', 'alien', 'plant'], slots: [[-170, 20], [170, 20]],
    draw(c, t, f) {
      const w = on(f, 'wob', t) ? Math.sin(t * 0.03) * 0.16 : on(f, 'bounce', t) ? Math.sin(t * 0.024) * 0.2 : Math.sin(t * 0.004) * 0.04;
      for (const s of [-1, 1]) { G.ell(c, s * 80, -14, 50, 14, s * 0.3); G.fillO(c, '#4fc3a0', 2.5); }
      c.save(); c.translate(0, -10); c.scale(1 + w, 1 - w);
      c.beginPath(); c.moveTo(-110, 0); c.bezierCurveTo(-120, -200, 120, -200, 110, 0); c.closePath(); G._bb = { x0: -116, y0: -150, x1: 116, y1: 0 }; G.fillO(c, '#7fe0c0', 4);
      c.fillStyle = 'rgba(255,255,255,.35)'; G.ell(c, -50, -100, 24, 36, -0.5); c.fill();
      for (const [x, y, r] of [[-60, -40, 10], [60, -60, 8], [20, -120, 7]]) dot(c, x, y, r, 'rgba(255,154,213,.8)');
      eyes(c, 0, -76, 22, 7); dot(c, -20, -79, 2.4, '#fff'); dot(c, 24, -79, 2.4, '#fff'); smile(c, 0, -60, 12, 3); cheeks(c, 0, -56, 40, 7);
      c.restore();
    } };

  /* ---------- 88 みらいの まち ---------- */
  F.s8_tube = { w: 700, h: 340, tags: ['tube', 'future', 'ride'], slots: [[-400, 20], [400, 20]],
    draw(c, t, f) {
      const path = () => { c.beginPath(); for (let i = 0; i <= 24; i++) { const [x, y] = P8.tube(i / 24); i ? c.lineTo(x, y) : c.moveTo(x, y); } };
      for (const s of [-1, 1]) { G.rr(c, s * 300 - 46, -64, 92, 64, 16); G.fillO(c, '#e8eef5', 3); G.ell(c, s * 300, -64, 40, 10); c.fillStyle = Math.floor(t / 300) % 2 ? '#7fffd4' : '#58b9f0'; c.fill(); }
      path(); stroke(c, 'rgba(110,190,230,.55)', 80); path(); stroke(c, 'rgba(230,250,255,.35)', 66);
      c.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 6; i++) { const k = ((t * 0.0004 + i / 6) % 1), [x, y] = P8.tube(k); G.poly(c, [x - 8, y - 10, x + 8, y, x - 8, y + 10]); c.fill(); }
      for (let i = 1; i < 6; i++) { const [x, y] = P8.tube(i / 6); c.strokeStyle = 'rgba(160,220,255,.9)'; c.lineWidth = 5; G.ell(c, x, y, 8, 40, (i / 6 - 0.5) * 2); c.stroke(); }
      if (on(f, 'pod', t)) { const [x, y] = P8.tube(prog(f, 'pod', t, 1800)); G.rr(c, x - 36, y - 22, 72, 44, 22); G.fillO(c, '#ff6f91', 3); dot(c, x + 12, y - 4, 9, '#bfe6ff'); }
    } };
  F.s8_flycar = { w: 300, h: 260, tags: ['car', 'future', 'fly'], slots: [[-190, 20], [190, 20]],
    draw(c, t, f) {
      const k = prog(f, 'fly', t, 4000), [dx, dy] = k >= 0 ? P8.car(k) : [0, -60 + Math.sin(t * 0.003) * 8];
      G.ell(c, 0, -14, 136, 26); G.fillO(c, '#5a6a8a', 3); c.strokeStyle = Math.floor(t / 250) % 2 ? '#7fffd4' : '#58e0ff'; c.lineWidth = 5; G.ell(c, 0, -16, 110, 18); c.stroke();
      c.save(); c.translate(dx, dy);
      c.fillStyle = 'rgba(127,255,212,.35)'; G.ell(c, 0, 0, 90, 16 + Math.sin(t * 0.02) * 4); c.fill();
      c.beginPath(); c.arc(10, -60, 54, Math.PI, 0); c.closePath(); c.fillStyle = 'rgba(190,240,255,.75)'; c.fill(); c.strokeStyle = '#9fc8f0'; c.lineWidth = 3; c.stroke();
      G.rr(c, -110, -62, 220, 54, 27); G.fillO(c, '#ff6f91', 4);
      c.fillStyle = '#ffffff'; c.fillRect(-90, -40, 180, 6);
      dot(c, 104, -38, 9, '#fff6b8'); dot(c, -106, -38, 7, '#ff5d78');
      for (const s of [-1, 1]) { G.ell(c, s * 70, -6, 26, 8); G.fillO(c, '#9aa3b8', 2); }
      c.restore();
    } };
  const holoShape = (c, n, t) => {
    if (n === 0) { G.star(c, 0, 0, 60, 26); }
    else if (n === 1) { G.heart(c, 0, 0, 60); }
    else if (n === 2) { c.beginPath(); c.moveTo(0, -70); c.quadraticCurveTo(34, -30, 26, 40); c.lineTo(-26, 40); c.quadraticCurveTo(-34, -30, 0, -70); c.closePath(); }
    else { c.beginPath(); c.arc(0, 0, 40, 0, PT.TAU); c.moveTo(70, 0); c.ellipse(0, 0, 70, 16, -0.3, 0, PT.TAU); }
  };
  F.s8_holo = { w: 240, h: 330, tags: ['hologram', 'future', 'light'], slots: [[-160, 20], [160, 20]],
    draw(c, t, f) {
      const z = on(f, 'zap', t), sh = (f.shape || 0) % 4;
      c.fillStyle = z ? 'rgba(120,240,255,.42)' : 'rgba(120,240,255,.22)'; c.beginPath(); c.moveTo(-60, -40); c.lineTo(60, -40); c.lineTo(110, -320); c.lineTo(-110, -320); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; for (let y = -300 + ((t * 0.05) % 20); y < -50; y += 20) { c.beginPath(); c.moveTo(-100, y); c.lineTo(100, y); c.stroke(); }
      c.save(); c.translate(0, -200 + Math.sin(t * 0.003) * 8); c.scale(Math.cos(t * (z ? 0.008 : 0.002)), 1); holoShape(c, sh, t); c.fillStyle = z ? 'rgba(255,240,140,.85)' : 'rgba(160,255,240,.7)'; c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.stroke(); c.restore();
      G.ell(c, 0, -20, 92, 24); G.fillO(c, '#3a4a6a', 4); G.ell(c, 0, -30, 70, 14); c.fillStyle = z ? '#ffffff' : '#7fffd4'; c.fill();
      for (let i = 0; i < 5; i++) dot(c, -60 + i * 30, -10, 4, (Math.floor(t / 200) + i) % 3 ? '#58e0ff' : '#ffd23f');
    } };

  /* ---------- 89 むかしばなしの むら ---------- */
  const peach = (c, x, y, s, open) => {
    c.save(); c.translate(x, y); c.scale(s, s);
    if (open > 0) {
      c.fillStyle = 'rgba(255,240,150,.7)'; G.circ(c, 0, -50, 50 + open * 30); c.fill();
      for (const d of [-1, 1]) { c.save(); c.translate(d * open * 34, 0); c.rotate(d * open * 0.5); c.beginPath(); c.arc(0, -50, 56, d < 0 ? Math.PI / 2 : -Math.PI / 2, d < 0 ? Math.PI * 1.5 : Math.PI / 2); c.closePath(); G._bb = { x0: -56, y0: -106, x1: 56, y1: 6 }; G.fillO(c, '#ffb3a7', 3); c.restore(); }
      G.star(c, 0, -70 - open * 30, 20, 8); c.fillStyle = '#ffd23f'; c.fill();
    } else {
      G.ell(c, 0, -50, 60, 56); G.fillO(c, '#ffb3a7', 3);
      c.fillStyle = 'rgba(255,120,130,.35)'; G.ell(c, 18, -40, 30, 34); c.fill();
      c.beginPath(); c.moveTo(0, -104); c.quadraticCurveTo(-14, -50, 0, 4); stroke(c, '#e08080', 3);
    }
    for (const d of [-1, 1]) { G.ell(c, d * 20, -110, 22, 9, d * 0.5); G.fillO(c, '#6cc07a', 2); }
    c.restore();
  };
  F.s8_peach = { w: 760, h: 180, area: 'water', tags: ['water', 'river', 'peach'], slots: [[-420, 0], [420, 0]],
    draw(c, t, f) {
      G.rr(c, -380, -160, 760, 150, 70); G.fillO(c, '#6ec6ea', 4);
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; for (let i = 0; i < 7; i++) { const x = -330 + ((i * 110 + t * 0.06) % 660), y = -130 + (i % 3) * 36; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 15, y - 8, x + 30, y); c.quadraticCurveTo(x + 45, y + 8, x + 60, y); c.stroke(); }
      const k = prog(f, 'flow', t, 3200), pk = on(f, 'pop', t) ? Math.min(1, prog(f, 'pop', t, 2400) * 3) : 0;
      const px = k >= 0 ? P8.peach(k) : pk > 0 ? P8.peach(1) : -260 + Math.sin(t * 0.001) * 20;
      peach(c, px, -50 + Math.sin(t * 0.005) * 6, 1, pk);
      if (k >= 0) { c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 3; i++) { G.circ(c, px - 70 - i * 26, -46 + Math.sin(t * 0.01 + i) * 4, 8 - i * 2); c.fill(); } }
    } };
  F.s8_dango = { w: 280, h: 300, tags: ['dango', 'food', 'shop'], slots: [[-180, 20], [180, 20]],
    draw(c, t, f) {
      const sv = on(f, 'serve', t);
      G.rr(c, 86, -280, 8, 280, 3); G.fillO(c, '#8a5a3a', 2);
      c.beginPath(); c.moveTo(-40, -250); c.quadraticCurveTo(90, -330, 220, -250); c.closePath(); G._bb = { x0: -40, y0: -300, x1: 220, y1: -250 }; G.fillO(c, '#e2433b', 3);
      c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(90, -292); c.lineTo(-30 + i * 60, -254); c.stroke(); }
      G.rr(c, -120, -96, 240, 20, 6); G.fillO(c, '#e2433b', 3); for (const x of [-100, 92]) { G.rr(c, x, -78, 10, 78, 3); G.fillO(c, '#8a5a3a', 2); }
      G.ell(c, -10, -100, 70, 12); G.fillO(c, '#fff8e8', 2.5);
      for (let i = 0; i < 3; i++) { const x = -50 + i * 40, b = sv ? -Math.abs(Math.sin(t * 0.012 + i)) * 18 : 0; c.save(); c.translate(x, -108 + b); c.rotate(-0.25); c.beginPath(); c.moveTo(0, 10); c.lineTo(0, -82); stroke(c, '#c99a64', 3); for (let j = 0; j < 3; j++) { G.circ(c, 0, -18 - j * 22, 12); G.fillO(c, '#f5d78a', 2); } c.restore(); }
      G.rr(c, -134, -230, 34, 130, 4); G.fillO(c, '#fff8e8', 2.5); c.font = `900 22px ${PT.FONT}`; c.fillStyle = '#c0304a'; c.textAlign = 'center'; c.textBaseline = 'middle'; ['だ', 'ん', 'ご'].forEach((s, i) => c.fillText(s, -117, -204 + i * 36));
      if (sv) for (let i = 0; i < 4; i++) { const a = t * 0.005 + i * 1.6; c.fillStyle = '#ffd23f'; G.star(c, -10 + Math.cos(a) * 90, -160 + Math.sin(a) * 40, 9, 4); c.fill(); }
    } };
  const bamboo = (c, x, h, col) => {
    for (let y = 0; y < h; y += 70) { const sg = Math.min(68, h - y); G.rr(c, x - 13, -y - sg, 26, sg, 6); G.fillO(c, col, 2.5); }
    for (const d of [-1, 1]) { G.ell(c, x + d * 30, -h + 30, 34, 8, d * 0.5); G.fillO(c, '#6cc07a', 2); }
  };
  F.s8_bamboo = { w: 240, h: 460, tags: ['bamboo', 'light', 'story'], slots: [[-160, 20], [160, 20]],
    draw(c, t, f) {
      const gl = on(f, 'glow', t), gk = on(f, 'grow', t) ? Math.sin(prog(f, 'grow', t, 3600) * Math.PI) : 0, sh = (f.grow && on(f, 'grow', t)) ? 280 * gk : 0;
      bamboo(c, -70, 430, '#7bc86a'); bamboo(c, 76, 380, '#8fd47a');
      const h = 150 + sh;
      if (gl || gk) { c.fillStyle = 'rgba(255,240,150,.4)'; G.circ(c, 0, -h + 20, 70 + Math.sin(t * 0.01) * 8); c.fill(); }
      for (let y = 0; y < h - 10; y += 70) { const sg = Math.min(68, h - y); G.rr(c, -18, -y - sg, 36, sg, 6); G.fillO(c, gl || gk ? '#c8f07a' : '#9be07a', 3); }
      G.poly(c, [-18, -h + 10, 18, -h - 12, 18, -h + 30, -18, -h + 30]); G.fillO(c, gl ? '#fff6b0' : '#d8f0a0', 2.5);
      if (gl) for (let i = 0; i < 5; i++) { const a = t * 0.004 + i * 1.25; c.fillStyle = '#fff3a0'; G.star(c, Math.cos(a) * 60, -h + Math.sin(a) * 40, 8, 3.4); c.fill(); }
    } };

  /* ---------- 90 こびとの もり ---------- */
  F.s8_bigmush = { w: 340, h: 360, tags: ['mushroom', 'bounce', 'tiny'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      const b = on(f, 'puff', t) || on(f, 'bounce', t), sq = b ? Math.sin(t * 0.03) * 0.06 : 0;
      G.rr(c, -54, -210, 108, 210, 34); G.fillO(c, '#fff4e2', 4);
      G.rr(c, -22, -76, 44, 76, 22); G.fillO(c, '#c27a3e', 3); dot(c, 12, -40, 4, '#ffd23f');
      dot(c, 0, -140, 14, '#bfe6ff');
      c.save(); c.translate(0, -190); c.scale(1 + sq, 1 - sq);
      c.beginPath(); c.moveTo(-170, 10); c.bezierCurveTo(-170, -190, 170, -190, 170, 10); c.quadraticCurveTo(0, 30, -170, 10); c.closePath(); G._bb = { x0: -170, y0: -150, x1: 170, y1: 20 }; G.fillO(c, '#e2433b', 4);
      for (const [x, y, r] of [[-90, -50, 24], [0, -110, 28], [90, -60, 22], [-30, -30, 14], [50, -10, 12], [-130, -6, 10]]) dot(c, x, y, r, '#ffffff');
      c.restore();
      if (on(f, 'puff', t)) for (let i = 0; i < 8; i++) { const k = (t * 0.001 + i / 8) % 1; dot(c, Math.sin(i * 2.3) * 160 * k, -320 - k * 120, 6 * (1 - k) + 2, `rgba(255,240,170,${1 - k})`); }
    } };
  F.s8_acorn = { w: 220, h: 260, tags: ['acorn', 'tiny', 'roll'], slots: [[-150, 20], [150, 20]],
    draw(c, t, f) {
      const rk = prog(f, 'roll', t, 3600), dx = rk >= 0 ? P8.acorn(rk) : 0, pk = prog(f, 'pop', t, 1600), cy = pk >= 0 ? -Math.sin(pk * Math.PI) * 170 : 0;
      c.save(); c.translate(dx, -92); c.rotate(dx / 80 + Math.sin(t * 0.003) * 0.03);
      G.ell(c, 0, 6, 72, 86); G.fillO(c, '#c9813f', 4);
      c.fillStyle = 'rgba(255,255,255,.25)'; G.ell(c, -30, 0, 14, 40, 0.2); c.fill();
      eyes(c, 0, 20, 20, 5); smile(c, 0, 34, 8, 3); cheeks(c, 0, 38, 34, 6);
      c.save(); c.translate(0, cy); c.rotate(pk >= 0 ? pk * 6 : 0);
      c.beginPath(); c.moveTo(-82, -30); c.bezierCurveTo(-86, -110, 86, -110, 82, -30); c.quadraticCurveTo(0, -14, -82, -30); c.closePath(); G._bb = { x0: -86, y0: -90, x1: 86, y1: -20 }; G.fillO(c, '#8a5a3a', 4);
      c.strokeStyle = 'rgba(255,230,190,.4)'; c.lineWidth = 2; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 22 - 10, -30); c.lineTo(i * 22 + 10, -84); c.stroke(); }
      G.rr(c, -6, -112, 12, 26, 5); G.fillO(c, '#6a4a2a', 2);
      c.restore(); c.restore();
    } };
  F.s8_leaf = { w: 380, h: 300, tags: ['leaf', 'slide', 'tiny', 'water'], slots: [[-220, 20], [230, 20]],
    draw(c, t, f) {
      c.beginPath(); c.moveTo(150, 0); c.quadraticCurveTo(170, -60, 140, -110); stroke(c, '#4f9a4a', 10);
      c.save(); c.translate(0, -160); c.rotate(0.4 + Math.sin(t * 0.002) * 0.02);
      G.ell(c, 0, 0, 190, 64); G.fillO(c, '#7bd36a', 4);
      c.beginPath(); c.moveTo(-180, 0); c.lineTo(180, 0); stroke(c, '#5aa84f', 4);
      for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 44, 0); c.lineTo(i * 44 + 30, -44); c.moveTo(i * 44, 0); c.lineTo(i * 44 + 30, 44); stroke(c, '#5aa84f', 2.5); }
      const k = prog(f, 'drop', t, 1600), x = k >= 0 ? -150 + Math.min(1, k * 1.4) * 330 : -150;
      if (k < 0.72) { G.ell(c, x, -14, 20, 18); c.fillStyle = 'rgba(200,240,255,.85)'; c.fill(); c.strokeStyle = '#9fd8ff'; c.lineWidth = 2; c.stroke(); dot(c, x - 6, -20, 5, '#ffffff'); }
      c.restore();
      if (k > 0.72) { const s = (k - 0.72) / 0.28; c.strokeStyle = `rgba(160,220,255,${1 - s})`; c.lineWidth = 4; G.ell(c, 200, -10, 30 + s * 60, 8 + s * 14); c.stroke(); for (let i = 0; i < 5; i++) dot(c, 200 + Math.cos(i * 1.3) * s * 70, -20 - Math.sin(i * 0.6 + 0.4) * s * 60, 5, 'rgba(160,220,255,.8)'); }
    } };

  /* ---------- 91 アイスの くに ---------- */
  const cone = (c, x, y, w, h) => { G.poly(c, [x - w / 2, y - h, x + w / 2, y - h, x, y]); G.fillO(c, '#e8b878', 3); c.strokeStyle = 'rgba(160,100,40,.45)'; c.lineWidth = 2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x - w / 2 + (i * w) / 8, y - h); c.lineTo(x + (i * w) / 8 - w / 4, y - h * 0.25); c.stroke(); c.beginPath(); c.moveTo(x + w / 2 - (i * w) / 8, y - h); c.lineTo(x - (i * w) / 8 + w / 4, y - h * 0.25); c.stroke(); } };
  const scoop = (c, x, y, r, col) => { c.beginPath(); c.arc(x, y, r, Math.PI, 0); for (let i = 0; i <= 4; i++) { const xx = x + r - (i * r) / 2; c.lineTo(xx, y + (i % 2 ? r * 0.3 : r * 0.12)); } c.closePath(); G._bb = { x0: x - r, y0: y - r, x1: x + r, y1: y + r * 0.3 }; G.fillO(c, col, 3); };
  F.s8_softserve = { w: 240, h: 360, tags: ['icecream', 'machine', 'food'], slots: [[-160, 20], [160, 20]],
    draw(c, t, f) {
      const k = prog(f, 'swirl', t, 2200), n = k >= 0 ? Math.min(4, Math.floor(k * 5)) : 2;
      G.rr(c, -100, -330, 200, 230, 20); G.fillO(c, '#ffd1e0', 4);
      G.rr(c, -80, -310, 160, 60, 12); G.fillO(c, '#ffffff', 2.5); c.font = `900 26px ${PT.FONT}`; c.fillStyle = '#ff6f91'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ソフト', 0, -280);
      for (let i = 0; i < 3; i++) dot(c, -50 + i * 50, -224, 10, ['#ff8fb1', '#fff4e2', '#9fe0c0'][i]);
      G.rr(c, -18, -110, 36, 22, 6); G.fillO(c, '#c9ccd8', 2.5);
      c.save(); c.translate(70, -130); c.rotate(k >= 0 ? -0.6 : -0.1); G.rr(c, -4, -50, 8, 50, 3); G.fillO(c, '#9aa3b8', 2); dot(c, 0, -52, 9, '#e2433b'); c.restore();
      G.rr(c, -90, -16, 180, 16, 6); G.fillO(c, '#c9ccd8', 2.5);
      cone(c, 0, -16, 56, 60);
      for (let i = 0; i < n; i++) { G.ell(c, 0, -80 - i * 10, 30 - i * 5, 10); G.fillO(c, i % 2 ? '#ffb3c8' : '#fff8f0', 2.5); }
    } };
  F.s8_creamslide = { w: 460, h: 380, tags: ['slide', 'icecream', 'sweet'], slots: [[-280, 20], [280, 20]],
    draw(c, t, f) {
      const sp = on(f, 'sprinkle', t);
      scoop(c, -110, -60, 110, '#ffb3c8'); scoop(c, 90, -50, 100, '#9fe0c0'); scoop(c, -20, -150, 100, '#c8956a'); scoop(c, -60, -250, 80, '#fff4e2');
      const cb = sp ? -Math.abs(Math.sin(t * 0.012)) * 40 : 0;
      c.beginPath(); c.moveTo(-60, -326 + cb); c.quadraticCurveTo(-50, -360 + cb, -30, -370 + cb); stroke(c, '#4f9a4a', 3); G.circ(c, -60, -316 + cb, 18); G.fillO(c, '#e2433b', 3);
      c.beginPath(); c.moveTo(-120, -280); c.bezierCurveTo(60, -260, 40, -120, 220, -20); stroke(c, '#c98a3a', 30); c.beginPath(); c.moveTo(-120, -280); c.bezierCurveTo(60, -260, 40, -120, 220, -20); stroke(c, '#f5c06a', 22);
      c.strokeStyle = 'rgba(200,130,60,.5)'; c.lineWidth = 2; for (let i = 1; i < 10; i++) { const k = i / 10, x = Math.pow(1 - k, 3) * -120 + 3 * Math.pow(1 - k, 2) * k * 60 + 3 * (1 - k) * k * k * 40 + k * k * k * 220, y = Math.pow(1 - k, 3) * -280 + 3 * Math.pow(1 - k, 2) * k * -260 + 3 * (1 - k) * k * k * -120 + k * k * k * -20; c.beginPath(); c.moveTo(x - 8, y - 8); c.lineTo(x + 8, y + 8); c.stroke(); }
      const sc = ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a', '#9b8cff'];
      for (let i = 0; i < 16; i++) { const x = -180 + ((i * 53) % 340), y = -40 - ((i * 37) % 250) - (sp ? Math.abs(Math.sin(t * 0.01 + i)) * 30 : 0); c.save(); c.translate(x, y); c.rotate(i); c.fillStyle = sc[i % 5]; c.fillRect(-6, -2, 12, 4); c.restore(); }
    } };
  F.s8_soda = { w: 220, h: 340, tags: ['soda', 'drink', 'bubble'], slots: [[-150, 20], [150, 20]],
    draw(c, t, f) {
      const fz = on(f, 'fizz', t);
      G.poly(c, [-80, -240, 80, -240, 56, -10, -56, -10]); c.fillStyle = 'rgba(220,245,255,.7)'; c.fill(); c.strokeStyle = '#9fc8f0'; c.lineWidth = 4; c.stroke();
      G.poly(c, [-74, -210, 74, -210, 56, -16, -56, -16]); c.fillStyle = 'rgba(110,220,170,.75)'; c.fill();
      for (let i = 0; i < (fz ? 14 : 6); i++) { const k = (t * 0.0006 * (fz ? 3 : 1) + i / (fz ? 14 : 6)) % 1; c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2; G.circ(c, -50 + ((i * 29) % 100), -20 - k * 190, 4 + (i % 3) * 2); c.stroke(); }
      G.rr(c, -64, -18, 128, 18, 6); G.fillO(c, '#c9ccd8', 2.5);
      c.save(); c.translate(40, -250); c.rotate(0.3); G.rr(c, -6, -110, 12, 130, 5); G.fillO(c, '#ffffff', 2); c.fillStyle = '#ff6f91'; for (let y = -100; y < 10; y += 24) c.fillRect(-5, y, 10, 10); c.restore();
      scoop(c, -6, -236, 56, '#fff8f0'); G.circ(c, -6, -300, 14); G.fillO(c, '#e2433b', 3);
      if (fz) for (let i = 0; i < 5; i++) { const k = (t * 0.0012 + i / 5) % 1; c.strokeStyle = `rgba(160,230,255,${1 - k})`; c.lineWidth = 2.5; G.circ(c, Math.sin(i * 2 + k * 4) * 60, -310 - k * 120, 8 + i * 2); c.stroke(); }
    } };

  /* ---------- 92 ほしの うみ ---------- */
  F.s8_moonboat = { w: 380, h: 280, tags: ['boat', 'moon', 'night'], slots: [[-230, 20], [230, 20]],
    draw(c, t, f) {
      const k = prog(f, 'sail', t, 4000), dx = k >= 0 ? P8.boat(k) : 0, rk = on(f, 'rock', t) ? Math.sin(t * 0.008) * 0.18 : Math.sin(t * 0.002) * 0.05;
      c.fillStyle = 'rgba(140,170,255,.35)'; G.ell(c, dx, -14, 180, 22); c.fill();
      c.save(); c.translate(dx, -40); c.rotate(rk);
      c.beginPath(); c.arc(0, -110, 130, 0.12 * Math.PI, 0.88 * Math.PI); c.arc(0, -160, 120, 0.82 * Math.PI, 0.18 * Math.PI, true); c.closePath(); G._bb = { x0: -130, y0: -60, x1: 130, y1: 20 }; G.fillO(c, '#ffe066', 4);
      eyes(c, 60, -10, 8, 3.4); smile(c, 60, 2, 6, 2.4);
      c.beginPath(); c.moveTo(-60, -40); c.lineTo(-60, -170); stroke(c, '#c99a22', 5);
      G.poly(c, [-56, -166, 10, -150, -56, -110]); G.fillO(c, '#fff8e8', 2.5); c.fillStyle = '#ffd23f'; G.star(c, -36, -140, 10, 4); c.fill();
      c.restore();
      if (on(f, 'rock', t)) for (let i = 0; i < 6; i++) { const q = (t * 0.001 + i / 6) % 1; c.fillStyle = `rgba(255,246,184,${1 - q})`; G.star(c, dx + Math.sin(i * 2.1) * 140, -80 - q * 220, 9, 4); c.fill(); }
    } };
  F.s8_starwhale = { w: 440, h: 320, tags: ['whale', 'star', 'night'], slots: [[-260, 20], [260, 20]],
    draw(c, t, f) {
      const sp = on(f, 'spout', t), y = -120 + Math.sin(t * 0.002) * 8;
      c.save(); c.translate(0, y);
      c.beginPath(); c.moveTo(150, -10); c.quadraticCurveTo(220, -30, 230, -90); c.quadraticCurveTo(200, -60, 190, -40); c.quadraticCurveTo(220, -20, 250, -40); c.quadraticCurveTo(230, 10, 150, 20); c.closePath(); c.fillStyle = 'rgba(120,170,255,.8)'; c.fill(); c.strokeStyle = '#cfe0ff'; c.lineWidth = 3; c.stroke();
      G.ell(c, -10, 0, 180, 90); c.fillStyle = 'rgba(110,150,250,.85)'; c.fill(); c.strokeStyle = '#cfe0ff'; c.lineWidth = 4; c.stroke();
      G.ell(c, -20, 40, 140, 40); c.fillStyle = 'rgba(200,220,255,.5)'; c.fill();
      c.fillStyle = '#fff6b8'; for (let i = 0; i < 9; i++) { G.star(c, -150 + ((i * 47) % 280), -60 + ((i * 31) % 70), 5 + (i % 3) * 2, 2.4); c.fill(); }
      eyes(c, -120, -4, 0.01, 6); dot(c, -118, -7, 2, '#fff'); smile(c, -136, 20, 14, 3); cheeks(c, -110, 18, 0.01, 8);
      G.ell(c, 0, 64, 40, 14, 0.4); c.fillStyle = 'rgba(120,170,255,.9)'; c.fill();
      c.restore();
      const n = sp ? 10 : 2, hh = sp ? 220 : 40;
      for (let i = 0; i < n; i++) { const q = (t * 0.0012 + i / n) % 1, a = (i / n - 0.5) * 1.4; c.fillStyle = RAIN[i % 5]; G.star(c, -40 + Math.sin(a) * q * 120, y - 90 - Math.sin(q * Math.PI) * hh, 10 * (1 - q * 0.5), 4); c.fill(); }
    } };
  F.s8_telescope = { w: 220, h: 300, tags: ['telescope', 'star', 'night'], slots: [[-150, 20], [150, 20]],
    draw(c, t, f) {
      for (const [a, b] of [[-70, 0], [70, 0], [10, 10]]) { c.beginPath(); c.moveTo(0, -150); c.lineTo(a, b - 4); stroke(c, '#8a5a3a', 8); }
      c.save(); c.translate(0, -160); c.rotate(-0.6 + (on(f, 'look', t) ? Math.sin(t * 0.004) * 0.1 : 0));
      G.rr(c, -80, -24, 200, 48, 20); G.fillO(c, '#4a5aa8', 4); G.rr(c, 100, -32, 40, 64, 12); G.fillO(c, '#f5c242', 3); G.rr(c, -110, -14, 34, 28, 8); G.fillO(c, '#f5c242', 2.5);
      c.fillStyle = '#ffd23f'; G.star(c, 20, 0, 12, 5); c.fill();
      c.restore();
      if (on(f, 'shoot', t)) { const k = prog(f, 'shoot', t, 2600); for (let i = 0; i < 3; i++) { const q = Math.min(1, Math.max(0, k * 1.6 - i * 0.25)); if (q <= 0 || q >= 1) continue; const x = -500 + i * 260 + q * 700, y = -650 + i * 60 + q * 260; c.strokeStyle = 'rgba(255,246,184,.7)'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 120, y - 45); c.stroke(); c.fillStyle = '#fff6b8'; G.star(c, x, y, 16, 7); c.fill(); } }
    } };

  /* ---------- 93 ドールハウス ---------- */
  const doll = (c, x, y, col, t, ph) => { const b = Math.abs(Math.sin(t * 0.008 + ph)) * 8; c.save(); c.translate(x, y - b); G.poly(c, [-14, 0, 14, 0, 0, -30]); G.fillO(c, col, 2); G.circ(c, 0, -36, 10); G.fillO(c, '#ffe0c8', 2); eyes(c, 0, -37, 3.6, 1.4); c.restore(); };
  F.s8_dhouse = { w: 400, h: 460, tags: ['house', 'doll', 'toy'], slots: [[-240, 20], [240, 20]],
    draw(c, t, f) {
      const k = prog(f, 'lit', t, 4500);
      G.rr(c, 70, -470, 40, 70, 4); G.fillO(c, '#c9645a', 3);
      G.poly(c, [-210, -350, 0, -450, 210, -350]); G.fillO(c, '#ff8fb1', 4);
      dot(c, 0, -390, 18, k >= 0 ? '#fff3a0' : '#bfe6ff');
      G.rr(c, -186, -356, 372, 356, 8); G.fillO(c, '#fff4f8', 4);
      const rooms = [[-170, -340, '#ffe9a8'], [6, -340, '#c9f0e0'], [-170, -168, '#d8e8ff'], [6, -168, '#ffd8e8']];
      rooms.forEach(([x, y, col], i) => {
        const lit = k >= 0 && k > i * 0.15;
        G.rr(c, x, y, 164, 152, 6); c.fillStyle = col; c.fill(); c.strokeStyle = '#c99a9a'; c.lineWidth = 3; c.stroke();
        c.fillStyle = 'rgba(0,0,0,.06)'; c.fillRect(x, y + 120, 164, 32);
        if (i === 0) { G.rr(c, x + 14, y + 96, 70, 40, 8); G.fillO(c, '#ff8fb1', 2); G.rr(c, x + 14, y + 86, 22, 20, 6); G.fillO(c, '#ffffff', 2); }
        if (i === 1) { G.rr(c, x + 40, y + 100, 80, 10, 3); G.fillO(c, '#c99a64', 2); G.rr(c, x + 70, y + 110, 8, 30, 2); G.fillO(c, '#c99a64', 2); dot(c, x + 80, y + 94, 8, '#ff6f91'); }
        if (i === 2) { G.rr(c, x + 20, y + 94, 100, 46, 14); G.fillO(c, '#9b8cff', 2); G.rr(c, x + 30, y + 30, 50, 40, 4); G.fillO(c, '#ffffff', 2); }
        if (i === 3) { G.rr(c, x + 30, y + 90, 90, 50, 20); G.fillO(c, '#ffffff', 2); for (let j = 0; j < 3; j++) dot(c, x + 50 + j * 22, y + 86, 8, 'rgba(160,220,255,.9)'); }
        dot(c, x + 82, y + 14, 8, lit ? '#ffe066' : '#e8e2d0');
        if (lit) { c.fillStyle = 'rgba(255,240,150,.25)'; c.fillRect(x, y, 164, 152); doll(c, x + 120 - (i % 2) * 70, y + 140, RAIN[i], t, i); }
      });
      G.rr(c, -196, -16, 392, 16, 4); G.fillO(c, '#c99a9a', 3);
    } };
  F.s8_teaparty = { w: 320, h: 240, tags: ['tea', 'table', 'party'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      const pr = on(f, 'pour', t), tilt = pr ? -0.5 * Math.min(1, Math.sin(prog(f, 'pour', t, 2200) * Math.PI) * 2) : 0;
      G.rr(c, -12, -100, 24, 100, 6); G.fillO(c, '#e8e2d0', 2.5); G.ell(c, 0, -4, 60, 10); G.fillO(c, '#e8e2d0', 2);
      c.beginPath(); c.moveTo(-150, -110); c.lineTo(150, -110); c.lineTo(160, -66); for (let i = 0; i < 8; i++) c.quadraticCurveTo(160 - i * 40 - 20, -50, 160 - (i + 1) * 40, -66); c.closePath(); G._bb = { x0: -160, y0: -110, x1: 160, y1: -60 }; G.fillO(c, '#ffffff', 3);
      G.ell(c, 0, -110, 150, 26); G.fillO(c, '#ffe3ec', 3);
      c.save(); c.translate(-10, -120); c.rotate(tilt);
      G.ell(c, 0, -40, 46, 40); G.fillO(c, '#9fd8ff', 3); c.beginPath(); c.moveTo(40, -40); c.quadraticCurveTo(76, -50, 80, -80); stroke(c, '#7ab8e0', 9); c.beginPath(); c.arc(-48, -40, 18, Math.PI * 0.5, Math.PI * 1.5); stroke(c, '#7ab8e0', 7);
      G.ell(c, 0, -80, 26, 8); G.fillO(c, '#9fd8ff', 2); dot(c, 0, -90, 7, '#ff8fb1');
      for (const [x, y] of [[-16, -40], [16, -30], [0, -56]]) { c.fillStyle = '#ff8fb1'; G.star(c, x, y, 6, 3, 5); c.fill(); }
      c.restore();
      if (pr) { c.beginPath(); c.moveTo(60, -186); c.quadraticCurveTo(90, -170, 92, -124); stroke(c, '#c8956a', 5); }
      for (const x of [92, -100]) { G.rr(c, x - 18, -138, 36, 26, 8); G.fillO(c, '#ffffff', 2.5); G.ell(c, x, -138, 18, 5); c.fillStyle = '#c8956a'; c.fill(); for (let i = 0; i < 2; i++) { const q = (t * 0.0006 + i * 0.5) % 1; dot(c, x + Math.sin(q * 6) * 6, -150 - q * 50, 6 + q * 6, `rgba(255,255,255,${0.7 * (1 - q)})`); } }
      G.rr(c, 40, -150, 30, 22, 6); G.fillO(c, '#ffd1e0', 2); dot(c, 55, -156, 6, '#e2433b');
    } };
  F.s8_musicbox2 = { w: 260, h: 320, tags: ['musicbox', 'music', 'ballet'], slots: [[-170, 20], [170, 20]],
    draw(c, t, f) {
      const pl = on(f, 'play', t), sp = pl ? 0.012 : 0.002;
      G.poly(c, [-110, -130, 110, -130, 96, -290, -96, -290]); G.fillO(c, '#c38be0', 4); G.poly(c, [-90, -146, 90, -146, 80, -276, -80, -276]); c.fillStyle = 'rgba(220,240,255,.8)'; c.fill();
      G.rr(c, -110, -130, 220, 130, 14); G.fillO(c, '#e0b0f0', 4); c.fillStyle = '#f5c242'; c.fillRect(-110, -134, 220, 8); c.fillRect(-110, -44, 220, 6);
      c.fillStyle = '#f5c242'; G.heart(c, 0, -80, 22); c.fill();
      c.save(); c.translate(118, -70); c.rotate(t * sp * 0.5); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -22); c.lineTo(14, -22); stroke(c, '#c99a22', 5); c.restore();
      G.ell(c, 0, -136, 30, 8); G.fillO(c, '#ffd1e0', 2);
      c.save(); c.translate(0, -140); c.scale(Math.cos(t * sp * 5), 1);
      c.beginPath(); c.moveTo(-2, 0); c.lineTo(-2, -30); stroke(c, '#ffe0c8', 4); c.beginPath(); c.moveTo(2, 0); c.lineTo(10, -28); stroke(c, '#ffe0c8', 4);
      G.ell(c, 0, -38, 26, 7); G.fillO(c, '#ffb3c8', 2); G.rr(c, -7, -64, 14, 26, 5); G.fillO(c, '#ffb3c8', 2);
      c.beginPath(); c.moveTo(-6, -58); c.lineTo(-20, -78); c.moveTo(6, -58); c.lineTo(20, -78); stroke(c, '#ffe0c8', 3.5);
      G.circ(c, 0, -74, 9); G.fillO(c, '#ffe0c8', 2); dot(c, 0, -84, 6, '#8a5a3a');
      c.restore();
      if (pl) for (let i = 0; i < 3; i++) { const q = (t * 0.0008 + i / 3) % 1; G.note(c, -80 + i * 70 + Math.sin(q * 8) * 10, -240 - q * 100, 18, RAIN[i + 1]); }
    } };

  /* ---------- 94 えほんの せかい ---------- */
  const popup = (c, n, s, t) => {
    c.save(); c.scale(1, s);
    if (n === 0) { for (const x of [-60, 60]) { G.rr(c, x - 22, -150, 44, 150, 4); G.fillO(c, '#ffd1e0', 2.5); G.poly(c, [x - 28, -150, x, -200, x + 28, -150]); G.fillO(c, '#9b8cff', 2.5); } G.rr(c, -40, -120, 80, 120, 4); G.fillO(c, '#ffe3ec', 2.5); G.rr(c, -14, -50, 28, 50, 14); G.fillO(c, '#c27a3e', 2); }
    else if (n === 1) { G.rr(c, -12, -80, 24, 80, 4); G.fillO(c, '#a8733f', 2); G.circ(c, 0, -130, 70); G.fillO(c, '#6cc07a', 3); for (const [x, y] of [[-30, -140], [26, -120], [0, -170], [36, -160]]) dot(c, x, y, 10, '#e2433b'); }
    else { for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(0, 0, 150 - i * 16, Math.PI, 0); stroke(c, RAIN[i], 14); } for (const x of [-140, 140]) { G.circ(c, x, -10, 30); G.fillO(c, '#ffffff', 2); } }
    c.restore();
  };
  F.s8_bigbook = { w: 460, h: 320, tags: ['book', 'story', 'magic'], slots: [[-270, 20], [270, 20]],
    draw(c, t, f) {
      const k = prog(f, 'flip', t, 4000);
      G.poly(c, [-230, -40, 0, -10, 230, -40, 230, -6, 0, 20, -230, -6]); G.fillO(c, '#e2433b', 3);
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(s * 110, -40, s * 214, -40); c.lineTo(s * 214, -250); c.quadraticCurveTo(s * 110, -250, 0, -226); c.closePath(); G._bb = { x0: Math.min(0, s * 214), y0: -250, x1: Math.max(0, s * 214), y1: -12 }; G.fillO(c, '#fffaf0', 3);
        c.strokeStyle = 'rgba(120,120,160,.35)'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { const y = -200 + i * 28; c.beginPath(); c.moveTo(s * 40, y + 6); c.lineTo(s * (180 - (i % 3) * 30), y); c.stroke(); } }
      if (k >= 0 && k < 0.35) { const q = k / 0.35, sx = Math.cos(q * Math.PI); c.save(); c.scale(sx, 1); c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(110, -40, 214, -40); c.lineTo(214, -250); c.quadraticCurveTo(110, -250, 0, -226); c.closePath(); G._bb = null; c.fillStyle = '#fff4dc'; c.fill(); c.strokeStyle = '#c9a070'; c.lineWidth = 3; c.stroke(); c.restore(); }
      if (k >= 0.3) { const s = Math.min(1, (k - 0.3) * 5) * (k > 0.9 ? (1 - k) * 10 : 1); c.save(); c.translate(0, -60); popup(c, (f.scene || 0) % 3, s, t); c.restore(); }
      else if (k < 0) { c.fillStyle = 'rgba(255,214,63,.8)'; G.star(c, 110, -150, 18 + Math.sin(t * 0.005) * 3, 8); c.fill(); G.heart(c, -110, -150, 18); c.fillStyle = 'rgba(255,111,145,.8)'; c.fill(); }
    } };
  F.s8_crayon = { w: 220, h: 320, tags: ['crayon', 'art', 'draw'], slots: [[-150, 20], [150, 20]],
    draw(c, t, f) {
      const k = prog(f, 'draw', t, 3500);
      for (let i = 0; i < 5; i++) { const x = -56 + i * 28, h = 170 + (i % 2) * 30 + (k >= 0 ? Math.abs(Math.sin(t * 0.01 + i)) * 24 : 0); G.rr(c, x - 12, -h, 24, h - 60, 4); G.fillO(c, RAIN[i], 2.5); G.poly(c, [x - 12, -h, x, -h - 26, x + 12, -h]); G.fillO(c, RAIN[i], 2); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x - 12, -h + 30, 24, 8); }
      G.rr(c, -86, -120, 172, 120, 10); G.fillO(c, '#ffd23f', 4); G.rr(c, -86, -86, 172, 30, 4); G.fillO(c, '#4fae5a', 2);
      c.font = `900 22px ${PT.FONT}`; c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('クレヨン', 0, -71);
      if (k >= 0) { const q = Math.min(1, k * 1.5); for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(0, -330, 150 - i * 16, Math.PI, Math.PI + Math.PI * q); stroke(c, RAIN[i], 12); } c.strokeStyle = 'rgba(80,80,120,.3)'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, -330, 158 - i * 30, Math.PI, Math.PI + Math.PI * q); c.stroke(); } if (q >= 1) for (const x of [-150, 150]) { G.circ(c, x, -320, 30); G.fillO(c, '#ffffff', 2.5); } }
    } };
  F.s8_beanstalk = { w: 260, h: 580, tags: ['plant', 'story', 'climb'], slots: [[-160, 20], [160, 20]],
    draw(c, t, f) {
      const g = on(f, 'grow', t) || on(f, 'climb', t), amp = g ? 40 : 18, sp = g ? 0.008 : 0.002;
      const px = (y) => Math.sin(y * 0.014 + t * sp) * amp * (y / 500);
      c.beginPath(); c.moveTo(0, 0); for (let y = 20; y <= 520; y += 20) c.lineTo(px(y), -y); stroke(c, '#3f8a4a', 24); c.beginPath(); c.moveTo(0, 0); for (let y = 20; y <= 520; y += 20) c.lineTo(px(y), -y); stroke(c, '#6cc07a', 14);
      for (let i = 0; i < 7; i++) { const y = 70 + i * 66, d = i % 2 ? 1 : -1; c.save(); c.translate(px(y), -y); c.rotate(d * (0.5 + (g ? Math.sin(t * 0.01 + i) * 0.2 : 0))); G.ell(c, d * 34, 0, 34, 14); G.fillO(c, '#7bd36a', 2.5); c.restore(); if (g && i % 2) { c.fillStyle = '#fff3a0'; G.star(c, px(y) + d * 60, -y - 20, 8, 3.4); c.fill(); } }
      c.save(); c.translate(px(520), -540);
      for (const [x, y, r] of [[-70, 10, 40], [-20, -10, 54], [50, 0, 46], [90, 16, 32], [0, 20, 44]]) { G.circ(c, x, y, r); c.fillStyle = '#ffffff'; c.fill(); }
      c.strokeStyle = '#cfe0f5'; c.lineWidth = 3; c.beginPath(); c.moveTo(-110, 40); c.lineTo(122, 40); c.stroke();
      c.restore();
    } };

  /* ---------- 95 ジェットコースター ---------- */
  F.s8_coaster = { w: 900, h: 420, tags: ['coaster', 'ride', 'fun'], slots: [[-500, 20], [500, 20]],
    draw(c, t, f) {
      const N = 60, pts = []; for (let i = 0; i <= N; i++) pts.push(P8.coaster(i / N));
      c.strokeStyle = '#c9ccd8'; c.lineWidth = 6; for (let i = 0; i <= N; i += 4) { const [x, y] = pts[i]; c.beginPath(); c.moveTo(x, y + 6); c.lineTo(x, 0); c.stroke(); }
      c.strokeStyle = 'rgba(200,204,216,.8)'; c.lineWidth = 3; for (let i = 0; i < N; i += 4) { const [x1, y1] = pts[i], [x2] = pts[i + 4] || pts[N]; c.beginPath(); c.moveTo(x1, y1 + 6); c.lineTo(x2, 0); c.stroke(); }
      const path = (o) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y + o) : c.moveTo(x, y + o))); };
      path(10); stroke(c, '#c0304a', 6); path(0); stroke(c, '#e2433b', 9); path(0); stroke(c, 'rgba(255,255,255,.6)', 2);
      G.rr(c, -460, -60, 110, 60, 8); G.fillO(c, '#ffd23f', 3); c.font = `900 20px ${PT.FONT}`; c.fillStyle = '#c0304a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('のりば', -405, -30);
      const k = prog(f, 'run', t, 4500), ck = k >= 0 ? k : 0, [cx, cy] = P8.coaster(ck), [nx, ny] = P8.coaster(Math.min(1, ck + 0.01)), a = Math.atan2(ny - cy, nx - cx);
      c.save(); c.translate(cx, cy - 4); c.rotate(a);
      G.rr(c, -50, -44, 100, 40, 14); G.fillO(c, '#58b9f0', 3); G.rr(c, -40, -60, 20, 22, 6); G.fillO(c, '#ffd23f', 2); G.rr(c, 6, -60, 20, 22, 6); G.fillO(c, '#ffd23f', 2);
      for (const x of [-30, 30]) dot(c, x, -2, 9, '#3a3550');
      c.restore();
    } };
  F.s8_teacup = { w: 380, h: 220, tags: ['teacup', 'ride', 'spin'], slots: [[-240, 20], [240, 20]],
    draw(c, t, f) {
      const fast = on(f, 'spin', t), a0 = t * (fast ? 0.005 : 0.0008);
      G.ell(c, 0, -26, 180, 40); G.fillO(c, '#9fd8ff', 4); G.ell(c, 0, -34, 150, 30); c.fillStyle = 'rgba(255,255,255,.4)'; c.fill();
      const cups = [0, 1, 2].map((i) => { const a = a0 + (i * PT.TAU) / 3; return { x: Math.cos(a) * 110, y: -40 + Math.sin(a) * 22, i, s: Math.sin(a) }; }).sort((p, q) => p.s - q.s);
      const drawCup = ({ x, y, i }) => { c.save(); c.translate(x, y); G.rr(c, -40, -54, 80, 54, 18); G.fillO(c, ['#ff8fb1', '#ffd23f', '#9b8cff'][i], 3); G.ell(c, 0, -54, 40, 10); G.fillO(c, '#ffffff', 2); c.beginPath(); c.arc(44, -30, 12, -1.2, 1.2); stroke(c, PT.line(['#ff8fb1', '#ffd23f', '#9b8cff'][i]), 5); dot(c, 0, -28, 7, '#ffffff'); c.restore(); };
      cups.filter((p) => p.s < 0).forEach(drawCup);
      G.rr(c, -10, -150, 20, 110, 6); G.fillO(c, '#f5c242', 2); G.ell(c, 0, -160, 40, 28); G.fillO(c, '#ff8fb1', 3); G.ell(c, 0, -188, 16, 8); G.fillO(c, '#ff8fb1', 2);
      cups.filter((p) => p.s >= 0).forEach(drawCup);
    } };
  F.s8_droptower = { w: 220, h: 600, tags: ['tower', 'ride', 'drop'], slots: [[-150, 20], [150, 20]],
    draw(c, t, f) {
      const k = prog(f, 'drop', t, 5000), hh = k >= 0 ? P8.tower(k) : 0;
      G.ell(c, 0, -6, 80, 16); G.fillO(c, '#9aa3b8', 3);
      G.rr(c, -22, -580, 44, 580, 10); G.fillO(c, '#e8eef5', 3);
      for (let y = -560; y < -40; y += 60) dot(c, 0, y, 7, (Math.floor(t / 160) + y / 60) % 2 ? '#ff6f91' : '#ffd23f');
      G.poly(c, [-50, -580, 0, -630, 50, -580]); G.fillO(c, '#ff6f91', 3); dot(c, 0, -640, 8, '#ffd23f');
      G.rr(c, -86, -76 - hh, 172, 44, 14); G.fillO(c, '#58b9f0', 4);
      for (const x of [-56, 56]) { G.rr(c, x - 16, -100 - hh, 32, 30, 8); G.fillO(c, '#ffd23f', 2.5); }
    } };

  /* ---------- 96 おたんじょうび パーティー ---------- */
  F.s8_kusudama = { w: 320, h: 480, tags: ['kusudama', 'party', 'celebrate'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      const k = prog(f, 'open', t, 5000), a = k >= 0 ? Math.min(1, k * 5) * 0.95 : 0, sw = Math.sin(t * 0.002) * 0.03;
      for (const s of [-1, 1]) { G.rr(c, s * 140 - 8, -450, 16, 450, 5); G.fillO(c, '#f5c242', 2.5); G.ell(c, s * 140, -4, 26, 8); G.fillO(c, '#c99a22', 2); }
      G.rr(c, -160, -460, 320, 22, 8); G.fillO(c, '#e2433b', 3); c.fillStyle = '#ffffff'; for (let x = -150; x < 160; x += 40) c.fillRect(x, -456, 20, 14);
      c.beginPath(); c.moveTo(0, -438); c.lineTo(0, -404); stroke(c, '#3a3550', 3);
      c.save(); c.translate(0, -404); c.rotate(sw);
      if (a > 0) {
        const len = Math.min(1, k * 3) * 200; G.rr(c, -32, 0, 64, len, 4); G.fillO(c, '#ffffff', 3);
        c.font = `900 30px ${PT.FONT}`; c.fillStyle = '#e2433b'; c.textAlign = 'center'; c.textBaseline = 'middle'; ['お', 'め', 'で', 'と', 'う'].forEach((s, i) => { if (24 + i * 36 < len) c.fillText(s, 0, 24 + i * 36); });
        for (let i = 0; i < 14; i++) { const q = (k * 3 + i / 14) % 1; c.save(); c.translate(Math.sin(i * 2.7) * (40 + q * 120), 40 + q * 300); c.rotate(q * 8 + i); c.fillStyle = RAIN[i % 5]; c.fillRect(-7, -4, 14, 8); c.restore(); }
      }
      for (const s of [-1, 1]) { c.save(); c.rotate(s * a); c.beginPath(); c.arc(0, 74, 74, s < 0 ? Math.PI / 2 : -Math.PI / 2, s < 0 ? Math.PI * 1.5 : Math.PI / 2); c.closePath(); G._bb = { x0: Math.min(0, s * 74), y0: 0, x1: Math.max(0, s * 74), y1: 148 }; G.fillO(c, s < 0 ? '#ffd23f' : '#ff8fb1', 4); c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 4; i++) { G.circ(c, s * (20 + (i % 2) * 26), 30 + i * 30, 7); c.fill(); } c.restore(); }
      if (a === 0) { c.beginPath(); c.moveTo(0, 148); c.lineTo(0, 290); stroke(c, '#e2433b', 4); G.circ(c, 0, 300, 14); c.strokeStyle = '#e2433b'; c.lineWidth = 5; c.stroke(); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, 148); c.quadraticCurveTo(s * 14, 180, s * 8, 210); stroke(c, '#ffd23f', 4); } }
      c.restore();
    } };
  F.s8_bigcake = { w: 340, h: 380, tags: ['cake', 'party', 'birthday', 'food'], slots: [[-210, 20], [210, 20]],
    draw(c, t, f) {
      const sg = on(f, 'sing', t), bl = on(f, 'blow', t);
      G.ell(c, 0, -10, 170, 22); G.fillO(c, '#e8eef5', 3);
      const tier = (y, w, h, col) => { G.rr(c, -w / 2, y - h, w, h, 18); G.fillO(c, col, 3.5); c.fillStyle = '#ffffff'; for (let x = -w / 2 + 16; x < w / 2; x += 28) { G.circ(c, x, y - h + 4, 12); c.fill(); } };
      tier(-14, 290, 100, '#ffd1e0'); tier(-114, 210, 84, '#fff4e2'); tier(-198, 140, 66, '#ffb3c8');
      for (let x = -120; x <= 120; x += 40) { G.circ(c, x, -60, 10); G.fillO(c, '#e2433b', 2); }
      for (let x = -80; x <= 80; x += 40) { G.heart(c, x, -160, 10); c.fillStyle = '#ff8fb1'; c.fill(); }
      G.rr(c, -50, -250, 100, 26, 8); G.fillO(c, '#8a5a3a', 2); c.font = `900 16px ${PT.FONT}`; c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('おめでとう', 0, -237);
      for (let i = 0; i < 5; i++) { const x = -48 + i * 24; G.rr(c, x - 5, -306, 10, 44, 3); G.fillO(c, RAIN[i], 1.5); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(x - 5, -296, 10, 4); c.fillRect(x - 5, -280, 10, 4);
        if (!bl) { const fl = 1 + Math.sin(t * 0.03 + i) * 0.15 + (sg ? 0.4 : 0); G.ell(c, x, -318, 6 * fl, 12 * fl); c.fillStyle = '#ffb030'; c.fill(); G.ell(c, x, -314, 3, 6); c.fillStyle = '#fff6b8'; c.fill(); }
        else { const q = (t * 0.001 + i * 0.2) % 1; dot(c, x + Math.sin(q * 6) * 6, -316 - q * 40, 6, `rgba(220,220,230,${1 - q})`); } }
      if (sg) for (let i = 0; i < 3; i++) { const q = (t * 0.0008 + i / 3) % 1; G.note(c, -140 + i * 140, -340 - q * 80, 20, RAIN[i]); }
    } };
  F.s8_gifts = { w: 360, h: 340, tags: ['present', 'party', 'birthday'], slots: [[-220, 20], [220, 20]],
    draw(c, t, f) {
      const op = on(f, 'open', t), k = prog(f, 'open', t, 3000);
      const box = (x, y, w, h, col, rib, i, lid) => { const j = op ? Math.sin(t * 0.02 + i) * 3 : 0; c.save(); c.translate(x, y + j); G.rr(c, -w / 2, -h, w, h, 6); G.fillO(c, col, 3); c.fillStyle = rib; c.fillRect(-6, -h, 12, h); c.save(); c.translate(0, -lid); G.rr(c, -w / 2 - 6, -h - 16, w + 12, 18, 5); G.fillO(c, col, 3); c.fillStyle = rib; c.fillRect(-6, -h - 16, 12, 18); for (const s of [-1, 1]) { G.ell(c, s * 14, -h - 24, 14, 9, s * 0.4); G.fillO(c, rib, 2); } c.restore(); c.restore(); };
      box(-110, 0, 110, 90, '#ff8fb1', '#ffd23f', 0, 0); box(10, 0, 120, 100, '#58b9f0', '#ffffff', 1, 0); box(130, 0, 90, 80, '#7bd36a', '#ff6f91', 2, 0);
      box(-50, -104, 100, 84, '#ffd23f', '#e2433b', 3, 0); box(70, -114, 80, 70, '#9b8cff', '#ffd23f', 4, 0);
      const lid = k >= 0 ? Math.sin(Math.min(1, k * 2) * Math.PI / 2) * 60 : 0;
      box(10, -204, 90, 76, '#e2433b', '#ffffff', 5, lid);
      if (op && k > 0.2) for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * 0.25, d = (k - 0.2) * 300; c.fillStyle = RAIN[i % 5]; G.star(c, 10 + Math.cos(a) * d, -300 + Math.sin(a) * d, 12, 5); c.fill(); }
    } };

  /* ================= ステージ ================= */
  const S = (o) => PT.STAGES.push(o);
  const kadomatsu = (c, x, y) => {
    for (const [dx, h] of [[-20, 150], [0, 190], [20, 130]]) { G.rr(c, x + dx - 10, y - h, 20, h, 4); G.fillO(c, '#6cc07a', 2.5); G.poly(c, [x + dx - 10, y - h + 10, x + dx + 10, y - h - 8, x + dx + 10, y - h + 4]); c.fillStyle = '#c8f0a0'; c.fill(); }
    for (let i = 0; i < 5; i++) { G.ell(c, x - 40 + i * 20, y - 70 - (i % 2) * 12, 22, 12); c.fillStyle = '#2f7a4a'; c.fill(); }
    G.rr(c, x - 44, y - 60, 88, 60, 10); G.fillO(c, '#d9b878', 3); c.strokeStyle = '#a8733f'; c.lineWidth = 3; for (const yy of [y - 46, y - 18]) { c.beginPath(); c.moveTo(x - 44, yy); c.lineTo(x + 44, yy); c.stroke(); }
  };
  S({ id: 'newyear', num: 85, name: 'おしょうがつ', bgm: 'fest', floor: [590, 880], color: '#e53935',
    tools: ['kite', 'pinwheel', 'drum', 'marshmallow', 'onigiri', 'juice', 'bell' in PT.ITEMS ? 'bell' : 'present', 'yukata', 'camera', 'balloon'].filter((i) => PT.ITEMS[i]), rides: ['horse', 'car'],
    spawn: [['sakura', 600, 780], ['yuto', 820, 760], ['baba', 1020, 800], ['jiji', 420, 800], ['pyoko', 1240, 800]],
    fixtures: [['s8_mochi', 300, 720], ['s8_kite', 820, 660], ['s8_koma', 1320, 760]], favs: ['kite', 'yukata', 'marshmallow', 'pinwheel'],
    bg(c, r) {
      B.sky(c, '#8fd3ff', '#fff1d6', 590);
      c.fillStyle = 'rgba(255,200,120,.35)'; G.circ(c, 800, 210, 150); c.fill(); dot(c, 800, 210, 80, '#ff7a59');
      c.fillStyle = '#6f8fd8'; c.beginPath(); c.moveTo(380, 590); c.lineTo(760, 250); c.lineTo(840, 250); c.lineTo(1260, 590); c.closePath(); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(760, 250); c.lineTo(840, 250); c.lineTo(912, 314); c.lineTo(872, 330); c.lineTo(840, 304); c.lineTo(806, 334); c.lineTo(772, 306); c.lineTo(736, 330); c.lineTo(700, 304); c.closePath(); c.fill();
      B.cloud(c, 220, 140, 1); B.cloud(c, 1380, 110, 0.9); B.cloud(c, 1100, 380, 0.6);
      G.rr(c, 560, 30, 480, 80, 16); G.fillO(c, '#fff8e8', 4); c.font = `900 40px ${PT.FONT}`; c.fillStyle = '#e2433b'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('あけまして おめでとう', 800, 72);
      for (let x = 0; x < W; x += 60) { c.fillStyle = (x / 60) % 2 ? '#ffffff' : '#e53935'; c.fillRect(x, 500, 60, 90); }
      c.fillStyle = '#3a3550'; c.fillRect(0, 496, W, 8);
      c.fillStyle = G.grad(c, 0, 590, 0, H, [[0, '#f0e2c4'], [1, '#e2cfa8']]); c.fillRect(0, 590, W, H - 590);
      c.fillStyle = 'rgba(160,130,90,.25)'; for (let i = 0; i < 80; i++) { G.circ(c, r() * W, 600 + r() * 280, 2 + r() * 3); c.fill(); }
      kadomatsu(c, 90, 610); kadomatsu(c, 1510, 610);
    } });
  S({ id: 'kodomonohi', num: 86, name: 'こどもの ひ', bgm: 'park', floor: [590, 880], color: '#1e88e5',
    tools: ['pinwheel', 'kite', 'knighthelm', 'drum', 'ball', 'onigiri', 'juice', 'bubbles', 'flower', 'camera'], rides: ['horse', 'bicycle', 'tricycle'],
    spawn: [['yuto', 600, 780], ['gaku', 820, 760], ['papa', 1020, 800], ['ricky', 420, 800], ['mama', 1240, 800]],
    fixtures: [['s8_koinobori', 360, 690], ['s8_kabuto', 900, 700], ['s8_shobu', 1340, 790]], favs: ['knighthelm', 'pinwheel', 'kite', 'drum'],
    bg(c, r) {
      B.sky(c, '#7fcbff', '#e8f8ff', 580); B.cloud(c, 260, 120, 1.1); B.cloud(c, 900, 80, 0.8); B.cloud(c, 1400, 150, 1);
      c.fillStyle = '#9fd88a'; G.ell(c, 300, 590, 520, 150); c.fill(); c.fillStyle = '#8acb7a'; G.ell(c, 1250, 590, 600, 180); c.fill();
      B.house(c, 1080, 560, 260, 200, '#fff1dc', '#5a7ab8'); B.house(c, 180, 570, 220, 170, '#ffe9e0', '#c96a5a');
      for (const [x, y] of [[1340, 300], [400, 330]]) { c.strokeStyle = '#8a7a6a'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x, 570); c.stroke(); ['#4a5a9a', '#ff6f61', '#58b9f0'].forEach((col, i) => { G.ell(c, x + 40, y + 20 + i * 34, 38, 12); c.fillStyle = col; c.fill(); dot(c, x + 14, y + 16 + i * 34, 4, '#ffffff'); }); }
      B.grass(c, 576, '#a6d98a', '#86c46a'); B.tufts(c, r, 590, 50, '#6fb85e');
      for (let i = 0; i < 16; i++) { const x = r() * W, y = 600 + r() * 260; for (let j = 0; j < 3; j++) { G.ell(c, x + (j - 1) * 8, y - 20, 4, 18, (j - 1) * 0.3); c.fillStyle = '#4f9a4a'; c.fill(); } G.ell(c, x, y - 40, 9, 7); c.fillStyle = '#8a6fd6'; c.fill(); }
    } });
  S({ id: 'alienplanet', num: 87, name: 'うちゅうじんの ほし', bgm: 'night', floor: [600, 880], color: '#8e24aa', lowGravity: true,
    tools: ['helmet', 'robotsuit', 'star', 'moon', 'flashlight', 'robottoy', 'crystalball', 'egg', 'magnifier', 'camera'], rides: ['airplane', 'trampoline', 'car'],
    spawn: [['gaku', 600, 780], ['nyan', 820, 760], ['kon', 1020, 800], ['lulu', 420, 800], ['futan', 1240, 800]],
    fixtures: [['s8_ufo2', 300, 700], ['s8_crystal', 820, 690], ['s8_jelly', 1320, 760]], favs: ['helmet', 'robotsuit', 'star', 'egg'],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 600, [[0, '#3a1a6a'], [0.6, '#9a4ab8'], [1, '#ff9ad5']]); c.fillRect(0, 0, W, 600);
      c.fillStyle = '#ffffff'; for (let i = 0; i < 70; i++) { G.circ(c, r() * W, r() * 380, 1 + r() * 2); c.fill(); }
      G.circ(c, 1280, 170, 90); G.fillO(c, '#7fe0c0', 4); c.fillStyle = 'rgba(255,255,255,.3)'; G.ell(c, 1250, 150, 50, 16, -0.3); c.fill();
      c.strokeStyle = '#ffd23f'; c.lineWidth = 10; c.beginPath(); c.ellipse(1280, 170, 160, 30, -0.3, 0.1, Math.PI - 0.1); c.stroke();
      dot(c, 300, 140, 46, '#ffe680'); dot(c, 420, 90, 24, '#ffb3e6');
      c.fillStyle = '#6a3a9a'; c.beginPath(); c.moveTo(0, 600); for (let x = 0; x <= W; x += 200) c.quadraticCurveTo(x + 100, 420 + (x % 400 ? 60 : 0), x + 200, 560); c.lineTo(W, 600); c.closePath(); c.fill();
      for (let i = 0; i < 7; i++) { const x = 100 + i * 230, h = 120 + r() * 80; c.beginPath(); c.moveTo(x, 600); c.quadraticCurveTo(x + 30, 600 - h / 2, x, 600 - h); stroke(c, '#4fc3a0', 8); dot(c, x, 600 - h, 16, RAIN[i % 5]); }
      c.fillStyle = G.grad(c, 0, 590, 0, H, [[0, '#c8b4f5'], [1, '#a890e0']]); c.fillRect(0, 590, W, H - 590);
      c.fillStyle = 'rgba(120,90,180,.35)'; for (let i = 0; i < 12; i++) { G.ell(c, r() * W, 640 + r() * 220, 30 + r() * 40, 8 + r() * 10); c.fill(); }
      for (let i = 0; i < 30; i++) { dot(c, r() * W, 610 + r() * 260, 3, ['#7fffd4', '#ffe680', '#ff9ad5'][i % 3]); }
    } });
  S({ id: 'futurecity', num: 88, name: 'みらいの まち', bgm: 'shop', floor: [600, 880], color: '#00acc1',
    tools: ['robottoy', 'robotsuit', 'helmet', 'phone', 'camera', 'sunglasses', 'starglasses', 'juice', 'skateboard', 'star'], rides: ['car', 'airplane', 'bus', 'skateboard'],
    spawn: [['gaku', 600, 780], ['yuto', 820, 760], ['lulu', 1020, 800], ['ricky', 420, 800], ['papa', 1240, 800]],
    fixtures: [['s8_tube', 800, 640], ['s8_flycar', 240, 780], ['s8_holo', 1360, 760]], favs: ['robotsuit', 'starglasses', 'robottoy', 'helmet'],
    bg(c, r) {
      B.sky(c, '#7fd8ff', '#eafcff', 600);
      for (let i = 0; i < 9; i++) { const x = 30 + i * 180, h = 220 + (i % 3) * 90 + r() * 40, col = ['#e8f4ff', '#d8ecff', '#f0e8ff'][i % 3]; G.rr(c, x, 600 - h, 120, h, 50); G.fillO(c, col.length === 7 ? col : '#e8f4ff', 3); c.fillStyle = 'rgba(120,220,255,.6)'; for (let y = 600 - h + 40; y < 580; y += 34) c.fillRect(x + 22, y, 76, 14); if (i % 3 === 1) { dot(c, x + 60, 600 - h - 14, 10, '#ff6f91'); } }
      c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 8; c.beginPath(); c.ellipse(500, 250, 260, 40, 0, 0, PT.TAU); c.stroke(); c.beginPath(); c.ellipse(1150, 180, 220, 34, 0.1, 0, PT.TAU); c.stroke();
      for (const [x, y, col] of [[300, 230, '#ff6f91'], [700, 275, '#ffd23f'], [1000, 170, '#7bd36a'], [1330, 200, '#9b8cff']]) { G.rr(c, x - 26, y - 14, 52, 22, 11); G.fillO(c, col, 2); }
      G.rr(c, 0, 520, W, 18, 6); G.fillO(c, '#c9d4e8', 3); for (let x = 60; x < W; x += 200) { G.rr(c, x, 538, 16, 62, 4); G.fillO(c, '#c9d4e8', 2); }
      c.fillStyle = G.grad(c, 0, 600, 0, H, [[0, '#e8f0fa'], [1, '#cfdaea']]); c.fillRect(0, 600, W, H - 600);
      c.strokeStyle = 'rgba(80,220,255,.6)'; c.lineWidth = 3; for (let y = 640; y < H; y += 70) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } for (let x = 0; x < W; x += 160) { c.beginPath(); c.moveTo(x, 600); c.lineTo(x + (x - 800) * 0.3, H); c.stroke(); }
    } });
  S({ id: 'momotaro', num: 89, name: 'むかしばなしの むら', bgm: 'camp', floor: [600, 880], color: '#f06292',
    tools: ['marshmallow', 'onigiri', 'bucket', 'basket', 'broom', 'yukata', 'flower', 'acorn', 'book', 'moon'], rides: ['boat', 'horse', 'carriage'],
    spawn: [['jiji', 560, 650], ['baba', 760, 640], ['pon', 1020, 660], ['kon', 420, 860], ['moko', 1240, 860]],
    fixtures: [['s8_peach', 800, 830], ['s8_dango', 260, 700], ['s8_bamboo', 1380, 680]], favs: ['yukata', 'onigiri', 'marshmallow', 'book'],
    bg(c, r) {
      B.sky(c, '#ffd8c8', '#fff6e8', 580); B.cloud(c, 300, 110, 0.9); B.cloud(c, 1200, 90, 1);
      c.fillStyle = '#9fc8a8'; G.ell(c, 300, 560, 500, 260); c.fill(); c.fillStyle = '#86b896'; G.ell(c, 1200, 570, 560, 300); c.fill();
      for (const [x, w] of [[200, 240], [560, 200], [1000, 260]]) { G.rr(c, x, 460, w, 120, 6); G.fillO(c, '#f2e2c0', 3); G.rr(c, x + w / 2 - 30, 500, 60, 80, 4); G.fillO(c, '#a8733f', 2); c.beginPath(); c.moveTo(x - 30, 470); c.lineTo(x + w * 0.2, 360); c.lineTo(x + w * 0.8, 360); c.lineTo(x + w + 30, 470); c.closePath(); G._bb = { x0: x - 30, y0: 360, x1: x + w + 30, y1: 470 }; G.fillO(c, '#c9a060', 4); c.strokeStyle = 'rgba(120,80,30,.35)'; c.lineWidth = 2; for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(x - 20 + k * (w + 40) / 8, 466); c.lineTo(x + w * 0.2 + k * w * 0.6 / 8, 364); c.stroke(); } }
      for (const x of [80, 1420]) { c.fillStyle = '#9a6b42'; c.fillRect(x - 10, 440, 20, 150); for (let i = 0; i < 6; i++) { G.circ(c, x + Math.cos(i) * 50, 420 + Math.sin(i) * 30, 40); c.fillStyle = '#ffc8d8'; c.fill(); } }
      B.grass(c, 576, '#b5dc9a', '#96c97a'); B.tufts(c, r, 590, 40, '#7fb86a');
      c.fillStyle = '#e8d6a8'; c.beginPath(); c.moveTo(560, 590); c.quadraticCurveTo(640, 680, 300, H); c.lineTo(520, H); c.quadraticCurveTo(760, 680, 680, 590); c.closePath(); c.fill();
    } });
  S({ id: 'tinyworld', num: 90, name: 'こびとの もり', bgm: 'title', floor: [600, 880], color: '#7cb342',
    tools: ['acorn', 'magnifier', 'bugnet', 'seed', 'wateringcan', 'flower', 'strawberry', 'bucket', 'basket', 'petals'], rides: ['tricycle', 'boat', 'tent'],
    spawn: [['pyoko', 600, 780], ['mimi', 820, 760], ['kon', 1020, 800], ['choco', 420, 800], ['moko', 1240, 800]],
    fixtures: [['s8_bigmush', 300, 720], ['s8_acorn', 840, 760], ['s8_leaf', 1320, 760]], favs: ['acorn', 'magnifier', 'bugnet', 'flower'],
    bg(c, r) {
      B.sky(c, '#c8f0ff', '#f0ffe8', 600);
      for (let i = 0; i < 14; i++) { const x = r() * W, h = 400 + r() * 300, b = (r() - 0.5) * 200; c.beginPath(); c.moveTo(x - 18, 600); c.quadraticCurveTo(x, 600 - h * 0.6, x + b, 600 - h); c.quadraticCurveTo(x + 10, 600 - h * 0.5, x + 18, 600); c.closePath(); c.fillStyle = i % 2 ? '#7fcf6a' : '#5fb85a'; c.fill(); }
      const daisy = (x, y, s) => { c.strokeStyle = '#4f9a4a'; c.lineWidth = 12 * s; c.beginPath(); c.moveTo(x, y); c.lineTo(x, 600); c.stroke(); for (let i = 0; i < 12; i++) { const a = (i / 12) * PT.TAU; G.ell(c, x + Math.cos(a) * 60 * s, y + Math.sin(a) * 60 * s, 40 * s, 16 * s, a); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#e0e0f0'; c.lineWidth = 2; c.stroke(); } G.circ(c, x, y, 34 * s); G.fillO(c, '#ffd23f', 3); };
      daisy(260, 240, 1.2); daisy(1250, 200, 1.4); daisy(760, 330, 0.9);
      c.save(); c.translate(1000, 420); G.ell(c, 0, 0, 50, 40); G.fillO(c, '#e2433b', 3); c.fillStyle = '#2a1f35'; c.fillRect(-1, -40, 2, 80); for (const [x, y] of [[-24, -14], [22, 10], [-20, 18], [24, -18]]) dot(c, x, y, 7, '#2a1f35'); dot(c, -50, 0, 18, '#2a1f35'); c.restore();
      for (const [x, y] of [[480, 470], [1450, 420]]) { G.ell(c, x, y, 22, 26); c.fillStyle = 'rgba(200,240,255,.8)'; c.fill(); c.strokeStyle = '#9fd8ff'; c.lineWidth = 2; c.stroke(); dot(c, x - 7, y - 8, 6, '#ffffff'); }
      B.grass(c, 590, '#9fd67a', '#7cc05a');
      for (let i = 0; i < 10; i++) { G.ell(c, r() * W, 640 + r() * 220, 20 + r() * 30, 10 + r() * 10); c.fillStyle = '#c8b8a0'; c.fill(); }
      for (let i = 0; i < 8; i++) { const x = r() * W, y = 640 + r() * 200; for (let j = 0; j < 3; j++) { G.heart(c, x + Math.cos(j * 2.1) * 14, y + Math.sin(j * 2.1) * 14, 14); c.fillStyle = '#5fb85a'; c.fill(); } }
    } });
  S({ id: 'icecreamland', num: 91, name: 'アイスの くに', bgm: 'shop', floor: [600, 880], color: '#ec407a',
    tools: ['icecream', 'cake', 'donut', 'candy', 'cookie', 'strawberry', 'pudding', 'juice', 'pancake', 'balloon'], rides: ['unicorn', 'carriage', 'tricycle'],
    spawn: [['mimi', 600, 780], ['choco', 820, 760], ['sakura', 1020, 800], ['pyoko', 420, 800], ['nyan', 1240, 800]],
    fixtures: [['s8_softserve', 260, 720], ['s8_creamslide', 820, 740], ['s8_soda', 1360, 740]], favs: ['icecream', 'cake', 'strawberry', 'candy'],
    bg(c, r) {
      B.sky(c, '#ffd6ea', '#eaf7ff', 600); B.cloud(c, 200, 100, 0.9, '#fff8fb'); B.cloud(c, 1350, 120, 1, '#fff8fb');
      for (const [x, y, rr, col] of [[200, 600, 220, '#ffb3c8'], [560, 600, 180, '#9fe0c0'], [940, 600, 240, '#fff4e2'], [1350, 600, 220, '#c8956a']]) { scoop(c, x, y - 40, rr, col); c.fillStyle = 'rgba(255,255,255,.35)'; G.ell(c, x - rr * 0.4, y - rr * 0.6, rr * 0.15, rr * 0.3, -0.4); c.fill(); }
      for (const x of [760, 1150]) { cone(c, x, 590, 90, 160); c.save(); c.translate(0, 0); scoop(c, x, 430, 54, x > 1000 ? '#ff8fb1' : '#9fd8ff'); c.restore(); G.circ(c, x, 370, 12); G.fillO(c, '#e2433b', 2); }
      c.fillStyle = G.grad(c, 0, 600, 0, H, [[0, '#fff0f6'], [1, '#ffe0ec']]); c.fillRect(0, 600, W, H - 600);
      const sc = ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a', '#9b8cff'];
      for (let i = 0; i < 90; i++) { c.save(); c.translate(r() * W, 610 + r() * 270); c.rotate(r() * 6); c.fillStyle = sc[i % 5]; c.fillRect(-7, -2.5, 14, 5); c.restore(); }
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(0, 600); for (let x = 0; x <= W; x += 80) c.quadraticCurveTo(x + 40, 640, x + 80, 600); c.lineTo(W, 590); c.lineTo(0, 590); c.closePath(); c.fill();
    } });
  S({ id: 'galaxysea', num: 92, name: 'ほしの うみ', bgm: 'night', floor: [600, 880], color: '#283593', night: true,
    tools: ['star', 'moon', 'starwand', 'moonstaff', 'shell', 'flashlight', 'telescope' in PT.ITEMS ? 'telescope' : 'magnifier', 'musicbox', 'swimring', 'goldfish'].filter((i) => PT.ITEMS[i]), rides: ['boat', 'swimring', 'unicorn'],
    spawn: [['yume', 600, 780], ['lulu', 820, 760], ['penta', 1020, 800], ['sakura', 420, 800], ['kon', 1240, 800]],
    fixtures: [['s8_moonboat', 320, 760], ['s8_starwhale', 860, 760], ['s8_telescope', 1360, 720]], favs: ['star', 'moon', 'starwand', 'shell'],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 520, [[0, '#070a2a'], [1, '#2a2a7a']]); c.fillRect(0, 0, W, 520);
      c.save(); c.translate(800, 220); c.rotate(-0.3); c.fillStyle = 'rgba(200,170,255,.18)'; G.ell(c, 0, 0, 900, 90); c.fill(); c.fillStyle = 'rgba(255,220,255,.12)'; G.ell(c, 0, 0, 700, 40); c.fill(); c.restore();
      B.stars(c, r, 160, 500);
      G.circ(c, 1300, 140, 60); G.fillO(c, '#ffb3e6', 3); c.strokeStyle = 'rgba(255,240,180,.8)'; c.lineWidth = 6; c.beginPath(); c.ellipse(1300, 140, 110, 20, -0.2, 0.15, Math.PI - 0.15); c.stroke();
      c.fillStyle = G.grad(c, 0, 470, 0, 600, [[0, '#3a4ab0'], [1, '#2a2a8a']]); c.fillRect(0, 470, W, 130);
      for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,246,184,${0.3 + r() * 0.5})`; c.fillRect(r() * W, 480 + r() * 110, 20 + r() * 40, 3); }
      c.fillStyle = G.grad(c, 0, 590, 0, H, [[0, '#4a4aa8'], [1, '#2e2e78']]); c.fillRect(0, 590, W, H - 590);
      for (let i = 0; i < 60; i++) { c.fillStyle = ['#fff6b8', '#bfe6ff', '#ffb3e6'][i % 3]; G.star(c, r() * W, 610 + r() * 270, 3 + r() * 5, 1.6); c.fill(); }
    } });
  S({ id: 'dollhouse', num: 93, name: 'ドールハウス', bgm: 'home', floor: [600, 880], color: '#ab47bc',
    tools: ['teaset', 'teddy', 'bunny', 'cushion', 'chair', 'table', 'musicbox', 'ribbon', 'dress', 'cookie'], rides: ['carriage', 'horse', 'whitehorse'],
    spawn: [['sakura', 600, 780], ['mimi', 820, 760], ['yume', 1020, 800], ['choco', 420, 800], ['mama', 1240, 800]],
    fixtures: [['s8_dhouse', 300, 690], ['s8_teaparty', 840, 780], ['s8_musicbox2', 1340, 720]], favs: ['ribbon', 'dress', 'teaset', 'teddy', 'tutu'],
    bg(c, r) {
      B.wallpaper(c, 600, '#ffeef5', '#ffe0ec');
      B.window(c, 640, 120, 320, 240, (c2, x, y, w, h) => { B.sky(c2, '#9fd8ff', '#e3f6ff', y + h); B.cloud(c2, x + 80, y + 60, 0.6); });
      for (const [x, y, col] of [[200, 160, '#c38be0'], [1240, 140, '#58b9f0'], [1420, 300, '#ffb3c8']]) { G.rr(c, x, y, 120, 150, 8); G.fillO(c, '#f5c242', 4); G.rr(c, x + 12, y + 12, 96, 126, 4); c.fillStyle = col; c.fill(); G.heart(c, x + 60, y + 76, 26); c.fillStyle = '#ffffff'; c.fill(); }
      c.strokeStyle = '#8a7a6a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 40); for (let x = 0; x <= W; x += 200) c.quadraticCurveTo(x + 100, 80, x + 200, 40); c.stroke(); for (let x = 50; x < W; x += 100) dot(c, x, 56 + (x % 200 === 50 ? 4 : 0), 8, RAIN[(x / 100) % 5 | 0]);
      B.floorWood(c, 600, '#e8c0a0');
      G.ell(c, 800, 760, 600, 110); c.fillStyle = 'rgba(255,170,200,.45)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 6; c.setLineDash([16, 12]); G.ell(c, 800, 760, 560, 96); c.stroke(); c.setLineDash([]);
    } });
  S({ id: 'picturebook', num: 94, name: 'えほんの せかい', bgm: 'title', floor: [600, 880], color: '#fb8c00',
    tools: ['book', 'crayons', 'crown', 'tiara', 'pirate', 'wand', 'apple', 'egg', 'teddy', 'slipper'], rides: ['carriage', 'unicorn', 'carpet'].filter((i) => PT.ITEMS[i]),
    spawn: [['lulu', 600, 780], ['pon', 820, 760], ['nyan', 1020, 800], ['yume', 420, 800], ['kon', 1240, 800]],
    fixtures: [['s8_bigbook', 820, 720], ['s8_crayon', 1360, 760], ['s8_beanstalk', 260, 680]], favs: ['book', 'crayons', 'crown', 'tiara', 'egg'],
    bg(c, r) {
      c.fillStyle = '#fff8e6'; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(100,170,240,.45)'; c.lineWidth = 10; c.lineCap = 'round'; for (let y = 30; y < 540; y += 22) { c.beginPath(); c.moveTo(20 + r() * 40, y); for (let x = 80; x < W - 40; x += 80) c.lineTo(x, y + (x % 160 ? 8 : -6)); c.stroke(); }
      c.save(); c.translate(200, 150); c.strokeStyle = '#ff9a3d'; c.lineWidth = 8; for (let i = 0; i < 10; i++) { const a = (i / 10) * PT.TAU; c.beginPath(); c.moveTo(Math.cos(a) * 80, Math.sin(a) * 80); c.lineTo(Math.cos(a) * 120, Math.sin(a) * 120); c.stroke(); } G.circ(c, 0, 0, 66); c.fillStyle = '#ffd23f'; c.fill(); c.stroke(); eyes(c, 0, -6, 20, 6); smile(c, 0, 12, 18, 5); c.restore();
      for (const [x, y] of [[700, 120], [1200, 90]]) { c.strokeStyle = '#7a8fb8'; c.lineWidth = 5; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, 40, Math.PI * 0.9, Math.PI * 2.1); c.arc(x + 60, y - 10, 50, Math.PI, Math.PI * 2); c.arc(x + 120, y, 40, Math.PI * 1.1, Math.PI * 0.1); c.closePath(); c.fill(); c.stroke(); }
      for (const [x, w, h, col] of [[480, 160, 130, '#ff8fb1'], [1100, 180, 150, '#9b8cff']]) { c.strokeStyle = '#3a3550'; c.lineWidth = 5; c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.rect(x, 590 - h, w, h); c.fill(); c.stroke(); c.beginPath(); c.moveTo(x - 20, 590 - h); c.lineTo(x + w / 2, 590 - h - 90); c.lineTo(x + w + 20, 590 - h); c.closePath(); c.fillStyle = col; c.fill(); c.stroke(); c.strokeRect(x + w / 2 - 20, 590 - 60, 40, 60); }
      for (const x of [380, 900, 1480]) { c.strokeStyle = '#8a5a3a'; c.lineWidth = 10; c.beginPath(); c.moveTo(x, 590); c.lineTo(x, 470); c.stroke(); G.circ(c, x, 430, 56); c.fillStyle = 'rgba(110,200,110,.8)'; c.fill(); c.strokeStyle = '#3f8a4a'; c.lineWidth = 5; c.stroke(); }
      c.fillStyle = 'rgba(120,200,100,.55)'; c.fillRect(0, 590, W, H - 590);
      c.strokeStyle = 'rgba(80,160,70,.6)'; c.lineWidth = 6; for (let y = 600; y < H; y += 24) { c.beginPath(); c.moveTo(0, y); for (let x = 40; x < W; x += 40) c.lineTo(x, y + (x % 80 ? 6 : -4)); c.stroke(); }
      c.strokeStyle = '#d8c8a8'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, i * 4 + 2); c.lineTo(W, i * 4 + 2); c.stroke(); }
      c.fillStyle = 'rgba(200,170,120,.25)'; c.fillRect(788, 0, 24, 590);
    } });
  S({ id: 'coaster', num: 95, name: 'ジェットコースター パーク', bgm: 'fun', floor: [600, 880], color: '#e53935',
    tools: ['balloon', 'icecream', 'candy', 'juice', 'camera', 'ticket', 'sunglasses', 'partyhat', 'popcorn' in PT.ITEMS ? 'popcorn' : 'donut', 'teddy'].filter((i) => PT.ITEMS[i]), rides: ['train', 'horse', 'car', 'bus'],
    spawn: [['ricky', 600, 800], ['pon', 820, 780], ['yuto', 1020, 820], ['lulu', 420, 820], ['papa', 1240, 820]],
    fixtures: [['s8_coaster', 800, 640], ['s8_teacup', 300, 800], ['s8_droptower', 1400, 740]], favs: ['balloon', 'sunglasses', 'ticket', 'icecream'],
    bg(c, r) {
      B.sky(c, '#8fd3ff', '#fff4e0', 590); B.cloud(c, 500, 90, 1); B.cloud(c, 1200, 130, 0.8);
      c.save(); c.translate(260, 330); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 8; G.circ(c, 0, 0, 200); c.stroke(); for (let i = 0; i < 12; i++) { const a = (i / 12) * PT.TAU; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 200, Math.sin(a) * 200); c.stroke(); G.rr(c, Math.cos(a) * 200 - 16, Math.sin(a) * 200, 32, 26, 8); c.fillStyle = RAIN[i % 5]; c.fill(); } c.lineWidth = 10; c.beginPath(); c.moveTo(0, 0); c.lineTo(-90, 260); c.moveTo(0, 0); c.lineTo(90, 260); c.stroke(); c.restore();
      c.strokeStyle = 'rgba(220,80,80,.35)'; c.lineWidth = 8; c.beginPath(); c.moveTo(700, 560); c.bezierCurveTo(800, 200, 950, 200, 1000, 450); c.bezierCurveTo(1050, 600, 1150, 250, 1300, 300); c.stroke();
      for (const [x, col] of [[1180, '#ff6f91'], [1440, '#58b9f0']]) { G.rr(c, x - 80, 470, 160, 120, 6); G.fillO(c, '#fff8e8', 3); c.beginPath(); c.moveTo(x - 100, 480); c.lineTo(x, 380); c.lineTo(x + 100, 480); c.closePath(); G._bb = { x0: x - 100, y0: 380, x1: x + 100, y1: 480 }; G.fillO(c, col, 3); dot(c, x, 370, 8, '#ffd23f'); }
      for (let i = 0; i < 8; i++) { const x = 560 + r() * 500, y = 80 + r() * 200; c.strokeStyle = '#ffffff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y + 30); c.lineTo(x + 6, y + 70); c.stroke(); G.ell(c, x, y, 18, 22); c.fillStyle = RAIN[i % 5]; c.fill(); }
      B.bunting(c, 0, 30, 800, 40, 50); B.bunting(c, 800, 40, 1600, 30, 50);
      c.fillStyle = G.grad(c, 0, 590, 0, H, [[0, '#f0e2cc'], [1, '#e0ccb0']]); c.fillRect(0, 590, W, H - 590);
      c.strokeStyle = 'rgba(160,130,90,.25)'; c.lineWidth = 2; for (let y = 620; y < H; y += 50) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    } });
  S({ id: 'birthday', num: 96, name: 'おたんじょうび パーティー', bgm: 'fest', floor: [600, 880], color: '#d81b60',
    tools: ['cake', 'present', 'balloon', 'confetti', 'partyhat', 'candy', 'juice', 'firework', 'music', 'teddy', 'royalcake'], rides: ['carriage', 'unicorn', 'train', 'horse'],
    spawn: [['lulu', 600, 780], ['pon', 820, 760], ['mimi', 1020, 800], ['gaku', 420, 800], ['choco', 1240, 800], ['mama', 920, 840], ['papa', 700, 850]],
    fixtures: [['s8_kusudama', 820, 660], ['s8_bigcake', 300, 760], ['s8_gifts', 1340, 760]], favs: ['partyhat', 'cake', 'present', 'balloon', 'confetti'],
    bg(c, r) {
      B.wallpaper(c, 600, '#fff0f6', '#ffe3ef');
      B.bunting(c, 0, 40, 800, 60, 60); B.bunting(c, 800, 60, 1600, 40, 60);
      G.rr(c, 470, 158, 660, 90, 40); G.fillO(c, '#ff8fb1', 4); c.font = `900 44px ${PT.FONT}`; c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('おたんじょうび おめでとう', 800, 205);
      for (const [bx, by] of [[150, 260], [1450, 240]]) { for (let i = 0; i < 5; i++) { const x = bx + (i - 2) * 46, y = by + Math.abs(i - 2) * 30; c.strokeStyle = '#8a7a6a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y + 44); c.lineTo(bx, by + 300); c.stroke(); G.ell(c, x, y, 34, 42); G.fillO(c, RAIN[i], 3); c.fillStyle = 'rgba(255,255,255,.5)'; G.ell(c, x - 12, y - 14, 8, 12, -0.4); c.fill(); } }
      for (let i = 0; i < 6; i++) { c.strokeStyle = RAIN[i % 5]; c.lineWidth = 8; c.beginPath(); const x = 300 + i * 200; c.moveTo(x, 0); for (let y = 0; y < 120; y += 20) c.lineTo(x + (y % 40 ? 14 : -14), y); c.stroke(); }
      B.floorWood(c, 600, '#e8b98a');
      for (let i = 0; i < 70; i++) { c.save(); c.translate(r() * W, 610 + r() * 270); c.rotate(r() * 6); c.fillStyle = RAIN[i % 5]; c.fillRect(-6, -3, 12, 6); c.restore(); }
    } });
})();
