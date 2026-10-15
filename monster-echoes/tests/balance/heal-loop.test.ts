// フィードバック: 「敵が回復ばかりして戦闘が終わらない」の再発防止
import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { getSkill } from '../../src/data/skills';
import { BALANCE } from '../../src/data/balance';
import { createBattle, resolveTurn } from '../../src/domain/battle/BattleEngine';
import { createMonster } from '../../src/domain/monster/MonsterFactory';
import type { EnemySpec } from '../../src/data/types';

function stats(enemies: EnemySpec[], kind: 'wild' | 'arena', lv: number, seed: number, partyIds = ['magmadog', 'frostbird', 'stonegolem']) {
  const rng = createRng(seed);
  const turns: number[] = [];
  let heals = 0, acts = 0, maxHeals = 0;
  for (let i = 0; i < 200; i++) {
    const party = partyIds.map((id) => createMonster(id, rng, { level: lv }));
    let s = createBattle(kind, party, enemies, 'attack');
    if (kind === 'arena') s.enemyTactic = 'support';
    let hb = 0;
    while (!s.outcome && s.turn < 40) {
      const r = resolveTurn(s, { mode: 'auto', player: { kind: 'none' } }, rng);
      for (const e of r.events) if (e.t === 'act' && e.actor.startsWith('e')) { acts++; if (['heal', 'revive'].includes(getSkill(e.skillId).category)) { heals++; hb++; } }
      s = r.state;
    }
    turns.push(s.turn);
    maxHeals = Math.max(maxHeals, hb);
  }
  turns.sort((a, b) => a - b);
  return { median: turns[100], p95: turns[190], healRate: heals / acts, maxHeals };
}

describe('敵の回復しすぎ', () => {
  const cases: [string, EnemySpec[], 'wild' | 'arena', number][] = [
    ['野生 リーファント×3', [{ speciesId: 'leafant', level: 6 }, { speciesId: 'leafant', level: 6 }, { speciesId: 'leafant', level: 6 }], 'wild', 6],
    ['闘技場F ミモザ（回復・支援）', [{ speciesId: 'leafant', level: 11 }, { speciesId: 'lunaslime', level: 11 }, { speciesId: 'leafant', level: 11 }], 'arena', 11],
    ['ルナスライム×2＋ゴーストビル', [{ speciesId: 'lunaslime', level: 12 }, { speciesId: 'lunaslime', level: 12 }, { speciesId: 'darkeye', level: 12 }], 'wild', 11],
  ];
  // 序盤：ルナスライム ひとりで バブルミニ（ヒール もち）と たたかう
  const early: [string, EnemySpec[], number, string[]][] = [
    ['序盤 バブルミニ Lv1 × ルナスライム Lv3', [{ speciesId: 'm002', level: 1 }], 3, ['m001']],
    ['序盤 バブルミニ Lv2 × ルナスライム Lv3', [{ speciesId: 'm002', level: 2 }], 3, ['m001']],
    ['序盤 バブルミニ・ルナスライム Lv2 × ルナスライム Lv4＋モスラット Lv3', [{ speciesId: 'm002', level: 2 }, { speciesId: 'm001', level: 2 }], 4, ['m001', 'm041']],
  ];
  for (const [name, es, lv, party] of early)
    it(name, () => {
      const r = stats(es, 'wild', lv, 7, party);
      console.log(`${name}: 中央値 ${r.median}ターン / 95% ${r.p95}ターン / 1戦の 回復 最大 ${r.maxHeals}回`);
      expect(r.p95).toBeLessThanOrEqual(6);
      expect(r.maxHeals).toBeLessThanOrEqual(BALANCE.battle.enemyHeal.wildMax);
    });
  for (const [name, es, kind, lv] of cases)
    it(name, () => {
      const r = stats(es, kind, lv, 7);
      console.log(`${name}: 中央値 ${r.median}ターン / 95% ${r.p95}ターン / 敵の行動のうち回復 ${(r.healRate * 100).toFixed(0)}%  (設定 ${JSON.stringify(BALANCE.battle.enemyHeal)})`);
      expect(r.p95).toBeLessThanOrEqual(12);
      expect(r.healRate).toBeLessThan(0.25);
    });
});
