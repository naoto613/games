// ================================================================ input
const IN = { mx: 0, my: 0, keys: new Set(), jumpE: false, actE: false, radioE: false, horn: false, run: false, brake: false, stick: { id: null, x0: 0, y0: 0, x: 0, y: 0 }, look: { id: null, lx: 0, ly: 0 }, touchUsed: false };
const KEYMAP = { KeyW: 'u', ArrowUp: 'u', KeyS: 'd', ArrowDown: 'd', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r' };
addEventListener('keydown', e => {
  if (e.repeat) { if (KEYMAP[e.code]) e.preventDefault(); return; }
  IN.keys.add(e.code);
  if (e.code === 'Space') { IN.jumpE = true; e.preventDefault(); }
  if (e.code === 'KeyF' || e.code === 'KeyE' || e.code === 'Enter') IN.actE = true;
  if (e.code === 'KeyR') IN.radioE = true;
  if (e.code === 'Escape' || e.code === 'KeyP') GAME.togglePause();
  if (KEYMAP[e.code]) e.preventDefault();
  AU.init();
});
addEventListener('keyup', e => IN.keys.delete(e.code));
addEventListener('blur', () => IN.keys.clear());
function readKeys() {
  const k = IN.keys; let x = 0, y = 0;
  for (const c of k) { const m = KEYMAP[c]; if (m === 'u') y += 1; if (m === 'd') y -= 1; if (m === 'l') x -= 1; if (m === 'r') x += 1; }
  return [clamp(x, -1, 1), clamp(y, -1, 1)];
}
// pointer: left half = joystick, right half = camera look; mouse drag anywhere = camera
canvas.addEventListener('pointerdown', e => {
  AU.init();
  if (!GAME.playing) return;
  if (e.pointerType === 'mouse') { IN.look.id = e.pointerId; IN.look.lx = e.clientX; IN.look.ly = e.clientY; canvas.setPointerCapture(e.pointerId); return; }
  IN.touchUsed = true;
  if (e.clientX < innerWidth * 0.5 && IN.stick.id === null) {
    const s = IN.stick; s.id = e.pointerId; s.x0 = e.clientX; s.y0 = e.clientY; s.x = s.y = 0;
    const b = $('#stickBase'), kn = $('#stickKnob'); b.classList.remove('hide'); kn.classList.remove('hide'); $('#stickHint').classList.add('hide');
    b.style.left = kn.style.left = e.clientX + 'px'; b.style.top = kn.style.top = e.clientY + 'px';
  } else if (IN.look.id === null) { IN.look.id = e.pointerId; IN.look.lx = e.clientX; IN.look.ly = e.clientY; }
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerId === IN.stick.id) {
    const s = IN.stick, R = 60; let dx = e.clientX - s.x0, dy = e.clientY - s.y0; const d = Math.hypot(dx, dy);
    if (d > R) { dx *= R / d; dy *= R / d; }
    s.x = dx / R; s.y = -dy / R;
    const kn = $('#stickKnob'); kn.style.left = (s.x0 + dx) + 'px'; kn.style.top = (s.y0 + dy) + 'px';
  } else if (e.pointerId === IN.look.id) {
    const dx = e.clientX - IN.look.lx, dy = e.clientY - IN.look.ly; IN.look.lx = e.clientX; IN.look.ly = e.clientY;
    CAM.yaw -= dx * 0.006; CAM.pitch = clamp(CAM.pitch + dy * 0.004, -0.15, 1.1); CAM.userT = 0;
  }
});
function endPtr(e) {
  if (e.pointerId === IN.stick.id) { IN.stick.id = null; IN.stick.x = IN.stick.y = 0; $('#stickBase').classList.add('hide'); $('#stickKnob').classList.add('hide'); }
  if (e.pointerId === IN.look.id) IN.look.id = null;
}
canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('wheel', e => { CAM.zoom = clamp(CAM.zoom * (e.deltaY > 0 ? 1.1 : 0.9), 0.6, 1.8); }, { passive: true });
function holdBtn(id, on, off) {
  const b = $(id);
  b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); AU.init(); b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch (_) { } on && on(); });
  const up = () => { b.classList.remove('on'); off && off(); };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
}
holdBtn('#bA', () => { IN.jumpE = true; IN.brake = true; }, () => { IN.brake = false; });
holdBtn('#bB', () => { IN.actE = true; });
holdBtn('#bC', () => { IN.horn = true; IN.hornE = true; }, () => { IN.horn = false; });
holdBtn('#bD', () => { IN.radioE = true; });
holdBtn('#bE', () => { IN.runT = !IN.runT; $('#bE').classList.toggle('pulse', IN.runT); });
$('#bPause').addEventListener('click', () => GAME.togglePause());

