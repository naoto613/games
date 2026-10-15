// 配合の「研究の楽しさ」の確認: 第1章で 出会える 種族から、何世代で どこまで 届くか（v2 の 通常配合＋特殊配合）
import { describe, expect, it } from 'vitest';
import { ENCOUNTERS } from '../../src/data/areas';
import { BREEDING_RECIPES } from '../../src/data/breeding';
import { SPECIES, SPECIES_LIST, getSpecies } from '../../src/data/monsters';
import { resolveChildSpecies } from '../../src/domain/breeding/BreedingEngine';
import type { MonsterInstance } from '../../src/domain/monster/types';

const fake = (speciesId: string, plusValue = 3) => ({ speciesId, plusValue, level: 20 }) as MonsterInstance;

describe('配合グラフ', () => {
  it('第1章の 野生から 配合で 種族が ひろがり、血統の 順番で 結果が わかれる', () => {
    const wild = new Set(Object.values(ENCOUNTERS).flatMap((t) => t.entries.map((e) => e.speciesId)));
    const gen = new Map<string, number>([...wild].map((id) => [id, 0]));
    const via = new Map<string, string>();
    for (let g = 1; g <= 4; g++) {
      const have = [...gen.keys()];
      for (const a of have) for (const b of have) {
        const r = resolveChildSpecies(fake(a), fake(b)).speciesId;
        if (!gen.has(r)) { gen.set(r, g); via.set(r, `${getSpecies(a).name} × ${getSpecies(b).name}`); }
      }
    }
    const bred = [...gen.keys()].filter((id) => !wild.has(id));
    console.log(`\n野生 ${wild.size}種 → 配合で ${bred.length}種：` + bred.map((id) => `${getSpecies(id).name}(世代${gen.get(id)})`).join('、'));
    expect(bred.length).toBeGreaterThanOrEqual(15); // 第1〜2章で 配合の 研究が できる
    expect(Math.max(...gen.values())).toBeGreaterThanOrEqual(2); // 長期目標が ある
    // 配合で うまれるのは 伝説級（★5）・ボス由来 いがい
    for (const id of gen.keys()) { const sp = getSpecies(id); expect(sp.rank ?? 1, sp.name).toBeLessThan(5); }
    // 同じ ペアでも どちらを 血統に するかで 結果が かわる
    const ids = [...wild];
    let orderMatters = 0, pairs = 0;
    for (const a of ids) for (const b of ids) {
      if (a >= b) continue;
      pairs++;
      if (resolveChildSpecies(fake(a), fake(b)).speciesId !== resolveChildSpecies(fake(b), fake(a)).speciesId) orderMatters++;
    }
    expect(orderMatters / pairs).toBeGreaterThan(0.4);
  });
  it('200種の うち 通常配合の ルールで 届く 種族が おおい（ランク4まで・ボス由来を のぞく）', () => {
    const reachable = new Set<string>();
    for (const a of SPECIES_LIST) for (const b of SPECIES_LIST) reachable.add(resolveChildSpecies(fake(a.id), fake(b.id)).speciesId);
    const target = SPECIES_LIST.filter((s) => (s.rank ?? 1) < 5 && !s.noBreed);
    const hit = target.filter((s) => reachable.has(s.id)).length;
    console.log(`通常・特殊配合で うまれうる 種族 ${hit}/${target.length}`);
    expect(hit / target.length).toBeGreaterThan(0.5);
  });
  it('特殊配合の 参照先が すべて ある', () => {
    for (const r of BREEDING_RECIPES.filter((x) => x.kind === 'special')) {
      expect(SPECIES[r.resultSpeciesId], r.id).toBeTruthy();
      for (const m of [r.parentA, r.parentB]) if ('speciesId' in m) expect(SPECIES[m.speciesId], r.id).toBeTruthy();
    }
  });
});
