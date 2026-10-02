// ================================================================ humanoid rig
const J_NAMES = ['hips', 'spine', 'chest', 'neck', 'head', 'shL', 'elL', 'haL', 'shR', 'elR', 'haR', 'hipL', 'knL', 'ftL', 'hipR', 'knR', 'ftR'];
const P0 = { hips: [0, 0, 0], spine: [0, 0, 0], chest: [0, 0, 0], neck: [0, 0, 0], head: [0, 0, 0], shL: [0, 0, 0.12], elL: [-0.15, 0, 0], haL: [0, 0, 0], shR: [0, 0, -0.12], elR: [-0.15, 0, 0], haR: [0, 0, 0], hipL: [0, 0, 0], knL: [0, 0, 0], ftL: [0, 0, 0], hipR: [0, 0, 0], knR: [0, 0, 0], ftR: [0, 0, 0], y: [0, 0, 0] };
function poseMix(a, b, t) { const o = {}; for (const k in P0) { const A = a[k] || P0[k], B = b[k] || P0[k]; o[k] = [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)]; } return o; }
function poseAdd(base, add) { const o = {}; for (const k in P0) { const A = base[k] || P0[k], B = add[k]; o[k] = B ? [A[0] + B[0], A[1] + B[1], A[2] + B[2]] : A.slice(); } return o; }
const easeIO = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);

