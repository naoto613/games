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
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
const DEBUG = /debug/.test(location.search);
const APP = { mode: 'title', twoP: false };
const Hooks = {};

// ================================================================ renderer
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isTouch ? 1.75 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fdcff);
const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 400);
let VW = 1, VH = 1;
function resize() {
  VW = innerWidth; VH = innerHeight;
  renderer.setSize(VW, VH, false);
  camera.aspect = VW / VH;
  camera.updateProjectionMatrix();
  Hooks.resize && Hooks.resize();
}
addEventListener('resize', resize);

const hemi = new THREE.HemisphereLight(0xfff8ee, 0x8a7898, 0.78);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0.74);
sun.position.set(-5, 14, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(isTouch ? 1024 : 2048, isTouch ? 1024 : 2048);
{ const c = sun.shadow.camera; c.left = -13; c.right = 13; c.top = 13; c.bottom = -13; c.near = 1; c.far = 60; }
sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.03;
scene.add(sun); scene.add(sun.target);
function aimSun(x, z) { sun.target.position.set(x, 0, z); sun.position.set(x - 5, 14, z + 8); }

// ================================================================ materials & meshes (low-poly, flat shaded)
const _m = {};
function M(c, o) {
  const k = c + (o ? JSON.stringify(o) : '');
  return _m[k] || (_m[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: 0.82, metalness: 0 }, o || {})));
}
const _mb = {};
function MB(c, o) {
  const k = c + (o ? JSON.stringify(o) : '');
  return _mb[k] || (_mb[k] = new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {})));
}
function mesh(geo, c, cast = true, recv = false) {
  const m = new THREE.Mesh(geo, c && c.isMaterial ? c : M(c));
  m.castShadow = cast; m.receiveShadow = recv;
  return m;
}
const G = {
  box: (x, y, z) => new THREE.BoxGeometry(x, y, z),
  cyl: (a, b, h, s = 10, hs = 1, open = false, t0 = 0, tl = TAU) => new THREE.CylinderGeometry(a, b, h, s, hs, open, t0, tl),
  sph: (r, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h),
  ico: (r, d = 1) => new THREE.IcosahedronGeometry(r, d),
  cone: (r, h, s = 8, hs = 1, open = false) => new THREE.ConeGeometry(r, h, s, hs, open),
  tor: (r, t, rs = 6, ts = 14, arc = TAU) => new THREE.TorusGeometry(r, t, rs, ts, arc),
};
const at = (o, x, y, z) => (o.position.set(x, y, z), o);
const ad = (p, o) => (p.add(o), o);
function disposeTree(o) {
  o.traverse(n => { if (n.geometry) n.geometry.dispose(); });
}

