// ================================================================ audio: small orchestra synth + sequencer
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function midiOf(s) { const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); if (!m) return null; return 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); }
const mhz = n => 440 * Math.pow(2, (n - 69) / 12);
// "C5/1 E5/0.5 r/1" -> [[midi|null, beats]]
function seq(str) { return str.trim().split(/\s+/).filter(t => t && t !== '|').map(t => { const [n, b] = t.split('/'); return [n === 'r' ? null : midiOf(n), +(b || 1)]; }); }
const CH = { C: [0, 4, 7], Dm: [2, 5, 9], Em: [4, 7, 11], F: [5, 9, 12], G: [7, 11, 14], Am: [9, 12, 16], G7: [7, 11, 17], E: [4, 8, 11], Bb: [10, 14, 17], D: [2, 6, 9], A: [9, 13, 16], Bm: [11, 14, 18], 'F#m': [6, 9, 13], Gm: [7, 10, 14], Cm: [0, 3, 7], Eb: [3, 7, 10], Ab: [8, 12, 15], Fm: [5, 8, 12], B7: [11, 15, 18], E7: [4, 8, 14], A7: [9, 13, 19], D7: [2, 6, 12], Edim: [4, 7, 10], Bdim: [11, 14, 17] };
// chords "C:2 G:2" -> [[notes, beats]]
function chords(str, root) { return str.trim().split(/\s+/).filter(t => t !== '|').map(t => { const [c, b] = t.split(':'); return [c === 'r' ? null : CH[c].map(n => n + (root || 60)), +(b || 4)]; }); }
const TRACKS = {
  title: {
    bpm: 92, parts: [
      { ins: 'brass', vol: 0.16, n: seq('G4/0.75 G4/0.25 C5/1 D5/1 E5/1 F5/1.5 E5/0.5 D5/1 C5/1 D5/1 E5/1 F5/1 A5/1 G5/3 r/1 A5/1.5 G5/0.5 F5/1 E5/1 D5/1.5 C5/0.5 D5/1 E5/1 F5/1 E5/1 D5/1 B4/1 C5/3 r/1 E5/1.5 F5/0.5 G5/1 C6/1 B5/1.5 A5/0.5 G5/2 A5/1 G5/1 F5/1 E5/1 D5/3 r/1 E5/1.5 F5/0.5 G5/1 C6/1 D6/1.5 C6/0.5 B5/1 A5/1 G5/1 C6/1 B5/1 D6/1 C6/4') },
      { ins: 'strings', vol: 0.07, c: chords('C:4 F:2 G:2 F:2 Dm:2 G:4 F:2 C:2 G:2 C:2 F:2 G:2 C:4 C:2 Am:2 Em:2 C:2 F:2 C:2 G:4 C:2 Am:2 F:2 Dm:2 C:2 G:2 C:4', 60) },
      { ins: 'bass', vol: 0.2, n: seq('C3/2 E3/2 F2/2 G2/2 F2/2 D3/2 G2/2 G2/2 F2/2 C3/2 G2/2 C3/2 F2/2 G2/2 C3/2 C2/2 C3/2 A2/2 E2/2 C3/2 F2/2 C3/2 G2/2 G2/2 C3/2 A2/2 F2/2 D2/2 C3/2 G2/2 C3/2 C2/2') },
      { ins: 'timp', vol: 0.25, n: seq('C2/4 r/4 r/4 G1/2 G1/1 G1/1 C2/4 r/4 r/4 G1/2 G1/1 G1/1 C2/4 r/4 r/4 G1/2 G1/1 G1/1 C2/4 r/4 r/4 G1/4') },
    ]
  },
  village: {
    bpm: 132, parts: [
      { ins: 'flute', vol: 0.14, n: seq('C5/1 F5/1 A5/1 G5/2 F5/1 E5/1 F5/1 G5/1 A5/3 Bb5/1 A5/1 G5/1 F5/2 D5/1 C5/3 r/3 C5/1 F5/1 A5/1 C6/2 Bb5/1 A5/1 G5/1 F5/1 G5/3 A5/1 G5/1 E5/1 F5/3 r/3') },
      { ins: 'pluck', vol: 0.09, n: seq('F3/1 A3/1 C4/1 C3/1 E3/1 G3/1 F3/1 A3/1 C4/1 F3/1 A3/1 C4/1 Bb2/1 D3/1 F3/1 F3/1 A3/1 C4/1 C3/1 E3/1 G3/1 F3/1 A3/1 C4/1 F3/1 A3/1 C4/1 F3/1 A3/1 C4/1 Bb2/1 D3/1 F3/1 C3/1 E3/1 G3/1 C3/1 E3/1 Bb3/1 F3/1 A3/1 C4/1 F3/1 C3/1 F2/1') },
      { ins: 'strings', vol: 0.05, c: chords('F:3 C:3 F:3 F:3 Bb:3 F:3 C:3 F:3 F:3 F:3 Bb:3 C:3 C:3 F:3 F:3', 60) },
    ]
  },
  field: {
    bpm: 116, parts: [
      { ins: 'brass', vol: 0.13, n: seq('D5/1.5 A4/0.5 D5/1 E5/1 F#5/2 E5/1 D5/1 E5/1.5 F#5/0.5 G5/1 E5/1 A5/3 r/1 B5/1.5 A5/0.5 G5/1 F#5/1 E5/1.5 D5/0.5 E5/1 F#5/1 G5/1 F#5/1 E5/1 C#5/1 D5/3 r/1 F#5/1 G5/1 A5/2 B5/1 A5/1 G5/1 F#5/1 G5/1 A5/1 B5/2 A5/2 F#5/2 G5/1.5 F#5/0.5 E5/1 D5/1 C#5/1 E5/1 A4/2 D5/1.5 E5/0.5 F#5/1 E5/1 D5/4') },
      { ins: 'strings', vol: 0.055, c: chords('D:4 D:4 G:2 A:2 D:4 G:4 D:2 A:2 G:2 A:2 D:4 D:4 G:4 G:2 A:2 D:4 Em:2 A:2 A:4 G:2 A:2 D:4', 60) },
      { ins: 'bass', vol: 0.18, n: seq('D3/1 A2/1 D3/1 A2/1 D3/1 A2/1 D3/1 F#3/1 G2/1 D3/1 A2/1 E3/1 D3/1 A2/1 D3/1 A2/1 G2/1 D3/1 G2/1 D3/1 D3/1 A2/1 A2/1 E3/1 G2/1 D3/1 A2/1 E3/1 D3/1 A2/1 D3/2 D3/1 A2/1 D3/1 A2/1 G2/1 D3/1 G2/1 D3/1 G2/1 D3/1 A2/1 E3/1 D3/1 A2/1 D3/1 A2/1 E3/1 B2/1 A2/1 E3/1 A2/1 E3/1 A2/1 C#3/1 G2/1 D3/1 A2/1 E3/1 D3/1 A2/1 D3/2') },
      { ins: 'snare', vol: 0.06, n: seq('r/1 C4/0.5 C4/0.5 r/1 C4/1 r/1 C4/0.5 C4/0.5 r/1 C4/1 r/1 C4/0.5 C4/0.5 r/1 C4/1 r/1 C4/0.5 C4/0.5 C4/0.5 C4/0.5 C4/1') },
    ]
  },
  night: {
    bpm: 96, parts: [
      { ins: 'flute', vol: 0.12, n: seq('A4/1.5 B4/0.5 C5/1 E5/1 D5/2 C5/1 B4/1 C5/1.5 D5/0.5 E5/1 A4/1 G#4/3 r/1 A4/1.5 B4/0.5 C5/1 E5/1 F5/2 E5/1 D5/1 C5/1 B4/1 G#4/1 B4/1 A4/3 r/1') },
      { ins: 'strings', vol: 0.06, c: chords('Am:4 Dm:2 E:2 Am:2 F:2 E:4 Am:4 Dm:4 Am:2 E:2 Am:4', 57) },
      { ins: 'bass', vol: 0.16, n: seq('A2/2 E2/2 D2/2 E2/2 A2/2 F2/2 E2/4 A2/2 E2/2 D2/2 F2/2 A2/2 E2/2 A2/4') },
    ]
  },
  dungeon: {
    bpm: 76, parts: [
      { ins: 'flute', vol: 0.1, n: seq('D5/2 F5/1 E5/1 D5/2 A4/2 Bb4/2 A4/1 G4/1 A4/4 D5/2 F5/1 G5/1 A5/2 F5/2 E5/1.5 D5/0.5 C#5/1 E5/1 D5/4') },
      { ins: 'strings', vol: 0.07, c: chords('Dm:4 Dm:4 Gm:4 A:4 Dm:4 Dm:4 A:4 Dm:4', 50) },
      { ins: 'pluck', vol: 0.06, n: seq('D3/0.5 A3/0.5 D4/0.5 A3/0.5 D3/0.5 A3/0.5 D4/0.5 A3/0.5 D3/0.5 A3/0.5 D4/0.5 A3/0.5 D3/0.5 A3/0.5 D4/0.5 A3/0.5 G2/0.5 D3/0.5 G3/0.5 D3/0.5 G2/0.5 D3/0.5 G3/0.5 D3/0.5 A2/0.5 E3/0.5 A3/0.5 E3/0.5 A2/0.5 C#3/0.5 E3/0.5 A3/0.5') },
    ]
  },
  battle: {
    bpm: 152, parts: [
      { ins: 'brass', vol: 0.12, n: seq('A4/0.5 C5/0.5 E5/0.5 A5/1.5 G5/0.5 F5/0.5 E5/0.5 D5/0.5 E5/1 C5/1 B4/1 G#4/1 A4/0.5 C5/0.5 E5/0.5 A5/1.5 B5/0.5 C6/0.5 B5/0.5 A5/0.5 G#5/2 E5/2 F5/1.5 E5/0.5 D5/1 F5/1 E5/1.5 D5/0.5 C5/1 E5/1 D5/1 C5/1 B4/1 D5/1 C5/1 B4/1 G#4/1 B4/1 A4/2 E5/2 A5/4') },
      { ins: 'strings', vol: 0.05, c: chords('Am:4 Am:2 E:2 Am:4 E:4 Dm:4 Am:4 F:2 E:2 Am:4 E:4', 57) },
      { ins: 'bass', vol: 0.18, n: seq('A2/0.5 A3/0.5 A2/0.5 A3/0.5 A2/0.5 A3/0.5 A2/0.5 A3/0.5 A2/0.5 A3/0.5 A2/0.5 A3/0.5 E2/0.5 E3/0.5 E2/0.5 E3/0.5 A2/0.5 A3/0.5 A2/0.5 A3/0.5 A2/0.5 A3/0.5 A2/0.5 A3/0.5 E2/0.5 E3/0.5 E2/0.5 E3/0.5 E2/0.5 E3/0.5 E2/0.5 E3/0.5 D2/0.5 D3/0.5 D2/0.5 D3/0.5 D2/0.5 D3/0.5 D2/0.5 D3/0.5 A2/0.5 A3/0.5 A2/0.5 A3/0.5 A2/0.5 A3/0.5 A2/0.5 A3/0.5 F2/0.5 F3/0.5 F2/0.5 F3/0.5 E2/0.5 E3/0.5 E2/0.5 E3/0.5 A2/0.5 A3/0.5 A2/0.5 A3/0.5 A2/0.5 A3/0.5 A2/0.5 A3/0.5 E2/0.5 E3/0.5 E2/0.5 E3/0.5 E2/0.5 G#2/0.5 B2/0.5 E3/0.5') },
      { ins: 'snare', vol: 0.06, n: seq('C4/1 C4/0.5 C4/0.5 C4/1 C4/0.5 C4/0.5') },
      { ins: 'timp', vol: 0.18, n: seq('A1/2 r/2 A1/2 E1/2') },
    ]
  },
  boss: {
    bpm: 164, parts: [
      { ins: 'brass', vol: 0.12, n: seq('E5/0.5 E5/0.5 G5/0.5 E5/0.5 B5/1 A5/0.5 G5/0.5 F#5/1 G5/1 E5/2 E5/0.5 E5/0.5 G5/0.5 B5/0.5 E6/1 D6/0.5 C6/0.5 B5/2 B5/2 C6/1.5 B5/0.5 A5/1 C6/1 B5/1.5 A5/0.5 G5/1 B5/1 A5/1 G5/1 F#5/1 A5/1 G5/1 F#5/1 D#5/1 F#5/1 E5/4') },
      { ins: 'strings', vol: 0.06, c: chords('Em:4 Em:2 B7:2 Em:4 B7:4 Am:4 Em:4 C:2 B7:2 Em:4', 52) },
      { ins: 'bass', vol: 0.19, n: seq('E2/0.5 E2/0.5 E3/0.5 E2/0.5 E2/0.5 E2/0.5 E3/0.5 E2/0.5 E2/0.5 E2/0.5 E3/0.5 E2/0.5 B1/0.5 B1/0.5 B2/0.5 B1/0.5') },
      { ins: 'timp', vol: 0.2, n: seq('E1/1 E1/0.5 E1/0.5 E1/1 B0/1') },
      { ins: 'snare', vol: 0.05, n: seq('r/0.5 C4/0.5 r/0.5 C4/0.5 r/0.5 C4/0.5 C4/0.5 C4/0.5') },
    ]
  },
  ending: {
    bpm: 80, parts: [
      { ins: 'flute', vol: 0.13, n: seq('E5/1.5 F5/0.5 G5/1 C6/1 B5/1.5 A5/0.5 G5/2 A5/1 G5/1 F5/1 E5/1 D5/3 r/1 E5/1.5 F5/0.5 G5/1 C6/1 D6/1.5 C6/0.5 B5/1 A5/1 G5/1 C6/1 B5/1 D6/1 C6/4 G4/0.75 G4/0.25 C5/1 D5/1 E5/1 F5/1.5 E5/0.5 D5/1 C5/1 D5/1 E5/1 F5/1 A5/1 G5/3 r/1 A5/1.5 G5/0.5 F5/1 E5/1 D5/1.5 C5/0.5 D5/1 E5/1 F5/1 E5/1 D5/1 B4/1 C5/4') },
      { ins: 'strings', vol: 0.07, c: chords('C:2 Am:2 Em:2 C:2 F:2 C:2 G:4 C:2 Am:2 F:2 Dm:2 C:2 G:2 C:4 C:4 F:2 G:2 F:2 Dm:2 G:4 F:2 C:2 G:2 C:2 F:2 G:2 C:4', 60) },
      { ins: 'pluck', vol: 0.07, n: seq('C3/1 G3/1 C4/1 G3/1') },
    ]
  },
};
const JINGLE = {
  win: { bpm: 140, parts: [{ ins: 'brass', vol: 0.15, n: seq('G4/0.5 C5/0.5 E5/0.5 G5/1.5 E5/0.5 G5/2.5') }, { ins: 'strings', vol: 0.07, c: chords('C:6', 60) }, { ins: 'timp', vol: 0.2, n: seq('C2/0.5 C2/0.5 C2/0.5 G1/1.5 C2/1') }] },
  lvup: { bpm: 160, parts: [{ ins: 'brass', vol: 0.15, n: seq('C5/0.5 C5/0.5 C5/0.5 C5/1 Ab4/1 Bb4/1 C5/0.67 Bb4/0.33 C5/3') }, { ins: 'strings', vol: 0.07, c: chords('C:1.5 Ab:1 Bb:1 C:4', 60) }] },
  item: { bpm: 150, parts: [{ ins: 'flute', vol: 0.15, n: seq('C5/0.5 E5/0.5 G5/0.5 C6/0.5 E6/1.5 r/0.5') }, { ins: 'strings', vol: 0.06, c: chords('C:3', 60) }] },
  inn: { bpm: 70, parts: [{ ins: 'flute', vol: 0.14, n: seq('G4/1 E5/1 D5/1 C5/1 A4/1 C5/1 G4/2 F4/1 E4/1 D4/1 C4/3') }, { ins: 'strings', vol: 0.07, c: chords('C:2 Am:2 F:2 C:2 G:2 C:3', 48) }] },
  join: { bpm: 140, parts: [{ ins: 'brass', vol: 0.14, n: seq('D5/0.5 F#5/0.5 A5/0.5 D6/1 C#6/0.5 D6/2') }, { ins: 'strings', vol: 0.07, c: chords('D:2 A:1 D:2', 60) }] },
  key: { bpm: 110, parts: [{ ins: 'flute', vol: 0.15, n: seq('A4/0.5 C#5/0.5 E5/0.5 A5/0.5 C#6/0.5 E6/0.5 A6/2') }, { ins: 'strings', vol: 0.07, c: chords('A:5', 60) }] },
  bad: { bpm: 70, parts: [{ ins: 'flute', vol: 0.12, n: seq('E5/1 D#5/1 D5/1 C#5/3') }, { ins: 'strings', vol: 0.06, c: chords('Am:3 E:3', 52) }] },
};
const AU = {
  ctx: null, on: true, voice: true, master: null, mus: null, sfx: null, rev: null, cur: null, curName: null, timer: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = this.ctx = new C();
    this.master = c.createGain(); this.master.gain.value = this.on ? 0.85 : 0; this.master.connect(c.destination);
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.connect(this.master);
    this.mus = c.createGain(); this.mus.gain.value = 0.55; this.mus.connect(comp);
    this.sfx = c.createGain(); this.sfx.gain.value = 0.7; this.sfx.connect(comp);
    // simple convolution reverb (hall)
    const len = c.sampleRate * 2.2, ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    this.rev = c.createConvolver(); this.rev.buffer = ir; const rg = c.createGain(); rg.gain.value = 0.32; this.rev.connect(rg); rg.connect(comp);
    const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.noise = nb;
    if (this.pending) { const p = this.pending; this.pending = null; this.play(p); }
  },
  setOn(v) { this.on = v; if (this.master) this.master.gain.setTargetAtTime(v ? 0.85 : 0, this.ctx.currentTime, 0.05); if (!v && window.speechSynthesis) speechSynthesis.cancel(); },
  // ---------------------------------------------- instruments
  note(ins, f, t, dur, vol, out) {
    const c = this.ctx; const g = c.createGain(); g.connect(out);
    const send = c.createGain(); send.gain.value = ins === 'timp' || ins === 'snare' ? 0.15 : 0.5; g.connect(send); send.connect(this.rev);
    const end = t + dur;
    if (ins === 'brass') {
      const o1 = c.createOscillator(), o2 = c.createOscillator(), lp = c.createBiquadFilter();
      o1.type = 'sawtooth'; o2.type = 'sawtooth'; o1.frequency.value = f; o2.frequency.value = f; o2.detune.value = 8;
      const vib = c.createOscillator(), vg = c.createGain(); vib.frequency.value = 5.2; vg.gain.value = f * 0.004; vib.connect(vg); vg.connect(o1.frequency); vg.connect(o2.frequency);
      lp.type = 'lowpass'; lp.Q.value = 1.2; lp.frequency.setValueAtTime(f * 1.2, t); lp.frequency.linearRampToValueAtTime(f * 5, t + 0.06); lp.frequency.exponentialRampToValueAtTime(f * 2.6, t + 0.4);
      o1.connect(lp); o2.connect(lp); lp.connect(g);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.04); g.gain.setTargetAtTime(vol * 0.75, t + 0.08, 0.2); g.gain.setTargetAtTime(0, end - 0.02, 0.06);
      for (const o of [o1, o2, vib]) { o.start(t); o.stop(end + 0.4); }
    } else if (ins === 'strings') {
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1600; lp.connect(g);
      for (const dt of [-9, 0, 9]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = dt; o.connect(lp); o.start(t); o.stop(end + 0.8); }
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.25); g.gain.setTargetAtTime(0, end - 0.1, 0.25);
    } else if (ins === 'flute') {
      const o = c.createOscillator(), o2 = c.createOscillator(), og = c.createGain(); o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 2; og.gain.value = 0.18;
      const vib = c.createOscillator(), vg = c.createGain(); vib.frequency.value = 5; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.006, t + 0.3); vib.connect(vg); vg.connect(o.frequency);
      o.connect(g); o2.connect(og); og.connect(g);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.05); g.gain.setTargetAtTime(vol * 0.8, t + 0.1, 0.3); g.gain.setTargetAtTime(0, end - 0.03, 0.05);
      for (const x of [o, o2, vib]) { x.start(t); x.stop(end + 0.3); }
    } else if (ins === 'pluck' || ins === 'bass') {
      const o = c.createOscillator(); o.type = ins === 'bass' ? 'triangle' : 'triangle'; o.frequency.value = f;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = ins === 'bass' ? 900 : 2400; o.connect(lp); lp.connect(g);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(vol * (ins === 'bass' ? 0.5 : 0.05), t + Math.min(dur, ins === 'bass' ? 0.4 : 0.5)); g.gain.setTargetAtTime(0, end - 0.02, 0.04);
      o.start(t); o.stop(end + 0.3);
    } else if (ins === 'timp') {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f * 1.5, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.08); o.connect(g);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.9); o.start(t); o.stop(t + 1);
      this.noiseHit(0.12, vol * 0.25, 300, t, out, 'lowpass');
    } else if (ins === 'snare') {
      this.noiseHit(0.12, vol, 2200, t, out, 'bandpass');
    }
  },
  noiseHit(dur, vol, freq, when, dest, type) {
    if (!this.ctx) return; const c = this.ctx, t = when || c.currentTime;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise; f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = 0.9;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.sfx); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  },
  // ---------------------------------------------- sequencer
  play(name, opts) {
    if (!this.ctx) { this.pending = name; return; }
    if (this.curName === name && !(opts && opts.restart)) return;
    this.stop(0.6);
    const T = TRACKS[name]; if (!T) return;
    const c = this.ctx, bus = c.createGain(); bus.gain.value = 0; bus.connect(this.mus); bus.gain.linearRampToValueAtTime(1, c.currentTime + 0.4);
    const spb = 60 / T.bpm;
    const st = { name, bus, T, t0: c.currentTime + 0.1, voices: T.parts.map(p => ({ p, i: 0, t: c.currentTime + 0.1, list: p.n || p.c })) };
    const len = Math.max(...T.parts.map(p => (p.n || p.c).reduce((a, b) => a + b[1], 0)));
    st.loop = len * spb;
    this.cur = st; this.curName = name;
    const tick = () => {
      if (this.cur !== st) return;
      const ahead = c.currentTime + 0.3;
      for (const v of st.voices) {
        const plen = v.list.reduce((a, b) => a + b[1], 0) * spb;
        while (v.t < ahead) {
          const [n, b] = v.list[v.i]; const d = b * spb;
          if (n != null) { if (v.p.c) for (const k of n) this.note(v.p.ins, mhz(k), v.t, d * 0.98, v.p.vol, bus); else this.note(v.p.ins, mhz(n), v.t, d * 0.92, v.p.vol, bus); }
          v.t += d; v.i++;
          if (v.i >= v.list.length) { v.i = 0; if (plen < st.loop - 0.01) { /* short pattern: just keep cycling */ } }
        }
      }
    };
    tick(); st.timer = setInterval(tick, 60);
  },
  stop(fade) {
    const s = this.cur; if (!s) return;
    clearInterval(s.timer); this.cur = null; this.curName = null;
    const t = this.ctx.currentTime; s.bus.gain.cancelScheduledValues(t); s.bus.gain.setValueAtTime(s.bus.gain.value, t); s.bus.gain.linearRampToValueAtTime(0, t + (fade || 0.3));
    setTimeout(() => s.bus.disconnect(), ((fade || 0.3) + 0.5) * 1000);
  },
  jingle(name) {
    if (!this.ctx) return Promise.resolve();
    const J = JINGLE[name], c = this.ctx, spb = 60 / J.bpm;
    const resume = this.curName; this.stop(0.15);
    const bus = c.createGain(); bus.connect(this.mus);
    let total = 0;
    for (const p of J.parts) { let t = c.currentTime + 0.05; for (const [n, b] of (p.n || p.c)) { const d = b * spb; if (n != null) { if (p.c) for (const k of n) this.note(p.ins, mhz(k), t, d, p.vol, bus); else this.note(p.ins, mhz(n), t, d * 0.95, p.vol, bus); } t += d; } total = Math.max(total, t - c.currentTime); }
    this.resumeAfter = resume;
    return new Promise(r => setTimeout(() => { bus.disconnect(); if (!this.cur && resume && !this.noResume) this.play(resume); r(); }, total * 1000 + 250));
  },
  // ---------------------------------------------- sfx
  tone(f, dur, type, vol, when, slide) {
    if (!this.ctx) return; const c = this.ctx, t = when || c.currentTime;
    const o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(this.sfx); o.start(t); o.stop(t + dur + 0.05);
  },
  cursor() { this.tone(1320, 0.05, 'square', 0.05); },
  ok() { this.tone(880, 0.06, 'square', 0.05); this.tone(1320, 0.08, 'square', 0.05, this.ctx && this.ctx.currentTime + 0.05); },
  cancel() { this.tone(660, 0.08, 'square', 0.05, null, 440); },
  text() { this.tone(1600 + Math.random() * 200, 0.02, 'square', 0.015); },
  hit(big) { this.noiseHit(0.18, big ? 0.6 : 0.4, big ? 900 : 1500); this.tone(big ? 160 : 220, 0.15, 'square', 0.12, null, 60); },
  hurt() { this.noiseHit(0.25, 0.5, 400, null, null, 'lowpass'); this.tone(120, 0.2, 'sawtooth', 0.12, null, 50); },
  miss() { this.tone(500, 0.12, 'sine', 0.06, null, 300); },
  crit() { const t = this.ctx.currentTime; for (let i = 0; i < 4; i++) this.tone(400 + i * 300, 0.08, 'square', 0.06, t + i * 0.04); this.hit(true); },
  magic() { const t = this.ctx.currentTime; for (let i = 0; i < 8; i++) this.tone(800 + i * 180 + Math.random() * 50, 0.12, 'sine', 0.05, t + i * 0.04); },
  fire() { this.noiseHit(0.6, 0.4, 600, null, null, 'lowpass'); this.tone(200, 0.4, 'sawtooth', 0.06, null, 80); },
  heal() { const t = this.ctx.currentTime; [0, 4, 7, 12, 16].forEach((k, i) => this.tone(mhz(72 + k), 0.4, 'sine', 0.07, t + i * 0.07)); },
  defeat() { this.tone(900, 0.25, 'square', 0.06, null, 120); this.noiseHit(0.3, 0.2, 3000); },
  run() { this.noiseHit(0.4, 0.3, 1200, null, null, 'highpass'); },
  chest() { const t = this.ctx.currentTime; this.tone(300, 0.1, 'square', 0.06, t); this.tone(500, 0.12, 'square', 0.06, t + 0.08); },
  stairs() { const t = this.ctx.currentTime; for (let i = 0; i < 5; i++) this.tone(600 - i * 70, 0.08, 'square', 0.05, t + i * 0.09); },
  encounter() { const t = this.ctx.currentTime; for (let i = 0; i < 10; i++) this.tone(300 + (i % 2) * 400 + i * 60, 0.06, 'square', 0.06, t + i * 0.045); },
  sleep() { const t = this.ctx.currentTime; [76, 72, 69, 64].forEach((n, i) => this.tone(mhz(n), 0.3, 'sine', 0.06, t + i * 0.15)); },
  thunder() { this.noiseHit(1.2, 0.8, 300, null, null, 'lowpass'); this.noiseHit(0.2, 0.5, 3000, null, null, 'highpass'); },
  roar() { this.tone(90, 1.0, 'sawtooth', 0.15, null, 50); this.noiseHit(0.9, 0.4, 500, null, null, 'lowpass'); },
  bark() { this.tone(500, 0.08, 'square', 0.1, null, 300); setTimeout(() => this.tone(520, 0.08, 'square', 0.1, null, 300), 140); },
  bell() { const t = this.ctx.currentTime; for (const [f, d] of [[1568, 2], [2093, 1.6], [3136, 1.2]]) this.tone(f, d, 'sine', 0.08, t); },
  // ---------------------------------------------- voice (reads text aloud for small children)
  speak(text) {
    if (!this.voice || !this.on || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, '').replace(/[「」！？…♪〜]/g, ' ').replace(/ふーたん/g, 'ふーたん'));
      u.lang = 'ja-JP'; u.rate = 1.0; u.pitch = 1.15; u.volume = 0.9;
      const v = speechSynthesis.getVoices().find(v => /ja/i.test(v.lang)); if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { }
  },
  hush() { if (window.speechSynthesis) speechSynthesis.cancel(); },
};
// sound effects are no-ops until the audio context exists (first user gesture)
for (const k of ['cursor', 'ok', 'cancel', 'text', 'hit', 'hurt', 'miss', 'crit', 'magic', 'fire', 'heal', 'defeat', 'run', 'chest', 'stairs', 'encounter', 'sleep', 'thunder', 'roar', 'bark', 'bell']) {
  const f = AU[k]; AU[k] = function () { if (!this.ctx) return; return f.apply(this, arguments); };
}