function human(o) {
  const root = new THREE.Group();
  const body = grp(root); body.scale.setScalar(o.scale || 1);
  const J = {};
  const skinC = new THREE.Color(o.skin || 0xf8dcc8);
  const skin = TM(o.skin || 0xf8dcc8, { emissive: skinC.clone().multiplyScalar(0.32).getHex() });
  const ol = 0.012;
  J.hips = grp(body, 0, 0.95, 0);
  J.spine = grp(J.hips, 0, 0.05, 0);
  J.chest = grp(J.spine, 0, 0.26, 0);
  J.neck = grp(J.chest, 0, 0.14, 0);
  J.head = grp(J.neck, 0, 0.1, 0);
  const W = o.female ? 0.9 : 1;
  // pelvis + torso
  const pel = mk(G.sph(0.15, 12, 10), 0, ol, TM(o.pants)); pel.scale.set(1.05 * W, 0.7, 0.75); pel.position.y = 0; J.hips.add(pel);
  const waist = mk(G.cyl(0.13 * W, 0.14 * W, 0.2, 12), 0, ol, TM(o.top)); waist.position.y = 0.1; J.spine.add(waist);
  const ch = mk(G.sph(0.18, 14, 12), 0, ol, TM(o.top)); ch.scale.set(1.0 * W, 1.0, 0.72); ch.position.y = 0.02; J.chest.add(ch);
  if (o.female) { const b = mk(G.sph(0.09, 10, 8), 0, ol, TM(o.top)); b.scale.set(1.7, 0.9, 0.9); b.position.set(0, 0.0, 0.08); J.chest.add(b); }
  if (o.vneck) { const v = new THREE.Mesh(G.cone(0.07, 0.2, 3), skin); v.rotation.x = Math.PI; v.rotation.y = Math.PI; v.scale.z = 0.3; v.position.set(0, 0.07, 0.125); J.chest.add(v); }
  if (o.belt) { const b = mk(G.cyl(0.15 * W, 0.15 * W, 0.05, 12), 0, ol, TM(o.belt)); b.position.y = 0.02; J.spine.add(b); }
  if (o.scarf) { const s = mk(G.tor(0.08, 0.04, 6, 14), 0, ol, TM(o.scarf)); s.rotation.x = Math.PI / 2; s.position.y = 0.0; J.neck.add(s); }
  if (o.collar) { const c = mk(G.cyl(0.08, 0.11, 0.08, 12), 0, ol, TM(o.collar)); c.position.y = 0.0; J.neck.add(c); }
  if (o.pauldron) for (const s of [-1, 1]) { const p = mk(G.sph(0.09, 10, 8), 0, ol, TM(o.pauldron)); p.scale.set(1.2, 0.8, 1.1); p.position.set(s * 0.2, 0.12, 0); J.chest.add(p); }
  const neck = new THREE.Mesh(G.cyl(0.045, 0.05, 0.12, 8), skin); neck.position.y = 0.0; J.neck.add(neck);
  // head
  const hd = mk(G.sph(0.135, 18, 14), 0, ol, skin); hd.scale.set(0.95, 1.05, 1); hd.position.y = 0.04; J.head.add(hd);
  const jaw = new THREE.Mesh(G.sph(0.1, 12, 8), skin); jaw.scale.set(0.9, 0.75, 0.88); jaw.position.set(0, -0.035, 0.012); J.head.add(jaw);
  // eyes
  const eyeM = BM(o.eye || 0x3a5aa0), lashM = BM(0x1a1018), whiteM = BM(0xffffff);
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(G.sph(0.03, 10, 8), whiteM); w.scale.set(1, 1.15, 0.35); w.position.set(s * 0.048, 0.035, 0.118); J.head.add(w);
    const e = new THREE.Mesh(G.sph(0.024, 10, 8), eyeM); e.scale.set(0.95, 1.3, 0.35); e.position.set(s * 0.046, 0.033, 0.124); J.head.add(e);
    const hl = new THREE.Mesh(G.sph(0.007, 6, 4), whiteM); hl.position.set(s * 0.043 + 0.008, 0.048, 0.132); J.head.add(hl);
    const l = new THREE.Mesh(G.box(0.07, 0.012, 0.01), lashM); l.position.set(s * 0.048, 0.066, 0.122); l.rotation.z = s * -0.18; J.head.add(l);
    const br = new THREE.Mesh(G.box(0.055, 0.008, 0.01), BM(o.hairDark || 0x2a1a18)); br.position.set(s * 0.05, 0.095, 0.124); br.rotation.z = s * (o.brow || 0.12); J.head.add(br);
  }
  const mouth = new THREE.Mesh(G.box(0.03, 0.006, 0.01), BM(0x8a3a3a)); mouth.position.set(0, -0.052, 0.128); J.head.add(mouth);
  // hair
  buildHair(J.head, o);
  // arms
  const sleeve = TM(o.sleeve || o.top), glove = o.glove ? TM(o.glove) : skin;
  for (const s of ['L', 'R']) {
    const sx = s === 'L' ? 1 : -1;
    const sh = J['sh' + s] = grp(J.chest, sx * 0.2 * W, 0.08, 0);
    const ua = mk(G.cap(0.048, 0.2), 0, ol, sleeve); ua.position.y = -0.13; sh.add(ua);
    const el = J['el' + s] = grp(sh, 0, -0.27, 0);
    const fa = mk(G.cap(0.042, 0.18), 0, ol, o.bareArms ? skin : sleeve); fa.position.y = -0.12; el.add(fa);
    if (o.cuff) { const c = mk(G.cyl(0.055, 0.06, 0.07, 10), 0, ol, TM(o.cuff)); c.position.y = -0.2; el.add(c); }
    const ha = J['ha' + s] = grp(el, 0, -0.25, 0);
    const hand = mk(G.sph(0.045, 10, 8), 0, ol, glove); hand.scale.set(0.9, 1.1, 0.7); hand.position.y = -0.03; ha.add(hand);
  }
  // legs
  for (const s of ['L', 'R']) {
    const sx = s === 'L' ? 1 : -1;
    const hp = J['hip' + s] = grp(J.hips, sx * 0.09 * W, -0.03, 0);
    const th = mk(G.cap(0.068, 0.3), 0, ol, TM(o.legs || o.pants)); th.position.y = -0.22; hp.add(th);
    const kn = J['kn' + s] = grp(hp, 0, -0.44, 0);
    const sn = mk(G.cap(0.055, 0.32), 0, ol, TM(o.boots || 0x2a2228)); sn.position.y = -0.2; kn.add(sn);
    const ft = J['ft' + s] = grp(kn, 0, -0.42, 0);
    const foot = mk(G.box(0.1, 0.08, 0.2), 0, ol, TM(o.boots || 0x2a2228)); foot.position.set(0, -0.0, 0.04); ft.add(foot);
  }
  // skirt / coat
  const swing = [];
  if (o.skirt) {
    const sk = mk(G.cyl(0.15 * W, o.skirtW || 0.32, o.skirtL || 0.36, 16, true), 0, ol, TM(o.skirt, { side: THREE.DoubleSide })); sk.position.y = -0.1 - (o.skirtL || 0.36) / 2 + 0.12; J.hips.add(sk);
    if (o.skirt2) { const s2 = mk(G.cyl(0.155 * W, (o.skirtW || 0.32) * 0.92, (o.skirtL || 0.36) * 0.75, 16, true), 0, 0, TM(o.skirt2, { side: THREE.DoubleSide })); s2.position.y = sk.position.y + 0.06; s2.scale.setScalar(1.02); J.hips.add(s2); }
  }
  if (o.coat) {
    // long coat tails (two flaps + back) that sway
    for (const [x, ry] of [[-0.09, -0.35], [0.09, 0.35], [0, Math.PI]]) {
      const piv = grp(J.hips, x, 0.08, x === 0 ? -0.1 : 0.05);
      piv.rotation.y = ry;
      const f = mk(G.box(x === 0 ? 0.3 : 0.15, o.coatL || 0.75, 0.025), 0, ol, TM(o.coat));
      f.position.set(0, -(o.coatL || 0.75) / 2, 0.08); piv.add(f);
      if (x === 0) f.position.z = 0.05;
      swing.push(piv);
    }
    const lining = mk(G.cyl(0.17, 0.17, 0.12, 12, true), 0, ol, TM(o.coat, { side: THREE.DoubleSide })); lining.position.y = 0.06; J.hips.add(lining);
  }
  if (o.cape) {
    const piv = grp(J.chest, 0, 0.12, -0.12);
    const c = mk(G.box(0.42, 0.9, 0.02), 0, ol, TM(o.cape, { side: THREE.DoubleSide })); c.position.y = -0.45; piv.add(c); swing.push(piv); piv.userData.cape = 1;
  }
  // weapon
  let weapon = null, tip = null, base = null;
  if (o.weapon) {
    weapon = grp(J.haR, 0, -0.04, 0.02);
    weapon.rotation.x = o.weaponTilt != null ? o.weaponTilt : 1.9;
    buildWeapon(weapon, o.weapon);
    tip = grp(weapon, 0, weapon.userData.len || 0.9, 0); base = grp(weapon, 0, 0.15, 0);
  }
  if (o.shield) { const sh = mk(G.cyl(0.18, 0.18, 0.04, 16), 0, 0.015, TM(o.shield)); sh.rotation.z = Math.PI / 2; sh.position.set(0.06, -0.14, 0); J.elL.add(sh); const b = mk(G.sph(0.05, 8, 6), 0, 0.01, TM(0xe8c97a)); b.position.set(0.09, -0.14, 0); J.elL.add(b); }
  if (o.extra) o.extra(J, root);
  const shadow = blobShadow(root, 0.9 * (o.scale || 1));
  const rig = { root, body, J, swing, weapon, tip, base, shadow, cur: poseMix(P0, P0, 0), clip: null, clipT: 0, phase: 0, o, blend: 0 };
  return rig;
}
function buildHair(head, o) {
  const hm = TM(o.hair, { emissive: new THREE.Color(o.hair).multiplyScalar(0.15).getHex() }), oll = 0.012;
  const cap = mk(G.sph(0.15, 18, 14), 0, oll, hm); cap.scale.set(1.04, 1.0, 1.02); cap.position.set(0, 0.105, -0.03); head.add(cap);
  const cone = (x, y, z, rx, rz, r, l, ry = 0) => { const c = mk(G.cone(r, l, 6), 0, oll, hm); c.position.set(x, y, z); c.rotation.set(rx, ry, rz); head.add(c); return c; };
  // bangs (stop above the eyes)
  const st = o.hairStyle;
  const bangs = st === 'long' ? [[-0.085, 0.13], [-0.04, 0.15], [0.005, 0.16], [0.05, 0.14], [0.09, 0.12]] : st === 'bob' ? [[-0.09, 0.12], [-0.045, 0.13], [0, 0.12], [0.045, 0.13], [0.09, 0.12]] : st === 'spiky' ? [[-0.08, 0.11], [-0.03, 0.13], [0.03, 0.12], [0.08, 0.11]] : st === 'short' ? [[-0.07, 0.09], [0, 0.1], [0.07, 0.09]] : [];
  for (const [x, l] of bangs) cone(x, 0.205 - l * 0.5, 0.108 - Math.abs(x) * 0.25, Math.PI - 0.32, x * 2.2, 0.035, l);
  // sides
  for (const s of [-1, 1]) {
    if (st === 'long') { cone(s * 0.14, -0.04, 0.0, Math.PI, s * -0.1, 0.04, 0.3); cone(s * 0.12, -0.12, -0.06, Math.PI, s * -0.1, 0.05, 0.42); }
    else if (st === 'bob') { cone(s * 0.14, -0.02, 0.02, Math.PI, s * -0.25, 0.06, 0.22); cone(s * 0.12, -0.03, -0.07, Math.PI + 0.2, s * -0.3, 0.07, 0.22); }
    else { cone(s * 0.14, 0.02, 0.02, Math.PI, s * -0.4, 0.05, 0.16); cone(s * 0.12, 0.12, -0.06, Math.PI * 0.75, s * -0.9, 0.05, 0.18); }
  }
  if (st === 'long') {
    const back = mk(G.cyl(0.13, 0.07, 0.62, 10), 0, oll, hm); back.scale.z = 0.55; back.position.set(0, -0.22, -0.1); back.rotation.x = 0.12; head.add(back);
    for (const x of [-0.08, 0, 0.08]) cone(x, -0.5, -0.14, Math.PI + 0.1, x, 0.05, 0.2);
  } else if (st === 'bob') {
    const back = mk(G.sph(0.16, 14, 10), 0, oll, hm); back.scale.set(1.0, 0.85, 0.9); back.position.set(0, -0.0, -0.05); head.add(back);
  } else if (st === 'spiky') {
    for (let i = 0; i < 6; i++) { const a = -0.9 + i * 0.36; cone(Math.sin(a) * 0.12, 0.12, -0.08 - Math.cos(a) * 0.04, -2.2, a * 0.8, 0.05, 0.16); }
  } else if (st === 'bald') {
    cap.scale.set(1, 0.6, 1.04); cap.position.y = 0.09;
  } else if (st === 'helmet') {
    cap.scale.set(1.15, 1.1, 1.15); const v = mk(G.box(0.24, 0.04, 0.04), 0, oll, TM(0x2a2a30)); v.position.set(0, 0.04, 0.14); head.add(v);
    const cr = mk(G.cone(0.03, 0.18, 6), 0, oll, TM(o.crest || 0xb03030)); cr.position.set(0, 0.25, -0.02); head.add(cr);
  } else if (st === 'hood') {
    cap.scale.set(1.25, 1.2, 1.25); cap.position.set(0, 0.05, -0.03);
  }
  if (o.goggles) { for (const s of [-1, 1]) { const g = mk(G.tor(0.035, 0.012, 6, 12), 0, 0.006, TM(0x8a6a3a)); g.position.set(s * 0.05, 0.16, 0.11); g.rotation.x = -0.5; head.add(g); const l = new THREE.Mesh(G.sph(0.03, 8, 6), BM(0x9ae0ff)); l.scale.z = 0.4; l.position.copy(g.position); l.rotation.x = -0.5; head.add(l); } }
  if (o.headband) { const h = mk(G.tor(0.15, 0.012, 6, 24), 0, 0.006, TM(o.headband)); h.rotation.x = Math.PI / 2 - 0.3; h.position.set(0, 0.1, 0.01); head.add(h); }
  if (o.beard) { const b = mk(G.sph(0.09, 10, 8), 0, oll, TM(o.beard)); b.scale.set(1, 1.1, 0.7); b.position.set(0, -0.09, 0.07); head.add(b); }
  if (o.redEyes) for (const s of [-1, 1]) { const e = glowSprite(0xff2a2a, 0.12); e.position.set(s * 0.046, 0.035, 0.14); head.add(e); }
}
function buildWeapon(g, type) {
  const metal = TM(0xdfe6f0), dark = TM(0x2a2630), gold = TM(0xd8b05a);
  if (type === 'sword' || type === 'saber') {
    const L = type === 'sword' ? 0.95 : 0.75;
    const grip = mk(G.cyl(0.018, 0.018, 0.2, 6), 0, 0.008, dark); grip.position.y = -0.02; g.add(grip);
    const guard = mk(G.box(type === 'sword' ? 0.06 : 0.16, 0.03, 0.06), 0, 0.008, gold); guard.position.y = 0.09; g.add(guard);
    const blade = mk(G.box(0.012, L, 0.05), 0, 0.008, metal); blade.position.y = 0.1 + L / 2; g.add(blade);
    const edge = new THREE.Mesh(G.box(0.006, L, 0.02), BM(0xffffff)); edge.position.set(0, 0.1 + L / 2, 0.028); g.add(edge);
    g.userData.len = 0.1 + L;
  } else if (type === 'staff') {
    const s = mk(G.cyl(0.018, 0.022, 1.2, 6), 0, 0.008, TM(0x6a4a2a)); s.position.y = 0.3; g.add(s);
    const ring = mk(G.tor(0.07, 0.015, 6, 14), 0, 0.006, gold); ring.position.y = 0.95; g.add(ring);
    const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), BM(0xffa040)); cr.position.y = 0.95; g.add(cr);
    const gl = glowSprite(0xffa040, 0.4); gl.position.y = 0.95; g.add(gl);
    g.userData.len = 0.95;
  } else if (type === 'dagger') {
    const blade = mk(G.box(0.01, 0.32, 0.04), 0, 0.008, TM(0xb0b8c8)); blade.position.y = 0.2; g.add(blade);
    const grip = mk(G.cyl(0.016, 0.016, 0.1, 6), 0, 0.008, dark); g.add(grip);
    g.userData.len = 0.36;
  } else if (type === 'halberd') {
    const s = mk(G.cyl(0.02, 0.02, 1.8, 6), 0, 0.008, TM(0x4a3a30)); s.position.y = 0.4; g.add(s);
    const ax = mk(G.box(0.02, 0.3, 0.22), 0, 0.008, metal); ax.position.set(0, 1.15, 0.1); g.add(ax);
    const sp = mk(G.cone(0.04, 0.3, 6), 0, 0.008, metal); sp.position.y = 1.4; g.add(sp);
    g.userData.len = 1.5;
  }
}

