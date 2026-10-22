/* のりもの（25）と おと・ふしぎ（40）の アイテムと あそび */
'use strict';
(() => {
  const G = PT.G;
  const def = (id, o) => { if (PT.ITEMS[id]) { console.error('items4: dup item', id); return; } PT.ITEMS[id] = Object.assign({ id, tags: [], w: 90, h: 90 }, o); };
  const T = (t) => t || 0;
  const wheel = (c, x, y, r, col = '#3e4a63') => { G.circ(c, x, y, r); G.fillO(c, col, 3); G.circ(c, x, y, r * 0.4); c.fillStyle = '#d0d8e6'; c.fill(); };
  const eye = (c, x, y, r = 3.4) => { G.circ(c, x, y, r); c.fillStyle = '#2b2440'; c.fill(); G.circ(c, x + r * 0.35, y - r * 0.35, r * 0.35); c.fillStyle = '#fff'; c.fill(); };
  const smile = (c, x, y, r = 6) => { c.strokeStyle = '#2b2440'; c.lineWidth = 2.5; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r, 0.2, Math.PI - 0.2); c.stroke(); };
  const cheek = (c, x, y) => { G.ell(c, x, y, 6, 4); c.fillStyle = 'rgba(255,130,150,.55)'; c.fill(); };

  /* ================= のりもの ================= */
  // dir（むき）と rot（かたむき）を のっている キャラに あわせる
  const V = (id, name, w, h, seat, draw, tags = []) => def(id, { name, cat: 'rides', tags: ['ride', 'i4ride'].concat(tags), w, h, seat,
    draw: (c, t, st) => {
      let dir = 1;
      if (st && st.rider && PT.world.byId) { const r = PT.world.byId(st.rider); if (r) dir = r.flip ? -1 : 1; } else if (st && st.dir) dir = st.dir;
      c.save(); if (dir < 0) c.scale(-1, 1); if (st && st.rot) c.rotate(st.rot);
      draw(c, T(t), st || {}); c.restore();
    } });

  V('policecar', 'パトカー', 150, 100, 26, (c, t, st) => {
    G.rr(c, -72, -52, 144, 40, 14); G.fillO(c, '#ffffff', 3);
    G.rr(c, -72, -32, 144, 16, 7); G.fillO(c, '#3e4a63', 2.5);
    G.poly(c, [30, -52, 42, -80, 48, -80, 40, -52]); G.fillO(c, '#bfe6ff', 2);
    c.strokeStyle = '#3e4a63'; c.lineWidth = 4; c.beginPath(); c.moveTo(44, -80); c.lineTo(44, -88); c.stroke();
    const on = (t / 220) % 2 < 1;
    G.rr(c, 30, -98, 14, 10, 3); G.fillO(c, on ? '#ff4d4d' : '#ffb3b3', 2); G.rr(c, 44, -98, 14, 10, 3); G.fillO(c, on ? '#9fc8f0' : '#3d7fe0', 2);
    c.fillStyle = '#ffd23f'; G.star(c, -22, -42, 8, 3.6); c.fill();
    G.circ(c, 68, -40, 5); c.fillStyle = '#ffe36a'; c.fill();
    wheel(c, -44, -12, 14); wheel(c, 46, -12, 14);
  }, ['car', 'police']);
  V('digger', 'ショベルカー', 180, 130, 34, (c, t, st) => {
    const dig = st.digT && t < st.digT ? Math.sin(t * 0.012) * 0.35 : 0;
    G.rr(c, -64, -28, 116, 26, 13); G.fillO(c, '#4a4560', 3);
    for (const x of [-48, -22, 4, 30]) { G.circ(c, x, -15, 8); c.fillStyle = '#9aa3b8'; c.fill(); }
    G.rr(c, -60, -62, 96, 36, 8); G.fillO(c, '#ffc83d', 3);
    G.rr(c, -64, -96, 10, 36, 3); G.fillO(c, '#ffc83d', 2); G.rr(c, -70, -102, 40, 8, 3); G.fillO(c, '#ff9a3d', 2);
    c.save(); c.translate(30, -56); c.rotate(-0.5 + dig);
    c.strokeStyle = '#e0a020'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(52, -30); c.lineTo(78, 18); c.stroke();
    c.translate(78, 18); c.rotate(0.6 - dig); G.poly(c, [-6, -8, 22, -6, 26, 18, 6, 22, -8, 8]); G.fillO(c, '#9aa3b8', 3);
    c.restore();
  }, ['car', 'work']);
  V('dumptruck', 'ダンプカー', 180, 110, 36, (c, t, st) => {
    const tip = st.tipT && t < st.tipT ? Math.min(1, (st.tipT - t) / 600, (t - (st.tipT - 2400)) / 600) * 0.55 : 0;
    wheel(c, -50, -14, 15); wheel(c, 54, -14, 15);
    G.rr(c, -78, -34, 160, 14, 5); G.fillO(c, '#4a4560', 2.5);
    G.rr(c, 36, -84, 46, 52, 9); G.fillO(c, '#ff9a3d', 3); G.rr(c, 50, -78, 26, 20, 4); G.fillO(c, '#d9f1ff', 2);
    c.save(); c.translate(-74, -34); c.rotate(-tip);
    G.poly(c, [0, 0, 104, 0, 108, -46, -4, -46]); G.fillO(c, '#ffd23f', 3);
    c.fillStyle = 'rgba(200,140,40,.35)'; c.fillRect(8, -38, 92, 6);
    c.restore();
  }, ['car', 'work']);
  V('bullettrain', 'しんかんせん', 220, 90, 30, (c, t) => {
    G.blob(c, [-104, -12, -104, -66, 30, -68, 92, -40, 108, -16, 100, -12]); G.fillO(c, '#ffffff', 3);
    c.fillStyle = '#3d7fe0'; c.fillRect(-102, -32, 196, 7); c.fillStyle = '#9fc8f0'; c.fillRect(-102, -24, 200, 3);
    for (let i = 0; i < 4; i++) { G.rr(c, -94 + i * 22, -56, 14, 14, 4); c.fillStyle = '#bfe6ff'; c.fill(); }
    G.poly(c, [44, -60, 74, -46, 50, -44]); G.fillO(c, '#3e4a63', 2);
    for (const x of [-80, -50, 40, 70]) { G.circ(c, x, -8, 7); c.fillStyle = '#3e4a63'; c.fill(); }
  }, ['train']);
  V('steamloco', 'きかんしゃ', 190, 140, 36, (c, t, st) => {
    G.rr(c, 26, -82, 70, 50, 20); G.fillO(c, '#e8424a', 3);
    G.rr(c, 70, -118, 18, 40, 4); G.fillO(c, '#3e4a63', 3); G.rr(c, 64, -124, 30, 10, 4); G.fillO(c, '#3e4a63', 2);
    G.circ(c, 96, -58, 7); c.fillStyle = '#ffe36a'; c.fill();
    G.rr(c, -46, -64, 76, 34, 6); G.fillO(c, '#58b9f0', 3);
    for (const x of [-44, 22]) { G.rr(c, x, -126, 8, 64, 3); G.fillO(c, '#3e4a63', 2); }
    G.rr(c, -56, -134, 96, 14, 6); G.fillO(c, '#e8424a', 3);
    G.rr(c, -60, -34, 162, 10, 4); G.fillO(c, '#3e4a63', 2);
    for (const x of [-36, 4, 46, 82]) { const r = x === 4 || x === 46 ? 16 : 11; G.circ(c, x, -16, r); G.fillO(c, '#4a4560', 3); G.circ(c, x, -16, r * 0.35); c.fillStyle = '#ffd23f'; c.fill(); }
    if (st.puff) for (let i = 0; i < 3; i++) { const k = ((t * 0.0012 + i / 3) % 1); G.circ(c, 80 - k * 30, -132 - k * 70, 8 + k * 14); c.fillStyle = `rgba(255,255,255,${0.9 - k * 0.8})`; c.fill(); }
  }, ['train']);
  V('helicopter', 'ヘリコプター', 200, 220, 32, (c, t, st) => {
    const sp = st.spin ? 0.06 : 0.008;
    c.strokeStyle = '#3e4a63'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-30, -2); c.lineTo(30, -2); c.moveTo(-20, -2); c.lineTo(-16, -14); c.moveTo(20, -2); c.lineTo(16, -14); c.stroke();
    G.rr(c, -112, -50, 70, 12, 6); G.fillO(c, '#ff8fb1', 2.5);
    c.save(); c.translate(-112, -46); c.rotate(t * sp * 1.4); G.rr(c, -3, -18, 6, 36, 3); c.fillStyle = '#3e4a63'; c.fill(); c.restore();
    c.lineWidth = 6; c.beginPath(); c.moveTo(-44, -50); c.quadraticCurveTo(-56, -200, 0, -204); c.stroke();
    c.beginPath(); c.moveTo(-54, -52); c.quadraticCurveTo(-58, -12, 0, -12); c.quadraticCurveTo(58, -12, 60, -52); c.closePath(); G.fillO(c, '#ff8fb1', 3);
    c.fillStyle = 'rgba(255,255,255,.6)'; G.ell(c, 30, -34, 10, 6); c.fill();
    const k = Math.abs(Math.cos(t * sp)); G.ell(c, 0, -206, 96 * (0.3 + k * 0.7), 6); G.fillO(c, '#4a4560', 2); G.circ(c, 0, -206, 6); c.fillStyle = '#ffd23f'; c.fill();
  }, ['fly']);
  V('minirocket', 'ロケット', 120, 260, 70, (c, t, st) => {
    for (const s of [-1, 1]) { G.poly(c, [s * 30, -30, s * 54, -4, s * 30, -70]); G.fillO(c, '#ff6f61', 3); }
    G.rr(c, -34, -96, 68, 80, 14); G.fillO(c, '#ffffff', 3);
    c.fillStyle = '#ff6f61'; c.fillRect(-32, -56, 64, 8);
    G.circ(c, 0, -36, 8); G.fillO(c, '#9fc8f0', 2);
    c.beginPath(); c.moveTo(-34, -94); c.quadraticCurveTo(-40, -230, 0, -250); c.quadraticCurveTo(40, -230, 34, -94); c.closePath();
    c.fillStyle = 'rgba(200,235,255,.28)'; c.fill(); c.strokeStyle = '#7fb8e8'; c.lineWidth = 3; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.6)'; G.ell(c, -18, -190, 5, 18, 0.2); c.fill();
    if (st.fire) { const f = 20 + Math.sin(t * 0.05) * 8; G.poly(c, [-16, -16, 0, 10 + f, 16, -16]); c.fillStyle = '#ffd23f'; c.fill(); G.poly(c, [-8, -16, 0, f, 8, -16]); c.fillStyle = '#ff8a3d'; c.fill(); }
  }, ['fly', 'space']);
  V('submarine', 'せんすいかん', 190, 110, 30, (c, t) => {
    G.ell(c, 0, -40, 86, 32); G.fillO(c, '#ffd23f', 3);
    G.rr(c, -24, -84, 48, 32, 8); G.fillO(c, '#ffc83d', 3);
    c.strokeStyle = '#3e4a63'; c.lineWidth = 5; c.beginPath(); c.moveTo(16, -84); c.lineTo(16, -112); c.lineTo(30, -112); c.stroke();
    for (const x of [-50, 32, 60]) { G.circ(c, x, -40, 10); G.fillO(c, '#9fdcf5', 2.5); }
    c.save(); c.translate(-88, -40); c.rotate(t * 0.01); for (let i = 0; i < 3; i++) { c.rotate(PT.TAU / 3); G.ell(c, 0, -9, 5, 9); G.fillO(c, '#ff8a3d', 2); } c.restore();
  }, ['water']);
  V('yacht', 'ヨット', 170, 190, 22, (c, t) => {
    G.poly(c, [-78, -44, 80, -44, 58, -6, -60, -6]); G.fillO(c, '#ffffff', 3);
    c.fillStyle = '#3d7fe0'; c.fillRect(-70, -30, 136, 6);
    c.strokeStyle = '#a5643a'; c.lineWidth = 5; c.beginPath(); c.moveTo(40, -44); c.lineTo(40, -184); c.stroke();
    const b = Math.sin(t * 0.003) * 6;
    c.beginPath(); c.moveTo(44, -180); c.quadraticCurveTo(88 + b, -120, 84, -54); c.lineTo(44, -54); c.closePath(); G.fillO(c, '#ff8fb1', 3);
    c.beginPath(); c.moveTo(36, -176); c.quadraticCurveTo(0 + b, -130, -4, -62); c.lineTo(36, -62); c.closePath(); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill(); c.strokeStyle = '#d6c4a8'; c.lineWidth = 2; c.stroke();
    G.poly(c, [40, -184, 60, -178, 40, -172]); G.fillO(c, '#ffd23f', 2);
  }, ['water', 'boat']);
  V('canoe', 'カヌー', 190, 80, 8, (c, t, st) => {
    c.beginPath(); c.moveTo(-92, -40); c.quadraticCurveTo(0, 6, 92, -40); c.quadraticCurveTo(0, -24, -92, -40); c.closePath(); G.fillO(c, '#e8a35c', 3);
    c.strokeStyle = '#a5643a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-70, -32); c.quadraticCurveTo(0, -6, 70, -32); c.stroke();
    const a = st.paddle ? Math.sin(t * 0.008) * 0.7 : 0.4;
    c.save(); c.translate(6, -60); c.rotate(a); c.strokeStyle = '#8a5a3a'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -40); c.lineTo(0, 50); c.stroke(); G.ell(c, 0, 58, 8, 16); G.fillO(c, '#58b9f0', 2); G.ell(c, 0, -46, 6, 12); G.fillO(c, '#58b9f0', 2); c.restore();
  }, ['water', 'boat']);
  V('hotairballoon', 'ききゅう', 170, 380, 26, (c, t) => {
    c.strokeStyle = '#8a5a3a'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-34, -46); c.lineTo(-56, -238); c.moveTo(34, -46); c.lineTo(56, -238); c.stroke();
    G.rr(c, -38, -50, 76, 46, 8); G.fillO(c, '#c99a64', 3);
    c.strokeStyle = 'rgba(120,80,40,.5)'; c.lineWidth = 2; for (let x = -30; x <= 30; x += 12) { c.beginPath(); c.moveTo(x, -48); c.lineTo(x, -8); c.stroke(); }
    const sw = Math.sin(t * 0.002) * 0.03;
    c.save(); c.translate(0, -300); c.rotate(sw);
    G.blob(c, [0, -80, 70, -40, 70, 20, 30, 64, -30, 64, -70, 20, -70, -40]); G.fillO(c, '#ff8fb1', 3);
    c.save(); G.blob(c, [0, -80, 70, -40, 70, 20, 30, 64, -30, 64, -70, 20, -70, -40]); c.clip();
    ['#ffd23f', '#7fd0e8', '#ffd23f'].forEach((col, i) => { c.fillStyle = col; c.fillRect(-48 + i * 34, -90, 14, 170); });
    c.restore();
    G.rr(c, -30, 60, 60, 10, 4); G.fillO(c, '#c99a64', 2);
    c.restore();
  }, ['fly']);
  V('gokart', 'ゴーカート', 150, 80, 12, (c, t) => {
    G.rr(c, -66, -34, 132, 22, 10); G.fillO(c, '#58c46b', 3);
    G.poly(c, [40, -34, 72, -30, 72, -14, 40, -14]); G.fillO(c, '#58c46b', 3);
    G.rr(c, -74, -62, 12, 32, 3); G.fillO(c, '#3e4a63', 2); G.rr(c, -84, -66, 30, 8, 3); G.fillO(c, '#ff6f61', 2);
    c.strokeStyle = '#3e4a63'; c.lineWidth = 5; c.beginPath(); c.moveTo(26, -32); c.lineTo(34, -56); c.stroke(); G.ell(c, 34, -58, 10, 4, 0.3); c.stroke();
    G.circ(c, -10, -24, 9); G.fillO(c, '#ffffff', 2); c.fillStyle = '#2b2440'; c.font = `900 13px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('1', -10, -19);
    wheel(c, -48, -12, 13); wheel(c, 52, -12, 13);
  }, ['car', 'race']);
  V('motorbike', 'バイク', 160, 110, 30, (c, t) => {
    wheel(c, -50, -24, 22); wheel(c, 52, -24, 22);
    G.blob(c, [-44, -40, -30, -62, 20, -66, 40, -46, 10, -34, -30, -32]); G.fillO(c, '#ff6f61', 3);
    G.rr(c, -36, -74, 44, 12, 6); G.fillO(c, '#3e4a63', 2.5);
    c.strokeStyle = '#9aa3b8'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(52, -24); c.lineTo(34, -78); c.lineTo(22, -84); c.stroke();
    G.circ(c, 44, -66, 7); G.fillO(c, '#ffe36a', 2);
    c.strokeStyle = '#9aa3b8'; c.lineWidth = 5; c.beginPath(); c.moveTo(-20, -30); c.lineTo(-64, -40); c.stroke();
  }, ['car']);
  V('kickscooter', 'キックボード', 120, 130, 12, (c, t) => {
    G.rr(c, -54, -24, 96, 12, 6); G.fillO(c, '#7fd0e8', 3);
    c.strokeStyle = '#3e4a63'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(40, -20); c.lineTo(48, -118); c.stroke();
    c.beginPath(); c.moveTo(32, -120); c.lineTo(62, -116); c.stroke();
    G.circ(c, 32, -120, 5); c.fillStyle = '#ff8fb1'; c.fill(); G.circ(c, 62, -116, 5); c.fill();
    wheel(c, -46, -8, 9); wheel(c, 44, -8, 9);
  }, ['car']);
  V('sled', 'そり', 140, 60, 14, (c, t) => {
    c.strokeStyle = '#c0392b'; c.lineWidth = 5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-64, -4); c.lineTo(52, -4); c.quadraticCurveTo(72, -4, 70, -22); c.stroke();
    for (const x of [-44, 30]) { c.beginPath(); c.moveTo(x, -4); c.lineTo(x, -20); c.stroke(); }
    G.rr(c, -64, -34, 120, 16, 6); G.fillO(c, '#e8a35c', 3);
    c.strokeStyle = 'rgba(140,90,40,.5)'; c.lineWidth = 2; for (let x = -50; x < 56; x += 18) { c.beginPath(); c.moveTo(x, -32); c.lineTo(x, -20); c.stroke(); }
  }, ['snow']);
  V('rollerskates', 'ローラースケート', 100, 60, 10, (c, t) => {
    for (const s of [-1, 1]) {
      const x = s * 18;
      G.rr(c, x - 16, -44, 22, 30, 6); G.fillO(c, s < 0 ? '#ff8fb1' : '#ffb3cf', 2.5);
      G.rr(c, x - 18, -18, 36, 10, 5); G.fillO(c, '#ffffff', 2.5);
      for (const w of [-10, 10]) { G.circ(c, x + w, -6, 6); G.fillO(c, '#ffd23f', 2); }
      c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 10, -36); c.lineTo(x + 2, -32); c.moveTo(x - 10, -28); c.lineTo(x + 2, -24); c.stroke();
    }
  }, ['skate']);
  V('elephantride', 'ぞうさん', 210, 190, 112, (c, t, st) => {
    for (const x of [-60, -24, 24, 52]) { G.rr(c, x - 12, -60, 24, 58, 8); G.fillO(c, '#a9b4cc', 3); }
    G.ell(c, -6, -88, 82, 50); G.fillO(c, '#b8c2d8', 3);
    G.rr(c, -36, -148, 64, 16, 8); G.fillO(c, '#ff6f61', 2.5); c.fillStyle = '#ffd23f'; for (let x = -30; x < 26; x += 10) { G.circ(c, x + 4, -132, 2.5); c.fill(); }
    G.circ(c, 72, -110, 38); G.fillO(c, '#b8c2d8', 3);
    G.ell(c, 52, -112, 24, 32, -0.2); G.fillO(c, '#c9d2e6', 3); G.ell(c, 52, -112, 14, 20, -0.2); c.fillStyle = '#ffc4d6'; c.fill();
    const up = st.spray && t < st.spray ? 1 : 0;
    c.strokeStyle = '#2b2440'; c.lineWidth = 3; c.lineCap = 'round';
    c.save(); c.translate(100, -100); c.rotate(up ? -1.4 : 0); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(24, 20, 14, 52); c.lineWidth = 16; c.strokeStyle = '#b8c2d8'; c.stroke(); c.restore();
    eye(c, 86, -122); cheek(c, 92, -104); c.strokeStyle = '#8a95ad'; c.lineWidth = 3; c.beginPath(); c.moveTo(-86, -92); c.quadraticCurveTo(-100, -80, -94, -64); c.stroke();
  }, ['animal']);
  V('whaleride', 'くじら', 240, 150, 74, (c, t, st) => {
    c.save(); c.translate(-104, -60); c.rotate(-0.4 + Math.sin(t * 0.004) * 0.15);
    G.blob(c, [0, 0, -30, -30, -6, -14, 0, -36, 8, -14, 30, -30]); G.fillO(c, '#58a8e8', 3); c.restore();
    G.ell(c, 6, -52, 104, 48); G.fillO(c, '#6bb8f0', 3);
    c.save(); G.ell(c, 6, -52, 104, 48); c.clip(); G.ell(c, 16, -6, 100, 30); c.fillStyle = '#e8f6ff'; c.fill(); c.strokeStyle = '#a8d4f0'; c.lineWidth = 2; for (let x = -40; x < 90; x += 16) { c.beginPath(); c.moveTo(x, -30); c.lineTo(x + 6, -4); c.stroke(); } c.restore();
    eye(c, 76, -60, 4.5); smile(c, 88, -44, 8); cheek(c, 76, -44);
    G.ell(c, 10, -16, 22, 9, 0.4); G.fillO(c, '#58a8e8', 2.5);
    if (st.spout && t < st.spout) { for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.35; c.strokeStyle = '#9fe0fb'; c.lineWidth = 6; c.beginPath(); c.moveTo(30, -100); c.quadraticCurveTo(30 + Math.cos(a) * 30, -150, 30 + Math.cos(a) * 60, -130 + Math.abs(i - 2) * 6); c.stroke(); } }
  }, ['water', 'animal']);
  V('dragonride', 'やさしい ドラゴン', 220, 190, 80, (c, t, st) => {
    const fl = Math.sin(t * (st.flap ? 0.03 : 0.004)) * 0.35;
    c.save(); c.translate(-20, -100); c.rotate(-0.5 + fl);
    G.blob(c, [0, 0, -40, -70, -10, -54, 10, -80, 20, -46, 40, -60, 30, -4]); G.fillO(c, '#ffb3cf', 3); c.restore();
    c.strokeStyle = '#7bd36a'; c.lineWidth = 18; c.lineCap = 'round'; c.beginPath(); c.moveTo(-60, -60); c.quadraticCurveTo(-110, -40, -100, -10); c.stroke();
    G.poly(c, [-108, -18, -92, -4, -114, 0]); G.fillO(c, '#ffd23f', 2);
    for (const x of [-40, 30]) { G.rr(c, x - 12, -40, 24, 38, 10); G.fillO(c, '#6cc75c', 3); }
    G.ell(c, -6, -66, 66, 42); G.fillO(c, '#7bd36a', 3);
    G.ell(c, 4, -50, 40, 22); c.fillStyle = '#fff3b8'; c.fill();
    for (let i = 0; i < 4; i++) { G.poly(c, [-40 + i * 18, -104 + Math.abs(i - 1.5) * 3, -32 + i * 18, -120, -24 + i * 18, -104]); G.fillO(c, '#ffd23f', 2); }
    c.strokeStyle = '#7bd36a'; c.lineWidth = 22; c.beginPath(); c.moveTo(40, -80); c.quadraticCurveTo(64, -110, 74, -128); c.stroke();
    G.ell(c, 84, -136, 34, 28); G.fillO(c, '#7bd36a', 3);
    for (const x of [70, 88]) { G.poly(c, [x - 5, -160, x, -178, x + 5, -160]); G.fillO(c, '#ffd23f', 2); }
    eye(c, 92, -142, 4); smile(c, 100, -128, 7); cheek(c, 82, -124);
    G.circ(c, 112, -136, 2); c.fillStyle = '#2b2440'; c.fill();
  }, ['fly', 'animal']);
  V('pandacar', 'パンダカー', 160, 140, 54, (c, t, st) => {
    const r = st.rock ? Math.sin(t * 0.012) * 0.05 : 0;
    c.save(); c.rotate(r);
    for (const x of [-46, 46]) { G.circ(c, x, -10, 10); G.fillO(c, '#3e4a63', 2.5); }
    for (const x of [-40, 34]) { G.rr(c, x - 12, -40, 24, 30, 10); G.fillO(c, '#3e3550', 3); }
    G.ell(c, -4, -60, 56, 34); G.fillO(c, '#ffffff', 3);
    G.circ(c, 58, -92, 30); G.fillO(c, '#ffffff', 3);
    for (const x of [42, 72]) { G.circ(c, x, -118, 10); G.fillO(c, '#3e3550', 2.5); }
    for (const x of [48, 68]) { G.ell(c, x, -94, 8, 10, x < 58 ? 0.4 : -0.4); c.fillStyle = '#3e3550'; c.fill(); G.circ(c, x, -94, 2.6); c.fillStyle = '#fff'; c.fill(); }
    G.ell(c, 58, -80, 5, 3.5); c.fillStyle = '#3e3550'; c.fill(); cheek(c, 44, -80); cheek(c, 74, -80);
    G.rr(c, -30, -84, 44, 12, 6); G.fillO(c, '#ff6f61', 2);
    c.restore();
  }, ['animal', 'car']);
  V('ridecloud', 'のれる くも', 180, 100, 46, (c, t, st) => {
    const b = Math.sin(t * 0.003) * 3;
    c.save(); c.translate(0, b);
    G.blob(c, [-84, -26, -78, -56, -44, -70, -10, -84, 30, -78, 62, -66, 86, -40, 70, -14, 0, -10, -60, -12]); G.fillO(c, '#ffffff', 3);
    c.fillStyle = 'rgba(190,220,255,.45)'; G.ell(c, 0, -22, 70, 10); c.fill();
    eye(c, 44, -44, 3.2); eye(c, 64, -44, 3.2); smile(c, 54, -38, 6); cheek(c, 36, -34); cheek(c, 72, -34);
    if (st.rain) for (let i = 0; i < 5; i++) { const k = ((t * 0.002 + i * 0.21) % 1); c.fillStyle = PT.pick ? ['#ffd23f', '#ff8fb1', '#7fd0e8', '#7bd36a', '#c9a0ff'][i] : '#7fd0e8'; G.star(c, -50 + i * 25, -6 + k * 60, 5, 2.2); c.fill(); }
    c.restore();
  }, ['fly', 'cloud']);
  V('pegasus', 'ペガサス', 190, 180, 74, (c, t, st) => {
    const fl = Math.sin(t * (st.flap ? 0.03 : 0.004)) * 0.4;
    c.strokeStyle = '#d6c4ff'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-56, -84); c.quadraticCurveTo(-84, -70, -80, -40); c.stroke();
    for (const x of [-36, -18, 22, 38]) { G.rr(c, x - 5, -64, 10, 62, 4); G.fillO(c, '#ffffff', 2.5); G.rr(c, x - 6, -8, 12, 8, 3); c.fillStyle = '#ffd23f'; c.fill(); }
    G.ell(c, -4, -82, 56, 26); G.fillO(c, '#ffffff', 3);
    c.beginPath(); c.moveTo(26, -92); c.quadraticCurveTo(36, -140, 56, -142); c.quadraticCurveTo(78, -138, 76, -120); c.lineTo(46, -84); c.closePath(); G.fillO(c, '#ffffff', 3);
    c.fillStyle = '#d6c4ff'; G.ell(c, 30, -122, 7, 20, 0.5); c.fill();
    eye(c, 58, -126, 3); cheek(c, 64, -116);
    c.save(); c.translate(-14, -98); c.rotate(-0.3 + fl);
    G.blob(c, [0, 0, -56, -40, -36, -44, -48, -66, -20, -58, -18, -80, 10, -40]); G.fillO(c, '#f4f0ff', 3); c.restore();
  }, ['fly', 'horse', 'magic']);
  V('snailride', 'カタツムリ', 200, 160, 104, (c, t) => {
    const s = Math.sin(t * 0.003) * 3;
    c.beginPath(); c.moveTo(-90, -4); c.quadraticCurveTo(0, -18, 70, -10); c.quadraticCurveTo(96, -20, 92, -60); c.quadraticCurveTo(84, -80, 66, -70); c.quadraticCurveTo(60, -30, 0, -26); c.lineTo(-90, -10); c.closePath(); G.fillO(c, '#ffd6a5', 3);
    c.strokeStyle = '#e8b46a'; c.lineWidth = 4; c.lineCap = 'round';
    for (const d of [-8, 8]) { c.beginPath(); c.moveTo(80 + d * 0.4, -72); c.lineTo(80 + d + s, -104); c.stroke(); G.circ(c, 80 + d + s, -106, 5); c.fillStyle = '#2b2440'; c.fill(); }
    smile(c, 84, -48, 5); cheek(c, 74, -44);
    G.circ(c, -10, -76, 56); G.fillO(c, '#c38be0', 3);
    c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.beginPath(); for (let a = 0; a < 12; a += 0.3) { const r = 46 - a * 3.6; const x = -10 + Math.cos(a) * r, y = -76 + Math.sin(a) * r; a ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  }, ['animal', 'slow']);
  V('turtleride', 'おおきな カメ', 200, 130, 74, (c, t, st) => {
    const hide = st.hideT && t < st.hideT;
    if (!hide) {
      for (const x of [-56, 50]) { G.ell(c, x, -14, 18, 12); G.fillO(c, '#8fd18a', 3); }
      G.circ(c, 92, -54, 22); G.fillO(c, '#8fd18a', 3); eye(c, 100, -60, 3.4); smile(c, 100, -50, 6); cheek(c, 88, -46);
    }
    G.ell(c, 0, -46, 86, 50); G.fillO(c, '#5ab35a', 3);
    c.save(); G.ell(c, 0, -46, 86, 50); c.clip(); c.strokeStyle = '#3d8d42'; c.lineWidth = 3;
    G.poly(c, [-24, -70, 24, -70, 36, -44, 24, -18, -24, -18, -36, -44]); c.fillStyle = '#7bd36a'; c.fill(); c.stroke();
    for (const [x, y] of [[-62, -60], [62, -60], [-62, -24], [62, -24]]) { G.circ(c, x, y, 18); c.fillStyle = '#7bd36a'; c.fill(); c.stroke(); }
    c.restore();
    c.fillStyle = '#ffe9a8'; G.rr(c, -80, -16, 160, 8, 4); c.fill();
  }, ['water', 'animal', 'slow']);
  V('flyingsaucer', 'ユーフォー', 200, 200, 30, (c, t, st) => {
    G.ell(c, 0, -30, 96, 24); G.fillO(c, '#b8c2d8', 3);
    G.ell(c, 0, -38, 60, 10); c.fillStyle = '#9aa3b8'; c.fill();
    for (let i = 0; i < 6; i++) { const on = Math.floor(t / 200 + i) % 3 === 0; G.circ(c, -70 + i * 28, -26, 6); c.fillStyle = on ? '#ffe36a' : ['#ff8fb1', '#7fd0e8', '#7bd36a'][i % 3]; c.fill(); }
    c.beginPath(); c.moveTo(-58, -40); c.quadraticCurveTo(-60, -196, 0, -196); c.quadraticCurveTo(60, -196, 58, -40); c.closePath();
    c.fillStyle = 'rgba(190,255,220,.25)'; c.fill(); c.strokeStyle = '#7fd0b0'; c.lineWidth = 3; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.6)'; G.ell(c, -32, -150, 6, 20, 0.4); c.fill();
    if (st.beam) { c.fillStyle = 'rgba(255,250,170,.35)'; G.poly(c, [-30, -10, 30, -10, 70, 220, -70, 220]); c.fill(); }
  }, ['fly', 'space']);

  /* ================= がっき ================= */
  const I = (id, name, w, h, snd, draw, extra = {}) => def(id, Object.assign({ name, cat: 'magic', tags: ['i4inst', 'i4music'], w, h, snd, draw: (c, t, st) => draw(c, T(t), st || {}) }, extra));
  I('violin', 'バイオリン', 70, 140, { notes: [67, 71, 74, 79, 76, 74], type: 'triangle', len: 0.4 }, (c, t) => {
    c.save(); c.rotate(0.12);
    G.blob(c, [0, -86, 20, -80, 22, -62, 14, -54, 24, -40, 24, -14, 0, -4, -24, -14, -24, -40, -14, -54, -22, -62, -20, -80]); G.fillO(c, '#c8803c', 3);
    c.strokeStyle = '#7a4a22'; c.lineWidth = 2; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 8, -56); c.quadraticCurveTo(s * 12, -46, s * 8, -38); c.stroke(); }
    G.rr(c, -4, -130, 8, 64, 3); G.fillO(c, '#3e3550', 2); G.circ(c, 0, -134, 7); G.fillO(c, '#8a5a2b', 2);
    G.rr(c, -10, -22, 20, 6, 2); c.fillStyle = '#3e3550'; c.fill();
    c.strokeStyle = '#fff6d8'; c.lineWidth = 1; for (const x of [-2, 2]) { c.beginPath(); c.moveTo(x, -124); c.lineTo(x, -20); c.stroke(); }
    c.restore();
    c.strokeStyle = '#8a5a2b'; c.lineWidth = 3; c.beginPath(); c.moveTo(-30, -24); c.lineTo(32, -110); c.stroke();
  });
  I('harmonica', 'ハーモニカ', 100, 40, { notes: [72, 74, 76, 74, 72, 67], type: 'square', len: 0.25, vol: 0.06 }, (c) => {
    G.rr(c, -44, -32, 88, 26, 6); G.fillO(c, '#4c9be8', 3);
    G.rr(c, -40, -22, 80, 8, 3); c.fillStyle = '#e8eef8'; c.fill();
    c.fillStyle = '#3e4a63'; for (let i = 0; i < 8; i++) c.fillRect(-36 + i * 9.5, -20, 5, 4);
    c.fillStyle = '#ffd23f'; G.star(c, 30, -28, 3, 1.4); c.fill();
  });
  I('recorder', 'リコーダー', 50, 140, { notes: [72, 74, 76, 77, 79, 77, 76], type: 'sine', len: 0.3 }, (c) => {
    c.save(); c.rotate(0.15);
    G.rr(c, -7, -130, 14, 124, 6); G.fillO(c, '#fff3dc', 3);
    G.rr(c, -9, -134, 18, 18, 6); G.fillO(c, '#c8a07a', 2.5); G.rr(c, -10, -16, 20, 12, 5); G.fillO(c, '#c8a07a', 2.5);
    for (let i = 0; i < 6; i++) { G.circ(c, 0, -100 + i * 14, 3); c.fillStyle = '#5c4630'; c.fill(); }
    c.restore();
  });
  I('jinglebell', 'すず', 80, 90, { bell: true }, (c, t) => {
    c.strokeStyle = '#ff6f91'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, -60); c.quadraticCurveTo(-26, -86, -10, -84); c.moveTo(0, -60); c.quadraticCurveTo(26, -86, 10, -84); c.stroke();
    G.circ(c, 0, -34, 30); G.fillO(c, '#ffd23f', 3);
    c.strokeStyle = '#c99a22'; c.lineWidth = 3; c.beginPath(); c.moveTo(-28, -36); c.lineTo(28, -36); c.stroke();
    G.circ(c, 0, -22, 5); c.fillStyle = '#7a5a12'; c.fill(); c.fillStyle = '#7a5a12'; c.fillRect(-1.5, -22, 3, 12);
    c.fillStyle = 'rgba(255,255,255,.75)'; G.ell(c, -12, -48, 7, 4, -0.5); c.fill();
  });
  I('castanets', 'カスタネット', 90, 60, { noise: 2500 }, (c) => {
    G.ell(c, 0, -20, 34, 16); G.fillO(c, '#4c9be8', 3);
    c.save(); c.translate(-30, -28); c.rotate(-0.25); G.ell(c, 30, -10, 34, 16); G.fillO(c, '#ff5d78', 3); c.restore();
    c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.beginPath(); c.arc(-36, -30, 8, 0, PT.TAU); c.stroke();
  });
  I('triangleinst', 'トライアングル', 90, 110, { notes: [96, 96, 101], type: 'sine', len: 0.8, vol: 0.08 }, (c) => {
    c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -104); c.lineTo(0, -90); c.stroke();
    c.strokeStyle = '#b8c2d8'; c.lineWidth = 7; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-6, -84); c.lineTo(-38, -14); c.lineTo(36, -14); c.lineTo(6, -90); c.stroke();
    c.strokeStyle = '#8a95ad'; c.lineWidth = 4; c.beginPath(); c.moveTo(20, -50); c.lineTo(44, -70); c.stroke();
  });
  I('karaokemic', 'マイク', 50, 120, { notes: [72, 76, 79, 76, 81, 79], type: 'triangle', len: 0.3 }, (c, t) => {
    c.save(); c.rotate(-0.2);
    G.rr(c, -9, -76, 18, 72, 8); G.fillO(c, '#ff8fb1', 3);
    G.circ(c, 0, -94, 22); G.fillO(c, '#cfd6e6', 3);
    c.strokeStyle = '#9aa3b8'; c.lineWidth = 1.5; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 8, -114); c.lineTo(i * 8, -74); c.moveTo(-20, -94 + i * 8); c.lineTo(20, -94 + i * 8); c.stroke(); }
    G.circ(c, 0, -40, 4); c.fillStyle = '#ffd23f'; c.fill();
    c.restore();
  });
  I('recordplayer', 'レコード', 130, 80, { notes: [60, 64, 67, 72, 71, 67, 69, 72], type: 'triangle', len: 0.3 }, (c, t, st) => {
    G.rr(c, -58, -44, 116, 40, 8); G.fillO(c, '#c8803c', 3);
    G.ell(c, -6, -46, 46, 12); G.fillO(c, '#2b2440', 2.5);
    const a = st.playing ? t * 0.01 : 0; c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; G.ell(c, -6, -46, 32, 8); c.stroke();
    G.ell(c, -6, -46, 12, 3.4); c.fillStyle = '#ff6f91'; c.fill(); c.fillStyle = '#fff'; G.circ(c, -6 + Math.cos(a) * 9, -46 + Math.sin(a) * 2.6, 1.6); c.fill();
    c.strokeStyle = '#cfd6e6'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(48, -56); c.lineTo(42, -40); c.lineTo(20, -44); c.stroke();
    for (const x of [-44, 34]) { G.circ(c, x, -24, 5); c.fillStyle = '#ffd23f'; c.fill(); }
  });
  I('djset', 'DJ セット', 180, 120, { notes: [48, 55, 60, 55, 48, 55, 62, 55], type: 'square', len: 0.18, vol: 0.07 }, (c, t, st) => {
    G.rr(c, -84, -60, 168, 56, 8); G.fillO(c, '#3e3550', 3);
    for (const x of [-46, 46]) { G.ell(c, x, -62, 30, 9); G.fillO(c, '#2b2440', 2); const a = t * (st.playing ? 0.015 : 0.002); G.circ(c, x + Math.cos(a) * 18, -62 + Math.sin(a) * 5, 3); c.fillStyle = '#ffd23f'; c.fill(); }
    for (let i = 0; i < 5; i++) { const on = Math.floor(t / 180 + i) % 2; G.rr(c, -30 + i * 13, -40, 9, 9, 2); c.fillStyle = on ? ['#ff5d78', '#ffd23f', '#58c46b', '#4c9be8', '#c38be0'][i] : '#5a5470'; c.fill(); }
    c.fillStyle = '#ff8fb1'; c.font = `900 18px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('DJ', 0, -12);
  });
  I('toypiano', 'おもちゃの ピアノ', 140, 100, { notes: [60, 62, 64, 65, 67, 69, 71, 72], type: 'triangle', len: 0.25 }, (c) => {
    for (const x of [-50, 50]) { G.rr(c, x - 5, -30, 10, 30, 3); G.fillO(c, '#ff8fb1', 2); }
    G.rr(c, -64, -88, 128, 60, 12); G.fillO(c, '#ff8fb1', 3);
    G.rr(c, -56, -48, 112, 18, 4); G.fillO(c, '#ffffff', 2);
    c.strokeStyle = '#d0d8e6'; c.lineWidth = 1.5; for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(-56 + i * 14, -48); c.lineTo(-56 + i * 14, -30); c.stroke(); }
    c.fillStyle = '#3e3550'; for (const i of [1, 2, 4, 5, 6]) c.fillRect(-56 + i * 14 - 3.5, -48, 7, 10);
    c.fillStyle = '#ffd23f'; G.star(c, 0, -70, 9, 4); c.fill();
  });
  I('accordion', 'アコーディオン', 120, 90, { notes: [65, 69, 72, 69, 67, 70, 74, 70], type: 'sawtooth', len: 0.28, vol: 0.05 }, (c, t, st) => {
    const sq = st.playing ? Math.sin(t * 0.01) * 10 : 0;
    G.rr(c, -56 - sq / 2, -76, 26, 70, 6); G.fillO(c, '#e8424a', 3); G.rr(c, 30 + sq / 2, -76, 26, 70, 6); G.fillO(c, '#e8424a', 3);
    const w = 60 + sq;
    for (let i = 0; i < 6; i++) { G.rr(c, -w / 2 + (i * w) / 6, -72, w / 6, 62, 2); c.fillStyle = i % 2 ? '#fff3dc' : '#ffd6a5'; c.fill(); c.strokeStyle = '#c99a64'; c.lineWidth = 1.5; c.stroke(); }
    c.fillStyle = '#ffffff'; for (let i = 0; i < 5; i++) { G.circ(c, -43 - sq / 2, -64 + i * 12, 3.4); c.fill(); }
  });
  I('flute', 'フルート', 140, 40, { notes: [79, 81, 83, 84, 86, 84, 81], type: 'sine', len: 0.32 }, (c) => {
    c.save(); c.rotate(-0.1);
    G.rr(c, -64, -26, 128, 12, 6); G.fillO(c, '#dfe6f2', 3);
    for (let i = 0; i < 6; i++) { G.circ(c, -20 + i * 12, -20, 3.4); G.fillO(c, '#b8c2d8', 1.5); }
    G.ell(c, -48, -20, 4, 3); c.fillStyle = '#5a6480'; c.fill();
    c.restore();
  });
  I('cymbals', 'シンバル', 120, 80, { crash: true }, (c) => {
    for (const s of [-1, 1]) {
      c.save(); c.translate(s * 30, -38); c.rotate(s * 0.4);
      G.ell(c, 0, 0, 30, 30 * 0.4); G.fillO(c, '#ffd23f', 3); G.ell(c, 0, -2, 8, 4); c.fillStyle = '#c99a22'; c.fill();
      c.strokeStyle = 'rgba(200,150,30,.6)'; c.lineWidth = 1.5; G.ell(c, 0, 0, 20, 8); c.stroke();
      G.rr(c, -4, -14, 8, 12, 3); G.fillO(c, '#ff6f61', 2);
      c.restore();
    }
  });

  /* ================= ふしぎ ================= */
  const M = (id, name, w, h, draw, extra = {}) => def(id, Object.assign({ name, cat: 'magic', tags: ['i4magic'], w, h, draw: (c, t, st) => draw(c, T(t), st || {}) }, extra));
  const jar = (c, lid, inner) => {
    G.rr(c, -26, -76, 52, 72, 14); c.fillStyle = 'rgba(220,240,255,.55)'; c.fill(); c.strokeStyle = '#9fc8f0'; c.lineWidth = 3; c.stroke();
    c.save(); G.rr(c, -26, -76, 52, 72, 14); c.clip(); inner(); c.restore();
    G.rr(c, -22, -88, 44, 14, 5); G.fillO(c, lid, 2.5);
    c.fillStyle = 'rgba(255,255,255,.6)'; G.ell(c, -14, -50, 4, 14); c.fill();
  };
  M('starjar', 'ほしの ビン', 70, 100, (c, t) => jar(c, '#9b6fd6', () => { c.fillStyle = '#2c2f6b'; c.fillRect(-26, -76, 52, 72); for (let i = 0; i < 6; i++) { const a = 0.6 + 0.4 * Math.sin(t * 0.005 + i * 2); c.fillStyle = `rgba(255,236,140,${a})`; G.star(c, -14 + (i % 3) * 14, -60 + Math.floor(i / 3) * 26 + (i % 2) * 6, 6, 2.6); c.fill(); } }));
  M('snowcrystal', 'ゆきの けっしょう', 90, 100, (c, t) => {
    c.save(); c.translate(0, -50); c.rotate(t * 0.0006);
    c.strokeStyle = '#9fd8ff'; c.lineWidth = 6; c.lineCap = 'round';
    for (let i = 0; i < 6; i++) { c.save(); c.rotate((i * PT.TAU) / 6); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -40); c.moveTo(0, -22); c.lineTo(-10, -32); c.moveTo(0, -22); c.lineTo(10, -32); c.stroke(); c.restore(); }
    c.strokeStyle = '#ffffff'; c.lineWidth = 2.5; for (let i = 0; i < 6; i++) { c.save(); c.rotate((i * PT.TAU) / 6); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -38); c.stroke(); c.restore(); }
    G.circ(c, 0, 0, 8); G.fillO(c, '#e8f6ff', 2);
    c.restore();
  });
  M('aurorabox', 'オーロラ', 110, 90, (c, t) => {
    G.rr(c, -50, -78, 100, 72, 12); G.fillO(c, '#2c2f6b', 3);
    c.save(); G.rr(c, -50, -78, 100, 72, 12); c.clip();
    ['rgba(120,255,190,.75)', 'rgba(150,200,255,.7)', 'rgba(220,160,255,.7)'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 9; c.beginPath(); for (let x = -50; x <= 50; x += 10) { const y = -56 + i * 12 + Math.sin(x * 0.06 + t * 0.003 + i) * 7; x === -50 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); });
    c.fillStyle = '#ffffff'; for (const [x, y] of [[-34, -70], [20, -68], [36, -20], [-20, -16]]) { G.star(c, x, y, 3, 1.3); c.fill(); }
    c.restore();
  });
  M('shootingstar', 'ながれぼし', 120, 80, (c, t) => {
    const g = c.createLinearGradient(-56, -16, 30, -56); g.addColorStop(0, 'rgba(255,240,160,0)'); g.addColorStop(1, 'rgba(255,240,160,.9)');
    c.strokeStyle = g; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.moveTo(-56, -14); c.lineTo(26, -52); c.stroke();
    c.save(); c.translate(34, -54); c.rotate(t * 0.002); G.star(c, 0, 0, 22, 10); G.fillO(c, '#ffe066', 3); c.restore();
    eye(c, 28, -56, 2.4); eye(c, 40, -56, 2.4);
  });
  M('bubblemachine', 'シャボンだま マシン', 110, 100, (c, t, st) => {
    G.rr(c, -46, -60, 80, 56, 12); G.fillO(c, '#7fd0e8', 3);
    G.circ(c, 40, -44, 16); G.fillO(c, '#ffd23f', 3); G.circ(c, 40, -44, 9); c.fillStyle = '#ffffff'; c.fill();
    c.save(); c.translate(40, -44); c.rotate(t * (st.on ? 0.02 : 0.004)); c.strokeStyle = '#ff8fb1'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.rotate(PT.TAU / 4); c.beginPath(); c.moveTo(0, 0); c.lineTo(9, 0); c.stroke(); } c.restore();
    for (const x of [-30, -10]) { G.circ(c, x, -36, 6); c.fillStyle = x < -20 ? '#ff6f91' : '#58c46b'; c.fill(); }
    for (let i = 0; i < 3; i++) { const k = ((t * 0.0006 + i / 3) % 1); G.circ(c, 54 + k * 30, -60 - k * 40, 5 + k * 6); c.strokeStyle = `rgba(150,200,255,${1 - k})`; c.lineWidth = 2; c.stroke(); }
  });
  M('smokecloud', 'けむりの くも', 110, 80, (c, t) => {
    const b = Math.sin(t * 0.003) * 3;
    G.blob(c, [-50, -20, -44, -46, -18, -60 + b, 10, -62, 36, -50 - b, 52, -26, 30, -10, -24, -10]); G.fillO(c, '#e6e0f2', 3);
    c.fillStyle = 'rgba(180,170,210,.5)'; G.circ(c, -10, -30, 10); c.fill(); G.circ(c, 18, -36, 8); c.fill();
    eye(c, -6, -38, 2.8); eye(c, 14, -38, 2.8); c.strokeStyle = '#2b2440'; c.lineWidth = 2.5; c.beginPath(); c.arc(4, -30, 4, 0, Math.PI); c.stroke();
  });
  M('fireflyjar', 'ほたるの ビン', 70, 100, (c, t) => jar(c, '#58c46b', () => { c.fillStyle = 'rgba(20,40,60,.55)'; c.fillRect(-26, -76, 52, 72); for (let i = 0; i < 4; i++) { const a = 0.5 + 0.5 * Math.sin(t * 0.006 + i * 1.7); const x = Math.sin(t * 0.001 + i * 2) * 12, y = -40 + Math.cos(t * 0.0013 + i) * 20; c.fillStyle = `rgba(230,255,140,${a * 0.35})`; G.circ(c, x, y, 9); c.fill(); c.fillStyle = `rgba(240,255,170,${a})`; G.circ(c, x, y, 3.4); c.fill(); } }));
  M('butterflyjar', 'ちょうちょの かご', 90, 100, (c, t) => {
    G.ell(c, 0, -8, 40, 8); G.fillO(c, '#c8803c', 2.5);
    c.strokeStyle = '#c8803c'; c.lineWidth = 2.5; for (let x = -32; x <= 32; x += 16) { c.beginPath(); c.moveTo(x, -8); c.quadraticCurveTo(x * 0.9, -70, 0, -86); c.stroke(); }
    c.beginPath(); c.arc(0, -96, 8, 0, PT.TAU); c.stroke();
    for (let i = 0; i < 2; i++) { const fl = Math.abs(Math.sin(t * 0.012 + i)); c.save(); c.translate(-10 + i * 20, -44 + i * 10); for (const s of [-1, 1]) { c.save(); c.scale(s * (0.3 + fl * 0.7), 1); G.ell(c, 7, -4, 8, 6, -0.4); G.fillO(c, i ? '#ffb3d0' : '#ffe066', 1.5); c.restore(); } c.restore(); }
  });
  M('fairydust', 'ようせいの こな', 70, 90, (c, t) => {
    G.blob(c, [-26, -10, -28, -48, -14, -60, 14, -60, 28, -48, 26, -10, 0, -4]); G.fillO(c, '#ffc4e8', 3);
    c.strokeStyle = '#c38be0'; c.lineWidth = 4; c.beginPath(); c.moveTo(-14, -60); c.quadraticCurveTo(0, -52, 14, -60); c.stroke();
    G.ell(c, 0, -66, 8, 6); G.fillO(c, '#c38be0', 2);
    for (let i = 0; i < 5; i++) { const k = ((t * 0.0008 + i / 5) % 1); c.fillStyle = `rgba(255,236,140,${1 - k})`; G.star(c, -12 + i * 6 + Math.sin(k * 6) * 6, -70 - k * 30, 3.4, 1.4); c.fill(); }
    c.fillStyle = '#ffffff'; G.star(c, 0, -32, 7, 3); c.fill();
  });
  M('teleportdoor', 'テレポートの とびら', 110, 170, (c, t, st) => {
    G.rr(c, -50, -162, 100, 160, 46); G.fillO(c, '#c38be0', 3);
    const open = st.openT && t < st.openT;
    c.save(); G.rr(c, -40, -150, 80, 148, 38); c.clip();
    c.fillStyle = open ? '#2c2f6b' : '#ffd6f0'; c.fillRect(-40, -150, 80, 148);
    if (open) { for (let i = 0; i < 4; i++) { c.strokeStyle = ['#ff8fb1', '#ffd23f', '#7fd0e8', '#c9a0ff'][i]; c.lineWidth = 5; c.beginPath(); c.arc(0, -76, 8 + ((t * 0.06 + i * 14) % 56), 0, PT.TAU); c.stroke(); } }
    else { G.circ(c, 26, -70, 6); G.fillO(c, '#ffd23f', 2); c.fillStyle = '#ff8fb1'; G.heart(c, 0, -116, 12); c.fill(); }
    c.restore();
    c.fillStyle = '#ffd23f'; G.star(c, 0, -168, 10, 4.5); c.fill();
  });
  const shroom = (cap, dot) => (c, t) => {
    G.rr(c, -14, -40, 28, 38, 10); G.fillO(c, '#fff3dc', 3);
    c.beginPath(); c.moveTo(-40, -40); c.quadraticCurveTo(-40, -86, 0, -88); c.quadraticCurveTo(40, -86, 40, -40); c.closePath(); G.fillO(c, cap, 3);
    c.fillStyle = dot; for (const [x, y, r] of [[-20, -56, 7], [6, -72, 8], [24, -52, 6]]) { G.circ(c, x, y, r); c.fill(); }
    eye(c, -6, -24, 2.4); eye(c, 6, -24, 2.4); cheek(c, -10, -16); cheek(c, 10, -16);
  };
  M('tinyshroom', 'ちいさく なる キノコ', 90, 100, shroom('#7fd0e8', '#ffffff'));
  M('bigshroom', 'おおきく なる キノコ', 90, 100, shroom('#ff5d78', '#ffffff'));
  M('balloonbunch', 'ふうせんの たば', 120, 200, (c, t) => {
    const cols = ['#ff5d78', '#ffd23f', '#58b9f0', '#7bd36a', '#c38be0'];
    const pos = [[-30, -150], [0, -170], [30, -150], [-16, -126], [16, -126]];
    c.strokeStyle = '#8a95ad'; c.lineWidth = 1.5; for (const [x, y] of pos) { c.beginPath(); c.moveTo(0, -10); c.lineTo(x, y + 22); c.stroke(); }
    pos.forEach(([x, y], i) => { const s = Math.sin(t * 0.003 + i) * 3; G.ell(c, x + s, y, 20, 24); G.fillO(c, cols[i], 2.5); c.fillStyle = 'rgba(255,255,255,.6)'; G.ell(c, x + s - 7, y - 9, 4, 7, 0.4); c.fill(); });
    G.rr(c, -6, -14, 12, 8, 3); c.fillStyle = '#ff8fb1'; c.fill();
  });
  M('heartfeel', 'ハートの きもち', 90, 90, (c, t) => {
    const k = 1 + Math.sin(t * 0.008) * 0.07;
    c.save(); c.translate(0, -44); c.scale(k, k); G.heart(c, 0, 4, 36); G.fillO(c, '#ff6f91', 3); c.restore();
    c.fillStyle = '#ffffff'; G.ell(c, -14, -56, 6, 9, 0.5); c.fill();
    eye(c, -8, -44, 2.6); eye(c, 8, -44, 2.6); smile(c, 0, -38, 4);
  });
  M('rainbowbridge', 'にじの はし', 160, 90, (c) => {
    ['#ff6b6b', '#ffa94d', '#ffd84a', '#69db7c', '#4dabf7', '#9775fa'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 7; c.beginPath(); c.arc(0, -6, 66 - i * 7, Math.PI, 0); c.stroke(); });
    for (const x of [-70, 70]) { G.blob(c, [x - 22, -4, x - 16, -20, x, -26, x + 16, -20, x + 22, -4]); G.fillO(c, '#ffffff', 2.5); }
  });
  M('toyplanet', 'うちゅうの ほし', 120, 100, (c, t) => {
    c.save(); c.translate(0, -50);
    c.strokeStyle = '#ffd23f'; c.lineWidth = 6; c.beginPath(); c.ellipse(0, 0, 54, 14, -0.25, Math.PI, PT.TAU); c.stroke();
    G.circ(c, 0, 0, 34); G.fillO(c, '#9b6fd6', 3);
    c.save(); G.circ(c, 0, 0, 34); c.clip(); c.fillStyle = '#b897f0'; for (let i = 0; i < 3; i++) { const x = ((t * 0.02 + i * 30) % 90) - 45; G.ell(c, x, -14 + i * 12, 12, 4); c.fill(); } c.restore();
    c.strokeStyle = '#ffd23f'; c.beginPath(); c.ellipse(0, 0, 54, 14, -0.25, 0, Math.PI); c.stroke();
    eye(c, -10, -4, 3); eye(c, 10, -4, 3); smile(c, 0, 4, 5);
    c.restore();
  });
  M('rainbowcane', 'にじの ステッキ', 60, 130, (c, t) => {
    const cols = ['#ff6b6b', '#ffa94d', '#ffd84a', '#69db7c', '#4dabf7', '#9775fa'];
    for (let i = 0; i < 6; i++) { c.strokeStyle = cols[i]; c.lineWidth = 7; c.beginPath(); c.moveTo(0, -i * 14); c.lineTo(0, -i * 14 - 14); c.stroke(); }
    c.save(); c.translate(0, -100); c.rotate(Math.sin(t * 0.004) * 0.2);
    cols.forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 24 - i * 3.4, Math.PI * 1.05, PT.TAU - 0.05); c.stroke(); });
    G.star(c, 0, -4, 10, 4.5); G.fillO(c, '#ffffff', 2); c.restore();
  });
  M('sunorb', 'おひさまの たま', 100, 100, (c, t) => {
    c.save(); c.translate(0, -50); c.rotate(t * 0.0008);
    c.fillStyle = '#ffb547'; for (let i = 0; i < 10; i++) { c.rotate(PT.TAU / 10); G.poly(c, [-7, -32, 0, -46, 7, -32]); c.fill(); }
    c.restore();
    G.circ(c, 0, -50, 30); G.fillO(c, '#ffd23f', 3);
    eye(c, -10, -54, 3); eye(c, 10, -54, 3); smile(c, 0, -46, 7); cheek(c, -18, -42); cheek(c, 18, -42);
  });
  M('raincloud', 'あめふり ぐも', 120, 110, (c, t) => {
    for (let i = 0; i < 4; i++) { const k = ((t * 0.0012 + i / 4) % 1); G.ell(c, -30 + i * 20, -40 + k * 34, 3, 6); c.fillStyle = `rgba(110,190,245,${1 - k * 0.7})`; c.fill(); }
    G.blob(c, [-54, -48, -46, -76, -16, -92, 16, -90, 44, -78, 56, -54, 30, -44, -30, -44]); G.fillO(c, '#cfdcf0', 3);
    eye(c, -8, -66, 2.8); eye(c, 12, -66, 2.8); c.strokeStyle = '#2b2440'; c.lineWidth = 2.4; c.beginPath(); c.arc(2, -58, 4, 0.1, Math.PI - 0.1); c.stroke();
  });
  M('windbag', 'かぜの ふくろ', 100, 100, (c, t) => {
    G.blob(c, [-30, -10, -40, -50, -20, -74, 20, -74, 40, -50, 30, -10, 0, -4]); G.fillO(c, '#9fe0c8', 3);
    G.rr(c, -14, -82, 28, 10, 4); G.fillO(c, '#58b48a', 2);
    c.strokeStyle = '#ffffff'; c.lineWidth = 4; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const o = Math.sin(t * 0.005 + i) * 4; c.beginPath(); c.moveTo(-20 + o, -54 + i * 14); c.quadraticCurveTo(0, -60 + i * 14, 16 + o, -50 + i * 14); c.quadraticCurveTo(24, -44 + i * 14, 16, -40 + i * 14); c.stroke(); }
  });
  M('sleepyclock', 'ねむねむ とけい', 90, 110, (c, t) => {
    for (const s of [-1, 1]) { G.circ(c, s * 24, -92, 12); G.fillO(c, '#ffd23f', 2.5); }
    for (const s of [-1, 1]) { c.strokeStyle = '#3e4a63'; c.lineWidth = 4; c.beginPath(); c.moveTo(s * 20, -16); c.lineTo(s * 28, -2); c.stroke(); }
    G.circ(c, 0, -54, 36); G.fillO(c, '#b0d8ff', 3); G.circ(c, 0, -54, 28); c.fillStyle = '#ffffff'; c.fill();
    c.strokeStyle = '#3e4a63'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -54); c.lineTo(0, -72); c.moveTo(0, -54); c.lineTo(12, -50); c.stroke();
    c.fillStyle = '#7a8fb8'; c.font = `900 14px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('Zz', 26 + Math.sin(t * 0.003) * 2, -96);
  });
  M('giggleflower', 'わらいばな', 80, 120, (c, t) => {
    c.strokeStyle = '#58b44e'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-6, -40, 0, -66); c.stroke();
    G.ell(c, -14, -30, 12, 6, 0.5); G.fillO(c, '#7bd36a', 2);
    const w = Math.sin(t * 0.01) * 0.15;
    c.save(); c.translate(0, -84); c.rotate(w);
    for (let i = 0; i < 8; i++) { c.save(); c.rotate((i * PT.TAU) / 8); G.ell(c, 0, -22, 10, 14); G.fillO(c, i % 2 ? '#ffd23f' : '#ffb547', 2); c.restore(); }
    G.circ(c, 0, 0, 16); G.fillO(c, '#ffe9a8', 2.5);
    c.strokeStyle = '#2b2440'; c.lineWidth = 2.4; c.beginPath(); c.arc(-6, -3, 3, Math.PI, 0); c.moveTo(9, -3); c.arc(6, -3, 3, Math.PI, 0); c.stroke();
    G.ell(c, 0, 6, 6, 4); c.fillStyle = '#ff6f61'; c.fill();
    c.restore();
  });
  M('magnetstar', 'くっつき ぼし', 100, 100, (c, t) => {
    c.save(); c.translate(0, -50);
    for (let i = 0; i < 2; i++) { c.strokeStyle = `rgba(255,140,200,${0.5 - i * 0.2})`; c.lineWidth = 3; G.circ(c, 0, 0, 40 + ((t * 0.03 + i * 10) % 14)); c.stroke(); }
    G.star(c, 0, 0, 34, 16); G.fillO(c, '#ff8fb1', 3);
    G.rr(c, -6, -10, 12, 20, 4); c.fillStyle = '#ffffff'; c.fill(); c.fillStyle = '#e8424a'; c.fillRect(-6, -10, 12, 8);
    c.restore();
  });
  M('shadowlamp', 'かげえ ランプ', 80, 110, (c, t) => {
    G.rr(c, -22, -16, 44, 14, 6); G.fillO(c, '#8a5a3a', 3);
    c.strokeStyle = '#8a5a3a'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, -16); c.lineTo(0, -54); c.stroke();
    G.poly(c, [-30, -58, 30, -58, 18, -98, -18, -98]); G.fillO(c, '#ffe9a8', 3);
    c.fillStyle = `rgba(255,220,120,${0.3 + 0.15 * Math.sin(t * 0.004)})`; G.circ(c, 0, -76, 22); c.fill();
    c.fillStyle = 'rgba(60,50,90,.55)'; G.ell(c, 0, -74, 8, 6); c.fill(); G.ell(c, -4, -84, 2.6, 7, -0.2); c.fill(); G.ell(c, 4, -84, 2.6, 7, 0.2); c.fill();
  });
  M('luckyclover', 'よつばの クローバー', 80, 110, (c, t) => {
    c.strokeStyle = '#3d8d42'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(8, -36, 0, -60); c.stroke();
    c.save(); c.translate(0, -74); c.rotate(Math.sin(t * 0.003) * 0.12);
    for (let i = 0; i < 4; i++) { c.save(); c.rotate((i * PT.TAU) / 4 + PT.TAU / 8); G.heart(c, 0, -14, 18); G.fillO(c, '#58c46b', 2.5); c.restore(); }
    G.circ(c, 0, 0, 4); c.fillStyle = '#ffd23f'; c.fill();
    c.restore();
  });
  M('kaleidoscope', 'まんげきょう', 120, 70, (c, t) => {
    c.save(); c.translate(0, -34); c.rotate(-0.2);
    G.rr(c, -50, -16, 90, 32, 14); G.fillO(c, '#58b9f0', 3);
    c.fillStyle = '#ffd23f'; c.fillRect(-30, -16, 8, 32); c.fillStyle = '#ff8fb1'; c.fillRect(0, -16, 8, 32);
    c.save(); c.translate(46, 0); c.rotate(t * 0.002); for (let i = 0; i < 6; i++) { c.rotate(PT.TAU / 6); G.ell(c, 0, -10, 4, 9); c.fillStyle = ['#ff6b6b', '#ffd84a', '#69db7c', '#4dabf7', '#9775fa', '#ffa94d'][i]; c.fill(); } c.restore();
    G.circ(c, 46, 0, 18); c.strokeStyle = '#3e4a63'; c.lineWidth = 3; c.stroke();
    c.restore();
  });
  M('bigbubble', 'のれる シャボンだま', 120, 130, (c, t) => {
    const s = 1 + Math.sin(t * 0.004) * 0.03;
    c.save(); c.translate(0, -62); c.scale(s, 1 / s);
    G.circ(c, 0, 0, 54); c.fillStyle = G.rgrad(c, -16, -16, 2, 54, [[0, 'rgba(255,255,255,.75)'], [0.6, 'rgba(190,230,255,.25)'], [1, 'rgba(255,180,240,.5)']]); c.fill();
    c.strokeStyle = 'rgba(150,200,255,.95)'; c.lineWidth = 3; c.stroke();
    G.ell(c, -20, -24, 12, 7, -0.6); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill();
    c.restore();
    G.rr(c, -4, -8, 8, 8, 3); c.fillStyle = '#ff8fb1'; c.fill();
  });
  M('wishbottle', 'おねがいの ボトル', 60, 110, (c, t) => {
    c.beginPath(); c.moveTo(-8, -96); c.lineTo(-8, -76); c.quadraticCurveTo(-26, -70, -26, -50); c.lineTo(-26, -12); c.quadraticCurveTo(-26, -4, -18, -4); c.lineTo(18, -4); c.quadraticCurveTo(26, -4, 26, -12); c.lineTo(26, -50); c.quadraticCurveTo(26, -70, 8, -76); c.lineTo(8, -96); c.closePath();
    c.fillStyle = 'rgba(220,240,255,.6)'; c.fill(); c.strokeStyle = '#9fc8f0'; c.lineWidth = 3; c.stroke();
    G.rr(c, -10, -104, 20, 10, 4); G.fillO(c, '#c8a07a', 2);
    c.fillStyle = '#fff3dc'; G.rr(c, -12, -54, 24, 30, 3); c.fill(); c.strokeStyle = '#ff8fb1'; c.lineWidth = 2; c.beginPath(); c.moveTo(-12, -40); c.lineTo(12, -40); c.stroke();
    c.fillStyle = `rgba(255,236,140,${0.6 + 0.4 * Math.sin(t * 0.006)})`; G.star(c, 0, -64, 5, 2.2); c.fill();
  });

  const RIDES = ['policecar', 'digger', 'dumptruck', 'bullettrain', 'steamloco', 'helicopter', 'minirocket', 'submarine', 'yacht', 'canoe', 'hotairballoon', 'gokart', 'motorbike', 'kickscooter', 'sled', 'rollerskates', 'elephantride', 'whaleride', 'dragonride', 'pandacar', 'ridecloud', 'pegasus', 'snailride', 'turtleride', 'flyingsaucer'];
  const INST = ['violin', 'harmonica', 'recorder', 'jinglebell', 'castanets', 'triangleinst', 'karaokemic', 'recordplayer', 'djset', 'toypiano', 'accordion', 'flute', 'cymbals'];
  const MAGIC = ['starjar', 'snowcrystal', 'aurorabox', 'shootingstar', 'bubblemachine', 'smokecloud', 'fireflyjar', 'butterflyjar', 'fairydust', 'teleportdoor', 'tinyshroom', 'bigshroom', 'balloonbunch', 'heartfeel', 'rainbowbridge', 'toyplanet', 'rainbowcane', 'sunorb', 'raincloud', 'windbag', 'sleepyclock', 'giggleflower', 'magnetstar', 'shadowlamp', 'luckyclover', 'kaleidoscope', 'bigbubble', 'wishbottle'];
  PT.ITEMS4 = { RIDES, INST, MAGIC };
  // ステージの おすすめ
  const fav = (sid, ids) => { const st = PT.stageById && PT.stageById(sid); if (st) st.favs = ids.concat(st.favs || []); };
  fav('airport', ['helicopter', 'hotairballoon', 'pegasus']); fav('sea', ['submarine', 'whaleride', 'yacht']); fav('concert', ['karaokemic', 'djset', 'violin']);
  fav('fairy', ['fairydust', 'tinyshroom', 'teleportdoor']); fav('snow', ['sled', 'snowcrystal']); fav('station', ['bullettrain', 'steamloco']); fav('space', ['minirocket', 'flyingsaucer', 'toyplanet']);

  /* ================= あそび ================= */
  const W = PT.world, R = PT.R;
  if (!R || !R.h || !R.h.isP) return;
  const D = R.D, X = PT.FX, A = PT.audio;
  const { isP, isC, tag, nearP } = R.h;
  const N = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const pick = PT.pick, rand = PT.rand, easeIn = (k) => k * k;
  const COLS = ['#ff6f91', '#ffd23f', '#58c46b', '#4c9be8', '#b39ae8', '#ff8a65'];
  const spark = (x, y, n = 8, col) => W.burst('spark', x, y, n, { sp: 0.2, max: 800, size: 10, col, g: 0 });
  const who = (c, pref) => (isC(c.tgt) && !c.tgt.riding ? c.tgt : R.one(c.e.x, c.e.y, [], pref));
  const edgeAmp = (x, want) => Math.max(120, Math.min(want, x - W.visLeft - 110, W.visRight - 110 - x));

  /* ---------- のりもの：のる ---------- */
  // キャラが のりものに のって tween で うごく
  const mount = (ch, v, then, line, icon) => {
    const a = R.claim(ch, 16000).to(v, 0, -3, true).do(() => {
      if (v.removed || (v.rider && v.rider !== ch.id)) return;
      R.ride(ch, v, { z: v.def.seat, pose: v.type === 'kickscooter' || v.type === 'rollerskates' ? 'cheer' : 'ride' });
      ch.flip = false; if (line) W.say(ch, line, icon || v.type, 1500, 'yay');
      then();
    });
    return a;
  };
  // ふつうの tween：path(k) → {x, y, z, r, f, pose}
  const move = (ch, v, ms, path, done) => {
    const sx = v.x, sy = v.y, seat = v.def.seat;
    R.tween(ch, ms, (k) => {
      if (v.removed) return;
      const p = path(k, sx, sy);
      v.x = p.x; v.y = p.y === undefined ? sy : p.y; v.z = Math.max(0, p.z || 0); v.rot = p.r || 0; v.scale = W.depthScale(v.y);
      ch.x = v.x; ch.y = v.y - 2; ch.z = v.z + seat + (p.cz || 0); ch.scale = v.scale;
      if (p.f !== undefined) ch.flip = p.f; ch.pose = p.pose || ch.rest;
      if (p.fx) p.fx();
    }, () => { v.z = 0; v.rot = 0; ch.z = seat; done && done(); });
  };
  const land = (ch, v, disc, line = 'たのしかった！', icon = 'star') => {
    R.unride(ch); v.zTarget = undefined;
    W.act(ch).face('laugh', 1200).say(line, icon, 1400, 'yay').pose('cheer', 700);
    R.found(disc);
  };
  const swayX = (sx, amp, k, n = 1) => sx + Math.sin(k * PT.TAU * n) * amp;
  const water = (v) => { const w = W.fixes().find((f) => f.def.area === 'water'); if (w) { v.x = PT.clamp(v.x, w.x - w.w * 0.35, w.x + w.w * 0.35); v.y = PT.clamp(w.y - 30, W.stage.floor[0] + 10, W.stage.floor[1]); v.scale = W.depthScale(v.y); } };

  const RIDE = {
    policecar(ch, v) {
      W.bigText('ウーウー！', v.x, v.y - 160, '#3d7fe0');
      for (let i = 0; i < 6; i++) A.tone(i % 2 ? 620 : 830, 0.32, { type: 'triangle', vol: 0.06, delay: i * 0.34 });
      mount(ch, v, () => {
        const amp = edgeAmp(v.x, 360);
        move(ch, v, 4200, (k, sx) => ({ x: swayX(sx, amp, k), f: Math.cos(k * PT.TAU) < 0 }), () => land(ch, v, 'i4_police', 'パトロール かんりょう！'));
        R.free(v.x, v.y, [ch], 1400).slice(0, 2).forEach((o) => R.claim(o, 3000).look(v.x).pose('wave', 1600).say('おまわりさーん！', 'policecar', 1400, 'yay'));
      }, 'しゅつどう！');
    },
    digger(ch, v) {
      mount(ch, v, () => {
        A.sfx('drum'); v.digT = W.t + 2600;
        for (let i = 0; i < 5; i++) W.after(i * 500, () => { X.dig(v.x + 90 * v.scale, v.y); A.sfx('place'); });
        move(ch, v, 2600, (k, sx) => ({ x: sx + Math.sin(k * 30) * 2 }), () => {
          const p = W.addProp(pick(['shell', 'acorn', 'castle', 'dino', 'ball']), v.x + 120 * v.scale, v.y + 10); if (p) p.pop = W.t;
          A.sfx('sparkle'); spark(v.x + 120, v.y - 40, 10, '#ffd23f');
          land(ch, v, 'i4_digger', 'なにか でてきた！', '!');
        });
      }, 'ほりほり するよ！');
    },
    dumptruck(ch, v) {
      mount(ch, v, () => {
        const amp = edgeAmp(v.x, 260);
        move(ch, v, 2400, (k, sx) => ({ x: sx + Math.sin(k * Math.PI) * amp }), () => {
          v.tipT = W.t + 2400; A.sfx('slide');
          ch.z = v.def.seat + 20;
          W.after(800, () => { for (let i = 0; i < 3; i++) { const p = W.addProp(pick(['blocks', 'ball', 'acorn']), v.x - 110 * v.scale - i * 30, v.y + 6 + i * 8); if (p) { p.pop = W.t; p.temp = true; } } A.sfx('place'); W.say(ch, 'ザザーッ！', 'dumptruck', 1300, 'laugh'); });
          W.after(2400, () => { if (ch.riding === v) land(ch, v, 'i4_dump', 'はこんだよ！'); else R.found('i4_dump'); });
        });
      }, 'のせて はこぶよ！');
    },
    bullettrain(ch, v) {
      mount(ch, v, () => {
        A.sfx('train'); W.bigText('ビューン！', v.x, v.y - 170, '#3d7fe0');
        const L = W.visLeft - 260, Rr = W.visRight + 260;
        move(ch, v, 3200, (k, sx) => {
          let x; if (k < 0.45) x = PT.lerp(sx, Rr, easeIn(k / 0.45)); else if (k < 0.55) x = Rr; else x = PT.lerp(L, sx, PT.easeOut((k - 0.55) / 0.45));
          return { x, f: false, fx: () => { if (Math.random() < 0.5) W.fx.push({ type: 'confetti', x: x - 120, y: v.y - rand(20, 90), vx: -0.6, vy: 0, life: 0, max: 400, size: 26, col: 'rgba(160,200,255,.8)', rot: 0, vr: 0, g: 0 }); } };
        }, () => land(ch, v, 'i4_shinkansen', 'はやかった〜！'));
      }, 'しゅっぱつ！');
    },
    steamloco(ch, v) {
      const cars = R.avail(v.x, v.y, [ch], 2500).slice(0, 3);
      mount(ch, v, () => {
        v.puff = true; A.sfx('train');
        const amp = edgeAmp(v.x, 320);
        let ti = 0;
        move(ch, v, 6000, (k, sx, sy) => ({ x: swayX(sx, amp, k), y: sy + Math.sin(k * PT.TAU * 2) * 30, f: Math.cos(k * PT.TAU) < 0, fx: () => { if (W.t > ti) { ti = W.t + 700; A.tone(N(76), 0.2, { type: 'square', vol: 0.04 }); } } }), () => { v.puff = false; land(ch, v, 'i4_steam', 'シュッシュッ ポッポー！'); });
        cars.forEach((o, i) => { R.claim(o, 7000); R.follow(o, () => (i === 0 ? ch : cars[i - 1]), () => ch.riding === v, () => W.act(o).pose('cheer', 800), 95); });
      }, 'シュッシュッ ポッポ！');
    },
    helicopter(ch, v) {
      mount(ch, v, () => {
        v.spin = true; A.sfx('whoosh');
        const amp = edgeAmp(v.x, 260);
        move(ch, v, 5600, (k, sx) => {
          const up = k < 0.2 ? PT.easeOut(k / 0.2) : k > 0.8 ? 1 - easeIn((k - 0.8) / 0.2) : 1;
          const kk = PT.clamp((k - 0.2) / 0.6, 0, 1);
          return { x: sx + Math.sin(kk * PT.TAU) * amp, z: up * 240 + Math.sin(k * 40) * 4, r: Math.cos(kk * PT.TAU) * 0.08, f: false, fx: () => { if (Math.random() < 0.1) W.burst('smoke', v.x, v.y - 10, 1, { sp: 0.08, max: 500, size: 14, col: 'rgba(255,255,255,.7)', g: 0 }); } };
        }, () => { v.spin = false; land(ch, v, 'i4_heli', 'バラバラ〜 とうちゃく！'); });
        R.audience(v.x, v.y, [ch], 'wow', 2, 1400);
      }, 'バラバラバラ〜！');
    },
    minirocket(ch, v) {
      mount(ch, v, () => {
        ['3', '2', '1'].forEach((n, i) => W.after(i * 700, () => { W.bigText(n, v.x, v.y - 280, '#ff6f61'); A.sfx('tap'); }));
        W.after(2100, () => {
          v.fire = true; A.sfx('rocket'); W.shake = W.t + 700; W.bigText('はっしゃ！', v.x, v.y - 300, '#ff6f61');
          move(ch, v, 5200, (k) => {
            const z = k < 0.4 ? easeIn(k / 0.4) * 1100 : k < 0.6 ? 1100 : (1 - PT.easeOut((k - 0.6) / 0.4)) * 1100;
            return { x: v.x, z, fx: () => { if (k < 0.4 && Math.random() < 0.6) W.burst('smoke', v.x, v.y - v.z + 10, 1, { sp: 0.1, max: 700, size: 22, col: '#ffffff', g: 0 }); if (k > 0.45 && k < 0.6 && Math.random() < 0.3) X.sparkleRain(400); } };
          }, () => { v.fire = false; land(ch, v, 'i4_rocket', 'うちゅう いってきた！'); X.confetti(v.x, 1200); });
        });
      }, 'カウントダウン！');
    },
    submarine(ch, v) {
      water(v);
      mount(ch, v, () => {
        A.sfx('bubble');
        W.special({ type: 'i4sea', max: 6000, draw(c, f, k) { const a = Math.sin(k * Math.PI) * 0.45; c.fillStyle = `rgba(60,140,220,${a})`; c.fillRect(-500, 0, 2600, 1200); c.fillStyle = `rgba(255,255,255,${a * 0.4})`; for (let i = 0; i < 6; i++) { c.fillRect(-500, 80 + i * 130 + Math.sin(f.life * 0.002 + i) * 10, 2600, 4); } } });
        for (let i = 0; i < 4; i++) W.after(800 + i * 700, () => X.critter('fish', [[W.visLeft - 40, rand(250, 600), 0], [W.visRight + 40, rand(250, 600), 3500]], { rot: 0 }));
        const amp = edgeAmp(v.x, 240);
        move(ch, v, 6000, (k, sx) => ({ x: sx + Math.sin(k * PT.TAU) * amp, z: Math.sin(k * Math.PI) * 60 + Math.sin(k * 12) * 6, r: Math.sin(k * 12) * 0.06, f: Math.cos(k * PT.TAU) < 0, fx: () => { if (Math.random() < 0.08) W.addBubbles(v.x, v.y - v.z - 60, 1); } }), () => land(ch, v, 'i4_sub', 'ぶくぶく〜 うみの そこ！'));
      }, 'もぐるよ〜！');
    },
    yacht(ch, v) {
      water(v);
      mount(ch, v, () => {
        A.sfx('whoosh'); const amp = edgeAmp(v.x, 300);
        move(ch, v, 5000, (k, sx) => ({ x: swayX(sx, amp, k), r: Math.sin(k * PT.TAU * 3) * 0.12, z: Math.abs(Math.sin(k * 20)) * 6, f: Math.cos(k * PT.TAU) < 0, fx: () => { if (Math.random() < 0.08) W.burst('drop', v.x - 60, v.y - 8, 2, { up: true, sp: 0.2, g: 0.001, max: 600 }); } }), () => land(ch, v, 'i4_yacht', 'かぜに のったよ！'));
      }, 'かぜさん ふいて〜！');
    },
    canoe(ch, v) {
      water(v);
      mount(ch, v, () => {
        v.paddle = true; const amp = edgeAmp(v.x, 200);
        for (let i = 0; i < 6; i++) W.after(i * 700, () => X.splash(v.x + (i % 2 ? 70 : -70), v.y));
        move(ch, v, 4400, (k, sx, sy) => ({ x: sx + Math.sin(k * Math.PI * 2) * amp, y: sy + Math.sin(k * Math.PI * 4) * 20, r: Math.sin(k * 30) * 0.05, f: Math.cos(k * PT.TAU) < 0 }), () => { v.paddle = false; land(ch, v, 'i4_canoe', 'えっさ ほいさ！'); });
      }, 'こいで こいで〜！');
    },
    hotairballoon(ch, v) {
      mount(ch, v, () => {
        A.sfx('whoosh'); const amp = edgeAmp(v.x, 200);
        move(ch, v, 7000, (k, sx) => ({ x: sx + Math.sin(k * Math.PI) * amp * 0.8, z: Math.sin(k * Math.PI) * 320, r: Math.sin(k * 10) * 0.04 }), () => land(ch, v, 'i4_hotair', 'くもに さわれそう だった！'));
        R.free(v.x, v.y, [ch], 1500).slice(0, 3).forEach((o, i) => W.after(600 + i * 300, () => R.claim(o, 3000).look(v.x).pose('wave', 2000).say(i ? 'またね〜' : 'いってらっしゃーい！', 'hotairballoon', 1500, 'yay')));
      }, 'ふわ〜っと しゅっぱつ！');
    },
    gokart(ch, v) {
      const rival = R.free(v.x, v.y, [ch], 1500)[0];
      mount(ch, v, () => {
        W.bigText('よーい ドン！', v.x, v.y - 170, '#58c46b'); A.sfx('jump');
        const amp = edgeAmp(v.x, 300);
        move(ch, v, 4500, (k, sx, sy) => { const a = k * PT.TAU * 2; return { x: sx + Math.sin(a) * amp, y: PT.clamp(sy + Math.cos(a) * 60 - 60, W.stage.floor[0] + 10, W.stage.floor[1]), f: Math.cos(a) < 0, r: Math.sin(a) * 0.05, fx: () => { if (Math.random() < 0.15) W.burst('smoke', v.x, v.y, 1, { sp: 0.05, max: 400, size: 10, col: '#e6e0f2', g: 0 }); } }; }, () => {
          W.bigText('ゴール！', v.x, v.y - 170, '#ff6f61'); X.confetti(v.x, 1200); land(ch, v, 'i4_kart', 'いちばん！');
        });
        if (rival) R.claim(rival, 5000).look(v.x).pose('cheer', 1500).say('がんばれー！', 'gokart', 1400, 'yay').pose('jump', 600);
      }, 'レース するよ！');
    },
    motorbike(ch, v) {
      mount(ch, v, () => {
        A.tone(90, 0.8, { type: 'sawtooth', slide: 1.6, vol: 0.06 });
        const amp = edgeAmp(v.x, 320);
        move(ch, v, 3600, (k, sx) => {
          const x = sx - amp + k * amp * 2 * (k < 0.5 ? 1 : 1);
          const j = k > 0.4 && k < 0.7 ? Math.sin(((k - 0.4) / 0.3) * Math.PI) : 0;
          return { x: k < 0.85 ? PT.lerp(sx, sx + amp, k / 0.85) : PT.lerp(sx + amp, sx, (k - 0.85) / 0.15), z: j * 150, r: -j * 0.35, f: k > 0.85, pose: j > 0.3 ? 'cheer' : 'ride' };
        }, () => land(ch, v, 'i4_bike', 'ジャンプ きまった！'));
        W.after(1500, () => { W.bigText('ジャンプ！', v.x, v.y - 260, '#ff6f61'); A.sfx('boing'); });
        R.mimic(ch, 'cheer', 1200, 'かっこいい！');
      }, 'ブルルン！');
    },
    kickscooter(ch, v) {
      mount(ch, v, () => {
        const amp = edgeAmp(v.x, 280);
        move(ch, v, 4000, (k, sx) => { const step = Math.floor(k * 8); return { x: swayX(sx, amp, k), f: Math.cos(k * PT.TAU) < 0, pose: (k * 8) % 1 < 0.35 ? 'kick' : 'cheer', fx: () => { if ((k * 8) % 1 < 0.05 && step !== v._st) { v._st = step; A.sfx('tap'); } } }; }, () => land(ch, v, 'i4_scooter', 'スイスイ〜！'));
      }, 'けって すすむよ！');
    },
    sled(ch, v) {
      mount(ch, v, () => {
        A.sfx('slide'); const amp = edgeAmp(v.x, 360);
        move(ch, v, 3000, (k, sx, sy) => ({ x: sx + PT.easeOut(k) * amp * (sx > PT.W / 2 ? -1 : 1), y: PT.clamp(sy + PT.easeOut(k) * 80, W.stage.floor[0] + 10, W.stage.floor[1]), z: Math.max(0, Math.sin(k * 14)) * 10, f: sx > PT.W / 2, fx: () => { if (Math.random() < 0.5) W.burst('spark', v.x, v.y, 1, { sp: 0.15, max: 500, size: 8, col: '#ffffff', g: 0.0005, up: true }); } }), () => {
          const kids = R.free(v.x, v.y, [ch], 1500).slice(0, 2); kids.forEach((o) => R.claim(o, 2500).look(v.x).pose('cheer', 1200).say('ひゃっほー！', 'sled', 1300, 'yay'));
          land(ch, v, 'i4_sled', 'すべるの さいこう！');
        });
      }, 'すべるよ〜！');
    },
    rollerskates(ch, v) {
      mount(ch, v, () => {
        A.sfx('whoosh'); const amp = edgeAmp(v.x, 220);
        move(ch, v, 4600, (k, sx, sy) => { const a = k * PT.TAU * 2; return { x: sx + Math.sin(a) * amp, y: PT.clamp(sy + Math.sin(a * 2) * 40, W.stage.floor[0] + 10, W.stage.floor[1]), f: Math.cos(a) < 0, pose: k > 0.75 ? 'spin' : 'cheer', fx: () => { if (Math.random() < 0.1) W.burst('spark', v.x, v.y - 10, 1, { sp: 0.06, max: 500, size: 8, col: pick(['#ff8fb1', '#ffd23f']), g: 0 }); } }; }, () => land(ch, v, 'i4_roller', 'くるくる〜っ！'));
      }, 'すべっちゃお！');
    },
    elephantride(ch, v) {
      mount(ch, v, () => {
        A.tone(N(55), 0.6, { type: 'sawtooth', slide: 1.8, vol: 0.06 });
        move(ch, v, 4000, (k, sx) => ({ x: sx + k * 140, z: Math.abs(Math.sin(k * 16)) * 6, f: false }), () => {
          v.spray = W.t + 2000; A.sfx('splash');
          for (let i = 0; i < 4; i++) W.after(i * 300, () => W.burst('drop', v.x + 110 * v.scale, v.y - 210 * v.scale, 8, { up: true, sp: 0.45, minSp: 0.2, g: 0.0012, max: 1000, size: 14 }));
          R.free(v.x, v.y, [ch], 900).slice(0, 2).forEach((o) => R.claim(o, 2500).face('laugh', 1500).say('つめたーい！', 'sweat', 1300, 'laugh').pose('tickle', 1200));
          W.after(1600, () => { if (ch.riding === v) land(ch, v, 'i4_elephant', 'ぞうさん シャワー！'); else R.found('i4_elephant'); });
        });
      }, 'パオーン！');
    },
    whaleride(ch, v) {
      water(v);
      mount(ch, v, () => {
        const amp = edgeAmp(v.x, 200);
        move(ch, v, 5000, (k, sx) => ({ x: sx + Math.sin(k * PT.TAU) * amp, z: 10 + Math.sin(k * PT.TAU * 3) * 14, r: Math.cos(k * PT.TAU * 3) * 0.06, f: Math.cos(k * PT.TAU) < 0, fx: () => { if (k > 0.45 && !v._sp) { v._sp = 1; v.spout = W.t + 1800; A.sfx('splash'); W.burst('drop', v.x + 30, v.y - v.z - 130, 14, { up: true, sp: 0.4, minSp: 0.2, g: 0.001, max: 1100, size: 14 }); } } }), () => { v._sp = 0; land(ch, v, 'i4_whale', 'くじらの しおふき！'); });
      }, 'くじらさん よろしく！');
    },
    dragonride(ch, v) {
      mount(ch, v, () => {
        v.flap = true; A.sfx('whoosh'); const amp = edgeAmp(v.x, 380);
        move(ch, v, 6000, (k, sx) => { const a = k * PT.TAU; return { x: sx + Math.sin(a) * amp, z: Math.sin(k * Math.PI) * 300 + Math.sin(a * 2) * 30, r: Math.cos(a) * 0.1, f: Math.cos(a) < 0, fx: () => { if (Math.random() < 0.12) { const d = Math.cos(a) < 0 ? -1 : 1; W.burst('heart', v.x + d * 130 * v.scale, v.y - v.z - 140, 1, { sp: 0.12, max: 900, g: -0.0001 }); } } }; }, () => { v.flap = false; land(ch, v, 'i4_dragon', 'ドラゴンさん ありがとう！', 'heart'); });
        R.audience(v.x, v.y, [ch], 'wow', 2, 1500);
      }, 'ドラゴンさん とんで！');
    },
    pandacar(ch, v) {
      mount(ch, v, () => {
        v.rock = true;
        [72, 74, 76, 72, 76, 72, 76, 74, 76, 77, 77, 76, 74, 77].forEach((n, i) => A.tone(N(n), 0.25, { type: 'square', vol: 0.04, delay: i * 0.28 }));
        X.music(v.x, v.y - 170, 4000);
        move(ch, v, 4400, (k, sx) => ({ x: sx + Math.sin(k * PT.TAU) * 60, f: Math.cos(k * PT.TAU) < 0, cz: Math.abs(Math.sin(k * 30)) * 4 }), () => { v.rock = false; land(ch, v, 'i4_pandacar', 'ゆーら ゆら〜'); });
        const p = W.charOf('panda'); if (p && p !== ch && W.isFree(p)) R.claim(p, 3000).look(v.x).say('ぼくに にてる！', 'pandacar', 1500, 'wow').pose('cheer', 900);
      }, 'パンダさん しゅっぱつ！');
    },
    ridecloud(ch, v) {
      mount(ch, v, () => {
        v.rain = true; A.sfx('magic'); const amp = edgeAmp(v.x, 260);
        move(ch, v, 6000, (k, sx) => ({ x: sx + Math.sin(k * PT.TAU) * amp, z: Math.sin(k * Math.PI) * 220 + Math.sin(k * 20) * 8, pose: k > 0.3 && k < 0.6 ? 'sleep' : 'ride', f: Math.cos(k * PT.TAU) < 0 }), () => { v.rain = false; land(ch, v, 'i4_cloudride', 'ふわっふわ だった〜'); });
      }, 'ふわふわ〜');
    },
    pegasus(ch, v) {
      mount(ch, v, () => {
        A.sfx('pop'); const amp = edgeAmp(v.x, 360);
        move(ch, v, 6200, (k, sx) => {
          if (k < 0.2) return { x: sx + (k / 0.2) * 60, z: Math.abs(Math.sin(k * 40)) * 10 };
          const kk = (k - 0.2) / 0.8, a = kk * PT.TAU;
          return { x: sx + 60 * (1 - kk) + Math.sin(a) * amp, z: Math.sin(kk * Math.PI) * 340, r: -Math.cos(a) * 0.12, f: Math.cos(a) < 0, fx: () => { v.flap = true; if (Math.random() < 0.25) W.burst('spark', v.x, v.y - v.z - 60, 1, { sp: 0.05, max: 700, col: pick(['#ffd23f', '#ff8fe0', '#9fd8ff']), g: 0 }); } };
        }, () => { v.flap = false; X.rainbow(3500); land(ch, v, 'i4_pegasus', 'そらの おさんぽ！'); });
        R.audience(v.x, v.y, [ch], 'wow', 2, 1800);
      }, 'ペガサスさん！');
    },
    snailride(ch, v) {
      mount(ch, v, () => {
        move(ch, v, 5600, (k, sx) => ({ x: sx + k * 70, f: false, pose: k > 0.4 ? 'sleep' : 'ride', fx: () => { if (Math.random() < 0.06) W.burst('spark', v.x - 90 * v.scale, v.y - 6, 1, { sp: 0.02, max: 1600, size: 9, col: pick(['#c9a0ff', '#9fd8ff', '#ffffff']), g: 0 }); } }), () => land(ch, v, 'i4_snail', 'のんびり ついたよ〜', 'zzz'));
        W.after(1600, () => { W.say(ch, 'のーんびり〜', 'snailride', 1600, 'talk'); R.audience(v.x, v.y, [ch], 'laugh', 2, 300); });
      }, 'カタツムリさん いこう');
    },
    turtleride(ch, v) {
      mount(ch, v, () => {
        move(ch, v, 2600, (k, sx) => ({ x: sx + k * 100, f: false, z: Math.abs(Math.sin(k * 10)) * 4 }), () => {
          v.hideT = W.t + 2800; A.sfx('pop'); W.bigText('ひょこっ！', v.x, v.y - 200, '#58c46b');
          move(ch, v, 2600, (k, sx) => ({ x: sx, r: Math.sin(k * 18) * 0.25, pose: 'tickle' }), () => { A.sfx('boing'); land(ch, v, 'i4_turtle', 'あたま かくれちゃった！'); });
        });
      }, 'カメさん のせて！');
    },
    flyingsaucer(ch, v) {
      const tgt = R.free(v.x, v.y, [ch], 1600)[0];
      mount(ch, v, () => {
        for (let i = 0; i < 5; i++) A.tone(900 + i * 120, 0.15, { type: 'sine', vol: 0.06, delay: i * 0.12, vib: 30 });
        const tx = tgt ? tgt.x : v.x + 200, sx0 = v.x;
        move(ch, v, 6400, (k, sx) => {
          const up = Math.min(1, k / 0.15, (1 - k) / 0.15);
          const x = k < 0.3 ? PT.lerp(sx, tx, (k - 0.15) / 0.15 > 0 ? PT.easeInOut(Math.min(1, (k - 0.15) / 0.15)) : 0) : k > 0.7 ? PT.lerp(tx, sx0, PT.easeInOut(Math.min(1, (k - 0.7) / 0.15))) : tx;
          return { x, z: up * 230 + Math.sin(k * 30) * 6, f: false, fx: () => { v.beam = k > 0.3 && k < 0.7; } };
        }, () => { v.beam = false; land(ch, v, 'i4_ufo', 'ピロピロ〜 ただいま！'); });
        if (tgt) W.after(2100, () => { R.claim(tgt, 4000).face('surprise', 2500).say('うわ〜 ういてる！', '!', 1500, 'wow'); R.tween(tgt, 2400, (k) => { tgt.z = Math.sin(k * Math.PI) * 120; tgt.pose = 'fly'; }, () => { tgt.z = 0; }); });
      }, 'ピロピロピロ〜');
    },
  };

  D('i4_police', 'パトカー しゅつどう', 'パトカーに のると ウーウー！ パトロール', ['policecar', 'gaku']);
  D('i4_digger', 'ショベルカーで ほりほり', 'ショベルカーで ほると なにかが でてくる', ['digger', 'pon']);
  D('i4_dump', 'ダンプカーで はこぶ', 'にだいを かたむけて ザザーッ', ['dumptruck', 'moko']);
  D('i4_shinkansen', 'しんかんせん ビューン', 'あっというまに がめんの はしまで', ['bullettrain', 'lulu']);
  D('i4_steam', 'きかんしゃ シュッシュッ', 'きかんしゃの うしろに みんなが つながる', ['steamloco', 'gaku', 'mimi']);
  D('i4_heli', 'ヘリコプターで ホバリング', 'まっすぐ うえに あがって そらを おさんぽ', ['helicopter', 'ricky']);
  D('i4_rocket', '3・2・1 はっしゃ！', 'ロケットで うちゅうまで いって かえってきた', ['minirocket', 'lulu']);
  D('i4_sub', 'うみの そこへ', 'せんすいかんで もぐると おさかなが いっぱい', ['submarine', 'penta']);
  D('i4_yacht', 'かぜで すすむ ヨット', 'ヨットが かぜに のって すいすい', ['yacht', 'sakura']);
  D('i4_canoe', 'カヌーで えっさほいさ', 'パドルで こいで ばしゃばしゃ', ['canoe', 'yuto']);
  D('i4_hotair', 'ききゅうで そらへ', 'ききゅうで ゆっくり たかーく', ['hotairballoon', 'mimi']);
  D('i4_kart', 'ゴーカート レース', 'ぐるぐる まわって ゴール！', ['gokart', 'pon']);
  D('i4_bike', 'バイクで ジャンプ', 'ブルルンと はしって おおジャンプ', ['motorbike', 'gaku']);
  D('i4_scooter', 'キックボード スイスイ', 'あしで けって すすむよ', ['kickscooter', 'choco']);
  D('i4_sled', 'そりで すべろう', 'そりで すいーっと すべりおりる', ['sled', 'pyoko']);
  D('i4_roller', 'ローラースケート', 'くるくる まわって すべるよ', ['rollerskates', 'sakura']);
  D('i4_elephant', 'ぞうさん シャワー', 'ぞうさんの はなから みずが ぴゅー', ['elephantride', 'moko']);
  D('i4_whale', 'くじらの しおふき', 'くじらの せなかから しおふき ぶしゅー', ['whaleride', 'penta']);
  D('i4_dragon', 'やさしい ドラゴン', 'ドラゴンが ハートを ふきながら そらを とぶ', ['dragonride', 'yume']);
  D('i4_pandacar', 'パンダカー', 'おんがくに あわせて ゆーらゆら', ['pandacar', 'panda']);
  D('i4_cloudride', 'くもに のったよ', 'ふわふわの くもで おひるね', ['ridecloud', 'futan']);
  D('i4_pegasus', 'ペガサスと そらへ', 'つばさで とんで にじが でた', ['pegasus', 'mimi']);
  D('i4_snail', 'のんびり カタツムリ', 'とっても ゆっくり…ねむくなっちゃう', ['snailride', 'kon']);
  D('i4_turtle', 'カメさん ひょこっ', 'カメさんが こうらに かくれちゃった', ['turtleride', 'jiji']);
  D('i4_ufo', 'ユーフォーで ピロピロ', 'ユーフォーの ひかりで ともだちが ふわっ', ['flyingsaucer', 'nyan']);

  R.add({ id: 'i4-ride', pri: 66, cd: 300, test: (c) => (isP(c.e, RIDES) && !c.e.rider ? who(c) : null), run(c, ch) { RIDE[c.e.type](ch, c.e); } });
  R.add({ id: 'i4-ride-char', pri: 78, cd: 300, test: (c) => (isC(c.e) && !c.e.riding && isP(c.tgt, RIDES) && !c.tgt.rider ? c.tgt : null), run(c, v) { RIDE[v.type](c.e, v); } });
  R.add({ id: 'i4-ride-tap', on: 'tapprop', pri: 60, cd: 800, test: (c) => (isP(c.e, RIDES) ? c.e : null),
    run(c, v) { if (v.rider) { const ch = W.byId(v.rider); if (ch) W.say(ch, pick(['やっほー！', 'たのしい！', 'みてて！']), v.type, 1200, 'yay'); spark(v.x, v.y - v.z - 60, 6); A.sfx('ding'); return; } const ch = R.one(v.x, v.y); if (ch) RIDE[v.type](ch, v); } });

  /* ---------- がっき ---------- */
  const playSnd = (type, n = 8) => {
    const s = PT.ITEMS[type].snd || {};
    for (let i = 0; i < n; i++) {
      const d = i * 0.26;
      if (s.noise) A.noise(0.06, { vol: 0.16, filter: s.noise, delay: d });
      else if (s.bell) { A.tone(N(88 + (i % 2) * 3), 0.25, { type: 'sine', vol: 0.08, delay: d }); A.noise(0.05, { vol: 0.05, filter: 6000, delay: d }); }
      else if (s.crash) { if (i % 3 === 0) A.noise(0.6, { vol: 0.2, filter: 5000, delay: d }); }
      else A.tone(N(s.notes[i % s.notes.length]), s.len || 0.3, { type: s.type || 'triangle', vol: s.vol || 0.09, delay: d });
    }
  };
  const isInst = (p) => p && p.kind === 'prop' && (tag(p, 'i4inst') || tag(p, 'instrument'));
  const dancers = (x, y, excl, n = 3) => R.free(x, y, excl, 1300).slice(0, n).map((o, i) => {
    R.claim(o, 5200).wait(300 + i * 200).look(x).face('laugh', 2000).pose('dance', 1600).jump(40, 420).pose(i % 2 ? 'spin' : 'dance', 1200).say(i === 0 ? pick(['ノリノリ〜！', 'おどっちゃう！', 'たのしい〜！']) : '', 'note', 1200, 'yay');
    return o;
  });
  const EXTRA = {
    karaokemic(ch, ins) {
      W.special({ type: 'i4spot', max: 4200, draw(c, f, k) { const a = Math.sin(k * Math.PI) * 0.4; c.fillStyle = `rgba(255,250,200,${a})`; G.poly(c, [ch.x - 30, 0, ch.x + 30, 0, ch.x + 110, ch.y + 10, ch.x - 110, ch.y + 10]); c.fill(); } });
      ['ラララ〜♪', 'みんなで うたおう〜♪'].forEach((s, i) => W.after(800 + i * 1500, () => W.say(ch, s, 'note', 1400, 'yay')));
      R.free(ch.x, ch.y, [ch], 1500).slice(0, 3).forEach((o, i) => R.claim(o, 4500).wait(400).look(ch.x).pose('cheer', 1500).say(i ? '' : 'じょうず〜！', 'heart', 1300, 'yay').pose('dance', 1500));
      W.after(3200, () => R.found('i4_sing'));
      return true;
    },
    djset(ch, ins) {
      ins.playing = true;
      W.special({ type: 'i4disco', max: 5200, draw(c, f, k) { const a = Math.sin(k * Math.PI) * 0.35; for (let i = 0; i < 5; i++) { const ang = f.life * 0.0015 + i * 1.25; c.fillStyle = `rgba(${['255,111,145', '255,210,63', '88,196,107', '76,155,232', '195,139,224'][i]},${a})`; G.poly(c, [ins.x, ins.y - 160, ins.x + Math.cos(ang) * 900 - 60, 900, ins.x + Math.cos(ang) * 900 + 60, 900]); c.fill(); } } });
      W.after(5200, () => { ins.playing = false; });
      W.bigText('レッツ ダンス！', ins.x, ins.y - 220, '#c38be0');
      dancers(ins.x, ins.y, [ch], 5);
      W.after(3000, () => R.found('i4_dj'));
      return true;
    },
    recordplayer(ch, ins) {
      ins.playing = true; W.after(4500, () => { ins.playing = false; });
      const ps = R.free(ins.x, ins.y, [ch], 1500).slice(0, 2);
      if (ps.length) { R.claim(ch, 5000).pose('hug', 600); ps.forEach((o) => R.claim(o, 5000).look(ch.x).pose('spin', 2400).pose('hug', 900).face('love', 1500)); }
      W.after(3000, () => R.found('i4_record'));
      return false;
    },
    jinglebell(ch, ins) {
      for (let i = 0; i < 3; i++) W.after(500 + i * 300, () => X.critter('bird', [[W.visLeft - 30, rand(120, 260), 0], [ch.x + rand(-140, 140), ch.y - rand(200, 280), 2200], [ch.x + rand(-60, 60), ch.y - 300, 1400], [W.visRight + 40, rand(80, 200), 2200]]));
      W.after(2600, () => { W.say(ch, 'ことりさんが きた！', 'note', 1400, 'wow'); R.found('i4_bell'); });
      return false;
    },
    cymbals(ch, ins) {
      W.after(500, () => { W.shake = W.t + 400; W.bigText('ジャーン！', ch.x, ch.y - 260, '#ffb547'); W.ring(ch.x, ch.y - 100, '#ffd23f', 700, 160); });
      R.free(ch.x, ch.y, [ch], 1300).slice(0, 4).forEach((o) => W.after(550, () => R.claim(o, 2500).face('surprise', 1200).jump(80, 500).say('びっくり！', '!', 1200, 'wow').face('laugh', 1000)));
      W.after(1800, () => R.found('i4_cymbal'));
      return true;
    },
    flute(ch, ins) {
      for (let i = 0; i < 3; i++) W.after(400 + i * 400, () => X.critter('butterfly', [[ch.x + rand(-300, 300), ch.y - 40, 0], [ch.x + rand(-120, 120), ch.y - rand(160, 240), 1500], [ch.x + rand(-160, 160), ch.y - rand(120, 260), 1500], [ch.x + rand(-300, 300), ch.y - 400, 1500]], { col: pick(['#ffb3d0', '#ffe066', '#b3e0ff']) }));
      W.after(2400, () => R.found('i4_flute'));
      return false;
    },
    violin(ch, ins) {
      const ps = R.free(ch.x, ch.y, [ch], 1500).slice(0, 2);
      ps.forEach((o, i) => R.claim(o, 5000).wait(300).look(ch.x).pose('bow', 600).pose('spin', 1800).pose('bow', 600).face('love', 1200));
      W.after(2500, () => R.found('i4_waltz'));
      return true;
    },
  };
  const BIG_INST = ['djset', 'recordplayer', 'toypiano'];
  const playInst = (ch, ins, n = 8, solo = true) => {
    const big = BIG_INST.includes(ins.type);
    const a = R.claim(ch, 7000).to(ins, big ? -80 : -40, 4, true).look(ins.x);
    if (!big) a.hold(ins.type).do(() => { ins.hidden = true; });
    a.do(() => {
      playSnd(ins.type, n); X.music(ch.x, ch.y - 180 * ch.scale, 2600); ins.wobbleUntil = W.t + 2000;
      let crowd = false;
      if (solo) { const f = EXTRA[ins.type]; crowd = f ? f(ch, ins) : false; if (!crowd) dancers(ins.x, ins.y, [ch], 3); W.after(1500, () => R.found('i4_play')); }
    }).say(solo ? pick(['♪〜', 'きいてて！', 'えんそう するよ！']) : '', ins.type, 1300, null).pose(big ? 'hold' : 'dance', 2600);
    if (!big) a.unhold().do(() => { ins.hidden = false; const p = W.clampFloor(ch.x + 50, ch.y + 4); ins.x = p.x; ins.y = p.y; ins.scale = W.depthScale(ins.y); });
    a.pose('cheer', 600);
  };
  R.add({ id: 'i4-inst', pri: 66, cd: 400, test: (c) => (isP(c.e, INST) && !c.e.hidden ? who(c) : null),
    run(c, ch) {
      const ins = c.e;
      const others = nearP(ins.x, ins.y, 700, (p) => p !== ins && isInst(p) && !p.hidden).slice(0, 3);
      if (!others.length) { playInst(ch, ins); return; }
      // バンド！
      const all = [ins].concat(others);
      const players = [ch].concat(R.avail(ins.x, ins.y, [ch], 3000)).slice(0, all.length);
      W.bigText('バンド けっせい！', ins.x, ins.y - 220, '#9b6fd6'); A.sfx('jingle');
      players.forEach((p, i) => {
        const it = all[i];
        if (tag(it, 'i4inst')) playInst(p, it, 12, false);
        else { R.claim(p, 7000).to(it, -40, 4, true).hold(it.type).do(() => { it.hidden = true; }).pose('dance', 3000).unhold().do(() => { it.hidden = false; const q = W.clampFloor(p.x + 50, p.y + 4); it.x = q.x; it.y = q.y; }); }
      });
      X.music(ins.x, ins.y - 200, 5000);
      dancers(ins.x, ins.y, players, 3);
      W.after(3500, () => { X.confetti(ins.x, 1400); R.found('i4_band'); });
    } });
  R.add({ id: 'i4-inst-tap', on: 'tapprop', pri: 60, cd: 600, test: (c) => (isP(c.e, INST) ? c.e : null),
    run(c, ins) { playSnd(ins.type, 4); ins.wobbleUntil = W.t + 900; W.burst('note', ins.x, ins.y - 60, 3, { up: true, sp: 0.1, g: -0.00002, max: 1200, size: 16, col: pick(COLS) }); const o = R.free(ins.x, ins.y, [], 700)[0]; if (o) R.claim(o, 1800).look(ins.x).pose('dance', 1400); } });
  // むかしの がっきを わたしの がっきの そばに おいても バンドに
  R.add({ id: 'i4-inst-old', pri: 51, cd: 400, test: (c) => (c.e.kind === 'prop' && tag(c.e, 'instrument') && nearP(c.e.x, c.e.y, 700, (p) => tag(p, 'i4inst') && !p.hidden).length ? nearP(c.e.x, c.e.y, 700, (p) => tag(p, 'i4inst') && !p.hidden)[0] : null),
    run(c, mine) { const ch = R.one(mine.x, mine.y); if (ch) R.list.find((r) => r.id === 'i4-inst').run({ e: mine, x: mine.x, y: mine.y }, ch); } });

  D('i4_play', 'がっきで ダンス', 'がっきを ならすと ちかくの みんなが おどりだす', ['violin', 'choco']);
  D('i4_band', 'みんなで バンド', 'がっきを 2つ いじょう ならべると バンド けっせい！', ['accordion', 'flute', 'cymbals']);
  D('i4_sing', 'マイクで うたおう', 'マイクで うたうと スポットライトが あたる', ['karaokemic', 'sakura']);
  D('i4_dj', 'DJ パーティー', 'DJ セットで ライトが ぐるぐる', ['djset', 'ricky']);
  D('i4_record', 'レコードで ダンス', 'レコードを かけると ペアで くるくる', ['recordplayer', 'mama', 'papa']);
  D('i4_bell', 'すずの ねいろ', 'すずを ならすと ことりが あつまってくる', ['jinglebell', 'baba']);
  D('i4_cymbal', 'ジャーン！', 'シンバルの おとで みんな びっくり', ['cymbals', 'pon']);
  D('i4_flute', 'ふえと ちょうちょ', 'フルートを ふくと ちょうちょが まう', ['flute', 'yume']);
  D('i4_waltz', 'バイオリンで ワルツ', 'バイオリンに あわせて くるくる', ['violin', 'sakura']);

  /* ---------- ふしぎ ---------- */
  const night = (ms, a0 = 0.45) => W.special({ type: 'i4night', max: ms, draw(c, f, k) { const a = Math.min(1, k * 6, (1 - k) * 6) * a0; c.fillStyle = `rgba(20,25,70,${a})`; c.fillRect(-500, -100, 2600, 1200); } });
  const lookUp = (x, y, lines, icon, n = 3, pose = 'point') => R.free(x, y, [], 1800).slice(0, n).map((o, i) => { R.claim(o, 4000).wait(i * 200).look(x).face('surprise', 1200).pose(pose, 1400).say(lines[i % lines.length], icon, 1500, 'wow'); return o; });
  const MAG = {
    starjar(p) {
      A.sfx('magic'); night(5200);
      for (let i = 0; i < 12; i++) W.after(i * 120, () => W.burst('star', p.x, p.y - 80, 1, { up: true, sp: 0.4, minSp: 0.2, g: -0.00005, max: 2600, size: rand(10, 16), col: '#fff3a0' }));
      W.after(1200, () => X.constellation([[p.x - 200, 160], [p.x - 90, 110], [p.x + 10, 170], [p.x + 120, 120], [p.x + 220, 180]].map(([x, y]) => [PT.clamp(x, W.visLeft + 60, W.visRight - 60), y]), 'ほしの ビン'));
      lookUp(p.x, p.y, ['おほしさま！', 'きらきら〜', 'きれい！'], 'star');
      W.after(2000, () => R.found('i4_starjar'));
    },
    snowcrystal(p) {
      A.sfx('bell');
      let acc = 0;
      W.special({ type: 'i4snow', max: 5000, step(f, dt) { acc += dt; if (acc > 45) { acc = 0; W.fx.push({ type: 'star', x: rand(W.visLeft, W.visRight), y: rand(-20, 80), vx: rand(-0.03, 0.03), vy: 0.14, life: 0, max: 4500, size: rand(5, 9), col: '#e8f6ff', rot: 0, vr: 0.002, g: 0 }); } }, draw(c, f, k) { c.fillStyle = `rgba(220,240,255,${0.25 * Math.sin(k * Math.PI)})`; c.fillRect(-500, -100, 2600, 1200); } });
      R.free(p.x, p.y, [], 1800).slice(0, 3).forEach((o, i) => R.claim(o, 4500).look(p.x).face('surprise', 1000).pose('tickle', 1200).say('さむ〜い！', 'snowcrystal', 1200, 'laugh').face('laugh', 1200).jump(50, 500).say(i ? '' : 'ゆきだ〜！', 'star', 1200, 'yay').pose('spin', 900));
      W.after(2200, () => R.found('i4_snowcrystal'));
    },
    aurorabox(p) {
      A.sfx('magic'); night(7000, 0.35);
      W.special({ type: 'i4aurora', max: 7000, draw(c, f, k) {
        const a = Math.min(1, k * 4, (1 - k) * 4);
        ['rgba(120,255,190,', 'rgba(150,200,255,', 'rgba(220,160,255,'].forEach((col, i) => {
          c.fillStyle = col + (0.35 * a) + ')'; c.beginPath(); c.moveTo(W.visLeft, 40);
          for (let x = W.visLeft; x <= W.visRight; x += 60) c.lineTo(x, 120 + i * 50 + Math.sin(x * 0.004 + f.life * 0.0012 + i * 1.7) * 50);
          for (let x = W.visRight; x >= W.visLeft; x -= 60) c.lineTo(x, 60 + i * 40 + Math.sin(x * 0.005 + f.life * 0.001 + i) * 30);
          c.closePath(); c.fill();
        });
      } });
      R.free(p.x, p.y, [], 2000).slice(0, 4).forEach((o, i) => R.claim(o, 5000).wait(i * 250).face('love', 3000).pose('sit', 2600).say(i ? '' : 'オーロラ だ…きれい…', 'aurorabox', 1800, 'wow'));
      W.after(2500, () => R.found('i4_aurora'));
    },
    shootingstar(p) {
      A.sfx('sparkle');
      const y0 = rand(80, 160);
      W.special({ type: 'i4shoot', max: 1600, draw(c, f, k) { const x = PT.lerp(W.visRight + 100, W.visLeft - 100, k), y = y0 + k * 200; const g = c.createLinearGradient(x, y, x + 220, y - 90); g.addColorStop(0, 'rgba(255,240,160,.95)'); g.addColorStop(1, 'rgba(255,240,160,0)'); c.strokeStyle = g; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 220, y - 90); c.stroke(); G.star(c, x, y, 18, 8); c.fillStyle = '#fff6b8'; c.fill(); } });
      const kids = R.free(p.x, p.y, [], 1800).slice(0, 3);
      kids.forEach((o, i) => R.claim(o, 5000).wait(i * 150).face('surprise', 800).pose('point', 800).say('ながれぼし！', 'shootingstar', 1200, 'wow').pose('hug', 1600).face('sleep', 1500).say(['おねがい…', 'ケーキが たべたい…', 'ともだちが ふえますように'][i], 'star', 1500, 'talk'));
      W.after(3400, () => { const q = W.addProp(pick(['present', 'cake', 'balloon', 'star']), p.x + rand(-120, 120), p.y + 10); if (q) q.pop = W.t; A.sfx('cheer'); spark(p.x, p.y - 80, 12, '#ffd23f'); R.found('i4_wish'); });
    },
    bubblemachine(p) {
      p.on = true; A.sfx('bubble');
      for (let i = 0; i < 8; i++) W.after(i * 400, () => { W.addBubbles(p.x + 60 * p.scale, p.y - 40, 3); A.sfx('bubble'); });
      W.after(3400, () => { p.on = false; });
      R.free(p.x, p.y, [], 1600).slice(0, 3).forEach((o, i) => R.claim(o, 5000).wait(600 + i * 200).to(p, -160 + i * 160, 30, true).jump(90, 600).say(i ? '' : 'まて まて〜！', 'bubblemachine', 1300, 'laugh').jump(90, 600).face('laugh', 900));
      W.after(2500, () => R.found('i4_bubblemachine'));
    },
    smokecloud(p) {
      const cs = R.free(p.x, p.y, [], 1800).slice(0, 3);
      A.sfx('whoosh'); W.bigText('どろん！', p.x, p.y - 160, '#9b6fd6');
      cs.forEach((o) => W.poof(o.x, o.y - 80));
      if (cs.length >= 2) {
        const pos = cs.map((o) => ({ x: o.x, y: o.y }));
        W.after(300, () => cs.forEach((o, i) => { const q = pos[(i + 1) % pos.length]; o.x = q.x; o.y = q.y; o.scale = W.depthScale(o.y); W.poof(o.x, o.y - 80); R.claim(o, 3000).face('puzzled', 1500).pose('think', 900).say(i ? 'あれれ？' : 'いれかわった！？', '?', 1400, 'hmm').face('laugh', 900); }));
      } else cs.forEach((o) => { const q = W.randFloor(160); W.after(300, () => { o.x = q.x; o.y = q.y; o.scale = W.depthScale(o.y); W.poof(o.x, o.y - 80); R.claim(o, 2500).face('puzzled', 1500).say('あれれ？', '?', 1300, 'hmm'); }); });
      W.after(1500, () => R.found('i4_swap'));
    },
    fireflyjar(p) {
      night(6500, 0.5); A.sfx('sparkle');
      for (let i = 0; i < 10; i++) { const sx = p.x + rand(-40, 40), sy = p.y - 60; X.critter('firefly', [[sx, sy, 0], [sx + rand(-300, 300), sy - rand(60, 260), 2000], [sx + rand(-400, 400), sy - rand(80, 320), 2000], [sx + rand(-500, 500), sy - rand(200, 400), 2000]]); }
      lookUp(p.x, p.y, ['ほたるだ…', 'ひかってる！', 'きれいだね'], 'fireflyjar');
      W.after(2400, () => R.found('i4_firefly'));
    },
    butterflyjar(p) {
      A.sfx('sparkle');
      const ch = R.free(p.x, p.y, [], 1500)[0];
      for (let i = 0; i < 6; i++) { const cx = ch ? ch.x : p.x, cy = ch ? ch.y : p.y; X.critter('butterfly', [[p.x, p.y - 50, 0], [cx + rand(-120, 120), cy - rand(140, 240), 1400], [cx + rand(-80, 80), cy - rand(180, 260), 1400], [cx + rand(-160, 160), cy - rand(120, 220), 1400], [rand(W.visLeft, W.visRight), -40, 2200]], { col: pick(['#ffb3d0', '#ffe066', '#b3e0ff', '#c9a0ff']) }); }
      if (ch) R.claim(ch, 5000).look(p.x).face('love', 2000).pose('spin', 1500).say('ちょうちょさん まって〜', 'butterflyjar', 1500, 'yay').pose('dance', 1500);
      W.after(2400, () => R.found('i4_butterfly'));
    },
  };
  // キャラに つかう ふしぎ（ch を うけとる）
  const MAGC = {
    fairydust(p, ch) {
      A.sfx('magic'); spark(ch.x, ch.y - 140, 14, '#ffc4e8');
      R.claim(ch, 6000).say('からだが かるい！', 'fairydust', 1300, 'wow').do(() => {
        const sx = ch.x;
        R.tween(ch, 4200, (k) => { ch.z = Math.sin(k * Math.PI) * 200 + Math.sin(k * 20) * 10; ch.x = sx + Math.sin(k * PT.TAU) * 80; ch.pose = 'fly'; ch.face = 'laugh'; if (Math.random() < 0.3) W.burst('spark', ch.x, ch.y - ch.z - 60, 1, { sp: 0.04, max: 700, size: 8, col: pick(['#ffc4e8', '#ffe066', '#c9a0ff']), g: 0 }); }, () => { ch.z = 0; ch.face = 'happy'; R.found('i4_fairyfly'); W.act(ch).say('ようせいさんに なれた！', 'star', 1400, 'yay'); });
      });
      R.audience(ch.x, ch.y, [ch], 'wow', 2, 800);
    },
    teleportdoor(p, ch) {
      p.openT = W.t + 5000; A.sfx('magic');
      R.claim(ch, 8000).to(p, 0, 6, true).say('はいって みよう！', 'teleportdoor', 1100, 'yay').do(() => {
        ch.hidden = true; ch.stay = true; W.poof(p.x, p.y - 80); A.sfx('whoosh');
        W.after(1200, () => {
          const q = W.randFloor(160); ch.x = q.x; ch.y = q.y; ch.scale = W.depthScale(q.y); ch.hidden = false; ch.stay = false;
          W.ring(q.x, q.y - 80, '#c38be0', 800, 140); W.poof(q.x, q.y - 80); spark(q.x, q.y - 120, 12, '#c9a0ff'); A.sfx('pop');
          R.claim(ch, 3000).face('surprise', 1200).say('あれ？ ここ どこ？', '?', 1500, 'wow').jump(50, 450).face('laugh', 900).do(() => R.found('i4_teleport'));
        });
      });
    },
    tinyshroom(p, ch) { size(p, ch, 0.45, 'ちいさく なっちゃった！', 'i4_shrink'); },
    bigshroom(p, ch) { size(p, ch, 1.75, 'おおきく なった〜！', 'i4_grow'); },
    balloonbunch(p, ch) {
      W.remove(p);
      R.claim(ch, 8000).hold('balloonbunch').say('ふうせん いっぱい！', 'balloonbunch', 1200, 'yay').do(() => {
        A.sfx('whoosh'); const sx = ch.x;
        R.tween(ch, 5000, (k) => { ch.z = Math.sin(k * Math.PI) * 260; ch.x = sx + Math.sin(k * PT.TAU * 1.5) * 50; ch.pose = 'hold'; ch.face = k > 0.2 && k < 0.6 ? 'surprise' : 'laugh'; }, () => {
          ch.z = 0; ch.holdType = null; const q = W.addProp('balloonbunch', ch.x + 60, ch.y + 4); if (q) q.pop = W.t;
          R.found('i4_balloonfly'); W.act(ch).say('ふわ〜って とんだ！', 'star', 1400, 'yay');
        });
      });
      R.audience(ch.x, ch.y, [ch], 'wow', 2, 1400);
    },
    heartfeel(p, ch) {
      const b = R.free(ch.x, ch.y, [ch], 2000)[0];
      A.sfx('sparkle'); W.burst('heart', p.x, p.y - 60, 8, { up: true, sp: 0.2, max: 1400 });
      if (!b) { R.claim(ch, 3000).pose('hug', 1500).face('love', 1500).say('ぽかぽか〜', 'heart', 1400, 'yay').do(() => R.found('i4_hug')); return; }
      const mx = (ch.x + b.x) / 2, my = (ch.y + b.y) / 2;
      R.claim(ch, 6000).go(mx - 50, my, true).look(mx + 50).face('love', 2500).pose('hug', 1800).say('だいすき！', 'heart', 1500, 'yay');
      R.claim(b, 6000).go(mx + 50, my, true).look(mx - 50).face('love', 2500).pose('hug', 1800).say('わたしも！', 'heart', 1500, 'yay').do(() => { W.burst('heart', mx, my - 150, 10, { up: true, sp: 0.2, max: 1400 }); A.sfx('cheer'); R.found('i4_hug'); });
    },
    rainbowbridge(p, ch) {
      const sx = ch.x, tx = PT.clamp(sx + (sx < PT.W / 2 ? 460 : -460), W.visLeft + 80, W.visRight - 80), y = ch.y, mid = (sx + tx) / 2, rad = Math.abs(tx - sx) / 2;
      A.sfx('magic');
      W.special({ type: 'i4bridge', max: 6200, draw(c, f, k) { const a = Math.min(1, k * 6, (1 - k) * 5); c.save(); c.globalAlpha = a * 0.85; ['#ff6b6b', '#ffa94d', '#ffd84a', '#69db7c', '#4dabf7', '#9775fa'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 12; c.beginPath(); c.ellipse(mid, y + 6, rad + 30 - i * 11, rad * 0.75 + 30 - i * 11, 0, Math.PI, 0); c.stroke(); }); c.restore(); } });
      R.claim(ch, 7000).say('にじを わたろう！', 'rainbowbridge', 1300, 'yay').do(() => {
        R.tween(ch, 3400, (k) => { const a = Math.PI - k * Math.PI; ch.x = mid + Math.cos(a) * rad; ch.z = Math.sin(a) * (rad * 0.75 + 4); ch.flip = tx < sx; ch.pose = 'walk'; ch.poseT += 16; }, () => { ch.z = 0; R.found('i4_bridge'); W.act(ch).pose('cheer', 900).say('わたれた〜！', 'star', 1300, 'yay'); });
      });
      R.audience(ch.x, ch.y, [ch], 'wow', 2, 1500);
    },
    rainbowcane(p, ch) {
      const tg = [ch].concat(R.free(ch.x, ch.y, [ch], 1500).slice(0, 2));
      W.remove(p); ch.holdType = 'rainbowcane'; A.sfx('magic');
      const a = R.claim(ch, 7000).say('にじいろに なあれ！', 'rainbowcane', 1300, 'yay').pose('point', 600);
      tg.forEach((o, i) => a.do(() => {
        if (o !== ch) X.beam(ch.x, ch.y - 110 * ch.scale, o.x, o.y - 80, 700);
        W.after(400, () => { o.wear = Object.assign({}, o.wear, { body: 'gown_rainbow', hat: 'tiara_rainbow' }); o.role = 'rainbowprincess'; spark(o.x, o.y - 120, 14); A.sfx('sparkle'); if (o !== ch) R.claim(o, 2200).pose('spin', 1000).say('にじいろ〜！', 'star', 1200, 'yay'); });
      }).wait(700));
      a.do(() => { ch.holdType = null; const q = W.addProp('rainbowcane', ch.x + 60, ch.y + 4); if (q) q.pop = W.t; X.rainbow(3500); R.found('i4_rainbowdress'); });
    },
    kaleidoscope(p, ch) {
      R.claim(ch, 5000).to(p, -60, 4, true).hold('kaleidoscope').do(() => { p.hidden = true; }).pose('peek', 600).say('のぞいて みよう…', 'kaleidoscope', 1100, 'talk').do(() => {
        A.sfx('magic');
        W.special({ type: 'i4kaleido', max: 3200, draw(c, f, k) { const a = Math.min(1, k * 6, (1 - k) * 5) * 0.55; c.save(); c.globalAlpha = a; c.translate(ch.x, 330); c.rotate(f.life * 0.0008); for (let i = 0; i < 12; i++) { c.rotate(PT.TAU / 12); c.fillStyle = COLS[i % 6]; G.ell(c, 0, -170 - Math.sin(f.life * 0.003 + i) * 40, 34, 90); c.fill(); G.star(c, 0, -330, 20, 9); c.fillStyle = '#ffffff'; c.fill(); } c.restore(); } });
      }).pose('peek', 2400).face('laugh', 1000).say('くるくる きれい〜！', 'star', 1300, 'yay').unhold().do(() => { p.hidden = false; const q = W.clampFloor(ch.x + 50, ch.y + 4); p.x = q.x; p.y = q.y; R.found('i4_kaleido'); });
    },
    bigbubble(p, ch) {
      W.remove(p); A.sfx('bubble');
      R.claim(ch, 7000).say('シャボンだまに はいっちゃった！', 'bigbubble', 1300, 'wow').do(() => {
        const sx = ch.x;
        W.special({ type: 'i4bub', max: 4600, draw(c, f, k) { const r = 100 * ch.scale; const cx = ch.x, cy = ch.y - ch.z - 90 * ch.scale; c.save(); c.globalAlpha = k > 0.95 ? 0 : 1; G.circ(c, cx, cy, r); c.fillStyle = 'rgba(190,230,255,.22)'; c.fill(); c.strokeStyle = 'rgba(150,200,255,.9)'; c.lineWidth = 4; c.stroke(); G.ell(c, cx - r * 0.4, cy - r * 0.45, r * 0.22, r * 0.12, -0.6); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); c.restore(); } });
        R.tween(ch, 4400, (k) => { ch.z = Math.sin(k * Math.PI) * 230; ch.x = sx + Math.sin(k * Math.PI * 2) * 120; ch.pose = 'sit'; ch.face = 'laugh'; }, () => { ch.z = 0; spark(ch.x, ch.y - 100, 12, '#bfe9ff'); A.sfx('pop'); R.found('i4_bubbleride'); W.act(ch).face('surprise', 800).say('パチン！', '!', 1200, 'wow').face('laugh', 900); });
      });
      R.audience(ch.x, ch.y, [ch], 'laugh', 2, 1200);
    },
    wishbottle(p, ch) {
      R.claim(ch, 6000).to(p, -60, 4, true).look(p.x).pose('hug', 1400).face('sleep', 1300).say('おねがい…', 'wishbottle', 1300, 'talk').do(() => {
        A.sfx('magic'); spark(p.x, p.y - 70, 16, '#ffe066');
        const opts = [['ケーキ だいすき！', 'cake'], ['ユニコーンさん！', 'unicorn'], ['ふうせん！', 'balloon'], ['ぬいぐるみ！', 'teddy'], ['プレゼント！', 'present']];
        const [txt, id] = pick(opts); const q = W.addProp(PT.ITEMS[id] ? id : 'star', p.x + 90, p.y + 10); if (q) q.pop = W.t;
        W.say(ch, 'かなった！ ' + txt, id, 1600, 'yay'); R.found('i4_wishbottle');
      }).pose('cheer', 900);
    },
  };
  function size(p, ch, to, line, disc) {
    W.remove(p);
    R.claim(ch, 7000).pose('eat', 800).say('もぐもぐ…', p.type, 900, 'talk').do(() => {
      A.sfx(to > 1 ? 'boing' : 'magic'); if (to > 1) W.after(900, () => { W.shake = W.t + 500; W.bigText('ドシーン！', ch.x, ch.y - 300, '#ff6f61'); });
      const s0 = W.depthScale(ch.y);
      R.tween(ch, 4200, (k) => { const m = k < 0.2 ? PT.easeBack(k / 0.2) : k > 0.85 ? (1 - k) / 0.15 : 1; ch.scale = s0 * (1 + (to - 1) * PT.clamp(m, 0, 1.15)); ch.pose = to > 1 ? 'roar' : 'jump'; ch.z = to < 1 ? Math.abs(Math.sin(k * 20)) * 20 : 0; }, () => { ch.scale = W.depthScale(ch.y); ch.z = 0; R.found(disc); W.act(ch).say('もとに もどった！', 'star', 1300, 'laugh'); });
      W.say(ch, line, '!', 1500, 'wow');
    });
    R.audience(ch.x, ch.y, [ch], 'laugh', 2, 1400);
  }
  // キャラ ぜんぶに かかる ふしぎ
  Object.assign(MAG, {
    toyplanet(p) {
      A.sfx('magic'); p.wobbleUntil = W.t + 3600;
      const cs = R.free(p.x, p.y, [], 1600).slice(0, 4);
      W.bigText('ふわ〜ん', p.x, p.y - 180, '#9b6fd6');
      cs.forEach((o, i) => { R.claim(o, 5000); const s = rand(0, 6); R.tween(o, 3600, (k) => { o.z = Math.sin(k * Math.PI) * (110 + i * 30) + Math.sin(k * 12 + s) * 14; o.pose = i % 2 ? 'fly' : 'spin'; o.face = 'laugh'; }, () => { o.z = 0; W.say(o, i ? '' : 'むじゅうりょく〜！', 'toyplanet', 1300, 'yay'); }); });
      W.after(3700, () => R.found('i4_zerog'));
    },
    sunorb(p) {
      A.sfx('cheer');
      W.special({ type: 'i4sun', max: 5000, draw(c, f, k) { const a = Math.min(1, k * 5, (1 - k) * 5); c.fillStyle = `rgba(255,236,150,${0.3 * a})`; c.fillRect(-500, -100, 2600, 1200); c.save(); c.globalAlpha = a; c.translate(W.visRight - 160, 120); c.rotate(f.life * 0.0008); c.fillStyle = '#ffb547'; for (let i = 0; i < 12; i++) { c.rotate(PT.TAU / 12); G.poly(c, [-14, -70, 0, -100, 14, -70]); c.fill(); } G.circ(c, 0, 0, 62); c.fillStyle = '#ffd23f'; c.fill(); c.restore(); } });
      R.free(p.x, p.y, [], 2000).slice(0, 4).forEach((o, i) => R.claim(o, 4000).wait(i * 200).do(() => { o.wear = Object.assign({}, o.wear, { face: 'sunglasses' }); spark(o.x, o.y - 110, 5, '#ffd23f'); }).face('laugh', 1500).pose('cheer', 1200).say(i ? '' : 'まぶしい〜！', 'sunorb', 1300, 'yay'));
      W.after(2000, () => R.found('i4_sunny'));
    },
    raincloud(p) {
      A.sfx('wave');
      let acc = 0;
      W.special({ type: 'i4rain', max: 4200, step(f, dt) { acc += dt; if (acc > 25) { acc = 0; W.fx.push({ type: 'drop', x: rand(W.visLeft, W.visRight), y: rand(-20, 40), vx: 0, vy: 0.9, life: 0, max: 900, size: rand(8, 12), col: '#7fd0f8', rot: 0, vr: 0, g: 0 }); } }, draw(c, f, k) { c.fillStyle = `rgba(90,110,150,${0.25 * Math.sin(k * Math.PI)})`; c.fillRect(-500, -100, 2600, 1200); } });
      const cs = R.free(p.x, p.y, [], 2000).slice(0, 4);
      cs.forEach((o, i) => R.claim(o, 6000).face('surprise', 800).say(i ? '' : 'あめだ〜！', 'raincloud', 1000, 'wow').hold('umbrella').pose('hold', 2800).face('laugh', 1200).unhold());
      W.after(4300, () => { X.rainbow(4000); A.sfx('sparkle'); lookUp(p.x, p.y, ['にじだ！', 'わあ！'], 'rainbow', 2); R.found('i4_rain'); });
    },
    windbag(p) {
      A.sfx('whoosh'); W.after(500, () => A.sfx('whoosh'));
      const d = p.x < PT.W / 2 ? 1 : -1;
      for (let i = 0; i < 20; i++) W.after(i * 80, () => W.fx.push({ type: 'leaf', x: p.x + rand(-40, 40), y: p.y - rand(20, 260), vx: d * rand(0.5, 0.9), vy: rand(-0.08, 0.05), life: 0, max: 1600, size: rand(14, 22), col: pick(['#7bd36a', '#ffd23f', '#ffffff', '#ff8fb1']), rot: rand(0, 6), vr: 0.01, g: 0 }));
      nearP(p.x, p.y, 700, (q) => q !== p && !q.rider && !q.heldBy && !q.hidden && !q.def.float).slice(0, 8).forEach((q) => { q.vx = d * rand(0.4, 0.7); q.vy = rand(-0.05, 0.05); });
      R.free(p.x, p.y, [], 1400).slice(0, 4).forEach((o, i) => { R.claim(o, 3500).face('surprise', 1500).say(i ? '' : 'わわわ〜！', 'windbag', 1200, 'wow'); const sx = o.x; R.tween(o, 1200, (k) => { o.x = sx + d * PT.easeOut(k) * 140; o.pose = 'trip'; }, () => { const q = W.clampFloor(o.x, o.y); o.x = q.x; W.act(o).face('laugh', 1000).pose('tickle', 800); }); });
      W.after(1600, () => R.found('i4_wind'));
    },
    sleepyclock(p) {
      A.sfx('ghost');
      const cs = R.free(p.x, p.y, [], 1600).slice(0, 4);
      cs.forEach((o, i) => R.claim(o, 6500).wait(i * 200).say(i ? '' : 'ふあ〜あ…', 'zzz', 1100, 'hmm').face('sleep', 3200).pose('sleep', 3000).do(() => { }));
      for (let i = 0; i < 6; i++) W.after(1200 + i * 350, () => cs.forEach((o) => W.burst('zzz', o.x + 20, o.y - 140 * o.scale, 1, { up: true, sp: 0.05, g: 0, max: 1200, size: 22 })));
      W.after(4000, () => { p.wobbleUntil = W.t + 1400; W.bigText('ジリリリ！', p.x, p.y - 160, '#ff6f61'); for (let i = 0; i < 10; i++) A.tone(1400, 0.05, { type: 'square', vol: 0.05, delay: i * 0.08 }); cs.forEach((o) => R.claim(o, 2200).face('surprise', 900).jump(90, 500).say('おきた！', '!', 1100, 'wow').face('laugh', 900)); R.found('i4_sleepy'); });
    },
    giggleflower(p) {
      A.sfx('tickle'); W.burst('spark', p.x, p.y - 90, 10, { sp: 0.15, col: '#ffd23f', g: 0 });
      const cs = R.free(p.x, p.y, [], 1600).slice(0, 4);
      cs.forEach((o, i) => R.claim(o, 4500).wait(i * 250).face('laugh', 3000).pose('tickle', 2400).say(pick(['あはは！', 'くすぐったい〜！', 'うふふふ！']), null, 1400, 'laugh').pose('jump', 400));
      for (let i = 0; i < 3; i++) W.after(500 + i * 600, () => A.sfx('tickle'));
      W.after(2200, () => R.found('i4_giggle'));
    },
    magnetstar(p) {
      A.sfx('zap'); W.ring(p.x, p.y - 50, '#ff8fb1', 800, 200);
      const qs = nearP(p.x, p.y, 900, (q) => q !== p && !q.rider && !q.heldBy && !q.hidden && !q.def.float && q.type !== 'magnetstar').slice(0, 8);
      qs.forEach((q, i) => { const sx = q.x, sy = q.y, a = (i / Math.max(1, qs.length)) * PT.TAU, tx = p.x + Math.cos(a) * 110, ty = p.y + Math.sin(a) * 30; R.tween(q, 1000, (k) => { const e = PT.easeInOut(k); q.x = PT.lerp(sx, tx, e); q.y = PT.lerp(sy, ty, e); q.z = Math.sin(k * Math.PI) * 60; q.scale = W.depthScale(q.y); }, () => { q.z = 0; const c2 = W.clampFloor(q.x, q.y); q.x = c2.x; q.y = c2.y; q.scale = W.depthScale(q.y); A.sfx('pop'); }); });
      const o = R.free(p.x, p.y, [], 1400)[0]; if (o) R.claim(o, 3000).look(p.x).face('surprise', 1200).say(qs.length ? 'くっついた〜！' : 'なにも ない…', 'magnetstar', 1400, 'wow');
      W.after(1300, () => R.found('i4_magnet'));
    },
    shadowlamp(p) {
      night(6500, 0.5); A.sfx('magic');
      const sx = PT.clamp(p.x, W.visLeft + 220, W.visRight - 220);
      X.shadowShow(sx, 260, pick([['rabbit', 'bird', 'dog'], ['dino', 'rabbit', 'bird'], ['bird', 'dog', 'dino']]), 6000);
      R.free(p.x, p.y, [], 2000).slice(0, 4).forEach((o, i) => R.claim(o, 6500).wait(i * 200).look(sx).pose('sit', 2500).face('surprise', 1500).say(['うさぎさん！', 'とりさんだ！', 'わんわん！', 'かっこいい！'][i], 'shadowlamp', 1500, 'wow').face('laugh', 1500));
      W.after(3000, () => R.found('i4_shadowshow'));
    },
    luckyclover(p) {
      A.sfx('sparkle'); spark(p.x, p.y - 80, 14, '#58c46b');
      const r = Math.floor(rand(0, 3));
      W.bigText('ラッキー！', p.x, p.y - 180, '#58c46b');
      if (r === 0) { const q = W.addProp('present', p.x + 90, p.y + 10); if (q) q.pop = W.t; }
      else if (r === 1) X.confetti(p.x, 1600);
      else X.rainbow(4000);
      const o = R.free(p.x, p.y, [], 1500)[0]; if (o) R.claim(o, 3500).look(p.x).jump(60, 500).face('laugh', 1500).say('いいこと あった！', 'luckyclover', 1500, 'yay').pose('cheer', 900);
      W.after(1200, () => R.found('i4_lucky'));
    },
  });
  const ON_CHAR = Object.keys(MAGC);
  R.add({ id: 'i4-magic', pri: 66, cd: 400, test: (c) => (isP(c.e, MAGIC) && !c.e.hidden ? (ON_CHAR.includes(c.e.type) ? who(c) : 1) : null),
    run(c, ch) { const p = c.e; if (MAGC[p.type]) MAGC[p.type](p, ch); else MAG[p.type](p); } });
  R.add({ id: 'i4-magic-tap', on: 'tapprop', pri: 60, cd: 1500, test: (c) => (isP(c.e, MAGIC) && !c.e.hidden ? (ON_CHAR.includes(c.e.type) ? R.one(c.e.x, c.e.y) || null : 1) : null),
    run(c, ch) { const p = c.e; p.wobbleUntil = W.t + 500; if (MAGC[p.type]) MAGC[p.type](p, ch); else MAG[p.type](p); } });

  D('i4_starjar', 'ほしの ビン', 'ビンを あけると おほしさまが そらへ', ['starjar', 'lulu']);
  D('i4_snowcrystal', 'ゆきの まほう', 'けっしょうで ゆきが ふってくる', ['snowcrystal', 'pyoko']);
  D('i4_aurora', 'オーロラ', 'そらに ゆらゆら ひかりの カーテン', ['aurorabox', 'yume']);
  D('i4_wish', 'ながれぼしに おねがい', 'おねがいごとを すると プレゼントが…？', ['shootingstar', 'mimi']);
  D('i4_bubblemachine', 'シャボンだま いっぱい', 'マシンから シャボンだまが どんどん', ['bubblemachine', 'pon']);
  D('i4_swap', 'どろんで いれかわり', 'けむりの くもで みんなの ばしょが いれかわる', ['smokecloud', 'kon']);
  D('i4_firefly', 'ほたるの よる', 'ビンから ほたるが ふわふわ', ['fireflyjar', 'futan']);
  D('i4_butterfly', 'ちょうちょと あそぼう', 'かごから ちょうちょが まいあがる', ['butterflyjar', 'sakura']);
  D('i4_fairyfly', 'ようせいの こなで ふわり', 'こなを かけると そらに うかぶ', ['fairydust', 'mimi']);
  D('i4_teleport', 'テレポート！', 'とびらに はいると ちがう ばしょに', ['teleportdoor', 'gaku']);
  D('i4_shrink', 'ちいさく なっちゃった', 'あおい キノコを たべると ちいさく', ['tinyshroom', 'pon']);
  D('i4_grow', 'おおきく なっちゃった', 'あかい キノコを たべると おおきく', ['bigshroom', 'moko']);
  D('i4_balloonfly', 'ふうせんで ふわふわ', 'ふうせんの たばで そらへ', ['balloonbunch', 'choco']);
  D('i4_hug', 'ハートの きもち', 'ハートで ふたりが ぎゅっ', ['heartfeel', 'mama']);
  D('i4_bridge', 'にじの はしを わたろう', 'にじの うえを てくてく', ['rainbowbridge', 'lulu']);
  D('i4_zerog', 'むじゅうりょく', 'うちゅうの ほしで みんな ふわ〜ん', ['toyplanet', 'gaku']);
  D('i4_rainbowdress', 'にじいろ へんしん', 'にじの ステッキで みんな にじいろの ドレスに', ['rainbowcane', 'sakura']);
  D('i4_sunny', 'おひさま キラキラ', 'まぶしくて みんな サングラス', ['sunorb', 'ricky']);
  D('i4_rain', 'あめの あとは にじ', 'あめが ふったら かさを さして…にじ！', ['raincloud', 'umbrella']);
  D('i4_wind', 'かぜが びゅーっ', 'ふくろから かぜが でて みんな とばされそう', ['windbag', 'pyoko']);
  D('i4_sleepy', 'ねむねむ…ジリリ！', 'とけいで みんな ねむって めざましで おきる', ['sleepyclock', 'jiji']);
  D('i4_giggle', 'わらいばな', 'はなが さくと みんな わらっちゃう', ['giggleflower', 'nyan']);
  D('i4_magnet', 'くっつき ぼし', 'ほしに ものが あつまってくる', ['magnetstar', 'ball']);
  D('i4_shadowshow', 'かげえ ショー', 'ランプで かげえが うごきだす', ['shadowlamp', 'baba']);
  D('i4_lucky', 'よつばの ラッキー', 'クローバーで いいこと あった！', ['luckyclover', 'yuto']);
  D('i4_kaleido', 'まんげきょう', 'のぞくと いろが くるくる', ['kaleidoscope', 'choco']);
  D('i4_bubbleride', 'シャボンだまに のって', 'おおきな シャボンだまで ふわふわ', ['bigbubble', 'pyoko']);
  D('i4_wishbottle', 'おねがいが かなった', 'ボトルに おねがいすると ほしいものが', ['wishbottle', 'mimi']);

  const O = (stage, text, goals, hint) => ({ id: stage + ':' + text, stage, text, goals, hint });
  PT.ODAI2 = (PT.ODAI2 || []).concat([
    O('airport', 'そらを とぶ のりものに のろう', ['i4_heli', 'i4_hotair', 'i4_pegasus', 'i4_dragon'], ['helicopter', 'hotairballoon']),
    O('concert', 'がっきを あつめて バンドを しよう', ['i4_band', 'i4_dj', 'i4_sing'], ['violin', 'djset']),
    O('fairy', 'ふしぎな まほうで びっくり', ['i4_fairyfly', 'i4_shrink', 'i4_grow', 'i4_teleport'], ['fairydust', 'tinyshroom']),
    O('sea', 'うみの のりもので ぼうけん', ['i4_sub', 'i4_whale', 'i4_yacht', 'i4_canoe'], ['submarine', 'whaleride']),
  ]);
})();
