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
const rndi = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const wait = ms => new Promise(r => setTimeout(r, ms));
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// value noise
function makeNoise(seed) {
  const R = mulberry(seed), P = new Float32Array(512);
  for (let i = 0; i < 512; i++) P[i] = R();
  const h = (x, y) => P[((x * 73856093) ^ (y * 19349663)) & 511];
  const n = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
  };
  return (x, y, oct = 4) => { let s = 0, a = 1, f = 1, t = 0; for (let i = 0; i < oct; i++) { s += n(x * f, y * f) * a; t += a; a *= .5; f *= 2.03; } return s / t; };
}
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
const DEBUG = /debug/.test(location.search);

// ================================================================ renderer
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isTouch ? 1.5 : 2));
renderer.setClearColor(0x202848);
const camera = new THREE.PerspectiveCamera(50, 1, 0.2, 3000);
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < h ? 68 : 50;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

function makeLights(scene, o) {
  const amb = new THREE.HemisphereLight(o.sky || 0xbfd4ff, o.ground || 0x6a5a48, o.amb || 0.62);
  scene.add(amb);
  const sun = new THREE.DirectionalLight(o.sun || 0xfff0d8, o.sunI || 0.75);
  sun.position.set(...(o.dir || [0.5, 1, 0.3]));
  scene.add(sun);
  return { amb, sun };
}

// ================================================================ toon materials + outlines
const gradTex = (() => {
  const d = new Uint8Array([86, 86, 86, 255, 178, 178, 178, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const _mats = {};
function TM(c, o) {
  const k = c + (o ? JSON.stringify(o, (key, v) => v && v.isTexture ? v.uuid : v) : '');
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
function olMat(t, col = '0.09,0.07,0.12') {
  const k = t + col;
  if (!_ol[k]) _ol[k] = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { th: { value: t } }]),
    vertexShader: 'uniform float th;\n#include <fog_pars_vertex>\nvoid main(){vec4 p=vec4(position+normal*th,1.0);\n#ifdef USE_INSTANCING\np=instanceMatrix*p;\n#endif\nvec4 mvPosition=modelViewMatrix*p;gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader: '#include <fog_pars_fragment>\nvoid main(){gl_FragColor=vec4(' + col + ',1.0);\n#include <fog_fragment>\n}',
    side: THREE.BackSide, fog: true
  });
  return _ol[k];
}
function mk(geo, color, ol = 0.02, mat) {
  const m = new THREE.Mesh(geo, mat || TM(color));
  if (ol) { const o = new THREE.Mesh(geo, olMat(ol)); o.name = 'ol'; m.add(o); }
  return m;
}
const G = {
  sph: (r, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h),
  cyl: (rt, rb, h, s = 14, open) => new THREE.CylinderGeometry(rt, rb, h, s, 1, !!open),
  box: (x, y, z) => new THREE.BoxGeometry(x, y, z),
  cone: (r, h, s = 12) => new THREE.ConeGeometry(r, h, s),
  cap: (r, l, s = 8) => new THREE.CapsuleGeometry(r, l, 4, s),
  tor: (r, t, rs = 8, ts = 32) => new THREE.TorusGeometry(r, t, rs, ts),
};
const ad = (p, o) => (p.add(o), o);
function at(o, x, y, z) { o.position.set(x, y, z); return o; }
function grp(parent, x = 0, y = 0, z = 0) { const g = new THREE.Group(); g.position.set(x, y, z); if (parent) parent.add(g); return g; }
// instanced toon + outline
function inst(parent, geo, color, mats, ol = 0.03, matOpt) {
  const im = new THREE.InstancedMesh(geo, matOpt || TM(color), mats.length);
  mats.forEach((m, i) => im.setMatrixAt(i, m));
  im.instanceMatrix.needsUpdate = true;
  parent.add(im);
  if (ol) {
    const o = new THREE.InstancedMesh(geo, olMat(ol), mats.length);
    mats.forEach((m, i) => o.setMatrixAt(i, m));
    o.instanceMatrix.needsUpdate = true;
    parent.add(o);
  }
  return im;
}
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new V3(), _p = new V3();
function mat4(x, y, z, ry = 0, sx = 1, sy = sx, sz = sx, rx = 0, rz = 0) {
  _e.set(rx, ry, rz); _q.setFromEuler(_e); _s.set(sx, sy, sz); _p.set(x, y, z);
  return new THREE.Matrix4().compose(_p, _q, _s);
}

// canvas texture helper
function canTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  t.anisotropy = 4;
  return t;
}
const glowTex = canTex(64, 64, (x) => {
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
});
const shadowTex = canTex(64, 64, (x) => {
  const g = x.createRadialGradient(32, 32, 4, 32, 32, 31);
  g.addColorStop(0, 'rgba(10,10,30,.5)'); g.addColorStop(.7, 'rgba(10,10,30,.35)'); g.addColorStop(1, 'rgba(10,10,30,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
});
const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
const shadowGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
function blobShadow(parent, s) { const m = new THREE.Mesh(shadowGeo, shadowMat); m.scale.set(s, 1, s); m.renderOrder = 1; parent.add(m); return m; }
function glowSprite(color, size, add = true) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending }));
  s.scale.setScalar(size); return s;
}

