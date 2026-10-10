// ================================================================ camera, floors, walls, light moods, view cones
const View = {
  yawI: 0, yaw: 0, pitch: 0.9, dist: 34, distT: 34, target: new V3(3, 0.5, 0), targetT: new V3(3, 0.5, 0),
  floorMode: 1, f2y: 30, f2yT: 30, f2back: 0, f2backT: 0, xray: 0, xrayT: 0, moved: true,
  setYaw(i) { this.yawI = ((i % 4) + 4) % 4; this.applyWalls(); },
  camDir() { return new V3(Math.sin(this.yaw), 0, Math.cos(this.yaw)); },
  applyWalls() {
    const a = this.yawI * Math.PI / 2; const cx = Math.sin(a), cz = Math.cos(a);
    for (const w of WALLS) { const hide = w.n && (w.n[0] * cx + w.n[1] * cz) > 0.5; for (const m of w.meshes || []) m.visible = !hide; }
    for (const f of FENCES) { const n = f.userData.n; f.visible = !((n[0] * cx + n[1] * cz) > 0.5); }
    // doors on hidden outer walls (entrance)
    for (const [id, d] of Object.entries(DOORS)) if (d.mesh && d.ext) { d.mesh.visible = !(d.axis === 'x' && (d.c < 0 ? -cx : cx) > 0.5); }
  },
  setFloor(m, instant) {
    this.floorMode = m;
    const unlocked2 = World.rooms && World.rooms.some(r => ROOMS[r].floor === 2);
    if (m === 1) { this.f2yT = 9; this.f2backT = 0; this.targetT.set(World.rooms && World.rooms.includes('garden') ? 4.5 : 0.5, 0.6, 0); this.distT = World.rooms && World.rooms.includes('garden') ? 36 : 30; }
    else if (m === 2) { this.f2yT = FLOOR_Y[2]; this.f2backT = 0; this.targetT.set(0, 3.4, 0); this.distT = 31; }
    else { this.f2yT = FLOOR_Y[2] + 1.4; this.f2backT = 12.5; this.targetT.set(2, 2.6, 0); this.distT = 46; }
    if (instant) { this.f2y = this.f2yT; this.f2back = this.f2backT; this.target.copy(this.targetT); this.dist = this.distT; }
    $$('#flr button').forEach(b => b.classList.toggle('on', +b.dataset.f === m));
    this.moved = true;
  },
  zoomRoom(room) {
    const r = ROOMS[room]; if (!r) return;
    if (r.floor === 2 && this.floorMode === 1) this.setFloor(2);
    const c = roomCenter(room); const p = new V3(c.x, 0.6, c.z); FG[r.floor].localToWorld(p);
    this.targetT.copy(p); this.distT = 17;
  },
  update(dt) {
    const ty = this.yawI * Math.PI / 2;
    const prevYaw = this.yaw; this.yaw = dampAng(this.yaw, ty, 7, dt);
    this.dist = damp(this.dist, this.distT, 6, dt);
    this.target.lerp(this.targetT, 1 - Math.exp(-6 * dt));
    const py = this.f2y, pb = this.f2back;
    this.f2y = damp(this.f2y, this.f2yT, 6, dt); this.f2back = damp(this.f2back, this.f2backT, 6, dt);
    const back = new V3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    FG[2].position.set(back.x * this.f2back, this.f2y, back.z * this.f2back);
    FG[2].visible = this.f2y < 8.5;
    FG[1].visible = true;
    this.moved = this.moved || Math.abs(py - this.f2y) > 1e-4 || Math.abs(pb - this.f2back) > 1e-4 || Math.abs(prevYaw - this.yaw) > 1e-4;
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const ak = clamp(1.45 / (VW / VH), 1, 2.6), D = this.dist * ak;
    camera.position.set(this.target.x + Math.sin(this.yaw) * cp * D, this.target.y + sp * D, this.target.z + Math.cos(this.yaw) * cp * D);
    camera.lookAt(this.target);
    // x-ray
    this.xray = damp(this.xray, this.xrayT, 10, dt);
    const op = 1 - this.xray * 0.82;
    for (const m of WALL_MATS) { m.transparent = op < 0.99; m.opacity = op; m.depthWrite = op > 0.99; }
    // shadow camera follows the target
    sun.target.position.set(this.target.x, 0, this.target.z);
  },
};

