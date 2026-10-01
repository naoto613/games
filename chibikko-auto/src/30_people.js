// ================================================================ pedestrians (instanced)
const PEDS = [];
const PED_MAX = 70;
const PI = {};
const SKINS = [0xe8c1a0, 0xd9a888, 0xc68d6a, 0xf0d0b4, 0xa86f4c];
const SHIRTS = [0xf4f4f2, 0x2b3f66, 0x7a1d1d, 0x3d5c3a, 0xd8c8a8, 0x6b6b70, 0xe0a030, 0x9fb8d8, 0xcc6688, 0x222222, 0x4a8ab0];
const PANTS = [0x22252b, 0x3a3f4a, 0x5a4a3a, 0x1f2f4f, 0x6b6b66, 0xa89a80];
const HAIRS = [0x15110e, 0x2a1c14, 0x4a3426, 0x8a8a88, 0x1c1612];
function buildPedMeshes() {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
  const mk = (name, geo, n, cast) => { const m = new THREE.InstancedMesh(geo, mat, n); m.count = 0; m.castShadow = cast !== false; m.receiveShadow = true; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3).fill(1), 3); scene.add(m); PI[name] = m; };
  mk('torso', new THREE.CapsuleGeometry(0.17, 0.3, 4, 12).scale(1.2, 1, 0.72), PED_MAX);
  mk('head', new THREE.SphereGeometry(0.12, 14, 12), PED_MAX);
  mk('hair', new THREE.SphereGeometry(0.128, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), PED_MAX);
  mk('leg', new THREE.CapsuleGeometry(0.072, 0.7, 4, 8).translate(0, -0.42, 0), PED_MAX * 2);
  mk('arm', new THREE.CapsuleGeometry(0.052, 0.5, 4, 8).translate(0, -0.3, 0), PED_MAX * 2);
  mk('hat', new GB().add(new THREE.SphereGeometry(0.14, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0, 0, 0)).add(new THREE.CylinderGeometry(0.2, 0.2, 0.015, 18), M(0, 0.005, 0)).build(), PED_MAX);
}
function spawnPed(x, z, opts) {
  if (PEDS.length >= PED_MAX) return null;
  const p = Object.assign({
    x, z, y: groundY(x, z), h: 0, s: 1, phase: RND() * 6, speed: rr(1.1, 1.6), state: 'walk', t: 0, stateT: 0, loop: null, dir: RND() < 0.5 ? 1 : -1,
    skin: pick(SKINS), shirt: pick(SHIRTS), pants: pick(PANTS), hair: pick(HAIRS), hat: false, vx: 0, vz: 0, pitch: 0, wave: 0, cheer: 0, onRoad: false, swing: 0
  }, opts || {});
  p.slot = PEDS.length;
  PEDS.push(p);
  setPedColors(p);
  return p;
}
function setPedColors(p) {
  const c = new THREE.Color();
  PI.torso.setColorAt(p.slot, c.setHex(p.shirt)); PI.head.setColorAt(p.slot, c.setHex(p.skin)); PI.hair.setColorAt(p.slot, c.setHex(p.hair)); PI.hat.setColorAt(p.slot, c.setHex(p.hatCol || 0xf6d21a));
  PI.leg.setColorAt(p.slot * 2, c.setHex(p.pants)); PI.leg.setColorAt(p.slot * 2 + 1, c.setHex(p.pants));
  PI.arm.setColorAt(p.slot * 2, c.setHex(p.armCol || p.shirt)); PI.arm.setColorAt(p.slot * 2 + 1, c.setHex(p.armCol || p.shirt));
  for (const k in PI) PI[k].instanceColor.needsUpdate = true;
}
function removePed(p) {
  const i = PEDS.indexOf(p); if (i < 0) return;
  PEDS.splice(i, 1);
  PEDS.forEach((q, k) => { if (q.slot !== k) { q.slot = k; setPedColors(q); } });
}
function loopPos(L, t) {
  const w = L.x1 - L.x0, d = L.z1 - L.z0, per = 2 * (w + d);
  t = ((t % per) + per) % per;
  if (t < w) return [L.x0 + t, L.z0, 1, 0];
  if (t < w + d) return [L.x1, L.z0 + t - w, 0, 1];
  if (t < 2 * w + d) return [L.x1 - (t - w - d), L.z1, -1, 0];
  return [L.x0, L.z1 - (t - 2 * w - d), 0, -1];
}
function populatePeds(n) {
  for (let k = 0; k < n; k++) {
    const L = pick(PED_LOOPS), w = L.x1 - L.x0, d = L.z1 - L.z0, t = RND() * 2 * (w + d);
    const lat = rr(-1.2, 1.2);
    const p = spawnPed(0, 0, { loop: L, t, lat, s: RND() < 0.15 ? 0.66 : rr(0.93, 1.06) });
    if (p.s < 0.8) { p.hat = RND() < 0.6; p.speed *= 0.8; }
    placeOnLoop(p); p.x = p.tx; p.z = p.tz; p.h = p.hd; p.y = groundY(p.x, p.z);
  }
}
function placeOnLoop(p) {
  const [x, z, dx, dz] = loopPos(p.loop, p.t);
  // lateral offset (towards inside of the block = left side when walking clockwise)
  const lx = dz, lz = -dx;
  p.tx = x + lx * p.lat; p.tz = z + lz * p.lat;
  p.hd = Math.atan2(dx * p.dir, dz * p.dir);
}

