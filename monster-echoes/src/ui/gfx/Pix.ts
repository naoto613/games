// ドット絵をコードで描くための小さなバッファ（形を組み合わせ、影とふちどりを自動でつける）

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const hex2 = (h: string): [number, number, number] => {
  h = h.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const rgb2hex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
/** f<1 で暗く、f>1 で明るく */
export const shade = (h: string, f: number) => {
  const [r, g, b] = hex2(h);
  return f < 1 ? rgb2hex(r * f, g * f, b * f) : rgb2hex(r + (255 - r) * (f - 1), g + (255 - g) * (f - 1), b + (255 - b) * (f - 1));
};
export const mix = (a: string, b: string, t: number) => {
  const A = hex2(a), B = hex2(b);
  return rgb2hex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t));
};
const u32 = (h: string | null | undefined) => {
  if (!h) return 0;
  const [r, g, b] = hex2(h);
  return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
};

export type Shape = { bb: [number, number, number, number]; f: (x: number, y: number) => boolean };
export type PartOpts = { hi?: string; lo?: string; ol?: string; flat?: boolean; noOl?: boolean; lx?: number; ly?: number; hiT?: number; loT?: number; cel?: boolean };

const BAYER = [0, 0.5, 0.75, 0.25];
const SHADOW_TINT = '#2a1850';
const LIGHT_TINT = '#fff6dc';
/** 光の向き（左上・手前から） */
const L = (() => { const v = [-0.45, -0.65, 0.62]; const n = Math.hypot(...v); return v.map((x) => x / n); })();

/** 色から 5 段階の色を作る（影は寒色寄り、ハイライトは暖色寄り） */
export function ramp(col: string, o: { hi?: string; lo?: string } = {}) {
  return {
    deep: mix(o.lo ?? mix(col, SHADOW_TINT, 0.28), SHADOW_TINT, 0.3),
    lo: o.lo ?? mix(col, SHADOW_TINT, 0.28),
    base: col,
    hi: o.hi ?? mix(col, LIGHT_TINT, 0.32),
    top: mix(o.hi ?? mix(col, LIGHT_TINT, 0.32), '#ffffff', 0.5),
    ol: mix(col, '#140c20', 0.74),
  };
}

/**
 * ドット絵バッファ。座標は「論理ピクセル」で指定し、scale 倍の解像度で描く。
 * 形の塗りは高解像度で行うので、曲線がなめらかで陰影もこまかくなる。
 */
