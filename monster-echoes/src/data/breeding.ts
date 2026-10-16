import type { BreedingRecipe } from './types';

// 配合レシピ（仕様 12）。評価順は 特殊配合 → 通常配合（系統 × ランクの ルール）→ フォールバック。
// 通常配合は「血統（親A）」の 系統から、親の ランクで きまる ランクの 種族が うまれる（domain/breeding の childByRule）。
// 相手（親B）の 属性に ちかい 種族が えらばれるので、相手を かえると 子も かわる。

const sp = (id: string, a: string, b: string, result: string, hint: string, extra: Partial<BreedingRecipe> = {}): BreedingRecipe =>
  ({ id, kind: 'special', parentA: { speciesId: a }, parentB: { speciesId: b }, symmetric: true, resultSpeciesId: result, priority: 100, hint, ...extra });

/** 特殊配合（第1〜2章で 出会える 種族どうし。Phase 2 で 20種に ふやす） */
const special: BreedingRecipe[] = [
  sp('sp_grassjelly', 'm001', 'm043', 'm010', 'つきの スライムと もりの ようせい。ひかりの つゆを まとった スライムが うまれるらしい。'),
  sp('sp_mossjelly', 'm001', 'm041', 'm003', 'スライムに こけの ねずみの ちからを まぜると、こけいろの スライムに。'),
  sp('sp_ironjelly', 'm013', 'm121', 'm011', 'どうの スライムが こけの きょじんの かたさを まなぶと…。'),
  sp('sp_graybear', 'm023', 'm121', 'm031', 'きの かわの いのししと こけの きょじん。おおきな くまが うまれる。'),
  sp('sp_sleepflower', 'm043', 'm044', 'm047', 'もりの ようせいと キノコの へいたい。ねむりを さそう はなが さく。'),
  sp('sp_poisonorchid', 'm041', 'm044', 'm050', 'どくを もつ ふたりを あわせると、どくの らんが さく。'),
  sp('sp_ironbeetle', 'm061', 'm121', 'm062', 'すばやい はちに いわの かたさを あたえると、はがねの こうちゅうに。'),
  sp('sp_kingjelly', 'm001', 'm002', 'm018', 'ふたつの スライムを よく そだててから あわせると、スライムの おうが うまれるという。', { priority: 110, conditions: [{ type: 'minPlusSum', value: 2 }] }),
];

/** 通常配合（系統 × ランク） */
export const RULE_RECIPE: BreedingRecipe = { id: 'rule_family_rank', kind: 'rule', parentA: { any: true }, parentB: { any: true }, resultSpeciesId: '', priority: 10, hint: '血統の 系統で、親の ランクに おうじた なかまが うまれる。' };

/** どのレシピにも当てはまらないときは血統と同じ種族が生まれる（resultSpeciesId は使わない） */
export const FALLBACK_RECIPE: BreedingRecipe = { id: 'fallback_pedigree', kind: 'fallback', parentA: { any: true }, parentB: { any: true }, resultSpeciesId: '', priority: 0 };

export const BREEDING_RECIPES: BreedingRecipe[] = [...special, RULE_RECIPE, FALLBACK_RECIPE];
