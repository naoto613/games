// 配合の「研究の楽しさ」の確認: 野生で出会える種族から、何世代でどの種族まで届くか
import { describe, expect, it } from 'vitest';
import { ENCOUNTERS } from '../../src/data/areas';
import { SPECIES_LIST, getSpecies } from '../../src/data/monsters';
import { resolveChildSpecies } from '../../src/domain/breeding/BreedingEngine';
import type { MonsterInstance } from '../../src/domain/monster/types';

const fake = (speciesId: string, plusValue = 3) => ({ speciesId, plusValue, level: 20 }) as MonsterInstance;

describe('配合グラフ', () => {
  it('野生の種族から全種族に配合で届き、組み合わせごとに結果が分かれる', () => {
    const wild = new Set(Object.values(ENCOUNTERS).flatMap((t) => t.entries.map((e) => e.speciesId)));
    const gen = new Map<string, number>([...wild].map((id) => [id, 0]));
    const via = new Map<string, string>();
    for (let g = 1; g <= 6; g++) {
      const have = [...gen.keys()];
      for (const a of have) for (const b of have) {
        const r = resolveChildSpecies(fake(a), fake(b)).speciesId;
        if (!gen.has(r)) { gen.set(r, g); via.set(r, `${getSpecies(a).name} × ${getSpecies(b).name}`); }
      }
    }
    for (const sp of SPECIES_LIST) expect(gen.has(sp.id), sp.name).toBe(true);
    // 同じ親のペアでも、どちらを血統にするかで結果が変わる組み合わせの数
    const ids = SPECIES_LIST.map((s) => s.id);
    let orderMatters = 0, pairs = 0;
    const outcomes = new Set<string>();
    for (const a of ids) for (const b of ids) {
      if (a >= b) continue;
      pairs++;
      const x = resolveChildSpecies(fake(a), fake(b)).speciesId, y = resolveChildSpecies(fake(b), fake(a)).speciesId;
      if (x !== y) orderMatters++;
      outcomes.add(x); outcomes.add(y);
    }
    console.log('\n' + SPECIES_LIST.map((s) => `${s.name.padEnd(8, '　')} 世代${gen.get(s.id)}${via.get(s.id) ? '  ' + via.get(s.id) : '（野生）'}`).join('\n'));
    console.log(`ペア ${pairs}通りのうち 血統の順番で結果が変わるもの ${orderMatters}、生まれうる種族 ${outcomes.size}`);
    expect(Math.max(...gen.values())).toBeGreaterThanOrEqual(3); // 長期目標がある
    expect(orderMatters / pairs).toBeGreaterThan(0.4); // 「どちらを血統にするか」で迷える
  });
});
