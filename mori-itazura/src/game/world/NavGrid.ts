// NPC とタップ移動のための格子状の経路探索（A*）。
import { CollisionSystem } from './CollisionSystem';

export class NavGrid {
  readonly cell = 0.5;
  readonly min = -42;
  readonly size: number;
  private walk: Uint8Array;

  constructor(private col: CollisionSystem, private mask: number, private radius: number) {
    this.size = Math.ceil((-this.min * 2) / this.cell);
    this.walk = new Uint8Array(this.size * this.size);
    this.rebuild();
  }

  rebuild() {
    for (let j = 0; j < this.size; j++)
      for (let i = 0; i < this.size; i++) {
        const x = this.min + (i + 0.5) * this.cell, z = this.min + (j + 0.5) * this.cell;
        this.walk[j * this.size + i] = this.col.blocked(x, z, this.radius, this.mask) ? 0 : 1;
      }
  }

  toCell(x: number, z: number): [number, number] {
    return [Math.floor((x - this.min) / this.cell), Math.floor((z - this.min) / this.cell)];
  }
  ok(i: number, j: number) { return i >= 0 && j >= 0 && i < this.size && j < this.size && this.walk[j * this.size + i] === 1; }
  walkable(x: number, z: number) { const [i, j] = this.toCell(x, z); return this.ok(i, j); }

  private nearestOk(i: number, j: number): [number, number] | null {
    if (this.ok(i, j)) return [i, j];
    for (let r = 1; r < 12; r++)
      for (let dj = -r; dj <= r; dj++)
        for (let di = -r; di <= r; di++) {
          if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
          if (this.ok(i + di, j + dj)) return [i + di, j + dj];
        }
    return null;
  }

  /** 直線で行けるか（格子を細かくたどる） */
  straight(ax: number, az: number, bx: number, bz: number) {
    const d = Math.hypot(bx - ax, bz - az);
    const n = Math.ceil(d / (this.cell * 0.5));
    for (let k = 1; k <= n; k++) {
      const t = k / n;
      if (!this.walkable(ax + (bx - ax) * t, az + (bz - az) * t)) return false;
    }
    return true;
  }

  find(ax: number, az: number, bx: number, bz: number, maxNodes = 12000): { x: number; z: number }[] | null {
    if (this.straight(ax, az, bx, bz)) return [{ x: bx, z: bz }];
    const s0 = this.nearestOk(...this.toCell(ax, az));
    const g0 = this.nearestOk(...this.toCell(bx, bz));
    if (!s0 || !g0) return null;
    const N = this.size;
    const sIdx = s0[1] * N + s0[0], gIdx = g0[1] * N + g0[0];
    const gScore = new Map<number, number>();
    const came = new Map<number, number>();
    const heap = new Heap();
    const h = (i: number, j: number) => { const dx = Math.abs(i - g0[0]), dz = Math.abs(j - g0[1]); return Math.max(dx, dz) + 0.414 * Math.min(dx, dz); };
    gScore.set(sIdx, 0);
    heap.push(sIdx, h(s0[0], s0[1]));
    const closed = new Set<number>();
    let found = false;
    let count = 0;
    while (heap.size) {
      const cur = heap.pop();
      if (cur === gIdx) { found = true; break; }
      if (closed.has(cur)) continue;
      closed.add(cur);
      if (++count > maxNodes) break;
      const ci = cur % N, cj = (cur - ci) / N;
      const g = gScore.get(cur)!;
      for (let dj = -1; dj <= 1; dj++)
        for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue;
          const ni = ci + di, nj = cj + dj;
          if (!this.ok(ni, nj)) continue;
          if (di && dj && (!this.ok(ci + di, cj) || !this.ok(ci, cj + dj))) continue;
          const n = nj * N + ni;
          const ng = g + (di && dj ? 1.414 : 1);
          if (ng < (gScore.get(n) ?? Infinity)) {
            gScore.set(n, ng);
            came.set(n, cur);
            heap.push(n, ng + h(ni, nj));
          }
        }
    }
    if (!found) return null;
    const cells: number[] = [];
    for (let c: number | undefined = gIdx; c !== undefined && c !== sIdx; c = came.get(c)) cells.push(c);
    cells.reverse();
    const pts = cells.map((c) => ({ x: this.min + ((c % N) + 0.5) * this.cell, z: this.min + (Math.floor(c / N) + 0.5) * this.cell }));
    pts.push({ x: bx, z: bz });
    // 間引き（直線で行ける点は飛ばす）
    const out: { x: number; z: number }[] = [];
    let px = ax, pz = az, i = 0;
    while (i < pts.length) {
      let j = pts.length - 1;
      while (j > i && !this.straight(px, pz, pts[j].x, pts[j].z)) j--;
      out.push(pts[j]);
      px = pts[j].x; pz = pts[j].z;
      i = j + 1;
    }
    return out;
  }
}

class Heap {
  private k: number[] = [];
  private p: number[] = [];
  get size() { return this.k.length; }
  push(key: number, pri: number) {
    const k = this.k, p = this.p;
    k.push(key); p.push(pri);
    let i = k.length - 1;
    while (i > 0) {
      const par = (i - 1) >> 1;
      if (p[par] <= p[i]) break;
      [k[par], k[i]] = [k[i], k[par]]; [p[par], p[i]] = [p[i], p[par]];
      i = par;
    }
  }
  pop() {
    const k = this.k, p = this.p;
    const top = k[0];
    const lk = k.pop()!, lp = p.pop()!;
    if (k.length) {
      k[0] = lk; p[0] = lp;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let m = i;
        if (l < k.length && p[l] < p[m]) m = l;
        if (r < k.length && p[r] < p[m]) m = r;
        if (m === i) break;
        [k[m], k[i]] = [k[i], k[m]]; [p[m], p[i]] = [p[i], p[m]];
        i = m;
      }
    }
    return top;
  }
}
