// ================================================================ house visuals
const FG = { 1: new THREE.Group(), 2: new THREE.Group() };
FG[1].name = 'F1'; FG[2].name = 'F2';
scene.add(FG[1], FG[2]);
const WALL_MATS = [];
function wallMat(c) { const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.92, map: texWall(c, 3) }); WALL_MATS.push(m); return m; }
const MAT = {
  wall1: wallMat('#f2e6d0'), wall2: wallMat('#f4ead8'), shed: wallMat('#b89878'),
  cap: M('#8a6448'), base: M('#9a6c48'), frame: M('#a87a54'), glass: new THREE.MeshStandardMaterial({ color: 0xcfe6f4, transparent: true, opacity: 0.32, roughness: 0.1 }),
  door: M('#c89868'), fusuma: M('#f4ecd8'), fusumaF: M('#8a6448'),
};
WALL_MATS.push(MAT.cap, MAT.base, MAT.frame, MAT.door, MAT.fusuma, MAT.fusumaF);
const STATIC = { 1: new THREE.Group(), 2: new THREE.Group() };
FG[1].add(STATIC[1]); FG[2].add(STATIC[2]);
const DECOR = { 1: new THREE.Group(), 2: new THREE.Group() };
FG[1].add(DECOR[1]); FG[2].add(DECOR[2]);
const OCC = []; // occluders {f, x0,z0,x1,z1,h}
function occ(f, x, z, w, d, h) { OCC.push({ f, x0: x - w / 2, z0: z - d / 2, x1: x + w / 2, z1: z + d / 2, h }); }

