import type { AreaDefinition, ArenaRankDefinition, BossDefinition, EncounterTable, Reward } from './types';

const enc = (id: string, entries: [string, number, number, number][], groupSize: [number, number][]): EncounterTable => ({
  id,
  entries: entries.map(([speciesId, weight, minLevel, maxLevel]) => ({ speciesId, weight, minLevel, maxLevel })),
  groupSize: groupSize.map(([value, weight]) => ({ value, weight })),
});

export const ENCOUNTERS: Record<string, EncounterTable> = Object.fromEntries(
  [
    enc('forest1', [['lumipon', 3, 1, 2], ['kogemaru', 3, 1, 2], ['mossglow', 3, 1, 3], ['yorufukuro', 2, 1, 2], ['iwatokage', 2, 2, 3]], [[1, 5], [2, 3]]),
    enc('forest2', [['lumipon', 3, 3, 5], ['kogemaru', 3, 3, 5], ['mossglow', 3, 3, 5], ['yorufukuro', 3, 3, 5], ['iwatokage', 3, 3, 5]], [[1, 3], [2, 4], [3, 1]]),
    enc('forest3', [['kogemaru', 3, 5, 7], ['mossglow', 3, 5, 7], ['yorufukuro', 3, 5, 7], ['iwatokage', 2, 5, 7], ['madoidake', 1, 5, 6]], [[1, 2], [2, 4], [3, 2]]),
    enc('cave1', [['lumipon', 3, 7, 9], ['iwatokage', 3, 7, 9], ['tsukipon', 2, 7, 8], ['haganegame', 1, 7, 8], ['mossglow', 2, 7, 9]], [[1, 2], [2, 4], [3, 2]]),
    enc('cave2', [['tsukipon', 3, 9, 11], ['haganegame', 2, 9, 11], ['madoidake', 2, 9, 11], ['yorufukuro', 2, 9, 11], ['iwatokage', 2, 10, 12]], [[1, 2], [2, 4], [3, 2]]),
    enc('cave3', [['tsukipon', 3, 11, 12], ['haganegame', 2, 11, 12], ['madoidake', 3, 11, 12], ['lumipon', 2, 11, 13]], [[1, 2], [2, 4], [3, 2]]),
    enc('highland1', [['kazetsubame', 2, 13, 15], ['homurawolf', 2, 13, 14], ['yorufukuro', 3, 13, 15], ['kogemaru', 3, 14, 16], ['madoidake', 2, 13, 15]], [[1, 1], [2, 4], [3, 3]]),
    enc('highland2', [['kazetsubame', 3, 15, 17], ['homurawolf', 3, 15, 17], ['madoidake', 2, 15, 17], ['haganegame', 2, 15, 17]], [[1, 1], [2, 4], [3, 3]]),
    enc('highland3', [['kazetsubame', 3, 17, 19], ['homurawolf', 3, 17, 19], ['tsukipon', 2, 17, 19], ['madoidake', 2, 17, 19]], [[2, 4], [3, 4]]),
  ].map((e) => [e.id, e]),
);

const chest = (gold: number): { weight: number; value: Reward }[] => [
  { weight: 4, value: { type: 'item', itemId: 'herb', count: 2 } },
  { weight: 3, value: { type: 'item', itemId: 'jerky', count: 2 } },
  { weight: 2, value: { type: 'gold', amount: gold } },
  { weight: 1, value: { type: 'item', itemId: 'bonemeat', count: 1 } },
  { weight: 1, value: { type: 'item', itemId: 'mpdrop', count: 1 } },
];
const chest2 = (gold: number): { weight: number; value: Reward }[] => [
  { weight: 3, value: { type: 'item', itemId: 'bigherb', count: 1 } },
  { weight: 3, value: { type: 'item', itemId: 'bonemeat', count: 1 } },
  { weight: 2, value: { type: 'gold', amount: gold } },
  { weight: 2, value: { type: 'item', itemId: 'mpdrop', count: 1 } },
  { weight: 1, value: { type: 'item', itemId: 'lifeleaf', count: 1 } },
];

