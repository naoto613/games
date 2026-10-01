// ================================================================ play simulation (players, stations, HUD)
const chopTime = () => K.easy ? 1.3 : 1.8;
const washTime = () => K.easy ? 1.6 : 2.2;
const burnTime = () => K.easy ? 20 : 12;
const fireOn = () => !!K.lv.fire || !K.easy;

function setupPlayers() {
  const lv = K.lv;
  K.players = [makePlayer('futan', lv.start[0][0], lv.start[0][1], 0), makePlayer('ricky', lv.start[1][0], lv.start[1][1], 1)];
  K.twoP = APP.twoP;
  if (APP.twoP) { K.players[0].ctl = new Ctl(['p1', 'pad0', 'touch']); K.players[1].ctl = new Ctl(['p2', 'pad1']); }
  else K.ctl1 = new Ctl(['all', 'touch', 'pad0']);
  K.active = 0;
}
function curCtl(p) { return APP.twoP ? p.ctl : p.idx === K.active ? K.ctl1 : null; }
function showWho() {
  const w = $('#who'); w.textContent = 'いま うごかすのは ' + (K.active ? 'リッキー 🔵' : 'ふーたん 🩷');
  w.classList.add('on'); clearTimeout(w._t); w._t = setTimeout(() => w.classList.remove('on'), 1400);
}
function collide(p) {
  const r = 0.3, ci = ti(p.x), cj = tj(p.z);
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
    const i = ci + di, j = cj + dj; if (walkable(i, j)) continue;
    const bx = wx(i), bz = wz(j);
    const nx = clamp(p.x, bx - 0.5, bx + 0.5), nz = clamp(p.z, bz - 0.5, bz + 0.5);
    const dx = p.x - nx, dz = p.z - nz, d = Math.hypot(dx, dz);
    if (d < r) {
      if (d > 1e-5) { p.x += dx / d * (r - d); p.z += dz / d * (r - d); const vn = (p.vx * dx + p.vz * dz) / d; if (vn < 0) { p.vx -= vn * dx / d; p.vz -= vn * dz / d; } }
      else { p.x += (p.x - bx) >= 0 ? 0.02 : -0.02; }
    }
  }
}
function doAct(p) {
  if (p.hold) {
    if (p.hold.kind === 'ext') return;
    if (p.hold.kind === 'ing' && K.lv.throw) { throwIt(p); return; }
    if (p.hold.kind === 'ing') { const t = frontTile(p); if (t && t.type === 'board') say(p, 'まないたに おいてから きってね'); else say(p, ING[p.hold.id].chop ? 'まないたで きろう' : 'これは きらなくて いいよ'); }
    return;
  }
  const t = frontTile(p); if (!t) return;
  if (t.fire > 0) { fail('ひが ついてる！', p); return; }
  if (t.type === 'board' && t.top && t.top.kind === 'ing') {
    if (t.top.st === 'chop') { say(p, 'もう きれてるよ'); return; }
    if (!ING[t.top.id].chop) { say(p, 'これは きらなくて いいよ'); return; }
    p.task = { type: 'chop', t }; return;
  }
  if (t.type === 'sink' && t.dirty > 0) { p.task = { type: 'wash', t }; return; }
}
function stepPlayer(p, dt, ctl) {
  let mx = 0, mz = 0; if (ctl) { mx = ctl.x; mz = ctl.y; }
  const m = Math.hypot(mx, mz);
  if (m > 0.12) { p.face = dampAng(p.face, Math.atan2(mx, mz), 16, dt); if (p.task) p.task = null; }
  if (ctl && ctl.pressed.dash && p.dashCd <= 0) { p.dashV = 9; p.dashCd = 0.55; Sound.sfx('dash'); Parts.add(new V3(p.x, 0.2, p.z).applyMatrix4(K.root.matrixWorld), { col: 0xffffff, size: 0.4, grow: 0.8, life: 0.5, op: 0.6 }); }
  p.dashCd -= dt; p.dashV = Math.max(0, p.dashV - dt * 30);
  const sp = p.kind === 'ricky' ? 3.5 : 3.7;
  if (K.lv.ice) {
    p.vx += mx * 11 * dt; p.vz += mz * 11 * dt;
    const fr = Math.exp(-(m > 0.1 ? 1.4 : 0.8) * dt); p.vx *= fr; p.vz *= fr;
    const v = Math.hypot(p.vx, p.vz); if (v > sp) { p.vx *= sp / v; p.vz *= sp / v; }
  } else { p.vx = damp(p.vx, mx * sp, 18, dt); p.vz = damp(p.vz, mz * sp, 18, dt); }
  let vx = p.vx + Math.sin(p.face) * p.dashV, vz = p.vz + Math.cos(p.face) * p.dashV;
  if (K.lv.tilt && K.phase === 'run') vx += -K.tilt * 14;
  p.x += vx * dt; p.z += vz * dt;
  collide(p);
  if (ctl) { if (ctl.pressed.pick) doPick(p); if (ctl.pressed.act) doAct(p); }
  p.spray = !!(ctl && ctl.cur.act && p.hold && p.hold.kind === 'ext');
  if (p.spray) spray(p, dt);
  if (p.task) {
    const t = p.task.t;
    if (frontTile(p) !== t || p.hold || t.fire > 0) p.task = null;
    else if (p.task.type === 'chop') {
      const it = t.top;
      if (!it || it.kind !== 'ing' || it.st === 'chop') p.task = null;
      else {
        it.chop += dt / chopTime();
        p.chopSnd = (p.chopSnd || 0) - dt;
        if (p.chopSnd <= 0) { p.chopSnd = 0.19; Sound.sfx('chop'); const wp = new V3(); t.g.getWorldPosition(wp); wp.y += CH + 0.15; Parts.burst(wp, 2, { col: CHUNK[it.id] ? CHUNK[it.id][0] : 0xffffff, size: 0.1, life: 0.35, spd: 1.2, up: 1.5, g: 8 }); }
        if (it.chop >= 1) { it.st = 'chop'; it.chop = 0; refresh(it); Sound.sfx('chopDone'); p.task = null; Tut.ev('chop'); }
      }
    } else if (p.task.type === 'wash') {
      if (t.dirty <= 0) p.task = null;
      else {
        t.prog += dt / washTime();
        p.chopSnd = (p.chopSnd || 0) - dt;
        if (p.chopSnd <= 0) { p.chopSnd = 0.22; Sound.sfx('wash'); const wp = new V3(); t.g.getWorldPosition(wp); wp.y += CH + 0.2; Parts.add(wp, { col: 0xffffff, size: 0.16, life: 0.8, vx: rnd(-0.4, 0.4), vy: 0.8, vz: rnd(-0.4, 0.4), op: 0.9 }); }
        if (t.prog >= 1) { t.prog = 0; t.dirty--; t.clean++; updSink(t); Sound.sfx('washDone'); if (t.dirty <= 0) p.task = null; }
      }
    }
  }
  const speed = Math.hypot(vx, vz); p.phase += speed * dt * 5.5;
  p.throwT = Math.max(0, p.throwT - dt);
  animChef(p.P, { move: clamp(speed / sp, 0, 1.2), phase: p.phase, hold: !!p.hold && !p.spray, chop: p.task && p.task.type === 'chop', wash: p.task && p.task.type === 'wash', spray: p.spray, throwT: p.throwT, dash: p.dashV > 2, cheer: p.cheer, sad: p.sad, happy: p.cheer }, dt);
  p.P.g.position.set(p.x, 0, p.z); p.P.g.rotation.y = p.face;
  if (p.sayT > 0) p.sayT -= dt;
}
function simPlayers(dt) {
  const run = K.phase === 'run';
  if (!APP.twoP) {
    K.ctl1.poll();
    if (run && K.ctl1.pressed.swap) { K.players[K.active].task = K.players[K.active].task; K.active = 1 - K.active; Sound.sfx('swap'); showWho(); }
  } else for (const p of K.players) p.ctl.poll();
  for (const p of K.players) stepPlayer(p, dt, run ? curCtl(p) : null);
  // chefs bump each other
  const [a, b] = K.players; const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
  if (d < 0.56 && d > 1e-4) { const k = (0.56 - d) / 2; a.x -= dx / d * k; a.z -= dz / d * k; b.x += dx / d * k; b.z += dz / d * k; collide(a); collide(b); }
  // markers & target highlight
  for (const p of K.players) {
    const ctl = curCtl(p), act = !!ctl;
    p.ring.visible = act || APP.twoP; p.ring.material.opacity = act ? 0.9 : 0.35;
    p.arrow.visible = act && !APP.twoP; p.arrow.position.y = 1.55 + Math.sin(K.t * 5) * 0.06;
    const t = act && run ? frontTile(p) : null;
    if (t) { p.hl.visible = true; p.hl.position.set(t.x, CH + 0.03, t.z); p.hl.material.opacity = 0.35 + Math.sin(K.t * 6) * 0.12; } else p.hl.visible = false;
  }
}
function cookPot(pot, t, dt) {
  if (pot.state === 'cook') {
    pot.cook = Math.min(pot.need, pot.cook + dt * (K.easy ? 1.2 : 1));
    if (pot.cook >= pot.need - 1e-6 && potOut(pot.items)) { pot.state = 'done'; pot.over = 0; refresh(pot); Sound.sfx('done'); }
    if (Math.random() < dt * 3) { const wp = new V3(); t.g.getWorldPosition(wp); wp.y += CH + 0.35; Parts.add(wp, { col: 0xffffff, size: 0.25, grow: 0.6, life: 1.1, vx: rnd(-0.1, 0.1), vy: 0.7, vz: rnd(-0.1, 0.1), op: 0.55 }); }
    if (pot.pt === 'pan' && Math.random() < dt * 8) Sound.noise(0.08, 0.04, 'highpass', 4000);
  } else if (pot.state === 'done') {
    pot.over += dt; const bt = burnTime();
    if (pot.over > bt * 0.5) { pot.wb = (pot.wb || 0) - dt; if (pot.wb <= 0) { pot.wb = pot.over > bt * 0.8 ? 0.25 : 0.5; Sound.sfx('warn'); } }
    if (Math.random() < dt * 4) { const wp = new V3(); t.g.getWorldPosition(wp); wp.y += CH + 0.35; Parts.add(wp, { col: 0xffffff, size: 0.3, grow: 0.7, life: 1.1, vx: rnd(-0.1, 0.1), vy: 0.9, vz: rnd(-0.1, 0.1), op: 0.7 }); }
    if (pot.over > bt) { pot.state = 'burnt'; refresh(pot); Sound.sfx('burn'); }
  } else if (pot.state === 'burnt') {
    pot.over += dt;
    if (Math.random() < dt * 6) { const wp = new V3(); t.g.getWorldPosition(wp); wp.y += CH + 0.35; Parts.add(wp, { col: 0x2a2424, size: 0.35, grow: 1, life: 1.5, vx: rnd(-0.2, 0.2), vy: 1, vz: rnd(-0.2, 0.2), op: 0.6 }); }
    if (fireOn() && pot.over > burnTime() + 4 && !t.fire) ignite(t);
  }
}
function simStations(dt) {
  for (const t of K.tiles) {
    if (t.type === 'stove') {
      const pot = t.top; let on = false;
      if (pot && pot.kind === 'pot' && pot.items.length && pot.state !== 'empty') { on = pot.state !== 'burnt'; if (K.phase === 'run') cookPot(pot, t, dt); }
      t.burnerM.emissiveIntensity = on ? 0.7 + Math.sin(K.t * 9) * 0.2 : 0;
    } else if (t.type === 'conv' && t.top && K.phase === 'run') {
      const nx = tileAt(t.i + t.dir[0], t.j + t.dir[1]);
      const ok = nx && !nx.top && !(nx.fire > 0) && (nx.type === 'conv' || nx.type === 'counter' || (nx.type === 'board' && t.top.kind === 'ing'));
      if (ok) {
        t.cprog += dt * 0.75;
        if (t.cprog >= 1) { const it = t.top; t.top = null; t.cprog = 0; placeOn(nx, it); }
      } else t.cprog = Math.max(0, t.cprog - dt * 2);
      if (t.top) t.top.obj.position.set(t.dir[0] * t.cprog, 0, t.dir[1] * t.cprog);
    }
    if (t.bell && t.bell.userData.ring > 0) { t.bell.userData.ring -= dt; t.bell.rotation.z = Math.sin(t.bell.userData.ring * 40) * 0.3; }
    if (t.knife) t.knife.visible = !(t.top && t.top.kind === 'ing');
  }
  beltTex.offset.x -= dt * 0.75;
}
function simMisc(dt) {
  // tilt (ship)
  if (K.lv.tilt) { K.tilt = Math.sin(K.t * 0.62) * 0.055 + Math.sin(K.t * 1.3) * 0.012; K.root.rotation.z = K.tilt; K.root.rotation.x = Math.sin(K.t * 0.47) * 0.018; K.root.position.y = Math.sin(K.t * 0.9) * 0.06; }
  if (K.sea) { const pa = K.sea.geometry.attributes.position; for (let k = 0; k < pa.count; k++) { const x = pa.getX(k), y = pa.getY(k); pa.setZ(k, Math.sin(x * 0.4 + K.t * 1.5) * 0.15 + Math.cos(y * 0.35 + K.t) * 0.12); } pa.needsUpdate = true; K.sea.geometry.computeVertexNormals(); }
  // floor items drift on the ship
  if (K.lv.tilt) for (const f of K.floorItems) { const nx = f.x - K.tilt * 6 * dt; if (walkable(ti(nx), tj(f.z))) { f.x = nx; f.it.obj.position.x = nx; } }
  // pending plates
  for (let k = K.pend.length - 1; k >= 0; k--) { const q = K.pend[k]; q.t -= dt; if (q.t <= 0) { returnPlate(q.dirty); K.pend.splice(k, 1); } }
  if (K.catPaw) K.catPaw.position.y = 1.4 + Math.sin(K.t * 3) * 0.12;
  if (K.lavaTop) K.lavaTop.material.color.setHSL(0.05, 1, 0.5 + Math.sin(K.t * 3) * 0.08);
  if (K.campFire) animFire(K.campFire, K.t, 1);
  if (K.snow && Math.random() < dt * 14) Parts.add(new V3(rnd(-K.W / 2 - 3, K.W / 2 + 3), 7, rnd(-K.H / 2 - 2, K.H / 2 + 2)), { col: 0xffffff, size: 0.12, life: 4, vy: -1.6, vx: rnd(-0.3, 0.3), op: 0.95 });
  if (K.embers && Math.random() < dt * 10) Parts.add(new V3(rnd(-K.W / 2 - 3, K.W / 2 + 3), -0.5, rnd(-K.H / 2 - 2, K.H / 2 + 1)), { col: 0xff7a2a, size: 0.12, life: 2.5, vy: 1.4, vx: rnd(-0.3, 0.3), add: true });
  // volcano eruptions
  if (K.lv.erupt && K.phase === 'run') {
    K.eruptT -= dt;
    if (K.eruptT <= 0) {
      K.eruptT = K.easy ? rnd(28, 34) : rnd(18, 24);
      Sound.sfx('rumble'); K.shake = 0.8; bigText('ふんか！', true);
      const cand = K.tiles.filter(t => (t.type === 'counter' || t.type === 'board') && !t.fire && !(t.top && t.top.kind === 'ext'));
      const tg = pick(cand);
      if (tg) {
        const wp = new V3(); tg.g.getWorldPosition(wp);
        K.meteor = { t: 0, tg, from: new V3(2, 8, -K.H / 2 - 12), to: wp.add(new V3(0, CH, 0)), obj: mesh(G.ico(0.35, 0), MB(0xff5a1a)) };
        scene.add(K.meteor.obj);
      }
    }
  }
  if (K.meteor) {
    const m = K.meteor; m.t += dt / 1.3; const k = Math.min(1, m.t);
    m.obj.position.lerpVectors(m.from, m.to, k); m.obj.position.y += Math.sin(k * Math.PI) * 6;
    Parts.add(m.obj.position, { col: 0xff8a2a, size: 0.4, grow: 0.1, life: 0.5, add: true });
    if (k >= 1) { scene.remove(m.obj); ignite(m.tg); Parts.burst(m.to, 16, { col: 0xff6a1a, size: 0.25, life: 0.8, spd: 3, up: 3, g: 8, add: true }); K.meteor = null; }
  }
  // boss stage: moving wall + roar
  if (K.mover && K.phase === 'run') {
    K.mover.t -= dt;
    if (K.mover.t <= 2 && !K.mover.warned) { K.mover.warned = true; if (K.boss) K.boss.roar = 1.6; Sound.sfx('roar'); bigText('グオー！', true); }
    if (K.mover.t <= 0) { K.mover.t = K.mover.period * (K.easy ? 1.3 : 1); K.mover.warned = false; toggleMover(); }
  }
  if (K.mover) for (const t of K.mover.tiles) { t.g.position.x = damp(t.g.position.x, t.x, 6, dt); t.g.position.z = damp(t.g.position.z, t.z, 6, dt); if (K.mover.t < 2 && K.phase === 'run') t.g.position.y = Math.abs(Math.sin(K.t * 30)) * 0.03; else t.g.position.y = 0; }
  if (K.boss) { if (K.boss.roar > 0) K.boss.roar -= dt; animHarapekon(K.boss.P, { roar: K.boss.roar > 0, eat: K.boss.P.chomp > 0 }, dt); }
  K.shake = Math.max(0, K.shake - dt);
}

