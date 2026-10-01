'use strict';
// ================================================================ utils
const $ = s => document.querySelector(s);
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
const dist2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
const DEBUG = /debug/.test(location.search);

// ================================================================ renderer
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isTouch ? 1.6 : 2));
renderer.setClearColor(0x8fd0ff);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xc4ecff, 260, 1150);
const camera = new THREE.PerspectiveCamera(55, 1, 0.3, 4000);
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < h ? 70 : 55;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

const hemi = new THREE.AmbientLight(0xffffff, 0.56);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff6e0, 0.56);
sun.position.set(0.5, 1, 0.35);
scene.add(sun);

// ================================================================ toon materials + outlines
const gradTex = (() => {
  const d = new Uint8Array([70, 70, 70, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 2, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const _mats = {};
function TM(c, o) {
  const k = c + (o ? JSON.stringify(o) : '');
  if (!_mats[k]) _mats[k] = new THREE.MeshToonMaterial(Object.assign({ color: c, gradientMap: gradTex }, o || {}));
  return _mats[k];
}
const _bm = {};
function BM(c, o) {
  const k = c + (o ? JSON.stringify(o) : '');
  if (!_bm[k]) _bm[k] = new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
  return _bm[k];
}
const _ol = {};
function olMat(t) {
  if (!_ol[t]) _ol[t] = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { th: { value: t } }]),
    vertexShader: 'uniform float th;\n#include <fog_pars_vertex>\nvoid main(){vec4 mvPosition=modelViewMatrix*vec4(position+normal*th,1.0);gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader: '#include <fog_pars_fragment>\nvoid main(){gl_FragColor=vec4(0.16,0.1,0.12,1.0);\n#include <fog_fragment>\n}',
    side: THREE.BackSide, fog: true
  });
  return _ol[t];
}
// mesh with toon material + inverted hull outline
function mk(geo, color, ol = 0.03, mat) {
  const m = new THREE.Mesh(geo, mat || TM(color));
  if (ol) { const o = new THREE.Mesh(geo, olMat(ol)); o.name = 'ol'; m.add(o); }
  return m;
}
function setCol(m, color) { m.material = TM(color); }
const G = {
  sph: (r, w = 14, h = 10) => new THREE.SphereGeometry(r, w, h),
  cyl: (rt, rb, h, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s),
  box: (x, y, z) => new THREE.BoxGeometry(x, y, z),
  cone: (r, h, s = 12) => new THREE.ConeGeometry(r, h, s),
};
const ad = (p, o) => (p.add(o), o);
function at(o, x, y, z) { o.position.set(x, y, z); return o; }

