// ================================================================ particles
const FX = (() => {
  const pool = [], N = 160;
  const geoS = G.sph(1, 8, 6), geoO = new THREE.OctahedronGeometry(1, 0), geoB = G.box(1, 1, 1);
  for (let i = 0; i < N; i++) { const m = new THREE.Mesh(geoS, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false })); m.visible = false; scene.add(m); pool.push({ m, life: 0, max: 0 }); }
  let pi = 0;
  function emit(o) {
    const p = pool[pi++ % N]; Object.assign(p, { life: 0, max: o.max || 0.6, vx: o.vx || 0, vy: o.vy || 0, vz: o.vz || 0, g: o.g || 0, s0: o.s || 0.3, s1: o.s1 == null ? (o.s || 0.3) : o.s1, op: o.op == null ? 1 : o.op, spin: o.spin || 0, floor: o.floor });
    p.m.geometry = o.geo || geoS; p.m.material.color.setHex(o.c == null ? 0xffffff : o.c); p.m.material.opacity = p.op;
    p.m.position.set(o.x, o.y, o.z); p.m.scale.setScalar(p.s0); p.m.visible = true; p.m.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    return p;
  }
  function update(dt) {
    for (const p of pool) {
      if (!p.m.visible) continue; p.life += dt; const k = p.life / p.max;
      if (k >= 1) { p.m.visible = false; continue; }
      p.vy -= p.g * dt; p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt;
      if (p.floor != null && p.m.position.y < p.floor) { p.m.position.y = p.floor; p.vy *= -0.3; p.vx *= 0.6; p.vz *= 0.6; }
      p.m.scale.setScalar(lerp(p.s0, p.s1, k)); p.m.material.opacity = p.op * (k > 0.6 ? (1 - k) / 0.4 : 1);
      if (p.spin) { p.m.rotation.x += p.spin * dt; p.m.rotation.y += p.spin * dt; }
    }
  }
  return {
    update, emit,
    puff: (x, y, z, s = 0.5, c = 0xffffff, vx = 0, vz = 0, vy = 1) => emit({ x, y, z, s, s1: s * 2.2, c, vx: vx + rnd(-.6, .6), vy, vz: vz + rnd(-.6, .6), max: 0.7, op: 0.9 }),
    spark: (x, y, z, c = 0xffe04a) => emit({ x, y, z, s: 0.18, s1: 0.02, c, geo: geoO, vx: rnd(-2, 2), vy: rnd(1, 4), vz: rnd(-2, 2), max: 0.45, spin: 8 }),
    stars: (x, y, z, c = 0xffe04a, n = 10) => { for (let i = 0; i < n; i++) emit({ x, y, z, s: 0.22, s1: 0.04, c, geo: geoO, vx: rnd(-5, 5), vy: rnd(2, 7), vz: rnd(-5, 5), g: 10, max: 0.8, spin: 10 }); },
    splash: (x, z, s = 1) => { for (let i = 0; i < 14 * s; i++) { const a = Math.random() * TAU, v = rnd(2, 5) * s; emit({ x, y: 0.3, z, s: 0.25 * s, s1: 0.1, c: 0xffffff, vx: Math.cos(a) * v, vy: rnd(4, 8), vz: Math.sin(a) * v, g: 18, max: 0.8 }); } },
    shards: (x, y, z, c) => { for (let i = 0; i < 10; i++) emit({ x, y, z, s: 0.16, s1: 0.12, c, geo: geoB, vx: rnd(-4, 4), vy: rnd(3, 7), vz: rnd(-4, 4), g: 22, max: 0.9, spin: 10, floor: y - 0.4 }); },
    leaves: (x, y, z) => { for (let i = 0; i < 9; i++) emit({ x, y, z, s: 0.14, s1: 0.1, c: i % 2 ? 0x4cb83a : 0x7ad04a, geo: geoB, vx: rnd(-3, 3), vy: rnd(2, 5), vz: rnd(-3, 3), g: 6, max: 1, spin: 6 }); },
    pop: (x, y, z, c = 0xffffff, n = 10) => { for (let i = 0; i < n; i++) { const a = i / n * TAU; emit({ x, y, z, s: 0.5, s1: 1.2, c, vx: Math.cos(a) * 4, vy: rnd(0, 2), vz: Math.sin(a) * 4, max: 0.5, op: 0.9 }); } },
    smoke: (x, y, z, s = 1.2) => emit({ x: x + rnd(-1, 1), y, z: z + rnd(-1, 1), s, s1: s * 3, c: 0x8a8090, vx: rnd(-.5, .5) + Math.sin(World.wind.dir) * 1.5, vy: rnd(2.5, 4), vz: rnd(-.5, .5) + Math.cos(World.wind.dir) * 1.5, max: 3.5, op: 0.6 }),
  };
})();

