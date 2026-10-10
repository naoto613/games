// 背景の小物・建物。すべてローカル座標（足元が y=0）で作り、World 側で配置・結合する。
import * as THREE from 'three';
import { GeoBuilder, foliage, gradient, rand, ColorFn } from './Geo';

export const PAL = {
  wood: '#b27a45', woodDark: '#7f5230', woodLight: '#d39a5c', bark: '#6b4a32', barkDark: '#4f3524',
  leafDark: '#2f5e26', leafLight: '#8fc04a', pineDark: '#1f4a2e', pineLight: '#5e9446',
  rock: '#8d877b', rockLight: '#c2baa9', moss: '#6f8f3a', canvas: '#efe2bd', orange: '#e79a35', red: '#d24a3a',
  roof: '#9b4a35', roofDark: '#7a3527', metal: '#56615d', green: '#3e6e4c', cream: '#f4e7c8', teal: '#2f9c8f',
};

const C = (h: string) => new THREE.Color(h);

function stripes(a: string, b: string, axis: 'x' | 'y' | 'z', freq: number, noise = 0.05): ColorFn {
  const ca = C(a), cb = C(b), out = new THREE.Color();
  return (p) => {
    const v = axis === 'x' ? p.x : axis === 'y' ? p.y : p.z;
    const f = Math.floor(v * freq) % 2 === 0;
    out.copy(f ? ca : cb);
    const h = (Math.sin(p.x * 31.1 + p.y * 17.3 + p.z * 23.7) * 0.5) * noise;
    out.r += h; out.g += h; out.b += h * 0.6;
    return out;
  };
}
function checker(a: string, b: string, size: number): ColorFn {
  const ca = C(a), cb = C(b);
  return (p) => ((Math.floor(p.x / size) + Math.floor(p.z / size)) & 1 ? ca : cb);
}
function woodGrain(base: string, k = 0.12): ColorFn {
  const c0 = C(base), out = new THREE.Color();
  return (p) => {
    const g = Math.sin(p.x * 9 + Math.sin(p.z * 3) * 2) * 0.5 + Math.sin(p.y * 40 + p.x * 3) * 0.5;
    out.copy(c0).multiplyScalar(1 + g * k * 0.5);
    return out;
  };
}

// ───────── 植物・岩 ─────────
export function broadTree(seed: number, s = 1, apples = false) {
  const r = rand(seed);
  const b = new GeoBuilder({ ao: 0.35, aoHeight: 1.2 });
  const th = (2.0 + r() * 0.6) * s;
  b.cyl(0.16 * s, 0.26 * s, th, gradient(PAL.barkDark, PAL.bark, 0, th), { pos: [0, th / 2, 0], jitter: 0.08, seed }, 9);
  // 根元の張り出し
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + r();
    b.cone(0.13 * s, 0.5 * s, PAL.barkDark, { pos: [Math.cos(a) * 0.18 * s, 0.15 * s, Math.sin(a) * 0.18 * s], rot: [Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1] }, 6);
  }
  // 枝
  for (let i = 0; i < 3; i++) {
    const a = r() * Math.PI * 2;
    b.cyl(0.05 * s, 0.09 * s, 1.0 * s, PAL.bark, { pos: [Math.cos(a) * 0.3 * s, th * 0.85, Math.sin(a) * 0.3 * s], rot: [Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9] }, 6);
  }
  const cy = th + 1.05 * s;
  const leaf = foliage(PAL.leafDark, PAL.leafLight, th - 0.4 * s, th + 2.6 * s, seed);
  b.ico(1.45 * s, leaf, { pos: [0, cy, 0], sway: 0.35, jitter: 0.18, seed }, 2);
  const n = 5 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.5;
    const rr = (0.75 + r() * 0.35) * s;
    const d = (1.0 + r() * 0.35) * s;
    b.ico(rr, leaf, { pos: [Math.cos(a) * d, cy - 0.35 * s + r() * 0.7 * s, Math.sin(a) * d], sway: 0.35, jitter: 0.2, seed: seed + i * 7 }, 2);
  }
  b.ico(0.95 * s, leaf, { pos: [r() * 0.4 - 0.2, cy + 0.95 * s, r() * 0.4 - 0.2], sway: 0.4, jitter: 0.2, seed: seed + 99 }, 2);
  if (apples) {
    for (let i = 0; i < 9; i++) {
      const a = r() * Math.PI * 2, el = r() * 0.9 - 0.2;
      const R = 1.55 * s;
      b.sphere(0.1, '#d8332b', { pos: [Math.cos(a) * R * Math.cos(el), cy + Math.sin(el) * R, Math.sin(a) * R * Math.cos(el)], sway: 0.35 }, 10, 8);
    }
  }
  return b;
}

export function pineTree(seed: number, s = 1, lod = 0) {
  const r = rand(seed);
  const b = new GeoBuilder({ ao: 0.3, aoHeight: 1.0 });
  const th = 1.0 * s;
  b.cyl(0.12 * s, 0.2 * s, th + 0.4, PAL.barkDark, { pos: [0, (th + 0.4) / 2, 0] }, lod ? 6 : 8);
  const layers = 4;
  const leaf = foliage(PAL.pineDark, PAL.pineLight, th, th + 5 * s, seed);
  for (let i = 0; i < layers; i++) {
    const k = i / (layers - 1);
    const rad = (1.65 - k * 1.05) * s * (0.92 + r() * 0.16);
    const h = (1.55 - k * 0.35) * s;
    const y = th + i * 0.95 * s + h / 2;
    b.cone(rad, h, leaf, { pos: [0, y, 0], rot: [0, r() * 3, 0], sway: 0.25, jitter: lod ? 0 : 0.1, seed: seed + i }, lod ? 7 : 10);
  }
  return b;
}

