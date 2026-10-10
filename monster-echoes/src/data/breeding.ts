import type { BreedingRecipe, FamilyId } from './types';

// 配合レシピ。評価順は 特殊配合 → 系統の組み合わせ → フォールバック。
// 系統配合は「血統（親A）」の系統で子が決まる。相手（親B）を入れ替えると結果が変わる。

const R2_OF: Partial<Record<FamilyId, string>> = {
  spirit: 'tsukipon',
  beast: 'homurawolf',
  mineral: 'haganegame',
  bird: 'kazetsubame',
  plant: 'madoidake',
};
const BASIC: FamilyId[] = ['spirit', 'beast', 'mineral', 'bird', 'plant'];

const special: BreedingRecipe[] = [
  { id: 'sp_auroran', kind: 'special', parentA: { speciesId: 'tsukipon' }, parentB: { speciesId: 'kazetsubame' }, symmetric: true, resultSpeciesId: 'auroran', priority: 100, hint: 'つきの せいれいが かぜに のると、そらに ひかりの まくが かかるという。' },
  { id: 'sp_mitsugashira', kind: 'special', parentA: { speciesId: 'homurawolf' }, parentB: { speciesId: 'homurawolf' }, resultSpeciesId: 'mitsugashira', priority: 100, hint: 'ほのおの おおかみ どうしが であうと、あたまの おおい こが うまれるらしい。' },
  { id: 'sp_suishoryu', kind: 'special', parentA: { speciesId: 'haganegame' }, parentB: { speciesId: 'tsukipon' }, symmetric: true, resultSpeciesId: 'suishoryu', priority: 100, hint: 'はがねに つきの ひかりを とじこめると、すいしょうの りゅうに なるという。' },
  { id: 'sp_morinushi', kind: 'special', parentA: { speciesId: 'madoidake' }, parentB: { speciesId: 'haganegame' }, symmetric: true, resultSpeciesId: 'morinushi', priority: 100, hint: 'まどわしの キノコが かたい こうらに ねを はると、もりの ぬしが そだつ。' },
  { id: 'sp_nijikujaku', kind: 'special', parentA: { speciesId: 'kazetsubame' }, parentB: { speciesId: 'auroran' }, symmetric: true, resultSpeciesId: 'nijikujaku', priority: 100, hint: 'かぜの とりが オーロラを くぐると、なないろの はねに なるそうだ。' },
  { id: 'sp_luxdrago', kind: 'special', parentA: { speciesId: 'suishoryu' }, parentB: { speciesId: 'nijikujaku' }, symmetric: true, resultSpeciesId: 'luxdrago', priority: 110, conditions: [{ type: 'minPlusSum', value: 4 }], hint: 'すいしょうの りゅうと にじの とり。どちらも なんども 配合を かさねた つよい こなら…。' },
];

const family: BreedingRecipe[] = BASIC.flatMap((a) =>
  BASIC.filter((b) => b !== a).map((b) => ({
    id: `fam_${a}_${b}`,
    kind: 'familyCombination' as const,
    parentA: { familyId: a, maxRarity: 2 },
    parentB: { familyId: b },
    resultSpeciesId: R2_OF[a]!,
    priority: 50,
  })),
);

/** どのレシピにも当てはまらないときは血統と同じ種族が生まれる（resultSpeciesId は使わない） */
export const FALLBACK_RECIPE: BreedingRecipe = { id: 'fallback_pedigree', kind: 'fallback', parentA: { any: true }, parentB: { any: true }, resultSpeciesId: '', priority: 0 };

export const BREEDING_RECIPES: BreedingRecipe[] = [...special, ...family, FALLBACK_RECIPE];
