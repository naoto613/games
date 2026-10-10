// 音（39/40 章）：Web Audio で全部合成。原作音源は使わない。
// SE は priority / maxInstances で同時発音を制限。BGM はステージごとの簡単なループ。

const SOUNDS = {
  capture: { group: 'UI', priority: 5, maxInstances: 1 },
  send: { group: 'UI', priority: 4, maxInstances: 2 },
  success: { group: 'EVENT', priority: 6, maxInstances: 1 },
  surprise: { group: 'EVENT', priority: 4, maxInstances: 2 },
  laugh: { group: 'EVENT', priority: 3, maxInstances: 2 },
  hit: { group: 'EVENT', priority: 4, maxInstances: 2 },
  nothing: { group: 'UI', priority: 2, maxInstances: 1 },
  vehicle: { group: 'AMBIENT', priority: 2, maxInstances: 1 },
  tv: { group: 'EVENT', priority: 3, maxInstances: 1 },
  boom: { group: 'EVENT', priority: 8, maxInstances: 1 },
  splash: { group: 'EVENT', priority: 4, maxInstances: 2 },
  train: { group: 'AMBIENT', priority: 3, maxInstances: 1 },
  bell: { group: 'EVENT', priority: 3, maxInstances: 2 },
  whistle: { group: 'EVENT', priority: 3, maxInstances: 1 },
  roar: { group: 'EVENT', priority: 5, maxInstances: 1 },
  fanfare: { group: 'EVENT', priority: 9, maxInstances: 1 },
  thunder: { group: 'EVENT', priority: 7, maxInstances: 1 },
  pop: { group: 'UI', priority: 2, maxInstances: 3 },
  crash: { group: 'EVENT', priority: 6, maxInstances: 1 },
  timeout: { group: 'EVENT', priority: 9, maxInstances: 1 },
  hint: { group: 'UI', priority: 3, maxInstances: 1 },
};

