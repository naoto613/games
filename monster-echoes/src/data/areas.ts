import type { AreaDefinition, ArenaRankDefinition, BossDefinition, EncounterTable, Reward } from './types';

const enc = (id: string, entries: [string, number, number, number][], groupSize: [number, number][]): EncounterTable => ({
  id,
  entries: entries.map(([speciesId, weight, minLevel, maxLevel]) => ({ speciesId, weight, minLevel, maxLevel })),
  groupSize: groupSize.map(([value, weight]) => ({ value, weight })),
});

export const ENCOUNTERS: Record<string, EncounterTable> = Object.fromEntries(
  [
    enc('forest1', [['lunaslime', 3, 1, 2], ['leafant', 3, 1, 2], ['thunderkids', 2, 1, 2], ['frostbird', 2, 1, 2], ['ghostbill', 1, 2, 2], ['mintslime', 2, 1, 2], ['rosefant', 2, 1, 2]], [[1, 6], [2, 2]]),
    enc('forest2', [['lunaslime', 3, 3, 5], ['leafant', 3, 3, 5], ['thunderkids', 3, 3, 5], ['frostbird', 2, 3, 5], ['magmadog', 2, 3, 5], ['sandworm', 2, 3, 5], ['mintslime', 2, 3, 5], ['rosefant', 2, 3, 5], ['venomworm', 1, 4, 5]], [[1, 3], [2, 4], [3, 1]]),
    enc('forest3', [['magmadog', 3, 5, 6], ['sandworm', 3, 5, 7], ['leafant', 2, 5, 7], ['ghostbill', 2, 5, 6], ['thunderkids', 2, 5, 7], ['greensprite', 1, 5, 6], ['rosefant', 1, 5, 7], ['shadowdog', 1, 5, 6]], [[1, 3], [2, 4], [3, 1]]),
    enc('cave1', [['stonegolem', 3, 7, 9], ['devilcrab', 3, 7, 9], ['ghostbill', 2, 7, 9], ['lunaslime', 2, 7, 9], ['icekrill', 1, 7, 8], ['bluecrab', 2, 7, 9], ['shadowdog', 1, 8, 9]], [[1, 2], [2, 4], [3, 2]]),
    enc('cave2', [['stonegolem', 2, 9, 11], ['devilcrab', 2, 9, 11], ['icekrill', 2, 9, 11], ['darkeye', 2, 9, 11], ['ghostbill', 2, 10, 12], ['claygolem', 2, 9, 11], ['bluecrab', 2, 9, 11]], [[1, 2], [2, 4], [3, 2]]),
    enc('cave3', [['icekrill', 2, 10, 11], ['darkeye', 2, 10, 11], ['devilcrab', 3, 10, 12], ['stonegolem', 3, 11, 12], ['claygolem', 1, 11, 12], ['shadowdog', 1, 10, 11]], [[1, 3], [2, 4], [3, 1]]),
    enc('highland1', [['frostbird', 3, 13, 15], ['windcat', 2, 13, 14], ['magmadog', 3, 14, 16], ['thunderkids', 2, 13, 15], ['kinoborg', 2, 13, 15], ['blazebird', 2, 13, 15], ['venomworm', 2, 13, 15]], [[1, 1], [2, 4], [3, 3]]),
    enc('highland2', [['windcat', 3, 15, 17], ['lightningleo', 2, 15, 17], ['kinoborg', 2, 15, 17], ['sandworm', 2, 15, 17], ['blazebird', 2, 15, 17], ['claygolem', 1, 15, 17]], [[1, 1], [2, 4], [3, 3]]),
    enc('highland3', [['windcat', 3, 17, 19], ['lightningleo', 3, 17, 19], ['frostbird', 2, 17, 19], ['kinoborg', 2, 17, 19], ['venomworm', 1, 17, 19]], [[2, 4], [3, 4]]),
    enc('tower1', [['kinoborg', 2, 22, 24], ['lightningleo', 3, 24, 26], ['windcat', 3, 24, 26], ['darkeye', 2, 24, 26], ['metalspirit', 1, 20, 22]], [[2, 4], [3, 4]]),
    enc('tower2', [['lightningleo', 3, 25, 27], ['icekrill', 2, 25, 27], ['greensprite', 2, 25, 27], ['kinoborg', 2, 26, 28], ['metalspirit', 1, 22, 24]], [[2, 3], [3, 5]]),
    enc('tower3', [['darkdragon', 2, 27, 29], ['lightningleo', 3, 27, 29], ['darkeye', 2, 28, 30], ['metalspirit', 1, 24, 26]], [[2, 2], [3, 6]]),
    // ---- こおりのゆきやま（ルナフィアたいかい ゆうしょうご）
    enc('snow1', [['frostbird', 2, 20, 22], ['icewolf', 3, 20, 22], ['bluecrab', 2, 20, 22], ['icekrill', 2, 20, 22], ['mintslime', 1, 18, 20]], [[1, 1], [2, 4], [3, 3]]),
    enc('snow2', [['icewolf', 3, 21, 23], ['aquasprite', 2, 21, 23], ['thunderbird', 2, 21, 23], ['icekrill', 2, 22, 24], ['rubykrill', 1, 22, 24]], [[2, 4], [3, 4]]),
    enc('snow3', [['icedragon', 2, 23, 25], ['icewolf', 3, 23, 25], ['aquasprite', 2, 23, 25], ['thunderbird', 2, 23, 25], ['moonleo', 1, 24, 26]], [[2, 3], [3, 5]]),
    // ---- ほのおのかざん（ひかりのとう・こおりのゆきやま せいはご）
    enc('volcano1', [['flameslime', 3, 28, 30], ['blazebird', 3, 28, 30], ['redeye', 2, 28, 30], ['magmaworm', 2, 28, 30], ['shadowdog', 2, 26, 28]], [[2, 3], [3, 5]]),
    enc('volcano2', [['magmaworm', 3, 29, 31], ['hellbill', 3, 29, 31], ['rubykrill', 2, 29, 31], ['redeye', 2, 30, 32], ['firedragon', 1, 30, 32]], [[2, 3], [3, 5]]),
    enc('volcano3', [['crimsondragon', 1, 30, 31], ['hellbill', 3, 29, 31], ['magmaworm', 3, 29, 31], ['firedragon', 2, 30, 32], ['redeye', 2, 29, 31]], [[2, 3], [3, 5]]),
  ].map((e) => [e.id, e]),
);

