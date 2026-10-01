// ================================================================ ingredients / recipes
const ING = {
  tomato: { n: 'トマト', e: '🍅', chop: 1 },
  lettuce: { n: 'レタス', e: '🥬', chop: 1 },
  rice: { n: 'おこめ', e: '🌾' },
  nori: { n: 'のり', e: 'nori' },
  meat: { n: 'おにく', e: '🥩', chop: 1 },
  bun: { n: 'パン', e: 'bun' },
  fish: { n: 'おさかな', e: '🐟', chop: 1 },
  carrot: { n: 'にんじん', e: '🥕', chop: 1 },
  potato: { n: 'じゃがいも', e: '🥔', chop: 1 },
  onion: { n: 'たまねぎ', e: '🧅', chop: 1 },
};
const CRATE_CH = { t: 'tomato', l: 'lettuce', r: 'rice', n: 'nori', k: 'meat', b: 'bun', f: 'fish', c: 'carrot', j: 'potato', o: 'onion' };
// component keys (what can sit on a plate) -> icon + how it is made
const COMP = {
  lettuce_c: { ic: '🥬', how: ['🥬', 'knife'] },
  tomato_c: { ic: '🍅', how: ['🍅', 'knife'] },
  fish_c: { ic: '🐟', how: ['🐟', 'knife'] },
  nori: { ic: 'nori', how: ['nori'] },
  bun: { ic: 'bun', how: ['bun'] },
  soup: { ic: '🥣', how: ['🍅', 'knife', '×3', 'pot'] },
  gohan: { ic: 'gohan', how: ['🌾', 'pot'] },
  patty: { ic: 'patty', how: ['🥩', 'knife', 'pan'] },
  curry: { ic: 'curry', how: ['🥕', '🥔', '🧅', 'knife', 'pot'] },
};
// what a pot turns into
const POT_RECIPES = [
  { items: ['rice'], out: 'gohan', t: 7 },
  { items: ['tomato_c', 'tomato_c', 'tomato_c'], out: 'soup', t: 10 },
  { items: ['carrot_c', 'onion_c', 'potato_c'], out: 'curry', t: 11 },
];
const PAN_RECIPES = [{ items: ['meat_c'], out: 'patty', t: 6 }];
const sortK = a => a.slice().sort();
const sameSet = (a, b) => a.length === b.length && sortK(a).join() === sortK(b).join();
function isSub(a, b) { // multiset a ⊆ b
  const c = {}; for (const k of b) c[k] = (c[k] || 0) + 1;
  for (const k of a) { if (!c[k]) return false; c[k]--; } return true;
}
function potOut(items) { for (const r of POT_RECIPES.concat(PAN_RECIPES)) if (sameSet(items, r.items)) return r.out; return null; }

const RECIPES = {
  salad_l: { n: 'レタスサラダ', ic: 'saladL', items: ['lettuce_c'], pts: 15, time: 60 },
  salad: { n: 'サラダ', ic: '🥗', items: ['lettuce_c', 'tomato_c'], pts: 20, time: 70 },
  soup: { n: 'トマトスープ', ic: '🥣', items: ['soup'], pts: 25, time: 85 },
  onigiri: { n: 'おにぎり', ic: '🍙', items: ['gohan', 'nori'], pts: 20, time: 80 },
  sushi: { n: 'まきずし', ic: '🍣', items: ['gohan', 'nori', 'fish_c'], pts: 30, time: 95 },
  burger: { n: 'ハンバーガー', ic: '🍔', items: ['bun', 'patty'], pts: 25, time: 85 },
  burger_l: { n: 'レタスバーガー', ic: 'burgerL', items: ['bun', 'patty', 'lettuce_c'], pts: 30, time: 95 },
  curry: { n: 'カレーライス', ic: '🍛', items: ['gohan', 'curry'], pts: 35, time: 110 },
};

// ================================================================ themes
const THEMES = {
  school: { bg: 0xa8e2ff, f1: 0xfff1d2, f2: 0xffdca8, body: 0x7ec8e3, top: 0xfffaf0, slab: 0xd88a5a, ground: 0x8ad86a, music: 'school' },
  park: { bg: 0x9fe0ff, f1: 0xa8de78, f2: 0x96d266, body: 0xd89a5a, top: 0xf6e4c2, slab: 0x8a5a3a, ground: 0x6cc24a, music: 'park' },
  ship: { bg: 0x8fd4ff, f1: 0xd29a5e, f2: 0xc28a50, body: 0x3a6fb0, top: 0xf2f2f2, slab: 0x8a4a2a, ground: 0x2a8ad8, music: 'ship' },
  sushi: { bg: 0x2a1c3a, f1: 0xe6d6a6, f2: 0xd8c690, body: 0x8a4a2a, top: 0xf6ead0, slab: 0x4a2a1a, ground: 0x3a2a4a, music: 'sushi' },
  snow: { bg: 0xcfe8ff, f1: 0xdaf2ff, f2: 0xc2e4fa, body: 0x9a6a4a, top: 0xffffff, slab: 0x7aa0c0, ground: 0xf4fbff, music: 'snow' },
  camp: { bg: 0xffd6a0, f1: 0xb8d07a, f2: 0xa6c46a, body: 0xa8703a, top: 0xe8c890, slab: 0x6a4a2a, ground: 0x7ab84a, music: 'camp' },
  volcano: { bg: 0x3a1a1a, f1: 0x6a5a5a, f2: 0x5a4a4a, body: 0x8a3a2a, top: 0x4a3a3a, slab: 0x2a1a1a, ground: 0x2a1212, music: 'volcano' },
  boss: { bg: 0x2a1840, f1: 0xe0c8f8, f2: 0xceb0f0, body: 0x6a4ab0, top: 0xfff0ff, slab: 0x3a2a6a, ground: 0x3a2a5a, music: 'boss' },
};