export function bush(seed: number, s = 1, flowers?: string) {
  const r = rand(seed);
  const b = new GeoBuilder({ ao: 0.45, aoHeight: 0.8 });
  const leaf = foliage('#2c5a22', '#7fb646', 0, 1.1 * s, seed);
  const n = 4 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r();
    const d = (0.25 + r() * 0.3) * s;
    const rr = (0.42 + r() * 0.2) * s;
    b.ico(rr, leaf, { pos: [Math.cos(a) * d, rr * 0.8, Math.sin(a) * d], sway: 0.25, jitter: 0.22, seed: seed + i }, 1);
  }
  b.ico(0.55 * s, leaf, { pos: [0, 0.6 * s, 0], sway: 0.3, jitter: 0.2, seed: seed + 50 }, 1);
  if (flowers) {
    for (let i = 0; i < 9; i++) {
      const a = r() * Math.PI * 2, el = 0.2 + r() * 0.9;
      const R = 0.62 * s;
      b.sphere(0.055, flowers, { pos: [Math.cos(a) * R * Math.cos(el), 0.45 * s + Math.sin(el) * R * 0.8, Math.sin(a) * R * Math.cos(el)], sway: 0.25 }, 6, 5);
    }
  }
  return b;
}

export function rock(seed: number, s = 1) {
  const r = rand(seed);
  const b = new GeoBuilder({ ao: 0.4, aoHeight: 0.5 });
  const base = gradient(PAL.rock, PAL.rockLight, 0, 1.0 * s, 0.1, seed);
  const moss = C(PAL.moss);
  const col: ColorFn = (p, n) => {
    const c = base(p, n);
    if (n.y > 0.55) c.lerp(moss, Math.min(1, (n.y - 0.55) * 2.5) * 0.7);
    return c;
  };
  b.ico(0.6 * s, col, { pos: [0, 0.28 * s, 0], scale: [1.2, 0.75, 1], rot: [0, r() * 6, 0], jitter: 0.45, seed }, 1);
  if (r() > 0.4) b.ico(0.32 * s, col, { pos: [0.55 * s, 0.12 * s, 0.25 * s], scale: [1.1, 0.7, 1], jitter: 0.4, seed: seed + 3 }, 1);
  return b;
}

export function stump(seed: number) {
  const b = new GeoBuilder({ ao: 0.3, aoHeight: 0.4 });
  b.cyl(0.32, 0.4, 0.42, PAL.bark, { pos: [0, 0.21, 0], jitter: 0.1, seed }, 12);
  b.cyl(0.3, 0.3, 0.02, '#d9b58a', { pos: [0, 0.425, 0] }, 12);
  b.torus(0.16, 0.012, '#b78e62', { pos: [0, 0.437, 0], rot: [Math.PI / 2, 0, 0] }, Math.PI * 2, 4, 16);
  return b;
}

export function reeds(seed: number) {
  const r = rand(seed);
  const b = new GeoBuilder({ ao: 0.2 });
  for (let i = 0; i < 7; i++) {
    const x = (r() - 0.5) * 0.7, z = (r() - 0.5) * 0.7, h = 0.8 + r() * 0.6;
    b.cyl(0.012, 0.02, h, '#6f9a3c', { pos: [x, h / 2, z], rot: [(r() - 0.5) * 0.2, 0, (r() - 0.5) * 0.2], sway: 0.6 }, 4);
    if (r() > 0.4) b.capsule(0.03, 0.12, '#7a4a2a', { pos: [x, h + 0.02, z], sway: 0.6 }, 6);
  }
  return b;
}

// ───────── 家具・小物 ─────────
export function picnicTable(cloth = false) {
  const b = new GeoBuilder({ ao: 0.35, aoHeight: 0.6 });
  const w = PAL.wood;
  for (let i = -1; i <= 1; i++) b.box(2.1, 0.07, 0.26, woodGrain(i === 0 ? '#bb8450' : w), { pos: [0, 0.74, i * 0.275] }, 0.025);
  for (const z of [-0.68, 0.68]) for (let i = 0; i < 2; i++) b.box(2.1, 0.06, 0.15, woodGrain(w), { pos: [0, 0.44, z + (i - 0.5) * 0.16] }, 0.02);
  for (const x of [-0.75, 0.75]) {
    for (const s of [-1, 1]) b.box(0.08, 0.95, 0.08, PAL.woodDark, { pos: [x, 0.38, s * 0.42], rot: [s * 0.62, 0, 0] }, 0.02);
    b.box(0.08, 0.07, 1.55, PAL.woodDark, { pos: [x, 0.38, 0] }, 0.02);
    b.box(0.08, 0.06, 0.7, PAL.woodDark, { pos: [x, 0.69, 0] }, 0.02);
  }
  if (cloth) {
    b.box(1.5, 0.012, 0.92, checker('#d8453b', '#f7efe2', 0.16), { pos: [0, 0.782, 0] }, 0.004);
    b.box(1.5, 0.16, 0.012, checker('#d8453b', '#f7efe2', 0.16), { pos: [0, 0.71, 0.46] }, 0.004);
    b.box(1.5, 0.16, 0.012, checker('#d8453b', '#f7efe2', 0.16), { pos: [0, 0.71, -0.46] }, 0.004);
  }
  return b;
}

export function bench() {
  const b = new GeoBuilder({ ao: 0.35, aoHeight: 0.5 });
  for (let i = 0; i < 3; i++) b.box(1.7, 0.05, 0.13, woodGrain(PAL.wood), { pos: [0, 0.45, -0.15 + i * 0.15] }, 0.02);
  for (let i = 0; i < 2; i++) b.box(1.7, 0.12, 0.04, woodGrain(PAL.wood), { pos: [0, 0.68 + i * 0.17, -0.27], rot: [-0.18, 0, 0] }, 0.015);
  for (const x of [-0.7, 0.7]) {
    b.box(0.07, 0.45, 0.07, '#4a4f4c', { pos: [x, 0.22, 0.12] }, 0.015);
    b.box(0.07, 0.95, 0.07, '#4a4f4c', { pos: [x, 0.47, -0.25], rot: [-0.12, 0, 0] }, 0.015);
    b.box(0.06, 0.05, 0.5, '#4a4f4c', { pos: [x, 0.42, -0.06] }, 0.015);
  }
  return b;
}

