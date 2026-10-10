// フィードバック: 「にくを あげていないのに なかまに なりやすすぎる」の再発防止
import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { createBattle, enemyFromSpec } from '../../src/domain/battle/BattleEngine';
import { rollRecruit } from '../../src/domain/recruitment/RecruitmentEngine';
import { createMonster } from '../../src/domain/monster/MonsterFactory';

function rate(group: number, meat: number, speciesId = 'yorufukuro') {
  const rng = createRng(11);
  const party = [createMonster('kogemaru', rng, { level: 4 })];
  let n = 0;
  const N = 4000;
  for (let i = 0; i < N; i++) {
    const s = createBattle('wild', party, Array.from({ length: group }, () => ({ speciesId, level: 3 })), 'attack');
    s.outcome = 'win';
    if (meat) s.enemies[0].affection = meat;
    if (rollRecruit(s, 4, rng)) n++;
  }
  return n / N;
}

describe('なかま化率（1戦あたり）', () => {
  it('にくなしでは めったに なかまに ならず、敵が多くても ふえない', () => {
    const r1 = rate(1, 0), r3 = rate(3, 0);
    console.log(`にくなし: 1体 ${(r1 * 100).toFixed(1)}% / 3体 ${(r3 * 100).toFixed(1)}%`);
    expect(r1).toBeLessThan(0.04);
    expect(r3).toBeLessThan(0.04);
  });
  it('にくを なげると はっきり なかまに なりやすい', () => {
    const j = rate(3, 0.12), b = rate(3, 0.28), j2 = rate(3, 0.24);
    console.log(`ジャーキー1こ ${(j * 100).toFixed(0)}% / 2こ ${(j2 * 100).toFixed(0)}% / ほねつきにく ${(b * 100).toFixed(0)}%`);
    expect(j).toBeGreaterThan(0.2);
    expect(b).toBeGreaterThan(0.35);
  });
  it('中ランクの種族は にくなしだと さらに まれ', () => {
    expect(rate(1, 0, 'tsukipon')).toBeLessThan(0.02);
    void enemyFromSpec;
  });
});
