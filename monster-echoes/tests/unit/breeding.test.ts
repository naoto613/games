import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { createMonster } from '../../src/domain/monster/MonsterFactory';
import type { MonsterInstance } from '../../src/domain/monster/types';
import { checkBreedable, computeChildPlus, executeBreeding, previewBreeding, resolveChildSpecies } from '../../src/domain/breeding/BreedingEngine';
import { maxLevelOf } from '../../src/domain/monster/Growth';
import { getSpecies } from '../../src/data/monsters';

let seed = 100;
const mk = (speciesId: string, sex: 'A' | 'B', level = 10, extra: Partial<MonsterInstance> = {}) => ({ ...createMonster(speciesId, createRng(seed++), { level, sex }), ...extra });

describe('配合レシピの解決（v2：特殊配合 → 通常配合）', () => {
  const sp = (id: string) => getSpecies(id);
  it('通常配合は 血統（親A）の 系統で きまり、相手を いれかえると 系統が かわる', () => {
    const r1 = resolveChildSpecies(mk('m041', 'A'), mk('m023', 'B'));
    expect(r1.recipe.kind).toBe('rule');
    expect(sp(r1.speciesId).familyId).toBe('plant');
    const r2 = resolveChildSpecies(mk('m023', 'A'), mk('m041', 'B'));
    expect(sp(r2.speciesId).familyId).toBe('beast');
  });
  it('ちがう 系統で 親の レベルが たりていれば ランクが ひとつ あがる（同じ 系統なら あがらない）', () => {
    expect(sp(resolveChildSpecies(mk('m041', 'A', 10), mk('m023', 'B', 10)).speciesId).rank).toBe(2);
    expect(sp(resolveChildSpecies(mk('m041', 'A', 10), mk('m042', 'B', 10)).speciesId).rank).toBe(1);
  });
  it('ランク3を こえるには 高位配合（第6章）が いる。伝説級は 通常配合では うまれない', () => {
    const a = mk('m070', 'A', 40), b = mk('m031', 'B', 40); // ★2 × ★2
    expect(sp(resolveChildSpecies(a, b).speciesId).rank).toBe(3);
    const hi = mk('m018', 'A', 40), hi2 = mk('m014', 'B', 40); // ★3 × ★3（同じ系統）
    expect(sp(resolveChildSpecies(hi, mk('m031', 'B', 40)).speciesId).rank).toBeLessThanOrEqual(3);
    expect(sp(resolveChildSpecies(hi, mk('m031', 'B', 40), { highBreeding: true }).speciesId).rank).toBe(4);
    expect(sp(resolveChildSpecies(hi, hi2, { highBreeding: true }).speciesId).rank).toBeLessThan(5);
  });
  it('特殊配合が 最優先、symmetric なら 順番を 問わない', () => {
    expect(resolveChildSpecies(mk('m001', 'A'), mk('m043', 'B')).speciesId).toBe('m010');
    expect(resolveChildSpecies(mk('m043', 'A'), mk('m001', 'B')).speciesId).toBe('m010');
    expect(resolveChildSpecies(mk('m041', 'A'), mk('m044', 'B')).speciesId).toBe('m050');
  });
  it('条件つき特殊配合は 条件を みたすまで 成立しない', () => {
    const a = mk('m001', 'A', 10, { plusValue: 0 });
    const b = mk('m002', 'B', 10, { plusValue: 1 });
    expect(resolveChildSpecies(a, b).speciesId).not.toBe('m018');
    expect(previewBreeding(a, b).nearMiss.length).toBe(1);
    expect(resolveChildSpecies({ ...a, plusValue: 1 }, b).speciesId).toBe('m018');
  });
  it('同じ入力なら必ず同じ結果', () => {
    const a = mk('m042', 'A'), b = mk('m121', 'B');
    const r = Array.from({ length: 20 }, () => resolveChildSpecies(a, b).speciesId);
    expect(new Set(r).size).toBe(1);
  });
});

describe('配合可能条件', () => {
  const world = (ms: MonsterInstance[]) => ({ monsters: ms, partyIds: ms.slice(0, 3).map((m) => m.id), capacity: 20, flags: {} });
  it('同じ個体・同じ性別・レベル不足は不可', () => {
    const a = mk('m023', 'A'), b = mk('m001', 'A'), c = mk('m001', 'B', 9);
    const w = world([a, b, c]);
    expect(checkBreedable(w, a.id, a.id)).toEqual({ ok: false, error: 'same' });
    expect(checkBreedable(w, a.id, b.id)).toEqual({ ok: false, error: 'sex' });
    expect(checkBreedable(w, a.id, c.id)).toEqual({ ok: false, error: 'level' });
  });
});

