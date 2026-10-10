'use strict';
// ================================================================ utils
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const TAU = Math.PI * 2;
const V3 = THREE.Vector3;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
const angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
const dampAng = (a, b, k, dt) => a + angDiff(a, b) * (1 - Math.exp(-k * dt));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const T = (h, m = 0) => h * 60 + m;
const fmtT = t => { t = Math.floor(t); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
const DEBUG = /debug/.test(location.search);
const HEADLESS = /headless/.test(location.search);
if (isTouch) document.body.classList.add('touch');
const APP = { mode: 'title' };
const Hooks = {};

// ================================================================ renderer
const canvas = $('#c');
THREE.ColorManagement.legacyMode = false;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isTouch ? 1.6 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 1, 300);
let VW = 1, VH = 1;
function resize() {
  VW = innerWidth; VH = innerHeight;
  renderer.setSize(VW, VH, false);
  camera.aspect = VW / VH;
  camera.updateProjectionMatrix();
  Hooks.resize && Hooks.resize();
}
addEventListener('resize', resize);

const hemi = new THREE.HemisphereLight(0xfff4e6, 0x8a7a70, 0.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2dc, 1.3);
sun.castShadow = true;
sun.shadow.mapSize.set(isTouch ? 1024 : 2048, isTouch ? 1024 : 2048);
{ const c = sun.shadow.camera; c.left = -18; c.right = 18; c.top = 16; c.bottom = -16; c.near = 1; c.far = 90; }
sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04; sun.shadow.radius = 4;
scene.add(sun); scene.add(sun.target);
sun.target.position.set(3, 0, 0);

// ================================================================ materials & meshes
const _m = {};
function M(c, o) {
  const k = c + (o ? JSON.stringify(o) : '');
  return _m[k] || (_m[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.82, metalness: 0 }, o || {})));
}
const _mb = {};
function MB(c, o) {
  const k = c + (o ? JSON.stringify(o) : '');
  return _mb[k] || (_mb[k] = new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {})));
}
function mesh(geo, c, cast = true, recv = true) {
  const m = new THREE.Mesh(geo, c && c.isMaterial ? c : M(c));
  m.castShadow = cast; m.receiveShadow = recv;
  return m;
}
const G = {
  box: (x, y, z) => new THREE.BoxGeometry(x, y, z),
  cyl: (a, b, h, s = 16, hs = 1, open = false) => new THREE.CylinderGeometry(a, b, h, s, hs, open),
  sph: (r, w = 18, h = 14) => new THREE.SphereGeometry(r, w, h),
  cone: (r, h, s = 12) => new THREE.ConeGeometry(r, h, s),
  tor: (r, t, rs = 8, ts = 18, arc = TAU) => new THREE.TorusGeometry(r, t, rs, ts, arc),
  plane: (w, h) => new THREE.PlaneGeometry(w, h),
};
// rounded box: soft "wooden toy" corners
const _rb = {};
G.rbox = (w, h, d, r = 0.06, n = 8) => {
  const key = [w, h, d, r, n].join();
  if (_rb[key]) return _rb[key];
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const g = new THREE.BoxGeometry(2, 2, 2, n, n, n);
  const pa = g.attributes.position, na = g.attributes.normal;
  const hx = w / 2, hy = h / 2, hz = d / 2, a = Math.min(0.5, 4 / n);
  const f = (c, hh) => { const s = Math.sign(c), u = Math.abs(c); return s * (u <= 1 - a ? u / (1 - a) * (hh - r) : (hh - r) + (u - (1 - a)) / a * r); };
  const v = new V3(), inner = new V3(), nn = new V3();
  for (let i = 0; i < pa.count; i++) {
    v.set(f(pa.getX(i), hx), f(pa.getY(i), hy), f(pa.getZ(i), hz));
    inner.set(clamp(v.x, -hx + r, hx - r), clamp(v.y, -hy + r, hy - r), clamp(v.z, -hz + r, hz - r));
    nn.subVectors(v, inner);
    if (nn.lengthSq() > 1e-10) { nn.normalize(); v.copy(inner).addScaledVector(nn, r); na.setXYZ(i, nn.x, nn.y, nn.z); }
    pa.setXYZ(i, v.x, v.y, v.z);
  }
  return (_rb[key] = g);
};
// rounded cylinder (capsule-ish puck)
const _rc = {};
G.rcyl = (rad, h, r = 0.05, s = 20) => {
  const key = [rad, h, r, s].join();
  if (_rc[key]) return _rc[key];
  r = Math.min(r, rad - 1e-3, h / 2 - 1e-3);
  const pts = [new THREE.Vector2(0, -h / 2)];
  for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i / 5 * Math.PI / 2; pts.push(new THREE.Vector2(rad - r + Math.cos(a) * r, -h / 2 + r + Math.sin(a) * r)); }
  for (let i = 0; i <= 5; i++) { const a = i / 5 * Math.PI / 2; pts.push(new THREE.Vector2(rad - r + Math.cos(a) * r, h / 2 - r + Math.sin(a) * r)); }
  pts.push(new THREE.Vector2(0, h / 2));
  return (_rc[key] = new THREE.LatheGeometry(pts, s));
};
const at = (o, x, y, z) => (o.position.set(x, y, z), o);
const ad = (p, o) => (p.add(o), o);
// add a rounded box to parent: (parent, w,h,d, color, x,y,z, r)
function RB(p, w, h, d, c, x, y, z, r = 0.06) { return ad(p, at(mesh(G.rbox(w, h, d, r), c), x, y, z)); }

