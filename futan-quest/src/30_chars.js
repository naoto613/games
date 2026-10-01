// ================================================================ character / monster models
function mk(geo, mat, parent, x, y, z, rx, ry, rz, sx, sy, sz) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x || 0, y || 0, z || 0); m.rotation.set(rx || 0, ry || 0, rz || 0);
  if (sx != null) m.scale.set(sx, sy == null ? sx : sy, sz == null ? sx : sz);
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m); return m;
}
const G = {
  sph: (r, a, b, c, d, e, f) => new THREE.SphereGeometry(r, a || 20, b || 16, c, d, e, f),
  cyl: (a, b, h, s, hs, open, ts, tl) => new THREE.CylinderGeometry(a, b, h, s || 16, hs || 1, open, ts, tl),
  cap: (r, l, s) => new THREE.CapsuleGeometry(r, l, 4, s || 12),
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  cone: (r, h, s) => new THREE.ConeGeometry(r, h, s || 16),
  tor: (r, t, a, b, arc) => new THREE.TorusGeometry(r, t, a || 8, b || 20, arc),
};
const CM = {}; // cached materials
function cm(key, o) { if (!CM[key]) CM[key] = new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.7 }, o)); return CM[key]; }
const skinM = () => cm('skin', { color: 0xf3cba8, roughness: 0.55 });
const eyeM = () => cm('eye', { color: 0x140c08, roughness: 0.05, metalness: 0.2 });
const whiteM = () => cm('white', { color: 0xffffff, roughness: 0.4 });
const hiM = () => cm('hi', { color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 });

