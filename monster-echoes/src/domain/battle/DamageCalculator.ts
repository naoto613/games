import { BALANCE } from '../../data/balance';
import type { ResistKey, SkillDefinition } from '../../data/types';
import { randomBetween, type Rng } from '../../core/Random';
import type { Combatant } from './types';

const B = BALANCE.battle;

export const stageMult = (stage: number) => 1 + stage * B.stageMultiplier;
export const effAttack = (c: Combatant) => c.attack * stageMult(c.stages.attack);
export const effDefense = (c: Combatant) => c.defense * stageMult(c.stages.defense) * (c.defending ? 2 : 1);
export const effSpeed = (c: Combatant) => c.speed * stageMult(c.stages.speed);
export const effMagic = (c: Combatant) => c.magic * stageMult(c.stages.magic);
export const effSpirit = (c: Combatant) => c.spirit * stageMult(c.stages.spirit);

export const resistLevel = (c: Combatant, key: ResistKey | undefined) => (key ? (c.resist[key] ?? 0) : 0);
/** 属性による倍率（耐性 -1〜3、4 は 吸収で マイナス） */
export const elementMultiplier = (c: Combatant, key: ResistKey | undefined) => B.elementMultiplier[String(resistLevel(c, key))] ?? 1;
export const statusMultiplier = (c: Combatant, key: ResistKey | undefined) => B.statusMultiplier[String(resistLevel(c, key))] ?? 1;
export const absorbs = (c: Combatant, key: ResistKey | undefined) => elementMultiplier(c, key) < 0;

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
  // 全体呪文は魔力の伸びが半分。精神で へる（係数は はじめ 0）
  if (skill.category === 'magic') return Math.max(0, skill.power + effMagic(attacker) * B.magicScale * (skill.target === 'allEnemies' ? 0.5 : 1) - effSpirit(defender) * B.spiritScale);
  if (skill.category === 'breath') return Math.max(0, skill.power - effSpirit(defender) * B.spiritScale * 0.5);
  return 0;
}

/**
 * ダメージ計算。順序は「素のダメージ → ばらつき → 属性 → 会心 → ちからため → ぼうぎょ（呪文・息）」で固定。
 * 最小ダメージは 1（ただし属性で無効なら 0）。吸収なら マイナス（その分 回復）を かえす。
 */
export function calculateDamage(input: DamageInput): number {
  const { skill, attacker, defender, rng } = input;
  const element = elementMultiplier(defender, skill.elementId);
  if (element === 0) return 0;
  let d = rawDamage(skill, attacker, defender, input.isCritical);
  d *= randomBetween(rng, B.damageVarianceMin, B.damageVarianceMax);
  d *= Math.abs(element);
  if (input.isCritical) d *= B.criticalMultiplier;
  if (input.charged && skill.category === 'physical') d *= 2;
  if (defender.defending && skill.category !== 'physical') d *= 0.6;
  const n = Math.max(1, Math.floor(d));
  return element < 0 ? -n : n;
}

/** 回復量（魔力で少し伸びる。精神の 係数は はじめ 0） */
export function healAmount(skill: SkillDefinition, user: Combatant, rng: Rng): number {
  return Math.floor((skill.power + user.magic * B.healMagicScale + user.spirit * B.healSpiritScale) * randomBetween(rng, 0.9, 1.1));
}
