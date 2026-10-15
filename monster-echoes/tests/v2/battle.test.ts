import { headStart } from '../../src/data/v2/species';
import { describe, expect, it } from 'vitest';
import { createRng, sequenceRng } from '../../src/core/Random';
import { BALANCE } from '../../src/data/balance';
import { getSpecies, SPECIES2_LIST } from '../../src/data/monsters';
import { getSkill, SKILL_LIST, SKILLS } from '../../src/data/skills';
import { ELEMENT_IDS } from '../../src/data/types';
import { createBattle, enemyFromSpec, resolveTurn } from '../../src/domain/battle/BattleEngine';
import { calculateDamage, rawDamage } from '../../src/domain/battle/DamageCalculator';
import type { BattleEvent, Combatant } from '../../src/domain/battle/types';
import { chooseAction } from '../../src/domain/battle/BattleAI';
import { gainExperience, expForLevel } from '../../src/domain/monster/Growth';
import { createMonster } from '../../src/domain/monster/MonsterFactory';
import { migrate } from '../../src/infrastructure/save/SaveMigration';
import { SCHEMA_VERSION } from '../../src/application/GameState';
import { newGameState } from '../../src/application/Game';

const mid = () => sequenceRng([0.5]);
const foe = (resist: Combatant['resist'] = {}) => ({ ...enemyFromSpec({ speciesId: 'm121', level: 20 }, 1), resist });

describe('v2 特技表と 習得スキル', () => {
  it('通常スキルが 100種類いじょう ある（仕様 3）', () => {
    expect(SKILL_LIST.length).toBeGreaterThanOrEqual(100);
    expect(new Set(SKILL_LIST.map((s) => s.id)).size).toBe(SKILL_LIST.length);
  });
  it('8属性 すべてに ひとりを うつ 呪文と 全体の こうげきが ある', () => {
    for (const e of ELEMENT_IDS) {
      expect(SKILL_LIST.some((s) => s.elementId === e && s.category === 'magic' && s.target === 'oneEnemy'), e).toBe(true);
      expect(SKILL_LIST.some((s) => s.elementId === e && s.target === 'allEnemies'), e).toBe(true);
    }
  });
  it('上位特技の 行き先が ある', () => {
    for (const s of SKILL_LIST) if (s.upgrade) expect(SKILLS[s.upgrade.to], s.id).toBeTruthy();
  });
  it('200種 すべてに 5つ いじょうの 習得スキルが あり、レベル上限までに おぼえる', () => {
    expect(SPECIES2_LIST).toHaveLength(200);
    for (const sp of SPECIES2_LIST) {
      expect(sp.learnset.length, sp.name).toBeGreaterThanOrEqual(5);
      expect(new Set(sp.learnset.map((e) => e.skillId)).size, sp.name).toBe(sp.learnset.length);
      for (const e of sp.learnset) {
        expect(SKILLS[e.skillId], `${sp.name} ${e.skillId}`).toBeTruthy();
        expect(e.level, sp.name).toBeLessThanOrEqual(sp.baseLevelCap);
      }
      expect(sp.learnset[0].level).toBe(1);
    }
  });
  it('じぶんの 属性の 特技を 1つ いじょう おぼえる（補助役を のぞく）', () => {
    for (const sp of SPECIES2_LIST) {
      if (sp.role === 'support' || sp.role === 'tank') continue;
      const own = sp.learnset.some((e) => getSkill(e.skillId).elementId === sp.element);
      expect(own, sp.name).toBe(true);
    }
  });
  it('伝説級だけが 固有特技（受け継げない）を もつ', () => {
    for (const sp of SPECIES2_LIST) {
      const sig = sp.learnset.some((e) => getSkill(e.skillId).noInherit && ['eternallight', 'starfall', 'voidnova', 'primalroar', 'tsunamicrown', 'infernoroar'].includes(e.skillId));
      expect(sig, sp.name).toBe(sp.rank === 5);
    }
  });
});