// ================================================================ icon canvases (emoji + custom drawings)
const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Segoe UI Symbol",sans-serif';
const _ic = {};
function iconCanvas(key) {
  if (_ic[key]) return _ic[key];
  const S = 96, c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d');
  const custom = ICON_DRAW[key];
  if (custom) custom(x, S);
  else {
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `${S * 0.74}px ${EMOJI_FONT}`;
    x.fillText(key, S / 2, S * 0.56);
  }
  _ic[key] = c; return c;
}
const _iu = {};
function iconURL(key) { return _iu[key] || (_iu[key] = iconCanvas(key).toDataURL()); }
const _it = {};
function iconTex(key) { return _it[key] || (_it[key] = new THREE.CanvasTexture(iconCanvas(key))); }
function rr(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
const ICON_DRAW = {
  nori(x, S) { x.save(); x.translate(S / 2, S / 2); x.rotate(-0.15); rr(x, -30, -34, 60, 68, 8); x.fillStyle = '#1f3a24'; x.fill(); x.strokeStyle = '#0e1e12'; x.lineWidth = 4; x.stroke(); x.strokeStyle = 'rgba(120,200,120,.35)'; x.lineWidth = 3; for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(-24, i * 12); x.lineTo(24, i * 12 - 4); x.stroke(); } x.restore(); },
  bun(x, S) { x.fillStyle = '#c87a2a'; x.beginPath(); x.ellipse(48, 56, 38, 30, 0, Math.PI, 0); x.fill(); x.fillStyle = '#e8a84a'; x.beginPath(); x.ellipse(48, 54, 34, 26, 0, Math.PI, 0); x.fill(); x.fillStyle = '#f5d9a0'; x.fillRect(12, 58, 72, 14); x.fillStyle = '#c87a2a'; x.fillRect(12, 70, 72, 5); x.fillStyle = '#fff6d8'; for (const [a, b] of [[34, 40], [50, 34], [62, 44], [42, 48]]) { x.beginPath(); x.ellipse(a, b, 3, 2, 0.5, 0, TAU); x.fill(); } },
  patty(x, S) { x.fillStyle = '#4a2410'; x.beginPath(); x.ellipse(48, 54, 38, 24, 0, 0, TAU); x.fill(); x.fillStyle = '#7a3e1c'; x.beginPath(); x.ellipse(48, 50, 36, 21, 0, 0, TAU); x.fill(); x.strokeStyle = '#3a1a08'; x.lineWidth = 4; for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(30 + i * 9, 38); x.lineTo(42 + i * 9, 62); x.stroke(); } },
  gohan(x, S) { x.fillStyle = '#2a6ab0'; x.beginPath(); x.moveTo(14, 50); x.quadraticCurveTo(48, 100, 82, 50); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(48, 50, 34, 20, 0, Math.PI, 0); x.fill(); x.fillStyle = '#e8e8e0'; for (let i = 0; i < 9; i++) { x.beginPath(); x.ellipse(26 + i * 5.5, 44 - Math.sin(i / 8 * Math.PI) * 10, 3, 2, 0.4, 0, TAU); x.fill(); } x.fillStyle = '#5a9ae0'; x.fillRect(14, 50, 68, 5); },
  curry(x, S) { x.fillStyle = '#7a4a1a'; x.beginPath(); x.ellipse(48, 56, 38, 26, 0, 0, TAU); x.fill(); x.fillStyle = '#c87a1a'; x.beginPath(); x.ellipse(48, 52, 32, 20, 0, 0, TAU); x.fill(); x.fillStyle = '#ff8a2a'; x.fillRect(32, 44, 10, 8); x.fillStyle = '#f0d070'; x.fillRect(52, 50, 11, 9); x.fillStyle = '#fff'; x.fillRect(44, 56, 8, 6); },
  pot(x, S) { x.fillStyle = '#8a96a4'; rr(x, 16, 34, 64, 46, 10); x.fill(); x.fillStyle = '#b8c4d0'; x.fillRect(16, 34, 64, 10); x.fillStyle = '#5a6674'; x.fillRect(6, 44, 12, 8); x.fillRect(78, 44, 12, 8); x.strokeStyle = '#fff'; x.lineWidth = 4; for (const a of [32, 48, 64]) { x.beginPath(); x.moveTo(a, 28); x.quadraticCurveTo(a - 8, 18, a, 8); x.stroke(); } },
  pan(x, S) { x.fillStyle = '#2a2a2e'; x.beginPath(); x.ellipse(42, 54, 32, 18, 0, 0, TAU); x.fill(); x.fillStyle = '#4a4a50'; x.beginPath(); x.ellipse(42, 50, 28, 14, 0, 0, TAU); x.fill(); x.fillStyle = '#6a4a2a'; x.save(); x.translate(70, 46); x.rotate(-0.3); x.fillRect(0, -5, 26, 10); x.restore(); x.fillStyle = '#ffb21e'; for (const [a, b] of [[30, 34], [44, 28], [56, 34]]) { x.beginPath(); x.arc(a, b, 3, 0, TAU); x.fill(); } },
  knife(x, S) { x.save(); x.translate(48, 48); x.rotate(-0.7); x.fillStyle = '#dfe6ee'; x.beginPath(); x.moveTo(-6, -40); x.quadraticCurveTo(14, -10, 8, 10); x.lineTo(-6, 10); x.closePath(); x.fill(); x.strokeStyle = '#2a1a12'; x.lineWidth = 4; x.stroke(); x.fillStyle = '#8a4a2a'; rr(x, -8, 10, 16, 32, 5); x.fill(); x.stroke(); x.restore(); },
  plate(x, S) { x.fillStyle = '#d8d0c0'; x.beginPath(); x.ellipse(48, 54, 40, 24, 0, 0, TAU); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(48, 51, 36, 20, 0, 0, TAU); x.fill(); x.strokeStyle = '#e8e0d0'; x.lineWidth = 3; x.beginPath(); x.ellipse(48, 51, 24, 12, 0, 0, TAU); x.stroke(); },
  burgerL(x, S) { x.font = `${S * 0.7}px ${EMOJI_FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('🍔', 44, 54); x.font = `${S * 0.4}px ${EMOJI_FONT}`; x.fillText('🥬', 74, 72); },
  saladL(x, S) { x.font = `${S * 0.66}px ${EMOJI_FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; ICON_DRAW.plate(x, S); x.fillText('🥬', 48, 46); },
};

