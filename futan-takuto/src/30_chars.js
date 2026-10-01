// ================================================================ characters (toon, big-eyed)
const SKIN = 0xffdcc0;
// big glossy cartoon eyes on a head sphere
function addEyes(head, r, o = {}) {
  const eyes = new THREE.Group(); head.add(eyes);
  const sz = o.size || 0.2, sep = o.sep || 0.36, y = o.y || 0;
  const list = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Group();
    const ang = s * sep;
    e.position.set(Math.sin(ang) * r * 0.97, y, Math.cos(ang) * r * 0.97); e.rotation.y = ang;
    const white = new THREE.Mesh(new THREE.CircleGeometry(sz * 0.62, 18), BM(0xffffff)); white.scale.set(0.95, 1.35, 1); white.position.z = 0.002; e.add(white);
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(sz * 0.45, 18), BM(o.col || 0x1a1020)); pupil.scale.set(0.9, 1.4, 1); pupil.position.set(0, -sz * 0.05, 0.006); e.add(pupil);
    const hl = new THREE.Mesh(new THREE.CircleGeometry(sz * 0.14, 10), BM(0xffffff)); hl.position.set(sz * 0.12, sz * 0.22, 0.01); e.add(hl);
    const hl2 = new THREE.Mesh(new THREE.CircleGeometry(sz * 0.07, 8), BM(0xffffff)); hl2.position.set(-sz * 0.12, -sz * 0.22, 0.01); e.add(hl2);
    eyes.add(e); list.push({ e, pupil });
  }
  return list;
}
function blinkEyes(list, t, ph = 0) {
  const k = ((t + ph) % 3.7) < 0.12 ? 0.12 : 1;
  for (const o of list) o.e.scale.y = k;
}
function limb(len, r, col, ol = 0.02) { const g = new THREE.Group(); const m = mk(G.cyl(r, r * 0.9, len, 8), col, ol); m.position.y = -len / 2; g.add(m); return g; }