// ---------------------------------------------------------------- light moods
const MOODS = {
  morning: { sky: 0xe4f2ff, gnd: 0xa8b4c8, hi: 1.0, sun: 0xfff6e8, si: 1.25, dir: [-6, 16, 10], exp: 1.05, bg: ['#bfe2ff', '#f2f8ff'], lamp: 0 },
  prep: { sky: 0xf4f2f0, gnd: 0xb8b0a8, hi: 1.05, sun: 0xffffff, si: 0.95, dir: [-4, 18, 8], exp: 1.02, bg: ['#ddd8e8', '#f6f2ec'], lamp: 0 },
  chain: { sky: 0xffdcb8, gnd: 0x6a5a70, hi: 0.78, sun: 0xffa868, si: 1.45, dir: [14, 9, 6], exp: 1.08, bg: ['#f4b088', '#7a6aa8'], lamp: 1 },
  search: { sky: 0x8a80b8, gnd: 0x2a2440, hi: 0.5, sun: 0xa8a0e0, si: 0.55, dir: [10, 12, 6], exp: 1.0, bg: ['#4a3e70', '#1e1a34'], lamp: 0.8 },
  night: { sky: 0x5a6aa8, gnd: 0x2a2440, hi: 0.55, sun: 0x8a9ae0, si: 0.35, dir: [-6, 14, 8], exp: 1.05, bg: ['#262a5a', '#14122a'], lamp: 1.2 },
};
const Mood = (() => {
  const cur = { sky: new THREE.Color(0xffffff), gnd: new THREE.Color(0x888888), hi: 1, sun: new THREE.Color(0xffffff), si: 1, dir: new V3(-4, 16, 8), exp: 1, lamp: 0 };
  let tgt = MOODS.prep, name = '';
  const lights = [];
  function makeLights() {
    // warm room lights (no shadows)
    const spots = [[1, -4.5, 2.7], [1, 3.8, 3.2], [1, 4.2, -2.6], [1, -4.5, -2.4], [2, -4.0, 2.7], [2, 4.2, 2.8], [2, 4.4, -2.6], [2, -3.6, -2.2]];
    for (const [f, x, z] of spots) { const l = new THREE.PointLight(0xffc887, 0, 9, 1.6); l.position.set(x, 2.1, z); FG[f].add(l); lights.push(l); }
  }
  return {
    get name() { return name; },
    set(n, instant) {
      name = n; tgt = MOODS[n];
      document.body.style.transition = instant ? 'none' : 'background 1.5s';
      document.body.style.background = `linear-gradient(${tgt.bg[0]}, ${tgt.bg[1]})`;
      if (instant) { cur.sky.setHex(tgt.sky); cur.gnd.setHex(tgt.gnd); cur.hi = tgt.hi; cur.sun.setHex(tgt.sun); cur.si = tgt.si; cur.dir.set(...tgt.dir); cur.exp = tgt.exp; cur.lamp = tgt.lamp; }
    },
    update(dt) {
      if (!lights.length) makeLights();
      const k = 1 - Math.exp(-dt * 1.6);
      cur.sky.lerp(new THREE.Color(tgt.sky), k); cur.gnd.lerp(new THREE.Color(tgt.gnd), k); cur.sun.lerp(new THREE.Color(tgt.sun), k);
      cur.hi = lerp(cur.hi, tgt.hi, k); cur.si = lerp(cur.si, tgt.si, k); cur.exp = lerp(cur.exp, tgt.exp, k); cur.lamp = lerp(cur.lamp, tgt.lamp, k);
      cur.dir.lerp(new V3(...tgt.dir), k);
      hemi.color.copy(cur.sky); hemi.groundColor.copy(cur.gnd); hemi.intensity = cur.hi;
      sun.color.copy(cur.sun); sun.intensity = cur.si; sun.position.copy(sun.target.position).add(cur.dir);
      renderer.toneMappingExposure = cur.exp;
      lights.forEach((l, i) => { l.intensity = cur.lamp * (i === 7 ? (World.hallLit ? 1.4 : 0.15) : 1.1); l.visible = cur.lamp > 0.02 && FG[i < 4 ? 1 : 2].visible; });
      for (const s of LAMPS) { s.material.emissive.setHex(0xffd890); s.material.emissiveIntensity = cur.lamp * 0.8; }
      for (const b of BULBS) b.visible = cur.lamp > 0.3;
    },
  };
})();
World.hallLight = on => { World.hallLit = on; };