export const AREAS: AreaDefinition[] = [
  {
    id: 'forest', name: 'はじまりのもり', theme: 'forest', recommendedLevel: 1, unlockConditions: [],
    description: 'まちの そばの あかるい もり。おくに ゆがみが うまれたらしい。',
    floors: [
      { id: 'forest1', name: 'はじまりのもり 1F', encounterTableId: 'forest1', mapTemplateId: 'forest1', chestTable: chest(30) },
      { id: 'forest2', name: 'はじまりのもり 2F', encounterTableId: 'forest2', mapTemplateId: 'forest2', chestTable: chest(50) },
      { id: 'forest3', name: 'はじまりのもり おく', encounterTableId: 'forest3', mapTemplateId: 'forest3', chestTable: chest(80), bossId: 'boss_forest' },
    ],
  },
  {
    id: 'cave', name: 'しずくのどうくつ', theme: 'cave', recommendedLevel: 8, unlockConditions: [{ type: 'boss', id: 'boss_forest' }],
    description: 'つめたい しずくが したたる どうくつ。かたい モンスターが おおい。',
    floors: [
      { id: 'cave1', name: 'しずくのどうくつ B1', encounterTableId: 'cave1', mapTemplateId: 'cave1', chestTable: chest(90) },
      { id: 'cave2', name: 'しずくのどうくつ B2', encounterTableId: 'cave2', mapTemplateId: 'cave2', chestTable: chest2(120) },
      { id: 'cave3', name: 'しずくのどうくつ ちていこ', encounterTableId: 'cave3', mapTemplateId: 'cave3', chestTable: chest2(150), bossId: 'boss_cave' },
    ],
  },
  {
    id: 'highland', name: 'かぜのこうげん', theme: 'highland', recommendedLevel: 14,
    unlockConditions: [{ type: 'boss', id: 'boss_cave' }, { type: 'arena', id: 'arenaE' }],
    description: 'つよい かぜが ふきぬける こうげん。すばやい モンスターに ちゅうい。',
    floors: [
      { id: 'highland1', name: 'かぜのこうげん ふもと', encounterTableId: 'highland1', mapTemplateId: 'highland1', chestTable: chest2(160) },
      { id: 'highland2', name: 'かぜのこうげん なかほど', encounterTableId: 'highland2', mapTemplateId: 'highland2', chestTable: chest2(200) },
      { id: 'highland3', name: 'かぜのこうげん いただき', encounterTableId: 'highland3', mapTemplateId: 'highland3', chestTable: chest2(260), bossId: 'boss_highland' },
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
    id: 'boss_forest', name: 'ゆがみの マドイダケ',
    intro: ['もりの おくで くろい もやが うずまいている…！', 'ゆがみに とりつかれた マドイダケが おそいかかってきた！'],
    enemies: [
      { speciesId: 'madoidake', level: 10, hpScale: 3.0, statScale: 1.45, skills: ['poisonmist', 'dazzle', 'heal', 'bite'], name: 'ゆがみマドイダケ', distorted: true, recruitable: false },
      { speciesId: 'mossglow', level: 7, recruitable: false },
    ],
    defeatText: ['くろい もやが はれていく…。', 'あとには あたたかく ひかる かけらが のこっていた。', 'ひかりのかけらを てにいれた！'],
    rewards: [{ type: 'item', itemId: 'shard', count: 1 }, { type: 'gold', amount: 150 }],
    setFlags: ['shard1'],
  },
  boss_cave: {
    id: 'boss_cave', name: 'ゆがみの ハガネガメ',
    intro: ['ちていこの ほとりで みずが くろく にごっている…！', 'ゆがみに とりつかれた ハガネガメが あらわれた！'],
    enemies: [
      { speciesId: 'haganegame', level: 16, hpScale: 2.0, statScale: 1.2, skills: ['tackle', 'rockfall', 'glare', 'icicle'], name: 'ゆがみハガネガメ', distorted: true, recruitable: false },
      { speciesId: 'tsukipon', level: 14, recruitable: false },
      { speciesId: 'madoidake', level: 14, recruitable: false },
    ],
    defeatText: ['にごった みずが すきとおっていく…。', 'ひかりのかけらを てにいれた！'],
    rewards: [{ type: 'item', itemId: 'shard', count: 1 }, { type: 'gold', amount: 400 }],
    setFlags: ['shard2'],
  },
  boss_highland: {
    id: 'boss_highland', name: 'ゆがみの ホムラウルフ',
    intro: ['いただきで くろい ほのおが ゆらめいている…！', 'ゆがみに とりつかれた ホムラウルフが むれを ひきいて あらわれた！'],
    enemies: [
      { speciesId: 'kazetsubame', level: 18, recruitable: false },
      { speciesId: 'homurawolf', level: 22, hpScale: 2.8, statScale: 1.12, name: 'ゆがみホムラウルフ', distorted: true, recruitable: false },
      { speciesId: 'kazetsubame', level: 18, recruitable: false },
    ],
    defeatText: ['くろい ほのおが しずかに きえていく…。', 'ひかりのかけらを てにいれた！'],
    rewards: [{ type: 'item', itemId: 'shard', count: 1 }, { type: 'gold', amount: 800 }],
    setFlags: ['shard3'],
  },
};

export const ARENA_RANKS: ArenaRankDefinition[] = [
  {
    id: 'arenaF', name: 'Fランク', description: 'しんじん ちょうりつしの ための たいかい。3れんせん、あいだに ぜんかいふく。',
    entryConditions: [{ type: 'boss', id: 'boss_forest' }], betweenBattleRecovery: 'full',
    battles: [
      { trainer: 'みならいの ポポ', enemies: [{ speciesId: 'kogemaru', level: 10 }, { speciesId: 'yorufukuro', level: 10 }, { speciesId: 'kogemaru', level: 9 }] },
      { trainer: 'はなやの ミモザ', enemies: [{ speciesId: 'mossglow', level: 11 }, { speciesId: 'lumipon', level: 11 }, { speciesId: 'mossglow', level: 11 }], tactic: 'support' },
      { trainer: 'いしや ゴロン', enemies: [{ speciesId: 'iwatokage', level: 12 }, { speciesId: 'madoidake', level: 11 }, { speciesId: 'iwatokage', level: 12 }] },
    ],
    rewards: [{ type: 'gold', amount: 300 }, { type: 'item', itemId: 'bonemeat', count: 2 }],
    setFlags: [],
  },
  {
    id: 'arenaE', name: 'Eランク', description: 'うでに おぼえの ある ちょうりつしが あつまる。3れんせん、あいだに すこし かいふく。',
    entryConditions: [{ type: 'arena', id: 'arenaF' }, { type: 'boss', id: 'boss_cave' }], betweenBattleRecovery: 'partial',
    battles: [
      { trainer: 'つりびと カイ', enemies: [{ speciesId: 'tsukipon', level: 15 }, { speciesId: 'haganegame', level: 14 }, { speciesId: 'lumipon', level: 15 }] },
      { trainer: 'きのこはかせ', enemies: [{ speciesId: 'madoidake', level: 14 }, { speciesId: 'madoidake', level: 14 }, { speciesId: 'mossglow', level: 15 }] },
      { trainer: 'けんじゃの たまご リオ', enemies: [{ speciesId: 'homurawolf', level: 16 }, { speciesId: 'tsukipon', level: 16 }, { speciesId: 'haganegame', level: 15 }], tactic: 'skill' },
    ],
    rewards: [{ type: 'gold', amount: 800 }, { type: 'capacity', amount: 10 }, { type: 'item', itemId: 'primemeat', count: 1 }],
    setFlags: [],
  },
  {
    id: 'arenaD', name: 'ルナフィアたいかい', description: 'さいきょうの ちょうりつしを きめる けっしょう。3れんせん、かいふく なし。',
    entryConditions: [{ type: 'arena', id: 'arenaE' }, { type: 'boss', id: 'boss_highland' }], betweenBattleRecovery: 'none',
    battles: [
      { trainer: 'かぜつかい ソラ', enemies: [{ speciesId: 'kazetsubame', level: 21 }, { speciesId: 'kazetsubame', level: 21 }, { speciesId: 'tsukipon', level: 21 }] },
      { trainer: 'もりびと ナギ', enemies: [{ speciesId: 'morinushi', level: 20 }, { speciesId: 'madoidake', level: 22 }, { speciesId: 'homurawolf', level: 22 }], tactic: 'support' },
      { trainer: 'チャンピオン ゼノ', enemies: [{ speciesId: 'mitsugashira', level: 22 }, { speciesId: 'auroran', level: 21 }, { speciesId: 'suishoryu', level: 21 }], tactic: 'skill' },
    ],
    rewards: [{ type: 'gold', amount: 2000 }],
    setFlags: ['champion'],
  },
];
export const getArenaRank = (id: string) => ARENA_RANKS.find((r) => r.id === id)!;
