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
  S.unlock = () => ac();
})();