// ---------------------------------------------------------------- floating widgets (DOM over the 3D view)
const _pv = new V3();
function proj(v) { _pv.copy(v).project(camera); return { x: (_pv.x + 1) / 2 * VW, y: (1 - _pv.y) / 2 * VH, ok: _pv.z < 1 }; }
const Floats = {
  el: $('#floats'), m: new Map(), used: new Set(), pops: [],
  get(key, cls) {
    let e = this.m.get(key);
    if (!e) { e = document.createElement('div'); this.el.appendChild(e); this.m.set(key, e); e._h = null; e._c = null; }
    if (e._c !== cls) { e.className = 'fl ' + cls; e._c = cls; }
    this.used.add(key); e.style.display = '';
    return e;
  },
  pos(e, v, dy = 0) { const p = proj(v); e.style.transform = `translate(${p.x.toFixed(1)}px,${(p.y + dy).toFixed(1)}px)`; },
  html(e, h) { if (e._h !== h) { e.innerHTML = h; e._h = h; } },
  bar(key, v, f, cls) { const e = this.get(key, 'bar ' + cls); this.html(e, '<i></i>'); e.firstChild.style.width = (clamp(f, 0, 1) * 100).toFixed(0) + '%'; this.pos(e, v); },
  icons(key, v, list) { const e = this.get(key, 'icons'); this.html(e, list.map(k => `<img src="${iconURL(k)}" alt="">`).join('')); const p = proj(v); e.style.transform = `translate(${(p.x - list.length * 13).toFixed(1)}px,${(p.y - 30).toFixed(1)}px)`; },
  mark(key, v, cls, txt) { const e = this.get(key, cls); this.html(e, txt); this.pos(e, v); },
  end() { for (const [k, e] of this.m) if (!this.used.has(k)) e.style.display = 'none'; this.used.clear(); },
  clear() { for (const [, e] of this.m) e.remove(); this.m.clear(); for (const p of this.pops) p.el.remove(); this.pops = []; },
};
function popText(txt, wpos, bad) {
  const e = document.createElement('div'); e.className = 'fl pts' + (bad ? ' bad' : ''); e.textContent = txt; Floats.el.appendChild(e);
  Floats.pops.push({ el: e, v: wpos.clone(), t: 0 });
}
function updPops(dt) {
  for (let k = Floats.pops.length - 1; k >= 0; k--) {
    const p = Floats.pops[k]; p.t += dt;
    if (p.t > 1.3) { p.el.remove(); Floats.pops.splice(k, 1); continue; }
    const s = proj(p.v); const sc = p.t < 0.15 ? p.t / 0.15 * 1.3 : 1;
    p.el.style.transform = `translate(${s.x - 30}px,${s.y - 20 - p.t * 60}px) scale(${sc})`; p.el.style.opacity = p.t > 1 ? (1.3 - p.t) / 0.3 : 1;
  }
}
const _wv = new V3();
function itemIcons(it) {
  if (it.kind === 'plate' && !it.dirty && it.items.length) return it.items.map(k => COMP[k].ic);
  if (it.kind === 'pot' && it.items.length && it.state === 'cook') return it.items.map(k => ING[k.replace('_c', '')].e);
  return null;
}
function updFloats() {
  const fi = (key, it, v) => {
    const ic = itemIcons(it); if (ic) Floats.icons(key + 'i', v, ic);
    if (it.kind === 'pot' && it.items.length) {
      const bt = burnTime();
      if (it.state === 'cook') Floats.bar(key + 'b', v, it.cook / (it.full || it.need || 1), 'cook');
      else if (it.state === 'done') { if (it.over > bt * 0.5) Floats.mark(key + 'w', v, 'warn', '!'); else Floats.mark(key + 'w', v, 'ok', '✓'); }
      else if (it.state === 'burnt') Floats.mark(key + 'w', v, 'warn', '✖');
    }
  };
  for (const t of K.tiles) {
    if (t.top) {
      t.top.obj.getWorldPosition(_wv); _wv.y += 0.55;
      if (t.top.kind === 'ing' && t.top.chop > 0 && t.top.st !== 'chop') Floats.bar('c' + t.i + '_' + t.j, _wv, t.top.chop, '');
      else fi('t' + t.i + '_' + t.j, t.top, _wv);
    }
    if (t.type === 'sink' && t.prog > 0 && t.dirty > 0) { t.g.getWorldPosition(_wv); _wv.y += CH + 0.6; Floats.bar('s' + t.i, _wv, t.prog, 'wash'); }
    if (t.type === 'sink' && t.dirty > 0 && !t.prog) { t.g.getWorldPosition(_wv); _wv.y += CH + 0.7; Floats.mark('sd' + t.i, _wv, 'mark', '🫧×' + t.dirty); }
  }
  for (const p of K.players) {
    if (p.hold && p.hold.obj) { p.hold.obj.getWorldPosition(_wv); _wv.y += 0.5; fi('p' + p.idx, p.hold, _wv); }
    if (p.sayT > 0) { p.P.g.getWorldPosition(_wv); _wv.y += 1.85; Floats.mark('say' + p.idx, _wv, 'say', p.say); }
  }
  for (let k = 0; k < K.floorItems.length; k++) { const f = K.floorItems[k]; f.it.obj.getWorldPosition(_wv); _wv.y += 0.5; fi('f' + k, f.it, _wv); }
  if (Tut.target) { Tut.target.g.getWorldPosition(_wv); _wv.y += CH + 1.25 + Math.sin(K.t * 6) * 0.08; Floats.mark('tut', _wv, 'mark', '⬇'); }
  Floats.end();
}