export class Audio {
  constructor() {
    this.ctx = null; this.bgmGain = null; this.seGain = null;
    this.playing = new Map();
    this.bgmVol = 0.5; this.seVol = 0.8;
    this.bgmTimer = null; this.ducked = false;
  }
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination);
    this.bgmGain = this.ctx.createGain(); this.bgmGain.connect(this.master);
    this.seGain = this.ctx.createGain(); this.seGain.connect(this.master);
    this.applyVolumes();
  }
  setVolumes(bgm, se) { this.bgmVol = bgm; this.seVol = se; this.applyVolumes(); }
  applyVolumes() {
    if (!this.ctx) return;
    this.bgmGain.gain.value = this.bgmVol * 0.22 * (this.ducked ? 0.3 : 1);
    this.seGain.gain.value = this.seVol * 0.5;
  }
  duck(on) { this.ducked = on; this.applyVolumes(); }
  suspend() { this.ctx?.suspend(); }
  resume() { this.ctx?.resume(); }

  tone(freq, t, dur, { type = 'square', vol = 0.3, slide = 0, out } = {}) {
    const c = this.ctx;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out || this.seGain); o.start(t); o.stop(t + dur + 0.02);
  }
  noise(t, dur, { vol = 0.3, hp = 800, out } = {}) {
    const c = this.ctx;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    let seed = 12345;
    for (let i = 0; i < len; i++) { seed = (seed * 16807) % 2147483647; d[i] = (seed / 2147483647 * 2 - 1) * (1 - i / len); }
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
    const g = c.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(out || this.seGain); src.start(t);
  }

  play(id) {
    if (!this.ctx) return;
    const def = SOUNDS[id] || SOUNDS.pop;
    const now = this.ctx.currentTime;
    // 同時発音の制限
    const list = (this.playing.get(id) || []).filter(x => x > now);
    if (list.length >= def.maxInstances) return;
    const active = [...this.playing.values()].flat().filter(x => x > now).length;
    if (active > 6 && def.priority < 5) return;
    const t = now + 0.005;
    let len = 0.3;
    switch (id) {
      case 'capture': this.noise(t, 0.06, { vol: 0.4, hp: 3000 }); this.tone(1800, t + 0.04, 0.08, { type: 'square', vol: 0.15 }); len = 0.15; break;
      case 'send': this.tone(500, t, 0.25, { type: 'sine', vol: 0.25, slide: 3 }); len = 0.25; break;
      case 'success': [660, 830, 990, 1320].forEach((f, i) => this.tone(f, t + i * 0.07, 0.18, { type: 'triangle', vol: 0.25 })); len = 0.5; break;
      case 'surprise': this.tone(400, t, 0.2, { type: 'square', vol: 0.2, slide: 2.2 }); len = 0.2; break;
      case 'laugh': for (let i = 0; i < 4; i++) this.tone(700 - i * 40, t + i * 0.09, 0.07, { type: 'square', vol: 0.12 }); len = 0.4; break;
      case 'hit': this.noise(t, 0.12, { vol: 0.5, hp: 300 }); this.tone(150, t, 0.12, { type: 'sine', vol: 0.4, slide: 0.5 }); len = 0.15; break;
      case 'nothing': this.tone(300, t, 0.18, { type: 'triangle', vol: 0.2, slide: 0.7 }); len = 0.2; break;
      case 'vehicle': case 'train': this.noise(t, 1.2, { vol: 0.15, hp: 150 }); this.tone(110, t, 1.2, { type: 'sawtooth', vol: 0.06 }); if (id === 'train') { this.tone(880, t, 0.3, { type: 'square', vol: 0.1 }); this.tone(740, t + 0.3, 0.4, { type: 'square', vol: 0.1 }); } len = 1.2; break;
      case 'tv': this.noise(t, 0.3, { vol: 0.2, hp: 2000 }); this.tone(1000, t + 0.3, 0.2, { type: 'sine', vol: 0.1 }); len = 0.5; break;
      case 'boom': case 'crash': this.noise(t, 0.8, { vol: 0.7, hp: 60 }); this.tone(90, t, 0.7, { type: 'sine', vol: 0.5, slide: 0.4 }); len = 0.8; break;
      case 'splash': this.noise(t, 0.4, { vol: 0.35, hp: 1200 }); len = 0.4; break;
      case 'bell': [1320, 1760].forEach((f, i) => this.tone(f, t + i * 0.15, 0.6, { type: 'sine', vol: 0.2 })); len = 0.8; break;
      case 'whistle': this.tone(2200, t, 0.5, { type: 'sine', vol: 0.15, slide: 1.1 }); len = 0.5; break;
      case 'roar': this.noise(t, 0.6, { vol: 0.3, hp: 100 }); this.tone(120, t, 0.6, { type: 'sawtooth', vol: 0.2, slide: 0.7 }); len = 0.6; break;
      case 'thunder': this.noise(t, 1.4, { vol: 0.7, hp: 40 }); len = 1.4; break;
      case 'fanfare': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, t + i * 0.12, i === 5 ? 0.6 : 0.14, { type: 'square', vol: 0.16 })); len = 1.3; break;
      case 'timeout': [660, 520, 440, 330].forEach((f, i) => this.tone(f, t + i * 0.18, 0.25, { type: 'triangle', vol: 0.25 })); len = 0.9; break;
      case 'hint': this.tone(1200, t, 0.1, { type: 'sine', vol: 0.18 }); this.tone(1600, t + 0.1, 0.15, { type: 'sine', vol: 0.18 }); len = 0.3; break;
      default: this.tone(900, t, 0.08, { type: 'square', vol: 0.12 }); len = 0.1;
    }
    list.push(now + len);
    this.playing.set(id, list);
  }

  // ── BGM：コード進行＋ベース＋アルペジオ＋軽いハイハット ──
  startBgm(cfg = { tempo: 100, key: 0, mood: 'major' }) {
    this.stopBgm();
    if (!this.ctx) return;
    const beat = 60 / (cfg.tempo || 100) / 2;
    const root = 220 * Math.pow(2, (cfg.key || 0) / 12);
    const scales = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], swing: [0, 2, 4, 7, 9, 10, 11], calm: [0, 2, 4, 7, 9, 11, 12] };
    const sc = scales[cfg.mood] || scales.major;
    const prog = cfg.mood === 'minor' ? [0, 5, 3, 4] : [0, 5, 3, 4];
    const melodySeed = (cfg.key || 0) * 7 + (cfg.tempo || 100);
    let step = 0;
    let next = this.ctx.currentTime + 0.1;
    const note = deg => root * Math.pow(2, (sc[((deg % 7) + 7) % 7] + 12 * Math.floor(deg / 7)) / 12);
    const tick = () => {
      if (!this.ctx) return;
      while (next < this.ctx.currentTime + 0.25) {
        const bar = Math.floor(step / 8) % 4;
        const ch = prog[bar];
        const out = this.bgmGain;
        if (step % 8 === 0 || step % 8 === 4) this.tone(note(ch) / 2, next, beat * 3.5, { type: 'triangle', vol: 0.35, out });
        const arp = [0, 2, 4, 2][step % 4];
        this.tone(note(ch + arp) * 2, next, beat * 0.9, { type: 'square', vol: 0.06, out });
        const m = (melodySeed * (step + 3) * 2654435761 >>> 0) % 11;
        if (step % 2 === 0 && m < 7) this.tone(note(ch + [0, 2, 4, 5, 4, 2, 7][m]) * 4, next, beat * 1.6, { type: 'sine', vol: 0.09, out });
        if (step % 2 === 1) this.noise(next, 0.03, { vol: 0.08, hp: 6000, out });
        step++; next += beat * (cfg.mood === 'swing' && step % 2 ? 1.25 : cfg.mood === 'swing' ? 0.75 : 1);
      }
    };
    this.bgmTimer = setInterval(tick, 60);
    tick();
  }
  stopBgm() { if (this.bgmTimer) clearInterval(this.bgmTimer); this.bgmTimer = null; }
}