// ================================================================ procedural textures
function cTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  return t;
}
function noiseFill(x, w, h, n, a) { for (let i = 0; i < n; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * a})`; x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3); } }
const TEX = {};
function texPlank(base) {
  const k = 'pl' + base;
  return TEX[k] || (TEX[k] = cTex(256, 256, (x, w, h) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 8; k++) {
      x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,240,220' : '90,50,20'},${rnd(0.03, 0.09)})`; x.fillRect(k * 32, 0, 32, h);
      x.fillStyle = 'rgba(80,45,20,.35)'; x.fillRect(k * 32, 0, 2, h);
      const off = Math.random() * h; x.fillRect(k * 32, off, 32, 2);
    }
    x.strokeStyle = 'rgba(110,70,30,.12)'; x.lineWidth = 1;
    for (let i = 0; i < 50; i++) { const xx = Math.random() * w; x.beginPath(); x.moveTo(xx, 0); for (let y = 0; y <= h; y += 16) x.lineTo(xx + Math.sin(y * 0.04 + i) * 2, y); x.stroke(); }
    noiseFill(x, w, h, 700, 0.05);
  }, true));
}
function texTatami() {
  return TEX.tatami || (TEX.tatami = cTex(256, 256, (x, w, h) => {
    x.fillStyle = '#c9c48a'; x.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) { x.fillStyle = `rgba(${y % 6 ? '255,255,220' : '110,100,40'},.08)`; x.fillRect(0, y, w, 2); }
    x.fillStyle = '#4a5a3a'; x.fillRect(0, 0, w, 8); x.fillRect(0, h - 8, w, 8);
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(w / 2 - 1, 8, 2, h - 16);
    noiseFill(x, w, h, 500, 0.05);
  }, true));
}
function texTile() {
  return TEX.tile || (TEX.tile = cTex(128, 128, (x, w, h) => {
    x.fillStyle = '#e8e2d4'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#dcd2c0' : '#ece6d8'; x.fillRect(i * 32 + 1, j * 32 + 1, 30, 30); }
    noiseFill(x, w, h, 300, 0.04);
  }, true));
}
function texWall(base, kind) {
  const k = 'w' + base + kind;
  return TEX[k] || (TEX[k] = cTex(128, 128, (x, w, h) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    if (kind === 1) { x.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 8; i++) x.fillRect(i * 16 + 6, 0, 4, h); }
    else if (kind === 2) { x.fillStyle = 'rgba(160,120,90,.16)'; for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { x.beginPath(); x.arc(i * 22 + (j % 2) * 11 + 6, j * 22 + 6, 3, 0, TAU); x.fill(); } }
    else if (kind === 3) { // shoji-ish plaster
      x.fillStyle = 'rgba(120,100,70,.06)'; for (let i = 0; i < 400; i++) x.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    noiseFill(x, w, h, 300, 0.035);
  }, true));
}
function texGrass() {
  return TEX.grass || (TEX.grass = cTex(256, 256, (x, w, h) => {
    x.fillStyle = '#8ab866'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) { x.fillStyle = `hsl(${85 + Math.random() * 25},${35 + Math.random() * 20}%,${38 + Math.random() * 22}%)`; x.fillRect(Math.random() * w, Math.random() * h, 2, 3 + Math.random() * 3); }
  }, true));
}
const _tm = {};
function TMat(tex, o, rx = 1, ry = 1) {
  const k = tex.uuid + rx + ',' + ry + JSON.stringify(o || {});
  if (_tm[k]) return _tm[k];
  let t = tex; if (rx !== 1 || ry !== 1) { t = tex.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); }
  return (_tm[k] = new THREE.MeshStandardMaterial(Object.assign({ map: t, roughness: 0.85 }, o || {})));
}
// text label texture (for tiny signs, clock faces etc.)
function labelTex(draw, w = 128, h = 128) { return cTex(w, h, draw); }

