// アイテム定義（設計書 9.2 の ItemDefinition を拡張）
export type ItemCategory = 'food' | 'tool' | 'clothing' | 'collectible' | 'quest';

export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  stackable: boolean;
  maxStack: number;
  sellPrice: number;
  buyPrice?: number;
  useAction?: 'eat' | 'equip' | 'read' | 'hold';
  hunger?: number;        // 食べたときに回復する量
  description: string;
  cook?: string;          // たき火で焼くと何になるか
}

const D: ItemDefinition[] = [
  // 食べ物
  { id: 'apple', name: 'りんご', category: 'food', stackable: true, maxStack: 20, sellPrice: 3, useAction: 'eat', hunger: 20, description: 'あまずっぱい まっかな りんご。きを ゆらすと おちてくる。' },
  { id: 'sandwich', name: 'サンドイッチ', category: 'food', stackable: true, maxStack: 10, sellPrice: 6, useAction: 'eat', hunger: 40, description: 'ピクニックの バスケットに はいっていた ハムと たまごの サンドイッチ。' },
  { id: 'cookie', name: 'クッキー', category: 'food', stackable: true, maxStack: 20, sellPrice: 4, useAction: 'eat', hunger: 15, description: 'さくさくの チョコチップ クッキー。' },
  { id: 'watermelon', name: 'すいか', category: 'food', stackable: true, maxStack: 10, sellPrice: 5, useAction: 'eat', hunger: 30, description: 'みずみずしい すいかの ひときれ。' },
  { id: 'corn', name: 'とうもろこし', category: 'food', stackable: true, maxStack: 10, sellPrice: 4, useAction: 'eat', hunger: 20, cook: 'grilled_corn', description: 'クーラーボックスに はいっていた とうもろこし。たきびで やくと もっと おいしい。' },
  { id: 'grilled_corn', name: 'やきとうもろこし', category: 'food', stackable: true, maxStack: 10, sellPrice: 9, useAction: 'eat', hunger: 40, description: 'こうばしい においの やきとうもろこし。' },
  { id: 'onigiri', name: 'おにぎり', category: 'food', stackable: true, maxStack: 10, sellPrice: 4, buyPrice: 8, useAction: 'eat', hunger: 35, description: 'ばいてんの しゃけ おにぎり。' },
  { id: 'marshmallow', name: 'マシュマロ', category: 'food', stackable: true, maxStack: 20, sellPrice: 2, buyPrice: 5, useAction: 'eat', hunger: 8, cook: 'roasted_marshmallow', description: 'ふわふわの マシュマロ。たきびで あぶると…？' },
  { id: 'roasted_marshmallow', name: 'やきマシュマロ', category: 'food', stackable: true, maxStack: 20, sellPrice: 8, useAction: 'eat', hunger: 30, description: 'そとは カリッ、なかは とろ〜り。キャンプの ごちそう。' },
  { id: 'juice', name: 'りんごジュース', category: 'food', stackable: true, maxStack: 10, sellPrice: 2, buyPrice: 4, useAction: 'eat', hunger: 12, description: 'つめたい りんごジュース。' },
  { id: 'fish', name: 'さかな', category: 'food', stackable: true, maxStack: 10, sellPrice: 12, useAction: 'eat', hunger: 20, cook: 'grilled_fish', description: 'みずうみで つれた さかな。うると いい おかねに なる。' },
  { id: 'big_fish', name: 'おおきな さかな', category: 'food', stackable: true, maxStack: 5, sellPrice: 30, useAction: 'eat', hunger: 35, cook: 'grilled_fish', description: 'ぬしかも しれない おおもの！' },
  { id: 'grilled_fish', name: 'やきざかな', category: 'food', stackable: true, maxStack: 10, sellPrice: 20, useAction: 'eat', hunger: 55, description: 'しおを ふった やきざかな。' },
  // 道具
  { id: 'fishing_rod', name: 'つりざお', category: 'tool', stackable: false, maxStack: 1, sellPrice: 10, buyPrice: 30, useAction: 'hold', description: 'さんばしの さきで つりが できる。' },
  { id: 'treasure_map', name: 'たからのちず', category: 'tool', stackable: false, maxStack: 1, sellPrice: 0, buyPrice: 40, useAction: 'read', description: 'もりの どこかに ×じるし。ちずを ひらくと ばしょが わかる。' },
  { id: 'litter', name: 'ゴミ', category: 'quest', stackable: true, maxStack: 20, sellPrice: 0, description: 'キャンプじょうに おちていた ゴミ。レンジャーに わたそう。' },
  // 衣装
  { id: 'camper_outfit', name: 'キャンパーふく', category: 'clothing', stackable: false, maxStack: 1, sellPrice: 0, useAction: 'equip', description: 'ぼうし・めがね・チェックの ベスト。これを きれば ちいさな キャンパーに みえる…かも。' },
  { id: 'straw_hat', name: 'むぎわらぼうし', category: 'clothing', stackable: false, maxStack: 1, sellPrice: 8, buyPrice: 25, useAction: 'equip', description: 'つりびとに みえる ぼうし。' },
  { id: 'sunglasses', name: 'サングラス', category: 'clothing', stackable: false, maxStack: 1, sellPrice: 6, buyPrice: 20, useAction: 'equip', description: 'かっこいい。すこしだけ めだたなく なる。' },
  { id: 'ranger_hat', name: 'レンジャーぼうし', category: 'clothing', stackable: false, maxStack: 1, sellPrice: 0, useAction: 'equip', description: 'レンジャーごやに かけてあった ぼうし。かぞくには しんようされるが、レンジャー ほんにんには…。' },
  // 収集品
  { id: 'shiny_stone', name: 'きらきらいし', category: 'collectible', stackable: true, maxStack: 20, sellPrice: 10, description: 'ひかりを うけて にじいろに かがやく いし。' },
  { id: 'feather', name: 'とりの はね', category: 'collectible', stackable: true, maxStack: 20, sellPrice: 6, description: 'あおい きれいな はね。' },
  { id: 'pinecone', name: 'まつぼっくり', category: 'collectible', stackable: true, maxStack: 30, sellPrice: 2, description: 'まつの きの したに おちている。' },
  { id: 'bottle_cap', name: 'おうかん', category: 'collectible', stackable: true, maxStack: 30, sellPrice: 3, description: 'びんの ふた。ぴかぴか。' },
  { id: 'old_coin', name: 'ふるいコイン', category: 'collectible', stackable: true, maxStack: 20, sellPrice: 25, description: 'むかしの ぎんか。だれかの おとしもの？' },
  { id: 'old_boot', name: 'ながぐつ', category: 'collectible', stackable: true, maxStack: 5, sellPrice: 1, description: 'つりあげた ながぐつ。…ざんねん。' },
  { id: 'golden_acorn', name: 'きんの どんぐり', category: 'collectible', stackable: false, maxStack: 1, sellPrice: 0, description: 'もりの おたから。ぴかぴかに ひかる どんぐり。' },
  // クエスト
  { id: 'teddy_bear', name: 'くまの ぬいぐるみ', category: 'quest', stackable: false, maxStack: 1, sellPrice: 0, useAction: 'hold', description: 'だれかの たいせつな ぬいぐるみ。みずうみの しまに おちていた。' },
];

export const ITEMS: Record<string, ItemDefinition> = Object.fromEntries(D.map((d) => [d.id, d]));
export const ITEM_LIST = D;

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  food: 'たべもの', tool: 'どうぐ', clothing: 'いしょう', collectible: 'あつめもの', quest: 'だいじなもの',
};
