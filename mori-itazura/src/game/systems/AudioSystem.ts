// 音：BGM・環境音・効果音・キャラクターの「おしゃべり音」を Web Audio でその場で合成する（音声ファイル不要）。
// スマホではユーザーの操作のあとでないと音が出せないため、最初のタップで unlock() する。

export type Mood = 'title' | 'day' | 'evening' | 'night' | 'chase';
export type Surface = 'grass' | 'dirt' | 'wood';

type Inst = 'pluck' | 'marimba' | 'bass' | 'pad' | 'musicbox' | 'stab' | 'flute';

interface Song {
  bpm: number;
  chords: number[][];          // 1 小節ずつ（MIDI ノート）
  melody: (number | null)[];   // 8 分音符ごと（小節 × 8）
  lead: Inst;
  arp?: Inst;
  arpPattern?: number[];       // コード構成音の番号（-1 で休み）
  bass?: number[];             // 8 分音符ごとのベースの出し方（0 休み / 1 根音 / 5 五度 / 8 オクターブ）
  drums?: { kick: number[]; snare: number[]; hat: number[] };
  pad?: boolean;
  swing?: number;
  vol: number;
}

const C = (n: string) => {
  const m = /^([A-G])(#|b)?(\d)$/.exec(n)!;
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1] as 'C'];
  return 12 * (+m[3] + 1) + base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
};
const chord = (...ns: string[]) => ns.map(C);
const mel = (s: string) => s.trim().split(/\s+/).map((t) => (t === '.' ? null : C(t)));