function face(head, R, o) {
  o = o || {};
  const ey = o.ey == null ? 0.02 : o.ey, sep = o.sep || 0.36, es = o.es || 0.14;
  for (const s of [-1, 1]) {
    const e = mk(G.sph(R * es, 14, 12), eyeM(), head, s * R * sep, ey * R / 0.15, R * 0.9);
    e.scale.set(1, o.sleepy ? 0.45 : 1.15, 0.6);
    mk(G.sph(R * es * 0.35, 8, 6), hiM(), head, s * R * sep + R * 0.03, ey * R / 0.15 + R * 0.05, R * 0.97);
    if (o.brow !== false) mk(G.box(R * 0.22, R * 0.035, R * 0.04), cm('brow', { color: 0x3a2214 }), head, s * R * sep, ey * R / 0.15 + R * 0.24, R * 0.9, 0, 0, s * -0.12);
    const ch = mk(G.sph(R * 0.14, 10, 8), cm('blush', { color: 0xf49a9a, transparent: true, opacity: 0.55 }), head, s * R * 0.55, -R * 0.2, R * 0.78); ch.scale.set(1, 0.55, 0.35); ch.castShadow = false;
  }
  const mo = mk(G.tor(R * 0.12, R * 0.03, 6, 14, Math.PI), cm('mouth', { color: 0x8a2a24 }), head, 0, -R * 0.3, R * 0.93, 0, 0, Math.PI);
  return mo;
}
// ---------------------------------------------------------------- humans
function makeHuman(o) {
  // o: {kid, scale, skin, hair, hairStyle, top, bottom, skirt, shoes, hat, cape, apron, beard, glasses, sword, shield, wizard}
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const S = o.kid ? 1 : 1.62;
  const tM = new THREE.MeshStandardMaterial({ color: o.top || 0x6aa5d8, roughness: 0.85, map: TX.cloth });
  const bM = new THREE.MeshStandardMaterial({ color: o.bottom || 0x2b3550, roughness: 0.85, map: TX.cloth });
  const hM = new THREE.MeshStandardMaterial({ color: o.hair || 0x2a1a10, roughness: 0.45 });
  const shoeM = new THREE.MeshStandardMaterial({ color: o.shoes || 0x8a3a20, roughness: 0.45 });
  const sk = o.skinCol ? new THREE.MeshStandardMaterial({ color: o.skinCol, roughness: 0.55 }) : skinM();
  // proportions: kids have big heads
  const hr = o.kid ? 0.165 : 0.125, legL = o.kid ? 0.26 : 0.42, torsoH = o.kid ? 0.3 : 0.5, hip = legL + 0.1;
  const tor = new THREE.Group(); tor.position.y = hip; body.add(tor);
  mk(G.cyl(o.kid ? 0.12 : 0.15, o.kid ? 0.16 : 0.17, torsoH, 18), tM, tor, 0, torsoH / 2, 0);
  mk(G.sph(o.kid ? 0.12 : 0.15, 16, 10, 0, 6.3, 0, 1.6), tM, tor, 0, torsoH, 0, 0, 0, 0, 1, 0.5, 1);
  if (o.skirt) mk(G.cyl(o.kid ? 0.15 : 0.17, o.kid ? 0.24 : 0.3, o.kid ? 0.2 : 0.42, 18, 1), bM, tor, 0, o.kid ? -0.02 : -0.12, 0);
  else mk(G.cyl(o.kid ? 0.16 : 0.17, o.kid ? 0.165 : 0.175, 0.12, 18), bM, tor, 0, 0.0, 0);
  if (o.apron) { const a = mk(G.box(o.kid ? 0.2 : 0.3, o.kid ? 0.35 : 0.6, 0.02), new THREE.MeshStandardMaterial({ color: o.apron, roughness: 0.9, map: TX.cloth }), tor, 0, o.kid ? 0.08 : 0.06, o.kid ? 0.16 : 0.165); }
  if (o.belt) mk(G.cyl(o.kid ? 0.165 : 0.172, o.kid ? 0.165 : 0.172, 0.04, 18), cm('belt', { color: 0x4a2a14, roughness: 0.5 }), tor, 0, 0.07, 0);
  if (o.kid) { // name tag + collar
    mk(G.tor(0.095, 0.022, 8, 18).rotateX(Math.PI / 2), whiteM(), tor, 0, torsoH + 0.005, 0);
    mk(G.cyl(0.035, 0.035, 0.01, 12).rotateX(Math.PI / 2), cm('tag', { color: 0xff6a8a }), tor, 0.05, torsoH * 0.62, 0.135);
  }
  // head
  const head = new THREE.Group(); head.position.y = torsoH + hr * 0.95; tor.add(head);
  mk(G.sph(hr, 26, 22), sk, head, 0, 0, 0);
  mk(G.sph(hr * 0.17, 10, 8), sk, head, 0, -hr * 0.1, hr * 0.98).scale.set(1, 0.8, 0.6); // nose
  for (const s of [-1, 1]) mk(G.sph(hr * 0.2, 10, 8), sk, head, s * hr * 0.98, -hr * 0.05, 0).scale.set(0.5, 1, 0.8);
  const mouth = face(head, hr, { sleepy: o.sleepy });
  // hair
  const hs = o.hairStyle || 'short';
  if (hs !== 'bald') {
    const cap = mk(new THREE.SphereGeometry(hr * 1.06, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), hM, head, 0, hr * 0.02, -hr * 0.04); cap.rotation.x = -0.32;
    const back = mk(G.sph(hr * 1.03, 20, 14), hM, head, 0, -hr * 0.05, -hr * 0.12); back.scale.set(1, 0.95, 0.9);
    // bangs
    for (let i = -2; i <= 2; i++) { const b = mk(G.sph(hr * 0.32, 10, 8), hM, head, i * hr * 0.28, hr * 0.62, hr * 0.68); b.scale.set(1, 0.7, 0.55); }
  }
  if (hs === 'pigtails') for (const s of [-1, 1]) {
    const t = mk(G.sph(hr * 0.42, 14, 12), hM, head, s * hr * 1.08, -hr * 0.18, -hr * 0.3); t.scale.set(0.8, 1.25, 0.8);
    mk(G.sph(hr * 0.14, 10, 8), cm('ribbon', { color: 0xff4a7a, roughness: 0.4 }), head, s * hr * 0.98, hr * 0.15, -hr * 0.3);
  }
  if (hs === 'bun') mk(G.sph(hr * 0.5, 14, 12), hM, head, 0, hr * 0.85, -hr * 0.5);
  if (hs === 'long') { const l = mk(G.cyl(hr * 0.95, hr * 0.8, hr * 1.8, 18, 1, true), hM, head, 0, -hr * 0.8, -hr * 0.2); l.material.side = THREE.DoubleSide; }
  if (o.beard) { const b = mk(G.sph(hr * 0.7, 16, 12), cm('beard' + o.hair, { color: o.hair, roughness: 0.8 }), head, 0, -hr * 0.6, hr * 0.5); b.scale.set(1, 1.1, 0.6); }
  if (o.glasses) for (const s of [-1, 1]) mk(G.tor(hr * 0.17, hr * 0.025, 6, 16), cm('glass', { color: 0x222222, metalness: 0.6, roughness: 0.3 }), head, s * hr * 0.36, hr * 0.12, hr * 0.98);
  // hats
  if (o.hat === 'kinder') {
    const hat = new THREE.Group(); hat.position.set(0, hr * 0.35, -hr * 0.03); hat.rotation.x = -0.2; head.add(hat);
    const yM = cm('kinderhat', { color: 0xf8d21c, roughness: 0.55, map: TX.cloth });
    mk(new THREE.SphereGeometry(hr * 1.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), yM, hat, 0, 0, 0);
    mk(G.cyl(hr * 1.6, hr * 1.6, hr * 0.08, 28), yM, hat, 0, 0, 0);
    mk(G.cyl(hr * 1.11, hr * 1.11, hr * 0.2, 24, 1), cm('hatband', { color: 0xffffff, roughness: 0.6 }), hat, 0, hr * 0.12, 0);
  } else if (o.hat === 'wizard') {
    const hat = new THREE.Group(); hat.position.set(0, hr * 0.55, -hr * 0.05); hat.rotation.set(-0.15, 0, 0.12); head.add(hat);
    const pM = cm('wizhat', { color: 0x5a3aa8, roughness: 0.7, map: TX.cloth });
    mk(G.cyl(hr * 1.6, hr * 1.6, hr * 0.08, 28), pM, hat, 0, 0, 0);
    const c = mk(G.cone(hr * 0.95, hr * 2.2, 20), pM, hat, 0, hr * 1.1, 0); c.rotation.z = -0.25;
    mk(new THREE.OctahedronGeometry(hr * 0.22), cm('starY', { color: 0xffd84a, emissive: 0xffb020, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.3 }), hat, hr * 0.3, hr * 0.7, hr * 0.75);
  } else if (o.hat === 'crown') {
    const c = mk(G.cyl(hr * 0.75, hr * 0.7, hr * 0.5, 10, 1, true), MAT.gold, head, 0, hr * 1.0, 0); c.material.side = THREE.DoubleSide;
  } else if (o.hat === 'cap') {
    mk(new THREE.SphereGeometry(hr * 1.08, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), cm('cap' + o.hatCol, { color: o.hatCol || 0x8a4a2a, map: TX.cloth }), head, 0, hr * 0.25, -hr * 0.02);
  } else if (o.hat === 'scarf') {
    const s = mk(new THREE.SphereGeometry(hr * 1.12, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), cm('scarf' + o.hatCol, { color: o.hatCol || 0xb03a3a, map: TX.cloth }), head, 0, hr * 0.05, -hr * 0.08); s.rotation.x = -0.5;
  } else if (o.hat === 'chef') {
    mk(G.cyl(hr * 0.8, hr * 0.7, hr * 0.9, 16), whiteM(), head, 0, hr * 1.1, 0); mk(G.sph(hr * 0.85, 16, 12), whiteM(), head, 0, hr * 1.6, 0).scale.set(1, 0.6, 1);
  }
  // limbs
  const limb = (x, y, len, r, mat, endMat, endGeo, parent) => {
    const piv = new THREE.Group(); piv.position.set(x, y, 0); parent.add(piv);
    mk(G.cap(r, len, 10).translate(0, -len / 2 - r * 0.5, 0), mat, piv, 0, 0, 0);
    let end = null; if (endGeo) end = mk(endGeo, endMat, piv, 0, -len - r * 1.1, 0.02);
    return [piv, end];
  };
  const lr = o.kid ? 0.055 : 0.065, ar = o.kid ? 0.045 : 0.05;
  const legMat = o.kid && !o.longPants ? sk : bM;
  const [legLp] = limb(0.07 * (o.kid ? 1 : 1.2), hip, legL - lr, lr, legMat, shoeM, G.box(lr * 1.8, lr * 1.2, lr * 3.0).translate(0, 0, lr * 0.4), body);
  const [legRp] = limb(-0.07 * (o.kid ? 1 : 1.2), hip, legL - lr, lr, legMat, shoeM, G.box(lr * 1.8, lr * 1.2, lr * 3.0).translate(0, 0, lr * 0.4), body);
  if (o.kid && !o.longPants) for (const l of [legLp, legRp]) mk(G.cyl(lr * 1.1, lr * 1.1, 0.06, 10), whiteM(), l, 0, -legL + lr * 0.9, 0);
  const sh = torsoH - 0.03;
  const [armLp, handL] = limb(o.kid ? 0.15 : 0.19, sh, (o.kid ? 0.2 : 0.42), ar, tM, sk, G.sph(ar * 1.05, 10, 8), tor);
  const [armRp, handR] = limb(o.kid ? -0.15 : -0.19, sh, (o.kid ? 0.2 : 0.42), ar, tM, sk, G.sph(ar * 1.05, 10, 8), tor);
  armLp.rotation.z = 0.12; armRp.rotation.z = -0.12;
  // cape
  let cape = null;
  if (o.cape) {
    const cg = new THREE.PlaneGeometry(o.kid ? 0.36 : 0.5, o.kid ? 0.5 : 0.9, 6, 8);
    const p = cg.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); const t = 0.5 - y / (o.kid ? 0.5 : 0.9); p.setX(i, x * (1 + t * 0.6)); p.setZ(i, -Math.abs(x) * 0.3 * (1 - t) - 0.02); }
    cg.translate(0, -(o.kid ? 0.25 : 0.45), 0); cg.computeVertexNormals();
    cape = mk(cg, new THREE.MeshStandardMaterial({ color: o.cape, roughness: 0.75, side: THREE.DoubleSide, map: TX.cloth }), tor, 0, sh + 0.02, -0.15);
    mk(G.tor(0.11, 0.025, 6, 16).rotateX(Math.PI / 2), MAT.gold, tor, 0, sh + 0.02, 0);
  }
  // held items
  let sword = null, shield = null, wand = null;
  if (o.sword) { sword = new THREE.Group(); sword.position.set(0, -(o.kid ? 0.2 : 0.42) - ar, 0.03); sword.rotation.x = Math.PI / 2; armRp.add(sword); setSword(sword, o.sword); }
  if (o.wand) { wand = new THREE.Group(); wand.position.set(0, -0.2 - ar, 0.03); wand.rotation.x = Math.PI / 2.4; armRp.add(wand); setWand(wand, o.wand); }
  { shield = new THREE.Group(); shield.position.set(0.04, -(o.kid ? 0.16 : 0.36), 0.05); shield.rotation.set(0, Math.PI / 2, 0); armLp.add(shield); setShield(shield, o.shield); }
  // blob shadow (cheap contact shadow)
  const bs = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: TX.blob, transparent: true, depthWrite: false, opacity: 0.6 }));
  bs.scale.setScalar(o.kid ? 0.6 : 0.8); bs.position.y = 0.02; bs.renderOrder = 1; root.add(bs);
  root.scale.setScalar((o.scale || 1) * (o.kid ? 1 : 1));
  root.userData = { kind: 'human', body, tor, head, legL: legLp, legR: legRp, armL: armLp, armR: armRp, cape, sword, shield, wand, mouth, ph: 0, act: null, actT: 0, kid: !!o.kid };
  root.traverse(m => { if (m.isMesh && m !== bs) { m.castShadow = true; m.receiveShadow = true; } });
  return root;
}
const WEAPON_LOOK = {
  toy: { blade: 0xd8c6a0, hilt: 0xd84a3a, len: 0.42, w: 0.05, mat: 'wood' },
  sponge: { blade: 0xffe24a, hilt: 0x3a8fe8, len: 0.36, w: 0.11, hammer: true },
  star: { blade: 0xfff2a8, hilt: 0xe84a8a, len: 0.42, w: 0.03, star: true },
  hero: { blade: 0xdfe8f0, hilt: 0x2a4ab0, len: 0.55, w: 0.06, metal: true, glow: 0x7ab8ff },
};
function setSword(g, kind) {
  while (g.children.length) g.remove(g.children[0]);
  if (!kind) return;
  const L = WEAPON_LOOK[kind] || WEAPON_LOOK.toy;
  const bm = L.metal ? new THREE.MeshStandardMaterial({ color: L.blade, metalness: 1, roughness: 0.18, emissive: L.glow || 0, emissiveIntensity: 0.25 }) : new THREE.MeshStandardMaterial({ color: L.blade, roughness: L.mat === 'wood' ? 0.8 : 0.4, map: L.mat === 'wood' ? TX.wood : null });
  mk(G.cyl(0.018, 0.018, 0.12, 8), cm('hilt' + L.hilt, { color: L.hilt, roughness: 0.5 }), g, 0, 0.0, 0);
  mk(G.box(0.16, 0.025, 0.04), MAT.gold, g, 0, 0.07, 0);
  if (L.hammer) { mk(G.cyl(0.015, 0.015, L.len, 8), cm('hilt' + L.hilt, { color: L.hilt, roughness: 0.5 }), g, 0, 0.07 + L.len / 2, 0); mk(G.cyl(0.08, 0.08, 0.2, 14).rotateZ(Math.PI / 2), bm, g, 0, 0.07 + L.len, 0); }
  else {
    mk(G.box(L.w, L.len, 0.018), bm, g, 0, 0.08 + L.len / 2, 0);
    mk(G.cone(L.w * 0.72, 0.07, 4).rotateY(Math.PI / 4), bm, g, 0, 0.08 + L.len + 0.035, 0).scale.set(1, 1, 0.25);
    if (L.star) mk(new THREE.OctahedronGeometry(0.07), cm('starY', { color: 0xffd84a, emissive: 0xffb020, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.3 }), g, 0, 0.1 + L.len, 0);
  }
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
}
function setShield(g, kind) {
  while (g.children.length) g.remove(g.children[0]);
  if (!kind) return;
  if (kind === 'pot') { // pot lid!
    mk(new THREE.SphereGeometry(0.15, 20, 8, 0, Math.PI * 2, 0, 0.6), cm('lid', { color: 0xb8bcc4, metalness: 1, roughness: 0.3 }), g, 0, -0.12, 0, Math.PI / 2, 0, 0);
    mk(G.sph(0.025, 10, 8), cm('knob', { color: 0x2a2a2a, roughness: 0.4 }), g, 0, 0.0, 0.05);
  } else { // frying pan
    mk(G.cyl(0.16, 0.13, 0.04, 22).rotateX(Math.PI / 2), cm('pan', { color: 0x2a2a2e, metalness: 0.7, roughness: 0.35 }), g, 0, 0, 0.0);
    mk(G.box(0.03, 0.2, 0.02), cm('panh', { color: 0x4a2a14 }), g, 0, -0.22, 0);
  }
}
function setWand(g, kind) {
  while (g.children.length) g.remove(g.children[0]);
  const c = kind === 'rattle' ? 0xff8ab0 : kind === 'crayon' ? 0xe84a3a : 0xb07aff;
  if (kind === 'crayon') { mk(G.cyl(0.025, 0.025, 0.26, 8), cm('cray', { color: c, roughness: 0.6 }), g, 0, 0.1, 0); mk(G.cone(0.025, 0.05, 8), cm('cray'), g, 0, 0.255, 0); return; }
  mk(G.cyl(0.015, 0.015, 0.22, 8), whiteM(), g, 0, 0.1, 0);
  if (kind === 'rattle') mk(G.sph(0.06, 14, 10), cm('rattle', { color: c, roughness: 0.3 }), g, 0, 0.24, 0);
  else { mk(new THREE.OctahedronGeometry(0.07), cm('rainbow', { color: 0xffffff, emissive: 0xc080ff, emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.2 }), g, 0, 0.26, 0); }
}

