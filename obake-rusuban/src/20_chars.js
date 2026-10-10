// ================================================================ characters: simple shapes, faces are just eyes + mouth
const FACE = {};
function faceTexFor(key, expr, skin) {
  const k = key + expr;
  if (FACE[k]) return FACE[k];
  const t = cTex(128, 128, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.fillStyle = '#2a1e1a'; x.strokeStyle = '#2a1e1a'; x.lineCap = 'round'; x.lineWidth = 6;
    const eye = (cx, cy) => {
      if (expr === 'sleep' || expr === 'smile' || expr === 'happy') { x.beginPath(); x.arc(cx, cy + (expr === 'sleep' ? -4 : 4), 9, expr === 'sleep' ? 0.15 * Math.PI : 1.15 * Math.PI, expr === 'sleep' ? 0.85 * Math.PI : 1.85 * Math.PI); x.stroke(); return; }
      if (expr === 'surp' || expr === 'panic') { x.fillStyle = '#fff'; x.beginPath(); x.arc(cx, cy, 11, 0, TAU); x.fill(); x.lineWidth = 3; x.stroke(); x.fillStyle = '#2a1e1a'; x.beginPath(); x.arc(cx, cy, 5, 0, TAU); x.fill(); x.lineWidth = 6; return; }
      if (expr === 'angry') { x.beginPath(); x.ellipse(cx, cy + 2, 6, 8, 0, 0, TAU); x.fill(); x.beginPath(); x.moveTo(cx - 10, cy - 14 + (cx < 64 ? -3 : 3)); x.lineTo(cx + 10, cy - 14 + (cx < 64 ? 3 : -3)); x.stroke(); return; }
      if (expr === 'sad') { x.beginPath(); x.ellipse(cx, cy + 2, 6, 7, 0, 0, TAU); x.fill(); x.beginPath(); x.moveTo(cx - 10, cy - 12 + (cx < 64 ? 3 : -3)); x.lineTo(cx + 10, cy - 12 + (cx < 64 ? -3 : 3)); x.stroke(); return; }
      if (expr === 'sus') { x.beginPath(); x.ellipse(cx, cy + 2, 7, 4, 0, 0, TAU); x.fill(); return; }
      x.beginPath(); x.ellipse(cx, cy, 6.5, 9, 0, 0, TAU); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(cx + 2, cy - 3, 2.4, 0, TAU); x.fill(); x.fillStyle = '#2a1e1a';
    };
    eye(44, 58); eye(84, 58);
    x.lineWidth = 5;
    switch (expr) {
      case 'smile': case 'happy': x.beginPath(); x.arc(64, 78, 12, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); if (expr === 'happy') { x.fillStyle = 'rgba(240,120,120,.45)'; x.beginPath(); x.ellipse(30, 78, 9, 5, 0, 0, TAU); x.ellipse(98, 78, 9, 5, 0, 0, TAU); x.fill(); } break;
      case 'surp': x.beginPath(); x.ellipse(64, 86, 6, 8, 0, 0, TAU); x.fill(); break;
      case 'panic': x.beginPath(); x.moveTo(50, 88); for (let i = 0; i <= 6; i++) x.lineTo(50 + i * 4.7, 88 + (i % 2 ? -5 : 5)); x.stroke(); x.fillStyle = '#7ab8e8'; x.beginPath(); x.ellipse(104, 40, 5, 8, 0.3, 0, TAU); x.fill(); break;
      case 'sad': x.beginPath(); x.arc(64, 94, 10, 1.15 * Math.PI, 1.85 * Math.PI); x.stroke(); break;
      case 'angry': x.beginPath(); x.moveTo(52, 88); x.lineTo(76, 86); x.stroke(); break;
      case 'sus': x.beginPath(); x.moveTo(54, 86); x.quadraticCurveTo(64, 82, 76, 88); x.stroke(); break;
      case 'sleep': x.beginPath(); x.ellipse(64, 86, 5, 4, 0, 0, TAU); x.fill(); break;
      default: x.beginPath(); x.arc(64, 80, 8, 0.2 * Math.PI, 0.8 * Math.PI); x.stroke();
    }
  });
  return (FACE[k] = t);
}
const CHAR_DEF = {
  hiroshi: { name: 'おとうさん', short: 'とうさん', col: '#5a7ab8', pants: '#5a5a6a', skin: '#f4d4b4', hair: '#3a2e2a', h: 1.78, w: 0.66, tag: '#3a6ab0' },
  misaki: { name: 'おかあさん', short: 'かあさん', col: '#e8945a', pants: '#8a6a5a', skin: '#f6dac0', hair: '#5a3a2a', h: 1.62, w: 0.58, apron: '#f4ecd8', tag: '#d0662a' },
  akari: { name: 'あかり', short: 'あかり', col: '#3a4a7a', pants: '#3a4a7a', skin: '#f6dcc4', hair: '#2a2220', h: 1.52, w: 0.52, ribbon: '#e04a4a', tag: '#3a4a9a' },
  sota: { name: 'そうた', short: 'そうた', col: '#f4c84a', pants: '#4a7ac8', skin: '#f8e0c8', hair: '#3a2a22', h: 1.08, w: 0.48, tag: '#c89a1a' },
  fumi: { name: 'おばあちゃん', short: 'ばあちゃん', col: '#9a7ab0', pants: '#6a5a6a', skin: '#f2d6bc', hair: '#c8c4c0', h: 1.32, w: 0.56, tag: '#7a5a9a' },
  hinata: { name: 'ひなた', short: 'ひなた', col: '#e8606a', pants: '#3a4a7a', skin: '#f6d8bc', hair: '#3a2a22', h: 1.14, w: 0.5, tag: '#d04050' },
  mio: { name: 'みお', short: 'みお', col: '#7ac8a8', pants: '#7ac8a8', skin: '#f8e0c8', hair: '#6a4430', h: 1.12, w: 0.48, tag: '#3a9a7a' },
  kento: { name: 'けんと', short: 'けんと', col: '#6aa8e8', pants: '#5a5a6a', skin: '#f8dcc4', hair: '#2e2420', h: 0.98, w: 0.46, tag: '#3a7ac8' },
  monaka: { name: 'もなか', short: 'もなか', col: '#f0e0c8', spot: '#b8865a', h: 0.5, tag: '#a8783a' },
};
function buildPerson(id) {
  const d = CHAR_DEF[id]; const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
  const H = d.h, W = d.w; const legH = H * 0.24, torsoH = H * 0.36, headR = H * 0.2;
  const parts = {};
  // legs
  parts.legs = [];
  for (const s of [-1, 1]) {
    const p = new THREE.Group(); at(p, s * W * 0.2, legH, 0); body.add(p);
    const l = mesh(G.rbox(W * 0.3, legH, W * 0.32, W * 0.12), M(d.pants)); at(l, 0, -legH / 2, 0); p.add(l);
    const f = mesh(G.rbox(W * 0.32, W * 0.14, W * 0.44, W * 0.06), M('#5a4038')); at(f, 0, -legH + W * 0.06, W * 0.06); p.add(f);
    parts.legs.push(p);
  }
  // torso
  const tor = mesh(G.rbox(W, torsoH, W * 0.72, W * 0.3), M(d.col)); at(tor, 0, legH + torsoH / 2, 0); body.add(tor);
  if (d.apron) RB(body, W * 0.8, torsoH * 0.85, 0.04, d.apron, 0, legH + torsoH * 0.45, W * 0.37, 0.03);
  if (d.ribbon) { const r = mesh(G.rbox(W * 0.32, W * 0.16, 0.06, 0.04), M(d.ribbon)); at(r, 0, legH + torsoH * 0.88, W * 0.37); body.add(r); RB(body, W * 1.02, torsoH * 0.28, W * 0.74, '#f4f4f4', 0, legH + torsoH * 0.94, 0, 0.08); }
  if (id === 'akari') RB(body, W * 1.08, legH * 0.55, W * 0.8, '#3a4a7a', 0, legH * 0.85, 0, 0.1);
  // arms
  parts.arms = [];
  for (const s of [-1, 1]) {
    const p = new THREE.Group(); at(p, s * (W * 0.5 + W * 0.1), legH + torsoH * 0.88, 0); body.add(p);
    const a = mesh(G.rbox(W * 0.22, torsoH * 0.85, W * 0.24, W * 0.1), M(d.col)); at(a, 0, -torsoH * 0.4, 0); p.add(a);
    const hnd = mesh(G.sph(W * 0.13, 10, 8), M(d.skin)); at(hnd, 0, -torsoH * 0.88, 0); p.add(hnd);
    parts.arms.push(p);
  }
  parts.hand = new THREE.Group(); at(parts.hand, 0, -torsoH * 0.9, W * 0.08); parts.arms[1].add(parts.hand);
  // head
  const head = new THREE.Group(); at(head, 0, legH + torsoH + headR * 0.92, 0); body.add(head); parts.head = head;
  const hd = mesh(G.sph(headR, 20, 16), M(d.skin)); hd.scale.set(1.04, 0.96, 0.98); head.add(hd);
  parts.face = mesh(G.plane(headR * 1.5, headR * 1.5), new THREE.MeshBasicMaterial({ map: faceTexFor(id, 'n'), transparent: true, depthWrite: false }), false, false);
  at(parts.face, 0, -headR * 0.08, headR * 0.97); head.add(parts.face);
  // hair
  const hair = M(d.hair);
  if (id === 'hiroshi') { const c = mesh(G.sph(headR * 1.03, 18, 12, 0, TAU, 0, Math.PI * 0.42), hair); at(c, 0, headR * 0.06, -headR * 0.04); head.add(c); }
  if (id === 'misaki') { const c = mesh(G.sph(headR * 1.08, 18, 14, 0, TAU, 0, Math.PI * 0.55), hair); at(c, 0, 0.0, -headR * 0.06); head.add(c); for (const s of [-1, 1]) { const b = mesh(G.rbox(headR * 0.4, headR * 1.1, headR * 0.8, headR * 0.18), hair); at(b, s * headR * 0.85, -headR * 0.35, -headR * 0.1); head.add(b); } }
  if (id === 'akari') { const c = mesh(G.sph(headR * 1.06, 18, 14, 0, TAU, 0, Math.PI * 0.5), hair); at(c, 0, 0.02, -headR * 0.05); head.add(c); const t = mesh(G.sph(headR * 0.42, 12, 10), hair); t.scale.set(0.8, 1.5, 0.8); at(t, 0, -headR * 0.15, -headR * 1.15); head.add(t); const rb = mesh(G.sph(headR * 0.2, 10, 8), M('#e04a4a')); at(rb, 0, headR * 0.35, -headR * 1.0); head.add(rb); for (const s of [-1, 1]) { const b = mesh(G.rbox(headR * 0.3, headR * 0.9, headR * 0.6, headR * 0.14), hair); at(b, s * headR * 0.9, -headR * 0.3, -headR * 0.15); head.add(b); } }
  if (id === 'sota') { const c = mesh(G.sph(headR * 1.04, 18, 12, 0, TAU, 0, Math.PI * 0.45), hair); at(c, 0, 0.03, -headR * 0.04); head.add(c); const tf = mesh(G.cone(headR * 0.18, headR * 0.4, 6), hair); at(tf, headR * 0.2, headR * 1.05, 0); tf.rotation.z = -0.4; head.add(tf); }
  if (id === 'hinata') { const c = mesh(G.sph(headR * 1.08, 18, 14, 0, TAU, 0, Math.PI * 0.56), hair); at(c, 0, 0, -headR * 0.05); head.add(c); for (const s of [-1, 1]) { const b = mesh(G.rbox(headR * 0.36, headR * 0.9, headR * 0.8, headR * 0.16), hair); at(b, s * headR * 0.88, -headR * 0.3, -headR * 0.1); head.add(b); } const pin = mesh(G.rbox(headR * 0.4, headR * 0.1, headR * 0.08, 0.02), M('#f4c84a')); pin.rotation.z = 0.4; at(pin, headR * 0.5, headR * 0.6, headR * 0.65); head.add(pin); }
  if (id === 'mio') { const c = mesh(G.sph(headR * 1.06, 18, 14, 0, TAU, 0, Math.PI * 0.5), hair); at(c, 0, 0.02, -headR * 0.05); head.add(c); for (const s of [-1, 1]) { const t = mesh(G.sph(headR * 0.36, 12, 10), hair); t.scale.set(0.8, 1.5, 0.8); at(t, s * headR * 1.05, -headR * 0.3, -headR * 0.2); head.add(t); const rb = mesh(G.sph(headR * 0.14, 10, 8), M('#f4a0c0')); at(rb, s * headR * 0.92, headR * 0.15, -headR * 0.2); head.add(rb); } }
  if (id === 'kento') { const c = mesh(G.sph(headR * 1.04, 18, 12, 0, TAU, 0, Math.PI * 0.45), hair); at(c, 0, 0.03, -headR * 0.04); head.add(c); const cap = mesh(G.sph(headR * 1.08, 18, 10, 0, TAU, 0, Math.PI * 0.38), M('#e8a83a')); at(cap, 0, headR * 0.12, -headR * 0.02); head.add(cap); const br = mesh(G.rbox(headR * 1.2, headR * 0.08, headR * 0.7, 0.03), M('#e8a83a')); at(br, 0, headR * 0.5, headR * 0.75); head.add(br); }
  if (id === 'fumi') { const c = mesh(G.sph(headR * 1.05, 18, 12, 0, TAU, 0, Math.PI * 0.5), hair); at(c, 0, 0.02, -headR * 0.05); head.add(c); const bn = mesh(G.sph(headR * 0.42, 12, 10), hair); at(bn, 0, headR * 0.55, -headR * 0.8); head.add(bn); RB(body, W * 1.06, torsoH * 0.6, W * 0.78, '#b89ac8', 0, legH + torsoH * 0.62, 0, 0.12); }
  parts.headR = headR; parts.H = H;
  root.userData.parts = parts;
  return root;
}
function buildCat() {
  const d = CHAR_DEF.monaka; const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
  const parts = {};
  const b = mesh(G.sph(0.26, 16, 12), M(d.col)); b.scale.set(0.8, 0.75, 1.35); at(b, 0, 0.28, 0); body.add(b);
  const sp = mesh(G.sph(0.17, 12, 10), M(d.spot)); sp.scale.set(0.9, 0.6, 1.2); at(sp, 0.06, 0.4, -0.05); body.add(sp);
  parts.legs = [];
  for (const [x, z] of [[-0.1, 0.22], [0.1, 0.22], [-0.1, -0.2], [0.1, -0.2]]) { const p = new THREE.Group(); at(p, x, 0.2, z); body.add(p); const l = mesh(G.rbox(0.08, 0.2, 0.08, 0.035), M(d.col)); at(l, 0, -0.1, 0); p.add(l); parts.legs.push(p); }
  const head = new THREE.Group(); at(head, 0, 0.48, 0.32); body.add(head); parts.head = head;
  const hd = mesh(G.sph(0.18, 16, 12), M(d.col)); hd.scale.set(1.1, 0.95, 0.95); head.add(hd);
  const ps = mesh(G.sph(0.11, 10, 8), M(d.spot)); ps.scale.set(1, 0.6, 0.8); at(ps, 0.06, 0.09, -0.04); head.add(ps);
  for (const s of [-1, 1]) { const e = mesh(G.cone(0.07, 0.13, 4), M(d.col)); at(e, s * 0.1, 0.17, -0.02); e.rotation.z = -s * 0.25; head.add(e); const ei = mesh(G.cone(0.04, 0.08, 4), M('#f4b8b8')); at(ei, s * 0.1, 0.16, 0.01); ei.rotation.z = -s * 0.25; head.add(ei); }
  parts.face = mesh(G.plane(0.26, 0.26), new THREE.MeshBasicMaterial({ map: faceTexFor('cat', 'n'), transparent: true, depthWrite: false }), false, false); at(parts.face, 0, -0.01, 0.17); head.add(parts.face);
  const tail = new THREE.Group(); at(tail, 0, 0.32, -0.32); body.add(tail); parts.tail = tail;
  const tl = mesh(G.cyl(0.035, 0.045, 0.45, 8), M(d.spot)); tl.rotation.x = -0.9; at(tl, 0, 0.15, -0.12); tail.add(tl);
  parts.H = 0.65; parts.headR = 0.18;
  root.userData.parts = parts;
  return root;
}
function setFace(a, expr) {
  if (a.expr === expr) return; a.expr = expr;
  const p = a.mesh.userData.parts; p.face.material.map = faceTexFor(a.id === 'monaka' ? 'cat' : a.id, expr); p.face.material.needsUpdate = true;
}
// hand props
function propMesh(kind) {
  const g = new THREE.Group();
  if (kind === 'phone') { RB(g, 0.09, 0.16, 0.02, '#e8e8f0', 0, 0.05, 0, 0.015); const s = mesh(G.plane(0.075, 0.13), MB('#8ac0f0'), false, false); at(s, 0, 0.05, 0.012); g.add(s); g.userData.screen = s; }
  if (kind === 'light') { const b = mesh(G.cyl(0.035, 0.035, 0.2, 10), M('#f4c84a')); b.rotation.x = Math.PI / 2; at(b, 0, 0, 0.08); g.add(b); const h = mesh(G.cyl(0.05, 0.04, 0.06, 10), M('#e8a83a')); h.rotation.x = Math.PI / 2; at(h, 0, 0, 0.2); g.add(h); }
  if (kind === 'umb') { for (const [c, x] of [['#2a3a6a', -0.04], ['#5ab8a8', 0.05]]) { const p = mesh(G.cyl(0.05, 0.025, 0.8, 8), M(c)); at(p, x, -0.3, 0.05); g.add(p); } }
  if (kind === 'umb1') { const p = mesh(G.cyl(0.05, 0.025, 0.8, 8), M('#2a3a6a')); at(p, 0, -0.3, 0.05); g.add(p); }
  if (kind === 'umbOpen') { const c = mesh(G.cone(0.7, 0.35, 12), M('#2a3a6a')); at(c, 0, 0.9, 0); g.add(c); const p = mesh(G.cyl(0.015, 0.015, 0.9, 6), M('#6a4a2a')); at(p, 0, 0.45, 0); g.add(p); }
  if (kind === 'cup') { const c = mesh(G.cyl(0.05, 0.04, 0.09, 12), M('#e8e0d0')); at(c, 0, 0.02, 0.04); g.add(c); }
  if (kind === 'paper') { RB(g, 0.3, 0.4, 0.01, '#f0ece0', 0, 0.05, 0.08, 0.005); }
  if (kind === 'letter') { RB(g, 0.24, 0.02, 0.16, '#f4ecd0', 0, 0.02, 0.06, 0.01); }
  if (kind === 'camera') { RB(g, 0.24, 0.14, 0.1, '#2a2a30', 0, 0.02, 0.08, 0.03); }
  if (kind === 'remote') { RB(g, 0.14, 0.04, 0.32, '#3a3a40', 0, 0, 0.1, 0.02); }
  if (kind === 'tie') { RB(g, 0.08, 0.4, 0.02, '#3a5a9a', 0, -0.15, 0.05, 0.02); }
  if (kind === 'pudding') { const c = mesh(G.cyl(0.06, 0.07, 0.08, 10), M('#f4d880')); at(c, 0, 0.02, 0.05); g.add(c); const t = mesh(G.cyl(0.04, 0.06, 0.03, 10), M('#8a4a1a')); at(t, 0, 0.07, 0.05); g.add(t); }
  if (kind === 'senbei') { const c = mesh(G.rcyl(0.07, 0.02, 0.008, 12), M('#c8884a')); at(c, 0, 0, 0.05); g.add(c); }
  if (kind === 'net') { const p = mesh(G.cyl(0.02, 0.02, 0.9, 6), M('#c8a868')); p.rotation.x = Math.PI / 2.4; at(p, 0, 0.1, 0.35); g.add(p); const r = mesh(G.tor(0.18, 0.015, 6, 14), M('#e8e8e8')); at(r, 0, 0.42, 0.75); g.add(r); const n = mesh(G.cone(0.18, 0.3, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, side: THREE.DoubleSide })); n.rotation.x = Math.PI; at(n, 0, 0.27, 0.75); g.add(n); }
  if (kind === 'mikan') { const m = mesh(G.sph(0.07, 10, 8), M('#f08a20')); at(m, 0, 0, 0.06); g.add(m); }
  if (kind === 'knit') { const c = mesh(G.sph(0.08, 10, 8), M('#e86a8a')); at(c, 0, 0, 0.06); g.add(c); }
  return g;
}

