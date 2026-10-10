import type { FamilyDefinition, FamilyId, MonsterSpecies, Stats } from './types';

export const FAMILIES: Record<FamilyId, FamilyDefinition> = {
  spirit: { id: 'spirit', name: 'せいれい', baseResistances: { light: 2, ice: 1, sleep: 1, earth: -1 } },
  beast: { id: 'beast', name: 'けもの', baseResistances: { fire: 1, ice: -1, confusion: -1 } },
  mineral: { id: 'mineral', name: 'こうせき', baseResistances: { earth: 2, fire: 1, poison: 3, wind: -1 } },
  bird: { id: 'bird', name: 'とり', baseResistances: { earth: 3, wind: 1, ice: -1, paralysis: -1 } },
  plant: { id: 'plant', name: 'しょくぶつ', baseResistances: { earth: 1, poison: 1, sleep: 1, fire: -1 } },
  mystery: { id: 'mystery', name: '？？？', baseResistances: { light: 2, fire: 1, ice: 1, wind: 1, earth: 1, sleep: 2, paralysis: 2, confusion: 2, poison: 2 } },
};

const S = (hp: number, mp: number, attack: number, defense: number, speed: number, wisdom: number): Stats => ({ hp, mp, attack, defense, speed, wisdom });

type Tier = { cap: number; expRate: number; expYield: number; goldYield: number; recruit: number; statCaps: Stats };
const TIER: Record<number, Tier> = {
  1: { cap: 20, expRate: 1, expYield: 5, goldYield: 4, recruit: 0.14, statCaps: S(220, 160, 160, 160, 160, 160) },
  2: { cap: 25, expRate: 1.25, expYield: 9, goldYield: 7, recruit: 0.07, statCaps: S(300, 220, 220, 220, 220, 220) },
  3: { cap: 30, expRate: 1.5, expYield: 16, goldYield: 12, recruit: 0.03, statCaps: S(420, 300, 300, 300, 300, 300) },
  4: { cap: 40, expRate: 2, expYield: 30, goldYield: 30, recruit: 0, statCaps: S(600, 400, 400, 400, 400, 400) },
};

function sp(
  id: string, name: string, familyId: FamilyId, rarity: number, base: Stats, growth: Stats,
  learnset: [number, string][], description: string, extra: Partial<MonsterSpecies> = {},
): MonsterSpecies {
  const t = TIER[rarity];
  return {
    id, name, familyId, rarity, baseStats: base, growth, growthCurves: {}, statCaps: t.statCaps,
    resistances: {}, learnset: learnset.map(([level, skillId]) => ({ level, skillId })),
    baseLevelCap: t.cap, absoluteLevelCap: 99, expRate: t.expRate, expYield: t.expYield, goldYield: t.goldYield,
    recruitBaseChance: t.recruit, spriteId: id, description, ...extra,
  };
}

