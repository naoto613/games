import { BALANCE } from '../../data/balance';
import { BREEDING_RECIPES } from '../../data/breeding';
import { getSpecies } from '../../data/monsters';
import { getSkill } from '../../data/skills';
import { RESIST_KEYS, STAT_KEYS, type BreedingRecipe, type MonsterSpecies, type Resistances, type SpeciesMatcher, type Stats } from '../../data/types';
import { newId } from '../../core/Id';
import { err, ok, type Result } from '../../core/Result';
import type { Rng } from '../../core/Random';
import { hasSkillOrUpgrade, maxLevelOf } from '../monster/Growth';
import { learnedSkillsAtLevel, speciesResistances } from '../monster/MonsterFactory';
import type { MonsterInstance } from '../monster/types';

const BR = BALANCE.breeding;

// ---------------------------------------------------------------- レシピ解決
function matches(m: SpeciesMatcher, x: MonsterInstance): boolean {
  if ('any' in m) return true;
  if ('speciesId' in m) return m.speciesId === x.speciesId;
  const sp = getSpecies(x.speciesId);
  return sp.familyId === m.familyId && (m.maxRarity === undefined || sp.rarity <= m.maxRarity);
}

function conditionsMet(r: BreedingRecipe, a: MonsterInstance, b: MonsterInstance, flags: Record<string, boolean>): boolean {
  return (r.conditions ?? []).every((c) => {
    if (c.type === 'minPlusSum') return a.plusValue + b.plusValue >= c.value;
    if (c.type === 'minLevelSum') return a.level + b.level >= c.value;
    return !!flags[c.id];
  });
}

const KIND_ORDER = { special: 0, familyCombination: 1, fallback: 2 } as const;

/** 子の種族を一意に決める。a が血統（系統を受け継ぐ側）、b が相手。 */
export function resolveChildSpecies(a: MonsterInstance, b: MonsterInstance, flags: Record<string, boolean> = {}, recipes = BREEDING_RECIPES): { speciesId: string; recipe: BreedingRecipe } {
  const sorted = [...recipes].sort((x, y) => KIND_ORDER[x.kind] - KIND_ORDER[y.kind] || y.priority - x.priority || x.id.localeCompare(y.id));
  for (const r of sorted) {
    const fwd = matches(r.parentA, a) && matches(r.parentB, b);
    const rev = !!r.symmetric && matches(r.parentA, b) && matches(r.parentB, a);
    if ((fwd || rev) && conditionsMet(r, a, b, flags)) {
      return { speciesId: r.kind === 'fallback' ? a.speciesId : r.resultSpeciesId, recipe: r };
    }
  }
  return { speciesId: a.speciesId, recipe: recipes[recipes.length - 1] };
}

/** 同じ種族・条件ちがいで、あと少しで別の子になる特殊配合（ヒント表示用） */
export function nearMissRecipes(a: MonsterInstance, b: MonsterInstance, flags: Record<string, boolean> = {}): BreedingRecipe[] {
  return BREEDING_RECIPES.filter((r) => {
    if (r.kind !== 'special' || !r.conditions?.length) return false;
    const fwd = matches(r.parentA, a) && matches(r.parentB, b);
    const rev = !!r.symmetric && matches(r.parentA, b) && matches(r.parentB, a);
    return (fwd || rev) && !conditionsMet(r, a, b, flags);
  });
}

// ---------------------------------------------------------------- 配合できるか
export type BreedingWorld = {
  monsters: MonsterInstance[];
  partyIds: string[];
  capacity: number;
  flags: Record<string, boolean>;
};

export type BreedingError = 'same' | 'missing' | 'sex' | 'level' | 'full';
export const BREEDING_ERROR_TEXT: Record<BreedingError, string> = {
  same: 'おなじ モンスターどうしでは 配合できません。',
  missing: 'モンスターが みつかりません。',
  sex: '♂と♀の くみあわせで ないと 配合できません。',
  level: `レベル${BALANCE.breeding.minLevel} いじょうに なってから 配合できます。`,
  full: 'ぼくじょうが いっぱいです。',
};
/** 配合に必要なレベル（ある程度育てた個体どうしでないと配合できない） */
export const MIN_BREED_LEVEL = BR.minLevel;

