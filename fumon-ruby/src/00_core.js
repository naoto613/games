// ================================================================ core
'use strict';
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const chance = p => Math.random() < p;
const W = 240, H = 160, TS = 16;
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
if (isTouch) document.body.classList.add('touch');
const DEBUG = /debug/.test(location.search);

// ---------------------------------------------------------------- canvas / layout
const cv = $('#c');
const ctx = cv.getContext('2d');
let S = 3;
function layout() {
  const vw = innerWidth, vh = innerHeight;
  const port = vh > vw * 1.05;
  document.body.classList.toggle('port', port);
  document.body.classList.toggle('land', !port);
  let cw;
  if (port) {
    cw = Math.min(vw - 16 - 28 - 24, (vh - 16 - 28 - 30 - 150 - 40 - 20) * 1.5);
  } else {
    const ch = Math.min(vh - 16 - 30 - 36 - 40, (vw - 16 - 44 - 132 - 150 - 36 - 52) / 1.5);
    cw = ch * 1.5;
  }
  cw = Math.max(240, Math.floor(cw));
  const ch = Math.round(cw / 1.5);
  document.documentElement.style.setProperty('--cw', cw + 'px');
  document.documentElement.style.setProperty('--ch', ch + 'px');
  S = clamp(Math.ceil(cw * (devicePixelRatio || 1) / W), 2, 6);
  cv.width = W * S; cv.height = H * S;
  ctx.imageSmoothingEnabled = false;
}
addEventListener('resize', layout);
layout();
function resetTf() { ctx.setTransform(S, 0, 0, S, 0, 0); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 1; }

// ---------------------------------------------------------------- input
const IN = { held: {}, pend: new Set(), pressed: new Set(), hold: {}, tap: null, pendTap: null, any: false };
const KEYMAP = {
  ArrowUp: 'U', KeyW: 'U', ArrowDown: 'D', KeyS: 'D', ArrowLeft: 'L', KeyA: 'L', ArrowRight: 'R', KeyD: 'R',
  KeyZ: 'A', Enter: 'A', KeyJ: 'A', KeyX: 'B', Escape: 'B', Backspace: 'B', KeyK: 'B', ShiftLeft: 'B', ShiftRight: 'B',
  Space: 'ST', KeyC: 'ST', KeyV: 'SE', Tab: 'SE',
};
function press(b) { if (!IN.held[b]) IN.pend.add(b); IN.held[b] = true; AU.unlock(); }
function release(b) { IN.held[b] = false; }
addEventListener('keydown', e => {
  const b = KEYMAP[e.code]; if (!b) return;
  e.preventDefault(); if (e.repeat) return; press(b);
});
addEventListener('keyup', e => { const b = KEYMAP[e.code]; if (b) { e.preventDefault(); release(b); } });
addEventListener('blur', () => { for (const k in IN.held) IN.held[k] = false; });
function bindBtn(el, b) {
  const on = e => { e.preventDefault(); el.setPointerCapture && el.setPointerCapture(e.pointerId); el.classList.add('on'); press(b); };
  const off = e => { e.preventDefault(); el.classList.remove('on'); release(b); };
  el.addEventListener('pointerdown', on);
  el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off);
}
bindBtn($('#bA'), 'A'); bindBtn($('#bB'), 'B'); bindBtn($('#bSt'), 'ST'); bindBtn($('#bSel'), 'SE');
(function dpad() {
  const el = $('#dp'); let pid = null, cur = null;
  const set = d => {
    if (d === cur) return;
    if (cur) release(cur);
    cur = d; if (d) press(d);
    el.className = d ? 'p' + d.toLowerCase() : '';
  };
  const dir = e => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(x, y) < 10) return cur;
    return Math.abs(x) > Math.abs(y) ? (x > 0 ? 'R' : 'L') : (y > 0 ? 'D' : 'U');
  };
  el.addEventListener('pointerdown', e => { e.preventDefault(); pid = e.pointerId; el.setPointerCapture(pid); set(dir(e)); });
  el.addEventListener('pointermove', e => { if (e.pointerId === pid) set(dir(e)); });
  const up = e => { if (e.pointerId === pid) { pid = null; set(null); } };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
})();
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); AU.unlock();
  const r = cv.getBoundingClientRect();
  IN.pendTap = { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
});
for (const ev of ['touchend', 'click', 'keyup']) document.addEventListener(ev, () => AU.unlock(), { passive: true });
const btn = b => !!IN.held[b];
const btnp = b => IN.pressed.has(b);
// menu-style repeat
function btnr(b) {
  if (IN.pressed.has(b)) return true;
  const h = IN.hold[b] || 0;
  return h > 16 && h % 5 === 0;
}
function eatInput() { IN.pressed.clear(); IN.tap = null; }
const tapIn = (x, y, w, h) => IN.tap && IN.tap.x >= x && IN.tap.x < x + w && IN.tap.y >= y && IN.tap.y < y + h;
const okp = () => btnp('A') || !!IN.tap;

// ---------------------------------------------------------------- loop
let frame = 0;
const waiters = [];
const tick = () => new Promise(r => waiters.push(r));
async function wait(n) { for (let i = 0; i < n; i++) await tick(); }
const updaters = [];  // per-tick functions (sync)
let renderFn = () => { };
let lastT = 0, acc = 0;
function loop(t) {
  requestAnimationFrame(loop);
  const dt = Math.min(100, t - (lastT || t)); lastT = t;
  acc += dt;
  if (acc < 1000 / 61) return;
  acc = Math.min(acc - 1000 / 60, 1000 / 60);
  // input snapshot
  IN.pressed = IN.pend; IN.pend = new Set();
  IN.tap = IN.pendTap; IN.pendTap = null;
  for (const k of ['U', 'D', 'L', 'R', 'A', 'B']) IN.hold[k] = IN.held[k] ? (IN.hold[k] || 0) + 1 : 0;
  frame++;
  const ws = waiters.splice(0);
  for (const f of updaters) f();
  for (const w of ws) w();
  resetTf();
  renderFn();
}
requestAnimationFrame(loop);

// ---------------------------------------------------------------- save helpers
const SAVE_KEY = 'fumon-ruby-save-v1';
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
};
