import { BALANCE } from '../../data/balance';
import { clamp, type Rng } from '../../core/Random';
import type { BattleState, Combatant } from '../battle/types';

const R = BALANCE.recruitment;

/**
 * なかま化率 = 基礎 + にく（好感度） - レベル差 を範囲内に収めたもの。
 * にくを もらっていない敵は 基礎が ごく小さい（noMeatFactor 倍）。
 */
export function recruitChance(enemy: Combatant, partyAvgLevel: number): number {
  if (!enemy.recruitable) return 0;
  const fed = enemy.affection > 0;
  const base = fed ? enemy.recruitBase : enemy.recruitBase * R.noMeatFactor;
  const penalty = Math.max(0, enemy.level - partyAvgLevel) * R.levelPenalty;
  return clamp(base + Math.max(0, enemy.affection) - penalty, R.minChance, R.maxChance);
}

/**
 * 勝利後、なかまになりたそうな 1 体を決める（いなければ null）。
 * 判定は 1 戦につき 1 回だけ（いちばん なかまに なりやすい 1 体で判定。敵が多いほど なりやすく ならない）。
 */
export function rollRecruit(s: BattleState, partyAvgLevel: number, rng: Rng): Combatant | null {
  if (!s.canRecruit || s.outcome !== 'win') return null;
  const order = [...s.enemies].filter((e) => e.recruitable).sort((a, b) => recruitChance(b, partyAvgLevel) - recruitChance(a, partyAvgLevel) || a.slot - b.slot);
  const top = order[0];
  if (!top) return null;
  return rng.next() < recruitChance(top, partyAvgLevel) ? top : null;
}
