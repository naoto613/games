// ================================================================ building kit
const MAT = {};
function buildMats() {
  MAT.plaster = stdMat({ map: TX.plaster, roughness: 0.92 });
  MAT.wood = stdMat({ map: TX.wood, roughness: 0.8 });
  MAT.planks = stdMat({ map: TX.planks, roughness: 0.85 });
  MAT.stone = stdMat({ map: TX.stone, normalMap: TX.stoneN, normalScale: new THREE.Vector2(1, 1), roughness: 0.9 });
  MAT.roofR = stdMat({ map: TX.roof, normalMap: TX.roofN, roughness: 0.75 });
  MAT.roofB = stdMat({ map: TX.roofB, normalMap: TX.roofN, roughness: 0.6, metalness: 0.1 });
  MAT.dark = stdMat({ map: TX.dark, normalMap: TX.stoneN, roughness: 0.8 });
  MAT.darkRoof = stdMat({ color: 0x2a1f38, map: TX.roofB, normalMap: TX.roofN, roughness: 0.5, metalness: 0.3 });
  MAT.shrine = stdMat({ map: TX.shrine, normalMap: TX.stoneN, roughness: 0.85 });
  MAT.cobble = stdMat({ map: TX.cobble, normalMap: TX.cobbleN, roughness: 0.9 });
  MAT.glass = new THREE.MeshStandardMaterial({ color: 0x1a2430, roughness: 0.08, metalness: 0.4, emissive: 0xffb050, emissiveIntensity: 0 });
  MAT.glassD = new THREE.MeshStandardMaterial({ color: 0x14081c, roughness: 0.2, metalness: 0.3, emissive: 0xb050ff, emissiveIntensity: 1.6 });
  MAT.cloth = stdMat({ map: TX.cloth, vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
  MAT.paint = stdMat({ vertexColors: true, roughness: 0.6 });
  MAT.iron = stdMat({ color: 0x2a2a2e, roughness: 0.45, metalness: 0.8 });
  MAT.gold = stdMat({ color: 0xd8a83a, roughness: 0.3, metalness: 1 });
  MAT.leafy = new THREE.MeshStandardMaterial({ map: TX.leaf, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.8, vertexColors: true });
  MAT.lamp = new THREE.MeshStandardMaterial({ color: 0xffe0a0, emissive: 0xffc070, emissiveIntensity: 1.2, roughness: 0.4 });
  MAT.black = new THREE.MeshBasicMaterial({ color: 0x000000 });
  MAT.lamp.userData.cast = false; MAT.glass.userData.cast = false; MAT.glassD.userData.cast = false;
}
let _H = new THREE.Matrix4();
function P(mat, geo, L, c, tile) {
  const W = _H.clone().multiply(L || IDM);
  let b = BG.get(mat); if (!b) { b = new GB(); BG.set(mat, b); }
  b.add(geo, W, c || null, tile ? worldUV(L || IDM, tile)(geo) : null);
}
const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
function prism(w, d, h) { // gable triangle prism, ridge along x, base centered at y=0
  const s = new THREE.Shape(); s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false }); g.translate(0, 0, -w / 2); g.rotateY(Math.PI / 2);
  return g;
}
function groundAtBuild(x, z) { return terrainY(x, z); }

