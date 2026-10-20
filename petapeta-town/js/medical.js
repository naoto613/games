/* おいしゃさん・かんごしさんの どうぐと いしょう */
'use strict';
(() => {
  const G = PT.G, EXT = PT.WEAR_EXT;
  const cross = (c, x, y, s, col = '#ff5d6c') => { c.fillStyle = col; c.fillRect(x - s * 0.32, y - s, s * 0.64, s * 2); c.fillRect(x - s, y - s * 0.32, s * 2, s * 0.64); };

  /* ================= ぼうし ================= */
  EXT.hat.nursecap = (c) => {
    c.beginPath(); c.moveTo(-34, -150); c.lineTo(-28, -178); c.quadraticCurveTo(0, -190, 28, -178); c.lineTo(34, -150); c.quadraticCurveTo(0, -158, -34, -150); c.closePath();
    G._bb = { x0: -34, y0: -190, x1: 34, y1: -150 }; G.fillO(c, '#ffffff', 3);
    c.strokeStyle = '#ffb3c8'; c.lineWidth = 4; c.beginPath(); c.moveTo(-31, -158); c.quadraticCurveTo(0, -166, 31, -158); c.stroke();
    cross(c, 0, -174, 7);
  };
  EXT.hat.nursepink = (c) => {
    c.beginPath(); c.moveTo(-34, -150); c.lineTo(-28, -178); c.quadraticCurveTo(0, -190, 28, -178); c.lineTo(34, -150); c.quadraticCurveTo(0, -158, -34, -150); c.closePath();
    G._bb = { x0: -34, y0: -190, x1: 34, y1: -150 }; G.fillO(c, '#ffd1e0', 3);
    c.strokeStyle = '#ffffff'; c.lineWidth = 4; c.beginPath(); c.moveTo(-31, -158); c.quadraticCurveTo(0, -166, 31, -158); c.stroke();
    G.heart(c, 0, -170, 10); c.fillStyle = '#ff5d78'; c.fill(); c.fillStyle = '#fff'; c.fillRect(-1.6, -177, 3.2, 10); c.fillRect(-5, -173.6, 10, 3.2);
  };
  EXT.hat.headmirror = (c, ch, t) => {
    c.strokeStyle = '#3d4a66'; c.lineWidth = 7; c.beginPath(); c.ellipse(0, -140, 50, 16, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
    c.strokeStyle = '#6a7a9a'; c.lineWidth = 3; c.stroke();
    G.circ(c, 0, -160, 20); G.fillO(c, '#d9e2ee', 3);
    G.circ(c, 0, -160, 14); c.fillStyle = G.rgrad(c, -5, -165, 1, 16, [[0, '#ffffff'], [1, '#9fb3c8']]); c.fill();
    G.circ(c, 0, -160, 4); c.fillStyle = '#3d4a66'; c.fill();
    const k = 0.5 + 0.5 * Math.sin((t || 0) * 0.006); c.fillStyle = `rgba(255,255,255,${0.5 + k * 0.5})`; G.star(c, -7, -167, 4 + k * 2, 1.6); c.fill();
  };
  EXT.hat.surgicalcap = (c) => {
    c.beginPath(); c.moveTo(-44, -140); c.quadraticCurveTo(-46, -186, 0, -188); c.quadraticCurveTo(46, -186, 44, -140); c.quadraticCurveTo(0, -150, -44, -140); c.closePath();
    G._bb = { x0: -46, y0: -188, x1: 46, y1: -140 }; G.fillO(c, '#6cc6c0', 3);
    c.fillStyle = 'rgba(255,255,255,.55)'; for (const [x, y] of [[-24, -168], [0, -176], [22, -166], [-10, -156], [14, -152], [-30, -150], [32, -150]]) { G.circ(c, x, y, 3.2); c.fill(); }
    G.rr(c, -46, -148, 92, 9, 4); G.fillO(c, '#4fa9a3', 2);
  };
  EXT.hat.headbandage = (c) => {
    G.rr(c, -46, -150, 92, 18, 8); G.fillO(c, '#ffffff', 2.5);
    c.strokeStyle = 'rgba(160,180,200,.6)'; c.lineWidth = 1.5; for (let x = -38; x < 40; x += 10) { c.beginPath(); c.moveTo(x, -149); c.lineTo(x + 6, -133); c.stroke(); }
    for (const sd of [-1, 1]) { G.ell(c, 46 + sd * 0, -142 + sd * 6, 12, 6, sd * 0.6); G.fillO(c, '#ffffff', 2); }
  };
  /* ================= かお ================= */
  EXT.face.mask = (c, ch, t, lx = 0) => {
    const x = lx * 1.1;
    c.strokeStyle = '#e8eef5'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 30, -104); c.lineTo(-46, -118); c.moveTo(x + 30, -104); c.lineTo(46, -118); c.stroke();
    G.rr(c, x - 31, -114, 62, 32, 12); G.fillO(c, '#ffffff', 2.6);
    c.strokeStyle = '#c9d8e6'; c.lineWidth = 2; for (const y of [-104, -96, -88]) { c.beginPath(); c.moveTo(x - 26, y); c.lineTo(x + 26, y); c.stroke(); }
  };
  EXT.face.pinkmask = (c, ch, t, lx = 0) => {
    const x = lx * 1.1;
    c.strokeStyle = '#ffd1e0'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 30, -104); c.lineTo(-46, -118); c.moveTo(x + 30, -104); c.lineTo(46, -118); c.stroke();
    G.rr(c, x - 31, -114, 62, 32, 12); G.fillO(c, '#ffc4d6', 2.6);
    G.heart(c, x + 16, -96, 6); c.fillStyle = '#ff6f91'; c.fill();
  };
  EXT.face.bandaid = (c, ch, t, lx = 0) => {
    c.save(); c.translate(32 + lx, -104); c.rotate(-0.5);
    G.rr(c, -14, -6, 28, 12, 5); G.fillO(c, '#f6c99a', 2); G.rr(c, -5, -5, 10, 10, 2); c.fillStyle = '#ffe2c4'; c.fill();
    c.restore();
    c.save(); c.translate(-30 + lx, -142); c.rotate(0.6);
    G.rr(c, -11, -5, 22, 10, 4); G.fillO(c, '#ffd1e0', 2); G.heart(c, 0, 1, 4); c.fillStyle = '#ff6f91'; c.fill();
    c.restore();
  };
  /* ================= ふく ================= */
  const steth = (c) => {
    c.strokeStyle = '#3d6fb4'; c.lineWidth = 4; c.beginPath(); c.moveTo(-14, -84); c.quadraticCurveTo(-18, -54, 0, -50); c.quadraticCurveTo(18, -54, 14, -84); c.stroke();
    G.circ(c, 0, -50, 6); G.fillO(c, '#9fb3c8', 2);
  };
  EXT.body.whitecoat = (c) => {
    c.beginPath(); c.moveTo(-28, -84); c.lineTo(28, -84); c.lineTo(36, -14); c.lineTo(-36, -14); c.closePath(); G._bb = { x0: -36, y0: -84, x1: 36, y1: -14 }; G.fillO(c, '#ffffff', 3);
    c.strokeStyle = '#c9d8e6'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -78); c.lineTo(2, -16); c.stroke();
    c.fillStyle = '#dfe9f3'; c.beginPath(); c.moveTo(-14, -84); c.lineTo(0, -64); c.lineTo(-8, -84); c.fill(); c.beginPath(); c.moveTo(14, -84); c.lineTo(0, -64); c.lineTo(8, -84); c.fill();
    G.rr(c, -26, -44, 18, 14, 3); c.strokeStyle = '#c9d8e6'; c.lineWidth = 2; c.stroke(); G.rr(c, 10, -44, 18, 14, 3); c.stroke();
    c.fillStyle = '#3d6fb4'; c.fillRect(-22, -50, 3, 10); c.fillStyle = '#ff6f91'; c.fillRect(-17, -50, 3, 10);
    steth(c);
    G.rr(c, 10, -78, 16, 10, 2); c.fillStyle = '#7fb6ef'; c.fill(); cross(c, 18, -73, 3, '#ffffff');
  };
  EXT.body.nurse = (c) => {
    c.beginPath(); c.moveTo(-26, -84); c.lineTo(26, -84); c.lineTo(34, -22); c.quadraticCurveTo(0, -16, -34, -22); c.closePath(); G._bb = { x0: -34, y0: -84, x1: 34, y1: -18 }; G.fillO(c, '#ffb3c8', 3);
    G.rr(c, -18, -62, 36, 40, 8); G.fillO(c, '#ffffff', 2.4);
    cross(c, 0, -46, 7, '#ff5d6c');
    c.strokeStyle = '#ffffff'; c.lineWidth = 4; c.beginPath(); c.moveTo(-12, -84); c.lineTo(0, -74); c.lineTo(12, -84); c.stroke();
    for (const sd of [-1, 1]) { G.ell(c, sd * 26, -80, 10, 8, sd * 0.3); G.fillO(c, '#ffd1e0', 2); }
  };
  EXT.body.scrubs = (c) => {
    c.beginPath(); c.moveTo(-28, -84); c.lineTo(28, -84); c.lineTo(31, -26); c.lineTo(-31, -26); c.closePath(); G._bb = { x0: -31, y0: -84, x1: 31, y1: -26 }; G.fillO(c, '#6cc6c0', 3);
    c.beginPath(); c.moveTo(-12, -84); c.lineTo(0, -68); c.lineTo(12, -84); c.strokeStyle = '#4fa9a3'; c.lineWidth = 4; c.stroke();
    G.rr(c, 8, -62, 16, 14, 3); c.strokeStyle = '#4fa9a3'; c.lineWidth = 2; c.stroke(); c.fillStyle = '#ffd23f'; c.fillRect(12, -66, 3, 8);
  };
  EXT.body.pajama = (c) => {
    c.beginPath(); c.moveTo(-28, -84); c.lineTo(28, -84); c.lineTo(31, -24); c.lineTo(-31, -24); c.closePath(); G._bb = { x0: -31, y0: -84, x1: 31, y1: -24 }; G.fillO(c, '#cfe8ff', 3);
    c.save(); c.clip(); c.fillStyle = '#9fcbf5'; for (let x = -30; x < 32; x += 12) c.fillRect(x, -86, 5, 64); c.restore();
    for (const y of [-72, -58, -44]) { G.circ(c, 0, y, 3); c.fillStyle = '#ffffff'; c.fill(); }
    G.rr(c, -30, -84, 60, 8, 4); G.fillO(c, '#ffffff', 2);
  };

  /* ================= アイテム ================= */
  const def = (id, o) => { PT.ITEMS[id] = Object.assign({ id, tags: ['medical'], w: 90, h: 90 }, o); };
  const WR = (id, name, slot, kind, role, w, h, off) => def(id, { name, cat: 'dress', tags: ['medical', slot === 'hat' ? 'hat' : slot], w, h, wear: [slot, kind], role, draw: (c, t) => { c.save(); c.translate(0, off); if (slot === 'body') EXT.body[kind](c, { wear: {}, pose: 'idle' }, t || 0); else if (slot === 'face') EXT.face[kind](c, {}, t || 0, 0); else PT.drawWearPiece(c, slot, kind, t || 0); c.restore(); } });
  WR('nursecap', 'ナースキャップ', 'hat', 'nursecap', 'nurse', 80, 50, 152);
  WR('nursepink', 'ピンクの ナースキャップ', 'hat', 'nursepink', 'nurse', 80, 50, 152);
  WR('headmirror', 'おいしゃさんの ぼうし', 'hat', 'headmirror', 'doctor', 100, 60, 150);
  WR('surgicalcap', 'しゅじゅつの ぼうし', 'hat', 'surgicalcap', 'surgeon', 100, 60, 142);
  WR('headbandage', 'あたまの ほうたい', 'hat', 'headbandage', 'patient', 100, 30, 132);
  WR('mask', 'マスク', 'face', 'mask', 'mask', 100, 40, 80);
  WR('pinkmask', 'ピンクの マスク', 'face', 'pinkmask', 'mask', 100, 40, 80);
  WR('whitecoat', 'はくい', 'body', 'whitecoat', 'doctor', 80, 80, 6);
  WR('nurse', 'かんごしさんの ふく', 'body', 'nurse', 'nurse', 80, 80, 6);
  WR('scrubs', 'しゅじゅつの ふく', 'body', 'scrubs', 'surgeon', 80, 80, 0);
  WR('pajama', 'にゅういんの パジャマ', 'body', 'pajama', 'patient', 80, 80, 0);

  const T = (id, name, w, h, draw, extra) => def(id, Object.assign({ name, cat: 'tools', w, h, draw }, extra || {}));
  T('stethoscope', 'ちょうしんき', 80, 80, (c) => {
    c.strokeStyle = '#3d6fb4'; c.lineWidth = 5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-22, -70); c.quadraticCurveTo(-26, -34, 0, -30); c.quadraticCurveTo(26, -34, 22, -70); c.stroke();
    c.beginPath(); c.moveTo(0, -30); c.quadraticCurveTo(4, -10, 22, -14); c.stroke();
    for (const x of [-22, 22]) { G.circ(c, x, -72, 4); G.fillO(c, '#3a3550', 2); }
    G.circ(c, 26, -14, 11); G.fillO(c, '#c9d6e4', 2.5); G.circ(c, 26, -14, 6); c.fillStyle = '#ffffff'; c.fill();
  });
  T('syringe', 'おもちゃの ちゅうしゃ', 90, 50, (c) => {
    c.save(); c.translate(0, -24); c.rotate(-0.25);
    G.rr(c, -30, -11, 46, 22, 6); c.fillStyle = 'rgba(200,235,255,.85)'; c.fill(); c.strokeStyle = '#7fa9c8'; c.lineWidth = 2.5; c.stroke();
    G.rr(c, -26, -7, 26, 14, 4); c.fillStyle = '#ffb3c8'; c.fill();
    G.rr(c, -44, -4, 16, 8, 3); G.fillO(c, '#ff8fab', 2); G.rr(c, -50, -12, 8, 24, 3); G.fillO(c, '#ff8fab', 2);
    G.rr(c, 16, -4, 10, 8, 2); G.fillO(c, '#c9d6e4', 2); c.strokeStyle = '#9fb3c8'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(26, 0); c.lineTo(40, 0); c.stroke();
    c.strokeStyle = '#7fa9c8'; c.lineWidth = 1.5; for (let x = -20; x < 14; x += 8) { c.beginPath(); c.moveTo(x, -11); c.lineTo(x, -5); c.stroke(); }
    c.restore();
  });
  T('thermometer', 'たいおんけい', 80, 50, (c) => {
    c.save(); c.translate(0, -24); c.rotate(-0.2);
    G.rr(c, -36, -9, 60, 18, 9); G.fillO(c, '#ffffff', 2.5);
    G.rr(c, -26, -5, 28, 10, 3); c.fillStyle = '#c9f0d0'; c.fill(); c.fillStyle = '#2f6a40'; c.font = `900 9px ${PT.FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('36.5', -12, 0.5);
    G.rr(c, 22, -4, 18, 8, 4); G.fillO(c, '#c9d6e4', 2);
    G.circ(c, 10, 0, 3.5); c.fillStyle = '#7fb6ef'; c.fill();
    c.restore();
  });
  T('bandaid', 'ばんそうこう', 70, 50, (c) => {
    for (const [dx, a, col] of [[-10, -0.4, '#f6c99a'], [10, 0.3, '#ffd1e0']]) { c.save(); c.translate(dx, -22); c.rotate(a); G.rr(c, -26, -9, 52, 18, 8); G.fillO(c, col, 2.5); G.rr(c, -8, -7, 16, 14, 3); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); c.fillStyle = 'rgba(160,110,80,.35)'; for (const x of [-20, -15, 15, 20]) for (const y of [-3, 3]) { G.circ(c, x, y, 1.1); c.fill(); } c.restore(); }
    G.heart(c, 12, -20, 4); c.fillStyle = '#ff6f91'; c.fill();
  });
  T('medicine', 'おくすり', 70, 90, (c) => {
    G.rr(c, -18, -72, 36, 66, 10); G.fillO(c, '#ffb04a', 3);
    G.rr(c, -14, -84, 28, 14, 4); G.fillO(c, '#ffffff', 2.5);
    G.rr(c, -14, -54, 28, 28, 4); c.fillStyle = '#ffffff'; c.fill(); G.heart(c, 0, -38, 8); c.fillStyle = '#ff6f91'; c.fill();
    c.save(); c.translate(26, -10); c.rotate(-0.5); G.rr(c, -3, -24, 6, 24, 3); G.fillO(c, '#9fd8ff', 2); G.ell(c, 0, -28, 8, 6); G.fillO(c, '#9fd8ff', 2); c.restore();
  });
  T('pills', 'おくすりの つぶ', 70, 50, (c) => {
    G.rr(c, -30, -36, 60, 32, 6); G.fillO(c, '#e8eef5', 2.5);
    [['#ff8fab', '#ffffff'], ['#7fb6ef', '#ffffff'], ['#ffd23f', '#ff9a3d']].forEach(([a, b], i) => { c.save(); c.translate(-18 + i * 18, -20); c.rotate(0.6); G.rr(c, -5, -9, 10, 18, 5); c.fillStyle = a; c.fill(); c.fillStyle = b; c.fillRect(-5, 0, 10, 9); c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1.5; G.rr(c, -5, -9, 10, 18, 5); c.stroke(); c.restore(); });
  });
  T('firstaid', 'きゅうきゅうばこ', 100, 80, (c) => {
    G.rr(c, -20, -76, 40, 14, 6); c.strokeStyle = '#c94452'; c.lineWidth = 6; c.stroke();
    G.rr(c, -46, -66, 92, 62, 10); G.fillO(c, '#ffffff', 3);
    G.rr(c, -46, -66, 92, 14, 8); c.fillStyle = '#ff6f7a'; c.fill();
    cross(c, 0, -30, 13, '#ff5d6c');
  });
  T('bandage', 'ほうたい', 70, 60, (c) => {
    G.ell(c, -8, -24, 22, 22); G.fillO(c, '#ffffff', 2.5); G.ell(c, -8, -24, 8, 8); c.fillStyle = '#e8eef5'; c.fill();
    c.strokeStyle = '#d6e0ea'; c.lineWidth = 2; for (const r of [12, 16]) { c.beginPath(); c.arc(-8, -24, r, 0, PT.TAU); c.stroke(); }
    c.beginPath(); c.moveTo(12, -12); c.quadraticCurveTo(26, -4, 34, -10); c.lineTo(36, -2); c.quadraticCurveTo(24, 2, 10, -4); c.closePath(); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#c9d8e6'; c.stroke();
  });
  T('icepack', 'こおりまくら', 90, 50, (c) => {
    G.rr(c, -40, -36, 80, 32, 14); c.fillStyle = 'rgba(160,220,255,.9)'; c.fill(); c.strokeStyle = '#7fb6ef'; c.lineWidth = 2.5; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.85)'; for (const [x, y] of [[-20, -24], [0, -18], [18, -26]]) { G.rr(c, x - 6, y - 5, 12, 10, 3); c.fill(); }
    G.rr(c, 34, -28, 10, 16, 3); G.fillO(c, '#ff8fab', 2);
  });
  T('doctorbag', 'おいしゃさんの かばん', 100, 80, (c) => {
    c.beginPath(); c.moveTo(-18, -64); c.quadraticCurveTo(0, -84, 18, -64); c.strokeStyle = '#5a3a2a'; c.lineWidth = 6; c.stroke();
    c.beginPath(); c.moveTo(-46, -4); c.lineTo(-40, -60); c.quadraticCurveTo(0, -70, 40, -60); c.lineTo(46, -4); c.closePath(); G._bb = { x0: -46, y0: -66, x1: 46, y1: -4 }; G.fillO(c, '#8a5534', 3);
    c.strokeStyle = '#c9a070'; c.lineWidth = 3; c.beginPath(); c.moveTo(-41, -50); c.quadraticCurveTo(0, -58, 41, -50); c.stroke();
    G.circ(c, 0, -30, 13); c.fillStyle = '#ffffff'; c.fill(); cross(c, 0, -30, 8, '#ff5d6c');
    G.rr(c, -6, -56, 12, 10, 2); G.fillO(c, '#ffd54a', 2);
  });
  T('babybottle', 'ほにゅうびん', 50, 90, (c) => {
    G.ell(c, 0, -80, 7, 9); G.fillO(c, '#ffd9a8', 2);
    G.rr(c, -14, -72, 28, 10, 4); G.fillO(c, '#ff8fab', 2.5);
    G.rr(c, -16, -62, 32, 58, 10); c.fillStyle = 'rgba(230,245,255,.9)'; c.fill(); c.strokeStyle = '#9fc8f0'; c.lineWidth = 2.5; c.stroke();
    G.rr(c, -14, -40, 28, 34, 8); c.fillStyle = '#ffffff'; c.fill();
    c.strokeStyle = '#9fc8f0'; c.lineWidth = 1.5; for (const y of [-50, -40, -30, -20]) { c.beginPath(); c.moveTo(-14, y); c.lineTo(-6, y); c.stroke(); }
  });
  T('hbed', 'びょういんの ベッド', 200, 130, (c) => {
    for (const x of [-86, 80]) { G.rr(c, x, -96, 8, 96, 3); G.fillO(c, '#9fb3c8', 2); }
    G.rr(c, -90, -100, 16, 50, 4); G.fillO(c, '#cfe8ff', 2.5);
    G.rr(c, -84, -58, 168, 22, 8); G.fillO(c, '#ffffff', 3);
    G.rr(c, -78, -76, 44, 22, 10); G.fillO(c, '#ffffff', 2.5);
    c.beginPath(); c.moveTo(-30, -60); c.quadraticCurveTo(30, -66, 84, -58); c.lineTo(84, -38); c.quadraticCurveTo(30, -34, -30, -38); c.closePath(); G._bb = { x0: -30, y0: -66, x1: 84, y1: -34 }; G.fillO(c, '#9fd8ff', 3);
    for (const x of [-70, 70]) { G.circ(c, x, -6, 7); G.fillO(c, '#3a3550', 2); }
    G.rr(c, -86, -36, 172, 8, 3); G.fillO(c, '#9fb3c8', 2);
  }, { tags: ['medical', 'bed', 'sleep'] });
  T('wheelchair', 'くるまいす', 120, 120, (c, t) => {
    c.strokeStyle = '#3d6fb4'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-30, -100); c.lineTo(-24, -48); c.lineTo(30, -48); c.lineTo(36, -20); c.stroke();
    G.rr(c, -26, -58, 56, 12, 5); G.fillO(c, '#7fb6ef', 2.5); G.rr(c, -32, -100, 12, 50, 5); G.fillO(c, '#7fb6ef', 2.5);
    G.circ(c, -10, -32, 30); c.strokeStyle = '#3a3550'; c.lineWidth = 5; c.stroke(); c.strokeStyle = '#9fb3c8'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { const a = (i / 6) * PT.TAU + (t || 0) * 0.001; c.beginPath(); c.moveTo(-10, -32); c.lineTo(-10 + Math.cos(a) * 28, -32 + Math.sin(a) * 28); c.stroke(); }
    G.circ(c, 40, -8, 8); G.fillO(c, '#3a3550', 2);
  }, { cat: 'rides', tags: ['medical', 'ride'] });
  T('ivstand', 'てんてき', 60, 190, (c, t) => {
    G.ell(c, 0, -4, 26, 6); G.fillO(c, '#9fb3c8', 2); c.strokeStyle = '#9fb3c8'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -6); c.lineTo(0, -176); c.moveTo(-20, -170); c.lineTo(20, -170); c.stroke();
    G.rr(c, -18, -168, 36, 50, 10); c.fillStyle = 'rgba(200,235,255,.85)'; c.fill(); c.strokeStyle = '#7fa9c8'; c.lineWidth = 2.5; c.stroke();
    G.rr(c, -14, -148, 28, 26, 8); c.fillStyle = 'rgba(255,190,210,.8)'; c.fill();
    const k = ((t || 0) % 900) / 900; G.circ(c, 0, -110 + k * 14, 3); c.fillStyle = 'rgba(160,210,255,.9)'; c.fill();
    c.strokeStyle = '#c9d8e6'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -118); c.quadraticCurveTo(14, -60, 30, -40); c.stroke();
  });
  T('eyechart', 'しりょく けんさ', 110, 170, (c) => {
    c.strokeStyle = '#9fb3c8'; c.lineWidth = 5; c.beginPath(); c.moveTo(-30, 0); c.lineTo(-24, -60); c.moveTo(30, 0); c.lineTo(24, -60); c.stroke();
    G.rr(c, -46, -168, 92, 112, 8); G.fillO(c, '#ffffff', 3);
    const ring = (x, y, r, a) => { c.save(); c.translate(x, y); c.rotate(a); c.strokeStyle = '#2a1f35'; c.lineWidth = r * 0.45; c.beginPath(); c.arc(0, 0, r, 0.35, PT.TAU - 0.35); c.stroke(); c.restore(); };
    ring(0, -144, 12, 0); ring(-16, -114, 8, Math.PI); ring(16, -114, 8, -Math.PI / 2); [-24, -8, 8, 24].forEach((x, i) => ring(x, -88, 4.5, i * 1.6));
    G.heart(c, 30, -158, 6); c.fillStyle = '#ff8fab'; c.fill();
  });
  T('xray', 'レントゲン', 120, 170, (c) => {
    c.strokeStyle = '#9fb3c8'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -50); c.stroke(); G.ell(c, 0, -2, 30, 6); G.fillO(c, '#9fb3c8', 2);
    G.rr(c, -54, -168, 108, 120, 10); G.fillO(c, '#3a3a5a', 3);
    G.rr(c, -46, -160, 92, 104, 6); c.fillStyle = '#5a6a9a'; c.fill();
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 4; c.lineCap = 'round';
    G.circ(c, 0, -136, 13); c.stroke();
    c.beginPath(); c.moveTo(0, -122); c.lineTo(0, -76); for (let i = 0; i < 4; i++) { c.moveTo(0, -116 + i * 10); c.quadraticCurveTo(-18, -112 + i * 10, -22, -100 + i * 10); c.moveTo(0, -116 + i * 10); c.quadraticCurveTo(18, -112 + i * 10, 22, -100 + i * 10); } c.moveTo(-16, -76); c.lineTo(16, -76); c.stroke();
  });
  T('scale', 'たいじゅうけい', 90, 50, (c) => {
    G.rr(c, -42, -22, 84, 20, 8); G.fillO(c, '#ffffff', 3);
    G.rr(c, -14, -20, 28, 14, 4); c.fillStyle = '#c9f0d0'; c.fill(); c.fillStyle = '#2f6a40'; c.font = `900 10px ${PT.FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('18', 0, -13);
    for (const x of [-30, 30]) { G.ell(c, x, -14, 8, 5); c.fillStyle = 'rgba(160,200,240,.5)'; c.fill(); }
  });

  const NEW = ['headmirror', 'nursecap', 'nursepink', 'surgicalcap', 'whitecoat', 'nurse', 'scrubs', 'mask', 'pinkmask', 'stethoscope', 'syringe', 'thermometer', 'bandaid', 'medicine', 'pills', 'firstaid', 'bandage', 'icepack', 'doctorbag', 'babybottle', 'hbed', 'wheelchair', 'ivstand', 'eyechart', 'xray', 'scale', 'pajama', 'headbandage'];
  PT.MED_ITEMS = NEW;
  const st = PT.stageById && PT.stageById('clinic');
  if (st) st.favs = NEW.concat(st.favs || []);

  /* ================= あそび ================= */
  const W = PT.world, R = PT.R, D = R.D;
  if (!R || !R.h) return;
  const { isP, isC, role } = R.h;
  const med = (id) => (['stethoscope', 'syringe', 'thermometer', 'bandaid', 'medicine', 'pills', 'firstaid', 'bandage', 'icepack', 'doctorbag', 'babybottle'].includes(id));
  D('d_nurse', 'かんごしさん', 'ナースキャップで「おだいじに」。みんなを やさしく おせわ', ['nursecap', 'nurse']);
  D('d_surgeon', 'しゅじゅつの せんせい', 'しゅじゅつの ふくで「メス！」…じゃなくて「ばんそうこう！」', ['surgicalcap', 'scrubs']);
  D('d_thermo', 'おねつ はかろう', 'たいおんけいで ピピッ！ げんき いっぱい', ['thermometer', 'pyoko']);
  D('d_shot', 'ちくっと がんばった', 'おもちゃの ちゅうしゃ。なかずに えらかったね', ['syringe', 'pon']);
  D('d_bandaid', 'ばんそうこう ぺたっ', 'ばんそうこうを はると いたいの とんでいく', ['bandaid', 'choco']);
  D('d_nigai', 'にがい おくすり', 'おくすりを のんで げんきに なあれ', ['medicine', 'moko']);
  D('d_stetho', 'もしもし ドキドキ', 'ちょうしんきで しんぞうの おとを きいたよ', ['stethoscope', 'mimi']);
  D('d_firstaid', 'きゅうきゅうばこ', 'きゅうきゅうばこを あけて てあて', ['firstaid', 'bandage']);
  D('d_icepack', 'ひんやり こおりまくら', 'おでこに のせて すやすや', ['icepack', 'gaku']);
  D('d_babycare', 'あかちゃんの おせわ', 'ほにゅうびんで ミルク ごくごく', ['babybottle', 'ricky']);
  D('d_hbed', 'にゅういん ごっこ', 'びょういんの ベッドで ゆっくり やすもう', ['hbed', 'pajama']);
  D('d_wheel', 'くるまいすで おさんぽ', 'くるまいすを おして あげたよ', ['wheelchair', 'nurse']);
  D('d_eye', 'しりょく けんさ', '「わっかの あいている ほうは？」「うえ！」', ['eyechart', 'gaku']);
  D('d_xray', 'レントゲン', 'からだの ほねが みえちゃった！', ['xray', 'lulu']);
  D('d_scale', 'おおきく なったね', 'たいじゅうけいに のって せいちょう チェック', ['scale', 'pyoko']);
  D('d_iv', 'てんてき ぽたぽた', 'てんてきで げんきを チャージ', ['ivstand', 'mimi']);

  const spark = (x, y, col = '#7fd0e8') => W.burst('spark', x, y, 8, { sp: 0.15, max: 700, size: 9, col, g: 0 });
  const hearts = (x, y) => W.burst('heart', x, y, 5, { up: true, sp: 0.12, max: 900 });
  const carer = (x, y, excl) => role('doctor') || role('nurse') || role('surgeon') || R.free(x, y, excl, 1400)[0] || null;
  const patientOf = (c) => (isC(c.tgt) ? c.tgt : R.one(c.e.x, c.e.y));
  const giveTo = (c, run) => { const pat = patientOf(c); if (!pat) return null; return pat; };

  R.ROLES.nurse = (ch) => {
    const pat = R.free(ch.x, ch.y, [ch], 1400)[0];
    const a = R.claim(ch, 7000).say('かんごしさんです！', 'nursecap', 1400, 'yay').pose('wave', 700);
    if (pat) { a.to(pat, pat.x < ch.x ? 80 : -80, 2, true).look(pat.x).say('おねつ はかりましょうね', 'thermometer', 1500, 'talk').pose('hold', 1200).do(() => { pat.wear = Object.assign({}, pat.wear, { face: 'bandaid' }); spark(pat.x, pat.y - 120); PT.audio.sfx('sparkle'); }).say('おだいじに！', 'heart', 1400, 'yay').do(() => R.found('d_nurse')); R.claim(pat, 7000).look(ch.x).face('happy', 1200).wait(2600).say('ありがとう！', 'heart', 1300, 'yay').pose('cheer', 800); }
    else a.do(() => R.found('d_nurse'));
  };
  R.ROLES.surgeon = (ch) => {
    const pat = R.free(ch.x, ch.y, [ch], 1500)[0];
    const a = R.claim(ch, 6000).say('しゅじゅつ はじめます！', 'scrubs', 1500, 'talk').pose('think', 900);
    if (pat) { a.to(pat, pat.x < ch.x ? 80 : -80, 2, true).look(pat.x).say('ばんそうこう！', 'bandaid', 1300, 'yay').do(() => { pat.wear = Object.assign({}, pat.wear, { face: 'bandaid' }); spark(pat.x, pat.y - 110, '#7ff0c8'); PT.audio.sfx('magic'); }).say('せいこう です！', 'star', 1400, 'yay').pose('cheer', 900).do(() => R.found('d_surgeon')); R.claim(pat, 6000).look(ch.x).pose('sit', 2600).face('laugh', 1200).say('なおった！', 'heart', 1300, 'yay').jump(50, 500); }
    else a.do(() => R.found('d_surgeon'));
  };
  R.ROLES.mask = (ch) => { R.claim(ch, 2600).say('マスクで あんしん', 'mask', 1500, 'talk').pose('wave', 800); };
  R.ROLES.patient = (ch) => { R.claim(ch, 3000).face('puzzled', 1200).say('ちょっと おやすみ…', 'hbed', 1500, 'hmm').pose('sit', 1200); const d = carer(ch.x, ch.y, [ch]); if (d && d !== ch) W.after(1500, () => R.checkup && R.checkup(d, ch)); };

  // キャラに わたす
  R.add({ id: 'med-on-char', pri: 80, test: (c) => (c.e.kind === 'prop' && med(c.e.type) ? giveTo(c) : null),
    run(c, pat) {
      const it = c.e, ty = it.type;
      W.remove(it);
      const doc = ['stethoscope', 'syringe', 'thermometer', 'medicine', 'pills', 'firstaid', 'bandage', 'doctorbag'].includes(ty) ? carer(pat.x, pat.y, [pat]) : null;
      const helper = doc && doc !== pat ? doc : null;
      if (helper && !helper.wear.body && ['stethoscope', 'doctorbag', 'syringe'].includes(ty)) R.wear(helper, 'whitecoat', {}, true);
      if (helper && !helper.wear.body && ['firstaid', 'bandage', 'thermometer'].includes(ty)) { R.wear(helper, 'nurse', {}, true); helper.wear = Object.assign({}, helper.wear, { hat: helper.wear.hat || 'nursecap' }); }
      const visit = (lines, fx, disc, patLines) => {
        const who = helper || pat;
        const a = R.claim(who, 7000);
        if (helper) a.to(pat, pat.x < helper.x ? 80 : -80, 2, true).look(pat.x);
        a.hold(ty);
        lines.forEach(([txt, icon, ms, v]) => a.say(txt, icon, ms, v));
        a.do(() => { fx(); }).unhold().do(() => R.found(disc));
        if (helper) R.claim(pat, 7000).look(helper.x).wait(1400).do(() => {}).say(...patLines[0]).face(...(patLines[1] || ['happy', 1000])).say(...(patLines[2] || ['ありがとう！', 'heart', 1200, 'yay'])).pose('cheer', 800);
      };
      if (ty === 'thermometer') return visit([['ピピッ…', 'thermometer', 1400, 'talk'], ['36.5ど！ げんき！', 'star', 1500, 'yay']], () => spark(pat.x, pat.y - 100), 'd_thermo', [['わきに はさんで…', null, 1300, 'talk']]);
      if (ty === 'syringe') { visit([['ちょっと ちくっと するよ', 'syringe', 1500, 'talk'], ['えらかったね！', 'star', 1500, 'yay']], () => { pat.wear = Object.assign({}, pat.wear, { face: 'bandaid' }); hearts(pat.x, pat.y - 120); PT.audio.sfx('sparkle'); }, 'd_shot', [['ちくっ…！', '!', 1200, 'wow'], ['puzzled', 1200], ['なかなかったよ！', 'star', 1300, 'yay']]); if (!helper) R.claim(pat, 4000).face('puzzled', 1200).say('ちくっ…', '!', 1200, 'wow').face('laugh', 1200).say('がんばった！', 'star', 1300, 'yay'); return; }
      if (ty === 'bandaid') { R.claim(pat, 3500).say('ぺたっ！', 'bandaid', 1200, 'yay').do(() => { pat.wear = Object.assign({}, pat.wear, { face: 'bandaid' }); hearts(pat.x, pat.y - 120); PT.audio.sfx('pop'); }).say('いたいの とんでった！', 'heart', 1500, 'yay').pose('cheer', 800).do(() => R.found('d_bandaid')); return; }
      if (ty === 'bandage') return visit([['ぐるぐる まきまき', 'bandage', 1500, 'talk'], ['これで だいじょうぶ', 'heart', 1400, 'yay']], () => { pat.wear = Object.assign({}, pat.wear, { hat: 'headbandage' }); spark(pat.x, pat.y - 140); PT.audio.sfx('sparkle'); }, 'd_firstaid', [['いたた…', null, 1200, 'hmm']]);
      if (ty === 'medicine' || ty === 'pills') { R.claim(pat, 4500).pose('eat', 1200).face('puzzled', 1200).say('にがーい…', 'medicine', 1400, 'hmm').do(() => { spark(pat.x, pat.y - 110, '#ffd23f'); PT.audio.sfx('sparkle'); }).face('laugh', 1200).say('げんきに なった！', 'star', 1400, 'yay').jump(50, 500).do(() => R.found('d_nigai')); return; }
      if (ty === 'icepack') { pat.headItem = 'icepack'; R.claim(pat, 4500).pose('sit', 2600).face('sleep', 2600).say('ひんやり〜', 'icepack', 1500, 'talk').do(() => { pat.headItem = null; W.addProp('icepack', pat.x + 60, pat.y); R.found('d_icepack'); }); return; }
      if (ty === 'babybottle') { const baby = W.charOf('ricky'); const who = baby && baby !== pat ? baby : null; if (who) { R.claim(pat, 6000).to(who, who.x < pat.x ? 70 : -70, 2, true).look(who.x).hold('babybottle').say('ミルク どうぞ', 'babybottle', 1500, 'talk').unhold().do(() => { hearts(who.x, who.y - 100); R.found('d_babycare'); }); R.claim(who, 6000).wait(1800).pose('eat', 1400).say('ごくごく', 'heart', 1300, 'yay'); } else R.claim(pat, 3500).hold('babybottle').pose('eat', 1400).say('ごくごく', 'babybottle', 1300, 'yay').unhold().do(() => { hearts(pat.x, pat.y - 100); R.found('d_babycare'); }); return; }
      // ちょうしんき・かばん・きゅうきゅうばこ
      const d2 = helper || carer(pat.x, pat.y, [pat]);
      if (d2 && d2 !== pat && R.checkup) { if (ty === 'stethoscope') { if (!d2.wear.body) R.wear(d2, 'whitecoat', {}, true); R.checkup(d2, pat); W.after(4000, () => { R.found('d_stetho'); hearts(pat.x, pat.y - 120); }); } else { R.checkup(d2, pat); W.after(4000, () => { pat.wear = Object.assign({}, pat.wear, { face: 'bandaid' }); R.found('d_firstaid'); }); } }
      else R.claim(pat, 3000).hold(ty).say('もしもし…ドキドキ', 'heart', 1600, 'talk').unhold().do(() => R.found(ty === 'stethoscope' ? 'd_stetho' : 'd_firstaid'));
    } });

  // ばしょに おく どうぐ
  const user = (c) => R.free(c.e.x, c.e.y, [], 1500)[0] || null;
  R.add({ id: 'med-hbed', pri: 70, test: (c) => (isP(c.e, 'hbed') ? (isC(c.tgt) ? c.tgt : user(c)) : isC(c.e) && isP(c.tgt, 'hbed') ? c.e : null),
    run(c, ch) {
      const bed = isP(c.e, 'hbed') ? c.e : c.tgt;
      R.claim(ch, 9000).to(bed, 0, 2, true).do(() => { ch.stay = true; ch.x = bed.x + 6; ch.y = bed.y - 2; ch.z = 44 * bed.scale; ch.flip = false; ch.rest = 'sleep'; ch.wear = Object.assign({}, ch.wear, { body: ch.wear.body || 'pajama' });  }).pose('sleep', 2500).say('すやすや…', 'hbed', 1400, 'talk');
      const d = carer(bed.x, bed.y, [ch]);
      if (d && d !== ch) { if (!d.wear.hat) R.wear(d, 'nursecap', {}, true); R.claim(d, 8000).wait(1500).to(bed, 120, 6, true).look(bed.x).say('ぐあいは どうですか？', 'nursecap', 1500, 'talk').pose('hold', 900).say('おだいじに', 'heart', 1300, 'yay'); }
      W.after(5200, () => { ch.rest = 'idle'; ch.z = 0; ch.stay = false; const p = W.clampFloor(bed.x + 110, bed.y + 10); ch.x = p.x; ch.y = p.y; ch.scale = W.depthScale(ch.y); R.claim(ch, 2400).jump(60, 500).say('げんきに なった！', 'star', 1400, 'yay').pose('cheer', 900); R.found('d_hbed'); });
    } });
  R.add({ id: 'med-wheel', pri: 70, test: (c) => (isP(c.e, 'wheelchair') ? (isC(c.tgt) ? c.tgt : user(c)) : isC(c.e) && isP(c.tgt, 'wheelchair') ? c.e : null),
    run(c, ch) {
      const wc = isP(c.e, 'wheelchair') ? c.e : c.tgt;
      R.claim(ch, 9000).to(wc, 0, 2, true).do(() => { R.ride(ch, wc, { pose: 'sit', z: 30 * wc.scale, dx: 0 }); }).say('くるまいすに すわったよ', 'wheelchair', 1400, 'talk');
      const h = R.free(wc.x, wc.y, [ch], 1500)[0];
      if (h) {
        R.wear(h, 'nurse', {}, true);
        const tx = W.randFloor(260);
        R.claim(h, 9000).wait(1300).to(wc, 70, 2, true).look(wc.x).say('おさんぽ しましょう', 'nursecap', 1300, 'talk').do(() => {
          const sx = wc.x, sy = wc.y, hx = h.x, hy = h.y; h.flip = tx.x < sx;
          R.tween(h, 2600, (k) => { const x = PT.lerp(sx, tx.x, k), y = PT.lerp(sy, tx.y, k); wc.x = x; wc.y = y; wc.scale = W.depthScale(y); ch.x = x; ch.y = y - 2; ch.scale = wc.scale; h.x = x + (h.flip ? 80 : -80); h.y = y; h.scale = wc.scale; h.pose = 'walk'; h.poseT = k * 3000; void hx; void hy; }, () => { h.pose = 'idle'; R.claim(ch, 2000).say('たのしい！', 'heart', 1300, 'yay'); R.found('d_wheel'); });
        });
      } else W.after(2500, () => R.found('d_wheel'));
    } });
  const station = (id, disc, lines, fx) => R.add({ id: 'med-' + id, pri: 70, test: (c) => (isP(c.e, id) ? (isC(c.tgt) ? c.tgt : user(c)) : isC(c.e) && isP(c.tgt, id) ? c.e : null),
    run(c, ch) { const p = isP(c.e, id) ? c.e : c.tgt; const a = R.claim(ch, 7000).to(p, id === 'scale' ? 0 : -90, 4, true).look(p.x); if (id === 'scale') a.do(() => { ch.z = 10; }); lines.forEach((l) => a.say(...l)); a.do(() => { if (id === 'scale') ch.z = 0; fx && fx(ch, p); R.found(disc); }).pose('cheer', 900); } });
  station('eyechart', 'd_eye', [['わっかの あいている ほうは…', 'eyechart', 1600, 'talk'], ['うえ！', 'star', 1200, 'yay'], ['みぎ！', 'star', 1200, 'yay']], (ch) => spark(ch.x, ch.y - 120));
  station('scale', 'd_scale', [['のって みよう', 'scale', 1300, 'talk'], ['おおきく なったね！', 'heart', 1500, 'yay']], (ch) => W.burst('heart', ch.x, ch.y - 120, 6, { up: true, sp: 0.12, max: 900 }));
  station('ivstand', 'd_iv', [['ぽたぽた…', 'ivstand', 1500, 'talk'], ['げんき チャージ！', 'star', 1400, 'yay']], (ch) => spark(ch.x, ch.y - 120, '#9fd8ff'));
  station('xray', 'd_xray', [['はい、とりますよー', 'xray', 1400, 'talk'], ['ほねが みえた！', '!', 1500, 'wow']], (ch, p) => {
    PT.audio.sfx('zap');
    W.special({ type: 'xflash', max: 900, draw(c2, f, k) { c2.fillStyle = `rgba(200,230,255,${0.5 * (1 - k)})`; c2.fillRect(p.x - 70, p.y - 180, 140, 140); } });
  });

  (PT.ROYAL_ODAI || []).push(['おいしゃさんと かんごしさんに なって みんなを げんきに', ['d_nurse', 'd_thermo', 'd_bandaid', 'd_stetho', 'd_doctor'], ['nursecap', 'thermometer']]);
})();