// ---------------------------------------------------------------- the ghost "ぽわ"
function buildGhost() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xdfeaff, emissiveIntensity: 0.55, transparent: true, opacity: 0.78, roughness: 0.5, depthWrite: false });
  const b = mesh(G.sph(0.3, 20, 16), mat, false, false); b.scale.set(1, 0.95, 0.95); at(b, 0, 0.4, 0); g.add(b);
  for (const [x, y, z, r] of [[0.0, 0.12, -0.05, 0.22], [0.1, -0.05, -0.12, 0.14], [-0.04, -0.18, -0.2, 0.09], [0.02, -0.28, -0.26, 0.05]]) { const s = mesh(G.sph(r, 14, 10), mat, false, false); at(s, x, 0.4 + y - 0.18, z); g.add(s); }
  const ft = cTex(128, 64, (x) => { x.fillStyle = '#2a2440'; for (const cx of [40, 88]) { x.beginPath(); x.ellipse(cx, 30, 9, 13, 0, 0, TAU); x.fill(); } x.fillStyle = '#fff'; for (const cx of [43, 91]) { x.beginPath(); x.arc(cx, 25, 3.5, 0, TAU); x.fill(); } x.fillStyle = 'rgba(240,140,160,.5)'; x.beginPath(); x.ellipse(22, 44, 8, 4, 0, 0, TAU); x.ellipse(106, 44, 8, 4, 0, 0, TAU); x.fill(); });
  const f = mesh(G.plane(0.42, 0.21), new THREE.MeshBasicMaterial({ map: ft, transparent: true, depthWrite: false }), false, false); at(f, 0, 0.44, 0.29); g.add(f);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: Parts.tex, color: 0xcfe0ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); glow.scale.set(1.6, 1.6, 1.6); at(glow, 0, 0.4, 0); g.add(glow);
  g.userData.mat = mat;
  return g;
}
// eyes shown on a possessed object
const EYE_TEX = cTex(128, 64, (x) => { x.fillStyle = '#fff'; for (const cx of [38, 90]) { x.beginPath(); x.ellipse(cx, 32, 17, 22, 0, 0, TAU); x.fill(); } x.fillStyle = '#2a2440'; for (const cx of [40, 92]) { x.beginPath(); x.ellipse(cx, 34, 9, 13, 0, 0, TAU); x.fill(); } x.fillStyle = '#fff'; for (const cx of [43, 95]) { x.beginPath(); x.arc(cx, 29, 3.5, 0, TAU); x.fill(); } });
const EYE_TEX2 = cTex(128, 64, (x) => { x.fillStyle = '#fff'; for (const cx of [38, 90]) { x.beginPath(); x.ellipse(cx, 32, 17, 22, 0, 0, TAU); x.fill(); } x.fillStyle = '#2a2440'; for (const cx of [30, 82]) { x.beginPath(); x.ellipse(cx, 34, 8, 11, 0, 0, TAU); x.fill(); } x.strokeStyle = '#7ab8e8'; x.lineWidth = 4; x.beginPath(); x.moveTo(118, 8); x.quadraticCurveTo(124, 22, 116, 28); x.stroke(); });
