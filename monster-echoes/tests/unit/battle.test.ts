import { describe, expect, it } from 'vitest';
import { createRng, sequenceRng } from '../../src/core/Random';
import { getSkill } from '../../src/data/skills';
import { createMonster } from '../../src/domain/monster/MonsterFactory';
import { applyStatus, battleRewards, createBattle, enemyFromSpec, resolveTurn } from '../../src/domain/battle/BattleEngine';
import { calculateDamage } from '../../src/domain/battle/DamageCalculator';
import { decideOrder } from '../../src/domain/battle/TurnOrder';
import { chooseAction } from '../../src/domain/battle/BattleAI';
import { recruitChance, rollRecruit } from '../../src/domain/recruitment/RecruitmentEngine';
import type { BattleEvent } from '../../src/domain/battle/types';

const party = (seed = 1) => [createMonster('kogemaru', createRng(seed), { level: 5 }), createMonster('lumipon', createRng(seed + 1), { level: 5 })];

describe('ダメージ計算', () => {
  const a = enemyFromSpec({ speciesId: 'kogemaru', level: 10 }, 0);
  const d = enemyFromSpec({ speciesId: 'iwatokage', level: 10 }, 1);
  const atk = getSkill('attack');

  it('最小ダメージは1', () => {
    const weak = { ...a, attack: 1 };
    expect(calculateDamage({ skill: atk, attacker: weak, defender: d, isCritical: false, charged: false, rng: createRng(1) })).toBe(1);
  });
  it('乱数を固定すると同じ値になり、会心とちからためで増える', () => {
    const base = calculateDamage({ skill: atk, attacker: a, defender: d, isCritical: false, charged: false, rng: sequenceRng([0.5]) });
    const crit = calculateDamage({ skill: atk, attacker: a, defender: d, isCritical: true, charged: false, rng: sequenceRng([0.5]) });
    const ch = calculateDamage({ skill: atk, attacker: a, defender: d, isCritical: false, charged: true, rng: sequenceRng([0.5]) });
    expect(crit).toBeGreaterThan(base);
    expect(ch).toBeGreaterThanOrEqual(base * 2 - 1);
  });
  it('属性耐性: 弱点は増え、無効は0', () => {
    const plant = enemyFromSpec({ speciesId: 'mossglow', level: 10 }, 1);
    const bird = enemyFromSpec({ speciesId: 'yorufukuro', level: 10 }, 1);
    const ember = getSkill('ember');
    const vsPlant = calculateDamage({ skill: ember, attacker: a, defender: plant, isCritical: false, charged: false, rng: sequenceRng([0.5]) });
    const vsBird = calculateDamage({ skill: ember, attacker: a, defender: bird, isCritical: false, charged: false, rng: sequenceRng([0.5]) });
    expect(vsPlant).toBeGreaterThan(vsBird);
    const rocks = getSkill('pebbles');
    expect(calculateDamage({ skill: rocks, attacker: a, defender: bird, isCritical: false, charged: false, rng: sequenceRng([0.5]) })).toBe(0);
  });
});

describe('行動順', () => {
  it('優先度 → 素早さ の順、同値なら味方が先', () => {
    const slow = { ...enemyFromSpec({ speciesId: 'iwatokage', level: 5 }, 0) };
    const fast = { ...enemyFromSpec({ speciesId: 'yorufukuro', level: 5 }, 1) };
    const ally = { ...fast, side: 'ally' as const, key: 'a0', slot: 0 };
    const o = decideOrder([{ actor: slow, priority: 1 }, { actor: fast, priority: 0 }, { actor: ally, priority: 0 }], sequenceRng([1 - 1e-9]));
    expect(o.map((x) => x.actor.key)).toEqual(['e0', 'a0', 'e1']);
  });
});

