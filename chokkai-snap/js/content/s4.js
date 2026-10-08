// ステージ4：なかよし動物園（49 イベント）。登場人物・動物の名前と台詞はすべてオリジナル。
// 1 枚の園内マップ（6000×2700）。上から 空と遠景 → 上段の大型動物（サル山・クジャク・カバ・ゾウ・ライオン・キリン）→
// 上の通路 → 中段（ふれあい広場・カンガルー・ウサギ・カメの池・小動物館・売店・バク・パンダ）→ 下の通路 →
// 下段（入口と管理事務所・フラミンゴの池・ピクニック広場・レストラン・噴水広場・おみやげ・オウムの森）→ 園の外の道路。
const done = id => ({ eventDone: id });
const notDone = id => ({ eventNotDone: id });
const flag = (id, value = true) => ({ flagEquals: { id, value } });

// ── 帯の y 座標 ──
const R1 = 300, F1 = 920;          // 上段：囲いの奥〜柵（下端）
const P1 = 920, P1B = 1150;        // 上の通路
const R2 = 1150, F2 = 1740;         // 中段
const P2 = 1740, P2B = 1970;        // 下の通路
const R3 = 1970, R3B = 2400;        // 下段
const W = 6000;

// ── 部品 ──
const sign = (x, y, w, text, fill, color = '#fff', s = 30, h = 58) => ({ t: 'sign', x, y, w, h, text, fill, color, s });
const prop = (kind, x, y, s, o = {}) => ({ t: 'prop', kind, x, y, s, ...o });
// 上の通路・下の通路（敷石＋縁石）
const walk = (y, h) => [
  { t: 'rect', x: 0, y, w: W, h, fill: '#f1e3b8' },
  { t: 'stripes', x: 0, y, w: W, h, dir: 'v', n: 60, c1: 'rgba(0,0,0,0)', c2: 'rgba(150,110,50,.06)' },
  { t: 'stripes', x: 0, y: y + 14, w: W, h: h - 28, dir: 'h', n: 6, c1: 'rgba(0,0,0,0)', c2: 'rgba(255,255,255,.18)' },
  { t: 'rect', x: 0, y, w: W, h: 14, fill: '#d6bf86' },
  { t: 'rect', x: 0, y: y + h - 14, w: W, h: 14, fill: '#d6bf86' },
];
// 通路の街灯・ゴミ箱・花の鉢
const furniture = [];
for (let x = 140; x < W; x += 760) furniture.push(prop('lamp', x, P1 + 40, 170), prop('lamp', x + 380, P2 + 40, 170));
for (let x = 520; x < W; x += 1520) furniture.push(prop('trash', x, P1B - 12, 52, { color: '#4f9a5a' }), prop('trash', x + 760, P2B - 12, 52, { color: '#4f9a5a' }));
for (let x = 60; x < W; x += 420) furniture.push(prop('flower', x, P1B + 6, 46, { color: ['#ff6f91', '#ffd23f', '#ff9a3a', '#c77dff'][(x / 420 | 0) % 4] }));
// 中段の上の生け垣（上の通路との境）
const hedge = [];
for (let x = 30; x < W; x += 110) hedge.push(prop('bush', x, R2 + 34, 46, { color: x % 220 < 110 ? '#3f9a44' : '#4caf50', flower: x % 330 < 110 ? '#ffb3c8' : null }));
// 遠景の森
const forest = [];
for (let x = 20; x < W; x += 150) forest.push(prop(x % 300 < 150 ? 'pine' : 'tree', x, R1 + 30 + (x % 7) * 3, 200 + (x % 5) * 26, { color: x % 450 < 150 ? '#2f8a4a' : '#3f9e4a' }));