// ================================================================ pickups
const Pickups = (() => {
  const list = [];
  const rupeeGeo = new THREE.OctahedronGeometry(1, 0);
  const COL = { g: 0x3ee05a, b: 0x3a8de8, r: 0xe2463a, y: 0xffd84a };
  const VAL = { g: 1, b: 5, r: 20, y: 50 };
  function heartMesh() {
    const g = new THREE.Group();
    for (const s of [-1, 1]) g.add(at(mk(G.sph(0.2, 10, 8), 0xff3a5a, 0.03), s * 0.16, 0.08, 0));
    const c = mk(G.cone(0.34, 0.45, 12), 0xff3a5a, 0.03); c.rotation.z = Math.PI; c.position.y = -0.18; g.add(c);
    return g;
  }
  function drop(x, y, z, kind) {
    let m;
    if (kind === 'heart') m = heartMesh();
    else { m = mk(rupeeGeo, COL[kind], 0.06); m.scale.set(0.24, 0.42, 0.24); }
    scene.add(m);
    const a = Math.random() * TAU;
    const o = { m, kind, x, y, z, vx: Math.cos(a) * 2, vy: 6, vz: Math.sin(a) * 2, t: 0, ground: false };
    list.push(o); return o;
  }
  function update(dt) {
    for (let i = list.length - 1; i >= 0; i--) {
      const o = list[i]; o.t += dt;
      if (!o.ground) {
        o.vy -= 20 * dt; o.x += o.vx * dt; o.z += o.vz * dt; o.y += o.vy * dt;
        const g = Math.max(groundH(o.x, o.z), -0.2) + 0.45;
        if (o.y < g) { o.y = g; if (o.vy < -3) o.vy *= -0.4; else { o.vy = 0; o.ground = true; } o.vx *= 0.5; o.vz *= 0.5; }
      }
      o.m.position.set(o.x, o.y + Math.sin(o.t * 3) * 0.08, o.z); o.m.rotation.y += dt * 3;
      o.m.visible = !(o.t > 12 && Math.floor(o.t * 8) % 2);
      const pp = PL.mode === 'boat' ? BOAT.pos : PL.pos;
      const d = Math.hypot(pp.x - o.x, (pp.y + 0.8) - o.y, pp.z - o.z);
      if (o.t > 0.35 && d < (PL.mode === 'boat' ? 3.5 : 1.3)) { collect(o); scene.remove(o.m); list.splice(i, 1); continue; }
      if (o.t > 15) { scene.remove(o.m); list.splice(i, 1); }
    }
  }
  function collect(o) {
    if (o.kind === 'heart') { S.hp = Math.min(S.maxHp, S.hp + 2); Audio2.sfx('heart'); }
    else { S.rupees = Math.min(999, S.rupees + VAL[o.kind]); Audio2.sfx(VAL[o.kind] >= 5 ? 'rupeeB' : 'rupee'); }
    HUD.dirty = true;
  }
  return { drop, update, list, rupeeGeo, COL, heartMesh };
})();

