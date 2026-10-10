// ================================================================ house: floor plan, walls, doors, nav
// Coordinates are local to each floor group. x: left(-) / right(+), z: back(-) / front(+).
const FLOOR_Y = { 1: 0, 2: 3.0 };
const WALL_H = 2.6;
const ROOMS = {
  living: { name: 'リビング', floor: 1, rects: [[-8, 0, 0, 5.5]], tex: 'plank', col: '#d8a874' },
  kitchen: { name: 'だいどころ', floor: 1, rects: [[0, 0, 8, 5.5]], tex: 'tile' },
  hall: { name: 'ろうか', floor: 1, rects: [[-8, -5.5, 0, 0]], tex: 'plank', col: '#c08c5a' },
  washitsu: { name: '和室', floor: 1, rects: [[0, -5.5, 8, 0]], tex: 'tatami' },
  engawa: { name: 'えんがわ', floor: 1, rects: [[8, -5.5, 9.6, 0]], tex: 'plank', col: '#c49866', outdoor: 1 },
  shed: { name: 'ものおき', floor: 1, rects: [[13.6, -5.3, 17.6, -1.6]], tex: 'plank', col: '#9a8064' },
  garden: { name: 'にわ', floor: 1, rects: [[9.6, -5.5, 18, 5.5], [8, 0, 9.6, 5.5]], tex: 'grass', outdoor: 1 },
  kodomo: { name: 'そうたの へや', floor: 2, rects: [[-8, 0, 0, 5.5]], tex: 'plank', col: '#dcb084' },
  shinshitsu: { name: 'しんしつ', floor: 2, rects: [[0, 0, 8, 5.5]], tex: 'plank', col: '#c89a6c' },
  hall2: { name: '2かい ろうか', floor: 2, rects: [[-8, -5.5, 0, 0]], tex: 'plank', col: '#c08c5a' },
  akari: { name: 'あかりの へや', floor: 2, rects: [[0, -5.5, 8, 0]], tex: 'plank', col: '#e0b890' },
};
const ROOM_IDS = Object.keys(ROOMS);
function roomAt(floor, x, z) {
  // shed first (inside garden)
  for (const id of ROOM_IDS) {
    const r = ROOMS[id]; if (r.floor !== floor) continue;
    for (const q of r.rects) if (x >= q[0] && x <= q[2] && z >= q[1] && z <= q[3]) return id;
  }
  return null;
}
function roomCenter(id) { const q = ROOMS[id].rects[0]; return { x: (q[0] + q[2]) / 2, z: (q[1] + q[3]) / 2 }; }
// rooms directly above/below each other
const ROOM_ABOVE = { living: 'kodomo', kitchen: 'shinshitsu', hall: 'hall2', washitsu: 'akari' };
const ROOM_BELOW = { kodomo: 'living', shinshitsu: 'kitchen', hall2: 'hall', akari: 'washitsu' };

