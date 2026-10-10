// ================================================================ sound (all synthesized)
const Sound = {
  ctx: null, master: null, bgmG: null, sfxG: null, noiseBuf: null, on: !!Save.d.snd,
  unlock() {
    if (HEADLESS) return;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = this.on ? 0.8 : 0; this.master.connect(this.ctx.destination);
      this.bgmG = this.ctx.createGain(); this.bgmG.gain.value = 0.22; this.bgmG.connect(this.master);
      this.sfxG = this.ctx.createGain(); this.sfxG.gain.value = 0.7; this.sfxG.connect(this.master);
      const n = this.ctx.sampleRate; const b = this.ctx.createBuffer(1, n, n); const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = b;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  setOn(v) { this.on = v; Save.d.snd = v ? 1 : 0; Save.write(); if (this.master) this.master.gain.setTargetAtTime(v ? 0.8 : 0, this.ctx.currentTime, 0.05); },
  osc(type, f0, f1, dur, vol = 0.3, when = 0, dest, att = 0.008) {
    if (!this.ctx) return; const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.sfxG); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol = 0.3, ftype = 'bandpass', f = 1200, q = 1, when = 0, f1, dest) {
    if (!this.ctx) return; const t = this.ctx.currentTime + when;
    const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const fl = this.ctx.createBiquadFilter(); fl.type = ftype; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(dest || this.sfxG); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  },
  bell(f, vol = 0.15, when = 0, dest) { this.osc('sine', f, f, 1.2, vol, when, dest); this.osc('sine', f * 2.01, f * 2.01, 0.5, vol * 0.35, when, dest); this.osc('triangle', f * 3, f * 3, 0.15, vol * 0.15, when, dest); },
  sfx(n, a) {
    if (!this.ctx) return;
    switch (n) {
      case 'tap': this.osc('sine', 660, 880, 0.06, 0.12); break;
      case 'hop': this.noise(0.35, 0.12, 'bandpass', 600, 2, 0, 2400); this.osc('sine', 500, 1100, 0.3, 0.1); break;
      case 'possess': this.bell(1047, 0.12); this.bell(1568, 0.08, 0.08); break;
      case 'act': this.osc('triangle', 784, 1175, 0.2, 0.14); this.noise(0.25, 0.06, 'highpass', 4000); [1568, 2093, 2637].forEach((f, i) => this.osc('sine', f, f, 0.25, 0.05, 0.05 + i * 0.05)); break;
      case 'chain': { const d = a || 1; const sc = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568]; const f = sc[Math.min(sc.length - 1, d - 1)]; this.bell(f, 0.16); if (d >= 5) this.bell(f * 1.5, 0.1, 0.1); break; }
      case 'gold': [784, 988, 1175, 1568].forEach((f, i) => this.bell(f, 0.12, i * 0.08)); break;
      case 'goal': [523, 659, 784, 1047, 1319].forEach((f, i) => this.osc('triangle', f, f, 0.4, 0.16, i * 0.09)); this.bell(2093, 0.1, 0.45); break;
      case 'q': this.osc('sine', 500, 760, 0.18, 0.12); break;
      case 'alert': this.osc('square', 880, 880, 0.08, 0.08); this.osc('square', 1175, 1175, 0.18, 0.08, 0.1); break;
      case 'danger': this.osc('triangle', 220, 200, 0.18, 0.1); break;
      case 'caught': [392, 370, 349, 262].forEach((f, i) => this.osc('triangle', f, f * 0.97, 0.35, 0.18, i * 0.18)); break;
      case 'cat': this.osc('sine', 700, 1100, 0.15, 0.14); this.osc('sine', 1100, 650, 0.3, 0.12, 0.14); break;
      case 'meow': this.osc('sawtooth', 600, 900, 0.12, 0.05); this.osc('sine', 900, 520, 0.35, 0.1, 0.1); break;
      case 'clock': this.osc('square', 2200, 2200, 0.02, 0.05); this.osc('square', 1800, 1800, 0.02, 0.04, 0.25); break;
      case 'thud': this.osc('sine', 140, 50, 0.3, 0.35); this.noise(0.15, 0.2, 'lowpass', 500); break;
      case 'clatter': for (let i = 0; i < 5; i++) { this.noise(0.06, 0.15, 'bandpass', 1500 + Math.random() * 2500, 4, i * 0.06); } break;
      case 'splash': this.noise(0.4, 0.22, 'lowpass', 2400, 1, 0, 300); this.osc('sine', 900, 300, 0.15, 0.08); break;
      case 'ring': for (let i = 0; i < 6; i++) { this.osc('square', 1300, 1300, 0.05, 0.06, i * 0.07); this.osc('square', 1700, 1700, 0.05, 0.05, i * 0.07 + 0.035); } break;
      case 'tv': this.noise(0.5, 0.08, 'bandpass', 3000, 0.6); this.osc('sine', 15600, 15600, 0.3, 0.02); break;
      case 'radio': [392, 440, 494, 523, 494, 440].forEach((f, i) => this.osc('triangle', f, f, 0.28, 0.07, i * 0.22)); this.noise(1.3, 0.03, 'bandpass', 1800, 0.5); break;
      case 'piano': { const f = a || 523; this.osc('triangle', f, f, 0.8, 0.14); this.osc('sine', f * 2, f * 2, 0.4, 0.05); break; }
      case 'shutter': this.noise(0.05, 0.25, 'highpass', 3000); this.noise(0.05, 0.2, 'highpass', 2500, 1, 0.08); break;
      case 'alarm': for (let i = 0; i < 8; i++) this.osc('square', 2000, 2000, 0.06, 0.05, i * 0.1); break;
      case 'roll': for (let i = 0; i < 8; i++) this.osc('sine', 1800 - i * 120, 1700 - i * 120, 0.05, 0.05, i * 0.09); break;
      case 'door': this.noise(0.25, 0.15, 'bandpass', 500, 1.5, 0, 300); this.osc('sine', 120, 90, 0.12, 0.15, 0.2); break;
      case 'robot': this.noise(0.8, 0.06, 'lowpass', 600, 1, 0, 900); this.osc('sine', 1300, 1600, 0.12, 0.05); break;
      case 'sway': this.noise(0.6, 0.08, 'bandpass', 900, 0.8, 0, 500); break;
      case 'step': this.noise(0.04, 0.05, 'lowpass', 400); break;
      case 'page': this.noise(0.18, 0.1, 'highpass', 2500, 1, 0, 6000); break;
      case 'ok': this.osc('sine', 880, 880, 0.08, 0.14); this.osc('sine', 1320, 1320, 0.15, 0.12, 0.08); break;
      case 'no': this.osc('triangle', 300, 220, 0.18, 0.15); break;
      case 'star': this.bell(1568, 0.14); break;
      case 'knock': this.noise(0.05, 0.25, 'bandpass', 900, 3); this.osc('sine', 300, 180, 0.06, 0.15); break;
      case 'rattle': for (let i = 0; i < 6; i++) { this.noise(0.05, 0.25, 'bandpass', 600 + Math.random() * 900, 3, i * 0.07); this.osc('sine', 220, 140, 0.05, 0.12, i * 0.07); } break;
      case 'bong': [196, 196.8, 392].forEach((f, i) => this.osc('sine', f, f, 2.2, i === 2 ? 0.08 : 0.2)); this.osc('triangle', 588, 588, 0.6, 0.05); break;
      case 'furin': this.bell(2093, 0.1); this.bell(2637, 0.05, 0.05); break;
      case 'furin2': [2093, 2349, 2637, 2093, 2794].forEach((f, i) => this.bell(f, 0.09, i * 0.09)); break;
      case 'cackle': for (let i = 0; i < 5; i++) this.osc('square', 520 + (i % 2) * 120, 480, 0.08, 0.06, i * 0.1); break;
      case 'leaves': this.noise(0.5, 0.15, 'highpass', 2500, 0.5, 0, 5000); break;
      case 'switch': this.osc('square', 1200, 1200, 0.02, 0.08); this.noise(0.03, 0.15, 'highpass', 3000); break;
      case 'jingle': [1568, 1760, 2093].forEach((f, i) => this.bell(f, 0.08, i * 0.08)); break;
      case 'chime': [659, 523, 587, 392, 392, 587, 659, 523].forEach((f, i) => this.osc('triangle', f, f, 0.6, 0.14, i * 0.42)); break;
      case 'cry': this.osc('sawtooth', 700, 500, 0.5, 0.05); this.osc('sine', 650, 450, 0.6, 0.08, 0.05); break;
      case 'laugh': [880, 990, 880, 1046].forEach((f, i) => this.osc('triangle', f, f * 1.02, 0.09, 0.08, i * 0.11)); break;
      case 'eek': this.osc('sine', 900, 1500, 0.18, 0.12); break;
      case 'thunder': this.noise(1.6, 0.35, 'lowpass', 400, 1, 0, 80); break;
    }
  },
};

