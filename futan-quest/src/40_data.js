// ================================================================ game data
const CHARS = {
  futan: { name: 'ふーたん', job: 'ゆうしゃ', hp: [28, 7, 0.12], mp: [6, 3, 0.03], atk: [10, 2.5, 0.02], def: [6, 1.8, 0.02], agi: [7, 1.6, 0] },
  ricky: { name: 'リッキー', job: 'まほうつかい', hp: [18, 5, 0.08], mp: [12, 4.2, 0.05], atk: [5, 1.3, 0], def: [4, 1.3, 0.01], agi: [9, 1.9, 0] },
  pochi: { name: 'ポチ', job: 'いぬの せんし', hp: [30, 8, 0.12], mp: [4, 1.2, 0], atk: [12, 3.0, 0.02], def: [7, 2.0, 0.02], agi: [12, 2.0, 0] },
};
const LEARN = {
  futan: [[1, 'heal1'], [4, 'light1'], [6, 'home'], [10, 'light2'], [12, 'heal2'], [15, 'hero']],
  ricky: [[1, 'fire1'], [1, 'sleep'], [3, 'heal1'], [5, 'wind'], [8, 'healall'], [10, 'revive'], [13, 'fire2']],
  pochi: [[1, 'bite'], [3, 'howl'], [12, 'wonder']],
};
const MAXLV = 30;
const expFor = L => Math.round(6 * Math.pow(L - 1, 2));
function statAt(c, k, L) { const [b, g, q] = CHARS[c][k]; return Math.round(b + g * (L - 1) + q * (L - 1) * (L - 1)); }