// ---------------------------------------------------------------- dog (Pochi)
function makeDog() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const fur = new THREE.MeshStandardMaterial({ color: 0xd8873a, roughness: 0.85, map: TX.cloth });
  const cream = new THREE.MeshStandardMaterial({ color: 0xfaecd6, roughness: 0.85, map: TX.cloth });
  const tor = new THREE.Group(); tor.position.y = 0.36; body.add(tor);
  mk(G.cap(0.15, 0.36, 14).rotateX(Math.PI / 2), fur, tor, 0, 0, 0);
  mk(G.cap(0.12, 0.26, 12).rotateX(Math.PI / 2), cream, tor, 0, -0.05, 0.02);
  // collar
  const collar = mk(G.tor(0.11, 0.025, 6, 16), cm('collar', { color: 0xd83a3a, roughness: 0.4 }), tor, 0, 0.08, 0.28, 0.4, 0, 0);
  const head = new THREE.Group(); head.position.set(0, 0.17, 0.3); tor.add(head);
  mk(G.sph(0.15, 20, 16), fur, head, 0, 0, 0).scale.set(1, 0.95, 0.95);
  const sn = mk(G.sph(0.09, 14, 12), cream, head, 0, -0.04, 0.12); sn.scale.set(0.9, 0.75, 1.1);
  mk(G.sph(0.03, 10, 8), cm('nose', { color: 0x111111, roughness: 0.2 }), head, 0, -0.01, 0.22);
  for (const s of [-1, 1]) {
    mk(G.sph(0.026, 10, 8), eyeM(), head, s * 0.065, 0.04, 0.125).scale.set(1, 1.15, 0.7);
    mk(G.sph(0.008, 6, 4), hiM(), head, s * 0.065 + 0.008, 0.05, 0.145);
    const ear = mk(G.cone(0.055, 0.12, 4), fur, head, s * 0.085, 0.14, -0.01, 0, 0, s * -0.25); ear.scale.set(1, 1, 0.5);
    mk(G.sph(0.05, 10, 8), cream, head, s * 0.1, -0.05, 0.03).scale.set(0.7, 0.7, 0.7);
  }
  mk(G.tor(0.025, 0.007, 6, 10, Math.PI), cm('mouth', { color: 0x8a2a24 }), head, 0, -0.07, 0.19, 0, 0, Math.PI);
  const tail = new THREE.Group(); tail.position.set(0, 0.08, -0.3); tor.add(tail);
  mk(G.tor(0.07, 0.035, 8, 14, Math.PI * 1.5), fur, tail, 0, 0.07, 0, 0, Math.PI / 2, 0);
  const legs = [];
  for (const [x, z] of [[0.08, 0.17], [-0.08, 0.17], [0.08, -0.17], [-0.08, -0.17]]) {
    const piv = new THREE.Group(); piv.position.set(x, 0.3, z); body.add(piv);
    mk(G.cap(0.04, 0.2, 8).translate(0, -0.13, 0), fur, piv, 0, 0, 0);
    mk(G.sph(0.045, 10, 8), cream, piv, 0, -0.27, 0.01).scale.set(1, 0.7, 1.2);
    legs.push(piv);
  }
  const bs = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: TX.blob, transparent: true, depthWrite: false, opacity: 0.6 }));
  bs.scale.set(0.5, 1, 0.8); bs.position.y = 0.02; root.add(bs);
  root.userData = { kind: 'dog', body, tor, head, tail, legs, ph: 0, act: null, actT: 0 };
  root.traverse(m => { if (m.isMesh && m !== bs) { m.castShadow = true; m.receiveShadow = true; } });
  return root;
}

