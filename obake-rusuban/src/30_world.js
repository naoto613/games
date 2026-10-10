// ================================================================ world state, objects, perception
const VISIT_SECS = 300;            // one visit ≈ 5 minutes
const T0 = T(15, 30), T1 = T(17);  // after school → 5 o'clock chime
const World = {
  visit: 1, season: 1, k: 1, phase: 'title', time: T0, speed: 1, layout: 'A', doors: {}, flags: {},
  sus: 0, susCD: 0, search: null, caught: false, darkRoom: null, dts: 0, dtm: 0, rooms: [],
  doorOpen(id) { return this.doors[id] !== false; },
  setDoor(id, open, instant) { this.doors[id] = open; setDoorVisual(id, open, instant); rebuildLOS(); },
  hallLight() { },
};
const O = {};
const OBJ_ROOT = { 1: new THREE.Group(), 2: new THREE.Group() };
FG[1].add(OBJ_ROOT[1]); FG[2].add(OBJ_ROOT[2]);
const PICK_MAT = new THREE.MeshBasicMaterial({ visible: false });
function buildObjects(list) {
  for (const k in O) { const o = O[k]; o.g.parent && o.g.parent.remove(o.g); delete O[k]; }
  const dEq = World.season >= 3 ? 10 : 5; // old position functions: >=8 means the redecorated living room
  for (const id of list) {
    const def = OBJDEF[id]; if (!def) continue;
    const p = typeof def.pos === 'function' ? def.pos(dEq) : def.pos;
    const floor = def.floorFn ? def.floorFn(dEq) : (def.door ? DOORS[def.door].floor : 1);
    const o = { id, def, floor, st: def.st0 ? def.st0() : {}, home: new V3(p[0], p[1], p[2]), pos: new V3(p[0], p[1], p[2]), homeRy: p[3] || 0, ry: p[3] || 0, targetRy: p[3] || 0, target: null, poke: 0, possessed: false, cd: 0 };
    if (id === 'piano') o.st.cloth = false;
    o.room = def.room || roomAt(floor, p[0], p[2]);
    o.rooms = def.rooms ? def.rooms.filter(r => ROOMS[r]) : [o.room];
    o.g = def.model(o); o.g.position.copy(o.pos); o.g.rotation.y = o.ry;
    if (def.pick) {
      const pk = new THREE.Mesh(G.box(def.pick[0], def.pick[1], def.pick[2]), PICK_MAT);
      pk.position.y = def.pickY != null ? def.pickY : def.pick[1] / 2; pk.userData.obj = id; o.g.add(pk); o.pick = pk;
    }
    o.g.userData.obj = id;
    OBJ_ROOT[floor].add(o.g); O[id] = o;
    def.refresh && def.refresh(o);
  }
}
function objWorldPos(o, out = new V3()) { out.copy(o.pos); out.y += (o.def.pickY || 0.3); return FG[o.floor].localToWorld(out); }
function objRoomNow(o) { return o.def.door ? o.rooms[0] : roomAt(o.floor, o.pos.x, o.pos.z) || o.room; }
function objRooms(o) { return o.def.door ? o.rooms : [objRoomNow(o)]; }
function updateObjects(dt) {
  for (const o of Object.values(O)) {
    if (o.target) {
      const d = o.pos.distanceTo(o.target);
      if (d > 0.005) { const step = Math.min(d, dt * 1.6); o.poke += dt * 9; const k = (Math.sin(o.poke) > 0 ? 1.6 : 0.25); o.pos.lerp(o.target, Math.min(1, step * k / d)); } else o.pos.copy(o.target);
    }
    if (Math.abs(angDiff(o.ry, o.targetRy)) > 0.001) o.ry = dampAng(o.ry, o.targetRy, 5, dt);
    o.g.position.copy(o.pos); o.g.rotation.y = o.ry;
    if (o.wig > 0) { o.wig -= dt; o.g.rotation.z = Math.sin(o.wig * 30) * 0.06 * o.wig; } else if (o.id !== 'yukidaruma') o.g.rotation.z = 0;
    if (o.cd > 0) o.cd -= dt;
    o.def.tick && o.def.tick(o, dt);
  }
}
// ---- perception
function canSee(a, f, x, z, y = 0.5, range = 8, fovDeg) {
  if (!a.home || a.floor !== f || a.asleep) return false;
  const dx = x - a.pos.x, dz = z - a.pos.z, d = Math.hypot(dx, dz);
  if (d > range) return false;
  if (d > 0.6) { const fov = (fovDeg || a.fov || 120) * Math.PI / 360; if (Math.abs(angDiff(a.yaw, Math.atan2(dx, dz))) > fov) return false; }
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
function objOccluders() {
  for (let i = OCC.length - 1; i >= 0; i--) if (OCC[i].obj) OCC.splice(i, 1);
  for (const o of Object.values(O)) if (o.def.occ) {
    const [w, d, h] = o.def.occ; const rot = Math.abs(Math.sin(o.ry)) > 0.5;
    const ww = rot ? d : w, dd = rot ? w : d;
    OCC.push({ f: o.floor, x0: o.pos.x - ww / 2, z0: o.pos.z - dd / 2, x1: o.pos.x + ww / 2, z1: o.pos.z + dd / 2, h, obj: o.id });
  }
}
// how loud a sound from room s is in room r (0..1)
function heardVol(s, r) {
  if (!s || !r) return 0; if (s === r) return 1;
  for (const e of NAV[s] || []) if (e.to === r) { if (e.via === 'stairs') return 0.45; return DOORS[e.via] && !World.doorOpen(e.via) ? 0.25 : 0.6; }
  if (ROOM_BELOW[s] === r) return 0.5; if (ROOM_ABOVE[s] === r) return 0.3;
  return 0;
}
function flashAt(o) { const l = new THREE.PointLight(0xffffff, 4, 6); l.position.copy(o.pos); l.position.y += 0.3; FG[o.floor].add(l); setTimeout(() => FG[o.floor].remove(l), 140); }
const Robo = { start() { }, reset() { }, update() { }, running: false };
const Marbles = { start() { }, reset() { }, update() { } };