describe('7能力・8属性・吸収', () => {
  const a = enemyFromSpec({ speciesId: 'm004', level: 20 }, 0); // フレアゼリー
  const ember = getSkill('ember');
  const hit = (d: Combatant, skill = ember) => calculateDamage({ skill, attacker: a, defender: d, isCritical: false, charged: false, rng: mid() });

  it('弱点 1.5倍・耐性で へる・無効 0・吸収は マイナス（回復）', () => {
    const base = hit(foe());
    expect(hit(foe({ fire: -1 }))).toBeGreaterThan(base);
    expect(hit(foe({ fire: 1 }))).toBeLessThan(base);
    expect(hit(foe({ fire: 3 }))).toBe(0);
    const ab = hit(foe({ fire: 4 }));
    expect(ab).toBeLessThan(0);
    expect(-ab).toBe(base);
  });
  it('精神が 0 なら v1 と おなじ 式（威力 ＋ 魔力 × 0.12）。精神の 係数は 第1章の 調整で 0.08', () => {
    expect(BALANCE.battle.spiritScale).toBe(0.08);
    const d0 = { ...foe(), spirit: 0 };
    expect(rawDamage(ember, a, d0)).toBeCloseTo(ember.power + a.magic * BALANCE.battle.magicScale);
    const old = BALANCE.battle.spiritScale;
    BALANCE.battle.spiritScale = 0;
    try { expect(hit({ ...foe(), spirit: 999 })).toBe(hit(foe())); } finally { BALANCE.battle.spiritScale = old; }
  });
  it('精神の 係数を あげると 呪文の ダメージが へる', () => {
    const old = BALANCE.battle.spiritScale;
    BALANCE.battle.spiritScale = 0.1;
    try {
      expect(rawDamage(ember, a, { ...foe(), spirit: 50 })).toBeLessThan(rawDamage(ember, a, { ...foe(), spirit: 0 }));
    } finally { BALANCE.battle.spiritScale = old; }
  });
  it('魔力の 段階が あがると 呪文が つよくなる', () => {
    const up = { ...a, stages: { ...a.stages, magic: 2 } };
    expect(rawDamage(ember, up, foe())).toBeGreaterThan(rawDamage(ember, a, foe()));
  });
  it('吸収する あいてには 回復になり、AI は その 呪文を えらばない', () => {
    const party = [createMonster('m004', createRng(1), { level: 20 })];
    let s = createBattle('wild', party, [{ speciesId: 'm121', level: 5 }], 'attack');
    s.enemies[0].resist = { fire: 4 };
    s.enemies[0].hp = 1;
    s.allies[0].skills = ['ember'];
    const r = resolveTurn(s, { mode: 'command', commands: [{ kind: 'skill', skillId: 'ember', target: 'e0' }], player: { kind: 'none' } }, createRng(3));
    expect(r.events.some((e: BattleEvent) => e.t === 'heal' && e.target === 'e0')).toBe(true);
    expect(r.state.enemies[0].hp).toBeGreaterThan(1);
    // AI は 吸収される 呪文より ふつうの こうげきを えらぶ
    const s2 = createBattle('wild', party, [{ speciesId: 'm121', level: 5 }], 'attack');
    s2.enemies[0].resist = { fire: 4 };
    s2.allies[0].skills = ['ember'];
    expect(chooseAction(s2, s2.allies[0], 'skill', createRng(1), 0).skillId).toBe('attack');
  });
  it('吸いとりで じぶんが 回復する', () => {
    const party = [createMonster('m181', createRng(1), { level: 20 })];
    const s = createBattle('wild', party, [{ speciesId: 'm121', level: 20 }], 'attack');
    s.allies[0].hp = 5;
    s.allies[0].skills = ['souldrain'];
    s.allies[0].mp = 50;
    const r = resolveTurn(s, { mode: 'command', commands: [{ kind: 'skill', skillId: 'souldrain', target: 'e0' }], player: { kind: 'none' } }, createRng(5));
    expect(r.events.some((e) => e.t === 'heal' && e.target === 'a0')).toBe(true);
  });
  it('変則型は HP が はんぶんを きると いちどだけ 覚醒する', () => {
    const party = [createMonster('m100', createRng(1), { level: 30 })];
    const s = createBattle('wild', party, [{ speciesId: 'm016', level: 10 }], 'attack');
    const e = s.enemies[0];
    expect(getSpecies('m016').growthType).toBe('variable');
    expect(e.variable).toBe(true);
    e.hp = Math.floor(e.maxHp * 0.55);
    e.maxHp = e.maxHp * 100; e.hp *= 100; // たおれないように
    e.hp = Math.floor(e.maxHp * 0.55);
    let r = resolveTurn(s, { mode: 'command', commands: [{ kind: 'attack', target: 'e0' }], player: { kind: 'none' } }, createRng(2));
    for (let i = 0; i < 20 && !r.state.enemies[0].awakened && !r.state.outcome; i++) r = resolveTurn(r.state, { mode: 'command', commands: [{ kind: 'attack', target: 'e0' }], player: { kind: 'none' } }, createRng(10 + i));
    expect(r.state.enemies[0].awakened).toBe(true);
    expect(r.state.enemies[0].stages.attack).toBeGreaterThan(0);
  });
});

