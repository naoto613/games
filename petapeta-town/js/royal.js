/* プリンセス・プリンスの アイテム（こったデザイン）と その あそび */
'use strict';
(() => {
  const G = PT.G;
  const EXT = PT.WEAR_EXT;

  /* ================= きらびやかな 描画パーツ ================= */
  const K = (PT.ROYAL = {});
  const GOLD = ['#fff6c2', '#ffd54a', '#e3a21a', '#b9780c'];
  K.gold = (c, y0, y1) => G.grad(c, 0, y0, 0, y1, [[0, GOLD[0]], [0.35, GOLD[1]], [0.75, GOLD[2]], [1, GOLD[3]]]);
  K.silver = (c, y0, y1) => G.grad(c, 0, y0, 0, y1, [[0, '#ffffff'], [0.4, '#e4ebf7'], [0.8, '#aab8d0'], [1, '#8796b3']]);
  /* カットされた ほうせき */
  K.gem = (c, x, y, r, col, shape = 'round') => {
    c.save(); c.translate(x, y);
    const dark = PT.shade(col, -0.35), light = PT.shade(col, 0.55);
    if (shape === 'heart') { G.heart(c, 0, r * 0.35, r * 1.1); }
    else if (shape === 'drop') { c.beginPath(); c.moveTo(0, -r * 1.3); c.quadraticCurveTo(r, -r * 0.1, r * 0.9, r * 0.35); c.arc(0, r * 0.3, r * 0.9, 0, Math.PI); c.quadraticCurveTo(-r, -r * 0.1, 0, -r * 1.3); c.closePath(); }
    else if (shape === 'diamond') { G.poly(c, [0, -r * 1.2, r, 0, 0, r * 1.2, -r, 0]); }
    else G.circ(c, 0, 0, r);
    c.fillStyle = G.rgrad(c, -r * 0.3, -r * 0.35, r * 0.1, r * 1.2, [[0, light], [0.45, col], [1, dark]]); c.fill();
    c.strokeStyle = PT.shade(col, -0.55); c.lineWidth = Math.max(1.2, r * 0.18); c.stroke();
    // ファセット
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = Math.max(0.8, r * 0.1);
    c.beginPath(); c.moveTo(-r * 0.55, -r * 0.1); c.lineTo(0, -r * 0.5); c.lineTo(r * 0.55, -r * 0.1); c.stroke();
    G.ell(c, -r * 0.32, -r * 0.4, r * 0.28, r * 0.16, -0.6); c.fillStyle = '#fff'; c.fill();
    c.restore();
  };
  K.pearl = (c, x, y, r) => { G.circ(c, x, y, r); c.fillStyle = G.rgrad(c, x - r * 0.35, y - r * 0.35, r * 0.1, r * 1.1, [[0, '#ffffff'], [0.6, '#f4eef8'], [1, '#c9bfdc']]); c.fill(); c.strokeStyle = '#b7aacb'; c.lineWidth = 0.8; c.stroke(); };
  K.pearlLine = (c, pts, r) => pts.forEach(([x, y]) => K.pearl(c, x, y, r));
  K.twinkle = (c, x, y, s, t, ph = 0) => {
    const k = 0.5 + Math.sin(t * 0.006 + ph) * 0.5;
    if (k < 0.15) return;
    c.save(); c.globalAlpha *= k; c.fillStyle = '#ffffff';
    G.star(c, x, y, s * (0.6 + k * 0.6), s * 0.18, 4, 0); c.fill();
    c.restore();
  };
  K.scallops = (c, x0, x1, y, r, fill, line) => {
    c.beginPath(); c.moveTo(x0, y - r);
    for (let x = x0; x < x1 - 0.1; x += r * 2) c.arc(x + r, y - r, r, Math.PI, 0, true);
    c.lineTo(x1, y - r * 2.4); c.lineTo(x0, y - r * 2.4); c.closePath();
    c.fillStyle = fill; c.fill(); if (line) { c.strokeStyle = line; c.lineWidth = 1.6; c.stroke(); }
  };
  K.rose = (c, x, y, r, col = '#ff5d8a') => {
    G.ell(c, x - r * 0.9, y + r * 0.5, r * 0.6, r * 0.3, -0.5); c.fillStyle = '#58b44e'; c.fill();
    G.ell(c, x + r * 0.9, y + r * 0.5, r * 0.6, r * 0.3, 0.5); c.fill();
    G.circ(c, x, y, r); c.fillStyle = G.rgrad(c, x, y, 0, r, [[0, PT.shade(col, -0.25)], [1, col]]); c.fill();
    c.strokeStyle = PT.shade(col, -0.4); c.lineWidth = Math.max(1, r * 0.16);
    c.beginPath(); for (let a = 0; a < 10; a += 0.25) { const rr = (a / 10) * r * 0.85; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; a ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
  };
  K.swirl = (c, x, y, s, col) => { c.strokeStyle = col; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 10 * s, y + 4 * s); c.quadraticCurveTo(x - 10 * s, y - 8 * s, x, y - 6 * s); c.quadraticCurveTo(x + 8 * s, y - 4 * s, x + 4 * s, y + 2 * s); c.quadraticCurveTo(x, y + 4 * s, x - 2 * s, y); c.stroke(); };

  /* ================= ドレス・おうじさまの ふく ================= */
  // ボールガウン（ふわっと ひろがる スカート＋ パフスリーブ）
  const gown = (opt) => (c, ch, t) => {
    const sway = Math.sin((t || 0) * 0.004) * 3 + (ch.pose === 'dance' || ch.pose === 'spin' ? Math.sin((t || 0) * 0.012) * 6 : 0);
    const [c0, c1, c2] = opt.cols;
    // スカート（3だん）
    for (let k = 2; k >= 0; k--) {
      const top = -58 + k * 14, wid = 58 - k * 9, bot = 2 - k * 12;
      c.beginPath(); c.moveTo(-18, top);
      c.bezierCurveTo(-30 - k * 4, top + 14, -wid - 6 + sway, bot - 22, -wid + sway, bot);
      const n = 7 - k;
      for (let i = 0; i < n; i++) { const x0 = -wid + sway + (i * 2 * wid) / n, x1 = -wid + sway + ((i + 1) * 2 * wid) / n; c.quadraticCurveTo((x0 + x1) / 2, bot + 9, x1, bot); }
      c.bezierCurveTo(wid + 6 + sway, bot - 22, 30 + k * 4, top + 14, 18, top);
      c.closePath();
      c.fillStyle = G.grad(c, 0, top, 0, bot, [[0, k === 0 ? c0 : c1], [1, k === 2 ? c2 : PT.shade(c1, -0.08)]]); c.fill();
      c.strokeStyle = PT.line(c1); c.lineWidth = 2.6; c.stroke();
      // すそのレース
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2.2;
      c.beginPath(); for (let i = 0; i < n; i++) { const x0 = -wid + 4 + sway + (i * 2 * (wid - 4)) / n, x1 = -wid + 4 + sway + ((i + 1) * 2 * (wid - 4)) / n; i ? c.quadraticCurveTo((x0 + x1) / 2, bot + 2, x1, bot - 5) : (c.moveTo(x0, bot - 5), c.quadraticCurveTo((x0 + x1) / 2, bot + 2, x1, bot - 5)); } c.stroke();
    }
    // スカートの かざり
    if (opt.deco === 'rose') { for (let i = -2; i <= 2; i++) K.rose(c, i * 22 + sway, -6 + Math.abs(i) * -2, 6.5, i % 2 ? '#ff7aa8' : '#ff4d7e'); }
    if (opt.deco === 'snow') { c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.6; [[-34, -16], [6, -26], [36, -12], [-12, -40], [22, -44]].forEach(([x, y]) => { for (let i = 0; i < 6; i++) { const a = (i / 6) * PT.TAU; c.beginPath(); c.moveTo(x + sway * 0.5, y); c.lineTo(x + sway * 0.5 + Math.cos(a) * 6, y + Math.sin(a) * 6); c.stroke(); } }); for (let i = 0; i < 5; i++) K.twinkle(c, -40 + i * 20 + sway, -10 - (i % 3) * 14, 6, t, i * 1.3); }
    if (opt.deco === 'gold') { [[-30, -14], [0, -22], [30, -14], [-16, -38], [16, -38]].forEach(([x, y]) => K.swirl(c, x + sway * 0.6, y, 1.1, '#e3a21a')); K.pearlLine(c, [-44, -26, -8, 10, 28, 46].map((x) => [x + sway, -4]), 2.4); }
    // ボディス
    c.beginPath(); c.moveTo(-21, -58); c.lineTo(-24, -82); c.quadraticCurveTo(-12, -90, 0, -84); c.quadraticCurveTo(12, -90, 24, -82); c.lineTo(21, -58); c.closePath();
    c.fillStyle = G.grad(c, 0, -90, 0, -56, [[0, PT.shade(c0, 0.15)], [1, c0]]); c.fill(); c.strokeStyle = PT.line(c0); c.lineWidth = 2.6; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.5; for (const x of [-9, 0, 9]) { c.beginPath(); c.moveTo(x, -82); c.lineTo(x * 0.8, -60); c.stroke(); }
    // パフスリーブ
    for (const sd of [-1, 1]) { G.ell(c, sd * 27, -80, 11, 9, sd * 0.3); c.fillStyle = G.rgrad(c, sd * 24, -84, 1, 13, [[0, '#ffffff'], [1, opt.sleeve || c1]]); c.fill(); c.strokeStyle = PT.line(c1); c.lineWidth = 2.2; c.stroke(); }
    // ウエストの リボンと ほうせき
    G.rr(c, -22, -62, 44, 8, 4); c.fillStyle = K.gold(c, -62, -54); c.fill(); c.strokeStyle = GOLD[3]; c.lineWidth = 1.6; c.stroke();
    K.gem(c, 0, -74, 5.5, opt.gem || '#ff4d7e', 'heart');
    K.pearlLine(c, [[-12, -85], [-6, -87], [6, -87], [12, -85]], 2.2);
  };
  EXT.body.gown_rose = gown({ cols: ['#ff9fc4', '#ffb8d4', '#ff86b4'], deco: 'rose', gem: '#ff2f6d', sleeve: '#ffd6e6' });
  EXT.body.gown_snow = gown({ cols: ['#a9dcff', '#c9ebff', '#7fc4f2'], deco: 'snow', gem: '#7fd0ff', sleeve: '#e6f6ff' });
  EXT.body.gown_snow.back = (c, ch, t) => {
    // うすい ケープ
    const fl = Math.sin((t || 0) * 0.006) * 6;
    c.save(); c.globalAlpha *= 0.7;
    c.beginPath(); c.moveTo(-22, -86); c.quadraticCurveTo(-60 - fl, -40, -56 - fl, 2); c.lineTo(56 + fl, 2); c.quadraticCurveTo(60 + fl, -40, 22, -86); c.closePath();
    c.fillStyle = G.grad(c, 0, -86, 0, 2, [[0, 'rgba(220,245,255,.9)'], [1, 'rgba(160,215,255,.6)']]); c.fill(); c.strokeStyle = '#9fd0f2'; c.lineWidth = 2; c.stroke();
    c.restore();
    for (let i = 0; i < 4; i++) K.twinkle(c, -46 + i * 30, -20 - (i % 2) * 30, 5, t, i * 2);
  };
  EXT.body.gown_gold = gown({ cols: ['#ffe680', '#fff0a8', '#ffd24a'], deco: 'gold', gem: '#4c9be8', sleeve: '#fff8d6' });
  // もとの ドレスも こったデザインに
  EXT.body.dress = gown({ cols: ['#ffb0d2', '#ffc7df', '#ff9cc6'], deco: 'rose', gem: '#ff4d7e', sleeve: '#ffe0ee' });

  EXT.body.princecoat = (c, ch, t) => {
    // ズボン
    for (const sd of [-1, 1]) { G.rr(c, sd * 13 - 8, -34, 16, 26, 6); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#c9d4ea'; c.lineWidth = 2; c.stroke(); }
    // うわぎ（すそが ながい）
    c.beginPath(); c.moveTo(-26, -86); c.lineTo(-30, -30); c.quadraticCurveTo(-34, -14, -24, -10); c.lineTo(-4, -36); c.lineTo(4, -36); c.lineTo(24, -10); c.quadraticCurveTo(34, -14, 30, -30); c.lineTo(26, -86); c.quadraticCurveTo(0, -94, -26, -86); c.closePath();
    c.fillStyle = G.grad(c, 0, -94, 0, -10, [[0, '#4a6ad0'], [1, '#2a3f8f']]); c.fill(); c.strokeStyle = '#1c2a66'; c.lineWidth = 2.6; c.stroke();
    // きんの ふち
    c.strokeStyle = '#ffd54a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-4, -86); c.lineTo(-4, -38); c.moveTo(4, -86); c.lineTo(4, -38); c.stroke();
    // ボタン
    for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) { G.circ(c, sd * 11, -78 + i * 11, 2.6); c.fillStyle = K.gold(c, -80 + i * 11, -74 + i * 11); c.fill(); }
    // たすき と くんしょう
    c.beginPath(); c.moveTo(-24, -84); c.lineTo(-14, -86); c.lineTo(26, -42); c.lineTo(16, -38); c.closePath(); c.fillStyle = G.grad(c, -20, -86, 20, -40, [[0, '#ff5d6c'], [1, '#d92e45']]); c.fill(); c.strokeStyle = '#a81d33'; c.lineWidth = 1.5; c.stroke();
    G.star(c, 14, -52, 8, 3.6, 8); c.fillStyle = K.gold(c, -60, -44); c.fill(); c.strokeStyle = GOLD[3]; c.lineWidth = 1; c.stroke();
    K.gem(c, 14, -52, 3, '#4c9be8');
    // かたの かざり（エポレット＋ふさ）
    for (const sd of [-1, 1]) {
      G.ell(c, sd * 26, -86, 13, 6, sd * 0.2); c.fillStyle = K.gold(c, -92, -80); c.fill(); c.strokeStyle = GOLD[3]; c.lineWidth = 1.5; c.stroke();
      c.strokeStyle = '#ffd54a'; c.lineWidth = 2; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(sd * 26 + i * 4, -82); c.lineTo(sd * 26 + i * 4.6, -72); c.stroke(); }
    }
    // えり
    G.poly(c, [-12, -90, 0, -78, 12, -90, 6, -94, -6, -94]); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#c9d4ea'; c.lineWidth = 1.5; c.stroke();
  };
  EXT.body.knight = (c, ch, t) => {
    // チュニック
    c.beginPath(); c.moveTo(-24, -60); c.lineTo(-30, -14); c.lineTo(30, -14); c.lineTo(24, -60); c.closePath(); c.fillStyle = '#3f6ad8'; c.fill(); c.strokeStyle = '#26408a'; c.lineWidth = 2.4; c.stroke();
    c.fillStyle = '#ffd54a'; for (let i = 0; i < 5; i++) { G.poly(c, [-30 + i * 12, -14, -24 + i * 12, -6, -18 + i * 12, -14]); c.fill(); }
    // むねあて
    c.beginPath(); c.moveTo(-26, -88); c.quadraticCurveTo(0, -96, 26, -88); c.lineTo(24, -58); c.quadraticCurveTo(0, -48, -24, -58); c.closePath();
    c.fillStyle = K.silver(c, -96, -50); c.fill(); c.strokeStyle = '#6a7894'; c.lineWidth = 2.6; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-16, -84); c.quadraticCurveTo(-18, -70, -12, -60); c.stroke();
    c.strokeStyle = '#ffd54a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-26, -88); c.quadraticCurveTo(0, -96, 26, -88); c.stroke();
    // もんしょう（ハートの たて）
    c.beginPath(); c.moveTo(-11, -82); c.lineTo(11, -82); c.lineTo(11, -70); c.quadraticCurveTo(0, -58, 0, -58); c.quadraticCurveTo(0, -58, -11, -70); c.closePath();
    c.fillStyle = '#3f6ad8'; c.fill(); c.strokeStyle = '#ffd54a'; c.lineWidth = 2; c.stroke();
    G.heart(c, 0, -70, 6); c.fillStyle = '#ffd54a'; c.fill();
    // かたあて
    for (const sd of [-1, 1]) { G.ell(c, sd * 27, -82, 12, 9, sd * 0.4); c.fillStyle = K.silver(c, -92, -72); c.fill(); c.strokeStyle = '#6a7894'; c.lineWidth = 2; c.stroke(); }
  };
  // おうさまの マント（せなか）
  EXT.back.royalcape = (c, ch, t) => {
    const fl = Math.sin((t || 0) * 0.008) * 5 + (ch.pose === 'run' || ch.pose === 'walk' ? 10 : 0);
    c.beginPath(); c.moveTo(-28, -88); c.bezierCurveTo(-56 - fl, -50, -62 - fl, -20, -60 - fl, 4); c.quadraticCurveTo(0, 14, 58 + fl * 0.4, 4); c.bezierCurveTo(60, -20, 54, -50, 28, -88); c.closePath();
    c.fillStyle = G.grad(c, -50, -88, 50, 4, [[0, '#e8384f'], [0.5, '#b0182f'], [1, '#d42a44']]); c.fill(); c.strokeStyle = '#7e0f22'; c.lineWidth = 3; c.stroke();
    c.strokeStyle = '#ffd54a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-58 - fl, -2); c.quadraticCurveTo(0, 8, 56 + fl * 0.4, -2); c.stroke();
    // ふわふわの えり（エルミン）
    G.blob(c, [-44, -86, -36, -100, -14, -96, 0, -100, 14, -96, 36, -100, 44, -86, 30, -78, 0, -82, -30, -78]); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#cfd6e6'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#2b2440'; [[-32, -90], [-14, -88], [6, -90], [24, -88], [36, -92]].forEach(([x, y]) => { G.ell(c, x, y, 1.8, 3); c.fill(); });
  };

  /* ================= ぼうし・ティアラ・かんむり ================= */
  EXT.hat.royalcrown = (c, ch, t) => {
    // ベルベットの なか
    c.beginPath(); c.moveTo(-30, -158); c.quadraticCurveTo(-32, -206, 0, -208); c.quadraticCurveTo(32, -206, 30, -158); c.closePath();
    c.fillStyle = G.grad(c, 0, -208, 0, -158, [[0, '#e8384f'], [1, '#9a1530']]); c.fill(); c.strokeStyle = '#6e0c22'; c.lineWidth = 2.4; c.stroke();
    // アーチ
    c.strokeStyle = K.gold(c, -214, -160); c.lineWidth = 7; c.lineCap = 'round';
    for (const sd of [-1, 0, 1]) { c.beginPath(); c.moveTo(sd * 28, -162); c.quadraticCurveTo(sd * 20, -206, 0, -208); c.stroke(); }
    c.strokeStyle = GOLD[3]; c.lineWidth = 1.4; for (const sd of [-1, 0, 1]) { c.beginPath(); c.moveTo(sd * 28, -162); c.quadraticCurveTo(sd * 20, -206, 0, -208); c.stroke(); }
    K.pearlLine(c, [[-22, -186], [-14, -198], [14, -198], [22, -186]], 2.6);
    // てっぺんの ほし
    G.circ(c, 0, -212, 7); c.fillStyle = K.gold(c, -219, -205); c.fill(); c.strokeStyle = GOLD[3]; c.lineWidth = 1.5; c.stroke();
    G.star(c, 0, -226, 9, 4); c.fillStyle = K.gold(c, -235, -217); c.fill(); c.stroke();
    // おびと とがった ところ
    G.rr(c, -36, -168, 72, 18, 5); c.fillStyle = K.gold(c, -168, -150); c.fill(); c.strokeStyle = GOLD[3]; c.lineWidth = 2; c.stroke();
    K.scallops(c, -36, 36, -150, 3, '#ffffff', '#cfd6e6');
    ['#ff2f6d', '#4c9be8', '#3fb36b', '#4c9be8', '#ff2f6d'].forEach((col, i) => K.gem(c, -26 + i * 13, -159, i === 2 ? 5.5 : 4, col, i === 2 ? 'diamond' : 'round'));
    K.twinkle(c, 18, -214, 8, t, 0.5);
  };
  const tiara = (heart) => (c, ch, t) => {
    // ほそい わっか
    c.strokeStyle = K.silver(c, -162, -150); c.lineWidth = 5; c.beginPath(); c.ellipse(0, -150, 40, 9, 0, Math.PI, PT.TAU); c.stroke();
    // うずまき もよう
    c.lineWidth = 3.4; c.lineCap = 'round'; c.strokeStyle = K.silver(c, -196, -150);
    for (const sd of [-1, 1]) {
      c.beginPath(); c.moveTo(sd * 36, -154); c.quadraticCurveTo(sd * 34, -170, sd * 22, -170); c.quadraticCurveTo(sd * 12, -170, sd * 14, -160); c.stroke();
      c.beginPath(); c.moveTo(sd * 20, -158); c.quadraticCurveTo(sd * 18, -180, sd * 6, -186); c.stroke();
      K.pearl(c, sd * 22, -172, 3); K.pearl(c, sd * 36, -162, 2.6);
      K.gem(c, sd * 14, -166, 3.4, heart ? '#ff7aa8' : '#9fd8ff', 'drop');
    }
    c.strokeStyle = '#8796b3'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, -150, 40, 9, 0, Math.PI, PT.TAU); c.stroke();
    // まんなかの ほうせき
    if (heart) K.gem(c, 0, -184, 9, '#ff2f6d', 'heart');
    else { K.gem(c, 0, -184, 8, '#7fd0ff', 'drop'); }
    K.pearl(c, 0, -198, 3.4);
    K.twinkle(c, -10, -194, 7, t, 0); K.twinkle(c, 26, -176, 6, t, 2);
  };
  EXT.hat.hearttiara = tiara(true);
  EXT.hat.tiara = tiara(false);
  EXT.hat.crown = (c, ch, t) => {
    c.beginPath(); c.moveTo(-32, -152); c.lineTo(-36, -194); c.lineTo(-18, -172); c.lineTo(0, -202); c.lineTo(18, -172); c.lineTo(36, -194); c.lineTo(32, -152); c.closePath();
    c.fillStyle = K.gold(c, -202, -152); c.fill(); c.strokeStyle = GOLD[3]; c.lineWidth = 2.6; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-26, -158); c.lineTo(-28, -180); c.stroke();
    for (const [x, y] of [[-36, -196], [0, -205], [36, -196]]) K.pearl(c, x, y, 4.2);
    G.rr(c, -34, -164, 68, 12, 4); c.fillStyle = 'rgba(160,30,60,.85)'; c.fill();
    K.gem(c, 0, -170, 6.5, '#ff2f6d', 'diamond'); K.gem(c, -20, -160, 4, '#4c9be8'); K.gem(c, 20, -160, 4, '#3fb36b');
    K.twinkle(c, 12, -196, 7, t, 1);
  };
  EXT.hat.veiltiara = (c, ch, t) => {
    const wv = Math.sin((t || 0) * 0.004) * 4;
    // ベール
    c.save(); c.globalAlpha *= 0.55;
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 30, -160); c.quadraticCurveTo(sd * (68 + wv), -120, sd * (62 + wv), -60); c.quadraticCurveTo(sd * 52, -64, sd * 44, -100); c.quadraticCurveTo(sd * 44, -140, sd * 18, -158); c.closePath(); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#d9d0ee'; c.lineWidth = 2; c.stroke(); }
    c.restore();
    // はなの かんむり
    const cols = ['#ffffff', '#ffd1e0', '#ffffff', '#fff3b0', '#ffffff'];
    for (let i = 0; i < 7; i++) { const a = Math.PI + 0.25 + (i / 6) * (Math.PI - 0.5); const x = Math.cos(a) * 40, y = -152 + Math.sin(a) * 12; for (let k = 0; k < 5; k++) { const b = (k / 5) * PT.TAU; G.circ(c, x + Math.cos(b) * 5, y + Math.sin(b) * 5, 4.4); c.fillStyle = cols[i % cols.length]; c.fill(); } G.circ(c, x, y, 3); c.fillStyle = '#ffd23f'; c.fill(); }
    K.gem(c, 0, -170, 6, '#b39ae8', 'diamond'); K.pearl(c, -10, -166, 2.6); K.pearl(c, 10, -166, 2.6);
  };
  EXT.hat.knighthelm = (c, ch, t) => {
    const pl = Math.sin((t || 0) * 0.006) * 0.1;
    // はねかざり
    c.save(); c.translate(0, -204); c.rotate(-0.3 + pl);
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-10, -30, 10, -56, 40, -60); c.bezierCurveTo(26, -40, 22, -14, 6, 4); c.closePath();
    c.fillStyle = G.grad(c, 0, -60, 0, 4, [[0, '#ff8fab'], [1, '#e8384f']]); c.fill(); c.strokeStyle = '#a81d33'; c.lineWidth = 2; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.5; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(4 + i * 4, -8 - i * 10); c.lineTo(16 + i * 6, -14 - i * 10); c.stroke(); }
    c.restore();
    // かぶと
    c.beginPath(); c.moveTo(-44, -140); c.quadraticCurveTo(-46, -206, 0, -208); c.quadraticCurveTo(46, -206, 44, -140); c.lineTo(36, -142); c.quadraticCurveTo(36, -184, 0, -186); c.quadraticCurveTo(-36, -184, -36, -142); c.closePath();
    c.fillStyle = K.silver(c, -208, -140); c.fill(); c.strokeStyle = '#6a7894'; c.lineWidth = 2.6; c.stroke();
    c.strokeStyle = '#ffd54a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -208); c.lineTo(0, -186); c.stroke();
    // バイザー（あげている）
    c.beginPath(); c.moveTo(-40, -176); c.quadraticCurveTo(0, -196, 40, -176); c.lineTo(38, -166); c.quadraticCurveTo(0, -184, -38, -166); c.closePath(); c.fillStyle = K.silver(c, -196, -166); c.fill(); c.strokeStyle = '#6a7894'; c.lineWidth = 2; c.stroke();
    for (let i = -2; i <= 2; i++) { c.fillStyle = '#6a7894'; c.fillRect(i * 12 - 4, -180 + Math.abs(i) * 2, 8, 2.5); }
    G.circ(c, -38, -168, 3.4); c.fillStyle = K.gold(c, -172, -164); c.fill(); G.circ(c, 38, -168, 3.4); c.fill();
  };

  /* ================= アイテム定義 ================= */
  const def = (id, o) => { PT.ITEMS[id] = Object.assign({ id, tags: [], w: 90, h: 90 }, o); };
  const wearIcon = (kind, slot, off) => (c, t) => { c.save(); c.translate(0, off); PT.drawWearPiece(c, slot, kind, t || 0); c.restore(); };
  const WR = (id, name, slot, kind, role, w, h, off) => def(id, { name, cat: 'dress', tags: [slot === 'hat' ? 'hat' : slot, role, 'royal'], w, h, wear: [slot, kind], role, draw: wearIcon(kind, slot, off) });
  WR('gown_rose', 'ローズの ドレス', 'body', 'gown_rose', 'princess', 130, 100, 0);
  WR('gown_snow', 'こおりの ドレス', 'body', 'gown_snow', 'snowprincess', 130, 100, 0);
  WR('gown_gold', 'きんいろの ドレス', 'body', 'gown_gold', 'princess', 130, 100, 0);
  WR('princecoat', 'おうじさまの ふく', 'body', 'princecoat', 'prince', 80, 90, 4);
  WR('knight', 'ナイトの よろい', 'body', 'knight', 'knight', 80, 90, 6);
  WR('royalcape', 'おうさまの マント', 'back', 'royalcape', 'royal', 130, 110, 0);
  WR('royalcrown', 'りっぱな おうかん', 'hat', 'royalcrown', 'royal', 80, 90, 150);
  WR('hearttiara', 'ハートの ティアラ', 'hat', 'hearttiara', 'princess', 90, 60, 148);
  WR('veiltiara', 'ベールの はなかんむり', 'hat', 'veiltiara', 'princess', 140, 120, 60);
  WR('knighthelm', 'ナイトの かぶと', 'hat', 'knighthelm', 'knight', 110, 130, 140);
  // パネル用：ドレスは からだごと 見せる
  ['gown_rose', 'gown_snow', 'gown_gold'].forEach((id) => { const kind = PT.ITEMS[id].wear[1]; PT.ITEMS[id].draw = (c, t) => { c.save(); EXT.body[kind](c, { wear: { body: kind }, pose: 'idle' }, t || 0); if (EXT.body[kind].back) { /* ケープは うしろ */ } c.restore(); }; });

  const T = (id, o) => def(id, Object.assign({ cat: 'tools' }, o));
  T('throne', { name: 'おうさまの いす', tags: ['seat', 'royal', 'furniture'], w: 130, h: 180, draw(c, t) {
    // せもたれ
    c.beginPath(); c.moveTo(-48, -60); c.lineTo(-52, -150); c.quadraticCurveTo(-50, -176, -30, -172); c.quadraticCurveTo(-16, -196, 0, -180); c.quadraticCurveTo(16, -196, 30, -172); c.quadraticCurveTo(50, -176, 52, -150); c.lineTo(48, -60); c.closePath();
    c.fillStyle = K.gold(c, -196, -60); c.fill(); c.strokeStyle = GOLD[3]; c.lineWidth = 3; c.stroke();
    c.beginPath(); c.moveTo(-36, -64); c.lineTo(-38, -146); c.quadraticCurveTo(0, -172, 38, -146); c.lineTo(36, -64); c.closePath();
    c.fillStyle = G.grad(c, 0, -170, 0, -64, [[0, '#e8384f'], [1, '#9a1530']]); c.fill(); c.strokeStyle = '#6e0c22'; c.lineWidth = 2; c.stroke();
    c.fillStyle = 'rgba(255,200,120,.5)'; for (let y = -140; y < -70; y += 18) for (let x = -24; x <= 24; x += 16) { G.circ(c, x + ((y / 18) % 2) * 8, y, 2); c.fill(); }
    K.gem(c, 0, -160, 8, '#4c9be8', 'diamond'); K.pearl(c, -30, -174, 4); K.pearl(c, 30, -174, 4); K.pearl(c, 0, -186, 4.4);
    // ざぶとん と ひじかけ
    G.rr(c, -52, -66, 104, 22, 10); c.fillStyle = G.grad(c, 0, -66, 0, -44, [[0, '#ff5d6c'], [1, '#b0182f']]); c.fill(); c.strokeStyle = '#7e0f22'; c.lineWidth = 2.4; c.stroke();
    for (const sd of [-1, 1]) { G.rr(c, sd * 56 - 8, -96, 16, 50, 7); c.fillStyle = K.gold(c, -96, -46); c.fill(); c.strokeStyle = GOLD[3]; c.lineWidth = 2; c.stroke(); K.pearl(c, sd * 56, -98, 5); }
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 44, -46); c.quadraticCurveTo(sd * 50, -20, sd * 40, 0); c.lineTo(sd * 30, 0); c.quadraticCurveTo(sd * 38, -22, sd * 32, -46); c.closePath(); c.fillStyle = K.gold(c, -46, 0); c.fill(); c.strokeStyle = GOLD[3]; c.lineWidth = 2; c.stroke(); }
    K.twinkle(c, 24, -184, 8, t, 0);
  } });
  T('slipper', { name: 'ガラスの くつ', tags: ['royal', 'shoe'], w: 80, h: 50, draw(c, t) {
    c.save(); c.globalAlpha *= 0.92;
    c.beginPath(); c.moveTo(-34, -10); c.quadraticCurveTo(-36, -30, -16, -34); c.quadraticCurveTo(4, -30, 14, -20); c.quadraticCurveTo(30, -18, 36, -8); c.lineTo(34, -2); c.lineTo(-30, -2); c.closePath();
    c.fillStyle = G.grad(c, -30, -34, 30, 0, [[0, 'rgba(230,248,255,.95)'], [0.5, 'rgba(160,220,255,.75)'], [1, 'rgba(210,190,255,.9)']]); c.fill(); c.strokeStyle = '#8fb8e8'; c.lineWidth = 2.4; c.stroke();
    c.restore();
    c.strokeStyle = '#8fb8e8'; c.lineWidth = 4; c.beginPath(); c.moveTo(-28, -4); c.lineTo(-30, 8); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-26, -24); c.quadraticCurveTo(-14, -30, -4, -26); c.stroke();
    K.gem(c, 10, -24, 4, '#b39ae8', 'diamond');
    K.twinkle(c, -18, -30, 7, t, 0); K.twinkle(c, 28, -12, 5, t, 2);
  } });
  T('mirror', { name: 'まほうの かがみ', tags: ['royal', 'magic', 'mirror'], w: 100, h: 160, draw(c, t, st) {
    G.rr(c, -8, -40, 16, 40, 4); c.fillStyle = K.gold(c, -40, 0); c.fill(); c.strokeStyle = GOLD[3]; c.lineWidth = 2; c.stroke();
    G.ell(c, 0, -2, 30, 7); c.fillStyle = K.gold(c, -9, 5); c.fill(); c.stroke();
    // わく
    G.ell(c, 0, -98, 44, 58); c.fillStyle = K.gold(c, -156, -40); c.fill(); c.strokeStyle = GOLD[3]; c.lineWidth = 3; c.stroke();
    for (let i = 0; i < 14; i++) { const a = (i / 14) * PT.TAU; K.pearl(c, Math.cos(a) * 41, -98 + Math.sin(a) * 55, 3); }
    // かがみ
    const glow = st && st.glow && t < st.glow;
    G.ell(c, 0, -98, 34, 47); c.fillStyle = G.grad(c, -30, -144, 30, -52, [[0, glow ? '#fff3d0' : '#dff4ff'], [0.5, glow ? '#ffd6f0' : '#a9d8f5'], [1, glow ? '#d9c4ff' : '#cbe9fb']]); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 5; c.beginPath(); c.moveTo(-18, -128); c.lineTo(-4, -142); c.moveTo(-22, -110); c.lineTo(4, -136); c.stroke();
    if (glow) { c.fillStyle = 'rgba(255,255,255,.5)'; G.heart(c, 0, -94, 18); c.fill(); }
    // てっぺんの かざり
    K.gem(c, 0, -160, 8, '#ff2f6d', 'heart');
    for (const sd of [-1, 1]) K.swirl(c, sd * 20, -152, 1, '#e3a21a');
    K.twinkle(c, 22, -128, 8, t, 1);
  } });
  T('jewelbox', { name: 'ほうせきばこ', tags: ['royal', 'treasure'], w: 100, h: 90, draw(c, t, st) {
    const open = st && st.open;
    G.rr(c, -44, -48, 88, 46, 8); c.fillStyle = G.grad(c, 0, -48, 0, -2, [[0, '#ffb8d4'], [1, '#e86a9a']]); c.fill(); c.strokeStyle = '#b8436e'; c.lineWidth = 2.6; c.stroke();
    c.strokeStyle = K.gold(c, -48, -2); c.lineWidth = 4; c.strokeRect(-44, -48, 88, 46);
    for (let i = 0; i < 4; i++) K.swirl(c, -30 + i * 20, -22, 0.9, '#ffd54a');
    if (open) {
      c.save(); c.translate(-44, -48); c.rotate(-1.0); G.rr(c, 0, -30, 88, 30, 10); c.fillStyle = G.grad(c, 0, -30, 0, 0, [[0, '#ffc7df'], [1, '#ff9cc6']]); c.fill(); c.strokeStyle = '#b8436e'; c.lineWidth = 2.4; c.stroke(); c.restore();
      K.gem(c, -16, -54, 8, '#ff2f6d', 'heart'); K.gem(c, 6, -58, 7, '#4c9be8', 'diamond'); K.gem(c, 24, -52, 6, '#3fb36b'); K.pearlLine(c, [-30, -22, -14, -6, 2, 10, 18, 26, 34].map((x, i) => [x, -48 - Math.sin(i / 8 * Math.PI) * 10]), 2.6);
      K.twinkle(c, -2, -70, 10, t, 0);
    } else {
      c.beginPath(); c.moveTo(-48, -48); c.quadraticCurveTo(-46, -84, 0, -86); c.quadraticCurveTo(46, -84, 48, -48); c.closePath();
      c.fillStyle = G.grad(c, 0, -86, 0, -48, [[0, '#ffd6e6'], [1, '#ff9cc6']]); c.fill(); c.strokeStyle = '#b8436e'; c.lineWidth = 2.6; c.stroke();
      c.strokeStyle = '#ffd54a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-46, -50); c.quadraticCurveTo(-44, -82, 0, -84); c.quadraticCurveTo(44, -82, 46, -50); c.stroke();
      K.gem(c, 0, -70, 8, '#ff2f6d', 'heart'); K.pearl(c, -24, -66, 3); K.pearl(c, 24, -66, 3);
    }
    G.rr(c, -8, -44, 16, 12, 3); c.fillStyle = K.gold(c, -44, -32); c.fill();
  } });
  T('teaset', { name: 'ロイヤル ティーセット', tags: ['royal', 'dish', 'cook'], w: 130, h: 80, draw(c, t) {
    G.ell(c, 0, -8, 62, 12); c.fillStyle = K.silver(c, -20, 4); c.fill(); c.strokeStyle = '#8796b3'; c.lineWidth = 2.4; c.stroke();
    // ポット
    c.beginPath(); c.moveTo(-40, -14); c.quadraticCurveTo(-58, -40, -36, -60); c.quadraticCurveTo(-16, -66, -2, -56); c.quadraticCurveTo(12, -40, -4, -14); c.closePath();
    c.fillStyle = G.grad(c, -40, -64, 0, -14, [[0, '#ffffff'], [1, '#e6ecf8']]); c.fill(); c.strokeStyle = '#9aa8c6'; c.lineWidth = 2.4; c.stroke();
    c.strokeStyle = '#9aa8c6'; c.lineWidth = 4; c.beginPath(); c.moveTo(-50, -48); c.quadraticCurveTo(-66, -40, -52, -24); c.stroke();
    c.beginPath(); c.moveTo(-6, -36); c.quadraticCurveTo(10, -44, 14, -56); c.stroke();
    K.rose(c, -26, -38, 6); G.ell(c, -20, -66, 10, 4); c.fillStyle = K.gold(c, -70, -62); c.fill(); K.pearl(c, -20, -70, 3.4);
    // カップ
    for (const x of [22, 46]) { G.ell(c, x, -14, 14, 4); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#9aa8c6'; c.lineWidth = 1.6; c.stroke(); c.beginPath(); c.moveTo(x - 10, -30); c.quadraticCurveTo(x - 10, -16, x, -16); c.quadraticCurveTo(x + 10, -16, x + 10, -30); c.closePath(); c.fillStyle = '#ffffff'; c.fill(); c.stroke(); c.strokeStyle = '#ff86b4'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 10, -27); c.lineTo(x + 10, -27); c.stroke(); c.strokeStyle = '#9aa8c6'; c.beginPath(); c.arc(x + 12, -24, 4, -1.4, 1.4); c.stroke(); }
    c.strokeStyle = 'rgba(200,210,230,.7)'; c.lineWidth = 2; for (let i = 0; i < 2; i++) { const y = -36 - ((t * 0.02 + i * 10) % 20); c.beginPath(); c.moveTo(22 + i * 24, y); c.quadraticCurveTo(26 + i * 24, y - 6, 22 + i * 24, y - 12); c.stroke(); }
  } });
  T('rose', { name: 'バラの はな', tags: ['royal', 'flower', 'gift'], w: 50, h: 100, draw(c) {
    c.strokeStyle = '#3f8a4a'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-4, -40, 0, -70); c.stroke();
    c.fillStyle = '#3f8a4a'; G.poly(c, [-2, -26, -8, -30, -2, -32]); c.fill();
    G.ell(c, -10, -44, 10, 5, 0.6); c.fillStyle = '#58b44e'; c.fill(); G.ell(c, 10, -34, 10, 5, -0.6); c.fill();
    G.blob(c, [-16, -76, -14, -92, 0, -98, 14, -92, 16, -76, 0, -66]); c.fillStyle = G.rgrad(c, 0, -82, 2, 18, [[0, '#b0123c'], [1, '#ff3d6e']]); c.fill(); c.strokeStyle = '#8a0e30'; c.lineWidth = 2; c.stroke();
    c.strokeStyle = 'rgba(255,200,220,.75)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-8, -86); c.quadraticCurveTo(0, -94, 8, -86); c.quadraticCurveTo(2, -78, -4, -82); c.stroke();
    c.beginPath(); c.moveTo(-12, -78); c.quadraticCurveTo(0, -70, 12, -78); c.stroke();
  } });
  T('invitation', { name: 'ぶとうかいの しょうたいじょう', tags: ['royal', 'letter', 'party'], w: 90, h: 70, draw(c, t) {
    G.rr(c, -40, -60, 80, 56, 6); c.fillStyle = G.grad(c, 0, -60, 0, -4, [[0, '#fffaf0'], [1, '#f6e6c8']]); c.fill(); c.strokeStyle = '#c9a25a'; c.lineWidth = 2.4; c.stroke();
    c.strokeStyle = K.gold(c, -60, -4); c.lineWidth = 2; c.strokeRect(-34, -54, 68, 44);
    c.beginPath(); c.moveTo(-40, -60); c.lineTo(0, -30); c.lineTo(40, -60); c.strokeStyle = '#c9a25a'; c.lineWidth = 2; c.stroke();
    G.circ(c, 0, -30, 10); c.fillStyle = G.rgrad(c, -3, -33, 1, 11, [[0, '#ff6f8a'], [1, '#b0123c']]); c.fill(); c.strokeStyle = '#8a0e30'; c.lineWidth = 1.5; c.stroke();
    G.star(c, 0, -30, 5, 2); c.fillStyle = '#ffd54a'; c.fill();
    K.twinkle(c, 30, -56, 6, t, 0);
  } });
  T('redcarpet', { name: 'レッドカーペット', tags: ['royal', 'cloth', 'parade'], w: 200, h: 40, draw(c) {
    G.poly(c, [-96, -4, -70, -34, 96, -34, 100, -4]); c.fillStyle = G.grad(c, 0, -34, 0, -4, [[0, '#e8384f'], [1, '#a81d33']]); c.fill(); c.strokeStyle = '#7e0f22'; c.lineWidth = 2.4; c.stroke();
    c.strokeStyle = '#ffd54a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-90, -8); c.lineTo(-66, -30); c.lineTo(92, -30); c.moveTo(-88, -8); c.lineTo(96, -8); c.stroke();
    c.fillStyle = '#ffd54a'; for (let x = -88; x < 96; x += 14) { c.fillRect(x, -4, 3, 6); }
  } });
  T('castletoy', { name: 'おしろ', tags: ['royal', 'castle', 'big'], w: 220, h: 230, draw(c, t, st) {
    const pink = (y0, y1) => G.grad(c, 0, y0, 0, y1, [[0, '#ffe3ef'], [1, '#ffb8d4']]);
    const tower = (x, w, h, roof) => {
      G.rr(c, x - w / 2, -h, w, h, 3); c.fillStyle = pink(-h, 0); c.fill(); c.strokeStyle = '#d06a96'; c.lineWidth = 2.4; c.stroke();
      c.beginPath(); c.moveTo(x - w / 2 - 6, -h); c.quadraticCurveTo(x - w / 4, -h - 10, x, -h - w * 1.3); c.quadraticCurveTo(x + w / 4, -h - 10, x + w / 2 + 6, -h); c.closePath();
      c.fillStyle = G.grad(c, 0, -h - w * 1.3, 0, -h, [[0, PT.shade(roof, 0.3)], [1, roof]]); c.fill(); c.strokeStyle = PT.shade(roof, -0.4); c.lineWidth = 2.4; c.stroke();
      c.strokeStyle = '#7f8fa6'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, -h - w * 1.3); c.lineTo(x, -h - w * 1.3 - 22); c.stroke();
      G.poly(c, [x, -h - w * 1.3 - 22, x + 16 + Math.sin(t * 0.008 + x) * 3, -h - w * 1.3 - 17, x, -h - w * 1.3 - 12]); c.fillStyle = '#ffd54a'; c.fill();
      G.rr(c, x - 6, -h + 18, 12, 18, 6); c.fillStyle = '#7f6ad8'; c.fill(); K.twinkle(c, x + 2, -h + 22, 4, t, x);
    };
    tower(-80, 44, 170, '#9b7fe8'); tower(80, 44, 170, '#9b7fe8');
    G.rr(c, -64, -120, 128, 120, 3); c.fillStyle = pink(-120, 0); c.fill(); c.strokeStyle = '#d06a96'; c.lineWidth = 2.4; c.stroke();
    for (let i = 0; i < 6; i++) { G.rr(c, -64 + i * 23, -132, 14, 14, 2); c.fillStyle = pink(-132, -118); c.fill(); c.stroke(); }
    tower(0, 54, 200, '#ff86b4');
    // もん
    c.beginPath(); c.moveTo(-22, 0); c.lineTo(-22, -40); c.quadraticCurveTo(0, -64, 22, -40); c.lineTo(22, 0); c.closePath(); c.fillStyle = G.grad(c, 0, -60, 0, 0, [[0, '#c4813a'], [1, '#8a5a2b']]); c.fill(); c.strokeStyle = '#5a3a1a'; c.lineWidth = 2.4; c.stroke();
    G.heart(c, 0, -72, 12); c.fillStyle = '#ff2f6d'; c.fill(); K.gem(c, 0, -76, 5, '#ff2f6d', 'heart');
    for (const sd of [-1, 1]) { G.rr(c, sd * 40 - 8, -90, 16, 24, 8); c.fillStyle = '#7f6ad8'; c.fill(); }
    K.twinkle(c, 40, -150, 8, t, 0); K.twinkle(c, -60, -100, 6, t, 2);
  } });

  const M = (id, o) => def(id, Object.assign({ cat: 'magic' }, o));
  M('scepter', { name: 'おうさまの つえ', tags: ['royal', 'magic', 'wand'], w: 60, h: 130, draw(c, t) {
    c.strokeStyle = K.gold(c, -110, 0); c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -96); c.stroke();
    c.strokeStyle = GOLD[3]; c.lineWidth = 1.4; c.beginPath(); for (let y = -90; y < -6; y += 10) { c.moveTo(-4, y); c.lineTo(4, y + 5); } c.stroke();
    G.ell(c, 0, -98, 12, 5); c.fillStyle = K.gold(c, -103, -93); c.fill(); c.strokeStyle = GOLD[3]; c.stroke();
    for (const sd of [-1, 1]) K.swirl(c, sd * 12, -108, 1.1, '#e3a21a');
    K.gem(c, 0, -120, 13, '#b39ae8', 'round');
    G.star(c, 0, -142, 9, 4); c.fillStyle = K.gold(c, -151, -133); c.fill(); c.strokeStyle = GOLD[3]; c.lineWidth = 1.4; c.stroke();
    K.twinkle(c, 14, -132, 8, t, 0); K.twinkle(c, -14, -112, 6, t, 2);
  } });
  M('chandelier', { name: 'シャンデリア', tags: ['royal', 'light', 'party', 'float'], w: 140, h: 140, float: true, draw(c, t) {
    c.strokeStyle = '#b9780c'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -140); c.lineTo(0, -100); c.stroke();
    for (let k = 0; k < 2; k++) { const r = 56 - k * 24, y = -60 - k * 28; c.strokeStyle = K.gold(c, y - 10, y + 10); c.lineWidth = 6; c.beginPath(); c.ellipse(0, y, r, r * 0.25, 0, 0, PT.TAU); c.stroke(); for (let i = 0; i < 6 - k * 2; i++) { const a = (i / (6 - k * 2)) * PT.TAU; const x = Math.cos(a) * r, yy = y + Math.sin(a) * r * 0.25; G.rr(c, x - 3, yy - 18, 6, 16, 2); c.fillStyle = '#fffaf0'; c.fill(); const f = Math.sin(t * 0.02 + i) * 1.5; G.ell(c, x, yy - 23 + f * 0.2, 3.5, 6 + f); c.fillStyle = '#ffb02e'; c.fill(); c.fillStyle = 'rgba(255,220,120,.25)'; G.circ(c, x, yy - 22, 12); c.fill(); K.gem(c, x, yy + 10, 3.6, '#c9ebff', 'drop'); } }
    K.gem(c, 0, -30, 8, '#c9ebff', 'drop'); K.pearlLine(c, [[-30, -44], [-16, -40], [0, -38], [16, -40], [30, -44]], 2.4);
    K.twinkle(c, 30, -80, 8, t, 0); K.twinkle(c, -36, -56, 6, t, 2);
  } });
  M('harp', { name: 'ハープ', tags: ['royal', 'music', 'sound'], w: 90, h: 130, draw(c, t) {
    c.beginPath(); c.moveTo(-30, 0); c.lineTo(-34, -110); c.quadraticCurveTo(-30, -130, -10, -124); c.quadraticCurveTo(20, -110, 40, -118); c.quadraticCurveTo(44, -100, 30, -94); c.lineTo(-20, -6); c.closePath();
    c.strokeStyle = K.gold(c, -130, 0); c.lineWidth = 9; c.lineJoin = 'round'; c.stroke(); c.strokeStyle = GOLD[3]; c.lineWidth = 1.6; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 1.3; for (let i = 0; i < 8; i++) { const x = -26 + i * 7.5; c.beginPath(); c.moveTo(x, -114 + i * 2.6); c.lineTo(x, -14 - i * 9); c.stroke(); }
    G.ell(c, -26, 0, 16, 6); c.fillStyle = K.gold(c, -6, 6); c.fill();
    K.rose(c, -32, -120, 7); K.gem(c, 40, -118, 5, '#ff2f6d', 'heart');
    K.twinkle(c, 10, -130, 7, t, 0);
  } });
  def('royalcake', { name: 'ロイヤル ケーキ', cat: 'food', tags: ['food', 'sweet', 'party', 'royal'], w: 100, h: 140, food: true, draw(c, t) {
    G.ell(c, 0, -6, 52, 10); c.fillStyle = K.silver(c, -16, 4); c.fill(); c.strokeStyle = '#8796b3'; c.lineWidth = 2; c.stroke();
    const tier = (y, w, h, col) => { G.rr(c, -w / 2, y - h, w, h, 6); c.fillStyle = G.grad(c, 0, y - h, 0, y, [[0, '#ffffff'], [1, col]]); c.fill(); c.strokeStyle = '#d9a8c0'; c.lineWidth = 2; c.stroke(); K.scallops(c, -w / 2, w / 2, y - h + 10, w / 22, '#ffd1e0', '#e6a0bd'); K.pearlLine(c, Array.from({ length: Math.floor(w / 9) }, (_, i) => [-w / 2 + 5 + i * 9, y - 3]), 2); };
    tier(-12, 90, 34, '#ffe6f0'); tier(-46, 66, 30, '#ffeef4'); tier(-76, 44, 26, '#fff4f8');
    K.rose(c, -26, -30, 5); K.rose(c, 24, -30, 5); K.rose(c, 0, -60, 5);
    // ちいさな かんむり
    G.poly(c, [-14, -102, -16, -120, -7, -110, 0, -124, 7, -110, 16, -120, 14, -102]); c.fillStyle = K.gold(c, -124, -102); c.fill(); c.strokeStyle = GOLD[3]; c.lineWidth = 1.6; c.stroke();
    K.gem(c, 0, -110, 3.4, '#ff2f6d');
    K.twinkle(c, 18, -118, 7, t, 0);
  } });

  const V = (id, o) => def(id, Object.assign({ cat: 'rides', tags: ['vehicle', 'ride', 'royal'] }, o));
  V('carriage', { name: 'かぼちゃの ばしゃ', w: 190, h: 170, draw(c, t) {
    const wheel = (x, r) => { G.circ(c, x, -r, r); c.strokeStyle = K.gold(c, -2 * r, 0); c.lineWidth = 6; c.stroke(); c.strokeStyle = '#e3a21a'; c.lineWidth = 2.4; for (let i = 0; i < 8; i++) { const a = (i / 8) * PT.TAU + t * 0.001; c.beginPath(); c.moveTo(x, -r); c.lineTo(x + Math.cos(a) * r, -r + Math.sin(a) * r); c.stroke(); } K.gem(c, x, -r, 4, '#ff86b4'); };
    wheel(-60, 26);
    // かぼちゃ
    c.beginPath(); c.moveTo(-80, -50); c.bezierCurveTo(-96, -110, -50, -150, 0, -146); c.bezierCurveTo(50, -150, 96, -110, 80, -50); c.quadraticCurveTo(0, -30, -80, -50); c.closePath();
    c.fillStyle = G.grad(c, -80, -150, 80, -40, [[0, '#ffc46b'], [0.5, '#ff9a3d'], [1, '#e2731c']]); c.fill(); c.strokeStyle = '#b4560f'; c.lineWidth = 3; c.stroke();
    c.strokeStyle = 'rgba(180,86,15,.6)'; c.lineWidth = 2.4; for (const x of [-40, 0, 40]) { c.beginPath(); c.moveTo(x, -146); c.quadraticCurveTo(x * 1.3, -96, x, -42); c.stroke(); }
    // きんの かざりわく と まど
    c.strokeStyle = K.gold(c, -150, -40); c.lineWidth = 4; for (const x of [-56, 56]) { c.beginPath(); c.moveTo(x, -46); c.quadraticCurveTo(x * 1.2, -100, x * 0.4, -138); c.stroke(); }
    c.beginPath(); c.moveTo(-26, -60); c.lineTo(-26, -100); c.quadraticCurveTo(0, -124, 26, -100); c.lineTo(26, -60); c.closePath(); c.fillStyle = 'rgba(210,240,255,.9)'; c.fill(); c.strokeStyle = K.gold(c, -124, -60); c.lineWidth = 5; c.stroke();
    c.fillStyle = '#ffd1e0'; c.beginPath(); c.moveTo(-22, -100); c.quadraticCurveTo(-12, -80, -22, -62); c.lineTo(-22, -100); c.fill(); c.beginPath(); c.moveTo(22, -100); c.quadraticCurveTo(12, -80, 22, -62); c.lineTo(22, -100); c.fill();
    // やね の かざり
    G.ell(c, 0, -150, 14, 6); c.fillStyle = '#58b44e'; c.fill(); c.strokeStyle = '#3f8a4a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -152); c.quadraticCurveTo(8, -170, 22, -168); c.stroke();
    G.poly(c, [-14, -150, -16, -166, -6, -158, 0, -172, 6, -158, 16, -166, 14, -150]); c.fillStyle = K.gold(c, -172, -150); c.fill(); c.strokeStyle = GOLD[3]; c.lineWidth = 1.6; c.stroke();
    wheel(60, 30);
    K.twinkle(c, 50, -120, 9, t, 0); K.twinkle(c, -60, -100, 7, t, 1.5);
  } });
  V('whitehorse', { name: 'しろい おうま', w: 150, h: 160, tags: ['vehicle', 'ride', 'royal', 'horse'], draw(c, t) {
    const step = Math.sin(t * 0.008) * 0.18;
    for (const [x, a] of [[-38, step], [-22, -step], [26, step], [42, -step]]) { c.save(); c.translate(x, -52); c.rotate(a); G.rr(c, -6, 0, 12, 50, 5); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#b9c4d8'; c.lineWidth = 2.4; c.stroke(); G.rr(c, -7, 42, 14, 10, 3); c.fillStyle = K.gold(c, 42, 52); c.fill(); c.restore(); }
    G.ell(c, 0, -66, 56, 28); c.fillStyle = G.grad(c, 0, -94, 0, -38, [[0, '#ffffff'], [1, '#e6ecf8']]); c.fill(); c.strokeStyle = '#b9c4d8'; c.lineWidth = 3; c.stroke();
    // しっぽ
    c.beginPath(); c.moveTo(-54, -76); c.bezierCurveTo(-90, -70, -84, -24, -66, -14); c.bezierCurveTo(-74, -36, -66, -56, -50, -62); c.closePath(); c.fillStyle = '#fff6d6'; c.fill(); c.strokeStyle = '#e3c27a'; c.lineWidth = 2; c.stroke();
    // くら（あかい ベルベット＋きん）
    c.beginPath(); c.moveTo(-30, -92); c.quadraticCurveTo(0, -104, 30, -92); c.lineTo(36, -58); c.quadraticCurveTo(0, -48, -36, -58); c.closePath(); c.fillStyle = G.grad(c, 0, -104, 0, -50, [[0, '#e8384f'], [1, '#9a1530']]); c.fill(); c.strokeStyle = '#ffd54a'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#ffd54a'; for (let x = -32; x <= 32; x += 8) { G.circ(c, x, -55 + Math.abs(x) * 0.08, 2.2); c.fill(); }
    K.gem(c, 0, -76, 5, '#4c9be8', 'diamond');
    // くび と あたま
    c.beginPath(); c.moveTo(34, -82); c.quadraticCurveTo(44, -128, 64, -138); c.quadraticCurveTo(90, -136, 86, -116); c.lineTo(58, -94); c.quadraticCurveTo(54, -78, 42, -62); c.closePath(); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#b9c4d8'; c.lineWidth = 3; c.stroke();
    // たてがみ
    for (let i = 0; i < 5; i++) { G.ell(c, 40 + i * 6, -98 - i * 8, 9, 6, -0.8); c.fillStyle = i % 2 ? '#fff0b8' : '#ffe58a'; c.fill(); }
    G.circ(c, 72, -124, 3); c.fillStyle = '#2b2440'; c.fill(); G.circ(c, 71, -125, 1); c.fillStyle = '#fff'; c.fill();
    G.poly(c, [62, -138, 66, -152, 70, -138]); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#b9c4d8'; c.lineWidth = 2; c.stroke();
    // あたまの はねかざり
    c.save(); c.translate(60, -142); c.rotate(-0.4 + Math.sin(t * 0.006) * 0.1); c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-6, -18, 6, -32, 22, -34); c.bezierCurveTo(14, -22, 12, -8, 4, 2); c.closePath(); c.fillStyle = '#ff8fab'; c.fill(); c.restore();
    c.strokeStyle = '#ffd54a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(60, -134); c.lineTo(84, -118); c.stroke();
  } });

  /* ================= あそび（反応） ================= */
  const W = PT.world, R = PT.R, D = R.D, X = PT.FX;
  const { isP, isC, nearP, firstP, role } = R.h;
  D('d_prince', 'おうじさまの あいさつ', 'おうじさまの ふくで「おどって いただけますか？」', ['princecoat', 'mimi']);
  D('d_knight', 'ナイトの ちかい', 'よろいの ナイトが「おまもりします！」', ['knight', 'knighthelm']);
  D('d_royal', 'おうさまの パレード', 'マントと おうかんで みんなが ついてくる', ['royalcape', 'royalcrown']);
  D('d_snowprincess', 'こおりの プリンセス', 'こおりの ドレスで きらきらの ゆきを ふらせたよ', ['gown_snow', 'pyoko']);
  D('d_throne', 'たいかんしき', 'おうさまの いすに すわると かんむりが のる', ['throne', 'royalcrown']);
  D('d_slipper', 'ガラスの くつ ぴったり', 'ガラスの くつが ぴったりの ひとを さがそう', ['slipper', 'mimi']);
  D('d_mirror', 'まほうの かがみ', 'かがみよ かがみ…「みんな とっても すてき！」', ['mirror', 'choco']);
  D('d_jewel', 'ほうせきばこ', 'ほうせきばこを あけると ティアラが でてくる', ['jewelbox', 'hearttiara']);
  D('d_royaltea', 'おしろの おちゃかい', 'ティーセットで「ごきげんよう」', ['teaset', 'mimi']);
  D('d_rose', 'バラの プレゼント', 'バラを わたすと ハートが いっぱい', ['rose', 'pyoko']);
  D('d_ball', 'おしろの ぶとうかい', 'しょうたいじょうで みんなが ドレスアップして ワルツ', ['invitation', 'gown_rose', 'princecoat']);
  D('d_chandelier', 'シャンデリアの ワルツ', 'シャンデリアの ひかりの したで ふたりずつ おどる', ['chandelier', 'gown_gold']);
  D('d_redcarpet', 'レッドカーペット', 'カーペットの うえを ならんで ゆっくり あるく', ['redcarpet', 'royalcrown']);
  D('d_castle', 'おしろの おまつり', 'おしろを おくと はなびと ファンファーレ', ['castletoy']);
  D('d_scepter', 'おうさまの めいれい', 'つえを ふると「ダンスパーティー はじめ！」', ['scepter', 'gaku']);
  D('d_harp', 'ハープの しらべ', 'ハープの おとで ゆったり', ['harp', 'mimi']);
  D('d_royalcake', 'ロイヤル パーティー', 'ロイヤル ケーキで おしろの パーティー', ['royalcake', 'teddy']);
  D('d_carriage', 'かぼちゃの ばしゃ', 'ばしゃに のって おしろへ しゅっぱつ', ['carriage', 'gown_rose']);
  D('d_whitehorse', 'しろい おうまの おうじさま', 'しろい おうまで ぱかぱか', ['whitehorse', 'princecoat']);

  const one = (x, y, pref) => R.one(x, y, [], pref);
  const fetch = (ch, p, ms = 8000) => R.claim(ch, ms).to(p, -50, 4, true).look(p.x);
  const fanfare = () => { [67, 72, 76, 79, 76, 79, 84].forEach((n, i) => PT.audio.tone(440 * Math.pow(2, (n - 69) / 12), i === 6 ? 0.6 : 0.18, { type: 'square', vol: 0.07, delay: i * 0.14 })); };
  const waltz = (pairs, x, y, ms = 5000) => {
    pairs.forEach(([a, b], i) => {
      const cx = x - 200 + i * 200, cy = y + (i % 2) * 40;
      [a, b].forEach((ch, k) => { if (!ch) return; R.claim(ch, ms + 2000).go(cx + (k ? 40 : -40), cy, true).do(() => { ch.stay = true; R.tween(ch, ms, (kk) => { const ang = kk * PT.TAU * 2 + k * Math.PI; ch.x = cx + Math.cos(ang) * 40; ch.y = cy + Math.sin(ang) * 12; ch.scale = W.depthScale(ch.y); ch.pose = 'dance'; ch.face = 'love'; ch.flip = Math.sin(ang) > 0; }, () => { ch.stay = false; ch.face = 'happy'; }); }); });
    });
    [72, 76, 79, 76, 77, 81, 77, 74, 72].forEach((n, i) => PT.audio.tone(440 * Math.pow(2, (n - 69) / 12), 0.5, { type: 'triangle', vol: 0.1, delay: 0.6 + i * 0.4 }));
    X.music(x, y - 220, ms);
  };
  const pairUp = (list) => { const out = []; for (let i = 0; i < list.length; i += 2) out.push([list[i], list[i + 1]]); return out; };

  R.ROLES.prince = (ch) => {
    const p = R.free(ch.x, ch.y, [ch], 1200)[0];
    R.claim(ch, 8000).pose('bow', 1000).say('おどって いただけますか？', 'rose', 1800, 'talk');
    if (p) { R.claim(p, 8000).look(ch.x).face('love', 1200).say('よろこんで！', 'heart', 1400, 'yay'); W.after(2600, () => waltz([[ch, p]], ch.x, ch.y, 3500)); }
    W.after(2500, () => R.found('d_prince'));
  };
  R.ROLES.knight = (ch) => {
    const pr = W.chars().find((o) => o !== ch && (o.role === 'princess' || o.role === 'snowprincess' || o.role === 'royal')) || R.free(ch.x, ch.y, [ch], 1200)[0];
    const a = R.claim(ch, 6000).say('ナイト さんじょう！', 'knighthelm', 1400, 'yay').pose('march', 1200);
    if (pr) a.to(pr, pr.x < ch.x ? 90 : -90, 4, true).look(pr.x).pose('bow', 1200).say('おまもり します！', 'heart', 1600, 'talk');
    a.do(() => R.found('d_knight'));
    if (pr) W.after(2500, () => R.claim(pr, 3000).look(ch.x).face('love', 1500).say('たのもしい！', 'heart', 1400, 'yay'));
  };
  R.ROLES.royal = (ch) => {
    fanfare();
    const followers = R.free(ch.x, ch.y, [ch], 2500).slice(0, 4);
    const pts = [W.randFloor(220), W.randFloor(220)];
    const a = R.claim(ch, 12000).say('パレードを はじめよう', 'royalcrown', 1500, 'talk').pose('wave', 800);
    pts.forEach((p) => a.go(p.x, p.y).pose('wave', 700));
    a.say('みんな ありがとう！', 'star', 1300, 'yay').do(() => { X.confetti(ch.x); R.found('d_royal'); });
    followers.forEach((o, i) => { R.claim(o, 12000).say(i === 0 ? 'ばんざーい！' : '', null, 1100, 'yay'); W.after(1500, () => R.follow(o, () => (i === 0 ? ch : followers[i - 1]), () => !!ch.cur || ch.queue.length > 0, () => W.act(o).pose('cheer', 900))); });
  };
  R.ROLES.snowprincess = (ch) => {
    let acc = 0;
    W.special({ type: 'snowfall', max: 5000, step(f, dt) { acc += dt; if (acc > 60) { acc = 0; W.fx.push({ type: 'spark', x: PT.rand(W.visLeft, W.visRight), y: PT.rand(-20, 120), vx: PT.rand(-0.03, 0.03), vy: 0.12, life: 0, max: 4000, size: PT.rand(5, 9), col: PT.pick(['#ffffff', '#c9ebff']), rot: 0, vr: 0.003, g: 0 }); } }, draw() {} });
    PT.audio.sfx('magic');
    R.claim(ch, 5000).say('きらきらの ゆき！', 'gown_snow', 1500, 'yay').pose('spin', 1500).pose('dance', 1500).face('love', 1000).do(() => R.found('d_snowprincess'));
    R.audience(ch.x, ch.y, [ch], 'wow', 2, 800);
  };

  R.add({ id: 'throne', pri: 55, test: (c) => (isP(c.e, 'throne') ? (isC(c.tgt) ? c.tgt : one(c.e.x, c.e.y)) : null),
    run(c, ch) {
      const th = c.e;
      R.claim(ch, 9000).to(th, 0, 6, true).do(() => { R.ride(ch, th, { z: 46, pose: 'sit', dy: 6 }); fanfare(); }).say('えっへん', null, 1200, 'talk')
        .do(() => { const subj = R.free(th.x, th.y, [ch], 1500).slice(0, 3); subj.forEach((o, i) => { const p = R.spot(th.x, th.y + 80, i, subj.length, 170); R.claim(o, 6000).go(p.x, p.y).look(th.x).pose('bow', 1500).say(i === 0 ? 'ははー！' : '', null, 1200, 'talk').pose('cheer', 1200); }); })
        .wait(1800).do(() => { ch.wear = Object.assign({}, ch.wear, { hat: 'royalcrown' }); ch.role = 'royal'; PT.audio.sfx('sparkle'); W.burst('star', ch.x, ch.y - 220, 14, { sp: 0.2, max: 900, col: '#ffd54a' }); X.confetti(th.x); })
        .say('たいかんしき！', 'royalcrown', 1600, 'yay').pose('cheer', 1200).do(() => { R.unride(ch); R.found('d_throne'); });
    } });
  R.add({ id: 'throne-char', pri: 76, test: (c) => (isC(c.e) && isP(c.tgt, 'throne') ? c.tgt : null), run(c, th) { R.list.find((r) => r.id === 'throne').run({ e: th, tgt: c.e }, c.e); } });
  R.add({ id: 'slipper', pri: 55, test: (c) => (isP(c.e, 'slipper') && R.chars().length >= 2 ? (role('prince') || one(c.e.x, c.e.y, 'gaku')) : null),
    run(c, pr) {
      const sl = c.e;
      const cands = R.avail(sl.x, sl.y, [pr], 3000).slice(0, 3);
      const lucky = cands[cands.length - 1];
      const a = fetch(pr, sl, 15000).hold('slipper').do(() => { sl.hidden = true; }).say('この くつが ぴったりの ひとは？', 'slipper', 1800, 'talk');
      cands.forEach((o) => {
        a.to(o, o.x < pr.x ? 80 : -80, 6).look(o.x).pose('bow', 900);
        if (o === lucky) a.do(() => { PT.audio.sfx('magic'); W.burst('star', o.x, o.y - 30, 14, { sp: 0.22, max: 900, col: '#c9ebff' }); R.claim(o, 5000).face('love', 2000).say('ぴったり！', 'heart', 1500, 'yay').do(() => { R.wear(o, 'gown_rose', {}, true); }).pose('spin', 1200); }).say('みつけた！', 'star', 1400, 'yay');
        else a.do(() => { R.claim(o, 2500).face('puzzled', 1000).say('ちいさい〜', 'sweat', 1200, 'hmm').face('laugh', 900); }).wait(900);
      });
      a.unhold().do(() => { sl.hidden = false; sl.x = pr.x + 40; sl.y = pr.y + 4; R.found('d_slipper'); if (lucky) W.after(1200, () => waltz([[pr, lucky]], pr.x, pr.y, 3500)); });
    } });
  R.add({ id: 'mirror', pri: 55, test: (c) => (isP(c.e, 'mirror') ? one(c.e.x, c.e.y, 'choco') : null),
    run(c, ch) {
      const m = c.e;
      R.claim(ch, 7000).go(m.x - 90, m.y + 10, true).look(m.x).say('かがみよ かがみ…', 'mirror', 1600, 'talk').pose('shy', 900)
        .do(() => { m.glow = W.t + 3500; PT.audio.sfx('magic'); W.burst('spark', m.x, m.y - 100, 12, { sp: 0.15, max: 900, col: '#ffd1f0', g: 0 }); W.bigText('みんな とっても すてき！', m.x, m.y - 220, '#ff6f91'); })
        .face('love', 1500).pose('spin', 1000).say('うれしい！', 'heart', 1300, 'yay').do(() => R.found('d_mirror'));
      R.mimic(ch, 'spin', 1000, 'わたしも うつして！');
    } });
  R.add({ id: 'jewelbox', pri: 55, test: (c) => (isP(c.e, 'jewelbox') && !c.e.open ? one(c.e.x, c.e.y, 'mimi') : null),
    run(c, ch) {
      const jb = c.e;
      fetch(ch, jb, 8000).pose('peek', 800).do(() => { jb.open = true; PT.audio.sfx('discover'); W.burst('star', jb.x, jb.y - 60, 16, { up: true, sp: 0.25, col: '#ffd1f0' }); })
        .face('surprise', 800).say('ほうせきが いっぱい！', 'hearttiara', 1500, 'wow').do(() => { R.wear(ch, PT.pick(['hearttiara', 'tiara', 'royalcrown', 'veiltiara']), {}, true); })
        .pose('spin', 1200).face('love', 1200).say('にあう？', 'heart', 1300, 'yay').do(() => { R.found('d_jewel'); W.after(7000, () => { jb.open = false; }); });
      R.audience(jb.x, jb.y, [ch], 'wow', 2, 1300);
    } });
  R.add({ id: 'royaltea', pri: 60, test: (c) => (isP(c.e, 'teaset') ? 1 : null),
    run(c) {
      const ts = c.e;
      const list = R.free(ts.x, ts.y, [], 2000).slice(0, 4);
      list.forEach((ch, i) => { const p = R.ring(ts.x, ts.y, i, list.length, 140); R.claim(ch, 8000).go(p.x, p.y, true).look(ts.x).pose('sit', 900).say(i === 0 ? 'ごきげんよう' : i === 1 ? 'おちゃを どうぞ' : '', i === 1 ? 'teaset' : 'heart', 1500, 'talk').pose('eat', 1600).face('love', 1400).say(i === 2 ? 'おいしい こうちゃ！' : '', null, 1200, 'yay').pose('sit', 1200); });
      PT.audio.sfx('ding');
      W.after(3000, () => R.found('d_royaltea'));
    } });
  R.add({ id: 'rose', pri: 60, test: (c) => (isP(c.e, 'rose') && R.chars().length >= 2 ? (isC(c.tgt) ? c.tgt : one(c.e.x, c.e.y, 'pyoko')) : null),
    run(c, to) {
      const r = c.e;
      const giver = role('prince') || R.free(r.x, r.y, [to], 2000)[0];
      if (!giver) return;
      fetch(giver, r, 8000).hold('rose').do(() => { W.remove(r); }).to(to, to.x < giver.x ? 90 : -90, 4, true).look(to.x).pose('bow', 900).say('あなたに バラを', 'rose', 1500, 'talk').unhold()
        .do(() => { R.claim(to, 4000).look(giver.x).hold('rose').face('love', 2000).say('すてき！', 'heart', 1400, 'yay').pose('shy', 1500).unhold(); W.burst('heart', (giver.x + to.x) / 2, to.y - 170, 10, { up: true, sp: 0.15, max: 1200 }); R.found('d_rose'); });
    } });
  R.ball = (x, y) => {
    fanfare();
    const list = R.avail(x, y, [], 3000).slice(0, 6);
    const outfits = ['gown_rose', 'princecoat', 'gown_gold', 'princecoat', 'gown_snow', 'knight'];
    const hats = ['hearttiara', 'royalcrown', 'tiara', 'royalcrown', 'veiltiara', 'knighthelm'];
    list.forEach((ch, i) => { ch.wear = Object.assign({}, ch.wear, { body: outfits[i], hat: hats[i] }); ch.role = PT.ITEMS[outfits[i]].role; W.burst('spark', ch.x, ch.y - 120, 8, { sp: 0.18, max: 700, col: '#ffd54a', g: 0 }); });
    PT.audio.sfx('sparkle');
    W.after(1000, () => waltz(pairUp(list), Math.min(Math.max(x, 500), 1100), Math.min(y, 760), 5500));
    W.after(2500, () => R.found('d_ball'));
  };
  R.add({ id: 'invitation', pri: 60, test: (c) => (isP(c.e, 'invitation') && R.chars().length >= 2 ? one(c.e.x, c.e.y, 'mimi') : null),
    run(c, ch) { const iv = c.e; fetch(ch, iv, 4000).hold('invitation').do(() => { W.remove(iv); }).say('ぶとうかいへ ようこそ！', 'invitation', 1700, 'yay').unhold().do(() => R.ball(ch.x, ch.y)); } });
  R.add({ id: 'chandelier', pri: 60, test: (c) => (isP(c.e, 'chandelier') ? 1 : null),
    run(c) {
      const ch0 = c.e; if (ch0.y > W.stage.floor[0]) ch0.zTarget = 280;
      W.special({ type: 'ballroom', max: 7000, draw(c2, f, k) { const a = Math.sin(k * Math.PI); c2.fillStyle = `rgba(60,30,90,${0.28 * a})`; c2.fillRect(-500, -100, 2600, 1200); c2.fillStyle = G.rgrad(c2, ch0.x, 700, 20, 500, [[0, `rgba(255,230,160,${0.35 * a})`], [1, 'rgba(255,230,160,0)']]); c2.fillRect(-500, -100, 2600, 1200); } });
      PT.audio.sfx('sparkle');
      waltz(pairUp(R.avail(ch0.x, 760, [], 3000).slice(0, 6)), Math.min(Math.max(ch0.x, 500), 1100), 760, 5500);
      W.after(2500, () => R.found('d_chandelier'));
    } });
  R.add({ id: 'redcarpet', pri: 58, test: (c) => (isP(c.e, 'redcarpet') ? R.avail(c.e.x, c.e.y, [], 3000).slice(0, 4) : null),
    run(c, list) {
      const rc = c.e; fanfare();
      list.forEach((ch, i) => R.claim(ch, 10000).wait(i * 900).go(rc.x - 110, rc.y - 12, true).go(rc.x + 110, rc.y - 12).pose('wave', 900).say(i === 0 ? 'みなさま ごきげんよう' : '', 'heart', 1300, 'talk').pose('bow', 700));
      W.after(2000, () => { for (let i = 0; i < 6; i++) W.after(i * 500, () => W.burst('spark', rc.x + PT.rand(-120, 120), rc.y - 160, 3, { sp: 0.1, max: 600, col: '#ffffff', g: 0 })); R.found('d_redcarpet'); });
    } });
  R.add({ id: 'castletoy', pri: 58, test: (c) => (isP(c.e, 'castletoy') ? 1 : null),
    run(c) {
      const cs = c.e; fanfare();
      for (let i = 0; i < 4; i++) W.after(600 + i * 500, () => X.firework(cs.x + PT.rand(-250, 250), PT.rand(200, 330)));
      const list = R.avail(cs.x, cs.y, [], 2500).slice(0, 4);
      list.forEach((ch, i) => { const p = R.spot(cs.x, cs.y + 80, i, list.length, 200); R.claim(ch, 6000).go(p.x, p.y, true).look(cs.x).face('surprise', 900).say(i === 0 ? 'おしろだ！' : i === 1 ? 'すてき〜' : '', 'castletoy', 1400, 'wow').pose('cheer', 1500); });
      if (W.chars().some((x) => x.role === 'princess' || x.role === 'prince')) W.after(3200, () => R.ball(cs.x, cs.y + 100));
      W.after(1800, () => R.found('d_castle'));
    } });
  R.add({ id: 'scepter', pri: 58, test: (c) => (isP(c.e, 'scepter') ? (isC(c.tgt) ? c.tgt : one(c.e.x, c.e.y, 'gaku')) : null),
    run(c, ch) {
      const sc = c.e;
      const a = c.tgt === ch ? R.claim(ch, 7000) : fetch(ch, sc, 7000);
      a.hold('scepter').do(() => { sc.hidden = true; }).pose('point', 600).say('ダンスパーティー はじめ！', 'scepter', 1600, 'yay')
        .do(() => { PT.audio.sfx('magic'); X.sparkleRain(2000); R.danceAll(ch.x, ch.y, 4500); R.found('d_scepter'); }).wait(4500).unhold().do(() => { sc.hidden = false; sc.x = ch.x + 40; sc.y = ch.y + 4; });
    } });
  R.add({ id: 'harp', pri: 58, test: (c) => (isP(c.e, 'harp') ? one(c.e.x, c.e.y, 'mimi') : null),
    run(c, ch) {
      const h = c.e;
      R.claim(ch, 7000).go(h.x - 60, h.y + 6, true).look(h.x).pose('hold', 3000).do(() => { [60, 64, 67, 72, 76, 79, 84, 88, 84, 79, 76, 72].forEach((n, i) => PT.audio.tone(440 * Math.pow(2, (n - 69) / 12), 0.6, { type: 'sine', vol: 0.1, delay: i * 0.08 })); X.music(h.x, h.y - 140, 3000); }).say('♪〜', 'harp', 1500, null).face('love', 1200).do(() => R.found('d_harp'));
      R.free(h.x, h.y, [ch], 1500).slice(0, 3).forEach((o) => R.claim(o, 5000).look(h.x).pose('dance', 2400).face('sleep', 1500).pose('shy', 900));
    } });
  R.add({ id: 'royalcake', pri: 70, test: (c) => (isP(c.e, 'royalcake') ? 1 : null),
    run(c) {
      const ck = c.e; fanfare();
      const list = R.avail(ck.x, ck.y, [], 3000).slice(0, 5);
      list.forEach((ch, i) => { if (!ch.wear.hat) ch.wear = Object.assign({}, ch.wear, { hat: PT.pick(['tiara', 'hearttiara', 'crown']) }); const p = R.ring(ck.x, ck.y, i, list.length, 170); R.claim(ch, 9000).go(p.x, p.y, true).look(ck.x).pose('cheer', 1200).say(i === 0 ? 'ロイヤル パーティー！' : '', 'royalcake', 1500, 'yay').hold('royalcake').face('eat', 1500).pose('eat', 1400).unhold().face('love', 1200); });
      W.after(1500, () => X.confetti(ck.x)); W.after(4200, () => { if (!ck.removed) W.remove(ck); R.found('d_royalcake'); });
      nearP(ck.x, ck.y, 600, (p) => R.h.tag(p, 'plush')).forEach((p) => { p.party = true; p.wobbleUntil = W.t + 3000; });
    } });
  R.add({ id: 'carriage', pri: 58, test: (c) => (isP(c.e, 'carriage') && !c.e.rider ? R.avail(c.e.x, c.e.y, [], 2500).slice(0, 2) : null),
    run(c, list) {
      const cr = c.e;
      const [a, b] = list;
      if (!a) return;
      if (!a.wear.body) R.wear(a, 'gown_rose', {}, true);
      R.claim(a, 12000).to(cr, 0, -3, true).do(() => {
        R.ride(a, cr, { z: 60, pose: 'ride', carry: true }); fanfare();
        const sx = cr.x;
        R.tween(a, 6000, (k) => { a.x = sx + Math.sin(k * PT.TAU) * 380; a.y = cr.y - 3 + 0; a.flip = Math.cos(k * PT.TAU) < 0; a.face = 'love'; a.pose = 'wave'; if (Math.random() < 0.25) W.burst('spark', a.x - (a.flip ? -90 : 90), cr.y - 30, 1, { sp: 0.05, max: 800, col: PT.pick(['#ffd54a', '#ffd1f0', '#ffffff']), g: 0 }); }, () => { a.face = 'happy'; R.unride(a); W.act(a).say('おしろに とうちゃく！', 'castletoy', 1600, 'yay'); R.found('d_carriage'); });
      }).say('おしろへ しゅっぱつ！', 'carriage', 1500, 'yay');
      if (b) R.claim(b, 8000).wait(800).look(cr.x).say('いってらっしゃーい！', 'heart', 1400, 'yay').pose('wave', 2500);
    } });
  R.add({ id: 'whitehorse', pri: 58, test: (c) => (isP(c.e, 'whitehorse') && !c.e.rider ? (isC(c.tgt) ? c.tgt : one(c.e.x, c.e.y, 'gaku')) : null),
    run(c, ch) {
      const h = c.e;
      if (!ch.wear.body) R.wear(ch, 'princecoat', {}, true);
      R.claim(ch, 10000).to(h, 0, -3, true).do(() => {
        R.ride(ch, h, { z: 66, pose: 'ride', carry: true }); PT.audio.sfx('whoosh');
        const a = W.act(ch).say('ぱかぱか〜！', 'whitehorse', 1300, 'yay');
        for (let i = 0; i < 3; i++) { const p = W.randFloor(220); a.go(p.x, p.y, true); }
        a.pose('wave', 800).say('おうじさま とうちゃく！', 'star', 1400, 'yay').do(() => { R.unride(ch); R.found('d_whitehorse'); const p = R.free(ch.x, ch.y, [ch], 1500)[0]; if (p) waltz([[ch, p]], ch.x, ch.y, 3000); });
      });
    } });
  // おうまに キャラを のせた とき
  R.add({ id: 'royal-ride-char', pri: 77, test: (c) => (isC(c.e) && isP(c.tgt, ['whitehorse', 'carriage', 'throne']) && !c.tgt.rider ? c.tgt : null),
    run(c, v) { const r = R.list.find((q) => q.id === (v.type === 'carriage' ? 'carriage' : v.type)); r.run({ e: v, tgt: c.e }, v.type === 'carriage' ? [c.e] : c.e); } });

  /* おだい・おはなし */
  PT.ROYAL_FAVS = ['gown_rose', 'gown_snow', 'gown_gold', 'princecoat', 'knight', 'royalcape', 'royalcrown', 'hearttiara', 'veiltiara', 'knighthelm', 'dress', 'tiara', 'crown', 'castletoy', 'throne', 'slipper', 'mirror', 'jewelbox', 'teaset', 'rose', 'invitation', 'redcarpet', 'carriage', 'whitehorse', 'scepter', 'chandelier', 'harp', 'royalcake'];
  PT.ROYAL_ODAI = [
    ['おしろの ぶとうかいを ひらこう', ['d_ball', 'd_chandelier', 'd_prince', 'd_princess'], ['invitation', 'chandelier']],
    ['ガラスの くつの もちぬしを さがそう', ['d_slipper'], ['slipper']],
    ['おうさまに なってみよう', ['d_throne', 'd_royal', 'd_scepter', 'd_king'], ['throne', 'royalcrown']],
    ['プリンセスに へんしん しよう', ['d_princess', 'd_snowprincess', 'd_jewel', 'd_mirror'], ['gown_rose', 'jewelbox']],
  ];
})();