const _pm = new THREE.Matrix4(), _pl = new THREE.Matrix4(), _pr = new THREE.Matrix4();
function setPart(mesh, i, x, y, z, rx, rz, sc) {
  _e.set(rx || 0, 0, rz || 0, 'YXZ'); _q.setFromEuler(_e);
  _pl.compose(_v.set(x, y, z), _q, _s.set(sc || 1, sc || 1, sc || 1));
  _pr.multiplyMatrices(_pm, _pl); mesh.setMatrixAt(i, _pr);
}
const HIDE = new THREE.Matrix4().makeScale(0, 0, 0);
function renderPeds() {
  const cam = camera.position;
  for (const p of PEDS) {
    const i = p.slot;
    if (p.hidden || (p.x - cam.x) ** 2 + (p.z - cam.z) ** 2 > 150 * 150) {
      for (const k of ['torso', 'head', 'hair', 'hat']) PI[k].setMatrixAt(i, HIDE);
      for (const k of ['leg', 'arm']) { PI[k].setMatrixAt(i * 2, HIDE); PI[k].setMatrixAt(i * 2 + 1, HIDE); }
      continue;
    }
    _e.set(p.pitch, p.h, 0, 'YXZ'); _q.setFromEuler(_e);
    _pm.compose(_v.set(p.x, p.y, p.z), _q, _s.set(p.s, p.s, p.s));
    const sw = Math.sin(p.phase) * p.swing, bob = Math.abs(Math.cos(p.phase)) * 0.03 * Math.min(1, p.swing * 3);
    const cheer = p.cheer, wave = p.wave;
    setPart(PI.torso, i, 0, 1.17 + bob, 0);
    setPart(PI.head, i, 0, 1.6 + bob, 0);
    setPart(PI.hair, i, 0, 1.615 + bob, -0.01);
    if (p.hat) setPart(PI.hat, i, 0, 1.64 + bob, 0); else PI.hat.setMatrixAt(i, HIDE);
    setPart(PI.leg, i * 2, 0.1, 0.92 + bob, 0, sw);
    setPart(PI.leg, i * 2 + 1, -0.1, 0.92 + bob, 0, -sw);
    const aL = cheer ? -2.7 + Math.sin(p.phase * 3) * 0.3 : -sw * 0.9;
    const aR = cheer ? -2.7 - Math.sin(p.phase * 3) * 0.3 : wave ? -2.6 + Math.sin(p.phase * 4) * 0.4 : sw * 0.9;
    setPart(PI.arm, i * 2, 0.24, 1.4 + bob, 0, aL, cheer ? 0.3 : 0.08);
    setPart(PI.arm, i * 2 + 1, -0.24, 1.4 + bob, 0, aR, cheer || wave ? -0.3 : -0.08);
  }
  for (const k in PI) { PI[k].count = PEDS.length; PI[k].instanceMatrix.needsUpdate = true; }
  PI.leg.count = PI.arm.count = PEDS.length * 2;
}