// ================================================================ input
// logical buttons: ok cancel atk arte jump guard free ol fs tgt skit menu  + u d l r (menu nav)
const BTN = ['ok', 'cancel', 'atk', 'arte', 'jump', 'guard', 'free', 'ol', 'fs', 'tgt', 'skit', 'menu', 'u', 'd', 'l', 'r'];
const KEYMAP = {
  ok: ['KeyZ', 'Enter', 'Space', 'KeyJ'], cancel: ['KeyX', 'Escape', 'Backspace', 'KeyK'],
  atk: ['KeyZ', 'KeyJ'], arte: ['KeyX', 'KeyK'], jump: ['Space'], guard: ['KeyC', 'KeyL'], free: ['ShiftLeft', 'ShiftRight'],
  ol: ['KeyQ', 'KeyO'], fs: ['KeyE', 'KeyV'], tgt: ['KeyR', 'KeyI'], skit: ['Tab', 'KeyT'], menu: ['Escape', 'KeyM'],
  u: ['ArrowUp', 'KeyW'], d: ['ArrowDown', 'KeyS'], l: ['ArrowLeft', 'KeyA'], r: ['ArrowRight', 'KeyD'],
};
const PADMAP = { ok: [0], cancel: [1], atk: [0], arte: [1], jump: [3], guard: [2], free: [6], ol: [5], fs: [7], tgt: [4], skit: [8], menu: [9], u: [12], d: [13], l: [14], r: [15] };
const TOUCHMAP = { tA: ['atk', 'ok'], tB: ['arte', 'cancel'], tJ: ['jump'], tG: ['guard'], tF: ['free'], tO: ['ol'], tS: ['fs'], tT: ['tgt'], tM: ['menu'], tK: ['skit'] };
const Input = {
  keys: {}, tapK: {}, tapT: {}, touch: {}, held: {}, pressed: {}, released: {}, prev: {}, mx: 0, my: 0, cx: 0, cy: 0,
  joy: { x: 0, y: 0, id: null, ox: 0, oy: 0 }, drag: null, camDX: 0, camDY: 0, any: false, lastDevice: isTouch ? 'touch' : 'key',
  repeat: {},
};
addEventListener('keydown', e => {
  if (/Arrow|Space|Tab/.test(e.code)) e.preventDefault();
  Input.lastDevice = 'key';
  if (e.repeat) return;
  Input.keys[e.code] = 1; Input.tapK[e.code] = 1; Input.any = true;
  Audio2.unlock();
});
addEventListener('keyup', e => { Input.keys[e.code] = 0; });
addEventListener('blur', () => { Input.keys = {}; Input.touch = {}; });
for (const id in TOUCHMAP) {
  const el = $('#' + id);
  el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try { el.setPointerCapture(e.pointerId); } catch (_) { } Input.touch[id] = 1; Input.tapT[id] = 1; el.classList.add('on'); Input.any = true; Input.lastDevice = 'touch'; Audio2.unlock(); });
  const up = () => { Input.touch[id] = 0; el.classList.remove('on'); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
}
canvas.addEventListener('pointerdown', e => {
  Audio2.unlock(); Input.any = true;
  if (e.pointerType === 'touch') Input.lastDevice = 'touch';
  if (e.pointerType === 'touch' && e.clientX < innerWidth * 0.45 && Input.joy.id === null) {
    Input.joy.id = e.pointerId; Input.joy.ox = e.clientX; Input.joy.oy = e.clientY; Input.joy.x = Input.joy.y = 0;
    const b = $('#stickBase'), k = $('#stickKnob');
    b.classList.remove('hide'); k.classList.remove('hide');
    b.style.left = k.style.left = e.clientX + 'px'; b.style.top = k.style.top = e.clientY + 'px';
  } else if (!Input.drag) Input.drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
  try { canvas.setPointerCapture(e.pointerId); } catch (_) { }
});
canvas.addEventListener('pointermove', e => {
  const j = Input.joy;
  if (e.pointerId === j.id) {
    let dx = e.clientX - j.ox, dy = e.clientY - j.oy; const L = Math.hypot(dx, dy), R = 50;
    if (L > R) { dx *= R / L; dy *= R / L; }
    j.x = dx / R; j.y = dy / R;
    const k = $('#stickKnob'); k.style.left = (j.ox + dx) + 'px'; k.style.top = (j.oy + dy) + 'px';
  } else if (Input.drag && e.pointerId === Input.drag.id) {
    Input.camDX += e.clientX - Input.drag.x; Input.camDY += e.clientY - Input.drag.y;
    Input.drag.x = e.clientX; Input.drag.y = e.clientY;
  }
});
function endPtr(e) {
  if (e.pointerId === Input.joy.id) { Input.joy.id = null; Input.joy.x = Input.joy.y = 0; $('#stickBase').classList.add('hide'); $('#stickKnob').classList.add('hide'); }
  if (Input.drag && e.pointerId === Input.drag.id) Input.drag = null;
}
canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);
// mouse camera drag on desktop (right or left button)
canvas.addEventListener('contextmenu', e => e.preventDefault());