function floorMat(room) {
  const r = ROOMS[room]; const q = r.rects[0];
  if (r.tex === 'tatami') return TMat(texTatami(), {}, 4, 2);
  if (r.tex === 'tile') return TMat(texTile(), {}, 4, 3);
  if (r.tex === 'grass') return TMat(texGrass(), {}, 4, 3);
  return TMat(texPlank(r.col || '#d8a874'), {}, 2, 1.5);
}
function buildStatic() {
  // diorama plinth
  const pl = mesh(G.rbox(29, 0.7, 13.6, 0.25), M('#8a6446'), false, true); at(pl, 4.8, -0.37, 0); STATIC[1].add(pl);
  const pl2 = mesh(G.rbox(28.4, 0.08, 13.0, 0.03), M('#a07a58'), false, true); at(pl2, 4.8, -0.07, 0); STATIC[1].add(pl2);
  // floors
  for (const id of ROOM_IDS) {
    const r = ROOMS[id]; const g = STATIC[r.floor];
    r.rects.forEach((q, i) => {
      if (id === 'hall2') return;
      const w = q[2] - q[0], d = q[3] - q[1];
      const m = mesh(G.plane(w, d), floorMat(id), false, true);
      m.rotation.x = -Math.PI / 2; at(m, (q[0] + q[2]) / 2, id === 'garden' ? 0.0 : 0.02, (q[1] + q[3]) / 2);
      if (id === 'garden' && i === 0) { /* garden big rect */ }
      m.userData.room = id; g.add(m);
    });
  }
  // engawa raised deck edge
  RB(STATIC[1], 1.6, 0.12, 5.5, '#b08458', 8.8, -0.04, -2.75, 0.03);
  // floor 2 slab (with stairwell hole) + hall2 floor
  const slab = (x0, z0, x1, z1) => { const m = mesh(G.rbox(x1 - x0, 0.32, z1 - z0, 0.04), M('#cdb79a'), true, true); at(m, (x0 + x1) / 2, -0.17, (z0 + z1) / 2); STATIC[2].add(m); };
  slab(-8, 0, 8, 5.5); slab(0, -5.5, 8, 0); slab(-8, -4.2, 0, 0); slab(-8, -5.5, -7, -4.2); slab(-1.4, -5.5, 0, -4.2);
  const h2 = (x0, z0, x1, z1) => { const m = mesh(G.plane(x1 - x0, z1 - z0), TMat(texPlank('#c08c5a'), {}, 1.5, 1), false, true); m.rotation.x = -Math.PI / 2; at(m, (x0 + x1) / 2, 0.02, (z0 + z1) / 2); m.userData.room = 'hall2'; STATIC[2].add(m); };
  h2(-8, -4.2, 0, 0); h2(-8, -5.5, -7, -4.2); h2(-1.4, -5.5, 0, -4.2);
  // stairwell railing (2F)
  RB(STATIC[2], 5.6, 0.08, 0.08, '#8a6448', -4.2, 0.95, -4.15, 0.03);
  for (let i = 0; i < 8; i++) RB(STATIC[2], 0.07, 0.95, 0.07, '#8a6448', -6.9 + i * 0.78, 0.47, -4.15, 0.02);
  // stairs (1F hall): rises toward -x
  const n = 13;
  for (let i = 0; i < n; i++) {
    const x = STAIRS.x1 - (i + 0.5) * (STAIRS.x1 - STAIRS.x0) / n, h = (i + 1) * 3.0 / n;
    const s = mesh(G.rbox((STAIRS.x1 - STAIRS.x0) / n + 0.02, h, 1.2, 0.03), M(i % 2 ? '#b8885a' : '#c49464'), true, true);
    at(s, x, h / 2, STAIRS.zc); STATIC[1].add(s);
  }
  occ(1, -4.2, -4.85, 5.6, 1.2, 1.2);
  // genkan (entrance) tiles
  const gk = mesh(G.rbox(1.3, 0.06, 2.0, 0.02), M('#9a948a'), false, true); at(gk, -7.35, 0.0, -2.8); STATIC[1].add(gk);
  // walls
  for (const w of WALLS) buildWall(w);
  // doors
  for (const [id, d] of Object.entries(DOORS)) if (d.kind !== 'open' && !d.noWall) buildDoor(id, d);
  buildGarden();
}
function buildWall(w) {
  const g = STATIC[w.floor]; const T = 0.16; w.meshes = [];
  const mat = w.mat === 'shed' ? MAT.shed : w.floor === 1 ? MAT.wall1 : MAT.wall2;
  const piece = (a, b, y0, y1) => {
    if (b - a < 0.02 || y1 - y0 < 0.02) return;
    const len = b - a, h = y1 - y0, m = (a + b) / 2;
    const geo = w.axis === 'z' ? G.rbox(len, h, T, 0.04) : G.rbox(T, h, len, 0.04);
    const ms = mesh(geo, mat, true, true);
    if (w.axis === 'z') at(ms, m, y0 + h / 2, w.c); else at(ms, w.c, y0 + h / 2, m);
    g.add(ms); w.meshes.push(ms);
  };
  const cap = (a, b) => { // wooden cap on top
    const len = b - a, m = (a + b) / 2;
    const geo = w.axis === 'z' ? G.rbox(len + 0.02, 0.07, T + 0.06, 0.03) : G.rbox(T + 0.06, 0.07, len + 0.02, 0.03);
    const ms = mesh(geo, MAT.cap, false, false); if (w.axis === 'z') at(ms, m, w.h, w.c); else at(ms, w.c, w.h, m);
    g.add(ms); w.meshes.push(ms);
    const bb = w.axis === 'z' ? G.rbox(len, 0.14, T + 0.04, 0.02) : G.rbox(T + 0.04, 0.14, len, 0.02);
    const bs = mesh(bb, MAT.base, false, true); if (w.axis === 'z') at(bs, m, 0.07, w.c); else at(bs, w.c, 0.07, m);
    g.add(bs); w.meshes.push(bs);
  };
  const ops = w.ops.slice().sort((p, q) => p.a - q.a);
  let s = w.a0;
  for (const o of ops) {
    piece(s, o.a, 0, w.h); cap(s, o.a);
    if (o.kind === 'window') {
      piece(o.a, o.b, 0, 0.95); piece(o.a, o.b, 2.0, w.h); cap(o.a, o.b);
      const len = o.b - o.a, m = (o.a + o.b) / 2;
      const gl = mesh(w.axis === 'z' ? G.box(len, 1.05, 0.04) : G.box(0.04, 1.05, len), MAT.glass, false, false);
      if (w.axis === 'z') at(gl, m, 1.475, w.c); else at(gl, w.c, 1.475, m);
      g.add(gl); w.meshes.push(gl);
      for (const [yy, hh] of [[0.95, 0.07], [2.0, 0.07]]) {
        const fr = mesh(w.axis === 'z' ? G.rbox(len, hh, 0.22, 0.02) : G.rbox(0.22, hh, len, 0.02), MAT.frame, false, false);
        if (w.axis === 'z') at(fr, m, yy, w.c); else at(fr, w.c, yy, m); g.add(fr); w.meshes.push(fr);
      }
      const mid = mesh(w.axis === 'z' ? G.rbox(0.06, 1.05, 0.1, 0.02) : G.rbox(0.1, 1.05, 0.06, 0.02), MAT.frame, false, false);
      if (w.axis === 'z') at(mid, m, 1.475, w.c); else at(mid, w.c, 1.475, m); g.add(mid); w.meshes.push(mid);
    } else if (o.kind === 'open') {
      piece(o.a, o.b, 2.3, w.h); cap(o.a, o.b);
    } else {
      piece(o.a, o.b, 2.15, w.h); cap(o.a, o.b);
    }
    s = o.b;
  }
  piece(s, w.a1, 0, w.h); cap(s, w.a1);
}
function buildDoor(id, d) {
  const g = STATIC[d.floor]; const len = d.b - d.a, m = (d.a + d.b) / 2;
  const piv = new THREE.Group();
  if (d.kind === 'fusuma') {
    // sliding paper panel
    const p = new THREE.Group();
    RB(p, len, 2.1, 0.06, MAT.fusuma, 0, 1.06, 0, 0.02);
    RB(p, len + 0.02, 0.06, 0.08, MAT.fusumaF, 0, 2.1, 0, 0.02);
    RB(p, 0.05, 2.1, 0.08, MAT.fusumaF, -len / 2, 1.06, 0, 0.02);
    RB(p, 0.05, 2.1, 0.08, MAT.fusumaF, len / 2, 1.06, 0, 0.02);
    const k = mesh(G.cyl(0.05, 0.05, 0.02, 10), M('#6a4a34'), false, false); k.rotation.x = Math.PI / 2; at(k, len / 2 - 0.15, 1.0, 0.04); p.add(k);
    piv.add(p); piv.userData.panel = p;
  } else {
    const p = new THREE.Group();
    RB(p, len - 0.04, 2.08, 0.07, MAT.door, len / 2, 1.05, 0, 0.03);
    RB(p, len - 0.3, 0.7, 0.09, M('#d4a676'), len / 2, 1.45, 0, 0.03);
    RB(p, len - 0.3, 0.6, 0.09, M('#d4a676'), len / 2, 0.55, 0, 0.03);
    const k = mesh(G.sph(0.06, 10, 8), M('#d8b048', { metalness: 0.4, roughness: 0.4 }), false, false); at(k, len - 0.18, 1.0, 0.07); p.add(k);
    piv.add(p); piv.userData.panel = p;
    p.position.x = 0;
  }
  if (d.axis === 'z') { at(piv, d.kind === 'fusuma' ? m : d.a, 0, d.c); }
  else { piv.rotation.y = -Math.PI / 2; at(piv, d.c, 0, d.kind === 'fusuma' ? m : d.a); }
  g.add(piv); d.mesh = piv; d.len = len; d.anim = 1; // 1 = open
  setDoorVisual(id, true, true);
}
function setDoorVisual(id, open, instant) {
  const d = DOORS[id]; if (!d.mesh) return;
  d.target = open ? 1 : 0; if (instant) d.anim = d.target;
  applyDoorAnim(d);
}
function applyDoorAnim(d) {
  const p = d.mesh.userData.panel;
  if (d.kind === 'fusuma') p.position.x = d.anim * (d.len * 0.92);
  else p.rotation.y = d.anim * (d.axis === 'z' ? -1.45 : 1.45);
}
function updateDoors(dt) {
  for (const d of Object.values(DOORS)) if (d.mesh && d.anim !== d.target) {
    d.anim = d.target > d.anim ? Math.min(d.target, d.anim + dt * 2.5) : Math.max(d.target, d.anim - dt * 2.5);
    applyDoorAnim(d);
  }
}

