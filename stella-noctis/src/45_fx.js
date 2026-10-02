// ================================================================ effects
const FX = (() => {
  let scene = null; const list = [];
  const trailMatCache = {};
  const ringTex = canTex(128, 128, (x) => { x.translate(64, 64); const g = x.createRadialGradient(0, 0, 40, 0, 0, 62); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.75, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 64, 0, TAU); x.fill(); });
  const starTex = canTex(64, 64, (x) => { x.translate(32, 32); x.fillStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 8; x.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? 6 : 30; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.fill(); });
  const trailTex = canTex(64, 8, (x) => { const g = x.createLinearGradient(0, 0, 64, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = g; x.fillRect(0, 0, 64, 8); });
  function add(o) { list.push(o); return o; }
  function addMesh(m) { scene.add(m); return m; }
  const spriteMat = (tex, color, add = true) => new THREE.SpriteMaterial({ map: tex, color, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending });
  // generic particle
  function particle(pos, o) {
    const s = new THREE.Sprite(spriteMat(o.tex || glowTex, o.color || 0xffffff, o.add !== false));
    s.position.copy(pos); s.scale.setScalar(o.size || 0.5); addMesh(s);
    return add({ obj: s, vel: o.vel ? o.vel.clone() : new V3(), g: o.g || 0, life: o.life || 0.5, t: 0, size: o.size || 0.5, grow: o.grow || 0, drag: o.drag || 0, spin: o.spin || 0, fade: o.fade !== false });
  }
  function spark(pos, color = 0xffffff, n = 10, sp = 8, size = 0.35) {
    for (let i = 0; i < n; i++) {
      const v = new V3(rnd(-1, 1), rnd(-0.3, 1), rnd(-1, 1)).normalize().multiplyScalar(rnd(sp * 0.4, sp));
      particle(pos, { color, vel: v, life: rnd(0.18, 0.35), size: size * rnd(0.6, 1.2), drag: 6 });
    }
    particle(pos, { color: 0xffffff, size: 1.6, life: 0.12, grow: 6 });
    particle(pos, { tex: starTex, color, size: 1.2, life: 0.16, grow: 4, spin: 6 });
  }
  function ring(pos, color = 0x9ad8ff, r = 3, dur = 0.4, y = 0.08) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: ringTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    m.position.set(pos.x, (pos.y || 0) + y, pos.z); addMesh(m);
    return add({ obj: m, life: dur, t: 0, ring: r });
  }
  function shock(pos, color, r = 4, dur = 0.5) { ring(pos, color, r, dur); ring(pos, 0xffffff, r * 0.6, dur * 0.7); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; particle(new V3(pos.x, (pos.y || 0) + 0.2, pos.z), { color, vel: new V3(Math.cos(a) * 9, rnd(1, 4), Math.sin(a) * 9), life: 0.35, size: 0.6, drag: 4 }); } }
  // sword trail ribbon
  function trail(getTip, getBase, color = 0x9ad8ff, len = 14) {
    const N = len, pos = new Float32Array(N * 2 * 3), uv = new Float32Array(N * 2 * 2), idx = [];
    for (let i = 0; i < N - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    for (let i = 0; i < N; i++) { uv[i * 4] = i / (N - 1); uv[i * 4 + 1] = 0; uv[i * 4 + 2] = i / (N - 1); uv[i * 4 + 3] = 1; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: trailTex, color, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    m.frustumCulled = false; addMesh(m);
    const pts = []; const tv = new V3(), bv = new V3();
    const o = add({ obj: m, life: 1e9, t: 0, trail: 1, on: true, fadeT: 0, color, reset() { pts.length = 0; }, upd() {
      if (o.on && !o.wasOn) pts.length = 0;
      o.wasOn = o.on;
      if (o.on) { getTip(tv); getBase(bv); pts.unshift([tv.clone(), bv.clone()]); } else if (pts.length) pts.splice(-2, 2);
      if (pts.length > N) pts.length = N;
      const L = pts.length;
      for (let i = 0; i < N; i++) { const p = pts[Math.min(i, L - 1)]; if (!p) { pos.fill(0); break; } const k = i * 6; pos[k] = p[0].x; pos[k + 1] = p[0].y; pos[k + 2] = p[0].z; pos[k + 3] = p[1].x; pos[k + 4] = p[1].y; pos[k + 5] = p[1].z; }
      g.attributes.position.needsUpdate = true; m.visible = L > 1;
    } });
    return o;
  }
  // magic circle on ground
  function circle(pos, color = 0x9ad8ff, r = 1.6) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: TEX.circle, color, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.position.set(pos.x, (pos.y || 0) + 0.06, pos.z); m.scale.setScalar(0.01); addMesh(m);
    const gl = glowSprite(color, r * 1.5); gl.position.set(pos.x, (pos.y || 0) + 0.3, pos.z); addMesh(gl); gl.material.opacity = 0.35;
    const o = add({ obj: m, life: 1e9, t: 0, circ: r, extra: gl, upd(dt) { m.rotation.y += dt * 1.2; const s = Math.min(1, o.t * 5) * r; m.scale.setScalar(s); } });
    o.end = () => { o.life = o.t + 0.25; o.fadeOut = 1; };
    return o;
  }
  function pillar(pos, color = 0xfff0a0, h = 10, r = 1.2, dur = 0.8) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    m.position.set(pos.x, (pos.y || 0) + h / 2, pos.z); addMesh(m);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.35, r * 0.35, h, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.add(core);
    return add({ obj: m, life: dur, t: 0, pillar: 1 });
  }
  function bolt(from, to, color = 0xcfe8ff, w = 0.15) {
    const pts = []; const n = 10;
    for (let i = 0; i <= n; i++) { const p = from.clone().lerp(to, i / n); if (i && i < n) p.add(new V3(rnd(-.6, .6), rnd(-.3, .3), rnd(-.6, .6))); pts.push(p); }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, w, 4, false);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    addMesh(m); return add({ obj: m, life: 0.18, t: 0 });
  }
  function spikes(pos, color, n = 7, r = 2.2, h = 2.4, dur = 0.9, geo) {
    const g = new THREE.Group(); g.position.set(pos.x, pos.y || 0, pos.z); addMesh(g);
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + rnd(-.3, .3), d = i === 0 ? 0 : rnd(0.6, r);
      const c = mk(geo || new THREE.ConeGeometry(0.35, 1, 5).translate(0, 0.5, 0), 0, 0.02, new THREE.MeshToonMaterial({ color, gradientMap: gradTex, emissive: color, emissiveIntensity: 0.35, transparent: true }));
      c.position.set(Math.cos(a) * d, -h, Math.sin(a) * d); c.scale.set(1, h * rnd(0.7, 1.3) * (i === 0 ? 1.5 : 1), 1); c.rotation.set(rnd(-.3, .3), 0, rnd(-.3, .3)); g.add(c);
    }
    return add({ obj: g, life: dur, t: 0, upd(dt) { const t = this.t; g.children.forEach((c, i) => { c.position.y = t < 0.12 ? lerp(-h * 1.5, 0, t / 0.12) : t > dur - 0.2 ? lerp(0, -h * 1.5, (t - dur + 0.2) / 0.2) : 0; }); } });
  }
  // crescent shockwave mesh (for 蒼閃刃)
  function waveMesh(color = 0x8ad0ff, s = 1) {
    const g = new THREE.Group();
    const shape = new THREE.Shape(); shape.absarc(0, 0, 1.0, 0, Math.PI, false); shape.absarc(0, -0.35, 0.82, Math.PI, 0, true);
    const geo = new THREE.ShapeGeometry(shape, 16);
    const m1 = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    m1.scale.set(1.1 * s, 1.3 * s, 1); g.add(m1);
    const m2 = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    m2.scale.set(0.8 * s, 0.9 * s, 1); m2.position.z = 0.05; g.add(m2);
    const gl = glowSprite(color, 3 * s); gl.position.y = 0.5 * s; g.add(gl);
    addMesh(g); return g;
  }
  function orb(color, size) { const g = new THREE.Group(); const c = new THREE.Mesh(G.sph(size * 0.35, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); g.add(c); const s = glowSprite(color, size * 2.2); g.add(s); addMesh(g); return g; }
  function remove(o) { o.life = -1; }
  function update(dt) {
    for (let i = list.length - 1; i >= 0; i--) {
      const o = list[i]; o.t += dt;
      if (o.upd) o.upd(dt);
      if (o.vel) { o.obj.position.addScaledVector(o.vel, dt); o.vel.y -= o.g * dt; if (o.drag) o.vel.multiplyScalar(Math.exp(-o.drag * dt)); }
      const k = clamp(o.t / o.life, 0, 1);
      if (o.size != null && o.obj.isSprite) { o.obj.scale.setScalar(o.size * (1 + o.grow * k)); if (o.fade) o.obj.material.opacity = 1 - k; if (o.spin) o.obj.material.rotation += o.spin * dt; }
      if (o.ring) { const s = o.ring * 2 * easeOut(k); o.obj.scale.set(s, 1, s); o.obj.material.opacity = 1 - k; }
      if (o.pillar) { o.obj.scale.x = o.obj.scale.z = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85 * 0.9; o.obj.material.opacity = 0.7 * (1 - k); }
      if (o.fadeOut) { const f = clamp((o.life - o.t) / 0.25, 0, 1); o.obj.material.opacity = 0.9 * f; if (o.extra) o.extra.material.opacity = 0.35 * f; }
      if (o.t >= o.life || o.life < 0) {
        scene && o.obj.parent && o.obj.parent.remove(o.obj); if (o.extra && o.extra.parent) o.extra.parent.remove(o.extra);
        o.obj.traverse && o.obj.traverse(c => { if (c.geometry && c.geometry !== GEO.blob) { if (!c.geometry.__keep) c.geometry.dispose(); } if (c.material && c.material.dispose && c.material.map !== TEX.circle && !c.material.isMeshToonMaterial && !c.material.isShaderMaterial) c.material.dispose(); });
        list.splice(i, 1);
      }
    }
  }
  function clear() { for (const o of list) { o.obj.parent && o.obj.parent.remove(o.obj); if (o.extra && o.extra.parent) o.extra.parent.remove(o.extra); } list.length = 0; }
  return { init(s) { scene = s; }, spark, ring, shock, particle, trail, circle, pillar, bolt, spikes, waveMesh, orb, remove, update, clear, starTex, add, get scene() { return scene; } };
})();

