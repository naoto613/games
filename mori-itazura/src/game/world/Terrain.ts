// 地形：高さ・湖・道の距離・地面の色。描画と当たり判定の両方から使う純粋関数。
import { CAMPSITE as L, P2 } from '../content/areas/campsite';

export const WATER_Y = -0.32;

function vnoise(x: number, z: number) {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return s - Math.floor(s);
}
function smooth(x: number, z: number) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = vnoise(ix, iz), b = vnoise(ix + 1, iz), c = vnoise(ix, iz + 1), d = vnoise(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
export function fbm(x: number, z: number) {
  return smooth(x, z) * 0.55 + smooth(x * 2.1 + 5, z * 2.1 + 3) * 0.3 + smooth(x * 4.3 + 9, z * 4.3 + 1) * 0.15;
}
const sstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** 湖の符号付き距離（負が水の中, おおよそメートル） */
export function lakeSdf(x: number, z: number) {
  const { c, rx, rz } = L.lake;
  const dx = (x - c[0]) / rx, dz = (z - c[1]) / rz;
  const ang = Math.atan2(dz, dx);
  const wob = 1 + Math.sin(ang * 3 + 0.7) * 0.05 + Math.sin(ang * 5 + 2.1) * 0.03;
  const r = Math.sqrt(dx * dx + dz * dz);
  let d = (r - wob) * Math.min(rx, rz);
  // 島
  const ix = x - L.island.c[0], iz = z - L.island.c[1];
  const di = L.island.r - Math.sqrt(ix * ix + iz * iz);
  d = Math.max(d, di);
  return d;
}

export function onDock(x: number, z: number, margin = 0) {
  const d = L.dock;
  return x <= d.x0 + margin && x >= d.x1 - margin && Math.abs(z - d.z) <= d.w / 2 + margin;
}

function segDist(px: number, pz: number, a: P2, b: P2) {
  const vx = b[0] - a[0], vz = b[1] - a[1];
  const wx = px - a[0], wz = pz - a[1];
  const t = Math.max(0, Math.min(1, (wx * vx + wz * vz) / (vx * vx + vz * vz)));
  const dx = wx - vx * t, dz = wz - vz * t;
  return Math.sqrt(dx * dx + dz * dz);
}

/** 最寄りの道の中心からの距離を道幅で割った値（<1 なら道の上） */
export function pathFactor(x: number, z: number) {
  let best = 99;
  for (const p of L.paths) {
    for (let i = 0; i < p.pts.length - 1; i++) {
      const d = segDist(x, z, p.pts[i], p.pts[i + 1]) / (p.w / 2);
      if (d < best) best = d;
    }
  }
  return best;
}

export function height(x: number, z: number) {
  const r = Math.sqrt(x * x + z * z);
  let h = (fbm(x * 0.09, z * 0.09) - 0.5) * 0.5;
  // 外周の丘（盆地のように囲む）
  h += sstep(36, 58, r) * (5 + fbm(x * 0.05 + 3, z * 0.05) * 7);
  // 北東の小さな丘
  const hx = x - 26, hz = z + 2;
  h += Math.max(0, 1 - Math.sqrt(hx * hx + hz * hz) / 9) ** 2 * 1.6;
  // 湖
  const ls = lakeSdf(x, z);
  if (ls < 2.5) {
    const t = sstep(2.5, -3.5, ls);
    h = h * (1 - t) + (-1.4) * t;
    if (ls > -0.6) h = Math.min(h, WATER_Y + 0.12 + Math.max(0, ls) * 0.12);
  }
  // 平らにする場所（道・建物）
  const pf = pathFactor(x, z);
  if (pf < 1.6) h *= 0.35 + 0.65 * sstep(0.8, 1.6, pf);
  return h;
}

/** 平坦化された建物まわりは高さを小さく抑える */
export function groundY(x: number, z: number) {
  if (onDock(x, z)) return 0.42;
  return height(x, z);
}

const C = {
  grassA: [0.36, 0.56, 0.2], grassB: [0.55, 0.7, 0.26], grassC: [0.28, 0.46, 0.17],
  dirt: [0.74, 0.53, 0.32], dirtDark: [0.6, 0.41, 0.25], sand: [0.88, 0.76, 0.52], mud: [0.45, 0.4, 0.28],
  hill: [0.3, 0.45, 0.2],
};
const mix = (a: number[], b: number[], t: number) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** 地面の色（線形色空間の RGB） */
export function groundColor(x: number, z: number, shade: (x: number, z: number) => number): number[] {
  const n = fbm(x * 0.15, z * 0.15);
  const n2 = fbm(x * 0.6 + 11, z * 0.6 + 7);
  let c = mix(C.grassC, C.grassA, sstep(0.25, 0.55, n));
  c = mix(c, C.grassB, sstep(0.55, 0.85, n2) * 0.55);
  // キャンプファイヤー広場・駐車場・店の前などの土
  const plazas: [P2, number][] = [[L.campfire.pos, 5.2], [[L.picnic.table1.pos[0] + 0.5, L.picnic.table1.pos[1]], 3.4], [[5.3, 22], 2.4], [[17, -7.2], 2.2], [[-27.8, 23.6], 2.6], [[0, 34.5], 3.2]];
  let dirt = 0;
  for (const [p, r] of plazas) {
    const d = Math.hypot(x - p[0], z - p[1]) / r + (n2 - 0.5) * 0.35;
    dirt = Math.max(dirt, 1 - sstep(0.75, 1.05, d));
  }
  const pk = L.parking;
  if (x > pk.min[0] && x < pk.max[0] && z > pk.min[1] && z < pk.max[1]) dirt = Math.max(dirt, 0.92);
  const pf = pathFactor(x, z) + (n2 - 0.5) * 0.3;
  dirt = Math.max(dirt, 1 - sstep(0.7, 1.05, pf));
  const dirtCol = mix(C.dirt, C.dirtDark, sstep(0.3, 0.7, n2) * 0.6 + (1 - sstep(0.4, 0.95, pf)) * 0.15);
  c = mix(c, dirtCol, dirt);
  // 湖のほとり（砂）
  const ls = lakeSdf(x, z);
  if (ls < 2.2) c = mix(c, C.sand, sstep(2.2, 0.6, ls));
  if (ls < 0) c = mix(c, C.mud, sstep(0, -2, ls));
  // 外周の丘は少し暗く
  const r = Math.hypot(x, z);
  c = mix(c, C.hill, sstep(40, 55, r) * 0.6);
  const s = shade(x, z);
  return [c[0] * s, c[1] * s, c[2] * s];
}
