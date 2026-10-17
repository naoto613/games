/* ワールド：エンティティ・行動キュー・演出・描画 */
'use strict';
(() => {
  const G = PT.G;
  const Wd = (PT.world = {
    stage: null, ents: [], fx: [], bubbles: [], timers: [], t: 0, nextId: 1,
    bg: null, scale: 1, ox: 0, oy: 0, visTop: 0, visBottom: PT.H, visLeft: 0, visRight: PT.W,
    maxProps: 30, dragGhost: null, hover: null, dimmed: 0, shake: 0,
  });

  /* ---------- 基本 ---------- */
  Wd.after = (ms, fn) => { Wd.timers.push({ at: Wd.t + ms, fn }); };
  Wd.chars = () => Wd.ents.filter((e) => e.kind === 'char');
  Wd.props = () => Wd.ents.filter((e) => e.kind === 'prop');
  Wd.fixes = () => Wd.ents.filter((e) => e.kind === 'fix');
  Wd.byId = (id) => Wd.ents.find((e) => e.id === id);
  Wd.charOf = (cid) => Wd.ents.find((e) => e.kind === 'char' && e.cid === cid);
  Wd.floor = () => Wd.stage.floor;
  Wd.depthScale = (y) => {
    const [a, b] = Wd.stage.floor;
    return PT.lerp(0.8, 1.08, PT.clamp((y - a) / (b - a), 0, 1));
  };
  Wd.clampFloor = (x, y, margin = 40) => {
    const [a, b] = Wd.stage.floor;
    const bottom = Math.min(b, Wd.visBottom - 14);
    return {
      x: PT.clamp(x, Math.max(margin, Wd.visLeft + margin), Math.min(PT.W - margin, Wd.visRight - margin)),
      y: PT.clamp(y, a + 6, Math.max(a + 10, bottom)),
    };
  };
  Wd.randFloor = (margin = 120) => {
    const [a] = Wd.stage.floor;
    const bottom = Math.min(Wd.stage.floor[1], Wd.visBottom - 20);
    return { x: PT.rand(Math.max(margin, Wd.visLeft + margin), Math.min(PT.W - margin, Wd.visRight - margin)), y: PT.rand(a + 30, Math.max(a + 40, bottom)) };
  };
  Wd.inView = (x) => x > Wd.visLeft + 20 && x < Wd.visRight - 20;

  /* ---------- 生成 ---------- */
  Wd.addChar = (cid, x, y, opts = {}) => {
    if (Wd.charOf(cid)) return Wd.charOf(cid);
    const ch = {
      kind: 'char', id: Wd.nextId++, cid, def: PT.CHARS[cid], x, y, z: 0, flip: Math.random() < 0.5, look: 0,
      pose: 'idle', poseT: 0, face: 'happy', faceUntil: 0, wear: Object.assign({}, opts.wear || {}), holdType: null,
      queue: [], cur: null, lockUntil: 0, bubble: null, seed: Math.random() * 10, idleAt: Wd.t + PT.rand(1500, 4000),
      taps: 0, lastTap: 0, scale: Wd.depthScale(y), rest: 'idle', role: opts.role || null, spawnT: Wd.t,
    };
    if (ch.wear) { for (const k in ch.wear) { const it = Object.values(PT.ITEMS).find((i) => i.wear && i.wear[0] === k && i.wear[1] === ch.wear[k]); if (it && it.role) ch.role = it.role; } }
    Wd.ents.push(ch);
    return ch;
  };
  Wd.addProp = (type, x, y, opts = {}) => {
    const def = PT.ITEMS[type];
    if (!def) return null;
    const p = Object.assign({ kind: 'prop', id: Wd.nextId++, type, def, x, y, z: 0, scale: Wd.depthScale(y), bornT: Wd.t, seed: Math.random() * 6, vx: 0, vy: 0 }, opts);
    if (type === 'balloon' && !p.color) p.color = PT.pick(['#ff5d78', '#58b9f0', '#ffd23f', '#9b6fd6', '#58c46b']);
    Wd.ents.push(p);
    // 置きすぎたら一番古いものを片付ける
    const props = Wd.props().filter((q) => !q.keep);
    if (props.length > Wd.maxProps) {
      const old = props.sort((a, b) => a.bornT - b.bornT)[0];
      if (old && old !== p) { Wd.poof(old.x, old.y - 30); Wd.remove(old); }
    }
    return p;
  };
  Wd.addFix = (type, x, y, opts = {}) => {
    const def = PT.FIX[type];
    const f = Object.assign({ kind: 'fix', id: Wd.nextId++, type, def, x, y, w: def.w, h: def.h, tags: def.tags || [] }, opts);
    Wd.ents.push(f);
    return f;
  };
  Wd.remove = (e) => {
    const i = Wd.ents.indexOf(e);
    if (i >= 0) Wd.ents.splice(i, 1);
    e.removed = true;
  };

  /* ---------- タグ ---------- */
  Wd.tags = (e) => (e.kind === 'prop' ? e.def.tags : e.kind === 'fix' ? e.tags : ['char', e.cid]);
  Wd.has = (e, tag) => Wd.tags(e).includes(tag);

  /* ---------- 当たり判定 ---------- */
  Wd.bounds = (e) => {
    if (e.kind === 'char') {
      const s = e.scale * e.def.size;
      const ex = (e.def.legExt || 0) + (e.def.hover || 0); return { x: e.x - 50 * s, y: e.y - e.z - (180 + ex) * s, w: 100 * s, h: (185 + ex) * s };
    }
    if (e.kind === 'prop') {
      const s = e.scale * (e.big || 1);
      const w = Math.max(70, e.bw || e.def.w) * s, h = Math.max(60, e.bh || e.def.h) * s;
      return { x: e.x - w / 2, y: e.y - e.z - h, w, h };
    }
    if (e.type === 'skystar') return { x: e.x - 40, y: e.y - 40, w: 80, h: 80 };
    if (e.def.area) return { x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h + 20 };
    return { x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h };
  };
  const inB = (b, x, y, pad = 0) => x >= b.x - pad && x <= b.x + b.w + pad && y >= b.y - pad && y <= b.y + b.h + pad;
  /* 指定点にいるもの（手前優先） */
  Wd.pick = (x, y, { kinds = ['char', 'prop', 'fix'], exclude = null, pad = 0 } = {}) => {
    const list = Wd.drawList().slice().reverse();
    for (const e of list) {
      if (e === exclude || !kinds.includes(e.kind) || e.hidden || e.heldBy) continue;
      if (e.kind === 'fix' && e.def.deco) continue;
      if (inB(Wd.bounds(e), x, y, e.kind === 'char' ? pad + 6 : pad)) return e;
    }
    return null;
  };
  Wd.areaAt = (x, y) => {
    for (const f of Wd.fixes()) {
      if (!f.def.area) continue;
      const b = Wd.bounds(f);
      if (inB(b, x, y)) return { tag: f.def.area, fix: f };
    }
    return null;
  };
  Wd.near = (x, y, r, pred) => Wd.ents.filter((e) => !e.removed && !e.heldBy && pred(e) && Math.hypot(e.x - x, e.y - y) < r).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));

  /* ---------- 行動キュー ---------- */
  class Act {
    constructor(ch) { this.ch = ch; }
    push(a) { this.ch.queue.push(a); return this; }
    go(x, y, run = false) { return this.push({ t: 'go', x, y, run }); }
    to(e, dx = 0, dy = 0, run = false) { return this.push({ t: 'go', ent: e, dx, dy, run }); }
    pose(p, ms = 1000) { return this.push({ t: 'pose', p, ms }); }
    say(txt, icon, ms = 1900, voice = 'talk') { return this.push({ t: 'say', txt, icon, ms, voice }); }
    face(f, ms = 0) { return this.push({ t: 'face', f, ms }); }
    wait(ms) { return this.push({ t: 'wait', ms }); }
    do(fn) { return this.push({ t: 'do', fn }); }
    jump(h = 60, ms = 520) { return this.push({ t: 'jump', h, ms }); }
    hop(n = 2) { for (let i = 0; i < n; i++) this.jump(40, 380); return this; }
    look(x) { return this.push({ t: 'look', x }); }
    rest(p) { return this.push({ t: 'do', fn: () => { this.ch.rest = p; } }); }
    hold(type) { return this.push({ t: 'do', fn: () => { this.ch.holdType = type; } }); }
    unhold() { return this.push({ t: 'do', fn: () => { this.ch.holdType = null; } }); }
    sfx(n) { return this.push({ t: 'do', fn: () => PT.audio.sfx(n) }); }
  }
  Wd.act = (ch) => new Act(ch);
  Wd.claim = (ch, ms = 4000) => {
    ch.queue = []; ch.cur = null; ch.lockUntil = Wd.t + ms; ch.rest = ch.riding ? ch.rest : 'idle';
    if (!ch.riding) ch.z = 0;
    ch.hidden = false;
    return new Act(ch);
  };
  Wd.isFree = (ch) => !ch.removed && Wd.t > ch.lockUntil && !ch.dragging;
  Wd.say = (ch, txt, icon, ms = 1900, voice = 'talk') => {
    ch.bubble = { txt, icon, until: Wd.t + ms, t0: Wd.t };
    if (voice) PT.audio.voice(ch.def.voice, voice, Math.min(4, Math.ceil((txt || '').length / 3)));
  };
  Wd.setFace = (ch, f, ms = 1500) => { ch.face = f; ch.faceUntil = ms ? Wd.t + ms : 0; };

  function stepChar(ch, dt) {
    if (ch.faceUntil && Wd.t > ch.faceUntil) { ch.face = 'happy'; ch.faceUntil = 0; }
    if (ch.bubble && Wd.t > ch.bubble.until) ch.bubble = null;
    if (ch.dragging || ch.inTween) { ch.poseT += dt; return; }
    let a = ch.cur;
    if (!a && ch.queue.length) { a = ch.cur = ch.queue.shift(); a.start = Wd.t; }
    if (!a) {
      if (ch.pose !== ch.rest) { ch.pose = ch.rest; ch.poseT = 0; }
      ch.poseT += dt;
      // 重力で地面へ
      if (ch.z > 0 && !ch.riding && !ch.float) ch.z = Math.max(0, ch.z - dt * 0.6);
      return;
    }
    const done = () => { ch.cur = null; };
    switch (a.t) {
      case 'go': {
        let tx = a.x, ty = a.y;
        if (a.ent) { tx = a.ent.x + (a.dx || 0); ty = a.ent.y + (a.dy || 0); }
        const p = a.free ? { x: tx, y: ty } : Wd.clampFloor(tx, ty, 30);
        const dx = p.x - ch.x, dy = p.y - ch.y;
        const d = Math.hypot(dx, dy);
        const sp = (a.run ? 0.42 : 0.24) * dt * (Wd.stage.lowGravity ? 0.8 : 1);
        const want = ch.riding ? ch.rest : a.run ? 'run' : 'walk';
        if (ch.pose !== want) { ch.pose = want; ch.poseT = 0; }
        ch.poseT += dt;
        if (Math.abs(dx) > 2) ch.flip = dx < 0;
        if (d <= sp || Wd.t - a.start > 6000) { ch.x = p.x; ch.y = p.y; done(); }
        else { ch.x += (dx / d) * sp; ch.y += (dy / d) * sp; }
        ch.scale = Wd.depthScale(ch.y);
        break;
      }
      case 'pose':
        if (Wd.t === a.start || ch.pose !== a.p) { ch.pose = a.p; ch.poseT = 0; }
        ch.poseT += dt;
        if (Wd.t - a.start >= a.ms) done();
        break;
      case 'jump': {
        const k = (Wd.t - a.start) / a.ms;
        if (ch.pose !== 'jump') { ch.pose = 'jump'; ch.poseT = 0; }
        ch.poseT += dt;
        const g = Wd.stage.lowGravity ? 2.2 : 1;
        ch.z = (ch.baseZ || 0) + Math.sin(Math.min(1, k) * Math.PI) * a.h * g;
        if (k >= 1) { ch.z = ch.baseZ || 0; done(); }
        break;
      }
      case 'wait':
        ch.poseT += dt;
        if (['walk', 'run', 'jump'].includes(ch.pose)) { ch.pose = ch.rest; ch.poseT = 0; }
        if (Wd.t - a.start >= a.ms) done();
        break;
      case 'say': Wd.say(ch, a.txt, a.icon, a.ms, a.voice); done(); break;
      case 'face': Wd.setFace(ch, a.f, a.ms); done(); break;
      case 'look': ch.flip = a.x < ch.x; done(); break;
      case 'do': done(); try { a.fn(ch); } catch (e) { console.error(e); } break;
      default: done();
    }
  }

  /* ---------- 演出 ---------- */
  Wd.burst = (type, x, y, n = 8, o = {}) => {
    for (let i = 0; i < n; i++) {
      const a = o.up ? -Math.PI / 2 + PT.rand(-0.9, 0.9) : PT.rand(0, PT.TAU);
      const sp = PT.rand(o.minSp || 0.05, o.sp || 0.25);
      Wd.fx.push({ type, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.lift || 0), life: 0, max: o.max || PT.rand(700, 1300), size: o.size || PT.rand(10, 18), col: o.col || PT.pick(['#ff6f91', '#ffd23f', '#58c46b', '#4c9be8', '#b39ae8', '#ff8a65']), rot: PT.rand(0, 6), vr: PT.rand(-0.01, 0.01), g: o.g ?? 0.0003 });
    }
  };
  Wd.poof = (x, y) => { Wd.burst('smoke', x, y, 8, { sp: 0.12, max: 600, size: 22, col: '#ffffff', g: 0 }); };
  Wd.ring = (x, y, col = '#ffd23f', max = 700, size = 80) => Wd.fx.push({ type: 'ring', x, y, life: 0, max, size, col });
  Wd.bigText = (txt, x, y, col = '#ff6f61') => Wd.fx.push({ type: 'text', txt, x, y, life: 0, max: 1300, col, vy: -0.04, vx: 0, size: 44, g: 0 });
  Wd.special = (o) => { Wd.fx.push(Object.assign({ life: 0, max: 4000 }, o)); };
  Wd.addBubbles = (x, y, n = 14) => {
    for (let i = 0; i < n; i++) Wd.bubbles.push({ x: x + PT.rand(-60, 60), y: y - PT.rand(40, 160), r: PT.rand(14, 30), vx: PT.rand(-0.05, 0.05), vy: PT.rand(-0.06, -0.02), life: 0, max: PT.rand(7000, 11000), ph: Math.random() * 6 });
  };
  Wd.popBubble = (b) => {
    const i = Wd.bubbles.indexOf(b); if (i < 0) return;
    Wd.bubbles.splice(i, 1);
    Wd.burst('spark', b.x, b.y, 6, { sp: 0.15, max: 400, size: 6, col: '#bfe9ff', g: 0 });
    PT.audio.sfx('bubble');
  };

  function stepFx(dt) {
    for (const f of Wd.fx) {
      f.life += dt;
      if (f.vx !== undefined) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += (f.g || 0) * dt; }
      if (f.rot !== undefined) f.rot += (f.vr || 0) * dt;
      if (f.step) f.step(f, dt);
    }
    Wd.fx = Wd.fx.filter((f) => f.life < f.max);
    for (const b of Wd.bubbles) {
      b.life += dt; b.x += b.vx * dt + Math.sin(Wd.t * 0.002 + b.ph) * 0.15; b.y += b.vy * dt;
      if (b.y < Wd.visTop + 30) b.vy = Math.abs(b.vy) * 0.5;
    }
    Wd.bubbles = Wd.bubbles.filter((b) => b.life < b.max);
    // キャラがシャボン玉に触れたら割れる
    for (const ch of Wd.chars()) {
      for (const b of Wd.bubbles.slice()) {
        const hy = ch.y - ch.z - 120 * ch.scale;
        if (Math.hypot(b.x - ch.x, b.y - hy) < b.r + 50 * ch.scale && b.life > 600) Wd.popBubble(b);
      }
    }
  }

  function drawFx(c) {
    for (const f of Wd.fx) {
      const k = f.life / f.max;
      const a = k < 0.15 ? k / 0.15 : 1 - Math.max(0, (k - 0.6) / 0.4);
      c.save();
      c.globalAlpha = PT.clamp(a, 0, 1);
      switch (f.type) {
        case 'heart': G.heart(c, f.x, f.y, f.size); c.fillStyle = '#ff6f91'; c.fill(); break;
        case 'star': G.star(c, f.x, f.y, f.size, f.size * 0.45, 5, f.rot); c.fillStyle = f.col === '#ffffff' ? '#ffd23f' : f.col; c.fill(); break;
        case 'spark': G.star(c, f.x, f.y, f.size, f.size * 0.35, 4, f.rot); c.fillStyle = f.col; c.fill(); break;
        case 'note': G.note(c, f.x, f.y, f.size, f.col); break;
        case 'confetti': c.translate(f.x, f.y); c.rotate(f.rot); c.fillStyle = f.col; c.fillRect(-f.size / 2, -f.size / 4, f.size, f.size / 2); break;
        case 'smoke': G.circ(c, f.x, f.y, f.size * (0.6 + k)); c.fillStyle = f.col; c.fill(); break;
        case 'drop': G.ell(c, f.x, f.y, f.size * 0.4, f.size * 0.6); c.fillStyle = '#7fd0f8'; c.fill(); break;
        case 'zzz': c.fillStyle = '#7a8fb8'; c.font = `bold ${f.size}px ${PT.FONT}`; c.fillText('Z', f.x, f.y); break;
        case 'leaf': c.translate(f.x, f.y); c.rotate(f.rot); G.ell(c, 0, 0, f.size * 0.6, f.size * 0.3); c.fillStyle = f.col; c.fill(); break;
        case 'ring': c.strokeStyle = f.col; c.lineWidth = 6 * (1 - k); G.circ(c, f.x, f.y, f.size * PT.easeOut(k)); c.stroke(); break;
        case 'text': {
          const s = k < 0.2 ? PT.easeBack(k / 0.2) : 1;
          c.translate(f.x, f.y); c.scale(s, s);
          c.font = `900 ${f.size}px ${PT.FONT}`; c.textAlign = 'center'; c.lineJoin = 'round';
          c.strokeStyle = '#ffffff'; c.lineWidth = 10; c.strokeText(f.txt, 0, 0);
          c.fillStyle = f.col; c.fillText(f.txt, 0, 0);
          break;
        }
        default: if (f.draw) f.draw(c, f, k); break;
      }
      c.restore();
    }
    for (const b of Wd.bubbles) {
      const k = b.life / b.max;
      c.save(); c.globalAlpha = k > 0.85 ? (1 - k) / 0.15 : 1;
      G.circ(c, b.x, b.y, b.r);
      c.fillStyle = G.rgrad(c, b.x - b.r * 0.3, b.y - b.r * 0.3, 1, b.r, [[0, 'rgba(255,255,255,.7)'], [0.6, 'rgba(190,230,255,.25)'], [1, 'rgba(255,180,240,.45)']]);
      c.fill(); c.strokeStyle = 'rgba(150,200,255,.8)'; c.lineWidth = 2; c.stroke();
      G.ell(c, b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.25, b.r * 0.14, -0.6); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill();
      c.restore();
    }
  }

  /* ---------- ふきだし ---------- */
  const ICONS = {
    '!': (c, x, y) => { c.fillStyle = '#ff6f61'; c.font = `900 30px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('!', x, y + 11); },
    '?': (c, x, y) => { c.fillStyle = '#4c9be8'; c.font = `900 30px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('?', x, y + 11); },
    note: (c, x, y) => G.note(c, x - 4, y + 8, 18, '#9b6fd6'),
    heart: (c, x, y) => { G.heart(c, x, y + 4, 14); c.fillStyle = '#ff6f91'; c.fill(); },
    star: (c, x, y) => { G.star(c, x, y, 14, 6); c.fillStyle = '#ffc93c'; c.fill(); },
    zzz: (c, x, y) => { c.fillStyle = '#7a8fb8'; c.font = `900 22px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('Zz', x, y + 8); },
    sweat: (c, x, y) => { G.ell(c, x, y, 7, 10); c.fillStyle = '#7fd0f8'; c.fill(); },
  };
  function drawBubble(c, ch) {
    const b = ch.bubble; if (!b) return;
    const s = Math.min(1.15, ch.scale * 1.05);
    const k = Math.min(1, (Wd.t - b.t0) / 160);
    const hx = ch.x, hy = ch.y - ch.z - (205 + (ch.wear.hat ? 40 : 0) + (ch.def.legExt || 0) + (ch.def.hover || 0)) * ch.scale * ch.def.size;
    c.save();
    c.translate(hx, hy); c.scale(s * PT.easeBack(k), s * PT.easeBack(k));
    c.font = `800 26px ${PT.FONT}`;
    const tw = b.txt ? c.measureText(b.txt).width : 0;
    const iconW = b.icon ? (PT.ITEMS[b.icon] ? 46 : 34) : 0;
    const w = Math.max(54, tw + iconW + 30), h = 52;
    const bx = -w / 2, by = -h - 14;
    c.shadowColor = 'rgba(40,60,110,.18)'; c.shadowBlur = 8; c.shadowOffsetY = 3;
    G.rr(c, bx, by, w, h, 24); c.fillStyle = '#ffffff'; c.fill();
    c.shadowColor = 'transparent';
    c.beginPath(); c.moveTo(-10, by + h - 1); c.lineTo(0, by + h + 14); c.lineTo(10, by + h - 1); c.closePath(); c.fill();
    c.strokeStyle = '#cfe0f5'; c.lineWidth = 2.5; G.rr(c, bx, by, w, h, 24); c.stroke();
    let x = bx + 16;
    if (b.icon) {
      if (PT.ITEMS[b.icon]) {
        c.save(); const it = PT.ITEMS[b.icon]; const kk = 36 / Math.max(it.w, it.h); c.translate(x + 18, by + h / 2 + 18 * (it.h * kk / 36)); c.scale(kk, kk); it.draw(c, Wd.t, {}); c.restore();
      } else if (PT.CHARS[b.icon]) {
        const ic = PT.iconCache.char(b.icon); c.drawImage(ic, x - 2, by + 6, 40, 40);
      } else if (ICONS[b.icon]) ICONS[b.icon](c, x + 14, by + h / 2);
      x += iconW;
    }
    if (b.txt) { c.fillStyle = '#2b3a67'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(b.txt, x, by + h / 2 + 1); }
    c.restore();
  }

  /* ---------- 描画 ---------- */
  Wd.drawList = () => {
    const list = Wd.ents.filter((e) => !(e.kind === 'fix' && (e.def.area || e.def.sky || e.def.wall)) && !(e.kind === 'prop' && (e.def.float || e.z > 160)));
    list.sort((a, b) => (a.y + (a.sortBias || 0)) - (b.y + (b.sortBias || 0)));
    const under = Wd.ents.filter((e) => e.kind === 'fix' && (e.def.area || e.def.sky || e.def.wall));
    const over = Wd.ents.filter((e) => e.kind === 'prop' && (e.def.float || e.z > 160));
    return under.concat(list, over);
  };

  function drawEnt(c, e) {
    if (e.hidden) return;
    if (e.kind === 'char') {
      if (e.heldBy) return;
      if (!e.riding || e.shadowAlways) { G.shadow(c, e.x, e.y + 2, 42 * e.scale * e.def.size, 0.16 * Math.max(0.3, 1 - e.z / 200)); }
      if (e.glow) { c.save(); c.shadowColor = '#ffe066'; c.shadowBlur = 26; PT.drawChar(c, e, Wd.t); c.restore(); }
      else PT.drawChar(c, e, Wd.t);
      return;
    }
    if (e.kind === 'prop') {
      if (e.heldBy) return;
      const s = e.scale * (e.big || 1);
      if (!e.def.float && e.z < 40 && e.mode !== 'fort') G.shadow(c, e.x, e.y + 2, Math.min(e.def.w, 160) * 0.42 * s, 0.14);
      c.save();
      c.translate(e.x, e.y - e.z);
      if (e.wobbleUntil && Wd.t < e.wobbleUntil) c.rotate(Math.sin(Wd.t * 0.03) * 0.12);
      if (e.pop) { const k = Math.min(1, (Wd.t - e.pop) / 260); c.scale(PT.easeBack(k), PT.easeBack(k)); }
      c.scale(s, s);
      if (e.glow) { c.shadowColor = '#ffe066'; c.shadowBlur = 24; }
      e.def.draw(c, Wd.t, e);
      c.restore();
      return;
    }
    if (e.def.hidden) return;
    c.save(); c.translate(e.x, e.y);
    if (e.glow) { c.shadowColor = '#ffe066'; c.shadowBlur = 22; }
    if (e.wobbleUntil && Wd.t < e.wobbleUntil) c.rotate(Math.sin(Wd.t * 0.04) * 0.03);
    e.def.draw(c, Wd.t, e);
    c.restore();
  }

  Wd.render = (c, cw, ch) => {
    const st = Wd.stage;
    c.save();
    c.fillStyle = '#e9f4ff'; c.fillRect(0, 0, cw, ch);
    const sh = Wd.shake > Wd.t ? Math.sin(Wd.t * 0.08) * 6 : 0;
    c.translate(Wd.ox + sh, Wd.oy);
    c.scale(Wd.scale, Wd.scale);
    if (Wd.bg) c.drawImage(Wd.bg, 0, 0, PT.W, PT.H);
    // 背景の外側（画面がワイドなとき）は端の色を伸ばす
    if (Wd.bg && Wd.visLeft < 0) { c.drawImage(Wd.bg, 0, 0, 2, Wd.bg.height, Wd.visLeft - 2, 0, -Wd.visLeft + 2, PT.H); }
    if (Wd.bg && Wd.visRight > PT.W) { c.drawImage(Wd.bg, Wd.bg.width - 2, 0, 2, Wd.bg.height, PT.W, 0, Wd.visRight - PT.W + 2, PT.H); }
    if (st.ambient) st.ambient(c, Wd.t);
    // 夜空の星（タップできる）
    for (const f of Wd.fixes()) {
      if (f.type === 'skystar') {
        const tw = 0.6 + Math.sin(Wd.t * 0.003 + f.x) * 0.4;
        c.save(); c.globalAlpha = f.lit && Wd.t < f.lit ? 1 : 0.55 + tw * 0.4;
        G.star(c, f.x, f.y, f.lit && Wd.t < f.lit ? 16 : 9, f.lit && Wd.t < f.lit ? 7 : 4); c.fillStyle = '#fff6b8'; c.fill();
        c.restore();
      }
    }
    // 配置可能範囲（ドラッグ中だけ）
    if (Wd.dragGhost) {
      const [a] = st.floor;
      const bottom = Math.min(st.floor[1], Wd.visBottom - 14);
      c.save(); c.globalAlpha = 0.16 + Math.sin(Wd.t * 0.006) * 0.05;
      c.fillStyle = '#ffffff';
      G.rr(c, Math.max(20, Wd.visLeft + 20), a, Math.min(PT.W - 40, Wd.visRight - Wd.visLeft - 40), bottom - a + 10, 30); c.fill();
      c.restore();
    }
    const list = Wd.drawList();
    for (const e of list) if (e.type !== 'skystar') drawEnt(c, e);
    // 夜の暗さ（懐中電灯の明かり）
    if (st.night && Wd.dark) {
      c.save(); c.fillStyle = 'rgba(15,20,60,.35)'; c.fillRect(-400, 0, PT.W + 800, PT.H); c.restore();
    }
    drawFx(c);
    for (const e of list) if (e.kind === 'char' && !e.hidden && e.bubble) drawBubble(c, e);
    // ドロップ先の影とハイライト
    if (Wd.dragGhost && Wd.dragGhost.drop) {
      const d = Wd.dragGhost.drop;
      c.save(); c.globalAlpha = 0.55;
      G.ell(c, d.x, d.y + 2, 46, 13); c.fillStyle = 'rgba(60,110,200,.45)'; c.fill();
      c.restore();
    }
    c.restore();
  };

  /* ---------- 進行 ---------- */
  Wd.update = (dt) => {
    dt = Math.min(dt, 50);
    Wd.t += dt;
    const due = Wd.timers.filter((tm) => tm.at <= Wd.t);
    if (due.length) { Wd.timers = Wd.timers.filter((tm) => tm.at > Wd.t); due.forEach((tm) => { try { tm.fn(); } catch (e) { console.error(e); } }); }
    for (const e of Wd.ents.slice()) {
      if (e.kind === 'char') stepChar(e, dt);
      else if (e.kind === 'prop') stepProp(e, dt);
    }
    // 重なりを少しずらす
    const cs = Wd.chars();
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
      const a = cs[i], b = cs[j];
      if (a.cur || b.cur || a.riding || b.riding || a.dragging || b.dragging || a.hidden || b.hidden || a.stay || b.stay) continue;
      const dx = b.x - a.x, dy = (b.y - a.y) * 2.5, d = Math.hypot(dx, dy);
      if (d < 60 && d > 0.01) { const k = (60 - d) * 0.02; a.x -= (dx / d) * k; b.x += (dx / d) * k; }
    }
    stepFx(dt);
    PT.R && PT.R.tick(dt);
  };
  function stepProp(p, dt) {
    if (p.heldBy) { const ch = Wd.byId(p.heldBy); if (!ch || ch.removed) p.heldBy = null; else { p.x = ch.x; p.y = ch.y + 1; } return; }
    if (p.vx || p.vy) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= Math.pow(0.9965, dt); p.vy *= Math.pow(0.9965, dt);
      if (p.type === 'ball') p.spin = (p.spin || 0) + p.vx * dt * 0.03;
      const cl = Wd.clampFloor(p.x, p.y, 40);
      if (cl.x !== p.x) p.vx = -p.vx * 0.6;
      if (cl.y !== p.y) p.vy = -p.vy * 0.6;
      p.x = cl.x; p.y = cl.y;
      p.scale = Wd.depthScale(p.y);
      if (Math.abs(p.vx) + Math.abs(p.vy) < 0.01) { p.vx = 0; p.vy = 0; PT.R && PT.R.onStop && PT.R.onStop(p); }
      // ボールがシャボン玉にあたる
      if (p.type === 'ball') for (const b of Wd.bubbles.slice()) if (Math.abs(b.x - p.x) < b.r + 60 && b.y > p.y - 300) { Wd.popBubble(b); PT.R && PT.R.chainOnce && PT.R.chainOnce('ballbubble', p); }
    }
    if (p.fly) { p.z += dt * p.fly; p.x += Math.sin(Wd.t * 0.002) * 0.3; if (p.z > 1200) Wd.remove(p); }
    if (p.zTarget !== undefined) { p.z += (p.zTarget - p.z) * Math.min(1, dt * 0.004); }
  }

  /* ---------- ステージの出し入れ ---------- */
  Wd.load = (stage, snap) => {
    Wd.stage = stage; Wd.ents = []; Wd.fx = []; Wd.bubbles = []; Wd.timers = []; Wd.dark = false;
    stage.fixtures.forEach(([type, x, y, opts]) => Wd.addFix(type, x, y, Object.assign({}, opts || {})));
    (stage.skyStars || []).forEach(([x, y]) => Wd.addFix('skystar', x, y));
    if (snap && snap.chars && snap.chars.length) {
      snap.chars.forEach((s) => { const ch = Wd.addChar(s.cid, s.x, s.y, { wear: s.wear || {} }); ch.scale = Wd.depthScale(ch.y); });
      (snap.props || []).forEach((s) => { if (PT.ITEMS[s.type]) Wd.addProp(s.type, s.x, s.y, s.extra || {}); });
    } else {
      stage.spawn.forEach(([cid, x, y]) => Wd.addChar(cid, x, y));
    }
  };
  Wd.snapshot = () => ({
    chars: Wd.chars().map((ch) => ({ cid: ch.cid, x: Math.round(ch.riding ? ch.homeX || ch.x : ch.x), y: Math.round(ch.riding ? ch.homeY || ch.y : ch.y), wear: ch.wear })),
    props: Wd.props().filter((p) => !p.def.oneShot && !p.temp && !p.fly && p.def.cat !== 'hidden').map((p) => ({ type: p.type, x: Math.round(p.x), y: Math.round(p.y) })),
  });

  PT.FIX.skystar = { w: 70, h: 70, tags: ['skystar', 'sky'], sky: true, draw() {} };
})();