// ---------------------------------------------------------------- doors (closable openings) and open links
// axis 'z': wall runs along x at z=c ; axis 'x': wall runs along z at x=c
const DOORS = {
  d_lk: { name: 'リビングの ドア', floor: 1, axis: 'x', c: 0, a: 2.0, b: 3.2, rooms: ['living', 'kitchen'], kind: 'door' },
  d_lh: { name: 'ろうかの ドア', floor: 1, axis: 'z', c: 0, a: -4.0, b: -2.8, rooms: ['hall', 'living'], kind: 'door' },
  d_hw: { name: '和室の ふすま', floor: 1, axis: 'x', c: 0, a: -3.0, b: -1.8, rooms: ['hall', 'washitsu'], kind: 'fusuma' },
  d_kw: { name: 'だいどころの ふすま', floor: 1, axis: 'z', c: 0, a: 0.5, b: 1.7, rooms: ['washitsu', 'kitchen'], kind: 'fusuma' },
  d_kg: { name: 'かってぐち', floor: 1, axis: 'x', c: 8, a: 1.2, b: 2.2, rooms: ['kitchen', 'garden'], kind: 'door' },
  d_we: { name: 'えんがわの ガラス戸', floor: 1, axis: 'x', c: 8, a: -5.2, b: -0.4, rooms: ['washitsu', 'engawa'], kind: 'open' },
  d_eg: { name: '', floor: 1, axis: 'x', c: 9.6, a: -5.5, b: 0, rooms: ['engawa', 'garden'], kind: 'open', noWall: 1 },
  d_sh: { name: 'ものおきの と', floor: 1, axis: 'z', c: -1.6, a: 15.0, b: 16.2, rooms: ['shed', 'garden'], kind: 'door' },
  d_ent: { name: 'げんかん', floor: 1, axis: 'x', c: -8, a: -3.4, b: -2.2, rooms: ['hall', 'outside'], kind: 'door', ext: 1 },
  d_2k: { name: 'そうたの へやの ドア', floor: 2, axis: 'z', c: 0, a: -4.0, b: -2.8, rooms: ['hall2', 'kodomo'], kind: 'door' },
  d_2a: { name: 'あかりの へやの ドア', floor: 2, axis: 'x', c: 0, a: -3.0, b: -1.8, rooms: ['hall2', 'akari'], kind: 'door' },
  d_2s: { name: 'しんしつの ふすま', floor: 2, axis: 'x', c: 0, a: 2.0, b: 3.2, rooms: ['kodomo', 'shinshitsu'], kind: 'fusuma' },
};
// stairs link (hall <-> hall2)
const STAIRS = { x0: -7.0, x1: -1.4, z0: -5.45, z1: -4.25, zc: -4.85, bottom: { x: -0.7, z: -4.85 }, top: { x: -7.5, z: -4.85 } };

// walls: {floor, axis, c, a0, a1, n: outward normal for outer walls (null interior), ops:[{a,b,kind,door}] }
const WALLS = [];
function wall(floor, axis, c, a0, a1, n, ops = [], h = WALL_H, mat) { WALLS.push({ floor, axis, c, a0, a1, n, ops, h, mat }); }
function buildWallData() {
  WALLS.length = 0;
  const dop = f => Object.entries(DOORS).filter(([k, d]) => d.floor === f && !d.noWall).map(([k, d]) => ({ id: k, d }));
  const opsFor = (f, axis, c) => dop(f).filter(o => o.d.axis === axis && o.d.c === c).map(o => ({ a: o.d.a, b: o.d.b, kind: o.d.kind, door: o.id }));
  // ---- floor 1
  wall(1, 'z', 5.5, -8, 8, [0, 1], [{ a: -6.5, b: -4.5, kind: 'window' }, { a: 4, b: 6, kind: 'window' }]);
  wall(1, 'z', -5.5, -8, 8, [0, -1], [{ a: 4.6, b: 6.2, kind: 'window' }]);
  wall(1, 'x', -8, -5.5, 5.5, [-1, 0], opsFor(1, 'x', -8).concat([{ a: 3.7, b: 5.1, kind: 'window' }]));
  wall(1, 'x', 8, -5.5, 5.5, [1, 0], opsFor(1, 'x', 8).concat([{ a: 3.2, b: 4.8, kind: 'window' }]));
  wall(1, 'x', 0, -5.5, 5.5, null, opsFor(1, 'x', 0));
  wall(1, 'z', 0, -8, 8, null, opsFor(1, 'z', 0));
  // shed
  wall(1, 'z', -5.3, 13.6, 17.6, [0, -1], [], 2.2, 'shed');
  wall(1, 'z', -1.6, 13.6, 17.6, [0, 1], opsFor(1, 'z', -1.6), 2.2, 'shed');
  wall(1, 'x', 13.6, -5.3, -1.6, [-1, 0], [{ a: -4.2, b: -3.2, kind: 'window' }], 2.2, 'shed');
  wall(1, 'x', 17.6, -5.3, -1.6, [1, 0], [], 2.2, 'shed');
  // ---- floor 2
  wall(2, 'z', 5.5, -8, 8, [0, 1], [{ a: -6, b: -4, kind: 'window' }, { a: 3.5, b: 5.5, kind: 'window' }]);
  wall(2, 'z', -5.5, -8, 8, [0, -1], [{ a: -4.4, b: -3.0, kind: 'window' }, { a: 2.0, b: 3.6, kind: 'window' }]);
  wall(2, 'x', -8, -5.5, 5.5, [-1, 0], [{ a: 0.8, b: 2.0, kind: 'window' }]);
  wall(2, 'x', 8, -5.5, 5.5, [1, 0], [{ a: -4.0, b: -2.6, kind: 'window' }, { a: 3.0, b: 4.4, kind: 'window' }]);
  wall(2, 'x', 0, -5.5, 5.5, null, opsFor(2, 'x', 0));
  wall(2, 'z', 0, -8, 0, null, opsFor(2, 'z', 0));
  wall(2, 'z', 0, 0, 8, null, []);
}
buildWallData();