export function trashCan() {
  const b = new GeoBuilder({ ao: 0.3, aoHeight: 0.5 });
  b.cyl(0.3, 0.27, 0.85, stripes('#3f7553', '#376a4a', 'y', 6), { pos: [0, 0.425, 0] }, 18);
  b.torus(0.3, 0.025, '#2d5139', { pos: [0, 0.85, 0], rot: [Math.PI / 2, 0, 0] }, Math.PI * 2, 6, 20);
  b.cyl(0.33, 0.33, 0.06, '#2d5139', { pos: [0, 0.9, 0] }, 18);
  b.sphere(1, '#2d5139', { pos: [0, 0.93, 0], scale: [0.32, 0.1, 0.32] }, 18, 8);
  b.box(0.2, 0.2, 0.02, '#e9e3d0', { pos: [0, 0.5, 0.29] }, 0.01);
  return b;
}

export function lampPost() {
  const b = new GeoBuilder({ ao: 0.2, aoHeight: 0.5 });
  b.cyl(0.05, 0.07, 2.6, '#33473c', { pos: [0, 1.3, 0] }, 10);
  b.cyl(0.14, 0.16, 0.18, '#33473c', { pos: [0, 0.09, 0] }, 12);
  b.cyl(0.18, 0.08, 0.12, '#33473c', { pos: [0, 2.95, 0] }, 8);
  b.cone(0.22, 0.18, '#33473c', { pos: [0, 3.06, 0] }, 8);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.box(0.025, 0.36, 0.025, '#33473c', { pos: [Math.cos(a) * 0.12, 2.75, Math.sin(a) * 0.12] }, 0.005);
  }
  b.cyl(0.13, 0.11, 0.05, '#33473c', { pos: [0, 2.57, 0] }, 8);
  return b;
}
export function lampGlow() {
  const b = new GeoBuilder();
  b.cyl(0.11, 0.1, 0.32, '#ffd98a', { pos: [0, 2.76, 0] }, 8);
  return b;
}

export function signboard() {
  const b = new GeoBuilder({ ao: 0.3, aoHeight: 0.5 });
  for (const x of [-0.65, 0.65]) b.cyl(0.07, 0.08, 1.7, PAL.bark, { pos: [x, 0.85, 0] }, 8);
  b.box(1.6, 1.0, 0.08, PAL.woodDark, { pos: [0, 1.15, 0] }, 0.03);
  b.box(1.8, 0.1, 0.25, PAL.roof, { pos: [0, 1.72, 0], rot: [0, 0, 0] }, 0.03);
  return b;
}

export function fenceSegment(len: number) {
  const b = new GeoBuilder({ ao: 0.3, aoHeight: 0.4 });
  const n = Math.max(1, Math.round(len / 1.6));
  for (let i = 0; i <= n; i++) b.box(0.12, 0.85, 0.12, PAL.woodDark, { pos: [-len / 2 + (i / n) * len, 0.42, 0] }, 0.03);
  for (const y of [0.35, 0.65]) b.box(len, 0.08, 0.06, woodGrain(PAL.wood), { pos: [0, y, 0.06] }, 0.02);
  return b;
}

export function cooler() {
  const b = new GeoBuilder({ ao: 0.25, aoHeight: 0.4 });
  b.box(0.62, 0.38, 0.4, '#3d8fd1', { pos: [0, 0.19, 0] }, 0.05);
  b.box(0.64, 0.08, 0.42, '#f2f2ee', { pos: [0, 0.41, 0] }, 0.035);
  b.box(0.3, 0.04, 0.04, '#f2f2ee', { pos: [0, 0.47, 0] }, 0.015);
  return b;
}

export function parasol() {
  const b = new GeoBuilder({ ao: 0.2 });
  b.cyl(0.025, 0.025, 2.3, '#e8e2d2', { pos: [0, 1.15, 0] }, 6);
  const fan: ColorFn = (p) => C(Math.floor(((Math.atan2(p.z, p.x) + Math.PI) / (Math.PI * 2)) * 8) % 2 ? '#f0b43c' : '#fbf3df');
  b.cone(1.25, 0.45, fan, { pos: [0, 2.3, 0], sway: 0.05 }, 16);
  b.sphere(0.05, '#e8e2d2', { pos: [0, 2.55, 0] });
  b.cyl(0.18, 0.2, 0.08, '#c9c2b0', { pos: [0, 0.04, 0] }, 10);
  return b;
}

export function blanket() {
  const b = new GeoBuilder();
  b.box(2.2, 0.03, 1.6, checker('#3d77c4', '#f5f1e6', 0.27), { pos: [0, 0.03, 0] }, 0.01);
  b.cyl(0.18, 0.15, 0.03, '#ffffff', { pos: [0.5, 0.06, 0.3] }, 16);
  b.cyl(0.04, 0.035, 0.12, '#e8d1a5', { pos: [-0.6, 0.1, -0.4] }, 8);
  b.cyl(0.04, 0.035, 0.12, '#bfe0f0', { pos: [-0.45, 0.1, -0.5] }, 8);
  return b;
}

export function crate(seed = 1) {
  const b = new GeoBuilder({ ao: 0.3, aoHeight: 0.5 });
  b.box(0.6, 0.5, 0.5, woodGrain('#c08a52', 0.2), { pos: [0, 0.25, 0] }, 0.03);
  b.box(0.62, 0.06, 0.52, PAL.woodDark, { pos: [0, 0.48, 0] }, 0.02);
  b.box(0.62, 0.06, 0.52, PAL.woodDark, { pos: [0, 0.03, 0] }, 0.02);
  return b;
}

export function barrel() {
  const b = new GeoBuilder({ ao: 0.3, aoHeight: 0.5 });
  b.lathe([[0, 0], [0.26, 0], [0.31, 0.2], [0.31, 0.45], [0.26, 0.7], [0, 0.7]], stripes('#a46a3c', '#93603a', 'x', 14), {}, 18);
  for (const y of [0.1, 0.6]) b.torus(0.28, 0.018, '#4f4f4f', { pos: [0, y, 0], rot: [Math.PI / 2, 0, 0] }, Math.PI * 2, 5, 20);
  return b;
}

