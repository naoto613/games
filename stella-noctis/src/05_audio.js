// ================================================================ audio (all synthesized)
const Audio2 = (() => {
  let ctx = null, master, mus, sfxG, rev, revIn, noiseBuf;
  let song = null, songName = '', step = 0, nextT = 0, timer = null, musVol = 0.5, sfxVol = 0.8;
  const N = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const midi = s => { const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); if (!m) return null; return N[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (+m[3] + 1) * 12; };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  function chord(name, oct = 3) {
    const m = /^([A-G])([#b]?)(m?)(7?)$/.exec(name);
    const r = N[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (oct + 1) * 12;
    const t = [r, r + (m[3] ? 3 : 4), r + 7]; if (m[4]) t.push(r + (m[3] ? 10 : 10));
    return t;
  }
  function parseLead(bars) {
    // returns array per bar of [step, midi|null, len]
    return bars.map(b => { let s = 0; return b.trim().split(/\s+/).map(tok => { const [n, l] = tok.split('/'); const o = [s, n === '_' ? null : midi(n), +l]; s += +l; return o; }); });
  }
  const SONGS = {
    title: { bpm: 76, ch: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A'], lead: ['A4/4 D5/4 F5/4 E5/4', 'D5/6 C5/2 Bb4/8', 'A4/4 C5/4 F5/6 G5/2', 'E5/12 _/4', 'A5/6 G5/2 F5/4 E5/4', 'F5/6 E5/2 D5/8', 'Bb4/4 D5/4 G5/4 F5/4', 'E5/8 C#5/8'], bass: 'whole', arp: 'harp', drum: 'none', leadT: 'flute', pad: 0.9 },
    town: { bpm: 104, ch: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D'], lead: ['B4/4 D5/4 G5/6 F#5/2', 'E5/4 D5/4 A4/8', 'G4/2 B4/2 E5/4 D5/4 B4/4', 'C5/6 B4/2 A4/8', 'B4/4 D5/4 G5/4 A5/4', 'F#5/6 E5/2 D5/8', 'E5/4 G5/4 C5/4 E5/4', 'D5/12 _/4'], bass: 'town', arp: 'pluck', drum: 'town', leadT: 'flute', pad: 0.5 },
    field: { bpm: 122, ch: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G'], lead: ['G4/2 C5/2 E5/4 G5/6 E5/2', 'D5/4 G5/4 B4/6 D5/2', 'C5/2 E5/2 A5/4 G5/4 E5/4', 'F5/6 E5/2 D5/2 C5/2 A4/4', 'G5/2 E5/2 G5/4 C6/6 B5/2', 'B5/4 A5/2 G5/2 D5/8', 'A5/4 G5/2 F5/2 C5/4 A4/4', 'B4/2 C5/2 D5/4 G5/8'], bass: 'march', arp: 'eighth', drum: 'field', leadT: 'brass', pad: 0.7 },
    forest: { bpm: 92, ch: ['Em', 'C', 'D', 'Bm', 'Em', 'C', 'Am', 'B'], lead: ['B4/8 E5/4 G5/4', 'G5/6 F#5/2 E5/8', 'F#5/8 A5/4 D5/4', 'B4/12 _/4', 'E5/4 G5/4 B5/8', 'C6/6 B5/2 G5/8', 'A5/4 E5/4 C5/8', 'D#5/12 _/4'], bass: 'whole', arp: 'harp', drum: 'soft', leadT: 'flute', pad: 0.8 },
    ruins: { bpm: 84, ch: ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'Gm', 'A7'], lead: ['D5/8 F5/4 A5/4', 'Bb5/8 A5/4 F5/4', 'G5/6 F5/2 E5/8', 'C#5/16', 'A4/4 D5/4 F5/8', 'F5/6 E5/2 D5/8', 'Bb4/4 D5/4 G5/8', 'E5/8 A4/8'], bass: 'whole', arp: 'dark', drum: 'timp', leadT: 'flute', pad: 1 },
    battle: { bpm: 152, ch: ['Am', 'F', 'G', 'Em', 'Am', 'F', 'G', 'E'], lead: ['E5/3 D5/1 E5/2 A5/2 G5/4 E5/4', 'F5/3 E5/1 F5/2 C6/2 A5/8', 'G5/3 F5/1 G5/2 D6/2 B5/4 G5/4', 'B5/6 A5/2 G5/4 E5/4', 'A5/2 C6/2 B5/2 A5/2 E5/4 C5/4', 'F5/2 A5/2 G5/2 F5/2 C5/4 A4/4', 'B4/2 D5/2 G5/2 F5/2 D5/4 B4/4', 'G#5/8 E5/4 B4/4'], bass: 'drive', arp: 'sixteenth', drum: 'battle', leadT: 'brass', pad: 0.6 },
    boss: { bpm: 166, ch: ['Cm', 'Ab', 'Bb', 'G', 'Cm', 'Ab', 'Fm', 'G'], lead: ['C5/2 _/1 C5/1 Eb5/2 G5/2 C6/4 Bb5/2 G5/2', 'Ab5/4 G5/2 F5/2 Eb5/4 C5/4', 'D5/2 F5/2 Bb5/4 Ab5/2 G5/2 F5/4', 'G5/8 B4/4 D5/4', 'C6/3 Bb5/1 G5/4 Eb5/4 G5/4', 'Ab5/3 G5/1 Eb5/4 C5/4 Eb5/4', 'F5/2 Ab5/2 C6/4 Bb5/2 Ab5/2 G5/4', 'G5/2 F5/2 Eb5/2 D5/2 B4/8'], bass: 'drive', arp: 'sixteenth', drum: 'boss', leadT: 'brass', pad: 0.8 },
    ending: { bpm: 72, ch: ['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A'], lead: ['A4/4 D5/4 F#5/4 E5/4', 'E5/6 D5/2 C#5/8', 'B4/4 D5/4 F#5/6 G5/2', 'G5/12 _/4', 'A5/6 G5/2 F#5/4 E5/4', 'E5/6 F#5/2 C#5/8', 'B4/4 D5/4 G5/4 F#5/4', 'E5/12 _/4'], bass: 'whole', arp: 'harp', drum: 'none', leadT: 'flute', pad: 1 },
  };
  for (const k in SONGS) SONGS[k].L = parseLead(SONGS[k].lead);
  const DR = {
    battle: { k: 'x...x...x.x.x...', s: '....x.......x..x', h: 'x.x.x.x.x.x.x.x.' },
    boss: { k: 'x..x..x.x..x..x.', s: '....x.......x.x.', h: 'xxxxxxxxxxxxxxxx' },
    field: { k: 'x.......x.x.....', s: '....x.......x...', h: '..x...x...x...x.' },
    town: { k: 'x.......x.......', s: '................', h: '..x...x...x...x.' },
    soft: { k: 'x...............', s: '................', h: '........x.......' },
    timp: { k: 'x.........x.....', s: '................', h: '................' },
    none: { k: '................', s: '................', h: '................' },
  };
  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    mus = ctx.createGain(); mus.gain.value = musVol; mus.connect(master);
    sfxG = ctx.createGain(); sfxG.gain.value = sfxVol; sfxG.connect(master);
    // reverb
    rev = ctx.createConvolver();
    const len = ctx.sampleRate * 2.4, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    rev.buffer = ir; revIn = ctx.createGain(); revIn.gain.value = 0.32; revIn.connect(rev); const rg = ctx.createGain(); rg.gain.value = 0.8; rev.connect(rg); rg.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    timer = setInterval(tick, 25);
  }
  function unlock() { init(); if (ctx && ctx.state === 'suspended') ctx.resume(); }
  function env(g, t, a, peak, d, sus, r, end) {
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(sus, t + a, d); g.gain.setTargetAtTime(0.0001, end, r);
  }
  function osc(type, f, t, dur, vol, out, o = {}) {
    const g = ctx.createGain(); const os = ctx.createOscillator(); os.type = type; os.frequency.setValueAtTime(f, t);
    if (o.det) os.detune.value = o.det;
    if (o.slide) os.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    let node = os;
    if (o.lp) { const f2 = ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = o.lp; f2.Q.value = o.q || 0.7; os.connect(f2); node = f2; if (o.lpEnv) { f2.frequency.setValueAtTime(o.lp * 3, t); f2.frequency.exponentialRampToValueAtTime(o.lp, t + o.lpEnv); } }
    node.connect(g); g.connect(out); if (o.rev) g.connect(revIn);
    env(g, t, o.a || 0.005, vol, o.d || 0.1, o.s != null ? vol * o.s : vol * 0.5, o.r || 0.08, t + dur);
    if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.5; lg.gain.value = f * 0.012; l.connect(lg); lg.connect(os.frequency); l.start(t + 0.15); l.stop(t + dur + 0.6); }
    os.start(t); os.stop(t + dur + (o.r || 0.08) * 6 + 0.05);
    return os;
  }
  function noise(t, dur, vol, out, o = {}) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 1000, t); f.Q.value = o.q || 1;
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
    const g = ctx.createGain(); s.connect(f); f.connect(g); g.connect(out); if (o.rev) g.connect(revIn);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (o.a || 0.003)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  // ---------------- music scheduler
  function tick() {
    if (!ctx || !song) return;
    const spb = 60 / song.bpm / 4;
    while (nextT < ctx.currentTime + 0.12) { playStep(step, nextT, spb); step++; nextT += spb; }
  }
  function playStep(st, t, spb) {
    const s = song, bar = Math.floor(st / 16) % s.ch.length, i = st % 16;
    const ch = chord(s.ch[bar], 3);
    // pad
    if (i === 0 && s.pad) for (const m of ch) for (const det of [-7, 7]) osc('sawtooth', hz(m + 12), t, spb * 15.5, 0.022 * s.pad, mus, { a: 0.25, d: 0.5, s: 0.8, r: 0.35, lp: 1100, det, rev: 1 });
    // bass
    const root = ch[0] - 12, B = s.bass;
    const bassNote = (m, len, v = 0.16) => osc('triangle', hz(m), t, spb * len, v, mus, { lp: 600, s: 0.7, r: 0.06 }) && osc('square', hz(m), t, spb * len, v * 0.25, mus, { lp: 400, s: 0.6 });
    if (B === 'whole' && i === 0) bassNote(root, 15, 0.14);
    if (B === 'drive' && i % 2 === 0) bassNote(i % 8 === 6 ? root + 12 : root, 1.6, 0.15);
    if (B === 'march' && i % 4 === 0) bassNote(i % 8 === 0 ? root : root + 7, 3, 0.15);
    if (B === 'town' && (i === 0 || i === 8)) bassNote(i === 0 ? root : root + 7, 6, 0.13);
    // arp
    const A = s.arp, tones = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[0] + 24];
    if (A === 'sixteenth') osc('square', hz(tones[[0, 1, 2, 3, 2, 1][i % 6]] + 12), t, spb * 0.6, 0.016, mus, { lp: 2400, s: 0.2, r: 0.04 });
    if (A === 'eighth' && i % 2 === 0) osc('triangle', hz(tones[(i / 2) % 4] + 12), t, spb * 1.2, 0.04, mus, { s: 0.2, r: 0.1, rev: 1 });
    if (A === 'pluck' && i % 2 === 0) osc('triangle', hz(tones[[0, 2, 1, 2][(i / 2) % 4]] + 12), t, spb * 1.5, 0.05, mus, { s: 0.15, r: 0.12, rev: 1 });
    if (A === 'harp' && i % 2 === 0) osc('sine', hz(tones[[0, 1, 2, 3, 2, 1, 2, 3][(i / 2) % 8]] + 12), t, spb * 3, 0.06, mus, { s: 0.2, r: 0.4, rev: 1 }) && osc('triangle', hz(tones[[0, 1, 2, 3, 2, 1, 2, 3][(i / 2) % 8]] + 24), t, spb, 0.012, mus, { s: 0.1, rev: 1 });
    if (A === 'dark' && i % 4 === 0) osc('sine', hz(tones[[0, 2, 1, 3][(i / 4) % 4]]), t, spb * 4, 0.07, mus, { s: 0.3, r: 0.5, rev: 1 });
    // lead
    for (const [st0, m, len] of s.L[bar]) if (st0 === i && m != null) {
      if (s.leadT === 'brass') { osc('sawtooth', hz(m), t, spb * len * 0.92, 0.05, mus, { lp: 1800, lpEnv: 0.08, a: 0.02, s: 0.75, r: 0.08, vib: len > 3, rev: 1 }); osc('sawtooth', hz(m), t, spb * len * 0.92, 0.03, mus, { lp: 1600, det: 9, a: 0.03, s: 0.75, rev: 1 }); }
      else { osc('triangle', hz(m), t, spb * len * 0.95, 0.09, mus, { a: 0.04, s: 0.75, r: 0.15, vib: len > 3, rev: 1 }); osc('sine', hz(m + 12), t, spb * len * 0.9, 0.02, mus, { a: 0.06, s: 0.6, rev: 1 }); }
    }
    // drums
    const d = DR[s.drum] || DR.none;
    if (d.k[i] === 'x') { osc('sine', s.drum === 'timp' ? 90 : 150, t, 0.18, s.drum === 'timp' ? 0.35 : 0.4, mus, { slide: 40, s: 0.01, d: 0.06, r: 0.05 }); }
    if (d.s[i] === 'x') { noise(t, 0.16, 0.16, mus, { f: 1800, q: 0.8, rev: 1 }); osc('triangle', 210, t, 0.08, 0.08, mus, { slide: 140 }); }
    if (d.h[i] === 'x') noise(t, s.drum === 'boss' ? 0.03 : 0.05, s.drum === 'boss' ? 0.03 : 0.045, mus, { type: 'highpass', f: 7000 });
    if (i === 0 && bar === 0 && (s.drum === 'battle' || s.drum === 'boss') && st > 0) noise(t, 1.2, 0.07, mus, { type: 'highpass', f: 5000, rev: 1 });
  }
  function play(name) {
    init(); if (!ctx || songName === name) return;
    songName = name;
    const old = mus; if (old) { old.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25); setTimeout(() => old.disconnect(), 1500); }
    mus = ctx.createGain(); mus.gain.value = 0.0001; mus.gain.setTargetAtTime(musVol, ctx.currentTime + 0.1, 0.3); mus.connect(master);
    song = SONGS[name] || null; step = 0; nextT = ctx.currentTime + 0.15;
  }
  function stop() { if (!ctx) return; songName = ''; song = null; mus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3); }
  function fanfare() {
    stop(); if (!ctx) return; songName = 'fanfare';
    const t = ctx.currentTime + 0.1, b = 0.11, o = ctx.createGain(); o.gain.value = 1; o.connect(master);
    const seq = [[72, 0, 1], [72, 1, 1], [72, 2, 1], [72, 3, 3], [68, 6, 3], [70, 9, 3], [72, 12, 2], [70, 14, 1], [72, 15, 9]];
    for (const [m, s, l] of seq) { osc('sawtooth', hz(m), t + s * b, l * b * 0.95, 0.07, o, { lp: 2200, lpEnv: 0.05, s: 0.8, rev: 1 }); osc('sawtooth', hz(m - 12), t + s * b, l * b * 0.95, 0.04, o, { lp: 1500, det: 8, s: 0.8, rev: 1 }); }
    for (const m of [60, 64, 67]) osc('sawtooth', hz(m), t + 15 * b, 9 * b, 0.03, o, { lp: 1400, s: 0.8, rev: 1, a: 0.05 });
    osc('sine', 120, t + 15 * b, 0.4, 0.4, o, { slide: 40, s: 0.01 }); noise(t + 15 * b, 1.4, 0.08, o, { type: 'highpass', f: 5000, rev: 1 });
  }
  // ---------------- sfx
  function sfx(n, v = 1) {
    if (!ctx) return; const t = ctx.currentTime, o = sfxG;
    switch (n) {
      case 'slash': noise(t, 0.12, 0.25 * v, o, { f: 2500, f2: 900, q: 1.5 }); break;
      case 'slash2': noise(t, 0.18, 0.28 * v, o, { f: 3500, f2: 700, q: 2 }); osc('sawtooth', 900, t, 0.08, 0.03 * v, o, { slide: 300 }); break;
      case 'hit': noise(t, 0.09, 0.32 * v, o, { f: 1400, q: 0.8 }); osc('square', 180, t, 0.06, 0.1 * v, o, { slide: 70 }); break;
      case 'hitHeavy': noise(t, 0.2, 0.4 * v, o, { f: 800, q: 0.6 }); osc('sine', 120, t, 0.18, 0.4 * v, o, { slide: 35, s: 0.1 }); break;
      case 'crit': sfx('hitHeavy', v); osc('triangle', 1600, t, 0.2, 0.08 * v, o, { slide: 2400, rev: 1 }); break;
      case 'guard': osc('square', 1300, t, 0.07, 0.07, o, { slide: 900 }); noise(t, 0.1, 0.15, o, { f: 4000, q: 3 }); break;
      case 'jump': noise(t, 0.15, 0.08, o, { f: 600, f2: 1800, q: 1 }); break;
      case 'land': noise(t, 0.1, 0.12, o, { f: 300, q: 0.7 }); break;
      case 'arte': osc('sawtooth', 300, t, 0.25, 0.05, o, { slide: 1200, lp: 2400, rev: 1 }); noise(t, 0.25, 0.12, o, { f: 1500, f2: 4000, q: 1, rev: 1 }); break;
      case 'wave': noise(t, 0.5, 0.2, o, { f: 2000, f2: 400, q: 0.8, rev: 1 }); osc('sawtooth', 220, t, 0.3, 0.05, o, { slide: 80, lp: 1200 }); break;
      case 'fire': noise(t, 0.6, 0.3 * v, o, { type: 'lowpass', f: 1800, f2: 300, rev: 1 }); osc('sawtooth', 100, t, 0.4, 0.1 * v, o, { slide: 50, lp: 500 }); break;
      case 'ice': for (let i = 0; i < 4; i++) osc('triangle', 2000 + i * 400, t + i * 0.04, 0.2, 0.05 * v, o, { rev: 1, s: 0.2 }); noise(t, 0.3, 0.15 * v, o, { type: 'highpass', f: 5000 }); break;
      case 'thunder': noise(t, 0.7, 0.45 * v, o, { type: 'lowpass', f: 4000, f2: 200, rev: 1 }); osc('sawtooth', 60, t, 0.5, 0.15 * v, o, { lp: 300 }); break;
      case 'rock': noise(t, 0.5, 0.4 * v, o, { type: 'lowpass', f: 600, f2: 120 }); osc('sine', 70, t, 0.4, 0.4 * v, o, { slide: 30 }); break;
      case 'heal': for (let i = 0; i < 5; i++) osc('sine', hz(84 + [0, 4, 7, 12, 16][i]), t + i * 0.06, 0.4, 0.06, o, { rev: 1, s: 0.4, r: 0.3 }); break;
      case 'cast': osc('sine', 440, t, 0.6, 0.05, o, { slide: 880, rev: 1, a: 0.2 }); osc('triangle', 660, t, 0.6, 0.03, o, { slide: 1320, rev: 1, a: 0.2 }); break;
      case 'fs': osc('sawtooth', 200, t, 0.5, 0.08, o, { slide: 2000, lp: 3000 }); noise(t + 0.1, 0.6, 0.35, o, { f: 3000, f2: 500, q: 0.7, rev: 1 }); break;
      case 'shatter': for (let i = 0; i < 10; i++) osc('triangle', rnd(1800, 5000), t + i * 0.025, 0.25, 0.04, o, { rev: 1, s: 0.1 }); noise(t, 0.6, 0.3, o, { type: 'highpass', f: 3000, rev: 1 }); osc('sine', 90, t, 0.5, 0.3, o, { slide: 40 }); break;
      case 'ol': osc('sawtooth', 110, t, 1.0, 0.07, o, { slide: 880, lp: 2000, rev: 1, a: 0.1 }); for (let i = 0; i < 6; i++) osc('sine', hz(72 + i * 4), t + i * 0.07, 0.5, 0.05, o, { rev: 1 }); break;
      case 'mystic': osc('sawtooth', 55, t, 2.4, 0.12, o, { lp: 800, rev: 1, a: 0.5, s: 0.9 }); osc('sawtooth', 82.5, t, 2.4, 0.08, o, { lp: 800, rev: 1, a: 0.5, s: 0.9 }); noise(t, 2.5, 0.12, o, { f: 400, f2: 4000, q: 1, rev: 1, a: 1 }); break;
      case 'boom': noise(t, 1.2, 0.5, o, { type: 'lowpass', f: 1200, f2: 80, rev: 1 }); osc('sine', 80, t, 0.9, 0.5, o, { slide: 25, s: 0.3 }); break;
      case 'levelup': [72, 76, 79, 84, 88].forEach((m, i) => osc('triangle', hz(m), t + i * 0.07, 0.5, 0.07, o, { rev: 1 })); break;
      case 'cursor': osc('triangle', 1400, t, 0.04, 0.05, o, { s: 0.2 }); break;
      case 'ok': osc('triangle', 1100, t, 0.06, 0.06, o); osc('triangle', 1650, t + 0.05, 0.08, 0.05, o, { rev: 1 }); break;
      case 'cancel': osc('triangle', 700, t, 0.06, 0.06, o, { slide: 500 }); break;
      case 'buy': [88, 91].forEach((m, i) => osc('square', hz(m), t + i * 0.06, 0.08, 0.03, o)); break;
      case 'save': [72, 79, 84, 91].forEach((m, i) => osc('sine', hz(m), t + i * 0.1, 0.8, 0.06, o, { rev: 1, s: 0.4, r: 0.4 })); break;
      case 'skit': [84, 88].forEach((m, i) => osc('sine', hz(m), t + i * 0.08, 0.3, 0.06, o, { rev: 1 })); break;
      case 'encounter': noise(t, 0.9, 0.3, o, { f: 300, f2: 5000, q: 1.2, rev: 1 }); osc('sawtooth', 110, t, 0.8, 0.08, o, { slide: 440, lp: 1500 }); break;
      case 'roar': noise(t, 1.2, 0.45, o, { type: 'lowpass', f: 600, f2: 200, q: 3 }); osc('sawtooth', 90, t, 1.0, 0.18, o, { slide: 55, lp: 600, vib: 1 }); break;
      case 'step': noise(t, 0.05, 0.03, o, { f: 500, q: 0.5 }); break;
      case 'down': osc('sine', 300, t, 0.4, 0.1, o, { slide: 80 }); break;
      case 'item': [79, 84, 88].forEach((m, i) => osc('sine', hz(m), t + i * 0.06, 0.3, 0.06, o, { rev: 1 })); break;
    }
  }
  return {
    unlock, play, stop, sfx, fanfare, get name() { return songName; },
    setVol(m, s) { musVol = m; sfxVol = s; if (ctx) { mus.gain.value = m; sfxG.gain.value = s; } }
  };
})();
