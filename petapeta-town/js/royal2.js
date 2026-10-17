/* もっと すてきな ドレスと ティアラ */
'use strict';
(() => {
  const G = PT.G, K = PT.ROYAL, EXT = PT.WEAR_EXT;

  /* ================= ドレス ================= */
  // だんごとに いろを かえられる ボールガウン
  const gown2 = (o) => (c, ch, t) => {
    t = t || 0;
    const sway = Math.sin(t * 0.004) * 3 + (ch.pose === 'dance' || ch.pose === 'spin' ? Math.sin(t * 0.012) * 6 : 0);
    const tiers = o.tiers;
    for (let k = tiers.length - 1; k >= 0; k--) {
      const top = -58 + k * 13, wid = 60 - k * 8, bot = 4 - k * 11, col = tiers[k];
      c.beginPath(); c.moveTo(-18, top);
      c.bezierCurveTo(-30 - k * 4, top + 14, -wid - 6 + sway, bot - 22, -wid + sway, bot);
      const n = 8 - k;
      for (let i = 0; i < n; i++) { const x0 = -wid + sway + (i * 2 * wid) / n, x1 = -wid + sway + ((i + 1) * 2 * wid) / n; c.quadraticCurveTo((x0 + x1) / 2, bot + 9, x1, bot); }
      c.bezierCurveTo(wid + 6 + sway, bot - 22, 30 + k * 4, top + 14, 18, top);
      c.closePath();
      c.fillStyle = G.grad(c, 0, top, 0, bot, [[0, PT.shade(col, 0.25)], [0.6, col], [1, PT.shade(col, -0.12)]]); c.fill();
      c.strokeStyle = PT.line(col); c.lineWidth = 2.4; c.stroke();
      // ひだ
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2;
      for (let i = 1; i < n; i++) { const x = -wid + sway + (i * 2 * wid) / n; c.beginPath(); c.moveTo(x * 0.45, top + 10); c.quadraticCurveTo(x * 0.8, bot - 20, x, bot - 3); c.stroke(); }
      // すその レース
      if (o.lace !== false) { c.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < n * 2; i++) { const x = -wid + sway + 3 + (i * (2 * wid - 6)) / (n * 2 - 1); G.circ(c, x, bot - 1 + (i % 2) * 2, 2.4); c.fill(); } }
    }
    // ラメ
    for (let i = 0; i < 6; i++) K.twinkle(c, -44 + i * 17 + sway, -8 - ((i * 37) % 40), 5, t, i * 1.7);
    if (o.deco) o.deco(c, sway, t);
    // ボディス
    c.beginPath(); c.moveTo(-21, -58); c.lineTo(-24, -82); c.quadraticCurveTo(-12, -90, 0, -84); c.quadraticCurveTo(12, -90, 24, -82); c.lineTo(21, -58); c.closePath();
    c.fillStyle = G.grad(c, 0, -90, 0, -56, [[0, PT.shade(o.bodice, 0.25)], [1, o.bodice]]); c.fill(); c.strokeStyle = PT.line(o.bodice); c.lineWidth = 2.4; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1.4; for (const x of [-9, 0, 9]) { c.beginPath(); c.moveTo(x, -82); c.lineTo(x * 0.8, -60); c.stroke(); }
    // そで
    if (o.sleeve === 'wing') { for (const sd of [-1, 1]) { c.save(); c.translate(sd * 26, -80); c.rotate(sd * (0.4 + Math.sin(t * 0.01) * 0.15)); G.ell(c, sd * 16, -6, 18, 11, sd * -0.4); c.fillStyle = 'rgba(220,190,255,.8)'; c.fill(); c.strokeStyle = '#a77fe0'; c.lineWidth = 2; c.stroke(); G.ell(c, sd * 12, 8, 11, 7, sd * 0.4); c.fillStyle = 'rgba(255,200,240,.85)'; c.fill(); c.stroke(); c.restore(); } }
    else if (o.sleeve === 'off') { c.strokeStyle = o.trim; c.lineWidth = 6; c.beginPath(); c.moveTo(-34, -78); c.quadraticCurveTo(0, -70, 34, -78); c.stroke(); }
    else for (const sd of [-1, 1]) { G.ell(c, sd * 27, -80, 11, 9, sd * 0.3); c.fillStyle = G.rgrad(c, sd * 24, -84, 1, 13, [[0, '#ffffff'], [1, o.sleeveCol || tiers[0]]]); c.fill(); c.strokeStyle = PT.line(tiers[0]); c.lineWidth = 2; c.stroke(); }
    // ウエスト
    G.rr(c, -22, -62, 44, 8, 4); c.fillStyle = o.belt === 'gold' ? K.gold(c, -62, -54) : o.belt; c.fill(); c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1.4; c.stroke();
    if (o.bow) { for (const sd of [-1, 1]) { G.blob(c, [0, -58, sd * 14, -68, sd * 18, -58, sd * 14, -50]); c.fillStyle = o.bow; c.fill(); c.strokeStyle = PT.line(o.bow); c.lineWidth = 1.6; c.stroke(); } }
    K.gem(c, 0, o.bow ? -58 : -74, 5, o.gem, o.gemShape || 'heart');
    K.pearlLine(c, [[-12, -85], [-6, -87], [6, -87], [12, -85]], 2.2);
  };

  const D = {
    stars: (c, sway, t) => { c.fillStyle = '#ffe58a'; [[-40, -14], [-18, -30], [8, -18], [32, -32], [40, -8], [-6, -44], [20, -48]].forEach(([x, y], i) => { G.star(c, x + sway, y, 5 + (i % 2) * 2, 2.2); c.fill(); }); c.save(); c.translate(-30 + sway, -40); c.beginPath(); c.arc(0, 0, 8, 0.6, PT.TAU - 0.6); c.quadraticCurveTo(3, 0, 6, -5); c.closePath(); c.fillStyle = '#fff3b0'; c.fill(); c.restore(); },
    butterfly: (c, sway, t) => { [[-34, -18, '#ff9ccf'], [10, -30, '#9fd8ff'], [36, -12, '#ffe58a']].forEach(([x, y, col], i) => { const f = 0.5 + Math.abs(Math.sin(t * 0.01 + i)) * 0.5; c.save(); c.translate(x + sway, y); for (const sd of [-1, 1]) { c.save(); c.scale(sd * f, 1); G.ell(c, 6, -4, 7, 5, -0.4); c.fillStyle = col; c.fill(); G.ell(c, 5, 4, 5, 3.6, 0.4); c.fill(); c.restore(); } c.fillStyle = '#5a3a6a'; G.ell(c, 0, 0, 1.4, 5); c.fill(); c.restore(); }); },
    strawberry: (c, sway, t) => { [[-36, -14], [-12, -24], [14, -14], [38, -24], [0, -42], [-26, -38], [26, -40]].forEach(([x, y]) => { G.blob(c, [x - 6 + sway, y - 4, x + sway, y - 6, x + 6 + sway, y - 4, x + 4 + sway, y + 3, x + sway, y + 7, x - 4 + sway, y + 3]); c.fillStyle = '#ff4d6a'; c.fill(); c.fillStyle = '#58b44e'; G.ell(c, x + sway, y - 6, 4, 2); c.fill(); c.fillStyle = '#ffe9a8'; G.circ(c, x - 2 + sway, y, 0.9); c.fill(); G.circ(c, x + 2 + sway, y + 2, 0.9); c.fill(); }); },
    sakura: (c, sway, t) => { [[-34, -14], [-10, -26], [16, -12], [36, -30], [-2, -46], [-28, -40], [30, -46]].forEach(([x, y], i) => { for (let k = 0; k < 5; k++) { const a = (k / 5) * PT.TAU + i; G.ell(c, x + sway + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.6, 2.6, a); c.fillStyle = '#ffd1e0'; c.fill(); } G.circ(c, x + sway, y, 1.6); c.fillStyle = '#ff7aa8'; c.fill(); }); },
    bows: (c, sway, t) => { [[-36, -10], [0, -16], [36, -10], [-18, -36], [18, -36]].forEach(([x, y]) => { for (const sd of [-1, 1]) { G.poly(c, [x + sway, y, x + sway + sd * 9, y - 5, x + sway + sd * 9, y + 5]); c.fillStyle = '#ffffff'; c.fill(); } K.pearl(c, x + sway, y, 2.4); }); },
  };
  EXT.body.gown_rainbow = gown2({ tiers: ['#ffb3c8', '#ffd59a', '#fff3a6', '#bff0c0', '#bfe3ff', '#d9c4ff'].slice(0, 4), bodice: '#ffd1e0', gem: '#b39ae8', belt: 'gold' });
  EXT.body.gown_star = gown2({ tiers: ['#5b6fd6', '#4458b8', '#2f3f8f'], bodice: '#5b6fd6', gem: '#ffe58a', gemShape: 'diamond', belt: 'gold', deco: D.stars, sleeve: 'off', trim: '#ffe58a' });
  EXT.body.gown_butterfly = gown2({ tiers: ['#e7d4ff', '#d6bdfa', '#c6a6f4'], bodice: '#cfb2f7', gem: '#ff9ccf', belt: '#ffffff', deco: D.butterfly, sleeve: 'wing' });
  EXT.body.gown_strawberry = gown2({ tiers: ['#ffffff', '#ff8fab', '#ff6f91'], bodice: '#ff6f91', gem: '#ff2f6d', belt: '#ffffff', deco: D.strawberry, bow: '#ffffff' });
  EXT.body.gown_sakura = gown2({ tiers: ['#ffe6ee', '#ffc7da', '#ffaec8'], bodice: '#ffc7da', gem: '#ff7aa8', belt: '#c4506a', deco: D.sakura, sleeve: 'off', trim: '#ffffff' });
  EXT.body.gown_lavender = gown2({ tiers: ['#efe4ff', '#e0cdfb', '#cfb5f5'], bodice: '#d9c4ff', gem: '#7fd0ff', belt: 'gold', deco: D.bows, bow: '#b39ae8' });
  // にんぎょの ドレス（ひれの スカート）
  EXT.body.gown_mermaid = (c, ch, t) => {
    t = t || 0;
    const sw = Math.sin(t * 0.005) * 4;
    c.beginPath(); c.moveTo(-20, -60); c.quadraticCurveTo(-26, -34, -14, -18); c.bezierCurveTo(-30 + sw, -10, -54 + sw, -2, -50 + sw, 6); c.quadraticCurveTo(0, -6, 50 + sw, 6); c.bezierCurveTo(54 + sw, -2, 30 + sw, -10, 14, -18); c.quadraticCurveTo(26, -34, 20, -60); c.closePath();
    c.fillStyle = G.grad(c, 0, -60, 0, 6, [[0, '#5fe0d0'], [0.6, '#38b8c8'], [1, '#8f7fe8']]); c.fill(); c.strokeStyle = '#2a7f8f'; c.lineWidth = 2.6; c.stroke();
    // うろこ
    c.save(); c.clip(); c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1.6;
    for (let y = -56; y < -16; y += 7) for (let x = -24 + ((y / 7) % 2) * 4; x < 24; x += 8) { c.beginPath(); c.arc(x, y, 4, 0, Math.PI); c.stroke(); }
    c.restore();
    // ひれの すじ
    c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.8; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 3, -16); c.quadraticCurveTo(i * 10 + sw, -6, i * 15 + sw, 2); c.stroke(); }
    // かいがらの トップ と しんじゅ の ベルト
    for (const sd of [-1, 1]) { c.save(); c.translate(sd * 11, -78); c.beginPath(); c.moveTo(0, 8); c.lineTo(-11, -4); c.quadraticCurveTo(0, -16, 11, -4); c.closePath(); c.fillStyle = G.grad(c, 0, -14, 0, 8, [[0, '#fff0f6'], [1, '#ffaec8']]); c.fill(); c.strokeStyle = '#e07aa0'; c.lineWidth = 1.6; c.stroke(); for (const a of [-0.7, 0, 0.7]) { c.beginPath(); c.moveTo(0, 8); c.lineTo(Math.sin(a) * 11, -10); c.stroke(); } c.restore(); }
    K.pearlLine(c, Array.from({ length: 8 }, (_, i) => [-21 + i * 6, -60]), 2.6);
    K.gem(c, 0, -60, 4, '#5fe0d0', 'drop');
    for (let i = 0; i < 4; i++) K.twinkle(c, -30 + i * 20 + sw, -6 - (i % 2) * 18, 5, t, i);
  };
  EXT.body.gown_mermaid.back = (c, ch, t) => {
    // うしろの あわ
    for (let i = 0; i < 3; i++) { const y = -60 - (((t || 0) * 0.03 + i * 30) % 90); c.strokeStyle = 'rgba(160,230,255,.8)'; c.lineWidth = 1.6; G.circ(c, -40 + i * 8, y, 3 + i); c.stroke(); }
  };

  /* ================= ティアラ ================= */
  const band = (c, col = 'silver') => { c.strokeStyle = col === 'gold' ? K.gold(c, -158, -146) : K.silver(c, -158, -146); c.lineWidth = 5; c.beginPath(); c.ellipse(0, -150, 40, 9, 0, Math.PI, PT.TAU); c.stroke(); c.strokeStyle = col === 'gold' ? '#b9780c' : '#8796b3'; c.lineWidth = 1; c.stroke(); };
  EXT.hat.tiara_snow = (c, ch, t) => {
    band(c);
    const flake = (x, y, r) => { c.strokeStyle = K.silver(c, y - r, y + r); c.lineWidth = 2.6; c.lineCap = 'round'; for (let i = 0; i < 6; i++) { const a = (i / 6) * PT.TAU; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.moveTo(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55); c.lineTo(x + Math.cos(a + 0.5) * r * 0.8, y + Math.sin(a + 0.5) * r * 0.8); c.stroke(); } K.gem(c, x, y, r * 0.22, '#bfe8ff', 'diamond'); };
    flake(0, -184, 18); flake(-24, -168, 10); flake(24, -168, 10); flake(-38, -158, 6); flake(38, -158, 6);
    K.twinkle(c, 12, -200, 8, t, 0); K.twinkle(c, -18, -190, 6, t, 2);
  };
  EXT.hat.tiara_rainbow = (c, ch, t) => {
    band(c, 'gold');
    ['#ff6b6b', '#ffa94d', '#ffd84a', '#69db7c', '#4dabf7', '#9775fa'].forEach((col, i) => { const a = Math.PI + 0.35 + (i / 5) * (Math.PI - 0.7); K.gem(c, Math.cos(a) * 34, -160 + Math.sin(a) * 24, i === 2 || i === 3 ? 6.5 : 5, col, 'drop'); });
    c.strokeStyle = K.gold(c, -192, -170); c.lineWidth = 3; c.beginPath(); c.arc(0, -160, 30, Math.PI + 0.3, -0.3); c.stroke();
    K.gem(c, 0, -196, 7, '#ffffff', 'diamond');
    K.twinkle(c, 18, -200, 8, t, 0);
  };
  EXT.hat.tiara_moon = (c, ch, t) => {
    band(c, 'gold');
    c.save(); c.translate(0, -184); c.beginPath(); c.arc(0, 0, 18, 0.5, PT.TAU - 0.5); c.quadraticCurveTo(8, 0, 15, -10); c.closePath(); c.fillStyle = K.gold(c, -18, 18); c.fill(); c.strokeStyle = '#b9780c'; c.lineWidth = 2; c.stroke(); c.restore();
    [[-22, -166, 7], [22, -168, 8], [8, -200, 5], [-34, -156, 5], [34, -156, 5]].forEach(([x, y, r]) => { G.star(c, x, y, r, r * 0.45); c.fillStyle = K.gold(c, y - r, y + r); c.fill(); c.strokeStyle = '#b9780c'; c.lineWidth = 1; c.stroke(); });
    K.gem(c, -6, -184, 4, '#7fd0ff', 'diamond');
    K.twinkle(c, 16, -186, 9, t, 0);
  };
  EXT.hat.tiara_butterfly = (c, ch, t) => {
    band(c);
    const f = 0.75 + Math.abs(Math.sin(t * 0.006)) * 0.25;
    c.save(); c.translate(0, -180);
    for (const sd of [-1, 1]) { c.save(); c.scale(sd * f, 1); G.ell(c, 14, -6, 16, 11, -0.4); c.fillStyle = G.grad(c, 0, -18, 30, 6, [[0, '#ffd1f0'], [1, '#c4a8ee']]); c.fill(); c.strokeStyle = '#8f6fd0'; c.lineWidth = 2; c.stroke(); G.ell(c, 11, 9, 10, 7, 0.4); c.fillStyle = '#9fd8ff'; c.fill(); c.stroke(); K.pearl(c, 16, -8, 2.6); c.restore(); }
    c.fillStyle = '#5a3a6a'; G.ell(c, 0, 0, 2.6, 10); c.fill();
    c.strokeStyle = '#5a3a6a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-2, -9); c.quadraticCurveTo(-8, -20, -12, -22); c.moveTo(2, -9); c.quadraticCurveTo(8, -20, 12, -22); c.stroke();
    K.gem(c, -12, -22, 2.6, '#ff9ccf'); K.gem(c, 12, -22, 2.6, '#ff9ccf');
    c.restore();
    for (const sd of [-1, 1]) K.gem(c, sd * 30, -160, 4, '#c4a8ee', 'drop');
  };
  EXT.hat.tiara_shell = (c, ch, t) => {
    band(c);
    K.pearlLine(c, Array.from({ length: 11 }, (_, i) => { const a = Math.PI + (i / 10) * Math.PI; return [Math.cos(a) * 40, -152 + Math.sin(a) * 9]; }), 3.4);
    c.save(); c.translate(0, -172); c.beginPath(); c.moveTo(0, 12); c.lineTo(-20, -6); c.quadraticCurveTo(0, -30, 20, -6); c.closePath();
    c.fillStyle = G.grad(c, 0, -26, 0, 12, [[0, '#fff0f6'], [1, '#ff9ec0']]); c.fill(); c.strokeStyle = '#d06a96'; c.lineWidth = 2; c.stroke();
    for (const a of [-0.8, -0.4, 0, 0.4, 0.8]) { c.beginPath(); c.moveTo(0, 12); c.lineTo(Math.sin(a) * 18, -12 - Math.cos(a) * 8); c.stroke(); }
    K.pearl(c, 0, 4, 4.4);
    c.restore();
    for (const sd of [-1, 1]) { c.save(); c.translate(sd * 26, -160); c.rotate(sd * 0.4); G.star(c, 0, 0, 7, 3.4); c.fillStyle = '#ffb07a'; c.fill(); c.restore(); }
    K.twinkle(c, 14, -196, 7, t, 0);
  };
  EXT.hat.tiara_flower = (c, ch, t) => {
    band(c);
    const fl = (x, y, r, col) => { for (let k = 0; k < 5; k++) { const a = (k / 5) * PT.TAU - 1.57; c.save(); c.translate(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6); c.rotate(a + 1.57); K.gem(c, 0, 0, r * 0.5, col, 'drop'); c.restore(); } K.pearl(c, x, y, r * 0.32); };
    fl(0, -182, 16, '#ffaec8'); fl(-24, -166, 10, '#c9ebff'); fl(24, -166, 10, '#c9ebff'); fl(-38, -156, 6, '#ffe58a'); fl(38, -156, 6, '#ffe58a');
    K.twinkle(c, 18, -198, 8, t, 1);
  };
  EXT.hat.tiara_heartcrown = (c, ch, t) => {
    c.beginPath(); c.moveTo(-30, -150); c.lineTo(-32, -176); c.lineTo(-16, -166); c.lineTo(0, -184); c.lineTo(16, -166); c.lineTo(32, -176); c.lineTo(30, -150); c.closePath();
    c.fillStyle = G.grad(c, 0, -184, 0, -150, [[0, '#ffd6e6'], [1, '#ff86b4']]); c.fill(); c.strokeStyle = '#c4506a'; c.lineWidth = 2.4; c.stroke();
    c.strokeStyle = K.gold(c, -158, -148); c.lineWidth = 4; c.beginPath(); c.moveTo(-30, -152); c.lineTo(30, -152); c.stroke();
    for (const [x, y] of [[-32, -176], [32, -176]]) K.gem(c, x, y - 4, 4.4, '#ff2f6d', 'heart');
    K.gem(c, 0, -190, 7, '#ff2f6d', 'heart'); K.gem(c, 0, -164, 5, '#ffffff', 'diamond');
    K.pearlLine(c, [[-20, -156], [-10, -156], [10, -156], [20, -156]], 2.4);
    K.twinkle(c, -14, -186, 7, t, 0);
  };

  /* ================= アイテム ================= */
  const def = (id, o) => { PT.ITEMS[id] = Object.assign({ id, tags: [], w: 90, h: 90 }, o); };
  const WR = (id, name, slot, kind, role, w, h, off) => def(id, { name, cat: 'dress', tags: [slot === 'hat' ? 'hat' : slot, role, 'royal'], w, h, wear: [slot, kind], role, draw: (c, t) => { c.save(); c.translate(0, off); if (slot === 'body') EXT.body[kind](c, { wear: {}, pose: 'idle' }, t || 0); else PT.drawWearPiece(c, slot, kind, t || 0); c.restore(); } });
  WR('gown_rainbow', 'にじいろの ドレス', 'body', 'gown_rainbow', 'rainbowprincess', 130, 100, 0);
  WR('gown_star', 'よぞらの ドレス', 'body', 'gown_star', 'starprincess', 130, 100, 0);
  WR('gown_butterfly', 'ちょうちょの ドレス', 'body', 'gown_butterfly', 'butterflyprincess', 130, 100, 0);
  WR('gown_mermaid', 'にんぎょの ドレス', 'body', 'gown_mermaid', 'mermaid', 110, 100, 0);
  WR('gown_strawberry', 'いちごの ドレス', 'body', 'gown_strawberry', 'princess', 130, 100, 0);
  WR('gown_sakura', 'さくらの ドレス', 'body', 'gown_sakura', 'princess', 130, 100, 0);
  WR('gown_lavender', 'ラベンダーの ドレス', 'body', 'gown_lavender', 'princess', 130, 100, 0);
  WR('tiara_snow', 'ゆきの けっしょうの ティアラ', 'hat', 'tiara_snow', 'princess', 90, 64, 148);
  WR('tiara_rainbow', 'にじの ティアラ', 'hat', 'tiara_rainbow', 'rainbowprincess', 90, 64, 148);
  WR('tiara_moon', 'つきと ほしの ティアラ', 'hat', 'tiara_moon', 'starprincess', 90, 64, 148);
  WR('tiara_butterfly', 'ちょうちょの ティアラ', 'hat', 'tiara_butterfly', 'butterflyprincess', 90, 64, 148);
  WR('tiara_shell', 'かいがらの ティアラ', 'hat', 'tiara_shell', 'mermaid', 90, 64, 148);
  WR('tiara_flower', 'クリスタルの はなの ティアラ', 'hat', 'tiara_flower', 'princess', 90, 64, 148);
  WR('tiara_heartcrown', 'ハートの おうかん', 'hat', 'tiara_heartcrown', 'princess', 80, 56, 148);
  const NEW = ['gown_rainbow', 'gown_star', 'gown_butterfly', 'gown_mermaid', 'gown_strawberry', 'gown_sakura', 'gown_lavender', 'tiara_snow', 'tiara_rainbow', 'tiara_moon', 'tiara_butterfly', 'tiara_shell', 'tiara_flower', 'tiara_heartcrown'];
  PT.ROYAL_FAVS = NEW.concat(PT.ROYAL_FAVS || []);

  /* ================= あそび ================= */
  const W = PT.world, R = PT.R, X = PT.FX;
  R.D('d_mermaid', 'にんぎょひめ', 'にんぎょの ドレスで あわの なかを すいすい', ['gown_mermaid', 'tiara_shell']);
  R.D('d_rainbowdress', 'にじいろの プリンセス', 'くるっと まわると そらに にじが かかる', ['gown_rainbow', 'tiara_rainbow']);
  R.D('d_stardress', 'よぞらの プリンセス', 'よぞらの ドレスで ながれぼしに おねがい', ['gown_star', 'tiara_moon']);
  R.D('d_butterflydress', 'ちょうちょの プリンセス', 'ちょうちょが あつまって いっしょに おどる', ['gown_butterfly', 'tiara_butterfly']);
  R.ROLES.mermaid = (ch) => {
    W.addBubbles(ch.x, ch.y - 40, 14); PT.audio.sfx('bubble');
    R.claim(ch, 5000).say('にんぎょひめ だよ', 'gown_mermaid', 1500, 'yay').do(() => { R.tween(ch, 2600, (k) => { ch.z = Math.sin(k * Math.PI) * 60; ch.pose = 'swim'; ch.x += Math.sin(k * 12) * 1.5; }, () => { ch.z = 0; R.found('d_mermaid'); }); });
    R.audience(ch.x, ch.y, [ch], 'wow', 2, 800);
  };
  R.ROLES.rainbowprincess = (ch) => {
    R.claim(ch, 5000).pose('spin', 1400).do(() => { X.rainbow(5000); PT.audio.sfx('sparkle'); }).say('にじが でた！', 'rainbow', 1500, 'yay').pose('dance', 1500).do(() => R.found('d_rainbowdress'));
    R.mimic(ch, 'spin', 1200, 'わたしも くるり！');
  };
  R.ROLES.starprincess = (ch) => {
    W.special({ type: 'starnight', max: 5000, draw(c2, f, k) { const a = Math.sin(k * Math.PI); c2.fillStyle = `rgba(30,30,90,${0.35 * a})`; c2.fillRect(-500, -100, 2600, 1200); for (let i = 0; i < 30; i++) { c2.globalAlpha = a * (0.5 + Math.sin(f.life * 0.005 + i) * 0.5); G.star(c2, (i * 211) % 1600, 60 + ((i * 97) % 320), 6, 2.6); c2.fillStyle = '#fff6b8'; c2.fill(); } c2.globalAlpha = 1; const kk = (f.life % 1600) / 1200; if (kk < 1) { c2.strokeStyle = '#fff6b8'; c2.lineWidth = 4; c2.beginPath(); c2.moveTo(300 + kk * 500, 100 + kk * 200); c2.lineTo(220 + kk * 500, 62 + kk * 200); c2.stroke(); } } });
    PT.audio.sfx('magic');
    R.claim(ch, 5000).pose('shy', 1500).say('ながれぼしに おねがい…', 'star', 1700, 'talk').face('love', 1500).pose('spin', 900).do(() => R.found('d_stardress'));
  };
  R.ROLES.butterflyprincess = (ch) => {
    for (let i = 0; i < 5; i++) { const sx = PT.rand(W.visLeft, W.visRight); X.critter('butterfly', [[sx, 120, 1], [ch.x + PT.rand(-60, 60), ch.y - 160 - i * 14, 1800], [ch.x + PT.rand(-80, 80), ch.y - 200, 1500], [ch.x + PT.rand(-60, 60), ch.y - 150, 1500], [sx, 100, 1800]], { col: PT.pick(['#ffb3d0', '#ffe36a', '#9fd8ff', '#c9b3f0']) }); }
    R.claim(ch, 6000).say('ちょうちょさん いらっしゃい', 'gown_butterfly', 1700, 'yay').pose('dance', 2800).face('love', 1200).do(() => R.found('d_butterflydress'));
  };
  (PT.ROYAL_ODAI || []).push(['すてきな ドレスと ティアラで おめかし', ['d_mermaid', 'd_rainbowdress', 'd_stardress', 'd_butterflydress', 'd_princess'], ['gown_rainbow', 'tiara_snow']]);
})();
