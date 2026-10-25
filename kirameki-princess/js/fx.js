// えんしゅつ エンジン：ただよう ひかりの つぶ・かみふぶき・がめんゆれ・フラッシュ
(function () {
  const KP = (window.KP = window.KP || {});
  const cv = document.createElement('canvas');
  cv.id = 'ambient';
  const g = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  let mode = 'sparkle';
  let parts = [];
  const bursts = [];
  const PAST = ['#FFB8D6', '#C9B5F5', '#9EDDC8', '#9DBDF4', '#FFD772', '#FFFFFF'];
  const CONF = ['#FF8FB8', '#FFD772', '#9DCDF4', '#9EDC9A', '#C9B5F5', '#FF9A6A', '#FFFFFF'];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const rand3 = () => ['#FFFFFF', '#FFE07A', '#FFB8D6'][(Math.random() * 3) | 0];
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
  }
  addEventListener('resize', resize);
  resize();
  function spawn(m, init) {
    const p = { m, x: rnd(0, W), y: init ? rnd(0, H) : H + 30, t: rnd(0, 6.28), life: 1 };
    if (m === 'bokeh') Object.assign(p, { r: rnd(6, 26), vy: -rnd(6, 16), c: PAST[(Math.random() * PAST.length) | 0], a: rnd(0.1, 0.3) });
    if (m === 'twinkle') Object.assign(p, { y: init ? rnd(0, H) : rnd(0, H), r: rnd(4, 9), vy: -rnd(1, 4), c: rand3(), a: 0, sp: rnd(1.2, 2.6) });
    if (m === 'petal') Object.assign(p, { y: init ? rnd(0, H) : -20, r: rnd(5, 9), vy: rnd(20, 40), vx: rnd(-14, 8), rot: rnd(0, 6.28), vr: rnd(-2, 2), c: Math.random() < 0.6 ? '#FFC2D8' : '#FFFFFF', a: rnd(0.5, 0.9) });
    if (m === 'bubble') Object.assign(p, { r: rnd(5, 16), vy: -rnd(18, 34), c: '#BFE3FF', a: rnd(0.35, 0.7) });
    if (m === 'star') Object.assign(p, { y: rnd(0, H * 0.75), r: rnd(1, 2.6), c: Math.random() < 0.3 ? '#FFE59A' : '#FFFFFF', a: 0, sp: rnd(0.8, 2.4), vy: 0 });
    return p;
  }
  const MIX = {
    sparkle: { bokeh: 16, twinkle: 12 },
    soft: { bokeh: 10, twinkle: 6 },
    night: { star: 60, twinkle: 10, bokeh: 4 },
    petals: { petal: 18, twinkle: 6 },
    bubbles: { bubble: 14, twinkle: 6 },
    stage: { bokeh: 22, twinkle: 18 },
    none: {},
  };
  function setMode(m) {
    if (!MIX[m]) m = 'sparkle';
    mode = m;
    parts = [];
    for (const k in MIX[m]) for (let i = 0; i < MIX[m][k]; i++) parts.push(spawn(k, true));
  }
  function sparkle4(x, y, r) {
    g.beginPath();
    g.moveTo(x, y - r);
    g.quadraticCurveTo(x + r * 0.22, y - r * 0.22, x + r, y);
    g.quadraticCurveTo(x + r * 0.22, y + r * 0.22, x, y + r);
    g.quadraticCurveTo(x - r * 0.22, y + r * 0.22, x - r, y);
    g.quadraticCurveTo(x - r * 0.22, y - r * 0.22, x, y - r);
    g.fill();
  }
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.t += dt;
      if (p.m === 'bokeh') {
        p.y += p.vy * dt; p.x += Math.sin(p.t * 0.6) * 8 * dt;
        if (p.y < -40) parts[i] = spawn('bokeh');
        const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        gr.addColorStop(0, p.c); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.globalAlpha = p.a; g.fillStyle = gr;
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.29); g.fill();
      } else if (p.m === 'twinkle') {
        p.y += p.vy * dt;
        p.a = Math.max(0, Math.sin(p.t * p.sp)) * 0.85;
        if (p.y < -20 || (p.a < 0.01 && Math.random() < 0.02)) parts[i] = spawn('twinkle');
        g.globalAlpha = p.a; g.fillStyle = p.c; g.shadowColor = p.c; g.shadowBlur = 8; sparkle4(p.x, p.y, p.r); g.shadowBlur = 0;
      } else if (p.m === 'star') {
        p.a = 0.35 + Math.max(0, Math.sin(p.t * p.sp)) * 0.6;
        g.globalAlpha = p.a; g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.29); g.fill();
      } else if (p.m === 'petal') {
        p.y += p.vy * dt; p.x += (p.vx + Math.sin(p.t) * 20) * dt; p.rot += p.vr * dt;
        if (p.y > H + 20) parts[i] = spawn('petal');
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.scale(1, Math.abs(Math.sin(p.t * 2)) * 0.6 + 0.4);
        g.globalAlpha = p.a; g.fillStyle = p.c;
        g.beginPath(); g.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, 6.29); g.fill(); g.restore();
      } else if (p.m === 'bubble') {
        p.y += p.vy * dt; p.x += Math.sin(p.t * 1.4) * 14 * dt;
        if (p.y < -30) parts[i] = spawn('bubble');
        g.globalAlpha = p.a; g.strokeStyle = p.c; g.lineWidth = 2;
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.29); g.stroke();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.22, 0, 6.29); g.fill();
      }
    }
    // かみふぶき
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.vy += 520 * dt; b.vx *= 0.99; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt; b.life -= dt * 0.45;
      if (b.life <= 0 || b.y > H + 30) { bursts.splice(i, 1); continue; }
      g.save(); g.translate(b.x, b.y); g.rotate(b.rot); g.scale(1, Math.cos(b.rot * 2.3));
      g.globalAlpha = Math.min(1, b.life * 2); g.fillStyle = b.c;
      if (b.shape) { g.beginPath(); g.arc(0, 0, b.s * 0.6, 0, 6.29); g.fill(); } else g.fillRect(-b.s / 2, -b.s * 0.3, b.s, b.s * 0.6);
      g.restore();
    }
    g.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  setMode('sparkle');

  KP.fx = {
    canvas: cv,
    attach(app) { if (cv.parentNode !== app) app.appendChild(cv); },
    mode: (m) => { if (m !== mode) setMode(m); },
    confetti(x = W / 2, y = H * 0.35, n = 90, power = 1) {
      for (let i = 0; i < n; i++) {
        const a = rnd(-Math.PI, 0), sp = rnd(240, 620) * power;
        bursts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, rot: rnd(0, 6.28), vr: rnd(-12, 12), s: rnd(7, 13), c: CONF[(Math.random() * CONF.length) | 0], life: 1, shape: Math.random() < 0.25 });
      }
    },
    shake(el, power = 8) {
      const t = el || document.getElementById('app');
      t.animate([0, 1, 2, 3, 4, 5, 6].map((i) => ({ transform: i === 6 ? 'none' : `translate(${rnd(-power, power)}px, ${rnd(-power, power)}px)` })), { duration: 380, easing: 'ease-out' });
    },
    flash(color = '#fff', ms = 450) {
      const f = document.createElement('div');
      f.className = 'fx-flash';
      f.style.background = color;
      document.body.appendChild(f);
      f.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: ms, easing: 'ease-out' }).onfinish = () => f.remove();
    },
    // ことばを おおきく ばーん
    banner(text, cls = '') {
      const b = document.createElement('div');
      b.className = 'fx-banner ' + cls;
      b.textContent = text;
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 1600);
    },
  };
})();
