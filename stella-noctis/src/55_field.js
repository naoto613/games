// ================================================================ field (exploration)
const fieldScene = new THREE.Scene();
const fSky = makeSky(fieldScene);

function segDist(px, pz, ax, az, bx, bz) {
  const vx = bx - ax, vz = bz - az, wx = px - ax, wz = pz - az;
  const t = clamp((wx * vx + wz * vz) / (vx * vx + vz * vz), 0, 1);
  const cx = ax + vx * t, cz = az + vz * t;
  return [Math.hypot(px - cx, pz - cz), cx, cz];
}
function pathDist(path, x, z) { let best = 1e9, bx = 0, bz = 0; for (let i = 0; i < path.length - 1; i++) { const [d, cx, cz] = segDist(x, z, path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]); if (d < best) { best = d; bx = cx; bz = cz; } } return [best, bx, bz]; }
function wall(parent, x0, z0, x1, z1, h, col = 0xd8d0c4, th = 2) {
  const L = Math.hypot(x1 - x0, z1 - z0);
  const w = mk(G.box(L, h, th), 0, 0.05, TM(col, { map: TEX.stone }));
  w.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2); w.rotation.y = -Math.atan2(z1 - z0, x1 - x0); parent.add(w);
  // crenellations
  const n = Math.floor(L / 2.4);
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; const c = new THREE.Mesh(G.box(1.2, 1, th + 0.2), TM(col, { map: TEX.stone })); c.position.set(lerp(x0, x1, t), h + 0.5, lerp(z0, z1, t)); c.rotation.y = w.rotation.y; parent.add(c); }
  return w;
}
function tower(parent, x, z, r, h, roof = 0x3a5a9a) {
  const t = mk(G.cyl(r, r * 1.05, h, 16), 0, 0.05, TM(0xe0d8cc, { map: TEX.stone })); t.position.set(x, h / 2, z); parent.add(t);
  const rf = mk(G.cone(r * 1.25, r * 2.2, 16), roof, 0.05); rf.position.set(x, h + r * 1.1, z); parent.add(rf);
  return t;
}
function cityBackdrop(parent, x, z, s, ry = 0) {
  // tiered imperial city with castle
  const g = grp(parent, x, 0, z); g.rotation.y = ry; g.scale.setScalar(s);
  const st = TM(0xe8e0d4, { map: TEX.stone });
  for (let i = 0; i < 4; i++) { const tier = mk(G.cyl(60 - i * 13, 62 - i * 13, 8, 32), 0, 0.2, st); tier.position.y = 4 + i * 8; g.add(tier); for (let k = 0; k < 10 - i * 2; k++) { const a = k / (10 - i * 2) * TAU + i; const r = 52 - i * 13; const hb = mk(G.box(6, 5 + Math.random() * 4, 6), 0, 0.15, TM(pick([0xf0e8d8, 0xe8dcc8]))); hb.position.set(Math.cos(a) * r, 8 + i * 8 + 2, Math.sin(a) * r); g.add(hb); const rf = mk(G.cone(5, 4, 4), pick([0x3a5a9a, 0x4a6ab0, 0xb04a3a]), 0.15); rf.rotation.y = Math.PI / 4; rf.position.set(Math.cos(a) * r, 8 + i * 8 + 8, Math.sin(a) * r); g.add(rf); } }
  const keep = mk(G.box(20, 22, 16), 0, 0.2, st); keep.position.y = 40 + 11; g.add(keep);
  for (const [tx, tz, r, h] of [[-12, -8, 3.5, 34], [12, -8, 3.5, 34], [-12, 8, 3, 28], [12, 8, 3, 28], [0, 0, 4.5, 46]]) { const t = mk(G.cyl(r, r, h, 12), 0, 0.15, st); t.position.set(tx, 40 + h / 2, tz); g.add(t); const rf = mk(G.cone(r * 1.3, r * 3, 12), 0x3a5ab0, 0.15); rf.position.set(tx, 40 + h + r * 1.5, tz); g.add(rf); }
  return g;
}
function mountains(parent, n = 18, R0 = 420, R1 = 620, col = 0x7a8ab0) {
  const ms = []; for (let i = 0; i < n; i++) { const a = i / n * TAU + rnd(-.1, .1), r = rnd(R0, R1), h = rnd(80, 190); ms.push(mat4(Math.cos(a) * r, -5, Math.sin(a) * r, rnd(0, TAU), rnd(90, 160), h, rnd(90, 160))); }
  inst(parent, new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0), col, ms, 0);
  const caps = ms.map(m => { const p = new V3(), q = new THREE.Quaternion(), s = new V3(); m.decompose(p, q, s); return mat4(p.x, p.y + s.y * 0.72, p.z, 0, s.x * 0.29, s.y * 0.29, s.z * 0.29); });
  inst(parent, new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0), 0xf4f6ff, caps, 0);
}
function stall(parent, x, z, ry, col = 0xd84a4a) {
  const g = grp(parent, x, 0, z); g.rotation.y = ry;
  const ctr = mk(G.box(4, 1.1, 1.4), 0, 0.03, TM(0x8a6a4a, { map: TEX.wood })); ctr.position.y = 0.55; g.add(ctr);
  for (const sx of [-1.9, 1.9]) for (const sz of [-0.6, 0.6]) at(ad(g, mk(G.cyl(0.07, 0.07, 3, 6), 0x5a3a2a, 0.02)), sx, 1.5, sz);
  const aw = mk(G.box(4.6, 0.12, 2.2), 0, 0.03, TM(col)); aw.position.set(0, 3.0, 0.2); aw.rotation.x = 0.2; g.add(aw);
  for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(G.box(0.45, 0.13, 2.25), TM(0xffffff)); s.position.set(-1.8 + i * 0.9, 3.01, 0.2); s.rotation.x = 0.2; g.add(s); }
  for (let i = 0; i < 6; i++) { const f = mk(G.sph(0.18, 8, 6), pick([0xff4a3a, 0xffc83a, 0x8ad04a, 0xff8a3a]), 0.01); f.position.set(-1.6 + i * 0.6, 1.25, 0.2); g.add(f); }
  return g;
}
function barrel(parent, x, z, s = 1) { const b = mk(G.cyl(0.45 * s, 0.4 * s, 1.1 * s, 12), 0, 0.03, TM(0x9a6a3a, { map: TEX.wood })); b.position.set(x, 0.55 * s, z); parent.add(b); for (const y of [0.2, 0.9]) { const r = new THREE.Mesh(G.cyl(0.47 * s, 0.47 * s, 0.06, 12, true), TM(0x4a4a50)); r.position.set(x, y * s, z); parent.add(r); } return b; }
function crate(parent, x, z, s = 1, ry = 0) { const c = mk(G.box(s, s, s), 0, 0.03, TM(0xb08a5a, { map: TEX.wood })); c.position.set(x, s / 2, z); c.rotation.y = ry; parent.add(c); return c; }
function lamp(parent, x, z) { const p = mk(G.cyl(0.07, 0.1, 3.4, 6), 0x2a2a30, 0.02); p.position.set(x, 1.7, z); parent.add(p); const l = new THREE.Mesh(G.box(0.4, 0.5, 0.4), BM(0xffe8a0)); l.position.set(x, 3.5, z); parent.add(l); const c = mk(G.cone(0.35, 0.3, 4), 0x2a2a30, 0.02); c.position.set(x, 3.9, z); c.rotation.y = Math.PI / 4; parent.add(c); }
function sealBarrier(parent, x, z, r) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16, 0, TAU, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x9a70ff, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
  m.position.set(x, 0, z); parent.add(m);
  const tex = TEX.runes.clone(); tex.needsUpdate = true; tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(4, 1);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1.4, 48, 1, true), new THREE.MeshBasicMaterial({ map: tex, color: 0xc8a0ff, transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
  band.position.set(x, 1.2, z); parent.add(band);
  return { m, band, update(dt) { tex.offset.x += dt * 0.05; m.material.opacity = 0.2 + Math.sin(performance.now() / 400) * 0.06; }, set visible(v) { m.visible = band.visible = v; } };
}
function arch(parent, x, z, ry, w = 8, h = 8, col = 0xd8d0c4) {
  const g = grp(parent, x, 0, z); g.rotation.y = ry;
  for (const s of [-1, 1]) { const p = mk(G.box(1.6, h, 1.6), 0, 0.04, TM(col, { map: TEX.stone })); p.position.set(s * w / 2, h / 2, 0); g.add(p); }
  const top = mk(G.box(w + 2.4, 1.4, 1.8), 0, 0.04, TM(col, { map: TEX.stone })); top.position.y = h + 0.7; g.add(top);
  return g;
}

// ---------------------------------------------------------------- areas
const AREAS = {};
AREAS.town = {
  name: '帝都アウレリア 下町', sub: 'AURELIA ― LOWER QUARTER', sky: 'town', music: 'town',
  bounds: [-37, 37, -37, 37],
  build(g, A) {
    makeTerrain(g, 140, 40, () => 0, (x, z, c) => c.setRGB(1, 0.95, 0.88), TEX.cobble, 80);
    A.fountain = fountain(g, 0, 0, !!S.flags.clear); A.solids.push([0, 0, 4.6]); A.upd.push(A.fountain);
    const H = [[-24, -27, 0], [-12, -27, 0], [0, -28, 0], [12, -27, 0], [24, -27, 0], [-24, 27, Math.PI], [-12, 27, Math.PI], [0, 28, Math.PI], [12, 27, Math.PI], [24, 27, Math.PI], [28, -10, -Math.PI / 2], [28, 10, -Math.PI / 2], [-27, -14, Math.PI / 2], [-27, 16, Math.PI / 2]];
    const R = mulberry(5);
    H.forEach(([x, z, ry], i) => A.boxes.push(house(g, x, z, 7 + R() * 2, 6 + R(), 6 + R() * 2.5, ry, { roof: [0x3a5a9a, 0xb04a3a, 0x4a7a6a, 0x8a5a9a, 0xc07a3a][i % 5] })));
    // west wall + gate
    wall(g, -38, -40, -38, -5, 9); wall(g, -38, 5, -38, 40, 9);
    tower(g, -38, -6, 2.4, 13); tower(g, -38, 6, 2.4, 13);
    arch(g, -38, 0, Math.PI / 2, 10, 9);
    A.boxes.push({ x: -38, z: -22, hw: 1.2, hd: 18, ry: 0 }, { x: -38, z: 22, hw: 1.2, hd: 18, ry: 0 });
    // outer walls
    wall(g, -40, -40, 40, -40, 10); wall(g, -40, 40, 40, 40, 10); wall(g, 40, -40, 40, 40, 10);
    // upper city & castle behind
    cityBackdrop(g, 0, -190, 1.3);
    A.rings = barrierRings(g, 0, 95, -120, 170, 3); A.upd.push(A.rings);
    mountains(g, 16, 500, 700, 0x8a9ac0);
    // props
    A.shop = stall(g, 14, 12, -0.4); A.boxes.push({ x: 14, z: 12, hw: 2.2, hd: 1, ry: -0.4 });
    for (const [x, z] of [[-20, 6], [-19, 7.2], [18, -18], [8, 20], [-8, -20]]) { barrel(g, x, z); A.solids.push([x, z, 0.6]); }
    for (const [x, z, s] of [[-21, 4.6, 1], [20, -16.5, 0.9], [9.5, 21, 1.1]]) { crate(g, x, z, s, 0.3); A.solids.push([x, z, s * 0.7]); }
    for (const [x, z] of [[-10, -10], [10, -10], [-10, 10], [10, 10], [-30, -4], [-30, 4]]) { lamp(g, x, z); A.solids.push([x, z, 0.3]); }
    trees(g, [[-18, 0, -18, 1.2], [18, 0, 18, 1.1], [-17, 0, 19, 1.0]]); A.solids.push([-18, -18, 0.8], [18, 18, 0.8], [-17, 19, 0.8]);
    flowers(g, Array.from({ length: 40 }, () => { const a = rnd(0, TAU); return [Math.cos(a) * 5.2, 0, Math.sin(a) * 5.2]; }));
    // the chef's barrel
    if (!S.chefs.town) { A.chefObj = barrel(g, 21, -19, 1.2); A.solids.push([21, -19, 0.7]); }
    A.save = savePoint(g, -30, 12); A.upd.push(A.save);
  },
};
AREAS.field = {
  name: 'ルクス平原', sub: 'LUX PLAINS', sky: 'field', music: 'field',
  bounds: [-150, 140, -150, 150],
  path: [[140, 0], [90, 6], [40, 0], [0, -20], [-50, -60], [-100, -112]],
  path2: [[40, 0], [0, 30], [-60, 70], [-112, 112]],
  build(g, A) {
    const nz = makeNoise(42);
    const pd = (x, z) => Math.min(pathDist(this.path, x, z)[0], pathDist(this.path2, x, z)[0]);
    A.h = (x, z) => { const n = nz(x * 0.012, z * 0.012) * 14 - 5 + nz(x * 0.05, z * 0.05) * 2; const d = pd(x, z); return n * smooth(4, 26, d) * 0.9 + (Math.hypot(x - 110, z - 8) < 12 ? 0 : 0); };
    makeTerrain(g, 340, 150, A.h, (x, z, c) => {
      const d = pd(x, z), n = nz(x * 0.05, z * 0.05);
      if (d < 3.4) c.setRGB(0.86, 0.78, 0.62).multiplyScalar(0.92 + n * 0.12);
      else c.setRGB(0.46 + n * 0.2, 0.72 + n * 0.1, 0.32 + n * 0.05);
    }, TEX.grass, 70, -5, 0);
    const R = mulberry(9);
    const tl = [], pl = [], rl = [], fl = [];
    for (let i = 0; i < 700; i++) {
      const x = -160 + R() * 300, z = -160 + R() * 320; const d = pd(x, z);
      if (d < 8 || Math.hypot(x - 110, z - 8) < 10 || x > 135) continue;
      const k = R();
      if (k < 0.08) tl.push([x, A.h(x, z), z, 1 + R() * 0.8]);
      else if (k < 0.11) pl.push([x, A.h(x, z), z, 1 + R() * 0.6]);
      else if (k < 0.14) rl.push([x, A.h(x, z), z, 0.6 + R() * 1.6]);
      else if (k < 0.4) fl.push([x, A.h(x, z), z]);
    }
    // forest wall NW and ruins frame SW
    for (let i = 0; i < 70; i++) { const a = R() * TAU, r = 18 + R() * 28; const x = -118 + Math.cos(a) * r, z = -128 + Math.sin(a) * r; if (Math.hypot(x + 104, z + 116) < 9 || pd(x, z) < 6) continue; tl.push([x, A.h(x, z), z, 1.6 + R()]); }
    for (const t of tl.concat(pl)) A.solids.push([t[0], t[2], 0.6 * t[3]]);
    for (const r of rl) A.solids.push([r[0], r[2], 0.9 * r[3]]);
    trees(g, tl); pines(g, pl); rocks(g, rl); flowers(g, fl);
    grassField(g, 14000, (i) => { const x = -150 + R() * 285, z = -150 + R() * 300; if (pd(x, z) < 3.5) return null; return [x, A.h(x, z), z, 0.8 + R() * 0.8]; });
    // imperial capital to the east
    wall(g, 145, -120, 145, -8, 16, 0xe0d8cc, 3); wall(g, 145, 8, 145, 120, 16, 0xe0d8cc, 3);
    tower(g, 145, -9, 3.5, 22); tower(g, 145, 9, 3.5, 22); arch(g, 145, 0, Math.PI / 2, 14, 14, 0xe0d8cc);
    for (const z of [-60, 60]) tower(g, 145, z, 3, 20);
    cityBackdrop(g, 260, 0, 1.5);
    A.rings = barrierRings(g, 250, 110, 0, 190, 3); A.upd.push(A.rings);
    A.boxes.push({ x: 145, z: -64, hw: 3, hd: 56, ry: 0 }, { x: 145, z: 64, hw: 3, hd: 56, ry: 0 });
    mountains(g, 22, 460, 700);
    // forest gate & ruins gate
    arch(g, -104, -116, -Math.PI / 4, 9, 7, 0x8a7a5a);
    const rg = arch(g, -114, 114, Math.PI / 4, 10, 9, 0xb0a8c0);
    for (let i = 0; i < 6; i++) { const a = Math.PI / 4 + rnd(-1, 1), r = rnd(10, 20); const p = mk(GEO.pillar, 0, 0.04, TM(0xc8c0d0, { map: TEX.stone })); const h = rnd(2, 7); p.scale.set(1, h, 1); p.position.set(-120 + Math.cos(a) * r, A.h(-120 + Math.cos(a) * r, 120 + Math.sin(a) * r) - 0.2, 120 + Math.sin(a) * r); g.add(p); A.solids.push([p.position.x, p.position.z, 0.9]); }
    A.seal = sealBarrier(g, -114, 114, 7); A.seal.visible = !S.flags.sealOpen; A.upd.push(A.seal);
    A.save = savePoint(g, 108, 10); A.save.g.position.y = A.h(108, 10); A.upd.push(A.save);
    // signpost
    const sp = mk(G.cyl(0.1, 0.12, 2.4, 6), 0x6a4a2a, 0.02); sp.position.set(36, A.h(36, -4) + 1.2, -4); g.add(sp);
    for (const [ry, t] of [[0.5, 1], [-2.6, 1]]) { const b = mk(G.box(1.6, 0.35, 0.08), 0x8a6a4a, 0.02); b.position.set(36, A.h(36, -4) + 2.0 - (t === 1 && ry < 0 ? 0.4 : 0), -4); b.rotation.y = ry; g.add(b); }
    A.solids.push([36, -4, 0.3]);
  },
};
AREAS.forest = {
  name: '翠光の森', sub: 'FOREST OF VERDANT LIGHT', sky: 'forest', music: 'forest',
  path: [[0, 104], [12, 70], [-15, 40], [-25, 5], [5, -25], [0, -55], [0, -88]],
  clearings: [[-25, 5, 15], [0, -90, 20], [6, -38, 8]],
  width: 6.5,
  build(g, A) {
    const nz = makeNoise(77);
    A.h = (x, z) => nz(x * 0.04, z * 0.04) * 1.6;
    A.walk = (x, z) => {
      const W = this.width, [d, cx, cz] = pathDist(this.path, x, z);
      if (d <= W) return null;
      for (const [qx, qz, r] of this.clearings) if (Math.hypot(x - qx, z - qz) <= r) return null;
      let bx = cx + (x - cx) / d * W, bz = cz + (z - cz) / d * W, be = d - W;
      for (const [qx, qz, r] of this.clearings) { const dd = Math.hypot(x - qx, z - qz); if (dd - r < be) { be = dd - r; bx = qx + (x - qx) / dd * r; bz = qz + (z - qz) / dd * r; } }
      return [bx, bz];
    };
    makeTerrain(g, 260, 110, A.h, (x, z, c) => { const n = nz(x * 0.1, z * 0.1); const d = pathDist(this.path, x, z)[0]; if (d < 2.5) c.setRGB(0.7, 0.62, 0.48); else c.setRGB(0.3 + n * 0.15, 0.52 + n * 0.12, 0.3 + n * 0.08); }, TEX.grass, 60);
    const R = mulberry(31); const tl = [];
    for (let i = 0; i < 1500; i++) {
      const x = -90 + R() * 180, z = -130 + R() * 250;
      const d = pathDist(this.path, x, z)[0]; let inC = false; for (const [qx, qz, r] of this.clearings) if (Math.hypot(x - qx, z - qz) < r + 2.5) inC = true;
      if (d < this.width + 2.5 || inC || d > 42) continue;
      if (R() < 0.45) tl.push([x, A.h(x, z), z, 1.6 + R() * 1.4]);
    }
    trees(g, tl, [0x2f7a4a, 0x3a8a50, 0x4a9a58, 0x2a6a5a, 0x5aa060], 0x5a4030);
    grassField(g, 6000, () => { const t = R(); const seg = Math.floor(R() * (this.path.length - 1)); const a = this.path[seg], b = this.path[seg + 1]; const x = lerp(a[0], b[0], t) + rnd(-12, 12), z = lerp(a[1], b[1], t) + rnd(-12, 12); return [x, A.h(x, z), z, 0.8 + R()]; }, 0x2a6a3a, 0x8ad080);
    for (let i = 0; i < 40; i++) { const seg = Math.floor(R() * (this.path.length - 1)); const a = this.path[seg], b = this.path[seg + 1], t = R(); const s = R() < 0.5 ? -1 : 1; const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz); const off = this.width + 1 + R() * 3; const x = lerp(a[0], b[0], t) - dz / L * off * s, z = lerp(a[1], b[1], t) + dx / L * off * s; mushroom(g, x, A.h(x, z), z, 0.6 + R() * 1.4); }
    for (const c of this.clearings) A.upd.push(motes(g, 50, c[0], c[1], c[2], 0.4, 5));
    A.upd.push(motes(g, 120, 0, 0, 80, 0.5, 6));
    for (let i = 0; i < 12; i++) { const p = this.path[i % this.path.length]; lightShaft(g, p[0] + rnd(-6, 6), 0, p[1] + rnd(-6, 6), 40, rnd(2.5, 5)); }
    // big ancient tree at the boss clearing
    const big = mk(G.cyl(3, 5, 26, 12), 0x5a4030, 0.08); big.position.set(0, 13, -112); g.add(big);
    for (let i = 0; i < 6; i++) { const b = mk(GEO.blob, 0, 0.1, TM(0x3a8a50)); b.scale.setScalar(rnd(9, 13)); b.position.set(rnd(-12, 12), rnd(26, 36), -112 + rnd(-8, 8)); g.add(b); }
    if (!S.chefs.forest) { A.chefObj = mushroom(g, -36, A.h(-36, 6), 6, 1.6); A.solids.push([-36, 6, 1]); }
    A.save = savePoint(g, 8, -40); A.save.g.position.y = A.h(8, -40); A.upd.push(A.save);
  },
};
AREAS.ruins = {
  name: '星詠みの遺跡', sub: 'RUINS OF THE STARGAZERS', sky: 'ruins', music: 'ruins',
  bounds: [-22, 22, -70, 92],
  build(g, A) {
    A.h = (x, z) => z > -20 ? 0 : z < -32 ? 5 : (-20 - z) / 12 * 5;
    // floor
    makeTerrain(g, 200, 120, (x, z) => (Math.abs(x) < 26 && z < 96 && z > -74) ? A.h(x, z) : A.h(x, z) - 0.2 + Math.max(0, Math.abs(x) - 26) * 0.6, (x, z, c) => c.setRGB(0.92, 0.88, 0.96), TEX.tiles, 110, 0, 10);
    const st = TM(0xd8d0e0, { map: TEX.stone });
    for (const s of [-1, 1]) {
      wall(g, s * 25, -74, s * 25, 95, 12, 0xc8c0d8, 2.5);
      for (let z = 80; z > -70; z -= 12) {
        const broken = Math.random() < 0.25; const h = broken ? rnd(2, 5) : 11;
        const p = mk(GEO.pillar, 0, 0.04, st); p.scale.set(1.2, h, 1.2); p.position.set(s * 16, A.h(s * 16, z), z); g.add(p); A.solids.push([s * 16, z, 1.0]);
        if (!broken) { const c = mk(G.box(2.4, 0.6, 2.4), 0, 0.04, st); c.position.set(s * 16, A.h(s * 16, z) + h + 0.3, z); g.add(c); }
        else { rocks(g, [[s * 16 + rnd(-2, 2), A.h(0, z), z + rnd(-2, 2), 0.7]], 0xc8c0d0); }
      }
    }
    wall(g, -25, -74, 25, -74, 14, 0xc8c0d8, 2.5);
    // stairs
    for (let i = 0; i < 12; i++) { const s = mk(G.box(20, 0.42, 1.0), 0, 0.03, st); s.position.set(0, (i + 1) * 5 / 12 - 0.21, -20.5 - i); g.add(s); }
    const plat = mk(G.box(46, 5, 40), 0, 0.04, st); plat.position.set(0, 2.5 - 0.01, -53); g.add(plat);
    // glowing rune lines
    const rl = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 100).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xb080ff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }));
    rl.position.set(0, 0.03, 35); g.add(rl);
    const c2 = new THREE.Mesh(new THREE.CircleGeometry(12, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: TEX.circle, color: 0x9a70ff, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
    c2.position.set(0, 5.04, -50); g.add(c2); A.upd.push({ update(dt) { c2.rotation.y += dt * 0.1; } });
    A.core = astraCore(g, 0, 20, -62, 3.5); A.upd.push(A.core);
    A.upd.push(barrierRings(g, 0, 20, -62, 9, 2));
    A.upd.push(motes(g, 120, 0, 10, 30, 0.5, 9, 0xc8a0ff));
    // entrance arch
    arch(g, 0, 92, 0, 14, 12, 0xc8c0d8);
    for (const [x, z] of [[-10, 60], [9, 44], [-6, 20], [12, 8]]) { rocks(g, [[x, 0, z, 1.2]], 0xb8b0c8); A.solids.push([x, z, 1.2]); }
    if (!S.chefs.ruins) { const stt = makeNPC('knight'); stt.root.position.set(-19, 0, 52); stt.root.rotation.y = Math.PI / 2; stt.root.traverse(o => { if (o.isMesh && o.material.isMeshToonMaterial) o.material = TM(0xb8b0c8, { map: TEX.stone }); }); g.add(stt.root); rigUpdate(stt, 0.016, { speed: 0 }); A.chefObj = stt.root; A.solids.push([-19, 52, 0.8]); }
    A.save = savePoint(g, 10, -6); A.upd.push(A.save);
  },
};

