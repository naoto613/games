// 当たり判定。見た目のメッシュとは独立した円・回転矩形・湖（距離関数）で管理する。
import { lakeSdf, onDock } from './Terrain';

export const MASK_PLAYER = 1;
export const MASK_NPC = 2;
export const MASK_ALL = 3;

export interface Collider {
  id: string;
  kind: 'circle' | 'box';
  x: number; z: number;
  r: number;            // circle の半径
  hw: number; hd: number; // box の半幅・半奥行き
  rot: number; cos: number; sin: number;
  mask: number;         // どの種類のキャラを止めるか
  sightH: number;       // 視線をさえぎる高さ（0 ならさえぎらない）
  enabled: boolean;
}

export interface V2 { x: number; z: number }

const CELL = 4;

export class CollisionSystem {
  colliders: Collider[] = [];
  private grid = new Map<number, Collider[]>();
  radius: number;

  constructor(radius: number) { this.radius = radius; }

  addCircle(id: string, x: number, z: number, r: number, mask = MASK_ALL, sightH = 0) {
    return this.insert({ id, kind: 'circle', x, z, r, hw: 0, hd: 0, rot: 0, cos: 1, sin: 0, mask, sightH, enabled: true });
  }
  addBox(id: string, x: number, z: number, w: number, d: number, rot = 0, mask = MASK_ALL, sightH = 0) {
    return this.insert({ id, kind: 'box', x, z, r: Math.hypot(w, d) / 2, hw: w / 2, hd: d / 2, rot, cos: Math.cos(rot), sin: Math.sin(rot), mask, sightH, enabled: true });
  }
  private insert(c: Collider) {
    this.colliders.push(c);
    const r = c.r;
    for (let gx = Math.floor((c.x - r) / CELL); gx <= Math.floor((c.x + r) / CELL); gx++)
      for (let gz = Math.floor((c.z - r) / CELL); gz <= Math.floor((c.z + r) / CELL); gz++) {
        const k = key(gx, gz);
        let a = this.grid.get(k);
        if (!a) this.grid.set(k, (a = []));
        a.push(c);
      }
    return c;
  }
  get(id: string) { return this.colliders.find((c) => c.id === id); }

  private near(x: number, z: number, r: number, out: Set<Collider>) {
    for (let gx = Math.floor((x - r) / CELL); gx <= Math.floor((x + r) / CELL); gx++)
      for (let gz = Math.floor((z - r) / CELL); gz <= Math.floor((z + r) / CELL); gz++) {
        const a = this.grid.get(key(gx, gz));
        if (a) for (const c of a) out.add(c);
      }
    return out;
  }

  /** 位置を押し出して返す（boat=true なら水の上だけ動ける） */
  resolve(p: V2, radius: number, mask: number, boat = false) {
    const set = this.near(p.x, p.z, radius + 1, new Set());
    for (let iter = 0; iter < 3; iter++) {
      let moved = false;
      for (const c of set) {
        if (!c.enabled || !(c.mask & mask)) continue;
        if (pushOut(c, p, radius)) moved = true;
      }
      // 湖
      if (!boat) {
        if (!onDock(p.x, p.z, 0.05)) {
          const d = lakeSdf(p.x, p.z);
          if (d < radius) {
            const g = grad(p.x, p.z);
            p.x += g.x * (radius - d); p.z += g.z * (radius - d);
            moved = true;
          }
        }
      } else {
        const d = lakeSdf(p.x, p.z);
        const need = -(radius + 0.2);
        if (d > need) {
          const g = grad(p.x, p.z);
          p.x -= g.x * (d - need); p.z -= g.z * (d - need);
          moved = true;
        }
        // 桟橋の杭
        if (onDock(p.x, p.z, radius)) {
          const dz = p.z - (-5.2);
          const lim = 1.7 / 2 + radius;
          p.z = -5.2 + Math.sign(dz || 1) * lim;
          moved = true;
        }
      }
      // 外周
      const r = Math.hypot(p.x, p.z);
      if (r > this.radius - radius) {
        const k = (this.radius - radius) / r;
        p.x *= k; p.z *= k;
      }
      if (!moved) break;
    }
    return p;
  }

  blocked(x: number, z: number, radius: number, mask: number) {
    const set = this.near(x, z, radius + 1, new Set());
    const p = { x, z };
    for (const c of set) {
      if (!c.enabled || !(c.mask & mask)) continue;
      if (overlap(c, p, radius)) return true;
    }
    if (!onDock(x, z, 0.05) && lakeSdf(x, z) < radius) return true;
    if (Math.hypot(x, z) > this.radius - radius) return true;
    return false;
  }