// ================================================================ kid model
function makeKid(girl) {
  const root = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xf1c9a5, roughness: 0.6 });
  const smock = new THREE.MeshStandardMaterial({ color: 0x86bfe6, roughness: 0.85 });
  const navy = new THREE.MeshStandardMaterial({ color: girl ? 0xd25a8a : 0x24304f, roughness: 0.85 });
  const hairM = new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: 0.55 });
  const hatM = new THREE.MeshStandardMaterial({ color: 0xf6d21a, roughness: 0.6 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const shoeM = new THREE.MeshStandardMaterial({ color: girl ? 0xe8455a : 0x2f6fd0, roughness: 0.5 });
  const black = new THREE.MeshBasicMaterial({ color: 0x1a1210 });
  const add = (p, geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  const body = new THREE.Group(); root.add(body);
  // torso / smock
  add(body, new THREE.CylinderGeometry(0.115, 0.17, 0.34, 18), smock, 0, 0.56, 0);
  add(body, new THREE.TorusGeometry(0.1, 0.022, 8, 18).rotateX(Math.PI / 2), white, 0, 0.73, 0.0);
  add(body, new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshStandardMaterial({ color: 0xe84a3a }), 0, 0.66, 0.13); // name tag
  if (girl) add(body, new THREE.CylinderGeometry(0.17, 0.2, 0.1, 18), navy, 0, 0.4, 0);
  else add(body, new THREE.CylinderGeometry(0.155, 0.16, 0.1, 18), navy, 0, 0.4, 0);
  // bag
  const bag = add(body, new THREE.BoxGeometry(0.05, 0.13, 0.15), hatM, 0.18, 0.45, 0.02);
  add(body, new THREE.TorusGeometry(0.2, 0.01, 4, 24, Math.PI).rotateZ(Math.PI * 0.62).rotateY(Math.PI / 2), hatM, 0.02, 0.6, 0.0);
  // head
  const head = new THREE.Group(); head.position.set(0, 0.88, 0); body.add(head);
  add(head, new THREE.SphereGeometry(0.15, 22, 18), skin, 0, 0, 0);
  const hair = add(head, new THREE.SphereGeometry(0.158, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.58), hairM, 0, 0.005, -0.012); hair.rotation.x = -0.35;
  if (girl) { add(head, new THREE.SphereGeometry(0.055, 12, 10), hairM, 0.16, -0.03, -0.04); add(head, new THREE.SphereGeometry(0.055, 12, 10), hairM, -0.16, -0.03, -0.04); add(head, new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshStandardMaterial({ color: 0xe84a6a }), 0.135, 0.01, -0.03); add(head, new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshStandardMaterial({ color: 0xe84a6a }), -0.135, 0.01, -0.03); }
  for (const s of [-1, 1]) {
    add(head, new THREE.SphereGeometry(0.022, 10, 8), black, s * 0.052, 0.01, 0.138);
    add(head, new THREE.SphereGeometry(0.007, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }), s * 0.052 + 0.006, 0.018, 0.157);
    const ch = add(head, new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshStandardMaterial({ color: 0xf29a9a, roughness: 0.7, transparent: true, opacity: 0.7 }), s * 0.085, -0.035, 0.12); ch.scale.set(1, 0.6, 0.4);
    add(head, new THREE.SphereGeometry(0.03, 8, 6), skin, s * 0.152, -0.005, 0); // ears
  }
  add(head, new THREE.TorusGeometry(0.022, 0.006, 6, 12, Math.PI).rotateZ(Math.PI), new THREE.MeshBasicMaterial({ color: 0x8a3a2a }), 0, -0.05, 0.142);
  // hat
  const hat = new THREE.Group(); hat.position.set(0, 0.06, -0.005); hat.rotation.x = -0.18; head.add(hat);
  add(hat, new THREE.SphereGeometry(0.166, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2), hatM, 0, 0, 0);
  add(hat, new THREE.CylinderGeometry(0.24, 0.24, 0.012, 26), hatM, 0, 0.0, 0);
  add(hat, new THREE.CylinderGeometry(0.167, 0.167, 0.03, 22, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, side: THREE.DoubleSide }), 0, 0.02, 0);
  // limbs
  const limb = (x, y, len, r, mat, endMat, endGeo) => {
    const piv = new THREE.Group(); piv.position.set(x, y, 0); body.add(piv);
    add(piv, new THREE.CapsuleGeometry(r, len, 4, 10).translate(0, -len / 2 - r * 0.5, 0), mat, 0, 0, 0);
    if (endGeo) add(piv, endGeo, endMat, 0, -len - r * 1.2, 0.02);
    return piv;
  };
  const legL = limb(0.065, 0.4, 0.24, 0.048, skin, shoeM, new THREE.BoxGeometry(0.085, 0.06, 0.15));
  const legR = limb(-0.065, 0.4, 0.24, 0.048, skin, shoeM, new THREE.BoxGeometry(0.085, 0.06, 0.15));
  for (const l of [legL, legR]) add(l, new THREE.CylinderGeometry(0.05, 0.05, 0.06, 10), white, 0, -0.27, 0);
  const armL = limb(0.15, 0.69, 0.18, 0.042, smock, skin, new THREE.SphereGeometry(0.042, 10, 8));
  const armR = limb(-0.15, 0.69, 0.18, 0.042, smock, skin, new THREE.SphereGeometry(0.042, 10, 8));
  armL.rotation.z = 0.15; armR.rotation.z = -0.15;
  root.userData = { body, head, legL, legR, armL, armR, bag };
  root.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
  scene.add(root);
  return root;
}