// ================================================================ levels
// map legend: . floor  # counter  C board  S stove+pot  P stove+pan  D plates  W serve window  K sink  R dirty-plate return
//             T trash  E counter+extinguisher  % moving counter  ~ water  >< ^v conveyor  (space) nothing  crates: t l r n k b f c j o
const LEVELS = [
  {
    id: '1-1', name: 'ようちえんの きゅうしょくしつ', theme: 'school', recipes: ['salad_l', 'salad'], time: 150, stars: [40, 90, 140], plates: 4,
    map: ['##C##W##C##',
      '#.........#',
      'l..#D#T#..t',
      '#.........#',
      '#.........#',
      '#####C#####'],
    start: [[3, 3], [7, 3]], tut: 1,
    talk: 'まずは サラダから じゃ！ レタスを とって、 まないたで トントン きって、 おさらに のせて うけとりぐちへ！',
  },
  {
    id: '1-2', name: 'ぽかぽか こうえんの ピクニック', theme: 'park', recipes: ['soup', 'salad'], time: 150, stars: [50, 110, 170], plates: 4,
    map: ['##S###W###S#',
      '#..........#',
      't...#CTC#..l',
      '#..........#',
      '#..........#',
      '###D####C###'],
    start: [[3, 3], [8, 3]], tut: 2,
    talk: 'なべで トマトスープを つくるのじゃ。 きった トマトを 3つ いれてね。 にえたら おさらに いれて、 こげないうちに だそう！',
  },
  {
    id: '1-3', name: 'ゆらゆら ふねの キッチン', theme: 'ship', recipes: ['onigiri', 'soup'], time: 160, stars: [50, 110, 170], plates: 3, dirty: 1, tilt: 1,
    map: ['#S#S##W#R#K#',
      '#..........#',
      'r...#CnC#..t',
      '#..........#',
      '#..........#',
      '##D#C##T####'],
    start: [[3, 3], [8, 3]],
    talk: 'ふねが ゆれるぞ〜！ おにぎりは ごはんを なべで たいて、 のりと いっしょに。 よごれた おさらは ながしで あらってね！',
  },
  {
    id: '2-1', name: 'ねこの すしやさん', theme: 'sushi', recipes: ['sushi', 'onigiri'], time: 170, stars: [60, 120, 190], plates: 3, dirty: 1,
    map: ['#f#C##S#S#Cn#',
      '#...........r',
      '#...........#',
      '>>>>>>>>>>>>#',
      '#...........#',
      '#...........#',
      '##D#K#W#R#T##'],
    start: [[3, 1], [6, 4]],
    talk: 'ベルトコンベアで ざいりょうを はこぶのじゃ。 キッチンが ふたつに わかれておる！ 「こうたい」で ふーたんと リッキーを つかいわけよう！',
  },
  {
    id: '2-2', name: 'つるつる ゆきやまロッジ', theme: 'snow', recipes: ['burger', 'burger_l'], time: 170, stars: [60, 120, 190], plates: 3, dirty: 1, ice: 1,
    map: ['#k#C#P#P#W##',
      '#..........#',
      'b...#C#D#..l',
      '#..........#',
      '#..........#',
      '###T##K#R###'],
    start: [[3, 3], [8, 3]],
    talk: 'こおりの ゆかは つるつる すべるぞ！ ハンバーガーは おにくを きって フライパンで やいて、 パンと いっしょに！',
  },
  {
    id: '2-3', name: 'かわべの キャンプ', theme: 'camp', recipes: ['burger', 'salad'], time: 170, stars: [60, 120, 180], plates: 4, throw: 1,
    map: ['#k#C#l~#P#P##',
      '#.....~.....W',
      't..C..~..#..#',
      '#.....~..D..#',
      'b.....~.....#',
      '##C#T#~#T####'],
    start: [[2, 3], [9, 1]],
    talk: 'かわの むこうへ ざいりょうを なげて わたそう！ ざいりょうを もって 「なげる」 ボタンじゃ。 うけとる ひとは てを あけておこう！',
  },
  {
    id: '3-1', name: 'どっかん かざんの カレーやさん', theme: 'volcano', recipes: ['curry', 'onigiri'], time: 180, stars: [60, 130, 200], plates: 3, dirty: 1, fire: 1, erupt: 1,
    map: ['#c#j#o#S#S#S#',
      '#...........W',
      'r..#C#C#C#..#',
      '#...........#',
      'n...........E',
      '##D#T##K#R###'],
    start: [[3, 3], [9, 3]],
    talk: 'かざんが ふんかすると ひが つくぞ！ あかい しょうかきで 「けす」！ カレーは にんじん・じゃがいも・たまねぎを きって なべへ！',
  },
  {
    id: '3-2', name: 'ハラペコンの だいしょくどう', theme: 'boss', recipes: ['soup', 'onigiri', 'burger'], time: 210, stars: [80, 160, 240], plates: 4, fire: 1, boss: 1,
    map: ['#t#S#S#W#P#k#',
      '#.....%.....#',
      'l..C..%..C..b',
      '#.....%.....#',
      'r..D.....D..n',
      '#...........E',
      '###T#C#C#T###'],
    start: [[3, 3], [9, 3]], mover: { dz: 2, period: 16 },
    talk: 'ハラペコンが きたぞ！ おなかを いっぱいに するのじゃ！ まんなかの かべが うごくから きをつけて！',
  },
];
