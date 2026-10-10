import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { createMonster } from '../../src/domain/monster/MonsterFactory';
import type { MonsterInstance } from '../../src/domain/monster/types';
import { checkBreedable, computeChildPlus, executeBreeding, previewBreeding, resolveChildSpecies } from '../../src/domain/breeding/BreedingEngine';
import { maxLevelOf } from '../../src/domain/monster/Growth';

let seed = 100;
const mk = (speciesId: string, sex: 'A' | 'B', level = 10, extra: Partial<MonsterInstance> = {}) => ({ ...createMonster(speciesId, createRng(seed++), { level, sex }), ...extra });

describe('配合レシピの解決', () => {
  it('系統配合は血統（親A）の系統で決まる', () => {
    expect(resolveChildSpecies(mk('kogemaru', 'A'), mk('lumipon', 'B')).speciesId).toBe('homurawolf');
    expect(resolveChildSpecies(mk('lumipon', 'A'), mk('kogemaru', 'B')).speciesId).toBe('tsukipon');
  });
  it('同系統はフォールバックで血統と同じ種族', () => {
    const r = resolveChildSpecies(mk('kogemaru', 'A'), mk('kogemaru', 'B'));
    expect(r.speciesId).toBe('kogemaru');
    expect(r.recipe.kind).toBe('fallback');
  });
  it('特殊配合が最優先、symmetric なら順番を問わない', () => {
    expect(resolveChildSpecies(mk('tsukipon', 'A'), mk('kazetsubame', 'B')).speciesId).toBe('auroran');
    expect(resolveChildSpecies(mk('kazetsubame', 'A'), mk('tsukipon', 'B')).speciesId).toBe('auroran');
    expect(resolveChildSpecies(mk('homurawolf', 'A'), mk('homurawolf', 'B')).speciesId).toBe('mitsugashira');
  });
  it('上位種(R3)を血統にしても下位種に戻らない', () => {
    expect(resolveChildSpecies(mk('auroran', 'A'), mk('kogemaru', 'B')).speciesId).toBe('auroran');
  });
  it('条件つき特殊配合は条件を満たすまで成立しない', () => {
    const a = mk('suishoryu', 'A', 10, { plusValue: 1 });
    const b = mk('nijikujaku', 'B', 10, { plusValue: 1 });
    expect(resolveChildSpecies(a, b).speciesId).not.toBe('luxdrago');
    expect(previewBreeding(a, b).nearMiss.length).toBe(1);
    expect(resolveChildSpecies({ ...a, plusValue: 2 }, { ...b, plusValue: 2 }).speciesId).toBe('luxdrago');
  });
  it('同じ入力なら必ず同じ結果', () => {
    const a = mk('mossglow', 'A'), b = mk('iwatokage', 'B');
    const r = Array.from({ length: 20 }, () => resolveChildSpecies(a, b).speciesId);
    expect(new Set(r).size).toBe(1);
  });
});

describe('配合可能条件', () => {
  const world = (ms: MonsterInstance[]) => ({ monsters: ms, partyIds: ms.slice(0, 3).map((m) => m.id), capacity: 20, flags: {} });
  it('同じ個体・同じ性別・レベル不足は不可', () => {
    const a = mk('kogemaru', 'A'), b = mk('lumipon', 'A'), c = mk('lumipon', 'B', 9);
    const w = world([a, b, c]);
    expect(checkBreedable(w, a.id, a.id)).toEqual({ ok: false, error: 'same' });
    expect(checkBreedable(w, a.id, b.id)).toEqual({ ok: false, error: 'sex' });
    expect(checkBreedable(w, a.id, c.id)).toEqual({ ok: false, error: 'level' });
  });
});

describe('継承', () => {
  it('プラス値 = 親の平均 + レベル合計ボーナス', () => {
    expect(computeChildPlus(mk('kogemaru', 'A', 10), mk('lumipon', 'B', 10))).toBe(1);
    expect(computeChildPlus(mk('kogemaru', 'A', 20, { plusValue: 3 }), mk('lumipon', 'B', 20, { plusValue: 2 }))).toBe(2 + 3);
  });
  it('子の能力は種族基礎＋親の一部で、親の合算ではない', () => {
    const a = mk('kogemaru', 'A', 15), b = mk('lumipon', 'B', 15);
    const p = previewBreeding(a, b);
    expect(p.stats.attack).toBeLessThan(a.stats.attack + b.stats.attack);
    expect(p.stats.attack).toBeGreaterThan(11);
  });
  it('親の特技を受け継げる。重複と下位版は除く', () => {
    const a = mk('kogemaru', 'A', 12), b = mk('lumipon', 'B', 12);
    const p = previewBreeding(a, b);
    expect(p.speciesId).toBe('homurawolf');
    expect(p.skills.initial).toEqual(['ember']);
    expect(p.skills.candidates).not.toContain('ember');
    expect(p.skills.candidates).toEqual(expect.arrayContaining(['bite', 'glimmer']));
    expect(p.skills.slots).toBe(7);
  });
});

describe('配合の確定', () => {
  it('子の生成と親の除去を一度に行い、パーティの位置を引きつぐ', () => {
    const a = mk('kogemaru', 'A'), b = mk('lumipon', 'B'), c = mk('mossglow', 'A');
    const w = { monsters: [a, b, c], partyIds: [c.id, a.id], capacity: 20, flags: {} };
    const pv = previewBreeding(a, b);
    const r = executeBreeding(w, a.id, b.id, pv.skills.recommended, createRng(1), 0);
    if (!r.ok) throw new Error(r.error);
    const { world, child } = r.value;
    expect(world.monsters.map((m) => m.id)).toEqual([c.id, child.id]);
    expect(world.partyIds).toEqual([c.id, child.id]);
    expect(child.parentIds).toEqual([a.id, b.id]);
    expect(child.generation).toBe(2);
    expect(child.level).toBe(1);
    expect(maxLevelOf(child)).toBe(pv.maxLevel);
    // 元の world は変わらない
    expect(w.monsters.length).toBe(3);
  });
  it('不正な特技選択なら失敗し、親は失われない', () => {
    const a = mk('kogemaru', 'A'), b = mk('lumipon', 'B');
    const w = { monsters: [a, b], partyIds: [a.id], capacity: 20, flags: {} };
    const r = executeBreeding(w, a.id, b.id, ['judgement'], createRng(1));
    expect(r.ok).toBe(false);
    expect(w.monsters).toHaveLength(2);
  });
});