// ---------------------------------------------------------------- hints (planner for little cooks)
const RAW_OF = { lettuce_c: 'lettuce', tomato_c: 'tomato', fish_c: 'fish', nori: 'nori', bun: 'bun', soup: 'tomato', gohan: 'rice', patty: 'meat' };
const Tut = {
  target: null, text: '', on: false,
  ev() { },
  missing(have, need) { const c = {}; for (const k of have) c[k] = (c[k] || 0) + 1; const out = []; for (const k of need) { if (c[k]) c[k]--; else out.push(k); } return out; },
  find(f) { let best = null, bd = 1e9; const p = K.players[K.active]; for (const t of K.tiles) if (!(t.fire > 0) && f(t)) { const d = Math.hypot(t.x - p.x, t.z - p.z); if (d < bd) { bd = d; best = t; } } return best; },
  potFor(out) { return this.find(t => t.top && t.top.kind === 'pot' && (t.top.pt === 'pan') === (out === 'patty') && (t.top.items.length === 0 || POT_RECIPES.concat(PAN_RECIPES).some(r => r.out === out && isSub(t.top.items, r.items)))); },
  compute() {
    this.target = null; this.text = '';
    if (!this.on || K.phase !== 'run' || !K.orders.length) return;
    const p = K.players[K.active]; if (!p) return;
    if (K.tiles.some(t => t.fire > 0)) {
      if (p.hold && p.hold.kind === 'ext') { this.text = 'ひに むかって 🧯 けす！'; this.target = K.tiles.find(t => t.fire > 0); return; }
      const e = K.tiles.find(t => t.top && t.top.kind === 'ext');
      if (e && !p.hold) { this.text = 'しょうかきを ✋ もとう'; this.target = e; return; }
    }
    const R = RECIPES[K.orders[0].r];
    const plateOK = pl => pl.kind === 'plate' && !pl.dirty && isSub(pl.items, R.items);
    const h = p.hold;
    const T = (txt, t) => { this.text = txt; this.target = t; };
    const doneHas = out => this.find(t => t.top && t.top.kind === 'pot' && t.top.state === 'done' && potOut(t.top.items) === out);
    const readyItem = key => this.find(t => t.top && t.top.kind === 'ing' && compKey(t.top) === key);
    const plateSrc = () => this.find(t => (t.type === 'plates' && t.plates > 0) || (t.type === 'sink' && t.clean > 0));
    if (h) {
      if (h.kind === 'plate') {
        if (h.dirty) return T('ながしに おいて 🔪 あらおう', this.find(t => t.type === 'sink'));
        if (sameSet(h.items, R.items)) return T('うけとりぐちへ ✋', this.find(t => t.type === 'window'));
        if (!plateOK(h)) return T('ゴミばこで すてよう', this.find(t => t.type === 'trash'));
        const miss = this.missing(h.items, R.items);
        for (const m of miss) { const s = doneHas(m) || readyItem(m); if (s) return T(s.top.kind === 'pot' ? 'なべから もりつけよう ✋' : 'のせよう ✋', s); }
        return T('おさらを カウンターに おこう ✋', this.find(t => t.type === 'counter' && !t.top));
      }
      if (h.kind === 'ing') {
        const key = compKey(h);
        if (!key) return T('まないたに おこう ✋', this.find(t => t.type === 'board' && !t.top));
        if (R.items.includes(key)) {
          const pl = this.find(t => t.top && plateOK(t.top) && isSub(t.top.items.concat(key), R.items));
          return T('おさらに のせよう ✋', pl || this.find(t => t.type === 'plates' && t.plates > 0) || this.find(t => t.type === 'counter' && !t.top));
        }
        for (const out of R.items) { const pt = this.potFor(out); if (pt && POT_RECIPES.concat(PAN_RECIPES).some(r => r.out === out && isSub(pt.top.items.concat(key), r.items))) return T(out === 'patty' ? 'フライパンに いれよう ✋' : 'なべに いれよう ✋', pt); }
        return T('いまは いらないかも。 ゴミばこへ', this.find(t => t.type === 'trash'));
      }
      if (h.kind === 'pot') {
        if (h.state === 'done') return T('おさらに いれよう ✋', this.find(t => t.top && plateOK(t.top)) || plateSrc());
        return T('コンロに もどそう ✋', this.find(t => t.type === 'stove' && !t.top));
      }
      return;
    }
    // empty hands
    const board = this.find(t => t.type === 'board' && t.top && t.top.kind === 'ing' && t.top.st !== 'chop' && ING[t.top.id].chop);
    if (board) return T('🔪 で きろう！', board);
    const burnt = this.find(t => t.top && t.top.kind === 'pot' && t.top.state === 'burnt');
    if (burnt) return T('こげた なべを ✋ もって ゴミばこへ', burnt);
    const fin = this.find(t => t.top && t.top.kind === 'plate' && sameSet(t.top.items, R.items));
    if (fin) return T('かんせい！ ✋ もとう', fin);
    for (const m of R.items) { const s = doneHas(m); if (s) { const pl = this.find(t => t.top && plateOK(t.top)); return T(pl ? 'おさらを ✋ もって なべへ' : 'おさらを ✋ とろう', pl || plateSrc() || this.find(t => t.type === 'ret' && t.dirty > 0)); } }
    const prepped = R.items.map(readyItem).find(Boolean);
    if (prepped) return T('✋ もとう', prepped);
    if (!plateSrc() && !K.tiles.some(t => t.top && t.top.kind === 'plate')) {
      const r = this.find(t => t.type === 'ret' && t.dirty > 0); if (r) return T('よごれた おさらを ✋ もとう', r);
      const s = this.find(t => t.type === 'sink' && t.dirty > 0); if (s) return T('🔪 で おさらを あらおう', s);
    }
    // which raw ingredient next?
    const pl = K.tiles.map(t => t.top).find(it => it && plateOK(it));
    const pri = k => ['curry', 'soup', 'gohan', 'patty'].includes(k) ? 0 : PROC[k] ? 1 : 2;
    const miss = this.missing(pl ? pl.items : [], R.items).sort((a, b) => pri(a) - pri(b));
    for (const m of miss) {
      if (RAW_OF[m]) {
        if (POT_RECIPES.concat(PAN_RECIPES).some(r => r.out === m)) {
          const pt = this.potFor(m); const rec = POT_RECIPES.concat(PAN_RECIPES).find(r => r.out === m);
          if (pt && pt.top.items.length >= rec.items.length) continue; // cooking already
          const need = this.missing(pt ? pt.top.items : [], rec.items)[0];
          const id = need.replace('_c', '');
          return T(ING[id].n + 'を ✋ とろう', this.find(t => t.type === 'crate' && t.crate === id));
        }
        return T(ING[RAW_OF[m]].n + 'を ✋ とろう', this.find(t => t.type === 'crate' && t.crate === RAW_OF[m]));
      }
      if (m === 'curry') {
        const pt = this.potFor('curry'); const rec = POT_RECIPES.find(r => r.out === 'curry');
        if (pt && pt.top.items.length >= 3) continue;
        const need = this.missing(pt ? pt.top.items : [], rec.items)[0]; const id = need.replace('_c', '');
        return T(ING[id].n + 'を ✋ とろう', this.find(t => t.type === 'crate' && t.crate === id));
      }
    }
    if (!pl) return T('おさらを ✋ とって じゅんび', plateSrc());
  },
};

