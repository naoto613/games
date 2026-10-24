'use strict';
// ===== 基本定数・ユーティリティ =====
const W = 320, H = 240, TS = 16, ROWS = 15, SC = 2;
const cv = document.getElementById('cv');
let ctx = cv.getContext('2d');
cv.width = W * SC; cv.height = H * SC;

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const irnd = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const sign = v => v < 0 ? -1 : 1;
function mulberry(s) {
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
const QS = new URLSearchParams(location.search);
const DEBUG = QS.has('debug');

// ===== 入力 =====
const Input = {
  held: {}, pressed: {}, released: {},
  down(a) { if (!this.held[a]) this.pressed[a] = true; this.held[a] = true; Sound.unlock(); },
  up(a) { if (this.held[a]) this.released[a] = true; this.held[a] = false; },
  end() { this.pressed = {}; this.released = {}; },
  any() { for (const k in this.pressed) if (this.pressed[k]) return true; return false; },
};
const KEYS = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  KeyZ: 'jump', Space: 'jump', KeyX: 'shoot', KeyC: 'slide', KeyV: 'slide',
  KeyA: 'prev', KeyS: 'next', KeyQ: 'prev', KeyW: 'next',
  Enter: 'start', Escape: 'start', KeyP: 'start', KeyM: 'mute',
};
addEventListener('keydown', e => {
  const a = KEYS[e.code];
  if (a) { e.preventDefault(); if (!e.repeat) Input.down(a); }
});
addEventListener('keyup', e => { const a = KEYS[e.code]; if (a) { e.preventDefault(); Input.up(a); } });
addEventListener('blur', () => { for (const k in Input.held) Input.up(k); });

let padPrev = {};
function pollPad() {
  const gps = navigator.getGamepads ? navigator.getGamepads() : [];
  let gp = null;
  for (const g of gps) if (g) { gp = g; break; }
  if (!gp) return;
  const b = i => gp.buttons[i] && gp.buttons[i].pressed;
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  const st = {
    left: b(14) || ax < -0.4, right: b(15) || ax > 0.4, up: b(12) || ay < -0.5, down: b(13) || ay > 0.5,
    jump: b(0), shoot: b(2) || b(1), slide: b(3) || b(7) || b(6), prev: b(4), next: b(5), start: b(9) || b(8),
  };
  for (const k in st) {
    if (st[k] && !padPrev[k]) Input.down(k);
    if (!st[k] && padPrev[k]) Input.up(k);
  }
  padPrev = st;
}

function setupTouch() {
  document.querySelectorAll('[data-act]').forEach(el => {
    const a = el.dataset.act;
    const on = e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (_) {} Input.down(a); el.classList.add('on'); };
    const off = e => { e.preventDefault(); Input.up(a); el.classList.remove('on'); };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointercancel', off);
    el.addEventListener('lostpointercapture', off);
    el.addEventListener('contextmenu', e => e.preventDefault());
  });
  const pad = document.getElementById('dpad');
  if (!pad) return;
  let pid = null;
  const dirs = ['left', 'right', 'up', 'down'];
  const upd = e => {
    const r = pad.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const dead = r.width * 0.13;
    const s = {
      left: dx < -dead && Math.abs(dx) > Math.abs(dy) * 0.45,
      right: dx > dead && Math.abs(dx) > Math.abs(dy) * 0.45,
      up: dy < -dead && Math.abs(dy) > Math.abs(dx) * 0.45,
      down: dy > dead && Math.abs(dy) > Math.abs(dx) * 0.45,
    };
    for (const k of dirs) s[k] ? Input.down(k) : Input.up(k);
    pad.dataset.dir = dirs.filter(k => s[k]).join(' ');
  };
  const clr = () => { dirs.forEach(k => Input.up(k)); pid = null; pad.dataset.dir = ''; };
  pad.addEventListener('pointerdown', e => { e.preventDefault(); pid = e.pointerId; try { pad.setPointerCapture(e.pointerId); } catch (_) {} upd(e); });
  pad.addEventListener('pointermove', e => { if (e.pointerId === pid) upd(e); });
  pad.addEventListener('pointerup', clr);
  pad.addEventListener('pointercancel', clr);
  pad.addEventListener('lostpointercapture', clr);
}