// procedural locomotion + clip playback
function rigUpdate(rig, dt, loco) {
  const J = rig.J;
  rig.phase += dt * (loco.speed > 0.2 ? 2.2 + loco.speed * 0.9 : 1.2);
  const ph = rig.phase, sp = clamp(loco.speed / 6, 0, 1.3);
  let base;
  const idle = rig.o.idle || {};
  if (loco.down) {
    base = { y: [-0.78, 0, 0], hips: [-1.45, 0, 0], spine: [0, 0, 0], head: [-0.2, 0.4, 0], shL: [-0.4, 0, 0.9], shR: [-0.4, 0, -0.9], hipL: [0.2, 0, 0.15], hipR: [0.0, 0, -0.1], knL: [0.6, 0, 0], knR: [0.2, 0, 0] };
  } else if (loco.air) {
    const up = loco.vy > 0;
    base = { y: [0, 0, 0], hips: [0, 0, 0], spine: [up ? -0.1 : 0.15, 0, 0], shL: [-0.6, 0, 0.6], shR: [-0.8, 0, -0.5], elL: [-0.6, 0, 0], elR: [-0.6, 0, 0], hipL: [-1.0, 0, 0.05], knL: [1.4, 0, 0], hipR: [-0.3, 0, -0.05], knR: [0.8, 0, 0], head: [up ? -0.15 : 0.1, 0, 0] };
  } else if (sp > 0.05) {
    const s = Math.sin(ph * 2.6), c = Math.cos(ph * 2.6), a = 0.55 + sp * 0.45;
    base = {
      y: [-0.03 * sp + Math.abs(c) * 0.06 * sp, 0, 0], hips: [0, s * 0.15 * sp, 0], spine: [0.15 * sp + 0.05, -s * 0.12 * sp, 0], chest: [0, -s * 0.15 * sp, 0], head: [-0.1 * sp, s * 0.15 * sp, 0],
      hipL: [-s * a, 0, 0.03], hipR: [s * a, 0, -0.03], knL: [Math.max(0, c) * 1.3 * sp + 0.15, 0, 0], knR: [Math.max(0, -c) * 1.3 * sp + 0.15, 0, 0],
      ftL: [0.2 * s, 0, 0], ftR: [-0.2 * s, 0, 0],
      shL: [s * 0.9 * sp, 0, 0.15], shR: [-s * 0.9 * sp, 0, -0.15], elL: [-0.7 - 0.5 * sp, 0, 0], elR: [-0.7 - 0.5 * sp, 0, 0],
    };
    if (rig.o.weapon && !rig.o.casual) base.shR = [-0.4 - s * 0.3 * sp, 0, -0.35];
  } else {
    const b = Math.sin(ph * 1.4);
    base = {
      y: [b * 0.008 - 0.01, 0, 0], spine: [0.02 + b * 0.015, 0, 0], chest: [b * 0.01, 0.15, 0], head: [0.05, -0.1, 0],
      shL: [0.05, 0, 0.12 + b * 0.02], shR: [-0.1, 0, -0.18 - b * 0.02], elL: [-0.25, 0, 0], elR: [-0.4, 0, 0],
      hipL: [-0.05, 0, 0.08], hipR: [0.08, 0, -0.06], knL: [0.1, 0, 0], knR: [0.06, 0, 0],
    };
    if (loco.battle) Object.assign(base, rig.o.stance || { y: [-0.06, 0, 0], spine: [0.15, 0.3, 0], chest: [0.05, 0.3, 0], head: [0, -0.5, 0], hipL: [-0.5, 0.3, 0.12], knL: [0.6, 0, 0], hipR: [0.35, -0.3, -0.12], knR: [0.4, 0, 0], shR: [-0.5, 0, -0.5], elR: [-0.9, 0, 0], shL: [-0.3, 0, 0.4], elL: [-0.9, 0, 0] });
    for (const k in idle) base[k] = idle[k];
  }
  let target = poseMix(P0, base, 1);
  if (rig.clip) {
    rig.clipT += dt * (rig.clipSpeed || 1);
    const c = rig.clip, t = rig.clipT, K = c.keys;
    let p;
    if (t >= c.dur) { p = K[K.length - 1][1]; if (!c.hold) { rig.clip = null; } }
    else {
      let i = 0; while (i < K.length - 1 && K[i + 1][0] <= t) i++;
      if (i >= K.length - 1) p = K[K.length - 1][1];
      else { const [t0, a] = K[i], [t1, b] = K[i + 1]; const e = (K[i + 1][2] || easeIO)((t - t0) / (t1 - t0)); p = poseMix(poseAdd(P0, a), poseAdd(P0, b), e); }
    }
    if (p) target = poseMix(target, poseAdd(P0, p), 1);
    rig.blend = 1;
  }
  const k = rig.clip ? 40 : 14;
  for (const n of J_NAMES) {
    const c = rig.cur[n], t = target[n];
    for (let i = 0; i < 3; i++) c[i] = damp(c[i], t[i], k, dt);
    J[n].rotation.set(c[0], c[1], c[2]);
  }
  rig.cur.y[0] = damp(rig.cur.y[0], target.y[0], k, dt);
  rig.body.position.y = rig.cur.y[0];
  // coat sway
  for (const s of rig.swing) {
    const wantX = s.userData.cape ? 0.15 + sp * 0.8 + (loco.air ? 0.6 : 0) : (s.rotation.y > 2 ? -1 : 1) * 0 + (loco.air ? -0.4 : 0) - sp * 0.25 * (s.rotation.y > 2 ? -2 : 1) + Math.sin(ph * 2.6 + s.rotation.y) * 0.08 * sp;
    s.rotation.x = damp(s.rotation.x, s.userData.cape ? -wantX : wantX, 8, dt);
  }
  rig.shadow.position.y = 0.03 - rig.root.position.y + (loco.groundY || 0);
}
function rigPlay(rig, clip, speed = 1) { rig.clip = clip; rig.clipT = 0; rig.clipSpeed = speed; }