export class Pix {
  d: Uint32Array;
  W: number;
  H: number;
  /** true なら アニメ塗り（3色）が 標準 */
  cel = false;
  constructor(public w: number, public h: number, public scale = 1) {
    this.W = w * scale;
    this.H = h * scale;
    this.d = new Uint32Array(this.W * this.H);
  }
  /** 高解像度の 1 ピクセル */
  pxh(X: number, Y: number, c: string | number) {
    X |= 0;
    Y |= 0;
    if (X < 0 || Y < 0 || X >= this.W || Y >= this.H) return;
    this.d[Y * this.W + X] = typeof c === 'number' ? c : u32(c);
  }
  /** 論理ピクセル 1 つぶん（scale×scale のかたまり） */
  px(x: number, y: number, c: string | number) {
    const v = typeof c === 'number' ? c : u32(c);
    const s = this.scale, X = Math.floor(x) * s, Y = Math.floor(y) * s;
    for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) this.pxh(X + i, Y + j, v);
  }
  get(x: number, y: number) {
    const X = Math.floor(x * this.scale), Y = Math.floor(y * this.scale);
    if (X < 0 || Y < 0 || X >= this.W || Y >= this.H) return 0;
    return this.d[Y * this.W + X];
  }
  rect(x: number, y: number, w: number, h: number, c: string) {
    const v = u32(c), s = this.scale;
    for (let j = Math.round(y * s); j < Math.round((y + h) * s); j++) for (let i = Math.round(x * s); i < Math.round((x + w) * s); i++) this.pxh(i, j, v);
    return this;
  }
  hline(x0: number, x1: number, y: number, c: string) {
    this.line(x0, y, x1, y, c);
  }
  /** 線（高解像度で描くので 細い） */
  line(x0: number, y0: number, x1: number, y1: number, c: string, thick = 1) {
    const v = u32(c), s = this.scale;
    const X0 = (x0 + 0.5) * s, Y0 = (y0 + 0.5) * s, X1 = (x1 + 0.5) * s, Y1 = (y1 + 0.5) * s;
    const n = Math.max(Math.abs(X1 - X0), Math.abs(Y1 - Y0)) || 1;
    const t = Math.max(1, Math.round(thick * s * 0.5));
    for (let i = 0; i <= n; i++) {
      const X = Math.round(lerp(X0, X1, i / n) - t / 2), Y = Math.round(lerp(Y0, Y1, i / n) - t / 2);
      for (let a = 0; a < t; a++) for (let b = 0; b < t; b++) this.pxh(X + a, Y + b, v);
    }
  }
  /** 形を塗る（球面ライティングの 5 段階陰影＋ディザ＋ふちどり） */
  part(sh: Shape, col: string, o: PartOpts = {}) {
    const s = this.scale;
    const X0 = Math.floor(sh.bb[0] * s) - 1, Y0 = Math.floor(sh.bb[1] * s) - 1, X1 = Math.ceil(sh.bb[2] * s) + 1, Y1 = Math.ceil(sh.bb[3] * s) + 1;
    const W = X1 - X0 + 1, H = Y1 - Y0 + 1, m = new Uint8Array(W * H);
    for (let Y = Y0; Y <= Y1; Y++) for (let X = X0; X <= X1; X++) if (sh.f((X + 0.5) / s, (Y + 0.5) / s)) m[(Y - Y0) * W + (X - X0)] = 1;
    const at = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : m[y * W + x]);
    const cx = (sh.bb[0] + sh.bb[2]) / 2 + (o.lx ?? 0), cy = (sh.bb[1] + sh.bb[3]) / 2 + (o.ly ?? 0);
    const rx = Math.max(0.6, (sh.bb[2] - sh.bb[0]) / 2), ry = Math.max(0.6, (sh.bb[3] - sh.bb[1]) / 2);
    const r = ramp(col, o);
    const T = { deep: u32(r.deep), lo: u32(r.lo), base: u32(r.base), hi: u32(r.hi), top: u32(r.top) };
    const ol = u32(o.ol ?? r.ol);
    if (!o.noOl)
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          if (m[y * W + x]) continue;
          if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) this.pxh(x + X0, y + Y0, ol);
        }
    const small = rx * s < 3 || ry * s < 3;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        if (!m[y * W + x]) continue;
        const X = x + X0, Y = y + Y0;
        let c = T.base;
        if (!o.flat && !small) {
          const u = ((X + 0.5) / s - cx) / rx, v = ((Y + 0.5) / s - cy) / ry;
          const d2 = Math.min(1, u * u + v * v);
          const z = Math.sqrt(1 - d2);
          const nl = Math.hypot(u, v, z) || 1;
          let lit = (u * L[0] + v * L[1] + z * L[2]) / nl;
          if (o.cel ?? this.cel) {
            // アニメ塗り: ハイライト・ベース・影 の 3 色だけ（くっきり）
            c = lit > (o.hiT ?? 0.8) ? T.hi : lit < (o.loT ?? -0.05) ? T.lo : T.base;
            this.pxh(X, Y, c);
            continue;
          }
          lit += (BAYER[(X & 1) + (Y & 1) * 2] - 0.375) * 0.16; // ディザ
          const hiT = o.hiT ?? 0.55, loT = o.loT ?? -0.45;
          if (lit > hiT + 0.33) c = T.top;
          else if (lit > hiT) c = T.hi;
          else if (lit > loT + 0.3) c = T.base;
          else if (lit > loT - 0.25) c = T.lo;
          else c = T.deep;
          // ふちの 照り返し（右下）
          if (d2 > 0.7 && u + v > 0.9 && c === T.deep) c = T.lo;
        }
        this.pxh(X, Y, c);
      }
    return this;
  }
  fill(sh: Shape, col: string) {
    return this.part(sh, col, { flat: true, noOl: true });
  }
  /** つやのある目 */
  eye(x: number, y: number, r = 2, col = '#202028', o: { closed?: boolean; w?: number; noShine?: boolean } = {}) {
    if (o.closed) {
      this.line(x - r, y, x + r, y, col);
      return this;
    }
    const rx = r * (o.w ?? 0.8);
    this.part(E(x, y, rx, r), col, { flat: true, ol: '#1a1020' });
    // 下半分を すこし明るく（虹彩のグラデーション）
    this.part(Sub(E(x, y + r * 0.25, rx * 0.8, r * 0.7), R(x - r, y - r, r * 2, r * 0.9)), mix(col, '#9ad0ff', 0.35), { flat: true, noOl: true });
    if (!o.noShine) {
      this.part(E(x - rx * 0.35, y - r * 0.4, Math.max(0.5, r * 0.32), Math.max(0.5, r * 0.32)), '#ffffff', { flat: true, noOl: true });
      this.part(E(x + rx * 0.35, y + r * 0.35, Math.max(0.35, r * 0.15), Math.max(0.35, r * 0.15)), '#ffffff', { flat: true, noOl: true });
    }
    return this;
  }
  /** 外側に ふちどりを足す（全体のシルエットを強調） */
  outline(col = '#1a1420') {
    const v = u32(col), W = this.W, H = this.H;
    const src = this.d.slice();
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        if (src[y * W + x]) continue;
        const n = (xx: number, yy: number) => xx >= 0 && yy >= 0 && xx < W && yy < H && src[yy * W + xx];
        if (n(x - 1, y) || n(x + 1, y) || n(x, y - 1) || n(x, y + 1)) this.d[y * W + x] = v;
      }
    return this;
  }
  canvas(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = this.W;
    c.height = this.H;
    const g = c.getContext('2d')!;
    const id = g.createImageData(this.W, this.H);
    new Uint32Array(id.data.buffer).set(this.d);
    g.putImageData(id, 0, 0);
    return c;
  }
}