// ===== サウンド（WebAudio で合成） =====
const midiF = m => 440 * Math.pow(2, (m - 69) / 12);
const Sound = {
  ac: null, master: null, music: null, sfx: null, noiseBuf: null, muted: false, pending: null,
  unlock() {
    if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ac = this.ac = new AC();
    this.master = ac.createGain(); this.master.gain.value = this.muted ? 0 : 0.55; this.master.connect(ac.destination);
    this.music = ac.createGain(); this.music.gain.value = 0.32; this.music.connect(this.master);
    this.sfx = ac.createGain(); this.sfx.gain.value = 0.6; this.sfx.connect(this.master);
    const n = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuf = n;
    if (this.pending) { const p = this.pending; this.pending = null; Music.play(p); }
  },
  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.55;
  },
  tone(f, dur, type = 'square', vol = 0.3, slide = 1, when = 0, dest = null) {
    const ac = this.ac; if (!ac) return;
    const t = when || ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide !== 1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.setValueAtTime(vol, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(dest || this.sfx);
    o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol = 0.3, freq = 1200, type = 'lowpass', when = 0, dest = null, slide = 1) {
    const ac = this.ac; if (!ac) return;
    const t = when || ac.currentTime;
    const s = ac.createBufferSource(); s.buffer = this.noiseBuf;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t);
    if (slide !== 1) f.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.sfx);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  },
};
const SFX = {
  shoot() { Sound.tone(1100, 0.07, 'square', 0.12, 0.45); },
  half() { Sound.tone(520, 0.14, 'square', 0.18, 2.2); },
  full() { Sound.tone(260, 0.28, 'sawtooth', 0.22, 3.5); Sound.noise(0.2, 0.15, 3000, 'highpass'); },
  chargeTick(lv) { Sound.tone(lv > 1 ? 1400 : 900, 0.04, 'triangle', 0.06); },
  land() { Sound.tone(140, 0.05, 'triangle', 0.2, 0.6); },
  hurt() { Sound.tone(700, 0.08, 'square', 0.22, 0.5); Sound.tone(350, 0.18, 'square', 0.18, 0.4, Sound.ac && Sound.ac.currentTime + 0.07); },
  hit() { Sound.tone(260, 0.06, 'square', 0.16, 0.5); },
  bossHit() { Sound.tone(180, 0.1, 'sawtooth', 0.22, 0.5); Sound.noise(0.08, 0.15, 2000); },
  tink() { Sound.tone(2200, 0.05, 'triangle', 0.15, 1.2); },
  explode() { Sound.noise(0.45, 0.35, 900, 'lowpass', 0, null, 0.2); Sound.tone(120, 0.3, 'square', 0.12, 0.3); },
  bigExplode() { Sound.noise(1.2, 0.45, 1400, 'lowpass', 0, null, 0.1); Sound.tone(90, 0.8, 'sawtooth', 0.18, 0.3); },
  item() { const t = Sound.ac && Sound.ac.currentTime; [0, 1, 2].forEach(i => Sound.tone(880 * [1, 1.25, 1.5][i], 0.06, 'square', 0.1, 1, t + i * 0.05)); },
  energy() { Sound.tone(1500, 0.03, 'square', 0.06); },
  bolt() { Sound.tone(1800, 0.05, 'triangle', 0.15); Sound.tone(2400, 0.08, 'triangle', 0.12, 1, Sound.ac && Sound.ac.currentTime + 0.05); },
  oneup() { const t = Sound.ac && Sound.ac.currentTime; [0, 4, 7, 12, 16, 19].forEach((n, i) => Sound.tone(midiF(72 + n), 0.07, 'square', 0.1, 1, t + i * 0.06)); },
  menu() { Sound.tone(900, 0.04, 'square', 0.1); },
  select() { Sound.tone(660, 0.06, 'square', 0.12); Sound.tone(990, 0.1, 'square', 0.12, 1, Sound.ac && Sound.ac.currentTime + 0.06); },
  door() { Sound.noise(0.35, 0.2, 500, 'lowpass'); Sound.tone(80, 0.35, 'square', 0.08, 0.8); },
  death() { const t = Sound.ac && Sound.ac.currentTime; for (let i = 0; i < 6; i++) Sound.tone(900 - i * 120, 0.12, 'square', 0.12, 0.6, t + i * 0.07); Sound.noise(0.6, 0.25, 1200, 'lowpass', 0, null, 0.2); },
  fall() { Sound.tone(700, 0.5, 'square', 0.15, 0.2); },
  warp() { Sound.tone(300, 0.25, 'square', 0.12, 4); },
  warpIn() { Sound.tone(1200, 0.25, 'square', 0.12, 0.25); },
  fire() { Sound.noise(0.25, 0.2, 1400, 'bandpass', 0, null, 0.4); },
  zap() { Sound.tone(1800, 0.12, 'sawtooth', 0.12, 0.3); Sound.noise(0.1, 0.12, 4000, 'highpass'); },
  bubble() { Sound.tone(500, 0.12, 'sine', 0.2, 2.2); },
  ice() { Sound.tone(2400, 0.12, 'triangle', 0.12, 0.6); },
  wind() { Sound.noise(0.5, 0.16, 800, 'bandpass', 0, null, 2.5); },
  nova() { Sound.tone(200, 0.8, 'sawtooth', 0.2, 6); Sound.noise(0.8, 0.25, 3000, 'highpass'); },
  leaf() { Sound.noise(0.15, 0.12, 2500, 'bandpass'); },
  rock() { Sound.noise(0.2, 0.25, 400, 'lowpass'); Sound.tone(100, 0.12, 'square', 0.1, 0.5); },
  quake() { Sound.noise(0.6, 0.35, 250, 'lowpass'); },
  enemyShot() { Sound.tone(600, 0.06, 'square', 0.07, 0.6); },
  pause() { Sound.tone(500, 0.05, 'square', 0.1); Sound.tone(750, 0.08, 'square', 0.1, 1, Sound.ac && Sound.ac.currentTime + 0.05); },
  buy() { SFX.item(); },
  deny() { Sound.tone(150, 0.15, 'square', 0.15); },
  hpFill() { Sound.tone(1300, 0.025, 'square', 0.05); },
};