export function firewood() {
  const b = new GeoBuilder({ ao: 0.3, aoHeight: 0.6 });
  for (let row = 0; row < 3; row++)
    for (let i = 0; i < 4 - row; i++) {
      b.cyl(0.09, 0.09, 0.8, PAL.bark, { pos: [-0.27 + i * 0.18 + row * 0.09, 0.09 + row * 0.16, 0], rot: [Math.PI / 2, 0, 0] }, 8);
      b.cyl(0.08, 0.08, 0.81, '#d8b384', { pos: [-0.27 + i * 0.18 + row * 0.09, 0.09 + row * 0.16, 0], rot: [Math.PI / 2, 0, 0] }, 8, false);
    }
  return b;
}

export function flowerPot(color: string) {
  const b = new GeoBuilder({ ao: 0.2 });
  b.cyl(0.18, 0.14, 0.25, '#c06a43', { pos: [0, 0.125, 0] }, 12);
  for (let i = 0; i < 5; i++) b.sphere(0.07, color, { pos: [Math.cos(i * 1.3) * 0.09, 0.32 + (i % 2) * 0.05, Math.sin(i * 1.3) * 0.09] }, 6, 5);
  b.ico(0.14, '#4e8a35', { pos: [0, 0.26, 0] }, 1);
  return b;
}

// ───────── テント ─────────
export function cabinTent() {
  const b = new GeoBuilder({ ao: 0.3, aoHeight: 0.6 });
  const W = 2.4, D = 2.8, H = 1.9;
  const slope = Math.atan2(H, W / 2);
  const len = Math.hypot(H, W / 2);
  for (const s of [-1, 1]) {
    b.box(len, 0.04, D, stripes(PAL.canvas, '#e8d8ae', 'z', 2.5, 0.02), { pos: [s * W / 4, H / 2, 0], rot: [0, 0, -s * slope] }, 0.015);
    b.box(len * 0.55, 0.045, D + 0.02, PAL.orange, { pos: [s * (W / 2 - len * 0.27 * Math.cos(slope)), (len * 0.27) * Math.sin(slope), 0], rot: [0, 0, -s * slope] }, 0.015);
  }
  // 前後の三角
  for (const z of [-D / 2, D / 2]) b.slab([[-W / 2, 0], [W / 2, 0], [0, H]], 0.04, z > 0 ? '#f3e7c6' : PAL.canvas, { pos: [0, 0, z] });
  b.slab([[-0.45, 0], [0.45, 0], [0, 1.15]], 0.02, '#4a2c1c', { pos: [0, 0.01, D / 2 + 0.03] });
  // 入口のひさし
  b.box(1.6, 0.03, 0.9, PAL.canvas, { pos: [0, H - 0.25, D / 2 + 0.4], rot: [0.25, 0, 0] }, 0.01);
  for (const x of [-0.75, 0.75]) b.cyl(0.025, 0.025, 1.7, PAL.woodDark, { pos: [x, 0.85, D / 2 + 0.82] }, 6);
  b.cyl(0.03, 0.03, D + 0.4, PAL.woodDark, { pos: [0, H + 0.02, 0], rot: [Math.PI / 2, 0, 0] }, 6);
  return b;
}

export function domeTent(color = '#d9483b') {
  const b = new GeoBuilder({ ao: 0.3, aoHeight: 0.5 });
  b.sphere(1, color, { pos: [0, 0, 0], scale: [1.4, 1.25, 1.2] }, 24, 14);
  b.sphere(1, '#f1d27a', { pos: [0, 0, 0], scale: [1.42, 0.25, 1.22] }, 24, 6);
  for (const a of [0.6, -0.6]) b.torus(1.32, 0.025, '#3b3b3b', { pos: [0, 0, 0], rot: [0, a, 0], scale: [1.06, 0.95, 1] }, Math.PI, 4, 24);
  b.slab([[-0.4, 0], [0.4, 0], [0.32, 0.7], [0, 0.95], [-0.32, 0.7]], 0.04, '#5a2219', { pos: [0, 0, 1.17], rot: [-0.2, 0, 0] });
  return b;
}

export function teepee() {
  const b = new GeoBuilder({ ao: 0.3, aoHeight: 0.6 });
  const bands: ColorFn = (p) => C(p.y < 0.35 ? '#c8553d' : p.y < 0.5 ? '#f3e2b8' : p.y < 0.62 ? '#2f8d8a' : p.y > 1.5 && p.y < 1.65 ? '#c8553d' : '#f3e2b8');
  b.cone(1.25, 2.6, bands, { pos: [0, 1.3, 0] }, 18);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.cyl(0.025, 0.03, 1.0, PAL.woodDark, { pos: [Math.cos(a) * 0.07, 2.75, Math.sin(a) * 0.07], rot: [Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35] }, 5);
  }
  b.slab([[-0.38, 0], [0.38, 0], [0, 1.1]], 0.02, '#3d241a', { pos: [0, 0.01, 1.16], rot: [-0.44, 0, 0] });
  return b;
}

// ───────── キャンプファイヤー ─────────
export function campfireRing() {
  const b = new GeoBuilder({ ao: 0.4, aoHeight: 0.3 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.ico(0.17, gradient('#7d776d', '#b4ac9c', 0, 0.3, 0.1, i), { pos: [Math.cos(a) * 0.62, 0.08, Math.sin(a) * 0.62], scale: [1.2, 0.8, 1], jitter: 0.3, seed: i }, 1);
  }
  b.cyl(0.55, 0.55, 0.02, '#3a2e26', { pos: [0, 0.01, 0] }, 16);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    b.cyl(0.06, 0.07, 0.75, PAL.bark, { pos: [Math.cos(a) * 0.18, 0.2, Math.sin(a) * 0.18], rot: [Math.sin(a) * 1.0, 0, -Math.cos(a) * 1.0] }, 7);
  }
  return b;
}
export function logSeat(len = 1.6) {
  const b = new GeoBuilder({ ao: 0.35, aoHeight: 0.4 });
  b.cyl(0.2, 0.2, len, stripes(PAL.bark, '#5e402b', 'y', 9, 0.03), { pos: [0, 0.2, 0], rot: [0, 0, Math.PI / 2] }, 12);
  for (const s of [-1, 1]) b.cyl(0.185, 0.185, 0.02, '#d9b58a', { pos: [s * len / 2, 0.2, 0], rot: [0, 0, Math.PI / 2] }, 12);
  b.box(len * 0.8, 0.04, 0.3, '#a77a4e', { pos: [0, 0.39, 0] }, 0.015);
  return b;
}