const chest = (gold: number): { weight: number; value: Reward }[] => [
  { weight: 1, value: { type: 'item', itemId: 'medal', count: 1 } },
  { weight: 4, value: { type: 'item', itemId: 'herb', count: 2 } },
  { weight: 3, value: { type: 'item', itemId: 'jerky', count: 2 } },
  { weight: 2, value: { type: 'gold', amount: gold } },
  { weight: 1, value: { type: 'item', itemId: 'bonemeat', count: 1 } },
  { weight: 1, value: { type: 'item', itemId: 'mpdrop', count: 1 } },
  { weight: 1, value: { type: 'item', itemId: 'bigherb', count: 1 } },
];
const chest2 = (gold: number): { weight: number; value: Reward }[] => [
  { weight: 2, value: { type: 'item', itemId: 'medal', count: 1 } },
  { weight: 3, value: { type: 'item', itemId: 'bigherb', count: 1 } },
  { weight: 3, value: { type: 'item', itemId: 'bonemeat', count: 1 } },
  { weight: 2, value: { type: 'gold', amount: gold } },
  { weight: 2, value: { type: 'item', itemId: 'mpdrop', count: 1 } },
  { weight: 1, value: { type: 'item', itemId: 'lifeleaf', count: 1 } },
  { weight: 1, value: { type: 'item', itemId: 'primemeat', count: 1 } },
];

