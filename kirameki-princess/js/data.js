// アイテム・かぐ・なかま・はっけんの ていぎ（プレイヤーの もちものとは わけて もつ）
(function () {
  const KP = window.KP;

  const SLOTS = [
    { id: 'tops', name: 'トップス' },
    { id: 'skirt', name: 'スカート' },
    { id: 'onepiece', name: 'ワンピース' },
    { id: 'shoes', name: 'くつ' },
    { id: 'hair', name: 'かみかざり' },
    { id: 'ribbon', name: 'リボン' },
    { id: 'magic', name: 'まほう' },
  ];

  // [slot, type, color, なまえ, かくし？]
  const RAW = [
    ['tops', 'blouse', 'lav', 'ふんわりブラウス'],
    ['tops', 'blouse', 'pink', 'ふんわりブラウス'],
    ['tops', 'blouse', 'mint', 'ふんわりブラウス'],
    ['tops', 'sailor', 'lav', 'セーラー'],
    ['tops', 'sailor', 'blue', 'セーラー'],
    ['tops', 'hearttop', 'pink', 'ハートのトップス'],
    ['tops', 'hearttop', 'yellow', 'ハートのトップス'],
    ['tops', 'hearttop', 'lav', 'ハートのトップス', 1],
    ['skirt', 'frill', 'lav', 'フリルスカート'],
    ['skirt', 'frill', 'pink', 'フリルスカート'],
    ['skirt', 'frill', 'mint', 'フリルスカート'],
    ['skirt', 'tutu', 'lav', 'チュチュ'],
    ['skirt', 'tutu', 'yellow', 'チュチュ'],
    ['skirt', 'starskirt', 'navy', 'ほしのスカート'],
    ['onepiece', 'princess', 'lav', 'プリンセスドレス'],
    ['onepiece', 'princess', 'pink', 'プリンセスドレス'],
    ['onepiece', 'princess', 'mint', 'プリンセスドレス'],
    ['onepiece', 'princess', 'yellow', 'プリンセスドレス', 1],
    ['onepiece', 'magicdress', 'pink', 'まほうのドレス'],
    ['onepiece', 'magicdress', 'blue', 'まほうのドレス'],
    ['onepiece', 'starry', 'navy', 'ほしぞらドレス', 1],
    ['shoes', 'pumps', 'lav', 'リボンのくつ'],
    ['shoes', 'pumps', 'pink', 'リボンのくつ'],
    ['shoes', 'boots', 'white', 'ハートのブーツ'],
    ['shoes', 'boots', 'pink', 'ハートのブーツ', 1],
    ['shoes', 'strap', 'mint', 'ストラップシューズ'],
    ['shoes', 'glass', 'blue', 'ガラスのくつ', 1],
    ['hair', 'hairbows', 'lav', 'ふたつリボン'],
    ['hair', 'hairbows', 'pink', 'ふたつリボン'],
    ['hair', 'bigbow', 'pink', 'おおきなリボン'],
    ['hair', 'starpins', 'lav', 'ほしのピン'],
    ['hair', 'flowers', 'pink', 'おはなのかんむり'],
    ['hair', 'tiara', 'lav', 'きらきらティアラ', 1],
    ['hair', 'usamimi', 'lav', 'うさみみ', 1],
    ['hair', 'bigbow', 'lav', 'おおきなリボン', 1],
    ['ribbon', 'chestbow', 'pink', 'むねのリボン'],
    ['ribbon', 'chestbow', 'lav', 'むねのリボン'],
    ['ribbon', 'chestbow', 'yellow', 'むねのリボン'],
    ['ribbon', 'brooch', 'pink', 'ハートのブローチ'],
    ['ribbon', 'starbrooch', 'blue', 'ほしのブローチ'],
    ['magic', 'starwand', 'lav', 'ほしのステッキ'],
    ['magic', 'bunnywand', 'lav', 'うさぎのステッキ'],
    ['magic', 'heartwand', 'pink', 'ハートのステッキ', 1],
    ['magic', 'moonrod', 'lav', 'つきのロッド', 1],
  ];
  const ITEMS = {};
  const ITEM_LIST = RAW.map(([slot, type, color, name, hidden]) => {
    const it = { id: `${type}-${color}`, slot, type, color, name, hidden: !!hidden };
    ITEMS[it.id] = it;
    return it;
  });

  const DEFAULT_OUTFIT = {
    tops: 'blouse-pink', skirt: 'frill-pink', onepiece: null, shoes: 'pumps-pink',
    hair: 'hairbows-pink', ribbon: 'chestbow-lav', magic: 'starwand-lav',
  };

  // かぐ
  const FURN_LIST = [
    { id: 'bed', name: 'ベッド', scale: 1.25 },
    { id: 'sofa', name: 'ソファ', scale: 1.15 },
    { id: 'mirror', name: 'かがみ', scale: 1.0 },
    { id: 'closet', name: 'クローゼット', scale: 1.05 },
    { id: 'rug', name: 'ラグ', scale: 1.25 },
    { id: 'light', name: 'ライト', scale: 1.0 },
    { id: 'shelf', name: 'たな', scale: 1.0 },
    { id: 'plush', name: 'ぬいぐるみ', scale: 0.9 },
    { id: 'plant', name: 'しょくぶつ', scale: 0.95 },
    { id: 'stardeco', name: 'ほしのかざり', scale: 1.0 },
    { id: 'teatable', name: 'テーブル', scale: 1.1 },
    { id: 'cushion', name: 'ハートクッション', scale: 0.85, hidden: 1 },
    { id: 'starlamp', name: 'ほしのランプ', scale: 0.95, hidden: 1 },
    { id: 'musicbox', name: 'オルゴール', scale: 0.9, hidden: 1 },
    { id: 'bear', name: 'くまちゃん', scale: 0.9, hidden: 1 },
    { id: 'castle', name: 'おしろ', scale: 1.1, hidden: 1 },
  ];
  const FURN_COLORS = ['lav', 'pink', 'mint', 'blue', 'yellow'];

  // なかま
  const FRIENDS = {
    momo: {
      name: 'すみれ', hairStyle: 'twin', hairColor: 'lav', eyeColor: 'lav',
      outfit: { onepiece: 'princess-lav', shoes: 'pumps-lav', hair: 'bigbow-pink', ribbon: 'brooch-pink', magic: 'bunnywand-lav' },
      likes: 'lav',
    },
    mizuki: {
      name: 'みずき', hairStyle: 'bob', hairColor: 'blue', eyeColor: 'blue', hidden: 1,
      outfit: { tops: 'sailor-blue', skirt: 'starskirt-navy', shoes: 'strap-mint', hair: 'starpins-lav', ribbon: 'starbrooch-blue', magic: 'moonrod-lav' },
      likes: 'blue',
    },
    lemon: {
      name: 'レモン', hairStyle: 'pony', hairColor: 'yellow', eyeColor: 'amber', hidden: 1,
      outfit: { tops: 'hearttop-yellow', skirt: 'tutu-yellow', shoes: 'boots-white', hair: 'flowers-pink', ribbon: 'chestbow-yellow', magic: 'starwand-lav' },
      likes: 'yellow',
    },
  };

  // たんけんで みつかる もの
  const FINDS = [
    { id: 'usamimi-lav', kind: 'item', area: 'garden' },
    { id: 'heartwand-pink', kind: 'item', area: 'garden' },
    { id: 'glass-blue', kind: 'item', area: 'garden' },
    { id: 'bear', kind: 'furn', area: 'garden' },
    { id: 'mizuki', kind: 'friend', area: 'garden' },
    { id: 'tiara-lav', kind: 'item', area: 'house' },
    { id: 'starry-navy', kind: 'item', area: 'house' },
    { id: 'moonrod-lav', kind: 'item', area: 'house' },
    { id: 'cushion', kind: 'furn', area: 'house' },
    { id: 'starlamp', kind: 'furn', area: 'house' },
    { id: 'musicbox', kind: 'furn', area: 'house' },
    { id: 'lemon', kind: 'friend', area: 'house' },
  ];

  const DEFAULT_ROOM = {
    wallpaperId: 'stripe', floorId: 'wood',
    furniture: [
      { instanceId: 'f1', furnitureId: 'stardeco', x: 230, y: 250, rotation: 0, color: 'yellow' },
      { instanceId: 'f2', furnitureId: 'rug', x: 500, y: 940, rotation: 0, color: 'pink' },
      { instanceId: 'f3', furnitureId: 'bed', x: 790, y: 900, rotation: 0, color: 'pink' },
      { instanceId: 'f4', furnitureId: 'plant', x: 110, y: 820, rotation: 0, color: 'pink' },
      { instanceId: 'f5', furnitureId: 'light', x: 230, y: 760, rotation: 0, color: 'pink' },
    ],
  };

  KP.DATA = { SLOTS, ITEMS, ITEM_LIST, DEFAULT_OUTFIT, FURN_LIST, FURN_COLORS, FRIENDS, FINDS, DEFAULT_ROOM };
})();
