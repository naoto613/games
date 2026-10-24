// Web Audio で合成する音楽・効果音・環境音。
// 同じ旋律を、物語の進行（欠因の度合い）に応じて「音が欠けた形」から「つながった形」へ変える。
type Note = [number | null, number]; // [MIDI, 拍]

let ctx: AudioContext | null = null;
let master: GainNode, bgmGain: GainNode, seGain: GainNode, ambGain: GainNode;
let vol = { bgm: 0.5, se: 0.7 };
let current = '';
let timer: number | null = null;
let ambTimer: number | null = null;
let ambNode: AudioBufferSourceNode | null = null;
/** 0 = 音がよく欠ける（欠因）〜 1 = すべてつながっている */
let wholeness = 0.4;

function ensure(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  } catch {
    return null;
  }
  master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
  bgmGain = ctx.createGain(); bgmGain.gain.value = vol.bgm * 0.32; bgmGain.connect(master);
  seGain = ctx.createGain(); seGain.gain.value = vol.se * 0.5; seGain.connect(master);
  ambGain = ctx.createGain(); ambGain.gain.value = vol.bgm * 0.25; ambGain.connect(master);
  return ctx;
}

export function unlockAudio(): void {
  const c = ensure();
  if (c && c.state === 'suspended') void c.resume();
}

export function setVolume(bgm: number, se: number): void {
  vol = { bgm, se };
  if (!ctx) return;
  bgmGain.gain.value = bgm * 0.32;
  ambGain.gain.value = bgm * 0.25;
  seGain.gain.value = se * 0.5;
}

export function setWholeness(w: number): void {
  wholeness = Math.max(0, Math.min(1, w));
}

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function tone(dest: AudioNode, freq: number, t: number, dur: number, opt: { type?: OscillatorType; vol?: number; attack?: number; release?: number; detune?: number; glideTo?: number } = {}) {
  const c = ctx!;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = opt.type ?? 'triangle';
  o.frequency.setValueAtTime(freq, t);
  if (opt.glideTo) o.frequency.exponentialRampToValueAtTime(opt.glideTo, t + dur);
  if (opt.detune) o.detune.value = opt.detune;
  const v = opt.vol ?? 0.2;
  const a = opt.attack ?? 0.01;
  const r = opt.release ?? 0.12;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + a);
  g.gain.setValueAtTime(v, t + Math.max(a, dur - r));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + r);
  o.connect(g); g.connect(dest);
  o.start(t); o.stop(t + dur + r + 0.05);
}

function noise(dest: AudioNode, t: number, dur: number, opt: { vol?: number; freq?: number; q?: number; type?: BiquadFilterType } = {}) {
  const c = ctx!;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = c.createBufferSource();
  s.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = opt.type ?? 'bandpass';
  f.frequency.value = opt.freq ?? 1200;
  f.Q.value = opt.q ?? 1;
  const g = c.createGain();
  g.gain.value = opt.vol ?? 0.2;
  s.connect(f); f.connect(g); g.connect(dest);
  s.start(t);
}

// ---------- 効果音 ----------

export function sfx(id: string): void {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + 0.01;
  const d = seGain;
  switch (id) {
    case 'blip': tone(d, 880, t, 0.03, { type: 'square', vol: 0.05 }); break;
    case 'select': tone(d, 660, t, 0.05, { vol: 0.15 }); tone(d, 990, t + 0.05, 0.06, { vol: 0.12 }); break;
    case 'cancel': tone(d, 440, t, 0.06, { vol: 0.12 }); tone(d, 330, t + 0.06, 0.08, { vol: 0.1 }); break;
    case 'step': noise(d, t, 0.04, { vol: 0.05, freq: 500 }); break;
    case 'door': noise(d, t, 0.25, { vol: 0.15, freq: 300, type: 'lowpass' }); tone(d, 110, t, 0.2, { vol: 0.08 }); break;
    case 'record':
      [72, 76, 79, 84].forEach((m, i) => tone(d, hz(m), t + i * 0.07, 0.25, { type: 'sine', vol: 0.12 }));
      break;
    case 'connect':
      tone(d, hz(60), t, 0.35, { type: 'sine', vol: 0.14, glideTo: hz(67) });
      tone(d, hz(74), t, 0.35, { type: 'sine', vol: 0.12, glideTo: hz(67) });
      tone(d, hz(79), t + 0.33, 0.6, { type: 'triangle', vol: 0.12 });
      break;
    case 'cut': noise(d, t, 0.12, { vol: 0.3, freq: 3000, q: 4 }); tone(d, 1200, t, 0.08, { type: 'sawtooth', vol: 0.06, glideTo: 300 }); break;
    case 'invert': tone(d, 300, t, 0.3, { type: 'sine', vol: 0.15, glideTo: 900 }); tone(d, 900, t + 0.15, 0.3, { type: 'sine', vol: 0.1, glideTo: 300 }); break;
    case 'hold':
      for (let i = 0; i < 6; i++) tone(d, hz(69), t + i * 0.06, 0.04, { type: 'sine', vol: 0.1 - i * 0.012 });
      break;
    case 'fail': tone(d, 90, t, 0.25, { type: 'square', vol: 0.12, glideTo: 50 }); noise(d, t, 0.15, { vol: 0.15, freq: 200, type: 'lowpass' }); break;
    case 'hit': noise(d, t, 0.1, { vol: 0.35, freq: 900 }); tone(d, 160, t, 0.08, { type: 'square', vol: 0.08, glideTo: 80 }); break;
    case 'crit': noise(d, t, 0.18, { vol: 0.45, freq: 1500 }); tone(d, 220, t, 0.15, { type: 'sawtooth', vol: 0.12, glideTo: 60 }); break;
    case 'heal': [67, 71, 74, 79].forEach((m, i) => tone(d, hz(m), t + i * 0.05, 0.18, { type: 'sine', vol: 0.1 })); break;
    case 'levelup': [60, 64, 67, 72, 76].forEach((m, i) => tone(d, hz(m), t + i * 0.08, 0.3, { type: 'square', vol: 0.06 })); break;
    case 'encounter': noise(d, t, 0.5, { vol: 0.25, freq: 600, q: 0.5 }); tone(d, 220, t, 0.4, { type: 'sawtooth', vol: 0.08, glideTo: 880 }); break;
    case 'victory': [[67, 0], [72, 0.12], [76, 0.24], [79, 0.36], [84, 0.6]].forEach(([m, o]) => tone(d, hz(m), t + o, 0.35, { type: 'square', vol: 0.07 })); break;
    case 'restore':
      for (let i = 0; i < 10; i++) tone(d, hz(84 + (i % 5) * 2), t + i * 0.05, 0.2, { type: 'sine', vol: 0.06 });
      bell(t + 0.2, 0.6);
      break;
    case 'bell': bell(t, 1); break;
    case 'revive': tone(d, 200, t, 0.4, { type: 'sawtooth', vol: 0.08, glideTo: 600 }); break;
    case 'death': tone(d, 400, t, 0.5, { type: 'triangle', vol: 0.12, glideTo: 60 }); break;
  }
}

