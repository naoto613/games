// requestAnimationFrame による独立したゲームループ（React の再描画とは切り離す）
export class GameLoop {
  private raf = 0;
  private last = 0;
  running = false;
  fps = 60;
  private acc = 0; private frames = 0;
  constructor(private step: (dt: number, now: number) => void) {}
  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const tick = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
      this.last = now;
      this.acc += dt; this.frames++;
      if (this.acc >= 1) { this.fps = this.frames / this.acc; this.acc = 0; this.frames = 0; }
      this.step(dt, now / 1000);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
  stop() { this.running = false; cancelAnimationFrame(this.raf); }
}