export default {
  id: 'S4', title: 'なかよし動物園', subtitle: '動物園', theme: '動物園',
  intro: 'よく晴れた休日の動物園。人も動物もそれぞれ小さな困りごとをかかえている。園長は「テレビ取材が来ないかなあ」とそわそわ……。',
  timeLimitMs: 300000,
  world: { width: 6000, height: 2700, minZoom: 0.75, maxZoom: 4, bg: '#9fd06e', spawnCamera: { x: 1500, y: 1093, zoom: 1 } },
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
    // ═══ 空と遠景 ═══
    { t: 'sky', x: 0, y: 0, w: W, h: R1 + 60, c1: '#6fbcec', c2: '#d6f0ff' },
    prop('sun', 5650, 230, 200),
    prop('cloud', 700, 150, 90), prop('cloud', 2100, 110, 120), prop('cloud', 3500, 170, 80), prop('cloud', 4700, 120, 110),
    prop('mountain', 1200, R1 + 40, 260, { color: '#7aa6c8', snow: true }), prop('mountain', 1650, R1 + 40, 200, { color: '#8ab4d4' }),
    prop('mountain', 4200, R1 + 40, 240, { color: '#7aa6c8', snow: true }), prop('mountain', 3800, R1 + 40, 170, { color: '#8ab4d4' }),
    prop('ferris', 2800, R1 + 40, 300),
    prop('hill', 600, R1 + 60, 120, { color: '#5aa84a', wide: 4 }), prop('hill', 2600, R1 + 60, 100, { color: '#4f9e42', wide: 5 }),
    prop('hill', 4700, R1 + 60, 130, { color: '#5aa84a', wide: 4 }),
    ...forest,
    { t: 'emoji', e: '🎈', x: 3350, y: 120, s: 46 }, { t: 'emoji', e: '🎈', x: 3400, y: 160, s: 40 },
    { t: 'emoji', e: '🕊️', x: 1500, y: 200, s: 40 }, { t: 'emoji', e: '🕊️', x: 1560, y: 180, s: 30 },

    // ═══ 上段：サル山（60〜1240） ═══
    { t: 'rect', x: 40, y: R1 + 20, w: 1210, h: F1 - R1 - 20, fill: '#dcc79c', r: 30 },
    prop('pine', 150, 667, 240, { color: '#2f7a42' }),
    { t: 'poly', pts: [110, 876,260, 649,420, 527,560, 422,650, 370,760, 431,900, 527,1040, 649,1200, 876], fill: '#a88e68', stroke: '#7a6448' },
    { t: 'poly', pts: [330, 702,470, 562,600, 448,650, 387,700, 492,620, 614,480, 719], fill: '#bea57c' },
    { t: 'poly', pts: [760, 579,900, 562,1020, 667,880, 702], fill: '#968058' },
    { t: 'ellipse', x: 640, y: 448, rx: 70, ry: 16, fill: '#c9b08a' },
    { t: 'ellipse', x: 620, y: 741, rx: 120, ry: 23, fill: '#c9b08a' },
    { t: 'ellipse', x: 340, y: 750, rx: 70, ry: 16, fill: '#c9b08a' },
    { t: 'ellipse', x: 820, y: 798, rx: 60, ry: 35, fill: '#5a4a38' },
    prop('tree', 1150, 649, 280, { color: '#4fa33a' }),
    { t: 'line', pts: [1110, 492,900, 597,760, 510], stroke: '#a07a4a', w: 7 },
    { t: 'line', pts: [150, 527,420, 562], stroke: '#a07a4a', w: 6 },
    prop('rock', 230, 850, 70), prop('rock', 1060, 841, 80, { color: '#8a8a80' }), prop('logs', 480, 850, 60),
    { t: 'emoji', e: '🐒', x: 920, y: 562, s: 44 }, { t: 'emoji', e: '🐒', x: 260, y: 597, s: 40 },
    { t: 'water', x: 60, y: 859, w: 1170, h: 40, fill: '#7cc3e0' },
    { t: 'fence', x: 40, y: F1, w: 1210, h: 54, fill: '#8a6240' },
    sign(470, 862, 200, 'サル山', '#7a4a22'),

    // ═══ クジャク舎（1280〜1950） ═══
    { t: 'rect', x: 1280, y: R1 + 20, w: 670, h: F1 - R1 - 20, fill: '#bfe08f', r: 20 },
    prop('tree', 1620, 702, 320, { color: '#3f9e4a' }),
    prop('bush', 1340, 824, 60, { color: '#4caf50', flower: '#ffd23f' }), prop('bush', 1890, 789, 60, { color: '#3f9a44', flower: '#ff6f91' }),
    prop('grass', 1450, 876, 40), prop('grass', 1800, 894, 40), prop('logs', 1880, 885, 50),
    { t: 'stripes', x: 1280, y: R1 + 20, w: 670, h: F1 - R1 - 20, dir: 'v', n: 40, c1: 'rgba(0,0,0,0)', c2: 'rgba(90,90,90,.12)' },
    { t: 'poly', pts: [1270, 326,1615, 250,1960, 326], fill: 'rgba(200,210,220,.5)', stroke: '#7a8a96' },
    { t: 'line', pts: [1280, 326,1280, NaN], stroke: '#7a8a96', w: 6 }, { t: 'line', pts: [1950, 326,1950, NaN], stroke: '#7a8a96', w: 6 },
    { t: 'fence', x: 1280, y: F1, w: 670, h: 54, fill: '#6a7a86' },
    sign(1520, 862, 200, 'クジャク', '#2a6a8a'),

    // ═══ カバ（1990〜2870） ═══
    { t: 'rect', x: 1990, y: R1 + 20, w: 880, h: F1 - R1 - 20, fill: '#cdbd8c', r: 20 },
    { t: 'building', x: 2010, y: 579, w: 280, h: 174, fill: '#e2d4b4', roof: '#5a7a9a', sign: 'カバ舎', signSize: 30, signFill: '#fff', signColor: '#2a3a5a', windows: false },
    { t: 'water', x: 2090, y: 597, w: 760, h: 244, fill: '#5fa9cf' },
    { t: 'emoji', e: '🪷', x: 2760, y: 649, s: 36 }, { t: 'emoji', e: '🪷', x: 2180, y: 789, s: 30 },
    prop('rock', 2800, 597, 70), prop('grass', 2030, 894, 50), prop('grass', 2830, 894, 50), prop('palm', 2840, 579, 220),
    { t: 'fence', x: 1990, y: F1, w: 880, h: 54, fill: '#8a6240' },
    sign(2560, 862, 160, 'カバ', '#4a5a8a'),

    // ═══ ゾウ（2910〜3920） ═══
    { t: 'rect', x: 2910, y: R1 + 20, w: 1010, h: F1 - R1 - 20, fill: '#dcbd8a', r: 20 },
    { t: 'building', x: 3560, y: 684, w: 330, h: 227, fill: '#c8a878', roof: '#7a4a2a', sign: '象舎', signSize: 34, signFill: '#fff', signColor: '#5a2a1a', windows: false },
    prop('palm', 2990, 719, 300), prop('tree', 3420, 527, 220, { color: '#5aa83a' }),
    { t: 'ellipse', x: 3220, y: 846, rx: 180, ry: 42, fill: '#8a6a4a' }, { t: 'ellipse', x: 3200, y: 841, rx: 120, ry: 23, fill: '#a07c58' },
    prop('logs', 3060, 562, 70), prop('rock', 3480, 702, 90), { t: 'emoji', e: '🌾', x: 3700, y: 824, s: 60 }, { t: 'emoji', e: '🌾', x: 3760, y: 841, s: 50 },
    { t: 'fence', x: 2910, y: F1, w: 1010, h: 54, fill: '#8a6240' },
    sign(3300, 862, 160, 'ゾウ', '#7a4a2a'),

    // ═══ ライオン（3960〜4670） ═══
    { t: 'rect', x: 3960, y: R1 + 20, w: 710, h: F1 - R1 - 20, fill: '#e6cb80', r: 20 },
    prop('tree', 4580, 649, 300, { color: '#7aa33a' }),
    { t: 'poly', pts: [4000, 806,4110, 649,4260, 579,4420, 606,4540, 806], fill: '#b89a5a', stroke: '#8a6a3a' },
    { t: 'poly', pts: [4110, 649,4260, 579,4420, 606,4300, 641], fill: '#cdb070' },
    prop('grass', 4020, 876, 50, { color: '#b0a040' }), prop('grass', 4400, 868, 46, { color: '#b0a040' }), prop('grass', 4620, 885, 46, { color: '#b0a040' }),
    { t: 'emoji', e: '🦴', x: 4500, y: 876, s: 34 },
    { t: 'stripes', x: 3960, y: 850, w: 710, h: 70, dir: 'v', n: 44, c1: 'rgba(0,0,0,0)', c2: 'rgba(40,40,40,.35)' },
    { t: 'fence', x: 3960, y: F1, w: 710, h: 70, fill: '#4a4a4a' },
    sign(4170, 857, 280, 'キケン！ライオン', '#d23a3a', '#fff', 28),

    // ═══ キリン（4710〜5960） ═══
    { t: 'rect', x: 4710, y: R1 + 20, w: 1250, h: F1 - R1 - 20, fill: '#d2df95', r: 20 },
    { t: 'building', x: 4740, y: 737, w: 230, h: 350, fill: '#f0d49a', roof: '#b07a2a', sign: 'キリン舎', signSize: 26, signFill: '#fff', signColor: '#7a4a1a', windows: false },
    prop('tree', 5800, 876, 600, { color: '#4f9e3c' }),
    prop('tree', 5260, 492, 200, { color: '#6aa83a' }), prop('bush', 5000, 876, 60, { color: '#5aa83a' }), prop('bush', 5520, 894, 50, { color: '#4f9e3c' }),
    { t: 'rect', x: 5230, y: 527, w: 26, h: 332, fill: '#8a5a32' }, { t: 'rect', x: 5190, y: 527, w: 110, h: 44, fill: '#c89a5a', r: 8 },
    { t: 'fence', x: 4710, y: F1, w: 1250, h: 54, fill: '#8a6240' },
    sign(5320, 862, 180, 'キリン', '#b07a2a'),

    // ═══ 上の通路 ═══
    ...walk(P1, P1B - P1),
    sign(3420, P1 + 24, 230, '園内禁煙', '#d23a3a', '#fff', 26, 50),
    prop('bench', 1960, P1 + 70, 70), prop('bench', 3940, P1 + 70, 70),
    prop('signpost', 2950, P1B - 10, 120, { text: '← サル山' }), prop('signpost', 4680, P1B - 10, 120, { text: 'キリン →' }),
    prop('vending', 1270, P1 + 120, 120, { color: '#e2463c' }),
    prop('parasol', 3150, P1B - 20, 150, { color: '#ff9a3a' }), prop('table', 3150, P1B - 18, 60, { cloth: '#fff' }),

    // ═══ 中段：ふれあい広場（ヤギ 60〜870） ═══
    { t: 'rect', x: 40, y: R2 + 30, w: 830, h: F2 - R2 - 30, fill: '#cfe09a', r: 20 },
    { t: 'building', x: 90, y: 1436, w: 250, h: 165, fill: '#e3b88a', roof: '#c03a3a', sign: 'ふれあい広場', signSize: 24, signFill: '#fff', signColor: '#a33', windows: false },
    prop('tree', 760, 1350, 220, { color: '#5aa83a' }), prop('logs', 420, 1384, 60),
    { t: 'emoji', e: '🌾', x: 300, y: 1619, s: 50 }, { t: 'emoji', e: '🌾', x: 360, y: 1636, s: 44 }, { t: 'emoji', e: '🪣', x: 820, y: 1671, s: 40 },
    { t: 'fence', x: 40, y: F2, w: 830, h: 50, fill: '#d8b47a' },

    // カンガルー（910〜1580）
    { t: 'rect', x: 910, y: R2 + 30, w: 670, h: F2 - R2 - 30, fill: '#e2c38e', r: 20 },
    prop('cactus', 1000, 1350, 110), prop('rock', 1490, 1384, 90, { color: '#b07a5a' }), prop('tree', 1450, 1298, 200, { color: '#8ab04a' }),
    prop('grass', 1080, 1679, 40, { color: '#a09040' }), prop('grass', 1520, 1688, 40, { color: '#a09040' }),
    { t: 'fence', x: 910, y: F2, w: 670, h: 50, fill: '#8a6240' },
    sign(1120, 1683, 250, 'カンガルー', '#c0702a'),

    // ウサギ（1620〜2290）
    { t: 'rect', x: 1620, y: R2 + 30, w: 670, h: F2 - R2 - 30, fill: '#c4e696', r: 20 },
    { t: 'building', x: 1650, y: 1454, w: 230, h: 156, fill: '#fff3e0', roof: '#e07a8a', sign: 'うさぎ小屋', signSize: 24, signFill: '#fff', signColor: '#c35', windows: false },
    prop('tree', 2180, 1471, 260, { color: '#4caf50' }),
    { t: 'emoji', e: '🐇', x: 1980, y: 1575, s: 40 }, { t: 'emoji', e: '🐇', x: 1760, y: 1645, s: 34 }, { t: 'emoji', e: '🐰', x: 2060, y: 1671, s: 34 },
    { t: 'emoji', e: '🥬', x: 1880, y: 1688, s: 30 }, prop('tulip', 1700, 1714, 40, { color: '#ff6f91' }), prop('tulip', 1740, 1718, 40, { color: '#ffd23f' }),
    { t: 'fence', x: 1620, y: F2, w: 670, h: 44, fill: '#d8b47a' },
    sign(2000, 1686, 220, 'ウサギ', '#d0507a'),

    // カメの池（2330〜3090）
    { t: 'rect', x: 2330, y: R2 + 30, w: 760, h: F2 - R2 - 30, fill: '#b5d98a', r: 20 },
    { t: 'water', x: 2370, y: 1263, w: 690, h: 347, fill: '#6fb7c9' },
    { t: 'emoji', e: '🪷', x: 2480, y: 1350, s: 40 }, { t: 'emoji', e: '🪷', x: 2900, y: 1315, s: 34 }, { t: 'emoji', e: '🪷', x: 2700, y: 1523, s: 30 },
    { t: 'emoji', e: '🐢', x: 2600, y: 1419, s: 40 }, prop('rock', 2420, 1723, 60), prop('grass', 3040, 1697, 50), prop('bush', 3040, 1298, 50, { color: '#3f9a44' }),
    { t: 'fence', x: 2330, y: F2, w: 760, h: 40, fill: '#a09070' },
    sign(2540, 1688, 220, 'カメの池', '#2a7a6a'),

    // ふれあい小動物館（3130〜3810）
    { t: 'rect', x: 3130, y: R2 + 30, w: 680, h: F2 - R2 - 30, fill: '#d9ebb4', r: 20 },
    { t: 'building', x: 3150, y: 1593, w: 640, h: 287, fill: '#fbe8c8', roof: '#4a8a5a', sign: 'ふれあい小動物館', signSize: 34, signFill: '#fff', signColor: '#2a6a3a', door: false },
    prop('bush', 3240, 1645, 60, { color: '#4caf50' }), prop('bush', 3720, 1653, 60, { color: '#3f9a44' }), prop('bush', 3480, 1636, 40, { color: '#5aa83a' }),
    prop('logs', 3420, 1723, 50),
    { t: 'fence', x: 3130, y: F2, w: 680, h: 34, fill: '#a09070' },

    // 売店（3850〜4520）
    { t: 'rect', x: 3850, y: R2 + 30, w: 670, h: F2 - R2 - 30, fill: '#a6d47a' },
    { t: 'building', x: 3880, y: 1723, w: 620, h: 330, fill: '#fff4d6', roof: '#e07a3a', sign: '売店 くまさん', signSize: 40, signFill: '#e07a3a', signColor: '#fff', awning: '#ff8fa8', windows: false },
    sign(3880, 1228, 170, 'ソフトクリーム', '#fff', '#c35', 22, 46), { t: 'emoji', e: '🍦', x: 4110, y: 1245, s: 50 },
    prop('parasol', 4440, P2 + 100, 150, { color: '#3a8ad8' }), prop('table', 4440, P2 + 100, 60),

    // バク（4560〜5210）
    { t: 'rect', x: 4560, y: R2 + 30, w: 650, h: F2 - R2 - 30, fill: '#bfa678', r: 20 },
    { t: 'ellipse', x: 5040, y: 1454, rx: 140, ry: 52, fill: '#6a9fb5', stroke: '#4a7a8a' },
    prop('bush', 4640, 1367, 70, { color: '#3f8a3a' }), prop('palm', 5150, 1350, 220), prop('grass', 4800, 1697, 40),
    { t: 'fence', x: 4560, y: F2, w: 650, h: 50, fill: '#8a6240' },
    sign(4740, 1686, 140, 'バク', '#3a3a3a'),

    // パンダ（5250〜5960）
    { t: 'rect', x: 5250, y: R2 + 30, w: 710, h: F2 - R2 - 30, fill: '#addb8c', r: 20 },
    { t: 'building', x: 5660, y: 1471, w: 280, h: 200, fill: '#f6f6f6', roof: '#333', sign: 'パンダ舎', signSize: 28, signFill: '#222', signColor: '#fff' },
    { t: 'emoji', e: '🎋', x: 5320, y: 1298, s: 110 }, { t: 'emoji', e: '🎋', x: 5450, y: 1271, s: 90 }, { t: 'emoji', e: '🎋', x: 5560, y: 1306, s: 100 },
    prop('logs', 5700, 1714, 60), { t: 'line', pts: [5300, 1376,5620, 1376], stroke: '#a07a4a', w: 8 },
    { t: 'stripes', x: 5250, y: 1679, w: 710, h: 61, dir: 'v', n: 44, c1: 'rgba(0,0,0,0)', c2: 'rgba(80,80,80,.18)' },
    { t: 'fence', x: 5250, y: F2, w: 710, h: 50, fill: '#8a6240' },
    sign(5280, 1683, 300, 'ジャイアントパンダ', '#222', '#fff', 26),

    ...hedge,

    // ═══ 下の通路 ═══
    ...walk(P2, P2B - P2),
    prop('bench', 4880, P2 + 185, 70, { color: '#a0683a' }),
    prop('bench', 1650, P2B - 20, 70), prop('bench', 3450, P2B - 20, 70),
    prop('signpost', 2310, P2B - 10, 120, { text: '出口 ↓' }),
    ...furniture,

    // ═══ 下段：入口と管理事務所（0〜1000） ═══
    { t: 'rect', x: 0, y: R3, w: 1000, h: R3B - R3, fill: '#e8d7aa' },
    { t: 'stripes', x: 0, y: R3, w: 1000, h: R3B - R3, dir: 'h', n: 10, c1: 'rgba(0,0,0,0)', c2: 'rgba(150,110,50,.06)' },
    { t: 'building', x: 70, y: 2306, w: 440, h: 240, fill: '#f3e6c8', roof: '#b5523b', sign: '管理事務所', signSize: 34, signFill: '#fff', signColor: '#7a3b2a' },
    { t: 'building', x: 560, y: 2283, w: 170, h: 128, fill: '#fff', roof: '#2f7a4a', roofStyle: 'flat', sign: 'きっぷ', signSize: 24, signFill: '#2f7a4a', signColor: '#fff', windows: false, door: false },
    { t: 'rect', x: 760, y: 2230, w: 30, h: 190, fill: '#2f7a4a' }, { t: 'rect', x: 940, y: 2230, w: 30, h: 190, fill: '#2f7a4a' },
    sign(735, 2190, 260, 'なかよし動物園', '#2f7a4a', '#fff', 30, 62),
    prop('pot', 60, 2337, 70), prop('pot', 530, 2337, 70), prop('flower', 760, 2384, 50, { color: '#ff6f91' }), prop('flower', 1020, 2384, 50, { color: '#ffd23f' }),

    // フラミンゴの池（1040〜1960）
    { t: 'rect', x: 1000, y: R3, w: 990, h: R3B - R3, fill: '#a6d57a' },
    { t: 'ellipse', x: 1500, y: 2197, rx: 440, ry: 156, fill: '#e8d8a8' },
    { t: 'ellipse', x: 1500, y: 2197, rx: 410, ry: 137, fill: '#5ab4e6' },
    { t: 'ellipse', x: 1440, y: 2158, rx: 260, ry: 62, fill: 'rgba(255,255,255,.18)' },
    { t: 'emoji', e: '🦩', x: 1240, y: 2150, s: 70 }, { t: 'emoji', e: '🦩', x: 1310, y: 2181, s: 64 }, { t: 'emoji', e: '🦩', x: 1700, y: 2134, s: 70 }, { t: 'emoji', e: '🦩', x: 1760, y: 2181, s: 60 },
    { t: 'emoji', e: '🦆', x: 1500, y: 2259, s: 40 }, { t: 'emoji', e: '🦢', x: 1600, y: 2251, s: 54 },
    prop('boat', 1420, 2228, 50, { color: '#ffffff' }),
    prop('palm', 1080, 2150, 200), prop('bush', 1930, 2103, 60, { color: '#3f9a44', flower: '#ff6f91' }),
    sign(1380, 2353, 240, 'フラミンゴの池', '#e0607a', '#fff', 26, 50),

    // ピクニック広場（1990〜2720）
    { t: 'rect', x: 1990, y: R3, w: 740, h: R3B - R3, fill: '#9fd06e' },
    prop('tree', 2080, 2119, 240, { color: '#3f9e4a', fruit: '#ff5a5a' }), prop('tree', 2660, 2087, 220, { color: '#4caf50' }),
    prop('parasol', 2260, 2244, 150, { color: '#ff5a5a' }), prop('table', 2260, 2244, 60, { cloth: '#ffe6ea' }),
    prop('parasol', 2480, 2330, 150, { color: '#ffd23f' }), prop('table', 2480, 2330, 60, { cloth: '#e6f4ff' }),
    { t: 'rect', x: 2120, y: 2322, w: 150, h: 55, fill: '#e2463c', r: 6 }, { t: 'stripes', x: 2120, y: 2322, w: 150, h: 55, dir: 'v', n: 6, c1: 'rgba(0,0,0,0)', c2: 'rgba(255,255,255,.6)' },
    prop('tulip', 2380, 2103, 40, { color: '#c77dff' }), prop('tulip', 2420, 2111, 40, { color: '#ff4d6d' }),

    // レストラン・トイレ（2730〜3400）
    { t: 'rect', x: 2730, y: R3, w: 670, h: R3B - R3, fill: '#e8d7aa' },
    { t: 'building', x: 2760, y: 2322, w: 420, h: 240, fill: '#fff0e0', roof: '#3a8a5a', sign: 'レストラン サバンナ', signSize: 26, signFill: '#3a8a5a', signColor: '#fff', awning: '#3a8a5a' },
    { t: 'building', x: 3210, y: 2306, w: 170, h: 136, fill: '#e8f0f8', roof: '#4a7ab0', roofStyle: 'flat', sign: 'WC', signSize: 26, signFill: '#4a7ab0', signColor: '#fff', windows: false },
    prop('vending', 3250, 2384, 110, { color: '#3a8ad8' }), prop('vending', 3330, 2384, 110, { color: '#e2463c' }),

    // 噴水広場（3400〜4320）
    { t: 'rect', x: 3400, y: R3, w: 920, h: R3B - R3, fill: '#efe0b6' },
    { t: 'ellipse', x: 3860, y: 2197, rx: 380, ry: 140, fill: '#e3cf9c' },
    { t: 'ellipse', x: 3860, y: 2197, rx: 300, ry: 101, fill: '#cfc7b4', stroke: '#9a907a' },
    prop('fountain', 3860, 2251, 260),
    prop('bench', 3530, 2150, 70), prop('bench', 4190, 2150, 70), prop('bench', 3540, 2361, 70), prop('bench', 4180, 2361, 70),
    prop('flower', 3460, 2040, 46, { color: '#ff6f91' }), prop('flower', 3500, 2056, 46, { color: '#ffd23f' }), prop('flower', 4240, 2048, 46, { color: '#c77dff' }), prop('flower', 4280, 2040, 46, { color: '#ff9a3a' }),
    { t: 'emoji', e: '🎈', x: 4050, y: 2056, s: 40 }, { t: 'emoji', e: '🎈', x: 4080, y: 2040, s: 36 },

    // おみやげ（4320〜4930）
    { t: 'rect', x: 4320, y: R3, w: 610, h: R3B - R3, fill: '#e8d7aa' },
    { t: 'building', x: 4360, y: 2314, w: 540, h: 264, fill: '#fde3ef', roof: '#c04a7a', sign: 'おみやげ ズーショップ', signSize: 26, signFill: '#fff', signColor: '#c04a7a', awning: '#c04a7a', goods: ['#ffb3c8', '#ffd23f', '#9ad0f0', '#c8f09a'] },
    prop('pot', 4340, 2384, 60), prop('pot', 4920, 2384, 60),

    // オウムの森（4950〜5960）
    { t: 'rect', x: 4940, y: R3, w: 1060, h: R3B - R3, fill: '#e8d7aa' },
    { t: 'rect', x: 4960, y: R3 + 30, w: 1000, h: 340, fill: '#bfe39a', r: 20 },
    prop('palm', 5040, 2228, 260), prop('palm', 5860, 2212, 280), prop('tree', 5650, 2150, 200, { color: '#3f9e4a' }),
    { t: 'rect', x: 5290, y: 2056, w: 16, h: 195, fill: '#7a5a3a' }, { t: 'rect', x: 5200, y: 2150, w: 200, h: 11, fill: '#7a5a3a' },
    { t: 'emoji', e: '🦜', x: 5560, y: 2079, s: 44 }, { t: 'emoji', e: '🦜', x: 5120, y: 2103, s: 40 }, { t: 'emoji', e: '🌺', x: 5450, y: 2212, s: 40 }, { t: 'emoji', e: '🌺', x: 5760, y: 2220, s: 36 },
    { t: 'stripes', x: 4960, y: R3 + 30, w: 1000, h: 340, dir: 'v', n: 60, c1: 'rgba(0,0,0,0)', c2: 'rgba(90,90,90,.14)' },
    { t: 'fence', x: 4960, y: 2259, w: 1000, h: 44, fill: '#d8b47a' },
    sign(5620, 2215, 280, 'おしゃべりオウム', '#2a8a4a', '#fff', 26),
    prop('bench', 5450, 2337, 70, { color: '#a0683a' }), prop('flower', 5700, 2384, 46, { color: '#ff6f91' }), prop('flower', 5300, 2384, 46, { color: '#ffd23f' }),

    // ═══ 園の外（生け垣と道路） ═══
    { t: 'rect', x: 0, y: R3B, w: W, h: 2700 - R3B, fill: '#6aa84a' },
    ...Array.from({ length: 55 }, (_, i) => prop('bush', 50 + i * 110, R3B + 40, 44, { color: i % 2 ? '#3f9a44' : '#4caf50' })),
    { t: 'road', x: 0, y: 2520, w: W, h: 120 },
    prop('bus', 1500, 2620, 90, { color: '#3a8ad8' }), prop('car', 3600, 2610, 70, { color: '#ffd23f' }), prop('car', 5000, 2610, 70, { color: '#e2463c' }),
    prop('car', 800, 2560, 60, { color: '#ffffff' }),
  ],

  actors: {
    // ── 人間 ──
    manager: {
      name: '園長 大森', x: 700, y: 2087, wander: 90, speed: 50,
      look: { h: 172, hair: 'bald', hairColor: '#777', shirt: '#2f5a3a', pants: '#3a3a3a', acc: ['tie', 'mustache'], wide: true },
      idle: [
        'うちの園は、清潔さと動物のかしこさが自慢でしてね',
        'テレビ取材、来ないかなあ……そわそわ',
        { text: '最近の客は「なにも起きない」って言うんだよなあ……', when: [notDone('S4-E05'), notDone('S4-E14')] },
        { text: 'リポーターさんがこっちを見てる……？ 声をかけてくれないかなあ', when: [done('S4-E05'), done('S4-E14')] },
      ],
    },
    reporter: {
      name: 'リポーター 真鍋', x: 880, y: 2150, wander: 120, speed: 60,
      look: { h: 168, hair: 'bob', hairColor: '#3a2a1a', shirt: '#e05a7a', pants: '#333', skirt: true, acc: ['earring'] },
      idle: [
        'なにか「絵になる」事件はないかしら……',
        '人と動物がなかよし、みたいな映像が撮れたら最高なんだけど',
        { text: 'サル山でバナナさわぎ？ うーん、もうひとネタほしいわね', when: [done('S4-E05'), notDone('S4-E14')] },
        { text: 'ゾウがお片づけ？ いいわね。でも笑いがもうひと押し……', when: [done('S4-E14'), notDone('S4-E05')] },
        { text: '撮れ高はばっちり！ あとは責任者のコメントだけね', when: [done('S4-E05'), done('S4-E14')] },
      ],
    },
    complainer: {
      name: 'ぶつぶつ言う客', x: 300, y: 1042, path: [[300, 1042], [1300, 1064], [2250, 1035], [1300, 1064]], speed: 45,
      look: { h: 164, hair: 'short', hairColor: '#555', shirt: '#8a8a7a', pants: '#4a4a4a', acc: ['cap'], old: true },
      idle: ['ふん、つまらん動物園だ', 'サルはケンカ、カバは昼寝。入園料を返してほしいね', '閉園までに、なにか起きるのかねえ'],
    },
    keeper1: {
      name: '飼育員 柴田', x: 600, y: 963, path: [[200, 963], [1200, 963]], speed: 40,
      look: { h: 168, hair: 'pony', hairColor: '#4a2e1e', shirt: '#6a8a3a', pants: '#4a5a2a', acc: ['cap'], hatColor: '#6a8a3a' },
      idle: [
        { text: 'またケンカ……。子ザルがまきこまれないといいけど', when: [notDone('S4-E01')] },
        { text: 'こういうのは私が止めるより、群れのリーダーが出るのが一番なのよね', when: [done('S4-E01'), notDone('S4-E02'), notDone('S4-E03')] },
        { text: 'ボスがへそを曲げちゃった……もう知らない', when: [done('S4-E02')] },
        { text: 'ボスの好物？ 売店で売ってる小さいバナナよ。人間は食べちゃダメよ？', when: [done('S4-E03')] },
        '今日はお客さん多いなあ',
      ],
    },
    haruto: {
      name: '男の子 ハルト', x: 420, y: 999, wander: 80, speed: 70,
      look: { h: 122, kid: true, hair: 'spiky', hairColor: '#222', shirt: '#3a8ae0', pants: '#333' },
      idle: [
        { text: 'サルがケンカしてる！ ……あっ、ちっちゃいのがいる！', when: [notDone('S4-E01')] },
        'ボス猿ってどれ？ いちばん偉そうなやつ？',
        { text: 'お母さんザル、かっこよかった！', when: [done('S4-E01')] },
        { text: 'あの看板、ボス猿の毛並みが自慢なんだって。マネする人いるかな', when: [notDone('S4-E04'), notDone('S4-E05')] },
      ],
    },
    ren: {
      name: '大食いのレン', x: 1000, y: 1057, wander: 90, speed: 55,
      look: { h: 176, hair: 'short', hairColor: '#2a2a2a', shirt: '#f2a03a', pants: '#3a4a6a', wide: true },
      idle: [
        'はらへった……朝から何も食べてない',
        'このへん、なんか食べもの売ってない？',
        { text: 'サルってなに食べてるんだろ。うまそうなもの食べてたりして', when: [notDone('S4-E05')] },
        { text: 'げふっ。サル用でもバナナはバナナ！', when: [done('S4-E05')] },
      ],
    },
    sawako: {
      name: 'マダム 佐和子', x: 820, y: 1100, wander: 60, speed: 40,
      look: { h: 166, hair: 'bun', hairColor: '#3a2a3a', shirt: '#9a4ac0', pants: '#5a3a6a', skirt: true, acc: ['earring', 'sunglasses'] },
      idle: [
        'あたくしの髪、今朝は三時間かけましたのよ',
        { text: '「自慢は毛並み」ですって？ おサルのくせに生意気ね', when: [notDone('S4-E04')] },
        { text: 'どう？ ボスにも負けないボリュームでしょ', when: [done('S4-E04')] },
      ],
    },
    erika: {
      name: 'モデル風の エリカ', x: 1450, y: 1021, wander: 110, speed: 45,
      look: { h: 178, hair: 'long', hairColor: '#c9a227', shirt: '#fafafa', pants: '#d0b0a0', skirt: true, acc: ['sunglasses', 'bag'] },
      idle: ['クジャクって、羽を広げると本当にきれいなのよね', 'ねえクジャクさん、広げて見せてくれない？', { text: 'あら、さっきの男の人……大丈夫かしら', when: [done('S4-E09')] }],
    },
    masaru: {
      name: '夫 マサル', x: 1640, y: 1042, wander: 50, speed: 45,
      look: { h: 174, hair: 'short', hairColor: '#333', shirt: '#4a6a9a', pants: '#3a3a3a', acc: ['glasses'] },
      idle: [
        'クジャクのオス、ふられてるなあ……わかるぞ',
        { text: '……あっちの女性、きれいだなあ（小声）', when: [notDone('S4-E08')] },
        { text: 'いてて……ほっぺたがまだ熱い', when: [done('S4-E09')] },
      ],
    },
    noriko: {
      name: '妻 ノリコ', x: 1740, y: 1057, wander: 40, speed: 45,
      look: { h: 164, hair: 'bob', hairColor: '#4a2a1a', shirt: '#e08a3a', pants: '#5a4a3a', acc: ['bag'] },
      idle: [
        'うちの人、すぐよそ見するのよ',
        { text: 'クジャクのメスはえらいわね。安い愛想に乗らないもの', when: [notDone('S4-E07')] },
        { text: '……なによ、そこのおサル。こっち見て', when: [done('S4-E09'), notDone('S4-E10')] },
      ],
    },
    tsuchiya: {
      name: '財布をなくした 土屋', x: 2300, y: 1049, wander: 120, speed: 60,
      look: { h: 170, hair: 'short', hairColor: '#5a3a2a', shirt: '#a0c0d0', pants: '#4a4a5a', acc: ['bag'] },
      idle: [
        { text: 'ない、ない……財布がない！ さっきカバを見てたときまではあったのに', when: [notDone('S4-E11')] },
        { text: 'カバって口の中、どうなってるんだろう', when: [notDone('S4-E11')] },
        { text: 'あれは絶対ぼくの財布！ 長い棒みたいなものがあれば……', when: [done('S4-E11'), notDone('S4-E12'), notDone('S4-E13')] },
        { text: '財布もどった！ ……くさいけど', when: [{ anyEventDone: ['S4-E12', 'S4-E13'] }] },
      ],
    },
    cleaner: {
      name: '清掃員 権田', x: 2450, y: 1100, path: [[2000, 1100], [2860, 1114], [2860, 1064], [2000, 1064]], speed: 40,
      look: { h: 168, hair: 'short', hairColor: '#888', shirt: '#3a7ab0', pants: '#2a4a6a', acc: ['cap', 'apron'], hatColor: '#3a7ab0' },
      idle: [
        '動物園はきれいが一番。ゴミひとつ見のがさないぞ',
        'カバくんも一度ゴシゴシ洗ってみたいもんだ',
        { text: 'あそこに何か落ちてる……バナナの皮か？', when: [done('S4-E05'), notDone('S4-E06')] },
        { text: 'ゴミ箱が倒れてる！ でも重くて起こせん……', when: [done('S4-E12'), notDone('S4-E14')] },
        { text: 'ゾウに片づけを教わる日が来るとはなあ', when: [done('S4-E14')] },
      ],
    },
    smoker: {
      name: 'タバコの男', x: 3550, y: 1042, wander: 40, speed: 35,
      look: { h: 176, hair: 'mohawk', hairColor: '#222', shirt: '#555', pants: '#222', acc: ['sunglasses'] },
      idle: ['ふう〜……（禁煙の看板は見ないふり）', '一服くらい、いいだろ', { text: 'げっ、タバコどこ行った？ ……わら、燃えてないよな？', when: [done('S4-E17'), notDone('S4-E19')] }],
    },
    sota: {
      name: 'いたずらっ子 ソウタ', x: 4120, y: 1877, wander: 100, speed: 80,
      look: { h: 124, kid: true, hair: 'spiky', hairColor: '#3a2a1a', shirt: '#e03a3a', pants: '#2a2a5a', acc: ['cap'] },
      idle: [
        'ねー、なんかおいしいもの食べたい〜',
        { text: 'ミオだけアイス買ってもらってずるい！', when: [{ objectVisible: 'icecream' }, notDone('S4-E17')] },
        { text: 'ゾウってシャワー持ってるみたいだね！', when: [done('S4-E16')] },
        { text: 'ちぇっ、ゾウの鼻、反則だよ……', when: [done('S4-E18')] },
      ],
    },
    mio: {
      name: '妹 ミオ', x: 4260, y: 1898, wander: 40, speed: 50,
      look: { h: 112, kid: true, hair: 'twin', hairColor: '#3a2a1a', shirt: '#f7b6d0', pants: '#7a5aa0', skirt: true },
      idle: [
        { text: 'アイス食べたいなあ……', when: [{ not: { objectVisible: 'icecream' } }, notDone('S4-E17')] },
        { text: 'アイスかってもらった！ お兄ちゃんにはあげない！', when: [{ objectVisible: 'icecream' }, notDone('S4-E17')] },
        { text: 'うえーん！ だれか、あのアイスとりかえしてー！', when: [done('S4-E17'), notDone('S4-E18')] },
        { text: 'ゾウさん、だいすき！', when: [done('S4-E18')] },
      ],
    },
    kazuma: {
      name: '昼寝中の カズマ', x: 4880, y: 1877, wander: 0, speed: 60,
      look: { h: 174, hair: 'afro', hairColor: '#2a2a2a', shirt: '#7aa07a', pants: '#4a4a3a', sit: true },
      idle: [
        { text: 'うう……くるな……ライオン……（うなされている）', when: [notDone('S4-E20')] },
        { text: 'ZZZ……たてがみが……せまってくる……', when: [notDone('S4-E20')] },
        { text: 'ほ、本物はやっぱりこわい！ 高いところ、高いところ……', when: [done('S4-E20'), notDone('S4-E21')] },
        { text: '木の上は安全……だよね？ おりられないけど', when: [done('S4-E21')] },
      ],
    },
    yui: {
      name: 'リボンの ユイ', x: 1150, y: 1884, wander: 90, speed: 55,
      look: { h: 120, kid: true, hair: 'twin', hairColor: '#6a4a2a', shirt: '#b08060', pants: '#5a3a2a', skirt: true, acc: ['ribbon'] },
      idle: ['このリボン、もふもふでかわいいでしょ？', 'カンガルーのおなか、なにか入ってるのかな', { text: 'タヌキにまちがえるなんて、しつれいしちゃう！', when: [done('S4-E22')] }],
    },
    keeper2: {
      name: '飼育員 野々村', x: 1300, y: 1848, path: [[950, 1848], [2300, 1855], [3050, 1841], [2300, 1855]], speed: 50,
      look: { h: 172, hair: 'short', hairColor: '#2a2a2a', shirt: '#6a8a3a', pants: '#4a5a2a', acc: ['cap', 'glasses'], hatColor: '#6a8a3a' },
      idle: [
        { text: 'タヌキが一匹逃げたらしい。耳がまるくて茶色くて……', when: [notDone('S4-E22')] },
        { text: 'うさぎ小屋の数が合わない……一羽どこ行った？', when: [notDone('S4-E38')] },
        { text: 'タヌキは化けるっていうけど、しっぽまでは隠せないはず', when: [done('S4-E22'), notDone('S4-E23')] },
        { text: 'ウサギは物音に敏感でね。子どもの声がすると、ひょっこり顔を出すんだけど', when: [done('S4-E38'), notDone('S4-E39')] },
      ],
    },
    tanukiGirl: {
      name: 'しっぽの女の子', x: 2700, y: 1884, wander: 70, speed: 50,
      look: { h: 116, kid: true, hair: 'bob', hairColor: '#7a5a3a', shirt: '#a07a50', pants: '#6a4a2a', skirt: true, acc: ['flower'] },
      idle: ['……ポン。', 'わたし、ふつうの女の子だよ？ ほんとだよ？', '（スカートのうしろから、ふさふさの何かが……）'],
    },
    kenta: {
      name: '観察好きの ケンタ', x: 5750, y: 1093, wander: 80, speed: 70,
      look: { h: 126, kid: true, hair: 'short', hairColor: '#222', shirt: '#4ab08a', pants: '#3a3a3a', acc: ['glasses', 'cap'] },
      idle: [
        { text: 'パンダ舎の中、ここからじゃ見えないなあ。高いところからなら……', when: [notDone('S4-E26')] },
        'カメレオンって、ほんとうに消えるのかな？',
        { text: 'おりられない……だれか背の高い人……', when: [done('S4-E26'), notDone('S4-E27')] },
        { text: 'いま、カメレオンが消えた！？ 消えたように見えるだけだよね', when: [done('S4-E33'), notDone('S4-E34')] },
      ],
    },
    fans: {
      name: 'パンダ観覧客', x: 5550, y: 1877, wander: 120, speed: 40,
      look: { h: 166, hair: 'long', hairColor: '#222', shirt: '#fafafa', pants: '#222', acc: ['camera', 'headphones'] },
      idle: ['ミルクちゃん、こっち向いてー！', 'ゴロスケくんの塩対応、たまらない……', 'パンダが一番かわいい瞬間を撮りたいの'],
    },
    ryu: {
      name: 'パンクな リュウ', x: 700, y: 1898, path: [[700, 1898], [300, 1920], [700, 1898], [1000, 1920]], speed: 55,
      look: { h: 178, hair: 'mohawk', hairColor: '#e03a8a', shirt: '#222', pants: '#333', acc: ['earring', 'sunglasses'] },
      idle: [
        'トゲトゲ頭はロックの魂だぜ',
        'オレと張りあえるトゲ、どっかにいねえかな',
        { text: '売店の横の小さい館、なんかチクチクしたやつがいるな……', when: [flag('punk.atKiosk')] },
      ],
    },
    takumi: {
      name: 'そわそわ タクミ', x: 5450, y: 2337, wander: 0, speed: 50,
      look: { h: 174, hair: 'short', hairColor: '#3a2a1a', shirt: '#fafafa', pants: '#3a4a6a', acc: ['tie'], sit: true },
      idle: [
        { text: 'もうすぐデートの相手が来る……なんて言えばいいんだ……', when: [notDone('S4-E41'), notDone('S4-E32')] },
        { text: 'だれか、気のきいたセリフを教えてくれないかな……', when: [notDone('S4-E41'), notDone('S4-E32')] },
        { text: 'まだ世界がぐるぐるしてる……', when: [done('S4-E32')] },
        { text: 'うまく言えた……！ でも、だれかに聞かれてないよな？', when: [done('S4-E41'), notDone('S4-E40')] },
      ],
    },
    saki: {
      name: 'デートの相手 サキ', x: 5900, y: 2377, hidden: true, wander: 30, speed: 70,
      look: { h: 166, hair: 'long', hairColor: '#5a3a2a', shirt: '#f7d0a0', pants: '#7a9aba', skirt: true, acc: ['bag'] },
      idle: ['タクミくん、今日はなんだか緊張してる？', 'オウムってなんでもマネするのね'],
    },
    kai: {
      name: '男の子 カイ', x: 480, y: 1869, wander: 90, speed: 70,
      look: { h: 120, kid: true, hair: 'short', hairColor: '#222', shirt: '#f2d03a', pants: '#3a6ab0' },
      idle: ['ヤギさん、なんでも食べるんだって！', 'ヤギさんのごはん、どこで売ってるの？', { text: 'ヤギって紙が好きなんだ！ ほかに紙ないかなあ', when: [done('S4-E36'), notDone('S4-E37')] }],
    },
    kaiDad: {
      name: 'カイの父', x: 650, y: 1884, wander: 50, speed: 45,
      look: { h: 178, hair: 'short', hairColor: '#333', shirt: '#7a9a6a', pants: '#4a4a4a', acc: ['glasses', 'bag'] },
      idle: [
        'カイ、あんまり柵に近づくなよ',
        { text: 'さっきから向こうが騒がしいな。何があったんだ？', when: [{ not: { objectVisible: 'map' } }, notDone('S4-E36')] },
        { text: 'ええと、地図によると次は……', when: [{ objectVisible: 'map' }, notDone('S4-E36')] },
        { text: '地図が……。ま、まさか財布の中身までは……', when: [done('S4-E36'), notDone('S4-E37')] },
      ],
    },
    twins: {
      name: '双子のアオとミドリ', x: 5100, y: 1042, wander: 40, speed: 80,
      look: { h: 118, kid: true, hair: 'bob', hairColor: '#222', shirt: '#5ab0e0', pants: '#4ab05a', acc: ['cap'] },
      idle: [
        { text: 'ねえおじいちゃん、キリンってなんで首が長いの？', when: [notDone('S4-E42')] },
        'つぎはどこ行く？ どこ行く？',
        { text: 'おサルのお尻って、なんで赤いの？', when: [done('S4-E42'), notDone('S4-E43')] },
        { text: 'ゾウさんのお鼻、なんであんなに長いの？', when: [done('S4-E43'), notDone('S4-E44')] },
        { text: 'ウサギの目って、なんで赤いの？', when: [done('S4-E44'), notDone('S4-E45')] },
      ],
    },
    grandpa: {
      name: '祖父', x: 5230, y: 1057, wander: 30, speed: 60,
      look: { h: 160, hair: 'bald', hairColor: '#ddd', shirt: '#8a7a5a', pants: '#4a4a3a', acc: ['beard', 'hat'], hatColor: '#6a5a3a', old: true },
      idle: [
        '動物のことなら、なんでも聞いとくれ',
        'わしも若いころは、動物博士と呼ばれたもんじゃ',
        { text: 'ふう、ふう……ちと歩きすぎたかのう。どこか腰かけられる岩でも……', when: [done('S4-E45'), notDone('S4-E46')] },
      ],
    },

    // ── 動物 ──
    boss: {
      name: 'ボス猿 ドンガラ', emoji: '🐒', size: 110, x: 650, y: 431, wander: 40, speed: 40,
      idle: ['ウキ。（いちばん高いところが、わしの席）', { text: 'ウッキー……（若い者はけんかばかりじゃ）', when: [notDone('S4-E03')] }, { text: 'ウキッ♪（バナナうまい）', when: [done('S4-E03')] }],
    },
    fight: {
      name: 'ケンカ中のサルたち', emoji: '🐒', size: 95, x: 600, y: 754, wander: 70, speed: 160,
      idle: ['キーッ！ キキーッ！', 'ギャッギャッ！（それオレの石！）', 'ウキャーッ！'],
    },
    momMonkey: {
      name: '母ザル', emoji: '🐒', size: 80, x: 330, y: 737, wander: 40, speed: 50,
      idle: [{ text: 'ウキ……（坊や、どこ行ったの）', when: [notDone('S4-E01')] }, { text: 'ウキ〜（もう離さないわ）', when: [done('S4-E01')] }],
    },
    kozaru: {
      name: '子ザル', emoji: '🐒', size: 50, x: 700, y: 798, wander: 50, speed: 90,
      idle: ['キッ？', { text: 'キキッ！（パシーン！ ごっこ）', when: [done('S4-E09')] }, 'キ〜（おなかすいた）'],
    },
    peacock: {
      name: 'オスのクジャク', emoji: '🦚', size: 110, x: 1520, y: 789, wander: 90, speed: 45,
      idle: ['クェーッ！（見て見て、ぼくを見て！）', { text: '……（メスに相手にされず、しょんぼり）', when: [done('S4-E07')] }, 'クェッ（もっときれいな人が見てくれたら、本気出すのに）'],
    },
    peahen: {
      name: 'メスのクジャク', emoji: '🐦', size: 70, x: 1760, y: 841, wander: 70, speed: 40,
      idle: ['クッ。（興味ないわ）', '……（地面の虫をつついている）'],
    },
    hippo: {
      name: 'カバ', emoji: '🦛', size: 190, x: 2450, y: 824, wander: 30, speed: 25,
      idle: ['ブフォ〜……（あくび）', '（口がもごもご……何かはさまってる？）', { text: 'ブホッ（鼻がむずむずする）', when: [done('S4-E11'), notDone('S4-E12'), notDone('S4-E13')] }],
    },
    bird: {
      name: 'カバの相棒の小鳥', emoji: '🐦', size: 44, x: 2700, y: 684, wander: 90, speed: 80,
      idle: ['チュン（カバくんの歯そうじ係です）', 'チチッ（はさまったものは、つい取りたくなる）'],
    },
    elephant: {
      name: 'ゾウ', emoji: '🐘', size: 260, x: 3350, y: 806, wander: 160, speed: 45,
      idle: ['パオ〜（鼻はなんでもつかめるよ）', '（水たまりのほうをチラチラ見ている）', { text: 'パオ？（さっき、外で何か倒れた音が）', when: [done('S4-E12'), notDone('S4-E14')] }, { text: 'パオッ（片づけ、とくい）', when: [done('S4-E14')] }],
    },
    lion: {
      name: 'ライオン', emoji: '🦁', size: 160, x: 4300, y: 789, wander: 140, speed: 50,
      idle: ['ガウ……（昼寝したい）', 'グルル……（たてがみ、今日もきまってる）', { text: 'ガウ？（木の上のあいつ、なにしてる？）', when: [done('S4-E21')] }],
    },
    tapir: {
      name: 'バク', emoji: '🐗', size: 120, x: 4800, y: 1558, wander: 120, speed: 40,
      idle: ['フゴ……（ゆめ、たべたい）', 'フゴフゴ（悪い夢ほど、においが強い）', { text: 'フゴッ！（ボクのごはん、返して！）', when: [done('S4-E24')] }],
    },
    giraffe: {
      name: '大人キリン', emoji: '🦒', size: 340, x: 5100, y: 841, wander: 140, speed: 40,
      idle: ['ムォ……（高いところは、まかせて）', '（となりのバク舎のエサをじっと見ている）', 'ムォ〜（首が長いと、いろいろ届く）'],
    },
    babyGiraffe: {
      name: '子キリン', emoji: '🦒', size: 170, x: 5380, y: 876, wander: 90, speed: 50,
      idle: ['ミュ〜（あの葉っぱ、とどかない）', { text: 'ミュ♪（おいしかった）', when: [done('S4-E25')] }],
    },
    milk: {
      name: 'パンダのミルク', emoji: '🐼', size: 110, x: 5400, y: 1471, wander: 100, speed: 35,
      idle: ['（ごろーん）', 'ムシャムシャ（笹おいしい）', '（遊び道具を探している）'],
    },
    gorosuke: {
      name: 'パンダのゴロスケ', emoji: '🐼', size: 125, x: 5620, y: 1610, wander: 90, speed: 35,
      idle: ['フンッ（見るな）', '（客に背中を向けている）', 'ガル……（丸いもの、きらい）'],
    },
    hedgehog: {
      name: 'ハリネズミ', emoji: '🦔', size: 56, x: 3300, y: 1697, wander: 60, speed: 30,
      idle: ['ピス……（トゲには自信あり）', 'ピスピス（ライバル、いないかな）'],
    },
    chameleon: {
      name: 'カメレオン', emoji: '🦎', size: 58, x: 3600, y: 1679, wander: 30, speed: 15,
      idle: ['（目がぐるぐる別々に動いている）', '……（びっくりすると、すぐ色が変わる）'],
    },
    goat: {
      name: 'ヤギ', emoji: '🐐', size: 100, x: 480, y: 1575, wander: 160, speed: 50,
      idle: ['メェ〜（紙、おいしい）', 'メェ（なんでもかじってみる主義）', { text: 'メェ〜（もっと紙！）', when: [done('S4-E36')] }],
    },
    kangaroo: {
      name: 'カンガルー', emoji: '🦘', size: 160, x: 1230, y: 1540, wander: 0, speed: 50,
      idle: ['（おなかの袋が、もぞもぞ動いている）', 'ピョン？（袋が重い気がする）'],
    },
    parrot: {
      name: 'オウム', emoji: '🦜', size: 72, x: 5300, y: 2150, wander: 20, speed: 30,
      idle: ['オハヨー！ オハヨー！', 'キイタコト、ナンデモ、マネスル！', { text: 'キミノホウガ……カワイイヨ……（練習中）', when: [done('S4-E41'), notDone('S4-E40')] }],
    },
    babyTurtle: {
      name: '子ガメ', emoji: '🐢', size: 40, x: 2600, y: 1688, wander: 80, speed: 12,
      idle: ['ノソ……（高いところから景色を見たい）', { text: 'ノソノソ（あの大きいのに、のぼりたい）', when: [done('S4-E46'), notDone('S4-E47')] }],
    },
  },

  objects: {
    // サル山
    monkeySign: { name: 'サル山の看板', sign: { text: 'ボス猿ドンガラ 自慢は毛並み', fill: '#f6e7b0', color: '#5a3a1a', s: 18 }, w: 240, h: 76, x: 520, y: 1006 },
    bananaPeel: { name: 'バナナの皮', emoji: '🍌', size: 34, x: 1020, y: 1110, hidden: true, rot: 2.6 },
    endPeel: { name: 'バナナの皮', emoji: '🍌', size: 34, x: 590, y: 2193, hidden: true, capturable: false, rot: 0.8 },
    // カバ
    hippoMouth: { name: 'カバの口（キラッ）', emoji: '✨', size: 30, x: 2400, y: 780, minZoom: 1.3, z: 905 },
    walletInMouth: { name: 'カバの口の財布', emoji: '👛', size: 34, x: 2400, y: 789, hidden: true, z: 906 },
    brush: { name: 'デッキブラシ', emoji: '🧹', size: 56, x: 2120, y: 1035, rot: 0.3 },
    trashStanding: { name: 'ゴミ箱', emoji: '🗑️', size: 50, x: 2900, y: 1035 },
    trashFallen: { name: '倒れたゴミ箱', emoji: '🗑️', size: 50, x: 2900, y: 1042, hidden: true, rot: 1.6 },
    // ゾウ・売店
    puddle: { name: '象舎の水たまり', emoji: '💧', size: 52, x: 3220, y: 850 },
    icecream: { name: 'ミオのアイス', emoji: '🍦', size: 36, x: 4290, y: 1869, hidden: true },
    stolenIce: { name: '奪われたアイス', emoji: '🍦', size: 36, x: 3650, y: 1042, hidden: true },
    cigarette: { name: '落ちたタバコ', emoji: '🚬', size: 30, x: 3510, y: 1078, hidden: true, minZoom: 1.1 },
    // バク・ライオン
    nightmare: { name: 'うなされる夢', emoji: '💭', size: 60, x: 4900, y: 1769 },
    lionTree: { name: 'ライオン舎そばの木', emoji: '🌳', size: 210, x: 3930, y: 1128, z: 1000 },
    tapirFood: { name: 'バクのエサ', emoji: '🥬', size: 40, x: 4960, y: 1211 },
    // キリン・パンダ
    pandaTree: { name: 'パンダ舎そばの木', emoji: '🌳', size: 210, x: 5900, y: 1128, z: 1000 },
    tire: { name: 'タイヤ', emoji: '🛞', size: 56, x: 5500, y: 1566 },
    // 小動物館
    hiddenCham: { name: '葉っぱの……何か？', emoji: '🦎', size: 24, x: 3250, y: 1610, hidden: true, minZoom: 1.6, rot: 0.4 },
    // ヤギ・カンガルー・ウサギ
    map: { name: '園内マップ', emoji: '🗺️', size: 40, x: 760, y: 1833, hidden: true },
    pouch: { name: 'カンガルーの袋', emoji: '👝', size: 28, x: 1249, y: 1518, minZoom: 1.3, z: 1785 },
    strayRabbit: { name: '木のそばのウサギ', emoji: '🐇', size: 40, x: 2120, y: 1471, hidden: true },
    // カメの池
    rock: { name: '池のほとりの大きな岩', emoji: '🪨', size: 100, x: 2950, y: 1723 },
    bigTurtle: { name: '親ガメ', emoji: '🐢', size: 100, x: 2950, y: 1723, hidden: true },
    tanuki: { name: 'タヌキ', emoji: '🦝', size: 60, x: 2700, y: 1884, hidden: true, capturable: false },

    // ── イベントのない小物（ダミー） ──
    mapBoard: { name: '園内案内板', sign: { text: '園内マップ', fill: '#2f7a4a', color: '#fff', s: 22 }, w: 150, h: 84, x: 640, y: 2395 },
    balloon: { name: '風船', emoji: '🎈', size: 46, x: 3600, y: 2181 },
    popcorn: { name: 'ポップコーン', emoji: '🍿', size: 34, x: 3950, y: 2306, minZoom: 1.1 },
    juice: { name: 'ジュース', emoji: '🧃', size: 30, x: 4480, y: 1826, minZoom: 1.1 },
    hat: { name: '麦わら帽子', emoji: '👒', size: 40, x: 1850, y: 1128 },
    guidebook: { name: 'ガイドブック', emoji: '📘', size: 30, x: 1100, y: 1941, minZoom: 1.1 },
    bamboo: { name: '笹', emoji: '🎋', size: 50, x: 5330, y: 1697 },
    carrot: { name: 'ニンジン', emoji: '🥕', size: 32, x: 1950, y: 1645 },
    feedMachine: { name: 'エサの自販機', sign: { text: 'エサ 100円', fill: '#e0a03a', color: '#fff', s: 18 }, w: 90, h: 110, x: 900, y: 1841 },
    camera: { name: '置き忘れのカメラ', emoji: '📷', size: 30, x: 5530, y: 2330, minZoom: 1.2 },
    bottle: { name: 'ペットボトル', emoji: '🧴', size: 28, x: 3100, y: 1136, minZoom: 1.1 },
    stroller: { name: 'ベビーカー', emoji: '🛒', size: 52, x: 4100, y: 2353 },
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
      { type: 'ACTOR_MOVE', actorId: 'ryu', to: [4020, 1877], speed: 160, wander: 60 },
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
        { type: 'ACTOR_MOVE', actorId: 'momMonkey', to: [700, 789], speed: 260, wander: 0 },
        { type: 'ACTOR_MOVE', actorId: 'kozaru', to: [330, 754], speed: 220, wander: 30, delayMs: 1200 },
        { type: 'ACTOR_MOVE', actorId: 'momMonkey', to: [360, 745], speed: 220, wander: 30, delayMs: 1200 },
        { type: 'FX', kind: 'hearts', at: 'momMonkey', delayMs: 2400 },
        { type: 'ACTOR_SET_STATE', actorId: 'haruto', state: 'HAPPY', delayMs: 2400 },
      ],
      after: [{ actor: 'keeper1', text: 'よかった……でもケンカはまだ続いてる。私が出ていくと、かえってこじれるのよね', delay: 3600 }] },
    { id: 'S4-E02', s: 'fight', t: 'keeper1', cat: 'BRANCH', decoy: true, title: '飼育員、ケンカに割って入ってボロボロ', say: 'こらー！ やめなさーい！', anim: 'react.run', route: 'S4.route.monkey',
      requires: ['S4-E01'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'keeper1', to: [600, 963], speed: 200 },
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
        { type: 'ACTOR_MOVE', actorId: 'boss', to: [620, 737], speed: 220, wander: 20 },
        { type: 'FX', kind: 'big', at: 'boss', delayMs: 900 },
        { type: 'ACTOR_MOVE', actorId: 'fight', to: [950, 667], speed: 200, wander: 30, delayMs: 1300 },
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
        { type: 'ACTOR_MOVE', actorId: 'ren', to: [1000, 1093], speed: 140 },
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
        { type: 'ACTOR_MOVE', actorId: 'cleaner', to: [1040, 1107], speed: 260 },
        { type: 'HIDE_OBJECT', objectId: 'bananaPeel', delayMs: 2200 },
        { type: 'ACTOR_SPEECH', actorId: 'cleaner', text: 'ふう。園長に見られたら大目玉だったぞ', delayMs: 2600 },
        { type: 'ACTOR_MOVE', actorId: 'cleaner', to: [2450, 1100], speed: 120, wander: 60, delayMs: 4200 },
      ] },

    // ── クジャク ──
    { id: 'S4-E07', s: 'peahen', t: 'peacock', cat: 'FLAVOR', title: 'クジャクの求愛、空ぶり', say: 'クェーッ！（ほら、ぼくの羽を見て！）', anim: 'react.love', route: 'S4.route.peacock',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'peacock', to: [1700, 824], speed: 120 },
        { type: 'ACTOR_MOVE', actorId: 'peahen', to: [1860, 876], speed: 90, delayMs: 1000 },
        { type: 'ACTOR_SPEECH', actorId: 'peahen', text: '……（ガン無視）', delayMs: 1400 },
        { type: 'ACTOR_SET_STATE', actorId: 'peacock', state: 'SAD', delayMs: 2200 },
      ],
      after: [{ actor: 'masaru', text: 'わかる、わかるぞクジャク……', delay: 3200 }] },
    { id: 'S4-E08', s: 'erika', t: 'peacock', cat: 'CHAIN', title: 'クジャク、美女の前で羽を全開', say: 'クェェーーッ！！（本気モード！）', anim: 'react.sparkle', route: 'S4.route.peacock',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'peacock', to: [1480, 876], speed: 140 },
        { type: 'FX', kind: 'confetti', at: 'peacock', delayMs: 1000 },
        { type: 'FX', kind: 'sparkle', at: 'peacock', delayMs: 1200 },
        { type: 'ACTOR_MOVE', actorId: 'erika', to: [1490, 1006], speed: 100 },
        { type: 'ACTOR_SPEECH', actorId: 'erika', text: 'まあ、なんてきれい！', delayMs: 1600 },
        { type: 'ACTOR_MOVE', actorId: 'masaru', to: [1590, 1021], speed: 90, delayMs: 2200 },
        { type: 'ACTOR_SPEECH', actorId: 'masaru', text: 'ほんとだ、きれいだ……（クジャクじゃないほうを見ながら）', delayMs: 2800 },
        { type: 'SET_FLAG', id: 'masaru.staring', value: true },
      ],
      after: [{ actor: 'noriko', text: '……ちょっと。あなた、どこ見てるの？', delay: 4600 }] },
    { id: 'S4-E09', s: 'masaru', t: 'noriko', cat: 'CHAIN', title: 'ノリコの平手打ち', say: 'あなた！ 鼻の下がのびてるわよ！', anim: 'react.angry', route: 'S4.route.peacock', sound: 'hit',
      requires: ['S4-E08'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'noriko', to: [1640, 1028], speed: 200 },
        { type: 'FX', kind: 'stars', at: 'masaru', delayMs: 900 },
        { type: 'PLAY_SOUND', soundId: 'hit', delayMs: 900 },
        { type: 'ACTOR_SET_STATE', actorId: 'masaru', state: 'EMBARRASSED', delayMs: 1000 },
        { type: 'ACTOR_SPEECH', actorId: 'masaru', text: 'いてっ！ ク、クジャクを見てただけだって！', delayMs: 1600 },
        { type: 'ACTOR_MOVE', actorId: 'kozaru', to: [1190, 894], speed: 200, wander: 10, delayMs: 2000 },
      ],
      after: [{ actor: 'kozaru', text: 'キキッ！（いまの、おもしろい！）', delay: 3600 }] },
    { id: 'S4-E10', s: 'kozaru', t: 'noriko', cat: 'FLAVOR', title: '子ザル、平手打ちをマネしてノリコ激怒', say: 'なによ、おサルまでバカにして！ もう帰るわよ！', anim: 'react.angry', route: 'S4.route.peacock',
      requires: ['S4-E09'],
      fx: [
        { type: 'ACTOR_SPEECH', actorId: 'kozaru', text: 'キッ！ キッ！（パシーン、パシーン）', delayMs: 300 },
        { type: 'FX', kind: 'fire', at: 'noriko', delayMs: 1000 },
        { type: 'ACTOR_MOVE', actorId: 'noriko', to: [1360, 1121], speed: 160, delayMs: 1600 },
        { type: 'ACTOR_MOVE', actorId: 'masaru', to: [1460, 1128], speed: 140, delayMs: 2200 },
        { type: 'ACTOR_SPEECH', actorId: 'masaru', text: 'ま、待ってくれ〜', delayMs: 2400 },
      ] },

    // ── カバと財布 ──
    { id: 'S4-E11', s: 'hippoMouth', t: 'tsuchiya', cat: 'CHAIN', title: '土屋、カバの口に財布を発見', say: 'あーっ！ カバの口に……ぼくの財布！？', anim: 'react.surprised', route: 'S4.route.hippo',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'tsuchiya', to: [2380, 1021], speed: 180, wander: 30 },
        { type: 'HIDE_OBJECT', objectId: 'hippoMouth', delayMs: 600 },
        { type: 'SPAWN_OBJECT', objectId: 'walletInMouth', delayMs: 600 },
        { type: 'ACTOR_SPEECH', actorId: 'hippo', text: 'ブフ？（なんか歯にはさまってる）', delayMs: 1800 },
        { type: 'ACTOR_SPEECH', actorId: 'bird', text: 'チチッ（気になる……取りたい……）', delayMs: 3000 },
      ],
      after: [{ actor: 'tsuchiya', text: '手じゃ届かない……なにか長い柄のついたものは……', delay: 4200 }] },
    { id: 'S4-E12', s: 'brush', t: 'tsuchiya', cat: 'PROGRESSION', group: 's4-wallet', title: 'ブラシでくすぐられたカバ、大くしゃみ', say: 'このブラシでカバさんの鼻を、こちょこちょ……', anim: 'react.think', route: 'S4.route.hippo',
      requires: ['S4-E11'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'tsuchiya', to: [2400, 992], speed: 120 },
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
        { type: 'ACTOR_MOVE', actorId: 'bird', to: [2420, 763], speed: 200, wander: 20 },
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
        { type: 'ACTOR_MOVE', actorId: 'elephant', to: [3000, 903], speed: 160, wander: 60 },
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
        { type: 'ACTOR_MOVE', actorId: 'cleaner', to: [2440, 985], speed: 200 },
        { type: 'ACTOR_SPEECH', actorId: 'hippo', text: 'ブフォーーッ！！（鼻息）', delayMs: 1600 },
        { type: 'FX', kind: 'splash', at: 'cleaner', delayMs: 1900 },
        { type: 'ACTOR_MOVE', actorId: 'cleaner', to: [2080, 1121], speed: 700, delayMs: 2000 },
        { type: 'FX', kind: 'stars', at: 'cleaner', delayMs: 2700 },
        { type: 'ACTOR_SET_STATE', actorId: 'cleaner', state: 'SAD', delayMs: 2700 },
        { type: 'ACTOR_SPEECH', actorId: 'cleaner', text: 'ひえ〜……カバの鼻息、おそるべし', delayMs: 3200 },
      ] },

    // ── ゾウ ──
    { id: 'S4-E16', s: 'puddle', t: 'elephant', cat: 'FLAVOR', title: 'ゾウ、水たまりで豪快に水浴び', say: 'パオ〜ン♪', anim: 'react.splash', route: 'S4.route.elephant', sound: 'splash',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'elephant', to: [3220, 859], speed: 140, wander: 80 },
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
        { type: 'ACTOR_MOVE', actorId: 'sota', to: [3620, 1064], speed: 300, wander: 20 },
        { type: 'SPAWN_OBJECT', objectId: 'stolenIce', delayMs: 2600 },
        { type: 'ACTOR_SPEECH', actorId: 'smoker', text: 'いてっ！ おい坊主、ぶつかるなよ！', delayMs: 2800 },
        { type: 'SPAWN_OBJECT', objectId: 'cigarette', delayMs: 3000 },
        { type: 'FX', kind: 'smoke', at: 'cigarette', delayMs: 3400 },
      ],
      after: [{ actor: 'mio', text: 'うえーん！ だれか、とりかえしてー！', delay: 4200 }, { actor: 'smoker', text: 'あれ、タバコ落としたか……ま、いいか', delay: 5600 }] },
    { id: 'S4-E18', s: 'stolenIce', t: 'elephant', cat: 'FLAVOR', title: 'ゾウ、アイスを取りかえしてミオへ', say: 'パオッ！（めっ！）', anim: 'react.angry', route: 'S4.route.elephant',
      requires: ['S4-E17'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'elephant', to: [3640, 903], speed: 180, wander: 40 },
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
        { type: 'ACTOR_MOVE', actorId: 'elephant', to: [3520, 911], speed: 180, wander: 40 },
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
        { type: 'ACTOR_MOVE', actorId: 'tapir', to: [4880, 1723], speed: 140, wander: 40 },
        { type: 'HIDE_OBJECT', objectId: 'nightmare', delayMs: 1500 },
        { type: 'FX', kind: 'stars', at: 'kazuma', delayMs: 1800 },
        { type: 'ACTOR_APPEARANCE', actorId: 'kazuma', look: { sit: false }, delayMs: 2200 },
        { type: 'ACTOR_SPEECH', actorId: 'kazuma', text: 'ふわ〜、すっきり！ 夢でライオンに追われてたけど……本物はどんなかな', delayMs: 2400 },
        { type: 'ACTOR_MOVE', actorId: 'kazuma', to: [4250, 1071], speed: 220, wander: 20, delayMs: 3600 },
        { type: 'ACTOR_SPEECH', actorId: 'lion', text: 'ガオオオオッ！！', delayMs: 8000 },
        { type: 'PLAY_SOUND', soundId: 'roar', delayMs: 8000 },
        { type: 'ACTOR_SET_STATE', actorId: 'kazuma', state: 'SCARED', delayMs: 8400 },
      ],
      after: [{ actor: 'kazuma', text: 'ひいいっ！ 本物のほうがこわい！ た、高いところへ……！', delay: 9200 }] },
    { id: 'S4-E21', s: 'lionTree', t: 'kazuma', cat: 'FLAVOR', title: 'カズマ、ライオンから逃げて木の上へ', say: 'ここなら安全……だよね！？', anim: 'react.scared', route: 'S4.route.tapir',
      requires: ['S4-E20'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'kazuma', to: [3930, 1006], speed: 260, wander: 0 },
        { type: 'FX', kind: 'leaves', at: 'lionTree', delayMs: 1400 },
        { type: 'ACTOR_SPEECH', actorId: 'lion', text: 'ガウ？（べつに、なにもしないのに）', delayMs: 2400 },
        { type: 'ACTOR_SPEECH', actorId: 'kazuma', text: '……おりかた、わからない', delayMs: 3800 },
      ] },

    // ── 逃げたタヌキ ──
    { id: 'S4-E22', s: 'yui', t: 'keeper2', cat: 'CHAIN', title: '飼育員、リボンの女の子をタヌキと勘ちがい', say: 'いたっ、逃げたタヌキ！ ……あれ、女の子？', anim: 'react.surprised', route: 'S4.route.tanuki',
      blocksIfCompleted: ['S4-E23'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'keeper2', to: [1210, 1877], speed: 220 },
        { type: 'ACTOR_SPEECH', actorId: 'yui', text: 'タヌキじゃないもん！ リボンだもん！', delayMs: 1600 },
        { type: 'ACTOR_SET_STATE', actorId: 'yui', state: 'ANGRY', delayMs: 1600 },
        { type: 'ACTOR_SET_STATE', actorId: 'keeper2', state: 'EMBARRASSED', delayMs: 2400 },
        { type: 'SET_FLAG', id: 'keeper2.tanukiAlert', value: true },
      ],
      after: [{ actor: 'keeper2', text: 'ご、ごめんね。耳に見えちゃって……でもタヌキ、この辺にいるはずなのよ', delay: 3400 }, { actor: 'tanukiGirl', text: '……ギクッ', delay: 5200 }] },
    { id: 'S4-E23', s: 'tanukiGirl', t: 'keeper2', cat: 'FLAVOR', title: '女の子に化けたタヌキを発見', say: 'そのふさふさのしっぽ……やっぱりタヌキだ！', anim: 'react.surprised', route: 'S4.route.tanuki',
      requires: ['S4-E22'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'keeper2', to: [2630, 1877], speed: 260 },
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
        { type: 'ACTOR_MOVE', actorId: 'giraffe', to: [4960, 911], speed: 140, wander: 40 },
        { type: 'OBJECT_MOVE', objectId: 'tapirFood', to: [4960, 903], speed: 260, delayMs: 1400 },
        { type: 'HIDE_OBJECT', objectId: 'tapirFood', delayMs: 3000 },
        { type: 'ACTOR_SPEECH', actorId: 'tapir', text: 'フゴッ！？（ボクのごはん！）', delayMs: 3200 },
        { type: 'ACTOR_SET_STATE', actorId: 'tapir', state: 'ANGRY', delayMs: 3200 },
      ] },
    { id: 'S4-E25', s: 'babyGiraffe', t: 'giraffe', cat: 'FLAVOR', title: '親キリン、高い枝の葉っぱを子どもに', say: 'ムォ〜（ほら、いちばん上のやわらかいところ）', anim: 'react.happy', route: 'S4.route.giraffe',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'giraffe', to: [5620, 850], speed: 140, wander: 60 },
        { type: 'FX', kind: 'leaves', x: 5800, y: 475, delayMs: 1600 },
        { type: 'ACTOR_MOVE', actorId: 'babyGiraffe', to: [5540, 885], speed: 120, delayMs: 1800 },
        { type: 'ACTOR_SPEECH', actorId: 'babyGiraffe', text: 'ミュ〜♪（おいしい！）', delayMs: 2600 },
        { type: 'FX', kind: 'hearts', at: 'babyGiraffe', delayMs: 2800 },
      ] },
    { id: 'S4-E26', s: 'pandaTree', t: 'kenta', cat: 'CHAIN', title: 'ケンタ、パンダを見ようと木にのぼる', say: 'ここからならパンダ舎の中が見えるはず！', anim: 'react.happy', route: 'S4.route.giraffe',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'kenta', to: [5900, 1013], speed: 140, wander: 0 },
        { type: 'FX', kind: 'leaves', at: 'pandaTree', delayMs: 1600 },
        { type: 'ACTOR_SPEECH', actorId: 'kenta', text: '……あれ、おりられない', delayMs: 3200 },
        { type: 'ACTOR_SET_STATE', actorId: 'kenta', state: 'SCARED', delayMs: 3200 },
      ],
      after: [{ actor: 'fans', text: 'ちょっと、木の上に子どもが！ だれか背の高い……人？', delay: 4400 }, { actor: 'giraffe', text: 'ムォ？（呼んだ？）', delay: 6200 }] },
    { id: 'S4-E27', s: 'kenta', t: 'giraffe', cat: 'FLAVOR', title: 'キリン、木の上のケンタを下ろしてあげる', say: 'ムォ……（よっこらしょ）', anim: 'react.happy', route: 'S4.route.giraffe',
      requires: ['S4-E26'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'giraffe', to: [5820, 911], speed: 160, wander: 40 },
        { type: 'ACTOR_MOVE', actorId: 'kenta', to: [5760, 1100], speed: 120, wander: 80, delayMs: 2000 },
        { type: 'FX', kind: 'sparkle', at: 'kenta', delayMs: 2600 },
        { type: 'ACTOR_SET_STATE', actorId: 'kenta', state: 'HAPPY', delayMs: 2600 },
        { type: 'ACTOR_SPEECH', actorId: 'kenta', text: 'キリンのエレベーターだ！ ありがとう！', delayMs: 2800 },
      ] },

    // ── パンダ ──
    { id: 'S4-E28', s: 'tire', t: 'milk', cat: 'FLAVOR', title: 'ミルク、タイヤでころころ遊び', say: 'ころりん♪', anim: 'react.spin', route: 'S4.route.panda',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'milk', to: [5480, 1549], speed: 100, wander: 60 },
        { type: 'FX', kind: 'hearts', at: 'milk', delayMs: 1500 },
        { type: 'ACTOR_SPEECH', actorId: 'fans', text: 'かわいいーっ！ 連写連写！', delayMs: 2000 },
        { type: 'FX', kind: 'flash', at: 'fans', delayMs: 2200 },
      ] },
    { id: 'S4-E29', s: 'tire', t: 'gorosuke', cat: 'FLAVOR', title: 'ゴロスケ、タイヤを蹴とばす', say: 'フンッ！（丸いもの、きらい）', anim: 'react.angry', route: 'S4.route.panda',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'gorosuke', to: [5560, 1584], speed: 100, wander: 60 },
        { type: 'PLAY_SOUND', soundId: 'hit', delayMs: 1400 },
        { type: 'OBJECT_MOVE', objectId: 'tire', to: [5820, 1645], speed: 400, delayMs: 1400 },
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
        { type: 'OBJECT_MOVE', objectId: 'tire', to: [5540, 1848], speed: 500, delayMs: 1000 },
        { type: 'PLAY_SOUND', soundId: 'crash', delayMs: 1600 },
        { type: 'FX', kind: 'big', at: 'fans', delayMs: 1600 },
        { type: 'ACTOR_SET_STATE', actorId: 'fans', state: 'SURPRISED', delayMs: 1600 },
        { type: 'ACTOR_SPEECH', actorId: 'fans', text: 'きゃーっ！ ……でもそういうところが好き！', delayMs: 2200 },
        { type: 'OBJECT_MOVE', objectId: 'tire', to: [5500, 1566], speed: 200, delayMs: 3600 },
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
        { type: 'OBJECT_MOVE', objectId: 'hiddenCham', to: [3720, 1627], speed: 60, delayMs: 1600 },
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
        { type: 'ACTOR_MOVE', actorId: 'goat', to: [700, 1697], speed: 180, wander: 40 },
        { type: 'FX', kind: 'paper', at: 'map', delayMs: 1400 },
        { type: 'OBJECT_APPEARANCE', objectId: 'map', look: { emoji: '🧾', size: 22, rot: 0.6 }, delayMs: 1600 },
        { type: 'ACTOR_SPEECH', actorId: 'kaiDad', text: 'ああっ！ 地図が！ ……出口がわからなくなった', delayMs: 2200 },
        { type: 'ACTOR_SET_STATE', actorId: 'kaiDad', state: 'SAD', delayMs: 2200 },
      ],
      after: [{ actor: 'kai', text: 'ヤギって紙が好きなんだ！ お父さん、ほかに紙もってない？', delay: 3800 }] },
    { id: 'S4-E37', s: 'kaiDad', t: 'kai', cat: 'FLAVOR', title: 'カイ、父のお札をヤギにあげてしまう', say: 'お父さんのサイフに紙あった！ はい、ヤギさん！', anim: 'react.laugh', route: 'S4.route.goat',
      requires: ['S4-E36'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'kai', to: [630, 1848], speed: 160 },
        { type: 'FX', kind: 'paper', at: 'goat', delayMs: 1500 },
        { type: 'ACTOR_SPEECH', actorId: 'goat', text: 'メェ〜（高級な味）', delayMs: 2000 },
        { type: 'ACTOR_SPEECH', actorId: 'kaiDad', text: 'それは千円札だーーっ！！', delayMs: 2800 },
        { type: 'ACTOR_ANIMATION', actorId: 'kaiDad', animationId: 'react.surprised', delayMs: 2800 },
      ] },

    // ── 迷子のウサギ ──
    { id: 'S4-E38', s: 'pouch', t: 'keeper2', cat: 'CHAIN', title: '飼育員、カンガルーの袋に迷子ウサギを発見', say: 'その袋のふくらみ……ウサギ！？ なんでそこに！', anim: 'react.surprised', route: 'S4.route.rabbit',
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'keeper2', to: [1250, 1819], speed: 200 },
        { type: 'HIDE_OBJECT', objectId: 'pouch', delayMs: 1400 },
        { type: 'FX', kind: 'leaves', x: 1250, y: 1523, delayMs: 1500 },
        { type: 'ACTOR_SPEECH', actorId: 'kangaroo', text: 'ピョン！（軽くなった！）', delayMs: 1800 },
        { type: 'ACTOR_SPEECH', actorId: 'keeper2', text: 'あっ、ぴょーんと草むらに逃げちゃった……', delayMs: 2800 },
        { type: 'ACTOR_SET_STATE', actorId: 'keeper2', state: 'SAD', delayMs: 2800 },
      ],
      after: [{ actor: 'keeper2', text: 'ウサギは子どもの声につられて顔を出すことがあるんだけど……', delay: 4400 }] },
    { id: 'S4-E39', s: 'strayRabbit', t: 'keeper2', cat: 'PROGRESSION', title: '飼育員、木のそばの迷子ウサギを保護', say: 'いい子いい子、つかまえた！ さあ、おうちに帰ろう', anim: 'react.happy', route: 'S4.route.rabbit',
      requires: ['S4-E38', 'S4-E44'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'keeper2', to: [2130, 1812], speed: 220 },
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
        { type: 'ACTOR_MOVE', actorId: 'saki', to: [5560, 2345], speed: 140, wander: 20, delayMs: 3000 },
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
        { type: 'ACTOR_MOVE', actorId: 'twins', to: [800, 1042], speed: 320, wander: 30, delayMs: 3200 },
        { type: 'ACTOR_MOVE', actorId: 'grandpa', to: [920, 1057], speed: 300, wander: 20, delayMs: 3400 },
      ] },
    { id: 'S4-E43', s: 'twins', t: 'grandpa', cat: 'FLAVOR', title: 'おじいちゃん、サルのお尻を解説', say: 'サルのお尻が赤いのはな……元気いっぱいのしるしじゃ', anim: 'react.think', route: 'S4.route.tour',
      requires: ['S4-E42'],
      fx: [
        { type: 'ACTOR_SPEECH', actorId: 'twins', text: 'おしりー！ あはは！ つぎはゾウさん！', delayMs: 2200 },
        { type: 'ACTOR_SPEECH', actorId: 'boss', text: 'ウキ？（なにか言われてる？）', delayMs: 2800 },
        { type: 'ACTOR_MOVE', actorId: 'twins', to: [3250, 1042], speed: 320, wander: 30, delayMs: 3200 },
        { type: 'ACTOR_MOVE', actorId: 'grandpa', to: [3370, 1057], speed: 300, wander: 20, delayMs: 3400 },
      ] },
    { id: 'S4-E44', s: 'twins', t: 'grandpa', cat: 'CHAIN', title: 'おじいちゃん、ゾウの鼻を解説', say: 'ゾウの鼻は手のかわりじゃ。ゴミ拾いだってできるぞ', anim: 'react.think', route: 'S4.route.tour',
      requires: ['S4-E43'],
      fx: [
        { type: 'ACTOR_SPEECH', actorId: 'elephant', text: 'パオ〜ン（そのとおり）', delayMs: 1600 },
        { type: 'ACTOR_SPEECH', actorId: 'twins', text: 'すごーい！ つぎはウサギ！ ウサギ！', delayMs: 2600 },
        { type: 'ACTOR_MOVE', actorId: 'twins', to: [1950, 1877], speed: 320, wander: 40, delayMs: 3400 },
        { type: 'ACTOR_MOVE', actorId: 'grandpa', to: [2060, 1891], speed: 260, wander: 20, delayMs: 3600 },
        { type: 'ACTOR_SPEECH', actorId: 'grandpa', text: 'ふう、ふう……年寄りをこき使うのう', delayMs: 6000 },
      ],
      after: [{ actor: 'keeper2', text: 'あら、子どもたちの声。ウサギが出てきそうな気がする……', delay: 7000 }] },
    { id: 'S4-E45', s: 'twins', t: 'grandpa', cat: 'FLAVOR', title: 'おじいちゃん、ウサギの赤い目を解説', say: 'ウサギの目が赤いのはな……えーと……夜ふかしじゃ', anim: 'react.shrug', route: 'S4.route.tour',
      requires: ['S4-E44'],
      fx: [
        { type: 'ACTOR_SPEECH', actorId: 'twins', text: 'うそだー！ おじいちゃん、てきとう！', delayMs: 1800 },
        { type: 'ACTOR_SET_STATE', actorId: 'grandpa', state: 'SAD', delayMs: 2600 },
        { type: 'ACTOR_SPEECH', actorId: 'grandpa', text: 'つ、つかれた……どこか腰かけられるところは……', delayMs: 3000 },
        { type: 'ACTOR_MOVE', actorId: 'grandpa', to: [2900, 1869], speed: 120, wander: 10, delayMs: 3800 },
        { type: 'ACTOR_MOVE', actorId: 'twins', to: [2780, 1884], speed: 160, wander: 30, delayMs: 4200 },
      ] },
    { id: 'S4-E46', s: 'rock', t: 'grandpa', cat: 'PROGRESSION', title: 'おじいちゃん、カメを岩とまちがえて腰かける', say: 'よっこらしょ……ん？ この岩、動いとる！？', anim: 'react.surprised', route: 'S4.route.tour',
      requires: ['S4-E45'],
      fx: [
        { type: 'ACTOR_MOVE', actorId: 'grandpa', to: [2950, 1740], speed: 100, wander: 0 },
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
        { type: 'ACTOR_MOVE', actorId: 'grandpa', to: [2860, 1869], speed: 100, wander: 10 },
        { type: 'ACTOR_MOVE', actorId: 'babyTurtle', to: [2950, 1653], speed: 120, wander: 0, delayMs: 600 },
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
        { type: 'CAMERA_FOCUS', x: 560, y: 2150, zoom: 1.2 },
        { type: 'ACTOR_MOVE', actorId: 'manager', to: [640, 2181], speed: 220, wander: 0 },
        { type: 'ACTOR_MOVE', actorId: 'reporter', to: [470, 2205], speed: 220, wander: 0 },
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