// ---------------------------------------------------------------- ふーたん
function makeFutan() {
  const g = new THREE.Group(), P = { g };
  const hair = 0x5a2e1a;
  // legs
  for (const s of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(s * 0.12, 0.48, 0);
    const th = mk(G.cyl(0.085, 0.075, 0.36, 8), 0xfaf6ea, 0.02); th.position.y = -0.2; leg.add(th);
    const bt = mk(G.cyl(0.1, 0.11, 0.18, 8), 0x8a5a2b, 0.02); bt.position.set(0, -0.4, 0.01); leg.add(bt);
    const toe = mk(G.sph(0.1, 8, 6), 0x8a5a2b, 0.02); toe.scale.set(1, 0.7, 1.4); toe.position.set(0, -0.45, 0.07); leg.add(toe);
    g.add(leg); P[s < 0 ? 'legL' : 'legR'] = leg;
  }
  const body = new THREE.Group(); body.position.y = 0.48; g.add(body); P.body = body;
  P.tunic = mk(G.cyl(0.19, 0.33, 0.52, 12), 0x3fae3a, 0.025); P.tunic.position.y = 0.2; body.add(P.tunic);
  P.belt = mk(G.cyl(0.26, 0.27, 0.07, 12), 0x6b4220, 0.015); P.belt.position.y = 0.2; body.add(P.belt);
  body.add(at(mk(G.box(0.1, 0.08, 0.04), 0xffd84a, 0), 0, 0.2, 0.27));
  P.collar = mk(G.cyl(0.13, 0.17, 0.08, 10), 0xfaf6ea, 0.015); P.collar.position.y = 0.46; body.add(P.collar);
  // arms
  for (const s of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(s * 0.25, 0.4, 0);
    const sl = mk(G.sph(0.11, 8, 6), 0x3fae3a, 0.02); arm.add(sl); P[s < 0 ? 'slvL' : 'slvR'] = sl;
    const a = mk(G.cyl(0.06, 0.055, 0.32, 8), SKIN, 0.018); a.position.y = -0.18; arm.add(a);
    const h = mk(G.sph(0.075, 8, 6), SKIN, 0.018); h.position.y = -0.36; arm.add(h);
    const hand = new THREE.Group(); hand.position.y = -0.36; arm.add(hand);
    body.add(arm); P[s < 0 ? 'armL' : 'armR'] = arm; P[s < 0 ? 'handL' : 'handR'] = hand;
  }
  // sword (wooden -> light)
  const sw = new THREE.Group(); sw.rotation.x = Math.PI / 2; P.handR.add(sw); P.sword = sw;
  P.blade = mk(G.box(0.07, 0.72, 0.025), 0xd8b070, 0.015); P.blade.position.y = 0.46; sw.add(P.blade);
  P.tip = mk(G.cone(0.05, 0.12, 4), 0xd8b070, 0.012); P.tip.position.y = 0.88; P.tip.rotation.y = Math.PI / 4; sw.add(P.tip);
  sw.add(at(mk(G.box(0.24, 0.05, 0.06), 0x6b4220, 0.012), 0, 0.09, 0));
  sw.add(at(mk(G.cyl(0.03, 0.03, 0.16, 6), 0x5a3418, 0.01), 0, 0, 0));
  P.swordGlow = new THREE.Mesh(G.box(0.16, 0.8, 0.08), new THREE.MeshBasicMaterial({ color: 0xbfefff, transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending })); P.swordGlow.position.y = 0.5; sw.add(P.swordGlow);
  sw.visible = false;
  // shield
  const sh = new THREE.Group(); sh.position.set(-0.08, 0.04, 0.02); sh.rotation.y = -Math.PI / 2; P.handL.add(sh); P.shield = sh;
  const sm = mk(G.cyl(0.24, 0.24, 0.05, 14), 0x3a6ad0, 0.015); sm.rotation.x = Math.PI / 2; sh.add(sm);
  const sr = mk(G.cyl(0.11, 0.11, 0.06, 3), 0xffd84a, 0); sr.rotation.x = Math.PI / 2; sr.position.z = 0.01; sh.add(sr);
  sh.visible = false;
  // baton
  const bt = new THREE.Group(); bt.rotation.x = Math.PI / 2; P.handR.add(bt); P.baton = bt;
  bt.add(at(mk(G.cyl(0.02, 0.012, 0.6, 6), 0xfff4d0, 0.01), 0, 0.3, 0));
  bt.add(at(mk(G.sph(0.045, 8, 6), 0xffd84a, 0.01), 0, 0.02, 0)); bt.visible = false;
  // leaf (glider)
  const lf = new THREE.Group(); lf.position.set(-0.1, 0.0, 0); P.handR.add(lf); P.leaf = lf;
  const lm = mk(G.sph(1, 14, 8), 0x5ccc44, 0.02); lm.scale.set(0.95, 0.06, 0.75); lm.position.y = -0.95; lf.add(lm);
  lf.add(at(mk(G.cyl(0.02, 0.025, 0.95, 5), 0x6a8a2a, 0.01), 0, -0.48, 0)); lf.visible = false;
  // head
  const head = new THREE.Group(); head.position.y = 0.5; body.add(head); P.head = head;
  const hs = mk(G.sph(0.42, 20, 16), SKIN, 0.025); hs.position.y = 0.38; hs.scale.set(1.04, 0.96, 0.98); head.add(hs); P.headS = hs;
  const hcap = mk(new THREE.SphereGeometry(0.445, 20, 14, 0, TAU, 0, 1.75), hair, 0.025); hcap.position.y = 0.4; hcap.rotation.x = -0.62; head.add(hcap); P.hair = hcap;
  for (let i = -2; i <= 2; i++) { const b = mk(G.sph(0.11, 8, 6), hair, 0.012); b.scale.set(1.1, 0.7, 0.6); b.position.set(i * 0.1, 0.62 - Math.abs(i) * 0.03, 0.34 - Math.abs(i) * 0.04); head.add(b); }
  P.tails = [];
  for (const s of [-1, 1]) {
    const tg = new THREE.Group(); tg.position.set(s * 0.4, 0.42, -0.12); head.add(tg);
    tg.add(at(mk(G.sph(0.07, 8, 6), 0xff6aa0, 0.01), 0, 0, 0));
    const t = mk(G.sph(0.14, 10, 8), hair, 0.015); t.scale.set(0.9, 1.5, 0.9); t.position.set(s * 0.1, -0.16, 0); tg.add(t);
    P.tails.push(tg);
  }
  P.eyes = addEyes(hs, 0.42, { size: 0.21, sep: 0.33, y: -0.01 });
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.055, 10, Math.PI, Math.PI), BM(0xc0303a)); mouth.position.set(0, -0.17, 0.405); hs.add(mouth); P.mouth = mouth;
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.CircleGeometry(0.06, 10), BM(0xffa0a8)); c.position.set(s * 0.25, -0.11, 0.34); c.rotation.y = s * 0.62; hs.add(c); }
  hs.add(at(new THREE.Mesh(G.sph(0.035, 6, 4), TM(0xf6c0a0)), 0, -0.06, 0.42));
  // hero cap
  const cap = new THREE.Group(); cap.position.set(0, 0.62, -0.02); head.add(cap); P.cap = cap;
  const c1 = mk(G.cyl(0.33, 0.445, 0.24, 16), 0x3fae3a, 0.025); c1.rotation.x = -0.45; c1.position.set(0, 0.0, -0.04); cap.add(c1); P.capA = c1;
  const c2g = new THREE.Group(); c2g.position.set(0, 0.06, -0.16); c2g.rotation.x = -2.0; cap.add(c2g); P.capTip = c2g;
  const c2 = mk(G.cone(0.32, 0.95, 14), 0x3fae3a, 0.025); c2.position.y = 0.42; c2g.add(c2); P.capB = c2;
  cap.visible = false;
  P.shadow = blobShadow(1.0);
  P.tw = 0;
  return P;
}
function setOutfit(P, kind) {
  const col = kind === 'pajama' ? 0xffa6c8 : kind === 'pink' ? 0xff6aa8 : 0x3fae3a;
  for (const k of ['tunic', 'slvL', 'slvR', 'capA', 'capB']) setCol(P[k], col);
  P.cap.visible = kind !== 'pajama';
  P.belt.visible = kind !== 'pajama';
}
// pose animation
function animFutan(P, s, dt) {
  P.tw += dt;
  const t = P.tw, ph = s.phase || 0, mv = s.move || 0;
  let lL = 0, lR = 0, aL = 0, aR = 0, aRz = 0, aLz = 0, bodyX = 0, bodyY = 0, headX = 0, bob = 0;
  if (s.sit) { lL = lR = -1.4; aL = aR = -0.3; bob = -0.25; }
  else if (s.swim) { lL = Math.sin(t * 8) * 0.5 - 0.3; lR = -Math.sin(t * 8) * 0.5 - 0.3; aL = -2.6 + Math.sin(t * 4) * 0.8; aR = -2.6 - Math.sin(t * 4) * 0.8; bodyX = 0.9; headX = -0.6; }
  else if (s.glide) { lL = 0.3 + Math.sin(t * 6) * 0.2; lR = 0.1 - Math.sin(t * 6) * 0.2; aL = aR = -2.9; bodyX = 0.15; }
  else if (s.air) { lL = -0.6; lR = 0.3; aL = -1.6; aR = -1.2; aLz = 0.5; aRz = -0.5; }
  else {
    const sw = Math.sin(ph) * 0.75 * mv; lL = sw; lR = -sw; aL = -sw * 0.8; aR = sw * 0.8; bob = Math.abs(Math.cos(ph)) * 0.06 * mv; bodyX = 0.12 * mv;
    if (mv < 0.05) { aLz = 0.1 + Math.sin(t * 2) * 0.03; aRz = -0.1 - Math.sin(t * 2) * 0.03; bob = Math.sin(t * 2.2) * 0.012; }
  }
  if (s.attack != null) {
    const k = s.attack, ty = s.atkType || 0;
    if (ty === 0) { aR = lerp(-2.6, 0.6, smooth(0, 0.6, k)); aRz = lerp(-0.9, 0.5, smooth(0, 0.6, k)); }
    else if (ty === 1) { aR = -1.5; aRz = lerp(1.3, -1.6, smooth(0, 0.6, k)); }
    else { aR = lerp(-2.9, -0.3, smooth(0, 0.5, k)); aRz = 0; bodyX = 0.3 * smooth(0, 0.4, k); }
    lL = 0.4; lR = -0.3;
  }
  if (s.charge) { aR = -0.9; aRz = 0.9; aL = -0.5; bodyX = 0.15; }
  if (s.spin != null) { aR = -1.57; aRz = -1.2; aL = -0.4; }
  if (s.hold) { aL = aR = -3.0; aLz = 0.35; aRz = -0.35; lL = lR = 0; bob = 0; }
  if (s.conduct) { aR = -1.8 + Math.sin(t * 6) * 0.6; aRz = -0.4 + Math.cos(t * 6) * 0.5; aL = -0.3; }
  if (s.push) { aL = aR = -1.5; bodyX = 0.35; }
  if (s.hurt) { bodyX = -0.4; aL = aR = -1.0; }
  const k = 1 - Math.exp(-18 * dt);
  P.legL.rotation.x = lerp(P.legL.rotation.x, lL, k); P.legR.rotation.x = lerp(P.legR.rotation.x, lR, k);
  P.armL.rotation.x = lerp(P.armL.rotation.x, aL, k); P.armR.rotation.x = lerp(P.armR.rotation.x, aR, k);
  P.armL.rotation.z = lerp(P.armL.rotation.z, aLz, k); P.armR.rotation.z = lerp(P.armR.rotation.z, aRz, k);
  P.body.rotation.x = lerp(P.body.rotation.x, bodyX, k);
  P.head.rotation.x = lerp(P.head.rotation.x, headX + (s.lookUp || 0), k);
  P.body.position.y = 0.48 + bob;
  P.capTip.rotation.x = -2.0 + Math.sin(t * 3) * 0.06 - mv * 0.25 - (s.glide ? 0.4 : 0);
  P.capTip.rotation.z = Math.sin(t * 2.3) * 0.08;
  for (const tl of P.tails) tl.rotation.z = Math.sin(t * 4 + tl.position.x * 5) * 0.12 * (0.4 + mv);
  blinkEyes(P.eyes, t);
  P.mouth.scale.y = s.talk ? (0.6 + Math.abs(Math.sin(t * 16)) * 1.2) : 1;
}

