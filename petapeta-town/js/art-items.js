/* アイテム定義と描画（足元中央が原点、上方向がマイナス） */
'use strict';
(() => {
  const G = PT.G;
  const I = (PT.ITEMS = {});
  const def = (id, o) => { I[id] = Object.assign({ id, tags: [], w: 90, h: 90 }, o); };

  /* ================= どうぐ ================= */
  def('blanket', { name: 'もうふ', cat: 'tools', tags: ['cloth', 'cover', 'soft'], w: 120, h: 60,
    draw(c, t, st) {
      if (st && st.mode === 'fort') return drawFort(c, t, st);
      G.rr(c, -58, -46, 116, 44, 12); G.fillO(c, '#6fb3e8', 3);
      c.save(); G.rr(c, -58, -46, 116, 44, 12); c.clip();
      c.fillStyle = '#ffffff';
      for (let i = -60; i < 60; i += 26) { c.fillRect(i, -46, 10, 44); }
      c.fillStyle = 'rgba(255,214,90,.85)'; for (let i = -60; i < 60; i += 26) c.fillRect(i + 13, -46, 4, 44);
      c.restore();
      c.strokeStyle = PT.line('#6fb3e8'); c.lineWidth = 3; c.beginPath(); c.moveTo(-58, -26); c.lineTo(58, -26); c.stroke();
    } });
  function drawFort(c, t, st) {
    const w = st.fw || 260, h = st.fh || 170;
    c.save();
    // たれさがった毛布の基地
    c.beginPath();
    c.moveTo(-w / 2, 0);
    c.quadraticCurveTo(-w / 2 - 10, -h * 0.6, -w * 0.38, -h);
    c.quadraticCurveTo(0, -h - 18, w * 0.38, -h);
    c.quadraticCurveTo(w / 2 + 10, -h * 0.6, w / 2, 0);
    c.closePath();
    G.fillO(c, '#6fb3e8', 4);
    c.save(); c.clip();
    c.fillStyle = 'rgba(255,255,255,.85)';
    for (let x = -w / 2; x < w / 2; x += 40) c.fillRect(x, -h - 20, 14, h + 20);
    c.fillStyle = 'rgba(255,214,90,.8)';
    for (let x = -w / 2; x < w / 2; x += 40) c.fillRect(x + 20, -h - 20, 5, h + 20);
    c.restore();
    // 入り口（暗い）
    c.beginPath(); c.moveTo(-w * 0.2, 0); c.quadraticCurveTo(-w * 0.18, -h * 0.62, 0, -h * 0.66); c.quadraticCurveTo(w * 0.18, -h * 0.62, w * 0.2, 0); c.closePath();
    c.fillStyle = st.lit ? '#ffe9a8' : '#2c3a5c'; c.fill();
    c.strokeStyle = PT.line('#6fb3e8'); c.lineWidth = 3; c.stroke();
    if (st.lit) { c.fillStyle = 'rgba(255,240,170,.35)'; G.circ(c, 0, -h * 0.3, w * 0.25); c.fill(); }
    // 旗
    c.strokeStyle = '#8a5a2b'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -h - 8); c.lineTo(0, -h - 60); c.stroke();
    const wv = Math.sin(t * 0.006) * 4;
    G.poly(c, [0, -h - 60, 34, -h - 50 + wv, 0, -h - 40]); G.fillO(c, '#ff6f61', 2.5);
    c.restore();
  }

  def('box', { name: 'だんボール', cat: 'tools', tags: ['box', 'container', 'build'], w: 120, h: 100,
    draw(c, t, st) {
      const m = st && st.mode;
      if (m === 'rocket') return drawRocketBox(c, t, st);
      // 本体
      G.poly(c, [-56, -82, 56, -82, 52, 0, -52, 0]); G.fillO(c, '#d4a46a', 3);
      G.poly(c, [-56, -82, -40, -104, 40, -104, 56, -82]); G.fillO(c, '#c4925a', 3);
      c.strokeStyle = 'rgba(120,80,40,.5)'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(-10, -82); c.lineTo(-10, -50); c.moveTo(10, -82); c.lineTo(10, -50); c.stroke();
      if (m === 'car' || m === 'boat') {
        if (m === 'car') {
          for (const x of [-34, 34]) { G.circ(c, x, -2, 15); G.fillO(c, '#3e4a63', 3); G.circ(c, x, -2, 6); c.fillStyle = '#d0d8e6'; c.fill(); }
          G.circ(c, 20, -96, 12); c.strokeStyle = '#3e4a63'; c.lineWidth = 4; c.stroke();
          G.circ(c, 54, -50, 7); c.fillStyle = '#ffe36a'; c.fill();
        } else {
          c.strokeStyle = '#8a5a2b'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -100); c.lineTo(0, -190); c.stroke();
          G.poly(c, [4, -186, 60, -120, 4, -116]); G.fillO(c, '#ffffff', 3);
          c.fillStyle = 'rgba(80,160,230,.6)'; for (let i = 0; i < 3; i++) { G.ell(c, -40 + i * 40, 4, 22, 6); c.fill(); }
        }
      } else if (m === 'shop') {
        G.rr(c, -50, -150, 100, 30, 8); G.fillO(c, '#ff8a65', 3);
        c.fillStyle = '#fff'; c.font = `bold 20px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('おみせ', 0, -128);
        c.strokeStyle = '#8a5a2b'; c.lineWidth = 4; c.beginPath(); c.moveTo(-44, -120); c.lineTo(-44, -82); c.moveTo(44, -120); c.lineTo(44, -82); c.stroke();
      } else if (m === 'robot') {
        G.rr(c, -36, -170, 72, 66, 10); G.fillO(c, '#d4a46a', 3);
        G.circ(c, -14, -140, 9); c.fillStyle = '#7fd0e8'; c.fill(); G.circ(c, 14, -140, 9); c.fill();
        c.fillStyle = '#3e4a63'; c.fillRect(-14, -120, 28, 5);
        c.strokeStyle = '#3e4a63'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -170); c.lineTo(0, -188); c.stroke();
        G.circ(c, 0, -190, 6); c.fillStyle = (t / 300) % 2 < 1 ? '#ff5d5d' : '#ffd23f'; c.fill();
      } else {
        // 宇宙ステッカー風の落書き
        G.star(c, -28, -44, 10, 4.5); c.fillStyle = '#ffcf3f'; c.fill();
        G.circ(c, 26, -40, 9); c.fillStyle = '#7fb6ef'; c.fill();
      }
    } });
  function drawRocketBox(c, t, st) {
    // 炎
    if (st.flying) {
      const f = 30 + Math.sin(t * 0.05) * 10;
      c.beginPath(); c.moveTo(-26, 4); c.quadraticCurveTo(0, 40 + f, 26, 4); c.closePath(); c.fillStyle = '#ffb02e'; c.fill();
      c.beginPath(); c.moveTo(-14, 4); c.quadraticCurveTo(0, 20 + f * 0.6, 14, 4); c.closePath(); c.fillStyle = '#fff2a0'; c.fill();
    }
    G.poly(c, [-48, 0, -48, -120, 48, -120, 48, 0]); G.fillO(c, '#d4a46a', 3);
    G.poly(c, [-48, -120, 0, -190, 48, -120]); G.fillO(c, '#ff6f61', 3);
    G.poly(c, [-48, -40, -76, 4, -48, 0]); G.fillO(c, '#ff6f61', 3);
    G.poly(c, [48, -40, 76, 4, 48, 0]); G.fillO(c, '#ff6f61', 3);
    G.circ(c, 0, -84, 20); G.fillO(c, '#9fdcf5', 3);
    G.star(c, -26, -30, 9, 4); c.fillStyle = '#ffcf3f'; c.fill();
    G.star(c, 26, -30, 9, 4); c.fill();
  }

  def('flashlight', { name: 'かいちゅうでんとう', cat: 'tools', tags: ['light'], w: 90, h: 50,
    draw(c, t, st) {
      c.save(); c.rotate(-0.15);
      if (st && st.on) { c.fillStyle = 'rgba(255,240,150,.35)'; c.beginPath(); c.moveTo(34, -22); c.lineTo(140, -70); c.lineTo(140, 30); c.closePath(); c.fill(); }
      G.rr(c, -40, -32, 56, 22, 8); G.fillO(c, '#ffcf3f', 3);
      G.poly(c, [14, -36, 38, -44, 38, 2, 14, -6]); G.fillO(c, '#f0a52a', 3);
      G.ell(c, 38, -21, 6, 22); G.fillO(c, '#fff7c2', 2.5);
      G.rr(c, -20, -38, 12, 8, 3); G.fillO(c, '#e2534b', 2);
      c.restore();
    } });

  def('ball', { name: 'ボール', cat: 'tools', tags: ['ball', 'toy', 'round'], w: 70, h: 70,
    draw(c, t, st) {
      const r = 32;
      c.save(); c.translate(0, -r); c.rotate(st && st.spin ? st.spin : 0);
      G.circ(c, 0, 0, r); G.fillO(c, '#ffffff', 3);
      c.save(); G.circ(c, 0, 0, r); c.clip();
      c.fillStyle = '#ff5d6c'; c.fillRect(-r, -r, r, r); c.fillStyle = '#4c9be8'; c.fillRect(0, 0, r, r);
      c.fillStyle = '#ffd23f'; c.fillRect(0, -r, r, r);
      c.restore();
      G.circ(c, 0, 0, r); c.strokeStyle = PT.line('#7f8fa6'); c.lineWidth = 3; c.stroke();
      G.circ(c, -12, -12, 7); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
      c.restore();
    } });

  function teddy(c, col, ear) {
    G.ell(c, 0, -30, 26, 28); G.fillO(c, col, 3);
    G.ell(c, 0, -26, 14, 16); c.fillStyle = PT.shade(col, 0.4); c.fill();
    for (const s of [-1, 1]) { G.circ(c, s * 22, -12, 10); G.fillO(c, col, 3); G.circ(c, s * 26, -40, 9); G.fillO(c, col, 3); }
    if (ear === 'bear') { for (const s of [-1, 1]) { G.circ(c, s * 20, -98, 11); G.fillO(c, col, 3); } }
    else { for (const s of [-1, 1]) { G.ell(c, s * 12, -112, 8, 22, s * 0.15); G.fillO(c, col, 3); G.ell(c, s * 12, -110, 4, 15, s * 0.15); c.fillStyle = '#ffc2d1'; c.fill(); } }
    G.circ(c, 0, -76, 27); G.fillO(c, col, 3);
    G.ell(c, 0, -68, 12, 9); c.fillStyle = PT.shade(col, 0.45); c.fill();
    c.fillStyle = '#2b2440'; G.circ(c, -9, -80, 3.5); c.fill(); G.circ(c, 9, -80, 3.5); c.fill(); G.ell(c, 0, -70, 4, 3); c.fill();
  }
  def('teddy', { name: 'くまの ぬいぐるみ', cat: 'tools', tags: ['plush', 'toy', 'guest'], w: 70, h: 110,
    draw(c, t, st) { teddy(c, '#c98f5a', 'bear'); if (st && st.party) { c.save(); c.translate(0, -80); c.scale(0.5, 0.5); PT.drawWear(c, 'party'); c.restore(); } if (st && st.bandage) bandage(c); } });
  def('bunny', { name: 'うさぎの ぬいぐるみ', cat: 'tools', tags: ['plush', 'toy', 'guest'], w: 70, h: 125,
    draw(c, t, st) { teddy(c, '#f4f0f6', 'bunny'); if (st && st.party) { c.save(); c.translate(0, -80); c.scale(0.5, 0.5); PT.drawWear(c, 'party'); c.restore(); } if (st && st.bandage) bandage(c); } });
  function bandage(c) {
    c.save(); c.translate(14, -88); c.rotate(0.5);
    G.rr(c, -14, -5, 28, 10, 4); G.fillO(c, '#ffe0c2', 2); c.fillStyle = '#e8b48a'; c.fillRect(-4, -3, 8, 6);
    c.restore();
  }

  def('dino', { name: 'きょうりゅう', cat: 'tools', tags: ['dino', 'toy'], w: 110, h: 90,
    draw(c, t) {
      const col = '#6cc06a';
      c.beginPath(); c.moveTo(-50, -26); c.quadraticCurveTo(-70, -40, -56, -10); c.lineTo(-30, -20); c.closePath(); G.fillO(c, col, 3);
      G.ell(c, -6, -34, 34, 24); G.fillO(c, col, 3);
      for (let i = 0; i < 4; i++) { G.poly(c, [-30 + i * 14, -54, -24 + i * 14, -68, -18 + i * 14, -54]); G.fillO(c, '#ffd23f', 2); }
      G.rr(c, -24, -18, 12, 18, 5); G.fillO(c, col, 3); G.rr(c, 6, -18, 12, 18, 5); G.fillO(c, col, 3);
      c.beginPath(); c.moveTo(18, -48); c.quadraticCurveTo(28, -84, 46, -80); c.quadraticCurveTo(62, -76, 56, -62); c.lineTo(30, -50); c.closePath(); G.fillO(c, col, 3);
      G.circ(c, 46, -72, 3.5); c.fillStyle = '#2b2440'; c.fill();
      c.strokeStyle = '#2b2440'; c.lineWidth = 2; c.beginPath(); c.moveTo(48, -64); c.quadraticCurveTo(54, -62, 57, -65); c.stroke();
    } });

  def('cushion', { name: 'クッション', cat: 'tools', tags: ['soft', 'pillow'], w: 90, h: 60,
    draw(c) {
      G.blob(c, [-44, -6, -48, -46, 0, -52, 48, -46, 44, -6, 0, -2]); G.fillO(c, '#ff9fb8', 3);
      G.circ(c, 0, -26, 6); c.fillStyle = '#e46a8a'; c.fill();
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-30, -40); c.quadraticCurveTo(-20, -44, -10, -42); c.stroke();
    } });

  def('book', { name: 'えほん', cat: 'tools', tags: ['book', 'read'], w: 90, h: 60,
    draw(c, t, st) {
      if (st && st.open) {
        G.poly(c, [0, -10, -46, -22, -46, -64, 0, -52]); G.fillO(c, '#ffffff', 3);
        G.poly(c, [0, -10, 46, -22, 46, -64, 0, -52]); G.fillO(c, '#ffffff', 3);
        G.circ(c, -24, -40, 8); c.fillStyle = '#ffcf3f'; c.fill(); G.heart(c, 24, -38, 9); c.fillStyle = '#ff6f91'; c.fill();
        return;
      }
      G.rr(c, -40, -56, 80, 54, 6); G.fillO(c, '#58b07a', 3);
      G.rr(c, -40, -56, 12, 54, 4); G.fillO(c, '#3d8a5c', 2);
      G.star(c, 8, -30, 14, 6); c.fillStyle = '#ffe36a'; c.fill();
    } });

  def('chair', { name: 'いす', cat: 'tools', tags: ['seat', 'furniture'], w: 80, h: 110,
    draw(c) {
      const col = '#e8a35c';
      G.rr(c, -30, -108, 60, 52, 10); G.fillO(c, col, 3);
      G.rr(c, -22, -100, 44, 34, 8); c.fillStyle = PT.shade(col, 0.25); c.fill();
      G.rr(c, -34, -56, 68, 14, 5); G.fillO(c, col, 3);
      for (const x of [-28, 22]) { G.rr(c, x, -44, 6, 44, 3); G.fillO(c, PT.shade(col, -0.15), 2.5); }
    } });

  def('table', { name: 'テーブル', cat: 'tools', tags: ['table', 'furniture', 'surface'], w: 150, h: 80,
    draw(c) {
      const col = '#f2c38a';
      for (const x of [-60, 52]) { G.rr(c, x, -62, 9, 62, 3); G.fillO(c, PT.shade(col, -0.2), 2.5); }
      G.ell(c, 0, -66, 76, 18); G.fillO(c, col, 3);
      G.ell(c, 0, -69, 66, 12); c.fillStyle = PT.shade(col, 0.2); c.fill();
    } });

  def('plate', { name: 'おさら', cat: 'tools', tags: ['dish', 'cook'], w: 80, h: 30,
    draw(c) { G.ell(c, 0, -12, 38, 12); G.fillO(c, '#ffffff', 3); G.ell(c, 0, -13, 24, 7); c.strokeStyle = '#9fc6e8'; c.lineWidth = 2.5; c.stroke(); } });

  def('apple', { name: 'りんご', cat: 'tools', tags: ['food', 'fruit', 'red'], w: 56, h: 60, food: true,
    draw(c) {
      G.blob(c, [-24, -26, -18, -48, 0, -44, 18, -48, 24, -26, 12, -2, 0, -6, -12, -2]); G.fillO(c, '#ef4b4b', 3);
      c.strokeStyle = '#6b4a2b'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(0, -44); c.lineTo(3, -56); c.stroke();
      G.ell(c, 12, -54, 10, 5, -0.4); G.fillO(c, '#64b95a', 2);
      G.ell(c, -10, -34, 4, 7, 0.3); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill();
    } });
  def('banana', { name: 'バナナ', cat: 'tools', tags: ['food', 'fruit', 'yellow'], w: 70, h: 50, food: true,
    draw(c) {
      c.beginPath(); c.moveTo(-32, -38); c.quadraticCurveTo(-20, -2, 30, -14); c.quadraticCurveTo(34, -18, 30, -22); c.quadraticCurveTo(-10, -16, -24, -42); c.closePath();
      G.fillO(c, '#ffd84a', 3);
      c.fillStyle = '#6b4a2b'; c.fillRect(-35, -46, 7, 8);
    } });
  def('cake', { name: 'ケーキ', cat: 'tools', tags: ['food', 'sweet', 'party'], w: 80, h: 90, food: true,
    draw(c, t) {
      G.ell(c, 0, -6, 40, 9); G.fillO(c, '#ffffff', 3);
      G.rr(c, -32, -50, 64, 44, 8); G.fillO(c, '#fff3e6', 3);
      c.fillStyle = '#ff8fab'; c.fillRect(-32, -34, 64, 8);
      G.blob(c, [-34, -50, -20, -58, 0, -56, 20, -58, 34, -50, 20, -42, 0, -44, -20, -42]); c.fillStyle = '#ffffff'; c.fill();
      G.circ(c, -14, -56, 6); c.fillStyle = '#e83a4a'; c.fill(); G.circ(c, 14, -56, 6); c.fill();
      c.fillStyle = '#7fb6ef'; c.fillRect(-3, -80, 6, 22);
      const f = Math.sin(t * 0.02) * 1.5;
      G.ell(c, 0, -86 + f * 0.3, 5, 8 + f); c.fillStyle = '#ffb02e'; c.fill();
    } });
  def('onigiri', { name: 'おにぎり', cat: 'tools', tags: ['food'], w: 60, h: 56, food: true,
    draw(c) {
      G.blob(c, [-28, -6, -4, -52, 4, -52, 28, -6, 0, -2]); G.fillO(c, '#ffffff', 3);
      G.rr(c, -16, -24, 32, 22, 3); c.fillStyle = '#2f4a3a'; c.fill();
    } });
  def('bread', { name: 'パン', cat: 'tools', tags: ['food', 'bread'], w: 76, h: 50, food: true,
    draw(c) {
      G.blob(c, [-36, -6, -34, -30, -10, -42, 18, -40, 36, -24, 32, -4, 0, -2]); G.fillO(c, '#e9a85a', 3);
      c.strokeStyle = '#fff0d0'; c.lineWidth = 3; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * 14 - 6, -34); c.lineTo(i * 14 + 4, -14); c.stroke(); }
    } });

  def('bucket', { name: 'バケツと スコップ', cat: 'tools', tags: ['sand', 'container'], w: 90, h: 80,
    draw(c) {
      c.strokeStyle = '#3e6fc4'; c.lineWidth = 4; c.beginPath(); c.arc(0, -56, 26, Math.PI, 0); c.stroke();
      G.poly(c, [-30, -58, 30, -58, 22, 0, -22, 0]); G.fillO(c, '#4c9be8', 3);
      c.fillStyle = '#ffd23f'; c.fillRect(-27, -40, 53, 8);
      c.save(); c.translate(34, -10); c.rotate(-0.5);
      G.rr(c, -3, -56, 6, 40, 3); G.fillO(c, '#ff6f61', 2); G.blob(c, [-12, -16, 12, -16, 8, 6, -8, 6]); G.fillO(c, '#ff6f61', 2.5);
      c.restore();
    } });
  def('castle', { name: 'すなの おしろ', cat: 'hidden', tags: ['sand', 'castle'], w: 140, h: 130,
    draw(c, t, st) {
      const lv = st ? st.level || 3 : 3;
      const col = '#ecc98a';
      G.poly(c, [-64, 0, -58, -40, 58, -40, 64, 0]); G.fillO(c, col, 3);
      if (lv >= 2) { G.rr(c, -36, -84, 72, 46, 4); G.fillO(c, col, 3); for (let i = 0; i < 4; i++) { G.rr(c, -36 + i * 20, -94, 12, 12, 2); G.fillO(c, col, 2); } }
      if (lv >= 3) {
        G.rr(c, -14, -124, 28, 42, 3); G.fillO(c, col, 3);
        c.strokeStyle = '#8a5a2b'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -124); c.lineTo(0, -150); c.stroke();
        G.poly(c, [0, -150, 22, -144, 0, -138]); G.fillO(c, '#ff6f61', 2);
      }
      G.rr(c, -10, -24, 20, 24, 8); c.fillStyle = '#b48a52'; c.fill();
      if (st && st.shells) { G.circ(c, -40, -18, 6); c.fillStyle = '#ffd1dc'; c.fill(); G.circ(c, 40, -18, 6); c.fill(); }
    } });
  def('shell', { name: 'かいがら', cat: 'tools', tags: ['treasure', 'beach'], w: 60, h: 50,
    draw(c) {
      c.beginPath(); c.moveTo(0, -4); c.lineTo(-28, -30); c.quadraticCurveTo(0, -60, 28, -30); c.closePath(); G.fillO(c, '#ffc7d6', 3);
      c.strokeStyle = PT.line('#ffc7d6'); c.lineWidth = 2;
      for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) { c.beginPath(); c.moveTo(0, -4); c.lineTo(Math.sin(a) * 28, -4 - Math.cos(a) * 40); c.stroke(); }
      G.ell(c, 0, -4, 8, 5); G.fillO(c, '#ffc7d6', 2);
    } });
  def('parasol', { name: 'パラソル', cat: 'tools', tags: ['shade', 'beach', 'picnic'], w: 150, h: 170,
    draw(c) {
      c.strokeStyle = '#8a5a2b'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(4, -150); c.stroke();
      c.beginPath(); c.moveTo(-74, -120); c.quadraticCurveTo(4, -200, 82, -120); c.closePath(); G.fillO(c, '#ff6f61', 3);
      c.save(); c.beginPath(); c.moveTo(-74, -120); c.quadraticCurveTo(4, -200, 82, -120); c.closePath(); c.clip();
      c.fillStyle = '#ffffff'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(4, -170); c.lineTo(-60 + i * 56, -110); c.lineTo(-38 + i * 56, -110); c.closePath(); c.fill(); }
      c.restore();
    } });
  def('sheet', { name: 'レジャーシート', cat: 'tools', tags: ['picnic', 'cloth'], w: 160, h: 50,
    draw(c) {
      G.poly(c, [-80, -4, -56, -44, 76, -44, 82, -4]); G.fillO(c, '#7cc6f2', 3);
      c.save(); G.poly(c, [-80, -4, -56, -44, 76, -44, 82, -4]); c.clip();
      c.fillStyle = 'rgba(255,255,255,.7)';
      for (let x = -90; x < 90; x += 28) c.fillRect(x, -50, 14, 50);
      for (let y = -44; y < 0; y += 16) c.fillRect(-90, y, 180, 7);
      c.restore();
    } });
  def('basket', { name: 'かいものかご', cat: 'tools', tags: ['shopping', 'container'], w: 80, h: 70,
    draw(c) {
      c.strokeStyle = '#d0452f'; c.lineWidth = 5; c.beginPath(); c.arc(0, -40, 24, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
      G.poly(c, [-34, -44, 34, -44, 26, 0, -26, 0]); G.fillO(c, '#ff7a5c', 3);
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2;
      for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 12, -42); c.lineTo(i * 10, -2); c.stroke(); }
    } });
  def('acorn', { name: 'どんぐり', cat: 'tools', tags: ['nut', 'nature', 'food-animal'], w: 50, h: 56,
    draw(c) {
      G.ell(c, 0, -22, 17, 20); G.fillO(c, '#c9813e', 3);
      G.blob(c, [-20, -34, -16, -48, 0, -52, 16, -48, 20, -34, 0, -30]); G.fillO(c, '#8a5a2b', 3);
      c.strokeStyle = '#6b4a2b'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -52); c.lineTo(2, -60); c.stroke();
      G.ell(c, -6, -18, 3, 6); c.fillStyle = 'rgba(255,255,255,.45)'; c.fill();
    } });
  def('bag', { name: 'リュック', cat: 'tools', tags: ['bag', 'explore'], w: 70, h: 80,
    draw(c) {
      G.rr(c, -30, -74, 60, 72, 16); G.fillO(c, '#e8913a', 3);
      G.rr(c, -22, -40, 44, 28, 8); G.fillO(c, '#f6b25e', 2.5);
      c.strokeStyle = PT.line('#e8913a'); c.lineWidth = 3; c.beginPath(); c.arc(0, -74, 12, Math.PI, 0); c.stroke();
      G.circ(c, 0, -30, 4); c.fillStyle = '#ffd23f'; c.fill();
    } });
  def('duck', { name: 'アヒル', cat: 'tools', tags: ['duck', 'water', 'toy'], w: 76, h: 66,
    draw(c, t) {
      G.ell(c, -2, -20, 32, 20); G.fillO(c, '#ffd84a', 3);
      G.circ(c, 18, -46, 17); G.fillO(c, '#ffd84a', 3);
      G.ell(c, 38, -42, 11, 5.5); G.fillO(c, '#ff8c2e', 2.5);
      G.circ(c, 22, -50, 3.5); c.fillStyle = '#2b2440'; c.fill();
      c.beginPath(); c.moveTo(-14, -28); c.quadraticCurveTo(-4, -16, 8, -24); c.strokeStyle = PT.line('#ffd84a'); c.lineWidth = 2.5; c.stroke();
    } });

  /* ================= のりもの・あそび ================= */
  def('slide', { name: 'すべりだい', cat: 'rides', tags: ['slide', 'playground', 'ride'], w: 200, h: 170,
    draw(c) {
      G.rr(c, -86, -160, 10, 160, 4); G.fillO(c, '#7a8fb8', 2.5); G.rr(c, -46, -160, 10, 160, 4); G.fillO(c, '#7a8fb8', 2.5);
      for (let y = -140; y < 0; y += 28) { c.fillStyle = '#7a8fb8'; c.fillRect(-82, y, 40, 6); }
      G.rr(c, -92, -168, 60, 14, 6); G.fillO(c, '#ff6f61', 3);
      c.beginPath(); c.moveTo(-40, -166); c.quadraticCurveTo(30, -150, 50, -40); c.quadraticCurveTo(58, -8, 96, -6); c.lineTo(96, 8); c.quadraticCurveTo(40, 6, 30, -36); c.quadraticCurveTo(14, -134, -40, -144); c.closePath();
      G.fillO(c, '#ffcf3f', 3);
    } });
  def('trampoline', { name: 'トランポリン', cat: 'rides', tags: ['bounce', 'playground', 'ride'], w: 160, h: 60,
    draw(c, t, st) {
      const d = st && st.boing ? Math.sin(t * 0.03) * 6 : 0;
      for (const x of [-60, -20, 20, 60]) { G.rr(c, x - 4, -30, 8, 30, 3); G.fillO(c, '#7a8fb8', 2); }
      G.ell(c, 0, -32, 76, 18); G.fillO(c, '#4c9be8', 3);
      G.ell(c, 0, -32 + d, 60, 12); c.fillStyle = '#2b3a5c'; c.fill();
    } });
  def('tricycle', { name: 'さんりんしゃ', cat: 'rides', tags: ['vehicle', 'ride'], w: 120, h: 90,
    draw(c) {
      G.circ(c, 34, -30, 28); G.fillO(c, '#3e4a63', 3); G.circ(c, 34, -30, 10); c.fillStyle = '#d0d8e6'; c.fill();
      G.circ(c, -40, -16, 15); G.fillO(c, '#3e4a63', 3);
      c.strokeStyle = '#e8424a'; c.lineWidth = 8; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-40, -16); c.lineTo(-6, -40); c.lineTo(34, -30); c.moveTo(-6, -40); c.lineTo(28, -76); c.stroke();
      G.rr(c, -22, -56, 34, 12, 6); G.fillO(c, '#3e4a63', 2);
      c.strokeStyle = '#3e4a63'; c.lineWidth = 5; c.beginPath(); c.moveTo(16, -80); c.lineTo(40, -80); c.stroke();
    } });
  def('train', { name: 'でんしゃの おもちゃ', cat: 'rides', tags: ['vehicle', 'train', 'ride'], w: 150, h: 90,
    draw(c) {
      G.rr(c, -70, -62, 92, 52, 10); G.fillO(c, '#4c9be8', 3);
      G.rr(c, -60, -54, 26, 20, 5); G.fillO(c, '#d9f1ff', 2); G.rr(c, -26, -54, 26, 20, 5); G.fillO(c, '#d9f1ff', 2);
      G.rr(c, 22, -48, 48, 38, 8); G.fillO(c, '#ff6f61', 3);
      G.rr(c, 40, -72, 14, 26, 4); G.fillO(c, '#3e4a63', 2);
      for (const x of [-52, -10, 34, 60]) { G.circ(c, x, -8, 11); G.fillO(c, '#3e4a63', 3); }
    } });
  def('swimring', { name: 'うきわ', cat: 'rides', tags: ['water', 'float', 'ride'], w: 100, h: 50,
    draw(c) {
      G.ell(c, 0, -22, 46, 22); G.fillO(c, '#ff6f91', 3);
      c.save(); G.ell(c, 0, -22, 46, 22); c.clip(); c.fillStyle = '#ffffff';
      for (const a of [0.3, 1.9, 3.4, 5]) { c.save(); c.translate(0, -22); c.rotate(a); c.fillRect(20, -10, 30, 20); c.restore(); }
      c.restore();
      G.ell(c, 0, -22, 46, 22); c.strokeStyle = PT.line('#ff6f91'); c.lineWidth = 3; c.stroke();
      G.ell(c, 0, -22, 20, 9); c.fillStyle = 'rgba(40,60,100,.35)'; c.fill();
    } });
  def('car', { name: 'のりものカー', cat: 'rides', tags: ['vehicle', 'ride'], w: 140, h: 90,
    draw(c) {
      G.blob(c, [-64, -14, -60, -46, -24, -54, -10, -78, 30, -78, 44, -54, 66, -44, 66, -14]); G.fillO(c, '#58c46b', 3);
      G.rr(c, -4, -72, 32, 20, 6); G.fillO(c, '#d9f1ff', 2);
      for (const x of [-38, 40]) { G.circ(c, x, -10, 15); G.fillO(c, '#3e4a63', 3); G.circ(c, x, -10, 5); c.fillStyle = '#d0d8e6'; c.fill(); }
      G.circ(c, 62, -36, 6); c.fillStyle = '#ffe36a'; c.fill();
    } });
  def('tent', { name: 'テント', cat: 'rides', tags: ['tent', 'camp', 'cover'], w: 200, h: 160,
    draw(c, t, st) {
      G.poly(c, [-96, 0, 0, -150, 96, 0]); G.fillO(c, '#ffb547', 3);
      G.poly(c, [0, -150, 96, 0, 60, 0]); c.fillStyle = 'rgba(200,100,20,.25)'; c.fill();
      G.poly(c, [-34, 0, 0, -96, 34, 0]); c.fillStyle = st && st.lit ? '#ffe9a8' : '#4a3a5c'; c.fill();
      c.strokeStyle = PT.line('#ffb547'); c.lineWidth = 3; c.stroke();
      c.strokeStyle = '#8a5a2b'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -150); c.lineTo(0, -176); c.stroke();
      G.poly(c, [0, -176, 26, -168, 0, -160]); G.fillO(c, '#58c46b', 2);
    } });
  def('unicorn', { name: 'ユニコーン', cat: 'rides', tags: ['ride', 'magic', 'horse'], w: 130, h: 130, lock: 20,
    draw(c, t) {
      const rock = Math.sin(t * 0.005) * 0.06;
      c.save(); c.rotate(rock);
      c.strokeStyle = '#d98ad6'; c.lineWidth = 7; c.beginPath(); c.moveTo(-60, -4); c.quadraticCurveTo(0, 10, 60, -4); c.stroke();
      G.ell(c, -4, -50, 40, 24); G.fillO(c, '#ffffff', 3);
      for (const x of [-30, 22]) { G.rr(c, x - 5, -34, 10, 32, 4); G.fillO(c, '#ffffff', 2.5); }
      c.beginPath(); c.moveTo(24, -60); c.quadraticCurveTo(34, -102, 52, -104); c.quadraticCurveTo(68, -100, 66, -84); c.lineTo(40, -56); c.closePath(); G.fillO(c, '#ffffff', 3);
      G.poly(c, [50, -104, 60, -132, 58, -102]); G.fillO(c, '#ffd84a', 2);
      ['#ff8fab', '#ffd84a', '#7fd0e8', '#b39ae8'].forEach((col, i) => { G.ell(c, 30 - i * 6, -98 + i * 12, 9, 13, 0.6); c.fillStyle = col; c.fill(); });
      ['#ff8fab', '#7fd0e8', '#b39ae8'].forEach((col, i) => { G.ell(c, -46 - i * 4, -56 + i * 10, 12, 6, -0.8); c.fillStyle = col; c.fill(); });
      G.circ(c, 54, -92, 3); c.fillStyle = '#2b2440'; c.fill();
      c.restore();
    } });

  /* ================= へんしん ================= */
  PT.drawWear = (c, kind) => {
    // ぬいぐるみ用・アイコン用の帽子描画
    c.save(); c.translate(0, 160);
    PT.drawWearPiece(c, 'hat', kind, 0);
    c.restore();
  };
  const wearIcon = (kind, slot) => (c, t) => {
    const OFF = { helmet: 50, frog: 108, bowtie: 70, yukata: 24, tutu: 28, mustache: 108, heartglasses: 102 };
    c.save(); c.translate(0, OFF[kind] ?? (slot === 'hat' ? 140 : slot === 'face' ? 108 : slot === 'back' ? 40 : 20));
    PT.drawWearPiece(c, slot, kind, t);
    c.restore();
  };
  def('explorer', { name: 'たんけんぼうし', cat: 'dress', tags: ['hat', 'explore'], w: 120, h: 70, wear: ['hat', 'explorer'], role: 'explorer', draw: wearIcon('explorer', 'hat') });
  def('chef', { name: 'コックさんの ぼうし', cat: 'dress', tags: ['hat', 'cook'], w: 80, h: 90, wear: ['hat', 'chef'], role: 'chef', draw: wearIcon('chef', 'hat') });
  def('apron', { name: 'エプロン', cat: 'dress', tags: ['shop', 'cook'], w: 70, h: 80, wear: ['body', 'apron'], role: 'shop', draw: wearIcon('apron', 'body') });
  def('crown', { name: 'おうかん', cat: 'dress', tags: ['hat', 'king'], w: 80, h: 60, wear: ['hat', 'crown'], role: 'king', draw: wearIcon('crown', 'hat') });
  def('cape', { name: 'マント', cat: 'dress', tags: ['hero'], w: 90, h: 100, wear: ['body', 'cape'], role: 'hero', draw: wearIcon('cape', 'body') });
  def('doctor', { name: 'おいしゃさんセット', cat: 'dress', tags: ['doctor'], w: 80, h: 80, wear: ['body', 'doctor'], role: 'doctor', draw: wearIcon('doctor', 'body') });
  def('helmet', { name: 'うちゅうヘルメット', cat: 'dress', tags: ['hat', 'space'], w: 120, h: 130, wear: ['hat', 'helmet'], role: 'astro', draw: wearIcon('helmet', 'hat') });
  def('sunglasses', { name: 'サングラス', cat: 'dress', tags: ['face', 'cool'], w: 90, h: 40, wear: ['face', 'sunglasses'], role: 'cool', draw: wearIcon('sunglasses', 'face') });
  def('partyhat', { name: 'パーティーぼうし', cat: 'dress', tags: ['hat', 'party'], w: 60, h: 80, wear: ['hat', 'party'], role: 'party', draw: wearIcon('party', 'hat') });
  const W2 = (id, name, slot, kind, role, w, h, lock) => def(id, { name, cat: 'dress', tags: [slot === 'hat' ? 'hat' : slot, role], w, h, wear: [slot, kind], role, lock, draw: wearIcon(kind, slot) });
  W2('catears', 'ねこみみ', 'hat', 'catears', 'cat', 100, 60);
  W2('flowercrown', 'はなかんむり', 'hat', 'flowercrown', 'flower', 110, 40);
  W2('tiara', 'ティアラ', 'hat', 'tiara', 'princess', 80, 50);
  W2('ribbon', 'おおきな リボン', 'hat', 'ribbon', 'cute', 100, 50);
  W2('dress', 'ドレス', 'body', 'dress', 'princess', 110, 90);
  W2('tutu', 'バレエの チュチュ', 'body', 'tutu', 'ballet', 110, 50);
  W2('wings', 'ようせいの はね', 'back', 'wings', 'fairy', 130, 90);
  W2('pirate', 'かいぞくの ぼうし', 'hat', 'pirate', 'pirate', 120, 70);
  W2('firehat', 'しょうぼうしの ぼうし', 'hat', 'firehat', 'fire', 120, 70);
  W2('police', 'おまわりさんの ぼうし', 'hat', 'police', 'police', 90, 60);
  W2('santa', 'サンタさんの ぼうし', 'hat', 'santa', 'santa', 100, 70);
  W2('nightcap', 'ナイトキャップ', 'hat', 'nightcap', 'sleepy', 110, 70);
  W2('beret', 'ベレーぼう', 'hat', 'beret', 'artist', 100, 40);
  W2('frog', 'かえるの フード', 'hat', 'frog', 'frog', 110, 80);
  W2('yukata', 'ゆかた', 'body', 'yukata', 'yukata', 70, 70);
  W2('raincoat', 'レインコート', 'body', 'raincoat', 'rain', 80, 70);
  W2('bowtie', 'ちょうネクタイ', 'body', 'bowtie', 'gentle', 50, 30);
  W2('heartglasses', 'ハートの めがね', 'face', 'heartglasses', 'love', 90, 40);
  W2('mustache', 'おひげ', 'face', 'mustache', 'mustache', 80, 30);
  def('witch', { name: 'まほうつかいの ぼうし', cat: 'dress', tags: ['hat', 'magic'], w: 120, h: 100, wear: ['hat', 'witch'], role: 'wizard', lock: 25, draw: wearIcon('witch', 'hat') });
  def('robotsuit', { name: 'ロボットスーツ', cat: 'dress', tags: ['robot'], w: 80, h: 80, wear: ['body', 'robot'], role: 'robot', lock: 15, draw: wearIcon('robot', 'body') });

  /* ================= おと・ふしぎ ================= */
  def('bubbles', { name: 'シャボンだま', cat: 'magic', tags: ['bubble', 'fx'], w: 70, h: 90, oneShot: true,
    draw(c) {
      G.rr(c, -16, -52, 32, 50, 8); G.fillO(c, '#9fdcf5', 3);
      G.rr(c, -12, -60, 24, 10, 3); G.fillO(c, '#ff6f91', 2);
      c.strokeStyle = '#ff6f91'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -60); c.lineTo(6, -76); c.stroke(); G.circ(c, 8, -82, 7); c.stroke();
      for (const [x, y, r] of [[-26, -84, 9], [22, -62, 6], [-30, -50, 5]]) { G.circ(c, x, y, r); c.strokeStyle = '#7fc3ea'; c.lineWidth = 2.5; c.stroke(); c.fillStyle = 'rgba(200,240,255,.4)'; c.fill(); }
    } });
  def('music', { name: 'おんがく', cat: 'magic', tags: ['music', 'sound'], w: 100, h: 80,
    draw(c, t, st) {
      G.rr(c, -44, -60, 88, 58, 12); G.fillO(c, '#ff8a65', 3);
      const pulse = st && st.playing ? 1 + Math.sin(t * 0.02) * 0.08 : 1;
      G.circ(c, -18, -30, 16 * pulse); G.fillO(c, '#3e4a63', 2.5); G.circ(c, 18, -30, 16 * pulse); G.fillO(c, '#3e4a63', 2.5);
      G.circ(c, -18, -30, 6); c.fillStyle = '#9fb3c8'; c.fill(); G.circ(c, 18, -30, 6); c.fill();
      c.strokeStyle = '#3e4a63'; c.lineWidth = 4; c.beginPath(); c.moveTo(-30, -60); c.lineTo(-10, -84); c.lineTo(30, -84); c.lineTo(30, -60); c.stroke();
      G.note(c, 34, -94, 14, '#7a5fd6');
    } });
  def('balloon', { name: 'ふうせん', cat: 'magic', tags: ['balloon', 'float'], w: 70, h: 140, float: true,
    draw(c, t, st) {
      const col = (st && st.color) || '#ff5d78';
      const sw = Math.sin(t * 0.003 + (st ? st.seed || 0 : 0)) * 5;
      c.strokeStyle = '#7f8fa6'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(sw, -40, sw * 0.5, -80); c.stroke();
      G.ell(c, sw * 0.5, -112, 28, 34); G.fillO(c, col, 3);
      G.poly(c, [sw * 0.5 - 6, -76, sw * 0.5 + 6, -76, sw * 0.5, -82]); G.fillO(c, col, 2);
      G.ell(c, sw * 0.5 - 10, -124, 6, 10, 0.4); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill();
    } });
  def('confetti', { name: 'かみふぶき', cat: 'magic', tags: ['party', 'fx'], w: 80, h: 90, oneShot: true,
    draw(c) {
      G.poly(c, [-14, 0, 14, 0, 30, -64, -30, -64]); G.fillO(c, '#7fb6ef', 3);
      c.fillStyle = '#ffd23f'; c.fillRect(-20, -40, 40, 8);
      [['#ff6f91', -20, -80], ['#58c46b', 4, -88], ['#ffd23f', 22, -76], ['#b39ae8', -6, -72]].forEach(([col, x, y]) => { c.fillStyle = col; c.save(); c.translate(x, y); c.rotate(x); c.fillRect(-5, -3, 10, 6); c.restore(); });
    } });
  def('star', { name: 'おほしさま', cat: 'magic', tags: ['star', 'float', 'wish'], w: 80, h: 80, float: true,
    draw(c, t) {
      const s = 1 + Math.sin(t * 0.005) * 0.06;
      c.save(); c.translate(0, -38); c.scale(s, s);
      c.fillStyle = 'rgba(255,230,120,.35)'; G.circ(c, 0, 0, 40); c.fill();
      G.star(c, 0, 0, 34, 15); G.fillO(c, '#ffd84a', 3);
      c.fillStyle = '#2b2440'; G.circ(c, -7, -2, 2.6); c.fill(); G.circ(c, 7, -2, 2.6); c.fill();
      c.strokeStyle = '#2b2440'; c.lineWidth = 2; c.beginPath(); c.arc(0, 3, 5, 0.2, Math.PI - 0.2); c.stroke();
      c.restore();
    } });
  def('drum', { name: 'たいこ', cat: 'magic', tags: ['music', 'sound', 'parade'], w: 90, h: 80,
    draw(c) {
      G.rr(c, -38, -60, 76, 54, 8); G.fillO(c, '#e8424a', 3);
      c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.beginPath();
      for (let i = 0; i < 5; i++) { c.moveTo(-38 + i * 19, -56); c.lineTo(-28 + i * 19, -10); }
      c.stroke();
      G.ell(c, 0, -60, 38, 11); G.fillO(c, '#fff3e0', 3);
      c.strokeStyle = '#8a5a2b'; c.lineWidth = 5; c.beginPath(); c.moveTo(14, -66); c.lineTo(46, -96); c.stroke(); G.circ(c, 46, -96, 6); c.fillStyle = '#fff'; c.fill();
    } });
  def('wand', { name: 'まほうの ステッキ', cat: 'magic', tags: ['magic', 'wand'], w: 70, h: 100, lock: 5,
    draw(c, t) {
      c.strokeStyle = '#b39ae8'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-16, -4); c.lineTo(12, -70); c.stroke();
      G.star(c, 14, -78, 20, 9, 5, -Math.PI / 2 + t * 0.002); G.fillO(c, '#ffd84a', 3);
      c.fillStyle = '#fff'; const k = (t / 200) % 3;
      G.star(c, -20 + k * 6, -70, 5, 2); c.fill(); G.star(c, 34, -100 + k * 4, 4, 1.8); c.fill();
    } });
  def('rainbow', { name: 'にじ', cat: 'magic', tags: ['rainbow', 'fx'], w: 120, h: 70, oneShot: true, lock: 10,
    draw(c) {
      ['#ff6b6b', '#ffa94d', '#ffd84a', '#69db7c', '#4dabf7', '#9775fa'].forEach((col, i) => {
        c.strokeStyle = col; c.lineWidth = 8; c.beginPath(); c.arc(0, -4, 54 - i * 8, Math.PI, 0); c.stroke();
      });
      G.ell(c, -50, -6, 18, 10); G.fillO(c, '#ffffff', 2); G.ell(c, 50, -6, 18, 10); G.fillO(c, '#ffffff', 2);
    } });
  def('firework', { name: 'はなび', cat: 'magic', tags: ['fx', 'party'], w: 80, h: 100, oneShot: true, lock: 15,
    draw(c) {
      G.rr(c, -12, -60, 24, 58, 6); G.fillO(c, '#4c6fd6', 3);
      G.poly(c, [-14, -60, 0, -84, 14, -60]); G.fillO(c, '#ff6f61', 2.5);
      ['#ffd23f', '#ff6f91', '#7fd0e8'].forEach((col, i) => { G.star(c, -26 + i * 26, -100 + (i % 2) * 10, 9, 4); c.fillStyle = col; c.fill(); });
    } });

  /* 隠しアイテム（パネルに出ないが、出来事で登場する） */
  def('marshmallow', { name: 'マシュマロ', cat: 'hidden', tags: ['food', 'sweet'], w: 40, h: 60, food: true,
    draw(c) { c.strokeStyle = '#8a5a2b'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -40); c.stroke(); G.rr(c, -9, -60, 18, 22, 6); G.fillO(c, '#fff4f0', 2.5); } });
  def('ticket', { name: 'きっぷ', cat: 'hidden', tags: ['ticket'], w: 60, h: 40,
    draw(c) { G.rr(c, -26, -32, 52, 30, 4); G.fillO(c, '#ffe9a8', 2.5); c.fillStyle = '#e8424a'; c.fillRect(-18, -22, 20, 4); c.fillRect(-18, -14, 30, 4); } });
  def('flower', { name: 'おはな', cat: 'hidden', tags: ['flower'], w: 50, h: 60,
    draw(c) { c.strokeStyle = '#4c9a50'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -34); c.stroke(); for (let i = 0; i < 5; i++) { const a = (i / 5) * PT.TAU; G.circ(c, Math.cos(a) * 9, -42 + Math.sin(a) * 9, 7); c.fillStyle = '#ff8fab'; c.fill(); } G.circ(c, 0, -42, 6); c.fillStyle = '#ffd23f'; c.fill(); } });
  def('goldfish', { name: 'きんぎょ', cat: 'hidden', tags: ['fish'], w: 60, h: 60,
    draw(c, t) {
      G.ell(c, 0, -26, 28, 26); c.fillStyle = 'rgba(160,220,255,.6)'; c.fill(); c.strokeStyle = '#7fc3ea'; c.lineWidth = 2.5; c.stroke();
      const s = Math.sin(t * 0.01) * 6; G.ell(c, s, -24, 9, 6); c.fillStyle = '#ff6b3d'; c.fill(); G.poly(c, [s - 8, -24, s - 16, -30, s - 16, -18]); c.fill();
    } });
  def('present', { name: 'プレゼント', cat: 'hidden', tags: ['gift', 'party'], w: 70, h: 70,
    draw(c) { G.rr(c, -28, -52, 56, 50, 6); G.fillO(c, '#7fb6ef', 3); c.fillStyle = '#ff6f91'; c.fillRect(-5, -52, 10, 50); c.fillRect(-28, -32, 56, 10); G.ell(c, -10, -58, 10, 7, -0.4); G.fillO(c, '#ff6f91', 2); G.ell(c, 10, -58, 10, 7, 0.4); G.fillO(c, '#ff6f91', 2); } });

  /* 衣装パーツ単体（アイコン用。キャラ描画と同じ見た目） */
  PT.drawWearPiece = (c, slot, kind, t) => {
    const ch = { wear: { [slot]: kind }, pose: 'idle', def: PT.CHARS.lulu };
    if (slot === 'back') { PT._wearBack(c, ch, t || 0); return; }
    if (slot === 'body') {
      if (kind === 'cape') {
        c.beginPath(); c.moveTo(-24, -86); c.quadraticCurveTo(-36, -40, -30, -6); c.lineTo(30, -6); c.quadraticCurveTo(36, -40, 24, -86); c.closePath(); G.fillO(c, '#e2434b', 3);
        G.rr(c, -28, -92, 56, 12, 6); G.fillO(c, '#ffcf3f', 2.5);
        return;
      }
      PT._wearBody(c, ch);
      return;
    }
    PT._wearHead(c, ch, t || 0, 0);
    if (kind === 'helmet') PT._wearFront(c, ch, t || 0);
  };
})();
