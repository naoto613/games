// ================================================================ field: player, camera, NPCs, symbols
const FIELD = {
  area: 'world', P: null, followers: [], crumbs: [], npcs: [], acts: [], syms: [], actPress: false, menuPress: false,
  hintT: 0, safeT: 0, lastArea: '', areaT: 0, frozen: false, stick: { id: null, x0: 0, y0: 0, x: 0, y: 0 }, look: { id: null, lx: 0, ly: 0 }, run: true,
};
const CAM = { yaw: Math.PI, pitch: 0.34, dist: 6.2, x: 0, y: 5, z: 0, userT: 9, shake: 0, override: null };
// ---------------------------------------------------------------- ground
function groundY(x, z) {
  if (FIELD.area !== 'world') return 0;
  let y = terrainY(x, z);
  if (Math.abs(x) < 2.6 && z > BRIDGE.z0 && z < BRIDGE.z1 && (BRIDGE.fixed || z < PL.bridge.z - 3.2 || z > PL.bridge.z + 3.2)) y = Math.max(y, bridgeDeckY(z));
  if (Math.abs(x - PL.shrine.x) < 1.9 && z > CAUSE.z0 - 1 && z < CAUSE.z1) y = Math.max(y, CAUSE.y);
  { const d = Math.hypot(x - PL.shrine.x, z - PL.shrine.z); if (d < 7.6) y = Math.max(y, PL.shrine.h + (d < 6.4 ? 1.35 : 1.35 * (7.6 - d) / 1.2)); }
  { const d = Math.hypot(x - PL.village.x, z - PL.village.z); }
  return y;
}
function walkBlocked(x, z, r, y0) {
  if (FIELD.area !== 'world') return dungBlocked(DUNG[FIELD.area], x, z, r);
  const g = groundY(x, z);
  if (g < -0.3) return true; // water
  if (g - y0 > 0.7) return true; // too steep up
  const onBridge = Math.abs(x) < 2.6 && z > BRIDGE.z0 && z < BRIDGE.z1;
  if (onBridge && Math.abs(x) > 2.05) return true;
  if (BARRIER.on && Math.hypot(x - BARRIER.x, z - BARRIER.z) < BARRIER.r + 0.5) return true;
  return !!overworldBlocked(x, z, r);
}
function slopeAt(x, z) { const e = 0.8; return Math.hypot(groundY(x + e, z) - groundY(x - e, z), groundY(x, z + e) - groundY(x, z - e)) / (2 * e); }
// ---------------------------------------------------------------- input (touch + keys)
function readMove() {
  let x = 0, y = 0;
  for (const c of KEYS) { if (c === 'KeyW' || c === 'ArrowUp') y += 1; if (c === 'KeyS' || c === 'ArrowDown') y -= 1; if (c === 'KeyA' || c === 'ArrowLeft') x -= 1; if (c === 'KeyD' || c === 'ArrowRight') x += 1; }
  const s = FIELD.stick; if (s.id !== null) { x += s.x; y += s.y; }
  const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
  return [x, y, KEYS.has('ShiftLeft') || KEYS.has('ShiftRight')];
}
canvas.addEventListener('pointerdown', e => {
  AU.init();
  if (GAME.mode === 'title') { GAME.titleTap(); return; }
  if (UI.busy) { const top = UI.stack[UI.stack.length - 1]; if (top && top.msg) UI.input('ok'); return; }
  if (GAME.mode !== 'field') return;
  if (e.pointerType === 'mouse') { FIELD.look.id = e.pointerId; FIELD.look.lx = e.clientX; FIELD.look.ly = e.clientY; canvas.setPointerCapture(e.pointerId); return; }
  if (e.clientX < innerWidth * 0.5 && FIELD.stick.id === null) {
    const s = FIELD.stick; s.id = e.pointerId; s.x0 = e.clientX; s.y0 = e.clientY; s.x = s.y = 0;
    const b = $('#stickBase'), kn = $('#stickKnob'); b.classList.remove('hide'); kn.classList.remove('hide'); $('#stickHint').classList.add('hide');
    b.style.left = kn.style.left = e.clientX + 'px'; b.style.top = kn.style.top = e.clientY + 'px';
  } else if (FIELD.look.id === null) { FIELD.look.id = e.pointerId; FIELD.look.lx = e.clientX; FIELD.look.ly = e.clientY; }
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerId === FIELD.stick.id) {
    const s = FIELD.stick, R = 56; let dx = e.clientX - s.x0, dy = e.clientY - s.y0; const d = Math.hypot(dx, dy);
    if (d > R) { dx *= R / d; dy *= R / d; }
    s.x = dx / R; s.y = -dy / R;
    const kn = $('#stickKnob'); kn.style.left = (s.x0 + dx) + 'px'; kn.style.top = (s.y0 + dy) + 'px';
  } else if (e.pointerId === FIELD.look.id) {
    const dx = e.clientX - FIELD.look.lx, dy = e.clientY - FIELD.look.ly; FIELD.look.lx = e.clientX; FIELD.look.ly = e.clientY;
    CAM.yaw -= dx * 0.006; CAM.pitch = clamp(CAM.pitch + dy * 0.003, 0.08, 0.95); CAM.userT = 0;
  }
});
function endPtr(e) {
  if (e.pointerId === FIELD.stick.id) { FIELD.stick.id = null; FIELD.stick.x = FIELD.stick.y = 0; $('#stickBase').classList.add('hide'); $('#stickKnob').classList.add('hide'); }
  if (e.pointerId === FIELD.look.id) FIELD.look.id = null;
}
canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('wheel', e => { CAM.dist = clamp(CAM.dist * (e.deltaY > 0 ? 1.08 : 0.92), 3.2, 11); }, { passive: true });
function tbtn(id, fn) { const b = $(id); b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); AU.init(); b.classList.add('on'); fn(); }); const up = () => b.classList.remove('on'); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up); }
tbtn('#bA', () => { if (UI.busy) UI.input('ok'); else FIELD.actPress = true; });
tbtn('#bB', () => { if (UI.busy) UI.input('cancel'); else FIELD.menuPress = true; });
tbtn('#bRun', () => { FIELD.run = !FIELD.run; $('#bRun').textContent = FIELD.run ? 'はしる' : 'あるく'; $('#bRun').classList.toggle('pulse', FIELD.run); });
$('#bRun').classList.add('pulse');

