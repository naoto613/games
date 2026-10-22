/* ふえた ステージ（73〜84）：しんかい・なんきょく・サバンナ・ひみつきち・かざん・どうくつ・みずうみ・たけやぶ・おはなみ・もみじ・ほたる・たなばた */
'use strict';
(() => {
  const G = PT.G, B = PT.BG, F = PT.FIX, W = PT.W, H = PT.H;
  const on = (f, k, t) => f[k] && t < f[k];
  const prog = (f, k, t, ms) => (on(f, k, t) ? 1 - (f[k] - t) / ms : -1);
  const arc = (f, k, t, ms) => { const p = prog(f, k, t, ms); return p >= 0 ? Math.sin(p * Math.PI) : 0; };
  const INK = '#2a1f35';
  const dot = (c, x, y, r = 3, col = INK) => { G.circ(c, x, y, r); c.fillStyle = col; c.fill(); };
  const eye = (c, x, y, r = 4) => { dot(c, x, y, r); dot(c, x - r * 0.3, y - r * 0.35, r * 0.35, '#ffffff'); };
  const smile = (c, x, y, r = 6, w = 2.5) => { c.strokeStyle = INK; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r, 0.2, Math.PI - 0.2); c.stroke(); };
  const shut = (c, x, y, r = 5, w = 2.5) => { c.strokeStyle = INK; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r, Math.PI + 0.3, -0.3); c.stroke(); };
  const cheek = (c, x, y, r = 6) => { G.circ(c, x, y, r); c.fillStyle = 'rgba(255,120,150,.45)'; c.fill(); };
  const glow = (c, x, y, r, rgb, a = 0.6) => { c.fillStyle = G.rgrad(c, x, y, 0, r, [[0, `rgba(${rgb},${a})`], [1, `rgba(${rgb},0)`]]); G.circ(c, x, y, r); c.fill(); };
  const petal = (c, x, y, s, rot, col = '#ffb7cf') => { c.save(); c.translate(x, y); c.rotate(rot); G.ell(c, 0, 0, s, s * 0.6); c.fillStyle = col; c.fill(); c.restore(); };
  const leaf = (c, x, y, s, rot, col) => { c.save(); c.translate(x, y); c.rotate(rot); G.ell(c, 0, 0, s, s * 0.55); c.fillStyle = col; c.fill(); c.strokeStyle = 'rgba(90,40,20,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-s, 0); c.lineTo(s, 0); c.stroke(); c.restore(); };
  const fishS = (c, x, y, s, col, dir = 1) => { c.save(); c.translate(x, y); c.scale(dir * s, s); G.ell(c, 0, 0, 16, 10); G.fillO(c, col, 2); G.poly(c, [-13, 0, -26, -9, -26, 9]); G.fillO(c, col, 2); dot(c, 8, -2, 2.4); c.restore(); };
  const AUTUMN = ['#e2433b', '#f57c2a', '#ffb02e', '#ffd23f', '#c9762e'];

  /* ペンギン */
  const pen = (c, x, y, s = 1, rot = 0, flap = 0, baby = false) => {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    const body = baby ? '#9aa3b8' : '#3a3f5a';
    for (const sx of [-1, 1]) { G.ell(c, sx * 9, -3, 9, 4); G.fillO(c, '#ff9f3a', 1.5); }
    for (const sx of [-1, 1]) { c.save(); c.translate(sx * 22, -44); c.rotate(sx * (0.35 + flap)); G.ell(c, 0, 8, 7, 18); G.fillO(c, body, 2); c.restore(); }
    G.ell(c, 0, -40, 26, 38); G.fillO(c, body, 2.5); G.ell(c, 0, -32, 18, 27); c.fillStyle = '#ffffff'; c.fill();
    if (baby) { G.ell(c, 0, -56, 17, 13); c.fillStyle = '#ffffff'; c.fill(); }
    eye(c, -8, -58, 3.2); eye(c, 8, -58, 3.2); G.poly(c, [-5, -51, 5, -51, 0, -44]); c.fillStyle = '#ff9f3a'; c.fill(); cheek(c, -13, -49, 4); cheek(c, 13, -49, 4);
    c.restore();
  };
  /* パンダ */
  const BK = '#2f2f3a';
  const panda = (c, x, y, s = 1, rot = 0, o = {}) => {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    for (const sx of [-1, 1]) { G.ell(c, sx * 30, -12, 18, 14); G.fillO(c, BK, 2); }
    G.ell(c, 0, -50, 48, 46); G.fillO(c, '#ffffff', 2.5);
    const ay = o.eat ? -0.9 : 0;
    for (const sx of [-1, 1]) { c.save(); c.translate(sx * 40, -66); c.rotate(sx * (0.4 + (o.up ? 1.6 : 0)) + (sx < 0 ? ay : 0)); G.ell(c, 0, 12, 14, 22); G.fillO(c, BK, 2); c.restore(); }
    G.circ(c, 0, -112, 40); G.fillO(c, '#ffffff', 2.5);
    for (const sx of [-1, 1]) { G.circ(c, sx * 30, -142, 13); G.fillO(c, BK, 2); G.ell(c, sx * 15, -114, 10, 13, sx * 0.45); c.fillStyle = BK; c.fill(); }
    if (o.closed) { c.strokeStyle = '#ffffff'; c.lineWidth = 2.5; for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 15, -112, 4, Math.PI + 0.3, -0.3); c.stroke(); } } else { dot(c, -14, -116, 3.6, '#ffffff'); dot(c, 14, -116, 3.6, '#ffffff'); dot(c, -14, -116, 1.8); dot(c, 14, -116, 1.8); }
    G.ell(c, 0, -100, 6, 4); c.fillStyle = BK; c.fill();
    if (o.mouth) { G.ell(c, 0, -90, 6, 5 + o.mouth * 3); c.fillStyle = '#e2556a'; c.fill(); } else smile(c, 0, -96, 5, 2);
    cheek(c, -24, -98, 6); cheek(c, 24, -98, 6);
    c.restore();
  };

  /* ================= 73 しんかい たんけん ================= */
  F.s7_sub = { w: 380, h: 280, tags: ['submarine', 'sea', 'vehicle'], slots: [[-240, 20], [240, 20]],
    draw(c, t, f) {
      const k = prog(f, 'go', t, 4000), dx = k >= 0 ? Math.sin(k * PT.TAU) * 220 : 0, dy = k >= 0 ? -Math.sin(k * Math.PI) * 120 : Math.sin(t * 0.002) * 6;
      c.save(); c.translate(dx, dy - 30);
      for (let i = 0; i < 4; i++) { const q = (t * 0.0008 + i * 0.25) % 1; G.circ(c, -190 - q * 20, -110 - q * 160, 5 + q * 6); c.strokeStyle = `rgba(255,255,255,${0.8 - q * 0.7})`; c.lineWidth = 2; c.stroke(); }
      const sp = t * (k >= 0 ? 0.03 : 0.006);
      G.ell(c, -180, -110, 10, 34 * Math.abs(Math.cos(sp))); G.fillO(c, '#9aa3b8', 2.5);
      G.poly(c, [-170, -130, -120, -120, -120, -100, -170, -90]); G.fillO(c, '#f5a623', 2.5);
      G.ell(c, 0, -110, 170, 80); G.fillO(c, '#ffd23f', 4);
      c.strokeStyle = '#3a3550'; c.lineWidth = 5; c.beginPath(); c.moveTo(20, -220); c.lineTo(20, -268); c.lineTo(48, -268); c.stroke();
      G.rr(c, -50, -232, 100, 70, 20); G.fillO(c, '#ffc21f', 3.5);
      [-90, 0, 90].forEach((x, i) => {
        G.circ(c, x, -108, 32); G.fillO(c, '#c9ccd8', 3); G.circ(c, x, -108, 24); c.fillStyle = '#2a5a9a'; c.fill();
        c.save(); G.circ(c, x, -108, 24); c.clip();
        if (on(f, 'peek', t)) { const q = ((t * 0.12 + i * 37) % 110) - 55; fishS(c, x + q, -104 + Math.sin(t * 0.01 + i) * 4, 0.9, ['#ff8a3d', '#ff6f91', '#7fd0ff'][i], 1); }
        if (f.rider && k >= 0 && i === 1) { G.circ(c, x, -100, 18); G.fillO(c, f.rcol || '#ffd8b0', 2); eye(c, x - 6, -104, 2.4); eye(c, x + 6, -104, 2.4); smile(c, x, -98, 5, 2); }
        c.fillStyle = 'rgba(255,255,255,.35)'; G.ell(c, x - 8, -118, 7, 10, -0.6); c.fill(); c.restore();
      });
      c.fillStyle = '#ff6f91'; c.fillRect(-150, -66, 300, 8);
      c.restore();
    } };
  F.s7_angler = { w: 240, h: 260, tags: ['fish', 'light', 'sea'], slots: [[-160, 20], [160, 20]],
    draw(c, t, f) {
      const g = on(f, 'glow', t), by = Math.sin(t * 0.002) * 8;
      c.save(); c.translate(0, by);
      const lx = 70, ly = -232;
      glow(c, lx, ly, g ? 150 + Math.sin(t * 0.01) * 10 : 46, '255,240,150', g ? 0.7 : 0.45);
      c.strokeStyle = '#5a4ab0'; c.lineWidth = 5; c.beginPath(); c.moveTo(20, -150); c.quadraticCurveTo(40, -250, lx, ly + 10); c.stroke();
      G.poly(c, [-80, -100, -140, -150, -150, -60]); G.fillO(c, '#7a6ad8', 3);
      G.ell(c, 0, -100, 84, 66); G.fillO(c, '#7a6ad8', 4);
      G.ell(c, 10, -78, 50, 30); c.fillStyle = '#b8adf0'; c.fill();
      G.circ(c, 30, -126, 20); G.fillO(c, '#ffffff', 2.5); eye(c, 34, -124, 9);
      c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(50, -86, 18, 0.1, Math.PI * 0.8); c.stroke(); cheek(c, 64, -100, 8);
      G.circ(c, lx, ly, g ? 18 : 14); G.fillO(c, '#fff3a0', 2.5);
      if (g) for (let i = 0; i < 4; i++) { const a = t * 0.004 + i * PT.TAU / 4; fishS(c, lx + Math.cos(a) * 80, ly + Math.sin(a) * 40, 0.8, ['#ff8a3d', '#7fd0ff', '#ff6f91', '#7bd36a'][i], Math.sin(a) > 0 ? -1 : 1); }
      c.restore();
    } };
  F.s7_octo = { w: 260, h: 300, tags: ['octopus', 'sea', 'animal'], slots: [[-170, 20], [170, 20]],
    draw(c, t, f) {
      const jug = on(f, 'juggle', t), hug = on(f, 'hug', t), sp = jug ? 0.012 : 0.004;
      for (let i = 0; i < 8; i++) { const x = -70 + i * 20, w = Math.sin(t * sp + i) * 18; G.limb(c, x * 0.6, -100, x * 1.3 + w, -14 + Math.abs(w) * 0.3, 18, '#ff8fa3'); G.circ(c, x * 1.3 + w, -14, 4); c.fillStyle = '#ffd1dc'; c.fill(); }
      if (hug) for (const s of [-1, 1]) G.limb(c, s * 50, -130, s * 120, -200 + Math.sin(t * 0.02) * 10, 18, '#ff8fa3');
      G.ell(c, 0, -160, 74, 70); G.fillO(c, '#ff8fa3', 4);
      for (const [x, y, r] of [[-30, -200, 8], [30, -210, 6], [10, -230, 5]]) { G.circ(c, x, y, r); c.fillStyle = '#ffc2d0'; c.fill(); }
      if (hug) { shut(c, -24, -150, 8); shut(c, 24, -150, 8); } else { eye(c, -24, -152, 8); eye(c, 24, -152, 8); }
      G.ell(c, 0, -122, 10, 8); c.fillStyle = '#e2556a'; c.fill(); cheek(c, -46, -130, 9); cheek(c, 46, -130, 9);
      if (jug) for (let i = 0; i < 3; i++) { const p = t * 0.006 + i * 2.1; const x = Math.sin(p) * 80, y = -260 - Math.abs(Math.cos(p)) * 90; G.poly(c, [x - 14, y + 8, x, y - 12, x + 14, y + 8]); G.fillO(c, ['#ffe0b0', '#ffd1e0', '#bfe6ff'][i], 2); }
      if (hug) for (let i = 0; i < 3; i++) { const q = ((t * 0.001) + i * 0.33) % 1; G.heart(c, -40 + i * 40, -250 - q * 60, 14); c.fillStyle = `rgba(255,93,120,${1 - q})`; c.fill(); }
    } };

  /* ================= 74 なんきょく ================= */
  F.s7_iceslope = { w: 440, h: 270, tags: ['ice', 'slide', 'snow'], slots: [[250, 20], [-270, 20]],
    path: (k) => ({ x: -170 + k * 370, y: -244 + k * 236 }),
    draw(c, t, f) {
      G.poly(c, [-220, 0, -220, -226, -150, -246, 220, -8, 220, 0]); G.fillO(c, '#e8f6ff', 4);
      c.strokeStyle = 'rgba(150,200,240,.8)'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-120 + i * 70, -200 + i * 46); c.lineTo(-60 + i * 70, -162 + i * 46); c.stroke(); }
      for (let i = 0; i < 5; i++) { G.rr(c, -214, -40 - i * 44, 50, 10, 4); G.fillO(c, '#bfe6ff', 2); }
      const k = prog(f, 'slide', t, 2500);
      if (k >= 0) { const p = this.path(PT.easeInOut(Math.min(1, k * 1.2))); pen(c, p.x, p.y - 4, 0.9, -1.0, 0.8); c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 1; i < 4; i++) { G.circ(c, p.x - i * 18, p.y - 6 - i * 10, 5); c.fill(); } }
      else pen(c, -180, -246, 0.9, Math.sin(t * 0.004) * 0.08, Math.max(0, Math.sin(t * 0.006)) * 0.4);
    } };
  F.s7_penguins = { w: 380, h: 180, tags: ['penguin', 'bird', 'snow'], slots: [[-240, 20], [240, 20]],
    draw(c, t, f) {
      const k = prog(f, 'waddle', t, 3000), d = on(f, 'dance', t);
      const dx = k >= 0 ? Math.sin(k * PT.TAU) * 50 : 0;
      [[-120, 1, false], [0, 1.15, false], [110, 0.75, true], [170, 0.65, true]].forEach(([x, s, baby], i) => {
        const wob = (k >= 0 || d) ? Math.sin(t * 0.02 + i) * 0.18 : Math.sin(t * 0.003 + i) * 0.04;
        const hop = d ? Math.abs(Math.sin(t * 0.012 + i)) * 24 : 0;
        pen(c, x + dx, -hop, s, wob, (k >= 0 || d) ? Math.abs(Math.sin(t * 0.02 + i)) * 1.0 : 0, baby);
      });
      if (d) for (let i = 0; i < 3; i++) { const q = (t * 0.001 + i * 0.33) % 1; G.note(c, -100 + i * 100, -140 - q * 60, 18, ['#58b9f0', '#ff6f91', '#ffd23f'][i]); }
    } };
  F.s7_whale = { w: 520, h: 260, tags: ['whale', 'water', 'sea'], slots: [[-300, 20], [300, 20]],
    draw(c, t, f) {
      G.ell(c, 0, -50, 250, 58); G.fillO(c, '#4fa8d8', 4); G.ell(c, 0, -46, 230, 46); c.fillStyle = '#6fc0e8'; c.fill();
      const sp = arc(f, 'spout', t, 2600), up = Math.sin(t * 0.0015) * 4 - sp * 20;
      c.save(); c.beginPath(); c.rect(-260, -400, 520, 352); c.clip();
      G.ell(c, -10, -50 + up, 170, 78); G.fillO(c, '#5a7ac8', 4); G.ell(c, -10, -20 + up, 150, 34); c.fillStyle = '#c9dcf5'; c.fill();
      c.save(); c.translate(-180, -80 + up); c.rotate(-0.5 + Math.sin(t * 0.004) * 0.2); G.poly(c, [0, 0, -50, -30, -40, 20]); G.fillO(c, '#5a7ac8', 3); c.restore();
      eye(c, 90, -72 + up, 6); smile(c, 110, -58 + up, 14, 3); cheek(c, 120, -76 + up, 8);
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(-10 + s * 150, -48, 40, 8, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
      if (sp > 0) { const hgt = sp * 220; c.fillStyle = 'rgba(190,235,255,.85)'; c.beginPath(); c.moveTo(30, -110 + up); c.quadraticCurveTo(10, -110 - hgt * 0.5, 30, -110 - hgt); c.quadraticCurveTo(50, -110 - hgt * 0.5, 30, -110 + up); c.fill(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.4; G.circ(c, 30 + Math.cos(a) * 50, -110 - hgt + Math.sin(a) * 30 + 30, 8); c.fill(); } }
      else { for (let i = 0; i < 2; i++) { const q = (t * 0.0009 + i * 0.5) % 1; G.circ(c, 30 + i * 10, -110 - q * 50, 5); c.fillStyle = `rgba(190,235,255,${1 - q})`; c.fill(); } }
    } };

  /* ================= 75 サバンナ ================= */
  F.s7_kirin = { w: 280, h: 520, tags: ['giraffe', 'animal'], slots: [[-170, 20], [170, 20]],
    neckAt: (f, t) => 150 + arc(f, 'neck', t, 3000) * 100,
    draw(c, t, f) {
      // アカシアの えだ
      c.strokeStyle = '#8a5a3a'; c.lineWidth = 10; c.beginPath(); c.moveTo(150, -330); c.quadraticCurveTo(140, -420, 80, -470); c.stroke();
      G.ell(c, 90, -480, 110, 28); G.fillO(c, '#6fae4a', 3); G.ell(c, 150, -498, 60, 18); c.fillStyle = '#86c05a'; c.fill();
      const L = this.neckAt(f, t), sw = Math.sin(t * 0.002) * 0.04;
      for (const x of [-60, -30, 30, 60]) { G.rr(c, x - 9, -170, 18, 170, 6); G.fillO(c, '#ffd36a', 2.5); G.rr(c, x - 10, -16, 20, 16, 4); G.fillO(c, '#8a5a3a', 2); }
      G.ell(c, 0, -180, 84, 54); G.fillO(c, '#ffd36a', 3.5);
      c.fillStyle = '#d9913a'; for (const [x, y] of [[-40, -190], [0, -205], [30, -170], [-10, -160], [55, -195], [-60, -165]]) { G.blob(c, [x - 10, y - 8, x + 10, y - 9, x + 11, y + 8, x - 9, y + 9]); c.fill(); }
      c.save(); c.translate(50, -200); c.rotate(0.2 + sw);
      G.rr(c, -18, -L, 36, L + 10, 16); G.fillO(c, '#ffd36a', 3);
      c.fillStyle = '#d9913a'; for (let y = -30; y > -L + 20; y -= 46) { G.blob(c, [-12, y - 8, 6, y - 10, 10, y + 6, -8, y + 9]); c.fill(); }
      c.translate(0, -L);
      for (const s of [-1, 1]) { c.strokeStyle = '#8a5a3a'; c.lineWidth = 5; c.beginPath(); c.moveTo(s * 10, -26); c.lineTo(s * 12, -50); c.stroke(); dot(c, s * 12, -52, 6, '#8a5a3a'); }
      G.ell(c, 14, -14, 42, 26, 0.2); G.fillO(c, '#ffd36a', 3); G.ell(c, 42, -6, 18, 14); c.fillStyle = '#ffe9b0'; c.fill();
      eye(c, 8, -22, 5); cheek(c, 20, -8, 6);
      if (on(f, 'neck', t)) { const m = Math.sin(t * 0.03) * 3; G.ell(c, 50, -4 + m, 8, 4); c.fillStyle = '#6a3a2a'; c.fill(); leaf(c, 62, -6, 10, 0.4, '#6fae4a'); }
      c.restore();
      c.strokeStyle = '#8a5a3a'; c.lineWidth = 4; c.beginPath(); c.moveTo(-80, -190); c.quadraticCurveTo(-100, -150 + Math.sin(t * 0.005) * 10, -96, -120); c.stroke();
    } };
  F.s7_lion = { w: 300, h: 240, tags: ['lion', 'animal'], slots: [[-190, 20], [190, 20]],
    draw(c, t, f) {
      const y = arc(f, 'yawn', t, 2200), fl = on(f, 'fluff', t);
      c.strokeStyle = '#d9913a'; c.lineWidth = 6; c.beginPath(); c.moveTo(110, -50); c.quadraticCurveTo(160, -60, 150 + Math.sin(t * 0.006) * 14, -110); c.stroke(); G.circ(c, 150 + Math.sin(t * 0.006) * 14, -114, 12); G.fillO(c, '#c9762e', 2);
      G.ell(c, 30, -56, 100, 50); G.fillO(c, '#f2b95a', 3.5);
      for (const x of [-30, 90]) { G.ell(c, x, -12, 24, 12); G.fillO(c, '#f2b95a', 2.5); }
      const ms = 1 + (fl ? Math.sin(t * 0.03) * 0.06 : 0) + y * 0.08;
      c.save(); c.translate(-70, -110); c.scale(ms, ms);
      const pts = []; for (let i = 0; i < 14; i++) { const a = (i / 14) * PT.TAU, r = i % 2 ? 62 : 76; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
      G.blob(c, pts); G.fillO(c, '#c9762e', 3);
      for (const s of [-1, 1]) { G.circ(c, s * 32, -36, 13); G.fillO(c, '#f7c56a', 2); }
      G.circ(c, 0, 4, 46); G.fillO(c, '#f7c56a', 3);
      if (y > 0.2) { shut(c, -16, -4, 7); shut(c, 16, -4, 7); G.ell(c, 0, 26, 14, 8 + y * 14); G.fillO(c, '#e2556a', 2.5); }
      else { eye(c, -16, -4, 5); eye(c, 16, -4, 5); G.ell(c, 0, 12, 8, 6); c.fillStyle = '#8a4a3a'; c.fill(); smile(c, -6, 18, 6, 2.2); smile(c, 6, 18, 6, 2.2); }
      cheek(c, -28, 14, 7); cheek(c, 28, 14, 7);
      c.restore();
      if (fl) for (let i = 0; i < 3; i++) { const q = (t * 0.001 + i * 0.33) % 1; G.heart(c, -110 + i * 40, -200 - q * 50, 13); c.fillStyle = `rgba(255,93,120,${1 - q})`; c.fill(); }
      if (y > 0.2) { c.fillStyle = INK; c.font = `900 24px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('ふわぁ〜', -70, -200); }
    } };
  F.s7_hippo = { w: 400, h: 220, tags: ['hippo', 'water', 'animal'], slots: [[-250, 20], [250, 20]],
    draw(c, t, f) {
      G.ell(c, 0, -50, 196, 56); G.fillO(c, '#8a6a4a', 4); G.ell(c, 0, -50, 180, 46); c.fillStyle = G.grad(c, 0, -96, 0, -4, [[0, '#7fd0e8'], [1, '#3a9ac8']]); c.fill();
      const u = arc(f, 'up', t, 2400) * 60, sp = on(f, 'splash', t);
      c.save(); c.beginPath(); c.rect(-200, -400, 400, 350); c.clip();
      c.translate(10, -40 - u + Math.sin(t * 0.002) * 3);
      G.ell(c, 0, -10, 80, 56); G.fillO(c, '#b39ae8', 3.5);
      for (const s of [-1, 1]) { G.ell(c, s * 46, -62, 12, 14); G.fillO(c, '#b39ae8', 2); eye(c, s * 26, -40, 6); }
      G.ell(c, 0, 4, 60, 30); G.fillO(c, '#c9b5f0', 3); dot(c, -16, -6, 4, '#7a5ab0'); dot(c, 16, -6, 4, '#7a5ab0');
      if (u > 20) { G.ell(c, 0, 26, 36, 14 + u * 0.15); G.fillO(c, '#e2556a', 2.5); c.fillStyle = '#ffffff'; c.fillRect(-28, 14, 8, 8); c.fillRect(20, 14, 8, 8); }
      cheek(c, -46, 4, 8); cheek(c, 46, 4, 8);
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.beginPath(); c.ellipse(10, -44, 100, 12, 0, 0.2, Math.PI - 0.2); c.stroke();
      if (sp) for (const s of [-1, 1]) { for (let i = 0; i < 5; i++) { const q = ((t * 0.002) + i * 0.2) % 1; G.circ(c, 10 + s * (10 + q * 70), -110 - Math.sin(q * Math.PI) * 120, 7); c.fillStyle = 'rgba(190,235,255,.9)'; c.fill(); } }
    } };

  /* ================= 76 ひみつきち ================= */
  F.s7_treehut = { w: 440, h: 600, tags: ['treehouse', 'tree', 'house'], slots: [[-240, 20], [240, 20]],
    draw(c, t, f) {
      const lit = on(f, 'lights', t);
      for (const [x, y, r, col] of [[-150, -470, 90, '#5fae58'], [150, -480, 96, '#6dbb5f'], [0, -540, 110, '#79c26a'], [-60, -400, 70, '#6dbb5f'], [90, -400, 70, '#5fae58']]) { G.circ(c, x, y, r); G.fillO(c, col, 3); }
      G.rr(c, -36, -380, 72, 380, 14); G.fillO(c, '#9a6b42', 3.5); for (const s of [-1, 1]) { G.poly(c, [s * 30, -40, s * 70, 0, s * 20, 0]); G.fillO(c, '#9a6b42', 2.5); }
      G.rr(c, -180, -330, 360, 22, 6); G.fillO(c, '#c99a64', 3);
      for (const x of [-160, 160]) { c.strokeStyle = '#8a5a3a'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, -308); c.lineTo(x * 0.3, -230); c.stroke(); }
      G.rr(c, -120, -470, 240, 140, 8); G.fillO(c, '#e8b07a', 3.5);
      c.strokeStyle = 'rgba(140,90,50,.5)'; c.lineWidth = 2; for (let y = -450; y < -330; y += 20) { c.beginPath(); c.moveTo(-118, y); c.lineTo(118, y); c.stroke(); }
      G.poly(c, [-140, -460, 0, -540, 140, -460]); G.fillO(c, '#e2655a', 3.5);
      const fw = Math.sin(t * (lit ? 0.02 : 0.005)) * 8; c.strokeStyle = '#6a4a3a'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -536); c.lineTo(0, -600); c.stroke(); G.poly(c, [0, -600, 46, -588 + fw, 0, -572]); G.fillO(c, '#ffd23f', 2.5);
      G.rr(c, -86, -440, 64, 56, 8); G.fillO(c, lit ? '#fff3a0' : '#7fd0ff', 3);
      if (lit) { const pk = Math.min(1, prog(f, 'lights', t, 3500) * 3) * 22; c.save(); G.rr(c, -86, -440, 64, 56, 8); c.clip(); G.circ(c, -54, -380 - pk, 18); G.fillO(c, '#d9944e', 2); for (const s of [-1, 1]) { G.poly(c, [-54 + s * 8, -394 - pk, -54 + s * 14, -410 - pk, -54 + s * 16, -392 - pk]); G.fillO(c, '#d9944e', 2); } eye(c, -60, -384 - pk, 2.6); eye(c, -48, -384 - pk, 2.6); c.restore(); }
      c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.beginPath(); c.moveTo(-54, -440); c.lineTo(-54, -384); c.moveTo(-86, -412); c.lineTo(-22, -412); c.stroke();
      G.rr(c, 20, -430, 60, 100, 10); G.fillO(c, '#a8733f', 3); dot(c, 68, -380, 4, '#ffd23f');
      c.strokeStyle = '#c9a26a'; c.lineWidth = 4; for (const x of [-170, -130]) { c.beginPath(); c.moveTo(x, -310); c.lineTo(x + Math.sin(t * 0.002) * 4, 0); c.stroke(); }
      for (let y = -290; y < 0; y += 34) { c.beginPath(); c.moveTo(-170, y); c.lineTo(-130, y); c.stroke(); }
      if (lit) { G.rr(c, -86, -440, 64, 56, 8); c.fillStyle = 'rgba(255,240,150,.25)'; c.fill(); }
    } };
  F.s7_rope = { w: 160, h: 560, tags: ['rope', 'climb'], slots: [[-110, 20], [110, 20]],
    draw(c, t, f) {
      const cl = on(f, 'climb', t), sw = Math.sin(t * (cl ? 0.01 : 0.002)) * (cl ? 12 : 4);
      G.rr(c, -90, -560, 180, 26, 12); G.fillO(c, '#9a6b42', 3); for (const [x, r] of [[-80, 30], [80, 34], [0, 26]]) { G.circ(c, x, -566, r); G.fillO(c, '#6dbb5f', 2.5); }
      c.strokeStyle = '#c9a26a'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -540); c.quadraticCurveTo(sw, -280, sw * 1.6, -30); c.stroke();
      c.strokeStyle = '#a8833a'; c.lineWidth = 2; for (let y = -500; y < -40; y += 24) { const x = sw * ((y + 540) / 510) * 1.2; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 4, y + 8); c.stroke(); }
      for (const y of [-420, -280, -140]) { const x = sw * ((y + 540) / 510) * 1.2; G.circ(c, x, y, 10); G.fillO(c, '#c9a26a', 2); }
      const ring = on(f, 'bell', t) ? Math.sin(t * 0.04) * 0.4 : 0; c.save(); c.translate(40, -534); c.rotate(ring); c.strokeStyle = '#8a5a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 14); c.stroke(); G.poly(c, [-12, 36, -8, 14, 8, 14, 12, 36]); G.fillO(c, '#ffd23f', 2.5); dot(c, 0, 38, 4, '#c99a22'); c.restore();
    } };
  F.s7_tire = { w: 260, h: 460, tags: ['swing', 'tire'], slots: [[-170, 20], [170, 20]],
    angAt: (f, t) => { const k = prog(f, 'swing', t, 3200); return k >= 0 ? Math.sin(k * PT.TAU * 2) * 0.55 * (1 - k * 0.5) : Math.sin(t * 0.0015) * 0.05; },
    draw(c, t, f) {
      G.rr(c, -130, -462, 260, 28, 12); G.fillO(c, '#9a6b42', 3); for (const [x, r] of [[-110, 36], [110, 40], [-20, 30], [50, 34]]) { G.circ(c, x, -470, r); G.fillO(c, '#79c26a', 2.5); }
      const a = this.angAt(f, t);
      c.save(); c.translate(0, -440); c.rotate(a);
      c.strokeStyle = '#c9a26a'; c.lineWidth = 5; c.beginPath(); c.moveTo(-6, 0); c.lineTo(-30, 300); c.moveTo(6, 0); c.lineTo(30, 300); c.stroke();
      G.ell(c, 0, 330, 70, 34); G.fillO(c, '#3a3550', 4); G.ell(c, 0, 330, 38, 16); c.fillStyle = '#7a8a5a'; c.fill(); c.strokeStyle = '#5a5470'; c.lineWidth = 3; c.stroke();
      c.restore();
    } };

  /* ================= 77 かざんの しま ================= */
  F.s7_kazan = { w: 560, h: 420, tags: ['volcano', 'mountain', 'cloud'], slots: [[-320, 20], [320, 20]],
    draw(c, t, f) {
      const k = prog(f, 'boom', t, 4200), sq = k >= 0 && k < 0.15 ? Math.sin(k / 0.15 * Math.PI) * 0.08 : 0;
      c.save(); c.scale(1 + sq, 1 - sq);
      G.poly(c, [-270, 0, -90, -330, 90, -330, 270, 0]); G.fillO(c, '#b08060', 4);
      c.fillStyle = '#7bc56a'; c.beginPath(); c.moveTo(-270, 0); c.quadraticCurveTo(-200, -90, -170, -70); c.quadraticCurveTo(-90, -130, 0, -80); c.quadraticCurveTo(100, -140, 170, -80); c.quadraticCurveTo(220, -70, 270, 0); c.closePath(); G._bb = null; c.fill();
      G.ell(c, 0, -330, 90, 16); G.fillO(c, '#ff9f7a', 3);
      const bo = k >= 0 && k < 0.6;
      if (bo) { eye(c, -50, -200, 10); eye(c, 50, -200, 10); G.ell(c, 0, -160, 18, 22); G.fillO(c, '#8a4a3a', 2.5); }
      else { shut(c, -50, -196, 12, 4); shut(c, 50, -196, 12, 4); smile(c, 0, -170, 20, 4); }
      cheek(c, -90, -170, 14); cheek(c, 90, -170, 14);
      c.restore();
      if (k >= 0) {
        for (let i = 0; i < 7; i++) { const q = Math.min(1, k * 1.6 - i * 0.07); if (q <= 0) continue; const x = Math.sin(i * 2.3) * (60 + q * 260), y = -350 - q * (70 + (i % 3) * 30), r = 20 + q * 30;
          c.globalAlpha = k > 0.8 ? (1 - k) * 5 : 1; for (const [ox, oy, rr] of [[-r * 0.6, 4, 0.7], [r * 0.6, 4, 0.7], [0, -r * 0.3, 1]]) { G.circ(c, x + ox, y + oy, r * rr); c.fillStyle = ['#ffd1e0', '#ffffff', '#e3d4ff', '#ffe0f0'][i % 4]; c.fill(); } c.globalAlpha = 1; }
      } else { for (let i = 0; i < 3; i++) { const q = (t * 0.0005 + i * 0.33) % 1; G.circ(c, Math.sin(t * 0.001 + i) * 20, -350 - q * 90, 10 + q * 14); c.fillStyle = `rgba(255,255,255,${0.7 * (1 - q)})`; c.fill(); } }
    } };
  F.s7_onsen = { w: 360, h: 200, tags: ['water', 'bath', 'warm'], slots: [[-230, 20], [230, 20]],
    draw(c, t, f) {
      const st = on(f, 'steam', t);
      G.ell(c, 0, -56, 170, 54); G.fillO(c, '#9aa3b8', 4); G.ell(c, 0, -56, 150, 40); c.fillStyle = '#9fe0e8'; c.fill();
      for (let i = 0; i < 12; i++) { const a = (i / 12) * PT.TAU; G.circ(c, Math.cos(a) * 160, -56 + Math.sin(a) * 50, 14 + (i % 3) * 4); G.fillO(c, ['#b9c0cc', '#a8b0be', '#c9ccd8'][i % 3], 2); }
      c.save(); G.ell(c, 0, -56, 150, 40); c.clip();
      G.circ(c, 70, -64, 34); G.fillO(c, '#c9945a', 3); G.ell(c, 70, -100, 26, 12); G.fillO(c, '#ffffff', 2.5); G.ell(c, 70, -54, 14, 10); c.fillStyle = '#a8733f'; c.fill();
      if (st) { shut(c, 58, -70, 5); shut(c, 82, -70, 5); } else { eye(c, 58, -70, 3.4); eye(c, 82, -70, 3.4); } cheek(c, 52, -58, 5); cheek(c, 88, -58, 5);
      c.restore();
      const dy = Math.sin(t * 0.004) * 3; G.ell(c, -60, -50 + dy, 18, 12); G.fillO(c, '#ffd23f', 2); G.circ(c, -48, -64 + dy, 10); G.fillO(c, '#ffd23f', 2); dot(c, -45, -66 + dy, 2); G.poly(c, [-40, -62 + dy, -32, -60 + dy, -40, -57 + dy]); c.fillStyle = '#ff9f3a'; c.fill();
      for (let i = 0; i < (st ? 6 : 3); i++) { const q = (t * (st ? 0.001 : 0.0005) + i / (st ? 6 : 3)) % 1, x = -100 + i * (st ? 40 : 80) + Math.sin(t * 0.003 + i) * 10; c.strokeStyle = `rgba(255,255,255,${0.8 * (1 - q)})`; c.lineWidth = 6; c.beginPath(); c.moveTo(x, -80 - q * 120); c.quadraticCurveTo(x + 14, -100 - q * 120, x, -120 - q * 120); c.stroke(); }
      if (st) { c.fillStyle = INK; c.font = `900 22px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('ほわ〜', 70, -140); }
    } };
  F.s7_turtle = { w: 280, h: 180, tags: ['turtle', 'animal', 'beach'], slots: [[-180, 20], [180, 20]],
    draw(c, t, f) {
      const k = prog(f, 'walk', t, 3200), dx = k >= 0 ? Math.sin(k * PT.TAU) * 120 : 0, walking = k >= 0 || on(f, 'ride', t);
      c.save(); c.translate(dx, 0); if (k >= 0 && Math.cos(k * PT.TAU) < 0) c.scale(-1, 1);
      const st = walking ? Math.sin(t * 0.015) * 8 : 0;
      for (const [x, s] of [[-50, 1], [50, -1]]) { G.ell(c, x + st * s, -16, 22, 12); G.fillO(c, '#8fd36a', 2.5); }
      G.ell(c, 110, -46, 26, 20); G.fillO(c, '#8fd36a', 3); eye(c, 118, -52, 4); smile(c, 120, -42, 6, 2); cheek(c, 128, -40, 5);
      G.ell(c, 0, -56, 96, 56); G.fillO(c, '#4f9a5a', 4);
      c.strokeStyle = '#3a7a44'; c.lineWidth = 3; G.poly(c, [-24, -90, 24, -90, 40, -60, 24, -32, -24, -32, -40, -60]); c.fillStyle = '#6fbf6a'; c.fill(); c.stroke();
      for (const x of [-70, 70]) { G.ell(c, x, -64, 18, 22); c.fillStyle = '#6fbf6a'; c.fill(); c.stroke(); }
      c.restore();
      if (k >= 0) for (let i = 0; i < 3; i++) { const bx = dx - 160 - i * 50 * (Math.cos(k * PT.TAU) < 0 ? -1 : 1) * 0 - i * 50, b = Math.abs(Math.sin(t * 0.02 + i)) * 6; G.ell(c, bx, -18 - b, 22, 14); G.fillO(c, '#6fbf6a', 2); G.circ(c, bx + 24, -20 - b, 9); G.fillO(c, '#8fd36a', 2); dot(c, bx + 27, -22 - b, 2); }
    } };

  /* ================= 78 キラキラ どうくつ ================= */
  const GEMC = ['#ff6f91', '#58b9f0', '#ffd23f', '#7bd36a', '#b39ae8', '#7fe0e0', '#ff9f3a'];
  F.s7_gems = { w: 440, h: 380, tags: ['gem', 'crystal', 'light'], slots: [[-270, 20], [270, 20]],
    draw(c, t, f) {
      G.blob(c, [-220, 0, -230, -200, -150, -340, 0, -380, 160, -330, 230, -190, 220, 0]); G.fillO(c, '#6a5a8a', 4);
      G.speckle && G.speckle(c, -200, -340, 400, 320, 'rgba(255,255,255,.12)', 30, 3);
      const k = prog(f, 'glow', t, 3500), lit = k >= 0 ? Math.floor(k * 14) % 7 : -1, all = on(f, 'shine', t);
      [[-130, -90, 1.1], [-60, -200, 1.3], [30, -120, 1.5], [110, -230, 1.1], [150, -90, 0.9], [-150, -250, 0.9], [-10, -300, 1]].forEach(([x, y, s], i) => {
        const col = GEMC[i], hi = all || lit === i || (k >= 0 && k > 0.85);
        if (hi) glow(c, x, y - 30 * s, 80 * s, '255,250,220', 0.8);
        c.save(); c.translate(x, y); c.rotate((i % 3 - 1) * 0.25); c.scale(s, s);
        G.poly(c, [-18, 30, -22, -20, 0, -50, 22, -20, 18, 30]); G.fillO(c, hi ? PT.shade(col, 0.35) : col, 3);
        c.fillStyle = 'rgba(255,255,255,.55)'; G.poly(c, [-10, 20, -12, -18, 0, -36, 0, 20]); c.fill();
        c.restore();
        const tw = Math.max(0, Math.sin(t * 0.004 + i * 1.7)); if (tw > 0.8 || hi) { c.fillStyle = '#ffffff'; G.star(c, x + 10 * s, y - 40 * s, 8 * (hi ? 1.6 : tw), 2.5, 4); c.fill(); }
      });
    } };
  F.s7_cart = { w: 440, h: 200, tags: ['cart', 'rail', 'vehicle'], slots: [[-260, 20], [260, 20]],
    draw(c, t, f) {
      c.strokeStyle = '#8a6a4a'; c.lineWidth = 8; for (let x = -200; x <= 200; x += 40) { c.beginPath(); c.moveTo(x, -4); c.lineTo(x + 6, -22); c.stroke(); }
      c.strokeStyle = '#9aa3b8'; c.lineWidth = 6; c.beginPath(); c.moveTo(-220, -8); c.lineTo(220, -8); c.moveTo(-220, -20); c.lineTo(220, -20); c.stroke();
      const k = prog(f, 'roll', t, 3000), dx = (f.dx || 0) + (k >= 0 ? Math.sin(k * PT.TAU) * 140 : 0), rot = dx * 0.05;
      c.save(); c.translate(dx, 0);
      for (const [x, col] of [[-30, '#ffd23f'], [0, '#58b9f0'], [30, '#ff6f91'], [-10, '#7bd36a']]) { G.poly(c, [x - 12, -110, x, -132, x + 12, -110]); G.fillO(c, col, 2); }
      G.poly(c, [-80, -116, 80, -116, 66, -36, -66, -36]); G.fillO(c, '#c9762e', 4);
      c.strokeStyle = '#8a4a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-74, -86); c.lineTo(74, -86); c.stroke(); for (const x of [-60, 0, 60]) dot(c, x, -100, 3, '#5a3a2a');
      for (const x of [-46, 46]) { c.save(); c.translate(x, -28); c.rotate(rot); G.circ(c, 0, 0, 20); G.fillO(c, '#5a5470', 3); c.strokeStyle = '#c9ccd8'; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.moveTo(0, -14); c.lineTo(0, 14); c.stroke(); c.restore(); }
      c.restore();
    } };
  F.s7_echo = { w: 320, h: 340, tags: ['cave', 'echo'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      G.blob(c, [-160, 0, -170, -200, -100, -320, 0, -340, 110, -310, 170, -190, 160, 0]); G.fillO(c, '#7a6a9a', 4);
      c.beginPath(); c.moveTo(-100, 0); c.lineTo(-100, -150); c.quadraticCurveTo(-100, -250, 0, -250); c.quadraticCurveTo(100, -250, 100, -150); c.lineTo(100, 0); c.closePath(); G._bb = null;
      c.fillStyle = G.rgrad(c, 0, -110, 10, 160, [[0, '#0a0818'], [1, '#3a2a5a']]); c.fill();
      for (let i = 0; i < 6; i++) { const x = -80 + i * 32; G.poly(c, [x - 10, -232 + Math.abs(x) * 0.1, x, -200 + (i % 2) * 14, x + 10, -232 + Math.abs(x) * 0.1]); G.fillO(c, '#9a8aba', 2); }
      const k = prog(f, 'echo', t, 3200);
      if (k >= 0) {
        const word = f.word || 'やっほー';
        for (let i = 0; i < 4; i++) { const q = k * 4 - i * 0.7; if (q < 0 || q > 1.6) continue; const a = Math.max(0, 1 - q / 1.6) * (1 - i * 0.18), s = 30 - i * 6;
          c.fillStyle = `rgba(255,240,160,${a})`; c.font = `900 ${s}px ${PT.FONT}`; c.textAlign = 'center'; c.fillText(word, Math.sin(i * 1.7) * 30, -140 + i * 10 - q * 30);
          c.strokeStyle = `rgba(255,240,160,${a * 0.6})`; c.lineWidth = 3; c.beginPath(); c.arc(0, -120, 20 + q * 70, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
      } else { for (let i = 0; i < 2; i++) { const b = Math.max(0, Math.sin(t * 0.002 + i * 3)); dot(c, -20 + i * 40, -130, 5 * b, `rgba(255,255,200,${b})`); } }
    } };

  /* ================= 79 みずうみの ボート ================= */
  F.s7_rowboat = { w: 320, h: 180, tags: ['boat', 'water'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      const k = prog(f, 'row', t, 4000), dx = (f.dx || 0) + (k >= 0 ? Math.sin(k * PT.TAU) * 260 : 0), mv = k >= 0 || on(f, 'ride', t);
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; for (let i = 0; i < 3; i++) { const q = (t * 0.0006 + i / 3) % 1; c.beginPath(); c.ellipse(dx, -20, 120 + q * 80, 16 + q * 10, 0, 0, PT.TAU); c.globalAlpha = 1 - q; c.stroke(); } c.globalAlpha = 1;
      c.save(); c.translate(dx, Math.sin(t * 0.003) * 3); c.rotate(Math.sin(t * 0.002) * 0.02);
      const oa = mv ? Math.sin(t * 0.012) * 0.6 : 0.2;
      for (const s of [-1, 1]) { c.save(); c.translate(s * 40, -60); c.rotate(s * (0.9 + oa)); c.strokeStyle = '#a8733f'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 90); c.stroke(); G.ell(c, 0, 96, 9, 20); G.fillO(c, '#c99a64', 2); c.restore(); }
      c.beginPath(); c.moveTo(-150, -70); c.lineTo(150, -70); c.quadraticCurveTo(130, -10, 80, -10); c.lineTo(-80, -10); c.quadraticCurveTo(-130, -10, -150, -70); c.closePath(); G._bb = { x0: -150, y0: -70, x1: 150, y1: -10 }; G.fillO(c, '#e2655a', 4);
      c.fillStyle = '#ffffff'; c.fillRect(-140, -58, 280, 8); G.rr(c, -150, -78, 300, 12, 6); G.fillO(c, '#f5d6a0', 2.5);
      c.restore();
    } };
  F.s7_swan = { w: 280, h: 260, tags: ['boat', 'swan', 'water'], slots: [[-190, 20], [190, 20]],
    draw(c, t, f) {
      const k = prog(f, 'spin', t, 2200), sx = k >= 0 ? Math.cos(k * PT.TAU * 2) : 1;
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; c.beginPath(); c.ellipse((f.dx || 0), -16 + (f.dy || 0), 140, 20, 0, 0, PT.TAU); c.stroke();
      c.save(); c.translate(f.dx || 0, (f.dy || 0) + Math.sin(t * 0.003) * 3); c.scale(sx === 0 ? 0.01 : sx, 1);
      G.blob(c, [-130, -40, -110, -110, -40, -90, 60, -80, 110, -60, 100, -14, -110, -14]); G.fillO(c, '#ffffff', 4);
      c.strokeStyle = '#d6dce8'; c.lineWidth = 3; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-70 + i * 30, -60, 22, 0.3, Math.PI - 0.3); c.stroke(); }
      c.strokeStyle = '#ffffff'; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(90, -60); c.quadraticCurveTo(140, -130, 90, -170); c.quadraticCurveTo(70, -200, 100, -214); c.stroke();
      c.strokeStyle = '#c9ccd8'; c.lineWidth = 3; c.beginPath(); c.moveTo(102, -60); c.quadraticCurveTo(156, -130, 104, -170); c.stroke();
      G.circ(c, 104, -214, 22); G.fillO(c, '#ffffff', 3); G.poly(c, [122, -220, 146, -210, 122, -202]); G.fillO(c, '#ff9f3a', 2); eye(c, 110, -218, 3.6); cheek(c, 104, -204, 5);
      c.restore();
      if (k >= 0) for (let i = 0; i < 4; i++) { const q = (k * 2 + i * 0.25) % 1; G.heart(c, (f.dx || 0) - 60 + i * 40, -240 - q * 60, 12); c.fillStyle = `rgba(255,111,145,${1 - q})`; c.fill(); }
    } };
  F.s7_ducks = { w: 320, h: 140, tags: ['duck', 'bird', 'water'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      const k = prog(f, 'parade', t, 4000), fd = on(f, 'feed', t), dir = k >= 0 && Math.cos(k * PT.TAU) < 0 ? -1 : 1;
      const dx = k >= 0 ? Math.sin(k * PT.TAU) * 220 : 0;
      if (fd) for (let i = 0; i < 6; i++) dot(c, -30 + (i * 23) % 70, -30 + (i * 7) % 14, 4, '#e8b878');
      [[0, 1], [-60, 0.55], [-100, 0.55], [-140, 0.55]].forEach(([x, s], i) => {
        const px = fd ? (i ? -20 + i * 26 : -70) : dx + x * dir, py = -20 + Math.sin(t * 0.005 + i) * 3;
        c.save(); c.translate(px, py); c.scale((fd ? (i % 2 ? -1 : 1) : dir) * s, s); const nod = fd ? Math.max(0, Math.sin(t * 0.02 + i)) * 0.5 : 0;
        G.ell(c, 0, -20, 36, 22); G.fillO(c, i ? '#ffe066' : '#c99a64', 3);
        c.save(); c.translate(24, -40); c.rotate(nod); G.circ(c, 0, -10, 18); G.fillO(c, i ? '#ffe066' : '#3f8a5c', 3); G.poly(c, [14, -12, 34, -8, 14, -2]); G.fillO(c, '#ff9f3a', 2); eye(c, 6, -14, 3); c.restore();
        c.restore();
      });
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.beginPath(); c.ellipse(dx * (fd ? 0 : 1) - 40, -12, 140, 14, 0, 0.1, Math.PI - 0.1); c.stroke();
    } };

  /* ================= 80 パンダの たけやぶ ================= */
  F.s7_pandaroll = { w: 320, h: 220, tags: ['panda', 'animal'], slots: [[-210, 20], [210, 20]],
    draw(c, t, f) {
      G.ell(c, 60, -10, 160, 40); c.fillStyle = '#8fcf6a'; c.fill();
      const k = prog(f, 'roll', t, 2600), d = on(f, 'dizzy', t);
      if (k >= 0) { const x = Math.sin(k * Math.PI) * 180, r = x / 60 * (Math.cos(k * Math.PI) >= 0 ? 1 : 1); c.save(); c.translate(x - 40, -80); c.rotate(r * 1.0); c.translate(0, 80); panda(c, 0, 0, 0.9, 0, { closed: true, mouth: 0 }); c.restore(); }
      else panda(c, -40, 0, 0.9, Math.sin(t * 0.003) * 0.08, { closed: d, up: d });
      if (d) for (let i = 0; i < 3; i++) { const a = t * 0.006 + i * 2.1; c.fillStyle = '#ffd23f'; G.star(c, -40 + Math.cos(a) * 40, -160 + Math.sin(a) * 10, 9, 4); c.fill(); }
    } };
  F.s7_takenoko = { w: 160, h: 520, tags: ['bamboo', 'plant', 'grow'], slots: [[-110, 20], [110, 20]],
    hAt: (f, t) => { const k = prog(f, 'grow', t, 4000); if (k < 0) return 70; if (k < 0.5) return 70 + PT.easeOut(k / 0.5) * 380; if (k < 0.85) return 450; return 450 - (k - 0.85) / 0.15 * 380; },
    draw(c, t, f) {
      G.ell(c, 0, -6, 60, 14); c.fillStyle = '#8a6a4a'; c.fill();
      const h = this.hAt(f, t);
      if (h <= 80) {
        G.poly(c, [-36, -4, 0, -h, 36, -4]); G.fillO(c, '#c9945a', 3);
        c.strokeStyle = '#8a5a3a'; c.lineWidth = 2.5; for (let i = 1; i < 4; i++) { const y = -4 - i * (h / 4), w = 36 * (1 - i / 4); c.beginPath(); c.moveTo(-w, y); c.quadraticCurveTo(0, y + 10, w, y); c.stroke(); }
        eye(c, -10, -26, 3.2); eye(c, 10, -26, 3.2); smile(c, 0, -20, 5, 2); cheek(c, -18, -18, 4); cheek(c, 18, -18, 4);
      } else {
        G.rr(c, -14, -h, 28, h, 10); G.fillO(c, '#7bc56a', 3);
        c.strokeStyle = '#4f9a4a'; c.lineWidth = 3; for (let y = -60; y > -h + 20; y -= 70) { c.beginPath(); c.moveTo(-14, y); c.lineTo(14, y); c.stroke(); }
        for (let i = 0; i < 4; i++) { const y = -h + 30 + i * 50; if (y > -60) break; const s = i % 2 ? 1 : -1; c.save(); c.translate(s * 12, y); c.rotate(s * 0.5 + Math.sin(t * 0.004 + i) * 0.1); G.ell(c, s * 30, 0, 32, 9); G.fillO(c, '#6fae4a', 2); c.restore(); }
        eye(c, -6, -h + 30, 2.6); eye(c, 6, -h + 30, 2.6); smile(c, 0, -h + 36, 4, 2);
      }
    } };
  F.s7_pandaeat = { w: 340, h: 220, tags: ['panda', 'bamboo', 'animal'], slots: [[-220, 20], [220, 20]],
    draw(c, t, f) {
      const m = on(f, 'munch', t), hg = on(f, 'hug', t), sp = m ? 0.02 : 0.006, mo = Math.max(0, Math.sin(t * sp));
      for (const [x, s] of [[-70, 1], [80, 0.65]]) {
        panda(c, x, 0, s, Math.sin(t * 0.002 + x) * 0.05, { eat: !hg, mouth: hg ? 0 : mo, closed: hg, up: hg });
        if (!hg) { c.save(); c.translate(x - 30 * s, -100 * s); c.rotate(-0.5 - mo * 0.2); c.strokeStyle = '#7bc56a'; c.lineWidth = 8 * s; c.beginPath(); c.moveTo(0, 30 * s); c.lineTo(0, -70 * s); c.stroke(); leaf(c, 10 * s, -70 * s, 18 * s, -0.6, '#6fae4a'); leaf(c, -10 * s, -60 * s, 16 * s, 0.6, '#86c05a'); c.restore(); }
      }
      if (m) for (let i = 0; i < 3; i++) { const q = (t * 0.002 + i * 0.33) % 1; leaf(c, -60 + i * 20, -110 + q * 60, 5, q * 6, '#86c05a'); }
      if (hg) for (let i = 0; i < 3; i++) { const q = (t * 0.001 + i * 0.33) % 1; G.heart(c, -60 + i * 60, -230 - q * 50, 14); c.fillStyle = `rgba(255,93,120,${1 - q})`; c.fill(); }
    } };

  /* ================= 81 さくらの おはなみ ================= */
  F.s7_sakura = { w: 560, h: 540, tags: ['tree', 'sakura', 'flower'], slots: [[-300, 20], [300, 20]],
    draw(c, t, f) {
      const fb = on(f, 'fubuki', t), sh = fb ? Math.sin(t * 0.03) * 6 : 0;
      c.fillStyle = '#8a5a4a'; c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(-20, -180, -60, -300); c.lineTo(-30, -310); c.quadraticCurveTo(10, -200, 20, -320); c.lineTo(50, -310); c.quadraticCurveTo(30, -150, 50, 0); c.closePath(); G._bb = { x0: -60, y0: -320, x1: 50, y1: 0 }; G.fillO(c, '#8a5a4a', 3.5);
      c.save(); c.translate(sh, 0);
      for (const [x, y, r] of [[-180, -330, 100], [170, -340, 110], [0, -420, 130], [-90, -280, 90], [100, -270, 90], [-200, -420, 70], [200, -440, 70]]) { G.circ(c, x, y, r); G.fillO(c, '#ffc2d6', 3); }
      for (let i = 0; i < 26; i++) { const a = i * 2.4, r = 40 + (i * 37) % 200; c.fillStyle = i % 3 ? '#ffffff' : '#ff8fb1'; G.star(c, Math.cos(a) * r, -360 + Math.sin(a) * r * 0.5, 9, 5, 5, a); c.fill(); }
      c.restore();
      const n = fb ? 40 : 8;
      for (let i = 0; i < n; i++) { const sp = fb ? 0.12 : 0.03, y = -440 + ((t * sp + i * 97) % 480), x = ((i * 131) % 560) - 280 + Math.sin(t * 0.003 + i) * 30 + (fb ? (y + 440) * 0.4 : 0); petal(c, x, y, 7, t * 0.004 + i, i % 4 ? '#ffb7cf' : '#ffffff'); }
    } };
  F.s7_picnic = { w: 380, h: 160, tags: ['picnic', 'food', 'sheet'], slots: [[-230, 20], [230, 20]],
    draw(c, t, f) {
      G.poly(c, [-180, -10, -140, -100, 180, -100, 190, -10]); G.fillO(c, '#58b9f0', 3);
      c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 6; i++) c.fillRect(-170 + i * 60 + 10, -96, 22, 82);
      const o = arc(f, 'open', t, 3000) > 0 || on(f, 'eat', t), up = on(f, 'open', t) ? Math.min(1, prog(f, 'open', t, 3000) * 4) * 70 : 0;
      G.rr(c, -60, -100, 120, 60, 6); G.fillO(c, '#c0304a', 3); G.rr(c, -54, -94, 108, 48, 4); c.fillStyle = '#3a2a2a'; c.fill();
      if (o) { for (const [x, y, col] of [[-36, -74, '#ffffff'], [-10, -74, '#ffe066'], [16, -76, '#ff6f61'], [36, -70, '#7bd36a']]) { G.circ(c, x, y, 11); G.fillO(c, col, 2); }
        G.poly(c, [-40, -82, -30, -64, -50, -64]); c.fillStyle = '#2a3a2a'; c.fill(); }
      c.save(); c.translate(0, -up); G.rr(c, -64, -114, 128, 20, 6); G.fillO(c, '#e2433b', 3); c.fillStyle = '#ffd23f'; c.fillRect(-4, -114, 8, 20); c.restore();
      c.save(); c.translate(110, -60); c.rotate(-0.3); c.strokeStyle = '#c99a64'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 20); c.lineTo(0, -70); c.stroke(); for (const [y, col] of [[-12, '#7bd36a'], [-34, '#ffffff'], [-56, '#ff8fb1']]) { G.circ(c, 0, y, 12); G.fillO(c, col, 2.5); } c.restore();
      G.rr(c, -150, -70, 40, 46, 8); G.fillO(c, '#ffffff', 2.5); c.fillStyle = '#7bd36a'; c.fillRect(-146, -52, 32, 22);
    } };
  F.s7_uguisu = { w: 200, h: 320, tags: ['bird', 'music', 'spring'], slots: [[-130, 20], [130, 20]],
    draw(c, t, f) {
      G.rr(c, -10, -230, 20, 230, 6); G.fillO(c, '#9a6b42', 2.5);
      c.strokeStyle = '#8a5a4a'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, -200); c.quadraticCurveTo(60, -230, 90, -280); c.moveTo(0, -150); c.quadraticCurveTo(-50, -170, -80, -220); c.stroke();
      for (const [x, y] of [[90, -284], [70, -258], [-80, -224], [-56, -196], [30, -226]]) { for (let k = 0; k < 5; k++) { const a = k / 5 * PT.TAU; G.circ(c, x + Math.cos(a) * 7, y + Math.sin(a) * 7, 6); c.fillStyle = '#ffc2d6'; c.fill(); } dot(c, x, y, 3, '#ff6f91'); }
      const s = on(f, 'sing', t), tilt = s ? -0.35 + Math.sin(t * 0.02) * 0.08 : Math.sin(t * 0.003) * 0.05;
      c.save(); c.translate(0, -238); c.rotate(tilt);
      G.poly(c, [-30, -10, -56, -4, -34, 6]); G.fillO(c, '#8a9a3a', 2);
      G.ell(c, 0, -14, 30, 22); G.fillO(c, '#a8b84a', 3); G.ell(c, 6, -8, 18, 12); c.fillStyle = '#e8ecb0'; c.fill();
      G.circ(c, 20, -34, 16); G.fillO(c, '#a8b84a', 3); eye(c, 24, -38, 3.2); cheek(c, 22, -28, 4);
      if (s) { G.poly(c, [34, -40, 48, -38, 34, -34]); c.fillStyle = '#5a4a3a'; c.fill(); G.poly(c, [34, -34, 46, -30, 34, -30]); c.fill(); } else { G.poly(c, [34, -38, 46, -34, 34, -32]); c.fillStyle = '#5a4a3a'; c.fill(); }
      c.restore();
      if (s) { for (let i = 0; i < 3; i++) { const q = (t * 0.0012 + i * 0.33) % 1; G.note(c, 50 + q * 60, -290 - q * 70, 18, ['#7bd36a', '#ff6f91', '#58b9f0'][i]); } c.fillStyle = '#3f8a4a'; c.font = `900 22px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('ホーホケキョ', 20, -330); }
    } };

  /* ================= 82 もみじの やま ================= */
  const pileLeaves = []; for (let i = 0; i < 46; i++) { const a = (i * 2.39) % PT.TAU, r = ((i * 53) % 100) / 100; pileLeaves.push([Math.cos(a) * r * 130, -10 - (1 - r) * 70 - Math.abs(Math.sin(a)) * r * 20, AUTUMN[i % 5], i * 0.7]); }
  F.s7_leafpile = { w: 320, h: 160, tags: ['leaf', 'autumn'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      const k = prog(f, 'puff', t, 2200), sq = k >= 0 && k < 0.2 ? Math.sin(k / 0.2 * Math.PI) * 0.25 : 0;
      G.ell(c, 0, -20, 150, 30); c.fillStyle = '#c9762e'; c.fill();
      c.save(); c.scale(1 + sq * 0.5, 1 - sq);
      G.blob(c, [-150, -10, -110, -70, -30, -96, 40, -94, 110, -66, 150, -10]); G.fillO(c, '#f57c2a', 3);
      for (const [x, y, col, r] of pileLeaves) leaf(c, x, y, 12, r, col);
      c.restore();
      if (k >= 0) for (let i = 0; i < 22; i++) { const a = -Math.PI / 2 + ((i * 0.37) % 1.8) - 0.9, sp = 260 + (i % 5) * 50, x = Math.cos(a) * sp * k + Math.sin(t * 0.006 + i) * 10, y = -60 + Math.sin(a) * sp * k + 420 * k * k; leaf(c, x, y, 12, t * 0.01 + i, AUTUMN[i % 5]); }
    } };
  F.s7_donguri = { w: 380, h: 500, tags: ['tree', 'acorn', 'squirrel'], slots: [[-220, 20], [220, 20]],
    draw(c, t, f) {
      const k = prog(f, 'shake', t, 2400), wob = k >= 0 ? Math.sin(t * 0.04) * 0.04 * (1 - k) : 0;
      G.rr(c, -30, -300, 60, 300, 12); G.fillO(c, '#8a5a3a', 3.5);
      c.save(); c.translate(0, -300); c.rotate(wob);
      for (const [x, y, r, col] of [[-110, -60, 90, '#c9a23a'], [110, -70, 90, '#d9913a'], [0, -140, 110, '#e8b84a'], [-40, -40, 70, '#d9a23a'], [60, -30, 70, '#c9762e']]) { G.circ(c, x, y, r); G.fillO(c, col, 3); }
      for (const [x, y] of [[-120, -40], [-40, -120], [50, -80], [120, -40], [20, -180], [-90, -130]]) { G.ell(c, x, y + 6, 9, 11); G.fillO(c, '#a8733f', 2); G.ell(c, x, y - 4, 10, 5); G.fillO(c, '#6a4a2a', 2); }
      c.restore();
      const sy = k >= 0 ? -40 - Math.sin(k * Math.PI) * 220 : -40, sx = 30;
      c.save(); c.translate(sx, sy); c.rotate(k >= 0 ? -1.4 : 0);
      c.beginPath(); c.moveTo(-14, -6); c.quadraticCurveTo(-46, -30, -30, -58); c.quadraticCurveTo(-12, -40, -8, -12); G._bb = null; c.fillStyle = '#c9813e'; c.fill(); c.strokeStyle = PT.line('#c9813e'); c.lineWidth = 2; c.stroke();
      G.ell(c, 0, -14, 16, 13); G.fillO(c, '#d9944e', 2.5); G.circ(c, 12, -30, 11); G.fillO(c, '#d9944e', 2.5); G.poly(c, [6, -40, 10, -50, 14, -40]); G.fillO(c, '#d9944e', 2); eye(c, 16, -32, 2.4);
      c.restore();
    } };
  F.s7_kakashi = { w: 200, h: 340, tags: ['scarecrow', 'autumn', 'dance'], slots: [[-130, 20], [130, 20]],
    draw(c, t, f) {
      const d = on(f, 'dance', t), sw = d ? Math.sin(t * 0.012) * 0.2 : Math.sin(t * 0.002) * 0.03;
      c.save(); c.rotate(sw);
      G.rr(c, -6, -260, 12, 260, 4); G.fillO(c, '#9a6b42', 2.5);
      const ar = d ? Math.sin(t * 0.02) * 0.4 : 0;
      for (const s of [-1, 1]) { c.save(); c.translate(0, -200); c.rotate(s * ar); G.rr(c, s > 0 ? 0 : -90, -8, 90, 16, 6); G.fillO(c, '#58b9f0', 2.5); c.fillStyle = '#ffd23f'; for (let i = 0; i < 3; i++) { G.poly(c, [s * 90, -6 + i * 6, s * 104, -8 + i * 8, s * 90, 2 + i * 4]); c.fill(); } c.restore(); }
      G.poly(c, [-40, -220, 40, -220, 46, -130, -46, -130]); G.fillO(c, '#58b9f0', 3); G.rr(c, -14, -200, 28, 28, 4); G.fillO(c, '#ff8a65', 2);
      G.circ(c, 0, -254, 34); G.fillO(c, '#fff0d0', 3); eye(c, -12, -258, 4); eye(c, 12, -258, 4); smile(c, 0, -248, 10, 2.5); cheek(c, -20, -244, 6); cheek(c, 20, -244, 6);
      G.ell(c, 0, -282, 64, 12); G.fillO(c, '#f5d06a', 3); G.ell(c, 0, -296, 34, 22); G.fillO(c, '#f5d06a', 3); c.fillStyle = '#e2433b'; c.fillRect(-34, -290, 68, 7);
      c.restore();
      if (d) for (let i = 0; i < 2; i++) { const q = (t * 0.0008 + i * 0.5) % 1; c.save(); c.translate(-80 + i * 160 + q * 60 * (i ? 1 : -1), -300 - q * 120); c.scale(0.8, 0.8); G.ell(c, 0, 0, 14, 10); G.fillO(c, '#c9945a', 2); c.save(); c.rotate(-0.4 + Math.sin(t * 0.04) * 0.6); G.ell(c, -4, -6, 10, 5); G.fillO(c, '#a8733f', 2); c.restore(); dot(c, 8, -3, 2); c.restore(); }
      if (d) for (let i = 0; i < 2; i++) { const q = (t * 0.001 + i * 0.5) % 1; G.note(c, 60, -200 - q * 80, 16, ['#e2433b', '#ff9f3a'][i]); }
    } };

  /* ================= 83 ほたるの よる ================= */
  const heartPt = (i, n) => { const a = (i / n) * PT.TAU; return [16 * Math.pow(Math.sin(a), 3) * 6, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 6]; };
  const ffly = (c, x, y, a) => { glow(c, x, y, 18, '230,255,140', a * 0.6); G.circ(c, x, y, 4); c.fillStyle = `rgba(250,255,190,${0.5 + a * 0.5})`; c.fill(); };
  F.s7_hotarubush = { w: 400, h: 260, tags: ['firefly', 'grass', 'night'], slots: [[-240, 20], [240, 20]],
    draw(c, t, f) {
      for (let i = 0; i < 18; i++) { const x = -180 + i * 21, h = 90 + (i * 37) % 70, sw = Math.sin(t * 0.002 + i) * 8; c.strokeStyle = i % 2 ? '#2f6a4a' : '#3f8a5c'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + sw * 0.5, -h * 0.5, x + sw, -h); c.stroke(); }
      const k = prog(f, 'gather', t, 4000), g = k < 0 ? 0 : k < 0.3 ? PT.easeOut(k / 0.3) : k < 0.8 ? 1 : 1 - (k - 0.8) / 0.2;
      const n = 14;
      for (let i = 0; i < n; i++) { const wx = Math.sin(t * 0.0007 + i * 1.9) * 170, wy = -100 - Math.abs(Math.cos(t * 0.0009 + i * 1.3)) * 120; const [hx, hy] = heartPt(i, n); const x = PT.lerp(wx, hx, g), y = PT.lerp(wy, hy - 260, g); ffly(c, x, y, 0.5 + Math.sin(t * 0.006 + i) * 0.5); }
      if (g > 0.9) { c.strokeStyle = 'rgba(240,255,160,.25)'; c.lineWidth = 3; G.heart(c, 0, -230, 90); c.stroke(); }
    } };
  F.s7_frogs = { w: 320, h: 160, tags: ['frog', 'pond', 'music'], slots: [[-210, 20], [210, 20]],
    draw(c, t, f) {
      G.ell(c, 0, -30, 160, 34); G.fillO(c, '#2a5a7a', 3); c.fillStyle = 'rgba(255,255,220,.25)'; G.ell(c, 60, -34, 30, 6); c.fill();
      const s = on(f, 'sing', t);
      [[-90, 1], [0, 1.2], [90, 0.9]].forEach(([x, sc], i) => {
        c.save(); c.translate(x, -30); c.scale(sc, sc);
        G.ell(c, 0, 0, 40, 12); c.fillStyle = '#4f9a5a'; c.fill();
        const b = s ? Math.max(0, Math.sin(t * 0.012 + i * 2)) : 0;
        G.ell(c, 0, -20, 24, 18); G.fillO(c, '#7bd36a', 2.5);
        if (b > 0.1) { G.circ(c, 0, -10, 8 + b * 10); c.fillStyle = 'rgba(255,240,200,.9)'; c.fill(); }
        for (const sx of [-1, 1]) { G.circ(c, sx * 10, -36, 8); G.fillO(c, '#7bd36a', 2); eye(c, sx * 10, -37, 3.6); }
        smile(c, 0, -22, 8, 2); c.restore();
        if (b > 0.5) G.note(c, x + 20, -110 - b * 30, 16, ['#ffd23f', '#9fd8ff', '#ff8fb1'][i]);
      });
    } };
  F.s7_jar = { w: 160, h: 220, tags: ['firefly', 'jar', 'light'], slots: [[-110, 20], [110, 20]],
    draw(c, t, f) {
      const k = prog(f, 'open', t, 4000), lit = on(f, 'lit', t);
      glow(c, 0, -80, lit ? 140 : 80, '230,255,140', lit ? 0.5 : 0.25);
      G.rr(c, -54, -150, 108, 150, 26); c.fillStyle = 'rgba(200,240,255,.25)'; c.fill(); c.strokeStyle = 'rgba(220,240,255,.8)'; c.lineWidth = 3; c.stroke();
      const out = k >= 0 ? (k < 0.4 ? k / 0.4 : k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3) : 0;
      for (let i = 0; i < 6; i++) { const ix = Math.sin(t * 0.002 + i * 1.7) * 30, iy = -60 - Math.abs(Math.cos(t * 0.0017 + i)) * 60; const a = t * 0.003 + i * 1.05, ox = Math.cos(a) * (60 + i * 18), oy = -220 - i * 22 + Math.sin(a) * 30; ffly(c, PT.lerp(ix, ox, out), PT.lerp(iy, oy, out), 0.5 + Math.sin(t * 0.008 + i) * 0.5); }
      c.fillStyle = 'rgba(255,255,255,.4)'; G.rr(c, -40, -130, 10, 90, 5); c.fill();
      c.save(); if (k >= 0 && out > 0) { c.translate(70, -150 + 40); c.rotate(1.2 * Math.min(1, out * 3)); c.translate(-70, 150 - 40); }
      G.rr(c, -60, -170, 120, 24, 8); G.fillO(c, '#c9945a', 3); c.restore();
      c.strokeStyle = '#e2433b'; c.lineWidth = 3; c.beginPath(); c.moveTo(-54, -146); c.quadraticCurveTo(0, -136, 54, -146); c.stroke();
    } };

  /* ================= 84 たなばた ================= */
  const TANZ = ['#ff6f91', '#58b9f0', '#ffd23f', '#7bd36a', '#b39ae8', '#ff9f3a', '#ffffff', '#7fe0e0'];
  F.s7_sasa = { w: 340, h: 580, tags: ['bamboo', 'tanabata', 'wish'], slots: [[-200, 20], [200, 20]],
    draw(c, t, f) {
      const w = on(f, 'wish', t), sw = Math.sin(t * (w ? 0.01 : 0.002)) * (w ? 10 : 4);
      G.ell(c, 0, -6, 40, 10); c.fillStyle = '#5a4a3a'; c.fill();
      c.strokeStyle = '#6fae4a'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(10, -300, 30 + sw, -560); c.stroke();
      c.strokeStyle = '#4f8a3a'; c.lineWidth = 3; for (let y = -80; y > -540; y -= 90) { const x = (y / -560) * (30 + sw) * 0.9; c.beginPath(); c.moveTo(x - 9, y); c.lineTo(x + 9, y); c.stroke(); }
      const br = [[-1, -200], [1, -260], [-1, -340], [1, -410], [-1, -480]];
      br.forEach(([s, y], i) => { const x0 = (y / -560) * (30 + sw); c.strokeStyle = '#6fae4a'; c.lineWidth = 5; c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo(x0 + s * 70, y - 20, x0 + s * 140 + sw, y + 10); c.stroke(); for (let j = 0; j < 4; j++) { c.save(); c.translate(x0 + s * (30 + j * 30) + sw * 0.5, y - 10 + j * 3); c.rotate(s * (0.4 + j * 0.15) + Math.sin(t * 0.003 + j) * 0.1); G.ell(c, s * 18, 0, 22, 6); G.fillO(c, '#86c05a', 1.5); c.restore(); } });
      const n = Math.min(10, 5 + (f.n || 0));
      for (let i = 0; i < n; i++) { const [s, y] = br[i % 5], x0 = (y / -560) * (30 + sw) + s * (50 + Math.floor(i / 5) * 50) + sw * 0.7, a = Math.sin(t * (w ? 0.012 : 0.003) + i) * (w ? 0.35 : 0.12);
        c.save(); c.translate(x0, y + 4); c.rotate(a); c.strokeStyle = '#ffffff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 12); c.stroke(); G.rr(c, -9, 12, 18, 54, 3); G.fillO(c, TANZ[i % TANZ.length], 2); c.strokeStyle = 'rgba(60,40,80,.4)'; c.lineWidth = 1.5; for (let l = 0; l < 3; l++) { c.beginPath(); c.moveTo(-1, 22 + l * 13); c.lineTo(3, 30 + l * 13); c.stroke(); } c.restore(); }
      for (const [x, y, col] of [[-90, -150, '#ff6f91'], [110, -310, '#ffd23f']]) { c.save(); c.translate(x + sw * 0.5, y); c.strokeStyle = col; c.lineWidth = 3; for (let j = 0; j < 7; j++) { c.beginPath(); c.moveTo(-14 + j * 4.6, 18); c.lineTo(-16 + j * 5 + Math.sin(t * 0.004 + j) * 2, 70); c.stroke(); } G.circ(c, 0, 8, 16); G.fillO(c, col, 2.5); c.restore(); }
      const k = prog(f, 'wish', t, 2800);
      if (k >= 0) { const sx = -500 + k * 1000, sy = -600 + k * 160; c.strokeStyle = 'rgba(255,246,184,.7)'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx - 160, sy - 42); c.lineTo(sx, sy); c.stroke(); G.star(c, sx, sy, 22, 9); c.fillStyle = '#fff6b8'; c.fill(); for (let i = 1; i < 5; i++) { G.circ(c, sx - i * 36, sy - i * 9 + Math.sin(t * 0.02 + i) * 6, 4); c.fill(); } }
    } };
  F.s7_amanogawa = { w: 1000, h: 300, sky: true, tags: ['star', 'sky', 'tanabata'], slots: [],
    draw(c, t, f) {
      const k = prog(f, 'meet', t, 5000), m = k < 0 ? 0 : k < 0.3 ? k / 0.3 : k < 0.8 ? 1 : 1 - (k - 0.8) / 0.2;
      c.fillStyle = 'rgba(200,210,255,.12)'; c.beginPath(); c.moveTo(-60, 0); c.quadraticCurveTo(-20, -150, 40, -300); c.lineTo(120, -300); c.quadraticCurveTo(60, -150, 80, 0); c.closePath(); c.fill();
      for (let i = 0; i < 50; i++) { const y = -((i * 37) % 300), x = -40 + (y / -300) * 100 + ((i * 53) % 90) - 20, a = 0.4 + Math.sin(t * 0.003 + i) * 0.3; c.fillStyle = `rgba(255,255,240,${a})`; G.circ(c, x, y, 1.5 + (i % 3)); c.fill(); }
      const ox = PT.lerp(-380, -90, m), hx = PT.lerp(480, 190, m), sy = -140;
      for (const [x, col, rgb] of [[ox, '#ffb3d0', '255,180,210'], [hx, '#9fd8ff', '160,216,255']]) { glow(c, x, sy, 40 + m * 20, rgb, 0.6); G.star(c, x, sy, 18 + m * 6, 8); G.fillO(c, col, 2); }
      if (m > 0.6) { for (let i = 0; i < 7; i++) { const x = PT.lerp(ox + 30, hx - 30, i / 6), y = sy - Math.sin((i / 6) * Math.PI) * 60 + Math.sin(t * 0.02 + i) * 3; c.save(); c.translate(x, y); G.ell(c, 0, 0, 12, 7); G.fillO(c, '#3a4a6a', 1.5); c.fillStyle = '#ffffff'; G.ell(c, 2, 2, 6, 3); c.fill(); c.rotate(Math.sin(t * 0.03 + i) * 0.5); G.ell(c, -2, -6, 10, 4); c.fillStyle = '#2a3a5a'; c.fill(); c.restore(); }
        G.heart(c, (ox + hx) / 2, sy - 90, 22 * (m - 0.6) / 0.4); c.fillStyle = '#ff8fb1'; c.fill(); }
    } };
  F.s7_telescope = { w: 220, h: 300, tags: ['telescope', 'star', 'night'], slots: [[-140, 20], [140, 20]],
    draw(c, t, f) {
      const lk = on(f, 'look', t), a = -0.7 + (lk ? Math.sin(t * 0.002) * 0.1 : 0);
      c.strokeStyle = '#6a5a7a'; c.lineWidth = 6; c.lineCap = 'round'; for (const x of [-60, 0, 60]) { c.beginPath(); c.moveTo(0, -140); c.lineTo(x, 0); c.stroke(); }
      c.save(); c.translate(0, -150); c.rotate(a);
      G.rr(c, -70, -20, 170, 40, 14); G.fillO(c, '#4f6ad8', 3.5); G.rr(c, 90, -26, 30, 52, 8); G.fillO(c, '#ffd23f', 3); G.rr(c, -90, -14, 24, 28, 6); G.fillO(c, '#ffd23f', 2.5);
      for (let i = 0; i < 3; i++) { c.fillStyle = '#ffffff'; G.star(c, -30 + i * 40, 0, 6, 2.5); c.fill(); }
      if (lk) { c.fillStyle = 'rgba(255,250,200,.18)'; c.beginPath(); c.moveTo(120, -20); c.lineTo(520, -160); c.lineTo(520, 160); c.lineTo(120, 20); c.closePath(); c.fill(); }
      c.restore();
      if (lk) { const b = 1 + Math.sin(t * 0.01) * 0.2; c.fillStyle = '#fff6b8'; G.star(c, 230, -400, 30 * b, 12 * b); c.fill(); c.fillStyle = '#ffffff'; G.star(c, 230, -400, 12 * b, 5 * b); c.fill(); }
    } };

  /* ================= ステージ ================= */
  const S = (o) => PT.STAGES.push(o);
  const stars = (c, r, n, y1) => B.stars(c, r, n, y1);
  const hills = (c, y, col, amp = 40, seed = 0) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, H); c.lineTo(0, y); for (let x = 0; x <= W; x += 200) c.quadraticCurveTo(x + 100, y - amp - Math.sin(x * 0.01 + seed) * amp, x + 200, y); c.lineTo(W, H); c.closePath(); c.fill(); };
  const sakuraTree = (c, x, y, s) => { c.fillStyle = '#8a5a4a'; c.fillRect(x - 10 * s, y - 120 * s, 20 * s, 120 * s); for (const [dx, dy, r] of [[-50, -150, 60], [50, -150, 60], [0, -190, 70], [-20, -120, 50], [30, -110, 50]]) { G.circ(c, x + dx * s, y + dy * s, r * s); c.fillStyle = '#ffc9dc'; c.fill(); } };
  const momijiTree = (c, x, y, s, col) => { c.fillStyle = '#7a4a3a'; c.fillRect(x - 9 * s, y - 110 * s, 18 * s, 110 * s); for (const [dx, dy, r] of [[-45, -140, 55], [45, -140, 55], [0, -180, 65], [0, -120, 50]]) { G.circ(c, x + dx * s, y + dy * s, r * s); c.fillStyle = col; c.fill(); } };

  S({ id: 'deepsea', num: 73, name: 'しんかい たんけん', bgm: 'night', floor: [600, 880], color: '#1565c0',
    tools: ['flashlight', 'camera', 'shell', 'chest', 'magnifier', 'swimring', 'duck', 'star', 'bubbles'], rides: ['boat', 'swimring'],
    spawn: [['penta', 600, 780], ['lulu', 820, 760], ['gaku', 1020, 800], ['nyan', 420, 800], ['yume', 1240, 800]],
    fixtures: [['s7_sub', 800, 660], ['s7_angler', 260, 720], ['s7_octo', 1340, 720]], favs: ['flashlight', 'camera', 'shell', 'chest'],
    ambient: (c, t) => { for (let i = 0; i < 16; i++) { const x = (i * 113) % W + Math.sin(t * 0.001 + i) * 14, y = H - ((t * 0.04 + i * 71) % (H + 40)); G.circ(c, x, y, 4 + (i % 3) * 3); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2; c.stroke(); } },
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 620, [[0, '#2a7ac8'], [0.5, '#16488a'], [1, '#0c2a5a']]); c.fillRect(0, 0, W, 620);
      for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(200,240,255,.07)'; c.beginPath(); const x = 100 + i * 280; c.moveTo(x, 0); c.lineTo(x + 80, 0); c.lineTo(x + 260, 620); c.lineTo(x + 120, 620); c.closePath(); c.fill(); }
      for (let i = 0; i < 6; i++) { const x = r() * W, y = 150 + r() * 300; c.save(); c.translate(x, y); c.scale(r() < 0.5 ? -1 : 1, 1); c.fillStyle = 'rgba(120,200,255,.3)'; G.ell(c, 0, 0, 22, 10); c.fill(); G.poly(c, [-20, 0, -34, -9, -34, 9]); c.fill(); c.restore(); }
      for (const [x, s] of [[200, 1], [520, 0.7], [1100, 0.9], [1450, 1.2]]) { G.blob(c, [x - 120 * s, 600, x - 80 * s, 520, x, 480 - 40 * s, x + 90 * s, 530, x + 130 * s, 600]); c.fillStyle = '#1a3a6a'; c.fill(); }
      c.fillStyle = G.grad(c, 0, 590, 0, H, [[0, '#d8c79a'], [1, '#b8a47a']]); c.fillRect(0, 590, W, H - 590);
      c.fillStyle = 'rgba(255,255,255,.15)'; for (let i = 0; i < 40; i++) { G.circ(c, r() * W, 620 + r() * 260, 2 + r() * 3); c.fill(); }
      for (let i = 0; i < 10; i++) { const x = 40 + i * 170 + r() * 40, h = 80 + r() * 120; c.strokeStyle = i % 2 ? '#3fae7a' : '#5fc08a'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, 610); c.quadraticCurveTo(x - 30, 610 - h * 0.5, x + 10, 610 - h); c.stroke(); }
      for (let i = 0; i < 6; i++) { const x = r() * W, y = 640 + r() * 220; c.fillStyle = ['#ff8fa3', '#ffd23f', '#ffb3c8'][i % 3]; G.star(c, x, y, 14, 6); c.fill(); }
    } });
  S({ id: 'southpole', num: 74, name: 'なんきょく', bgm: 'title', floor: [590, 880], color: '#4fc3f7',
    tools: ['snow', 'snowman', 'penguin', 'fishingrod', 'blanket', 'camera', 'juice', 'bucket'], rides: ['tricycle', 'boat'],
    spawn: [['penta', 600, 780], ['pyoko', 820, 760], ['futan', 1020, 800], ['lulu', 420, 800], ['kon', 1240, 800]],
    fixtures: [['s7_iceslope', 280, 680], ['s7_penguins', 800, 740], ['s7_whale', 1320, 720]], favs: ['penguin', 'snow', 'fishingrod', 'blanket'],
    ambient: (c, t) => { c.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 26; i++) { const x = ((i * 137 + t * 0.012) % (W + 40)) - 20, y = ((i * 89 + t * 0.025) % (H + 20)) - 10; G.circ(c, x, y, 2 + (i % 3)); c.fill(); } },
    bg(c, r) {
      B.sky(c, '#9fd0ff', '#eef8ff', 560);
      for (let i = 0; i < 3; i++) { c.strokeStyle = ['rgba(120,240,200,.25)', 'rgba(160,200,255,.22)', 'rgba(220,170,255,.2)'][i]; c.lineWidth = 30; c.beginPath(); c.moveTo(0, 80 + i * 40); for (let x = 0; x <= W; x += 200) c.quadraticCurveTo(x + 100, 40 + i * 40 + (x % 400 ? 50 : -30), x + 200, 80 + i * 40); c.stroke(); }
      for (const [x, w, h] of [[150, 300, 200], [600, 220, 140], [1000, 380, 240], [1450, 260, 170]]) { G.poly(c, [x - w / 2, 560, x - w / 4, 560 - h, x + w / 6, 560 - h * 0.85, x + w / 2, 560]); c.fillStyle = '#ffffff'; c.fill(); c.fillStyle = '#d4ecff'; G.poly(c, [x + w / 6, 560 - h * 0.85, x + w / 2, 560, x + w / 6, 560]); c.fill(); }
      c.fillStyle = '#5aaee0'; c.fillRect(0, 556, W, 40);
      c.fillStyle = G.grad(c, 0, 590, 0, H, [[0, '#ffffff'], [1, '#dcecf8']]); c.fillRect(0, 590, W, H - 590);
      c.fillStyle = 'rgba(160,200,240,.3)'; for (let i = 0; i < 12; i++) { G.ell(c, r() * W, 640 + r() * 220, 40 + r() * 60, 6); c.fill(); }
    } });
  S({ id: 'savanna', num: 75, name: 'サバンナ', bgm: 'camp', floor: [590, 880], color: '#ff9800',
    tools: ['camera', 'explorer', 'bag', 'magnifier', 'banana', 'watermelon', 'juice', 'elephant', 'sunglasses'], rides: ['car', 'bus', 'horse'],
    spawn: [['ricky', 600, 780], ['gaku', 820, 760], ['papa', 1020, 800], ['choco', 420, 800], ['mimi', 1240, 800]],
    fixtures: [['s7_kirin', 300, 760], ['s7_lion', 820, 740], ['s7_hippo', 1330, 760]], favs: ['explorer', 'camera', 'sunglasses', 'banana'],
    bg(c, r) {
      B.sky(c, '#ffb070', '#fff0c8', 570);
      G.circ(c, 1200, 300, 110); c.fillStyle = 'rgba(255,240,180,.9)'; c.fill(); G.circ(c, 1200, 300, 150); c.fillStyle = 'rgba(255,240,180,.3)'; c.fill();
      hills(c, 560, '#e8c070', 30, 1);
      for (const [x, s] of [[120, 1], [560, 0.7], [980, 0.9], [1500, 1.1]]) { c.fillStyle = '#6a4a3a'; c.fillRect(x - 8 * s, 560 - 150 * s, 16 * s, 150 * s); G.ell(c, x, 560 - 160 * s, 130 * s, 30 * s); c.fillStyle = '#5a8a3a'; c.fill(); G.ell(c, x + 30 * s, 560 - 178 * s, 70 * s, 18 * s); c.fillStyle = '#6fa04a'; c.fill(); }
      c.fillStyle = 'rgba(80,60,40,.35)'; for (const [x, y] of [[700, 520], [760, 530], [1340, 520]]) { G.ell(c, x, y, 26, 12); c.fill(); G.circ(c, x + 24, y - 12, 8); c.fill(); }
      B.grass(c, 570, '#e8d070', '#d4b45a'); B.tufts(c, r, 590, 50, '#c9a03a');
    } });
  S({ id: 'treehouse', num: 76, name: 'ひみつきち', bgm: 'park', floor: [600, 880], color: '#43a047',
    tools: ['flashlight', 'book', 'bag', 'magnifier', 'acorn', 'bugnet', 'teddy', 'blanket', 'letter', 'onigiri'], rides: ['bicycle', 'skateboard', 'tent'],
    spawn: [['pon', 600, 780], ['yuto', 820, 760], ['kon', 1020, 800], ['sakura', 420, 800], ['moko', 1240, 800]],
    fixtures: [['s7_treehut', 360, 760], ['s7_rope', 860, 720], ['s7_tire', 1300, 720]], favs: ['flashlight', 'book', 'magnifier', 'acorn'],
    bg(c, r) {
      B.sky(c, '#a8dcff', '#eef9ff', 600); B.cloud(c, 700, 90, 0.9); B.cloud(c, 1300, 130, 0.7);
      for (let i = 0; i < 9; i++) B.tree(c, 40 + i * 200, 600, 1.1 + r() * 0.4, i % 2 ? '#5fae58' : '#4f9a4a');
      for (let i = 0; i < 6; i++) B.bush(c, 100 + i * 290, 610, 0.9, '#6dbb5f');
      B.grass(c, 596, '#8fd06a', '#6fb85a'); B.tufts(c, r, 610, 50, '#5fa850'); B.flowers(c, r, 620, 24);
    } });
  S({ id: 'volcano', num: 77, name: 'かざんの しま', bgm: 'beach', floor: [590, 880], color: '#e64a19',
    tools: ['shell', 'bucket', 'parasol', 'juice', 'watermelon', 'banana', 'swimring', 'sunglasses', 'camera', 'cloud'], rides: ['boat', 'swimring'],
    spawn: [['lulu', 600, 780], ['nyan', 820, 760], ['ricky', 1020, 800], ['pyoko', 420, 800], ['baba', 1240, 800]],
    fixtures: [['s7_kazan', 800, 700], ['s7_onsen', 260, 760], ['s7_turtle', 1320, 780]], favs: ['sunglasses', 'swimring', 'cloud', 'shell'],
    bg(c, r) {
      B.sky(c, '#7fd0ff', '#fff4d8', 520); B.cloud(c, 200, 110, 1); B.cloud(c, 1350, 90, 0.9);
      c.fillStyle = G.grad(c, 0, 470, 0, 600, [[0, '#4fc3f7'], [1, '#2a9ad8']]); c.fillRect(0, 470, W, 130);
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; for (let i = 0; i < 10; i++) { const x = r() * W, y = 490 + r() * 90; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 20, y - 6, x + 40, y); c.stroke(); }
      for (const [x, s] of [[120, 1.1], [1500, 1]]) { c.strokeStyle = '#9a6b42'; c.lineWidth = 16 * s; c.beginPath(); c.moveTo(x, 640); c.quadraticCurveTo(x + 30, 500, x + 10, 380 * s + 40); c.stroke(); for (let i = 0; i < 5; i++) { c.save(); c.translate(x + 10, 380 * s + 40); c.rotate(-2.6 + i * 0.6); G.ell(c, 60, 0, 70, 16); c.fillStyle = '#4f9a4a'; c.fill(); c.restore(); } }
      c.fillStyle = G.grad(c, 0, 590, 0, H, [[0, '#ffe7b0'], [1, '#f2d08a']]); c.beginPath(); c.moveTo(0, 600); c.quadraticCurveTo(400, 570, 800, 590); c.quadraticCurveTo(1200, 610, W, 585); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
      c.fillStyle = 'rgba(200,150,90,.35)'; for (let i = 0; i < 30; i++) { G.circ(c, r() * W, 620 + r() * 260, 2 + r() * 2); c.fill(); }
      for (let i = 0; i < 5; i++) { c.fillStyle = ['#ff6f91', '#ffd23f'][i % 2]; G.star(c, r() * W, 660 + r() * 200, 12, 5); c.fill(); }
    } });
  S({ id: 'cave', num: 78, name: 'キラキラ どうくつ', bgm: 'night', floor: [600, 880], color: '#7e57c2',
    tools: ['flashlight', 'magnifier', 'chest', 'jewelbox', 'crystalball', 'helmet', 'camera', 'bag', 'star'], rides: ['car', 'tricycle'],
    spawn: [['gaku', 600, 780], ['kon', 820, 760], ['lulu', 1020, 800], ['ricky', 420, 800], ['jiji', 1240, 800]],
    fixtures: [['s7_gems', 300, 680], ['s7_cart', 820, 780], ['s7_echo', 1320, 680]], favs: ['flashlight', 'jewelbox', 'crystalball', 'helmet'],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 620, [[0, '#1a1030'], [1, '#3a2a5a']]); c.fillRect(0, 0, W, 620);
      for (let i = 0; i < 18; i++) { const x = i * 95 + r() * 30, h = 50 + r() * 110; G.poly(c, [x - 30, 0, x, h, x + 30, 0]); c.fillStyle = '#4a3a6a'; c.fill(); }
      for (let i = 0; i < 26; i++) { const x = r() * W, y = 120 + r() * 440, col = GEMC[i % GEMC.length]; c.save(); c.translate(x, y); c.rotate(r() - 0.5); c.fillStyle = col; c.globalAlpha = 0.75; G.poly(c, [-6, 10, -7, -6, 0, -16, 7, -6, 6, 10]); c.fill(); c.globalAlpha = 0.25; G.circ(c, 0, 0, 22); c.fill(); c.restore(); }
      c.fillStyle = 'rgba(255,250,220,.6)'; for (let i = 0; i < 40; i++) { G.circ(c, r() * W, r() * 560, 1 + r() * 2); c.fill(); }
      c.fillStyle = G.grad(c, 0, 600, 0, H, [[0, '#5a4a7a'], [1, '#3a2a55']]); c.fillRect(0, 600, W, H - 600);
      for (let i = 0; i < 16; i++) { G.ell(c, r() * W, 630 + r() * 240, 30 + r() * 40, 8 + r() * 8); c.fillStyle = 'rgba(30,20,50,.35)'; c.fill(); }
    } });
  S({ id: 'lakeboat', num: 79, name: 'みずうみの ボート', bgm: 'park', floor: [600, 880], color: '#0097a7',
    tools: ['fishingrod', 'bread', 'duck', 'camera', 'onigiri', 'juice', 'sheet', 'parasol', 'bucket'], rides: ['boat', 'swimring', 'bicycle'],
    spawn: [['mama', 600, 820], ['choco', 820, 840], ['jiji', 1020, 830], ['mimi', 420, 840], ['yuto', 1240, 840]],
    fixtures: [['s7_rowboat', 380, 700], ['s7_swan', 1240, 690], ['s7_ducks', 820, 720]], favs: ['bread', 'duck', 'fishingrod', 'camera'],
    bg(c, r) {
      B.sky(c, '#9fd8ff', '#f0faff', 470); B.cloud(c, 260, 90, 0.9); B.cloud(c, 1200, 120, 0.8);
      for (const [x, w, h, col] of [[300, 700, 260, '#8fb0d8'], [1100, 900, 320, '#7a9ec8'], [700, 600, 200, '#a8c4e0']]) { G.poly(c, [x - w / 2, 470, x, 470 - h, x + w / 2, 470]); c.fillStyle = col; c.fill(); G.poly(c, [x - w / 10, 470 - h * 0.8, x, 470 - h, x + w / 10, 470 - h * 0.8]); c.fillStyle = '#ffffff'; c.fill(); }
      for (let i = 0; i < 12; i++) B.pine(c, 30 + i * 140, 480, 0.6 + r() * 0.2, '#3f8a5c');
      c.fillStyle = G.grad(c, 0, 470, 0, 760, [[0, '#7fc8e8'], [1, '#3a9ac8']]); c.fillRect(0, 470, W, 290);
      c.fillStyle = 'rgba(255,255,255,.15)'; for (let i = 0; i < 4; i++) { G.poly(c, [200 + i * 380, 480, 400 + i * 380, 480, 300 + i * 380, 600]); c.fill(); }
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 3; for (let i = 0; i < 18; i++) { const x = r() * W, y = 500 + r() * 240; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30 + r() * 30, y); c.stroke(); }
      c.fillStyle = G.grad(c, 0, 760, 0, H, [[0, '#9ed67a'], [1, '#7cc05a']]); c.beginPath(); c.moveTo(0, 770); c.quadraticCurveTo(400, 745, 800, 765); c.quadraticCurveTo(1200, 785, W, 760); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
      B.tufts(c, r, 790, 30, '#6fb85e'); B.flowers(c, r, 800, 14);
    } });
  S({ id: 'bamboo', num: 80, name: 'パンダの たけやぶ', bgm: 'camp', floor: [600, 880], color: '#558b2f',
    tools: ['panda', 'onigiri', 'bento', 'bag', 'camera', 'sheet', 'apple', 'carrot', 'pinwheel'], rides: ['tricycle', 'car'],
    spawn: [['panda', 600, 780], ['mimi', 820, 760], ['pon', 1020, 800], ['baba', 420, 800], ['pyoko', 1240, 800]],
    fixtures: [['s7_pandaroll', 300, 740], ['s7_takenoko', 820, 720], ['s7_pandaeat', 1300, 740]], favs: ['panda', 'onigiri', 'bento', 'pinwheel'],
    bg(c, r) {
      B.sky(c, '#c8ecd0', '#f2fff0', 600);
      for (let layer = 0; layer < 2; layer++) for (let i = 0; i < 22; i++) { const x = i * 76 + r() * 40 + layer * 30, w = 16 + layer * 6, col = layer ? '#5fae58' : '#a8d8a0'; c.fillStyle = col; c.fillRect(x, 0, w, 610); c.fillStyle = layer ? '#4f9a4a' : '#90c890'; for (let y = 60 + r() * 60; y < 600; y += 110) c.fillRect(x - 2, y, w + 4, 5); for (let k = 0; k < 3; k++) { const y = 80 + r() * 400; c.save(); c.translate(x + w / 2, y); c.rotate((r() < 0.5 ? -1 : 1) * (0.4 + r() * 0.4)); G.ell(c, 34, 0, 34, 8); c.fillStyle = layer ? '#6fbf6a' : '#b8e0b0'; c.fill(); c.restore(); } }
      B.grass(c, 596, '#9ed67a', '#7cc05a'); B.tufts(c, r, 610, 40, '#6fb85e');
      c.fillStyle = 'rgba(120,180,90,.5)'; for (let i = 0; i < 20; i++) { c.save(); c.translate(r() * W, 640 + r() * 220); c.rotate(r() * 6); G.ell(c, 0, 0, 14, 4); c.fill(); c.restore(); }
    } });
  S({ id: 'hanami', num: 81, name: 'さくらの おはなみ', bgm: 'home', floor: [600, 880], color: '#ec407a',
    tools: ['onigiri', 'bento', 'juice', 'sheet', 'camera', 'petals', 'flowercrown', 'cake', 'strawberry', 'pinwheel'], rides: ['bicycle', 'tricycle'],
    spawn: [['sakura', 600, 780], ['mama', 820, 760], ['baba', 1020, 800], ['lulu', 420, 800], ['papa', 1240, 800]],
    fixtures: [['s7_sakura', 340, 700], ['s7_picnic', 860, 760], ['s7_uguisu', 1340, 700]], favs: ['petals', 'flowercrown', 'bento', 'onigiri'],
    ambient: (c, t) => { for (let i = 0; i < 14; i++) { const x = ((i * 151 + t * 0.02) % (W + 40)) - 20, y = ((i * 97 + t * 0.03) % (H + 20)) - 10; petal(c, x, y, 6, t * 0.003 + i, i % 3 ? '#ffc2d6' : '#ffffff'); } },
    bg(c, r) {
      B.sky(c, '#bfe4ff', '#fff4f8', 590); B.cloud(c, 300, 80, 0.8); B.cloud(c, 1100, 110, 0.7);
      hills(c, 520, '#c8e8b8', 30, 2);
      for (let i = 0; i < 9; i++) sakuraTree(c, 60 + i * 190 + r() * 30, 600, 0.8 + r() * 0.3);
      c.fillStyle = '#e2433b'; for (let i = 0; i < 8; i++) { G.rr(c, 100 + i * 200, 360, 30, 40, 10); c.fill(); }
      c.strokeStyle = '#8a5a4a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 360); for (let x = 0; x <= W; x += 200) c.quadraticCurveTo(x + 100, 380, x + 200, 360); c.stroke();
      B.grass(c, 596, '#b8e4a0', '#9ed67a'); B.tufts(c, r, 610, 40, '#7cc05a');
      for (let i = 0; i < 40; i++) petal(c, r() * W, 620 + r() * 260, 6, r() * 6, '#ffc2d6');
    } });
  S({ id: 'autumn', num: 82, name: 'もみじの やま', bgm: 'camp', floor: [600, 880], color: '#d84315',
    tools: ['acorn', 'basket', 'bag', 'camera', 'onigiri', 'apple', 'grapes', 'broom', 'magnifier', 'blanket'], rides: ['bicycle', 'tricycle', 'tent'],
    spawn: [['kon', 600, 780], ['choco', 820, 760], ['jiji', 1020, 800], ['futan', 420, 800], ['nyan', 1240, 800]],
    fixtures: [['s7_leafpile', 820, 780], ['s7_donguri', 300, 700], ['s7_kakashi', 1340, 720]], favs: ['acorn', 'basket', 'apple', 'grapes'],
    ambient: (c, t) => { for (let i = 0; i < 10; i++) { const x = ((i * 163 + t * 0.018) % (W + 40)) - 20, y = ((i * 91 + t * 0.028) % (H + 20)) - 10; leaf(c, x, y, 9, t * 0.003 + i, AUTUMN[i % 5]); } },
    bg(c, r) {
      B.sky(c, '#a8d4ff', '#fff2e0', 560); B.cloud(c, 1200, 90, 0.8);
      hills(c, 420, '#e8763a', 70, 3); hills(c, 500, '#f2a03a', 50, 5);
      for (let i = 0; i < 10; i++) momijiTree(c, 40 + i * 175 + r() * 30, 600, 0.8 + r() * 0.3, AUTUMN[i % 4]);
      B.grass(c, 596, '#e8c070', '#d4a05a');
      for (let i = 0; i < 60; i++) leaf(c, r() * W, 620 + r() * 260, 8, r() * 6, AUTUMN[i % 5]);
    } });
  S({ id: 'firefly', num: 83, name: 'ほたるの よる', bgm: 'night', floor: [600, 880], color: '#33691e', night: true,
    tools: ['bugnet', 'flashlight', 'yukata', 'juice', 'blanket', 'camera', 'moon', 'star', 'pinwheel'], rides: ['bicycle', 'tent'],
    spawn: [['yume', 600, 780], ['kon', 820, 760], ['sakura', 1020, 800], ['pon', 420, 800], ['baba', 1240, 800]],
    fixtures: [['s7_hotarubush', 320, 720], ['s7_frogs', 840, 780], ['s7_jar', 1320, 740]], favs: ['bugnet', 'yukata', 'flashlight', 'moon'],
    ambient: (c, t) => { for (let i = 0; i < 18; i++) { const x = (i * 97) % W + Math.sin(t * 0.0006 + i * 2) * 60, y = 300 + ((i * 53) % 400) + Math.cos(t * 0.0008 + i) * 40, a = 0.5 + Math.sin(t * 0.004 + i * 1.3) * 0.5; ffly(c, x, y, a); } },
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 600, [[0, '#0a1030'], [1, '#1a3a4a']]); c.fillRect(0, 0, W, 600); stars(c, r, 90, 420);
      G.circ(c, 1300, 140, 50); c.fillStyle = '#fff3b0'; c.fill(); G.circ(c, 1300, 140, 80); c.fillStyle = 'rgba(255,243,176,.15)'; c.fill();
      hills(c, 520, '#1a3a2a', 40, 1);
      c.fillStyle = G.grad(c, 0, 540, 0, 640, [[0, '#2a4a6a'], [1, '#1a3050']]); c.beginPath(); c.moveTo(0, 560); c.quadraticCurveTo(800, 520, W, 570); c.lineTo(W, 630); c.quadraticCurveTo(800, 600, 0, 640); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,243,176,.35)'; G.ell(c, 1300, 590, 50, 6); c.fill();
      c.fillStyle = G.grad(c, 0, 620, 0, H, [[0, '#2a4a3a'], [1, '#1a3a2a']]); c.fillRect(0, 630, W, H - 630);
      for (let i = 0; i < 30; i++) { const x = r() * W, h = 30 + r() * 40; c.strokeStyle = '#3a6a4a'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, 640); c.lineTo(x + r() * 10 - 5, 640 - h); c.stroke(); }
    } });
  S({ id: 'tanabata', num: 84, name: 'たなばた', bgm: 'night', floor: [600, 880], color: '#283593', night: true,
    tools: ['letter', 'crayons', 'star', 'moon', 'yukata', 'juice', 'camera', 'flashlight', 'starwand', 'tiara_moon'], rides: ['carpet', 'unicorn'],
    spawn: [['lulu', 600, 780], ['yuto', 820, 760], ['sakura', 1020, 800], ['yume', 420, 800], ['jiji', 1240, 800]],
    fixtures: [['s7_amanogawa', 800, 520], ['s7_sasa', 300, 760], ['s7_telescope', 1320, 740]], favs: ['letter', 'yukata', 'star', 'starwand'],
    skyStars: [[160, 120], [420, 80], [1180, 90], [1460, 150], [1040, 200]],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 600, [[0, '#0a0a3a'], [1, '#2a2a6a']]); c.fillRect(0, 0, W, 600); stars(c, r, 160, 560);
      for (let i = 0; i < 9; i++) { const x = i * 190 - 20, h = 110 + (i % 3) * 20; B.house(c, x, 600, 160, h, '#3a3a6a', '#2a2a50'); c.fillStyle = 'rgba(255,230,150,.85)'; for (const k of [0.15, 0.58]) { G.rr(c, x + 160 * k, 600 - h * 0.62, 160 * 0.26, h * 0.26, 4); c.fill(); } }
      B.lanterns(c, 0, 420, 800, 440, 40); B.lanterns(c, 800, 440, 1600, 420, 40);
      c.fillStyle = G.grad(c, 0, 600, 0, H, [[0, '#3a3a6a'], [1, '#2a2a50']]); c.fillRect(0, 600, W, H - 600);
      c.fillStyle = 'rgba(255,255,255,.06)'; for (let x = 0; x < W; x += 80) for (let y = 610; y < H; y += 80) if (((x + y) / 80) % 2) c.fillRect(x, y, 80, 80);
    } });
})();
