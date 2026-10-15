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
  };
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

  /* 耳（頭の後ろ側） */
  function earsBack(c, P, t, ch) {
    const col = P.color, dk = P.dark, ln = PT.line(col);
    const wig = Math.sin(t * 0.006 + ch.seed) * 0.05;
    c.save();
    switch (P.ear) {
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
    const ex = 17, ey = -124;
    const f = ch.face || 'happy';
    const blink = ((t + ch.seed * 1000) % 4200) < 130;
    // ほっぺ
    c.fillStyle = 'rgba(255,120,140,0.35)';
    const puff = f === 'eat' ? 1.35 : 1;
    G.ell(c, -31 + lx, -103, 10 * puff, 7 * puff); c.fill();
    G.ell(c, 31 + lx, -103, 10 * puff, 7 * puff); c.fill();
    if (P.acc === 'freckle') {
      c.fillStyle = P.accColor;
      [[-34, -108], [-28, -112], [-38, -102], [34, -108], [28, -112], [38, -102]].forEach(([x, y]) => { G.circ(c, x + lx, y, 2); c.fill(); });
    }
    // マズル
    G.ell(c, lx * 1.1, -100, 25, 18); G.paint(c, P.muzzle, PT.shade(P.muzzle, -0.25), 2.5);
    // 目
    c.fillStyle = '#2b2440'; c.strokeStyle = '#2b2440'; c.lineWidth = 4; c.lineCap = 'round';
    const closedArc = (x, y, up) => { c.beginPath(); if (up) c.arc(x, y + 4, 7, Math.PI * 1.15, Math.PI * 1.85); else c.arc(x, y - 4, 7, Math.PI * 0.15, Math.PI * 0.85); c.stroke(); };
    if (f === 'laugh' || f === 'eat' || f === 'love') { closedArc(-ex + lx, ey, true); closedArc(ex + lx, ey, true); }
    else if (f === 'sleep') { closedArc(-ex + lx, ey, false); closedArc(ex + lx, ey, false); }
    else if (f === 'silly') { c.beginPath(); c.moveTo(-ex + lx - 6, ey - 6); c.lineTo(-ex + lx + 5, ey); c.lineTo(-ex + lx - 6, ey + 6); c.moveTo(ex + lx + 6, ey - 6); c.lineTo(ex + lx - 5, ey); c.lineTo(ex + lx + 6, ey + 6); c.stroke(); }
    else if (blink) { c.beginPath(); c.moveTo(-ex + lx - 6, ey); c.lineTo(-ex + lx + 6, ey); c.moveTo(ex + lx - 6, ey); c.lineTo(ex + lx + 6, ey); c.stroke(); }
    else {
      const big = f === 'surprise' ? 1.3 : 1;
      const lookY = f === 'up' ? -3 : 0;
      for (const s of [-1, 1]) {
        if (f === 'puzzled' && s === 1) { c.beginPath(); c.moveTo(s * ex + lx - 6, ey); c.lineTo(s * ex + lx + 6, ey - 2); c.stroke(); continue; }
        G.ell(c, s * ex + lx, ey + lookY, 6.5 * big, 8.5 * big); c.fillStyle = '#2b2440'; c.fill();
        G.circ(c, s * ex + lx + 2.2, ey + lookY - 3.2, 2.6 * big); c.fillStyle = '#fff'; c.fill();
      }
      if (f === 'determined') {
        c.beginPath(); c.moveTo(-ex + lx - 8, ey - 14); c.lineTo(-ex + lx + 6, ey - 10); c.moveTo(ex + lx + 8, ey - 14); c.lineTo(ex + lx - 6, ey - 10); c.stroke();
      }
    }
    // 鼻
    c.fillStyle = '#3a2c3c';
    G.ell(c, lx * 1.2, -108, 8, 5.5); c.fill();
    G.ell(c, lx * 1.2 - 2, -110, 2.5, 1.5); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
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
        G.circ(c, -17 + lx, -124, 13); c.stroke();
        G.circ(c, 17 + lx, -124, 13); c.stroke();
        c.beginPath(); c.moveTo(-4 + lx, -125); c.quadraticCurveTo(lx, -129, 4 + lx, -125); c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.18)'; G.circ(c, -17 + lx, -124, 12); c.fill(); G.circ(c, 17 + lx, -124, 12); c.fill();
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
  function wearBack(c, ch, t) {
    const w = ch.wear || {};
    if (w.body === 'cape') {
      const fl = Math.sin(t * 0.01) * 6 + (ch.pose === 'run' || ch.pose === 'fly' ? 18 : 0);
      c.beginPath(); c.moveTo(-24, -86); c.quadraticCurveTo(-46 - fl, -40, -40 - fl, -6); c.lineTo(36 - fl * 0.3, -8); c.quadraticCurveTo(40, -50, 24, -86); c.closePath();
      G.fillO(c, '#e2434b', 3);
    }
    if (w.body === 'bag' || ch.wear?.back === 'bag') {
      G.rr(c, -40, -86, 30, 40, 9); G.fillO(c, '#d9822b', 3);
    }
  }
  function wearBody(c, ch) {
    const w = ch.wear || {};
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
      G.rr(c, -32 + lx, -134, 28, 18, 7); c.fill();
      G.rr(c, 4 + lx, -134, 28, 18, 7); c.fill();
      c.fillRect(-6 + lx, -130, 12, 4);
      c.fillStyle = 'rgba(255,255,255,.5)'; G.rr(c, -26 + lx, -131, 9, 4, 2); c.fill(); G.rr(c, 10 + lx, -131, 9, 4, 2); c.fill();
    }
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
      G.circ(c, 0, -122, 66); c.fillStyle = 'rgba(200,235,255,0.25)'; c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 4; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 5; c.beginPath(); c.arc(0, -122, 54, -2.6, -2.0); c.stroke();
      G.rr(c, -40, -64, 80, 14, 7); G.fillO(c, '#e8eef6', 3);
    }
  }

  PT._wearBody = wearBody; PT._wearHead = wearHead; PT._wearFront = wearFront;

  /* メイン：キャラクターを描く（足元が原点） */
  PT.drawChar = (c, ch, t) => {
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

    // しっぽ
    c.save(); c.translate(-20, -40); c.rotate(-0.8 + pp.tail);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-24, -14, -26, -40);
    c.strokeStyle = PT.line(P.color); c.lineWidth = 17; c.lineCap = 'round'; c.stroke();
    c.strokeStyle = P.color; c.lineWidth = 12; c.stroke();
    G.circ(c, -26, -40, 6); c.fillStyle = ch.cid === 'pon' ? '#fff6ea' : P.dark; c.fill();
    c.restore();

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

    // もっている物
    if (ch.holdType && PT.ITEMS[ch.holdType]) {
      const it = PT.ITEMS[ch.holdType];
      c.save();
      const hx = ch.pose === 'carry' ? 0 : hR[0], hy = ch.pose === 'carry' ? -180 : hR[1] + 10;
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
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = cv.height = Math.round(size * dpr);
    const c = cv.getContext('2d');
    c.scale(dpr, dpr);
    const ch = { def: PT.CHARS[cid], cid, x: size / 2, y: size * (opts.full ? 0.98 : 1.32), pose: 'idle', poseT: 0, face: opts.face || 'happy', wear: {}, seed: 1.7, scale: size / (opts.full ? 215 : 150), look: 0 };
    PT.drawChar(c, ch, 300);
    return cv;
  };
})();