export function checkBreedable(w: BreedingWorld, aId: string, bId: string): Result<{ a: MonsterInstance; b: MonsterInstance }, BreedingError> {
  if (aId === bId) return err('same');
  const a = w.monsters.find((m) => m.id === aId);
  const b = w.monsters.find((m) => m.id === bId);
  if (!a || !b) return err('missing');
  if (BR.requireDifferentSex && (a.sex === b.sex || a.sex === 'unknown' || b.sex === 'unknown')) return err('sex');
  if (a.level < MIN_BREED_LEVEL || b.level < MIN_BREED_LEVEL) return err('level');
  // 子1体を作って親2体を除くので、2体→1体。上限をこえることはないが、念のため検証する
  if (w.monsters.length - 2 + 1 > w.capacity) return err('full');
  return ok({ a, b });
}

// ---------------------------------------------------------------- 継承の計算
/** プラス値 = 親の平均 + 親のレベル合計によるボーナス */
export function computeChildPlus(a: MonsterInstance, b: MonsterInstance): number {
  const avg = Math.floor((a.plusValue + b.plusValue) / 2);
  const bonus = Math.min(BR.maxLevelPlus, Math.floor((a.level + b.level) / BR.levelSumPerPlus));
  return avg + bonus;
}

export function childMaxLevel(sp: MonsterSpecies, plus: number): number {
  return Math.min(sp.absoluteLevelCap, sp.baseLevelCap + plus * BR.plusLevelBonus);
}

/** 子の Lv1 能力 = 種族の基礎 + 親の能力の一部（単純な合算はしない） */
export function calculateChildStats(a: MonsterInstance, b: MonsterInstance, sp: MonsterSpecies): Stats {
  const out = {} as Stats;
  for (const k of STAT_KEYS) out[k] = Math.min(sp.statCaps[k], sp.baseStats[k] + Math.floor((a.stats[k] + b.stats[k]) * BR.statInheritanceWeight));
  return out;
}

export function calculateChildResistances(a: MonsterInstance, b: MonsterInstance, sp: MonsterSpecies): Resistances {
  const base = speciesResistances(sp);
  const out: Resistances = {};
  for (const k of RESIST_KEYS) {
    const s = base[k] ?? 0;
    const p = Math.floor(((a.resistances[k] ?? 0) + (b.resistances[k] ?? 0)) / 2);
    const v = Math.max(s, Math.min(s + BR.resistInheritMaxBonus, p, 3));
    if (v !== 0) out[k] = v;
  }
  return out;
}

export type SkillPlan = {
  /** 子が生まれたときに覚えている特技（種族固有） */
  initial: string[];
  /** 親から受け継げる特技 */
  candidates: string[];
  /** 受け継げる数 */
  slots: number;
  /** おすすめの選択（枠に収まる分） */
  recommended: string[];
  /** 将来レベルアップで覚える特技 */
  future: { level: number; skillId: string }[];
};

function skillValue(id: string): number {
  const s = getSkill(id);
  const tier = s.upgrade ? 0 : 10;
  return tier + s.mpCost + (s.target === 'allEnemies' || s.target === 'allAllies' ? 4 : 0) + (s.category === 'revive' ? 8 : 0);
}

export function planInheritance(a: MonsterInstance, b: MonsterInstance, sp: MonsterSpecies): SkillPlan {
  const initial = learnedSkillsAtLevel(sp, 1);
  const pool = [...a.skills, ...b.skills].filter((id, i, arr) => arr.indexOf(id) === i && !getSkill(id).noInherit);
  const candidates = pool.filter((id) => !hasSkillOrUpgrade(initial, id) && !pool.some((o) => o !== id && hasSkillOrUpgrade([o], id)));
  const slots = Math.max(0, BALANCE.maxSkillSlots - initial.length);
  const recommended = [...candidates].sort((x, y) => skillValue(y) - skillValue(x)).slice(0, slots);
  const future = sp.learnset.filter((e) => e.level > 1);
  return { initial, candidates, slots, recommended, future };
}

