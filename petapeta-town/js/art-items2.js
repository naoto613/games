/* 追加アイテム：たべもの・おもちゃ・がっき・のりもの・ふしぎ */
'use strict';
(() => {
  const G = PT.G;
  const def = (id, o) => { PT.ITEMS[id] = Object.assign({ id, tags: [], w: 90, h: 90 }, o); };
  // もとの たべものは「たべもの」タブへ
  ['apple', 'banana', 'cake', 'onigiri', 'bread'].forEach((id) => { PT.ITEMS[id].cat = 'food'; });

  /* ================= たべもの ================= */
  const F = (id, name, w, h, draw, tags = []) => def(id, { name, cat: 'food', tags: ['food'].concat(tags), w, h, food: true, draw });
  F('strawberry', 'いちご', 50, 56, (c) => {
    G.blob(c, [-22, -40, 0, -46, 22, -40, 18, -18, 0, -2, -18, -18]); G.fillO(c, '#ff4d6a', 3);
    c.fillStyle = '#ffe9a8'; [[-10, -30], [6, -32], [-4, -18], [10, -20], [0, -10]].forEach(([x, y]) => { G.ell(c, x, y, 1.6, 2.6); c.fill(); });
    G.blob(c, [-16, -42, -6, -52, 0, -44, 6, -52, 16, -42, 0, -38]); G.fillO(c, '#58b44e', 2);
  }, ['fruit', 'red']);
  F('donut', 'ドーナツ', 70, 46, (c) => {
    G.ell(c, 0, -20, 32, 18); G.fillO(c, '#e2a35c', 3);
    G.blob(c, [-28, -22, -20, -34, 0, -37, 20, -34, 28, -22, 18, -14, 0, -12, -18, -14]); c.fillStyle = '#ff9ec4'; c.fill();
    G.ell(c, 0, -23, 9, 5); c.fillStyle = '#b8783c'; c.fill();
    ['#7fd0e8', '#ffd23f', '#ffffff', '#58c46b'].forEach((col, i) => { c.save(); c.translate(-16 + i * 11, -28 + (i % 2) * 6); c.rotate(i); c.fillStyle = col; c.fillRect(-3, -1, 6, 2.5); c.restore(); });
  }, ['sweet']);
  F('icecream', 'アイスクリーム', 50, 90, (c) => {
    G.poly(c, [-16, -46, 16, -46, 0, -2]); G.fillO(c, '#e8b26a', 3);
    c.strokeStyle = 'rgba(160,100,40,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, -40); c.lineTo(6, -16); c.moveTo(10, -40); c.lineTo(-6, -16); c.stroke();
    G.circ(c, 0, -56, 17); G.fillO(c, '#ffd1e0', 3);
    G.circ(c, 0, -76, 14); G.fillO(c, '#c8f0d8', 3);
    G.circ(c, 4, -92, 6); c.fillStyle = '#e8384f'; c.fill();
  }, ['sweet', 'cold']);
  F('pizza', 'ピザ', 90, 50, (c) => {
    G.ell(c, 0, -18, 42, 18); G.fillO(c, '#f0c06a', 3);
    G.ell(c, 0, -20, 34, 13); c.fillStyle = '#ff7a4a'; c.fill();
    c.fillStyle = '#ffe9a8'; [[-14, -22], [12, -16], [4, -28]].forEach(([x, y]) => { G.ell(c, x, y, 7, 4); c.fill(); });
    c.fillStyle = '#c4473f'; [[-2, -16], [18, -24], [-20, -16]].forEach(([x, y]) => { G.circ(c, x, y, 4); c.fill(); });
    c.fillStyle = '#58b44e'; G.circ(c, -6, -26, 2.5); c.fill(); G.circ(c, 22, -18, 2.5); c.fill();
  }, ['share']);
  F('burger', 'ハンバーガー', 66, 60, (c) => {
    G.rr(c, -30, -16, 60, 14, 6); G.fillO(c, '#e9a85a', 3);
    G.rr(c, -32, -26, 64, 10, 4); G.fillO(c, '#7a4a2a', 2.5);
    c.fillStyle = '#69b866'; G.rr(c, -32, -30, 64, 6, 3); c.fill();
    c.fillStyle = '#ffd23f'; G.poly(c, [-28, -30, 28, -30, 20, -22, -20, -22]); c.fill();
    G.blob(c, [-30, -30, -26, -48, 0, -56, 26, -48, 30, -30]); G.fillO(c, '#f0b25a', 3);
    c.fillStyle = '#fff6d8'; [[-12, -44], [4, -48], [14, -40]].forEach(([x, y]) => { G.ell(c, x, y, 2, 3.4); c.fill(); });
  });
  F('watermelon', 'すいか', 90, 76, (c, t, st) => {
    if (st && st.split) { for (const sd of [-1, 1]) { c.save(); c.translate(sd * 24, 0); c.rotate(sd * 0.3); G.poly(c, [-24, -4, 24, -4, 0, -46]); G.fillO(c, '#ff5d6c', 3); c.restore(); } return; }
    G.ell(c, 0, -34, 42, 32); G.fillO(c, '#4fae58', 3);
    c.strokeStyle = '#2f7a3a'; c.lineWidth = 4; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 14, -64); c.quadraticCurveTo(i * 18 + 6, -34, i * 14, -4); c.stroke(); }
    G.ell(c, -14, -48, 8, 5, -0.5); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
  }, ['fruit', 'big']);
  F('grapes', 'ぶどう', 50, 70, (c) => {
    c.strokeStyle = '#6b4a2b'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -60); c.lineTo(2, -68); c.stroke();
    G.ell(c, 10, -62, 9, 5, -0.4); G.fillO(c, '#58b44e', 2);
    [[0, -52], [-10, -44], [10, -44], [-14, -32], [0, -34], [14, -32], [-6, -22], [8, -22], [0, -10]].forEach(([x, y]) => { G.circ(c, x, y, 7.5); G.fillO(c, '#9b5fd6', 2); G.circ(c, x - 2, y - 2, 2); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill(); });
  }, ['fruit']);
  F('carrot', 'にんじん', 40, 80, (c) => {
    G.poly(c, [-12, -56, 12, -56, 2, -2, -2, -2]); G.fillO(c, '#ff8a2e', 3);
    c.strokeStyle = '#d0661c'; c.lineWidth = 2; [-44, -32, -20].forEach((y) => { c.beginPath(); c.moveTo(-6, y); c.lineTo(2, y + 2); c.stroke(); });
    for (const a of [-0.4, 0, 0.4]) { c.save(); c.translate(0, -56); c.rotate(a); G.ell(c, 0, -12, 4, 13); G.fillO(c, '#58b44e', 2); c.restore(); }
  }, ['vegetable', 'rabbit']);
  F('pancake', 'ホットケーキ', 80, 60, (c) => {
    G.ell(c, 0, -6, 38, 9); G.fillO(c, '#ffffff', 3);
    for (let i = 0; i < 3; i++) { G.rr(c, -30, -22 - i * 11, 60, 12, 6); G.fillO(c, '#e9a85a', 2.5); }
    G.rr(c, -10, -50, 20, 8, 2); c.fillStyle = '#fff3b0'; c.fill();
    c.fillStyle = 'rgba(200,110,30,.85)'; c.beginPath(); c.moveTo(-26, -46); c.quadraticCurveTo(0, -52, 26, -46); c.lineTo(22, -36); c.quadraticCurveTo(12, -30, 8, -40); c.quadraticCurveTo(-14, -34, -24, -38); c.closePath(); c.fill();
  }, ['sweet']);
  F('pudding', 'プリン', 56, 56, (c) => {
    G.ell(c, 0, -4, 28, 7); G.fillO(c, '#ffffff', 2.5);
    G.poly(c, [-20, -6, 20, -6, 14, -40, -14, -40]); G.fillO(c, '#ffd86a', 3);
    G.blob(c, [-15, -38, -10, -46, 10, -46, 15, -38, 6, -32, -6, -32]); c.fillStyle = '#a5643a'; c.fill();
    G.circ(c, 0, -50, 5); c.fillStyle = '#e8384f'; c.fill();
  }, ['sweet']);
  F('cookie', 'クッキー', 50, 46, (c) => {
    G.circ(c, 0, -22, 20); G.fillO(c, '#e2a35c', 3);
    c.fillStyle = '#6b3a1a'; [[-8, -28], [6, -30], [-2, -18], [10, -16], [-10, -14]].forEach(([x, y]) => { G.circ(c, x, y, 3); c.fill(); });
  }, ['sweet']);
  F('juice', 'ジュース', 40, 70, (c) => {
    G.poly(c, [-16, -56, 16, -56, 12, -2, -12, -2]); G.fillO(c, 'rgba(220,240,255,.8)', 3);
    G.poly(c, [-14, -40, 14, -40, 11, -4, -11, -4]); c.fillStyle = '#ffa94d'; c.fill();
    c.strokeStyle = '#ff6f91'; c.lineWidth = 4; c.beginPath(); c.moveTo(4, -40); c.lineTo(10, -70); c.stroke();
    G.ell(c, -14, -56, 8, 6); c.fillStyle = '#ffd23f'; c.fill();
  }, ['drink']);
  F('bento', 'おべんとう', 80, 50, (c) => {
    G.rr(c, -38, -40, 76, 38, 8); G.fillO(c, '#ff8a65', 3);
    G.rr(c, -32, -36, 64, 30, 5); c.fillStyle = '#ffffff'; c.fill();
    G.circ(c, -18, -22, 8); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#dde'; c.stroke(); c.fillStyle = '#e8384f'; G.circ(c, -18, -22, 3); c.fill();
    G.ell(c, 4, -24, 8, 6); c.fillStyle = '#ffd23f'; c.fill();
    G.circ(c, 20, -26, 5); c.fillStyle = '#e8384f'; c.fill(); G.ell(c, 20, -14, 8, 4); c.fillStyle = '#69b866'; c.fill();
  }, ['share']);
  F('corn', 'とうもろこし', 40, 80, (c) => {
    G.ell(c, 0, -40, 14, 34); G.fillO(c, '#ffd23f', 3);
    c.fillStyle = '#f0b82a'; for (let y = -66; y < -12; y += 9) for (let x = -8; x <= 8; x += 8) { G.circ(c, x, y, 3); c.fill(); }
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(sd * 26, -20, sd * 14, -50); c.quadraticCurveTo(sd * 10, -24, 0, -14); c.closePath(); G.fillO(c, '#8fcf6a', 2.5); }
  }, ['vegetable']);
  F('candy', 'ぺろぺろキャンディ', 50, 90, (c) => {
    c.strokeStyle = '#fff'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -46); c.stroke(); c.strokeStyle = '#ccd'; c.lineWidth = 1.5; c.stroke();
    G.circ(c, 0, -64, 22); G.fillO(c, '#ff8fb1', 3);
    c.strokeStyle = '#fff'; c.lineWidth = 5; c.beginPath(); for (let a = 0; a < 12; a += 0.3) { const r = a * 1.6; const x = Math.cos(a) * r, y = -64 + Math.sin(a) * r; a ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  }, ['sweet']);

  /* ================= どうぐ・おもちゃ ================= */
  const T = (id, name, w, h, tags, draw, extra = {}) => def(id, Object.assign({ name, cat: 'tools', tags, w, h, draw }, extra));
  T('blocks', 'つみき', 90, 70, ['build', 'toy'], (c, t, st) => {
    const lv = st && st.level ? st.level : 1;
    const cols = ['#ff6f61', '#ffd23f', '#4c9be8', '#58c46b', '#b39ae8', '#ff8fab'];
    if (lv <= 1) { G.rr(c, -40, -28, 30, 26, 4); G.fillO(c, cols[0], 2.5); G.rr(c, -6, -28, 30, 26, 4); G.fillO(c, cols[2], 2.5); G.poly(c, [-24, -28, -8, -56, 8, -28]); G.fillO(c, cols[1], 2.5); G.circ(c, 32, -14, 12); G.fillO(c, cols[3], 2.5); return; }
    for (let i = 0; i < lv; i++) { G.rr(c, -22 + ((i * 7) % 9) - 4, -28 - i * 26, 44, 26, 4); G.fillO(c, cols[i % cols.length], 2.5); }
    G.poly(c, [-20, -28 - lv * 26 + 26 - 26, 0, -28 - lv * 26 - 22, 20, -28 - lv * 26]); G.fillO(c, '#ff6f61', 2.5);
  });
  T('robottoy', 'ロボットの おもちゃ', 70, 100, ['toy', 'robot'], (c, t, st) => {
    const w = st && st.walking ? Math.sin(t * 0.02) * 0.2 : 0;
    G.rr(c, -14, -18, 10, 18, 3); G.fillO(c, '#9fb3c8', 2); G.rr(c, 4, -18, 10, 18, 3); G.fillO(c, '#9fb3c8', 2);
    G.rr(c, -24, -56, 48, 40, 8); G.fillO(c, '#cfd8ea', 3);
    G.rr(c, -12, -46, 24, 14, 3); c.fillStyle = '#7fd0e8'; c.fill();
    c.save(); c.translate(-24, -50); c.rotate(0.3 + w); G.rr(c, -6, 0, 10, 24, 4); G.fillO(c, '#9fb3c8', 2); c.restore();
    c.save(); c.translate(24, -50); c.rotate(-0.3 - w); G.rr(c, -4, 0, 10, 24, 4); G.fillO(c, '#9fb3c8', 2); c.restore();
    G.rr(c, -18, -88, 36, 30, 8); G.fillO(c, '#cfd8ea', 3);
    G.circ(c, -8, -74, 5); c.fillStyle = (t / 300) % 2 < 1 ? '#ffd23f' : '#ff6f61'; c.fill(); G.circ(c, 8, -74, 5); c.fill();
    c.strokeStyle = '#7f8fa6'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -88); c.lineTo(0, -98); c.stroke(); G.circ(c, 0, -100, 4); c.fillStyle = '#ff6f61'; c.fill();
  });
  function plush(c, col, kind) {
    G.ell(c, 0, -30, 26, 28); G.fillO(c, col, 3);
    if (kind === 'panda') { for (const s of [-1, 1]) { G.circ(c, s * 22, -12, 10); G.fillO(c, '#3a3a4a', 3); G.circ(c, s * 26, -40, 9); G.fillO(c, '#3a3a4a', 3); G.circ(c, s * 20, -98, 11); G.fillO(c, '#3a3a4a', 3); } }
    if (kind === 'penguin') { G.ell(c, 0, -28, 17, 22); c.fillStyle = '#ffffff'; c.fill(); for (const s of [-1, 1]) { G.ell(c, s * 26, -34, 7, 16, s * 0.4); G.fillO(c, col, 3); G.ell(c, s * 10, -2, 9, 5); G.fillO(c, '#ff9f43', 2); } }
    if (kind === 'elephant') { for (const s of [-1, 1]) { G.circ(c, s * 22, -12, 10); G.fillO(c, col, 3); G.ell(c, s * 30, -80, 16, 20); G.fillO(c, col, 3); G.ell(c, s * 30, -80, 9, 12); c.fillStyle = '#ffc6d6'; c.fill(); } }
    G.circ(c, 0, -76, 27); G.fillO(c, col, 3);
    if (kind === 'panda') { for (const s of [-1, 1]) { G.ell(c, s * 10, -80, 7, 9, s * 0.4); c.fillStyle = '#3a3a4a'; c.fill(); } }
    if (kind === 'penguin') { G.ell(c, 0, -72, 18, 15); c.fillStyle = '#fff'; c.fill(); G.poly(c, [-6, -68, 6, -68, 0, -60]); c.fillStyle = '#ff9f43'; c.fill(); }
    if (kind === 'elephant') { c.beginPath(); c.moveTo(-6, -70); c.quadraticCurveTo(-8, -46, 6, -42); c.lineTo(8, -50); c.quadraticCurveTo(4, -56, 6, -70); c.closePath(); G.fillO(c, col, 2.5); }
    c.fillStyle = '#fff'; G.circ(c, -10, -80, 4); c.fill(); G.circ(c, 10, -80, 4); c.fill();
    c.fillStyle = '#2b2440'; G.circ(c, -10, -80, 2.6); c.fill(); G.circ(c, 10, -80, 2.6); c.fill();
    c.fillStyle = 'rgba(255,120,140,.4)'; G.ell(c, -16, -70, 5, 3); c.fill(); G.ell(c, 16, -70, 5, 3); c.fill();
  }
  T('panda', 'パンダの ぬいぐるみ', 70, 110, ['plush', 'toy', 'guest'], (c) => plush(c, '#ffffff', 'panda'));
  T('penguin', 'ペンギンの ぬいぐるみ', 70, 110, ['plush', 'toy', 'guest'], (c) => plush(c, '#4a5a7a', 'penguin'));
  T('elephant', 'ぞうの ぬいぐるみ', 80, 110, ['plush', 'toy', 'guest'], (c) => plush(c, '#a8b8d8', 'elephant'));
  T('wateringcan', 'じょうろ', 90, 70, ['garden', 'water'], (c) => {
    G.rr(c, -34, -50, 50, 46, 10); G.fillO(c, '#58b9f0', 3);
    c.strokeStyle = PT.line('#58b9f0'); c.lineWidth = 6; c.beginPath(); c.moveTo(16, -24); c.lineTo(42, -54); c.stroke();
    c.strokeStyle = '#58b9f0'; c.lineWidth = 3; c.stroke();
    G.ell(c, 44, -56, 8, 5, -0.8); G.fillO(c, '#4aa0d8', 2);
    c.strokeStyle = PT.line('#58b9f0'); c.lineWidth = 5; c.beginPath(); c.arc(-10, -50, 16, Math.PI, 0); c.stroke();
    G.circ(c, -10, -30, 7); c.fillStyle = '#ffd23f'; c.fill();
  });
  T('seed', 'たね', 60, 50, ['garden', 'plant'], (c) => {
    G.rr(c, -26, -34, 52, 32, 6); G.fillO(c, '#f6e3c4', 3);
    G.circ(c, 0, -20, 9); c.fillStyle = '#ffd23f'; c.fill();
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PT.TAU; G.ell(c, Math.cos(a) * 13, -20 + Math.sin(a) * 9, 4, 3, a); c.fillStyle = '#ffb02e'; c.fill(); }
    c.fillStyle = '#6b4a2b'; G.ell(c, -14, -6, 3, 2); c.fill(); G.ell(c, 14, -8, 3, 2); c.fill();
  });
  def('sunflower', { name: 'ひまわり', cat: 'hidden', tags: ['flower', 'plant'], w: 70, h: 160, draw(c, t, st) {
    const g = st && st.grow !== undefined ? st.grow : 1;
    c.strokeStyle = '#4c9a50'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -150 * g); c.stroke();
    if (g > 0.3) { G.ell(c, 12, -60 * g, 16 * g, 7 * g, -0.5); c.fillStyle = '#58b44e'; c.fill(); }
    if (g > 0.7) { const k = (g - 0.7) / 0.3; c.save(); c.translate(0, -150 * g); c.scale(k, k); for (let i = 0; i < 12; i++) { const a = (i / 12) * PT.TAU + Math.sin(t * 0.002) * 0.1; G.ell(c, Math.cos(a) * 24, Math.sin(a) * 24, 12, 6, a); c.fillStyle = '#ffd23f'; c.fill(); } G.circ(c, 0, 0, 16); G.fillO(c, '#8a5a2b', 2); c.fillStyle = '#2b2440'; G.circ(c, -5, -3, 2); c.fill(); G.circ(c, 5, -3, 2); c.fill(); c.strokeStyle = '#2b2440'; c.lineWidth = 2; c.beginPath(); c.arc(0, 2, 5, 0.3, 2.8); c.stroke(); c.restore(); }
  } });
  T('bugnet', 'むしあみ', 70, 130, ['net', 'explore'], (c) => {
    c.strokeStyle = '#c99a64'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-14, 0); c.lineTo(10, -84); c.stroke();
    G.circ(c, 16, -104, 22); c.strokeStyle = '#4c9be8'; c.lineWidth = 4; c.stroke();
    c.fillStyle = 'rgba(200,230,255,.5)'; G.circ(c, 16, -104, 20); c.fill();
    c.strokeStyle = 'rgba(120,170,220,.6)'; c.lineWidth = 1.5; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(16 + i * 8, -124); c.lineTo(16 + i * 8, -84); c.stroke(); c.beginPath(); c.moveTo(-4, -104 + i * 8); c.lineTo(36, -104 + i * 8); c.stroke(); }
  });
  T('fishingrod', 'つりざお', 110, 120, ['fishing', 'water'], (c) => {
    c.strokeStyle = '#a5643a'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-40, -6); c.lineTo(36, -110); c.stroke();
    c.strokeStyle = '#7f8fa6'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(36, -110); c.quadraticCurveTo(50, -60, 44, -24); c.stroke();
    G.circ(c, 44, -20, 6); G.fillO(c, '#ff6f61', 2); G.circ(c, -30, -20, 7); G.fillO(c, '#3e4a63', 2);
  });
  T('camera', 'カメラ', 80, 60, ['photo'], (c) => {
    G.rr(c, -36, -46, 72, 44, 8); G.fillO(c, '#ff8fab', 3);
    G.rr(c, -14, -54, 24, 10, 3); G.fillO(c, '#e86a8a', 2);
    G.circ(c, 0, -24, 15); G.fillO(c, '#3e4a63', 3); G.circ(c, 0, -24, 8); c.fillStyle = '#7fb6ef'; c.fill(); G.circ(c, -3, -27, 3); c.fillStyle = '#fff'; c.fill();
    G.rr(c, 20, -42, 10, 7, 2); c.fillStyle = '#fff6b8'; c.fill();
  });
  T('phone', 'おもちゃの でんわ', 80, 60, ['phone', 'toy'], (c) => {
    G.rr(c, -32, -34, 64, 32, 10); G.fillO(c, '#ffd23f', 3);
    c.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { G.circ(c, -14 + (i % 3) * 14, -24 + Math.floor(i / 3) * 12, 4); c.fill(); }
    c.beginPath(); c.moveTo(-36, -40); c.quadraticCurveTo(0, -60, 36, -40); c.lineTo(30, -32); c.quadraticCurveTo(0, -46, -30, -32); c.closePath(); G.fillO(c, '#ff6f61', 3);
  });
  T('broom', 'ほうき', 60, 140, ['clean', 'magic'], (c) => {
    c.strokeStyle = '#a5643a'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -36); c.lineTo(0, -136); c.stroke();
    G.poly(c, [-8, -40, 8, -40, 22, 0, -22, 0]); G.fillO(c, '#f0c06a', 3);
    c.strokeStyle = '#c4923a'; c.lineWidth = 2; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 3, -38); c.lineTo(i * 8, -2); c.stroke(); }
    G.rr(c, -10, -46, 20, 8, 3); G.fillO(c, '#ff6f61', 2);
  });
  T('umbrella', 'かさ', 110, 130, ['rain', 'shade'], (c) => {
    c.strokeStyle = '#7a5a8a'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -110); c.lineTo(0, -10); c.arc(-8, -10, 8, 0, Math.PI); c.stroke();
    c.beginPath(); c.moveTo(-54, -78); c.quadraticCurveTo(0, -150, 54, -78); for (let i = 0; i < 4; i++) { const x = 54 - (i + 1) * 27; c.quadraticCurveTo(x + 13.5, -92, x, -78); } c.closePath(); G.fillO(c, '#b39ae8', 3);
    c.fillStyle = '#ffffff'; [[-24, -100], [10, -112], [30, -92]].forEach(([x, y]) => { G.circ(c, x, y, 5); c.fill(); });
  });
  T('crayons', 'クレヨン', 80, 60, ['draw', 'art'], (c) => {
    G.rr(c, -36, -40, 72, 38, 6); G.fillO(c, '#4c9be8', 3);
    ['#ff6f61', '#ffd23f', '#58c46b', '#b39ae8', '#ff8fab'].forEach((col, i) => { G.rr(c, -30 + i * 13, -58, 10, 26, 3); c.fillStyle = col; c.fill(); G.poly(c, [-30 + i * 13, -58, -25 + i * 13, -66, -20 + i * 13, -58]); c.fill(); });
    G.rr(c, -36, -32, 72, 12, 3); c.fillStyle = '#ffffff'; c.fill();
  });
  T('letter', 'おてがみ', 70, 50, ['letter'], (c) => {
    G.rr(c, -32, -44, 64, 42, 4); G.fillO(c, '#ffffff', 3);
    c.strokeStyle = '#c9d8e6'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-32, -44); c.lineTo(0, -20); c.lineTo(32, -44); c.stroke();
    G.heart(c, 0, -20, 9); c.fillStyle = '#ff6f91'; c.fill();
  });
  T('magnifier', 'むしめがね', 70, 80, ['explore', 'search'], (c) => {
    c.strokeStyle = '#a5643a'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-24, -4); c.lineTo(-4, -32); c.stroke();
    G.circ(c, 10, -50, 22); c.fillStyle = 'rgba(200,235,255,.6)'; c.fill(); c.strokeStyle = '#3e4a63'; c.lineWidth = 6; c.stroke();
    G.ell(c, 2, -58, 6, 4, -0.6); c.fillStyle = '#fff'; c.fill();
  });
  T('kite', 'たこ', 90, 120, ['wind', 'fly'], (c) => {
    c.strokeStyle = '#7f8fa6'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-20, -30, 0, -60); c.stroke();
    G.poly(c, [0, -120, 32, -86, 0, -56, -32, -86]); G.fillO(c, '#ff6f61', 3);
    G.poly(c, [0, -120, 32, -86, 0, -86]); c.fillStyle = '#ffd23f'; c.fill(); G.poly(c, [0, -56, -32, -86, 0, -86]); c.fillStyle = '#4c9be8'; c.fill();
    c.strokeStyle = '#ff8fab'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -56); c.quadraticCurveTo(10, -40, 0, -26); c.stroke();
  }, { float: false });
  T('pinwheel', 'かざぐるま', 60, 110, ['wind', 'toy'], (c, t, st) => {
    c.strokeStyle = '#7fb6ef'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -76); c.stroke();
    c.save(); c.translate(0, -80); c.rotate(t * (st && st.spin ? 0.02 : 0.002));
    ['#ff6f61', '#ffd23f', '#58c46b', '#4c9be8'].forEach((col, i) => { c.save(); c.rotate((i / 4) * PT.TAU); G.poly(c, [0, 0, 0, -26, 20, -6]); G.fillO(c, col, 2); c.restore(); });
    G.circ(c, 0, 0, 4); c.fillStyle = '#fff'; c.fill();
    c.restore();
  });

  /* ================= がっき（おと） ================= */
  const M = (id, name, w, h, draw) => def(id, { name, cat: 'magic', tags: ['music', 'instrument', 'sound'], w, h, draw });
  M('trumpet', 'ラッパ', 100, 50, (c) => {
    c.strokeStyle = '#e8b02a'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(-40, -24); c.lineTo(20, -24); c.stroke();
    c.beginPath(); c.moveTo(20, -24); c.lineTo(44, -40); c.lineTo(44, -8); c.closePath(); G.fillO(c, '#ffd23f', 3);
    for (let i = 0; i < 3; i++) { G.rr(c, -14 + i * 10, -38, 6, 12, 2); c.fillStyle = '#c99a2a'; c.fill(); }
  });
  M('guitar', 'ギター', 70, 130, (c) => {
    c.strokeStyle = '#8a5a2b'; c.lineWidth = 9; c.beginPath(); c.moveTo(0, -60); c.lineTo(0, -124); c.stroke();
    G.blob(c, [-26, -8, -30, -34, -18, -48, -20, -64, 0, -72, 20, -64, 18, -48, 30, -34, 26, -8, 0, 0]); G.fillO(c, '#ff8a65', 3);
    G.circ(c, 0, -38, 9); c.fillStyle = '#5a3a2a'; c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 1; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * 3, -14); c.lineTo(i * 3, -124); c.stroke(); }
  });
  M('tambourine', 'タンバリン', 70, 70, (c) => {
    G.ell(c, 0, -34, 30, 30); G.fillO(c, '#ffe9c2', 3);
    c.strokeStyle = '#e8424a'; c.lineWidth = 6; G.ell(c, 0, -34, 30, 30); c.stroke();
    for (let i = 0; i < 6; i++) { const a = (i / 6) * PT.TAU; G.circ(c, Math.cos(a) * 30, -34 + Math.sin(a) * 30, 5); G.fillO(c, '#ffd23f', 1.5); }
    G.star(c, 0, -34, 12, 5); c.fillStyle = '#ff8fab'; c.fill();
  });
  M('maracas', 'マラカス', 80, 90, (c) => {
    for (const sd of [-1, 1]) { c.save(); c.translate(sd * 16, 0); c.rotate(sd * 0.25); c.strokeStyle = '#a5643a'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -40); c.stroke(); G.ell(c, 0, -60, 16, 22); G.fillO(c, sd < 0 ? '#ff6f61' : '#58c46b', 3); c.fillStyle = '#ffd23f'; c.fillRect(-15, -62, 30, 5); c.restore(); }
  });
  M('xylophone', 'もっきん', 110, 50, (c) => {
    ['#ff6f61', '#ffa94d', '#ffd23f', '#69db7c', '#4dabf7', '#9775fa'].forEach((col, i) => { G.rr(c, -50 + i * 17, -40 + i * 3, 14, 34 - i * 3, 3); G.fillO(c, col, 2); });
    c.strokeStyle = '#a5643a'; c.lineWidth = 4; c.beginPath(); c.moveTo(30, -50); c.lineTo(50, -70); c.stroke(); G.circ(c, 30, -50, 5); c.fillStyle = '#ff8fab'; c.fill();
  });
  def('musicbox', { name: 'オルゴール', cat: 'magic', tags: ['music', 'sound', 'calm'], w: 80, h: 80, draw(c, t, st) {
    G.rr(c, -34, -40, 68, 38, 6); G.fillO(c, '#c99a64', 3);
    c.save(); c.translate(-34, -40); c.rotate(-0.5); G.rr(c, 0, -10, 68, 12, 4); G.fillO(c, '#b8865a', 3); c.restore();
    c.save(); c.translate(0, -50); c.rotate(st && st.playing ? t * 0.003 : 0); G.ell(c, 0, 0, 12, 4); c.fillStyle = '#ffd1e0'; c.fill(); c.restore();
    G.circ(c, 0, -62, 6); c.fillStyle = '#ff8fab'; c.fill(); G.poly(c, [-8, -50, 8, -50, 0, -58]); c.fill();
    G.heart(c, 0, -22, 8); c.fillStyle = '#ffd23f'; c.fill();
  } });

  /* ================= のりもの ================= */
  const V = (id, name, w, h, draw, tags = []) => def(id, { name, cat: 'rides', tags: ['vehicle', 'ride'].concat(tags), w, h, draw });
  const wheel = (c, x, y, r) => { G.circ(c, x, y, r); G.fillO(c, '#3e4a63', 3); G.circ(c, x, y, r * 0.4); c.fillStyle = '#d0d8e6'; c.fill(); };
  V('bicycle', 'じてんしゃ', 130, 90, (c) => {
    c.strokeStyle = '#4c9be8'; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-40, -22); c.lineTo(-6, -22); c.lineTo(10, -56); c.lineTo(-24, -56); c.lineTo(-40, -22); c.moveTo(-6, -22); c.lineTo(-24, -60); c.moveTo(10, -56); c.lineTo(40, -22); c.moveTo(10, -56); c.lineTo(6, -72); c.stroke();
    c.strokeStyle = '#3e4a63'; c.lineWidth = 4; G.circ(c, -40, -22, 20); c.stroke(); G.circ(c, 40, -22, 20); c.stroke();
    G.rr(c, -34, -66, 22, 8, 4); G.fillO(c, '#3e4a63', 2); c.strokeStyle = '#3e4a63'; c.beginPath(); c.moveTo(-4, -74); c.lineTo(16, -72); c.stroke();
    G.rr(c, 16, -66, 16, 12, 3); G.fillO(c, '#ff8fab', 2);
  });
  V('skateboard', 'スケボー', 110, 30, (c) => {
    G.rr(c, -50, -24, 100, 12, 6); G.fillO(c, '#ff6f61', 3);
    c.fillStyle = '#ffd23f'; G.star(c, 0, -18, 6, 3); c.fill();
    wheel(c, -34, -6, 6); wheel(c, 34, -6, 6);
  });
  V('airplane', 'ひこうき', 150, 80, (c) => {
    G.ell(c, 0, -36, 64, 20); G.fillO(c, '#ffffff', 3);
    G.poly(c, [-10, -40, -40, -10, -20, -10, 20, -36]); G.fillO(c, '#4c9be8', 3);
    G.poly(c, [-50, -40, -70, -70, -56, -70, -38, -46]); G.fillO(c, '#ff6f61', 3);
    for (let i = 0; i < 3; i++) { G.circ(c, 10 + i * 16, -40, 5); c.fillStyle = '#9fdcf5'; c.fill(); }
    G.circ(c, 62, -36, 6); G.fillO(c, '#ffd23f', 2);
  }, ['fly']);
  V('bus', 'バス', 170, 100, (c) => {
    G.rr(c, -80, -86, 160, 72, 14); G.fillO(c, '#ffd23f', 3);
    for (let i = 0; i < 4; i++) { G.rr(c, -70 + i * 34, -78, 28, 26, 5); G.fillO(c, '#d9f1ff', 2); }
    G.rr(c, 66, -78, 10, 40, 4); c.fillStyle = '#d9f1ff'; c.fill();
    c.fillStyle = '#ff6f61'; c.fillRect(-80, -44, 160, 8);
    wheel(c, -48, -12, 14); wheel(c, 48, -12, 14);
  }, ['bus']);
  V('ambulance', 'きゅうきゅうしゃ', 150, 90, (c, t) => {
    G.rr(c, -70, -76, 104, 62, 10); G.fillO(c, '#ffffff', 3);
    G.blob(c, [34, -14, 34, -60, 56, -60, 72, -36, 72, -14]); G.fillO(c, '#ffffff', 3);
    G.rr(c, 40, -56, 20, 18, 4); c.fillStyle = '#d9f1ff'; c.fill();
    c.fillStyle = '#e8424a'; c.fillRect(-32, -60, 12, 36); c.fillRect(-44, -48, 36, 12); c.fillRect(-70, -32, 142, 6);
    G.rr(c, -10, -88, 24, 12, 4); c.fillStyle = (t / 250) % 2 < 1 ? '#ff4d4d' : '#4c9be8'; c.fill();
    wheel(c, -44, -12, 13); wheel(c, 46, -12, 13);
  }, ['rescue']);
  V('firetruck', 'しょうぼうしゃ', 160, 90, (c) => {
    G.rr(c, -76, -66, 116, 54, 8); G.fillO(c, '#e8424a', 3);
    G.blob(c, [40, -12, 40, -62, 62, -62, 78, -38, 78, -12]); G.fillO(c, '#e8424a', 3);
    G.rr(c, 46, -56, 20, 16, 4); c.fillStyle = '#d9f1ff'; c.fill();
    c.strokeStyle = '#cfd8ea'; c.lineWidth = 4; c.beginPath(); c.moveTo(-70, -74); c.lineTo(30, -84); c.moveTo(-70, -68); c.lineTo(30, -78); c.stroke();
    for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-60 + i * 16, -73); c.lineTo(-60 + i * 16, -67); c.stroke(); }
    c.fillStyle = '#ffd23f'; c.fillRect(-76, -34, 154, 6);
    wheel(c, -46, -12, 13); wheel(c, 50, -12, 13);
  }, ['fire', 'rescue']);
  V('horse', 'もくばの おうま', 120, 110, (c, t) => {
    const r = Math.sin(t * 0.004) * 0.06;
    c.save(); c.rotate(r);
    c.strokeStyle = '#c4813a'; c.lineWidth = 7; c.beginPath(); c.moveTo(-56, -4); c.quadraticCurveTo(0, 12, 56, -4); c.stroke();
    for (const x of [-30, 22]) { G.rr(c, x - 5, -34, 10, 32, 4); G.fillO(c, '#e8a35c', 2.5); }
    G.ell(c, -4, -50, 38, 20); G.fillO(c, '#f2b46a', 3);
    c.beginPath(); c.moveTo(22, -58); c.quadraticCurveTo(30, -96, 48, -96); c.quadraticCurveTo(64, -92, 62, -78); c.lineTo(38, -54); c.closePath(); G.fillO(c, '#f2b46a', 3);
    c.fillStyle = '#8a5a2b'; G.ell(c, 28, -84, 7, 16, 0.5); c.fill(); G.ell(c, -44, -56, 10, 6, -0.6); c.fill();
    G.circ(c, 52, -84, 3); c.fillStyle = '#2b2440'; c.fill();
    G.rr(c, -16, -72, 26, 10, 4); G.fillO(c, '#e8424a', 2);
    c.restore();
  }, ['horse']);
  V('boat', 'ボート', 140, 70, (c, t) => {
    const b = Math.sin(t * 0.004) * 2;
    c.save(); c.translate(0, b);
    G.poly(c, [-64, -40, 64, -40, 46, -6, -46, -6]); G.fillO(c, '#ff8a65', 3);
    c.fillStyle = '#ffffff'; c.fillRect(-58, -36, 116, 6);
    c.strokeStyle = '#a5643a'; c.lineWidth = 5; c.beginPath(); c.moveTo(-30, -60); c.lineTo(-10, -30); c.moveTo(30, -60); c.lineTo(10, -30); c.stroke();
    c.restore();
  }, ['water']);
  V('seesaw', 'シーソー', 200, 70, (c, t, st) => {
    const a = st && st.rock ? Math.sin(t * 0.005) * 0.2 : 0.12;
    G.poly(c, [-20, 0, 0, -36, 20, 0]); G.fillO(c, '#4c9be8', 3);
    c.save(); c.translate(0, -36); c.rotate(a); G.rr(c, -96, -8, 192, 12, 6); G.fillO(c, '#ffd23f', 3);
    for (const x of [-80, 74]) { G.rr(c, x, -24, 6, 18, 3); G.fillO(c, '#ff6f61', 2); }
    c.restore();
  }, ['playground', 'pair']);
  V('pool', 'ビニールプール', 180, 60, (c, t) => {
    G.ell(c, 0, -26, 86, 26); G.fillO(c, '#58b9f0', 3);
    G.ell(c, 0, -30, 72, 18); c.fillStyle = '#9fe0fb'; c.fill();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.beginPath(); c.ellipse(Math.sin(t * 0.002) * 10, -30, 30, 6, 0, 0, Math.PI); c.stroke();
    c.fillStyle = '#ffd23f'; for (let i = 0; i < 6; i++) { const a = (i / 6) * PT.TAU; G.circ(c, Math.cos(a) * 80, -26 + Math.sin(a) * 22, 5); c.fill(); }
  }, ['water', 'pool']);

  /* ================= ふしぎ ================= */
  const S = (id, name, w, h, tags, draw, extra = {}) => def(id, Object.assign({ name, cat: 'magic', tags, w, h, draw }, extra));
  S('snow', 'ゆき', 80, 80, ['snow', 'fx'], (c) => {
    G.circ(c, 0, -38, 30); c.fillStyle = '#d9f1ff'; c.fill();
    c.strokeStyle = '#ffffff'; c.lineWidth = 4; c.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const a = (i / 6) * PT.TAU; c.beginPath(); c.moveTo(0, -38); c.lineTo(Math.cos(a) * 24, -38 + Math.sin(a) * 24); c.stroke(); c.beginPath(); c.moveTo(Math.cos(a) * 14, -38 + Math.sin(a) * 14); c.lineTo(Math.cos(a + 0.5) * 20, -38 + Math.sin(a + 0.5) * 20); c.stroke(); }
  }, { oneShot: true });
  def('snowman', { name: 'ゆきだるま', cat: 'hidden', tags: ['snow'], w: 100, h: 140, draw(c) {
    G.circ(c, 0, -40, 40); G.fillO(c, '#ffffff', 3); G.circ(c, 0, -100, 28); G.fillO(c, '#ffffff', 3);
    c.fillStyle = '#2b2440'; G.circ(c, -10, -106, 3.5); c.fill(); G.circ(c, 10, -106, 3.5); c.fill();
    G.poly(c, [0, -98, 18, -94, 0, -90]); c.fillStyle = '#ff8a2e'; c.fill();
    G.rr(c, -30, -82, 60, 10, 5); G.fillO(c, '#e8424a', 2);
    G.rr(c, -20, -142, 40, 16, 3); G.fillO(c, '#3e4a63', 2); G.rr(c, -28, -128, 56, 6, 3); G.fillO(c, '#3e4a63', 2);
  } });
  S('carpet', 'まほうの じゅうたん', 150, 40, ['magic', 'fly', 'ride'], (c, t) => {
    const w = Math.sin(t * 0.006) * 4;
    c.beginPath(); c.moveTo(-70, -16 + w); c.quadraticCurveTo(0, -30 - w, 70, -16 + w); c.lineTo(70, -4 + w); c.quadraticCurveTo(0, -18 - w, -70, -4 + w); c.closePath(); G.fillO(c, '#9b5fd6', 3);
    c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.beginPath(); c.moveTo(-60, -12 + w); c.quadraticCurveTo(0, -24 - w, 60, -12 + w); c.stroke();
    c.fillStyle = '#ffd23f'; for (const x of [-72, 72]) for (let i = 0; i < 3; i++) { c.fillRect(x + (x > 0 ? 0 : -6), -14 + w + i * 4, 6, 2); }
  });
  S('lamp', 'まほうの ランプ', 100, 60, ['magic', 'wish'], (c) => {
    G.blob(c, [-30, -10, -34, -28, -10, -40, 20, -36, 50, -42, 30, -24, 26, -10]); G.fillO(c, '#ffcf3f', 3);
    c.strokeStyle = PT.line('#ffcf3f'); c.lineWidth = 4; c.beginPath(); c.arc(-36, -24, 10, 1.2, 4.6); c.stroke();
    G.ell(c, -4, -42, 12, 6); G.fillO(c, '#ffcf3f', 2.5); G.circ(c, -4, -50, 4); c.fillStyle = '#ff6f91'; c.fill();
    G.ell(c, 0, -6, 26, 6); G.fillO(c, '#e8b02a', 2);
  });
  S('egg', 'ふしぎな たまご', 60, 80, ['egg', 'magic'], (c, t) => {
    const w = Math.sin(t * 0.01) * 0.06;
    c.save(); c.rotate(w);
    G.ell(c, 0, -36, 26, 34); G.fillO(c, '#fff6e6', 3);
    c.fillStyle = '#ff8fab'; [[-10, -48], [8, -30], [-6, -18], [12, -54]].forEach(([x, y]) => { G.circ(c, x, y, 5); c.fill(); });
    c.fillStyle = '#7fd0e8'; [[10, -14], [-14, -32]].forEach(([x, y]) => { G.circ(c, x, y, 4); c.fill(); });
    c.restore();
  });
  S('chest', 'たからばこ', 100, 80, ['treasure', 'magic'], (c, t, st) => {
    G.rr(c, -44, -44, 88, 42, 6); G.fillO(c, '#b8743a', 3);
    if (st && st.open) { c.save(); c.translate(-44, -44); c.rotate(-0.9); G.rr(c, 0, -26, 88, 26, 12); G.fillO(c, '#c4813a', 3); c.restore(); c.fillStyle = 'rgba(255,230,120,.7)'; G.ell(c, 0, -46, 40, 12); c.fill(); }
    else { G.rr(c, -46, -70, 92, 28, 14); G.fillO(c, '#c4813a', 3); }
    c.fillStyle = '#ffd23f'; c.fillRect(-46, -46, 92, 6); c.fillRect(-26, -70, 8, 68); c.fillRect(18, -70, 8, 68);
    G.rr(c, -8, -50, 16, 16, 3); G.fillO(c, '#ffd23f', 2);
  });
  S('mirrorball', 'ミラーボール', 80, 120, ['music', 'party', 'float'], (c, t) => {
    c.strokeStyle = '#7f8fa6'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -120); c.lineTo(0, -80); c.stroke();
    G.circ(c, 0, -50, 32); c.fillStyle = '#c9d4ea'; c.fill();
    for (let y = -78; y < -20; y += 9) for (let x = -30; x < 30; x += 9) { if (Math.hypot(x + 4, y + 54) > 30) continue; c.fillStyle = ((x + y + Math.floor(t / 200) * 9) / 9) % 3 === 0 ? '#ffffff' : ((x * 7 + y) % 2 ? '#e3ecfb' : '#a8b8d8'); c.fillRect(x, y, 8, 8); }
    G.circ(c, 0, -50, 32); c.strokeStyle = '#7f8fa6'; c.lineWidth = 3; c.stroke();
  }, { float: true });
  S('moon', 'おつきさま', 80, 80, ['night', 'sky', 'float'], (c) => {
    c.fillStyle = 'rgba(255,240,170,.3)'; G.circ(c, 0, -40, 40); c.fill();
    c.beginPath(); c.arc(0, -40, 30, 0.6, PT.TAU - 0.6); c.quadraticCurveTo(10, -40, 24, -58); c.closePath(); G.fillO(c, '#ffe36a', 3);
    c.fillStyle = '#2b2440'; G.circ(c, -10, -44, 2.6); c.fill(); c.strokeStyle = '#2b2440'; c.lineWidth = 2; c.beginPath(); c.arc(-8, -36, 5, 0.3, 2.6); c.stroke();
  }, { float: true });
  S('cloud', 'くも', 110, 70, ['rain', 'sky', 'float'], (c) => {
    G.blob(c, [-50, -16, -46, -40, -20, -52, 4, -62, 30, -52, 50, -38, 50, -16]); G.fillO(c, '#ffffff', 3);
    c.fillStyle = '#2b2440'; G.circ(c, -10, -34, 3); c.fill(); G.circ(c, 12, -34, 3); c.fill();
    c.fillStyle = 'rgba(255,140,170,.5)'; G.ell(c, -20, -26, 5, 3); c.fill(); G.ell(c, 22, -26, 5, 3); c.fill();
  }, { float: true });
  S('petals', 'はなびら', 80, 70, ['flower', 'fx'], (c) => {
    G.rr(c, -26, -40, 52, 38, 10); G.fillO(c, '#ffe0ec', 3);
    ['#ff8fab', '#ffb3c8', '#ffffff', '#ffd1e0', '#ff8fab'].forEach((col, i) => { c.save(); c.translate(-18 + i * 9, -50 - (i % 2) * 10); c.rotate(i); G.ell(c, 0, 0, 7, 4); c.fillStyle = col; c.fill(); c.restore(); });
  }, { oneShot: true });
})();
