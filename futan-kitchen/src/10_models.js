// ================================================================ characters (low-poly, flat-shaded "clay" look)
const SKIN = 0xffd6b8;
function faceEye(parent, x, y, z, ry, s = 1) {
  const e = new THREE.Group(); e.position.set(x, y, z); e.rotation.y = ry; parent.add(e);
  const b = new THREE.Mesh(new THREE.CircleGeometry(0.052 * s, 12), MB(0x24140e)); b.scale.y = 1.4; e.add(b);
  const h = new THREE.Mesh(new THREE.CircleGeometry(0.019 * s, 8), MB(0xffffff)); h.position.set(0.016 * s, 0.032 * s, 0.002); e.add(h);
  return e;
}
function faceDecor(hs, r, o = {}) {
  const eyes = [];
  for (const s of [-1, 1]) eyes.push(faceEye(hs, s * r * 0.36, r * (o.ey || 0.02), r * 0.95, s * 0.36, o.es || 1));
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(r * 0.15, 12, Math.PI, Math.PI), MB(o.mc || 0xd03040));
  mouth.position.set(0, -r * 0.34, r * 0.955); hs.add(mouth);
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.CircleGeometry(r * 0.15, 10), MB(0xff9fae)); c.position.set(s * r * 0.6, -r * 0.2, r * 0.8); c.rotation.y = s * 0.62; hs.add(c); }
  return { eyes, mouth };
}