export function stringLightPost(h = 2.6) {
  const b = new GeoBuilder({ ao: 0.3 });
  b.cyl(0.05, 0.065, h, PAL.woodDark, { pos: [0, h / 2, 0] }, 8);
  return b;
}

// ───────── 建物 ─────────
export function cabinWalls(W: number, D: number) {
  const b = new GeoBuilder({ ao: 0.25, aoHeight: 0.8 });
  const H = 2.4, T = 0.24;
  const logs = stripes('#9c6a3e', '#8a5b33', 'y', 4.2, 0.04);
  const wall = (x: number, z: number, w: number, d: number, y0 = 0, y1 = H) => b.box(w, y1 - y0, d, logs, { pos: [x, (y0 + y1) / 2, z] }, 0.06);
  // 北
  wall(0, -D / 2, W, T);
  // 東西（窓つき）
  for (const s of [-1, 1]) {
    wall(s * W / 2, -D / 4 - 0.6, T, D / 2 - 1.2 + 0.0);
    wall(s * W / 2, D / 4 + 0.6, T, D / 2 - 1.2 + 0.0);
    wall(s * W / 2, 0, T, 2.4, 0, 0.9);
    wall(s * W / 2, 0, T, 2.4, 1.9, H);
    b.box(T * 0.4, 1.0, 1.2, '#a9d4e6', { pos: [s * W / 2, 1.4, 0] }, 0.01);
    b.box(T + 0.06, 0.08, 1.4, PAL.woodLight, { pos: [s * W / 2, 0.86, 0] }, 0.02);
    b.box(T + 0.04, 1.0, 0.06, PAL.woodLight, { pos: [s * W / 2, 1.4, 0] }, 0.01);
  }
  // 南（ドアの穴）
  const dw = 1.2;
  wall(-(W / 2 + dw / 2) / 2, D / 2, W / 2 - dw / 2, T);
  wall((W / 2 + dw / 2) / 2, D / 2, W / 2 - dw / 2, T);
  wall(0, D / 2, dw, T, 2.05, H);
  b.box(dw + 0.2, 0.1, T + 0.06, PAL.woodLight, { pos: [0, 2.05, D / 2] }, 0.02);
  // 角の丸太
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cyl(0.18, 0.2, H + 0.1, '#7a5030', { pos: [sx * W / 2, (H + 0.1) / 2, sz * D / 2] }, 10);
  // 床
  b.box(W - 0.1, 0.1, D - 0.1, stripes('#b98c5c', '#a97d50', 'x', 3.5, 0.03), { pos: [0, 0.05, 0] }, 0.02);
  // 玄関のデッキ
  b.box(W * 0.6, 0.14, 1.6, stripes('#b98c5c', '#a07246', 'x', 4, 0.03), { pos: [0, 0.07, D / 2 + 0.8] }, 0.03);
  for (const x of [-W * 0.3 + 0.1, W * 0.3 - 0.1]) b.cyl(0.07, 0.08, 2.4, '#7a5030', { pos: [x, 1.2, D / 2 + 1.5] }, 8);
  // 煙突の土台
  b.box(0.7, 3.4, 0.7, gradient('#8a8478', '#aaa294', 0, 3.4, 0.12), { pos: [W / 2 - 0.9, 1.7, -D / 2 + 0.6] }, 0.08);
  // 室内の家具
  b.box(1.3, 0.08, 0.7, woodGrain(PAL.woodLight), { pos: [1.4, 0.82, -D / 2 + 0.9] }, 0.02); // 机
  for (const x of [0.85, 1.95]) for (const z of [-D / 2 + 0.65, -D / 2 + 1.15]) b.box(0.07, 0.8, 0.07, PAL.woodDark, { pos: [x, 0.4, z] }, 0.01);
  b.box(0.5, 0.06, 0.5, PAL.woodDark, { pos: [1.4, 0.48, -D / 2 + 1.55] }, 0.02); // 椅子
  b.box(0.5, 0.6, 0.06, PAL.woodDark, { pos: [1.4, 0.8, -D / 2 + 1.8] }, 0.02);
  for (const x of [1.2, 1.6]) for (const z of [-D / 2 + 1.35, -D / 2 + 1.75]) b.box(0.05, 0.46, 0.05, PAL.woodDark, { pos: [x, 0.23, z] }, 0.01);
  b.box(0.5, 0.35, 0.35, '#d8c9a4', { pos: [1.15, 1.02, -D / 2 + 0.85] }, 0.02); // 書類
  b.box(1.8, 1.9, 0.4, PAL.woodDark, { pos: [-1.6, 0.95, -D / 2 + 0.35] }, 0.03); // 棚
  for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) b.box(0.25, 0.32, 0.25, ['#c94f3a', '#3c7f9c', '#e2b048', '#5b8e47', '#f1ece0'][(i + j) % 5], { pos: [-2.3 + j * 0.34, 0.45 + i * 0.6, -D / 2 + 0.38] }, 0.02);
  b.cyl(0.9, 0.9, 0.02, '#b74c3c', { pos: [-0.6, 0.11, 0.4], scale: [1.3, 1, 1] }, 24); // ラグ
  b.cyl(0.65, 0.65, 0.025, '#e8c47a', { pos: [-0.6, 0.115, 0.4], scale: [1.3, 1, 1] }, 24);
  b.box(1.0, 0.7, 0.04, '#e9dfc4', { pos: [-0.6, 1.5, -D / 2 + 0.14] }, 0.01); // 掲示板（地図）
  b.box(0.06, 0.06, 0.25, PAL.woodDark, { pos: [W / 2 - 0.2, 1.65, 0.9], rot: [0, 0, 0] }, 0.01); // 帽子かけ
  return b;
}

