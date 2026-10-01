// ================================================================ dungeons (grid based)
const DMAPS = {
  cave: {
    name: 'どんぐりの どうくつ', zone: 'cave', ox: 2000, oz: 0, cell: 4.2, wallH: 4.6, theme: 'cave',
    chests: { '12,1': ['band', 2], '1,7': ['leaf', 1], '2,9': ['gold', 60] },
    map: `
###############
#S..#....T..C.#
#.#.#.#####.#.#
#.#...#...#.#.#
#.#####.#.#.#.#
#.T.#...#...#.#
###.#.#######.#
#C..#.....T...#
#####.#####.###
#.....#.......#
#.###T#..B....#
#.....#.......#
###############`},
  shrine: {
    name: 'みずうみの ほこら', zone: 'shrine', ox: 3000, oz: 0, cell: 4.4, wallH: 5.2, theme: 'shrine',
    chests: { '3,3': ['herosword', 1], '13,7': ['candy', 2], '1,11': ['juice', 2] },
    map: `
###############
#.....T#S#T...#
#.###.##.##.#.#
#.#C#.......#.#
#.#.#.#####.#.#
#...#.#...#.#.#
###.#.#.#.#.#.#
#...T.#.#.T.#C#
#.#####.#####.#
#.......#.....#
#####.#.#.###.#
#.....#...#...#
#.#####T#####.#
#......B......#
###############`},
  castle: {
    name: 'よふかし まおうの しろ', zone: 'castle', ox: 4000, oz: 0, cell: 4.6, wallH: 6.5, theme: 'castle',
    chests: { '1,5': ['heromantle', 1], '15,5': ['leaf', 2], '1,11': ['candy', 3], '9,9': ['gold', 300] },
    map: `
#################
#######.B.#######
#######...#######
#####T.....T#####
#######.#.#######
#C....#.#.#....C#
#.###.#...#.###.#
#.#.......#...#.#
#.#.###.#####.#.#
#...#T#...C...#.#
###.#.#######.#.#
#C..#...T.#.....#
#####.###.#.#####
#.......#...#...#
#.#####.#####.#.#
#...T...S.....T.#
#################`},
};
const THEMES = {
  cave: { fog: 0x07060a, fogD: 0.055, hemi: [0x8a7a6a, 0x1a1410, 0.35], torch: 0xff9a40, amb: 0x2a1c12 },
  shrine: { fog: 0x061418, fogD: 0.045, hemi: [0x6ab8d0, 0x10202a, 0.45], torch: 0x60e0ff, amb: 0x0a2a30 },
  castle: { fog: 0x0a0610, fogD: 0.04, hemi: [0x8a6ab0, 0x140a1a, 0.38], torch: 0xc070ff, amb: 0x1a0a24 },
};
const DUNG = {}; // built dungeon data
function dMats(theme) {
  if (theme === 'cave') return { wall: stdMat({ map: TX.cave, normalMap: TX.caveN, normalScale: new THREE.Vector2(1.6, 1.6), roughness: 0.95 }), floor: stdMat({ map: TX.dirt, normalMap: TX.groundN, color: 0x8a7a68, roughness: 0.95 }), ceil: stdMat({ map: TX.cave, normalMap: TX.caveN, color: 0x6a5a4a }), tile: 3.2 };
  if (theme === 'shrine') return { wall: MAT.shrine, floor: stdMat({ map: TX.cobble, normalMap: TX.cobbleN, color: 0x9ab8c0, roughness: 0.6 }), ceil: stdMat({ map: TX.shrine, color: 0x5a7a80 }), tile: 3.5 };
  return { wall: MAT.dark, floor: stdMat({ map: TX.stone, normalMap: TX.stoneN, color: 0x6a5a7a, roughness: 0.5, metalness: 0.1 }), ceil: stdMat({ map: TX.dark, color: 0x4a3a5a }), tile: 3.5 };
}
function buildDungeon(id) {
  const D = DMAPS[id], g = D.map.trim().split('\n'), H = g.length, W = g[0].length, C = D.cell;
  const grp = new THREE.Group(); grp.visible = false; scene.add(grp);
  const mats = dMats(D.theme);
  const data = { id, D, grid: g, W, H, grp, torches: [], chests: [], start: null, boss: null, crystals: [], mats };
  const cx = i => D.ox + (i - W / 2 + 0.5) * C, cz = j => D.oz + (j - H / 2 + 0.5) * C;
  data.cx = cx; data.cz = cz;
  const solid = (i, j) => i < 0 || j < 0 || i >= W || j >= H || g[j][i] === '#';
  data.solid = solid;
  const rnd = mulberry(id.length * 97);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const ch = g[j][i], x = cx(i), z = cz(j);
    _H = M(0, 0, 0, 0);
    if (ch === '#') {
      // only walls touching a floor are needed
      let edge = false; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) if (!solid(i + a, j + b)) edge = true;
      if (!edge) continue;
      P(mats.wall, BOX(C, D.wallH, C), M(x, D.wallH / 2, z), null, mats.tile);
      if (D.theme === 'cave') {
        for (let k = 0; k < 3; k++) { const s = 0.9 + rnd() * 1.2; P(mats.wall, new THREE.DodecahedronGeometry(1, 0), M(x + (rnd() - 0.5) * C, rnd() * D.wallH, z + (rnd() - 0.5) * C, rnd() * 3, s, s * 1.3, s, rnd() * 3), null, 2); }
      } else if (D.theme === 'castle' || D.theme === 'shrine') {
        P(mats.wall, BOX(C + 0.1, 0.5, C + 0.1), M(x, 0.25, z), col(0xb0b0b0), mats.tile);
        P(mats.wall, BOX(C + 0.1, 0.4, C + 0.1), M(x, D.wallH - 0.2, z), col(0xc8c8c8), mats.tile);
      }
      continue;
    }
    P(mats.floor, BOX(C, 0.3, C), M(x, -0.15, z), null, mats.tile * 0.8);
    P(mats.ceil, BOX(C, 0.3, C), M(x, D.wallH + 0.15, z), null, mats.tile);
    if (D.theme === 'cave' && rnd() < 0.3) { const s = 0.15 + rnd() * 0.3; P(mats.wall, new THREE.ConeGeometry(s, s * 5, 7), M(x + (rnd() - 0.5) * C * 0.7, D.wallH - s * 2.5, z + (rnd() - 0.5) * C * 0.7, 0, 1, 1, 1, Math.PI), null, 1); }
    if (D.theme === 'castle' && (i === Math.floor(W / 2))) P(MAT.cloth, BOX(C * 0.45, 0.02, C), M(x, 0.01, z), col(0x8a1a2a));
    if (ch === 'S') {
      data.start = { i, j, x, z };
      // light shaft + stairs going up
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, D.wallH, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2c8, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      shaft.position.set(x, D.wallH / 2, z); grp.add(shaft);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.3, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
      ring.position.set(x, 0.03, z); grp.add(ring);
    }
    if (ch === 'T') {
      // torch mounted on the first neighbouring wall
      for (const [a, b] of [[0, -1], [1, 0], [-1, 0], [0, 1]]) if (solid(i + a, j + b)) {
        const tx = x + a * (C / 2 - 0.15), tz = z + b * (C / 2 - 0.15);
        P(MAT.iron, BOX(0.12, 0.6, 0.12), M(tx, 2.2, tz));
        P(MAT.iron, new THREE.CylinderGeometry(0.16, 0.08, 0.2, 8), M(tx, 2.55, tz));
        data.torches.push(new V3(tx - a * 0.1, 2.85, tz - b * 0.1));
        break;
      }
    }
    if (ch === 'C') data.chests.push({ i, j, x, z, key: i + ',' + j, item: D.chests[i + ',' + j] });
    if (ch === 'B') data.boss = { i, j, x, z };
  }
  // shrine crystals
  if (D.theme === 'shrine') {
    const cm2 = new THREE.MeshStandardMaterial({ color: 0x80f0ff, emissive: 0x30c0e0, emissiveIntensity: 1.2, roughness: 0.1, metalness: 0.2 });
    for (let k = 0; k < 40; k++) {
      const i = Math.floor(rnd() * W), j = Math.floor(rnd() * H); if (solid(i, j)) continue;
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.2 + rnd() * 0.25), cm2); m.scale.y = 2.4;
      m.position.set(cx(i) + (rnd() - 0.5) * C * 0.8, 0.3, cz(j) + (rnd() > 0.5 ? 1 : -1) * (C / 2 - 0.3)); m.rotation.y = rnd() * 3; grp.add(m);
    }
  }
  if (D.theme === 'castle') { // throne
    const b = data.boss; _H = M(0, 0, 0, 0);
    P(MAT.cloth, BOX(2.2, 3.2, 0.4), M(b.x, 1.6, b.z - C * 0.9), col(0x5a1a7a));
    P(MAT.gold, BOX(2.4, 0.3, 0.5), M(b.x, 3.3, b.z - C * 0.9));
    P(MAT.cloth, BOX(2.0, 0.6, 1.4), M(b.x, 0.3, b.z - C * 0.7), col(0x3a0a4a));
    for (const s of [-1, 1]) { P(MAT.dark, new THREE.CylinderGeometry(0.5, 0.6, D.wallH, 12), M(b.x + s * C * 1.2, D.wallH / 2, b.z + C * 0.5), null, 2); }
  }
  for (const [mat, b] of BG) { if (b.empty) continue; const mesh = new THREE.Mesh(b.build(), mat); mesh.receiveShadow = true; mesh.castShadow = false; mesh.matrixAutoUpdate = false; grp.add(mesh); }
  BG.clear();
  // chest models
  for (const c of data.chests) { const m = makeChest(); m.position.set(c.x, 0, c.z); grp.add(m); c.model = m; }
  // torch flames (sprites)
  const th = THEMES[D.theme];
  for (const t of data.torches) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.flame, color: th.torch, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    s.scale.set(0.45, 0.9, 1); s.position.copy(t).add(new V3(0, 0.15, 0)); grp.add(s); t.spr = s;
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.dot, color: th.torch, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
    gl.scale.set(2.6, 2.6, 1); gl.position.copy(t); grp.add(gl);
  }
  // dust motes
  const N = 300, mp = new Float32Array(N * 3);
  for (let k = 0; k < N; k++) { mp[k * 3] = D.ox + (rnd() - 0.5) * W * C; mp[k * 3 + 1] = rnd() * D.wallH; mp[k * 3 + 2] = D.oz + (rnd() - 0.5) * H * C; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  grp.add(new THREE.Points(pg, new THREE.PointsMaterial({ map: TX.dot, color: D.theme === 'shrine' ? 0x9ff0ff : 0xffe0b0, size: 0.08, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })));
  DUNG[id] = data;
  return data;
}
function dungBlocked(d, x, z, r) {
  const C = d.D.cell, W = d.W, H = d.H;
  const fi = (x - d.D.ox) / C + W / 2, fj = (z - d.D.oz) / C + H / 2;
  const i0 = Math.floor(fi - r / C - 0.5), i1 = Math.floor(fi + r / C + 0.5), j0 = Math.floor(fj - r / C - 0.5), j1 = Math.floor(fj + r / C + 0.5);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    if (!d.solid(i, j)) continue;
    const bx0 = d.D.ox + (i - W / 2) * C, bz0 = d.D.oz + (j - H / 2) * C;
    const nx = clamp(x, bx0, bx0 + C), nz = clamp(z, bz0, bz0 + C);
    if ((x - nx) ** 2 + (z - nz) ** 2 < r * r) return true;
  }
  for (const c of d.chests) if ((x - c.x) ** 2 + (z - c.z) ** 2 < (r + 0.45) ** 2) return true;
  return false;
}
function dungCellAt(d, x, z) { const C = d.D.cell; return [Math.floor((x - d.D.ox) / C + d.W / 2), Math.floor((z - d.D.oz) / C + d.H / 2)]; }

