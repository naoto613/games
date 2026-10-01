// ================================================================ player + boat + camera
const S = { // save state
  flags: {}, rupees: 0, maxHp: 6, hp: 6, items: {}, pearls: { g: 0, r: 0, b: 0 }, chests: {}, seen: {}, outfit: 'pajama', fastSail: 0, last: 'home', kills: 0,
};
const PL = {
  P: null, pos: new V3(0, 3, 20), vel: new V3(), vy: 0, face: Math.PI, onGround: true, mode: 'foot', phase: 0, move: 0,
  atk: null, combo: 0, chargeT: 0, spin: null, inv: 0, glide: false, magic: 1, swim: false, lastSafe: { x: 0, z: 20 }, kb: { x: 0, z: 0 },
  hold: false, push: 0, hurtT: 0, island: null, lock: false, conduct: false, outT: 0, talk: false,
};
const BOAT = { P: null, pos: new V3(0, 0, 70), head: 0, speed: 0, vy: 0, y: 0, sail: 0, hop: false, bump: 0 };
const CAM = { yaw: 0, pitch: 0.32, dist: 7.5, manualT: 9, mode: 'follow', target: new V3(), pos: new V3(), cutPos: new V3(), cutLook: new V3(), cutK: 3, look: new V3() };
const PLR = 0.42; // player radius

function initPlayer() {
  PL.P = makeFutan(); scene.add(PL.P.g); setOutfit(PL.P, S.outfit);
  BOAT.P = makeBoat(); scene.add(BOAT.P.g);
  BOAT.shadow = null;
  // wake foam trail
  BOAT.wake = [];
  const wm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false });
  for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 10).rotateX(-Math.PI / 2), wm.clone()); m.visible = false; scene.add(m); BOAT.wake.push({ m, t: 9 }); }
  BOAT.wi = 0; BOAT.wt = 0;
  refreshGear();
}
function refreshGear() {
  const P = PL.P;
  P.sword.visible = !!S.items.sword && !PL.conduct && !PL.glide && !PL.hold && PL.mode === 'foot' && !PL.swim;
  P.shield.visible = !!S.items.shield && PL.mode === 'foot' && !PL.glide && !PL.swim;
  P.leaf.visible = PL.glide;
  P.baton.visible = PL.conduct;
  const light = !!S.items.light;
  setCol(P.blade, light ? 0xdff4ff : 0xd8b070); setCol(P.tip, light ? 0xdff4ff : 0xd8b070);
  P.swordGlow.material.opacity = light ? 0.35 : 0;
}
function camBasis() { return { fx: -Math.sin(CAM.yaw), fz: -Math.cos(CAM.yaw), rx: Math.cos(CAM.yaw), rz: -Math.sin(CAM.yaw) }; }
function placePlayer(x, z, face) {
  PL.pos.set(x, Math.max(groundH(x, z), -0.5), z); PL.vy = 0; PL.onGround = true; PL.mode = 'foot'; PL.glide = false; PL.swim = false;
  if (face != null) { PL.face = face; CAM.yaw = face + Math.PI; }
  PL.lastSafe = { x, z }; PL.island = islandAt(x, z);
}
function placeBoat(x, z, head) { BOAT.pos.set(x, 0, z); BOAT.head = head; BOAT.speed = 0; BOAT.y = 0; BOAT.vy = 0; }
function islandDock(I) { const d = I.dock; return { x: I.x + d.x, z: I.z + d.z, a: d.a }; }

