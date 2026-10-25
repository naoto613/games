// こうかおん（Web Audio。けしても あそべる）
(function () {
  const KP = window.KP;
  let ctx = null;
  const S = (KP.sound = { on: true });
  function ac() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f, t0, dur, type = 'sine', vol = 0.12) {
    const c = ac();
    if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, c.currentTime + t0);
    g.gain.setValueAtTime(0, c.currentTime + t0);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0008, c.currentTime + t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + t0);
    o.stop(c.currentTime + t0 + dur + 0.05);
  }
  const N = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const play = (fn) => (...a) => { if (S.on) fn(...a); };
  S.tap = play(() => { tone(N(84), 0, 0.12, 'sine', 0.08); tone(N(91), 0.04, 0.12, 'sine', 0.05); });
  S.pick = play(() => { tone(N(79), 0, 0.1, 'triangle', 0.08); tone(N(86), 0.06, 0.16, 'sine', 0.07); });
  S.pop = play(() => { tone(N(72), 0, 0.08, 'sine', 0.1); tone(N(79), 0.05, 0.1, 'sine', 0.08); });
  S.sparkle = play(() => [88, 91, 96, 100].forEach((n, i) => tone(N(n), i * 0.06, 0.25, 'sine', 0.05)));
  S.find = play(() => [72, 76, 79, 84, 88].forEach((n, i) => tone(N(n), i * 0.08, 0.35, 'triangle', 0.07)));
  S.henshin = play(() => {
    [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => tone(N(n), i * 0.12, 0.5, 'triangle', 0.06));
    [84, 88, 91, 96].forEach((n, i) => tone(N(n), 1.3 + i * 0.05, 0.9, 'sine', 0.05));
  });
  S.done = play(() => [[72, 0], [76, 0], [79, 0], [84, 0.18]].forEach(([n, t]) => tone(N(n), t, 0.8, 'triangle', 0.06)));
  S.boing = play(() => {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(300, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(700, c.currentTime + 0.15);
    g.gain.setValueAtTime(0.08, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.22);
  });
  S.shutter = play(() => { tone(N(96), 0, 0.05, 'square', 0.04); tone(N(90), 0.06, 0.08, 'square', 0.04); });
  S.unlock = () => { ac(); if (S.on && S.wanted) S.bgm(S.wanted); };
  // ---- BGM（オルゴールふうの オリジナルきょく。Web Audio で ならす） ----
  // [おと（MIDI。null は やすみ）, ながさ（はく）]
  const SONGS = {
    home: {
      bpm: 92, beats: 3, chords: ['C', 'Am', 'F', 'C', 'F', 'C', 'G', 'C', 'C', 'Am', 'C', 'C', 'F', 'C', 'G', 'C'],
      mel: [[76, 2], [79, 1], [84, 2], [83, 1], [81, 2], [79, 1], [76, 3], [77, 2], [81, 1], [79, 2], [76, 1], [74, 2], [76, 1], [72, 3],
        [76, 2], [79, 1], [84, 2], [86, 1], [88, 2], [86, 1], [84, 3], [81, 2], [84, 1], [79, 2], [76, 1], [77, 2], [74, 1], [72, 3]],
    },
    play: {
      bpm: 132, beats: 4, chords: ['C', 'F', 'C', 'G', 'C', 'F', 'G', 'C'],
      mel: [[72, 0.5], [76, 0.5], [79, 0.5], [76, 0.5], [81, 1], [79, 1], [77, 0.5], [81, 0.5], [84, 0.5], [81, 0.5], [79, 2],
        [76, 0.5], [79, 0.5], [84, 1], [83, 0.5], [81, 0.5], [79, 1], [81, 0.5], [79, 0.5], [77, 0.5], [76, 0.5], [74, 2],
        [72, 0.5], [76, 0.5], [79, 0.5], [76, 0.5], [81, 1], [79, 1], [77, 0.5], [81, 0.5], [84, 0.5], [81, 0.5], [79, 2],
        [79, 0.5], [83, 0.5], [86, 0.5], [83, 0.5], [81, 1], [79, 1], [84, 3], [null, 1]],
    },
    night: {
      bpm: 76, beats: 3, chords: ['F', 'C', 'Dm', 'C', 'F', 'C', 'G', 'C'],
      mel: [[81, 2], [84, 1], [81, 2], [79, 1], [77, 2], [79, 1], [76, 3], [74, 2], [77, 1], [81, 2], [79, 1], [76, 2], [74, 1], [72, 3]],
    },
  };
  const CH = { C: [48, 64, 67], Am: [45, 64, 69], F: [41, 65, 69], G: [43, 62, 67], Dm: [50, 65, 69] };
  let startT = 0, bgmName = null, bgmTimer = 0, bgmGain = null, nextT = 0, mi = 0, mt = 0;
  function note(f, t, dur, vol, type = 'sine') {
    const c = ctx;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    o.connect(g).connect(bgmGain);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  function bell(n, t, vol) {
    note(N(n), t, 1.1, vol, 'sine');
    note(N(n) * 2, t, 0.4, vol * 0.25, 'sine');
  }
  function tick() {
    const c = ctx, song = SONGS[bgmName];
    if (!c || !song) return;
    const spb = 60 / song.bpm;
    const total = song.mel.reduce((a, m) => a + m[1], 0);
    while (nextT < c.currentTime + 0.4) {
      // メロディ
      const m = song.mel[mi % song.mel.length];
      if (m[0] != null) bell(m[0], nextT, 0.05);
      // ばんそう（はくごと）
      const beatsInStep = m[1];
      for (let b = 0; b < beatsInStep; b += 0.5) {
        const beatAbs = mt + b;
        if (Math.abs(beatAbs - Math.round(beatAbs)) > 0.01) continue;
        const bar = Math.floor(beatAbs / song.beats) % song.chords.length;
        const inBar = Math.round(beatAbs) % song.beats;
        const ch = CH[song.chords[bar]];
        const t = nextT + b * spb;
        if (inBar === 0) note(N(ch[0]), t, spb * song.beats * 0.9, 0.035, 'triangle');
        else note(N(ch[inBar % 2 ? 1 : 2]), t, spb * 0.8, 0.018, 'sine');
      }
      nextT += m[1] * spb;
      mt = (mt + m[1]) % total;
      mi++;
    }
  }
  S.bgm = function (name) {
    if (name === bgmName) return;
    bgmName = name;
    clearInterval(bgmTimer);
    if (!S.on || !name || !ctx) return;
    if (bgmGain) { const old = bgmGain; old.gain.setTargetAtTime(0, ctx.currentTime, 0.2); setTimeout(() => old.disconnect(), 1200); }
    bgmGain = ctx.createGain();
    bgmGain.gain.value = 0.9;
    bgmGain.connect(ctx.destination);
    nextT = ctx.currentTime + 0.15;
    startT = nextT;
    mi = 0; mt = 0;
    tick();
    bgmTimer = setInterval(tick, 150);
  };
  S.stopBgm = function () {
    const n = bgmName;
    S.bgm(null);
    if (bgmGain && ctx) { const old = bgmGain; bgmGain = null; old.gain.setTargetAtTime(0, ctx.currentTime, 0.15); setTimeout(() => old.disconnect(), 1000); }
    return n;
  };
  // リズムゲームよう：きょくを はじめから ならして かいしじこくを かえす
  S.restartBgm = function (name) {
    bgmName = null;
    S.bgm(name);
    return ctx && S.on ? { t0: startT, spb: 60 / SONGS[name].bpm } : null;
  };
  S.now = () => (ctx ? ctx.currentTime : performance.now() / 1000);
  S.hasClock = () => !!(ctx && S.on);
  // こえ（よみあげ）
  let voices = [];
  const loadVoices = () => { try { voices = speechSynthesis.getVoices().filter((v) => /ja/i.test(v.lang)); } catch (e) { voices = []; } };
  try { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; } catch (e) { /* なし */ }
  S.speak = function (text, pitch = 1.3) {
    if (!S.on || !S.voice) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[「」『』]/g, ''));
      u.lang = 'ja-JP';
      if (voices[0]) u.voice = voices[0];
      u.pitch = pitch;
      u.rate = 1.05;
      speechSynthesis.speak(u);
    } catch (e) { /* なし */ }
  };
  S.voice = true;
  S.hush = () => { try { speechSynthesis.cancel(); } catch (e) { /* なし */ } };
  S.wanted = 'home';
  S.setWanted = function (name) {
    S.wanted = name;
    if (S.on && ctx) S.bgm(name);
  };

})();