/** 鐘：非調和な倍音を重ねた長い減衰 */
function bell(t: number, strength: number) {
  const base = 98;
  const partials: [number, number][] = [[0.5, 0.5], [1, 1], [1.19, 0.6], [1.56, 0.45], [2, 0.5], [2.51, 0.3], [3.01, 0.2], [4.1, 0.12]];
  for (const [r, v] of partials) {
    const c = ctx!;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.value = base * r;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16 * v * strength, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 5 / Math.sqrt(r));
    o.connect(g); g.connect(seGain);
    o.start(t); o.stop(t + 6);
  }
}

// ---------- 音楽 ----------

// 灰鐘の主題（同じ旋律を各曲で組み替える）
const MOTIF: Note[] = [[64, 1], [67, 1], [71, 2], [69, 1], [67, 1], [64, 2], [62, 1], [64, 1], [67, 1], [69, 1], [67, 3], [null, 1]];

interface Song { tempo: number; lead: Note[]; bass: Note[]; leadType: OscillatorType; leadVol: number; transpose: number; pad?: boolean; tick?: boolean }

const SONGS: Record<string, Song> = {
  title: { tempo: 66, lead: MOTIF, bass: [[40, 4], [43, 4], [38, 4], [40, 4]], leadType: 'sine', leadVol: 0.12, transpose: 0, pad: true },
  archive: { tempo: 72, lead: MOTIF.map(([m, d]) => [m === null ? null : m - 12, d] as Note), bass: [[40, 8], [36, 8]], leadType: 'sine', leadVol: 0.1, transpose: 0, pad: true },
  home: { tempo: 60, lead: MOTIF, bass: [[45, 4], [41, 4], [43, 4], [40, 4]], leadType: 'sine', leadVol: 0.09, transpose: 5, pad: true },
  town: { tempo: 96, lead: MOTIF, bass: [[40, 2], [47, 2], [45, 2], [43, 2], [38, 2], [45, 2], [43, 4]], leadType: 'triangle', leadVol: 0.12, transpose: 0 },
  corridor: { tempo: 56, lead: [[64, 2], [null, 2], [63, 2], [null, 1], [70, 3], [null, 2], [62, 4]], bass: [[33, 8], [34, 8]], leadType: 'sine', leadVol: 0.08, transpose: -12, pad: true },
  tower: { tempo: 84, lead: MOTIF.map(([m, d]) => [m === null ? null : m === 71 ? 70 : m === 64 ? 63 : m, d] as Note), bass: [[36, 2], [36, 2], [43, 2], [41, 2]], leadType: 'triangle', leadVol: 0.1, transpose: 0, tick: true },
  top: { tempo: 60, lead: [[71, 3], [69, 1], [67, 4], [64, 3], [62, 1], [64, 4]], bass: [[40, 8], [35, 8]], leadType: 'sine', leadVol: 0.1, transpose: 0, pad: true },
  battle: { tempo: 148, lead: MOTIF.map(([m, d]) => [m === null ? null : m - 2, d / 2] as Note).concat(MOTIF.map(([m, d]) => [m === null ? null : m + 1, d / 2] as Note)), bass: [[38, 1], [38, 1], [45, 1], [38, 1], [41, 1], [41, 1], [43, 1], [44, 1]], leadType: 'square', leadVol: 0.06, transpose: 0 },
  boss: { tempo: 128, lead: [[64, 0.5], [67, 0.5], [70, 1], [69, 0.5], [67, 0.5], [63, 1], [62, 0.5], [63, 0.5], [67, 0.5], [70, 0.5], [75, 2]], bass: [[28, 1], [28, 1], [35, 1], [34, 1], [28, 1], [28, 1], [31, 1], [33, 1]], leadType: 'sawtooth', leadVol: 0.05, transpose: 0 },
  end: { tempo: 70, lead: MOTIF.concat(MOTIF.map(([m, d]) => [m === null ? null : m + 5, d] as Note)), bass: [[40, 4], [45, 4], [43, 4], [48, 4]], leadType: 'sine', leadVol: 0.12, transpose: 0, pad: true },
};