function makeChef(kind) {
  const R = kind === 'ricky';
  const P = { g: new THREE.Group(), kind, t: Math.random() * 5 };
  const smock = R ? 0x59b2ff : 0xff7eb0, shoe = R ? 0x2a62d8 : 0xe8344a, hair = R ? 0x3b2414 : 0x4a2814;
  const root = new THREE.Group(); root.scale.setScalar(R ? 0.64 : 0.72); P.g.add(root); P.root = root;
  for (const s of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(s * 0.1, 0.3, 0);
    leg.add(at(mesh(G.cyl(0.065, 0.06, 0.24, 6), SKIN), 0, -0.1, 0));
    leg.add(at(mesh(G.box(0.14, 0.1, 0.22), shoe), 0, -0.25, 0.03));
    root.add(leg); P[s < 0 ? 'legL' : 'legR'] = leg;
  }
  const body = new THREE.Group(); body.position.y = 0.3; root.add(body); P.body = body;
  body.add(at(mesh(G.cyl(0.17, 0.28, 0.44, 8), smock), 0, 0.2, 0));
  const ap = mesh(G.box(0.3, 0.32, 0.04), 0xffffff); ap.position.set(0, 0.17, 0.215); ap.rotation.x = -0.2; body.add(ap);
  const pk = mesh(G.box(0.13, 0.07, 0.03), R ? 0xffd84a : 0xff5f7a); pk.position.set(0, 0.11, 0.24); pk.rotation.x = -0.2; body.add(pk);
  // collar
  body.add(at(mesh(G.cyl(0.13, 0.17, 0.06, 8), 0xffffff), 0, 0.43, 0));
  for (const s of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(s * 0.21, 0.36, 0);
    arm.add(mesh(G.ico(0.085, 0), smock));
    arm.add(at(mesh(G.cyl(0.05, 0.045, 0.24, 6), SKIN), 0, -0.14, 0));
    arm.add(at(mesh(G.ico(0.062, 0), SKIN), 0, -0.28, 0));
    body.add(arm); P[s < 0 ? 'armL' : 'armR'] = arm;
  }
  const head = new THREE.Group(); head.position.y = 0.44; body.add(head); P.head = head;
  const hs = mesh(G.ico(0.31, 1), SKIN); hs.position.y = 0.27; head.add(hs);
  const hb = mesh(new THREE.SphereGeometry(0.335, 10, 8, 0, TAU, 0, 1.85), hair); hb.position.set(0, 0.29, -0.015); hb.rotation.x = -0.55; head.add(hb);
  if (!R) {
    for (const s of [-1, 1]) {
      const tg = new THREE.Group(); tg.position.set(s * 0.31, 0.3, -0.08); head.add(tg);
      tg.add(mesh(G.ico(0.055, 0), 0xff4f8a));
      const t = mesh(G.ico(0.11, 0), hair); t.scale.set(0.85, 1.35, 0.85); t.position.set(s * 0.08, -0.12, 0); tg.add(t);
      P[s < 0 ? 'tailL' : 'tailR'] = tg;
    }
  } else {
    const tuft = mesh(G.cone(0.06, 0.16, 5), hair); tuft.position.set(0.05, 0.62, 0.12); tuft.rotation.z = -0.5; head.add(tuft);
  }
  P.face = faceDecor(hs, 0.31, { es: R ? 1.1 : 1 });
  // chef hat
  const hat = new THREE.Group(); hat.position.set(0, 0.52, -0.03); hat.rotation.x = -0.12; head.add(hat); P.hat = hat;
  hat.add(at(mesh(G.cyl(0.22, 0.24, 0.12, 10), 0xffffff), 0, 0.04, 0));
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; hat.add(at(mesh(G.ico(0.13, 0), 0xffffff), Math.cos(a) * 0.12, 0.17, Math.sin(a) * 0.12)); }
  hat.add(at(mesh(G.ico(0.16, 0), 0xffffff), 0, 0.24, 0));
  if (R) hat.scale.setScalar(0.85);
  // little badge on the hat
  const bd = new THREE.Mesh(new THREE.CircleGeometry(0.05, 10), MB(R ? 0x59b2ff : 0xff4f8a)); bd.position.set(0, 0.05, 0.235); hat.add(bd);
  return P;
}
function animChef(P, s, dt) {
  P.t += dt; const t = P.t, mv = s.move || 0;
  let lL = 0, lR = 0, aL = 0, aR = 0, aLz = 0, aRz = 0, bx = 0, bob = 0;
  const sw = Math.sin(s.phase || 0) * 0.85 * mv; lL = sw; lR = -sw; aL = -sw * 0.7; aR = sw * 0.7;
  bob = Math.abs(Math.cos(s.phase || 0)) * 0.06 * mv; bx = 0.12 * mv;
  if (mv < 0.05) { bob = Math.sin(t * 3) * 0.012; aLz = 0.12; aRz = -0.12; }
  if (s.hold) { aL = aR = -1.3; aLz = 0.28; aRz = -0.28; }
  if (s.chop) { aR = -1.3 + Math.sin(t * 24) * 0.55; aL = -0.7; aLz = 0.3; bx = 0.15; }
  if (s.wash) { aL = -1.25 + Math.sin(t * 15) * 0.35; aR = -1.25 - Math.sin(t * 15) * 0.35; aLz = 0.25; aRz = -0.25; bx = 0.22; }
  if (s.spray) { aL = aR = -1.45; aLz = 0.2; aRz = -0.2; bx = 0.05 + Math.sin(t * 30) * 0.02; }
  if (s.throwT > 0) { const k = 1 - s.throwT / 0.3; aR = lerp(-2.8, -0.6, k); aRz = -0.2; }
  if (s.dash) { bx = 0.35; aL = 0.8; aR = 0.8; }
  if (s.cheer) { aL = aR = -2.8 + Math.sin(t * 10) * 0.25; aLz = 0.45; aRz = -0.45; bob = Math.abs(Math.sin(t * 7)) * 0.12; }
  if (s.sad) { bx = 0.35; aLz = 0.05; aRz = -0.05; }
  if (s.talk) { aR = -0.9 + Math.sin(t * 6) * 0.3; aRz = -0.3; }
  const k = 1 - Math.exp(-20 * dt);
  P.legL.rotation.x = lerp(P.legL.rotation.x, lL, k); P.legR.rotation.x = lerp(P.legR.rotation.x, lR, k);
  P.armL.rotation.x = lerp(P.armL.rotation.x, aL, k); P.armR.rotation.x = lerp(P.armR.rotation.x, aR, k);
  P.armL.rotation.z = lerp(P.armL.rotation.z, aLz, k); P.armR.rotation.z = lerp(P.armR.rotation.z, aRz, k);
  P.body.rotation.x = lerp(P.body.rotation.x, bx, k);
  P.body.position.y = 0.3 + bob;
  P.head.rotation.z = Math.sin(t * 1.7) * 0.05;
  P.head.rotation.x = s.sad ? 0.35 : s.cheer ? -0.2 : 0;
  if (P.tailL) { P.tailL.rotation.z = Math.sin(t * 6) * 0.15 * (0.3 + mv); P.tailR.rotation.z = -P.tailL.rotation.z; }
  P.hat.rotation.z = Math.sin(t * 2.3) * 0.05 + (s.chop ? Math.sin(t * 24) * 0.05 : 0);
  const bl = ((t + P.kind.length) % 3.3) < 0.11 ? 0.12 : 1;
  for (const e of P.face.eyes) e.scale.y = s.happy ? 0.35 : bl;
}