// ================================================================ enemies
const Enemies = (() => {
  const list = [], shots = [];
  const DEF = {
    chu: { hp: 2, r: 0.7, make: () => makeChu(), dmg: 1 },
    chuR: { hp: 3, r: 0.7, make: () => makeChu(0xe2463a), dmg: 1 },
    boko: { hp: 3, r: 0.55, make: () => makeBoko(), dmg: 1 },
    moblin: { hp: 6, r: 1.1, make: () => makeMoblin(), dmg: 2 },
    octo: { hp: 1, r: 1.3, make: () => makeOcto(), dmg: 1 },
  };
  function spawn(type, x, z, o = {}) {
    const d = DEF[type], P = d.make();
    scene.add(P.g);
    const e = Object.assign({ type, P, d, pos: new V3(x, groundH(x, z), z), home: { x, z }, face: Math.random() * TAU, hp: d.hp, state: 'idle', t: Math.random(), inv: 0, kb: { x: 0, z: 0 }, vy: 0, alive: true, tag: o.tag || '', stun: 0, leash: o.leash || 14, aggro: o.aggro || 10 }, o);
    if (type === 'octo') { e.pos.y = -3; e.state = 'under'; }
    list.push(e); return e;
  }
  function kill(e, quiet) {
    e.alive = false; scene.remove(e.P.g); if (e.P.shadow) e.P.shadow.visible = false;
    if (quiet) return;
    Audio2.sfx('die'); FX.pop(e.pos.x, e.pos.y + 0.8, e.pos.z, 0x2a2a3a, 12); FX.stars(e.pos.x, e.pos.y + 1, e.pos.z, 0xffffff, 6);
    S.kills++;
    const r = Math.random();
    if (e.type !== 'octo') Pickups.drop(e.pos.x, e.pos.y + 1, e.pos.z, r < 0.3 && S.hp < S.maxHp ? 'heart' : r < 0.6 ? 'g' : r < 0.9 ? 'b' : 'r');
    else Pickups.drop(e.pos.x, 0.6, e.pos.z, 'b');
    Hooks.enemyDead && Hooks.enemyDead(e);
  }
  function hit(test, dmg, from) {
    let any = false;
    for (const e of list) {
      if (!e.alive || e.inv > 0 || e.state === 'under') continue;
      if (!test(e.pos.x, e.pos.z, e.d.r)) continue;
      any = true; e.hp -= dmg; e.inv = 0.35; Audio2.sfx('hit');
      FX.stars(e.pos.x, e.pos.y + 1, e.pos.z, 0xffe04a, 5);
      const dx = e.pos.x - from.x, dz = e.pos.z - from.z, d = Math.hypot(dx, dz) || 1;
      const kbk = e.type === 'moblin' ? 0.35 : 0.9; e.kb.x = dx / d * kbk; e.kb.z = dz / d * kbk;
      e.state = 'hurt'; e.t = 0;
      if (e.hp <= 0) kill(e);
    }
    return any;
  }
  function nearest(p, r) { let best = null, bd = r; for (const e of list) { if (!e.alive || e.state === 'under') continue; const d = Math.hypot(e.pos.x - p.x, e.pos.z - p.z); if (d < bd) { bd = d; best = e; } } return best; }
  function pushOut(p, rad) { for (const e of list) { if (!e.alive || e.type === 'octo') continue; const dx = p.x - e.pos.x, dz = p.z - e.pos.z, rr = rad + e.d.r * 0.8, d = Math.hypot(dx, dz); if (d < rr && d > 0.001) { p.x = e.pos.x + dx / d * rr; p.z = e.pos.z + dz / d * rr; } } }
  function gust(p, fx, fz) {
    for (const e of list) {
      if (!e.alive) continue; const dx = e.pos.x - p.x, dz = e.pos.z - p.z, d = Math.hypot(dx, dz);
      if (d < 9 && (dx * fx + dz * fz) / d > 0.4) { e.kb.x = fx * 1.6; e.kb.z = fz * 1.6; e.stun = e.type === 'moblin' ? 0.8 : 2; e.state = 'hurt'; e.t = 0; }
    }
  }
  function count(tag) { return list.filter(e => e.alive && e.tag === tag).length; }
  function clear(tag) { for (const e of list) if (e.alive && (!tag || e.tag === tag)) kill(e, true); }
  function moveE(e, vx, vz, dt) {
    const nx = e.pos.x + vx * dt, nz = e.pos.z + vz * dt;
    const h = groundH(nx, nz), hc = e.pos.y;
    if (h < -0.3 || h - hc > 0.6 || hc - h > 1.6) return false;
    if (Math.hypot(nx - e.home.x, nz - e.home.z) > e.leash && Math.hypot(nx - e.home.x, nz - e.home.z) > Math.hypot(e.pos.x - e.home.x, e.pos.z - e.home.z)) return false;
    const p = { x: nx, z: nz }; collide(islandAt(nx, nz), p, e.d.r, h);
    // separate from other enemies
    for (const o of list) { if (o === e || !o.alive || o.type === 'octo') continue; const dx = p.x - o.pos.x, dz = p.z - o.pos.z, d = Math.hypot(dx, dz), rr = e.d.r + o.d.r; if (d < rr && d > 0.001) { p.x = o.pos.x + dx / d * rr; p.z = o.pos.z + dz / d * rr; } }
    e.pos.x = p.x; e.pos.z = p.z; return true;
  }
  function update(dt) {
    const pp = PL.pos, foot = PL.mode === 'foot', frozen = Story.cut;
    for (const e of list) {
      if (!e.alive) continue;
      e.t += dt; if (e.inv > 0) e.inv -= dt; if (e.stun > 0) e.stun -= dt;
      const dx = pp.x - e.pos.x, dz = pp.z - e.pos.z, dist = Math.hypot(dx, dz);
      const toP = Math.atan2(dx, dz);
      const near = foot && dist < e.aggro && Math.abs(pp.y - e.pos.y) < 3 && !frozen && !PL.dead;
      // knockback
      if (Math.abs(e.kb.x) + Math.abs(e.kb.z) > 0.01) { moveE(e, e.kb.x * 12, e.kb.z * 12, dt); e.kb.x *= Math.exp(-9 * dt); e.kb.z *= Math.exp(-9 * dt); }
      const P = e.P;
      if (e.type === 'chu' || e.type === 'chuR') {
        // hop
        if (e.state === 'hurt') { if (e.t > 0.4 && e.stun <= 0) e.state = 'idle'; }
        else if (e.vy === 0 && e.pos.y <= groundH(e.pos.x, e.pos.z) + 0.01 && e.t > (near ? 0.7 : 1.6)) {
          e.t = 0; e.vy = near ? 7 : 5; e.hopA = near ? toP : e.face + rnd(-1.2, 1.2);
          if (!near && Math.hypot(e.pos.x - e.home.x, e.pos.z - e.home.z) > 6) e.hopA = Math.atan2(e.home.x - e.pos.x, e.home.z - e.pos.z);
          e.face = e.hopA;
        }
        if (e.vy !== 0) {
          moveE(e, Math.sin(e.hopA) * (near ? 4.5 : 2), Math.cos(e.hopA) * (near ? 4.5 : 2), dt);
          e.vy -= 22 * dt; e.pos.y += e.vy * dt; const g = groundH(e.pos.x, e.pos.z);
          if (e.pos.y <= g) { e.pos.y = g; e.vy = 0; }
        } else e.pos.y = groundH(e.pos.x, e.pos.z);
        const sq = e.vy !== 0 ? 1 + clamp(e.vy * 0.05, -0.2, 0.25) : 1 - Math.max(0, 0.25 - e.t) * 1.2 + Math.sin(World.t * 6) * 0.04;
        P.b.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
        if (e.stun > 0) P.b.rotation.z = Math.sin(World.t * 20) * 0.2; else P.b.rotation.z = 0;
        if (near && dist < 1.2 && e.stun <= 0 && e.vy !== 0 && e.state !== 'hurt' && Math.abs(pp.y - e.pos.y) < 1.4) playerHurt(e.d.dmg, e.pos.x, e.pos.z);
      } else if (e.type === 'boko' || e.type === 'moblin') {
        const big = e.type === 'moblin', spd = big ? 2.6 : 3.6, reach = big ? 3.3 : 2.0, wind = big ? 0.75 : 0.5;
        e.pos.y = groundH(e.pos.x, e.pos.z);
        let walk = 0;
        if (e.state === 'hurt') { if (e.t > 0.45 && e.stun <= 0) { e.state = near ? 'chase' : 'idle'; e.t = 0; } }
        else if (e.state === 'idle') {
          if (near) { e.state = 'chase'; e.t = 0; if (!e.yelled) { e.yelled = true; Audio2.voice(big ? 140 : 320, 3); } }
          else { if (Math.hypot(e.pos.x - e.home.x, e.pos.z - e.home.z) > 2) { const a = Math.atan2(e.home.x - e.pos.x, e.home.z - e.pos.z); e.face = dampAng(e.face, a, 4, dt); moveE(e, Math.sin(a) * spd * 0.5, Math.cos(a) * spd * 0.5, dt); walk = 0.5; } else e.face += Math.sin(e.t) * dt * 0.5; }
        } else if (e.state === 'chase') {
          if (!near) { e.state = 'idle'; e.t = 0; }
          else {
            e.face = dampAng(e.face, toP, 6, dt);
            if (dist > reach * 0.85) { if (!moveE(e, Math.sin(e.face) * spd, Math.cos(e.face) * spd, dt)) walk = 0; else walk = 1; }
            else if (e.t > 0.6) { e.state = 'wind'; e.t = 0; }
          }
        } else if (e.state === 'wind') { e.face = dampAng(e.face, toP, 3, dt); if (e.t > wind) { e.state = 'swing'; e.t = 0; Audio2.sfx('swing'); } }
        else if (e.state === 'swing') {
          if (!e.hitDone && e.t > 0.1) {
            e.hitDone = true; const fx = Math.sin(e.face), fz = Math.cos(e.face);
            if (dist < reach + 0.6 && (dx * fx + dz * fz) / (dist || 1) > 0.2 && Math.abs(pp.y - e.pos.y) < 1.6) playerHurt(e.d.dmg, e.pos.x, e.pos.z);
          }
          if (e.t > 0.5) { e.state = 'chase'; e.t = 0; e.hitDone = false; }
        }
        // anim
        e.ph = (e.ph || 0) + dt * 9 * walk;
        P.legL.rotation.x = Math.sin(e.ph) * 0.6 * walk; P.legR.rotation.x = -Math.sin(e.ph) * 0.6 * walk;
        const armX = e.state === 'wind' ? -2.4 : e.state === 'swing' ? lerp(-2.4, 0.6, clamp(e.t / 0.15, 0, 1)) : -0.4 + Math.sin(e.ph) * 0.2;
        if (big) { P.arm.rotation.x = e.state === 'wind' ? -0.3 : e.state === 'swing' ? 0.5 : 0; P.arm.position.z = e.state === 'swing' ? 0.8 : e.state === 'wind' ? -0.5 : 0; }
        else P.arm.rotation.x = armX;
        P.body.rotation.z = e.stun > 0 ? Math.sin(World.t * 18) * 0.15 : 0;
        P.body.position.y = Math.abs(Math.sin(e.ph)) * 0.08;
        blinkEyes(P.eyes, World.t, e.home.x);
      } else if (e.type === 'octo') {
        const bp = BOAT.pos, bd = Math.hypot(bp.x - e.pos.x, bp.z - e.pos.z);
        const boatNear = PL.mode === 'boat' && bd < 55 && !frozen;
        if (e.state === 'under') { e.pos.y = damp(e.pos.y, -3, 3, dt); if (boatNear && e.t > 1) { e.state = 'up'; e.t = 0; FX.splash(e.pos.x, e.pos.z, 1.2); Audio2.sfx('splash'); } }
        else {
          e.pos.y = damp(e.pos.y, waveH(e.pos.x, e.pos.z) * 0.8 - 0.2, 4, dt);
          const a = Math.atan2(bp.x - e.pos.x, bp.z - e.pos.z); e.face = dampAng(e.face, a, 3, dt);
          if (!boatNear && e.t > 3) { e.state = 'under'; e.t = 0; }
          else if (e.t > 2.6) { e.t = 0; shoot(e, bp); }
          P.h.scale.y = 1.2 + Math.sin(World.t * 5) * 0.05 + (e.t > 2.3 ? 0.2 : 0);
        }
      }
      if (e.state === 'hurt' && e.type !== 'chu' && e.type !== 'chuR') { }
      P.g.position.copy(e.pos); P.g.rotation.y = e.face;
      const camD = Math.hypot(camera.position.x - e.pos.x, camera.position.z - e.pos.z);
      P.g.visible = camD < 220 && e.pos.y > -2.6 && !(e.inv > 0 && Math.floor(e.inv * 20) % 2);
      if (P.shadow) { P.shadow.visible = P.g.visible; P.shadow.position.set(e.pos.x, groundH(e.pos.x, e.pos.z) + 0.05, e.pos.z); }
    }
    // shots
    for (let i = shots.length - 1; i >= 0; i--) {
      const s = shots[i]; s.t += dt; s.vy -= 14 * dt;
      s.m.position.x += s.vx * dt; s.m.position.y += s.vy * dt; s.m.position.z += s.vz * dt; s.m.rotation.x += dt * 6;
      const tp = PL.mode === 'boat' ? BOAT.pos : PL.pos;
      if (Math.hypot(s.m.position.x - tp.x, s.m.position.y - (tp.y + 1), s.m.position.z - tp.z) < 2.0) { playerHurt(1, s.m.position.x, s.m.position.z); FX.shards(s.m.position.x, s.m.position.y, s.m.position.z, 0x8a8a8a); Audio2.sfx('rock'); scene.remove(s.m); shots.splice(i, 1); continue; }
      if (s.m.position.y < -0.3) { FX.splash(s.m.position.x, s.m.position.z, 0.6); scene.remove(s.m); shots.splice(i, 1); }
    }
    // gc
    for (let i = list.length - 1; i >= 0; i--) if (!list[i].alive) list.splice(i, 1);
  }
  function shoot(e, tgt) {
    const m = mk(G.sph(0.45, 10, 8), 0x8a8a8a, 0.04); scene.add(m);
    const fx = Math.sin(e.face), fz = Math.cos(e.face);
    m.position.set(e.pos.x + fx * 1.4, e.pos.y + 1, e.pos.z + fz * 1.4);
    // lead the target a bit
    const lead = PL.mode === 'boat' ? 0.9 : 0; const tx = tgt.x + Math.sin(BOAT.head) * BOAT.speed * lead, tz = tgt.z + Math.cos(BOAT.head) * BOAT.speed * lead;
    const d = Math.hypot(tx - m.position.x, tz - m.position.z), T = clamp(d / 22, 0.6, 2.2);
    shots.push({ m, vx: (tx - m.position.x) / T, vz: (tz - m.position.z) / T, vy: 14 * T / 2 + (1 - m.position.y) / T, t: 0 });
    Audio2.sfx('pop');
  }
  return { spawn, update, hit, nearest, pushOut, gust, count, clear, list, kill };
})();

