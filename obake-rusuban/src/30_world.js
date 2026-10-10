// ================================================================ world state
const RATE_CHAIN = 0.6; // game minutes per real second at 1x
const RATE_PREP = 1.0;
const World = {
  day: 1, phase: 'title', time: T(10), speed: 1, layout: 'A',
  power: 3, powerMax: 3, flags: {}, events: [], evByKey: {}, heat: {}, doors: {},
  ghost: null, dts: 0, dtm: 0, goalDone: false, hiddenDone: false, maxDepth: 0, caught: false,
  doorOpen(id) { return this.doors[id] !== false; },
  setDoor(id, open, instant) {
    this.doors[id] = open; setDoorVisual(id, open, instant); rebuildLOS();
  },
  hallLight: null,
};
const O = {}; // runtime objects
const OBJ_ROOT = { 1: new THREE.Group(), 2: new THREE.Group() };
FG[1].add(OBJ_ROOT[1]); FG[2].add(OBJ_ROOT[2]);
const PICK_MAT = new THREE.MeshBasicMaterial({ visible: false });

function objAvail(def, day) { const d = def.days || [1, 99]; return day >= d[0] && day <= d[1]; }
function objPos(def, day) { const p = typeof def.pos === 'function' ? def.pos(day) : def.pos; return p; }
function buildObjects(day) {
  for (const k in O) { const o = O[k]; o.g.parent && o.g.parent.remove(o.g); delete O[k]; }
  for (const def of Object.values(OBJDEF)) {
    // structural objects exist always (sofa, kago); others by day
    const always = !def.host;
    if (!always && !objAvail(def, day)) continue;
    const p = objPos(def, day);
    const floor = def.floorFn ? def.floorFn(day) : (def.door ? DOORS[def.door].floor : 1);
    const o = { id: def.id, def, floor, st: def.st0 ? def.st0() : {}, cause: null, home: new V3(p[0], p[1], p[2]), pos: new V3(p[0], p[1], p[2]), homeRy: p[3] || 0, ry: p[3] || 0, targetRy: p[3] || 0, target: null, poke: 0, possessed: false };
    o.room = def.room || roomAt(floor, p[0], p[2]);
    o.rooms = def.rooms || [o.room];
    o.g = def.model(o); o.g.position.copy(o.pos); o.g.rotation.y = o.ry;
    if (def.pick) {
      const pk = new THREE.Mesh(G.box(def.pick[0], def.pick[1], def.pick[2]), PICK_MAT);
      pk.position.y = def.pickY != null ? def.pickY : def.pick[1] / 2; pk.userData.obj = o.id; o.g.add(pk); o.pick = pk;
      if (def.door) { pk.rotation.y = 0; }
    }
    o.g.userData.obj = o.id;
    OBJ_ROOT[floor].add(o.g);
    O[o.id] = o;
    def.refresh && def.refresh(o);
  }
  if (O.robo) Robo.reset();
}
function objWorldPos(o, out = new V3()) { out.copy(o.pos); out.y += (o.def.pickY || 0.3); return FG[o.floor].localToWorld(out); }
function objRoomNow(o) { return o.def.door ? o.rooms[0] : roomAt(o.floor, o.pos.x, o.pos.z) || o.room; }
// smooth / "poked toy" movement for objects
function updateObjects(dt) {
  for (const o of Object.values(O)) {
    if (o.target && !o.carried) {
      const d = o.pos.distanceTo(o.target);
      if (d > 0.005) {
        const step = Math.min(d, dt * 1.6);
        // jerky: move in little hops
        o.poke += dt * 9; const k = (Math.sin(o.poke) > 0 ? 1.6 : 0.25);
        o.pos.lerp(o.target, Math.min(1, step * k / d));
      } else o.pos.copy(o.target);
    }
    if (Math.abs(angDiff(o.ry, o.targetRy)) > 0.001) { o.ry = dampAng(o.ry, o.targetRy, 5, dt); }
    if (!o.carried) { o.g.position.copy(o.pos); o.g.rotation.y = o.ry; }
    // ghost wiggle when possessed / acted on
    if (o.wig > 0) { o.wig -= dt; o.g.rotation.z = Math.sin(o.wig * 30) * 0.06 * o.wig; } else if (!o.def.tickRotZ) o.g.rotation.z = 0;
    o.def.tick && o.def.tick(o, dt);
  }
}

