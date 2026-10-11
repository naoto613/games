import { BALANCE } from '../../data/balance';
import { FAMILIES, getSpecies } from '../../data/monsters';
import { getSkill } from '../../data/skills';
import type { MonsterSpecies, Resistances } from '../../data/types';
import { newId } from '../../core/Id';
import type { Rng } from '../../core/Random';
import { applySkillUpgrades, expForLevel, levelUpOnce } from './Growth';
import type { MonsterInstance, Sex } from './types';

export function speciesResistances(sp: MonsterSpecies): Resistances {
  return { ...FAMILIES[sp.familyId].baseResistances, ...sp.resistances };
}

/** レベル L までに覚える特技（新しいものを優先して最大枠まで） */
export function learnedSkillsAtLevel(sp: MonsterSpecies, level: number): string[] {
  const ids = sp.learnset.filter((e) => e.level <= level).map((e) => e.skillId);
  return ids.slice(-BALANCE.maxSkillSlots);
}

export type CreateOptions = {
  level?: number;
  sex?: Sex;
  plusValue?: number;
  wildness?: number;
  obtainedFrom?: string;
  existingIds?: { has(id: string): boolean };
  now?: number;
};

/** 個体を生成する。Lv1 から順にレベルアップさせて、能力のばらつきを自然にする。 */
export function createMonster(speciesId: string, rng: Rng, opts: CreateOptions = {}): MonsterInstance {
  const sp = getSpecies(speciesId);
  const plusValue = opts.plusValue ?? 0;
  let m: MonsterInstance = {
    id: newId('m', rng, opts.existingIds),
    speciesId,
    sex: opts.sex ?? (rng.next() < 0.5 ? 'A' : 'B'),
    level: 1,
    experience: 0,
    plusValue,
    stats: { ...sp.baseStats },
    hp: sp.baseStats.hp,
    mp: sp.baseStats.mp,
    skills: learnedSkillsAtLevel(sp, 1),
    resistances: speciesResistances(sp),
    wildness: opts.wildness ?? 0,
    parentIds: null,
    parentSpeciesIds: null,
    generation: 1,
    obtainedFrom: opts.obtainedFrom ?? 'unknown',
    createdAt: opts.now ?? Date.now(),
    favorite: false,
    pendingSkills: [],
  };
  const target = Math.max(1, Math.min(opts.level ?? 1, sp.absoluteLevelCap));
  while (m.level < target) m = levelUpOnce(m, rng).monster;
  m = { ...m, experience: expForLevel(sp, m.level), hp: m.stats.hp, mp: m.stats.mp, pendingSkills: [] };
  // 生成時は覚えきれなかった特技を捨て、新しいものを優先する
  m.skills = learnedSkillsAtLevel(sp, m.level).filter((id, i, a) => a.indexOf(id) === i);
  return applySkillUpgrades(m).monster;
}

export const displayName = (m: Pick<MonsterInstance, 'speciesId' | 'nickname'>) => m.nickname || getSpecies(m.speciesId).name;
export const skillName = (id: string) => getSkill(id).name;