// ---------------------------------------------------------------- on foot
function moveTry(nx, nz) {
  const I = islandAt(nx, nz);
  const p = { x: nx, z: nz };
  collide(I, p, PLR, PL.pos.y);
  if (typeof Enemies !== 'undefined') Enemies.pushOut(p, PLR);
  const h = groundH(p.x, p.z), hc = groundH(PL.pos.x, PL.pos.z);
  const rise = h - PL.pos.y;
  if (rise > 0.45) return false;
  const d = Math.hypot(p.x - PL.pos.x, p.z - PL.pos.z);
  if (PL.onGround && d > 0.0001 && h - hc > 0.04 && (h - hc) / d > 1.05) return false;
  PL.pos.x = p.x; PL.pos.z = p.z; return true;
}
function footUpdate(dt, ctl) {
  const P = PL.P;
  let mx = ctl ? Input.mx : 0, my = ctl ? Input.my : 0;
  const mag = Math.min(1, Math.hypot(mx, my));
  const b = camBasis();
  let wx = b.rx * mx + b.fx * my, wz = b.rz * mx + b.fz * my;
  const wl = Math.hypot(wx, wz); if (wl > 0) { wx /= wl; wz /= wl; }
  const ground = groundH(PL.pos.x, PL.pos.z);
  PL.swim = ground < -0.6 && PL.pos.y <= -0.3 && !PL.glide;
  let spd = 7.2 * mag;
  if (PL.atk) spd *= 0.25; if (PL.chargeT > 0.25) spd *= 0.45; if (PL.spin) spd = 3; if (PL.swim) spd = 3.6 * mag;
  if (PL.glide) spd = 9;
  if (PL.hold || PL.lock || PL.conduct) spd = 0;
  if (mag > 0.12 && !PL.lock && !PL.hold && !PL.conduct) PL.face = dampAng(PL.face, Math.atan2(wx, wz), PL.atk ? 4 : 14, dt);
  let vx, vz;
  if (PL.glide) { const gx = mag > 0.1 ? wx : Math.sin(PL.face), gz = mag > 0.1 ? wz : Math.cos(PL.face); vx = gx * spd; vz = gz * spd; }
  else { vx = wx * spd; vz = wz * spd; }
  PL.vel.x = damp(PL.vel.x, vx, PL.onGround || PL.swim ? 16 : 5, dt); PL.vel.z = damp(PL.vel.z, vz, PL.onGround || PL.swim ? 16 : 5, dt);
  // knockback
  PL.vel.x += PL.kb.x; PL.vel.z += PL.kb.z; PL.kb.x *= Math.exp(-8 * dt); PL.kb.z *= Math.exp(-8 * dt);
  const dx = PL.vel.x * dt, dz = PL.vel.z * dt;
  PL.blocked = false;
  if (!moveTry(PL.pos.x + dx, PL.pos.z + dz)) {
    if (!moveTry(PL.pos.x + dx, PL.pos.z)) { if (!moveTry(PL.pos.x, PL.pos.z + dz)) PL.blocked = true; }
  }
  PL.move = Math.hypot(PL.vel.x, PL.vel.z) / 7.2;
  PL.phase += Math.hypot(dx, dz) * 2.2;
  // vertical
  const g2 = groundH(PL.pos.x, PL.pos.z);
  if (PL.swim) {
    PL.pos.y = damp(PL.pos.y, -0.45 + waveH(PL.pos.x, PL.pos.z) * 0.6, 8, dt); PL.vy = 0; PL.onGround = false;
    if (g2 > -0.5) { PL.swim = false; }
  } else if (PL.onGround) {
    if (g2 < PL.pos.y - 0.7) { PL.onGround = false; PL.vy = 0; }
    else PL.pos.y = g2;
    if (g2 < -0.6 && PL.pos.y < -0.3) { PL.swim = true; }
  }
  if (!PL.onGround && !PL.swim) {
    PL.vy -= (PL.glide ? 6 : 30) * dt;
    if (PL.glide) PL.vy = Math.max(PL.vy, -1.5);
    PL.pos.y += PL.vy * dt;
    const surf = Math.max(g2, -0.45);
    if (PL.pos.y <= surf) {
      if (g2 >= -0.45) { PL.pos.y = g2; PL.onGround = true; if (PL.vy < -8) Audio2.sfx('land'); }
      else { PL.pos.y = -0.45; PL.swim = true; Audio2.sfx('splash'); FX.splash(PL.pos.x, PL.pos.z, 1.2); }
      PL.vy = 0; PL.glide = false;
    }
  }
  if (PL.onGround && g2 > 0.2 && !PL.swim) { PL.lastSafe = { x: PL.pos.x, z: PL.pos.z }; PL.island = islandAt(PL.pos.x, PL.pos.z); }
  // swimming too far → back to land
  if (PL.swim) {
    PL.swimT = (PL.swimT || 0) + dt;
    const I = islandAt(PL.pos.x, PL.pos.z);
    if (!I || PL.swimT > 25) { PL.swimT = 0; Hooks.lost && Hooks.lost(); }
  } else PL.swimT = 0;
  // magic
  if (PL.onGround || PL.swim) PL.magic = Math.min(1, PL.magic + dt * 0.35);
  if (PL.glide) { PL.magic -= dt * 0.2; if (PL.magic <= 0) { PL.magic = 0; PL.glide = false; } }
  if (PL.inv > 0) PL.inv -= dt;
  if (PL.comboT > 0) PL.comboT -= dt;
  if (PL.hurtT > 0) PL.hurtT -= dt;
  // combat timers
  if (PL.atk) { PL.atk.t += dt / 0.3; if (!PL.atk.hit && PL.atk.t > 0.3) { PL.atk.hit = true; swordHit(false); } if (PL.atk && PL.atk.t >= 1) { PL.atk = null; } }
  if (PL.spin) { PL.spin.t += dt / 0.55; PL.face += dt * 22; if (!PL.spin.hit && PL.spin.t > 0.2) { PL.spin.hit = true; swordHit(true); } if (PL.spin && PL.spin.t >= 1) PL.spin = null; }
  if (S.items.sword && ctl && !PL.swim && Input.btn.A && !PL.atk && !PL.spin && PL.chargeOK) { PL.chargeT += dt; if (PL.chargeT > 0.75 && !PL.chargeFx) { PL.chargeFx = true; Audio2.sfx('chime'); } }
  if (!Input.btn.A) { if (PL.chargeT > 0.75 && S.items.sword && !PL.spin) { PL.spin = { t: 0 }; Audio2.sfx('spin'); } PL.chargeT = 0; PL.chargeFx = false; PL.chargeOK = false; }
  // anim
  P.g.position.copy(PL.pos);
  P.g.rotation.y = PL.face;
  animFutan(P, {
    phase: PL.phase, move: PL.onGround ? clamp(PL.move, 0, 1) : 0, air: !PL.onGround && !PL.swim && !PL.glide, glide: PL.glide, swim: PL.swim,
    attack: PL.atk ? PL.atk.t : null, atkType: PL.atk ? PL.atk.type : 0, charge: PL.chargeT > 0.3, spin: PL.spin ? 1 : null,
    hold: PL.hold, conduct: PL.conduct, push: PL.push > 0.15, hurt: PL.hurtT > 0, talk: PL.talk,
  }, dt);
  P.g.visible = !(PL.inv > 0 && Math.floor(PL.inv * 16) % 2 === 0 && PL.inv < 1.1);
  const sg = Math.max(groundH(PL.pos.x, PL.pos.z), 0.02);
  P.shadow.position.set(PL.pos.x, sg + 0.04, PL.pos.z); P.shadow.visible = !PL.swim;
  const hdiff = PL.pos.y - sg; P.shadow.scale.setScalar(clamp(1.1 - hdiff * 0.08, 0.4, 1.1));
  if (PL.chargeT > 0.75 && Math.random() < 0.5) FX.spark(PL.pos.x + Math.sin(PL.face) * 0.6 + rnd(-.3, .3), PL.pos.y + 1 + rnd(-.3, .3), PL.pos.z + Math.cos(PL.face) * 0.6, 0xbff0ff);
}
function startAttack() {
  if (!S.items.sword || PL.swim || PL.atk || PL.spin) return false;
  // aim toward nearest enemy
  const t = Enemies.nearest(PL.pos, 4.5);
  if (t) PL.face = Math.atan2(t.pos.x - PL.pos.x, t.pos.z - PL.pos.z);
  PL.combo = (PL.comboT > 0 ? PL.combo + 1 : 0) % 3; PL.comboT = 0.6;
  PL.atk = { t: 0, type: PL.combo, hit: false }; PL.chargeOK = true;
  Audio2.sfx('swing'); return true;
}
function swordHit(spin) {
  const dmg = S.items.light ? 2 : 1;
  const fx = Math.sin(PL.face), fz = Math.cos(PL.face);
  const range = spin ? 3.0 : 2.3;
  const test = (x, z, extra = 0) => {
    const dx = x - PL.pos.x, dz = z - PL.pos.z, d = Math.hypot(dx, dz);
    if (d > range + extra) return false; if (spin) return true;
    return d < 0.8 || (dx * fx + dz * fz) / d > 0.15;
  };
  let any = false;
  any = Enemies.hit(test, dmg, PL.pos) || any;
  for (const g of Things.grass) if (g.alive && test(g.x, g.z)) { g.alive = false; g.g.visible = false; Audio2.sfx('cut'); FX.leaves(g.x, groundH(g.x, g.z) + 0.5, g.z); g.respawn = 40; if (Math.random() < 0.35) Pickups.drop(g.x, groundH(g.x, g.z) + 0.5, g.z, Math.random() < 0.3 && S.hp < S.maxHp ? 'heart' : 'g'); }
  for (const p of Things.pots) if (p.alive && test(p.x, p.z, 0.3)) { breakPot(p); any = true; }
  for (const d of Things.dummies) if (test(d.x, d.z, 0.3)) { d.wob = 1; d.hit++; Audio2.sfx('hit'); FX.spark(d.x, PL.pos.y + 1.2, d.z, 0xffe04a); Hooks.dummyHit && Hooks.dummyHit(d, spin); any = true; }
  Hooks.swordHit && Hooks.swordHit(test, dmg, spin);
  return any;
}
function breakPot(p) {
  p.alive = false; p.g.visible = false; p.col.on = false; Audio2.sfx('pot');
  const y = groundH(p.x, p.z) + 0.5; FX.shards(p.x, y, p.z, 0xc8763a);
  const r = Math.random(); Pickups.drop(p.x, y, p.z, r < 0.35 && S.hp < S.maxHp ? 'heart' : r < 0.55 ? 'b' : r < 0.95 ? 'g' : 'r');
  p.respawn = 60;
}
function gust() {
  if (PL.magic < 0.15) { Audio2.sfx('rock'); return; }
  PL.magic -= 0.15; Audio2.sfx('gust');
  const fx = Math.sin(PL.face), fz = Math.cos(PL.face);
  for (let i = 0; i < 14; i++) FX.puff(PL.pos.x + fx * (1 + i * 0.6) + rnd(-.5, .5), PL.pos.y + 1 + rnd(-.3, .5), PL.pos.z + fz * (1 + i * 0.6) + rnd(-.5, .5), 0.4 + i * 0.05, 0xffffff, fx * 8, fz * 8);
  for (const f of Things.fires) {
    if (!f.on) continue; const dx = f.x - PL.pos.x, dz = f.z - PL.pos.z, d = Math.hypot(dx, dz);
    if (d < 10 && (dx * fx + dz * fz) / d > 0.5) { f.on = false; f.col.on = false; Audio2.sfx('fireout'); for (let k = 0; k < 10; k++) FX.puff(f.x + rnd(-2, 2), groundH(f.x, f.z) + 1, f.z + rnd(-2, 2), 0.8, 0x8a8a90, 0, 0, 2); f.g.visible = false; Hooks.fireOut && Hooks.fireOut(f); }
  }
  Enemies.gust(PL.pos, fx, fz);
  for (const d of Things.dummies) { const dx = d.x - PL.pos.x, dz = d.z - PL.pos.z, dd = Math.hypot(dx, dz); if (dd < 8 && (dx * fx + dz * fz) / dd > 0.5) d.wob = 1.5; }
}
function playerHurt(dmg, fx, fz) {
  if (PL.inv > 0 || Story.cut) return;
  S.hp = Math.max(0, S.hp - dmg); PL.inv = 1.3; PL.hurtT = 0.35; Audio2.sfx('hurt');
  if (fx != null) { const dx = PL.pos.x - fx, dz = PL.pos.z - fz, d = Math.hypot(dx, dz) || 1; PL.kb.x = dx / d * 1.1; PL.kb.z = dz / d * 1.1; }
  if (PL.onGround && PL.mode === 'foot') { PL.vy = 5; PL.onGround = false; }
  PL.atk = null; PL.spin = null; PL.glide = false;
  HUD.hurt();
  if (S.hp <= 0) Hooks.dead && Hooks.dead();
}

