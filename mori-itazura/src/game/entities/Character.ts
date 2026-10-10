// キャラクター共通：位置・向き・足の運びの位相・接地影・アニメーション適用
import * as THREE from 'three';
import { Rig, Animator, AnimCtx, Pose } from './Rig';

let blobTex: THREE.Texture | null = null;
function blobTexture() {
  if (blobTex) return blobTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(0,0,0,0.55)');
  gr.addColorStop(0.55, 'rgba(0,0,0,0.25)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  blobTex = new THREE.CanvasTexture(c);
  return blobTex;
}

export class Character<A extends string> {
  readonly obj = new THREE.Group();
  readonly pos = new THREE.Vector3();
  facing = 0;
  speed = 0;          // 実際の水平速度
  phase = 0;
  turnRate = 0;
  vy = 0;
  lift = 0;           // ジャンプの高さ
  groundY = 0;
  stride = 0.5;       // 1 周期で進む距離
  height = 1;
  readonly anim: Animator<A>;
  readonly blob: THREE.Mesh;
  protected ctx: AnimCtx = { phase: 0, speed: 0, turn: 0, vy: 0, time: 0, look: 0 };
  extraPose: Pose | null = null;

  constructor(readonly rig: Rig, clips: Record<A, (t: number, c: AnimCtx) => Pose>, initial: A, blobSize: number) {
    this.anim = new Animator(clips, initial);
    this.obj.add(rig.root);
    this.blob = new THREE.Mesh(
      new THREE.PlaneGeometry(blobSize, blobSize).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, opacity: 0.6 }),
    );
    this.blob.renderOrder = 2;
  }

  /** 向きをなめらかに目標角へ近づける */
  turnTowards(target: number, dt: number, rate = 12) {
    let d = target - this.facing;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    const step = d * Math.min(1, dt * rate);
    this.facing += step;
    this.turnRate = THREE.MathUtils.lerp(this.turnRate, dt > 0 ? step / dt : 0, Math.min(1, dt * 8));
    return Math.abs(d);
  }

  updateVisual(dt: number, time: number) {
    this.phase += (this.speed * dt) / this.stride * Math.PI * 2 * 0.5;
    const c = this.ctx;
    c.phase = this.phase; c.speed = this.speed; c.turn = THREE.MathUtils.clamp(this.turnRate / 6, -1, 1); c.vy = this.vy; c.time = time;
    const pose = this.anim.update(dt, c);
    if (this.extraPose) for (const k in this.extraPose) pose[k] = (pose[k] ?? 0) + this.extraPose[k];
    this.rig.apply(pose);
    this.obj.position.set(this.pos.x, this.pos.y + this.lift, this.pos.z);
    this.obj.rotation.y = this.facing;
    this.blob.position.set(this.pos.x, this.groundY + 0.03, this.pos.z);
    const k = Math.max(0.35, 1 - this.lift * 0.8);
    this.blob.scale.setScalar(k);
    (this.blob.material as THREE.MeshBasicMaterial).opacity = 0.6 * k;
  }

  bubbleAnchor() { return { x: this.pos.x, y: this.pos.y + this.lift + this.height, z: this.pos.z }; }

  forward() { return { x: Math.sin(this.facing), z: Math.cos(this.facing) }; }
}
