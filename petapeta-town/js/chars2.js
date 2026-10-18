/* キャラクターの バリエーション：どうぶつの なかま と にんげんの ともだち */
'use strict';
(() => {
  const G = PT.G, X = PT.CHAR_EXT, HX = PT.HUMAN_EXT;
  const SKIN = '#ffe0cc';

  Object.assign(PT.CHARS, {
    nyan: { id: 'nyan', name: 'ニャン', color: '#c9ced8', dark: '#8a92a6', belly: '#ffffff', muzzle: '#ffffff', ear: 'cat', size: 0.92, voice: 760,
      tag: 'きまぐれ', likes: 'ひなたぼっこ・ボール', acc: 'cat', accColor: '#ffb3c8', badge: '#c9ced8', tail: 'stripe', lash: true },
    panda: { id: 'panda', name: 'パンちゃん', color: '#f8f8fb', dark: '#3a3a4a', belly: '#ffffff', muzzle: '#ffffff', ear: 'round', size: 1.02, voice: 330,
      tag: 'くいしんぼう', likes: 'ささ・ごろごろ', acc: 'panda', badge: '#3a3a4a', eyePatch: '#3a3a4a' },
    penta: { id: 'penta', name: 'ペンタ', color: '#4a5a8a', dark: '#2f3a63', belly: '#ffffff', muzzle: '#ffffff', ear: 'none', size: 0.9, voice: 600,
      tag: 'がんばりや', likes: 'すべる・およぐ', acc: 'beak', badge: '#4a5a8a', tail: 'none' },
    kon: { id: 'kon', name: 'コン', color: '#ff8a3d', dark: '#c4531c', belly: '#fff4e6', muzzle: '#ffffff', ear: 'fox', size: 0.96, voice: 540,
      tag: 'いたずらずき', likes: 'かくれんぼ・へんしん', acc: 'fox', badge: '#ff8a3d', tail: 'fox' },
    yume: { id: 'yume', name: 'ユメ', color: '#fbf6ff', dark: '#d9b8f0', belly: '#ffffff', muzzle: '#fff0f8', ear: 'pony', size: 0.98, voice: 700,
      tag: 'ゆめみがち', likes: 'にじ・きらきら', acc: 'unicorn', badge: '#e2c8ff', tail: 'rainbow', lash: true },
    jiji: { id: 'jiji', name: 'おじいちゃん', human: true, color: SKIN, size: 1.0, voice: 220, legExt: 24, smileEyes: true, bigSmile: true,
      legCol: '#8a7a6a', shoe: '#5a3a2a', sleeve: '#7fa86a', tag: 'ものしり', likes: 'てじな・むかしばなし', badge: '#7fa86a' },
    baba: { id: 'baba', name: 'おばあちゃん', human: true, color: SKIN, size: 0.94, voice: 520, legExt: 12, smileEyes: true, bigSmile: true,
      shoe: '#a8506a', sleeve: '#b39ae8', tag: 'やさしい', likes: 'あみもの・おかし', badge: '#b39ae8' },
    yuto: { id: 'yuto', name: 'ゆうと', human: true, color: SKIN, size: 0.96, voice: 560, legExt: 0, bigSmile: true,
      legCol: SKIN, shoe: '#4c9be8', sleeve: '#58c46b', iris: '#3a5a8a', tag: 'げんき', likes: 'サッカー・きょうりゅう', badge: '#58c46b' },
    sakura: { id: 'sakura', name: 'さくら', human: true, color: SKIN, size: 0.94, voice: 660, legExt: 0, lash: true,
      legCol: SKIN, shoe: '#ff6f91', sleeve: '#ffd23f', iris: '#8a5a2b', tag: 'しっかりもの', likes: 'なわとび・おえかき', badge: '#ffd23f' },
  });
  PT.CHAR_IDS = Object.keys(PT.CHARS);

  /* ---------- どうぶつの パーツ ---------- */
  X.earFront.cat = (c, P, t, ch) => {
    const w = Math.sin(t * 0.007 + ch.seed) * 0.06;
    for (const s of [-1, 1]) { c.save(); c.translate(s * 30, -150); c.rotate(s * (0.18 + w)); G.poly(c, [-18, 8, -2, -34, 18, 8]); G.fillO(c, P.color, 3); G.poly(c, [-9, 4, -2, -20, 9, 4]); c.fillStyle = '#ffc6d6'; c.fill(); c.restore(); }
    // しまもよう
    c.strokeStyle = P.dark; c.lineWidth = 4; c.lineCap = 'round';
    for (const x of [-10, 0, 10]) { c.beginPath(); c.moveTo(x, -160); c.lineTo(x * 0.8, -146); c.stroke(); }
  };
  X.acc.cat = (c, P, ch, t, lx) => {
    c.strokeStyle = '#8a92a6'; c.lineWidth = 2; c.lineCap = 'round';
    for (const s of [-1, 1]) for (const k of [-4, 3]) { c.beginPath(); c.moveTo(s * 16 + lx, -100 + k); c.lineTo(s * 40 + lx, -104 + k * 1.6); c.stroke(); }
    G.circ(c, -26, -76, 0.1);
  };
  X.body.cat = (c, P) => { G.rr(c, -22, -88, 44, 9, 4); G.fillO(c, '#ff6f91', 2); G.circ(c, 0, -76, 6); G.fillO(c, '#ffd23f', 2); };
  X.tail.stripe = (c, P, t, ch, pp) => {
    c.save(); c.translate(-20, -40); c.rotate(-0.6 + pp.tail);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-30, -10, -30, -48);
    c.strokeStyle = PT.line(P.color); c.lineWidth = 15; c.lineCap = 'round'; c.stroke(); c.strokeStyle = P.color; c.lineWidth = 10; c.stroke();
    c.strokeStyle = P.dark; c.lineWidth = 10; for (const k of [0.35, 0.65, 0.9]) { const x = -30 * (2 * (1 - k) * k) - 30 * k * k, y = -10 * 2 * (1 - k) * k - 48 * k * k; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 4, y); c.stroke(); }
    c.restore();
  };
  X.acc.panda = () => {};
  X.body.panda = (c, P) => { for (const s of [-1, 1]) { G.ell(c, s * 24, -70, 10, 14, s * 0.3); c.fillStyle = '#3a3a4a'; c.fill(); } };
  X.earBack.none = () => {}; X.earFront.none = () => {};
  X.acc.beak = (c, P, ch, t, lx) => {
    G.poly(c, [-12 + lx, -108, 12 + lx, -108, lx, -94]); G.fillO(c, '#ffb02e', 2.5);
    c.strokeStyle = 'rgba(160,90,10,.6)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-9 + lx, -104); c.lineTo(9 + lx, -104); c.stroke();
    // ちいさな ぼうし（ニット）
    c.save(); c.translate(0, -152); G.ell(c, 0, 0, 34, 12); G.fillO(c, '#ff6f61', 2.5); G.circ(c, 0, -16, 9); G.fillO(c, '#ffffff', 2); c.restore();
  };
  X.body.beak = (c, P) => { for (const s of [-1, 1]) { G.ell(c, s * 30, -54, 8, 22, s * 0.25); G.fillO(c, P.dark, 2.5); } G.rr(c, -12, -4, 10, 6, 3); };
  X.tail.none = () => {};
  X.earFront.fox = (c, P, t, ch) => {
    const w = Math.sin(t * 0.006 + ch.seed) * 0.06;
    for (const s of [-1, 1]) { c.save(); c.translate(s * 28, -150); c.rotate(s * (0.3 + w)); G.poly(c, [-20, 10, 0, -48, 20, 10]); G.fillO(c, P.color, 3); G.poly(c, [-10, 6, 0, -32, 10, 6]); c.fillStyle = '#ffffff'; c.fill(); G.poly(c, [-6, -32, 0, -48, 6, -32]); c.fillStyle = '#3a2a2a'; c.fill(); c.restore(); }
  };
  X.acc.fox = (c, P, ch, t, lx) => { c.fillStyle = '#ffffff'; for (const s of [-1, 1]) { G.ell(c, s * 30 + lx, -104, 16, 12, s * -0.3); c.fill(); } };
  X.body.fox = (c, P) => { G.rr(c, -22, -88, 44, 9, 4); G.fillO(c, '#4c9be8', 2); };
  X.tail.fox = (c, P, t, ch, pp) => {
    c.save(); c.translate(-18, -38); c.rotate(-0.5 + pp.tail * 0.7);
    G.blob(c, [0, 0, -26, -10, -46, -36, -40, -62, -20, -50, -6, -24]); G.fillO(c, P.color, 3);
    G.blob(c, [-36, -44, -46, -52, -40, -62, -28, -56]); c.fillStyle = '#ffffff'; c.fill();
    c.restore();
  };
  X.earFront.pony = (c, P, t, ch) => {
    for (const s of [-1, 1]) { c.save(); c.translate(s * 30, -150); c.rotate(s * 0.35); G.ell(c, 0, -12, 9, 18); G.fillO(c, P.color, 3); G.ell(c, 0, -10, 4, 11); c.fillStyle = '#ffc6e6'; c.fill(); c.restore(); }
    // つの
    c.save(); c.translate(0, -158);
    c.beginPath(); c.moveTo(-9, 2); c.lineTo(0, -44); c.lineTo(9, 2); c.closePath();
    c.fillStyle = G.grad(c, 0, -44, 0, 2, [[0, '#fff6c2'], [0.5, '#ffd54a'], [1, '#e3a21a']]); c.fill(); c.strokeStyle = '#b9780c'; c.lineWidth = 2.4; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-7 + i * 1.6, -4 - i * 10); c.lineTo(6 - i * 1.6, -10 - i * 10); c.stroke(); }
    c.restore();
  };
  X.earBack.pony = (c, P, t, ch) => {
    // にじいろの たてがみ
    const cols = ['#ff9ec0', '#ffd59a', '#fff3a6', '#bff0c0', '#bfe3ff', '#d9c4ff'];
    cols.forEach((col, i) => { G.ell(c, -34 - i * 2, -146 + i * 14, 16, 13, -0.6); G.fillO(c, col, 2); });
    cols.forEach((col, i) => { if (i < 3) { G.ell(c, -6 + i * 14, -158 + i * 2, 14, 10, 0.3); G.fillO(c, col, 2); } });
  };
  X.acc.unicorn = (c, P, ch, t, lx) => { K2.twinkle(c, 30, -170, 7, t, ch.seed); };
  X.body.unicorn = (c, P) => { G.rr(c, -22, -88, 44, 9, 4); G.fillO(c, '#d9b8f0', 2); G.star(c, 0, -76, 7, 3); G.fillO(c, '#ffd54a', 1.5); };
  X.tail.rainbow = (c, P, t, ch, pp) => {
    c.save(); c.translate(-20, -40); c.rotate(-0.6 + pp.tail);
    ['#ff9ec0', '#fff3a6', '#bfe3ff', '#d9c4ff'].forEach((col, i) => { G.ell(c, -14 - i * 6, -14 - i * 12, 14, 9, -0.9); G.fillO(c, col, 2); });
    c.restore();
  };
  const K2 = { twinkle: (c, x, y, s, t, ph) => PT.ROYAL ? PT.ROYAL.twinkle(c, x, y, s, t, ph) : null };

  /* ---------- にんげんの ともだち ---------- */
  const HAIR_W = '#e9e9ef';
  HX.hairBack.jiji = () => {};
  HX.hairFront.jiji = (c, P, ch, t) => {
    // しろい かみ（よこだけ）と まゆ・おひげ・めがね
    for (const s of [-1, 1]) { G.ell(c, s * 40, -124, 10, 16, s * 0.2); G.fillO(c, HAIR_W, 2); }
    c.strokeStyle = 'rgba(200,160,140,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(0, -138, 30, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
    for (const s of [-1, 1]) { G.ell(c, s * 17, -128, 9, 4, s * -0.2); G.fillO(c, HAIR_W, 1.6); }
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, -102); c.quadraticCurveTo(s * 16, -110, s * 26, -98); c.quadraticCurveTo(s * 14, -96, 0, -99); c.closePath(); G.fillO(c, HAIR_W, 2); }
    c.strokeStyle = '#7a5a3a'; c.lineWidth = 3; for (const s of [-1, 1]) { G.circ(c, s * 17, -114, 13); c.stroke(); } c.beginPath(); c.moveTo(-4, -115); c.lineTo(4, -115); c.stroke();
  };
  HX.outfit.jiji = (c, P, ch, t) => {
    c.beginPath(); c.moveTo(-26, -90); c.lineTo(26, -90); c.lineTo(30, -24); c.lineTo(-30, -24); c.closePath(); G.fillO(c, '#7fa86a', 3);
    G.poly(c, [-10, -90, 0, -66, 10, -90]); c.fillStyle = '#fffaf0'; c.fill();
    c.fillStyle = '#e8d6a8'; for (let i = 0; i < 4; i++) { G.circ(c, 0, -60 + i * 10, 2.6); c.fill(); }
    c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2; for (let y = -84; y < -28; y += 8) { c.beginPath(); c.moveTo(-26, y); c.lineTo(-6, y); c.moveTo(6, y); c.lineTo(26, y); c.stroke(); }
    G.rr(c, 12, -54, 14, 12, 3); c.strokeStyle = '#5a7a4a'; c.lineWidth = 2; c.stroke();
    G.rr(c, -30, -28, 60, 8, 3); c.fillStyle = '#8a7a6a'; c.fill();
  };
  HX.hairBack.baba = (c, P, ch, t) => { G.ell(c, 0, -128, 46, 42); G.fillO(c, '#d8d6e2', 3); };
  HX.hairFront.baba = (c, P, ch, t) => {
    G.circ(c, 0, -172, 18); G.fillO(c, '#d8d6e2', 2.5);
    c.strokeStyle = '#b39ae8'; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, -172); c.lineTo(14, -178); c.stroke(); G.circ(c, 14, -178, 3.6); c.fillStyle = '#ffd23f'; c.fill();
    c.beginPath(); c.moveTo(-44, -112); c.bezierCurveTo(-46, -160, 46, -160, 44, -112); c.quadraticCurveTo(24, -146, 0, -140); c.quadraticCurveTo(-24, -146, -44, -112); c.closePath(); G.fillO(c, '#e2e0ea', 2.5);
    c.strokeStyle = 'rgba(160,150,180,.6)'; c.lineWidth = 2; for (const x of [-20, -6, 8, 22]) { c.beginPath(); c.moveTo(x, -150); c.quadraticCurveTo(x + 6, -140, x + 2, -132); c.stroke(); }
    c.strokeStyle = '#c4506a'; c.lineWidth = 2.6; for (const s of [-1, 1]) { G.ell(c, s * 17, -113, 12, 10); c.stroke(); } c.beginPath(); c.moveTo(-5, -114); c.lineTo(5, -114); c.stroke();
    c.strokeStyle = '#c4506a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-29, -112); c.quadraticCurveTo(-40, -90, -32, -80); c.moveTo(29, -112); c.quadraticCurveTo(40, -90, 32, -80); c.stroke();
  };
  HX.outfit.baba = (c, P, ch, t) => {
    c.beginPath(); c.moveTo(-24, -88); c.lineTo(24, -88); c.lineTo(34, -16); c.quadraticCurveTo(0, -8, -34, -16); c.closePath(); G.fillO(c, '#9fb8e8', 3);
    c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,.7)'; for (let y = -80; y < -16; y += 14) for (let x = -30; x < 34; x += 14) { const xx = x + ((y / 14) % 2) * 7; for (let k = 0; k < 4; k++) { const a = (k / 4) * PT.TAU; G.circ(c, xx + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6, 1.8); c.fill(); } } c.restore();
    // ショール
    c.beginPath(); c.moveTo(-30, -90); c.quadraticCurveTo(0, -74, 30, -90); c.lineTo(28, -66); c.quadraticCurveTo(0, -52, -28, -66); c.closePath(); G.fillO(c, '#b39ae8', 2.5);
    c.fillStyle = '#ffffff'; for (let i = 0; i < 7; i++) { G.circ(c, -24 + i * 8, -62 + Math.abs(i - 3) * -1.4, 2); c.fill(); }
    // あみもの
    G.circ(c, -30, -36, 10); G.fillO(c, '#ff8fab', 2); c.strokeStyle = '#c4a8ee'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-40, -50); c.lineTo(-22, -30); c.moveTo(-22, -50); c.lineTo(-38, -30); c.stroke();
  };
  HX.hairBack.yuto = () => {};
  HX.hairFront.yuto = (c, P, ch, t) => {
    c.beginPath(); c.moveTo(-44, -110); c.bezierCurveTo(-48, -160, 46, -162, 44, -110); c.lineTo(36, -122); c.lineTo(28, -114); c.lineTo(18, -126); c.lineTo(8, -116); c.lineTo(-4, -128); c.lineTo(-14, -118); c.lineTo(-26, -128); c.lineTo(-34, -116); c.closePath(); G.fillO(c, '#4a2f22', 2.5);
    if (!ch.wear.hat) {
      // あおい ぼうし
      c.beginPath(); c.moveTo(-42, -134); c.quadraticCurveTo(-40, -176, 0, -176); c.quadraticCurveTo(40, -176, 42, -134); c.closePath(); G.fillO(c, '#4c9be8', 3);
      G.ell(c, 34, -134, 30, 8, 0.1); G.fillO(c, '#3a7bd0', 2.5);
      G.circ(c, 0, -176, 5); c.fillStyle = '#ffd23f'; c.fill();
      G.star(c, -8, -152, 9, 4); c.fillStyle = '#ffffff'; c.fill();
    }
    c.fillStyle = 'rgba(160,90,60,.5)'; for (const s of [-1, 1]) for (const k of [0, 5]) { G.circ(c, s * 28 + k * s, -100 + k * 0.4, 1.6); c.fill(); }
  };
  HX.outfit.yuto = (c, P, ch, t) => {
    // ハーフパンツ
    for (const s of [-1, 1]) { G.rr(c, s * 12 - 10, -36, 20, 16, 5); G.fillO(c, '#3e5a9a', 2.4); }
    c.beginPath(); c.moveTo(-24, -90); c.lineTo(24, -90); c.lineTo(28, -30); c.lineTo(-28, -30); c.closePath(); G.fillO(c, '#58c46b', 3);
    G.ell(c, 0, -88, 10, 4); c.fillStyle = SKIN; c.fill();
    c.fillStyle = '#ffffff'; c.font = `900 22px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('5', 0, -50);
    c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.beginPath(); c.moveTo(-24, -70); c.lineTo(-14, -70); c.moveTo(14, -70); c.lineTo(24, -70); c.stroke();
  };
  HX.hairBack.sakura = (c, P, ch, t) => { G.ell(c, 0, -116, 50, 46); G.fillO(c, '#5a3a2a', 3); for (const s of [-1, 1]) { G.ell(c, s * 40, -92, 14, 18, s * 0.2); G.fillO(c, '#5a3a2a', 2.5); } };
  HX.hairFront.sakura = (c, P, ch, t) => {
    c.beginPath(); c.moveTo(-46, -100); c.bezierCurveTo(-50, -168, 50, -168, 46, -100); c.quadraticCurveTo(40, -128, 30, -132); c.lineTo(-30, -132); c.quadraticCurveTo(-40, -128, -46, -100); c.closePath(); G.fillO(c, '#5a3a2a', 2.5);
    c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-24, -152); c.quadraticCurveTo(0, -160, 20, -154); c.stroke();
    // さくらの かみどめ
    c.save(); c.translate(-30, -140); for (let k = 0; k < 5; k++) { const a = (k / 5) * PT.TAU; G.ell(c, Math.cos(a) * 6, Math.sin(a) * 6, 5, 3.4, a); c.fillStyle = '#ffaec8'; c.fill(); } G.circ(c, 0, 0, 2.6); c.fillStyle = '#ffd23f'; c.fill(); c.restore();
  };
  HX.outfit.sakura = (c, P, ch, t) => {
    c.beginPath(); c.moveTo(-18, -88); c.lineTo(18, -88); c.lineTo(36, -18); c.quadraticCurveTo(0, -10, -36, -18); c.closePath(); G.fillO(c, '#ffd23f', 3);
    c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.beginPath(); c.moveTo(-34, -24); c.quadraticCurveTo(0, -16, 34, -24); c.stroke();
    c.fillStyle = '#ff8fab'; [[-18, -40], [10, -30], [20, -56], [-8, -62]].forEach(([x, y]) => { for (let k = 0; k < 5; k++) { const a = (k / 5) * PT.TAU; G.circ(c, x + Math.cos(a) * 3.4, y + Math.sin(a) * 3.4, 2.4); c.fill(); } });
    G.poly(c, [-12, -90, 0, -80, 12, -90, 6, -94, -6, -94]); c.fillStyle = '#ffffff'; c.fill();
    // なわとび
    c.strokeStyle = '#ff6f91'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(30, -50); c.quadraticCurveTo(46, -20, 34, -12); c.stroke(); G.rr(c, 26, -58, 8, 14, 3); G.fillO(c, '#4c9be8', 1.6);
  };

  /* ================= あそび ================= */
  const W = PT.world, R = PT.R, D = R.D, FX = PT.FX;
  D('d_nyan', 'ニャンの ひなたぼっこ', 'ニャンを タップすると ごろーん。なでると ゴロゴロ', ['nyan']);
  D('d_panda', 'パンちゃんの ごろごろ', 'パンちゃんは ころころ ころがって ささを むしゃむしゃ', ['panda']);
  D('d_penta', 'ペンタの おなかすべり', 'ペンタは おなかで すいーっと すべる', ['penta']);
  D('d_kon', 'コンの へんしん', 'コンは このはを のせて どろん！なにに へんしんする？', ['kon']);
  D('d_yume', 'ユメの にじの みち', 'ユメが はしると にじと きらきらが のこる', ['yume', 'rainbow']);
  D('d_jiji', 'おじいちゃんの てじな', 'おじいちゃんの ぼうしから…ハトが とびだした！', ['jiji']);
  D('d_baba', 'おばあちゃんの おかし', 'おばあちゃんは あみものを しながら おかしを くれる', ['baba', 'cookie']);
  D('d_yuto', 'ゆうとの シュート', 'ゆうとの シュート！ ゴールに はいるかな？', ['yuto', 'ball']);
  D('d_sakura', 'さくらの なわとび', 'さくらは なわとびが とくい。みんなも ぴょんぴょん', ['sakura']);
  const one = (ch, r = 900) => R.free(ch.x, ch.y, [ch], r)[0];
  const TAP = {
    nyan(ch) {
      R.claim(ch, 5000).say('ニャ〜', null, 1000, 'talk').pose('sleep', 2400).face('sleep', 2400).do(() => W.burst('zzz', ch.x + 20, ch.y - 120, 2, { up: true, sp: 0.04, minSp: 0.02, g: -0.00001, max: 1500, size: 20, col: '#7a8fb8' })).face('love', 1200).say('ゴロゴロ…', 'heart', 1300, 'talk').do(() => R.found('d_nyan'));
      const o = one(ch, 600); if (o) W.after(800, () => R.claim(o, 3000).go(ch.x + 80, ch.y + 6).look(ch.x).pose('hold', 1500).say('なでなで', 'heart', 1300));
    },
    panda(ch) {
      const sx = ch.x;
      R.claim(ch, 6000).say('ごろごろ〜', null, 1000, 'yay').do(() => { R.tween(ch, 1600, (k) => { ch.x = sx + k * 160 * (ch.flip ? -1 : 1); ch.pose = 'spin'; ch.face = 'laugh'; }, () => { ch.face = 'happy'; W.act(ch).hold('carrot').face('eat', 1400).pose('eat', 1400).unhold().say('むしゃむしゃ', 'heart', 1200, 'yay').do(() => R.found('d_panda')); }); });
      R.audience(ch.x, ch.y, [ch], 'laugh', 1, 1200);
    },
    penta(ch) {
      const sx = ch.x, dir = ch.flip ? -1 : 1;
      R.claim(ch, 5000).say('すべるよー！', null, 1000, 'yay').do(() => { R.tween(ch, 1400, (k) => { ch.x = sx + PT.easeOut(k) * 300 * dir; ch.pose = 'fly'; ch.z = 0; if (Math.random() < 0.3) W.burst('spark', ch.x - 30 * dir, ch.y - 10, 1, { sp: 0.05, max: 500, size: 6, col: '#cfeaff', g: 0 }); }, () => { W.act(ch).pose('cheer', 900).say('すいーっ！', 'star', 1200, 'yay').do(() => R.found('d_penta')); }); });
      R.mimic(ch, 'fly', 1200, 'わたしも すべる！');
    },
    kon(ch) {
      const forms = [['hat', 'witch'], ['hat', 'crown'], ['body', 'robot'], ['hat', 'frog'], ['hat', 'chef']];
      const [slot, kind] = PT.pick(forms);
      R.claim(ch, 5000).say('どろん！', null, 900, 'yay').do(() => { W.poof(ch.x, ch.y - 80); PT.audio.sfx('magic'); ch.wear = Object.assign({}, ch.wear, { [slot]: kind }); }).face('laugh', 1200).say('へんしん せいこう！', 'star', 1400, 'laugh').pose('spin', 900).do(() => R.found('d_kon'));
      R.audience(ch.x, ch.y, [ch], 'wow', 2, 700);
    },
    yume(ch) {
      const pts = [W.randFloor(200), W.randFloor(200)];
      const a = R.claim(ch, 8000).say('にじの みち！', 'rainbow', 1300, 'yay');
      let acc = 0;
      W.special({ type: 'trail', max: 4000, step(f, dt) { acc += dt; if (acc > 70) { acc = 0; W.fx.push({ type: 'spark', x: ch.x, y: ch.y - 40, vx: 0, vy: -0.02, life: 0, max: 1200, size: 9, col: PT.pick(['#ff9ec0', '#ffd59a', '#fff3a6', '#bff0c0', '#bfe3ff', '#d9c4ff']), rot: 0, vr: 0.003, g: 0 }); } }, draw() {} });
      pts.forEach((p) => a.go(p.x, p.y, true));
      a.pose('cheer', 900).face('love', 1200).do(() => R.found('d_yume'));
    },
    jiji(ch) {
      R.claim(ch, 6000).say('みてごらん…', null, 1300, 'talk').pose('hold', 1200).do(() => { PT.audio.sfx('magic'); FX.critter('bird', [[ch.x + 30, ch.y - 200, 1], [ch.x + 300, ch.y - 400, 1500], [ch.x + 700, ch.y - 450, 1500]], { col: '#ffffff' }); W.burst('star', ch.x + 30, ch.y - 200, 10, { sp: 0.2, max: 800 }); }).say('ハトさん でておいで！', 'star', 1500, 'yay').face('laugh', 1200).do(() => R.found('d_jiji'));
      R.audience(ch.x, ch.y, [ch], 'wow', 3, 1500);
    },
    baba(ch) {
      const kids = R.free(ch.x, ch.y, [ch], 1500).slice(0, 3);
      R.claim(ch, 6000).pose('hold', 1200).say('あみものが できたよ', 'heart', 1500, 'talk').say('おかしも どうぞ', 'cookie', 1500, 'talk').do(() => R.found('d_baba'));
      kids.forEach((k, i) => W.after(1600 + i * 300, () => { const p = R.ring(ch.x, ch.y, i, kids.length, 120); R.claim(k, 4000).go(p.x, p.y, true).look(ch.x).hold('cookie').face('eat', 1300).pose('eat', 1200).unhold().face('love', 1000).say(i === 0 ? 'ありがとう！' : '', 'heart', 1200, 'yay'); }));
    },
    yuto(ch) {
      const ball = W.props().find((p) => p.type === 'ball') || W.addProp('ball', ch.x + (ch.flip ? -60 : 60), ch.y + 4, { temp: true });
      ball.pop = W.t;
      R.claim(ch, 5000).to(ball, ch.x < ball.x ? -50 : 50, 2, true).pose('kick', 300).do(() => { ball.vx = (ch.x < ball.x ? 1 : -1) * 0.9; ball.vy = PT.rand(-0.1, 0.1); PT.audio.sfx('boing'); }).say('シュート！', 'ball', 1200, 'yay').wait(900).face('laugh', 1200).say('ゴール！', 'star', 1300, 'yay').pose('cheer', 900).do(() => { W.bigText('ゴール！', ball.x, ball.y - 150, '#58c46b'); R.found('d_yuto'); });
    },
    sakura(ch) {
      R.claim(ch, 5000).say('なわとび するよ！', null, 1200, 'yay').jump(50, 380).jump(50, 380).jump(50, 380).jump(60, 420).say('ぜんぶ とべた！', 'star', 1300, 'yay').pose('cheer', 800).do(() => R.found('d_sakura'));
      R.free(ch.x, ch.y, [ch], 900).slice(0, 2).forEach((o, i) => W.after(600 + i * 300, () => R.claim(o, 3500).look(ch.x).jump(40, 400).jump(40, 400).jump(40, 400).face('laugh', 1000)));
    },
  };
  R.add({ id: 'chars2-tap', on: 'tapchar', pri: 31, test: (c) => (TAP[c.e.cid] ? 1 : null), run(c) { TAP[c.e.cid](c.e); } });

  /* ステージに すこしずつ 登場 */
  const add = (sid, list) => { const st = PT.stageById(sid); if (st) st.spawn.push(...list); };
  add('park', [['yuto', 300, 820], ['nyan', 1500, 720]]);
  add('beach', [['penta', 1240, 820]]);
  add('camp', [['kon', 480, 800], ['jiji', 1440, 700]]);
  add('forest', [['yume', 1080, 700]]);
  add('kinder', [['sakura', 1380, 820], ['yuto', 300, 820]]);
  add('fun', [['yume', 600, 860]]);
  add('clinic', [['panda', 1080, 820], ['baba', 260, 820]]);
  add('space', [['penta', 520, 760]]);
  add('home', [['nyan', 1500, 760]]);
  add('fest', [['jiji', 280, 820], ['baba', 1480, 840], ['kon', 1300, 820]]);
})();