// ---------------------------------------------------------------- animation
function animChar(m, dt, speed) {
  const u = m.userData; u.ph += dt * (2 + speed * 5.5);
  const s = Math.sin(u.ph), c = Math.cos(u.ph), mv = clamp(speed, 0, 1.4);
  if (u.kind === 'human') {
    const k = mv * 0.75;
    u.legL.rotation.x = damp(u.legL.rotation.x, s * k, 20, dt); u.legR.rotation.x = damp(u.legR.rotation.x, -s * k, 20, dt);
    u.body.position.y = Math.abs(c) * 0.035 * mv + Math.sin(u.ph * 0.4) * 0.004 * (1 - mv);
    u.tor.rotation.x = damp(u.tor.rotation.x, mv * 0.12, 8, dt);
    if (u.cape) u.cape.rotation.x = damp(u.cape.rotation.x, 0.15 + mv * 0.5 + Math.sin(u.ph * 1.3) * 0.08 * mv, 6, dt);
    let aL = -s * k * 0.9, aR = s * k * 0.9, aRz = -0.12, aLz = 0.12, hx = 0, tz = 0;
    if (u.act) {
      u.actT += dt; const t = u.actT;
      if (u.act === 'attack') { const p = clamp(t / 0.45, 0, 1); aR = p < 0.4 ? lerp(0, -2.6, p / 0.4) : lerp(-2.6, 0.6, (p - 0.4) / 0.6); if (t > 0.7) u.act = null; }
      else if (u.act === 'cast') { const p = Math.min(t / 0.3, 1); aL = aR = -2.6 * p; aLz = 0.4 * p; aRz = -0.4 * p; hx = -0.2 * p; if (t > 1.0) u.act = null; }
      else if (u.act === 'hurt') { tz = 0; hx = 0.3; u.tor.rotation.x = -0.35 * Math.max(0, 1 - t / 0.5); if (t > 0.5) u.act = null; }
      else if (u.act === 'cheer') { aL = aR = -2.8 + Math.sin(t * 12) * 0.25; aLz = 0.3; aRz = -0.3; u.body.position.y = Math.abs(Math.sin(t * 6)) * 0.12; if (t > 2.4) u.act = null; }
      else if (u.act === 'guard') { aL = -1.3; aLz = -0.4; if (t > 0.9) u.act = null; }
      else if (u.act === 'down') { u.body.rotation.x = damp(u.body.rotation.x, -1.45, 8, dt); u.body.position.y = 0.06; aL = aR = -0.3; }
      else if (u.act === 'sleep') { u.head.rotation.z = damp(u.head.rotation.z, 0.35, 4, dt); hx = 0.25; }
    } else { u.body.rotation.x = damp(u.body.rotation.x, 0, 8, dt); u.head.rotation.z = damp(u.head.rotation.z, 0, 6, dt); }
    u.armL.rotation.x = damp(u.armL.rotation.x, aL, 18, dt); u.armR.rotation.x = damp(u.armR.rotation.x, aR, 18, dt);
    u.armL.rotation.z = damp(u.armL.rotation.z, aLz, 12, dt); u.armR.rotation.z = damp(u.armR.rotation.z, aRz, 12, dt);
    u.head.rotation.x = damp(u.head.rotation.x, hx, 8, dt);
  } else if (u.kind === 'dog') {
    const k = mv * 0.8;
    u.legs[0].rotation.x = s * k; u.legs[3].rotation.x = s * k; u.legs[1].rotation.x = -s * k; u.legs[2].rotation.x = -s * k;
    u.body.position.y = Math.abs(c) * 0.03 * mv;
    u.tail.rotation.y = Math.sin(u.ph * 3) * 0.5;
    u.head.rotation.x = Math.sin(u.ph * 0.5) * 0.05;
    if (u.act) {
      u.actT += dt; const t = u.actT;
      if (u.act === 'attack') { u.tor.position.z = Math.sin(clamp(t / 0.4, 0, 1) * Math.PI) * 0.25; u.head.rotation.x = -Math.sin(clamp(t / 0.4, 0, 1) * Math.PI) * 0.4; if (t > 0.6) { u.act = null; u.tor.position.z = 0; } }
      else if (u.act === 'cast' || u.act === 'cheer') { u.head.rotation.x = -0.6; u.body.position.y = Math.abs(Math.sin(t * 8)) * 0.1; if (t > 1.2) u.act = null; }
      else if (u.act === 'hurt') { u.body.rotation.x = 0.2 * Math.max(0, 1 - t / 0.4); if (t > 0.5) u.act = null; }
      else if (u.act === 'down') { u.body.rotation.z = damp(u.body.rotation.z, 1.4, 8, dt); }
      else if (u.act === 'guard') { if (t > 0.8) u.act = null; }
    } else { u.body.rotation.z = damp(u.body.rotation.z, 0, 8, dt); }
  }
}
function setAct(m, a) { if (!m) return; const u = m.userData; u.act = a; u.actT = 0; }

