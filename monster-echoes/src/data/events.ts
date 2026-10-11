// ダンジョンの 固有イベント（データ定義）。ばしょ・条件・ほうしゅう・ストーリーへの えいきょうを ここに まとめる。
// 発生の判定は Game（application）、ひょうじは ui/screens/events.ts が おこなう。
import type { EnemySpec, Reward } from './types';

export type EventKind =
  | 'story' // ものがたりの てがかり（しらべる）
  | 'trail' // ひかる あしあと（つながる てがかり）
  | 'nest' // めずらしい モンスターの すみか（せんとうに なる）
  | 'hidden' // かくし とびら（みつけると へやが ひらく）
  | 'vault'; // たからばこより 貴重な ほうもつこ

/** 会話の ぶんきに つかう パーティの じょうほう */
export type EventContext = { partySpecies: string[]; partyFamilies: string[] };

export type EventDef = {
  id: string;
  areaId: string;
  /** なんかいめの フロアに あるか（0 はじまり） */
  floorIndex: number;
  kind: EventKind;
  /** かならず たっしている ひつような ストーリーフラグ */
  requires?: string[];
  /** このフラグが たっていたら でない（取得ずみ など） */
  hiddenWhen?: string[];
  /** この しゅぞくを もっていたら でない */
  notOwned?: string;
  /** 見つけたときの メッセージ */
  pages: string[];
  /** パーティに おうじて つけたす メッセージ */
  react?: (c: EventContext) => string[];
  setFlags?: string[];
  rewards?: Reward[];
  /** nest: たたかう あいて */
  encounter?: EnemySpec;
  /** hidden: とびらの おくの ほうもつこ（vault）の ID */
  vaultId?: string;
  /** ぼうけんメモに のる ひとこと */
  memo?: string;
};

const has = (c: EventContext, id: string) => c.partySpecies.includes(id);

export const EVENTS: EventDef[] = [
  // ============================================================ はじまりのもり
  {
    id: 'forest_blight', areaId: 'forest', floorIndex: 0, kind: 'story',
    pages: [
      'きりかぶの まわりに、くろい もやが たまっている。',
      'ふれてみると ひんやりして…すこし かなしい きもちが ながれこんできた。',
      '……もりの モンスターたちは、おそわれて にげているのでは ない。',
      'なにかに おいたてられ、おびえているのだ。',
    ],
    react: (c) => (has(c, 'lunaslime') ? ['ルナスライムが きりかぶに よりそって、ぷるぷると ふるえている。'] : has(c, 'magmadog') ? ['マグマドッグが もやに むかって、ひくく うなった。'] : []),
    setFlags: ['forestBlight'], rewards: [{ type: 'item', itemId: 'herb', count: 2 }],
    memo: 'もりの モンスターは なにかに おいたてられている。くろい もやは もりの おくから ひろがっている。',
  },
  {
    id: 'forest_trail1', areaId: 'forest', floorIndex: 0, kind: 'trail',
    pages: ['じめんに、ほのかに ひかる あしあとが のこっている。', 'ひとの ものでも、ふつうの モンスターの ものでも ないようだ…。'],
    setFlags: ['foot1'],
    memo: 'もりに ひかる あしあとが ある。どこかへ つづいている ようだ。',
  },
  {
    id: 'forest_trail2', areaId: 'forest', floorIndex: 1, kind: 'trail', requires: ['foot1'],
    pages: ['また、あの ひかる あしあとだ。さっきの ものと おなじ かたちを している。', 'あしあとは もりの おくへ むかっている…。'],
    react: (c) => (c.partyFamilies.includes('slime') ? ['スライムの なかまが ぴくりと はんのうした。おくに「なかま」が いるのかも しれない…！'] : []),
    setFlags: ['foot2'],
    memo: 'あしあとは もりの おく（3かいめ）へ つづいている。にくを もって いってみよう。',
  },
  {
    id: 'forest_nest', areaId: 'forest', floorIndex: 2, kind: 'nest', requires: ['foot2'], notOwned: 'echoslime',
    pages: ['あしあとの さきに、ひかりの わが ゆらめいている。', 'なかから、うすむらさきの スライムが こちらを じっと みている…！', '（にくを なげてから たたかうと、なかまに なってくれるかも しれない）'],
    encounter: { speciesId: 'echoslime', level: 6 }, setFlags: ['echoMet'],
    memo: 'ひかりの わの なかに めずらしい スライムが いた。にくを なげて なかまに できるかも。',
  },
  {
    id: 'forest_hidden', areaId: 'forest', floorIndex: 1, kind: 'hidden', hiddenWhen: ['ev_forest_vault'], vaultId: 'forest_vault',
    pages: ['かべの きの ねが、そこだけ ふしぎな かたちに からみあっている。', 'ねの すきまから、ほのかな ひかりが もれている…。', 'ねを かきわけると、かくされた へやへの みちが あらわれた！'],
    memo: 'もりの かべの きの ねに、かくし へやが ある ばしょが ある。',
  },
  {
    id: 'forest_vault', areaId: 'forest', floorIndex: 1, kind: 'vault', hiddenWhen: [],
    pages: ['かくし へやの おくに、ふるい ほうもつこが ねむっていた。', 'ふたを あけると、やさしい ひかりが あふれだした！'],
    rewards: [{ type: 'item', itemId: 'medal', count: 2 }, { type: 'item', itemId: 'lifeleaf', count: 1 }, { type: 'item', itemId: 'primemeat', count: 1 }],
    setFlags: ['forestVault'],
  },
];

export const EVENT_BY_ID: Record<string, EventDef> = Object.fromEntries(EVENTS.map((e) => [e.id, e]));
export const eventsOnFloor = (areaId: string, floorIndex: number) => EVENTS.filter((e) => e.areaId === areaId && e.floorIndex === floorIndex);

// ---------------------------------------------------------------- ぼうけんメモ（フラグが たつと のる）
export const STORY_NOTES: { flag: string; text: string }[] = [
  { flag: 'forestBlight', text: EVENT_BY_ID.forest_blight.memo! },
  { flag: 'foot1', text: EVENT_BY_ID.forest_trail1.memo! },
  { flag: 'foot2', text: EVENT_BY_ID.forest_trail2.memo! },
  { flag: 'echoMet', text: EVENT_BY_ID.forest_nest.memo! },
  { flag: 'forestVault', text: 'もりの かくし へやで ふるい ほうもつこを みつけた。' },
  { flag: 'truth_forest', text: 'キノコボーグは もりを まもろうと して、ひかりの かけらの ゆがみに のみこまれていた。' },
  { flag: 'truth_cave', text: 'クリスタルの かけらに ふれると、むかしの モンスターの きおくが みえる。' },
  { flag: 'truth_highland', text: 'ゆがみは モンスターだけでなく、とちや いきものの くらしにも えいきょうしている。' },
  { flag: 'truth_snow', text: 'ゆがみは クリスタルが くだけた だけでは、せつめいが つかない…。' },
  { flag: 'truth_volcano', text: '各地の ゆがみは、ひとつの ばしょへ つながっている ようだ。' },
  { flag: 'towerClear', text: 'ひかりのとうの おくで、ゆがみの しょうたいに ちかづいた。' },
];