// ---------------------------------------------------------------- generic villager
function makeVillager(o = {}) {
  const g = new THREE.Group(), P = { g, o, tw: Math.random() * 5 };
  const sc = o.scale || 1, skin = o.skin || SKIN;
  const body = new THREE.Group(); g.add(body); P.body = body; g.scale.setScalar(sc);
  // robe/dress
  const robe = mk(G.cyl(o.robeTop || 0.25, o.robeBot || 0.42, o.robeH || 0.9, 12), o.robe || 0x8a5ac8, 0.025); robe.position.y = (o.robeH || 0.9) / 2; body.add(robe);
  if (o.apron) body.add(at(mk(G.cyl(0.3, 0.44, 0.6, 12, 1), 0xffffff, 0.02), 0, 0.35, 0.03));
  if (o.belly) { const b = mk(G.sph(0.42, 12, 10), o.robe, 0.025); b.position.set(0, 0.6, 0.06); body.add(b); }
  const top = (o.robeH || 0.9);
  for (const s of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(s * (o.robeTop || 0.25) * 1.05, top - 0.08, 0);
    arm.add(at(mk(G.sph(0.1, 8, 6), o.sleeve || o.robe || 0x8a5ac8, 0.02), 0, 0, 0));
    const a = mk(G.cyl(0.065, 0.06, 0.34, 8), o.sleeve || o.robe || 0x8a5ac8, 0.018); a.position.y = -0.18; arm.add(a);
    arm.add(at(mk(G.sph(0.075, 8, 6), skin, 0.018), 0, -0.37, 0));
    arm.rotation.z = s * 0.25; body.add(arm); P[s < 0 ? 'armL' : 'armR'] = arm;
  }
  const head = new THREE.Group(); head.position.y = top + 0.05; body.add(head); P.head = head;
  const hr = o.headR || 0.36;
  const hs = mk(G.sph(hr, 18, 14), skin, 0.025); hs.position.y = hr * 0.9; head.add(hs);
  P.eyes = addEyes(hs, hr, { size: o.eyeSize || 0.16, sep: 0.34, y: 0.0 });
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.045, 10, Math.PI, Math.PI), BM(0x8a2a2a)); mouth.position.set(0, -hr * 0.42, hr * 0.94); hs.add(mouth); P.mouth = mouth;
  hs.add(at(new THREE.Mesh(G.sph(hr * 0.12, 8, 6), TM(o.nose || 0xf0b898)), 0, -hr * 0.12, hr * 0.98));
  const hc = o.hair || 0x9a9a9a;
  if (o.style === 'bun') {
    const h = mk(new THREE.SphereGeometry(hr * 1.05, 16, 10, 0, TAU, 0, 1.4), hc, 0.02); h.position.y = hr * 0.92; h.rotation.x = -0.5; head.add(h);
    head.add(at(mk(G.sph(hr * 0.42, 10, 8), hc, 0.02), 0, hr * 1.8, -hr * 0.45));
  } else if (o.style === 'bald') {
    for (const s of [-1, 1]) head.add(at(mk(G.sph(hr * 0.3, 8, 6), hc, 0.02), s * hr * 0.85, hr * 0.85, -hr * 0.2));
  } else if (o.style === 'tuft') {
    const t = mk(G.cone(hr * 0.2, hr * 0.5, 6), hc, 0.015); t.position.set(0, hr * 1.9, 0.05); t.rotation.x = 0.4; head.add(t);
  } else if (o.style === 'short') {
    const h = mk(new THREE.SphereGeometry(hr * 1.06, 16, 10, 0, TAU, 0, 1.5), hc, 0.02); h.position.y = hr * 0.92; h.rotation.x = -0.55; head.add(h);
  }
  if (o.beard) { const b = mk(G.cone(hr * 0.75, hr * 1.6, 10), 0xf4f4f4, 0.02); b.rotation.x = Math.PI; b.position.set(0, hr * 0.05, hr * 0.55); head.add(b); }
  if (o.mustache) for (const s of [-1, 1]) { const m = mk(G.sph(hr * 0.22, 8, 6), o.mustache, 0.015); m.scale.set(1.6, 0.6, 0.7); m.position.set(s * hr * 0.25, hr * 0.62, hr * 0.92); m.rotation.z = s * 0.35; head.add(m); }
  if (o.hat) { head.add(at(mk(G.cyl(hr * 0.9, hr * 1.0, hr * 0.5, 14), o.hat, 0.02), 0, hr * 1.65, 0)); head.add(at(mk(G.cyl(hr * 1.3, hr * 1.3, 0.05, 14), o.hat, 0.02), 0, hr * 1.42, 0.05)); }
  if (o.glasses) for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 14), BM(0x3a2a1a)); r.position.set(s * hr * 0.33, hr * 0.92, hr * 0.92); head.add(r); }
  if (o.cane) { const c = mk(G.cyl(0.03, 0.03, 1.0, 6), 0x8a5a34, 0.012); c.position.y = -0.5; P.armR.add(c); P.armR.rotation.x = -0.4; }
  if (o.hunch) body.rotation.x = 0.22;
  P.shadow = blobShadow(0.9 * sc);
  return P;
}
function animVillager(P, dt, talking) {
  P.tw += dt; const t = P.tw;
  P.body.position.y = Math.sin(t * 2) * 0.015;
  P.head.rotation.z = Math.sin(t * 0.9) * 0.05;
  if (talking) { P.head.rotation.x = Math.sin(t * 7) * 0.06; P.mouth.scale.y = 0.6 + Math.abs(Math.sin(t * 15)) * 1.3; }
  else P.mouth.scale.y = 1;
  blinkEyes(P.eyes, t, 1.3);
}
function makeRicky() {
  const P = makeVillager({ scale: 0.62, robe: 0x7ac0ff, robeTop: 0.3, robeBot: 0.36, robeH: 0.6, headR: 0.42, style: 'tuft', hair: 0x6a3a22, eyeSize: 0.2 });
  // pacifier-ish bib
  P.head.add(at(mk(G.sph(0.06, 8, 6), 0xffd84a, 0.01), 0, 0.2, 0.42));
  return P;
}