export const AREAS: AreaDefinition[] = [
  {
    id: 'forest', name: 'はじまりのもり', theme: 'forest', recommendedLevel: 1, unlockConditions: [],
    description: 'まちの そばの あかるい もり。おくに ゆがみが うまれたらしい。',
    floors: [
      { id: 'forest1', name: 'はじまりのもり 1F', encounterTableId: 'forest1', chestTable: chest(30) },
      { id: 'forest2', name: 'はじまりのもり 2F', encounterTableId: 'forest2', chestTable: chest(50) },
      { id: 'forest3', name: 'はじまりのもり おく', encounterTableId: 'forest3', chestTable: chest(80) },
      { id: 'forestBoss', name: 'はじまりのもり キノコの おうざ', encounterTableId: 'forest3', chestTable: [], bossId: 'boss_forest' },
    ],
  },
  {
    id: 'cave', name: 'しずくのどうくつ', theme: 'cave', recommendedLevel: 8, unlockConditions: [{ type: 'boss', id: 'boss_forest' }],
    description: 'つめたい しずくが したたる どうくつ。かたい モンスターが おおい。',
    floors: [
      { id: 'cave1', name: 'しずくのどうくつ B1', encounterTableId: 'cave1', chestTable: chest(90) },
      { id: 'cave2', name: 'しずくのどうくつ B2', encounterTableId: 'cave2', chestTable: chest2(120) },
      { id: 'cave3', name: 'しずくのどうくつ ちていこ', encounterTableId: 'cave3', chestTable: chest2(150) },
      { id: 'caveBoss', name: 'しずくのどうくつ ちていの みずうみ', encounterTableId: 'cave3', chestTable: [], bossId: 'boss_cave' },
    ],
  },
  {
    id: 'highland', name: 'かぜのこうげん', theme: 'highland', recommendedLevel: 14,
    unlockConditions: [{ type: 'boss', id: 'boss_cave' }, { type: 'arena', id: 'arenaE' }],
    description: 'つよい かぜが ふきぬける こうげん。すばやい モンスターに ちゅうい。',
    floors: [
      { id: 'highland1', name: 'かぜのこうげん ふもと', encounterTableId: 'highland1', chestTable: chest2(160) },
      { id: 'highland2', name: 'かぜのこうげん なかほど', encounterTableId: 'highland2', chestTable: chest2(200) },
      { id: 'highland3', name: 'かぜのこうげん いただき', encounterTableId: 'highland3', chestTable: chest2(260) },
      { id: 'highlandBoss', name: 'かぜのこうげん いただきの だんじょう', encounterTableId: 'highland3', chestTable: [], bossId: 'boss_highland' },
    ],
  },
  {
    id: 'tower', name: 'ひかりのとう', theme: 'tower', recommendedLevel: 24,
    unlockConditions: [{ type: 'flag', id: 'champion' }],
    description: 'クリスタルの ひかりが さす とう。配合で うまれる はずの モンスターが すんでいる。',
    floors: [
      { id: 'tower1', name: 'ひかりのとう 1F', encounterTableId: 'tower1', chestTable: chest2(400) },
      { id: 'tower2', name: 'ひかりのとう 2F', encounterTableId: 'tower2', chestTable: chest2(500) },
      { id: 'tower3', name: 'ひかりのとう さいじょうかい', encounterTableId: 'tower3', chestTable: chest2(600) },
      { id: 'towerBoss', name: 'ひかりのとう クリスタルの ぎょくざ', encounterTableId: 'tower3', chestTable: [], bossId: 'boss_tower' },
    ],
  },
  {
    id: 'snow', name: 'こおりのゆきやま', theme: 'snow', recommendedLevel: 20,
    unlockConditions: [{ type: 'flag', id: 'champion' }],
    description: 'ふぶきが ふきあれる ゆきやま。こおりの モンスターが すんでいる。',
    floors: [
      { id: 'snow1', name: 'こおりのゆきやま ふもと', encounterTableId: 'snow1', chestTable: chest2(450) },
      { id: 'snow2', name: 'こおりのゆきやま ちゅうふく', encounterTableId: 'snow2', chestTable: chest2(550) },
      { id: 'snow3', name: 'こおりのゆきやま ちょうじょう', encounterTableId: 'snow3', chestTable: chest2(700) },
      { id: 'snowBoss', name: 'こおりのゆきやま ふぶきの ほこら', encounterTableId: 'snow3', chestTable: [], bossId: 'boss_snow' },
    ],
  },
  {
    id: 'volcano', name: 'ほのおのかざん', theme: 'volcano', recommendedLevel: 28,
    unlockConditions: [{ type: 'boss', id: 'boss_snow' }, { type: 'flag', id: 'towerClear' }],
    description: 'マグマが ふきだす かざん。ほのおの つよい モンスターが ひしめく。',
    floors: [
      { id: 'volcano1', name: 'ほのおのかざん ふもと', encounterTableId: 'volcano1', chestTable: chest2(800) },
      { id: 'volcano2', name: 'ほのおのかざん ちゅうふく', encounterTableId: 'volcano2', chestTable: chest2(1000) },
      { id: 'volcano3', name: 'ほのおのかざん ふんかこう', encounterTableId: 'volcano3', chestTable: chest2(1300) },
      { id: 'volcanoBoss', name: 'ほのおのかざん ふんかこうの おく', encounterTableId: 'volcano3', chestTable: [], bossId: 'boss_volcano' },
    ],
  },
];
export const getArea = (id: string) => {
  const a = AREAS.find((x) => x.id === id);
  if (!a) throw new Error(`unknown area: ${id}`);
  return a;
};

