/* オリジナルキャラクターの描画（手描き絵本ふう・ベクター） */
'use strict';
(() => {
  const G = PT.G;

  PT.CHARS = {
    lulu: { id: 'lulu', name: 'ルル', color: '#5f9de3', dark: '#2f63ad', belly: '#dcecfb', muzzle: '#fff4e2', ear: 'pointy', size: 1, voice: 560,
      tag: 'こうきしん', likes: 'たんけん・はつめい', acc: 'scarf', accColor: '#ffc93c', badge: '#7fb6ef' },
    pon: { id: 'pon', name: 'ポン', color: '#f39c4f', dark: '#c4632a', belly: '#fde6c8', muzzle: '#fff5e6', ear: 'fold', size: 1, voice: 450,
      tag: 'おちょうしもの', likes: 'いたずら・へんそう', acc: 'freckle', accColor: '#d9783b', badge: '#f7b072' },
    mimi: { id: 'mimi', name: 'ミミ', color: '#f2879d', dark: '#c4506a', belly: '#fde3e9', muzzle: '#ffffff', ear: 'long', size: 0.97, voice: 640,
      tag: 'せわずき', likes: 'おみせやさん・おいしゃさん', acc: 'bow', accColor: '#e93a55', badge: '#f6a3b4' },
    gaku: { id: 'gaku', name: 'ガク', color: '#7fb495', dark: '#467a5c', belly: '#e2f1e6', muzzle: '#f7f4e9', ear: 'round', size: 1.04, voice: 360,
      tag: 'おちついている', likes: 'くみたて・のりもの', acc: 'glasses', accColor: '#3b4a5a', badge: '#9ccbb0' },
    choco: { id: 'choco', name: 'チョコ', color: '#a78ad9', dark: '#6b52a6', belly: '#efe7fb', muzzle: '#ffffff', ear: 'curl', size: 0.86, voice: 720,
      tag: 'げんき・まねっこ', likes: 'ごっこあそび・ダンス', acc: 'tuft', accColor: '#f5d34a', badge: '#c1a9ea' },
    moko: { id: 'moko', name: 'モコ', color: '#f6cc55', dark: '#c3912a', belly: '#fff3c9', muzzle: '#fffaf0', ear: 'fluffy', size: 1.0, voice: 300,
      tag: 'のんびり', likes: 'たべる・ピクニック', acc: 'mane', accColor: '#69b866', badge: '#f8d97c' },
    pyoko: { id: 'pyoko', name: 'ピョコ', color: '#f7f2ec', dark: '#e9a3bb', belly: '#ffffff', muzzle: '#ffffff', ear: 'bunny', size: 0.92, voice: 680,
      tag: 'はずかしがりや', likes: 'ジャンプ・おはなつみ', acc: 'flower', accColor: '#ff8fb1', badge: '#f6c7d6', tail: 'puff', lash: true },
  };
  PT.CHARS.mimi.lash = true;
  PT.CHAR_IDS = Object.keys(PT.CHARS);

  /* ポーズごとの手足角度など */
  function poseParams(ch, t) {
    const p = { legL: 0, legR: 0, armL: 0.35, armR: -0.35, lean: 0, bodyY: 0, sx: 1, sy: 1, rot: 0, headTilt: 0, hideLegs: false, sit: false, tail: Math.sin(t * 0.012 + ch.seed) * 0.4 };
    const pt = ch.poseT || 0;
    const breathe = Math.sin(t * 0.0035 + ch.seed);
    p.sy = 1 + breathe * 0.012; p.sx = 1 - breathe * 0.008;
    switch (ch.pose) {
      case 'walk': case 'run': {
        const sp = ch.pose === 'run' ? 0.022 : 0.013;
        const ph = pt * sp;
        p.legL = Math.sin(ph) * (ch.pose === 'run' ? 0.7 : 0.45); p.legR = -p.legL;
        p.armL = 0.35 - Math.sin(ph) * 0.6; p.armR = -0.35 - Math.sin(ph) * 0.6;
        p.bodyY = -Math.abs(Math.sin(ph)) * (ch.pose === 'run' ? 8 : 4);
        p.lean = ch.pose === 'run' ? 0.12 : 0.04;
        p.tail = Math.sin(pt * 0.03) * 0.6;
        break;
      }
      case 'jump': case 'cheer': {
        p.armL = 2.6 + Math.sin(pt * 0.02) * 0.2; p.armR = -2.6 - Math.sin(pt * 0.02) * 0.2;
        p.legL = 0.25; p.legR = -0.25;
        if (ch.pose === 'cheer') p.bodyY = -Math.abs(Math.sin(pt * 0.012)) * 14;
        p.tail = Math.sin(pt * 0.04) * 0.8;
        break;
      }
      case 'dance': {
        const ph = pt * 0.008;
        p.rot = Math.sin(ph) * 0.16;
        p.armL = 1.6 + Math.sin(ph * 2) * 1.0; p.armR = -1.6 + Math.sin(ph * 2) * 1.0;
        p.legL = Math.max(0, Math.sin(ph)) * 0.5; p.legR = -Math.max(0, -Math.sin(ph)) * 0.5;
        p.bodyY = -Math.abs(Math.sin(ph * 2)) * 8;
        p.tail = Math.sin(pt * 0.03) * 0.9;
        break;
      }
      case 'wave': {
        p.armR = -2.5 + Math.sin(pt * 0.02) * 0.45; p.armL = 0.3;
        break;
      }
      case 'point': { p.armR = -1.55; p.armL = 0.3; p.lean = 0.05; break; }
      case 'call': { p.armR = -2.2; p.armL = 2.2; p.headTilt = -0.08; break; }
      case 'hold': { p.armL = 1.25; p.armR = -1.25; break; }
      case 'carry': { p.armL = 2.8; p.armR = -2.8; p.bodyY = -Math.abs(Math.sin(pt * 0.013)) * 3; p.legL = Math.sin(pt * 0.013) * 0.4; p.legR = -p.legL; break; }
      case 'eat': { p.armR = -2.1 + Math.sin(pt * 0.015) * 0.25; p.armL = 0.6; p.headTilt = 0.05; break; }
      case 'sit': case 'ride': case 'slide': { p.sit = true; p.bodyY = 18; p.armL = 0.9; p.armR = -0.9; if (ch.pose !== 'sit') p.hideLegs = ch.pose === 'ride'; if (ch.pose === 'slide') { p.armL = 2.4; p.armR = -2.4; } break; }
      case 'sleep': { p.sit = true; p.bodyY = 18; p.headTilt = 0.25; p.armL = 0.5; p.armR = -0.5; break; }
      case 'bow': { p.lean = 0.45; p.armL = 0.2; p.armR = -0.2; break; }
      case 'think': { p.armR = -2.3; p.armL = 0.4; p.headTilt = 0.18; break; }
      case 'shy': { p.armL = 2.0; p.armR = -2.0; p.headTilt = -0.12; break; }
      case 'fly': { p.rot = 0.5 * (ch.flip ? -1 : 1) * 0; p.armR = -2.9; p.armL = 1.0; p.legL = 0.6; p.legR = 0.9; p.lean = 0.35; break; }
      case 'spin': { p.sx = Math.cos(pt * 0.025); p.armL = 1.5; p.armR = -1.5; break; }
      case 'hug': { p.armL = 1.7; p.armR = -1.7; p.headTilt = -0.1; break; }
      case 'count': { p.armL = 2.2; p.armR = -2.2; p.headTilt = 0.1; break; }
      case 'peek': { p.armL = 1.4; p.armR = -1.4; p.lean = 0.25; break; }
      case 'trip': { p.rot = Math.min(1, pt / 300) * 1.3; p.armL = 2.4; p.armR = -2.4; p.legL = -0.6; p.legR = 0.4; break; }
      case 'swim': { p.hideLegs = true; p.armL = 1.2 + Math.sin(pt * 0.012) * 0.6; p.armR = -1.2 - Math.sin(pt * 0.012) * 0.6; p.bodyY = 30 + Math.sin(pt * 0.004) * 3; break; }
      case 'roar': { p.armL = 2.0; p.armR = -2.0; p.lean = 0.15; break; }
      case 'kick': { p.legR = -1.0 * Math.min(1, pt / 150); p.armL = 1.0; p.armR = -0.2; break; }
      case 'tickle': { p.rot = Math.sin(pt * 0.05) * 0.12; p.armL = 2.2; p.armR = -2.2; break; }
      case 'march': { const ph = pt * 0.012; p.legL = Math.max(0, Math.sin(ph)) * 0.9; p.legR = Math.max(0, -Math.sin(ph)) * 0.9; p.armL = 0.3 + Math.sin(ph) * 0.9; p.armR = -0.3 + Math.sin(ph) * 0.9; p.bodyY = -Math.abs(Math.sin(ph)) * 5; break; }
      default: break;
    }
    return p;
  }

  PT.CHAR_EXT = { earBack: {}, earFront: {}, acc: {}, body: {}, tail: {} };
  /* 耳（頭の後ろ側） */
  function earsBack(c, P, t, ch) {
    if (PT.CHAR_EXT.earBack[P.ear]) return PT.CHAR_EXT.earBack[P.ear](c, P, t, ch);
    const col = P.color, dk = P.dark, ln = PT.line(col);
    const wig = Math.sin(t * 0.006 + ch.seed) * 0.05;
    c.save();
    switch (P.ear) {
      case 'bunny':
        for (const s of [-1, 1]) {
          const flop = s === 1 ? 0.25 + Math.max(0, Math.sin(t * 0.003 + ch.seed)) * 0.15 : 0;
          c.save(); c.translate(s * 20, -150); c.rotate(s * (0.12 + wig) + flop);
          G.ell(c, 0, -42, 15, 46); G.paint(c, col, ln, 3);
          G.ell(c, 0, -40, 7.5, 34); c.fillStyle = '#ffc6d6'; c.fill();
          c.restore();
        }
        break;
      case 'long':
        for (const s of [-1, 1]) {
          c.save(); c.translate(s * 36, -138); c.rotate(s * (0.28 + wig));
          G.ell(c, 0, 26, 15, 34); G.paint(c, dk, PT.line(dk), 3);
          c.restore();
        }
        break;
      case 'fluffy':
        // ふわふわのたてがみ
        c.fillStyle = PT.shade(P.color, 0.15);
        c.beginPath();
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * PT.TAU;
          c.moveTo(0, -120);
          c.arc(Math.cos(a) * 46, -120 + Math.sin(a) * 42, 16, 0, PT.TAU);
        }
        c.fill();
        c.strokeStyle = ln; c.lineWidth = 3;
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * PT.TAU;
          c.beginPath(); c.arc(Math.cos(a) * 46, -120 + Math.sin(a) * 42, 16, a - 1.2, a + 1.2); c.stroke();
        }
        break;
      default: break;
    }
    c.restore();
  }
  /* 耳（頭の前側） */
  function earsFront(c, P, t, ch) {
    if (PT.CHAR_EXT.earFront[P.ear]) return PT.CHAR_EXT.earFront[P.ear](c, P, t, ch);
    const col = P.color, dk = P.dark;
    const wig = Math.sin(t * 0.006 + ch.seed) * 0.06;
    switch (P.ear) {
      case 'pointy':
        for (const s of [-1, 1]) {
          c.save(); c.translate(s * 26, -150); c.rotate(s * (0.28 + wig));
          G.poly(c, [-17, 10, 0, -46, 17, 10]); G.paint(c, dk, PT.line(dk), 3);
          G.poly(c, [-8, 6, 0, -30, 8, 6]); c.fillStyle = '#f6c5cf'; c.fill();
          c.restore();
        }
        break;
      case 'fold':
        for (const s of [-1, 1]) {
          c.save(); c.translate(s * 30, -150); c.rotate(s * (0.35 + wig));
          G.poly(c, [-16, 8, -2, -30, 16, 6]); G.paint(c, col, PT.line(col), 3);
          // 先が折れている
          G.poly(c, [-2, -30, 12, -14, s * 0 + 18, -2]); G.paint(c, dk, PT.line(dk), 2.5);
          c.restore();
        }
        break;
      case 'round':
        for (const s of [-1, 1]) {
          G.circ(c, s * 34, -152, 17); G.paint(c, dk, PT.line(dk), 3);
          G.circ(c, s * 34, -152, 9); c.fillStyle = PT.shade(P.color, 0.35); c.fill();
        }
        break;
      case 'curl':
        for (const s of [-1, 1]) {
          G.circ(c, s * 38, -146, 15); G.paint(c, dk, PT.line(dk), 3);
          c.strokeStyle = PT.shade(P.color, 0.3); c.lineWidth = 3;
          c.beginPath(); c.arc(s * 38, -146, 7, 0, 4.5); c.stroke();
        }
        break;
      case 'fluffy':
        for (const s of [-1, 1]) {
          G.ell(c, s * 40, -150, 12, 10, s * 0.4); G.paint(c, dk, PT.line(dk), 3);
        }
        break;
      default: break;
    }
  }

  function face(c, P, ch, t, look) {
    const lx = look * 7;
    const ex = 19, ey = -121;
    const f = ch.face || 'happy';
    const blink = ((t + ch.seed * 1000) % 4200) < 130;
    // 目のまわりの 明るい毛（やさしい表情に）
    c.fillStyle = P.eyePatch || PT.shade(P.color, P.color === '#f7f2ec' ? 0.6 : 0.28);
    G.ell(c, -ex + lx, ey + 1, 15, 16.5); c.fill();
    G.ell(c, ex + lx, ey + 1, 15, 16.5); c.fill();
    // ほっぺ
    c.fillStyle = 'rgba(255,120,140,0.38)';
    const puff = f === 'eat' ? 1.35 : 1;
    G.ell(c, -32 + lx, -101, 10 * puff, 7 * puff); c.fill();
    G.ell(c, 32 + lx, -101, 10 * puff, 7 * puff); c.fill();
    if (P.acc === 'freckle') {
      c.fillStyle = P.accColor;
      [[-35, -106], [-29, -110], [-39, -100], [35, -106], [29, -110], [39, -100]].forEach(([x, y]) => { G.circ(c, x + lx, y, 2); c.fill(); });
    }
    // マズル
    G.ell(c, lx * 1.1, -98, 22, 15.5); G.paint(c, P.muzzle, PT.shade(P.muzzle, -0.22), 2.5);
    // 目
    c.fillStyle = '#2a1f35'; c.strokeStyle = '#2a1f35'; c.lineWidth = 4.2; c.lineCap = 'round';
    const closedArc = (x, y, up) => { c.beginPath(); if (up) c.arc(x, y + 5, 9, Math.PI * 1.15, Math.PI * 1.85); else c.arc(x, y - 5, 9, Math.PI * 0.15, Math.PI * 0.85); c.stroke(); };
    const lashes = (x, y, s) => { if (!P.lash) return; c.lineWidth = 3; c.beginPath(); c.moveTo(x + s * 8, y - 8); c.lineTo(x + s * 14, y - 12); c.moveTo(x + s * 9, y - 3); c.lineTo(x + s * 15, y - 4); c.stroke(); c.lineWidth = 4.2; };
    if (f === 'laugh' || f === 'eat' || f === 'love') { closedArc(-ex + lx, ey, true); closedArc(ex + lx, ey, true); }
    else if (f === 'sleep') { closedArc(-ex + lx, ey, false); closedArc(ex + lx, ey, false); }
    else if (f === 'silly') { c.beginPath(); c.moveTo(-ex + lx - 7, ey - 7); c.lineTo(-ex + lx + 6, ey); c.lineTo(-ex + lx - 7, ey + 7); c.moveTo(ex + lx + 7, ey - 7); c.lineTo(ex + lx - 6, ey); c.lineTo(ex + lx + 7, ey + 7); c.stroke(); }
    else if (blink) { c.beginPath(); c.moveTo(-ex + lx - 8, ey); c.lineTo(-ex + lx + 8, ey); c.moveTo(ex + lx - 8, ey); c.lineTo(ex + lx + 8, ey); c.stroke(); }
    else {
      const big = f === 'surprise' ? 1.15 : 1;
      const lookY = f === 'up' ? -3 : 0;
      for (const s of [-1, 1]) {
        const x = s * ex + lx, y = ey + lookY;
        if (f === 'puzzled' && s === 1) { c.beginPath(); c.moveTo(x - 8, y); c.lineTo(x + 8, y - 2); c.stroke(); continue; }
        // くろめ（大きく、下に ちょっと 明るい色）
        G.ell(c, x, y, 9.5 * big, 12 * big); c.fillStyle = '#2a1f35'; c.fill();
        G.ell(c, x, y + 5 * big, 6.5 * big, 5 * big); c.fillStyle = 'rgba(120,90,150,.55)'; c.fill();
        // キラキラの ハイライト
        G.circ(c, x + 3.4 * big, y - 4.6 * big, 4 * big); c.fillStyle = '#fff'; c.fill();
        G.circ(c, x - 3.2 * big, y + 4.6 * big, 1.9 * big); c.fill();
        lashes(x, y, s);
      }
      if (f === 'determined') {
        c.beginPath(); c.moveTo(-ex + lx - 9, ey - 18); c.lineTo(-ex + lx + 6, ey - 14); c.moveTo(ex + lx + 9, ey - 18); c.lineTo(ex + lx - 6, ey - 14); c.stroke();
      }
    }
    // 鼻
    c.fillStyle = '#3a2c3c';
    G.ell(c, lx * 1.2, -106, 6.5, 4.5); c.fill();
    G.ell(c, lx * 1.2 - 2, -107.5, 2.2, 1.3); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
    // 口
    c.strokeStyle = '#3a2c3c'; c.lineWidth = 2.6;
    const mx = lx * 1.2;
    if (f === 'laugh' || f === 'yay') {
      c.beginPath(); c.moveTo(mx - 10, -98); c.quadraticCurveTo(mx, -80, mx + 10, -98); c.closePath();
      c.fillStyle = '#c94a63'; c.fill(); c.stroke();
      G.ell(c, mx, -88, 4, 2.5); c.fillStyle = '#ff9eb0'; c.fill();
    } else if (f === 'silly') {
      c.beginPath(); c.moveTo(mx - 9, -97); c.quadraticCurveTo(mx, -92, mx + 9, -97); c.stroke();
      G.ell(c, mx + 2, -90, 6, 8); c.fillStyle = '#ff7a95'; c.fill(); c.stroke();
    } else if (f === 'surprise') {
      G.ell(c, mx, -92, 5, 6.5); c.fillStyle = '#c94a63'; c.fill(); c.stroke();
    } else if (f === 'eat') {
      const o = Math.abs(Math.sin(t * 0.02)) * 5;
      G.ell(c, mx, -94, 6, 1.5 + o); c.fillStyle = '#c94a63'; c.fill(); c.stroke();
    } else if (f === 'puzzled') {
      c.beginPath(); c.moveTo(mx - 7, -94); c.quadraticCurveTo(mx - 3, -98, mx, -94); c.quadraticCurveTo(mx + 3, -90, mx + 7, -94); c.stroke();
    } else if (f === 'roar') {
      c.beginPath(); c.moveTo(mx - 10, -97); c.lineTo(mx + 10, -97); c.lineTo(mx, -84); c.closePath(); c.fillStyle = '#c94a63'; c.fill(); c.stroke();
    } else {
      c.beginPath(); c.moveTo(mx, -103); c.lineTo(mx, -98);
      c.moveTo(mx - 8, -97); c.quadraticCurveTo(mx - 4, -92, mx, -98); c.quadraticCurveTo(mx + 4, -92, mx + 8, -97); c.stroke();
    }
  }

  function accessory(c, P, ch, t, look) {
    if (PT.CHAR_EXT.acc[P.acc]) PT.CHAR_EXT.acc[P.acc](c, P, ch, t, look * 7);
    const lx = look * 7;
    switch (P.acc) {
      case 'bow': {
        c.save(); c.translate(-26, -158); c.rotate(-0.3);
        G.poly(c, [0, 0, -22, -14, -22, 14]); G.fillO(c, P.accColor, 2.5);
        G.poly(c, [0, 0, 22, -14, 22, 14]); G.fillO(c, P.accColor, 2.5);
        G.circ(c, 0, 0, 7); G.fillO(c, PT.shade(P.accColor, 0.2), 2.5);
        c.restore();
        break;
      }
      case 'glasses': {
        c.strokeStyle = P.accColor; c.lineWidth = 3.4;
        G.circ(c, -19 + lx, -121, 16); c.stroke();
        G.circ(c, 19 + lx, -121, 16); c.stroke();
        c.beginPath(); c.moveTo(-3 + lx, -123); c.quadraticCurveTo(lx, -127, 3 + lx, -123); c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.15)'; G.circ(c, -19 + lx, -121, 15); c.fill(); G.circ(c, 19 + lx, -121, 15); c.fill();
        break;
      }
      case 'flower': {
        c.save(); c.translate(26, -150);
        for (let i = 0; i < 5; i++) { const a = (i / 5) * PT.TAU; G.circ(c, Math.cos(a) * 7, Math.sin(a) * 7, 6); G.fillO(c, P.accColor, 2); }
        G.circ(c, 0, 0, 5); G.fillO(c, '#ffd84a', 2);
        c.restore();
        break;
      }
      case 'tuft': {
        c.save(); c.translate(0, -158);
        c.strokeStyle = PT.line(P.color); c.fillStyle = P.color; c.lineWidth = 3;
        c.beginPath(); c.moveTo(-8, 4); c.quadraticCurveTo(-14, -22, 4, -24); c.quadraticCurveTo(14, -24, 10, -12); c.quadraticCurveTo(4, -6, 2, -14);
        c.quadraticCurveTo(4, -2, 8, 4); c.closePath(); c.fill(); c.stroke();
        G.star(c, 18, -6, 7, 3); G.fillO(c, P.accColor, 2);
        c.restore();
        break;
      }
      default: break;
    }
  }

  function bodyAcc(c, P) {
    if (PT.CHAR_EXT.body[P.acc]) PT.CHAR_EXT.body[P.acc](c, P);
    if (P.acc === 'scarf') {
      G.poly(c, [-24, -82, 24, -82, 0, -58]); G.fillO(c, P.accColor, 2.5);
      G.rr(c, -26, -88, 52, 11, 5); G.fillO(c, P.accColor, 2.5);
    } else if (P.acc === 'mane') {
      G.rr(c, -24, -86, 48, 10, 5); G.fillO(c, P.accColor, 2.5);
      G.circ(c, 0, -76, 6); G.fillO(c, '#ffd84a', 2);
    } else if (P.acc === 'tuft') {
      G.circ(c, 14, -52, 6); c.fillStyle = PT.shade(P.color, 0.45); c.fill();
    }
  }

  /* 衣装（ぼうし・からだ・かお） */
  /* 追加衣装の 描画（あとから 登録。同じ名前なら こちらが 優先） */
  const EXT = (PT.WEAR_EXT = { hat: {}, body: {}, back: {}, face: {} });
  function wearBack(c, ch, t) {
    const w = ch.wear || {};
    if (EXT.back[w.back]) EXT.back[w.back](c, ch, t);
    if (EXT.body[w.body] && EXT.body[w.body].back) EXT.body[w.body].back(c, ch, t);
    if (w.body === 'cape') {
      const fl = Math.sin(t * 0.01) * 6 + (ch.pose === 'run' || ch.pose === 'fly' ? 18 : 0);
      c.beginPath(); c.moveTo(-24, -86); c.quadraticCurveTo(-46 - fl, -40, -40 - fl, -6); c.lineTo(36 - fl * 0.3, -8); c.quadraticCurveTo(40, -50, 24, -86); c.closePath();
      G.fillO(c, '#e2434b', 3);
    }
    if (w.back === 'wings') {
      const fl = Math.sin(t * 0.02) * 0.18;
      for (const sd of [-1, 1]) {
        c.save(); c.translate(sd * 8, -70); c.rotate(sd * (0.3 + fl));
        G.ell(c, sd * 30, -26, 30, 20, sd * -0.5); G.paint(c, 'rgba(190,230,255,.75)', '#9fc8f0', 3);
        G.ell(c, sd * 24, 10, 20, 13, sd * 0.5); G.paint(c, 'rgba(255,200,235,.75)', '#f0a8d0', 3);
        c.fillStyle = '#fff'; G.star(c, sd * 34, -30, 5, 2); c.fill();
        c.restore();
      }
    }
    if (w.body === 'bag' || ch.wear?.back === 'bag') {
      G.rr(c, -40, -86, 30, 40, 9); G.fillO(c, '#d9822b', 3);
    }
  }
  function wearBody(c, ch) {
    const w = ch.wear || {};
    if (EXT.body[w.body]) { EXT.body[w.body](c, ch, ch._t || 0); return; }
    switch (w.body) {
      case 'apron':
        c.beginPath(); c.moveTo(-18, -80); c.lineTo(18, -80); c.lineTo(24, -26); c.quadraticCurveTo(0, -18, -24, -26); c.closePath();
        G.fillO(c, '#e8504a', 3);
        G.rr(c, -10, -52, 20, 13, 4); G.fillO(c, '#ffd9d2', 2);
        c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(-24, -70); c.lineTo(24, -70); c.stroke();
        break;
      case 'doctor':
        c.beginPath(); c.moveTo(-28, -82); c.lineTo(28, -82); c.lineTo(31, -26); c.lineTo(-31, -26); c.closePath();
        G.fillO(c, '#ffffff', 3);
        c.strokeStyle = '#c9d8e6'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -82); c.lineTo(0, -28); c.stroke();
        c.strokeStyle = '#3d6fb4'; c.lineWidth = 4; c.beginPath(); c.moveTo(-14, -84); c.quadraticCurveTo(-18, -54, 0, -50); c.quadraticCurveTo(18, -54, 14, -84); c.stroke();
        G.circ(c, 0, -50, 6); G.fillO(c, '#9fb3c8', 2);
        G.rr(c, 10, -46, 12, 12, 2); c.fillStyle = '#e8424a'; c.fill();
        break;
      case 'robot':
        G.rr(c, -32, -86, 64, 64, 10); G.fillO(c, '#c7a37a', 3);
        G.rr(c, -16, -72, 32, 22, 5); G.fillO(c, '#7fd0e8', 2);
        ['#e8424a', '#ffd23f', '#58c46b'].forEach((col, i) => { G.circ(c, -12 + i * 12, -38, 4); c.fillStyle = col; c.fill(); });
        break;
      case 'dress': {
        c.beginPath(); c.moveTo(-20, -82); c.lineTo(20, -82); c.lineTo(22, -54); c.quadraticCurveTo(52, -30, 54, -8); c.quadraticCurveTo(0, 4, -54, -8); c.quadraticCurveTo(-52, -30, -22, -54); c.closePath();
        G.fillO(c, '#ffaed0', 3);
        c.fillStyle = '#ffffff'; [[-30, -24], [0, -18], [30, -24], [-14, -40], [16, -40]].forEach(([x, y]) => { G.circ(c, x, y, 3.5); c.fill(); });
        c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.moveTo(-50, -10); c.quadraticCurveTo(0, 0, 50, -10); c.stroke();
        G.rr(c, -22, -60, 44, 8, 4); G.fillO(c, '#ff7aa8', 2);
        G.circ(c, 0, -56, 6); G.fillO(c, '#ffd84a', 2);
        break;
      }
      case 'tutu':
        for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(-28, -50 + k * 6); for (let i = 0; i <= 8; i++) { const x = -52 + i * 13; c.lineTo(x, -30 + k * 6 + (i % 2 ? 6 : -2)); } c.lineTo(28, -50 + k * 6); c.closePath(); G.fillO(c, k ? '#ffd1e3' : '#fff0f6', 2.5); }
        G.rr(c, -26, -58, 52, 10, 5); G.fillO(c, '#ff9fc4', 2);
        break;
      case 'yukata':
        c.beginPath(); c.moveTo(-28, -84); c.lineTo(28, -84); c.lineTo(30, -24); c.lineTo(-30, -24); c.closePath(); G.fillO(c, '#5b8fe0', 3);
        c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 6; i++) { const x = -24 + (i % 3) * 24, y = -76 + Math.floor(i / 3) * 34; for (let k = 0; k < 5; k++) { const a = (k / 5) * PT.TAU; G.circ(c, x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3); c.fill(); } } c.restore();
        c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.moveTo(-14, -84); c.lineTo(8, -56); c.moveTo(14, -84); c.lineTo(0, -66); c.stroke();
        G.rr(c, -30, -58, 60, 14, 4); G.fillO(c, '#ffcf3f', 2.5);
        G.rr(c, 14, -62, 18, 22, 6); G.fillO(c, '#ffcf3f', 2.5);
        break;
      case 'raincoat':
        c.beginPath(); c.moveTo(-26, -86); c.lineTo(26, -86); c.lineTo(36, -20); c.lineTo(-36, -20); c.closePath(); G.fillO(c, '#ffd23f', 3);
        c.strokeStyle = PT.line('#ffd23f'); c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -86); c.lineTo(0, -20); c.stroke();
        [-70, -52, -34].forEach((y) => { G.circ(c, 6, y, 3.5); c.fillStyle = '#4c9be8'; c.fill(); });
        G.rr(c, -22, -46, 14, 12, 3); c.strokeStyle = PT.line('#ffd23f'); c.stroke();
        break;
      case 'bowtie':
        G.poly(c, [0, -80, -18, -90, -18, -70]); G.fillO(c, '#e2434b', 2.5);
        G.poly(c, [0, -80, 18, -90, 18, -70]); G.fillO(c, '#e2434b', 2.5);
        G.circ(c, 0, -80, 5); G.fillO(c, '#b8303a', 2);
        break;
      case 'ghost':
        break;
      default: break;
    }
  }
  function wearHead(c, ch, t, look) {
    const w = ch.wear || {};
    const lx = look * 7;
    if (w.face === 'sunglasses') {
      c.fillStyle = '#26203a';
      G.rr(c, -37 + lx, -135, 33, 26, 10); c.fill();
      G.rr(c, 4 + lx, -135, 33, 26, 10); c.fill();
      c.fillRect(-6 + lx, -128, 12, 4);
      c.fillStyle = 'rgba(255,255,255,.5)'; G.rr(c, -31 + lx, -131, 11, 5, 2); c.fill(); G.rr(c, 10 + lx, -131, 11, 5, 2); c.fill();
    }
    if (w.face === 'heartglasses') {
      for (const sx of [-19, 19]) { G.heart(c, sx + lx, -118, 17); G.fillO(c, 'rgba(255,111,145,.85)', 3); G.circ(c, sx + lx - 5, -127, 3); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); }
      c.strokeStyle = '#d94a72'; c.lineWidth = 3; c.beginPath(); c.moveTo(-5 + lx, -124); c.lineTo(5 + lx, -124); c.stroke();
    }
    if (w.face === 'mustache') {
      const mx = lx * 1.2;
      for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(mx, -101); c.quadraticCurveTo(mx + sd * 14, -108, mx + sd * 26, -100); c.quadraticCurveTo(mx + sd * 32, -104, mx + sd * 30, -110); c.quadraticCurveTo(mx + sd * 36, -96, mx + sd * 22, -94); c.quadraticCurveTo(mx + sd * 10, -94, mx, -99); c.closePath(); G.fillO(c, '#6b4a2b', 2.5); }
    }
    if (EXT.hat[w.hat]) { EXT.hat[w.hat](c, ch, t, lx); return; }
    switch (w.hat) {
      case 'explorer':
        G.ell(c, 0, -152, 60, 13); G.fillO(c, '#d7b56d', 3);
        c.beginPath(); c.moveTo(-38, -152); c.quadraticCurveTo(-36, -196, 0, -197); c.quadraticCurveTo(36, -196, 38, -152); c.closePath(); G.fillO(c, '#e6c77e', 3);
        G.rr(c, -38, -162, 76, 9, 3); G.fillO(c, '#8a5a2b', 2);
        break;
      case 'chef':
        G.rr(c, -30, -172, 60, 24, 6); G.fillO(c, '#ffffff', 3);
        G.blob(c, [-34, -176, -36, -206, -12, -222, 12, -224, 36, -206, 34, -176]); G.fillO(c, '#ffffff', 3);
        break;
      case 'crown':
        G.poly(c, [-30, -150, -34, -192, -16, -170, 0, -198, 16, -170, 34, -192, 30, -150]); G.fillO(c, '#ffcb2f', 3);
        G.circ(c, 0, -164, 5); c.fillStyle = '#e8384f'; c.fill();
        G.circ(c, -18, -160, 4); c.fillStyle = '#4c8ce0'; c.fill();
        G.circ(c, 18, -160, 4); c.fillStyle = '#58c46b'; c.fill();
        break;
      case 'party': {
        c.beginPath(); c.moveTo(-22, -152); c.lineTo(6, -212); c.lineTo(28, -150); c.closePath(); G.fillO(c, '#58b9f0', 3);
        c.save(); c.clip();
        c.fillStyle = '#ffd94a'; for (let i = 0; i < 4; i++) { c.fillRect(-30, -205 + i * 16, 70, 6); }
        c.restore();
        G.circ(c, 6, -214, 8); G.fillO(c, '#ff6f91', 2.5);
        break;
      }
      case 'witch':
        G.ell(c, 0, -152, 62, 12); G.fillO(c, '#7a4fc4', 3);
        c.beginPath(); c.moveTo(-34, -154); c.quadraticCurveTo(-10, -200, 18, -238); c.quadraticCurveTo(20, -196, 34, -154); c.closePath(); G.fillO(c, '#8a5fd6', 3);
        G.star(c, 2, -184, 10, 4.5); G.fillO(c, '#ffd94a', 2);
        break;
      case 'catears':
        G.rr(c, -40, -158, 80, 10, 5); G.fillO(c, '#3e3550', 2);
        for (const sd of [-1, 1]) { G.poly(c, [sd * 18, -156, sd * 40, -200, sd * 44, -152]); G.fillO(c, '#4a4060', 3); G.poly(c, [sd * 24, -158, sd * 38, -188, sd * 40, -158]); c.fillStyle = '#ff9fbf'; c.fill(); }
        break;
      case 'flowercrown': {
        const cols = ['#ff8fab', '#ffd84a', '#ffffff', '#b39ae8', '#7fd0e8', '#ff8a65'];
        c.strokeStyle = '#5fae58'; c.lineWidth = 5; c.beginPath(); c.ellipse(0, -150, 46, 12, 0, Math.PI, PT.TAU); c.stroke();
        for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * Math.PI; const fx = Math.cos(a) * 46, fy = -150 + Math.sin(a) * 12; for (let k = 0; k < 5; k++) { const b = (k / 5) * PT.TAU; G.circ(c, fx + Math.cos(b) * 6, fy + Math.sin(b) * 6, 5.5); c.fillStyle = cols[i % cols.length]; c.fill(); } G.circ(c, fx, fy, 4); c.fillStyle = '#ffb02e'; c.fill(); }
        break;
      }
      case 'tiara':
        G.poly(c, [-34, -152, -28, -172, -14, -164, 0, -190, 14, -164, 28, -172, 34, -152]); G.fillO(c, '#e9eef8', 3);
        G.ell(c, 0, -172, 6, 8); c.fillStyle = '#ff6f91'; c.fill(); G.circ(c, -2, -175, 2); c.fillStyle = '#fff'; c.fill();
        G.circ(c, -22, -160, 3.5); c.fillStyle = '#7fd0e8'; c.fill(); G.circ(c, 22, -160, 3.5); c.fill();
        if ((t / 400) % 3 < 1) { G.star(c, 14, -188, 6, 2); c.fillStyle = '#fff'; c.fill(); }
        break;
      case 'pirate':
        c.beginPath(); c.moveTo(-58, -158); c.quadraticCurveTo(-40, -150, 0, -152); c.quadraticCurveTo(40, -150, 58, -158); c.quadraticCurveTo(46, -200, 0, -208); c.quadraticCurveTo(-46, -200, -58, -158); c.closePath(); G.fillO(c, '#2f2a3e', 3);
        c.strokeStyle = '#ffcf3f'; c.lineWidth = 3; c.beginPath(); c.moveTo(-50, -160); c.quadraticCurveTo(0, -150, 50, -160); c.stroke();
        G.circ(c, 0, -182, 9); c.fillStyle = '#fff'; c.fill(); c.fillStyle = '#2f2a3e'; G.circ(c, -3, -183, 2); c.fill(); G.circ(c, 3, -183, 2); c.fill();
        c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -168); c.lineTo(10, -160); c.moveTo(10, -168); c.lineTo(-10, -160); c.stroke();
        break;
      case 'firehat':
        G.ell(c, 0, -154, 60, 14); G.fillO(c, '#d83a3a', 3);
        c.beginPath(); c.moveTo(-40, -156); c.quadraticCurveTo(-38, -204, 0, -206); c.quadraticCurveTo(38, -204, 40, -156); c.closePath(); G.fillO(c, '#ef4b4b', 3);
        c.strokeStyle = PT.line('#ef4b4b'); c.lineWidth = 3; c.beginPath(); c.moveTo(0, -206); c.lineTo(0, -158); c.stroke();
        G.poly(c, [-12, -192, 12, -192, 14, -170, 0, -160, -14, -170]); G.fillO(c, '#ffcf3f', 2.5);
        break;
      case 'police':
        G.ell(c, 6, -156, 40, 10); G.fillO(c, '#26304d', 3);
        c.beginPath(); c.moveTo(-40, -160); c.quadraticCurveTo(-44, -196, 0, -198); c.quadraticCurveTo(48, -196, 44, -160); c.closePath(); G.fillO(c, '#2f4a8a', 3);
        G.rr(c, -38, -168, 82, 9, 3); c.fillStyle = '#26304d'; c.fill();
        G.star(c, 2, -182, 9, 4); G.fillO(c, '#ffcf3f', 2);
        break;
      case 'nightcap': {
        const sw = Math.sin(t * 0.004) * 4;
        c.beginPath(); c.moveTo(-42, -152); c.quadraticCurveTo(-30, -210, 20, -206); c.quadraticCurveTo(60 + sw, -200, 62 + sw, -160); c.lineTo(52 + sw, -158); c.quadraticCurveTo(46, -186, 18, -184); c.quadraticCurveTo(30, -168, 42, -152); c.closePath(); G.fillO(c, '#7fa8e8', 3);
        c.save(); c.clip(); c.fillStyle = '#c9dcff'; for (let i = 0; i < 6; i++) c.fillRect(-50 + i * 22, -215, 9, 70); c.restore();
        G.circ(c, 58 + sw, -152, 10); G.fillO(c, '#fff6b8', 2.5);
        G.rr(c, -46, -160, 92, 13, 6); G.fillO(c, '#ffffff', 2.5);
        break;
      }
      case 'santa':
        c.beginPath(); c.moveTo(-40, -154); c.quadraticCurveTo(-20, -214, 30, -212); c.quadraticCurveTo(56, -204, 54, -176); c.lineTo(40, -178); c.quadraticCurveTo(36, -190, 26, -190); c.quadraticCurveTo(36, -170, 40, -154); c.closePath(); G.fillO(c, '#e2434b', 3);
        G.circ(c, 50, -172, 11); G.fillO(c, '#ffffff', 2.5);
        G.rr(c, -46, -164, 92, 16, 8); G.fillO(c, '#ffffff', 2.5);
        break;
      case 'beret':
        c.save(); c.translate(6, -158); c.rotate(-0.18);
        G.ell(c, 0, 0, 50, 15); G.fillO(c, '#e2434b', 3);
        G.ell(c, -4, -6, 42, 12); c.fillStyle = PT.shade('#e2434b', 0.15); c.fill();
        c.strokeStyle = '#8a2a30'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -16); c.lineTo(3, -26); c.stroke();
        c.restore();
        break;
      case 'ribbon':
        c.save(); c.translate(0, -164); c.rotate(Math.sin(t * 0.004) * 0.06);
        G.blob(c, [0, 0, -30, -22, -44, -8, -40, 14, -22, 12]); G.fillO(c, '#ff7aa8', 3);
        G.blob(c, [0, 0, 30, -22, 44, -8, 40, 14, 22, 12]); G.fillO(c, '#ff7aa8', 3);
        c.fillStyle = 'rgba(255,255,255,.75)'; [[-26, -6], [-34, 4], [26, -6], [34, 4], [-18, 2], [18, 2]].forEach(([x, y]) => { G.circ(c, x, y, 2.8); c.fill(); });
        G.circ(c, 0, 0, 9); G.fillO(c, '#ff5d92', 3);
        c.restore();
        break;
      case 'frog':
        G.blob(c, [-52, -110, -50, -150, -24, -168, 24, -168, 50, -150, 52, -110, 44, -132, 0, -148, -44, -132]); G.fillO(c, '#6cc06a', 3);
        for (const sd of [-1, 1]) { G.circ(c, sd * 24, -170, 14); G.fillO(c, '#6cc06a', 3); G.circ(c, sd * 24, -172, 9); c.fillStyle = '#fff'; c.fill(); G.circ(c, sd * 24, -171, 5); c.fillStyle = '#2b2440'; c.fill(); }
        c.strokeStyle = PT.line('#6cc06a'); c.lineWidth = 3; c.beginPath(); c.moveTo(-14, -156); c.quadraticCurveTo(0, -150, 14, -156); c.stroke();
        break;
      case 'ghost': {
        const wob = Math.sin(t * 0.01) * 4;
        c.beginPath(); c.moveTo(-58, -6);
        c.quadraticCurveTo(-64, -140, -40, -170); c.quadraticCurveTo(0, -205, 40, -170); c.quadraticCurveTo(64, -140, 58, -6);
        for (let i = 0; i < 5; i++) { const x = 58 - (i + 1) * 23.2; c.quadraticCurveTo(x + 11.6, -18 + (i % 2 ? wob : -wob), x, -4); }
        c.closePath(); G.fillO(c, '#9fc8f0', 3);
        c.fillStyle = '#2b2440'; G.ell(c, -16 + lx, -118, 7, 10); c.fill(); G.ell(c, 16 + lx, -118, 7, 10); c.fill();
        G.ell(c, lx, -92, 9, 7); c.fill();
        break;
      }
      default: break;
    }
  }
  function wearFront(c, ch, t) {
    if (ch.wear?.hat === 'helmet') {
      G.circ(c, 0, -122, 66); c.fillStyle = 'rgba(160,215,255,0.3)'; c.fill();
      c.strokeStyle = '#8fbfe8'; c.lineWidth = 4; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 5; c.beginPath(); c.arc(0, -122, 54, -2.6, -2.0); c.stroke();
      G.rr(c, -40, -64, 80, 14, 7); G.fillO(c, '#e8eef6', 3);
    }
  }

  PT._wearBody = wearBody; PT._wearHead = wearHead; PT._wearFront = wearFront; PT._wearBack = wearBack; PT._poseParams = poseParams;

  /* メイン：キャラクターを描く（足元が原点） */
  PT.drawChar = (c, ch, t) => {
    ch._t = t;
    const P = ch.def;
    const pp = poseParams(ch, t);
    const look = ch.look || 0;
    const ghost = ch.wear?.hat === 'ghost';
    c.save();
    c.translate(ch.x, ch.y - (ch.z || 0));
    const s = (ch.scale || 1) * P.size;
    c.scale(s * (ch.flip ? -1 : 1), s);
    if (pp.rot) c.rotate(pp.rot);
    c.translate(0, pp.bodyY);
    c.scale(pp.sx, pp.sy);
    c.rotate(pp.lean);

    if (ghost) {
      // おばけごっこ中：もうふをかぶっている
      if (!pp.hideLegs) {
        G.limb(c, -14, -10, -14 + Math.sin(pp.legL) * 18, 0, 13, P.color);
        G.limb(c, 14, -10, 14 + Math.sin(pp.legR) * 18, 0, 13, P.color);
      }
      wearHead(c, ch, t, look);
      c.restore();
      return;
    }

    if (P.human) { PT._drawHumanBody(c, ch, t, pp, look); } else {
    // しっぽ
    if (PT.CHAR_EXT.tail[P.tail]) PT.CHAR_EXT.tail[P.tail](c, P, t, ch, pp);
    else if (P.tail === 'puff') { G.circ(c, -28, -40 + Math.sin(t * 0.01) * 2, 13); G.fillO(c, '#ffffff', 3); }
    else {
    c.save(); c.translate(-20, -40); c.rotate(-0.8 + pp.tail);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-24, -14, -26, -40);
    c.strokeStyle = PT.line(P.color); c.lineWidth = 17; c.lineCap = 'round'; c.stroke();
    c.strokeStyle = P.color; c.lineWidth = 12; c.stroke();
    G.circ(c, -26, -40, 6); c.fillStyle = ch.cid === 'pon' ? '#fff6ea' : P.dark; c.fill();
    c.restore();
    }

    wearBack(c, ch, t);

    // あし
    if (!pp.hideLegs) {
      if (pp.sit) {
        G.limb(c, -14, -28, -22, -6, 15, P.color);
        G.limb(c, 14, -28, 24, -6, 15, P.color);
        G.ell(c, -24, -6, 12, 8); G.fillO(c, P.dark, 2.5);
        G.ell(c, 26, -6, 12, 8); G.fillO(c, P.dark, 2.5);
      } else {
        for (const [sx, a] of [[-13, pp.legL], [13, pp.legR]]) {
          const fx = sx + Math.sin(a) * 26, fy = -30 + Math.cos(a) * 28;
          G.limb(c, sx, -30, fx, fy - 4, 15, P.color);
          G.ell(c, fx + 2, fy - 2, 12, 7.5); G.fillO(c, P.dark, 2.5);
        }
      }
    }

    // からだ
    G.blob(c, [-30, -60, -24, -86, 0, -92, 24, -86, 30, -60, 28, -30, 0, -20, -28, -30]);
    G.fillO(c, P.color, 3);
    G.ell(c, 0, -50, 18, 22); c.fillStyle = P.belly; c.fill();
    bodyAcc(c, P);
    wearBody(c, ch);

    // うで
    const arm = (side, ang) => {
      const sx = side * 25, sy = -74;
      const ex = sx + Math.sin(ang) * 30, ey = sy + Math.cos(ang) * 30;
      G.limb(c, sx, sy, ex, ey, 13, P.color);
      G.circ(c, ex, ey, 8); G.fillO(c, P.color, 2.5);
      return [ex, ey];
    };
    const hL = arm(-1, pp.armL);
    const hR = arm(1, pp.armR);
    ch._hand = hR; ch._handL = hL;

    // あたま
    c.save();
    c.translate(0, -100); c.rotate(pp.headTilt); c.translate(0, 100);
    earsBack(c, P, t, ch);
    G.blob(c, [-48, -118, -40, -150, 0, -162, 40, -150, 48, -118, 38, -88, 0, -80, -38, -88]);
    G.fillO(c, P.color, 3);
    // おでこの模様（オリジナル）
    if (ch.cid === 'lulu') { G.ell(c, 0, -150, 12, 7); c.fillStyle = P.belly; c.fill(); }
    if (ch.cid === 'gaku') { G.ell(c, -24, -140, 10, 7, -0.4); c.fillStyle = PT.shade(P.color, 0.25); c.fill(); }
    if (ch.cid === 'pon') { G.ell(c, 0, -152, 9, 6); c.fillStyle = PT.shade(P.color, -0.12); c.fill(); }
    earsFront(c, P, t, ch);
    face(c, P, ch, t, look);
    accessory(c, P, ch, t, look);
    wearHead(c, ch, t, look);
    wearFront(c, ch, t);
    if (ch.headItem && PT.ITEMS[ch.headItem]) {
      const it = PT.ITEMS[ch.headItem];
      c.save(); c.translate(0, -150); const k = Math.min(0.9, 80 / Math.max(it.w, it.h)); c.rotate(Math.sin(t * 0.004) * 0.08); c.scale(k, k); it.draw(c, t, {}); c.restore();
    }
    c.restore();
    }

    // もっている物
    if (ch.holdType && PT.ITEMS[ch.holdType]) {
      const it = PT.ITEMS[ch.holdType];
      c.save();
      const hR2 = ch._hand || [20, -60]; const hx = ch.pose === 'carry' ? 0 : hR2[0], hy = ch.pose === 'carry' ? -180 - (P.legExt || 0) : hR2[1] + 10;
      c.translate(hx, hy);
      const k = Math.min(0.75, 70 / Math.max(it.w, it.h));
      c.scale(k, k);
      it.draw(c, t, { held: true, color: ch.balloonColor });
      c.restore();
    }
    c.restore();
  };

  /* アイコン用：静止したキャラの顔＋体 */
  PT.charIcon = (cid, size = 96, opts = {}) => {
    const cv = document.createElement('canvas');
    const dpr = Math.min(3, Math.max(2, window.devicePixelRatio || 1));
    cv.width = cv.height = Math.round(size * dpr);
    const c = cv.getContext('2d');
    c.scale(dpr, dpr);
    const D = PT.CHARS[cid], ext = (D.legExt || 0) + (D.hover || 0);
    // かおの アイコンは 大人も こどもも おなじ おおきさに そろえる
    const sc = opts.full ? size / (215 + ext) / D.size : size / 150 / (D.fairy ? D.size * 1.1 : Math.max(1, D.size));
    const y = opts.full ? size * 0.98 : size * 1.32 + (ext ? ext + (D.fairy ? 0 : 10) : 0) * sc * D.size;
    const ch = { def: D, cid, x: size / 2, y, pose: 'idle', poseT: 0, face: opts.face || 'happy', wear: {}, seed: 1.7, scale: sc, look: 0 };
    PT.drawChar(c, ch, 300);
    return cv;
  };
})();