// LOS segments per floor (rebuilt when doors change)
const LOS = { 1: [], 2: [] };
function rebuildLOS() {
  LOS[1] = []; LOS[2] = [];
  for (const w of WALLS) {
    // solid pieces = range minus openings that are passable (open doors / 'open' / 'none')
    const holes = w.ops.filter(o => (o.kind === 'open') || (o.door && World.doorOpen(o.door))).sort((p, q) => p.a - q.a);
    let s = w.a0;
    const push = (a, b) => { if (b - a < 0.01) return; if (w.axis === 'z') LOS[w.floor].push([a, w.c, b, w.c]); else LOS[w.floor].push([w.c, a, w.c, b]); };
    for (const o of holes) { push(s, o.a); s = o.b; }
    push(s, w.a1);
  }
}
function losClear(floor, ax, az, bx, bz) {
  const L = LOS[floor];
  for (let i = 0; i < L.length; i++) { const s = L[i]; if (segX(ax, az, bx, bz, s[0], s[1], s[2], s[3])) return false; }
  return true;
}

// ---------------------------------------------------------------- nav graph
// door crossing points (one on each side)
function doorPts(id) {
  const d = DOORS[id]; const m = (d.a + d.b) / 2; const o = 0.75;
  if (d.axis === 'x') { // wall along z at x=c
    const left = { x: d.c - o, z: m }, right = { x: d.c + o, z: m };
    const rl = roomAt(d.floor, left.x, left.z);
    return rl === d.rooms[0] ? [left, right] : [right, left];
  } else {
    const back = { x: m, z: d.c - o }, front = { x: m, z: d.c + o };
    const rb = roomAt(d.floor, back.x, back.z);
    return rb === d.rooms[0] ? [back, front] : [front, back];
  }
}
// adjacency: room -> [{to, via, pts}]
let NAV = {};
function buildNav() {
  NAV = {}; for (const r of ROOM_IDS) NAV[r] = [];
  for (const [id, d] of Object.entries(DOORS)) {
    if (d.ext) continue;
    const [pa, pb] = doorPts(id);
    if (id === 'd_eg') { // wide open: use a mid point
      NAV.engawa.push({ to: 'garden', via: id, pts: [{ f: 1, x: 9.2, z: -2.5 }, { f: 1, x: 10.2, z: -2.5 }] });
      NAV.garden.push({ to: 'engawa', via: id, pts: [{ f: 1, x: 10.2, z: -2.5 }, { f: 1, x: 9.2, z: -2.5 }] });
      continue;
    }
    if (id === 'd_we') {
      NAV.washitsu.push({ to: 'engawa', via: id, pts: [{ f: 1, x: 7.3, z: -2.5 }, { f: 1, x: 8.6, z: -2.5 }] });
      NAV.engawa.push({ to: 'washitsu', via: id, pts: [{ f: 1, x: 8.6, z: -2.5 }, { f: 1, x: 7.3, z: -2.5 }] });
      continue;
    }
    NAV[d.rooms[0]].push({ to: d.rooms[1], via: id, pts: [{ f: d.floor, ...pa }, { f: d.floor, ...pb }] });
    NAV[d.rooms[1]].push({ to: d.rooms[0], via: id, pts: [{ f: d.floor, ...pb }, { f: d.floor, ...pa }] });
  }
  const B = STAIRS.bottom, Tp = STAIRS.top;
  NAV.hall.push({ to: 'hall2', via: 'stairs', pts: [{ f: 1, x: -0.8, z: -3.7 }, { f: 1, x: B.x, z: B.z }, { f: 1, x: STAIRS.x0 - 0.1, z: STAIRS.zc, y: 3.0, stair: 1 }, { f: 2, x: Tp.x, z: Tp.z }, { f: 2, x: -7.3, z: -3.6 }] });
  NAV.hall2.push({ to: 'hall', via: 'stairs', pts: [{ f: 2, x: -7.3, z: -3.6 }, { f: 2, x: Tp.x, z: Tp.z }, { f: 1, x: STAIRS.x0 - 0.1, z: STAIRS.zc, y: 3.0 }, { f: 1, x: B.x, z: B.z, stair: 1 }, { f: 1, x: -0.9, z: -3.6 }] });
}
buildNav();
function roomPath(from, to) {
  if (from === to) return [];
  const prev = { [from]: null }, q = [from];
  while (q.length) {
    const r = q.shift(); if (r === to) break;
    for (const e of NAV[r]) if (!(e.to in prev)) { prev[e.to] = { r, e }; q.push(e.to); }
  }
  if (!(to in prev)) return null;
  const path = []; let c = to;
  while (prev[c]) { path.unshift(prev[c].e); c = prev[c].r; }
  return path;
}
// rooms reachable distance (for sound)
function roomHops(from, to, max = 3) {
  if (from === to) return 0;
  const seen = { [from]: 0 }, q = [from];
  while (q.length) {
    const r = q.shift(); if (seen[r] >= max) continue;
    for (const e of NAV[r]) if (!(e.to in seen)) { seen[e.to] = seen[r] + 1; if (e.to === to) return seen[e.to]; q.push(e.to); }
  }
  return 99;
}