  /** 視線が通るか。高さ eyeH から targetH までの線分が、高さ sightH の遮蔽物を通るか調べる */
  lineOfSight(ax: number, az: number, eyeH: number, bx: number, bz: number, targetH: number, ignore?: Set<string>) {
    const len = Math.hypot(bx - ax, bz - az);
    const set = new Set<Collider>();
    const steps = Math.ceil(len / CELL) + 1;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.near(ax + (bx - ax) * t, az + (bz - az) * t, 1, set);
    }
    for (const c of set) {
      if (!c.enabled || c.sightH <= 0 || ignore?.has(c.id)) continue;
      const s = segHit(c, ax, az, bx, bz);
      if (s === null) continue;
      const h = eyeH + (targetH - eyeH) * s;
      if (h < c.sightH) return false;
    }
    return true;
  }
}

function key(gx: number, gz: number) { return (gx + 512) * 4096 + (gz + 512); }

function grad(x: number, z: number) {
  const e = 0.05;
  const gx = lakeSdf(x + e, z) - lakeSdf(x - e, z);
  const gz = lakeSdf(x, z + e) - lakeSdf(x, z - e);
  const l = Math.hypot(gx, gz) || 1;
  return { x: gx / l, z: gz / l };
}

function toLocal(c: Collider, x: number, z: number) {
  const dx = x - c.x, dz = z - c.z;
  return { lx: dx * c.cos - dz * c.sin, lz: dx * c.sin + dz * c.cos };
}
function toWorld(c: Collider, lx: number, lz: number) {
  return { x: c.x + lx * c.cos + lz * c.sin, z: c.z - lx * c.sin + lz * c.cos };
}

function overlap(c: Collider, p: V2, r: number) {
  if (c.kind === 'circle') return Math.hypot(p.x - c.x, p.z - c.z) < c.r + r;
  const { lx, lz } = toLocal(c, p.x, p.z);
  const cx = Math.max(-c.hw, Math.min(c.hw, lx)), cz = Math.max(-c.hd, Math.min(c.hd, lz));
  return Math.hypot(lx - cx, lz - cz) < r;
}

function pushOut(c: Collider, p: V2, r: number) {
  if (c.kind === 'circle') {
    const dx = p.x - c.x, dz = p.z - c.z;
    const d = Math.hypot(dx, dz);
    const min = c.r + r;
    if (d >= min) return false;
    if (d < 1e-5) { p.x += min; return true; }
    p.x = c.x + (dx / d) * min; p.z = c.z + (dz / d) * min;
    return true;
  }
  const { lx, lz } = toLocal(c, p.x, p.z);
  const cx = Math.max(-c.hw, Math.min(c.hw, lx)), cz = Math.max(-c.hd, Math.min(c.hd, lz));
  const dx = lx - cx, dz = lz - cz;
  const d = Math.hypot(dx, dz);
  if (d >= r) return false;
  let nx: number, nz: number;
  if (d > 1e-5) { nx = cx + (dx / d) * r; nz = cz + (dz / d) * r; }
  else {
    // 中に入り込んだ：最も近い辺へ
    const ex = c.hw - Math.abs(lx), ez = c.hd - Math.abs(lz);
    if (ex < ez) { nx = Math.sign(lx || 1) * (c.hw + r); nz = lz; } else { nx = lx; nz = Math.sign(lz || 1) * (c.hd + r); }
  }
  const w = toWorld(c, nx, nz);
  p.x = w.x; p.z = w.z;
  return true;
}

/** 線分と遮蔽物の最初の交点のパラメータ（0〜1）。当たらなければ null */
function segHit(c: Collider, ax: number, az: number, bx: number, bz: number): number | null {
  if (c.kind === 'circle') {
    const dx = bx - ax, dz = bz - az;
    const fx = ax - c.x, fz = az - c.z;
    const a = dx * dx + dz * dz, b = 2 * (fx * dx + fz * dz), cc = fx * fx + fz * fz - c.r * c.r;
    const disc = b * b - 4 * a * cc;
    if (disc < 0) return null;
    const sq = Math.sqrt(disc);
    const t1 = (-b - sq) / (2 * a), t2 = (-b + sq) / (2 * a);
    // 視線は下向きに進むので、遮蔽物を抜ける側（いちばん低い所）で判定する
    if (t2 < 0 || t1 > 1) return null;
    return Math.min(1, t2);
  }
  const A = toLocal(c, ax, az), B = toLocal(c, bx, bz);
  const dx = B.lx - A.lx, dz = B.lz - A.lz;
  let t0 = 0, t1 = 1;
  const clip = (p: number, q: number) => {
    if (Math.abs(p) < 1e-9) return q >= 0;
    const r = q / p;
    if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; }
    else { if (r < t0) return false; if (r < t1) t1 = r; }
    return true;
  };
  if (clip(-dx, A.lx + c.hw) && clip(dx, c.hw - A.lx) && clip(-dz, A.lz + c.hd) && clip(dz, c.hd - A.lz)) return t1;
  return null;
}