function updatePeds(dt) {
  for (const p of PEDS) {
    p.stateT += dt;
    p.swing = 0; p.cheer = 0; p.wave = 0;
    const gy = groundY(p.x, p.z);
    if (p.state === 'walk' && p.loop) {
      p.t += p.speed * p.dir * dt;
      placeOnLoop(p);
      const dx = p.tx - p.x, dz = p.tz - p.z;
      p.x += clamp(dx, -3 * dt, 3 * dt); p.z += clamp(dz, -3 * dt, 3 * dt);
      p.h = lerpAng(p.h, p.hd, 1 - Math.exp(-8 * dt));
      p.swing = 0.55; p.phase += dt * p.speed * 4.2 / p.s;
      p.y = gy;
    } else if (p.state === 'goto') {
      const dx = p.gx - p.x, dz = p.gz - p.z, d = Math.hypot(dx, dz);
      if (d < 0.25) { p.state = p.after || 'idle'; p.stateT = 0; if (p.onArrive) { const f = p.onArrive; p.onArrive = null; f(p); } }
      else {
        const sp = p.runSpeed || p.speed;
        p.x += dx / d * Math.min(d, sp * dt); p.z += dz / d * Math.min(d, sp * dt);
        p.h = lerpAng(p.h, Math.atan2(dx, dz), 1 - Math.exp(-10 * dt));
        p.swing = sp > 2.5 ? 0.9 : 0.55; p.phase += dt * sp * 4.2 / p.s;
      }
      p.y = groundY(p.x, p.z);
    } else if (p.state === 'dodge') {
      p.x += p.vx * dt; p.z += p.vz * dt; p.vx *= Math.exp(-4 * dt); p.vz *= Math.exp(-4 * dt);
      p.y = gy + Math.max(0, Math.sin(Math.min(1, p.stateT / 0.5) * Math.PI) * 0.5);
      p.swing = 1.1; p.phase += dt * 14; p.cheer = 1;
      if (p.stateT > 0.8) { p.state = p.loop ? 'walk' : (p.home || 'idle'); p.stateT = 0; p.lat = clamp(p.lat + (RND() - 0.5), -1.4, 1.4); }
    } else if (p.state === 'fall') {
      p.x += p.vx * dt; p.z += p.vz * dt; p.vx *= Math.exp(-5 * dt); p.vz *= Math.exp(-5 * dt);
      p.pitch = damp(p.pitch, -Math.PI / 2, 12, dt); p.y = gy + 0.12;
      if (p.stateT > 2.2) { p.state = 'getup'; p.stateT = 0; }
    } else if (p.state === 'getup') {
      p.pitch = damp(p.pitch, 0, 6, dt); p.y = gy;
      if (p.stateT > 0.8) { p.pitch = 0; p.state = p.loop ? 'walk' : (p.home || 'idle'); p.stateT = 0; bubble(pick(['もー！', 'びっくりした〜', 'きをつけてね！']), p, 1.6); }
    } else {
      // idle / wave / cheer
      p.y = gy;
      if (p.state === 'wave') { p.wave = 1; p.phase += dt * 2; }
      if (p.state === 'cheer') { p.cheer = 1; p.phase += dt * 3; p.y = gy + Math.abs(Math.sin(p.stateT * 7)) * 0.25; }
      if (p.face) p.h = lerpAng(p.h, Math.atan2(p.face.x - p.x, p.face.z - p.z), 1 - Math.exp(-5 * dt));
    }
    p.onRoad = !onRaised(p.x, p.z);
    if (p.state !== 'fall' && p.state !== 'getup') pedThreat(p);
  }
}
function lerpAng(a, b, t) { return a + angWrap(b - a) * t; }
function pedThreat(p) {
  if (p.immune) return;
  for (const v of VEH) {
    const sp = Math.hypot(v.vx, v.vz);
    if (sp < 3.5) continue;
    const dx = p.x - v.x, dz = p.z - v.z;
    if (dx * dx + dz * dz > 225) continue;
    const ux = v.vx / sp, uz = v.vz / sp, along = dx * ux + dz * uz, lat = dx * uz - dz * ux;
    // actual hit
    const fx = Math.sin(v.h), fz = Math.cos(v.h);
    if (obbCircle(v.x, v.z, v.T.L / 2, v.T.W / 2, fx, fz, p.x, p.z, 0.3 * p.s) && Math.abs(v.y - p.y) < 1.5) {
      p.state = 'fall'; p.stateT = 0;
      const side = lat >= 0 ? 1 : -1;
      p.vx = v.vx * 0.5 + uz * side * 3; p.vz = v.vz * 0.5 - ux * side * 3;
      bubble(pick(['わぁっ！', 'ころりん！', 'いたた…']), p, 1.4);
      if (v.ai === 'player') GAME.onPedHit(p);
      AU.boing();
      return;
    }
    if (along > 0 && along < sp * 1.1 + 3 && Math.abs(lat) < v.T.W / 2 + 1.4 && p.state !== 'dodge') {
      p.state = 'dodge'; p.stateT = 0;
      const side = lat >= 0 ? 1 : -1;
      p.vx = uz * side * 6; p.vz = -ux * side * 6;
      if (RND() < 0.6) bubble(pick(['わっ！', 'あぶない！', 'きゃー！', 'おっとっと！']), p, 1.2);
      if (v.ai === 'player') GAME.onPedDodge(p);
      return;
    }
  }
}

