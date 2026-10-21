/* ふえた ステージ（37〜48） */
'use strict';
(() => {
  const G = PT.G, B = PT.BG, F = PT.FIX, W = PT.W, H = PT.H;
  const on = (f, k, t) => f[k] && t < f[k];
  const prog = (f, k, t, ms) => (on(f, k, t) ? 1 - (f[k] - t) / ms : -1);

  /* ---------- 37 コンサート ---------- */
  F.spotlights = { w: 600, h: 200, sky: true, tags: ['light', 'stage'], slots: [],
    draw(c, t, f) {
      const party = on(f, 'party', t);
      [-240, -80, 80, 240].forEach((x, i) => { const a = Math.sin(t * (party ? 0.004 : 0.001) + i) * (party ? 0.5 : 0.15); c.save(); c.translate(x, -180); c.rotate(a); c.fillStyle = party ? ['rgba(255,111,145,.25)', 'rgba(255,214,63,.25)', 'rgba(88,185,240,.25)', 'rgba(123,211,106,.25)'][i] : 'rgba(255,248,210,.18)'; c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.lineTo(110, 520); c.lineTo(-110, 520); c.closePath(); c.fill(); G.rr(c, -22, -20, 44, 30, 6); G.fillO(c, '#3a3550', 2.5); c.restore(); });
    } };
  F.micstand = { w: 120, h: 260, tags: ['mic', 'music', 'stage'], slots: [[-80, 10], [80, 10]],
    draw(c, t, f) {
      G.ell(c, 0, -4, 40, 9); G.fillO(c, '#3a3550', 2.5); c.strokeStyle = '#9aa3b8'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, -6); c.lineTo(0, -200); c.lineTo(20, -220); c.stroke();
      c.save(); c.translate(26, -228); c.rotate(-0.6); G.rr(c, -10, -6, 20, 40, 8); G.fillO(c, '#3a3550', 2); G.ell(c, 0, -10, 15, 18); G.fillO(c, '#c9ccd8', 2.5); c.restore();
      if (on(f, 'sing', t)) for (let i = 0; i < 3; i++) { const k = ((t * 0.0008 + i * 0.33) % 1); G.note(c, 40 + k * 60, -240 - k * 80, 18, ['#ff6f91', '#58b9f0', '#ffd23f'][i]); }
    } };
  F.drumset = { w: 280, h: 200, tags: ['drum', 'music'], slots: [[-180, 20], [180, 20]],
    draw(c, t, f) {
      const hit = on(f, 'beat', t) && Math.floor(t / 120) % 2;
      G.ell(c, 0, -70, 80, 70); G.fillO(c, '#e2433b', 4); G.ell(c, 0, -70, 60, 52); c.fillStyle = '#fff8e8'; c.fill(); c.fillStyle = '#e2433b'; c.font = `900 30px ${PT.FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('★', 0, -70);
      for (const [x, y, r] of [[-100, -110, 34], [100, -110, 34]]) { G.ell(c, x, y + 20, r, 14); G.fillO(c, '#e2433b', 2.5); G.ell(c, x, y + (hit ? 4 : 0), r, 10); c.fillStyle = '#fff8e8'; c.fill(); c.strokeStyle = '#9aa3b8'; c.lineWidth = 2; c.stroke(); }
      for (const x of [-120, 120]) { c.strokeStyle = '#9aa3b8'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, -180); c.stroke(); G.ell(c, x, -184 + (hit ? 4 : 0), 40, 8, hit ? 0.2 : 0); G.fillO(c, '#f5c242', 2); }
    } };
  /* ---------- 38 ゲームセンター ---------- */
  F.clawmachine = { w: 220, h: 380, tags: ['game', 'machine', 'prize'], slots: [[-140, 20], [140, 20]],
    draw(c, t, f) {
      G.rr(c, -100, -380, 200, 380, 14); G.fillO(c, '#ff8fb1', 4);
      G.rr(c, -84, -340, 168, 200, 8); c.fillStyle = 'rgba(220,240,255,.75)'; c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 4; c.stroke();
      [['#ffd23f', -50], ['#58b9f0', -10], ['#7bd36a', 30], ['#ff6f91', 60]].forEach(([col, x], i) => { G.circ(c, x, -160 - (i % 2) * 14, 18); G.fillO(c, col, 2); c.fillStyle = '#2a1f35'; G.circ(c, x - 5, -164 - (i % 2) * 14, 2.4); c.fill(); G.circ(c, x + 5, -164 - (i % 2) * 14, 2.4); c.fill(); });
      const k = on(f, 'grab', t) ? prog(f, 'grab', t, 2400) : 0, d = Math.sin(k * Math.PI) * 140;
      c.strokeStyle = '#9aa3b8'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -340); c.lineTo(0, -320 + d); c.stroke(); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, -320 + d); c.lineTo(s * 16, -300 + d); c.lineTo(s * 8, -288 + d); c.stroke(); }
      G.rr(c, -84, -120, 168, 100, 8); G.fillO(c, '#ffd1e0', 3); G.circ(c, -40, -70, 16); G.fillO(c, '#e2433b', 2.5); G.rr(c, 20, -84, 40, 30, 6); G.fillO(c, '#3a3550', 2);
      c.fillStyle = '#ffffff'; c.font = `900 22px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('キャッチ', 0, -352);
    } };
  F.whack = { w: 300, h: 140, tags: ['game', 'mole'], slots: [[-190, 10], [190, 10]],
    draw(c, t, f) {
      G.rr(c, -150, -110, 300, 110, 14); G.fillO(c, '#58b9f0', 4);
      for (let i = 0; i < 3; i++) { const x = -90 + i * 90; G.ell(c, x, -90, 34, 12); c.fillStyle = '#2a3a5a'; c.fill(); const up = on(f, 'play', t) ? Math.max(0, Math.sin(t * 0.008 + i * 2)) : 0; if (up > 0.1) { c.save(); c.beginPath(); c.rect(x - 40, -200, 80, 112); c.clip(); G.ell(c, x, -90 - up * 40, 24, 28); G.fillO(c, '#a8733f', 2.5); c.fillStyle = '#2a1f35'; G.circ(c, x - 8, -100 - up * 40, 3); c.fill(); G.circ(c, x + 8, -100 - up * 40, 3); c.fill(); G.ell(c, x, -88 - up * 40, 6, 4); c.fillStyle = '#ff8fb1'; c.fill(); c.restore(); } }
    } };
  F.photobooth = { w: 200, h: 320, tags: ['photo', 'camera'], slots: [[0, 10], [-130, 20]],
    draw(c, t, f) {
      G.rr(c, -100, -320, 200, 320, 12); G.fillO(c, '#9b6fd6', 4);
      G.rr(c, -80, -260, 160, 250, 8); c.fillStyle = on(f, 'flash', t) ? '#ffffff' : '#2a2050'; c.fill();
      for (let i = 0; i < 5; i++) { c.fillStyle = `rgba(255,236,140,${0.5 + 0.5 * Math.sin(t * 0.006 + i)})`; G.star(c, -60 + i * 30, -292, 7, 3); c.fill(); }
      c.fillStyle = '#ffffff'; c.font = `900 18px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('プリ', 60, -296);
    } };
  /* ---------- 39 スケートリンク ---------- */
  F.rink = { w: 700, h: 200, area: 'ice', tags: ['ice', 'skate'], slots: [[-400, 0], [400, 0]],
    draw(c, t) {
      G.ell(c, 0, -90, 350, 100); G.fillO(c, '#ffffff', 4); G.ell(c, 0, -90, 330, 86); c.fillStyle = G.grad(c, 0, -176, 0, -4, [[0, '#e8f6ff'], [1, '#bfe6ff']]); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(Math.sin(i * 2) * 120, -90 + Math.cos(i) * 30, 60 + i * 10, 14, 0.3 * i, 0, Math.PI * 1.4); c.stroke(); }
      c.strokeStyle = '#ff6f91'; c.lineWidth = 6; G.ell(c, 0, -90, 80, 26); c.stroke();
    } };
  F.cocoastand = { w: 220, h: 240, tags: ['shop', 'drink', 'warm'], slots: [[-140, 20], [140, 20]],
    draw(c, t, f) {
      G.rr(c, -100, -120, 200, 120, 8); G.fillO(c, '#a8733f', 3);
      for (const x of [-90, 82]) { G.rr(c, x, -230, 8, 110, 3); G.fillO(c, '#8a5a3a', 2); }
      c.beginPath(); c.moveTo(-110, -220); c.lineTo(110, -220); c.lineTo(100, -180); for (let i = 0; i < 5; i++) { const x = 100 - (i + 1) * 40; c.quadraticCurveTo(x + 20, -160, x, -180); } c.closePath(); G._bb = null; c.fillStyle = '#e2433b'; c.fill(); c.save(); c.clip(); c.fillStyle = '#ffffff'; for (let x = -110; x < 110; x += 40) c.fillRect(x, -220, 20, 60); c.restore();
      for (let i = 0; i < 3; i++) { const x = -50 + i * 50; G.rr(c, x - 14, -150, 28, 30, 6); G.fillO(c, '#ffffff', 2); G.ell(c, x, -150, 12, 4); c.fillStyle = '#7a4a2e'; c.fill(); const k = ((t * 0.0006 + i * 0.3) % 1); G.circ(c, x + k * 8, -160 - k * 40, 5 + k * 5); c.fillStyle = `rgba(255,255,255,${0.7 * (1 - k)})`; c.fill(); }
      c.fillStyle = '#ffffff'; c.font = `900 22px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('ココア', 0, -60);
    } };
  F.snowglobe = { w: 180, h: 220, tags: ['snow', 'globe', 'magic'], slots: [[-120, 20], [120, 20]],
    draw(c, t, f) {
      G.rr(c, -70, -50, 140, 50, 12); G.fillO(c, '#c9645a', 3);
      G.circ(c, 0, -130, 80); c.fillStyle = 'rgba(220,240,255,.6)'; c.fill(); c.strokeStyle = '#9fc8f0'; c.lineWidth = 3; c.stroke();
      c.save(); G.circ(c, 0, -130, 78); c.clip(); G.ell(c, 0, -60, 90, 30); c.fillStyle = '#ffffff'; c.fill(); B.pine(c, -20, -70, 0.5, '#3f8a5c'); G.rr(c, 20, -110, 40, 40, 4); G.fillO(c, '#ffd1e0', 2); G.poly(c, [14, -108, 40, -130, 66, -108]); c.fillStyle = '#e2433b'; c.fill();
      const shake = on(f, 'shake', t); c.fillStyle = '#ffffff'; for (let i = 0; i < (shake ? 40 : 12); i++) { const y = -200 + ((t * (shake ? 0.08 : 0.02) + i * 37) % 150); G.circ(c, -70 + ((i * 53) % 140) + Math.sin(t * 0.004 + i) * 6, y, 2.5); c.fill(); }
      c.restore(); c.fillStyle = 'rgba(255,255,255,.6)'; G.ell(c, -36, -170, 14, 24, -0.6); c.fill();
    } };
  /* ---------- 40 つりぼり ---------- */
  F.pondF = { w: 700, h: 220, area: 'water', tags: ['water', 'pond', 'fish'], slots: [[-400, 0], [400, 0]],
    draw(c, t) {
      G.ell(c, 0, -90, 350, 110); G.fillO(c, '#7fb3a0', 4); G.ell(c, 0, -94, 330, 96); c.fillStyle = G.grad(c, 0, -190, 0, 0, [[0, '#7fd0e8'], [1, '#3a9ac8']]); c.fill();
      for (let i = 0; i < 5; i++) { const x = Math.sin(t * 0.0006 + i * 1.3) * 240, y = -90 + Math.cos(t * 0.0008 + i) * 50; c.save(); c.translate(x, y); c.scale(Math.cos(t * 0.0006 + i * 1.3) > 0 ? 1 : -1, 1); c.fillStyle = 'rgba(255,140,60,.6)'; G.ell(c, 0, 0, 18, 8); c.fill(); G.poly(c, [-16, 0, -28, -8, -28, 8]); c.fill(); c.restore(); }
      for (const [x, y] of [[-220, -130], [200, -60], [-80, -40]]) { G.ell(c, x, y, 30, 12); c.fillStyle = '#5cae6a'; c.fill(); G.circ(c, x + 10, y - 6, 6); c.fillStyle = '#ffb3c8'; c.fill(); }
    } };
  F.dock = { w: 300, h: 180, tags: ['dock', 'fishing'], slots: [[60, -40], [-180, 20]],
    draw(c, t, f) {
      for (const x of [-120, 0, 120]) { G.rr(c, x - 8, -60, 16, 70, 4); G.fillO(c, '#7a5232', 2); }
      G.rr(c, -150, -76, 300, 24, 6); G.fillO(c, '#c99a64', 3); c.strokeStyle = '#a8733f'; c.lineWidth = 2; for (let x = -130; x < 150; x += 30) { c.beginPath(); c.moveTo(x, -76); c.lineTo(x, -52); c.stroke(); }
      if (on(f, 'fish', t)) { const k = prog(f, 'fish', t, 2500); c.strokeStyle = '#3a3550'; c.lineWidth = 2; c.beginPath(); c.moveTo(130, -200); c.lineTo(200, 20 - Math.sin(k * Math.PI) * 30); c.stroke(); G.circ(c, 200, 20 - Math.sin(k * Math.PI) * 30, 6); c.fillStyle = '#ff5d78'; c.fill(); }
    } };
  F.frogpad = { w: 220, h: 100, tags: ['frog', 'pond'], slots: [[-140, 10], [140, 10]],
    draw(c, t, f) {
      G.ell(c, 0, -20, 100, 26); c.fillStyle = '#5cae6a'; c.fill(); c.strokeStyle = '#3f8a4a'; c.lineWidth = 3; c.stroke(); c.beginPath(); c.moveTo(0, -20); c.lineTo(90, -30); c.stroke();
      const j = on(f, 'jump', t) ? Math.sin(prog(f, 'jump', t, 1000) * Math.PI) * 80 : 0;
      for (const [x, d] of [[-30, 0], [30, 0.4]]) { const y = -40 - j * (d ? 0.6 : 1); c.save(); c.translate(x, y); G.ell(c, 0, 0, 20, 14); G.fillO(c, '#7bd36a', 2.5); for (const s of [-1, 1]) { G.circ(c, s * 9, -12, 7); G.fillO(c, '#7bd36a', 2); G.circ(c, s * 9, -13, 3.4); c.fillStyle = '#2a1f35'; c.fill(); } c.strokeStyle = '#2a1f35'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 8, 0.2, Math.PI - 0.2); c.stroke(); c.restore(); }
    } };
  /* ---------- 41 くうこう ---------- */
  F.planeF = { w: 520, h: 220, tags: ['airplane', 'vehicle'], slots: [[-300, 20], [300, 20]],
    draw(c, t, f) {
      const k = prog(f, 'fly', t, 3500), dx = k >= 0 ? k * k * 1400 : 0, dy = k >= 0 ? -Math.max(0, k - 0.3) * 700 : 0;
      c.save(); c.translate(dx, dy); c.rotate(k > 0.3 ? -0.25 : 0);
      G.rr(c, -240, -130, 440, 80, 40); G.fillO(c, '#ffffff', 4); G.poly(c, [190, -130, 250, -100, 200, -50]); c.fillStyle = '#ffffff'; c.fill();
      G.poly(c, [-200, -130, -250, -230, -170, -230, -130, -130]); G.fillO(c, '#58b9f0', 3);
      G.poly(c, [-40, -80, 60, -80, -40, 10, -100, 10]); G.fillO(c, '#9fd8ff', 3);
      c.fillStyle = '#bfe6ff'; for (let x = -160; x < 160; x += 40) { G.circ(c, x, -104, 10); c.fill(); }
      c.fillStyle = '#ff6f91'; c.fillRect(-230, -76, 420, 8);
      if (k < 0.2) for (const x of [-120, 120]) { c.strokeStyle = '#3a3550'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, -50); c.lineTo(x, -14); c.stroke(); G.circ(c, x, -12, 12); c.fillStyle = '#3a3550'; c.fill(); }
      c.restore();
    } };
  F.carousel2 = { w: 360, h: 150, tags: ['baggage', 'machine'], slots: [[-220, 20], [220, 20]],
    draw(c, t, f) {
      G.rr(c, -180, -90, 360, 90, 40); G.fillO(c, '#9aa3b8', 4); G.rr(c, -160, -80, 320, 30, 15); c.fillStyle = '#3a4050'; c.fill();
      const sp = on(f, 'run', t) ? 0.15 : 0.03;
      [['#e2433b', 0], ['#58b9f0', 80], ['#ffd23f', 160], ['#7bd36a', 240]].forEach(([col, o]) => { const x = -150 + ((t * sp + o) % 300); G.rr(c, x, -110, 50, 36, 6); G.fillO(c, col, 2.5); G.rr(c, x + 16, -118, 18, 10, 3); c.strokeStyle = '#3a3550'; c.lineWidth = 2; c.stroke(); });
    } };
  F.tower = { w: 160, h: 460, tags: ['tower', 'airport'], slots: [[-110, 20], [110, 20]],
    draw(c, t, f) {
      G.rr(c, -30, -360, 60, 360, 6); G.fillO(c, '#e8eef5', 3);
      G.rr(c, -70, -460, 140, 100, 16); G.fillO(c, '#e8eef5', 4); G.rr(c, -60, -446, 120, 60, 10); c.fillStyle = '#7fd0ff'; c.fill();
      const blink = on(f, 'call', t) ? Math.floor(t / 200) % 2 : Math.floor(t / 800) % 2; G.circ(c, 0, -476, 10); c.fillStyle = blink ? '#ff5d78' : '#a8324a'; c.fill();
      c.save(); c.translate(0, -486); c.rotate(t * 0.003); c.strokeStyle = '#9aa3b8'; c.lineWidth = 4; c.beginPath(); c.moveTo(-30, 0); c.lineTo(30, 0); c.stroke(); c.restore();
    } };
  /* ---------- 42 うちゅうステーション ---------- */
  F.launchpad = { w: 260, h: 460, tags: ['rocket', 'space'], slots: [[-170, 20], [170, 20]],
    draw(c, t, f) {
      G.rr(c, -130, -30, 260, 30, 6); G.fillO(c, '#9aa3b8', 3); for (const x of [-110, 90]) { G.rr(c, x, -300, 20, 270, 4); G.fillO(c, '#c9ccd8', 2); }
      const k = prog(f, 'launch', t, 3500), up = k >= 0 ? Math.pow(k, 2) * 1200 : 0;
      c.save(); c.translate(0, -up);
      if (k >= 0) { for (let i = 0; i < 6; i++) { G.ell(c, PT.rand(-20, 20), -20 + i * 20, 24 - i * 3, 30); c.fillStyle = ['#ff6f3d', '#ffd23f'][i % 2]; c.fill(); } }
      c.beginPath(); c.moveTo(-50, -60); c.lineTo(-50, -300); c.quadraticCurveTo(0, -420, 50, -300); c.lineTo(50, -60); c.closePath(); G._bb = { x0: -50, y0: -420, x1: 50, y1: -60 }; G.fillO(c, '#ffffff', 4);
      G.circ(c, 0, -260, 22); c.fillStyle = '#7fd0ff'; c.fill(); c.strokeStyle = '#9aa3b8'; c.lineWidth = 5; c.stroke();
      for (const s of [-1, 1]) { G.poly(c, [s * 50, -140, s * 90, -60, s * 50, -60]); G.fillO(c, '#e2433b', 3); }
      c.restore();
    } };
  F.ufo = { w: 260, h: 300, sky: true, tags: ['ufo', 'space', 'alien'], slots: [],
    draw(c, t, f) {
      const y = -260 + Math.sin(t * 0.002) * 14, beam = on(f, 'beam', t);
      if (beam) { c.fillStyle = 'rgba(160,255,200,.3)'; c.beginPath(); c.moveTo(-30, y + 20); c.lineTo(30, y + 20); c.lineTo(110, 0); c.lineTo(-110, 0); c.closePath(); c.fill(); }
      G.ell(c, 0, y, 120, 30); G.fillO(c, '#b9c4d8', 3); c.beginPath(); c.arc(0, y - 6, 54, Math.PI, 0); c.fillStyle = 'rgba(160,230,255,.8)'; c.fill(); c.strokeStyle = '#9fc8f0'; c.lineWidth = 3; c.stroke();
      G.circ(c, 0, y - 24, 16); c.fillStyle = '#7bd36a'; c.fill(); c.fillStyle = '#2a1f35'; G.circ(c, -6, y - 26, 3); c.fill(); G.circ(c, 6, y - 26, 3); c.fill();
      for (let i = 0; i < 6; i++) { G.circ(c, -90 + i * 36, y + 6, 6); c.fillStyle = (Math.floor(t / 200) + i) % 2 ? '#ffd23f' : '#ff6f91'; c.fill(); }
    } };
  F.zerog = { w: 300, h: 300, tags: ['space', 'float'], slots: [[0, -100], [-190, 20]],
    draw(c, t) {
      G.rr(c, -150, -300, 300, 300, 30); G.fillO(c, '#e8eef5', 4); G.rr(c, -130, -280, 260, 260, 22); c.fillStyle = 'rgba(160,200,255,.3)'; c.fill();
      c.fillStyle = '#ffffff'; c.font = `900 26px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('ふわふわ', 0, -250);
      for (let i = 0; i < 5; i++) { const a = t * 0.001 + i * 1.3; c.fillStyle = ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a', '#9b8cff'][i]; G.star(c, Math.cos(a) * 90, -150 + Math.sin(a * 1.4) * 80, 8, 3.4); c.fill(); }
    } };
  /* ---------- 43 つき ---------- */
  F.mochiusu = { w: 240, h: 200, tags: ['mochi', 'moon', 'rabbit'], slots: [[-160, 20], [160, 20]],
    draw(c, t, f) {
      G.rr(c, -70, -90, 140, 90, 20); G.fillO(c, '#a8733f', 4); G.ell(c, 0, -90, 66, 18); c.fillStyle = '#ffffff'; c.fill();
      const pound = on(f, 'pound', t) ? Math.abs(Math.sin(t * 0.012)) : 0.3;
      c.save(); c.translate(70, -110 - pound * 60); c.rotate(-0.5 - pound * 0.3); G.rr(c, -6, -10, 12, 120, 4); G.fillO(c, '#c99a64', 2); G.rr(c, -30, -40, 60, 34, 10); G.fillO(c, '#c99a64', 3); c.restore();
      c.save(); c.translate(-110, -60); G.ell(c, 0, 0, 30, 34); G.fillO(c, '#ffffff', 3); G.circ(c, 0, -40, 22); G.fillO(c, '#ffffff', 3); for (const s of [-1, 1]) { G.ell(c, s * 8, -74, 6, 18); G.fillO(c, '#ffffff', 2); } c.fillStyle = '#ff5d78'; G.circ(c, -6, -42, 3); c.fill(); G.circ(c, 6, -42, 3); c.fill(); c.restore();
    } };
  F.crater2 = { w: 300, h: 100, tags: ['moon', 'bounce'], slots: [[-180, 10], [180, 10]],
    draw(c) { G.ell(c, 0, -20, 150, 34); c.fillStyle = '#9d93c4'; c.fill(); G.ell(c, 0, -16, 120, 24); c.fillStyle = '#7a70a8'; c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; G.ell(c, -40, -26, 40, 6); c.fill(); } };
  F.earthview = { w: 240, h: 240, sky: true, tags: ['earth', 'space'], slots: [],
    draw(c, t, f) {
      const g = on(f, 'glow', t);
      if (g) { c.fillStyle = 'rgba(160,220,255,.3)'; G.circ(c, 0, -120, 150); c.fill(); }
      G.circ(c, 0, -120, 100); c.fillStyle = '#4fa3e8'; c.fill();
      c.save(); G.circ(c, 0, -120, 100); c.clip(); c.fillStyle = '#6cc07a'; const o = (t * 0.01) % 200; for (const [x, y, rx, ry] of [[-40, -150, 40, 24], [30, -90, 50, 30], [-60, -70, 24, 16], [60, -160, 30, 20]]) { G.ell(c, ((x + o + 100) % 200) - 100, y, rx, ry); c.fill(); } c.fillStyle = 'rgba(255,255,255,.7)'; G.ell(c, -10, -190, 60, 12); c.fill(); c.restore();
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 4; G.circ(c, 0, -120, 100); c.stroke();
    } };
  /* ---------- 44 ようせいの くに ---------- */
  F.mushhouse = { w: 260, h: 300, tags: ['house', 'mushroom', 'fairy'], slots: [[-170, 20], [170, 20]],
    draw(c, t, f) {
      G.rr(c, -70, -150, 140, 150, 30); G.fillO(c, '#fff4e2', 4);
      const lit = on(f, 'lit', t); G.rr(c, -26, -90, 52, 90, 26); c.fillStyle = lit ? '#ffe066' : '#c27a3e'; c.fill(); c.strokeStyle = '#8a5a3a'; c.lineWidth = 3; c.stroke();
      G.circ(c, 40, -110, 16); c.fillStyle = lit ? '#fff6c8' : '#bfe6ff'; c.fill(); c.strokeStyle = '#8a5a3a'; c.lineWidth = 3; c.stroke();
      c.beginPath(); c.moveTo(-130, -130); c.bezierCurveTo(-130, -310, 130, -310, 130, -130); c.closePath(); G._bb = { x0: -130, y0: -280, x1: 130, y1: -130 }; G.fillO(c, '#c38be0', 4);
      c.fillStyle = '#ffffff'; for (const [x, y, r] of [[-70, -180, 18], [0, -240, 22], [70, -190, 16], [-20, -170, 10]]) { G.circ(c, x, y, r); c.fill(); }
      if (lit) for (let i = 0; i < 4; i++) { const a = t * 0.003 + i * 1.6; c.fillStyle = 'rgba(255,240,150,.9)'; G.circ(c, Math.cos(a) * 140, -160 + Math.sin(a * 1.3) * 80, 5); c.fill(); }
    } };
  F.fairyring = { w: 360, h: 120, tags: ['fairy', 'ring', 'dance'], slots: [[0, -10], [-220, 10]],
    draw(c, t, f) {
      for (let i = 0; i < 12; i++) { const a = (i / 12) * PT.TAU; const x = Math.cos(a) * 160, y = -40 + Math.sin(a) * 40; G.rr(c, x - 4, y - 14, 8, 14, 3); G.fillO(c, '#fff4e2', 1.5); G.ell(c, x, y - 16, 12, 7); c.fillStyle = ['#ff8fb1', '#ffd23f', '#9fd8ff'][i % 3]; c.fill(); }
      if (on(f, 'dance', t)) for (let i = 0; i < 8; i++) { const a = t * 0.003 + (i / 8) * PT.TAU; c.fillStyle = `rgba(255,240,150,${0.6 + 0.4 * Math.sin(t * 0.01 + i)})`; G.star(c, Math.cos(a) * 120, -100 + Math.sin(a) * 30, 6, 2.6); c.fill(); }
    } };
  F.bellflower = { w: 160, h: 260, tags: ['flower', 'bell', 'music'], slots: [[-110, 20], [110, 20]],
    draw(c, t, f) {
      c.strokeStyle = '#4fa96a'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-10, -140, 30, -230); c.stroke();
      const sw = on(f, 'ring', t) ? Math.sin(t * 0.02) * 0.4 : Math.sin(t * 0.002) * 0.08;
      [[30, -230], [-20, -170], [20, -120]].forEach(([x, y], i) => { c.save(); c.translate(x, y); c.rotate(sw * (i % 2 ? -1 : 1)); c.beginPath(); c.moveTo(-20, 30); c.quadraticCurveTo(-22, 0, 0, -6); c.quadraticCurveTo(22, 0, 20, 30); for (let k = 0; k < 4; k++) c.lineTo(20 - (k + 1) * 10, 30 + (k % 2 ? 0 : 6)); c.closePath(); G._bb = { x0: -22, y0: -6, x1: 22, y1: 36 }; G.fillO(c, ['#9fd8ff', '#c9b2ff', '#ffb3c8'][i], 2.5); c.restore(); });
      for (const [x, y, a] of [[-14, -60, -0.6], [10, -90, 0.6]]) { G.ell(c, x, y, 24, 9, a); c.fillStyle = '#5cbf5a'; c.fill(); }
    } };
  /* ---------- 45 レストラン ---------- */
  F.pizzaoven = { w: 260, h: 280, tags: ['oven', 'kitchen', 'pizza'], slots: [[-170, 20], [170, 20]],
    draw(c, t, f) {
      G.rr(c, -120, -120, 240, 120, 10); G.fillO(c, '#c9645a', 3);
      c.beginPath(); c.moveTo(-120, -110); c.bezierCurveTo(-120, -300, 120, -300, 120, -110); c.closePath(); G._bb = { x0: -120, y0: -260, x1: 120, y1: -110 }; G.fillO(c, '#d97a5a', 4);
      c.strokeStyle = 'rgba(120,50,40,.3)'; c.lineWidth = 2; for (let y = -240; y < -110; y += 26) { c.beginPath(); c.moveTo(-120, y); c.lineTo(120, y); c.stroke(); }
      G.rr(c, -60, -190, 120, 80, 40); c.fillStyle = '#2a1a1a'; c.fill();
      for (let i = 0; i < 4; i++) { G.ell(c, -30 + i * 20, -130 - Math.abs(Math.sin(t * 0.015 + i)) * 16, 10, 22); c.fillStyle = on(f, 'bake', t) ? ['#ff6f3d', '#ffd23f'][i % 2] : 'rgba(255,111,61,.5)'; c.fill(); }
      G.rr(c, 50, -300, 40, 70, 6); G.fillO(c, '#8a5a3a', 3);
    } };
  F.sushibelt = { w: 560, h: 150, tags: ['sushi', 'food', 'conveyor'], slots: [[-320, 20], [320, 20]],
    draw(c, t, f) {
      G.rr(c, -280, -90, 560, 90, 14); G.fillO(c, '#a8733f', 3); G.rr(c, -270, -110, 540, 26, 12); G.fillO(c, '#c9ccd8', 2.5);
      const sp = on(f, 'run', t) ? 0.12 : 0.03;
      for (let i = 0; i < 6; i++) { const x = -250 + ((t * sp + i * 90) % 520); G.ell(c, x, -110, 26, 8); G.fillO(c, ['#ff6f91', '#58b9f0', '#ffd23f'][i % 3], 2); G.rr(c, x - 16, -128, 32, 14, 6); c.fillStyle = '#ffffff'; c.fill(); G.rr(c, x - 16, -136, 32, 10, 5); c.fillStyle = ['#ff8a65', '#ffb04a', '#ff6f91', '#7bd36a'][i % 4]; c.fill(); }
    } };
  F.chefpot = { w: 200, h: 220, tags: ['pot', 'kitchen', 'cook'], slots: [[-130, 20], [130, 20]],
    draw(c, t, f) {
      G.rr(c, -90, -90, 180, 90, 10); G.fillO(c, '#e8eef5', 3); for (const x of [-50, 50]) { G.circ(c, x, -96, 26); c.fillStyle = '#3a3550'; c.fill(); }
      G.rr(c, -80, -180, 160, 90, 14); G.fillO(c, '#9aa3b8', 3); G.ell(c, 0, -180, 80, 14); G.fillO(c, '#c9ccd8', 2.5);
      const hot = on(f, 'cook', t); for (let i = 0; i < (hot ? 5 : 2); i++) { const k = ((t * 0.0006 * (hot ? 2 : 1) + i * 0.2) % 1); G.circ(c, -40 + i * 20 + k * 10, -190 - k * 80, 10 + k * 10); c.fillStyle = `rgba(255,255,255,${0.8 * (1 - k)})`; c.fill(); }
    } };
  /* ---------- 46 えいがかん ---------- */
  F.screenF = { w: 900, h: 400, wall: true, tags: ['screen', 'movie'], slots: [],
    draw(c, t, f) {
      G.rr(c, -450, -400, 900, 380, 10); G.fillO(c, '#3a2a3a', 4);
      G.rr(c, -420, -380, 840, 330, 6); c.fillStyle = on(f, 'play', t) ? '#bfe6ff' : '#f6f6f6'; c.fill();
      if (on(f, 'play', t)) {
        const k = prog(f, 'play', t, 6000), scene = f.scene || 0;
        c.save(); G.rr(c, -420, -380, 840, 330, 6); c.clip();
        if (scene === 0) { c.fillStyle = '#7bd36a'; c.fillRect(-420, -110, 840, 60); c.save(); c.translate(-400 + k * 800, -110); c.scale(1.4, 1.4); PT.ITEMS.dino && PT.ITEMS.dino.draw(c, t, {}); c.restore(); }
        else if (scene === 1) { c.fillStyle = '#1a2a5a'; c.fillRect(-420, -380, 840, 330); c.save(); c.translate(-200 + k * 300, -60 - k * 300); c.scale(1.2, 1.2); PT.ITEMS.airplane && PT.ITEMS.airplane.draw(c, t, {}); c.restore(); }
        else { c.save(); c.translate(0, -100); c.rotate(Math.sin(k * 20) * 0.2); c.scale(1.6, 1.6); PT.ITEMS.teddy && PT.ITEMS.teddy.draw(c, t, {}); c.restore(); }
        c.restore();
      } else { c.fillStyle = '#c9ccd8'; c.font = `900 50px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('タップで じょうえい', 0, -200); }
      for (const s of [-1, 1]) { c.fillStyle = '#c0304a'; c.beginPath(); c.moveTo(s * 450, -400); c.quadraticCurveTo(s * 400, -200, s * 450, -20); c.lineTo(s * 470, -20); c.lineTo(s * 470, -400); c.closePath(); c.fill(); }
    } };
  F.popcorn = { w: 160, h: 260, tags: ['popcorn', 'food', 'machine'], slots: [[-110, 20], [110, 20]],
    draw(c, t, f) {
      G.rr(c, -60, -100, 120, 100, 8); G.fillO(c, '#e2433b', 3);
      G.rr(c, -70, -230, 140, 130, 10); c.fillStyle = 'rgba(255,250,230,.8)'; c.fill(); c.strokeStyle = '#e2433b'; c.lineWidth = 4; c.stroke();
      const hot = on(f, 'pop', t); c.fillStyle = '#fff8d6'; for (let i = 0; i < 26; i++) { const x = -56 + ((i * 37) % 112), y = -110 - ((i * 13) % 50) - (hot ? Math.abs(Math.sin(t * 0.02 + i)) * 40 : 0); G.circ(c, x, y, 7); c.fill(); }
      G.rr(c, -76, -250, 152, 26, 8); G.fillO(c, '#e2433b', 3); c.fillStyle = '#ffffff'; c.font = `900 20px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('ポップコーン', 0, -230);
    } };
  F.cinemaseat = { w: 360, h: 120, tags: ['seat', 'movie'], slots: [[-120, -50], [0, -50], [120, -50]],
    draw(c) { for (const x of [-120, 0, 120]) { G.rr(c, x - 50, -110, 100, 70, 16); G.fillO(c, '#c0304a', 3); G.rr(c, x - 56, -50, 112, 30, 10); G.fillO(c, '#a8283a', 3); } } };
  /* ---------- 47 おばけやしき ---------- */
  F.closet = { w: 180, h: 300, tags: ['closet', 'ghost'], slots: [[-120, 20], [120, 20]],
    draw(c, t, f) {
      G.rr(c, -80, -300, 160, 300, 8); G.fillO(c, '#6a4a5a', 4);
      const k = on(f, 'boo', t) ? Math.min(1, prog(f, 'boo', t, 1800) * 4) : 0;
      c.save(); c.translate(-76, 0); c.scale(1 - k * 0.8, 1); G.rr(c, 0, -290, 76, 280, 4); G.fillO(c, '#8a6a7a', 3); c.restore();
      c.save(); c.translate(76, 0); c.scale(1 - k * 0.8, 1); G.rr(c, -76, -290, 76, 280, 4); G.fillO(c, '#8a6a7a', 3); c.restore();
      if (k > 0) { const y = -170 - Math.sin(k * Math.PI / 2) * 20; c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-40, y + 70); c.lineTo(-40, y); c.arc(0, y, 40, Math.PI, 0); c.lineTo(40, y + 70); c.closePath(); c.fill(); c.fillStyle = '#2a1f35'; G.ell(c, -14, y - 4, 7, 10); c.fill(); G.ell(c, 14, y - 4, 7, 10); c.fill(); G.ell(c, 0, y + 26, 12, 14); c.fill(); }
      for (const x of [-12, 12]) { G.circ(c, x, -150, 6); G.fillO(c, '#f5c242', 2); }
    } };
  F.portraits = { w: 360, h: 200, wall: true, tags: ['portrait', 'ghost'], slots: [],
    draw(c, t, f) {
      [[-110, '#7a9a8a'], [110, '#9a7a8a']].forEach(([x, bgc], i) => { G.rr(c, x - 70, -200, 140, 170, 8); G.fillO(c, '#c99a22', 4); G.rr(c, x - 56, -186, 112, 142, 4); c.fillStyle = bgc; c.fill(); G.circ(c, x, -130, 34); c.fillStyle = '#f0d0b0'; c.fill(); const look = on(f, 'look', t) ? Math.sin(t * 0.01) * 6 : (i ? 3 : -3); c.fillStyle = '#ffffff'; G.circ(c, x - 12, -136, 7); c.fill(); G.circ(c, x + 12, -136, 7); c.fill(); c.fillStyle = '#2a1f35'; G.circ(c, x - 12 + look, -136, 3.5); c.fill(); G.circ(c, x + 12 + look, -136, 3.5); c.fill(); c.strokeStyle = '#2a1f35'; c.lineWidth = 2; c.beginPath(); c.arc(x, -118, 8, 0.2, Math.PI - 0.2); c.stroke(); });
    } };
  F.candelabra = { w: 160, h: 260, tags: ['candle', 'light', 'ghost'], slots: [[-110, 20], [110, 20]],
    draw(c, t, f) {
      G.ell(c, 0, -6, 40, 10); G.fillO(c, '#c99a22', 2.5); G.rr(c, -6, -160, 12, 150, 4); G.fillO(c, '#f5c242', 2);
      c.strokeStyle = '#f5c242'; c.lineWidth = 6; c.beginPath(); c.moveTo(-60, -170); c.quadraticCurveTo(-60, -130, 0, -130); c.quadraticCurveTo(60, -130, 60, -170); c.stroke();
      const out = on(f, 'out', t);
      for (const x of [-60, 0, 60]) { const y = x ? -170 : -180; G.rr(c, x - 8, y - 40, 16, 40, 3); G.fillO(c, '#fff8e8', 2); if (!out) { G.ell(c, x, y - 52, 6, 12); c.fillStyle = '#ffd23f'; c.fill(); G.ell(c, x, y - 48, 3, 6); c.fillStyle = '#ffffff'; c.fill(); } else { c.fillStyle = 'rgba(200,200,220,.6)'; G.circ(c, x + 4, y - 56, 6); c.fill(); } }
    } };
  /* ---------- 48 カーニバル ---------- */
  F.paradefloat = { w: 420, h: 340, tags: ['parade', 'float', 'music'], slots: [[0, -110], [-260, 20]],
    draw(c, t, f) {
      const k = prog(f, 'go', t, 5000), dx = k >= 0 ? Math.sin(k * Math.PI * 2) * 320 : 0;
      c.save(); c.translate(dx, 0);
      G.rr(c, -200, -110, 400, 90, 20); G.fillO(c, '#ff8fb1', 4); for (const x of [-150, 150]) { G.circ(c, x, -18, 26); G.fillO(c, '#3a3550', 3); }
      c.fillStyle = '#ffd23f'; for (let x = -180; x < 200; x += 40) { G.star(c, x, -66, 10, 4.4); c.fill(); }
      G.rr(c, -120, -220, 240, 110, 30); G.fillO(c, '#9fd8ff', 3); G.heart(c, 0, -170, 40); G.fillO(c, '#ff5d78', 3);
      for (let i = 0; i < 5; i++) { const x = -160 + i * 80; c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, -220); c.lineTo(x + Math.sin(t * 0.004 + i) * 8, -300); c.stroke(); G.ell(c, x + Math.sin(t * 0.004 + i) * 8, -316, 16, 20); G.fillO(c, ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a', '#9b8cff'][i], 2); }
      c.restore();
    } };
  F.fwlauncher = { w: 220, h: 160, tags: ['firework', 'launcher'], slots: [[-140, 20], [140, 20]],
    draw(c, t, f) {
      G.rr(c, -100, -70, 200, 70, 10); G.fillO(c, '#3a3550', 4);
      for (let i = 0; i < 5; i++) { const x = -80 + i * 40; G.rr(c, x - 12, -130, 24, 70, 6); G.fillO(c, ['#ff5d78', '#ffd23f', '#58b9f0', '#7bd36a', '#9b8cff'][i], 2.5); c.strokeStyle = '#ffd23f'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, -130); c.quadraticCurveTo(x + 4, -140, x, -148); c.stroke(); }
    } };
  F.confettiF = { w: 180, h: 200, tags: ['confetti', 'party'], slots: [[-120, 20], [120, 20]],
    draw(c, t, f) {
      const k = on(f, 'pop', t) ? Math.sin(Math.min(1, prog(f, 'pop', t, 800) * 3) * Math.PI) * 12 : 0;
      c.save(); c.translate(0, -60); c.rotate(-0.5); c.beginPath(); c.moveTo(-50, 30); c.lineTo(60 + k, -40); c.lineTo(70 + k, 20); c.closePath(); G._bb = { x0: -50, y0: -40, x1: 70, y1: 30 }; G.fillO(c, '#ff6f91', 3); c.fillStyle = '#ffd23f'; for (let i = 0; i < 4; i++) c.fillRect(-30 + i * 22, -10 + i * -6, 8, 26); c.restore();
      G.rr(c, -50, -30, 100, 30, 8); G.fillO(c, '#58b9f0', 3);
    } };

  /* ================= ステージ ================= */
  const S = (o) => PT.STAGES.push(o);
  const stars = (c, r, n, y1) => B.stars(c, r, n, y1);
  S({ id: 'concert', num: 37, name: 'キラキラ コンサート', bgm: 'fun', floor: [600, 880], color: '#ab47bc', night: true,
    tools: ['music', 'drum', 'guitar', 'trumpet', 'tambourine', 'maracas', 'xylophone', 'mirrorball', 'confetti', 'balloon', 'starglasses'], rides: ['car'],
    spawn: [['sakura', 600, 780], ['mimi', 820, 760], ['choco', 1020, 800], ['yume', 420, 800], ['papa', 1240, 800]],
    fixtures: [['spotlights', 800, 260], ['micstand', 800, 700], ['drumset', 360, 700]], favs: ['guitar', 'drum', 'tambourine', 'mirrorball', 'starglasses', 'trumpet'],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 600, [[0, '#1a1040'], [1, '#4a2a7a']]); c.fillRect(0, 0, W, 600); stars(c, r, 40, 200);
      G.rr(c, 200, 120, 1200, 40, 10); G.fillO(c, '#c99a22', 3);
      for (const s of [-1, 1]) { c.fillStyle = '#c0304a'; c.beginPath(); const x = 800 + s * 800; c.moveTo(x, 0); c.quadraticCurveTo(x - s * 200, 300, x - s * 100, 600); c.lineTo(x, 600); c.closePath(); c.fill(); }
      for (let i = 0; i < 12; i++) { const x = 80 + i * 130; G.circ(c, x, 140, 10); c.fillStyle = ['#ff6f91', '#ffd23f', '#58b9f0'][i % 3]; c.fill(); }
      c.fillStyle = '#3a2a5a'; c.fillRect(0, 600, W, H - 600); G.rr(c, 200, 600, 1200, 60, 10); G.fillO(c, '#6a4a8a', 3);
      c.fillStyle = 'rgba(255,255,255,.08)'; for (let x = 0; x < W; x += 60) { G.circ(c, x + 30, 760 + (x % 120 ? 20 : 0), 30); c.fill(); }
    } });
  S({ id: 'arcade', num: 38, name: 'ゲームセンター', bgm: 'fun', floor: [600, 880], color: '#29b6f6',
    tools: ['ball', 'teddy', 'bunny', 'panda', 'penguin', 'elephant', 'candy', 'juice', 'camera', 'phone'], rides: ['car', 'airplane', 'horse'],
    spawn: [['yuto', 600, 780], ['pon', 820, 760], ['nyan', 1020, 800], ['sakura', 420, 800], ['lulu', 1240, 800]],
    fixtures: [['clawmachine', 260, 650], ['whack', 800, 720], ['photobooth', 1330, 650]], favs: ['teddy', 'panda', 'camera', 'candy'],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 600, [[0, '#2a2050'], [1, '#4a3a8a']]); c.fillRect(0, 0, W, 600);
      for (let i = 0; i < 8; i++) { const x = 40 + i * 200; G.rr(c, x, 220, 120, 380, 10); G.fillO(c, ['#ff6f91', '#58b9f0', '#ffd23f', '#7bd36a'][i % 4], 3); G.rr(c, x + 14, 250, 92, 80, 6); c.fillStyle = '#1a1a2a'; c.fill(); c.fillStyle = ['#ff6f91', '#7bd36a', '#ffd23f'][i % 3]; G.star(c, x + 60, 290, 16, 7); c.fill(); }
      c.strokeStyle = '#ff6fd0'; c.lineWidth = 8; c.shadowColor = '#ff6fd0'; c.shadowBlur = 0; G.rr(c, 560, 80, 480, 90, 30); c.stroke(); c.fillStyle = '#ffe066'; c.font = `900 50px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('GAME!', 800, 145);
      c.fillStyle = '#3a3060'; c.fillRect(0, 600, W, H - 600); for (let x = 0; x < W; x += 80) for (let y = 610; y < H; y += 80) { c.fillStyle = ((x + y) / 80) % 2 ? '#4a4080' : '#3a3060'; c.fillRect(x, y, 80, 80); }
    } });
  S({ id: 'skate', num: 39, name: 'スケートリンク', bgm: 'title', floor: [590, 880], color: '#4fc3f7',
    tools: ['juice', 'cookie', 'snow', 'snowman', 'blanket', 'camera', 'santa', 'icecream'], rides: ['tricycle', 'car'],
    spawn: [['penta', 600, 780], ['pyoko', 820, 760], ['sakura', 1020, 800], ['baba', 420, 800], ['lulu', 1240, 800]],
    fixtures: [['rink', 800, 840], ['cocoastand', 260, 660], ['snowglobe', 1340, 680]], favs: ['snow', 'santa', 'juice', 'cookie'],
    ambient: (c, t) => { c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 30; i++) { const x = ((i * 137 + t * 0.015) % (W + 40)) - 20, y = ((i * 89 + t * 0.03) % (H + 20)) - 10; G.circ(c, x, y, 2 + (i % 2)); c.fill(); } },
    bg(c, r) {
      B.sky(c, '#bfe0ff', '#f4f9ff', 590);
      for (let i = 0; i < 9; i++) { const x = 60 + i * 190; B.pine(c, x, 580, 0.8 + (i % 3) * 0.15, '#4f8a74'); c.fillStyle = '#ffffff'; G.ell(c, x, 520, 26, 6); c.fill(); }
      B.lanterns(c, 0, 90, 800, 110, 50); B.lanterns(c, 800, 110, 1600, 90, 50);
      c.fillStyle = G.grad(c, 0, 580, 0, H, [[0, '#ffffff'], [1, '#e3eefb']]); c.fillRect(0, 580, W, H - 580);
    } });
  S({ id: 'fishing', num: 40, name: 'のんびり つりぼり', bgm: 'park', floor: [590, 880], color: '#26a69a',
    tools: ['fishingrod', 'bucket', 'bugnet', 'onigiri', 'juice', 'sheet', 'parasol', 'camera', 'duck', 'magnifier'], rides: ['boat', 'swimring', 'tent'],
    spawn: [['jiji', 600, 780], ['kon', 820, 760], ['penta', 1020, 800], ['yuto', 420, 800], ['moko', 1240, 800]],
    fixtures: [['pondF', 800, 860], ['dock', 1240, 760], ['frogpad', 300, 760]], favs: ['fishingrod', 'bucket', 'duck', 'onigiri'],
    bg(c, r) {
      B.sky(c, '#9fd8ff', '#eaf8ff', 570); B.cloud(c, 200, 100, 1); B.cloud(c, 1000, 80, 0.8);
      c.fillStyle = '#b5e3a2'; G.ell(c, 400, 570, 600, 140); c.fill(); G.ell(c, 1250, 570, 600, 160); c.fill();
      for (let i = 0; i < 8; i++) B.tree(c, 80 + i * 210, 570, 0.7 + r() * 0.3, i % 2 ? '#79c26a' : '#5fae58');
      B.grass(c, 566, '#a6d98a', '#86c46a'); B.tufts(c, r, 580, 50, '#6fb85e'); B.flowers(c, r, 600, 20);
    } });
  S({ id: 'airport', num: 41, name: 'ブーン くうこう', bgm: 'shop', floor: [600, 880], color: '#42a5f5',
    tools: ['bag', 'camera', 'juice', 'onigiri', 'bread', 'teddy', 'sunglasses', 'phone', 'book', 'ticket'], rides: ['airplane', 'bus', 'car'],
    spawn: [['lulu', 600, 780], ['mama', 820, 760], ['papa', 1020, 800], ['futan', 420, 800], ['ricky', 1240, 820]],
    fixtures: [['planeF', 760, 640], ['carousel2', 260, 780], ['tower', 1400, 620]], favs: ['bag', 'airplane', 'sunglasses', 'camera'],
    bg(c, r) {
      B.sky(c, '#8fd3ff', '#eaf8ff', 520); B.cloud(c, 200, 100, 1.1); B.cloud(c, 900, 70, 0.9); B.cloud(c, 1350, 130, 0.8);
      c.fillStyle = '#9aa3b8'; c.fillRect(0, 500, W, 100); c.fillStyle = '#ffffff'; for (let x = 0; x < W; x += 140) c.fillRect(x, 546, 80, 8);
      G.rr(c, 0, 360, 600, 150, 10); G.fillO(c, '#e8eef5', 3); c.fillStyle = '#7fd0ff'; for (let x = 20; x < 580; x += 60) c.fillRect(x, 390, 40, 60);
      c.fillStyle = '#d8dce6'; c.fillRect(0, 600, W, H - 600); c.fillStyle = '#c8ccd8'; for (let x = 0; x < W; x += 100) for (let y = 620; y < H; y += 100) c.fillRect(x + ((y / 100) % 2) * 50, y, 48, 48);
    } });
  S({ id: 'station2', num: 42, name: 'うちゅうステーション', bgm: 'night', floor: [600, 880], color: '#3949ab', night: true, lowGravity: true,
    tools: ['helmet', 'robotsuit', 'star', 'moon', 'flashlight', 'camera', 'robottoy', 'juice', 'magnifier'], rides: ['airplane', 'car', 'trampoline'],
    spawn: [['gaku', 600, 780], ['lulu', 820, 760], ['penta', 1020, 800], ['yuto', 420, 800], ['kon', 1240, 800]],
    fixtures: [['launchpad', 280, 660], ['zerog', 800, 700], ['ufo', 1300, 360]], favs: ['helmet', 'robotsuit', 'star', 'moon'],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 600, [[0, '#0a0a30'], [1, '#2a2a6a']]); c.fillRect(0, 0, W, 600); stars(c, r, 160, 600);
      c.fillStyle = 'rgba(255,170,230,.15)'; G.ell(c, 400, 200, 400, 80, -0.2); c.fill();
      G.rr(c, 0, 420, W, 30, 6); G.fillO(c, '#9aa3b8', 3); for (let x = 60; x < W; x += 260) { G.rr(c, x, 300, 140, 120, 60); c.fillStyle = 'rgba(160,220,255,.4)'; c.fill(); c.strokeStyle = '#c9ccd8'; c.lineWidth = 8; c.stroke(); }
      c.fillStyle = '#b9c4d8'; c.fillRect(0, 600, W, H - 600); c.strokeStyle = '#9aa3b8'; c.lineWidth = 4; for (let x = 0; x < W; x += 120) { c.beginPath(); c.moveTo(x, 600); c.lineTo(x, H); c.stroke(); }
    } });
  S({ id: 'moon', num: 43, name: 'つきの うさぎ', bgm: 'night', floor: [600, 880], color: '#5c6bc0', night: true, lowGravity: true,
    tools: ['donut', 'marshmallow', 'cookie', 'juice', 'moon', 'star', 'helmet', 'flashlight', 'bunny', 'camera'], rides: ['trampoline', 'car'],
    spawn: [['pyoko', 600, 780], ['lulu', 820, 760], ['yume', 1020, 800], ['baba', 420, 800], ['mimi', 1240, 800]],
    fixtures: [['mochiusu', 300, 720], ['crater2', 840, 800], ['earthview', 1300, 380]], favs: ['bunny', 'moon', 'helmet', 'donut'],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 600, [[0, '#0a0a30'], [1, '#2a2a5a']]); c.fillRect(0, 0, W, 600); stars(c, r, 140, 560);
      c.fillStyle = G.grad(c, 0, 580, 0, H, [[0, '#e8e2c8'], [1, '#c9c2a8']]); c.beginPath(); c.moveTo(0, 610); for (let x = 0; x <= W; x += 100) c.quadraticCurveTo(x + 50, 580 + Math.sin(x) * 14, x + 100, 600); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
      c.fillStyle = 'rgba(160,150,120,.5)'; for (let i = 0; i < 14; i++) { G.ell(c, r() * W, 650 + r() * 220, 20 + r() * 40, 7 + r() * 10); c.fill(); }
    } });
  S({ id: 'fairy', num: 44, name: 'ようせいの くに', bgm: 'title', floor: [590, 880], color: '#f06292',
    tools: ['wand', 'wings', 'flowercrown', 'tiara_flower', 'petals', 'musicbox', 'flower', 'bugnet', 'heartwand', 'starwand'], rides: ['unicorn', 'carpet'],
    spawn: [['yume', 600, 780], ['pyoko', 820, 760], ['sakura', 1020, 800], ['choco', 420, 800], ['mimi', 1240, 800]],
    fixtures: [['mushhouse', 300, 650], ['fairyring', 820, 800], ['bellflower', 1340, 650]], favs: ['wings', 'flowercrown', 'heartwand', 'starwand', 'petals'],
    bg(c, r) {
      B.sky(c, '#c9b2ff', '#ffe9f4', 590);
      for (let i = 0; i < 10; i++) { const x = r() * W; G.ell(c, x, 590, 120, 40); c.fillStyle = 'rgba(255,255,255,.4)'; c.fill(); }
      for (let i = 0; i < 9; i++) B.tree(c, 40 + i * 190, 590, 0.9 + r() * 0.4, ['#7fd0a0', '#c9b2ff', '#ffb3c8'][i % 3], '#9a7a8a');
      B.grass(c, 586, '#a6e0b0', '#8ad0a0'); B.flowers(c, r, 600, 70);
      c.fillStyle = 'rgba(255,240,150,.8)'; for (let i = 0; i < 30; i++) { G.circ(c, r() * W, 100 + r() * 500, 2 + r() * 3); c.fill(); }
    } });
  S({ id: 'restaurant', num: 45, name: 'わいわい レストラン', bgm: 'shop', floor: [590, 880], color: '#ef6c00',
    tools: ['pizza', 'burger', 'onigiri', 'bento', 'pancake', 'juice', 'cake', 'plate', 'table', 'chair', 'chef', 'apron'], rides: ['car', 'tricycle'],
    spawn: [['moko', 600, 780], ['mimi', 820, 760], ['mama', 1020, 800], ['pon', 420, 800], ['jiji', 1240, 800]],
    fixtures: [['pizzaoven', 260, 660], ['sushibelt', 820, 760], ['chefpot', 1360, 680]], favs: ['chef', 'apron', 'pizza', 'burger', 'plate'],
    bg(c, r) {
      B.wallpaper(c, 590, '#fff4e4', '#ffe9d0');
      G.rr(c, 560, 200, 480, 80, 30); G.fillO(c, '#ef6c00', 4); c.fillStyle = '#ffffff'; c.font = `900 46px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('レストラン', 800, 256);
      for (const x of [300, 1300]) B.window(c, x - 120, 220, 240, 180, (c2, xx, y, w, h) => { B.sky(c2, '#9fd8ff', '#e3f6ff', y + h); B.cloud(c2, xx + 40, y + 50, 0.6); });
      for (let i = 0; i < 6; i++) { const x = 140 + i * 260; c.strokeStyle = '#8a7a6a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 60); c.stroke(); c.beginPath(); c.moveTo(x - 24, 84); c.quadraticCurveTo(x, 50, x + 24, 84); c.closePath(); G._bb = null; c.fillStyle = '#ffd76a'; c.fill(); }
      B.floorWood(c, 590, '#c99a64');
      c.fillStyle = 'rgba(255,255,255,.25)'; for (let x = 0; x < W; x += 80) for (let y = 610; y < H; y += 80) if (((x + y) / 80) % 2) c.fillRect(x, y, 80, 80);
    } });
  S({ id: 'cinema', num: 46, name: 'わくわく えいがかん', bgm: 'night', floor: [620, 880], color: '#6d4c41', night: true,
    tools: ['juice', 'icecream', 'candy', 'sunglasses', 'heartglasses', 'teddy', 'camera', 'ticket', 'blanket'], rides: ['car'],
    spawn: [['lulu', 600, 800], ['mimi', 820, 790], ['pon', 1020, 810], ['ricky', 420, 820], ['sakura', 1240, 810]],
    fixtures: [['screenF', 800, 520], ['popcorn', 200, 700], ['cinemaseat', 800, 860]], favs: ['heartglasses', 'sunglasses', 'juice', 'icecream'],
    bg(c, r) {
      c.fillStyle = G.grad(c, 0, 0, 0, 620, [[0, '#2a1a2a'], [1, '#4a2a3a']]); c.fillRect(0, 0, W, 620);
      for (let i = 0; i < 10; i++) { G.circ(c, 80 + i * 160, 60, 8); c.fillStyle = 'rgba(255,230,150,.8)'; c.fill(); }
      c.fillStyle = '#5a2a3a'; c.fillRect(0, 620, W, H - 620); c.fillStyle = 'rgba(255,255,255,.06)'; for (let x = 0; x < W; x += 50) c.fillRect(x, 620, 25, H - 620);
    } });
  S({ id: 'ghosthouse', num: 47, name: 'ドキドキ おばけやしき', bgm: 'night', floor: [600, 880], color: '#4a148c', night: true,
    tools: ['flashlight', 'blanket', 'jackolantern', 'candybag', 'blackcat', 'owl', 'crystalball', 'teddy', 'witchblack'], rides: ['magicbroom'],
    spawn: [['pon', 600, 780], ['nyan', 820, 760], ['gaku', 1020, 800], ['futan', 420, 800], ['kon', 1240, 800]],
    fixtures: [['closet', 300, 650], ['portraits', 820, 420], ['candelabra', 1300, 680]], favs: ['flashlight', 'blanket', 'jackolantern', 'witchcape'],
    bg(c, r) {
      B.wallpaper(c, 600, '#4a3a5a', '#3a2a4a');
      for (const x of [600, 1040]) { B.window(c, x - 80, 120, 160, 220, (c2, xx, y, w, h) => { c2.fillStyle = '#1a1a40'; c2.fillRect(xx, y, w, h); c2.fillStyle = '#fff3b0'; G.circ(c2, xx + w * 0.6, y + 60, 26); c2.fill(); }); }
      c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 1.5; for (const [x, y] of [[80, 60], [1500, 80]]) { for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(i) * 80, y + Math.sin(i) * 80); c.stroke(); } for (let k = 1; k < 4; k++) { c.beginPath(); c.arc(x, y, k * 22, 0, PT.TAU); c.stroke(); } }
      B.floorWood(c, 600, '#6a4a5a');
    } });
  S({ id: 'carnival', num: 48, name: 'カーニバル パレード', bgm: 'fest', floor: [590, 880], color: '#ff7043',
    tools: ['balloon', 'confetti', 'firework', 'drum', 'trumpet', 'partyhat', 'icecream', 'candy', 'juice', 'mirrorball'], rides: ['carriage', 'horse', 'bus', 'unicorn'],
    spawn: [['lulu', 600, 780], ['pon', 820, 760], ['mimi', 1020, 800], ['choco', 420, 800], ['papa', 1240, 800], ['ricky', 920, 840]],
    fixtures: [['paradefloat', 800, 720], ['fwlauncher', 240, 760], ['confettiF', 1380, 740]], favs: ['partyhat', 'balloon', 'confetti', 'trumpet', 'drum'],
    bg(c, r) {
      B.sky(c, '#5a4aa8', '#ffb07a', 580); stars(c, r, 30, 200);
      for (let i = 0; i < 7; i++) { const x = i * 250 - 40; B.house(c, x, 570, 200, 180 + (i % 3) * 30, ['#fff1dc', '#e3f1ff', '#ffe3ec'][i % 3], ['#ff6f61', '#58b9f0', '#ffd23f'][i % 3]); }
      B.bunting(c, 0, 60, 800, 70, 60); B.bunting(c, 800, 70, 1600, 60, 60); B.lanterns(c, 0, 160, 1600, 160, 80);
      c.fillStyle = G.grad(c, 0, 580, 0, H, [[0, '#e8d6c0'], [1, '#d4bea4']]); c.fillRect(0, 580, W, H - 580);
      for (let i = 0; i < 60; i++) { c.fillStyle = ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a'][i % 4]; c.save(); c.translate(r() * W, 600 + r() * 280); c.rotate(r() * 6); c.fillRect(-6, -3, 12, 6); c.restore(); }
    } });
})();