// ---------------------------------------------------------------- monsters
function glossy(c, o) { return new THREE.MeshPhysicalMaterial(Object.assign({ color: c, roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.4, sheenColor: new THREE.Color(0xffffff), transparent: true, opacity: 0.94 }, o)); }
function furM(c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, map: TX.cloth }); }
function monEyes(p, R, x, y, z, o) {
  o = o || {};
  for (const s of [-1, 1]) {
    const w = mk(G.sph(R, 14, 12), o.white === false ? eyeM() : cm('mwhite', { color: 0xffffff, roughness: 0.2 }), p, x + s * R * (o.sep || 1.2), y, z); w.scale.set(1, 1.15, 0.6);
    if (o.white !== false) { const pu = mk(G.sph(R * 0.55, 12, 10), eyeM(), p, x + s * R * (o.sep || 1.2) - s * R * 0.08, y - R * 0.05, z + R * 0.4); pu.scale.set(1, 1.2, 0.5); }
    mk(G.sph(R * 0.18, 6, 4), hiM(), p, x + s * R * (o.sep || 1.2) + R * 0.2, y + R * 0.3, z + R * 0.6);
    if (o.angry) mk(G.box(R * 1.4, R * 0.25, R * 0.3), eyeM(), p, x + s * R * (o.sep || 1.2), y + R * 1.05, z + R * 0.3, 0, 0, s * 0.35);
    if (o.glow) { const g = mk(G.sph(R * 0.6, 10, 8), cm('glow' + o.glow, { color: o.glow, emissive: o.glow, emissiveIntensity: 2.2 }), p, x + s * R * (o.sep || 1.2), y, z + R * 0.3); g.scale.set(1, 0.6, 0.5); }
  }
}
const MON_BUILD = {
  slime(o) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const g = new THREE.SphereGeometry(0.5, 40, 30), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const t = (y + 0.5);
      const flat = y < -0.2 ? 1 - (-(y + 0.2)) * 1.5 : 1;
      const k = (1 + (y < 0 ? 0.25 : 0) - Math.max(0, y) * 0.55) * flat;
      x *= k; z *= k;
      if (y > 0.3) { const tip = (y - 0.3) / 0.2; y += tip * tip * 0.32; x *= 1 - tip * 0.7; z *= 1 - tip * 0.7; }
      if (y < -0.32) y = -0.32 - (y + 0.32) * 0.2;
      p.setXYZ(i, x, y + 0.32, z);
    }
    g.computeVertexNormals();
    const mat = glossy(o.color);
    if (o.dark) { mat.emissive = new THREE.Color(o.color).multiplyScalar(0.25); }
    const b = mk(g, mat, body, 0, 0, 0);
    monEyes(body, 0.075, 0, 0.42, 0.33, { sep: 1.6 });
    const mo = mk(G.tor(0.11, 0.022, 6, 16, Math.PI), cm('mmouth', { color: 0x5a1010, roughness: 0.4 }), body, 0, 0.27, 0.42, 0, 0, Math.PI);
    if (o.crown) { const c = mk(G.cyl(0.14, 0.13, 0.12, 8, 1, true), MAT.gold, body, 0, 0.92, 0); c.material.side = THREE.DoubleSide; }
    root.userData = { body, b, bob: 'squash' };
    return root;
  },
  bat(o) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); body.position.y = 1.0;
    const fm = furM(o.color);
    mk(G.sph(0.22, 20, 16), fm, body, 0, 0, 0);
    for (const s of [-1, 1]) { const e = mk(G.cone(0.08, 0.2, 6), fm, body, s * 0.12, 0.2, 0, 0, 0, s * -0.3); }
    monEyes(body, 0.05, 0, 0.04, 0.18, { sep: 1.5 });
    for (const s of [-1, 1]) { const lid = mk(G.sph(0.056, 12, 8, 0, 6.3, 0, 1.4), fm, body, s * 0.075, 0.07, 0.17); lid.rotation.x = 0.2; }
    mk(G.cone(0.02, 0.04, 4), whiteM(), body, 0.04, -0.08, 0.2, Math.PI, 0, 0);
    mk(G.cone(0.02, 0.04, 4), whiteM(), body, -0.04, -0.08, 0.2, Math.PI, 0, 0);
    const wings = [];
    const wmat = new THREE.MeshStandardMaterial({ color: new THREE.Color(o.color).multiplyScalar(0.7), roughness: 0.6, side: THREE.DoubleSide });
    for (const s of [-1, 1]) {
      const sh = new THREE.Shape(); sh.moveTo(0, 0.08); sh.lineTo(0.55, 0.2); sh.quadraticCurveTo(0.5, 0.0, 0.58, -0.12); sh.quadraticCurveTo(0.42, -0.04, 0.36, -0.14); sh.quadraticCurveTo(0.26, -0.04, 0.16, -0.12); sh.quadraticCurveTo(0.1, -0.02, 0, -0.06);
      const wg = new THREE.ShapeGeometry(sh); if (s < 0) wg.scale(-1, 1, 1);
      const piv = new THREE.Group(); piv.position.set(s * 0.15, 0.02, -0.02); body.add(piv);
      mk(wg, wmat, piv, 0, 0, 0); wings.push(piv);
    }
    root.userData = { body, wings, bob: 'fly' };
    return root;
  },
  shroom(o) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    mk(G.cyl(0.2, 0.26, 0.42, 20), cm('stem', { color: 0xf3e6c8, roughness: 0.8 }), body, 0, 0.26, 0);
    const capM = new THREE.MeshPhysicalMaterial({ color: o.color, roughness: 0.35, clearcoat: 0.6 });
    const cap = mk(new THREE.SphereGeometry(0.42, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), capM, body, 0, 0.44, 0); cap.scale.set(1, 0.75, 1);
    mk(G.cyl(0.42, 0.36, 0.05, 28), cm('gill', { color: 0xe8d8b8 }), body, 0, 0.44, 0);
    const r = mulberry(5);
    for (let i = 0; i < 9; i++) { const a = r() * 6.28, el = 0.3 + r() * 0.9; const s = mk(G.sph(0.05 + r() * 0.04, 10, 8), whiteM(), body, Math.cos(a) * Math.cos(el) * 0.41, 0.44 + Math.sin(el) * 0.31, Math.sin(a) * Math.cos(el) * 0.41); s.scale.set(1, 0.4, 1); s.lookAt(0, 0.2, 0); }
    monEyes(body, 0.05, 0, 0.3, 0.2, { sep: 1.5, angry: o.angry });
    mk(G.tor(0.05, 0.012, 6, 12, Math.PI), cm('mmouth', { color: 0x5a1010 }), body, 0, 0.2, 0.235, 0, 0, Math.PI);
    const feet = [];
    for (const s of [-1, 1]) feet.push(mk(G.sph(0.08, 12, 8), cm('stem'), body, s * 0.12, 0.04, 0.05));
    root.userData = { body, feet, bob: 'hop' };
    return root;
  },
  ghost(o) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); body.position.y = 0.6;
    const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector2(Math.sin(t * Math.PI * 0.62) * 0.38 * (1 + t * 0.2), 0.5 - t * 0.9)); }
    const g = new THREE.LatheGeometry(pts, 32); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < -0.3) { const a = Math.atan2(p.getZ(i), p.getX(i)); p.setY(i, y + Math.sin(a * 6) * 0.06); } }
    g.computeVertexNormals();
    mk(g, new THREE.MeshPhysicalMaterial({ color: o.color, roughness: 0.4, transparent: true, opacity: 0.82, side: THREE.DoubleSide, emissive: o.color, emissiveIntensity: 0.25, sheen: 1, sheenColor: new THREE.Color(0xaaccff) }), body, 0, 0, 0);
    for (const s of [-1, 1]) { const e = mk(G.sph(0.06, 12, 10), eyeM(), body, s * 0.11, 0.2, 0.32); e.scale.set(0.8, 1.4, 0.5); }
    const mo = mk(G.sph(0.06, 12, 10), eyeM(), body, 0, 0.04, 0.35); mo.scale.set(1, 0.8, 0.4);
    const arms = []; for (const s of [-1, 1]) arms.push(mk(G.sph(0.09, 12, 10), body.children[0].material, body, s * 0.4, 0.0, 0.05));
    root.userData = { body, arms, bob: 'float' };
    return root;
  },
  golem(o) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const cols = [0xe84a3a, 0x3a8fe8, 0xf8c81c, 0x4ab84a, 0xe88a2a, 0xa84ae8];
    const letters = ['あ', 'い', 'う', 'え', 'お', 'か'];
    const blockMat = (k) => { const t = canvasTex(128, 128, (x) => { x.fillStyle = '#' + new THREE.Color(cols[k]).getHexString(); x.fillRect(0, 0, 128, 128); x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 8; x.strokeRect(4, 4, 120, 120); x.fillStyle = '#fff'; x.font = '900 84px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(letters[k], 64, 70); }, true, false); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.45 }); };
    const tint = o.color ? new THREE.Color(o.color) : null;
    const bm = cols.map((_, k) => { const m = blockMat(k); if (tint) m.color = tint; return m; });
    mk(G.box(0.7, 0.6, 0.5), bm[0], body, 0, 0.95, 0);
    mk(G.box(0.5, 0.4, 0.4), bm[1], body, 0, 0.55, 0);
    const head = mk(G.box(0.42, 0.42, 0.42), bm[2], body, 0, 1.47, 0);
    monEyes(body, 0.05, 0, 1.5, 0.22, { sep: 1.6, white: false });
    const arms = [], legs = [];
    for (const s of [-1, 1]) {
      const a = new THREE.Group(); a.position.set(s * 0.48, 1.15, 0); body.add(a); mk(G.box(0.24, 0.24, 0.24), bm[3], a, 0, -0.12, 0); mk(G.box(0.28, 0.28, 0.28), bm[4], a, 0, -0.4, 0); arms.push(a);
      const l = new THREE.Group(); l.position.set(s * 0.17, 0.4, 0); body.add(l); mk(G.box(0.24, 0.4, 0.26), bm[5], l, 0, -0.2, 0); legs.push(l);
    }
    root.userData = { body, arms, legs, bob: 'stomp' };
    return root;
  },
  dragon(o) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const sc = new THREE.MeshPhysicalMaterial({ color: o.color, roughness: 0.4, clearcoat: 0.5, map: TX.cloth });
    const belly = cm('belly' + o.belly, { color: o.belly || 0xf2d89a, roughness: 0.6 });
    const tor = new THREE.Group(); tor.position.y = 0.55; body.add(tor);
    mk(G.sph(0.32, 20, 16), sc, tor, 0, 0, 0).scale.set(1, 1.1, 1);
    mk(G.sph(0.26, 18, 14), belly, tor, 0, -0.02, 0.1).scale.set(0.9, 1.05, 0.9);
    const head = new THREE.Group(); head.position.set(0, 0.42, 0.08); tor.add(head);
    mk(G.sph(0.24, 20, 16), sc, head, 0, 0, 0);
    const sn = mk(G.sph(0.15, 16, 12), sc, head, 0, -0.06, 0.18); sn.scale.set(1, 0.7, 1);
    for (const s of [-1, 1]) { mk(G.sph(0.02, 6, 4), eyeM(), head, s * 0.05, -0.02, 0.32); mk(G.cone(0.04, 0.16, 8), cm('horn', { color: 0xf3e8c8, roughness: 0.5 }), head, s * 0.12, 0.2, -0.05, -0.4, 0, s * -0.3); }
    monEyes(head, 0.055, 0, 0.07, 0.17, { sep: 1.5, angry: true });
    const wings = [];
    const wm = new THREE.MeshStandardMaterial({ color: new THREE.Color(o.wing || o.color).multiplyScalar(0.8), roughness: 0.5, side: THREE.DoubleSide });
    for (const s of [-1, 1]) {
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.5, 0.35); sh.lineTo(0.45, -0.05); sh.lineTo(0.32, 0.05); sh.lineTo(0.22, -0.1); sh.lineTo(0.1, 0.0); sh.lineTo(0, -0.12);
      const wg = new THREE.ShapeGeometry(sh); if (s < 0) wg.scale(-1, 1, 1);
      const piv = new THREE.Group(); piv.position.set(s * 0.18, 0.15, -0.2); tor.add(piv); mk(wg, wm, piv, 0, 0, 0); piv.rotation.y = s * 0.5; wings.push(piv);
    }
    const tail = mk(G.cone(0.13, 0.6, 12), sc, tor, 0, -0.2, -0.4, -1.9, 0, 0);
    const legs = []; for (const s of [-1, 1]) legs.push(mk(G.cap(0.08, 0.2, 8), sc, body, s * 0.16, 0.18, 0));
    for (const s of [-1, 1]) mk(G.cap(0.05, 0.15, 8), sc, tor, s * 0.27, 0.05, 0.12, 0.6, 0, s * 0.4);
    root.userData = { body, tor, head, wings, legs, bob: 'dragon' };
    return root;
  },
  bear(o) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const fm = furM(o.color || 0x7a4a2a), lt = furM(0xd8a878);
    const tor = new THREE.Group(); tor.position.y = 1.1; body.add(tor);
    mk(G.sph(0.85, 28, 22), fm, tor, 0, 0, 0).scale.set(1, 1.1, 0.9);
    mk(G.sph(0.6, 24, 18), lt, tor, 0, -0.1, 0.38).scale.set(1, 1.1, 0.6);
    const head = new THREE.Group(); head.position.set(0, 1.1, 0.12); tor.add(head);
    mk(G.sph(0.52, 26, 20), fm, head, 0, 0, 0);
    mk(G.sph(0.24, 16, 12), lt, head, 0, -0.12, 0.42).scale.set(1.1, 0.8, 0.8);
    mk(G.sph(0.08, 12, 10), cm('nose', { color: 0x111111, roughness: 0.2 }), head, 0, -0.04, 0.6);
    for (const s of [-1, 1]) {
      mk(G.sph(0.17, 14, 12), fm, head, s * 0.38, 0.4, -0.05); mk(G.sph(0.1, 12, 10), lt, head, s * 0.38, 0.4, 0.04).scale.set(1, 1, 0.5);
      const e = mk(G.box(0.12, 0.025, 0.03), eyeM(), head, s * 0.18, 0.1, 0.48, 0, 0, s * 0.15); // sleepy eyes
    }
    // nightcap
    const hat = mk(G.cone(0.42, 0.9, 20), new THREE.MeshStandardMaterial({ color: 0x3a6ad8, roughness: 0.8, map: TX.cloth }), head, 0.1, 0.62, -0.05, -0.3, 0, -0.4);
    mk(G.sph(0.1, 12, 10), whiteM(), head, 0.42, 0.98, -0.12);
    mk(G.tor(0.42, 0.07, 8, 22).rotateX(Math.PI / 2), whiteM(), head, 0.04, 0.33, -0.02, -0.3, 0, -0.4);
    const arms = [], legs = [];
    for (const s of [-1, 1]) {
      const a = new THREE.Group(); a.position.set(s * 0.8, 0.45, 0.1); tor.add(a); mk(G.cap(0.22, 0.6, 12).translate(0, -0.4, 0), fm, a, 0, 0, 0); arms.push(a); a.rotation.z = s * 0.4;
      const l = mk(G.cap(0.26, 0.4, 12), fm, body, s * 0.42, 0.35, 0.1); legs.push(l);
    }
    root.userData = { body, tor, head, arms, legs, bob: 'big' };
    return root;
  },
  knight(o) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const ar = new THREE.MeshStandardMaterial({ color: o.color || 0x2a2840, metalness: 0.9, roughness: 0.3 });
    const tor = new THREE.Group(); tor.position.y = 1.1; body.add(tor);
    mk(G.cyl(0.32, 0.26, 0.7, 16), ar, tor, 0, 0.3, 0);
    mk(G.sph(0.34, 16, 12, 0, 6.3, 0, 1.6), ar, tor, 0, 0.62, 0).scale.set(1.2, 0.5, 1);
    const head = new THREE.Group(); head.position.y = 0.95; tor.add(head);
    mk(G.cyl(0.2, 0.22, 0.38, 16), ar, head, 0, 0, 0); mk(G.sph(0.2, 16, 10, 0, 6.3, 0, 1.6), ar, head, 0, 0.19, 0);
    mk(G.box(0.3, 0.05, 0.05), cm('slit', { color: 0x000000 }), head, 0, 0.02, 0.2);
    monEyes(head, 0.035, 0, 0.03, 0.2, { sep: 1.8, white: false, glow: 0xc060ff });
    mk(G.cone(0.05, 0.5, 8), cm('plume', { color: 0x8a2ad8, roughness: 0.8 }), head, 0, 0.45, -0.05, -0.4, 0, 0);
    const cape = mk(G.cyl(0.3, 0.6, 1.2, 16, 1, true, Math.PI * 0.6, Math.PI * 0.8), new THREE.MeshStandardMaterial({ color: 0x1a0a2a, roughness: 0.8, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }), tor, 0, 0.1, -0.05);
    const arms = [], legs = [];
    for (const s of [-1, 1]) {
      const a = new THREE.Group(); a.position.set(s * 0.42, 0.55, 0); tor.add(a); mk(G.sph(0.16, 12, 10), ar, a, 0, 0, 0); mk(G.cap(0.1, 0.4, 8).translate(0, -0.3, 0), ar, a, 0, 0, 0); arms.push(a);
      const l = new THREE.Group(); l.position.set(s * 0.15, 0.85, 0); body.add(l); mk(G.cap(0.12, 0.55, 8).translate(0, -0.42, 0), ar, l, 0, 0, 0); legs.push(l);
    }
    const sw = new THREE.Group(); sw.position.y = -0.55; sw.rotation.x = Math.PI / 2; arms[1].add(sw);
    mk(G.box(0.08, 1.2, 0.02), new THREE.MeshStandardMaterial({ color: 0x8a6aff, metalness: 1, roughness: 0.2, emissive: 0x5020a0, emissiveIntensity: 0.6 }), sw, 0, 0.65, 0);
    mk(G.box(0.3, 0.05, 0.06), MAT.gold, sw, 0, 0.05, 0);
    const shd = mk(G.cyl(0.35, 0.35, 0.06, 6).rotateX(Math.PI / 2), ar, arms[0], 0.05, -0.4, 0.12, 0, Math.PI / 2, 0);
    root.userData = { body, tor, head, arms, legs, bob: 'knight' };
    return root;
  },
  owl(o) { // the demon king, first form: a night-owl sorcerer
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const fm = furM(o.color || 0x3a2a5a), lt = furM(0x8a7aa8);
    const tor = new THREE.Group(); tor.position.y = 1.4; body.add(tor);
    mk(G.sph(0.8, 28, 22), fm, tor, 0, 0, 0).scale.set(1, 1.25, 0.95);
    mk(G.sph(0.55, 24, 18), lt, tor, 0, -0.1, 0.38).scale.set(1, 1.3, 0.6);
    // robe
    const robe = mk(G.cyl(0.6, 1.1, 1.6, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x2a0a3a, roughness: 0.7, side: THREE.DoubleSide, map: TX.cloth }), body, 0, 0.8, -0.05);
    mk(G.tor(0.62, 0.06, 8, 26).rotateX(Math.PI / 2), MAT.gold, body, 0, 1.55, -0.05);
    const head = new THREE.Group(); head.position.set(0, 1.2, 0.05); tor.add(head);
    mk(G.sph(0.62, 26, 20), fm, head, 0, 0, 0).scale.set(1.1, 0.95, 1);
    for (const s of [-1, 1]) {
      mk(G.sph(0.25, 18, 14), cm('owlring', { color: 0xd8c8f0, roughness: 0.6 }), head, s * 0.26, 0.05, 0.42).scale.set(1, 1, 0.4);
      mk(G.sph(0.15, 16, 12), cm('owleye', { color: 0xffd23a, emissive: 0xffa000, emissiveIntensity: 0.8, roughness: 0.2 }), head, s * 0.26, 0.05, 0.5).scale.set(1, 1, 0.5);
      mk(G.sph(0.07, 12, 10), eyeM(), head, s * 0.26, 0.05, 0.56).scale.set(1, 1.3, 0.5);
      mk(G.cone(0.14, 0.4, 8), fm, head, s * 0.42, 0.6, 0, 0, 0, s * -0.35);
      mk(G.box(0.36, 0.06, 0.06), eyeM(), head, s * 0.26, 0.32, 0.5, 0, 0, s * 0.3);
    }
    mk(G.cone(0.08, 0.25, 8), cm('beak', { color: 0xe8a83a, roughness: 0.4 }), head, 0, -0.12, 0.6, Math.PI / 2 + 0.3, 0, 0);
    const crown = mk(G.cyl(0.32, 0.28, 0.28, 8, 1, true), MAT.gold, head, 0, 0.62, 0); crown.material.side = THREE.DoubleSide;
    for (let i = 0; i < 8; i++) mk(G.cone(0.05, 0.16, 4), MAT.gold, head, Math.sin(i / 8 * 6.28) * 0.3, 0.82, Math.cos(i / 8 * 6.28) * 0.3);
    mk(G.sph(0.06, 10, 8), cm('ruby', { color: 0xff2a6a, emissive: 0xff0040, emissiveIntensity: 0.6, roughness: 0.1 }), head, 0, 0.66, 0.3);
    const wings = [];
    for (const s of [-1, 1]) { const w = new THREE.Group(); w.position.set(s * 0.7, 0.3, -0.1); tor.add(w); const wg = mk(G.sph(0.5, 16, 12), fm, w, s * 0.3, -0.3, 0); wg.scale.set(0.5, 1.4, 0.35); wings.push(w); }
    // moon staff
    const st = new THREE.Group(); st.position.set(0.95, 0.0, 0.3); tor.add(st);
    mk(G.cyl(0.04, 0.04, 2.4, 8), cm('staff', { color: 0x2a1a0a, roughness: 0.5 }), st, 0, 0, 0);
    mk(G.tor(0.22, 0.05, 8, 20, Math.PI * 1.4), cm('moon', { color: 0xfff2b0, emissive: 0xffd060, emissiveIntensity: 1.2 }), st, 0, 1.35, 0, 0, 0, -0.6);
    root.userData = { body, tor, head, wings, bob: 'boss' };
    return root;
  },
  bigdragon(o) { // demon king true form
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const sc = new THREE.MeshPhysicalMaterial({ color: o.color || 0x2a1a4a, roughness: 0.35, clearcoat: 0.7, metalness: 0.2, map: TX.cave, normalMap: TX.caveN, normalScale: new THREE.Vector2(1.5, 1.5) });
    const belly = new THREE.MeshStandardMaterial({ color: 0x6a4a8a, roughness: 0.5, map: TX.planks });
    const tor = new THREE.Group(); tor.position.set(0, 2.2, 0); body.add(tor);
    mk(G.sph(1.3, 30, 24), sc, tor, 0, 0, 0).scale.set(1, 1.15, 1.25);
    mk(G.sph(1.0, 24, 18), belly, tor, 0, -0.1, 0.55).scale.set(0.9, 1.1, 0.6);
    const neck = mk(G.cyl(0.45, 0.65, 1.6, 16), sc, tor, 0, 1.3, 0.6, 0.6, 0, 0);
    const head = new THREE.Group(); head.position.set(0, 2.2, 1.3); tor.add(head);
    mk(G.sph(0.65, 24, 18), sc, head, 0, 0, 0).scale.set(1, 0.85, 1.1);
    const jaw = mk(G.box(0.7, 0.3, 0.9), sc, head, 0, -0.3, 0.55);
    mk(G.box(0.8, 0.35, 1.0), sc, head, 0, 0.0, 0.7);
    for (const s of [-1, 1]) {
      mk(G.cone(0.13, 1.0, 10), cm('horn2', { color: 0xe8e0d0, roughness: 0.4 }), head, s * 0.38, 0.6, -0.3, -0.9, 0, s * -0.4);
      mk(G.sph(0.11, 12, 10), cm('deye', { color: 0xffe040, emissive: 0xffb000, emissiveIntensity: 2 }), head, s * 0.34, 0.2, 0.52).scale.set(1.2, 0.6, 0.6);
      for (let i = 0; i < 4; i++) mk(G.cone(0.04, 0.14, 6), whiteM(), head, s * (0.12 + i * 0.07), -0.2, 1.05 - i * 0.12, Math.PI, 0, 0);
    }
    const crown = mk(G.cyl(0.35, 0.3, 0.25, 8, 1, true), MAT.gold, head, 0, 0.55, -0.1); crown.material.side = THREE.DoubleSide;
    const wings = [];
    const wm = new THREE.MeshStandardMaterial({ color: 0x3a1a5a, roughness: 0.55, side: THREE.DoubleSide, emissive: 0x200830, emissiveIntensity: 0.5 });
    for (const s of [-1, 1]) {
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(1.2, 1.4); sh.lineTo(3.2, 1.7); sh.lineTo(2.8, 0.6); sh.quadraticCurveTo(2.3, 0.5, 2.1, -0.3); sh.quadraticCurveTo(1.6, 0.0, 1.3, -0.6); sh.quadraticCurveTo(0.8, -0.2, 0.3, -0.5); sh.lineTo(0, -0.3);
      const wg = new THREE.ShapeGeometry(sh, 6); if (s < 0) wg.scale(-1, 1, 1);
      const piv = new THREE.Group(); piv.position.set(s * 0.8, 0.8, -0.5); tor.add(piv); mk(wg, wm, piv, 0, 0, 0); piv.rotation.y = s * 0.6; wings.push(piv);
      mk(G.cyl(0.06, 0.04, 3.4, 6).rotateZ(Math.PI / 2 - s * 0.55), cm('bone', { color: 0x2a1a3a }), piv, s * 1.55, 1.0, 0);
    }
    const tail = new THREE.Group(); tail.position.set(0, -0.6, -1.3); tor.add(tail);
    let tp = tail; for (let i = 0; i < 6; i++) { const seg = new THREE.Group(); seg.position.z = i ? -0.55 : 0; tp.add(seg); mk(G.sph(0.42 - i * 0.06, 14, 10), sc, seg, 0, 0, 0).scale.set(1, 0.9, 1.4); seg.rotation.x = 0.12; tp = seg; }
    mk(G.cone(0.3, 0.6, 4), cm('tailspike', { color: 0xa040ff, emissive: 0x6010a0, emissiveIntensity: 1 }), tp, 0, 0, -0.55, -Math.PI / 2, 0, 0);
    for (let i = 0; i < 6; i++) mk(G.cone(0.14, 0.4, 4), cm('spike', { color: 0xa040ff, emissive: 0x6010a0, emissiveIntensity: 1 }), tor, 0, 1.25 - i * 0.05, 0.4 - i * 0.42, -0.4, 0, 0);
    const legs = [];
    for (const s of [-1, 1]) { const l = mk(G.cap(0.38, 0.9, 12), sc, body, s * 0.85, 0.75, 0.1); legs.push(l); mk(G.cap(0.2, 0.7, 10), sc, tor, s * 1.0, 0.0, 1.0, 0.8, 0, s * 0.3); }
    root.userData = { body, tor, head, wings, legs, tail, bob: 'bigdragon' };
    return root;
  },
};
function makeMonster(def) {
  const m = MON_BUILD[def.model](def);
  m.scale.setScalar(def.scale || 1);
  m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  // collect materials for hit flash / fade
  const mats = new Set(); m.traverse(o => { if (o.isMesh) { if (o.material.isMeshStandardMaterial || o.material.isMeshPhysicalMaterial) { o.material = o.material.clone(); mats.add(o.material); } } });
  m.userData.mats = [...mats];
  for (const mt of m.userData.mats) { mt.userData.baseEm = mt.emissive ? mt.emissive.clone() : null; mt.userData.baseOp = mt.opacity; }
  m.userData.ph = Math.random() * 6;
  const bs = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: TX.blob, transparent: true, depthWrite: false, opacity: 0.55 }));
  bs.scale.setScalar(def.shadow || 0.9); bs.position.y = 0.02; m.add(bs);
  return m;
}
function animMonster(m, dt, moving) {
  const u = m.userData; u.ph += dt * (moving ? 7 : 3.2); const s = Math.sin(u.ph), t = u.ph;
  switch (u.bob) {
    case 'squash': { const k = Math.abs(Math.sin(t)); u.body.scale.set(1 + (1 - k) * 0.12, 0.88 + k * 0.2, 1 + (1 - k) * 0.12); u.body.position.y = moving ? k * 0.18 : 0; break; }
    case 'fly': u.body.position.y = 1.0 + Math.sin(t * 0.7) * 0.12; for (const [i, w] of u.wings.entries()) w.rotation.y = (i ? 1 : -1) * Math.sin(t * 3.2) * 0.9; break;
    case 'hop': u.body.position.y = moving ? Math.abs(Math.sin(t)) * 0.2 : Math.abs(Math.sin(t * 0.5)) * 0.04; u.body.rotation.z = Math.sin(t) * 0.08; u.feet.forEach((f, i) => f.position.y = 0.04 + Math.max(0, Math.sin(t + i * 3.14)) * 0.05); break;
    case 'float': u.body.position.y = 0.6 + Math.sin(t * 0.6) * 0.12; u.body.rotation.z = Math.sin(t * 0.4) * 0.1; u.arms.forEach((a, i) => a.position.y = Math.sin(t * 0.8 + i * 3) * 0.06); break;
    case 'stomp': u.body.rotation.z = Math.sin(t * 0.7) * 0.06; u.legs.forEach((l, i) => l.rotation.x = moving ? Math.sin(t + i * 3.14) * 0.5 : 0); u.arms.forEach((a, i) => a.rotation.x = Math.sin(t * 0.8 + i * 3.14) * 0.3); break;
    case 'dragon': u.tor.position.y = 0.55 + Math.sin(t * 0.8) * 0.03; u.wings.forEach((w, i) => w.rotation.y = (i ? -1 : 1) * (0.5 + Math.sin(t * 2) * 0.4)); u.legs.forEach((l, i) => l.position.y = 0.18 + (moving ? Math.max(0, Math.sin(t + i * 3.14)) * 0.08 : 0)); break;
    case 'big': u.tor.scale.set(1, 1 + Math.sin(t * 0.5) * 0.03, 1); u.head.rotation.z = Math.sin(t * 0.3) * 0.08; u.arms.forEach((a, i) => a.rotation.x = Math.sin(t * 0.4 + i) * 0.15); break;
    case 'knight': u.tor.position.y = 1.1 + Math.sin(t * 0.6) * 0.03; u.arms[1].rotation.x = -0.3 + Math.sin(t * 0.5) * 0.1; break;
    case 'boss': u.body.position.y = Math.sin(t * 0.5) * 0.12 + 0.2; u.wings.forEach((w, i) => w.rotation.z = (i ? -1 : 1) * (0.2 + Math.sin(t * 0.9) * 0.2)); break;
    case 'bigdragon': u.tor.position.y = 2.2 + Math.sin(t * 0.5) * 0.08; u.wings.forEach((w, i) => w.rotation.z = (i ? 1 : -1) * Math.sin(t * 0.8) * 0.25); u.head.rotation.x = Math.sin(t * 0.4) * 0.1; if (u.tail) u.tail.rotation.y = Math.sin(t * 0.6) * 0.3; break;
  }
}
// treasure chest
function makeChest() {
  const g = new THREE.Group();
  const wd = new THREE.MeshStandardMaterial({ color: 0x9a3a1a, roughness: 0.6, map: TX.planks });
  const gm = MAT.gold;
  mk(G.box(0.8, 0.45, 0.55), wd, g, 0, 0.225, 0);
  const lid = new THREE.Group(); lid.position.set(0, 0.45, -0.275); g.add(lid);
  mk(new THREE.CylinderGeometry(0.275, 0.275, 0.8, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), wd, lid, 0, 0, 0.275);
  for (const x of [-0.3, 0, 0.3]) { mk(G.box(0.06, 0.47, 0.57), gm, g, x, 0.225, 0); mk(new THREE.CylinderGeometry(0.285, 0.285, 0.06, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), gm, lid, x, 0, 0.275); }
  mk(G.box(0.14, 0.16, 0.05), gm, g, 0, 0.4, 0.29);
  g.userData.lid = lid;
  return g;
}