export const BOSSES: Record<string, BossDefinition> = {
  boss_forest: {
    id: 'boss_forest', name: 'ゆがみの キノコボーグ',
    intro: ['もりの おくで くろい もやが うずまいている…！', 'ゆがみに とりつかれた キノコボーグが おそいかかってきた！'],
    enemies: [
      { speciesId: 'kinoborg', level: 9, hpScale: 2.4, statScale: 1.12, skills: ['poisonmist', 'dazzle', 'heal', 'bite'], name: 'ゆがみキノコボーグ', distorted: true, recruitable: false },
      { speciesId: 'leafant', level: 6, recruitable: false },
    ],
    defeatText: ['くろい もやが はれていく…。', 'あとには あたたかく ひかる かけらが のこっていた。', 'ひかりのかけらを てにいれた！'],
    rewards: [{ type: 'item', itemId: 'shard', count: 1 }, { type: 'gold', amount: 150 }, { type: 'item', itemId: 'medal', count: 2 }],
    setFlags: ['shard1'],
  },
  boss_cave: {
    id: 'boss_cave', name: 'ゆがみの アイスクリル',
    intro: ['ちていこの ほとりで みずが くろく にごっている…！', 'ゆがみに とりつかれた アイスクリルが あらわれた！'],
    enemies: [
      { speciesId: 'icekrill', level: 15, hpScale: 1.8, statScale: 1.1, skills: ['tackle', 'rockfall', 'glare', 'icicle'], name: 'ゆがみアイスクリル', distorted: true, recruitable: false },
      { speciesId: 'darkeye', level: 12, recruitable: false },
      { speciesId: 'kinoborg', level: 12, recruitable: false },
    ],
    defeatText: ['にごった みずが すきとおっていく…。', 'ひかりのかけらを てにいれた！'],
    rewards: [{ type: 'item', itemId: 'shard', count: 1 }, { type: 'gold', amount: 400 }, { type: 'item', itemId: 'medal', count: 3 }],
    setFlags: ['shard2'],
  },
  boss_highland: {
    id: 'boss_highland', name: 'ゆがみの ファイアドラゴン',
    intro: ['いただきで くろい ほのおが ゆらめいている…！', 'ゆがみに とりつかれた ファイアドラゴンが あらわれた！'],
    enemies: [
      { speciesId: 'windcat', level: 16, recruitable: false },
      { speciesId: 'firedragon', level: 21, hpScale: 2.4, statScale: 1.05, name: 'ゆがみファイアドラゴン', distorted: true, recruitable: false },
      { speciesId: 'windcat', level: 16, recruitable: false },
    ],
    defeatText: ['くろい ほのおが しずかに きえていく…。', 'ひかりのかけらを てにいれた！'],
    rewards: [{ type: 'item', itemId: 'shard', count: 1 }, { type: 'gold', amount: 800 }, { type: 'item', itemId: 'medal', count: 4 }],
    setFlags: ['shard3'],
  },
};

BOSSES.boss_tower = {
  id: 'boss_tower', name: 'ゆがみの おう',
  intro: ['とうの いただきに、クリスタルの かげが うずまいている…！', 'ゆがみが あつまって、でんせつの りゅうの すがたを とった！'],
  enemies: [
    { speciesId: 'greensprite', level: 28, recruitable: false },
    { speciesId: 'chaosdragon', level: 32, hpScale: 2.6, statScale: 1.2, name: 'ゆがみの おう', distorted: true, recruitable: false },
    { speciesId: 'greensprite', level: 28, recruitable: false },
  ],
  defeatText: ['かげは ひかりの つぶに なって きえていった…。', 'あしもとに ちいさなメダルが たくさん ちらばっている！'],
  rewards: [{ type: 'gold', amount: 3000 }, { type: 'item', itemId: 'medal', count: 10 }],
  setFlags: ['towerClear'],
};