// ---------------------------------------------------------------- タマネギ えんちょう (onion principal)
function makeEnchou() {
  const P = { g: new THREE.Group(), t: 0 };
  const root = new THREE.Group(); root.scale.setScalar(0.85); P.g.add(root); P.root = root;
  root.add(at(mesh(G.cone(0.42, 0.75, 9), 0x7a3cc8), 0, 0.37, 0));
  root.add(at(mesh(G.cyl(0.43, 0.43, 0.06, 9), 0xffd84a), 0, 0.03, 0));
  const cape = mesh(G.cone(0.48, 0.7, 9, 1, true), 0xe8344a); cape.position.set(0, 0.36, -0.04); cape.scale.set(1, 1, 0.8); root.add(cape);
  for (const s of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(s * 0.26, 0.55, 0.05); root.add(arm);
    arm.add(at(mesh(G.cyl(0.06, 0.07, 0.3, 6), 0x7a3cc8), 0, -0.13, 0));
    arm.add(at(mesh(G.ico(0.07, 0), 0xffffff), 0, -0.3, 0));
    P[s < 0 ? 'armL' : 'armR'] = arm;
  }
  const head = new THREE.Group(); head.position.y = 0.95; root.add(head); P.head = head;
  const hs = mesh(G.ico(0.38, 1), 0xf3dcef); hs.scale.set(1, 1.05, 1); head.add(hs);
  // onion lines
  for (const a of [-0.5, 0, 0.5]) { const l = mesh(G.tor(0.38, 0.012, 3, 16, Math.PI), 0xd8a8d8, false); l.rotation.y = Math.PI / 2 + a; l.rotation.z = Math.PI / 2; head.add(l); }
  const tip = mesh(G.cone(0.14, 0.3, 6), 0xf3dcef); tip.position.y = 0.48; head.add(tip);
  for (let i = 0; i < 3; i++) { const sp = mesh(G.cone(0.04, 0.32, 4), 0x56c23a); sp.position.set((i - 1) * 0.05, 0.7, 0); sp.rotation.z = (i - 1) * 0.4; head.add(sp); }
  // crown
  const cr = new THREE.Group(); cr.position.set(0, 0.3, 0); head.add(cr);
  cr.add(mesh(G.cyl(0.23, 0.25, 0.1, 8, 1, true), 0xffd84a));
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; cr.add(at(mesh(G.cone(0.05, 0.12, 4), 0xffd84a), Math.cos(a) * 0.23, 0.1, Math.sin(a) * 0.23)); }
  P.face = faceDecor(hs, 0.38, { ey: 0.12, es: 1.2 });
  P.face.mouth.visible = false;
  for (const s of [-1, 1]) { const m = mesh(G.ico(0.1, 0), 0xffffff); m.scale.set(1.5, 0.55, 0.7); m.position.set(s * 0.12, -0.1, 0.34); m.rotation.z = s * -0.3; head.add(m); }
  return P;
}
function animEnchou(P, s, dt) {
  P.t += dt; const t = P.t;
  P.root.position.y = Math.abs(Math.sin(t * (s.talk ? 7 : 2))) * (s.talk ? 0.05 : 0.015);
  P.armR.rotation.x = s.talk ? -1.2 + Math.sin(t * 6) * 0.4 : s.cheer ? -2.6 : 0;
  P.armL.rotation.x = s.cheer ? -2.6 : s.worry ? -1.8 : 0;
  P.armR.rotation.z = s.talk ? -0.4 : 0;
  P.head.rotation.z = Math.sin(t * 1.5) * 0.06;
  const bl = (t % 3.1) < 0.1 ? 0.12 : 1; for (const e of P.face.eyes) e.scale.y = bl;
}

