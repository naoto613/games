// 効果音と BGM（すべて WebAudio で合成。ユーザー操作のあとに開始する）
type Note = [number, number]; // [半音(A4=0, nullで休符は -99), 長さ(拍)]

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;
let bgmTimer: number | null = null;
let bgmName = '';
let paused = false;

export function unlockAudio() {
  if (ctx) {
    if (ctx.state === 'suspended' && !paused) ctx.resume();
    return;
  }
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = enabled ? 0.22 : 0;
  master.connect(ctx.destination);
}
export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (master) master.gain.value = on ? 0.22 : 0;
}
/** バックグラウンドでは止める */
export function pauseAudio(p: boolean) {
  paused = p;
  if (!ctx) return;
  if (p) ctx.suspend();
  else ctx.resume();
}

const freq = (semi: number) => 440 * Math.pow(2, semi / 12);
function tone(semi: number, start: number, dur: number, type: OscillatorType = 'square', vol = 0.5, slide = 0) {
  if (!ctx || !master) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq(semi), start);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq(semi + slide), start + dur);
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  o.connect(g);
  g.connect(master);
  o.start(start);
  o.stop(start + dur + 0.02);
}
function noise(start: number, dur: number, vol = 0.4) {
  if (!ctx || !master) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = ctx.createBufferSource();
  const g = ctx.createGain();
  g.gain.value = vol;
  s.buffer = buf;
  s.connect(g);
  g.connect(master);
  s.start(start);
}
function seq(notes: Note[], bpm: number, type: OscillatorType = 'square', vol = 0.35, at = 0) {
  if (!ctx) return 0;
  let t = (at || ctx.currentTime) + 0.01;
  const beat = 60 / bpm;
  for (const [n, len] of notes) {
    if (n > -90) tone(n, t, len * beat * 0.95, type, vol);
    t += len * beat;
  }
  return t;
}

export type Sfx = 'cursor' | 'ok' | 'cancel' | 'bump' | 'hit' | 'crit' | 'magic' | 'heal' | 'levelup' | 'recruit' | 'breed' | 'stairs' | 'chest' | 'encounter' | 'win' | 'lose' | 'buy' | 'dead' | 'status' | 'save';

export function sfx(name: Sfx) {
  if (!ctx || !enabled || paused) return;
  const t = ctx.currentTime + 0.005;
  switch (name) {
    case 'cursor': tone(12, t, 0.04, 'square', 0.25); break;
    case 'ok': tone(15, t, 0.05, 'square', 0.3); tone(22, t + 0.05, 0.07, 'square', 0.3); break;
    case 'cancel': tone(10, t, 0.06, 'square', 0.3); tone(3, t + 0.06, 0.08, 'square', 0.3); break;
    case 'bump': tone(-20, t, 0.08, 'square', 0.35); break;
    case 'hit': noise(t, 0.12, 0.5); tone(-10, t, 0.1, 'square', 0.3, -12); break;
    case 'crit': noise(t, 0.25, 0.7); tone(5, t, 0.2, 'sawtooth', 0.4, -24); break;
    case 'magic': for (let i = 0; i < 6; i++) tone(12 + i * 3, t + i * 0.03, 0.08, 'triangle', 0.3); break;
    case 'heal': seq([[19, 0.25], [24, 0.25], [28, 0.5]], 300, 'triangle', 0.35); break;
    case 'status': tone(0, t, 0.25, 'sine', 0.35, 7); tone(7, t + 0.1, 0.25, 'sine', 0.25, -7); break;
    case 'dead': tone(0, t, 0.35, 'square', 0.35, -24); break;
    case 'levelup': seq([[12, 0.5], [16, 0.5], [19, 0.5], [24, 1.5]], 280, 'square', 0.3); break;
    case 'recruit': seq([[7, 0.5], [12, 0.5], [16, 0.5], [19, 0.5], [16, 0.5], [24, 2]], 260, 'square', 0.3); break;
    case 'breed': seq([[0, 0.5], [7, 0.5], [12, 0.5], [16, 0.5], [19, 0.5], [24, 0.5], [28, 0.5], [31, 2]], 220, 'triangle', 0.4); break;
    case 'stairs': for (let i = 0; i < 8; i++) tone(20 - i * 3, t + i * 0.05, 0.08, 'square', 0.25); break;
    case 'chest': seq([[12, 0.5], [16, 0.5], [19, 0.5], [24, 1]], 360, 'square', 0.3); break;
    case 'encounter': for (let i = 0; i < 10; i++) tone(i % 2 ? 7 : 0, t + i * 0.04, 0.05, 'square', 0.3); break;
    case 'win': seq([[12, 0.5], [12, 0.5], [12, 0.5], [16, 1.5], [14, 0.5], [17, 0.5], [21, 2]], 300, 'square', 0.3); break;
    case 'lose': seq([[7, 1], [3, 1], [0, 1], [-5, 3]], 140, 'triangle', 0.4); break;
    case 'buy': tone(24, t, 0.06, 'square', 0.25); tone(31, t + 0.06, 0.1, 'square', 0.25); break;
    case 'save': seq([[12, 0.5], [19, 0.5], [24, 1]], 300, 'triangle', 0.35); break;
  }
}

