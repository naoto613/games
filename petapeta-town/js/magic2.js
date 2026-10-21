/* まじょ・まほうつかいの いしょうと どうぐ */
'use strict';
(() => {
  const G = PT.G, EXT = PT.WEAR_EXT;

  /* ================= ぼうし ================= */
  const pointy = (col, band, deco, tip = 0) => (c, ch, t) => {
    const sw = Math.sin((t || 0) * 0.003) * 4;
    G.ell(c, 0, -150, 66, 14); G.fillO(c, col, 3);
    c.beginPath(); c.moveTo(-40, -152); c.quadraticCurveTo(-24, -200, -6 + sw, -238 - tip); c.quadraticCurveTo(14 + sw * 1.4, -246 - tip, 30 + sw * 2, -228 - tip); c.quadraticCurveTo(16, -206, 40, -152); c.closePath();
    G._bb = { x0: -40, y0: -246, x1: 40, y1: -150 }; G.fillO(c, col, 3);
    G.rr(c, -38, -168, 76, 14, 5); G.fillO(c, band, 2.5);
    if (deco) deco(c, t, sw);
  };
  const starDeco = (col) => (c, t) => { c.fillStyle = col; G.star(c, 0, -161, 9, 4); c.fill(); for (const [x, y] of [[-12, -196], [8, -214], [-2, -182]]) { c.fillStyle = `rgba(255,236,140,${0.6 + 0.4 * Math.sin((t || 0) * 0.006 + x)})`; G.star(c, x, y, 4.5, 2); c.fill(); } };
  const moonDeco = (c) => { c.fillStyle = '#ffe066'; c.beginPath(); c.arc(-6, -196, 11, 0.6, PT.TAU - 0.6); c.quadraticCurveTo(-2, -196, 2, -203); c.closePath(); c.fill(); c.fillStyle = '#ffffff'; for (const [x, y] of [[14, -186], [-18, -176], [8, -220]]) { G.star(c, x, y, 4, 1.8); c.fill(); } };
  EXT.hat.witchblack = pointy('#3a3550', '#9b6fd6', (c, t) => { c.fillStyle = '#ffd23f'; G.rr(c, -8, -168, 16, 14, 2); c.fill(); c.fillStyle = '#3a3550'; c.fillRect(-4, -164, 8, 6); });
  EXT.hat.witchpurple = pointy('#8e5bd6', '#ffd23f', starDeco('#ffd23f'));
  EXT.hat.witchpink = pointy('#ff8fb1', '#ffffff', (c, t) => { G.heart(c, 0, -160, 9); c.fillStyle = '#ff5d78'; c.fill(); for (const s of [-1, 1]) { G.ell(c, s * 30, -166, 12, 7, s * 0.4); G.fillO(c, '#ffffff', 2); } G.circ(c, 0, -166, 5); G.fillO(c, '#ffffff', 2); });
  EXT.hat.wizardblue = pointy('#3f5fc6', '#9fd8ff', moonDeco, 14);
  EXT.hat.witchgreen = pointy('#4fa96a', '#ffb04a', (c) => { G.circ(c, 0, -160, 7); c.fillStyle = '#ffb04a'; c.fill(); c.strokeStyle = '#3a7a4a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -167); c.lineTo(2, -172); c.stroke(); });
  EXT.hat.witchbow = (c, ch, t) => {
    EXT.hat.witchblack(c, {}, t);
    for (const s of [-1, 1]) { G.blob(c, [0, -162, s * 22, -178, s * 30, -162, s * 22, -148]); G.fillO(c, '#ff6f91', 2.5); }
    G.circ(c, 0, -162, 7); G.fillO(c, '#ff5d78', 2);
  };
  EXT.hat.apprentice = (c, ch, t) => {
    c.beginPath(); c.moveTo(-46, -144); c.quadraticCurveTo(-46, -196, 0, -200); c.quadraticCurveTo(46, -196, 46, -144); c.closePath(); G._bb = { x0: -46, y0: -200, x1: 46, y1: -144 }; G.fillO(c, '#6a4fc0', 3);
    G.rr(c, -50, -152, 100, 12, 6); G.fillO(c, '#ffd23f', 2.5);
    c.fillStyle = '#ffd23f'; G.star(c, 0, -178, 12, 5); c.fill();
    G.circ(c, 40, -196, 8); G.fillO(c, '#ffd23f', 2);
  };
  /* ================= かお ================= */
  EXT.face.roundglasses = (c, ch, t, lx = 0) => {
    c.strokeStyle = '#8a5a2b'; c.lineWidth = 3.5; for (const x of [-19, 19]) { G.circ(c, x + lx, -121, 15); c.stroke(); } c.beginPath(); c.moveTo(-4 + lx, -122); c.lineTo(4 + lx, -122); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.35)'; for (const x of [-24, 14]) { G.ell(c, x + lx, -127, 4, 2.5, -0.5); c.fill(); }
  };
  EXT.face.starglasses = (c, ch, t, lx = 0) => {
    for (const x of [-19, 19]) { G.star(c, x + lx, -120, 19, 10); c.fillStyle = 'rgba(255,214,90,.55)'; c.fill(); c.strokeStyle = '#e0a92a'; c.lineWidth = 3; c.stroke(); }
    c.strokeStyle = '#e0a92a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-4 + lx, -122); c.lineTo(4 + lx, -122); c.stroke();
  };
  /* ================= ふく ================= */
  const robe = (col, trim, deco) => (c, ch, t) => {
    const sw = Math.sin((t || 0) * 0.004) * 3;
    c.beginPath(); c.moveTo(-26, -86); c.lineTo(26, -86); c.lineTo(38 + sw, -8); c.quadraticCurveTo(0, 0, -38 + sw, -8); c.closePath(); G._bb = { x0: -38, y0: -86, x1: 38, y1: -4 }; G.fillO(c, col, 3);
    c.strokeStyle = trim; c.lineWidth = 4; c.beginPath(); c.moveTo(-37 + sw, -10); c.quadraticCurveTo(0, -2, 37 + sw, -10); c.stroke();
    c.beginPath(); c.moveTo(-12, -86); c.lineTo(0, -70); c.lineTo(12, -86); c.stroke();
    for (const s of [-1, 1]) { G.ell(c, s * 28, -78, 12, 10, s * 0.3); G.fillO(c, col, 2.5); }
    if (deco) deco(c, t, sw);
  };
  EXT.body.witchdress = robe('#3a3550', '#9b6fd6', (c, t) => { G.rr(c, -26, -58, 52, 8, 4); G.fillO(c, '#9b6fd6', 2); G.rr(c, -6, -60, 12, 12, 3); G.fillO(c, '#ffd23f', 2); for (const [x, y] of [[-20, -30], [16, -22], [0, -40]]) { c.fillStyle = 'rgba(255,236,140,.8)'; G.star(c, x, y, 5, 2.2); c.fill(); } });
  EXT.body.witchpurple = robe('#8e5bd6', '#ffd23f', (c, t, sw) => { c.fillStyle = '#ffd23f'; for (const [x, y] of [[-22, -28], [20, -36], [-4, -50], [8, -18]]) { G.star(c, x + sw * 0.5, y, 6, 2.6); c.fill(); } c.beginPath(); c.arc(14, -62, 7, 0.6, PT.TAU - 0.6); c.quadraticCurveTo(17, -62, 20, -67); c.closePath(); c.fillStyle = '#ffe066'; c.fill(); });
  EXT.body.witchpink = (c, ch, t) => {
    const sw = Math.sin((t || 0) * 0.004) * 4;
    c.beginPath(); c.moveTo(-22, -84); c.lineTo(22, -84); c.lineTo(24, -60); c.bezierCurveTo(44 + sw, -40, 48 + sw, -14, 44 + sw, -8); for (let i = 0; i < 6; i++) { const x0 = 44 + sw - i * 14.6; c.quadraticCurveTo(x0 - 7, 0, x0 - 14.6, -8); } c.bezierCurveTo(-48 + sw, -14, -44 + sw, -40, -24, -60); c.closePath();
    G._bb = { x0: -48, y0: -84, x1: 48, y1: 0 }; G.fillO(c, '#ff8fb1', 3);
    c.strokeStyle = '#3a3550'; c.lineWidth = 3; c.beginPath(); c.moveTo(-42 + sw, -12); c.quadraticCurveTo(0, -4, 42 + sw, -12); c.stroke();
    G.rr(c, -24, -66, 48, 8, 4); G.fillO(c, '#3a3550', 2);
    G.heart(c, 0, -74, 8); c.fillStyle = '#ffffff'; c.fill();
    for (const [x, y] of [[-24, -30], [20, -26], [0, -40]]) { G.heart(c, x + sw * 0.5, y, 6); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill(); }
    for (const s of [-1, 1]) { G.ell(c, s * 27, -80, 11, 9, s * 0.3); G.fillO(c, '#ffd1e0', 2); }
  };
  EXT.body.wizardrobe = robe('#3f5fc6', '#9fd8ff', (c, t, sw) => { c.fillStyle = '#ffe066'; for (const [x, y] of [[-20, -30], [18, -46], [6, -18]]) { G.star(c, x + sw * 0.5, y, 5.5, 2.4); c.fill(); } c.beginPath(); c.arc(-14, -56, 7, 0.6, PT.TAU - 0.6); c.quadraticCurveTo(-11, -56, -7, -61); c.closePath(); c.fill(); G.rr(c, -26, -58, 52, 7, 3); G.fillO(c, '#9fd8ff', 2); });
  EXT.body.witchgreen = robe('#4fa96a', '#ffb04a', (c, t, sw) => { for (const [x, y] of [[-18, -30], [18, -40], [0, -20]]) { G.circ(c, x + sw * 0.5, y, 6); G.fillO(c, '#ffb04a', 1.5); } G.rr(c, -26, -58, 52, 8, 4); G.fillO(c, '#8a5a2b', 2); });
  EXT.body.apprentice = robe('#6a4fc0', '#ffd23f', (c) => { G.rr(c, -12, -70, 24, 24, 4); G.fillO(c, '#ffd23f', 2); c.fillStyle = '#6a4fc0'; G.star(c, 0, -58, 7, 3); c.fill(); });
  /* ================= せなか ================= */
  const cloak = (col, lining, deco) => (c, ch, t) => {
    const fl = Math.sin((t || 0) * 0.008) * 6 + (ch && (ch.pose === 'run' || ch.pose === 'fly' || ch.pose === 'ride') ? 16 : 0);
    c.beginPath(); c.moveTo(-26, -90); c.quadraticCurveTo(-52 - fl, -44, -46 - fl, -2); c.lineTo(44 - fl * 0.3, -2); c.quadraticCurveTo(48, -48, 26, -90); c.closePath(); G._bb = { x0: -50, y0: -90, x1: 48, y1: -2 }; G.fillO(c, col, 3);
    c.fillStyle = lining; c.beginPath(); c.moveTo(-22, -84); c.quadraticCurveTo(-40 - fl, -44, -36 - fl, -8); c.lineTo(-24 - fl, -8); c.quadraticCurveTo(-28, -50, -14, -84); c.closePath(); c.fill();
    if (deco) deco(c, t, fl);
  };
  EXT.back.witchcape = cloak('#3a3550', '#9b6fd6', (c, t, fl) => { c.fillStyle = 'rgba(255,236,140,.85)'; for (const [x, y] of [[10, -40], [26, -22], [-10, -16]]) { G.star(c, x - fl * 0.3, y, 5, 2.2); c.fill(); } });
  EXT.back.starcape = cloak('#2f3f8f', '#ffd23f', (c, t, fl) => { c.fillStyle = '#ffe066'; for (const [x, y] of [[10, -50], [26, -24], [-10, -20], [0, -66], [30, -60]]) { G.star(c, x - fl * 0.3, y, 6, 2.6); c.fill(); } });
  EXT.back.pinkcape = cloak('#ff8fb1', '#ffffff', (c, t, fl) => { for (const [x, y] of [[10, -40], [24, -18], [-8, -14]]) { G.heart(c, x - fl * 0.3, y, 6); c.fillStyle = '#ffffff'; c.fill(); } });

  /* ================= アイテム ================= */
  const def = (id, o) => { PT.ITEMS[id] = Object.assign({ id, tags: ['magic', 'witch'], w: 90, h: 90 }, o); };
  const WR = (id, name, slot, kind, role, w, h, off) => def(id, { name, cat: 'dress', tags: ['magic', 'witch', slot === 'hat' ? 'hat' : slot], w, h, wear: [slot, kind], role,
    draw: (c, t) => { c.save(); c.translate(0, off); if (slot === 'body') EXT.body[kind](c, { wear: {}, pose: 'idle' }, t || 0); else if (slot === 'face') EXT.face[kind](c, {}, t || 0, 0); else if (slot === 'back') EXT.back[kind](c, { pose: 'idle' }, t || 0); else EXT.hat[kind](c, {}, t || 0); c.restore(); } });
  WR('witchblack', 'まじょの ぼうし', 'hat', 'witchblack', 'witch', 110, 110, 150);
  WR('witchpurple', 'むらさきの まじょの ぼうし', 'hat', 'witchpurple', 'witch', 110, 110, 150);
  WR('witchpink', 'ピンクの まじょの ぼうし', 'hat', 'witchpink', 'witch', 110, 110, 150);
  WR('witchbow', 'リボンの まじょの ぼうし', 'hat', 'witchbow', 'witch', 110, 110, 150);
  WR('witchgreen', 'みどりの まじょの ぼうし', 'hat', 'witchgreen', 'witch', 110, 110, 150);
  WR('wizardblue', 'まほうつかいの とんがりぼうし', 'hat', 'wizardblue', 'wizard2', 110, 120, 160);
  WR('apprentice', 'みならいの ぼうし', 'hat', 'apprentice', 'wizard2', 100, 70, 146);
  WR('witchdress', 'まじょの ドレス', 'body', 'witchdress', 'witch', 90, 90, 4);
  WR('witchpurplerobe', 'ほしの まじょの ドレス', 'body', 'witchpurple', 'witch', 90, 90, 4);
  WR('witchpinkdress', 'ピンクの まじょの ドレス', 'body', 'witchpink', 'witch', 100, 90, 4);
  WR('wizardrobe', 'まほうつかいの ローブ', 'body', 'wizardrobe', 'wizard2', 90, 90, 4);
  WR('witchgreenrobe', 'みどりの まじょの ローブ', 'body', 'witchgreen', 'witch', 90, 90, 4);
  WR('apprenticerobe', 'みならいの ローブ', 'body', 'apprentice', 'wizard2', 90, 90, 4);
  WR('witchcape', 'まじょの マント', 'back', 'witchcape', 'witch', 100, 100, 4);
  WR('starcape', 'ほしの マント', 'back', 'starcape', 'wizard2', 100, 100, 4);
  WR('pinkcape', 'ハートの マント', 'back', 'pinkcape', 'witch', 100, 100, 4);
  WR('roundglasses', 'まるめがね', 'face', 'roundglasses', 'wizard2', 90, 40, 104);
  WR('starglasses', 'ほしの めがね', 'face', 'starglasses', null, 100, 50, 104);

  const M = (id, name, w, h, draw, extra) => def(id, Object.assign({ name, cat: 'magic', w, h, draw }, extra || {}));
  M('starwand', 'ほしの ステッキ', 60, 110, (c, t) => { c.strokeStyle = '#c99a22'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -70); c.stroke(); const k = 1 + Math.sin((t || 0) * 0.006) * 0.08; c.save(); c.translate(0, -84); c.scale(k, k); G.star(c, 0, 0, 22, 10); G.fillO(c, '#ffe066', 3); c.restore(); G.rr(c, -10, -34, 20, 8, 4); G.fillO(c, '#ff8fb1', 2); });
  M('heartwand', 'ハートの ステッキ', 60, 110, (c, t) => { c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -70); c.stroke(); c.strokeStyle = '#ff8fb1'; c.lineWidth = 2; for (let y = -6; y > -66; y -= 12) { c.beginPath(); c.moveTo(-3, y); c.lineTo(3, y - 6); c.stroke(); } G.heart(c, 0, -80, 22); G.fillO(c, '#ff6f91', 3); G.circ(c, 0, -86, 5); c.fillStyle = '#ffffff'; c.fill(); });
  M('moonstaff', 'つきの つえ', 70, 160, (c, t) => { c.strokeStyle = '#8a5a3a'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(6, -70, 0, -120); c.stroke(); c.save(); c.translate(0, -138); c.fillStyle = '#ffe066'; c.beginPath(); c.arc(0, 0, 22, 0.7, PT.TAU - 0.7); c.quadraticCurveTo(6, 0, 14, -16); c.closePath(); c.fill(); c.strokeStyle = '#c99a22'; c.lineWidth = 2; c.stroke(); c.restore(); G.circ(c, 10, -138, 6); c.fillStyle = `rgba(159,216,255,${0.7 + 0.3 * Math.sin((t || 0) * 0.006)})`; c.fill(); });
  M('magicbroom', 'まほうの ほうき', 150, 60, (c) => { c.save(); c.translate(0, -26); c.rotate(-0.12); c.strokeStyle = '#8a5a3a'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(-70, 0); c.lineTo(40, 0); c.stroke(); c.beginPath(); c.moveTo(36, -8); c.lineTo(74, -20); c.lineTo(80, 0); c.lineTo(74, 20); c.lineTo(36, 8); c.closePath(); G._bb = { x0: 36, y0: -20, x1: 80, y1: 20 }; G.fillO(c, '#e9c26a', 2.5); c.strokeStyle = '#c99a42'; c.lineWidth = 1.5; for (let y = -14; y <= 14; y += 6) { c.beginPath(); c.moveTo(40, y * 0.5); c.lineTo(78, y); c.stroke(); } G.rr(c, 30, -8, 10, 16, 3); G.fillO(c, '#9b6fd6', 2); G.star(c, -60, -10, 6, 2.6); c.fillStyle = '#ffd23f'; c.fill(); c.restore(); }, { tags: ['magic', 'witch', 'broom', 'ride'] });
  M('cauldron', 'まほうの なべ', 140, 140, (c, t, st) => { const on = st && st.brew && (t || 0) < st.brew; for (const x of [-40, 40]) { c.strokeStyle = '#3a3550'; c.lineWidth = 8; c.beginPath(); c.moveTo(x, -10); c.lineTo(x * 1.2, 4); c.stroke(); } G.ell(c, 0, -50, 66, 50); G.fillO(c, '#3a3550', 3); G.ell(c, 0, -90, 62, 14); G.fillO(c, '#4a4560', 3); G.ell(c, 0, -90, 54, 10); c.fillStyle = on ? '#ff8fe0' : '#7fe08a'; c.fill(); for (let i = 0; i < (on ? 7 : 4); i++) { const k = (((t || 0) * 0.0007 * (on ? 2 : 1) + i * 0.27) % 1); G.circ(c, -30 + ((i * 23) % 60), -96 - k * (on ? 90 : 50), 6 + k * 6); c.fillStyle = on ? `rgba(255,170,240,${1 - k})` : `rgba(140,230,150,${1 - k})`; c.fill(); } c.fillStyle = 'rgba(255,170,90,.8)'; for (let i = 0; i < 3; i++) { G.ell(c, -20 + i * 20, -2, 8, 12 + Math.sin((t || 0) * 0.02 + i) * 3); c.fill(); } }, { tags: ['magic', 'witch', 'pot'] });
  M('spellbook', 'まほうの ほん', 100, 70, (c, t) => { G.rr(c, -46, -40, 92, 30, 6); G.fillO(c, '#6a4fc0', 3); c.beginPath(); c.moveTo(-44, -44); c.quadraticCurveTo(-22, -54, 0, -44); c.quadraticCurveTo(22, -54, 44, -44); c.lineTo(44, -38); c.quadraticCurveTo(22, -48, 0, -38); c.quadraticCurveTo(-22, -48, -44, -38); c.closePath(); c.fillStyle = '#fff8e8'; c.fill(); c.strokeStyle = '#d6c4a8'; c.lineWidth = 1.5; c.stroke(); c.fillStyle = '#ffd23f'; G.star(c, 0, -24, 8, 3.4); c.fill(); for (let i = 0; i < 4; i++) { const k = (((t || 0) * 0.0006 + i * 0.25) % 1); c.fillStyle = `rgba(255,236,140,${1 - k})`; G.star(c, -20 + i * 14, -54 - k * 40, 4, 1.8); c.fill(); } });
  M('potion', 'まほうの くすり', 60, 90, (c, t) => { G.circ(c, 0, -30, 26); c.fillStyle = 'rgba(230,240,255,.8)'; c.fill(); c.strokeStyle = '#9fc8f0'; c.lineWidth = 2.5; c.stroke(); c.save(); G.circ(c, 0, -30, 23); c.clip(); c.fillStyle = '#ff7ad9'; c.fillRect(-26, -34 + Math.sin((t || 0) * 0.004) * 2, 52, 40); c.restore(); G.rr(c, -8, -70, 16, 20, 4); G.fillO(c, '#e8f2ff', 2); G.rr(c, -10, -78, 20, 10, 4); G.fillO(c, '#a8733f', 2); c.fillStyle = 'rgba(255,255,255,.7)'; G.ell(c, -10, -38, 5, 8, 0.4); c.fill(); G.heart(c, 6, -24, 5); c.fillStyle = '#fff'; c.fill(); });
  M('potion2', 'ふしぎな くすり', 60, 90, (c, t) => { c.beginPath(); c.moveTo(-8, -66); c.lineTo(-8, -50); c.lineTo(-26, -8); c.quadraticCurveTo(0, 2, 26, -8); c.lineTo(8, -50); c.lineTo(8, -66); c.closePath(); G._bb = null; c.fillStyle = 'rgba(230,240,255,.8)'; c.fill(); c.strokeStyle = '#9fc8f0'; c.lineWidth = 2.5; c.stroke(); c.save(); c.clip(); c.fillStyle = '#5ad0a0'; c.fillRect(-30, -32, 60, 40); c.restore(); G.rr(c, -10, -74, 20, 10, 4); G.fillO(c, '#a8733f', 2); for (let i = 0; i < 3; i++) { const k = (((t || 0) * 0.0008 + i * 0.33) % 1); G.circ(c, -4 + i * 4, -70 - k * 30, 3 + k * 2); c.fillStyle = `rgba(90,208,160,${1 - k})`; c.fill(); } });
  M('crystalball', 'すいしょうだま', 90, 100, (c, t) => { G.rr(c, -34, -20, 68, 20, 8); G.fillO(c, '#8a5a3a', 3); G.circ(c, 0, -56, 38); c.fillStyle = G.rgrad(c, -12, -70, 2, 40, [[0, '#ffffff'], [0.5, '#c9b2ff'], [1, '#7a5ad0']]); c.fill(); c.strokeStyle = '#6a4fc0'; c.lineWidth = 2.5; c.stroke(); for (let i = 0; i < 4; i++) { const a = (t || 0) * 0.002 + i * 1.6; c.fillStyle = 'rgba(255,255,255,.8)'; G.star(c, Math.cos(a) * 20, -56 + Math.sin(a) * 14, 4, 1.6); c.fill(); } });
  M('magichat', 'うさぎの でる ぼうし', 100, 110, (c, t) => { G.ell(c, 0, -6, 46, 10); G.fillO(c, '#3a3550', 3); G.rr(c, -32, -80, 64, 74, 6); G.fillO(c, '#3a3550', 3); G.rr(c, -32, -30, 64, 12, 2); c.fillStyle = '#e2434b'; c.fill(); const k = Math.max(0, Math.sin((t || 0) * 0.002)) * 14; for (const s of [-1, 1]) { G.ell(c, s * 9, -92 - k, 7, 18); G.fillO(c, '#ffffff', 2); G.ell(c, s * 9, -92 - k, 3, 12); c.fillStyle = '#ffc4d6'; c.fill(); } });
  M('blackcat', 'くろねこ', 90, 90, (c, t) => { const tw = Math.sin((t || 0) * 0.005) * 0.4; c.strokeStyle = '#3a3550'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(26, -14); c.quadraticCurveTo(50, -30 + tw * 20, 40, -60); c.stroke(); G.ell(c, 0, -24, 30, 22); G.fillO(c, '#3a3550', 3); G.circ(c, -18, -54, 20); G.fillO(c, '#3a3550', 3); for (const s of [-1, 1]) { G.poly(c, [-18 + s * 6, -70, -18 + s * 18, -80, -18 + s * 16, -62]); c.fillStyle = '#3a3550'; c.fill(); } c.fillStyle = '#ffd23f'; G.ell(c, -25, -56, 4, 5); c.fill(); G.ell(c, -11, -56, 4, 5); c.fill(); c.fillStyle = '#2a1f35'; G.ell(c, -25, -56, 1.5, 4); c.fill(); G.ell(c, -11, -56, 1.5, 4); c.fill(); G.rr(c, -30, -40, 24, 6, 3); c.fillStyle = '#ff6f91'; c.fill(); G.circ(c, -18, -34, 4); c.fillStyle = '#ffd23f'; c.fill(); }, { tags: ['magic', 'witch', 'plush', 'cat'] });
  M('owl', 'ふくろう', 70, 100, (c, t) => { const bl = ((t || 0) % 3000) < 140; G.ell(c, 0, -40, 26, 34); G.fillO(c, '#a8733f', 3); G.ell(c, 0, -34, 16, 22); c.fillStyle = '#f0d9a0'; c.fill(); for (const s of [-1, 1]) { G.circ(c, s * 11, -58, 10); c.fillStyle = '#ffffff'; c.fill(); if (bl) { c.strokeStyle = '#2a1f35'; c.lineWidth = 2; c.beginPath(); c.moveTo(s * 11 - 6, -58); c.lineTo(s * 11 + 6, -58); c.stroke(); } else { G.circ(c, s * 11, -58, 5); c.fillStyle = '#2a1f35'; c.fill(); } G.poly(c, [s * 10, -76, s * 22, -86, s * 22, -70]); c.fillStyle = '#a8733f'; c.fill(); } G.poly(c, [-4, -50, 4, -50, 0, -44]); c.fillStyle = '#ffb04a'; c.fill(); });
  M('jackolantern', 'かぼちゃの ランタン', 90, 90, (c, t) => { c.strokeStyle = '#5c9e3e'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, -66); c.quadraticCurveTo(4, -80, 12, -82); c.stroke(); for (const [x, w] of [[-20, 22], [20, 22], [0, 26]]) { G.ell(c, x, -36, w, 32); G.fillO(c, '#ff9a3d', 3); } const g = 0.7 + 0.3 * Math.sin((t || 0) * 0.008); c.fillStyle = `rgba(255,230,120,${g})`; G.poly(c, [-20, -46, -8, -46, -14, -56]); c.fill(); G.poly(c, [8, -46, 20, -46, 14, -56]); c.fill(); c.beginPath(); c.moveTo(-20, -28); c.lineTo(-12, -20); c.lineTo(-4, -28); c.lineTo(4, -20); c.lineTo(12, -28); c.lineTo(20, -20); c.quadraticCurveTo(0, -6, -20, -28); c.fill(); }, { tags: ['magic', 'witch', 'light', 'halloween'] });
  M('candybag', 'おかしの バケツ', 80, 90, (c) => { G.rr(c, -30, -60, 60, 58, 14); G.fillO(c, '#ff9a3d', 3); c.strokeStyle = '#3a3550'; c.lineWidth = 3; c.beginPath(); c.arc(0, -64, 26, Math.PI, 0); c.stroke(); for (const [x, col] of [[-14, '#ff6f91'], [2, '#58b9f0'], [16, '#ffd23f']]) { G.circ(c, x, -64, 7); G.fillO(c, col, 2); } c.fillStyle = '#3a3550'; G.poly(c, [-14, -40, -6, -40, -10, -48]); c.fill(); G.poly(c, [6, -40, 14, -40, 10, -48]); c.fill(); }, { tags: ['magic', 'halloween', 'food'] });

  const NEW = ['witchblack', 'witchpurple', 'witchpink', 'witchbow', 'witchgreen', 'wizardblue', 'apprentice', 'witchdress', 'witchpurplerobe', 'witchpinkdress', 'wizardrobe', 'witchgreenrobe', 'apprenticerobe', 'witchcape', 'starcape', 'pinkcape', 'roundglasses', 'starglasses', 'starwand', 'heartwand', 'moonstaff', 'magicbroom', 'cauldron', 'spellbook', 'potion', 'potion2', 'crystalball', 'magichat', 'blackcat', 'owl', 'jackolantern', 'candybag'];
  PT.WITCH_ITEMS = NEW;
  ['forest', 'camp'].forEach((sid) => { const st = PT.stageById && PT.stageById(sid); if (st) st.favs = NEW.slice(0, 12).concat(st.favs || []); });

  /* ================= あそび ================= */
  const W = PT.world, R = PT.R, D = R.D, X = PT.FX;
  if (!R || !R.h || !R.h.isP) return;
  const { isP, isC, nearP, tag } = R.h;
  const A = PT.audio;
  const witchy = (ch) => ch && (ch.role === 'witch' || ch.role === 'wizard2' || ch.role === 'wizard' || /witch|wizard|apprentice/.test(ch.wear.hat || ''));
  const caster = (x, y, excl = []) => W.chars().find((c) => witchy(c) && !excl.includes(c) && W.isFree(c)) || R.free(x, y, excl, 1600)[0] || null;
  const dressUp = (ch) => { if (!witchy(ch)) { ch.wear = Object.assign({}, ch.wear, { hat: PT.pick(['witchpurple', 'witchpink', 'witchblack']), body: ch.wear.body || PT.pick(['witchdress', 'witchpink', 'witchpurple']) }); ch.role = 'witch'; W.burst('spark', ch.x, ch.y - 120, 10, { sp: 0.2, max: 700, size: 10, col: '#c9a0ff', g: 0 }); } };
  D('d_witch2', 'まじょっこ たんじょう', 'まじょの ぼうしと ドレスで「ちちんぷいぷい！」', ['witchpink', 'witchpinkdress']);
  D('d_wizard2', 'まほうつかいの しゅぎょう', 'ローブを きて ほしの まほうを れんしゅう', ['wizardblue', 'wizardrobe']);
  D('d_fly', 'ほうきで おそらへ', 'まほうの ほうきで くるっと ひとまわり', ['magicbroom', 'witchblack']);
  D('d_cauldron', 'まほうの なべで ぐつぐつ', 'なべに たべものを いれると なにかに へんしん！', ['cauldron', 'apple']);
  D('d_potion', 'ふしぎな くすり', 'のむと からだが ちいさく…おおきく…？', ['potion', 'pyoko']);
  D('d_crystal', 'すいしょうだまの うらない', 'すいしょうだまを のぞくと みらいが みえる', ['crystalball', 'mimi']);
  D('d_rabbithat', 'ぼうしから うさぎ', 'ぼうしを タップすると うさぎが ぴょこっ', ['magichat', 'pyoko']);
  D('d_spellbook', 'まほうの ほん', 'ほんを ひらくと ほしが まいあがる', ['spellbook', 'gaku']);
  D('d_blackcat', 'まじょの あいぼう', 'くろねこが まじょの かたに ちょこん', ['blackcat', 'witchblack']);
  D('d_wandshow', 'ステッキで へんしん', 'ステッキを ふると ともだちが まじょっこに', ['starwand', 'heartwand']);
  D('d_halloween', 'トリック・オア・トリート', 'かぼちゃと おかしの バケツで ハロウィン', ['jackolantern', 'candybag']);

  R.ROLES.witch = (ch) => {
    R.claim(ch, 5000).say('まじょっこ さんじょう！', 'witchpink', 1400, 'yay').pose('spin', 900).do(() => { A.sfx('magic'); X.sparkleRain(2000); R.found('d_witch2'); R.magic && R.magic(ch); });
  };
  R.ROLES.wizard2 = (ch) => {
    R.claim(ch, 5000).say('ほしよ あつまれ〜', 'wizardblue', 1500, 'talk').pose('point', 900).do(() => { A.sfx('magic'); for (let i = 0; i < 6; i++) W.after(i * 120, () => W.burst('star', ch.x + PT.rand(-200, 200), ch.y - PT.rand(150, 300), 3, { sp: 0.15 })); R.found('d_wizard2'); });
    R.mimic(ch, 'point', 1200, 'わたしも まほう！');
  };
  const fly = (ch, broom) => {
    if (broom) { W.remove(broom); }
    ch.holdType = 'magicbroom'; A.sfx('whoosh');
    const sx = ch.x, sy = ch.y;
    R.claim(ch, 5000).say('おそらへ しゅっぱつ！', 'magicbroom', 1200, 'yay').do(() => {
      R.tween(ch, 3400, (k) => { const a = k * PT.TAU; ch.x = sx + Math.sin(a) * 320; ch.z = Math.sin(k * Math.PI) * 260 + Math.sin(a * 2) * 30; ch.pose = 'ride'; ch.flip = Math.cos(a) < 0; if (Math.random() < 0.35) W.burst('spark', ch.x, ch.y - ch.z - 30, 1, { sp: 0.05, max: 700, col: PT.pick(['#ffd23f', '#ff8fe0', '#9fd8ff']), g: 0 }); }, () => { ch.z = 0; ch.x = sx; ch.y = sy; ch.holdType = null; W.addProp('magicbroom', sx + 60, sy + 4); R.found('d_fly'); R.claim(ch, 1500).say('たのしかった！', 'star', 1200, 'yay'); });
    });
    R.audience(sx, sy, [ch], 'wow', 2, 1200);
  };
  R.add({ id: 'magicbroom', pri: 60, test: (c) => (isP(c.e, 'magicbroom') ? (isC(c.tgt) ? c.tgt : caster(c.e.x, c.e.y)) : null), run(c, ch) { dressUp(ch); fly(ch, c.e); } });
  R.add({ id: 'broom-witch2', pri: 55, test: (c) => (isP(c.e, 'broom') ? W.chars().find((x) => witchy(x) && x.wear.hat !== 'witch') || null : null), run(c, ch) { R.claim(ch, 3000).to(c.e, -40, 4, true).do(() => fly(ch, c.e)); } });
  R.add({ id: 'witch-char-broom', pri: 77, test: (c) => (isC(c.e) && isP(c.tgt, 'magicbroom') ? c.tgt : null), run(c, b) { dressUp(c.e); fly(c.e, b); } });
  // なべ
  const BREW = { apple: 'cake', banana: 'icecream', carrot: 'cake', onigiri: 'donut', bread: 'pancake', strawberry: 'candy', egg: 'present', acorn: 'flower', shell: 'star', teddy: 'unicorn', ball: 'balloon', pumpkin: 'carriage', cookie: 'royalcake', juice: 'potion', flower: 'butterflybox' };
  R.add({ id: 'cauldron-in', pri: 75, test: (c) => (c.e.kind === 'prop' && !isP(c.e, 'cauldron') ? (c.tgt && isP(c.tgt, 'cauldron') ? c.tgt : nearP(c.e.x, c.e.y, 120, (p) => p.type === 'cauldron')[0] || null) : null),
    run(c, pot) {
      const it = c.e; const to = BREW[it.type] && PT.ITEMS[BREW[it.type]] ? BREW[it.type] : PT.pick(['star', 'balloon', 'present', 'cake', 'potion', 'crystalball', 'rainbow']);
      W.remove(it); pot.brew = W.t + 2200; A.sfx('bubble'); W.after(400, () => A.sfx('bubble'));
      const ch = caster(pot.x, pot.y); if (ch) { dressUp(ch); R.claim(ch, 4000).to(pot, -90, 4, true).look(pot.x).say('ぐつぐつ…まぜまぜ', 'cauldron', 1500, 'talk').pose('hold', 1200).say('できあがり！', 'star', 1300, 'yay'); }
      W.after(2100, () => { A.sfx('magic'); const p = W.addProp(PT.ITEMS[to] ? to : 'star', pot.x + 110, pot.y + 20); p.pop = W.t; W.burst('spark', pot.x, pot.y - 120, 14, { sp: 0.25, col: '#ff8fe0', g: 0 }); W.burst('smoke', pot.x, pot.y - 110, 8, { sp: 0.12, col: '#e0c0ff', g: 0, up: true }); R.found('d_cauldron'); });
    } });
  R.add({ id: 'cauldron-tap', on: 'tapprop', pri: 60, test: (c) => (isP(c.e, 'cauldron') ? c.e : null), run(c, pot) { pot.brew = W.t + 1500; A.sfx('bubble'); W.burst('smoke', pot.x, pot.y - 110, 6, { sp: 0.1, col: '#c0f0c8', g: 0, up: true }); } });
  // くすり
  R.add({ id: 'potion-drink', pri: 80, test: (c) => (isP(c.e, ['potion', 'potion2']) ? (isC(c.tgt) ? c.tgt : R.one(c.e.x, c.e.y)) : null),
    run(c, ch) {
      const big = c.e.type === 'potion2'; W.remove(c.e);
      R.claim(ch, 5000).pose('eat', 900).say('ごくごく…', c.e.type, 1100, 'talk').do(() => {
        A.sfx(big ? 'boing' : 'magic'); const s0 = ch.scale;
        R.tween(ch, 2600, (k) => { const m = Math.sin(k * Math.PI); ch.scale = s0 * (big ? 1 + m * 0.6 : 1 - m * 0.5); }, () => { ch.scale = W.depthScale(ch.y); R.found('d_potion'); });
      }).say(big ? 'おおきく なった〜！' : 'ちいさく なった〜！', '!', 1500, 'wow').face('laugh', 1200);
      R.audience(ch.x, ch.y, [ch], 'laugh', 2, 1200);
    } });
  // すいしょうだま・ほん・ぼうし
  const FUTURE = [['おおきな ケーキが みえる！', 'cake'], ['にじが でるって！', 'rainbow'], ['あしたも たのしい ひ！', 'star'], ['おともだちが ふえる！', 'heart'], ['ゆきが ふるかも！', 'snow']];
  R.add({ id: 'crystal-tap', on: 'tapprop', pri: 60, test: (c) => (isP(c.e, 'crystalball') ? caster(c.e.x, c.e.y) || 1 : null),
    run(c, ch) { const b = c.e; A.sfx('magic'); W.burst('spark', b.x, b.y - 60, 10, { sp: 0.15, col: '#c9b2ff', g: 0 }); const [txt, ic] = PT.pick(FUTURE); if (ch && ch !== 1) R.claim(ch, 4000).to(b, -80, 4, true).look(b.x).pose('think', 1200).say('むむむ…', 'crystalball', 1200, 'hmm').say(txt, ic, 1600, 'yay').do(() => { if (ic === 'rainbow') X.rainbow(4000); if (ic === 'snow') X.sparkleRain(2000); R.found('d_crystal'); }); else R.found('d_crystal'); } });
  R.add({ id: 'crystal-drop', pri: 58, test: (c) => (isP(c.e, 'crystalball') ? caster(c.e.x, c.e.y) : null), run(c, ch) { R.list.find((r) => r.id === 'crystal-tap').run(c, ch); } });
  R.add({ id: 'spellbook', pri: 58, test: (c) => (isP(c.e, 'spellbook') ? caster(c.e.x, c.e.y) : null),
    run(c, ch) { const bk = c.e; R.claim(ch, 4500).to(bk, -70, 4, true).look(bk.x).pose('peek', 1000).say('ええと…ほしの じゅもん！', 'spellbook', 1500, 'talk').do(() => { A.sfx('magic'); for (let i = 0; i < 8; i++) W.after(i * 90, () => W.burst('star', bk.x + PT.rand(-40, 40), bk.y - 60, 2, { up: true, sp: 0.2 })); X.sparkleRain(1800); R.found('d_spellbook'); }).pose('cheer', 900); } });
  R.add({ id: 'spellbook-tap', on: 'tapprop', pri: 58, test: (c) => (isP(c.e, 'spellbook') ? c.e : null), run(c, bk) { A.sfx('sparkle'); W.burst('star', bk.x, bk.y - 60, 6, { up: true, sp: 0.2 }); R.found('d_spellbook'); } });
  R.add({ id: 'magichat-tap', on: 'tapprop', pri: 60, test: (c) => (isP(c.e, 'magichat') ? c.e : null),
    run(c, hat) { A.sfx('pop'); W.burst('spark', hat.x, hat.y - 90, 10, { sp: 0.2, g: 0 }); const out = PT.pick(['bunny', 'duck', 'balloon', 'flower', 'present', 'blackcat', 'owl']); const p = W.addProp(out, hat.x + PT.rand(-80, 80), hat.y + 20); p.pop = W.t; const py = W.charOf('pyoko'); if (out === 'bunny' && py && W.isFree(py)) R.claim(py, 2500).look(hat.x).say('なかま！？', '!', 1300, 'wow'); R.found('d_rabbithat'); } });
  R.add({ id: 'magichat-drop', pri: 57, test: (c) => (isP(c.e, 'magichat') ? 1 : null), run(c) { R.list.find((r) => r.id === 'magichat-tap').run(c, c.e); } });
  R.add({ id: 'blackcat-witch', pri: 79, test: (c) => (isP(c.e, ['blackcat', 'owl']) ? (isC(c.tgt) ? c.tgt : W.chars().find((x) => witchy(x)) || null) : null),
    run(c, ch) { const t = c.e.type; W.remove(c.e); ch.headItem = t; A.sfx(t === 'owl' ? 'ghost' : 'tickle'); R.claim(ch, 3000).say(t === 'owl' ? 'ホーホー！' : 'ニャーン♪', 'heart', 1300, 'laugh').face('love', 1200).do(() => { R.found('d_blackcat'); W.after(4000, () => { if (ch.headItem === t) { ch.headItem = null; W.addProp(t, ch.x + 60, ch.y); } }); }); } });
  R.add({ id: 'wand-transform', pri: 62, test: (c) => (isP(c.e, ['starwand', 'heartwand', 'moonstaff']) ? (isC(c.tgt) ? c.tgt : caster(c.e.x, c.e.y)) : null),
    run(c, ch) {
      const wd = c.e; W.remove(wd); dressUp(ch); ch.holdType = wd.type;
      const tgts = R.free(ch.x, ch.y, [ch], 1400).slice(0, 2);
      const a = R.claim(ch, 6000).say('ちちんぷいぷい〜！', wd.type, 1400, 'yay').pose('point', 700);
      tgts.forEach((o, i) => a.do(() => { X.beam(ch.x, ch.y - 110 * ch.scale, o.x, o.y - 80, 700); W.after(500, () => { o.wear = Object.assign({}, o.wear, { hat: PT.pick(['witchpink', 'witchpurple', 'witchbow', 'witchgreen', 'wizardblue', 'apprentice']), body: PT.pick(['witchdress', 'witchpink', 'witchpurple', 'wizardrobe', 'witchgreen', 'apprentice']), back: PT.pick(['witchcape', 'starcape', 'pinkcape']) }); o.role = 'witch'; W.burst('spark', o.x, o.y - 120, 12, { sp: 0.2, col: '#ffd23f', g: 0 }); A.sfx('sparkle'); R.claim(o, 2000).pose('spin', 900).say('まじょっこに なった！', 'star', 1300, 'yay'); }); }).wait(900));
      a.do(() => { ch.holdType = null; W.addProp(wd.type, ch.x + 60, ch.y); R.found('d_wandshow'); });
    } });
  R.add({ id: 'halloween', pri: 59, test: (c) => (isP(c.e, ['jackolantern', 'candybag']) ? R.free(c.e.x, c.e.y, [], 1600).slice(0, 3) : null),
    run(c, cs) { if (!cs.length) return; A.sfx('ghost'); cs.forEach((ch, i) => { if (!ch.wear.hat) ch.wear = Object.assign({}, ch.wear, { hat: PT.pick(['witchblack', 'witchpurple', 'witchpink']) }); R.claim(ch, 4500).wait(i * 300).to(c.e, -100 + i * 90, 10, true).say('トリック・オア・トリート！', 'candybag', 1500, 'yay').pose('cheer', 800).do(() => { W.burst('heart', ch.x, ch.y - 120, 3, { up: true }); }); }); W.after(2500, () => R.found('d_halloween')); } });
  (PT.ROYAL_ODAI || []).push(['まじょや まほうつかいに なって まほうを かけよう', ['d_witch2', 'd_wizard2', 'd_fly', 'd_cauldron', 'd_wandshow'], ['witchpink', 'magicbroom']]);
})();
