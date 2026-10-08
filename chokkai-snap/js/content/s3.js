// ステージ3：キャンプ場（78 イベント）。登場人物・台詞はすべてオリジナル。
// 川（上流＝左、下流＝右）が手前を横切り、奥に森と山。左端のロープウェイから右端の下流まで、連鎖は画面をまたいで遠くへ飛ぶ。
const done = id => ({ eventDone: id });
const notDone = id => ({ eventNotDone: id });
const anyDone = (...ids) => ({ anyEventDone: ids });
const noneDone = (...ids) => ({ not: { anyEventDone: ids } });
const E = n => 'S3-E' + String(n).padStart(2, '0');
const BEAR_END = [E(26), E(27), E(28), E(29)];

// ── 背景（タップできない飾り） ──
const scenery = [
  // 空と遠景の山なみ
  { t: 'rect', x: 0, y: 0, w: 9000, h: 840, fill: '#bfe6f7' },
  { t: 'rect', x: 0, y: 0, w: 9000, h: 280, fill: '#a6d8f0' },
  { t: 'poly', pts: [0, 840, 0, 640, 500, 520, 900, 610, 1300, 480, 2100, 600, 2600, 470, 3300, 610, 3900, 520, 4600, 640, 5200, 500, 5900, 600, 6500, 470, 7100, 590, 7900, 520, 8500, 610, 9000, 540, 9000, 840], fill: '#a9cbbb' },
  { t: 'poly', pts: [0, 840, 0, 720, 700, 650, 1500, 730, 2300, 660, 3000, 740, 3800, 670, 4500, 750, 5300, 680, 6100, 740, 6900, 660, 7700, 740, 8400, 680, 9000, 720, 9000, 840], fill: '#8fb9a0' },
  { t: 'text', text: 'ヨビカケ岳', x: 1500, y: 300, s: 34, fill: 'rgba(40,70,60,.55)', bold: true },
  { t: 'text', text: 'ケムリ山', x: 7600, y: 300, s: 34, fill: 'rgba(90,50,40,.55)', bold: true },
  // 地面・森・小道
  { t: 'rect', x: 0, y: 820, w: 9000, h: 1220, fill: '#94c56c' },
  { t: 'rect', x: 0, y: 820, w: 9000, h: 470, fill: '#6fa855' },
  { t: 'stripes', x: 0, y: 820, w: 9000, h: 470, dir: 'v', n: 60, c1: 'rgba(0,0,0,0)', c2: 'rgba(30,70,30,.10)' },
  { t: 'rect', x: 0, y: 1510, w: 9000, h: 80, fill: '#d9c48f', r: 36 },
  { t: 'stripes', x: 0, y: 1510, w: 9000, h: 80, dir: 'v', n: 90, c1: 'rgba(0,0,0,0)', c2: 'rgba(120,90,40,.10)' },
  // 川（左が上流）と両岸
  { t: 'rect', x: 0, y: 1990, w: 9000, h: 50, fill: '#d4c391' },
  { t: 'water', x: 0, y: 2035, w: 9000, h: 340, fill: '#5aa8d6' },
  { t: 'stripes', x: 0, y: 2035, w: 9000, h: 340, dir: 'h', n: 6, c1: 'rgba(255,255,255,0)', c2: 'rgba(255,255,255,.07)' },
  { t: 'rect', x: 0, y: 2370, w: 9000, h: 230, fill: '#a3be76' },
  { t: 'rect', x: 0, y: 2365, w: 9000, h: 22, fill: '#cdbb88' },
  { t: 'text', text: '← 上流', x: 260, y: 2470, s: 34, fill: 'rgba(30,60,40,.6)', bold: true },
  { t: 'text', text: '下流 →', x: 8740, y: 2470, s: 34, fill: 'rgba(30,60,40,.6)', bold: true },
  // 木の橋
  { t: 'rect', x: 5960, y: 2010, w: 160, h: 380, fill: '#a77a4a', stroke: '#6b4a2a', lw: 4 },
  { t: 'stripes', x: 5960, y: 2010, w: 160, h: 380, dir: 'h', n: 14, c1: 'rgba(0,0,0,0)', c2: 'rgba(80,50,20,.25)' },
  // ロープウェイ（左）
  { t: 'line', pts: [1000, 960, 1480, 470], stroke: '#444', w: 4 },
  { t: 'line', pts: [1040, 975, 1500, 500], stroke: '#555', w: 2 },
  { t: 'rect', x: 1230, y: 700, w: 14, h: 160, fill: '#777' },
  { t: 'building', x: 880, y: 1170, w: 260, h: 190, fill: '#e8dcc0', roof: '#b0473a', sign: 'ロープウェイ', signFill: '#fff', signColor: '#b0473a', door: true },
  // 見晴らし岩（中央奥）
  { t: 'ellipse', x: 4700, y: 1010, rx: 150, ry: 46, fill: '#9a9389' },
  { t: 'ellipse', x: 4690, y: 990, rx: 120, ry: 30, fill: '#b3aca1' },
  { t: 'sign', x: 4560, y: 860, w: 180, h: 46, text: '見晴らし台', fill: '#f4ecd8', color: '#5a4630', s: 22 },
  // 管理棟と売店
  { t: 'building', x: 6060, y: 1420, w: 460, h: 230, fill: '#e2cfa8', roof: '#4f7a3a', sign: '管理棟・売店', signFill: '#fff8e0', signColor: '#4f7a3a', door: true, windows: true, awning: '#e7b34a' },
  { t: 'sign', x: 6560, y: 1440, w: 150, h: 60, text: 'サル注意', fill: '#ffde59', color: '#a33', s: 24 },
  { t: 'fence', x: 5700, y: 1440, w: 340, h: 40, fill: '#b08a5a' },
  // BBQ エリア
  { t: 'rect', x: 5180, y: 1640, w: 300, h: 26, fill: '#555', r: 6 },
  { t: 'rect', x: 5200, y: 1666, w: 12, h: 60, fill: '#444' }, { t: 'rect', x: 5450, y: 1666, w: 12, h: 60, fill: '#444' },
  { t: 'emoji', e: '🔥', x: 5260, y: 1630, s: 34 }, { t: 'emoji', e: '🌽', x: 5310, y: 1636, s: 28 }, { t: 'emoji', e: '🧅', x: 5420, y: 1636, s: 26 },
  { t: 'sign', x: 5180, y: 1460, w: 200, h: 50, text: 'BBQ エリア', fill: '#fff', color: '#c0502a', s: 24 },
  { t: 'rect', x: 5500, y: 1800, w: 120, h: 40, fill: '#7fb6d6', r: 10 },
  // 家族のテントまわり（中央）
  { t: 'rect', x: 4120, y: 1700, w: 260, h: 20, fill: '#8a5a33', r: 4 },
  { t: 'emoji', e: '🍚', x: 4170, y: 1688, s: 26 }, { t: 'emoji', e: '🥄', x: 4330, y: 1690, s: 24 },
  { t: 'emoji', e: '🪑', x: 4620, y: 1560, s: 44 },
  { t: 'line', pts: [3820, 1450, 4020, 1400], stroke: '#e44', w: 2 },
  { t: 'emoji', e: '👕', x: 3880, y: 1440, s: 30 }, { t: 'emoji', e: '🧦', x: 3960, y: 1425, s: 24 },
  // 左のキャンプ区画
  { t: 'rect', x: 2320, y: 1640, w: 220, h: 24, fill: '#8a5a33', r: 4 },
  { t: 'rect', x: 2340, y: 1664, w: 10, h: 50, fill: '#6b4426' }, { t: 'rect', x: 2510, y: 1664, w: 10, h: 50, fill: '#6b4426' },
  { t: 'emoji', e: '🍙', x: 3000, y: 1690, s: 30 }, { t: 'emoji', e: '🍳', x: 2860, y: 1640, s: 32 },
  // ハンモック（左奥）のロープ
  { t: 'line', pts: [3070, 1300, 3110, 1380], stroke: '#a77', w: 3 }, { t: 'line', pts: [3330, 1300, 3290, 1380], stroke: '#a77', w: 3 },
  // 釣り場（上流）
  { t: 'ellipse', x: 1850, y: 2025, rx: 90, ry: 22, fill: '#9a9389' },
  { t: 'line', pts: [1880, 1930, 1960, 2120], stroke: '#555', w: 2 },
  // ボート
  { t: 'emoji', e: '🛶', x: 3330, y: 2215, s: 170 },
  // 下流の遊び場
  { t: 'emoji', e: '⛱️', x: 7050, y: 1880, s: 80 },
  { t: 'rect', x: 7260, y: 1925, w: 90, h: 50, fill: '#4aa3df', r: 8 },
  { t: 'emoji', e: '🪣', x: 8520, y: 2000, s: 34 }, { t: 'emoji', e: '🦐', x: 8580, y: 2075, s: 26 },
  // 右の森の奥
  { t: 'ellipse', x: 8150, y: 1200, rx: 70, ry: 24, fill: '#9a9389' },
  { t: 'emoji', e: '🔭', x: 8000, y: 1130, s: 40 },
  { t: 'rect', x: 7560, y: 1440, w: 12, h: 60, fill: '#6b4426' },
  // テント（飾り）
  { t: 'emoji', e: '⛺', x: 1500, y: 1700, s: 110 }, { t: 'emoji', e: '⛺', x: 5900, y: 1850, s: 90 }, { t: 'emoji', e: '⛺', x: 8800, y: 1700, s: 100 },
  { t: 'emoji', e: '🏕️', x: 3600, y: 1880, s: 80 },
  { t: 'emoji', e: '🚐', x: 300, y: 1700, s: 130 }, { t: 'emoji', e: '🚙', x: 520, y: 1760, s: 100 },
  { t: 'sign', x: 160, y: 1480, w: 200, h: 54, text: 'P 駐車場', fill: '#2f5aa8', color: '#fff', s: 24 },
  { t: 'emoji', e: '🪵', x: 4520, y: 1720, s: 36 },
];
// 森の木（奥）・草花・川の石などを配置表から展開
const TREE = '🌳🌲🌳🌲🌳🌳🌲';
[
  [60, 930], [260, 1010], [420, 900], [620, 1060], [760, 950], [1380, 1050], [1650, 940], [1820, 1080], [1980, 960],
  [2150, 1010], [2400, 920], [2640, 1040], [2900, 950], [3050, 1290], [3330, 1290], [3480, 980], [3760, 930], [3980, 1060],
  [4200, 930], [4420, 1070], [5000, 940], [5200, 1060], [5420, 930], [5850, 1000], [6050, 930], [6300, 1030], [6560, 1090],
  [6800, 960], [7000, 1060], [7240, 1060], [7480, 940], [7700, 1050], [7900, 950], [8180, 1040], [8560, 960], [8760, 1080], [8930, 940],
].forEach(([x, y], i) => scenery.push({ t: 'emoji', e: [...TREE][i % 7] === '🌲' ? '🌲' : '🌳', x, y, s: 120 + (i * 37) % 60 }));
[
  [160, 1300], [900, 1340], [1300, 1400], [2050, 1350], [2700, 1420], [3600, 1420], [4400, 1380], [5100, 1330],
  [6700, 1360], [7300, 1330], [8300, 1380], [8900, 1330],
].forEach(([x, y], i) => scenery.push({ t: 'emoji', e: i % 3 ? '🌿' : '🌳', x, y, s: i % 3 ? 54 : 110 }));
['🌼', '🌸', '🌾', '🌼', '🍀', '🌷'].forEach((e, k) => {
  for (let i = 0; i < 6; i++) scenery.push({ t: 'emoji', e, x: 200 + ((k * 1530 + i * 1480) % 8700), y: 1620 + ((k * 61 + i * 97) % 340), s: 24 + (i % 3) * 6 });
});
[[600, 2160], [1300, 2300], [2500, 2120], [4000, 2310], [5200, 2140], [6600, 2290], [7800, 2120], [8900, 2260]].forEach(([x, y]) => scenery.push({ t: 'emoji', e: '🪨', x, y, s: 44 }));
[[300, 2000], [1150, 2010], [2750, 2005], [3950, 2000], [5550, 2010], [6850, 2005], [8150, 2000]].forEach(([x, y]) => scenery.push({ t: 'emoji', e: '🌾', x, y, s: 52 }));
[[800, 2240], [2900, 2290], [5700, 2250], [7500, 2280]].forEach(([x, y]) => scenery.push({ t: 'emoji', e: '🐟', x, y, s: 30, rot: 0.3 }));
[[700, 2480], [2100, 2520], [3500, 2460], [4900, 2530], [6300, 2480], [7700, 2520]].forEach(([x, y]) => scenery.push({ t: 'emoji', e: '🌿', x, y, s: 48 }));
[[1000, 120], [2600, 200], [4100, 110], [5400, 230], [6900, 130], [8300, 210]].forEach(([x, y]) => scenery.push({ t: 'emoji', e: '☁️', x, y, s: 110 }));

// ── 見た目プリセット ──
const kidLook = (shirt, extra = {}) => ({ h: 112, kid: true, hair: 'short', hairColor: '#2a2a2a', shirt, pants: '#3a5a8a', ...extra });

