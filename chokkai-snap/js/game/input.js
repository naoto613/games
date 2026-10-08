// タッチ入力（6.3/98 章）：Pointer Events だけを使う。
// 1本指ドラッグ=パン / 2本指=ピンチズーム＋パン / タップ=選択 / ダブルタップ=寄る / 長押し=名前表示
export const TAP_SLOP_PX = 8;
export const LONG_PRESS_MS = 500;
const DOUBLE_TAP_MS = 300;

export class TouchInput {
  constructor(el, handlers) {
    this.el = el;
    this.h = handlers; // { pan(dx,dy), pinch(cx,cy,factor), tap(x,y), doubleTap(x,y), longPress(x,y), release() , enabled() }
    this.pts = new Map();
    this.mode = 'none';
    this.lastTap = null;
    this.longTimer = null;
    this.vel = { x: 0, y: 0, t: 0 };
    this.opts = { longPress: true, doubleTap: true, sensitivity: 1 };
    el.addEventListener('pointerdown', e => this.down(e));
    el.addEventListener('pointermove', e => this.move(e));
    el.addEventListener('pointerup', e => this.up(e));
    el.addEventListener('pointercancel', e => this.up(e, true));
    el.addEventListener('contextmenu', e => e.preventDefault());
  }
  down(e) {
    e.preventDefault();
    try { this.el.setPointerCapture(e.pointerId); } catch { /* noop */ }
    this.pts.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY });
    this.vel = { x: 0, y: 0, t: performance.now() };
    this.inertia = null;
    if (this.pts.size === 1) {
      this.mode = 'tap';
      this.downAt = performance.now();
      clearTimeout(this.longTimer);
      if (this.opts.longPress) this.longTimer = setTimeout(() => { if (this.mode === 'tap') { this.mode = 'long'; this.h.longPress(e.clientX, e.clientY); } }, LONG_PRESS_MS);
    } else if (this.pts.size === 2) {
      clearTimeout(this.longTimer);
      this.mode = 'pinch';
      const [a, b] = [...this.pts.values()];
      this.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
    }
  }
  move(e) {
    const p = this.pts.get(e.pointerId);
    if (!p) return;
    e.preventDefault();
    const px = p.x, py = p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (this.mode === 'tap' && Math.hypot(p.x - p.sx, p.y - p.sy) > TAP_SLOP_PX) { this.mode = 'pan'; clearTimeout(this.longTimer); this.h.release?.(); }
    if (this.mode === 'pan') {
      const k = this.opts.sensitivity;
      const dx = (p.x - px) * k, dy = (p.y - py) * k;
      this.h.pan(dx, dy);
      const now = performance.now();
      const dt = Math.max(1, now - this.vel.t);
      this.vel = { x: 0.8 * this.vel.x + 0.2 * dx / dt, y: 0.8 * this.vel.y + 0.2 * dy / dt, t: now };
    } else if (this.mode === 'pinch' && this.pts.size >= 2) {
      const [a, b] = [...this.pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      this.h.pan((cx - this.pinch.cx) * this.opts.sensitivity, (cy - this.pinch.cy) * this.opts.sensitivity);
      if (this.pinch.d > 10) this.h.pinch(cx, cy, d / this.pinch.d);
      this.pinch = { d, cx, cy };
    }
  }
  up(e, cancel) {
    const p = this.pts.get(e.pointerId);
    this.pts.delete(e.pointerId);
    clearTimeout(this.longTimer);
    if (!p) return;
    if (this.mode === 'tap' && !cancel) {
      const now = performance.now();
      const isDouble = this.opts.doubleTap && this.lastTap && now - this.lastTap.t < DOUBLE_TAP_MS && Math.hypot(p.x - this.lastTap.x, p.y - this.lastTap.y) < 30;
      if (isDouble && this.lastTap.bg) { this.h.doubleTap(p.x, p.y); this.lastTap = null; }
      else {
        const consumed = this.h.tap(p.x, p.y);
        this.lastTap = { t: now, x: p.x, y: p.y, bg: !consumed };
      }
    }
    if (this.mode === 'pan' && this.pts.size === 0 && performance.now() - this.vel.t < 80) {
      this.inertia = { vx: this.vel.x * 16, vy: this.vel.y * 16 };
    }
    if (this.mode === 'long') this.h.release?.();
    if (this.pts.size === 0) this.mode = 'none';
    else if (this.pts.size === 1) { this.mode = 'pan'; }
  }
  // 慣性スクロール（毎フレーム）
  step(dt) {
    const i = this.inertia;
    if (!i) return;
    this.h.pan(i.vx * dt / 16, i.vy * dt / 16);
    const f = Math.pow(0.9, dt / 16);
    i.vx *= f; i.vy *= f;
    if (Math.abs(i.vx) + Math.abs(i.vy) < 0.3) this.inertia = null;
  }
}