const SPELLS = {
  heal1: { name: 'いたいの とんでけ', mp: 3, tgt: 'ally', kind: 'heal', pow: [28, 36], field: true, desc: 'ひとりの けがを なおす' },
  heal2: { name: 'げんき もりもり', mp: 6, tgt: 'ally', kind: 'heal', pow: [85, 105], field: true, desc: 'ひとりの けがを たくさん なおす' },
  healall: { name: 'みんな げんきに', mp: 9, tgt: 'allies', kind: 'heal', pow: [40, 52], field: true, desc: 'みんなの けがを なおす' },
  revive: { name: 'めを さまして', mp: 12, tgt: 'dead', kind: 'revive', field: true, desc: 'たおれた なかまを おこす' },
  home: { name: 'おうちに かえろ', mp: 4, tgt: 'none', kind: 'home', field: true, battle: false, desc: 'いちど いった まちへ とんでいく' },
  light1: { name: 'ピカピカ', mp: 3, tgt: 'enemy', kind: 'dmg', pow: [18, 24], elem: 'light', fx: 'light', desc: 'ひかりで こうげき' },
  light2: { name: 'キラキラ シャワー', mp: 7, tgt: 'enemies', kind: 'dmg', pow: [30, 38], elem: 'light', fx: 'stars', desc: 'てき ぜんぶに ひかりの シャワー' },
  hero: { name: 'ゆうしゃの ひかり', mp: 12, tgt: 'enemy', kind: 'dmg', pow: [90, 110], elem: 'light', fx: 'hero', desc: 'ゆうしゃだけの すごい ひかり' },
  fire1: { name: 'ぽかぽか', mp: 2, tgt: 'enemy', kind: 'dmg', pow: [14, 20], elem: 'fire', fx: 'fire', desc: 'あったかい ほのおの たま' },
  fire2: { name: 'ぽかぽか ボルケーノ', mp: 10, tgt: 'enemies', kind: 'dmg', pow: [55, 70], elem: 'fire', fx: 'volcano', desc: 'てき ぜんぶに おおきな ほのお' },
  wind: { name: 'ひゅるるん', mp: 5, tgt: 'enemies', kind: 'dmg', pow: [20, 28], elem: 'wind', fx: 'wind', desc: 'てき ぜんぶに かぜの うず' },
  sleep: { name: 'ねんねん ころり', mp: 3, tgt: 'enemies', kind: 'sleep', fx: 'sleep', desc: 'てきを ねむらせる こもりうた' },
  bite: { name: 'がぶがぶ', mp: 2, tgt: 'enemy', kind: 'phys', mult: 1.6, fx: 'bite', desc: 'おもいきり かみつく' },
  howl: { name: 'とおぼえ', mp: 2, tgt: 'enemies', kind: 'weaken', fx: 'howl', desc: 'わおーん！ てきの ちからを さげる' },
  wonder: { name: 'わんだふる アタック', mp: 5, tgt: 'enemy', kind: 'phys', mult: 2.3, fx: 'bite', desc: 'ひっさつの たいあたり' },
};
const ITEMS = {
  band: { name: 'ばんそうこう', price: 8, kind: 'heal', pow: 30, tgt: 'ally', desc: 'HPを 30くらい なおす' },
  candy: { name: 'あめだま', price: 30, kind: 'heal', pow: 80, tgt: 'ally', desc: 'HPを 80くらい なおす' },
  juice: { name: 'まほうの ジュース', price: 40, kind: 'mp', pow: 20, tgt: 'ally', desc: 'MPを 20 なおす' },
  leaf: { name: 'げんきの はっぱ', price: 120, kind: 'revive', tgt: 'dead', desc: 'たおれた なかまを おこす' },
  balloon: { name: 'おうちに かえる ふうせん', price: 20, kind: 'home', tgt: 'none', battle: false, desc: 'ひかりむらに かえれる' },
  // key items
  tsumiki: { name: 'まほうの つみき', key: true, desc: 'こわれた はしを なおせそう' },
  bell: { name: 'ひかりの すず', key: true, desc: 'やみの かべを けす すず' },
};
// equipment: slot w/a/s, who, power
const EQUIP = {
  toy: { name: 'おもちゃの つるぎ', slot: 'w', who: ['futan'], pow: 4, look: 'toy' },
  sponge: { name: 'スポンジの ハンマー', slot: 'w', who: ['futan'], pow: 9, price: 60, look: 'sponge' },
  starstick: { name: 'ほしの ステッキ', slot: 'w', who: ['futan'], pow: 16, price: 320, look: 'star' },
  herosword: { name: 'ゆうしゃの つるぎ', slot: 'w', who: ['futan'], pow: 30, look: 'hero' },
  rattle: { name: 'がらがら', slot: 'w', who: ['ricky'], pow: 2, look: 'rattle' },
  crayon: { name: 'まほうの クレヨン', slot: 'w', who: ['ricky'], pow: 6, price: 90, look: 'crayon', mag: 1.1 },
  rainbow: { name: 'にじいろ ステッキ', slot: 'w', who: ['ricky'], pow: 12, price: 300, look: 'rainbow', mag: 1.25 },
  bone: { name: 'ほね', slot: 'w', who: ['pochi'], pow: 5 },
  sharpbone: { name: 'とがった ほね', slot: 'w', who: ['pochi'], pow: 12, price: 260 },
  boomerang: { name: 'ほねほね ブーメラン', slot: 'w', who: ['pochi'], pow: 21, price: 680 },
  smock: { name: 'ようちえんの スモック', slot: 'a', who: ['futan'], pow: 2 },
  babywear: { name: 'ベビー ふく', slot: 'a', who: ['ricky'], pow: 1 },
  raincoat: { name: 'レインコート', slot: 'a', who: ['futan', 'ricky'], pow: 6, price: 70 },
  plush: { name: 'ぬいぐるみの よろい', slot: 'a', who: ['futan'], pow: 13, price: 300 },
  pajama: { name: 'ふわふわ パジャマ', slot: 'a', who: ['ricky'], pow: 10, price: 220 },
  heromantle: { name: 'ひかりの マント', slot: 'a', who: ['futan'], pow: 22 },
  redcollar: { name: 'あかい くびわ', slot: 'a', who: ['pochi'], pow: 3 },
  ironcollar: { name: 'てつの くびわ', slot: 'a', who: ['pochi'], pow: 9, price: 200 },
  potlid: { name: 'おなべの ふた', slot: 's', who: ['futan'], pow: 3, price: 40, look: 'pot' },
  pan: { name: 'フライパンの たて', slot: 's', who: ['futan'], pow: 7, price: 180, look: 'pan' },
};
const SHOPS = {
  weapon1: { title: 'ぶきや', items: ['sponge', 'crayon', 'potlid', 'raincoat'], hello: 'いらっしゃい！ ぶきと ぼうぐの おみせだよ。' },
  item1: { title: 'どうぐや', items: ['band', 'juice', 'balloon'], hello: 'こんにちは！ どうぐや だよ。' },
  weapon2: { title: 'ぶきや', items: ['starstick', 'rainbow', 'sharpbone', 'boomerang', 'plush', 'pajama', 'ironcollar', 'pan'], hello: 'ようこそ ポプラの ぶきやへ！ もりの めいひんばかり だよ。' },
  item2: { title: 'どうぐや', items: ['band', 'candy', 'juice', 'leaf', 'balloon'], hello: 'いらっしゃいませ〜。 なにに する？' },
};
// ---------------------------------------------------------------- monsters
// act: list of [weight, action]. actions: 'atk', 'skill:<id>'
const MONS = {
  slime: { name: 'ぷるりん', model: 'slime', color: 0x3aa0ff, scale: 1.0, hp: 8, atk: 9, def: 4, agi: 4, exp: 3, gold: 3, drop: ['band', 0.08] },
  bat: { name: 'ねむねむバット', model: 'bat', color: 0x6a4a8a, scale: 1.0, hp: 8, atk: 10, def: 4, agi: 14, exp: 4, gold: 4 },
  shroom: { name: 'おばけキノコ', model: 'shroom', color: 0xd83a2a, scale: 1.0, hp: 12, atk: 11, def: 6, agi: 5, exp: 5, gold: 6, act: [[5, 'atk'], [1, 'spore']], drop: ['band', 0.12] },
  pinkslime: { name: 'ももぷるりん', model: 'slime', color: 0xff6aa8, scale: 1.1, hp: 22, atk: 25, def: 14, agi: 10, exp: 10, gold: 9, drop: ['band', 0.1] },
  cavebat: { name: 'いわこうもり', model: 'bat', color: 0x5a5048, scale: 1.15, hp: 18, atk: 27, def: 10, agi: 22, exp: 9, gold: 7 },
  poishroom: { name: 'どくどくキノコ', model: 'shroom', color: 0x8a3ad8, scale: 1.15, hp: 28, atk: 29, def: 16, agi: 8, exp: 13, gold: 11, angry: true, act: [[3, 'atk'], [1, 'spore']], drop: ['candy', 0.06] },
  bear: { name: 'ねぼすけベア', model: 'bear', color: 0x7a4a2a, scale: 1.0, hp: 120, atk: 37, def: 20, agi: 6, exp: 150, gold: 120, boss: true, shadow: 2.4, act: [[4, 'atk'], [2, 'roll'], [1, 'yawn'], [2, 'snooze']] },
  ghost: { name: 'いたずらゴースト', model: 'ghost', color: 0xe8f0ff, scale: 1.1, hp: 40, atk: 42, def: 22, agi: 20, exp: 26, gold: 18, act: [[3, 'atk'], [1, 'chill']], drop: ['juice', 0.06] },
  golem: { name: 'つみきゴーレム', model: 'golem', scale: 1.0, hp: 62, atk: 50, def: 34, agi: 6, exp: 34, gold: 26, shadow: 1.2 },
  gdragon: { name: 'くさむらドラゴン', model: 'dragon', color: 0x4aa83a, belly: 0xe8e0a0, scale: 1.0, hp: 48, atk: 46, def: 28, agi: 16, exp: 30, gold: 22, act: [[3, 'atk'], [1, 'breath']], drop: ['candy', 0.08] },
  aquaslime: { name: 'みずぷるりん', model: 'slime', color: 0x3ae0d8, scale: 1.2, hp: 46, atk: 50, def: 38, agi: 18, exp: 32, gold: 20 },
  bghost: { name: 'こおりゴースト', model: 'ghost', color: 0x8ac8ff, scale: 1.2, hp: 58, atk: 54, def: 30, agi: 24, exp: 40, gold: 26, act: [[2, 'atk'], [1, 'chill'], [1, 'sleepsong']] },
  rgolem: { name: 'いしの ゴーレム', model: 'golem', color: 0x9a9a9a, scale: 1.2, hp: 82, atk: 60, def: 46, agi: 8, exp: 48, gold: 30, shadow: 1.3 },
  knight: { name: 'かげナイト', model: 'knight', color: 0x2a2840, scale: 1.25, hp: 520, atk: 76, def: 48, agi: 30, exp: 600, gold: 400, boss: true, shadow: 1.8, act: [[4, 'atk'], [2, 'darkslash'], [2, 'shadowwave'], [1, 'guardup']] },
  bdragon: { name: 'よるの ドラゴン', model: 'dragon', color: 0x3a2a6a, belly: 0x9a8ab8, wing: 0x5a3a9a, scale: 1.25, hp: 92, atk: 82, def: 52, agi: 30, exp: 72, gold: 42, act: [[3, 'atk'], [1, 'breath2']], drop: ['candy', 0.1] },
  darkslime: { name: 'やみぷるりん', model: 'slime', color: 0x5a2a8a, dark: true, scale: 1.3, hp: 72, atk: 74, def: 56, agi: 26, exp: 62, gold: 36, act: [[3, 'atk'], [1, 'darkfire']], drop: ['juice', 0.1] },
  nknight: { name: 'よるの へいたい', model: 'knight', color: 0x3a3a5a, scale: 1.0, hp: 104, atk: 86, def: 60, agi: 22, exp: 86, gold: 50, shadow: 1.2 },
  ngolem: { name: 'やみの ゴーレム', model: 'golem', color: 0x6a4a9a, scale: 1.3, hp: 120, atk: 90, def: 66, agi: 10, exp: 95, gold: 55, shadow: 1.4 },
  king1: { name: 'よふかし まおう', model: 'owl', color: 0x3a2a5a, scale: 1.25, hp: 640, atk: 88, def: 58, agi: 45, exp: 0, gold: 0, boss: true, shadow: 2.2, twice: true, act: [[3, 'atk'], [2, 'stardust'], [1, 'sleepsong'], [1, 'nightheal']] },
  king2: { name: 'やみの まおう ヨフカシ', model: 'bigdragon', color: 0x2a1a4a, scale: 1.0, hp: 820, atk: 96, def: 62, agi: 40, exp: 0, gold: 0, boss: true, shadow: 4, twice: true, act: [[4, 'atk'], [2, 'darkflame'], [1, 'thunder'], [1, 'claw']] },
};
const MSKILL = {
  spore: { msg: '{n}は ねむりの こなを まいた！', kind: 'sleep', tgt: 'one', chance: 0.55 },
  roll: { msg: '{n}は ごろんと ねがえりを うった！', kind: 'phys', tgt: 'one', mult: 1.3 },
  yawn: { msg: '{n}は おおきな あくびを した！ ふわぁ〜…', kind: 'sleep', tgt: 'all', chance: 0.3 },
  snooze: { msg: '{n}は ぐうぐう ねている…', kind: 'none' },
  chill: { msg: '{n}は つめたい いきを ふきかけた！', kind: 'magic', tgt: 'one', pow: [14, 20] },
  breath: { msg: '{n}は ほのおを はいた！', kind: 'magic', tgt: 'all', pow: [10, 16], fx: 'breath' },
  breath2: { msg: '{n}は はげしい ほのおを はいた！', kind: 'magic', tgt: 'all', pow: [24, 32], fx: 'breath' },
  sleepsong: { msg: '{n}は ねむくなる うたを うたった！ 〜♪', kind: 'sleep', tgt: 'all', chance: 0.3 },
  darkslash: { msg: '{n}の やみの つるぎ！', kind: 'phys', tgt: 'one', mult: 1.6 },
  shadowwave: { msg: '{n}は かげの はどうを はなった！', kind: 'magic', tgt: 'all', pow: [22, 30], fx: 'dark' },
  guardup: { msg: '{n}は たてを かまえた！ まもりが あがった！', kind: 'buff' },
  darkfire: { msg: '{n}は むらさきの ほのおを はなった！', kind: 'magic', tgt: 'one', pow: [30, 40], fx: 'dark' },
  stardust: { msg: '{n}は よるの ほしくずを ふらせた！', kind: 'magic', tgt: 'all', pow: [30, 40], fx: 'dark' },
  nightheal: { msg: '{n}は つきの ひかりで けがを なおした！', kind: 'selfheal', pow: [50, 65] },
  darkflame: { msg: '{n}は やみの ほのおを はいた！', kind: 'magic', tgt: 'all', pow: [32, 42], fx: 'breath' },
  thunder: { msg: '{n}は いかずちを よんだ！', kind: 'magic', tgt: 'one', pow: [50, 62], fx: 'thunder' },
  claw: { msg: '{n}の するどい つめ！', kind: 'phys', tgt: 'one', mult: 1.35 },
};
// encounter tables: [weight, id]
const ZONES = {
  z1: { mons: [[5, 'slime'], [3, 'bat'], [2, 'shroom']], size: [[8, 1], [3, 2]] },
  z1b: { mons: [[3, 'slime'], [3, 'shroom'], [2, 'bat'], [2, 'pinkslime']], size: [[5, 1], [4, 2], [1, 3]] },
  cave: { mons: [[4, 'pinkslime'], [3, 'cavebat'], [3, 'poishroom']], size: [[4, 1], [5, 2], [2, 3]] },
  z2: { mons: [[3, 'ghost'], [3, 'gdragon'], [2, 'golem'], [2, 'pinkslime']], size: [[3, 1], [5, 2], [3, 3]] },
  shrine: { mons: [[3, 'aquaslime'], [3, 'bghost'], [2, 'rgolem']], size: [[2, 1], [5, 2], [3, 3]] },
  z3: { mons: [[3, 'bdragon'], [3, 'darkslime'], [2, 'nknight'], [1, 'golem']], size: [[3, 1], [5, 2], [2, 3]] },
  castle: { mons: [[3, 'bdragon'], [3, 'darkslime'], [3, 'nknight'], [2, 'ngolem']], size: [[2, 1], [5, 2], [3, 3]] },
};
function wpick(list) { let t = 0; for (const [w] of list) t += w; let r = Math.random() * t; for (const [w, v] of list) { r -= w; if (r <= 0) return v; } return list[0][1]; }
