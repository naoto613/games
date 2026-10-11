import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { SPECIES_LIST, getSpecies } from '../../src/data/monsters';
import { SKILLS } from '../../src/data/skills';
import { BREEDING_RECIPES } from '../../src/data/breeding';
import { STAT_KEYS } from '../../src/data/types';
import { createMonster } from '../../src/domain/monster/MonsterFactory';
import { applySkillUpgrades, expForLevel, gainExperience, learnSkill, maxLevelOf, resolvePendingSkill } from '../../src/domain/monster/Growth';

describe('マスタデータの検証', () => {
  it('種族の特技・レシピの参照先がすべて存在する', () => {
    for (const sp of SPECIES_LIST) {
      for (const e of sp.learnset) expect(SKILLS[e.skillId], `${sp.id}:${e.skillId}`).toBeTruthy();
      for (const k of STAT_KEYS) expect(sp.baseStats[k]).toBeLessThanOrEqual(sp.statCaps[k]);
    }
    for (const s of Object.values(SKILLS)) if (s.upgrade) expect(SKILLS[s.upgrade.to]).toBeTruthy();
    for (const r of BREEDING_RECIPES) if (r.kind !== 'fallback') expect(getSpecies(r.resultSpeciesId)).toBeTruthy();
  });
});

describe('モンスター生成と成長', () => {
  it('同じシードなら同じ個体ができる', () => {
    const a = createMonster('magmadog', createRng(1), { level: 5, now: 0 });
    const b = createMonster('magmadog', createRng(1), { level: 5, now: 0 });
    expect(a).toEqual(b);
    expect(a.level).toBe(5);
    expect(a.skills).toContain('ember');
  });

  it('個体 ID が重複しない', () => {
    const rng = createRng(3);
    const ids = new Set<string>();
    for (let i = 0; i < 500; i++) {
      const m = createMonster('lunaslime', rng, { existingIds: ids });
      expect(ids.has(m.id)).toBe(false);
      ids.add(m.id);
    }
  });

  it('複数レベル上昇は1レベルずつ処理し、増えた最大HPのぶん現在HPも増える', () => {
    const m0 = createMonster('stonegolem', createRng(5), { level: 1 });
    const hurt = { ...m0, hp: 5 };
    const sp = getSpecies('stonegolem');
    const { monster, events } = gainExperience(hurt, expForLevel(sp, 6), createRng(9));
    expect(monster.level).toBe(6);
    expect(events.map((e) => e.level)).toEqual([2, 3, 4, 5, 6]);
    const hpGain = events.reduce((a, e) => a + e.gains.hp, 0);
    expect(monster.hp).toBe(5 + hpGain);
    expect(monster.stats.hp).toBe(m0.stats.hp + hpGain);
    expect(monster.skills).toContain('pebbles'); // Lv6 で覚える
  });

  it('レベル上限で経験値が止まる・プラス値で上限が上がる', () => {
    const m = createMonster('frostbird', createRng(2), { level: 1 });
    expect(maxLevelOf(m)).toBe(20);
    const r = gainExperience(m, 10_000_000, createRng(1));
    expect(r.monster.level).toBe(20);
    expect(r.monster.experience).toBe(expForLevel(getSpecies('frostbird'), 20));
    expect(maxLevelOf({ ...m, plusValue: 3 })).toBe(26);
  });

  it('能力値は種族の上限をこえない', () => {
    const m = createMonster('icekrill', createRng(4), { level: 1, plusValue: 30 });
    const r = gainExperience(m, 1e9, createRng(1));
    const sp = getSpecies('icekrill');
    for (const k of STAT_KEYS) expect(r.monster.stats[k]).toBeLessThanOrEqual(sp.statCaps[k]);
  });

  it('特技枠がいっぱいなら保留し、選んで入れかえられる', () => {
    let m = createMonster('lunaslime', createRng(1), { level: 1 });
    m = { ...m, skills: ['heal', 'bite', 'peck', 'tackle', 'sweep', 'gust', 'icicle', 'dust'] };
    const r = learnSkill(m, 'veil');
    expect(r.result).toBe('full');
    expect(r.monster.pendingSkills).toEqual(['veil']);
    expect(learnSkill(m, 'heal').result).toBe('duplicate');
    const m2 = resolvePendingSkill(r.monster, 'veil', 'dust');
    expect(m2.skills).toContain('veil');
    expect(m2.skills).not.toContain('dust');
    expect(m2.pendingSkills).toEqual([]);
  });

  it('条件を満たすと特技が上位に変化する', () => {
    const m = createMonster('magmadog', createRng(1), { level: 5 });
    const strong = { ...m, level: 12, stats: { ...m.stats, wisdom: 40 } };
    const r = applySkillUpgrades(strong);
    expect(r.upgraded).toEqual([{ from: 'ember', to: 'fireball' }]);
    expect(r.monster.skills).toContain('fireball');
    expect(applySkillUpgrades({ ...strong, stats: { ...strong.stats, wisdom: 39 } }).upgraded).toEqual([]);
  });
});
