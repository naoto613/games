// ================================================================ particles
class Particles {
  constructor(max, additive) {
    this.max = max; this.n = 0;
    this.p = new Float32Array(max * 3); this.v = new Float32Array(max * 3); this.c = new Float32Array(max * 4); this.sz = new Float32Array(max);
    this.life = new Float32Array(max); this.age = new Float32Array(max); this.grav = new Float32Array(max); this.grow = new Float32Array(max); this.drag = new Float32Array(max); this.a0 = new Float32Array(max); this.kind = new Uint8Array(max);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.p, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aCol', new THREE.BufferAttribute(this.c, 4).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.sz, 1).setUsage(THREE.DynamicDrawUsage));
    this.mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: TX.dot }, uScale: { value: 500 } },
      vertexShader: 'attribute float aSize; attribute vec4 aCol; varying vec4 vCol; uniform float uScale; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = aSize * uScale / max(0.1,-mv.z); gl_Position = projectionMatrix * mv; vCol = aCol; }',
      fragmentShader: 'uniform sampler2D map; varying vec4 vCol; void main(){ float a = texture2D(map, gl_PointCoord).a * vCol.a; if (a < 0.01) discard; gl_FragColor = vec4(vCol.rgb, a); }',
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    this.pts = new THREE.Points(g, this.mat); this.pts.frustumCulled = false; this.pts.renderOrder = 5;
    scene.add(this.pts);
  }
  emit(x, y, z, vx, vy, vz, size, r, g, b, a, life, grav, grow, drag, kind) {
    if (this.n >= this.max) return;
    const i = this.n++;
    this.p[i * 3] = x; this.p[i * 3 + 1] = y; this.p[i * 3 + 2] = z;
    this.v[i * 3] = vx; this.v[i * 3 + 1] = vy; this.v[i * 3 + 2] = vz;
    this.c[i * 4] = r; this.c[i * 4 + 1] = g; this.c[i * 4 + 2] = b; this.c[i * 4 + 3] = a; this.a0[i] = a;
    this.sz[i] = size; this.life[i] = life; this.age[i] = 0; this.grav[i] = grav || 0; this.grow[i] = grow || 0; this.drag[i] = drag || 0; this.kind[i] = kind || 0;
  }
  update(dt) {
    let i = 0;
    while (i < this.n) {
      this.age[i] += dt;
      if (this.age[i] >= this.life[i]) { this.kill(i); continue; }
      const k = i * 3, dg = Math.exp(-this.drag[i] * dt);
      this.v[k + 1] -= this.grav[i] * dt; this.v[k] *= dg; this.v[k + 1] *= dg; this.v[k + 2] *= dg;
      this.p[k] += this.v[k] * dt; this.p[k + 1] += this.v[k + 1] * dt; this.p[k + 2] += this.v[k + 2] * dt;
      if (this.p[k + 1] < 0.05 && this.grav[i] > 0) {
        if (this.kind[i] === 1) { this.p[k + 1] = 0.05; this.v[k] *= 0.2; this.v[k + 2] *= 0.2; this.v[k + 1] = 0; this.age[i] = Math.max(this.age[i], this.life[i] - 0.25); }
        else { this.p[k + 1] = 0.05; this.v[k + 1] *= -0.3; }
      }
      this.sz[i] += this.grow[i] * dt;
      const t = this.age[i] / this.life[i];
      this.c[i * 4 + 3] = this.a0[i] * (t < 0.1 ? t / 0.1 : 1 - (t - 0.1) / 0.9);
      i++;
    }
    const g = this.pts.geometry;
    g.setDrawRange(0, this.n);
    g.attributes.position.needsUpdate = g.attributes.aCol.needsUpdate = g.attributes.aSize.needsUpdate = true;
    this.mat.uniforms.uScale.value = renderer.domElement.height * 0.5 / Math.tan(camera.fov * Math.PI / 360);
  }
  kill(i) {
    const j = --this.n; if (i === j) return;
    for (let a = 0; a < 3; a++) { this.p[i * 3 + a] = this.p[j * 3 + a]; this.v[i * 3 + a] = this.v[j * 3 + a]; }
    for (let a = 0; a < 4; a++) this.c[i * 4 + a] = this.c[j * 4 + a];
    this.sz[i] = this.sz[j]; this.life[i] = this.life[j]; this.age[i] = this.age[j]; this.grav[i] = this.grav[j]; this.grow[i] = this.grow[j]; this.drag[i] = this.drag[j]; this.a0[i] = this.a0[j]; this.kind[i] = this.kind[j];
  }
}
let FXN, FXA;
function initFX() { FXN = new Particles(2500, false); FXA = new Particles(1200, true); }
function fxSmoke(x, y, z, n, dark) { for (let k = 0; k < n; k++) FXN.emit(x + rr(-0.3, 0.3), y, z + rr(-0.3, 0.3), rr(-0.4, 0.4), rr(0.6, 1.4), rr(-0.4, 0.4), rr(0.6, 1.0), dark ? 0.25 : 0.82, dark ? 0.25 : 0.82, dark ? 0.27 : 0.84, dark ? 0.55 : 0.35, rr(1.2, 2.2), -0.2, 1.4, 0.8); }
function fxSpark(x, y, z, n, col) { const c = new THREE.Color(col || 0xffd040); for (let k = 0; k < n; k++) { const a = RND() * 6.28, s = rr(1, 4); FXA.emit(x, y, z, Math.cos(a) * s, rr(1, 5), Math.sin(a) * s, rr(0.15, 0.35), c.r, c.g, c.b, 1, rr(0.4, 0.9), 6, -0.1, 1); } }
function fxConfetti(x, y, z, n) { for (let k = 0; k < n; k++) { const c = new THREE.Color().setHSL(RND(), 0.85, 0.6); const a = RND() * 6.28, s = rr(1, 5); FXN.emit(x, y, z, Math.cos(a) * s, rr(4, 9), Math.sin(a) * s, rr(0.12, 0.22), c.r, c.g, c.b, 1, rr(1.4, 2.4), 7, 0, 1.5); } }
function fxWater(x, y, z, vx, vy, vz, n, spread) {
  for (let k = 0; k < n; k++) FXN.emit(x, y, z, vx + rr(-spread, spread), vy + rr(-spread, spread), vz + rr(-spread, spread), rr(0.18, 0.35), 0.85, 0.93, 1.0, 0.75, rr(1.0, 1.6), 9.8, 0.5, 0.2, 1);
}
function fxDust(x, z, n) { for (let k = 0; k < n; k++) FXN.emit(x + rr(-0.5, 0.5), 0.2, z + rr(-0.5, 0.5), rr(-1, 1), rr(0.2, 0.8), rr(-1, 1), rr(0.4, 0.8), 0.62, 0.58, 0.52, 0.35, rr(0.6, 1.2), 0, 1.6, 2); }