// ================================================================ player
let PLAYER = null;
const CAM = { yaw: 0, pitch: 0.3, dist: 4.5, zoom: 1, userT: 9, x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0, shake: 0, mode: 'foot', cine: null };
function initPlayer(girl, x, z, h) {
  if (PLAYER && PLAYER.model) scene.remove(PLAYER.model);
  PLAYER = { x, z, y: groundY(x, z), h, vx: 0, vz: 0, vy: 0, ground: true, veh: null, model: makeKid(girl), phase: 0, mode: 'foot', t: 0, exitReq: false, stepT: 0, girl };
  CAM.yaw = h; CAM.x = x - Math.sin(h) * 5; CAM.z = z - Math.cos(h) * 5; CAM.y = PLAYER.y + 3;
}
function nearestEnterable() {
  let best = null, bd = 2.2;
  for (const v of VEH) {
    if (v.locked) continue;
    if (Math.abs(v.x - PLAYER.x) > 8 || Math.abs(v.z - PLAYER.z) > 8) continue;
    const [fx, fz] = vAxes(v), lx = fz, lz = -fx, dx = PLAYER.x - v.x, dz = PLAYER.z - v.z;
    const a = clamp(dx * fx + dz * fz, -v.T.L / 2, v.T.L / 2), l = clamp(dx * lx + dz * lz, -v.T.W / 2, v.T.W / 2);
    const d = Math.hypot(dx - fx * a - lx * l, dz - fz * a - lz * l);
    if (d < bd) { bd = d; best = v; }
  }
  return best;
}
function enterVehicle(v) {
  if (v.ai === 'lane' && v.driver) {
    // the driver politely gets out
    const [fx, fz] = vAxes(v), lx = fz, lz = -fx;
    const px = v.x - lx * (v.T.W / 2 + 0.7), pz = v.z - lz * (v.T.W / 2 + 0.7);
    const p = spawnPed(px, pz, { state: 'wave', s: 1, face: PLAYER, home: 'wave', immune: false, temp: true, life: 25 });
    if (p) { bubble(pick(['どうぞ〜！', 'あんぜん うんてんでね！', 'はい、どうぞ！', 'いってらっしゃい！']), p, 2.2); }
  }
  v.ai = 'player'; v.driver = true; v.lane = null; v.vf = 0; v.vx *= 0.2; v.vz *= 0.2;
  PLAYER.veh = v; PLAYER.mode = 'drive';
  AU.door();
  GAME.onEnter(v);
}
function exitVehicle() {
  const v = PLAYER.veh; if (!v) return;
  const [fx, fz] = vAxes(v), lx = fz, lz = -fx;
  let placed = false;
  for (const side of [-1, 1, 0]) {
    const px = side ? v.x + side * lx * (v.T.W / 2 + 0.55) : v.x - fx * (v.T.L / 2 + 0.6), pz = side ? v.z + side * lz * (v.T.W / 2 + 0.55) : v.z - fz * (v.T.L / 2 + 0.6);
    if (!pointBlocked(px, pz, 0.3)) { PLAYER.x = px; PLAYER.z = pz; placed = true; break; }
  }
  if (!placed) { PLAYER.x = v.x - lx * (v.T.W / 2 + 0.6); PLAYER.z = v.z - lz * (v.T.W / 2 + 0.6); }
  PLAYER.y = groundY(PLAYER.x, PLAYER.z); PLAYER.vx = PLAYER.vz = PLAYER.vy = 0; PLAYER.h = v.h;
  v.ai = 'park'; v.driver = false; v.siren = false; v.parkT = 0;
  PLAYER.veh = null; PLAYER.mode = 'foot'; PLAYER.exitReq = false;
  AU.door(); AU.engine(false); AU.siren(null); AU.screech(0); AU.water(false);
  GAME.onExit(v);
}
function pointBlocked(x, z, r) {
  colQuery(x, z, r + 1, _cq);
  for (const o of _cq) {
    if (o.t === 'b') { if (o.h < 0.6) continue; if (x > o.x0 - r && x < o.x1 + r && z > o.z0 - r && z < o.z1 + r) return true; }
    else if (Math.hypot(x - o.x, z - o.z) < o.r + r && !o.prop) return true;
  }
  for (const v of VEH) { if (v === PLAYER.veh) continue; const [fx, fz] = vAxes(v); if (obbCircle(v.x, v.z, v.T.L / 2, v.T.W / 2, fx, fz, x, z, r)) return true; }
  return Math.abs(x) > EDGE - 0.6 || Math.abs(z) > EDGE - 0.6;
}