// ================================================================ save
const Save = (() => {
  const KEY = 'obakeRusuban1';
  let d = {};
  try { d = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { d = {}; }
  d.days = d.days || {}; // day -> {goal, stars, chain, hidden}
  d.diary = d.diary || {}; // day -> {text, img}
  d.unlocked = d.unlocked || 1;
  if (d.snd == null) d.snd = 1;
  if (d.cone == null) d.cone = 1;
  return {
    d,
    write() {
      try { localStorage.setItem(KEY, JSON.stringify(d)); }
      catch (e) { // drop images if quota exceeded
        try { for (const k in d.diary) d.diary[k].img = null; localStorage.setItem(KEY, JSON.stringify(d)); } catch (e2) { }
      }
    },
  };
})();

// ================================================================ particles (world space sprites)
const Parts = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  const s = document.createElement('canvas'); s.width = s.height = 64;
  const y = s.getContext('2d'); y.fillStyle = '#fff'; y.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 12 : 30, a = i / 10 * TAU - Math.PI / 2; y.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); }
  y.fill();
  const starTex = new THREE.CanvasTexture(s);
  const list = [];
  return {
    tex, starTex,
    add(parent, pos, o) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: o.star ? starTex : tex, color: o.col || 0xffffff, transparent: true, depthWrite: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending }));
      sp.position.copy(pos); const sz = o.size || 0.3; sp.scale.set(sz, sz, sz);
      (parent || scene).add(sp);
      list.push({ sp, vx: o.vx || 0, vy: o.vy || 0, vz: o.vz || 0, g: o.g || 0, life: 0, max: o.life || 1, s0: sz, s1: o.grow != null ? o.grow : sz, op: o.op != null ? o.op : 1, drag: o.drag || 0 });
    },
    burst(parent, pos, n, o) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, sp = rnd(0.4, 1) * (o.spd || 2); this.add(parent, pos, Object.assign({}, o, { vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: rnd(0.5, 1) * (o.up || 2) })); } },
    update(dt) {
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i]; p.life += dt; const k = p.life / p.max;
        if (k >= 1) { p.sp.parent && p.sp.parent.remove(p.sp); p.sp.material.dispose(); list.splice(i, 1); continue; }
        p.vy -= p.g * dt; const dr = Math.exp(-p.drag * dt); p.vx *= dr; p.vz *= dr;
        p.sp.position.x += p.vx * dt; p.sp.position.y += p.vy * dt; p.sp.position.z += p.vz * dt;
        const s = lerp(p.s0, p.s1, k); p.sp.scale.set(s, s, s);
        p.sp.material.opacity = p.op * (1 - k * k);
      }
    },
    clear() { for (const p of list) { p.sp.parent && p.sp.parent.remove(p.sp); p.sp.material.dispose(); } list.length = 0; },
  };
})();

// ================================================================ 2D geometry helpers (floor plan)
// segment-segment intersection (proper), used for line of sight
function segX(ax, az, bx, bz, cx, cz, dx, dz) {
  const r1 = bx - ax, r2 = bz - az, s1 = dx - cx, s2 = dz - cz;
  const den = r1 * s2 - r2 * s1; if (Math.abs(den) < 1e-9) return false;
  const t = ((cx - ax) * s2 - (cz - az) * s1) / den, u = ((cx - ax) * r2 - (cz - az) * r1) / den;
  return t > 1e-4 && t < 1 - 1e-4 && u >= -1e-4 && u <= 1 + 1e-4;
}
// segment vs axis-aligned rect
function segRect(ax, az, bx, bz, x0, z0, x1, z1) {
  let t0 = 0, t1 = 1; const dx = bx - ax, dz = bz - az;
  const p = [-dx, dx, -dz, dz], q = [ax - x0, x1 - ax, az - z0, z1 - az];
  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-9) { if (q[i] < 0) return false; }
    else { const r = q[i] / p[i]; if (p[i] < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } }
  }
  return t1 - t0 > 0.02 && t0 < 0.97;
}
