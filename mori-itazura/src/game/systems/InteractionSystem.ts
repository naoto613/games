// インタラクションの一元管理（設計書 7）。近くの対象の強調表示・タップ選択・実行・結果の反映を行う。
import * as THREE from 'three';
import type { Interactable, InteractionResult } from '../entities/Interactable';
import type { GameContext } from '../core/Context';
import type { MovementSystem } from './MovementSystem';
import { GeoBuilder } from '../render/Geo';
import { height } from '../world/Terrain';

export class InteractionSystem {
  focus: Interactable | null = null;
  private marker: THREE.Group;
  private ring: THREE.Mesh;
  private pending: Interactable | null = null;
  onResult: ((i: Interactable, r: InteractionResult) => void) | null = null;

  constructor(private list: () => Interactable[], private move: MovementSystem, scene: THREE.Scene) {
    // 頭上の矢印と足元の輪
    this.marker = new THREE.Group();
    const b = new GeoBuilder();
    b.cone(0.13, 0.22, '#ffd34d', { pos: [0, 0, 0], rot: [Math.PI, 0, 0] }, 4);
    const arrow = new THREE.Mesh(b.build(), new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }));
    this.marker.add(arrow);
    this.marker.renderOrder = 5;
    scene.add(this.marker);
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#fff3b8', transparent: true, opacity: 0.75, depthWrite: false, toneMapped: false }));
    this.ring.renderOrder = 3;
    scene.add(this.ring);
  }

  private dist(ctx: GameContext, i: Interactable) {
    return Math.hypot(i.position.x - ctx.player.pos.x, i.position.z - ctx.player.pos.z);
  }

  usable(ctx: GameContext, i: Interactable) {
    if (!i.active(ctx) || !i.canInteract(ctx)) return false;
    if (ctx.player.inBoat && i.id !== 'boat') return false;
    return true;
  }

  update(dt: number, t: number, ctx: GameContext) {
    const p = ctx.player;
    let best: Interactable | null = null, bd = 99;
    if (!p.busy) for (const i of this.list()) {
      if (!this.usable(ctx, i)) continue;
      const d = this.dist(ctx, i);
      if (d > i.reach + 0.25) continue;
      // 正面にあるものを少し優先
      const fx = Math.sin(p.facing), fz = Math.cos(p.facing);
      const dot = ((i.position.x - p.pos.x) * fx + (i.position.z - p.pos.z) * fz) / (d || 1);
      const score = d - dot * 0.25;
      if (score < bd) { bd = score; best = i; }
    }
    this.focus = best;
    this.marker.visible = !!best;
    this.ring.visible = !!best && best.type !== 'npc';
    if (best) {
      const y = (best.object ? best.object.getWorldPosition(new THREE.Vector3()).y : best.position.y) + best.markerY;
      const by = best.type === 'npc' ? best.position.y + best.markerY : Math.max(y, best.position.y + best.markerY);
      this.marker.position.set(best.position.x, by + 0.15 + Math.sin(t * 5) * 0.06, best.position.z);
      this.marker.rotation.y = t * 2;
      this.ring.position.set(best.position.x, height(best.position.x, best.position.z) + 0.04, best.position.z);
      if (best.id === 'fishspot' || best.id.startsWith('pick:') && best.position.y > 0.3) this.ring.position.y = best.position.y + 0.02;
      const s = 1 + Math.sin(t * 4) * 0.06;
      this.ring.scale.setScalar(s * (best.type === 'food' || best.type === 'pickup' ? 0.8 : 1.3));
    }
    // 目的地に着いたら実行
    if (this.pending && !this.move.path.length && !this.move.onArrive) this.pending = null;
  }

  /** 画面タップ：対象物を選ぶ。なければ地面へ歩く */
  tap(sx: number, sy: number, camera: THREE.Camera, w: number, h: number, ctx: GameContext) {
    const p = ctx.player;
    if (p.busy) return;
    let best: Interactable | null = null, bd = 64;
    const v = new THREE.Vector3();
    for (const i of this.list()) {
      if (!this.usable(ctx, i)) continue;
      for (const yy of [0.2, i.markerY * 0.6]) {
        v.set(i.position.x, i.position.y + yy, i.position.z).project(camera);
        if (v.z > 1) continue;
        const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
        const d = Math.hypot(x - sx, y - sy);
        if (d < bd) { bd = d; best = i; }
      }
    }
    if (best) {
      if (this.dist(ctx, best) <= best.reach + 0.1) this.run(best, ctx);
      else if (!p.inBoat) {
        const target = best;
        const ok = this.move.goTo(p, target.position.x, target.position.z, Math.max(0.3, target.reach - 0.25), () => {
          if (this.dist(ctx, target) <= target.reach + 0.35 && this.usable(ctx, target)) this.run(target, ctx);
        });
        if (ok) this.pending = target;
      }
      return;
    }
    // 地面
    if (p.inBoat) return;
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2((sx / w) * 2 - 1, -(sy / h) * 2 + 1), camera);
    const o = ray.ray.origin, d = ray.ray.direction;
    let tt = (0 - o.y) / d.y;
    for (let k = 0; k < 4; k++) { const x = o.x + d.x * tt, z = o.z + d.z * tt; tt = (height(x, z) - o.y) / d.y; }
    const gx = o.x + d.x * tt, gz = o.z + d.z * tt;
    if (Math.hypot(gx - p.pos.x, gz - p.pos.z) < 40) this.move.goTo(p, gx, gz, 0.25);
  }

  /** 決定ボタン */
  act(ctx: GameContext) {
    if (this.focus) this.run(this.focus, ctx);
  }

  run(i: Interactable, ctx: GameContext) {
    const p = ctx.player;
    if (p.busy || !this.usable(ctx, i)) return;
    this.move.stop();
    if (i.type !== 'vehicle') p.facing = Math.atan2(i.position.x - p.pos.x, i.position.z - p.pos.z);
    const r = i.interact(ctx);
    this.onResult?.(i, r);
  }
}
