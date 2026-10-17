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
  PT.HOME_ITEMS = ['bed', 'sofa', 'table', 'chair', 'tv', 'piano', 'fridge', 'bath', 'clock', 'plantpot', 'cushion', 'teddy', 'blocks', 'throne', 'chandelier', 'mirror', 'castletoy'];
})();