// ---------------------------------------------------------------- spots (named positions for routines)
// id: [room, x, z, faceYaw(rad, 0 = facing +z)]
const SPOT_A = {
  ent: ['hall', -7.2, -2.8, Math.PI / 2],
  shoes: ['hall', -6.3, -2.0, -Math.PI / 2],
  phone: ['hall', -1.2, -1.0, Math.PI / 2],
  kago: ['hall', -2.5, -2.0, 0],
  hall_mid: ['hall', -4.6, -2.4, 0],
  umb: ['hall', -6.6, -0.9, -Math.PI / 2],
  tv_watch: ['living', -4.6, 2.9, -Math.PI / 2],
  sofa: ['living', -3.25, 2.4, -Math.PI / 2],
  sofa2: ['living', -3.25, 3.4, -Math.PI / 2],
  tv_front: ['living', -6.5, 2.0, -Math.PI / 2],
  liv_floor: ['living', -5.6, 4.4, -Math.PI / 2],
  liv_fold: ['living', -1.8, 3.8, -Math.PI / 2],
  liv_door: ['living', -3.4, 0.9, Math.PI],
  piano: ['living', -6.6, 1.5, Math.PI],
  fish: ['living', -1.6, 1.3, Math.PI],
  curtain: ['living', -6.8, 4.4, -Math.PI / 2],
  k_clock: ['kitchen', 2.7, 1.3, Math.PI],
  k_fridge: ['kitchen', 6.4, 1.3, Math.PI / 2],
  k_sink: ['kitchen', 5.0, 1.3, Math.PI],
  k_stove: ['kitchen', 6.1, 1.3, Math.PI],
  k_table1: ['kitchen', 3.3, 2.15, 0],
  k_table2: ['kitchen', 4.3, 2.15, 0],
  k_table3: ['kitchen', 3.3, 4.25, Math.PI],
  k_table4: ['kitchen', 4.3, 4.25, Math.PI],
  k_teapot: ['kitchen', 4.9, 3.2, -Math.PI / 2],
  k_shelf: ['kitchen', 6.8, 4.2, Math.PI / 2],
  k_back: ['kitchen', 7.0, 1.7, Math.PI / 2],
  w_sit: ['washitsu', 4.2, -1.6, Math.PI],
  w_sit2: ['washitsu', 3.2, -2.6, Math.PI / 2],
  w_knit: ['washitsu', 5.3, -1.4, Math.PI],
  w_oshi: ['washitsu', 2.2, -4.3, Math.PI],
  w_tansu: ['washitsu', 6.4, -4.2, Math.PI],
  eng_sit: ['engawa', 8.75, -2.8, Math.PI / 2],
  eng_sit2: ['engawa', 8.75, -1.6, Math.PI / 2],
  g_hoshi: ['garden', 12.0, 1.4, 0],
  g_mid: ['garden', 12.0, -0.6, 0],
  g_sun: ['garden', 11.0, 3.6, 0],
  g_shedfront: ['garden', 15.6, -0.6, Math.PI],
  sh_in: ['shed', 15.6, -2.5, Math.PI],
  sh_radio: ['shed', 14.5, -4.0, Math.PI],
  sh_box: ['shed', 16.6, -3.8, Math.PI],
  k2_desk: ['kodomo', -1.6, 1.4, Math.PI],
  k2_bed: ['kodomo', -6.0, 3.6, -Math.PI / 2],
  k2_floor: ['kodomo', -4.0, 3.0, 0],
  k2_toy: ['kodomo', -5.0, 1.5, Math.PI],
  s2_pc: ['shinshitsu', 6.6, 1.6, Math.PI / 2],
  s2_tansu: ['shinshitsu', 3.0, 1.4, Math.PI],
  s2_bed: ['shinshitsu', 4.0, 3.4, Math.PI / 2],
  s2_mirror: ['shinshitsu', 1.4, 4.4, -Math.PI / 2],
  h2_mid: ['hall2', -4.4, -2.2, 0],
  h2_light: ['hall2', -1.0, -3.5, Math.PI / 2],
  a2_desk: ['akari', 2.4, -4.2, Math.PI],
  a2_bed: ['akari', 6.0, -2.6, Math.PI / 2],
  a2_mid: ['akari', 4.2, -2.2, 0],
  a2_window: ['akari', 7.0, -3.3, Math.PI / 2],
};
// 模様替え (day 8+) overrides for the living room
const SPOT_B = Object.assign({}, SPOT_A, {
  tv_watch: ['living', -4.8, 3.0, Math.PI],
  sofa: ['living', -5.3, 3.6, Math.PI],
  sofa2: ['living', -4.3, 3.6, Math.PI],
  tv_front: ['living', -4.8, 1.6, Math.PI],
  piano: ['living', -6.7, 3.2, -Math.PI / 2],
  liv_fold: ['living', -1.8, 3.8, -Math.PI / 2],
  liv_floor: ['living', -2.6, 4.6, Math.PI],
});
let SPOTS = SPOT_A;
function spot(id) { const s = SPOTS[id]; if (!s) throw new Error('spot ' + id); return { room: s[0], f: ROOMS[s[0]].floor, x: s[1], z: s[2], yaw: s[3] }; }
