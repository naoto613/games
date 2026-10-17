/* ふーたん・リッキー・ママ・パパ（ほかの ゲームと おなじ みための 家族） */
'use strict';
(() => {
  const G = PT.G;
  const SKIN = '#ffe0cc', HAIR = '#2b1d22';

  Object.assign(PT.CHARS, {
    futan: { id: 'futan', name: 'ふーたん', human: true, color: SKIN, dark: '#e8483a', size: 0.95, voice: 620, legExt: 0,
      tag: 'げんき・おしゃれ', likes: 'プリンセス・おみせやさん', badge: '#ff8cc0', lash: true },
    ricky: { id: 'ricky', name: 'リッキー', human: true, fairy: true, color: SKIN, dark: '#f3dc5a', size: 0.74, voice: 820, legExt: 0, hover: 36,
      tag: 'あかちゃんの ようせい', likes: 'ふわふわ・きらきら', badge: '#bcd8ff' },
    mama: { id: 'mama', name: 'ママ', human: true, color: SKIN, dark: '#5a3a6a', size: 1.0, voice: 430, legExt: 16,
      tag: 'にこにこ', likes: 'おりょうり・おかいもの', badge: '#ef6a2a' },
    papa: { id: 'papa', name: 'パパ', human: true, color: SKIN, dark: '#7a4a2a', size: 1.1, voice: 250, legExt: 44,
      tag: 'ちからもち', likes: 'たかいたかい・ドライブ', badge: '#2f5fa8' },
  });
  PT.CHAR_IDS = Object.keys(PT.CHARS);

  const ln = (col) => PT.line(col);
  const HX = (PT.HUMAN_EXT = { hairBack: {}, hairFront: {}, outfit: {} });
  /* ---------- かみがた（うしろ） ---------- */
  function hairBack(c, P, ch, t) {
    if (HX.hairBack[ch.cid]) return HX.hairBack[ch.cid](c, P, ch, t);
    if (ch.cid === 'futan') {
      // みつあみ と あかい リボン
      for (const sd of [-1, 1]) {
        for (let i = 0; i < 4; i++) { G.ell(c, sd * (42 + i * 2), -112 + i * 15, 11 - i, 9, sd * 0.3); G.fillO(c, HAIR, 2.5); }
        const bx = sd * 50, by = -58;
        c.save(); c.translate(bx, by);
        G.poly(c, [0, 0, -12, -9, -12, 9]); G.fillO(c, '#e8504a', 2); G.poly(c, [0, 0, 12, -9, 12, 9]); G.fillO(c, '#e8504a', 2); G.circ(c, 0, 0, 4); G.fillO(c, '#ff7a6a', 1.5);
        c.restore();
      }
      G.ell(c, 0, -126, 46, 44); G.fillO(c, HAIR, 3);
    } else if (ch.cid === 'mama') {
      // オレンジの もじゃもじゃパーマ
      for (let i = 0; i < 13; i++) { const a = Math.PI * (0.8 + i * 0.12); G.circ(c, Math.cos(a) * 50, -118 + Math.sin(a) * 50, 17); G.fillO(c, '#ef6a2a', 2.5); }
      G.ell(c, 0, -122, 50, 46); c.fillStyle = '#ef6a2a'; c.fill();
    } else if (ch.cid === 'papa') {
      G.ell(c, 0, -128, 44, 40); G.fillO(c, HAIR, 3);
    }
  }
  /* ---------- かみがた（まえ） ---------- */
  function hairFront(c, P, ch, t) {
    if (HX.hairFront[ch.cid]) return HX.hairFront[ch.cid](c, P, ch, t);
    if (ch.cid === 'futan') {
      c.beginPath(); c.moveTo(-44, -112); c.bezierCurveTo(-48, -170, 48, -170, 44, -112);
      c.quadraticCurveTo(30, -140, 10, -138); c.lineTo(4, -128); c.lineTo(-4, -138); c.quadraticCurveTo(-28, -142, -44, -112); c.closePath();
      G.fillO(c, HAIR, 2.5);
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-26, -150); c.quadraticCurveTo(-10, -158, 8, -156); c.stroke();
    } else if (ch.cid === 'mama') {
      for (let i = 0; i < 6; i++) { G.circ(c, -34 + i * 13.6, -150 + (i % 2) * 5, 13); G.fillO(c, '#ef6a2a', 2.5); }
      // おおきな ひまわり
      c.save(); c.translate(36, -166); c.rotate(Math.sin(t * 0.003) * 0.08);
      for (let i = 0; i < 12; i++) { const a = (i / 12) * PT.TAU; G.ell(c, Math.cos(a) * 20, Math.sin(a) * 20, 11, 6, a); G.fillO(c, '#ffd23f', 1.6); }
      G.circ(c, 0, 0, 13); G.fillO(c, '#8a5a2a', 2); c.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 6; i++) { G.circ(c, Math.cos(i) * 6, Math.sin(i) * 6, 1.8); c.fill(); }
      c.restore();
    } else if (ch.cid === 'papa') {
      // リーゼント
      c.beginPath(); c.moveTo(-44, -112); c.quadraticCurveTo(-48, -160, -8, -164); c.bezierCurveTo(20, -196, 66, -184, 52, -150); c.quadraticCurveTo(46, -140, 44, -112);
      c.quadraticCurveTo(34, -138, 8, -140); c.quadraticCurveTo(-20, -136, -44, -112); c.closePath(); G.fillO(c, HAIR, 2.5);
      c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -170); c.quadraticCurveTo(26, -186, 44, -170); c.stroke();
    } else if (ch.cid === 'ricky') {
      c.beginPath(); c.moveTo(-42, -114); c.bezierCurveTo(-46, -168, 46, -168, 42, -114); c.quadraticCurveTo(34, -132, 22, -134); c.lineTo(16, -124); c.lineTo(8, -136); c.lineTo(0, -126); c.lineTo(-8, -136); c.lineTo(-18, -126); c.quadraticCurveTo(-32, -134, -42, -114); c.closePath();
      G.fillO(c, HAIR, 2.5);
      c.strokeStyle = HAIR; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-6, -156); c.quadraticCurveTo(-16, -174, -6, -180); c.moveTo(6, -156); c.quadraticCurveTo(10, -174, 22, -176); c.stroke();
    }
  }

  /* ---------- かお ---------- */
  function face(c, P, ch, t, look) {
    const lx = look * 6, ey = -114, ex = 17;
    const f = ch.face || 'happy';
    const blink = ((t + ch.seed * 1000) % 4300) < 130;
    c.fillStyle = 'rgba(255,100,130,.45)';
    G.ell(c, -30 + lx, -100, 9, 6); c.fill(); G.ell(c, 30 + lx, -100, 9, 6); c.fill();
    c.strokeStyle = '#2a1c1c'; c.fillStyle = '#2a1c1c'; c.lineWidth = 4; c.lineCap = 'round';
    const arc = (x, up) => { c.beginPath(); if (up) c.arc(x, ey + 5, 8, Math.PI * 1.15, Math.PI * 1.85); else c.arc(x, ey - 5, 8, Math.PI * 0.15, Math.PI * 0.85); c.stroke(); };
    const papaShades = ch.cid === 'papa' && !ch.wear.face;
    if (papaShades) {
      // パパの サングラス
      c.fillStyle = '#1d1a22'; G.rr(c, -36 + lx, -126, 31, 22, 8); c.fill(); G.rr(c, 5 + lx, -126, 31, 22, 8); c.fill(); c.fillRect(-6 + lx, -120, 12, 4);
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-28 + lx, -120); c.lineTo(-22 + lx, -112); c.moveTo(13 + lx, -120); c.lineTo(19 + lx, -112); c.stroke();
      c.strokeStyle = '#2a1c1c'; c.lineWidth = 4; c.beginPath(); c.moveTo(-34 + lx, -134); c.lineTo(-12 + lx, -130); c.moveTo(34 + lx, -134); c.lineTo(12 + lx, -130); c.stroke();
    } else if (f === 'laugh' || f === 'eat' || f === 'love' || ((ch.cid === 'mama' || P.smileEyes) && !['surprise', 'puzzled', 'sleep', 'silly'].includes(f))) { arc(-ex + lx, true); arc(ex + lx, true); }
    else if (f === 'sleep') { arc(-ex + lx, false); arc(ex + lx, false); }
    else if (f === 'silly') { c.beginPath(); c.moveTo(-ex + lx - 7, ey - 7); c.lineTo(-ex + lx + 6, ey); c.lineTo(-ex + lx - 7, ey + 7); c.moveTo(ex + lx + 7, ey - 7); c.lineTo(ex + lx - 6, ey); c.lineTo(ex + lx + 7, ey + 7); c.stroke(); }
    else if (blink) { c.beginPath(); c.moveTo(-ex + lx - 8, ey); c.lineTo(-ex + lx + 8, ey); c.moveTo(ex + lx - 8, ey); c.lineTo(ex + lx + 8, ey); c.stroke(); }
    else {
      const big = f === 'surprise' ? 1.15 : 1;
      for (const sd of [-1, 1]) {
        const x = sd * ex + lx;
        if (f === 'puzzled' && sd === 1) { c.beginPath(); c.moveTo(x - 8, ey); c.lineTo(x + 8, ey - 2); c.stroke(); continue; }
        G.ell(c, x, ey, 9 * big, 11.5 * big); c.fillStyle = '#2a1c1c'; c.fill();
        // ふーたんは きらきらの ピンクの め
        G.ell(c, x, ey + 4 * big, 6.5 * big, 5.5 * big); c.fillStyle = (P.iris || (ch.cid === 'futan' ? '#c2386e' : 'rgba(120,80,60,.6)')); c.fill();
        G.circ(c, x + 3.2 * big, ey - 4.4 * big, 3.8 * big); c.fillStyle = '#fff'; c.fill();
        G.circ(c, x - 3 * big, ey + 4.5 * big, 1.8 * big); c.fill();
        if (P.lash) { c.strokeStyle = '#2a1c1c'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + sd * 8, ey - 8); c.lineTo(x + sd * 14, ey - 12); c.moveTo(x + sd * 9, ey - 3); c.lineTo(x + sd * 15, ey - 4); c.stroke(); c.lineWidth = 4; }
      }
    }
    // はな
    c.strokeStyle = 'rgba(200,120,100,.8)'; c.lineWidth = 2.4; c.beginPath(); c.arc(lx, -104, 3, 0.2, Math.PI - 0.2); c.stroke();
    // くち
    c.strokeStyle = '#2a1c1c'; c.lineWidth = 2.6;
    const mx = lx;
    if (ch.cid === 'ricky' && f !== 'laugh' && f !== 'surprise' && f !== 'eat') {
      // おしゃぶり
      G.circ(c, mx, -92, 8); G.fillO(c, '#ffd0e0', 2); G.circ(c, mx, -92, 3.6); c.fillStyle = '#ff9ccf'; c.fill();
    } else if (f === 'laugh' || f === 'yay' || ch.cid === 'papa' || ch.cid === 'mama' || P.bigSmile || (ch.cid === 'futan' && f === 'happy')) {
      c.beginPath(); c.moveTo(mx - 10, -96); c.quadraticCurveTo(mx, -94, mx + 10, -96); c.quadraticCurveTo(mx + 9, -82, mx, -82); c.quadraticCurveTo(mx - 9, -82, mx - 10, -96); c.closePath();
      c.fillStyle = '#d8405a'; c.fill(); c.stroke();
      G.ell(c, mx, -86, 4, 2.4); c.fillStyle = '#ff9ab0'; c.fill();
      if (ch.cid === 'papa') { c.fillStyle = '#fff'; c.fillRect(mx - 8, -95, 16, 3.5); }
    } else if (f === 'surprise') { G.ell(c, mx, -90, 5, 6.5); c.fillStyle = '#d8405a'; c.fill(); c.stroke(); }
    else if (f === 'eat') { const o = Math.abs(Math.sin(t * 0.02)) * 5; G.ell(c, mx, -92, 6, 1.5 + o); c.fillStyle = '#d8405a'; c.fill(); c.stroke(); }
    else if (f === 'silly') { c.beginPath(); c.moveTo(mx - 9, -95); c.quadraticCurveTo(mx, -90, mx + 9, -95); c.stroke(); G.ell(c, mx + 2, -88, 6, 8); c.fillStyle = '#ff7a95'; c.fill(); c.stroke(); }
    else { c.beginPath(); c.arc(mx, -98, 7, 0.2, Math.PI - 0.2); c.stroke(); }
  }

  /* ---------- ふく ---------- */
  function outfit(c, P, ch, t) {
    const id = ch.cid;
    if (HX.outfit[id]) return HX.outfit[id](c, P, ch, t);
    if (id === 'futan') {
      c.beginPath(); c.moveTo(-18, -88); c.lineTo(18, -88); c.lineTo(38, -18); c.quadraticCurveTo(0, -10, -38, -18); c.closePath();
      G.fillO(c, '#ff8cc0', 3);
      c.save(); c.clip(); c.fillStyle = '#ffffff'; for (let y = -84; y < -14; y += 14) for (let x = -40; x < 40; x += 14) { G.circ(c, x + ((y / 14) % 2) * 7, y, 3.4); c.fill(); } c.restore();
      G.poly(c, [-14, -90, 0, -78, 14, -90, 8, -94, -8, -94]); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = '#e8b8d0'; c.lineWidth = 1.5; c.stroke();
      // きいろい ハートの ポシェット
      c.strokeStyle = '#c98a20'; c.lineWidth = 3; c.beginPath(); c.moveTo(22, -86); c.lineTo(-10, -36); c.stroke();
      G.heart(c, -12, -32, 16); G.fillO(c, '#ffd23f', 2.5); G.circ(c, -16, -36, 3); c.fillStyle = '#fff'; c.fill();
    } else if (id === 'mama') {
      c.beginPath(); c.moveTo(-24, -88); c.lineTo(24, -88); c.lineTo(36, -16); c.quadraticCurveTo(0, -8, -36, -16); c.closePath(); G.fillO(c, '#e8483a', 3);
      c.beginPath(); c.moveTo(-16, -66); c.lineTo(16, -66); c.lineTo(22, -18); c.quadraticCurveTo(0, -14, -22, -18); c.closePath(); G.fillO(c, '#ffffff', 2.5);
      G.rr(c, -10, -46, 20, 12, 4); c.strokeStyle = '#e8b8b0'; c.lineWidth = 2; c.stroke();
      c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.moveTo(-26, -66); c.lineTo(26, -66); c.stroke();
      // ネギの はいった かいものぶくろ
      const bx = -40, by = -36;
      c.strokeStyle = '#4cad62'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx - 4, by - 12); c.lineTo(bx - 14, by - 54); c.moveTo(bx + 4, by - 12); c.lineTo(bx + 6, by - 50); c.stroke();
      c.strokeStyle = '#f7f4ee'; c.lineWidth = 5; c.beginPath(); c.moveTo(bx - 4, by - 12); c.lineTo(bx - 8, by - 30); c.stroke();
      G.rr(c, bx - 16, by - 18, 32, 28, 7); G.fillO(c, '#f3e1b5', 2.5);
    } else if (id === 'papa') {
      // シャツ と ネクタイ
      c.beginPath(); c.moveTo(-26, -90); c.lineTo(26, -90); c.lineTo(30, -24); c.lineTo(-30, -24); c.closePath(); G.fillO(c, '#2f5fa8', 3);
      G.poly(c, [-12, -90, 0, -60, 12, -90]); c.fillStyle = '#ffffff'; c.fill();
      G.poly(c, [-5, -86, 5, -86, 7, -52, 0, -44, -7, -52]); G.fillO(c, '#f28b2f', 2);
      c.strokeStyle = '#1e3f78'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-12, -90); c.lineTo(-4, -56); c.moveTo(12, -90); c.lineTo(4, -56); c.stroke();
      G.circ(c, -10, -40, 2.6); c.fillStyle = '#ffd54a'; c.fill(); G.circ(c, -10, -30, 2.6); c.fill();
      G.rr(c, -30, -28, 60, 8, 3); c.fillStyle = '#2e2a33'; c.fill();
    } else if (id === 'ricky') {
      G.blob(c, [-24, -58, -22, -84, 0, -90, 22, -84, 24, -58, 18, -30, 0, -24, -18, -30]); G.fillO(c, '#ffffff', 3);
      c.strokeStyle = '#f3dc5a'; c.lineWidth = 5; c.beginPath(); c.moveTo(-12, -86); c.lineTo(-14, -30); c.moveTo(12, -86); c.lineTo(14, -30); c.stroke();
    }
  }
  function wings(c, ch, t) {
    const fa = Math.sin(t * 0.03) * 0.35;
    for (const sd of [-1, 1]) {
      c.save(); c.translate(sd * 16, -74); c.rotate(sd * (-0.5 + fa));
      G.ell(c, sd * 24, 0, 26, 15); G.paint(c, '#ffffff', '#bcd8ff', 3);
      c.strokeStyle = '#bcd8ff'; c.lineWidth = 2; c.beginPath(); c.moveTo(sd * 6, 0); c.lineTo(sd * 40, 0); c.stroke();
      c.restore();
    }
  }

  /* ---------- からだぜんぶ（PT.drawChar から よばれる） ---------- */
  PT._drawHumanBody = (c, ch, t, pp, look) => {
    const P = ch.def;
    const L = P.legExt || 0;
    const legCol = P.legCol || (ch.cid === 'papa' ? '#2e2a33' : SKIN);
    const shoe = P.shoe ? P.shoe : ch.cid === 'futan' ? '#e8483a' : ch.cid === 'mama' ? '#5a3a6a' : ch.cid === 'papa' ? '#7a4a2a' : '#ffffff';
    if (P.fairy) c.translate(0, -(P.hover || 30) - Math.sin(t * 0.004 + ch.seed) * 6);
    if (P.fairy) wings(c, ch, t);
    PT._wearBack(c, ch, t);
    // あし
    if (!pp.hideLegs) {
      const hipY = -30 - L, lw = ch.cid === 'papa' ? 16 : 13;
      if (pp.sit) {
        for (const sd of [-1, 1]) { G.limb(c, sd * 12, hipY, sd * 22, -6, lw, legCol); G.ell(c, sd * 24, -6, 11, 7); G.fillO(c, shoe, 2.5); }
      } else if (P.fairy) {
        for (const sd of [-1, 1]) { G.ell(c, sd * 9, -22, 9, 7); G.fillO(c, SKIN, 2.5); }
      } else {
        for (const [sx, a] of [[-12, pp.legL], [12, pp.legR]]) {
          const len = 28 + L;
          const fx = sx + Math.sin(a) * len * 0.9, fy = hipY + Math.cos(a) * len;
          G.limb(c, sx, hipY, fx, fy - 4, lw, legCol);
          G.ell(c, fx + 3, fy - 2, 12, 7); G.fillO(c, shoe, 2.5);
        }
      }
    }
    c.save();
    c.translate(0, -L);
    // からだ（はだ）＋ ふく
    G.blob(c, [-26, -60, -22, -86, 0, -92, 22, -86, 26, -60, 24, -30, 0, -22, -24, -30]); G.fillO(c, SKIN, 3);
    outfit(c, P, ch, t);
    PT._wearBody(c, ch);
    // うで
    const sleeve = P.sleeve ? P.sleeve : ch.cid === 'papa' ? '#2f5fa8' : ch.cid === 'mama' ? '#e8483a' : ch.cid === 'futan' ? '#ff8cc0' : '#ffffff';
    const arm = (side, ang) => {
      const sx = side * 23, sy = -78;
      const ex = sx + Math.sin(ang) * 30, ey = sy + Math.cos(ang) * 30;
      G.limb(c, sx, sy, sx + Math.sin(ang) * 12, sy + Math.cos(ang) * 12, 13, sleeve);
      G.limb(c, sx + Math.sin(ang) * 10, sy + Math.cos(ang) * 10, ex, ey, 11, SKIN);
      G.circ(c, ex, ey, 7.5); G.fillO(c, SKIN, 2.5);
      return [ex, ey];
    };
    arm(-1, pp.armL);
    const hR = arm(1, pp.armR);
    ch._hand = [hR[0], hR[1] - L];
    // あたま
    c.save(); c.translate(0, -100); c.rotate(pp.headTilt); c.translate(0, 100);
    hairBack(c, P, ch, t);
    for (const sd of [-1, 1]) { G.circ(c, sd * 42, -112, 8); G.fillO(c, SKIN, 2.5); }
    G.ell(c, 0, -116, 42, 39); G.fillO(c, SKIN, 3);
    face(c, P, ch, t, look);
    hairFront(c, P, ch, t);
    PT._wearHead(c, ch, t, look);
    PT._wearFront(c, ch, t);
    if (ch.headItem && PT.ITEMS[ch.headItem]) {
      const it = PT.ITEMS[ch.headItem];
      c.save(); c.translate(0, -150); const k = Math.min(0.9, 80 / Math.max(it.w, it.h)); c.scale(k, k); it.draw(c, t, {}); c.restore();
    }
    c.restore();
    c.restore();
  };

  /* ================= あそび ================= */
  const W = PT.world, R = PT.R, D = R.D, X = PT.FX;
  D('d_futan', 'ふーたんの おしゃれ', 'ふーたんを タップすると くるっと まわって ポシェットを じまん', ['futan']);
  D('d_ricky', 'リッキーの きらきら', 'リッキーは ふわふわ とびながら きらきらを ふりまく', ['ricky']);
  D('d_mamagohan', 'ママの「ごはんよー！」', 'ママを タップすると おいしい ごはんが でてきて みんなが あつまる', ['mama', 'onigiri']);
  D('d_papatakai', 'パパの たかいたかい', 'パパを タップすると ちかくの こを たかーく もちあげる', ['papa', 'futan']);
  D('d_family', 'かぞく みんなで ぎゅー', 'パパ・ママ・ふーたん・リッキーが そろうと…', ['papa', 'mama', 'futan', 'ricky']);

  const FAM = {
    futan(ch) {
      R.claim(ch, 4000).pose('spin', 900).say('みてみて！ ポシェット！', 'heart', 1500, 'yay').face('love', 1200).pose('shy', 900)
        .do(() => { W.burst('heart', ch.x, ch.y - 170 * ch.scale, 5, { up: true, sp: 0.12, max: 900 }); R.found('d_futan'); });
      const r = W.charOf('ricky');
      if (r && R.chars().includes(r)) W.after(700, () => R.claim(r, 3000).say('きゃっきゃっ', 'star', 1200, 'laugh').pose('cheer', 1500));
    },
    ricky(ch) {
      PT.audio.sfx('magic');
      R.claim(ch, 4000).say('きゃっきゃっ！', 'star', 1200, 'laugh').do(() => {
        const sx = ch.x;
        R.tween(ch, 2200, (k) => { ch.x = sx + Math.sin(k * PT.TAU) * 90; ch.z = Math.sin(k * Math.PI) * 120; ch.flip = Math.cos(k * PT.TAU) < 0; if (Math.random() < 0.35) W.burst('spark', ch.x, ch.y - ch.z - 90, 1, { sp: 0.06, max: 700, size: 9, col: PT.pick(['#ffd23f', '#ffd1f0', '#bcd8ff']), g: 0 }); }, () => { ch.z = 0; ch.x = sx; R.found('d_ricky'); });
      });
    },
    mama(ch) {
      const a = R.claim(ch, 7000).pose('call', 900).say('ごはんよー！', 'onigiri', 1500, 'yay');
      a.do(() => {
        const foods = ['onigiri', 'cake', 'apple', 'pancake', 'bento'].filter((id) => PT.ITEMS[id]);
        const p = W.clampFloor(ch.x + (ch.flip ? -90 : 90), ch.y + 10);
        const pl = W.addProp('plate', p.x, p.y, { temp: true }); pl.pop = W.t;
        const f = W.addProp(PT.pick(foods), p.x, p.y + 1, { temp: true }); f.pop = W.t; f.z = 12;
        PT.audio.sfx('sparkle');
        const kids = R.free(p.x, p.y, [ch], 2500).slice(0, 4);
        kids.forEach((k, i) => { const q = R.ring(p.x, p.y, i, kids.length, 130); R.claim(k, 6000).go(q.x, q.y, true).look(p.x).say(i === 0 ? 'いただきます！' : '', 'heart', 1300, 'yay').pose('sit', 800).face('eat', 1500).pose('eat', 1400).face('laugh', 1000); });
        W.after(3500, () => { if (!f.removed) W.remove(f); R.found('d_mamagohan'); });
      }).face('laugh', 1500);
    },
    papa(ch) {
      const kid = R.free(ch.x, ch.y, [ch], 900).find((k) => k.cid !== 'mama') || null;
      if (!kid) { R.claim(ch, 2500).pose('cheer', 1000).say('パパだぞー！', 'star', 1300, 'yay'); return; }
      R.claim(kid, 6000);
      R.claim(ch, 6000).to(kid, kid.x < ch.x ? 70 : -70, 4, true).look(kid.x).pose('jump', 300).say('たかい たかーい！', 'star', 1500, 'yay')
        .do(() => {
          const kx = kid.x; kid.stay = true;
          R.tween(kid, 2400, (k) => { kid.z = Math.abs(Math.sin(k * Math.PI * 2)) * 170; kid.pose = 'cheer'; kid.face = 'laugh'; kid.x = kx; if (Math.random() < 0.1) W.burst('heart', kid.x, kid.y - kid.z - 160, 1, { up: true, sp: 0.08, max: 800, size: 12 }); }, () => { kid.z = 0; kid.stay = false; kid.face = 'happy'; W.say(kid, 'もういっかい！', 'heart', 1300, 'laugh'); R.found('d_papatakai'); });
        }).pose('cheer', 2400).face('laugh', 1200);
    },
  };
  R.add({ id: 'family-tap', on: 'tapchar', pri: 31, test: (c) => (FAM[c.e.cid] ? 1 : null), run(c) { FAM[c.e.cid](c.e); } });
  // かぞくが そろって いると ぎゅー（キャラを かぞくに かさねたとき）
  R.add({ id: 'family-hug', pri: 64, test: (c) => {
    if (!(R.h.isC(c.e) && R.h.isC(c.tgt))) return null;
    const fam = ['futan', 'ricky', 'mama', 'papa'];
    if (!fam.includes(c.e.cid) || !fam.includes(c.tgt.cid)) return null;
    const all = fam.map((id) => W.charOf(id)).filter((x) => x && R.chars().includes(x));
    return all.length >= 3 ? all : null;
  }, run(c, all) {
    const cx = c.tgt.x, cy = c.tgt.y;
    all.forEach((m, i) => { const p = W.clampFloor(cx - 120 + i * 80, cy + (i % 2) * 10); R.claim(m, 5000).go(p.x, p.y, true).look(cx).pose('hug', 1800).face('love', 1800).say(i === 0 ? 'だいすき！' : '', 'heart', 1500, 'yay').pose('cheer', 900); });
    W.after(1600, () => { W.burst('heart', cx, cy - 200, 14, { up: true, sp: 0.18, max: 1300 }); PT.audio.sfx('cheer'); R.found('d_family'); });
  } });
})();
