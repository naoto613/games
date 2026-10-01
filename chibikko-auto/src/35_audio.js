// ================================================================ audio (WebAudio synth)
const AU = {
  ctx: null, on: true, master: null, sfx: null, music: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = this.ctx = new C();
    this.master = c.createGain(); this.master.gain.value = this.on ? 0.9 : 0; this.master.connect(c.destination);
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(this.master);
    this.sfx = c.createGain(); this.sfx.gain.value = 0.8; this.sfx.connect(comp);
    this.music = c.createGain(); this.music.gain.value = 0.32; this.music.connect(comp);
    // noise buffer
    const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = nb;
    // engine
    const e = this.eng = { o1: c.createOscillator(), o2: c.createOscillator(), f: c.createBiquadFilter(), g: c.createGain() };
    e.o1.type = 'sawtooth'; e.o2.type = 'square'; e.o2.detune.value = -1200 + 7;
    e.f.type = 'lowpass'; e.f.frequency.value = 400; e.f.Q.value = 2;
    e.g.gain.value = 0; e.o1.connect(e.f); e.o2.connect(e.f); e.f.connect(e.g); e.g.connect(this.sfx);
    e.o1.start(); e.o2.start();
    // tyre screech
    const s = this.scr = { src: c.createBufferSource(), f: c.createBiquadFilter(), g: c.createGain() };
    s.src.buffer = nb; s.src.loop = true; s.f.type = 'bandpass'; s.f.frequency.value = 1800; s.f.Q.value = 6; s.g.gain.value = 0;
    s.src.connect(s.f); s.f.connect(s.g); s.g.connect(this.sfx); s.src.start();
    // siren
    const sr = this.sir = { o: c.createOscillator(), g: c.createGain() };
    sr.o.type = 'triangle'; sr.o.frequency.value = 700; sr.g.gain.value = 0; sr.o.connect(sr.g); sr.g.connect(this.sfx); sr.o.start();
    // city ambience (soft filtered noise)
    const am = c.createBufferSource(), af = c.createBiquadFilter(), ag = c.createGain();
    am.buffer = nb; am.loop = true; af.type = 'lowpass'; af.frequency.value = 500; ag.gain.value = 0.035; am.connect(af); af.connect(ag); ag.connect(this.sfx); am.start();
    this.radioStart();
  },
  setOn(v) { this.on = v; if (this.master) this.master.gain.value = v ? 0.9 : 0; if (!v && window.speechSynthesis) speechSynthesis.cancel(); },
  t() { return this.ctx ? this.ctx.currentTime : 0; },
  tone(f, dur, type, vol, when, dest, slide) {
    if (!this.ctx) return; const c = this.ctx, t = (when || c.currentTime);
    const o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(dest || this.sfx); o.start(t); o.stop(t + dur + 0.05);
  },
  noiseHit(dur, vol, freq, when, dest, type) {
    if (!this.ctx) return; const c = this.ctx, t = when || c.currentTime;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise; f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = 1;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.sfx); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  },
  engine(on, spd, maxV, thr, type) {
    if (!this.ctx) return; const e = this.eng, t = this.ctx.currentTime;
    if (!on) { e.g.gain.setTargetAtTime(0, t, 0.15); return; }
    const gears = 5, f = clamp(Math.abs(spd) / maxV, 0, 1.1), gear = Math.min(gears - 1, Math.floor(f * gears)), gf = f * gears - gear;
    const big = type === 'fire' || type === 'bus';
    const base = big ? 34 : type === 'sports' ? 52 : 42;
    const hz = base + gf * (big ? 50 : 85) + gear * 6 + thr * 6;
    e.o1.frequency.setTargetAtTime(hz, t, 0.05); e.o2.frequency.setTargetAtTime(hz, t, 0.05);
    e.f.frequency.setTargetAtTime(260 + thr * 700 + f * 600, t, 0.08);
    e.g.gain.setTargetAtTime(0.06 + thr * 0.05, t, 0.1);
  },
  screech(a) { if (!this.ctx) return; this.scr.g.gain.setTargetAtTime(clamp(a, 0, 1) * 0.12, this.ctx.currentTime, 0.06); },
  siren(type) {
    if (!this.ctx) return; const s = this.sir, t = this.ctx.currentTime;
    if (!type) { s.g.gain.setTargetAtTime(0, t, 0.1); this.sirType = null; return; }
    s.g.gain.setTargetAtTime(type === 'ice' ? 0 : 0.07, t, 0.1);
    this.sirType = type;
  },
  sirenTick(dt) {
    if (!this.ctx || !this.sirType) return;
    this.sirPh = (this.sirPh || 0) + dt;
    const ph = this.sirPh;
    if (this.sirType === 'police') { const u = (ph % 3.2) / 3.2; this.sir.o.frequency.setTargetAtTime(u < 0.5 ? 650 + u * 2 * 700 : 1350 - (u - 0.5) * 2 * 700, this.ctx.currentTime, 0.05); }
    if (this.sirType === 'fire') {
      const u = (ph % 2.4) / 2.4; this.sir.o.frequency.setTargetAtTime(520 + Math.sin(u * Math.PI) * 650, this.ctx.currentTime, 0.05);
      if (Math.floor(ph * 3) !== Math.floor((ph - dt) * 3)) this.tone(2100, 0.25, 'square', 0.03), this.tone(3150, 0.2, 'sine', 0.03);
    }
    if (this.sirType === 'ice') {
      // music-box jingle
      const mel = [72, 76, 79, 76, 77, 74, 71, 74, 72, 76, 79, 84, 81, 79, 0, 0];
      const k = Math.floor(ph * 4), pk = Math.floor((ph - dt) * 4);
      if (k !== pk) { const n = mel[k % mel.length]; if (n) { this.tone(mid(n), 0.5, 'sine', 0.06); this.tone(mid(n + 12), 0.3, 'sine', 0.02); } }
    }
  },
  honk(vol, big) { if (!this.ctx) return; const v = (vol || 1) * 0.07; const d = 0.35; this.tone(big ? 260 : 410, d, 'square', v); this.tone(big ? 330 : 520, d, 'square', v * 0.8); },
  boing() { this.tone(300, 0.35, 'sine', 0.12, null, null, 700); },
  bump(i) { this.noiseHit(0.25, clamp(i / 10, 0.05, 0.4), 220, null, null, 'lowpass'); this.tone(80, 0.2, 'sine', clamp(i / 14, 0.05, 0.3)); },
  coin() { const t = this.t(); this.tone(1318, 0.12, 'square', 0.05, t); this.tone(1760, 0.3, 'square', 0.05, t + 0.08); },
  star() { const t = this.t(); [72, 76, 79, 84, 88].forEach((n, i) => this.tone(mid(n), 0.3, 'triangle', 0.08, t + i * 0.06)); },
  step() { this.noiseHit(0.05, 0.03, 900); },
  jump() { this.tone(330, 0.18, 'square', 0.04, null, null, 660); },
  door() { this.noiseHit(0.12, 0.18, 300, null, null, 'lowpass'); this.tone(120, 0.12, 'sine', 0.1); },
  splash() { this.noiseHit(0.5, 0.15, 1400); },
  meow() { this.tone(900, 0.35, 'triangle', 0.08, null, null, 600); },
  whoosh() { this.noiseHit(0.5, 0.12, 700); },
  pass() {
    const t = this.t();
    [[60, 64, 67], [65, 69, 72], [67, 71, 74], [72, 76, 79, 84]].forEach((ch, i) => ch.forEach(n => { this.tone(mid(n), i === 3 ? 1.6 : 0.4, 'sawtooth', 0.025, t + i * 0.28, this.music); this.tone(mid(n), i === 3 ? 1.6 : 0.4, 'triangle', 0.05, t + i * 0.28); }));
  },
  bust() { const t = this.t(); [67, 63, 60, 55].forEach((n, i) => this.tone(mid(n), 0.4, 'triangle', 0.08, t + i * 0.22)); },
  wanted() { const t = this.t(); this.tone(880, 0.12, 'square', 0.04, t); this.tone(660, 0.18, 'square', 0.04, t + 0.12); },
  water(on) {
    if (!this.ctx) return;
    if (!this.wat) { const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.noise; s.loop = true; f.type = 'highpass'; f.frequency.value = 1200; g.gain.value = 0; s.connect(f); f.connect(g); g.connect(this.sfx); s.start(); this.wat = g; }
    this.wat.gain.setTargetAtTime(on ? 0.09 : 0, this.ctx.currentTime, 0.08);
  },

  // ------------------------------------------------ radio
  stations: [
    { name: 'ちびっこ FM', sub: '♪ どうよう ポップス', tempo: 116, style: 'pop',
      mel: [[60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2], [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2], [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2], [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2]] },
    { name: 'どうぶつ ロック', sub: '♪ ケロケロ ロックンロール', tempo: 138, style: 'rock',
      mel: [[60, 1], [62, 1], [64, 1], [65, 1], [64, 1], [62, 1], [60, 2], [64, 1], [65, 1], [67, 1], [69, 1], [67, 1], [65, 1], [64, 2], [60, 2], [60, 2], [60, 2], [60, 2], [60, .5], [60, .5], [62, .5], [62, .5], [64, .5], [64, .5], [65, .5], [65, .5], [64, 1], [62, 1], [60, 2]] },
    { name: 'ほしぞら クラシック', sub: '♪ よろこびの うた', tempo: 100, style: 'classic',
      mel: [[64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1], [60, 1], [60, 1], [62, 1], [64, 1], [64, 1.5], [62, .5], [62, 2], [64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1], [60, 1], [60, 1], [62, 1], [64, 1], [62, 1.5], [60, .5], [60, 2]] },
    { name: 'ラジオ オフ', sub: '', off: true }
  ],
  st: 0, radioOn: false,
  radioStart() { this.rIdx = 0; this.rBeat = 0; this.rNext = 0; this.rMel = 0; this.rMelT = 0; },
  setRadio(on, idx) { this.radioOn = on; if (idx != null) { this.st = idx; this.radioStart(); } },
  radioTick() {
    if (!this.ctx || !this.radioOn) return;
    const S = this.stations[this.st]; if (S.off) return;
    const c = this.ctx, beat = 60 / S.tempo, ahead = c.currentTime + 0.25;
    if (this.rNext < c.currentTime) { this.rNext = c.currentTime + 0.05; this.rMelT = this.rNext; this.rBeat = 0; this.rMel = 0; }
    while (this.rNext < ahead) {
      const t = this.rNext, b = this.rBeat;
      // drums
      if (S.style !== 'classic') {
        if (b % 2 === 0) { this.tone(110, 0.18, 'sine', 0.22, t, this.music, 45); }
        if (b % 2 === 1) this.noiseHit(0.15, S.style === 'rock' ? 0.22 : 0.14, 1800, t, this.music);
        this.noiseHit(0.04, 0.05, 8000, t, this.music, 'highpass'); this.noiseHit(0.04, 0.03, 8000, t + beat / 2, this.music, 'highpass');
      }
      this.rBeat++; this.rNext += beat;
    }
    while (this.rMelT < ahead) {
      const [n, len] = S.mel[this.rMel % S.mel.length], t = this.rMelT, d = len * beat;
      const lead = S.style === 'rock' ? 'square' : S.style === 'classic' ? 'triangle' : 'triangle';
      this.tone(mid(n + 12), d * 0.9, lead, S.style === 'rock' ? 0.07 : 0.12, t, this.music);
      if (S.style === 'rock') this.tone(mid(n), d * 0.9, 'sawtooth', 0.05, t, this.music);
      if (S.style === 'classic') this.tone(mid(n + 7), d * 0.9, 'sine', 0.05, t, this.music);
      const pc = ((n % 12) + 12) % 12, root = (pc === 0 || pc === 4 || pc === 7) ? 48 : (pc === 5 || pc === 9) ? 53 : 55;
      this.tone(mid(root - 12), Math.min(d, beat) * 0.9, S.style === 'classic' ? 'sine' : 'triangle', 0.16, t, this.music);
      if (len >= 2) this.tone(mid(root + 7 - 12), beat * 0.9, 'triangle', 0.1, t + beat, this.music);
      this.rMel++; this.rMelT += d;
    }
  },
  // ------------------------------------------------ voice
  voice: null,
  speak(text) {
    if (!this.on || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ''));
      u.lang = 'ja-JP'; u.rate = 1.0; u.pitch = 1.15;
      if (!this.voice) { const vs = speechSynthesis.getVoices(); this.voice = vs.find(v => /ja/i.test(v.lang)) || null; }
      if (this.voice) u.voice = this.voice;
      speechSynthesis.speak(u);
    } catch (e) { }
  }
};
function mid(n) { return 440 * Math.pow(2, (n - 69) / 12); }
if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => { AU.voice = null; };