BOSSES.boss_snow = {
  id: 'boss_snow', name: 'ゆがみの アイスドラゴン',
  intro: ['ふぶきの なかで、くろい こおりが きしんでいる…！', 'ゆがみに とりつかれた アイスドラゴンが ふぶきを まとって あらわれた！'],
  enemies: [
    { speciesId: 'icewolf', level: 24, recruitable: false },
    { speciesId: 'icedragon', level: 27, hpScale: 2.8, statScale: 1.15, name: 'ゆがみアイスドラゴン', distorted: true, recruitable: false },
    { speciesId: 'icewolf', level: 24, recruitable: false },
  ],
  defeatText: ['ふぶきが ぴたりと やんで、そらが はれわたっていく…。', 'こおりの なかから ひかりの かけらが あらわれた！'],
  rewards: [{ type: 'item', itemId: 'shard', count: 1 }, { type: 'gold', amount: 1500 }, { type: 'item', itemId: 'medal', count: 5 }],
  setFlags: ['shard4'],
};

BOSSES.boss_volcano = {
  id: 'boss_volcano', name: 'ゆがみの クリムゾンドラゴン',
  intro: ['ふんかこうで まっかな ほのおが うずを まいている…！', 'ゆがみに とりつかれた クリムゾンドラゴンが ほえた！'],
  enemies: [
    { speciesId: 'hellbill', level: 31, recruitable: false },
    { speciesId: 'crimsondragon', level: 34, hpScale: 2.2, statScale: 1.07, name: 'ゆがみクリムゾンドラゴン', distorted: true, recruitable: false },
    { speciesId: 'hellbill', level: 31, recruitable: false },
  ],
  defeatText: ['マグマの いきおいが おさまり、かざんは しずかに なった…。', 'ひかりの かけらが あしもとで かがやいている！'],
  rewards: [{ type: 'item', itemId: 'shard', count: 1 }, { type: 'gold', amount: 4000 }, { type: 'item', itemId: 'medal', count: 8 }],
  setFlags: ['shard5'],
};