// ================================================================ character definitions
const CHAR_LOOK = {
  sieg: { skin: 0xf6dcc6, hair: 0x221c34, hairDark: 0x120e1c, hairStyle: 'long', eye: 0x6a4a9a, top: 0x26222e, sleeve: 0x26222e, pants: 0x34303a, boots: 0x1a161e, belt: 0xa0402a, coat: 0x221e2a, coatL: 0.72, vneck: 1, weapon: 'sword', cuff: 0x5a3a8a, glove: 0x2a2028 },
  lucia: { skin: 0xfae2d2, hair: 0xf0a2be, hairDark: 0xb06a84, hairStyle: 'bob', eye: 0x3a9a6a, female: 1, top: 0xf6f2ff, sleeve: 0xf6f2ff, pants: 0xf6f2ff, legs: 0xf0e6f0, skirt: 0xd86a9a, skirt2: 0xf6f2ff, skirtL: 0.4, skirtW: 0.3, boots: 0xf0ecf6, collar: 0xd86a9a, weapon: 'saber', shield: 0x4a6ac8, headband: 0xe8c97a, cuff: 0xd86a9a, scale: 0.94, brow: 0.05 },
  noa: { skin: 0xf6d8c0, hair: 0xc4602a, hairDark: 0x7a3218, hairStyle: 'spiky', eye: 0xd8901a, female: 1, top: 0x2a8a8a, sleeve: 0x2a8a8a, pants: 0x2a2a3a, legs: 0x2a2a3a, skirt: 0xf2e6c8, skirtL: 0.26, skirtW: 0.27, boots: 0x6a3a22, scarf: 0xffc83a, goggles: 1, weapon: 'staff', weaponTilt: 0.25, cuff: 0xffc83a, scale: 0.88, casual: 1, brow: 0.2 },
};
function makeChar(id) {
  const L = CHAR_LOOK[id];
  const r = human(L);
  if (id === 'sieg') r.o.stance = { y: [-0.1, 0, 0], spine: [0.2, 0.45, 0], chest: [0.05, 0.35, 0], head: [0, -0.7, 0], hipL: [-0.55, 0.3, 0.2], knL: [0.7, 0, 0], hipR: [0.45, -0.2, -0.15], knR: [0.5, 0, 0], shR: [-0.2, 0, -0.55], elR: [-0.5, 0, 0], shL: [-0.6, 0, 0.3], elL: [-1.2, 0, 0] };
  if (id === 'lucia') r.o.stance = { y: [-0.05, 0, 0], spine: [0.1, 0.25, 0], chest: [0, 0.2, 0], head: [0, -0.4, 0], hipL: [-0.35, 0.2, 0.1], knL: [0.4, 0, 0], hipR: [0.25, -0.2, -0.1], knR: [0.3, 0, 0], shR: [-0.5, 0, -0.4], elR: [-0.8, 0, 0], shL: [-0.9, 0.3, 0.3], elL: [-1.2, 0, 0] };
  if (id === 'noa') r.o.stance = { y: [-0.03, 0, 0], spine: [0.05, 0.1, 0], head: [0, -0.2, 0], hipL: [-0.2, 0, 0.12], knL: [0.25, 0, 0], hipR: [0.15, 0, -0.1], knR: [0.15, 0, 0], shR: [-0.6, 0, -0.3], elR: [-1.0, 0, 0], shL: [-0.4, 0, 0.5], elL: [-1.4, 0, 0] };
  return r;
}
// NPC looks
function makeNPC(kind) {
  const looks = {
    elder: { skin: 0xf0d0b8, hair: 0xe8e8e8, hairStyle: 'bald', beard: 0xf0f0f0, eye: 0x4a4a4a, top: 0x7a6a4a, pants: 0x5a4a3a, boots: 0x3a2a1a, belt: 0x4a3a2a, scale: 0.9, idle: { spine: [0.35, 0, 0], head: [-0.3, 0, 0] } },
    kid: { skin: 0xf8dcc8, hair: 0x8a5a2a, hairStyle: 'spiky', eye: 0x3a6a9a, top: 0x4a8ad8, pants: 0x6a5a3a, boots: 0x5a3a2a, scale: 0.62 },
    woman: { skin: 0xf6d8c4, hair: 0x6a3a2a, hairStyle: 'bob', eye: 0x6a4a2a, female: 1, top: 0xe8d8b0, pants: 0xe8d8b0, skirt: 0x9a4a3a, skirtL: 0.5, skirtW: 0.36, boots: 0x5a3a2a, scale: 0.93 },
    merchant: { skin: 0xf0c8a8, hair: 0x3a2a1a, hairStyle: 'short', eye: 0x3a2a1a, top: 0x3a7a5a, pants: 0x5a4a3a, boots: 0x3a2a1a, belt: 0xd8b05a, beard: 0x3a2a1a },
    man: { skin: 0xf0d0b0, hair: 0x5a4a3a, hairStyle: 'short', eye: 0x3a3a5a, top: 0xb08a5a, pants: 0x4a4a5a, boots: 0x3a2a1a, belt: 0x5a3a2a },
    knight: { skin: 0xf6dcc6, hair: 0xd8c070, hairStyle: 'helmet', crest: 0x3a5ad0, eye: 0x3a5aa0, top: 0xd8dce8, sleeve: 0xb8c0d0, pants: 0x3a4a8a, boots: 0x8a90a0, pauldron: 0xe8ecf6, cape: 0x2a4ab0, weapon: 'sword', glove: 0xb8c0d0 },
    assassin: { skin: 0xd8b8a8, hair: 0x2a1a1a, hairStyle: 'hood', eye: 0xff2020, redEyes: 1, top: 0x2a1a24, sleeve: 0x2a1a24, pants: 0x1a1018, boots: 0x1a1018, scarf: 0x8a1a1a, weapon: 'dagger', weaponTilt: -1.4, cape: 0x3a1020 },
    soldier: { skin: 0x8a8aa0, hair: 0x5a5a70, hairStyle: 'helmet', crest: 0xa040ff, eye: 0xa040ff, redEyes: 0, top: 0x4a4a5a, sleeve: 0x5a5a6a, pants: 0x3a3a48, boots: 0x6a6a7a, pauldron: 0x8a7ab0, weapon: 'halberd', weaponTilt: 0.3, glove: 0x6a6a7a, belt: 0xa040ff },
    garmo: { skin: 0xe0c0a8, hair: 0x6a2a2a, hairStyle: 'bald', beard: 0x6a2a2a, eye: 0xff4040, redEyes: 1, top: 0x4a1a4a, sleeve: 0x4a1a4a, pants: 0x2a1a2a, skirt: 0x4a1a4a, skirtL: 0.7, skirtW: 0.42, boots: 0x2a1a1a, belt: 0xd8b05a, weapon: 'staff', weaponTilt: 0.25, scale: 1.08, cape: 0x8a1a2a, casual: 1 },
  };
  return human(looks[kind]);
}