describe('状態異常', () => {
  it('すでにかかっていれば上書きしない・耐性3なら効かない', () => {
    const t = enemyFromSpec({ speciesId: 'kogemaru', level: 5 }, 0);
    const ev: BattleEvent[] = [];
    applyStatus(t, 'sleep', 1, ev, sequenceRng([0, 0]));
    expect(t.status.sleep).toBeGreaterThan(0);
    const turns = t.status.sleep;
    applyStatus(t, 'sleep', 1, ev, sequenceRng([0, 0.99]));
    expect(t.status.sleep).toBe(turns);
    const rock = enemyFromSpec({ speciesId: 'iwatokage', level: 5 }, 0);
    applyStatus(rock, 'poison', 1, ev, sequenceRng([0]));
    expect(rock.status.poison).toBe(false);
  });
  it('ねむりはターン経過で解ける', () => {
    let s = createBattle('wild', party(), [{ speciesId: 'iwatokage', level: 1 }], 'attack');
    s.allies[0].status.sleep = 1;
    s.allies[0].hp = s.allies[0].maxHp;
    const r = resolveTurn(s, { mode: 'command', commands: [{ kind: 'defend' }, { kind: 'defend' }], player: { kind: 'none' } }, createRng(1));
    s = r.state;
    expect(s.allies[0].status.sleep).toBe(0);
  });
});

describe('戦闘の進行', () => {
  it('入力の state を変更しない（イベントを返すだけ）', () => {
    const s = createBattle('wild', party(), [{ speciesId: 'mossglow', level: 2 }], 'attack');
    const snap = structuredClone(s);
    resolveTurn(s, { mode: 'auto', player: { kind: 'none' } }, createRng(1));
    expect(s).toEqual(snap);
  });

  it('自動戦闘で決着がつき、勝てば報酬が出る', () => {
    let s = createBattle('wild', party(), [{ speciesId: 'mossglow', level: 2 }, { speciesId: 'yorufukuro', level: 2 }], 'attack');
    const rng = createRng(7);
    for (let i = 0; i < 30 && !s.outcome; i++) s = resolveTurn(s, { mode: 'auto', player: { kind: 'none' } }, rng).state;
    expect(s.outcome).toBe('win');
    const r = battleRewards(s);
    expect(r.exp).toBeGreaterThan(0);
    expect(r.gold).toBeGreaterThan(0);
  });

  it('ボス戦ではにげられない', () => {
    const s = createBattle('boss', party(), [{ speciesId: 'mossglow', level: 2 }], 'attack');
    const r = resolveTurn(s, { mode: 'auto', player: { kind: 'escape' } }, createRng(1));
    expect(r.state.outcome).not.toBe('escape');
    expect(r.events.some((e) => e.t === 'msg' && e.text === 'にげられない！')).toBe(true);
  });

  it('にくを投げると好感度が上がり、なかま化率が上がる', () => {
    const s = createBattle('wild', party(), [{ speciesId: 'mossglow', level: 3 }], 'attack');
    const before = recruitChance(s.enemies[0], 5);
    const r = resolveTurn(s, { mode: 'command', commands: [{ kind: 'defend' }, { kind: 'defend' }], player: { kind: 'item', itemId: 'bonemeat', target: 'e0' } }, createRng(2));
    expect(r.itemsUsed).toEqual({ bonemeat: 1 });
    expect(recruitChance(r.state.enemies[0], 5)).toBeGreaterThan(before);
  });

  it('なかま化は勝利したときだけ、最大1体', () => {
    const s = createBattle('wild', party(), [{ speciesId: 'mossglow', level: 3 }, { speciesId: 'mossglow', level: 3 }], 'attack');
    s.enemies.forEach((e) => (e.affection = 1));
    expect(rollRecruit(s, 5, createRng(1))).toBeNull();
    s.outcome = 'win';
    expect(rollRecruit(s, 5, sequenceRng([0]))?.key).toBe('e0');
    s.canRecruit = false;
    expect(rollRecruit(s, 5, sequenceRng([0]))).toBeNull();
  });

  it('AI: 瀕死の味方がいれば回復を選ぶ（回復・支援）', () => {
    const s = createBattle('wild', party(), [{ speciesId: 'mossglow', level: 2 }], 'support');
    s.allies[0].hp = 2;
    const healer = s.allies[1];
    const c = chooseAction(s, healer, 'support', createRng(1), 0);
    expect(c.skillId).toBe('heal');
    expect(c.target).toBe('a0');
  });

  it('AI: MP節約では MP を使う特技をひかえる', () => {
    const s = createBattle('wild', party(), [{ speciesId: 'iwatokage', level: 6 }], 'save');
    const c = chooseAction(s, s.allies[0], 'save', createRng(1), 0);
    expect(getSkill(c.skillId).mpCost).toBe(0);
  });
});