export type BreedingPreview = {
  speciesId: string;
  recipeKind: BreedingRecipe['kind'];
  plusValue: number;
  maxLevel: number;
  stats: Stats;
  resistances: Resistances;
  skills: SkillPlan;
  generation: number;
  nearMiss: BreedingRecipe[];
};

export function previewBreeding(a: MonsterInstance, b: MonsterInstance, flags: Record<string, boolean> = {}): BreedingPreview {
  const { speciesId, recipe } = resolveChildSpecies(a, b, flags);
  const sp = getSpecies(speciesId);
  const plusValue = computeChildPlus(a, b);
  return {
    speciesId,
    recipeKind: recipe.kind,
    plusValue,
    maxLevel: childMaxLevel(sp, plusValue),
    stats: calculateChildStats(a, b, sp),
    resistances: calculateChildResistances(a, b, sp),
    skills: planInheritance(a, b, sp),
    generation: Math.max(a.generation, b.generation) + 1,
    nearMiss: nearMissRecipes(a, b, flags),
  };
}

export type BreedingHistoryEntry = {
  childId: string;
  childSpeciesId: string;
  parents: { id: string; speciesId: string; level: number; plusValue: number }[];
  at: number;
};

/**
 * 配合を確定する。子の生成と親の除去を1つの処理として行い、
 * 途中で失敗した場合は元の world に一切手を加えない。
 */
export function executeBreeding(
  w: BreedingWorld,
  aId: string,
  bId: string,
  chosenSkills: string[],
  rng: Rng,
  now = Date.now(),
): Result<{ world: BreedingWorld; child: MonsterInstance; history: BreedingHistoryEntry }, BreedingError | 'skills'> {
  const chk = checkBreedable(w, aId, bId);
  if (!chk.ok) return chk;
  const { a, b } = chk.value;
  const pv = previewBreeding(a, b, w.flags);
  const plan = pv.skills;
  if (chosenSkills.length > plan.slots || chosenSkills.some((s) => !plan.candidates.includes(s)) || new Set(chosenSkills).size !== chosenSkills.length) return err('skills');
  const sp = getSpecies(pv.speciesId);
  const existing = new Set(w.monsters.map((m) => m.id));
  const child: MonsterInstance = {
    id: newId('m', rng, existing),
    speciesId: sp.id,
    sex: rng.next() < 0.5 ? 'A' : 'B',
    level: 1,
    experience: 0,
    plusValue: pv.plusValue,
    stats: pv.stats,
    hp: pv.stats.hp,
    mp: pv.stats.mp,
    skills: [...plan.initial, ...chosenSkills],
    resistances: pv.resistances,
    wildness: 0,
    parentIds: [a.id, b.id],
    parentSpeciesIds: [a.speciesId, b.speciesId],
    generation: pv.generation,
    obtainedFrom: 'breeding',
    createdAt: now,
    favorite: false,
    pendingSkills: [],
  };
  if (maxLevelOf(child) !== pv.maxLevel) throw new Error('max level mismatch');
  // 親がパーティにいたら、その位置に子を入れる
  let placed = false;
  const partyIds = w.partyIds.flatMap((id) => {
    if (id !== a.id && id !== b.id) return [id];
    if (placed) return [];
    placed = true;
    return [child.id];
  });
  const monsters = [...w.monsters.filter((m) => m.id !== a.id && m.id !== b.id), child];
  const history: BreedingHistoryEntry = {
    childId: child.id,
    childSpeciesId: child.speciesId,
    parents: [a, b].map((p) => ({ id: p.id, speciesId: p.speciesId, level: p.level, plusValue: p.plusValue })),
    at: now,
  };
  return ok({ world: { ...w, monsters, partyIds }, child, history });
}