function updatePlayerFoot(dt) {
  const P_ = PLAYER;
  let [kx, ky] = readKeys();
  let mx = kx || IN.stick.x, my = ky || IN.stick.y;
  const mag = Math.min(1, Math.hypot(mx, my));
  const run = IN.keys.has('ShiftLeft') || IN.keys.has('ShiftRight') || IN.runT || (IN.stick.id !== null && mag > 0.9);
  const fwdx = Math.sin(CAM.yaw), fwdz = Math.cos(CAM.yaw), rx = -Math.cos(CAM.yaw), rz = Math.sin(CAM.yaw);
  let wx = fwdx * my + rx * mx, wz = fwdz * my + rz * mx;
  const wl = Math.hypot(wx, wz); if (wl > 1) { wx /= wl; wz /= wl; }
  const spd = (run ? 4.6 : 2.4) * (GAME.mission && GAME.mission.footSpeed || 1);
  const ax = wx * spd, az = wz * spd, k = P_.ground ? 12 : 3;
  P_.vx = damp(P_.vx, ax, k, dt); P_.vz = damp(P_.vz, az, k, dt);
  if (mag > 0.1) P_.h = lerpAng(P_.h, Math.atan2(wx, wz), 1 - Math.exp(-12 * dt));
  // jump
  if (IN.jumpE && P_.ground) { P_.vy = 4.4; P_.ground = false; AU.jump(); }
  P_.vy -= 13 * dt;
  P_.x += P_.vx * dt; P_.z += P_.vz * dt; P_.y += P_.vy * dt;
  // collide statics
  const r = 0.26;
  colQuery(P_.x, P_.z, 1.5, _cq);
  for (const o of _cq) {
    if (o.t === 'b') {
      if (o.h < P_.y + 0.3) continue;
      if (P_.x > o.x0 - r && P_.x < o.x1 + r && P_.z > o.z0 - r && P_.z < o.z1 + r) {
        const dl = P_.x - (o.x0 - r), dr = (o.x1 + r) - P_.x, du = P_.z - (o.z0 - r), dd = (o.z1 + r) - P_.z, m = Math.min(dl, dr, du, dd);
        if (m === dl) P_.x = o.x0 - r; else if (m === dr) P_.x = o.x1 + r; else if (m === du) P_.z = o.z0 - r; else P_.z = o.z1 + r;
      }
    } else {
      if (o.h < P_.y + 0.2) continue;
      const dx = P_.x - o.x, dz = P_.z - o.z, d = Math.hypot(dx, dz), m = o.r + r;
      if (d < m && d > 1e-4) {
        if (o.prop && Math.hypot(P_.vx, P_.vz) > 1) { nudgeProp(o.prop, P_.vx, P_.vz); }
        P_.x = o.x + dx / d * m; P_.z = o.z + dz / d * m;
      }
    }
  }
  for (const v of VEH) {
    if (Math.abs(v.x - P_.x) > 6 || Math.abs(v.z - P_.z) > 6) continue;
    if (P_.y > v.y + v.T.H) continue;
    const [fx, fz] = vAxes(v); const h = obbCircle(v.x, v.z, v.T.L / 2, v.T.W / 2, fx, fz, P_.x, P_.z, r);
    if (h) { P_.x -= h.nx * h.d; P_.z -= h.nz * h.d; }
  }
  for (const p of PEDS) {
    const dx = P_.x - p.x, dz = P_.z - p.z, d = Math.hypot(dx, dz), m = 0.25 * p.s + r;
    if (d < m && d > 1e-4 && p.state !== 'fall') { p.x -= dx / d * (m - d) * 0.5; p.z -= dz / d * (m - d) * 0.5; P_.x += dx / d * (m - d) * 0.5; P_.z += dz / d * (m - d) * 0.5; }
  }
  P_.x = clamp(P_.x, -EDGE + 0.6, EDGE - 0.6); P_.z = clamp(P_.z, -EDGE + 0.6, EDGE - 0.6);
  const g = groundY(P_.x, P_.z);
  if (P_.y <= g) { if (!P_.ground && P_.vy < -3) AU.step(); P_.y = g; P_.vy = 0; P_.ground = true; }
  else if (P_.y > g + 0.05) P_.ground = false;
  // animation
  const sp = Math.hypot(P_.vx, P_.vz);
  P_.phase += dt * sp * 4.6;
  P_.stepT -= dt * sp; if (P_.stepT < 0 && P_.ground && sp > 0.5) { P_.stepT = 0.9; AU.step(); }
  animateKid(sp, run, dt);
  const m = P_.model; m.visible = true;
  m.position.set(P_.x, P_.y, P_.z); m.rotation.set(0, P_.h, 0);
  // enter car
  const near = nearestEnterable();
  GAME.nearCar = near;
  if (IN.actE && near) enterVehicle(near);
}
function animateKid(sp, run, dt) {
  const u = PLAYER.model.userData, ph = PLAYER.phase, air = !PLAYER.ground;
  const amp = air ? 0.0 : Math.min(1, sp / 2.4) * (run ? 0.95 : 0.65);
  let lL = Math.sin(ph) * amp, lR = -Math.sin(ph) * amp;
  let aL = -Math.sin(ph) * amp * 1.1, aR = Math.sin(ph) * amp * 1.1;
  if (air) { lL = -0.6; lR = 0.3; aL = -2.6; aR = -2.4; }
  u.legL.rotation.x = damp(u.legL.rotation.x, lL, 20, dt); u.legR.rotation.x = damp(u.legR.rotation.x, lR, 20, dt);
  u.armL.rotation.x = damp(u.armL.rotation.x, aL, 20, dt); u.armR.rotation.x = damp(u.armR.rotation.x, aR, 20, dt);
  u.body.position.y = air ? 0 : Math.abs(Math.cos(ph)) * 0.035 * Math.min(1, sp);
  u.body.rotation.x = run && !air ? 0.12 * Math.min(1, sp / 4) : 0;
  u.head.rotation.y = 0; u.head.rotation.x = 0;
  if (sp < 0.2 && !air) { const t = performance.now() / 1000; u.body.position.y = Math.sin(t * 2) * 0.005; u.head.rotation.y = Math.sin(t * 0.7) * 0.25; }
}
function poseKidSeated(v) {
  const u = PLAYER.model.userData, T = v.T;
  u.legL.rotation.x = u.legR.rotation.x = -1.45; u.armL.rotation.x = u.armR.rotation.x = -1.2; u.body.position.y = 0; u.body.rotation.x = 0;
  u.head.rotation.y = clamp(-v.steer * 0.4, -0.4, 0.4);
  const m = PLAYER.model;
  _e.set(v.pitch, v.h, v.roll, 'YXZ'); _q.setFromEuler(_e);
  _vm.compose(_v.set(v.x, v.y, v.z), _q, _s.set(1, 1, 1));
  _tmp.makeTranslation(T.seatX, T.seatY - 0.6, T.seatZ);
  _wm.multiplyMatrices(_vm, _tmp);
  _wm.decompose(m.position, m.quaternion, m.scale);
}

