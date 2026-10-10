// 主人公「コロ」：赤茶色の小さな森の動物（レッサーパンダ風のオリジナルデザイン）。
// 部位ごとに頂点カラー付きジオメトリをまとめ、関節に取り付ける。
import * as THREE from 'three';
import { GeoBuilder } from '../render/Geo';
import { charMat, glossyMat } from '../render/Materials';
import { Rig, Pose, AnimCtx } from './Rig';

export const CRITTER_COL = {
  fur: '#b8502a', furDark: '#8e3a1d', cream: '#f6e6c8', limb: '#4a2a1c', nose: '#2a1a15',
  bag: '#2a9d8f', bagDark: '#1d7268', strap: '#22867a', blush: '#f08a7a', ring: '#7d3418',
};

function mesh(b: GeoBuilder, mat: THREE.Material = charMat) {
  const m = new THREE.Mesh(b.build(), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function buildCritter() {
  const C = CRITTER_COL;
  const rig = new Rig();
  rig.joint('body', rig.root, [0, 0, 0]);
  rig.joint('hips', 'body', [0, 0.17, 0]);
  rig.joint('head', 'hips', [0, 0.26, 0.02]);
  rig.joint('eyes', 'head', [0, 0.165, 0.18]);
  rig.joint('earL', 'head', [-0.14, 0.3, -0.01], [0, 0, 0.35]);
  rig.joint('earR', 'head', [0.14, 0.3, -0.01], [0, 0, -0.35]);
  rig.joint('armL', 'hips', [-0.15, 0.2, 0.04], [0, 0, 0.25]);
  rig.joint('armR', 'hips', [0.15, 0.2, 0.04], [0, 0, -0.25]);
  rig.joint('legL', 'hips', [-0.085, 0.0, 0.0]);
  rig.joint('legR', 'hips', [0.085, 0.0, 0.0]);
  rig.joint('tail1', 'hips', [0, 0.05, -0.16], [0.6, 0, 0]);
  rig.joint('tail2', 'tail1', [0, 0, -0.13], [0.3, 0, 0]);
  rig.joint('tail3', 'tail2', [0, 0, -0.12], [0.25, 0, 0]);
  rig.joint('hatSlot', 'head', [0, 0.33, -0.01]);
  rig.joint('faceSlot', 'head', [0, 0.165, 0.2]);
  rig.joint('bodySlot', 'hips', [0, 0, 0]);
  rig.joint('holdSlot', 'hips', [0, 0.17, 0.25]);

  // 胴体
  const body = new GeoBuilder();
  body.sphere(1, C.fur, { pos: [0, 0.12, 0], scale: [0.195, 0.2, 0.185] }, 24, 16);
  body.sphere(1, C.cream, { pos: [0, 0.1, 0.085], scale: [0.13, 0.15, 0.11] }, 20, 14);
  // かばん（青緑）とベルト
  body.box(0.13, 0.11, 0.065, C.bag, { pos: [0.185, 0.04, 0.02], rot: [0, 0.25, 0.12] }, 0.025);
  body.box(0.135, 0.05, 0.07, C.bagDark, { pos: [0.187, 0.085, 0.022], rot: [0, 0.25, 0.12] }, 0.02);
  body.sphere(0.014, '#f2c14e', { pos: [0.205, 0.07, 0.065] });
  body.torus(0.2, 0.013, C.strap, { pos: [0.02, 0.15, 0.0], rot: [Math.PI / 2, 0, 0.75], scale: [1, 1.05, 1] }, Math.PI * 2, 6, 32);
  rig.attach('hips', mesh(body));

  // 頭
  const head = new GeoBuilder();
  head.sphere(1, C.fur, { pos: [0, 0.15, 0], scale: [0.24, 0.215, 0.215] }, 28, 20);
  head.sphere(1, C.cream, { pos: [-0.12, 0.085, 0.12], scale: [0.095, 0.075, 0.08] });
  head.sphere(1, C.cream, { pos: [0.12, 0.085, 0.12], scale: [0.095, 0.075, 0.08] });
  head.sphere(1, C.cream, { pos: [0, 0.075, 0.165], scale: [0.105, 0.072, 0.085] });
  head.sphere(1, C.cream, { pos: [-0.085, 0.245, 0.165], scale: [0.04, 0.026, 0.025] });
  head.sphere(1, C.cream, { pos: [0.085, 0.245, 0.165], scale: [0.04, 0.026, 0.025] });
  head.sphere(1, C.furDark, { pos: [-0.105, 0.105, 0.18], scale: [0.022, 0.05, 0.02], rot: [0, 0, 0.35] });
  head.sphere(1, C.furDark, { pos: [0.105, 0.105, 0.18], scale: [0.022, 0.05, 0.02], rot: [0, 0, -0.35] });
  head.sphere(1, C.nose, { pos: [0, 0.112, 0.245], scale: [0.036, 0.026, 0.026] });
  head.torus(0.022, 0.0065, C.nose, { pos: [-0.019, 0.07, 0.243], rot: [0.2, 0, Math.PI] }, Math.PI, 6, 10);
  head.torus(0.022, 0.0065, C.nose, { pos: [0.019, 0.07, 0.243], rot: [0.2, 0, Math.PI] }, Math.PI, 6, 10);
  head.sphere(1, C.blush, { pos: [-0.15, 0.1, 0.15], scale: [0.032, 0.02, 0.012], rot: [0, -0.6, 0] });
  head.sphere(1, C.blush, { pos: [0.15, 0.1, 0.15], scale: [0.032, 0.02, 0.012], rot: [0, 0.6, 0] });
  rig.attach('head', mesh(head));

  // 目（まばたき用に別メッシュ）
  const eyes = new GeoBuilder();
  for (const s of [-1, 1]) {
    eyes.sphere(1, '#1b1210', { pos: [s * 0.08, 0, 0], scale: [0.037, 0.047, 0.03] });
    eyes.sphere(0.013, '#ffffff', { pos: [s * 0.08 + 0.012, 0.016, 0.026] });
    eyes.sphere(0.006, '#ffffff', { pos: [s * 0.08 - 0.01, -0.014, 0.027] });
  }
  rig.attach('eyes', mesh(eyes, glossyMat));

  // 耳
  for (const s of [-1, 1]) {
    const ear = new GeoBuilder();
    ear.sphere(1, C.fur, { pos: [0, 0.05, 0], scale: [0.075, 0.085, 0.04] });
    ear.sphere(1, C.cream, { pos: [0, 0.045, 0.022], scale: [0.05, 0.06, 0.02] });
    ear.sphere(1, C.furDark, { pos: [0, 0.098, 0.0], scale: [0.04, 0.025, 0.035] });
    rig.attach(s < 0 ? 'earL' : 'earR', mesh(ear));
  }
  // 腕
  for (const s of [-1, 1]) {
    const arm = new GeoBuilder();
    arm.capsule(0.045, 0.1, C.limb, { pos: [0, -0.07, 0] });
    arm.sphere(1, C.limb, { pos: [0, -0.14, 0.012], scale: [0.05, 0.045, 0.055] });
    rig.attach(s < 0 ? 'armL' : 'armR', mesh(arm));
  }
  // 脚
  for (const s of [-1, 1]) {
    const leg = new GeoBuilder();
    leg.capsule(0.055, 0.05, C.limb, { pos: [0, -0.07, 0] });
    leg.sphere(1, C.limb, { pos: [0, -0.135, 0.03], scale: [0.06, 0.04, 0.085] });
    leg.sphere(1, '#c9a58a', { pos: [0, -0.15, 0.06], scale: [0.035, 0.02, 0.04] });
    rig.attach(s < 0 ? 'legL' : 'legR', mesh(leg));
  }
  // しっぽ（しま模様）
  const tailCol = [[C.fur, C.ring], [C.fur, C.ring], [C.fur, C.cream]];
  ['tail1', 'tail2', 'tail3'].forEach((name, i) => {
    const t = new GeoBuilder();
    const sz = [0.09, 0.085, 0.07][i];
    t.sphere(1, tailCol[i][0], { pos: [0, 0, -0.065], scale: [sz, sz, 0.1] });
    t.sphere(1, tailCol[i][1], { pos: [0, 0, -0.12], scale: [sz * 0.95, sz * 0.95, 0.045] });
    rig.attach(name, mesh(t));
  });
  return rig;
}

/** 衣装・帽子などの見た目（変装） */
export function buildOutfit(id: string): { hat?: THREE.Object3D; face?: THREE.Object3D; body?: THREE.Object3D } {
  const out: { hat?: THREE.Object3D; face?: THREE.Object3D; body?: THREE.Object3D } = {};
  if (id === 'camper_outfit') {
    const b = new GeoBuilder();
    // チェックのシャツ風ベスト
    const plaid = (p: THREE.Vector3) => {
      const a = Math.floor((p.x + 1) * 18) % 2, c = Math.floor((p.y + 1) * 18) % 2;
      return new THREE.Color(a && c ? '#7b1f24' : a || c ? '#c0393b' : '#e2675d');
    };
    b.sphere(1, plaid, { pos: [0, 0.13, 0], scale: [0.205, 0.17, 0.195] }, 24, 16);
    b.sphere(1, '#f4e3c3', { pos: [0, 0.2, 0.17], scale: [0.06, 0.06, 0.03] });
    out.body = mesh(b);
    const h = new GeoBuilder();
    h.cyl(0.15, 0.19, 0.1, '#5f7f3c', { pos: [0, 0.0, 0] }, 22);
    h.cyl(0.29, 0.29, 0.02, '#4f6d30', { pos: [0, -0.05, 0] }, 26);
    h.cyl(0.152, 0.152, 0.03, '#c58a3a', { pos: [0, -0.02, 0] }, 22);
    const hat = mesh(h); hat.rotation.x = -0.18; hat.position.y = -0.04;
    out.hat = hat;
    const g = new GeoBuilder();
    for (const s of [-1, 1]) g.torus(0.042, 0.009, '#3b2a20', { pos: [s * 0.08, 0, 0.03] }, Math.PI * 2, 6, 18);
    g.box(0.07, 0.012, 0.012, '#3b2a20', { pos: [0, 0.01, 0.03] }, 0.004);
    out.face = mesh(g);
  } else if (id === 'straw_hat') {
    const h = new GeoBuilder();
    h.lathe([[0, 0.12], [0.1, 0.115], [0.15, 0.06], [0.16, 0.0], [0.33, -0.02], [0.34, -0.04], [0.16, -0.02], [0.0, -0.02]], '#e8c46a', {}, 26);
    h.cyl(0.162, 0.165, 0.035, '#c0392b', { pos: [0, 0.02, 0] }, 24, true);
    const hat = mesh(h); hat.rotation.x = -0.15; hat.position.y = -0.03;
    out.hat = hat;
  } else if (id === 'sunglasses') {
    const g = new GeoBuilder();
    for (const s of [-1, 1]) g.sphere(1, '#141414', { pos: [s * 0.08, 0, 0.03], scale: [0.055, 0.042, 0.015] });
    g.box(0.1, 0.014, 0.014, '#141414', { pos: [0, 0.018, 0.03] }, 0.005);
    out.face = mesh(g, glossyMat);
  } else if (id === 'ranger_hat') {
    const h = new GeoBuilder();
    h.cyl(0.36, 0.36, 0.022, '#8a6a3e', { pos: [0, -0.04, 0] }, 28);
    h.lathe([[0, 0.17], [0.05, 0.17], [0.13, 0.12], [0.17, 0.0], [0.0, 0.0]], '#9a7848', {}, 4);
    h.cyl(0.172, 0.172, 0.04, '#5a3e22', { pos: [0, 0.0, 0] }, 24, true);
    const hat = mesh(h); hat.rotation.x = -0.12; hat.rotation.y = Math.PI / 4; hat.position.y = -0.02;
    out.hat = hat;
  }
  return out;
}

// ───────── アニメーション（手続き的） ─────────
export type CritterAnim =
  | 'idle' | 'walk' | 'run' | 'sneak' | 'hide' | 'jump' | 'pickup' | 'eat' | 'celebrate' | 'surprise'
  | 'interact' | 'fall' | 'sit' | 'row' | 'dig' | 'shake' | 'carryIdle' | 'fish' | 'sleep';

const S = Math.sin, Co = Math.cos;
const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

function tailSway(t: number, amp = 0.25, speed = 2): Pose {
  return {
    'tail1.y': S(t * speed) * amp, 'tail2.y': S(t * speed - 0.7) * amp * 1.2, 'tail3.y': S(t * speed - 1.4) * amp * 1.4,
    'tail1.x': S(t * speed * 0.5) * 0.06,
  };
}
function blink(t: number): Pose {
  const c = (t * 0.31) % 1;
  const b = c > 0.96 ? 0.1 : 1;
  return { 'eyes.sy': b };
}

export const CRITTER_CLIPS: Record<CritterAnim, (t: number, c: AnimCtx) => Pose> = {
  idle: (t) => {
    const br = S(t * 2.2);
    const look = S(t * 0.37) > 0.75 ? S(t * 0.9) * 0.5 : 0;
    const twitch = (t % 4.3) < 0.15 ? S(t * 60) * 0.25 : 0;
    return {
      'hips.py': br * 0.004, 'hips.x': 0.02, 'head.x': -0.05 + br * 0.02, 'head.y': look, 'head.z': S(t * 0.6) * 0.05,
      'armL.x': br * 0.05, 'armR.x': br * 0.05, 'earL.z': twitch, 'earR.z': -twitch * 0.5,
      ...tailSway(t, 0.28, 1.6), ...blink(t),
    };
  },
  carryIdle: (t) => {
    const br = S(t * 2.2);
    return {
      'hips.py': br * 0.004, 'head.x': -0.12, 'armL.x': -1.35, 'armR.x': -1.35, 'armL.z': -0.15, 'armR.z': 0.15,
      ...tailSway(t, 0.2, 1.6), ...blink(t),
    };
  },
  walk: (t, c) => {
    const p = c.phase;
    const sw = S(p);
    return {
      'hips.py': Math.abs(Co(p)) * 0.03 - 0.005, 'hips.z': sw * 0.07 - c.turn * 0.12, 'hips.x': 0.08, 'hips.y': sw * 0.08,
      'head.x': -0.05 + Math.abs(Co(p)) * 0.04, 'head.z': -sw * 0.05, 'head.y': -sw * 0.06,
      'legL.x': sw * 0.75, 'legR.x': -sw * 0.75, 'armL.x': -sw * 0.6, 'armR.x': sw * 0.6,
      'earL.z': -0.1, 'earR.z': 0.1,
      ...tailSway(p, 0.3, 1), 'tail1.x': 0.15, ...blink(t),
    };
  },
  run: (t, c) => {
    const p = c.phase;
    const sw = S(p);
    return {
      'hips.py': Math.max(0, S(p)) * 0.08, 'hips.x': 0.32 + Co(p) * 0.08, 'hips.z': -c.turn * 0.2,
      'head.x': -0.3 - Co(p) * 0.06,
      'legL.x': sw * 1.05, 'legR.x': S(p + 0.6) * 1.05, 'armL.x': -S(p + 0.3) * 1.0 - 0.3, 'armR.x': -S(p + 0.9) * 1.0 - 0.3,
      'earL.x': -0.4, 'earR.x': -0.4, 'earL.z': 0.2, 'earR.z': -0.2,
      'tail1.x': 0.55, 'tail2.x': -0.1, 'tail3.x': -0.15, 'tail1.y': S(p) * 0.15, 'tail2.y': S(p - 0.8) * 0.2, ...blink(t),
    };
  },
  sneak: (t, c) => {
    const p = c.phase;
    const sw = S(p);
    const look = S(t * 1.3) * 0.35;
    return {
      'hips.py': -0.06 + Math.abs(Co(p)) * 0.012, 'hips.x': 0.42, 'hips.z': sw * 0.05,
      'head.x': -0.32, 'head.y': look, 'legL.x': sw * 0.5 - 0.2, 'legR.x': -sw * 0.5 - 0.2,
      'armL.x': -1.0 - sw * 0.25, 'armR.x': -1.0 + sw * 0.25, 'armL.z': -0.1, 'armR.z': 0.1,
      'earL.x': -0.3, 'earR.x': -0.3, 'tail1.x': 0.75, 'tail2.x': 0.0, 'tail1.y': sw * 0.12, ...blink(t),
    };
  },
  hide: (t) => {
    const peek = Math.max(0, S(t * 0.8)) > 0.8 ? 1 : 0;
    return {
      'hips.py': -0.1, 'hips.x': 0.55, 'head.x': -0.45 + peek * 0.25, 'head.y': S(t * 0.5) * 0.6 * peek,
      'legL.x': -0.9, 'legR.x': -0.9, 'armL.x': -1.4, 'armR.x': -1.4, 'armL.z': -0.4, 'armR.z': 0.4,
      'earL.x': -0.5, 'earR.x': -0.5, 'tail1.x': 1.0, 'tail2.x': 0.5, 'tail3.x': 0.4, ...blink(t),
    };
  },
  jump: (t, c) => {
    const up = THREE.MathUtils.clamp(c.vy / 4, -1, 1);
    return {
      'hips.x': -up * 0.2, 'legL.x': -0.6 + up * 0.3, 'legR.x': -0.4 + up * 0.3, 'armL.x': -1.6 * Math.max(0, up) - 0.3, 'armR.x': -1.6 * Math.max(0, up) - 0.3,
      'armL.z': -0.6, 'armR.z': 0.6, 'earL.x': up * 0.4, 'earR.x': up * 0.4, 'tail1.x': -up * 0.5, 'head.x': -up * 0.15,
    };
  },
  pickup: (t) => {
    const k = t < 0.25 ? ease(t / 0.25) : t < 0.45 ? 1 : 1 - ease(clamp01((t - 0.45) / 0.3));
    return {
      'hips.py': -0.06 * k, 'hips.x': 0.75 * k, 'head.x': -0.2 * k, 'armL.x': -1.3 * k, 'armR.x': -1.3 * k,
      'armL.z': 0.2 * k, 'armR.z': -0.2 * k, 'tail1.x': 0.6 * k, 'legL.x': -0.3 * k, 'legR.x': -0.3 * k,
    };
  },
  eat: (t) => {
    const chew = S(t * 22) * 0.08;
    return {
      'body.py': -0.05, 'hips.x': -0.25, 'legL.x': -1.3, 'legR.x': -1.3, 'head.x': 0.15 + chew,
      'armL.x': -2.2, 'armR.x': -2.2, 'armL.z': -0.45, 'armR.z': 0.45, 'armL.y': 0.3, 'armR.y': -0.3,
      'earL.z': S(t * 11) * 0.12, 'earR.z': -S(t * 11) * 0.12, 'eyes.sy': 0.25 + Math.abs(S(t * 3)) * 0.2, ...tailSway(t, 0.45, 5),
    };
  },
  celebrate: (t) => {
    const hop = Math.max(0, S(t * 9)) * 0.12;
    return {
      'body.py': hop, 'body.y': ease(clamp01(t / 0.9)) * Math.PI * 2, 'armL.x': -2.6, 'armR.x': -2.6, 'armL.z': -0.5 + S(t * 18) * 0.25, 'armR.z': 0.5 - S(t * 18) * 0.25,
      'head.x': 0.25, 'earL.z': -0.3, 'earR.z': 0.3, ...tailSway(t, 0.6, 12), 'eyes.sy': 0.3,
    };
  },
  surprise: (t) => {
    const k = t < 0.12 ? t / 0.12 : 1 - clamp01((t - 0.6) / 0.3);
    return {
      'body.py': S(clamp01(t / 0.35) * Math.PI) * 0.12, 'hips.x': -0.3 * k, 'armL.x': -2.2 * k, 'armR.x': -2.2 * k, 'armL.z': -0.8 * k, 'armR.z': 0.8 * k,
      'earL.x': 0.4 * k, 'earR.x': 0.4 * k, 'earL.z': -0.2 * k, 'earR.z': 0.2 * k, 'eyes.s': 1 + 0.35 * k, 'tail1.x': -0.6 * k, 'tail2.x': -0.4 * k, 'head.x': 0.2 * k,
    };
  },
  interact: (t) => {
    const k = t < 0.2 ? ease(t / 0.2) : 1 - ease(clamp01((t - 0.55) / 0.25));
    return {
      'hips.x': 0.35 * k, 'head.x': -0.15 * k, 'head.z': S(t * 9) * 0.1 * k, 'armR.x': (-1.5 + S(t * 16) * 0.25) * k, 'armL.x': -0.6 * k,
      ...tailSway(t, 0.3, 4),
    };
  },
  fall: (t) => {
    const k = t < 0.3 ? ease(t / 0.3) : t < 1.2 ? 1 : 1 - ease(clamp01((t - 1.2) / 0.35));
    return {
      'body.x': -1.45 * k, 'body.py': 0.12 * k, 'legL.x': -1.4 * k + S(t * 14) * 0.3 * k, 'legR.x': -1.4 * k - S(t * 14) * 0.3 * k,
      'armL.x': -2.4 * k, 'armR.x': -2.4 * k, 'armL.z': -0.7 * k, 'armR.z': 0.7 * k, 'head.y': S(t * 7) * 0.5 * k, 'eyes.sy': 1 - 0.85 * k,
      'tail1.x': 0.8 * k,
    };
  },
  sit: (t) => ({ 'body.py': -0.06, 'hips.x': -0.15, 'legL.x': -1.4, 'legR.x': -1.4, 'armL.x': -0.4, 'armR.x': -0.4, ...tailSway(t, 0.25, 1.4), ...blink(t) }),
  row: (t, c) => {
    const p = t * (c.speed > 0.3 ? 6 : 1.5);
    return {
      'body.py': -0.06, 'hips.x': -0.15 + S(p) * 0.15, 'legL.x': -1.4, 'legR.x': -1.4,
      'armL.x': -1.2 + S(p) * 0.7, 'armR.x': -1.2 + S(p) * 0.7, 'armL.z': -0.3, 'armR.z': 0.3, ...blink(t),
    };
  },
  dig: (t) => ({
    'hips.x': 0.7, 'hips.py': -0.05, 'head.x': -0.3, 'armL.x': -1.0 + S(t * 16) * 0.7, 'armR.x': -1.0 - S(t * 16) * 0.7,
    'legL.x': -0.4, 'legR.x': -0.4, ...tailSway(t, 0.5, 10),
  }),
  shake: (t) => ({
    'hips.x': 0.15, 'hips.z': S(t * 20) * 0.12, 'armL.x': -1.7 + S(t * 20) * 0.25, 'armR.x': -1.7 - S(t * 20) * 0.25, 'head.x': 0.15, ...tailSway(t, 0.4, 12),
  }),
  fish: (t) => ({
    'body.py': -0.06, 'hips.x': -0.1, 'legL.x': -1.4, 'legR.x': -1.4, 'armL.x': -1.0, 'armR.x': -1.1 + S(t * 1.5) * 0.04, 'armL.z': -0.25, 'armR.z': 0.25,
    'head.x': 0.05 + S(t * 0.8) * 0.04, ...tailSway(t, 0.25, 1.3), ...blink(t),
  }),
  sleep: (t) => ({
    'body.py': -0.08, 'body.z': 1.3, 'body.px': 0.1, 'legL.x': -0.8, 'legR.x': -0.8, 'armL.x': -0.6, 'armR.x': -0.6, 'eyes.sy': 0.08, 'hips.py': S(t * 1.5) * 0.005,
    'tail1.x': 0.6, 'tail1.y': 1.0,
  }),
};
