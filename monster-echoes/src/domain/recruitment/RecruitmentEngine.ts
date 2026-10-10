import { BALANCE } from '../../data/balance';
import { clamp, type Rng } from '../../core/Random';
import type { BattleState, Combatant } from '../battle/types';

const R = BALANCE.recruitment;

/** なかま化率 = 基礎 + にく（好感度） - レベル差 を範囲内に収めたもの */
export function recruitChance(enemy: Combatant, partyAvgLevel: number): number {
  if (!enemy.recruitable) return 0;
  const penalty = Math.max(0, enemy.level - partyAvgLevel) * R.levelPenalty;
  return clamp(enemy.recruitBase + enemy.affection - penalty, R.minChance, R.maxChance);
}

/** 勝利後、なかまになりたそうな 1 体を決める（いなければ null）。好感度の高い順に判定する。 */
export function rollRecruit(s: BattleState, partyAvgLevel: number, rng: Rng): Combatant | null {
  if (!s.canRecruit || s.outcome !== 'win') return null;
  const order = [...s.enemies].filter((e) => e.recruitable).sort((a, b) => recruitChance(b, partyAvgLevel) - recruitChance(a, partyAvgLevel));
  for (const e of order) if (rng.next() < recruitChance(e, partyAvgLevel)) return e;
  return null;
}
