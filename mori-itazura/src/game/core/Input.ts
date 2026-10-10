// タッチ（画面のどこからでもドラッグで移動・タップで調べる）、ピンチでズーム、キーボード（PC 確認用）
export interface TapEvent { x: number; y: number }

export class Input {
  move = { x: 0, y: 0 };      // 画面上の方向（右 +x, 下 +y）、長さ 0〜1
  runHeld = false;
  taps: TapEvent[] = [];
  zoom = 1;
  enabled = true;
  private keys = new Set<string>();
  private pointers = new Map<number, { x: number; y: number; sx: number; sy: number; t: number; moved: boolean }>();
  private dragId: number | null = null;
  private pinchStart = 0;
  private zoomStart = 1;
  private ring: HTMLDivElement;
  private knob: HTMLDivElement;
  onKey: ((k: string) => void) | null = null;
  readonly radius = 64;

  constructor(private el: HTMLElement) {
    this.ring = document.createElement('div');
    this.ring.className = 'joy-ring';
    this.knob = document.createElement('div');
    this.knob.className = 'joy-knob';
    this.ring.appendChild(this.knob);
    document.body.appendChild(this.ring);
    el.addEventListener('pointerdown', this.down, { passive: false });
    window.addEventListener('pointermove', this.moveH, { passive: false });
    window.addEventListener('pointerup', this.up);
    window.addEventListener('pointercancel', this.up);
    window.addEventListener('keydown', this.kd);
    window.addEventListener('keyup', this.ku);
    window.addEventListener('blur', () => { this.keys.clear(); this.release(); });
    el.addEventListener('wheel', (e) => { this.zoom = clamp(this.zoom * (e.deltaY > 0 ? 1.08 : 0.93), 0.7, 1.45); e.preventDefault(); }, { passive: false });
  }

  private down = (e: PointerEvent) => {
    if (!this.enabled) return;
    e.preventDefault();
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: false });
    try { this.el.setPointerCapture(e.pointerId); } catch { /* */ }
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
      this.zoomStart = this.zoom;
      this.release();
    } else if (this.pointers.size === 1) this.dragId = e.pointerId;
  };

  private moveH = (e: PointerEvent) => {
    const p = this.pointers.get(e.pointerId);
    if (!p) return;
    p.x = e.clientX; p.y = e.clientY;
    if (this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.pinchStart > 0) this.zoom = clamp(this.zoomStart * (this.pinchStart / d), 0.7, 1.45);
      return;
    }
    if (e.pointerId !== this.dragId) return;
    const dx = p.x - p.sx, dy = p.y - p.sy;
    if (!p.moved && Math.hypot(dx, dy) > 12) {
      p.moved = true;
      this.ring.style.display = 'block';
      this.ring.style.left = p.sx + 'px';
      this.ring.style.top = p.sy + 'px';
    }
    if (p.moved) {
      const len = Math.hypot(dx, dy);
      const k = Math.min(1, len / this.radius);
      // 指が遠くへ行ったら原点を引きずる（どこまでも操作できる）
      if (len > this.radius * 1.5) {
        p.sx = p.x - (dx / len) * this.radius * 1.5;
        p.sy = p.y - (dy / len) * this.radius * 1.5;
        this.ring.style.left = p.sx + 'px';
        this.ring.style.top = p.sy + 'px';
      }
      this.move.x = (dx / (len || 1)) * k;
      this.move.y = (dy / (len || 1)) * k;
      this.runHeld = len > this.radius * 1.1;
      const kx = (dx / (len || 1)) * Math.min(len, this.radius), ky = (dy / (len || 1)) * Math.min(len, this.radius);
      this.knob.style.transform = `translate(${kx}px, ${ky}px)`;
      this.ring.classList.toggle('run', this.runHeld);
    }
  };

  private up = (e: PointerEvent) => {
    const p = this.pointers.get(e.pointerId);
    if (!p) return;
    this.pointers.delete(e.pointerId);
    if (e.pointerId === this.dragId) {
      if (!p.moved && performance.now() - p.t < 350 && this.pointers.size === 0 && this.enabled) this.taps.push({ x: p.x, y: p.y });
      this.release();
    }
    if (this.pointers.size < 2) this.pinchStart = 0;
  };

  private release() {
    this.dragId = null;
    this.move.x = 0; this.move.y = 0;
    this.runHeld = false;
    this.ring.style.display = 'none';
    this.knob.style.transform = '';
  }

  cancel() { this.pointers.clear(); this.release(); this.taps = []; }

  private kd = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
    this.keys.add(e.code);
    if (!e.repeat) this.onKey?.(e.code);
  };
  private ku = (e: KeyboardEvent) => { this.keys.delete(e.code); };

  /** キーボードとタッチをまとめた移動ベクトル */
  read() {
    let x = this.move.x, y = this.move.y, run = this.runHeld;
    const K = this.keys;
    const kx = (K.has('KeyD') || K.has('ArrowRight') ? 1 : 0) - (K.has('KeyA') || K.has('ArrowLeft') ? 1 : 0);
    const ky = (K.has('KeyS') || K.has('ArrowDown') ? 1 : 0) - (K.has('KeyW') || K.has('ArrowUp') ? 1 : 0);
    if (kx || ky) {
      const l = Math.hypot(kx, ky);
      x = kx / l; y = ky / l;
      run = K.has('ShiftLeft') || K.has('ShiftRight');
    }
    return { x, y, run, active: Math.hypot(x, y) > 0.08 };
  }
}

function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