// ---------------------------------------------------------------- events & chains
let EVID = 0;
function evPos(at) {
  if (!at) return null;
  if (at.isAgent) return { f: at.floor, x: at.pos.x, y: at.pos.y + at.H + 0.3, z: at.pos.z };
  if (at.def) return { f: at.floor, x: at.pos.x, y: at.pos.y + (at.def.pickY || 0.3) + 0.4, z: at.pos.z };
  return at;
}
// create an event (a chain link). parents: array of event ids (null ignored)
function ev(key, text, o = {}) {
  if (World.evByKey[key]) return World.evByKey[key].id;
  const parents = [...new Set((o.parents || []).filter(p => p != null && World.events[p]))];
  const depth = parents.length ? 1 + Math.max(...parents.map(p => World.events[p].depth)) : 1;
  const e = { id: EVID++, key, text, depth, parents, pos: evPos(o.at), t: World.time, who: o.who || null, root: !parents.length, player: !!o.player };
  World.events[e.id] = e; World.evByKey[key] = e;
  if (depth > World.maxDepth) {
    World.maxDepth = depth;
    if (depth === 5 && World.phase === 'chain') { Sound.sfx('gold'); UI.toast('大連鎖！ 5つ つながった！', 'gold'); }
  }
  if (World.phase === 'chain' || World.phase === 'prep') {
    if (!o.quiet) { UI.logEv(e); if (!e.player) Sound.sfx('chain', depth); }
    for (const p of parents) Chain.link(World.events[p], e);
    Chain.node(e);
  }
  Hooks.onEvent && Hooks.onEvent(e);
  return e.id;
}
function evDepth(id) { return id != null && World.events[id] ? World.events[id].depth : 0; }
function hasEv(key) { return !!World.evByKey[key]; }
function evId(key) { return World.evByKey[key] ? World.evByKey[key].id : null; }

