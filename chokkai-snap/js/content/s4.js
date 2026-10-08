// ステージ4：なかよし動物園（49 イベント）。登場人物・動物の名前と台詞はすべてオリジナル。
// 上段（y 320〜1080）＝大型動物の展示、中央＝メイン通路、下段（y 1450〜2150）＝ふれあいエリア、最下段＝下の通路。
const done = id => ({ eventDone: id });
const notDone = id => ({ eventNotDone: id });
const flag = (id, value = true) => ({ flagEquals: { id, value } });

// ── 背景の自動生成（遠景の木・街灯・花壇） ──
const backTrees = [];
for (let x = 60; x < 7200; x += 260) backTrees.push({ t: 'emoji', e: x % 520 < 260 ? '🌳' : '🌲', x, y: 250 + (x % 3) * 18, s: 120 });
const lamps = [];
for (let x = 420; x < 7200; x += 900) {
  lamps.push({ t: 'line', pts: [x, 1100, x, 990], stroke: '#555', w: 6 }, { t: 'ellipse', x, y: 985, rx: 16, ry: 12, fill: '#fff6c2', stroke: '#555' });
}
const flowers = [];
for (let x = 120; x < 7200; x += 480) flowers.push({ t: 'emoji', e: ['🌷', '🌼', '🌸', '🌻'][(x / 480) % 4 | 0], x, y: 1420, s: 34 });
const bench = (x, y) => [
  { t: 'rect', x, y, w: 150, h: 18, fill: '#9a6a3a', r: 4 },
  { t: 'rect', x, y: y - 34, w: 150, h: 12, fill: '#b07a44', r: 4 },
  { t: 'rect', x: x + 10, y: y + 18, w: 10, h: 22, fill: '#555' }, { t: 'rect', x: x + 130, y: y + 18, w: 10, h: 22, fill: '#555' },
];