// ---------------------------------------------------------------- party models
const PARTY_MODELS = {};
function partyModel(id) {
  if (PARTY_MODELS[id]) return PARTY_MODELS[id];
  let m;
  if (id === 'futan') m = makeHuman({ kid: true, hair: 0x2a1810, hairStyle: 'pigtails', top: 0x5a8ad8, bottom: 0xd84a6a, skirt: true, shoes: 0xd83a4a, hat: 'kinder', cape: 0xc8302a, sword: 'toy', belt: true });
  else if (id === 'ricky') m = makeHuman({ kid: true, scale: 0.82, hair: 0x3a2414, hairStyle: 'short', top: 0xf2e6a0, bottom: 0x6a8ad8, shoes: 0x4a7ad8, hat: 'wizard', wand: 'rattle' });
  else m = makeDog();
  scene.add(m); m.visible = false;
  PARTY_MODELS[id] = m; return m;
}
function refreshLooks() {
  const f = GAME.party.find(p => p.id === 'futan');
  if (f) { const u = partyModel('futan').userData; setSword(u.sword, EQUIP[f.eq.w] && EQUIP[f.eq.w].look); setShield(u.shield, f.eq.s && EQUIP[f.eq.s].look); }
  const r = GAME.party.find(p => p.id === 'ricky');
  if (r) { const u = partyModel('ricky').userData; setWand(u.wand, EQUIP[r.eq.w] && EQUIP[r.eq.w].look || 'rattle'); }
}
// ---------------------------------------------------------------- NPCs & interactables
function addNPC(o) {
  // o: {id, area, x, z, h, look, talk(), wander, cond()}
  const m = o.look === 'dog' ? makeDog() : makeHuman(o.look);
  m.position.set(o.x, 0, o.z); m.rotation.y = o.h || 0; scene.add(m);
  const n = Object.assign({ model: m, hx: o.x, hz: o.z, h0: o.h || 0, t: Math.random() * 10, area: 'world', r: 1.0 }, o);
  FIELD.npcs.push(n); return n;
}
function addAct(o) { const a = Object.assign({ area: 'world', r: 2.2, label: 'しらべる' }, o); FIELD.acts.push(a); return a; }
const TRIG = [];
function addTrig(o) { TRIG.push(Object.assign({ area: 'world', r: 3, inside: false }, o)); }