// soft blob shadow
const shadowTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 4, 32, 32, 31);
  g.addColorStop(0, 'rgba(20,30,60,.55)'); g.addColorStop(.7, 'rgba(20,30,60,.4)'); g.addColorStop(1, 'rgba(20,30,60,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
const shadowGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
function blobShadow(s) { const m = new THREE.Mesh(shadowGeo, shadowMat); m.scale.set(s, 1, s); m.renderOrder = 1; scene.add(m); return m; }

// ================================================================ input
const Input = {
  keys: {}, joy: { x: 0, y: 0, id: null, ox: 0, oy: 0 }, btn: { A: 0, B: 0, Y: 0 }, prev: { A: 0, B: 0, Y: 0 },
  pressed: {}, released: {}, held: { A: 0 }, camDX: 0, camDY: 0, drag: null, tapUI: false, anyTap: false, lastTouch: 0,
};
addEventListener('keydown', e => {
  if (e.repeat) { if (/Arrow|Space/.test(e.code)) e.preventDefault(); return; }
  Input.keys[e.code] = 1;
  if (/Arrow|Space/.test(e.code)) e.preventDefault();
  if (e.code === 'KeyM') Hooks.map && Hooks.map();
  Audio2.unlock();
});
addEventListener('keyup', e => { Input.keys[e.code] = 0; });
addEventListener('blur', () => { Input.keys = {}; Input.btn.A = Input.btn.B = Input.btn.Y = 0; });
const Hooks = {};
// touch buttons
for (const id of ['A', 'B', 'Y']) {
  const el = $('#b' + id);
  el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); el.setPointerCapture(e.pointerId); Input['t' + id] = 1; el.classList.add('on'); Audio2.unlock(); });
  const up = e => { Input['t' + id] = 0; el.classList.remove('on'); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
}
$('#bMap').addEventListener('click', e => { e.stopPropagation(); Hooks.map && Hooks.map(); });
// joystick + camera drag on canvas
canvas.addEventListener('pointerdown', e => {
  Audio2.unlock();
  Input.anyTap = true;
  if (e.pointerType === 'touch' && e.clientX < innerWidth * 0.45 && Input.joy.id === null) {
    Input.joy.id = e.pointerId; Input.joy.ox = e.clientX; Input.joy.oy = e.clientY; Input.joy.x = Input.joy.y = 0;
    const b = $('#stickBase'), k = $('#stickKnob');
    b.classList.remove('hide'); k.classList.remove('hide'); $('#stickHint').classList.add('hide');
    b.style.left = k.style.left = e.clientX + 'px'; b.style.top = k.style.top = e.clientY + 'px';
  } else if (!Input.drag) {
    Input.drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
  }
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  const j = Input.joy;
  if (e.pointerId === j.id) {
    let dx = e.clientX - j.ox, dy = e.clientY - j.oy; const L = Math.hypot(dx, dy), R = 55;
    if (L > R) { dx *= R / L; dy *= R / L; }
    j.x = dx / R; j.y = dy / R;
    const k = $('#stickKnob'); k.style.left = (j.ox + dx) + 'px'; k.style.top = (j.oy + dy) + 'px';
  } else if (Input.drag && e.pointerId === Input.drag.id) {
    Input.camDX += e.clientX - Input.drag.x; Input.camDY += e.clientY - Input.drag.y;
    Input.drag.x = e.clientX; Input.drag.y = e.clientY;
  }
});
function endPtr(e) {
  if (e.pointerId === Input.joy.id) {
    Input.joy.id = null; Input.joy.x = Input.joy.y = 0;
    $('#stickBase').classList.add('hide'); $('#stickKnob').classList.add('hide');
  }
  if (Input.drag && e.pointerId === Input.drag.id) Input.drag = null;
}
canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);

function pollInput() {
  const k = Input.keys;
  Input.btn.A = (k.KeyZ || k.KeyJ || k.Enter || Input.tA) ? 1 : 0;
  Input.btn.B = (k.KeyX || k.KeyK || k.Space || Input.tB) ? 1 : 0;
  Input.btn.Y = (k.KeyC || k.KeyL || Input.tY) ? 1 : 0;
  for (const b of ['A', 'B', 'Y']) {
    Input.pressed[b] = Input.btn[b] && !Input.prev[b];
    Input.released[b] = !Input.btn[b] && Input.prev[b];
    Input.prev[b] = Input.btn[b];
  }
  let mx = 0, my = 0;
  if (k.KeyA || k.ArrowLeft) mx -= 1; if (k.KeyD || k.ArrowRight) mx += 1;
  if (k.KeyW || k.ArrowUp) my += 1; if (k.KeyS || k.ArrowDown) my -= 1;
  if (mx || my) { const L = Math.hypot(mx, my); Input.mx = mx / L; Input.my = my / L; }
  else { Input.mx = Input.joy.x; Input.my = -Input.joy.y; }
  if (k.KeyQ) Input.camDX -= 6; if (k.KeyE) Input.camDX += 6;
}
function setBtn(id, label, dim) {
  const el = $('#b' + id); const lb = el.querySelector('.lb');
  if (lb.textContent !== label) lb.textContent = label;
  el.classList.toggle('dim', !!dim);
}