// ================================================================ monsters
// quadruped (wolf / bear / behemoth)
function quadruped(o) {
  const root = new THREE.Group(); const body = grp(root); body.scale.setScalar(o.scale || 1);
  const C = TM(o.col), C2 = TM(o.col2 || o.col), ol = 0.02;
  const torso = grp(body, 0, o.h || 0.7, 0);
  const tb = mk(G.sph(0.4, 16, 12), 0, ol, C); tb.scale.set(o.bw || 0.9, o.bh || 0.85, o.bl || 1.5); torso.add(tb);
  const belly = mk(G.sph(0.33, 12, 10), 0, ol, C2); belly.scale.set(0.9, 0.7, 1.3); belly.position.set(0, -0.12, 0.05); torso.add(belly);
  if (o.mane) { const m = mk(G.sph(0.42, 14, 10), 0, ol, TM(o.mane)); m.scale.set(1.05, 1.05, 0.9); m.position.set(0, 0.08, 0.4); torso.add(m); }
  const neck = grp(torso, 0, 0.1, 0.55);
  const head = grp(neck, 0, 0.12, 0.2);
  const hb = mk(G.sph(0.26, 14, 12), 0, ol, C); hb.scale.set(1, 0.9, 1.1); head.add(hb);
  const snout = mk(G.sph(0.17, 12, 10), 0, ol, C2); snout.scale.set(o.snoutW || 0.8, 0.7, o.snout || 1.6); snout.position.set(0, -0.06, 0.25); head.add(snout);
  const nose = mk(G.sph(0.05, 8, 6), 0, 0.01, TM(0x1a1418)); nose.position.set(0, -0.02, 0.5 * (o.snout || 1.6) / 1.6); head.add(nose);
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(G.sph(0.04, 8, 6), BM(o.eye || 0xffd040)); e.scale.set(1.2, 0.8, 0.5); e.position.set(s * 0.13, 0.06, 0.2); e.rotation.z = s * 0.3; head.add(e);
    if (o.ears !== false) { const ear = mk(G.cone(0.08, 0.2, 6), 0, ol, C); ear.position.set(s * 0.14, 0.24, -0.02); ear.rotation.z = s * -0.3; head.add(ear); }
    if (o.horns) { const h = mk(G.cone(0.08, 0.5, 8), 0, ol, TM(o.horns)); h.position.set(s * 0.2, 0.2, 0); h.rotation.set(-0.7, 0, s * -0.8); head.add(h); }
  }
  const jaw = grp(head, 0, -0.12, 0.05);
  const jm = mk(G.sph(0.12, 10, 8), 0, ol, C2); jm.scale.set(0.9, 0.4, 1.6); jm.position.z = 0.2; jaw.add(jm);
  for (const s of [-1, 1]) { const f = new THREE.Mesh(G.cone(0.02, 0.07, 4), BM(0xffffff)); f.rotation.x = Math.PI; f.position.set(s * 0.06, 0.02, 0.36); jaw.add(f); }
  const legs = [];
  const LL = o.leg || 0.36;
  for (const [x, z, front] of [[-1, 1, 1], [1, 1, 1], [-1, -1, 0], [1, -1, 0]]) {
    const hp = grp(torso, x * 0.24 * (o.bw || 0.9), -0.1, z * 0.4 * (o.bl || 1.5) / 1.5);
    const th = mk(G.cap(0.1 * (o.legW || 1), LL * 0.6), 0, ol, C); th.position.y = -LL * 0.45; hp.add(th);
    const kn = grp(hp, 0, -LL * 0.9, 0);
    const sh = mk(G.cap(0.07 * (o.legW || 1), LL * 0.55), 0, ol, C); sh.position.y = -LL * 0.4; kn.add(sh);
    const paw = mk(G.sph(0.09 * (o.legW || 1), 8, 6), 0, ol, TM(o.paw || 0x2a2228)); paw.scale.set(1, 0.6, 1.3); paw.position.set(0, -LL * 0.8, 0.03); kn.add(paw);
    legs.push({ hp, kn, front, side: x });
  }
  const tail = grp(torso, 0, 0.1, -0.55 * (o.bl || 1.5) / 1.5);
  const tm = mk(G.cone(o.tailW || 0.1, o.tailL || 0.6, 8), 0, ol, TM(o.tailC || o.col)); tm.rotation.x = -Math.PI / 2 - 0.5; tm.position.z = -0.25; tail.add(tm);
  if (o.crystals) for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.12 + Math.random() * 0.1), new THREE.MeshToonMaterial({ color: o.crystals, gradientMap: gradTex, emissive: o.crystals, emissiveIntensity: 0.6 })); c.scale.y = 2.2; c.position.set(rnd(-.2, .2), 0.3 + rnd(0, .1), -0.3 + i * 0.16); c.rotation.set(rnd(-.4, .4), 0, rnd(-.5, .5)); torso.add(c); }
  if (o.spikes) for (let i = 0; i < 6; i++) { const s = mk(G.cone(0.06, 0.25, 6), 0, ol, TM(o.spikes)); s.position.set(0, 0.32, -0.4 + i * 0.16); s.rotation.x = -0.4; torso.add(s); }
  const shadow = blobShadow(root, 1.6 * (o.scale || 1));
  const q = { root, body, torso, neck, head, jaw, legs, tail, shadow, phase: 0, o, act: null, actT: 0, cur: { lean: 0, rear: 0, jaw: 0, crouch: 0, headX: 0 } };
  return q;
}
function quadUpdate(q, dt, loco) {
  const sp = clamp(loco.speed / 7, 0, 1.4);
  q.phase += dt * (sp > 0.05 ? 3 + sp * 8 : 1.5);
  const ph = q.phase;
  let want = { lean: 0, rear: 0, jaw: 0.05 + Math.sin(ph * 0.7) * 0.03, crouch: 0, headX: Math.sin(ph * 0.8) * 0.05 };
  if (q.act) {
    q.actT += dt; const t = q.actT, a = q.act;
    if (a === 'bite' || a === 'lunge') { want.lean = t < 0.25 ? -0.25 : 0.3; want.jaw = t < 0.25 ? 0.1 : t < 0.5 ? 0.6 : 0.1; want.crouch = t < 0.25 ? 0.15 : 0; }
    if (a === 'slam') { want.rear = t < 0.5 ? 1.0 * easeOut(t / 0.5) : t < 0.7 ? lerp(1, -0.15, (t - 0.5) / 0.2) : -0.15; want.jaw = t < 0.6 ? 0.5 : 0.2; }
    if (a === 'roar') { want.rear = 0.4; want.jaw = 0.8; want.headX = -0.6; }
    if (a === 'charge') { want.lean = 0.2; want.headX = 0.4; want.crouch = 0.1; }
    if (a === 'hurt') { want.lean = -0.3; want.headX = -0.3; }
    if (a === 'down') { want.crouch = 0.45; want.lean = 0.2; want.headX = 0.4; }
    if (a === 'breath') { want.jaw = 0.7; want.headX = 0.1; want.lean = 0.05; }
    if (t > (q.actDur || 0.8)) q.act = null;
  }
  const c = q.cur; for (const k in want) c[k] = damp(c[k], want[k], 14, dt);
  q.torso.rotation.x = -c.rear * 0.9 + c.lean * 0.4;
  q.torso.position.y = (q.o.h || 0.7) - c.crouch * 0.5 + (sp > 0.05 ? Math.abs(Math.sin(ph)) * 0.06 * sp : Math.sin(ph) * 0.01) + c.rear * 0.25;
  q.neck.rotation.x = c.headX + c.rear * 0.5;
  q.jaw.rotation.x = c.jaw;
  q.tail.rotation.y = Math.sin(ph * 1.3) * 0.4; q.tail.rotation.x = -0.2 + Math.sin(ph) * 0.1;
  for (const L of q.legs) {
    const off = (L.front ? 0 : Math.PI) + (L.side > 0 ? 0.5 : 0);
    const s = Math.sin(ph + off);
    let hx = -s * 0.7 * sp, kx = Math.max(0, Math.cos(ph + off)) * 0.9 * sp;
    if (L.front && c.rear > 0.2) { hx = -1.2 * c.rear; kx = 0.8 * c.rear; }
    if (!L.front && c.rear > 0.2) { hx = c.rear * 0.9; }
    L.hp.rotation.x = hx + c.crouch * (L.front ? -0.4 : 0.6); L.kn.rotation.x = (L.front ? -kx : kx) + c.crouch * (L.front ? 0.6 : -0.8);
  }
  q.shadow.position.y = 0.03 - q.root.position.y + (loco.groundY || 0);
}
// beetle
function beetle(o) {
  const root = new THREE.Group(); const body = grp(root); body.scale.setScalar(o.scale || 1);
  const ol = 0.02;
  const shell = mk(G.sph(0.6, 16, 12), 0, ol, TM(o.col)); shell.scale.set(1, 0.6, 1.2); shell.position.y = 0.55; body.add(shell);
  const line = new THREE.Mesh(G.box(0.03, 0.4, 1.4), TM(0x1a1418)); line.position.y = 0.72; body.add(line);
  const under = mk(G.sph(0.5, 12, 10), 0, ol, TM(0x3a3028)); under.scale.set(1, 0.4, 1.1); under.position.y = 0.4; body.add(under);
  const head = grp(body, 0, 0.45, 0.65);
  const hm = mk(G.sph(0.25, 12, 10), 0, ol, TM(o.col2 || 0x3a3028)); head.add(hm);
  const horn = mk(G.cone(0.09, 0.7, 8), 0, ol, TM(o.horn || 0xe8d8a0)); horn.rotation.x = 1.1; horn.position.set(0, 0.2, 0.25); head.add(horn);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(G.sph(0.05, 8, 6), BM(0xff5030)); e.position.set(s * 0.15, 0.06, 0.18); head.add(e); }
  const legs = [];
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
    const hp = grp(body, s * 0.42, 0.38, 0.35 - i * 0.35);
    const l = mk(G.cap(0.04, 0.35), 0, 0.01, TM(0x2a2018)); l.rotation.z = s * 1.0; l.position.set(s * 0.15, -0.12, 0); hp.add(l);
    legs.push({ hp, i, s });
  }
  const shadow = blobShadow(root, 1.6 * (o.scale || 1));
  return { root, body, head, legs, shadow, phase: 0, act: null, actT: 0, o, cur: { lean: 0 } };
}
function beetleUpdate(q, dt, loco) {
  const sp = clamp(loco.speed / 6, 0, 1.5); q.phase += dt * (sp > 0.05 ? 6 + sp * 12 : 1);
  let lean = 0, hx = 0;
  if (q.act) { q.actT += dt; if (q.act === 'charge') { lean = 0.15; hx = 0.3; } if (q.act === 'lunge' || q.act === 'bite') { hx = q.actT < 0.3 ? -0.5 : 0.4; } if (q.act === 'hurt') { lean = -0.2; } if (q.act === 'down') { lean = 0.4; } if (q.actT > (q.actDur || 0.8)) q.act = null; }
  q.cur.lean = damp(q.cur.lean, lean, 12, dt);
  q.body.rotation.x = q.cur.lean; q.head.rotation.x = damp(q.head.rotation.x, hx, 12, dt);
  q.body.position.y = sp > 0.05 ? Math.abs(Math.sin(q.phase)) * 0.03 : 0;
  for (const L of q.legs) L.hp.rotation.y = Math.sin(q.phase + L.i * 2 + (L.s > 0 ? Math.PI : 0)) * 0.5 * Math.min(1, sp + 0.1);
  q.shadow.position.y = 0.03 - q.root.position.y + (loco.groundY || 0);
}
// carnivorous flower
function bloom(o) {
  const root = new THREE.Group(); const body = grp(root); body.scale.setScalar(o.scale || 1);
  const ol = 0.02;
  for (let i = 0; i < 5; i++) { const lf = mk(G.sph(0.35, 10, 6), 0, ol, TM(0x4a9a3a)); lf.scale.set(0.5, 0.12, 1.4); const a = i / 5 * TAU; lf.position.set(Math.sin(a) * 0.45, 0.08, Math.cos(a) * 0.45); lf.rotation.y = a; body.add(lf); }
  const stem = grp(body, 0, 0.1, 0);
  const sm = mk(G.cyl(0.07, 0.11, 1.1, 8), 0, ol, TM(0x3a8a3a)); sm.position.y = 0.55; stem.add(sm);
  const head = grp(stem, 0, 1.15, 0);
  const core = mk(G.sph(0.25, 12, 10), 0, ol, TM(o.core || 0xffd040)); core.scale.z = 0.7; head.add(core);
  const petals = [];
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; const pv = grp(head, 0, 0, 0); pv.rotation.z = a; const p = mk(G.sph(0.22, 10, 8), 0, ol, TM(o.col)); p.scale.set(0.6, 1.3, 0.25); p.position.y = 0.38; pv.add(p); petals.push(pv); }
  const mouth = new THREE.Mesh(G.sph(0.12, 10, 8), BM(0x6a1020)); mouth.scale.set(1, 0.6, 0.3); mouth.position.z = 0.17; head.add(mouth);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(G.sph(0.04, 8, 6), BM(0x1a1018)); e.position.set(s * 0.09, 0.09, 0.16); head.add(e); }
  const shadow = blobShadow(root, 1.4 * (o.scale || 1));
  return { root, body, stem, head, petals, shadow, phase: Math.random() * 9, act: null, actT: 0, o };
}
function bloomUpdate(q, dt, loco) {
  q.phase += dt * 2;
  let lean = Math.sin(q.phase) * 0.08, open = 0;
  if (q.act) { q.actT += dt; const t = q.actT; if (q.act === 'shoot') { lean = t < 0.4 ? -0.4 : 0.3; open = t < 0.4 ? 0.4 : 0; } if (q.act === 'lunge' || q.act === 'bite') { lean = t < 0.3 ? -0.5 : 0.7; } if (q.act === 'hurt') lean = -0.4; if (q.act === 'down') lean = 1.2; if (t > (q.actDur || 0.8)) q.act = null; }
  q.stem.rotation.x = damp(q.stem.rotation.x, lean, 10, dt);
  q.petals.forEach((p, i) => p.rotation.x = damp(p.rotation.x, open + Math.sin(q.phase * 2 + i) * 0.05, 10, dt));
  q.head.rotation.y = Math.sin(q.phase * 0.7) * 0.2;
  q.shadow.position.y = 0.03 - q.root.position.y + (loco.groundY || 0);
}

