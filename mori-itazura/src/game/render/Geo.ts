// 形状を組み合わせて 1 つの頂点カラー付きジオメトリにまとめるためのビルダー。
// 小物・建物・キャラクターの部位はすべてここで作り、描画呼び出しを減らす。
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type Vec3 = [number, number, number];
export type ColorFn = (p: THREE.Vector3, n: THREE.Vector3) => THREE.Color;
export type ColorIn = number | string | THREE.Color | ColorFn;

export interface PartOpts {
  pos?: Vec3;
  rot?: Vec3;
  scale?: Vec3 | number;
  sway?: number;          // 風で揺れる量（0 で揺れない）
  ao?: number;            // 地面付近を暗くする強さ（0〜1）。省略時はビルダーの既定値
  jitter?: number;        // 頂点を少しゆがませる（手作り感）
  seed?: number;
}

const tmpV = new THREE.Vector3();
const tmpN = new THREE.Vector3();
const tmpC = new THREE.Color();

export function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

export class GeoBuilder {
  private parts: THREE.BufferGeometry[] = [];
  private stack: THREE.Matrix4[] = [new THREE.Matrix4()];
  aoDefault = 0;
  aoHeight = 0.7;

  constructor(opts: { ao?: number; aoHeight?: number } = {}) {
    if (opts.ao !== undefined) this.aoDefault = opts.ao;
    if (opts.aoHeight !== undefined) this.aoHeight = opts.aoHeight;
  }

  get matrix() { return this.stack[this.stack.length - 1]; }

  push(pos: Vec3 = [0, 0, 0], rot: Vec3 = [0, 0, 0], scale: Vec3 | number = 1) {
    const m = composeMatrix(pos, rot, scale);
    this.stack.push(this.matrix.clone().multiply(m));
    return this;
  }
  pop() { if (this.stack.length > 1) this.stack.pop(); return this; }

  /** 任意のジオメトリを追加する */
  add(geo: THREE.BufferGeometry, color: ColorIn, o: PartOpts = {}) {
    let g = geo.index ? geo : indexify(geo);
    g = g.clone();
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    const m = this.matrix.clone().multiply(composeMatrix(o.pos ?? [0, 0, 0], o.rot ?? [0, 0, 0], o.scale ?? 1));
    if (o.jitter) {
      const p = g.attributes.position as THREE.BufferAttribute;
      const r = rand(o.seed ?? 1);
      const off = r() * 100;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const h = hash3(x * 3.1 + off, y * 3.7, z * 2.9) - 0.5;
        const k = 1 + h * o.jitter;
        p.setXYZ(i, x * k, y * k, z * k);
      }
      g.computeVertexNormals();
    }
    g.applyMatrix4(m);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const nor = g.attributes.normal as THREE.BufferAttribute;
    const n = pos.count;
    const cols = new Float32Array(n * 3);
    const sway = new Float32Array(n);
    const ao = o.ao ?? this.aoDefault;
    const fixed = typeof color === 'function' ? null : new THREE.Color(color as THREE.ColorRepresentation);
    for (let i = 0; i < n; i++) {
      tmpV.fromBufferAttribute(pos, i);
      tmpN.fromBufferAttribute(nor, i);
      if (fixed) tmpC.copy(fixed); else tmpC.copy((color as ColorFn)(tmpV, tmpN));
      if (ao > 0) {
        const t = THREE.MathUtils.clamp(tmpV.y / this.aoHeight, 0, 1);
        const f = 1 - ao * (1 - t) * (1 - t);
        tmpC.multiplyScalar(f);
      }
      cols[i * 3] = tmpC.r; cols[i * 3 + 1] = tmpC.g; cols[i * 3 + 2] = tmpC.b;
      sway[i] = (o.sway ?? 0) * Math.max(0, tmpV.y);
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    g.setAttribute('aSway', new THREE.BufferAttribute(sway, 1));
    this.parts.push(g);
    return this;
  }