// ---------------------------------------------------------------- garden
function tree(g, x, z, s = 1) {
  RB(g, 0.3 * s, 1.6 * s, 0.3 * s, '#8a5a3a', x, 0.8 * s, z, 0.1);
  for (const [dx, dy, dz, r] of [[0, 2.1, 0, 0.95], [0.5, 1.8, 0.3, 0.7], [-0.45, 1.85, -0.2, 0.75], [0.1, 2.6, 0.1, 0.6]]) {
    const b = mesh(G.sph(r * s, 14, 10), M('#6a9a4a'), true, false); at(b, x + dx * s, dy * s, z + dz * s); g.add(b);
  }
}
function buildGarden() {
  const g = STATIC[1];
  // fence
  const fenceSegs = [[9.6, 5.5, 18, 5.5, [0, 1]], [18, -5.5, 18, 5.5, [1, 0]], [9.6, -5.5, 18, -5.5, [0, -1]]];
  for (const [x0, z0, x1, z1, n] of fenceSegs) {
    const grp = new THREE.Group(); grp.userData.n = n; g.add(grp);
    const len = Math.hypot(x1 - x0, z1 - z0), cnt = Math.round(len / 0.5);
    for (let i = 0; i <= cnt; i++) { const t = i / cnt; RB(grp, 0.14, 0.8, 0.06, '#e8dcc4', lerp(x0, x1, t), 0.4, lerp(z0, z1, t), 0.03); }
    const rail = x0 === x1 ? G.rbox(0.06, 0.08, len, 0.02) : G.rbox(len, 0.08, 0.06, 0.02);
    ad(grp, at(mesh(rail, '#d8ccb4'), (x0 + x1) / 2, 0.55, (z0 + z1) / 2));
    FENCES.push(grp);
  }
  tree(g, 17.0, 4.3, 0.9);
  tree(g, 10.6, -4.6, 0.7);
  // flowers / pots
  for (const [x, z, c] of [[10.2, 4.8, '#e86a7a'], [10.9, 4.8, '#f4c84a'], [11.6, 4.8, '#e86a7a'], [16.6, 0.2, '#9a7ae0'], [17.3, 0.2, '#f4c84a']]) {
    RB(g, 0.42, 0.36, 0.42, '#b8684a', x, 0.18, z, 0.08);
    const f = mesh(G.sph(0.24, 10, 8), M(c), true, false); at(f, x, 0.55, z); g.add(f);
    const lf = mesh(G.sph(0.2, 10, 8), M('#5a9a4a'), true, false); at(lf, x + 0.1, 0.42, z + 0.05); g.add(lf);
  }
  // stepping stones
  for (const [x, z] of [[9.0, 1.6], [9.9, 2.0], [10.6, 1.2], [11.4, 0.4], [12.6, -0.4], [13.8, -0.8], [15.0, -0.9]]) {
    const s = mesh(G.rcyl(0.36, 0.08, 0.03, 12), M('#b8b0a4'), false, true); at(s, x, 0.03, z); g.add(s);
  }
  // shed (物置) floor raise & roof edge (roof hidden for dollhouse look)
  RB(g, 4.1, 0.1, 3.8, '#7a6450', 15.6, 0.0, -3.45, 0.03);
}
const FENCES = [];
const LOCKS = {};
const LOCK_MAT = new THREE.MeshBasicMaterial({ color: 0x2a2440, transparent: true, opacity: 0.38, depthWrite: false });
function updateLocks(rooms) {
  for (const id of ROOM_IDS) {
    const r = ROOMS[id];
    if (!LOCKS[id]) {
      const g = new THREE.Group();
      r.rects.forEach(q => { const m = new THREE.Mesh(G.plane(q[2] - q[0], q[3] - q[1]), LOCK_MAT); m.rotation.x = -Math.PI / 2; m.position.set((q[0] + q[2]) / 2, 0.045, (q[1] + q[3]) / 2); m.renderOrder = 1; g.add(m); });
      STATIC[r.floor].add(g); LOCKS[id] = g;
    }
    LOCKS[id].visible = !rooms.includes(id) && !(id === 'garden' && rooms.includes('shed'));
  }
}

