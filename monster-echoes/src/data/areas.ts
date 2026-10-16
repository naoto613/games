import type { AreaDefinition, ArenaRankDefinition, BossDefinition, EncounterTable, Reward } from './types';

// v2 の ダンジョン（章の ステージ）。Phase 1：第1章（木漏れ日の小道・ささやきの森）。
// 出現は 仕様 6 第1章の 階ごとの 表どおり（Q16：グリーンピクシー → 043 グリーンスプライト）。
const enc = (id: string, entries: [string, number, number, number][], groupSize: [number, number][]): EncounterTable => ({
  id,
  entries: entries.map(([speciesId, weight, minLevel, maxLevel]) => ({ speciesId, weight, minLevel, maxLevel })),
  groupSize: groupSize.map(([value, weight]) => ({ value, weight })),
});

export const ENCOUNTERS: Record<string, EncounterTable> = Object.fromEntries(
  [
    // ---- 1-2 木漏れ日の小道（1F ルナスライム・モスラット／2F バークボア／3F グリーンピクシー）
    enc('komorebi1', [['m001', 3, 1, 1], ['m041', 1, 1, 1], ['m002', 3, 1, 1]], [[1, 1]]),
    enc('komorebi2', [['m023', 4, 2, 2], ['m041', 2, 2, 3], ['m001', 2, 2, 3], ['m081', 1, 2, 3]], [[1, 4], [2, 1]]),
    enc('komorebi3', [['m043', 4, 3, 4], ['m023', 2, 3, 4], ['m041', 2, 3, 4], ['m013', 2, 3, 4], ['m063', 1, 3, 4]], [[1, 2], [2, 3]]),
    // ---- 1-3 ささやきの森（1F モスラット・バークボア／2F グリーンピクシー・コケゴーレム／3F 毒花／4F キノコ兵）
    enc('sasayaki1', [['m041', 3, 4, 5], ['m023', 3, 4, 5], ['m042', 2, 4, 5], ['m061', 1, 4, 5]], [[1, 2], [2, 3], [3, 1]]),
    enc('sasayaki2', [['m043', 3, 5, 6], ['m121', 2, 5, 5], ['m042', 2, 5, 6], ['m085', 1, 5, 6]], [[1, 4], [2, 3], [3, 1]]),
    enc('sasayaki3', [['m050', 1, 6, 6], ['m047', 1, 6, 6], ['m041', 3, 6, 7], ['m044', 2, 6, 7], ['m023', 2, 6, 7]], [[1, 3], [2, 3], [3, 1]]),
    enc('sasayaki4', [['m044', 4, 6, 7], ['m141', 2, 6, 7], ['m121', 2, 6, 7], ['m181', 1, 7, 7]], [[1, 3], [2, 4], [3, 1]]),
  ].map((e) => [e.id, e]),
);

const chest = (gold: number): { weight: number; value: Reward }[] => [
  { weight: 1, value: { type: 'item', itemId: 'medal', count: 1 } },
  { weight: 4, value: { type: 'item', itemId: 'herb', count: 2 } },
  { weight: 3, value: { type: 'item', itemId: 'jerky', count: 2 } },
  { weight: 2, value: { type: 'gold', amount: gold } },
  { weight: 1, value: { type: 'item', itemId: 'bonemeat', count: 1 } },
  { weight: 1, value: { type: 'item', itemId: 'mpdrop', count: 1 } },
  { weight: 1, value: { type: 'item', itemId: 'curegrass', count: 2 } },
];

export const AREAS: AreaDefinition[] = [
  {
    id: 'komorebi', stageId: '1-2', name: '木漏れ日の小道', theme: 'forest', recommendedLevel: 1, unlockConditions: [],
    description: 'リーフェルの 森の 入口から のびる、ひだまりの 小道。おとなしい まものが すんでいる。',
    floors: [
      { id: 'komorebi1', name: '木漏れ日の小道 1F', encounterTableId: 'komorebi1', chestTable: chest(20) },
      { id: 'komorebi2', name: '木漏れ日の小道 2F', encounterTableId: 'komorebi2', chestTable: chest(30), spring: true },
      { id: 'komorebi3', name: '木漏れ日の小道 3F', encounterTableId: 'komorebi3', chestTable: chest(40), storyEvents: ['ch1_first_recruit'] },
    ],
  },
  {
    id: 'sasayaki', stageId: '1-3', name: 'ささやきの森', theme: 'forest', recommendedLevel: 5, unlockConditions: [],
    description: '木々が ささやく ふかい 森。おくで キノコ王モルグが まものたちを ひきいている。',
    floors: [
      { id: 'sasayaki1', name: 'ささやきの森 1F', encounterTableId: 'sasayaki1', chestTable: chest(50) },
      { id: 'sasayaki2', name: 'ささやきの森 2F', encounterTableId: 'sasayaki2', chestTable: chest(60) },
      { id: 'sasayaki3', name: 'ささやきの森 3F 毒花の群生地', encounterTableId: 'sasayaki3', chestTable: chest(70), gimmicks: ['poison'], spring: true },
      { id: 'sasayaki4', name: 'ささやきの森 4F', encounterTableId: 'sasayaki4', chestTable: chest(80), storyEvents: ['ch1_trace'] },
      { id: 'sasayakiBoss', name: 'ささやきの森 キノコ王の広間', encounterTableId: 'sasayaki4', chestTable: [], bossId: 'morg' },
    ],
  },
];
export const getArea = (id: string) => {
  const a = AREAS.find((x) => x.id === id);
  if (!a) throw new Error(`unknown area: ${id}`);
  return a;
};
/** ステージID → ダンジョン */
export const areaOfStage = (stageId: string) => AREAS.find((a) => a.stageId === stageId);

export const BOSSES: Record<string, BossDefinition> = {
  // 第1章 キノコ王モルグ（台本：data/bosses/scripts.ts の morg。毒胞子・子分を よぶ・火が 弱点）
  morg: {
    id: 'morg', name: 'キノコ王モルグ',
    intro: ['ひろまの まんなかで、おおきな キノコが ゆっくりと ふりかえった。', 'キノコ王モルグ「……ここから さきへは ゆかせぬ。森の こえが きこえぬ ものには な……！」'],
    enemies: [
      { speciesId: 'm044', level: 9, hpScale: 3.0, statScale: 1.12, skills: ['poisonmist', 'dazzle', 'headbutt', 'heal'], name: 'キノコ王モルグ', distorted: true, recruitable: false, script: 'morg' },
      { speciesId: 'm044', level: 6, name: 'キノコへい', recruitable: false },
    ],
    defeatText: ['モルグの かさから くろい もやが ぬけていく…。'],
    rewards: [{ type: 'gold', amount: 150 }, { type: 'item', itemId: 'medal', count: 2 }, { type: 'item', itemId: 'bonemeat', count: 2 }],
    setFlags: ['boss_morg'],
  },
};

// ---- 闘技場（v1 の データ。第4章で v2 の 闘技場に おきかえるまで 使わない）
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