// dust motes for the quiet "prep" time
const Dust = (() => {
  const n = 160, geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), seed = [];
  for (let i = 0; i < n; i++) { pos[i * 3] = rnd(-8, 9); pos[i * 3 + 1] = rnd(0.3, 2.6); pos[i * 3 + 2] = rnd(-5, 5.5); seed.push(Math.random() * 10); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ map: Parts.tex, color: 0xfff8e0, size: 0.09, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const pts = new THREE.Points(geo, mat); FG[1].add(pts);
  return {
    update(dt, on) {
      mat.opacity = damp(mat.opacity, on ? 0.75 : 0, 2, dt); pts.visible = mat.opacity > 0.01;
      if (!pts.visible) return; const t = performance.now() * 0.0003;
      for (let i = 0; i < n; i++) { pos[i * 3 + 1] += Math.sin(t * 3 + seed[i]) * 0.002; pos[i * 3] += Math.cos(t * 2 + seed[i]) * 0.002; }
      geo.attributes.position.needsUpdate = true;
    },
  };
})();
// rain (day 3)
const Rain = (() => {
  const n = 500, geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = rnd(-9, 18); pos[i * 3 + 1] = rnd(0, 9); pos[i * 3 + 2] = rnd(-6, 7); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xbfd8f0, size: 0.06, transparent: true, opacity: 0.0, depthWrite: false });
  const pts = new THREE.Points(geo, mat); FG[1].add(pts);
  return {
    update(dt, on) {
      mat.opacity = damp(mat.opacity, on ? 0.7 : 0, 2, dt); pts.visible = mat.opacity > 0.01; if (!pts.visible) return;
      for (let i = 0; i < n; i++) {
        pos[i * 3 + 1] -= dt * 14; if (pos[i * 3 + 1] < 0) { pos[i * 3 + 1] = 9; }
        const x = pos[i * 3], z = pos[i * 3 + 2];
        if (x > -8 && x < 8 && z > -5.5 && z < 5.5) pos[i * 3 + 1] = Math.min(pos[i * 3 + 1], 8.9) && pos[i * 3 + 1] < 6.5 ? 9 : pos[i * 3 + 1];
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
})();

// ---------------------------------------------------------------- family view cones (visibility polygons on the floor)
const Cones = (() => {
  const items = {}; let t = 0;
  function mk() { const geo = new THREE.BufferGeometry(); const pos = new Float32Array(42 * 3); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const idx = []; for (let i = 1; i < 41; i++) idx.push(0, i, i + 1); geo.setIndex(idx); const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }); const m = new THREE.Mesh(geo, mat); m.renderOrder = 2; return m; }
  function ray(f, x, z, dx, dz, max) {
    let best = max; const L = LOS[f];
    for (const s of L) {
      const ex = s[2] - s[0], ez = s[3] - s[1];
      const den = dx * ez - dz * ex; if (Math.abs(den) < 1e-9) continue;
      const tt = ((s[0] - x) * ez - (s[1] - z) * ex) / den, u = ((s[0] - x) * dz - (s[1] - z) * dx) / den;
      if (tt > 0 && tt < best && u >= 0 && u <= 1) best = tt;
    }
    return best;
  }
  return {
    update(dt) {
      t += dt; const show = Save.d.cone && (World.phase === 'chain') && !World.blind;
      for (const id of FAMILY) {
        const a = AG[id]; let c = items[id]; if (!c) { c = items[id] = mk(); }
        const vis = show && a.home && !a.asleep && !a.hidden && FG[a.floor].visible;
        if (c.parent !== AG_ROOT[a.floor]) AG_ROOT[a.floor].add(c);
        c.visible = vis; if (!vis) continue;
        const col = a.mode === 'search' ? 0xff4a3a : a.susp > 60 ? 0xffa040 : 0xffffff;
        c.material.color.setHex(col); c.material.opacity = a.mode === 'search' ? 0.2 : 0.1 + a.susp / 100 * 0.06;
        if (t < 0.1 && c.userData.done) continue;
        c.userData.done = 1;
        const pos = c.geometry.attributes.position; const fov = (a.fov || 120) * Math.PI / 180, R = 8.5;
        pos.setXYZ(0, a.pos.x, 0.05, a.pos.z);
        for (let i = 0; i <= 40; i++) {
          const ang = a.yaw - fov / 2 + fov * i / 40; const dx = Math.sin(ang), dz = Math.cos(ang);
          const d = ray(a.floor, a.pos.x, a.pos.z, dx, dz, R);
          pos.setXYZ(i + 1, a.pos.x + dx * d, 0.05, a.pos.z + dz * d);
        }
        pos.needsUpdate = true; c.geometry.computeBoundingSphere();
      }
      if (t >= 0.1) t = 0;
    },
  };
})();
// search lights: phone camera / flashlight cones + dark halo
const SearchFX = (() => {
  const fx = {};
  function mk(col) {
    const g = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 20, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    cone.rotation.x = -Math.PI / 2; g.add(cone); g.userData.cone = cone;
    const halo = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), new THREE.MeshBasicMaterial({ color: 0x0a0614, transparent: true, opacity: 0.35, depthWrite: false })); halo.rotation.x = -Math.PI / 2; g.userData.halo = halo;
    return g;
  }
  return {
    update() {
      for (const id of FAMILY) {
        const a = AG[id]; let f = fx[id]; if (!f) { f = fx[id] = mk(id === 'sota' ? 0xfff0a0 : 0xa0d0ff); }
        const on = a.home && a.mode === 'search' && World.phase === 'chain';
        if (f.userData.halo.parent !== a.mesh) a.mesh.add(f.userData.halo);
        f.userData.halo.visible = on; f.userData.halo.position.y = 0.03;
        const beam = on && (a.style === 'camera' || a.style === 'light');
        if (f.parent !== a.mesh) a.mesh.add(f);
        f.visible = beam; if (!beam) continue;
        const R = a.style === 'camera' ? 7.5 : 6.0, ang = (a.style === 'camera' ? 23 : 29) * Math.PI / 180;
        const c = f.userData.cone; c.scale.set(Math.tan(ang) * R, R, Math.tan(ang) * R); c.position.set(0, 0, R / 2);
        f.position.set(0, a.H * 0.62, 0.3); f.rotation.x = 0.12;
      }
    },
  };
})();
