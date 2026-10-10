// フィードバック: 「敵が回復ばかりして戦闘が終わらない」の再発防止
import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { BALANCE } from '../../src/data/balance';
import { createBattle, resolveTurn } from '../../src/domain/battle/BattleEngine';
import { createMonster } from '../../src/domain/monster/MonsterFactory';
import type { EnemySpec } from '../../src/data/types';

function stats(enemies: EnemySpec[], kind: 'wild' | 'arena', lv: number, seed: number) {
  const rng = createRng(seed);
  const turns: number[] = [];
  let heals = 0, acts = 0;
  for (let i = 0; i < 200; i++) {
    const party = [createMonster('magmadog', rng, { level: lv }), createMonster('frostbird', rng, { level: lv }), createMonster('stonegolem', rng, { level: lv })];
    let s = createBattle(kind, party, enemies, 'attack');
    if (kind === 'arena') s.enemyTactic = 'support';
    while (!s.outcome && s.turn < 40) {
      const r = resolveTurn(s, { mode: 'auto', player: { kind: 'none' } }, rng);
      for (const e of r.events) if (e.t === 'act' && e.actor.startsWith('e')) { acts++; if (['heal', 'healmore', 'healall', 'revive'].includes(e.skillId)) heals++; }
      s = r.state;
    }
    turns.push(s.turn);
  }
  turns.sort((a, b) => a - b);
  return { median: turns[100], p95: turns[190], healRate: heals / acts };
}

describe('敵の回復しすぎ', () => {
  const cases: [string, EnemySpec[], 'wild' | 'arena', number][] = [
    ['野生 リーファント×3', [{ speciesId: 'leafant', level: 6 }, { speciesId: 'leafant', level: 6 }, { speciesId: 'leafant', level: 6 }], 'wild', 6],
    ['闘技場F ミモザ（回復・支援）', [{ speciesId: 'leafant', level: 11 }, { speciesId: 'lunaslime', level: 11 }, { speciesId: 'leafant', level: 11 }], 'arena', 11],
    ['ルナスライム×2＋ゴーストビル', [{ speciesId: 'lunaslime', level: 12 }, { speciesId: 'lunaslime', level: 12 }, { speciesId: 'darkeye', level: 12 }], 'wild', 11],
  ];
  for (const [name, es, kind, lv] of cases)
    it(name, () => {
      const r = stats(es, kind, lv, 7);
      console.log(`${name}: 中央値 ${r.median}ターン / 95% ${r.p95}ターン / 敵の行動のうち回復 ${(r.healRate * 100).toFixed(0)}%  (設定 ${JSON.stringify(BALANCE.battle.enemyHeal)})`);
      expect(r.p95).toBeLessThanOrEqual(12);
      expect(r.healRate).toBeLessThan(0.25);
    });
});
