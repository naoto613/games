// ================================================================ world map (drive the kindergarten bus)
const NODE_POS = [[-12, 8], [-6, 10.5], [0, 8.5], [5.5, 4], [11, 7], [13, -1], [6, -6.5], [-3, -10]];
const WORLD_COL = [0xff6a8a, 0xff6a8a, 0xff6a8a, 0x17b3a3, 0x17b3a3, 0x17b3a3, 0xff4f3a, 0x8a5ae0];
const MapW = {
  root: new THREE.Group(), built: false, bus: null, x: -15, z: 12, h: 0, v: 0, near: -1, ctl: new Ctl(['all', 'touch', 'pad0']), nodes: [], t: 0,
  build() {
    if (this.built) return; this.built = true;
    const r = this.root; scene.add(r); r.visible = false;
    const sea = mesh(new THREE.PlaneGeometry(300, 300), M(0x2a9ae8, { roughness: 0.35 }), false, true); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.4; r.add(sea);
    const isl = mesh(G.cyl(23, 25, 1.2, 28), 0x7ad05a, false, true); isl.position.y = -0.3; r.add(isl);
    const beach = mesh(G.cyl(25.2, 26, 0.6, 28), 0xf6dfa0, false, true); beach.position.y = -0.5; r.add(beach);
    // road
    const pts = [new V3(-16, 0, 12)].concat(NODE_POS.map(([x, z]) => new V3(x, 0, z)));
    const curve = new THREE.CatmullRomCurve3(pts);
    const N = 240;
    for (let k = 0; k < N; k++) {
      const a = curve.getPoint(k / N), b = curve.getPoint((k + 1) / N);
      const seg = mesh(G.box(1.8, 0.06, a.distanceTo(b) + 0.08), 0xf2e2c0, false, true);
      seg.position.set((a.x + b.x) / 2, 0.31, (a.z + b.z) / 2); seg.rotation.y = Math.atan2(b.x - a.x, b.z - a.z); r.add(seg);
      if (k % 6 === 0) { const d = mesh(G.box(0.16, 0.07, 0.5), 0xffffff, false); d.position.set(a.x, 0.33, a.z); d.rotation.y = seg.rotation.y; r.add(d); }
    }
    // kindergarten (start)
    const kg = new THREE.Group(); kg.position.set(-17.5, 0.3, 14.5); kg.rotation.y = 0.6; r.add(kg);
    kg.add(at(mesh(G.box(4, 1.8, 2), 0xfff0c8), 0, 0.9, 0));
    for (const s of [-1, 1]) { const rf = mesh(G.box(4.3, 0.16, 1.45), 0xff6a8a); rf.rotation.x = s * 0.6; rf.position.set(0, 2.15, s * 0.58); kg.add(rf); }
    for (let k = 0; k < 5; k++) { const f = mesh(G.cyl(0.18, 0.18, 0.05, 8), 0xffd82a); f.rotation.x = Math.PI / 2; f.position.set(-1.6 + k * 0.8, 0.5, 1.05); kg.add(f); }
    // decor per stage area
    const tree = (x, z, s = 1, col = 0x3fae4a) => { const g = new THREE.Group(); g.position.set(x, 0.3, z); g.scale.setScalar(s); g.add(at(mesh(G.cyl(0.15, 0.2, 0.9, 6), 0x8a5a3a), 0, 0.45, 0)); g.add(at(mesh(G.ico(0.75, 0), col), 0, 1.3, 0)); r.add(g); };
    const pine = (x, z, s = 1, snow) => { const g = new THREE.Group(); g.position.set(x, 0.3, z); g.scale.setScalar(s); for (let k = 0; k < 3; k++) { g.add(at(mesh(G.cone(0.8 - k * 0.2, 0.8, 7), 0x2a7a5a), 0, 0.6 + k * 0.45, 0)); if (snow) g.add(at(mesh(G.cone(0.42 - k * 0.1, 0.3, 7), 0xffffff), 0, 0.92 + k * 0.45, 0)); } r.add(g); };
    const rr2 = mulberry(77);
    for (let k = 0; k < 70; k++) {
      const a = rr2() * TAU, d = 4 + rr2() * 18; const x = Math.cos(a) * d, z = Math.sin(a) * d;
      const pd = Math.min(...Array.from({ length: 60 }, (_, i) => curve.getPoint(i / 59).distanceTo(new V3(x, 0, z))));
      if (pd < 2.6) continue;
      if (x > 6 && z < 2 && z > -6) pine(x, z, 0.7 + rr2() * 0.5, true);
      else if (x < -3 && z < -4) continue;
      else tree(x, z, 0.6 + rr2() * 0.6, [0x3fae4a, 0x56c23a, 0x2a9a3a][Math.floor(rr2() * 3)]);
    }
    // ship at the shore near 1-3
    const ship = new THREE.Group(); ship.position.set(0, -0.2, 20); r.add(ship); this.ship = ship;
    const hull = mesh(G.cyl(1, 0.7, 1, 6), 0x8a4a2a); hull.scale.set(2.2, 1, 1.2); ship.add(hull);
    ship.add(at(mesh(G.cyl(0.08, 0.08, 3, 6), 0x6a3a1a), 0, 2, 0)); ship.add(at(mesh(G.box(0.05, 1.6, 1.4), 0xffffff), 0.05, 2.2, 0));
    // sushi shop near 2-1
    const sh = new THREE.Group(); sh.position.set(5, 0.3, 1); sh.rotation.y = -0.5; r.add(sh);
    sh.add(at(mesh(G.box(2.4, 1.4, 1.6), 0x8a4a2a), 0, 0.7, 0)); sh.add(at(mesh(G.box(2.8, 0.2, 2), 0x2a2a3a), 0, 1.5, 0));
    sh.add(at(mesh(G.box(2.0, 0.5, 0.05), 0x2a3a8a), 0, 1.0, 0.82));
    // snow mountain near 2-2
    const mt = mesh(G.cone(4, 5, 8), 0xe8f4ff, false, true); mt.position.set(17, 2.5, 3); r.add(mt);
    const mt2 = mesh(G.cone(3, 3.6, 8), 0xffffff, false, true); mt2.position.set(14.5, 1.8, 7.5); r.add(mt2);
    // camp near 2-3
    const tent = mesh(G.cone(1.2, 1.5, 4), 0xff8a3a); tent.position.set(16, 1.05, -3.5); tent.rotation.y = 0.8; r.add(tent);
    const river = mesh(G.box(1.6, 0.05, 14), M(0x3aa8e8, { roughness: 0.3 }), false, true); river.position.set(17.5, 0.31, -1); river.rotation.y = 0.3; r.add(river);
    // volcano near 3-1
    const vol = mesh(G.cone(5, 6, 9), 0x5a3a2a, false, true); vol.position.set(9, 3.2, -14); r.add(vol);
    const lava = mesh(G.cyl(1, 1.4, 0.4, 9), MB(0xff5a1a)); lava.position.set(9, 6.1, -14); r.add(lava); this.lava = lava;
    // boss lair at 3-2
    const lair = mesh(G.ico(4, 1), 0x4a2a7a, false, true); lair.scale.set(1.3, 0.8, 1); lair.position.set(-5, 0.2, -16); r.add(lair);
    const hp = makeHarapekon(); hp.g.scale.setScalar(1.2); hp.g.position.set(-5, 2.6, -15); r.add(hp.g); this.hara = hp;
    // nodes
    this.nodes = NODE_POS.map(([x, z], i) => {
      const g = new THREE.Group(); g.position.set(x, 0.3, z); r.add(g);
      const pad = mesh(G.cyl(1.3, 1.4, 0.25, 16), WORLD_COL[i], false, true); pad.position.y = 0.12; g.add(pad);
      const ring = mesh(G.cyl(1.05, 1.05, 0.27, 16), 0xffffff, false); ring.position.y = 0.13; g.add(ring);
      g.add(at(mesh(G.cyl(0.05, 0.05, 2.2, 6), 0x5a4a3a), 0.8, 1.1, -0.5));
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), new THREE.MeshBasicMaterial({ map: signTex(LEVELS[i].id, '#ffffff', '#2a1a12', 160, 100), side: THREE.DoubleSide }));
      fl.position.set(1.36, 1.85, -0.5); g.add(fl);
      const stars = []; for (let s = 0; s < 3; s++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTex('⭐'), color: 0x777777, depthTest: true })); sp.scale.set(0.55, 0.55, 0.55); sp.position.set((s - 1) * 0.6, 0.95 + (s === 1 ? 0.15 : 0), 0.4); g.add(sp); stars.push(sp); }
      const lock = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTex('🔒') })); lock.scale.set(0.8, 0.8, 0.8); lock.position.set(0, 1.0, 0.3); g.add(lock);
      const ic = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTex(RECIPES[LEVELS[i].recipes[0]].ic) })); ic.scale.set(1, 1, 1); ic.position.set(0, 1.9, 0); g.add(ic);
      return { g, stars, lock, ic, pad, x, z };
    });
    this.bus = makeBus(); r.add(this.bus);
    this.dog = makeDog(); r.add(this.dog.g);
  },
  unlocked(i) { return i === 0 || (Save.d.stars[LEVELS[i - 1].id] || 0) >= 1; },
  refresh() {
    let tot = 0;
    this.nodes.forEach((n, i) => {
      const st = Save.d.stars[LEVELS[i].id] || 0; tot += st; const un = this.unlocked(i);
      n.stars.forEach((s, k) => { s.material.color.setHex(k < st ? 0xffffff : 0x555555); s.visible = un; });
      n.lock.visible = !un; n.ic.visible = un;
      n.pad.material = M(un ? WORLD_COL[i] : 0x9a9a9a);
    });
    $('#starTotal').textContent = '★ ' + tot + ' / ' + LEVELS.length * 3;
  },
  enter(focus) {
    this.build(); this.refresh();
    APP.mode = 'map'; setView('map');
    scene.background.setHex(0x9fdcff); hemi.intensity = 0.8;
    $('#mapUI').classList.remove('hide'); $('#stage').classList.add('hide');
    if (isTouch) { $('#tc').classList.remove('hide'); $('#tc').classList.add('maponly'); }
    if (focus != null) { const n = this.nodes[focus]; this.x = n.x + 1.6; this.z = n.z + 1.8; this.h = Math.PI + 0.7; }
    this.near = -2; this.v = 0;
    aimSun(this.x, this.z);
    camera.fov = VW < VH ? 55 : 40; camera.updateProjectionMatrix();
    camera.position.set(this.x, 13, this.z + 10);
    Music.play('map');
  },
  leave() { $('#mapUI').classList.add('hide'); $('#tc').classList.add('hide'); $('#tc').classList.remove('maponly'); },
  update(dt) {
    this.t += dt;
    const c = this.ctl; c.poll();
    const m = Math.hypot(c.x, c.y);
    if (m > 0.15) { this.h = dampAng(this.h, Math.atan2(c.x, c.y), 6, dt); this.v = damp(this.v, 7.5 * m, 3, dt); }
    else this.v = damp(this.v, 0, 5, dt);
    this.x += Math.sin(this.h) * this.v * dt; this.z += Math.cos(this.h) * this.v * dt;
    const d = Math.hypot(this.x, this.z); if (d > 21.5) { this.x *= 21.5 / d; this.z *= 21.5 / d; }
    this.bus.position.set(this.x, 0.3 + Math.abs(Math.sin(this.t * 14)) * 0.03 * Math.min(1, this.v), this.z);
    this.bus.rotation.y = this.h; this.bus.rotation.z = Math.sin(this.t * 9) * 0.01 * this.v;
    const dg = this.dog.g; const bx = this.x - Math.sin(this.h) * 1.9 + Math.cos(this.h) * 0.9, bz = this.z - Math.cos(this.h) * 1.9 - Math.sin(this.h) * 0.9;
    dg.position.x = damp(dg.position.x, bx, 4, dt); dg.position.z = damp(dg.position.z, bz, 4, dt); dg.position.y = 0.3; dg.rotation.y = this.h;
    animDog(this.dog, dt, this.v > 0.5);
    if (this.lava) this.lava.material.color.setHSL(0.05, 1, 0.5 + Math.sin(this.t * 3) * 0.08);
    animHarapekon(this.hara, {}, dt);
    if (this.ship) this.ship.rotation.z = Math.sin(this.t * 0.8) * 0.06;
    this.nodes.forEach((n, i) => { n.ic.position.y = 1.9 + Math.sin(this.t * 2 + i) * 0.12; });
    // nearest node
    let near = -1, bd = 2.6;
    this.nodes.forEach((n, i) => { const dd = Math.hypot(n.x - this.x, n.z - this.z); if (dd < bd) { bd = dd; near = i; } });
    if (near !== this.near) { this.near = near; this.showCard(near); if (near >= 0) Sound.sfx('honk'); }
    if (near >= 0 && c.pressed.pick && this.unlocked(near)) { Sound.sfx('click'); Game.openIntro(near); }
    // camera
    const tgt = new V3(this.x, 13, this.z + 10);
    camera.position.lerp(tgt, 1 - Math.exp(-3 * dt)); camera.lookAt(camera.position.x, 0, camera.position.z - 7.5);
    aimSun(camera.position.x, camera.position.z - 10);
  },
  showCard(i) {
    const el = $('#stage');
    if (i < 0) { el.classList.add('hide'); $('#mapHelp').classList.remove('hide'); return; }
    $('#mapHelp').classList.add('hide');
    const L = LEVELS[i], st = Save.d.stars[L.id] || 0, best = Save.d.best[L.id] || 0, un = this.unlocked(i);
    el.innerHTML = `<div class="no">ステージ ${L.id}</div><div class="nm">${L.name}</div>`
      + (un ? `<div class="st">${[0, 1, 2].map(k => k < st ? '<b>★</b>' : '★').join('')}</div>`
        + `<div class="rc">${L.recipes.map(r => `<img src="${iconURL(RECIPES[r].ic)}" alt="${RECIPES[r].n}">`).join('')}</div>`
        + (best ? `<div style="font-size:14px;margin-bottom:8px">ベスト ${best}てん</div>` : '')
        + `<button class="btn red" id="stGo">▶ スタート${isTouch ? '' : '（スペース）'}</button>`
        : `<div class="lock">🔒 まえの ステージで ★を 1こ いじょう とってね</div>`);
    el.classList.remove('hide');
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    const b = $('#stGo'); if (b) b.onclick = () => { Sound.unlock(); Sound.sfx('click'); Game.openIntro(i); };
  },
};