// ひるのテーマ：のんびりした ハ長調、ギター風のアルペジオとマリンバのメロディ
const DAY: Song = {
  bpm: 96, swing: 0.12, vol: 0.9, lead: 'marimba', arp: 'pluck',
  chords: [chord('C3', 'E3', 'G3', 'C4'), chord('A2', 'E3', 'A3', 'C4'), chord('F2', 'C3', 'F3', 'A3'), chord('G2', 'D3', 'G3', 'B3'),
    chord('C3', 'E3', 'G3', 'C4'), chord('E2', 'B2', 'E3', 'G#3'), chord('F2', 'C3', 'F3', 'A3'), chord('G2', 'D3', 'G3', 'B3')],
  melody: mel(`
    E5 . G5 . A5 G5 E5 .   C5 . . D5 E5 . . .
    F5 . A5 . C6 A5 F5 .   G5 . . F5 E5 . D5 .
    E5 . G5 . A5 G5 E5 C5  B4 . . C5 D5 . E5 .
    F5 E5 D5 . C5 . A4 .   B4 . C5 . D5 . . .`),
  arpPattern: [0, 2, 1, 3, 2, 1, 3, 2],
  bass: [1, 0, 0, 5, 1, 0, 8, 0],
  drums: { kick: [1, 0, 0, 0, 1, 0, 0, 0], snare: [0, 0, 0, 0, 0, 0, 0, 0], hat: [0, 1, 0, 1, 0, 1, 0, 1] },
};
// ゆうがた：同じメロディをゆっくり、フルートで
const EVENING: Song = { ...DAY, bpm: 84, lead: 'flute', drums: undefined, pad: true, vol: 0.8 };
// よる：イ短調のオルゴールと やわらかいパッド
const NIGHT: Song = {
  bpm: 70, vol: 1.25, lead: 'musicbox', pad: true,
  chords: [chord('A2', 'E3', 'A3', 'C4'), chord('F2', 'C3', 'F3', 'A3'), chord('C3', 'G3', 'C4', 'E4'), chord('G2', 'D3', 'G3', 'B3'),
    chord('A2', 'E3', 'A3', 'C4'), chord('D3', 'A3', 'D4', 'F4'), chord('E2', 'B2', 'E3', 'G#3'), chord('E2', 'B2', 'E3', 'G#3')],
  melody: mel(`
    A5 . . . C6 . B5 .   A5 . . . . . . .
    F5 . . . A5 . G5 .   E5 . . . . . . .
    C6 . . . E6 . D6 .   C6 . B5 . G5 . . .
    A5 . . . F5 . . .    E5 . . . G#5 . . .`),
  arp: 'pluck', arpPattern: [0, -1, 2, -1, 3, -1, 2, -1],
  bass: [1, 0, 0, 0, 0, 0, 0, 0],
};
// おいかけっこ：ニ短調のすばやいスタッカート
const CHASE: Song = {
  bpm: 152, vol: 0.85, lead: 'stab',
  chords: [chord('D3', 'F3', 'A3'), chord('D3', 'F3', 'A3'), chord('Bb2', 'D3', 'F3'), chord('A2', 'C#3', 'E3'),
    chord('D3', 'F3', 'A3'), chord('C3', 'E3', 'G3'), chord('Bb2', 'D3', 'F3'), chord('A2', 'C#3', 'E3')],
  melody: mel(`
    D5 . D5 F5 . E5 D5 .   A4 . . A4 C#5 . E5 .
    F5 . F5 G5 . F5 E5 .   E5 . C#5 . A4 . . .
    D5 . D5 F5 . E5 D5 .   G5 . E5 . C5 . . .
    F5 E5 D5 . Bb4 . D5 .  C#5 . E5 . A5 . . .`),
  arp: 'pluck', arpPattern: [0, 0, 1, 0, 2, 0, 1, 2],
  bass: [1, 1, 8, 1, 1, 1, 8, 5],
  drums: { kick: [1, 0, 0, 1, 1, 0, 0, 0], snare: [0, 0, 1, 0, 0, 0, 1, 0], hat: [1, 1, 1, 1, 1, 1, 1, 1] },
};
const TITLE: Song = { ...DAY, bpm: 92, pad: true };
const SONGS: Record<Mood, Song> = { title: TITLE, day: DAY, evening: EVENING, night: NIGHT, chase: CHASE };

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export class AudioSystem {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private bgm!: GainNode;
  private bgmFilter!: BiquadFilterNode;
  private sfx!: GainNode;
  private amb!: GainNode;
  private verb!: ConvolverNode;
  private verbSend!: GainNode;
  private noiseBuf!: AudioBuffer;
  bgmVol = 0.7;
  sfxVol = 0.8;
  private mood: Mood | null = null;
  private song: Song = DAY;
  private step = 0;
  private nextTime = 0;
  private songGain!: GainNode;
  private pendingMood: Mood | null = null;
  // 環境音
  private fireGain!: GainNode;
  private waterGain!: GainNode;
  private birdT = 2;
  private cricketT = 1;
  private crackleT = 0;
  private night = 0;
  private enabledAmb = false;

  constructor() {
    try {
      const v = JSON.parse(localStorage.getItem('mori-audio') || 'null');
      if (v) { this.bgmVol = v.bgm ?? this.bgmVol; this.sfxVol = v.sfx ?? this.sfxVol; }
    } catch { /* */ }
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend(); else this.ctx.resume();
    });
  }

  /** ユーザー操作の中で呼ぶ（スマホで音を出すために必要） */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const c = new AC({ latencyHint: 'interactive' });
      this.ctx = c;
      this.master = c.createGain(); this.master.gain.value = 0.9;
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.2;
      this.master.connect(comp).connect(c.destination);
      this.verb = c.createConvolver();
      this.verb.buffer = this.impulse(1.8, 2.6);
      this.verbSend = c.createGain(); this.verbSend.gain.value = 0.28;
      this.verbSend.connect(this.verb).connect(this.master);
      this.bgmFilter = c.createBiquadFilter(); this.bgmFilter.type = 'lowpass'; this.bgmFilter.frequency.value = 18000;
      this.bgm = c.createGain(); this.bgm.gain.value = this.bgmVol * 0.55;
      this.bgm.connect(this.bgmFilter).connect(this.master);
      this.songGain = c.createGain(); this.songGain.gain.value = 1;
      this.songGain.connect(this.bgm);
      this.songGain.connect(this.verbSend);
      this.sfx = c.createGain(); this.sfx.gain.value = this.sfxVol;
      this.sfx.connect(this.master);
      this.amb = c.createGain(); this.amb.gain.value = this.sfxVol * 0.8;
      this.amb.connect(this.master);
      const n = c.sampleRate * 2;
      this.noiseBuf = c.createBuffer(1, n, c.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.startLoops();
      this.nextTime = c.currentTime + 0.1;
      // 描画が重くても音楽が途切れないよう、描画とは別のタイマーで少し先まで予約する
      setInterval(() => this.schedule(), 40);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  get ready() { return !!this.ctx && this.ctx.state === 'running'; }

  setVolumes(bgm: number, sfx: number) {
    this.bgmVol = bgm; this.sfxVol = sfx;
    try { localStorage.setItem('mori-audio', JSON.stringify({ bgm, sfx })); } catch { /* */ }
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.bgm.gain.setTargetAtTime(bgm * 0.55, t, 0.05);
    this.sfx.gain.setTargetAtTime(sfx, t, 0.05);
    this.amb.gain.setTargetAtTime(sfx * 0.8, t, 0.05);
  }

  private impulse(sec: number, decay: number) {
    const c = this.ctx!;
    const len = Math.floor(c.sampleRate * sec);
    const b = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }

  // ───────── 毎フレーム ─────────
  update(dt: number, info: { mood: Mood; alert: number; night: number; fireDist: number; waterDist: number; inGame: boolean }) {
    const c = this.ctx;
    if (!c || c.state !== 'running') return;
    this.night = info.night;
    if (info.mood !== this.mood && info.mood !== this.pendingMood) this.switchMood(info.mood);
    // 警戒されているとき：BGM をこもらせる
    const cut = info.mood === 'chase' ? 18000 : info.alert >= 50 ? 700 : info.alert >= 20 ? 1800 : 18000;
    this.bgmFilter.frequency.setTargetAtTime(cut, c.currentTime, 0.4);
    // 環境音
    this.enabledAmb = info.inGame;
    const t = c.currentTime;
    this.fireGain.gain.setTargetAtTime(info.inGame ? Math.max(0, 1 - info.fireDist / 11) * 0.5 : 0.15, t, 0.3);
    this.waterGain.gain.setTargetAtTime(info.inGame ? Math.max(0, 1 - info.waterDist / 9) * 0.35 : 0.05, t, 0.3);
    this.birdT -= dt; this.cricketT -= dt; this.crackleT -= dt;
    if (this.birdT <= 0) {
      this.birdT = 1.5 + Math.random() * 4;
      if (info.night < 0.4) this.bird();
    }
    if (this.cricketT <= 0) {
      this.cricketT = 0.4 + Math.random() * 0.9;
      if (info.night > 0.5) this.cricket();
    }
    if (this.crackleT <= 0) {
      this.crackleT = 0.05 + Math.random() * 0.25;
      if (info.fireDist < 11 && info.inGame) this.crackle(Math.max(0, 1 - info.fireDist / 11));
    }
  }

  private schedule() {
    const c = this.ctx;
    if (!c || c.state !== 'running' || !this.mood) return;
    const ahead = c.currentTime + 0.25;
    if (this.nextTime < c.currentTime - 0.5) this.nextTime = c.currentTime + 0.05;
    while (this.nextTime < ahead) {
      this.playStep(this.step, this.nextTime);
      const s = this.song;
      const eighth = 60 / s.bpm / 2;
      const sw = s.swing ?? 0;
      this.nextTime += eighth * (this.step % 2 === 0 ? 1 + sw : 1 - sw);
      this.step++;
    }
  }

  private switchMood(m: Mood) {
    const c = this.ctx!;
    const fast = m === 'chase' || this.mood === 'chase';
    const fade = fast ? 0.12 : 1.2;
    this.pendingMood = m;
    const old = this.songGain;
    old.gain.setTargetAtTime(0, c.currentTime, fade / 3);
    setTimeout(() => old.disconnect(), fade * 1000 + 600);
    const g = c.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(1, c.currentTime + fade * 0.6, fade / 3);
    g.connect(this.bgm); g.connect(this.verbSend);
    this.songGain = g;
    this.song = SONGS[m];
    this.mood = m;
    this.pendingMood = null;
    this.step = 0;
    this.nextTime = Math.max(c.currentTime + (fast ? 0.02 : fade * 0.5), this.nextTime);
  }

  // ───────── 音楽 ─────────
  private playStep(step: number, t: number) {
    const s = this.song;
    const bar = Math.floor(step / 8) % s.chords.length;
    const pos = step % 8;
    const ch = s.chords[bar];
    const out = this.songGain;
    const v = s.vol;
    const beat = 60 / s.bpm;
    // パッド
    if (s.pad && pos === 0) for (const n of ch) this.inst('pad', mtof(n + 12), t, beat * 4, 0.05 * v, out);
    // アルペジオ
    if (s.arp && s.arpPattern) {
      const k = s.arpPattern[pos];
      if (k >= 0) this.inst(s.arp, mtof(ch[k % ch.length] + 12), t, beat * 0.9, 0.09 * v, out);
    }
    // ベース
    if (s.bass) {
      const b = s.bass[pos];
      if (b) {
        const root = ch[0] - 12;
        const n = b === 1 ? root : b === 5 ? root + 7 : root + 12;
        this.inst('bass', mtof(n), t, beat * (s === CHASE ? 0.4 : 0.9), 0.22 * v, out);
      }
    }
    // メロディ（2 周目以降、ときどき休む）
    const loop = Math.floor(step / (8 * s.chords.length));
    const m = s.melody[(step) % s.melody.length];
    if (m && !(loop % 3 === 2 && s !== CHASE)) this.inst(s.lead, mtof(m), t, beat * (s.lead === 'flute' ? 1.2 : 0.8), (s.lead === 'stab' ? 0.08 : 0.13) * v, out);
    // ドラム
    if (s.drums) {
      if (s.drums.kick[pos]) this.kick(t, 0.35 * v, out);
      if (s.drums.snare[pos]) this.snare(t, 0.16 * v, out);
      if (s.drums.hat[pos]) this.hat(t, (pos % 2 ? 0.05 : 0.03) * v, out);
    }
  }

  private inst(kind: Inst, f: number, t: number, dur: number, vol: number, out: AudioNode) {
    const c = this.ctx!;
    const g = c.createGain();
    g.connect(out);
    const env = (a: number, d: number, peak = vol) => {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    };
    const osc = (type: OscillatorType, freq: number, stop: number, detune = 0) => {
      const o = c.createOscillator();
      o.type = type; o.frequency.value = freq; o.detune.value = detune;
      o.start(t); o.stop(t + stop);
      return o;
    };
    switch (kind) {
      case 'pluck': {
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1;
        lp.frequency.setValueAtTime(f * 6, t); lp.frequency.exponentialRampToValueAtTime(f * 1.2, t + 0.25);
        lp.connect(g);
        osc('triangle', f, dur + 0.5).connect(lp);
        osc('sawtooth', f, dur + 0.5, 4).connect(lp);
        env(0.004, Math.min(1.2, dur + 0.3), vol * 0.7);
        break;
      }
      case 'marimba': {
        osc('sine', f, 0.9).connect(g);
        const h = c.createGain(); h.gain.value = 0.25; h.connect(g);
        osc('sine', f * 4, 0.2).connect(h);
        env(0.003, 0.55);
        break;
      }
      case 'musicbox': {
        osc('sine', f, 1.6).connect(g);
        const h = c.createGain(); h.gain.value = 0.18; h.connect(g);
        osc('sine', f * 3, 0.6).connect(h);
        env(0.002, 1.3, vol * 0.8);
        break;
      }
      case 'flute': {
        const o = osc('sine', f, dur + 0.3);
        const lfo = c.createOscillator(); lfo.frequency.value = 5; const lg = c.createGain(); lg.gain.value = f * 0.006;
        lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(t + dur + 0.3);
        o.connect(g);
        const n = this.noiseSrc(t, dur); const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 6;
        const ng = c.createGain(); ng.gain.value = 0.15; n.connect(bp).connect(ng).connect(g);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol * 0.9, t + 0.06);
        g.gain.setValueAtTime(vol * 0.8, t + dur * 0.7);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
        break;
      }
      case 'bass': {
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; lp.connect(g);
        osc('triangle', f, dur + 0.2).connect(lp);
        osc('sine', f / 2, dur + 0.2).connect(lp);
        env(0.006, dur);
        break;
      }
      case 'pad': {
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.connect(g);
        osc('sawtooth', f, dur + 1, -8).connect(lp);
        osc('sawtooth', f, dur + 1, 8).connect(lp);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.9);
        break;
      }
      case 'stab': {
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.connect(g);
        osc('square', f, 0.3).connect(lp);
        env(0.003, 0.16);
        break;
      }
    }
  }

  private noiseSrc(t: number, dur: number) {
    const c = this.ctx!;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    s.loop = true;
    s.start(t, Math.random() * 1.5);
    s.stop(t + dur + 0.05);
    return s;
  }
  private kick(t: number, vol: number, out: AudioNode) {
    const c = this.ctx!;
    const o = c.createOscillator(); const g = c.createGain();
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g).connect(out); o.start(t); o.stop(t + 0.22);
  }
  private snare(t: number, vol: number, out: AudioNode) {
    const c = this.ctx!;
    const n = this.noiseSrc(t, 0.15); const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1200;
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    n.connect(hp).connect(g).connect(out);
  }
  private hat(t: number, vol: number, out: AudioNode) {
    const c = this.ctx!;
    const n = this.noiseSrc(t, 0.05); const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    n.connect(hp).connect(g).connect(out);
  }

  // ───────── 環境音 ─────────
  private startLoops() {
    const c = this.ctx!;
    // たき火のごうごう音
    this.fireGain = c.createGain(); this.fireGain.gain.value = 0;
    const fn = c.createBufferSource(); fn.buffer = this.noiseBuf; fn.loop = true;
    const flp = c.createBiquadFilter(); flp.type = 'lowpass'; flp.frequency.value = 500;
    const fg = c.createGain(); fg.gain.value = 0.25;
    fn.connect(flp).connect(fg).connect(this.fireGain).connect(this.amb); fn.start();
    // 水辺のちゃぷちゃぷ音（ゆっくり強弱）
    this.waterGain = c.createGain(); this.waterGain.gain.value = 0;
    const wn = c.createBufferSource(); wn.buffer = this.noiseBuf; wn.loop = true;
    const wbp = c.createBiquadFilter(); wbp.type = 'bandpass'; wbp.frequency.value = 700; wbp.Q.value = 0.8;
    const wam = c.createGain(); wam.gain.value = 0.2;
    const lfo = c.createOscillator(); lfo.frequency.value = 0.35; const lg = c.createGain(); lg.gain.value = 0.18;
    lfo.connect(lg).connect(wam.gain); lfo.start();
    wn.connect(wbp).connect(wam).connect(this.waterGain).connect(this.amb); wn.start();
  }

  private bird() {
    const c = this.ctx!;
    const t = c.currentTime;
    const base = 2200 + Math.random() * 1800;
    const n = 2 + Math.floor(Math.random() * 4);
    const pan = c.createStereoPanner(); pan.pan.value = Math.random() * 1.6 - 0.8; pan.connect(this.amb);
    for (let i = 0; i < n; i++) {
      const tt = t + i * (0.09 + Math.random() * 0.05);
      const o = c.createOscillator(); const g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(base * (0.9 + Math.random() * 0.2), tt);
      o.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.4), tt + 0.06);
      g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.05, tt + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.08);
      o.connect(g).connect(pan); o.start(tt); o.stop(tt + 0.1);
    }
  }
  private cricket() {
    const c = this.ctx!;
    const t = c.currentTime;
    const pan = c.createStereoPanner(); pan.pan.value = Math.random() * 1.6 - 0.8; pan.connect(this.amb);
    const f = 4200 + Math.random() * 600;
    for (let i = 0; i < 3; i++) {
      const tt = t + i * 0.05;
      const o = c.createOscillator(); const g = c.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.025 * this.night, tt + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.035);
      o.connect(g).connect(pan); o.start(tt); o.stop(tt + 0.04);
    }
  }
  private crackle(k: number) {
    const c = this.ctx!;
    const t = c.currentTime;
    const n = this.noiseSrc(t, 0.03);
    const hp = c.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 1500 + Math.random() * 3000; hp.Q.value = 3;
    const g = c.createGain(); g.gain.setValueAtTime(0.25 * k * Math.random(), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
    n.connect(hp).connect(g).connect(this.amb);
  }

  // ───────── 効果音 ─────────
  private tone(f: number, dur: number, opt: { type?: OscillatorType; vol?: number; f2?: number; at?: number; attack?: number; verb?: number; out?: AudioNode } = {}) {
    const c = this.ctx!;
    const t = c.currentTime + (opt.at ?? 0);
    const o = c.createOscillator(); const g = c.createGain();
    o.type = opt.type ?? 'sine';
    o.frequency.setValueAtTime(f, t);
    if (opt.f2) o.frequency.exponentialRampToValueAtTime(opt.f2, t + dur);
    const v = opt.vol ?? 0.2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + (opt.attack ?? 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(opt.out ?? this.sfx);
    if (opt.verb) { const s = c.createGain(); s.gain.value = opt.verb; g.connect(s).connect(this.verbSend); }
    o.start(t); o.stop(t + dur + 0.02);
  }
  private noise(dur: number, opt: { type?: BiquadFilterType; f?: number; f2?: number; q?: number; vol?: number; at?: number; attack?: number } = {}) {
    const c = this.ctx!;
    const t = c.currentTime + (opt.at ?? 0);
    const n = this.noiseSrc(t, dur);
    const fl = c.createBiquadFilter(); fl.type = opt.type ?? 'bandpass'; fl.Q.value = opt.q ?? 1;
    fl.frequency.setValueAtTime(opt.f ?? 1000, t);
    if (opt.f2) fl.frequency.exponentialRampToValueAtTime(opt.f2, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opt.vol ?? 0.2, t + (opt.attack ?? 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(fl).connect(g).connect(this.sfx);
  }
  private notes(ns: string[], step: number, type: OscillatorType, vol: number, len = 0.3, verb = 0.4) {
    ns.forEach((n, i) => this.tone(mtof(C(n)), len, { type, vol, at: i * step, verb }));
  }

  play(name: string, k = 1) {
    if (!this.ready) return;
    switch (name) {
      case 'pickup':
        this.tone(500, 0.08, { f2: 1100, vol: 0.18 });
        this.notes(['E6', 'B6'], 0.06, 'sine', 0.1, 0.25);
        break;
      case 'coin':
        this.tone(988, 0.08, { type: 'square', vol: 0.06 });
        this.tone(1319, 0.35, { type: 'square', vol: 0.06, at: 0.07 });
        break;
      case 'eat':
        for (let i = 0; i < 4; i++) this.noise(0.08, { type: 'lowpass', f: 900 + Math.random() * 500, vol: 0.25, at: i * 0.2 + Math.random() * 0.03 });
        this.notes(['C6', 'E6', 'G6'], 0.08, 'sine', 0.06, 0.2, 0.2);
        break;
      case 'jump': this.tone(280, 0.18, { f2: 720, vol: 0.12, type: 'triangle' }); break;
      case 'land': this.noise(0.08, { type: 'lowpass', f: 400, vol: 0.18 }); break;
      case 'question': this.tone(620, 0.12, { f2: 760, vol: 0.12, type: 'triangle' }); this.tone(820, 0.18, { f2: 1050, vol: 0.12, type: 'triangle', at: 0.12 }); break;
      case 'alarm':
        this.tone(220, 0.35, { type: 'square', vol: 0.09 }); this.tone(330, 0.35, { type: 'square', vol: 0.07 });
        this.tone(1500, 0.12, { f2: 2200, vol: 0.1, type: 'square', at: 0.02 });
        this.noise(0.18, { type: 'highpass', f: 3000, vol: 0.15 });
        break;
      case 'caught':
        this.tone(160, 0.25, { f2: 60, vol: 0.4 });
        this.tone(440, 0.35, { f2: 300, type: 'triangle', vol: 0.12, at: 0.3 });
        this.tone(330, 0.5, { f2: 180, type: 'triangle', vol: 0.12, at: 0.65 });
        break;
      case 'escape': this.notes(['G5', 'C6', 'E6', 'G6'], 0.07, 'triangle', 0.11, 0.25); break;
      case 'quest':
        this.notes(['C5', 'E5', 'G5', 'C6'], 0.1, 'triangle', 0.14, 0.4, 0.6);
        this.notes(['E6', 'G6'], 0.12, 'square', 0.05, 0.5, 0.6);
        this.tone(mtof(C('C6')), 0.9, { type: 'triangle', vol: 0.12, at: 0.42, verb: 0.6 });
        break;
      case 'questStart': this.notes(['G5', 'D6'], 0.1, 'triangle', 0.1, 0.35, 0.5); break;
      case 'achieve': this.notes(['C6', 'E6', 'G6', 'C7', 'E7'], 0.05, 'sine', 0.08, 0.3, 0.6); break;
      case 'click': this.tone(1400, 0.04, { type: 'triangle', vol: 0.07 }); break;
      case 'open': this.tone(700, 0.08, { f2: 1100, type: 'triangle', vol: 0.08 }); break;
      case 'close': this.tone(1000, 0.08, { f2: 650, type: 'triangle', vol: 0.07 }); break;
      case 'warn': this.tone(300, 0.15, { type: 'triangle', vol: 0.1 }); this.tone(240, 0.2, { type: 'triangle', vol: 0.1, at: 0.12 }); break;
      case 'rustle':
        for (let i = 0; i < 3; i++) this.noise(0.12, { type: 'bandpass', f: 2500 + Math.random() * 2000, q: 0.8, vol: 0.16, at: i * 0.07 });
        break;
      case 'door':
        { const c = this.ctx!; const t = c.currentTime; const o = c.createOscillator(); o.type = 'sawtooth';
          o.frequency.setValueAtTime(140, t); o.frequency.linearRampToValueAtTime(220, t + 0.25); o.frequency.linearRampToValueAtTime(160, t + 0.5);
          const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 4;
          const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
          o.connect(bp).connect(g).connect(this.sfx); o.start(t); o.stop(t + 0.6); }
        this.noise(0.1, { type: 'lowpass', f: 300, vol: 0.2, at: 0.5 });
        break;
      case 'rummage':
        for (let i = 0; i < 6; i++) {
          this.noise(0.07, { type: 'bandpass', f: 1800 + Math.random() * 2500, q: 6, vol: 0.18, at: i * 0.12 + Math.random() * 0.05 });
          this.tone(900 + Math.random() * 900, 0.06, { type: 'square', vol: 0.025, at: i * 0.12 });
        }
        break;
      case 'shake':
        this.noise(0.9, { type: 'bandpass', f: 3000, q: 0.6, vol: 0.18, attack: 0.1 });
        this.noise(0.2, { type: 'lowpass', f: 200, vol: 0.25, at: 0.05 });
        break;
      case 'thud': this.tone(150, 0.18, { f2: 60, vol: 0.3 }); this.noise(0.1, { type: 'lowpass', f: 500, vol: 0.2 }); break;
      case 'dig': for (let i = 0; i < 5; i++) { this.noise(0.12, { type: 'lowpass', f: 700, vol: 0.25, at: i * 0.4 }); this.tone(120, 0.1, { f2: 70, vol: 0.15, at: i * 0.4 }); } break;
      case 'treasure': this.notes(['G5', 'B5', 'D6', 'G6', 'B6', 'D7'], 0.07, 'triangle', 0.1, 0.5, 0.7); break;
      case 'cast': this.noise(0.35, { type: 'bandpass', f: 600, f2: 2500, q: 1.5, vol: 0.15 }); this.play('splash', 0.5); break;
      case 'splash': this.noise(0.5, { type: 'lowpass', f: 2500 * k, f2: 300, vol: 0.25 * k, at: k < 1 ? 0.5 : 0 }); break;
      case 'plop': this.tone(500, 0.12, { f2: 180, vol: 0.25 }); break;
      case 'reel': this.noise(0.03, { type: 'highpass', f: 4000, vol: 0.2 }); this.tone(1800, 0.03, { type: 'square', vol: 0.03 }); break;
      case 'paddle': this.noise(0.3, { type: 'bandpass', f: 900, f2: 400, q: 1.2, vol: 0.12 }); break;
      case 'sizzle': this.noise(1.2, { type: 'highpass', f: 3500, vol: 0.12, attack: 0.15 }); break;
      case 'buy': this.noise(0.06, { type: 'highpass', f: 5000, vol: 0.2 }); this.notes(['A6', 'E7'], 0.08, 'sine', 0.1, 0.4); break;
      case 'equip': this.notes(['C6', 'D6', 'E6', 'G6', 'A6', 'C7'], 0.035, 'sine', 0.07, 0.15, 0.4); break;
      case 'sleep': this.notes(['G5', 'E5', 'C5', 'G4'], 0.3, 'sine', 0.1, 0.6, 0.7); break;
      case 'surprise': this.tone(500, 0.15, { f2: 1200, type: 'triangle', vol: 0.12 }); break;
    }
  }

  /** 足音 */
  footstep(surface: Surface, vol: number) {
    if (!this.ready) return;
    const v = 0.12 * vol;
    if (surface === 'wood') { this.tone(260 + Math.random() * 40, 0.06, { vol: v * 0.8, type: 'triangle' }); this.noise(0.04, { type: 'bandpass', f: 1500, vol: v * 0.6 }); }
    else if (surface === 'dirt') this.noise(0.07, { type: 'lowpass', f: 700 + Math.random() * 300, vol: v * 1.2 });
    else this.noise(0.08, { type: 'bandpass', f: 2600 + Math.random() * 1500, q: 0.9, vol: v * 0.9 });
  }

  /** セリフに合わせた「もにょもにょ」声。pitch で人ごとに声の高さを変える */
  babble(text: string, pitch: number, vol = 1, shout = false) {
    if (!this.ready || vol <= 0.02) return;
    const c = this.ctx!;
    const n = Math.min(10, Math.max(2, Math.round(text.replace(/[\s…！？!?、。]/g, '').length / 2.2)));
    const t0 = c.currentTime;
    for (let i = 0; i < n; i++) {
      const t = t0 + i * (shout ? 0.07 : 0.085);
      const f = pitch * (0.85 + Math.random() * 0.35) * (i === n - 1 && /[？?]$/.test(text) ? 1.3 : 1);
      const o = c.createOscillator(); o.type = shout ? 'sawtooth' : 'triangle';
      o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * (0.9 + Math.random() * 0.2), t + 0.06);
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * (2 + Math.random() * 1.5); bp.Q.value = 2;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime((shout ? 0.1 : 0.07) * vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      o.connect(bp).connect(g).connect(this.sfx);
      const dry = c.createGain(); dry.gain.value = 0.35; o.connect(dry).connect(g);
      o.start(t); o.stop(t + 0.08);
    }
  }
}
