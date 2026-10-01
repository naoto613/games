// ================================================================ props
const Things = { pots: [], grass: [], signs: [], chests: [], fires: [], dummies: [], anim: [] };
const tH = (I, x, z) => { let h = terrH(I, x, z); for (const p of I.plats) if (x >= p[0] && x <= p[2] && z >= p[1] && z <= p[3] && p[4] > h) h = p[4]; return h; };
function place(I, o, x, z, y) { o.position.set(x, y == null ? tH(I, x, z) : y, z); I.group.add(o); return o; }

function tree(I, x, z, s = 1, c = 0x52bf3c) {
  const g = new THREE.Group();
  g.add(at(mk(G.cyl(0.32 * s, 0.5 * s, 3.4 * s, 8), 0x8a5a34, 0.05), 0, 1.7 * s, 0));
  const c2 = new THREE.Color(c).offsetHSL(0, 0, 0.06).getHex();
  g.add(at(mk(G.sph(2.1 * s, 12, 9), c, 0.06), 0, 4.3 * s, 0));
  g.add(at(mk(G.sph(1.5 * s, 12, 9), c2, 0.06), 0.9 * s, 5.4 * s, 0.4 * s));
  g.add(at(mk(G.sph(1.3 * s, 12, 9), c2, 0.06), -1.0 * s, 5.0 * s, -0.5 * s));
  g.rotation.y = Math.random() * TAU; g.userData.static = 1;
  place(I, g, x, z, tH(I, x, z) - 0.1); addCol(I, x, z, 0.6 * s, { tall: 2.4 * s }); return g;
}
function palm(I, x, z, s = 1, lean = 0.25) {
  const g = new THREE.Group(); let px = 0, py = 0, a = 0;
  if (I.dock) { // keep the pier clear
    const ax = I.dock.x * 0.65, az = I.dock.z * 0.65, vx = I.dock.x - ax, vz = I.dock.z - az, t = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz), 0, 1);
    if (Math.hypot(ax + vx * t - x, az + vz * t - z) < 7) return g;
  }
  for (let i = 0; i < 6; i++) {
    const seg = mk(G.cyl(0.24 * s, 0.3 * s, 1.1 * s, 8), i % 2 ? 0xb08050 : 0x9a6a40, 0.04);
    a = lean * i / 5; seg.rotation.z = -a; seg.position.set(px, py + 0.55 * s, 0); g.add(seg);
    px += Math.sin(a) * 1.05 * s; py += Math.cos(a) * 1.05 * s;
  }
  const top = new THREE.Group(); top.position.set(px, py, 0); g.add(top);
  for (let i = 0; i < 7; i++) {
    const f = new THREE.Group(); f.rotation.y = i / 7 * TAU;
    const l = mk(G.sph(1, 10, 6), i % 2 ? 0x4cb83a : 0x5ccc44, 0.03); l.scale.set(0.5 * s, 0.1 * s, 2.3 * s); l.position.set(0, -0.4 * s, 1.9 * s); l.rotation.x = 0.45;
    f.add(l); top.add(f);
  }
  for (let i = 0; i < 3; i++) top.add(at(mk(G.sph(0.25 * s, 8, 6), 0x7a5028, 0.02), Math.cos(i * 2.1) * 0.3 * s, -0.3 * s, Math.sin(i * 2.1) * 0.3 * s));
  g.rotation.y = Math.random() * TAU; g.userData.static = 1; place(I, g, x, z, tH(I, x, z) - 0.15); addCol(I, x, z, 0.45 * s, { tall: 0.8 }); return g;
}
function house(I, x, z, rot = 0, o = {}) {
  const r = o.r || 4.5, h = o.h || 3.6, g = new THREE.Group();
  g.add(at(mk(G.cyl(r, r * 1.04, h, 18), o.wall || 0xeee2c4, 0.06), 0, h / 2, 0));
  // stone bands
  g.add(at(mk(G.cyl(r * 1.05, r * 1.07, 0.5, 18), o.base || 0xc8b490, 0.04), 0, 0.25, 0));
  g.add(at(mk(G.cone(r * 1.3, r * 0.9, 18), o.roof || 0xe0ac4c, 0.07), 0, h + r * 0.45, 0));
  g.add(at(mk(G.cyl(r * 1.32, r * 1.32, 0.3, 18), o.roof2 || 0xc89034, 0.04), 0, h + 0.05, 0));
  const door = mk(G.box(1.5, 2.3, 0.4), 0x7a4a24, 0.03); door.position.set(0, 1.15, r - 0.05); g.add(door);
  g.add(at(mk(G.sph(0.09, 6, 4), 0xffd84a, 0), 0.45, 1.2, r + 0.17));
  for (const s of [-1, 1]) { const w = mk(G.box(0.9, 0.9, 0.3), 0x3a5a9a, 0.03); w.position.set(Math.sin(s * 0.9) * r, 2.2, Math.cos(s * 0.9) * r); w.rotation.y = s * 0.9; g.add(w); }
  if (o.chimney) g.add(at(mk(G.box(0.8, 2, 0.8), 0xb0a090, 0.04), r * 0.5, h + r * 0.5, -r * 0.3));
  if (o.sign) { const sg = mk(G.box(2.4, 0.8, 0.15), 0xf6e0a0, 0.03); sg.position.set(0, h - 0.2, r + 0.15); g.add(sg); }
  g.rotation.y = rot; g.userData.static = 1; place(I, g, x, z, tH(I, x, z) - 0.2); addCol(I, x, z, r + 0.2, { tall: r + 0.6 });
  return g;
}
function rock(I, x, z, s = 1, c = 0xb0a8a0) {
  const m = mk(new THREE.DodecahedronGeometry(1, 0), c, 0.05);
  m.scale.set(s * 1.2, s * 0.8, s); m.rotation.set(Math.random(), Math.random() * TAU, 0);
  m.userData.static = 1; place(I, m, x, z, tH(I, x, z) + s * 0.3); addCol(I, x, z, s * 1.05); return m;
}
const potGeo = new THREE.LatheGeometry([[0, 0], [0.38, 0.05], [0.5, 0.35], [0.45, 0.65], [0.25, 0.85], [0.28, 0.98], [0.2, 1]].map(p => new THREE.Vector2(p[0], p[1])), 12);
function pot(I, x, z) {
  const g = new THREE.Group();
  g.add(mk(potGeo, 0xc8763a, 0.03));
  g.add(at(mk(G.cyl(0.47, 0.5, 0.12, 12), 0x8a4a24, 0), 0, 0.42, 0));
  place(I, g, x, z);
  const p = { I, g, x: I.x + x, z: I.z + z, alive: true, col: addCol(I, x, z, 0.5) };
  Things.pots.push(p); return p;
}
let _grassGeo = null;
function grassGeo() {
  if (_grassGeo) return _grassGeo;
  const items = [];
  for (let i = 0; i < 5; i++) { const o = new THREE.Object3D(); o.position.set(Math.cos(i * 1.3) * 0.25, 0.45, Math.sin(i * 1.3) * 0.25); o.rotation.set(Math.cos(i) * 0.3, 0, Math.sin(i) * 0.3); o.scale.y = 1 + (i % 3) * 0.2; o.updateMatrix(); items.push({ geo: G.cone(0.18, 0.95, 5), mat: 0, matrix: o.matrix }); }
  return _grassGeo = mergeList(items)[0].geometry;
}
function grass(I, x, z) {
  const g = mk(grassGeo(), Math.random() < 0.5 ? 0x4cb83a : 0x62cc44, 0.02);
  place(I, g, x, z);
  const o = { I, g, x: I.x + x, z: I.z + z, alive: true, t: 0 }; Things.grass.push(o); return o;
}
function flowers(I, x, z, n = 4) {
  const cols = [0xff6a8a, 0xffe04a, 0xffffff, 0xb07aff, 0xff9a3a];
  for (let i = 0; i < n; i++) {
    const g = new THREE.Group(), c = pick(cols);
    for (let k = 0; k < 5; k++) g.add(at(new THREE.Mesh(G.sph(0.12, 6, 4), TM(c)), Math.cos(k * 1.256) * 0.13, 0.35, Math.sin(k * 1.256) * 0.13));
    g.add(at(new THREE.Mesh(G.sph(0.08, 6, 4), TM(0xffc020)), 0, 0.38, 0));
    g.add(at(new THREE.Mesh(G.cyl(0.03, 0.03, 0.35, 4), TM(0x3a9a2a)), 0, 0.17, 0));
    g.userData.static = 1; place(I, g, x + Math.cos(i * 2.4) * (0.5 + i * 0.3), z + Math.sin(i * 2.4) * (0.5 + i * 0.3));
  }
}
function sign(I, x, z, rot, text) {
  const g = new THREE.Group();
  g.add(at(mk(G.cyl(0.1, 0.12, 1.4, 6), 0x8a5a34, 0.03), 0, 0.7, 0));
  g.add(at(mk(G.box(1.6, 0.9, 0.12), 0xd8a868, 0.03), 0, 1.3, 0));
  g.rotation.y = rot; g.userData.static = 1; place(I, g, x, z); addCol(I, x, z, 0.4);
  Things.signs.push({ x: I.x + x, z: I.z + z, text }); return g;
}
function chest(I, x, z, rot, id, content, hidden) {
  const g = new THREE.Group();
  g.add(at(mk(G.box(1.2, 0.7, 0.8), 0x9a5a28, 0.03), 0, 0.35, 0));
  g.add(at(mk(G.box(1.24, 0.12, 0.84), 0xe8b830, 0.0), 0, 0.62, 0));
  const lid = new THREE.Group(); lid.position.set(0, 0.7, -0.4); g.add(lid);
  const lm = mk(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 10, 1, false, 0, Math.PI), 0xa8642c, 0.03); lm.rotation.z = Math.PI / 2; lm.rotation.y = 0; lm.position.z = 0.4; lid.add(lm);
  g.add(at(mk(G.box(0.25, 0.3, 0.1), 0xffd84a, 0.0), 0, 0.55, 0.42));
  g.rotation.y = rot; place(I, g, x, z);
  const c = { I, g, lid, id, content, x: I.x + x, z: I.z + z, opened: false, rot, col: addCol(I, x, z, 0.7) };
  if (hidden) { g.visible = false; c.col.on = false; c.hidden = true; }
  Things.chests.push(c); return c;
}
function dummy(I, x, z) {
  const g = new THREE.Group();
  g.add(at(mk(G.cyl(0.12, 0.12, 2.2, 6), 0x8a5a34, 0.03), 0, 1.1, 0));
  const b = new THREE.Group(); b.position.y = 1.0; g.add(b);
  b.add(at(mk(G.cyl(0.45, 0.4, 1.1, 10), 0xe8c86a, 0.04), 0, 0.5, 0));
  b.add(at(mk(G.sph(0.4, 10, 8), 0xe8c86a, 0.04), 0, 1.35, 0));
  b.add(at(mk(G.box(1.6, 0.18, 0.18), 0x8a5a34, 0.03), 0, 0.8, 0));
  place(I, g, x, z); addCol(I, x, z, 0.5);
  const d = { g, b, x: I.x + x, z: I.z + z, hit: 0, wob: 0 }; Things.dummies.push(d); return d;
}
function stall(I, x, z, rot) {
  const g = new THREE.Group();
  g.add(at(mk(G.box(3.4, 1.1, 1.4), 0xb07a40, 0.04), 0, 0.55, 0.6));
  for (const sx of [-1.6, 1.6]) for (const sz of [-0.6, 1.2]) g.add(at(mk(G.cyl(0.08, 0.08, 3, 6), 0x8a5a34, 0.02), sx, 1.5, sz));
  for (let i = 0; i < 6; i++) { const s = mk(G.box(0.62, 0.12, 2.4), i % 2 ? 0xffffff : 0xe2463a, 0.02); s.position.set(-1.55 + i * 0.62, 3.05, 0.3); s.rotation.x = 0.25; g.add(s); }
  g.rotation.y = rot; g.userData.static = 1; place(I, g, x, z); addCol(I, x, z, 1.8); return g;
}
function pier(I, x1, z1, x2, z2, w = 2.6, y = 1.05) {
  const g = new THREE.Group(); const dx = x2 - x1, dz = z2 - z1, L = Math.hypot(dx, dz), a = Math.atan2(dx, dz);
  const n = Math.ceil(L / 0.9);
  for (let i = 0; i < n; i++) { const p = mk(G.box(w, 0.18, 0.8), i % 2 ? 0xb88a54 : 0xa87a46, 0.02); p.position.set(0, y - 0.09, i * 0.9 + 0.4); g.add(p); }
  for (let i = 0; i <= n; i += 3) for (const s of [-1, 1]) g.add(at(mk(G.cyl(0.14, 0.14, 4, 6), 0x7a5028, 0.02), s * (w / 2 - 0.1), y - 2, i * 0.9));
  g.position.set(x1, 0, z1); g.rotation.y = a; g.userData.static = 1; I.group.add(g);
  // walkable platform (axis aligned approx)
  I.plats.push([Math.min(x1, x2) - w / 2, Math.min(z1, z2) - w / 2, Math.max(x1, x2) + w / 2, Math.max(z1, z2) + w / 2, y]);
  return g;
}
function dekuTree(I, x, z) {
  const g = new THREE.Group();
  g.add(at(mk(G.cyl(3.6, 5.2, 14, 14), 0x8a6040, 0.08), 0, 7, 0));
  for (let i = 0; i < 6; i++) { const r = mk(G.cyl(0.6, 1.2, 5, 8), 0x7a5034, 0.05); const a = i / 6 * TAU; r.position.set(Math.cos(a) * 4.8, 0.8, Math.sin(a) * 4.8); r.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); g.add(r); }
  const cols = [0x4cb83a, 0x5cc84a, 0x3ea830];
  [[0, 17, 0, 7], [5, 15, 2, 5], [-5, 15.5, -1, 5.5], [1, 15, -5, 5], [-1, 15, 5, 5], [0, 21, 0, 4.5]].forEach(([a, b, c, r], i) => g.add(at(mk(G.sph(r, 14, 10), cols[i % 3], 0.1), a, b, c)));
  // face (looks toward +z)
  const face = new THREE.Group(); face.position.set(0, 0, 0); g.add(face);
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(G.sph(0.8, 12, 8), BM(0x2a1408)); e.scale.set(1, 0.7, 0.35); e.position.set(s * 1.4, 9, 3.9); face.add(e);
    const p = new THREE.Mesh(G.sph(0.22, 8, 6), BM(0xfff4c0)); p.position.set(s * 1.3, 9.15, 4.15); face.add(p);
    const m = mk(G.sph(1, 10, 8), 0x6ac84a, 0.04); m.scale.set(1.8, 0.6, 0.8); m.position.set(s * 1.4, 6.6, 4.0); m.rotation.z = s * 0.4; face.add(m);
    const br = mk(G.sph(1, 10, 8), 0x6ac84a, 0.04); br.scale.set(1.2, 0.35, 0.6); br.position.set(s * 1.5, 10.2, 3.7); br.rotation.z = -s * 0.3; face.add(br);
  }
  face.add(at(mk(G.sph(0.9, 10, 8), 0x9a6a46, 0.05), 0, 7.6, 4.3));
  const mouth = new THREE.Mesh(G.sph(0.7, 10, 8), BM(0x2a1408)); mouth.scale.set(1.2, 0.5, 0.3); mouth.position.set(0, 5.6, 4.2); face.add(mouth);
  g.userData.static = 1; place(I, g, x, z); addCol(I, x, z, 5.0, { tall: 6 });
  return { g, mouth };
}
// flames
const flameMatO = new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.95 });
const flameMatY = new THREE.MeshBasicMaterial({ color: 0xffe04a });
function flame(s = 1) {
  const g = new THREE.Group();
  const o = new THREE.Mesh(G.cone(0.5 * s, 1.6 * s, 8), flameMatO); o.position.y = 0.8 * s; g.add(o);
  const y = new THREE.Mesh(G.cone(0.28 * s, 1.0 * s, 8), flameMatY); y.position.y = 0.55 * s; g.add(y);
  g.userData.ph = Math.random() * 10; g.userData.dyn = 1;
  Things.anim.push(dt => { const t = World.t * 9 + g.userData.ph; g.scale.set(1 + Math.sin(t) * 0.1, 1 + Math.sin(t * 1.3) * 0.18, 1 + Math.cos(t) * 0.1); o.rotation.y += dt * 3; });
  return g;
}
function fireGate(I, x, z, rot, w = 6.5) {
  const g = new THREE.Group();
  const n = 3;
  for (let i = 0; i < n; i++) {
    const bx = (i - (n - 1) / 2) * (w / n);
    const br = mk(G.cyl(0.7, 0.45, 0.7, 8), 0x4a4a52, 0.03); br.position.set(bx, 0.35, 0); g.add(br);
    const f = flame(1.5); f.position.set(bx, 0.6, 0); g.add(f);
  }
  g.rotation.y = rot; place(I, g, x, z);
  const fg = { g, x: I.x + x, z: I.z + z, on: true, col: addCol(I, x, z, w / 2 + 0.2) };
  Things.fires.push(fg); return fg;
}
function stoneGate(I, x, z, rot, w = 6.5) {
  const g = new THREE.Group();
  const slab = mk(G.box(w, 4.2, 1.0), 0x8a7a6a, 0.05); slab.position.y = 2.1; g.add(slab);
  const em = mk(G.cyl(0.9, 0.9, 0.2, 16), 0xe8b830, 0.02); em.rotation.x = Math.PI / 2; em.position.set(0, 2.4, 0.55); g.add(em);
  for (const s of [-1, 1]) g.add(at(mk(G.box(0.8, 5, 1.4), 0x6a5a4c, 0.04), s * (w / 2 + 0.3), 2.5, 0));
  g.rotation.y = rot; place(I, g, x, z);
  return { g, slab, em, col: addCol(I, x, z, w / 2 + 0.3), open: false };
}
function torch(I, x, z) {
  const g = new THREE.Group(); g.add(at(mk(G.cyl(0.12, 0.16, 1.6, 6), 0x5a4a3a, 0.03), 0, 0.8, 0));
  g.add(at(mk(G.cyl(0.35, 0.2, 0.35, 8), 0x3a3a42, 0.03), 0, 1.7, 0)); const f = flame(0.7); f.position.y = 1.8; g.add(f);
  g.userData.static = 1; place(I, g, x, z); addCol(I, x, z, 0.35); return g;
}
function wall(I, cx, cz, w, d, h, c = 0x6a6676, y0) {
  const m = mk(G.box(w, h, d), c, 0.05); m.userData.static = 1; const y = y0 == null ? tH(I, cx, cz) : y0; m.position.set(cx, y + h / 2 - 0.3, cz); I.group.add(m);
  addBox(I, cx, cz, w, d); return m;
}
function towerC(I, x, z, r, h, c = 0x6a6676, roof = 0x3a2a4a) {
  const g = new THREE.Group(); g.add(at(mk(G.cyl(r, r * 1.1, h, 12), c, 0.06), 0, h / 2, 0));
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.add(at(mk(G.box(0.9, 0.9, 0.9), c, 0.03), Math.cos(a) * r, h + 0.4, Math.sin(a) * r)); }
  g.add(at(mk(G.cone(r * 0.6, 3, 8), roof, 0.04), 0, h + 1.4, 0));
  g.userData.static = 1; place(I, g, x, z, tH(I, x, z) - 0.3); addCol(I, x, z, r + 0.2, { tall: r + 0.6 }); return g;
}
function flag(I, x, z, h = 6, c = 0x3a2a4a) {
  const g = new THREE.Group(); g.add(at(mk(G.cyl(0.08, 0.1, h, 6), 0x5a4a3a, 0.02), 0, h / 2, 0));
  const f = mk(G.box(2.2, 1.4, 0.06), c, 0.02); f.position.set(1.15, h - 0.8, 0); f.userData.dyn = 1; g.add(f); g.userData.static = 1;
  const sk = new THREE.Mesh(G.sph(0.32, 8, 6), BM(0xf0e8d0)); sk.position.set(1.15, h - 0.8, 0.06); sk.scale.z = 0.3; g.add(sk);
  Things.anim.push(() => { f.rotation.y = Math.sin(World.t * 3 + x) * 0.25; f.scale.x = 1 + Math.sin(World.t * 5 + z) * 0.05; });
  place(I, g, x, z); return g;
}
function statue(I, x, z, rot, gemCol) {
  const g = new THREE.Group();
  g.add(at(mk(G.cyl(1.6, 2, 1.2, 10), 0xd8d0c0, 0.05), 0, 0.6, 0));
  g.add(at(mk(G.cyl(0.8, 1.1, 3.2, 10), 0xe8e0d0, 0.05), 0, 2.8, 0));
  g.add(at(mk(G.sph(1.0, 12, 8), 0xe8e0d0, 0.05), 0, 4.9, 0));
  for (const s of [-1, 1]) { const w = mk(G.box(0.3, 2.2, 1.4), 0xe8e0d0, 0.04); w.position.set(s * 1.1, 3.4, -0.3); w.rotation.z = s * 0.4; g.add(w); }
  const socket = new THREE.Mesh(G.sph(0.5, 12, 8), BM(0x6a6a6a)); socket.position.set(0, 3.6, 0.85); g.add(socket);
  g.rotation.y = rot; place(I, g, x, z);
  addCol(I, x, z, 1.8);
  return { g, socket, gemCol };
}
// generic glowing orb / pearl mesh
function pearlMesh(c, s = 0.45) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(G.sph(s, 16, 12), new THREE.MeshToonMaterial({ color: c, gradientMap: gradTex, emissive: c, emissiveIntensity: 0.35 })));
  const hl = new THREE.Mesh(G.sph(s * 0.25, 8, 6), BM(0xffffff)); hl.position.set(-s * 0.35, s * 0.4, s * 0.6); g.add(hl);
  const halo = new THREE.Mesh(G.sph(s * 1.6, 14, 10), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.22, depthWrite: false }));
  g.add(halo); return g;
}
// light pillar (treasure / objective beacon)
function lightPillar(c = 0xfff6a0, r = 2.2, h = 120) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  m.position.y = h / 2; const g = new THREE.Group(); g.add(m);
  const m2 = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.45, r * 0.45, h, 12, 1, true), m.material.clone()); m2.material.opacity = 0.5; m2.position.y = h / 2; g.add(m2);
  scene.add(g); return g;
}
function mushroom(I, x, z, s = 1) {
  const g = new THREE.Group(); g.add(at(mk(G.cyl(0.15 * s, 0.2 * s, 0.6 * s, 8), 0xf6ecd0, 0.02), 0, 0.3 * s, 0));
  const cap = mk(new THREE.SphereGeometry(0.5 * s, 12, 8, 0, TAU, 0, Math.PI / 2), 0xe2463a, 0.03); cap.position.y = 0.55 * s; g.add(cap);
  for (let i = 0; i < 4; i++) g.add(at(new THREE.Mesh(G.sph(0.08 * s, 6, 4), BM(0xffffff)), Math.cos(i * 1.6) * 0.3 * s, 0.85 * s, Math.sin(i * 1.6) * 0.3 * s));
  g.userData.static = 1; place(I, g, x, z); return g;
}