// unified model wrapper ---------------------------------------------------
function makeModel(kind) {
  let m, upd, type;
  if (CHAR_LOOK[kind]) { m = makeChar(kind); type = 'human'; }
  else if (['elder', 'kid', 'woman', 'merchant', 'man', 'knight', 'assassin', 'soldier', 'garmo'].includes(kind)) { m = makeNPC(kind); type = 'human'; }
  else if (kind === 'wolf') { m = quadruped({ col: 0x6a7a9a, col2: 0xc8d0e0, mane: 0x4a5a7a, eye: 0xffd040, scale: 1.0, tailC: 0x4a5a7a }); type = 'quad'; }
  else if (kind === 'wolf2') { m = quadruped({ col: 0x9a4a3a, col2: 0xe0c0a0, mane: 0x6a2a20, eye: 0xffe060, scale: 1.1, tailC: 0x6a2a20 }); type = 'quad'; }
  else if (kind === 'bear') { m = quadruped({ col: 0x7a5a3a, col2: 0xc8a070, scale: 2.4, h: 0.62, bw: 1.2, bh: 1.0, bl: 1.4, snout: 1.0, snoutW: 1, leg: 0.34, legW: 1.5, tailL: 0.2, tailW: 0.1, eye: 0xff4020, spikes: 0x5a3a20, paw: 0x3a2a1a }); type = 'quad'; }
  else if (kind === 'behemoth') { m = quadruped({ col: 0x3a2a5a, col2: 0x6a5a8a, mane: 0x2a1a3a, scale: 3.6, h: 0.72, bw: 1.15, bh: 1.0, bl: 1.6, snout: 1.2, snoutW: 1.1, leg: 0.4, legW: 1.5, tailL: 1.2, tailW: 0.14, eye: 0xff3040, horns: 0xe8d8b0, crystals: 0x60c8ff, ears: false, paw: 0x1a1020 }); type = 'quad'; }
  else if (kind === 'beetle') { m = beetle({ col: 0x4a7a5a, col2: 0x2a3a2a, scale: 1.0 }); type = 'beetle'; }
  else if (kind === 'beetle2') { m = beetle({ col: 0x8a5ab0, col2: 0x3a2a4a, horn: 0xffd060, scale: 1.25 }); type = 'beetle'; }
  else if (kind === 'bloom') { m = bloom({ col: 0xff6a9a }); type = 'bloom'; }
  else if (kind === 'bloom2') { m = bloom({ col: 0x9a6aff, core: 0xff6a40, scale: 1.2 }); type = 'bloom'; }
  upd = type === 'human' ? rigUpdate : type === 'quad' ? quadUpdate : type === 'beetle' ? beetleUpdate : bloomUpdate;
  return {
    kind, type, m, root: m.root,
    update(dt, loco) { upd(m, dt, loco); },
    play(clip, sp) { if (type === 'human') rigPlay(m, clip, sp); },
    act(name, dur) { if (type !== 'human') { m.act = name; m.actT = 0; m.actDur = dur || 0.8; } },
    get busy() { return type === 'human' ? !!m.clip : !!m.act; },
  };
}