export function cabinRoof(W: number, D: number) {
  const b = new GeoBuilder();
  const H = 2.4, rh = 1.5, over = 0.45;
  const half = W / 2 + over;
  const len = Math.hypot(half, rh);
  const ang = Math.atan2(rh, half);
  const sh = stripes(PAL.roof, PAL.roofDark, 'z', 0.0001, 0.02);
  const shingles: ColorFn = (p) => C(Math.floor(p.y * 6 + Math.sin(p.z * 3) * 0.3) % 2 ? PAL.roof : '#8a3f2d');
  void sh;
  for (const s of [-1, 1]) b.box(len, 0.12, D + over * 2 + 0.6, shingles, { pos: [s * half / 2, H + rh / 2 + 0.05, 0], rot: [0, 0, -s * ang] }, 0.04);
  b.box(0.24, 0.24, D + over * 2 + 0.7, PAL.roofDark, { pos: [0, H + rh + 0.06, 0], rot: [0, 0, Math.PI / 4] }, 0.04);
  for (const z of [-D / 2, D / 2]) b.slab([[-W / 2, 0], [W / 2, 0], [0, rh]], 0.2, stripes('#9c6a3e', '#8a5b33', 'y', 4.2), { pos: [0, H, z] });
  b.box(0.7, 1.0, 0.7, gradient('#8a8478', '#aaa294', H, H + 2.2, 0.12), { pos: [W / 2 - 0.9, H + 1.6, -D / 2 + 0.6] }, 0.08);
  b.box(0.8, 0.12, 0.8, '#6f6a60', { pos: [W / 2 - 0.9, H + 2.15, -D / 2 + 0.6] }, 0.03);
  // デッキの屋根
  b.box(W * 0.66, 0.1, 1.9, shingles, { pos: [0, 2.45, D / 2 + 0.95], rot: [0.22, 0, 0] }, 0.03);
  return b;
}

export function kiosk() {
  const b = new GeoBuilder({ ao: 0.25, aoHeight: 0.7 });
  const W = 3.2, D = 2.4, H = 2.5;
  const planks = stripes('#e7d2a8', '#dcc497', 'y', 5, 0.02);
  b.box(W, H, 0.16, planks, { pos: [0, H / 2, -D / 2] }, 0.04);
  for (const s of [-1, 1]) b.box(0.16, H, D, planks, { pos: [s * W / 2, H / 2, 0] }, 0.04);
  b.box(W, 0.95, 0.16, '#5f9c8a', { pos: [0, 0.475, D / 2] }, 0.04);
  b.box(W + 0.15, 0.1, 0.55, woodGrain(PAL.woodLight), { pos: [0, 1.0, D / 2 + 0.1] }, 0.03); // カウンター
  b.box(W, 0.45, 0.16, planks, { pos: [0, H - 0.225, D / 2] }, 0.04);
  b.box(W + 0.4, 0.14, D + 0.5, '#f2e8d2', { pos: [0, H + 0.07, 0] }, 0.04);
  b.box(W + 0.2, 0.2, D + 0.3, '#5f9c8a', { pos: [0, H + 0.24, 0] }, 0.05);
  // 日よけ（しま）
  const aw: ColorFn = (p) => C(Math.floor((p.x + 5) * 2.4) % 2 ? '#e2574c' : '#fbf3e4');
  b.box(W + 0.3, 0.05, 1.1, aw, { pos: [0, H - 0.1, D / 2 + 0.5], rot: [0.38, 0, 0] }, 0.015);
  for (let i = 0; i < 8; i++) b.cyl(0.11, 0.11, 0.05, i % 2 ? '#e2574c' : '#fbf3e4', { pos: [-W / 2 - 0.05 + (i + 0.5) * ((W + 0.3) / 8), H - 0.33, D / 2 + 1.0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 1] }, 10);
  // 棚と商品
  b.box(W - 0.4, 0.05, 0.4, PAL.woodDark, { pos: [0, 1.5, -D / 2 + 0.3] }, 0.01);
  b.box(W - 0.4, 0.05, 0.4, PAL.woodDark, { pos: [0, 1.95, -D / 2 + 0.3] }, 0.01);
  const goods = ['#e94f37', '#f2c14e', '#4fa3d1', '#7bc35b', '#f08fb5', '#ffffff'];
  for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) {
    const c = goods[(i * 3 + r) % goods.length];
    if (i % 3 === 0) b.cyl(0.07, 0.07, 0.22, c, { pos: [-1.3 + i * 0.32, 1.64 + r * 0.45, -D / 2 + 0.3] }, 10);
    else b.box(0.2, 0.26, 0.14, c, { pos: [-1.3 + i * 0.32, 1.66 + r * 0.45, -D / 2 + 0.3] }, 0.02);
  }
  // カウンターの上
  b.cyl(0.18, 0.18, 0.3, '#f6e9cf', { pos: [-1.0, 1.2, D / 2 + 0.15] }, 14);
  for (let i = 0; i < 4; i++) b.sphere(0.06, ['#f1c27d', '#e9a2c1', '#9ad0e8', '#f1c27d'][i], { pos: [-1.0 + (i % 2 - 0.5) * 0.12, 1.38, D / 2 + 0.15 + (i > 1 ? 0.06 : -0.06)] }, 8, 6);
  b.box(0.5, 0.3, 0.3, '#c98d4e', { pos: [0.9, 1.2, D / 2 + 0.15] }, 0.03);
  // 外のアイスケース
  b.box(1.0, 0.8, 0.6, '#f4f4f0', { pos: [W / 2 + 0.75, 0.4, D / 2 - 0.4] }, 0.06);
  b.box(0.9, 0.04, 0.5, '#9fd3ea', { pos: [W / 2 + 0.75, 0.82, D / 2 - 0.4] }, 0.01);
  return b;
}