// ---------------------------------------------------------------- the talking boat
function makeBoat() {
  const g = new THREE.Group(), P = { g };
  const hull = mk(new THREE.SphereGeometry(1, 18, 10, 0, TAU, Math.PI / 2, Math.PI / 2), 0xd8382a, 0.05);
  hull.scale.set(1.35, 0.9, 2.7); hull.position.y = 0.55; g.add(hull);
  const deck = new THREE.Mesh(new THREE.CircleGeometry(1, 20), TM(0xb07a44)); deck.rotation.x = -Math.PI / 2; deck.scale.set(1.25, 2.55, 1); deck.position.y = 0.42; g.add(deck);
  const rim = mk(new THREE.TorusGeometry(1, 0.09, 6, 28), 0x9a2018, 0.02); rim.rotation.x = Math.PI / 2; rim.scale.set(1.33, 2.68, 1); rim.position.y = 0.56; g.add(rim);
  g.add(at(mk(G.box(1.8, 0.16, 0.45), 0x8a5a34, 0.02), 0, 0.72, -0.9));
  // stripe
  const st = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 4, 28), BM(0xffd84a)); st.rotation.x = Math.PI / 2; st.scale.set(1.3, 2.62, 1); st.position.y = 0.35; g.add(st);
  // mast + sail
  const mast = new THREE.Group(); mast.position.set(0, 0.5, 0.2); g.add(mast); P.mast = mast;
  mast.add(at(mk(G.cyl(0.07, 0.09, 4.4, 8), 0x8a5a34, 0.02), 0, 2.2, 0));
  ad(mast, at(mk(G.cyl(0.05, 0.05, 2.8, 6), 0x8a5a34, 0.02), 0, 4.0, 0)).rotation.z = Math.PI / 2;
  const sc = document.createElement('canvas'); sc.width = sc.height = 128; const x = sc.getContext('2d');
  x.fillStyle = '#fffaf0'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#2a7ad8'; x.lineWidth = 9; x.lineCap = 'round';
  x.beginPath(); x.moveTo(20, 70); x.bezierCurveTo(50, 70, 80, 70, 88, 52); x.arc(74, 52, 14, 0, Math.PI * 1.6, true); x.stroke();
  x.beginPath(); x.moveTo(26, 92); x.lineTo(100, 92); x.stroke(); x.fillStyle = '#e2463a'; x.fillRect(0, 0, 128, 10); x.fillRect(0, 118, 128, 10);
  const sailGeo = new THREE.PlaneGeometry(2.7, 3.0, 6, 6);
  P.sailBase = sailGeo.attributes.position.array.slice();
  const sail = new THREE.Mesh(sailGeo, new THREE.MeshToonMaterial({ map: new THREE.CanvasTexture(sc), gradientMap: gradTex, side: THREE.DoubleSide }));
  sail.position.set(0, 2.5, 0.05); mast.add(sail); P.sail = sail;
  // lion figurehead
  const lion = new THREE.Group(); lion.position.set(0, 1.0, 2.55); g.add(lion); P.lion = lion;
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; const c = mk(G.cone(0.2, 0.55, 6), 0xf0f0f0, 0.02); c.position.set(Math.cos(a) * 0.4, Math.sin(a) * 0.4 + 0.1, -0.05); c.rotation.z = a - Math.PI / 2; lion.add(c); }
  const lh = mk(G.sph(0.42, 16, 12), 0xd8382a, 0.03); lh.position.set(0, 0.1, 0.05); lion.add(lh);
  P.leyes = addEyes(lh, 0.42, { size: 0.16, sep: 0.42, y: 0.08, col: 0x1a1020 });
  const sn = mk(G.sph(0.2, 10, 8), 0xf6ecd8, 0.015); sn.scale.set(1.2, 0.8, 0.9); sn.position.set(0, -0.08, 0.36); lh.add(sn);
  lh.add(at(new THREE.Mesh(G.sph(0.07, 6, 4), TM(0x2a1a1a)), 0, -0.02, 0.52));
  const jaw = mk(G.sph(0.14, 8, 6), 0xf6ecd8, 0.015); jaw.scale.set(1.1, 0.5, 0.8); jaw.position.set(0, -0.25, 0.3); lh.add(jaw); P.jaw = jaw;
  for (const s of [-1, 1]) lh.add(at(mk(G.sph(0.11, 8, 6), 0xd8382a, 0.015), s * 0.32, 0.36, 0));
  P.wake = [];
  P.tw = 0;
  return P;
}
function animBoat(P, dt, sailK, talk) {
  P.tw += dt; const t = P.tw;
  P.sail.visible = sailK > 0.02;
  P.sail.scale.y = Math.max(0.02, sailK);
  P.sail.position.y = 4 - 1.5 * sailK;
  const a = P.sail.geometry.attributes.position, b = P.sailBase;
  for (let i = 0; i < a.count; i++) { const x = b[i * 3], y = b[i * 3 + 1]; a.array[i * 3 + 2] = (1 - (x / 1.35) ** 2) * (0.55 + 0.1 * Math.sin(t * 6 + y)) * sailK * (1 - ((y + 1.5) / 3 - 0.5) ** 2 * 0.8); }
  a.needsUpdate = true;
  P.jaw.position.y = talk ? -0.25 - Math.abs(Math.sin(t * 14)) * 0.08 : -0.25;
  blinkEyes(P.leyes, t, 2);
}