// ================================================================ input
const Keys = {};
addEventListener('keydown', e => {
  if (e.repeat) { if (APP.mode === 'play' || APP.mode === 'map') e.preventDefault(); return; }
  Keys[e.code] = 1;
  if (/^(Arrow|Space|Tab|Enter)/.test(e.code) || ((APP.mode === 'play' || APP.mode === 'map') && /^(Shift|Control|Slash|Period)/.test(e.code))) e.preventDefault();
  if (e.code === 'Escape' || e.code === 'KeyP') Hooks.pause && Hooks.pause();
  Sound.unlock();
});
addEventListener('keyup', e => { Keys[e.code] = 0; });
addEventListener('blur', () => { for (const k in Keys) Keys[k] = 0; });
const KB = {
  all: { u: ['KeyW', 'ArrowUp'], d: ['KeyS', 'ArrowDown'], l: ['KeyA', 'ArrowLeft'], r: ['KeyD', 'ArrowRight'], pick: ['Space', 'Enter', 'KeyJ'], act: ['KeyE', 'KeyX', 'KeyK', 'ControlLeft', 'ControlRight'], dash: ['ShiftLeft', 'ShiftRight', 'KeyL'], swap: ['Tab', 'KeyQ'] },
  p1: { u: ['KeyW'], d: ['KeyS'], l: ['KeyA'], r: ['KeyD'], pick: ['Space'], act: ['KeyE'], dash: ['ShiftLeft'], swap: [] },
  p2: { u: ['ArrowUp'], d: ['ArrowDown'], l: ['ArrowLeft'], r: ['ArrowRight'], pick: ['Enter'], act: ['ShiftRight', 'Period'], dash: ['Slash', 'ControlRight'], swap: [] },
};
const anyK = a => a.some(k => Keys[k]);
const TouchCtl = { x: 0, y: 0, pick: 0, act: 0, dash: 0, swap: 0 };
function padRead(i) {
  const ps = navigator.getGamepads ? navigator.getGamepads() : null;
  const p = ps && ps[i]; if (!p) return null;
  const b = n => p.buttons[n] && p.buttons[n].pressed ? 1 : 0;
  let x = p.axes[0] || 0, y = p.axes[1] || 0;
  if (Math.hypot(x, y) < 0.22) x = y = 0;
  x += b(15) - b(14); y += b(13) - b(12);
  return { x, y, pick: b(0), act: b(2), dash: b(1) || b(5), swap: b(3) || b(4), start: b(9) };
}
const BTN = ['pick', 'act', 'dash', 'swap'];
class Ctl {
  constructor(srcs) { this.srcs = srcs; this.cur = {}; this.pressed = {}; this.x = 0; this.y = 0; }
  poll() {
    let x = 0, y = 0; const b = { pick: 0, act: 0, dash: 0, swap: 0 };
    for (const s of this.srcs) {
      if (KB[s]) { const k = KB[s]; x += (anyK(k.r) ? 1 : 0) - (anyK(k.l) ? 1 : 0); y += (anyK(k.d) ? 1 : 0) - (anyK(k.u) ? 1 : 0); for (const n of BTN) if (anyK(k[n])) b[n] = 1; }
      else if (s === 'touch') { x += TouchCtl.x; y += TouchCtl.y; for (const n of BTN) if (TouchCtl[n]) b[n] = 1; }
      else if (s.startsWith('pad')) { const p = padRead(+s[3]); if (p) { x += p.x; y += p.y; for (const n of BTN) if (p[n]) b[n] = 1; } }
    }
    const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
    this.x = x; this.y = y;
    for (const n of BTN) { this.pressed[n] = !!(b[n] && !this.cur[n]); this.cur[n] = b[n]; }
  }
  clear() { for (const n of BTN) { this.pressed[n] = false; } }
}
// gamepad start -> pause
let _padStart = 0;
function pollPadStart() { const p = padRead(0); const s = p ? p.start : 0; if (s && !_padStart) Hooks.pause && Hooks.pause(); _padStart = s; }

