/* 起動・タイトル画面の背景アニメーション */
'use strict';
(() => {
  const G = PT.G, B = PT.BG;
  const cv = document.getElementById('title-cv');
  const c = cv.getContext('2d');
  let bg = null, bw = 0, bh = 0, t = 0;
  const kids = [
    { cid: 'lulu', x: 470, pose: 'wave' }, { cid: 'pon', x: 640, pose: 'cheer' },
    { cid: 'gaku', x: 960, pose: 'wave' }, { cid: 'choco', x: 1120, pose: 'dance' },
    { cid: 'mimi', x: 300, pose: 'dance' }, { cid: 'moko', x: 1290, pose: 'cheer' }, { cid: 'pyoko', x: 800, pose: 'jump' },
  ].map((k, i) => ({ def: PT.CHARS[k.cid], cid: k.cid, x: k.x, y: 860, z: 0, pose: k.pose, poseT: 0, face: i % 2 ? 'laugh' : 'happy', wear: {}, seed: i * 1.7, scale: 1.15, look: 0, flip: k.x > 800 })).sort((a, b) => (a.cid === 'pyoko') - (b.cid === 'pyoko'));

  function drawBg(ctx) {
    const r = PT.seeded(42);
    B.sky(ctx, '#8fd3ff', '#e9f8ff', 600);
    B.cloud(ctx, 120, 120, 1.2); B.cloud(ctx, 1240, 90, 1.0); B.cloud(ctx, 1420, 220, 0.7); B.cloud(ctx, 60, 300, 0.6);
    ctx.fillStyle = G.grad(ctx, 0, 440, 0, 560, [[0, '#4fb3ea'], [1, '#9ee0f8']]); ctx.fillRect(0, 440, 1600, 140);
    ctx.fillStyle = '#b5e3a2'; G.ell(ctx, 260, 600, 520, 140); ctx.fill(); G.ell(ctx, 1300, 590, 560, 150); ctx.fill();
    const houses = [[60, '#fff1dc', '#ff8a65'], [230, '#e3f1ff', '#4c9be8'], [1150, '#fff8d6', '#58b07a'], [1310, '#ffe3ec', '#ff6f91'], [1460, '#efe6ff', '#9b6fd6']];
    houses.forEach(([x, wall, roof], i) => B.house(ctx, x, 560 - (i % 2) * 10, 120, 100 + (i % 3) * 14, wall, roof));
    // 灯台
    G.rr(ctx, 1520, 360, 34, 140, 6); G.fillO(ctx, '#ffffff', 3); ctx.fillStyle = '#ff6f61'; ctx.fillRect(1520, 400, 34, 18); ctx.fillRect(1520, 450, 34, 18);
    G.poly(ctx, [1514, 362, 1537, 330, 1560, 362]); G.fillO(ctx, '#ff6f61', 3);
    for (let i = 0; i < 8; i++) B.tree(ctx, 380 + i * 110 + (i % 2) * 30, 600, 0.6 + (i % 3) * 0.1, i % 2 ? '#79c26a' : '#5fae58');
    B.grass(ctx, 600, '#93d27a', '#6db75a');
    B.tufts(ctx, r, 620, 70, '#5fae58');
    B.flowers(ctx, r, 640, 60);
    B.bush(ctx, 80, 760, 1.5); B.bush(ctx, 1520, 780, 1.6);
    B.bunting(ctx, 0, 30, 1600, 30, 70);
  }
  function resize() {
    const d = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(innerWidth * d); cv.height = Math.round(innerHeight * d);
    bw = innerWidth; bh = innerHeight;
    const s = Math.max(bw / 1600, bh / 900) * d;
    bg = document.createElement('canvas'); bg.width = Math.round(1600 * s); bg.height = Math.round(900 * s);
    const bc = bg.getContext('2d'); bc.scale(s, s); drawBg(bc);
  }
  PT.titleFrame = (dt) => {
    if (!bg || bw !== innerWidth || bh !== innerHeight) resize();
    t += dt;
    const d = Math.min(2, window.devicePixelRatio || 1);
    const s = Math.max(bw / 1600, bh / 900);
    c.setTransform(d, 0, 0, d, 0, 0);
    const ox = (bw - 1600 * s) / 2, oy = (bh - 900 * s);
    c.save(); c.translate(ox, oy); c.scale(s, s);
    c.drawImage(bg, 0, 0, 1600, 900);
    kids.forEach((k, i) => {
      k.poseT += dt;
      const hop = Math.max(0, Math.sin(t * 0.004 + i * 1.3)) * 18;
      k.z = hop;
      G.shadow(c, k.x, k.y + 2, 46, 0.16);
      PT.drawChar(c, k, t);
    });
    // ふわふわ風船
    for (let i = 0; i < 4; i++) {
      const x = 180 + i * 400 + Math.sin(t * 0.0008 + i) * 30, y = 520 - ((t * 0.03 + i * 220) % 700);
      c.save(); c.translate(x, y); c.scale(0.8, 0.8); PT.ITEMS.balloon.draw(c, t, { color: ['#ff5d78', '#ffd23f', '#58b9f0', '#9b6fd6'][i], seed: i }); c.restore();
    }
    c.restore();
  };

  async function boot() {
    await PT.save.load();
    const st = PT.save.data.settings;
    PT.audio.volume = st.volume; PT.audio.bgmOn = st.bgm; PT.audio.sfxOn = st.sfx; PT.audio.speakOn = st.speak;
    PT.game.applySettings();
    PT.game.show('title');
    requestAnimationFrame(PT.game.frame);
    // 最初のタッチで音を有効化（ブラウザの決まり）
    const unlock = () => { PT.audio.init(); if (PT.game.screen === 'title') { PT.audio.bgmTheme = null; PT.audio.playBgm('title'); } window.removeEventListener('pointerdown', unlock); };
    window.addEventListener('pointerdown', unlock);
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  boot();
})();