// ---------------------------------------------------------------- decor (static furniture), layout A/B
function clearGroup(g) { while (g.children.length) g.remove(g.children[0]); }
function chair(g, x, z, ry) {
  const c = new THREE.Group(); at(c, x, 0, z); c.rotation.y = ry; g.add(c);
  RB(c, 0.55, 0.08, 0.55, '#b88452', 0, 0.48, 0, 0.03);
  for (const [a, b] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) RB(c, 0.07, 0.48, 0.07, '#9a6a40', a, 0.24, b, 0.02);
  RB(c, 0.55, 0.5, 0.07, '#b88452', 0, 0.78, -0.25, 0.03);
  return c;
}
function rug(g, x, z, w, d, c1, c2) {
  const t = cTex(128, 128, (x2, W, H) => { x2.fillStyle = c1; x2.fillRect(0, 0, W, H); x2.strokeStyle = c2; x2.lineWidth = 8; x2.strokeRect(10, 10, W - 20, H - 20); x2.lineWidth = 3; x2.strokeRect(22, 22, W - 44, H - 44); noiseFill(x2, W, H, 300, 0.06); });
  const m = mesh(G.rbox(w, 0.03, d, 0.015), new THREE.MeshStandardMaterial({ map: t, roughness: 1 }), false, true); at(m, x, 0.035, z); g.add(m);
}
function plant(g, x, z, s = 1) {
  RB(g, 0.45 * s, 0.5 * s, 0.45 * s, '#c8784a', x, 0.25 * s, z, 0.1);
  for (const [dx, dy, dz, r] of [[0, 0.85, 0, 0.32], [0.18, 0.7, 0.1, 0.22], [-0.16, 0.75, -0.08, 0.24]]) { const b = mesh(G.sph(r * s, 12, 9), M('#5e9a4c'), true, false); at(b, x + dx * s, dy * s, z + dz * s); g.add(b); }
}
function lampShade(g, x, z, c = '#f8e4b0') {
  const cord = mesh(G.cyl(0.012, 0.012, 0.3, 6), M('#5a4a3a'), false, false); at(cord, x, WALL_H + 0.05, z); g.add(cord);
  const sh = mesh(G.cyl(0.13, 0.3, 0.22, 16, 1, true), new THREE.MeshStandardMaterial({ color: c, emissive: 0x000000, side: THREE.DoubleSide, roughness: 0.9 }), false, false);
  at(sh, x, WALL_H - 0.2, z); g.add(sh); LAMPS.push(sh);
  const bulb = mesh(G.sph(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff0c8 }), false, false); at(bulb, x, WALL_H - 0.28, z); g.add(bulb); BULBS.push(bulb);
}
const LAMPS = [], BULBS = [];
function buildDecor(layout) {
  clearGroup(DECOR[1]); clearGroup(DECOR[2]); OCC.length = 0; LAMPS.length = 0; BULBS.length = 0;
  const g = DECOR[1], h = DECOR[2];
  occ(1, -4.2, -4.85, 5.6, 1.2, 1.2);
  // ---------- living
  if (layout === 'A') {
    rug(g, -5.0, 2.7, 3.4, 2.6, '#c86a5a', '#f4d8a8');
    // TV cabinet (TV itself is an object)
    RB(g, 0.7, 0.55, 1.8, '#8a5a3a', -7.5, 0.28, 2.7, 0.05);
    RB(g, 0.05, 0.3, 0.7, '#6a4228', -7.13, 0.3, 2.3, 0.02); RB(g, 0.05, 0.3, 0.7, '#6a4228', -7.13, 0.3, 3.1, 0.02);
    // low table
    RB(g, 1.0, 0.1, 1.5, '#b07a4a', -5.5, 0.42, 2.7, 0.04);
    for (const [a, b] of [[-0.38, -0.6], [0.38, -0.6], [-0.38, 0.6], [0.38, 0.6]]) RB(g, 0.08, 0.38, 0.08, '#8a5a34', -5.5 + a, 0.19, 2.7 + b, 0.02);
    occ(1, -5.5, 2.7, 1.0, 1.5, 0.45);
  } else {
    rug(g, -4.8, 2.4, 3.0, 3.0, '#5a8ab8', '#f4e4c8');
    RB(g, 1.8, 0.55, 0.7, '#8a5a3a', -4.8, 0.28, 0.5, 0.05);
    RB(g, 1.5, 0.1, 1.0, '#b07a4a', -4.8, 0.42, 2.1, 0.04);
    for (const [a, b] of [[-0.6, -0.38], [0.6, -0.38], [-0.6, 0.38], [0.6, 0.38]]) RB(g, 0.08, 0.38, 0.08, '#8a5a34', -4.8 + a, 0.19, 2.1 + b, 0.02);
    occ(1, -4.8, 2.1, 1.5, 1.0, 0.45);
  }
  // shelf with fish bowl (living back wall, right)
  RB(g, 1.1, 0.8, 0.55, '#9a6a44', -1.6, 0.4, 0.45, 0.05);
  RB(g, 1.0, 0.04, 0.5, '#7a4a2a', -1.6, 0.42, 0.47, 0.02);
  plant(g, -0.6, 5.0, 1.1);
  lampShade(g, -4.5, 2.7);
  // ---------- kitchen
  // counter + sink + stove along back wall
  RB(g, 2.9, 0.92, 0.72, '#e8e0d0', 4.95, 0.46, 0.44, 0.05);
  RB(g, 2.98, 0.07, 0.8, '#9aa4ac', 4.95, 0.95, 0.44, 0.03);
  RB(g, 0.9, 0.06, 0.5, '#6a747c', 4.4, 0.96, 0.46, 0.04); // sink
  const tap = mesh(G.tor(0.12, 0.025, 6, 10, Math.PI), M('#c0c8d0', { metalness: 0.6, roughness: 0.3 }), false, false); at(tap, 4.4, 1.1, 0.2); g.add(tap);
  for (const xx of [5.85, 6.25]) { const r = mesh(G.tor(0.13, 0.025, 6, 14), M('#333'), false, false); r.rotation.x = Math.PI / 2; at(r, xx, 0.99, 0.45); g.add(r); }
  // drawers lines
  for (const xx of [3.9, 4.95, 6.0]) RB(g, 0.9, 0.04, 0.02, '#c8bca8', xx, 0.7, 0.81, 0.01);
  // table + chairs
  RB(g, 2.0, 0.08, 1.2, '#c08a56', 3.8, 0.76, 3.2, 0.04);
  for (const [a, b] of [[-0.88, -0.5], [0.88, -0.5], [-0.88, 0.5], [0.88, 0.5]]) RB(g, 0.08, 0.74, 0.08, '#9a6a40', 3.8 + a, 0.37, 3.2 + b, 0.02);
  chair(g, 3.3, 2.3, 0); chair(g, 4.3, 2.3, 0); chair(g, 3.3, 4.1, Math.PI); chair(g, 4.3, 4.1, Math.PI);
  occ(1, 3.8, 3.2, 2.0, 1.2, 0.8);
  // cupboard (食器棚)
  RB(g, 0.6, 1.9, 1.3, '#a87448', 7.55, 0.95, 4.3, 0.05);
  RB(g, 0.04, 0.7, 1.1, '#dfeff4', 7.24, 1.45, 4.3, 0.02);
  for (let i = 0; i < 4; i++) { const p = mesh(G.rcyl(0.14, 0.03, 0.01, 12), M('#f4f0e8'), false, false); p.rotation.z = Math.PI / 2; at(p, 7.4, 1.3 + (i % 2) * 0.35, 3.9 + Math.floor(i / 2) * 0.5); g.add(p); }
  occ(1, 7.55, 4.3, 0.6, 1.3, 1.9);
  RB(g, 1.0, 0.05, 1.0, '#e0d4c0', 7.1, 0.03, 1.7, 0.02); // mat by back door
  lampShade(g, 3.8, 3.2, '#fff4d0');
  // ---------- hall
  RB(g, 0.5, 1.0, 1.0, '#9a6a44', -7.6, 0.5, -0.8, 0.05); // shoe box
  RB(g, 0.5, 0.6, 0.5, '#7a5a3a', -0.55, 0.3, -0.6, 0.05); // phone stand
  RB(g, 1.5, 0.03, 0.8, '#8a9a6a', -6.2, 0.035, -2.0, 0.015); // mat
  lampShade(g, -4.5, -2.4);
  // ---------- washitsu
  const cb = mesh(G.rcyl(0.8, 0.07, 0.03, 24), M('#9a5a34'), true, true); at(cb, 4.2, 0.36, -2.6); g.add(cb);
  for (const [a, b] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) RB(g, 0.08, 0.34, 0.08, '#7a4a2a', 4.2 + a, 0.17, -2.6 + b, 0.02);
  for (const [x, z] of [[4.2, -1.55], [3.15, -2.6], [5.25, -2.6]]) RB(g, 0.65, 0.09, 0.65, '#a84a4a', x, 0.05, z, 0.04);
  RB(g, 1.3, 1.5, 0.55, '#8a5a34', 6.4, 0.75, -5.15, 0.05); // tansu
  for (let i = 0; i < 4; i++) RB(g, 1.2, 0.03, 0.03, '#5a3a24', 6.4, 0.35 + i * 0.35, -4.86, 0.01);
  occ(1, 6.4, -5.15, 1.3, 0.55, 1.5);
  // tokonoma scroll on back wall
  RB(g, 0.7, 1.3, 0.03, '#f4ecd8', 4.6, 1.5, -5.4, 0.01);
  RB(g, 0.5, 0.6, 0.035, '#a8b8c8', 4.6, 1.55, -5.39, 0.01);
  lampShade(g, 4.2, -2.6, '#fff8e4');
  // engawa
  // ---------- 2F kodomo
  RB(h, 1.4, 0.45, 2.6, '#8ab0d8', -7.1, 0.23, 3.7, 0.08); // bed
  RB(h, 1.3, 0.12, 2.4, '#f4f0e0', -7.1, 0.5, 3.75, 0.05);
  RB(h, 1.0, 0.18, 0.5, '#fff', -7.1, 0.6, 2.7, 0.08);
  RB(h, 1.6, 0.06, 0.8, '#c89868', -1.6, 0.74, 0.5, 0.03); // desk
  for (const [a, b] of [[-0.7, -0.3], [0.7, -0.3], [-0.7, 0.3], [0.7, 0.3]]) RB(h, 0.07, 0.72, 0.07, '#9a6a40', -1.6 + a, 0.36, 0.5 + b, 0.02);
  chair(h, -1.6, 1.3, Math.PI);
  RB(h, 1.4, 0.6, 0.7, '#e8b84a', -5.0, 0.3, 0.45, 0.08); // toy box
  rug(h, -4.0, 3.2, 2.6, 2.0, '#a8d0a0', '#f4f4d8');
  lampShade(h, -4.0, 2.7);
  // ---------- 2F shinshitsu
  RB(h, 2.6, 0.18, 2.4, '#e8e0f0', 4.4, 0.09, 3.4, 0.08); // futons
  RB(h, 1.1, 0.1, 2.2, '#f4c8c8', 3.8, 0.22, 3.4, 0.05); RB(h, 1.1, 0.1, 2.2, '#c8d8f4', 5.0, 0.22, 3.4, 0.05);
  RB(h, 0.7, 0.75, 1.4, '#a87a54', 7.5, 0.38, 1.6, 0.04); // mom's desk
  RB(h, 0.8, 1.2, 0.4, '#c89868', 1.0, 0.6, 5.1, 0.05); // dresser
  RB(h, 0.6, 0.7, 0.04, '#dfeff4', 1.0, 1.5, 5.28, 0.02);
  lampShade(h, 4.2, 2.8);
  // ---------- 2F hall2
  RB(h, 1.6, 1.4, 0.4, '#9a6a44', -4.5, 0.7, -0.35, 0.05);
  for (let i = 0; i < 6; i++) RB(h, 0.2, 0.4, 0.28, ['#c86a5a', '#5a8ab8', '#e8b84a', '#6aa86a'][i % 4], -5.1 + i * 0.24, 1.05, -0.35, 0.02);
  lampShade(h, -3.6, -2.2);
  // ---------- 2F akari
  RB(h, 1.3, 0.45, 2.4, '#e8a8b8', 6.8, 0.23, -1.6, 0.08); // bed
  RB(h, 1.2, 0.12, 2.2, '#fff4f8', 6.8, 0.5, -1.55, 0.05);
  RB(h, 1.8, 0.06, 0.7, '#e8d8c8', 2.4, 0.74, -5.05, 0.03); // desk
  for (const [a, b] of [[-0.8, -0.28], [0.8, -0.28], [-0.8, 0.28], [0.8, 0.28]]) RB(h, 0.07, 0.72, 0.07, '#c8b8a8', 2.4 + a, 0.36, -5.05 + b, 0.02);
  chair(h, 2.4, -4.3, 0);
  rug(h, 4.4, -2.6, 2.4, 2.0, '#f4d0d8', '#ffffff');
  // posters
  for (const [x, c] of [[4.4, '#8ac0e8'], [5.4, '#f4b8c8']]) RB(h, 0.7, 0.9, 0.02, c, x, 1.7, -5.42, 0.01);
  lampShade(h, 4.4, -2.6);
}