// ---------------------------------------------------------------- boat
function boatUpdate(dt, ctl) {
  const P = BOAT.P;
  let mx = ctl ? Input.mx : 0, my = ctl ? Input.my : 0;
  const mag = Math.min(1, Math.hypot(mx, my));
  const b = camBasis();
  const wx = b.rx * mx + b.fx * my, wz = b.rz * mx + b.fz * my;
  if (BOAT.auto) { const a = BOAT.auto; const want = Math.atan2(a.x - BOAT.pos.x, a.z - BOAT.pos.z); BOAT.head = dampAng(BOAT.head, want, 2.5, dt); BOAT.sailWant = a.sail; }
  else if (mag > 0.25) { const want = Math.atan2(wx, wz); const d = angDiff(BOAT.head, want); BOAT.head += clamp(d, -1, 1) * 1.9 * dt * Math.min(1, mag * 1.4); BOAT.sailWant = Math.abs(d) < 2.4 ? 1 : 0.2; }
  else BOAT.sailWant = 0;
  BOAT.sail = damp(BOAT.sail, BOAT.sailWant, 3, dt);
  // wind factor
  const wa = Math.cos(angDiff(BOAT.head, World.wind.dir)); // 1 = tailwind
  const wf = (wa + 1) / 2;
  const top = (12 + 20 * wf) * (S.fastSail ? 1.25 : 1) * (BOAT.speedMul || 1);
  BOAT.speed = damp(BOAT.speed, BOAT.sail * top, BOAT.sail > BOAT.speed / top ? 0.7 : 1.2, dt);
  if (BOAT.bump > 0) BOAT.bump -= dt;
  const fx = Math.sin(BOAT.head), fz = Math.cos(BOAT.head);
  let nx = BOAT.pos.x + fx * BOAT.speed * dt, nz = BOAT.pos.z + fz * BOAT.speed * dt;
  // islands: stop at shallow water
  const bowH = groundH(nx + fx * 2.6, nz + fz * 2.6), midH = groundH(nx, nz);
  if (bowH > -1.1 || midH > -1.2) { BOAT.speed *= -0.25; nx = BOAT.pos.x; nz = BOAT.pos.z; if (BOAT.bump <= 0) { Audio2.sfx('land'); BOAT.bump = 0.5; } }
  else {
    const I = islandAt(nx, nz); const p = { x: nx, z: nz }; if (I && collide(I, p, 2.2, 0)) { BOAT.speed *= 0.5; } nx = p.x; nz = p.z;
  }
  // storm barrier
  if (Hooks.barrier) { const r = Hooks.barrier(nx, nz); if (r) { nx = r.x; nz = r.z; BOAT.speed *= 0.5; } }
  // world bounds
  const lim = 1150; if (Math.abs(nx) > lim || nz > 900 || nz < -1250) { nx = clamp(nx, -lim, lim); nz = clamp(nz, -1250, 900); BOAT.speed *= 0.5; Hooks.edge && Hooks.edge(); }
  BOAT.pos.x = nx; BOAT.pos.z = nz;
  // hop
  if (BOAT.hop) { BOAT.vy -= 30 * dt; BOAT.y += BOAT.vy * dt; if (BOAT.y <= 0) { BOAT.y = 0; BOAT.hop = false; Audio2.sfx('splash'); FX.splash(BOAT.pos.x, BOAT.pos.z, 2); } }
  const wy = waveH(BOAT.pos.x, BOAT.pos.z);
  BOAT.pos.y = wy * 0.8 + BOAT.y;
  P.g.position.copy(BOAT.pos);
  P.g.rotation.set(Math.sin(World.t * 1.3) * 0.04 - BOAT.speed * 0.002 + (BOAT.hop ? -0.15 : 0), BOAT.head, Math.sin(World.t * 1.1) * 0.05);
  // sail faces downwind-ish
  P.mast.rotation.y = clamp(angDiff(BOAT.head, World.wind.dir) * 0.35, -0.6, 0.6);
  animBoat(P, dt, BOAT.sail * (0.45 + 0.55 * wf), Story.talker === 'leon');
  // wake
  BOAT.wt -= dt;
  if (BOAT.speed > 3 && BOAT.wt <= 0 && BOAT.y < 0.5) {
    BOAT.wt = 0.035; const w = BOAT.wake[BOAT.wi++ % BOAT.wake.length], side = BOAT.wi % 2 ? 1 : -1;
    w.t = 0; w.m.visible = true; w.side = side; w.vx = fz * side * 1.6; w.vz = -fx * side * 1.6;
    w.m.position.set(BOAT.pos.x - fx * 2.2 + fz * side * 0.9, 0.45, BOAT.pos.z - fz * 2.2 - fx * side * 0.9); w.s = 0.22 + BOAT.speed / 110;
  }
  for (const w of BOAT.wake) {
    if (!w.m.visible) continue; w.t += dt; const k = w.t / 1.3; if (k >= 1) { w.m.visible = false; continue; }
    w.m.position.x += w.vx * dt; w.m.position.z += w.vz * dt;
    w.m.scale.set(w.s * (1 + k * 1.4), 1, w.s * (1 + k * 0.7)); w.m.material.opacity = 0.6 * (1 - k); w.m.position.y = 0.42 + waveH(w.m.position.x, w.m.position.z) * 0.8;
  }
  Audio2.setWind(clamp(BOAT.speed / 30, 0, 1));
  // player sits in boat
  if (PL.mode === 'boat') {
    const P2 = PL.P; const sx = -fx * 0.9, sz = -fz * 0.9;
    PL.pos.set(BOAT.pos.x + sx, BOAT.pos.y + 0.5, BOAT.pos.z + sz); PL.face = BOAT.head;
    P2.g.position.copy(PL.pos); P2.g.rotation.set(P.g.rotation.x, BOAT.head, P.g.rotation.z);
    animFutan(P2, { sit: !PL.conduct, conduct: PL.conduct, attack: PL.atk ? PL.atk.t : null, atkType: 1, talk: PL.talk }, dt);
    P2.shadow.visible = false;
    if (PL.atk) { PL.atk.t += dt / 0.3; if (!PL.atk.hit && PL.atk.t > 0.3) { PL.atk.hit = true; boatSwordHit(); } if (PL.atk && PL.atk.t >= 1) PL.atk = null; }
    if (PL.inv > 0) PL.inv -= dt;
    P2.g.visible = !(PL.inv > 0 && Math.floor(PL.inv * 16) % 2 === 0);
  }
}
function boatSwordHit() {
  const test = (x, z) => Math.hypot(x - BOAT.pos.x, z - BOAT.pos.z) < 5.5;
  Enemies.hit(test, S.items.light ? 2 : 1, BOAT.pos);
  Hooks.boatHit && Hooks.boatHit(test);
}
// find land to step off boat
function findLanding() {
  const fx = Math.sin(BOAT.head), fz = Math.cos(BOAT.head);
  let best = null, bd = 1e9;
  for (let a = -1.6; a <= 1.6; a += 0.2) {
    const dx = Math.sin(BOAT.head + a), dz = Math.cos(BOAT.head + a);
    for (let r = 2; r <= 9; r += 0.5) {
      const x = BOAT.pos.x + dx * r, z = BOAT.pos.z + dz * r, h = groundH(x, z);
      if (h > 0.25 && h < 3.2) { const I = islandAt(x, z); const p = { x, z }; if (!collide(I, p, 0.5, h)) { const sc = r + Math.abs(a) * 3; if (sc < bd) { bd = sc; best = { x, z }; } } break; }
    }
  }
  return best;
}

