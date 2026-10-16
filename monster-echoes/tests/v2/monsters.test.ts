// v2 モンスター200種の データ検証（仕様 20章「モンスター」の 受け入れ基準）
import { describe, expect, it } from 'vitest';
import { LEGACY_SPECIES_MAP, MONSTER2_BY_ID, MONSTERS2, WILD_ALIASES, monsterIdOf } from '../../src/data/v2/monsters';
import { ELEMENTS2, FAMILIES2, STAT_KEYS2, type Role2 } from '../../src/data/v2/types';
import { SPECIES_V1_LIST as SPECIES_LIST } from '../../src/data/monsters';

const total = (s: Record<string, number>) => Object.values(s).reduce((a, b) => a + b, 0);

describe('モンスター200種の定義', () => {
  it('200種・ID m001〜m200 が番号順で一意、名前も一意', () => {
    expect(MONSTERS2).toHaveLength(200);
    MONSTERS2.forEach((m, i) => {
      expect(m.no).toBe(i + 1);
      expect(m.id).toBe(`m${String(i + 1).padStart(3, '0')}`);
      expect(m.spriteId.startsWith(`mon_${String(i + 1).padStart(3, '0')}_`)).toBe(true);
    });
    expect(new Set(MONSTERS2.map((m) => m.name)).size).toBe(200);
  });

  it('10系統×20種（番号の範囲と系統が一致）', () => {
    FAMILIES2.forEach((f, i) => {
      const list = MONSTERS2.filter((m) => m.family === f);
      expect(list, f).toHaveLength(20);
      expect(list.every((m) => m.no > i * 20 && m.no <= (i + 1) * 20), f).toBe(true);
    });
  });

  it('能力・属性・役割・ランク・成長型が すべて 設定されている', () => {
    for (const m of MONSTERS2) {
      for (const k of STAT_KEYS2) {
        expect(Number.isInteger(m.baseStats[k]) && m.baseStats[k] > 0, `${m.name} ${k}`).toBe(true);
        expect(m.growthRates[k], `${m.name} ${k}`).toBeGreaterThan(0);
      }
      expect(ELEMENTS2).toContain(m.element);
      expect([1, 2, 3, 4, 5]).toContain(m.rank);
      expect(m.legendary).toBe(m.rank === 5);
      expect(m.levelCap).toBeGreaterThanOrEqual(30);
    }
  });

  it('すべての属性・役割に 使い手が いる（特定の種だけが 攻略必須に ならない）', () => {
    for (const e of ELEMENTS2) expect(MONSTERS2.filter((m) => m.element === e).length, e).toBeGreaterThanOrEqual(10);
    const roles: Role2[] = ['attacker', 'caster', 'tank', 'support', 'status', 'speed', 'special'];
    for (const r of roles) expect(MONSTERS2.filter((m) => m.role === r).length, r).toBeGreaterThanOrEqual(10);
  });

  it('役割の とくちょうが 能力に あらわれる（1体が すべての 役割を こなせない）', () => {
    for (const m of MONSTERS2) {
      const s = m.baseStats;
      if (m.role === 'attacker') expect(s.atk, m.name).toBeGreaterThan(s.mag);
      if (m.role === 'caster') expect(s.mag, m.name).toBeGreaterThan(s.atk);
      if (m.role === 'tank') expect(s.def, m.name).toBeGreaterThan(s.atk);
      if (m.role === 'speed') expect(s.spd, m.name).toBeGreaterThanOrEqual(Math.max(s.atk, s.mag, s.def));
      if (m.role === 'support') expect(s.spr, m.name).toBeGreaterThan(s.atk);
    }
  });

  it('ランクが 上がるほど 平均の 能力が 高い', () => {
    const avg = (r: number) => { const l = MONSTERS2.filter((m) => m.rank === r); return l.reduce((a, m) => a + total(m.baseStats), 0) / l.length; };
    for (let r = 1; r < 5; r++) expect(avg(r + 1), `rank${r + 1}`).toBeGreaterThan(avg(r));
  });

  it('吸収・無効の 属性耐性は 数を しぼる（ボス戦で 一方的に ならない）', () => {
    const absorb = MONSTERS2.filter((m) => ELEMENTS2.some((e) => m.resistances[e] === 4));
    const immune = MONSTERS2.filter((m) => ELEMENTS2.some((e) => m.resistances[e] === 3));
    expect(absorb.length).toBeLessThanOrEqual(6);
    expect(immune.length).toBeLessThanOrEqual(20);
    // どの モンスターにも 弱点が ひとつは ある
    for (const m of MONSTERS2) expect(ELEMENTS2.some((e) => (m.resistances[e] ?? 0) < 0), m.name).toBe(true);
  });

  it('別名（Q16）と 旧種族の 引き継ぎ表（§6.1）が 存在する ID を さす', () => {
    for (const [name, id] of Object.entries(WILD_ALIASES)) expect(MONSTER2_BY_ID[id], name).toBeTruthy();
    expect(monsterIdOf('ルナスライム')).toBe('m001');
    expect(monsterIdOf('グリーンピクシー')).toBe('m043');
    for (const sp of SPECIES_LIST) expect(MONSTER2_BY_ID[LEGACY_SPECIES_MAP[sp.id]], sp.id).toBeTruthy();
  });
});