// ---------------------------------------------------------------- the big bird ガルガ
function makeBird() {
  const g = new THREE.Group(), P = { g };
  const body = mk(G.sph(1, 16, 12), 0x4a3a5a, 0.08); body.scale.set(2.0, 1.9, 3.0); g.add(body);
  const chest = mk(G.sph(1, 14, 10), 0x8a7a9a, 0.06); chest.scale.set(1.6, 1.5, 1.5); chest.position.set(0, -0.3, 1.6); g.add(chest);
  const head = new THREE.Group(); head.position.set(0, 1.6, 3.0); g.add(head); P.head = head;
  head.add(at(mk(G.sph(1.3, 14, 10), 0x4a3a5a, 0.07), 0, 0, 0));
  const helm = mk(new THREE.SphereGeometry(1.42, 14, 10, 0, TAU, 0, 1.4), 0x9a9aa8, 0.06); helm.rotation.x = 0.3; head.add(helm);
  for (let i = 0; i < 3; i++) { const s = mk(G.cone(0.25, 1.1, 6), 0xc8c8d0, 0.03); s.position.set(0, 1.25, -0.4 + i * 0.6); s.rotation.x = -0.4; head.add(s); }
  const beak = mk(G.cone(0.6, 2.4, 10), 0xf0b020, 0.05); beak.rotation.x = Math.PI / 2; beak.position.set(0, -0.3, 1.8); head.add(beak);
  const hook = mk(G.cone(0.25, 0.7, 8), 0xd88a10, 0.03); hook.rotation.x = Math.PI; hook.position.set(0, -0.6, 2.9); head.add(hook);
  P.eyes = [];
  for (const s of [-1, 1]) { const e = new THREE.Mesh(G.sph(0.32, 10, 8), BM(0xffe04a)); e.position.set(s * 0.85, 0.2, 0.85); head.add(e); const p = new THREE.Mesh(G.sph(0.15, 8, 6), BM(0xd02020)); p.position.set(s * 1.0, 0.2, 1.0); head.add(p); P.eyes.push(e); }
  P.wings = [];
  for (const s of [-1, 1]) {
    const w = new THREE.Group(); w.position.set(s * 1.6, 0.8, 0.3); g.add(w);
    const wa = mk(G.box(4, 0.3, 2.4), 0x3a2a4a, 0.06); wa.position.x = s * 2; w.add(wa);
    const w2 = new THREE.Group(); w2.position.x = s * 4; w.add(w2);
    for (let i = 0; i < 4; i++) { const f = mk(G.box(3.4, 0.2, 0.75), i % 2 ? 0x4a3a5a : 0x2a1a3a, 0.04); f.position.set(s * 1.6, 0, 0.9 - i * 0.7); f.rotation.y = s * (0.1 + i * 0.12); w2.add(f); }
    P.wings.push({ w, w2, s });
  }
  for (let i = 0; i < 5; i++) { const f = mk(G.box(0.6, 0.15, 3), i % 2 ? 0x4a3a5a : 0x6a5a7a, 0.04); f.position.set((i - 2) * 0.5, 0.3, -3.8); f.rotation.y = (i - 2) * 0.25; g.add(f); }
  P.legs = [];
  for (const s of [-1, 1]) {
    const l = new THREE.Group(); l.position.set(s * 0.9, -1.4, 0.4); g.add(l);
    l.add(at(mk(G.cyl(0.18, 0.15, 1.8, 6), 0xf0b020, 0.03), 0, -0.9, 0));
    for (let i = -1; i <= 1; i++) { const c = mk(G.cone(0.12, 0.8, 5), 0xf0b020, 0.02); c.rotation.x = 1.6; c.position.set(i * 0.25, -1.8, 0.4); l.add(c); }
    P.legs.push(l);
  }
  P.tw = 0;
  return P;
}
function animBird(P, dt, flap, legsDown) {
  P.tw += dt * flap; const a = Math.sin(P.tw * 6);
  for (const w of P.wings) { w.w.rotation.z = w.s * a * 0.6; w.w2.rotation.z = w.s * a * 0.35; }
  for (const l of P.legs) l.rotation.x = legsDown ? 0 : 0.9;
}