// ================================================================ breakable props physics
function knockProp(p, vx, vz, sp) {
  if (p.state === 1) return;
  p.state = 1; p.t = 0; p.col.off = true;
  p.vx = vx * rr(0.7, 1.1) + rr(-1.5, 1.5); p.vz = vz * rr(0.7, 1.1) + rr(-1.5, 1.5); p.vy = 2.5 + sp * 0.18;
  p.wx = rr(-8, 8); p.wz = rr(-8, 8); p.wy = rr(-4, 4);
  AU.bump(sp * 0.5);
  if (p.type === 'hyd') { p.spout = 14; AU.splash(); }
  if (p.type === 'box' || p.type === 'bin') fxDust(p.x, p.z, 4);
  GAME.onProp(p);
}
function nudgeProp(p, vx, vz) { if (p.state === 0 && (p.type === 'cone' || p.type === 'box')) knockProp(p, vx * 0.6, vz * 0.6, 1); }
function updateProps(dt) {
  for (const p of PROPS) {
    if (p.spout > 0) {
      p.spout -= dt;
      fxWater(p.ox, CURB + 0.6, p.oz, 0, rr(7, 9), 0, 3, 0.8);
      if (Math.random() < 0.02) AU.splash();
    }
    if (p.state === 0) continue;
    p.t += dt;
    if (p.state === 1) {
      p.vy -= 13 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      p.ry += p.wy * dt; p.rx += p.wx * dt; p.rz += p.wz * dt;
      const g = groundY(p.x, p.z);
      if (p.y <= g) {
        p.y = g; p.vy = -p.vy * 0.3; p.vx *= 0.6; p.vz *= 0.6; p.wx *= 0.5; p.wz *= 0.5; p.wy *= 0.5;
        if (Math.abs(p.vy) < 0.8) { p.vy = 0; p.state = 2; p.restT = 0; p.rx = Math.round(p.rx / (Math.PI / 2)) * Math.PI / 2; p.rz = Math.round(p.rz / (Math.PI / 2)) * Math.PI / 2; }
      }
      if (Math.abs(p.x) > EDGE - 0.5 || Math.abs(p.z) > EDGE - 0.5) { p.vx = -p.vx * 0.5; p.vz = -p.vz * 0.5; p.x = clamp(p.x, -EDGE + 0.6, EDGE - 0.6); p.z = clamp(p.z, -EDGE + 0.6, EDGE - 0.6); }
      setPropMatrix(p);
    } else if (p.state === 2) {
      p.restT += dt;
      if (p.restT > 25 && Math.hypot(p.ox - PLAYER.x, p.oz - PLAYER.z) > 45) {
        p.x = p.ox; p.z = p.oz; p.y = p.oy; p.rx = p.rz = 0; p.ry = p.ory; p.state = 0; p.col.off = false; setPropMatrix(p);
      }
    }
  }
}

