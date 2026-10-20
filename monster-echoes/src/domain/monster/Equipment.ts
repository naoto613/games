// そうびの こうかを モンスターに かさねる（戦闘に はいる ときだけ。個体の 能力そのものは かえない）。
import type { EquipDef } from '../../data/v2/equipment';
import type { MonsterInstance } from './types';

export function withEquipment(m: MonsterInstance, e: EquipDef | undefined): MonsterInstance {
  if (!e) return m;
  const stats = { ...m.stats };
  for (const [k, v] of Object.entries(e.stats)) stats[k as keyof typeof stats] += v ?? 0;
  const resistances = { ...m.resistances };
  for (const [k, v] of Object.entries(e.resist ?? {})) resistances[k as keyof typeof resistances] = Math.min(3, (resistances[k as keyof typeof resistances] ?? 0) + (v ?? 0));
  return { ...m, stats, resistances };
}
