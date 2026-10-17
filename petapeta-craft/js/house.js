/* おうちづくり：へや・やね・かべ・まど・ドア・かざりを えらぶだけで くみたてる ドールハウス */
'use strict';
(() => {
  const G2 = PT.G, T = PT.TILE, E = PT.E;
  const GR = 26, NC = 3, NF = 4, X0 = 40, RW = 5, PITCH = 5, RH = 4;
  const H = (PT.house = { GR, NC, NF, X0, RW, state: null, lot: null, anim: new Map(), roofT: 0 });

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

  /* ================= かざり ================= */
  H.DECO = { chimney: 'えんとつ', flag: 'はた', lights: 'イルミネーション', startop: 'おほしさま', planter: 'はなの プランター', sign: 'ハートの かんばん' };
  H.DECO_LIST = Object.keys(H.DECO);

  /* ================= じょうたい ================= */
  const fresh = () => ({ rooms: Array.from({ length: NF }, () => Array(NC).fill(null)), roof: 'red', wall: 'cream', win: 'cross', door: 'wood', deco: { chimney: true, planter: true } });
  H.fresh = () => { const s = fresh(); s.rooms[0][1] = 'living'; return s; };
  H.slotRect = (f, k) => ({ x: (X0 + k * RW) * T, y: (GR - f * PITCH - RH) * T, w: RW * T, h: RH * T });
  H.floorY = (f) => (GR - f * PITCH) * T;
  const S = () => H.state;
  H.canAdd = (f, k) => !S().rooms[f][k] && (f === 0 || !!S().rooms[f - 1][k]);
  H.count = () => S().rooms.flat().filter(Boolean).length;
  H.topOf = (k) => { let t = -1; for (let f = 0; f < NF; f++) if (S().rooms[f][k]) t = f; return t; };
  H.slotAt = (wx, wy) => { for (let f = 0; f < NF; f++) for (let k = 0; k < NC; k++) { const r = H.slotRect(f, k); if (wx >= r.x && wx < r.x + r.w && wy >= r.y - T && wy < r.y + r.h + 10) return [f, k]; } return null; };
  H.roomAt = (wx, wy) => { const s = H.slotAt(wx, wy); return s && S().rooms[s[0]][s[1]] ? s : null; };
  H.nextSlot = () => {
    // まずは よこに、そのあと うえに（まんなかから）
    for (let f = 0; f < NF; f++) for (const k of [1, 0, 2]) if (H.canAdd(f, k)) return [f, k];
    return null;
  };

  /* マス目（あしば）を つくりなおす */
  H.rebuild = () => {
    const g = E.grid; g.fill(0);
    const slab = PT.BLOCK.slab.code, cols = PT.COLS, rows = PT.ROWS;
    for (let y = GR; y < rows; y++) for (let x = 0; x < cols; x++) g[y * cols + x] = slab;
    for (let f = 0; f < NF; f++) for (let k = 0; k < NC; k++) if (S().rooms[f][k]) { const y = GR - f * PITCH - RH - 1; for (let x = X0 + k * RW; x < X0 + (k + 1) * RW; x++) g[y * cols + x] = slab; }
    E.dirty = true; E.pushOut();
  };

  /* ================= えがく ================= */
  const drawFloor = (c, x, y, w, fid) => {
    const [col, kind] = FL[fid] || FL.wood;
    c.fillStyle = col; c.fillRect(x, y, w, 18);
    if (kind === 'planks') { c.strokeStyle = PT.shade(col, -0.25); c.lineWidth = 2; for (let xx = x + 40; xx < x + w; xx += 64) { c.beginPath(); c.moveTo(xx, y); c.lineTo(xx, y + 18); c.stroke(); } }
    if (kind === 'check') { c.fillStyle = PT.shade(col === '#ffffff' ? '#ff9fbd' : col, -0.1); for (let xx = x, i = 0; xx < x + w; xx += 18, i++) if (i % 2) c.fillRect(xx, y, 18, 9); else c.fillRect(xx, y + 9, 18, 9); }
    if (kind === 'mat') { ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a'].forEach((cc, i) => { c.fillStyle = cc; for (let xx = x + i * 40; xx < x + w; xx += 160) c.fillRect(xx, y, 40, 18); }); }
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x, y, w, 3);
  };
  const lamp = (c, x, y, t) => {
    c.strokeStyle = '#8a7a6a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 26); c.stroke();
    c.beginPath(); c.moveTo(x - 22, y + 44); c.quadraticCurveTo(x, y + 14, x + 22, y + 44); c.closePath(); G2._bb = { x0: x - 22, y0: y + 20, x1: x + 22, y1: y + 44 }; G2.fillO(c, '#ffd76a', 2.5);
    G2.circ(c, x, y + 46, 7); c.fillStyle = E.nightK > 0.3 ? '#fff6c8' : '#fff1b0'; c.fill();
  };
  const drawRoomInside = (c, f, k, rid, t) => {
    const rm = R[rid], r = H.slotRect(f, k), wl = WALLS[S().wall];
    const a0 = H.anim.get(f + ':' + k); let sc = 1;
    if (a0 !== undefined) { const kk = (E.t - a0) / 420; if (kk >= 1) H.anim.delete(f + ':' + k); else sc = PT.easeBack(Math.max(0.02, kk)); }
    c.save();
    if (sc !== 1) { c.translate(r.x + r.w / 2, r.y + r.h); c.scale(1, sc); c.translate(-(r.x + r.w / 2), -(r.y + r.h)); }
    clipR(c, r); rm.wall(c, r);
    // こしかべ
    c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(r.x, r.y + r.h - 34, r.w, 4); c.fillStyle = 'rgba(120,80,60,.12)'; c.fillRect(r.x, r.y + r.h - 30, r.w, 30);
    if (rid === 'library') { for (const bx of [r.x + 26, r.x + r.w - 96]) { c.fillStyle = '#b97a42'; c.fillRect(bx, r.y + 18, 70, 70); const cols = ['#ff6f91', '#58b9f0', '#ffd23f', '#7bd36a', '#9b8cff']; for (let i = 0; i < 7; i++) { c.fillStyle = cols[i % 5]; c.fillRect(bx + 5 + i * 9, r.y + 26 + (i % 2) * 4, 7, 26 - (i % 2) * 4); c.fillRect(bx + 5 + i * 9, r.y + 58 + (i % 3) * 3, 7, 24 - (i % 3) * 3); } } }
    // まど
    if (rid !== 'green' && rid !== 'space') { c.save(); c.translate(r.x + r.w / 2 + (rid === 'library' ? 0 : 0), r.y + 74); const ws = 0.95; c.scale(ws, ws); WINS[S().win].draw(c, t); c.restore(); }
    // かげ（へやの すみ）
    const g = c.createLinearGradient(r.x, 0, r.x + 24, 0); g.addColorStop(0, 'rgba(40,30,80,.18)'); g.addColorStop(1, 'rgba(40,30,80,0)'); c.fillStyle = g; c.fillRect(r.x, r.y, 24, r.h);
    const g2 = c.createLinearGradient(0, r.y, 0, r.y + 20); g2.addColorStop(0, 'rgba(40,30,80,.2)'); g2.addColorStop(1, 'rgba(40,30,80,0)'); c.fillStyle = g2; c.fillRect(r.x, r.y, r.w, 20);
    c.restore();
    lamp(c, r.x + r.w / 2 + (rid === 'library' ? 0 : 0), r.y, t);
    c.restore();
  };
  const beam = (c, x, y, w, wl) => { wallFill(c, x - 10, y, w + 20, T, wl); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x - 6, y + T - 8, w + 12, 3); };

  H.drawHouse = (c, t) => {
    const s = S(), wl = WALLS[s.wall];
    // へやの なか
    for (let f = 0; f < NF; f++) for (let k = 0; k < NC; k++) if (s.rooms[f][k]) drawRoomInside(c, f, k, s.rooms[f][k], t);
    // ゆか と てんじょう
    for (let f = 0; f < NF; f++) for (let k = 0; k < NC; k++) {
      const rid = s.rooms[f][k]; if (!rid) continue;
      const r = H.slotRect(f, k);
      beam(c, r.x, r.y - T, r.w, wl);
      drawFloor(c, r.x, r.y + r.h, r.w, R[rid].floor);
      if (f === 0) { G2.rr(c, r.x - 10, r.y + r.h + 16, r.w + 20, 22, 6); G2.fillO(c, PT.shade(wl.col, -0.15), 3); }
    }
    // かべ（はしら）
    for (let f = 0; f < NF; f++) for (let k = 0; k <= NC; k++) {
      const L = k > 0 && s.rooms[f][k - 1], Rr = k < NC && s.rooms[f][k];
      if (!L && !Rr) continue;
      const r = H.slotRect(f, Math.min(k, NC - 1)); const x = (X0 + k * RW) * T, y = r.y - 4, h = r.h + 8;
      if (L && Rr) { wallFill(c, x - 9, y, 18, h * 0.42, wl); c.strokeStyle = PT.shade(wl.col, -0.3); c.lineWidth = 3; c.beginPath(); c.moveTo(x - 9, y + h * 0.42); c.quadraticCurveTo(x, y + h * 0.36, x + 9, y + h * 0.42); c.stroke(); }
      else wallFill(c, x - 14, y - 4, 28, h + 8, wl);
    }
    // げんかん
    const fl = [0, 1, 2].find((k) => s.rooms[0][k]);
    if (fl !== undefined) {
      const x = (X0 + fl * RW) * T, gy = H.floorY(0);
      G2.rr(c, x - 64, gy - 140, 70, 12, 5); G2.fillO(c, PT.shade(wl.col, -0.2), 3);
      c.save(); c.translate(x - 30, gy); DOORS[s.door].draw(c, t); c.restore();
      G2.rr(c, x - 74, gy - 4, 84, 14, 5); G2.fillO(c, '#c9ccd8', 2.5);
      if (s.deco.sign) { c.save(); c.translate(x - 30, gy - 168); c.rotate(Math.sin(t * 0.002) * 0.06); G2.rr(c, -34, -18, 68, 36, 12); G2.fillO(c, '#fff8e8', 3); G2.heart(c, 0, 2, 12); c.fillStyle = '#ff5d78'; c.fill(); c.restore(); }
      if (s.deco.planter) for (const px of [x - 100, (X0 + (([2, 1, 0].find((k) => s.rooms[0][k]) ?? fl) + 1) * RW) * T + 40]) { G2.rr(c, px - 30, gy - 30, 60, 30, 6); G2.fillO(c, '#c27a3e', 3); for (let i = 0; i < 4; i++) { G2.circ(c, px - 20 + i * 13, gy - 38 - (i % 2) * 6, 9); G2.fillO(c, ['#ff6f91', '#ffd23f', '#9b8cff', '#ff8a65'][i], 2); } }
    }
    // やね
    let k = 0;
    H.roofSpans = [];
    while (k < NC) {
      const top = H.topOf(k); if (top < 0) { k++; continue; }
      let k2 = k; while (k2 + 1 < NC && H.topOf(k2 + 1) === top) k2++;
      const x0 = (X0 + k * RW) * T - 30, x1 = (X0 + (k2 + 1) * RW) * T + 30, y = (GR - top * PITCH - RH - 1) * T + 8;
      const h = Math.min(250, 130 + (x1 - x0) * 0.12);
      H.roofSpans.push([x0, x1, y, h]);
      k = k2 + 1;
    }
    const pop = H.roofT && E.t - H.roofT < 400 ? PT.easeBack((E.t - H.roofT) / 400) : 1;
    H.roofSpans.forEach(([x0, x1, y, h], i) => {
      if (i === 0 && s.deco.chimney && s.roof !== 'castle' && s.roof !== 'leaf') { const cx = x0 + (x1 - x0) * 0.24; G2.rr(c, cx - 18, y - h * 0.75, 36, h * 0.6, 4); G2.fillO(c, '#c9645a', 3); G2.rr(c, cx - 24, y - h * 0.8, 48, 14, 4); G2.fillO(c, '#a8524a', 3); for (let j = 0; j < 3; j++) { const kk = ((t * 0.0004 + j / 3) % 1); G2.circ(c, cx + kk * 30, y - h * 0.86 - kk * 60, 10 + kk * 12); c.fillStyle = `rgba(255,255,255,${0.7 * (1 - kk)})`; c.fill(); } }
      c.save(); c.translate((x0 + x1) / 2, y); c.scale(pop, pop); c.translate(-(x0 + x1) / 2, -y);
      ROOFS[s.roof].draw(c, x0, x1, y, h, t);
      c.restore();
      const cx = (x0 + x1) / 2;
      if (i === 0 && s.deco.flag) { const fx = x1 - 50; c.strokeStyle = '#6a5a8a'; c.lineWidth = 4; c.beginPath(); c.moveTo(fx, y - 20); c.lineTo(fx, y - 110); c.stroke(); const wv = Math.sin(t * 0.006) * 5; c.beginPath(); c.moveTo(fx, y - 110); c.quadraticCurveTo(fx + 24, y - 106 + wv, fx + 46, y - 96); c.lineTo(fx, y - 80); c.closePath(); c.fillStyle = '#58b9f0'; c.fill(); G2.star(c, fx + 16, y - 96, 7, 3); c.fillStyle = '#fff'; c.fill(); }
      if (s.deco.startop && s.roof !== 'star' && s.roof !== 'candy') { const tw = 1 + Math.sin(t * 0.004) * 0.08; c.save(); c.translate(cx, y - h - 30); c.scale(tw, tw); G2.star(c, 0, 0, 28, 13); G2.fillO(c, '#ffe066', 3); c.restore(); }
      if (s.deco.lights) { const n = Math.floor((x1 - x0) / 34); for (let j = 0; j <= n; j++) { const fx = x0 + j * (x1 - x0) / n, fy = y + 8 + Math.sin((j / n) * Math.PI * 4) * 6; const on = (Math.floor(t / 400) + j) % 3 !== 0; G2.circ(c, fx, fy, 6); c.fillStyle = on ? ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a'][j % 4] : 'rgba(255,255,255,.6)'; c.fill(); } }
    });
  };
  /* あいている ばしょの めじるし */
  H.drawSlots = (c, t, strong) => {
    for (let f = 0; f < NF; f++) for (let k = 0; k < NC; k++) {
      if (!H.canAdd(f, k)) continue;
      const r = H.slotRect(f, k), p = 0.5 + 0.5 * Math.sin(t * 0.006);
      c.save(); c.globalAlpha = strong ? 0.7 + p * 0.3 : 0.35;
      if (f === 0) { G2.rr(c, r.x + 10, r.y + 10, r.w - 20, r.h - 20, 22); c.fillStyle = 'rgba(255,255,255,.45)'; c.fill(); c.setLineDash([16, 12]); c.lineWidth = 6; c.strokeStyle = '#ff9a3d'; c.stroke(); c.setLineDash([]); }
      const s2 = (strong ? 1 + p * 0.1 : 1) * Math.max(1, 0.5 / Math.max(0.1, E.cam.s)); c.translate(r.x + r.w / 2, r.y + r.h / 2 + (f ? 30 : 0)); c.scale(s2, s2);
      G2.circ(c, 0, 0, 38); c.fillStyle = '#ffffff'; c.fill();
      G2.circ(c, 0, 0, 34); c.fillStyle = '#ff9a3d'; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-15, 0); c.lineTo(15, 0); c.moveTo(0, -15); c.lineTo(0, 15); c.stroke();
      c.restore();
    }
  };
  /* にわ（じめん） */
  const YARD = { meadow: ['#7bc96a', '#b9844f'], beach: ['#f3d58f', '#e0b86a'], snow: ['#ffffff', '#c9dcf2'], candy: ['#ffd1e3', '#e3a75a'], sky: ['#ffffff', '#dfeaff'] };
  H.drawYard = (c, t) => {
    const [top, soil] = YARD[H.lot] || YARD.meadow;
    const y = GR * T, x0 = (X0 - 30) * T, x1 = (X0 + 45) * T;
    c.fillStyle = soil; c.fillRect(x0, y, x1 - x0, 8 * T);
    c.fillStyle = top; c.fillRect(x0, y - 4, x1 - x0, 30);
    c.fillStyle = PT.shade(top, -0.1); for (let x = x0; x < x1; x += 22) { c.beginPath(); c.moveTo(x, y + 26); c.quadraticCurveTo(x + 11, y + 40, x + 22, y + 26); c.fill(); }
    const r = PT.seeded(5); c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 80; i++) { G2.circ(c, x0 + r() * (x1 - x0), y + 40 + r() * 400, 2 + r() * 3); c.fill(); }
    // こみち
    const fl = [0, 1, 2].find((k) => S().rooms[0][k]); if (fl !== undefined) { const dx = (X0 + fl * RW) * T - 30; for (let i = 0; i < 5; i++) { G2.ell(c, dx - 40 - i * 70, y + 12 + (i % 2) * 6, 26, 9); c.fillStyle = '#e8e2d8'; c.fill(); c.strokeStyle = '#c9c0b0'; c.lineWidth = 2; c.stroke(); } }
  };
  H.holes = () => { const out = []; for (let f = 0; f < NF; f++) for (let k = 0; k < NC; k++) if (S().rooms[f][k]) { const r = H.slotRect(f, k); out.push([r.x + r.w / 2, r.y + r.h / 2, 260]); } if (S().deco.lights) H.roofSpans && H.roofSpans.forEach(([x0, x1, y]) => out.push([(x0 + x1) / 2, y, 200])); return out; };

  /* ================= アイコン ================= */
  const mk = (size) => { const cv = document.createElement('canvas'); const dpr = Math.min(3, Math.max(2, window.devicePixelRatio || 1)); cv.width = cv.height = Math.round(size * dpr); const c = cv.getContext('2d'); c.scale(dpr, dpr); return [cv, c]; };
  H.icon = (kind, id, size = 96) => {
    const [cv, c] = mk(size);
    const keep = H.state; H.state = H.state || H.fresh();
    try {
      if (kind === 'room') {
        const r = { x: 0, y: 0, w: 320, h: 256 }, k = size / 340; c.translate(size * 0.03, size * 0.12); c.scale(k, k);
        G2.rr(c, -6, -6, 332, 290, 18); c.fillStyle = '#ffffff'; c.fill();
        c.save(); G2.rr(c, 0, 0, 320, 274, 14); c.clip(); R[id].wall(c, r); drawFloor(c, 0, 256, 320, R[id].floor); c.fillStyle = '#fff'; c.fillRect(0, 256 + 18, 320, 20);
        R[id].props.forEach(([it, fx]) => { const d = PT.ITEMS[it]; if (!d) return; c.save(); c.translate(fx * 320, 258); c.scale(0.78, 0.78); try { d.draw(c, 300, {}); } catch (e) { /* */ } c.restore(); });
        c.restore(); G2.rr(c, 0, 0, 320, 274, 14); c.strokeStyle = '#d6e6f8'; c.lineWidth = 8; c.stroke();
      } else if (kind === 'roof') {
        const k = size / 420; c.translate(size / 2, size * 0.86); c.scale(k, k);
        wallFill(c, -150, -10, 300, 120, WALLS.cream); ROOFS[id].draw(c, -180, 180, 0, 170, 300);
      } else if (kind === 'wall') {
        const k = size / 120; c.scale(k, k); wallFill(c, 14, 20, 92, 86, WALLS[id]); G2.rr(c, 40, 46, 40, 34, 6); c.fillStyle = '#bfe6ff'; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 5; c.stroke();
      } else if (kind === 'win') { const k = size / 150; c.translate(size / 2, size / 2); c.scale(k, k); G2.rr(c, -72, -66, 144, 132, 18); c.fillStyle = '#fff4e4'; c.fill(); WINS[id].draw(c, 300); }
      else if (kind === 'door') { const k = size / 150; c.translate(size / 2, size * 0.9); c.scale(k, k); DOORS[id].draw(c, 300); }
      else if (kind === 'deco') {
        const k = size / 120; c.translate(size / 2, size * 0.7); c.scale(k, k);
        if (id === 'chimney') { G2.rr(c, -16, -50, 32, 60, 4); G2.fillO(c, '#c9645a', 3); G2.rr(c, -22, -56, 44, 12, 4); G2.fillO(c, '#a8524a', 3); for (let j = 0; j < 3; j++) { G2.circ(c, 8 + j * 10, -66 - j * 12, 8 + j * 3); c.fillStyle = 'rgba(200,210,230,.9)'; c.fill(); } }
        if (id === 'flag') { c.strokeStyle = '#6a5a8a'; c.lineWidth = 4; c.beginPath(); c.moveTo(-20, 20); c.lineTo(-20, -70); c.stroke(); c.beginPath(); c.moveTo(-20, -70); c.quadraticCurveTo(10, -66, 34, -54); c.lineTo(-20, -36); c.closePath(); c.fillStyle = '#58b9f0'; c.fill(); }
        if (id === 'lights') { for (let j = 0; j < 7; j++) { G2.circ(c, -48 + j * 16, -20 + Math.sin(j * 1.3) * 8, 7); c.fillStyle = ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a'][j % 4]; c.fill(); } }
        if (id === 'startop') { G2.star(c, 0, -24, 36, 16); G2.fillO(c, '#ffe066', 3); }
        if (id === 'planter') { G2.rr(c, -36, -10, 72, 30, 6); G2.fillO(c, '#c27a3e', 3); for (let i = 0; i < 5; i++) { G2.circ(c, -28 + i * 14, -18 - (i % 2) * 8, 9); G2.fillO(c, ['#ff6f91', '#ffd23f', '#9b8cff', '#ff8a65', '#ff6f91'][i], 2); } }
        if (id === 'sign') { G2.rr(c, -40, -50, 80, 46, 14); G2.fillO(c, '#fff8e8', 3); G2.heart(c, 0, -26, 14); c.fillStyle = '#ff5d78'; c.fill(); }
      }
    } finally { H.state = keep; }
    return cv;
  };
})();