export function gateArch() {
  const b = new GeoBuilder({ ao: 0.3, aoHeight: 0.7 });
  for (const x of [-2.4, 2.4]) {
    b.cyl(0.22, 0.26, 3.6, gradient(PAL.barkDark, PAL.bark, 0, 3.6), { pos: [x, 1.8, 0] }, 10);
    b.ico(0.45, gradient('#7d776d', '#b4ac9c', 0, 0.5), { pos: [x, 0.15, 0], scale: [1.2, 0.6, 1.2], jitter: 0.3, seed: 3 }, 1);
  }
  b.cyl(0.18, 0.18, 5.6, PAL.bark, { pos: [0, 3.45, 0], rot: [0, 0, Math.PI / 2] }, 10);
  b.box(3.6, 0.85, 0.12, PAL.woodDark, { pos: [0, 2.95, 0.1] }, 0.05);
  b.box(4.4, 0.12, 0.6, '#3f6b38', { pos: [0, 3.75, 0] }, 0.04);
  return b;
}

export function dock() {
  const { x0, x1, w } = { x0: 0, x1: -6.6, w: 1.7 };
  const b = new GeoBuilder({ ao: 0.1 });
  const len = x0 - x1;
  const n = Math.round(len / 0.32);
  for (let i = 0; i < n; i++) b.box(0.29, 0.07, w, woodGrain(i % 3 ? '#b98a57' : '#a97a4a', 0.15), { pos: [x0 - 0.16 - i * (len / n), 0.39, 0], rot: [0, 0, (i % 2 - 0.5) * 0.02] }, 0.015);
  for (let i = 0; i <= 3; i++) for (const s of [-1, 1]) b.cyl(0.08, 0.09, 1.6, '#6b4a32', { pos: [x0 - 0.3 - i * (len - 0.5) / 3, -0.25, s * (w / 2 - 0.05)] }, 8);
  for (const s of [-1, 1]) b.box(len, 0.08, 0.1, '#8a6038', { pos: [x0 - len / 2, 0.3, s * (w / 2 - 0.03)] }, 0.02);
  b.cyl(0.06, 0.06, 0.5, '#6b4a32', { pos: [x1 + 0.25, 0.6, -w / 2 + 0.05] }, 8);
  b.cyl(0.06, 0.06, 0.5, '#6b4a32', { pos: [x1 + 0.25, 0.6, w / 2 - 0.05] }, 8);
  return b;
}

export function lilyPads(seed: number) {
  const r = rand(seed);
  const b = new GeoBuilder();
  for (let i = 0; i < 4; i++) {
    const rr = 0.18 + r() * 0.15;
    b.cyl(rr, rr, 0.015, i % 3 ? '#4f8f3a' : '#6fae47', { pos: [(r() - 0.5) * 1.6, 0, (r() - 0.5) * 1.6] }, 12);
    if (r() > 0.7) b.sphere(0.06, '#f5b4c8', { pos: [(r() - 0.5) * 1.2, 0.04, (r() - 0.5) * 1.2] }, 8, 6);
  }
  return b;
}

export function car(color = '#3aa7b8') {
  const b = new GeoBuilder({ ao: 0.2, aoHeight: 0.5 });
  b.box(1.75, 0.6, 3.8, color, { pos: [0, 0.6, 0] }, 0.25);
  b.box(1.55, 0.55, 2.0, color, { pos: [0, 1.1, -0.2] }, 0.22);
  b.box(1.58, 0.42, 1.85, '#2f4b5e', { pos: [0, 1.12, -0.2] }, 0.18);
  b.box(1.4, 0.38, 0.05, '#2f4b5e', { pos: [0, 1.1, 0.82], rot: [-0.45, 0, 0] }, 0.02);
  b.box(1.78, 0.12, 3.85, '#f2efe6', { pos: [0, 0.42, 0] }, 0.05);
  for (const s of [-1, 1]) {
    b.sphere(1, '#fff6d6', { pos: [s * 0.6, 0.68, 1.88], scale: [0.14, 0.1, 0.05] });
    b.sphere(1, '#d64a3a', { pos: [s * 0.65, 0.68, -1.88], scale: [0.12, 0.07, 0.04] });
    for (const z of [-1.2, 1.25]) {
      b.cyl(0.36, 0.36, 0.26, '#2b2b2b', { pos: [s * 0.82, 0.36, z], rot: [0, 0, Math.PI / 2] }, 16);
      b.cyl(0.2, 0.2, 0.28, '#c9c9c9', { pos: [s * 0.82, 0.36, z], rot: [0, 0, Math.PI / 2] }, 12);
    }
  }
  b.box(1.3, 0.12, 1.3, '#4a4a4a', { pos: [0, 1.42, -0.3] }, 0.04); // ルーフラック
  b.box(1.0, 0.3, 1.1, '#e0a03c', { pos: [0, 1.62, -0.3] }, 0.08);
  return b;
}

export function camperVan() {
  const b = new GeoBuilder({ ao: 0.2, aoHeight: 0.5 });
  b.box(2.0, 1.7, 4.6, '#f1ead6', { pos: [0, 1.25, 0] }, 0.35);
  b.box(2.02, 0.6, 4.62, '#8fbf6a', { pos: [0, 0.65, 0] }, 0.25);
  b.box(1.7, 0.6, 0.05, '#2f4b5e', { pos: [0, 1.55, 2.29], rot: [-0.15, 0, 0] }, 0.02);
  for (const s of [-1, 1]) {
    b.box(0.04, 0.5, 1.2, '#2f4b5e', { pos: [s * 1.01, 1.55, 0.2] }, 0.02);
    for (const z of [-1.5, 1.5]) {
      b.cyl(0.38, 0.38, 0.28, '#2b2b2b', { pos: [s * 0.92, 0.38, z], rot: [0, 0, Math.PI / 2] }, 16);
      b.cyl(0.2, 0.2, 0.3, '#d0d0d0', { pos: [s * 0.92, 0.38, z], rot: [0, 0, Math.PI / 2] }, 12);
    }
  }
  b.box(2.2, 0.08, 1.4, '#2f9c8f', { pos: [1.4, 2.0, 0.2], rot: [0, 0, -0.2] }, 0.02); // 日よけ
  return b;
}