  sphere(r: number, color: ColorIn, o: PartOpts = {}, ws = 20, hs = 14) {
    return this.add(new THREE.SphereGeometry(r, ws, hs), color, o);
  }
  ico(r: number, color: ColorIn, o: PartOpts = {}, detail = 2) {
    return this.add(smoothIco(r, detail), color, o);
  }
  box(w: number, h: number, d: number, color: ColorIn, o: PartOpts = {}, radius = 0.04, seg = 2) {
    const rr = Math.min(radius, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
    const g = rr > 0.001 ? new RoundedBoxGeometry(w, h, d, seg, rr) : new THREE.BoxGeometry(w, h, d);
    return this.add(g, color, o);
  }
  cyl(rt: number, rb: number, h: number, color: ColorIn, o: PartOpts = {}, seg = 14, open = false) {
    return this.add(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), color, o);
  }
  cone(r: number, h: number, color: ColorIn, o: PartOpts = {}, seg = 14) {
    return this.add(new THREE.ConeGeometry(r, h, seg), color, o);
  }
  capsule(r: number, len: number, color: ColorIn, o: PartOpts = {}, seg = 12) {
    return this.add(new THREE.CapsuleGeometry(r, len, 6, seg), color, o);
  }
  torus(r: number, tube: number, color: ColorIn, o: PartOpts = {}, arc = Math.PI * 2, rs = 8, ts = 20) {
    return this.add(new THREE.TorusGeometry(r, tube, rs, ts, arc), color, o);
  }
  lathe(pts: [number, number][], color: ColorIn, o: PartOpts = {}, seg = 20) {
    return this.add(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg), color, o);
  }
  /** 板（厚みのある多角形） */
  slab(shape: [number, number][], depth: number, color: ColorIn, o: PartOpts = {}) {
    const s = new THREE.Shape(shape.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 1 });
    g.translate(0, 0, -depth / 2);
    return this.add(g, color, o);
  }

  get empty() { return this.parts.length === 0; }

  build(): THREE.BufferGeometry {
    if (!this.parts.length) return new THREE.BufferGeometry();
    const g = mergeGeometries(this.parts, false)!;
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }
}

export function composeMatrix(pos: Vec3, rot: Vec3, scale: Vec3 | number) {
  const s = typeof scale === 'number' ? new THREE.Vector3(scale, scale, scale) : new THREE.Vector3(...scale);
  return new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2], 'YXZ')), s);
}

function indexify(g: THREE.BufferGeometry) {
  const n = g.attributes.position.count;
  const idx = new Uint32Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;
  const c = g.clone();
  c.setIndex(new THREE.BufferAttribute(idx, 1));
  return c;
}

const icoCache = new Map<string, THREE.BufferGeometry>();
/** 滑らかな法線を持つ（頂点を共有した）正二十面体球 */
export function smoothIco(r: number, detail = 2) {
  const key = `${detail}`;
  let base = icoCache.get(key);
  if (!base) {
    const g = new THREE.IcosahedronGeometry(1, detail);
    base = mergeVerts(g);
    icoCache.set(key, base);
  }
  const c = base.clone();
  c.scale(r, r, r);
  return c;
}

export function mergeVerts(g: THREE.BufferGeometry) {
  const pos = g.attributes.position as THREE.BufferAttribute;
  const map = new Map<string, number>();
  const verts: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const k = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
    let j = map.get(k);
    if (j === undefined) { j = verts.length / 3; verts.push(x, y, z); map.set(k, j); }
    idx.push(j);
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  out.setIndex(idx);
  out.computeVertexNormals();
  return out;
}

/** 上下・ばらつきのグラデーション色関数 */
export function gradient(bottom: THREE.ColorRepresentation, top: THREE.ColorRepresentation, y0: number, y1: number, noise = 0.06, seed = 0): ColorFn {
  const a = new THREE.Color(bottom), b = new THREE.Color(top);
  const c = new THREE.Color();
  return (p) => {
    const t = THREE.MathUtils.clamp((p.y - y0) / (y1 - y0), 0, 1);
    c.copy(a).lerp(b, t);
    const h = (hash3(p.x * 1.7 + seed, p.y * 2.3, p.z * 1.9) - 0.5) * noise;
    c.r = Math.max(0, c.r + h); c.g = Math.max(0, c.g + h * 1.1); c.b = Math.max(0, c.b + h * 0.6);
    return c;
  };
}

/** 葉っぱ：上が明るく下が暗い＋上向き面を少し明るく */
export function foliage(dark: THREE.ColorRepresentation, light: THREE.ColorRepresentation, y0: number, y1: number, seed = 0): ColorFn {
  const a = new THREE.Color(dark), b = new THREE.Color(light);
  const c = new THREE.Color();
  return (p, n) => {
    let t = THREE.MathUtils.clamp((p.y - y0) / (y1 - y0), 0, 1);
    t = t * 0.75 + Math.max(0, n.y) * 0.25;
    c.copy(a).lerp(b, t);
    const h = (hash3(p.x * 2.1 + seed, p.y * 1.3, p.z * 2.7) - 0.5) * 0.08;
    c.r += h * 0.6; c.g += h; c.b += h * 0.3;
    return c;
  };
}
