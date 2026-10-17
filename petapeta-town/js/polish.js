/* 背景の しあげ：ひかり・かげ・こまかい もよう（1かいだけ 描いて キャッシュされる） */
'use strict';
(() => {
  const G = PT.G, W = PT.W, H = PT.H;

  const grain = (c, r, y0, y1, n, cols) => { for (let i = 0; i < n; i++) { c.fillStyle = cols[i % cols.length]; c.fillRect(r() * W, y0 + r() * (y1 - y0), 1.6 + r() * 1.6, 1.6 + r() * 1.6); } };
  const glow = (c, x, y, rad, col, a) => { const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); };
  const vignette = (c, a = 0.14) => { const g = c.createRadialGradient(W / 2, H * 0.55, H * 0.45, W / 2, H * 0.55, W * 0.72); g.addColorStop(0, 'rgba(40,30,80,0)'); g.addColorStop(1, `rgba(40,30,80,${a})`); c.fillStyle = g; c.fillRect(0, 0, W, H); };
  const ao = (c, y, h = 40, a = 0.18) => { const g = c.createLinearGradient(0, y - 4, 0, y + h); g.addColorStop(0, `rgba(60,40,40,${a})`); g.addColorStop(1, 'rgba(60,40,40,0)'); c.fillStyle = g; c.fillRect(0, y - 4, W, h + 4); };
  const beam = (c, x0, x1, yTop, xb0, xb1, yBot, a = 0.16) => { const g = c.createLinearGradient(0, yTop, 0, yBot); g.addColorStop(0, `rgba(255,248,210,${a})`); g.addColorStop(1, 'rgba(255,248,210,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x0, yTop); c.lineTo(x1, yTop); c.lineTo(xb1, yBot); c.lineTo(xb0, yBot); c.closePath(); c.fill(); };

  /* かべの こもよう */
  const wallMotif = (c, r, y1, kind, col) => {
    c.fillStyle = col;
    for (let y = 30; y < y1 - 30; y += 56) for (let x = 20 + ((y / 56) % 2) * 30; x < W; x += 60) {
      if (kind === 'flower') { for (let k = 0; k < 5; k++) { const a = (k / 5) * PT.TAU; G.circ(c, x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3); c.fill(); } }
      else if (kind === 'heart') { G.heart(c, x, y, 6); c.fill(); }
      else if (kind === 'star') { G.star(c, x, y, 6, 2.6); c.fill(); }
      else { G.circ(c, x, y, 2.4); c.fill(); }
    }
    // はばき と まわりぶち
    c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(0, y1 - 26, W, 6);
    c.fillStyle = 'rgba(120,80,50,.18)'; c.fillRect(0, y1 - 20, W, 20);
  };
  /* もくめ */
  const woodGrain = (c, r, y0) => {
    c.strokeStyle = 'rgba(140,80,30,.16)'; c.lineWidth = 2;
    for (let y = y0 + 16; y < H; y += 26) {
      for (let x = (r() * 200) | 0; x < W; x += 180 + r() * 120) {
        c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 24); c.stroke();
        c.beginPath(); c.moveTo(x + 20, y + 8); c.quadraticCurveTo(x + 60, y + 4 + r() * 8, x + 110, y + 10); c.stroke();
        if (r() < 0.25) { G.ell(c, x + 70, y + 12, 6, 3); c.stroke(); }
      }
    }
    // つやの ハイライト
    const g = c.createLinearGradient(0, y0, 0, H); g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(0.4, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, y0, W, H - y0);
  };
  /* くさ */
  const grassDetail = (c, r, y0, dark, light) => {
    for (let i = 0; i < 520; i++) {
      const x = r() * W, y = y0 + r() * (H - y0), h = 6 + r() * 10 * (0.6 + (y - y0) / (H - y0));
      c.strokeStyle = r() < 0.5 ? dark : light; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (r() - 0.5) * 6, y - h * 0.6, x + (r() - 0.5) * 8, y - h); c.stroke();
    }
    // クローバー
    for (let i = 0; i < 40; i++) { const x = r() * W, y = y0 + 30 + r() * (H - y0 - 30); c.fillStyle = 'rgba(70,150,70,.55)'; for (let k = 0; k < 3; k++) { const a = (k / 3) * PT.TAU - 1.57; G.circ(c, x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.4); c.fill(); } }
    // ひかりの まだら
    for (let i = 0; i < 14; i++) glow(c, r() * W, y0 + r() * (H - y0), 90 + r() * 80, 'rgba(255,255,200,A)', 0.12);
  };
  const sandDetail = (c, r, y0) => {
    c.strokeStyle = 'rgba(200,150,90,.28)'; c.lineWidth = 2;
    for (let y = y0 + 40; y < H; y += 34) { c.beginPath(); for (let x = -20; x <= W + 20; x += 40) { const yy = y + Math.sin(x * 0.012 + y) * 6; x < 0 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
    const g = c.createLinearGradient(0, y0 - 10, 0, y0 + 60); g.addColorStop(0, 'rgba(160,120,70,.35)'); g.addColorStop(1, 'rgba(160,120,70,0)'); c.fillStyle = g; c.fillRect(0, y0 - 10, W, 70);
    grain(c, r, y0, H, 900, ['rgba(255,255,255,.55)', 'rgba(170,120,60,.35)', 'rgba(255,200,150,.45)']);
  };
  const tileShade = (c, r, y0) => {
    for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '90,70,60'},${0.05 + r() * 0.07})`; c.fillRect(((r() * 32) | 0) * 50, y0 + ((r() * 8) | 0) * 40, 50, 40); }
    grain(c, r, y0, H, 500, ['rgba(255,255,255,.4)', 'rgba(90,70,60,.25)']);
  };
  /* そらの くも や ひかり */
  const skyGlow = (c, x, y, col) => { glow(c, x, y, 360, col, 0.35); glow(c, x, y, 140, col, 0.35); };

  /* もとの 背景パーツに こまかい もようを くみこむ（窓や 絵の 下に なるように） */
  const B = PT.BG;
  const MOTIF = { home: ['flower', 'rgba(255,170,120,.22)'], clinic: ['heart', 'rgba(120,200,170,.25)'], kinder: ['star', 'rgba(255,180,80,.25)'] };
  const wp0 = B.wallpaper, fw0 = B.floorWood, gr0 = B.grass;
  B.wallpaper = (c, y1, col, stripe) => { wp0(c, y1, col, stripe); const m = MOTIF[PT._polishStage] || ['dot', 'rgba(255,255,255,.3)']; wallMotif(c, PT.seeded(9), y1, m[0], m[1]); };
  B.floorWood = (c, y0, col) => { fw0(c, y0, col); woodGrain(c, PT.seeded(y0), y0); };
  B.grass = (c, y0, col1, col2) => { gr0(c, y0, col1, col2); grassDetail(c, PT.seeded(y0 + 3), y0, PT.shade(col2, -0.35).replace('rgb', 'rgba').replace(')', ',.5)'), PT.shade(col1, 0.35).replace('rgb', 'rgba').replace(')', ',.5)')); };

  const P = {
    home(c, r) {
      ao(c, 580, 50);
      beam(c, 620, 960, 360, 520, 1160, 860, 0.2);
      skyGlow(c, 790, 230, 'rgba(255,240,190,A)');
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 4; G.ell(c, 780, 760, 500, 104); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.45)'; for (let i = 0; i < 28; i++) { const a = (i / 28) * PT.TAU; G.circ(c, 780 + Math.cos(a) * 440, 760 + Math.sin(a) * 82, 4); c.fill(); }
    },
    park(c, r) { skyGlow(c, 1350, 90, 'rgba(255,250,200,A)'); },
    shop(c, r) { tileShade(c, r, 580); ao(c, 580, 30, 0.14); skyGlow(c, 800, 60, 'rgba(255,245,200,A)'); for (let i = 0; i < 3; i++) beam(c, 120 + i * 540, 360 + i * 540, 360, 60 + i * 540, 460 + i * 540, 700, 0.1); },
    beach(c, r) { sandDetail(c, r, 590); skyGlow(c, 1380, 120, 'rgba(255,240,170,A)'); c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 60; i++) { G.ell(c, r() * W, 395 + r() * 180, 8 + r() * 18, 1.6); c.fill(); } },
    camp(c, r) { glow(c, 820, 650, 420, 'rgba(255,170,80,A)', 0.22); glow(c, 1450, 300, 200, 'rgba(255,250,210,A)', 0.2); },
    fun(c, r) { tileShade(c, r, 580); skyGlow(c, 800, 200, 'rgba(255,220,240,A)'); for (let i = 0; i < 40; i++) { c.fillStyle = ['rgba(255,111,145,.35)', 'rgba(255,210,63,.35)', 'rgba(127,182,239,.35)'][i % 3]; c.save(); c.translate(r() * W, 600 + r() * 280); c.rotate(r() * 6); c.fillRect(-6, -3, 12, 6); c.restore(); } },
    clinic(c, r) { ao(c, 590, 46); beam(c, 600, 900, 340, 520, 1080, 860, 0.18); },
    kinder(c, r) { ao(c, 600, 46); beam(c, 1000, 1260, 340, 940, 1420, 860, 0.18); },
    station(c, r) { tileShade(c, r, 590); ao(c, 590, 30, 0.2); skyGlow(c, 300, 60, 'rgba(255,245,200,A)'); },
    space(c, r) { glow(c, 600, 200, 500, 'rgba(255,170,230,A)', 0.12); glow(c, 1150, 160, 400, 'rgba(150,210,255,A)', 0.12); grain(c, r, 620, H, 600, ['rgba(255,255,255,.25)', 'rgba(60,50,100,.25)']); for (let i = 0; i < 26; i++) { const x = r() * W, y = 640 + r() * 240, rr = 6 + r() * 16; G.ell(c, x, y, rr, rr * 0.35); c.fillStyle = 'rgba(80,70,130,.35)'; c.fill(); G.ell(c, x, y - rr * 0.08, rr * 0.8, rr * 0.25); c.fillStyle = 'rgba(255,255,255,.12)'; c.fill(); } },
    forest(c, r) { for (let i = 0; i < 5; i++) beam(c, 160 + i * 300, 220 + i * 300, 0, 260 + i * 300, 420 + i * 300, 760, 0.12); },
    fest(c, r) { sandDetail(c, r, 580); glow(c, 800, 420, 520, 'rgba(255,190,110,A)', 0.2); },
  };
  PT.polishBg = (c, stage) => {
    const r = PT.seeded(stage.num * 7331);
    const was = PT.SHADE; PT.SHADE = false;
    try { if (P[stage.id]) P[stage.id](c, r); } catch (e) { console.error(e); }
    PT.SHADE = was;
    vignette(c, stage.night ? 0.22 : 0.12);
  };
})();