// chain line visuals: dotted arcs between event positions (gold once 5+)
const Chain = (() => {
  const grp = new THREE.Group(); scene.add(grp);
  const dotTex = cTex(32, 32, (x) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(16, 16, 13, 0, TAU); x.fill(); });
  const lines = [], nodes = [];
  const wp = (p, out) => { out.set(p.x, p.y, p.z); return FG[p.f].localToWorld(out); };
  const A = new V3(), B = new V3(), C = new V3();
  function placeLine(L) {
    wp(L.a, A); wp(L.b, B);
    const d = A.distanceTo(B); C.addVectors(A, B).multiplyScalar(0.5); C.y += 0.8 + d * 0.18;
    const pa = L.geo.attributes.position;
    for (let i = 0; i < L.n; i++) { const t = i / (L.n - 1), u = 1 - t; pa.setXYZ(i, u * u * A.x + 2 * u * t * C.x + t * t * B.x, u * u * A.y + 2 * u * t * C.y + t * t * B.y, u * u * A.z + 2 * u * t * C.z + t * t * B.z); }
    pa.needsUpdate = true; L.geo.computeBoundingSphere();
  }
  return {
    grp,
    link(pe, ce) {
      if (!pe.pos || !ce.pos) return;
      const d = Math.hypot(pe.pos.x - ce.pos.x, pe.pos.z - ce.pos.z) + Math.abs(pe.pos.f - ce.pos.f) * 4;
      const n = Math.max(6, Math.round(d * 2.6));
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      const gold = ce.depth >= 5;
      const mat = new THREE.PointsMaterial({ map: dotTex, color: gold ? 0xffc83a : 0xffffff, size: gold ? 0.2 : 0.15, transparent: true, depthWrite: false, alphaTest: 0.2 });
      const pts = new THREE.Points(geo, mat); pts.renderOrder = 5; grp.add(pts);
      const L = { a: pe.pos, b: ce.pos, n, geo, mat, pts, t: 0, child: ce, parent: pe };
      placeLine(L); geo.setDrawRange(0, 0); lines.push(L);
      if (gold) this.goldify(ce);
    },
    goldify(e) { // walk ancestors and paint gold
      const seen = new Set(); const st = [e.id];
      while (st.length) { const id = st.pop(); if (seen.has(id)) continue; seen.add(id); for (const p of World.events[id].parents) st.push(p); }
      for (const L of lines) if (seen.has(L.child.id)) { L.mat.color.setHex(0xffc83a); L.mat.size = 0.2; }
      for (const n of nodes) if (seen.has(n.e.id)) n.el.classList.add('gold');
    },
    node(e) {
      if (!e.pos) return;
      const el = document.createElement('div'); el.className = 'cn' + (e.depth >= 5 ? ' gold' : ''); el.textContent = e.depth; $('#ov').appendChild(el);
      nodes.push({ e, el, t: 0 });
    },
    update(dt, moved) {
      for (const L of lines) { if (L.t < 1) { L.t = Math.min(1, L.t + dt * 1.4); L.geo.setDrawRange(0, Math.ceil(L.t * L.n)); } if (moved) placeLine(L); L.pts.visible = FG[L.a.f].visible && FG[L.b.f].visible; }
      for (const n of nodes) {
        n.t += dt; const p = n.e.pos; wp(p, A);
        const v = A.project(camera); const vis = FG[p.f].visible && v.z < 1;
        n.el.style.display = vis ? '' : 'none';
        if (vis) { n.el.style.left = ((v.x + 1) / 2 * VW) + 'px'; n.el.style.top = ((1 - v.y) / 2 * VH) + 'px'; n.el.style.opacity = n.t < 14 ? 1 : 0.45; }
      }
    },
    clear() { for (const L of lines) { grp.remove(L.pts); L.geo.dispose(); L.mat.dispose(); } lines.length = 0; for (const n of nodes) n.el.remove(); nodes.length = 0; },
    lines, nodes,
    replayPrep() { for (const L of lines) { L.t = 0; L.geo.setDrawRange(0, 0); } for (const n of nodes) n.el.style.visibility = 'hidden'; },
    replayStep(e) { for (const L of lines) if (L.child === e) L.t = 0.001; for (const n of nodes) if (n.e === e) n.el.style.visibility = ''; },
    showAll() { for (const n of nodes) n.el.style.visibility = ''; },
    hide() { grp.visible = false; for (const n of nodes) n.el.style.visibility = 'hidden'; },
    show() { grp.visible = true; },
  };
})();

// ---------------------------------------------------------------- perception
const _p1 = new V3();
// can agent a see local point (f,x,y,z)?
function canSee(a, f, x, z, y = 0.5, range = 8.5, fovDeg) {
  if (!a.home || a.floor !== f || a.asleep) return false;
  const dx = x - a.pos.x, dz = z - a.pos.z, d = Math.hypot(dx, dz);
  if (d > range) return false;
  if (d > 0.6) {
    const fov = (fovDeg || a.fov || 120) * Math.PI / 360;
    const ang = Math.atan2(dx, dz); if (Math.abs(angDiff(a.yaw, ang)) > fov) return false;
  }
  if (!losClear(f, a.pos.x, a.pos.z, x, z)) return false;
  for (const c of OCC) {
    if (c.f !== f || y >= c.h) continue;
    if (x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1) continue;
    if (a.pos.x >= c.x0 && a.pos.x <= c.x1 && a.pos.z >= c.z0 && a.pos.z <= c.z1) continue;
    if (segRect(a.pos.x, a.pos.z, x, z, c.x0, c.z0, c.x1, c.z1)) return false;
  }
  return true;
}
function canSeeObj(a, o, range, fov) { return canSee(a, o.floor, o.pos.x, o.pos.z, o.pos.y + 0.1, range, fov); }
// rebuild occluders from objects (sofa / fridge / wardrobe) + decor
function objOccluders() {
  for (let i = OCC.length - 1; i >= 0; i--) if (OCC[i].obj) OCC.splice(i, 1);
  for (const o of Object.values(O)) if (o.def.occ) {
    const [w, d, h] = o.def.occ; const rot = Math.abs(Math.sin(o.ry)) > 0.5;
    const ww = rot ? d : w, dd = rot ? w : d;
    OCC.push({ f: o.floor, x0: o.pos.x - ww / 2, z0: o.pos.z - dd / 2, x1: o.pos.x + ww / 2, z1: o.pos.z + dd / 2, h, obj: o.id });
  }
}

