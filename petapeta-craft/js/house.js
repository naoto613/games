/* おうちづくり：へや・やね・かべ・まど・ドア・かざりを えらぶだけで くみたてる ドールハウス */
'use strict';
(() => {
  const G2 = PT.G, T = PT.TILE, E = PT.E;
  const GR = 26, X0 = 44, RH = 4;
  const H = (PT.house = { GR, X0, RH, state: null, lot: null, anim: new Map(), preview: null });

  /* ================= かべがみ・ゆか ================= */
  const clipR = (c, r) => { c.save(); c.beginPath(); c.rect(r.x, r.y, r.w, r.h); c.clip(); };
  const WP = {
    stripes: (a, b, w = 26) => (c, r) => { c.fillStyle = a; c.fillRect(r.x, r.y, r.w, r.h); c.fillStyle = b; for (let x = r.x; x < r.x + r.w; x += w * 2) c.fillRect(x, r.y, w, r.h); },
    dots: (a, b) => (c, r) => { c.fillStyle = a; c.fillRect(r.x, r.y, r.w, r.h); c.fillStyle = b; for (let y = r.y + 16, i = 0; y < r.y + r.h; y += 30, i++) for (let x = r.x + 14 + (i % 2) * 18; x < r.x + r.w; x += 36) { G2.circ(c, x, y, 5); c.fill(); } },
    hearts: (a, b) => (c, r) => { c.fillStyle = a; c.fillRect(r.x, r.y, r.w, r.h); c.fillStyle = b; for (let y = r.y + 22, i = 0; y < r.y + r.h; y += 40, i++) for (let x = r.x + 20 + (i % 2) * 24; x < r.x + r.w; x += 48) { G2.heart(c, x, y, 9); c.fill(); } },
    stars: (a, b) => (c, r) => { const g = c.createLinearGradient(0, r.y, 0, r.y + r.h); g.addColorStop(0, a); g.addColorStop(1, PT.shade(a, 0.25)); c.fillStyle = g; c.fillRect(r.x, r.y, r.w, r.h); c.fillStyle = b; const rr = PT.seeded(r.x + 3); for (let i = 0; i < 18; i++) { G2.star(c, r.x + rr() * r.w, r.y + rr() * r.h * 0.8, 4 + rr() * 5, 2); c.fill(); } },
    tiles: (a, b, s = 32) => (c, r) => { c.fillStyle = a; c.fillRect(r.x, r.y, r.w, r.h); c.strokeStyle = b; c.lineWidth = 2; c.beginPath(); for (let x = r.x; x <= r.x + r.w; x += s) { c.moveTo(x, r.y); c.lineTo(x, r.y + r.h); } for (let y = r.y; y <= r.y + r.h; y += s) { c.moveTo(r.x, y); c.lineTo(r.x + r.w, y); } c.stroke(); },
    clouds: (a) => (c, r) => { const g = c.createLinearGradient(0, r.y, 0, r.y + r.h); g.addColorStop(0, a); g.addColorStop(1, '#ffffff'); c.fillStyle = g; c.fillRect(r.x, r.y, r.w, r.h); c.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 4; i++) { const x = r.x + 40 + i * 80, y = r.y + 40 + (i % 2) * 50; G2.ell(c, x, y, 30, 12); c.fill(); G2.circ(c, x - 8, y - 8, 12); c.fill(); G2.circ(c, x + 10, y - 10, 14); c.fill(); } },
    notes: (a, b) => (c, r) => { c.fillStyle = a; c.fillRect(r.x, r.y, r.w, r.h); for (let y = r.y + 34, i = 0; y < r.y + r.h; y += 54, i++) for (let x = r.x + 24 + (i % 2) * 30; x < r.x + r.w; x += 60) G2.note(c, x, y, 18, b); },
    damask: (a, b) => (c, r) => { c.fillStyle = a; c.fillRect(r.x, r.y, r.w, r.h); c.strokeStyle = b; c.lineWidth = 2.5; for (let y = r.y + 30, i = 0; y < r.y + r.h; y += 56, i++) for (let x = r.x + 28 + (i % 2) * 34; x < r.x + r.w; x += 68) { c.beginPath(); c.moveTo(x, y - 16); c.quadraticCurveTo(x + 14, y, x, y + 16); c.quadraticCurveTo(x - 14, y, x, y - 16); c.stroke(); G2.circ(c, x, y, 3); c.fillStyle = b; c.fill(); } },
    space: () => (c, r) => { const g = c.createLinearGradient(0, r.y, 0, r.y + r.h); g.addColorStop(0, '#24205a'); g.addColorStop(1, '#4a3a8a'); c.fillStyle = g; c.fillRect(r.x, r.y, r.w, r.h); const rr = PT.seeded(r.x + 9); for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(255,255,230,${0.4 + rr() * 0.6})`; G2.circ(c, r.x + rr() * r.w, r.y + rr() * r.h, 1 + rr() * 2); c.fill(); } G2.circ(c, r.x + r.w * 0.78, r.y + 56, 22); c.fillStyle = '#ff9a3d'; c.fill(); c.strokeStyle = '#ffd23f'; c.lineWidth = 4; G2.ell(c, r.x + r.w * 0.78, r.y + 56, 38, 9, -0.3); c.stroke(); G2.circ(c, r.x + 50, r.y + r.h * 0.5, 14); c.fillStyle = '#7fd0ff'; c.fill(); },
    candy: (a, b) => (c, r) => { c.fillStyle = a; c.fillRect(r.x, r.y, r.w, r.h); c.fillStyle = b; for (let x = r.x - r.h; x < r.x + r.w; x += 44) { c.beginPath(); c.moveTo(x, r.y + r.h); c.lineTo(x + 16, r.y + r.h); c.lineTo(x + 16 + r.h, r.y); c.lineTo(x + r.h, r.y); c.closePath(); c.fill(); } },
    glass: () => (c, r) => { c.fillStyle = '#e7f9ef'; c.fillRect(r.x, r.y, r.w, r.h); c.strokeStyle = '#9fd8b8'; c.lineWidth = 5; c.beginPath(); for (let x = r.x + 40; x < r.x + r.w; x += 80) { c.moveTo(x, r.y); c.lineTo(x, r.y + r.h); } c.moveTo(r.x, r.y + r.h * 0.45); c.lineTo(r.x + r.w, r.y + r.h * 0.45); c.stroke(); c.fillStyle = 'rgba(255,255,255,.6)'; for (let x = r.x + 50; x < r.x + r.w; x += 80) { c.beginPath(); c.moveTo(x, r.y + 20); c.lineTo(x + 18, r.y + 20); c.lineTo(x + 2, r.y + 70); c.lineTo(x - 16, r.y + 70); c.closePath(); c.fill(); } },
  };
  const FL = { wood: ['#d99a5b', 'planks'], check: ['#ffffff', 'check'], carpet: ['#c9b2ff', 'plain'], pink: ['#ffb3c8', 'plain'], tile: ['#bfe6ff', 'check'], mat: ['#7bd36a', 'mat'], dark: ['#3a3570', 'plain'], gold: ['#f5c242', 'planks'] };

  /* ================= へや ================= */
  const R = (H.ROOMS = {});
  const room = (id, name, wall, floor, props, extra) => { R[id] = { id, name, wall, floor, props, extra }; };
  room('living', 'いま', WP.stripes('#e3f8ec', '#d0f0de'), 'wood', [['sofa', 0.36], ['tv', 0.8], ['plantpot', 0.07]]);
  room('kitchen', 'だいどころ', WP.tiles('#fffaf0', '#ffd9a8'), 'check', [['fridge', 0.12], ['stove', 0.36], ['table', 0.68], ['chair', 0.9]]);
  room('bedroom', 'ねるへや', WP.stars('#5b6bb5', '#fff3a8'), 'carpet', [['bed', 0.42], ['floorlamp', 0.88], ['teddy', 0.08]]);
  room('bath', 'おふろ', WP.tiles('#d8f1ff', '#a8d8f5', 28), 'tile', [['bath', 0.48], ['duck', 0.88]]);
  room('kids', 'こどもべや', WP.hearts('#ffe3ec', '#ffb3c8'), 'pink', [['toybox', 0.22], ['blocks', 0.52], ['ball', 0.82]]);
  room('princess', 'おひめさまの へや', WP.damask('#ffd6e6', '#f5c242'), 'pink', [['canopybed', 0.38], ['mirror', 0.84]]);
  room('music', 'おんがくの へや', WP.notes('#fff4c2', 'rgba(155,111,214,.5)'), 'wood', [['piano', 0.36], ['drum', 0.8]]);
  room('library', 'ほんの へや', WP.stripes('#e8f2d8', '#dcebc6', 14), 'wood', [['bookcase', 0.18], ['bookcase', 0.42], ['chair', 0.78]]);
  room('play', 'あそびば', WP.clouds('#bfe6ff'), 'mat', [['slide', 0.32], ['trampoline', 0.8]]);
  room('green', 'おんしつ', WP.glass(), 'tile', [['plantpot', 0.15], ['flowerbed', 0.5], ['plantpot', 0.86]]);
  room('space', 'うちゅうの へや', WP.space(), 'dark', [['robottoy', 0.3], ['telescope', 0.75]]);
  room('candy', 'おかしの へや', WP.candy('#fff0f6', '#ffd1e3'), 'pink', [['cake', 0.25], ['donut', 0.52], ['icecream', 0.78]]);
  H.ROOM_LIST = ['living', 'kitchen', 'bedroom', 'bath', 'kids', 'princess', 'music', 'library', 'play', 'green', 'space', 'candy'];

  /* ================= そとかべ ================= */
  const WALLS = (H.WALLS = {});
  const wall = (id, name, col, pat) => { WALLS[id] = { id, name, col, pat }; };
  wall('cream', 'クリーム', '#fff1d6'); wall('pink', 'ピンク', '#ffc4d6'); wall('mint', 'ミント', '#bfeccf'); wall('sky', 'みずいろ', '#bfe3ff');
  wall('lavender', 'ラベンダー', '#d9c9ff'); wall('lemon', 'レモン', '#fff0a0');
  wall('brick', 'レンガ', '#e0694f', 'brick'); wall('log', 'まるた', '#b9824a', 'log'); wall('stone', 'いし', '#c9ccd8', 'brick'); wall('cookie', 'クッキー', '#e3a75a', 'chip');
  H.WALL_LIST = Object.keys(WALLS);
  const wallFill = (c, x, y, w, h, wl) => {
    G2.rr(c, x, y, w, h, 6); G2.fillO(c, wl.col, 3);
    if (!wl.pat) return;
    c.save(); c.beginPath(); c.rect(x + 2, y + 2, w - 4, h - 4); c.clip();
    if (wl.pat === 'brick') { c.strokeStyle = PT.shade(wl.col, -0.28); c.lineWidth = 2; for (let yy = y, i = 0; yy < y + h; yy += 14, i++) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); c.stroke(); for (let xx = x + (i % 2) * 12; xx < x + w; xx += 24) { c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy + 14); c.stroke(); } } }
    if (wl.pat === 'log') { c.strokeStyle = PT.shade(wl.col, -0.3); c.lineWidth = 2.5; for (let yy = y + 10; yy < y + h; yy += 18) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); c.stroke(); } }
    if (wl.pat === 'chip') { c.fillStyle = '#6b3e22'; const r = PT.seeded(x * 3 + y); for (let i = 0; i < (w * h) / 500; i++) { G2.ell(c, x + r() * w, y + r() * h, 3.5, 2.5); c.fill(); } }
    c.restore();
  };

  /* ================= まど・ドア ================= */
  const WINS = (H.WINS = {});
  const win = (id, name, draw) => { WINS[id] = { id, name, draw }; };
  const sky = (c) => { const g = c.createLinearGradient(0, -40, 0, 40); const k = E.nightK || 0; g.addColorStop(0, k > 0.5 ? '#2a3170' : '#8fd3ff'); g.addColorStop(1, k > 0.5 ? '#4a3f86' : '#dff4ff'); return g; };
  const frame = '#ffffff', fl = '#b98a5a';
  win('cross', 'しかくい まど', (c) => { G2.rr(c, -44, -38, 88, 76, 8); c.fillStyle = sky(c); c.fill(); c.strokeStyle = frame; c.lineWidth = 9; c.stroke(); c.beginPath(); c.moveTo(0, -38); c.lineTo(0, 38); c.moveTo(-44, 0); c.lineTo(44, 0); c.lineWidth = 7; c.stroke(); c.strokeStyle = fl; c.lineWidth = 2; G2.rr(c, -49, -43, 98, 86, 10); c.stroke(); });
  win('round', 'まるい まど', (c) => { G2.circ(c, 0, 0, 38); c.fillStyle = sky(c); c.fill(); c.strokeStyle = '#ffd23f'; c.lineWidth = 10; c.stroke(); c.strokeStyle = '#c99a22'; c.lineWidth = 2; G2.circ(c, 0, 0, 44); c.stroke(); c.fillStyle = 'rgba(255,255,255,.6)'; G2.ell(c, -12, -14, 10, 5, -0.6); c.fill(); });
  win('arch', 'アーチの まど', (c) => { c.beginPath(); c.moveTo(-36, 40); c.lineTo(-36, -6); c.arc(0, -6, 36, Math.PI, 0); c.lineTo(36, 40); c.closePath(); c.fillStyle = sky(c); c.fill(); c.strokeStyle = frame; c.lineWidth = 8; c.stroke(); c.beginPath(); c.moveTo(0, -42); c.lineTo(0, 40); c.lineWidth = 5; c.stroke(); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 50, -40); c.quadraticCurveTo(s * 30, 0, s * 46, 46); c.lineTo(s * 56, 46); c.lineTo(s * 56, -40); c.closePath(); G2._bb = null; c.fillStyle = '#ff8fb1'; c.fill(); } G2.rr(c, -58, -48, 116, 10, 5); G2.fillO(c, '#c27a3e', 2); });
  win('heart', 'ハートの まど', (c) => { G2.heart(c, 0, 8, 46); c.fillStyle = sky(c); c.fill(); c.strokeStyle = '#ff6f91'; c.lineWidth = 9; c.stroke(); c.fillStyle = 'rgba(255,255,255,.6)'; G2.ell(c, -16, -10, 8, 4, -0.6); c.fill(); });
  win('star', 'ほしの まど', (c) => { G2.star(c, 0, 4, 48, 22); c.fillStyle = sky(c); c.fill(); c.strokeStyle = '#ffd23f'; c.lineWidth = 8; c.stroke(); });
  win('wide', 'おおきな まど', (c) => { G2.rr(c, -70, -36, 140, 72, 8); c.fillStyle = sky(c); c.fill(); c.strokeStyle = frame; c.lineWidth = 8; c.stroke(); c.beginPath(); c.moveTo(-23, -36); c.lineTo(-23, 36); c.moveTo(23, -36); c.lineTo(23, 36); c.lineWidth = 6; c.stroke(); G2.rr(c, -74, 36, 148, 16, 5); G2.fillO(c, '#c27a3e', 2); for (let i = 0; i < 6; i++) { G2.circ(c, -60 + i * 24, 34, 7); G2.fillO(c, ['#ff6f91', '#ffd23f', '#9b8cff'][i % 3], 1.5); } });
  H.WIN_LIST = Object.keys(WINS);

  const DOORS = (H.DOORS = {});
  const door = (id, name, col, draw) => { DOORS[id] = { id, name, col, draw }; };
  const doorBase = (c, col, arch) => { c.beginPath(); if (arch) { c.moveTo(-30, 0); c.lineTo(-30, -84); c.arc(0, -84, 30, Math.PI, 0); c.lineTo(30, 0); } else { c.rect(-30, -116, 60, 116); } c.closePath(); G2._bb = { x0: -30, y0: -116, x1: 30, y1: 0 }; G2.fillO(c, col, 3); G2.circ(c, 18, -54, 5); G2.fillO(c, '#ffd54a', 2); };
  door('wood', 'きの ドア', '#c27a3e', (c) => { doorBase(c, '#c27a3e'); c.strokeStyle = 'rgba(90,50,20,.4)'; c.lineWidth = 3; G2.rr(c, -20, -104, 40, 40, 5); c.stroke(); G2.rr(c, -20, -54, 40, 44, 5); c.stroke(); });
  door('red', 'あかい ドア', '#ef5f55', (c) => { doorBase(c, '#ef5f55', true); G2.circ(c, 0, -86, 13); c.fillStyle = '#bfe6ff'; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke(); });
  door('blue', 'あおい ドア', '#4f8fe8', (c) => { doorBase(c, '#4f8fe8', true); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; for (const x of [-12, 0, 12]) { c.beginPath(); c.moveTo(x, -100); c.lineTo(x, -8); c.stroke(); } });
  door('heart', 'ハートの ドア', '#ff8fb1', (c) => { doorBase(c, '#ff8fb1', true); G2.heart(c, 0, -70, 16); G2.fillO(c, '#ff5d78', 2.5); });
  door('gate', 'おしろの もん', '#8a6a4a', (c) => { doorBase(c, '#8a6a4a', true); c.strokeStyle = '#3a3550'; c.lineWidth = 4; for (let y = -96; y < 0; y += 22) { c.beginPath(); c.moveTo(-30, y); c.lineTo(30, y); c.stroke(); } for (const x of [-15, 15]) { c.beginPath(); c.moveTo(x, -108); c.lineTo(x, 0); c.stroke(); } });
  door('candy', 'キャンディの ドア', '#ffffff', (c) => { doorBase(c, '#ffffff', true); c.save(); c.beginPath(); c.moveTo(-30, 0); c.lineTo(-30, -84); c.arc(0, -84, 30, Math.PI, 0); c.lineTo(30, 0); c.closePath(); c.clip(); c.fillStyle = '#ff7aa2'; for (let x = -140; x < 60; x += 22) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 11, 0); c.lineTo(x + 131, -120); c.lineTo(x + 120, -120); c.closePath(); c.fill(); } c.restore(); G2.circ(c, 18, -54, 6); G2.fillO(c, '#ffd54a', 2); });
  H.DOOR_LIST = Object.keys(DOORS);

  /* ================= やね ================= */
  const ROOFS = (H.ROOFS = {});
  const roof = (id, name, col, draw) => { ROOFS[id] = { id, name, col, draw }; };
  const tri = (c, x0, x1, y, h) => { c.beginPath(); c.moveTo(x0, y); c.lineTo((x0 + x1) / 2, y - h); c.lineTo(x1, y); c.closePath(); G2._bb = { x0, y0: y - h, x1, y1: y }; };
  const scallop = (c, x0, x1, y, h, col) => {
    c.save(); tri(c, x0, x1, y, h); c.clip();
    for (let r = 0, yy = y - h; yy < y + 20; yy += 26, r++) for (let x = x0 - 30 + (r % 2) * 18; x < x1 + 30; x += 36) { c.beginPath(); c.arc(x + 18, yy, 18, 0, Math.PI); c.fillStyle = PT.shade(col, r % 2 ? 0.1 : -0.05); c.fill(); c.strokeStyle = PT.shade(col, -0.32); c.lineWidth = 2.5; c.stroke(); }
    c.restore();
  };
  roof('red', 'あかい やね', '#ef5f55', (c, x0, x1, y, h, t) => { tri(c, x0, x1, y, h); G2.fillO(c, '#ef5f55', 4); scallop(c, x0, x1, y, h, '#ef5f55'); tri(c, x0, x1, y, h); c.strokeStyle = PT.line('#ef5f55'); c.lineWidth = 4; c.stroke(); G2.rr(c, x0 - 6, y - 10, x1 - x0 + 12, 16, 7); G2.fillO(c, '#fff4e4', 3); });
  roof('blue', 'あおい まるやね', '#4f8fe8', (c, x0, x1, y, h) => {
    c.beginPath(); c.moveTo(x0, y); c.bezierCurveTo(x0 + 10, y - h * 1.1, x1 - 10, y - h * 1.1, x1, y); c.closePath(); G2._bb = { x0, y0: y - h, x1, y1: y }; G2.fillO(c, '#58a0f0', 4);
    c.save(); c.clip(); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 10; for (let x = x0 + 20; x < x1; x += 46) { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + (x0 + x1) / 2) / 2, y - h, (x0 + x1) / 2, y - h * 0.9); c.stroke(); } c.restore();
    G2.circ(c, (x0 + x1) / 2, y - h * 0.45, 22); c.fillStyle = '#bfe6ff'; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 6; c.stroke();
    G2.rr(c, x0 - 6, y - 10, x1 - x0 + 12, 16, 7); G2.fillO(c, '#ffffff', 3);
  });
  roof('castle', 'おしろの やね', '#c9ccd8', (c, x0, x1, y, h, t) => {
    const ph = 46; G2.rr(c, x0 + 8, y - ph, x1 - x0 - 16, ph + 4, 4); G2.fillO(c, '#c9ccd8', 3);
    for (let x = x0 + 8; x < x1 - 30; x += 44) { G2.rr(c, x, y - ph - 24, 26, 26, 3); G2.fillO(c, '#c9ccd8', 3); }
    for (const tx of [x0 + 26, x1 - 26]) {
      G2.rr(c, tx - 30, y - h - 20, 60, h + 20, 4); G2.fillO(c, '#d7dae5', 3);
      G2.rr(c, tx - 12, y - h + 20, 24, 34, 12); c.fillStyle = '#2f3f7a'; c.fill();
      c.beginPath(); c.moveTo(tx - 40, y - h - 20); c.lineTo(tx, y - h - 100); c.lineTo(tx + 40, y - h - 20); c.closePath(); G2._bb = { x0: tx - 40, y0: y - h - 100, x1: tx + 40, y1: y - h - 20 }; G2.fillO(c, '#9b6fd6', 3);
      c.strokeStyle = '#6a5a8a'; c.lineWidth = 3; c.beginPath(); c.moveTo(tx, y - h - 100); c.lineTo(tx, y - h - 136); c.stroke();
      const wv = Math.sin((t || 0) * 0.006 + tx) * 4; c.beginPath(); c.moveTo(tx, y - h - 136); c.quadraticCurveTo(tx + 14, y - h - 132 + wv, tx + 28, y - h - 126); c.lineTo(tx, y - h - 118); c.closePath(); c.fillStyle = '#ff5d78'; c.fill();
    }
    G2.heart(c, (x0 + x1) / 2, y - ph / 2, 12); c.fillStyle = '#ff6f91'; c.fill();
  });
  roof('candy', 'おかしの やね', '#7a4a2e', (c, x0, x1, y, h) => {
    c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo(x0 + 6, y - h, (x0 + x1) / 2, y - h); c.quadraticCurveTo(x1 - 6, y - h, x1, y); c.closePath(); G2._bb = { x0, y0: y - h, x1, y1: y }; G2.fillO(c, '#8a5534', 4);
    c.beginPath(); c.moveTo(x0 + 4, y - h * 0.32); c.quadraticCurveTo(x0 + 12, y - h + 10, (x0 + x1) / 2, y - h + 8); c.quadraticCurveTo(x1 - 12, y - h + 10, x1 - 4, y - h * 0.32);
    for (let x = x1 - 4; x > x0 + 4; x -= 28) { c.quadraticCurveTo(x - 7, y - h * 0.32 + 26, x - 14, y - h * 0.32); c.quadraticCurveTo(x - 21, y - h * 0.32 + 12, x - 28, y - h * 0.32); }
    c.closePath(); c.fillStyle = '#fff4f8'; c.fill();
    const r = PT.seeded(x0); for (let i = 0; i < 14; i++) { G2.circ(c, x0 + 40 + r() * (x1 - x0 - 80), y - h * 0.6 - r() * h * 0.3, 6); c.fillStyle = ['#ff5d78', '#58b9f0', '#ffd23f', '#7bd36a'][i % 4]; c.fill(); }
    const cx = (x0 + x1) / 2; c.strokeStyle = '#fff'; c.lineWidth = 7; c.beginPath(); c.moveTo(cx, y - h); c.lineTo(cx, y - h - 50); c.stroke(); G2.circ(c, cx, y - h - 66, 22); G2.fillO(c, '#ff8fb1', 3); c.strokeStyle = '#fff'; c.lineWidth = 5; c.beginPath(); c.arc(cx, y - h - 66, 12, 0, 4.6); c.stroke();
  });
  roof('mushroom', 'きのこの やね', '#ff6a5d', (c, x0, x1, y, h) => {
    c.beginPath(); c.moveTo(x0 - 20, y + 6); c.bezierCurveTo(x0 - 10, y - h * 1.35, x1 + 10, y - h * 1.35, x1 + 20, y + 6); c.closePath(); G2._bb = { x0, y0: y - h, x1, y1: y }; G2.fillO(c, '#ff6a5d', 4);
    c.fillStyle = '#ffffff'; const cx = (x0 + x1) / 2, w = x1 - x0; [[-0.3, 0.55, 22], [0.05, 0.85, 28], [0.32, 0.5, 20], [-0.12, 0.32, 14], [0.2, 0.25, 12]].forEach(([fx, fy, r]) => { G2.circ(c, cx + fx * w, y - fy * h, r); c.fill(); });
  });
  roof('circus', 'テントの やね', '#ff5d78', (c, x0, x1, y, h, t) => {
    const cx = (x0 + x1) / 2; c.save(); tri(c, x0 - 10, x1 + 10, y, h * 1.1); G2.fillO(c, '#ffffff', 4); c.clip();
    for (let i = -6; i < 6; i++) { c.beginPath(); c.moveTo(cx, y - h * 1.1); c.lineTo(cx + i * 60, y + 10); c.lineTo(cx + i * 60 + 30, y + 10); c.closePath(); c.fillStyle = '#ff5d78'; c.fill(); } c.restore();
    tri(c, x0 - 10, x1 + 10, y, h * 1.1); c.strokeStyle = '#a8324a'; c.lineWidth = 4; c.stroke();
    for (let x = x0 - 6; x < x1 + 6; x += 30) { c.beginPath(); c.arc(x + 15, y, 15, 0, Math.PI); c.fillStyle = (x / 30) % 2 < 1 ? '#ffd23f' : '#58b9f0'; c.fill(); }
    c.strokeStyle = '#6a5a8a'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx, y - h * 1.1); c.lineTo(cx, y - h * 1.1 - 40); c.stroke(); const wv = Math.sin((t || 0) * 0.006) * 4; c.beginPath(); c.moveTo(cx, y - h * 1.1 - 40); c.quadraticCurveTo(cx + 14, y - h * 1.1 - 36 + wv, cx + 30, y - h * 1.1 - 30); c.lineTo(cx, y - h * 1.1 - 22); c.closePath(); c.fillStyle = '#ffd23f'; c.fill();
  });
  roof('snow', 'ゆきの やね', '#5a6a9a', (c, x0, x1, y, h) => {
    tri(c, x0, x1, y, h); G2.fillO(c, '#6a7ab0', 4);
    c.beginPath(); c.moveTo(x0 - 4, y - 8); c.lineTo((x0 + x1) / 2, y - h - 10); c.lineTo(x1 + 4, y - 8);
    for (let x = x1; x > x0; x -= 30) c.quadraticCurveTo(x - 15, y - 34 + ((x / 30) % 2) * 10, x - 30, y - 22);
    c.closePath(); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#c9dcf2'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#dff4ff'; for (let x = x0 + 16; x < x1 - 10; x += 34) { c.beginPath(); c.moveTo(x - 5, y + 4); c.lineTo(x, y + 22 + (x % 3) * 4); c.lineTo(x + 5, y + 4); c.closePath(); c.fill(); }
  });
  roof('leaf', 'はっぱの やね', '#5cbf5a', (c, x0, x1, y, h) => {
    const r = PT.seeded(x0 + 7), w = x1 - x0;
    for (let i = 0; i < 16; i++) { const fx = r(), fy = r(); const x = x0 + fx * w, yy = y - 10 - fy * h * (1 - Math.abs(fx - 0.5)) * 1.4, rr = 34 + r() * 22; G2.circ(c, x, yy, rr); G2.fillO(c, i % 3 ? '#5cbf5a' : '#4aa84a', 3); }
    for (let i = 0; i < 6; i++) { G2.circ(c, x0 + 30 + r() * (w - 60), y - 20 - r() * h * 0.7, 7); G2.fillO(c, '#ff5d5d', 2); }
  });
  roof('star', 'よぞらの やね', '#2f3f7a', (c, x0, x1, y, h, t) => {
    tri(c, x0, x1, y, h); G2.fillO(c, '#2f3f7a', 4);
    c.save(); tri(c, x0, x1, y, h); c.clip(); const r = PT.seeded(x0 + 1); for (let i = 0; i < 16; i++) { c.fillStyle = `rgba(255,236,120,${0.6 + 0.4 * Math.sin((t || 0) * 0.004 + i)})`; G2.star(c, x0 + r() * (x1 - x0), y - r() * h, 5 + r() * 5, 2.4); c.fill(); } c.restore();
    const cx = (x0 + x1) / 2; G2.circ(c, cx, y - h - 26, 24); G2.fillO(c, '#ffe066', 3); G2.circ(c, cx + 11, y - h - 32, 20); c.fillStyle = '#8fb7ff'; c.fill();
    G2.rr(c, x0 - 6, y - 10, x1 - x0 + 12, 16, 7); G2.fillO(c, '#ffd23f', 3);
  });
  H.ROOF_LIST = Object.keys(ROOFS);

  /* ================= かべの かざり・やねの かざり ================= */
  H.RDECO = { chimney: 'えんとつ', flag: 'はた', lights: 'イルミネーション', startop: 'おほしさま' };
  H.RDECO_LIST = Object.keys(H.RDECO);
  const WD = (H.WD = {});
  const wd = (id, name, draw) => { WD[id] = { id, name, draw }; };
  wd('clock', 'かべどけい', (c, t) => { G2.circ(c, 0, 0, 30); G2.fillO(c, '#fff8e8', 3); c.strokeStyle = '#c27a3e'; c.lineWidth = 6; c.stroke(); const a = t * 0.0006; c.strokeStyle = '#2a1f35'; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(a) * 12, -Math.cos(a) * 12); c.moveTo(0, 0); c.lineTo(Math.sin(a * 12) * 20, -Math.cos(a * 12) * 20); c.stroke(); });
  wd('picture', 'え', (c) => { G2.rr(c, -36, -28, 72, 56, 6); G2.fillO(c, '#f5c242', 3); G2.rr(c, -28, -20, 56, 40, 3); c.fillStyle = '#bfe6ff'; c.fill(); G2.circ(c, 14, -8, 7); c.fillStyle = '#ffd23f'; c.fill(); c.fillStyle = '#7bd36a'; c.beginPath(); c.moveTo(-28, 20); c.lineTo(-8, -4); c.lineTo(10, 20); c.closePath(); c.fill(); });
  wd('heartsign', 'ハートの かざり', (c, t) => { c.save(); c.rotate(Math.sin(t * 0.002) * 0.08); c.strokeStyle = '#c27a3e'; c.lineWidth = 2; c.beginPath(); c.moveTo(-14, -30); c.lineTo(0, -44); c.lineTo(14, -30); c.stroke(); G2.heart(c, 0, -2, 30); G2.fillO(c, '#ff6f91', 3); c.fillStyle = 'rgba(255,255,255,.7)'; G2.ell(c, -10, -14, 6, 3, -0.6); c.fill(); c.restore(); });
  wd('shelf', 'かべの たな', (c) => { G2.rr(c, -46, 10, 92, 10, 4); G2.fillO(c, '#c27a3e', 2.5); G2.rr(c, -36, -16, 18, 26, 4); G2.fillO(c, '#ff8fb1', 2); G2.circ(c, 4, -2, 12); G2.fillO(c, '#7bd36a', 2); G2.rr(c, 22, -22, 14, 32, 3); G2.fillO(c, '#58b9f0', 2); });
  wd('garland', 'ガーランド', (c) => { c.strokeStyle = '#c9a0a0'; c.lineWidth = 2; c.beginPath(); c.moveTo(-70, -16); c.quadraticCurveTo(0, 10, 70, -16); c.stroke(); for (let i = 0; i < 6; i++) { const x = -58 + i * 23, y = -10 + Math.sin((i / 5) * Math.PI) * 12; c.beginPath(); c.moveTo(x - 9, y); c.lineTo(x + 9, y); c.lineTo(x, y + 20); c.closePath(); c.fillStyle = ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a', '#9b8cff', '#ff9a3d'][i]; c.fill(); } });
  H.WD_LIST = Object.keys(WD);

  /* ================= へやの パーツ ================= */
  const FRAME = { princess: '#ffc4d6', candy: '#e3a75a', space: '#d9c9ff', green: '#bfeccf', kids: '#ffd6e2', bath: '#cfe9ff' };
  const frameOf = (k) => ({ id: 'f', col: FRAME[k] || '#fff1d6', pat: k === 'candy' ? 'chip' : null });
  H.SIZES = { S: 3, M: 5, L: 7 };
  H.ROOM_PIECES = [];
  H.ROOM_LIST.forEach((k) => H.ROOM_PIECES.push([k, 'M']));
  [['kids', 'S'], ['bath', 'S'], ['library', 'S'], ['living', 'L'], ['princess', 'L'], ['play', 'L']].forEach((p) => H.ROOM_PIECES.push(p));
  H.SET_LIST = H.ROOM_LIST.slice();

  /* ================= じょうたい ================= */
  const S = () => H.state;
  H.fresh = () => {
    const s = { pieces: [], nid: 1 };
    const add = (o) => { o.id = s.nid++; s.pieces.push(o); return o; };
    const r = add({ t: 'room', k: 'living', x: X0, y: GR - RH, w: 5 });
    add({ t: 'roof', k: 'red', on: r.id, deco: { chimney: true } });
    add({ t: 'win', k: 'cross', on: r.id, dx: 200 });
    add({ t: 'door', k: 'wood', on: r.id, dx: 48 });
    return s;
  };
  H.add = (o) => { o.id = S().nid++; S().pieces.push(o); return o; };
  H.byId = (id) => S().pieces.find((p) => p.id === id);
  H.rooms = () => S().pieces.filter((p) => p.t === 'room');
  H.kids = (id) => S().pieces.filter((p) => p.on === id);
  H.count = () => H.rooms().length;
  const posOf = (r) => (r.drag ? { x: r.drag.x, y: r.drag.y } : { x: r.x * T, y: r.y * T });
  H.rectOf = (r) => { const p = posOf(r); return { x: p.x, y: p.y, w: r.w * T, h: RH * T }; };
  H.inside = (r) => { const p = posOf(r); return { x: p.x, y: p.y + T, w: r.w * T, h: (RH - 1) * T }; };
  H.floorOf = (r) => (r.y + RH) * T;

  /* マスの うまり（へや） */
  const occ = (except) => { const o = new Set(); for (const r of H.rooms()) if (r.id !== except) for (let y = r.y; y < r.y + RH; y++) for (let x = r.x; x < r.x + r.w; x++) o.add(x + ',' + y); return o; };
  const overlaps = (o, x, y, w) => { for (let yy = y; yy < y + RH; yy++) for (let xx = x; xx < x + w; xx++) if (o.has(xx + ',' + yy)) return true; return false; };
  const fall = (o, x, y, w) => {
    for (let n = 0; n < 60; n++) {
      if (y + RH >= GR) return GR - RH;
      let sup = false; for (let xx = x; xx < x + w; xx++) if (o.has(xx + ',' + (y + RH))) sup = true;
      if (sup) return y;
      y++;
    }
    return y;
  };
  H.LOT = [X0 - 18, X0 + 28];
  H.landing = (x, y, w, except) => {
    x = PT.clamp(x, H.LOT[0], H.LOT[1] - w); y = Math.min(y, GR - RH);
    const o = occ(except);
    let n = 0; while (overlaps(o, x, y, w) && n++ < 40) y--;
    return { x, y: fall(o, x, y, w) };
  };
  /* なかに いる もの */
  H.entsIn = (r) => { const R2 = { x: r.x * T, y: r.y * T, w: r.w * T }; return E.ents.filter((e) => !e.held && e.x >= R2.x - 4 && e.x <= R2.x + R2.w + 4 && e.y > R2.y + T && e.y <= R2.y + RH * T + 4); };
  /* うえの へやを おとす・やねを うえに うつす */
  H.settle = () => {
    for (let loop = 0; loop < 8; loop++) {
      let moved = false;
      const rs = H.rooms().slice().sort((a, b) => b.y - a.y);
      for (const r of rs) {
        const o = occ(r.id); const ny = fall(o, r.x, r.y, r.w);
        if (ny !== r.y) { const ins = H.entsIn(r); const dy = (ny - r.y) * T; ins.forEach((e) => { e.y += dy; }); r.y = ny; moved = true; }
      }
      if (!moved) break;
    }
    // やね
    for (const rf of S().pieces.filter((p) => p.t === 'roof')) {
      let r = H.byId(rf.on); if (!r) { S().pieces = S().pieces.filter((p) => p !== rf); continue; }
      for (let n = 0; n < 10; n++) {
        const cx = r.x + r.w / 2;
        const up = H.rooms().find((o) => o.y + RH === r.y && o.x <= cx && cx <= o.x + o.w);
        if (!up) break; r = up;
      }
      if (r.id !== rf.on) { const other = S().pieces.find((p) => p.t === 'roof' && p.on === r.id && p !== rf); if (other) S().pieces = S().pieces.filter((p) => p !== rf); else rf.on = r.id; }
    }
  };
  /* マス目（あしば） */
  H.rebuild = () => {
    const g = E.grid; g.fill(0);
    const slab = PT.BLOCK.slab.code, cols = PT.COLS, rows = PT.ROWS;
    for (let y = GR; y < rows; y++) for (let x = 0; x < cols; x++) g[y * cols + x] = slab;
    for (const r of H.rooms()) for (let x = r.x; x < r.x + r.w; x++) g[r.y * cols + x] = slab;
    E.dirty = true;
  };
  /* ゆびの したの パーツ */
  H.roomAt = (wx, wy) => H.rooms().find((r) => { const q = H.rectOf(r); return wx >= q.x && wx <= q.x + q.w && wy >= q.y && wy <= q.y + q.h; }) || null;
  H.topRoomNear = (wx, wy) => {
    let best = null;
    for (const r of H.rooms()) { const q = H.rectOf(r); if (wx < q.x - 20 || wx > q.x + q.w + 20) continue; const d = wy < q.y ? q.y - wy : wy > q.y + q.h ? (wy - q.y - q.h) * 3 : 0; if (d < 420 && (!best || d < best.d || (d === best.d && q.y < best.q.y))) best = { r, d, q }; }
    if (!best) return null;
    let r = best.r;
    for (let n = 0; n < 10; n++) { const cx = r.x + r.w / 2; const up = H.rooms().find((o) => o.y + RH === r.y && o.x <= cx && cx <= o.x + o.w); if (!up) break; r = up; }
    return r;
  };
  const roofGeom = (rf) => { const r = H.byId(rf.on); if (!r) return null; const q = H.rectOf(r); const x0 = q.x - 26, x1 = q.x + q.w + 26; return { x0, x1, y: q.y + 8, h: Math.min(250, 120 + (x1 - x0) * 0.13) }; };
  const attPos = (p) => {
    if (p.drag) return { x: p.drag.x, y: p.drag.y };
    const r = H.byId(p.on); if (!r) return null; const q = H.inside(r);
    const dx = PT.clamp(p.dx, 34, q.w - 34);
    if (p.t === 'door') return { x: q.x + dx, y: q.y + q.h };
    if (p.t === 'win') return { x: q.x + dx, y: q.y + 70 };
    return { x: q.x + dx, y: q.y + 52 };
  };
  H.attPos = attPos;
  H.hitPiece = (wx, wy) => {
    for (const p of S().pieces) {
      if (p.t !== 'win' && p.t !== 'door' && p.t !== 'wd') continue;
      const a = attPos(p); if (!a) continue;
      if (p.t === 'door' ? (Math.abs(wx - a.x) < 30 && wy < a.y && wy > a.y - 110) : Math.hypot(wx - a.x, wy - a.y) < 46) return p;
    }
    for (const p of S().pieces) { if (p.t !== 'roof') continue; const g = roofGeom(p); if (g && wx > g.x0 && wx < g.x1 && wy < g.y && wy > g.y - g.h) return p; }
    return H.roomAt(wx, wy);
  };

  /* ================= えがく ================= */
  const drawFloor = (c, x, y, w, fid) => {
    const [col, kind] = FL[fid] || FL.wood;
    c.fillStyle = col; c.fillRect(x, y, w, 16);
    if (kind === 'planks') { c.strokeStyle = PT.shade(col, -0.25); c.lineWidth = 2; for (let xx = x + 40; xx < x + w; xx += 64) { c.beginPath(); c.moveTo(xx, y); c.lineTo(xx, y + 16); c.stroke(); } }
    if (kind === 'check') { c.fillStyle = PT.shade(col === '#ffffff' ? '#ff9fbd' : col, -0.1); for (let xx = x, i = 0; xx < x + w; xx += 16, i++) if (i % 2) c.fillRect(xx, y, 16, 8); else c.fillRect(xx, y + 8, 16, 8); }
    if (kind === 'mat') { ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a'].forEach((cc, i) => { c.fillStyle = cc; for (let xx = x + i * 40; xx < x + w; xx += 160) c.fillRect(xx, y, 40, 16); }); }
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x, y, w, 3);
  };
  const lamp = (c, x, y) => {
    c.strokeStyle = '#8a7a6a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 14); c.stroke();
    c.beginPath(); c.moveTo(x - 20, y + 32); c.quadraticCurveTo(x, y + 4, x + 20, y + 32); c.closePath(); G2._bb = { x0: x - 20, y0: y + 10, x1: x + 20, y1: y + 32 }; G2.fillO(c, '#ffd76a', 2.5);
    G2.circ(c, x, y + 34, 6); c.fillStyle = E.nightK > 0.3 ? '#fff6c8' : '#fff1b0'; c.fill();
  };
  const popScale = (id) => { const a0 = H.anim.get(id); if (a0 === undefined) return 1; const k = (E.t - a0) / 380; if (k >= 1) { H.anim.delete(id); return 1; } return PT.easeBack(Math.max(0.02, k)); };
  H.drawRoom = (c, r, t) => {
    const q = H.rectOf(r), I = H.inside(r), fr = frameOf(r.k), rm = R[r.k];
    const sc = popScale(r.id);
    c.save();
    if (sc !== 1) { c.translate(q.x + q.w / 2, q.y + q.h); c.scale(sc, sc); c.translate(-(q.x + q.w / 2), -(q.y + q.h)); }
    if (r.drag) c.globalAlpha = 0.85;
    clipR(c, I); rm.wall(c, I);
    c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(I.x, I.y + I.h - 30, I.w, 4); c.fillStyle = 'rgba(120,80,60,.12)'; c.fillRect(I.x, I.y + I.h - 26, I.w, 26);
    if (r.k === 'library') { const cols = ['#ff6f91', '#58b9f0', '#ffd23f', '#7bd36a', '#9b8cff']; for (let bx = I.x + 20; bx < I.x + I.w - 70; bx += 140) { c.fillStyle = '#b97a42'; c.fillRect(bx, I.y + 14, 60, 56); for (let i = 0; i < 6; i++) { c.fillStyle = cols[i % 5]; c.fillRect(bx + 4 + i * 9, I.y + 20 + (i % 2) * 4, 7, 20 - (i % 2) * 4); c.fillRect(bx + 4 + i * 9, I.y + 46 + (i % 3) * 2, 7, 20 - (i % 3) * 2); } } }
    const g = c.createLinearGradient(I.x, 0, I.x + 22, 0); g.addColorStop(0, 'rgba(40,30,80,.18)'); g.addColorStop(1, 'rgba(40,30,80,0)'); c.fillStyle = g; c.fillRect(I.x, I.y, 22, I.h);
    const g2 = c.createLinearGradient(0, I.y, 0, I.y + 18); g2.addColorStop(0, 'rgba(40,30,80,.2)'); g2.addColorStop(1, 'rgba(40,30,80,0)'); c.fillStyle = g2; c.fillRect(I.x, I.y, I.w, 18);
    c.restore(); c.restore();
    c.save(); if (r.drag) c.globalAlpha = 0.85;
    if (sc !== 1) { c.translate(q.x + q.w / 2, q.y + q.h); c.scale(sc, sc); c.translate(-(q.x + q.w / 2), -(q.y + q.h)); }
    lamp(c, I.x + I.w / 2, I.y);
    wallFill(c, q.x - 8, q.y, q.w + 16, T, fr); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(q.x - 4, q.y + T - 8, q.w + 8, 3);
    wallFill(c, q.x - 12, q.y, 24, q.h + 4, fr); wallFill(c, q.x + q.w - 12, q.y, 24, q.h + 4, fr);
    drawFloor(c, I.x + 10, I.y + I.h, I.w - 20, rm.floor);
    if (!r.drag && r.y + RH === GR) { G2.rr(c, q.x - 12, q.y + q.h + 14, q.w + 24, 18, 6); G2.fillO(c, PT.shade(fr.col, -0.15), 3); }
    c.restore();
  };
  const drawAtt = (c, p, t) => {
    const a = attPos(p); if (!a) return;
    const sc = popScale(p.id);
    c.save(); c.translate(a.x, a.y); c.scale(sc, sc); if (p.drag) c.globalAlpha = 0.9;
    if (p.t === 'win') { c.scale(0.78, 0.78); WINS[p.k].draw(c, t); }
    else if (p.t === 'door') { c.scale(0.9, 0.9); DOORS[p.k].draw(c, t); }
    else WD[p.k].draw(c, t);
    c.restore();
  };
  const drawRoofDeco = (c, g, deco, t) => {
    const { x0, x1, y, h } = g, cx = (x0 + x1) / 2;
    if (deco.lights) { const n = Math.max(4, Math.floor((x1 - x0) / 34)); for (let j = 0; j <= n; j++) { const fx = x0 + j * (x1 - x0) / n, fy = y + 6 + Math.sin((j / n) * Math.PI * 4) * 5; const on = (Math.floor(t / 400) + j) % 3 !== 0; G2.circ(c, fx, fy, 6); c.fillStyle = on ? ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a'][j % 4] : 'rgba(255,255,255,.6)'; c.fill(); } }
    if (deco.flag) { const fx = x1 - 46; c.strokeStyle = '#6a5a8a'; c.lineWidth = 4; c.beginPath(); c.moveTo(fx, y - 20); c.lineTo(fx, y - 100); c.stroke(); const wv = Math.sin(t * 0.006) * 5; c.beginPath(); c.moveTo(fx, y - 100); c.quadraticCurveTo(fx + 24, y - 96 + wv, fx + 44, y - 86); c.lineTo(fx, y - 70); c.closePath(); c.fillStyle = '#58b9f0'; c.fill(); G2.star(c, fx + 15, y - 86, 7, 3); c.fillStyle = '#fff'; c.fill(); }
    if (deco.startop) { const tw = 1 + Math.sin(t * 0.004) * 0.08; c.save(); c.translate(cx, y - h - 28); c.scale(tw, tw); G2.star(c, 0, 0, 26, 12); G2.fillO(c, '#ffe066', 3); c.restore(); }
  };
  const drawChimney = (c, g, t) => { const cx = g.x0 + (g.x1 - g.x0) * 0.26, y = g.y, h = g.h; G2.rr(c, cx - 16, y - h * 0.72, 32, h * 0.58, 4); G2.fillO(c, '#c9645a', 3); G2.rr(c, cx - 22, y - h * 0.77, 44, 13, 4); G2.fillO(c, '#a8524a', 3); for (let j = 0; j < 3; j++) { const kk = ((t * 0.0004 + j / 3) % 1); G2.circ(c, cx + kk * 28, y - h * 0.83 - kk * 56, 9 + kk * 11); c.fillStyle = `rgba(255,255,255,${0.7 * (1 - kk)})`; c.fill(); } };
  H.drawRoofPiece = (c, rf, t, g) => {
    g = g || roofGeom(rf); if (!g) return;
    const sc = popScale(rf.id);
    if (rf.deco && rf.deco.chimney) drawChimney(c, g, t);
    c.save(); c.translate((g.x0 + g.x1) / 2, g.y); c.scale(sc, sc); c.translate(-(g.x0 + g.x1) / 2, -g.y); if (rf.drag) c.globalAlpha = 0.9;
    ROOFS[rf.k].draw(c, g.x0, g.x1, g.y, g.h, t);
    c.restore();
    drawRoofDeco(c, g, rf.deco || {}, t);
  };
  H.drawHouse = (c, t) => {
    const ps = S().pieces;
    const rooms = ps.filter((p) => p.t === 'room').sort((a, b) => (a.drag ? 1 : 0) - (b.drag ? 1 : 0));
    for (const r of rooms) H.drawRoom(c, r, t);
    for (const p of ps) if ((p.t === 'win' || p.t === 'wd') && !p.drag) drawAtt(c, p, t);
    for (const p of ps) if (p.t === 'door' && !p.drag) drawAtt(c, p, t);
    for (const p of ps) if (p.t === 'roof' && !p.drag) H.drawRoofPiece(c, p, t);
  };
  /* うごかしている パーツと おちる ばしょ */
  H.drawDrag = (c, t) => {
    const pv = H.preview;
    if (pv) {
      c.save(); c.setLineDash([16, 10]); c.lineWidth = 6; c.strokeStyle = '#ff9a3d'; c.fillStyle = 'rgba(255,190,110,.18)';
      if (pv.t === 'room') { G2.rr(c, pv.x * T, pv.y * T, pv.w * T, RH * T, 12); c.fill(); c.stroke(); }
      if (pv.t === 'target' && pv.room) { const q = H.rectOf(pv.room); G2.rr(c, q.x - 6, q.y - 6, q.w + 12, q.h + 12, 16); c.fill(); c.stroke(); }
      if (pv.t === 'roof' && pv.room) { const q = H.rectOf(pv.room); c.beginPath(); c.moveTo(q.x - 26, q.y + 8); c.lineTo(q.x + q.w / 2, q.y - 140); c.lineTo(q.x + q.w + 26, q.y + 8); c.closePath(); c.fill(); c.stroke(); }
      c.restore();
    }
    for (const p of S().pieces) if (p.drag) {
      if (p.t === 'roof') { const w = (H.byId(p.on) ? H.byId(p.on).w : 5) * T + 52; H.drawRoofPiece(c, p, t, { x0: p.drag.x - w / 2, x1: p.drag.x + w / 2, y: p.drag.y + 60, h: Math.min(250, 120 + w * 0.13) }); }
      else if (p.t !== 'room') drawAtt(c, p, t);
    }
  };
  /* にわ */
  const YARD = { meadow: ['#7bc96a', '#b9844f'], beach: ['#f3d58f', '#e0b86a'], snow: ['#ffffff', '#c9dcf2'], candy: ['#ffd1e3', '#e3a75a'], sky: ['#ffffff', '#dfeaff'] };
  H.drawYard = (c) => {
    const [top, soil] = YARD[H.lot] || YARD.meadow;
    const y = GR * T, x0 = (X0 - 40) * T, x1 = (X0 + 50) * T;
    c.fillStyle = soil; c.fillRect(x0, y, x1 - x0, 8 * T);
    c.fillStyle = top; c.fillRect(x0, y - 4, x1 - x0, 30);
    c.fillStyle = PT.shade(top, -0.1); for (let x = x0; x < x1; x += 22) { c.beginPath(); c.moveTo(x, y + 26); c.quadraticCurveTo(x + 11, y + 40, x + 22, y + 26); c.fill(); }
    const r = PT.seeded(5); c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 120; i++) { G2.circ(c, x0 + r() * (x1 - x0), y + 40 + r() * 400, 2 + r() * 3); c.fill(); }
  };
  H.holes = () => { const out = []; for (const r of H.rooms()) { const I = H.inside(r); out.push([I.x + I.w / 2, I.y + I.h / 2, Math.max(200, I.w * 0.7)]); } for (const p of S().pieces) if (p.t === 'roof' && p.deco && p.deco.lights) { const g = roofGeom(p); if (g) out.push([(g.x0 + g.x1) / 2, g.y, 180]); } return out; };

  /* ================= アイコン ================= */
  const mk = (size) => { const cv = document.createElement('canvas'); const dpr = Math.min(3, Math.max(2, window.devicePixelRatio || 1)); cv.width = cv.height = Math.round(size * dpr); const c = cv.getContext('2d'); c.scale(dpr, dpr); return [cv, c]; };
  H.icon = (kind, id, size = 96, extra) => {
    const [cv, c] = mk(size);
    const keep = H.state; H.state = { pieces: [], nid: 1 };
    try {
      if (kind === 'room') {
        const w = H.SIZES[extra || 'M'], r = { id: -1, t: 'room', k: id, x: 0, y: 0, w };
        const W = w * T + 30, k = size / Math.max(W, RH * T + 40); c.translate(size / 2 - (w * T / 2) * k, size / 2 - (RH * T / 2 + 8) * k); c.scale(k, k);
        H.drawRoom(c, r, 300);
      } else if (kind === 'set') {
        const k = size / 330; c.translate(size * 0.02, size * 0.1); c.scale(k, k);
        G2.rr(c, 0, 150, 320, 18, 8); c.fillStyle = (FL[R[id].floor] || FL.wood)[0]; c.fill();
        R[id].props.forEach(([it, fx]) => { const d = PT.ITEMS[it]; if (!d) return; c.save(); c.translate(10 + fx * 300, 156); c.scale(0.8, 0.8); try { d.draw(c, 300, {}); } catch (e) { /* */ } c.restore(); });
      } else if (kind === 'roof') {
        const k = size / 420; c.translate(size / 2, size * 0.86); c.scale(k, k);
        wallFill(c, -150, -10, 300, 120, WALLS.cream); ROOFS[id].draw(c, -180, 180, 0, 170, 300);
      } else if (kind === 'win') { const k = size / 150; c.translate(size / 2, size / 2); c.scale(k, k); G2.rr(c, -72, -66, 144, 132, 18); c.fillStyle = '#fff4e4'; c.fill(); WINS[id].draw(c, 300); }
      else if (kind === 'door') { const k = size / 150; c.translate(size / 2, size * 0.9); c.scale(k, k); DOORS[id].draw(c, 300); }
      else if (kind === 'wd') { const k = size / 130; c.translate(size / 2, size / 2); c.scale(k, k); WD[id].draw(c, 300); }
      else if (kind === 'rdeco') {
        const k = size / 120; c.translate(size / 2, size * 0.7); c.scale(k, k);
        if (id === 'chimney') { G2.rr(c, -16, -50, 32, 60, 4); G2.fillO(c, '#c9645a', 3); G2.rr(c, -22, -56, 44, 12, 4); G2.fillO(c, '#a8524a', 3); for (let j = 0; j < 3; j++) { G2.circ(c, 8 + j * 10, -66 - j * 12, 8 + j * 3); c.fillStyle = 'rgba(200,210,230,.9)'; c.fill(); } }
        if (id === 'flag') { c.strokeStyle = '#6a5a8a'; c.lineWidth = 4; c.beginPath(); c.moveTo(-20, 20); c.lineTo(-20, -70); c.stroke(); c.beginPath(); c.moveTo(-20, -70); c.quadraticCurveTo(10, -66, 34, -54); c.lineTo(-20, -36); c.closePath(); c.fillStyle = '#58b9f0'; c.fill(); }
        if (id === 'lights') { for (let j = 0; j < 7; j++) { G2.circ(c, -48 + j * 16, -20 + Math.sin(j * 1.3) * 8, 7); c.fillStyle = ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a'][j % 4]; c.fill(); } }
        if (id === 'startop') { G2.star(c, 0, -24, 36, 16); G2.fillO(c, '#ffe066', 3); }
      }
    } finally { H.state = keep; }
    return cv;
  };
})();