// a half-timbered house. front (door) faces local +z
function house(x, z, rot, o) {
  o = Object.assign({ w: 7, d: 6, h: 3.4, roof: 'r', floors: 1, color: null }, o || {});
  const y0 = Math.min(groundAtBuild(x - 3, z - 3), groundAtBuild(x + 3, z + 3), groundAtBuild(x + 3, z - 3), groundAtBuild(x - 3, z + 3), groundAtBuild(x, z)) - 0.1;
  _H = M(x, y0, z, rot);
  const { w, d } = o, h = o.h * o.floors;
  const tint = o.color ? col(o.color) : null;
  P(MAT.stone, BOX(w + 0.3, 0.8, d + 0.3), M(0, 0.4, 0), null, 2.2);
  P(MAT.plaster, BOX(w, h, d), M(0, 0.8 + h / 2, 0), tint, 3);
  // timber frame
  const tb = 0.18, Y = 0.8;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P(MAT.wood, BOX(tb, h, tb), M(sx * (w / 2 + 0.02), Y + h / 2, sz * (d / 2 + 0.02)));
  for (let f = 0; f <= o.floors; f++) {
    const yy = Y + f * o.h - (f === o.floors ? tb / 2 : 0) + (f === 0 ? tb / 2 : 0);
    P(MAT.wood, BOX(w + 0.08, tb, tb), M(0, yy, d / 2 + 0.03)); P(MAT.wood, BOX(w + 0.08, tb, tb), M(0, yy, -d / 2 - 0.03));
    P(MAT.wood, BOX(tb, tb, d + 0.08), M(w / 2 + 0.03, yy, 0)); P(MAT.wood, BOX(tb, tb, d + 0.08), M(-w / 2 - 0.03, yy, 0));
  }
  for (const sz of [-1, 1]) for (const fx of [-0.25, 0.25]) {
    P(MAT.wood, BOX(tb, o.h, tb), M(fx * w, Y + o.h / 2, sz * (d / 2 + 0.03)));
    for (let f = 1; f < o.floors; f++) P(MAT.wood, BOX(tb, o.h, tb), M(fx * w, Y + f * o.h + o.h / 2, sz * (d / 2 + 0.03)));
  }
  // diagonal braces on the back
  for (const sx of [-1, 1]) { const L = Math.hypot(w * 0.25, o.h); P(MAT.wood, BOX(tb * 0.8, L, tb * 0.8), M(sx * w * 0.375, Y + o.h / 2, -d / 2 - 0.05, 0, 1, 1, 1, 0, sx * Math.atan2(w * 0.25, o.h))); }
  // roof
  const pitch = 0.62, rh = Math.tan(pitch) * (d / 2 + 0.5), top = Y + h;
  const gab = prism(w, d, Math.tan(pitch) * d / 2); P(MAT.plaster, gab, M(0, top, 0), tint, 3);
  const rl = (d / 2 + 0.7) / Math.cos(pitch);
  const rm = o.roof === 'b' ? MAT.roofB : MAT.roofR;
  for (const s of [-1, 1]) P(rm, BOX(w + 0.9, 0.16, rl), M(0, top + rh / 2 - 0.02 + 0.06, s * (d / 2 + 0.7) / 2 - s * 0.0, 0, 1, 1, 1, s * pitch), null, 2.5);
  P(MAT.wood, BOX(w + 1, 0.22, 0.22), M(0, top + rh + 0.05, 0));
  // chimney
  if (o.chimney !== false) { P(MAT.stone, BOX(0.7, 2.2, 0.7), M(w * 0.28, top + rh * 0.6 + 0.6, -d * 0.18), null, 1.5); SMOKES.push(new V3(x + Math.cos(rot) * w * 0.28 + Math.sin(rot) * -d * 0.18, y0 + top + rh * 0.6 + 1.8, z - Math.sin(rot) * w * 0.28 + Math.cos(rot) * -d * 0.18)); }
  // door
  P(MAT.planks, BOX(1.2, 2.1, 0.12), M(0, 0.8 + 1.05, d / 2 + 0.05), null, 1.5);
  P(MAT.wood, BOX(1.5, 0.16, 0.2), M(0, 0.8 + 2.15, d / 2 + 0.08));
  P(MAT.stone, BOX(1.8, 0.3, 0.8), M(0, 0.15, d / 2 + 0.5), null, 1);
  P(MAT.gold, new THREE.SphereGeometry(0.05, 8, 6), M(0.4, 0.8 + 1.0, d / 2 + 0.13));
  // windows
  const win = (lx, ly, lz, ry) => {
    P(MAT.glass, BOX(0.8, 0.9, 0.06), M(lx, ly, lz, ry));
    const L = M(lx, ly, lz, ry);
    const fr = (a, b, c, px, py) => P(MAT.wood, BOX(a, b, c), L.clone().multiply(M(px, py, 0.04)));
    fr(0.96, 0.1, 0.12, 0, 0.5); fr(0.96, 0.1, 0.12, 0, -0.5); fr(0.1, 1.0, 0.12, 0.45, 0); fr(0.1, 1.0, 0.12, -0.45, 0); fr(0.06, 0.9, 0.08, 0, 0); fr(0.9, 0.06, 0.08, 0, 0);
    // shutters + flower box
    const sc = o.shutter ? col(o.shutter) : col(0x2f5a3a);
    P(MAT.paint, BOX(0.45, 0.95, 0.06), L.clone().multiply(M(-0.72, 0, 0.05)), sc); P(MAT.paint, BOX(0.45, 0.95, 0.06), L.clone().multiply(M(0.72, 0, 0.05)), sc);
    P(MAT.wood, BOX(1.0, 0.2, 0.25), L.clone().multiply(M(0, -0.6, 0.14)));
    for (let k = -2; k <= 2; k++) P(MAT.paint, new THREE.SphereGeometry(0.07, 6, 5), L.clone().multiply(M(k * 0.18, -0.46, 0.16)), col(pick([0xe83a4a, 0xffd23a, 0xff8ab0, 0xffffff])));
  };
  for (let f = 0; f < o.floors; f++) {
    const wy = 0.8 + f * o.h + 1.7;
    for (const fx of (f === 0 ? [-0.32, 0.32] : [-0.32, 0, 0.32])) win(fx * w, wy, d / 2 + 0.04, 0);
    for (const fx of [-0.25, 0.25]) win(fx * w, wy, -d / 2 - 0.04, Math.PI);
    win(w / 2 + 0.04, wy, 0, Math.PI / 2); win(-w / 2 - 0.04, wy, 0, -Math.PI / 2);
  }
  addBox(x, z, w + 0.6, d + 0.6, rot, 'house');
  return { x, z, rot, y: y0, front: [x + Math.sin(rot) * (d / 2 + 1.6), z + Math.cos(rot) * (d / 2 + 1.6)] };
}
// market stall with an awning
function stall(x, z, rot, c1, c2) {
  const y0 = terrainY(x, z); _H = M(x, y0, z, rot);
  P(MAT.planks, BOX(3.2, 1.0, 1.2), M(0, 0.5, 0.5), null, 1.2);
  P(MAT.wood, BOX(3.4, 0.1, 1.4), M(0, 1.05, 0.5));
  for (const sx of [-1.55, 1.55]) for (const sz of [-0.6, 1.1]) P(MAT.wood, BOX(0.12, 2.6, 0.12), M(sx, 1.3, sz));
  // striped awning
  const n = 8;
  for (let i = 0; i < n; i++) P(MAT.cloth, BOX(3.6 / n, 0.04, 2.2), M(-1.8 + 3.6 / n * (i + 0.5), 2.62, 0.35, 0, 1, 1, 1, -0.22), col(i % 2 ? c1 : c2));
  for (let i = 0; i < n; i++) P(MAT.cloth, BOX(3.6 / n, 0.35, 0.03), M(-1.8 + 3.6 / n * (i + 0.5), 2.25, 1.45), col(i % 2 ? c1 : c2));
  // goods
  for (let i = 0; i < 6; i++) P(MAT.paint, BOX(0.25, 0.2, 0.25), M(-1.2 + i * 0.48, 1.2, 0.6 + (i % 2) * 0.3, i), col(pick([0xc0392b, 0x8e5a2b, 0x2e86c1, 0xd4ac0d, 0x7d3c98])));
  addBox(x, z, 3.6, 1.6, rot, 'stall');
  return { x: x - Math.sin(rot) * 0.9, z: z - Math.cos(rot) * 0.9 };
}
function barrel(x, z, s) { const y = terrainY(x, z); _H = M(x, y, z, 0); P(MAT.wood, new THREE.CylinderGeometry(0.38 * s, 0.34 * s, 0.9 * s, 12), M(0, 0.45 * s, 0)); P(MAT.iron, new THREE.TorusGeometry(0.39 * s, 0.02, 4, 16).rotateX(Math.PI / 2), M(0, 0.25 * s, 0)); P(MAT.iron, new THREE.TorusGeometry(0.39 * s, 0.02, 4, 16).rotateX(Math.PI / 2), M(0, 0.68 * s, 0)); addCol(x, z, 0.4 * s); }
function crate(x, z, r) { const y = terrainY(x, z); _H = M(x, y, z, r); P(MAT.planks, BOX(0.8, 0.8, 0.8), M(0, 0.4, 0), null, 0.8); addCol(x, z, 0.55); }
function fenceLine(pts) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2));
    for (let k = 0; k <= n; k++) {
      const x = lerp(ax, bx, k / n), z = lerp(az, bz, k / n), y = terrainY(x, z); _H = M(x, y, z, 0);
      P(MAT.wood, BOX(0.12, 1.0, 0.12), M(0, 0.5, 0));
      addCol(x, z, 0.25);
    }
    const a = Math.atan2(bx - ax, bz - az);
    for (let k = 0; k < n; k++) {
      const x = lerp(ax, bx, (k + 0.5) / n), z = lerp(az, bz, (k + 0.5) / n), y = terrainY(x, z); _H = M(x, y, z, a);
      P(MAT.wood, BOX(0.06, 0.1, L / n), M(0, 0.75, 0)); P(MAT.wood, BOX(0.06, 0.1, L / n), M(0, 0.4, 0));
    }
  }
}
const LAMPS = [];
function lampPost(x, z) {
  const y = terrainY(x, z); _H = M(x, y, z, 0);
  P(MAT.iron, new THREE.CylinderGeometry(0.06, 0.09, 3, 8), M(0, 1.5, 0));
  P(MAT.iron, BOX(0.36, 0.06, 0.36), M(0, 3.0, 0));
  P(MAT.lamp, BOX(0.26, 0.36, 0.26), M(0, 3.22, 0));
  P(MAT.iron, new THREE.ConeGeometry(0.28, 0.25, 4).rotateY(Math.PI / 4), M(0, 3.52, 0));
  addCol(x, z, 0.2);
  LAMPS.push(new V3(x, y + 3.2, z));
}
const SIGNS = [];
function signBoard(x, z, rot, text, sub) {
  const y = terrainY(x, z); _H = M(x, y, z, rot);
  P(MAT.wood, BOX(0.12, 1.6, 0.12), M(0, 0.8, 0));
  P(MAT.planks, BOX(1.4, 0.6, 0.08), M(0, 1.45, 0.06));
  const t = textTex(sub ? [text, sub] : text, { w: 512, h: 220, size: 70, color: '#2a1608', lh: 86 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.56), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.9 }));
  m.position.set(x + Math.sin(rot) * 0.11, y + 1.45, z + Math.cos(rot) * 0.11); m.rotation.y = rot; WORLD.add(m);
  addCol(x, z, 0.3);
}
function hangSign(x, y, z, rot, text, bg) {
  const t = textTex(text, { w: 512, h: 200, size: 92, color: '#fff3d0', bg: bg || '#5a2a14', stroke: '#2a1206', sw: 8 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 0.08), [MAT.wood, MAT.wood, MAT.wood, MAT.wood, new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 }), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 })]);
  m.position.set(x, y, z); m.rotation.y = rot; m.castShadow = true; WORLD.add(m);
  return m;
}
function banner(x, y, z, rot, c, h) {
  _H = M(x, y, z, rot);
  P(MAT.iron, new THREE.CylinderGeometry(0.04, 0.04, h + 1.5, 6), M(0, (h + 1.5) / 2, 0));
  const g = new THREE.PlaneGeometry(1.2, 0.8, 6, 1); g.translate(0.6, 0, 0);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 3) * 0.12);
  g.computeVertexNormals();
  P(MAT.cloth, g, M(0.02, h + 1.0, 0), col(c));
}
const SMOKES = [];