export const ARENA_RANKS: ArenaRankDefinition[] = [
  {
    id: 'arenaF', name: 'Fランク', description: 'しんじん ちょうりつしの ための たいかい。3れんせん、あいだに ぜんかいふく。',
    entryConditions: [{ type: 'boss', id: 'boss_forest' }], betweenBattleRecovery: 'full',
    battles: [
      { trainer: 'みならいの ポポ', enemies: [{ speciesId: 'magmadog', level: 10 }, { speciesId: 'frostbird', level: 10 }, { speciesId: 'magmadog', level: 9 }] },
      { trainer: 'はなやの ミモザ', enemies: [{ speciesId: 'leafant', level: 11 }, { speciesId: 'lunaslime', level: 11 }, { speciesId: 'leafant', level: 11 }], tactic: 'support' },
      { trainer: 'いしや ゴロン', enemies: [{ speciesId: 'stonegolem', level: 12 }, { speciesId: 'kinoborg', level: 11 }, { speciesId: 'stonegolem', level: 12 }] },
    ],
    rewards: [{ type: 'gold', amount: 300 }, { type: 'item', itemId: 'bonemeat', count: 2 }],
    setFlags: [],
  },
  {
    id: 'arenaE', name: 'Eランク', description: 'うでに おぼえの ある ちょうりつしが あつまる。3れんせん、あいだに すこし かいふく。',
    entryConditions: [{ type: 'arena', id: 'arenaF' }, { type: 'boss', id: 'boss_cave' }], betweenBattleRecovery: 'partial',
    battles: [
      { trainer: 'つりびと カイ', enemies: [{ speciesId: 'darkeye', level: 13 }, { speciesId: 'devilcrab', level: 13 }, { speciesId: 'lunaslime', level: 13 }] },
      { trainer: 'きのこはかせ', enemies: [{ speciesId: 'kinoborg', level: 13 }, { speciesId: 'leafant', level: 13 }, { speciesId: 'kinoborg', level: 13 }] },
      { trainer: 'けんじゃの たまご リオ', enemies: [{ speciesId: 'lightningleo', level: 14 }, { speciesId: 'darkeye', level: 14 }, { speciesId: 'icekrill', level: 14 }], tactic: 'skill' },
    ],
    rewards: [{ type: 'gold', amount: 800 }, { type: 'capacity', amount: 10 }, { type: 'item', itemId: 'primemeat', count: 1 }],
    setFlags: [],
  },
  {
    id: 'arenaD', name: 'ルナフィアたいかい', description: 'さいきょうの ちょうりつしを きめる けっしょう。3れんせん、かいふく なし。',
    entryConditions: [{ type: 'arena', id: 'arenaE' }, { type: 'boss', id: 'boss_highland' }], betweenBattleRecovery: 'none',
    battles: [
      { trainer: 'かぜつかい ソラ', enemies: [{ speciesId: 'windcat', level: 21 }, { speciesId: 'windcat', level: 21 }, { speciesId: 'darkeye', level: 21 }] },
      { trainer: 'もりびと ナギ', enemies: [{ speciesId: 'devilcrab', level: 20 }, { speciesId: 'kinoborg', level: 22 }, { speciesId: 'lightningleo', level: 22 }], tactic: 'support' },
      { trainer: 'チャンピオン ゼノ', enemies: [{ speciesId: 'darkdragon', level: 22 }, { speciesId: 'greensprite', level: 21 }, { speciesId: 'firedragon', level: 21 }], tactic: 'skill' },
    ],
    rewards: [{ type: 'gold', amount: 2000 }],
    setFlags: ['champion'],
  },
  {
    id: 'arenaS', name: 'でんせつの たいかい', description: 'ひかりのとうを せいはした ものだけが いどめる。3れんせん、かいふく なし。',
    entryConditions: [{ type: 'flag', id: 'towerClear' }], betweenBattleRecovery: 'none',
    battles: [
      { trainer: 'そらの まもりて ミラ', enemies: [{ speciesId: 'metalspirit', level: 30 }, { speciesId: 'greensprite', level: 30 }, { speciesId: 'windcat', level: 31 }], tactic: 'skill' },
      { trainer: 'だいちの おう ガイア', enemies: [{ speciesId: 'devilcrab', level: 31 }, { speciesId: 'firedragon', level: 31 }, { speciesId: 'darkdragon', level: 31 }] },
      { trainer: 'でんせつの ちょうりつし', enemies: [{ speciesId: 'darkdragon', level: 32 }, { speciesId: 'chaosdragon', level: 33 }, { speciesId: 'metalspirit', level: 32 }], tactic: 'skill' },
    ],
    rewards: [{ type: 'gold', amount: 5000 }, { type: 'item', itemId: 'medal', count: 10 }, { type: 'item', itemId: 'primemeat', count: 3 }],
    setFlags: ['legend'],
  },
  {
    id: 'arenaX', name: 'マスターたいかい', description: 'ほのおのかざんを しずめた、でんせつの あとを つぐ ものだけが いどめる。3れんせん、かいふく なし。',
    entryConditions: [{ type: 'arena', id: 'arenaS' }, { type: 'boss', id: 'boss_volcano' }], betweenBattleRecovery: 'none',
    battles: [
      { trainer: 'こおりの じょおう ユキノ', enemies: [{ speciesId: 'icedragon', level: 36 }, { speciesId: 'aquasprite', level: 35 }, { speciesId: 'moonleo', level: 36 }], tactic: 'support' },
      { trainer: 'かざんの たつじん ガンジ', enemies: [{ speciesId: 'magmaworm', level: 36 }, { speciesId: 'crimsondragon', level: 37 }, { speciesId: 'hellbill', level: 36 }], tactic: 'skill' },
      { trainer: 'マスター ルナ', enemies: [{ speciesId: 'chaosdragon', level: 38 }, { speciesId: 'goldslime', level: 37 }, { speciesId: 'moonleo', level: 38 }], tactic: 'skill' },
    ],
    rewards: [{ type: 'gold', amount: 9000 }, { type: 'item', itemId: 'medal', count: 15 }, { type: 'item', itemId: 'primemeat', count: 5 }, { type: 'capacity', amount: 10 }],
    setFlags: ['master'],
  },
];
export const getArenaRank = (id: string) => ARENA_RANKS.find((r) => r.id === id)!;