function schedule(song: Song) {
  const c = ctx!;
  const beat = 60 / song.tempo;
  const leadLen = song.lead.reduce((a, n) => a + n[1], 0);
  const bassLen = song.bass.reduce((a, n) => a + n[1], 0);
  const loopBeats = Math.max(leadLen, bassLen);
  let next = c.currentTime + 0.1;
  const play = () => {
    if (!ctx) return;
    while (next < c.currentTime + 1.5) {
      const start = next;
      // 欠因の度合いに応じて旋律の音が欠ける（つながるほど欠けない）
      let t = start;
      for (let rep = 0; rep < Math.ceil(loopBeats / leadLen); rep++) {
        for (const [m, d] of song.lead) {
          if (m !== null && Math.random() > 0.25 + wholeness * 0.75) { t += d * beat; continue; }
          if (m !== null) tone(bgmGain, hz(m + song.transpose), t, d * beat * 0.9, { type: song.leadType, vol: song.leadVol, release: 0.2 });
          t += d * beat;
        }
      }
      t = start;
      for (let rep = 0; rep < Math.ceil(loopBeats / bassLen); rep++) {
        for (const [m, d] of song.bass) {
          if (m !== null) tone(bgmGain, hz(m), t, d * beat * 0.95, { type: 'sine', vol: 0.16, release: 0.15 });
          if (song.pad && m !== null) tone(bgmGain, hz(m + 19), t, d * beat, { type: 'sine', vol: 0.035, attack: d * beat * 0.4, release: 0.5 });
          t += d * beat;
        }
      }
      if (song.tick) for (let i = 0; i < loopBeats; i++) noise(bgmGain, start + i * beat, 0.02, { vol: 0.06, freq: 4000, q: 8 });
      next = start + loopBeats * beat;
    }
  };
  play();
  timer = window.setInterval(play, 400);
}

export function playBgm(id: string): void {
  const c = ensure();
  if (!c || id === current) return;
  current = id;
  if (timer) { clearInterval(timer); timer = null; }
  // 古い音を止めるためにゲインを付け替える
  const old = bgmGain;
  old.gain.setTargetAtTime(0, c.currentTime, 0.2);
  setTimeout(() => old.disconnect(), 1500);
  bgmGain = c.createGain();
  bgmGain.gain.value = vol.bgm * 0.32;
  bgmGain.connect(master);
  const song = SONGS[id];
  if (song) schedule(song);
}

export function stopBgm(): void {
  if (timer) { clearInterval(timer); timer = null; }
  current = '';
  if (ctx) bgmGain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
}

// ---------- 環境音 ----------

export function playAmbient(kind: string): void {
  const c = ensure();
  if (!c) return;
  if (ambTimer) { clearInterval(ambTimer); ambTimer = null; }
  if (ambNode) { try { ambNode.stop(); } catch { /* 既に停止 */ } ambNode = null; }
  if (kind === 'wind' || kind === 'hollow') {
    const len = c.sampleRate * 4;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = last * 0.98 + (Math.random() * 2 - 1) * 0.02; d[i] = last * 4; }
    const s = c.createBufferSource();
    s.buffer = buf; s.loop = true;
    const f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = kind === 'wind' ? 700 : 300;
    const g = c.createGain(); g.gain.value = kind === 'wind' ? 0.35 : 0.5;
    s.connect(f); f.connect(g); g.connect(ambGain);
    s.start();
    ambNode = s;
  }
  if (kind === 'town') {
    // 鳥の声と遠い足音。ときどき「欠ける」
    ambTimer = window.setInterval(() => {
      if (!ctx) return;
      const t = ctx.currentTime + Math.random() * 0.5;
      if (Math.random() < 0.35 && Math.random() < 0.4 + wholeness * 0.6) {
        const f = 2400 + Math.random() * 1600;
        for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) tone(ambGain, f, t + i * 0.09, 0.05, { type: 'sine', vol: 0.05, glideTo: f * 1.3 });
      }
      if (Math.random() < 0.3) noise(ambGain, t, 0.05, { vol: 0.04, freq: 400 });
    }, 900);
  }
}