export function denHouse() {
  const b = new GeoBuilder({ ao: 0.3, aoHeight: 0.8 });
  const bark = (p: THREE.Vector3) => {
    const a = Math.atan2(p.z, p.x);
    const f = Math.sin(a * 22 + p.y * 2) * 0.5 + 0.5;
    return new THREE.Color().lerpColors(C('#5a3a24'), C('#7a5235'), f);
  };
  b.lathe([[1.55, 0], [1.45, 0.2], [1.38, 1.0], [1.35, 1.75], [1.3, 1.85], [0.0, 1.85]], bark, {}, 30);
  b.cyl(1.25, 1.25, 0.05, '#d4ab7c', { pos: [0, 1.86, 0] }, 28);
  for (let i = 0; i < 3; i++) b.torus(0.35 + i * 0.3, 0.015, '#b48a5f', { pos: [0, 1.89, 0], rot: [Math.PI / 2, 0, 0] }, Math.PI * 2, 4, 28);
  // 根っこ
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    b.capsule(0.18, 0.7, '#5a3a24', { pos: [Math.cos(a) * 1.5, 0.12, Math.sin(a) * 1.5], rot: [Math.sin(a) * 1.25, 0, -Math.cos(a) * 1.25] }, 8);
  }
  // 入口
  b.cyl(0.62, 0.62, 0.2, '#2a1a12', { pos: [0, 0.62, 1.4], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 1.3] }, 20);
  b.box(1.24, 0.6, 0.2, '#2a1a12', { pos: [0, 0.3, 1.42] }, 0.01);
  b.torus(0.66, 0.06, '#8a6038', { pos: [0, 0.62, 1.5], rot: [0, 0, 0] }, Math.PI, 6, 18);
  for (const s of [-1, 1]) b.box(0.12, 0.62, 0.12, '#8a6038', { pos: [s * 0.66, 0.31, 1.5] }, 0.03);
  // 上のきのこと葉
  b.ico(0.75, foliage('#2f5e26', '#7fb646', 1.8, 2.8, 3), { pos: [-0.5, 2.1, -0.3], jitter: 0.25, seed: 4, sway: 0.2 }, 1);
  b.ico(0.6, foliage('#2f5e26', '#7fb646', 1.8, 2.8, 5), { pos: [0.6, 2.0, -0.5], jitter: 0.25, seed: 6, sway: 0.2 }, 1);
  for (const [x, z, s] of [[0.9, 0.8, 1], [1.2, 0.4, 0.7], [-1.0, 0.9, 0.8]] as const) {
    b.cyl(0.05 * s, 0.07 * s, 0.3 * s, '#f1e6cf', { pos: [x * 1.3, 0.15 * s, z * 1.3] }, 8);
    b.sphere(1, '#d2412f', { pos: [x * 1.3, 0.3 * s, z * 1.3], scale: [0.2 * s, 0.13 * s, 0.2 * s] }, 14, 8);
  }
  // 手作りのポスト
  b.box(0.08, 0.9, 0.08, PAL.woodDark, { pos: [1.3, 0.45, 1.9] }, 0.02);
  b.box(0.3, 0.22, 0.4, '#3a9b8b', { pos: [1.3, 0.95, 1.9] }, 0.06);
  return b;
}

export function laundryPoles(a: [number, number], bpt: [number, number]) {
  const b = new GeoBuilder({ ao: 0.2 });
  const dx = bpt[0] - a[0], dz = bpt[1] - a[1];
  const len = Math.hypot(dx, dz);
  for (const x of [-len / 2, len / 2]) {
    b.cyl(0.05, 0.06, 1.9, PAL.woodDark, { pos: [x, 0.95, 0] }, 7);
  }
  const n = 10;
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n;
    const y0 = 1.8 - Math.sin(t0 * Math.PI) * 0.18, y1 = 1.8 - Math.sin(t1 * Math.PI) * 0.18;
    const x0 = -len / 2 + t0 * len, x1 = -len / 2 + t1 * len;
    const l = Math.hypot(x1 - x0, y1 - y0);
    b.cyl(0.008, 0.008, l, '#efe9dc', { pos: [(x0 + x1) / 2, (y0 + y1) / 2, 0], rot: [0, 0, Math.PI / 2 + Math.atan2(y1 - y0, x1 - x0)] }, 4);
  }
  // タオル
  b.box(0.45, 0.55, 0.02, stripes('#5ab1d6', '#f7f2e6', 'y', 9), { pos: [-len / 2 + 0.6, 1.5, 0], sway: 0.3 }, 0.005);
  b.box(0.38, 0.5, 0.02, '#f3c94e', { pos: [len / 2 - 0.55, 1.52, 0], sway: 0.3 }, 0.005);
  return b;
}

export function woodSign(w = 0.9) {
  const b = new GeoBuilder({ ao: 0.3 });
  b.cyl(0.05, 0.06, 1.2, PAL.woodDark, { pos: [0, 0.6, 0] }, 7);
  b.box(w, 0.3, 0.05, PAL.woodLight, { pos: [0, 1.05, 0.04] }, 0.02);
  return b;
}

export function mushrooms(seed: number) {
  const r = rand(seed);
  const b = new GeoBuilder();
  for (let i = 0; i < 3; i++) {
    const s = 0.5 + r() * 0.6, x = (r() - 0.5) * 0.4, z = (r() - 0.5) * 0.4;
    b.cyl(0.03 * s, 0.04 * s, 0.16 * s, '#f1e6cf', { pos: [x, 0.08 * s, z] }, 6);
    b.sphere(1, r() > 0.5 ? '#d2412f' : '#d99a3a', { pos: [x, 0.16 * s, z], scale: [0.1 * s, 0.07 * s, 0.1 * s] }, 10, 6);
  }
  return b;
}