// sound propagation: returns loudness heard in room r from source room s
function heardVol(srcRoom, r, loud) {
  if (!srcRoom || !r) return 0;
  if (srcRoom === r) return loud;
  // direct door between?
  for (const e of NAV[srcRoom] || []) if (e.to === r) {
    if (e.via === 'stairs') return loud * 0.5;
    const op = DOORS[e.via] ? World.doorOpen(e.via) : true;
    return loud * (op ? 0.65 : 0.25);
  }
  if (ROOM_BELOW[srcRoom] === r) return loud * 0.55; // 2F noises fall to the room below
  if (ROOM_ABOVE[srcRoom] === r) return loud * 0.3;
  const h = roomHops(srcRoom, r, 2);
  if (h === 2) return loud * 0.3;
  // through a shared wall
  return 0;
}

// ---------------------------------------------------------------- helpers used by objects
const Robo = (() => {
  let run = false, path = [], t = 0;
  return {
    reset() { run = false; path = []; },
    start(dest) {
      const o = O.robo; if (!o) return; run = true; o.st.run = true;
      const rooms = ['living', 'kitchen', 'hall'].filter(r => !dest || r === dest);
      const r = dest || pick(rooms.filter(x => x !== objRoomNow(o)) || rooms);
      const pts = []; let cur = objRoomNow(o);
      const rp = roomPath(cur, r) || [];
      for (const e of rp) for (const p of e.pts) if (p.f === 1 && !p.stair) pts.push(new V3(p.x, 0, p.z));
      const c = roomCenter(r); pts.push(new V3(c.x + rnd(-1.5, 1.5), 0, c.z + rnd(-1, 1)));
      path = pts; t = 0;
    },
    get running() { return run; },
    update(dt) {
      const o = O.robo; if (!o || !run) return;
      if (!path.length) { run = false; o.st.run = false; return; }
      const p = path[0]; const d = Math.hypot(p.x - o.pos.x, p.z - o.pos.z);
      o.targetRy = Math.atan2(p.x - o.pos.x, p.z - o.pos.z);
      if (d < 0.1) { path.shift(); return; }
      const s = Math.min(d, dt * 1.4); o.pos.x += (p.x - o.pos.x) / d * s; o.pos.z += (p.z - o.pos.z) / d * s; o.target = o.pos.clone();
      t -= dt; if (t < 0) { t = 1.2; if (World.phase === 'chain') { Sound.sfx('robot'); World.noise(o.floor, objRoomNow(o), 0.35, 'robo', o); } }
      o.led.material.color.setHex(Math.sin(performance.now() * 0.01) > 0 ? 0x5ae08a : 0x2a8a4a);
    },
  };
})();
const Marbles = (() => {
  let m = null, t = 0;
  return {
    start(o) { m = { o, t: 0, pts: [] }; },
    update(dt) {
      if (!m) return; m.t += dt;
      const o = m.o;
      // marbles roll out of the door toward the stairs and down to 1F hall
      if (m.t < 1.5) { o.pos.lerp(new V3(-3.4, 0, -0.4), dt * 1.5); o.target = o.pos.clone(); }
      else if (!m.out) { m.out = 1; World.marblesFell = true; Hooks.marbles && Hooks.marbles(); m = null; }
    },
    reset() { m = null; },
  };
})();
function flashAt(o) {
  const p = o.pos.clone(); p.y += 0.3;
  const l = new THREE.PointLight(0xffffff, 4, 6); l.position.copy(p); FG[o.floor].add(l);
  setTimeout(() => FG[o.floor].remove(l), 140);
}
