// ================================================================ kitchen: grid, stations, items, rules
const CH = 0.62; // counter height
const K = {
  root: new THREE.Group(), lv: null, th: null, W: 0, H: 0, cells: [], kind: [], tiles: [], players: [], orders: [], floorItems: [], flying: [], pend: [],
  score: 0, delivered: 0, failed: 0, tipSum: 0, time: 0, T: 0, phase: 'off', active: 0, easy: true, t: 0, tilt: 0, shake: 0, boss: null,
};
scene.add(K.root);
const wx = i => i - (K.W - 1) / 2, wz = j => j - (K.H - 1) / 2;
const ti = x => Math.round(x + (K.W - 1) / 2), tj = z => Math.round(z + (K.H - 1) / 2);
const inGrid = (i, j) => i >= 0 && j >= 0 && i < K.W && j < K.H;
const tileAt = (i, j) => inGrid(i, j) ? K.cells[j][i] : null;
const tileAtW = (x, z) => tileAt(ti(x), tj(z));
function walkable(i, j) { return inGrid(i, j) && !K.cells[j][i] && K.kind[j][i] === 'floor'; }

// conveyor belt texture
const beltTex = (() => {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d');
  x.fillStyle = '#34343c'; x.fillRect(0, 0, 64, 64);
  x.fillStyle = '#ffcf2e'; x.beginPath(); x.moveTo(14, 8); x.lineTo(38, 32); x.lineTo(14, 56); x.lineTo(26, 56); x.lineTo(50, 32); x.lineTo(26, 8); x.fill();
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
})();
function signTex(text, bg = '#ffcf2e', fg = '#2a1a12', w = 256, h = 72) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  x.fillStyle = bg; rr(x, 3, 3, w - 6, h - 6, 16); x.fill(); x.lineWidth = 6; x.strokeStyle = fg; x.stroke();
  x.fillStyle = fg; x.font = `800 ${h * 0.48}px "M PLUS Rounded 1c","Hiragino Maru Gothic ProN",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 2);
  return new THREE.CanvasTexture(c);
}

// ---------------------------------------------------------------- items
const newIng = id => ({ kind: 'ing', id, st: 'raw', chop: 0 });
const newPlate = () => ({ kind: 'plate', dirty: false, n: 1, items: [] });
const newPot = pt => ({ kind: 'pot', pt, items: [], cook: 0, need: 0, state: 'empty', over: 0 });
const newExt = () => ({ kind: 'ext' });
function refresh(it) {
  if (!it.obj) it.obj = new THREE.Group();
  while (it.obj.children.length) { const c = it.obj.children[0]; it.obj.remove(c); disposeTree(c); }
  const m = it.kind === 'ing' ? ingModel(it.id, it.st) : it.kind === 'plate' ? plateModel(it) : it.kind === 'pot' ? potModel(it) : extModel();
  it.obj.add(m);
  return it.obj;
}
function killItem(it) { if (it && it.obj) { it.obj.parent && it.obj.parent.remove(it.obj); disposeTree(it.obj); it.obj = null; } }
function placeOn(t, it) {
  t.top = it; if (!it.obj) refresh(it);
  t.anchor.add(it.obj); it.obj.position.set(0, 0, 0); it.obj.rotation.set(0, 0, 0);
  if (t.type === 'conv') t.cprog = 0;
}
function compKey(ing) {
  const d = ING[ing.id];
  if (d.chop && ing.st !== 'chop') return null;
  return ing.st === 'chop' ? ing.id + '_c' : ing.id;
}
let why = '';
function addToPlate(pl, key) {
  if (pl.dirty) { why = 'よごれてる！ ながしで あらってね'; return false; }
  if (!key) { why = 'さきに まないたで きってね'; return false; }
  if (key === 'rice') { why = 'おこめは なべで たいてね'; return false; }
  const nw = pl.items.concat(key);
  for (const r of K.lv.recipes) if (isSub(nw, RECIPES[r].items)) { pl.items = nw; return true; }
  why = pl.items.includes(key) ? 'もう はいってるよ' : 'その くみあわせの りょうりは ないよ';
  return false;
}
function levelUses(out) { return K.lv.recipes.some(r => RECIPES[r].items.includes(out)); }
function addToPot(pot, ing) {
  const key = ing.st === 'chop' ? ing.id + '_c' : ing.id;
  if (pot.state === 'burnt') return 'こげてる！ ゴミばこで すてよう';
  const recs = (pot.pt === 'pot' ? POT_RECIPES : PAN_RECIPES).filter(r => levelUses(r.out));
  const nw = pot.items.concat(key);
  const r = recs.find(r => isSub(nw, r.items));
  if (!r) {
    if (ING[ing.id].chop && ing.st !== 'chop') return 'さきに まないたで きってね';
    if (pot.items.length && recs.some(r => isSub(pot.items, r.items) && r.items.length === pot.items.length)) return 'もう いっぱいだよ';
    return pot.pt === 'pan' ? 'フライパンには きった おにくを いれてね' : 'その なべには いれられないよ';
  }
  pot.items = nw; pot.need = r.t * nw.length / r.items.length; pot.full = r.t;
  if (pot.state !== 'cook') { pot.state = 'cook'; }
  pot.over = 0;
  return true;
}
function resetPot(pot) { pot.items = []; pot.cook = 0; pot.need = 0; pot.state = 'empty'; pot.over = 0; }
function pour(pot, pl) {
  if (pl.dirty) { why = 'よごれた おさらだよ'; return false; }
  if (pot.state !== 'done') { why = pot.state === 'burnt' ? 'こげちゃった… ゴミばこへ' : pot.items.length ? 'まだ できてないよ' : 'からっぽだよ'; return false; }
  const out = potOut(pot.items);
  if (!addToPlate(pl, out)) return false;
  resetPot(pot); refresh(pot); refresh(pl); Sound.sfx('pour');
  return true;
}

// ---------------------------------------------------------------- tiles
const T_OF = { '#': 'counter', E: 'counter', '%': 'counter', C: 'board', S: 'stove', P: 'stove', D: 'plates', W: 'window', K: 'sink', R: 'ret', T: 'trash', '>': 'conv', '<': 'conv', '^': 'conv', v: 'conv' };
const CONV_D = { '>': [1, 0], '<': [-1, 0], '^': [0, -1], v: [0, 1] };
function makeTile(ch, i, j) {
  const t = { ch, i, j, type: T_OF[ch] || 'crate', top: null, fire: 0, prog: 0, cprog: 0, g: new THREE.Group() };
  if (t.type === 'crate') t.crate = CRATE_CH[ch];
  if (t.type === 'conv') t.dir = CONV_D[ch];
  if (t.type === 'plates') t.plates = K.lv.plates;
  if (t.type === 'sink') { t.dirty = 0; t.clean = 0; }
  if (t.type === 'ret') t.dirty = 0;
  t.mover = ch === '%';
  t.x = wx(i); t.z = wz(j); t.g.position.set(t.x, 0, t.z);
  buildTileMesh(t);
  K.root.add(t.g);
  return t;
}
function buildTileMesh(t) {
  const th = K.th, g = t.g;
  const body = (col, top) => {
    g.add(at(mesh(G.box(0.98, CH - 0.07, 0.98), col, true, true), 0, (CH - 0.07) / 2, 0));
    g.add(at(mesh(G.box(1.0, 0.08, 1.0), top, true, true), 0, CH - 0.04, 0));
  };
  switch (t.type) {
    case 'counter':
      if (t.mover) { body(0x8a5ae0, 0xffcf2e); for (const s of [-1, 1]) g.add(at(mesh(G.box(1.01, 0.06, 0.06), 0x2a1a12), 0, CH - 0.15, s * 0.47)); }
      else body(th.body, th.top);
      break;
    case 'board': {
      body(th.body, th.top);
      const b = mesh(G.box(0.72, 0.05, 0.56), 0xe8c48a, true, true); b.position.y = CH + 0.025; g.add(b);
      const k = new THREE.Group(); k.position.set(0.3, CH + 0.06, -0.2); k.rotation.y = 0.5; g.add(k);
      k.add(at(mesh(G.box(0.05, 0.02, 0.26), 0xdfe6ee), 0, 0, 0.1)); k.add(at(mesh(G.box(0.05, 0.04, 0.12), 0x8a4a2a), 0, 0, -0.08));
      t.knife = k; break;
    }
    case 'stove': {
      body(0x5a6470, 0x2e3238);
      const bm = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, emissive: 0xff4a1a, emissiveIntensity: 0, flatShading: true });
      const ring = mesh(G.tor(0.26, 0.04, 4, 14), bm); ring.rotation.x = Math.PI / 2; ring.position.y = CH + 0.01; g.add(ring); t.burnerM = bm;
      for (const s of [-1, 1]) g.add(at(mesh(G.cyl(0.05, 0.05, 0.05, 8), 0xdddddd), s * 0.25, CH - 0.18, 0.5)).rotation.x = Math.PI / 2;
      break;
    }
    case 'plates': body(th.body, th.top); t.stackG = new THREE.Group(); t.stackG.position.y = CH; g.add(t.stackG); updStack(t); break;
    case 'window': {
      body(0xff4f3a, 0xffcf2e);
      for (let k = -2; k <= 2; k++) g.add(at(mesh(G.box(0.1, CH - 0.1, 0.02), 0xffffff, false), k * 0.2, (CH - 0.1) / 2, 0.495));
      for (const s of [-1, 1]) g.add(at(mesh(G.box(0.08, 1.0, 0.08), 0x2a1a12), s * 0.46, CH + 0.5, -0.4));
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.32), new THREE.MeshBasicMaterial({ map: signTex('うけとり 🔔'), transparent: true })); sg.position.set(0, CH + 1.0, -0.38); g.add(sg);
      const bell = new THREE.Group(); bell.position.set(0.32, CH, 0.25); g.add(bell); t.bell = bell;
      bell.add(at(mesh(G.cyl(0.1, 0.1, 0.02, 10), 0x2a2a2a), 0, 0.01, 0));
      bell.add(at(mesh(new THREE.SphereGeometry(0.08, 10, 6, 0, TAU, 0, Math.PI / 2), M(0xffd84a, { metalness: 0.5, roughness: 0.3 })), 0, 0.02, 0));
      break;
    }
    case 'sink': {
      body(th.body, th.top);
      g.add(at(mesh(G.box(0.6, 0.04, 0.6), 0x3a8ad0, false, true), -0.08, CH + 0.005, 0.02));
      const fa = mesh(G.cyl(0.03, 0.03, 0.3, 6), 0xb8c2cc); fa.position.set(-0.08, CH + 0.15, -0.38); g.add(fa);
      const fb = mesh(G.cyl(0.03, 0.03, 0.2, 6), 0xb8c2cc); fb.rotation.x = Math.PI / 2; fb.position.set(-0.08, CH + 0.3, -0.29); g.add(fb);
      const rack = new THREE.Group(); rack.position.set(0.36, CH, 0); g.add(rack);
      for (let k = 0; k < 4; k++) rack.add(at(mesh(G.box(0.02, 0.18, 0.5), 0xb8c2cc, false), -0.06 + k * 0.04, 0.09, 0));
      t.dirtyG = new THREE.Group(); t.dirtyG.position.set(-0.08, CH, 0.02); g.add(t.dirtyG);
      t.cleanG = new THREE.Group(); t.cleanG.position.set(0.36, CH + 0.02, 0); g.add(t.cleanG);
      updSink(t); break;
    }
    case 'ret': {
      body(0x8a96a4, 0xb8c2cc);
      g.add(at(mesh(G.box(0.7, 0.03, 0.7), 0x2a2a30, false, true), 0, CH + 0.005, 0));
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.26), new THREE.MeshBasicMaterial({ map: signTex('よごれ おさら', '#ffffff'), transparent: true })); sg.position.set(0, CH + 0.62, -0.42); g.add(sg);
      for (const s of [-1, 1]) g.add(at(mesh(G.box(0.06, 0.6, 0.06), 0x5a6470), s * 0.44, CH + 0.3, -0.44));
      t.dirtyG = new THREE.Group(); t.dirtyG.position.y = CH; g.add(t.dirtyG); updRet(t); break;
    }
    case 'trash': {
      g.add(at(mesh(G.cyl(0.36, 0.3, CH - 0.04, 10), 0x2aa86a, true, true), 0, (CH - 0.04) / 2, 0));
      g.add(at(mesh(G.cyl(0.38, 0.38, 0.06, 10), 0x1e7a4a), 0, CH - 0.02, 0));
      g.add(at(mesh(G.cyl(0.27, 0.27, 0.02, 10), 0x0e2a1a, false), 0, CH + 0.01, 0));
      const ic = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ map: iconTex('🗑️'), transparent: true })); ic.position.set(0, 0.3, 0.345); g.add(ic);
      break;
    }
    case 'crate': {
      g.add(at(mesh(G.box(0.96, CH - 0.06, 0.96), 0xc8904a, true, true), 0, (CH - 0.06) / 2, 0));
      for (const y of [0.15, 0.35]) g.add(at(mesh(G.box(0.98, 0.05, 0.98), 0xa8703a), 0, y, 0));
      g.add(at(mesh(G.box(1.0, 0.07, 1.0), 0xe0a860, true, true), 0, CH - 0.035, 0));
      const ic = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ map: iconTex(ING[t.crate].e === 'nori' || ING[t.crate].e === 'bun' ? ING[t.crate].e : ING[t.crate].e), transparent: true }));
      ic.rotation.x = -Math.PI / 2; ic.position.y = CH + 0.004; g.add(ic);
      const ic2 = ic.clone(); ic2.rotation.x = 0; ic2.scale.setScalar(0.55); ic2.position.set(0, 0.26, 0.49); g.add(ic2);
      break;
    }
    case 'conv': {
      g.add(at(mesh(G.box(0.98, CH - 0.07, 0.98), 0x4a4a52, true, true), 0, (CH - 0.07) / 2, 0));
      const belt = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.96), new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.9 }));
      belt.rotation.x = -Math.PI / 2; belt.rotation.z = Math.atan2(-t.dir[1], t.dir[0]); belt.position.y = CH - 0.03; belt.receiveShadow = true; g.add(belt);
      for (const s of [-1, 1]) { const rl = mesh(G.box(t.dir[0] ? 1 : 0.06, 0.06, t.dir[0] ? 0.06 : 1), 0xffcf2e); rl.position.set(t.dir[0] ? 0 : s * 0.47, CH - 0.01, t.dir[0] ? s * 0.47 : 0); g.add(rl); }
      break;
    }
  }
  t.anchor = new THREE.Object3D(); t.anchor.position.y = CH + (t.type === 'conv' ? -0.03 : 0); g.add(t.anchor);
}
function stackPlates(grp, n, dirty) {
  while (grp.children.length) { const c = grp.children[0]; grp.remove(c); disposeTree(c); }
  for (let k = 0; k < Math.min(n, 6); k++) { const p = mesh(G.cyl(0.28, 0.22, 0.045, 18), M(dirty ? 0xc8c0b0 : 0xffffff, { flatShading: false })); p.position.y = 0.025 + k * 0.05; grp.add(p); }
}
function updStack(t) { stackPlates(t.stackG, t.plates, false); }
function updSink(t) {
  stackPlates(t.dirtyG, t.dirty, true);
  while (t.cleanG.children.length) { const c = t.cleanG.children[0]; t.cleanG.remove(c); disposeTree(c); }
  for (let k = 0; k < Math.min(t.clean, 4); k++) { const p = mesh(G.cyl(0.22, 0.22, 0.03, 10), 0xffffff); p.rotation.z = Math.PI / 2; p.position.set(-0.05 + k * 0.04, 0.2, 0); t.cleanG.add(p); }
}
function updRet(t) { stackPlates(t.dirtyG, t.dirty, true); }

// ---------------------------------------------------------------- environment (per theme)
function buildEnv(lv) {
  const th = K.th, W = K.W, H = K.H, root = K.root;
  scene.background = new THREE.Color(th.bg);
  // diorama slab
  const slab = mesh(G.box(W + 0.6, 0.7, H + 0.6), th.slab, false, true); slab.position.y = -0.45; root.add(slab);
  const ground = mesh(new THREE.PlaneGeometry(220, 220), th.ground, false, true); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.9; K.env.add(ground);
  const rnd2 = mulberry(lv.id.charCodeAt(0) * 31 + lv.id.charCodeAt(2));
  const around = (n, minR, fn) => {
    for (let k = 0; k < n; k++) {
      let x, z;
      for (let tries = 0; tries < 20; tries++) { x = (rnd2() - 0.5) * (W + 18); z = (rnd2() - 0.5) * (H + 14) - 2; if (Math.abs(x) > W / 2 + minR || z < -H / 2 - minR || z > H / 2 + minR + 1) break; }
      if (z > H / 2 + 2 && Math.abs(x) < W / 2 + 3) continue; // keep the front clear
      fn(x, z, rnd2);
    }
  };
  const tree = (x, z, r, col = 0x3fae4a) => { const g = new THREE.Group(); g.position.set(x, -0.9, z); g.add(at(mesh(G.cyl(0.15, 0.2, 1.0, 6), 0x8a5a3a), 0, 0.5, 0)); g.add(at(mesh(G.ico(0.8 * r, 0), col), 0, 1.4 * r + 0.5, 0)); g.add(at(mesh(G.ico(0.6 * r, 0), col), 0.2, 2.0 * r + 0.5, 0.1)); K.env.add(g); };
  const pine = (x, z, s = 1, col = 0x2a8a5a, snow) => { const g = new THREE.Group(); g.position.set(x, -0.9, z); g.scale.setScalar(s); g.add(at(mesh(G.cyl(0.12, 0.15, 0.6, 5), 0x6a4a2a), 0, 0.3, 0)); for (let k = 0; k < 3; k++) { g.add(at(mesh(G.cone(0.9 - k * 0.22, 0.9, 7), col), 0, 0.9 + k * 0.5, 0)); if (snow) g.add(at(mesh(G.cone(0.5 - k * 0.12, 0.35, 7), 0xffffff), 0, 1.25 + k * 0.5, 0)); } K.env.add(g); };
  switch (lv.theme) {
    case 'school': {
      const wall = mesh(G.box(W + 8, 4, 0.4), 0xfff0c8, false, true); wall.position.set(0, 1.1, -H / 2 - 1.2); K.env.add(wall);
      for (let k = -2; k <= 2; k++) { const w = mesh(G.box(1.6, 1.3, 0.1), 0x9ad8ff, false); w.position.set(k * 3, 1.8, -H / 2 - 0.98); K.env.add(w); K.env.add(at(mesh(G.box(1.75, 0.1, 0.2), 0xffffff, false), k * 3, 1.1, -H / 2 - 0.95)); }
      for (let k = 0; k < 14; k++) { const f = mesh(G.box(0.4, 0.3, 0.05), [0xff6a8a, 0xffcf2e, 0x59b2ff, 0x56c23a][k % 4], false); f.position.set(-W / 2 - 2 + k * (W + 4) / 13, 2.85 - Math.sin(k / 13 * Math.PI) * 0.35, -H / 2 - 0.95); f.rotation.z = Math.PI / 4; K.env.add(f); }
      around(10, 2.5, (x, z, r) => tree(x, z, 0.8 + r() * 0.5));
      break;
    }
    case 'park':
      around(16, 2, (x, z, r) => tree(x, z, 0.8 + r() * 0.6, [0x3fae4a, 0x56c23a, 0x2a9a3a][Math.floor(r() * 3)]));
      around(24, 1.2, (x, z, r) => { const f = mesh(G.ico(0.12, 0), [0xff6a8a, 0xffcf2e, 0xffffff][Math.floor(r() * 3)], false); f.position.set(x, -0.82, z); K.env.add(f); });
      { const bl = mesh(G.box(3, 0.05, 2), 0xff4f3a, false, true); bl.position.set(-W / 2 - 3, -0.86, H / 2 - 1); K.env.add(bl); }
      break;
    case 'ship': {
      const hull = mesh(G.cyl(1, 0.7, 1, 6), 0x8a4a2a, false, true); hull.scale.set((W + 3) / 2, 1.6, (H + 2) / 2); hull.rotation.y = Math.PI / 6; hull.position.y = -1.3; root.add(hull);
      const mast = mesh(G.cyl(0.12, 0.15, 6, 6), 0x6a3a1a); mast.position.set(W / 2 + 0.3, 2.5, -H / 2 - 0.2); root.add(mast);
      const sail = mesh(G.box(0.05, 2.6, 2.4), 0xffffff); sail.position.set(W / 2 + 0.35, 3.2, -H / 2 + 0.5); root.add(sail);
      const flag = mesh(G.box(0.05, 0.4, 0.7), 0xff4f3a); flag.position.set(W / 2 + 0.3, 5.6, -H / 2 + 0.1); root.add(flag);
      K.sea = new THREE.Mesh(new THREE.PlaneGeometry(220, 220, 40, 40), new THREE.MeshStandardMaterial({ color: 0x2a8ad8, flatShading: true, roughness: 0.4 }));
      K.sea.rotation.x = -Math.PI / 2; K.sea.position.y = -0.95; K.env.add(K.sea);
      break;
    }
    case 'sushi': {
      const wall = mesh(G.box(W + 8, 4.5, 0.4), 0x5a2a1a, false, true); wall.position.set(0, 1.2, -H / 2 - 1.2); K.env.add(wall);
      for (let k = -3; k <= 3; k++) { const n = mesh(G.box(1.1, 1.4, 0.05), k % 2 ? 0x2a3a8a : 0x1a2a6a, false); n.position.set(k * 1.25, 2.6, -H / 2 - 0.95); K.env.add(n); }
      const s = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.9), new THREE.MeshBasicMaterial({ map: signTex('ねこずし', '#fff6e2', '#5a2a1a', 300, 80) })); s.position.set(0, 3.7, -H / 2 - 0.9); K.env.add(s);
      for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) { const l = mesh(G.cyl(0.35, 0.35, 0.7, 10), MB(0xff5a3a)); l.position.set(sx * (W / 2 + 1.5), 2.2 - k * 0.2, -H / 2 + k * 2.5); K.env.add(l); const pl = new THREE.PointLight(0xffaa66, 0.5, 6); pl.position.copy(l.position); K.env.add(pl); }
      // maneki neko
      const cat = new THREE.Group(); cat.position.set(W / 2 + 1.8, -0.9, H / 2 - 1); K.env.add(cat);
      cat.add(at(mesh(G.ico(0.5, 1), 0xffffff), 0, 0.5, 0)); cat.add(at(mesh(G.ico(0.42, 1), 0xffffff), 0, 1.25, 0.05));
      for (const s2 of [-1, 1]) cat.add(at(mesh(G.cone(0.13, 0.28, 4), 0xffffff), s2 * 0.25, 1.65, 0));
      const paw = mesh(G.ico(0.15, 0), 0xffffff); paw.position.set(0.42, 1.4, 0.2); cat.add(paw); K.catPaw = paw;
      cat.add(at(mesh(G.ico(0.1, 0), 0xffcf2e), 0, 0.85, 0.42));
      faceEye(cat.children[1], -0.15, 0.05, 0.4, -0.35, 1.4); faceEye(cat.children[1], 0.15, 0.05, 0.4, 0.35, 1.4);
      break;
    }
    case 'snow':
      around(18, 2, (x, z, r) => pine(x, z, 0.8 + r() * 0.6, 0x2a7a5a, true));
      { const sm = new THREE.Group(); sm.position.set(-W / 2 - 2, -0.9, H / 2 - 1); sm.add(at(mesh(G.ico(0.6, 1), 0xffffff), 0, 0.5, 0)); sm.add(at(mesh(G.ico(0.42, 1), 0xffffff), 0, 1.3, 0)); sm.add(at(mesh(G.cone(0.08, 0.3, 5), 0xff8a1e), 0, 1.3, 0.45)).rotation.x = Math.PI / 2; K.env.add(sm); }
      K.snow = true;
      break;
    case 'camp': {
      around(14, 2.5, (x, z, r) => pine(x, z, 0.9 + r() * 0.5, 0x3a8a4a));
      const river = mesh(new THREE.PlaneGeometry(1.4, 60), M(0x3aa8e8, { roughness: 0.3 }), false, true); river.rotation.x = -Math.PI / 2; river.position.set(wx(6), -0.85, 0); K.env.add(river);
      const tent = mesh(G.cone(1.6, 1.8, 4), 0xff8a3a); tent.position.set(-W / 2 - 2.5, 0, -1); tent.rotation.y = Math.PI / 4; K.env.add(tent);
      const fire = makeFire(); fire.scale.setScalar(0.8); fire.position.set(W / 2 + 2.2, -0.9, 1); K.env.add(fire); K.campFire = fire;
      break;
    }
    case 'volcano': {
      const v = mesh(G.cone(9, 9, 9), 0x4a2a22, false, true); v.position.set(2, 3, -H / 2 - 12); K.env.add(v);
      const lava = mesh(G.cyl(1.6, 2.2, 0.6, 9), MB(0xff5a1a)); lava.position.set(2, 7.4, -H / 2 - 12); K.env.add(lava); K.lavaTop = lava;
      for (let k = 0; k < 5; k++) { const p = mesh(G.cyl(rnd(0.6, 1.4), rnd(0.6, 1.4), 0.05, 7), MB(0xff6a1a), false); p.position.set((k % 2 ? 1 : -1) * (W / 2 + 2 + k * 0.7), -0.86, -2 + k * 1.3); K.env.add(p); }
      around(10, 2, (x, z, r) => { const rk = mesh(G.ico(0.4 + r() * 0.6, 0), 0x3a2a2a); rk.position.set(x, -0.6, z); K.env.add(rk); });
      K.embers = true;
      break;
    }
    case 'boss': {
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; const pl = mesh(G.cyl(0.5, 0.6, 6, 6), 0x5a3a9a); pl.position.set(Math.cos(a) * (W / 2 + 4), 2, Math.sin(a) * (H / 2 + 4) - 2); if (pl.position.z > H / 2) continue; K.env.add(pl); }
      const hp = makeHarapekon(); hp.g.scale.setScalar(2.1); hp.g.position.set(wx(7), -0.9, wz(0) - 2.9); K.env.add(hp.g); K.boss = { P: hp, fill: 0 };
      break;
    }
  }
}
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- build / clear
K.env = new THREE.Group(); scene.add(K.env);
function clearKitchen() {
  for (const o of [...K.root.children]) { K.root.remove(o); disposeTree(o); }
  for (const o of [...K.env.children]) { K.env.remove(o); disposeTree(o); }
  K.tiles = []; K.players = []; K.orders = []; K.floorItems = []; K.flying = []; K.pend = []; K.boss = null; K.sea = null; K.snow = false; K.embers = false; K.catPaw = null; K.lavaTop = null; K.campFire = null; K.mover = null;
  K.root.rotation.set(0, 0, 0);
  $('#orders').innerHTML = '';
  Parts.clear();
}
function buildKitchen(lv) {
  clearKitchen();
  K.lv = lv; K.th = THEMES[lv.theme]; K.W = lv.map[0].length; K.H = lv.map.length;
  K.cells = []; K.kind = [];
  for (let j = 0; j < K.H; j++) { K.cells.push(Array(K.W).fill(null)); K.kind.push(Array(K.W).fill('floor')); }
  const floorM1 = M(K.th.f1, lv.ice ? { roughness: 0.15, metalness: 0.1 } : {}), floorM2 = M(K.th.f2, lv.ice ? { roughness: 0.15, metalness: 0.1 } : {});
  const fgeo = G.box(1, 0.1, 1);
  const waterM = new THREE.MeshStandardMaterial({ color: 0x3aa8e8, roughness: 0.25, transparent: true, opacity: 0.9, flatShading: true });
  for (let j = 0; j < K.H; j++) for (let i = 0; i < K.W; i++) {
    const ch = lv.map[j][i];
    if (ch === ' ') { K.kind[j][i] = 'void'; continue; }
    if (ch === '~') {
      K.kind[j][i] = 'water';
      const w = new THREE.Mesh(G.box(1, 0.1, 1), waterM); w.position.set(wx(i), -0.09, wz(j)); w.receiveShadow = true; K.root.add(w);
      continue;
    }
    const f = new THREE.Mesh(fgeo, (i + j) % 2 ? floorM1 : floorM2); f.position.set(wx(i), -0.05, wz(j)); f.receiveShadow = true; K.root.add(f);
    if (ch !== '.') { const t = makeTile(ch, i, j); K.cells[j][i] = t; K.tiles.push(t); }
  }
  // initial items
  for (const t of K.tiles) {
    if (t.ch === 'S') placeOn(t, newPot('pot'));
    if (t.ch === 'P') placeOn(t, newPot('pan'));
    if (t.ch === 'E') placeOn(t, newExt());
  }
  if (lv.mover) {
    K.mover = { tiles: K.tiles.filter(t => t.mover), state: 0, t: lv.mover.period, d: lv.mover.dz, period: lv.mover.period };
    for (const t of K.mover.tiles) { t.bi = t.i; t.bj = t.j; }
  }
  buildEnv(lv);
  aimSun(0, 0);
}

// ---------------------------------------------------------------- movers (boss stage)
function toggleMover() {
  const mv = K.mover; mv.state = 1 - mv.state;
  for (const t of mv.tiles) K.cells[t.j][t.i] = null;
  for (const t of mv.tiles) { t.i = t.bi; t.j = t.bj + (mv.state ? mv.d : 0); t.x = wx(t.i); t.z = wz(t.j); K.cells[t.j][t.i] = t; }
  // push out anything standing in the way
  const fix = o => {
    if (walkable(ti(o.x), tj(o.z))) return;
    let best = null, bd = 1e9;
    for (let j = 0; j < K.H; j++) for (let i = 0; i < K.W; i++) if (walkable(i, j)) { const d = Math.hypot(wx(i) - o.x, wz(j) - o.z); if (d < bd) { bd = d; best = [i, j]; } }
    if (best) { o.x = wx(best[0]); o.z = wz(best[1]); if (o.obj) o.obj.position.set(o.x, 0, o.z); }
  };
  for (const p of K.players) fix(p);
  for (const f of K.floorItems) { fix(f); f.it.obj.position.set(f.x, 0, f.z); }
  Sound.sfx('move'); K.shake = 0.5;
}

// ---------------------------------------------------------------- players
function makePlayer(kind, i, j, idx) {
  const P = makeChef(kind);
  const p = { idx, kind, P, x: wx(i), z: wz(j), vx: 0, vz: 0, face: Math.PI, hold: null, task: null, dashV: 0, dashCd: 0, phase: 0, throwT: 0, spray: false, ctl: null, bumpCd: 0 };
  p.hand = new THREE.Object3D(); p.hand.position.set(0, 0.5, 0.36); P.g.add(p.hand);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.4, 24), MB(kind === 'ricky' ? 0x3d8bff : 0xff4f8a, { transparent: true, opacity: 0.85, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; P.g.add(ring); p.ring = ring;
  const arrow = mesh(G.cone(0.14, 0.24, 4), MB(kind === 'ricky' ? 0x3d8bff : 0xff4f8a), false); arrow.rotation.x = Math.PI; arrow.position.y = 1.55; P.g.add(arrow); p.arrow = arrow;
  const hl = new THREE.Mesh(G.box(1.04, 0.06, 1.04), new THREE.MeshBasicMaterial({ color: kind === 'ricky' ? 0x8ac4ff : 0xffb0d0, transparent: true, opacity: 0.55, depthWrite: false }));
  hl.visible = false; K.root.add(hl); p.hl = hl;
  P.g.position.set(p.x, 0, p.z); K.root.add(P.g);
  return p;
}
function holdIt(p, it) { p.hold = it; if (!it.obj) refresh(it); p.hand.add(it.obj); it.obj.position.set(0, 0, 0); it.obj.rotation.set(0, 0, 0); }
function frontTile(p) {
  const fx = Math.sin(p.face), fz = Math.cos(p.face);
  let t = tileAtW(p.x + fx * 0.72, p.z + fz * 0.72);
  if (t) return t;
  const ci = ti(p.x), cj = tj(p.z); let di = 0, dj = 0;
  if (Math.abs(fx) > Math.abs(fz)) di = Math.sign(fx); else dj = Math.sign(fz);
  return tileAt(ci + di, cj + dj);
}
function frontFloor(p) {
  const px = p.x + Math.sin(p.face) * 0.45, pz = p.z + Math.cos(p.face) * 0.45;
  let best = null, bd = 0.75;
  for (const f of K.floorItems) { const d = Math.hypot(f.x - px, f.z - pz); if (d < bd) { bd = d; best = f; } }
  return best;
}
function fail(msg, p) { if (msg) say(p, msg); Sound.sfx('wrong'); return false; }
function say(p, msg) { if (!p) return; p.say = msg; p.sayT = 2.2; }
function takeFrom(t) {
  if (t.fire > 0) return null;
  if (t.top) { const it = t.top; t.top = null; return it; }
  switch (t.type) {
    case 'crate': return newIng(t.crate);
    case 'plates': if (t.plates > 0) { t.plates--; updStack(t); return newPlate(); } return null;
    case 'sink': if (t.clean > 0) { t.clean--; updSink(t); return newPlate(); } return null;
    case 'ret': if (t.dirty > 0) { const it = newPlate(); it.dirty = true; it.n = t.dirty; t.dirty = 0; updRet(t); return it; } return null;
  }
  return null;
}
function doPick(p) {
  const t = frontTile(p);
  if (!p.hold) {
    if (t && t.fire > 0) return fail('ひが ついてる！ しょうかきで けして！', p);
    if (t) { const it = takeFrom(t); if (it) { holdIt(p, it); Sound.sfx('pick'); p.task = null; Tut.ev('take', it, t); return; } }
    const f = frontFloor(p);
    if (f) { K.floorItems.splice(K.floorItems.indexOf(f), 1); holdIt(p, f.it); Sound.sfx('pick'); return; }
    return;
  }
  if (!t) return fail(p.hold.kind === 'ing' && K.lv.throw ? 'カウンターに おくか、 なげてね' : 'カウンターに おいてね', p);
  if (putTo(t, p)) { Tut.ev('put', null, t); }
  else fail(why, p);
}
function putTo(t, p) {
  const h = p.hold; why = '';
  if (t.fire > 0) { why = 'ひが ついてる！'; return false; }
  switch (t.type) {
    case 'trash':
      if (h.kind === 'ing') { killItem(h); p.hold = null; }
      else if (h.kind === 'pot') { if (!h.items.length) { why = 'からっぽだよ'; return false; } resetPot(h); refresh(h); }
      else if (h.kind === 'plate') { if (h.dirty || !h.items.length) { why = h.dirty ? 'よごれた おさらは ながしへ' : 'からっぽだよ'; return false; } h.items = []; refresh(h); }
      else { why = 'しょうかきは すてないでね'; return false; }
      Sound.sfx('drop'); return true;
    case 'window': return serve(h, p, t);
    case 'sink':
      if (h.kind === 'plate' && h.dirty) { t.dirty += h.n; killItem(h); p.hold = null; updSink(t); Sound.sfx('place'); return true; }
      why = 'ここは よごれた おさらを あらう ところ'; return false;
    case 'ret': why = 'よごれた おさらが もどってくる ところだよ'; return false;
    case 'plates':
      if (h.kind === 'plate' && !h.dirty && !h.items.length) { t.plates++; killItem(h); p.hold = null; updStack(t); Sound.sfx('place'); return true; }
      if (t.plates > 0 && h.kind === 'ing') { // put directly onto a fresh plate from the stack
        const pl = newPlate(); if (addToPlate(pl, compKey(h))) { t.plates--; updStack(t); killItem(h); p.hold = null; holdIt(p, pl); refresh(pl); Sound.sfx('place'); return true; }
        return false;
      }
      if (t.plates > 0 && h.kind === 'pot') { const pl = newPlate(); if (pour(h, pl)) { t.plates--; updStack(t); placeAside(p, pl); return true; } return false; }
      why = 'おさらの たなだよ'; return false;
  }
  if (!t.top) {
    if (t.type === 'stove' && h.kind !== 'pot') { why = 'コンロには なべや フライパンを おいてね'; return false; }
    if (t.type === 'board' && h.kind !== 'ing') { why = 'まないたには ざいりょうを おいてね'; return false; }
    if (t.type === 'conv' && h.kind === 'ext') { why = ''; }
    p.hold = null; placeOn(t, h); Sound.sfx('place'); return true;
  }
  return combine(p, h, t);
}
// pot poured into a new plate taken from the plates shelf: hold the plate, drop the pot back where it was? keep pot in hand → swap
function placeAside(p, pl) {
  // the player keeps the pot; the filled plate goes on the nearest free counter, else onto the floor in front
  const t = nearFree(p);
  if (t) placeOn(t, pl); else dropFloor(pl, p.x + Math.sin(p.face) * 0.5, p.z + Math.cos(p.face) * 0.5);
  refresh(pl);
}
function nearFree(p) {
  let best = null, bd = 1.8;
  for (const t of K.tiles) if (!t.top && !t.fire && (t.type === 'counter' || t.type === 'conv')) { const d = Math.hypot(t.x - p.x, t.z - p.z); if (d < bd) { bd = d; best = t; } }
  return best;
}
function combine(p, h, t) {
  const b = t.top;
  if (h.kind === 'ing') {
    if (b.kind === 'plate') { if (addToPlate(b, compKey(h))) { killItem(h); p.hold = null; refresh(b); Sound.sfx('plop'); return true; } return false; }
    if (b.kind === 'pot') { const r = addToPot(b, h); if (r === true) { killItem(h); p.hold = null; refresh(b); Sound.sfx('plop'); return true; } why = r; return false; }
    why = 'もう なにか のってるよ'; return false;
  }
  if (h.kind === 'plate') {
    if (h.dirty) { why = 'よごれた おさらは ながしへ'; return false; }
    if (b.kind === 'ing') { if (addToPlate(h, compKey(b))) { killItem(b); t.top = null; refresh(h); Sound.sfx('plop'); return true; } return false; }
    if (b.kind === 'pot') return pour(b, h);
    if (b.kind === 'plate' && !b.dirty) { // merge contents
      if (!h.items.length) { why = 'もう おさらが あるよ'; return false; }
      const save = b.items.slice(); let ok = true;
      for (const k of h.items) if (!addToPlate(b, k)) { ok = false; break; }
      if (!ok) { b.items = save; return false; }
      h.items = []; refresh(h); refresh(b); Sound.sfx('plop'); return true;
    }
    why = 'もう なにか のってるよ'; return false;
  }
  if (h.kind === 'pot') {
    if (b.kind === 'plate') return pour(h, b);
    if (b.kind === 'ing') { const r = addToPot(h, b); if (r === true) { killItem(b); t.top = null; refresh(h); Sound.sfx('plop'); return true; } why = r; return false; }
  }
  why = 'もう なにか のってるよ'; return false;
}

// ---------------------------------------------------------------- serving & orders
function serve(h, p, t) {
  if (h.kind !== 'plate') { why = h.kind === 'pot' ? 'おさらに もりつけてから だしてね' : 'おさらに のせてから だしてね'; return false; }
  if (h.dirty) { why = 'よごれた おさらは ながしへ'; return false; }
  if (!h.items.length) { why = 'からっぽだよ'; return false; }
  const idx = K.orders.findIndex(o => !o.gone && sameSet(RECIPES[o.r].items, h.items));
  if (idx < 0) {
    why = K.lv.recipes.some(r => sameSet(RECIPES[r].items, h.items)) ? 'いまは ちゅうもん されてないよ' : 'まだ かんせい してないよ';
    return false;
  }
  const o = K.orders[idx];
  const tip = Math.round(clamp(o.t / o.T, 0, 1) * 10) + (idx === 0 ? 2 : 0);
  const pts = RECIPES[o.r].pts;
  K.score += pts + tip; K.tipSum += tip; K.delivered++;
  o.gone = true; o.el.classList.add('done'); setTimeout(() => o.el.remove(), 500);
  K.orders.splice(idx, 1);
  killItem(h); p.hold = null;
  K.pend.push({ t: K.lv.dirty ? 6 : 3.5, dirty: !!K.lv.dirty });
  Sound.sfx('serve'); setTimeout(() => Sound.sfx('coin'), 250);
  const wp = new V3(); t.g.getWorldPosition(wp); wp.y += 1;
  popText('+' + (pts + tip), wp);
  Parts.burst(wp, 14, { col: 0xffcf2e, star: true, size: 0.28, life: 0.9, spd: 2.5, up: 3, g: 6 });
  if (t.bell) t.bell.userData.ring = 0.4;
  $('#coin').classList.remove('pop'); void $('#coin').offsetWidth; $('#coin').classList.add('pop');
  if (K.boss) { K.boss.fill++; K.boss.P.chomp = 0.8; Sound.sfx('chomp'); bossCheck(); }
  if (K.orders.length < 2) K.nextOrder = Math.min(K.nextOrder, 1.5);
  Tut.ev('serve');
  return true;
}
function returnPlate(dirty) {
  if (dirty) { const r = K.tiles.find(t => t.type === 'ret'); if (r) { r.dirty++; updRet(r); return; } }
  const d = K.tiles.find(t => t.type === 'plates'); if (d) { d.plates++; updStack(d); }
}
function orderMax() { return K.lv.tut === 1 ? 2 : K.easy ? 3 : 4; }
function spawnOrder() {
  const rs = K.lv.recipes;
  let r = pick(rs);
  if (K.lv.tut === 1 && K.delivered + K.orders.length < 2) r = 'salad_l';
  if (K.lv.tut === 2 && K.delivered + K.orders.length < 1) r = 'soup';
  const last = K.orders.slice(-2).map(o => o.r);
  if (last.length === 2 && last[0] === r && last[1] === r && rs.length > 1) r = rs.find(x => x !== r);
  const T = RECIPES[r].time * (K.easy ? 1.6 : 1) * (K.twoP ? 0.9 : 1);
  const o = { r, t: T, T, el: ticketEl(r) };
  K.orders.push(o); $('#orders').appendChild(o.el);
  Sound.sfx('order');
}
const PROC = { lettuce_c: 'knife', tomato_c: 'knife', fish_c: 'knife', soup: 'pot', gohan: 'pot', curry: 'pot', patty: 'pan' };
function ticketEl(r) {
  const R = RECIPES[r]; const d = document.createElement('div'); d.className = 'tk';
  d.style.rotate = (Math.random() * 4 - 2).toFixed(1) + 'deg';
  d.innerHTML = `<div class="tb"><i></i></div><img class="dish" src="${iconURL(R.ic)}" alt=""><div class="nm">${R.n}</div><div class="cs">${R.items.map(k => `<span class="ci"><img src="${iconURL(COMP[k].ic)}" alt="">${PROC[k] ? `<b><img src="${iconURL(PROC[k])}" alt=""></b>` : ''}</span>`).join('')}</div>`;
  d._bar = d.querySelector('.tb i');
  return d;
}
function updOrders(dt) {
  for (let k = K.orders.length - 1; k >= 0; k--) {
    const o = K.orders[k]; o.t -= dt;
    const f = clamp(o.t / o.T, 0, 1);
    o.el._bar.style.width = (f * 100).toFixed(1) + '%';
    o.el._bar.className = f < 0.25 ? 'low' : f < 0.5 ? 'mid' : '';
    o.el.classList.toggle('shake', f < 0.2);
    if (o.t <= 0) {
      K.orders.splice(k, 1); K.failed++;
      if (!K.easy) K.score = Math.max(0, K.score - 10);
      o.el.classList.remove('shake'); o.el.classList.add('bad'); setTimeout(() => o.el.remove(), 650);
      Sound.sfx('expire');
      K.nextOrder = Math.min(K.nextOrder, 2);
    }
  }
  K.nextOrder -= dt;
  if (K.orders.length < orderMax() && (K.nextOrder <= 0 || K.orders.length === 0)) {
    spawnOrder(); K.nextOrder = (K.lv.tut === 1 ? 22 : K.easy ? 20 : 15) * (K.twoP ? 0.8 : 1);
  }
}
function bossCheck() {
  const need = K.easy ? 8 : 12;
  $('#boss .b i').style.width = Math.min(100, K.boss.fill / need * 100) + '%';
  $('#bossT').textContent = `${Math.min(K.boss.fill, need)} / ${need}`;
  if (K.boss.fill >= need && K.phase === 'run') { K.boss.won = true; Game.endRound(true); }
}

// ---------------------------------------------------------------- floor / thrown items
function dropFloor(it, x, z) {
  if (!it.obj) refresh(it);
  K.root.add(it.obj); it.obj.position.set(x, 0, z); it.obj.rotation.set(0, Math.random() * 3, 0);
  K.floorItems.push({ it, x, z });
}
function throwIt(p) {
  const it = p.hold; p.hold = null; p.throwT = 0.3;
  const fx = Math.sin(p.face), fz = Math.cos(p.face);
  K.root.add(it.obj);
  const f = { it, x: p.x + fx * 0.35, y: 0.78, z: p.z + fz * 0.35, vx: fx * 6.6, vy: 3.0, vz: fz * 6.6, from: p, lx: p.x, lz: p.z, t: 0 };
  it.obj.position.set(f.x, f.y, f.z);
  K.flying.push(f); Sound.sfx('throw');
}
function landOn(t, it) {
  if (t.fire > 0) return false;
  if (t.type === 'trash') { killItem(it); Sound.sfx('drop'); return true; }
  if (!['counter', 'board', 'conv', 'crate', 'stove'].includes(t.type)) return false;
  if (!t.top) { if (t.type === 'stove') return false; placeOn(t, it); Sound.sfx('place'); return true; }
  const b = t.top;
  if (b.kind === 'plate' && addToPlate(b, compKey(it))) { killItem(it); refresh(b); Sound.sfx('plop'); return true; }
  if (b.kind === 'pot' && addToPot(b, it) === true) { killItem(it); refresh(b); Sound.sfx('plop'); return true; }
  return false;
}
function updFlying(dt) {
  for (let k = K.flying.length - 1; k >= 0; k--) {
    const f = K.flying[k]; f.t += dt;
    f.vy -= 12 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.z += f.vz * dt;
    f.it.obj.position.set(f.x, f.y, f.z); f.it.obj.rotation.x += dt * 10;
    // catch
    let caught = false;
    for (const q of K.players) if (q !== f.from && !q.hold && f.t > 0.08 && Math.hypot(q.x - f.x, q.z - f.z) < 0.6 && f.y > 0.25 && f.y < 1.4) { f.it.obj.rotation.set(0, 0, 0); holdIt(q, f.it); Sound.sfx('catch'); say(q, 'キャッチ！'); caught = true; break; }
    if (caught) { K.flying.splice(k, 1); continue; }
    const i = ti(f.x), j = tj(f.z);
    const t = tileAt(i, j);
    if (!inGrid(i, j)) { if (f.y < -0.5) { killItem(f.it); K.flying.splice(k, 1); Sound.sfx('splash'); } continue; }
    if (t && f.y <= CH + 0.15) {
      f.it.obj.rotation.set(0, 0, 0);
      if (!landOn(t, f.it)) dropFloor(f.it, f.lx, f.lz);
      K.flying.splice(k, 1); continue;
    }
    const kd = K.kind[j][i];
    if (!t && kd === 'floor') { f.lx = f.x; f.lz = f.z; if (f.y <= 0.05) { f.it.obj.rotation.set(0, 0, 0); K.root.remove(f.it.obj); dropFloor(f.it, f.x, f.z); Sound.sfx('place'); K.flying.splice(k, 1); } continue; }
    if ((kd === 'water' || kd === 'void') && f.y <= -0.1) {
      const wp = new V3(f.x, -0.1, f.z); K.root.localToWorld(wp);
      Parts.burst(wp, 10, { col: 0xbfe8ff, size: 0.18, life: 0.6, spd: 1.5, up: 3, g: 10 });
      killItem(f.it); K.flying.splice(k, 1); Sound.sfx('splash'); say(f.from, 'あっ… おちちゃった');
    }
  }
}

// ---------------------------------------------------------------- fire
function flammable(t) { return t && t.type !== 'window' && t.type !== 'sink' && t.type !== 'trash'; }
function ignite(t) {
  if (t.fire > 0 || !flammable(t)) return;
  t.fire = 1; t.spread = rnd(7, 10) * (K.easy ? 1.5 : 1);
  t.fireG = makeFire(); t.fireG.position.y = CH; t.g.add(t.fireG);
  Sound.sfx('fire');
  if (t.top && t.top.kind === 'pot' && t.top.items.length && t.top.state !== 'burnt') { t.top.state = 'burnt'; refresh(t.top); }
}
function putOut(t) { t.fire = 0; if (t.fireG) { t.g.remove(t.fireG); disposeTree(t.fireG); t.fireG = null; } Sound.sfx('ext'); const wp = new V3(); t.g.getWorldPosition(wp); wp.y += 0.8; for (let k = 0; k < 8; k++) Parts.add(wp, { col: 0xffffff, size: 0.4, grow: 1.1, life: 1.2, vx: rnd(-0.5, 0.5), vy: rnd(0.8, 1.6), vz: rnd(-0.5, 0.5), op: 0.7 }); }
function updFire(dt) {
  for (const t of K.tiles) {
    if (!(t.fire > 0)) continue;
    t.fire = Math.min(1, t.fire + dt * 0.25);
    animFire(t.fireG, K.t, 0.5 + t.fire * 0.6);
    if (Math.random() < dt * 6) { const wp = new V3(); t.g.getWorldPosition(wp); wp.y += 1.1; Parts.add(wp, { col: 0x5a5050, size: 0.35, grow: 0.9, life: 1.4, vx: rnd(-0.2, 0.2), vy: 1.2, vz: rnd(-0.2, 0.2), op: 0.5 }); }
    t.spread -= dt;
    if (t.spread <= 0) {
      t.spread = rnd(7, 10) * (K.easy ? 1.5 : 1);
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => tileAt(t.i + a, t.j + b)).filter(n => n && flammable(n) && !n.fire);
      if (nb.length) ignite(pick(nb));
    }
  }
}
function spray(p, dt) {
  const fx = Math.sin(p.face), fz = Math.cos(p.face);
  const wp = new V3(p.x + fx * 0.45, 0.72, p.z + fz * 0.45); K.root.localToWorld(wp);
  if (Math.random() < dt * 40) Parts.add(wp, { col: 0xeaf6ff, size: 0.18, grow: 0.6, life: 0.5, vx: fx * 5 + rnd(-0.6, 0.6), vy: rnd(-0.2, 0.5), vz: fz * 5 + rnd(-0.6, 0.6), op: 0.85, drag: 1.5 });
  if ((p.sprT = (p.sprT || 0) - dt) <= 0) { p.sprT = 0.17; Sound.sfx('spray'); }
  for (const t of K.tiles) if (t.fire > 0) {
    const dx = t.x - p.x, dz = t.z - p.z, d = Math.hypot(dx, dz);
    if (d < 3.0 && (dx * fx + dz * fz) / (d || 1) > 0.72) { t.fire -= dt * 1.5; if (t.fire <= 0) putOut(t); }
  }
}