// ---------------------------------------------------------------- player
function initPlayer(x, z, h) {
  const m = partyModel('futan'); m.visible = true;
  FIELD.P = { x, z, y: groundY(x, z), h, spd: 0, model: m };
  FIELD.crumbs = []; for (let i = 0; i < 60; i++) FIELD.crumbs.push([x - Math.sin(h) * i * 0.15, z - Math.cos(h) * i * 0.15]);
  CAM.yaw = h + Math.PI; CAM.x = x + Math.sin(CAM.yaw) * 6; CAM.z = z + Math.cos(CAM.yaw) * 6; CAM.y = FIELD.P.y + 3;
  syncFollowers(true);
}
function syncFollowers(snap) {
  const ids = GAME.party.slice(1).map(p => p.id);
  for (const id of ['ricky', 'pochi']) { const m = PARTY_MODELS[id]; if (m && !ids.includes(id)) m.visible = false; }
  FIELD.followers = ids.map((id, k) => ({ id, m: partyModel(id), k: k + 1 }));
  for (const f of FIELD.followers) { f.m.visible = GAME.mode !== 'battle'; if (snap) { const c = FIELD.crumbs[Math.min(FIELD.crumbs.length - 1, f.k * 8)]; f.m.position.set(c[0], groundY(c[0], c[1]), c[1]); } }
}
function updatePlayer(dt) {
  const P = FIELD.P; if (!P) return;
  let [mx, my, walkKey] = readMove();
  if (FIELD.frozen || UI.busy || GAME.mode !== 'field') { mx = my = 0; }
  const mag = Math.hypot(mx, my);
  const sp = mag < 0.05 ? 0 : (FIELD.run && !walkKey && mag > 0.6 ? 5.4 : 2.6 * Math.max(0.5, mag));
  if (mag > 0.05) {
    const cy = Math.atan2(CAM.x - P.x, CAM.z - P.z); // camera yaw (from player to camera)
    const fwd = cy + Math.PI;
    const want = Math.atan2(Math.sin(fwd) * my + Math.sin(fwd + Math.PI / 2) * -mx, Math.cos(fwd) * my + Math.cos(fwd + Math.PI / 2) * -mx);
    P.h = lerpAng(P.h, want, 1 - Math.exp(-14 * dt));
    const dx = Math.sin(want) * sp * dt, dz = Math.cos(want) * sp * dt, r = 0.32;
    if (!walkBlocked(P.x + dx, P.z + dz, r, P.y)) { P.x += dx; P.z += dz; }
    else if (!walkBlocked(P.x + dx, P.z, r, P.y)) P.x += dx;
    else if (!walkBlocked(P.x, P.z + dz, r, P.y)) P.z += dz;
  }
  P.spd = damp(P.spd, sp, 10, dt);
  P.y = damp(P.y, groundY(P.x, P.z), 18, dt);
  P.model.position.set(P.x, P.y, P.z); P.model.rotation.y = P.h;
  animChar(P.model, dt, P.spd / 4);
  // breadcrumbs
  const c0 = FIELD.crumbs[0];
  if (Math.hypot(P.x - c0[0], P.z - c0[1]) > 0.15) { FIELD.crumbs.unshift([P.x, P.z]); FIELD.crumbs.length = 60; }
  for (const f of FIELD.followers) {
    const c = FIELD.crumbs[Math.min(FIELD.crumbs.length - 1, f.k * 8)], m = f.m;
    const dx = c[0] - m.position.x, dz = c[1] - m.position.z, d = Math.hypot(dx, dz);
    const fs = Math.min(d / dt, 7);
    if (d > 0.02) { m.position.x = damp(m.position.x, c[0], 9, dt); m.position.z = damp(m.position.z, c[1], 9, dt); m.rotation.y = lerpAng(m.rotation.y, Math.atan2(dx, dz), 1 - Math.exp(-10 * dt)); }
    m.position.y = damp(m.position.y, groundY(m.position.x, m.position.z), 16, dt);
    animChar(m, dt, clamp(fs / 4, 0, 1.3) * (d > 0.05 ? 1 : 0));
  }
}
// ---------------------------------------------------------------- camera
function updateCamera(dt) {
  const P = FIELD.P; if (!P) return;
  if (CAM.override) { CAM.override(dt); return; }
  const inD = FIELD.area !== 'world';
  CAM.userT += dt;
  const moving = P.spd > 0.5;
  if (moving && CAM.userT > 1.5) CAM.yaw = lerpAng(CAM.yaw, P.h + Math.PI, 1 - Math.exp(-1.2 * dt));
  const portrait = camera.aspect < 1 ? 1.3 : 1;
  const dist = (inD ? Math.min(CAM.dist, 5.2) : CAM.dist) * portrait, pitch = inD ? Math.max(CAM.pitch, 0.42) : CAM.pitch;
  const tx = P.x, ty = P.y + 1.0, tz = P.z;
  let cx = tx + Math.sin(CAM.yaw) * Math.cos(pitch) * dist, cz = tz + Math.cos(CAM.yaw) * Math.cos(pitch) * dist, cy = ty + Math.sin(pitch) * dist;
  if (inD) { // pull in if a wall is in the way
    const d = DUNG[FIELD.area]; let k = 1;
    for (let s = 0.1; s <= 1; s += 0.05) { const x = lerp(tx, cx, s), z = lerp(tz, cz, s); if (dungBlocked(d, x, z, 0.3)) { k = Math.max(0.15, s - 0.08); break; } }
    cx = lerp(tx, cx, k); cz = lerp(tz, cz, k); cy = lerp(ty, cy, k); cy = Math.min(cy, d.D.wallH - 0.4);
  } else { const g = groundY(cx, cz) + 0.6; if (cy < g) cy = g; }
  const k = 1 - Math.exp(-8 * dt);
  CAM.x = lerp(CAM.x, cx, k); CAM.y = lerp(CAM.y, cy, k); CAM.z = lerp(CAM.z, cz, k);
  camera.position.set(CAM.x, CAM.y, CAM.z);
  if (CAM.shake > 0) { CAM.shake = Math.max(0, CAM.shake - dt * 2); camera.position.x += (Math.random() - 0.5) * CAM.shake * 0.3; camera.position.y += (Math.random() - 0.5) * CAM.shake * 0.3; }
  camera.lookAt(tx, ty + 0.2, tz);
}
// ---------------------------------------------------------------- interaction
function nearestThing() {
  const P = FIELD.P; let best = null, bd = 1e9;
  for (const n of FIELD.npcs) {
    if (n.area !== FIELD.area || !n.model.visible || (n.cond && !n.cond())) continue;
    const d = Math.hypot(n.model.position.x - P.x, n.model.position.z - P.z) - (n.talkR || 1.9);
    if (d < 0 && d < bd) { bd = d; best = { type: 'npc', n }; }
  }
  for (const a of FIELD.acts) {
    if (a.area !== FIELD.area || (a.cond && !a.cond())) continue;
    const d = Math.hypot(a.x - P.x, a.z - P.z) - a.r;
    if (d < 0 && d < bd) { bd = d; best = { type: 'act', a }; }
  }
  return best;
}
async function doInteract(t) {
  FIELD.frozen = true;
  try {
    if (t.type === 'npc') {
      const n = t.n, m = n.model, P = FIELD.P;
      const want = Math.atan2(P.x - m.position.x, P.z - m.position.z);
      for (let i = 0; i < 12; i++) { m.rotation.y = lerpAng(m.rotation.y, want, 0.35); P.h = lerpAng(P.h, want + Math.PI, 0.35); P.model.rotation.y = P.h; await sleep(16); }
      await n.talk(n);
    } else await t.a.fn(t.a);
  } finally { UI.hideMsg(); FIELD.frozen = false; GAME.refreshHUD(); }
}
function updateNPCs(dt) {
  for (const n of FIELD.npcs) {
    const m = n.model, vis = n.area === FIELD.area && (!n.cond || n.cond()) && GAME.mode !== 'battle';
    m.visible = vis; if (!vis) continue;
    if (Math.abs(m.position.x - FIELD.P.x) > 80 || Math.abs(m.position.z - FIELD.P.z) > 80) continue;
    n.t += dt; let spd = 0;
    if (n.wander && !FIELD.frozen && !UI.busy) {
      if (!n.goal || n.t > n.goalT) { n.goal = [n.hx + (Math.random() - 0.5) * n.wander * 2, n.hz + (Math.random() - 0.5) * n.wander * 2]; n.goalT = n.t + 3 + Math.random() * 4; }
      const dx = n.goal[0] - m.position.x, dz = n.goal[1] - m.position.z, d = Math.hypot(dx, dz);
      if (d > 0.3) {
        const nx = m.position.x + dx / d * 1.1 * dt, nz = m.position.z + dz / d * 1.1 * dt;
        if (!overworldBlocked(nx, nz, 0.3) && Math.hypot(nx - FIELD.P.x, nz - FIELD.P.z) > 1.0) { m.position.x = nx; m.position.z = nz; spd = 0.35; m.rotation.y = lerpAng(m.rotation.y, Math.atan2(dx, dz), 0.1); } else n.goalT = 0;
      }
    }
    m.position.y = n.area === 'world' ? groundY(m.position.x, m.position.z) : 0;
    if (n.look === 'dog') animChar(m, dt, spd); else animChar(m, dt, spd);
  }
}
// ---------------------------------------------------------------- symbol monsters
function zoneAt(x, z) {
  if (FIELD.area !== 'world') return DMAPS[FIELD.area].zone;
  for (const k of ['village', 'forest']) if (Math.hypot(x - PL[k].x, z - PL[k].z) < PL[k].r + 14) return null;
  if (Math.abs(x) < 6 && z > BRIDGE.z0 - 4 && z < BRIDGE.z1 + 4) return null;
  if (Math.hypot(x - PL.shrine.x, z - PL.shrine.z) < 14) return null;
  if (z > riverZ(x)) return Math.hypot(x - PL.cave.x, z - PL.cave.z) < 80 || x > 110 ? 'z1b' : 'z1';
  if (BARRIER.on ? z < -175 : z < -175) return 'z3';
  return 'z2';
}
function spawnSym(x, z, zone) {
  const id = wpick(ZONES[zone].mons), def = MONS[id];
  const m = makeMonster(def); scene.add(m);
  const s = { id, zone, model: m, x, z, h: Math.random() * 6.28, t: 0, wt: 0, chase: false, def };
  m.position.set(x, groundY(x, z), z);
  FIELD.syms.push(s); return s;
}
function removeSym(s) { scene.remove(s.model); s.model.traverse(o => { if (o.isMesh) { o.geometry.dispose(); } }); FIELD.syms.splice(FIELD.syms.indexOf(s), 1); }
function clearSyms() { while (FIELD.syms.length) removeSym(FIELD.syms[0]); }
let symSpawnT = 0;
function updateSyms(dt) {
  const P = FIELD.P; const inD = FIELD.area !== 'world';
  symSpawnT -= dt;
  const maxN = inD ? 6 : 13;
  if (symSpawnT <= 0 && FIELD.syms.length < maxN && GAME.mode === 'field') {
    symSpawnT = inD ? 1.2 : 0.4;
    for (let tries = 0; tries < 8; tries++) {
      let x, z;
      if (inD) { const d = DUNG[FIELD.area]; const i = Math.floor(Math.random() * d.W), j = Math.floor(Math.random() * d.H); if (d.solid(i, j) || d.grid[j][i] === 'S' || d.grid[j][i] === 'B') continue; x = d.cx(i); z = d.cz(j); if (Math.hypot(x - P.x, z - P.z) < 14) continue; }
      else { const a = Math.random() * 6.28, r = 32 + Math.random() * 40; x = P.x + Math.sin(a) * r; z = P.z + Math.cos(a) * r; }
      const zone = zoneAt(x, z); if (!zone) continue;
      if (walkBlocked(x, z, 0.5, groundY(x, z))) continue;
      if (!inD && slopeAt(x, z) > 0.5) continue;
      spawnSym(x, z, zone); break;
    }
  }
  for (const s of [...FIELD.syms]) {
    const m = s.model; s.t += dt;
    const dx = P.x - s.x, dz = P.z - s.z, d = Math.hypot(dx, dz);
    if (!inD && d > 100) { removeSym(s); continue; }
    let spd = 0;
    if (GAME.mode === 'field' && !FIELD.frozen && !UI.busy) {
      const safe = FIELD.safeT > 0 || !zoneAt(P.x, P.z);
      s.chase = !safe && d < (s.def.boss ? 0 : 9);
      let h = s.h;
      if (s.chase) { h = Math.atan2(dx, dz); spd = 2.9 + (s.def.agi > 15 ? 0.6 : 0); }
      else { s.wt -= dt; if (s.wt <= 0) { s.wt = 1.5 + Math.random() * 3; s.h = Math.random() * 6.28; s.idle = Math.random() < 0.4; } if (!s.idle) spd = 1.0; h = s.h; }
      if (spd > 0) {
        const nx = s.x + Math.sin(h) * spd * dt, nz = s.z + Math.cos(h) * spd * dt;
        const nz2 = zoneAt(nx, nz);
        if (nz2 && !walkBlocked(nx, nz, 0.45, groundY(s.x, s.z)) && (inD || slopeAt(nx, nz) < 0.6)) { s.x = nx; s.z = nz; } else { s.wt = 0; spd = 0; }
        m.rotation.y = lerpAng(m.rotation.y, h, 1 - Math.exp(-8 * dt));
      }
      if (d < 1.0 && !safe && GAME.mode === 'field') { GAME.encounter(s); return; }
    }
    m.position.set(s.x, groundY(s.x, s.z), s.z);
    animMonster(m, dt, spd > 0);
  }
}
// ---------------------------------------------------------------- area transitions
async function fadeOut(ms) { const f = $('#fade'); f.style.transition = `opacity ${ms || 450}ms`; f.style.opacity = '1'; await sleep(ms || 450); }
async function fadeIn(ms) { const f = $('#fade'); f.style.transition = `opacity ${ms || 450}ms`; f.style.opacity = '0'; await sleep(ms || 450); }
function setArea(area) {
  FIELD.area = area;
  clearSyms();
  const inD = area !== 'world';
  WORLD.visible = !inD; sky.visible = !inD;
  for (const k in DUNG) DUNG[k].grp.visible = k === area;
  for (const n of FIELD.npcs) n.model.visible = n.area === area;
  if (inD) {
    const th = THEMES[DMAPS[area].theme];
    scene.fog.color.set(th.fog); scene.fog.density = th.fogD; scene.background = new THREE.Color(th.fog);
    hemi.color.set(th.hemi[0]); hemi.groundColor.set(th.hemi[1]); hemi.intensity = th.hemi[2];
    sunLight.intensity = 0; sunLight.castShadow = false; scene.environment = ENV.night;
    renderer.toneMappingExposure = 1.15;
    ATM.n = -1;
  } else {
    scene.background = null; sunLight.castShadow = true; setAtmos(darkAt(FIELD.P ? FIELD.P.z : 0), true);
  }
}
function darkAt(z) { return GAME.flags.sunback ? 0 : sstep(-105, -200, z) * 0.97; }
async function enterDungeon(id) {
  AU.stairs(); await fadeOut();
  setArea(id);
  const d = DUNG[id], s = d.start;
  initPlayer(s.x, s.z + d.D.cell * 0.3, Math.PI);
  // face away from the stairs into the dungeon: pick an open direction
  for (const [a, b, h] of [[0, 1, 0], [1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2], [0, -1, Math.PI]]) if (!d.solid(s.i + a, s.j + b)) { FIELD.P.h = h; FIELD.P.x = s.x + a * 1.2; FIELD.P.z = s.z + b * 1.2; break; }
  initPlayer(FIELD.P.x, FIELD.P.z, FIELD.P.h);
  AU.play(id === 'castle' ? 'night' : 'dungeon');
  showArea(d.D.name, '');
  FIELD.safeT = 2;
  GAME.save.pos = null; GAME.persist();
  await fadeIn();
}
async function exitDungeon() {
  const id = FIELD.area; AU.stairs(); await fadeOut();
  setArea('world');
  const sp = { cave: [SPOT.cave.x - 2.5, SPOT.cave.z, -Math.PI / 2], shrine: [PL.shrine.x, PL.shrine.z + 8.5, 0], castle: [SPOT.castle.x, SPOT.castle.z + 4, 0] }[id];
  initPlayer(sp[0], sp[1], sp[2]);
  GAME.musicForPlace(true);
  FIELD.safeT = 2;
  await fadeIn();
}
async function warpTo(where) {
  await fadeOut();
  if (FIELD.area !== 'world') setArea('world');
  const s = where === 'forest' ? [PL.forest.x + 26, PL.forest.z + 4, -Math.PI / 2] : [SPOT.start.x, SPOT.start.z - 12, Math.PI];
  initPlayer(s[0], s[1], s[2]);
  GAME.musicForPlace(true); FIELD.safeT = 2;
  await fadeIn();
}
let areaTimer = 0;
function showArea(name, sub) { const e = $('#area'); e.innerHTML = name + (sub ? `<small>${sub}</small>` : ''); e.style.opacity = '1'; areaTimer = 3; }
// ---------------------------------------------------------------- ambient particles
const AMB = { smoke: [], fireflies: null, spray: [] };
function buildAmbient() {
  const sm = new THREE.SpriteMaterial({ map: TX.smoke, color: 0xd8d8d8, transparent: true, depthWrite: false, opacity: 0.5 });
  for (const s of SMOKES) for (let k = 0; k < 6; k++) { const p = new THREE.Sprite(sm.clone()); p.userData = { o: s, t: k / 6 * 5 }; WORLD.add(p); AMB.smoke.push(p); }
  // fireflies / dark-sparks near the castle
  const N = 260, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const x = (Math.random() - 0.5) * 300, z = -120 - Math.random() * 160; pos[i * 3] = x; pos[i * 3 + 1] = terrainY(x, z) + 0.5 + Math.random() * 3; pos[i * 3 + 2] = z; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  AMB.fireflies = new THREE.Points(g, new THREE.PointsMaterial({ map: TX.dot, color: 0xc8a0ff, size: 0.35, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 }));
  WORLD.add(AMB.fireflies);
  // fountain spray
  const fm = new THREE.SpriteMaterial({ map: TX.dot, color: 0xdff4ff, transparent: true, opacity: 0.7, depthWrite: false });
  for (const f of FOUNTAINS) for (let k = 0; k < 40; k++) { const p = new THREE.Sprite(fm); p.scale.setScalar(0.12); p.userData = { o: f, t: Math.random() * 1.2, a: Math.random() * 6.28 }; WORLD.add(p); AMB.spray.push(p); }
}
function updateAmbient(dt, time) {
  for (const p of AMB.smoke) { const u = p.userData; u.t = (u.t + dt) % 5; const k = u.t / 5; p.position.set(u.o.x + Math.sin(time * 0.3 + u.t) * k * 1.2 + k * 2, u.o.y + k * 6, u.o.z + k * 1.5); p.scale.setScalar(0.6 + k * 2.6); p.material.opacity = 0.35 * Math.sin(k * Math.PI); }
  for (const p of AMB.spray) { const u = p.userData; u.t = (u.t + dt) % 1.2; const k = u.t; p.position.set(u.o.x + Math.sin(u.a) * k * 1.6, u.o.y + 0.2 + k * 2.2 - k * k * 3.4, u.o.z + Math.cos(u.a) * k * 1.6); }
  if (AMB.fireflies) { AMB.fireflies.material.opacity = 0.5 + 0.4 * Math.sin(time * 2); AMB.fireflies.visible = !GAME.flags.sunback; AMB.fireflies.position.y = Math.sin(time * 0.7) * 0.3; }
}
// ---------------------------------------------------------------- point light pool (constant count avoids shader recompiles)
const PLP = [];
for (let i = 0; i < 4; i++) { const l = new THREE.PointLight(0xff9a40, 0, 14, 2); scene.add(l); PLP.push(l); }
const lantern = new THREE.PointLight(0xffd8a0, 0, 11, 2); scene.add(lantern);
function updateLights(time, list, color) {
  const P = FIELD.P || { x: camera.position.x, z: camera.position.z, y: 0 };
  const near = (list || []).map(t => [t, (t.x - P.x) ** 2 + (t.z - P.z) ** 2]).sort((a, b) => a[1] - b[1]).slice(0, PLP.length);
  PLP.forEach((l, i) => {
    if (near[i] && near[i][1] < 900) { l.position.copy(near[i][0]); l.color.set(color || 0xff9a40); l.intensity = 2.4 * (0.85 + 0.15 * Math.sin(time * 13 + i * 2.1) * Math.sin(time * 7.3 + i)); }
    else l.intensity = 0;
  });
  for (const t of list || []) if (t.spr) { t.spr.scale.set(0.45 + Math.sin(time * 17 + t.x) * 0.05, 0.9 + Math.sin(time * 11 + t.z) * 0.1, 1); }
}