// ---------------------------------------------------------------- enemies
function makeChu(col = 0x5ad04a) {
  const g = new THREE.Group(), P = { g };
  const b = mk(G.sph(0.75, 16, 12), col, 0.04, new THREE.MeshToonMaterial({ color: col, gradientMap: gradTex, transparent: true, opacity: 0.92 }));
  b.position.y = 0.6; g.add(b); P.b = b;
  P.eyes = addEyes(b, 0.75, { size: 0.24, sep: 0.3, y: 0.15 });
  const m = new THREE.Mesh(new THREE.CircleGeometry(0.12, 10, Math.PI, Math.PI), BM(0x1a1020)); m.position.set(0, -0.12, 0.74); b.add(m);
  b.add(at(new THREE.Mesh(G.sph(0.12, 8, 6), BM(0xffffff)), -0.35, 0.45, 0.45));
  P.shadow = blobShadow(1.4); return P;
}
function makeBoko() {
  const g = new THREE.Group(), P = { g };
  const body = new THREE.Group(); g.add(body); P.body = body;
  for (const s of [-1, 1]) { const l = limb(0.4, 0.09, 0xe86a3a); l.position.set(s * 0.18, 0.4, 0); body.add(l); P[s < 0 ? 'legL' : 'legR'] = l; }
  body.add(at(mk(G.sph(0.42, 12, 10), 0xe86a3a, 0.03), 0, 0.72, 0));
  body.add(at(mk(G.cyl(0.4, 0.46, 0.25, 10), 0x6a4a2a, 0.02), 0, 0.5, 0));
  const head = new THREE.Group(); head.position.set(0, 1.25, 0.05); body.add(head); P.head = head;
  const hs = mk(G.sph(0.45, 14, 10), 0xf07a44, 0.03); head.add(hs);
  for (const s of [-1, 1]) { const e = mk(G.cone(0.14, 0.6, 6), 0xf07a44, 0.02); e.position.set(s * 0.5, 0.1, -0.05); e.rotation.z = -s * 1.2; head.add(e); }
  P.eyes = addEyes(hs, 0.45, { size: 0.17, sep: 0.4, y: 0.1, col: 0x2a0a0a });
  const n = mk(G.sph(0.17, 10, 8), 0xff9ab0, 0.02); n.position.set(0, -0.08, 0.46); n.scale.set(1.3, 1, 1); head.add(n);
  head.add(at(mk(G.sph(0.08, 6, 4), 0xffffff, 0.01), -0.12, -0.3, 0.38)); head.add(at(mk(G.sph(0.08, 6, 4), 0xffffff, 0.01), 0.12, -0.3, 0.38));
  const arm = new THREE.Group(); arm.position.set(0.42, 0.85, 0); body.add(arm); P.arm = arm;
  arm.add(at(mk(G.cyl(0.07, 0.06, 0.4, 6), 0xe86a3a, 0.02), 0, -0.2, 0));
  const club = mk(G.cyl(0.13, 0.06, 1.0, 7), 0x9a6a3a, 0.02); club.rotation.x = Math.PI / 2; club.position.set(0, -0.4, 0.45); arm.add(club);
  const armL = new THREE.Group(); armL.position.set(-0.42, 0.85, 0); armL.add(at(mk(G.cyl(0.07, 0.06, 0.4, 6), 0xe86a3a, 0.02), 0, -0.2, 0)); armL.rotation.z = -0.3; body.add(armL);
  P.shadow = blobShadow(1.1); return P;
}
function makeMoblin() {
  const g = new THREE.Group(), P = { g };
  const body = new THREE.Group(); g.add(body); P.body = body;
  for (const s of [-1, 1]) { const l = limb(0.8, 0.22, 0x5a6a8a, 0.03); l.position.set(s * 0.45, 0.8, 0); body.add(l); P[s < 0 ? 'legL' : 'legR'] = l; }
  const bb = mk(G.sph(1, 14, 10), 0x6a7a9a, 0.05); bb.scale.set(1.1, 1.0, 0.95); bb.position.y = 1.6; body.add(bb);
  ad(body, at(mk(G.sph(0.8, 12, 8), 0xd8c8b0, 0.04), 0, 1.45, 0.4)).scale.set(1, 0.9, 0.6);
  const head = new THREE.Group(); head.position.set(0, 2.6, 0.3); body.add(head); P.head = head;
  const hs = mk(G.sph(0.7, 14, 10), 0x7a8aaa, 0.04); head.add(hs);
  P.eyes = addEyes(hs, 0.7, { size: 0.2, sep: 0.35, y: 0.2, col: 0x8a0a0a });
  const sn = mk(G.cyl(0.3, 0.34, 0.35, 12), 0xffa0b0, 0.03); sn.rotation.x = Math.PI / 2; sn.position.set(0, -0.1, 0.72); head.add(sn);
  for (const s of [-1, 1]) { sn.add(at(new THREE.Mesh(G.sph(0.07, 6, 4), BM(0x5a1a2a)), s * 0.1, 0.18, 0)); const e = mk(G.cone(0.25, 0.6, 6), 0x7a8aaa, 0.03); e.position.set(s * 0.55, 0.55, -0.1); e.rotation.z = -s * 0.5; head.add(e); }
  const arm = new THREE.Group(); arm.position.set(1.0, 2.1, 0); body.add(arm); P.arm = arm;
  arm.add(at(mk(G.cyl(0.16, 0.14, 0.9, 8), 0x6a7a9a, 0.03), 0, -0.45, 0));
  const spear = new THREE.Group(); spear.position.set(0, -0.9, 0); arm.add(spear);
  const sh = mk(G.cyl(0.06, 0.06, 4, 6), 0x8a5a34, 0.02); sh.rotation.x = Math.PI / 2; sh.position.z = 0.8; spear.add(sh);
  const tp = mk(G.cone(0.18, 0.6, 6), 0xc8c8d0, 0.02); tp.rotation.x = Math.PI / 2; tp.position.z = 3.0; spear.add(tp);
  P.shadow = blobShadow(2.2); return P;
}
function makeOcto() {
  const g = new THREE.Group(), P = { g };
  const h = mk(G.sph(1.1, 16, 12), 0x9a5ac8, 0.05); h.scale.set(1, 1.2, 1); h.position.y = 0.6; g.add(h); P.h = h;
  P.eyes = addEyes(h, 1.1, { size: 0.32, sep: 0.45, y: 0.25 });
  const sn = mk(G.cyl(0.32, 0.4, 0.7, 12), 0xb07ae0, 0.03); sn.rotation.x = Math.PI / 2; sn.position.set(0, -0.15, 1.2); h.add(sn);
  ad(sn, at(new THREE.Mesh(G.cyl(0.22, 0.22, 0.05, 12), BM(0x2a0a3a)), 0, 0.36, 0)).rotation.x = 0;
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; const t = mk(G.cone(0.25, 1.2, 6), 0x8a4ab8, 0.03); t.position.set(Math.cos(a) * 0.7, -0.4, Math.sin(a) * 0.7); t.rotation.set(Math.sin(a) * 0.6 + Math.PI, 0, -Math.cos(a) * 0.6); g.add(t); }
  return P;
}
function makeGull() {
  const g = new THREE.Group(), P = { g };
  const b = mk(G.sph(0.35, 10, 8), 0xffffff, 0.02); b.scale.set(0.8, 0.8, 1.6); g.add(b);
  g.add(at(mk(G.sph(0.22, 8, 6), 0xffffff, 0.02), 0, 0.15, 0.5));
  const bk = mk(G.cone(0.07, 0.3, 5), 0xffc020, 0.01); bk.rotation.x = Math.PI / 2; bk.position.set(0, 0.12, 0.8); g.add(bk);
  P.w = [];
  for (const s of [-1, 1]) { const w = new THREE.Group(); w.position.set(s * 0.2, 0.1, 0); const m = mk(G.box(1.2, 0.05, 0.4), 0xd8dce8, 0.015); m.position.x = s * 0.6; w.add(m); g.add(w); P.w.push({ w, s }); }
  return P;
}
// ---------------------------------------------------------------- big friends
function makeDragon() {
  const g = new THREE.Group(), P = { g };
  const red = 0xe2463a, belly = 0xffe0a0;
  // coiled body
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU * 0.9; const r = 3.2; const s = mk(G.sph(1.5 - i * 0.07, 14, 10), i % 2 ? red : 0xd03a30, 0.06); s.position.set(Math.cos(a) * r, 1.3 + i * 0.12, Math.sin(a) * r); g.add(s); }
  const neck = new THREE.Group(); neck.position.set(3.2, 2, 0); g.add(neck); P.neck = neck;
  for (let i = 0; i < 4; i++) neck.add(at(mk(G.sph(1.1 - i * 0.05, 12, 10), red, 0.05), 0, 1 + i * 1.1, 0.3 * i));
  const head = new THREE.Group(); head.position.set(0, 5.6, 1.4); neck.add(head); P.head = head;
  const hs = mk(G.sph(1.4, 16, 12), red, 0.06); hs.scale.set(1, 0.9, 1.1); head.add(hs);
  const sn = mk(G.sph(1, 14, 10), red, 0.05); sn.scale.set(0.9, 0.6, 1.1); sn.position.set(0, -0.3, 1.4); head.add(sn);
  for (const s of [-1, 1]) { sn.add(at(new THREE.Mesh(G.sph(0.12, 6, 4), BM(0x3a0a0a)), s * 0.35, 0.3, 0.9)); const hn = mk(G.cone(0.25, 1.4, 8), 0xffd84a, 0.04); hn.position.set(s * 0.7, 1.3, -0.4); hn.rotation.set(-0.6, 0, -s * 0.3); head.add(hn); }
  P.eyes = addEyes(hs, 1.4, { size: 0.45, sep: 0.45, y: 0.25 });
  ad(head, at(mk(G.sph(0.6, 10, 8), belly, 0.03), 0, -0.85, 1.6)).scale.set(1.2, 0.4, 1);
  for (const s of [-1, 1]) { const w = mk(G.box(0.2, 2.2, 3), 0xc83028, 0.04); w.position.set(s * 1.4, 3.5, -1); w.rotation.set(0.3, 0, s * 0.6); neck.add(w); }
  P.tw = 0; return P;
}
function makeWhale() {
  const g = new THREE.Group(), P = { g };
  const b = mk(G.sph(1, 20, 14), 0x3a6ac8, 0.12); b.scale.set(5, 3.6, 10); g.add(b);
  const be = mk(G.sph(1, 18, 12), 0xd8ecff, 0.08); be.scale.set(4.3, 2.4, 8.6); be.position.set(0, -1.3, 0.6); g.add(be);
  for (const s of [-1, 1]) { const f = mk(G.box(0.3, 1.2, 3.6), 0x2a5ab0, 0.06); f.position.set(s * 4.8, -1, 2); f.rotation.set(0.2, s * 0.4, s * 0.7); g.add(f); }
  const tail = mk(G.box(6, 0.4, 2.4), 0x2a5ab0, 0.08); tail.position.set(0, 0.8, -10.5); g.add(tail); P.tail = tail;
  const hd = new THREE.Group(); hd.position.set(0, 0.6, 7.6); g.add(hd);
  const hs = new THREE.Mesh(G.sph(1, 8, 6), BM(0x3a6ac8)); hs.visible = false; hd.add(hs);
  for (const s of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(s * 3.2, 0.6, 0); e.rotation.y = s * 0.9; hd.add(e);
    e.add(new THREE.Mesh(new THREE.CircleGeometry(0.75, 18), BM(0xffffff))); const p = new THREE.Mesh(new THREE.CircleGeometry(0.45, 16), BM(0x1a1020)); p.position.z = 0.01; e.add(p);
    const h = new THREE.Mesh(new THREE.CircleGeometry(0.15, 8), BM(0xffffff)); h.position.set(0.15, 0.2, 0.02); e.add(h);
    for (let i = 0; i < 2; i++) { const w = mk(G.cyl(0.05, 0.03, 3, 5), 0xf6e8c0, 0.01); w.position.set(s * 2.4, -0.8 - i * 0.4, 1.4); w.rotation.set(0, 0, s * (1.3 + i * 0.2)); hd.add(w); }
  }
  P.tw = 0; return P;
}
function makeKorok(col = 0x6ac84a) {
  const g = new THREE.Group(), P = { g, tw: Math.random() * 4 };
  g.add(at(mk(G.cyl(0.18, 0.24, 0.6, 8), 0x9a6a3a, 0.02), 0, 0.3, 0));
  const mask = mk(G.sph(0.42, 12, 8), col, 0.025); mask.scale.set(1, 1.2, 0.35); mask.position.set(0, 0.85, 0.05); g.add(mask);
  for (const s of [-1, 1]) mask.add(at(new THREE.Mesh(G.sph(0.1, 8, 6), BM(0x1a1020)), s * 0.15, 0.08, 0.38));
  mask.add(at(new THREE.Mesh(G.sph(0.07, 8, 6), BM(0x1a1020)), 0, -0.18, 0.38));
  const sprout = mk(G.sph(0.15, 8, 6), 0x9ae06a, 0.015); sprout.scale.set(1.6, 0.4, 0.8); sprout.position.set(0.08, 1.4, 0); g.add(sprout);
  P.shadow = blobShadow(0.6); P.mask = mask; return P;
}