function pollInput(dt) {
  const k = Input.keys;
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  let gp = null; for (const p of pads) if (p && p.connected) { gp = p; break; }
  for (const b of BTN) {
    let v = 0;
    for (const c of KEYMAP[b]) if (k[c] || Input.tapK[c]) v = 1;
    if (gp) for (const i of PADMAP[b]) if (gp.buttons[i] && gp.buttons[i].pressed) { v = 1; Input.lastDevice = 'pad'; }
    for (const id in TOUCHMAP) if ((Input.touch[id] || Input.tapT[id]) && TOUCHMAP[id].includes(b)) v = 1;
    Input.held[b] = v;
    Input.pressed[b] = v && !Input.prev[b];
    Input.released[b] = !v && Input.prev[b];
    Input.prev[b] = v;
  }
  Input.tapK = {}; Input.tapT = {};
  let mx = 0, my = 0;
  if (k.KeyA || k.ArrowLeft) mx -= 1; if (k.KeyD || k.ArrowRight) mx += 1;
  if (k.KeyW || k.ArrowUp) my += 1; if (k.KeyS || k.ArrowDown) my -= 1;
  if (gp) {
    const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    if (Math.hypot(ax, ay) > 0.25) { mx = ax; my = -ay; }
    if (gp.buttons[14] && gp.buttons[14].pressed) mx = -1; if (gp.buttons[15] && gp.buttons[15].pressed) mx = 1;
    if (gp.buttons[12] && gp.buttons[12].pressed) my = 1; if (gp.buttons[13] && gp.buttons[13].pressed) my = -1;
    const rx = gp.axes[2] || 0, ry = gp.axes[3] || 0;
    if (Math.abs(rx) > 0.2) Input.camDX += rx * 500 * dt;
    if (Math.abs(ry) > 0.2) Input.camDY += ry * 300 * dt;
  }
  if (mx || my) { const L = Math.max(1, Math.hypot(mx, my)); Input.mx = mx / L; Input.my = my / L; }
  else { Input.mx = Input.joy.x; Input.my = -Input.joy.y; }
  // virtual nav edges for menus (stick too)
  const nav = { u: Input.my > 0.6, d: Input.my < -0.6, l: Input.mx < -0.6, r: Input.mx > 0.6 };
  for (const b in nav) {
    if (nav[b] && !Input.held[b]) {
      Input.repeat[b] = (Input.repeat[b] || 0) - dt;
      if (Input.repeat[b] <= 0) { Input.pressed[b] = 1; Input.repeat[b] = Input.repeat[b + '0'] ? 0.12 : 0.35; Input.repeat[b + '0'] = 1; }
    } else if (!nav[b]) { Input.repeat[b] = 0; Input.repeat[b + '0'] = 0; }
  }
  if (k.KeyU) Input.camDX -= 300 * dt; if (k.KeyP) Input.camDX += 300 * dt;
}
function clearPressed() { for (const b of BTN) Input.pressed[b] = 0; }
function setTouchMode(mode) {
  // mode: 'none' | 'field' | 'battle'
  $('#tc').classList.toggle('hide', !isTouch || mode === 'none');
  const show = { field: ['tA', 'tB', 'tM', 'tK'], battle: ['tA', 'tB', 'tJ', 'tG', 'tF', 'tO', 'tS', 'tT', 'tM'] }[mode] || [];
  for (const id in TOUCHMAP) $('#' + id).classList.toggle('hide', !show.includes(id));
  $('#tA .lb').textContent = mode === 'field' ? 'しらべる' : 'こうげき';
  $('#tB .lb').textContent = mode === 'field' ? 'もどる' : '術技';
  if (mode === 'field') $('#tK').classList.toggle('hide', !Game.skitReady);
}
const keyLabel = (b) => Input.lastDevice === 'pad' ? ({ atk: 'A', arte: 'B', guard: 'X', jump: 'Y', ol: 'RB', fs: 'RT', tgt: 'LB', free: 'LT', skit: 'BACK', menu: 'START', ok: 'A' })[b]
  : Input.lastDevice === 'touch' ? ({ atk: 'A', arte: 'B', guard: 'G', jump: 'J', ol: 'OL', fs: 'FS', tgt: '⇄', free: 'FR', skit: 'S', menu: '≡', ok: 'A' })[b]
    : ({ atk: 'Z', arte: 'X', guard: 'C', jump: 'SPACE', ol: 'Q', fs: 'E', tgt: 'R', free: 'SHIFT', skit: 'TAB', menu: 'ESC', ok: 'Z' })[b];