describe('v2 の 200種で 戦える', () => {
  it('どの 種族も 敵として 出せて、なかまとして 育てられる', () => {
    for (const sp of SPECIES2_LIST) {
      const e = enemyFromSpec({ speciesId: sp.id, level: Math.min(sp.baseLevelCap, 20) }, 0);
      expect(e.maxHp, sp.name).toBeGreaterThan(0);
      expect(Number.isFinite(e.magic + e.spirit), sp.name).toBe(true);
      const m = createMonster(sp.id, createRng(sp.no!), { level: 1 });
      const g = gainExperience(m, expForLevel(sp, 15), createRng(sp.no!)).monster;
      expect(g.level, sp.name).toBe(Math.min(15, sp.baseLevelCap));
      expect(g.stats.spirit, sp.name).toBeGreaterThan(m.stats.spirit);
    }
  });
  it('v2 どうしの 戦闘が 最後まで すすむ', () => {
    const rng = createRng(7);
    for (let i = 0; i < 40; i++) {
      const pick = () => SPECIES2_LIST[Math.floor(rng.next() * 200)];
      const party = [0, 1, 2].map((k) => createMonster(pick().id, createRng(i * 3 + k), { level: 25 }));
      let s = createBattle('wild', party, [0, 1].map(() => ({ speciesId: pick().id, level: 22 })), 'attack');
      for (let t = 0; t < 60 && !s.outcome; t++) s = resolveTurn(s, { mode: 'auto', player: { kind: 'none' } }, rng).state;
      for (const c of [...s.allies, ...s.enemies]) {
        expect(c.hp).toBeGreaterThanOrEqual(0);
        expect(c.hp).toBeLessThanOrEqual(c.maxHp);
      }
    }
  });
});

describe('セーブ v3 → v4（かしこさ → 魔力・精神）', () => {
  it('能力が わかれ、v1 の 種族のまま 読める', () => {
    const old = JSON.parse(JSON.stringify(newGameState('テスト', createRng(1), 0)));
    old.schemaVersion = 3;
    for (const m of old.monsters) { m.stats.wisdom = m.stats.magic; delete m.stats.magic; delete m.stats.spirit; }
    const r = migrate(old);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.schemaVersion).toBe(SCHEMA_VERSION);
    for (const m of r.value.monsters) {
      expect(m.stats.magic).toBeGreaterThan(0);
      // v4 では 精神 ＝ 魔力（そのあと v7 で 種族ごとの 上のせが 足される）
      const add = headStart(getSpecies(m.speciesId).growth);
      expect(m.stats.spirit - add.spirit).toBe(m.stats.magic - add.magic);
      expect((m.stats as unknown as Record<string, unknown>).wisdom).toBeUndefined();
    }
  });
});
