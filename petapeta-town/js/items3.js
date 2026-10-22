/* たべもの と どうぐ（追加 3）：おすし・ラーメン・けんだま・なわとび など */
'use strict';
(() => {
  const G = PT.G;
  const def = (id, o) => { PT.ITEMS[id] = Object.assign({ id, tags: [], w: 90, h: 90 }, o); };
  const F = (id, name, w, h, draw, tags = []) => def(id, { name, cat: 'food', tags: ['food'].concat(tags), w, h, food: true, draw });
  const T = (id, name, w, h, draw, tags = []) => def(id, { name, cat: 'tools', tags: ['toy'].concat(tags), w, h, draw });

  /* ---------- 描画の ちいさな ヘルパー ---------- */
  const plate = (c, w = 38, y = -6, col = '#ffffff') => { G.ell(c, 0, y, w, w * 0.22); G.fillO(c, col, 2.5); G.ell(c, 0, y - 1, w * 0.72, w * 0.13); c.fillStyle = 'rgba(160,190,220,.25)'; c.fill(); };
  const bowl = (c, w, top, bot, col) => {
    c.beginPath(); c.moveTo(-w, top); c.quadraticCurveTo(-w * 0.95, bot, 0, bot); c.quadraticCurveTo(w * 0.95, bot, w, top); c.closePath();
    G._bb = { x0: -w, y0: top, x1: w, y1: bot }; G.fillO(c, col, 3);
  };
  const steam = (c, t, x, y, n = 3) => {
    c.save(); c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 3; c.lineCap = 'round';
    for (let i = 0; i < n; i++) { const ph = (t || 0) * 0.004 + i * 2; const xx = x + (i - (n - 1) / 2) * 12; c.beginPath(); c.moveTo(xx, y); c.quadraticCurveTo(xx + Math.sin(ph) * 6, y - 10, xx, y - 18); c.quadraticCurveTo(xx - Math.sin(ph) * 6, y - 26, xx + 2, y - 32); c.stroke(); }
    c.restore();
  };
  const dot = (c, x, y, r, col) => { G.circ(c, x, y, r); c.fillStyle = col; c.fill(); };
  const shine = (c, x, y, rx, ry, a = -0.5) => { G.ell(c, x, y, rx, ry, a); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(); };

  /* ================= たべもの ================= */
  F('sushi', 'おすし', 80, 50, (c) => {
    G.rr(c, -38, -16, 76, 10, 3); G.fillO(c, '#d9a066', 2.5);
    for (const x of [-26, 26]) { G.rr(c, x - 5, -8, 10, 7, 2); G.fillO(c, '#b8804a', 2); }
    [[-17, '#ff8a5c', '#ffd0b8'], [17, '#e8384f', '#ff9aa8']].forEach(([x, fish, line]) => {
      G.rr(c, x - 15, -30, 30, 15, 7); G.fillO(c, '#ffffff', 2.5);
      G.blob(c, [x - 18, -28, x - 10, -38, x + 8, -40, x + 18, -32, x + 12, -24, x - 12, -24]); G.fillO(c, fish, 2.5);
      c.strokeStyle = line; c.lineWidth = 2; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(x + i * 7 - 3, -37); c.lineTo(x + i * 7 + 3, -27); c.stroke(); }
    });
    G.ell(c, 0, -21, 5, 3.5); c.fillStyle = '#9fd45a'; c.fill();
  }, ['japanese']);
  F('ramen', 'ラーメン', 84, 80, (c, t) => {
    bowl(c, 40, -40, 0, '#ff6f61');
    c.strokeStyle = '#ffffff'; c.lineWidth = 2.5; c.beginPath(); for (let x = -30; x <= 30; x += 10) { c.moveTo(x, -26); c.lineTo(x + 5, -21); c.lineTo(x + 10, -26); } c.stroke();
    G.ell(c, 0, -40, 40, 10); G.fillO(c, '#f6c46a', 2.5);
    c.strokeStyle = '#ffe39a'; c.lineWidth = 3; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-28, -40 + i * 3); c.bezierCurveTo(-14, -48 + i * 3, -6, -32 + i * 3, 8, -42 + i * 3); c.stroke(); }
    G.circ(c, 18, -42, 8); G.fillO(c, '#ffffff', 2); c.strokeStyle = '#ff8fab'; c.lineWidth = 2; c.beginPath(); c.arc(18, -42, 4, 0, 5); c.stroke();
    G.ell(c, -18, -44, 9, 6); G.fillO(c, '#ffffff', 2); dot(c, -18, -44, 4, '#ffb02e');
    G.rr(c, 2, -60, 10, 18, 2); G.fillO(c, '#2f5a3a', 2);
    c.strokeStyle = '#c98a4a'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(22, -76); c.lineTo(40, -38); c.moveTo(30, -78); c.lineTo(44, -40); c.stroke();
    steam(c, t, -6, -54);
  }, ['japanese', 'hot']);
  F('curry', 'カレー', 84, 70, (c, t) => {
    for (const s of [-1, 1]) { G.rr(c, s * 44 - 7, -44, 14, 8, 4); G.fillO(c, '#e0782a', 2); }
    G.rr(c, -38, -50, 76, 46, 14); G.fillO(c, '#ff9a3d', 3);
    G.rr(c, -30, -26, 60, 8, 4); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
    G.ell(c, 0, -50, 38, 9); G.fillO(c, '#b8742e', 2.5);
    dot(c, -14, -51, 5, '#ff8a2e'); dot(c, 10, -49, 5.5, '#ffe08a'); dot(c, 22, -52, 4, '#ff8a2e'); dot(c, -2, -53, 4, '#ffe08a');
    steam(c, t, 0, -62);
  }, ['spicy', 'hot']);
  F('ricebowl', 'ごはん', 64, 56, (c) => {
    bowl(c, 28, -26, 0, '#7fb6ef');
    c.strokeStyle = '#ffffff'; c.lineWidth = 2.5; c.beginPath(); c.arc(-10, -12, 5, 0, PT.TAU); c.moveTo(19, -14); c.arc(14, -14, 5, 0, PT.TAU); c.stroke();
    G.blob(c, [-28, -26, -20, -42, 0, -48, 20, -42, 28, -26]); G.fillO(c, '#ffffff', 2.5);
    c.fillStyle = 'rgba(200,210,230,.8)'; [[-12, -34], [0, -40], [10, -32], [-2, -30], [16, -38]].forEach(([x, y]) => { G.ell(c, x, y, 3, 1.6, 0.4); c.fill(); });
  }, ['japanese']);
  F('omurice', 'オムライス', 84, 50, (c) => {
    plate(c, 40, -8);
    G.blob(c, [-30, -12, -24, -30, 0, -38, 24, -30, 30, -12, 0, -10]); G.fillO(c, '#ffd84a', 3);
    shine(c, -10, -28, 9, 4);
    G.heart(c, 2, -24, 9); c.fillStyle = '#e8384f'; c.fill();
    c.fillStyle = '#58b44e'; G.ell(c, 30, -12, 6, 3, 0.4); c.fill();
  });
  F('takoyaki', 'たこやき', 84, 50, (c) => {
    c.beginPath(); c.moveTo(-40, -22); c.lineTo(40, -22); c.lineTo(30, -4); c.lineTo(-30, -4); c.closePath(); G._bb = { x0: -40, y0: -22, x1: 40, y1: -4 }; G.fillO(c, '#e8c48a', 2.5);
    [[-20, -26], [0, -28], [20, -26], [-10, -36], [10, -36]].forEach(([x, y]) => { G.circ(c, x, y, 10); G.fillO(c, '#d98a3a', 2.5); G.ell(c, x, y - 4, 8, 5); c.fillStyle = '#6b3a1a'; c.fill(); });
    c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.moveTo(-26, -34); for (let i = 0; i < 6; i++) c.lineTo(-20 + i * 9, i % 2 ? -42 : -30); c.stroke();
    c.fillStyle = '#58b44e'; [[-14, -40], [4, -42], [16, -34], [-4, -32]].forEach(([x, y]) => { c.fillRect(x, y, 2.5, 2.5); });
    c.strokeStyle = '#c9a070'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(22, -40); c.lineTo(34, -56); c.stroke();
  }, ['japanese', 'hot', 'fest']);
  F('yakisoba', 'やきそば', 84, 50, (c) => {
    plate(c, 40, -8);
    G.blob(c, [-30, -12, -24, -26, -6, -32, 16, -30, 30, -14]); G.fillO(c, '#d99a4a', 2.5);
    c.strokeStyle = '#a5642a'; c.lineWidth = 2.5; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-24, -14 - i * 4); c.bezierCurveTo(-10, -24 - i * 3, 4, -6 - i * 4, 24, -18 - i * 3); c.stroke(); }
    c.fillStyle = '#7bd36a'; G.ell(c, -10, -26, 6, 3, 0.3); c.fill(); G.ell(c, 12, -22, 5, 3, -0.3); c.fill();
    c.fillStyle = '#ff5d6c'; c.fillRect(2, -30, 4, 3); c.fillRect(-18, -20, 4, 3);
  }, ['fest']);
  F('gyoza', 'ぎょうざ', 84, 44, (c) => {
    plate(c, 40, -8);
    [-20, 0, 20].forEach((x, i) => {
      c.beginPath(); c.moveTo(x - 14, -12); c.quadraticCurveTo(x - 12, -32 - i % 2 * 2, x + 2, -32); c.quadraticCurveTo(x + 14, -30, x + 14, -12); c.closePath(); G._bb = { x0: x - 14, y0: -32, x1: x + 14, y1: -12 }; G.fillO(c, '#f5e2b8', 2.5);
      G.rr(c, x - 13, -16, 27, 5, 2); c.fillStyle = '#d9963e'; c.fill();
      c.strokeStyle = '#d8c090'; c.lineWidth = 1.6; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x + k * 5, -30); c.lineTo(x + k * 5 + 2, -25); c.stroke(); }
    });
  }, ['hot']);
  F('karaage', 'からあげ', 76, 56, (c) => {
    plate(c, 36, -8);
    [[-14, -22, 13], [12, -20, 12], [0, -36, 12]].forEach(([x, y, r]) => { G.blob(c, [x - r, y, x - r * 0.7, y - r * 0.8, x, y - r, x + r * 0.8, y - r * 0.7, x + r, y + 2, x + r * 0.5, y + r * 0.7, x - r * 0.5, y + r * 0.7]); G.fillO(c, '#d98a2e', 2.5); c.fillStyle = 'rgba(255,220,150,.6)'; G.circ(c, x - 3, y - 4, 2); c.fill(); G.circ(c, x + 4, y + 1, 1.6); c.fill(); });
    G.poly(c, [22, -12, 34, -18, 30, -6]); G.fillO(c, '#ffe24a', 2);
  });
  F('softcream', 'ソフトクリーム', 50, 100, (c) => {
    G.poly(c, [-15, -44, 15, -44, 0, -2]); G.fillO(c, '#e8b26a', 3);
    c.strokeStyle = 'rgba(160,100,40,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-9, -38); c.lineTo(5, -16); c.moveTo(9, -38); c.lineTo(-5, -16); c.stroke();
    G.ell(c, 0, -50, 20, 9); G.fillO(c, '#fffaf0', 2.5);
    G.ell(c, 0, -62, 16, 8); G.fillO(c, '#fffaf0', 2.5);
    G.ell(c, 0, -73, 11, 7); G.fillO(c, '#fffaf0', 2.5);
    c.beginPath(); c.moveTo(-6, -78); c.quadraticCurveTo(0, -96, 4, -90); c.quadraticCurveTo(8, -82, 6, -78); c.closePath(); G._bb = { x0: -6, y0: -96, x1: 8, y1: -78 }; G.fillO(c, '#fffaf0', 2.5);
  }, ['sweet', 'cold']);
  F('kakigori', 'かきごおり', 70, 86, (c) => {
    G.ell(c, 0, -4, 18, 5); G.fillO(c, '#bfe9ff', 2.5);
    G.rr(c, -4, -18, 8, 14, 3); c.fillStyle = 'rgba(190,233,255,.9)'; c.fill();
    c.beginPath(); c.moveTo(-30, -40); c.lineTo(30, -40); c.lineTo(14, -18); c.lineTo(-14, -18); c.closePath(); c.fillStyle = 'rgba(200,236,255,.85)'; c.fill(); c.strokeStyle = '#7fb6ef'; c.lineWidth = 2.5; c.stroke();
    G.blob(c, [-30, -40, -24, -60, -8, -74, 8, -74, 24, -60, 30, -40]); G.fillO(c, '#ffffff', 2.5);
    c.beginPath(); c.moveTo(-24, -58); c.quadraticCurveTo(-8, -78, 8, -74); c.quadraticCurveTo(24, -62, 24, -54); c.quadraticCurveTo(10, -48, 0, -56); c.quadraticCurveTo(-12, -46, -24, -58); c.closePath(); c.fillStyle = 'rgba(255,80,110,.85)'; c.fill();
    c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.beginPath(); c.moveTo(16, -60); c.lineTo(32, -84); c.stroke(); G.ell(c, 16, -60, 4, 3, -0.9); c.fillStyle = '#ffd23f'; c.fill();
  }, ['sweet', 'cold', 'fest']);
  F('cottoncandy', 'わたあめ', 66, 110, (c, t) => {
    c.strokeStyle = '#e8c48a'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -2); c.lineTo(0, -52); c.stroke();
    const b = Math.sin((t || 0) * 0.003) * 1.5;
    G.blob(c, [-26, -60, -30, -84, -16, -102 + b, 6, -106, 26, -94 + b, 30, -70, 16, -54, -6, -50]); G.fillO(c, '#ffb3d1', 3);
    c.fillStyle = 'rgba(255,255,255,.55)'; G.circ(c, -10, -86, 9); c.fill(); G.circ(c, 10, -74, 6); c.fill();
    c.fillStyle = 'rgba(255,140,190,.5)'; G.circ(c, 14, -94, 7); c.fill(); G.circ(c, -16, -66, 6); c.fill();
  }, ['sweet', 'fest']);
  F('crepe', 'クレープ', 54, 96, (c) => {
    G.blob(c, [-22, -58, -14, -74, 0, -78, 14, -74, 22, -58]); G.fillO(c, '#f6d58a', 2.5);
    [[-12, -66], [0, -72], [12, -66]].forEach(([x, y]) => { G.circ(c, x, y, 8); G.fillO(c, '#ffffff', 2); });
    G.blob(c, [-8, -78, -2, -88, 6, -80]); G.fillO(c, '#ff4d6a', 2); dot(c, 10, -74, 4, '#ff4d6a');
    G.poly(c, [-24, -58, 24, -58, 4, -2, -4, -2]); G.fillO(c, '#ffffff', 3);
    c.strokeStyle = '#ff8fab'; c.lineWidth = 2.5; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-20 + i * 4, -50 + i * 12); c.lineTo(20 - i * 4, -50 + i * 12); c.stroke(); }
  }, ['sweet']);
  F('macaron', 'マカロン', 80, 50, (c) => {
    [[-22, -12, '#ffb3d1'], [22, -12, '#b8e8b0'], [0, -32, '#ffe08a']].forEach(([x, y, col]) => {
      G.ell(c, x, y + 2, 18, 7); G.fillO(c, col, 2.5);
      G.rr(c, x - 16, y - 4, 32, 5, 2); c.fillStyle = '#fffaf0'; c.fill();
      G.ell(c, x, y - 8, 18, 8); G.fillO(c, col, 2.5); shine(c, x - 6, y - 11, 5, 2, 0);
    });
  }, ['sweet']);
  F('parfait', 'パフェ', 54, 110, (c) => {
    G.ell(c, 0, -4, 16, 5); G.fillO(c, '#e0f2ff', 2.5); G.rr(c, -3, -20, 6, 16, 2); c.fillStyle = '#d6ecff'; c.fill();
    c.beginPath(); c.moveTo(-20, -74); c.lineTo(20, -74); c.lineTo(10, -20); c.lineTo(-10, -20); c.closePath(); c.fillStyle = 'rgba(220,240,255,.7)'; c.fill();
    c.save(); c.clip();
    c.fillStyle = '#ffd86a'; c.fillRect(-22, -36, 44, 16); c.fillStyle = '#fffaf0'; c.fillRect(-22, -50, 44, 14); c.fillStyle = '#ff6f8a'; c.fillRect(-22, -62, 44, 12); c.fillStyle = '#fffaf0'; c.fillRect(-22, -76, 44, 14);
    c.restore();
    c.beginPath(); c.moveTo(-20, -74); c.lineTo(20, -74); c.lineTo(10, -20); c.lineTo(-10, -20); c.closePath(); c.strokeStyle = '#9fc8f0'; c.lineWidth = 2.5; c.stroke();
    G.blob(c, [-20, -74, -14, -88, 0, -94, 14, -88, 20, -74]); G.fillO(c, '#ffffff', 2.5);
    G.rr(c, 8, -108, 8, 30, 2); G.fillO(c, '#e9b26a', 2);
    dot(c, -4, -98, 6, '#e8384f'); c.strokeStyle = '#58b44e'; c.lineWidth = 2; c.beginPath(); c.moveTo(-4, -104); c.quadraticCurveTo(-2, -110, 2, -110); c.stroke();
  }, ['sweet', 'cold']);
  F('chocobar', 'チョコレート', 74, 56, (c) => {
    c.save(); c.translate(0, -26); c.rotate(-0.15);
    G.rr(c, -32, -18, 64, 36, 5); G.fillO(c, '#7a4a2a', 3);
    c.strokeStyle = '#5a321a'; c.lineWidth = 2; for (const x of [-16, 0, 16]) { c.beginPath(); c.moveTo(x, -16); c.lineTo(x, 16); c.stroke(); } c.beginPath(); c.moveTo(-30, 0); c.lineTo(30, 0); c.stroke();
    c.beginPath(); c.moveTo(0, -18); c.lineTo(32, -18); c.lineTo(32, 18); c.lineTo(4, 18); c.lineTo(10, 6); c.lineTo(2, -4); c.lineTo(8, -12); c.closePath(); G._bb = { x0: 0, y0: -18, x1: 32, y1: 18 }; G.fillO(c, '#ff5d78', 2.5);
    G.heart(c, 20, 2, 7); c.fillStyle = '#ffd23f'; c.fill();
    c.restore();
  }, ['sweet']);
  F('popcorncup', 'ポップコーン', 64, 86, (c) => {
    [[-16, -64], [0, -70], [16, -64], [-8, -76], [8, -78], [-20, -56], [20, -56], [0, -60]].forEach(([x, y]) => { G.circ(c, x, y, 8); G.fillO(c, '#fff3c8', 2); });
    G.poly(c, [-26, -58, 26, -58, 18, -2, -18, -2]); G.fillO(c, '#ffffff', 3);
    c.fillStyle = '#ff5d6c'; for (let i = 0; i < 3; i++) { const x0 = -20 + i * 15; c.beginPath(); c.moveTo(x0, -58); c.lineTo(x0 + 7, -58); c.lineTo(x0 + 5, -2); c.lineTo(x0 + 1, -2); c.closePath(); c.fill(); }
    c.strokeStyle = PT.line('#ffffff'); c.lineWidth = 2.5; G.poly(c, [-26, -58, 26, -58, 18, -2, -18, -2]); c.stroke();
  }, ['snack']);
  F('hotdog', 'ホットドッグ', 86, 44, (c) => {
    G.rr(c, -38, -26, 76, 22, 11); G.fillO(c, '#e9a85a', 3);
    G.rr(c, -42, -30, 84, 12, 6); G.fillO(c, '#c4473f', 2.5);
    c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.beginPath(); c.moveTo(-32, -26); for (let i = 0; i < 8; i++) c.lineTo(-24 + i * 8, i % 2 ? -26 : -32); c.stroke();
    G.rr(c, -36, -24, 72, 10, 5); c.fillStyle = '#f0b25a'; c.fill();
  });
  F('sandwich', 'サンドイッチ', 76, 60, (c) => {
    [[-16, '#ffd86a'], [16, '#7bd36a']].forEach(([x, fill]) => {
      G.poly(c, [x - 18, -4, x + 18, -4, x, -52]); G.fillO(c, '#f6e2b8', 3);
      G.poly(c, [x - 13, -8, x + 13, -8, x, -42]); c.fillStyle = '#fffaf0'; c.fill();
      c.fillStyle = fill; G.poly(c, [x - 10, -12, x + 10, -12, x, -32]); c.fill();
      if (fill === '#7bd36a') { dot(c, x, -16, 4, '#ff5d6c'); }
    });
  });
  F('tamagoyaki', 'たまごやき', 74, 44, (c) => {
    plate(c, 36, -6, '#cfe8ff');
    for (const x of [-15, 15]) {
      G.rr(c, x - 13, -34, 26, 26, 5); G.fillO(c, '#ffd84a', 2.5);
      c.strokeStyle = '#f0b82a'; c.lineWidth = 2; c.beginPath(); c.arc(x, -21, 8, 0.3, PT.TAU - 0.5); c.stroke(); c.beginPath(); c.arc(x, -21, 3.5, 0, 4); c.stroke();
    }
  }, ['japanese']);
  F('mochi', 'おもち', 66, 66, (c) => {
    G.rr(c, -30, -14, 60, 12, 3); G.fillO(c, '#d9a066', 2.5); G.rr(c, -20, -6, 40, 6, 2); G.fillO(c, '#b8804a', 2);
    G.ell(c, 0, -24, 26, 11); G.fillO(c, '#fffaf0', 2.5);
    G.ell(c, 0, -38, 20, 9); G.fillO(c, '#fffaf0', 2.5);
    G.circ(c, 0, -52, 9); G.fillO(c, '#ff9a3d', 2.5); c.fillStyle = '#58b44e'; G.ell(c, 6, -61, 6, 3, -0.5); c.fill();
  }, ['japanese', 'moon']);
  F('dango', 'だんご', 40, 100, (c) => {
    c.strokeStyle = '#d9b07a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -2); c.lineTo(0, -92); c.stroke();
    [['#7bd36a', -26], ['#ffffff', -48], ['#ffb3d1', -70]].forEach(([col, y]) => { G.circ(c, 0, y, 13); G.fillO(c, col, 2.5); shine(c, -4, y - 5, 4, 2.5); });
  }, ['japanese', 'sweet', 'moon']);
  F('dorayaki', 'どらやき', 70, 46, (c) => {
    G.ell(c, 0, -12, 30, 9); G.fillO(c, '#b8742e', 2.5);
    G.ell(c, 0, -20, 28, 5); c.fillStyle = '#6b2a3a'; c.fill();
    G.ell(c, 0, -26, 30, 12); G.fillO(c, '#d9963e', 2.5); G.ell(c, -2, -29, 22, 7); c.fillStyle = '#b8742e'; c.fill(); shine(c, -10, -31, 6, 2.5, 0);
  }, ['japanese', 'sweet']);
  F('taiyaki', 'たいやき', 86, 50, (c) => {
    c.beginPath(); c.moveTo(-30, -24); c.quadraticCurveTo(-26, -44, 4, -42); c.quadraticCurveTo(22, -40, 28, -32); c.lineTo(40, -42); c.lineTo(38, -8); c.lineTo(28, -16); c.quadraticCurveTo(18, -6, 0, -6); c.quadraticCurveTo(-26, -6, -30, -24); c.closePath();
    G._bb = { x0: -30, y0: -44, x1: 40, y1: -6 }; G.fillO(c, '#d9963e', 3);
    c.strokeStyle = '#b8742e'; c.lineWidth = 2; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { c.beginPath(); c.arc(-2 + i * 9, -28 + j * 9, 4, 0.2, Math.PI - 0.2); c.stroke(); }
    dot(c, -18, -28, 3, '#5a321a'); c.beginPath(); c.moveTo(-28, -18); c.quadraticCurveTo(-24, -16, -22, -19); c.stroke();
  }, ['japanese', 'sweet', 'hot']);
  F('melon', 'メロン', 80, 76, (c) => {
    G.ell(c, 0, -34, 36, 32); G.fillO(c, '#9fd45a', 3);
    c.save(); G.ell(c, 0, -34, 35, 31); c.clip(); c.strokeStyle = 'rgba(240,255,220,.8)'; c.lineWidth = 1.6;
    for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 12 - 20, -70); c.lineTo(i * 12 + 20, 0); c.moveTo(i * 12 + 20, -70); c.lineTo(i * 12 - 20, 0); c.stroke(); }
    c.restore(); shine(c, -14, -48, 9, 5);
    c.strokeStyle = '#6b8a3a'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -64); c.lineTo(0, -74); c.moveTo(-8, -74); c.lineTo(8, -74); c.stroke();
  }, ['fruit', 'big']);
  F('peach', 'もも', 56, 60, (c) => {
    G.blob(c, [0, -46, -16, -50, -26, -32, -18, -8, 0, -2, 18, -8, 26, -32, 16, -50]); G.fillO(c, '#ffb3c1', 3);
    c.strokeStyle = 'rgba(230,110,140,.6)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -46); c.quadraticCurveTo(-8, -26, 0, -6); c.stroke();
    G.ell(c, -10, -30, 8, 10); c.fillStyle = 'rgba(255,240,200,.5)'; c.fill();
    for (const s of [-1, 1]) { G.ell(c, s * 9, -52, 9, 4, s * -0.5); G.fillO(c, '#58b44e', 2); }
  }, ['fruit']);
  F('mikan', 'みかん', 54, 50, (c) => {
    G.ell(c, 0, -22, 24, 20); G.fillO(c, '#ffa02e', 3);
    c.fillStyle = 'rgba(200,100,0,.25)'; [[-10, -28], [6, -14], [12, -30], [-4, -12], [0, -32]].forEach(([x, y]) => { G.circ(c, x, y, 1.6); c.fill(); });
    shine(c, -9, -30, 6, 4); dot(c, 0, -41, 3, '#6b8a3a'); G.ell(c, 8, -44, 8, 4, -0.4); G.fillO(c, '#58b44e', 2);
  }, ['fruit']);
  F('cherry', 'さくらんぼ', 56, 66, (c) => {
    c.strokeStyle = '#6b8a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-12, -20); c.quadraticCurveTo(-8, -48, 4, -60); c.moveTo(14, -18); c.quadraticCurveTo(12, -44, 4, -60); c.stroke();
    G.ell(c, 12, -58, 10, 4, -0.3); G.fillO(c, '#58b44e', 2);
    for (const [x, y] of [[-12, -14], [14, -12]]) { G.circ(c, x, y, 11); G.fillO(c, '#e8384f', 2.5); shine(c, x - 4, y - 4, 3.5, 2.2); }
  }, ['fruit', 'red']);
  F('tomato', 'トマト', 56, 52, (c) => {
    G.ell(c, 0, -22, 26, 21); G.fillO(c, '#ff4d3c', 3); shine(c, -10, -30, 7, 4);
    G.star(c, 0, -40, 11, 4, 5); G.fillO(c, '#58b44e', 2); c.strokeStyle = '#3f8a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -42); c.lineTo(2, -50); c.stroke();
  }, ['vegetable', 'red']);
  F('milk', 'ぎゅうにゅう', 44, 84, (c) => {
    G.rr(c, -17, -60, 34, 58, 3); G.fillO(c, '#ffffff', 3);
    G.poly(c, [-17, -60, 17, -60, 10, -74, -10, -74]); G.fillO(c, '#7fb6ef', 2.5); G.rr(c, -10, -80, 20, 6, 1); G.fillO(c, '#7fb6ef', 2);
    G.rr(c, -17, -28, 34, 10, 1); c.fillStyle = '#7fb6ef'; c.fill();
    c.fillStyle = '#3a3550'; G.blob(c, [-12, -52, -4, -54, -2, -46, -10, -42]); c.fill(); G.blob(c, [6, -44, 13, -46, 13, -36, 6, -38]); c.fill();
    G.ell(c, 0, -10, 6, 4); c.fillStyle = '#ffb3c8'; c.fill();
  }, ['drink']);
  F('ramune', 'ラムネ', 40, 90, (c, t) => {
    G.rr(c, -14, -56, 28, 54, 10); c.fillStyle = 'rgba(140,220,230,.85)'; c.fill(); c.strokeStyle = '#4fa8b8'; c.lineWidth = 2.5; c.stroke();
    c.beginPath(); c.moveTo(-12, -54); c.quadraticCurveTo(-4, -60, -6, -66); c.lineTo(6, -66); c.quadraticCurveTo(4, -60, 12, -54); c.closePath(); c.fillStyle = 'rgba(140,220,230,.85)'; c.fill(); c.stroke();
    G.rr(c, -7, -80, 14, 14, 3); G.fillO(c, '#58b9f0', 2);
    dot(c, 0, -60, 5, 'rgba(255,255,255,.95)');
    c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 4; i++) { const k = (((t || 0) * 0.0006 + i * 0.25) % 1); G.circ(c, -6 + (i % 2) * 10, -8 - k * 40, 2); c.fill(); }
    G.rr(c, -14, -34, 28, 12, 2); c.fillStyle = '#ffffff'; c.fill(); G.star(c, 0, -28, 5, 2.2); c.fillStyle = '#58b9f0'; c.fill();
  }, ['drink', 'cold', 'fest']);
  F('friedegg', 'めだまやき', 76, 40, (c) => {
    plate(c, 36, -6, '#ffd1e0');
    G.blob(c, [-26, -14, -22, -24, -6, -26, 8, -30, 24, -22, 26, -12, 6, -10, -10, -8]); G.fillO(c, '#ffffff', 2.5);
    G.circ(c, 2, -19, 8); G.fillO(c, '#ffb02e', 2); shine(c, -1, -22, 3, 2);
  });
  F('rollcake', 'ロールケーキ', 76, 54, (c) => {
    plate(c, 36, -6);
    G.rr(c, -8, -46, 38, 38, 6); G.fillO(c, '#f0c06a', 3);
    G.circ(c, -10, -27, 19); G.fillO(c, '#f0c06a', 3);
    c.strokeStyle = '#fffaf0'; c.lineWidth = 4; c.beginPath(); for (let a = 0; a < 12; a += 0.4) { const r = 2 + a * 1.25; const x = -10 + Math.cos(a) * r, y = -27 + Math.sin(a) * r; if (a === 0) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
    dot(c, 14, -50, 6, '#ff4d6a'); G.ell(c, 14, -46, 9, 4); c.fillStyle = '#ffffff'; c.fill(); dot(c, 14, -50, 6, '#ff4d6a');
  }, ['sweet']);

  /* ================= どうぐ・おもちゃ ================= */
  T('puzzle', 'パズル', 84, 60, (c, t, st) => {
    const done = st && st.done;
    G.rr(c, -38, -50, 76, 46, 6); G.fillO(c, '#d9a066', 3);
    const cols = done ? ['#ffd1e0', '#bfe9ff', '#fff3b0', '#c8f0d8'] : ['#ff8fab', '#7fb6ef', '#ffd23f', '#e9dccb'];
    [[-34, -46], [0, -46], [-34, -26], [0, -26]].forEach(([x, y], i) => { G.rr(c, x, y, 34, 20, 3); c.fillStyle = cols[i]; c.fill(); c.strokeStyle = 'rgba(90,60,40,.35)'; c.lineWidth = 1.5; c.stroke(); });
    if (done) { G.heart(c, 0, -26, 13); c.fillStyle = '#ff5d78'; c.fill(); G.star(c, -22, -40, 6, 2.5); c.fillStyle = '#ffd23f'; c.fill(); G.star(c, 22, -16, 5, 2); c.fill(); }
    else {
      c.save(); c.translate(30, -10); c.rotate(0.3); G.rr(c, -10, -8, 20, 16, 3); G.fillO(c, '#58c46b', 2.5); G.circ(c, 0, -9, 4); G.fillO(c, '#58c46b', 2); c.restore();
      c.strokeStyle = 'rgba(90,60,40,.6)'; c.lineWidth = 2; c.setLineDash([3, 3]); G.rr(c, 0, -26, 34, 20, 3); c.stroke(); c.setLineDash([]);
    }
  }, ['puzzle']);
  T('kendama', 'けんだま', 54, 100, (c, t, st) => {
    G.rr(c, -4, -60, 8, 56, 3); G.fillO(c, '#e0b47a', 2.5);
    G.rr(c, -20, -66, 40, 12, 5); G.fillO(c, '#e0b47a', 2.5);
    for (const x of [-20, 20]) { G.ell(c, x, -60, 6, 8); G.fillO(c, '#d9a066', 2); }
    G.poly(c, [-3, -66, 3, -66, 0, -82]); G.fillO(c, '#e0b47a', 2);
    const sw = Math.sin((t || 0) * 0.004) * (st && st.held ? 0.6 : 0.15);
    const bx = 22 + Math.sin(sw) * 30, by = -30 + Math.cos(sw) * 10;
    c.strokeStyle = '#ffffff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(4, -50); c.quadraticCurveTo(16, -38, bx, by - 10); c.stroke();
    G.circ(c, bx, by, 12); G.fillO(c, '#ff5d6c', 2.5); shine(c, bx - 4, by - 4, 4, 2.5);
  }, ['japanese']);
  T('spintop', 'こま', 60, 64, (c, t, st) => {
    const sp = st && st.spin && (t || 0) < st.spin;
    const wob = sp ? Math.sin(t * 0.02) * 0.08 : 0, ph = sp ? t * 0.05 : 0;
    c.save(); c.translate(0, -4); c.rotate(wob);
    c.strokeStyle = '#6b4a2b'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -8); c.stroke();
    c.beginPath(); c.moveTo(0, -6); c.quadraticCurveTo(-30, -18, -26, -34); c.quadraticCurveTo(0, -42, 26, -34); c.quadraticCurveTo(30, -18, 0, -6); c.closePath(); G._bb = { x0: -30, y0: -42, x1: 30, y1: -6 }; G.fillO(c, '#ffd23f', 3);
    const cols = ['#ff5d6c', '#58b9f0', '#58c46b'];
    for (let i = 0; i < 3; i++) { const o = ((i * 9 + ph * 6) % 27) - 13; c.strokeStyle = cols[i]; c.lineWidth = 4; c.beginPath(); c.moveTo(o - 4, -12); c.quadraticCurveTo(o * 1.6, -24, o * 1.8, -36); c.stroke(); }
    G.ell(c, 0, -34, 26, 6); G.fillO(c, '#e0b47a', 2.5);
    G.rr(c, -4, -50, 8, 16, 3); G.fillO(c, '#c9813e', 2);
    c.restore();
    if (sp) { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2.5; for (const s of [-1, 1]) { c.beginPath(); c.arc(0, -22, 36, s > 0 ? -0.4 : Math.PI - 0.4, s > 0 ? 0.4 : Math.PI + 0.4); c.stroke(); } }
  }, ['japanese']);
  T('jumprope', 'なわとび', 84, 56, (c) => {
    c.strokeStyle = '#58b9f0'; c.lineWidth = 4; c.beginPath(); c.moveTo(-26, -20); c.bezierCurveTo(-40, -60, 30, -64, 20, -30); c.bezierCurveTo(10, -6, -36, -2, -10, -34); c.bezierCurveTo(6, -54, 40, -40, 26, -18); c.stroke();
    for (const [x, a] of [[-30, -0.5], [30, 0.6]]) { c.save(); c.translate(x, -14); c.rotate(a); G.rr(c, -5, -14, 10, 26, 5); G.fillO(c, '#ff8fab', 2.5); c.restore(); }
  });
  T('hulahoop', 'フラフープ', 96, 96, (c) => {
    const cols = ['#ff5d78', '#ffd23f', '#58c46b', '#58b9f0', '#b39ae8'];
    c.lineWidth = 9; c.strokeStyle = PT.line('#ff5d78'); c.beginPath(); c.ellipse(0, -46, 42, 42, 0, 0, PT.TAU); c.lineWidth = 12; c.stroke();
    cols.forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 8; c.beginPath(); c.ellipse(0, -46, 42, 42, 0, (i / 5) * PT.TAU, ((i + 1) / 5) * PT.TAU); c.stroke(); });
  }, ['ring']);
  T('bugcage', 'むしかご', 76, 76, (c, t, st) => {
    c.strokeStyle = '#ff8a2e'; c.lineWidth = 4; c.beginPath(); c.moveTo(-26, -56); c.quadraticCurveTo(0, -80, 26, -56); c.stroke();
    G.rr(c, -32, -58, 64, 54, 6); c.fillStyle = 'rgba(200,255,200,.4)'; c.fill();
    c.strokeStyle = '#58c46b'; c.lineWidth = 1.5; for (let x = -26; x <= 26; x += 7) { c.beginPath(); c.moveTo(x, -56); c.lineTo(x, -6); c.stroke(); }
    if (st && st.bug) { G.circ(c, 4, -26, 8); G.fillO(c, '#e8384f', 2); c.fillStyle = '#2b2440'; G.circ(c, 4, -33, 4); c.fill(); dot(c, 0, -24, 1.8, '#2b2440'); dot(c, 8, -23, 1.8, '#2b2440'); }
    G.rr(c, -34, -62, 68, 10, 4); G.fillO(c, '#58c46b', 2.5); G.rr(c, -34, -10, 68, 8, 3); G.fillO(c, '#58c46b', 2.5);
    G.rr(c, -10, -46, 20, 22, 3); c.strokeStyle = '#3f8a3a'; c.lineWidth = 2; c.stroke();
  }, ['insect']);
  T('flowerpot', 'うえきばち', 64, 100, (c, t, st) => {
    const g = st && st.grow, b = st && st.bloom;
    if (b) {
      const k = Math.min(1, ((t || 0) - b) / 600); const sw = Math.sin((t || 0) * 0.003) * 2;
      c.strokeStyle = '#58b44e'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -40); c.lineTo(sw, -40 - 44 * k); c.stroke();
      for (const s of [-1, 1]) { G.ell(c, s * 9, -56, 9, 4, s * -0.6); G.fillO(c, '#58b44e', 2); }
      for (let i = 0; i < 5; i++) { const a = (i / 5) * PT.TAU; G.ell(c, sw + Math.cos(a) * 10 * k, -84 * k - 0 + Math.sin(a) * 10 * k, 8 * k + 0.5, 6 * k + 0.5, a); G.fillO(c, '#ff8fab', 2); }
      dot(c, sw, -84 * k, 6 * k + 0.5, '#ffd23f');
    } else {
      const h = g ? 26 : 10;
      c.strokeStyle = '#58b44e'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -40); c.lineTo(0, -40 - h); c.stroke();
      for (const s of [-1, 1]) { G.ell(c, s * 7, -40 - h, 7, 3.5, s * -0.5); G.fillO(c, '#7bd36a', 2); }
    }
    c.beginPath(); c.moveTo(-26, -42); c.lineTo(26, -42); c.lineTo(18, -2); c.lineTo(-18, -2); c.closePath(); G._bb = { x0: -26, y0: -42, x1: 26, y1: -2 }; G.fillO(c, '#e07a4a', 3);
    G.rr(c, -29, -46, 58, 10, 3); G.fillO(c, '#e88a5a', 2.5); G.ell(c, 0, -45, 24, 3); c.fillStyle = '#7a4a2a'; c.fill();
  }, ['plant']);
  T('paints', 'えのぐ', 84, 56, (c) => {
    G.blob(c, [-38, -24, -30, -42, 0, -48, 30, -42, 38, -24, 26, -8, 6, -10, -4, -4, -26, -6]); G.fillO(c, '#f6e2b8', 3);
    G.circ(c, 10, -16, 5); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = PT.line('#f6e2b8'); c.lineWidth = 2; c.stroke();
    [['#ff5d6c', -24, -26], ['#ffd23f', -10, -36], ['#58c46b', 8, -38], ['#58b9f0', 24, -30], ['#b39ae8', -24, -14]].forEach(([col, x, y]) => { G.blob(c, [x - 6, y, x - 3, y - 5, x + 4, y - 5, x + 6, y + 1, x, y + 5]); c.fillStyle = col; c.fill(); });
    c.save(); c.translate(26, -36); c.rotate(0.7); G.rr(c, -3, -26, 6, 30, 3); G.fillO(c, '#c9813e', 2); G.ell(c, 0, 8, 4, 7); c.fillStyle = '#ff5d6c'; c.fill(); c.restore();
  }, ['art']);
  T('sketchbook', 'スケッチブック', 80, 70, (c, t, st) => {
    const d = (st && st.drawn) || 0;
    G.rr(c, -34, -64, 68, 60, 4); G.fillO(c, '#ffffff', 3);
    c.strokeStyle = '#9fb3c8'; c.lineWidth = 2.5; for (let x = -26; x <= 26; x += 8) { c.beginPath(); c.arc(x, -64, 3.5, Math.PI, 0); c.stroke(); }
    G.rr(c, -34, -10, 68, 6, 2); c.fillStyle = '#ff9a3d'; c.fill();
    if (d >= 2) {
      ['#ff6b6b', '#ffa94d', '#ffd84a', '#69db7c', '#4dabf7'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 3.5; c.beginPath(); c.arc(0, -16, 26 - i * 4, Math.PI, 0); c.stroke(); });
      dot(c, -20, -50, 6, '#ffd23f'); G.heart(c, 18, -44, 7); c.fillStyle = '#ff6f91'; c.fill();
    } else if (d === 1) {
      c.strokeStyle = '#3a3550'; c.lineWidth = 2; G.circ(c, -14, -44, 8); c.stroke();
      c.beginPath(); c.moveTo(0, -18); c.lineTo(0, -34); c.lineTo(12, -44); c.lineTo(24, -34); c.lineTo(24, -18); c.closePath(); c.stroke();
    } else { c.strokeStyle = '#d6e0ea'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-20, -30); c.quadraticCurveTo(0, -40, 18, -26); c.stroke(); }
  }, ['art']);
  T('playkitchen', 'おままごと キッチン', 110, 120, (c, t, st) => {
    const ck = st && st.cook && (t || 0) < st.cook;
    G.rr(c, -50, -88, 100, 86, 8); G.fillO(c, '#ffd1e0', 3);
    G.rr(c, -54, -94, 108, 10, 4); G.fillO(c, '#ffffff', 2.5);
    G.rr(c, -40, -70, 50, 46, 6); G.fillO(c, '#ffffff', 2.5); G.rr(c, -34, -64, 38, 30, 5); c.fillStyle = ck ? '#ffcc80' : '#bfe0f5'; c.fill();
    G.rr(c, -32, -76, 34, 4, 2); c.fillStyle = '#c9d6e4'; c.fill();
    for (const y of [-64, -46, -28]) { G.circ(c, 32, y, 6); G.fillO(c, ['#ff5d6c', '#ffd23f', '#58c46b'][(y + 64) / 18], 2); }
    for (const x of [-26, 16]) { G.ell(c, x, -95, 13, 3.5); c.strokeStyle = '#3a3550'; c.lineWidth = 2.5; c.stroke(); }
    const lid = ck ? Math.abs(Math.sin(t * 0.02)) * 6 : 0;
    G.rr(c, -38, -116, 26, 20, 5); G.fillO(c, '#7fb6ef', 2.5);
    G.ell(c, -25, -118 - lid, 15, 4); G.fillO(c, '#9fd0ff', 2); dot(c, -25, -123 - lid, 3, '#3a3550');
    if (ck) steam(c, t, -25, -126);
    c.save(); c.translate(18, -100); c.rotate(-0.2); G.ell(c, 0, 0, 14, 5); G.fillO(c, '#3a3550', 2); G.rr(c, 12, -2, 20, 4, 2); c.fillStyle = '#3a3550'; c.fill(); c.restore();
  }, ['cook']);
  const plushDraw = (body, belly, ear) => (c, t, st) => {
    const b = st && st.wobbleUntil && (t || 0) < st.wobbleUntil ? Math.sin(t * 0.03) * 3 : 0;
    G.ell(c, 0, -22, 22, 20); G.fillO(c, body, 3);
    G.ell(c, 0, -18, 13, 12); c.fillStyle = belly; c.fill();
    for (const s of [-1, 1]) { G.ell(c, s * 14, -6, 9, 6); G.fillO(c, body, 2.5); }
    c.save(); c.translate(0, b);
    ear(c, -1); ear(c, 1);
    G.circ(c, 0, -54, 20); G.fillO(c, body, 3);
    ear(c, -1, true); ear(c, 1, true);
    for (const s of [-1, 1]) { dot(c, s * 7, -56, 2.6, '#2b2440'); dot(c, s * 12, -48, 3.5, 'rgba(255,140,170,.5)'); }
    c.restore();
  };
  const PLUSH = {
    plushdog: ['いぬの ぬいぐるみ', '#f0d2a8', '#fff3e0', (c, s, front) => { if (!front) return; G.ell(c, s * 20, -50, 7, 13, s * -0.3); G.fillO(c, '#b8804a', 2.5); }, (c) => { G.ell(c, 0, -48, 5, 3.5); c.fillStyle = '#3a2a2a'; c.fill(); }],
    plushcat: ['ねこの ぬいぐるみ', '#ffc27a', '#fff3e0', (c, s, front) => { if (front) return; G.poly(c, [s * 6, -70, s * 20, -80, s * 18, -60]); G.fillO(c, '#ffc27a', 2.5); }, (c) => { G.poly(c, [-3, -50, 3, -50, 0, -47]); c.fillStyle = '#ff6f91'; c.fill(); c.strokeStyle = '#9a6a3a'; c.lineWidth = 1.2; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 8, -48); c.lineTo(s * 22, -50); c.moveTo(s * 8, -46); c.lineTo(s * 22, -44); c.stroke(); } }],
    plushlion: ['ライオンの ぬいぐるみ', '#ffd86a', '#fff3c8', (c, s, front) => { if (front || s > 0) return; G.star(c, 0, -54, 30, 22, 12); G.fillO(c, '#e0782a', 2.5); }, (c) => { G.ell(c, 0, -48, 5, 3.5); c.fillStyle = '#6b3a1a'; c.fill(); }],
    plushchick: ['ひよこの ぬいぐるみ', '#ffe24a', '#fff6b0', (c, s, front) => { if (!front || s > 0) return; G.poly(c, [-2, -74, 4, -82, 6, -72]); G.fillO(c, '#ffe24a', 2); }, (c) => { G.poly(c, [-5, -50, 5, -50, 0, -44]); c.fillStyle = '#ff9a3d'; c.fill(); }],
  };
  Object.entries(PLUSH).forEach(([id, [name, body, belly, ear, face]]) => {
    const base = plushDraw(body, belly, ear);
    T(id, name, 66, 80, (c, t, st) => { base(c, t, st); const b = st && st.wobbleUntil && (t || 0) < st.wobbleUntil ? Math.sin(t * 0.03) * 3 : 0; c.save(); c.translate(0, b); face(c); c.restore(); }, ['plush', 'soft', 'animal']);
  });
  T('doll', 'おにんぎょう', 54, 100, (c) => {
    G.poly(c, [-22, -6, 22, -6, 10, -48, -10, -48]); G.fillO(c, '#ff8fab', 3);
    G.rr(c, -22, -10, 44, 6, 3); c.fillStyle = '#ffffff'; c.fill();
    for (const s of [-1, 1]) { G.limb(c, s * 9, -44, s * 18, -28, 5, '#ffe0c8'); }
    G.circ(c, 0, -64, 18); G.fillO(c, '#ffe0c8', 2.5);
    G.blob(c, [-20, -62, -18, -80, 0, -86, 18, -80, 20, -62, 12, -74, -12, -74]); G.fillO(c, '#ffcf4a', 2.5);
    for (const s of [-1, 1]) { G.ell(c, s * 20, -56, 5, 11); G.fillO(c, '#ffcf4a', 2); dot(c, s * 6, -62, 2.3, '#2b2440'); dot(c, s * 11, -56, 3, 'rgba(255,140,170,.5)'); }
    G.heart(c, 10, -82, 6); c.fillStyle = '#ff5d78'; c.fill();
    c.strokeStyle = '#d0507a'; c.lineWidth = 1.6; c.beginPath(); c.arc(0, -58, 4, 0.3, Math.PI - 0.3); c.stroke();
  }, ['plush', 'doll']);
  T('minicar', 'ミニカー', 80, 46, (c, t, st) => {
    const dr = st && st.drive && (t || 0) < st.drive; const a = dr ? t * 0.03 : 0;
    G.blob(c, [-34, -14, -32, -26, -14, -28, -6, -40, 14, -40, 22, -28, 34, -24, 36, -12]); G.fillO(c, (st && st.col) || '#ff5d6c', 3);
    G.poly(c, [-4, -36, 12, -36, 16, -28, -10, -28]); c.fillStyle = '#bfe9ff'; c.fill();
    dot(c, 32, -20, 3, '#ffe24a');
    for (const x of [-20, 20]) { G.circ(c, x, -10, 9); G.fillO(c, '#3a3550', 2.5); dot(c, x, -10, 4, '#c9d6e4'); c.strokeStyle = '#3a3550'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + Math.cos(a) * 4, -10 + Math.sin(a) * 4); c.lineTo(x - Math.cos(a) * 4, -10 - Math.sin(a) * 4); c.stroke(); }
    if (dr) { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2.5; for (const y of [-34, -22]) { c.beginPath(); c.moveTo(-44, y); c.lineTo(-58, y); c.stroke(); } }
  }, ['car']);
  T('alarmclock', 'めざましどけい', 64, 76, (c, t, st) => {
    const r = st && st.ring && (t || 0) < st.ring; c.save(); if (r) { c.translate(0, -30); c.rotate(Math.sin(t * 0.08) * 0.12); c.translate(0, 30); }
    for (const s of [-1, 1]) { G.limb(c, s * 14, -12, s * 20, -2, 4, '#3a3550'); G.circ(c, s * 18, -60, 10); G.fillO(c, '#ffd23f', 2.5); }
    G.rr(c, -3, -72, 6, 8, 2); c.fillStyle = '#3a3550'; c.fill();
    G.circ(c, 0, -36, 26); G.fillO(c, '#ff6f61', 3); G.circ(c, 0, -36, 19); G.fillO(c, '#ffffff', 2);
    c.fillStyle = '#9fb3c8'; for (let i = 0; i < 12; i += 3) { const a = (i / 12) * PT.TAU; G.circ(c, Math.cos(a) * 15, -36 + Math.sin(a) * 15, 1.8); c.fill(); }
    c.strokeStyle = '#3a3550'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -36); c.lineTo(0, -48); c.moveTo(0, -36); c.lineTo(9, -32); c.stroke();
    c.restore();
    if (r) { c.strokeStyle = '#ffb02e'; c.lineWidth = 3; for (const s of [-1, 1]) { c.beginPath(); c.arc(0, -46, 38, s > 0 ? -0.9 : Math.PI - 0.3, s > 0 ? -0.3 : Math.PI + 0.9 - 0.6 + 0.6 - 0.6 + 0.6); c.stroke(); } }
  }, ['clock']);
  T('comb', 'くし', 76, 34, (c) => {
    G.rr(c, -34, -26, 68, 12, 6); G.fillO(c, '#ff8fab', 2.5);
    c.fillStyle = '#ff8fab'; for (let x = -30; x <= 28; x += 5) c.fillRect(x, -16, 3, 12);
    c.strokeStyle = PT.line('#ff8fab'); c.lineWidth = 1.2; c.strokeRect(-31, -16, 62, 0.5);
    G.heart(c, 0, -20, 4); c.fillStyle = '#ffffff'; c.fill();
  }, ['hair']);
  T('hairdryer', 'ドライヤー', 80, 70, (c) => {
    c.save(); c.translate(-8, -12); c.rotate(0.2); G.rr(c, -7, -30, 14, 34, 6); G.fillO(c, '#b39ae8', 2.5); c.restore();
    G.rr(c, -30, -64, 50, 30, 14); G.fillO(c, '#c8b2ff', 3);
    G.rr(c, 16, -58, 20, 18, 4); G.fillO(c, '#9a80dd', 2.5);
    G.circ(c, -14, -49, 9); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#9a80dd'; c.lineWidth = 1.5; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-14, -49, 3 + i * 2, 0, PT.TAU); c.stroke(); }
    dot(c, -8, -20, 3, '#ff8fab');
  }, ['hair']);
  T('bedpillow', 'まくら', 92, 50, (c) => {
    G.blob(c, [-42, -10, -44, -34, -30, -40, 0, -38, 30, -40, 44, -34, 42, -10, 30, -4, 0, -6, -30, -4]); G.fillO(c, '#e8f2ff', 3);
    c.strokeStyle = 'rgba(127,182,239,.6)'; c.lineWidth = 2; for (let x = -24; x <= 24; x += 12) { c.beginPath(); c.moveTo(x, -34); c.lineTo(x, -10); c.stroke(); }
    G.star(c, 26, -30, 6, 2.5); c.fillStyle = '#ffd23f'; c.fill();
  }, ['soft', 'sleep']);
  T('rainboots', 'ながぐつ', 76, 64, (c) => {
    for (const x of [-16, 18]) {
      c.save(); c.translate(x, 0);
      c.beginPath(); c.moveTo(-10, -56); c.lineTo(8, -56); c.lineTo(8, -18); c.quadraticCurveTo(22, -16, 22, -4); c.lineTo(-12, -4); c.closePath(); G._bb = { x0: -12, y0: -56, x1: 22, y1: -4 }; G.fillO(c, '#ffd23f', 3);
      G.rr(c, -12, -60, 22, 7, 3); G.fillO(c, '#ffe57a', 2); G.rr(c, -12, -8, 34, 5, 2); c.fillStyle = '#e0a020'; c.fill();
      shine(c, -4, -40, 2.5, 8, 0);
      c.restore();
    }
  }, ['rain']);
  T('schoolbag', 'ランドセル', 70, 80, (c) => {
    G.rr(c, -30, -70, 60, 66, 12); G.fillO(c, '#e8384f', 3);
    c.beginPath(); c.moveTo(-30, -58); c.quadraticCurveTo(-30, -70, -18, -70); c.lineTo(18, -70); c.quadraticCurveTo(30, -70, 30, -58); c.lineTo(30, -22); c.quadraticCurveTo(0, -14, -30, -22); c.closePath(); G._bb = { x0: -30, y0: -70, x1: 30, y1: -16 }; G.fillO(c, '#ff5d6c', 2.5);
    G.rr(c, -6, -28, 12, 10, 3); G.fillO(c, '#ffd23f', 2);
    c.strokeStyle = '#c42a3f'; c.lineWidth = 1.5; c.setLineDash([3, 3]); G.rr(c, -26, -66, 52, 46, 10); c.stroke(); c.setLineDash([]);
    G.star(c, 0, -50, 6, 2.5); c.fillStyle = '#ffffff'; c.fill();
  }, ['school', 'bag']);
  T('dominoes', 'ドミノ', 100, 64, (c, t, st) => {
    const f0 = st && st.fall;
    for (let i = 0; i < 6; i++) {
      const x = -40 + i * 16;
      const k = f0 ? PT.clamp(((t || 0) - f0 - i * 140) / 220, 0, 1) : 0;
      c.save(); c.translate(x + 5, -4); c.rotate(k * 1.15);
      G.rr(c, -5, -42, 10, 42, 2); G.fillO(c, ['#ffffff', '#fff3b0', '#ffd1e0'][i % 3], 2.5);
      c.fillStyle = '#3a3550'; G.circ(c, 0, -32, 1.8); c.fill(); G.circ(c, 0, -12, 1.8); c.fill(); c.fillRect(-4, -22, 8, 1.2);
      c.restore();
    }
  });
  T('yoyo', 'ヨーヨー', 46, 86, (c, t, st) => {
    const y = st && st.held ? -40 + Math.sin((t || 0) * 0.008) * 30 : -20;
    c.strokeStyle = '#ffffff'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, -80); c.lineTo(0, y); c.stroke();
    G.circ(c, 0, -80, 4); c.strokeStyle = '#ff8fab'; c.lineWidth = 2.5; c.stroke();
    G.circ(c, 0, y, 16); G.fillO(c, '#58b9f0', 2.5); G.circ(c, 0, y, 8); G.fillO(c, '#ffd23f', 2); G.star(c, 0, y, 5, 2); c.fillStyle = '#ffffff'; c.fill();
  });
  T('origami', 'おりがみ', 70, 56, (c) => {
    G.poly(c, [-30, -14, -6, -26, 0, -12]); G.fillO(c, '#ff8fab', 2.5);
    G.poly(c, [-6, -26, 10, -50, 4, -20]); G.fillO(c, '#ffb3c8', 2.5);
    G.poly(c, [0, -12, 24, -24, 30, -38, 28, -22, 10, -10]); G.fillO(c, '#ff8fab', 2.5);
    G.poly(c, [-6, -26, -18, -46, 0, -20]); G.fillO(c, '#ffd1e0', 2);
    G.rr(c, 14, -12, 22, 10, 1); G.fillO(c, '#7fd0e8', 2); G.rr(c, 22, -8, 14, 6, 1); c.fillStyle = '#ffd23f'; c.fill();
  }, ['paper']);
  T('toothbrush', 'はブラシ', 80, 36, (c) => {
    c.save(); c.translate(0, -16); c.rotate(-0.12);
    G.rr(c, -36, -4, 56, 8, 4); G.fillO(c, '#58b9f0', 2.5);
    G.rr(c, 16, -14, 22, 10, 2); G.fillO(c, '#ffffff', 2); c.strokeStyle = '#bfe0f5'; c.lineWidth = 1.2; for (let x = 19; x < 37; x += 4) { c.beginPath(); c.moveTo(x, -13); c.lineTo(x, -5); c.stroke(); }
    G.blob(c, [18, -14, 24, -22, 32, -20, 36, -14]); c.fillStyle = '#c8f0d8'; c.fill(); dot(c, 26, -18, 2, '#ffffff');
    c.restore();
  }, ['bath']);
  T('soap', 'せっけん', 66, 50, (c, t) => {
    G.rr(c, -26, -24, 52, 20, 9); G.fillO(c, '#ffc8e0', 3); G.rr(c, -16, -20, 32, 8, 4); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
    for (let i = 0; i < 3; i++) { const k = (((t || 0) * 0.0005 + i * 0.33) % 1); G.circ(c, -12 + i * 12, -28 - k * 18, 4 + i); c.fillStyle = `rgba(220,240,255,${0.8 - k * 0.6})`; c.fill(); c.strokeStyle = `rgba(150,200,255,${0.8 - k * 0.6})`; c.lineWidth = 1.2; c.stroke(); }
  }, ['bath']);
  T('archblock', 'アーチの つみき', 96, 74, (c) => {
    c.beginPath(); c.moveTo(-40, -4); c.lineTo(-40, -44); c.lineTo(40, -44); c.lineTo(40, -4); c.lineTo(18, -4); c.arc(0, -4, 18, 0, Math.PI, true); c.closePath(); G._bb = { x0: -40, y0: -44, x1: 40, y1: -4 }; G.fillO(c, '#ff8a5c', 3);
    G.poly(c, [-30, -44, 30, -44, 0, -70]); G.fillO(c, '#58b9f0', 3);
    G.rr(c, -40, -44, 22, 6, 2); c.fillStyle = 'rgba(255,255,255,.3)'; c.fill();
  }, ['blocks']);
  T('telescope', 'ぼうえんきょう', 86, 100, (c) => {
    c.strokeStyle = '#8a6a4a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -46); c.lineTo(-22, -2); c.moveTo(0, -46); c.lineTo(22, -2); c.moveTo(0, -46); c.lineTo(0, -2); c.stroke();
    c.save(); c.translate(0, -52); c.rotate(-0.55);
    G.rr(c, -34, -9, 50, 18, 6); G.fillO(c, '#4c7fe0', 3); G.rr(c, 14, -12, 22, 24, 5); G.fillO(c, '#7fb6ef', 2.5);
    G.rr(c, -44, -6, 12, 12, 3); G.fillO(c, '#3a3550', 2); G.rr(c, -12, -9, 6, 18, 1); c.fillStyle = '#ffd23f'; c.fill();
    c.restore();
  }, ['star']);
  T('hourglass', 'すなどけい', 46, 80, (c, t, st) => {
    const fl = st && st.flip; const k = fl ? PT.clamp(((t || 0) - fl) / 4000, 0, 1) : 0.5;
    G.rr(c, -20, -76, 40, 7, 3); G.fillO(c, '#c9813e', 2.5); G.rr(c, -20, -9, 40, 7, 3); G.fillO(c, '#c9813e', 2.5);
    for (const x of [-16, 16]) { G.rr(c, x - 2, -70, 4, 62, 2); c.fillStyle = '#a5642a'; c.fill(); }
    c.beginPath(); c.moveTo(-12, -69); c.lineTo(12, -69); c.quadraticCurveTo(12, -48, 2, -40); c.quadraticCurveTo(12, -32, 12, -9); c.lineTo(-12, -9); c.quadraticCurveTo(-12, -32, -2, -40); c.quadraticCurveTo(-12, -48, -12, -69); c.closePath(); c.fillStyle = 'rgba(220,240,255,.7)'; c.fill(); c.strokeStyle = '#9fc8f0'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#ffd86a';
    const top = (1 - k) * 18; if (top > 0.5) { c.beginPath(); c.moveTo(-9 + (18 - top) * 0.3, -44 - top); c.lineTo(9 - (18 - top) * 0.3, -44 - top); c.lineTo(2, -42); c.lineTo(-2, -42); c.closePath(); c.fill(); }
    const bot = k * 18; c.beginPath(); c.moveTo(-11, -10); c.lineTo(11, -10); c.lineTo(11 - bot * 0.2, -10 - bot); c.lineTo(-11 + bot * 0.2, -10 - bot); c.closePath(); c.fill();
    if (k > 0 && k < 1) { c.fillRect(-0.8, -42, 1.6, 30 - bot); }
  }, ['clock']);
  T('piggybank', 'ちょきんばこ', 76, 60, (c, t, st) => {
    const w = st && st.wobbleUntil && (t || 0) < st.wobbleUntil ? Math.sin(t * 0.04) * 0.08 : 0;
    c.save(); c.translate(0, -26); c.rotate(w);
    for (const x of [-16, 14]) { G.rr(c, x - 5, 8, 10, 14, 4); G.fillO(c, '#ff9ec4', 2); }
    G.ell(c, 0, 0, 32, 22); G.fillO(c, '#ffb3d1', 3);
    G.poly(c, [-14, -18, -8, -30, -2, -18]); G.fillO(c, '#ff9ec4', 2);
    G.ell(c, 30, 2, 8, 9); G.fillO(c, '#ff9ec4', 2.5); dot(c, 28, 0, 1.8, '#c4507a'); dot(c, 32, 4, 1.8, '#c4507a');
    dot(c, 16, -6, 2.6, '#2b2440');
    G.rr(c, -8, -21, 16, 4, 2); c.fillStyle = '#c4507a'; c.fill();
    c.strokeStyle = '#ff9ec4'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-32, -2); c.quadraticCurveTo(-42, -8, -38, 2); c.stroke();
    c.restore();
  }, ['money']);
  T('globe', 'ちきゅうぎ', 66, 100, (c, t, st) => {
    const sp = st && st.spin && (t || 0) < st.spin; const off = ((sp ? t * 0.08 : (t || 0) * 0.005) % 60);
    G.ell(c, 0, -6, 20, 5); G.fillO(c, '#c9813e', 2.5); G.rr(c, -3, -24, 6, 18, 2); c.fillStyle = '#a5642a'; c.fill();
    c.strokeStyle = '#ffd23f'; c.lineWidth = 3.5; c.beginPath(); c.arc(0, -58, 34, Math.PI * 0.6, Math.PI * 1.55); c.stroke();
    G.circ(c, 0, -58, 28); G.fillO(c, '#58b9f0', 3);
    c.save(); G.circ(c, 0, -58, 27); c.clip(); c.fillStyle = '#7bd36a';
    for (const [x, y, rx, ry] of [[-20, -68, 12, 9], [8, -50, 10, 12], [26, -70, 9, 7]]) { for (const d of [0, 60]) { G.blob(c, [x + off - d - rx, y, x + off - d, y - ry, x + off - d + rx, y, x + off - d + rx * 0.4, y + ry, x + off - d - rx * 0.6, y + ry * 0.6]); c.fill(); } }
    c.restore(); shine(c, -10, -70, 8, 5);
  }, ['earth']);
  T('paperplane', 'かみひこうき', 76, 44, (c) => {
    G.poly(c, [-34, -26, 34, -18, -10, -10]); G.fillO(c, '#ffffff', 2.5);
    G.poly(c, [-34, -26, 34, -18, -16, -36]); G.fillO(c, '#e8f2ff', 2.5);
    G.poly(c, [-10, -10, 34, -18, -14, -4]); G.fillO(c, '#bfe0f5', 2);
  }, ['paper']);
  T('toyhammer', 'ピコピコハンマー', 76, 76, (c) => {
    c.save(); c.translate(12, -4); c.rotate(-0.32); c.scale(0.92, 0.92);
    G.rr(c, -4, -54, 8, 56, 4); G.fillO(c, '#ffd23f', 2.5);
    G.rr(c, -24, -74, 48, 24, 8); G.fillO(c, '#ff5d6c', 3);
    c.strokeStyle = '#ffffff'; c.lineWidth = 2; for (const x of [-12, 0, 12]) { c.beginPath(); c.moveTo(x, -72); c.lineTo(x, -52); c.stroke(); }
    G.rr(c, -28, -76, 8, 28, 3); G.fillO(c, '#ffd23f', 2); G.rr(c, 20, -76, 8, 28, 3); G.fillO(c, '#ffd23f', 2);
    c.restore();
  });

  const FOOD_IDS = ['sushi', 'ramen', 'curry', 'ricebowl', 'omurice', 'takoyaki', 'yakisoba', 'gyoza', 'karaage', 'softcream', 'kakigori', 'cottoncandy', 'crepe', 'macaron', 'parfait', 'chocobar', 'popcorncup', 'hotdog', 'sandwich', 'tamagoyaki', 'mochi', 'dango', 'dorayaki', 'taiyaki', 'melon', 'peach', 'mikan', 'cherry', 'tomato', 'milk', 'ramune', 'friedegg', 'rollcake'];
  const TOOL_IDS = ['puzzle', 'kendama', 'spintop', 'jumprope', 'hulahoop', 'bugcage', 'flowerpot', 'paints', 'sketchbook', 'playkitchen', 'plushdog', 'plushcat', 'plushlion', 'plushchick', 'doll', 'minicar', 'alarmclock', 'comb', 'hairdryer', 'bedpillow', 'rainboots', 'schoolbag', 'dominoes', 'yoyo', 'origami', 'toothbrush', 'soap', 'archblock', 'telescope', 'hourglass', 'piggybank', 'globe', 'paperplane', 'toyhammer'];
  PT.ITEMS3 = FOOD_IDS.concat(TOOL_IDS);
  const fav = (sid, ids) => { const st = PT.stageById && PT.stageById(sid); if (st) st.favs = ids.concat(st.favs || []); };
  fav('restaurant', ['sushi', 'ramen', 'curry', 'ricebowl', 'omurice', 'gyoza', 'karaage', 'hotdog', 'sandwich', 'parfait']);
  fav('fest', ['takoyaki', 'yakisoba', 'cottoncandy', 'kakigori', 'ramune', 'taiyaki', 'softcream', 'dango']);
  fav('bakery', ['crepe', 'macaron', 'parfait', 'rollcake', 'chocobar', 'dorayaki']);
  fav('candyhouse', ['cottoncandy', 'macaron', 'chocobar', 'crepe', 'rollcake']);
  fav('cinema', ['popcorncup', 'hotdog', 'ramune']);
  fav('moon', ['mochi', 'dango']);
  fav('farm', ['milk', 'tomato', 'melon', 'flowerpot']);
  fav('home', ['puzzle', 'archblock', 'dominoes', 'alarmclock', 'bedpillow', 'plushdog', 'plushcat', 'doll', 'playkitchen', 'toothbrush', 'soap', 'comb', 'hairdryer']);
  fav('park', ['jumprope', 'hulahoop', 'spintop', 'kendama', 'bugcage', 'paperplane', 'rainboots', 'yoyo']);
  fav('kinder', ['schoolbag', 'sketchbook', 'paints', 'origami', 'puzzle', 'plushchick']);
  fav('toyland', ['minicar', 'toyhammer', 'kendama', 'spintop', 'dominoes', 'plushlion', 'yoyo']);
  fav('flower', ['flowerpot', 'bugcage']);
  fav('space', ['telescope', 'globe']);

  /* ================= あそび（リアクション） ================= */
  const W = PT.world, R = PT.R; if (!R || !R.h || !R.h.isP) return;
  const D = R.D, A = PT.audio, X = PT.FX;
  const { isP, isC, nearP, firstP } = R.h;
  const isFood3 = (e) => e && e.kind === 'prop' && FOOD_IDS.includes(e.type);
  const isTool3 = (e) => e && e.kind === 'prop' && TOOL_IDS.includes(e.type);
  const mouth = (ch) => ({ x: ch.x + (ch.flip ? -16 : 16) * ch.scale, y: ch.y - ch.z - 112 * ch.scale });
  const headY = (ch) => ch.y - ch.z - 150 * ch.scale;
  const hearts = (x, y, n = 5) => W.burst('heart', x, y, n, { up: true, sp: 0.12, max: 900, size: 12 });
  const spark = (x, y, col = '#ffd23f', n = 8) => W.burst('spark', x, y, n, { sp: 0.18, max: 700, size: 9, col, g: 0 });

  /* ---------- 発見 ---------- */
  D('i3_spicy', 'からーい！', 'カレーを たべたら くちから ぼわっと ひが でちゃった（でも おいしい）', ['curry', 'pon']);
  D('i3_hot', 'あつあつ ふーふー', 'たこやきや ぎょうざは あつあつ。ふーふー して たべよう', ['takoyaki', 'mimi']);
  D('i3_cold', 'つめたくて ぶるぶる', 'ソフトクリームを たべたら からだが ぶるぶる', ['softcream', 'lulu']);
  D('i3_kiin', 'あたま キーン！', 'かきごおりを いそいで たべると あたまが キーン', ['kakigori', 'gaku']);
  D('i3_mochi', 'おもち のびーる', 'おもちを たべたら びよーんと のびた', ['mochi', 'pyoko']);
  D('i3_fluffy', 'わたあめ ふわふわ', 'わたあめを たべたら からだも ふわっと ういた', ['cottoncandy', 'mimi']);
  D('i3_fizz', 'シュワシュワ ラムネ', 'ラムネを のんだら あわが ぷくぷく', ['ramune', 'choco']);
  D('i3_milk', 'ぎゅうにゅうで おおきく', 'ぎゅうにゅうを のんだら ぐーんと おおきく！？', ['milk', 'pon']);
  D('i3_popcorn', 'ポップコーン ポンポン', 'たべている あいだも ポン！ポン！', ['popcorncup', 'choco']);
  D('i3_wasabi', 'わさびで ツーン', 'おすしの わさびで はなが ツーン！', ['sushi', 'gaku']);
  D('i3_sweet', 'あまーい おやつ', 'あまい おやつで にっこり ハート', ['macaron', 'lulu']);
  D('i3_juicy', 'じゅわっと くだもの', 'くだものを かじると おつゆが じゅわっ', ['peach', 'moko']);
  D('i3_crunch', 'カリッ パリッ', 'からあげや ぎょうざは いい おと', ['karaage', 'pon']);
  D('i3_slurp', 'ずるずる めんるい', 'ラーメンや やきそばを ずるずる〜', ['ramen', 'moko']);
  D('i3_cherry', 'ふたごの さくらんぼ', 'さくらんぼは ふたつ。おともだちと わけっこ', ['cherry', 'mimi', 'lulu']);
  D('i3_omurice', 'ケチャップで ハート', 'オムライスに ハートを かいて いただきます', ['omurice', 'mimi']);
  D('i3_yummy', 'もぐもぐ ごはん', 'ごはんや サンドイッチで おなか いっぱい', ['sandwich', 'moko']);
  D('i3_curryrice', 'カレーライス かんせい', 'カレーと ごはんを あわせたら みんなで いただきます', ['curry', 'ricebowl']);
  D('i3_sushibelt', 'くるくる かいてんずし', 'おすしを ベルトに のせると くるくる まわるよ', ['sushi', 'sushibelt'], 'restaurant');
  D('i3_kitchen', 'おままごと', 'キッチンで とんとん。なにが できるかな？', ['playkitchen', 'mimi']);
  D('i3_jumprope', 'なわとび ぴょんぴょん', 'なわとびで 5かい とべたよ', ['jumprope', 'pyoko']);
  D('i3_kendama', 'けんだま かちん', 'たまが おさらに のった！', ['kendama', 'gaku']);
  D('i3_koma', 'こま くるくる', 'こまを まわすと いつまでも くるくる', ['spintop', 'pon']);
  D('i3_hoop', 'フラフープ', 'こしで くるくる フラフープ', ['hulahoop', 'lulu']);
  D('i3_bug', 'むし つかまえた', 'むしかごに てんとうむし。またね って にがして あげた', ['bugcage', 'gaku']);
  D('i3_sprout', 'おおきく なあれ', 'うえきばちの めが すこし のびた', ['flowerpot', 'mimi']);
  D('i3_bloom', 'おはなが さいた', 'じょうろで みずを あげたら おはなが ぱっ', ['flowerpot', 'wateringcan']);
  D('i3_draw', 'おえかき', 'スケッチブックに おうちと おひさま', ['sketchbook', 'lulu']);
  D('i3_paint', 'にじいろの え', 'えのぐや クレヨンで カラフルな え が かけた', ['sketchbook', 'paints']);
  D('i3_skypaint', 'そらに にじを かいた', 'えのぐの ふででで そらに おおきな にじ', ['paints', 'mimi']);
  D('i3_plush', 'ぬいぐるみ だっこ', 'いぬ・ねこ・ライオン・ひよこの ぬいぐるみを ぎゅっ', ['plushdog', 'plushcat']);
  D('i3_doll', 'おにんぎょう あそび', 'おにんぎょうさんを よしよし', ['doll', 'mimi']);
  D('i3_minicar', 'ミニカー ブーブー', 'ミニカーを はしらせて ブッブー！', ['minicar', 'pon']);
  D('i3_race', 'ミニカー レース', 'ミニカーが ふたつ あったら よーい どん！', ['minicar', 'minicar']);
  D('i3_alarm', 'ジリリリ！ おはよう', 'めざましどけいで みんな とびおきた', ['alarmclock', 'moko']);
  D('i3_comb', 'さらさら ヘア', 'くしで とかして さらさら', ['comb', 'mimi']);
  D('i3_dryer', 'ドライヤー ブオー', 'あったかい かぜで ふわふわ', ['hairdryer', 'lulu']);
  D('i3_salon', 'びよういんさん ごっこ', 'くしと ドライヤーで かわいく へんしん', ['comb', 'hairdryer']);
  D('i3_pillow', 'まくらで すやすや', 'まくらを おくと おひるね タイム', ['bedpillow', 'moko']);
  D('i3_puddle', 'みずたまり ぴちゃぴちゃ', 'ながぐつで みずたまりに ジャンプ', ['rainboots', 'pyoko']);
  D('i3_rainy', 'あめふり ごっこ', 'ながぐつと かさで あめの ひも たのしい', ['rainboots', 'umbrella']);
  D('i3_school', 'いってきます', 'ランドセルを しょって がっこうへ', ['schoolbag', 'gaku']);
  D('i3_domino', 'ドミノ たおし', 'ぱたぱた ぱたーん！', ['dominoes', 'choco']);
  D('i3_yoyo', 'ヨーヨー びよーん', 'ヨーヨーが のびたり もどったり', ['yoyo', 'pon']);
  D('i3_crane', 'おりづるが とんだ', 'おりがみの つるが そらへ', ['origami', 'mimi']);
  D('i3_teeth', 'はみがき ピカピカ', 'しゃかしゃか みがいて ピカピカ', ['toothbrush', 'lulu']);
  D('i3_soap', 'あわあわ せっけん', 'せっけんで あわが いっぱい', ['soap', 'choco']);
  D('i3_arch', 'つみきの トンネル', 'アーチの つみきを ぴょーんと ジャンプ', ['archblock', 'pyoko']);
  D('i3_tower', 'つみきの タワー', 'つみきを たかく たかく…ガラガラ！', ['archblock', 'blocks']);
  D('i3_puzzle1', 'パズル あそび', 'あと ひとつ たりない…？', ['puzzle', 'gaku']);
  D('i3_puzzle', 'パズル かんせい', 'パズルを ふたつ あわせたら かんせい！', ['puzzle', 'puzzle']);
  D('i3_telescope', 'ぼうえんきょう', 'のぞいたら おほしさまが みえた', ['telescope', 'gaku']);
  D('i3_hourglass', 'すなどけい', 'さらさら おちる すなを いっしょに かぞえよう', ['hourglass', 'choco']);
  D('i3_piggy', 'ちょきん チャリン', 'ちょきんばこに おかねを いれたよ', ['piggybank', 'moko']);
  D('i3_globe', 'せかい いっしゅう', 'ちきゅうぎを くるくる まわしたよ', ['globe', 'gaku']);
  D('i3_paperplane', 'かみひこうき', 'かみひこうきが すいーっと とんだ', ['paperplane', 'pon']);
  D('i3_hammer', 'ピコッ！', 'ピコピコハンマーで ピコッ！ みんな わらっちゃう', ['toyhammer', 'pon']);

  /* ---------- えんしゅつ ---------- */
  const flames = (ch) => {
    const dir = ch.flip ? -1 : 1;
    W.special({ max: 1400, draw(c, f) {
      const m = mouth(ch);
      for (let i = 0; i < 6; i++) {
        const kk = ((f.life / 700) + i / 6) % 1; if (f.life < i * 90) continue;
        const x = m.x + dir * (14 + kk * 150), y = m.y - kk * 18 + Math.sin(i * 2 + f.life * 0.02) * 6, r = 15 * (1 - kk * 0.45);
        c.globalAlpha = Math.max(0, 1 - kk) * Math.min(1, (f.max - f.life) / 300);
        c.beginPath(); c.moveTo(x, y - r * 1.7); c.quadraticCurveTo(x + r, y - r * 0.2, x, y + r * 0.8); c.quadraticCurveTo(x - r, y - r * 0.2, x, y - r * 1.7); c.fillStyle = '#ff7a3c'; c.fill();
        c.beginPath(); c.moveTo(x, y - r * 0.9); c.quadraticCurveTo(x + r * 0.5, y, x, y + r * 0.5); c.quadraticCurveTo(x - r * 0.5, y, x, y - r * 0.9); c.fillStyle = '#ffe24a'; c.fill();
      }
      c.globalAlpha = 1;
    } });
  };
  const puff = (ch, n = 6) => { const m = mouth(ch); W.burst('smoke', m.x, m.y - 10, n, { up: true, sp: 0.08, max: 900, size: 14, col: '#ffffff', g: 0 }); };
  const stretch = (ch) => {
    const dir = ch.flip ? -1 : 1;
    W.special({ max: 1600, draw(c, f) {
      const k = f.life / f.max, s = Math.sin(k * Math.PI); const m = mouth(ch);
      const ex = m.x + dir * (16 + s * 130), ey = m.y + 14 + s * 24;
      c.lineCap = 'round'; c.strokeStyle = '#d8ccb0'; c.lineWidth = 14 - s * 6 + 4; c.beginPath(); c.moveTo(m.x, m.y + 4); c.quadraticCurveTo((m.x + ex) / 2, Math.max(m.y, ey) + 12 * s, ex, ey); c.stroke();
      c.strokeStyle = '#fffaf0'; c.lineWidth = 14 - s * 6; c.stroke();
      G.circ(c, ex, ey, 13); G.fillO(c, '#fffaf0', 2.5);
    } });
  };
  const shake = (ch, ms = 1000) => { const x0 = ch.x; R.tween(ch, ms, (k) => { ch.x = x0 + Math.sin(k * 70) * 5 * (1 - k * 0.5); }, () => { ch.x = x0; }); };
  const floatUp = (ch, h = 70, ms = 1800) => R.tween(ch, ms, (k) => { ch.z = Math.sin(k * Math.PI) * h; ch.pose = 'fly'; ch.poseT = k * ms; }, () => { ch.z = 0; ch.pose = 'idle'; });
  const growBig = (ch, ms = 1800) => { const s0 = ch.scale; R.tween(ch, ms, (k) => { ch.scale = s0 * (1 + Math.sin(k * Math.PI) * 0.3); }, () => { ch.scale = W.depthScale(ch.y); }); };

  /* ---------- たべる ---------- */
  const FOOD = {
    sushi: ['wasabi', 'おすし だいすき'], ramen: ['slurp', 'ずるずる〜'], curry: ['spicy', 'からーい！'], ricebowl: ['yummy', 'ごはん おいしい！'],
    omurice: ['omurice', 'ふわとろ！'], takoyaki: ['hot', 'あつあつ たこやき'], yakisoba: ['slurp', 'ソースの におい〜'], gyoza: ['crunch', 'パリッ！'],
    karaage: ['crunch', 'カリッ！'], softcream: ['cold', 'つめたーい！'], kakigori: ['kiin', 'いちごあじ！'], cottoncandy: ['fluffy', 'ふわふわ〜'],
    crepe: ['sweet', 'クリーム たっぷり'], macaron: ['sweet', 'かわいい おかし'], parfait: ['sweet', 'いちばん うえは さくらんぼ'], chocobar: ['sweet', 'とろける〜'],
    popcorncup: ['popcorn', 'ポン！ポン！'], hotdog: ['yummy', 'ケチャップ たっぷり'], sandwich: ['yummy', 'ピクニック みたい'], tamagoyaki: ['yummy', 'ふわふわ たまご'],
    mochi: ['mochi', 'のびーる！'], dango: ['sweet', 'もちもち〜'], dorayaki: ['sweet', 'あんこ たっぷり'], taiyaki: ['hot', 'あたまから たべちゃお'],
    melon: ['juicy', 'あまーい メロン'], peach: ['juicy', 'じゅわ〜'], mikan: ['juicy', 'すっぱ あまい！'], cherry: ['cherry', 'ふたご！'],
    tomato: ['juicy', 'まっかで おいしい'], milk: ['milk', 'ごくごく'], ramune: ['fizz', 'シュワシュワ〜！'], friedegg: ['yummy', 'めだまやき とろーり'], rollcake: ['sweet', 'くるくる ケーキ'],
  };
  const JUICE = { melon: '#b8f08a', peach: '#ffc8d8', mikan: '#ffc04a', tomato: '#ff6a5a' };
  const EAT = {
    spicy: (ch, a, ty) => a.face('surprise', 900).do(() => { flames(ch); A.sfx('whoosh'); W.bigText('からーい！', ch.x, headY(ch) - 40, '#ff5d3c'); }).say('からーい！ ひが でちゃう〜', 'sweat', 1500, 'wow').jump(50, 450).face('laugh', 1400).say('でも おいしい！', 'heart', 1300, 'yay').do(() => R.found('i3_spicy')),
    hot: (ch, a, ty) => a.do(() => puff(ch)).say('あつっ！ ふーふー', ty, 1400, 'hmm').do(() => puff(ch, 4)).face('laugh', 1200).say('あつあつ おいしい！', 'heart', 1300, 'yay').do(() => R.found('i3_hot')),
    cold: (ch, a, ty) => a.say('つめたーい！', 'sweat', 1100, 'wow').do(() => { spark(ch.x, headY(ch), '#bfe9ff', 10); shake(ch, 1000); }).say('ぶるぶる…', 'sweat', 1100, 'hmm').face('laugh', 1200).say('でも おいしい！', 'heart', 1200, 'yay').do(() => R.found('i3_cold')),
    kiin: (ch, a, ty) => a.do(() => { A.sfx('zap'); W.burst('star', ch.x, headY(ch), 6, { sp: 0.15, max: 800 }); W.bigText('キーン！', ch.x, headY(ch) - 40, '#4c9be8'); }).pose('think', 1000).say('あたま キーン！', '!', 1300, 'wow').face('laugh', 1200).say('つめたくて おいしい', 'heart', 1300, 'yay').do(() => R.found('i3_kiin')),
    mochi: (ch, a, ty) => a.do(() => { stretch(ch); A.sfx('boing'); }).say('のびーる！', ty, 1600, 'yay').face('laugh', 1200).say('もちもち〜', 'heart', 1200, 'laugh').do(() => R.found('i3_mochi')),
    fluffy: (ch, a, ty) => a.face('love', 1800).say('ふわふわ〜', ty, 1200, 'yay').do(() => { A.sfx('magic'); W.burst('spark', ch.x, ch.y - 80, 10, { sp: 0.15, max: 900, col: '#ffb3d1', g: 0 }); floatUp(ch, 70, 1800); }).say('からだも ういちゃった！', 'heart', 1400, 'laugh').do(() => R.found('i3_fluffy')),
    fizz: (ch, a, ty) => a.do(() => { A.sfx('bubble'); W.addBubbles(ch.x, ch.y - 40, 8); }).say('シュワシュワ〜！', ty, 1400, 'wow').jump(30, 400).face('laugh', 1200).say('あわが いっぱい', 'heart', 1200, 'yay').do(() => R.found('i3_fizz')),
    milk: (ch, a, ty) => a.say('ごくごく…ぷはー！', ty, 1300, 'yay').do(() => { A.sfx('boing'); growBig(ch, 1800); spark(ch.x, headY(ch), '#ffffff', 8); }).say('おおきく なった！？', '!', 1500, 'wow').pose('cheer', 800).do(() => R.found('i3_milk')),
    popcorn: (ch, a, ty) => a.do(() => { for (let i = 0; i < 6; i++) W.after(i * 200, () => { A.sfx('pop'); W.burst('spark', ch.x + PT.rand(-60, 60), headY(ch) + PT.rand(-30, 20), 4, { sp: 0.18, max: 600, size: 11, col: '#fff3c8' }); }); }).say('ポン！ ポン！', ty, 1400, 'wow').face('laugh', 1200).say('とまらない〜', 'heart', 1200, 'laugh').do(() => R.found('i3_popcorn')),
    wasabi: (ch, a, ty) => a.wait(300).face('surprise', 900).say('…ツーン！', '!', 1100, 'wow').jump(90, 520).do(() => { W.burst('drop', ch.x, headY(ch) + 20, 6, { sp: 0.15, max: 700, col: '#9fd8ff' }); W.bigText('ツーン！', ch.x, headY(ch) - 40, '#58b44e'); }).face('laugh', 1200).say('わさび はいってた〜', 'sweat', 1400, 'laugh').do(() => R.found('i3_wasabi')),
    sweet: (ch, a, ty, line) => a.face('love', 1500).do(() => { hearts(ch.x, headY(ch), 6); A.sfx('sparkle'); }).say('あまーい！', ty, 1200, 'yay').say(line, 'heart', 1300, 'yay').do(() => R.found('i3_sweet')),
    juicy: (ch, a, ty, line) => a.do(() => { const m = mouth(ch); W.burst('drop', m.x, m.y, 8, { sp: 0.18, max: 700, col: JUICE[ty] || '#ffc04a' }); A.sfx('splash'); }).say('じゅわ〜', ty, 1100, 'wow').face('laugh', 1200).say(line, 'heart', 1300, 'yay').do(() => R.found('i3_juicy')),
    crunch: (ch, a, ty, line) => a.sfx('munch').do(() => { W.bigText(line, ch.x, headY(ch) - 40, '#d98a2e'); W.burst('star', ch.x, headY(ch), 4, { sp: 0.12, max: 700 }); }).wait(300).sfx('munch').face('laugh', 1200).say('いい おと〜', ty, 1300, 'yay').do(() => R.found('i3_crunch')),
    slurp: (ch, a, ty, line) => a.sfx('munch').do(() => puff(ch, 4)).say(line, ty, 1400, 'talk').sfx('munch').face('laugh', 1200).say('おなか いっぱい', 'heart', 1300, 'yay').do(() => R.found('i3_slurp')),
    omurice: (ch, a, ty, line) => a.do(() => { hearts(ch.x, headY(ch), 8); A.sfx('sparkle'); }).say('ケチャップで ハート！', 'heart', 1400, 'yay').face('laugh', 1000).say(line, ty, 1200, 'yay').do(() => R.found('i3_omurice')),
    yummy: (ch, a, ty, line) => a.face('laugh', 1200).say(line, ty, 1400, 'yay').do(() => { spark(ch.x, headY(ch)); }).pose('cheer', 700).do(() => R.found('i3_yummy')),
    cherry: (ch, a, ty, line) => a.face('laugh', 1200).say('あまずっぱい！', ty, 1300, 'yay').do(() => R.found('i3_cherry')),
  };
  const eat3 = (ch, food) => {
    if (!food || food.removed) return;
    const ty = food.type, [kind, line] = FOOD[ty];
    W.remove(food);
    if (kind === 'cherry') {
      const fr = R.free(ch.x, ch.y, [ch], 900)[0];
      if (fr) {
        const p = R.besides(ch, fr.x < ch.x ? -1 : 1, 100);
        R.claim(fr, 5000).go(p.x, p.y, true).look(ch.x).wait(900).face('eat', 1200).hold('cherry').pose('eat', 1200).unhold().face('laugh', 1000).say('ありがとう！', 'heart', 1300, 'yay');
        R.claim(ch, 5000).look(fr.x).hold('cherry').say('ふたつ あるから はんぶんこ！', 'cherry', 1500, 'yay').pose('hold', 700).face('eat', 1200).pose('eat', 1200).unhold().do(() => { hearts((ch.x + fr.x) / 2, headY(ch), 8); A.sfx('sparkle'); R.found('i3_cherry'); R.found('d_eat'); }).face('laugh', 1000);
        return;
      }
    }
    const a = R.claim(ch, 7500).look(food.x).hold(ty).face('eat', 1300).pose('eat', 1300).sfx('munch').unhold();
    EAT[kind](ch, a, ty, line);
    a.do(() => R.found('d_eat'));
    if (Math.random() < 0.5) R.audience(ch.x, ch.y, [ch], kind === 'spicy' || kind === 'wasabi' || kind === 'mochi' ? 'laugh' : 'cheer', 1, 2400);
  };
  R.eat3 = eat3;
  R.add({ id: 'i3-food-char', pri: 78, test: (c) => (isFood3(c.e) && isC(c.tgt) ? c.tgt : null), run(c, ch) { eat3(ch, c.e); } });
  R.add({ id: 'i3-food-floor', pri: 31, test: (c) => (isFood3(c.e) ? R.one(c.e.x, c.e.y) : null),
    run(c, ch) { const f = c.e; R.claim(ch, 6000).to(f, f.x < ch.x ? 50 : -50, 4, true).look(f.x).face('surprise', 600).say('おいしそう！', f.type, 1100, 'wow').do(() => eat3(ch, f)); } });
  R.add({ id: 'i3-food-tap', on: 'tapprop', pri: 35, test: (c) => (isFood3(c.e) ? R.one(c.e.x, c.e.y) : null),
    run(c, ch) { const f = c.e; f.wobbleUntil = W.t + 500; A.sfx('tap'); R.claim(ch, 6000).to(f, f.x < ch.x ? 50 : -50, 4, true).look(f.x).say('たべても いい？', f.type, 1100, 'talk').do(() => eat3(ch, f)); } });

  /* カレー ＋ ごはん → カレーライス */
  const pairOf = (e, a, b, r = 320) => {
    if (isP(e, a)) { const q = firstP(e.x, e.y, r, b, e); return q ? [e, q] : null; }
    if (isP(e, b)) { const q = firstP(e.x, e.y, r, a, e); return q ? [q, e] : null; }
    return null;
  };
  const curryPlate = (x, y, ms) => W.special({ max: ms, draw(c, f) {
    const k = Math.min(1, f.life / 300), out = Math.min(1, (f.max - f.life) / 300); c.save(); c.translate(x, y); c.scale(k * out, k * out);
    G.ell(c, 0, -8, 52, 12); G.fillO(c, '#ffffff', 3);
    G.blob(c, [-44, -12, -36, -30, -10, -34, 0, -14]); G.fillO(c, '#ffffff', 2.5);
    G.blob(c, [-6, -12, 2, -30, 26, -32, 44, -14]); G.fillO(c, '#c98a2e', 2.5);
    dot(c, 12, -22, 5, '#ff8a2e'); dot(c, 28, -20, 5, '#ffe08a');
    steam(c, W.t, 10, -40); c.restore();
  } });
  R.add({ id: 'i3-curryrice', pri: 72, test: (c) => pairOf(c.e, 'curry', 'ricebowl'),
    run(c, [cu, rb]) {
      const x = (cu.x + rb.x) / 2, y = Math.max(cu.y, rb.y);
      const cook = R.one(x, y);
      const serve = () => {
        if (cu.removed || rb.removed) return;
        W.remove(cu); W.remove(rb); W.poof(x, y - 30); A.sfx('sparkle'); curryPlate(x, y, 7000);
        const list = R.avail(x, y, [], 1600).slice(0, 4);
        list.forEach((ch, i) => { const p = R.ring(x, y, i, list.length, 140); R.claim(ch, 7000).go(p.x, p.y, true).look(x).pose('sit', 900).say(i === 0 ? 'いただきます！' : '', i === 0 ? 'heart' : null, 1200, 'yay').face('eat', 1400).pose('eat', 1400).do(() => { if (i === 1) { flames(ch); A.sfx('whoosh'); } }).face('laugh', 1200).say(i === 1 ? 'からーい！ でも おいしい' : i === 2 ? 'カレーライス だいすき' : '', null, 1400, 'yay'); });
        W.after(4500, () => { R.found('i3_curryrice'); R.found('d_meal'); });
      };
      if (cook) R.claim(cook, 4000).to(rb, rb.x < cook.x ? 70 : -70, 4, true).look(rb.x).say('ごはんに カレーを かけて…', 'curry', 1500, 'talk').pose('hold', 700).do(serve);
      else serve();
    } });
  /* おすしを かいてんずしの ベルトに */
  R.add({ id: 'i3-sushibelt', pri: 82, stage: 'restaurant', test: (c) => (isP(c.e, 'sushi') && c.tgt && c.tgt.kind === 'fix' && c.tgt.type === 'sushibelt' ? c.tgt : null),
    run(c, belt) {
      const s = c.e, x0 = belt.x - belt.w * 0.38, x1 = belt.x + belt.w * 0.38, by = belt.y - 6;
      s.x = x0; s.y = by; s.z = 60; s.scale = W.depthScale(by); A.sfx('ding');
      R.tween({}, 3200, (k) => { if (!s.removed) { s.x = PT.lerp(x0, x1, k); s.wobbleUntil = W.t + 50; } }, () => {
        if (s.removed) return; s.z = 0; const p = W.clampFloor(s.x, belt.y + 40); s.x = p.x; s.y = p.y; s.scale = W.depthScale(s.y);
        const ch = R.one(s.x, s.y); if (ch) { R.claim(ch, 3000).to(s, -50, 4, true).say('これに しよう！', 'sushi', 1100, 'yay').do(() => eat3(ch, s)); }
        R.found('i3_sushibelt');
      });
      R.audience(belt.x, belt.y, [], 'wow', 2, 300);
    } });

  /* ---------- どうぐ：かりて あそんで もどす ---------- */
  const back = (ch, p) => {
    if (ch.holdType === p.type) ch.holdType = null;
    if (p.removed || !p.hidden) return;
    p.hidden = false; const q = W.clampFloor(ch.x + (ch.flip ? -60 : 60), ch.y + 4); p.x = q.x; p.y = q.y; p.z = 0; p.scale = W.depthScale(p.y); p.pop = W.t;
  };
  const borrow = (ch, p, ms = 6000) => {
    const a = R.claim(ch, ms + 2500);
    if (Math.hypot(ch.x - p.x, ch.y - p.y) > 30) a.to(p, p.x < ch.x ? 50 : -50, 4, true);
    a.look(p.x).do(() => { if (!p.removed) { p.hidden = true; ch.holdType = p.type; } });
    W.after(ms + 6000, () => back(ch, p));
    return a;
  };
  const visit = (ch, p, ms = 6000, dx) => R.claim(ch, ms).to(p, dx !== undefined ? dx : (p.x < ch.x ? 80 : -80), 4, true).look(p.x);
  const special = (o) => W.special(o);

  const ropeFx = (ch, ms) => special({ max: ms, draw(c, f) {
    const s = ch.scale, ph = f.life * 0.012, hy = ch.y - ch.z - 70 * s;
    const cy = hy + Math.cos(ph) * 100 * s;
    c.strokeStyle = '#58b9f0'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(ch.x - 34 * s, hy); c.quadraticCurveTo(ch.x, cy + (Math.cos(ph) > 0 ? 40 * s : -40 * s), ch.x + 34 * s, hy); c.stroke();
  } });
  const hoopFx = (ch, ms) => special({ max: ms, draw(c, f) {
    const s = ch.scale, ph = f.life * 0.02, y = ch.y - ch.z - 62 * s + Math.sin(ph * 2) * 3;
    const cols = ['#ff5d78', '#ffd23f', '#58c46b', '#58b9f0', '#b39ae8'];
    cols.forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 6; c.beginPath(); c.ellipse(ch.x + Math.cos(ph) * 10 * s, y, 56 * s, 13 * s, 0, (i / 5) * PT.TAU + ph, ((i + 1) / 5) * PT.TAU + ph); c.stroke(); });
  } });
  const kendamaBall = (ch) => special({ max: 900, draw(c, f) {
    const k = f.life / f.max, s = ch.scale, dir = ch.flip ? -1 : 1;
    const hx = ch.x + dir * 20 * s, hy = ch.y - ch.z - 70 * s;
    const x = hx + dir * (1 - k) * 30 * s, y = hy - 30 * s - Math.sin(k * Math.PI) * 120 * s;
    G.circ(c, x, y, 10 * s); G.fillO(c, '#ff5d6c', 2.5);
  } });
  const butterfly = (x0, y0, x1, y1, ms) => special({ max: ms, draw(c, f) {
    const k = PT.easeInOut(f.life / f.max), x = PT.lerp(x0, x1, k) + Math.sin(f.life * 0.008) * 30, y = PT.lerp(y0, y1, k) + Math.sin(f.life * 0.013) * 16;
    const fl = Math.abs(Math.sin(f.life * 0.03));
    c.save(); c.translate(x, y);
    for (const sd of [-1, 1]) { G.ell(c, sd * 9 * (0.4 + fl * 0.6), -6, 9 * (0.4 + fl * 0.6), 10, sd * 0.3); G.fillO(c, '#ffb3d1', 2); G.ell(c, sd * 7 * (0.4 + fl * 0.6), 6, 6 * (0.4 + fl * 0.6), 7); G.fillO(c, '#ffd23f', 2); }
    G.ell(c, 0, 0, 2.5, 9); c.fillStyle = '#3a3550'; c.fill(); c.restore();
  } });
  const rainFx = (x, y, ms) => special({ max: ms, draw(c, f) {
    const a = Math.min(1, f.life / 400, (f.max - f.life) / 400);
    c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(120,140,190,.25)'; G.ell(c, x, y - 380, 260, 50); c.fill();
    G.ell(c, x - 120, y - 400, 110, 46); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill(); G.ell(c, x + 80, y - 410, 130, 50); c.fill(); G.ell(c, x, y - 430, 100, 46); c.fill();
    c.strokeStyle = 'rgba(120,180,240,.8)'; c.lineWidth = 3; c.lineCap = 'round';
    for (let i = 0; i < 22; i++) { const xx = x - 240 + ((i * 53) % 480), yy = y - 360 + (((f.life * 0.6) + i * 97) % 360); c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx - 4, yy + 16); c.stroke(); }
    c.fillStyle = 'rgba(120,180,240,.35)'; G.ell(c, x, y + 10, 140, 20); c.fill();
    c.restore();
  } });
  const puddleFx = (x, y, ms) => special({ max: ms, draw(c, f) { const a = Math.min(1, f.life / 300, (f.max - f.life) / 400); c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(120,180,240,.55)'; G.ell(c, x, y + 4, 90, 18); c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; G.ell(c, x, y + 4, 30 + (f.life * 0.05) % 60, 6 + ((f.life * 0.05) % 60) * 0.2); c.stroke(); c.restore(); } });
  const towerFx = (x, y, ms) => special({ max: ms, draw(c, f) {
    const n = Math.min(9, Math.floor(f.life / 260) + 1), fall = f.life > ms - 1200 ? (f.life - (ms - 1200)) / 1200 : 0;
    const cols = ['#ff8a5c', '#ffd23f', '#58c46b', '#58b9f0', '#b39ae8', '#ff8fab'];
    for (let i = 0; i < n; i++) {
      const bx = x + (i % 2 ? 4 : -4) + fall * (i - 4) * 30 * (i % 2 ? 1 : -1), by = y - 30 - i * 30 + fall * fall * i * 34, rot = fall * (i % 2 ? 1 : -1) * i * 0.3;
      c.save(); c.translate(bx, by); c.rotate(rot); c.globalAlpha = 1 - fall * 0.6;
      if (i === n - 1 && n === 9) { G.poly(c, [-18, 15, 18, 15, 0, -16]); G.fillO(c, '#ff5d6c', 2.5); }
      else { G.rr(c, -18, -15, 36, 30, 4); G.fillO(c, cols[i % cols.length], 2.5); }
      c.restore();
    }
    c.globalAlpha = 1;
  } });
  const coinFx = (x0, y0, x1, y1) => special({ max: 700, draw(c, f) { const k = f.life / f.max; const x = PT.lerp(x0, x1, k), y = PT.lerp(y0, y1, k) - Math.sin(k * Math.PI) * 80; G.ell(c, x, y, 9 * Math.abs(Math.cos(f.life * 0.02)) + 1.5, 9); G.fillO(c, '#ffd23f', 2); } });

  const PLUSH_LINE = { plushdog: ['わんわん！', 'いいこ いいこ'], plushcat: ['にゃーん', 'ふわふわ〜'], plushlion: ['がおー…じゃなくて ガオ♪', 'やさしい ライオンさん'], plushchick: ['ぴよぴよ', 'ちいさくて かわいい'] };
  const PLAY = {
    jumprope(ch, p) {
      const a = borrow(ch, p, 7000).say('なわとび するよ！', 'jumprope', 1100, 'yay').do(() => ropeFx(ch, 3400));
      for (let i = 0; i < 5; i++) a.sfx('jump').jump(55, 520);
      a.face('laugh', 1200).say('5かい とべた！', 'star', 1400, 'yay').pose('cheer', 800).do(() => { back(ch, p); R.found('i3_jumprope'); });
      R.audience(ch.x, ch.y, [ch], 'cheer', 2, 2600); R.mimic(ch, 'jump', 1400, 'わたしも ぴょん！');
    },
    kendama(ch, p) {
      borrow(ch, p, 5000).say('けんだま いくよ〜', 'kendama', 1100, 'talk').pose('hold', 300).do(() => kendamaBall(ch)).wait(900)
        .do(() => { A.sfx('ding'); W.bigText('かちん！', ch.x, headY(ch) - 30, '#ff5d6c'); spark(ch.x, ch.y - 90 * ch.scale); }).face('laugh', 1200).say('のった〜！', 'star', 1400, 'yay').pose('cheer', 800)
        .do(() => { back(ch, p); R.found('i3_kendama'); });
      R.audience(ch.x, ch.y, [ch], 'wow', 1, 2200);
    },
    spintop(ch, p) {
      visit(ch, p, 6000, p.x < ch.x ? 70 : -70).say('こま まわすよ！', 'spintop', 1100, 'yay').pose('point', 500)
        .do(() => { p.spin = W.t + 5000; A.sfx('whoosh'); spark(p.x, p.y - 30, '#ffffff'); }).say('くるくる〜！', 'spintop', 1500, 'wow').face('laugh', 1500).pose('cheer', 900).do(() => R.found('i3_koma'));
      R.audience(p.x, p.y, [ch], 'wow', 2, 1400);
    },
    hulahoop(ch, p) {
      borrow(ch, p, 6000).do(() => { ch.holdType = null; hoopFx(ch, 3200); A.sfx('boing'); }).say('くるくる フラフープ！', 'hulahoop', 1200, 'yay').pose('dance', 1000).pose('dance', 1000).pose('spin', 900).face('laugh', 1000)
        .say('まわった〜！', 'star', 1200, 'yay').do(() => { back(ch, p); R.found('i3_hoop'); });
      R.audience(ch.x, ch.y, [ch], 'cheer', 1, 1800);
    },
    bugcage(ch, p) {
      const tx = W.clampFloor(ch.x + PT.rand(-200, 200), ch.y + PT.rand(-30, 30));
      borrow(ch, p, 9000).say('むし さがしに いこう', 'bugcage', 1200, 'talk').go(tx.x, tx.y).look(tx.x + 100)
        .do(() => butterfly(ch.x + 220, ch.y - 280, ch.x + 20, ch.y - 90, 1500)).pose('peek', 1500).do(() => { A.sfx('pop'); p.bug = 1; })
        .say('てんとうむし つかまえた！', 'star', 1500, 'yay').do(() => { back(ch, p); }).wait(1500).say('またね〜', 'heart', 1200, 'yay')
        .do(() => { p.bug = 0; butterfly(p.x, p.y - 40, p.x - 260, p.y - 420, 1600); R.found('i3_bug'); });
    },
    flowerpot(ch, p) {
      visit(ch, p, 5000, p.x < ch.x ? 60 : -60).pose('sit', 700).say('おおきく なあれ〜', 'heart', 1500, 'talk')
        .do(() => { p.grow = 1; p.pop = W.t; A.sfx('sparkle'); spark(p.x, p.y - 60, '#7bd36a'); }).face('laugh', 1000).say('めが のびた！', 'flowerpot', 1300, 'yay').do(() => R.found('i3_sprout'));
    },
    paints(ch, p) {
      borrow(ch, p, 6000).say('おおきな え を かくよ', 'paints', 1300, 'talk').pose('point', 1100)
        .do(() => { X.rainbow(4500); A.sfx('magic'); }).say('そらに にじを かいちゃった！', 'star', 1600, 'yay').pose('cheer', 900).do(() => { back(ch, p); R.found('i3_skypaint'); });
      R.audience(ch.x, ch.y, [ch], 'wow', 2, 1800);
    },
    sketchbook(ch, p) {
      visit(ch, p, 6000, p.x < ch.x ? 60 : -60).pose('sit', 500).say('なに かこうかな？', 'sketchbook', 1300, 'hmm').pose('sit', 1200)
        .do(() => { p.drawn = Math.max(1, p.drawn || 0); p.pop = W.t; A.sfx('sparkle'); }).face('laugh', 1000).say('おうちと おひさま！', 'sketchbook', 1500, 'yay').do(() => R.found('i3_draw'));
    },
    playkitchen(ch, p) {
      visit(ch, p, 7000, p.x < ch.x ? 90 : -90).say('おりょうり とんとん♪', 'playkitchen', 1300, 'yay').pose('hold', 900)
        .do(() => { p.cook = W.t + 2400; A.sfx('bubble'); }).pose('hold', 1400).say('できあがり！ どうぞ', 'heart', 1300, 'yay')
        .do(() => {
          A.sfx('ding'); const ty = PT.pick(['omurice', 'curry', 'friedegg', 'sandwich', 'ramen', 'tamagoyaki', 'takoyaki']);
          const q = W.clampFloor(p.x + (ch.x < p.x ? -110 : 110), p.y + 20); const f = W.addProp(ty, q.x, q.y); if (f) { f.pop = W.t; spark(f.x, f.y - 30); }
          R.found('i3_kitchen');
          const g = f && R.free(f.x, f.y, [ch], 1400)[0]; if (g) R.claim(g, 5000).to(f, -50, 4, true).say('いただきます！', ty, 1100, 'yay').do(() => eat3(g, f));
        });
    },
    plush(ch, p) {
      const [l1, l2] = PLUSH_LINE[p.type] || ['ぎゅー', 'かわいい'];
      borrow(ch, p, 5000).pose('hug', 1300).face('love', 1500).do(() => { hearts(ch.x, headY(ch), 6); A.sfx('tickle'); }).say(l1, 'heart', 1300, 'laugh')
        .jump(30, 400).say(l2, p.type, 1300, 'yay').do(() => { back(ch, p); p.wobbleUntil = W.t + 1200; R.found('i3_plush'); });
    },
    doll(ch, p) {
      borrow(ch, p, 5000).pose('sit', 600).pose('hug', 1200).face('love', 1400).say('おにんぎょうさん いいこ いいこ', 'doll', 1500, 'talk')
        .do(() => { hearts(ch.x, headY(ch), 5); A.sfx('sparkle'); }).say('いっしょに あそぼうね', 'heart', 1300, 'yay').do(() => { back(ch, p); R.found('i3_doll'); });
    },
    minicar(ch, p) {
      visit(ch, p, 6000, p.x < ch.x ? 50 : -50).pose('sit', 500).say('ブッブー！', 'minicar', 1000, 'yay')
        .do(() => {
          const dir = ch.x < p.x ? 1 : -1, x0 = p.x, x1 = W.clampFloor(p.x + dir * 360, p.y).x; p.drive = W.t + 1600; A.sfx('whoosh');
          R.tween({}, 1600, (k) => { if (!p.removed) p.x = PT.lerp(x0, x1, PT.easeOut(k)); });
        }).wait(1500).face('laugh', 1000).say('はやーい！', 'star', 1200, 'yay').do(() => R.found('i3_minicar'));
    },
    alarmclock(ch, p) {
      p.ring = W.t + 2600; for (let i = 0; i < 6; i++) W.after(i * 400, () => A.sfx('bell'));
      W.bigText('ジリリリ！', p.x, p.y - 120, '#ff6f61');
      R.chars().forEach((o, i) => {
        if (!W.isFree(o) && o.rest !== 'sleep' && !o.riding) return;
        if (o.rest === 'sleep' && !o.riding) { o.rest = 'idle'; o.z = 0; o.stay = false; }
        W.after(300 + i * 120, () => { if (!R.chars().includes(o)) return; R.claim(o, 2400).face('surprise', 700).jump(70, 480).say(PT.pick(['おきた！', 'おはよう！', 'あさだ〜！']), '!', 1300, 'wow').face('laugh', 900); });
      });
      W.after(2600, () => R.found('i3_alarm'));
    },
    comb(ch, p, tgt) {
      const who = tgt || ch;
      const fn = () => R.claim(who, 4000).face('love', 1400).do(() => { spark(who.x, headY(who) - 10, '#ffffff', 10); A.sfx('sparkle'); }).say('とかし とかし', 'comb', 1300, 'talk').face('laugh', 1000).say('さらさら〜', 'heart', 1300, 'yay').do(() => R.found('i3_comb'));
      if (who !== ch) borrow(ch, p, 5000).to(who, who.x < ch.x ? 70 : -70, 2, true).look(who.x).pose('hold', 1300).say('かみを とかして あげる', 'comb', 1300, 'talk').do(() => back(ch, p));
      else borrow(ch, p, 4500).pose('hold', 400).do(() => W.after(1700, () => back(ch, p)));
      fn();
    },
    hairdryer(ch, p) {
      borrow(ch, p, 5000).say('ブオー！', 'hairdryer', 1200, 'yay').do(() => { A.sfx('whoosh'); for (let i = 0; i < 4; i++) W.after(i * 200, () => W.burst('smoke', ch.x + (ch.flip ? -40 : 40), headY(ch), 3, { sp: 0.15, max: 600, size: 10, col: '#ffe0f0', g: 0 })); }).pose('spin', 900)
        .face('laugh', 1200).say('あったか〜い', 'heart', 1300, 'laugh').do(() => { back(ch, p); R.found('i3_dryer'); });
    },
    bedpillow(ch, p) {
      visit(ch, p, 6000, 0).do(() => { ch.rest = 'sleep'; }).pose('sleep', 2600).say('すやすや…', 'zzz', 1500, 'talk')
        .do(() => { W.burst('zzz', ch.x, headY(ch), 3, { up: true, sp: 0.06, max: 1400, g: 0 }); }).pose('sleep', 1200)
        .do(() => { ch.rest = 'idle'; }).jump(50, 450).face('laugh', 1000).say('よく ねた！', 'star', 1300, 'yay').do(() => R.found('i3_pillow'));
    },
    rainboots(ch, p) {
      const a = borrow(ch, p, 6000).do(() => { ch.holdType = null; puddleFx(ch.x, ch.y, 4200); }).say('ながぐつで ジャンプ！', 'rainboots', 1100, 'yay');
      for (let i = 0; i < 3; i++) a.jump(50, 460).do(() => { A.sfx('splash'); W.burst('drop', ch.x, ch.y, 8, { sp: 0.2, max: 600, col: '#7fc6ff' }); });
      a.face('laugh', 1200).say('ぴちゃ ぴちゃ！', 'sweat', 1300, 'laugh').do(() => { back(ch, p); R.found('i3_puddle'); });
    },
    schoolbag(ch, p) {
      const tx = W.clampFloor(ch.x + (ch.x < 800 ? 320 : -320), ch.y);
      const hx = ch.x, hy = ch.y;
      borrow(ch, p, 8000).say('いってきまーす！', 'schoolbag', 1300, 'yay').go(tx.x, tx.y).pose('march', 900).look(hx).say('ただいま！', 'heart', 1100, 'yay').go(hx, hy, true).pose('cheer', 700)
        .do(() => { back(ch, p); R.found('i3_school'); });
      R.audience(hx, hy, [ch], 'cheer', 1, 600);
    },
    dominoes(ch, p) {
      p.fall = W.t; for (let i = 0; i < 6; i++) W.after(i * 140 + 120, () => A.sfx('tap'));
      W.after(1100, () => { A.sfx('cheer'); spark(p.x + 40, p.y - 20, '#ffd23f'); R.found('i3_domino'); });
      W.after(4500, () => { p.fall = 0; p.pop = W.t; });
      if (ch) visit(ch, p, 3500, p.x < ch.x ? 110 : -110).pose('point', 300).say('ぱたぱた ぱたーん！', 'dominoes', 1500, 'wow').face('laugh', 1000).pose('cheer', 700);
    },
    yoyo(ch, p) {
      borrow(ch, p, 5000).pose('hold', 400).say('びよーん びよーん', 'yoyo', 1600, 'yay').pose('hold', 1200).face('laugh', 1000).say('もどってきた！', 'star', 1200, 'yay').do(() => { back(ch, p); R.found('i3_yoyo'); });
    },
    origami(ch, p) {
      borrow(ch, p, 6000).pose('sit', 400).say('おって おって…', 'origami', 1400, 'talk').pose('think', 900)
        .do(() => { A.sfx('magic'); X.critter('bird', [[ch.x, ch.y - 90, 1], [ch.x + 120, ch.y - 220, 900], [ch.x + 420, ch.y - 460, 1500]], { col: '#ff9ec4' }); })
        .say('つるさん とんでった！', 'star', 1500, 'wow').face('laugh', 1000).do(() => { back(ch, p); R.found('i3_crane'); });
      R.audience(ch.x, ch.y, [ch], 'wow', 1, 2400);
    },
    toothbrush(ch, p) {
      borrow(ch, p, 5000).pose('eat', 500).say('しゃか しゃか', 'toothbrush', 1300, 'talk')
        .do(() => { for (let i = 0; i < 4; i++) W.after(i * 200, () => { const m = mouth(ch); W.burst('smoke', m.x, m.y, 2, { sp: 0.08, max: 600, size: 9, col: '#ffffff', g: 0 }); }); }).pose('eat', 900)
        .face('laugh', 1200).do(() => { const m = mouth(ch); W.burst('star', m.x, m.y, 5, { sp: 0.12, max: 700 }); A.sfx('sparkle'); }).say('ピカピカ！', 'star', 1300, 'yay').do(() => { back(ch, p); R.found('i3_teeth'); });
    },
    soap(ch, p) {
      borrow(ch, p, 5000).pose('hold', 500).say('あわあわ〜', 'soap', 1300, 'yay').do(() => { A.sfx('bubble'); W.addBubbles(ch.x, ch.y - 40, 10); }).face('laugh', 1200).say('いい におい', 'heart', 1200, 'yay').do(() => { back(ch, p); R.found('i3_soap'); });
    },
    archblock(ch, p) {
      const side = ch.x < p.x ? -1 : 1;
      R.claim(ch, 6000).go(p.x + side * 120, p.y + 4, true).look(p.x).say('トンネルを とびこえるよ！', 'archblock', 1300, 'yay')
        .do(() => { const x0 = ch.x, x1 = p.x - side * 120; A.sfx('jump'); R.tween(ch, 900, (k) => { ch.x = PT.lerp(x0, x1, k); ch.z = Math.sin(k * Math.PI) * 120; ch.pose = 'jump'; }, () => { ch.z = 0; ch.pose = 'idle'; }); })
        .face('laugh', 1000).say('ぴょーん！', 'star', 1200, 'yay').pose('cheer', 700).do(() => R.found('i3_arch'));
      R.audience(p.x, p.y, [ch], 'cheer', 1, 1600);
    },
    puzzle(ch, p) {
      visit(ch, p, 5000, p.x < ch.x ? 60 : -60).pose('sit', 500).pose('think', 1200).say('ここかな？', 'puzzle', 1300, 'hmm').do(() => { p.wobbleUntil = W.t + 500; A.sfx('tap'); })
        .say(p.done ? 'できてる！' : 'あと ひとつ たりない…', p.done ? 'star' : '?', 1500, p.done ? 'yay' : 'hmm').do(() => R.found('i3_puzzle1'));
    },
    telescope(ch, p) {
      visit(ch, p, 6000, p.x < ch.x ? 50 : -50).pose('peek', 1300).say('なにが みえるかな？', 'telescope', 1300, 'talk')
        .do(() => { A.sfx('sparkle'); for (let i = 0; i < 6; i++) W.after(i * 150, () => W.burst('star', p.x + PT.rand(-400, 400), PT.rand(80, 260), 2, { sp: 0.05, max: 1400, g: 0 })); })
        .face('surprise', 800).say('おほしさま みーつけた！', 'star', 1500, 'wow').face('laugh', 1000).do(() => R.found('i3_telescope'));
    },
    hourglass(ch, p) {
      p.flip = W.t; p.pop = W.t; A.sfx('tap');
      if (ch) { const a = visit(ch, p, 6500, p.x < ch.x ? 70 : -70).say('よーい スタート！', 'hourglass', 900, 'yay'); ['いーち', 'にーい', 'さーん'].forEach((n) => a.say(n, null, 900, 'talk')); a.say('おしまい！', 'star', 1200, 'yay').pose('cheer', 700).do(() => R.found('i3_hourglass')); }
      else W.after(4000, () => R.found('i3_hourglass'));
    },
    piggybank(ch, p) {
      visit(ch, p, 5000, p.x < ch.x ? 60 : -60).pose('hold', 400).do(() => { coinFx(ch.x, ch.y - 80 * ch.scale, p.x, p.y - 50); W.after(650, () => { A.sfx('ding'); p.wobbleUntil = W.t + 800; hearts(p.x, p.y - 60, 3); }); }).wait(700)
        .say('チャリン！', 'piggybank', 1300, 'yay').face('laugh', 1000).say('ちょきん ちょきん', 'heart', 1200, 'yay').do(() => R.found('i3_piggy'));
    },
    globe(ch, p) {
      p.spin = W.t + 3000; A.sfx('whoosh');
      if (ch) visit(ch, p, 5000, p.x < ch.x ? 60 : -60).pose('point', 600).say('くるくる〜！', 'globe', 1200, 'yay').pose('think', 800).say('せかいって ひろいね', 'star', 1400, 'talk').do(() => R.found('i3_globe'));
      else W.after(1500, () => R.found('i3_globe'));
    },
    paperplane(ch, p) {
      const dir = ch.x < 800 ? 1 : -1;
      visit(ch, p, 5000, -dir * 40).pose('point', 400).say('それっ！', 'paperplane', 900, 'yay')
        .do(() => {
          const x0 = p.x, x1 = W.clampFloor(p.x + dir * 560, p.y).x; A.sfx('whoosh');
          R.tween({}, 2200, (k) => { if (p.removed) return; p.x = PT.lerp(x0, x1, k); p.z = Math.sin(k * Math.PI) * 220 + Math.sin(k * 12) * 12; }, () => { if (!p.removed) { p.z = 0; R.found('i3_paperplane'); } });
        }).look(p.x + dir * 300).face('laugh', 1500).say('とんだー！', 'star', 1500, 'wow');
      R.audience(ch.x, ch.y, [ch], 'wow', 2, 900);
    },
    toyhammer(ch, p, tgt) {
      const vic = (tgt && tgt !== ch ? tgt : null) || R.free(ch.x, ch.y, [ch], 900)[0] || null;
      const holder = tgt && !vic ? tgt : ch;
      const a = borrow(holder, p, 5000);
      if (vic && vic !== holder) a.to(vic, vic.x < holder.x ? 70 : -70, 2, true).look(vic.x);
      a.say('えいっ！', 'toyhammer', 700, 'yay').pose('point', 300).do(() => {
        const v = vic && vic !== holder ? vic : holder; A.sfx('boing'); W.bigText('ピコッ！', v.x, headY(v) - 30, '#ff5d6c'); W.burst('star', v.x, headY(v), 6, { sp: 0.14, max: 800 });
        R.claim(v, 2400).face('silly', 900).jump(40, 380).face('laugh', 1200).say('あはは！ もう いっかい！', null, 1300, 'laugh');
      }).wait(600).face('laugh', 1000).do(() => { back(holder, p); R.found('i3_hammer'); });
    },
  };
  ['plushdog', 'plushcat', 'plushlion', 'plushchick'].forEach((id) => { PLAY[id] = PLAY.plush; });
  const NOCHAR = ['alarmclock', 'dominoes', 'hourglass', 'globe'];
  const playTool = (p, ch, tgt) => { const f = PLAY[p.type]; if (f) f(ch, p, tgt); };
  R.add({ id: 'i3-tool-char', pri: 72, test: (c) => (isTool3(c.e) && isC(c.tgt) ? c.tgt : null), run(c, ch) { playTool(c.e, ch, ch); } });
  R.add({ id: 'i3-tool-floor', pri: 34, test: (c) => (isTool3(c.e) ? R.one(c.e.x, c.e.y) || (NOCHAR.includes(c.e.type) ? 1 : null) : null), run(c, ch) { playTool(c.e, ch === 1 ? null : ch, null); } });
  R.add({ id: 'i3-tool-tap', on: 'tapprop', pri: 40, test: (c) => (isTool3(c.e) && !c.e.hidden ? R.one(c.e.x, c.e.y) || (NOCHAR.includes(c.e.type) ? 1 : null) : null), run(c, ch) { playTool(c.e, ch === 1 ? null : ch, null); } });

  /* ---------- くみあわせ ---------- */
  // うえきばち ＋ じょうろ → おはなが さく
  R.add({ id: 'i3-bloom', pri: 68, test: (c) => pairOf(c.e, 'flowerpot', 'wateringcan'),
    run(c, [pot, wc]) {
      const ch = R.one(wc.x, wc.y, [], 'mimi'); if (!ch) { pot.bloom = W.t; R.found('i3_bloom'); return; }
      borrow(ch, wc, 7000).to(pot, pot.x < ch.x ? 80 : -80, 4, true).look(pot.x).say('おみず あげよう', 'wateringcan', 1200, 'talk').pose('point', 400)
        .do(() => { A.sfx('splash'); for (let i = 0; i < 5; i++) W.after(i * 200, () => W.burst('drop', pot.x, pot.y - 70, 4, { sp: 0.1, max: 600, col: '#7fc6ff' })); }).pose('point', 1100)
        .do(() => { pot.bloom = W.t; pot.pop = W.t; A.sfx('magic'); spark(pot.x, pot.y - 90, '#ff8fab', 12); hearts(pot.x, pot.y - 100, 4); })
        .face('laugh', 1200).say('おはなが さいた！', 'flowerpot', 1500, 'yay').pose('cheer', 800).do(() => { back(ch, wc); R.found('i3_bloom'); });
      R.audience(pot.x, pot.y, [ch], 'cheer', 2, 2400);
    } });
  // スケッチブック ＋ えのぐ／クレヨン → カラフルな え
  R.add({ id: 'i3-paint', pri: 68, test: (c) => pairOf(c.e, 'sketchbook', ['paints', 'crayons']),
    run(c, [sb, pt]) {
      const ch = R.one(sb.x, sb.y, [], 'lulu'); if (!ch) { sb.drawn = 2; R.found('i3_paint'); return; }
      borrow(ch, pt, 7000).to(sb, sb.x < ch.x ? 60 : -60, 4, true).look(sb.x).pose('sit', 400).say('いろを ぬって…', pt.type, 1300, 'talk').pose('sit', 1200)
        .do(() => { sb.drawn = 2; sb.pop = W.t; A.sfx('sparkle'); W.burst('confetti', sb.x, sb.y - 70, 12, { sp: 0.2, max: 900 }); }).say('にじいろの え！', 'sketchbook', 1500, 'yay').pose('cheer', 800)
        .do(() => { back(ch, pt); R.found('i3_paint'); });
      R.audience(sb.x, sb.y, [ch], 'cheer', 2, 3000);
    } });
  // アーチの つみき ＋ つみき → タワー
  R.add({ id: 'i3-tower', pri: 68, test: (c) => pairOf(c.e, 'archblock', 'blocks'),
    run(c, [ar, bl]) {
      const x = (ar.x + bl.x) / 2, y = Math.max(ar.y, bl.y) + 10, ch = R.one(x, y, [], 'gaku');
      ar.hidden = true; bl.hidden = true;
      towerFx(x, y, 5200); for (let i = 0; i < 9; i++) W.after(i * 260, () => A.sfx('tap'));
      W.after(4000, () => { A.sfx('drumroll'); W.bigText('ガラガラ〜', x, y - 200, '#ff8a5c'); });
      W.after(5200, () => { [ar, bl].forEach((p, i) => { if (p.removed) return; p.hidden = false; p.pop = W.t; const q = W.clampFloor(x + (i ? 70 : -70), y); p.x = q.x; p.y = q.y; p.scale = W.depthScale(q.y); }); R.found('i3_tower'); });
      if (ch) R.claim(ch, 6500).go(x + (ch.x < x ? -120 : 120), y, true).look(x).say('つみき つむよ！', 'blocks', 1300, 'yay').pose('hold', 1200).say('たかーい！', 'star', 1300, 'wow').face('surprise', 600).wait(300).face('laugh', 1400).say('くずれちゃった〜', null, 1300, 'laugh');
      R.audience(x, y, ch ? [ch] : [], 'wow', 2, 2000);
    } });
  // パズル ＋ パズル → かんせい
  R.add({ id: 'i3-puzzle', pri: 68, test: (c) => (isP(c.e, 'puzzle') ? firstP(c.e.x, c.e.y, 320, 'puzzle', c.e) : null),
    run(c, other) {
      const p = c.e, ch = R.one(p.x, p.y, [], 'gaku');
      const done = () => { if (p.removed) return; if (!other.removed) { W.poof(other.x, other.y - 30); W.remove(other); } p.done = true; p.pop = W.t; A.sfx('jingle'); spark(p.x, p.y - 40, '#ffd23f', 14); W.bigText('かんせい！', p.x, p.y - 140, '#ff6f91'); R.found('i3_puzzle'); };
      if (ch) { R.claim(ch, 6000).to(p, p.x < ch.x ? 60 : -60, 4, true).look(p.x).pose('sit', 400).say('この ピースを ここに…', 'puzzle', 1400, 'talk').do(done).face('laugh', 1200).pose('cheer', 900).say('できたー！', 'star', 1300, 'yay'); R.audience(p.x, p.y, [ch], 'cheer', 2, 2000); }
      else done();
    } });
  // くし ＋ ドライヤー → びよういんさん
  R.add({ id: 'i3-salon', pri: 68, test: (c) => pairOf(c.e, 'comb', 'hairdryer'),
    run(c, [cb, dr]) {
      const sty = R.one(dr.x, dr.y, [], 'mimi'); if (!sty) { R.found('i3_salon'); return; }
      const guest = R.free(dr.x, dr.y, [sty], 1500)[0];
      if (!sty.wear.body) R.wear(sty, 'apron', {}, true);
      if (!guest) { PLAY.hairdryer(sty, dr); W.after(4000, () => R.found('i3_salon')); return; }
      const sp = W.clampFloor(dr.x + 40, dr.y + 10);
      R.claim(guest, 9000).go(sp.x, sp.y, true).pose('sit', 4800).face('happy', 3000).wait(2000).face('love', 1500).say('かわいく なった！', 'heart', 1500, 'yay').pose('spin', 900);
      borrow(sty, cb, 9000).say('いらっしゃいませ〜', 'comb', 1200, 'yay').go(sp.x - 80, sp.y, true).look(sp.x).pose('hold', 900).do(() => { spark(guest.x, headY(guest), '#ffffff', 8); back(sty, cb); })
        .do(() => { if (!dr.removed) { dr.hidden = true; sty.holdType = 'hairdryer'; } }).say('ブオー！', 'hairdryer', 1100, 'yay').do(() => { A.sfx('whoosh'); W.burst('smoke', guest.x, headY(guest), 6, { sp: 0.15, max: 600, size: 10, col: '#ffe0f0', g: 0 }); })
        .do(() => { if (!guest.wear.hat) guest.wear = Object.assign({}, guest.wear, { hat: 'ribbon' }); A.sfx('sparkle'); spark(guest.x, headY(guest), '#ff8fab', 12); back(sty, dr); })
        .say('できあがり！', 'star', 1300, 'yay').do(() => R.found('i3_salon'));
      W.after(12000, () => back(sty, dr));
    } });
  // ながぐつ ＋ かさ → あめふり
  R.add({ id: 'i3-rainy', pri: 68, test: (c) => pairOf(c.e, 'rainboots', 'umbrella'),
    run(c, [bt, um]) {
      const ch = R.one(bt.x, bt.y, [], 'pyoko'); const x = bt.x, y = bt.y;
      rainFx(x, y, 6000); A.sfx('wave');
      if (!ch) { W.after(3000, () => R.found('i3_rainy')); return; }
      bt.hidden = true; W.after(9000, () => back(ch, bt));
      const a = borrow(ch, um, 7000).go(x, y, true).say('あめ ふって きた！', 'umbrella', 1300, 'yay').do(() => puddleFx(ch.x, ch.y, 3600));
      for (let i = 0; i < 3; i++) a.jump(45, 460).do(() => { A.sfx('splash'); W.burst('drop', ch.x, ch.y, 8, { sp: 0.2, max: 600, col: '#7fc6ff' }); });
      a.face('laugh', 1200).say('あめの ひも たのしいね', 'heart', 1500, 'yay').do(() => { back(ch, um); back(ch, bt); R.found('i3_rainy'); });
      R.audience(x, y, [ch], 'join', 2, 1500);
    } });
  // ミニカー ＋ ミニカー → レース
  R.add({ id: 'i3-race', pri: 68, test: (c) => (isP(c.e, 'minicar') ? firstP(c.e.x, c.e.y, 320, 'minicar', c.e) : null),
    run(c, other) {
      const cars = [c.e, other]; other.col = '#58b9f0';
      const dir = c.e.x < 800 ? 1 : -1; const sx = Math.min(c.e.x, other.x) * (dir > 0 ? 1 : 0) + Math.max(c.e.x, other.x) * (dir > 0 ? 0 : 1);
      cars.forEach((p, i) => { const q = W.clampFloor(sx, c.e.y + (i ? 40 : -40)); p.x = q.x; p.y = q.y; p.scale = W.depthScale(q.y); });
      const kids = R.avail(sx, c.e.y, [], 1500).slice(0, 2);
      kids.forEach((k, i) => R.claim(k, 6000).go(sx - dir * 70, cars[i].y + 4, true).look(sx + dir * 100).pose('sit', 500).say(i ? 'まけないぞ！' : 'よーい…', i ? 'star' : 'minicar', 1100, 'yay'));
      W.after(1700, () => {
        W.bigText('どん！', sx + dir * 100, c.e.y - 150, '#ff6f61'); A.sfx('whoosh');
        const win = PT.irand(0, 1);
        cars.forEach((p, i) => { const x0 = p.x, x1 = W.clampFloor(p.x + dir * (i === win ? 520 : 430), p.y).x; p.drive = W.t + 1800; R.tween({}, 1800, (k) => { if (!p.removed) p.x = PT.lerp(x0, x1, PT.easeInOut(k)); }); });
        W.after(1900, () => { A.sfx('cheer'); const k = kids[win]; if (k && R.chars().includes(k)) R.claim(k, 2500).jump(60, 450).say('いちばん！', 'star', 1300, 'yay').pose('cheer', 800); R.found('i3_race'); R.found('i3_minicar'); });
      });
    } });

  /* ---------- おだい ---------- */
  const O = (stage, text, goals, hint) => ({ id: stage + ':' + text, stage, text, goals, hint });
  PT.ODAI2 = (PT.ODAI2 || []).concat([
    O('restaurant', 'いろんな りょうりを たべてみよう', ['i3_spicy', 'i3_slurp', 'i3_wasabi', 'i3_curryrice', 'i3_sushibelt'], ['curry', 'sushi']),
    O('fest', 'おまつりの たべものを たべよう', ['i3_hot', 'i3_fluffy', 'i3_kiin', 'i3_fizz'], ['takoyaki', 'cottoncandy']),
    O('park', 'こうえんで からだを うごかそう', ['i3_jumprope', 'i3_hoop', 'i3_koma', 'i3_kendama', 'i3_paperplane'], ['jumprope', 'hulahoop']),
    O('home', 'おうちで のんびり おもちゃあそび', ['i3_puzzle', 'i3_tower', 'i3_domino', 'i3_pillow', 'i3_alarm'], ['puzzle', 'archblock']),
  ]);
  (PT.ROYAL_ODAI || []).push(['つめたい おやつで ひんやり', ['i3_cold', 'i3_kiin', 'i3_fizz'], ['softcream', 'kakigori']]);
})();
