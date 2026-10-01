// ================================================================ audio (all synthesized chiptune)
const NOTE_I = { c: 0, 'c#': 1, d: 2, 'd#': 3, e: 4, f: 5, 'f#': 6, g: 7, 'g#': 8, a: 9, 'a#': 10, b: 11 };
const noteHz = n => 440 * Math.pow(2, (n - 69) / 12);
function parseNotes(s) {
  const out = [];
  for (const tok of s.trim().split(/\s+/)) {
    let [n, l] = tok.split(':'); l = l ? +l : 1;
    if (n === 'r') { out.push([null, l]); continue; }
    const m = n.match(/^([a-g]#?)(\d)$/);
    if (!m) { console.warn('bad note', tok); continue; }
    out.push([12 * (+m[2] + 1) + NOTE_I[m[1]], l]);
  }
  return out;
}
const CHORDS = {
  C: [0, 4, 7], Cm: [0, 3, 7], D: [2, 6, 9], Dm: [2, 5, 9], E: [4, 8, 11], Em: [4, 7, 11], F: [5, 9, 12], G: [7, 11, 14],
  A: [9, 13, 16], Am: [9, 12, 16], B: [11, 15, 18], Bb: [10, 14, 17], Ab: [8, 12, 15], Eb: [3, 7, 10],
};
function bassLine(ch, oct = 3) {
  const out = [];
  for (const c of ch.split(/\s+/)) {
    const t = CHORDS[c], r = 12 * (oct + 1) + t[0], f = r + (t[2] - t[0]);
    out.push([r, 1], [r + 12, 1], [f, 1], [r + 12, 1], [r, 1], [r + 12, 1], [f, 1], [r + 12, 1]);
  }
  return out;
}
function arpLine(ch, oct = 4) {
  const out = [];
  for (const c of ch.split(/\s+/)) {
    const t = CHORDS[c].map(x => x + 12 * (oct + 1));
    for (const k of [0, 1, 2, 1, 0, 1, 2, 1]) out.push([t[k], 1]);
  }
  return out;
}
const SONGS = {
  title: { bpm: 132, ch: 'C G Am F C G F G', lead: 'g4 c5 e5 g5:2 e5 g5 c6 b5:3 a5 g5:2 d5:2 a5:2 c6 a5 e5:2 a5 c6 c6:3 a5 f5:4 e5 g5 c6 e6:2 d6 c6 g5 d6:3 b5 g5:2 b5 d6 c6 a5 f5 a5 c6:2 a6:2 g6:4 f6 e6 d6 b5', drum: 'k.h.s.h.' },
  town: { bpm: 104, ch: 'F C Dm Bb F C Bb C', lead: 'a4 c5 f5:2 e5 f5 g5:2 e5:3 c5 g4:4 f5 e5 d5:2 a4 d5 f5:2 d5:4 r:2 a#4 c5 a4 c5 f5:2 g5 a5 c6:2 g5:3 e5 c5:4 d5 f5 a#5:2 a5 g5 f5 d5 e5:2 g5:2 c5:4', drum: 'k...h...' },
  route: { bpm: 144, ch: 'G C D G Em C D D', lead: 'd5 g5 g5 a5 b5:2 a5 g5 e5:2 g5 e5 c5:4 d5 f#5 a5 d6:2 c6 b5 a5 b5:3 g5 d5:4 e5 g5 b5 e6:2 d6 b5 g5 c6:2 e6 c6 g5:2 e5 g5 a5:2 f#5 a5 d6:2 c6 a5 f#5:4 a5:2 d5:2', drum: 'k.h.s.hh' },
  wild: { bpm: 168, ch: 'Am Am F G Am Am F E', lead: 'a4 c5 e5 a5 g5 e5 c5 e5 a5:2 b5 c6 b5 a5 e5:2 f5 a5 c6 f6 e6 c6 a5 c6 d6:2 b5 g5 d5:2 g5 b5 a5 e6 a5 e6 c6 b5 a5 e5 c6:2 d6 e6 d6 c6 b5:2 a5 f5 a5 c6 f6:2 e6 d6 e6:2 d6 c6 b5:2 g#5:2', drum: 'k.hsk.hs' },
  trainer: { bpm: 160, ch: 'Dm Dm Bb C Dm Dm Bb A', lead: 'd5:2 d5 f5 a5:2 g5 f5 e5 f5 g5 a5:3 d6 c6 a#5:2 a5 g5 f5:2 d5 f5 g5:3 e5 c5:2 e5 g5 d6:2 c6 a5 d6:2 e6 f6 e6 d6 c6 a5 c6:2 d6:2 a#5 a5 g5 f5 d6:2 a#5:2 a5:4 c#6:2 e6:2', drum: 'k.hsk.hs' },
  boss: { bpm: 176, ch: 'Em C D B Em C Am B', lead: 'e5 e5 g5 e5 b5:2 a5 g5 c6:2 b5 a5 g5:2 e5 g5 f#5 a5 d6 a5 f#6:2 e6 d6 d#6:3 b5 f#5:2 a5 b5 e6 b5 g5 e6 g6:2 f#6 e6 e6 c6 g5 e6 c6:2 d6 e6 c6 a5 e5 a5 c6:2 b5 a5 b5:4 d#6:2 f#6:2', drum: 'kkhskkhs' },
  center: { bpm: 112, ch: 'C Am F G C Am Dm G', lead: 'e5 g5 c6:2 b5 c6 g5:2 a5:3 g5 e5:4 f5 a5 c6:2 d6 c6 a5:2 g5:6 r:2 e5 g5 c6:2 e6 d6 c6:2 a5:3 c6 e6:4 f6 e6 d6:2 c6 a5 f5:2 g5:4 b5:2 d6:2', drum: '' },
  cave: { bpm: 96, ch: 'Am Em F E', lead: 'e5:2 r a4 c5:2 b4 a4 b4:4 g4:2 r:2 c5:2 r f4 a4:2 c5 e5 d#5:4 b4:4', drum: 'k.......' },
  kazan: { bpm: 150, ch: 'Cm Cm Ab G', lead: 'c5 c5 r c5 d#5:2 c5 g4 c5 d5 d#5 f5 g5:2 f5 d#5 g#5:2 g5 f5 d#5:2 c5 d#5 d5:2 b4 g4 b4:2 d5:2', drum: 'k.k.s.k.' },
  victory: { bpm: 140, ch: 'C F G C', lead: 'c5 e5 g5 c6:5 a5 c6 f6:2 e6 d6 c6:2 b5 d6 g6:2 f6 e6 d6:2 e6:4 c6:4', drum: 'k.h.s.h.' },
  ending: { bpm: 100, ch: 'F Am Bb C F Am Bb F', lead: 'c5 f5 a5 c6:5 e5:2 a5 c6 e6:4 d6 c6 a#5 a5 f5:4 g5:6 c5 e5 f5 a5 c6 f6:5 e6 c6 a5 c6 e6:4 d6 a#5 f5 d6 c6:4 f5:8', drum: 'k...h...' },
  legend: { bpm: 120, ch: 'Em Em C B', lead: 'e4:2 b4:2 e5:3 d5 c5:2 b4:2 a4:2 b4:2 c5:4 e5:2 g5:2 f#5:6 d#5:2', drum: 'k...k.s.' },
};
const JINGLES = {
  heal: { bpm: 150, lead: 'c5 e5 g5 c6:2 g5 c6:4', bass: 'c3:2 g3:2 c4:4' },
  level: { bpm: 170, lead: 'c5 e5 g5 c6 e6:2 g6:4', bass: 'c3 e3 g3 c4 e4:2 c4:4' },
  caught: { bpm: 150, lead: 'g5 g5 g5 c6:3 b5 a5 b5 c6:4', bass: 'c3:2 c3 e3:2 g3 f3 g3 c3:4' },
  badge: { bpm: 140, lead: 'c5 c5 c5 e5:2 d5 e5 g5:2 f5 g5 c6:6', bass: 'c3:3 e3:3 g3:3 c4:6' },
  evo: { bpm: 150, lead: 'c5 e5 g5 c6 d6 e6 g6:2 e6 c6:4', bass: 'c3:4 g3:4 c4:4' },
  item: { bpm: 160, lead: 'g5 a5 b5 d6:2 b5 d6:3', bass: 'g3:4 d4:5' },
};

const AU = {
  ctx: null, master: null, music: null, sfxG: null, cur: null, curName: '', timer: null, muted: false,
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.55; this.master.connect(this.ctx.destination);
    this.music = this.ctx.createGain(); this.music.gain.value = 0.32; this.music.connect(this.master);
    this.sfxG = this.ctx.createGain(); this.sfxG.gain.value = 0.7; this.sfxG.connect(this.master);
    const len = this.ctx.sampleRate; const b = this.ctx.createBuffer(1, len, len); const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = b;
    this.waves = {};
    for (const duty of [0.125, 0.25, 0.5]) {
      const n = 32, re = new Float32Array(n), im = new Float32Array(n);
      for (let k = 1; k < n; k++) im[k] = 2 / (k * Math.PI) * Math.sin(k * Math.PI * duty) * 1.0;
      for (let k = 1; k < n; k++) { re[k] = im[k]; im[k] = 0; }
      this.waves[duty] = this.ctx.createPeriodicWave(re, im);
    }
    if (this.pending) { const p = this.pending; this.pending = null; this.bgm(p); }
  },
  tone(t, hz, dur, vol, type, dest, slide) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    if (typeof type === 'number') o.setPeriodicWave(this.waves[type]); else o.type = type;
    o.frequency.setValueAtTime(hz, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.setValueAtTime(vol, t + Math.max(0.01, dur - 0.04)); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(dest || this.sfxG); o.start(t); o.stop(t + dur + 0.02);
  },
  nz(t, dur, vol, hp, dest, lp) {
    const c = this.ctx, s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    s.buffer = this.noise; f.type = 'highpass'; f.frequency.value = hp || 800;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f);
    if (lp) { const l = c.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = lp; f.connect(l); l.connect(g); } else f.connect(g);
    g.connect(dest || this.sfxG); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  },
  // ---------------------------------------------------- music
  bgm(name) {
    if (!this.ctx) { this.pending = name; return; }
    if (this.curName === name) return;
    this.stopBgm();
    this.curName = name;
    if (!name) return;
    const s = SONGS[name]; if (!s) return;
    const tracks = [
      { notes: parseNotes(s.lead), type: 0.5, vol: 0.16, oct: 0 },
      { notes: bassLine(s.ch), type: 'triangle', vol: 0.34, oct: 0 },
      { notes: arpLine(s.ch), type: 0.125, vol: 0.05, oct: 0 },
    ];
    const total = tracks[0].notes.reduce((a, n) => a + n[1], 0);
    if (DEBUG && total !== tracks[1].notes.length) console.warn('song len', name, total, tracks[1].notes.length);
    const unit = 60 / s.bpm / 2;
    const st = { tracks, unit, t0: this.ctx.currentTime + 0.08, drum: s.drum, pos: tracks.map(() => ({ i: 0, t: 0 })), dpos: 0, dt: 0 };
    for (const p of st.pos) p.t = st.t0; st.dt = st.t0;
    this.cur = st;
    const sched = () => {
      const now = this.ctx.currentTime, until = now + 0.2;
      tracks.forEach((tr, k) => {
        const p = st.pos[k];
        while (p.t < until) {
          const [n, l] = tr.notes[p.i];
          if (n != null) this.tone(p.t, noteHz(n), l * unit * 0.92, tr.vol, tr.type, this.music);
          p.t += l * unit; p.i = (p.i + 1) % tr.notes.length;
        }
      });
      if (st.drum) while (st.dt < until) {
        const ch = st.drum[st.dpos % st.drum.length];
        if (ch === 'k') this.tone(st.dt, 150, 0.09, 0.3, 'sine', this.music, 45);
        if (ch === 's') this.nz(st.dt, 0.08, 0.16, 1500, this.music);
        if (ch === 'h') this.nz(st.dt, 0.03, 0.07, 6000, this.music);
        st.dt += unit; st.dpos++;
      }
    };
    sched();
    this.timer = setInterval(sched, 40);
  },
  stopBgm() { if (this.timer) clearInterval(this.timer); this.timer = null; this.cur = null; this.curName = ''; },
  jingle(name) {
    if (!this.ctx) return 0;
    const j = JINGLES[name]; const unit = 60 / j.bpm / 2;
    const t0 = this.ctx.currentTime + 0.03;
    let t = t0; for (const [n, l] of parseNotes(j.lead)) { if (n != null) this.tone(t, noteHz(n), l * unit * 0.9, 0.2, 0.5); t += l * unit; }
    let tb = t0; for (const [n, l] of parseNotes(j.bass)) { if (n != null) this.tone(tb, noteHz(n), l * unit * 0.9, 0.3, 'triangle'); tb += l * unit; }
    return (t - t0) * 1000;
  },
  // play a jingle while pausing bgm, then resume it
  async fanfare(name) {
    const prev = this.curName; this.stopBgm();
    const ms = this.jingle(name);
    await wait(Math.ceil(ms / 16.7) + 10);
    if (prev) this.bgm(prev);
  },
  // ---------------------------------------------------- sfx
  sfx(name) {
    if (!this.ctx) return; const t = this.ctx.currentTime + 0.005;
    switch (name) {
      case 'sel': this.tone(t, 1320, 0.05, 0.12, 0.5); break;
      case 'ok': this.tone(t, 990, 0.04, 0.12, 0.5); this.tone(t + 0.045, 1480, 0.06, 0.12, 0.5); break;
      case 'cancel': this.tone(t, 700, 0.06, 0.1, 0.5); break;
      case 'bump': this.tone(t, 90, 0.1, 0.25, 0.5); break;
      case 'door': this.nz(t, 0.2, 0.2, 300, null, 2000); this.tone(t, 300, 0.12, 0.08, 0.25, null, 150); break;
      case 'step': this.nz(t, 0.03, 0.05, 2000); break;
      case 'ledge': this.tone(t, 300, 0.18, 0.12, 0.5, null, 900); break;
      case 'excl': this.tone(t, 1760, 0.06, 0.13, 0.5); this.tone(t + 0.08, 1760, 0.1, 0.13, 0.5); break;
      case 'hit': this.nz(t, 0.18, 0.4, 300, null, 3000); this.tone(t, 160, 0.12, 0.3, 'square', null, 60); break;
      case 'superhit': this.nz(t, 0.3, 0.5, 200, null, 4000); this.tone(t, 220, 0.2, 0.3, 'square', null, 50); this.tone(t + 0.1, 120, 0.2, 0.25, 'square', null, 40); break;
      case 'weakhit': this.nz(t, 0.1, 0.25, 900, null, 2500); break;
      case 'miss': this.tone(t, 600, 0.15, 0.08, 0.5, null, 300); break;
      case 'faint': this.tone(t, 800, 0.5, 0.15, 0.5, null, 80); break;
      case 'throw': this.tone(t, 400, 0.3, 0.1, 0.25, null, 1600); break;
      case 'pop': this.nz(t, 0.12, 0.3, 2000); this.tone(t, 1200, 0.15, 0.12, 0.5, null, 2400); break;
      case 'shake': this.tone(t, 220, 0.05, 0.2, 'square'); this.tone(t + 0.07, 180, 0.05, 0.2, 'square'); break;
      case 'click': this.tone(t, 2400, 0.04, 0.15, 0.5); this.tone(t + 0.05, 1800, 0.05, 0.12, 0.5); break;
      case 'breakout': this.nz(t, 0.25, 0.35, 500); this.tone(t, 900, 0.2, 0.12, 0.5, null, 300); break;
      case 'exp': this.tone(t, 600, 0.6, 0.06, 0.25, null, 1800); break;
      case 'heal': for (let i = 0; i < 4; i++) this.tone(t + i * 0.06, 880 + i * 220, 0.08, 0.1, 0.5); break;
      case 'up': for (let i = 0; i < 3; i++) this.tone(t + i * 0.07, 500 + i * 200, 0.08, 0.1, 0.25); break;
      case 'down': for (let i = 0; i < 3; i++) this.tone(t + i * 0.07, 900 - i * 200, 0.08, 0.1, 0.25); break;
      case 'run': for (let i = 0; i < 3; i++) this.nz(t + i * 0.09, 0.07, 0.2, 1200); break;
      case 'save': this.tone(t, 880, 0.08, 0.12, 0.5); this.tone(t + 0.1, 1320, 0.15, 0.12, 0.5); break;
      case 'quake': this.nz(t, 1.2, 0.5, 30, null, 300); this.tone(t, 50, 1.2, 0.3, 'sawtooth', null, 30); break;
      case 'swirl': for (let i = 0; i < 8; i++) this.tone(t + i * 0.05, 400 + (i % 2) * 300, 0.05, 0.08, 0.5); break;
      case 'fire': this.nz(t, 0.5, 0.3, 400, null, 2500); break;
      case 'water': for (let i = 0; i < 5; i++) this.tone(t + i * 0.06, 500 + Math.random() * 600, 0.06, 0.08, 'sine', null, 1500); break;
      case 'leaf': for (let i = 0; i < 4; i++) this.nz(t + i * 0.07, 0.06, 0.15, 3000); break;
      case 'zap': for (let i = 0; i < 6; i++) this.tone(t + i * 0.04, 1500 + Math.random() * 1500, 0.04, 0.08, 'sawtooth'); break;
      case 'rock': this.nz(t, 0.3, 0.4, 100, null, 900); this.tone(t, 120, 0.2, 0.2, 'square', null, 50); break;
      case 'psy': this.tone(t, 300, 0.5, 0.1, 'sine', null, 1200); this.tone(t, 310, 0.5, 0.1, 'sine', null, 1250); break;
      case 'wind': this.nz(t, 0.4, 0.2, 1500, null, 4000); break;
      case 'stat': this.tone(t, 400, 0.25, 0.1, 0.25, null, 1200); break;
    }
  },
  cry(id, pitch = 1) {
    if (!this.ctx) return; const t = this.ctx.currentTime + 0.01;
    const base = (220 + ((id * 97) % 13) * 45) * pitch, shape = id % 3;
    const c = this.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    o.setPeriodicWave(this.waves[shape === 0 ? 0.5 : shape === 1 ? 0.25 : 0.125]); o2.type = 'sawtooth';
    lfo.frequency.value = 18 + (id % 5) * 6; lg.gain.value = base * 0.06; lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
    o.frequency.setValueAtTime(base, t); o.frequency.linearRampToValueAtTime(base * (1.3 + (id % 4) * 0.15), t + 0.12); o.frequency.linearRampToValueAtTime(base * 0.8, t + 0.45);
    o2.frequency.setValueAtTime(base * 0.5, t); o2.frequency.linearRampToValueAtTime(base * 0.4, t + 0.45);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.02); g.gain.setValueAtTime(0.16, t + 0.3); g.gain.linearRampToValueAtTime(0, t + 0.5);
    o.connect(g); o2.connect(g); g.connect(this.sfxG);
    for (const x of [o, o2, lfo]) { x.start(t); x.stop(t + 0.55); }
  },
};