// touch joystick + buttons
(() => {
  const zone = $('#stickZone'), base = $('#stickBase'), knob = $('#stickKnob');
  let id = null, ox = 0, oy = 0;
  zone.addEventListener('pointerdown', e => {
    e.preventDefault(); Sound.unlock();
    if (id !== null) return;
    id = e.pointerId; zone.setPointerCapture(id); ox = e.clientX; oy = e.clientY;
    base.style.left = ox + 'px'; base.style.top = oy + 'px'; base.classList.remove('hide');
    knob.style.transform = ''; $('#stickHint').classList.add('hide');
  });
  zone.addEventListener('pointermove', e => {
    if (e.pointerId !== id) return;
    let dx = e.clientX - ox, dy = e.clientY - oy; const l = Math.hypot(dx, dy), R = 52;
    if (l > R) { dx *= R / l; dy *= R / l; }
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    const m = Math.min(1, l / R); const a = Math.atan2(dy, dx);
    TouchCtl.x = m > 0.15 ? Math.cos(a) * m : 0; TouchCtl.y = m > 0.15 ? Math.sin(a) * m : 0;
  });
  const up = e => { if (e.pointerId !== id) return; id = null; TouchCtl.x = TouchCtl.y = 0; base.classList.add('hide'); };
  zone.addEventListener('pointerup', up); zone.addEventListener('pointercancel', up);
  for (const [bid, n] of [['tPick', 'pick'], ['tAct', 'act'], ['tDash', 'dash'], ['tSwap', 'swap']]) {
    const el = $('#' + bid);
    el.addEventListener('pointerdown', e => { e.preventDefault(); el.setPointerCapture(e.pointerId); TouchCtl[n] = 1; el.classList.add('on'); Sound.unlock(); });
    const u = () => { TouchCtl[n] = 0; el.classList.remove('on'); };
    el.addEventListener('pointerup', u); el.addEventListener('pointercancel', u); el.addEventListener('lostpointercapture', u);
    el.addEventListener('contextmenu', e => e.preventDefault());
  }
})();

// ================================================================ save
const Save = (() => {
  const KEY = 'futanKitchen1';
  let d = {};
  try { d = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { d = {}; }
  d.stars = d.stars || {}; d.best = d.best || {};
  if (!d.diff) d.diff = 'easy';
  if (d.voice == null) d.voice = 1;
  if (d.snd == null) d.snd = 1;
  return {
    d,
    write() { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { } },
  };
})();

// ================================================================ particles
const Parts = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  const s = document.createElement('canvas'); s.width = s.height = 64;
  const y = s.getContext('2d'); y.fillStyle = '#fff'; y.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 12 : 30, a = i / 10 * TAU - Math.PI / 2; y.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); }
  y.fill();
  const starTex = new THREE.CanvasTexture(s);
  const mats = {};
  const mat = (col, add, star) => { const k = col + '|' + add + '|' + star; return mats[k] || (mats[k] = new THREE.SpriteMaterial({ map: star ? starTex : tex, color: col, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending })); };
  const list = [];
  return {
    add(pos, o) {
      const sp = new THREE.Sprite(mat(o.col || 0xffffff, !!o.add, !!o.star).clone());
      sp.position.copy(pos); const sz = o.size || 0.3; sp.scale.set(sz, sz, sz);
      scene.add(sp);
      list.push({ sp, vx: o.vx || 0, vy: o.vy || 0, vz: o.vz || 0, g: o.g || 0, life: 0, max: o.life || 1, s0: sz, s1: o.grow != null ? o.grow : sz, op: o.op != null ? o.op : 1, drag: o.drag || 0 });
    },
    burst(pos, n, o) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, sp = rnd(0.5, 1) * (o.spd || 2); this.add(pos, Object.assign({}, o, { vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: rnd(0.5, 1) * (o.up || 2) })); } },
    update(dt) {
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i]; p.life += dt; const k = p.life / p.max;
        if (k >= 1) { scene.remove(p.sp); p.sp.material.dispose(); list.splice(i, 1); continue; }
        p.vy -= p.g * dt; const dr = Math.exp(-p.drag * dt); p.vx *= dr; p.vz *= dr; p.vy *= p.drag ? dr : 1;
        p.sp.position.x += p.vx * dt; p.sp.position.y += p.vy * dt; p.sp.position.z += p.vz * dt;
        const s = lerp(p.s0, p.s1, k); p.sp.scale.set(s, s, s);
        p.sp.material.opacity = p.op * (1 - k * k);
      }
    },
    clear() { for (const p of list) { scene.remove(p.sp); p.sp.material.dispose(); } list.length = 0; },
  };
})();