// ---------------------------------------------------------------- ハラペコン (big hungry monster)
function makeHarapekon() {
  const P = { g: new THREE.Group(), t: 0, chomp: 0, cute: 0 };
  const root = new THREE.Group(); P.g.add(root); P.root = root;
  const bodyM = new THREE.MeshStandardMaterial({ color: 0x8a52d8, flatShading: true, roughness: 0.8 });
  const bellyM = new THREE.MeshStandardMaterial({ color: 0xd2b2ff, flatShading: true, roughness: 0.8 });
  P.bodyM = bodyM; P.bellyM = bellyM;
  const body = mesh(G.ico(1, 1), bodyM); body.scale.set(1.15, 1, 1); body.position.y = 1; root.add(body); P.body = body;
  const belly = mesh(G.ico(0.72, 1), bellyM); belly.scale.set(1, 0.9, 0.5); belly.position.set(0, 0.8, 0.62); root.add(belly); P.belly = belly;
  // feet & arms
  for (const s of [-1, 1]) {
    root.add(at(mesh(G.ico(0.3, 0), bodyM), s * 0.55, 0.15, 0.2));
    const arm = new THREE.Group(); arm.position.set(s * 1.1, 1.0, 0.1); root.add(arm); P[s < 0 ? 'armL' : 'armR'] = arm;
    arm.add(at(mesh(G.ico(0.26, 0), bodyM), s * 0.15, -0.15, 0));
    for (let i = 0; i < 3; i++) arm.add(at(mesh(G.cone(0.05, 0.14, 4), 0xffffff), s * 0.25 + (i - 1) * 0.08, -0.35, 0.05));
    const horn = mesh(G.cone(0.14, 0.42, 6), 0xffe08a); horn.position.set(s * 0.55, 1.88, 0); horn.rotation.z = -s * 0.4; root.add(horn);
  }
  // mouth
  const mouth = new THREE.Group(); mouth.position.set(0, 0.92, 0.9); root.add(mouth); P.mouth = mouth;
  const mi = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), MB(0x5a0a1a)); mi.scale.set(1, 0.55, 1); mouth.add(mi);
  const tg = new THREE.Mesh(new THREE.CircleGeometry(0.25, 12), MB(0xff6a8a)); tg.position.set(0, -0.12, 0.01); tg.scale.y = 0.5; mouth.add(tg);
  P.teeth = [];
  for (let i = 0; i < 5; i++) { const th = mesh(G.cone(0.07, 0.15, 4), 0xffffff, false); th.rotation.x = Math.PI; th.position.set((i - 2) * 0.17, 0.2 - Math.abs(i - 2) * 0.02, 0.03); mouth.add(th); P.teeth.push(th); }
  for (const s of [-1, 1]) { const th = mesh(G.cone(0.06, 0.12, 4), 0xffffff, false); th.position.set(s * 0.2, -0.2, 0.03); mouth.add(th); }
  // eyes
  P.eyes = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(s * 0.36, 1.48, 0.8); root.add(e);
    e.add(mesh(G.ico(0.22, 1), 0xffffff));
    const pu = mesh(G.ico(0.11, 0), 0x1a0a1a); pu.position.set(0, -0.02, 0.17); e.add(pu);
    const hl = mesh(G.ico(0.035, 0), 0xffffff, false); hl.position.set(0.04, 0.05, 0.27); e.add(hl);
    const br = mesh(G.box(0.36, 0.08, 0.08), 0x3a1a5a); br.position.set(0, 0.25, 0.12); br.rotation.z = s * 0.35; e.add(br); e.brow = br;
    P.eyes.push(e);
  }
  // bib (appears when cute)
  const bib = mesh(G.cyl(0.7, 0.7, 0.04, 14, 1, false, -Math.PI / 2, Math.PI), 0xffffff); bib.rotation.x = Math.PI / 2 + 0.2; bib.position.set(0, 0.55, 0.75); bib.visible = false; root.add(bib); P.bib = bib;
  return P;
}
function animHarapekon(P, s, dt) {
  P.t += dt; const t = P.t;
  P.chomp = Math.max(0, P.chomp - dt);
  const ch = P.chomp > 0 ? Math.abs(Math.sin(P.chomp * 18)) : 0;
  const open = s.roar ? 1.4 + Math.sin(t * 30) * 0.1 : s.eat ? 0.4 + ch : 0.65 + Math.sin(t * 2) * 0.12 + ch * 0.6;
  P.mouth.scale.set(1, lerp(P.mouth.scale.y, open * (P.cute ? 0.4 : 1), 1 - Math.exp(-15 * dt)), 1);
  P.root.position.y = Math.abs(Math.sin(t * (s.roar ? 12 : 1.6))) * (s.roar ? 0.12 : 0.06);
  P.root.rotation.z = Math.sin(t * 1.2) * 0.04;
  P.armL.rotation.z = Math.sin(t * 2.2) * 0.25 + (s.roar ? 0.9 : 0);
  P.armR.rotation.z = -Math.sin(t * 2.2) * 0.25 - (s.roar ? 0.9 : 0);
  for (const e of P.eyes) { e.brow.visible = !P.cute; e.scale.y = (t % 4) < 0.12 ? 0.15 : 1; }
  P.bib.visible = !!P.cute;
  if (P.cute) { P.bodyM.color.setHex(0xff9ad0); P.bellyM.color.setHex(0xffe0f0); for (const th of P.teeth) th.visible = false; }
}

// ---------------------------------------------------------------- ポチ (dog)
function makeDog() {
  const P = { g: new THREE.Group(), t: Math.random() * 3 };
  const r = new THREE.Group(); r.scale.setScalar(0.7); P.g.add(r); P.root = r;
  const b = mesh(G.ico(0.22, 0), 0xffffff); b.scale.set(0.9, 0.85, 1.3); b.position.y = 0.3; r.add(b);
  for (const [x, z] of [[-0.1, 0.15], [0.1, 0.15], [-0.1, -0.15], [0.1, -0.15]]) r.add(at(mesh(G.cyl(0.04, 0.04, 0.18, 5), 0xffffff), x, 0.1, z));
  const h = new THREE.Group(); h.position.set(0, 0.52, 0.22); r.add(h); P.head = h;
  const hs = mesh(G.ico(0.18, 1), 0xffffff); h.add(hs);
  h.add(at(mesh(G.ico(0.08, 0), 0xffffff), 0, -0.05, 0.14));
  h.add(at(mesh(G.ico(0.035, 0), 0x1a1010), 0, -0.02, 0.22));
  for (const s of [-1, 1]) { const e = mesh(G.box(0.08, 0.16, 0.04), 0xa86a3a); e.position.set(s * 0.15, 0.04, 0); e.rotation.z = s * 0.3; h.add(e); }
  faceEye(hs, -0.07, 0.04, 0.17, -0.35, 0.8); faceEye(hs, 0.07, 0.04, 0.17, 0.35, 0.8);
  const tail = mesh(G.cone(0.04, 0.18, 4), 0xffffff); tail.position.set(0, 0.42, -0.3); tail.rotation.x = -0.8; r.add(tail); P.tail = tail;
  const col = mesh(G.tor(0.12, 0.025, 4, 10), 0xe8344a); col.position.set(0, 0.42, 0.18); col.rotation.x = 1.2; r.add(col);
  return P;
}
function animDog(P, dt, excited) {
  P.t += dt; P.tail.rotation.z = Math.sin(P.t * (excited ? 25 : 10)) * 0.5;
  P.root.position.y = excited ? Math.abs(Math.sin(P.t * 9)) * 0.15 : 0;
  P.head.rotation.z = Math.sin(P.t * 2) * 0.1;
}

