// 主人公の移動（加速・減速・衝突・向き・ジャンプ・隠れる・タップ移動）とアニメーションの選択
import * as THREE from 'three';
import type { Player } from '../entities/Player';
import type { CollisionSystem } from '../world/CollisionSystem';
import { MASK_PLAYER } from '../world/CollisionSystem';
import type { NavGrid } from '../world/NavGrid';
import type { HideSpot } from '../world/WorldManager';
import { groundY, WATER_Y } from '../world/Terrain';
import { CAMPSITE as L } from '../content/areas/campsite';

export const MOVE = {
  walk: 3.0, run: 4.5, sneak: 1.7, boat: 2.6,
  accelTime: 0.2, decelTime: 0.2,
  radius: 0.22,
  jumpV: 4.3, gravity: 15,
};

export class MovementSystem {
  private vel = new THREE.Vector2();
  path: { x: number; z: number }[] = [];
  onArrive: (() => void) | null = null;
  arriveDist = 0.3;
  private lastHide: string | null = null;

  constructor(private col: CollisionSystem, private nav: NavGrid, private hideSpots: HideSpot[], private insideCabin: (x: number, z: number) => boolean) {}

  /** タップした地点・物まで自動で歩く */
  goTo(p: Player, x: number, z: number, arriveDist = 0.3, onArrive: (() => void) | null = null) {
    const path = this.nav.find(p.pos.x, p.pos.z, x, z);
    if (!path) return false;
    this.path = path;
    this.arriveDist = arriveDist;
    this.onArrive = onArrive;
    return true;
  }
  cancelPath() { this.path = []; this.onArrive = null; }

  jump(p: Player) {
    if (p.lift <= 0.001 && !p.busy && !p.inBoat && !p.hidden) { p.vy = MOVE.jumpV; p.lift = 0.001; }
  }

  update(dt: number, p: Player, inp: { x: number; y: number; run: boolean; active: boolean }, locked: boolean) {
    let dx = 0, dz = 0, want = 0;
    if (!locked && !p.busy) {
      if (inp.active) {
        this.cancelPath();
        dx = inp.x; dz = inp.y;
        const mag = Math.min(1, Math.hypot(dx, dz));
        const l = Math.hypot(dx, dz) || 1;
        dx /= l; dz /= l;
        if (p.inBoat) want = MOVE.boat * mag;
        else if (p.sneaking) want = MOVE.sneak * Math.max(0.5, mag);
        else want = (inp.run ? MOVE.run : MOVE.walk) * Math.max(0.45, mag);
      } else if (this.path.length) {
        const t = this.path[0];
        const ex = t.x - p.pos.x, ez = t.z - p.pos.z;
        const d = Math.hypot(ex, ez);
        const last = this.path.length === 1;
        if (d < (last ? this.arriveDist : 0.35)) {
          this.path.shift();
          if (!this.path.length) { const cb = this.onArrive; this.onArrive = null; cb?.(); }
        } else {
          dx = ex / d; dz = ez / d;
          want = p.sneaking ? MOVE.sneak : MOVE.walk;
          if (last && d < 0.8) want *= Math.max(0.4, d / 0.8);
        }
      }
    }
    if (p.hunger < 12 && !p.inBoat) want *= 0.85;
    // 加速・減速（約 0.2 秒）
    const tx = dx * want, tz = dz * want;
    const cur = this.vel;
    const rate = (want > cur.length() ? MOVE.run / MOVE.accelTime : MOVE.run / MOVE.decelTime) * dt;
    const ddx = tx - cur.x, ddy = tz - cur.y;
    const dl = Math.hypot(ddx, ddy);
    if (dl <= rate) cur.set(tx, tz); else cur.set(cur.x + (ddx / dl) * rate, cur.y + (ddy / dl) * rate);

    const before = { x: p.pos.x, z: p.pos.z };
    const np = { x: p.pos.x + cur.x * dt, z: p.pos.z + cur.y * dt };
    this.col.resolve(np, p.inBoat ? 0.55 : MOVE.radius, MASK_PLAYER, p.inBoat);
    p.pos.x = np.x; p.pos.z = np.z;
    const moved = Math.hypot(np.x - before.x, np.z - before.z);
    p.speed = dt > 0 ? moved / dt : 0;
    if (p.speed < cur.length() * 0.3 && cur.length() > 0.5) cur.multiplyScalar(0.6); // 壁にぶつかったら減速
    if (cur.length() > 0.15) p.turnTowards(Math.atan2(cur.x, cur.y), dt, p.inBoat ? 4 : 14);
    else p.turnTowards(p.facing, dt);

    // 高さ
    if (p.inBoat) { p.groundY = WATER_Y; p.pos.y = WATER_Y + 0.17; }
    else {
      let gy = groundY(p.pos.x, p.pos.z);
      p.insideCabin = this.insideCabin(p.pos.x, p.pos.z);
      if (p.insideCabin) gy = 0.12;
      const c = L.cabin;
      if (Math.abs(p.pos.x - c.pos[0]) < c.w * 0.3 && p.pos.z > c.pos[1] + c.d / 2 && p.pos.z < c.pos[1] + c.d / 2 + 1.6) gy = Math.max(gy, 0.15);
      p.groundY = gy;
      p.pos.y = gy;
    }
    if (p.lift > 0) {
      p.vy -= MOVE.gravity * dt;
      p.lift += p.vy * dt;
      if (p.lift <= 0) { p.lift = 0; p.vy = 0; }
    }

    // 隠れる（茂みの中・テーブルの下）
    let spot: HideSpot | null = null;
    if (!p.inBoat && p.lift <= 0) for (const h of this.hideSpots) {
      if (Math.hypot(p.pos.x - h.x, p.pos.z - h.z) < h.r) { spot = h; break; }
    }
    p.hidden = !!spot && p.speed < 3.6;
    p.underTable = !!spot && spot.kind === 'table';
    p.hideSpot = spot?.id ?? null;
    if (spot && spot.id !== this.lastHide && spot.kind === 'bush') spot.rustle = 0.8;
    this.lastHide = spot?.id ?? null;

    // アニメーション
    if (!p.busy) {
      if (p.inBoat) { p.anim.play('row'); }
      else if (p.lift > 0) p.anim.play('jump', 0.1);
      else if (p.hidden && p.speed < 0.3 && spot?.kind === 'bush') p.anim.play('hide', 0.25);
      else if (p.speed > 0.25) {
        if (p.sneaking || p.underTable) { p.anim.play('sneak'); p.stride = 0.2; }
        else if (p.speed > 3.7) { p.anim.play('run', 0.15); p.stride = 0.55; }
        else { p.anim.play('walk', 0.15); p.stride = 0.3; }
      } else p.anim.play(p.heldItem === 'teddy_bear' ? 'carryIdle' : p.sneaking ? 'hide' : 'idle', 0.25);
    }
    p.running = p.speed > 3.7;
    return cur;
  }

  velocity() { return this.vel; }
  stop() { this.vel.set(0, 0); this.cancelPath(); }
}
