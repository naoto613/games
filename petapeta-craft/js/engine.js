/* せかいの なかみ：マス目・キャラ・どうぐ・うごき・えがき */
'use strict';
(() => {
  const G = PT.G, T = PT.TILE, COLS = PT.COLS, ROWS = PT.ROWS;
  const WW = COLS * T, WH = ROWS * T;
  const CS = (PT.CS = 0.7);           // キャラと どうぐの おおきさ（2マスくらいの せたけ）
  const GRAV = 0.0028, MAXF = 1.4;
  const BL = PT.BLOCKS;

  const E = (PT.E = {
    grid: new Uint8Array(COLS * ROWS), ents: [], fx: [], t: 0, nextId: 1, world: null,
    cam: { x: 0, y: 0, s: 1 }, view: { w: 800, h: 450, panel: 150, dpr: 1 },
    night: false, nightK: 0, walk: false, anim: new Map(), plants: new Map(), lights: [], shade: new Float32Array(COLS * ROWS),
    dirty: true, doors: new Set(), preview: null, sandAt: 0,
  });
  E.WW = WW; E.WH = WH;

  /* ---------- マス ---------- */
  const inb = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS;
  E.idx = (x, y) => y * COLS + x;
  E.get = (x, y) => (inb(x, y) ? E.grid[y * COLS + x] : 0);
  E.blk = (x, y) => BL[E.get(x, y)] || null;
  const solidXY = (x, y) => { if (x < 0 || x >= COLS || y >= ROWS) return true; if (y < 0) return false; const b = BL[E.grid[y * COLS + x]]; return !!(b && b.solid); };
  E.solidAt = (px, py) => solidXY(Math.floor(px / T), Math.floor(py / T));
  E.blockAtPx = (px, py) => E.blk(Math.floor(px / T), Math.floor(py / T));
  E.cellOf = (px, py) => [Math.floor(px / T), Math.floor(py / T)];

  E.set = (x, y, code, opts = {}) => {
    if (!inb(x, y)) return false;
    const i = y * COLS + x, old = E.grid[i];
    if (old === code) return false;
    E.grid[i] = code;
    if (opts.rec) opts.rec.push([i, old, code]);
    if (code && !opts.quiet) E.anim.set(i, E.t);
    if (BL[code] && BL[code].plant) E.plants.set(i, E.t); else E.plants.delete(i);
    E.dirty = true;
    if (code && BL[code].solid) E.pushOut(x, y);
    return true;
  };

  /* かげ と あかり の けいさん（ブロックが かわったときだけ） */
  const opaque = (b) => b && b.solid && !b.clear && !b.airy;
  E.recalc = () => {
    E.lights = [];
    for (let x = 0; x < COLS; x++) {
      let run = 0, gap = 99;
      for (let y = 0; y < ROWS; y++) {
        const i = y * COLS + x, b = BL[E.grid[i]];
        if (b && b.light) E.lights.push([x, y, b.light]);
        if (opaque(b)) { E.shade[i] = Math.min(0.5, run * 0.09); run++; gap = 0; continue; }
        run = 0; gap++;
        let floor = false;
        if (gap <= 6) for (let k = 1; k <= 6 && y + k < ROWS; k++) if (opaque(BL[E.grid[i + k * COLS]])) { floor = true; break; }
        E.shade[i] = floor ? 0.12 : 0;
      }
    }
    // ブロックの あかりの ちかくは かげを うすく
    for (const [lx, ly, r] of E.lights) {
      const rr = Math.ceil(r / T);
      for (let y = ly - rr; y <= ly + rr; y++) for (let x = lx - rr; x <= lx + rr; x++) if (inb(x, y)) { const d = Math.hypot(x - lx, y - ly) / rr; if (d < 1) E.shade[y * COLS + x] *= d; }
    }
    E.dirty = false;
  };

  /* ---------- キャラ・どうぐ ---------- */
  E.addChar = (cid, x, y, opts = {}) => {
    const def = PT.CHARS[cid]; if (!def) return null;
    const ch = { kind: 'char', id: E.nextId++, cid, def, x, y, z: 0, vx: 0, vy: 0, flip: Math.random() < 0.5, look: 0, pose: 'idle', poseT: 0, poseUntil: 0, face: 'happy', faceUntil: 0,
      wear: Object.assign({}, opts.wear || {}), holdType: opts.hold || null, seed: Math.random() * 10, scale: CS, bubble: null, ground: false, walkUntil: 0, restUntil: 0, sitOn: null, born: E.t };
    ch.H = (172 + (def.legExt || 0)) * CS * (def.size || 1);
    ch.hw = 20;
    E.ents.push(ch);
    return ch;
  };
  E.addProp = (type, x, y, opts = {}) => {
    const def = PT.ITEMS[type]; if (!def) return null;
    const p = Object.assign({ kind: 'prop', id: E.nextId++, type, def, x, y, z: 0, vx: 0, vy: 0, scale: CS, seed: Math.random() * 6, born: E.t, ground: false }, opts);
    p.hw = Math.max(14, Math.min(def.w * CS * 0.4, 60)); p.H = Math.max(30, def.h * CS * 0.8);
    E.ents.push(p);
    return p;
  };
  E.remove = (e) => { E.ents = E.ents.filter((o) => o !== e); E.ents.forEach((o) => { if (o.sitOn === e) { o.sitOn = null; o.pose = 'idle'; o.face = 'happy'; } }); };
  E.chars = () => E.ents.filter((e) => e.kind === 'char');
  E.props = () => E.ents.filter((e) => e.kind === 'prop');

  /* ブロックに うまったら うえに だす */
  const embedded = (e) => {
    const c0 = Math.floor((e.x - e.hw + 2) / T), c1 = Math.floor((e.x + e.hw - 2) / T);
    const r0 = Math.floor((e.y - Math.min(e.H, T * 1.5)) / T), r1 = Math.floor((e.y - 1) / T);
    for (let r = r1; r >= r0; r--) for (let c = c0; c <= c1; c++) if (solidXY(c, r)) return r;
    return null;
  };
  E.pushOut = () => {
    for (const e of E.ents) {
      if (e.held) continue;
      let n = 0, r;
      while ((r = embedded(e)) !== null && n++ < ROWS) { e.y = r * T; e.vy = 0; }
    }
  };

  /* ---------- うごき ---------- */
  const step = (e, dt) => {
    if (e.held) return;
    if (e.sitOn) {
      const s = e.sitOn; e.x = s.x + (s.seatX || 0); e.y = s.y - (s.seatY || 0); e.vy = 0; return;
    }
    const mid = E.blockAtPx(e.x, e.y - e.H * 0.45);
    const feet = E.blockAtPx(e.x, e.y - 4);
    const inWater = !!(mid && mid.liquid) || !!(feet && feet.liquid && e.kind === 'prop');
    const onLadder = e.kind === 'char' && ((mid && mid.climb) || (feet && feet.climb));
    e.inWater = inWater;
    if (e.def.float && e.kind === 'prop') { e.vy = 0; return; }
    if (onLadder && !e.climbing && e.vy >= 0 && !E.solidAt(e.x, e.y + 1)) { e.vy = 0; e.onLadder = true; }
    else e.onLadder = false;
    if (e.climbing) e.vy = -0.11;
    else if (inWater) { e.vy += (e.kind === 'char' ? -0.0012 : -0.0016) * dt; e.vy *= 0.92; e.vy = PT.clamp(e.vy, -0.22, 0.22); }
    else if (!e.onLadder) e.vy = Math.min(MAXF, e.vy + GRAV * dt);

    // たて
    let ny = e.y + e.vy * dt;
    const cl = e.x - e.hw + 3, cr = e.x + e.hw - 3;
    e.ground = false;
    if (e.vy >= 0) {
      const r = Math.floor(ny / T);
      const ladTop = (px) => { const b = E.blockAtPx(px, ny); return !!(b && b.climb && !e.climbing && !(E.blockAtPx(px, ny - T) || {}).climb); };
      if (r * T >= e.y - 0.5 && (E.solidAt(cl, ny) || E.solidAt(cr, ny) || ladTop(e.x))) {
        const land = E.blockAtPx(e.x, ny + 1) || E.blockAtPx(cl, ny + 1) || E.blockAtPx(cr, ny + 1);
        const v = e.vy;
        ny = r * T; e.vy = 0; e.ground = true;
        if (land && land.bounce && v > 0.25) { e.vy = land.id === 'slime' ? -1.15 : -1.45; e.ground = false; E.emit('bounce', e, land); E.puff(e.x, ny, 6, '#ffffff'); }
        else if (v > 0.5) { E.puff(e.x, ny, 5, 'rgba(255,255,255,.9)'); if (e.kind === 'char') { e.pose = 'idle'; e.squash = E.t; } }
        if (land && land.note && v > 0.15) E.emit('note', Math.floor(e.x / T), r, e);
      }
    } else {
      const head = ny - e.H;
      const r = Math.floor(head / T);
      if ((E.solidAt(cl, head) || E.solidAt(cr, head)) && (r + 1) * T <= e.y - e.H + 0.5) { ny = (r + 1) * T + e.H; e.vy = 0; e.climbing = false; }
    }
    e.y = ny;
    if (e.y > WH + 200) { e.y = 0; e.vy = 0; }
    if (inWater && e.kind === 'char' && !e.wasWater) { E.splash(e.x, e.y - e.H * 0.4); E.emit('swim', e); }
    e.wasWater = inWater;

    // よこ（おさんぽ）
    if (e.kind === 'char' && e.vx) {
      const dir = Math.sign(e.vx);
      let nx = e.x + e.vx * dt;
      const fx = nx + dir * e.hw;
      const footR = Math.floor((e.y - 1) / T), headR = Math.floor((e.y - e.H + 4) / T);
      let blocked = false, stepUp = false;
      for (let r = headR; r <= footR; r++) if (E.solidAt(fx, r * T + 1)) { if (r === footR) stepUp = true; else blocked = true; }
      if (stepUp && !blocked) {
        // 1だんなら ぴょんと のぼる
        const top = footR * T;
        const headR2 = Math.floor((top - e.H + 4) / T);
        let room = true; for (let r = headR2; r < footR; r++) if (E.solidAt(fx, r * T + 1) || E.solidAt(e.x, r * T + 1)) room = false;
        if (room && e.ground) { e.y = top; e.hop = E.t; } else blocked = true;
      }
      if (nx - e.hw < 0 || nx + e.hw > WW) blocked = true;
      if (!blocked && e.ground && !e.inWater) {
        // ふかい がけは こわいので ひきかえす
        let drop = 0; const cx = Math.floor(fx / T); let r = Math.floor(e.y / T);
        while (drop < 5 && !solidXY(cx, r) && !(E.blk(cx, r) || {}).liquid) { drop++; r++; }
        if (drop >= 5) blocked = true;
      }
      if (blocked) { e.vx = -e.vx; e.flip = e.vx < 0; }
      else e.x = nx;
    }
  };

  /* おさんぽの きもち */
  const brain = (ch, dt) => {
    if (ch.held || ch.sitOn) return;
    if (ch.poseUntil && E.t > ch.poseUntil) { ch.poseUntil = 0; ch.pose = 'idle'; }
    if (ch.faceUntil && E.t > ch.faceUntil) { ch.faceUntil = 0; ch.face = 'happy'; }
    if (ch.climbing) {
      const mid = E.blockAtPx(ch.x, ch.y - 2);
      if (!mid || !mid.climb) { ch.climbing = false; ch.vy = 0; ch.walkUntil = E.t + 1500; ch.vx = (ch.flip ? -1 : 1) * 0.07; }
      ch.pose = 'walk'; ch.poseT += dt;
      return;
    }
    if (!E.walk) { if (ch.vx) { ch.vx = 0; if (ch.pose === 'walk') ch.pose = 'idle'; } return; }
    if (ch.inWater) { ch.pose = 'swim'; ch.poseT += dt; }
    if (E.t < ch.restUntil) return;
    if (!ch.vx) {
      if (E.t > ch.walkUntil) { const d = Math.random() < 0.5 ? -1 : 1; ch.vx = d * PT.rand(0.06, 0.085); ch.flip = d < 0; ch.walkUntil = E.t + PT.rand(2200, 5200); ch.pose = 'walk'; }
    } else {
      ch.pose = ch.inWater ? 'swim' : 'walk'; ch.poseT += dt;
      // はしごを みつけたら のぼってみる
      const here = E.blockAtPx(ch.x, ch.y - 10);
      if (here && here.climb && !ch.triedLadder && Math.random() < 0.7) { ch.climbing = true; ch.vx = 0; ch.x = (Math.floor(ch.x / T) + 0.5) * T; ch.triedLadder = true; return; }
      if (!here || !here.climb) ch.triedLadder = false;
      if (E.t > ch.walkUntil) { ch.vx = 0; ch.pose = 'idle'; ch.restUntil = E.t + PT.rand(1200, 3200); ch.walkUntil = 0; }
    }
  };

  /* ---------- たね・すな ---------- */
  const growPlants = () => {
    for (const [i, t0] of E.plants) {
      if (E.t - t0 < 8000) { continue; }
      const x = i % COLS, y = (i / COLS) | 0;
      E.plants.delete(i);
      const below = E.blk(x, y + 1);
      let room = true; for (let yy = y - 5; yy <= y; yy++) for (let xx = x - 2; xx <= x + 2; xx++) if (yy !== y || xx !== x) { const b = E.blk(xx, yy); if (b && (b.solid || b.liquid)) room = false; }
      E.grid[i] = 0;
      if (below && /grass|dirt|snow|cake/.test(below.id) && room && Math.random() < 0.65) PT.stampInto(E.grid, Math.random() < 0.3 ? 'bigtree' : 'tree', x, y, (j) => E.anim.set(j, E.t + Math.random() * 300));
      else { E.grid[i] = PT.BLOCK[Math.random() < 0.8 ? 'flower' : 'mushroom'].code; E.anim.set(i, E.t); }
      E.dirty = true; E.pushOut();
      E.sparkle(x * T + T / 2, y * T, 10);
      E.emit('grow', x, y);
    }
  };
  const sandFall = () => {
    for (let y = ROWS - 2; y >= 0; y--) for (let x = 0; x < COLS; x++) {
      const i = y * COLS + x, b = BL[E.grid[i]];
      if (!b || !b.fall) continue;
      const j = i + COLS, under = BL[E.grid[j]];
      if (!under || under.liquid || under.deco) { const sc = E.grid[i]; E.grid[i] = under && under.liquid ? E.grid[j] : 0; E.grid[j] = sc; E.dirty = true; E.pushOut(); }
    }
  };

  /* ---------- えんしゅつ（つぶつぶ） ---------- */
  E.burst = (x, y, n, o = {}) => {
    for (let i = 0; i < n; i++) {
      const a = o.a !== undefined ? o.a + PT.rand(-0.5, 0.5) : Math.random() * PT.TAU, sp = PT.rand(0.4, 1) * (o.sp || 0.3);
      E.fx.push({ k: o.k || 'dot', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0), g: o.g ?? 0.0012, life: 0, max: PT.rand(0.7, 1.2) * (o.max || 700), col: Array.isArray(o.col) ? PT.pick(o.col) : o.col || '#ffffff', s: PT.rand(0.7, 1.3) * (o.s || 6), rot: Math.random() * 6, vr: PT.rand(-0.01, 0.01) });
    }
  };
  E.chunks = (x, y, b) => { const c = b ? b.col : '#999'; E.burst(x, y, 9, { k: 'chunk', col: [c, PT.shade(c, -0.2), PT.shade(c, 0.25)], sp: 0.35, up: 0.25, s: 8, max: 800 }); };
  E.puff = (x, y, n = 6, col = 'rgba(255,255,255,.9)') => E.burst(x, y, n, { k: 'puff', col, sp: 0.12, g: -0.0001, s: 12, max: 500 });
  E.sparkle = (x, y, n = 8) => E.burst(x, y, n, { k: 'star', col: ['#ffe066', '#ffffff', '#ff9fbd', '#9fd8ff'], sp: 0.25, g: 0.0002, s: 9, max: 900 });
  E.hearts = (x, y, n = 5) => E.burst(x, y, n, { k: 'heart', col: ['#ff5d78', '#ff8fb1'], sp: 0.08, g: -0.00015, s: 10, max: 1300, a: -Math.PI / 2 });
  E.notes = (x, y, n = 3) => E.burst(x, y, n, { k: 'note', col: ['#9b6fd6', '#ff6f91', '#3b7dd8', '#3fb36b'], sp: 0.1, g: -0.0002, s: 14, max: 1300, a: -Math.PI / 2 });
  E.splash = (x, y) => E.burst(x, y, 12, { k: 'dot', col: ['#9fd8ff', '#ffffff', '#5fb8ef'], sp: 0.35, up: 0.3, s: 5, max: 700 });
  E.zz = (x, y) => E.fx.push({ k: 'zz', x, y, vx: 0.02, vy: -0.03, g: 0, life: 0, max: 1800, col: '#7f8fd8', s: 18, rot: 0, vr: 0 });
  E.rocket = (x, y) => {
    E.fx.push({ k: 'rocket', x, y, vx: PT.rand(-0.05, 0.05), vy: -0.9, g: 0.0006, life: 0, max: 900, col: PT.pick(['#ff5d78', '#ffd23f', '#58b9f0', '#7bd36a', '#c38be0']), s: 6, rot: 0, vr: 0 });
  };
  const updFx = (dt) => {
    const out = [];
    for (const f of E.fx) {
      f.life += dt; f.vy += f.g * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt;
      if (f.k === 'rocket' && f.life > f.max) { E.burst(f.x, f.y, 34, { k: 'spark', col: [f.col, '#ffffff', PT.shade(f.col, 0.3)], sp: 0.42, g: 0.00035, s: 5, max: 1300 }); PT.audio.sfx('firework'); continue; }
      if (f.k === 'chunk' && E.solidAt(f.x, f.y + 3) && f.vy > 0) { f.vy *= -0.3; f.vx *= 0.6; }
      if (f.life < f.max) out.push(f);
    }
    E.fx = out;
  };

  /* ---------- イベント ---------- */
  const H = {};
  E.on = (n, f) => { (H[n] = H[n] || []).push(f); };
  E.emit = (n, ...a) => { (H[n] || []).forEach((f) => f(...a)); };

  /* ---------- まいフレーム ---------- */
  E.update = (dt) => {
    dt = Math.min(dt, 50);
    E.t += dt;
    E.nightK += ((E.night ? 1 : 0) - E.nightK) * Math.min(1, dt * 0.003);
    for (const e of E.ents) { if (e.kind === 'char') brain(e, dt); step(e, dt); if (e.bubble && E.t > e.bubble.until) e.bubble = null; }
    // ドアは だれかが ちかくに いると ひらく
    E.doors.clear();
    for (const ch of E.chars()) { const c0 = Math.floor((ch.x - 34) / T), c1 = Math.floor((ch.x + 34) / T), r0 = Math.floor((ch.y - ch.H) / T), r1 = Math.floor((ch.y - 1) / T); for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) { const b = E.blk(c, r); if (b && b.door) E.doors.add(r * COLS + c); } }
    if (E.plants.size) growPlants();
    if (E.t > E.sandAt) { E.sandAt = E.t + 90; sandFall(); }
    updFx(dt);
    if (E.dirty) E.recalc();
  };

  /* ---------- えがく ---------- */
  const hash = (x, y) => { let h = x * 374761393 + y * 668265263; h = (h ^ (h >>> 13)) * 1274126177; return (h ^ (h >>> 16)) >>> 0; };
  const variant = (b, x, y) => {
    if (b.id === 'grass' || b.id === 'snow') { const a = BL[E.get(x, y - 1)]; return a && a.solid && !a.clear ? 'in' : 'top'; }
    if (b.id === 'water') { const a = BL[E.get(x, y - 1)]; return a && (a.liquid || a.solid) ? 'in' : 'top'; }
    if (b.door) { const below = BL[E.get(x, y + 1)]; const top = below && below.door; const open = E.doors.has(y * COLS + x) || E.doors.has((top ? y + 1 : y - 1) * COLS + x); return (open ? 'open-' : '') + (top ? 'top' : 'bottom'); }
    if (b.plant) { const t0 = E.plants.get(y * COLS + x); const k = t0 === undefined ? 0 : E.t - t0; return k > 5000 ? 2 : k > 2500 ? 1 : 0; }
    const h = hash(x, y);
    if (b.id === 'leaves') { const m = h % 11; return m === 0 ? 2 : m === 1 ? 1 : 0; }
    return h % 3;
  };

  /* はいけい（そら・やま） */
  const bgCache = { key: '', cv: null };
  const mixC = (a, b, k) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const r = (pa >> 16) + ((pb >> 16) - (pa >> 16)) * k, g = ((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * k, bb = (pa & 255) + ((pb & 255) - (pa & 255)) * k; return `rgb(${r | 0},${g | 0},${bb | 0})`; };
  const drawBg = (c, W, Hh) => {
    const wd = E.world, k = E.nightK;
    const g = c.createLinearGradient(0, 0, 0, Hh);
    g.addColorStop(0, mixC(wd.sky[0], '#1b2456', k)); g.addColorStop(1, mixC(wd.sky[1], '#4a3f86', k));
    c.fillStyle = g; c.fillRect(0, 0, W, Hh);
    const s = E.cam.s;
    // ほし
    if (k > 0.02) {
      const r = PT.seeded(7);
      for (let i = 0; i < 90; i++) { const x = ((r() * W * 1.5 - E.cam.x * s * 0.05) % W + W) % W, y = r() * Hh * 0.7, tw = 0.5 + 0.5 * Math.sin(E.t * 0.003 + i); c.fillStyle = `rgba(255,255,230,${k * tw})`; G.star(c, x, y, 2 + r() * 3, 1); c.fill(); }
    }
    // おひさま／おつきさま
    const sx = W * 0.82, sy = Hh * 0.16;
    c.save(); c.globalAlpha = 1 - k; c.fillStyle = 'rgba(255,240,160,.35)'; G.circ(c, sx, sy, 70); c.fill(); G.circ(c, sx, sy, 42); c.fillStyle = '#ffe066'; c.fill(); c.restore();
    if (k > 0.02) { c.save(); c.globalAlpha = k; c.fillStyle = 'rgba(255,250,220,.25)'; G.circ(c, sx, sy, 60); c.fill(); G.circ(c, sx, sy, 36); c.fillStyle = '#fff6c8'; c.fill(); G.circ(c, sx + 14, sy - 8, 30); c.fillStyle = mixC(wd.sky[0], '#1b2456', k); c.fill(); c.restore(); }
    // くも
    const r2 = PT.seeded(3);
    c.fillStyle = `rgba(255,255,255,${0.85 - k * 0.6})`;
    for (let i = 0; i < 7; i++) {
      const span = W + 400; const x = ((r2() * span - E.cam.x * s * 0.15 + E.t * 0.006 * (0.5 + r2())) % span + span) % span - 200, y = Hh * (0.08 + r2() * 0.3), w = 60 + r2() * 70;
      G.ell(c, x, y, w, w * 0.32); c.fill(); G.circ(c, x - w * 0.3, y - w * 0.18, w * 0.32); c.fill(); G.circ(c, x + w * 0.15, y - w * 0.28, w * 0.4); c.fill();
    }
    // とおくの けしき
    const base = (WH * 0.62 - E.cam.y) * s;
    const layer = (par, col, amp, fr, off) => {
      c.fillStyle = mixC(col, '#2c2f63', k * 0.75); c.beginPath(); c.moveTo(0, Hh);
      for (let x = 0; x <= W + 20; x += 20) { const wx = x + E.cam.x * s * par; c.lineTo(x, base + off * s - Math.sin(wx * fr) * amp * s - Math.sin(wx * fr * 2.3 + 1) * amp * 0.4 * s); }
      c.lineTo(W, Hh); c.closePath(); c.fill();
    };
    if (wd.deco === 'hills' || wd.deco === 'candy') { layer(0.25, wd.hills[0], 70, 0.004, -180); layer(0.45, wd.hills[1], 50, 0.006, -80); }
    if (wd.deco === 'candy') {
      const r3 = PT.seeded(5);
      for (let i = 0; i < 8; i++) { const x = ((i * 260 + 80 - E.cam.x * s * 0.35) % (W + 300) + W + 300) % (W + 300) - 150, y = base - 120 * s - r3() * 60 * s; c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 140 * s); c.stroke(); G.circ(c, x, y, 34 * s); c.fillStyle = ['#ff8fb1', '#9fd8ff', '#ffe066', '#c9b2ff'][i % 4]; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 5 * s; c.beginPath(); c.arc(x, y, 20 * s, 0, 4.5); c.stroke(); }
    }
    if (wd.deco === 'mountain') {
      c.fillStyle = mixC('#c9dcf2', '#2c2f63', k * 0.75);
      for (let i = -1; i < 6; i++) { const x = i * 420 - ((E.cam.x * s * 0.2) % 420); c.beginPath(); c.moveTo(x - 260, base + 40 * s); c.lineTo(x, base - 300 * s); c.lineTo(x + 260, base + 40 * s); c.fill(); }
      c.fillStyle = `rgba(255,255,255,${1 - k * 0.5})`;
      for (let i = -1; i < 6; i++) { const x = i * 420 - ((E.cam.x * s * 0.2) % 420); c.beginPath(); c.moveTo(x - 80, base - 208 * s); c.lineTo(x, base - 300 * s); c.lineTo(x + 80, base - 208 * s); c.lineTo(x + 30, base - 190 * s); c.lineTo(x, base - 214 * s); c.lineTo(x - 30, base - 190 * s); c.fill(); }
      layer(0.4, wd.hills[1], 40, 0.006, -60);
    }
    if (wd.deco === 'sea') { layer(0.25, wd.hills[0], 50, 0.005, -140); c.fillStyle = mixC('#58b9f0', '#22305e', k * 0.8); c.fillRect(0, base - 30 * s, W, Hh); c.fillStyle = 'rgba(255,255,255,.4)'; for (let i = 0; i < 20; i++) { const x = ((i * 137 - E.cam.x * s * 0.3 + E.t * 0.01) % W + W) % W; G.ell(c, x, base - 10 * s + (i % 4) * 22 * s, 18 * s, 2.5 * s); c.fill(); } }
    if (wd.deco === 'clouds') { c.fillStyle = `rgba(255,255,255,${0.7 - k * 0.4})`; for (let i = 0; i < 10; i++) { const x = ((i * 220 - E.cam.x * s * 0.3) % (W + 300) + W + 300) % (W + 300) - 150; G.ell(c, x, base + 60 * s, 160 * s, 50 * s); c.fill(); } }
  };

  let nightCv = null;
  E.render = (c) => {
    const { w: W, h: Hh, dpr } = E.view, cam = E.cam, s = cam.s;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    PT.SHADE = false; drawBg(c, W, Hh); PT.SHADE = true;
    c.setTransform(dpr * s, 0, 0, dpr * s, -cam.x * s * dpr, -cam.y * s * dpr);
    const x0 = Math.max(0, Math.floor(cam.x / T)), x1 = Math.min(COLS - 1, Math.floor((cam.x + W / s) / T));
    const y0 = Math.max(0, Math.floor(cam.y / T)), y1 = Math.min(ROWS - 1, Math.floor((cam.y + Hh / s) / T));
    const px = Math.max(8, Math.round(T * s * dpr));
    const later = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const code = E.grid[y * COLS + x]; if (!code) continue;
      const b = BL[code];
      if (b.liquid) { later.push([x, y, b]); continue; }
      if (b.solid && !b.clear && !b.bounce && b.id !== 'cloud' && b.id !== 'pumpkin') { c.fillStyle = PT.shade(b.col, -0.32); c.fillRect(x * T, y * T, T, T); }
      const img = PT.tileImg(b, variant(b, x, y), px);
      const a0 = E.anim.get(y * COLS + x);
      if (a0 !== undefined) {
        const k = (E.t - a0) / 240;
        if (k >= 1) E.anim.delete(y * COLS + x);
        else if (k > 0) { const sc = PT.easeBack(Math.max(0.01, k)); c.save(); c.translate(x * T + T / 2, y * T + T); c.scale(sc, sc); c.drawImage(img, -T / 2, -T, T, T); c.restore(); continue; }
        else continue;
      }
      c.drawImage(img, x * T, y * T, T, T);
    }
    // かげ（ちかや おうちの なか）
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const a = E.shade[y * COLS + x]; if (a > 0.01) { c.fillStyle = `rgba(40,30,80,${a})`; c.fillRect(x * T, y * T, T, T); } }
    // どうぐ → キャラ（したに いる じゅん）
    const list = E.ents.slice().sort((a, b) => (a.kind === b.kind ? a.y - b.y : a.kind === 'prop' ? -1 : 1));
    for (const e of list) drawEnt(c, e);
    // みず は まえに（およいで いるように みえる）
    for (const [x, y, b] of later) c.drawImage(PT.tileImg(b, variant(b, x, y), px), x * T, y * T, T, T);
    if (E.preview) drawPreview(c, E.preview);
    drawFx(c);
    for (const e of E.ents) if (e.kind === 'char' && e.bubble) drawBubble(c, e);
    // よる
    if (E.nightK > 0.02) drawNight(c, W, Hh, dpr);
    c.setTransform(1, 0, 0, 1, 0, 0);
  };

  function drawEnt(c, e) {
    if (e.held) { c.save(); c.globalAlpha = 0.95; }
    const s = e.scale;
    if (e.ground && !e.sitOn) G.shadow(c, e.x, e.y + 1, (e.kind === 'char' ? 30 : Math.min(e.hw, 50)) * (e.kind === 'char' ? s * 1.4 : 1), 0.16);
    if (e.kind === 'char') {
      const sq = e.squash && E.t - e.squash < 220 ? Math.sin(((E.t - e.squash) / 220) * Math.PI) * 0.12 : 0;
      const hop = e.hop && E.t - e.hop < 200 ? Math.sin(((E.t - e.hop) / 200) * Math.PI) * 10 : 0;
      e.z = hop;
      if (sq) { c.save(); c.translate(e.x, e.y); c.scale(1 + sq, 1 - sq); c.translate(-e.x, -e.y); }
      PT.drawChar(c, e, E.t);
      if (sq) c.restore();
    } else {
      c.save(); c.translate(e.x, e.y);
      const pop = E.t - e.born < 260 ? PT.easeBack((E.t - e.born) / 260) : 1;
      c.scale(s * pop, s * pop);
      if (e.wobble && E.t < e.wobble) c.rotate(Math.sin(E.t * 0.03) * 0.1);
      try { e.def.draw(c, E.t, e); } catch (err) { /* えが かけなくても あそべる */ }
      c.restore();
    }
    if (e.held) c.restore();
  }
  function drawBubble(c, ch) {
    const b = ch.bubble; const k = Math.min(1, (E.t - b.t0) / 180);
    const x = ch.x, y = ch.y - ch.H - 18;
    c.save(); c.translate(x, y); c.scale(PT.easeBack(k), PT.easeBack(k));
    c.font = `900 26px ${PT.FONT}`; const w = Math.max(60, c.measureText(b.txt).width + 34), h = 46;
    G.rr(c, -w / 2, -h, w, h, 22); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#d6e6f8'; c.lineWidth = 3; c.stroke();
    c.beginPath(); c.moveTo(-10, -2); c.lineTo(0, 12); c.lineTo(10, -2); c.closePath(); c.fillStyle = '#fff'; c.fill();
    c.fillStyle = '#1f3f77'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(b.txt, 0, -h / 2 + 1);
    c.restore();
  }
  function drawFx(c) {
    for (const f of E.fx) {
      const a = 1 - f.life / f.max;
      c.save(); c.globalAlpha = Math.max(0, Math.min(1, a * 1.6)); c.translate(f.x, f.y); c.rotate(f.rot);
      switch (f.k) {
        case 'chunk': c.fillStyle = f.col; c.fillRect(-f.s / 2, -f.s / 2, f.s, f.s); c.strokeStyle = 'rgba(40,30,60,.35)'; c.lineWidth = 1.5; c.strokeRect(-f.s / 2, -f.s / 2, f.s, f.s); break;
        case 'puff': c.fillStyle = f.col; G.circ(c, 0, 0, f.s * (0.6 + f.life / f.max)); c.fill(); break;
        case 'star': c.fillStyle = f.col; G.star(c, 0, 0, f.s, f.s * 0.45); c.fill(); break;
        case 'heart': c.fillStyle = f.col; G.heart(c, 0, 0, f.s); c.fill(); break;
        case 'note': c.rotate(-f.rot); G.note(c, 0, 0, f.s, f.col); break;
        case 'zz': c.rotate(-f.rot); c.fillStyle = f.col; c.font = `900 ${f.s + f.life * 0.006}px ${PT.FONT}`; c.fillText('Z', 0, 0); break;
        case 'rocket': c.fillStyle = f.col; G.circ(c, 0, 0, 6); c.fill(); c.fillStyle = 'rgba(255,230,150,.6)'; G.circ(c, 0, 14, 4); c.fill(); break;
        case 'spark': c.fillStyle = f.col; G.circ(c, 0, 0, f.s * a + 1); c.fill(); break;
        default: c.fillStyle = f.col; G.circ(c, 0, 0, f.s * 0.6); c.fill();
      }
      c.restore();
    }
  }
  function drawPreview(c, p) {
    c.save(); c.globalAlpha = 0.55;
    if (p.stamp) {
      const st = PT.STAMPS[p.stamp]; const x0 = p.x - (st.w >> 1), y0 = p.y - st.h + 1;
      st.rows.forEach((row, y) => [...row].forEach((ch, x) => { const code = PT.stampCell(ch); if (code <= 0) return; const b = BL[code]; c.drawImage(PT.tileImg(b, b.variants ? b.variants[0] : 0, 64), (x0 + x) * T, (y0 + y) * T, T, T); }));
      c.globalAlpha = 1; c.strokeStyle = '#ffffff'; c.setLineDash([12, 8]); c.lineWidth = 4; c.strokeRect(x0 * T, y0 * T, st.w * T, st.h * T);
    } else { c.globalAlpha = 1; c.strokeStyle = p.col || '#ffffff'; c.lineWidth = 5; c.setLineDash([10, 7]); c.strokeRect(p.x * T + 3, p.y * T + 3, T - 6, T - 6); }
    c.restore();
  }
  function drawNight(c, W, Hh, dpr) {
    const cam = E.cam, s = cam.s;
    if (!nightCv) nightCv = document.createElement('canvas');
    const cw = Math.ceil(W / 2), ch = Math.ceil(Hh / 2);
    if (nightCv.width !== cw || nightCv.height !== ch) { nightCv.width = cw; nightCv.height = ch; }
    const n = nightCv.getContext('2d');
    n.setTransform(1, 0, 0, 1, 0, 0); n.globalCompositeOperation = 'source-over'; n.clearRect(0, 0, cw, ch);
    n.fillStyle = `rgba(16,20,64,${0.58 * E.nightK})`; n.fillRect(0, 0, cw, ch);
    n.globalCompositeOperation = 'destination-out';
    const hole = (wx, wy, r, a = 1) => { const x = (wx - cam.x) * s / 2, y = (wy - cam.y) * s / 2, rr = (r * s) / 2; if (x < -rr || y < -rr || x > cw + rr || y > ch + rr) return; const g = n.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); n.fillStyle = g; n.fillRect(x - rr, y - rr, rr * 2, rr * 2); };
    for (const [x, y, r] of E.lights) hole(x * T + T / 2, y * T + T / 2, r + 60);
    for (const f of E.fx) if (f.k === 'spark' || f.k === 'rocket') hole(f.x, f.y, 70, 0.5);
    for (const e of E.ents) if (e.kind === 'char') hole(e.x, e.y - e.H * 0.5, 110, 0.45);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(nightCv, 0, 0, W * dpr, Hh * dpr);
    // あったかい ひかり
    c.setTransform(dpr * s, 0, 0, dpr * s, -cam.x * s * dpr, -cam.y * s * dpr);
    c.globalCompositeOperation = 'lighter';
    for (const [x, y, r] of E.lights) { const cx = x * T + T / 2, cy = y * T + T / 2; const g = c.createRadialGradient(cx, cy, 0, cx, cy, r * 0.8); g.addColorStop(0, `rgba(255,200,90,${0.32 * E.nightK})`); g.addColorStop(1, 'rgba(255,200,90,0)'); c.fillStyle = g; c.fillRect(cx - r, cy - r, r * 2, r * 2); }
    c.globalCompositeOperation = 'source-over';
  }

  /* ---------- カメラ ---------- */
  E.clampCam = () => {
    const { w, h, panel } = E.view, s = E.cam.s;
    const vw = w / s, vh = (h - panel) / s;
    E.cam.x = vw >= WW ? (WW - vw) / 2 : PT.clamp(E.cam.x, 0, WW - vw);
    const top = -Math.max(0, 80 / s);
    E.cam.y = vh >= WH ? WH - vh : PT.clamp(E.cam.y, top, WH - vh);
  };
  E.toWorld = (sx, sy) => ({ x: E.cam.x + sx / E.cam.s, y: E.cam.y + sy / E.cam.s });
  E.toScreen = (wx, wy) => ({ x: (wx - E.cam.x) * E.cam.s, y: (wy - E.cam.y) * E.cam.s });

  /* ---------- あたり ---------- */
  E.hitEnt = (wx, wy, pad = 10) => {
    let best = null;
    for (const e of E.ents) {
      const top = e.y - e.H - pad, l = e.x - Math.max(e.hw, e.kind === 'char' ? 34 : e.hw) - pad, r = e.x + Math.max(e.hw, e.kind === 'char' ? 34 : e.hw) + pad;
      if (wx >= l && wx <= r && wy >= top && wy <= e.y + pad) { if (!best || (e.kind === 'char' && best.kind !== 'char') || (e.kind === best.kind && e.y > best.y)) best = e; }
    }
    return best;
  };

  /* ---------- セーブ用 ---------- */
  E.serialize = () => {
    let s = ''; for (let i = 0; i < E.grid.length; i++) s += String.fromCharCode(48 + E.grid[i]);
    return {
      g: s, night: E.night, cam: { x: E.cam.x | 0, y: E.cam.y | 0 },
      ents: E.ents.map((e) => (e.kind === 'char' ? { k: 'c', cid: e.cid, x: e.x | 0, y: e.y | 0, wear: e.wear, hold: e.holdType, sit: e.sitOn ? E.ents.indexOf(e.sitOn) : -1 } : { k: 'p', type: e.type, x: e.x | 0, y: e.y | 0 })),
    };
  };
  E.load = (world, data) => {
    E.world = world; E.ents = []; E.fx = []; E.anim.clear(); E.plants.clear(); E.t = 0;
    if (data && data.g && data.g.length === COLS * ROWS) { for (let i = 0; i < data.g.length; i++) { const v = data.g.charCodeAt(i) - 48; E.grid[i] = BL[v] ? v : 0; } }
    else E.grid.set(world.gen());
    for (let i = 0; i < E.grid.length; i++) if (BL[E.grid[i]] && BL[E.grid[i]].plant) E.plants.set(i, -4000);
    E.night = !!(data && data.night); E.nightK = E.night ? 1 : 0;
    if (data && data.ents) {
      const made = data.ents.map((d) => (d.k === 'c' ? E.addChar(d.cid, d.x, d.y, { wear: d.wear, hold: d.hold }) : E.addProp(d.type, d.x, d.y)));
      data.ents.forEach((d, i) => { if (d.k === 'c' && d.sit >= 0 && made[d.sit] && made[i]) E.sit(made[i], made[d.sit], true); });
      E.ents = E.ents.filter(Boolean);
    } else {
      world.chars.forEach(([cid, x]) => { const y = PT.surfRow(E.grid, x) * T; E.addChar(cid, x * T + T / 2, y); });
    }
    E.dirty = true; E.recalc(); E.pushOut();
    if (data && data.cam) { E.cam.x = data.cam.x; E.cam.y = data.cam.y; }
    else { const c0 = E.chars()[0]; E.cam.x = (c0 ? c0.x : WW / 2) - E.view.w / E.cam.s / 2; E.cam.y = (c0 ? c0.y : WH / 2) - (E.view.h - E.view.panel) / E.cam.s * 0.7; }
    E.clampCam();
  };

  /* すわる・ねる */
  E.sit = (ch, p, quiet) => {
    const d = p.def; ch.sitOn = p; ch.vx = 0; ch.climbing = false;
    ch.seatX = 0;
    if (d.sleep) { ch.pose = 'sleep'; ch.face = 'sleep'; p.seatX = 10 * CS; p.seatY = 40 * CS; }
    else { ch.pose = 'sit'; p.seatX = 0; p.seatY = (d.seatY || Math.min(d.h * 0.45, 60)) * CS; }
    if (!quiet) { ch.faceUntil = 0; ch.poseUntil = 0; }
  };
  E.unsit = (ch) => { if (!ch.sitOn) return; ch.sitOn = null; ch.pose = 'idle'; ch.face = 'happy'; };
})();