// ---- 形
export const E = (cx: number, cy: number, rx: number, ry = rx): Shape => ({
  bb: [cx - rx - 1, cy - ry - 1, cx + rx + 1, cy + ry + 1],
  f: (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1,
});
export const R = (x: number, y: number, w: number, h: number): Shape => ({ bb: [x, y, x + w, y + h], f: (px, py) => px >= x && px < x + w && py >= y && py < y + h });
export const RR = (x: number, y: number, w: number, h: number, r: number): Shape => ({
  bb: [x, y, x + w, y + h],
  f: (px, py) => {
    if (px < x || py < y || px > x + w || py > y + h) return false;
    const qx = Math.max(0, Math.max(x + r - px, px - (x + w - r))), qy = Math.max(0, Math.max(y + r - py, py - (y + h - r)));
    return qx * qx + qy * qy <= r * r;
  },
});
export const P = (...pts: number[]): Shape => {
  const xs = pts.filter((_, i) => i % 2 === 0), ys = pts.filter((_, i) => i % 2);
  const n = xs.length;
  return {
    bb: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
    f: (x, y) => {
      let c = false;
      for (let i = 0, j = n - 1; i < n; j = i++) if (ys[i] > y !== ys[j] > y && x < ((xs[j] - xs[i]) * (y - ys[i])) / (ys[j] - ys[i]) + xs[i]) c = !c;
      return c;
    },
  };
};
export const U = (...s: Shape[]): Shape => ({
  bb: [Math.min(...s.map((a) => a.bb[0])), Math.min(...s.map((a) => a.bb[1])), Math.max(...s.map((a) => a.bb[2])), Math.max(...s.map((a) => a.bb[3]))],
  f: (x, y) => s.some((a) => a.f(x, y)),
});
export const Sub = (a: Shape, b: Shape): Shape => ({ bb: a.bb, f: (x, y) => a.f(x, y) && !b.f(x, y) });

export function mkCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  return [c, g];
}
export function flipH(src: HTMLCanvasElement) {
  const [c, g] = mkCanvas(src.width, src.height);
  g.translate(src.width, 0);
  g.scale(-1, 1);
  g.drawImage(src, 0, 0);
  return c;
}
export function tint(src: HTMLCanvasElement, col: string, alpha = 1) {
  const [c, g] = mkCanvas(src.width, src.height);
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = alpha;
  g.fillStyle = col;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}