export default {
  id: 'S4', title: 'なかよし動物園', subtitle: '動物園', theme: '動物園',
  intro: 'よく晴れた休日の動物園。人も動物もそれぞれ小さな困りごとをかかえている。園長は「テレビ取材が来ないかなあ」とそわそわ……。',
  timeLimitMs: 300000,
  world: { width: 7200, height: 2400, minZoom: 0.75, maxZoom: 4, bg: '#9fcf6e', spawnCamera: { x: 1100, y: 1150, zoom: 1 } },
  bgm: { tempo: 116, key: 5, mood: 'major' },
  clearEventId: 'S4-E49', timeoutEventId: 'S4-E48',
  routes: {
    'S4.route.monkey': 'サル山のけんか', 'S4.route.peacock': 'クジャクの恋', 'S4.route.hippo': 'カバと財布',
    'S4.route.elephant': 'ゾウの大活躍', 'S4.route.tapir': 'バクとライオン', 'S4.route.tanuki': '逃げたタヌキ',
    'S4.route.giraffe': 'キリンの長い首', 'S4.route.panda': 'パンダ舎の二頭', 'S4.route.kiosk': '売店まわりの小動物',
    'S4.route.goat': 'ヤギと地図', 'S4.route.rabbit': '迷子のウサギ', 'S4.route.parrot': 'オウムの恋愛相談',
    'S4.route.tour': 'おじいちゃんの動物ガイド', 'S4.route.end': '動物園のいちにち',
  },
  scenery: [
    // 遠景
    { t: 'rect', x: 0, y: 0, w: 7200, h: 330, fill: '#bfe6f5' },
    { t: 'rect', x: 0, y: 240, w: 7200, h: 90, fill: '#7fb35a' },
    ...backTrees,
    { t: 'emoji', e: '☁️', x: 900, y: 90, s: 110 }, { t: 'emoji', e: '☁️', x: 3300, y: 70, s: 140 }, { t: 'emoji', e: '☁️', x: 5600, y: 110, s: 100 },
    { t: 'emoji', e: '🎈', x: 6700, y: 120, s: 50 },
    // 通路
    { t: 'rect', x: 0, y: 1095, w: 7200, h: 320, fill: '#ead9ad' },
    { t: 'stripes', x: 0, y: 1095, w: 7200, h: 320, dir: 'v', n: 36, c1: 'rgba(0,0,0,0)', c2: 'rgba(120,90,40,.06)' },
    { t: 'rect', x: 0, y: 2160, w: 7200, h: 240, fill: '#ead9ad' },
    { t: 'rect', x: 920, y: 1415, w: 80, h: 745, fill: '#e3d1a2' }, { t: 'rect', x: 3380, y: 1415, w: 70, h: 745, fill: '#e3d1a2' },
    { t: 'rect', x: 5520, y: 1415, w: 80, h: 745, fill: '#e3d1a2' },
    ...lamps, ...flowers,

    // ── 入口・管理事務所 ──
    { t: 'rect', x: 0, y: 330, w: 680, h: 765, fill: '#b9d98c' },
    { t: 'building', x: 90, y: 1060, w: 440, h: 300, fill: '#f3e6c8', roof: '#b5523b', sign: '管理事務所', signFill: '#fff', signColor: '#7a3b2a', door: true, windows: true },
    { t: 'emoji', e: '🪴', x: 70, y: 1030, s: 60 }, { t: 'emoji', e: '🪴', x: 560, y: 1030, s: 60 },
    { t: 'rect', x: 0, y: 1040, w: 34, h: 380, fill: '#8a5a33' },
    { t: 'sign', x: 0, y: 1010, w: 300, h: 56, text: 'なかよし動物園', fill: '#2f7a4a', color: '#fff', s: 28 },
    { t: 'emoji', e: '🎫', x: 600, y: 1150, s: 44 },
    { t: 'emoji', e: '🚩', x: 640, y: 960, s: 50 },

    // ── サル山（700〜1700） ──
    { t: 'rect', x: 700, y: 360, w: 1000, h: 735, fill: '#cdb68a' },
    { t: 'poly', pts: [760, 1000, 960, 600, 1200, 420, 1430, 600, 1660, 1000], fill: '#9c8a6e', stroke: '#6e5f48' },
    { t: 'poly', pts: [1000, 760, 1120, 640, 1260, 700, 1180, 800], fill: '#b3a27f' },
    { t: 'emoji', e: '🪨', x: 900, y: 940, s: 70 }, { t: 'emoji', e: '🪨', x: 1520, y: 930, s: 80 }, { t: 'emoji', e: '🌲', x: 1640, y: 560, s: 110 },
    { t: 'emoji', e: '🪢', x: 1450, y: 650, s: 50 },
    { t: 'water', x: 700, y: 1010, w: 1000, h: 60, fill: '#7cc3e0' },
    { t: 'fence', x: 700, y: 1095, w: 1000, h: 40, fill: '#7a5a3a' },
    { t: 'sign', x: 1120, y: 340, w: 160, h: 46, text: 'サル山', fill: '#6b4a2a', color: '#fff', s: 26 },

    // ── クジャク（1750〜2400） ──
    { t: 'rect', x: 1740, y: 360, w: 680, h: 735, fill: '#b8d98a' },
    { t: 'emoji', e: '🌿', x: 1800, y: 820, s: 70 }, { t: 'emoji', e: '🌿', x: 2350, y: 760, s: 70 }, { t: 'emoji', e: '🌳', x: 2100, y: 560, s: 170 },
    { t: 'line', pts: [1740, 360, 1740, 1095], stroke: '#888', w: 4 }, { t: 'line', pts: [2420, 360, 2420, 1095], stroke: '#888', w: 4 },
    { t: 'stripes', x: 1740, y: 360, w: 680, h: 200, dir: 'v', n: 34, c1: 'rgba(0,0,0,0)', c2: 'rgba(80,80,80,.12)' },
    { t: 'fence', x: 1740, y: 1095, w: 680, h: 40, fill: '#7a5a3a' },
    { t: 'sign', x: 1990, y: 990, w: 150, h: 44, text: 'クジャク', fill: '#2a6a8a', color: '#fff', s: 24 },

    // ── カバ（2450〜3300） ──
    { t: 'rect', x: 2440, y: 360, w: 880, h: 735, fill: '#c9b98a' },
    { t: 'building', x: 2470, y: 640, w: 300, h: 220, fill: '#d8c8a8', roof: '#6a7a8a', sign: 'カバ舎', signFill: '#fff', signColor: '#335', door: true },
    { t: 'water', x: 2560, y: 700, w: 700, h: 330, fill: '#5fa9cf' },
    { t: 'emoji', e: '🪷', x: 3180, y: 760, s: 40 }, { t: 'emoji', e: '🌾', x: 2500, y: 1000, s: 50 },
    { t: 'fence', x: 2440, y: 1095, w: 880, h: 40, fill: '#7a5a3a' },
    { t: 'sign', x: 2990, y: 990, w: 130, h: 44, text: 'カバ', fill: '#5a6a8a', color: '#fff', s: 24 },

    // ── ゾウ（3350〜4300） ──
    { t: 'rect', x: 3340, y: 360, w: 980, h: 735, fill: '#d4b483' },
    { t: 'building', x: 3960, y: 700, w: 330, h: 280, fill: '#c8a878', roof: '#7a4a2a', sign: '象舎', signFill: '#fff', signColor: '#5a2a1a', door: true },
    { t: 'ellipse', x: 3620, y: 990, rx: 120, ry: 34, fill: '#8a6a4a' },
    { t: 'emoji', e: '🌴', x: 3420, y: 560, s: 140 }, { t: 'emoji', e: '🌾', x: 3800, y: 640, s: 60 },
    { t: 'fence', x: 3340, y: 1095, w: 980, h: 40, fill: '#7a5a3a' },
    { t: 'sign', x: 3720, y: 360, w: 140, h: 44, text: 'ゾウ', fill: '#7a4a2a', color: '#fff', s: 24 },
    { t: 'sign', x: 3880, y: 1040, w: 260, h: 44, text: '園内禁煙', fill: '#c33', color: '#fff', s: 22 },

    // ── ライオン（4400〜5100） ──
    { t: 'rect', x: 4380, y: 360, w: 740, h: 735, fill: '#e0c77a' },
    { t: 'poly', pts: [4560, 820, 4700, 640, 4880, 660, 4980, 820], fill: '#b89a5a', stroke: '#8a6a3a' },
    { t: 'emoji', e: '🌾', x: 4480, y: 960, s: 50 }, { t: 'emoji', e: '🦴', x: 5000, y: 1000, s: 34 },
    { t: 'stripes', x: 4380, y: 1020, w: 740, h: 75, dir: 'v', n: 40, c1: 'rgba(0,0,0,0)', c2: 'rgba(40,40,40,.35)' },
    { t: 'fence', x: 4380, y: 1095, w: 740, h: 60, fill: '#555' },
    { t: 'sign', x: 4800, y: 1000, w: 220, h: 44, text: 'キケン！ライオン', fill: '#c33', color: '#fff', s: 22 },

    // ── キリン（5150〜6000） ──
    { t: 'rect', x: 5140, y: 360, w: 880, h: 735, fill: '#c7d98f' },
    { t: 'rect', x: 5870, y: 420, w: 34, h: 640, fill: '#7a5a3a' },
    { t: 'emoji', e: '🌳', x: 5890, y: 430, s: 260 },
    { t: 'emoji', e: '🌿', x: 5250, y: 960, s: 60 },
    { t: 'fence', x: 5140, y: 1095, w: 880, h: 40, fill: '#7a5a3a' },
    { t: 'sign', x: 5420, y: 1000, w: 140, h: 44, text: 'キリン', fill: '#b07a2a', color: '#fff', s: 24 },

    // ── パンダ舎（6050〜7150） ──
    { t: 'rect', x: 6040, y: 360, w: 1160, h: 735, fill: '#a9cf8a' },
    { t: 'building', x: 6820, y: 720, w: 340, h: 260, fill: '#f2f2f2', roof: '#333', sign: 'パンダ舎', signFill: '#000', signColor: '#fff', door: true, windows: true },
    { t: 'emoji', e: '🎋', x: 6200, y: 640, s: 120 }, { t: 'emoji', e: '🎋', x: 6380, y: 600, s: 100 }, { t: 'emoji', e: '🎋', x: 6600, y: 650, s: 110 },
    { t: 'emoji', e: '🪵', x: 6450, y: 980, s: 70 },
    { t: 'stripes', x: 6040, y: 1020, w: 1160, h: 75, dir: 'v', n: 50, c1: 'rgba(0,0,0,0)', c2: 'rgba(80,80,80,.16)' },
    { t: 'fence', x: 6040, y: 1095, w: 1160, h: 40, fill: '#7a5a3a' },
    { t: 'sign', x: 6450, y: 360, w: 200, h: 46, text: 'ジャイアントパンダ', fill: '#222', color: '#fff', s: 20 },

    // ── 下段：ヤギのふれあい広場（80〜900） ──
    { t: 'rect', x: 60, y: 1450, w: 860, h: 700, fill: '#c8d88d' },
    { t: 'building', x: 100, y: 1700, w: 220, h: 160, fill: '#e3c89a', roof: '#a33', sign: 'ふれあい広場', signFill: '#fff', signColor: '#a33' },
    { t: 'emoji', e: '🌾', x: 450, y: 1600, s: 60 }, { t: 'emoji', e: '🌾', x: 520, y: 1620, s: 50 }, { t: 'emoji', e: '🪣', x: 780, y: 1640, s: 44 },
    { t: 'fence', x: 60, y: 2150, w: 860, h: 44, fill: '#c9a46a' },

    // カンガルー（1000〜1700）
    { t: 'rect', x: 1010, y: 1450, w: 720, h: 700, fill: '#d9bf8a' },
    { t: 'emoji', e: '🌵', x: 1100, y: 1560, s: 70 }, { t: 'emoji', e: '🪨', x: 1640, y: 1600, s: 60 },
    { t: 'fence', x: 1010, y: 2150, w: 720, h: 44, fill: '#7a5a3a' },
    { t: 'sign', x: 1290, y: 1460, w: 180, h: 44, text: 'カンガルー', fill: '#b06a2a', color: '#fff', s: 22 },

    // ウサギ（1800〜2500）
    { t: 'rect', x: 1760, y: 1450, w: 780, h: 700, fill: '#bfe08f' },
    { t: 'building', x: 1820, y: 1740, w: 220, h: 170, fill: '#fff3e0', roof: '#e07a8a', sign: 'うさぎ小屋', signFill: '#fff', signColor: '#c35' },
    { t: 'rect', x: 2410, y: 1520, w: 26, h: 150, fill: '#7a5a3a' },
    { t: 'emoji', e: '🌳', x: 2420, y: 1530, s: 190 },
    { t: 'emoji', e: '🥕', x: 2150, y: 1900, s: 34 }, { t: 'emoji', e: '🥬', x: 2240, y: 1950, s: 34 },
    { t: 'fence', x: 1760, y: 2150, w: 780, h: 36, fill: '#c9a46a' },

    // カメの池（2600〜3400）
    { t: 'rect', x: 2580, y: 1450, w: 780, h: 700, fill: '#b5d98a' },
    { t: 'water', x: 2640, y: 1560, w: 680, h: 470, fill: '#6fb7c9' },
    { t: 'emoji', e: '🪷', x: 2760, y: 1700, s: 44 }, { t: 'emoji', e: '🪷', x: 3150, y: 1640, s: 36 }, { t: 'emoji', e: '🪨', x: 2700, y: 2050, s: 60 },
    { t: 'fence', x: 2580, y: 2150, w: 780, h: 30, fill: '#9a8a6a' },
    { t: 'sign', x: 2860, y: 1460, w: 180, h: 44, text: 'カメの池', fill: '#2a7a6a', color: '#fff', s: 22 },

    // ふれあい小動物館（3450〜4100）
    { t: 'rect', x: 3460, y: 1450, w: 660, h: 700, fill: '#d6e8b0' },
    { t: 'building', x: 3480, y: 1720, w: 620, h: 240, fill: '#fbe8c8', roof: '#4a8a5a', sign: 'ふれあい小動物館', signFill: '#fff', signColor: '#2a6a3a', windows: true },
    { t: 'emoji', e: '🌿', x: 3600, y: 1830, s: 80 }, { t: 'emoji', e: '🌿', x: 3700, y: 1810, s: 60 }, { t: 'emoji', e: '🍃', x: 3960, y: 1850, s: 70 },
    { t: 'emoji', e: '🪵', x: 3820, y: 2050, s: 60 },
    { t: 'fence', x: 3460, y: 2150, w: 660, h: 30, fill: '#9a8a6a' },

    // 売店（4150〜4750）
    { t: 'building', x: 4180, y: 2140, w: 520, h: 300, fill: '#fff4d6', roof: '#e07a3a', sign: '売店 くまさん', signFill: '#e07a3a', signColor: '#fff', awning: '#e9a', windows: true },
    { t: 'sign', x: 4240, y: 1830, w: 180, h: 60, text: 'ソフトクリーム', fill: '#fff', color: '#c35', s: 20 },
    { t: 'emoji', e: '⛱️', x: 4780, y: 2120, s: 90 }, { t: 'emoji', e: '🪑', x: 4740, y: 2240, s: 40 },

    // バク（4800〜5500）
    { t: 'rect', x: 4820, y: 1450, w: 680, h: 700, fill: '#b9a274' },
    { t: 'ellipse', x: 5250, y: 1700, rx: 160, ry: 70, fill: '#6a9fb5' },
    { t: 'emoji', e: '🌿', x: 4900, y: 1550, s: 70 },
    { t: 'fence', x: 4820, y: 2150, w: 680, h: 40, fill: '#7a5a3a' },
    { t: 'sign', x: 5060, y: 1460, w: 120, h: 44, text: 'バク', fill: '#333', color: '#fff', s: 24 },
    ...bench(4940, 2240),

    // オウム（5600〜6200）
    { t: 'rect', x: 5620, y: 1450, w: 620, h: 700, fill: '#c3e3a0' },
    { t: 'rect', x: 5840, y: 1640, w: 16, h: 220, fill: '#7a5a3a' }, { t: 'rect', x: 5760, y: 1640, w: 180, h: 14, fill: '#7a5a3a' },
    { t: 'emoji', e: '🌴', x: 6120, y: 1600, s: 150 }, { t: 'emoji', e: '🌺', x: 5700, y: 1950, s: 50 },
    { t: 'fence', x: 5620, y: 2150, w: 620, h: 36, fill: '#c9a46a' },
    { t: 'sign', x: 5980, y: 1460, w: 220, h: 44, text: 'おしゃべりオウム', fill: '#2a8a4a', color: '#fff', s: 20 },
    ...bench(5700, 2240),

    // 噴水広場（6300〜7150）
    { t: 'ellipse', x: 6750, y: 1800, rx: 300, ry: 140, fill: '#cfc7b4', stroke: '#9a907a' },
    { t: 'ellipse', x: 6750, y: 1790, rx: 250, ry: 110, fill: '#7cc3e0' },
    { t: 'emoji', e: '⛲', x: 6750, y: 1720, s: 130 },
    { t: 'emoji', e: '🌷', x: 6400, y: 2080, s: 40 }, { t: 'emoji', e: '🌷', x: 6460, y: 2100, s: 40 }, { t: 'emoji', e: '🌼', x: 7050, y: 2080, s: 40 },
    { t: 'emoji', e: '🎈', x: 7100, y: 1560, s: 50 },
    ...bench(6400, 1600), ...bench(1200, 2280),
    { t: 'emoji', e: '🗑️', x: 2560, y: 2250, s: 40 }, { t: 'emoji', e: '🗑️', x: 6250, y: 1370, s: 40 },
    { t: 'emoji', e: '🚻', x: 3420, y: 2350, s: 50 },
  ],

  actors: {
    // ── 人間 ──
    manager: {
      name: '園長 大森', x: 360, y: 1180, wander: 90, speed: 50,
      look: { h: 160, hair: 'bald', hairColor: '#777', shirt: '#2f5a3a', pants: '#3a3a3a', acc: ['tie', 'mustache'], wide: true },
      idle: [
        'うちの園は、清潔さと動物のかしこさが自慢でしてね',
        'テレビ取材、来ないかなあ……そわそわ',
        { text: '最近の客は「なにも起きない」って言うんだよなあ……', when: [notDone('S4-E05'), notDone('S4-E14')] },
        { text: 'リポーターさんがこっちを見てる……？ 声をかけてくれないかなあ', when: [done('S4-E05'), done('S4-E14')] },
      ],
    },
    reporter: {
      name: 'リポーター 真鍋', x: 220, y: 1320, wander: 120, speed: 60,
      look: { h: 158, hair: 'bob', hairColor: '#3a2a1a', shirt: '#e05a7a', pants: '#333', skirt: true, acc: ['earring'] },
      idle: [
        'なにか「絵になる」事件はないかしら……',
        '人と動物がなかよし、みたいな映像が撮れたら最高なんだけど',
        { text: 'サル山でバナナさわぎ？ うーん、もうひとネタほしいわね', when: [done('S4-E05'), notDone('S4-E14')] },
        { text: 'ゾウがお片づけ？ いいわね。でも笑いがもうひと押し……', when: [done('S4-E14'), notDone('S4-E05')] },
        { text: '撮れ高はばっちり！ あとは責任者のコメントだけね', when: [done('S4-E05'), done('S4-E14')] },
      ],
    },
    complainer: {
      name: 'ぶつぶつ言う客', x: 700, y: 1360, path: [[640, 1360], [1700, 1380], [2600, 1350], [1700, 1380]], speed: 45,
      look: { h: 152, hair: 'short', hairColor: '#555', shirt: '#8a8a7a', pants: '#4a4a4a', acc: ['cap'], old: true },
      idle: ['ふん、つまらん動物園だ', 'サルはケンカ、カバは昼寝。入園料を返してほしいね', '閉園までに、なにか起きるのかねえ'],
    },
    keeper1: {
      name: '飼育員 柴田', x: 1250, y: 1150, path: [[800, 1150], [1650, 1150]], speed: 40,
      look: { h: 158, hair: 'pony', hairColor: '#4a2e1e', shirt: '#6a8a3a', pants: '#4a5a2a', acc: ['cap'], hatColor: '#6a8a3a' },
      idle: [
        { text: 'またケンカ……。子ザルがまきこまれないといいけど', when: [notDone('S4-E01')] },
        { text: 'こういうのは私が止めるより、群れのリーダーが出るのが一番なのよね', when: [done('S4-E01'), notDone('S4-E02'), notDone('S4-E03')] },
        { text: 'ボスがへそを曲げちゃった……もう知らない', when: [done('S4-E02')] },
        { text: 'ボスの好物？ 売店で売ってる小さいバナナよ。人間は食べちゃダメよ？', when: [done('S4-E03')] },
        '今日はお客さん多いなあ',
      ],
    },
    haruto: {
      name: '男の子 ハルト', x: 980, y: 1200, wander: 80, speed: 70,
      look: { h: 110, kid: true, hair: 'spiky', hairColor: '#222', shirt: '#3a8ae0', pants: '#333' },
      idle: [
        { text: 'サルがケンカしてる！ ……あっ、ちっちゃいのがいる！', when: [notDone('S4-E01')] },
        'ボス猿ってどれ？ いちばん偉そうなやつ？',
        { text: 'お母さんザル、かっこよかった！', when: [done('S4-E01')] },
        { text: 'あの看板、ボス猿の毛並みが自慢なんだって。マネする人いるかな', when: [notDone('S4-E04'), notDone('S4-E05')] },
      ],
    },
    ren: {
      name: '大食いのレン', x: 1500, y: 1250, wander: 90, speed: 55,
      look: { h: 165, hair: 'short', hairColor: '#2a2a2a', shirt: '#f2a03a', pants: '#3a4a6a', wide: true },
      idle: [
        'はらへった……朝から何も食べてない',
        'このへん、なんか食べもの売ってない？',
        { text: 'サルってなに食べてるんだろ。うまそうなもの食べてたりして', when: [notDone('S4-E05')] },
        { text: 'げふっ。サル用でもバナナはバナナ！', when: [done('S4-E05')] },
      ],
    },
    sawako: {
      name: 'マダム 佐和子', x: 1350, y: 1300, wander: 60, speed: 40,
      look: { h: 158, hair: 'bun', hairColor: '#3a2a3a', shirt: '#9a4ac0', pants: '#5a3a6a', skirt: true, acc: ['earring', 'sunglasses'] },
      idle: [
        'あたくしの髪、今朝は三時間かけましたのよ',
        { text: '「自慢は毛並み」ですって？ おサルのくせに生意気ね', when: [notDone('S4-E04')] },
        { text: 'どう？ ボスにも負けないボリュームでしょ', when: [done('S4-E04')] },
      ],
    },
    erika: {
      name: 'モデル風の エリカ', x: 1950, y: 1180, wander: 110, speed: 45,
      look: { h: 168, hair: 'long', hairColor: '#c9a227', shirt: '#fafafa', pants: '#d0b0a0', skirt: true, acc: ['sunglasses', 'bag'] },
      idle: ['クジャクって、羽を広げると本当にきれいなのよね', 'ねえクジャクさん、広げて見せてくれない？', { text: 'あら、さっきの男の人……大丈夫かしら', when: [done('S4-E09')] }],
    },
    masaru: {
      name: '夫 マサル', x: 2150, y: 1220, wander: 50, speed: 45,
      look: { h: 166, hair: 'short', hairColor: '#333', shirt: '#4a6a9a', pants: '#3a3a3a', acc: ['glasses'] },
      idle: [
        'クジャクのオス、ふられてるなあ……わかるぞ',
        { text: '……あっちの女性、きれいだなあ（小声）', when: [notDone('S4-E08')] },
        { text: 'いてて……ほっぺたがまだ熱い', when: [done('S4-E09')] },
      ],
    },
    noriko: {
      name: '妻 ノリコ', x: 2250, y: 1240, wander: 40, speed: 45,
      look: { h: 156, hair: 'bob', hairColor: '#4a2a1a', shirt: '#e08a3a', pants: '#5a4a3a', acc: ['bag'] },
      idle: [
        'うちの人、すぐよそ見するのよ',
        { text: 'クジャクのメスはえらいわね。安い愛想に乗らないもの', when: [notDone('S4-E07')] },
        { text: '……なによ、そこのおサル。こっち見て', when: [done('S4-E09'), notDone('S4-E10')] },
      ],
    },
    tsuchiya: {
      name: '財布をなくした 土屋', x: 2700, y: 1200, wander: 120, speed: 60,
      look: { h: 162, hair: 'short', hairColor: '#5a3a2a', shirt: '#a0c0d0', pants: '#4a4a5a', acc: ['bag'] },
      idle: [
        { text: 'ない、ない……財布がない！ さっきカバを見てたときまではあったのに', when: [notDone('S4-E11')] },
        { text: 'カバって口の中、どうなってるんだろう', when: [notDone('S4-E11')] },
        { text: 'あれは絶対ぼくの財布！ 長い棒みたいなものがあれば……', when: [done('S4-E11'), notDone('S4-E12'), notDone('S4-E13')] },
        { text: '財布もどった！ ……くさいけど', when: [{ anyEventDone: ['S4-E12', 'S4-E13'] }] },
      ],
    },
    cleaner: {
      name: '清掃員 権田', x: 2900, y: 1300, path: [[2450, 1300], [3300, 1320], [3300, 1250], [2450, 1250]], speed: 40,
      look: { h: 160, hair: 'short', hairColor: '#888', shirt: '#3a7ab0', pants: '#2a4a6a', acc: ['cap', 'apron'], hatColor: '#3a7ab0' },
      idle: [
        '動物園はきれいが一番。ゴミひとつ見のがさないぞ',
        'カバくんも一度ゴシゴシ洗ってみたいもんだ',
        { text: 'あそこに何か落ちてる……バナナの皮か？', when: [done('S4-E05'), notDone('S4-E06')] },
        { text: 'ゴミ箱が倒れてる！ でも重くて起こせん……', when: [done('S4-E12'), notDone('S4-E14')] },
        { text: 'ゾウに片づけを教わる日が来るとはなあ', when: [done('S4-E14')] },
      ],
    },
    smoker: {
      name: 'タバコの男', x: 3950, y: 1230, wander: 40, speed: 35,
      look: { h: 168, hair: 'mohawk', hairColor: '#222', shirt: '#555', pants: '#222', acc: ['sunglasses'] },
      idle: ['ふう〜……（禁煙の看板は見ないふり）', '一服くらい、いいだろ', { text: 'げっ、タバコどこ行った？ ……わら、燃えてないよな？', when: [done('S4-E17'), notDone('S4-E19')] }],
    },
    sota: {
      name: 'いたずらっ子 ソウタ', x: 4350, y: 2270, wander: 100, speed: 80,
      look: { h: 112, kid: true, hair: 'spiky', hairColor: '#3a2a1a', shirt: '#e03a3a', pants: '#2a2a5a', acc: ['cap'] },
      idle: [
        'ねー、なんかおいしいもの食べたい〜',
        { text: 'ミオだけアイス買ってもらってずるい！', when: [{ objectVisible: 'icecream' }, notDone('S4-E17')] },
        { text: 'ゾウってシャワー持ってるみたいだね！', when: [done('S4-E16')] },
        { text: 'ちぇっ、ゾウの鼻、反則だよ……', when: [done('S4-E18')] },
      ],
    },
    mio: {
      name: '妹 ミオ', x: 4500, y: 2290, wander: 40, speed: 50,
      look: { h: 100, kid: true, hair: 'twin', hairColor: '#3a2a1a', shirt: '#f7b6d0', pants: '#7a5aa0', skirt: true },
      idle: [
        { text: 'アイス食べたいなあ……', when: [{ not: { objectVisible: 'icecream' } }, notDone('S4-E17')] },
        { text: 'アイスかってもらった！ お兄ちゃんにはあげない！', when: [{ objectVisible: 'icecream' }, notDone('S4-E17')] },
        { text: 'うえーん！ だれか、あのアイスとりかえしてー！', when: [done('S4-E17'), notDone('S4-E18')] },
        { text: 'ゾウさん、だいすき！', when: [done('S4-E18')] },
      ],
    },
    kazuma: {
      name: '昼寝中の カズマ', x: 5010, y: 2235, wander: 0, speed: 60,
      look: { h: 166, hair: 'afro', hairColor: '#2a2a2a', shirt: '#7aa07a', pants: '#4a4a3a', sit: true },
      idle: [
        { text: 'うう……くるな……ライオン……（うなされている）', when: [notDone('S4-E20')] },
        { text: 'ZZZ……たてがみが……せまってくる……', when: [notDone('S4-E20')] },
        { text: 'ほ、本物はやっぱりこわい！ 高いところ、高いところ……', when: [done('S4-E20'), notDone('S4-E21')] },
        { text: '木の上は安全……だよね？ おりられないけど', when: [done('S4-E21')] },
      ],
    },
    yui: {
      name: 'リボンの ユイ', x: 1350, y: 2280, wander: 90, speed: 55,
      look: { h: 108, kid: true, hair: 'twin', hairColor: '#6a4a2a', shirt: '#b08060', pants: '#5a3a2a', skirt: true, acc: ['ribbon'] },
      idle: ['このリボン、もふもふでかわいいでしょ？', 'カンガルーのおなか、なにか入ってるのかな', { text: 'タヌキにまちがえるなんて、しつれいしちゃう！', when: [done('S4-E22')] }],
    },
    keeper2: {
      name: '飼育員 野々村', x: 1700, y: 2290, path: [[1050, 2290], [2550, 2300], [3300, 2280], [2550, 2300]], speed: 50,
      look: { h: 162, hair: 'short', hairColor: '#2a2a2a', shirt: '#6a8a3a', pants: '#4a5a2a', acc: ['cap', 'glasses'], hatColor: '#6a8a3a' },
      idle: [
        { text: 'タヌキが一匹逃げたらしい。耳がまるくて茶色くて……', when: [notDone('S4-E22')] },
        { text: 'うさぎ小屋の数が合わない……一羽どこ行った？', when: [notDone('S4-E38')] },
        { text: 'タヌキは化けるっていうけど、しっぽまでは隠せないはず', when: [done('S4-E22'), notDone('S4-E23')] },
        { text: 'ウサギは物音に敏感でね。子どもの声がすると、ひょっこり顔を出すんだけど', when: [done('S4-E38'), notDone('S4-E39')] },
      ],
    },
    tanukiGirl: {
      name: 'しっぽの女の子', x: 3150, y: 2300, wander: 70, speed: 50,
      look: { h: 104, kid: true, hair: 'bob', hairColor: '#7a5a3a', shirt: '#a07a50', pants: '#6a4a2a', skirt: true, acc: ['flower'] },
      idle: ['……ポン。', 'わたし、ふつうの女の子だよ？ ほんとだよ？', '（スカートのうしろから、ふさふさの何かが……）'],
    },
    kenta: {
      name: '観察好きの ケンタ', x: 6250, y: 1240, wander: 80, speed: 70,
      look: { h: 114, kid: true, hair: 'short', hairColor: '#222', shirt: '#4ab08a', pants: '#3a3a3a', acc: ['glasses', 'cap'] },
      idle: [
        { text: 'パンダ舎の中、ここからじゃ見えないなあ。高いところからなら……', when: [notDone('S4-E26')] },
        'カメレオンって、ほんとうに消えるのかな？',
        { text: 'おりられない……だれか背の高い人……', when: [done('S4-E26'), notDone('S4-E27')] },
        { text: 'いま、カメレオンが消えた！？ 消えたように見えるだけだよね', when: [done('S4-E33'), notDone('S4-E34')] },
      ],
    },
    fans: {
      name: 'パンダ観覧客', x: 6600, y: 1240, wander: 120, speed: 40,
      look: { h: 158, hair: 'long', hairColor: '#222', shirt: '#fafafa', pants: '#222', acc: ['camera', 'headphones'] },
      idle: ['ミルクちゃん、こっち向いてー！', 'ゴロスケくんの塩対応、たまらない……', 'パンダが一番かわいい瞬間を撮りたいの'],
    },
    ryu: {
      name: 'パンクな リュウ', x: 760, y: 1330, path: [[700, 1330], [300, 1360], [700, 1330], [1000, 1360]], speed: 55,
      look: { h: 170, hair: 'mohawk', hairColor: '#e03a8a', shirt: '#222', pants: '#333', acc: ['earring', 'sunglasses'] },
      idle: [
        'トゲトゲ頭はロックの魂だぜ',
        'オレと張りあえるトゲ、どっかにいねえかな',
        { text: '売店の横の小さい館、なんかチクチクしたやつがいるな……', when: [flag('punk.atKiosk')] },
      ],
    },
    takumi: {
      name: 'そわそわ タクミ', x: 5760, y: 2245, wander: 0, speed: 50,
      look: { h: 166, hair: 'short', hairColor: '#3a2a1a', shirt: '#fafafa', pants: '#3a4a6a', acc: ['tie'], sit: true },
      idle: [
        { text: 'もうすぐデートの相手が来る……なんて言えばいいんだ……', when: [notDone('S4-E41'), notDone('S4-E32')] },
        { text: 'だれか、気のきいたセリフを教えてくれないかな……', when: [notDone('S4-E41'), notDone('S4-E32')] },
        { text: 'まだ世界がぐるぐるしてる……', when: [done('S4-E32')] },
        { text: 'うまく言えた……！ でも、だれかに聞かれてないよな？', when: [done('S4-E41'), notDone('S4-E40')] },
      ],
    },
    saki: {
      name: 'デートの相手 サキ', x: 6500, y: 2300, hidden: true, wander: 30, speed: 70,
      look: { h: 158, hair: 'long', hairColor: '#5a3a2a', shirt: '#f7d0a0', pants: '#7a9aba', skirt: true, acc: ['bag'] },
      idle: ['タクミくん、今日はなんだか緊張してる？', 'オウムってなんでもマネするのね'],
    },
    kai: {
      name: '男の子 カイ', x: 520, y: 2280, wander: 90, speed: 70,
      look: { h: 108, kid: true, hair: 'short', hairColor: '#222', shirt: '#f2d03a', pants: '#3a6ab0' },
      idle: ['ヤギさん、なんでも食べるんだって！', 'ヤギさんのごはん、どこで売ってるの？', { text: 'ヤギって紙が好きなんだ！ ほかに紙ないかなあ', when: [done('S4-E36'), notDone('S4-E37')] }],
    },
    kaiDad: {
      name: 'カイの父', x: 700, y: 2290, wander: 50, speed: 45,
      look: { h: 170, hair: 'short', hairColor: '#333', shirt: '#7a9a6a', pants: '#4a4a4a', acc: ['glasses', 'bag'] },
      idle: [
        'カイ、あんまり柵に近づくなよ',
        { text: 'さっきから向こうが騒がしいな。何があったんだ？', when: [{ not: { objectVisible: 'map' } }, notDone('S4-E36')] },
        { text: 'ええと、地図によると次は……', when: [{ objectVisible: 'map' }, notDone('S4-E36')] },
        { text: '地図が……。ま、まさか財布の中身までは……', when: [done('S4-E36'), notDone('S4-E37')] },
      ],
    },
    twins: {
      name: '双子のアオとミドリ', x: 5400, y: 1230, wander: 40, speed: 80,
      look: { h: 106, kid: true, hair: 'bob', hairColor: '#222', shirt: '#5ab0e0', pants: '#4ab05a', acc: ['cap'] },
      idle: [
        { text: 'ねえおじいちゃん、キリンってなんで首が長いの？', when: [notDone('S4-E42')] },
        'つぎはどこ行く？ どこ行く？',
        { text: 'おサルのお尻って、なんで赤いの？', when: [done('S4-E42'), notDone('S4-E43')] },
        { text: 'ゾウさんのお鼻、なんであんなに長いの？', when: [done('S4-E43'), notDone('S4-E44')] },
        { text: 'ウサギの目って、なんで赤いの？', when: [done('S4-E44'), notDone('S4-E45')] },
      ],
    },
    grandpa: {
      name: '祖父', x: 5560, y: 1250, wander: 30, speed: 60,
      look: { h: 150, hair: 'bald', hairColor: '#ddd', shirt: '#8a7a5a', pants: '#4a4a3a', acc: ['beard', 'hat'], hatColor: '#6a5a3a', old: true },
      idle: [
        '動物のことなら、なんでも聞いとくれ',
        'わしも若いころは、動物博士と呼ばれたもんじゃ',
        { text: 'ふう、ふう……ちと歩きすぎたかのう。どこか腰かけられる岩でも……', when: [done('S4-E45'), notDone('S4-E46')] },
      ],
    },

    // ── 動物 ──
    boss: {
      name: 'ボス猿 ドンガラ', emoji: '🐒', size: 96, x: 1200, y: 520, wander: 40, speed: 40,
      idle: ['ウキ。（いちばん高いところが、わしの席）', { text: 'ウッキー……（若い者はけんかばかりじゃ）', when: [notDone('S4-E03')] }, { text: 'ウキッ♪（バナナうまい）', when: [done('S4-E03')] }],
    },
    fight: {
      name: 'ケンカ中のサルたち', emoji: '🐒', size: 80, x: 1150, y: 880, wander: 70, speed: 160,
      idle: ['キーッ！ キキーッ！', 'ギャッギャッ！（それオレの石！）', 'ウキャーッ！'],
    },
    momMonkey: {
      name: '母ザル', emoji: '🐒', size: 68, x: 880, y: 820, wander: 40, speed: 50,
      idle: [{ text: 'ウキ……（坊や、どこ行ったの）', when: [notDone('S4-E01')] }, { text: 'ウキ〜（もう離さないわ）', when: [done('S4-E01')] }],
    },
    kozaru: {
      name: '子ザル', emoji: '🐒', size: 42, x: 1230, y: 900, wander: 50, speed: 90,
      idle: ['キッ？', { text: 'キキッ！（パシーン！ ごっこ）', when: [done('S4-E09')] }, 'キ〜（おなかすいた）'],
    },
    peacock: {
      name: 'オスのクジャク', emoji: '🦚', size: 92, x: 2000, y: 880, wander: 90, speed: 45,
      idle: ['クェーッ！（見て見て、ぼくを見て！）', { text: '……（メスに相手にされず、しょんぼり）', when: [done('S4-E07')] }, 'クェッ（もっときれいな人が見てくれたら、本気出すのに）'],
    },
    peahen: {
      name: 'メスのクジャク', emoji: '🐦', size: 58, x: 2250, y: 940, wander: 70, speed: 40,
      idle: ['クッ。（興味ないわ）', '……（地面の虫をつついている）'],
    },
    hippo: {
      name: 'カバ', emoji: '🦛', size: 150, x: 2880, y: 900, wander: 30, speed: 25,
      idle: ['ブフォ〜……（あくび）', '（口がもごもご……何かはさまってる？）', { text: 'ブホッ（鼻がむずむずする）', when: [done('S4-E11'), notDone('S4-E12'), notDone('S4-E13')] }],
    },
    bird: {
      name: 'カバの相棒の小鳥', emoji: '🐦', size: 40, x: 3120, y: 760, wander: 90, speed: 80,
      idle: ['チュン（カバくんの歯そうじ係です）', 'チチッ（はさまったものは、つい取りたくなる）'],
    },
    elephant: {
      name: 'ゾウ', emoji: '🐘', size: 180, x: 3750, y: 930, wander: 160, speed: 45,
      idle: ['パオ〜（鼻はなんでもつかめるよ）', '（水たまりのほうをチラチラ見ている）', { text: 'パオ？（さっき、外で何か倒れた音が）', when: [done('S4-E12'), notDone('S4-E14')] }, { text: 'パオッ（片づけ、とくい）', when: [done('S4-E14')] }],
    },
    lion: {
      name: 'ライオン', emoji: '🦁', size: 125, x: 4720, y: 900, wander: 140, speed: 50,
      idle: ['ガウ……（昼寝したい）', 'グルル……（たてがみ、今日もきまってる）', { text: 'ガウ？（木の上のあいつ、なにしてる？）', when: [done('S4-E21')] }],
    },
    tapir: {
      name: 'バク', emoji: '🐗', size: 96, x: 5050, y: 1800, wander: 120, speed: 40,
      idle: ['フゴ……（ゆめ、たべたい）', 'フゴフゴ（悪い夢ほど、においが強い）', { text: 'フゴッ！（ボクのごはん、返して！）', when: [done('S4-E24')] }],
    },
    giraffe: {
      name: '大人キリン', emoji: '🦒', size: 230, x: 5500, y: 930, wander: 140, speed: 40,
      idle: ['ムォ……（高いところは、まかせて）', '（となりのバク舎のエサをじっと見ている）', 'ムォ〜（首が長いと、いろいろ届く）'],
    },
    babyGiraffe: {
      name: '子キリン', emoji: '🦒', size: 110, x: 5720, y: 980, wander: 90, speed: 50,
      idle: ['ミュ〜（あの葉っぱ、とどかない）', { text: 'ミュ♪（おいしかった）', when: [done('S4-E25')] }],
    },
    milk: {
      name: 'パンダのミルク', emoji: '🐼', size: 92, x: 6400, y: 900, wander: 100, speed: 35,
      idle: ['（ごろーん）', 'ムシャムシャ（笹おいしい）', '（遊び道具を探している）'],
    },
    gorosuke: {
      name: 'パンダのゴロスケ', emoji: '🐼', size: 108, x: 6750, y: 1000, wander: 90, speed: 35,
      idle: ['フンッ（見るな）', '（客に背中を向けている）', 'ガル……（丸いもの、きらい）'],
    },
    hedgehog: {
      name: 'ハリネズミ', emoji: '🦔', size: 50, x: 3700, y: 2080, wander: 60, speed: 30,
      idle: ['ピス……（トゲには自信あり）', 'ピスピス（ライバル、いないかな）'],
    },
    chameleon: {
      name: 'カメレオン', emoji: '🦎', size: 52, x: 3900, y: 2040, wander: 30, speed: 15,
      idle: ['（目がぐるぐる別々に動いている）', '……（びっくりすると、すぐ色が変わる）'],
    },
    goat: {
      name: 'ヤギ', emoji: '🐐', size: 80, x: 450, y: 1900, wander: 160, speed: 50,
      idle: ['メェ〜（紙、おいしい）', 'メェ（なんでもかじってみる主義）', { text: 'メェ〜（もっと紙！）', when: [done('S4-E36')] }],
    },
    kangaroo: {
      name: 'カンガルー', emoji: '🦘', size: 125, x: 1330, y: 1850, wander: 0, speed: 50,
      idle: ['（おなかの袋が、もぞもぞ動いている）', 'ピョン？（袋が重い気がする）'],
    },
    parrot: {
      name: 'オウム', emoji: '🦜', size: 62, x: 5850, y: 1640, wander: 20, speed: 30,
      idle: ['オハヨー！ オハヨー！', 'キイタコト、ナンデモ、マネスル！', { text: 'キミノホウガ……カワイイヨ……（練習中）', when: [done('S4-E41'), notDone('S4-E40')] }],
    },
    babyTurtle: {
      name: '子ガメ', emoji: '🐢', size: 36, x: 2900, y: 1900, wander: 80, speed: 12,
      idle: ['ノソ……（高いところから景色を見たい）', { text: 'ノソノソ（あの大きいのに、のぼりたい）', when: [done('S4-E46'), notDone('S4-E47')] }],
    },
  },

  objects: {
    // サル山
    monkeySign: { name: 'サル山の看板', sign: { text: 'ボス猿ドンガラ 自慢は毛並み', fill: '#f6e7b0', color: '#5a3a1a', s: 18 }, w: 220, h: 70, x: 1050, y: 1180 },
    bananaPeel: { name: 'バナナの皮', emoji: '🍌', size: 34, x: 1560, y: 1330, hidden: true, rot: 2.6 },
    endPeel: { name: 'バナナの皮', emoji: '🍌', size: 34, x: 770, y: 1270, hidden: true, capturable: false, rot: 0.8 },
    // カバ
    hippoMouth: { name: 'カバの口（キラッ）', emoji: '✨', size: 30, x: 2840, y: 860, minZoom: 1.3 },
    walletInMouth: { name: 'カバの口の財布', emoji: '👛', size: 34, x: 2840, y: 870, hidden: true },
    brush: { name: 'デッキブラシ', emoji: '🧹', size: 56, x: 2560, y: 1180, rot: 0.3 },
    trashStanding: { name: 'ゴミ箱', emoji: '🗑️', size: 50, x: 3380, y: 1180 },
    trashFallen: { name: '倒れたゴミ箱', emoji: '🗑️', size: 50, x: 3380, y: 1190, hidden: true, rot: 1.6 },
    // ゾウ・売店
    puddle: { name: '象舎の水たまり', emoji: '💧', size: 48, x: 3620, y: 1000 },
    icecream: { name: 'ミオのアイス', emoji: '🍦', size: 36, x: 4530, y: 2250, hidden: true },
    stolenIce: { name: '奪われたアイス', emoji: '🍦', size: 36, x: 4090, y: 1230, hidden: true },
    cigarette: { name: '落ちたタバコ', emoji: '🚬', size: 30, x: 3990, y: 1270, hidden: true, minZoom: 1.1 },
    // バク・ライオン
    nightmare: { name: 'うなされる夢', emoji: '💭', size: 60, x: 5050, y: 2120 },
    lionTree: { name: 'ライオン舎そばの木', emoji: '🌳', size: 170, x: 4320, y: 1260 },
    tapirFood: { name: 'バクのエサ', emoji: '🥬', size: 40, x: 5250, y: 1500 },
    // キリン・パンダ
    pandaTree: { name: 'パンダ舎そばの木', emoji: '🌳', size: 180, x: 6100, y: 1240 },
    tire: { name: 'タイヤ', emoji: '🛞', size: 56, x: 6600, y: 990 },
    // 小動物館
    hiddenCham: { name: '葉っぱの……何か？', emoji: '🦎', size: 24, x: 3620, y: 1840, hidden: true, minZoom: 1.6, rot: 0.4 },
    // ヤギ・カンガルー・ウサギ
    map: { name: '園内マップ', emoji: '🗺️', size: 40, x: 760, y: 2240, hidden: true },
    pouch: { name: 'カンガルーの袋', emoji: '👝', size: 28, x: 1345, y: 1830, minZoom: 1.3 },
    strayRabbit: { name: '木のそばのウサギ', emoji: '🐇', size: 40, x: 2460, y: 1700, hidden: true },
    // カメの池
    rock: { name: '池のほとりの大きな岩', emoji: '🪨', size: 96, x: 3220, y: 2090 },
    bigTurtle: { name: '親ガメ', emoji: '🐢', size: 100, x: 3220, y: 2090, hidden: true },
    tanuki: { name: 'タヌキ', emoji: '🦝', size: 60, x: 3150, y: 2300, hidden: true, capturable: false },

    // ── イベントのない小物（ダミー） ──
    mapBoard: { name: '園内案内板', sign: { text: '園内マップ', fill: '#2f7a4a', color: '#fff', s: 22 }, w: 160, h: 90, x: 600, y: 1290 },
    balloon: { name: '風船', emoji: '🎈', size: 46, x: 940, y: 1150 },
    popcorn: { name: 'ポップコーン', emoji: '🍿', size: 34, x: 6460, y: 1590, minZoom: 1.1 },
    juice: { name: 'ジュース', emoji: '🧃', size: 30, x: 4740, y: 2210, minZoom: 1.1 },
    hat: { name: '麦わら帽子', emoji: '👒', size: 40, x: 2300, y: 1330 },
    guidebook: { name: 'ガイドブック', emoji: '📘', size: 30, x: 1260, y: 2265, minZoom: 1.1 },
    bamboo: { name: '笹', emoji: '🎋', size: 50, x: 6950, y: 1060 },
    carrot: { name: 'ニンジン', emoji: '🥕', size: 32, x: 2050, y: 2000 },
    feedMachine: { name: 'エサの自販機', sign: { text: 'エサ 100円', fill: '#e0a03a', color: '#fff', s: 18 }, w: 90, h: 110, x: 900, y: 2280 },
    camera: { name: '置き忘れのカメラ', emoji: '📷', size: 30, x: 5720, y: 2215, minZoom: 1.2 },
    bottle: { name: 'ペットボトル', emoji: '🧴', size: 28, x: 3480, y: 1360, minZoom: 1.1 },
    stroller: { name: 'ベビーカー', emoji: '🛒', size: 52, x: 6950, y: 2260 },
  },

  paths: {},

  reactions: [
    { s: 'mapBoard', t: 'goat', say: 'メェ……（大きすぎて食べられない）', anim: 'react.shrug' },
    { s: 'bananaPeel', t: 'ren', say: 'それはもう食べたあとだよ', anim: 'react.shrug' },
    { s: 'tire', t: 'fans', say: 'タイヤ？ パンダが遊んでるところが見たいの！', anim: 'react.shrug' },
    { s: 'brush', t: 'hippo', say: 'ブフ？（だれが持つの？）', anim: 'react.think' },
    { s: 'icecream', t: 'elephant', say: 'パオ？（それはあの子のでしょ）', anim: 'react.shrug' },
    { s: 'carrot', t: 'kangaroo', say: 'ピョン（袋が重くて、いまはいい）', anim: 'react.shrug' },
    { s: 'lion', t: 'kazuma', say: 'ZZZ……うう、たてがみ……', anim: 'react.sleep', when: [notDone('S4-E20')] },
    { s: 'complainer', t: 'manager', say: 'お客様のご意見、たしかにうけたまわりました……', anim: 'react.sad' },
    { s: 'popcorn', t: 'goat', say: 'メェ？（遠くて届かない）', anim: 'react.shrug' },
  ],

  timeline: [
    // カバの大あくび（財布のヒント）
    { every: 22000, start: 12000, when: [notDone('S4-E11')], effects: [{ type: 'ACTOR_SPEECH', actorId: 'hippo', text: 'ブファ〜〜（大あくび。口の奥で何かがキラッ）' }, { type: 'FX', kind: 'sparkle', at: 'hippoMouth' }] },
    // パンクなリュウ、売店へ
    { at: 50000, effects: [
      { type: 'ACTOR_SPEECH', actorId: 'ryu', text: 'のどかわいた。売店でも行くか' },
      { type: 'ACTOR_MOVE', actorId: 'ryu', to: [4000, 2280], speed: 160, wander: 60 },
      { type: 'SET_FLAG', id: 'punk.atKiosk', value: true },
    ] },
    // ミオ、アイスを買ってもらう
    { at: 60000, when: [notDone('S4-E16'), notDone('S4-E17')], effects: [
      { type: 'SPAWN_OBJECT', objectId: 'icecream' },
      { type: 'ACTOR_SPEECH', actorId: 'mio', text: 'やったー！ ソフトクリーム！' },
      { type: 'ACTOR_SET_STATE', actorId: 'mio', state: 'HAPPY' },
      { type: 'ACTOR_SPEECH', actorId: 'sota', text: 'あっ、ミオだけずるい！', delayMs: 1800 },
    ] },
    // 迷子ウサギ：飼育員が袋で見つけた後、双子がウサギ舎に来ると顔を出す
    { every: 3000, start: 3000, when: [done('S4-E38'), done('S4-E44'), notDone('S4-E39'), { not: { objectVisible: 'strayRabbit' } }], effects: [
      { type: 'SPAWN_OBJECT', objectId: 'strayRabbit' },
      { type: 'FX', kind: 'leaves', at: 'strayRabbit' },
      { type: 'ACTOR_SPEECH', actorId: 'twins', text: 'あっ！ 木のところに白いのがいる！' },
    ] },
    // 閉園が近い
    { at: 240000, effects: [{ type: 'ACTOR_SPEECH', actorId: 'manager', text: 'もうすぐ閉園か……今日もテレビは来なかったなあ' }, { type: 'PLAY_SOUND', soundId: 'bell' }] },
  ],

  events: [
    // ── サル山 ──
    { id: 'S4-E01', s: 'fight', t: 'haruto', cat: 'CHAIN', title: 'ハルトの声で、母ザルが子ザルを救出', say: 'あぶない！ ちっちゃいのがまきこまれてる！', anim: 'react.surprised', route: 'S4.route.monkey',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'momMonkey', to: [1200, 900], speed: 260, wander: 0 },
        { type: 'ACTOR_MOVE', actorId: 'kozaru', to: [880, 830], speed: 220, wander: 30, delayMs: 1200 },
        { type: 'ACTOR_MOVE', actorId: 'momMonkey', to: [900, 820], speed: 220, wander: 30, delayMs: 1200 },
        { type: 'FX', kind: 'hearts', at: 'momMonkey', delayMs: 2400 },
        { type: 'ACTOR_SET_STATE', actorId: 'haruto', state: 'HAPPY', delayMs: 2400 },
      ],
      after: [{ actor: 'keeper1', text: 'よかった……でもケンカはまだ続いてる。私が出ていくと、かえってこじれるのよね', delay: 3600 }] },
    { id: 'S4-E02', s: 'fight', t: 'keeper1', cat: 'BRANCH', decoy: true, title: '飼育員、ケンカに割って入ってボロボロ', say: 'こらー！ やめなさーい！', anim: 'react.run', route: 'S4.route.monkey',
      requires: ['S4-E01'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'keeper1', to: [1150, 1120], speed: 200 },
        { type: 'FX', kind: 'smoke', at: 'fight', delayMs: 1000 },
        { type: 'PLAY_SOUND', soundId: 'crash', delayMs: 1000 },
        { type: 'ACTOR_APPEARANCE', actorId: 'keeper1', look: { hair: 'afro' }, delayMs: 1600 },
        { type: 'ACTOR_SET_STATE', actorId: 'keeper1', state: 'SAD', delayMs: 1800 },
        { type: 'ACTOR_SPEECH', actorId: 'boss', text: 'フンッ（人間が口を出しおって。知らん）', delayMs: 2600 },
      ],
      after: [{ actor: 'keeper1', text: 'ボスの顔をつぶしちゃった……もう誰も止められないわ', delay: 4200 }] },
    { id: 'S4-E03', s: 'fight', t: 'boss', cat: 'PROGRESSION', title: 'ボス猿の一喝でケンカがおさまる', say: 'ウキャーーッ！！（しずまれい！）', anim: 'react.angry', route: 'S4.route.monkey', sound: 'roar',
      requires: ['S4-E01'], blocksIfCompleted: ['S4-E02'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'boss', to: [1160, 820], speed: 220, wander: 20 },
        { type: 'FX', kind: 'big', at: 'boss', delayMs: 900 },
        { type: 'ACTOR_MOVE', actorId: 'fight', to: [1450, 760], speed: 200, wander: 30, delayMs: 1300 },
        { type: 'ACTOR_SPEECH', actorId: 'fight', text: 'キ、キィ……（すんません）', delayMs: 1700 },
        { type: 'ACTOR_SPEECH', actorId: 'keeper1', text: 'さすがボス！ ごほうびに好物をあげなきゃ', delayMs: 2800 },
        { type: 'OBJECT_APPEARANCE', objectId: 'monkeySign', look: { sign: { text: 'ボスの好物 モンキーバナナ', fill: '#fff3a0', color: '#7a4a1a', s: 18 } }, delayMs: 3400 },
        { type: 'FX', kind: 'sparkle', at: 'monkeySign', delayMs: 3400 },
        { type: 'SET_FLAG', id: 'monkey.calm', value: true },
      ],
      after: [{ actor: 'ren', text: 'ん？ 看板が書きかわった？ ……なになに、バナナ？', delay: 4600 }] },
    { id: 'S4-E04', s: 'monkeySign', t: 'sawako', cat: 'FLAVOR', title: '佐和子、ボス猿に毛並みで対抗', say: '毛並み自慢？ あたくしだって負けませんことよ！', anim: 'react.transform', route: 'S4.route.monkey',
      blocksIfCompleted: ['S4-E05'],
      fx: [
        { type: 'FX', kind: 'smoke', at: 'sawako', delayMs: 700 },
        { type: 'ACTOR_APPEARANCE', actorId: 'sawako', look: { hair: 'afro', hairColor: '#c9a227' }, delayMs: 1000 },
        { type: 'FX', kind: 'sparkle', at: 'sawako', delayMs: 1100 },
        { type: 'ACTOR_SPEECH', actorId: 'haruto', text: 'おばちゃんの頭、ボスよりすごい！', delayMs: 2300 },
        { type: 'ACTOR_SPEECH', actorId: 'boss', text: 'ウ、ウキ……（負けた）', delayMs: 3600 },
      ] },
    { id: 'S4-E05', s: 'monkeySign', t: 'ren', cat: 'PROGRESSION', title: 'レン、サル用バナナを平らげて皮をポイ', say: 'モンキーバナナ！ ……サル用？ いや、ひと房いただきます！', anim: 'react.eat', route: 'S4.route.monkey',
      requires: ['S4-E03'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'ren', to: [1540, 1300], speed: 140 },
        { type: 'SPAWN_OBJECT', objectId: 'bananaPeel', delayMs: 1800 },
        { type: 'PLAY_SOUND', soundId: 'pop', delayMs: 1800 },
        { type: 'ACTOR_SPEECH', actorId: 'boss', text: 'ウキーッ！？（わしのバナナが！）', delayMs: 2400 },
        { type: 'ACTOR_SET_STATE', actorId: 'boss', state: 'ANGRY', delayMs: 2400 },
        { type: 'SET_FLAG', id: 'monkey.bananaCraze', value: true },
        { type: 'SPAWN_OBJECT', objectId: 'map', delayMs: 3000 },
        { type: 'ACTOR_SPEECH', actorId: 'kaiDad', text: 'サル山のほうが騒がしいな。地図、地図……', delayMs: 3200 },
      ],
      after: [{ actor: 'reporter', text: 'いまサル山でバナナさわぎ？ ……ちょっと気になるわね', delay: 4400 }] },
    { id: 'S4-E06', s: 'bananaPeel', t: 'cleaner', cat: 'FLAVOR', title: '清掃員、バナナの皮ですべりかける', say: 'ポイ捨て禁止！ ……うおっとっと！', anim: 'react.fall', route: 'S4.route.monkey',
      requires: ['S4-E05'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'cleaner', to: [1580, 1320], speed: 260 },
        { type: 'HIDE_OBJECT', objectId: 'bananaPeel', delayMs: 2200 },
        { type: 'ACTOR_SPEECH', actorId: 'cleaner', text: 'ふう。園長に見られたら大目玉だったぞ', delayMs: 2600 },
        { type: 'ACTOR_MOVE', actorId: 'cleaner', to: [2900, 1300], speed: 120, wander: 60, delayMs: 4200 },
      ] },

    // ── クジャク ──
    { id: 'S4-E07', s: 'peahen', t: 'peacock', cat: 'FLAVOR', title: 'クジャクの求愛、空ぶり', say: 'クェーッ！（ほら、ぼくの羽を見て！）', anim: 'react.love', route: 'S4.route.peacock',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'peacock', to: [2180, 930], speed: 120 },
        { type: 'ACTOR_MOVE', actorId: 'peahen', to: [2360, 1000], speed: 90, delayMs: 1000 },
        { type: 'ACTOR_SPEECH', actorId: 'peahen', text: '……（ガン無視）', delayMs: 1400 },
        { type: 'ACTOR_SET_STATE', actorId: 'peacock', state: 'SAD', delayMs: 2200 },
      ],
      after: [{ actor: 'masaru', text: 'わかる、わかるぞクジャク……', delay: 3200 }] },
    { id: 'S4-E08', s: 'erika', t: 'peacock', cat: 'CHAIN', title: 'クジャク、美女の前で羽を全開', say: 'クェェーーッ！！（本気モード！）', anim: 'react.sparkle', route: 'S4.route.peacock',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'peacock', to: [1950, 1000], speed: 140 },
        { type: 'FX', kind: 'confetti', at: 'peacock', delayMs: 1000 },
        { type: 'FX', kind: 'sparkle', at: 'peacock', delayMs: 1200 },
        { type: 'ACTOR_MOVE', actorId: 'erika', to: [1960, 1170], speed: 100 },
        { type: 'ACTOR_SPEECH', actorId: 'erika', text: 'まあ、なんてきれい！', delayMs: 1600 },
        { type: 'ACTOR_MOVE', actorId: 'masaru', to: [2060, 1190], speed: 90, delayMs: 2200 },
        { type: 'ACTOR_SPEECH', actorId: 'masaru', text: 'ほんとだ、きれいだ……（クジャクじゃないほうを見ながら）', delayMs: 2800 },
        { type: 'SET_FLAG', id: 'masaru.staring', value: true },
      ],
      after: [{ actor: 'noriko', text: '……ちょっと。あなた、どこ見てるの？', delay: 4600 }] },
    { id: 'S4-E09', s: 'masaru', t: 'noriko', cat: 'CHAIN', title: 'ノリコの平手打ち', say: 'あなた！ 鼻の下がのびてるわよ！', anim: 'react.angry', route: 'S4.route.peacock', sound: 'hit',
      requires: ['S4-E08'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'noriko', to: [2110, 1200], speed: 200 },
        { type: 'FX', kind: 'stars', at: 'masaru', delayMs: 900 },
        { type: 'PLAY_SOUND', soundId: 'hit', delayMs: 900 },
        { type: 'ACTOR_SET_STATE', actorId: 'masaru', state: 'EMBARRASSED', delayMs: 1000 },
        { type: 'ACTOR_SPEECH', actorId: 'masaru', text: 'いてっ！ ク、クジャクを見てただけだって！', delayMs: 1600 },
        { type: 'ACTOR_MOVE', actorId: 'kozaru', to: [1660, 1010], speed: 200, wander: 10, delayMs: 2000 },
      ],
      after: [{ actor: 'kozaru', text: 'キキッ！（いまの、おもしろい！）', delay: 3600 }] },
    { id: 'S4-E10', s: 'kozaru', t: 'noriko', cat: 'FLAVOR', title: '子ザル、平手打ちをマネしてノリコ激怒', say: 'なによ、おサルまでバカにして！ もう帰るわよ！', anim: 'react.angry', route: 'S4.route.peacock',
      requires: ['S4-E09'],
      fx: [
        { type: 'ACTOR_SPEECH', actorId: 'kozaru', text: 'キッ！ キッ！（パシーン、パシーン）', delayMs: 300 },
        { type: 'FX', kind: 'fire', at: 'noriko', delayMs: 1000 },
        { type: 'ACTOR_MOVE', actorId: 'noriko', to: [1850, 1360], speed: 160, delayMs: 1600 },
        { type: 'ACTOR_MOVE', actorId: 'masaru', to: [1950, 1370], speed: 140, delayMs: 2200 },
        { type: 'ACTOR_SPEECH', actorId: 'masaru', text: 'ま、待ってくれ〜', delayMs: 2400 },
      ] },

    // ── カバと財布 ──
    { id: 'S4-E11', s: 'hippoMouth', t: 'tsuchiya', cat: 'CHAIN', title: '土屋、カバの口に財布を発見', say: 'あーっ！ カバの口に……ぼくの財布！？', anim: 'react.surprised', route: 'S4.route.hippo',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'tsuchiya', to: [2800, 1170], speed: 180, wander: 30 },
        { type: 'HIDE_OBJECT', objectId: 'hippoMouth', delayMs: 600 },
        { type: 'SPAWN_OBJECT', objectId: 'walletInMouth', delayMs: 600 },
        { type: 'ACTOR_SPEECH', actorId: 'hippo', text: 'ブフ？（なんか歯にはさまってる）', delayMs: 1800 },
        { type: 'ACTOR_SPEECH', actorId: 'bird', text: 'チチッ（気になる……取りたい……）', delayMs: 3000 },
      ],
      after: [{ actor: 'tsuchiya', text: '手じゃ届かない……なにか長い柄のついたものは……', delay: 4200 }] },
    { id: 'S4-E12', s: 'brush', t: 'tsuchiya', cat: 'PROGRESSION', group: 's4-wallet', title: 'ブラシでくすぐられたカバ、大くしゃみ', say: 'このブラシでカバさんの鼻を、こちょこちょ……', anim: 'react.think', route: 'S4.route.hippo',
      requires: ['S4-E11'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'tsuchiya', to: [2820, 1140], speed: 120 },
        { type: 'ACTOR_SPEECH', actorId: 'hippo', text: 'ブ……ブ……ブェーックション！！', delayMs: 1400 },
        { type: 'FX', kind: 'splash', at: 'hippo', delayMs: 1800 },
        { type: 'PLAY_SOUND', soundId: 'boom', delayMs: 1800 },
        { type: 'HIDE_OBJECT', objectId: 'walletInMouth', delayMs: 1800 },
        { type: 'HIDE_OBJECT', objectId: 'trashStanding', delayMs: 2300 },
        { type: 'SPAWN_OBJECT', objectId: 'trashFallen', delayMs: 2300 },
        { type: 'PLAY_SOUND', soundId: 'crash', delayMs: 2300 },
        { type: 'FX', kind: 'paper', at: 'trashFallen', delayMs: 2400 },
        { type: 'ACTOR_SPEECH', actorId: 'tsuchiya', text: '財布、飛んできた！ びしょぬれだけど！', delayMs: 3000 },
        { type: 'ACTOR_SET_STATE', actorId: 'tsuchiya', state: 'HAPPY', delayMs: 3000 },
      ],
      after: [{ actor: 'elephant', text: 'パオ？（となりで何か倒れた音がした）', delay: 4400 }] },
    { id: 'S4-E13', s: 'walletInMouth', t: 'bird', cat: 'BRANCH', group: 's4-wallet', decoy: true, title: '小鳥、カバの歯みがきついでに財布を回収', say: 'チュン！（歯のすき間のゴミ、ほいっ）', anim: 'react.happy', route: 'S4.route.hippo',
      requires: ['S4-E11'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'bird', to: [2850, 840], speed: 200, wander: 20 },
        { type: 'FX', kind: 'sparkle', at: 'hippo', delayMs: 1200 },
        { type: 'HIDE_OBJECT', objectId: 'walletInMouth', delayMs: 1500 },
        { type: 'ACTOR_SPEECH', actorId: 'hippo', text: 'ブフ〜（すっきり）', delayMs: 2000 },
        { type: 'ACTOR_SPEECH', actorId: 'tsuchiya', text: '鳥さん、ありがとう！ 静かに戻ってきた……', delayMs: 2800 },
        { type: 'ACTOR_SET_STATE', actorId: 'tsuchiya', state: 'HAPPY', delayMs: 2800 },
      ],
      after: [{ actor: 'cleaner', text: 'カバ舎はきょうも静かで平和だねえ', delay: 4200 }] },
    { id: 'S4-E14', s: 'trashFallen', t: 'elephant', cat: 'PROGRESSION', title: 'ゾウ、倒れたゴミ箱を鼻で起こす', say: 'パオ〜ン（よいしょっと）', anim: 'react.happy', route: 'S4.route.elephant',
      requires: ['S4-E12'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'elephant', to: [3480, 1060], speed: 160, wander: 60 },
        { type: 'HIDE_OBJECT', objectId: 'trashFallen', delayMs: 2000 },
        { type: 'SPAWN_OBJECT', objectId: 'trashStanding', delayMs: 2000 },
        { type: 'FX', kind: 'sparkle', at: 'trashStanding', delayMs: 2100 },
        { type: 'ACTOR_SPEECH', actorId: 'cleaner', text: 'ゾウが片づけを！？ うちの園、すごいぞ！', delayMs: 2800 },
        { type: 'SET_FLAG', id: 'elephant.helper', value: true },
        { type: 'SPAWN_OBJECT', objectId: 'map', delayMs: 3200 },
        { type: 'ACTOR_SPEECH', actorId: 'kaiDad', text: 'ゾウがどうしたって？ ええと、象舎はどっちだ……', delayMs: 3400 },
      ],
      after: [{ actor: 'reporter', text: 'ゾウがゴミ箱を起こした！？ これは取材のにおいがするわ', delay: 4600 }] },
    { id: 'S4-E15', s: 'brush', t: 'cleaner', cat: 'FLAVOR', title: '清掃員、カバを洗おうとして吹っ飛ぶ', say: 'よーし、カバくんもピカピカにしてやるぞ！', anim: 'react.fall', route: 'S4.route.hippo',
      blocksIfCompleted: ['S4-E14'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'cleaner', to: [2860, 1130], speed: 200 },
        { type: 'ACTOR_SPEECH', actorId: 'hippo', text: 'ブフォーーッ！！（鼻息）', delayMs: 1600 },
        { type: 'FX', kind: 'splash', at: 'cleaner', delayMs: 1900 },
        { type: 'ACTOR_MOVE', actorId: 'cleaner', to: [2500, 1380], speed: 700, delayMs: 2000 },
        { type: 'FX', kind: 'stars', at: 'cleaner', delayMs: 2700 },
        { type: 'ACTOR_SET_STATE', actorId: 'cleaner', state: 'SAD', delayMs: 2700 },
        { type: 'ACTOR_SPEECH', actorId: 'cleaner', text: 'ひえ〜……カバの鼻息、おそるべし', delayMs: 3200 },
      ] },

    // ── ゾウ ──
    { id: 'S4-E16', s: 'puddle', t: 'elephant', cat: 'FLAVOR', title: 'ゾウ、水たまりで豪快に水浴び', say: 'パオ〜ン♪', anim: 'react.splash', route: 'S4.route.elephant', sound: 'splash',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'elephant', to: [3640, 990], speed: 140, wander: 80 },
        { type: 'FX', kind: 'splash', at: 'puddle', delayMs: 1400 },
        { type: 'PLAY_SOUND', soundId: 'splash', delayMs: 1400 },
        { type: 'ACTOR_SPEECH', actorId: 'smoker', text: 'うおっ、しぶきがこっちまで……', delayMs: 2400 },
        { type: 'SPAWN_OBJECT', objectId: 'icecream', delayMs: 3000 },
        { type: 'ACTOR_SPEECH', actorId: 'mio', text: 'ゾウさん見てたら暑くなっちゃった。アイス買ってもらおっと！', delayMs: 3200 },
      ],
      after: [{ actor: 'sota', text: 'ゾウってシャワー持ってるみたい！', delay: 3400 }] },
    { id: 'S4-E17', s: 'icecream', t: 'sota', cat: 'CHAIN', title: 'ソウタ、妹のアイスを奪って逃走', say: 'ひと口ちょーだい！ ……ぜんぶ！', anim: 'react.run', route: 'S4.route.elephant',
      cond: [{ any: [done('S4-E16'), { timeRemainingAtMostMs: 240000 }] }],
      fx: [
        { type: 'HIDE_OBJECT', objectId: 'icecream', delayMs: 400 },
        { type: 'ACTOR_SPEECH', actorId: 'mio', text: 'あーっ！ わたしのアイスーー！！', delayMs: 800 },
        { type: 'ACTOR_SET_STATE', actorId: 'mio', state: 'SAD', delayMs: 800 },
        { type: 'ACTOR_MOVE', actorId: 'sota', to: [4060, 1240], speed: 300, wander: 20 },
        { type: 'SPAWN_OBJECT', objectId: 'stolenIce', delayMs: 2600 },
        { type: 'ACTOR_SPEECH', actorId: 'smoker', text: 'いてっ！ おい坊主、ぶつかるなよ！', delayMs: 2800 },
        { type: 'SPAWN_OBJECT', objectId: 'cigarette', delayMs: 3000 },
        { type: 'FX', kind: 'smoke', at: 'cigarette', delayMs: 3400 },
      ],
      after: [{ actor: 'mio', text: 'うえーん！ だれか、とりかえしてー！', delay: 4200 }, { actor: 'smoker', text: 'あれ、タバコ落としたか……ま、いいか', delay: 5600 }] },
    { id: 'S4-E18', s: 'stolenIce', t: 'elephant', cat: 'FLAVOR', title: 'ゾウ、アイスを取りかえしてミオへ', say: 'パオッ！（めっ！）', anim: 'react.angry', route: 'S4.route.elephant',
      requires: ['S4-E17'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'elephant', to: [4060, 1060], speed: 180, wander: 40 },
        { type: 'HIDE_OBJECT', objectId: 'stolenIce', delayMs: 1500 },
        { type: 'ACTOR_SPEECH', actorId: 'sota', text: 'わっ、鼻でとられた！', delayMs: 1700 },
        { type: 'ACTOR_SET_STATE', actorId: 'sota', state: 'EMBARRASSED', delayMs: 1700 },
        { type: 'SPAWN_OBJECT', objectId: 'icecream', delayMs: 2800 },
        { type: 'FX', kind: 'hearts', at: 'mio', delayMs: 2900 },
        { type: 'ACTOR_SPEECH', actorId: 'mio', text: 'もどってきた！ ゾウさん、ありがとう！', delayMs: 3100 },
        { type: 'ACTOR_SET_STATE', actorId: 'mio', state: 'HAPPY', delayMs: 3100 },
      ] },
    { id: 'S4-E19', s: 'cigarette', t: 'elephant', cat: 'FLAVOR', title: 'ゾウ、タバコの火を鼻の放水で消火', say: 'パオォーン！（火の用心！）', anim: 'react.splash', route: 'S4.route.elephant',
      requires: ['S4-E17'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'elephant', to: [3990, 1070], speed: 180, wander: 40 },
        { type: 'FX', kind: 'splash', at: 'cigarette', delayMs: 1400 },
        { type: 'PLAY_SOUND', soundId: 'splash', delayMs: 1400 },
        { type: 'HIDE_OBJECT', objectId: 'cigarette', delayMs: 1700 },
        { type: 'FX', kind: 'splash', at: 'smoker', delayMs: 1900 },
        { type: 'ACTOR_SET_STATE', actorId: 'smoker', state: 'EMBARRASSED', delayMs: 2200 },
        { type: 'ACTOR_SPEECH', actorId: 'smoker', text: 'うわっぷ！ ず、ずぶぬれ……今日から禁煙します……', delayMs: 2400 },
      ] },

    // ── バクとライオン ──
    { id: 'S4-E20', s: 'nightmare', t: 'tapir', cat: 'CHAIN', title: 'バク、カズマの悪夢をたいらげる', say: 'モグモグ……（にがくて、くせになる味）', anim: 'react.eat', route: 'S4.route.tapir',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'tapir', to: [5050, 2080], speed: 140, wander: 40 },
        { type: 'HIDE_OBJECT', objectId: 'nightmare', delayMs: 1500 },
        { type: 'FX', kind: 'stars', at: 'kazuma', delayMs: 1800 },
        { type: 'ACTOR_APPEARANCE', actorId: 'kazuma', look: { sit: false }, delayMs: 2200 },
        { type: 'ACTOR_SPEECH', actorId: 'kazuma', text: 'ふわ〜、すっきり！ 夢でライオンに追われてたけど……本物はどんなかな', delayMs: 2400 },
        { type: 'ACTOR_MOVE', actorId: 'kazuma', to: [4620, 1220], speed: 220, wander: 20, delayMs: 3600 },
        { type: 'ACTOR_SPEECH', actorId: 'lion', text: 'ガオオオオッ！！', delayMs: 8000 },
        { type: 'PLAY_SOUND', soundId: 'roar', delayMs: 8000 },
        { type: 'ACTOR_SET_STATE', actorId: 'kazuma', state: 'SCARED', delayMs: 8400 },
      ],
      after: [{ actor: 'kazuma', text: 'ひいいっ！ 本物のほうがこわい！ た、高いところへ……！', delay: 9200 }] },
    { id: 'S4-E21', s: 'lionTree', t: 'kazuma', cat: 'FLAVOR', title: 'カズマ、ライオンから逃げて木の上へ', say: 'ここなら安全……だよね！？', anim: 'react.scared', route: 'S4.route.tapir',
      requires: ['S4-E20'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'kazuma', to: [4330, 1110], speed: 260, wander: 0 },
        { type: 'FX', kind: 'leaves', at: 'lionTree', delayMs: 1400 },
        { type: 'ACTOR_SPEECH', actorId: 'lion', text: 'ガウ？（べつに、なにもしないのに）', delayMs: 2400 },
        { type: 'ACTOR_SPEECH', actorId: 'kazuma', text: '……おりかた、わからない', delayMs: 3800 },
      ] },

    // ── 逃げたタヌキ ──
    { id: 'S4-E22', s: 'yui', t: 'keeper2', cat: 'CHAIN', title: '飼育員、リボンの女の子をタヌキと勘ちがい', say: 'いたっ、逃げたタヌキ！ ……あれ、女の子？', anim: 'react.surprised', route: 'S4.route.tanuki',
      blocksIfCompleted: ['S4-E23'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'keeper2', to: [1420, 2290], speed: 220 },
        { type: 'ACTOR_SPEECH', actorId: 'yui', text: 'タヌキじゃないもん！ リボンだもん！', delayMs: 1600 },
        { type: 'ACTOR_SET_STATE', actorId: 'yui', state: 'ANGRY', delayMs: 1600 },
        { type: 'ACTOR_SET_STATE', actorId: 'keeper2', state: 'EMBARRASSED', delayMs: 2400 },
        { type: 'SET_FLAG', id: 'keeper2.tanukiAlert', value: true },
      ],
      after: [{ actor: 'keeper2', text: 'ご、ごめんね。耳に見えちゃって……でもタヌキ、この辺にいるはずなのよ', delay: 3400 }, { actor: 'tanukiGirl', text: '……ギクッ', delay: 5200 }] },
    { id: 'S4-E23', s: 'tanukiGirl', t: 'keeper2', cat: 'FLAVOR', title: '女の子に化けたタヌキを発見', say: 'そのふさふさのしっぽ……やっぱりタヌキだ！', anim: 'react.surprised', route: 'S4.route.tanuki',
      requires: ['S4-E22'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'keeper2', to: [3080, 2300], speed: 260 },
        { type: 'FX', kind: 'smoke', at: 'tanukiGirl', delayMs: 1600 },
        { type: 'PLAY_SOUND', soundId: 'pop', delayMs: 1600 },
        { type: 'ACTOR_HIDE', actorId: 'tanukiGirl', delayMs: 1800 },
        { type: 'SPAWN_OBJECT', objectId: 'tanuki', delayMs: 1800 },
        { type: 'ACTOR_SPEECH', actorId: 'keeper2', text: '確保ー！ さあ、おうちに帰ろうね', delayMs: 2600 },
        { type: 'HIDE_OBJECT', objectId: 'tanuki', delayMs: 5200 },
        { type: 'ACTOR_SET_STATE', actorId: 'keeper2', state: 'HAPPY', delayMs: 5200 },
      ] },

    // ── キリン ──
    { id: 'S4-E24', s: 'tapirFood', t: 'giraffe', cat: 'FLAVOR', title: 'キリン、首をのばしてバクのエサを横取り', say: 'ムォ……（となりのごはんは、おいしそう）', anim: 'react.eat', route: 'S4.route.giraffe',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'giraffe', to: [5300, 1070], speed: 140, wander: 40 },
        { type: 'OBJECT_MOVE', objectId: 'tapirFood', to: [5300, 1060], speed: 260, delayMs: 1400 },
        { type: 'HIDE_OBJECT', objectId: 'tapirFood', delayMs: 3000 },
        { type: 'ACTOR_SPEECH', actorId: 'tapir', text: 'フゴッ！？（ボクのごはん！）', delayMs: 3200 },
        { type: 'ACTOR_SET_STATE', actorId: 'tapir', state: 'ANGRY', delayMs: 3200 },
      ] },
    { id: 'S4-E25', s: 'babyGiraffe', t: 'giraffe', cat: 'FLAVOR', title: '親キリン、高い枝の葉っぱを子どもに', say: 'ムォ〜（ほら、いちばん上のやわらかいところ）', anim: 'react.happy', route: 'S4.route.giraffe',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'giraffe', to: [5820, 900], speed: 140, wander: 60 },
        { type: 'FX', kind: 'leaves', x: 5890, y: 430, delayMs: 1600 },
        { type: 'ACTOR_MOVE', actorId: 'babyGiraffe', to: [5760, 960], speed: 120, delayMs: 1800 },
        { type: 'ACTOR_SPEECH', actorId: 'babyGiraffe', text: 'ミュ〜♪（おいしい！）', delayMs: 2600 },
        { type: 'FX', kind: 'hearts', at: 'babyGiraffe', delayMs: 2800 },
      ] },
    { id: 'S4-E26', s: 'pandaTree', t: 'kenta', cat: 'CHAIN', title: 'ケンタ、パンダを見ようと木にのぼる', say: 'ここからならパンダ舎の中が見えるはず！', anim: 'react.happy', route: 'S4.route.giraffe',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'kenta', to: [6100, 1100], speed: 140, wander: 0 },
        { type: 'FX', kind: 'leaves', at: 'pandaTree', delayMs: 1600 },
        { type: 'ACTOR_SPEECH', actorId: 'kenta', text: '……あれ、おりられない', delayMs: 3200 },
        { type: 'ACTOR_SET_STATE', actorId: 'kenta', state: 'SCARED', delayMs: 3200 },
      ],
      after: [{ actor: 'fans', text: 'ちょっと、木の上に子どもが！ だれか背の高い……人？', delay: 4400 }, { actor: 'giraffe', text: 'ムォ？（呼んだ？）', delay: 6200 }] },
    { id: 'S4-E27', s: 'kenta', t: 'giraffe', cat: 'FLAVOR', title: 'キリン、木の上のケンタを下ろしてあげる', say: 'ムォ……（よっこらしょ）', anim: 'react.happy', route: 'S4.route.giraffe',
      requires: ['S4-E26'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'giraffe', to: [5960, 1060], speed: 160, wander: 40 },
        { type: 'ACTOR_MOVE', actorId: 'kenta', to: [6200, 1250], speed: 120, wander: 80, delayMs: 2000 },
        { type: 'FX', kind: 'sparkle', at: 'kenta', delayMs: 2600 },
        { type: 'ACTOR_SET_STATE', actorId: 'kenta', state: 'HAPPY', delayMs: 2600 },
        { type: 'ACTOR_SPEECH', actorId: 'kenta', text: 'キリンのエレベーターだ！ ありがとう！', delayMs: 2800 },
      ] },

    // ── パンダ ──
    { id: 'S4-E28', s: 'tire', t: 'milk', cat: 'FLAVOR', title: 'ミルク、タイヤでころころ遊び', say: 'ころりん♪', anim: 'react.spin', route: 'S4.route.panda',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'milk', to: [6560, 980], speed: 100, wander: 60 },
        { type: 'FX', kind: 'hearts', at: 'milk', delayMs: 1500 },
        { type: 'ACTOR_SPEECH', actorId: 'fans', text: 'かわいいーっ！ 連写連写！', delayMs: 2000 },
        { type: 'FX', kind: 'flash', at: 'fans', delayMs: 2200 },
      ] },
    { id: 'S4-E29', s: 'tire', t: 'gorosuke', cat: 'FLAVOR', title: 'ゴロスケ、タイヤを蹴とばす', say: 'フンッ！（丸いもの、きらい）', anim: 'react.angry', route: 'S4.route.panda',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'gorosuke', to: [6650, 1000], speed: 100, wander: 60 },
        { type: 'PLAY_SOUND', soundId: 'hit', delayMs: 1400 },
        { type: 'OBJECT_MOVE', objectId: 'tire', to: [6900, 1010], speed: 400, delayMs: 1400 },
        { type: 'FX', kind: 'stars', at: 'tire', delayMs: 2200 },
        { type: 'ACTOR_SPEECH', actorId: 'milk', text: '（あーあ……）', delayMs: 2600 },
      ] },
    { id: 'S4-E30', s: 'fans', t: 'milk', cat: 'FLAVOR', title: 'ミルク、観客にファンサービス', say: '（にっこり、ごろーん）', anim: 'react.love', route: 'S4.route.panda',
      fx: [
        { type: 'FX', kind: 'hearts', at: 'milk', delayMs: 800 },
        { type: 'FX', kind: 'flash', at: 'fans', delayMs: 1400 },
        { type: 'ACTOR_SPEECH', actorId: 'fans', text: 'こっち見た！ 尊い……！', delayMs: 1600 },
        { type: 'ACTOR_SET_STATE', actorId: 'fans', state: 'HAPPY', delayMs: 1600 },
      ] },
    { id: 'S4-E31', s: 'fans', t: 'gorosuke', cat: 'FLAVOR', title: 'ゴロスケ、観客にタイヤを投げる', say: 'ガルルッ！（見せもんじゃねえ）', anim: 'react.angry', route: 'S4.route.panda',
      fx: [
        { type: 'OBJECT_MOVE', objectId: 'tire', to: [6600, 1130], speed: 500, delayMs: 1000 },
        { type: 'PLAY_SOUND', soundId: 'crash', delayMs: 1600 },
        { type: 'FX', kind: 'big', at: 'fans', delayMs: 1600 },
        { type: 'ACTOR_SET_STATE', actorId: 'fans', state: 'SURPRISED', delayMs: 1600 },
        { type: 'ACTOR_SPEECH', actorId: 'fans', text: 'きゃーっ！ ……でもそういうところが好き！', delayMs: 2200 },
        { type: 'OBJECT_MOVE', objectId: 'tire', to: [6600, 990], speed: 200, delayMs: 3600 },
      ] },

    // ── 売店まわり ──
    { id: 'S4-E32', s: 'chameleon', t: 'takumi', cat: 'BRANCH', group: 's4-takumi', title: 'タクミ、カメレオンの目を見て目が回る', say: 'ぐるぐる……あれ、世界が回って……', anim: 'react.spin', route: 'S4.route.parrot',
      fx: [
        { type: 'FX', kind: 'stars', at: 'takumi', delayMs: 800 },
        { type: 'ACTOR_SET_STATE', actorId: 'takumi', state: 'SAD', delayMs: 1600 },
        { type: 'ACTOR_SPEECH', actorId: 'takumi', text: 'ダメだ……今日はデートどころじゃない……', delayMs: 2400 },
        { type: 'SET_FLAG', id: 'takumi.dizzy', value: true },
      ],
      after: [{ actor: 'parrot', text: 'グルグル！ グルグル！', delay: 3800 }] },
    { id: 'S4-E33', s: 'ryu', t: 'hedgehog', cat: 'CHAIN', title: 'ハリネズミ、パンク頭に対抗してトゲを逆立てる', say: 'ピスッ！！（トゲなら負けない！）', anim: 'react.angry', route: 'S4.route.kiosk',
      cond: [flag('punk.atKiosk')],
      fx: [
        { type: 'FX', kind: 'stars', at: 'hedgehog', delayMs: 700 },
        { type: 'ACTOR_SPEECH', actorId: 'ryu', text: 'おっ、イカした頭じゃねえか、相棒！', delayMs: 1500 },
        { type: 'ACTOR_SPEECH', actorId: 'chameleon', text: '……！！（びっくりして色が変わる）', delayMs: 2400 },
        { type: 'FX', kind: 'flash', at: 'chameleon', delayMs: 2800 },
        { type: 'ACTOR_HIDE', actorId: 'chameleon', delayMs: 3000 },
        { type: 'SPAWN_OBJECT', objectId: 'hiddenCham', delayMs: 3000 },
      ],
      after: [{ actor: 'kenta', text: 'えっ、いまカメレオンが消えた！？ ……近くで見れば、どこかに……', delay: 4200 }] },
    { id: 'S4-E34', s: 'hiddenCham', t: 'kenta', cat: 'CHAIN', title: 'ケンタ、葉っぱにまぎれたカメレオンを発見', say: 'みーつけた！ 目だけキョロキョロしてる！', anim: 'react.photo', route: 'S4.route.kiosk',
      requires: ['S4-E33'],
      fx: [
        { type: 'FX', kind: 'sparkle', at: 'hiddenCham', delayMs: 600 },
        { type: 'OBJECT_MOVE', objectId: 'hiddenCham', to: [3965, 1870], speed: 60, delayMs: 1600 },
        { type: 'OBJECT_APPEARANCE', objectId: 'hiddenCham', look: { size: 20, rot: -0.3 }, delayMs: 1600 },
        { type: 'ACTOR_SPEECH', actorId: 'kenta', text: 'あっ、また消えた！ 今度はべつの葉っぱかな？', delayMs: 2800 },
      ] },
    { id: 'S4-E35', s: 'hiddenCham', t: 'kenta', cat: 'FLAVOR', title: 'ケンタ、二度目もカメレオンを見やぶる', say: 'そこだっ！ もうだまされないぞ！', anim: 'react.sparkle', route: 'S4.route.kiosk',
      requires: ['S4-E34'],
      fx: [
        { type: 'HIDE_OBJECT', objectId: 'hiddenCham', delayMs: 1200 },
        { type: 'ACTOR_SHOW', actorId: 'chameleon', delayMs: 1200 },
        { type: 'ACTOR_SPEECH', actorId: 'chameleon', text: '……（こうさん）', delayMs: 1800 },
        { type: 'ACTOR_SET_STATE', actorId: 'kenta', state: 'HAPPY', delayMs: 1800 },
        { type: 'FX', kind: 'confetti', at: 'kenta', delayMs: 2000 },
      ] },

    // ── ヤギと地図 ──
    { id: 'S4-E36', s: 'map', t: 'goat', cat: 'CHAIN', title: 'ヤギ、園内マップをむしゃむしゃ', say: 'メェ〜（紙はごちそう）', anim: 'react.eat', route: 'S4.route.goat',
      cond: [{ anyEventDone: ['S4-E05', 'S4-E14', 'S4-E39'] }],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'goat', to: [740, 2120], speed: 180, wander: 40 },
        { type: 'FX', kind: 'paper', at: 'map', delayMs: 1400 },
        { type: 'OBJECT_APPEARANCE', objectId: 'map', look: { emoji: '🧾', size: 22, rot: 0.6 }, delayMs: 1600 },
        { type: 'ACTOR_SPEECH', actorId: 'kaiDad', text: 'ああっ！ 地図が！ ……出口がわからなくなった', delayMs: 2200 },
        { type: 'ACTOR_SET_STATE', actorId: 'kaiDad', state: 'SAD', delayMs: 2200 },
      ],
      after: [{ actor: 'kai', text: 'ヤギって紙が好きなんだ！ お父さん、ほかに紙もってない？', delay: 3800 }] },
    { id: 'S4-E37', s: 'kaiDad', t: 'kai', cat: 'FLAVOR', title: 'カイ、父のお札をヤギにあげてしまう', say: 'お父さんのサイフに紙あった！ はい、ヤギさん！', anim: 'react.laugh', route: 'S4.route.goat',
      requires: ['S4-E36'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'kai', to: [700, 2230], speed: 160 },
        { type: 'FX', kind: 'paper', at: 'goat', delayMs: 1500 },
        { type: 'ACTOR_SPEECH', actorId: 'goat', text: 'メェ〜（高級な味）', delayMs: 2000 },
        { type: 'ACTOR_SPEECH', actorId: 'kaiDad', text: 'それは千円札だーーっ！！', delayMs: 2800 },
        { type: 'ACTOR_ANIMATION', actorId: 'kaiDad', animationId: 'react.surprised', delayMs: 2800 },
      ] },

    // ── 迷子のウサギ ──
    { id: 'S4-E38', s: 'pouch', t: 'keeper2', cat: 'CHAIN', title: '飼育員、カンガルーの袋に迷子ウサギを発見', say: 'その袋のふくらみ……ウサギ！？ なんでそこに！', anim: 'react.surprised', route: 'S4.route.rabbit',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'keeper2', to: [1380, 2250], speed: 200 },
        { type: 'HIDE_OBJECT', objectId: 'pouch', delayMs: 1400 },
        { type: 'FX', kind: 'leaves', x: 1400, y: 1800, delayMs: 1500 },
        { type: 'ACTOR_SPEECH', actorId: 'kangaroo', text: 'ピョン！（軽くなった！）', delayMs: 1800 },
        { type: 'ACTOR_SPEECH', actorId: 'keeper2', text: 'あっ、ぴょーんと草むらに逃げちゃった……', delayMs: 2800 },
        { type: 'ACTOR_SET_STATE', actorId: 'keeper2', state: 'SAD', delayMs: 2800 },
      ],
      after: [{ actor: 'keeper2', text: 'ウサギは子どもの声につられて顔を出すことがあるんだけど……', delay: 4400 }] },
    { id: 'S4-E39', s: 'strayRabbit', t: 'keeper2', cat: 'PROGRESSION', title: '飼育員、木のそばの迷子ウサギを保護', say: 'いい子いい子、つかまえた！ さあ、おうちに帰ろう', anim: 'react.happy', route: 'S4.route.rabbit',
      requires: ['S4-E38', 'S4-E44'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'keeper2', to: [2420, 2250], speed: 220 },
        { type: 'HIDE_OBJECT', objectId: 'strayRabbit', delayMs: 1800 },
        { type: 'FX', kind: 'hearts', at: 'keeper2', delayMs: 1900 },
        { type: 'ACTOR_SET_STATE', actorId: 'keeper2', state: 'HAPPY', delayMs: 1900 },
        { type: 'ACTOR_SPEECH', actorId: 'twins', text: 'ウサギさん、よかったね！', delayMs: 2600 },
        { type: 'SPAWN_OBJECT', objectId: 'map', delayMs: 3000 },
        { type: 'ACTOR_SPEECH', actorId: 'kaiDad', text: 'ウサギが見つかった？ どこの話だろう……', delayMs: 3200 },
      ] },

    // ── オウムの恋愛相談 ──
    { id: 'S4-E40', s: 'saki', t: 'parrot', cat: 'FLAVOR', title: 'オウム、デート中の口説き文句を大声でマネ', say: 'キミノホウガ、カワイイヨ！ キミノホウガ、カワイイヨ！', anim: 'react.laugh', route: 'S4.route.parrot',
      requires: ['S4-E41'],
      fx: [
        { type: 'FX', kind: 'notes', at: 'parrot', delayMs: 600 },
        { type: 'ACTOR_SET_STATE', actorId: 'takumi', state: 'EMBARRASSED', delayMs: 1600 },
        { type: 'ACTOR_SPEECH', actorId: 'takumi', text: 'うわああ、くり返さないでくれ〜！', delayMs: 1800 },
        { type: 'ACTOR_SPEECH', actorId: 'saki', text: 'ふふっ。オウムさんまで応援してくれてるみたい', delayMs: 3200 },
        { type: 'FX', kind: 'hearts', at: 'saki', delayMs: 3400 },
      ] },
    { id: 'S4-E41', s: 'parrot', t: 'takumi', cat: 'CHAIN', group: 's4-takumi', title: 'タクミ、オウムに恋愛相談', say: 'なあオウムくん。好きな人に、なんて言えばいい？', anim: 'react.think', route: 'S4.route.parrot',
      fx: [
        { type: 'ACTOR_SPEECH', actorId: 'parrot', text: 'キミノホウガ、カワイイヨ！（どこかで聞いた）', delayMs: 1600 },
        { type: 'ACTOR_SHOW', actorId: 'saki', delayMs: 3000 },
        { type: 'ACTOR_MOVE', actorId: 'saki', to: [5880, 2270], speed: 140, wander: 20, delayMs: 3000 },
        { type: 'ACTOR_APPEARANCE', actorId: 'takumi', look: { sit: false }, delayMs: 5000 },
        { type: 'ACTOR_SPEECH', actorId: 'takumi', text: 'サ、サキさん！ ……き、きみのほうが、かわいいよ！', delayMs: 6200 },
        { type: 'ACTOR_SPEECH', actorId: 'saki', text: 'え……？ なにより？ でも、うれしい', delayMs: 7600 },
        { type: 'SET_FLAG', id: 'takumi.date', value: true },
      ],
      after: [{ actor: 'parrot', text: 'クワッ（いまの、ちゃんと覚えた）', delay: 9000 }] },

    // ── おじいちゃんの動物ガイド ──
    { id: 'S4-E42', s: 'twins', t: 'grandpa', cat: 'FLAVOR', title: 'おじいちゃん、キリンの首を解説', say: 'キリンの首はな、高い木の葉っぱを独りじめするためじゃ', anim: 'react.think', route: 'S4.route.tour',
      fx: [
        { type: 'ACTOR_SPEECH', actorId: 'twins', text: 'へー！ じゃあ次はおサル見たい！', delayMs: 2200 },
        { type: 'ACTOR_MOVE', actorId: 'twins', to: [1400, 1300], speed: 320, wander: 30, delayMs: 3200 },
        { type: 'ACTOR_MOVE', actorId: 'grandpa', to: [1520, 1320], speed: 300, wander: 20, delayMs: 3400 },
      ] },
    { id: 'S4-E43', s: 'twins', t: 'grandpa', cat: 'FLAVOR', title: 'おじいちゃん、サルのお尻を解説', say: 'サルのお尻が赤いのはな……元気いっぱいのしるしじゃ', anim: 'react.think', route: 'S4.route.tour',
      requires: ['S4-E42'],
      fx: [
        { type: 'ACTOR_SPEECH', actorId: 'twins', text: 'おしりー！ あはは！ つぎはゾウさん！', delayMs: 2200 },
        { type: 'ACTOR_SPEECH', actorId: 'boss', text: 'ウキ？（なにか言われてる？）', delayMs: 2800 },
        { type: 'ACTOR_MOVE', actorId: 'twins', to: [3700, 1300], speed: 320, wander: 30, delayMs: 3200 },
        { type: 'ACTOR_MOVE', actorId: 'grandpa', to: [3820, 1320], speed: 300, wander: 20, delayMs: 3400 },
      ] },
    { id: 'S4-E44', s: 'twins', t: 'grandpa', cat: 'CHAIN', title: 'おじいちゃん、ゾウの鼻を解説', say: 'ゾウの鼻は手のかわりじゃ。ゴミ拾いだってできるぞ', anim: 'react.think', route: 'S4.route.tour',
      requires: ['S4-E43'],
      fx: [
        { type: 'ACTOR_SPEECH', actorId: 'elephant', text: 'パオ〜ン（そのとおり）', delayMs: 1600 },
        { type: 'ACTOR_SPEECH', actorId: 'twins', text: 'すごーい！ つぎはウサギ！ ウサギ！', delayMs: 2600 },
        { type: 'ACTOR_MOVE', actorId: 'twins', to: [2200, 2270], speed: 320, wander: 40, delayMs: 3400 },
        { type: 'ACTOR_MOVE', actorId: 'grandpa', to: [2320, 2290], speed: 260, wander: 20, delayMs: 3600 },
        { type: 'ACTOR_SPEECH', actorId: 'grandpa', text: 'ふう、ふう……年寄りをこき使うのう', delayMs: 6000 },
      ],
      after: [{ actor: 'keeper2', text: 'あら、子どもたちの声。ウサギが出てきそうな気がする……', delay: 7000 }] },
    { id: 'S4-E45', s: 'twins', t: 'grandpa', cat: 'FLAVOR', title: 'おじいちゃん、ウサギの赤い目を解説', say: 'ウサギの目が赤いのはな……えーと……夜ふかしじゃ', anim: 'react.shrug', route: 'S4.route.tour',
      requires: ['S4-E44'],
      fx: [
        { type: 'ACTOR_SPEECH', actorId: 'twins', text: 'うそだー！ おじいちゃん、てきとう！', delayMs: 1800 },
        { type: 'ACTOR_SET_STATE', actorId: 'grandpa', state: 'SAD', delayMs: 2600 },
        { type: 'ACTOR_SPEECH', actorId: 'grandpa', text: 'つ、つかれた……どこか腰かけられるところは……', delayMs: 3000 },
        { type: 'ACTOR_MOVE', actorId: 'grandpa', to: [3150, 2280], speed: 120, wander: 10, delayMs: 3800 },
        { type: 'ACTOR_MOVE', actorId: 'twins', to: [3000, 2300], speed: 160, wander: 30, delayMs: 4200 },
      ] },
    { id: 'S4-E46', s: 'rock', t: 'grandpa', cat: 'PROGRESSION', title: 'おじいちゃん、カメを岩とまちがえて腰かける', say: 'よっこらしょ……ん？ この岩、動いとる！？', anim: 'react.surprised', route: 'S4.route.tour',
      requires: ['S4-E45'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'grandpa', to: [3220, 2110], speed: 100, wander: 0 },
        { type: 'HIDE_OBJECT', objectId: 'rock', delayMs: 2000 },
        { type: 'SPAWN_OBJECT', objectId: 'bigTurtle', delayMs: 2000 },
        { type: 'FX', kind: 'splash', at: 'bigTurtle', delayMs: 2100 },
        { type: 'ACTOR_SPEECH', actorId: 'grandpa', text: 'カメじゃったか！ すまんすまん', delayMs: 2800 },
        { type: 'ACTOR_SPEECH', actorId: 'twins', text: 'おじいちゃん、カメに乗ってる〜！', delayMs: 3800 },
      ],
      after: [{ actor: 'babyTurtle', text: 'ノソ……（あの大きいのの上、景色よさそう）', delay: 5200 }] },
    { id: 'S4-E47', s: 'bigTurtle', t: 'babyTurtle', cat: 'FLAVOR', title: '親ガメの上に子ガメ、亀の塔が完成', say: 'ノソノソ……（てっぺん、とうちゃく！）', anim: 'react.sparkle', route: 'S4.route.tour',
      requires: ['S4-E46'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'grandpa', to: [3100, 2280], speed: 100, wander: 10 },
        { type: 'ACTOR_MOVE', actorId: 'babyTurtle', to: [3220, 2010], speed: 120, wander: 0, delayMs: 600 },
        { type: 'FX', kind: 'stars', at: 'bigTurtle', delayMs: 2600 },
        { type: 'ACTOR_SPEECH', actorId: 'twins', text: '亀の塔だー！ 親ガメの上に子ガメ！', delayMs: 3000 },
        { type: 'ACTOR_SPEECH', actorId: 'grandpa', text: '孫ガメもおったら完璧じゃったのう', delayMs: 4200 },
      ] },

    // ── 終わり ──
    { id: 'S4-E48', s: 'complainer', t: 'manager', cat: 'TIMEOUT', title: '閉園の音楽と、お客のぼやき', say: '本日は閉園です……またのお越しを……', anim: 'react.timeout', route: 'S4.route.end',
      fx: [
        { type: 'PLAY_SOUND', soundId: 'bell' },
        { type: 'ACTOR_SPEECH', actorId: 'complainer', text: '結局なにも起きない動物園だったな！', delayMs: 800 },
        { type: 'ACTOR_SET_STATE', actorId: 'manager', state: 'SAD', delayMs: 1800 },
        { type: 'ACTOR_SPEECH', actorId: 'manager', text: 'ぐぬぬ……明日こそ、テレビに出てみせる……', delayMs: 2200 },
      ] },
    { id: 'S4-E49', s: 'reporter', t: 'manager', cat: 'TERMINAL', title: 'なかよし動物園、生中継で大さわぎ', say: '取材！？ どうぞどうぞ！ 当園は清潔で、動物たちもかしこく……', anim: 'react.terminal', route: 'S4.route.end',
      requires: ['S4-E05', 'S4-E14'],
      fx: [
        { type: 'CAMERA_FOCUS', x: 900, y: 1150, zoom: 1.2 },
        { type: 'ACTOR_MOVE', actorId: 'manager', to: [800, 1260], speed: 220, wander: 0 },
        { type: 'ACTOR_MOVE', actorId: 'reporter', to: [620, 1300], speed: 220, wander: 0 },
        { type: 'FX', kind: 'flash', at: 'reporter', delayMs: 1600 },
        { type: 'ACTOR_SPEECH', actorId: 'boss', text: 'ウキキーッ！（バナナのお礼じゃ、ほれ！）', delayMs: 2600 },
        { type: 'SPAWN_OBJECT', objectId: 'endPeel', delayMs: 3000 },
        { type: 'ACTOR_ANIMATION', actorId: 'manager', animationId: 'react.fall', delayMs: 3400 },
        { type: 'PLAY_SOUND', soundId: 'crash', delayMs: 3400 },
        { type: 'FX', kind: 'stars', at: 'manager', delayMs: 3600 },
        { type: 'ACTOR_SPEECH', actorId: 'elephant', text: 'パオーーン！！（片づけはまかせて！）', delayMs: 4400 },
        { type: 'PLAY_SOUND', soundId: 'fanfare', delayMs: 4600 },
        { type: 'FX', kind: 'confetti', at: 'manager', delayMs: 4800 },
        { type: 'ACTOR_SPEECH', actorId: 'reporter', text: '人も動物も大はしゃぎ！ 以上、なかよし動物園からでした！', delayMs: 5400 },
        { type: 'ACTOR_SPEECH', actorId: 'manager', text: '……ま、まあ、これも当園の魅力です！', delayMs: 6800 },
        { type: 'WAIT', durationMs: 4000 },
      ] },
  ],
};