// ---------------------------------------------------------------- ようちえん バス
function makeBus() {
  const g = new THREE.Group();
  const b = mesh(G.box(1.3, 0.8, 2.4), 0xffc81e); b.position.y = 0.65; g.add(b);
  g.add(at(mesh(G.box(1.36, 0.12, 2.46), 0xff8a1e), 0, 0.3, 0));
  const roof = mesh(G.box(1.2, 0.12, 2.2), 0xffffff); roof.position.y = 1.1; g.add(roof);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) g.add(at(mesh(G.box(0.04, 0.3, 0.5), 0x8ad8ff, false), s * 0.66, 0.78, -0.7 + i * 0.62));
  g.add(at(mesh(G.box(1.0, 0.32, 0.04), 0x8ad8ff, false), 0, 0.8, 1.21));
  for (const [x, z] of [[-0.62, 0.75], [0.62, 0.75], [-0.62, -0.75], [0.62, -0.75]]) { const w = mesh(G.cyl(0.24, 0.24, 0.18, 10), 0x2a2a2a); w.rotation.z = Math.PI / 2; w.position.set(x, 0.24, z); g.add(w); }
  // face
  for (const s of [-1, 1]) { g.add(at(mesh(G.cyl(0.11, 0.11, 0.04, 10), 0xfff8d0, false), s * 0.42, 0.42, 1.21)).rotation.x = Math.PI / 2; }
  const sm = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12, Math.PI, Math.PI), MB(0x2a1a12)); sm.position.set(0, 0.47, 1.215); g.add(sm);
  // sunflower emblem
  const em = new THREE.Group(); em.position.set(0.67, 0.62, 0); em.rotation.y = Math.PI / 2; g.add(em);
  for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.08, 6), MB(0xffe84a)); const a = i / 8 * TAU; p.position.set(Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0.01); em.add(p); }
  em.add(new THREE.Mesh(new THREE.CircleGeometry(0.08, 10), MB(0x8a4a1a)));
  const em2 = em.clone(); em2.position.x = -0.67; em2.rotation.y = -Math.PI / 2; g.add(em2);
  // passengers' heads in windows
  const f = mesh(G.ico(0.17, 1), SKIN); f.position.set(0.2, 0.98, 0.6); g.add(f);
  g.add(at(mesh(G.ico(0.12, 0), 0xffffff), 0.2, 1.17, 0.6));
  const r = mesh(G.ico(0.14, 1), SKIN); r.position.set(-0.25, 0.95, 0.1); g.add(r);
  g.add(at(mesh(G.ico(0.1, 0), 0xffffff), -0.25, 1.1, 0.1));
  return g;
}

