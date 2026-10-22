/* おしごと・どうぶつ きぐるみ・スポーツの いしょう */
'use strict';
(() => {
  const G = PT.G, EXT = PT.WEAR_EXT;
  const T = (t) => t || 0;
  const BBX = (x0, y0, x1, y1) => { G._bb = { x0, y0, x1, y1 }; };
  const line = (c, col, lw, pts) => { c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); };
  const dot = (c, x, y, r, col) => { G.circ(c, x, y, r); c.fillStyle = col; c.fill(); };
  const yuubin = (c, x, y, s, col) => line(c, col, 2.6 * s, [x - 6 * s, y - 5 * s, x + 6 * s, y - 5 * s]) || line(c, col, 2.6 * s, [x - 6 * s, y - 1 * s, x + 6 * s, y - 1 * s, x, y - 1 * s, x, y + 7 * s]);
  const paw = (c, x, y, s, col) => { G.ell(c, x, y + 2 * s, 5 * s, 4 * s); c.fillStyle = col; c.fill(); for (const [dx, dy] of [[-5, -4], [0, -6.5], [5, -4]]) { G.circ(c, x + dx * s, y + dy * s, 2 * s); c.fill(); } };

  /* ================= ぼうし（おしごと） ================= */
  const cap = (crown, band, visor, emblem, o = {}) => (c, ch, t) => {
    t = T(t);
    if (o.flat) { c.beginPath(); c.moveTo(-40, -160); c.lineTo(-54, -190); c.quadraticCurveTo(0, -208, 54, -190); c.lineTo(40, -160); c.closePath(); BBX(-54, -204, 54, -160); }
    else if (o.cyl) { G.rr(c, -38, -198, 76, 42, 12); }
    else { c.beginPath(); c.moveTo(-42, -158); c.quadraticCurveTo(-50, -200, 0, -202); c.quadraticCurveTo(50, -200, 42, -158); c.closePath(); BBX(-46, -202, 46, -158); }
    G.fillO(c, crown, 3);
    G.rr(c, -42, -172, 84, 15, 5); G.fillO(c, band, 2.5);
    c.beginPath(); c.moveTo(-36, -159); c.quadraticCurveTo(0, -136, 36, -159); c.quadraticCurveTo(0, -151, -36, -159); c.closePath(); G._bb = null; G.fillO(c, visor, 2.5);
    if (o.braid) line(c, o.braid, 2.5, [-26, -155, -10, -149, 10, -149, 26, -155]);
    if (emblem) emblem(c, t);
  };
  EXT.hat.patrolcap = cap('#ffffff', '#26304d', '#1d2236', (c, t) => {
    G.circ(c, 0, -184, 10); G.fillO(c, '#ffcf3f', 2.5); c.fillStyle = '#ffffff'; G.star(c, 0, -184, 6, 2.6); c.fill();
    c.strokeStyle = '#ffcf3f'; c.lineWidth = 2; c.beginPath(); c.moveTo(-40, -166); c.lineTo(40, -166); c.stroke();
    if (((t / 500) | 0) % 4 === 0) { c.fillStyle = '#ffffff'; G.star(c, 8, -192, 4, 1.6); c.fill(); }
  }, { flat: true });
  EXT.hat.pilotcap = cap('#24305e', '#1a2244', '#14182c', (c) => {
    for (const s of [-1, 1]) { G.ell(c, s * 13, -186, 12, 4.5, s * -0.25); G.fillO(c, '#ffcf3f', 2); }
    G.circ(c, 0, -186, 6); G.fillO(c, '#ffcf3f', 2); c.fillStyle = '#24305e'; G.star(c, 0, -186, 3.5, 1.5); c.fill();
  }, { flat: true, braid: '#ffcf3f' });
  EXT.hat.conductorcap = cap('#33406b', '#ffcf3f', '#1d2236', (c, t) => {
    G.circ(c, 0, -184, 9); G.fillO(c, '#e2434b', 2.5);
    c.strokeStyle = '#ffffff'; c.lineWidth = 2; const a0 = t * 0.004; for (let i = 0; i < 4; i++) { const a = a0 + (i * Math.PI) / 4; c.beginPath(); c.moveTo(Math.cos(a) * 6, -184 + Math.sin(a) * 6); c.lineTo(-Math.cos(a) * 6, -184 - Math.sin(a) * 6); c.stroke(); }
  }, { cyl: true });
  EXT.hat.mailcap = cap('#3a6fc4', '#2a4f94', '#1d2a4d', (c) => { G.circ(c, 0, -185, 10); G.fillO(c, '#ffffff', 2.5); yuubin(c, 0, -186, 0.9, '#e2434b'); });
  EXT.hat.builderhat = (c) => {
    G.rr(c, -56, -158, 112, 11, 5); G.fillO(c, '#ffd23f', 2.5);
    c.beginPath(); c.moveTo(-44, -152); c.quadraticCurveTo(-46, -208, 0, -210); c.quadraticCurveTo(46, -208, 44, -152); c.closePath(); BBX(-46, -210, 46, -152); G.fillO(c, '#ffd23f', 3);
    c.strokeStyle = '#e0b020'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, -208); c.lineTo(0, -156); c.stroke();
    G.circ(c, -24, -178, 10); G.fillO(c, '#ffffff', 2); c.fillStyle = '#4fae5a'; c.fillRect(-27, -186, 6, 16); c.fillRect(-32, -181, 16, 6);
  };
  EXT.hat.bakerbandana = (c, ch, t) => {
    const sw = Math.sin(T(t) * 0.006) * 3;
    for (const s of [0, 1]) { G.ell(c, 48 + s * 8, -142 + s * 10 + sw * s, 9, 6, 0.6 + s * 0.4); G.fillO(c, '#ffc4dc', 2); }
    c.beginPath(); c.moveTo(-50, -136); c.quadraticCurveTo(-48, -180, 0, -180); c.quadraticCurveTo(48, -180, 50, -136); c.quadraticCurveTo(0, -154, -50, -136); c.closePath(); BBX(-50, -180, 50, -136); G.fillO(c, '#ffc4dc', 3);
    c.fillStyle = '#ffffff'; for (const [x, y] of [[-30, -156], [-10, -168], [12, -160], [30, -152], [-2, -150], [22, -172], [-24, -146]]) { G.circ(c, x, y, 3); c.fill(); }
    G.ell(c, 0, -166, 12, 7); G.fillO(c, '#e0a45a', 2); line(c, '#b07434', 1.6, [-5, -170, -3, -162]); line(c, '#b07434', 1.6, [1, -171, 3, -163]);
  };
  EXT.hat.farmhat = (c, ch, t) => {
    G.ell(c, 0, -150, 74, 16); G.fillO(c, '#f3d27a', 3);
    c.beginPath(); c.moveTo(-36, -152); c.quadraticCurveTo(-38, -196, 0, -198); c.quadraticCurveTo(38, -196, 36, -152); c.closePath(); BBX(-38, -198, 38, -152); G.fillO(c, '#f3d27a', 3);
    c.strokeStyle = 'rgba(190,140,50,.55)'; c.lineWidth = 1.5; for (const r of [52, 62]) { c.beginPath(); c.ellipse(0, -150, r, r * 0.21, 0, 0.1, Math.PI - 0.1); c.stroke(); }
    G.rr(c, -37, -168, 74, 11, 3); G.fillO(c, '#e2434b', 2);
    c.save(); c.translate(26, -164); c.rotate(Math.sin(T(t) * 0.004) * 0.2); for (let i = 0; i < 8; i++) { const a = (i / 8) * PT.TAU; G.ell(c, Math.cos(a) * 8, Math.sin(a) * 8, 5, 3, a); c.fillStyle = '#ffd23f'; c.fill(); } G.circ(c, 0, 0, 5); c.fillStyle = '#8a5a2b'; c.fill(); c.restore();
  };
  EXT.hat.astrohelmet = (c, ch, t) => {
    t = T(t);
    line(c, '#9fb3c8', 3, [30, -176, 40, -204]); dot(c, 40, -206, 6, ((t / 400) | 0) % 2 ? '#ff5d78' : '#ffd23f');
    c.beginPath(); c.arc(0, -122, 68, 0, PT.TAU); c.ellipse(0, -116, 47, 42, 0, 0, PT.TAU, true); c.fillStyle = '#f4f6fb'; c.fill();
    c.strokeStyle = '#9fb3c8'; c.lineWidth = 3; c.stroke();
    G.ell(c, 0, -116, 47, 42); c.fillStyle = 'rgba(255,200,120,.14)'; c.fill(); c.strokeStyle = '#ffb04a'; c.lineWidth = 4; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 4; c.beginPath(); c.arc(0, -116, 38, -2.6, -2.1); c.stroke();
    G.rr(c, -12, -190, 24, 8, 3); c.fillStyle = '#4c8ce0'; c.fill(); c.fillStyle = '#ffffff'; G.star(c, 0, -186, 3, 1.3); c.fill();
    G.rr(c, -44, -64, 88, 12, 6); G.fillO(c, '#cfd8e6', 2.5);
  };
  EXT.hat.cabincap = (c) => {
    c.save(); c.translate(16, -160); c.rotate(0.14);
    G.rr(c, -28, -22, 56, 24, 8); G.fillO(c, '#2a3a6e', 3);
    G.rr(c, -28, -6, 56, 6, 3); c.fillStyle = '#ffcf3f'; c.fill();
    for (const s of [-1, 1]) { G.ell(c, s * 7, -14, 7, 3, s * -0.2); c.fillStyle = '#ffcf3f'; c.fill(); } dot(c, 0, -14, 3, '#ffcf3f');
    c.restore();
  };
  EXT.hat.keepercap = (c) => {
    G.ell(c, 0, -152, 62, 13); G.fillO(c, '#d9c38a', 3);
    c.beginPath(); c.moveTo(-38, -154); c.quadraticCurveTo(-38, -196, 0, -198); c.quadraticCurveTo(38, -196, 38, -154); c.closePath(); BBX(-38, -198, 38, -154); G.fillO(c, '#e2cf96', 3);
    G.rr(c, -38, -168, 76, 11, 3); G.fillO(c, '#5aa04a', 2);
    paw(c, 0, -184, 1.3, '#8a5a2b');
  };
  EXT.hat.idolheadset = (c, ch, t, lx = 0) => {
    t = T(t);
    c.strokeStyle = PT.line('#ff8fc8'); c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.arc(0, -120, 48, Math.PI * 1.06, Math.PI * 1.94); c.stroke();
    c.strokeStyle = '#ff8fc8'; c.lineWidth = 6; c.stroke();
    G.circ(c, -46, -116, 11); G.fillO(c, '#ff8fc8', 2.5);
    c.strokeStyle = '#3a3550'; c.lineWidth = 3; c.beginPath(); c.moveTo(-44, -108); c.quadraticCurveTo(-40, -94, -24 + lx, -96); c.stroke();
    dot(c, -22 + lx, -96, 5, '#3a3550');
    const k = 1 + Math.sin(t * 0.008) * 0.12; c.save(); c.translate(30, -160); c.scale(k, k); G.star(c, 0, 0, 13, 6); G.fillO(c, '#ffd23f', 2.5); c.restore();
    if (((t / 350) | 0) % 3 === 0) { c.fillStyle = '#ffffff'; G.star(c, 44, -176, 5, 2); c.fill(); G.star(c, -30, -172, 4, 1.6); c.fill(); }
  };
  /* ================= ぼうし（スポーツ） ================= */
  EXT.hat.soccerband = (c) => {
    c.lineCap = 'butt';
    for (const [col, lw] of [[PT.line('#ffffff'), 16], ['#ffffff', 11], ['#58b9f0', 4]]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.ellipse(0, -108, 50, 44, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    c.lineCap = 'round';
  };
  EXT.hat.baseballcap = (c) => {
    c.beginPath(); c.moveTo(-44, -150); c.quadraticCurveTo(-46, -202, 0, -202); c.quadraticCurveTo(46, -202, 44, -150); c.closePath(); BBX(-46, -202, 46, -150); G.fillO(c, '#e2434b', 3);
    line(c, 'rgba(255,255,255,.6)', 2, [0, -200, 0, -152]);
    dot(c, 0, -202, 5, '#c0303a');
    c.beginPath(); c.moveTo(-40, -152); c.quadraticCurveTo(0, -128, 40, -152); c.quadraticCurveTo(0, -146, -40, -152); c.closePath(); G._bb = null; G.fillO(c, '#c0303a', 2.5);
    G.circ(c, 0, -176, 11); G.fillO(c, '#ffffff', 2); c.fillStyle = '#e2434b'; G.star(c, 0, -176, 7, 3); c.fill();
  };
  EXT.hat.swimcap = (c) => {
    c.beginPath(); c.moveTo(-50, -126); c.bezierCurveTo(-56, -180, 56, -180, 50, -126); c.quadraticCurveTo(0, -150, -50, -126); c.closePath(); BBX(-52, -168, 52, -126); G.fillO(c, '#3d8fe8', 3);
    line(c, 'rgba(255,255,255,.75)', 4, [-34, -150, -10, -160, 14, -160, 36, -150]);
    c.fillStyle = '#ffd23f'; G.star(c, 22, -146, 7, 3); c.fill();
  };
  EXT.hat.karateband = (c, ch, t) => {
    const fl = Math.sin(T(t) * 0.01) * 6;
    for (const s of [0, 1]) { c.beginPath(); c.moveTo(48, -142); c.quadraticCurveTo(62, -142 + s * 10 + fl * 0.5, 74, -134 + s * 16 + fl); c.lineTo(70, -128 + s * 16 + fl); c.quadraticCurveTo(58, -134 + s * 10, 46, -134); c.closePath(); BBX(46, -142, 74, -112); G.fillO(c, '#ffffff', 2); }
    c.lineCap = 'butt';
    for (const [col, lw] of [[PT.line('#ffffff'), 15], ['#ffffff', 10]]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.ellipse(0, -108, 50, 42, 0, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); }
    c.lineCap = 'round';
    dot(c, 0, -150, 6, '#e2434b');
  };
  EXT.hat.gymcap = (c) => {
    G.ell(c, 0, -148, 52, 10); G.fillO(c, '#ffffff', 2.5);
    c.beginPath(); c.moveTo(-46, -150); c.quadraticCurveTo(-48, -200, 0, -200); c.quadraticCurveTo(48, -200, 46, -150); c.closePath(); BBX(-48, -200, 48, -150); G.fillO(c, '#e2434b', 3);
    line(c, '#ffffff', 3, [-44, -156, -16, -160, 16, -160, 44, -156]);
    for (const x of [-22, 0, 22]) line(c, 'rgba(255,255,255,.45)', 2, [x * 0.4, -199, x, -158]);
  };
  /* ================= かお ================= */
  EXT.face.swimgoggles = (c, ch, t, lx = 0) => {
    line(c, '#2f6fd0', 6, [-48, -124, 48 + lx, -124]);
    for (const x of [-19, 19]) { G.ell(c, x + lx, -121, 16, 13); c.fillStyle = 'rgba(120,210,255,.45)'; c.fill(); c.strokeStyle = '#2f6fd0'; c.lineWidth = 4; c.stroke(); c.fillStyle = 'rgba(255,255,255,.7)'; G.ell(c, x + lx - 6, -126, 4, 2.5, -0.5); c.fill(); }
    line(c, '#2f6fd0', 4, [-4 + lx, -122, 4 + lx, -122]);
  };

  /* ================= ふく（おしごと） ================= */
  const coat = (c, col, lw = 3) => { c.beginPath(); c.moveTo(-28, -88); c.lineTo(28, -88); c.lineTo(33, -22); c.quadraticCurveTo(0, -15, -33, -22); c.closePath(); BBX(-33, -88, 33, -16); G.fillO(c, col, lw); };
  const clipCoat = (c, fn) => { c.save(); c.beginPath(); c.moveTo(-28, -88); c.lineTo(28, -88); c.lineTo(33, -22); c.quadraticCurveTo(0, -15, -33, -22); c.closePath(); c.clip(); fn(); c.restore(); };
  const vee = (c, col, d = 26) => { G.poly(c, [-14, -88, 0, -88 + d, 14, -88]); G._bb = null; G.fillO(c, col, 2); };
  const tie = (c, col) => { G.poly(c, [-4, -84, 4, -84, 6, -62, 0, -54, -6, -62]); G._bb = null; G.fillO(c, col, 2); };
  const btns = (c, xs, ys, col) => { for (const x of xs) for (const y of ys) dot(c, x, y, 2.8, col); };
  EXT.body.patrolsuit = (c) => {
    coat(c, '#9fc4f0');
    vee(c, '#ffffff', 22); tie(c, '#26304d');
    for (const s of [-1, 1]) { G.poly(c, [s * 4, -88, s * 18, -88, s * 12, -76]); G._bb = null; G.fillO(c, '#7fa9dd', 2); }
    G.rr(c, -33, -36, 66, 9, 3); G.fillO(c, '#26304d', 2); G.rr(c, -5, -37, 10, 11, 2); G.fillO(c, '#ffcf3f', 1.5);
    c.fillStyle = '#ffcf3f'; G.star(c, 17, -68, 7, 3); c.fill(); c.strokeStyle = '#c99a22'; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = '#ffcf3f'; c.lineWidth = 2; c.beginPath(); c.moveTo(-12, -86); c.quadraticCurveTo(-24, -74, -20, -60); c.stroke();
    G.rr(c, -26, -62, 12, 7, 3); G.fillO(c, '#d9e2ee', 1.5);
  };
  EXT.body.pilotsuit = (c) => {
    coat(c, '#24305e');
    vee(c, '#ffffff', 28); tie(c, '#14182c');
    line(c, '#3a4a80', 2, [-14, -88, -4, -58]); line(c, '#3a4a80', 2, [14, -88, 4, -58]);
    for (const s of [-1, 1]) { G.rr(c, s > 0 ? 14 : -32, -92, 18, 7, 2); G.fillO(c, '#14182c', 1.5); line(c, '#ffcf3f', 1.6, [s > 0 ? 16 : -30, -88.5, s > 0 ? 30 : -16, -88.5]); }
    btns(c, [-8, 8], [-50, -38], '#ffcf3f');
    for (const s of [-1, 1]) { G.ell(c, -16 + s * 6, -70, 6, 2.5, s * -0.2); c.fillStyle = '#ffcf3f'; c.fill(); } dot(c, -16, -70, 2.5, '#ffcf3f');
    line(c, '#ffcf3f', 2, [-31, -28, 31, -28]);
  };
  EXT.body.conductorsuit = (c) => {
    coat(c, '#33406b');
    G.rr(c, -12, -90, 24, 8, 3); G.fillO(c, '#33406b', 2);
    btns(c, [-9, 9], [-74, -60, -46, -32], '#ffcf3f');
    G.rr(c, 12, -72, 16, 10, 2); G.fillO(c, '#ffffff', 1.5); line(c, '#e2434b', 1.5, [15, -67, 25, -67]);
    c.strokeStyle = '#ffcf3f'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-26, -82); c.quadraticCurveTo(-28, -60, -18, -54); c.stroke();
    G.rr(c, -24, -56, 13, 7, 3); G.fillO(c, '#ffd23f', 1.5);
    line(c, '#e2434b', 4, [-31, -24, 31, -24]);
  };
  EXT.body.buildervest = (c) => {
    coat(c, '#5b8fe0');
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(s * 28, -88); c.lineTo(s * 11, -88); c.lineTo(s * 8, -24); c.lineTo(s * 33, -22); c.closePath(); BBX(-33, -88, 33, -22); G.fillO(c, '#ff8a3d', 2.5);
      for (const y of [-62, -46]) line(c, '#fff3a0', 4, [s * 10, y, s * 30, y + 1]);
    }
    G.rr(c, -34, -34, 68, 10, 4); G.fillO(c, '#8a5a2b', 2);
    G.rr(c, 22, -34, 5, 24, 2); G.fillO(c, '#c98b55', 1.5); G.rr(c, 15, -38, 20, 8, 2); G.fillO(c, '#9fb3c8', 1.5);
  };
  EXT.body.bakerapron = (c) => {
    coat(c, '#ffffff');
    line(c, '#c98b55', 3, [-14, -88, -16, -76]); line(c, '#c98b55', 3, [14, -88, 16, -76]);
    c.beginPath(); c.moveTo(-17, -78); c.lineTo(17, -78); c.lineTo(18, -56); c.lineTo(30, -52); c.lineTo(32, -20); c.quadraticCurveTo(0, -14, -32, -20); c.lineTo(-30, -52); c.lineTo(-18, -56); c.closePath(); BBX(-32, -78, 32, -16); G.fillO(c, '#c98b55', 3);
    G.rr(c, -12, -46, 24, 16, 4); G.fillO(c, '#e0a870', 2);
    G.ell(c, 0, -46, 10, 6); G.fillO(c, '#f0c27a', 1.5); line(c, '#b07434', 1.4, [-3, -50, -1, -43]); line(c, '#b07434', 1.4, [3, -50, 5, -43]);
    for (const x of [-20, 20]) dot(c, x, -66, 2.5, '#ffffff');
  };
  EXT.body.farmoveralls = (c) => {
    coat(c, '#e2434b');
    clipCoat(c, () => { c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; for (let x = -30; x <= 30; x += 10) { c.beginPath(); c.moveTo(x, -90); c.lineTo(x, -18); c.stroke(); } for (let y = -84; y <= -20; y += 10) { c.beginPath(); c.moveTo(-34, y); c.lineTo(34, y); c.stroke(); } });
    for (const s of [-1, 1]) line(c, '#3f6db0', 5, [s * 14, -60, s * 22, -88]);
    G.rr(c, -18, -66, 36, 26, 5); G.fillO(c, '#4c7cc8', 2.5);
    c.beginPath(); c.moveTo(-31, -44); c.lineTo(31, -44); c.lineTo(33, -22); c.quadraticCurveTo(0, -15, -33, -22); c.closePath(); BBX(-33, -44, 33, -16); G.fillO(c, '#4c7cc8', 2.5);
    G.rr(c, -8, -60, 16, 12, 3); c.strokeStyle = '#3f6db0'; c.lineWidth = 2; c.stroke();
    for (const s of [-1, 1]) dot(c, s * 13, -62, 3, '#ffd23f');
  };
  EXT.body.astrosuit = (c, ch, t) => {
    t = T(t);
    coat(c, '#f4f6fb');
    line(c, '#cfd8e6', 2.5, [0, -88, 0, -64]);
    G.rr(c, -17, -74, 34, 22, 5); G.fillO(c, '#9fb3c8', 2.5);
    ['#ff5d78', '#ffd23f', '#58c46b'].forEach((col, i) => { const on = ((t / 300) | 0) % 3 === i; dot(c, -9 + i * 9, -63, on ? 4.5 : 3.5, on ? col : PT.shade(col, -0.25)); });
    G.rr(c, -30, -86, 14, 10, 2); c.fillStyle = '#4c8ce0'; c.fill(); c.fillStyle = '#ffffff'; G.star(c, -23, -81, 3.5, 1.5); c.fill();
    G.rr(c, -33, -40, 66, 10, 4); G.fillO(c, '#cfd8e6', 2);
    G.rr(c, 14, -40, 12, 10, 2); G.fillO(c, '#ffb04a', 1.5);
  };
  EXT.body.cabinsuit = (c, ch, t) => {
    coat(c, '#2a3a6e');
    vee(c, '#ffffff', 22);
    const sw = Math.sin(T(t) * 0.005) * 2;
    G.blob(c, [0, -80, -16, -90, -20, -76]); G.fillO(c, '#e2434b', 2); G.blob(c, [0, -80, 16, -90, 20, -76]); G.fillO(c, '#e2434b', 2);
    c.beginPath(); c.moveTo(-2, -78); c.lineTo(-10 + sw, -60); c.lineTo(-2 + sw, -62); c.closePath(); BBX(-10, -78, 0, -60); G.fillO(c, '#ffd23f', 2);
    c.beginPath(); c.moveTo(2, -78); c.lineTo(8 - sw, -58); c.lineTo(14 - sw, -62); c.closePath(); BBX(2, -78, 14, -58); G.fillO(c, '#e2434b', 2);
    dot(c, 0, -80, 4.5, '#ffd23f');
    G.rr(c, 12, -70, 14, 7, 2); G.fillO(c, '#ffcf3f', 1.5);
    btns(c, [0], [-46, -34], '#ffcf3f');
  };
  EXT.body.mailsuit = (c) => {
    coat(c, '#7fb2ea');
    for (const s of [-1, 1]) { G.poly(c, [s * 4, -88, s * 20, -88, s * 12, -74]); G._bb = null; G.fillO(c, '#2a4f94', 2); }
    for (const s of [-1, 1]) { G.rr(c, s > 0 ? 8 : -26, -64, 18, 14, 3); G.fillO(c, '#7fb2ea', 2); G.rr(c, s > 0 ? 8 : -26, -64, 18, 5, 2); c.fillStyle = '#2a4f94'; c.fill(); }
    G.circ(c, -17, -44, 8); G.fillO(c, '#ffffff', 2); yuubin(c, -17, -45, 0.7, '#e2434b');
    line(c, '#e2434b', 4, [-31, -26, 31, -26]);
  };
  EXT.body.keepersuit = (c) => {
    coat(c, '#6aa85a');
    G.rr(c, -10, -90, 20, 8, 3); G.fillO(c, '#5a9a4a', 2);
    btns(c, [0], [-74, -62, -50], '#e2cf96');
    c.save(); c.translate(19, -64); c.rotate(-0.4); c.beginPath(); c.moveTo(-3, 0); c.quadraticCurveTo(-2, -16, 8, -20); c.quadraticCurveTo(4, -10, 4, 0); c.closePath(); BBX(-3, -20, 8, 0); G.fillO(c, '#ffe066', 1.8); c.restore();
    G.rr(c, 10, -64, 18, 16, 3); G.fillO(c, '#5a9a4a', 2);
    G.circ(c, -16, -50, 9); G.fillO(c, '#f3e7c4', 2); paw(c, -16, -50, 0.9, '#8a5a2b');
    G.rr(c, -33, -34, 66, 8, 3); G.fillO(c, '#8a5a2b', 2);
  };
  EXT.body.idoldress = (c, ch, t) => {
    t = T(t);
    const sw = Math.sin(t * 0.006) * 3;
    for (let k = 0; k < 2; k++) {
      c.beginPath(); c.moveTo(-22, -60 + k * 4); c.bezierCurveTo(-40 - k * 4 + sw, -40, -48 - k * 2 + sw, -26, -46 + sw, -14 + k * 4);
      for (let i = 0; i < 6; i++) { const x0 = -46 + sw + i * 15.3; c.quadraticCurveTo(x0 + 7.6, -4 + k * 4, x0 + 15.3, -14 + k * 4); }
      c.bezierCurveTo(48 + sw, -26, 40 + sw, -40, 22, -60 + k * 4); c.closePath(); BBX(-48, -60, 48, -4); G.fillO(c, k ? '#ff8fc8' : '#ffffff', 2.5);
    }
    G.rr(c, -22, -88, 44, 32, 8); G.fillO(c, '#ff8fc8', 3);
    G.rr(c, -24, -62, 48, 8, 4); G.fillO(c, '#ffd23f', 2);
    for (const s of [-1, 1]) { G.blob(c, [0, -80, s * 16, -92, s * 18, -72]); G.fillO(c, '#ff5d9e', 2); }
    dot(c, 0, -80, 5, '#ffd23f');
    for (const [x, y, ph] of [[-30, -26, 0], [26, -30, 2], [-6, -20, 4], [12, -40, 1]]) { const a = 0.5 + 0.5 * Math.sin(t * 0.008 + ph); c.fillStyle = `rgba(255,236,140,${0.4 + a * 0.6})`; G.star(c, x + sw * 0.5, y, 4 + a * 2, 1.8); c.fill(); }
  };
  /* ================= ふく（スポーツ） ================= */
  const num = (c, txt, x, y, col, size = 18) => { c.font = `900 ${size}px ${PT.FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 4; c.strokeStyle = PT.line(col); c.strokeText(txt, x, y); c.fillStyle = col; c.fillText(txt, x, y); };
  EXT.body.soccerkit = (c) => {
    coat(c, '#58b9f0');
    clipCoat(c, () => { c.fillStyle = '#ffffff'; for (const x of [-22, 2]) c.fillRect(x, -90, 12, 80); });
    G.poly(c, [-12, -88, 0, -74, 12, -88]); G._bb = null; G.fillO(c, '#ffffff', 2);
    num(c, '10', 0, -52, '#ffd23f', 20);
    c.beginPath(); c.moveTo(-32, -34); c.lineTo(32, -34); c.lineTo(33, -22); c.quadraticCurveTo(0, -15, -33, -22); c.closePath(); BBX(-33, -34, 33, -16); G.fillO(c, '#2f4a8a', 2.5);
  };
  EXT.body.baseballkit = (c) => {
    coat(c, '#ffffff');
    clipCoat(c, () => { c.strokeStyle = 'rgba(47,74,138,.35)'; c.lineWidth = 1.5; for (let x = -30; x <= 30; x += 8) { c.beginPath(); c.moveTo(x, -90); c.lineTo(x, -16); c.stroke(); } });
    line(c, '#e2434b', 3, [0, -88, 0, -38]); btns(c, [5], [-78, -66, -54], '#e2434b');
    line(c, '#e2434b', 3, [-28, -87, -14, -88]); line(c, '#e2434b', 3, [14, -88, 28, -87]);
    num(c, '7', -16, -64, '#e2434b', 18);
    G.rr(c, -33, -38, 66, 8, 3); G.fillO(c, '#2f4a8a', 2);
  };
  EXT.body.swimkit = (c) => {
    c.beginPath(); c.moveTo(-26, -88); c.lineTo(-16, -88); c.quadraticCurveTo(0, -74, 16, -88); c.lineTo(26, -88); c.lineTo(31, -36); c.lineTo(12, -22); c.quadraticCurveTo(0, -26, -12, -22); c.lineTo(-31, -36); c.closePath(); BBX(-31, -88, 31, -22); G.fillO(c, '#2f8fe0', 3);
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 3; for (const y of [-58, -44]) { c.beginPath(); c.moveTo(-28, y); for (let i = 0; i < 4; i++) c.quadraticCurveTo(-21 + i * 14, y - 6, -14 + i * 14, y); c.stroke(); }
    c.fillStyle = '#ffd23f'; G.star(c, 14, -72, 6, 2.6); c.fill();
  };
  EXT.body.karategi = (c) => {
    coat(c, '#ffffff');
    line(c, '#c9d8e6', 3, [-24, -88, 10, -48]); line(c, '#c9d8e6', 3, [24, -88, -2, -60]);
    G.rr(c, -34, -48, 68, 10, 3); G.fillO(c, '#2a2a3a', 2);
    for (const s of [-1, 1]) { c.save(); c.translate(4, -42); c.rotate(s * 0.25); G.rr(c, -3, 2, 7, 20, 2); G.fillO(c, '#2a2a3a', 1.5); c.restore(); }
    G.rr(c, -1, -48, 10, 12, 3); G.fillO(c, '#2a2a3a', 1.5);
  };
  EXT.body.gymshirt = (c) => {
    coat(c, '#ffffff');
    c.strokeStyle = '#2f4a8a'; c.lineWidth = 4; c.beginPath(); c.moveTo(-14, -87); c.quadraticCurveTo(0, -76, 14, -87); c.stroke();
    G.rr(c, 6, -72, 22, 14, 3); G.fillO(c, '#ffffff', 2); line(c, '#e2434b', 2, [9, -68, 25, -68]); line(c, '#9fb3c8', 1.5, [9, -62, 22, -62]);
    c.beginPath(); c.moveTo(-32, -38); c.lineTo(32, -38); c.lineTo(33, -22); c.quadraticCurveTo(0, -15, -33, -22); c.closePath(); BBX(-33, -38, 33, -16); G.fillO(c, '#2f4a8a', 2.5);
    line(c, '#ffffff', 2, [-31, -32, -20, -32]);
  };

  /* ================= せなか ================= */
  EXT.back.jetpack = (c, ch, t) => {
    t = T(t); ch = ch || {};
    const on = ch.pose === 'fly' || ch.pose === 'jump' || (ch.z || 0) > 20;
    for (const x of [-46, -26]) {
      if (on) { const f = 14 + Math.sin(t * 0.05 + x) * 6; c.beginPath(); c.moveTo(x - 6, -36); c.quadraticCurveTo(x, -36 + f * 2, x + 6, -36); c.closePath(); c.fillStyle = 'rgba(255,170,60,.9)'; c.fill(); }
      G.rr(c, x - 9, -92, 18, 58, 8); G.fillO(c, '#cfd8e6', 2.5);
      G.rr(c, x - 6, -40, 12, 6, 2); c.fillStyle = '#7a8aa0'; c.fill();
    }
    G.rr(c, -50, -76, 34, 8, 3); c.fillStyle = '#ff8a3d'; c.fill();
  };
  EXT.back.mailbag = (c) => {
    line(c, '#7a4a22', 6, [-34, -76, 22, -90]);
    G.rr(c, -58, -76, 42, 38, 8); G.fillO(c, '#a8733f', 3);
    G.rr(c, -50, -86, 26, 16, 2); G.fillO(c, '#ffffff', 2); line(c, '#e2434b', 1.5, [-50, -86, -37, -78, -24, -86]);
    G.rr(c, -58, -76, 42, 16, 6); G.fillO(c, '#8a5a2b', 2.5);
    yuubin(c, -37, -55, 0.8, '#ffd23f');
  };
  /* しっぽ */
  const wagOf = (t, sp = 0.006, a = 0.25) => Math.sin(T(t) * sp) * a;
  const stroke2 = (c, col, w) => { c.strokeStyle = PT.line(col); c.lineWidth = w + 5; c.lineCap = 'round'; c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke(); };
  EXT.back.cattail = (c, ch, t) => { c.save(); c.translate(-24, -36); c.rotate(-0.3 + wagOf(t, 0.005, 0.3)); c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-34, -4, -48, -30, -34, -62); stroke2(c, '#ffb35c', 11); dot(c, -34, -62, 6, '#c96a2a'); c.restore(); };
  EXT.back.dogtail = (c, ch, t) => { c.save(); c.translate(-24, -44); c.rotate(wagOf(t, 0.02, 0.35)); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-24, -2, -22, -30); stroke2(c, '#c98b55', 13); G.circ(c, -22, -32, 8); G.fillO(c, '#fff3e0', 2); c.restore(); };
  EXT.back.bunnytail = (c, ch, t) => { const b = Math.sin(T(t) * 0.01) * 1.5; G.circ(c, -32, -36 + b, 15); G.fillO(c, '#ffffff', 3); c.fillStyle = '#fff0f6'; for (const [x, y] of [[-38, -42], [-28, -30], [-36, -30]]) { G.circ(c, x, y + b, 5); c.fill(); } };
  EXT.back.beartail = (c) => { G.circ(c, -30, -36, 12); G.fillO(c, '#9a6a43', 3); };
  EXT.back.liontail = (c, ch, t) => { c.save(); c.translate(-24, -34); c.rotate(-0.2 + wagOf(t, 0.004, 0.3)); c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-30, 6, -46, -14, -44, -46); stroke2(c, '#ffc94a', 7); G.ell(c, -44, -52, 9, 12, 0.2); G.fillO(c, '#e08a2e', 2.5); c.restore(); };
  EXT.back.dinotail = (c, ch, t) => {
    const w = wagOf(t, 0.004, 4) * 1;
    c.beginPath(); c.moveTo(-14, -66); c.quadraticCurveTo(-56, -50, -86, -12 + w); c.quadraticCurveTo(-50, -18, -14, -22); c.closePath(); BBX(-86, -66, -14, -12); G.fillO(c, '#7bc96f', 3);
    for (let i = 0; i < 4; i++) { const k = 0.2 + i * 0.2; const x = -14 - 72 * k, y = -66 + 54 * k + w * k; G.poly(c, [x - 7, y + 3, x - 2, y - 12, x + 6, y - 2]); G.fillO(c, '#ffb04a', 2); }
  };

  /* ================= どうぶつの フード・きぐるみ ================= */
  const eyes = (c, y = -161, col = '#2a1f35') => { for (const s of [-1, 1]) { dot(c, s * 13, y, 3.6, col); dot(c, s * 13 - 1, y - 1.3, 1.2, '#ffffff'); } };
  const hood = (col, o = {}) => (c, ch, t) => {
    t = T(t);
    if (o.behind) o.behind(c, t);
    c.beginPath(); c.moveTo(-50, -98); c.bezierCurveTo(-64, -144, -48, -177, 0, -178); c.bezierCurveTo(48, -177, 64, -144, 50, -98);
    c.quadraticCurveTo(48, -128, 30, -141); c.quadraticCurveTo(0, -156, -30, -141); c.quadraticCurveTo(-48, -128, -50, -98); c.closePath();
    BBX(-58, -178, 58, -98); G.fillO(c, col, 3);
    c.strokeStyle = o.trim || PT.shade(col, 0.35); c.lineWidth = 4; c.beginPath(); c.moveTo(-47, -102); c.quadraticCurveTo(-46, -127, -30, -138); c.quadraticCurveTo(0, -152, 30, -138); c.quadraticCurveTo(46, -127, 47, -102); c.stroke();
    if (o.front) o.front(c, t); else eyes(c);
  };
  const earsTri = (col, inner) => (c) => { for (const s of [-1, 1]) { G.poly(c, [s * 14, -170, s * 40, -204, s * 50, -156]); G.fillO(c, col, 3); G.poly(c, [s * 22, -168, s * 38, -192, s * 44, -162]); c.fillStyle = inner; c.fill(); } };
  const earsRound = (col, inner, r = 14, x = 36, y = -168) => (c) => { for (const s of [-1, 1]) { G.circ(c, s * x, y, r); G.fillO(c, col, 3); G.circ(c, s * x, y, r * 0.55); c.fillStyle = inner; c.fill(); } };
  const nose = (c, col = '#5a3a2a', y = -153) => { G.ell(c, 0, y, 4.5, 3.2); c.fillStyle = col; c.fill(); };
  EXT.hat.kigucat = hood('#ffb35c', { behind: earsTri('#ffb35c', '#ffc4d6'), front: (c) => { eyes(c); G.poly(c, [-3.5, -155, 3.5, -155, 0, -151]); c.fillStyle = '#ff7a9a'; c.fill(); for (const s of [-1, 1]) { line(c, '#c96a2a', 3, [s * 30, -170, s * 22, -166]); line(c, '#c96a2a', 3, [s * 36, -160, s * 26, -158]); } } });
  EXT.hat.kigudog = hood('#c98b55', { front: (c, t) => { eyes(c); G.ell(c, 0, -153, 10, 6); c.fillStyle = '#f3dcbf'; c.fill(); nose(c, '#3a2a2a', -155); const sw = Math.sin(t * 0.008) * 0.12; for (const s of [-1, 1]) { G.ell(c, s * 54, -136, 13, 27, s * (-0.25 + sw)); G.fillO(c, '#8a5a2b', 3); } } });
  EXT.hat.kigubunny = hood('#ffffff', { trim: '#ffd1e0', behind: (c, t) => { const w = Math.sin(t * 0.004) * 0.08; for (const s of [-1, 1]) { c.save(); c.translate(s * 18, -172); c.rotate(s * (0.12 + w)); G.ell(c, 0, -30, 12, 34); G.fillO(c, '#ffffff', 3); G.ell(c, 0, -28, 6, 25); c.fillStyle = '#ffc4d6'; c.fill(); c.restore(); } }, front: (c) => { eyes(c); G.poly(c, [-3.5, -155, 3.5, -155, 0, -151]); c.fillStyle = '#ff7a9a'; c.fill(); } });
  EXT.hat.kigubear = hood('#9a6a43', { behind: earsRound('#9a6a43', '#d8b48a'), front: (c) => { eyes(c); G.ell(c, 0, -153, 10, 6); c.fillStyle = '#d8b48a'; c.fill(); nose(c, '#3a2a2a', -155); } });
  EXT.hat.kigupanda = hood('#ffffff', { trim: '#e8e8f0', behind: earsRound('#2f2f3f', '#4a4a5a'), front: (c) => { for (const s of [-1, 1]) { G.ell(c, s * 13, -161, 7, 8.5, s * -0.5); c.fillStyle = '#2f2f3f'; c.fill(); dot(c, s * 13, -162, 2.5, '#ffffff'); } nose(c, '#2f2f3f', -153); } });
  EXT.hat.kigulion = hood('#ffc94a', { trim: '#ffe7a8', behind: (c, t) => { c.save(); c.translate(0, -130); c.rotate(Math.sin(t * 0.003) * 0.05); G.star(c, 0, 0, 72, 58, 14); c.ellipse(0, 16, 47, 36, 0, 0, PT.TAU, true); c.fillStyle = '#e08a2e'; c.fill('evenodd'); c.strokeStyle = PT.line('#e08a2e'); c.lineWidth = 3; c.stroke(); c.restore(); earsRound('#ffc94a', '#e08a2e', 11, 32, -172)(c); }, front: (c) => { eyes(c); G.ell(c, 0, -153, 9, 5.5); c.fillStyle = '#fff3d0'; c.fill(); nose(c, '#8a4a2a', -155); } });
  EXT.hat.kigupenguin = hood('#3a3f5c', { trim: '#ffffff', front: (c) => { eyes(c, -162, '#ffffff'); for (const s of [-1, 1]) dot(c, s * 13, -162, 1.8, '#2a1f35'); G.poly(c, [-7, -156, 7, -156, 0, -147]); G.fillO(c, '#ffb04a', 2); } });
  EXT.hat.kiguchick = hood('#ffe066', { trim: '#fff3b0', behind: (c, t) => { const w = Math.sin(t * 0.006) * 0.15; for (const [a, l] of [[-0.4, 16], [0, 20], [0.4, 16]]) { c.save(); c.translate(0, -174); c.rotate(a + w); G.ell(c, 0, -l * 0.6, 5, l * 0.7); G.fillO(c, '#ffe066', 2.5); c.restore(); } }, front: (c) => { eyes(c); G.poly(c, [-7, -154, 0, -159, 7, -154, 0, -148]); G.fillO(c, '#ff9a3d', 2); for (const s of [-1, 1]) { G.ell(c, s * 24, -152, 5, 3); c.fillStyle = 'rgba(255,140,160,.5)'; c.fill(); } } });
  EXT.hat.kigudino = hood('#7bc96f', { trim: '#c8f0b8', behind: (c) => { for (let i = -2; i <= 2; i++) { const x = i * 17, y = -176 + Math.abs(i) * 6; G.poly(c, [x - 9, y + 6, x, y - 16 + Math.abs(i) * 2, x + 9, y + 6]); G.fillO(c, '#ffb04a', 2.5); } }, front: (c) => { eyes(c, -163); for (const s of [-1, 1]) dot(c, s * 5, -154, 1.8, '#3a7a4a'); for (const x of [-22, -11, 0, 11, 22]) { const y = -141 - 13 * (1 - (x / 32) * (x / 32)) + 3; G.poly(c, [x - 4.5, y - 1, x + 4.5, y - 1, x, y + 6]); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#c9d8e6'; c.lineWidth = 1; c.stroke(); } } });

  const suit = (col, belly, deco) => (c, ch, t) => {
    t = T(t);
    G.blob(c, [-34, -62, -28, -92, 0, -96, 28, -92, 34, -62, 34, -22, 0, -12, -34, -22]); G.fillO(c, col, 3);
    if (belly) { G.ell(c, 0, -50, 19, 24); c.fillStyle = belly; c.fill(); }
    if (deco) deco(c, t);
  };
  const clipSuit = (c, fn) => { c.save(); G.blob(c, [-34, -62, -28, -92, 0, -96, 28, -92, 34, -62, 34, -22, 0, -12, -34, -22]); c.clip(); fn(); c.restore(); };
  EXT.body.kigucatsuit = suit('#ffb35c', '#fff3e0', (c) => { for (const s of [-1, 1]) for (const y of [-74, -60, -46]) line(c, '#c96a2a', 3.5, [s * 33, y, s * 24, y + 2]); paw(c, 0, -48, 1.2, '#ffc4d6'); });
  EXT.body.kigudogsuit = suit('#c98b55', '#f3dcbf', (c) => { G.ell(c, 20, -76, 9, 7, 0.3); c.fillStyle = '#8a5a2b'; c.fill(); G.rr(c, -22, -92, 44, 8, 4); G.fillO(c, '#e2434b', 2); dot(c, 0, -84, 5, '#ffd23f'); });
  EXT.body.kigubunnysuit = suit('#ffffff', '#ffe4ee', (c) => { c.save(); c.translate(0, -48); c.rotate(0.5); G.poly(c, [-4, -10, 4, -10, 0, 12]); G.fillO(c, '#ff9a3d', 1.5); line(c, '#4fae5a', 2.5, [-2, -12, -4, -18]); line(c, '#4fae5a', 2.5, [2, -12, 4, -18]); c.restore(); });
  EXT.body.kigubearsuit = suit('#9a6a43', '#d8b48a', (c) => { G.heart(c, 0, -54, 9); c.fillStyle = '#ff8fab'; c.fill(); });
  EXT.body.kigupandasuit = suit('#ffffff', null, (c) => { clipSuit(c, () => { c.fillStyle = '#2f2f3f'; c.fillRect(-40, -100, 80, 24); c.fillRect(-40, -34, 80, 30); }); G.ell(c, 0, -54, 15, 16); c.fillStyle = '#f2f2f8'; c.fill(); line(c, '#6ab04c', 3, [-6, -46, 6, -62]); G.ell(c, 8, -60, 5, 2.5, -0.8); c.fillStyle = '#6ab04c'; c.fill(); });
  EXT.body.kigulionsuit = suit('#ffc94a', '#fff3d0', (c) => { for (const x of [-12, 0, 12]) { G.circ(c, x, -90, 7); c.fillStyle = '#e08a2e'; c.fill(); } });
  EXT.body.kigupenguinsuit = suit('#3a3f5c', null, (c) => { G.ell(c, 0, -52, 23, 32); c.fillStyle = '#ffffff'; c.fill(); G.poly(c, [0, -84, -12, -90, -12, -78]); G.fillO(c, '#e2434b', 2); G.poly(c, [0, -84, 12, -90, 12, -78]); G.fillO(c, '#e2434b', 2); dot(c, 0, -84, 3.5, '#b8303a'); });
  EXT.body.kiguchicksuit = suit('#ffe066', '#fff3b0', (c) => {
    c.beginPath(); c.moveTo(-36, -40); for (let i = 0; i < 8; i++) c.lineTo(-36 + (i + 0.5) * 9, i % 2 ? -40 : -50); c.lineTo(36, -40); c.lineTo(34, -22); c.quadraticCurveTo(0, -8, -34, -22); c.closePath(); BBX(-36, -50, 36, -12); G.fillO(c, '#ffffff', 2.5);
    c.fillStyle = 'rgba(200,190,170,.5)'; for (const [x, y] of [[-20, -28], [14, -24], [0, -34]]) { G.circ(c, x, y, 2.5); c.fill(); }
  });
  EXT.body.kigufrogsuit = suit('#6cc06a', '#e8f5b0', (c) => { for (const [x, y, r] of [[-22, -76, 5], [24, -64, 4], [-26, -40, 4]]) { G.circ(c, x, y, r); c.fillStyle = '#4fa04d'; c.fill(); } });
  EXT.body.kigudinosuit = suit('#7bc96f', '#e8f5b0', (c) => { c.strokeStyle = 'rgba(160,200,90,.8)'; c.lineWidth = 2; for (const y of [-64, -54, -44, -34]) { c.beginPath(); c.moveTo(-16, y); c.lineTo(16, y); c.stroke(); } for (const [x, y] of [[-26, -78], [24, -72], [-27, -36]]) { G.circ(c, x, y, 4.5); c.fillStyle = '#4fa04d'; c.fill(); } });

  /* ================= アイテム ================= */
  const def = (id, o) => { PT.ITEMS[id] = Object.assign({ id, tags: ['dress'], w: 90, h: 90 }, o); };
  const WR = (id, name, slot, role, tags, w, h, off, offX = 0) => def(id, { name, cat: 'dress', tags: ['dress', slot === 'hat' ? 'hat' : slot].concat(tags), w, h, wear: [slot, id], role,
    draw: (c, t) => { c.save(); c.translate(offX, off); if (slot === 'body') EXT.body[id](c, { wear: {}, pose: 'idle' }, t || 0); else if (slot === 'face') EXT.face[id](c, {}, t || 0, 0); else if (slot === 'back') EXT.back[id](c, { pose: 'idle' }, t || 0); else EXT.hat[id](c, {}, t || 0); c.restore(); } });
  const J = ['job'], AN = ['animal', 'kigurumi'], SP = ['sports'];
  WR('patrolcap', 'しろい おまわりさんの ぼうし', 'hat', 'r3police', J, 110, 60, 140);
  WR('patrolsuit', 'おまわりさんの せいふく', 'body', 'r3police', J, 80, 80, 18);
  WR('pilotcap', 'パイロットの ぼうし', 'hat', 'r3pilot', J, 110, 70, 140);
  WR('pilotsuit', 'パイロットの せいふく', 'body', 'r3pilot', J, 80, 80, 18);
  WR('conductorcap', 'しゃしょうさんの ぼうし', 'hat', 'r3conductor', J, 90, 70, 140);
  WR('conductorsuit', 'しゃしょうさんの せいふく', 'body', 'r3conductor', J, 80, 80, 18);
  WR('builderhat', 'こうじの ヘルメット', 'hat', 'r3builder', J, 110, 70, 150);
  WR('buildervest', 'だいくさんの ベスト', 'body', 'r3builder', J, 80, 80, 18);
  WR('bakerbandana', 'パンやさんの さんかくきん', 'hat', 'r3baker', J, 110, 50, 136);
  WR('bakerapron', 'パンやさんの エプロン', 'body', 'r3baker', J, 80, 80, 18);
  WR('farmhat', 'むぎわらぼうし', 'hat', 'r3farmer', J, 140, 60, 136);
  WR('farmoveralls', 'のうかさんの オーバーオール', 'body', 'r3farmer', J, 80, 80, 18);
  WR('astrohelmet', 'うちゅうひこうしの ヘルメット', 'hat', 'r3astro', J, 120, 150, 54);
  WR('astrosuit', 'うちゅうふく', 'body', 'r3astro', J, 80, 80, 18);
  WR('jetpack', 'ジェットパック', 'back', 'r3astro', J, 60, 70, 34, 36);
  WR('cabincap', 'キャビンアテンダントの ぼうし', 'hat', 'r3cabin', J, 70, 40, 142, -16);
  WR('cabinsuit', 'キャビンアテンダントの せいふく', 'body', 'r3cabin', J, 80, 80, 18);
  WR('mailcap', 'ゆうびんやさんの ぼうし', 'hat', 'r3mail', J, 110, 70, 140);
  WR('mailsuit', 'ゆうびんやさんの ふく', 'body', 'r3mail', J, 80, 80, 18);
  WR('mailbag', 'ゆうびんかばん', 'back', 'r3mail', J, 60, 60, 38, 36);
  WR('keepercap', 'しいくいんさんの ぼうし', 'hat', 'r3keeper', J, 120, 60, 142);
  WR('keepersuit', 'しいくいんさんの ふく', 'body', 'r3keeper', J, 80, 80, 18);
  WR('idolheadset', 'アイドルの ヘッドセット', 'hat', 'r3idol', J.concat(['music']), 110, 90, 92);
  WR('idoldress', 'アイドルの ドレス', 'body', 'r3idol', J.concat(['music']), 100, 90, 4);
  WR('soccerband', 'サッカーの ヘアバンド', 'hat', 'r3soccer', SP, 100, 40, 126);
  WR('soccerkit', 'サッカーの ユニフォーム', 'body', 'r3soccer', SP, 80, 80, 18);
  WR('baseballcap', 'やきゅうぼう', 'hat', 'r3baseball', SP, 100, 60, 138);
  WR('baseballkit', 'やきゅうの ユニフォーム', 'body', 'r3baseball', SP, 80, 80, 18);
  WR('swimcap', 'すいえいキャップ', 'hat', 'r3swim', SP, 100, 50, 128);
  WR('swimgoggles', 'ゴーグル', 'face', 'r3swim', SP, 100, 40, 108);
  WR('swimkit', 'みずぎ', 'body', 'r3swim', SP, 70, 70, 22);
  WR('karateband', 'はちまき', 'hat', 'r3karate', SP, 120, 50, 116);
  WR('karategi', 'からての どうぎ', 'body', 'r3karate', SP, 80, 80, 18);
  WR('gymcap', 'あかしろぼう', 'hat', 'r3gym', SP, 100, 60, 148);
  WR('gymshirt', 'たいそうふく', 'body', 'r3gym', SP, 80, 80, 18);
  const ANIMALS = [['cat', 'ねこ'], ['dog', 'いぬ'], ['bunny', 'うさぎ'], ['bear', 'くま'], ['panda', 'パンダ'], ['lion', 'ライオン'], ['penguin', 'ペンギン'], ['chick', 'ひよこ'], ['frog', 'かえる'], ['dino', 'きょうりゅう']];
  ANIMALS.forEach(([k, nm]) => {
    if (k !== 'frog') WR('kigu' + k, nm + 'の フード', 'hat', 'r3' + k, AN, k === 'bunny' ? 100 : k === 'lion' ? 140 : 110, k === 'bunny' ? 140 : k === 'lion' ? 140 : 90, k === 'lion' ? 64 : 98);
    WR('kigu' + k + 'suit', nm + 'の きぐるみ', 'body', 'r3' + k, AN, 80, 90, 14);
  });
  WR('cattail', 'ねこの しっぽ', 'back', 'r3cat', AN, 60, 80, 38, 50);
  WR('dogtail', 'いぬの しっぽ', 'back', 'r3dog', AN, 50, 60, 46, 36);
  WR('bunnytail', 'うさぎの しっぽ', 'back', 'r3bunny', AN, 40, 40, 23, 32);
  WR('beartail', 'くまの しっぽ', 'back', 'r3bear', AN, 30, 30, 26, 30);
  WR('liontail', 'ライオンの しっぽ', 'back', 'r3lion', AN, 60, 80, 34, 52);
  WR('dinotail', 'きょうりゅうの しっぽ', 'back', 'r3dino', AN, 90, 70, 12, 50);

  const NEW = Object.keys(PT.ITEMS).filter((id) => PT.ITEMS[id].role && /^r3/.test(PT.ITEMS[id].role));
  PT.DRESS3_ITEMS = NEW;
  const fav = (sid, ids) => { const st = PT.stageById && PT.stageById(sid); if (st) st.favs = ids.concat(st.favs || []); };
  fav('airport', ['pilotcap', 'pilotsuit', 'cabincap', 'cabinsuit']);
  fav('station', ['conductorcap', 'conductorsuit']);
  fav('zoo', ['keepercap', 'keepersuit', 'kigulion', 'kigupanda', 'kigupenguin', 'kigulionsuit']);
  fav('farm', ['farmhat', 'farmoveralls', 'kiguchick', 'kiguchicksuit']);
  fav('bakery', ['bakerbandana', 'bakerapron']);
  fav('space', ['astrohelmet', 'astrosuit', 'jetpack']);
  fav('pool', ['swimcap', 'swimgoggles', 'swimkit']);
  fav('park', ['soccerband', 'soccerkit', 'baseballcap', 'baseballkit']);
  fav('kinder', ['gymcap', 'gymshirt', 'kigubunny', 'kigubunnysuit']);
  fav('dinoland', ['kigudino', 'kigudinosuit', 'dinotail']);

  /* ================= あそび ================= */
  const W = PT.world, R = PT.R;
  if (!R || !R.h || !R.h.isP) return;
  const D = R.D, X = PT.FX, A = PT.audio;
  const near = (ch, n = 2, r = 1200) => R.free(ch.x, ch.y, [ch], r).slice(0, n);
  const clampX = (x) => PT.clamp(x, W.visLeft + 90, W.visRight - 90);
  const whistle = () => { A.tone(2300, 0.16, { type: 'square', vol: 0.05 }); A.tone(2500, 0.36, { type: 'square', vol: 0.05, delay: 0.22, vib: 30 }); };
  const pop = (type, x, y) => { const p = W.addProp(type, x, y, { temp: true }); if (p) p.pop = W.t; return p; };
  const later = (p, ms = 7000) => W.after(ms, () => { if (p && !p.removed && !p.heldBy && !p.dragging) { W.poof(p.x, p.y - 30); W.remove(p); } });

  D('d3_police', 'おまわりさん ピピーッ', 'ふえで ピピーッ！ みんな とまって…すすんで よし！', ['patrolcap', 'patrolsuit']);
  D('d3_pilot', 'パイロットで ブーン', 'ひこうきの ポーズで ブーン！ おそらを ひとまわり', ['pilotcap', 'airplane']);
  D('d3_conductor', 'しゅっぱつ しんこう', 'しゃしょうさんの うしろに みんなが ならんで でんしゃごっこ', ['conductorcap', 'train']);
  D('d3_builder', 'トンテンカン', 'こうじの ヘルメットで なにかが できあがる', ['builderhat', 'castletoy']);
  D('d3_baker', 'やきたて パン', 'パンやさんが ほかほかの パンを やいたよ', ['bakerbandana', 'bread']);
  D('d3_farmer', 'うんとこしょ どっこいしょ', 'みんなで ひっぱると おおきな やさいが ぬけた', ['farmhat', 'carrot']);
  D('d3_astro', 'むじゅうりょく ふわふわ', 'うちゅうひこうしは からだが ふわ〜っと うく', ['astrohelmet', 'jetpack']);
  D('d3_cabin', 'おのみもの いかが？', 'キャビンアテンダントが みんなに ジュースを くばったよ', ['cabincap', 'juice']);
  D('d3_mail', 'おてがみ でーす', 'ゆうびんやさんが おてがみを とどけてくれた', ['mailcap', 'letter']);
  D('d3_keeper', 'ごはんの じかん', 'しいくいんさんの ごはんに どうぶつたちが あつまる', ['keepercap', 'banana']);
  D('d3_idol', 'アイドル ライブ', 'みんな〜！ うたって おどって きらきら ステージ', ['idolheadset', 'idoldress']);
  D('d3_kigurumi', 'きぐるみで なきごえ', 'きぐるみを きると その どうぶつに なりきっちゃう', ['kigucat', 'kigudogsuit']);
  D('d3_kigufriends', 'きぐるみ なかま', 'きぐるみ どうしが あうと おおはしゃぎ', ['kigupanda', 'kigubunny']);
  D('d3_kiguset', 'ほんものの どうぶつ？', 'フードと きぐるみを そろえて きたよ', ['kigulion', 'kigulionsuit']);
  D('d3_jobset', 'りっぱな おしごとセット', 'ぼうしと ふくを そろえると いちにんまえ！', ['pilotcap', 'pilotsuit']);
  D('d3_soccer', 'シュート！ ゴール！', 'サッカーの ユニフォームで ボールを けったよ', ['soccerkit', 'ball']);
  D('d3_baseball', 'かっとばせ ホームラン', 'カキーン！ ボールが おそらの かなたへ', ['baseballcap', 'baseballkit']);
  D('d3_swim', 'すいすい すいえい', 'すいえいキャップで すいすい およいだよ', ['swimcap', 'swimgoggles']);
  D('d3_karate', 'えいっ！ やあっ！', 'からての どうぎで かっこいい キック', ['karategi', 'karateband']);
  D('d3_gym', 'みんなで たいそう', 'いち、に、さん、し！ みんなで たいそう', ['gymcap', 'gymshirt']);
  D('d3_sportset', 'スポーツの せんしゅ', 'ぼうしと ユニフォームを そろえて せんしゅに なったよ', ['baseballcap', 'soccerkit']);

  /* セット（ぼうし＋ふく） */
  const SETS = [];
  const SET = (grp, name, hat, body) => SETS.push({ grp, name, hat, body });
  SET('job', 'おまわりさん', 'patrolcap', 'patrolsuit'); SET('job', 'パイロット', 'pilotcap', 'pilotsuit'); SET('job', 'しゃしょうさん', 'conductorcap', 'conductorsuit');
  SET('job', 'だいくさん', 'builderhat', 'buildervest'); SET('job', 'パンやさん', 'bakerbandana', 'bakerapron'); SET('job', 'のうかさん', 'farmhat', 'farmoveralls');
  SET('job', 'うちゅうひこうし', 'astrohelmet', 'astrosuit'); SET('job', 'キャビンアテンダント', 'cabincap', 'cabinsuit'); SET('job', 'ゆうびんやさん', 'mailcap', 'mailsuit');
  SET('job', 'しいくいんさん', 'keepercap', 'keepersuit'); SET('job', 'アイドル', 'idolheadset', 'idoldress');
  ANIMALS.forEach(([k, nm]) => SET('animal', nm, k === 'frog' ? 'frog' : 'kigu' + k, 'kigu' + k + 'suit'));
  SET('sport', 'サッカー', 'soccerband', 'soccerkit'); SET('sport', 'やきゅう', 'baseballcap', 'baseballkit'); SET('sport', 'すいえい', 'swimcap', 'swimkit'); SET('sport', 'からて', 'karateband', 'karategi'); SET('sport', 'たいそう', 'gymcap', 'gymshirt');
  const KIGU = {};
  ANIMALS.forEach(([k]) => { KIGU['kigu' + k] = k; KIGU['kigu' + k + 'suit'] = k; });
  Object.assign(KIGU, { cattail: 'cat', dogtail: 'dog', bunnytail: 'bunny', beartail: 'bear', liontail: 'lion', dinotail: 'dino' });
  const animalOf = (ch) => { const w = (ch && ch.wear) || {}; return KIGU[w.body] || KIGU[w.hat] || KIGU[w.back] || null; };
  const setOf = (ch) => SETS.find((s) => ch.wear && ch.wear.hat === s.hat && ch.wear.body === s.body) || null;

  const celebrate = (ch, s) => {
    const disc = s.grp === 'job' ? 'd3_jobset' : s.grp === 'animal' ? 'd3_kiguset' : 'd3_sportset';
    const txt = s.grp === 'job' ? `りっぱな ${s.name}！` : s.grp === 'animal' ? `ほんものの ${s.name} みたい！` : `${s.name}の せんしゅ だよ！`;
    A.sfx('cheer'); X.confetti(ch.x, 1600); W.bigText('かんぺき！', ch.x, ch.y - 250 * ch.scale, '#ff6f91');
    W.burst('star', ch.x, ch.y - 130 * ch.scale, 10, { sp: 0.22, max: 900 });
    R.claim(ch, 3000).pose('cheer', 900).say(txt, s.hat, 1600, 'yay').face('laugh', 900).do(() => R.found(disc));
    R.audience(ch.x, ch.y, [ch], 'cheer', 2, 300);
  };
  const CRY = {
    cat: ['ニャーン♪', () => A.tone(720, 0.45, { type: 'triangle', slide: 0.7, vol: 0.14, vib: 8 })],
    dog: ['ワンワン！', () => { A.tone(330, 0.12, { type: 'square', slide: 0.6, vol: 0.08 }); A.tone(330, 0.12, { type: 'square', slide: 0.6, vol: 0.08, delay: 0.2 }); }],
    bunny: ['ぴょんぴょん！', () => A.sfx('jump')],
    bear: ['クマ〜！', () => A.tone(200, 0.5, { type: 'sawtooth', slide: 0.8, vol: 0.07, vib: 10 })],
    panda: ['パンダだよ〜', () => A.sfx('munch')],
    lion: ['ガオーッ！', () => A.sfx('roar')],
    penguin: ['ペンペン！', () => A.sfx('quack')],
    chick: ['ピヨピヨ！', () => { for (let i = 0; i < 3; i++) A.tone(1700, 0.08, { type: 'sine', slide: 1.3, vol: 0.1, delay: i * 0.14 }); }],
    frog: ['ケロケロ！', () => { A.tone(240, 0.09, { type: 'square', vol: 0.07 }); A.tone(260, 0.09, { type: 'square', vol: 0.07, delay: 0.15 }); }],
    dino: ['ガオー！ ドシーン！', () => A.sfx('roar')],
  };
  let meetAt = 0;
  const kiguMeet = (ch) => {
    if (W.t < meetAt) return;
    const o = R.chars().find((x) => x !== ch && animalOf(x) && !x.dragging && !x.riding);
    if (!o) return;
    meetAt = W.t + 5000;
    const m = W.clampFloor((ch.x + o.x) / 2, (ch.y + o.y) / 2, 100);
    [[ch, o, -1], [o, ch, 1]].forEach(([a, b, s], i) => {
      const k = animalOf(a), cr = CRY[k] || CRY.cat;
      R.claim(a, 6000).go(m.x + s * 70, m.y, true).look(b.x).wait(i * 300).do(cr[1]).say(cr[0], 'heart', 1200, 'yay').jump(70, 450).jump(70, 450).pose('spin', 800).face('laugh', 1000)
        .do(() => { if (i === 0) { W.burst('heart', m.x, m.y - 160, 8, { up: true, sp: 0.14, max: 1000 }); A.sfx('tickle'); R.found('d3_kigufriends'); } });
    });
  };
  const ROLE = (key, fn) => {
    R.ROLES[key] = (ch, ctx) => {
      const a = fn(ch, ctx);
      const s = setOf(ch);
      if (a && s && PT.ITEMS[s.body] && PT.ITEMS[s.body].role === key) a.do(() => celebrate(ch, s));
      else if (a && animalOf(ch)) a.do(() => kiguMeet(ch));
    };
  };
  /* ---- うごきの ヘルパー ---- */
  const hopAlong = (ch, n, dx, h) => () => { const sx = ch.x, tx = clampX(ch.x + dx); ch.flip = tx < sx; R.tween(ch, n * 480, (k) => { ch.x = sx + (tx - sx) * k; ch.z = Math.abs(Math.sin(k * n * Math.PI)) * h; ch.pose = 'jump'; }, () => { ch.z = 0; ch.pose = 'idle'; if (h > 80) A.sfx('boing'); }); A.sfx('jump'); };
  const runCircle = (ch, r, ms, pose = 'run', zf) => () => { const sx = ch.x; R.tween(ch, ms, (k) => { const a = k * PT.TAU; ch.x = PT.clamp(sx + Math.sin(a) * r, W.visLeft + 60, W.visRight - 60); ch.flip = Math.cos(a) < 0; ch.pose = pose; ch.z = zf ? zf(k) : 0; }, () => { ch.x = sx; ch.z = 0; ch.pose = 'idle'; ch.flip = false; }); };

  /* ---- どうぶつ ---- */
  const ANI_MOVE = {
    cat: (a, ch) => { a.pose('peek', 800).say('ゴロゴロ…', 'heart', 1200, 'talk').pose('tickle', 900).face('love', 900); const o = near(ch, 1, 600)[0]; if (o) R.claim(o, 3500).look(ch.x).wait(600).say('かわいい ねこちゃん', 'heart', 1400, 'yay').pose('hold', 1200).face('love', 1200); },
    dog: (a, ch) => { a.do(runCircle(ch, 150, 2000)).say('しっぽ ふりふり！', 'dogtail', 1300, 'yay').pose('jump', 400); },
    bunny: (a, ch) => { a.do(hopAlong(ch, 3, ch.x < (W.visLeft + W.visRight) / 2 ? 260 : -260, 120)).say('ぴょーん！', 'star', 1100, 'yay'); },
    bear: (a, ch) => { const o = near(ch, 1, 900)[0]; if (o) { a.to(o, o.x < ch.x ? 75 : -75, 0, true).look(o.x).pose('hug', 1300).say('ぎゅ〜っ！', 'heart', 1300, 'yay'); R.claim(o, 4500).look(ch.x).wait(1200).pose('hug', 1300).face('love', 1300).say('ふかふか〜', 'heart', 1200, 'laugh'); } else a.pose('hug', 1200).say('はちみつ どこ〜？', '?', 1300, 'hmm'); },
    panda: (a, ch) => { a.pose('sit', 700).pose('eat', 1300).say('ササ もぐもぐ', 'heart', 1300, 'talk').pose('trip', 900).say('ごろーん', 'zzz', 1200, 'laugh').do(() => A.sfx('boing')); R.audience(ch.x, ch.y, [ch], 'laugh', 2, 2400); },
    lion: (a, ch) => { a.pose('roar', 1300).do(() => { W.shake = W.t + 400; W.burst('smoke', ch.x + (ch.flip ? -60 : 60), ch.y - 110, 5, { sp: 0.15, g: 0, col: '#ffe7a8', max: 700 }); }).say('ひゃくじゅうの おう だぞ〜', 'kigulion', 1500, 'yay'); R.audience(ch.x, ch.y, [ch], 'wow', 3, 900); },
    penguin: (a, ch) => { a.pose('march', 1200).say('よちよち', null, 900, 'talk').do(() => { const sx = ch.x, tx = clampX(ch.x + (ch.flip ? -240 : 240)); A.sfx('slide'); R.tween(ch, 1300, (k) => { ch.x = sx + (tx - sx) * PT.easeOut(k); ch.pose = 'slide'; if (Math.random() < 0.3) W.burst('spark', ch.x, ch.y - 10, 1, { sp: 0.05, g: 0, col: '#bfe6ff', max: 500 }); }, () => { ch.pose = 'idle'; }); }).say('すいーっ！', 'star', 1100, 'yay'); },
    chick: (a, ch) => { const kids = near(ch, 2, 1100), end = W.t + 4200, p = W.randFloor(240); kids.forEach((o, i) => { R.claim(o, 5000); R.follow(o, () => (i ? kids[i - 1] : ch), () => W.t < end, null, 75); }); a.hop(2).go(p.x, p.y).say('ついてきて〜', 'kiguchick', 1200, 'yay').hop(2); },
    frog: (a, ch) => { a.do(hopAlong(ch, 2, ch.x < (W.visLeft + W.visRight) / 2 ? 220 : -220, 100)).do(() => { X.splash(ch.x, ch.y); A.sfx('splash'); }).say('ぴょこーん！', 'note', 1100, 'yay'); X.music(ch.x, ch.y - 200, 2500); },
    dino: (a, ch) => { a.do(() => { for (let i = 0; i < 3; i++) W.after(i * 420, () => { A.sfx('drum'); W.shake = W.t + 220; W.burst('smoke', ch.x, ch.y, 3, { sp: 0.1, g: 0, col: '#e8dcc0', max: 600 }); }); }).pose('march', 1300).pose('roar', 1000).do(() => A.sfx('roar')); R.audience(ch.x, ch.y, [ch], 'wow', 2, 1400); },
  };
  ANIMALS.forEach(([k]) => ROLE('r3' + k, (ch) => {
    const cr = CRY[k];
    const a = R.claim(ch, 7000).do(cr[1]).say(cr[0], k === 'frog' ? 'kigufrogsuit' : 'kigu' + k, 1300, 'yay');
    ANI_MOVE[k](a, ch);
    return a.face('laugh', 800).do(() => R.found('d3_kigurumi'));
  }));

  /* ---- おしごと ---- */
  ROLE('r3police', (ch) => {
    const kids = near(ch, 3, 1500);
    whistle(); W.bigText('ピピーッ！', ch.x, ch.y - 240 * ch.scale, '#2f6fd0');
    const dir = ch.x < (W.visLeft + W.visRight) / 2 ? 1 : -1;
    kids.forEach((o, i) => R.claim(o, 7000).look(ch.x).face('surprise', 900).pose('march', 300).say(i ? '' : 'ピタッ！', '!', 1100, 'wow').wait(1600).go(clampX(o.x + dir * 240), o.y, false).pose('wave', 700).face('laugh', 900));
    return R.claim(ch, 7000).pose('point', 1000).say('とまってくださーい！', 'patrolcap', 1400, 'talk').do(whistle).pose('wave', 900).say('すすんで よーし！', 'star', 1400, 'yay').do(() => R.found('d3_police'));
  });
  ROLE('r3pilot', (ch) => {
    const sx = ch.x, sy = ch.y;
    R.audience(ch.x, ch.y, [ch], 'wow', 2, 1500);
    return R.claim(ch, 7000).say('こちら きちょう です！', 'pilotcap', 1400, 'talk').pose('fly', 600).do(() => {
      A.sfx('whoosh'); W.bigText('ブーン！', ch.x, ch.y - 240 * ch.scale, '#58b9f0');
      R.tween(ch, 3000, (k) => { const a = k * PT.TAU; ch.x = PT.clamp(sx + Math.sin(a) * 280, W.visLeft + 60, W.visRight - 60); ch.z = Math.sin(k * Math.PI) * 110; ch.pose = 'fly'; ch.flip = Math.cos(a) < 0; if (Math.random() < 0.3) W.burst('smoke', ch.x + (ch.flip ? 40 : -40), ch.y - ch.z - 70, 1, { sp: 0.04, g: 0, col: '#ffffff', max: 800, size: 16 }); }, () => { ch.x = sx; ch.y = sy; ch.z = 0; ch.flip = false; ch.pose = 'idle'; });
    }).say('ぶじに ちゃくりく しました！', 'airplane', 1500, 'yay').pose('cheer', 800).do(() => R.found('d3_pilot'));
  });
  ROLE('r3conductor', (ch) => {
    const kids = near(ch, 3, 1500), end = W.t + 5200, sx = ch.x, sy = ch.y, p = W.randFloor(220);
    return R.claim(ch, 9000).pose('point', 700).do(whistle).say('しゅっぱつ しんこう！', 'conductorcap', 1300, 'yay').do(() => {
      A.sfx('train'); W.bigText('ガタンゴトン', ch.x, ch.y - 240 * ch.scale, '#33406b');
      kids.forEach((o, i) => { R.claim(o, 6000); R.follow(o, () => (i ? kids[i - 1] : ch), () => W.t < end, null, 80); });
    }).go(p.x, p.y).pose('march', 400).go(sx, sy).say('つぎは〜 あそびタウン〜', 'train', 1500, 'talk').do(() => { A.sfx('ding'); R.found('d3_conductor'); });
  });
  ROLE('r3builder', (ch) => {
    const tx = clampX(ch.x + (ch.flip ? -110 : 110));
    return R.claim(ch, 7000).say('こうじ はじめます！', 'builderhat', 1300, 'yay').hold('blocks').do(() => {
      W.bigText('トンテンカン！', ch.x, ch.y - 240 * ch.scale, '#ff8a3d');
      for (let i = 0; i < 5; i++) W.after(i * 300, () => { A.sfx('drum'); W.burst('star', tx, ch.y - 50, 2, { sp: 0.15, max: 600 }); });
    }).pose('tickle', 1500).unhold().do(() => { const p = pop('castletoy', tx, ch.y + 6); later(p); W.poof(tx, ch.y - 40); A.sfx('discover'); })
      .say('おしろが できた！', 'castletoy', 1500, 'yay').pose('cheer', 900).do(() => R.found('d3_builder'));
  });
  ROLE('r3baker', (ch) => {
    const kids = near(ch, 2, 1000);
    const a = R.claim(ch, 8000).say('パンを やきまーす', 'bakerbandana', 1300, 'talk').pose('hold', 1200).do(() => {
      A.sfx('ding'); ['bread', 'donut', 'pancake'].forEach((t, i) => W.after(i * 220, () => { const p = pop(t, clampX(ch.x - 90 + i * 90), ch.y + 20); later(p, 8000); W.burst('smoke', p ? p.x : ch.x, ch.y - 30, 3, { sp: 0.06, g: 0, up: true, col: '#ffffff', max: 900 }); }));
    }).say('ほかほか やきたて！', 'bread', 1500, 'yay').pose('cheer', 800).do(() => R.found('d3_baker'));
    kids.forEach((o, i) => R.claim(o, 6000).wait(1800 + i * 300).to(ch, (i ? 1 : -1) * 100, 10, true).look(ch.x).say('いい におい〜', 'heart', 1300, 'talk').pose('eat', 1300).face('love', 1200));
    return a;
  });
  ROLE('r3farmer', (ch) => {
    const kids = near(ch, 2, 1200), dir = ch.x < (W.visLeft + W.visRight) / 2 ? 1 : -1, vx = clampX(ch.x + dir * 80);
    kids.forEach((o, i) => R.claim(o, 7000).go(clampX(ch.x - dir * (80 + i * 75)), ch.y + 4, true).look(vx).pose('carry', 1600).say(i ? 'どっこいしょ！' : 'うんとこしょ！', null, 1200, 'yay').pose('cheer', 800));
    return R.claim(ch, 7000).look(vx).say('おやさい ぬくよ〜', 'farmhat', 1300, 'talk').pose('peek', 600).pose('carry', 1600).say('うんとこしょ…', null, 1200, 'hmm').do(() => {
      X.dig(vx, ch.y); A.sfx('pop'); const p = pop(PT.pick(['carrot', 'corn', 'carrot']), vx + dir * 40, ch.y + 4); if (p) { p.scale *= 1.8; later(p, 8000); }
      W.burst('leaf', vx, ch.y - 40, 6, { sp: 0.2, max: 800 }); R.audience(ch.x, ch.y, [ch].concat(kids), 'cheer', 1, 200);
    }).say('ぬけた〜！', 'carrot', 1500, 'yay').jump(50, 450).do(() => R.found('d3_farmer'));
  });
  ROLE('r3astro', (ch) => {
    const jet = ch.wear && ch.wear.back === 'jetpack', h = jet ? 260 : 140;
    return R.claim(ch, 7000).say(jet ? 'ジェット はっしゃ！' : 'むじゅうりょく〜', 'astrohelmet', 1300, 'yay').do(() => {
      A.sfx(jet ? 'rocket' : 'magic');
      R.tween(ch, 3200, (k) => { ch.z = Math.sin(k * Math.PI) * h + Math.sin(k * 20) * 8; ch.pose = jet ? 'fly' : 'jump'; if (Math.random() < 0.25) W.burst(jet ? 'smoke' : 'star', ch.x + PT.rand(-40, 40), ch.y - ch.z - (jet ? 20 : 120), 1, { sp: 0.05, g: 0, max: 700, col: '#ffd9a0', size: 12 }); }, () => { ch.z = 0; ch.pose = 'idle'; });
    }).say('ふわふわ〜 ちきゅうに ただいま！', 'star', 1500, 'yay').do(() => R.found('d3_astro'));
  });
  ROLE('r3cabin', (ch) => {
    const kids = near(ch, 2, 1300);
    A.sfx('ding');
    const a = R.claim(ch, 12000).pose('bow', 800).say('ごじょうしゃ ありがとう ございます', 'cabincap', 1500, 'talk');
    kids.forEach((o) => { a.to(o, o.x < ch.x ? 85 : -85, 0, false).look(o.x).hold('juice').say('おのみものは いかが？', 'juice', 1300, 'talk').unhold().do(() => { R.claim(o, 3000).look(ch.x).hold('juice').pose('eat', 1200).say('ごくごく おいしい！', 'heart', 1300, 'yay').unhold(); }); });
    return a.pose('bow', 700).say('よい たびを！', 'star', 1300, 'yay').do(() => R.found('d3_cabin'));
  });
  ROLE('r3mail', (ch) => {
    const kids = near(ch, 2, 1500);
    const a = R.claim(ch, 12000).say('ゆうびん でーす！', 'mailcap', 1300, 'yay').do(() => A.sfx('bell'));
    kids.forEach((o) => { a.to(o, o.x < ch.x ? 85 : -85, 0, true).look(o.x).hold('letter').say('おてがみ どうぞ', 'letter', 1200, 'talk').unhold().do(() => { R.claim(o, 3500).look(ch.x).hold('letter').face('surprise', 700).say('だれから かな？', '?', 1100, 'wow').face('love', 1200).say('うれしい！', 'heart', 1200, 'yay').unhold(); W.burst('heart', o.x, o.y - 160 * o.scale, 4, { up: true, sp: 0.1 }); }); });
    return a.pose('wave', 800).do(() => R.found('d3_mail'));
  });
  ROLE('r3keeper', (ch) => {
    const fx = clampX(ch.x + (ch.flip ? -130 : 130));
    const fans = R.chars().filter((o) => o !== ch && !o.dragging && animalOf(o)).concat(near(ch, 2, 1500)).filter((o, i, arr) => arr.indexOf(o) === i).slice(0, 3);
    fans.forEach((o, i) => R.claim(o, 7000).wait(1600 + i * 250).go(fx - 90 + i * 90, ch.y + 30, true).look(fx).say((CRY[animalOf(o)] || ['わーい ごはん！'])[0], 'heart', 1200, 'yay').do(() => (CRY[animalOf(o)] || [0, () => A.sfx('munch')])[1]()).pose('eat', 1500).face('love', 1000));
    return R.claim(ch, 7000).say('ごはんの じかん だよ〜', 'keepercap', 1400, 'yay').pose('hold', 700).do(() => { ['banana', 'carrot', 'apple'].forEach((t, i) => { const p = pop(t, fx - 70 + i * 70, ch.y + 40); later(p, 5500); }); A.sfx('pop'); })
      .wait(2000).say('いっぱい たべてね！', 'heart', 1300, 'yay').do(() => { A.sfx('munch'); R.found('d3_keeper'); });
  });
  ROLE('r3idol', (ch) => {
    R.free(ch.x, ch.y, [ch], 1400).slice(0, 3).forEach((o, i) => R.claim(o, 6000).wait(500 + i * 200).look(ch.x).pose('cheer', 1200).say(PT.pick(['かわいい〜！', 'がんばれ〜！', 'すてき〜！']), 'heart', 1300, 'yay').pose('dance', 1800).face('love', 1500));
    return R.claim(ch, 7000).say('みんな〜 いっくよ〜！', 'idolheadset', 1300, 'yay').do(() => { A.sfx('cheer'); X.music(ch.x, ch.y - 220, 4000); W.special({ type: 'd3spot', max: 4200, draw(c2, f, k) { const a = Math.min(1, f.life / 400) * Math.min(1, (f.max - f.life) / 400) * 0.22; c2.fillStyle = `rgba(255,240,180,${a})`; c2.beginPath(); c2.moveTo(ch.x - 30, 0); c2.lineTo(ch.x + 30, 0); c2.lineTo(ch.x + 130, ch.y + 10); c2.lineTo(ch.x - 130, ch.y + 10); c2.closePath(); c2.fill(); } }); })
      .pose('dance', 1600).pose('spin', 900).do(() => { W.burst('star', ch.x, ch.y - 150, 10, { sp: 0.2, max: 900 }); W.burst('heart', ch.x, ch.y - 150, 6, { up: true }); }).say('ありがとう〜！', 'heart', 1400, 'yay').pose('wave', 700).do(() => R.found('d3_idol'));
  });

  /* ---- スポーツ ---- */
  ROLE('r3soccer', (ch) => {
    const dir = ch.x < (W.visLeft + W.visRight) / 2 ? 1 : -1, gx = clampX(ch.x + dir * 420);
    const b = pop('ball', ch.x + dir * 55, ch.y + 4); later(b, 6000);
    const gk = near(ch, 1, 1500)[0];
    if (gk) R.claim(gk, 6000).go(clampX(gx + dir * 50), ch.y, true).look(ch.x).pose('count', 1700).face('surprise', 900).say('とれなかった〜', 'sweat', 1300, 'laugh').pose('cheer', 700);
    return R.claim(ch, 6500).look(ch.x + dir).say('いくよ〜！', 'soccerkit', 1200, 'yay').pose('kick', 500).do(() => {
      A.sfx('boing'); if (!b) return; const sx = b.x;
      R.tween(b, 900, (k) => { b.x = sx + (gx - sx) * k; b.z = Math.sin(k * Math.PI) * 110; }, () => { b.z = 0; X.confetti(b.x, 1400); A.sfx('cheer'); W.bigText('ゴール！', b.x, b.y - 200, '#58b9f0'); });
    }).wait(900).say('シュート！ ゴール！', 'ball', 1400, 'yay').pose('cheer', 900).do(() => R.found('d3_soccer'));
  });
  ROLE('r3baseball', (ch) => {
    const pit = near(ch, 1, 1500)[0], dir = ch.x < (W.visLeft + W.visRight) / 2 ? 1 : -1;
    const px = clampX(ch.x + dir * 260);
    let b = null;
    if (pit) R.claim(pit, 6000).go(px, ch.y, true).look(ch.x).say('いくよ〜', 'ball', 1000, 'talk').pose('point', 400).wait(2400).face('surprise', 900).say('とおくまで とんだ！', '!', 1300, 'wow');
    return R.claim(ch, 7000).look(px).say('かっとばせ〜！', 'baseballcap', 1300, 'yay').wait(pit ? 800 : 0).do(() => {
      b = pop('ball', px, ch.y + 4); if (!b) return; const sx = b.x;
      R.tween(b, 700, (k) => { b.x = sx + (ch.x - sx) * k; b.z = 60 + Math.sin(k * Math.PI) * 30; }, () => {});
    }).wait(700).pose('spin', 500).do(() => {
      A.tone(1500, 0.12, { type: 'triangle', vol: 0.18 }); W.bigText('カキーン！', ch.x, ch.y - 230 * ch.scale, '#e2434b');
      if (b) { const sx = b.x; R.tween(b, 1200, (k) => { b.x = sx + dir * k * 600; b.z = 60 + k * 700; }, () => { W.remove(b); X.firework(PT.clamp(sx + dir * 500, W.visLeft + 150, W.visRight - 150), 200); }); }
    }).say('ホームラン！', 'star', 1500, 'yay').pose('cheer', 900).do(() => R.found('d3_baseball'));
  });
  ROLE('r3swim', (ch) => {
    const sx = ch.x, dir = ch.x < (W.visLeft + W.visRight) / 2 ? 1 : -1;
    return R.claim(ch, 7000).say('すいすい〜！', 'swimcap', 1100, 'yay').do(() => {
      A.sfx('splash');
      R.tween(ch, 2600, (k) => { ch.x = PT.clamp(sx + dir * Math.sin(k * Math.PI) * 240, W.visLeft + 60, W.visRight - 60); ch.flip = (k < 0.5) === (dir < 0); ch.pose = 'swim'; if (Math.random() < 0.25) W.burst('drop', ch.x + PT.rand(-40, 40), ch.y - 40, 2, { sp: 0.2, g: 0.0009, max: 700, size: 9 }); }, () => { ch.x = sx; ch.pose = 'idle'; ch.flip = false; X.splash(ch.x, ch.y); });
    }).say('ぷはーっ！', 'star', 1300, 'yay').pose('cheer', 800).do(() => R.found('d3_swim'));
  });
  ROLE('r3karate', (ch) => {
    R.audience(ch.x, ch.y, [ch], 'cheer', 2, 2200);
    const hit = () => { A.sfx('drum'); W.burst('star', ch.x + (ch.flip ? -70 : 70), ch.y - 60, 4, { sp: 0.2, max: 600 }); };
    return R.claim(ch, 6000).pose('bow', 700).say('おす！', 'karategi', 900, 'yay').pose('kick', 500).do(hit).say('えいっ！', null, 600, 'yay').pose('point', 400).do(hit).say('やあっ！', null, 600, 'yay').pose('kick', 500).do(() => { hit(); W.bigText('えいっ！', ch.x, ch.y - 230 * ch.scale, '#e2434b'); W.shake = W.t + 200; })
      .pose('bow', 700).face('determined', 900).do(() => R.found('d3_karate'));
  });
  ROLE('r3gym', (ch) => {
    const kids = near(ch, 3, 1300);
    const beat = (a, i) => { for (let n = 0; n < 2; n++) a.pose('cheer', 450).jump(40, 380).pose('count', 450).jump(40, 380); return a; };
    X.music(ch.x, ch.y - 200, 3500);
    kids.forEach((o, i) => beat(R.claim(o, 7000).look(ch.x).wait(900), i).face('laugh', 800));
    const a = R.claim(ch, 7000).say('いち、に、さん、し！', 'gymcap', 900, 'yay').do(() => A.sfx('piano'));
    return beat(a, 0).say('げんき いっぱい！', 'star', 1300, 'yay').do(() => R.found('d3_gym'));
  });

  /* ================= おだい ================= */
  (PT.ROYAL_ODAI || []).push(
    ['おしごとの せいふくに きがえよう', ['d3_police', 'd3_pilot', 'd3_conductor', 'd3_builder', 'd3_baker', 'd3_farmer', 'd3_astro', 'd3_cabin', 'd3_mail', 'd3_keeper', 'd3_idol', 'd3_jobset'], ['pilotcap', 'builderhat']],
    ['どうぶつの きぐるみで なかよし', ['d3_kigufriends', 'd3_kiguset'], ['kigucat', 'kigupandasuit']],
    ['スポーツで からだを うごかそう', ['d3_soccer', 'd3_baseball', 'd3_swim', 'd3_karate', 'd3_gym', 'd3_sportset'], ['soccerkit', 'baseballcap']]
  );
  const O = (stage, text, goals, hint) => ({ id: stage + ':' + text, stage, text, goals, hint });
  PT.ODAI2 = (PT.ODAI2 || []).concat([O('zoo', 'しいくいんさんに なって どうぶつに ごはん', ['d3_keeper', 'd3_kigurumi'], ['keepercap', 'kigulion'])]);
})();