// ---------- merge static props per material (draw-call reduction)
function mergeList(items) {
  const byMat = new Map();
  for (const it of items) { if (!byMat.has(it.mat)) byMat.set(it.mat, []); byMat.get(it.mat).push(it); }
  const out = [], v = new V3(), nm = new THREE.Matrix3();
  for (const [mat, arr] of byMat) {
    let nv = 0, ni = 0;
    for (const it of arr) { nv += it.geo.attributes.position.count; ni += it.geo.index ? it.geo.index.count : it.geo.attributes.position.count; }
    const hasCol = arr.every(it => it.geo.attributes.color), hasUv = arr.every(it => it.geo.attributes.uv);
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = hasCol ? new Float32Array(nv * 3) : null, uv = hasUv ? new Float32Array(nv * 2) : null;
    const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    let vo = 0, io = 0;
    for (const it of arr) {
      const g = it.geo, P = g.attributes.position, N = g.attributes.normal; nm.getNormalMatrix(it.matrix);
      for (let i = 0; i < P.count; i++) {
        v.fromBufferAttribute(P, i).applyMatrix4(it.matrix); pos[(vo + i) * 3] = v.x; pos[(vo + i) * 3 + 1] = v.y; pos[(vo + i) * 3 + 2] = v.z;
        v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); nor[(vo + i) * 3] = v.x; nor[(vo + i) * 3 + 1] = v.y; nor[(vo + i) * 3 + 2] = v.z;
        if (col) { col[(vo + i) * 3] = g.attributes.color.getX(i); col[(vo + i) * 3 + 1] = g.attributes.color.getY(i); col[(vo + i) * 3 + 2] = g.attributes.color.getZ(i); }
        if (uv) { uv[(vo + i) * 2] = g.attributes.uv.getX(i); uv[(vo + i) * 2 + 1] = g.attributes.uv.getY(i); }
      }
      if (g.index) for (let i = 0; i < g.index.count; i++) idx[io++] = g.index.getX(i) + vo;
      else for (let i = 0; i < P.count; i++) idx[io++] = vo + i;
      vo += P.count;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    if (col) geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); if (uv) geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeBoundingSphere();
    out.push(new THREE.Mesh(geo, mat));
  }
  return out;
}
function mergeStatic(root, filter) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const items = [], keep = [], drop = [];
  const walk = o => {
    if (o.userData.dyn) { keep.push(o); return; }
    if (o.isMesh) items.push({ geo: o.geometry, mat: o.material, matrix: new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld) });
    for (const c of o.children) walk(c);
  };
  for (const ch of [...root.children]) if (filter(ch)) { walk(ch); drop.push(ch); }
  for (const k of keep) root.attach(k);
  for (const d of drop) root.remove(d);
  for (const m of mergeList(items)) root.add(m);
  return items.length;
}