// ================================================================ markers
function iconTex(emoji, ring) {
  return canvasTex(128, 128, (x, w, h) => {
    if (ring) { x.fillStyle = ring; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill(); x.lineWidth = 6; x.strokeStyle = '#fff'; x.stroke(); }
    x.font = '76px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(emoji, 64, 70);
  }, true, false);
}
const cylFadeTex = () => canvasTex(4, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,.75)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, false, false);
let _cylTex;
const MARKERS = [];
function makeMarker(x, z, opts) {
  opts = Object.assign({ color: 0xffd23f, r: 1.6, h: 2.2, icon: null, iconRing: null, blip: true, blipCol: '#ffd23f' }, opts);
  if (!_cylTex) _cylTex = cylFadeTex();
  const g = new THREE.Group();
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(opts.r, opts.r, opts.h, 32, 1, true), new THREE.MeshBasicMaterial({ color: opts.color, map: _cylTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false }));
  cyl.position.y = opts.h / 2;
  const ring = new THREE.Mesh(new THREE.RingGeometry(opts.r * 0.8, opts.r, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: opts.color, transparent: true, opacity: 0.7, depthWrite: false, toneMapped: false }));
  ring.position.y = 0.03;
  g.add(cyl, ring);
  if (opts.icon) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTex(opts.icon, opts.iconRing), depthWrite: false })); sp.scale.set(1.4, 1.4, 1); sp.position.y = opts.h + 1.2; g.add(sp); g.userData.sprite = sp;
  }
  g.position.set(x, groundY(x, z), z);
  scene.add(g);
  const m = Object.assign({ x, z, g, cyl, ring, alive: true }, opts);
  MARKERS.push(m);
  return m;
}
function killMarker(m) { if (!m) return; m.alive = false; scene.remove(m.g); const i = MARKERS.indexOf(m); if (i >= 0) MARKERS.splice(i, 1); }
function updateMarkers(dt, t) {
  for (const m of MARKERS) {
    m.cyl.material.opacity = 0.75 + Math.sin(t * 4) * 0.2;
    m.ring.scale.setScalar(1 + (t * 0.8 % 1) * 0.15);
    if (m.g.userData.sprite) m.g.userData.sprite.position.y = m.h + 1.2 + Math.sin(t * 2.5) * 0.15;
    m.g.visible = !m.hidden;
  }
}
function inMarker(m, r) { const o = PLAYER.veh || PLAYER; return Math.hypot(o.x - m.x, o.z - m.z) < (r || m.r + 0.3); }

// ================================================================ fires
const FIRES = [];
let _flameMat;
function makeFire(x, z, s) {
  if (!_flameMat) _flameMat = new THREE.SpriteMaterial({ map: TX.flame, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, color: 0xffffff });
  const g = new THREE.Group(), sprites = [];
  for (let k = 0; k < 5; k++) { const sp = new THREE.Sprite(_flameMat); sp.userData.o = [rr(-0.5, 0.5) * s, rr(-0.5, 0.5) * s, RND() * 6]; g.add(sp); sprites.push(sp); }
  // burnt bin / crate pile
  const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.45 * s, 0.5 * s, 0.6, 12), MAT_SIMPLE(0x2a2a2a, 0.9)); pile.position.y = 0.3; pile.castShadow = true; g.add(pile);
  const y = groundY(x, z); g.position.set(x, y, z); scene.add(g);
  const f = { x, z, y, s, g, sprites, hp: 1, alive: true };
  FIRES.push(f);
  return f;
}
function updateFires(dt, t) {
  for (const f of FIRES) {
    if (!f.alive) continue;
    const k = Math.max(0.15, f.hp);
    for (const sp of f.sprites) {
      const [ox, oz, ph] = sp.userData.o, fl = 0.85 + Math.sin(t * 9 + ph) * 0.15;
      sp.position.set(ox * k, 0.6 + 0.9 * k * f.s * fl, oz * k);
      sp.scale.set(1.3 * f.s * k * fl, 2.2 * f.s * k * fl, 1);
    }
    if (Math.random() < 0.5) fxSmoke(f.x, f.y + 1.5 * f.s * k, f.z, 1, true);
    if (Math.random() < 0.3) FXA.emit(f.x + rr(-0.4, 0.4), f.y + 0.6, f.z + rr(-0.4, 0.4), rr(-0.3, 0.3), rr(1.5, 3), rr(-0.3, 0.3), 0.12, 1, 0.6, 0.2, 1, 0.8, -1, 0, 0.5);
  }
}
function removeFire(f) { f.alive = false; scene.remove(f.g); fxSmoke(f.x, f.y + 1, f.z, 20, false); }

