import type { FamilyDefinition, FamilyId, MonsterSpecies, Stats } from './types';

// 系統（図鑑の 10 系統）
export const FAMILIES: Record<FamilyId, FamilyDefinition> = {
  slime: { id: 'slime', name: 'スライム', baseResistances: { ice: 1, sleep: 1, earth: -1 } },
  beast: { id: 'beast', name: 'けもの', baseResistances: { fire: 1, ice: -1, confusion: -1 } },
  material: { id: 'material', name: 'ぶっしつ', baseResistances: { earth: 2, poison: 3, sleep: 2, thunder: -1 } },
  bird: { id: 'bird', name: 'とり', baseResistances: { earth: 3, wind: 1, thunder: -1 } },
  bug: { id: 'bug', name: 'むし', baseResistances: { earth: 1, poison: 2, fire: -1 } },
  plant: { id: 'plant', name: 'しょくぶつ', baseResistances: { earth: 1, poison: 1, sleep: 1, fire: -1 } },
  spirit: { id: 'spirit', name: 'せいれい', baseResistances: { thunder: 2, light: 1, paralysis: 2, earth: -1 } },
  demon: { id: 'demon', name: 'あくま', baseResistances: { confusion: 2, sleep: 1, poison: 1, light: -1 } },
  water: { id: 'water', name: 'みず', baseResistances: { ice: 2, fire: 1, thunder: -1 } },
  dragon: { id: 'dragon', name: 'ドラゴン', baseResistances: { fire: 1, ice: 1, sleep: 1, paralysis: 1 } },
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

// 役割ごとの 基本能力（Lv1）と 1レベルの のび
type Role = [Stats, Stats];
const ROLE: Record<string, Role> = {
  healer: [S(13, 8, 8, 7, 9, 10), S(3.6, 2.8, 2.3, 2.0, 2.6, 3.0)],
  attacker: [S(15, 4, 11, 7, 9, 5), S(4.2, 1.5, 3.2, 2.0, 2.6, 1.4)],
  tank: [S(18, 3, 9, 12, 4, 4), S(4.8, 1.2, 2.6, 3.4, 1.2, 1.3)],
  speed: [S(12, 6, 8, 6, 13, 8), S(3.4, 2.2, 2.4, 1.8, 3.4, 2.4)],
  caster: [S(13, 9, 7, 7, 9, 12), S(3.6, 3.0, 2.0, 2.0, 2.6, 3.4)],
  bruiser: [S(17, 5, 12, 9, 6, 5), S(4.8, 1.6, 3.4, 2.6, 1.8, 1.6)],
  metal: [S(8, 8, 9, 22, 16, 9), S(1.8, 2.2, 2.4, 5.0, 4.2, 2.2)],
};
const TIER_SCALE: Record<number, [number, number]> = { 1: [1, 1], 2: [1.2, 1.15], 3: [1.5, 1.35], 4: [1.8, 1.55] };
const scale = (st: Stats, k: number): Stats => Object.fromEntries(Object.entries(st).map(([key, v]) => [key, Math.round(v * k * 10) / 10])) as Stats;
function mon(id: string, name: string, familyId: FamilyId, rarity: number, role: string, learnset: [number, string][], description: string, extra: Partial<MonsterSpecies> = {}) {
  const [b, g] = ROLE[role];
  const [kb, kg] = TIER_SCALE[rarity];
  const base = scale(b, kb);
  for (const k of Object.keys(base) as (keyof Stats)[]) base[k] = Math.round(base[k]);
  return sp(id, name, familyId, rarity, base, scale(g, kg), learnset, description, extra);
}

// 図鑑の順（No.01〜20）
const list: MonsterSpecies[] = [
  mon('lunaslime', 'ルナスライム', 'slime', 1, 'healer', [[1, 'heal'], [6, 'veil'], [12, 'glimmer']], 'つきの ひかりを あびて うまれた みずいろの しずくがた モンスター。おんこうで なかまに なりやすい。', { growthCurves: { wisdom: 'early' } }),
  mon('magmadog', 'マグマドッグ', 'beast', 1, 'attacker', [[1, 'firefang'], [5, 'ember'], [11, 'focus']], 'すみのような くろい けなみと ほのおの たてがみを もつ けもの。こうげきりょくが たかい。', { resistances: { fire: 2 }, growthCurves: { attack: 'early' } }),
  mon('stonegolem', 'ストーンゴーレム', 'material', 1, 'tank', [[1, 'harden'], [6, 'pebbles'], [14, 'rockfall']], 'いわと こけで できた きょじん。うごきは おそいが しゅびりょくが ひじょうに たかい。'),
  mon('frostbird', 'フロストバード', 'bird', 1, 'speed', [[1, 'wingstrike'], [5, 'icefeather'], [11, 'haste']], 'ゆきやまに すむ あおじろい とり。すばやく、こおりの はねを とばして こうげきする。', { resistances: { ice: 2, fire: -1 } }),
  mon('sandworm', 'サンドワーム', 'bug', 1, 'bruiser', [[1, 'bite'], [6, 'dust'], [12, 'tackle']], 'さばくの ちかを いどうする きょだいな むし。ちめんに もぐって こうげきを さける。'),
  mon('leafant', 'リーファント', 'plant', 1, 'healer', [[1, 'leaf'], [4, 'heal'], [10, 'antidote']], 'はっぱの ふくを まとった ちいさな もりの せいれい。かいふくと じょうたいいじょうの ちりょうが とくい。'),
  mon('thunderkids', 'サンダーキッズ', 'spirit', 1, 'caster', [[1, 'spark'], [6, 'stunspore'], [13, 'thunder']], 'でんきを おびた ちいさな けもの。こうげきの たびに かみなりを ためこむ。'),
  mon('darkeye', 'ダークアイ', 'demon', 2, 'caster', [[1, 'darkwave'], [8, 'glare'], [15, 'dazzle']], 'きょだいな ひとつめを もつ ふゆう せいぶつ。てきの のうりょくを さげる じゅもんを とくいとする。'),
  mon('metalspirit', 'メタルスピリット', 'slime', 3, 'metal', [[1, 'metalbody'], [8, 'haste'], [16, 'glimmer']], 'ぎんいろの えきたいきんぞくで できた めずらしい まもの。すばやく、しゅびりょくが きょくたんに たかい。', { resistances: { fire: 3, ice: 3, wind: 3, earth: 3, thunder: 3, light: 3, poison: 3, sleep: 3, confusion: 3 } }),
  mon('firedragon', 'ファイアドラゴン', 'dragon', 2, 'bruiser', [[1, 'flamebreath'], [8, 'firefang'], [15, 'fireball']], 'ほのおを はく わかい りゅう。そだつほど こうげきりょくが のび、うえの ドラゴンへの 配合の そざいにも なる。', { resistances: { fire: 2 }, growthCurves: { attack: 'late' } }),
  mon('windcat', 'ウィンドキャット', 'bird', 2, 'speed', [[1, 'windwave'], [8, 'haste'], [15, 'peck']], 'ねこのような かおと おおきな つばさを もつ かぜの まもの。みかたの すばやさも あげられる。'),
  mon('icekrill', 'アイスクリル', 'material', 2, 'tank', [[1, 'icebreath'], [8, 'veil'], [15, 'blizzard']], 'こおりの けっしょうが あつまって うまれた まもの。じゅもんに つよく、こおりの ぜんたい こうげきを つかう。', { resistances: { ice: 3, fire: -1 } }),
  mon('greensprite', 'グリーンスプライト', 'plant', 2, 'healer', [[1, 'healall'], [8, 'regen'], [15, 'revive']], 'もりの エネルギーから うまれた ようせい。かいふくと ほじょで なかまの のうりょくを そこあげする。'),
  mon('devilcrab', 'デビルクラブ', 'water', 1, 'tank', [[1, 'pinch'], [6, 'shellguard'], [12, 'icicle']], 'まりょくを おびた かいがらを せおう カニ。かたい からで まもりつつ、おおきな ハサミで はんげきする。'),
  mon('ghostbill', 'ゴーストビル', 'demon', 1, 'caster', [[1, 'ember'], [5, 'dazzle'], [12, 'darkbreath']], 'むらさきいろの ほのおに つつまれた こあくま。じゅもんで じわじわ おいつめる。'),
  mon('darkdragon', 'ダークドラゴン', 'dragon', 3, 'bruiser', [[1, 'darkbreath'], [12, 'megaflare'], [20, 'sweep']], 'やみの まりょくを やどした おおがたの ドラゴン。たかい こうげきりょくと きょうりょくな ぜんたい こうげきを もつ。', { growthCurves: { attack: 'late', hp: 'late' } }),
  mon('kinoborg', 'キノコボーグ', 'plant', 2, 'bruiser', [[1, 'poisonmist'], [8, 'lullaby'], [15, 'stunspore']], 'キノコと きの ねが ゆうごうした まもの。どくや ねむりで てきを よわらせる。'),
  mon('lightningleo', 'ライトニングレオ', 'spirit', 2, 'attacker', [[1, 'thunderfang'], [8, 'peck'], [15, 'thunder']], 'いなずまの たてがみを もつ ライオン。すばやく、れんぞく こうげきが とくい。', { growthCurves: { speed: 'early' } }),
  mon('goldslime', 'ゴールドスライム', 'slime', 4, 'healer', [[1, 'happyguard'], [10, 'goldflash'], [20, 'healall']], 'きんいろの からだと ちいさな おうかんが とくちょう。めずらしく、しゅびりょくと こううんに すぐれる。', { resistances: { light: 3, fire: 1, thunder: 1 } }),
  mon('chaosdragon', 'カオスドラゴン', 'dragon', 4, 'bruiser', [[1, 'darkflare'], [15, 'demonvoice'], [25, 'megaflare']], 'やみの ちからで きょうかされた りゅう。たさいな ブレスと じょうたいいじょうで あいてを おいつめる。', { resistances: { light: 1, confusion: 2 } }),
];

export const SPECIES: Record<string, MonsterSpecies> = Object.fromEntries(list.map((s) => [s.id, s]));
export const SPECIES_LIST = list;

export function getSpecies(id: string): MonsterSpecies {
  const s = SPECIES[id];
  if (!s) throw new Error(`unknown species: ${id}`);
  return s;
}