describe('継承', () => {
  it('プラス値 = 親の平均 + レベル合計ボーナス', () => {
    expect(computeChildPlus(mk('m023', 'A', 10), mk('m001', 'B', 10))).toBe(1);
    expect(computeChildPlus(mk('m023', 'A', 20, { plusValue: 3 }), mk('m001', 'B', 20, { plusValue: 2 }))).toBe(2 + 3);
  });
  it('子の能力は種族基礎＋親の一部で、親の合算ではない', () => {
    const a = mk('m023', 'A', 15), b = mk('m001', 'B', 15);
    const p = previewBreeding(a, b);
    expect(p.stats.attack).toBeLessThan(a.stats.attack + b.stats.attack);
    expect(p.stats.attack).toBeGreaterThan(8);
  });
  it('親の特技を受け継げる。重複と下位版は除く', () => {
    const a = mk('m041', 'A', 12), b = mk('m044', 'B', 12);
    const p = previewBreeding(a, b);
    expect(p.speciesId).toBe('m050');
    expect(p.skills.initial).toEqual(getSpecies('m050').learnset.filter((e) => e.level === 1).map((e) => e.skillId));
    expect(p.skills.candidates.length).toBeGreaterThan(0);
    for (const c of p.skills.candidates) expect(p.skills.initial).not.toContain(c);
    // 第5章（スキル継承の拡張）いこうは 空きいっぱい
    expect(previewBreeding(a, b, { skillInheritPlus: true }).skills.slots).toBe(8 - p.skills.initial.length);
  });
  it('うけつげる とくぎの 数は 機能の 解放で ふえる（はじめ 1つ・第2章クリアで 3つ・第5章で 空きいっぱい）', () => {
    const a = mk('m041', 'A', 12), b = mk('m044', 'B', 12);
    expect(previewBreeding(a, b).skills.slots).toBe(1);
    expect(previewBreeding(a, b, { skillInherit: true }).skills.slots).toBe(3);
    expect(previewBreeding(a, b, { skillInherit: true, skillInheritPlus: true }).skills.slots).toBe(8 - previewBreeding(a, b).skills.initial.length);
    // おすすめも 上限まで、上限を こえる 選びかたは 配合できない
    expect(previewBreeding(a, b).skills.recommended.length).toBeLessThanOrEqual(1);
    const w = { monsters: [a, b], partyIds: [a.id], capacity: 20, flags: {} };
    const cands = previewBreeding(a, b).skills.candidates;
    if (cands.length >= 2) expect(executeBreeding(w, a.id, b.id, cands.slice(0, 2), createRng(1), 0).ok).toBe(false);
  });
});

describe('配合の確定', () => {
  it('子の生成と親の除去を一度に行い、パーティの位置を引きつぐ', () => {
    const a = mk('m081', 'A'), b = mk('m001', 'B'), c = mk('m042', 'A');
    const w = { monsters: [a, b, c], partyIds: [c.id, a.id], capacity: 20, flags: {} };
    const pv = previewBreeding(a, b);
    const r = executeBreeding(w, a.id, b.id, pv.skills.recommended, createRng(1), 0);
    if (!r.ok) throw new Error(r.error);
    const { world, child } = r.value;
    expect(world.monsters.map((m) => m.id)).toEqual([c.id, child.id]);
    expect(world.partyIds).toEqual([c.id, child.id]);
    expect(child.speciesId).toBe(pv.speciesId);
    expect(getSpecies(child.speciesId).familyId).toBe('bird');
    expect(child.parentIds).toEqual([a.id, b.id]);
    expect(child.generation).toBe(2);
    expect(maxLevelOf(child)).toBe(pv.maxLevel);
    expect(w.monsters.length).toBe(3);
  });
  it('不正な特技選択なら失敗し、親は失われない', () => {
    const a = mk('m023', 'A'), b = mk('m001', 'B');
    const w = { monsters: [a, b], partyIds: [a.id], capacity: 20, flags: {} };
    expect(executeBreeding(w, a.id, b.id, ['judgement'], createRng(1)).ok).toBe(false);
    expect(w.monsters).toHaveLength(2);
  });
});