// ================================================================ speech bubbles (DOM)
const BUBS = [];
function bubble(text, target, dur, cls) {
  let b = BUBS.find(o => o.t <= 0);
  if (!b) { if (BUBS.length > 10) return; const el = document.createElement('div'); el.className = 'bub'; $('#bubs').appendChild(el); b = { el, t: 0 }; BUBS.push(b); }
  b.el.textContent = text; b.target = target; b.t = dur || 2; b.h = target.bubH || (target.T ? target.T.H + 0.6 : (target.s || 1) * 1.9);
  b.el.style.opacity = '1';
}
const _bp = new V3();
function updateBubbles(dt) {
  for (const b of BUBS) {
    if (b.t <= 0) continue;
    b.t -= dt;
    if (b.t <= 0) { b.el.style.opacity = '0'; continue; }
    _bp.set(b.target.x, (b.target.y || 0) + b.h, b.target.z).project(camera);
    if (_bp.z > 1 || Math.abs(_bp.x) > 1.2 || Math.abs(_bp.y) > 1.2) { b.el.style.opacity = '0'; continue; }
    b.el.style.opacity = b.t < 0.3 ? String(b.t / 0.3) : '1';
    b.el.style.left = ((_bp.x * 0.5 + 0.5) * innerWidth) + 'px';
    b.el.style.top = ((-_bp.y * 0.5 + 0.5) * innerHeight) + 'px';
  }
}

// ================================================================ kittens
function makeKitten(colr) {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: colr, roughness: 0.9 }), w = new THREE.MeshStandardMaterial({ color: 0xf6f2ea, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.2, 4, 10).rotateX(Math.PI / 2), m); body.position.y = 0.16;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 10), m); head.position.set(0, 0.27, 0.17);
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), w); muzzle.position.set(0, 0.25, 0.25); muzzle.scale.set(1, 0.7, 0.7);
  const e1 = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), m); e1.position.set(0.055, 0.36, 0.16); e1.rotation.z = -0.3;
  const e2 = e1.clone(); e2.position.x = -0.055; e2.rotation.z = 0.3;
  const eyeM = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const ey1 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), eyeM); ey1.position.set(0.035, 0.29, 0.255); const ey2 = ey1.clone(); ey2.position.x = -0.035;
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.26, 6), m); tail.position.set(0, 0.28, -0.2); tail.rotation.x = -0.6;
  const legs = [];
  for (const [x, z] of [[0.05, 0.1], [-0.05, 0.1], [0.05, -0.1], [-0.05, -0.1]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 6), m); l.position.set(x, 0.06, z); g.add(l); legs.push(l); }
  g.add(body, head, muzzle, e1, e2, ey1, ey2, tail);
  g.traverse(o => { o.castShadow = true; });
  g.userData = { tail, legs };
  scene.add(g);
  return g;
}