// ================================================================ NPCs
const NPCs = [];
function addNPC(o) {
  const n = Object.assign({ face: 0, r: 2.8, voice: 300, visible: true, look: true }, o);
  n.pos = new V3(o.x, o.y != null ? o.y : groundH(o.x, o.z), o.z);
  scene.add(n.P.g); NPCs.push(n); n.P.g.position.copy(n.pos); n.P.g.rotation.y = n.face; return n;
}
function updateNPCs(dt) {
  for (const n of NPCs) {
    const far = Math.hypot(camera.position.x - n.pos.x, camera.position.z - n.pos.z) > (n.id === 'ruru' || n.id === 'jab' ? 400 : 160);
    n.P.g.visible = n.visible && !far; if (n.P.shadow) n.P.shadow.visible = n.visible && !far;
    if (!n.visible || far) continue;
    if (n.follow) { n.pos.copy(n.follow()); }
    else if (!n.fixedY) n.pos.y = groundH(n.pos.x, n.pos.z);
    n.P.g.position.copy(n.pos);
    const d = Math.hypot(PL.pos.x - n.pos.x, PL.pos.z - n.pos.z);
    if (n.look && d < 7 && PL.mode === 'foot') n.face = dampAng(n.face, Math.atan2(PL.pos.x - n.pos.x, PL.pos.z - n.pos.z), 4, dt);
    n.P.g.rotation.y = n.face;
    if (n.P.shadow) n.P.shadow.position.set(n.pos.x, n.pos.y + 0.05, n.pos.z);
    if (n.anim) n.anim(dt); else animVillager(n.P, dt, Story.talker === n.id);
  }
}
