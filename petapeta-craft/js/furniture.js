/* おうちの かぐ（つくってワールド だけの どうぐ。足もと中央が 原点） */
'use strict';
(() => {
  const G = PT.G;
  const def = (id, o) => { PT.ITEMS[id] = Object.assign({ id, tags: [], w: 90, h: 90, cat: 'home' }, o); };

  def('bed', { name: 'ベッド', w: 190, h: 110, sleep: true,
    draw(c) {
      G.rr(c, -92, -104, 26, 104, 10); G.fillO(c, '#c98a4a', 3);
      G.rr(c, 70, -70, 22, 70, 9); G.fillO(c, '#c98a4a', 3);
      G.rr(c, -80, -54, 164, 40, 12); G.fillO(c, '#ffffff', 3);
      G.rr(c, -70, -76, 46, 26, 12); G.fillO(c, '#fff4e2', 3);
      c.beginPath(); c.moveTo(-26, -58); c.quadraticCurveTo(30, -66, 84, -56); c.lineTo(84, -24); c.quadraticCurveTo(30, -18, -26, -24); c.closePath(); G._bb = { x0: -26, y0: -66, x1: 84, y1: -18 }; G.fillO(c, '#ff9fbd', 3);
      c.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 4; i++) { G.heart(c, -6 + i * 24, -40, 6); c.fill(); }
      G.rr(c, -84, -16, 170, 12, 5); G.fillO(c, '#b07038', 2.5);
    } });
  def('sofa', { name: 'ソファ', w: 170, h: 96, seat: true,
    draw(c) {
      G.rr(c, -78, -92, 156, 56, 22); G.fillO(c, '#7fb6ef', 3);
      G.rr(c, -84, -54, 168, 40, 16); G.fillO(c, '#6aa4e6', 3);
      for (const x of [-86, 62]) { G.rr(c, x, -70, 24, 58, 12); G.fillO(c, '#5b94d8', 3); }
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -88); c.lineTo(0, -56); c.stroke();
      for (const x of [-70, 62]) { G.rr(c, x, -14, 10, 14, 3); G.fillO(c, '#8a5a2b', 2); }
      G.rr(c, -50, -78, 34, 26, 10); G.fillO(c, '#ffd23f', 2.5);
    } });
  def('plantpot', { name: 'うえきばち', w: 70, h: 120,
    draw(c, t) {
      const sw = Math.sin((t || 0) * 0.002) * 0.05;
      c.save(); c.translate(0, -50); c.rotate(sw);
      for (const [a, l] of [[-0.7, 52], [-0.25, 64], [0.25, 60], [0.7, 50]]) { c.save(); c.rotate(a); G.ell(c, 0, -l / 2, 13, l / 2); G.fillO(c, '#5cbf5a', 2.5); c.strokeStyle = 'rgba(40,110,40,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -4); c.lineTo(0, -l + 8); c.stroke(); c.restore(); }
      c.restore();
      c.beginPath(); c.moveTo(-28, -56); c.lineTo(28, -56); c.lineTo(20, 0); c.lineTo(-20, 0); c.closePath(); G.fillO(c, '#e0694f', 3);
      G.rr(c, -32, -60, 64, 12, 5); G.fillO(c, '#f08a6f', 2.5);
    } });
  def('clock', { name: 'はしら どけい', w: 70, h: 170,
    draw(c, t) {
      G.rr(c, -30, -168, 60, 168, 14); G.fillO(c, '#b97a42', 3);
      G.circ(c, 0, -128, 24); G.fillO(c, '#fff8e8', 3);
      const tt = (t || 0) * 0.0005;
      c.strokeStyle = '#2a1f35'; c.lineWidth = 3.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, -128); c.lineTo(Math.sin(tt) * 12, -128 - Math.cos(tt) * 12); c.stroke();
      c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -128); c.lineTo(Math.sin(tt * 12) * 18, -128 - Math.cos(tt * 12) * 18); c.stroke();
      G.rr(c, -18, -92, 36, 72, 10); c.fillStyle = 'rgba(60,30,10,.35)'; c.fill();
      const sw = Math.sin((t || 0) * 0.004) * 0.35;
      c.save(); c.translate(0, -88); c.rotate(sw); c.strokeStyle = '#e0a92a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 46); c.stroke(); G.circ(c, 0, 50, 9); G.fillO(c, '#f5c242', 2.5); c.restore();
    } });
  def('bath', { name: 'おふろ', w: 170, h: 100,
    draw(c, t) {
      for (let i = 0; i < 5; i++) { const k = (((t || 0) * 0.0004 + i * 0.2) % 1); G.circ(c, -50 + i * 26, -84 - k * 40, 10 + k * 8); c.fillStyle = `rgba(255,255,255,${0.85 * (1 - k)})`; c.fill(); c.strokeStyle = `rgba(150,200,240,${0.8 * (1 - k)})`; c.lineWidth = 2; c.stroke(); }
      G.rr(c, -80, -76, 160, 64, 26); G.fillO(c, '#ffffff', 3);
      G.ell(c, 0, -70, 72, 10); c.fillStyle = '#9fd8ff'; c.fill();
      G.circ(c, 40, -78, 12); G.fillO(c, '#ffd23f', 2.5); G.poly(c, [50, -80, 60, -76, 50, -74]); c.fillStyle = '#ff9a3d'; c.fill();
      for (const x of [-60, 52]) { G.rr(c, x, -16, 10, 16, 4); G.fillO(c, '#f5c242', 2); }
    } });
  def('piano', { name: 'ピアノ', w: 150, h: 140,
    draw(c) {
      G.rr(c, -70, -136, 140, 90, 12); G.fillO(c, '#3a3550', 3);
      G.rr(c, -62, -52, 124, 22, 5); G.fillO(c, '#ffffff', 2.5);
      c.fillStyle = '#2a1f35'; for (let i = 0; i < 9; i++) if (i % 7 !== 2 && i % 7 !== 6) c.fillRect(-52 + i * 13, -52, 7, 12);
      for (const x of [-64, 56]) { G.rr(c, x, -32, 8, 32, 3); G.fillO(c, '#3a3550', 2); }
      c.fillStyle = '#ffe066'; G.note(c, -20, -96, 22, '#ffe066'); G.note(c, 22, -106, 18, '#ff8fb1');
    } });
  def('fridge', { name: 'れいぞうこ', w: 90, h: 170,
    draw(c) {
      G.rr(c, -42, -168, 84, 168, 14); G.fillO(c, '#e8f3ff', 3);
      c.strokeStyle = '#9fb8d6'; c.lineWidth = 3; c.beginPath(); c.moveTo(-42, -110); c.lineTo(42, -110); c.stroke();
      for (const y of [-150, -90]) { G.rr(c, 26, y, 8, 26, 4); G.fillO(c, '#9fb8d6', 2); }
      G.heart(c, -12, -140, 9); c.fillStyle = '#ff6f91'; c.fill(); G.star(c, 0, -70, 9, 4); c.fillStyle = '#ffd23f'; c.fill();
      c.fillStyle = '#fff'; G.rr(c, -26, -64, 30, 22, 3); c.fill(); c.strokeStyle = '#ffb04a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-20, -56); c.lineTo(-2, -56); c.moveTo(-20, -50); c.lineTo(-8, -50); c.stroke();
    } });
  def('tv', { name: 'テレビ', w: 130, h: 120,
    draw(c, t) {
      G.rr(c, -54, -26, 108, 26, 6); G.fillO(c, '#c98a4a', 3);
      G.rr(c, -60, -116, 120, 84, 12); G.fillO(c, '#3a3550', 3);
      G.rr(c, -50, -106, 100, 64, 8); c.fillStyle = '#7fd0ff'; c.fill();
      const k = Math.sin((t || 0) * 0.003);
      c.save(); G.rr(c, -50, -106, 100, 64, 8); c.clip(); G.circ(c, -10 + k * 14, -66, 18); c.fillStyle = '#ffd23f'; c.fill(); G.ell(c, 20, -48, 40, 12); c.fillStyle = '#7bd36a'; c.fill(); c.restore();
    } });

  def('stove', { name: 'コンロ', w: 100, h: 120,
    draw(c, t) {
      G.rr(c, -46, -96, 92, 96, 10); G.fillO(c, '#ffffff', 3);
      G.rr(c, -36, -64, 72, 52, 8); c.fillStyle = '#3a3550'; c.fill(); G.rr(c, -26, -56, 52, 30, 6); c.fillStyle = 'rgba(255,170,90,.45)'; c.fill();
      for (const x of [-26, 0, 26]) { G.circ(c, x, -80, 5); G.fillO(c, '#ff9a3d', 2); }
      G.rr(c, -40, -118, 60, 22, 10); G.fillO(c, '#58b9f0', 3); G.rr(c, 18, -112, 24, 6, 3); G.fillO(c, '#3a3550', 2);
      for (let i = 0; i < 2; i++) { const k = (((t || 0) * 0.0005 + i * 0.5) % 1); G.circ(c, -10 + i * 10, -126 - k * 30, 6 + k * 6); c.fillStyle = `rgba(255,255,255,${0.8 * (1 - k)})`; c.fill(); }
    } });
  def('floorlamp', { name: 'スタンド', w: 60, h: 160, glow: true,
    draw(c) {
      G.ell(c, 0, -4, 22, 6); G.fillO(c, '#8a7a6a', 2.5);
      c.strokeStyle = '#8a7a6a'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -6); c.lineTo(0, -120); c.stroke();
      c.beginPath(); c.moveTo(-26, -112); c.lineTo(-16, -156); c.lineTo(16, -156); c.lineTo(26, -112); c.closePath(); G._bb = { x0: -26, y0: -156, x1: 26, y1: -112 }; G.fillO(c, '#ffe9a0', 3);
      c.fillStyle = 'rgba(255,240,180,.5)'; G.ell(c, 0, -100, 30, 10); c.fill();
    } });
  def('canopybed', { name: 'てんがいの ベッド', w: 200, h: 200, sleep: true,
    draw(c, t) {
      for (const x of [-90, 86]) { G.rr(c, x, -196, 8, 196, 4); G.fillO(c, '#f5c242', 2); }
      c.beginPath(); c.moveTo(-100, -190); c.quadraticCurveTo(0, -226, 100, -190); c.lineTo(100, -176); c.lineTo(-100, -176); c.closePath(); G._bb = { x0: -100, y0: -226, x1: 100, y1: -176 }; G.fillO(c, '#ff8fb1', 3);
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 98, -180); c.quadraticCurveTo(s * 70, -110, s * 92, -40); c.lineTo(s * 100, -40); c.lineTo(s * 100, -180); c.closePath(); c.fillStyle = 'rgba(255,214,230,.85)'; c.fill(); }
      G.rr(c, -84, -56, 168, 40, 12); G.fillO(c, '#ffffff', 3);
      G.rr(c, -74, -78, 46, 26, 12); G.fillO(c, '#fff4f8', 3);
      c.beginPath(); c.moveTo(-26, -60); c.quadraticCurveTo(30, -68, 84, -58); c.lineTo(84, -26); c.quadraticCurveTo(30, -20, -26, -26); c.closePath(); G._bb = { x0: -26, y0: -68, x1: 84, y1: -20 }; G.fillO(c, '#d9c9ff', 3);
      c.fillStyle = '#ffd23f'; for (let i = 0; i < 4; i++) { G.star(c, -6 + i * 24, -42, 6, 2.6); c.fill(); }
      G.rr(c, -90, -18, 180, 12, 5); G.fillO(c, '#f5c242', 2.5);
      G.heart(c, 0, -200, 10); c.fillStyle = '#ff5d78'; c.fill();
    } });
  def('toybox', { name: 'おもちゃばこ', w: 110, h: 100,
    draw(c) {
      G.circ(c, -22, -76, 16); G.fillO(c, '#ff6f91', 2.5); G.rr(c, 6, -96, 16, 30, 4); G.fillO(c, '#58b9f0', 2.5); G.star(c, 30, -80, 12, 5); G.fillO(c, '#ffd23f', 2);
      G.rr(c, -50, -66, 100, 66, 10); G.fillO(c, '#ffb04a', 3);
      c.fillStyle = '#fff'; c.font = `900 26px ${PT.FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('★', 0, -32);
    } });
  def('bookcase', { name: 'ほんだな', w: 90, h: 170,
    draw(c) {
      G.rr(c, -42, -170, 84, 170, 8); G.fillO(c, '#b97a42', 3);
      const cols = ['#ff6f91', '#58b9f0', '#ffd23f', '#7bd36a', '#9b8cff', '#ff9a3d'];
      for (let r = 0; r < 3; r++) { const y = -160 + r * 52; c.fillStyle = 'rgba(80,40,10,.35)'; c.fillRect(-34, y, 68, 44); for (let i = 0; i < 6; i++) { const h = 30 + ((i * 7 + r * 3) % 12); c.fillStyle = cols[(i + r) % 6]; c.fillRect(-32 + i * 11, y + 44 - h, 9, h); } }
    } });
  def('telescope', { name: 'ぼうえんきょう', w: 110, h: 150,
    draw(c) {
      c.strokeStyle = '#6a5a8a'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -70); c.lineTo(-30, 0); c.moveTo(0, -70); c.lineTo(30, 0); c.moveTo(0, -70); c.lineTo(0, 0); c.stroke();
      c.save(); c.translate(0, -78); c.rotate(-0.6); G.rr(c, -50, -14, 100, 28, 12); G.fillO(c, '#58b9f0', 3); G.rr(c, 44, -18, 16, 36, 6); G.fillO(c, '#ffd23f', 2.5); c.restore();
    } });
  /* にわの もの */
  def('gtree', { name: 'おおきな き', cat: 'garden', w: 200, h: 300,
    draw(c, t) {
      G.rr(c, -18, -150, 36, 150, 12); G.fillO(c, '#a8733f', 3);
      const sw = Math.sin((t || 0) * 0.0015) * 3;
      [[-50, -190, 60], [50, -195, 58], [0, -240, 70], [-30, -150, 46], [40, -150, 46]].forEach(([x, y, r]) => { G.circ(c, x + sw, y, r); G.fillO(c, '#5cbf5a', 3); });
      [[-40, -200], [30, -230], [55, -170], [-10, -160]].forEach(([x, y]) => { G.circ(c, x + sw, y, 8); G.fillO(c, '#ff5d5d', 2); });
    } });
  def('flowerbed', { name: 'はなだん', cat: 'garden', w: 140, h: 70,
    draw(c) {
      for (let i = 0; i < 6; i++) { const x = -54 + i * 22; c.strokeStyle = '#4f9e46'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, -20); c.lineTo(x, -44 - (i % 2) * 10); c.stroke(); for (let k = 0; k < 5; k++) { const a = (k / 5) * PT.TAU; G.circ(c, x + Math.cos(a) * 7, -48 - (i % 2) * 10 + Math.sin(a) * 7, 6); c.fillStyle = ['#ff6f91', '#ffd23f', '#9b8cff', '#ff8a65'][i % 4]; c.fill(); } G.circ(c, x, -48 - (i % 2) * 10, 4); c.fillStyle = '#fff3a8'; c.fill(); }
      G.rr(c, -66, -24, 132, 24, 8); G.fillO(c, '#b9844f', 3);
    } });
  def('mailbox', { name: 'ゆうびんうけ', cat: 'garden', w: 60, h: 130,
    draw(c) {
      G.rr(c, -5, -80, 10, 80, 3); G.fillO(c, '#a8733f', 2.5);
      c.beginPath(); c.moveTo(-28, -76); c.lineTo(-28, -104); c.arc(0, -104, 28, Math.PI, 0); c.lineTo(28, -76); c.closePath(); G._bb = { x0: -28, y0: -132, x1: 28, y1: -76 }; G.fillO(c, '#ef5f55', 3);
      G.heart(c, 0, -98, 9); c.fillStyle = '#fff'; c.fill();
      c.strokeStyle = '#3a3550'; c.lineWidth = 3; c.beginPath(); c.moveTo(28, -100); c.lineTo(28, -126); c.stroke(); G.rr(c, 28, -128, 18, 10, 2); c.fillStyle = '#ffd23f'; c.fill();
    } });
  def('doghouse', { name: 'いぬごや', cat: 'garden', w: 130, h: 130,
    draw(c, t) {
      G.rr(c, -54, -76, 108, 76, 6); G.fillO(c, '#e2a965', 3);
      c.beginPath(); c.moveTo(-66, -70); c.lineTo(0, -128); c.lineTo(66, -70); c.closePath(); G._bb = { x0: -66, y0: -128, x1: 66, y1: -70 }; G.fillO(c, '#4f8fe8', 3);
      c.beginPath(); c.moveTo(-24, 0); c.lineTo(-24, -34); c.arc(0, -34, 24, Math.PI, 0); c.lineTo(24, 0); c.closePath(); c.fillStyle = '#5a3a2a'; c.fill();
      const b = Math.sin((t || 0) * 0.005) * 2; G.circ(c, 0, -22 + b, 16); G.fillO(c, '#fff4e2', 2.5); G.ell(c, -14, -30 + b, 6, 10, 0.3); G.fillO(c, '#c98a4a', 2); G.ell(c, 14, -30 + b, 6, 10, -0.3); G.fillO(c, '#c98a4a', 2);
      c.fillStyle = '#2a1f35'; G.circ(c, -6, -24 + b, 2.6); c.fill(); G.circ(c, 6, -24 + b, 2.6); c.fill(); G.circ(c, 0, -17 + b, 3); c.fill();
    } });
  def('swing', { name: 'ブランコ', cat: 'garden', w: 170, h: 180,
    draw(c, t) {
      c.strokeStyle = '#ef5f55'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-80, 0); c.lineTo(-60, -170); c.lineTo(60, -170); c.lineTo(80, 0); c.stroke();
      const a = Math.sin((t || 0) * 0.003) * 0.25; c.save(); c.translate(0, -166); c.rotate(a); c.strokeStyle = '#8a7a6a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-26, 0); c.lineTo(-26, 120); c.moveTo(26, 0); c.lineTo(26, 120); c.stroke(); G.rr(c, -34, 116, 68, 12, 5); G.fillO(c, '#58b9f0', 2.5); c.restore();
    } });
  def('streetlamp', { name: 'がいとう', cat: 'garden', w: 60, h: 220, glow: true,
    draw(c) {
      G.rr(c, -16, -12, 32, 12, 4); G.fillO(c, '#3a3550', 2.5); G.rr(c, -5, -190, 10, 180, 4); G.fillO(c, '#3a3550', 2.5);
      G.rr(c, -20, -226, 40, 40, 10); G.fillO(c, '#ffe9a0', 3); G.rr(c, -24, -232, 48, 10, 4); G.fillO(c, '#3a3550', 2);
    } });
  def('bench', { name: 'ベンチ', cat: 'garden', w: 150, h: 80, seat: true, seatY: 50,
    draw(c) {
      for (const x of [-56, 50]) { G.rr(c, x, -40, 8, 40, 3); G.fillO(c, '#3a3550', 2); }
      G.rr(c, -70, -52, 140, 14, 5); G.fillO(c, '#c27a3e', 2.5); G.rr(c, -70, -84, 140, 12, 5); G.fillO(c, '#c27a3e', 2.5); G.rr(c, -70, -70, 140, 12, 5); G.fillO(c, '#c27a3e', 2.5);
    } });
  def('picket', { name: 'さく', cat: 'garden', w: 150, h: 70,
    draw(c) {
      G.rr(c, -74, -50, 148, 10, 4); G.fillO(c, '#ffffff', 2); G.rr(c, -74, -26, 148, 10, 4); G.fillO(c, '#ffffff', 2);
      for (let x = -64; x <= 64; x += 32) { c.beginPath(); c.moveTo(x - 9, 0); c.lineTo(x - 9, -58); c.lineTo(x, -70); c.lineTo(x + 9, -58); c.lineTo(x + 9, 0); c.closePath(); G._bb = { x0: x - 9, y0: -70, x1: x + 9, y1: 0 }; G.fillO(c, '#ffffff', 2.2); }
    } });
  PT.GARDEN_ITEMS = ['gtree', 'flowerbed', 'picket', 'mailbox', 'doghouse', 'swing', 'bench', 'streetlamp', 'slide', 'trampoline', 'pool', 'tent', 'seesaw', 'castle', 'snowman', 'sunflower'];
  PT.HOME_ITEMS = ['bed', 'canopybed', 'stove', 'floorlamp', 'toybox', 'bookcase', 'telescope', 'sofa', 'table', 'chair', 'tv', 'piano', 'fridge', 'bath', 'clock', 'plantpot', 'cushion', 'teddy', 'blocks', 'throne', 'chandelier', 'mirror', 'castletoy'];
})();
