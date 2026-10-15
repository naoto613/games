// v2 の モンスター定義（MonsterDefinition）を 戦闘・成長・配合の エンジンが つかう 種族（MonsterSpecies）に かえる。
import type { GrowthCurve, MonsterSpecies, StatKey, Stats } from '../types';
import { BALANCE } from '../balance';
import { generateLearnset } from './learnsets';
import { MONSTERS2 } from './monsters';
import type { MonsterDefinition, Stats2 } from './types';

const toStats = (s: Stats2): Stats => ({ hp: s.hp, mp: s.mp, attack: s.atk, defense: s.def, speed: s.spd, magic: s.mag, spirit: s.spr });

/** ランクごとの 経験値・ほうしゅう・なかまに なりやすさ・能力の 上限（v1 の TIER を ランク5まで のばした もの） */
const RANK: Record<number, { expRate: number; expYield: number; goldYield: number; recruit: number; cap: number }> = {
  1: { expRate: 1, expYield: 5, goldYield: 4, recruit: 0.14, cap: 300 },
  2: { expRate: 1.25, expYield: 9, goldYield: 7, recruit: 0.07, cap: 400 },
  3: { expRate: 1.5, expYield: 16, goldYield: 12, recruit: 0.03, cap: 520 },
  4: { expRate: 2, expYield: 30, goldYield: 30, recruit: 0.01, cap: 680 },
  5: { expRate: 2.5, expYield: 45, goldYield: 50, recruit: 0, cap: 850 },
};

/** 成長タイプ → 能力ごとの 曲線（攻撃特化・耐久は 能力の かたよりで、変則は 戦闘中の 覚醒で あらわす） */
function curvesOf(d: MonsterDefinition): Partial<Record<StatKey, GrowthCurve>> {
  const all = (c: GrowthCurve) => Object.fromEntries((['hp', 'mp', 'attack', 'defense', 'speed', 'magic', 'spirit'] as StatKey[]).map((k) => [k, c]));
  if (d.growthType === 'early') return all('early');
  if (d.growthType === 'late') return all('late');
  return {};
}

/** Lv1 の 能力に 足す ぶん（伸び × v2HeadStart）。セーブの 移行でも つかう */
export function headStart(growth: Stats): Stats {
  const k = BALANCE.growth.v2HeadStart;
  return Object.fromEntries(Object.entries(growth).map(([s, v]) => [s, Math.round(v * k)])) as Stats;
}
const addStats = (a: Stats, b: Stats): Stats => Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v + b[k as keyof Stats]])) as Stats;

export function speciesFromDefinition(d: MonsterDefinition): MonsterSpecies {
  const r = RANK[d.rank];
  const caps: Stats = { hp: Math.round(r.cap * 1.4), mp: r.cap, attack: r.cap, defense: r.cap, speed: r.cap, magic: r.cap, spirit: r.cap };
  return {
    id: d.id, name: d.name, familyId: d.family, rarity: Math.min(4, d.rank),
    baseStats: addStats(toStats(d.baseStats), headStart(toStats(d.growthRates))), growth: toStats(d.growthRates), growthCurves: curvesOf(d), statCaps: caps,
    resistances: { ...d.resistances }, resistAbsolute: true,
    learnset: generateLearnset(d),
    baseLevelCap: d.levelCap, absoluteLevelCap: 99,
    expRate: r.expRate, expYield: r.expYield, goldYield: r.goldYield, recruitBaseChance: r.recruit,
    spriteId: d.id, description: d.description,
    no: d.no, element: d.element, role: d.role, growthType: d.growthType, rank: d.rank,
    // ボス由来・最終ボス系統は 通常配合では うまれない（特殊配合・伝説配合で）
    noBreed: /ボス|最終/.test(d.note),
  };
}

export const SPECIES2_LIST: MonsterSpecies[] = MONSTERS2.map(speciesFromDefinition);
