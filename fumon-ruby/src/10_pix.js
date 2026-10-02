// ================================================================ pixel-art buffer helpers
const hex2 = h => { h = h.replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
const rgb2hex = (r, g, b) => '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
const shade = (h, f) => { const [r, g, b] = hex2(h); return f < 1 ? rgb2hex(r * f, g * f, b * f) : rgb2hex(r + (255 - r) * (f - 1), g + (255 - g) * (f - 1), b + (255 - b) * (f - 1)); };
const mixc = (a, b, t) => { const A = hex2(a), B = hex2(b); return rgb2hex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); };
const u32 = h => { if (!h) return 0; const [r, g, b] = hex2(h); return (255 << 24 | b << 16 | g << 8 | r) >>> 0; };

class Pix {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint32Array(w * h); }
  px(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d[y * this.w + x] = typeof c === 'number' ? c : u32(c); }
  get(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0; return this.d[y * this.w + x]; }
  rect(x, y, w, h, c) { const v = u32(c); for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.px(i, j, v); return this; }
  hline(x0, x1, y, c) { for (let x = x0; x <= x1; x++) this.px(x, y, c); }
  line(x0, y0, x1, y1, c) {
    const v = u32(c); const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (let i = 0; i <= n; i++) this.px(Math.round(lerp(x0, x1, i / n)), Math.round(lerp(y0, y1, i / n)), v);
  }
  // fill a shape with 3-tone shading and a dark outline
  part(sh, col, o = {}) {
    const [x0, y0, x1, y1] = sh.bb.map(Math.floor);
    const W_ = x1 - x0 + 3, H_ = y1 - y0 + 3, m = new Uint8Array(W_ * H_);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (sh.f(x + 0.5, y + 0.5)) m[(y - y0 + 1) * W_ + (x - x0 + 1)] = 1;
    const at = (x, y) => (x < 0 || y < 0 || x >= W_ || y >= H_) ? 0 : m[y * W_ + x];
    const cx = (sh.bb[0] + sh.bb[2]) / 2 + (o.lx || 0), cy = (sh.bb[1] + sh.bb[3]) / 2 + (o.ly || 0);
    const rx = Math.max(1, (sh.bb[2] - sh.bb[0]) / 2), ry = Math.max(1, (sh.bb[3] - sh.bb[1]) / 2);
    const base = u32(col), hi = u32(o.hi || shade(col, 1.35)), lo = u32(o.lo || shade(col, 0.72)), ol = u32(o.ol || shade(col, 0.38));
    if (!o.noOl) for (let y = 0; y < H_; y++) for (let x = 0; x < W_; x++) {
      if (m[y * W_ + x]) continue;
      if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) this.px(x + x0 - 1, y + y0 - 1, ol);
    }
    for (let y = 0; y < H_; y++) for (let x = 0; x < W_; x++) {
      if (!m[y * W_ + x]) continue;
      const X = x + x0 - 1, Y = y + y0 - 1;
      let c = base;
      if (!o.flat) {
        const u = (X + 0.5 - cx) / rx, v = (Y + 0.5 - cy) / ry, l = -(u * 0.55 + v * 0.85);
        if (l > (o.hiT ?? 0.55)) c = hi; else if (l < (o.loT ?? -0.45)) c = lo;
      }
      this.px(X, Y, c);
    }
    return this;
  }
  fill(sh, col) { return this.part(sh, col, { flat: true, noOl: true }); }
  eye(x, y, r = 2, col = '#202028', o = {}) {
    if (o.closed) { this.hline(x - r, x + r, y, col); return this; }
    this.part(E(x, y, r * (o.w || 0.8), r), col, { flat: true, ol: o.ol || '#202028', noOl: o.noOl });
    this.px(x - Math.max(0, Math.round(r * 0.4)), y - Math.max(1, Math.round(r * 0.5)), '#ffffff');
    if (r >= 3) this.px(x + 1, y + 1, shade(col, 2));
    return this;
  }
  canvas() {
    const c = document.createElement('canvas'); c.width = this.w; c.height = this.h;
    const g = c.getContext('2d'), id = g.createImageData(this.w, this.h);
    new Uint32Array(id.data.buffer).set(this.d); g.putImageData(id, 0, 0); return c;
  }
}
// ---- shapes
const E = (cx, cy, rx, ry = rx) => ({ bb: [cx - rx - 1, cy - ry - 1, cx + rx + 1, cy + ry + 1], f: (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1 });
const R = (x, y, w, h) => ({ bb: [x, y, x + w - 1, y + h - 1], f: (px, py) => px >= x && px < x + w && py >= y && py < y + h });
const RR = (x, y, w, h, r) => ({ bb: [x, y, x + w, y + h], f: (px, py) => { if (px < x || py < y || px > x + w || py > y + h) return false; const qx = Math.max(0, Math.max(x + r - px, px - (x + w - r))), qy = Math.max(0, Math.max(y + r - py, py - (y + h - r))); return qx * qx + qy * qy <= r * r; } });
const P = (...pts) => {
  const xs = pts.filter((_, i) => i % 2 === 0), ys = pts.filter((_, i) => i % 2);
  const n = xs.length;
  return {
    bb: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
    f: (x, y) => { let c = false; for (let i = 0, j = n - 1; i < n; j = i++) if ((ys[i] > y) !== (ys[j] > y) && x < (xs[j] - xs[i]) * (y - ys[i]) / (ys[j] - ys[i]) + xs[i]) c = !c; return c; },
  };
};
const U = (...s) => ({ bb: [Math.min(...s.map(a => a.bb[0])), Math.min(...s.map(a => a.bb[1])), Math.max(...s.map(a => a.bb[2])), Math.max(...s.map(a => a.bb[3]))], f: (x, y) => s.some(a => a.f(x, y)) });
const Sub = (a, b) => ({ bb: a.bb, f: (x, y) => a.f(x, y) && !b.f(x, y) });

// canvas helpers
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; }
function flipH(src) { const [c, g] = mkCanvas(src.width, src.height); g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0); return c; }
function tintC(src, col) { const [c, g] = mkCanvas(src.width, src.height); g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); return c; }
