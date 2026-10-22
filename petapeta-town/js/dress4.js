/* ヒーロー・わふくと せかいの いしょう・ゆめかわパーティーの いしょう */
'use strict';
(() => {
  const G = PT.G, EXT = PT.WEAR_EXT;
  const T = (t) => t || 0;
  const BBX = (x0, y0, x1, y1) => { G._bb = { x0, y0, x1, y1 }; };
  const gfill = (c, fill, stroke, lw = 3) => { c.fillStyle = fill; c.fill(); c.strokeStyle = stroke; c.lineWidth = lw; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); };
  /* カチューシャ（あたまの うえを とおる わ） */
  const hband = (c, col) => { c.beginPath(); c.ellipse(0, -126, 47, 35, 0, Math.PI * 1.07, Math.PI * 1.93); c.lineCap = 'round'; c.strokeStyle = PT.line(col); c.lineWidth = 11; c.stroke(); c.strokeStyle = col; c.lineWidth = 7; c.stroke(); };
  /* ふんわり スカート（すそが なみなみ） */
  const skirt = (c, y0, y1, top, w, col, n = 6, sw = 0, lw = 3) => {
    c.beginPath(); c.moveTo(-top, y0); c.lineTo(top, y0);
    c.quadraticCurveTo(w * 0.8 + sw, (y0 + y1) / 2, w + sw, y1);
    const step = (2 * w) / n;
    for (let i = 0; i < n; i++) { const x0 = w + sw - i * step; c.quadraticCurveTo(x0 - step / 2, y1 + 7, x0 - step, y1); }
    c.quadraticCurveTo(-w * 0.8 + sw, (y0 + y1) / 2, -top, y0); c.closePath();
    BBX(-w, y0, w, y1 + 6); G.fillO(c, col, lw);
  };
  const puffs = (c, col) => { for (const s of [-1, 1]) { G.ell(c, s * 27, -80, 11, 9, s * 0.3); G.fillO(c, col, 2.5); } };
  const robeShape = (c, top, bot, wt, wb, col, sw = 0) => { c.beginPath(); c.moveTo(-wt, top); c.lineTo(wt, top); c.lineTo(wb + sw, bot); c.quadraticCurveTo(0, bot + 6, -wb + sw, bot); c.closePath(); BBX(-wb, top, wb, bot + 4); G.fillO(c, col, 3); };
  const sakura = (c, x, y, r, col) => { c.fillStyle = col; for (let k = 0; k < 5; k++) { const a = (k / 5) * PT.TAU - Math.PI / 2; G.circ(c, x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.75); c.fill(); } G.circ(c, x, y, r * 0.5); c.fillStyle = '#ffe066'; c.fill(); };
  const twinkle = (c, t, pts, col = '#ffffff') => { for (const [x, y, s] of pts) { const k = 0.5 + 0.5 * Math.sin(T(t) * 0.006 + x * 0.3 + y); c.fillStyle = col; G.star(c, x, y, (s || 5) * (0.6 + k * 0.5), (s || 5) * 0.3, 4); c.fill(); } };

  /* ================= ヒーロー ================= */
  const SENTAI = { red: '#ef4b4b', blue: '#4c8ce0', yellow: '#ffc93a', green: '#4fbf63', pink: '#ff86bd' };
  const sentaiHelm = (col, emb) => (c, ch, t) => {
    c.beginPath(); c.moveTo(-52, -98); c.quadraticCurveTo(-62, -182, 0, -182); c.quadraticCurveTo(62, -182, 52, -98); c.quadraticCurveTo(42, -92, 35, -101); c.quadraticCurveTo(0, -112, -35, -101); c.quadraticCurveTo(-42, -92, -52, -98); c.closePath();
    BBX(-56, -182, 56, -94); G.fillO(c, col, 3);
    G.rr(c, -6, -180, 12, 38, 5); c.fillStyle = 'rgba(255,255,255,.92)'; c.fill();
    G.rr(c, -43, -146, 86, 34, 15); gfill(c, 'rgba(30,34,62,.72)', PT.line(col), 3);
    c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-32, -137); c.lineTo(-16, -137); c.moveTo(22, -122); c.lineTo(30, -122); c.stroke();
    for (const s of [-1, 1]) { G.circ(c, s * 53, -120, 9); G.fillO(c, '#e8eef6', 2.5); }
    emb(c, t);
  };
  const embStar = (c) => { G.star(c, 0, -160, 11, 5); G.fillO(c, '#ffd23f', 2); };
  const embHeart = (c) => { G.heart(c, 0, -158, 11); G.fillO(c, '#ffffff', 2); };
  const embBolt = (c) => { G.poly(c, [4, -174, -8, -158, 0, -158, -4, -146, 8, -162, 0, -162]); G.fillO(c, '#ffffff', 2); };
  const embLeaf = (c) => { G.ell(c, 0, -160, 7, 11, 0.5); G.fillO(c, '#ffffff', 2); };
  const embDrop = (c) => { c.beginPath(); c.moveTo(0, -174); c.quadraticCurveTo(10, -160, 0, -150); c.quadraticCurveTo(-10, -160, 0, -174); BBX(-8, -174, 8, -150); G.fillO(c, '#ffffff', 2); };
  EXT.hat.sentai_red = sentaiHelm(SENTAI.red, embStar);
  EXT.hat.sentai_blue = sentaiHelm(SENTAI.blue, embDrop);
  EXT.hat.sentai_yellow = sentaiHelm(SENTAI.yellow, embBolt);
  EXT.hat.sentai_green = sentaiHelm(SENTAI.green, embLeaf);
  EXT.hat.sentai_pink = sentaiHelm(SENTAI.pink, embHeart);
  const sentaiSuit = (col) => (c) => {
    G.rr(c, -30, -88, 60, 64, 14); G.fillO(c, col, 3);
    c.beginPath(); c.moveTo(-27, -84); c.lineTo(0, -60); c.lineTo(27, -84); c.lineTo(28, -73); c.lineTo(0, -49); c.lineTo(-28, -73); c.closePath(); gfill(c, '#ffffff', 'rgba(0,0,0,.18)', 1.5);
    G.rr(c, -31, -42, 62, 9, 4); G.fillO(c, '#3a3550', 2);
    G.rr(c, -9, -46, 18, 16, 5); G.fillO(c, '#ffd23f', 2);
    G.circ(c, 0, -38, 3.5); c.fillStyle = col; c.fill();
  };
  for (const k in SENTAI) EXT.body['sentaisuit_' + k] = sentaiSuit(SENTAI[k]);

  EXT.face.heromask = (c, ch, t, lx = 0) => {
    const fl = Math.sin(T(t) * 0.01) * 4;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 46 + lx, -124); c.quadraticCurveTo(s * 62 + lx, -128 + fl, s * 70 + lx, -116 + fl); c.lineTo(s * 64 + lx, -110 + fl); c.quadraticCurveTo(s * 58 + lx, -118, s * 46 + lx, -116); c.closePath(); BBX(-70, -128, 70, -110); G.fillO(c, '#c9303a', 2); }
    G.blob(c, [-50 + lx, -126, -36 + lx, -142, -10 + lx, -136, 0 + lx, -130, 10 + lx, -136, 36 + lx, -142, 50 + lx, -126, 40 + lx, -104, 12 + lx, -106, 0 + lx, -112, -12 + lx, -106, -40 + lx, -104]);
    for (const x of [-18, 18]) { c.moveTo(x + lx + 11, -119); c.ellipse(x + lx, -119, 11, 11.5, 0, 0, PT.TAU); }
    c.fillStyle = '#e2434b'; c.fill('evenodd'); c.strokeStyle = '#8a2a30'; c.lineWidth = 2.5; c.lineJoin = 'round'; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.45)'; G.ell(c, -36 + lx, -132, 6, 2.5, -0.4); c.fill();
  };
  const cloak = (col, lining, deco) => (c, ch, t) => {
    const fl = Math.sin(T(t) * 0.008) * 6 + (ch && (ch.pose === 'run' || ch.pose === 'fly' || ch.pose === 'ride') ? 18 : 0);
    c.beginPath(); c.moveTo(-26, -90); c.quadraticCurveTo(-54 - fl, -44, -48 - fl, -2); c.quadraticCurveTo(-2 - fl * 0.6, 6, 46 - fl * 0.3, -2); c.quadraticCurveTo(50, -48, 26, -90); c.closePath(); BBX(-52, -90, 50, 2); G.fillO(c, col, 3);
    c.fillStyle = lining; c.beginPath(); c.moveTo(-22, -84); c.quadraticCurveTo(-42 - fl, -44, -38 - fl, -6); c.lineTo(-26 - fl, -5); c.quadraticCurveTo(-30, -50, -14, -84); c.closePath(); c.fill();
    if (deco) deco(c, t, fl);
  };
  EXT.back.heromantle = cloak('#3f5fc6', '#ffd23f', (c, t, fl) => {
    G.rr(c, -30, -96, 60, 12, 6); G.fillO(c, '#ffd23f', 2.5);
    c.save(); c.translate(6 - fl * 0.3, -40); G.star(c, 0, 0, 15, 7); G.fillO(c, '#ffd23f', 2.5); c.restore();
  });
  EXT.hat.mechahelm = (c, ch, t) => {
    c.strokeStyle = '#6a7890'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -174); c.lineTo(0, -198); c.stroke();
    const on = (T(t) % 900) < 450; G.circ(c, 0, -202, 7); G.fillO(c, on ? '#ff5d5d' : '#ffa0a0', 2);
    c.beginPath(); c.moveTo(-50, -136); c.quadraticCurveTo(-50, -180, 0, -180); c.quadraticCurveTo(50, -180, 50, -136); c.closePath(); BBX(-50, -180, 50, -136); G.fillO(c, '#c8d3e0', 3);
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 4; c.beginPath(); c.arc(0, -138, 36, -2.6, -2.0); c.stroke();
    G.rr(c, -53, -144, 106, 13, 6); G.fillO(c, '#7fa8d8', 2.5);
    for (const s of [-1, 1]) { G.rr(c, s * 52 - 8, -138, 16, 32, 6); G.fillO(c, '#a9b6c8', 2.5); G.circ(c, s * 52, -122, 4); c.fillStyle = on ? '#7fe0ff' : '#ffd23f'; c.fill(); }
    for (const x of [-30, -10, 10, 30]) { G.circ(c, x, -137.5, 2.2); c.fillStyle = '#e8eef6'; c.fill(); }
  };
  EXT.body.mechasuit = (c, ch, t) => {
    G.rr(c, -32, -88, 64, 66, 12); G.fillO(c, '#c8d3e0', 3);
    for (const s of [-1, 1]) { G.ell(c, s * 30, -82, 12, 9); G.fillO(c, '#7fa8d8', 2.5); }
    G.rr(c, -18, -76, 36, 26, 6); G.fillO(c, '#4a5670', 2.5);
    const k = 0.6 + 0.4 * Math.sin(T(t) * 0.008); G.heart(c, 0, -62, 9); c.fillStyle = `rgba(255,110,150,${k})`; c.fill();
    ['#ff5d5d', '#ffd23f', '#58c46b'].forEach((col, i) => { G.circ(c, -12 + i * 12, -40, 4); c.fillStyle = col; c.fill(); });
    c.strokeStyle = '#8a98ad'; c.lineWidth = 2; c.beginPath(); c.moveTo(-30, -30); c.lineTo(30, -30); c.stroke();
  };
  const mahou = (col, col2) => (c, ch, t) => {
    const sw = Math.sin(T(t) * 0.005) * 3;
    skirt(c, -56, -12, 22, 50, '#ffffff', 7, sw, 2.5);
    skirt(c, -58, -20, 22, 44, col, 6, sw * 0.7);
    for (const [x, y] of [[-26, -30], [0, -26], [24, -32]]) { G.heart(c, x + sw * 0.4, y, 5); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill(); }
    G.rr(c, -22, -88, 44, 34, 9); G.fillO(c, col, 3);
    puffs(c, '#ffffff');
    for (const s of [-1, 1]) { G.blob(c, [0, -74, s * 18, -88, s * 26, -74, s * 18, -62]); G.fillO(c, col2, 2.5); c.beginPath(); c.moveTo(s * 3, -70); c.quadraticCurveTo(s * 10, -56, s * 6, -46); c.lineTo(s * 14, -50); c.quadraticCurveTo(s * 14, -60, s * 6, -70); c.closePath(); BBX(-14, -70, 14, -46); G.fillO(c, col2, 2); }
    G.heart(c, 0, -72, 10); G.fillO(c, '#ffd23f', 2.5); G.circ(c, -3, -76, 2.2); c.fillStyle = '#fff'; c.fill();
    twinkle(c, t, [[-34, -48, 5], [32, -56, 4]]);
  };
  EXT.body.mahou_pink = mahou('#ff8fc4', '#ff5d92');
  EXT.body.mahou_blue = mahou('#7fc8f8', '#4c8ce0');
  EXT.hat.magicheart = (c, ch, t) => {
    hband(c, '#ff8fc4');
    const fl = Math.sin(T(t) * 0.012) * 0.15;
    for (const s of [-1, 1]) { c.save(); c.translate(s * 12, -164); c.rotate(s * (0.2 + fl)); G.blob(c, [0, 0, s * 14, -14, s * 26, -12, s * 22, -2, s * 26, 4, s * 12, 6]); G.fillO(c, '#ffffff', 2.5); c.restore(); }
    G.heart(c, 0, -160, 14); G.fillO(c, '#ff5d92', 2.5);
    G.circ(c, -4, -165, 3); c.fillStyle = '#fff'; c.fill();
    twinkle(c, t, [[26, -176, 5], [-30, -168, 4]], '#ffe066');
  };

  /* ================= わふく・せかいの いしょう ================= */
  const kimono = (col, pat, obi, cord) => (c, ch, t) => {
    for (const s of [-1, 1]) { G.rr(c, s > 0 ? 24 : -44, -82, 20, 46, 9); G.fillO(c, col, 2.5); }
    robeShape(c, -88, -8, 28, 34, col);
    c.save(); c.beginPath(); c.moveTo(-28, -88); c.lineTo(28, -88); c.lineTo(34, -8); c.lineTo(-34, -8); c.closePath(); c.clip();
    for (const [x, y] of [[-20, -76], [16, -80], [-14, -34], [20, -26], [2, -16]]) sakura(c, x, y, 4.5, pat);
    c.restore();
    for (const s of [-1, 1]) sakura(c, s * 34, -46, 3.5, pat);
    c.strokeStyle = '#ffffff'; c.lineWidth = 4.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-14, -88); c.lineTo(8, -60); c.moveTo(14, -88); c.lineTo(0, -70); c.stroke();
    c.strokeStyle = PT.line(col); c.lineWidth = 2; c.beginPath(); c.moveTo(4, -56); c.lineTo(10, -10); c.stroke();
    G.rr(c, -31, -64, 62, 18, 4); G.fillO(c, obi, 2.5);
    c.strokeStyle = cord; c.lineWidth = 3; c.beginPath(); c.moveTo(-31, -55); c.lineTo(31, -55); c.stroke();
    G.circ(c, 0, -55, 4); c.fillStyle = cord; c.fill();
  };
  EXT.body.kimono_red = kimono('#e2434b', '#ffc4d6', '#ffcf3f', '#ff8fc4');
  EXT.body.kimono_purple = kimono('#9b6fd6', '#ffffff', '#ff8fb1', '#ffd23f');
  EXT.body.hakama = (c, ch, t) => {
    for (const s of [-1, 1]) { G.rr(c, s > 0 ? 24 : -42, -84, 18, 34, 8); G.fillO(c, '#ffb3c8', 2.5); }
    G.rr(c, -26, -88, 52, 34, 8); G.fillO(c, '#ffb3c8', 3);
    c.save(); G.rr(c, -26, -88, 52, 34, 8); c.clip(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; for (let x = -24; x < 30; x += 12) { c.beginPath(); c.moveTo(x, -84); c.lineTo(x + 5, -76); c.lineTo(x + 10, -84); c.stroke(); c.beginPath(); c.moveTo(x, -68); c.lineTo(x + 5, -60); c.lineTo(x + 10, -68); c.stroke(); } c.restore();
    c.strokeStyle = '#ffffff'; c.lineWidth = 4.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-12, -88); c.lineTo(6, -66); c.moveTo(12, -88); c.lineTo(0, -74); c.stroke();
    robeShape(c, -60, -6, 27, 36, '#6a3f9a');
    c.strokeStyle = PT.line('#6a3f9a'); c.lineWidth = 2; c.beginPath(); for (const x of [-16, 0, 16]) { c.moveTo(x * 0.8, -50); c.lineTo(x * 1.2, -8); } c.stroke();
    G.rr(c, -28, -62, 56, 7, 3); G.fillO(c, '#4a2a72', 2);
    for (const s of [-1, 1]) { G.ell(c, s * 9, -60, 9, 6, s * 0.3); G.fillO(c, '#ff6f91', 2); } G.circ(c, 0, -60, 4); G.fillO(c, '#ff6f91', 2);
  };
  EXT.body.happi = (c, ch, t) => {
    const col = '#3f6fd0';
    G.rr(c, -10, -86, 20, 50, 4); G.fillO(c, '#ffffff', 2);
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(s * 8, -88); c.lineTo(s * 30, -86); c.lineTo(s * 34, -26); c.lineTo(s * 4, -26); c.closePath(); BBX(-34, -88, 34, -26); G.fillO(c, col, 3);
      G.rr(c, s > 0 ? 28 : -46, -84, 18, 26, 6); G.fillO(c, col, 2.5);
      c.beginPath(); c.moveTo(s * 8, -88); c.lineTo(s * 4, -26); c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.stroke();
    }
    c.save(); c.beginPath(); c.rect(-36, -36, 72, 12); c.clip(); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2.5; for (let x = -36; x < 40; x += 12) { c.beginPath(); c.arc(x, -24, 7, Math.PI, PT.TAU); c.stroke(); c.beginPath(); c.arc(x, -24, 3.5, Math.PI, PT.TAU); c.stroke(); } c.restore();
    for (const [x, y] of [[-20, -62], [20, -66]]) { G.circ(c, x, y, 6); c.strokeStyle = '#ffffff'; c.lineWidth = 2.5; c.stroke(); }
    G.rr(c, -32, -54, 64, 9, 4); G.fillO(c, '#e2434b', 2);
    c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); for (let x = -28; x < 30; x += 8) { c.moveTo(x, -53); c.lineTo(x + 5, -46); } c.stroke();
  };
  EXT.hat.hachimaki = (c, ch, t) => {
    const fl = Math.sin(T(t) * 0.012) * 4;
    for (const [dy, a] of [[0, 1], [8, 0.8]]) { c.beginPath(); c.moveTo(44, -138); c.quadraticCurveTo(58, -140 + dy + fl, 70, -128 + dy + fl * a); c.lineTo(66, -122 + dy + fl * a); c.quadraticCurveTo(54, -130 + dy, 44, -130); c.closePath(); BBX(44, -140, 70, -120); G.fillO(c, '#ffffff', 2.2); }
    c.beginPath(); c.moveTo(-47, -134); c.quadraticCurveTo(0, -160, 47, -134); c.lineTo(47, -124); c.quadraticCurveTo(0, -148, -47, -124); c.closePath(); BBX(-47, -150, 47, -124); G.fillO(c, '#ffffff', 2.5);
    G.circ(c, 0, -142, 6.5); c.fillStyle = '#e2434b'; c.fill();
    G.circ(c, 46, -131, 6); G.fillO(c, '#ffffff', 2);
  };
  EXT.hat.ninjahood = (c, ch, t) => {
    const col = '#3a3f6a', fl = Math.sin(T(t) * 0.012) * 5;
    for (const [dy, a] of [[0, 1], [10, 0.7]]) { c.beginPath(); c.moveTo(-46, -150); c.quadraticCurveTo(-64, -150 + dy + fl, -80, -136 + dy + fl * a); c.lineTo(-76, -128 + dy + fl * a); c.quadraticCurveTo(-62, -140 + dy, -46, -140); c.closePath(); BBX(-80, -152, -46, -126); G.fillO(c, col, 2.5); }
    c.beginPath(); c.moveTo(-53, -131); c.quadraticCurveTo(-60, -182, 0, -182); c.quadraticCurveTo(60, -182, 53, -131); c.quadraticCurveTo(0, -142, -53, -131); c.closePath(); BBX(-56, -182, 56, -131); G.fillO(c, col, 3);
    c.beginPath(); c.moveTo(-53, -104); c.quadraticCurveTo(0, -98, 53, -104); c.quadraticCurveTo(56, -76, 0, -74); c.quadraticCurveTo(-56, -76, -53, -104); c.closePath(); BBX(-56, -104, 56, -74); G.fillO(c, col, 3);
    G.rr(c, -18, -162, 36, 16, 4); G.fillO(c, '#c8d3e0', 2.5);
    G.star(c, 0, -154, 6, 2.2, 4, 0.4); c.fillStyle = '#4a5670'; c.fill();
    G.circ(c, -46, -146, 6); G.fillO(c, col, 2);
  };
  EXT.body.ninjasuit = (c, ch, t) => {
    const col = '#3a3f6a';
    G.rr(c, -30, -88, 60, 66, 14); G.fillO(c, col, 3);
    c.strokeStyle = '#6a72a8'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-14, -88); c.lineTo(8, -56); c.moveTo(14, -88); c.lineTo(0, -66); c.stroke();
    G.rr(c, -31, -54, 62, 10, 4); G.fillO(c, '#9b6fd6', 2);
    G.ell(c, -18, -46, 6, 9, 0.3); G.fillO(c, '#9b6fd6', 2);
    c.save(); c.translate(16, -72); c.rotate(T(t) * 0.002); G.star(c, 0, 0, 8, 3, 4); G.fillO(c, '#c8d3e0', 2); G.circ(c, 0, 0, 2); c.fillStyle = col; c.fill(); c.restore();
  };
  EXT.hat.kabuto = (c, ch, t) => {
    const col = '#3a4a7a';
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { G.poly(c, [s * 40, -144 + i * 14, s * (62 + i * 4), -138 + i * 14, s * (62 + i * 4), -124 + i * 14, s * 42, -128 + i * 14]); G.fillO(c, col, 2.5); c.strokeStyle = '#e2434b'; c.lineWidth = 2; c.beginPath(); c.moveTo(s * 44, -134 + i * 14); c.lineTo(s * (60 + i * 4), -130 + i * 14); c.stroke(); }
    c.beginPath(); c.moveTo(-50, -142); c.quadraticCurveTo(-52, -186, 0, -186); c.quadraticCurveTo(52, -186, 50, -142); c.closePath(); BBX(-52, -186, 52, -142); G.fillO(c, col, 3);
    c.strokeStyle = PT.line(col); c.lineWidth = 2; c.beginPath(); for (const x of [-26, -12, 12, 26]) { c.moveTo(x, -144); c.quadraticCurveTo(x * 0.9, -170, x * 0.4, -184); } c.stroke();
    G.rr(c, -54, -150, 108, 11, 5); G.fillO(c, '#ffcf3f', 2.5);
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6, -164); c.quadraticCurveTo(s * 20, -190, s * 44, -218); c.quadraticCurveTo(s * 30, -186, s * 16, -160); c.closePath(); BBX(-44, -218, 44, -160); G.fillO(c, '#ffcf3f', 2.5); }
    G.circ(c, 0, -162, 10); G.fillO(c, '#ffcf3f', 2.5);
    G.circ(c, 0, -162, 5); c.fillStyle = '#e2434b'; c.fill();
  };
  EXT.body.yoroi = (c, ch, t) => {
    const col = '#3a4a7a';
    for (let i = 0; i < 3; i++) { G.rr(c, -32 + i * 22, -42, 20, 26, 4); G.fillO(c, col, 2.5); c.strokeStyle = '#e2434b'; c.lineWidth = 2; c.beginPath(); c.moveTo(-30 + i * 22, -32); c.lineTo(-14 + i * 22, -32); c.moveTo(-30 + i * 22, -24); c.lineTo(-14 + i * 22, -24); c.stroke(); }
    G.rr(c, -29, -88, 58, 50, 12); G.fillO(c, col, 3);
    c.strokeStyle = '#e2434b'; c.lineWidth = 2.5; c.beginPath(); for (const y of [-74, -64, -54, -46]) { c.moveTo(-27, y); c.lineTo(27, y); } c.stroke();
    c.strokeStyle = '#ffcf3f'; c.lineWidth = 1.5; c.beginPath(); for (let x = -22; x <= 22; x += 11) { c.moveTo(x, -78); c.lineTo(x, -42); } c.stroke();
    for (const s of [-1, 1]) { G.rr(c, s > 0 ? 24 : -46, -90, 22, 30, 4); G.fillO(c, col, 2.5); c.strokeStyle = '#e2434b'; c.lineWidth = 2; c.beginPath(); for (const y of [-80, -70]) { c.moveTo(s > 0 ? 26 : -44, y); c.lineTo(s > 0 ? 44 : -26, y); } c.stroke(); }
    G.circ(c, 0, -80, 6.5); G.fillO(c, '#ffcf3f', 2);
  };
  EXT.body.chinadress = (c, ch, t) => {
    const col = '#e2434b', sw = Math.sin(T(t) * 0.004) * 2;
    puffs(c, col);
    c.beginPath(); c.moveTo(-24, -88); c.lineTo(24, -88); c.quadraticCurveTo(30, -60, 24, -50); c.lineTo(32 + sw, -10); c.quadraticCurveTo(0, -2, -32 + sw, -10); c.lineTo(-24, -50); c.quadraticCurveTo(-30, -60, -24, -88); c.closePath(); BBX(-32, -88, 32, -6); G.fillO(c, col, 3);
    c.strokeStyle = PT.line(col); c.lineWidth = 2; c.beginPath(); c.moveTo(24, -36); c.lineTo(30 + sw, -10); c.stroke();
    G.rr(c, -12, -94, 24, 9, 4); G.fillO(c, '#ffcf3f', 2);
    c.strokeStyle = '#ffcf3f'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -85); c.quadraticCurveTo(16, -82, 22, -66); c.stroke();
    for (const [x, y] of [[8, -82], [16, -76]]) { G.rr(c, x - 5, y - 2, 10, 4, 2); c.fillStyle = '#ffcf3f'; c.fill(); }
    for (const [x, y] of [[-12, -62], [10, -40], [-14, -26]]) sakura(c, x, y, 5, '#ffcf3f');
  };
  EXT.hat.odango = (c, ch, t) => {
    const sw = Math.sin(T(t) * 0.006) * 3;
    for (const s of [-1, 1]) {
      c.strokeStyle = '#ffcf3f'; c.lineWidth = 3; c.beginPath(); c.moveTo(s * 40, -140); c.quadraticCurveTo(s * 46 + sw, -126, s * 44 + sw, -114); c.stroke();
      G.rr(c, s * 44 + sw - 4, -118, 8, 10, 3); G.fillO(c, '#ff8fb1', 1.5);
      G.circ(c, s * 34, -156, 17); G.fillO(c, '#e2434b', 3);
      c.strokeStyle = '#ffcf3f'; c.lineWidth = 2; c.beginPath(); c.arc(s * 34, -156, 11, 0, PT.TAU); c.stroke();
      G.circ(c, s * 34, -156, 3.5); c.fillStyle = '#ffcf3f'; c.fill();
    }
  };
  EXT.body.hula = (c, ch, t) => {
    const sw = Math.sin(T(t) * 0.006) * 4;
    c.lineCap = 'round';
    for (let i = 0; i < 15; i++) { const x = -32 + i * 4.6; c.strokeStyle = PT.line('#7bc95a'); c.lineWidth = 7; c.beginPath(); c.moveTo(x * 0.8, -50); c.quadraticCurveTo(x + sw * 0.5, -30, x * 1.15 + sw, -8); c.stroke(); }
    for (let i = 0; i < 15; i++) { const x = -32 + i * 4.6; c.strokeStyle = i % 3 === 1 ? '#c8e86a' : '#7bc95a'; c.lineWidth = 4; c.beginPath(); c.moveTo(x * 0.8, -50); c.quadraticCurveTo(x + sw * 0.5, -30, x * 1.15 + sw, -8); c.stroke(); }
    G.rr(c, -30, -56, 60, 9, 4); G.fillO(c, '#ffcf3f', 2);
    for (const [x, col] of [[-18, '#ff6f91'], [16, '#ffffff']]) sakura(c, x, -52, 5, col);
    const cols = ['#ff6f91', '#ffd23f', '#ff9a3d', '#ffffff', '#b39ae8', '#7fd0e8'];
    for (let i = 0; i < 11; i++) { const a = Math.PI * 0.05 + (i / 10) * Math.PI * 0.9; sakura(c, Math.cos(a) * 26, -88 + Math.sin(a) * 16, 4.5, cols[i % cols.length]); }
  };
  EXT.hat.hibiscus = (c, ch, t) => {
    G.ell(c, 50, -134, 14, 7, 0.6); G.fillO(c, '#5fae58', 2);
    c.save(); c.translate(34, -148); c.rotate(Math.sin(T(t) * 0.004) * 0.1);
    for (let k = 0; k < 5; k++) { const a = (k / 5) * PT.TAU - Math.PI / 2; G.ell(c, Math.cos(a) * 13, Math.sin(a) * 13, 12, 9, a); G.fillO(c, '#ff5d78', 2.5); }
    G.circ(c, 0, 0, 6); c.fillStyle = '#ffb3c8'; c.fill();
    c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-10, -12); c.stroke(); G.circ(c, -10, -12, 3); c.fillStyle = '#ffd23f'; c.fill();
    c.restore();
    sakura(c, 12, -160, 6, '#ffffff');
  };
  EXT.hat.cowboy = (c, ch, t) => {
    const col = '#c0803f';
    c.beginPath(); c.moveTo(-74, -152); c.quadraticCurveTo(-60, -138, 0, -142); c.quadraticCurveTo(60, -138, 74, -152); c.quadraticCurveTo(64, -160, 0, -156); c.quadraticCurveTo(-64, -160, -74, -152); c.closePath(); BBX(-74, -160, 74, -138); G.fillO(c, col, 3);
    c.beginPath(); c.moveTo(-36, -152); c.quadraticCurveTo(-38, -194, -22, -196); c.quadraticCurveTo(0, -186, 22, -196); c.quadraticCurveTo(38, -194, 36, -152); c.closePath(); BBX(-38, -196, 38, -152); G.fillO(c, col, 3);
    G.rr(c, -37, -166, 74, 10, 4); G.fillO(c, '#6b4a2b', 2);
    G.star(c, 0, -161, 8, 3.5); G.fillO(c, '#ffd23f', 1.5);
  };
  EXT.body.cowboyvest = (c, ch, t) => {
    const col = '#a8733f';
    G.rr(c, -12, -88, 24, 62, 4); G.fillO(c, '#ffffff', 2);
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(s * 8, -88); c.lineTo(s * 28, -86); c.lineTo(s * 31, -30); c.lineTo(s * 6, -30); c.lineTo(s * 12, -56); c.closePath(); BBX(-31, -88, 31, -30); G.fillO(c, col, 3);
      c.strokeStyle = PT.line(col); c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 4; i++) { const x = s * (8 + i * 6); c.moveTo(x, -30); c.lineTo(x, -22); } c.stroke();
    }
    G.star(c, -18, -64, 8, 3.5); G.fillO(c, '#ffd23f', 2);
    c.beginPath(); c.moveTo(-18, -92); c.lineTo(18, -92); c.lineTo(0, -72); c.closePath(); BBX(-18, -92, 18, -72); G.fillO(c, '#e2434b', 2.5);
    c.fillStyle = '#ffffff'; for (const [x, y] of [[-6, -88], [6, -88], [0, -80]]) { G.circ(c, x, y, 1.8); c.fill(); }
    G.rr(c, -30, -36, 60, 8, 3); G.fillO(c, '#6b4a2b', 2); G.rr(c, -8, -38, 16, 12, 3); G.fillO(c, '#ffd23f', 2);
  };
  EXT.hat.nemes = (c, ch, t) => {
    const stripes = (fn) => { fn(); c.save(); c.clip(); c.fillStyle = '#ffd23f'; c.fillRect(-70, -190, 140, 130); c.fillStyle = '#3f6fd0'; for (let y = -186; y < -60; y += 12) c.fillRect(-70, y, 140, 6); c.restore(); fn(); c.strokeStyle = '#a8801a'; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke(); };
    for (const s of [-1, 1]) stripes(() => G.poly(c, [s * 38, -150, s * 52, -150, s * 66, -112, s * 62, -66, s * 44, -66, s * 46, -112]));
    stripes(() => { c.beginPath(); c.moveTo(-48, -146); c.quadraticCurveTo(-46, -188, 0, -188); c.quadraticCurveTo(46, -188, 48, -146); c.closePath(); });
    G.rr(c, -50, -152, 100, 11, 5); G.fillO(c, '#ffcf3f', 2.5);
    c.beginPath(); c.moveTo(0, -176); c.quadraticCurveTo(10, -168, 0, -152); c.quadraticCurveTo(-10, -168, 0, -176); BBX(-8, -176, 8, -152); G.fillO(c, '#ffcf3f', 2);
    G.circ(c, 0, -168, 2.5); c.fillStyle = '#3f6fd0'; c.fill();
  };
  EXT.body.egyptrobe = (c, ch, t) => {
    robeShape(c, -88, -6, 26, 34, '#fbf6ea');
    c.strokeStyle = '#e6dcc4'; c.lineWidth = 2; c.beginPath(); for (const x of [-14, 14]) { c.moveTo(x * 0.8, -50); c.lineTo(x * 1.3, -10); } c.stroke();
    G.rr(c, -10, -54, 20, 44, 3); c.save(); c.clip(); c.fillStyle = '#ffd23f'; c.fillRect(-10, -54, 20, 44); c.fillStyle = '#3f6fd0'; for (let y = -50; y < -10; y += 8) c.fillRect(-10, y, 20, 4); c.restore(); c.strokeStyle = '#a8801a'; c.lineWidth = 2; G.rr(c, -10, -54, 20, 44, 3); c.stroke();
    G.rr(c, -28, -60, 56, 8, 3); G.fillO(c, '#ffcf3f', 2);
    for (const [r, col] of [[36, '#ffcf3f'], [29, '#3f6fd0'], [23, '#ff9a3d'], [17, '#ffcf3f']]) { c.beginPath(); c.ellipse(0, -90, r, r * 0.7, 0, 0, Math.PI); c.closePath(); BBX(-r, -90, r, -90 + r * 0.7); G.fillO(c, col, 2); }
  };

  /* ================= ゆめかわ・パーティー ================= */
  EXT.body.yumedress = (c, ch, t) => {
    const sw = Math.sin(T(t) * 0.004) * 3;
    c.beginPath(); c.moveTo(-20, -88); c.lineTo(20, -88); c.lineTo(22, -58); c.quadraticCurveTo(50 + sw, -30, 52 + sw, -8);
    for (let i = 0; i < 7; i++) { const x0 = 52 + sw - i * 14.86; c.quadraticCurveTo(x0 - 7.4, 0, x0 - 14.86, -8); }
    c.quadraticCurveTo(-50 + sw, -30, -22, -58); c.closePath();
    gfill(c, G.grad(c, 0, -88, 0, -4, [[0, '#ffb0dc'], [0.45, '#c9b0ff'], [1, '#9fe8d4']]), '#b48ad8', 3);
    c.save(); c.globalAlpha *= 0.3; skirt(c, -58, -18, 22, 40, '#ffffff', 6, sw * 0.6, 1.5); c.restore();
    puffs(c, '#ffe0f0');
    G.rr(c, -22, -62, 44, 8, 4); G.fillO(c, '#9fd8ff', 2);
    for (const s of [-1, 1]) { G.blob(c, [0, -58, s * 14, -68, s * 20, -58, s * 14, -50]); G.fillO(c, '#9fd8ff', 2); }
    G.star(c, 0, -58, 6, 3); c.fillStyle = '#ffe066'; c.fill();
    for (const [x, y] of [[-30, -22], [26, -28], [-8, -32]]) { G.heart(c, x + sw * 0.4, y, 5); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); }
    twinkle(c, t, [[-14, -76, 4], [12, -72, 4], [38, -16, 5], [-40, -12, 5]]);
  };
  const pj = (col, deco) => (c, ch, t) => {
    G.rr(c, -30, -88, 60, 66, 14); G.fillO(c, col, 3);
    c.save(); G.rr(c, -30, -88, 60, 66, 14); c.clip(); deco(c); c.restore();
    for (const s of [-1, 1]) { G.blob(c, [0, -86, s * 20, -92, s * 24, -80, s * 8, -74]); G.fillO(c, '#ffffff', 2.5); }
    for (const y of [-64, -50, -36]) { G.circ(c, 0, y, 3.5); G.fillO(c, '#ffffff', 1.5); }
  };
  EXT.body.pjstar = pj('#8fdcc4', (c) => { c.fillStyle = '#fff3a0'; for (const [x, y] of [[-18, -70], [16, -56], [-14, -38], [20, -32], [-24, -52]]) { G.star(c, x, y, 6, 2.6); c.fill(); } G.circ(c, 14, -76, 5); c.fill(); });
  EXT.body.pjheart = pj('#ffc4dc', (c) => { c.fillStyle = '#ffffff'; for (const [x, y] of [[-18, -70], [16, -58], [-14, -38], [20, -34], [-24, -52]]) { G.heart(c, x, y, 6); c.fill(); } c.strokeStyle = 'rgba(255,143,180,.6)'; c.lineWidth = 3; c.beginPath(); for (let x = -30; x < 32; x += 10) { c.moveTo(x, -88); c.lineTo(x, -22); } c.stroke(); });
  EXT.face.eyemask = (c, ch, t, lx = 0) => {
    c.strokeStyle = '#b39ae8'; c.lineWidth = 3; c.beginPath(); c.moveTo(-44 + lx, -150); c.quadraticCurveTo(-50, -140, -46, -130); c.moveTo(44 + lx, -150); c.quadraticCurveTo(50, -140, 46, -130); c.stroke();
    G.blob(c, [-44 + lx, -152, -22 + lx, -164, 0 + lx, -158, 22 + lx, -164, 44 + lx, -152, 34 + lx, -138, 0 + lx, -142, -34 + lx, -138]); G.fillO(c, '#c9b2ff', 2.5);
    c.strokeStyle = '#5a3a7a'; c.lineWidth = 2.5; c.lineCap = 'round';
    for (const s of [-1, 1]) { const x = s * 20 + lx; c.beginPath(); c.arc(x, -156, 8, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); c.beginPath(); for (const d of [-6, 0, 6]) { c.moveTo(x + d, -148); c.lineTo(x + d * 1.3, -144); } c.stroke(); }
    G.heart(c, 0 + lx, -150, 4); c.fillStyle = '#ff8fb1'; c.fill();
  };
  EXT.hat.kachu_neko = (c, ch, t) => {
    const tw = Math.sin(T(t) * 0.01) > 0.9 ? 0.15 : 0;
    for (const s of [-1, 1]) { c.save(); c.translate(s * 28, -153); c.rotate(s * (0.35 + (s > 0 ? tw : 0))); G.poly(c, [-13, 4, 0, -30, 13, 4]); G.fillO(c, '#ffffff', 3); G.poly(c, [-7, 0, 0, -20, 7, 0]); c.fillStyle = '#ffb3cf'; c.fill(); c.restore(); }
    hband(c, '#ffffff');
    G.blob(c, [24, -154, 34, -164, 40, -154, 34, -146]); G.fillO(c, '#ff8fb1', 2); G.circ(c, 24, -154, 4); G.fillO(c, '#ff6f91', 1.5);
  };
  EXT.hat.kachu_usa = (c, ch, t) => {
    const w = Math.sin(T(t) * 0.006) * 0.08;
    for (const s of [-1, 1]) { c.save(); c.translate(s * 14, -158); c.rotate(s * (0.18 + (s > 0 ? w * 2 : w))); G.ell(c, 0, -30, 11, 32); G.fillO(c, '#ffffff', 3); G.ell(c, 0, -28, 5.5, 24); c.fillStyle = '#ffc4d6'; c.fill(); c.restore(); }
    hband(c, '#ffb3cf');
    G.circ(c, -30, -152, 6); G.fillO(c, '#ffffff', 2);
  };
  EXT.hat.dotribbon = (c, ch, t) => {
    c.save(); c.translate(0, -166); c.rotate(Math.sin(T(t) * 0.004) * 0.06);
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(s * 4, 4); c.quadraticCurveTo(s * 18, 18, s * 22, 30); c.lineTo(s * 12, 26); c.lineTo(s * 8, 32); c.quadraticCurveTo(s * 6, 16, 0, 6); c.closePath(); BBX(-22, 4, 22, 32); G.fillO(c, '#6fd6c0', 2.5);
      G.blob(c, [0, 0, s * 34, -26, s * 52, -10, s * 48, 16, s * 26, 12]); G.fillO(c, '#6fd6c0', 3);
      c.fillStyle = '#ffffff'; for (const [x, y] of [[26, -10], [40, -4], [36, 10], [18, 2], [44, -16]]) { G.circ(c, s * x, y, 3.4); c.fill(); }
    }
    G.circ(c, 0, 0, 10); G.fillO(c, '#4fc0a8', 3);
    c.restore();
  };
  EXT.hat.pumpkincap = (c, ch, t) => {
    c.save(); c.translate(6, -160); c.rotate(-0.12 + Math.sin(T(t) * 0.004) * 0.04);
    c.strokeStyle = '#5c9e3e'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -18); c.quadraticCurveTo(2, -30, 10, -32); c.stroke();
    G.ell(c, 14, -26, 10, 5, -0.4); G.fillO(c, '#7bc95a', 2);
    for (const [x, w] of [[-16, 18], [16, 18], [0, 20]]) { G.ell(c, x, 0, w, 20); G.fillO(c, '#ff9a3d', 3); }
    c.restore();
  };
  EXT.body.pumpkinsuit = (c, ch, t) => {
    for (const [x, w] of [[-20, 24], [20, 24], [0, 26]]) { G.ell(c, x, -54, w, 36); G.fillO(c, '#ff9a3d', 3); }
    for (const s of [-1, 1]) { G.ell(c, s * 12, -90, 13, 6, s * 0.4); G.fillO(c, '#7bc95a', 2); }
    c.fillStyle = '#6a3a1a'; G.poly(c, [-20, -62, -8, -62, -14, -72]); c.fill(); G.poly(c, [8, -62, 20, -62, 14, -72]); c.fill();
    c.beginPath(); c.moveTo(-18, -48); c.quadraticCurveTo(0, -32, 18, -48); c.quadraticCurveTo(0, -40, -18, -48); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,120,140,.45)'; G.ell(c, -26, -50, 6, 4); c.fill(); G.ell(c, 26, -50, 6, 4); c.fill();
  };
  EXT.hat.halo = (c, ch, t) => {
    const b = Math.sin(T(t) * 0.004) * 4;
    c.save(); c.globalAlpha *= 0.35 + 0.15 * Math.sin(T(t) * 0.006); G.ell(c, 0, -186 + b, 40, 15); c.fillStyle = '#fff6b0'; c.fill(); c.restore();
    G.ell(c, 0, -186 + b, 30, 9); c.strokeStyle = '#c99a22'; c.lineWidth = 9; c.stroke(); c.strokeStyle = '#ffe066'; c.lineWidth = 5; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, -186 + b, 30, 9, 0, Math.PI * 1.1, Math.PI * 1.5); c.stroke();
  };
  EXT.back.angelwings = (c, ch, t) => {
    const fl = Math.sin(T(t) * 0.008) * 0.12;
    for (const s of [-1, 1]) {
      c.save(); c.translate(s * 12, -86); c.rotate(-s * (0.5 + fl));
      for (const [x, y, rx, ry, a] of [[30, -2, 34, 18, -0.5], [44, -26, 26, 13, -0.8], [26, 18, 26, 12, -0.15]]) { G.ell(c, s * x, y, rx, ry, s * a); G.fillO(c, '#ffffff', 2.5); }
      c.strokeStyle = '#d6dff0'; c.lineWidth = 2; c.beginPath(); c.moveTo(s * 18, -4); c.lineTo(s * 52, -10); c.moveTo(s * 16, 10); c.lineTo(s * 44, 16); c.stroke();
      c.restore();
    }
  };
  EXT.body.angeldress = (c, ch, t) => {
    const sw = Math.sin(T(t) * 0.004) * 3;
    robeShape(c, -88, -6, 22, 40, '#fffdf4', sw);
    c.strokeStyle = '#e8dcc0'; c.lineWidth = 2; c.beginPath(); for (const x of [-16, 0, 16]) { c.moveTo(x * 0.7, -56); c.lineTo(x * 1.6 + sw, -8); } c.stroke();
    c.strokeStyle = '#ffd23f'; c.lineWidth = 4; c.beginPath(); c.moveTo(-38 + sw, -10); c.quadraticCurveTo(0, -2, 38 + sw, -10); c.stroke();
    puffs(c, '#ffffff');
    c.strokeStyle = '#e0b030'; c.lineWidth = 4; c.beginPath(); c.moveTo(-24, -60); c.quadraticCurveTo(0, -54, 24, -60); c.stroke();
    c.beginPath(); c.moveTo(8, -58); c.quadraticCurveTo(12, -46, 8, -36); c.stroke();
    twinkle(c, t, [[-16, -32, 5], [20, -24, 4], [-4, -74, 4]], '#ffe066');
  };
  EXT.hat.koakuma_horn = (c, ch, t) => {
    hband(c, '#5a3a7a');
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 18, -154); c.quadraticCurveTo(s * 18, -182, s * 36, -192); c.quadraticCurveTo(s * 32, -170, s * 38, -150); c.closePath(); BBX(-38, -192, 38, -150); G.fillO(c, '#ff5d78', 2.5); }
    G.heart(c, 0, -156, 6); c.fillStyle = '#ff8fb1'; c.fill();
  };
  EXT.back.koakumawings = (c, ch, t) => {
    const fl = Math.sin(T(t) * 0.02) * 0.2;
    const tw = Math.sin(T(t) * 0.006) * 6;
    c.strokeStyle = PT.line('#5a3a7a'); c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(-6, -36); c.quadraticCurveTo(-44, -30, -46 + tw, -6); c.stroke();
    c.strokeStyle = '#5a3a7a'; c.lineWidth = 4.5; c.stroke();
    G.heart(c, -46 + tw, -4, 9); G.fillO(c, '#ff5d78', 2);
    for (const s of [-1, 1]) {
      c.save(); c.translate(s * 14, -88); c.rotate(-s * (0.25 + fl));
      c.beginPath(); c.moveTo(0, 0); c.lineTo(s * 40, -18); c.quadraticCurveTo(s * 38, -4, s * 46, 6); c.quadraticCurveTo(s * 34, 2, s * 30, 12); c.quadraticCurveTo(s * 20, 4, s * 12, 14); c.closePath(); BBX(-46, -18, 46, 14); G.fillO(c, '#7a4fb0', 2.5);
      c.restore();
    }
  };
  EXT.body.koakumadress = (c, ch, t) => {
    const sw = Math.sin(T(t) * 0.005) * 3;
    c.beginPath(); c.moveTo(-22, -58); c.lineTo(22, -58); c.lineTo(46 + sw, -18); for (let i = 0; i < 6; i++) { const x0 = 46 + sw - i * 15.33; c.lineTo(x0 - 7.6, -26); c.lineTo(x0 - 15.33, -18); } c.closePath(); BBX(-46, -58, 46, -18); G.fillO(c, '#7a4fb0', 3);
    c.save(); c.globalAlpha *= 0.9; c.fillStyle = '#ff8fb1'; for (let i = 0; i < 6; i++) { G.circ(c, -38 + sw + i * 15.33, -24, 2.5); c.fill(); } c.restore();
    G.rr(c, -22, -88, 44, 34, 9); G.fillO(c, '#4a2f6a', 3);
    for (const s of [-1, 1]) { G.poly(c, [0, -88, s * 22, -94, s * 14, -80]); G.fillO(c, '#ff8fb1', 2); }
    G.rr(c, -23, -60, 46, 7, 3); G.fillO(c, '#ff5d78', 2);
    G.heart(c, 0, -62, 8); G.fillO(c, '#ff5d78', 2);
  };
  EXT.face.hanamegane = (c, ch, t, lx = 0) => {
    c.strokeStyle = '#2a2235'; c.lineWidth = 5; c.lineCap = 'round';
    for (const x of [-19, 19]) { G.circ(c, x + lx, -122, 14); c.fillStyle = 'rgba(255,255,255,.25)'; c.fill(); c.stroke(); }
    c.beginPath(); c.moveTo(-5 + lx, -124); c.lineTo(5 + lx, -124); c.stroke();
    c.lineWidth = 6; c.beginPath(); for (const s of [-1, 1]) { c.moveTo(s * 10 + lx, -144); c.quadraticCurveTo(s * 20 + lx, -150, s * 30 + lx, -144); } c.stroke();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(lx, -96); c.quadraticCurveTo(s * 14 + lx, -102, s * 24 + lx, -94); c.quadraticCurveTo(s * 14 + lx, -88, lx, -92); c.closePath(); BBX(-24, -102, 24, -88); G.fillO(c, '#4a3220', 2); }
    G.ell(c, lx, -106, 10, 9); G.fillO(c, '#ff9fb0', 2.5);
    G.circ(c, lx - 3, -109, 2.5); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill();
  };
  EXT.face.partyglasses = (c, ch, t, lx = 0) => {
    const cols = ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a', '#c38be0'];
    c.lineCap = 'round';
    for (let i = 0; i < 9; i++) { const x = -40 + i * 10 + lx; const k = Math.sin(T(t) * 0.01 + i) * 3; c.strokeStyle = cols[i % 5]; c.lineWidth = 3.5; c.beginPath(); c.moveTo(x, -136); c.quadraticCurveTo(x + 6, -146, x + k, -156); c.stroke(); }
    for (const x of [-20, 20]) { G.rr(c, x - 17 + lx, -136, 34, 26, 10); c.fillStyle = 'rgba(255,170,220,.45)'; c.fill(); c.strokeStyle = '#ff5d92'; c.lineWidth = 4; c.stroke(); }
    c.beginPath(); c.moveTo(-3 + lx, -124); c.lineTo(3 + lx, -124); c.stroke();
    twinkle(c, t, [[-30 + lx, -132, 4], [30 + lx, -116, 4]]);
  };

  /* ================= アイテム ================= */
  const def = (id, o) => { PT.ITEMS[id] = Object.assign({ id, tags: ['dress4'], w: 90, h: 90 }, o); };
  const WR = (id, name, slot, kind, role, w, h, off, offX = 0, tags = []) => def(id, { name, cat: 'dress', tags: ['dress4', slot === 'hat' ? 'hat' : slot].concat(tags), w, h, wear: [slot, kind], role,
    draw: (c, t) => { c.save(); c.translate(offX, off); if (slot === 'body') EXT.body[kind](c, { wear: {}, pose: 'idle' }, t || 0); else if (slot === 'face') EXT.face[kind](c, {}, t || 0, 0); else if (slot === 'back') EXT.back[kind](c, { pose: 'idle' }, t || 0); else EXT.hat[kind](c, {}, t || 0); c.restore(); } });
  const SNAME = { red: 'レッド', blue: 'ブルー', yellow: 'イエロー', green: 'グリーン', pink: 'ピンク' };
  for (const k in SENTAI) {
    WR('sentai_' + k, 'せんたい ' + SNAME[k] + 'の ヘルメット', 'hat', 'sentai_' + k, 'r4sentai', 115, 90, 94, 0, ['hero']);
    WR('sentaisuit_' + k, 'せんたい ' + SNAME[k] + 'の スーツ', 'body', 'sentaisuit_' + k, 'r4sentai', 70, 70, 22, 0, ['hero']);
  }
  WR('heromantle', 'ヒーローの マント', 'back', 'heromantle', 'r4hero', 100, 100, 2, 0, ['hero']);
  WR('heromask', 'ヒーローの マスク', 'face', 'heromask', 'r4hero', 140, 44, 102, 0, ['hero']);
  WR('mechahelm', 'ロボの ヘルメット', 'hat', 'mechahelm', 'r4mecha', 125, 106, 104, 0, ['hero', 'robot']);
  WR('mechasuit', 'ロボの よろい', 'body', 'mechasuit', 'r4mecha', 80, 70, 22, 0, ['hero', 'robot']);
  WR('mahou_pink', 'まほうしょうじょの ドレス（ピンク）', 'body', 'mahou_pink', 'r4mahou', 104, 86, 6, 0, ['hero']);
  WR('mahou_blue', 'まほうしょうじょの ドレス（ブルー）', 'body', 'mahou_blue', 'r4mahou', 104, 86, 6, 0, ['hero']);
  WR('magicheart', 'ハートの はねカチューシャ', 'hat', 'magicheart', 'r4mahou', 100, 66, 118, 0, ['hero']);
  WR('kimono_red', 'あかい きもの', 'body', 'kimono_red', 'r4kimono', 92, 86, 6, 0, ['wafuku']);
  WR('kimono_purple', 'むらさきの きもの', 'body', 'kimono_purple', 'r4kimono', 92, 86, 6, 0, ['wafuku']);
  WR('hakama', 'はかま', 'body', 'hakama', 'r4kimono', 88, 86, 6, 0, ['wafuku']);
  WR('happi', 'はっぴ', 'body', 'happi', 'r4happi', 94, 68, 22, 0, ['wafuku', 'fest']);
  WR('hachimaki', 'はちまき', 'hat', 'hachimaki', 'r4happi', 120, 40, 118, -10, ['wafuku', 'fest']);
  WR('ninjahood', 'にんじゃの ずきん', 'hat', 'ninjahood', 'r4ninja', 140, 110, 72, 10, ['wafuku', 'ninja']);
  WR('ninjasuit', 'にんじゃの ふく', 'body', 'ninjasuit', 'r4ninja', 70, 70, 22, 0, ['wafuku', 'ninja']);
  WR('kabuto', 'さむらいの かぶと', 'hat', 'kabuto', 'r4samurai', 130, 104, 114, 0, ['wafuku', 'ninja']);
  WR('yoroi', 'さむらいの よろい', 'body', 'yoroi', 'r4samurai', 96, 76, 16, 0, ['wafuku', 'ninja']);
  WR('chinadress', 'チャイナふく', 'body', 'chinadress', 'r4china', 80, 90, 6, 0, ['world']);
  WR('odango', 'おだんごカバー', 'hat', 'odango', 'r4china', 110, 64, 108, 0, ['world']);
  WR('hula', 'フラダンスの スカートと レイ', 'body', 'hula', 'r4hula', 80, 92, 6, 0, ['world', 'beach']);
  WR('hibiscus', 'ハイビスカスの かみかざり', 'hat', 'hibiscus', 'r4hula', 70, 56, 126, -32, ['world', 'beach']);
  WR('cowboy', 'カウボーイ ハット', 'hat', 'cowboy', 'r4cowboy', 150, 60, 138, 0, ['world']);
  WR('cowboyvest', 'カウボーイの ベスト', 'body', 'cowboyvest', 'r4cowboy', 70, 74, 20, 0, ['world']);
  WR('nemes', 'ファラオの かぶりもの', 'hat', 'nemes', 'r4egypt', 130, 122, 64, 0, ['world']);
  WR('egyptrobe', 'エジプトの ふく', 'body', 'egyptrobe', 'r4egypt', 80, 90, 4, 0, ['world']);
  WR('yumedress', 'ゆめかわ ドレス', 'body', 'yumedress', 'r4yume', 106, 90, 4, 0, ['party']);
  WR('dotribbon', 'みずたまの でっかい リボン', 'hat', 'dotribbon', 'r4yume', 110, 64, 134, 0, ['party']);
  WR('pjstar', 'ほしの パジャマ', 'body', 'pjstar', 'r4pajama', 64, 70, 22, 0, ['party', 'sleep']);
  WR('pjheart', 'ハートの パジャマ', 'body', 'pjheart', 'r4pajama', 64, 70, 22, 0, ['party', 'sleep']);
  WR('eyemask', 'おやすみ アイマスク', 'face', 'eyemask', 'r4pajama', 100, 34, 128, 0, ['party', 'sleep']);
  WR('kachu_neko', 'ねこみみ カチューシャ', 'hat', 'kachu_neko', 'r4kachu', 104, 76, 116, 0, ['party']);
  WR('kachu_usa', 'うさみみ カチューシャ', 'hat', 'kachu_usa', 'r4kachu', 100, 104, 116, 0, ['party']);
  WR('pumpkincap', 'かぼちゃの ぼうし', 'hat', 'pumpkincap', 'r4pumpkin', 70, 64, 140, -6, ['party', 'halloween']);
  WR('pumpkinsuit', 'かぼちゃの ふく', 'body', 'pumpkinsuit', 'r4pumpkin', 90, 80, 16, 0, ['party', 'halloween']);
  WR('halo', 'てんしの わっか', 'hat', 'halo', 'r4angel', 84, 34, 170, 0, ['party', 'angel']);
  WR('angelwings', 'てんしの はね', 'back', 'angelwings', 'r4angel', 170, 100, 30, 0, ['party', 'angel']);
  WR('angeldress', 'てんしの ドレス', 'body', 'angeldress', 'r4angel', 90, 90, 4, 0, ['party', 'angel']);
  WR('koakuma_horn', 'あくまっこの つの', 'hat', 'koakuma_horn', 'r4devil', 100, 80, 116, 0, ['party', 'halloween']);
  WR('koakumawings', 'あくまっこの はねと しっぽ', 'back', 'koakumawings', 'r4devil', 130, 100, 4, 0, ['party', 'halloween']);
  WR('koakumadress', 'あくまっこの ワンピース', 'body', 'koakumadress', 'r4devil', 96, 80, 16, 0, ['party', 'halloween']);
  WR('hanamegane', 'はなめがね', 'face', 'hanamegane', 'r4funny', 90, 60, 88, 0, ['party']);
  WR('partyglasses', 'パーティーめがね', 'face', 'partyglasses', 'r4funny', 100, 50, 106, 0, ['party']);

  const NEW = Object.keys(PT.ITEMS).filter((id) => (PT.ITEMS[id].tags || []).includes('dress4'));
  PT.DRESS4_ITEMS = NEW;
  const fav = (sid, ids) => { const st = PT.stageById && PT.stageById(sid); if (st) st.favs = ids.concat(st.favs || []); };
  fav('ninja', ['ninjahood', 'ninjasuit', 'kabuto', 'yoroi']);
  fav('fest', ['happi', 'hachimaki', 'kimono_red', 'kimono_purple', 'hakama']);
  fav('halloween', ['pumpkincap', 'pumpkinsuit', 'koakuma_horn', 'koakumawings', 'halo', 'angelwings']);
  fav('beach', ['hula', 'hibiscus']);
  fav('desert', ['nemes', 'egyptrobe', 'cowboy', 'cowboyvest']);
  fav('robotfactory', ['mechahelm', 'mechasuit', 'sentai_red', 'sentaisuit_red']);
  fav('concert', ['mahou_pink', 'magicheart', 'yumedress', 'partyglasses']);
  fav('cloud', ['halo', 'angelwings', 'angeldress', 'yumedress']);

  /* ================= あそび ================= */
  const W = PT.world, R = PT.R;
  if (!R || !R.h || !R.h.isP) return;
  const D = R.D, X = PT.FX, A = PT.audio;
  const near = (ch, n = 2, r = 900) => R.free(ch.x, ch.y, [ch], r).slice(0, n);
  const headY = (ch) => ch.y - (ch.z || 0) - 130 * (ch.scale || 1);

  D('d4_sentai', 'せんたいヒーロー さんじょう', 'せんたいの ヘルメットや スーツで へんしん！', ['sentai_red', 'sentaisuit_red']);
  D('d4_sentai5', '5にん そろって ごうたい！', '5しょくの ヒーローが そろうと…ドッカーン！', ['sentai_blue', 'sentai_yellow', 'sentai_pink']);
  D('d4_hero', 'せいぎの みかた', 'マントや マスクで おそらを ひとっとび', ['heromantle', 'heromask']);
  D('d4_mecha', 'ロボに へんしん', 'ロボの ヘルメットで ジェット ビューン', ['mechahelm', 'mechasuit']);
  D('d4_mahou', 'まほうしょうじょ', 'ハートの ちからで キラキラ へんしん', ['mahou_pink', 'magicheart']);
  D('d4_kimono', 'きもので ごあいさつ', 'きものを きて ていねいに おじぎ', ['kimono_red', 'hakama']);
  D('d4_happi', 'わっしょい わっしょい', 'はっぴと はちまきで みんなで おみこし', ['happi', 'hachimaki']);
  D('d4_ninja', 'にんじゃの じゅつ', 'ドロン！と きえて べつの ところに', ['ninjahood', 'ninjasuit']);
  D('d4_samurai', 'えい えい おー！', 'かぶとを かぶって みんなで かちどき', ['kabuto', 'yoroi']);
  D('d4_china', 'リボンの おどり', 'チャイナふくで くるくる リボン', ['chinadress', 'odango']);
  D('d4_hula', 'アロハ〜 フラダンス', 'フラの スカートで ゆらゆら おどろう', ['hula', 'hibiscus']);
  D('d4_cowboy', 'ヒーハー！ カウボーイ', 'カウボーイ ハットで なげなわ くるくる', ['cowboy', 'cowboyvest']);
  D('d4_egypt', 'エジプトの おうさま', 'ファラオに なると みんなが ははー！', ['nemes', 'egyptrobe']);
  D('d4_yume', 'ゆめかわ へんしん', 'ゆめかわ ドレスで にじが でたよ', ['yumedress', 'dotribbon']);
  D('d4_pajama', 'パジャマ パーティー', 'パジャマで まくらなげ！ はねが ふわふわ', ['pjstar', 'pjheart']);
  D('d4_kachu', 'ねこみみ うさみみ', 'カチューシャで ニャン♪ ぴょん♪', ['kachu_neko', 'kachu_usa']);
  D('d4_pumpkin', 'かぼちゃの おばけ？', 'かぼちゃの ふくで おかしが ポン！', ['pumpkinsuit', 'pumpkincap']);
  D('d4_angel', 'ふわふわ てんし', 'わっかと はねで ふわっと うく', ['halo', 'angelwings']);
  D('d4_devil', 'あくまっこの いたずら', 'あくまっこが こちょこちょ いたずら', ['koakuma_horn', 'koakumawings']);
  D('d4_angeldevil', 'てんしと あくまっこ', 'てんしと あくまっこが そろったら なかよし ハグ', ['halo', 'koakuma_horn']);
  D('d4_funny', 'へんしん めがね', 'はなめがねや パーティーめがねで みんな おおわらい', ['hanamegane', 'partyglasses']);

  /* ---- せんたい ---- */
  const scol = (ch) => { const w = ch.wear || {}; const m = /^sentai_(\w+)$/.exec(w.hat || ''); if (m) return m[1]; const m2 = /^sentaisuit_(\w+)$/.exec(w.body || ''); return m2 ? m2[1] : null; };
  const SORDER = ['blue', 'green', 'red', 'yellow', 'pink'];
  let gattaiAt = -1e9;
  const gattai = () => {
    if (W.t - gattaiAt < 9000) return; gattaiAt = W.t;
    const team = SORDER.map((k) => R.chars().find((o) => scol(o) === k)).filter(Boolean);
    const cx = PT.clamp(team.reduce((s, o) => s + o.x, 0) / team.length, W.visLeft + 300, W.visRight - 300);
    const cy = team.reduce((s, o) => s + o.y, 0) / team.length;
    team.forEach((o, i) => { const p = W.clampFloor(cx + (i - 2) * 115, cy + (i === 2 ? 20 : 0), 60); R.claim(o, 9000).go(p.x, p.y, true).look(cx).pose('point', 500).say(SNAME[SORDER[i]] + '！', null, 900, 'yay').pose('cheer', 6000); });
    W.after(2600, () => {
      A.sfx('drumroll');
      team.forEach((o, i) => W.after(i * 160, () => { R.claim(o, 3200).jump(70, 600).pose('cheer', 2000); W.burst('star', o.x, o.y - 120 * o.scale, 6, { up: true, sp: 0.2, col: SENTAI[SORDER[i]] }); }));
    });
    W.after(3600, () => {
      A.sfx('firework'); A.sfx('cheer'); W.shake = W.t + 600;
      W.bigText('ごうたい！', cx, cy - 300, '#ff6f61');
      team.forEach((o, i) => { W.burst('smoke', o.x, o.y - 30, 6, { sp: 0.14, max: 900, size: 26, col: SENTAI[SORDER[i]], g: 0, up: true }); X.firework(o.x, Math.max(120, o.y - 360 - (i % 2) * 60), SENTAI[SORDER[i]]); });
      X.confetti(cx, 2200); W.burst('confetti', cx, cy - 200, 30, { sp: 0.45, max: 1800 });
      R.found('d4_sentai5');
      R.audience(cx, cy, team, 'cheer', 3, 400);
    });
  };
  R.ROLES.r4sentai = (ch) => {
    const col = scol(ch); if (!col) return;
    if (ch.wear.hat !== 'sentai_' + col || ch.wear.body !== 'sentaisuit_' + col) ch.wear = Object.assign({}, ch.wear, { hat: 'sentai_' + col, body: 'sentaisuit_' + col });
    const cc = SENTAI[col];
    R.claim(ch, 5000).do(() => { A.sfx('zap'); W.ring(ch.x, ch.y - 90 * ch.scale, cc, 700, 130); }).pose('spin', 700)
      .do(() => { W.bigText(SNAME[col] + '！', ch.x, ch.y - 260 * ch.scale, cc); W.burst('star', ch.x, ch.y - 130 * ch.scale, 10, { sp: 0.25, col: cc }); A.sfx('discover'); })
      .say('せんたい ' + SNAME[col] + '！', 'sentai_' + col, 1500, 'yay').pose('point', 1100).do(() => {
        R.found('d4_sentai');
        const cols = new Set(R.chars().map(scol).filter(Boolean));
        if (cols.size >= 5) gattai();
        else if (cols.size >= 2) { const o = R.chars().find((x) => x !== ch && scol(x)); if (o && W.isFree(o)) R.claim(o, 2500).look(ch.x).pose('point', 900).say('あと ' + (5 - cols.size) + 'にん！', 'star', 1400, 'yay'); }
      });
    R.mimic(ch, 'point', 1200, 'へんしん！');
  };
  /* ---- ヒーロー（マント・マスク） ---- */
  R.ROLES.r4hero = (ch) => {
    const sx = ch.x, sy = ch.y;
    R.claim(ch, 7000).say('せいぎの みかた さんじょう！', 'heromantle', 1500, 'yay').pose('point', 600).sfx('whoosh').do(() => {
      const dir = sx < (W.visLeft + W.visRight) / 2 ? 1 : -1;
      R.tween(ch, 2600, (k) => { const a = k * PT.TAU; ch.x = sx + Math.sin(a) * 260 * dir; ch.z = Math.sin(k * Math.PI) * 240; ch.pose = 'fly'; ch.flip = Math.cos(a) * dir < 0; if (Math.random() < 0.4) W.burst('star', ch.x, ch.y - ch.z - 60, 1, { sp: 0.05, max: 700, size: 10, g: 0 }); }, () => { ch.z = 0; ch.x = sx; ch.y = sy; R.claim(ch, 2200).say('まかせて！', 'star', 1300, 'yay').pose('cheer', 1000); R.found('d4_hero'); });
    });
    R.audience(sx, sy, [ch], 'wow', 2, 900);
  };
  /* ---- ロボ ---- */
  R.ROLES.r4mecha = (ch) => {
    R.claim(ch, 7000).say('ロボ へんしん！ ガシャーン', 'mechahelm', 1400, 'talk').pose('march', 1400).sfx('zap').do(() => {
      A.sfx('rocket');
      R.tween(ch, 2400, (k) => { ch.z = Math.sin(k * Math.PI) * 130; ch.pose = 'cheer'; if (Math.random() < 0.6) W.burst('smoke', ch.x + PT.rand(-12, 12), ch.y - ch.z, 1, { sp: 0.05, max: 600, size: 14, col: PT.pick(['#ffd23f', '#ff9a3d', '#ffffff']), g: 0.0004 }); }, () => { ch.z = 0; R.found('d4_mecha'); R.claim(ch, 2000).say('ジェット ビューン！', 'star', 1300, 'yay').pose('point', 900); });
    });
    R.mimic(ch, 'march', 1600, 'ガシャン ガシャン');
  };
  /* ---- まほうしょうじょ ---- */
  R.ROLES.r4mahou = (ch) => {
    R.claim(ch, 6000).say('キラキラ へんしん！', 'magicheart', 1300, 'yay').do(() => {
      A.sfx('magic'); for (let i = 0; i < 4; i++) W.after(i * 220, () => W.ring(ch.x, ch.y - 90 * ch.scale, PT.pick(['#ff8fc4', '#ffd23f', '#7fc8f8']), 700, 90 + i * 30));
      for (let i = 0; i < 8; i++) { const a = (i / 8) * PT.TAU; W.after(i * 80, () => W.burst('heart', ch.x + Math.cos(a) * 80, ch.y - 90 * ch.scale + Math.sin(a) * 60, 1, { sp: 0.08, max: 900, size: 12, g: 0 })); }
    }).pose('spin', 1400).do(() => { X.sparkleRain(1800); A.sfx('sparkle'); }).say('ハートの ちからで がんばるよ！', 'heart', 1600, 'yay').pose('point', 900).do(() => R.found('d4_mahou'));
    R.audience(ch.x, ch.y, [ch], 'wow', 2, 1400);
  };
  /* ---- わふく ---- */
  R.ROLES.r4kimono = (ch) => {
    const o = near(ch, 1, 800)[0];
    R.claim(ch, 5000).look(o ? o.x : ch.x).pose('bow', 1300).say('よろしく おねがいします', ch.wear.body || 'kimono_red', 1700, 'talk').do(() => {
      A.sfx('bell'); W.burst('leaf', ch.x, ch.y - 220 * ch.scale, 14, { sp: 0.12, max: 2400, size: 12, col: '#ffb3c8', g: 0.00006 });
      R.found('d4_kimono');
    }).face('laugh', 1200).pose('shy', 900);
    if (o) R.claim(o, 4000).look(ch.x).wait(500).pose('bow', 1300).say('こちらこそ', 'heart', 1400, 'talk').face('laugh', 900);
  };
  R.ROLES.r4happi = (ch) => {
    const fr = near(ch, 3, 1200);
    const dir = ch.x > (W.visLeft + W.visRight) / 2 ? -1 : 1;
    const tx = PT.clamp(ch.x + dir * 300, W.visLeft + 120, W.visRight - 120);
    fr.forEach((o) => { if (!o.wear.hat) o.wear = Object.assign({}, o.wear, { hat: 'hachimaki' }); });
    const all = [ch].concat(fr);
    all.forEach((o, i) => {
      const a = R.claim(o, 8000).wait(i * 250);
      if (i) a.go(ch.x - dir * i * 90, ch.y + (i % 2 ? 20 : -10), true);
      a.look(tx);
      for (let k = 0; k < 3; k++) a.say(k % 2 ? 'わっしょい！' : 'そーれ！', null, 700, 'yay').jump(45, 450);
      a.go(tx - dir * i * 90, o.y, false).pose('cheer', 900);
    });
    for (let k = 0; k < 6; k++) W.after(600 + k * 500, () => { A.sfx('drum'); W.burst('note', ch.x, ch.y - 200 * ch.scale, 1, { up: true, sp: 0.1, max: 900, col: '#e2434b', g: 0 }); });
    W.after(2600, () => R.found('d4_happi'));
  };
  R.ROLES.r4ninja = (ch) => {
    R.claim(ch, 6000).say('にんにん！', 'ninjahood', 1100, 'talk').pose('count', 700).do(() => {
      A.sfx('whoosh'); W.poof(ch.x, ch.y - 70 * ch.scale);
      const p = W.randFloor(160); ch.x = p.x; ch.y = p.y; ch.scale = W.depthScale(ch.y);
      W.poof(ch.x, ch.y - 70 * ch.scale); W.bigText('ドロン！', ch.x, ch.y - 230 * ch.scale, '#3a3f6a');
    }).pose('peek', 900).say('こっちだよ〜', 'star', 1300, 'laugh').do(() => R.found('d4_ninja'));
    near(ch, 2, 1000).forEach((o, i) => W.after(900 + i * 300, () => R.claim(o, 2500).face('surprise', 1200).say(PT.pick(['きえた！？', 'どこ どこ？']), '?', 1400, 'wow').pose('think', 900)));
  };
  R.ROLES.r4samurai = (ch) => {
    const fr = near(ch, 3, 1100);
    R.claim(ch, 5000).say('えい えい…', 'kabuto', 1000, 'talk').pose('cheer', 300).say('おー！', null, 1200, 'yay').jump(50, 500).do(() => { A.sfx('cheer'); W.burst('star', ch.x, ch.y - 200 * ch.scale, 8, { up: true, sp: 0.2 }); R.found('d4_samurai'); });
    for (let k = 0; k < 3; k++) W.after(k * 260, () => A.sfx('drum'));
    fr.forEach((o, i) => R.claim(o, 4000).look(ch.x).wait(1100 + i * 80).say('おー！', null, 1100, 'yay').jump(40, 450).pose('cheer', 900));
  };
  R.ROLES.r4china = (ch) => {
    R.claim(ch, 6000).say('ニーハオ！', 'chinadress', 1200, 'yay').pose('bow', 600).do(() => {
      A.sfx('jingle');
      W.special({ type: 'd4ribbon', max: 2800, draw(c, f) {
        const k = f.life / f.max, a0 = f.life * 0.008, x = ch.x, y = ch.y - (ch.z || 0) - 90 * ch.scale;
        c.save(); c.globalAlpha = Math.min(1, (1 - k) * 3); c.lineCap = 'round';
        for (const [col, ph] of [['#ff5d78', 0], ['#ffd23f', Math.PI]]) { c.strokeStyle = col; c.lineWidth = 7; c.beginPath(); for (let i = 0; i <= 30; i++) { const a = a0 + ph + i * 0.22; const r = 40 + i * 2.6; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.45 - i * 3; if (i) c.lineTo(px, py); else c.moveTo(px, py); } c.stroke(); }
        c.restore();
      } });
    }).pose('spin', 1400).pose('dance', 1100).say('くるくる〜！', 'star', 1200, 'laugh').do(() => R.found('d4_china'));
    R.audience(ch.x, ch.y, [ch], 'cheer', 2, 1600);
  };
  R.ROLES.r4hula = (ch) => {
    R.claim(ch, 6000).say('アロハ〜！', 'hula', 1200, 'yay').pose('dance', 3200).do(() => { W.burst('leaf', ch.x, ch.y - 160 * ch.scale, 10, { up: true, sp: 0.15, max: 1600, col: PT.pick(['#ff6f91', '#ffd23f', '#ffffff']), g: 0.0001 }); R.found('d4_hula'); }).face('laugh', 1000);
    X.music(ch.x, ch.y - 200 * ch.scale, 3500); A.sfx('jingle');
    near(ch, 2, 900).forEach((o, i) => W.after(700 + i * 300, () => R.claim(o, 3500).look(ch.x).say('ゆらゆら〜', null, 1200, 'laugh').pose('dance', 2400)));
  };
  R.ROLES.r4cowboy = (ch) => {
    R.claim(ch, 5000).say('ヒーハー！', 'cowboy', 1200, 'yay').pose('point', 2400).do(() => {
      A.sfx('whoosh');
      W.special({ type: 'd4lasso', max: 2400, draw(c, f) {
        const hx = ch.x + (ch.flip ? -26 : 26) * ch.scale, hy = ch.y - (ch.z || 0) - 110 * ch.scale, ly = ch.y - (ch.z || 0) - 230 * ch.scale, a = f.life * 0.02;
        c.save(); c.strokeStyle = '#c99a5a'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hy); c.lineTo(ch.x + Math.cos(a) * 50 * ch.scale, ly); c.stroke();
        c.beginPath(); c.ellipse(ch.x, ly, 60 * ch.scale, 16 * ch.scale, Math.sin(a) * 0.1, 0, PT.TAU); c.stroke(); c.restore();
      } });
      W.after(900, () => A.sfx('whoosh'));
    }).say('なげなわ くるくる〜', 'star', 1300, 'laugh').do(() => R.found('d4_cowboy'));
    R.audience(ch.x, ch.y, [ch], 'wow', 2, 1000);
  };
  R.ROLES.r4egypt = (ch) => {
    const fr = near(ch, 3, 1200);
    R.claim(ch, 6000).say('エジプトの おうさま だぞ！', 'nemes', 1600, 'yay').pose('cheer', 1200).do(() => { A.sfx('jingle'); W.burst('spark', ch.x, ch.y - 150 * ch.scale, 14, { sp: 0.22, col: '#ffd23f', g: 0 }); }).face('laugh', 900).do(() => W.after(1400, () => R.found('d4_egypt')));
    fr.forEach((o, i) => R.claim(o, 5000).wait(900 + i * 200).look(ch.x).say('ははー！', null, 1200, 'talk').pose('bow', 1600).face('laugh', 800));
  };
  R.ROLES.r4yume = (ch) => {
    R.claim(ch, 5500).say('ゆめかわ〜♪', 'yumedress', 1300, 'yay').pose('spin', 1300).do(() => {
      A.sfx('magic'); X.rainbow(4500);
      for (let i = 0; i < 6; i++) W.after(i * 150, () => W.burst(i % 2 ? 'heart' : 'spark', ch.x + PT.rand(-120, 120), ch.y - PT.rand(120, 260) * ch.scale, 2, { sp: 0.1, max: 1200, col: PT.pick(['#ffc4e6', '#d9c4ff', '#b8f0e0', '#fff3a0']), g: 0 }));
      R.found('d4_yume');
    }).face('love', 1500).pose('shy', 1000);
    near(ch, 1, 700).forEach((o) => R.claim(o, 3000).look(ch.x).face('love', 1400).say('かわいい〜！', 'heart', 1300, 'yay').pose('cheer', 900));
  };
  R.ROLES.r4pajama = (ch) => {
    const fr = near(ch, 3, 1100);
    R.claim(ch, 6000).say('パジャマ パーティー！', ch.wear.body === 'pjheart' ? 'pjheart' : 'pjstar', 1400, 'yay').pose('cheer', 700).say('まくらなげ だー！', 'cushion', 1200, 'laugh').pose('kick', 600);
    fr.forEach((o, i) => { const p = R.besides(ch, i % 2 ? -1 : 1, 110 + Math.floor(i / 2) * 90); R.claim(o, 6000).go(p.x, p.y, true).look(ch.x).wait(600 + i * 250).do(() => { A.sfx('boing'); X.beam(o.x, o.y - 100 * o.scale, ch.x, ch.y - 100 * ch.scale, 400); W.burst('leaf', (o.x + ch.x) / 2, Math.min(o.y, ch.y) - 120, 10, { sp: 0.15, max: 1800, size: 12, col: '#ffffff', g: 0.00005 }); }).pose('tickle', 900).face('laugh', 1200).say(PT.pick(['えいっ！', 'ぽふっ！', 'あはは！']), null, 1100, 'laugh'); });
    W.after(2600, () => { A.sfx('tickle'); W.burst('leaf', ch.x, ch.y - 160 * ch.scale, 16, { sp: 0.2, max: 2200, size: 12, col: '#ffffff', g: 0.00005 }); R.found('d4_pajama'); });
  };
  R.ROLES.r4kachu = (ch) => {
    const usa = ch.wear.hat === 'kachu_usa';
    const a = R.claim(ch, 5000).say(usa ? 'ぴょん ぴょん♪' : 'ニャン♪', ch.wear.hat || 'kachu_neko', 1300, 'yay');
    if (usa) a.jump(60, 420).jump(60, 420).jump(60, 420); else a.pose('peek', 900).pose('tickle', 900);
    a.face('love', 1000).do(() => { A.sfx('tickle'); W.burst('heart', ch.x, ch.y - 170 * ch.scale, 5, { up: true, sp: 0.12, max: 1100 }); R.found('d4_kachu'); });
    R.mimic(ch, usa ? 'jump' : 'peek', 1200, usa ? 'ぴょん！' : 'ニャー！');
  };
  R.ROLES.r4pumpkin = (ch) => {
    R.claim(ch, 5500).say('かぼちゃだよ〜', 'pumpkinsuit', 1200, 'laugh').pose('spin', 900).say('トリック・オア・トリート！', 'candy', 1500, 'yay').do(() => {
      A.sfx('ghost');
      for (let i = 0; i < 3; i++) W.after(200 + i * 220, () => { const p = W.clampFloor(ch.x + (i - 1) * 90, ch.y + 50, 60); const g = W.addProp(PT.pick(['candy', 'cookie', 'donut']), p.x, p.y, { temp: true }); if (g) g.pop = W.t; A.sfx('pop'); });
      R.found('d4_pumpkin');
    }).pose('cheer', 900);
    R.audience(ch.x, ch.y, [ch], 'cheer', 2, 2400);
  };
  /* ---- てんしと あくまっこ ---- */
  const isAngel = (o) => o && (o.wear.hat === 'halo' || o.wear.back === 'angelwings' || o.wear.body === 'angeldress');
  const isDevil = (o) => o && (o.wear.hat === 'koakuma_horn' || o.wear.back === 'koakumawings' || o.wear.body === 'koakumadress');
  let pairAt = -1e9;
  const pairCheck = () => {
    if (W.t - pairAt < 8000) return;
    const an = R.chars().find(isAngel), dv = R.chars().find((o) => isDevil(o) && o !== an);
    if (!an || !dv) return;
    pairAt = W.t;
    R.claim(dv, 5000).to(an, an.x < dv.x ? 85 : -85, 4, true).look(an.x).say('なかよし しよ！', 'heart', 1300, 'yay').pose('hug', 1600);
    R.claim(an, 5000).look(dv.x).wait(1500).say('うん！', 'heart', 1200, 'yay').pose('hug', 1600).do(() => { A.sfx('sparkle'); W.burst('heart', (an.x + dv.x) / 2, an.y - 170 * an.scale, 10, { up: true, sp: 0.15, max: 1300 }); R.found('d4_angeldevil'); });
  };
  R.ROLES.r4angel = (ch) => {
    R.claim(ch, 5000).say('ふわ〜っ', 'halo', 1200, 'yay').do(() => {
      A.sfx('magic');
      R.tween(ch, 3000, (k) => { ch.z = Math.sin(k * Math.PI) * 120 + Math.sin(k * PT.TAU * 2) * 8; ch.pose = 'jump'; if (Math.random() < 0.3) W.burst('spark', ch.x + PT.rand(-50, 50), ch.y - ch.z - PT.rand(40, 160) * ch.scale, 1, { sp: 0.05, max: 800, size: 9, col: PT.pick(['#ffe066', '#ffffff', '#fff6b0']), g: 0 }); }, () => { ch.z = 0; R.found('d4_angel'); R.claim(ch, 2200).say('みんなに しあわせを', 'heart', 1500, 'yay').pose('cheer', 900); W.after(1600, pairCheck); });
    });
    R.audience(ch.x, ch.y, [ch], 'wow', 2, 800);
  };
  R.ROLES.r4devil = (ch) => {
    const o = near(ch, 1, 1200)[0];
    const a = R.claim(ch, 6000).say('いたずら しちゃうぞ〜', ch.wear.hat === 'koakuma_horn' ? 'koakuma_horn' : 'koakumawings', 1400, 'laugh');
    if (o) a.to(o, o.x < ch.x ? 80 : -80, 4, true).look(o.x).pose('tickle', 1200).do(() => { A.sfx('tickle'); W.burst('spark', o.x, o.y - 120 * o.scale, 8, { sp: 0.15, col: '#c38be0', g: 0 }); R.claim(o, 2600).face('laugh', 1800).say('くすぐったーい！', null, 1400, 'laugh').pose('tickle', 1400); });
    else a.pose('tickle', 1000);
    a.say('えへへ', 'heart', 1100, 'laugh').do(() => { R.found('d4_devil'); W.after(800, pairCheck); });
  };
  R.ROLES.r4funny = (ch) => {
    R.claim(ch, 4000).say('じゃーん！', ch.wear.face || 'hanamegane', 1300, 'yay').pose('cheer', 700).sfx('boing').jump(40, 400).face('laugh', 1200).do(() => { W.burst('confetti', ch.x, ch.y - 160 * ch.scale, 14, { sp: 0.25, max: 1200 }); R.found('d4_funny'); });
    R.audience(ch.x, ch.y, [ch], 'laugh', 3, 700);
  };

  /* ---- おだい ---- */
  PT.ODAI2 = (PT.ODAI2 || []).concat([
    { id: 'ninja:d4', stage: 'ninja', text: 'にんじゃと さむらいに へんしん しよう', goals: ['d4_ninja', 'd4_samurai'], hint: ['ninjahood', 'kabuto'] },
    { id: 'fest:d4', stage: 'fest', text: 'わふくを きて おまつりを もりあげよう', goals: ['d4_kimono', 'd4_happi', 'd4_china'], hint: ['happi', 'kimono_red'] },
    { id: 'halloween:d4', stage: 'halloween', text: 'かそう パーティーを しよう', goals: ['d4_pumpkin', 'd4_angel', 'd4_devil', 'd4_angeldevil'], hint: ['pumpkinsuit', 'halo'] },
  ]);
  (PT.ROYAL_ODAI || []).push(['ヒーローに へんしん！ 5にん そろえて ごうたい', ['d4_sentai', 'd4_sentai5', 'd4_hero', 'd4_mecha', 'd4_mahou'], ['sentai_red', 'heromantle']]);
  (PT.ROYAL_ODAI || []).push(['ゆめかわ パーティーで あそぼう', ['d4_yume', 'd4_pajama', 'd4_kachu', 'd4_funny'], ['yumedress', 'kachu_usa']]);
})();