// ================================================================ battle arenas for dungeons
const ARENA = {};
function buildArena(theme) {
  const grp = new THREE.Group(); grp.visible = false; scene.add(grp);
  const ox = { cave: 2000, shrine: 3000, castle: 4000, throne: 4000 }[theme], oz = theme === 'throne' ? -400 : -200;
  const mats = dMats(theme === 'throne' ? 'castle' : theme), R = 14, Hh = theme === 'throne' ? 12 : 7;
  _H = M(0, 0, 0, 0);
  P(mats.floor, new THREE.CylinderGeometry(R, R, 0.3, 40), M(ox, -0.15, oz), null, mats.tile * 0.8);
  const n = 30;
  for (let k = 0; k < n; k++) {
    const a = k / n * Math.PI * 2;
    P(mats.wall, BOX(R * 2 * Math.PI / n + 0.4, Hh, 2), M(ox + Math.sin(a) * (R + 0.8), Hh / 2, oz + Math.cos(a) * (R + 0.8), a), null, mats.tile);
    if (theme === 'cave') { const s = 1 + Math.random() * 1.6; P(mats.wall, new THREE.DodecahedronGeometry(1, 0), M(ox + Math.sin(a) * R, Math.random() * Hh, oz + Math.cos(a) * R, a, s, s * 1.4, s, Math.random() * 3), null, 2); }
  }
  P(mats.ceil, new THREE.CylinderGeometry(R + 2, R + 2, 0.3, 40), M(ox, Hh, oz), null, mats.tile);
  const torches = [];
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + 0.2; const tx = ox + Math.sin(a) * (R - 0.3), tz = oz + Math.cos(a) * (R - 0.3); P(MAT.iron, BOX(0.15, 0.6, 0.15), M(tx, 2.3, tz)); torches.push(new V3(tx, 2.9, tz)); }
  if (theme === 'throne') {
    P(MAT.cloth, BOX(3, 5, 0.5), M(ox, 2.5, oz - R + 1.5), col(0x5a1a7a)); P(MAT.gold, BOX(3.3, 0.4, 0.6), M(ox, 5.1, oz - R + 1.5));
    for (let k = -2; k <= 2; k++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 4), MAT.glassD); w.position.set(ox + k * 3.2, 6.5, oz - R + 0.25); grp.add(w); }
  }
  if (theme === 'shrine') { const cm2 = new THREE.MeshStandardMaterial({ color: 0x80f0ff, emissive: 0x30c0e0, emissiveIntensity: 1.2, roughness: 0.1 }); for (let k = 0; k < 16; k++) { const a = Math.random() * 6.28; const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.3 + Math.random() * 0.4), cm2); m.scale.y = 2.5; m.position.set(ox + Math.sin(a) * (R - 1), 0.4, oz + Math.cos(a) * (R - 1)); grp.add(m); } }
  for (const [mat, b] of BG) { if (b.empty) continue; const mesh = new THREE.Mesh(b.build(), mat); mesh.receiveShadow = true; grp.add(mesh); }
  BG.clear();
  const th = THEMES[theme === 'throne' ? 'castle' : theme];
  for (const t of torches) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.flame, color: th.torch, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.set(0.5, 1, 1); s.position.copy(t).add(new V3(0, 0.15, 0)); grp.add(s); t.spr = s;
  }
  ARENA[theme] = { grp, x: ox, z: oz, torches, theme: theme === 'throne' ? 'castle' : theme };
}