const list: MonsterSpecies[] = [
  // ---- せいれい系
  sp('lumipon', 'ルミポン', 'spirit', 1, S(13, 8, 8, 7, 9, 10), S(3.6, 2.8, 2.3, 2.0, 2.6, 3.0),
    [[1, 'heal'], [6, 'glimmer'], [12, 'veil']], 'ひかりと みずの しずくから うまれた せいれい。こうきしんが つよい。', { growthCurves: { wisdom: 'early' } }),
  sp('tsukipon', 'ツキポン', 'spirit', 2, S(16, 12, 9, 9, 11, 14), S(4.2, 3.4, 2.6, 2.6, 2.8, 3.6),
    [[1, 'lullaby'], [8, 'icicle'], [15, 'healall']], 'つきの ひかりを あびて そだった ルミポンの なかま。よるに なると ひかる。'),
  sp('auroran', 'オーロラン', 'spirit', 3, S(22, 16, 12, 14, 14, 18), S(5.0, 4.0, 3.0, 3.3, 3.2, 4.4),
    [[1, 'veil'], [12, 'revive'], [20, 'lightrain']], 'そらに かかる オーロラの せいれい。たおれた なかまを うたで よびもどす。', { resistances: { fire: 1 }, growthCurves: { hp: 'late' } }),
  // ---- けもの系
  sp('kogemaru', 'コゲマル', 'beast', 1, S(15, 4, 11, 7, 9, 5), S(4.2, 1.5, 3.2, 2.0, 2.6, 1.4),
    [[1, 'bite'], [5, 'ember'], [11, 'focus']], 'しっぽに すみびを ともした こいぬ。げんきで くいしんぼう。', { growthCurves: { attack: 'early' } }),
  sp('homurawolf', 'ホムラウルフ', 'beast', 2, S(19, 7, 14, 9, 13, 7), S(4.8, 2.0, 3.8, 2.4, 3.4, 1.8),
    [[1, 'ember'], [8, 'glare'], [15, 'flamebreath']], 'ほのおの たてがみを もつ おおかみ。むれで かりを する。', { resistances: { fire: 2 } }),
  sp('mitsugashira', 'ミツガシラ', 'beast', 3, S(28, 10, 19, 13, 13, 9), S(6.2, 2.5, 4.8, 3.2, 3.2, 2.2),
    [[1, 'sweep'], [12, 'triplebite'], [20, 'flamebreath']], '3つの あたまを もつ ばんけん。それぞれ せいかくが ちがう。', { resistances: { fire: 2 }, growthCurves: { attack: 'late', hp: 'late' } }),
  // ---- こうせき系
  sp('iwatokage', 'イワトカゲ', 'mineral', 1, S(17, 3, 9, 12, 4, 4), S(4.6, 1.2, 2.5, 3.4, 1.3, 1.3),
    [[1, 'pebbles'], [6, 'harden'], [12, 'tackle']], 'せなかに こうせきを せおった トカゲ。のんびりや。ダメージを うけると せなかが ひかる。'),
  sp('haganegame', 'ハガネガメ', 'mineral', 2, S(22, 5, 11, 16, 5, 6), S(5.4, 1.6, 2.9, 4.2, 1.5, 1.8),
    [[1, 'veil'], [8, 'tackle'], [15, 'rockfall']], 'はがねの こうらを もつ カメ。どんな こうげきも はじきかえす。'),
  sp('suishoryu', 'スイショウリュウ', 'mineral', 3, S(30, 12, 17, 20, 9, 14), S(6.4, 3.0, 4.2, 4.6, 2.4, 3.6),
    [[1, 'glimmer'], [12, 'rockfall'], [20, 'crystalbreath']], 'すいしょうの うろこに おおわれた りゅう。ひかりを ためこんで はきだす。', { resistances: { light: 2 }, growthCurves: { defense: 'early' } }),
  // ---- とり系
  sp('yorufukuro', 'ヨルフクロ', 'bird', 1, S(12, 6, 8, 6, 13, 8), S(3.4, 2.2, 2.4, 1.8, 3.4, 2.4),
    [[1, 'gust'], [5, 'lullaby'], [11, 'peck']], 'ほしもようの はねを もつ フクロウ。しんちょうで よるに つよい。'),
  sp('kazetsubame', 'カゼツバメ', 'bird', 2, S(15, 9, 11, 8, 17, 10), S(3.9, 2.6, 3.0, 2.1, 4.2, 2.8),
    [[1, 'peck'], [8, 'haste'], [15, 'tornado']], 'かぜに のって せかいを かける ツバメ。だれよりも はやい。', { growthCurves: { speed: 'early' } }),
  sp('nijikujaku', 'ニジクジャク', 'bird', 3, S(24, 15, 14, 12, 19, 17), S(5.2, 3.6, 3.6, 3.0, 4.4, 4.0),
    [[1, 'dazzle'], [12, 'tornado'], [20, 'healall']], 'なないろの はねを ひろげて まう クジャク。みた ものを まどわせる。'),
  // ---- しょくぶつ系
  sp('mossglow', 'モスグロウ', 'plant', 1, S(16, 6, 7, 9, 5, 8), S(4.6, 2.2, 2.0, 2.6, 1.6, 2.4),
    [[1, 'stunspore'], [4, 'heal'], [10, 'antidote']], 'こけと ちいさな きの からだを もつ。おんこうで なかまおもい。'),
  sp('madoidake', 'マドイダケ', 'plant', 2, S(19, 10, 9, 10, 7, 12), S(5.0, 3.0, 2.4, 2.8, 2.0, 3.2),
    [[1, 'poisonmist'], [8, 'dazzle'], [15, 'lullaby']], 'あやしい ほうしを まきちらす キノコ。もりで まよう ひとの しわざは だいたい こいつ。'),
  sp('morinushi', 'モリヌシ', 'plant', 3, S(32, 14, 13, 17, 8, 15), S(6.8, 3.6, 3.2, 4.0, 2.0, 3.6),
    [[1, 'antidote'], [12, 'healall'], [20, 'revive']], 'もりの ぬしと よばれる おおきな き。せなかで ことりが くらしている。', { growthCurves: { hp: 'late', defense: 'late' } }),
  // ---- ？？？系
  sp('luxdrago', 'ルクスドラゴ', 'mystery', 4, S(36, 20, 22, 20, 18, 22), S(7.2, 4.4, 5.0, 4.4, 4.0, 4.8),
    [[1, 'lightrain'], [15, 'crystalbreath'], [25, 'judgement']], 'ひかりの クリスタルを まもると いわれる でんせつの りゅう。', { growthCurves: { attack: 'late', wisdom: 'late' } }),
];

export const SPECIES: Record<string, MonsterSpecies> = Object.fromEntries(list.map((s) => [s.id, s]));
export const SPECIES_LIST = list;

export function getSpecies(id: string): MonsterSpecies {
  const s = SPECIES[id];
  if (!s) throw new Error(`unknown species: ${id}`);
  return s;
}
