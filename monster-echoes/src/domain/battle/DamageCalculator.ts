import { BALANCE } from '../../data/balance';
import type { ResistKey, SkillDefinition } from '../../data/types';
import { randomBetween, type Rng } from '../../core/Random';
import type { Combatant } from './types';

const B = BALANCE.battle;

export const stageMult = (stage: number) => 1 + stage * B.stageMultiplier;
export const effAttack = (c: Combatant) => c.attack * stageMult(c.stages.attack);
export const effDefense = (c: Combatant) => c.defense * stageMult(c.stages.defense) * (c.defending ? 2 : 1);
export const effSpeed = (c: Combatant) => c.speed * stageMult(c.stages.speed);

export const resistLevel = (c: Combatant, key: ResistKey | undefined) => (key ? (c.resist[key] ?? 0) : 0);
/** 属性による倍率（耐性 -1〜3） */
export const elementMultiplier = (c: Combatant, key: ResistKey | undefined) => B.elementMultiplier[String(resistLevel(c, key))] ?? 1;
export const statusMultiplier = (c: Combatant, key: ResistKey | undefined) => B.statusMultiplier[String(resistLevel(c, key))] ?? 1;

export type DamageInput = {
  skill: SkillDefinition;
  attacker: Combatant;
  defender: Combatant;
  isCritical: boolean;
  /** ちからためで 2 倍 */
  charged: boolean;
  /** 連続攻撃などの1回ぶん */
  rng: Rng;
};

/** 素のダメージ（ばらつき・会心・属性の前）。AI の見積もりにも使う。 */
export function rawDamage(skill: SkillDefinition, attacker: Combatant, defender: Combatant, isCritical = false): number {
  if (skill.category === 'physical') {
    // 会心は守備を無視する
    const def = isCritical ? 0 : effDefense(defender) * B.defenseScale;
    return Math.max(0, effAttack(attacker) * B.attackScale - def) * skill.power;
  }
  // 全体呪文は賢さの伸びが半分
  if (skill.category === 'magic') return skill.power + attacker.wisdom * B.wisdomScale * (skill.target === 'allEnemies' ? 0.5 : 1);
  if (skill.category === 'breath') return skill.power;
  return 0;
}

/**
 * ダメージ計算。順序は「素のダメージ → ばらつき → 属性 → 会心 → ちからため → ぼうぎょ（呪文・息）」で固定。
 * 最小ダメージは 1（ただし属性で無効なら 0）。
 */
export function calculateDamage(input: DamageInput): number {
  const { skill, attacker, defender, rng } = input;
  const element = elementMultiplier(defender, skill.elementId);
  if (element === 0) return 0;
  let d = rawDamage(skill, attacker, defender, input.isCritical);
  d *= randomBetween(rng, B.damageVarianceMin, B.damageVarianceMax);
  d *= element;
  if (input.isCritical) d *= B.criticalMultiplier;
  if (input.charged && skill.category === 'physical') d *= 2;
  if (defender.defending && skill.category !== 'physical') d *= 0.6;
  return Math.max(1, Math.floor(d));
}

/** 回復量（賢さで少し伸びる） */
export function healAmount(skill: SkillDefinition, user: Combatant, rng: Rng): number {
  return Math.floor((skill.power + user.wisdom * B.healWisdomScale) * randomBetween(rng, 0.9, 1.1));
}