// driving controls (kid friendly: stick points where you want to go)
function updatePlayerDrive(dt) {
  const v = PLAYER.veh;
  let [kx, ky] = readKeys();
  let thr = 0, steer = 0;
  const hb = IN.keys.has('Space') || IN.brake;
  if (kx || ky) { thr = ky; steer = kx; }
  else if (IN.stick.id !== null) {
    const sx = IN.stick.x, sy = IN.stick.y, mag = Math.min(1, Math.hypot(sx, sy));
    if (mag > 0.18) {
      const fwdx = Math.sin(CAM.yaw), fwdz = Math.cos(CAM.yaw), rx = -Math.cos(CAM.yaw), rz = Math.sin(CAM.yaw);
      const wx = fwdx * sy + rx * sx, wz = fwdz * sy + rz * sx, tgt = Math.atan2(wx, wz);
      const diff = angWrap(tgt - v.h);
      if (Math.abs(diff) < 2.1 || v.vf > 4) { thr = mag; steer = clamp(-diff * 1.6, -1, 1); if (Math.abs(diff) > 1.2) thr *= 0.6; }
      else { thr = -mag; const d2 = angWrap(tgt - (v.h + Math.PI)); steer = clamp(d2 * 1.6, -1, 1); }
    }
  }
  if (PLAYER.exitReq) { thr = v.vf > 0.5 ? -1 : v.vf < -0.5 ? 1 : 0; steer = 0; if (Math.abs(v.vf) < 1.5) { exitVehicle(); return; } }
  if (GAME.cine) { thr = 0; }
  const hit = driveVehicle(v, thr, steer, hb, dt);
  if (hit && hit.impact > 2) { AU.bump(hit.impact); CAM.shake = Math.min(1, hit.impact / 12); GAME.onCrash(hit); }
  PLAYER.x = v.x; PLAYER.z = v.z; PLAYER.y = v.y;
  PLAYER.model.visible = true;
  poseKidSeated(v);
  AU.engine(true, v.vf, v.T.maxV, Math.abs(thr), v.type);
  AU.screech(v.air ? 0 : clamp((v.slip - 2.5) / 5, 0, 1) + (hb && Math.abs(v.vf) > 5 ? 0.4 : 0));
  if (IN.actE) { if (Math.abs(v.vf) < 1.5) exitVehicle(); else PLAYER.exitReq = true; }
}

