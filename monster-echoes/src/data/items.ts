import type { ItemDefinition } from './types';

const list: ItemDefinition[] = [
  { id: 'herb', name: 'いやしそう', category: 'heal', price: 8, power: 35, battle: true, field: true, description: 'HPを 35ほど かいふくする くさ。' },
  { id: 'bigherb', name: 'げんきそう', category: 'heal', price: 40, power: 100, battle: true, field: true, description: 'HPを 100ほど かいふくする。' },
  { id: 'mpdrop', name: 'まりょくのしずく', category: 'mp', price: 45, power: 20, battle: true, field: true, description: 'MPを 20 かいふくする。' },
  { id: 'lifeleaf', name: 'いのちのはっぱ', category: 'revive', price: 120, power: 50, battle: true, field: true, description: 'たおれた モンスターを HP はんぶんで いきかえらせる。' },
  { id: 'curegrass', name: 'なおしぐさ', category: 'cure', price: 10, power: 0, battle: true, field: true, description: 'どく・まひ・ねむり・こんらんを なおす。' },
  { id: 'jerky', name: 'ジャーキー', category: 'meat', price: 12, power: 0.12, battle: true, field: true, description: 'モンスターに なげると なかまに なりやすくなる。ぼくじょうで あげると やせいが へる。' },
  { id: 'bonemeat', name: 'ほねつきにく', category: 'meat', price: 50, power: 0.28, battle: true, field: true, description: 'ジャーキーより ずっと こうかが ある にく。' },
  { id: 'primemeat', name: 'とくじょうにく', category: 'meat', price: 240, power: 0.6, battle: true, field: true, description: 'どんな モンスターも めのいろを かえる さいこうきゅうの にく。' },
  { id: 'returnwing', name: 'かえりのはね', category: 'escape', price: 25, power: 0, battle: false, field: true, description: 'たびのとびらの なかから まちへ もどれる。' },
  { id: 'medal', name: 'ちいさなメダル', category: 'key', price: 0, power: 0, battle: false, field: false, description: 'ほしの もようの ちいさな メダル。どうぐやの メダルあつめの ひとが こうかんしてくれる。' },
  { id: 'shard', name: 'ひかりのかけら', category: 'key', price: 0, power: 0, battle: false, field: false, description: 'くだけた ひかりの クリスタルの かけら。あたたかく ひかっている。' },
];

export const ITEMS: Record<string, ItemDefinition> = Object.fromEntries(list.map((i) => [i.id, i]));
export const ITEM_LIST = list;
export function getItem(id: string): ItemDefinition {
  const i = ITEMS[id];
  if (!i) throw new Error(`unknown item: ${id}`);
  return i;
}