// ===== 音楽（簡易シーケンサ + 自動作曲） =====
const Music = {
  cur: null, step: 0, nextT: 0, timer: null,
  play(song) {
    if (!song) return this.stop();
    if (!Sound.ac) { this.pending = song; Sound.pending = song; return; }
    if (this.cur === song) return;
    this.stop(); this.cur = song; this.step = 0; this.nextT = Sound.ac.currentTime + 0.06;
    this.timer = setInterval(() => this.tick(), 25);
  },
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; this.cur = null; Sound.pending = null; },
  tick() {
    const s = this.cur, ac = Sound.ac; if (!s || !ac) return;
    const spb = 60 / s.bpm / 4;
    if (this.nextT < ac.currentTime - 0.3) this.nextT = ac.currentTime + 0.02;
    while (this.nextT < ac.currentTime + 0.12) {
      this.playStep(s, this.step, this.nextT, spb);
      this.nextT += spb; this.step++;
      if (this.step >= s.len) {
        if (s.loop === false) { const cb = s.onEnd; this.stop(); if (cb) cb(); return; }
        this.step = s.loopFrom || 0;
      }
    }
  },
  playStep(s, i, t, spb) {
    for (const tr of s.tracks) {
      const n = tr.notes[i]; if (n == null) continue;
      const d = (tr.durs ? tr.durs[i] : 1) * spb * 0.95;
      Sound.tone(midiF(n), Math.max(0.03, d), tr.type, tr.vol, 1, t, Sound.music);
    }
    if (s.drums) {
      const c = s.drums[i % s.drums.length];
      if (c === 'k' || c === 'K') { Sound.tone(150, 0.12, 'sine', 0.5, 0.3, t, Sound.music); }
      if (c === 's' || c === 'K') { Sound.noise(0.1, 0.22, 1800, 'highpass', t, Sound.music); Sound.tone(190, 0.06, 'triangle', 0.15, 0.7, t, Sound.music); }
      if (c === 'h') Sound.noise(0.025, 0.07, 7000, 'highpass', t, Sound.music);
    }
  },
};