// ---------------------------------------------------------------- camera
function updateCamera(dt) {
  const dragging = Input.camDX !== 0 || Input.camDY !== 0;
  CAM.yaw -= Input.camDX * 0.006; CAM.pitch = clamp(CAM.pitch + Input.camDY * 0.004, 0.02, 1.15);
  if (dragging) CAM.manualT = 0; else CAM.manualT += dt;
  Input.camDX = Input.camDY = 0;
  if (CAM.mode === 'cut') {
    CAM.pos.lerp(CAM.cutPos, 1 - Math.exp(-CAM.cutK * dt)); CAM.look.lerp(CAM.cutLook, 1 - Math.exp(-CAM.cutK * dt));
    camera.position.copy(CAM.pos); camera.lookAt(CAM.look); return;
  }
  let tgt, dist, wantPitch = null;
  if (PL.mode === 'boat') {
    tgt = _tmp.set(BOAT.pos.x, BOAT.pos.y + 2.2, BOAT.pos.z); dist = 13 + BOAT.speed * 0.08;
    if (CAM.manualT > 1.5) CAM.yaw = dampAng(CAM.yaw, BOAT.head + Math.PI, 1.6, dt);
    if (CAM.manualT > 2.5) CAM.pitch = damp(CAM.pitch, 0.26, 1, dt);
  } else {
    tgt = _tmp.set(PL.pos.x, PL.pos.y + 1.4, PL.pos.z); dist = CAM.dist;
    if (PL.glide) dist = 9;
    const mag = Math.hypot(Input.mx, Input.my);
    if (CAM.manualT > 1.2 && mag > 0.3 && !Story.cut) {
      const behind = PL.face + Math.PI; const d = Math.abs(angDiff(CAM.yaw, behind));
      if (d < 2.3) CAM.yaw = dampAng(CAM.yaw, behind, 1.1 * mag, dt);
    }
    if (CAM.lockOn) { const t = CAM.lockOn; const a = Math.atan2(PL.pos.x - t.x, PL.pos.z - t.z); CAM.yaw = dampAng(CAM.yaw, a, 2.5, dt); dist = CAM.dist + 3; }
  }
  CAM.target.lerp(tgt, 1 - Math.exp(-10 * dt));
  if (CAM.target.distanceTo(tgt) > 30) CAM.target.copy(tgt);
  const cp = Math.cos(CAM.pitch), sp = Math.sin(CAM.pitch);
  let px = CAM.target.x + Math.sin(CAM.yaw) * cp * dist, pz = CAM.target.z + Math.cos(CAM.yaw) * cp * dist, py = CAM.target.y + sp * dist;
  // pull the camera in front of terrain / tall props between it and the target
  const I = islandAt(px, pz) || islandAt(CAM.target.x, CAM.target.z);
  let kk = 1;
  for (let i = 1; i <= 12; i++) {
    const k = i / 12, x = lerp(CAM.target.x, px, k), z = lerp(CAM.target.z, pz, k), y = lerp(CAM.target.y, py, k);
    let hit = groundH(x, z) > y - 0.5;
    if (!hit && I && k > 0.15) for (const c of I.cols) { if (c.tall && c.on && (x - c.x) ** 2 + (z - c.z) ** 2 < (c.r + c.tall * 0.5) ** 2) { hit = true; break; } }
    if (hit) { kk = Math.max(0.12, (i - 1) / 12); break; }
  }
  CAM.kk = Math.min(damp(CAM.kk == null ? 1 : CAM.kk, kk, 6, dt), kk + 0.08);
  px = lerp(CAM.target.x, px, CAM.kk); pz = lerp(CAM.target.z, pz, CAM.kk); py = lerp(CAM.target.y, py, CAM.kk);
  py = Math.max(py, groundH(px, pz) + 0.6, 0.9);
  CAM.pos.set(px, py, pz); CAM.look.copy(CAM.target);
  camera.position.copy(CAM.pos); camera.lookAt(CAM.target);
}
function camCut(px, py, pz, lx, ly, lz, k = 3, snap) {
  CAM.mode = 'cut'; CAM.cutPos.set(px, py, pz); CAM.cutLook.set(lx, ly, lz); CAM.cutK = k;
  if (snap) { CAM.pos.copy(CAM.cutPos); CAM.look.copy(CAM.cutLook); }
}
function camFollow() {
  CAM.mode = 'follow';
  const t = PL.mode === 'boat' ? BOAT.pos : PL.pos; CAM.target.set(t.x, t.y + 1.4, t.z);
  CAM.manualT = 9;
}
