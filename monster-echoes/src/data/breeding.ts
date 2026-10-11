import type { BreedingRecipe, FamilyId } from './types';

// 配合レシピ。評価順は 特殊配合 → 系統の組み合わせ → フォールバック。
// 系統配合は「血統（親A）」の系統で子が決まる。相手（親B）を入れ替えると結果が変わる。

/** 血統の系統ごとに、ちがう系統の相手と 配合したときに うまれる 種族（ない系統は 血統と同じ種族） */
const R2_OF: Partial<Record<FamilyId, string>> = {
  demon: 'darkeye',
  material: 'icekrill',
  bird: 'windcat',
  plant: 'greensprite',
  spirit: 'lightningleo',
};
const FAMILY_LIST: FamilyId[] = ['slime', 'beast', 'material', 'bird', 'bug', 'plant', 'spirit', 'demon', 'water', 'dragon'];

const special: BreedingRecipe[] = [
  { id: 'sp_firedragon', kind: 'special', parentA: { speciesId: 'magmadog' }, parentB: { speciesId: 'sandworm' }, symmetric: true, resultSpeciesId: 'firedragon', priority: 100, hint: 'マグマの けものと だいちの むし。ほのおを はく りゅうが うまれるらしい。' },
  { id: 'sp_kinoborg', kind: 'special', parentA: { speciesId: 'leafant' }, parentB: { speciesId: 'sandworm' }, symmetric: true, resultSpeciesId: 'kinoborg', priority: 100, hint: 'もりの せいれいが つちの なかの むしと であうと、キノコの まものに なるとか。' },
  { id: 'sp_metalspirit', kind: 'special', parentA: { speciesId: 'lunaslime' }, parentB: { speciesId: 'icekrill' }, symmetric: true, resultSpeciesId: 'metalspirit', priority: 100, hint: 'スライムに こおりの けっしょうを まぜると、ぎんいろに かがやく スライムが うまれる。' },
  { id: 'sp_darkdragon', kind: 'special', parentA: { speciesId: 'firedragon' }, parentB: { speciesId: 'darkeye' }, symmetric: true, resultSpeciesId: 'darkdragon', priority: 100, hint: 'ほのおの りゅうに やみの ひとつめの ちからを あたえると…。' },
  { id: 'sp_goldslime', kind: 'special', parentA: { speciesId: 'metalspirit' }, parentB: { speciesId: 'lightningleo' }, symmetric: true, resultSpeciesId: 'goldslime', priority: 110, conditions: [{ type: 'minPlusSum', value: 4 }], hint: 'ぎんの スライムと いなずまの ししを、なんども 配合を かさねた つよい こどうしで あわせると…。' },
  { id: 'sp_chaosdragon', kind: 'special', parentA: { speciesId: 'darkdragon' }, parentB: { speciesId: 'ghostbill' }, symmetric: true, resultSpeciesId: 'chaosdragon', priority: 110, conditions: [{ type: 'minPlusSum', value: 4 }], hint: 'やみの りゅうに あくまの ほのおを やどすと、でんせつの りゅうが めざめるという。ただし どちらも つよく そだてること。' },
];

const family: BreedingRecipe[] = FAMILY_LIST.filter((a) => R2_OF[a]).flatMap((a) =>
  FAMILY_LIST.filter((b) => b !== a).map((b) => ({
    id: `fam_${a}_${b}`,
    kind: 'familyCombination' as const,
    parentA: { familyId: a, maxRarity: 1 },
    parentB: { familyId: b },
    resultSpeciesId: R2_OF[a]!,
    priority: 50,
  })),
);

/** どのレシピにも当てはまらないときは血統と同じ種族が生まれる（resultSpeciesId は使わない） */
export const FALLBACK_RECIPE: BreedingRecipe = { id: 'fallback_pedigree', kind: 'fallback', parentA: { any: true }, parentB: { any: true }, resultSpeciesId: '', priority: 0 };

export const BREEDING_RECIPES: BreedingRecipe[] = [...special, ...family, FALLBACK_RECIPE];
