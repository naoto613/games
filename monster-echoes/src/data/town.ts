import type { Condition } from './types';
import type { TownArt } from './towns/builder';
import { LIEFEL } from './towns/liefel';
import { MIZUNA } from './towns/mizuna';

// まちの へや・たてもの。出入り口（D）・階段（< >）の つながりと、進行で ひらく条件をデータで持つ。
export type TownTheme = 'town' | 'interior' | 'shrine' | 'ranch' | 'lab' | 'shop' | 'arena';
export type Facing4 = 'up' | 'down' | 'left' | 'right';
export type TownLink = { x: number; y: number; to: string; tx: number; ty: number; dir: Facing4; cond?: Condition[]; locked?: string };
export type TownNpc = { id: string; look: string; facing?: Facing4; idle?: boolean };
export type TownMapDef = {
  id: string;
  name: string;
  theme: TownTheme;
  npcs: Record<string, TownNpc>;
  links: TownLink[];
  /** 旅の扉・森の入口（G）から 行ける ダンジョン（data/areas の ID） */
  gates?: string[];
  /** G の 先に まだ 行けない ときの ことば */
  gateClosed?: string;
  /** はじめて 着いたら 章の ステージに 着いた ことに なる（'2-1' など） */
  stageId?: string;
  /** しらべられる もの（V）→ 物語イベントの きっかけ（manual の target） */
  spots?: Record<string, string>;
  /** 地面と 物体を わけて 描く 町（参考画像3）。ない 町は タイルで 描く */
  art?: TownArt;
};

const D = (x: number, y: number, to: string, tx: number, ty: number, dir: Facing4, cond?: Condition[], locked?: string): TownLink => ({ x, y, to, tx, ty, dir, cond, locked });

// v2：第1章 リーフェル集落と 第2章 水辺の街ミズナ（仕様 14.1・14.2）
export const TOWN_MAPS: Record<string, TownMapDef> = {
  liefel: {
    id: 'liefel', name: 'リーフェル集落', theme: 'town', stageId: '1-1', art: LIEFEL.art,
    npcs: { '5': { id: 'elder', look: 'scribe' }, '6': { id: 'mio', look: 'kid', idle: true }, '7': { id: 'merchant', look: 'shop', idle: true } },
    gates: ['komorebi', 'sasayaki'],
    spots: { '11,3': 'forest_stone' },
    links: [
      D(5, 6, 'liefel_hut', 5, 5, 'up'),
      D(19, 6, 'liefel_ranch', 6, 7, 'up'),
      D(5, 16, 'liefel_home', 4, 5, 'up'),
      D(25, 10, 'mizuna', 1, 10, 'right', [{ type: 'stage', id: '1-3' }], 'ミズナへ つづく 道だ。森の 異変を しずめてから 旅に 出よう。'),
      D(25, 11, 'mizuna', 1, 11, 'right', [{ type: 'stage', id: '1-3' }], 'ミズナへ つづく 道だ。森の 異変を しずめてから 旅に 出よう。'),
    ],
  },
  liefel_home: {
    id: 'liefel_home', name: '主人公の家', theme: 'interior',
    npcs: { '2': { id: 'mother', look: 'granny', facing: 'left' } },
    links: [D(4, 6, 'liefel', 5, 17, 'down')],
  },
  liefel_hut: {
    id: 'liefel_hut', name: '調律師の小屋', theme: 'interior',
    npcs: { '1': { id: 'sora', look: 'doctor' } },
    links: [D(5, 6, 'liefel', 5, 7, 'down')],
  },
  liefel_ranch: {
    id: 'liefel_ranch', name: '小さな牧場', theme: 'ranch',
    npcs: { '2': { id: 'lily', look: 'lily' } },
    links: [D(6, 8, 'liefel', 19, 7, 'down')],
  },
  mizuna: {
    id: 'mizuna', name: '水辺の街ミズナ', theme: 'town', stageId: '2-1', art: MIZUNA.art,
    npcs: { '6': { id: 'nagi', look: 'kid', idle: true }, '7': { id: 'boatman', look: 'granny', idle: true } },
    links: [
      D(5, 6, 'mizuna_lab', 5, 6, 'up'),
      D(17, 7, 'mizuna_shrine', 5, 5, 'up'),
      D(4, 16, 'mizuna_shop', 4, 5, 'up'),
      D(18, 16, 'mizuna_ranch', 7, 6, 'up'),
      D(0, 10, 'liefel', 24, 10, 'left'),
      D(0, 11, 'liefel', 24, 11, 'left'),
    ],
  },
  mizuna_lab: {
    id: 'mizuna_lab', name: '配合の館', theme: 'lab',
    npcs: { '1': { id: 'minamo', look: 'lily' }, '8': { id: 'librarian', look: 'scribe', facing: 'right' } },
    links: [D(5, 7, 'mizuna', 5, 7, 'down')],
  },
  mizuna_shop: {
    id: 'mizuna_shop', name: 'ミズナの 道具屋', theme: 'shop',
    npcs: { '3': { id: 'shop', look: 'shop' }, '9': { id: 'medal', look: 'arena', facing: 'left' } },
    links: [D(4, 6, 'mizuna', 4, 17, 'down')],
  },
  mizuna_ranch: {
    id: 'mizuna_ranch', name: '魔物牧場', theme: 'ranch',
    npcs: { '2': { id: 'farmer', look: 'shop' } },
    links: [D(7, 7, 'mizuna', 18, 17, 'down')],
  },
  mizuna_shrine: {
    id: 'mizuna_shrine', name: '旅の扉の祠', theme: 'shrine', npcs: {},
    gates: [],
    gateClosed: '扉の むこうから、つよい 水の 音が きこえる……。水音の洞穴への 道は、まだ ひらいていないようだ。（第2章の つづきは つぎの アップデートで あそべます）',
    links: [D(5, 6, 'mizuna', 17, 8, 'down')],
  },
};

export const getTownMap = (id: string): TownMapDef => TOWN_MAPS[id] ?? TOWN_MAPS.liefel;

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
  { count: 24, medals: 12, items: { bigherb: 5, lifeleaf: 2 } },
  { count: 32, medals: 15, items: { primemeat: 3 } },
  { count: 39, medals: 30, items: { primemeat: 5, lifeleaf: 5 } },
];

// ---------------------------------------------------------------- まちの たてもの（外観のスタイルと ばしょ）
export type TownBuilding = { style: 'lab' | 'ranch' | 'shop' | 'arena' | 'shrine' | 'house'; x0: number; x1: number; y0: number; y1: number; door: number };
/** タイルで 描く 町の 建物（いまは なし。地面と 物体で 描く 町は TownArt）*/
export const TOWN_BUILDINGS: Record<string, TownBuilding[]> = {};
export const buildingAt = (mapId: string, x: number, y: number) => (TOWN_BUILDINGS[mapId] ?? []).find((b) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1);