// ================================================================ ingredients
const CHUNK = {
  tomato: [0xe8402a, 0xff8a7a], lettuce: [0x5ccc3a, 0x9ae86a], meat: [0xd84a5a, 0xffc0c8], fish: [0xff8a5a, 0xffe0d0],
  carrot: [0xff8a1e, 0xffb04a], potato: [0xe8c87a, 0xfff0b0], onion: [0xf3dcef, 0xffffff],
};
function ingModel(id, st) {
  const g = new THREE.Group();
  if (st === 'chop' && CHUNK[id]) {
    const [c1, c2] = CHUNK[id];
    const pos = [[-0.08, 0.06], [0.08, 0.04], [0, -0.08], [-0.02, 0.0], [0.1, -0.06]];
    pos.forEach(([x, z], i) => {
      let m;
      if (id === 'lettuce') { m = mesh(G.box(0.13, 0.02, 0.1), i % 2 ? c2 : c1); m.rotation.set(rnd(-0.4, 0.4), rnd(0, 3), rnd(-0.4, 0.4)); }
      else if (id === 'carrot') { m = mesh(G.cyl(0.05, 0.05, 0.03, 7), i % 2 ? c2 : c1); }
      else if (id === 'onion') { m = mesh(G.tor(0.045, 0.014, 3, 8), i % 2 ? c2 : c1); m.rotation.x = Math.PI / 2; }
      else if (id === 'fish') { m = mesh(G.box(0.12, 0.04, 0.06), c1); const s = mesh(G.box(0.122, 0.042, 0.012), c2, false); m.add(s); m.rotation.y = rnd(-0.5, 0.5); }
      else { m = mesh(G.box(0.07, 0.06, 0.07), i % 2 ? c2 : c1); m.rotation.y = rnd(0, 3); }
      m.position.set(x, 0.03 + (i > 2 ? 0.035 : 0), z); g.add(m);
    });
    return g;
  }
  switch (id) {
    case 'tomato': g.add(at(mesh(G.ico(0.15, 1), 0xe8402a), 0, 0.14, 0)); g.add(at(mesh(G.cone(0.07, 0.05, 5), 0x3a9a2a), 0, 0.28, 0)); break;
    case 'lettuce': { const m = mesh(G.ico(0.18, 1), 0x5ccc3a); m.scale.set(1, 0.85, 1); m.position.y = 0.15; g.add(m); const n = mesh(G.ico(0.12, 0), 0x9ae86a); n.position.set(0, 0.24, 0.05); g.add(n); break; }
    case 'rice': { g.add(at(mesh(G.box(0.26, 0.26, 0.18), 0xf2e6c4), 0, 0.13, 0)); g.add(at(mesh(G.cone(0.1, 0.1, 5), 0xf2e6c4), 0, 0.31, 0)); g.add(at(mesh(G.cyl(0.05, 0.05, 0.03, 6), 0xb08a4a), 0, 0.27, 0)); const l = new THREE.Mesh(new THREE.CircleGeometry(0.07, 8), MB(0x3a8ad0)); l.position.set(0, 0.13, 0.091); g.add(l); break; }
    case 'nori': for (let i = 0; i < 2; i++) { const m = mesh(G.box(0.28, 0.015, 0.22), 0x1f3a24); m.position.y = 0.01 + i * 0.016; m.rotation.y = i * 0.2; g.add(m); } break;
    case 'meat': { const m = mesh(G.box(0.3, 0.12, 0.2), 0xd84a5a); m.position.y = 0.06; g.add(m); g.add(at(mesh(G.box(0.302, 0.03, 0.202), 0xffe0e0), 0, 0.07, 0)); break; }
    case 'bun': g.add(at(mesh(G.cyl(0.15, 0.16, 0.06, 10), 0xe8a84a), 0, 0.03, 0)); { const d = mesh(new THREE.SphereGeometry(0.16, 10, 5, 0, TAU, 0, Math.PI / 2), 0xd88a3a); d.position.y = 0.08; d.scale.y = 0.7; g.add(d); } break;
    case 'fish': { const b = mesh(G.ico(0.12, 1), 0x7a9ac8); b.scale.set(0.7, 0.7, 1.7); b.position.y = 0.09; g.add(b); const t = mesh(G.cone(0.08, 0.14, 4), 0x5a7aa8); t.rotation.x = -Math.PI / 2; t.position.set(0, 0.09, -0.25); g.add(t); const be = mesh(G.ico(0.06, 0), 0xe8eef8); be.scale.set(1, 0.6, 2.5); be.position.set(0, 0.05, 0.02); g.add(be); faceEye(b, 0.075, 0.03, 0.08, 1.2, 0.4); break; }
    case 'carrot': { const c = mesh(G.cone(0.065, 0.32, 7), 0xff8a1e); c.rotation.x = Math.PI / 2; c.position.set(0, 0.07, 0.02); g.add(c); for (let i = -1; i <= 1; i++) { const l = mesh(G.cone(0.025, 0.14, 4), 0x4ab03a); l.rotation.x = -Math.PI / 2 + i * 0.3; l.position.set(i * 0.02, 0.08, -0.2); g.add(l); } break; }
    case 'potato': { const p = mesh(G.ico(0.14, 0), 0xc8a060); p.scale.set(1.2, 0.8, 1); p.position.y = 0.1; g.add(p); break; }
    case 'onion': { const o = mesh(G.ico(0.14, 1), 0xe8c8e0); o.position.y = 0.13; g.add(o); g.add(at(mesh(G.cone(0.05, 0.12, 5), 0xe8c8e0), 0, 0.3, 0)); break; }
  }
  return g;
}
// ---------------------------------------------------------------- cookware
const POT_LIQ = { tomato_c: 0xe8402a, rice: 0xffffff, carrot_c: 0xffa040, potato_c: 0xe8d08a, onion_c: 0xf0e0f0 };
function potModel(it) {
  const g = new THREE.Group();
  if (it.pt === 'pot') {
    g.add(at(mesh(G.cyl(0.25, 0.22, 0.26, 12, 1, true), M(0xb8c2cc, { side: THREE.DoubleSide, metalness: 0.2 })), 0, 0.15, 0));
    g.add(at(mesh(G.cyl(0.22, 0.22, 0.02, 12), 0x8a96a4), 0, 0.03, 0));
    for (const s of [-1, 1]) g.add(at(mesh(G.box(0.1, 0.04, 0.06), 0x3a3a3a), s * 0.3, 0.24, 0));
    const n = it.items.length;
    if (n) {
      let col = 0xffffff;
      if (it.state === 'burnt') col = 0x2a2422;
      else if (it.state === 'done') { const o = potOut(it.items); col = o === 'soup' ? 0xe0301a : o === 'curry' ? 0xb8651a : o === 'gohan' ? 0xffffff : 0x9a8a6a; }
      else { const c = new THREE.Color(0, 0, 0); for (const k of it.items) c.add(new THREE.Color(POT_LIQ[k] || 0xcccccc)); c.multiplyScalar(1 / n); col = c.getHex(); }
      const lq = mesh(G.cyl(0.23, 0.23, 0.02, 12), col, false); lq.position.y = 0.08 + Math.min(3, n) * 0.05; g.add(lq);
      if (it.state !== 'done' && it.state !== 'burnt') it.items.forEach((k, i) => { const m = ingModel(k.replace('_c', ''), k.endsWith('_c') ? 'chop' : 'raw'); m.scale.setScalar(0.55); m.position.set((i - 1) * 0.1, lq.position.y - 0.02, 0); g.add(m); });
    }
  } else {
    g.add(at(mesh(G.cyl(0.27, 0.24, 0.06, 12), 0x2a2a2e), 0, 0.04, 0));
    g.add(at(mesh(G.cyl(0.23, 0.23, 0.02, 12), 0x55555c), 0, 0.075, 0));
    const h = mesh(G.box(0.36, 0.04, 0.07), 0x6a4a2a); h.position.set(0.42, 0.08, 0); g.add(h);
    if (it.items.length) {
      const col = it.state === 'burnt' ? 0x1a1414 : it.state === 'done' ? 0x7a3e1c : lerpHex(0xe06a7a, 0x8a4a2a, clamp(it.cook / (it.need || 1), 0, 1));
      g.add(at(mesh(G.cyl(0.15, 0.15, 0.06, 10), col), 0, 0.12, 0));
    }
  }
  return g;
}
function lerpHex(a, b, t) { return new THREE.Color(a).lerp(new THREE.Color(b), t).getHex(); }
function extModel() {
  const g = new THREE.Group();
  g.add(at(mesh(G.cyl(0.1, 0.1, 0.42, 10), 0xe8243a), 0, 0.21, 0));
  g.add(at(mesh(G.ico(0.1, 0), 0xe8243a), 0, 0.42, 0));
  g.add(at(mesh(G.box(0.18, 0.04, 0.05), 0x2a2a2a), 0.04, 0.5, 0));
  const n = mesh(G.cyl(0.02, 0.03, 0.2, 6), 0x2a2a2a); n.rotation.z = -1.2; n.position.set(0.12, 0.44, 0); g.add(n);
  const l = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.14), MB(0xffffff)); l.position.set(0, 0.24, 0.101); g.add(l);
  return g;
}
// ---------------------------------------------------------------- plates & plated food
function plateModel(it) {
  const g = new THREE.Group();
  const n = it.dirty ? it.n : 1;
  for (let i = 0; i < Math.min(n, 5); i++) {
    const p = mesh(G.cyl(0.28, 0.22, 0.045, 12), it.dirty ? 0xc8c0b0 : 0xffffff); p.position.y = 0.025 + i * 0.05; g.add(p);
    if (it.dirty) for (let k = 0; k < 3; k++) { const sp = new THREE.Mesh(new THREE.CircleGeometry(0.05, 6), MB(0x8a6a3a)); sp.rotation.x = -Math.PI / 2; sp.position.set(rnd(-0.14, 0.14), 0.05 + i * 0.05, rnd(-0.14, 0.14)); g.add(sp); }
  }
  if (!it.dirty && it.items.length) { const f = plateFood(it.items); f.position.y = 0.05; g.add(f); }
  return g;
}
function plateFood(items) {
  const g = new THREE.Group(); const has = k => items.includes(k);
  if (has('bun') || has('patty')) {
    let y = 0;
    if (has('bun')) { g.add(at(mesh(G.cyl(0.15, 0.15, 0.06, 10), 0xe8a84a), 0, y + 0.03, 0)); y += 0.06; }
    if (has('lettuce_c')) { const l = mesh(G.cyl(0.18, 0.17, 0.025, 9), 0x5ccc3a); l.position.y = y + 0.012; l.rotation.y = 0.3; g.add(l); y += 0.025; }
    if (has('patty')) { g.add(at(mesh(G.cyl(0.155, 0.155, 0.065, 10), 0x7a3e1c), 0, y + 0.032, 0)); y += 0.065; }
    if (has('bun') && has('patty')) { const d = mesh(new THREE.SphereGeometry(0.16, 10, 5, 0, TAU, 0, Math.PI / 2), 0xd88a3a); d.position.y = y; d.scale.y = 0.75; g.add(d); for (let i = 0; i < 5; i++) { const a = i * 1.3; g.add(at(mesh(G.box(0.02, 0.01, 0.01), 0xfff6d8, false), Math.cos(a) * 0.08, y + 0.1, Math.sin(a) * 0.08)); } }
    return g;
  }
  if (has('gohan')) {
    if (has('nori') && has('fish_c')) {
      for (let i = -1; i <= 1; i++) { const r = mesh(G.cyl(0.075, 0.075, 0.09, 10), 0x1f3a24); r.position.set(i * 0.16, 0.045, 0); g.add(r); g.add(at(mesh(G.cyl(0.06, 0.06, 0.092, 10), 0xffffff, false), i * 0.16, 0.046, 0)); g.add(at(mesh(G.cyl(0.028, 0.028, 0.094, 6), 0xff8a5a, false), i * 0.16, 0.047, 0)); }
    } else if (has('nori')) {
      for (const s of [-1, 1]) { const o = mesh(G.cyl(0.13, 0.13, 0.1, 3), 0xffffff); o.rotation.x = Math.PI / 2; o.rotation.y = 0; o.position.set(s * 0.12, 0.12, 0); o.rotation.z = Math.PI; g.add(o); const n = mesh(G.box(0.12, 0.08, 0.104), 0x1f3a24, false); n.position.set(s * 0.12, 0.05, 0); g.add(n); }
    } else if (has('curry')) {
      const r = mesh(G.ico(0.13, 1), 0xffffff); r.scale.set(1, 0.5, 1.2); r.position.set(-0.08, 0.04, 0); g.add(r);
      const c = mesh(G.cyl(0.15, 0.17, 0.04, 10), 0xb8651a); c.position.set(0.08, 0.02, 0); c.scale.set(0.8, 1, 1.2); g.add(c);
      g.add(at(mesh(G.box(0.05, 0.04, 0.05), 0xff8a1e), 0.1, 0.05, 0.06)); g.add(at(mesh(G.box(0.05, 0.04, 0.05), 0xf0d070), 0.05, 0.05, -0.06));
    } else { const r = mesh(G.ico(0.14, 1), 0xffffff); r.scale.set(1, 0.6, 1); r.position.y = 0.05; g.add(r); if (has('fish_c')) { const f = ingModel('fish', 'chop'); f.scale.setScalar(0.7); f.position.set(0, 0.07, 0); g.add(f); } }
    return g;
  }
  if (has('nori')) { const n = ingModel('nori', 'raw'); n.scale.setScalar(0.8); g.add(n); }
  if (has('fish_c')) { const f = ingModel('fish', 'chop'); f.scale.setScalar(0.8); f.position.y = 0.02; g.add(f); }
  if (has('curry')) { const c = mesh(G.cyl(0.17, 0.19, 0.04, 10), 0xb8651a); c.position.y = 0.02; g.add(c); }
  if (has('soup')) {
    g.add(at(mesh(G.cyl(0.2, 0.13, 0.13, 12, 1, true), M(0xffffff, { side: THREE.DoubleSide })), 0, 0.065, 0));
    g.add(at(mesh(G.cyl(0.18, 0.18, 0.02, 12), 0xe0301a, false), 0, 0.11, 0));
    g.add(at(mesh(G.box(0.04, 0.01, 0.04), 0x4ab03a, false), 0.04, 0.125, 0.02));
  }
  if (has('lettuce_c') || has('tomato_c')) {
    if (has('lettuce_c')) { const l = ingModel('lettuce', 'chop'); l.scale.setScalar(1.15); g.add(l); }
    if (has('tomato_c')) { const t = ingModel('tomato', 'chop'); t.scale.setScalar(0.8); t.position.set(0.03, 0.04, 0.02); g.add(t); }
  }
  return g;
}

