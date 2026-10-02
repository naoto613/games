// ================================================================ sound (all synthesized)
const Sound = {
  ctx: null, master: null, bgmG: null, sfxG: null, noiseBuf: null, on: !!Save.d.snd,
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = this.on ? 0.8 : 0; this.master.connect(this.ctx.destination);
      this.bgmG = this.ctx.createGain(); this.bgmG.gain.value = 0.32; this.bgmG.connect(this.master);
      this.sfxG = this.ctx.createGain(); this.sfxG.gain.value = 0.7; this.sfxG.connect(this.master);
      const n = this.ctx.sampleRate; const b = this.ctx.createBuffer(1, n, n); const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = b;
      Music.tick();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  setOn(v) { this.on = v; Save.d.snd = v ? 1 : 0; Save.write(); if (this.master) this.master.gain.setTargetAtTime(v ? 0.8 : 0, this.ctx.currentTime, 0.05); },
  t() { return this.ctx ? this.ctx.currentTime : 0; },
  osc(type, f0, f1, dur, vol = 0.3, when = 0, dest) {
    if (!this.ctx) return; const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
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
  sfx(n) {
    if (!this.ctx) return;
    switch (n) {
      case 'pick': this.osc('sine', 420, 820, 0.09, 0.22); break;
      case 'place': this.osc('triangle', 300, 140, 0.1, 0.3); this.noise(0.05, 0.12, 'lowpass', 900); break;
      case 'chop': this.noise(0.05, 0.3, 'bandpass', 2400, 2); this.osc('square', 180, 90, 0.04, 0.08); break;
      case 'chopDone': this.osc('square', 660, 660, 0.06, 0.12); this.osc('square', 990, 990, 0.1, 0.12, 0.07); break;
      case 'drop': this.osc('sine', 300, 600, 0.12, 0.2); this.noise(0.08, 0.1, 'highpass', 3000); break;
      case 'plop': this.osc('sine', 600, 200, 0.12, 0.25); break;
      case 'pour': this.noise(0.3, 0.18, 'lowpass', 1400, 1, 0, 400); break;
      case 'serve': [880, 1175, 1568].forEach((f, i) => this.osc('triangle', f, f, 0.35, 0.22, i * 0.07)); this.osc('sine', 2093, 2093, 0.8, 0.12, 0.2); break;
      case 'coin': this.osc('square', 988, 988, 0.07, 0.1); this.osc('square', 1319, 1319, 0.25, 0.1, 0.07); break;
      case 'wrong': this.osc('square', 180, 140, 0.25, 0.14); this.osc('square', 150, 110, 0.25, 0.1, 0.05); break;
      case 'order': this.osc('sine', 1318, 1318, 0.25, 0.18); this.osc('sine', 1046, 1046, 0.4, 0.18, 0.18); break;
      case 'expire': [523, 415, 330].forEach((f, i) => this.osc('triangle', f, f * 0.98, 0.2, 0.2, i * 0.12)); break;
      case 'done': this.osc('sine', 1568, 1568, 0.12, 0.16); this.osc('sine', 2093, 2093, 0.2, 0.14, 0.1); break;
      case 'warn': this.osc('square', 1200, 1200, 0.07, 0.07); break;
      case 'burn': this.noise(0.5, 0.25, 'lowpass', 800, 1, 0, 200); this.osc('sawtooth', 200, 80, 0.4, 0.1); break;
      case 'fire': this.noise(0.7, 0.35, 'bandpass', 600, 0.7, 0, 1800); break;
      case 'spray': this.noise(0.18, 0.18, 'highpass', 2500); break;
      case 'ext': this.osc('sine', 500, 1200, 0.25, 0.15); break;
      case 'throw': this.noise(0.18, 0.2, 'bandpass', 900, 2, 0, 2600); break;
      case 'catch': this.osc('sine', 700, 1000, 0.08, 0.2); break;
      case 'splash': this.noise(0.4, 0.3, 'lowpass', 2000, 1, 0, 300); break;
      case 'wash': this.noise(0.12, 0.12, 'bandpass', 1800 + Math.random() * 800, 3); this.osc('sine', 900 + Math.random() * 600, 1600, 0.06, 0.05); break;
      case 'washDone': this.osc('sine', 1760, 1760, 0.08, 0.12); this.osc('sine', 2637, 2637, 0.15, 0.1, 0.06); break;
      case 'dash': this.noise(0.2, 0.18, 'bandpass', 500, 1.5, 0, 1500); break;
      case 'swap': this.osc('sine', 300, 900, 0.15, 0.2); this.osc('sine', 600, 1200, 0.15, 0.12, 0.08); break;
      case 'bump': this.osc('sine', 160, 90, 0.12, 0.2); break;
      case 'tick': this.osc('square', 1500, 1500, 0.04, 0.06); break;
      case 'count': this.osc('square', 660, 660, 0.18, 0.15); break;
      case 'go': this.osc('square', 1320, 1320, 0.45, 0.15); this.osc('square', 990, 990, 0.45, 0.1); break;
      case 'whistle': this.osc('sine', 2200, 2400, 0.5, 0.18); this.osc('sine', 2400, 2000, 0.5, 0.14, 0.5); break;
      case 'star': this.osc('triangle', 1046, 2093, 0.3, 0.2); this.noise(0.2, 0.06, 'highpass', 5000); break;
      case 'rumble': this.osc('sawtooth', 55, 35, 1.2, 0.25); this.noise(1.2, 0.3, 'lowpass', 160); break;
      case 'roar': this.osc('sawtooth', 140, 60, 1.0, 0.28); this.osc('square', 95, 50, 1.0, 0.15); this.noise(1.0, 0.25, 'lowpass', 500); break;
      case 'chomp': this.osc('square', 220, 90, 0.12, 0.2); this.osc('square', 200, 80, 0.12, 0.2, 0.18); break;
      case 'move': this.osc('sawtooth', 80, 120, 0.6, 0.12); this.noise(0.6, 0.15, 'lowpass', 300); break;
      case 'honk': this.osc('square', 392, 392, 0.18, 0.12); this.osc('square', 494, 494, 0.18, 0.1); break;
      case 'click': this.osc('sine', 800, 1200, 0.05, 0.15); break;
      case 'fanfare': [523, 659, 784, 1046, 784, 1046].forEach((f, i) => this.osc('square', f, f, i === 5 ? 0.6 : 0.14, 0.12, [0, .12, .24, .36, .55, .67][i])); break;
      case 'sad': [392, 370, 349, 330].forEach((f, i) => this.osc('triangle', f, f, 0.3, 0.16, i * 0.25)); break;
    }
  },
};

// ================================================================ music: tiny sequencer
const SONGS = {
  title: { bpm: 132, root: 60, prog: [0, 5, 3, 4, 0, 5, 1, 4], scale: 'maj', lead: 'square', seed: 3, feel: 'polka' },
  map: { bpm: 112, root: 62, prog: [0, 3, 4, 0, 5, 3, 4, 4], scale: 'maj', lead: 'triangle', seed: 9, feel: 'swing' },
  school: { bpm: 140, root: 60, prog: [0, 3, 4, 0, 0, 3, 4, 4], scale: 'maj', lead: 'square', seed: 11, feel: 'polka' },
  park: { bpm: 136, root: 65, prog: [0, 5, 3, 4], scale: 'maj', lead: 'triangle', seed: 5, feel: 'polka' },
  ship: { bpm: 128, root: 62, prog: [0, 4, 0, 4, 3, 0, 4, 0], scale: 'maj', lead: 'square', seed: 21, feel: 'waltz' },
  sushi: { bpm: 138, root: 62, prog: [0, 5, 3, 4], scale: 'pen', lead: 'triangle', seed: 7, feel: 'polka' },
  snow: { bpm: 144, root: 67, prog: [0, 3, 0, 4, 5, 3, 4, 0], scale: 'maj', lead: 'sine', seed: 13, feel: 'polka', bell: 1 },
  camp: { bpm: 134, root: 64, prog: [0, 0, 3, 4, 0, 5, 3, 4], scale: 'maj', lead: 'square', seed: 17, feel: 'swing' },
  volcano: { bpm: 150, root: 57, prog: [0, 5, 6, 4], scale: 'min', lead: 'sawtooth', seed: 19, feel: 'polka' },
  boss: { bpm: 156, root: 55, prog: [0, 0, 5, 4, 0, 0, 6, 4], scale: 'min', lead: 'sawtooth', seed: 23, feel: 'polka' },
  story: { bpm: 96, root: 60, prog: [0, 3, 4, 0, 5, 3, 1, 4], scale: 'maj', lead: 'triangle', seed: 2, feel: 'soft' },
  scary: { bpm: 88, root: 53, prog: [0, 0, 6, 5], scale: 'min', lead: 'sawtooth', seed: 31, feel: 'soft' },
  ending: { bpm: 104, root: 65, prog: [0, 5, 3, 4, 0, 5, 3, 4], scale: 'maj', lead: 'triangle', seed: 41, feel: 'soft', bell: 1 },
};
const SCALES = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], pen: [0, 2, 4, 7, 9, 12, 14] };
const Music = {
  cur: null, song: null, step: 0, next: 0, melody: null, fast: 1,
  play(name) {
    if (this.cur === name) return;
    this.cur = name; this.song = SONGS[name] || null; this.step = 0; this.melody = null; this.fast = 1;
    if (this.song) this.melody = this.compose(this.song);
    if (Sound.ctx) this.next = Sound.ctx.currentTime + 0.1;
  },
  stop() { this.cur = null; this.song = null; },
  compose(s) {
    // seeded melody: 8 steps (8th notes) per bar
    let a = s.seed * 9301 + 49297; const r = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
    const sc = SCALES[s.scale]; const bars = s.prog.length; const mel = [];
    let deg = 4;
    const rhythm = [[1, 0, 1, 1, 0, 1, 1, 0], [1, 1, 1, 0, 1, 0, 1, 0], [1, 0, 0, 1, 1, 1, 1, 0], [1, 0, 1, 0, 1, 0, 0, 0]];
    for (let b = 0; b < bars; b++) {
      const rh = b % 4 === 3 ? rhythm[3] : rhythm[Math.floor(r() * 3)];
      const ch = s.prog[b];
      for (let i = 0; i < 8; i++) {
        if (!rh[i]) { mel.push(null); continue; }
        if (i === 0) { const tones = [ch, ch + 2, ch + 4]; deg = tones[Math.floor(r() * 3)] + (r() < 0.5 ? 7 : 0); }
        else deg += Math.floor(r() * 5) - 2;
        deg = clamp(deg, 2, 12);
        mel.push(deg);
      }
    }
    return mel;
  },
  note(deg, oct = 0) { const sc = SCALES[this.song.scale]; const n = sc.length; const o = Math.floor(deg / n); const d = ((deg % n) + n) % n; return this.song.root + sc[d] + 12 * (o + oct); },
  hz(m) { return 440 * Math.pow(2, (m - 69) / 12); },
  voice(type, m, t, dur, vol, cut = 3000) {
    const c = Sound.ctx; const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = type; o.frequency.value = this.hz(m); f.type = 'lowpass'; f.frequency.value = cut;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(Sound.bgmG); o.start(t); o.stop(t + dur + 0.03);
  },
  drum(kind, t) {
    const c = Sound.ctx;
    if (kind === 'k') { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16); o.connect(g); g.connect(Sound.bgmG); o.start(t); o.stop(t + 0.2); return; }
    const s = c.createBufferSource(); s.buffer = Sound.noiseBuf; const f = c.createBiquadFilter(), g = c.createGain();
    f.type = kind === 's' ? 'bandpass' : 'highpass'; f.frequency.value = kind === 's' ? 1800 : 7000;
    const d = kind === 's' ? 0.12 : 0.035, v = kind === 's' ? 0.28 : 0.1;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(g); g.connect(Sound.bgmG); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.02);
  },
  tick() {
    setInterval(() => {
      const c = Sound.ctx; if (!c || !this.song) return;
      const s = this.song; const st = 60 / (s.bpm * this.fast) / 2; // 8th note
      if (this.next < c.currentTime - 0.2) this.next = c.currentTime + 0.05;
      while (this.next < c.currentTime + 0.18) {
        const t = this.next, i = this.step, bars = s.prog.length;
        const bar = Math.floor(i / 8) % bars, pos = i % 8, ch = s.prog[bar];
        const soft = s.feel === 'soft';
        const waltz = s.feel === 'waltz';
        // bass (oom-pah)
        if (pos % 2 === 0) {
          const bm = this.note(ch, -2) + ((pos % 4 === 2 && !soft) ? 7 : 0);
          this.voice('triangle', bm, t, st * 1.6, soft ? 0.22 : 0.3, 900);
        }
        // chord stab on off-beats
        if (!soft && pos % 2 === 1 && !(waltz && pos % 4 === 3)) for (const k of [0, 2, 4]) this.voice('square', this.note(ch + k, -1), t, st * 0.5, 0.035, 1800);
        if (soft && pos % 4 === 0) for (const k of [0, 2, 4]) this.voice('triangle', this.note(ch + k, -1), t, st * 3.5, 0.05, 1500);
        // melody
        const m = this.melody[(bar * 8 + pos) % this.melody.length];
        if (m != null) {
          this.voice(s.lead, this.note(m, 0), t, st * (soft ? 1.8 : 0.95), s.lead === 'sawtooth' ? 0.06 : s.lead === 'square' ? 0.07 : 0.13, s.lead === 'sawtooth' ? 2200 : 4000);
          if (s.bell && pos % 4 === 0) this.voice('sine', this.note(m, 1), t, st * 2, 0.05, 6000);
        }
        // drums
        if (!soft) {
          if (pos === 0 || pos === 4) this.drum('k', t);
          if (pos === 2 || pos === 6) this.drum('s', t);
          this.drum('h', t);
        } else if (pos === 0) this.drum('h', t);
        this.next += s.feel === 'swing' && pos % 2 === 0 ? st * 1.16 : s.feel === 'swing' ? st * 0.84 : st;
        this.step++;
      }
    }, 40);
  },
};

// ================================================================ read-aloud
const Voice = {
  on: !!Save.d.voice, v: null,
  setOn(x) { this.on = x; Save.d.voice = x ? 1 : 0; Save.write(); if (!x && window.speechSynthesis) speechSynthesis.cancel(); },
  say(text, pitch = 1.35, rate = 1.05) {
    if (!this.on || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, '').replace(/[〜～]/g, 'ー'));
      u.lang = 'ja-JP'; u.rate = rate; u.pitch = pitch; u.volume = 1;
      if (!this.v) this.v = speechSynthesis.getVoices().find(v => /ja/i.test(v.lang)) || null;
      if (this.v) u.voice = this.v;
      speechSynthesis.speak(u);
    } catch (e) { }
  },
  stop() { try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { } },
};
if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => { Voice.v = null; };