// ================================================================ hidden stars (collectibles)
const STARS = [];
function buildStars() {
  const shape = new THREE.Shape();
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 + Math.PI / 2, r = k % 2 ? 0.2 : 0.48; k ? shape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : shape.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2 }); geo.center();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffc81e, metalness: 0.9, roughness: 0.2, emissive: 0x6a4a00, emissiveIntensity: 0.6 });
  const spots = [];
  // gaps between buildings in downtown blocks and other nooks
  for (let j = 0; j < NB; j++) for (let i = 0; i < NB; i++) {
    const t = blockType(i, j), L = lotRect(i, j), c = blockCenter(i, j);
    if (t === 'D' || t === 'A') spots.push([c.x, c.z, 0.9]);
  }
  spots.push([SPOTS.pond.x - 12, SPOTS.pond.z + 2, 0.9], [SPOTS.fountain.x, SPOTS.fountain.z, 2.2], [SPOTS.tower.x, SPOTS.tower.z, 0.9]);
  // in the air above the jump park & park ramp (needs a jump)
  for (const r of RAMPS) spots.push([r.x + Math.sin(r.h) * (r.len / 2 + 9), r.z + Math.cos(r.h) * (r.len / 2 + 9), r.top + 2.6]);
  // promenade corners
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) spots.push([sx * (EDGE - 4), sz * (EDGE - 4), 0.9]);
  const save = GAME.save.stars || {};
  spots.forEach(([x, z, y], k) => {
    if (save[k]) return;
    const m = new THREE.Mesh(geo, mat); m.position.set(x, groundY(x, z) + y, z); m.castShadow = true; scene.add(m);
    STARS.push({ k, x, z, y: m.position.y, m });
  });
  GAME.starTotal = spots.length;
}
function updateStars(dt, t) {
  const o = PLAYER.veh || PLAYER, oy = PLAYER.veh ? PLAYER.veh.y + 0.8 : PLAYER.y + 0.5;
  for (let k = STARS.length - 1; k >= 0; k--) {
    const s = STARS[k];
    s.m.rotation.y = t * 2.2 + k; s.m.position.y = s.y + Math.sin(t * 2 + k) * 0.12;
    if (Math.random() < 0.04) FXA.emit(s.x + rr(-0.4, 0.4), s.y + rr(-0.4, 0.4), s.z + rr(-0.4, 0.4), 0, 0.4, 0, 0.18, 1, 0.85, 0.3, 1, 0.8, 0, 0, 0);
    const reach = PLAYER.veh ? Math.max(PLAYER.veh.T.L, 2) * 0.6 + 0.6 : 1.1;
    if (Math.hypot(o.x - s.x, o.z - s.z) < reach && Math.abs(oy - s.y) < (PLAYER.veh ? 2.2 : 1.4)) {
      scene.remove(s.m); STARS.splice(k, 1);
      GAME.save.stars = GAME.save.stars || {}; GAME.save.stars[s.k] = 1;
      GAME.addMoney(50); AU.star(); fxSpark(s.x, s.y, s.z, 30);
      const got = Object.keys(GAME.save.stars).length;
      GAME.help(`⭐ かくれ ほし ゲット！ <b>${got} / ${GAME.starTotal}</b>`, 2.5);
      GAME.saveNow();
      if (got === GAME.starTotal) GAME.big('ぜんぶ みつけた！', 'かくれ ほし コンプリート！ +$1000', 'pass'), GAME.addMoney(1000);
    }
  }
}
