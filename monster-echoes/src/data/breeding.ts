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
  // ---- ひろがった なかま（色ちがい・ちほうの なかま）
  { id: 'sp_flameslime', kind: 'special', parentA: { speciesId: 'lunaslime' }, parentB: { speciesId: 'magmadog' }, symmetric: true, resultSpeciesId: 'flameslime', priority: 100, hint: 'スライムに ほのおの けものを あわせると、あかく もえる スライムに。' },
  { id: 'sp_shadowdog', kind: 'special', parentA: { speciesId: 'magmadog' }, parentB: { speciesId: 'ghostbill' }, symmetric: true, resultSpeciesId: 'shadowdog', priority: 100, hint: 'ほのおの けものが あくまの ほのおを あびると、かげの けものに。' },
  { id: 'sp_icewolf', kind: 'special', parentA: { speciesId: 'magmadog' }, parentB: { speciesId: 'icekrill' }, symmetric: true, resultSpeciesId: 'icewolf', priority: 100, hint: 'ほのおの けものと こおりの けっしょうで、ゆきの おおかみが うまれる。' },
  { id: 'sp_claygolem', kind: 'special', parentA: { speciesId: 'stonegolem' }, parentB: { speciesId: 'sandworm' }, symmetric: true, resultSpeciesId: 'claygolem', priority: 100, hint: 'いわの きょじんが すなの むしと まざると、あかい つちの ゴーレムに。' },
  { id: 'sp_rubykrill', kind: 'special', parentA: { speciesId: 'icekrill' }, parentB: { speciesId: 'ghostbill' }, symmetric: true, resultSpeciesId: 'rubykrill', priority: 100, hint: 'こおりの けっしょうに あくまの ほのおを やどすと、ルビーいろに かがやく。' },
  { id: 'sp_thunderbird', kind: 'special', parentA: { speciesId: 'frostbird' }, parentB: { speciesId: 'lightningleo' }, symmetric: true, resultSpeciesId: 'thunderbird', priority: 100, hint: 'ゆきの とりが いなずまの ししと であうと、かみなりを よぶ とりに。' },
  { id: 'sp_blazebird', kind: 'special', parentA: { speciesId: 'frostbird' }, parentB: { speciesId: 'firedragon' }, symmetric: true, resultSpeciesId: 'blazebird', priority: 100, hint: 'あおい とりに ほのおの りゅうの ちからを わけると、あかく もえる とりに。' },
  { id: 'sp_magmaworm', kind: 'special', parentA: { speciesId: 'sandworm' }, parentB: { speciesId: 'firedragon' }, symmetric: true, resultSpeciesId: 'magmaworm', priority: 100, hint: 'すなの むしが ほのおの りゅうの ねつを あびると、マグマの むしに。' },
  { id: 'sp_venomworm', kind: 'special', parentA: { speciesId: 'sandworm' }, parentB: { speciesId: 'kinoborg' }, symmetric: true, resultSpeciesId: 'venomworm', priority: 100, hint: 'どくの キノコと すなの むしが まざると、どくを ためた むしに。' },
  { id: 'sp_aquasprite', kind: 'special', parentA: { speciesId: 'greensprite' }, parentB: { speciesId: 'devilcrab' }, symmetric: true, resultSpeciesId: 'aquasprite', priority: 100, hint: 'もりの ようせいが みずの カニと あそぶと、みずの ようせいに なる。' },
  { id: 'sp_redeye', kind: 'special', parentA: { speciesId: 'darkeye' }, parentB: { speciesId: 'magmadog' }, symmetric: true, resultSpeciesId: 'redeye', priority: 100, hint: 'ひとつめが ほのおの けものの ちを あびると、めが まっかに そまる。' },
  { id: 'sp_hellbill', kind: 'special', parentA: { speciesId: 'ghostbill' }, parentB: { speciesId: 'firedragon' }, symmetric: true, resultSpeciesId: 'hellbill', priority: 100, hint: 'こあくまが ほのおの りゅうの ひを のみこむと、ごうかを まとう。' },
  { id: 'sp_icedragon', kind: 'special', parentA: { speciesId: 'firedragon' }, parentB: { speciesId: 'frostbird' }, symmetric: true, resultSpeciesId: 'icedragon', priority: 105, hint: 'ほのおの りゅうが ゆきの とりと くらすと、こおりの りゅうに かわる。' },
  { id: 'sp_crimsondragon', kind: 'special', parentA: { speciesId: 'darkdragon' }, parentB: { speciesId: 'firedragon' }, symmetric: true, resultSpeciesId: 'crimsondragon', priority: 105, conditions: [{ type: 'minPlusSum', value: 2 }], hint: 'やみの りゅうが ほのおの りゅうの ひで そまると…。すこし そだてた りゅうどうしで。' },
  { id: 'sp_moonleo', kind: 'special', parentA: { speciesId: 'lightningleo' }, parentB: { speciesId: 'lunaslime' }, symmetric: true, resultSpeciesId: 'moonleo', priority: 105, conditions: [{ type: 'minPlusSum', value: 2 }], hint: 'いなずまの ししが つきの スライムと ひかりを わけあうと、しろい ししに。' },
  { id: 'sp_poisonborg', kind: 'special', parentA: { speciesId: 'kinoborg' }, parentB: { speciesId: 'ghostbill' }, symmetric: true, resultSpeciesId: 'poisonborg', priority: 100, hint: 'キノコの まものに あくまの ほのおを あびせると、どくの キノコに。' },
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
