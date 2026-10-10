import { BALANCE } from '../../data/balance';
import { randomBetween, type Rng } from '../../core/Random';
import { effSpeed } from './DamageCalculator';
import type { Combatant } from './types';

export type Scheduled = { actor: Combatant; priority: number; speedRoll: number };

/**
 * 行動順: 優先度 → 素早さ（乱数つき）→ 味方が先 → 並び順。ターン開始時に一度だけ決める。
 */
export function decideOrder(entries: { actor: Combatant; priority: number }[], rng: Rng): Scheduled[] {
  const rolled = entries.map((e) => ({ ...e, speedRoll: effSpeed(e.actor) * randomBetween(rng, BALANCE.battle.speedVarianceMin, 1) }));
  return rolled.sort(
    (a, b) =>
      b.priority - a.priority ||
      b.speedRoll - a.speedRoll ||
      (a.actor.side === b.actor.side ? 0 : a.actor.side === 'ally' ? -1 : 1) ||
      a.actor.slot - b.actor.slot,
  );
}