// ================================================================ camera
const _ray = new V3();
function updateCamera(dt) {
  CAM.userT += dt;
  const v = PLAYER.veh;
  let tx, ty, tz, dist, pitch0, follow;
  if (CAM.cine) {
    const c = CAM.cine; c.t += dt;
    const tgt = c.target;
    camera.position.set(lerp(camera.position.x, c.x, 1 - Math.exp(-3 * dt)), lerp(camera.position.y, c.y, 1 - Math.exp(-3 * dt)), lerp(camera.position.z, c.z, 1 - Math.exp(-3 * dt)));
    camera.lookAt(tgt.x, (tgt.y || 0) + 1, tgt.z);
    return;
  }
  if (v) {
    tx = v.x; ty = v.y + v.T.H * 0.75 + 0.5; tz = v.z;
    dist = (v.T.L * 1.15 + 3.6) * CAM.zoom; pitch0 = 0.2;
    const movingBack = v.vf < -2;
    follow = movingBack ? v.h + Math.PI * 0 : v.h;
    if (CAM.userT > 1.2) CAM.yaw = lerpAng(CAM.yaw, follow, 1 - Math.exp(-(Math.abs(v.vf) > 1.5 ? 2.2 + Math.abs(v.vf) * 0.05 : 0.9) * dt));
    if (CAM.userT > 1.2) CAM.pitch = damp(CAM.pitch, pitch0, 2, dt);
  } else {
    tx = PLAYER.x; ty = PLAYER.y + 0.85; tz = PLAYER.z;
    dist = 4.0 * CAM.zoom; pitch0 = 0.28;
    const sp = Math.hypot(PLAYER.vx, PLAYER.vz);
    if (CAM.userT > 1.6 && sp > 1) CAM.yaw = lerpAng(CAM.yaw, PLAYER.h, 1 - Math.exp(-1.2 * dt));
    if (CAM.userT > 1.6) CAM.pitch = damp(CAM.pitch, pitch0, 2, dt);
  }
  CAM.tx = damp(CAM.tx, tx, 14, dt); CAM.ty = damp(CAM.ty, ty, 8, dt); CAM.tz = damp(CAM.tz, tz, 14, dt);
  if (Math.hypot(CAM.tx - tx, CAM.tz - tz) > 10) { CAM.tx = tx; CAM.ty = ty; CAM.tz = tz; }
  const cp = Math.cos(CAM.pitch), sp_ = Math.sin(CAM.pitch);
  let dx = -Math.sin(CAM.yaw) * cp, dy = sp_, dz = -Math.cos(CAM.yaw) * cp;
  // collision: march along the ray
  let d = dist;
  for (let s = 0.6; s < dist; s += 0.5) {
    const x = CAM.tx + dx * s, y = CAM.ty + dy * s, z = CAM.tz + dz * s;
    colQuery(x, z, 0.3, _cq);
    let hit = false;
    for (const o of _cq) if (o.t === 'b' && y < o.h + 0.3 && x > o.x0 - 0.3 && x < o.x1 + 0.3 && z > o.z0 - 0.3 && z < o.z1 + 0.3 && o.h > 2) { hit = true; break; }
    if (hit) { d = Math.max(1.2, s - 0.4); break; }
  }
  CAM.d = CAM.d == null ? d : (d < CAM.d ? d : damp(CAM.d, d, 3, dt));
  let cx = CAM.tx + dx * CAM.d, cy = CAM.ty + dy * CAM.d, cz = CAM.tz + dz * CAM.d;
  cy = Math.max(cy, groundY(cx, cz) + 0.35);
  if (CAM.shake > 0) { CAM.shake = Math.max(0, CAM.shake - dt * 2.5); const s = CAM.shake * 0.25; cx += (Math.random() - 0.5) * s; cy += (Math.random() - 0.5) * s; cz += (Math.random() - 0.5) * s; }
  camera.position.set(cx, cy, cz);
  camera.lookAt(CAM.tx, CAM.ty + (v ? 0.2 : 0.15), CAM.tz);
  // speed fov
  const fov = 60 + (v ? clamp(Math.abs(v.vf) / v.T.maxV, 0, 1) * 10 : 0);
  if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = damp(camera.fov, fov, 3, dt); camera.updateProjectionMatrix(); }
}
