import type { Condition } from './types';

// まちの へや・たてもの。出入り口（D）・階段（< >）の つながりと、進行で ひらく条件をデータで持つ。
export type TownTheme = 'town' | 'interior' | 'shrine' | 'ranch';
export type Facing4 = 'up' | 'down' | 'left' | 'right';
export type TownLink = { x: number; y: number; to: string; tx: number; ty: number; dir: Facing4; cond?: Condition[]; locked?: string };
export type TownNpc = { id: string; look: string; facing?: Facing4; idle?: boolean };
export type TownMapDef = {
  id: string;
  name: string;
  theme: TownTheme;
  npcs: Record<string, TownNpc>;
  links: TownLink[];
  /** 旅の扉（G）で行ける エリア */
  gate?: string;
};

const D = (x: number, y: number, to: string, tx: number, ty: number, dir: Facing4, cond?: Condition[], locked?: string): TownLink => ({ x, y, to, tx, ty, dir, cond, locked });

export const TOWN_MAPS: Record<string, TownMapDef> = {
  town: {
    id: 'town', name: 'ルナフィアの まち', theme: 'town',
    npcs: { '5': { id: 'scribe', look: 'scribe' }, '6': { id: 'kid', look: 'kid', idle: true }, '7': { id: 'granny', look: 'granny', idle: true } },
    links: [
      D(9, 2, 'shrine1', 5, 5, 'up'),
      D(4, 5, 'lab1', 5, 6, 'up'),
      D(14, 5, 'ranch1', 6, 7, 'up'),
      D(4, 12, 'shop', 4, 5, 'up'),
      D(14, 12, 'arena1', 5, 4, 'up'),
    ],
  },
  lab1: {
    id: 'lab1', name: '配合の やかた 1F', theme: 'interior',
    npcs: { '1': { id: 'doctor', look: 'doctor' }, '8': { id: 'librarian', look: 'scribe', facing: 'right' } },
    links: [
      D(5, 7, 'town', 4, 6, 'down'),
      D(9, 5, 'lab2', 2, 5, 'right', [{ type: 'boss', id: 'boss_forest' }], 'うえの かいは けんきゅうちゅう。もりの ゆがみを はらったら おいで、と かいてある。'),
    ],
  },
  lab2: {
    id: 'lab2', name: '配合の やかた 2F けんきゅうしつ', theme: 'interior',
    npcs: { '2': { id: 'researcher', look: 'guard' } },
    links: [D(1, 5, 'lab1', 8, 5, 'left')],
  },
  ranch1: {
    id: 'ranch1', name: 'ぼくじょう', theme: 'ranch',
    npcs: { '2': { id: 'lily', look: 'lily' } },
    links: [
      D(6, 8, 'town', 14, 6, 'down'),
      D(12, 4, 'ranch2', 1, 4, 'right', [{ type: 'arena', id: 'arenaE' }], 'さくの むこうは まだ せいびちゅう。とうぎじょう Eランクを ゆうしょうしたら ひろげるわ。'),
    ],
  },
  ranch2: {
    id: 'ranch2', name: 'おくの まきば', theme: 'ranch',
    npcs: { '9': { id: 'farmer', look: 'shop' } },
    links: [D(0, 4, 'ranch1', 11, 4, 'left')],
  },
  shop: {
    id: 'shop', name: 'どうぐや', theme: 'interior',
    npcs: { '3': { id: 'shop', look: 'shop' }, '9': { id: 'medal', look: 'arena', facing: 'left' } },
    links: [D(4, 6, 'town', 4, 13, 'down')],
  },
  arena1: {
    id: 'arena1', name: 'とうぎじょう ロビー', theme: 'interior',
    npcs: { '4': { id: 'arena', look: 'arena' } },
    links: [
      D(5, 5, 'town', 14, 13, 'down'),
      D(1, 3, 'arena2', 2, 3, 'right', [{ type: 'arena', id: 'arenaF' }], 'かんきゃくせきへの かいだん。Fランクを ゆうしょうした ちょうりつしだけが はいれる。'),
    ],
  },
  arena2: {
    id: 'arena2', name: 'とうぎじょう かんきゃくせき', theme: 'interior',
    npcs: { '2': { id: 'coach', look: 'guard' } },
    links: [D(1, 3, 'arena1', 2, 3, 'right')],
  },
  shrine1: {
    id: 'shrine1', name: 'たびのとびらの しんでん B1', theme: 'shrine', gate: 'forest', npcs: {},
    links: [
      D(5, 6, 'town', 9, 3, 'down'),
      D(9, 4, 'shrine2', 2, 4, 'right', [{ type: 'boss', id: 'boss_forest' }], 'ふしぎな ちからで とざされている…。はじまりのもりの ゆがみを はらえば ひらきそうだ。'),
    ],
  },
  shrine2: {
    id: 'shrine2', name: 'たびのとびらの しんでん B2', theme: 'shrine', gate: 'cave', npcs: {},
    links: [
      D(1, 4, 'shrine1', 8, 4, 'left'),
      D(9, 4, 'shrine3', 2, 4, 'right', [{ type: 'boss', id: 'boss_cave' }, { type: 'arena', id: 'arenaE' }], 'とざされている…。どうくつの ゆがみを はらい、とうぎじょう Eランクで みとめられれば ひらきそうだ。'),
    ],
  },
  shrine3: {
    id: 'shrine3', name: 'たびのとびらの しんでん B3', theme: 'shrine', gate: 'highland', npcs: {},
    links: [
      D(1, 4, 'shrine2', 8, 4, 'left'),
      D(9, 4, 'shrine4', 2, 4, 'right', [{ type: 'flag', id: 'champion' }], 'つよい ひかりで とざされている…。ルナフィアたいかいの ゆうしょうしゃだけが すすめるらしい。'),
    ],
  },
  shrine4: {
    id: 'shrine4', name: 'たびのとびらの しんでん B4', theme: 'shrine', gate: 'tower', npcs: {},
    links: [D(1, 4, 'shrine3', 8, 4, 'left')],
  },
};

export const getTownMap = (id: string): TownMapDef => TOWN_MAPS[id] ?? TOWN_MAPS.town;

// ---------------------------------------------------------------- やりこみ: ちいさなメダル・図鑑のごほうび
export type MedalPrize = { id: string; cost: number; name: string; desc: string };
export const MEDAL_PRIZES: MedalPrize[] = [
  { id: 'bonemeat2', cost: 3, name: 'ほねつきにく ×2', desc: 'なかま あつめの おともに。' },
  { id: 'lifeleaf2', cost: 5, name: 'いのちのはっぱ ×2', desc: 'ボスせんの おまもり。' },
  { id: 'primemeat', cost: 8, name: 'とくじょうにく', desc: 'つよい モンスターも めのいろを かえる。' },
  { id: 'capacity', cost: 12, name: 'ぼくじょう ひろげけん（+5）', desc: 'ぼくじょうに あずけられる かずが ふえる。' },
  { id: 'egg', cost: 20, name: 'ひかりのたまご', desc: 'なにが うまれるかは おたのしみ。めずらしい モンスターが うまれる。' },
];
/** 図鑑で みつけた かずに おうじた ごほうび */
export const DEX_REWARDS: { count: number; medals: number; items: Record<string, number> }[] = [
  { count: 4, medals: 2, items: {} },
  { count: 8, medals: 3, items: { bonemeat: 2 } },
  { count: 12, medals: 5, items: { lifeleaf: 2 } },
  { count: 16, medals: 10, items: { primemeat: 2 } },
];