// ---------------------------------------------------------------- field controller
const Field = {
  area: null, A: null, player: null, cam: { yaw: Math.PI, pitch: 0.3, dist: 6.6, pos: new V3(), look: new V3() },
  npcs: [], inter: [], exits: [], triggers: [], symbols: [], grace: 0, lock: false, group: null, stepT: 0,
};
Field.load = function (id, spawn) {
  const F = Field;
  if (F.group) { fieldScene.remove(F.group); F.group.traverse(o => { if (o.geometry && !Object.values(GEO).includes(o.geometry)) o.geometry.dispose(); }); }
  const def = AREAS[id];
  F.area = id; F.def = def; S.area = id;
  const g = new THREE.Group(); fieldScene.add(g); F.group = g;
  const A = { solids: [], boxes: [], upd: [], h: () => 0 };
  F.A = A;
  def.build(g, A);
  fSky.set(SKY[S.flags.clear && id === 'town' ? 'dusk' : def.sky]);
  // player
  if (!F.player) { F.player = makeModel('sieg'); }
  g.add(F.player.root);
  const [sx, sz, sf] = spawn || [0, 0, 0];
  F.pos = new V3(sx, A.h(sx, sz), sz); F.face = sf; F.vel = 0;
  F.cam.yaw = sf + Math.PI; F.cam.pitch = 0.3;
  F.npcs = []; F.inter = []; F.exits = []; F.triggers = []; F.symbols = [];
  STORY.setupArea(id, F, A);
  // symbol encounters
  if (A.symbolSpots) for (const sp of A.symbolSpots) F.addSymbol(sp);
  F.grace = 1.5;
  F.snapCam();
  Audio2.play(S.flags.clear && id === 'town' ? 'ending' : def.music);
  showAreaName(def.name, def.sub);
};
Field.addNPC = function (o) {
  const m = makeModel(o.kind); Field.group.add(m.root);
  const n = Object.assign({ m, x: o.x, z: o.z, face: o.face || 0, r: 1.6 }, o);
  m.root.position.set(o.x, Field.A.h(o.x, o.z), o.z); m.root.rotation.y = n.face;
  Field.npcs.push(n);
  Field.A.solids.push([o.x, o.z, 0.5]);
  if (o.talk) Field.inter.push({ x: o.x, z: o.z, r: 2.2, label: o.label || '話す', fn: async () => { const prev = n.face; n.face = Math.atan2(Field.pos.x - n.x, Field.pos.z - n.z); await o.talk(n); n.face = prev; }, npc: n, cond: o.cond });
  return n;
};
Field.addSymbol = function (sp) {
  const [x, z, grpKey] = sp;
  const grp = grpKey;
  const model = makeModel(ENEMY[grp[0]].model);
  Field.group.add(model.root);
  const s = { m: model, x, z, hx: x, hz: z, face: rnd(0, TAU), grp, state: 'wander', t: rnd(0, 3), stun: 0, spd: ENEMY[grp[0]].spd || 2, id: sp[3] };
  model.root.scale.setScalar(ENEMY[grp[0]].boss ? 0.6 : 1);
  Field.symbols.push(s);
};
Field.snapCam = function () { Field.updateCam(1, true); };
Field.updateCam = function (dt, snap) {
  const F = Field, c = F.cam;
  c.yaw -= Input.camDX * 0.006; c.pitch = clamp(c.pitch + Input.camDY * 0.004, 0.08, 1.0); Input.camDX = 0; Input.camDY = 0;
  // auto-follow when moving
  if (F.vel > 1 && !Input.drag && !snap) c.yaw = dampAng(c.yaw, F.face + Math.PI, 0.8, dt);
  const dist = c.dist * (camera.aspect < 1 ? 1.35 : 1);
  const tgt = new V3(F.pos.x, F.pos.y + 1.35, F.pos.z);
  const want = new V3(tgt.x + Math.sin(c.yaw) * Math.cos(c.pitch) * dist, tgt.y + Math.sin(c.pitch) * dist, tgt.z + Math.cos(c.yaw) * Math.cos(c.pitch) * dist);
  const gh = F.A.h(want.x, want.z) + 0.8; if (want.y < gh) want.y = gh;
  if (F.camOv) { want.copy(F.camOv.pos); tgt.copy(F.camOv.look); }
  if (snap) { c.pos.copy(want); c.look.copy(tgt); }
  const ck = F.camOv ? (F.camOv.k || 2.5) : 10;
  c.pos.lerp(want, 1 - Math.exp(-ck * dt)); c.look.lerp(tgt, 1 - Math.exp(-ck * 1.4 * dt));
  camera.position.copy(c.pos); camera.lookAt(c.look);
};
Field.collide = function (x, z, r = 0.45) {
  const A = Field.A;
  for (const [sx, sz, sr] of A.solids) { const dx = x - sx, dz = z - sz, d = Math.hypot(dx, dz), m = sr + r; if (d < m && d > 0.0001) { x = sx + dx / d * m; z = sz + dz / d * m; } }
  for (const b of A.boxes) {
    const c = Math.cos(b.ry), s = Math.sin(b.ry);
    let lx = (x - b.x) * c - (z - b.z) * s, lz = (x - b.x) * s + (z - b.z) * c;
    const hw = b.hw + r, hd = b.hd + r;
    if (Math.abs(lx) < hw && Math.abs(lz) < hd) {
      if (hw - Math.abs(lx) < hd - Math.abs(lz)) lx = Math.sign(lx) * hw; else lz = Math.sign(lz) * hd;
      x = b.x + lx * c + lz * s; z = b.z - lx * s + lz * c;
    }
  }
  const bd = Field.def.bounds;
  if (bd) { x = clamp(x, bd[0], bd[1]); z = clamp(z, bd[2], bd[3]); }
  if (A.walk) { const p = A.walk(x, z); if (p) { x = p[0]; z = p[1]; } }
  return [x, z];
};
Field.update = function (dt) {
  const F = Field;
  if (!F.A) return;
  const p = F.player;
  grassUniform.value += dt;
  F.grace = Math.max(0, F.grace - dt);
  let moving = 0;
  if (!F.lock && Game.mode === 'field' && !UI.stack.length) {
    // movement
    const cy = F.cam.yaw;
    const fwdX = -Math.sin(cy), fwdZ = -Math.cos(cy), rX = -fwdZ, rZ = fwdX;
    let mx = rX * Input.mx + fwdX * Input.my, mz = rZ * Input.mx + fwdZ * Input.my;
    const L = Math.hypot(mx, mz);
    if (L > 0.1) {
      const sp = (Input.held.free ? 4 : 7.5) * Math.min(1, L);
      mx /= L; mz /= L;
      let [nx, nz] = F.collide(F.pos.x + mx * sp * dt, F.pos.z + mz * sp * dt);
      F.pos.x = nx; F.pos.z = nz; F.face = dampAng(F.face, Math.atan2(mx, mz), 14, dt); F.vel = sp; moving = 1;
      F.stepT -= dt * sp; if (F.stepT < 0) { F.stepT = 2.4; Audio2.sfx('step'); }
    } else F.vel = 0;
    F.pos.y = damp(F.pos.y, F.A.h(F.pos.x, F.pos.z), 20, dt);
    // interactions
    let best = null, bd = 1e9;
    for (const it of F.inter) { if (it.cond && !it.cond()) continue; const d = Math.hypot(it.x - F.pos.x, it.z - F.pos.z); if (d < it.r && d < bd) { bd = d; best = it; } }
    const pr = $('#prompt');
    if (best) { pr.innerHTML = `<b>${keyLabel('ok')}</b>${best.label}`; pr.classList.remove('hide'); if (Input.pressed.ok) { clearPressed(); F.runEvent(best.fn); } }
    else pr.classList.add('hide');
    // exits
    for (const e of F.exits) { if (Math.hypot(e.x - F.pos.x, e.z - F.pos.z) < e.r) { if (e.cond && !e.cond()) { if (!e._warned) { e._warned = 1; F.runEvent(e.blocked); } } else { Game.goArea(e.to, e.spawn); return; } } else e._warned = 0; }
    // triggers
    for (const t of F.triggers) { if (t.done || (t.cond && !t.cond())) continue; if (Math.hypot(t.x - F.pos.x, t.z - F.pos.z) < t.r) { t.done = true; F.runEvent(t.fn); break; } }
    // skit / menu
    if (Input.pressed.skit && Game.skitReady) { clearPressed(); F.runEvent(() => playSkit(Game.skitReady)); }
    if (Input.pressed.menu) { clearPressed(); Game.openMenu(); }
  } else F.vel = 0;
  // player model
  p.root.position.copy(F.pos); p.root.rotation.y = F.face;
  p.update(dt, { speed: F.vel, groundY: F.pos.y });
  // npcs
  for (const n of F.npcs) {
    n.m.root.rotation.y = dampAng(n.m.root.rotation.y, n.face, 6, dt);
    if (n.walkTo) { const dx = n.walkTo[0] - n.x, dz = n.walkTo[1] - n.z, d = Math.hypot(dx, dz); if (d > 0.15) { const sp = n.walkSp || 5; n.x += dx / d * Math.min(d, sp * dt); n.z += dz / d * Math.min(d, sp * dt); n.face = Math.atan2(dx, dz); n.speed = sp; } else { n.walkTo = null; n.speed = 0; } }
    n.m.root.position.set(n.x, F.A.h(n.x, n.z), n.z);
    n.m.update(dt, { speed: n.speed || 0, groundY: F.A.h(n.x, n.z) });
  }
  // symbols
  for (let i = F.symbols.length - 1; i >= 0; i--) {
    const s = F.symbols[i];
    s.t -= dt; s.stun = Math.max(0, s.stun - dt);
    const dx = F.pos.x - s.x, dz = F.pos.z - s.z, d = Math.hypot(dx, dz);
    let sp = 0;
    if (s.stun > 0) sp = 0;
    else if (d < 13 && !F.lock && Game.mode === 'field' && F.grace <= 0 && s.spd > 0) { s.face = Math.atan2(dx, dz); sp = s.spd * 0.9; s.state = 'chase'; }
    else { if (s.t <= 0) { s.t = rnd(2, 5); s.face = Math.random() < 0.6 ? rnd(0, TAU) : Math.atan2(s.hx - s.x, s.hz - s.z); s.walk = Math.random() < 0.6; } sp = s.walk && s.spd > 0 ? 1.6 : 0; }
    if (sp) { let [nx, nz] = F.collide(s.x + Math.sin(s.face) * sp * dt, s.z + Math.cos(s.face) * sp * dt, 0.6); s.x = nx; s.z = nz; }
    const y = F.A.h(s.x, s.z);
    s.m.root.position.set(s.x, y, s.z); s.m.root.rotation.y = dampAng(s.m.root.rotation.y, s.face, 8, dt);
    s.m.update(dt, { speed: sp, groundY: y });
    if (d < 1.6 && !F.lock && Game.mode === 'field' && F.grace <= 0 && s.stun <= 0) { F.encounter(s); break; }
  }
  for (const u of F.A.upd) u.update(dt);
  F.updateCam(dt);
  fSky.update(dt, camera);
  renderer.render(fieldScene, camera);
};
Field.runEvent = async function (fn) {
  const F = Field; F.lock = true; F.inEvent = (F.inEvent || 0) + 1; $('#prompt').classList.add('hide');
  try { await fn(); } catch (e) { console.error(e); }
  F.inEvent--; F.lock = F.inEvent > 0; clearPressed();
};
Field.encounter = function (s) {
  const F = Field; F.lock = true;
  Audio2.sfx('encounter');
  Game.startBattle({ enemies: s.grp, area: F.area }, (res) => {
    if (res === 'win') { F.group.remove(s.m.root); F.symbols.splice(F.symbols.indexOf(s), 1); if (s.id) S.flags['sym_' + s.id] = 1; STORY.afterBattle && STORY.afterBattle(); }
    else { s.stun = 4; F.grace = 2.5; }
  });
};
function showAreaName(n, s) {
  const el = $('#areaName'); el.querySelector('.n').textContent = n; el.querySelector('.s').textContent = s;
  el.style.opacity = 1; clearTimeout(el._t); el._t = setTimeout(() => el.style.opacity = 0, 3200);
}