// ---------------------------------------------------------------- floating damage numbers (DOM)
const DMG = (() => {
  const host = $('#dmg'); const items = []; const v = new V3();
  function add(text, pos, cls = '', life = 0.9) {
    const d = document.createElement('div'); d.textContent = text; if (cls) d.className = cls;
    host.appendChild(d);
    items.push({ d, p: pos.clone().add(new V3(rnd(-.3, .3), 0, rnd(-.3, .3))), t: 0, life, vy: 1.6 });
  }
  function update(dt, cam) {
    const w = innerWidth, h = innerHeight;
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i]; it.t += dt; it.p.y += it.vy * dt; it.vy *= Math.exp(-3 * dt);
      v.copy(it.p).project(cam);
      if (v.z > 1) { it.d.style.display = 'none'; } else { it.d.style.display = ''; it.d.style.left = ((v.x + 1) / 2 * w) + 'px'; it.d.style.top = ((1 - v.y) / 2 * h) + 'px'; }
      const k = it.t / it.life; it.d.style.opacity = k > 0.7 ? (1 - (k - 0.7) / 0.3) : 1;
      if (it.t < 0.1) it.d.style.transform = `translate(-50%,-50%) scale(${1.6 - it.t * 6})`; else it.d.style.transform = 'translate(-50%,-50%)';
      if (it.t > it.life) { it.d.remove(); items.splice(i, 1); }
    }
  }
  function clear() { for (const it of items) it.d.remove(); items.length = 0; }
  return { add, update, clear };
})();