// tiny step-sequenced BGM (music-box tunes)
const Music = (() => {
  const SONGS = {
    morning: { bpm: 104, wave: 'triangle', vol: 0.12, mel: [72, 0, 76, 79, 77, 0, 76, 74, 72, 0, 74, 76, 74, 0, 0, 0, 72, 0, 76, 79, 81, 0, 79, 77, 76, 0, 74, 72, 72, 0, 0, 0], bass: [48, 55, 52, 55, 50, 57, 53, 57, 48, 55, 52, 55, 43, 50, 47, 50] },
    prep: { bpm: 76, wave: 'sine', vol: 0.13, bell: true, mel: [79, 0, 0, 74, 0, 0, 76, 0, 71, 0, 0, 0, 72, 0, 0, 0, 79, 0, 0, 83, 0, 0, 81, 0, 79, 0, 0, 0, 76, 0, 0, 0], bass: [45, 0, 52, 0, 41, 0, 48, 0, 43, 0, 50, 0, 40, 0, 47, 0] },
    chain: { bpm: 118, wave: 'triangle', vol: 0.11, mel: [72, 74, 76, 0, 79, 0, 76, 0, 77, 76, 74, 0, 72, 0, 0, 0, 74, 76, 77, 0, 81, 0, 77, 0, 79, 77, 76, 74, 72, 0, 0, 0], bass: [48, 0, 55, 0, 53, 0, 55, 0, 50, 0, 57, 0, 55, 0, 52, 0] },
    search: { bpm: 132, wave: 'square', vol: 0.05, mel: [69, 0, 0, 69, 0, 0, 70, 0, 69, 0, 0, 67, 0, 0, 65, 0, 69, 0, 0, 69, 0, 0, 72, 0, 70, 0, 69, 0, 67, 0, 0, 0], bass: [45, 45, 0, 45, 46, 0, 45, 0, 45, 45, 0, 45, 41, 0, 40, 0] },
    night: { bpm: 70, wave: 'sine', vol: 0.12, bell: true, mel: [67, 0, 72, 0, 71, 0, 69, 67, 69, 0, 64, 0, 0, 0, 0, 0, 65, 0, 69, 0, 67, 0, 65, 64, 62, 0, 60, 0, 0, 0, 0, 0], bass: [48, 0, 0, 0, 45, 0, 0, 0, 41, 0, 0, 0, 43, 0, 0, 0] },
    end: { bpm: 80, wave: 'triangle', vol: 0.12, bell: true, mel: [72, 0, 76, 0, 79, 0, 84, 0, 83, 0, 79, 0, 81, 0, 0, 0, 77, 0, 81, 0, 84, 0, 81, 0, 79, 0, 76, 0, 77, 0, 79, 0], bass: [48, 0, 55, 0, 52, 0, 55, 0, 53, 0, 57, 0, 55, 0, 59, 0] },
  };
  let cur = null, step = 0, next = 0, timer = null;
  const mf = n => 440 * Math.pow(2, (n - 69) / 12);
  function tick() {
    const S = Sound; if (!S.ctx || !cur) return;
    const song = SONGS[cur]; const sp = 60 / song.bpm / 2;
    while (next < S.ctx.currentTime + 0.25) {
      const when = next - S.ctx.currentTime;
      const m = song.mel[step % song.mel.length];
      if (m) { if (song.bell) S.bell(mf(m), song.vol, Math.max(0, when), S.bgmG); else S.osc(song.wave, mf(m), mf(m), sp * 1.8, song.vol, Math.max(0, when), S.bgmG, 0.01); }
      if (step % 2 === 0) { const b = song.bass[(step / 2) % song.bass.length]; if (b) S.osc('sine', mf(b), mf(b), sp * 3, song.vol * 0.9, Math.max(0, when), S.bgmG, 0.02); }
      step++; next += sp;
    }
  }
  return {
    play(name) {
      if (cur === name) return; cur = name; step = 0;
      if (Sound.ctx) next = Sound.ctx.currentTime + 0.1;
      if (!timer) timer = setInterval(() => { if (Sound.ctx && next < Sound.ctx.currentTime) next = Sound.ctx.currentTime + 0.05; tick(); }, 100);
    },
    stop() { cur = null; },
    get cur() { return cur; },
  };
})();
