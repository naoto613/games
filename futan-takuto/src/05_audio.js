// ================================================================ audio (all synthesized)
const Audio2 = (() => {
  let ac = null, master, musicG, sfxG, noiseBuf, muted = false;
  const A = { on: true };
  A.unlock = () => {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.8; master.connect(ac.destination);
    musicG = ac.createGain(); musicG.gain.value = 0.32; musicG.connect(master);
    sfxG = ac.createGain(); sfxG.gain.value = 0.7; sfxG.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    startAmb();
    if (A.pendingSong) { const s = A.pendingSong; A.pendingSong = null; A.music(s); }
  };
  A.toggle = () => { muted = !muted; if (master) master.gain.value = muted ? 0 : 0.8; return !muted; };
  const NOTE = n => { // 'C#5'
    const m = /^([A-G])(#|b)?(\d)$/.exec(n); if (!m) return 0;
    const s = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    return 440 * Math.pow(2, (s + (+m[3] + 1) * 12 - 69) / 12);
  };
  A.NOTE = NOTE;
  function env(g, t, a, peak, dec, sus, rel, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * sus), t + a + dec);
    g.gain.setValueAtTime(Math.max(0.0001, peak * sus), t + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + rel);
  }
  function tone(type, f, t, dur, vol, dest, o = {}) {
    if (!ac || !f) return;
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = type; osc.frequency.setValueAtTime(f, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + (o.slideT || dur));
    if (o.vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * o.vib, t + 0.25); l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.5); }
    let node = osc;
    if (o.lp) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = o.lp; f2.Q.value = o.q || 0.7; osc.connect(f2); node = f2; }
    node.connect(g); g.connect(dest || sfxG);
    env(g, t, o.a || 0.01, vol, o.d || 0.1, o.s == null ? 0.6 : o.s, o.r || 0.12, dur);
    osc.start(t); osc.stop(t + dur + (o.r || 0.12) + 0.05);
  }
  function noise(t, dur, vol, o = {}) {
    if (!ac) return;
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 1200, t);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
    f.Q.value = o.q || 1; const g = ac.createGain();
    s.connect(f); f.connect(g); g.connect(o.dest || sfxG);
    env(g, t, o.a || 0.005, vol, o.d || dur * 0.5, o.s == null ? 0.3 : o.s, o.r || 0.05, dur);
    s.start(t, Math.random()); s.stop(t + dur + 0.2);
  }
  // ---------- sfx
  const now = () => ac ? ac.currentTime : 0;
  A.sfx = (name, p = 1) => {
    if (!ac) return; const t = now();
    switch (name) {
      case 'swing': noise(t, 0.16, 0.5, { f: 900, f2: 3500, q: 2 }); break;
      case 'spin': noise(t, 0.45, 0.6, { f: 600, f2: 4000, q: 3 }); tone('triangle', 500, t, 0.3, 0.12, null, { slide: 1400 }); break;
      case 'hit': tone('square', 520, t, 0.06, 0.18, null, { slide: 180, lp: 2000 }); noise(t, 0.1, 0.5, { f: 2500, q: 0.8 }); break;
      case 'clank': tone('square', 1800, t, 0.05, 0.12, null, { slide: 1500 }); tone('triangle', 2600, t, 0.2, 0.1, null, { r: 0.3 }); break;
      case 'pop': tone('sine', 300, t, 0.1, 0.4, null, { slide: 900 }); noise(t, 0.18, 0.3, { f: 600, type: 'lowpass' }); break;
      case 'die': tone('square', 900, t, 0.25, 0.12, null, { slide: 120, lp: 1800 }); noise(t + 0.05, 0.35, 0.5, { f: 400, f2: 120, type: 'lowpass' }); break;
      case 'rupee': tone('square', 1568, t, 0.05, 0.08, null, { lp: 4000 }); tone('square', 2093, t + 0.06, 0.12, 0.08, null, { lp: 4000 }); break;
      case 'rupeeB': for (let i = 0; i < 4; i++) tone('square', NOTE(['C6', 'E6', 'G6', 'C7'][i]), t + i * 0.05, 0.06, 0.07, null, { lp: 5000 }); break;
      case 'heart': tone('sine', 880, t, 0.08, 0.2); tone('sine', 1320, t + 0.08, 0.15, 0.2); break;
      case 'jump': tone('square', 330, t, 0.08, 0.08, null, { slide: 600, lp: 1600 }); break;
      case 'land': noise(t, 0.08, 0.25, { f: 300, type: 'lowpass' }); break;
      case 'hurt': tone('sawtooth', 220, t, 0.18, 0.2, null, { slide: 90, lp: 1200 }); tone('square', 660, t, 0.08, 0.08); break;
      case 'splash': noise(t, 0.5, 0.6, { f: 1800, f2: 300, q: 0.6 }); break;
      case 'cut': noise(t, 0.12, 0.35, { f: 3000, q: 1.5 }); break;
      case 'pot': noise(t, 0.2, 0.6, { f: 1400, q: 0.5 }); tone('triangle', 900, t, 0.06, 0.1, null, { slide: 400 }); break;
      case 'gust': noise(t, 0.7, 0.6, { f: 400, f2: 1600, q: 0.8, a: 0.1 }); break;
      case 'fireout': noise(t, 0.6, 0.6, { f: 2000, f2: 200, q: 0.5 }); break;
      case 'open': tone('triangle', 196, t, 0.3, 0.2, null, { slide: 260 }); break;
      case 'push': noise(t, 0.4, 0.4, { f: 180, type: 'lowpass' }); break;
      case 'click': tone('square', 700, t, 0.04, 0.1, null, { lp: 3000 }); tone('square', 1100, t + 0.05, 0.05, 0.1, null, { lp: 3000 }); break;
      case 'gate': noise(t, 1.0, 0.5, { f: 120, type: 'lowpass', s: 0.8 }); tone('sawtooth', 70, t, 1.0, 0.1, null, { lp: 300 }); break;
      case 'select': tone('triangle', 1046, t, 0.05, 0.15); tone('triangle', 1568, t + 0.05, 0.08, 0.12); break;
      case 'note': tone('triangle', p, t, 0.35, 0.3, null, { vib: 0.012, a: 0.02, s: 0.7, r: 0.25 }); tone('sine', p * 2, t, 0.3, 0.06, null, { r: 0.2 }); break;
      case 'screech': tone('sawtooth', 1400, t, 0.6, 0.25, null, { slide: 600, lp: 3000, vib: 0.05 }); noise(t, 0.6, 0.4, { f: 2500, q: 4 }); break;
      case 'flap': noise(t, 0.25, 0.5, { f: 300, type: 'lowpass', a: 0.06 }); break;
      case 'boom': noise(t, 0.9, 0.9, { f: 160, type: 'lowpass', s: 0.5 }); tone('sine', 90, t, 0.5, 0.4, null, { slide: 40 }); break;
      case 'found': ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'].forEach((n, i) => tone('triangle', NOTE(n), t + i * 0.06, 0.08, 0.13)); break;
      case 'spotted': tone('square', 880, t, 0.12, 0.15, null, { lp: 3000 }); tone('square', 1175, t + 0.13, 0.25, 0.15, null, { lp: 3000 }); break;
      case 'chime': ['E6', 'B5', 'G#6'].forEach((n, i) => tone('sine', NOTE(n), t + i * 0.12, 0.5, 0.12, null, { r: 0.8 })); break;
      case 'ring': tone('sine', 1318, t, 0.15, 0.18); tone('sine', 1760, t + 0.07, 0.3, 0.16, null, { r: 0.4 }); break;
      case 'rock': tone('square', 180, t, 0.08, 0.12, null, { slide: 120, lp: 800 }); break;
      case 'cheer': ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => tone('square', NOTE(n), t + i * 0.09, 0.12, 0.08, null, { lp: 3000 })); break;
    }
  };
  // fanfares
  A.fanfare = (kind) => {
    if (!ac) return; const t = now() + 0.02; const D = musicG;
    duck(2.6);
    if (kind === 'big') {
      const seq = [['D5', 0, .14], ['F#5', .14, .14], ['A5', .28, .14], ['D6', .42, .9]];
      seq.forEach(([n, s, d]) => { tone('square', NOTE(n), t + s, d, 0.1, D, { lp: 2600 }); tone('triangle', NOTE(n) / 2, t + s, d, 0.2, D); });
      ['A4', 'D5', 'F#5'].forEach(n => tone('triangle', NOTE(n), t + 0.42, 1.2, 0.12, D, { r: 0.6 }));
      ['D6', 'A6', 'F#6', 'D7'].forEach((n, i) => tone('sine', NOTE(n), t + 0.6 + i * 0.08, 0.2, 0.05, D, { r: 0.4 }));
    } else {
      const seq = [['G4', 0, .1], ['B4', .1, .1], ['D5', .2, .1], ['G5', .3, .5]];
      seq.forEach(([n, s, d]) => tone('square', NOTE(n), t + s, d, 0.09, D, { lp: 2800 }));
    }
  };
  // voice blips (garbled speech)
  A.voice = (pitch, n = 1) => {
    if (!ac) return; const t = now();
    for (let i = 0; i < n; i++) {
      const f = pitch * (0.85 + Math.random() * 0.35);
      tone('square', f, t + i * 0.07, 0.05, 0.05, null, { lp: 1800 + pitch * 2, slide: f * (Math.random() < .5 ? 1.2 : 0.85), slideT: 0.05, r: 0.03 });
    }
  };
  // ---------- ambient sea/wind
  let ambG, windG, windF;
  function startAmb() {
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500;
    ambG = ac.createGain(); ambG.gain.value = 0.05;
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.12; lg.gain.value = 0.035;
    lfo.connect(lg); lg.connect(ambG.gain); lfo.start();
    s.connect(f); f.connect(ambG); ambG.connect(master); s.start();
    const s2 = ac.createBufferSource(); s2.buffer = noiseBuf; s2.loop = true;
    windF = ac.createBiquadFilter(); windF.type = 'bandpass'; windF.frequency.value = 600; windF.Q.value = 0.8;
    windG = ac.createGain(); windG.gain.value = 0; s2.connect(windF); windF.connect(windG); windG.connect(master); s2.start(0.7);
  }
  A.setWind = (v) => { if (!windG) return; windG.gain.setTargetAtTime(v * 0.18, now(), 0.3); windF.frequency.setTargetAtTime(400 + v * 900, now(), 0.3); };
  function duck(sec) { if (!musicG) return; const t = now(); musicG.gain.cancelScheduledValues(t); musicG.gain.setValueAtTime(0.05, t); musicG.gain.setValueAtTime(0.05, t + sec); musicG.gain.linearRampToValueAtTime(0.32, t + sec + 0.8); }
  A.duck = duck;

  // ---------- music sequencer
  // song: {bpm (eighths per minute), parts:[{ins, notes:'D5:2 E5 ...' (dur in eighths)}], len}
  const songs = {};
  function parse(str) {
    const out = []; let pos = 0;
    for (const tok of str.trim().split(/\s+/)) {
      const [n, d] = tok.split(':'); const dur = d ? +d : 1;
      if (n !== '.') out.push({ n: n.split('+'), pos, dur });
      pos += dur;
    }
    return { notes: out, len: pos };
  }
  function def(name, bpm, parts, opts = {}) { songs[name] = { bpm, parts: parts.map(([ins, s, v]) => Object.assign({ ins, v: v || 1 }, parse(s))), opts }; songs[name].len = Math.max(...songs[name].parts.map(p => p.len)); }
  function play(ins, f, t, dur, v) {
    switch (ins) {
      case 'flute': tone('triangle', f, t, dur * 0.92, 0.2 * v, musicG, { vib: 0.01, a: 0.03, d: 0.1, s: 0.75, r: 0.12 }); tone('sine', f * 2, t, dur * 0.8, 0.03 * v, musicG); break;
      case 'fiddle': tone('sawtooth', f, t, dur * 0.95, 0.07 * v, musicG, { vib: 0.012, a: 0.04, s: 0.8, lp: 2200, r: 0.1 }); break;
      case 'pluck': tone('triangle', f, t, 0.05, 0.22 * v, musicG, { d: 0.25, s: 0.01, r: 0.2 }); break;
      case 'harp': tone('triangle', f, t, 0.05, 0.14 * v, musicG, { d: 0.6, s: 0.01, r: 0.4 }); tone('sine', f * 2, t, 0.05, 0.04 * v, musicG, { d: 0.4, s: 0.01, r: 0.3 }); break;
      case 'bass': tone('triangle', f, t, dur * 0.85, 0.3 * v, musicG, { a: 0.01, d: 0.2, s: 0.5 }); break;
      case 'brass': tone('sawtooth', f, t, dur * 0.9, 0.08 * v, musicG, { a: 0.03, lp: 1500, s: 0.8 }); tone('square', f, t, dur * 0.9, 0.03 * v, musicG, { lp: 1000 }); break;
      case 'drum': noise(t, 0.12, 0.35 * v, { f: 160, type: 'lowpass', dest: musicG }); tone('sine', 110, t, 0.08, 0.3 * v, musicG, { slide: 50 }); break;
      case 'tap': noise(t, 0.04, 0.14 * v, { f: 4000, q: 1, dest: musicG }); break;
      case 'snare': noise(t, 0.12, 0.25 * v, { f: 2000, q: 0.5, dest: musicG }); break;
    }
  }
  let cur = null, nextT = 0, step = 0, timer = null;
  A.music = (name) => {
    if (!ac) { A.pendingSong = name; return; }
    if (cur && cur.name === name) return;
    cur = name ? { name, s: songs[name] } : null; step = 0; nextT = now() + 0.15;
    if (!timer) timer = setInterval(sched, 60);
  };
  A.current = () => cur && cur.name;
  function sched() {
    if (!cur || !ac) return;
    const s = cur.s, e = 60 / s.bpm;
    while (nextT < now() + 0.25) {
      const pos = step % s.len;
      for (const p of s.parts) {
        const lp = pos % p.len;
        for (const n of p.notes) if (n.pos === lp) for (const nn of n.n) play(p.ins, nn === 'x' ? 1 : NOTE(nn), nextT, n.dur * e, p.v);
      }
      step++; nextT += e;
    }
  }
  // ---- songs (original compositions)
  // island jig 6/8 in D
  def('island', 300, [
    ['flute', 'D5 E5 F#5 A5:2 F#5 G5 F#5 E5 D5:3 B4 D5 E5 F#5:2 E5 D5 B4 A4 B4:3 D5 E5 F#5 A5:2 B5 A5 F#5 D5 E5:2 F#5 G5 E5 C#5 D5:2 B4 A4:3 D5:3', 1],
    ['bass', 'D3:3 A2:3 G2:3 D3:3 B2:3 F#2:3 G2:3 A2:3 D3:3 A2:3 D3:3 A2:3 A2:3 A2:3 D3:3 D3:3', 1],
    ['pluck', '. F#4+A4 . . F#4+A4 . . G4+B4 . . F#4+A4 . . F#4+B4 . . F#4+B4 . . G4+B4 . . E4+A4 . . F#4+A4 . . F#4+A4 . . F#4+A4 . . E4+A4 . . E4+G4 . . C#4+E4 . . F#4+A4 . . F#4+A4 .', 0.8],
    ['drum', 'x:3 x:3', 0.7], ['tap', '. x x . x x', 1],
  ]);
  // sailing theme 4/4 in G (eighths)
  def('sea', 300, [
    ['fiddle', 'G4:2 B4:2 D5:3 B4 C5:2 E5:2 G5:4 F#5:2 E5:2 D5:2 B4:2 A4:6 . . G4:2 B4:2 D5:3 B4 C5:2 E5:2 G5:3 A5 B5:2 A5:2 G5:2 F#5:2 G5:6 . .', 1],
    ['bass', 'G2:4 D3:4 C3:4 C3:4 D3:4 D3:4 D3:4 D2:4 G2:4 D3:4 C3:4 C3:4 G2:4 D3:4 G2:4 G2:4', 1],
    ['harp', 'G3 B3 D4 B3 G3 B3 D4 B3 C4 E4 G4 E4 C4 E4 G4 E4 D4 F#4 A4 F#4 D4 F#4 A4 F#4 D4 F#4 A4 F#4 D4 F#4 A4 F#4 G3 B3 D4 B3 G3 B3 D4 B3 C4 E4 G4 E4 C4 E4 G4 E4 B3 D4 G4 D4 A3 D4 F#4 D4 G3 B3 D4 B3 G3 B3 D4 B3', 0.8],
    ['drum', 'x:4 x:2 x:2', 0.6], ['tap', '. x . x . x x x', 0.8],
  ]);
  // forest: gentle waltz in F
  def('forest', 240, [
    ['flute', 'C5:2 F5:2 A5:2 G5:3 F5 E5:2 F5:6 D5:2 F5:2 Bb5:2 A5:3 G5 F5:2 G5:6 C5:2 F5:2 A5:2 C6:3 Bb5 A5:2 G5:2 A5:2 E5:2 F5:6', 1],
    ['harp', 'F3 C4 A4 C4 A4 C4 C3 G3 E4 G4 E4 C4 F3 C4 F4 A4 F4 C4 Bb2 F3 D4 F4 D4 F3 F3 C4 F4 A4 F4 C4 C3 G3 C4 E4 C4 G3 F3 C4 A4 C4 A4 C4 Bb2 F3 D4 F4 D4 F3 C3 G3 C4 E4 C4 G3 F3 C4 F4 A4 F4 C4', 0.9],
  ]);
  // fire mountain: tense march in D minor
  def('fire', 320, [
    ['brass', 'D4:3 D4 F4:2 A4:2 G4:3 F4 E4:4 F4:3 E4 D4:2 C#4:2 D4:8 D4:3 D4 F4:2 A4:2 Bb4:3 A4 G4:4 A4:3 G4 F4:2 E4:2 D4:8', 1],
    ['bass', 'D2 D2 A2 D2 D2 D2 A2 D2 C2 C2 G2 C2 C2 C2 G2 C2 Bb1 Bb1 F2 Bb1 A1 A1 E2 A1 D2 D2 A2 D2 D2 D2 A2 D2', 1],
    ['drum', 'x:2 x x x:2 x x', 0.8], ['snare', '. . x . . . x .', 0.6],
  ]);
  // whale cove: bright calypso
  def('whale', 300, [
    ['harp', 'E5 . G5 . C6:2 G5 . A5 . F5 . D5:2 . . E5 . G5 . C6:2 D6 . C6 B5 A5 G5 C6:4', 1],
    ['bass', 'C3:3 C3 . G2:2 . F2:3 F2 . G2:2 . C3:3 C3 . G2:2 . F2:2 G2:2 C3:4', 1],
    ['tap', 'x . x x . x x .', 1], ['drum', 'x:3 x x:4', 0.6],
  ]);
  // fortress: sneaky pizzicato in E minor
  def('fortress', 280, [
    ['pluck', 'E4 . G4 . B4 . G4 . E4 . F#4 . G4 . F#4 . E4 . G4 . B4 . C5 . B4 . A4 . G4 . F#4 . D#4 . F#4 . A4 . F#4 . D#4 . E4 . F#4 . G4 . F#4 . E4 . . . E4:2', 1.2],
    ['bass', 'E2:8 E2:8 C2:8 B1:8 B1:8 B1:8 E2:8', 1],
    ['tap', 'x . . . x . . .', 1],
  ]);
  // boss: driving in D minor
  def('boss', 400, [
    ['bass', 'D2 D2 D3 D2 F2 D2 E2 D2 D2 D2 D3 D2 G2 F2 E2 C2 Bb1 Bb1 Bb2 Bb1 C2 C2 C3 C2 D2 D2 D3 D2 A1 A1 C#2 E2', 1.1],
    ['brass', 'D4:4 A4:4 G4:3 F4 E4:4 F4:4 E4:2 D4:2 C4:4 A3:4 F4:4 C5:4 Bb4:3 A4 G4:4 A4:4 G4:2 F4:2 E4:4 C#4:4', 1],
    ['drum', 'x . x . x . x x', 0.9], ['snare', '. . x . . . x .', 0.8],
  ]);
  // tower / magical
  def('tower', 200, [
    ['harp', 'D4 A4 D5 E5 F#5 A5 F#5 E5 G3 D4 G4 A4 B4 D5 B4 A4 B3 F#4 B4 C#5 D5 F#5 D5 C#5 A3 E4 A4 B4 C#5 E5 C#5 B4', 1],
    ['flute', 'F#5:8 G5:8 F#5:6 E5:2 E5:8', 0.6],
  ]);
  // title
  def('title', 220, [
    ['flute', 'D5:3 A4 D5:2 E5:2 F#5:6 E5 D5 E5:3 F#5 G5:2 A5:2 F#5:8 B5:3 A5 G5:2 F#5:2 E5:3 D5 E5:2 F#5:2 G5:2 F#5:2 E5:2 C#5:2 D5:8', 1],
    ['harp', 'D3 A3 D4 F#4 A4 F#4 D4 A3 D3 A3 D4 F#4 A4 F#4 D4 A3 G3 D4 G4 B4 D5 B4 G4 D4 D3 A3 D4 F#4 A4 F#4 D4 A3 G3 D4 G4 B4 D5 B4 G4 D4 A2 E3 A3 C#4 E4 C#4 A3 E3 G3 D4 G4 B4 A2 E3 A3 C#4 D3 A3 D4 F#4 A4 F#4 D4 A3', 0.8],
  ]);
  def('ending', 200, [
    ['flute', 'D5 E5 F#5 A5:2 F#5 G5 F#5 E5 D5:3 B4 D5 E5 F#5:2 E5 D5 B4 A4 B4:3 D5 E5 F#5 A5:2 B5 A5 F#5 D5 E5:2 F#5 G5 E5 C#5 D5:2 B4 A4:3 D5:3', 1],
    ['harp', 'D3 A3 F#4 A3 D4 A3 G3 D4 B4 D4 G4 D4 B2 F#3 D4 F#3 B3 F#3 G3 D4 B4 A3 E4 C#5 D3 A3 F#4 A3 D4 A3 D3 A3 F#4 A3 D4 A3 A2 E3 C#4 E3 A3 E3 D3 A3 F#4 D3 A3 F#4', 0.9],
  ]);
  def('none', 60, [['tap', '.:8', 0]]);
  return A;
})();
