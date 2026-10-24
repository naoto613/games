// 装備・消耗品
export type Slot = 'weapon' | 'armor' | 'acc';

export interface ItemDef {
  id: string;
  name: string;
  kind: 'use' | 'equip' | 'key';
  desc: string;
  price?: number;
  // 消耗品
  use?: { hp?: number; ap?: number; margin?: number; obs?: boolean; field?: boolean; battle?: boolean; target?: 'ally' | 'party' };
  // 装備
  slot?: Slot;
  owner?: 'seil' | 'dran';
  stats?: Partial<Record<'hp' | 'ap' | 'atk' | 'def' | 'obs' | 'edit', number>>;
  /** 特殊効果 */
  special?: 'freeCut' | 'echoRing' | 'holdClock' | 'marginUp' | 'revealHidden';
}

export const ITEMS: ItemDef[] = [
  { id: 'potion', name: '回復薬', kind: 'use', price: 20, desc: '味方1人のHPを60回復する。', use: { hp: 60, field: true, battle: true, target: 'ally' } },
  { id: 'hipotion', name: '上回復薬', kind: 'use', price: 60, desc: '味方1人のHPを150回復する。', use: { hp: 150, field: true, battle: true, target: 'ally' } },
  { id: 'ether', name: '行動薬', kind: 'use', price: 30, desc: '味方1人のAPを6回復する。', use: { ap: 6, field: true, battle: true, target: 'ally' } },
  { id: 'lens', name: '観測薬', kind: 'use', price: 40, desc: '戦闘中：敵の隠れた条件をすべて見抜く。探索中：この区域の隠された調査対象が見えるようになる。', use: { obs: true, field: true, battle: true } },
  { id: 'crystal', name: '余白結晶', kind: 'use', price: 80, desc: '因果編集に使う余白を3回復する。', use: { margin: 3, field: true, battle: true } },
  { id: 'shard', name: '記録片', kind: 'key', desc: '足りない記録が1つだけのとき、その代わりに編集の根拠として使える（使うと消える）。' },
  // 装備
  { id: 'quill', name: '記録者の羽ペン', kind: 'equip', slot: 'weapon', owner: 'seil', stats: { atk: 3, edit: 1 }, desc: '記録保管所で支給される筆記具兼護身具。' },
  { id: 'severblade', name: '断絶刃', kind: 'equip', slot: 'weapon', owner: 'seil', stats: { atk: 7 }, special: 'freeCut', desc: '戦闘中、各ターン最初の「切断」の余白が0になる。' },
  { id: 'sabre', name: '古い軍刀', kind: 'equip', slot: 'weapon', owner: 'dran', stats: { atk: 5 }, desc: 'ドランの愛刀。どの戦争で使ったのかは思い出せない。' },
  { id: 'hammer', name: '鐘楼の鉄槌', kind: 'equip', slot: 'weapon', owner: 'dran', stats: { atk: 10, def: -1 }, desc: '鐘楼の修理に使われていた大槌。重い。' },
  { id: 'coat', name: '記録士の外套', kind: 'equip', slot: 'armor', stats: { def: 3 }, desc: '丈夫な灰色の外套。' },
  { id: 'ashcoat', name: '灰鐘の外套', kind: 'equip', slot: 'armor', price: 150, stats: { def: 6, hp: 10 }, desc: '灰鐘市の職人が仕立てた厚手の外套。' },
  { id: 'vest', name: '古い軍装', kind: 'equip', slot: 'armor', stats: { def: 5 }, desc: '所属を示す徽章だけが外されている。' },
  { id: 'needle', name: '記録針', kind: 'equip', slot: 'acc', stats: { obs: 5 }, special: 'revealHidden', desc: '観測能力が上がり、隠された調査対象を見つけやすくなる。' },
  { id: 'ring', name: '共鳴環', kind: 'equip', slot: 'acc', stats: { obs: 1 }, special: 'echoRing', desc: '攻撃したとき、30%でもう1人の味方が追撃する（行動の連鎖）。' },
  { id: 'clock', name: '保留時計', kind: 'equip', slot: 'acc', stats: { edit: 2 }, special: 'holdClock', desc: '戦闘ごとに1度だけ、「保留」の余白が0になる。' },
  { id: 'bookmark', name: '余白の栞', kind: 'equip', slot: 'acc', stats: { edit: 2 }, special: 'marginUp', desc: '余白の上限が2増える。' },
  { id: 'badge', name: '門番の徽章', kind: 'equip', slot: 'acc', stats: { def: 2, hp: 15 }, desc: 'ガルトから譲られた古い徽章。' },
  // だいじなもの
  { id: 'clapper', name: '鐘の舌', kind: 'key', desc: '沈黙の王が抱えていた、灰鐘の鐘の内側の部品。' },
];

export const ITEM_MAP = new Map(ITEMS.map(i => [i.id, i]));

export const SHOP_STOCK: Record<string, string[]> = {
  peck: ['potion', 'ether', 'lens', 'crystal', 'ashcoat'],
  lume: ['potion', 'hipotion', 'ether', 'lens', 'crystal'],
  peck_free: ['potion', 'hipotion', 'ether', 'lens', 'crystal', 'ashcoat', 'bookmark'],
};