// ---- BGM（短いループ。オリジナルの旋律）
const SONGS: Record<string, { bpm: number; mel: Note[]; bass: Note[]; type?: OscillatorType }> = {
  town: {
    bpm: 112,
    mel: [[12, 1], [16, 1], [19, 1], [16, 1], [17, 1.5], [16, 0.5], [14, 2], [12, 1], [14, 1], [16, 1], [12, 1], [11, 2], [-99, 2],
      [12, 1], [16, 1], [19, 1], [21, 1], [19, 1.5], [17, 0.5], [16, 2], [14, 1], [16, 1], [14, 1], [11, 1], [12, 3], [-99, 1]],
    bass: [[0, 2], [-5, 2], [-7, 2], [-5, 2], [-3, 2], [-8, 2], [-7, 2], [-5, 2], [0, 2], [-5, 2], [-7, 2], [-5, 2], [-3, 2], [-5, 2], [0, 4]],
  },
  field: {
    bpm: 132,
    mel: [[7, 1], [9, 0.5], [11, 0.5], [12, 1], [11, 1], [9, 1], [7, 1], [4, 2], [5, 1], [7, 1], [9, 1], [5, 1], [7, 3], [-99, 1],
      [7, 1], [9, 0.5], [11, 0.5], [12, 1], [14, 1], [16, 1], [14, 1], [12, 2], [11, 1], [9, 1], [11, 1], [14, 1], [12, 3], [-99, 1]],
    bass: [[-12, 2], [-5, 2], [-7, 2], [-12, 2], [-10, 2], [-7, 2], [-12, 2], [-5, 2], [-12, 2], [-5, 2], [-3, 2], [-8, 2], [-10, 2], [-5, 2], [-12, 4]],
    type: 'triangle',
  },
  battle: {
    bpm: 168,
    mel: [[12, 0.5], [12, 0.5], [15, 0.5], [12, 0.5], [17, 0.5], [15, 0.5], [12, 1], [10, 0.5], [10, 0.5], [14, 0.5], [10, 0.5], [15, 0.5], [14, 0.5], [10, 1],
      [12, 0.5], [15, 0.5], [19, 0.5], [17, 0.5], [15, 0.5], [17, 0.5], [19, 1], [20, 0.5], [19, 0.5], [17, 0.5], [15, 0.5], [14, 1], [15, 1]],
    bass: [[0, 0.5], [0, 0.5], [12, 0.5], [0, 0.5], [0, 0.5], [0, 0.5], [12, 0.5], [0, 0.5], [-2, 0.5], [-2, 0.5], [10, 0.5], [-2, 0.5], [-2, 0.5], [-2, 0.5], [10, 0.5], [-2, 0.5],
      [-4, 0.5], [-4, 0.5], [8, 0.5], [-4, 0.5], [-4, 0.5], [-4, 0.5], [8, 0.5], [-4, 0.5], [-5, 0.5], [-5, 0.5], [7, 0.5], [-5, 0.5], [-5, 0.5], [7, 0.5], [-5, 1]],
  },
};

export function playBgm(name: keyof typeof SONGS | '') {
  if (name === bgmName) return;
  bgmName = name;
  if (bgmTimer) window.clearTimeout(bgmTimer);
  bgmTimer = null;
  if (!name || !ctx) return;
  const loop = () => {
    if (!ctx || bgmName !== name) return;
    if (!enabled || paused) {
      bgmTimer = window.setTimeout(loop, 1000);
      return;
    }
    const s = SONGS[name];
    const start = ctx.currentTime + 0.05;
    const end = seq(s.mel, s.bpm, s.type ?? 'square', 0.12, start);
    seq(s.bass, s.bpm, 'triangle', 0.18, start);
    bgmTimer = window.setTimeout(loop, (end - ctx.currentTime) * 1000 - 30);
  };
  loop();
}