// ================================================================ places
const SPOT = {}; // named points used by the field / story
function buildVillage() {
  const C = PL.village;
  // plaza details
  _H = M(C.x, C.h - 0.02, C.z, 0);
  // fountain
  P(MAT.stone, new THREE.CylinderGeometry(2.6, 2.8, 0.7, 28, 1), M(0, 0.35, 0), null, 1.5);
  P(MAT.stone, new THREE.CylinderGeometry(0.5, 0.7, 1.8, 14), M(0, 1.0, 0), null, 1);
  P(MAT.stone, new THREE.CylinderGeometry(1.2, 0.5, 0.3, 20), M(0, 1.9, 0), null, 1);
  const fw = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.05, 28), waterMat); fw.position.set(C.x, C.h + 0.6, C.z); WORLD.add(fw);
  FOUNTAINS.push(new V3(C.x, C.h + 2.1, C.z));
  addCol(C.x, C.z, 3.0, 'fountain');
  // kindergarten castle (south)
  kinderCastle(C.x, C.z + 26);
  // houses
  const hs = [
    [-17, -14, { w: 7, d: 6, floors: 2, chimney: true }], [18, -13, { w: 6.5, d: 6, roof: 'r', shutter: 0x2c4a7a }],
    [24, 22, { w: 6, d: 6, shutter: 0x7a2c2c }], [27, 6, { w: 7, d: 6.5, floors: 2, shutter: 0x4a3a7a }],
    [-12, -30, { w: 6, d: 5.5 }], [13, -29, { w: 6, d: 5.5, shutter: 0x6a5a2a }],
    [-26, 18, { w: 6, d: 6, roof: 'b' }],
  ];
  const H = [];
  for (const [dx, dz, o] of hs) { const x = C.x + dx, z = C.z + dz; H.push(house(x, z, Math.atan2(C.x - x, C.z - z), o)); }
  // inn = big house, west
  const inn = house(C.x - 22, C.z - 2, Math.PI / 2, { w: 9, d: 7, floors: 2, roof: 'r', shutter: 0x2f5a3a });
  hangSign(C.x - 22 + 3.75, C.h + 3.3, C.z + 1.6, Math.PI / 2, 'やどや', '#2a4a2a');
  SPOT.inn1 = { x: C.x - 16.2, z: C.z - 0.6, h: Math.PI / 2 };
  // shops: stalls around the plaza
  const st1 = stall(C.x + 10, C.z + 4, -Math.PI / 2 - 0.3, 0xc0392b, 0xf3efe6);
  hangSign(C.x + 10.6, C.h + 3.4, C.z + 4.2, -Math.PI / 2 - 0.3, 'ぶきや', '#5a1e14');
  SPOT.weapon1 = { x: C.x + 11.0, z: C.z + 4.3, h: -Math.PI / 2 - 0.3 };
  const st2 = stall(C.x + 9, C.z - 6.5, -Math.PI / 2 + 0.45, 0x2e7d32, 0xf3efe6);
  hangSign(C.x + 9.5, C.h + 3.4, C.z - 6.8, -Math.PI / 2 + 0.45, 'どうぐや', '#1e3a1e');
  SPOT.item1 = { x: C.x + 10, z: C.z - 7, h: -Math.PI / 2 + 0.45 };
  // props
  for (const [dx, dz] of [[-8, -12], [8, -12], [-11, 6], [12, 13], [-6, 14], [6, 14]]) lampPost(C.x + dx, C.z + dz);
  for (const [dx, dz] of [[14, 6], [15, 7], [-16, -5], [21, -8]]) barrel(C.x + dx, C.z + dz, 1);
  for (const [dx, dz, r] of [[13.6, 1.4, 0.2], [-15, -7, 0.5], [22, 12, 0.1]]) crate(C.x + dx, C.z + dz, r);
  fenceLine([[C.x - 40, C.z - 18], [C.x - 34, C.z - 34], [C.x - 6, C.z - 40]]);
  fenceLine([[C.x + 6, C.z - 40], [C.x + 34, C.z - 34], [C.x + 40, C.z - 18]]);
  signBoard(C.x + 4, C.z - 42, 0, 'ひかりむら', '↑ きた：かわ　→ ひがし：どうくつ');
  // trees inside village
  SPOT.start = { x: C.x, z: C.z + 15, h: Math.PI };
}
const FOUNTAINS = [];
function kinderCastle(x, z) {
  const y0 = terrainY(x, z) - 0.1; _H = M(x, y0, z, Math.PI); // faces -z (north) toward plaza
  // main hall
  P(MAT.stone, BOX(14, 6, 8), M(0, 3, 0), null, 2.5);
  for (let i = -6; i <= 6; i++) P(MAT.stone, BOX(0.7, 0.8, 8.4), M(i * 1.08, 6.4, 0), null, 1.2);
  // painted hall roof
  P(MAT.roofR, prism(14.6, 8.6, 2.6), M(0, 6, 0), col(0xffffff), 2);
  // towers
  for (const sx of [-1, 1]) {
    P(MAT.stone, new THREE.CylinderGeometry(2.3, 2.5, 10, 20), M(sx * 7.5, 5, 0.5), null, 2.5);
    P(MAT.stone, new THREE.CylinderGeometry(2.7, 2.4, 0.8, 20), M(sx * 7.5, 10.2, 0.5), null, 1.5);
    P(MAT.roofR, new THREE.ConeGeometry(2.9, 5, 20), M(sx * 7.5, 13.1, 0.5), col(sx < 0 ? 0xffffff : 0xffe2b0), 2);
    P(MAT.gold, new THREE.SphereGeometry(0.25, 10, 8), M(sx * 7.5, 15.7, 0.5));
    banner(x - sx * 7.5, y0 + 15.6, z - 0.5, Math.PI, sx < 0 ? 0xffd23a : 0x3a8fe8, 0.3);
    _H = M(x, y0, z, Math.PI);
    for (const wy of [3, 6.5]) P(MAT.glass, BOX(0.7, 1.1, 0.1), M(sx * 7.5, wy, 3.05));
  }
  // central gate tower
  P(MAT.stone, BOX(5, 9, 5), M(0, 4.5, 2), null, 2.5);
  for (let i = -2; i <= 2; i++) P(MAT.stone, BOX(0.7, 0.8, 0.7), M(i * 1.1, 9.4, 4.3), null, 1);
  P(MAT.roofR, new THREE.ConeGeometry(3.6, 4.5, 4).rotateY(Math.PI / 4), M(0, 11.25, 2), col(0xffcfd8), 2);
  P(MAT.planks, BOX(2.4, 3.4, 0.2), M(0, 1.7, 4.55), null, 1.5);
  P(MAT.stone, new THREE.TorusGeometry(1.3, 0.25, 6, 16, Math.PI), M(0, 3.4, 4.6), null, 1);
  // colorful windows on main hall
  for (const sx of [-4.5, -2.6, 2.6, 4.5]) { P(MAT.glass, BOX(1.1, 1.6, 0.1), M(sx, 3.4, 4.05)); P(MAT.paint, BOX(1.4, 0.18, 0.2), M(sx, 2.5, 4.1), col(pick([0xff7a7a, 0x7ab8ff, 0xffd23a, 0x8ad07a]))); }
  // yard: slide + swing
  _H = M(x, y0, z, Math.PI);
  P(MAT.paint, BOX(1.0, 0.1, 3.4), M(-4, 1.2, 7.5, 0, 1, 1, 1, 0.55), col(0xff5a4a));
  P(MAT.paint, BOX(1.0, 2.2, 1.0), M(-4, 1.1, 5.6), col(0x3a8fe8));
  for (const sx of [3.2, 5.8]) P(MAT.iron, new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), M(sx, 1.3, 7), null);
  P(MAT.iron, new THREE.CylinderGeometry(0.06, 0.06, 2.8, 6).rotateZ(Math.PI / 2), M(4.5, 2.6, 7));
  P(MAT.planks, BOX(0.8, 0.08, 0.35), M(4.5, 0.6, 7), null, 0.5);
  // sign over the gate
  const t = textTex(['ひかり ようちえん'], { w: 1024, h: 180, size: 110, color: '#fff7d8', bg: '#1d3a8a', stroke: '#0a1840', sw: 10 });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.8), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }));
  s.position.set(x, y0 + 7.2, z - 4.62); s.rotation.y = Math.PI; WORLD.add(s);
  addBox(x, z - 0.5, 19.8, 9, 0, 'castle');
  addBox(x, z - 2, 5.6, 5.6, 0, 'castle');
  addBox(x - 4, z - 6.2, 1.4, 4, 0, 'slide'); addBox(x - 4.5, z - 7, 3.2, 0.6, 0, 'swing');
  SPOT.kinder = { x, z: z - 5.6 };
}
function buildForestTown() {
  const C = PL.forest;
  _H = M(C.x, C.h - 0.02, C.z, 0);
  // well
  P(MAT.stone, new THREE.CylinderGeometry(1.2, 1.3, 1.0, 20, 1, true), M(0, 0.5, 0), null, 1.2);
  P(MAT.stone, new THREE.TorusGeometry(1.25, 0.15, 6, 20).rotateX(Math.PI / 2), M(0, 1.0, 0), null, 1);
  P(MAT.black, new THREE.CircleGeometry(1.15, 20).rotateX(-Math.PI / 2), M(0, 0.7, 0));
  for (const sx of [-1, 1]) P(MAT.wood, BOX(0.15, 2.4, 0.15), M(sx * 1.1, 1.2, 0));
  P(MAT.roofR, prism(2.8, 2.4, 0.8), M(0, 2.4, 0), null, 1);
  addCol(C.x, C.z, 1.6, 'well');
  const hs = [
    [-16, -12, { w: 6.5, d: 6, roof: 'b', shutter: 0x2a4a2a }], [17, -12, { w: 6, d: 6, floors: 2, shutter: 0x6a3a2a }],
    [-22, 8, { w: 7, d: 6.5, shutter: 0x2c4a7a }], [22, 9, { w: 6, d: 6, roof: 'b' }],
    [-6, 22, { w: 7.5, d: 6, floors: 2 }], [10, 22, { w: 6, d: 5.5, shutter: 0x7a5a2a }],
  ];
  for (const [dx, dz, o] of hs) { const x = C.x + dx, z = C.z + dz; house(x, z, Math.atan2(C.x - x, C.z - z), o); }
  // inn (east side) – faces west
  house(C.x + 24, C.z - 2 + 0, -Math.PI / 2, { w: 8.5, d: 7, floors: 2, roof: 'r', shutter: 0x2f5a3a });
  hangSign(C.x + 24 - 3.75, C.h + 3.3, C.z - 2 - 1.6, -Math.PI / 2, 'やどや', '#2a4a2a');
  SPOT.inn2 = { x: C.x + 18.2, z: C.z - 1.4, h: -Math.PI / 2 };
  stall(C.x - 9, C.z - 3, Math.PI / 2 + 0.3, 0x7d3c98, 0xf3efe6);
  hangSign(C.x - 9.6, C.h + 3.4, C.z - 3.2, Math.PI / 2 + 0.3, 'ぶきや', '#3a1e4a');
  SPOT.weapon2 = { x: C.x - 10, z: C.z - 3.3, h: Math.PI / 2 + 0.3 };
  stall(C.x - 8, C.z + 7.5, Math.PI / 2 - 0.45, 0xd4ac0d, 0x5a3a1a);
  hangSign(C.x - 8.5, C.h + 3.4, C.z + 7.8, Math.PI / 2 - 0.45, 'どうぐや', '#4a3a0a');
  SPOT.item2 = { x: C.x - 9, z: C.z + 8, h: Math.PI / 2 - 0.45 };
  for (const [dx, dz] of [[-6, -10], [7, -10], [8, 9], [-4, 14], [14, -2]]) lampPost(C.x + dx, C.z + dz);
  for (const [dx, dz] of [[-12, 1], [-11.5, 2.2], [19, 4]]) barrel(C.x + dx, C.z + dz, 1);
  signBoard(C.x + 30, C.z + 4, Math.PI / 2, 'もりの まち ポプラ', '← ひがし：はし');
  SPOT.pochi = { x: C.x + 6, z: C.z + 6 };
  SPOT.elder = { x: C.x - 6, z: C.z + 17 };
}
// stone bridge over the river at x = 0
let bridgeGap = null;
function buildBridge() {
  const bz = PL.bridge.z, L = 34, W = 5;
  BRIDGE.z0 = bz - L / 2; BRIDGE.z1 = bz + L / 2;
  const segs = 17;
  for (let i = 0; i < segs; i++) {
    const za = BRIDGE.z0 + i * L / segs, zb = za + L / segs, zc = (za + zb) / 2;
    const ya = bridgeDeckY(za), yb = bridgeDeckY(zb);
    const broken = i >= 7 && i <= 9;
    _H = M(0, 0, 0, 0);
    const g = BOX(W, 0.5, Math.hypot(zb - za, yb - ya) + 0.02);
    const m = M(0, (ya + yb) / 2 - 0.25, zc, 0, 1, 1, 1, Math.atan2(ya - yb, zb - za));
    if (broken) { BRIDGE.gap.push({ g, m, rail: [] }); continue; }
    P(MAT.stone, g, m, null, 2);
    for (const sx of [-1, 1]) P(MAT.stone, BOX(0.4, 0.9, Math.hypot(zb - za, yb - ya) + 0.02), M(sx * (W / 2 - 0.2), (ya + yb) / 2 + 0.35, zc, 0, 1, 1, 1, Math.atan2(ya - yb, zb - za)), null, 1.5);
  }
  // arch + piers
  for (const pz of [bz - 8, bz + 8]) { _H = M(0, 0, pz, 0); P(MAT.stone, BOX(W + 0.4, 6, 2.2), M(0, -2.5, 0), null, 2); }
  // rubble in the water for the broken section
  _H = M(0, 0, 0, 0);
  const rub = new THREE.Group(); WORLD.add(rub); BRIDGE.rubble = rub;
  for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + RND() * 0.5, 0), MAT.stone); m.position.set(rr(-2, 2), -0.6 + RND() * 0.5, bz + rr(-3, 3)); m.rotation.set(RND() * 3, RND() * 3, 0); m.castShadow = true; rub.add(m); }
  BRIDGE.block = addBox(0, bz, 6, 6.4, 0, 'gap');
}
const BRIDGE = { z0: 0, z1: 0, gap: [], fixed: false, block: null, rubble: null, mesh: null };
function bridgeDeckY(z) { const t = (z - PL.bridge.z) / 17; return 1.5 + 1.4 * (1 - t * t); }
function fixBridge(animate) {
  if (BRIDGE.fixed) return;
  BRIDGE.fixed = true; BRIDGE.block.on = false;
  const gb = new GB();
  for (const s of BRIDGE.gap) gb.add(s.g, s.m, null, worldUV(s.m, 2)(s.g));
  for (const s of BRIDGE.gap) { const W = 5; for (const sx of [-1, 1]) { const rg = BOX(0.4, 0.9, s.g.parameters.depth); const rm = s.m.clone().multiply(M(sx * (W / 2 - 0.2), 0.6, 0)); gb.add(rg, rm, null, worldUV(rm, 1.5)(rg)); } }
  // a cute pastel tint: the toy blocks that fixed the bridge
  const mat = MAT.stone.clone(); mat.color = new THREE.Color(1.0, 0.92, 0.85);
  const m = new THREE.Mesh(gb.build(), mat); m.castShadow = m.receiveShadow = true; WORLD.add(m); BRIDGE.mesh = m;
  if (BRIDGE.rubble) BRIDGE.rubble.visible = false;
  if (animate) { m.position.y = 8; m.userData.anim = 0; }
}
// causeway + shrine on the lake island
function buildShrine() {
  const S = PL.shrine, L = PL.lake;
  const z0 = L.z + L.r + 6, z1 = S.z + S.r - 1;
  CAUSE.z0 = z1; CAUSE.z1 = z0; CAUSE.y = 1.7;
  _H = M(S.x, 0, 0, 0);
  P(MAT.shrine, BOX(3.6, 0.5, z0 - z1), M(0, CAUSE.y - 0.25, (z0 + z1) / 2), null, 2);
  for (let z = z1 + 2; z < z0; z += 5) { P(MAT.shrine, BOX(4, 4, 1.2), M(0, CAUSE.y - 2.6, z), null, 2); for (const sx of [-1, 1]) { P(MAT.shrine, BOX(0.3, 1.0, 0.3), M(sx * 1.65, CAUSE.y + 0.5, z), null, 1); P(MAT.lamp, BOX(0.2, 0.2, 0.2), M(sx * 1.65, CAUSE.y + 1.1, z)); } }
  // temple
  const y0 = S.h; _H = M(S.x, y0, S.z, 0);
  P(MAT.shrine, new THREE.CylinderGeometry(7, 7.6, 1.0, 8), M(0, 0.4, 0), null, 2);
  P(MAT.shrine, new THREE.CylinderGeometry(6, 6.4, 0.5, 8), M(0, 1.1, 0), null, 2);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; addCol(S.x + Math.sin(a) * 4.8, S.z + Math.cos(a) * 4.8, 0.5); P(MAT.shrine, new THREE.CylinderGeometry(0.4, 0.45, 5, 12), M(Math.sin(a) * 4.8, 3.8, Math.cos(a) * 4.8), null, 1.5); }
  P(MAT.shrine, new THREE.CylinderGeometry(5.6, 5.6, 0.6, 8), M(0, 6.5, 0), null, 2);
  P(MAT.roofB, new THREE.ConeGeometry(6.4, 4, 8), M(0, 8.8, 0), col(0x9fd0e0), 2.5);
  P(MAT.gold, new THREE.SphereGeometry(0.4, 12, 10), M(0, 11, 0));
  // stairs down (entrance)
  P(MAT.black, BOX(2.4, 0.05, 2.4), M(0, 1.38, 0));
  P(MAT.shrine, BOX(3.2, 0.5, 0.4), M(0, 1.5, 1.4), null, 1); P(MAT.shrine, BOX(3.2, 0.5, 0.4), M(0, 1.5, -1.4), null, 1);
  SPOT.shrine = { x: S.x, z: S.z + 2.2 };
  addCol(S.x, S.z, 1.0, 'shrinehole');
}
const CAUSE = { z0: 0, z1: 0, y: 0 };
function buildCaveEntrance() {
  const C = PL.cave; const x = C.x + 7, z = C.z, y0 = C.h - 0.2;
  _H = M(x, y0, z, -Math.PI / 2);
  const rg = new THREE.DodecahedronGeometry(1, 1);
  const rr2 = mulberry(4);
  for (let i = 0; i < 26; i++) {
    const a = i / 25 * Math.PI, R = 3.4 + rr2() * 0.8, s = 1.0 + rr2() * 1.1;
    P(MAT.stone, rg, M(Math.cos(a) * R, Math.sin(a) * R * 1.15, rr2() * 1.5 - 0.6, rr2() * 3, s, s * 0.9, s * 1.2, rr2() * 3), col(0x9a8a78), 2.5);
  }
  P(MAT.black, new THREE.CircleGeometry(3.3, 20, 0, Math.PI), M(0, 0, -0.5));
  // timber supports
  for (const sx of [-1, 1]) P(MAT.wood, BOX(0.35, 3.6, 0.35), M(sx * 2.4, 1.8, 0.6));
  P(MAT.wood, BOX(5.4, 0.4, 0.4), M(0, 3.6, 0.6));
  SPOT.cave = { x: x - 1.2, z };
  addBox(x + 0.9, z, 1.2, 9, 0, 'cave');
  signBoard(C.x - 4, C.z + 6, -Math.PI / 2, 'どんぐりの どうくつ', 'あぶないよ！');
}
// demon castle
let barrier = null;
const BU = { uTime: { value: 0 }, uFade: { value: 1 } };
function buildDemonCastle() {
  const C = PL.castle, x = C.x, z = C.z - 10, y0 = C.h - 0.2;
  _H = M(x, y0, z, 0);
  // keep
  P(MAT.dark, BOX(18, 16, 14), M(0, 8, 0), null, 3);
  for (let i = -8; i <= 8; i += 1.6) { P(MAT.dark, BOX(0.9, 1.2, 0.9), M(i, 16.6, 7)); P(MAT.dark, BOX(0.9, 1.2, 0.9), M(i, 16.6, -7)); }
  P(MAT.dark, BOX(8, 10, 8), M(0, 21, -1), null, 3);
  P(MAT.darkRoof, new THREE.ConeGeometry(6.4, 10, 4).rotateY(Math.PI / 4), M(0, 31, -1), null, 3);
  // towers
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    P(MAT.dark, new THREE.CylinderGeometry(3, 3.4, 22, 16), M(sx * 11, 11, sz * 8), null, 3);
    P(MAT.dark, new THREE.CylinderGeometry(3.6, 3.1, 1.2, 16), M(sx * 11, 22.6, sz * 8), null, 2);
    P(MAT.darkRoof, new THREE.ConeGeometry(3.7, 9, 16), M(sx * 11, 27.7, sz * 8), null, 3);
    for (const wy of [8, 14, 19]) P(MAT.glassD, BOX(0.7, 1.4, 0.1), M(sx * 11, wy, sz * 8 + 3.15 * (sz > 0 ? 1 : -1)));
  }
  for (const wx of [-5, -2.5, 2.5, 5]) for (const wy of [6, 11]) P(MAT.glassD, BOX(0.9, 1.8, 0.1), M(wx, wy, 7.05));
  P(MAT.glassD, new THREE.CircleGeometry(1.6, 20), M(0, 20, 3.05));
  // gate
  P(MAT.black, BOX(4.2, 6, 0.2), M(0, 3, 7.1));
  P(MAT.dark, new THREE.TorusGeometry(2.4, 0.5, 6, 18, Math.PI), M(0, 5.6, 7.1), null, 1);
  for (let i = -1.8; i <= 1.8; i += 0.6) P(MAT.iron, BOX(0.1, 5.2, 0.1), M(i, 3.6, 7.3));
  // outer wall with gap at the front
  const wallR = 24;
  for (let i = 0; i < 28; i++) {
    const a = i / 28 * Math.PI * 2; if (Math.abs(angWrap(a)) < 0.2) continue;
    const wx = Math.sin(a) * wallR, wz = Math.cos(a) * wallR + 4;
    P(MAT.dark, BOX(5.6, 5, 1.6), M(wx, 2.5, wz, a), null, 3);
    for (const k of [-2, 0, 2]) P(MAT.dark, BOX(1, 1, 1.6), M(wx + Math.cos(a) * k, 5.5, wz - Math.sin(a) * k, a));
    addBox(x + wx, z + wz, 5.6, 1.6, a, 'wall');
  }
  for (const sx of [-1, 1]) {
    P(MAT.dark, new THREE.CylinderGeometry(1.6, 1.8, 9, 12), M(sx * 5, 4.5, wallR + 4), null, 2);
    P(MAT.darkRoof, new THREE.ConeGeometry(2, 4, 12), M(sx * 5, 11, wallR + 4));
    banner(x + sx * 5, y0 + 9, z + wallR + 4, 0, 0x5a1e8a, 0.5);
    _H = M(x, y0, z, 0);
  }
  addBox(x, z, 26, 18, 0, 'keep');
  SPOT.castle = { x, z: z + 9.3 };
  // torches
  for (const sx of [-1, 1]) TORCHES.push(new V3(x + sx * 2.8, y0 + 3.5, z + 7.6));
  // barrier dome
  const bm = new THREE.ShaderMaterial({
    uniforms: BU, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 vN; varying vec3 vP; varying vec3 vV; void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vP = position; vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `uniform float uTime; uniform float uFade; varying vec3 vN; varying vec3 vP; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.5);
        float w = sin(vP.y * 0.8 - uTime * 2.0 + sin(vP.x * 0.3 + uTime) * 2.0) * 0.5 + 0.5;
        float hex = smoothstep(0.92, 1.0, abs(sin(vP.x * 1.2 + vP.y * 0.7)) * abs(sin(vP.z * 1.2 - vP.y * 0.7)));
        vec3 c = vec3(0.55, 0.18, 0.9) * (f * 1.6 + w * 0.18 + hex * 0.4) + vec3(0.9, 0.5, 1.0) * f * f;
        gl_FragColor = vec4(c * uFade, 1.0); }`
  });
  barrier = new THREE.Mesh(new THREE.SphereGeometry(40, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), bm);
  barrier.position.set(C.x, C.h - 4, C.z - 6); WORLD.add(barrier);
  BARRIER.on = true;
}
const BARRIER = { on: true, x: 0, z: 0, r: 40 };
const TORCHES = [];
function buildAll() {
  buildMats();
  buildVillage();
  buildForestTown();
  buildBridge();
  buildShrine();
  buildCaveEntrance();
  buildDemonCastle();
  BARRIER.x = PL.castle.x; BARRIER.z = PL.castle.z - 6;
  // signposts at crossroads
  signBoard(5, -44, Math.PI, '↑ まおうの しろ', '← もりの まち　→ みずうみ');
  signBoard(4, 50, 0, '↑ はし', '↓ ひかりむら');
  signBoard(150 + 3, PL.lake.z + PL.lake.r + 8, 0, 'みずうみの ほこら', '');
  flushStatic(WORLD);
}
