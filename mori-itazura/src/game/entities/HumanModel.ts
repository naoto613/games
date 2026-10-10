// キャンプ場の人間たち。頭が大きく丸みのあるデフォルメ体型。見た目は設定（HumanLook）から組み立てる。
import * as THREE from 'three';
import { GeoBuilder } from '../render/Geo';
import { charMat, glossyMat } from '../render/Materials';
import { Rig, Pose, AnimCtx } from './Rig';

export interface HumanLook {
  skin: string; hair: string;
  hairStyle: 'short' | 'bun' | 'pigtails' | 'spiky' | 'bob' | 'bald' | 'ponytail';
  shirt: string; pants: string; shoes: string;
  sleeve?: 'long' | 'short';
  dress?: string;         // スカート
  hat?: 'ranger' | 'cap' | 'bucket' | 'bandana';
  hatColor?: string;
  beard?: boolean; glasses?: boolean; apron?: string; vest?: string; badge?: boolean; backpack?: string;
  scale?: number;
  stripes?: string;       // シャツのしま
}

function mesh(b: GeoBuilder, mat: THREE.Material = charMat) {
  const m = new THREE.Mesh(b.build(), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function buildHuman(L: HumanLook) {
  const rig = new Rig();
  rig.joint('body', rig.root, [0, 0, 0]);
  rig.joint('hips', 'body', [0, 0.5, 0]);
  rig.joint('spine', 'hips', [0, 0.04, 0]);
  rig.joint('head', 'spine', [0, 0.42, 0.0]);
  rig.joint('eyes', 'head', [0, 0.25, 0.245]);
  rig.joint('armL', 'spine', [-0.2, 0.36, 0], [0, 0, 0.12]);
  rig.joint('armR', 'spine', [0.2, 0.36, 0], [0, 0, -0.12]);
  rig.joint('foreL', 'armL', [0, -0.17, 0]);
  rig.joint('foreR', 'armR', [0, -0.17, 0]);
  rig.joint('handL', 'foreL', [0, -0.17, 0.02]);
  rig.joint('handR', 'foreR', [0, -0.17, 0.02]);
  rig.joint('legL', 'hips', [-0.09, -0.04, 0]);
  rig.joint('legR', 'hips', [0.09, -0.04, 0]);
  rig.joint('shinL', 'legL', [0, -0.21, 0]);
  rig.joint('shinR', 'legR', [0, -0.21, 0]);
  if (L.scale) rig.root.scale.setScalar(L.scale);

  const shirtFn = L.stripes
    ? (p: THREE.Vector3) => new THREE.Color(Math.floor((p.y + 2) * 22) % 2 ? L.shirt : L.stripes!)
    : L.shirt;

  // 腰
  const hips = new GeoBuilder();
  hips.sphere(1, L.dress ?? L.pants, { pos: [0, 0, 0], scale: [0.175, 0.13, 0.14] });
  if (L.dress) hips.lathe([[0.0, 0.08], [0.17, 0.08], [0.25, -0.15], [0.27, -0.22], [0.0, -0.22]], L.dress, {}, 22);
  rig.attach('hips', mesh(hips));

  // 胴体
  const torso = new GeoBuilder();
  torso.lathe([[0.0, -0.02], [0.165, 0.0], [0.18, 0.1], [0.17, 0.26], [0.13, 0.37], [0.07, 0.42], [0.0, 0.43]], shirtFn, { scale: [1, 1, 0.82] }, 24);
  torso.cyl(0.065, 0.07, 0.08, L.skin, { pos: [0, 0.44, 0] }, 12);
  if (L.vest) {
    torso.lathe([[0.0, 0.0], [0.172, 0.01], [0.187, 0.1], [0.178, 0.26], [0.14, 0.36], [0.0, 0.37]], L.vest, { scale: [1, 1, 0.84] }, 24);
  }
  if (L.apron) {
    torso.box(0.26, 0.42, 0.03, L.apron, { pos: [0, 0.12, 0.15], rot: [0.05, 0, 0] }, 0.012);
    torso.box(0.12, 0.08, 0.02, '#ffffff', { pos: [0, 0.06, 0.168] }, 0.008);
  }
  if (L.badge) {
    torso.cyl(0.03, 0.03, 0.012, '#e8c13a', { pos: [-0.08, 0.27, 0.15], rot: [Math.PI / 2 - 0.2, 0, 0] }, 6);
    torso.box(0.06, 0.035, 0.012, '#c74d3a', { pos: [0.08, 0.28, 0.148], rot: [-0.2, 0, 0] }, 0.005);
  }
  if (L.backpack) {
    torso.box(0.26, 0.32, 0.14, L.backpack, { pos: [0, 0.2, -0.19] }, 0.05);
    torso.box(0.2, 0.1, 0.05, L.backpack, { pos: [0, 0.12, -0.27] }, 0.02);
    torso.cyl(0.05, 0.05, 0.28, '#3b6aa0', { pos: [0, 0.4, -0.2], rot: [0, 0, Math.PI / 2] }, 10);
  }
  rig.attach('spine', mesh(torso));

  // 頭と顔
  const head = new GeoBuilder();
  head.sphere(1, L.skin, { pos: [0, 0.25, 0], scale: [0.27, 0.255, 0.255] }, 28, 20);
  for (const s of [-1, 1]) {
    head.sphere(1, L.skin, { pos: [s * 0.262, 0.23, 0], scale: [0.045, 0.06, 0.035] });
    head.sphere(1, '#f4a3a0', { pos: [s * 0.15, 0.17, 0.2], scale: [0.045, 0.026, 0.012], rot: [0, s * 0.6, 0] });
    head.box(0.075, 0.016, 0.02, L.hair, { pos: [s * 0.09, 0.32, 0.235], rot: [-0.2, 0, -s * 0.12] }, 0.008);
  }
  head.sphere(1, shade(L.skin, 0.92), { pos: [0, 0.205, 0.255], scale: [0.032, 0.026, 0.026] });
  head.torus(0.04, 0.009, '#7a3a32', { pos: [0, 0.155, 0.235], rot: [0.25, 0, Math.PI] }, Math.PI, 6, 12);
  addHair(head, L);
  if (L.beard) {
    head.sphere(1, L.hair, { pos: [0, 0.12, 0.17], scale: [0.2, 0.12, 0.12] });
    head.sphere(1, L.hair, { pos: [0, 0.175, 0.235], scale: [0.08, 0.025, 0.03] });
  }
  if (L.glasses) {
    for (const s of [-1, 1]) head.torus(0.05, 0.009, '#2c2c2c', { pos: [s * 0.09, 0.25, 0.262] }, Math.PI * 2, 6, 18);
    head.box(0.07, 0.012, 0.012, '#2c2c2c', { pos: [0, 0.26, 0.265] }, 0.004);
  }
  addHat(head, L);
  rig.attach('head', mesh(head));

  const eyes = new GeoBuilder();
  for (const s of [-1, 1]) {
    eyes.sphere(1, '#1c1412', { pos: [s * 0.09, 0, 0], scale: [0.034, 0.048, 0.022] });
    eyes.sphere(0.012, '#ffffff', { pos: [s * 0.09 + 0.01, 0.017, 0.018] });
  }
  rig.attach('eyes', mesh(eyes, glossyMat));

  // 腕
  for (const s of ['L', 'R']) {
    const up = new GeoBuilder();
    up.capsule(0.06, 0.1, L.sleeve === 'short' ? L.shirt : L.vest ?? L.shirt, { pos: [0, -0.08, 0] });
    if (L.sleeve === 'short') up.capsule(0.048, 0.06, L.skin, { pos: [0, -0.14, 0] });
    rig.attach('arm' + s, mesh(up));
    const fo = new GeoBuilder();
    fo.capsule(0.05, 0.1, L.sleeve === 'short' ? L.skin : L.shirt, { pos: [0, -0.08, 0] });
    rig.attach('fore' + s, mesh(fo));
    const hand = new GeoBuilder();
    hand.sphere(1, L.skin, { pos: [0, 0, 0], scale: [0.056, 0.06, 0.05] });
    hand.sphere(1, L.skin, { pos: [s === 'L' ? 0.04 : -0.04, 0.02, 0.025], scale: [0.022, 0.03, 0.022] });
    rig.attach('hand' + s, mesh(hand));
  }
  // 脚
  for (const s of ['L', 'R']) {
    const th = new GeoBuilder();
    th.capsule(0.072, 0.12, L.dress ? L.skin : L.pants, { pos: [0, -0.1, 0] });
    rig.attach('leg' + s, mesh(th));
    const sh = new GeoBuilder();
    sh.capsule(0.06, 0.1, L.dress ? L.skin : L.pants, { pos: [0, -0.09, 0] });
    sh.box(0.13, 0.085, 0.21, L.shoes, { pos: [0, -0.19, 0.035] }, 0.04);
    sh.box(0.135, 0.025, 0.215, shade(L.shoes, 0.6), { pos: [0, -0.225, 0.035] }, 0.01);
    rig.attach('shin' + s, mesh(sh));
  }
  return rig;
}

function shade(hex: string, k: number) { return '#' + new THREE.Color(hex).multiplyScalar(k).getHexString(); }

function capSphere(b: GeoBuilder, r: number, color: string, pos: [number, number, number], rot: [number, number, number], theta: number, scale: [number, number, number] = [1, 1, 1]) {
  b.add(new THREE.SphereGeometry(r, 28, 16, 0, Math.PI * 2, 0, theta), color, { pos, rot, scale });
}

function addHair(b: GeoBuilder, L: HumanLook) {
  const H = L.hair;
  switch (L.hairStyle) {
    case 'short':
      capSphere(b, 0.28, H, [0, 0.265, -0.01], [-0.55, 0, 0], 1.75);
      for (let i = -2; i <= 2; i++) b.sphere(1, H, { pos: [i * 0.06, 0.4, 0.19], scale: [0.06, 0.05, 0.05], rot: [0, 0, i * 0.2] });
      break;
    case 'spiky':
      capSphere(b, 0.28, H, [0, 0.265, -0.01], [-0.55, 0, 0], 1.7);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        b.cone(0.07, 0.16, H, { pos: [Math.cos(a) * 0.14, 0.48, Math.sin(a) * 0.14 - 0.03], rot: [Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7] }, 8);
      }
      break;
    case 'bun':
      capSphere(b, 0.28, H, [0, 0.262, -0.005], [-0.42, 0, 0], 1.9);
      b.sphere(0.11, H, { pos: [0, 0.5, -0.14] });
      b.sphere(1, H, { pos: [-0.12, 0.38, 0.19], scale: [0.12, 0.06, 0.06], rot: [0, 0, 0.4] });
      break;
    case 'ponytail':
      capSphere(b, 0.28, H, [0, 0.262, -0.005], [-0.45, 0, 0], 1.85);
      b.sphere(1, H, { pos: [0, 0.3, -0.33], scale: [0.09, 0.16, 0.09], rot: [0.5, 0, 0] });
      b.sphere(0.04, '#e05a7a', { pos: [0, 0.38, -0.27] });
      break;
    case 'pigtails':
      capSphere(b, 0.28, H, [0, 0.262, -0.005], [-0.45, 0, 0], 1.85);
      for (const s of [-1, 1]) {
        b.sphere(1, H, { pos: [s * 0.3, 0.22, -0.05], scale: [0.08, 0.12, 0.08], rot: [0, 0, s * 0.4] });
        b.sphere(0.035, '#f2c14e', { pos: [s * 0.27, 0.32, -0.04] });
      }
      break;
    case 'bob':
      capSphere(b, 0.29, H, [0, 0.255, -0.01], [-0.35, 0, 0], 2.05);
      for (let i = -2; i <= 2; i++) b.sphere(1, H, { pos: [i * 0.065, 0.395, 0.2], scale: [0.065, 0.05, 0.05] });
      break;
    case 'bald':
      capSphere(b, 0.275, H, [0, 0.245, -0.03], [-1.6, 0, 0], 1.2, [1.0, 1, 1]);
      break;
  }
}

function addHat(b: GeoBuilder, L: HumanLook) {
  const c = L.hatColor ?? '#8a6a3e';
  switch (L.hat) {
    case 'ranger':
      b.cyl(0.46, 0.46, 0.025, c, { pos: [0, 0.44, 0], rot: [-0.08, 0, 0] }, 30);
      b.lathe([[0, 0.24], [0.06, 0.24], [0.17, 0.17], [0.21, 0.0], [0, 0]], shade(c, 1.1), { pos: [0, 0.44, 0], rot: [-0.08, Math.PI / 4, 0] }, 4);
      b.cyl(0.215, 0.215, 0.05, '#4a3220', { pos: [0, 0.47, 0], rot: [-0.08, 0, 0] }, 24, true);
      break;
    case 'cap':
      capSphere(b, 0.285, c, [0, 0.29, 0], [-0.25, 0, 0], 1.35);
      b.cyl(0.2, 0.2, 0.02, shade(c, 0.85), { pos: [0, 0.39, 0.25], rot: [0.2, 0, 0], scale: [1, 1, 0.7] }, 20);
      break;
    case 'bucket':
      b.lathe([[0, 0.2], [0.21, 0.2], [0.25, 0.02], [0.37, -0.06], [0.36, -0.08], [0.24, 0.0], [0, 0.0]], c, { pos: [0, 0.38, 0], rot: [-0.1, 0, 0] }, 26);
      break;
    case 'bandana':
      capSphere(b, 0.29, c, [0, 0.27, -0.01], [-0.3, 0, 0], 1.3);
      b.sphere(1, c, { pos: [0, 0.32, -0.27], scale: [0.06, 0.05, 0.05] });
      break;
  }
}

// ───────── アニメーション ─────────
export type HumanAnim =
  | 'idle' | 'walk' | 'run' | 'chase' | 'sit' | 'sitEat' | 'talk' | 'lookAround' | 'alert' | 'throw' | 'strum'
  | 'fish' | 'read' | 'wipe' | 'cheer' | 'surprise' | 'search' | 'wave' | 'grab' | 'call' | 'sad';

const S = Math.sin, Co = Math.cos;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

function blink(t: number, off = 0): Pose {
  const c = (t * 0.27 + off) % 1;
  return { 'eyes.sy': c > 0.965 ? 0.1 : 1 };
}
const SIT: Pose = { 'hips.py': -0.04, 'legL.x': -1.45, 'legR.x': -1.45, 'shinL.x': 1.45, 'shinR.x': 1.45, 'legL.z': 0.06, 'legR.z': -0.06 };

export const HUMAN_CLIPS: Record<HumanAnim, (t: number, c: AnimCtx) => Pose> = {
  idle: (t) => {
    const br = S(t * 1.8);
    return { 'spine.x': br * 0.015, 'head.x': br * 0.02, 'head.y': S(t * 0.4) * 0.15, 'armL.z': 0.02 + br * 0.02, 'armR.z': -0.02 - br * 0.02, 'foreL.x': -0.15, 'foreR.x': -0.15, ...blink(t) };
  },
  walk: (t, c) => {
    const p = c.phase, sw = S(p);
    return {
      'hips.py': Math.abs(Co(p)) * 0.035 - 0.01, 'hips.y': sw * 0.08, 'spine.y': -sw * 0.12, 'spine.z': -c.turn * 0.06, 'head.y': sw * 0.05,
      'legL.x': sw * 0.55, 'legR.x': -sw * 0.55, 'shinL.x': Math.max(0, S(p + 1.2)) * 0.7, 'shinR.x': Math.max(0, -S(p + 1.2)) * 0.7,
      'armL.x': -sw * 0.45, 'armR.x': sw * 0.45, 'foreL.x': -0.3, 'foreR.x': -0.3, ...blink(t),
    };
  },
  run: (t, c) => {
    const p = c.phase, sw = S(p);
    return {
      'hips.py': Math.abs(Co(p)) * 0.06 - 0.02, 'spine.x': 0.22, 'hips.y': sw * 0.12, 'spine.y': -sw * 0.18, 'head.x': -0.12,
      'legL.x': sw * 0.95, 'legR.x': -sw * 0.95, 'shinL.x': Math.max(0, S(p + 1.3)) * 1.3, 'shinR.x': Math.max(0, -S(p + 1.3)) * 1.3,
      'armL.x': -sw * 0.9, 'armR.x': sw * 0.9, 'foreL.x': -1.2, 'foreR.x': -1.2, ...blink(t),
    };
  },
  chase: (t, c) => {
    const p = c.phase, sw = S(p);
    return {
      'hips.py': Math.abs(Co(p)) * 0.06 - 0.02, 'spine.x': 0.3, 'head.x': -0.25, 'hips.y': sw * 0.1,
      'legL.x': sw * 1.0, 'legR.x': -sw * 1.0, 'shinL.x': Math.max(0, S(p + 1.3)) * 1.3, 'shinR.x': Math.max(0, -S(p + 1.3)) * 1.3,
      'armL.x': -1.5 + sw * 0.25, 'armR.x': -1.5 - sw * 0.25, 'armL.z': -0.2, 'armR.z': 0.2, 'foreL.x': -0.2, 'foreR.x': -0.2, 'eyes.s': 1.15,
    };
  },
  sit: (t) => ({ ...SIT, 'spine.x': S(t * 1.6) * 0.015, 'head.y': S(t * 0.33) * 0.25, 'head.x': 0.05, 'armL.x': -0.5, 'armR.x': -0.5, 'foreL.x': -0.6, 'foreR.x': -0.6, ...blink(t) }),
  sitEat: (t) => {
    const k = S(t * 1.6);
    const up = Math.max(0, k);
    return { ...SIT, 'spine.x': 0.05, 'head.x': 0.08 - up * 0.1, 'armR.x': -0.8 - up * 0.7, 'foreR.x': -1.0 - up * 0.9, 'armL.x': -0.6, 'foreL.x': -0.8, 'head.y': S(t * 0.3) * 0.25, ...blink(t, 0.3) };
  },
  talk: (t) => ({ 'armR.x': -0.4 + S(t * 4) * 0.25, 'foreR.x': -0.9 + S(t * 5) * 0.2, 'armL.x': -0.2, 'foreL.x': -0.4, 'head.z': S(t * 3) * 0.06, 'head.x': S(t * 5) * 0.04, ...blink(t) }),
  lookAround: (t) => ({ 'head.y': S(t * 1.6) * 0.9, 'spine.y': S(t * 1.6 - 0.4) * 0.25, 'armL.z': 0.2, 'armR.z': -0.2, 'foreL.x': -0.3, 'foreR.x': -0.3, 'head.x': -0.05 }),
  alert: (t) => {
    const k = clamp01(t / 0.25);
    return { 'spine.x': -0.12 * k, 'armR.x': -1.6 * k, 'armR.z': -0.1, 'foreR.x': -0.1, 'armL.x': -0.3 * k, 'foreL.x': -1.2 * k, 'head.x': -0.08, 'eyes.s': 1.25, 'body.py': S(clamp01(t / 0.3) * Math.PI) * 0.06 };
  },
  call: (t) => ({ 'armL.x': -2.4, 'armR.x': -2.4, 'armL.z': -0.6 + S(t * 14) * 0.2, 'armR.z': 0.6 - S(t * 14) * 0.2, 'foreL.x': -0.3, 'foreR.x': -0.3, 'head.x': -0.2, 'eyes.s': 1.2, 'body.py': Math.abs(S(t * 7)) * 0.04 }),
  throw: (t) => {
    const k = t < 0.3 ? -clamp01(t / 0.3) : clamp01((t - 0.3) / 0.2);
    return { 'armR.x': -1.0 - k * 1.2, 'foreR.x': -0.5, 'spine.y': -k * 0.3, 'spine.x': 0.1 };
  },
  strum: (t) => ({ ...SIT, 'spine.x': 0.08 + S(t * 4) * 0.02, 'head.x': 0.15, 'head.z': S(t * 2) * 0.12, 'armL.x': -1.0, 'armL.z': -0.4, 'foreL.x': -1.2, 'armR.x': -0.7, 'foreR.x': -1.0 + S(t * 14) * 0.25, ...blink(t) }),
  fish: (t) => ({ ...SIT, 'spine.x': 0.05, 'armL.x': -1.1, 'foreL.x': -0.5, 'armR.x': -1.0, 'foreR.x': -0.6, 'head.x': 0.1 + S(t * 0.7) * 0.05, 'head.y': S(t * 0.25) * 0.2, ...blink(t, 0.5) }),
  read: (t) => ({ ...SIT, 'head.x': 0.3, 'armL.x': -0.9, 'armR.x': -0.9, 'foreL.x': -1.0, 'foreR.x': -1.0, 'armL.z': -0.2, 'armR.z': 0.2, 'head.y': S(t * 0.6) * 0.1, ...blink(t, 0.2) }),
  wipe: (t) => ({ 'spine.x': 0.25, 'armR.x': -1.2, 'foreR.x': -0.3, 'armR.z': S(t * 5) * 0.35, 'armL.x': -0.2, 'head.x': 0.2, 'head.y': S(t * 0.4) * 0.2, ...blink(t) }),
  cheer: (t) => ({ 'armL.x': -2.7, 'armR.x': -2.7, 'armL.z': -0.4, 'armR.z': 0.4, 'body.py': Math.max(0, S(t * 9)) * 0.1, 'head.x': -0.15 }),
  surprise: (t) => {
    const k = t < 0.15 ? t / 0.15 : 1 - clamp01((t - 0.8) / 0.3);
    return { 'spine.x': -0.18 * k, 'armL.x': -1.0 * k, 'armR.x': -1.0 * k, 'armL.z': -0.7 * k, 'armR.z': 0.7 * k, 'foreL.x': -1.4 * k, 'foreR.x': -1.4 * k, 'eyes.s': 1 + 0.4 * k, 'body.py': S(clamp01(t / 0.3) * Math.PI) * 0.08 };
  },
  search: (t) => ({ 'spine.x': 0.55, 'hips.py': -0.05, 'legL.x': -0.3, 'legR.x': 0.15, 'shinL.x': 0.4, 'shinR.x': 0.3, 'head.y': S(t * 2) * 0.6, 'head.x': 0.1, 'armL.x': -0.9, 'armR.x': -0.9, 'foreL.x': -0.4, 'foreR.x': -0.4 }),
  wave: (t) => ({ 'armR.x': -0.3, 'armR.z': 2.6, 'foreR.z': S(t * 10) * 0.4, 'head.z': 0.1, ...blink(t) }),
  grab: (t) => {
    const k = Math.min(1, t / 0.2);
    return { 'spine.x': 0.4 * k, 'armL.x': -1.5 * k, 'armR.x': -1.5 * k, 'foreL.x': -0.2, 'foreR.x': -0.2, 'eyes.s': 1.1 };
  },
  sad: (t) => ({ 'head.x': 0.35, 'spine.x': 0.1, 'armL.z': 0.05, 'armR.z': -0.05, 'eyes.sy': 0.6, 'head.y': S(t * 0.5) * 0.2 }),
};
