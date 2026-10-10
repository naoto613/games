// 斜め上からの三人称カメラ。主人公をなめらかに追い、進行方向を少し先読みする。
import * as THREE from 'three';

export class CameraController {
  readonly camera: THREE.PerspectiveCamera;
  elevation = THREE.MathUtils.degToRad(40);
  private target = new THREE.Vector3();
  private look = new THREE.Vector3();
  private dist = 12;
  zoom = 1;
  mode: 'follow' | 'orbit' = 'orbit';
  private orbitT = 0;
  shake = 0;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.3, 220);
  }

  resize(w: number, h: number) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** 画面の向きに合わせて、横方向にも十分な範囲が見える距離 */
  private baseDistance() {
    const a = this.camera.aspect;
    const vf = THREE.MathUtils.degToRad(this.camera.fov) / 2;
    const hf = Math.atan(Math.tan(vf) * a);
    const needW = 5.2;     // 左右に見せたい半幅（m）
    const needH = 3.6;     // 上下に見せたい半高さ（m）
    const dW = needW / Math.tan(hf);
    const dH = needH / Math.tan(vf);
    return THREE.MathUtils.clamp(Math.max(dW, dH, 10.5), 10.5, 22);
  }

  snap(p: THREE.Vector3) {
    this.target.copy(p);
    this.look.copy(p);
    this.dist = this.baseDistance() * this.zoom;
    this.apply();
  }

  update(dt: number, p: THREE.Vector3, vel: THREE.Vector2, extraZoom = 1) {
    if (this.mode === 'orbit') {
      this.orbitT += dt * 0.05;
      const c = new THREE.Vector3(-6, 0, 8);
      const r = 18;
      this.camera.position.set(c.x + Math.cos(this.orbitT) * r, 11, c.z + Math.sin(this.orbitT) * r);
      this.camera.lookAt(c.x, 1.2, c.z);
      return;
    }
    // 先読み（移動方向へ少しずらす）
    const lead = new THREE.Vector3(vel.x * 0.35, 0, vel.y * 0.3);
    if (lead.length() > 1.4) lead.setLength(1.4);
    const goal = p.clone().add(lead);
    const r = Math.hypot(goal.x, goal.z);
    if (r > 36) { goal.x *= 36 / r; goal.z *= 36 / r; }
    const k = 1 - Math.exp(-dt * 4.5);
    this.target.lerp(goal, k);
    this.look.lerp(p, 1 - Math.exp(-dt * 8));
    const want = this.baseDistance() * this.zoom * extraZoom;
    this.dist += (want - this.dist) * (1 - Math.exp(-dt * 3));
    this.apply();
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt);
      this.camera.position.x += (Math.random() - 0.5) * this.shake * 0.3;
      this.camera.position.y += (Math.random() - 0.5) * this.shake * 0.3;
    }
  }

  private apply() {
    const t = this.target;
    const e = this.elevation;
    this.camera.position.set(t.x, t.y + 0.4 + Math.sin(e) * this.dist, t.z + Math.cos(e) * this.dist);
    this.camera.lookAt(t.x, t.y + 0.4, t.z);
  }
}