export default {
  id: 'S3', title: 'もりもりキャンプ', subtitle: 'キャンプ場', theme: 'キャンプ場',
  intro: '川と森にかこまれたキャンプ場。晩ごはんの支度、虫とり、かくれんぼ……みんな好き勝手に夏を満喫中。西の空が少しあやしい。',
  timeLimitMs: 360000,
  world: { width: 9000, height: 2600, minZoom: 0.75, maxZoom: 4, bg: '#94c56c', spawnCamera: { x: 4300, y: 1500, zoom: 1 } },
  bgm: { tempo: 104, key: 5, mood: 'calm' },
  clearEventId: 'S3-E78', timeoutEventId: 'S3-E77',
  routes: {
    'S3.route.cook': '晩ごはんの支度', 'S3.route.river': 'ボートと川のさわぎ', 'S3.route.fish': '釣り名人', 'S3.route.bugs': '虫とりとかくれんぼ',
    'S3.route.bear': 'テントの中のクマ', 'S3.route.haiku': '祖父の一句', 'S3.route.office': '管理人と部長', 'S3.route.monkey': 'サルとバナナ',
    'S3.route.hungry': 'はらぺこゴンベエ', 'S3.route.birds': 'バードウォッチング', 'S3.route.travel': '看板と旅人', 'S3.route.mountain': 'ヤッホーと山',
    'S3.route.toilet': 'トイレの紙', 'S3.route.juice': 'ジュースのゆくえ', 'S3.route.misc': 'キャンプ場のあれこれ', 'S3.route.end': '夕立',
  },
  scenery,
  actors: {
    // ── 中央：主人公一家 ──
    papa: {
      name: '父', x: 4250, y: 1670, wander: 70,
      look: { h: 160, hair: 'short', hairColor: '#333', shirt: '#4f7fb0', pants: '#5a5040', acc: ['cap'], hatColor: '#e0a030' },
      idle: [
        { text: 'かまどを組みたいんだが、ちょうどいい大きさのがなあ……', when: [notDone(E(1))] },
        { text: '平べったくて、ずっしりしたやつがいいんだよ', when: [notDone(E(1))] },
        { text: 'かまどは完成！ あとは燃やすものだな。マキオー！', when: [done(E(1)), { not: { allEventsDone: [E(2), E(3)] } }] },
        { text: 'さっき森のほうで、なにか吠えなかったか……？', when: [done(E(23)), noneDone(...BEAR_END)] },
        { text: 'ふう、クマ騒ぎもおさまったな。さあメシだメシ！', when: [anyDone(...BEAR_END)] },
        'キャンプは段取りが命だぞ',
      ],
    },
    mama: {
      name: '母', x: 4450, y: 1650, wander: 50,
      look: { h: 155, hair: 'pony', hairColor: '#5a3220', shirt: '#e98a6a', pants: '#4a5a6a', acc: ['apron'] },
      idle: [
        { text: '火がおきないと、料理もなにもないのよねえ', when: [{ not: { allEventsDone: [E(2), E(3)] } }] },
        { text: '火の準備はばっちり。……さて、今夜の味の決め手はどうしようかしら', when: [done(E(2)), done(E(3)), noneDone(E(4), E(5))] },
        { text: 'いい匂いでしょ。その前に、汚れたお皿をなんとかしなきゃ……', when: [anyDone(E(4), E(5)), notDone(E(6))] },
        { text: 'カレーにはやっぱりお肉よねえ……足りるかしら', when: [done(E(4)), notDone(E(7))] },
        { text: 'ごはんはできたのに、みんなどこ行ったのかしら', when: [done(E(6))] },
        '虫よけスプレー、ちゃんとした？',
      ],
    },
    makio: {
      name: 'マキオ', x: 3900, y: 1620, wander: 110, speed: 80,
      look: kidLook('#f2a33a', { h: 125, hair: 'spiky' }),
      idle: [
        { text: '父ちゃん、かまどまだ〜？ 石が見つからないんだって', when: [notDone(E(1))] },
        { text: '燃やすもの……上流にも下流にも流木が打ちあがってたなあ', when: [done(E(1)), noneDone(E(2), E(3))] },
        { text: 'まだ半分しかない。もう片っぽの岸の先にもあったはず', when: [anyDone(E(2), E(3)), { not: { allEventsDone: [E(2), E(3)] } }] },
        '名前がマキオだから薪係って、ひどくない？',
      ],
    },
    jiisan: {
      name: '祖父', x: 4620, y: 1580, wander: 0,
      look: { h: 148, old: true, hair: 'bald', hairColor: '#ddd', shirt: '#7c8a5c', pants: '#4a4a3a', acc: ['beard', 'hat'], hatColor: '#d8c89a', sit: true },
      idle: [
        '一句ひねりたいが、題材がのう……',
        '目に映るもの、なんでも句になるんじゃ',
        { text: 'おや、山から煙が。……いや、詠むのは見てからじゃ', when: [done(E(58)), notDone(E(33))] },
        { text: '手紙を流すなら、瓶がいちばんじゃのう', when: [done(E(72)), notDone(E(76))] },
        { text: '西の空が、ちと暗いのう', when: [{ timeRemainingAtMostMs: 120000 }] },
      ],
    },
    // ── 左：ノブヒコ一家・ハナエ＆ダイキチ ──
    nobu: {
      name: 'ノブヒコ', x: 2300, y: 1720, wander: 80,
      look: kidLook('#59b36b', { h: 130, hair: 'bob', hairColor: '#4a2a1a' }),
      idle: [
        '父ちゃん、買い出しからまだ帰ってこない',
        { text: 'お隣、カレーだって！ うちの父ちゃんに頼めば……', when: [done(E(4)), notDone(E(7))] },
        { text: '母ちゃん、スマホ置きっぱなしにするんだよなあ', when: [notDone(E(7))] },
      ],
    },
    nobumom: {
      name: 'ノブヒコの母', x: 2480, y: 1660, wander: 30,
      look: { h: 152, hair: 'bun', hairColor: '#2a1a10', shirt: '#b38bd6', pants: '#555', acc: ['sunglasses'] },
      idle: ['日焼け止め、塗りなおさなきゃ', 'お父さん、どこで寄り道してるのかしら', { text: 'あら、わたしのスマホ……？', when: [done(E(7))] }],
    },
    hanae: {
      name: 'ハナエ', x: 2860, y: 1640, wander: 60,
      look: { h: 165, wide: true, muscle: true, hair: 'afro', hairColor: '#3a2010', shirt: '#d94a4a', pants: '#3a3a5a', acc: ['earring'] },
      idle: [
        'なんでもかかってきなさい！ 投げるものなら山ほどあるわよ',
        'フライパンはね、料理と護身の兼用よ',
        { text: 'クマ？ 出たら見せなさいよ、相手してやるわ', when: [done(E(23)), noneDone(...BEAR_END)] },
      ],
    },
    daikichi: {
      name: 'ダイキチ', x: 2980, y: 1720, wander: 0,
      look: { h: 150, wide: true, hair: 'short', hairColor: '#222', shirt: '#f2d14e', pants: '#6a4a2a', sit: true },
      idle: [
        'おにぎり、まだ七個ある。しあわせ',
        'おなかすいてる子がいたら、分けてあげたいなあ',
        { text: 'クマもきっと、おなかがすいてるだけだよ', when: [done(E(23)), noneDone(...BEAR_END)] },
      ],
    },
    sleeper: {
      name: 'ねぼすけ大学生', x: 2650, y: 1560, wander: 0, hidden: true,
      look: { h: 150, hair: 'mohawk', hairColor: '#7a3', shirt: '#888', pants: '#444', acc: ['headphones'] },
      idle: ['ふあ〜……いま何時？', 'キャンプって、寝るところでしょ？'],
    },
    // ── 森（左〜中央）：虫とり・かくれんぼ ──
    riku: {
      name: 'リク', x: 2300, y: 1230, wander: 160, speed: 80,
      look: kidLook('#3fa0d8', { acc: ['cap'], hatColor: '#2a6a2a' }),
      idle: [
        { text: '虫とり大会、優勝するには大物がいるんだ……角のあるやつ！', when: [notDone(E(15))] },
        { text: 'この森、樹液のにおいがする', when: [notDone(E(15))] },
        { text: 'もう虫とりは満足！ かくれんぼしよー', when: [done(E(15))] },
      ],
    },
    haru: {
      name: 'ハル', x: 3200, y: 1260, wander: 90, speed: 70,
      look: kidLook('#f07aa0', { hair: 'twin', hairColor: '#5a2a1a', skirt: true }),
      idle: [
        { text: '地面に小さい行列……どこに帰るんだろう', when: [notDone(E(18))] },
        { text: 'リクの虫とりが終わらないと、かくれんぼの鬼ができないよ', when: [notDone(E(15))] },
        { text: 'ソラとウミ、どこに隠れたの〜？ 森のどこかなんだけど', when: [done(E(15)), done(E(18)), noneDone(E(19), E(22))] },
        { text: 'あの兄弟、木にでも化けてるんじゃないの？', when: [done(E(15)), done(E(18)), noneDone(E(19), E(22))] },
      ],
    },
    sora: {
      name: 'ソラ（兄）', x: 5600, y: 1200, wander: 60, hidden: true, speed: 90,
      look: kidLook('#7a6ad8', { hair: 'spiky', hairColor: '#333' }),
      idle: [
        { text: 'つぎは探検だ！ テントって、中どうなってるんだろ', when: [noneDone(E(23))] },
        { text: 'いちばん右のテント、ずっとゴソゴソ動いてたよな……', when: [noneDone(E(23))] },
        { text: 'ク、クマだった……！ だれか大人に知らせなきゃ！', when: [done(E(23)), noneDone(...BEAR_END)] },
      ],
    },
    umi: {
      name: 'ウミ（弟）', x: 5660, y: 1210, wander: 60, hidden: true, speed: 90,
      look: kidLook('#7a6ad8', { h: 100, hair: 'bob', hairColor: '#333' }),
      idle: ['にいちゃん、まってよ〜', '木の着ぐるみ、あつかった'],
    },
    butterfly: { name: 'チョウ', emoji: '🦋', size: 34, x: 2800, y: 1080, wander: 140, speed: 50, idle: ['ひらひら……'] },
    squirrel: {
      name: 'リス', emoji: '🐿️', size: 46, x: 3760, y: 1000, wander: 70, speed: 90,
      idle: ['キュッ？', { text: 'キュルル……（地面をくんくん探している）', when: [notDone(E(60))] }],
    },
    // ── 川（左〜中央） ──
    angler: {
      name: '釣り人', x: 1850, y: 2010, wander: 0,
      look: { h: 150, hair: 'short', hairColor: '#888', shirt: '#6a7f4a', pants: '#3a3a3a', acc: ['hat', 'mustache'], hatColor: '#c8b070', sit: true },
      idle: [
        { text: '……浮きが、ピクッとしたような', when: [notDone(E(11))] },
        { text: 'あのヌシは、まだこの川にいるはずだ', when: [done(E(11)), notDone(E(12))] },
        { text: 'まだまだ何か引っかかってる気がする', when: [done(E(12)), notDone(E(13))] },
        { text: 'いざとなりゃ、この竿でなんでも釣り上げてやる', when: [notDone(E(8))] },
      ],
    },
    cat: {
      name: 'ノラ猫', emoji: '🐈', size: 60, x: 2150, y: 1920, wander: 220, speed: 70,
      idle: ['ニャ〜', { text: 'ニャ……（バケツのほうを見て舌なめずり）', when: [anyDone(E(11), E(12)), notDone(E(14))] }],
    },
    tetsuo: {
      name: 'テツオ', x: 3200, y: 1995, wander: 30,
      look: { h: 150, hair: 'spiky', hairColor: '#222', shirt: '#fff', pants: '#e04a4a', acc: ['sunglasses'] },
      idle: [
        { text: '（ボートのほうを、ぼーっと見ている）', when: [notDone(E(8))] },
        { text: 'あの子、さっきから本ばっかり読んでる……', when: [notDone(E(8))] },
        { text: 'ガボガボ……だ、だれか……！', when: [done(E(8)), noneDone(E(9), E(10))] },
        { text: 'あれ……ぼくの海パン、どこいった……？', when: [anyDone(E(9), E(10)), notDone(E(74))] },
      ],
    },
    sayuri: {
      name: 'サユリ', x: 3330, y: 2190, wander: 0,
      look: { h: 150, hair: 'long', hairColor: '#1a1a1a', shirt: '#fff7c0', pants: '#5a7ab0', acc: ['ribbon'], sit: true },
      idle: ['……（ページをめくる音）', '岸の人、さっきからずっとこっち見てる', { text: '落ちたの、あなた？ ……前見なさいよね', when: [done(E(8)), noneDone(E(9), E(10))] }],
    },
    isao: {
      name: 'イサオ', x: 5200, y: 1980, wander: 40,
      look: { h: 162, hair: 'short', hairColor: '#222', shirt: '#c04040', pants: '#333', acc: ['tie'] },
      idle: [
        { text: 'もう知らん！ 頭にきた！ カッカする！', when: [notDone(E(59))] },
        { text: '……ちょっと冷えたけど、まだ顔がほてってる', when: [done(E(59)), notDone(E(69))] },
      ],
    },
    isaowife: {
      name: 'イサオの妻', x: 5050, y: 1965, wander: 30,
      look: { h: 152, hair: 'bob', hairColor: '#6a3a1a', shirt: '#7ac0a0', pants: '#555', acc: ['hat'], hatColor: '#fff' },
      idle: ['あの人、すぐ熱くなるんだから。少し冷ませばいいのよ', 'テントの張り方くらいで怒らなくても……'],
    },
    // ── 中央奥：ハンモックと見晴らし台 ──
    midori: {
      name: 'ミドリ', x: 3150, y: 1460, wander: 60,
      look: { h: 152, hair: 'long', hairColor: '#8a5a2a', shirt: '#f6c6d6', pants: '#fff', skirt: true, acc: ['hat', 'flower'], hatColor: '#f4e2a0' },
      idle: ['歩きつかれちゃった。ゆらゆら揺られたいな〜', 'この麦わら帽子、お気に入りなの'],
    },
    yanagi: {
      name: 'ヤナギ', x: 3360, y: 1490, wander: 40,
      look: { h: 175, hair: 'bob', hairColor: '#333', shirt: '#ddd', pants: '#7a7a7a', acc: ['glasses'] },
      idle: ['ミドリちゃんのために、何かいいとこ見せたい……', { text: 'ミドリちゃんの帽子が……川に……ぼくの出番か！？', when: [done(E(55)), notDone(E(56))] }],
    },
    climber: {
      name: '登山家', x: 4720, y: 990, wander: 40,
      look: { h: 165, hair: 'short', hairColor: '#6a4a2a', shirt: '#e05a2a', pants: '#3a4a3a', acc: ['bag', 'beard', 'cap'], hatColor: '#2a5a8a' },
      idle: [
        { text: '山を見たら、あいさつしたくなる性分でね', when: [notDone(E(57))] },
        { text: 'こっちの山は返事なし。……向こうの山なら、どうかな', when: [done(E(57)), notDone(E(58))] },
        { text: '山がけむりで返事するなんて、はじめてだ！', when: [done(E(58))] },
      ],
    },
    // ── 中央右：BBQ エリア ──
    gou: {
      name: 'ゴウ', x: 5250, y: 1770, wander: 40,
      look: kidLook('#5ab0e0', { h: 118, hair: 'short' }),
      idle: [{ text: 'お肉、あぶらっこくてキライ……野菜のほうがいい', when: [notDone(E(63))] }, 'BBQって、なんで肉ばっかりなの'],
    },
    nanami: {
      name: 'ナナミ', x: 5440, y: 1770, wander: 40,
      look: kidLook('#f2b0c0', { h: 116, hair: 'pony', hairColor: '#4a2a1a', skirt: true }),
      idle: [{ text: 'ピーマンもにんじんもキライ！ お肉だけ食べたい', when: [notDone(E(62))] }, { text: 'だれかとこっそり交換できないかなあ', when: [notDone(E(63))] }],
    },
    gonbe: {
      name: 'ゴンベエ', x: 5860, y: 1720, wander: 30,
      look: { h: 158, wide: true, hair: 'topknot', hairColor: '#222', shirt: '#9ad06a', pants: '#5a4a3a', sit: true },
      idle: [
        { text: 'ポップコーン、ひとりじめ〜。鳥にはあげないよ', when: [notDone(E(41))] },
        { text: 'おなかすいた……もう森にあるものでもいい……', when: [done(E(41))] },
        { text: '森の奥に、しましまのおいしそうなのがあるって聞いたけど……', when: [done(E(41)), notDone(E(45))] },
      ],
    },
    birds: {
      name: 'スズメたち', emoji: '🐦', size: 40, x: 5750, y: 1480, wander: 200, speed: 110,
      idle: ['チュン！', { text: 'チュンチュン（何かおいしいもの、落ちてないかな）', when: [notDone(E(41))] }],
    },
    dog: { name: 'キャンプ犬', emoji: '🐕', size: 64, x: 4900, y: 1560, wander: 260, speed: 90, idle: ['ワン！', 'ワフ（しっぽふりふり）'] },
    // ── 管理棟まわり ──
    kanri: {
      name: '管理人', x: 6760, y: 1690, wander: 0,
      look: { h: 160, hair: 'short', hairColor: '#333', shirt: '#4f7a3a', pants: '#3a3a2a', acc: ['cap'], hatColor: '#4f7a3a', sit: true },
      idle: [
        { text: 'ここに座ってりゃ、サルも寄ってこない。……ふぁ〜あ', when: [noneDone(E(36), E(37))] },
        { text: '仕事はサル番。サル番という名の昼寝だ', when: [noneDone(E(36), E(37))] },
        { text: 'まさか今日、本社から視察が来るなんて……', when: [anyDone(E(36), E(37))] },
      ],
    },
    bucho: {
      name: '本社の部長', x: 6250, y: 1480, path: [[6150, 1470], [5650, 1600], [6000, 1700], [6450, 1480]], speed: 45,
      look: { h: 166, hair: 'short', hairColor: '#aaa', shirt: '#2a3a5a', pants: '#2a3a5a', acc: ['tie', 'glasses', 'mustache'] },
      idle: [
        { text: 'ここの管理人は、どこでなにをしておるのかね', when: [noneDone(E(36), E(37))] },
        { text: 'わしの顔を見せれば、すぐ飛んでくるはずなんだがね', when: [noneDone(E(36), E(37))] },
        '抜き打ち視察だ。だれにも言うなよ',
      ],
    },
    yoshio: {
      name: 'ヨシオ', x: 6900, y: 1730, wander: 0,
      look: { h: 150, hair: 'short', hairColor: '#5a3a1a', shirt: '#f2e2b0', pants: '#6a6a9a', acc: ['glasses'], sit: true },
      idle: [
        { text: 'バナナと団子、どっちから食べようかなあ', when: [notDone(E(38))] },
        { text: '管理人さんがいるから、サルに取られる心配もないし', when: [noneDone(E(36), E(37))] },
        { text: 'バナナ全部もってかれた……残ったのはこの団子だけ……', when: [done(E(38))] },
        { text: 'みんなの晩ごはんができたら、団子でかんぱいしたいなあ', when: [notDone(E(6))] },
        { text: 'クマが出たって？ 落ちついて団子も食べられないよ', when: [done(E(23)), noneDone(...BEAR_END)] },
        { text: '空、ゴロゴロいってない……？', when: [{ timeRemainingAtMostMs: 90000 }] },
      ],
    },
    monkey: {
      name: 'サル', emoji: '🐒', size: 64, x: 6600, y: 1180, wander: 90, speed: 110,
      idle: [
        { text: 'キッ……（管理人をにらんでいる）', when: [noneDone(E(36), E(37))] },
        { text: 'キキッ！（黄色いのが、ほしい）', when: [notDone(E(38))] },
        { text: 'キキ〜♪（ごきげん）', when: [done(E(38))] },
      ],
    },
    harada: {
      name: 'ハラダ', x: 6000, y: 1620, wander: 140, speed: 75,
      look: { h: 160, hair: 'short', hairColor: '#444', shirt: '#b0c4de', pants: '#4a4a4a', acc: ['glasses'] },
      idle: [
        { text: 'う……おなかが……ギュルルル', when: [notDone(E(61))] },
        { text: '生水、飲むんじゃなかった……どこか個室は……', when: [notDone(E(61))] },
        { text: 'か、紙がない！ 何かやわらかいものを……！', when: [done(E(61)), noneDone(E(66), E(68))] },
      ],
    },
    frog: { name: 'カエル', emoji: '🐸', size: 32, x: 6300, y: 2015, wander: 60, speed: 50, idle: ['ケロ'] },
    // ── 右の森：クマ・バードウォッチング ──
    bear: {
      name: 'クマ', emoji: '🐻', size: 120, x: 7980, y: 1640, wander: 80, speed: 70, hidden: true,
      idle: ['グルル……', { text: 'グゥ〜（おなかの音）', when: [noneDone(...BEAR_END)] }],
    },
    takuma: {
      name: 'タクマ', x: 7180, y: 1150, wander: 10,
      look: { h: 168, hair: 'short', hairColor: '#4a2a1a', shirt: '#2a8a8a', pants: '#e8e0c8' },
      idle: ['ふたりきりの森ランチ、いいでしょ', 'この木にハート彫ったの、ぼくらじゃないよ'],
    },
    mio: {
      name: 'ミオ', x: 7320, y: 1150, wander: 10,
      look: { h: 155, hair: 'long', hairColor: '#c08040', shirt: '#f9e0a0', pants: '#fff', skirt: true, acc: ['flower'] },
      idle: ['サンドイッチ、作ってきたの', '……だれかに見られてる気がする'],
    },
    birder: {
      name: 'バードウォッチャー', x: 8080, y: 1170, wander: 60,
      look: { h: 160, hair: 'short', hairColor: '#777', shirt: '#7a8a5a', pants: '#5a5040', acc: ['camera', 'glasses'] },
      idle: [
        { text: '珍しい鳥はいないかね……何でもいい、記録したい', when: [notDone(E(52))] },
        { text: '帽子を岩に置いたまま……中におやつを入れてたっけ', when: [notDone(E(39))] },
        { text: '帽子が木の上に……鳥なら取れるだろうになあ', when: [done(E(39)), notDone(E(40))] },
        { text: '妻はロープウェイで山頂カフェに行くと言っておったが……', when: [notDone(E(52))] },
      ],
    },
    bluebird: { name: '青い鳥', emoji: '🐦', size: 34, x: 8260, y: 960, wander: 50, speed: 60, minZoom: 1.2, idle: ['ピピッ', 'ピルル〜'] },
    peacock: { name: '派手な鳥', emoji: '🦚', size: 70, x: 8700, y: 1180, wander: 60, speed: 40, idle: ['ケーン！'] },
    brownbird: { name: '茶色い鳥', emoji: '🦉', size: 40, x: 7620, y: 980, wander: 20, speed: 30, idle: ['ホー……'] },
    sumo: {
      name: '力士', x: 8430, y: 1240, wander: 30, hidden: true,
      look: { h: 170, wide: true, muscle: true, hair: 'topknot', hairColor: '#111', shirt: '#f2c9a0', pants: '#2a2a6a', costume: null },
      idle: ['ドスコイ！ 木を相手に稽古でごわす', '山ごもりの最中でごわす'],
    },
    deer: { name: 'シカ', emoji: '🦌', size: 80, x: 1550, y: 1140, wander: 160, speed: 50, idle: ['……（じっとこちらを見ている）'] },
    // ── 下流 ──
    maruo: {
      name: 'マルオ', x: 7300, y: 1970, wander: 50,
      look: { h: 158, wide: true, hair: 'short', hairColor: '#222', shirt: '#f2924a', pants: '#3a5a3a', acc: ['cap'], hatColor: '#fff' },
      idle: [
        { text: '甘い缶詰が食べたいなあ。クーラーにあったはず', when: [notDone(E(64))] },
        { text: 'ジュース、川の水でキンキンに冷やしてあるんだ', when: [notDone(E(65))] },
        { text: 'ジュース流された……もう下流のほうまで行っちゃったかな', when: [done(E(65)), notDone(E(72))] },
      ],
    },
    coco: {
      name: 'ココ', x: 7160, y: 1990, wander: 40,
      look: kidLook('#f6d0e0', { h: 100, hair: 'twin', hairColor: '#5a2a1a', skirt: true, acc: ['ribbon'] }),
      idle: [{ text: 'パパ〜、のどかわいた〜', when: [notDone(E(72))] }, { text: 'からっぽのビン、きれい。なにか入れたいな', when: [done(E(72))] }],
    },
    tamotsu: {
      name: 'タモツ', x: 8450, y: 2025, wander: 70,
      look: kidLook('#c0e070', { acc: ['hat'], hatColor: '#f2e2a0' }),
      idle: [
        'ザリガニ〜、出てこ〜い',
        '下流ってね、いろんなものが流れてくるんだよ',
        { text: 'ジュースひろった。だれのだろ', when: [done(E(71)), notDone(E(72))] },
        { text: 'じっと見てると、目がぐるぐるする模様ってあるよね', when: [notDone(E(75))] },
      ],
    },
    duck: { name: 'カモ', emoji: '🦆', size: 44, x: 6500, y: 2200, wander: 300, speed: 40, idle: ['グワッ'] },
    // ── 左端：旅人 ──
    kakeru: {
      name: '旅人カケル', x: 650, y: 1580, wander: 40, speed: 90,
      look: { h: 168, hair: 'long', hairColor: '#4a3a2a', shirt: '#6a8ad0', pants: '#7a6a4a', acc: ['bag', 'hat'], hatColor: '#8a6a3a' },
      idle: [
        { text: '旅のルールはひとつ。看板を信じること', when: [notDone(E(53))] },
        { text: '道がわからないなあ。どっちへ行けば……', when: [notDone(E(53))] },
        { text: 'ここまで来たけど……次の看板はどこだ？', when: [done(E(53)), notDone(E(54))] },
      ],
    },
  },
  objects: {
    // 晩ごはん系
    stone: { name: '川辺の平たい石', emoji: '🪨', size: 46, x: 4760, y: 2020 },
    kamado: { name: 'かまど', emoji: '🧱', size: 54, x: 4330, y: 1690, hidden: true, capturable: false },
    woodpile: { name: '薪の山', emoji: '🪵', size: 34, x: 4400, y: 1700, hidden: true, capturable: false },
    wood_up: { name: '上流の流木', emoji: '🪵', size: 44, x: 420, y: 2010 },
    wood_down: { name: '下流の流木', emoji: '🪵', size: 44, x: 8820, y: 2015 },
    curry: { name: 'カレー粉', emoji: '🍛', size: 34, x: 6420, y: 1430, minZoom: 1.1 },
    spice: { name: 'テント前の調味料', emoji: '🧂', size: 34, x: 3950, y: 1520 },
    river: { name: '川', emoji: '🌊', size: 90, x: 4500, y: 2210 },
    phone: { name: 'ノブヒコの母のスマホ', emoji: '📱', size: 26, x: 2420, y: 1640, minZoom: 1.2 },
    // 釣り
    float: { name: '動く浮き', emoji: '🔴', size: 22, x: 1960, y: 2140, minZoom: 1.1 },
    fishbucket: { name: '魚入りバケツ', emoji: '🪣', size: 40, x: 1740, y: 2015, hidden: true },
    // 虫とり・かくれんぼ
    beetle: { name: 'カブトムシ', emoji: '🪲', size: 34, x: 2130, y: 1060, minZoom: 1.1 },
    kanabun: { name: 'カナブン', emoji: '🪲', size: 22, x: 2560, y: 1110, minZoom: 1.4, rot: 0.6 },
    antnest: { name: 'アリの巣', emoji: '🐜', size: 26, x: 3380, y: 1270, minZoom: 1.3 },
    movetree: { name: 'ちょっと動く木', emoji: '🌲', size: 150, x: 5600, y: 1180 },
    hearttree: { name: '木の裏のハート', emoji: '💘', size: 30, x: 7250, y: 1090, minZoom: 1.2 },
    shaketree: { name: 'ゆれる木', emoji: '🌳', size: 170, x: 8360, y: 1230 },
    tent_l: { name: '左のテント', emoji: '⛺', size: 170, x: 2650, y: 1520 },
    tent_c: { name: '真ん中のテント', emoji: '⛺', size: 180, x: 4050, y: 1500 },
    tent_r: { name: '右のテント', emoji: '⛺', size: 170, x: 7980, y: 1580 },
    lunch: { name: 'カップルのお弁当', emoji: '🧺', size: 36, x: 7260, y: 1170 },
    nuts: { name: '木の実', emoji: '🌰', size: 28, x: 3660, y: 1250, minZoom: 1.2 },
    // 俳句の題材
    sky: { name: '夏の空', emoji: '🌤️', size: 130, x: 5800, y: 330 },
    smoke: { name: '山の煙', emoji: '🌫️', size: 140, x: 7620, y: 400, hidden: true },
    bbqmeat: { name: 'BBQの肉', emoji: '🍖', size: 36, x: 5360, y: 1640 },
    ufo: { name: 'UFO', emoji: '🛸', size: 46, x: 3000, y: 200, minZoom: 1.1 },
    haikunote: { name: '俳句ノート', emoji: '📓', size: 30, x: 4680, y: 1590, minZoom: 1.1 },
    // 管理棟・サル
    banana: { name: 'ヨシオのバナナ', emoji: '🍌', size: 38, x: 6990, y: 1740 },
    dango: { name: '団子', emoji: '🍡', size: 36, x: 6840, y: 1750 },
    bwhat: { name: 'おやつ入りの帽子', emoji: '👒', size: 38, x: 8170, y: 1200 },
    treehat: { name: '木に引っかかった帽子', emoji: '👒', size: 34, x: 8200, y: 980, hidden: true, rot: 0.5 },
    gang: { name: 'バナナ軍団', emoji: '🐒', size: 80, x: 6420, y: 1270, hidden: true },
    gang2: { name: 'バナナ軍団の子分', emoji: '🐒', size: 56, x: 6320, y: 1250, hidden: true, capturable: false },
    gang3: { name: 'バナナ軍団の宝', emoji: '🍌', size: 44, x: 6520, y: 1265, hidden: true, capturable: false },
    // はらぺこ
    popcorn: { name: 'こぼれたポップコーン', emoji: '🍿', size: 36, x: 5920, y: 1735 },
    mushroom: { name: 'ふつうのキノコ', emoji: '🍄', size: 30, x: 6080, y: 1270, minZoom: 1.1 },
    watermelon: { name: 'スイカ', emoji: '🍉', size: 44, x: 5560, y: 1820 },
    stripeshroom: { name: '縞模様のキノコ', emoji: '🍄', size: 40, x: 8840, y: 1280, minZoom: 1.4, rot: -0.4 },
    // 鳥と山
    gondola: { name: 'ロープウェイのゴンドラ', emoji: '🚡', size: 60, x: 1020, y: 1000 },
    lostman: { name: '煙の山の人影', emoji: '🧍', size: 30, x: 7700, y: 610, hidden: true, minZoom: 1.5 },
    farmtn: { name: '遠くの山', emoji: '🏔️', size: 300, x: 1500, y: 760, layer: -2 },
    volcano: { name: 'ケムリ山', emoji: '🌋', size: 320, x: 7620, y: 780, layer: -2 },
    // 看板・ハンモック・川
    sign_a: { name: '「あっち」の看板', sign: { text: 'あっち →', fill: '#f4ecd8', color: '#5a4630', s: 26 }, w: 150, h: 70, x: 900, y: 1530 },
    sign_k: { name: '「こっち」の看板', sign: { text: '← こっち', fill: '#f4ecd8', color: '#5a4630', s: 26 }, w: 150, h: 70, x: 7150, y: 1530 },
    hammock: { name: 'ハンモック', sign: { text: '', fill: '#e07a5f', color: '#fff' }, w: 220, h: 24, x: 3200, y: 1400 },
    riverhat: { name: '川に浮く麦わら帽子', emoji: '👒', size: 36, x: 3220, y: 2160, hidden: true },
    // トイレ
    toilet: { name: 'トイレ小屋', sign: { text: 'WC', fill: '#8ec5e6', color: '#1d4a6a', s: 34 }, w: 120, h: 170, x: 7480, y: 1470 },
    leaftree: { name: '葉っぱのしげった木', emoji: '🌳', size: 130, x: 7650, y: 1460 },
    // 下流
    can: { name: 'アスパラ缶', emoji: '🥫', size: 30, x: 7250, y: 1935, minZoom: 1.1 },
    juice: { name: '川で冷やしたジュース', emoji: '🧃', size: 30, x: 7380, y: 2085 },
    floatjuice: { name: '流れるジュース', emoji: '🧃', size: 30, x: 7380, y: 2110, hidden: true },
    tamojuice: { name: 'タモツが拾ったジュース', emoji: '🧃', size: 30, x: 8520, y: 2030, hidden: true },
    emptybottle: { name: 'ココの空き瓶', emoji: '🫙', size: 30, x: 7120, y: 2000, hidden: true },
    haikubottle: { name: '川下の瓶', emoji: '🍾', size: 34, x: 4560, y: 2150, hidden: true, rot: 1.2 },
    swimsuit: { name: '流された海パン', emoji: '🩲', size: 32, x: 3300, y: 2250, hidden: true },
    stump: { name: '切り株', sign: { text: '◎', fill: '#b0804a', color: '#6b4423', s: 40 }, w: 100, h: 44, x: 8700, y: 1960 },
    // ダミー（撮れるけど何も起きない物）
    lantern: { name: 'ランタン', emoji: '🏮', size: 40, x: 4140, y: 1570 },
    axe: { name: '手斧', emoji: '🪓', size: 34, x: 4520, y: 1700, minZoom: 1.1 },
    cooler: { name: 'クーラーボックス', emoji: '🧊', size: 40, x: 2950, y: 1760 },
    flashlight: { name: '懐中電灯', emoji: '🔦', size: 30, x: 2720, y: 1660 },
    guitar: { name: 'ギター', emoji: '🎸', size: 50, x: 5650, y: 1780 },
    frisbee: { name: 'フリスビー', emoji: '🥏', size: 34, x: 4950, y: 1860 },
    boots: { name: '長靴', emoji: '🥾', size: 34, x: 1950, y: 1990 },
    map: { name: 'キャンプ場の地図', emoji: '🗺️', size: 40, x: 1100, y: 1560 },
    kettle: { name: 'やかん', emoji: '🫖', size: 34, x: 4250, y: 1700 },
    chair: { name: 'アウトドアチェア', emoji: '🪑', size: 44, x: 6620, y: 1720 },
    firstaid: { name: '救急箱', emoji: '🧰', size: 36, x: 6200, y: 1430 },
    bike: { name: 'マウンテンバイク', emoji: '🚲', size: 60, x: 6720, y: 1470 },
    ball: { name: 'サッカーボール', emoji: '⚽', size: 34, x: 2200, y: 1820 },
    trash: { name: 'ゴミ箱', emoji: '🗑️', size: 40, x: 6020, y: 1440 },
    binoculars: { name: '双眼鏡の箱', emoji: '📦', size: 30, x: 7960, y: 1210 },
    snackbag: { name: 'お菓子袋', emoji: '🍬', size: 26, x: 3020, y: 1700, minZoom: 1.3 },
    beachball: { name: 'ビーチボール', emoji: '🏐', size: 34, x: 7020, y: 1960 },
    radio: { name: 'ラジオ', emoji: '📻', size: 34, x: 2480, y: 1630, minZoom: 1.1 },
  },
  paths: {
    ufoFly: { points: [[4200, 140], [5600, 120], [6900, 250], [5200, 300], [3000, 200]], speed: 170 },
    ropeway: { points: [[1470, 520], [1020, 1000]], speed: 60 },
    treeShuffle: { points: [[5680, 1170], [5560, 1190], [5600, 1180]], speed: 30 },
    bob: { points: [[1966, 2146], [1960, 2140]], speed: 20 },
    bearWalk: { points: [[7700, 1450], [7400, 1300], [7900, 1250], [8300, 1450], [7980, 1640]], speed: 60, loop: true },
  },
  reactions: [
    { s: 'dango', t: 'yoshio', say: '団子は晩ごはんのあとのデザート。……まだごはんの支度、終わってないみたいだし', when: [notDone(E(6))], anim: 'react.shrug' },
    { s: 'dango', t: 'yoshio', say: '先にバナナを食べなきゃ。団子はとっておき', when: [notDone(E(38))], anim: 'react.shrug' },
    { s: 'dango', t: 'yoshio', say: 'クマがうろついてるのに、のんきに団子なんて……', when: [noneDone(...BEAR_END)], anim: 'react.scared' },
    { s: 'curry', t: 'mama', say: 'まだ火もおこせてないのに、味の話は早いわよ', when: [{ not: { allEventsDone: [E(2), E(3)] } }], anim: 'react.shrug' },
    { s: 'spice', t: 'mama', say: 'まずは火をおこさないとねえ', when: [{ not: { allEventsDone: [E(2), E(3)] } }], anim: 'react.shrug' },
    { s: 'river', t: 'mama', say: 'まだ洗うものがないわよ。料理が先！', when: [noneDone(E(4), E(5))], anim: 'react.shrug' },
    { s: 'wood_up', t: 'papa', say: '薪ひろいはマキオの係だぞ。……その前にかまどだがな', anim: 'react.shrug' },
    { s: 'wood_up', t: 'makio', say: 'かまどができてからでいいって、父ちゃんが', when: [notDone(E(1))], anim: 'react.shrug' },
    { s: 'wood_down', t: 'makio', say: 'かまどができてからでいいって、父ちゃんが', when: [notDone(E(1))], anim: 'react.shrug' },
    { s: 'banana', t: 'monkey', say: 'キ……（管理人のほうをチラチラ見ている）', when: [noneDone(E(36), E(37))], anim: 'react.scared' },
    { s: 'movetree', t: 'haru', say: 'あの木、なんか気になる……でもまだ鬼をやる気分じゃないの', when: [{ not: { allEventsDone: [E(15), E(18)] } }], anim: 'react.think' },
    { s: 'volcano', t: 'climber', say: 'まずは、いちばん近くにそびえるあの山にあいさつしないとな', when: [notDone(E(57))], anim: 'react.shrug' },
    { s: 'stripeshroom', t: 'gonbe', say: 'キノコ？ ぼくにはポップコーンがあるもんね', when: [notDone(E(41))], anim: 'react.shrug' },
    { s: 'bear', t: 'dog', say: 'キャイン！（しっぽを巻いた）', anim: 'react.scared' },
  ],
  timeline: [
    { every: 34000, start: 3000, effects: [{ type: 'OBJECT_MOVE', objectId: 'ufo', pathId: 'ufoFly' }] },
    { every: 22000, start: 1000, effects: [{ type: 'OBJECT_MOVE', objectId: 'gondola', pathId: 'ropeway' }] },
    { every: 5000, start: 500, effects: [{ type: 'OBJECT_MOVE', objectId: 'float', pathId: 'bob' }] },
    { every: 15000, start: 4000, when: [noneDone(E(19), E(22))], effects: [{ type: 'OBJECT_MOVE', objectId: 'movetree', pathId: 'treeShuffle' }] },
    { every: 2600, start: 800, when: [notDone(E(23))], effects: [
      { type: 'OBJECT_APPEARANCE', objectId: 'tent_r', look: { rot: 0.06 } },
      { type: 'OBJECT_APPEARANCE', objectId: 'tent_r', look: { rot: -0.06 }, delayMs: 300 },
      { type: 'OBJECT_APPEARANCE', objectId: 'tent_r', look: { rot: 0 }, delayMs: 600 },
    ] },
    { every: 3200, start: 1500, when: [notDone(E(21))], effects: [
      { type: 'OBJECT_APPEARANCE', objectId: 'shaketree', look: { rot: 0.08 } },
      { type: 'OBJECT_APPEARANCE', objectId: 'shaketree', look: { rot: -0.05 }, delayMs: 250 },
      { type: 'OBJECT_APPEARANCE', objectId: 'shaketree', look: { rot: 0 }, delayMs: 500 },
    ] },
    { at: 250000, effects: [{ type: 'ACTOR_SPEECH', actorId: 'jiisan', text: 'ふむ……ケムリ山の向こうに、黒い雲じゃ' }, { type: 'ACTOR_SPEECH', actorId: 'angler', text: '風が変わったな。ひと雨くるぞ', delayMs: 1500 }] },
    { at: 320000, effects: [{ type: 'PLAY_SOUND', soundId: 'thunder' }, { type: 'ACTOR_SPEECH', actorId: 'yoshio', text: 'い、いまの……カミナリ！？' }, { type: 'ACTOR_SPEECH', actorId: 'papa', text: 'まずいな、急がないと', delayMs: 1200 }] },
  ],
  events: [
    // ── 晩ごはんの支度（E01–E07） ──
    { id: E(1), s: 'stone', t: 'papa', cat: 'PROGRESSION', title: '父、川の石でかまどを組む', say: 'これだ、この平たさ！ よし、かまど作るぞ！', anim: 'react.happy', route: 'S3.route.cook',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'papa', to: [4740, 2010], speed: 200 }, { type: 'HIDE_OBJECT', objectId: 'stone', delayMs: 3000 }, { type: 'ACTOR_MOVE', actorId: 'papa', to: [4280, 1680], speed: 160, delayMs: 3100, wander: 60 },
        { type: 'SPAWN_OBJECT', objectId: 'kamado', delayMs: 5600 }, { type: 'FX', kind: 'sparkle', at: 'kamado', delayMs: 5700 }],
      after: [{ actor: 'papa', text: 'かまど完成！ ……で、燃やすものがないな。マキオー！', delay: 6400 }, { actor: 'makio', text: 'えー、また薪係？', delay: 8200 }] },
    { id: E(2), s: 'wood_up', t: 'makio', cat: 'PROGRESSION', requires: [E(1)], title: 'マキオ、上流で薪を拾う', say: '上流の流木、乾いててよく燃えそう！ 取ってくる！', anim: 'react.run', route: 'S3.route.cook',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'makio', to: [460, 1990], speed: 320 }, { type: 'HIDE_OBJECT', objectId: 'wood_up', delayMs: 12000 }, { type: 'ACTOR_MOVE', actorId: 'makio', to: [4400, 1720], speed: 320, delayMs: 12200, wander: 80 },
        { type: 'SPAWN_OBJECT', objectId: 'woodpile', delayMs: 24000 }],
      after: [{ actor: 'makio', text: 'でもこれだけじゃ足りないなあ……', delay: 12600 }] },
    { id: E(3), s: 'wood_down', t: 'makio', cat: 'PROGRESSION', requires: [E(1)], title: 'マキオ、下流で薪を拾う', say: '下流にもでっかい流木！ ダッシュ！', anim: 'react.run', route: 'S3.route.cook',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'makio', to: [8780, 2000], speed: 320 }, { type: 'HIDE_OBJECT', objectId: 'wood_down', delayMs: 15600 }, { type: 'ACTOR_MOVE', actorId: 'makio', to: [4400, 1720], speed: 320, delayMs: 15800, wander: 80 },
        { type: 'SPAWN_OBJECT', objectId: 'woodpile', delayMs: 29600 }, { type: 'OBJECT_APPEARANCE', objectId: 'woodpile', look: { size: 48 }, delayMs: 29600 }],
      after: [{ actor: 'mama', text: 'あら、薪が集まってきたわね', delay: 30000 }] },
    { id: E(4), s: 'curry', t: 'mama', cat: 'BRANCH', group: 'S3-MENU', requires: [E(2), E(3)], title: '今夜はカレーに決定', say: 'カレー粉！ キャンプといえば、やっぱりカレーよね！', anim: 'react.happy', route: 'S3.route.cook',
      fx: [{ type: 'SET_FLAG', id: 'menu', value: 'curry' }, { type: 'SPAWN_OBJECT', objectId: 'kamado' }, { type: 'FX', kind: 'fire', at: 'kamado', delayMs: 600 }, { type: 'FX', kind: 'steam', at: 'kamado', delayMs: 1800 }, { type: 'ACTOR_SET_STATE', actorId: 'mama', state: 'HAPPY' }],
      after: [{ actor: 'mama', text: 'ルーはあるけど、お肉がちょっと心細いわねえ。それにお皿も汚れたまま……', delay: 3200 }] },
    { id: E(5), s: 'spice', t: 'mama', cat: 'BRANCH', group: 'S3-MENU', requires: [E(2), E(3)], title: '今夜は焼きそばに変更', say: '……決めた！ 予定変更、焼きそばにしましょ！ ソースの香り〜', anim: 'react.think', route: 'S3.route.cook',
      fx: [{ type: 'SET_FLAG', id: 'menu', value: 'yakisoba' }, { type: 'SPAWN_OBJECT', objectId: 'kamado' }, { type: 'FX', kind: 'fire', at: 'kamado', delayMs: 600 }, { type: 'FX', kind: 'smoke', at: 'kamado', delayMs: 1800 }, { type: 'ACTOR_SPEECH', actorId: 'papa', text: 'カレーじゃないのか……まあいいか', delayMs: 2600 }],
      after: [{ actor: 'mama', text: 'さて、お皿が汚れたままなのよねえ……', delay: 4200 }] },
    { id: E(6), s: 'river', t: 'mama', cat: 'PROGRESSION', cond: [anyDone(E(4), E(5))], title: '母、川で食器を洗う', say: 'お皿は川でジャブジャブっと！ ……はーい、ごはんできたわよー！', anim: 'react.happy', route: 'S3.route.cook',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'mama', to: [4520, 2010], speed: 200 }, { type: 'FX', kind: 'splash', at: 'river', delayMs: 1800 }, { type: 'PLAY_SOUND', soundId: 'splash', delayMs: 1800 },
        { type: 'ACTOR_MOVE', actorId: 'mama', to: [4450, 1660], speed: 160, delayMs: 3400, wander: 40 }, { type: 'SET_FLAG', id: 'dinner.ready', value: true }, { type: 'PLAY_SOUND', soundId: 'bell', delayMs: 5600 }],
      after: [{ actor: 'papa', text: 'よーし、晩メシだ！ みんなに声かけてこい！', delay: 5800 }, { actor: 'yoshio', text: 'あ、向こうでごはんの合図……いいなあ', delay: 6500 }] },
    { id: E(7), s: 'phone', t: 'nobu', cat: 'FLAVOR', requires: [E(4)], blocksIfCompleted: [E(5)], title: 'ノブヒコ、肉の追加を電話で頼む', say: '母ちゃんのスマホ借りよっと。……もしもし父ちゃん？ 肉！ 肉たくさん買ってきて！ お隣カレーだから！', anim: 'react.happy', route: 'S3.route.cook',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'nobumom', text: 'ちょっと！ 母さんのスマホ勝手に……まあいいけど', delayMs: 2600 }, { type: 'SET_FLAG', id: 'meat.ordered', value: true }],
      after: [{ actor: 'mama', text: 'え、お肉を届けてくれるの？ 助かるわ〜', delay: 5200 }] },

    // ── ボートと川のさわぎ（E08–E10） ──
    { id: E(8), s: 'sayuri', t: 'tetsuo', cat: 'CHAIN', title: 'テツオ、見とれて川に落ちる', say: 'ボートの上で本を読む横顔……きれいだ……あっ', anim: 'react.love', route: 'S3.route.river',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'tetsuo', to: [3220, 2150], speed: 160, delayMs: 600, wander: 0 }, { type: 'FX', kind: 'splash', at: 'tetsuo', delayMs: 1600 }, { type: 'PLAY_SOUND', soundId: 'splash', delayMs: 1600 },
        { type: 'ACTOR_SET_STATE', actorId: 'tetsuo', state: 'SCARED', delayMs: 1600 }, { type: 'ACTOR_SPEECH', actorId: 'tetsuo', text: 'ガボッ！ あ、足つかない！ だれかー！', delayMs: 2200 }],
      after: [{ actor: 'sayuri', text: '……なんか落ちた音がしたけど', delay: 4000 }, { actor: 'angler', text: '上流から悲鳴が聞こえたような……', delay: 5200 }] },
    { id: E(9), s: 'tetsuo', t: 'angler', cat: 'BRANCH', group: 'S3-RESCUE', requires: [E(8)], title: '釣り人、釣り針で救助', say: '人が溺れてる！？ まかせとけ、名人の遠投だ……それっ！', anim: 'react.sparkle', route: 'S3.route.river',
      fx: [{ type: 'FX', kind: 'splash', at: 'tetsuo', delayMs: 900 }, { type: 'ACTOR_MOVE', actorId: 'tetsuo', to: [2050, 2000], speed: 260, delayMs: 1200, wander: 20 }, { type: 'ACTOR_SET_STATE', actorId: 'tetsuo', state: 'EMBARRASSED', delayMs: 4500 },
        { type: 'SPAWN_OBJECT', objectId: 'swimsuit', delayMs: 1500 }, { type: 'OBJECT_MOVE', objectId: 'swimsuit', to: [8250, 2250], speed: 140, delayMs: 1600 }],
      after: [{ actor: 'tetsuo', text: 'た、たすかった……あれ？ 海パンは……？', delay: 5200 }, { actor: 'angler', text: '今日いちばんの大物だな、こりゃ', delay: 6600 }] },
    { id: E(10), s: 'tetsuo', t: 'sayuri', cat: 'BRANCH', group: 'S3-RESCUE', requires: [E(8)], title: 'サユリ、オールを差しだす', say: '……はい、オール。つかまって。前見て歩きなさいよね', anim: 'react.shrug', route: 'S3.route.river',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'tetsuo', to: [3200, 1995], speed: 120, delayMs: 1200, wander: 20 }, { type: 'ACTOR_SET_STATE', actorId: 'tetsuo', state: 'EMBARRASSED', delayMs: 3000 }, { type: 'FX', kind: 'hearts', at: 'tetsuo', delayMs: 3200 },
        { type: 'SPAWN_OBJECT', objectId: 'swimsuit', delayMs: 1500 }, { type: 'OBJECT_MOVE', objectId: 'swimsuit', to: [8250, 2250], speed: 140, delayMs: 1600 }],
      after: [{ actor: 'tetsuo', text: 'す、すみません……（好き）……あれ、海パンどこ？', delay: 4400 }] },

    // ── 釣り名人（E11–E14） ──
    { id: E(11), s: 'float', t: 'angler', cat: 'CHAIN', title: '釣り人、小魚を釣る', say: 'おっ、引いてる！ ……メダカか。ま、はじまりはこんなもんよ', anim: 'react.happy', route: 'S3.route.fish',
      fx: [{ type: 'FX', kind: 'splash', at: 'float' }, { type: 'SPAWN_OBJECT', objectId: 'fishbucket', delayMs: 1200 }],
      after: [{ actor: 'angler', text: 'ヌシがいるのは、この先の深みなんだがなあ', delay: 3200 }] },
    { id: E(12), s: 'float', t: 'angler', cat: 'CHAIN', requires: [E(11)], title: '釣り人、川のヌシを釣りあげる', say: 'この引き……ヌシだ！ うおおおっ、釣ったぞー！！', anim: 'react.sparkle', route: 'S3.route.fish',
      fx: [{ type: 'FX', kind: 'splash', at: 'float' }, { type: 'FX', kind: 'big', at: 'angler', delayMs: 800 }, { type: 'PLAY_SOUND', soundId: 'fanfare', delayMs: 800 }, { type: 'OBJECT_APPEARANCE', objectId: 'fishbucket', look: { emoji: '🐟', size: 56 }, delayMs: 1400 }],
      after: [{ actor: 'cat', text: 'ニャ……（じーっ）', delay: 3600 }] },
    { id: E(13), s: 'float', t: 'angler', cat: 'FLAVOR', requires: [E(12)], title: '釣り人、長靴を釣る', say: 'まだまだいけるぞ……おっ重い！ ……長靴かい！', anim: 'react.shrug', route: 'S3.route.fish',
      fx: [{ type: 'FX', kind: 'splash', at: 'float' }, { type: 'ACTOR_SPEECH', actorId: 'cat', text: 'ニャ（いらない）', delayMs: 2000 }] },
    { id: E(14), s: 'fishbucket', t: 'cat', cat: 'FLAVOR', cond: [anyDone(E(11), E(12))], title: 'ノラ猫、魚をくすねる', say: 'ニャッ！（くわえてダッシュ）', anim: 'react.run', route: 'S3.route.fish',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'cat', to: [1750, 2000], speed: 260 }, { type: 'OBJECT_APPEARANCE', objectId: 'fishbucket', look: { emoji: '🪣', size: 40 }, delayMs: 2200 }, { type: 'ACTOR_MOVE', actorId: 'cat', to: [2600, 1880], speed: 300, delayMs: 2400, wander: 200 },
        { type: 'ACTOR_SPEECH', actorId: 'angler', text: 'こらーっ！ おれの獲物ー！', delayMs: 2600 }] },

    // ── 虫とりとかくれんぼ（E15–E25） ──
    { id: E(15), s: 'beetle', t: 'riku', cat: 'PROGRESSION', title: 'リク、カブトムシをつかまえる', say: 'カブトムシだ！ 角でっけー！ ……よし、虫とり大会はぼくの優勝！', anim: 'react.sparkle', route: 'S3.route.bugs',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'riku', to: [2140, 1120], speed: 220 }, { type: 'HIDE_OBJECT', objectId: 'beetle', delayMs: 1800 }, { type: 'ACTOR_SET_STATE', actorId: 'riku', state: 'HAPPY', delayMs: 1800 }],
      after: [{ actor: 'riku', text: 'ハル〜、虫とり終わり！ かくれんぼの鬼やってよ！', delay: 3200 }] },
    { id: E(16), s: 'kanabun', t: 'riku', cat: 'FLAVOR', blocksIfCompleted: [E(15)], title: 'リク、カナブンでがまんしかける', say: 'カナブンかあ……キラキラしてるけど、角がないんだよなあ', anim: 'react.shrug', route: 'S3.route.bugs',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'riku', to: [2540, 1180], speed: 180 }] },
    { id: E(17), s: 'butterfly', t: 'riku', cat: 'FLAVOR', blocksIfCompleted: [E(15)], title: 'リク、チョウにまかれる', say: 'チョウチョだ、まてー！ ……あれ、どこ行った？', anim: 'react.run', route: 'S3.route.bugs',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'riku', to: [2800, 1150], speed: 240 }, { type: 'ACTOR_MOVE', actorId: 'butterfly', to: [3100, 960], speed: 140 }, { type: 'ACTOR_ANIMATION', actorId: 'riku', animationId: 'react.fall', delayMs: 2400 }] },
    { id: E(18), s: 'antnest', t: 'haru', cat: 'PROGRESSION', title: 'ハル、アリの巣を見つける', say: 'アリの行列、ここに帰ってたんだ！ ……ふう、満足した！', anim: 'react.happy', route: 'S3.route.bugs',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'haru', to: [3330, 1280], speed: 160 }, { type: 'ACTOR_SET_STATE', actorId: 'haru', state: 'HAPPY', delayMs: 1600 }],
      after: [{ actor: 'haru', text: 'さて、かくれんぼの鬼……はリクが虫とり終わってからか', delay: 3400 }] },
    { id: E(19), s: 'movetree', t: 'haru', cat: 'PROGRESSION', group: 'S3-FIND-BROS', requires: [E(15), E(18)], title: 'ハル、木に化けた兄弟を見つける', say: 'いまあの木、動いた！ ……ソラ、ウミ、みーつけた！', anim: 'react.surprised', route: 'S3.route.bugs',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'haru', to: [5480, 1220], speed: 300 }, { type: 'HIDE_OBJECT', objectId: 'movetree', delayMs: 2600 }, { type: 'FX', kind: 'leaves', at: 'movetree', delayMs: 2500 },
        { type: 'ACTOR_SHOW', actorId: 'sora', delayMs: 2600 }, { type: 'ACTOR_SHOW', actorId: 'umi', delayMs: 2600 }, { type: 'ACTOR_SPEECH', actorId: 'sora', text: 'ちぇっ、見つかったー！', delayMs: 3200 }],
      after: [{ actor: 'sora', text: 'かくれんぼは終わり！ 次はテント探検だ！', delay: 5600 }, { actor: 'umi', text: '右のテント、ずっとゴソゴソしてたよね', delay: 7200 }] },
    { id: E(20), s: 'hearttree', t: 'haru', cat: 'FLAVOR', requires: [E(15), E(18)], blocksIfCompleted: [E(19), E(22)], title: 'ハル、カップルの邪魔をする', say: 'ハートの木の裏にいるな！ みーつけ……あ、ちがう人だった', anim: 'react.embarrassed', route: 'S3.route.bugs',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'haru', to: [7200, 1220], speed: 320 }, { type: 'ACTOR_SPEECH', actorId: 'takuma', text: 'な、なんだい君は', delayMs: 12000 }, { type: 'ACTOR_SPEECH', actorId: 'mio', text: 'きゃっ、見られた……', delayMs: 13000 },
        { type: 'ACTOR_MOVE', actorId: 'haru', to: [3250, 1270], speed: 320, delayMs: 14000, wander: 80 }] },
    { id: E(21), s: 'shaketree', t: 'haru', cat: 'CHAIN', requires: [E(15), E(18)], blocksIfCompleted: [E(19), E(22)], title: 'ハル、木の陰の力士を見つける', say: 'あの木、ゆれてる！ そこだー！ ……え、おすもうさん？', anim: 'react.surprised', route: 'S3.route.bugs',
      fx: [{ type: 'OBJECT_APPEARANCE', objectId: 'shaketree', look: { rot: 0 } }, { type: 'ACTOR_SHOW', actorId: 'sumo', delayMs: 800 }, { type: 'FX', kind: 'leaves', at: 'shaketree', delayMs: 800 }, { type: 'ACTOR_SPEECH', actorId: 'sumo', text: 'ドスコイ！ 見つかったでごわすか。稽古中でごわす', delayMs: 1600 }],
      after: [{ actor: 'haru', text: 'ソラとウミじゃなかった……', delay: 4600 }] },
    { id: E(22), s: 'squirrel', t: 'haru', cat: 'CHAIN', group: 'S3-FIND-BROS', requires: [E(15), E(18)], title: 'ハル、リスを追って兄弟を見つける', say: 'リスだ、まてまて〜！ ……あっ、リスが逃げこんだ木から足が出てる！', anim: 'react.run', route: 'S3.route.bugs',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'squirrel', to: [5560, 1190], speed: 260 }, { type: 'ACTOR_MOVE', actorId: 'haru', to: [5480, 1220], speed: 260 }, { type: 'HIDE_OBJECT', objectId: 'movetree', delayMs: 3000 }, { type: 'FX', kind: 'leaves', at: 'movetree', delayMs: 2900 },
        { type: 'ACTOR_SHOW', actorId: 'sora', delayMs: 3000 }, { type: 'ACTOR_SHOW', actorId: 'umi', delayMs: 3000 }, { type: 'ACTOR_SPEECH', actorId: 'umi', text: 'リスのせいで見つかった〜！', delayMs: 3600 }],
      after: [{ actor: 'sora', text: 'しかたない、テント探検に変更だ！', delay: 5800 }] },
    { id: E(23), s: 'tent_r', t: 'sora', cat: 'PROGRESSION', cond: [anyDone(E(19), E(22))], title: '右のテントからクマが出る', say: 'ゴソゴソしてる右のテント、オープン！ ……ク、クマだーーっ！！', anim: 'react.scared', route: 'S3.route.bear',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'sora', to: [7880, 1640], speed: 340 }, { type: 'ACTOR_MOVE', actorId: 'umi', to: [7820, 1650], speed: 340 }, { type: 'OBJECT_APPEARANCE', objectId: 'tent_r', look: { rot: 0 } },
        { type: 'ACTOR_SHOW', actorId: 'bear', delayMs: 7400 }, { type: 'FX', kind: 'big', at: 'tent_r', delayMs: 7400 }, { type: 'PLAY_SOUND', soundId: 'roar', delayMs: 7500 }, { type: 'ACTOR_SPEECH', actorId: 'bear', text: 'グオオオォォ……', delayMs: 7800 },
        { type: 'ACTOR_MOVE', actorId: 'sora', to: [5300, 1560], speed: 360, delayMs: 8600, wander: 60 }, { type: 'ACTOR_MOVE', actorId: 'umi', to: [5240, 1570], speed: 360, delayMs: 8600, wander: 60 }, { type: 'ACTOR_MOVE', actorId: 'bear', pathId: 'bearWalk', delayMs: 10000 }],
      after: [{ actor: 'sora', text: 'クマが出たーっ！ 大人の人ーっ！', delay: 13000 }, { actor: 'hanae', text: 'ん？ いまクマって聞こえた？', delay: 15000 }] },
    { id: E(24), s: 'tent_l', t: 'sora', cat: 'FLAVOR', cond: [anyDone(E(19), E(22))], blocksIfCompleted: [E(23)], title: '左のテントにねぼすけ発見', say: '左のテント、オープン！ ……人が寝てる！', anim: 'react.surprised', route: 'S3.route.bugs',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'sora', to: [2700, 1590], speed: 340 }, { type: 'ACTOR_SHOW', actorId: 'sleeper', delayMs: 9000 }, { type: 'ACTOR_SPEECH', actorId: 'sleeper', text: 'むにゃ……もう朝？', delayMs: 9600 },
        { type: 'ACTOR_MOVE', actorId: 'sora', to: [5600, 1220], speed: 340, delayMs: 11000, wander: 60 }] },
    { id: E(25), s: 'tent_c', t: 'sora', cat: 'FLAVOR', cond: [anyDone(E(19), E(22))], blocksIfCompleted: [E(23)], title: '父の秘密のおやつが見つかる', say: '真ん中のテント、オープン！ ……わっ、お菓子の山！', anim: 'react.laugh', route: 'S3.route.bugs',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'sora', to: [4100, 1560], speed: 340 }, { type: 'FX', kind: 'confetti', at: 'tent_c', delayMs: 5000 }, { type: 'ACTOR_SPEECH', actorId: 'papa', text: 'こ、こら！ それは父さんの秘密のおやつだ！', delayMs: 5600 },
        { type: 'ACTOR_SPEECH', actorId: 'mama', text: 'あなた……ダイエット中じゃなかったの？', delayMs: 7400 }, { type: 'ACTOR_MOVE', actorId: 'sora', to: [5600, 1220], speed: 340, delayMs: 8000, wander: 60 }] },

    // ── クマの行方（E26–E31） ──
    { id: E(26), s: 'bear', t: 'papa', cat: 'BRANCH', group: 'S3-BEAR', requires: [E(23)], title: '一家そろって大脱走', say: 'ク、クマだと！？ みんな逃げろーっ！ ……あ、鍋は置いてけ！', anim: 'react.run', route: 'S3.route.bear',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'papa', to: [3500, 1800], speed: 320 }, { type: 'ACTOR_MOVE', actorId: 'mama', to: [3420, 1820], speed: 300, delayMs: 300 }, { type: 'ACTOR_MOVE', actorId: 'makio', to: [3360, 1760], speed: 340, delayMs: 200 },
        { type: 'ACTOR_SPEECH', actorId: 'jiisan', text: 'わしは座っとるぞい。逃げるのは若いもんにまかせる', delayMs: 1500 },
        { type: 'ACTOR_MOVE', actorId: 'bear', to: [8600, 1150], speed: 120, delayMs: 2000 }, { type: 'ACTOR_HIDE', actorId: 'bear', delayMs: 12000 },
        { type: 'ACTOR_MOVE', actorId: 'papa', to: [4250, 1670], speed: 140, delayMs: 9000, wander: 60 }, { type: 'ACTOR_MOVE', actorId: 'mama', to: [4450, 1650], speed: 140, delayMs: 9000, wander: 40 }, { type: 'ACTOR_MOVE', actorId: 'makio', to: [3900, 1620], speed: 140, delayMs: 9000, wander: 100 }],
      after: [{ actor: 'papa', text: '……なんだ、森に帰っていったか。おどかしやがって', delay: 11000 }] },
    { id: E(27), s: 'bear', t: 'mama', cat: 'BRANCH', group: 'S3-BEAR', requires: [E(23)], title: '母、死んだふりをする', say: 'クマに会ったら……死んだふり！ ……（パタッ）', anim: 'react.fall', route: 'S3.route.bear',
      fx: [{ type: 'ACTOR_SET_STATE', actorId: 'mama', state: 'SCARED' }, { type: 'ACTOR_SPEECH', actorId: 'papa', text: '母さん、それ写真だぞ……クマは森の向こうだ', delayMs: 2400 },
        { type: 'ACTOR_SPEECH', actorId: 'bear', text: 'フン……（つまらなそうに森へ帰っていく）', delayMs: 3200 }, { type: 'ACTOR_MOVE', actorId: 'bear', to: [8600, 1150], speed: 100, delayMs: 3600 }, { type: 'ACTOR_HIDE', actorId: 'bear', delayMs: 14000 },
        { type: 'ACTOR_SET_STATE', actorId: 'mama', state: 'IDLE', delayMs: 5000 }],
      after: [{ actor: 'mama', text: '……ほら、効いたでしょ？', delay: 6000 }] },
    { id: E(28), s: 'bear', t: 'hanae', cat: 'BRANCH', group: 'S3-BEAR', requires: [E(23)], title: 'ハナエ、なんでも投げてクマを撃退', say: 'クマぁ？ 上等じゃない！ 鍋！ フライパン！ ついでにおたま！', anim: 'react.angry', route: 'S3.route.bear',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'hanae', to: [7500, 1640], speed: 380 }, { type: 'FX', kind: 'stars', at: 'bear', delayMs: 12600 }, { type: 'PLAY_SOUND', soundId: 'crash', delayMs: 12600 }, { type: 'FX', kind: 'stars', at: 'bear', delayMs: 13400 },
        { type: 'ACTOR_SPEECH', actorId: 'bear', text: 'グエッ！？（一目散に逃げていく）', delayMs: 13800 }, { type: 'ACTOR_MOVE', actorId: 'bear', to: [8900, 1150], speed: 300, delayMs: 14000 }, { type: 'ACTOR_HIDE', actorId: 'bear', delayMs: 18000 },
        { type: 'ACTOR_MOVE', actorId: 'hanae', to: [2860, 1640], speed: 260, delayMs: 16500, wander: 60 }],
      after: [{ actor: 'hanae', text: 'ふん、二度と来るんじゃないわよ！', delay: 15000 }] },
    { id: E(29), s: 'bear', t: 'daikichi', cat: 'BRANCH', group: 'S3-BEAR', requires: [E(23)], title: 'ダイキチ、クマとおにぎりを分けあう', say: 'クマさん、おなかすいてるんだね。……ぼくのおにぎり、半分こしよう', anim: 'react.love', route: 'S3.route.bear',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'bear', to: [3080, 1730], speed: 260, wander: 0 }, { type: 'ACTOR_SET_STATE', actorId: 'bear', state: 'HAPPY', delayMs: 18000 }, { type: 'FX', kind: 'hearts', at: 'bear', delayMs: 19000 },
        { type: 'ACTOR_SPEECH', actorId: 'bear', text: 'モグモグ……グルル♪', delayMs: 19400 }, { type: 'ACTOR_SPEECH', actorId: 'hanae', text: 'あんた……クマと友だちになってどうすんのよ', delayMs: 21000 }] },
    { id: E(30), s: 'bear', t: 'jiisan', cat: 'FLAVOR', requires: [E(23)], blocksIfCompleted: BEAR_END, title: '祖父、クマで一句', say: '「テントから 熊も出てくる 夏の宵」……うむ、季語が重なっとるのう', anim: 'react.think', route: 'S3.route.haiku',
      fx: [{ type: 'FX', kind: 'notes', at: 'jiisan', delayMs: 600 }, { type: 'ACTOR_SPEECH', actorId: 'makio', text: 'じいちゃん、のんきすぎ！', delayMs: 3000 }] },
    { id: E(31), s: 'lunch', t: 'bear', cat: 'FLAVOR', requires: [E(23)], blocksIfCompleted: BEAR_END, title: 'クマ、カップルのお弁当をたいらげる', say: 'クンクン……グフッ♪', anim: 'react.eat', route: 'S3.route.bear',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'bear', to: [7300, 1200], speed: 200 }, { type: 'HIDE_OBJECT', objectId: 'lunch', delayMs: 5600 }, { type: 'ACTOR_SPEECH', actorId: 'mio', text: 'わたしのサンドイッチがー！', delayMs: 5800 },
        { type: 'ACTOR_SPEECH', actorId: 'takuma', text: 'に、逃げよう！', delayMs: 6800 }, { type: 'ACTOR_MOVE', actorId: 'bear', pathId: 'bearWalk', delayMs: 9000 }] },

    // ── 祖父の一句（E32–E35） ──
    { id: E(32), s: 'sky', t: 'jiisan', cat: 'FLAVOR', title: '祖父、夏空で一句', say: '「夏空や 雲ひとつぶん 腹へった」……字余りじゃが、よし', anim: 'react.think', route: 'S3.route.haiku', fx: [{ type: 'FX', kind: 'notes', at: 'jiisan', delayMs: 600 }] },
    { id: E(33), s: 'smoke', t: 'jiisan', cat: 'FLAVOR', requires: [E(58)], title: '祖父、山の煙で一句', say: '「やまびこが けむりで返る 夏の山」……ほう、なかなか', anim: 'react.think', route: 'S3.route.haiku', fx: [{ type: 'FX', kind: 'notes', at: 'jiisan', delayMs: 600 }] },
    { id: E(34), s: 'bbqmeat', t: 'jiisan', cat: 'FLAVOR', title: '祖父、焼き肉で一句', say: '「肉焼ける 煙のむこうに 孫の顔」……腹がへる句じゃ', anim: 'react.eat', route: 'S3.route.haiku', fx: [{ type: 'FX', kind: 'steam', at: 'jiisan', delayMs: 600 }] },
    { id: E(35), s: 'ufo', t: 'jiisan', cat: 'FLAVOR', title: '祖父、UFOで一句……？', say: '「ゆーふぉーや ……」季語はどれじゃ。いや、そもそもあれは何じゃ', anim: 'react.surprised', route: 'S3.route.haiku', fx: [{ type: 'ACTOR_SPEECH', actorId: 'makio', text: 'じいちゃん、それ写真のピンボケじゃない？', delayMs: 2600 }] },

    // ── 管理人と部長、サルとバナナ（E36–E40, E70） ──
    { id: E(36), s: 'bucho', t: 'kanri', cat: 'BRANCH', group: 'S3-OFFICE', title: '管理人、部長の視察に気づく', say: 'げっ、部長！？ ……っていうか親父！？ 抜き打ちなんて聞いてないよ！', anim: 'react.surprised', route: 'S3.route.office',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'kanri', to: [6280, 1470], speed: 300, wander: 30 }, { type: 'ACTOR_SET_STATE', actorId: 'kanri', state: 'BUSY', delayMs: 2000 }, { type: 'SET_FLAG', id: 'kanri.away', value: true },
        { type: 'ACTOR_SPEECH', actorId: 'bucho', text: '父と呼ぶな、部長と呼べ。……ちゃんと働いとるか見に来たんだ', delayMs: 3200 }],
      after: [{ actor: 'monkey', text: 'キキッ……（見張りがいなくなった）', delay: 4600 }, { actor: 'yoshio', text: 'あれ、管理人さん行っちゃった……', delay: 5400 }] },
    { id: E(37), s: 'kanri', t: 'bucho', cat: 'BRANCH', group: 'S3-OFFICE', title: '部長、昼寝中の管理人を発見', say: 'ほう……勤務中に昼寝とは、いいご身分だな。ちょっと管理棟まで来なさい', anim: 'react.angry', route: 'S3.route.office',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'bucho', to: [6700, 1690], speed: 200 }, { type: 'ACTOR_SPEECH', actorId: 'kanri', text: 'ひっ、部長！ ね、寝てません！ サルを見張ってただけです！', delayMs: 3600 },
        { type: 'ACTOR_MOVE', actorId: 'kanri', to: [6280, 1470], speed: 160, delayMs: 5200, wander: 30 }, { type: 'ACTOR_MOVE', actorId: 'bucho', to: [6340, 1480], speed: 160, delayMs: 5400, wander: 30 }, { type: 'SET_FLAG', id: 'kanri.away', value: true }],
      after: [{ actor: 'monkey', text: 'キキッ……（見張りがいなくなった）', delay: 7000 }] },
    { id: E(38), s: 'banana', t: 'monkey', cat: 'PROGRESSION', cond: [anyDone(E(36), E(37))], title: 'サル、ヨシオのバナナを奪う', say: 'キキーッ！（一房まるごと！）', anim: 'react.run', route: 'S3.route.monkey',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'monkey', to: [6980, 1745], speed: 380 }, { type: 'HIDE_OBJECT', objectId: 'banana', delayMs: 2400 }, { type: 'ACTOR_MOVE', actorId: 'monkey', to: [6600, 1180], speed: 380, delayMs: 2600, wander: 80 },
        { type: 'ACTOR_SET_STATE', actorId: 'yoshio', state: 'SAD', delayMs: 2600 }],
      after: [{ actor: 'yoshio', text: 'ぼくのバナナー！ ……のこったのは、この団子だけ……', delay: 3200 }] },
    { id: E(39), s: 'bwhat', t: 'monkey', cat: 'CHAIN', title: 'サル、帽子の中のバナナを狙う', say: 'キッ？（あの帽子から、あまいにおい）', anim: 'react.run', route: 'S3.route.monkey',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'monkey', to: [8150, 1210], speed: 380 }, { type: 'HIDE_OBJECT', objectId: 'bwhat', delayMs: 5000 }, { type: 'SPAWN_OBJECT', objectId: 'treehat', delayMs: 5600 }, { type: 'FX', kind: 'leaves', at: 'treehat', delayMs: 5600 },
        { type: 'ACTOR_SPEECH', actorId: 'birder', text: 'あっ、わしの帽子！ バナナだけ取って、帽子は木の上にポイか……', delayMs: 6400 }, { type: 'ACTOR_MOVE', actorId: 'monkey', to: [6600, 1180], speed: 380, delayMs: 6600, wander: 80 }] },
    { id: E(40), s: 'treehat', t: 'bluebird', cat: 'FLAVOR', requires: [E(39)], title: '青い鳥、帽子を返してくれる', say: 'ピピッ（くわえて、パタパタ）', anim: 'react.happy', route: 'S3.route.birds',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'treehat', delayMs: 800 }, { type: 'ACTOR_MOVE', actorId: 'bluebird', to: [8080, 1080], speed: 120 }, { type: 'FX', kind: 'sparkle', at: 'birder', delayMs: 2400 },
        { type: 'ACTOR_SPEECH', actorId: 'birder', text: '青い鳥が帽子を……！ 幸せって、こういうことか', delayMs: 2600 }, { type: 'ACTOR_MOVE', actorId: 'bluebird', to: [8260, 960], speed: 80, delayMs: 4500, wander: 50 }] },

    // ── はらぺこゴンベエ（E41–E45） ──
    { id: E(41), s: 'popcorn', t: 'birds', cat: 'CHAIN', cond: [{ actorVisible: 'gonbe' }], title: 'スズメたち、ポップコーンに群がる', say: 'チュンチュンチュン！', anim: 'react.happy', route: 'S3.route.hungry',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'birds', to: [5920, 1735], speed: 260, wander: 30 }, { type: 'FX', kind: 'paper', at: 'popcorn', delayMs: 1500 }, { type: 'OBJECT_SET_STATE', objectId: 'popcorn', state: 'USED', delayMs: 3000 },
        { type: 'ACTOR_SPEECH', actorId: 'gonbe', text: 'ぼくのポップコーンがー！ ……おなかすいた……', delayMs: 2400 }, { type: 'ACTOR_MOVE', actorId: 'birds', to: [5750, 1480], speed: 200, delayMs: 6000, wander: 200 }],
      after: [{ actor: 'gonbe', text: 'もう、そのへんに生えてるものでもいいや……', delay: 6400 }] },
    { id: E(42), s: 'mushroom', t: 'gonbe', cat: 'FLAVOR', requires: [E(41)], blocksIfCompleted: [E(45)], title: 'ゴンベエ、ふつうのキノコを食べる', say: 'キノコ！ ……モグモグ。……ふつう！', anim: 'react.eat', route: 'S3.route.hungry', fx: [{ type: 'HIDE_OBJECT', objectId: 'mushroom', delayMs: 1200 }] },
    { id: E(43), s: 'watermelon', t: 'gonbe', cat: 'FLAVOR', requires: [E(41)], blocksIfCompleted: [E(45)], title: 'ゴンベエ、スイカを丸かじり', say: 'スイカ丸ごと！ シャクシャク……タネも食べちゃう！', anim: 'react.eat', route: 'S3.route.hungry',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'gonbe', to: [5600, 1830], speed: 160 }, { type: 'HIDE_OBJECT', objectId: 'watermelon', delayMs: 2600 }, { type: 'ACTOR_SPEECH', actorId: 'nanami', text: 'あー！ みんなのスイカ！', delayMs: 3000 }, { type: 'ACTOR_MOVE', actorId: 'gonbe', to: [5860, 1720], speed: 120, delayMs: 4000, wander: 30 }] },
    { id: E(44), s: 'nuts', t: 'gonbe', cat: 'FLAVOR', requires: [E(41)], blocksIfCompleted: [E(45)], title: 'ゴンベエ、木の実をかじる', say: 'ドングリ？ カリカリ……リスの気持ちがわかった', anim: 'react.eat', route: 'S3.route.hungry', fx: [{ type: 'ACTOR_SPEECH', actorId: 'squirrel', text: 'キュッ！？（それぼくの！）', delayMs: 2000 }] },
    { id: E(45), s: 'stripeshroom', t: 'gonbe', cat: 'FLAVOR', requires: [E(41)], title: 'ゴンベエ、しましまキノコでおかしくなる', say: 'しましまのキノコ……おいしい……あはは、世界がまわる〜！', anim: 'react.spin', route: 'S3.route.hungry',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'stripeshroom', delayMs: 1000 }, { type: 'ACTOR_APPEARANCE', actorId: 'gonbe', look: { skin: '#a8e0a0' }, delayMs: 1600 }, { type: 'FX', kind: 'stars', at: 'gonbe', delayMs: 1600 },
        { type: 'ACTOR_SPEECH', actorId: 'gonbe', text: 'キノコの妖精さんがおどってる〜♪', delayMs: 3200 }, { type: 'ACTOR_ANIMATION', actorId: 'gonbe', animationId: 'react.laugh', delayMs: 3200 }] },

    // ── バードウォッチング（E46–E52） ──
    { id: E(46), s: 'bluebird', t: 'birder', cat: 'FLAVOR', blocksIfCompleted: [E(52)], title: 'バードウォッチャー、青い鳥に感激', say: '青い鳥……！ 子どものころから探してたんだ……', anim: 'react.sparkle', route: 'S3.route.birds', fx: [{ type: 'FX', kind: 'flash', at: 'birder', delayMs: 800 }, { type: 'PLAY_SOUND', soundId: 'capture', delayMs: 800 }] },
    { id: E(47), s: 'peacock', t: 'birder', cat: 'FLAVOR', blocksIfCompleted: [E(52)], title: 'バードウォッチャー、派手な鳥に驚く', say: 'な、なんだあの派手な鳥は！ 極楽鳥か！？ こんな森に！？', anim: 'react.surprised', route: 'S3.route.birds', fx: [{ type: 'FX', kind: 'flash', at: 'birder', delayMs: 800 }, { type: 'ACTOR_SPEECH', actorId: 'peacock', text: 'ケーン！（羽をひろげた）', delayMs: 2000 }] },
    { id: E(48), s: 'brownbird', t: 'birder', cat: 'FLAVOR', blocksIfCompleted: [E(52)], title: 'バードウォッチャー、地味な鳥を記録', say: 'ふむ、茶色い。……地味だが、こういうのがいいんだ', anim: 'react.think', route: 'S3.route.birds', fx: [{ type: 'FX', kind: 'flash', at: 'birder', delayMs: 800 }] },
    { id: E(49), s: 'ufo', t: 'birder', cat: 'FLAVOR', blocksIfCompleted: [E(52)], title: 'バードウォッチャー、UFOを記録', say: 'あれは鳥……ではない！ 図鑑にない！ 未確認飛行物体だ！', anim: 'react.surprised', route: 'S3.route.birds', fx: [{ type: 'FX', kind: 'flash', at: 'birder', delayMs: 800 }, { type: 'PLAY_SOUND', soundId: 'surprise', delayMs: 800 }] },
    { id: E(50), s: 'sumo', t: 'birder', cat: 'FLAVOR', requires: [E(21)], blocksIfCompleted: [E(52)], title: 'バードウォッチャー、力士を観察', say: 'ほう、大きな……鳥？ いや、力士か。……念のため記録しておこう', anim: 'react.think', route: 'S3.route.birds', fx: [{ type: 'FX', kind: 'flash', at: 'birder', delayMs: 800 }, { type: 'ACTOR_SPEECH', actorId: 'sumo', text: 'ごっつぁんです', delayMs: 2200 }] },
    { id: E(51), s: 'lostman', t: 'birder', cat: 'FLAVOR', requires: [E(58)], blocksIfCompleted: [E(52)], title: 'バードウォッチャー、煙の山の人影を発見', say: 'ん？ 煙の山の中腹に人影！ 迷子かもしれん……管理棟に知らせねば！', anim: 'react.surprised', route: 'S3.route.birds',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'kanri', text: 'え、遭難者！？ 救助隊に連絡します！', delayMs: 3000 }, { type: 'PLAY_SOUND', soundId: 'whistle', delayMs: 3200 }] },
    { id: E(52), s: 'gondola', t: 'birder', cat: 'BRANCH', title: 'バードウォッチャー、ロープウェイに妻を見る', say: 'ロープウェイに……妻！？ となりの男はだれだ！ 待てーっ！！', anim: 'react.angry', route: 'S3.route.birds',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'birder', to: [1000, 1200], speed: 380, wander: 40 }, { type: 'ACTOR_SET_STATE', actorId: 'birder', state: 'ANGRY' }],
      after: [{ actor: 'birder', text: 'バードウォッチングどころじゃない！', delay: 2000 }] },

    // ── 看板と旅人（E53–E54） ──
    { id: E(53), s: 'sign_a', t: 'kakeru', cat: 'CHAIN', title: '旅人、「あっち」の看板を信じる', say: 'あっち、か。看板を信じて進むのが旅のルールさ！', anim: 'react.happy', route: 'S3.route.travel',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'kakeru', to: [7050, 1580], speed: 260, wander: 30 }],
      after: [{ actor: 'kakeru', text: 'さて、次の看板はどっちを指してるかな', delay: 26000 }] },
    { id: E(54), s: 'sign_k', t: 'kakeru', cat: 'FLAVOR', requires: [E(53)], title: '旅人、「こっち」でふりだしに戻る', say: '「こっち」……よし、こっちだ！ 旅は看板しだい！', anim: 'react.happy', route: 'S3.route.travel',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'kakeru', to: [650, 1580], speed: 260, wander: 40 }],
      after: [{ actor: 'kakeru', text: '……あれ？ ここ、さっきの駐車場じゃない？', delay: 26000 }] },

    // ── ハンモックと帽子（E55–E56） ──
    { id: E(55), s: 'hammock', t: 'midori', cat: 'CHAIN', title: 'ミドリ、ハンモックでゆらゆら', say: 'ハンモック！ ゆ〜らゆ〜ら……あっ、帽子が飛んだ！', anim: 'react.happy', route: 'S3.route.misc',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'midori', to: [3200, 1410], speed: 140, wander: 0 }, { type: 'ACTOR_APPEARANCE', actorId: 'midori', look: { acc: ['flower'] }, delayMs: 2200 }, { type: 'SPAWN_OBJECT', objectId: 'riverhat', delayMs: 2400 },
        { type: 'OBJECT_MOVE', objectId: 'riverhat', to: [3700, 2200], speed: 60, delayMs: 2500 }],
      after: [{ actor: 'midori', text: 'わたしの麦わら帽子、川に落ちちゃった……', delay: 4000 }] },
    { id: E(56), s: 'riverhat', t: 'yanagi', cat: 'FLAVOR', requires: [E(55)], title: 'ヤナギ、帽子を拾っていいところを見せる', say: 'ミドリちゃんの帽子！ ぼ、ぼくが取ってくる！ ……ひょろっ', anim: 'react.run', route: 'S3.route.misc',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'yanagi', to: [3700, 2030], speed: 260 }, { type: 'FX', kind: 'splash', at: 'riverhat', delayMs: 3600 }, { type: 'HIDE_OBJECT', objectId: 'riverhat', delayMs: 3800 },
        { type: 'ACTOR_MOVE', actorId: 'yanagi', to: [3330, 1450], speed: 200, delayMs: 4200, wander: 40 }, { type: 'ACTOR_APPEARANCE', actorId: 'midori', look: { acc: ['hat', 'flower'] }, delayMs: 7000 },
        { type: 'ACTOR_SPEECH', actorId: 'midori', text: 'ヤナギくん、たよりになる〜！', delayMs: 7200 }, { type: 'FX', kind: 'hearts', at: 'yanagi', delayMs: 7400 }] },

    // ── ヤッホーと山（E57–E58） ──
    { id: E(57), s: 'farmtn', t: 'climber', cat: 'CHAIN', title: '登山家、遠くの山にヤッホー', say: 'おお、あの山！ ……ヤッホーーーー！！', anim: 'react.happy', route: 'S3.route.mountain',
      fx: [{ type: 'ACTOR_FACE', actorId: 'climber', direction: 'LEFT' }, { type: 'PLAY_SOUND', soundId: 'whistle', delayMs: 600 }],
      after: [{ actor: 'climber', text: '……返事がない。反対側の山なら、どうかな', delay: 3400 }] },
    { id: E(58), s: 'volcano', t: 'climber', cat: 'CHAIN', requires: [E(57)], title: 'ケムリ山、煙でヤッホーに返事', say: 'こっちの山にも……ヤッホーー！ ……え、煙で返事した！？', anim: 'react.surprised', route: 'S3.route.mountain',
      fx: [{ type: 'ACTOR_FACE', actorId: 'climber', direction: 'RIGHT' }, { type: 'FX', kind: 'smoke', at: 'volcano', delayMs: 1200 }, { type: 'PLAY_SOUND', soundId: 'boom', delayMs: 1200 },
        { type: 'SPAWN_OBJECT', objectId: 'smoke', delayMs: 1600 }, { type: 'SPAWN_OBJECT', objectId: 'lostman', delayMs: 1600 }],
      after: [{ actor: 'jiisan', text: 'おお、ケムリ山がけむっておる……一句できそうじゃ', delay: 4200 }, { actor: 'birder', text: 'む、山のほうで何か動いたような……', delay: 5200 }] },

    // ── けんか中のイサオ（E59, E69） ──
    { id: E(59), s: 'river', t: 'isao', cat: 'CHAIN', title: 'イサオ、川で頭を冷やす', say: '……そうだな、ちょっと頭を冷やすか。ジャブン！', anim: 'react.splash', route: 'S3.route.misc',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'isao', to: [5200, 2030], speed: 160 }, { type: 'FX', kind: 'splash', at: 'isao', delayMs: 1600 }, { type: 'PLAY_SOUND', soundId: 'splash', delayMs: 1600 }, { type: 'ACTOR_SPEECH', actorId: 'isaowife', text: 'そこまでしなくても……', delayMs: 2600 }],
      after: [{ actor: 'isao', text: 'つめてっ！ ……でもまだ顔がほてってる', delay: 3800 }] },
    { id: E(69), s: 'river', t: 'isao', cat: 'FLAVOR', requires: [E(59)], title: 'イサオ、顔を洗って仲直り', say: 'ついでに顔も洗って……ふう。さっきは言いすぎた、ごめんな', anim: 'react.happy', route: 'S3.route.misc',
      fx: [{ type: 'FX', kind: 'splash', at: 'isao', delayMs: 600 }, { type: 'ACTOR_MOVE', actorId: 'isao', to: [5110, 1975], speed: 120, delayMs: 1600, wander: 30 }, { type: 'ACTOR_SPEECH', actorId: 'isaowife', text: 'もう……しょうがない人', delayMs: 3200 }, { type: 'FX', kind: 'hearts', at: 'isaowife', delayMs: 3400 }] },

    // ── リス（E60） ──
    { id: E(60), s: 'nuts', t: 'squirrel', cat: 'FLAVOR', title: 'リス、木の実でほっぺぱんぱん', say: 'カリカリカリ……（ほっぺがぱんぱん）', anim: 'react.eat', route: 'S3.route.misc',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'squirrel', to: [3660, 1255], speed: 200 }, { type: 'HIDE_OBJECT', objectId: 'nuts', delayMs: 2200 }, { type: 'ACTOR_MOVE', actorId: 'squirrel', to: [3760, 1000], speed: 160, delayMs: 3200, wander: 60 }] },

    // ── トイレの紙（E61, E66–E68） ──
    { id: E(61), s: 'toilet', t: 'harada', cat: 'CHAIN', title: 'ハラダ、トイレに駆けこむ', say: 'ト、トイレ！ いまのぼくに、いちばん必要なもの！', anim: 'react.run', route: 'S3.route.toilet',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'harada', to: [7400, 1480], speed: 340, wander: 0 }, { type: 'PLAY_SOUND', soundId: 'pop', delayMs: 5600 },
        { type: 'ACTOR_SPEECH', actorId: 'harada', text: 'ふう……間に合った……って、紙がない！！ だれかーっ！', delayMs: 6400 }] },
    { id: E(66), s: 'leaftree', t: 'harada', cat: 'FLAVOR', group: 'S3-PAPER', requires: [E(61)], title: 'ハラダ、葉っぱで代用する', say: 'は、葉っぱ……やわらかそうなやつで……大自然に感謝！', anim: 'react.embarrassed', route: 'S3.route.toilet',
      fx: [{ type: 'FX', kind: 'leaves', at: 'leaftree', delayMs: 600 }, { type: 'ACTOR_MOVE', actorId: 'harada', to: [6000, 1620], speed: 120, delayMs: 3000, wander: 120 }, { type: 'ACTOR_SET_STATE', actorId: 'harada', state: 'RESOLVED', delayMs: 3000 }] },
    { id: E(67), s: 'papa', t: 'harada', cat: 'FLAVOR', requires: [E(61)], blocksIfCompleted: [E(66), E(68)], title: 'ハラダ、父を管理人とまちがえる', say: 'あっ、管理人さん！？ 紙！ 紙をくださーい！', anim: 'react.embarrassed', route: 'S3.route.toilet',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'papa', text: 'ん？ わしはただの客だが……', delayMs: 2600 }, { type: 'ACTOR_SPEECH', actorId: 'harada', text: 'し、失礼しました……（まだ紙がない）', delayMs: 4200 }] },
    { id: E(68), s: 'haikunote', t: 'harada', cat: 'FLAVOR', group: 'S3-PAPER', requires: [E(61)], title: 'ハラダ、俳句ノートを一枚拝借', say: 'ノートの紙！ すみません、一枚だけ……びっしり俳句が書いてあるけど', anim: 'react.embarrassed', route: 'S3.route.toilet',
      fx: [{ type: 'FX', kind: 'paper', at: 'harada', delayMs: 600 }, { type: 'ACTOR_SPEECH', actorId: 'jiisan', text: 'わしの句集が……一句ぶん減っとる……！', delayMs: 3000 }, { type: 'ACTOR_MOVE', actorId: 'harada', to: [6000, 1620], speed: 120, delayMs: 3600, wander: 120 }] },

    // ── 好き嫌い交換（E62–E63） ──
    { id: E(62), s: 'gou', t: 'nanami', cat: 'CHAIN', title: 'ナナミ、交換作戦をひらめく', say: 'ゴウくん、またお肉残してる……わたしは野菜がイヤ。……ひらめいた！', anim: 'react.think', route: 'S3.route.misc',
      fx: [{ type: 'ACTOR_FACE', actorId: 'nanami', direction: 'LEFT' }],
      after: [{ actor: 'nanami', text: 'ゴウくんに、こっそり話しかけてみよっと', delay: 3000 }] },
    { id: E(63), s: 'nanami', t: 'gou', cat: 'FLAVOR', requires: [E(62)], title: 'ゴウとナナミ、お皿をこっそり交換', say: 'ナナミちゃんの野菜と、ぼくのお肉を交換？ やったー、取引成立！', anim: 'react.happy', route: 'S3.route.misc',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'gou', to: [5350, 1775], speed: 120 }, { type: 'FX', kind: 'sparkle', at: 'gou', delayMs: 1600 }, { type: 'ACTOR_SPEECH', actorId: 'nanami', text: 'ないしょだよ？', delayMs: 2400 }] },

    // ── マルオとジュースのゆくえ（E64, E65, E70–E76） ──
    { id: E(64), s: 'can', t: 'maruo', cat: 'CHAIN', title: 'マルオ、アスパラ缶を森に投げる', say: 'お、桃缶！ ……って、アスパラ缶じゃないか！ えいっ！', anim: 'react.angry', route: 'S3.route.monkey',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'can', delayMs: 800 }, { type: 'PLAY_SOUND', soundId: 'crash', delayMs: 1200 }, { type: 'SPAWN_OBJECT', objectId: 'gang', delayMs: 1600 }, { type: 'SPAWN_OBJECT', objectId: 'gang2', delayMs: 1700 }, { type: 'SPAWN_OBJECT', objectId: 'gang3', delayMs: 1800 },
        { type: 'FX', kind: 'leaves', at: 'gang', delayMs: 1600 }],
      after: [{ actor: 'monkey', text: 'キキッ！？（森からバナナ軍団が出てきた……）', delay: 3200 }] },
    { id: E(70), s: 'gang', t: 'monkey', cat: 'FLAVOR', requires: [E(64)], title: 'サル、バナナ軍団に負ける', say: 'キ……キィ……（ボスたちに追い払われた）', anim: 'react.sad', route: 'S3.route.monkey',
      fx: [{ type: 'OBJECT_MOVE', objectId: 'gang', to: [6600, 1200], speed: 200 }, { type: 'ACTOR_MOVE', actorId: 'monkey', to: [6560, 1480], speed: 260, wander: 60 }, { type: 'ACTOR_SET_STATE', actorId: 'monkey', state: 'SAD', delayMs: 1600 }] },
    { id: E(65), s: 'juice', t: 'maruo', cat: 'CHAIN', title: 'マルオのジュース、川に流される', say: '冷やしてたジュース、そろそろ……あっ、流された！ 待ってー！', anim: 'react.surprised', route: 'S3.route.juice',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'maruo', to: [7400, 2010], speed: 200 }, { type: 'HIDE_OBJECT', objectId: 'juice', delayMs: 1600 }, { type: 'SPAWN_OBJECT', objectId: 'floatjuice', delayMs: 1600 },
        { type: 'OBJECT_MOVE', objectId: 'floatjuice', to: [8420, 2120], speed: 90, delayMs: 1700 }, { type: 'ACTOR_MOVE', actorId: 'maruo', to: [7300, 1970], speed: 120, delayMs: 3600, wander: 50 }],
      after: [{ actor: 'coco', text: 'パパ〜、ジュースは〜？', delay: 4600 }] },
    { id: E(71), s: 'floatjuice', t: 'tamotsu', cat: 'CHAIN', requires: [E(65)], title: 'タモツ、流れてきたジュースをキャッチ', say: 'ザリガニ……じゃなくてジュースが流れてきた！ 網でキャッチ！', anim: 'react.happy', route: 'S3.route.juice',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'floatjuice', delayMs: 900 }, { type: 'SPAWN_OBJECT', objectId: 'tamojuice', delayMs: 900 }, { type: 'FX', kind: 'splash', at: 'tamojuice', delayMs: 900 }],
      after: [{ actor: 'tamotsu', text: 'だれのジュースだろ。持ち主、さがしてるかなあ', delay: 3200 }] },
    { id: E(72), s: 'tamojuice', t: 'maruo', cat: 'CHAIN', requires: [E(71)], title: 'マルオ、ジュースを取りもどす', say: 'それ、うちのジュース！ 少年、ありがとう！ ほらココ、どうぞ', anim: 'react.happy', route: 'S3.route.juice',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'tamojuice', delayMs: 800 }, { type: 'ACTOR_ANIMATION', actorId: 'coco', animationId: 'react.drink', delayMs: 1800 }, { type: 'ACTOR_SPEECH', actorId: 'coco', text: 'ごくごく……ぷはーっ！', delayMs: 2000 },
        { type: 'SPAWN_OBJECT', objectId: 'emptybottle', delayMs: 3600 }],
      after: [{ actor: 'coco', text: 'からっぽのビン、きらきらしてきれい', delay: 5000 }] },
    { id: E(76), s: 'emptybottle', t: 'jiisan', cat: 'CHAIN', requires: [E(72)], title: '祖父、瓶に俳句を入れて川へ流す', say: '空き瓶か……ひらめいた。一句したためて、川に流そう。ロマンじゃのう', anim: 'react.think', route: 'S3.route.haiku',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'emptybottle', delayMs: 800 }, { type: 'ACTOR_MOVE', actorId: 'jiisan', to: [4560, 2010], speed: 90 }, { type: 'SPAWN_OBJECT', objectId: 'haikubottle', delayMs: 6000 }, { type: 'FX', kind: 'splash', at: 'haikubottle', delayMs: 6000 },
        { type: 'OBJECT_MOVE', objectId: 'haikubottle', to: [8340, 2160], speed: 110, delayMs: 6200 }, { type: 'ACTOR_MOVE', actorId: 'jiisan', to: [4620, 1580], speed: 80, delayMs: 7000, wander: 0 }],
      after: [{ actor: 'jiisan', text: 'どこのだれに届くかのう……', delay: 7400 }] },
    { id: E(73), s: 'haikubottle', t: 'tamotsu', cat: 'CHAIN', requires: [E(76)], title: 'タモツ、瓶の中の俳句を読む', say: 'ビンに紙が入ってる……「川くだり 届けこの句よ どこまでも」……おじいちゃん、届いたよー！', anim: 'react.sparkle', route: 'S3.route.haiku',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'haikubottle', delayMs: 800 }, { type: 'FX', kind: 'notes', at: 'tamotsu', delayMs: 1200 }],
      after: [{ actor: 'tamotsu', text: '下流って、ほんとにいろんなものが流れてくるなあ', delay: 3600 }] },
    { id: E(74), s: 'swimsuit', t: 'tamotsu', cat: 'FLAVOR', requires: [E(73)], cond: [anyDone(E(9), E(10))], title: 'タモツ、流された海パンを届ける', say: '今度は海パン……あっ、さっき溺れてたお兄さんのだ！ 届けてあげよう', anim: 'react.laugh', route: 'S3.route.river',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'swimsuit', delayMs: 800 }, { type: 'ACTOR_MOVE', actorId: 'tamotsu', to: [3400, 2000], speed: 380, delayMs: 1000 }, { type: 'ACTOR_SPEECH', actorId: 'tetsuo', text: 'ぼくの海パン！ ありがとう少年！ ……恥ずかしかった！', delayMs: 14000 },
        { type: 'ACTOR_MOVE', actorId: 'tamotsu', to: [8450, 2025], speed: 380, delayMs: 15000, wander: 70 }] },
    { id: E(75), s: 'stump', t: 'tamotsu', cat: 'FLAVOR', title: 'タモツ、切り株の年輪で目をまわす', say: '切り株の輪っか……ぐるぐる……ぐる……目がまわる〜', anim: 'react.spin', route: 'S3.route.misc', fx: [{ type: 'FX', kind: 'stars', at: 'tamotsu', delayMs: 1200 }] },

    // ── エンディング ──
    { id: E(77), s: 'dango', t: 'yoshio', cat: 'TIMEOUT', title: '夕立でキャンプ中止', say: 'あっ……雨？ ゴロゴロって……ひゃあ、カミナリ！', anim: 'react.timeout', route: 'S3.route.end',
      fx: [{ type: 'FX', kind: 'lightning', at: 'volcano' }, { type: 'PLAY_SOUND', soundId: 'thunder' }, { type: 'ACTOR_SPEECH', actorId: 'papa', text: '夕立だ！ みんなテントに入れーっ！', delayMs: 1200 },
        { type: 'ACTOR_SPEECH', actorId: 'mama', text: '晩ごはん、びしょびしょ……', delayMs: 2400 }, { type: 'FX', kind: 'splash', at: 'river', delayMs: 2000 }, { type: 'WAIT', durationMs: 3200 }] },
    { id: E(78), s: 'dango', t: 'yoshio', cat: 'TERMINAL', title: '落雷でキャンプファイヤー大炎上', say: '晩ごはんもできたし、クマ騒ぎも終わった……よーし、最後の団子でかんぱーい！', anim: 'react.terminal', route: 'S3.route.end',
      cond: [done(E(6)), anyDone(E(26), E(27), E(28), E(29)), done(E(38))],
      fx: [{ type: 'ACTOR_ANIMATION', actorId: 'yoshio', animationId: 'react.happy' }, { type: 'FX', kind: 'lightning', at: 'dango', delayMs: 1400 }, { type: 'PLAY_SOUND', soundId: 'thunder', delayMs: 1400 },
        { type: 'FX', kind: 'fire', at: 'yoshio', delayMs: 2000 }, { type: 'ACTOR_APPEARANCE', actorId: 'yoshio', look: { hair: 'afro', hairColor: '#222' }, delayMs: 2000 },
        { type: 'FX', kind: 'eruption', at: 'tent_c', delayMs: 2800 }, { type: 'PLAY_SOUND', soundId: 'boom', delayMs: 2800 },
        { type: 'ACTOR_SPEECH', actorId: 'yoshio', text: '……団子、こんがり焼けた', delayMs: 3200 },
        { type: 'ACTOR_SPEECH', actorId: 'papa', text: 'うおお、かまどの火が天まで！？ 特大キャンプファイヤーだー！', delayMs: 4000 },
        { type: 'ACTOR_SPEECH', actorId: 'jiisan', text: '「いなびかり 団子も焼ける 夏の宴」……これが今日いちばんの句じゃ', delayMs: 5200 },
        { type: 'FX', kind: 'confetti', at: 'tent_c', delayMs: 5600 }, { type: 'WAIT', durationMs: 6000 }] },
  ],
};
