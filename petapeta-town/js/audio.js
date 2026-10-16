/* サウンド：WebAudio で効果音・声・BGM を合成（音声ファイル不要） */
'use strict';
(() => {
  const A = (PT.audio = {
    ctx: null, master: null, sfxGain: null, bgmGain: null,
    sfxOn: true, bgmOn: true, volume: 0.8, speakOn: true,
    bgmTimer: null, bgmStep: 0, bgmTheme: null,
  });

  A.init = () => {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    A.ctx = new AC();
    A.master = A.ctx.createGain();
    A.master.gain.value = A.volume;
    A.master.connect(A.ctx.destination);
    A.sfxGain = A.ctx.createGain(); A.sfxGain.gain.value = A.sfxOn ? 0.9 : 0; A.sfxGain.connect(A.master);
    A.bgmGain = A.ctx.createGain(); A.bgmGain.gain.value = A.bgmOn ? 0.22 : 0; A.bgmGain.connect(A.master);
  };
  A.apply = () => {
    if (!A.ctx) return;
    const t = A.ctx.currentTime;
    A.master.gain.setTargetAtTime(A.volume, t, 0.05);
    A.sfxGain.gain.setTargetAtTime(A.sfxOn ? 0.9 : 0, t, 0.05);
    A.bgmGain.gain.setTargetAtTime(A.bgmOn ? 0.22 : 0, t, 0.1);
  };

  /* 基本の音 */
  function tone(freq, dur, { type = 'sine', vol = 0.3, slide = 0, delay = 0, attack = 0.005, out, vib = 0 } = {}) {
    if (!A.ctx || !A.sfxOn) return;
    const t0 = A.ctx.currentTime + delay;
    const o = A.ctx.createOscillator();
    const g = A.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t0 + dur);
    if (vib) {
      const l = A.ctx.createOscillator(), lg = A.ctx.createGain();
      l.frequency.value = 7; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency);
      l.start(t0); l.stop(t0 + dur + 0.05);
    }
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(out || A.sfxGain);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(dur, { vol = 0.2, delay = 0, filter = 1200, q = 1, type = 'bandpass', sweep = 0 } = {}) {
    if (!A.ctx || !A.sfxOn) return;
    const t0 = A.ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(A.ctx.sampleRate * dur));
    const buf = A.ctx.createBuffer(1, len, A.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = A.ctx.createBufferSource(); src.buffer = buf;
    const f = A.ctx.createBiquadFilter(); f.type = type; f.frequency.value = filter; f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(filter * sweep, t0 + dur);
    const g = A.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(A.sfxGain);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }
  A.tone = tone; A.noise = noise;

  const N = (n) => 440 * Math.pow(2, (n - 69) / 12);

  const SFX = {
    pop: () => { tone(520, 0.12, { type: 'sine', slide: 2.2, vol: 0.35 }); },
    pick: () => { tone(700, 0.08, { type: 'triangle', slide: 1.4, vol: 0.2 }); },
    place: () => { tone(330, 0.1, { type: 'sine', slide: 0.6, vol: 0.4 }); noise(0.08, { vol: 0.12, filter: 500 }); },
    tap: () => { tone(880, 0.06, { type: 'triangle', vol: 0.15 }); },
    ui: () => { tone(660, 0.07, { type: 'triangle', vol: 0.18 }); tone(990, 0.08, { type: 'triangle', vol: 0.12, delay: 0.05 }); },
    back: () => { tone(660, 0.07, { type: 'triangle', vol: 0.18 }); tone(440, 0.09, { type: 'triangle', vol: 0.14, delay: 0.05 }); },
    boing: () => { tone(180, 0.35, { type: 'sine', slide: 3.2, vol: 0.35, vib: 30 }); },
    jump: () => { tone(300, 0.18, { type: 'square', slide: 2.4, vol: 0.08 }); },
    slide: () => { tone(1200, 0.7, { type: 'sine', slide: 0.35, vol: 0.18 }); },
    munch: () => { for (let i = 0; i < 3; i++) noise(0.06, { vol: 0.25, filter: 900 + i * 200, delay: i * 0.16 }); },
    splash: () => { noise(0.45, { vol: 0.3, filter: 1800, sweep: 0.3, type: 'lowpass' }); tone(500, 0.2, { slide: 0.5, vol: 0.1 }); },
    whoosh: () => { noise(0.5, { vol: 0.2, filter: 400, sweep: 6, q: 2 }); },
    bubble: () => { tone(PT.rand(500, 900), 0.08, { type: 'sine', slide: 1.8, vol: 0.2 }); },
    sparkle: () => { [0, 4, 7, 12, 16].forEach((s, i) => tone(N(84 + s), 0.25, { type: 'triangle', vol: 0.12, delay: i * 0.06 })); },
    discover: () => {
      [0, 4, 7, 12].forEach((s, i) => tone(N(72 + s), 0.3, { type: 'triangle', vol: 0.18, delay: i * 0.09 }));
      tone(N(84), 0.6, { type: 'sine', vol: 0.15, delay: 0.38 });
      [0, 7].forEach((s, i) => tone(N(91 + s), 0.4, { type: 'triangle', vol: 0.06, delay: 0.45 + i * 0.08 }));
    },
    jingle: () => { [0, 2, 4, 7, 9, 12].forEach((s, i) => tone(N(67 + s), 0.16, { type: 'square', vol: 0.05, delay: i * 0.08 })); },
    cheer: () => { [0, 4, 7, 12, 7, 12].forEach((s, i) => tone(N(72 + s), 0.18, { type: 'triangle', vol: 0.14, delay: i * 0.09 })); noise(0.6, { vol: 0.05, filter: 3000, delay: 0.1 }); },
    bell: () => { tone(N(88), 0.6, { type: 'sine', vol: 0.25 }); tone(N(95), 0.5, { type: 'sine', vol: 0.1, delay: 0.01 }); },
    drum: () => { tone(110, 0.25, { type: 'sine', slide: 0.5, vol: 0.5 }); noise(0.08, { vol: 0.2, filter: 300 }); },
    drumroll: () => { for (let i = 0; i < 10; i++) noise(0.05, { vol: 0.12, filter: 400, delay: i * 0.05 }); SFX.drum(); },
    rocket: () => { noise(1.6, { vol: 0.3, filter: 200, sweep: 8, type: 'lowpass' }); tone(80, 1.5, { slide: 4, vol: 0.15, type: 'sawtooth' }); },
    magic: () => { for (let i = 0; i < 8; i++) tone(N(84 + [0, 3, 7, 10, 12, 15, 19, 24][i]), 0.2, { type: 'sine', vol: 0.1, delay: i * 0.045 }); },
    roar: () => { tone(160, 0.6, { type: 'sawtooth', slide: 0.6, vol: 0.12, vib: 20 }); noise(0.5, { vol: 0.1, filter: 300 }); },
    trash: () => { tone(400, 0.15, { type: 'triangle', slide: 0.4, vol: 0.2 }); },
    firework: () => { tone(400, 0.5, { slide: 3, vol: 0.08 }); noise(0.7, { vol: 0.35, filter: 600, sweep: 0.2, type: 'lowpass', delay: 0.5 }); },
    quack: () => { tone(620, 0.12, { type: 'sawtooth', slide: 0.7, vol: 0.12 }); tone(600, 0.12, { type: 'sawtooth', slide: 0.7, vol: 0.12, delay: 0.16 }); },
    train: () => { [0, 0.18, 0.5, 0.68].forEach((d) => noise(0.08, { vol: 0.2, filter: 600, delay: d })); tone(N(76), 0.4, { type: 'square', vol: 0.06, delay: 0.9 }); tone(N(79), 0.5, { type: 'square', vol: 0.06, delay: 0.9 }); },
    wave: () => { noise(1.4, { vol: 0.12, filter: 500, sweep: 2, type: 'lowpass' }); },
    tickle: () => { for (let i = 0; i < 5; i++) tone(N(80 + (i % 2) * 3), 0.07, { type: 'triangle', vol: 0.1, delay: i * 0.07 }); },
    ding: () => { tone(N(84), 0.3, { type: 'triangle', vol: 0.18 }); tone(N(91), 0.4, { type: 'triangle', vol: 0.14, delay: 0.1 }); },
    piano: () => { [60, 64, 67, 72, 67, 64, 60].forEach((n, i) => tone(N(n + 12), 0.25, { type: 'triangle', vol: 0.15, delay: i * 0.14 })); },
    ghost: () => { tone(400, 0.9, { type: 'sine', slide: 0.6, vol: 0.15, vib: 25 }); },
    zap: () => { tone(1400, 0.25, { type: 'square', slide: 0.3, vol: 0.06 }); },
  };
  A.sfx = (name) => { try { if (SFX[name]) SFX[name](); } catch (e) { /* 音が出なくても遊べる */ } };

  /* キャラクターの声（短いさえずり） */
  A.voice = (pitch, kind = 'talk', n = 2) => {
    if (!A.ctx || !A.sfxOn) return;
    const p = pitch || 500;
    if (kind === 'laugh') {
      for (let i = 0; i < 4; i++) tone(p * (1.5 - i * 0.08), 0.09, { type: 'triangle', vol: 0.13, delay: i * 0.1, slide: 0.8 });
      return;
    }
    if (kind === 'wow') { tone(p * 0.9, 0.3, { type: 'triangle', vol: 0.14, slide: 1.6 }); return; }
    if (kind === 'hmm') { tone(p * 0.8, 0.35, { type: 'triangle', vol: 0.1, slide: 1.2, vib: 8 }); return; }
    if (kind === 'yay') { tone(p, 0.12, { type: 'triangle', vol: 0.14 }); tone(p * 1.5, 0.22, { type: 'triangle', vol: 0.14, delay: 0.12, slide: 1.2 }); return; }
    for (let i = 0; i < n; i++) {
      const f = p * PT.rand(0.9, 1.35);
      tone(f, 0.08, { type: 'triangle', vol: 0.11, delay: i * 0.09, slide: PT.rand(0.85, 1.2) });
    }
  };

  /* BGM：ステージごとのやさしいループ（ペンタトニック） */
  const THEMES = {
    home: { root: 60, tempo: 0.34, mel: [0, 4, 7, 9, 7, 4, 2, 4, 0, 2, 4, 7, 4, 2, 0, -1], bass: [0, 0, 5, 5, 7, 7, 0, 0], wave: 'triangle' },
    park: { root: 62, tempo: 0.28, mel: [0, 2, 4, 7, 9, 7, 4, 2, 4, 7, 9, 12, 9, 7, 4, -1], bass: [0, 7, 5, 7, 0, 7, 5, 7], wave: 'triangle' },
    shop: { root: 65, tempo: 0.27, mel: [0, 4, 7, 4, 9, 7, 4, -1, 2, 4, 5, 7, 4, 2, 0, -1], bass: [0, 7, 0, 7, 5, 0, 7, 0], wave: 'square' },
    beach: { root: 60, tempo: 0.36, mel: [7, 9, 12, 9, 7, 4, 7, -1, 4, 7, 9, 7, 4, 2, 0, -1], bass: [0, 0, 9, 9, 5, 5, 7, 7], wave: 'sine' },
    camp: { root: 57, tempo: 0.42, mel: [0, 3, 7, 10, 7, 3, 5, -1, 3, 5, 7, 5, 3, 0, -1, -1], bass: [0, 0, 5, 5, 3, 3, 7, 7], wave: 'sine' },
    fun: { root: 67, tempo: 0.24, mel: [0, 4, 7, 12, 7, 4, 9, 7, 5, 4, 2, 4, 7, 4, 0, -1], bass: [0, 7, 0, 7, 5, 9, 7, 2], wave: 'square' },
    night: { root: 55, tempo: 0.45, mel: [12, -1, 7, 9, 7, -1, 4, -1, 5, 7, 4, -1, 2, 4, 0, -1], bass: [0, 0, 9, 9, 5, 5, 7, 7], wave: 'sine' },
    fest: { root: 62, tempo: 0.3, mel: [0, 2, 5, 7, 9, 7, 5, 2, 0, 2, 5, 2, 0, -3, 0, -1], bass: [0, 0, 7, 7, 5, 5, 0, 0], wave: 'triangle' },
    title: { root: 64, tempo: 0.3, mel: [0, 4, 7, 9, 12, 9, 7, 4, 5, 9, 12, 9, 7, 4, 2, -1], bass: [0, 7, 5, 7, 9, 7, 5, 2], wave: 'triangle' },
  };
  A.playBgm = (theme) => {
    if (A.bgmTheme === theme) return;
    A.stopBgm();
    A.bgmTheme = theme;
    const T = THEMES[theme] || THEMES.home;
    A.bgmStep = 0;
    const tick = () => {
      if (!A.ctx || !A.bgmOn || document.hidden) return;
      const i = A.bgmStep++;
      const m = T.mel[i % T.mel.length];
      if (m >= 0) tone(N(T.root + 12 + m), T.tempo * 1.6, { type: T.wave, vol: 0.18, out: A.bgmGain, attack: 0.02 });
      if (i % 2 === 0) tone(N(T.root - 12 + T.bass[(i / 2) % T.bass.length]), T.tempo * 1.9, { type: 'sine', vol: 0.3, out: A.bgmGain, attack: 0.02 });
    };
    A.bgmTimer = setInterval(tick, T.tempo * 1000);
  };
  A.stopBgm = () => { clearInterval(A.bgmTimer); A.bgmTimer = null; A.bgmTheme = null; };

  /* 読み上げ（お題・おはなし・発見名） */
  let jaVoice = null;
  const pickVoice = () => {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    jaVoice = vs.find((v) => /ja/i.test(v.lang)) || null;
  };
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  A.speak = (text) => {
    if (!A.speakOn || !A.sfxOn || !('speechSynthesis' in window) || !jaVoice) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[！？]/g, (m) => (m === '！' ? '!' : '?')));
      u.voice = jaVoice; u.lang = jaVoice.lang; u.rate = 0.95; u.pitch = 1.3; u.volume = Math.min(1, A.volume + 0.1);
      speechSynthesis.speak(u);
    } catch (e) { /* なくても遊べる */ }
  };
})();