// ---------------------------------------------------------------- fire
function makeFire() {
  const g = new THREE.Group(); g.userData.fl = [];
  const cols = [0xff3a1a, 0xff8a1a, 0xffd84a];
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(G.cone(0.16 - (i % 3) * 0.03, 0.55, 5), new THREE.MeshBasicMaterial({ color: cols[i % 3], transparent: true, opacity: 0.9, depthWrite: false }));
    const a = i / 5 * TAU; m.position.set(Math.cos(a) * 0.18, 0.25, Math.sin(a) * 0.18); g.add(m); g.userData.fl.push(m);
  }
  const c = new THREE.Mesh(G.cone(0.24, 0.8, 6), new THREE.MeshBasicMaterial({ color: 0xffb21e, transparent: true, opacity: 0.85, depthWrite: false })); c.position.y = 0.38; g.add(c); g.userData.fl.push(c);
  const L = new THREE.PointLight(0xff7a2a, 1.2, 3); L.position.y = 0.6; g.add(L);
  return g;
}
function animFire(g, t, k) {
  g.userData.fl.forEach((m, i) => { const s = (0.75 + Math.sin(t * 13 + i * 2.1) * 0.25) * k; m.scale.set(s, s * (1 + Math.sin(t * 9 + i) * 0.25), s); m.rotation.y = t * 2 + i; });
}