const SCALES = { minor: [0, 2, 3, 5, 7, 8, 10], major: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10] };
function genSong(seed, o = {}) {
  const r = mulberry(seed * 9973 + 17);
  const root = o.root ?? 45, bpm = o.bpm ?? 150, scale = SCALES[o.scale || 'minor'];
  const prog = o.prog || [0, 8, 3, 10, 5, 7, 8, 10];
  const bars = prog.length, len = bars * 16;
  const lead = Array(len).fill(null), ldur = Array(len).fill(1);
  const bass = Array(len).fill(null), bdur = Array(len).fill(1.7);
  const arp = Array(len).fill(null);
  const majorQ = o.scale === 'major' ? [0, 5, 7] : [3, 8, 10];
  const semi = d => Math.floor(d / 7) * 12 + scale[((d % 7) + 7) % 7];
  const chordTones = ch => { const q = majorQ.includes(((ch % 12) + 12) % 12) ? 4 : 3; return [ch % 12, (ch + q) % 12, (ch + 7) % 12]; };
  const mkR = () => {
    const a = [];
    for (let i = 0; i < 32; i++) {
      const strong = i % 4 === 0;
      a.push(r() < (strong ? 0.8 : i % 2 === 0 ? 0.45 : 0.18) * (o.density ?? 1));
    }
    a[0] = true; a[30] = false; a[31] = false; return a;
  };
  const rhA = mkR(), rhB = mkR();
  let deg = 7 + Math.floor(r() * 4);
  const bassPat = o.bassPat || [0, 0, 12, 0, 0, 12, 0, 7];
  for (let bar = 0; bar < bars; bar++) {
    const ch = prog[bar], tones = chordTones(ch), rh = bar < bars / 2 ? rhA : rhB;
    for (let s = 0; s < 16; s++) {
      const i = bar * 16 + s;
      if (s % 2 === 0) bass[i] = root + ch + bassPat[(s / 2) % bassPat.length];
      arp[i] = root + 24 + tones[s % 3] + (s % 6 >= 3 ? 12 : 0);
      if (rh[(bar % 2) * 16 + s]) {
        if (s % 4 === 0) {
          let best = deg, bd = 99;
          for (let d = deg - 3; d <= deg + 3; d++) {
            const m = ((semi(d) % 12) + 12) % 12;
            if (tones.includes(m)) { const dist = Math.abs(d - deg) + r() * 1.5; if (dist < bd) { bd = dist; best = d; } }
          }
          deg = best;
        } else {
          deg += pick([-1, 1, 1, -2, 2, -1, 0]);
        }
        deg = clamp(deg, 3, 15);
        lead[i] = root + 12 + semi(deg);
      }
    }
  }
  for (let i = 0; i < len; i++) if (lead[i] != null) { let d = 1; while (d < 4 && i + d < len && lead[i + d] == null) d++; ldur[i] = d; }
  return {
    bpm, len,
    tracks: [
      { notes: lead, durs: ldur, type: o.lead || 'square', vol: 0.085 },
      { notes: lead.map(n => n == null ? null : n + 12), durs: ldur.map(d => d * 0.5), type: 'triangle', vol: 0.03 },
      { notes: bass, durs: bdur, type: o.bassType || 'triangle', vol: 0.24 },
      { notes: arp, type: 'square', vol: 0.018 },
    ],
    drums: o.drums || 'k.h.s.h.k.khs.h.',
  };
}
function jingle(notes, bpm, onEnd) {
  // notes: [[midi|null, steps], ...]
  const lead = [], dur = [], bass = [];
  for (const [n, d] of notes) { lead.push(n); dur.push(d); bass.push(n == null ? null : n - 24); for (let i = 1; i < d; i++) { lead.push(null); dur.push(1); bass.push(null); } }
  return { bpm, len: lead.length, loop: false, onEnd, tracks: [{ notes: lead, durs: dur, type: 'square', vol: 0.11 }, { notes: bass, durs: dur, type: 'triangle', vol: 0.22 }] };
}

// ===== 描画ヘルパ（ワールド座標で描く） =====
const OUT = '#0b0d16';
function R(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function RR(x, y, w, h, r, c, o = OUT, lw = 0.8) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  ctx.fillStyle = c; ctx.fill();
  if (o) { ctx.lineWidth = lw; ctx.strokeStyle = o; ctx.stroke(); }
}
function CIR(x, y, r, c, o = OUT, lw = 0.8) {
  ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2);
  ctx.fillStyle = c; ctx.fill();
  if (o) { ctx.lineWidth = lw; ctx.strokeStyle = o; ctx.stroke(); }
}
function POLY(pts, c, o = OUT, lw = 0.8) {
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath(); ctx.fillStyle = c; ctx.fill();
  if (o) { ctx.lineWidth = lw; ctx.strokeStyle = o; ctx.stroke(); }
}
function limb(px, py, len, w, ang, c, foot) {
  ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
  RR(-w / 2, -w / 2, w, len + w / 2, w / 2, c);
  if (foot) foot(len);
  ctx.restore();
}
function star(x, y, r1, r2, n, rot, c, o = OUT) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r2 : r1; pts.push(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  POLY(pts, c, o);
}
const FONT = '"DotGothic16","Hiragino Kaku Gothic ProN","Yu Gothic",monospace';
function TXT(s, x, y, size = 8, c = '#fff', align = 'left', shadow = '#000') {
  ctx.font = `${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'top';
  if (shadow) { ctx.fillStyle = shadow; ctx.fillText(s, x + 0.8, y + 0.8); }
  ctx.fillStyle = c; ctx.fillText(s, x, y);
}
function shade(hex, k) {
  // k>0 明るく, k<0 暗く
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  if (k > 0) { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; } else { r *= 1 + k; g *= 1 + k; b *= 1 + k; }
  return '#' + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
}
