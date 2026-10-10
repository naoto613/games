import { BALANCE } from '../../data/balance';
import { getSpecies } from '../../data/monsters';
import { getSkill } from '../../data/skills';
import { STAT_KEYS, type MonsterSpecies, type StatKey, type Stats } from '../../data/types';
import { clamp, randomBetween, type Rng } from '../../core/Random';
import type { MonsterInstance } from './types';

const G = BALANCE.growth;

export function maxLevelOf(m: Pick<MonsterInstance, 'speciesId' | 'plusValue'>): number {
  const sp = getSpecies(m.speciesId);
  return Math.min(sp.absoluteLevelCap, sp.baseLevelCap + m.plusValue * BALANCE.breeding.plusLevelBonus);
}

/** レベル L に到達するのに必要な累計経験値 */
export function expForLevel(sp: MonsterSpecies, level: number): number {
  if (level <= 1) return 0;
  return Math.floor(G.expBase * sp.expRate * Math.pow(level - 1, G.expPow));
}

function curveMultiplier(sp: MonsterSpecies, stat: StatKey, level: number): number {
  const [a, b] = G.curves[sp.growthCurves[stat] ?? 'normal'];
  const t = clamp((level - 2) / Math.max(1, sp.baseLevelCap - 2), 0, 1);
  return a + (b - a) * t;
}

/** level-1 → level に上がるときの平均的な伸び */
export function expectedGain(sp: MonsterSpecies, stat: StatKey, level: number, plus: number): number {
  return sp.growth[stat] * curveMultiplier(sp, stat, level) * (1 + plus * G.plusGrowthBonus);
}

/** 乱数を使わない平均的な能力（敵モンスター用） */
export function averageStatsAtLevel(sp: MonsterSpecies, level: number, plus = 0): Stats {
  const out = { ...sp.baseStats };
  for (let L = 2; L <= level; L++) for (const k of STAT_KEYS) out[k] += expectedGain(sp, k, L, plus);
  for (const k of STAT_KEYS) out[k] = Math.min(sp.statCaps[k], Math.round(out[k]));
  return out;
}

export type LevelUpEvent = {
  level: number;
  gains: Stats;
  learned: string[];
  pending: string[];
  upgraded: { from: string; to: string }[];
};

/** 1 レベル上げる（能力の伸び・特技の習得・特技の変化）。新しい個体を返す。 */
export function levelUpOnce(m: MonsterInstance, rng: Rng): { monster: MonsterInstance; event: LevelUpEvent } {
  const sp = getSpecies(m.speciesId);
  const level = m.level + 1;
  const stats = { ...m.stats };
  const gains = {} as Stats;
  for (const k of STAT_KEYS) {
    const g = expectedGain(sp, k, level, m.plusValue) * randomBetween(rng, G.varianceMin, G.varianceMax);
    const inc = Math.floor(g + rng.next()); // 確率的な四捨五入で平均を保つ
    const next = Math.min(sp.statCaps[k], stats[k] + inc);
    gains[k] = next - stats[k];
    stats[k] = next;
  }
  let monster: MonsterInstance = {
    ...m,
    level,
    stats,
    // 増えた最大HP・最大MPのぶんだけ現在値も増やす
    hp: m.hp > 0 ? Math.min(stats.hp, m.hp + gains.hp) : 0,
    mp: Math.min(stats.mp, m.mp + gains.mp),
  };
  const learned: string[] = [];
  const pending: string[] = [];
  for (const e of sp.learnset) {
    if (e.level !== level) continue;
    const r = learnSkill(monster, e.skillId);
    monster = r.monster;
    if (r.result === 'learned') learned.push(e.skillId);
    else if (r.result === 'full') pending.push(e.skillId);
  }
  const up = applySkillUpgrades(monster);
  monster = up.monster;
  return { monster, event: { level, gains, learned, pending, upgraded: up.upgraded } };
}

/** 経験値を加え、必要なだけ順番にレベルアップする。レベル上限では経験値が増えない。 */
export function gainExperience(m: MonsterInstance, exp: number, rng: Rng): { monster: MonsterInstance; events: LevelUpEvent[] } {
  const sp = getSpecies(m.speciesId);
  const cap = maxLevelOf(m);
  const capExp = expForLevel(sp, cap);
  let monster: MonsterInstance = { ...m, experience: Math.min(capExp, m.experience + Math.max(0, Math.floor(exp))) };
  const events: LevelUpEvent[] = [];
  while (monster.level < cap && monster.experience >= expForLevel(sp, monster.level + 1)) {
    const r = levelUpOnce(monster, rng);
    monster = r.monster;
    events.push(r.event);
  }
  return { monster, events };
}

export type LearnResult = 'learned' | 'duplicate' | 'full';
export function learnSkill(m: MonsterInstance, skillId: string): { monster: MonsterInstance; result: LearnResult } {
  if (hasSkillOrUpgrade(m.skills, skillId)) return { monster: m, result: 'duplicate' };
  if (m.skills.length >= BALANCE.maxSkillSlots) {
    if (m.pendingSkills.includes(skillId)) return { monster: m, result: 'full' };
    return { monster: { ...m, pendingSkills: [...m.pendingSkills, skillId] }, result: 'full' };
  }
  return { monster: { ...m, skills: [...m.skills, skillId] }, result: 'learned' };
}

/** すでに上位の特技を持っているなら、下位の特技は重複とみなす */
export function hasSkillOrUpgrade(skills: readonly string[], skillId: string): boolean {
  let id: string | undefined = skillId;
  const seen = new Set<string>();
  while (id && !seen.has(id)) {
    if (skills.includes(id)) return true;
    seen.add(id);
    id = getSkill(id).upgrade?.to;
  }
  return false;
}

/** 条件（レベル・能力）を満たした特技を上位の特技に変える */
export function applySkillUpgrades(m: MonsterInstance): { monster: MonsterInstance; upgraded: { from: string; to: string }[] } {
  const upgraded: { from: string; to: string }[] = [];
  let skills = [...m.skills];
  let changed = true;
  while (changed) {
    changed = false;
    skills = skills.map((id) => {
      const up = getSkill(id).upgrade;
      if (!up || m.level < up.level) return id;
      for (const [k, v] of Object.entries(up.stat)) if (m.stats[k as StatKey] < (v ?? 0)) return id;
      if (skills.includes(up.to)) return id;
      upgraded.push({ from: id, to: up.to });
      changed = true;
      return up.to;
    });
  }
  return { monster: upgraded.length ? { ...m, skills } : m, upgraded };
}

/** 保留中の特技を、指定した特技と入れかえて覚える（forget=null なら覚えるのをあきらめる） */
export function resolvePendingSkill(m: MonsterInstance, skillId: string, forget: string | null): MonsterInstance {
  const pendingSkills = m.pendingSkills.filter((s) => s !== skillId);
  if (forget === null || !m.skills.includes(forget)) return { ...m, pendingSkills };
  return { ...m, pendingSkills, skills: m.skills.map((s) => (s === forget ? skillId : s)) };
}

export const expToNextLevel = (m: MonsterInstance): number | null => {
  if (m.level >= maxLevelOf(m)) return null;
  return expForLevel(getSpecies(m.speciesId), m.level + 1) - m.experience;
};