// ---------------------------------------------------------------- HUD
function updHUD() {
  const left = Math.max(0, K.T - K.time);
  const m = Math.floor(left / 60), s = Math.floor(left % 60);
  const txt = m + ':' + String(s).padStart(2, '0');
  const ct = $('#clockT'); if (ct.textContent !== txt) ct.textContent = txt;
  $('#clock').style.setProperty('--p', (left / K.T * 100).toFixed(1));
  $('#clock').classList.toggle('low', left < 20 && K.phase === 'run');
  const st = String(K.score); if ($('#scoreT').textContent !== st) $('#scoreT').textContent = st;
  const hint = Tut.text; const he = $('#hint'); if (he.textContent !== hint) he.textContent = hint;
  const tl = $('#tActL'), ti2 = $('#tActI');
  if (isTouch && K.players.length) {
    const p = K.players[APP.twoP ? 0 : K.active];
    let l = 'きる', i = '🔪';
    if (p.hold && p.hold.kind === 'ext') { l = 'けす'; i = '🧯'; }
    else if (p.hold && p.hold.kind === 'ing' && K.lv.throw) { l = 'なげる'; i = '🤾'; }
    else { const t = frontTile(p); if (t && t.type === 'sink') { l = 'あらう'; i = '🫧'; } }
    if (tl.textContent !== l) { tl.textContent = l; ti2.textContent = i; }
  }
}
function bigText(t, red) { const b = $('#big'); b.textContent = t; b.className = red ? 'red' : ''; void b.offsetWidth; b.classList.add('show'); }

// ---------------------------------------------------------------- camera framing
function fitKitchenCam(dt, snap) {
  const portrait = VW < VH;
  camera.fov = portrait ? 52 : 36; camera.updateProjectionMatrix();
  const pitch = 0.98, fovV = camera.fov * Math.PI / 180, fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect);
  const needW = (K.W + 1.0) / 2 / Math.tan(fovH / 2);
  const needH = ((K.H + 1.2) * Math.sin(pitch) + 2.6 * Math.cos(pitch)) / 2 / Math.tan(fovV / 2);
  const d = Math.max(needW, needH) * 1.08 + 2;
  const tz = 0.45;
  const tx = new V3(0, d * Math.sin(pitch), tz + d * Math.cos(pitch));
  if (snap) camera.position.copy(tx); else camera.position.lerp(tx, 1 - Math.exp(-4 * dt));
  if (K.shake > 0) camera.position.add(new V3(rnd(-1, 1), rnd(-1, 1), 0).multiplyScalar(K.shake * 0.15));
  camera.lookAt(0, 0, tz);
}
