// 関節（Object3D）の階層と、ポーズ（関節ごとの回転・位置の差分）の合成。
import * as THREE from 'three';

/** 'head.x' のように「関節名.軸」で回転（ラジアン）、'hips.py' で位置の差分を表す */
export type Pose = Record<string, number>;

export class Rig {
  readonly root = new THREE.Group();
  readonly joints: Record<string, THREE.Object3D> = {};
  private restRot: Record<string, THREE.Euler> = {};
  private restPos: Record<string, THREE.Vector3> = {};
  private restScale: Record<string, THREE.Vector3> = {};

  joint(name: string, parent: THREE.Object3D | string, pos: [number, number, number], rot: [number, number, number] = [0, 0, 0]) {
    const j = new THREE.Group();
    j.name = name;
    j.position.set(...pos);
    j.rotation.set(rot[0], rot[1], rot[2], 'YXZ');
    const p = typeof parent === 'string' ? this.joints[parent] : parent;
    p.add(j);
    this.joints[name] = j;
    this.restRot[name] = j.rotation.clone();
    this.restPos[name] = j.position.clone();
    this.restScale[name] = j.scale.clone();
    return j;
  }

  attach(joint: string, mesh: THREE.Object3D) { this.joints[joint].add(mesh); return mesh; }

  apply(pose: Pose) {
    for (const name in this.joints) {
      const j = this.joints[name];
      const r = this.restRot[name], p = this.restPos[name], s = this.restScale[name];
      j.rotation.set(r.x + (pose[name + '.x'] ?? 0), r.y + (pose[name + '.y'] ?? 0), r.z + (pose[name + '.z'] ?? 0), 'YXZ');
      j.position.set(p.x + (pose[name + '.px'] ?? 0), p.y + (pose[name + '.py'] ?? 0), p.z + (pose[name + '.pz'] ?? 0));
      const sc = pose[name + '.s'];
      const sy = pose[name + '.sy'];
      if (sc !== undefined || sy !== undefined) j.scale.set(s.x * (sc ?? 1), s.y * (sc ?? 1) * (sy ?? 1), s.z * (sc ?? 1));
      else j.scale.copy(s);
    }
  }
}

export function blend(a: Pose, b: Pose, t: number, out: Pose = {}): Pose {
  for (const k in out) delete out[k];
  for (const k in a) out[k] = a[k] * (1 - t) + (b[k] ?? defaultOf(k)) * t;
  for (const k in b) if (!(k in a)) out[k] = defaultOf(k) * (1 - t) + b[k] * t;
  return out;
}
function defaultOf(k: string) { return k.endsWith('.s') || k.endsWith('.sy') ? 1 : 0; }

export function addPose(base: Pose, add: Pose, w = 1) {
  for (const k in add) {
    if (k.endsWith('.s') || k.endsWith('.sy')) base[k] = (base[k] ?? 1) * (1 + (add[k] - 1) * w);
    else base[k] = (base[k] ?? 0) + add[k] * w;
  }
  return base;
}

/** 状態ごとのポーズ関数を、なめらかに切り替えながら合成する */
export class Animator<S extends string> {
  state: S;
  private prev: S;
  private fade = 1;
  private fadeDur = 0.2;
  time = 0;
  stateTime = 0;
  private a: Pose = {};
  private b: Pose = {};
  readonly out: Pose = {};

  constructor(private clips: Record<S, (t: number, ctx: AnimCtx) => Pose>, initial: S) {
    this.state = initial; this.prev = initial;
  }

  play(s: S, fade = 0.2) {
    if (s === this.state) return;
    this.prev = this.state; this.state = s;
    this.fade = 0; this.fadeDur = fade; this.prevTime = this.stateTime; this.stateTime = 0;
  }
  private prevTime = 0;

  update(dt: number, ctx: AnimCtx) {
    this.time += dt; this.stateTime += dt; this.prevTime += dt;
    this.fade = Math.min(1, this.fade + dt / Math.max(0.001, this.fadeDur));
    const cur = this.clips[this.state](this.stateTime, ctx);
    if (this.fade >= 1) { blend(cur, {}, 0, this.out); return this.out; }
    const prev = this.clips[this.prev](this.prevTime, ctx);
    const t = this.fade * this.fade * (3 - 2 * this.fade);
    return blend(prev, cur, t, this.out);
  }
}

export interface AnimCtx {
  phase: number;    // 足の運びの位相（移動距離に同期）
  speed: number;    // 実際の移動速度
  turn: number;     // 角速度（体を傾ける）
  vy: number;       // 縦速度（ジャンプ）
  time: number;
  look: number;     // 首をふる量
}
