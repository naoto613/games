/* ブロックの しゅるいと え（1マス 64×64。いちど かいたら キャッシュ） */
'use strict';
(() => {
  const G = PT.G, T = 64;
  const B = (PT.BLOCKS = [null]);   // 0 は くうき。ばんごうは セーブに つかうので あとから 足すときは うしろへ
  const BY = (PT.BLOCK = {});
  const def = (id, o) => { const d = Object.assign({ id, code: B.length, solid: true, col: '#999999', cat: null }, o); B.push(d); BY[id] = d; return d; };

  /* ---- かき かたの どうぐ ---- */
  const rnd = (seed) => PT.seeded(seed * 9301 + 49297);
  const box = (c, col, r = 8) => {
    G.rr(c, 1.5, 1.5, T - 3, T - 3, r);
    const g = c.createLinearGradient(0, 0, 0, T);
    g.addColorStop(0, PT.shade(col, 0.16)); g.addColorStop(0.55, col); g.addColorStop(1, PT.shade(col, -0.12));
    c.fillStyle = g; c.fill();
  };
  const rim = (c, col, r = 8) => {
    // つやと かげ（おもちゃの ブロックみたいに）
    c.save(); G.rr(c, 1.5, 1.5, T - 3, T - 3, r); c.clip();
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(7, T - 10); c.lineTo(7, 7); c.lineTo(T - 10, 7); c.stroke();
    c.strokeStyle = 'rgba(40,20,60,.13)'; c.lineWidth = 4; c.beginPath(); c.moveTo(T - 5, 10); c.lineTo(T - 5, T - 5); c.lineTo(10, T - 5); c.stroke();
    c.restore();
    G.rr(c, 1.5, 1.5, T - 3, T - 3, r); c.strokeStyle = PT.line(col); c.lineWidth = 2.6; c.stroke();
  };
  const clip = (c, r = 8) => { c.save(); G.rr(c, 1.5, 1.5, T - 3, T - 3, r); c.clip(); };
  const dots = (c, r, n, cols, s0 = 1.5, s1 = 3.5, y0 = 0) => { for (let i = 0; i < n; i++) { c.fillStyle = cols[i % cols.length]; G.circ(c, 5 + r() * (T - 10), y0 + 5 + r() * (T - 10 - y0), s0 + r() * (s1 - s0)); c.fill(); } };
  const plain = (col, tex) => (c, v) => { box(c, col); clip(c); tex && tex(c, rnd(v + 1), v); c.restore(); rim(c, col); };

  /* ================= しぜん ================= */
  const dirtTex = (c, r) => { dots(c, r, 9, ['rgba(120,70,30,.35)', 'rgba(255,230,190,.35)', 'rgba(90,50,20,.25)'], 1.5, 3.6); c.fillStyle = 'rgba(160,150,140,.8)'; G.ell(c, 14 + r() * 36, 18 + r() * 36, 5, 3.5); c.fill(); };
  def('grass', { name: 'くさ', col: '#7bc96a', variants: ['top', 'in'],
    draw(c, v) {
      box(c, '#b9844f'); clip(c); dirtTex(c, rnd(3 + (v === 'in' ? 5 : 0)));
      if (v === 'top') {
        c.fillStyle = '#7bc96a'; c.beginPath(); c.moveTo(0, 0); c.lineTo(T, 0); c.lineTo(T, 18);
        for (let x = T; x >= 0; x -= 8) c.quadraticCurveTo(x - 4, 26 + (x % 16 ? 3 : -2), x - 8, 18);
        c.closePath(); c.fill();
        c.fillStyle = '#a3e08c'; c.fillRect(0, 0, T, 7);
        c.strokeStyle = '#4f9e46'; c.lineWidth = 2;
        for (let x = 8; x < T; x += 13) { c.beginPath(); c.moveTo(x, 14); c.lineTo(x - 2, 8); c.moveTo(x + 4, 15); c.lineTo(x + 6, 9); c.stroke(); }
      } else { c.fillStyle = 'rgba(123,201,106,.5)'; c.fillRect(0, 0, T, 6); }
      c.restore(); rim(c, v === 'top' ? '#6ab45a' : '#b9844f');
    } });
  def('dirt', { name: 'つち', col: '#b9844f', draw: plain('#b9844f', dirtTex) });
  def('stone', { name: 'いし', col: '#a3abb8', draw: plain('#a3abb8', (c, r) => {
    for (let i = 0; i < 4; i++) { const x = 8 + r() * 44, y = 8 + r() * 44, w = 10 + r() * 10; G.rr(c, x, y, w, w * 0.7, 4); c.fillStyle = i % 2 ? 'rgba(255,255,255,.28)' : 'rgba(70,80,100,.18)'; c.fill(); }
    c.strokeStyle = 'rgba(70,80,100,.35)'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(10 + r() * 10, 30); c.lineTo(26, 36); c.lineTo(34, 50); c.stroke();
  }) });
  def('sand', { name: 'すな', col: '#f3d58f', fall: true, draw: plain('#f3d58f', (c, r) => { dots(c, r, 22, ['rgba(200,150,80,.45)', 'rgba(255,255,255,.7)', 'rgba(230,180,110,.5)'], 1, 2.2); }) });
  def('snow', { name: 'ゆき', col: '#ffffff', variants: ['top', 'in'],
    draw(c, v) {
      box(c, '#e8f3ff'); clip(c);
      dots(c, rnd(7), 10, ['rgba(160,200,240,.45)', 'rgba(255,255,255,.9)'], 1.4, 3);
      if (v === 'top') { c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(0, 0); c.lineTo(T, 0); c.lineTo(T, 14); for (let x = T; x >= 0; x -= 16) c.quadraticCurveTo(x - 8, 26, x - 16, 14); c.closePath(); c.fill(); }
      c.restore(); rim(c, '#cfe4f8');
    } });
  def('ice', { name: 'こおり', col: '#bfe6ff', draw(c) {
    box(c, '#bfe6ff'); clip(c);
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(10, 50); c.lineTo(42, 8); c.lineTo(50, 8); c.lineTo(18, 50); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(30, 56); c.lineTo(56, 22); c.lineTo(58, 28); c.lineTo(36, 56); c.closePath(); c.fill();
    c.restore(); rim(c, '#9fd2f2');
  } });
  def('water', { name: 'みず', col: '#5fb8ef', solid: false, liquid: true, variants: ['top', 'in'],
    draw(c, v) {
      const g = c.createLinearGradient(0, 0, 0, T); g.addColorStop(0, 'rgba(110,200,250,.72)'); g.addColorStop(1, 'rgba(60,150,230,.78)');
      c.fillStyle = g; c.fillRect(0, v === 'top' ? 8 : 0, T, T - (v === 'top' ? 8 : 0));
      if (v === 'top') {
        c.fillStyle = 'rgba(200,240,255,.9)'; c.beginPath(); c.moveTo(0, 10); for (let x = 0; x <= T; x += 16) c.quadraticCurveTo(x + 8, 4, x + 16, 10); c.lineTo(T, 14); c.lineTo(0, 14); c.closePath(); c.fill();
      }
      c.fillStyle = 'rgba(255,255,255,.35)'; G.ell(c, 20, 34, 9, 2.4); c.fill(); G.ell(c, 44, 50, 6, 2); c.fill();
    } });
  def('leaves', { name: 'はっぱ', col: '#5cbf5a', airy: true, draw(c, v) {
    box(c, '#58b956', 14); clip(c, 14);
    const r = rnd(v + 11);
    for (let i = 0; i < 7; i++) { G.circ(c, 6 + r() * 52, 6 + r() * 52, 8 + r() * 6); c.fillStyle = i % 2 ? 'rgba(130,220,110,.75)' : 'rgba(60,150,60,.45)'; c.fill(); }
    if (v === 2) { G.circ(c, 40, 22, 6); c.fillStyle = '#ff5d5d'; c.fill(); c.fillStyle = '#fff'; G.circ(c, 38, 20, 1.8); c.fill(); }
    if (v === 1) { for (const [x, y] of [[18, 40], [44, 14]]) { c.fillStyle = '#fff'; for (let k = 0; k < 5; k++) { G.circ(c, x + Math.cos(k * 1.26) * 3.4, y + Math.sin(k * 1.26) * 3.4, 2.6); c.fill(); } c.fillStyle = '#ffd54a'; G.circ(c, x, y, 2); c.fill(); } }
    c.restore(); rim(c, '#4ba64a', 14);
  } });
  def('log', { name: 'まるた', col: '#a8733f', draw: plain('#a8733f', (c) => {
    c.strokeStyle = 'rgba(90,50,20,.4)'; c.lineWidth = 2.5;
    for (const x of [14, 30, 46]) { c.beginPath(); c.moveTo(x, 4); c.bezierCurveTo(x + 4, 22, x - 4, 40, x + 2, 60); c.stroke(); }
    G.ell(c, 38, 30, 4, 6); c.stroke();
  }) });
  def('cloud', { name: 'くも', col: '#ffffff', airy: true, draw(c) {
    c.fillStyle = '#ffffff'; c.strokeStyle = '#c9dcf2'; c.lineWidth = 2.6;
    c.beginPath(); c.moveTo(4, 48); c.arc(14, 40, 12, Math.PI * 0.6, Math.PI * 1.5); c.arc(32, 26, 18, Math.PI * 1.1, Math.PI * 1.9); c.arc(50, 38, 12, Math.PI * 1.4, Math.PI * 0.4); c.lineTo(10, 52); c.closePath();
    c.fill(); c.stroke();
    c.fillStyle = 'rgba(200,225,255,.5)'; G.ell(c, 32, 48, 20, 4); c.fill();
    c.fillStyle = 'rgba(255,255,255,.9)'; G.circ(c, 26, 20, 4); c.fill();
  } });
  def('flower', { name: 'おはな', col: '#ff8fb1', solid: false, deco: true, draw(c, v) {
    const cols = ['#ff6f91', '#ffd23f', '#9b8cff'][v] || '#ff6f91';
    c.strokeStyle = '#4f9e46'; c.lineWidth = 4; c.beginPath(); c.moveTo(32, 64); c.quadraticCurveTo(28, 46, 32, 30); c.stroke();
    c.fillStyle = '#6cc25c'; G.ell(c, 22, 50, 9, 4.5, -0.5); c.fill(); G.ell(c, 42, 46, 9, 4.5, 0.5); c.fill();
    for (let k = 0; k < 6; k++) { const a = (k / 6) * PT.TAU; G.circ(c, 32 + Math.cos(a) * 9, 24 + Math.sin(a) * 9, 7.5); G.fillO(c, cols, 2); }
    G.circ(c, 32, 24, 6); G.fillO(c, '#ffe27a', 2);
  } });
  def('mushroom', { name: 'きのこ', col: '#ff6a5d', solid: false, deco: true, draw(c) {
    G.rr(c, 24, 34, 16, 28, 6); G.fillO(c, '#fff4e2', 2.4);
    c.beginPath(); c.moveTo(6, 38); c.quadraticCurveTo(8, 8, 32, 8); c.quadraticCurveTo(56, 8, 58, 38); c.closePath(); G.fillO(c, '#ff6a5d', 2.6);
    c.fillStyle = '#fff'; G.circ(c, 22, 24, 5); c.fill(); G.circ(c, 40, 18, 4); c.fill(); G.circ(c, 46, 30, 3.5); c.fill();
  } });
  def('seed', { name: 'たね', col: '#8a5a2b', solid: false, deco: true, plant: true, draw(c, v) {
    // v: 0 たね 1 め 2 つぼみ
    c.fillStyle = 'rgba(120,80,40,.55)'; G.ell(c, 32, 60, 18, 5); c.fill();
    if (v === 0) { for (const x of [24, 34, 42]) { G.ell(c, x, 54, 4, 5.5, 0.3); G.fillO(c, '#8a5a2b', 2); } }
    else {
      const h = v === 1 ? 20 : 34;
      c.strokeStyle = '#4f9e46'; c.lineWidth = 4; c.beginPath(); c.moveTo(32, 60); c.lineTo(32, 60 - h); c.stroke();
      G.ell(c, 22, 60 - h + 4, 10, 5, -0.4); G.fillO(c, '#7bd36a', 2); G.ell(c, 42, 60 - h + 4, 10, 5, 0.4); G.fillO(c, '#7bd36a', 2);
      if (v === 2) { G.ell(c, 32, 60 - h - 4, 6, 8); G.fillO(c, '#ff8fb1', 2); }
    }
  } });

  /* ================= たてもの ================= */
  def('plank', { name: 'いた', col: '#e2a965', draw: plain('#e2a965', (c) => {
    c.strokeStyle = 'rgba(120,70,30,.45)'; c.lineWidth = 2.4;
    for (const y of [21, 42]) { c.beginPath(); c.moveTo(0, y); c.lineTo(T, y); c.stroke(); }
    for (const [x, y] of [[20, 0], [44, 21], [14, 42]]) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 21); c.stroke(); }
    c.fillStyle = 'rgba(120,70,30,.5)'; for (const [x, y] of [[8, 10], [56, 31], [30, 53]]) { G.circ(c, x, y, 1.8); c.fill(); }
    c.strokeStyle = 'rgba(255,240,210,.4)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(26, 10); c.quadraticCurveTo(34, 7, 40, 11); c.stroke();
  }) });
  const bricks = (mortar) => (c) => {
    c.strokeStyle = mortar; c.lineWidth = 3;
    for (let row = 0; row < 4; row++) {
      const y = row * 16; c.beginPath(); c.moveTo(0, y); c.lineTo(T, y); c.stroke();
      for (let x = row % 2 ? 16 : 0; x <= T; x += 32) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 16); c.stroke(); }
    }
    c.fillStyle = 'rgba(255,255,255,.18)'; for (let row = 0; row < 4; row++) for (let x = row % 2 ? -16 : 0; x < T; x += 32) c.fillRect(x + 3, row * 16 + 3, 26, 4);
  };
  def('brick', { name: 'レンガ', col: '#e0694f', draw: plain('#e0694f', bricks('#f6d9c8')) });
  def('wallwhite', { name: 'しろい かべ', col: '#fff4e4', draw: plain('#fff4e4', (c) => {
    c.strokeStyle = 'rgba(200,170,130,.35)'; c.lineWidth = 2; for (const x of [16, 32, 48]) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, T); c.stroke(); }
    c.fillStyle = 'rgba(255,170,120,.35)'; G.circ(c, 24, 24, 3); c.fill(); G.circ(c, 40, 44, 3); c.fill();
  }) });
  def('wallpink', { name: 'ピンクの かべ', col: '#ffc4d4', draw: plain('#ffc4d4', (c) => {
    c.fillStyle = 'rgba(255,255,255,.6)'; G.heart(c, 20, 24, 7); c.fill(); G.heart(c, 44, 46, 7); c.fill();
    c.fillStyle = 'rgba(255,111,145,.35)'; G.heart(c, 46, 18, 4); c.fill(); G.heart(c, 16, 50, 4); c.fill();
  }) });
  def('glass', { name: 'まど', col: '#bfe3ff', clear: true, draw(c) {
    G.rr(c, 2, 2, T - 4, T - 4, 6); c.fillStyle = 'rgba(190,230,255,.55)'; c.fill();
    c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(10, 30); c.lineTo(26, 10); c.lineTo(32, 10); c.lineTo(16, 30); c.closePath(); c.fill();
    c.strokeStyle = '#ffffff'; c.lineWidth = 6; G.rr(c, 4, 4, T - 8, T - 8, 5); c.stroke();
    c.beginPath(); c.moveTo(32, 4); c.lineTo(32, T - 4); c.moveTo(4, 32); c.lineTo(T - 4, 32); c.stroke();
    c.strokeStyle = '#8fb7d8'; c.lineWidth = 2; G.rr(c, 1.5, 1.5, T - 3, T - 3, 6); c.stroke();
  } });
  const roof = (col) => (c) => {
    box(c, col, 6); clip(c, 6);
    for (let row = 0; row < 4; row++) for (let x = (row % 2 ? -8 : 0); x < T + 8; x += 16) {
      c.beginPath(); c.arc(x + 8, row * 16 + 6, 8, 0, Math.PI); c.fillStyle = PT.shade(col, row % 2 ? 0.12 : -0.04); c.fill(); c.strokeStyle = PT.shade(col, -0.3); c.lineWidth = 2; c.stroke();
    }
    c.restore(); rim(c, col, 6);
  };
  def('roofred', { name: 'あかい やね', col: '#ef5f55', draw: roof('#ef5f55') });
  def('roofblue', { name: 'あおい やね', col: '#4f8fe8', draw: roof('#4f8fe8') });
  def('castle', { name: 'おしろの いし', col: '#d3d6e2', draw: plain('#d3d6e2', bricks('rgba(120,125,150,.45)')) });
  def('door', { name: 'ドア', col: '#c27a3e', solid: false, door: true, variants: ['bottom', 'top', 'open-bottom', 'open-top'],
    draw(c, v) {
      const open = v.startsWith('open'), top = v.endsWith('top');
      if (open) { c.fillStyle = 'rgba(60,40,30,.55)'; c.fillRect(6, top ? 6 : 0, T - 12, top ? T - 6 : T); G.rr(c, 6, top ? 4 : -2, 14, top ? T - 4 : T + 2, 4); G.fillO(c, '#c27a3e', 2.4); return; }
      c.beginPath();
      if (top) { c.moveTo(6, T); c.lineTo(6, 22); c.quadraticCurveTo(6, 4, 32, 4); c.quadraticCurveTo(58, 4, 58, 22); c.lineTo(58, T); c.closePath(); }
      else { c.rect(6, 0, T - 12, T); }
      G._bb = { x0: 6, y0: 0, x1: 58, y1: T }; G.fillO(c, '#c27a3e', 2.6);
      c.strokeStyle = 'rgba(90,50,20,.4)'; c.lineWidth = 2.4; G.rr(c, 14, top ? 18 : 6, 36, top ? 40 : 46, 6); c.stroke();
      if (top) { G.circ(c, 32, 30, 8); c.fillStyle = 'rgba(190,230,255,.9)'; c.fill(); c.stroke(); }
      else { G.circ(c, 48, 18, 4.5); G.fillO(c, '#ffd54a', 2); }
    } });
  def('ladder', { name: 'はしご', col: '#c98a4a', solid: false, climb: true, draw(c) {
    for (const x of [12, 52]) { G.rr(c, x - 4, 0, 8, T, 3); G.fillO(c, '#c98a4a', 2.2); }
    for (const y of [12, 32, 52]) { G.rr(c, 10, y - 3, 44, 7, 3); G.fillO(c, '#e2a965', 2.2); }
  } });
  def('fence', { name: 'さく', col: '#fff4e4', solid: false, deco: true, draw(c) {
    G.rr(c, 0, 26, T, 8, 3); G.fillO(c, '#ffffff', 2); G.rr(c, 0, 46, T, 8, 3); G.fillO(c, '#ffffff', 2);
    for (const x of [14, 50]) { c.beginPath(); c.moveTo(x - 7, T); c.lineTo(x - 7, 18); c.lineTo(x, 10); c.lineTo(x + 7, 18); c.lineTo(x + 7, T); c.closePath(); G._bb = { x0: x - 7, y0: 10, x1: x + 7, y1: T }; G.fillO(c, '#ffffff', 2.2); }
  } });
  def('lamp', { name: 'ランプ', col: '#ffd76a', light: 260, draw(c) {
    G.rr(c, 10, 10, 44, 46, 12); G.fillO(c, '#ffe9a0', 2.6);
    c.fillStyle = 'rgba(255,255,255,.75)'; G.rr(c, 16, 16, 12, 30, 6); c.fill();
    G.circ(c, 32, 33, 10); c.fillStyle = '#fff6c8'; c.fill();
    G.rr(c, 6, 4, 52, 9, 4); G.fillO(c, '#c27a3e', 2.2); G.rr(c, 6, 52, 52, 9, 4); G.fillO(c, '#c27a3e', 2.2);
  } });
  def('shelf', { name: 'ほんだな', col: '#b97a42', draw: plain('#b97a42', (c) => {
    const cols = ['#ff6f91', '#58b9f0', '#ffd23f', '#7bd36a', '#9b8cff', '#ff9a3d'];
    for (const y of [6, 34]) { c.fillStyle = 'rgba(80,40,10,.35)'; c.fillRect(5, y, 54, 24); for (let i = 0; i < 6; i++) { const h = 16 + ((i * 7 + y) % 7); G.rr(c, 7 + i * 8.5, y + 24 - h, 7, h, 2); c.fillStyle = cols[(i + y) % 6]; c.fill(); } }
  }) });

  /* ================= かわいい ================= */
  def('cookie', { name: 'クッキー', col: '#e3a75a', draw: plain('#e3a75a', (c, r) => { for (let i = 0; i < 6; i++) { G.ell(c, 9 + r() * 46, 9 + r() * 46, 4.5, 3.5, r() * 3); c.fillStyle = '#6b3e22'; c.fill(); } dots(c, r, 8, ['rgba(255,240,200,.6)'], 1, 1.8); }) });
  def('choco', { name: 'チョコ', col: '#7a4a2e', draw: plain('#7a4a2e', (c) => {
    c.strokeStyle = 'rgba(40,20,10,.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(32, 0); c.lineTo(32, T); c.moveTo(0, 32); c.lineTo(T, 32); c.stroke();
    c.fillStyle = 'rgba(255,220,190,.25)'; for (const [x, y] of [[4, 4], [36, 4], [4, 36], [36, 36]]) c.fillRect(x + 2, y + 2, 20, 4);
  }) });
  def('cake', { name: 'ケーキ', col: '#ffe7c4', draw(c) {
    box(c, '#ffe1b8'); clip(c);
    c.fillStyle = '#ff8fb1'; c.fillRect(0, 26, T, 10); c.fillStyle = '#fff7ee'; c.fillRect(0, 0, T, 14);
    c.beginPath(); c.moveTo(0, 14); for (let x = 0; x <= T; x += 16) c.quadraticCurveTo(x + 8, 24, x + 16, 14); c.lineTo(T, 12); c.lineTo(0, 12); c.fill();
    for (const x of [14, 38]) { G.heart(c, x + 6, 48, 6); c.fillStyle = '#ff5d78'; c.fill(); }
    c.restore(); rim(c, '#f2c79a');
  } });
  def('candy', { name: 'キャンディ', col: '#ff8fb1', draw(c) {
    box(c, '#ffffff'); clip(c);
    c.fillStyle = '#ff7aa2'; for (let x = -T; x < T * 2; x += 22) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 11, 0); c.lineTo(x + 11 - T, T); c.lineTo(x - T, T); c.closePath(); c.fill(); }
    c.restore(); rim(c, '#ff9fbd');
  } });
  def('rainbow', { name: 'にじ', col: '#ff9a3d', draw(c) {
    box(c, '#ffffff'); clip(c);
    ['#ff6f7a', '#ffa64d', '#ffe066', '#7bd36a', '#58b9f0', '#9b8cff'].forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * (T / 6), T, T / 6 + 1); });
    c.restore(); rim(c, '#c38be0');
  } });
  def('star', { name: 'ほし', col: '#ffd23f', light: 150, draw(c) {
    box(c, '#ffe26a'); clip(c); c.restore(); rim(c, '#ffcf3a');
    G.star(c, 32, 33, 20, 9); G.fillO(c, '#fff7c2', 2.4);
    c.fillStyle = '#fff'; G.circ(c, 26, 28, 2.6); c.fill();
  } });
  def('heart', { name: 'ハート', col: '#ff6f91', draw(c) {
    box(c, '#ffb3c8'); clip(c); c.restore(); rim(c, '#ff8fab');
    G.heart(c, 32, 38, 22); G.fillO(c, '#ff5d78', 2.6);
    c.fillStyle = 'rgba(255,255,255,.8)'; G.ell(c, 24, 26, 4, 2.5, -0.6); c.fill();
  } });
  def('gem', { name: 'ほうせき', col: '#a77bf0', light: 90, draw(c) {
    box(c, '#c9b2ff'); clip(c); c.restore(); rim(c, '#b39af0');
    const P = [[32, 8], [54, 26], [32, 58], [10, 26]];
    G.poly(c, P.flat()); G.fillO(c, '#9b6fe8', 2.4);
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.moveTo(32, 8); c.lineTo(22, 26); c.lineTo(10, 26); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(22, 26); c.lineTo(42, 26); c.lineTo(32, 58); c.closePath(); c.fill();
  } });
  def('gold', { name: 'きん', col: '#f5c242', draw(c) {
    box(c, '#f5c242'); clip(c);
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(0, 24); c.lineTo(24, 0); c.lineTo(36, 0); c.lineTo(0, 36); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(20, T); c.lineTo(T, 20); c.lineTo(T, 28); c.lineTo(28, T); c.closePath(); c.fill();
    c.restore(); rim(c, '#e0a92a');
  } });
  def('pumpkin', { name: 'かぼちゃ', col: '#ff9a3d', light: 120, draw(c) {
    G.rr(c, 28, 2, 8, 12, 3); G.fillO(c, '#5c9e3e', 2);
    for (const [x, w] of [[14, 16], [50, 16], [32, 18]]) { G.ell(c, x, 38, w, 24); G.fillO(c, '#ff9a3d', 2.4); }
    c.fillStyle = '#ffe066'; G.poly(c, [20, 32, 28, 32, 24, 26]); c.fill(); G.poly(c, [36, 32, 44, 32, 40, 26]); c.fill();
    c.beginPath(); c.moveTo(20, 44); c.quadraticCurveTo(32, 56, 44, 44); c.quadraticCurveTo(32, 50, 20, 44); c.fill();
  } });

  /* ================= しかけ ================= */
  def('bounce', { name: 'トランポリン', col: '#58b9f0', bounce: true, draw(c) {
    G.rr(c, 2, 20, T - 4, 42, 8); G.fillO(c, '#58b9f0', 2.6);
    for (const x of [10, 54]) { G.rr(c, x - 4, 26, 8, 34, 3); G.fillO(c, '#2f7fe0', 2); }
    c.beginPath(); c.moveTo(2, 18); c.quadraticCurveTo(32, 30, T - 2, 18); c.lineTo(T - 2, 12); c.quadraticCurveTo(32, 22, 2, 12); c.closePath(); G._bb = { x0: 2, y0: 12, x1: 62, y1: 30 }; G.fillO(c, '#ff6f91', 2.4);
    c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(14, 44); c.lineTo(50, 44); c.stroke();
  } });
  def('note', { name: 'おんがく ブロック', col: '#9b6fd6', note: true, draw(c) {
    box(c, '#b996ef'); clip(c); c.restore(); rim(c, '#a07ce0');
    G.note(c, 28, 44, 30, '#ffffff');
    c.fillStyle = '#ffe066'; G.star(c, 50, 14, 6, 2.6); c.fill();
  } });
  def('firework', { name: 'はなび ブロック', col: '#ff5d78', firework: true, draw(c) {
    box(c, '#2f3f7a'); clip(c);
    ['#ff5d78', '#ffd23f', '#58b9f0', '#7bd36a'].forEach((col, i) => { c.fillStyle = col; G.star(c, 14 + (i % 2) * 34, 16 + ((i / 2) | 0) * 30, 8, 3.4); c.fill(); });
    c.restore(); rim(c, '#2f3f7a');
    G.rr(c, 26, 22, 12, 30, 4); G.fillO(c, '#ff5d78', 2); c.strokeStyle = '#ffd23f'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(32, 22); c.quadraticCurveTo(36, 14, 32, 8); c.stroke();
  } });
  def('slime', { name: 'ぷるぷる ゼリー', col: '#7bd36a', bounce: true, draw(c) {
    G.rr(c, 3, 6, T - 6, T - 8, 16); c.fillStyle = 'rgba(120,220,110,.75)'; c.fill(); c.strokeStyle = '#4f9e46'; c.lineWidth = 2.6; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.6)'; G.ell(c, 20, 18, 8, 4, -0.4); c.fill();
    c.fillStyle = '#2a1f35'; G.circ(c, 24, 36, 3.2); c.fill(); G.circ(c, 40, 36, 3.2); c.fill();
    c.strokeStyle = '#2a1f35'; c.lineWidth = 2; c.beginPath(); c.arc(32, 40, 5, 0.3, Math.PI - 0.3); c.stroke();
  } });

  /* ---- キャッシュ ---- */
  const cache = new Map();
  PT.tileImg = (b, v, px) => {
    const key = px + '|' + b.code + ':' + v;
    if (cache.size > 1500) cache.clear();
    let cv = cache.get(key);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = cv.height = px;
      const c = cv.getContext('2d'); c.scale(px / T, px / T);
      try { b.draw(c, v); } catch (e) { console.error(b.id, e); }
      cache.set(key, cv);
    }
    return cv;
  };
  /* パネル用の アイコン */
  PT.blockIcon = (id, size = 96) => {
    const b = BY[id]; const cv = document.createElement('canvas');
    const dpr = Math.min(3, Math.max(2, window.devicePixelRatio || 1)); cv.width = cv.height = Math.round(size * dpr);
    const c = cv.getContext('2d'); const k = (size * dpr) / T * 0.82; c.translate(size * dpr * 0.09, size * dpr * 0.09); c.scale(k, k);
    b.draw(c, b.variants ? b.variants[0] : 0);
    return cv;
  };
  PT.TILE = T;
  PT.BLOCK_CATS = {
    nature: ['grass', 'dirt', 'stone', 'sand', 'snow', 'ice', 'water', 'leaves', 'log', 'cloud', 'flower', 'mushroom', 'seed'],
    build: ['plank', 'brick', 'wallwhite', 'wallpink', 'glass', 'door', 'roofred', 'roofblue', 'castle', 'shelf', 'lamp', 'ladder', 'fence'],
    cute: ['heart', 'star', 'rainbow', 'candy', 'cake', 'cookie', 'choco', 'gem', 'gold', 'pumpkin', 'slime'],
    trick: ['bounce', 'note', 'firework', 'seed', 'ladder', 'door', 'lamp', 'water', 'sand', 'slime'],
  };
})();
