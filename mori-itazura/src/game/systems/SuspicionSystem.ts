// 視界と警戒度（設計書 8.3・8.4）。距離・向き・視野角・遮蔽物・主人公の行動状態から判定する。
import type { NPC } from '../entities/NPC';
import type { Player } from '../entities/Player';
import type { CollisionSystem } from '../world/CollisionSystem';
import { disguiseModifier } from '../content/characters/npcs';

export const SUSPICION = { normal: 20, alert: 50, chase: 80, max: 100 };

export function levelOf(v: number): 'normal' | 'odd' | 'alert' | 'chase' {
  if (v >= SUSPICION.chase) return 'chase';
  if (v >= SUSPICION.alert) return 'alert';
  if (v >= SUSPICION.normal) return 'odd';
  return 'normal';
}

export interface VisionInput {
  npcX: number; npcZ: number; facing: number; eyeH: number;
  range: number; fov: number;
  px: number; pz: number; pH: number;
  hidden: boolean; underTable: boolean; sneaking: boolean; night: number;
  chasing: boolean;
}

/** 純粋な視界判定（遮蔽物の判定は los で渡す） */
export function canSee(v: VisionInput, los: (ax: number, az: number, eyeH: number, bx: number, bz: number, th: number) => boolean) {
  const dx = v.px - v.npcX, dz = v.pz - v.npcZ;
  const d = Math.hypot(dx, dz);
  if (v.hidden && !(v.underTable && d < 0.8)) return { seen: false, d };
  let range = v.range * (v.sneaking ? 0.62 : 1) * (1 - v.night * 0.3);
  if (v.chasing) range *= 1.35;
  if (d > range) return { seen: false, d };
  if (d > 1.0) {
    const fx = Math.sin(v.facing), fz = Math.cos(v.facing);
    const cos = (dx * fx + dz * fz) / (d || 1);
    const half = ((v.chasing ? Math.max(v.fov, 160) : v.fov) / 2) * (Math.PI / 180);
    if (cos < Math.cos(half)) return { seen: false, d };
  }
  if (!los(v.npcX, v.npcZ, v.eyeH, v.px, v.pz, v.pH)) return { seen: false, d };
  return { seen: true, d, range };
}

export interface RateInput {
  baseRate: number; d: number; range: number;
  running: boolean; sneaking: boolean; recentTheft: boolean; nearOwnedFood: boolean;
  disguiseMod: number;
}

/** 見られている間の警戒度の上がり方（毎秒） */
export function suspicionRate(r: RateInput) {
  const dist = Math.max(0.2, Math.min(1, 1.2 - r.d / r.range));
  let behavior = 1;
  if (r.running) behavior *= 1.4;
  if (r.sneaking) behavior *= 0.6;
  if (r.nearOwnedFood) behavior *= 1.8;
  let mod = r.disguiseMod;
  // 変装していても、不審な行動をすれば警戒される
  if (r.recentTheft) { behavior *= 3; mod = Math.max(mod, 0.6); }
  return r.baseRate * dist * behavior * mod;
}

export class SuspicionSystem {
  constructor(private col: CollisionSystem) {}

  vision(n: NPC, p: Player, night: number) {
    const s = n.def.look.scale ?? 1;
    return canSee({
      npcX: n.pos.x, npcZ: n.pos.z, facing: n.facing + (n.lookAt ?? 0) * 0, eyeH: (n.seated ? 1.1 : 1.4) * s,
      range: n.def.vision.range, fov: n.def.vision.fov,
      px: p.pos.x, pz: p.pos.z, pH: p.inBoat ? 0.6 : p.sneaking ? 0.3 : 0.45,
      hidden: p.hidden, underTable: p.underTable, sneaking: p.sneaking, night, chasing: n.state === 'Chasing',
    }, (ax, az, eh, bx, bz, th) => this.col.lineOfSight(ax, az, eh, bx, bz, th));
  }

  rate(n: NPC, p: Player, d: number, range: number, nearOwnedFood: boolean) {
    return suspicionRate({
      baseRate: n.def.vision.rate, d, range,
      running: p.running, sneaking: p.sneaking, recentTheft: p.recentTheft > 0, nearOwnedFood,
      disguiseMod: disguiseModifier(p.outfitId, n.def.role),
    });
  }
}
