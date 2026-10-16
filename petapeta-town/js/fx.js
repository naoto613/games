/* 特別な演出：かげえ・にじ・はなび・なみ・ちいさな いきもの など */
'use strict';
(() => {
  const G = PT.G;
  const Wd = PT.world;
  const X = (PT.FX = {});

  /* ちいさな いきもの */
  const CRIT = {
    squirrel(c, f, k) {
      const hop = Math.abs(Math.sin(f.life * 0.012)) * 14;
      c.translate(f.x, f.y - hop); c.scale(f.dir || 1, 1);
      c.beginPath(); c.moveTo(-16, -10); c.quadraticCurveTo(-46, -30, -30, -58); c.quadraticCurveTo(-14, -40, -10, -14); G.fillO(c, '#c9813e', 2.5);
      G.ell(c, 0, -14, 16, 13); G.fillO(c, '#d9944e', 2.5);
      G.circ(c, 12, -30, 11); G.fillO(c, '#d9944e', 2.5);
      G.poly(c, [6, -40, 10, -50, 14, -40]); G.fillO(c, '#d9944e', 2);
      G.circ(c, 16, -32, 2.4); c.fillStyle = '#2b2440'; c.fill();
      if (f.carry) { G.ell(c, 22, -18, 6, 7); c.fillStyle = '#c9813e'; c.fill(); }
    },
    bird(c, f) {
      const fl = Math.sin(f.life * 0.03) * 0.6;
      c.translate(f.x, f.y); c.scale(f.dir || 1, 1);
      G.ell(c, 0, 0, 16, 12); G.fillO(c, f.col || '#7fb6ef', 2.5);
      c.save(); c.rotate(-0.4 + fl); G.ell(c, -4, -8, 12, 6); G.fillO(c, PT.shade(f.col || '#7fb6ef', -0.1), 2); c.restore();
      G.poly(c, [14, -2, 24, 1, 14, 4]); c.fillStyle = '#ffb02e'; c.fill();
      G.circ(c, 8, -4, 2.2); c.fillStyle = '#2b2440'; c.fill();
    },
    owl(c, f) {
      c.translate(f.x, f.y);
      G.ell(c, 0, -26, 22, 26); G.fillO(c, '#9a7a5a', 2.5);
      G.ell(c, 0, -20, 13, 15); c.fillStyle = '#e8d6b8'; c.fill();
      for (const s of [-1, 1]) { G.circ(c, s * 9, -36, 8); c.fillStyle = '#fff'; c.fill(); G.circ(c, s * 9, -36, 4); c.fillStyle = '#2b2440'; c.fill(); G.poly(c, [s * 8, -50, s * 18, -60, s * 18, -46]); c.fillStyle = '#9a7a5a'; c.fill(); }
      G.poly(c, [-3, -30, 3, -30, 0, -24]); c.fillStyle = '#ffb02e'; c.fill();
    },
    crab(c, f) {
      const w = Math.sin(f.life * 0.02) * 4;
      c.translate(f.x + w, f.y);
      for (const s of [-1, 1]) { G.circ(c, s * 26, -26, 9); G.fillO(c, '#ff6f61', 2); G.limb(c, s * 14, -12, s * 24, 0, 4, '#ff6f61'); }
      G.ell(c, 0, -14, 20, 13); G.fillO(c, '#ff6f61', 2.5);
      for (const s of [-1, 1]) { c.strokeStyle = '#c4473f'; c.lineWidth = 3; c.beginPath(); c.moveTo(s * 6, -24); c.lineTo(s * 8, -34); c.stroke(); G.circ(c, s * 8, -36, 4); c.fillStyle = '#fff'; c.fill(); G.circ(c, s * 8, -36, 2); c.fillStyle = '#2b2440'; c.fill(); }
    },
    alien(c, f) {
      const b = Math.sin(f.life * 0.006) * 6;
      c.translate(f.x, f.y + b);
      G.ell(c, 0, -10, 40, 12); G.fillO(c, '#b9c4d8', 2.5);
      c.beginPath(); c.arc(0, -14, 26, Math.PI, 0); c.fillStyle = 'rgba(190,240,255,.6)'; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
      G.circ(c, 0, -24, 13); G.fillO(c, '#8ee08a', 2);
      G.circ(c, -5, -26, 3); c.fillStyle = '#2b2440'; c.fill(); G.circ(c, 5, -26, 3); c.fill();
      c.strokeStyle = '#8ee08a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -36); c.lineTo(0, -44); c.stroke(); G.circ(c, 0, -46, 3); c.fillStyle = '#ffd23f'; c.fill();
      for (let i = 0; i < 4; i++) { G.circ(c, -27 + i * 18, -8, 3); c.fillStyle = (f.life / 200 + i) % 2 < 1 ? '#ffd23f' : '#ff6f91'; c.fill(); }
    },
    fairy(c, f) {
      const fl = Math.sin(f.life * 0.04);
      c.translate(f.x, f.y);
      c.fillStyle = 'rgba(255,240,180,.35)'; G.circ(c, 0, -8, 24); c.fill();
      c.fillStyle = 'rgba(200,230,255,.85)'; c.save(); c.scale(1, 0.6 + fl * 0.4); G.ell(c, -10, -16, 10, 14, -0.5); c.fill(); G.ell(c, 10, -16, 10, 14, 0.5); c.fill(); c.restore();
      G.circ(c, 0, -10, 7); c.fillStyle = '#ffe9f4'; c.fill(); G.circ(c, 0, -20, 6); c.fillStyle = '#ffd8a8'; c.fill();
    },
    firefly(c, f) {
      const a = 0.5 + Math.sin(f.life * 0.01 + f.seed) * 0.5;
      c.fillStyle = `rgba(230,255,140,${a})`; G.circ(c, f.x, f.y, 6); c.fill();
      c.fillStyle = `rgba(230,255,140,${a * 0.3})`; G.circ(c, f.x, f.y, 16); c.fill();
    },
    fish(c, f) {
      c.translate(f.x, f.y); c.rotate(f.rot || 0);
      G.ell(c, 0, 0, 16, 9); G.fillO(c, '#ff6b3d', 2); G.poly(c, [-14, 0, -26, -8, -26, 8]); G.fillO(c, '#ff6b3d', 2);
      G.circ(c, 8, -2, 2); c.fillStyle = '#2b2440'; c.fill();
    },
    kitty(c, f) {
      c.translate(f.x, f.y);
      G.ell(c, 0, -16, 18, 14); G.fillO(c, '#ffffff', 2.5);
      G.circ(c, 14, -32, 12); G.fillO(c, '#ffffff', 2.5);
      G.poly(c, [6, -40, 8, -52, 14, -42]); G.fillO(c, '#ffffff', 2); G.poly(c, [16, -42, 22, -52, 24, -38]); G.fillO(c, '#ffffff', 2);
      G.circ(c, 18, -34, 2); c.fillStyle = '#2b2440'; c.fill();
      G.rr(c, -12, -6, 30, 8, 3); c.fillStyle = '#e8424a'; c.fill();
    },
  };
  X.CRIT = CRIT;
  /* いきものを出す：path は [[x,y,ms], ...] */
  X.critter = (kind, path, o = {}) => {
    const total = path.reduce((s, p) => s + (p[2] || 1000), 0);
    const f = Object.assign({ type: 'critter', kind, x: path[0][0], y: path[0][1], life: 0, max: total, seed: Math.random() * 6, draw(c, f) { c.save(); CRIT[kind](c, f); c.restore(); } }, o);
    f.step = (f) => {
      let acc = 0;
      for (let i = 0; i < path.length - 1; i++) {
        const ms = path[i + 1][2] || 1000;
        if (f.life <= acc + ms) {
          const k = PT.easeInOut((f.life - acc) / ms);
          const nx = PT.lerp(path[i][0], path[i + 1][0], k);
          if (Math.abs(nx - f.x) > 0.1) f.dir = nx > f.x ? 1 : -1;
          f.x = nx; f.y = PT.lerp(path[i][1], path[i + 1][1], k);
          if (o.onLeg) o.onLeg(f, i);
          return;
        }
        acc += ms;
      }
    };
    f.max += 50;
    Wd.fx.push(f);
    return f;
  };

  /* かげえ：手のかげが うさぎ・とり・きょうりゅうに */
  X.shadowShow = (x, y, shapes = ['rabbit', 'bird', 'dino'], ms = 6000) => {
    Wd.special({ type: 'shadow', x, y, max: ms, draw(c, f, k) {
      const per = f.max / shapes.length;
      const i = Math.min(shapes.length - 1, Math.floor(f.life / per));
      const kk = (f.life % per) / per;
      const a = kk < 0.15 ? kk / 0.15 : kk > 0.85 ? (1 - kk) / 0.15 : 1;
      c.save(); c.translate(f.x, f.y);
      c.fillStyle = 'rgba(255,240,170,.4)'; G.ell(c, 0, 0, 170, 110); c.fill();
      c.globalAlpha = a; c.fillStyle = 'rgba(30,30,60,.8)';
      const wob = Math.sin(f.life * 0.008) * 6;
      const sh = shapes[i];
      if (sh === 'rabbit') { G.ell(c, 0, 20, 60, 42); c.fill(); G.ell(c, -20, -40 + wob, 13, 46, -0.2); c.fill(); G.ell(c, 20, -42 - wob, 13, 46, 0.2); c.fill(); G.circ(c, 50, 30, 14); c.fill(); }
      if (sh === 'bird') { G.ell(c, 0, 0, 40, 22); c.fill(); c.beginPath(); c.moveTo(-10, 0); c.lineTo(-90, -40 + wob * 3); c.lineTo(-30, 10); c.fill(); c.beginPath(); c.moveTo(10, 0); c.lineTo(90, -40 - wob * 3); c.lineTo(30, 10); c.fill(); G.poly(c, [36, -6, 60, 0, 36, 6]); c.fill(); }
      if (sh === 'dino') { G.ell(c, -10, 20, 60, 36); c.fill(); c.beginPath(); c.moveTo(30, 0); c.quadraticCurveTo(50, -60, 80, -60 + wob); c.quadraticCurveTo(100, -50, 90, -30); c.lineTo(50, 20); c.fill(); G.poly(c, [-70, 20, -120, 40, -60, 40]); c.fill(); for (let j = 0; j < 4; j++) { G.poly(c, [-50 + j * 22, -10, -40 + j * 22, -34, -30 + j * 22, -10]); c.fill(); } }
      if (sh === 'dog') { G.ell(c, 0, 10, 50, 40); c.fill(); G.ell(c, -30, -30, 14, 30, 0.4); c.fill(); G.ell(c, 40, 20, 30, 16); c.fill(); }
      c.restore();
    } });
  };

  X.rainbow = (ms = 7000) => {
    Wd.special({ type: 'rainbow', max: ms, draw(c, f, k) {
      const a = k < 0.15 ? k / 0.15 : k > 0.8 ? (1 - k) / 0.2 : 1;
      c.save(); c.globalAlpha = a * 0.85;
      ['#ff6b6b', '#ffa94d', '#ffd84a', '#69db7c', '#4dabf7', '#9775fa'].forEach((col, i) => {
        c.strokeStyle = col; c.lineWidth = 26; c.beginPath(); c.arc(800, 700, 640 - i * 24, Math.PI, 0); c.stroke();
      });
      c.restore();
    } });
  };

  X.firework = (x, y, col) => {
    PT.audio.sfx('firework');
    const cc = col || PT.pick(['#ff6f91', '#ffd23f', '#7fd0e8', '#b39ae8', '#69db7c']);
    Wd.special({ type: 'fw', x, y, max: 1800, draw(c, f, k) {
      if (f.life < 500) { const kk = f.life / 500; c.fillStyle = '#fff6c0'; G.circ(c, f.x, 900 - (900 - f.y) * kk, 5); c.fill(); return; }
      const kk = (f.life - 500) / 1300;
      c.save(); c.globalAlpha = 1 - kk;
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * PT.TAU, r = 160 * PT.easeOut(kk);
        c.fillStyle = i % 2 ? cc : '#ffffff';
        G.circ(c, f.x + Math.cos(a) * r, f.y + Math.sin(a) * r + kk * 40, 6 * (1 - kk) + 2); c.fill();
      }
      c.restore();
    } });
  };

  X.wave = (y0, onPeak) => {
    PT.audio.sfx('wave');
    let fired = false;
    Wd.special({ type: 'wave', max: 3200, step(f) { if (!fired && f.life > 1300) { fired = true; onPeak && onPeak(); } }, draw(c, f, k) {
      const reach = Math.sin(k * Math.PI) * 170;
      c.save();
      c.fillStyle = 'rgba(120,200,245,.55)';
      c.beginPath(); c.moveTo(-400, y0 - 20);
      for (let x = -400; x <= 2000; x += 50) c.quadraticCurveTo(x + 25, y0 + reach + 16 + Math.sin(x * 0.03) * 8, x + 50, y0 + reach);
      c.lineTo(2000, y0 - 20); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 6; c.stroke();
      c.restore();
    } });
  };

  X.splash = (x, y) => {
    PT.audio.sfx('splash');
    Wd.burst('drop', x, y - 20, 14, { up: true, sp: 0.4, minSp: 0.2, g: 0.0012, max: 900, size: 14 });
    Wd.ring(x, y, 'rgba(255,255,255,.9)', 700, 70);
  };

  X.constellation = (stars, name) => {
    Wd.special({ type: 'const', max: 5200, draw(c, f, k) {
      const n = Math.min(stars.length, Math.floor(f.life / 300) + 1);
      c.save(); c.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1;
      c.strokeStyle = 'rgba(255,250,200,.9)'; c.lineWidth = 4; c.setLineDash([2, 8]); c.lineCap = 'round';
      c.beginPath(); stars.slice(0, n).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      c.setLineDash([]);
      stars.slice(0, n).forEach(([x, y]) => { G.star(c, x, y, 14, 6); c.fillStyle = '#fff6b8'; c.fill(); });
      if (n >= stars.length && name) {
        const cx = stars.reduce((s, p) => s + p[0], 0) / stars.length, cy = stars.reduce((s, p) => s + p[1], 0) / stars.length;
        c.font = `900 38px ${PT.FONT}`; c.textAlign = 'center'; c.lineWidth = 8; c.strokeStyle = 'rgba(40,40,100,.8)'; c.strokeText(name, cx, cy + 60); c.fillStyle = '#fff6b8'; c.fillText(name, cx, cy + 60);
      }
      c.restore();
    } });
  };

  X.beam = (x1, y1, x2, y2, ms = 2500) => {
    Wd.special({ type: 'beam', max: ms, draw(c, f, k) {
      const a = Math.atan2(y2 - y1, x2 - x1), d = Math.hypot(x2 - x1, y2 - y1);
      c.save(); c.translate(x1, y1); c.rotate(a);
      c.fillStyle = G.grad(c, 0, 0, d, 0, [[0, 'rgba(255,245,170,.7)'], [1, 'rgba(255,245,170,.1)']]);
      c.beginPath(); c.moveTo(0, -8); c.lineTo(d, -70); c.lineTo(d, 70); c.lineTo(0, 8); c.closePath(); c.fill();
      c.restore();
    } });
  };

  X.music = (x, y, ms = 3000) => {
    let acc = 0;
    Wd.special({ type: 'notes', max: ms, step(f, dt) { acc += dt; if (acc > 260) { acc = 0; Wd.burst('note', x + PT.rand(-30, 30), y, 1, { up: true, sp: 0.08, minSp: 0.04, g: -0.00002, max: 1500, size: PT.rand(14, 20), col: PT.pick(['#9b6fd6', '#ff6f91', '#4c9be8', '#58c46b']) }); } }, draw() {} });
  };

  X.sparkleRain = (ms = 2500) => {
    let acc = 0;
    Wd.special({ type: 'srain', max: ms, step(f, dt) { acc += dt; if (acc > 60) { acc = 0; Wd.fx.push({ type: 'spark', x: PT.rand(Wd.visLeft, Wd.visRight), y: PT.rand(0, 200), vx: 0, vy: 0.15, life: 0, max: 1600, size: PT.rand(6, 12), col: PT.pick(['#ffd23f', '#ffffff', '#ff8fab', '#7fd0e8']), rot: 0, vr: 0.004, g: 0 }); } }, draw() {} });
  };

  X.confetti = (x = 800, ms = 1600) => {
    PT.audio.sfx('cheer');
    for (let i = 0; i < 70; i++) {
      Wd.fx.push({ type: 'confetti', x: x + PT.rand(-600, 600), y: PT.rand(-60, 60), vx: PT.rand(-0.05, 0.05), vy: PT.rand(0.1, 0.25), life: 0, max: ms + PT.rand(0, 1500), size: PT.rand(10, 18), col: PT.pick(['#ff6f91', '#ffd23f', '#58c46b', '#4c9be8', '#b39ae8', '#ff8a65']), rot: PT.rand(0, 6), vr: PT.rand(-0.01, 0.01), g: 0.00004 });
    }
  };

  X.dig = (x, y) => {
    Wd.burst('smoke', x, y - 10, 6, { sp: 0.1, max: 500, size: 12, col: '#f2d095', g: 0.0004, up: true });
  };
})();
