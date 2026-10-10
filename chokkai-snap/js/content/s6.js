// ステージ6：遊園地（53 イベント・最終ステージ）。登場人物・台詞はすべてオリジナル。
// 独立したミニストーリーを園内いっぱいに並列配置し、最後に「なんでも答えまショー」のフィナーレで全員が集まる。
const done = id => ({ eventDone: id });
const notDone = id => ({ eventNotDone: id });
const cnt = (id, value) => ({ countAtLeast: { id, value } });
const QA = 'S6-qa';
const qa = { type: 'INCREMENT_COUNTER', id: QA, amount: 1 };

// ── 背景の部品（世界 6400×3200：上から 空 → 乗り物の帯 → 通りA → ショー・お化け屋敷の帯 → 通りB → 屋台と広場の帯 → 入口） ──
const GA = 1100;   // 上段（乗り物）の地面
const GB = 1800;   // 中段（ステージ・お化け屋敷）の地面
const GC = 2480;   // 下段（屋台・広場）の地面
const lamp = (x, y) => ({ t: 'prop', kind: 'lamp', x, y, s: 190 });
const tree = (x, y, s = 190, color) => ({ t: 'prop', kind: 'tree', x, y, s, ...(color ? { color } : {}) });
const bush = (x, y, s = 80, color, flower) => ({ t: 'prop', kind: 'bush', x, y, s, ...(color ? { color } : {}), ...(flower ? { flower } : {}) });
const flagRow = (x1, x2, y, h = 70) => {
  const cs = ['#ff5a5a', '#ffd23f', '#3a8ad8', '#5bb03b', '#ff8fd0', '#a070e0'];
  const out = [{ t: 'line', pts: [x1, y, (x1 + x2) / 2, y + 30, x2, y], stroke: '#ffffff', w: 4 }];
  for (let x = x1 + 30, i = 0; x < x2 - 20; x += 60, i++) {
    const yy = y + 30 * (1 - Math.abs((x - x1) / (x2 - x1) * 2 - 1));
    out.push({ t: 'poly', pts: [x - 20, yy, x + 20, yy, x, yy + h * 0.6], fill: cs[i % cs.length] });
  }
  return out;
};
const pole = (x, yTop, yBot, c) => [{ t: 'line', pts: [x, yBot, x, yTop], stroke: '#8a8f99', w: 8 }, { t: 'poly', pts: [x, yTop, x + 70, yTop + 22, x, yTop + 44], fill: c }];
const longBench = (x1, x2, y) => [
  { t: 'rect', x: x1, y, w: x2 - x1, h: 18, fill: '#b77a3e', r: 5 }, { t: 'rect', x: x1, y: y + 18, w: x2 - x1, h: 6, fill: '#8a5a2e' },
  ...[x1 + 20, (x1 + x2) / 2 - 6, x2 - 32].map(lx => ({ t: 'rect', x: lx, y: y + 24, w: 12, h: 28, fill: '#555' })),
];
const stall = (x, w, name, awning, fill, goods) => ({ t: 'building', x, y: GC, w, h: 210, fill, roof: awning, roofStyle: 'flat', sign: name, signFill: '#fff', signColor: awning, signSize: 30, awning, goods, windows: false, door: false });
const cup = (x, y, c) => [
  { t: 'ellipse', x, y: y - 6, rx: 66, ry: 18, fill: 'rgba(0,0,0,.13)' },
  { t: 'poly', pts: [x - 62, y - 50, x + 62, y - 50, x + 46, y, x - 46, y], fill: c },
  { t: 'ellipse', x, y: y - 50, rx: 62, ry: 16, fill: '#fff' }, { t: 'rect', x: x - 62, y: y - 34, w: 124, h: 8, fill: 'rgba(255,255,255,.6)' },
];

// ジェットコースターのレール（車両の足もと座標と同じ）
const COASTER = [[250, 1090], [520, 1090], [640, 800], [760, 430], [880, 330], [1000, 450], [1120, 900], [1240, 760], [1380, 560], [1520, 640], [1640, 880], [1760, 1000], [1880, 820], [1960, 700], [2040, 820], [2000, 1020], [1800, 1080], [1300, 1085], [800, 1090], [250, 1090]].map(([x, y]) => [x, Math.round(1090 - (1090 - y) * 0.82)]);
// 海賊船のふりこ（支点 600,1300）
const SHIP = [-55, -35, -15, 0, 15, 35, 55, 35, 15, 0, -15, -35].map(a => [Math.round(600 + 400 * Math.sin(a * Math.PI / 180)), Math.round(1300 + 400 * Math.cos(a * Math.PI / 180))]);
// 風船で飛んでいくミナ（足もと）と風船の束
const FLY = [[1780, 2600], [1900, 2000], [2400, 1200], [3300, 700], [4600, 650], [5400, 1200], [5700, 2000], [5700, 2760]];

export default {
  id: 'S6', title: 'ハテナランドの長い一日', subtitle: '遊園地', theme: '遊園地',
  intro: '日曜日の遊園地「ハテナランド」。迷子、カツラ、デート、幽霊……園内のあちこちで小さな事件が起きている。目玉はステージの「なんでも答えまショー」！',
  timeLimitMs: 330000,
  world: { width: 6400, height: 3200, minZoom: 0.75, maxZoom: 4, bg: '#86cf6a', spawnCamera: { x: 3200, y: 1700, zoom: 1 } },
  bgm: { tempo: 128, key: 5, mood: 'major' },
  clearEventId: 'S6-E53', timeoutEventId: null,
  routes: {
    'S6.route.show': 'なんでも答えまショー', 'S6.route.mina': '迷子のミナ', 'S6.route.wig': 'カツラの紳士と息子', 'S6.route.clean': 'いたずら小僧と空き缶',
    'S6.route.date': 'デート中のふたり', 'S6.route.shoot': '射的とメガネの親子', 'S6.route.monster': '怪獣ショーとお化け屋敷',
    'S6.route.paint': '似顔絵コーナー', 'S6.route.dialect': '方言カップル', 'S6.route.misc': '園内のあれこれ', 'S6.route.end': 'フィナーレ',
  },
  scenery: [
    // ── 空と遠景 ──
    { t: 'sky', x: 0, y: 0, w: 6400, h: 1000, c1: '#5fb8f5', c2: '#d8f1ff' },
    { t: 'prop', kind: 'sun', x: 4250, y: 470, s: 300 },
    ...[[300, 260, 110], [1500, 180, 90], [2100, 380, 80], [3800, 200, 120], [5000, 320, 100], [6000, 170, 110], [4700, 120, 70]].map(([x, y, s]) => ({ t: 'prop', kind: 'cloud', x, y, s })),
    ...[[400, 300, 3], [1600, 260, 4], [3000, 330, 3], [4300, 280, 4], [6100, 300, 3]].map(([x, s, wide]) => ({ t: 'prop', kind: 'hill', x, y: 1000, s, wide, color: '#9bd889' })),
    ...[[900, 200, 4], [2500, 230, 3], [3700, 180, 4], [5300, 220, 4]].map(([x, s, wide]) => ({ t: 'prop', kind: 'hill', x, y: 1010, s, wide, color: '#7cc76a' })),
    // ── 地面 ──
    { t: 'rect', x: 0, y: 960, w: 6400, h: 2240, fill: '#86cf6a' },
    // 通りA（上段の乗り物の前）
    { t: 'rect', x: 0, y: GA, w: 6400, h: 230, fill: '#f3dfb2' },
    { t: 'stripes', x: 0, y: GA, w: 6400, h: 230, dir: 'v', n: 64, c1: 'rgba(0,0,0,0)', c2: 'rgba(170,120,60,.07)' },
    { t: 'rect', x: 0, y: GA + 222, w: 6400, h: 10, fill: '#d8bd86' },
    // 中段をつなぐ縦の小道
    ...[[1260, 120], [2080, 110], [3740, 120], [4740, 100], [5600, 110]].map(([x, w]) => ({ t: 'rect', x: x - w / 2, y: GA + 230, w, h: 760, fill: '#f3dfb2' })),
    // 通りB（中段の前）と下段の広場
    { t: 'rect', x: 0, y: 2080, w: 6400, h: 200, fill: '#f3dfb2' },
    { t: 'stripes', x: 0, y: 2080, w: 6400, h: 200, dir: 'v', n: 64, c1: 'rgba(0,0,0,0)', c2: 'rgba(170,120,60,.07)' },
    { t: 'rect', x: 0, y: 2280, w: 6400, h: 920, fill: '#f7e6bf' },
    { t: 'stripes', x: 0, y: 2480, w: 6400, h: 720, dir: 'h', n: 18, c1: 'rgba(0,0,0,0)', c2: 'rgba(200,150,90,.08)' },
    { t: 'stripes', x: 0, y: 2480, w: 6400, h: 720, dir: 'v', n: 80, c1: 'rgba(0,0,0,0)', c2: 'rgba(200,150,90,.06)' },
    { t: 'ellipse', x: 3150, y: 2960, rx: 560, ry: 150, fill: '#f0d9a4', stroke: '#e2c483', lw: 6 },

    // ════ 上段：乗り物（コースター・観覧車・スカイドロップ・カップ・メリーゴーランド・ドンブラ山） ════
    // ジェットコースター
    ...COASTER.filter(([, y]) => y < 1060).map(([x, y]) => ({ t: 'rect', x: x - 7, y: y + 6, w: 14, h: GA - y - 6, fill: '#b9c0ca' })),
    ...COASTER.filter(([, y]) => y < 900).map(([x, y]) => ({ t: 'line', pts: [x - 60, GA, x, y + 60, x + 60, GA], stroke: '#cfd5dd', w: 6 })),
    { t: 'building', x: 170, y: GA, w: 420, h: 170, fill: '#3b3f8c', roof: '#ffcf3f', roofStyle: 'flat', windows: false, door: false, sign: 'ギャラクシー・コースター', signFill: '#ffcf3f', signColor: '#2b2d6e', signSize: 26 },
    { t: 'line', pts: COASTER.flat(), stroke: '#a8322a', w: 22 },
    { t: 'line', pts: COASTER.flat(), stroke: '#ff5a4a', w: 12 },
    { t: 'emoji', e: '⭐', x: 880, y: 420, s: 56 },
    // 観覧車
    { t: 'rect', x: 2420, y: GA - 40, w: 400, h: 40, fill: '#9aa6b8', r: 8 },
    { t: 'prop', kind: 'ferris', x: 2620, y: GA - 30, s: 840 },
    { t: 'ellipse', x: 2620, y: 608, rx: 46, ry: 46, fill: '#ff5a8a', stroke: '#fff', lw: 6 },
    { t: 'sign', x: 2500, y: GA - 110, w: 240, h: 60, text: 'ハテナ観覧車', fill: '#ff5a8a', color: '#fff', s: 26 },
    // スカイドロップ
    { t: 'rect', x: 3240, y: GA - 30, w: 160, h: 30, fill: '#7a8698', r: 6 },
    { t: 'rect', x: 3285, y: 380, w: 70, h: GA - 400, fill: '#d4d8df', stroke: '#8a919c', lw: 4 },
    { t: 'stripes', x: 3285, y: 380, w: 70, h: GA - 400, dir: 'h', n: 22, c1: 'rgba(0,0,0,0)', c2: 'rgba(226,87,76,.35)' },
    { t: 'rect', x: 3260, y: 340, w: 120, h: 50, fill: '#e2574c', r: 10 },
    { t: 'emoji', e: '⭐', x: 3320, y: 310, s: 60 },
    { t: 'sign', x: 3380, y: 900, w: 210, h: 54, text: 'スカイドロップ', fill: '#e2574c', color: '#fff', s: 24 },
    // くるくるカップ
    { t: 'ellipse', x: 3920, y: 1050, rx: 360, ry: 70, fill: '#ffc4dc', stroke: '#ff8fb8', lw: 8 },
    { t: 'rect', x: 3905, y: 760, w: 30, h: 270, fill: '#ffd23f' },
    { t: 'prop', kind: 'tent', x: 3920, y: 800, s: 150, color: '#ff8fb8' },
    ...cup(3700, 1040, '#3a8ad8'), ...cup(4140, 1040, '#5bb03b'), ...cup(3820, 1095, '#ffd23f'), ...cup(4030, 1095, '#a070e0'),
    { t: 'sign', x: 3800, y: 920, w: 240, h: 50, text: 'くるくるカップ', fill: '#fff', color: '#e2577f', s: 24 },
    // メリーゴーランド
    { t: 'ellipse', x: 4850, y: 1070, rx: 400, ry: 60, fill: '#ffe07a', stroke: '#d9a63a', lw: 6 },
    { t: 'rect', x: 4500, y: 830, w: 700, h: 230, fill: '#fff6dc' },
    ...[4520, 4640, 4760, 4880, 5000, 5120].map(x => ({ t: 'rect', x: x + 30, y: 830, w: 10, h: 230, fill: '#d9a63a' })),
    ...[[4580, 1010, 70], [4800, 990, 76], [5020, 1010, 70], [4700, 1040, 64], [4930, 1040, 64]].map(([x, y, s]) => ({ t: 'emoji', e: '🎠', x, y, s })),
    { t: 'poly', pts: [4440, 840, 4850, 590, 5260, 840], fill: '#e2574c' },
    ...[0, 1, 2, 3].map(i => ({ t: 'poly', pts: [4850, 590, 4440 + i * 205 + 70, 840, 4440 + i * 205 + 140, 840], fill: '#ffffff' })),
    { t: 'rect', x: 4430, y: 830, w: 840, h: 34, fill: '#ffcf3f', r: 8 },
    ...pole(4850, 520, 600, '#3a8ad8'),
    { t: 'sign', x: 4720, y: 870, w: 260, h: 50, text: 'メリーゴーランド', fill: '#e2574c', color: '#fff', s: 24 },
    // ドンブラ山（急流すべり）
    { t: 'poly', pts: [5330, GA, 5650, 700, 5800, 760, 5980, 440, 6150, 660, 6290, 580, 6460, 900, 6460, GA], fill: '#7d9c64' },
    { t: 'poly', pts: [5900, 530, 5980, 440, 6060, 540, 6020, 520, 5980, 560, 5940, 520], fill: '#ffffff' },
    { t: 'poly', pts: [5650, 700, 5800, 760, 5700, 800, 5600, 760], fill: '#6a8a54' },
    { t: 'line', pts: [6080, 560, 6000, 700, 6150, 800, 5900, 900, 6100, 1000, 5800, GA - 40], stroke: '#5ab4e6', w: 34 },
    { t: 'line', pts: [6080, 560, 6000, 700, 6150, 800, 5900, 900, 6100, 1000, 5800, GA - 40], stroke: '#bfe6ff', w: 10 },
    { t: 'prop', kind: 'pine', x: 5560, y: 1000, s: 150 }, { t: 'prop', kind: 'pine', x: 6300, y: 1030, s: 170 }, { t: 'prop', kind: 'pine', x: 5720, y: 900, s: 120 },
    { t: 'sign', x: 6040, y: 1000, w: 220, h: 54, text: 'ドンブラ山', fill: '#3d6b2e', color: '#fff', s: 26 },
    // 通りAの飾り
    ...flagRow(2100, 3200, 1140), ...flagRow(4300, 5400, 1140),
    ...[700, 2200, 3550, 4380, 5320, 6250].map(x => lamp(x, GA + 40)),
    ...[[2100, 1000], [3550, 1060], [5330, 1080]].map(([x, y]) => tree(x, y, 170)),

    // ════ 中段：海賊船・怪獣ショー・答えまショー・お化け屋敷・フードコート・おみやげ ════
    // 海賊船
    { t: 'water', x: 160, y: GB - 120, w: 880, h: 110 },
    { t: 'poly', pts: [270, GB, 600, 1290, 930, GB, 880, GB, 600, 1360, 320, GB], fill: '#6b4a2f' },
    { t: 'poly', pts: [380, GB, 600, 1310, 820, GB, 780, GB, 600, 1380, 420, GB], fill: '#8a6240' },
    { t: 'ellipse', x: 600, y: 1300, rx: 24, ry: 24, fill: '#333' },
    { t: 'emoji', e: '🏴‍☠️', x: 600, y: 1230, s: 70 },
    { t: 'sign', x: 460, y: GB + 14, w: 280, h: 54, text: '大海賊船ドクロ丸', fill: '#222', color: '#fff', s: 24 },
    // トイレ
    { t: 'building', x: 1060, y: GB, w: 180, h: 180, fill: '#e8f0f7', roof: '#7a8fa6', sign: '🚻', signFill: '#fff', signColor: '#333', signSize: 34, windows: false },
    // 怪獣ガオゴンショー
    { t: 'rect', x: 1370, y: 1320, w: 650, h: 250, fill: '#2f3b2f' },
    { t: 'poly', pts: [1370, 1330, 1450, 1220, 1530, 1330, 1640, 1180, 1750, 1330, 1860, 1210, 1950, 1330, 2020, 1250, 2020, 1330], fill: '#3f5a3f' },
    { t: 'poly', pts: [1560, 1570, 1700, 1380, 1840, 1570], fill: '#5a4a3a' }, { t: 'poly', pts: [1670, 1420, 1700, 1380, 1730, 1420], fill: '#ff6a2a' },
    { t: 'sign', x: 1520, y: 1330, w: 360, h: 56, text: '怪獣ガオゴンショー', fill: '#9ae66e', color: '#1e2a1e', s: 28 },
    { t: 'rect', x: 1350, y: 1570, w: 700, h: 150, fill: '#6e6e6e' },
    { t: 'rect', x: 1350, y: 1720, w: 700, h: 40, fill: '#444' },
    // 答えまショー（ステージ）
    { t: 'rect', x: 2200, y: 1240, w: 1500, h: 330, fill: '#5a2a7a' },
    { t: 'stripes', x: 2200, y: 1240, w: 1500, h: 330, dir: 'v', n: 20, c1: 'rgba(0,0,0,0)', c2: 'rgba(255,255,255,.08)' },
    { t: 'poly', pts: [2160, 1220, 2380, 1220, 2300, 1570, 2160, 1570], fill: '#d63a4a' }, { t: 'poly', pts: [3740, 1220, 3520, 1220, 3600, 1570, 3740, 1570], fill: '#d63a4a' },
    { t: 'rect', x: 2140, y: 1200, w: 1620, h: 44, fill: '#ffcf3f', r: 10 },
    ...[2230, 2390, 2550, 2710, 2870, 3030, 3190, 3350, 3510, 3670].map(x => ({ t: 'ellipse', x, y: 1222, rx: 12, ry: 12, fill: '#fff7b0' })),
    { t: 'sign', x: 2560, y: 1270, w: 780, h: 90, text: 'ナゼ太郎の なんでも答えまショー', fill: '#ffcf3f', color: '#5a2a7a', s: 38 },
    { t: 'emoji', e: '❓', x: 2440, y: 1420, s: 110 }, { t: 'emoji', e: '❔', x: 3460, y: 1420, s: 110 },
    { t: 'rect', x: 2150, y: 1560, w: 1600, h: 160, fill: '#c08a50' },
    { t: 'stripes', x: 2150, y: 1560, w: 1600, h: 160, dir: 'v', n: 24, c1: 'rgba(0,0,0,0)', c2: 'rgba(90,50,20,.12)' },
    { t: 'rect', x: 2150, y: 1720, w: 1600, h: 40, fill: '#6a3f1e' },
    ...longBench(2380, 3520, 1855), ...longBench(2380, 3520, 2015),
    // お化け屋敷
    { t: 'prop', kind: 'tree', x: 3870, y: GB - 10, s: 230, color: '#5a5070' },
    { t: 'building', x: 3960, y: GB, w: 560, h: 420, fill: '#4a4458', roof: '#2b2735', sign: 'うらめし館', signFill: '#111', signColor: '#e33', signSize: 40, windowColor: '#b8ff7a', door: true },
    { t: 'prop', kind: 'tree', x: 4600, y: GB - 30, s: 210, color: '#5a5070' },
    { t: 'fence', x: 3870, y: GB + 40, w: 780, h: 50, fill: '#3a3446' },
    ...[[4040, 1240, 44], [4420, 1210, 40], [4250, 1150, 36]].map(([x, y, s]) => ({ t: 'emoji', e: '🦇', x, y, s })),
    { t: 'emoji', e: '🕸️', x: 4470, y: 1450, s: 60 },
    // フードコート
    { t: 'building', x: 4820, y: GB, w: 660, h: 270, fill: '#ffe1b3', roof: '#e07a2f', sign: 'フードコート', signFill: '#e07a2f', signColor: '#fff', awning: '#f2a65a', goods: ['#e2574c', '#ffd23f', '#fff', '#8a5a32'] },
    ...[[4920, 2050, '#ff5a5a'], [5170, 2075, '#3a8ad8'], [5420, 2050, '#5bb03b']].flatMap(([x, y, c]) => [{ t: 'prop', kind: 'table', x, y, s: 60, cloth: '#fff' }, { t: 'prop', kind: 'parasol', x, y: y - 6, s: 190, color: c }]),
    // おみやげの店
    { t: 'building', x: 5700, y: GB, w: 560, h: 280, fill: '#efe4ff', roof: '#7a5ad8', sign: 'おみやげ', signFill: '#7a5ad8', signColor: '#fff', awning: '#9a7af0', goods: ['#ff8fd0', '#ffd23f', '#3a8ad8', '#fff'] },
    ...[[6320, GB - 10], [5640, GB + 10]].map(([x, y]) => tree(x, y, 200)),
    { t: 'prop', kind: 'bench', x: 5980, y: 2000, s: 60 },
    // 芝生の花壇
    ...[[300, 2000], [760, 1960], [1450, 1900], [1980, 1880], [3700, 1880], [4300, 2030], [5620, 1880], [6250, 1950], [200, 1450], [1150, 1420]].map(([x, y], i) => ({ t: 'prop', kind: i % 2 ? 'tulip' : 'flower', x, y, s: 60, color: ['#ff6f91', '#ffd23f', '#c77dff', '#ff9a3a'][i % 4] })),
    ...[[120, 1500], [1000, 1380], [1940, 1820], [3780, 1500], [6330, 1500]].map(([x, y]) => tree(x, y, 170)),
    { t: 'prop', kind: 'bench', x: 300, y: 2060, s: 56 }, { t: 'prop', kind: 'bench', x: 4150, y: 2070, s: 56 },
    { t: 'prop', kind: 'dog', x: 6200, y: 2250, s: 60, color: '#d8a060' },
    // 中段の飾り
    ...[[1080, 1600, 160], [1320, 1500, 150], [2080, 1460, 140], [3790, 1980, 120]].map(([x, y, s]) => tree(x, y, s)),
    ...[[200, 1900], [960, 2040], [1240, 2050], [2100, 2050], [3780, 2060], [4700, 2060], [5560, 2060], [6300, 2060]].map(([x, y]) => bush(x, y, 70, null, ['#ff8fd0', '#ffd23f', '#fff'][x % 3])),
    ...[300, 1500, 3700, 4760, 5640].map(x => lamp(x, 2090)),
    ...flagRow(2150, 3750, 1170),

    // ════ 下段：入口・案内所・風船売り・屋台・射的・似顔絵・アイス ════
    // 入場ゲート
    { t: 'rect', x: 2870, y: 2660, w: 70, h: 480, fill: '#e2574c' }, { t: 'rect', x: 3360, y: 2660, w: 70, h: 480, fill: '#e2574c' },
    { t: 'rect', x: 2880, y: 2660, w: 20, h: 480, fill: '#ff7a6a' }, { t: 'rect', x: 3370, y: 2660, w: 20, h: 480, fill: '#ff7a6a' },
    { t: 'rect', x: 2830, y: 2690, w: 640, h: 120, fill: '#ffcf3f', r: 24, stroke: '#e2574c', lw: 8 },
    { t: 'text', text: 'ハテナランド', x: 3150, y: 2752, s: 60, fill: '#c0392b', bold: true },
    { t: 'emoji', e: '❓', x: 3150, y: 2635, s: 90 },
    ...pole(2900, 2560, 2690, '#ff5a5a'), ...pole(3400, 2560, 2690, '#3a8ad8'),
    ...[[2780, 3080], [3520, 3080]].map(([x, y]) => ({ t: 'prop', kind: 'tulip', x, y, s: 60 })),
    // 案内所
    { t: 'building', x: 780, y: GC, w: 500, h: 230, fill: '#fff4dc', roof: '#3b8bd9', awning: '#3b8bd9', windows: false, door: true },
    { t: 'rect', x: 1384, y: 2210, w: 12, h: GC - 2210, fill: '#666' },
    // 風船売り
    { t: 'line', pts: [1700, 2610, 1640, 2440], stroke: '#999', w: 2 }, { t: 'line', pts: [1700, 2610, 1700, 2410], stroke: '#999', w: 2 }, { t: 'line', pts: [1700, 2610, 1760, 2440], stroke: '#999', w: 2 },
    { t: 'line', pts: [1700, 2610, 1610, 2500], stroke: '#999', w: 2 }, { t: 'line', pts: [1700, 2610, 1790, 2500], stroke: '#999', w: 2 },
    ...[[1640, 2430, 60], [1700, 2400, 64], [1760, 2430, 60], [1610, 2490, 54], [1790, 2490, 54]].map(([x, y, s]) => ({ t: 'emoji', e: '🎈', x, y, s })),
    // 屋台の列
    stall(1960, 260, 'クレープ', '#ff7aa8', '#fff0f5', ['#ffd23f', '#ff9fc8', '#fff', '#a0522d']),
    stall(2250, 260, 'ポップコーン', '#f2a83a', '#fff8e0', ['#fff3c0', '#ffd23f', '#e2574c']),
    stall(2540, 260, 'やきそば', '#3aa84a', '#effbe8', ['#a0522d', '#ffd23f', '#e2574c']),
    { t: 'emoji', e: '📷', x: 3040, y: 2280, s: 40 }, { t: 'emoji', e: '🥤', x: 2920, y: 2280, s: 40 },
    // 射的屋
    { t: 'building', x: 3170, y: GC, w: 660, h: 260, fill: '#fbe6e6', roof: '#c0392b', sign: '射的', signFill: '#c0392b', signColor: '#fff', signSize: 34, awning: '#e74c3c', goods: ['#c97a4a', '#ffd23f', '#3a8ad8', '#ff8fd0', '#5bb03b'] },
    { t: 'ellipse', x: 3870, y: 2330, rx: 44, ry: 44, fill: '#ff6b6b', stroke: '#fff', lw: 10 }, { t: 'ellipse', x: 3870, y: 2330, rx: 12, ry: 12, fill: '#fff' },
    // ヒーロー像の台座
    { t: 'rect', x: 3960, y: 2440, w: 160, h: 70, fill: '#bfc5cc', r: 6 }, { t: 'rect', x: 3945, y: 2500, w: 190, h: 24, fill: '#9aa0a6', r: 4 },
    // 似顔絵コーナー
    { t: 'prop', kind: 'parasol', x: 4740, y: 2640, s: 300, color: '#7a3fb0' },
    { t: 'sign', x: 4500, y: 2330, w: 260, h: 54, text: '似顔絵 一枚500円', fill: '#fff', color: '#7a3fb0', s: 22 },
    { t: 'line', pts: [4820, 2640, 4850, 2470, 4880, 2640], stroke: '#8a5a32', w: 8 },
    // アイスの屋台・噴水
    { t: 'prop', kind: 'fountain', x: 5650, y: 2960, s: 210 },
    { t: 'rect', x: 5970, y: 2500, w: 220, h: 100, fill: '#6ec6f0', r: 14 }, { t: 'stripes', x: 5970, y: 2500, w: 220, h: 40, dir: 'v', n: 8, c1: '#ffffff', c2: '#ff8fb8' },
    { t: 'prop', kind: 'parasol', x: 6080, y: 2510, s: 200, color: '#ff8fb8' },
    { t: 'emoji', e: '🍦', x: 6080, y: 2550, s: 50 },
    { t: 'building', x: 5320, y: GC, w: 520, h: 230, fill: '#e8f7ff', roof: '#3aa8c8', sign: 'ドリンク', signFill: '#3aa8c8', signColor: '#fff', awning: '#3aa8c8', goods: ['#ff8a2a', '#5bb03b', '#e2574c', '#ffd23f'] },
    // 下段の飾り
    ...[1480, 2900, 4300, 5220, 6300].map(x => lamp(x, GC + 20)),
    ...[[5900, 2300], [6320, 2350]].map(([x, y]) => tree(x, y, 180)),
    ...[[1700, 3060], [2600, 3080], [3700, 3060], [4900, 3080], [6100, 3060]].map(([x, y]) => ({ t: 'prop', kind: 'bench', x, y, s: 56 })),
    ...[[2150, 2780], [2600, 2760], [5000, 3000]].flatMap(([x, y]) => [{ t: 'prop', kind: 'table', x, y, s: 56, cloth: '#ffcf3f' }, { t: 'prop', kind: 'parasol', x, y: y - 4, s: 170, color: ['#3a8ad8', '#ff5a5a', '#5bb03b'][x % 3] }]),
    ...[[1580, 2700], [3150, 2700], [4380, 2700], [5250, 2700]].map(([x, y]) => ({ t: 'prop', kind: 'trash', x, y, s: 50, color: '#5bb03b' })),
    ...flagRow(700, 1900, 2420, 60), ...flagRow(3170, 3830, 2150, 50),
    // 手前の植えこみ
    { t: 'rect', x: 0, y: 3130, w: 6400, h: 70, fill: '#7cc069' },
    ...Array.from({ length: 22 }, (_, i) => bush(840 + i * 260, 3150, 80, i % 2 ? '#4f9e3c' : '#5bb34a', ['#ff8fd0', '#ffd23f', '#fff', '#ff6a6a'][i % 4])),
    // 地面の小物
    { t: 'emoji', e: '🍿', x: 2950, y: 2230, s: 30 }, { t: 'emoji', e: '🎟️', x: 760, y: 2900, s: 28, rot: 0.4 }, { t: 'emoji', e: '🪶', x: 5100, y: 2200, s: 26 },
    { t: 'prop', kind: 'signpost', x: 1260, y: 2150, s: 110, text: 'ステージ ↑' }, { t: 'prop', kind: 'signpost', x: 4740, y: 2160, s: 110, text: 'お化け ↑' },
  ],
  actors: {
    // ── なんでも答えまショー ──
    host: {
      name: '司会のナゼ太郎', x: 2950, y: 1680, wander: 160, speed: 70,
      look: { hair: 'short', hairColor: '#222', shirt: '#7a3fb0', pants: '#2b1a3a', acc: ['tie', 'hat', 'mustache'], hatColor: '#ffcf3f', h: 174 },
      idle: [
        'さあさあ、どんな質問にも答えちゃうよ〜！',
        '客席のみなさん、遠慮はいりません！ 心の声、聞かせて！',
        { text: '手が挙がらないなあ……みんな、もじもじさんかな？', when: [{ countAtMost: { id: QA, value: 1 } }] },
        { text: 'ラスト質問のお客さまを、まだ待ってるよ〜', when: [done('S6-E52'), notDone('S6-E53')] },
        { text: 'フィナーレは、園内のみんなが笑顔になってから！ 迷子さん、カツラの紳士、メガネの坊や、デートのふたり……どうしてるかな', when: [done('S6-E52'), notDone('S6-E53')] },
      ],
    },
    aud1: { name: '観客のおじいさん', x: 2520, y: 1872, wander: 0, look: { hair: 'bald', hairColor: '#ddd', shirt: '#8a7a5a', pants: '#4a4a3a', acc: ['glasses'], old: true, sit: true, h: 163 },
      idle: [{ text: 'わしにも、もう一度ときめく日が来るかのう', when: [notDone('S6-E04')] }, { text: 'ばあさんと出会ったのも、こんな遊園地じゃった', when: [notDone('S6-E04')] }, '手を挙げたいが、肩が上がらんのじゃ', { text: '……やっぱり、ばあさんがいちばんの美人じゃ', when: [done('S6-E04')] }] },
    aud2: { name: '観客の男の子', x: 2820, y: 1872, wander: 0, look: { hair: 'spiky', hairColor: '#333', shirt: '#4dabf7', pants: '#335', kid: true, sit: true, h: 125 },
      idle: [{ text: 'ハトっていいなあ。どこへでも行けて', when: [notDone('S6-E05')] }, { text: '空、とんでみたいなあ……', when: [notDone('S6-E05')] }, '司会のおじさん、帽子へんなの', { text: 'ぜんぜん飛んでなかった！', when: [done('S6-E05')] }] },
    aud3: { name: '観客の食いしん坊', x: 3120, y: 1872, wander: 0, look: { hair: 'short', hairColor: '#432', shirt: '#f2a65a', pants: '#555', wide: true, sit: true, h: 163 },
      idle: [{ text: 'ショーのあと、なに食べようかなあ', when: [notDone('S6-E06')] }, { text: 'グゥ〜……あ、いまの聞こえた？', when: [notDone('S6-E06')] }, 'ポップコーン、さっき落としちゃった', { text: 'おにぎり、買いに行かなきゃ', when: [done('S6-E06')] }] },
    aud4: { name: '観客の女の子', x: 3420, y: 1872, wander: 0, look: { hair: 'twin', hairColor: '#5a3a1a', shirt: '#ffb3d1', pants: '#fff', skirt: true, kid: true, sit: true, h: 120 },
      idle: [{ text: 'てんしさまって、ほんとにいるのかな', when: [notDone('S6-E07')] }, { text: 'おばあちゃん、お空でげんきかなあ', when: [notDone('S6-E07')] }, 'ショー、まだかな〜', { text: 'てんし、みーつけた！', when: [done('S6-E07')] }] },
    aud5: { name: '観客のお姉さん ソラ', x: 2520, y: 2032, wander: 0, look: { hair: 'long', hairColor: '#3a2a1a', shirt: '#9ad0ec', pants: '#f0f0f0', skirt: true, sit: true, h: 163, acc: ['flower'] },
      idle: [
        { text: '雨あがりに、ここから虹が見えたことがあるの', when: [notDone('S6-E08')] },
        { text: '虹のはしっこって、どこにあるんだろう', when: [notDone('S6-E08')] },
        { text: 'ほかのお客さんの質問も、もっと聞いてみたいな', when: [done('S6-E08'), notDone('S6-E52')] },
        { text: 'わたしたちらしさって、なんだろう……聞いてみようかな', when: [done('S6-E08'), cnt(QA, 5), notDone('S6-E52')] },
        { text: '楽しい時間って、どうして終わっちゃうんだろう……', when: [done('S6-E52'), notDone('S6-E53')] },
      ] },
    aud6: { name: '観客のサラリーマン', x: 2820, y: 2032, wander: 0, look: { hair: 'short', hairColor: '#333', shirt: '#fff', pants: '#334', acc: ['tie', 'glasses'], sit: true, h: 168 },
      idle: [{ text: 'あいたた……肩がバキバキだ', when: [notDone('S6-E09')] }, { text: '休日なのに、体がなまりみたいに重い……', when: [notDone('S6-E09')] }, '娘にむりやり連れてこられまして', { text: '肩がかるい！ ハハハ！', when: [done('S6-E09')] }] },
    aud7: { name: '観客のおばあさん', x: 3120, y: 2032, wander: 0, look: { hair: 'bun', hairColor: '#ccc', shirt: '#b07aa1', pants: '#555', skirt: true, old: true, sit: true, h: 162 },
      idle: [{ text: '人生なんて、あっという間ねえ', when: [notDone('S6-E10')] }, { text: 'この遊園地、むかしは原っぱだったのよ', when: [notDone('S6-E10')] }, 'あの司会さん、どこかで見た顔ねえ', { text: 'あの子、五歳のときここで迷子になった子だわ', when: [done('S6-E10')] }] },
    aud8: { name: '観客のゲーム少年', x: 3420, y: 2032, wander: 0, look: { hair: 'bob', hairColor: '#222', shirt: '#2ecc71', pants: '#333', kid: true, sit: true, h: 125, acc: ['headphones'] },
      idle: [{ text: 'ワープできたら、学校まで一瞬なのになあ', when: [notDone('S6-E11')] }, { text: '並ぶの、もう飽きた〜', when: [notDone('S6-E11')] }, 'このショー、セーブポイントある？', { text: 'いまの、ぜったい走ってたよね！？', when: [done('S6-E11')] }] },

    // ── 迷子のミナ ──
    mina: { name: '迷子のミナ', x: 1900, y: 2780, wander: 60, speed: 50, look: { hair: 'pony', hairColor: '#5a3a1a', shirt: '#ffcf3f', pants: '#e2574c', skirt: true, kid: true, h: 115, acc: ['ribbon'] },
      idle: [
        { text: 'パパぁ……どこぉ……', when: [notDone('S6-E16'), notDone('S6-E18')] },
        { text: 'あのフワフワ、ほしいなあ', when: [notDone('S6-E15')] },
        { text: 'もっといっぱいあったら、お空からパパさがせるかな', when: [done('S6-E15'), notDone('S6-E16'), notDone('S6-E17')] },
        { text: '迷子のときは、どこに行けばいいんだっけ……', when: [notDone('S6-E16'), notDone('S6-E17')] },
        { text: 'もじもじ……（足をくねくねさせている）', when: [notDone('S6-E16'), notDone('S6-E17'), notDone('S6-E21')] },
        { text: 'パパ、だっこ〜！', when: [{ anyEventDone: ['S6-E16', 'S6-E18'] }] },
      ] },
    papa: { name: 'ミナのパパ', x: 5600, y: 2800, wander: 260, speed: 90, look: { hair: 'short', hairColor: '#2a2a2a', shirt: '#6aa84f', pants: '#3a3a5a', acc: ['bag'], h: 178 },
      idle: [
        { text: 'ミナー！ ミナー！ どこ行ったんだー！', when: [notDone('S6-E16'), notDone('S6-E18')] },
        { text: 'ちょっと目をはなしたすきに……ああ……', when: [notDone('S6-E16'), notDone('S6-E18')] },
        { text: 'こんなに広いと、声も届かない……', when: [notDone('S6-E16'), notDone('S6-E18')] },
        { text: 'もう二度と手をはなさないぞ', when: [{ anyEventDone: ['S6-E16', 'S6-E18'] }] },
      ] },
    balloon: { name: '風船売りのフワ爺', x: 1700, y: 2640, wander: 30, look: { hair: 'bald', hairColor: '#eee', shirt: '#ff8fab', pants: '#555', acc: ['beard', 'hat'], hatColor: '#4dabf7', old: true, h: 168 },
      idle: [{ text: 'ふうせん、ふうせん、一個百円だよ〜', when: [notDone('S6-E15')] }, 'きょうは風が強いから、気をつけてな', '泣いとる子には、風船がいちばんの薬じゃ', { text: 'ありったけ持たせたら、あの子、飛んでいっちまうかもなあ。ほっほ', when: [done('S6-E15'), notDone('S6-E16'), notDone('S6-E17')] }] },
    infostaff: { name: '案内係の音羽さん', x: 1030, y: 2580, wander: 50, look: { hair: 'bob', hairColor: '#4a2e1e', shirt: '#3b8bd9', pants: '#223', skirt: true, acc: ['scarf'], h: 163 },
      idle: [
        'インフォメーションです。お困りのことはありませんか？',
        { text: '迷子のお子さまは、こちらでお預かりしていますよ〜', when: [notDone('S6-E17')] },
        { text: '放送で呼び出しますね。……でも、ちゃんと聞いてくださるかしら', when: [done('S6-E17'), notDone('S6-E18')] },
        '落とし物も届いていますのに、持ち主さんが来なくて……',
      ] },
    // ── カツラの紳士と息子 ──
    bucho: { name: 'カツラの鷹野さん', x: 900, y: 1240, wander: 40, speed: 40, look: { hair: 'bald', hairColor: '#333', shirt: '#4a5a7a', pants: '#2a2a2a', acc: ['tie', 'glasses'], h: 173 },
      idle: [
        { text: 'さっきのコースターで、頭が……スースーする……', when: [notDone('S6-E22')] },
        { text: 'だ、だれも見てないな？ わたしの頭を見てないな？', when: [notDone('S6-E22')] },
        'ソウタ、走るんじゃない！ パパはもうヘトヘトだ',
        { text: 'ふふふ、カンペキだ。……カンペキだよな？', when: [done('S6-E22')] },
      ] },
    sota: { name: '息子のソウタ', x: 1250, y: 1220, wander: 120, speed: 80, look: { hair: 'spiky', hairColor: '#222', shirt: '#ff6b6b', pants: '#2a4a8a', kid: true, h: 130, acc: ['cap'], hatColor: '#ffcf3f' },
      idle: [
        'ねえパパ、次なに乗る！？ なに乗る！？',
        { text: 'グルグル回るやつ、ぜんぶ乗りたい！', when: [notDone('S6-E12')] },
        { text: 'ヒューって落ちるやつ、身長たりるかな？', when: [notDone('S6-E14')] },
        { text: 'ふねがブランコみたいになってた！', when: [notDone('S6-E13')] },
        { text: 'さっきのおばちゃん、だれかさがしてたよ', when: [done('S6-E34')] },
      ] },
    // ── 漫才コンビ ──
    tetsu: { name: 'ツッコミのテツ', x: 2050, y: 1250, wander: 140, speed: 70, look: { hair: 'short', hairColor: '#222', shirt: '#e2574c', pants: '#222', acc: ['tie'], h: 173 },
      idle: [{ text: '相方のボン、どこ行ったんや……営業前やのに', when: [notDone('S6-E01')] }, { text: 'あいつ、高いとこ好きやからなあ', when: [notDone('S6-E01')] }, 'なんでやねん、の練習でもしとこ', { text: 'こいつと組んで十年、ずっとこれや', when: [done('S6-E01')] }] },
    boke: { name: 'ボケのボン', x: 430, y: 1210, hidden: true, wander: 60, look: { hair: 'afro', hairColor: '#5a3a1a', shirt: '#ffcf3f', pants: '#222', acc: ['tie'], h: 168 },
      idle: ['コースター、もう一周いっとく？', 'テツ、ボクのことさがしてたん？ 知らんかった〜'] },

    // ── いたずら小僧と空き缶 ──
    prank: { name: 'いたずら小僧のケン坊', x: 3000, y: 2660, wander: 180, speed: 110, look: { hair: 'mohawk', hairColor: '#333', shirt: '#2ecc71', pants: '#8a5a33', kid: true, h: 130 },
      idle: [
        { text: 'あっちー！ のど、カラッカラだぜ', when: [notDone('S6-E24')] },
        'へへーん、つかまえてみろー！',
        { text: 'カラコロいう靴、かっこよさそう', when: [notDone('S6-E26')] },
        { text: 'ポイッとな。ゴミ箱？ 遠いもん', when: [done('S6-E24'), notDone('S6-E25')] },
        { text: '……ボク、どっか壊れてるのかな', when: [done('S6-E25'), notDone('S6-E27')] },
      ] },
    cleaner: { name: '清掃員のピカ山さん', x: 2000, y: 2200, path: 'cleanerRoute', speed: 55, look: { hair: 'short', hairColor: '#777', shirt: '#4a8a6a', pants: '#3a5a4a', acc: ['cap'], hatColor: '#4a8a6a', old: true, h: 173 },
      idle: [
        '園内ピカピカ、心もピカピカ',
        { text: 'どこかに缶が転がってる気がするんだが、目が悪くてねえ', when: [notDone('S6-E23')] },
        { text: 'あと何個あるかねえ……', when: [{ any: [cnt('S6-can1', 1), cnt('S6-can2', 1), cnt('S6-can3', 1), cnt('S6-can4', 1)] }, notDone('S6-E23')] },
        { text: 'ポイ捨てする子には、ひとこと言わんとな', when: [notDone('S6-E25')] },
        { text: 'これで園内、ぜんぶピカピカだ！', when: [done('S6-E23')] },
      ] },
    toolman: { name: '工具おじさん', x: 5620, y: 1990, wander: 60, look: { hair: 'short', hairColor: '#555', shirt: '#4a6fa5', pants: '#2b3a55', acc: ['helmet', 'mustache'], hatColor: '#ffcf3f', muscle: true, h: 178 },
      idle: ['ガタガタいうもんは、なんでも直すぞ', 'ネジがゆるんどるやつは、おらんかね', 'コースターの点検、今日もバッチリ'] },

    // ── デート ──
    kare: { name: 'デート中のユウスケ', x: 2420, y: 1240, wander: 50, look: { hair: 'short', hairColor: '#4a2e1e', shirt: '#fff', pants: '#3a5a8a', acc: ['bag'], h: 178 },
      idle: [
        { text: 'しまった、カメラ忘れた……いや、言わなきゃバレない', when: [notDone('S6-E28')] },
        'アカリ、なに乗りたい？ ぼくはなんでも平気だよ（ほんとは高いとこ苦手）',
        { text: 'ふたりの写真、だれかに撮ってもらえないかな', when: [done('S6-E28'), notDone('S6-E29'), notDone('S6-E30')] },
        { text: 'いい写真が撮れた。一生の宝物だ', when: [{ anyEventDone: ['S6-E29', 'S6-E30'] }] },
      ] },
    kano: { name: '彼女のアカリ', x: 2500, y: 1252, wander: 50, look: { hair: 'long', hairColor: '#6a3a1a', shirt: '#ff8fab', pants: '#fff', skirt: true, acc: ['earring', 'bag'], h: 166 },
      idle: [
        'ねえ、記念写真撮ろうよ',
        { text: 'こわいのはイヤ。キャーってなるのはもっとイヤ', when: [notDone('S6-E31'), notDone('S6-E32')] },
        { text: 'ユウスケ、いまどこ見てた？', when: [done('S6-E33')] },
      ] },
    lady1: { name: '旅行中のハルカ', x: 5300, y: 2060, wander: 70, look: { hair: 'bob', hairColor: '#222', shirt: '#9b59b6', pants: '#333', acc: ['camera', 'sunglasses'], h: 166 },
      idle: ['写真撮るの、だ〜いすき！', 'カップルを見ると撮ってあげたくなるのよねえ', 'はい、チーズ……って練習中'] },
    lady2: { name: '旅行中のナツミ', x: 5390, y: 2072, wander: 70, look: { hair: 'pony', hairColor: '#7a4a2a', shirt: '#f39c12', pants: '#333', acc: ['bag'], h: 164 },
      idle: ['ハルカ、また人の写真撮る気でしょ', 'わたしたちも、いつか彼氏と来たいね……'] },
    bijin: { name: '謎の美人', x: 2200, y: 2150, path: 'bijinWalk', speed: 45, look: { hair: 'long', hairColor: '#111', shirt: '#c0392b', pants: '#111', skirt: true, acc: ['sunglasses', 'earring'], h: 180 },
      idle: ['……ふふっ', 'いい天気ね', '（すれちがう人がみんな振りかえる）'] },

    // ── 射的とメガネの親子 ──
    takumi: { name: 'メガネのタクミ', x: 3350, y: 2620, wander: 50, look: { hair: 'bob', hairColor: '#222', shirt: '#f1c40f', pants: '#2a4a8a', kid: true, h: 130, acc: ['glasses'] },
      idle: [
        { text: 'あのロボット、ぜったいほしい……でも当たらない', when: [notDone('S6-E35')] },
        'ぼく、ヒーローみたいにかっこよくなりたいんだ',
        { text: '今日の記念、なにか残したいな', when: [notDone('S6-E37')] },
        { text: 'ママ、どこ行ったんだろ。ぼくは迷子じゃないよ', when: [notDone('S6-E34')] },
      ] },
    ritsuko: { name: 'メガネのリツコ', x: 3700, y: 2800, wander: 120, look: { hair: 'bun', hairColor: '#3a2a1a', shirt: '#e67e22', pants: '#4a3a2a', acc: ['glasses', 'bag'], h: 168 },
      idle: [
        'タクミったら、すぐどこかに行っちゃうんだから',
        'わたし、写真の腕にはちょっと自信があるのよ',
        { text: 'あの落ちるやつ、子どもはこわくないのかしら', when: [notDone('S6-E34')] },
      ] },
    shooter: { name: '射撃スタッフのバン', x: 3500, y: 2560, wander: 60, look: { hair: 'spiky', hairColor: '#a33', shirt: '#c0392b', pants: '#222', acc: ['apron', 'headphones'], h: 176 },
      idle: ['さあ、一回三発！ 景品はでっかいぞ〜', 'コツ？ 肩の力をぬいて、心をカラッポにするのさ', 'ヒーローってのは、外してもくじけないもんだ'] },
    // ── ジャグラー ──
    juggler: { name: 'ジャグラーのコロ助', x: 1880, y: 1960, wander: 0, look: { hair: 'afro', hairColor: '#e74c3c', shirt: '#fff', pants: '#3498db', acc: ['hat'], hatColor: '#2ecc71', h: 168 },
      idle: ['ボールの上でも、お手玉三つ！ ……おっとっと', 'だれか、オレのこと見てくれー！', '拍手はいつでも受けつけ中！'] },
    gal: { name: '日焼けギャルのマリン', x: 1300, y: 2190, wander: 100, look: { hair: 'long', hairColor: '#f5d76e', skin: '#9a6a44', shirt: '#ff5ec4', pants: '#fff', skirt: true, acc: ['earring', 'sunglasses'], h: 166 },
      idle: ['ちょ、遊園地まじアガるんだけど', 'なんかオモロいの、ないの〜？', 'ウチ、かわいいものとすごいものには弱いんよ'] },
    // ── 怪獣ショー・お化け屋敷 ──
    monactor: { name: '怪獣ガオゴン', x: 1700, y: 1680, wander: 110, speed: 60, look: { hair: 'none', shirt: '#4caf50', pants: '#2e7d32', costume: '🦖', wide: true, h: 180 },
      idle: [
        { text: 'ガオーーッ！ ……（なかの人、息が切れている）', when: [notDone('S6-E02')] },
        { text: '（頭がずれる……おさえなきゃ）', when: [notDone('S6-E02')] },
        'ガオォ……人手不足だガオ……',
        { text: 'ガオゴン二号、いい顔してるなあ', when: [done('S6-E03')] },
      ] },
    monman: { name: 'こわもての男', x: 1500, y: 2160, wander: 160, look: { hair: 'afro', hairColor: '#111', shirt: '#444', pants: '#222', acc: ['beard', 'scarf'], muscle: true, wide: true, h: 186 },
      idle: ['……（子どもに泣かれた）', 'おれ、顔がこわいって言われるんだ', 'なにか、この顔が役に立つ仕事はないかなあ'] },
    obake: { name: 'お化け役のバイト', x: 4100, y: 1950, wander: 90, look: { hair: 'long', hairColor: '#222', shirt: '#eee', pants: '#eee', skirt: true, skin: '#dfe8ea', h: 168 },
      idle: ['うらめしや〜……あ、休憩まだかな', 'この白い服、すぐ汚れるんですよね', 'うらめしや〜（棒読み）'] },
    hstaff: { name: 'お化け屋敷スタッフ', x: 4400, y: 1965, wander: 70, look: { hair: 'short', hairColor: '#333', shirt: '#2b2735', pants: '#111', acc: ['cap'], hatColor: '#c33', h: 173 },
      idle: [
        'うちのお化けは日本一こわいですよ！ ……たぶん',
        { text: '本物？ そんなもん、いるわけないでしょ', when: [notDone('S6-E40')] },
        { text: 'お化け役、もうひとりいたっけ……？', when: [done('S6-E39'), notDone('S6-E40')] },
      ] },
    ghost: { name: '本物の幽霊', emoji: '👻', size: 80, x: 4250, y: 1720, hidden: true, wander: 120, speed: 30, idle: ['……ここ、居心地いいの……', '……ひゅ〜どろどろ……'] },
    hphone: { name: 'ヘッドホンのDJ青年', x: 6050, y: 2860, wander: 120, look: { hair: 'spiky', hairColor: '#4a90e2', shirt: '#222', pants: '#555', acc: ['headphones', 'sunglasses'], h: 178 },
      idle: ['ズンチャ、ズンチャ♪（なにも聞こえていない）', 'あれ、財布……まあいっか、ズンチャ♪', 'いまなんか言った？ ……ま、いっか'] },
    // ── 似顔絵コーナー ──
    painter: { name: '肖像画家のエノグ先生', x: 4700, y: 2630, wander: 0, look: { hair: 'long', hairColor: '#777', shirt: '#d35400', pants: '#3a3a3a', acc: ['beard', 'hat'], hatColor: '#222', h: 176 },
      idle: ['似顔絵いかが？ 見たままを、いや、見えないものまで描きますぞ', 'ワシの筆は、ウソがつけんのじゃ', 'モデルさん、来ないかのう……'] },
    jk: { name: '厚化粧の女子高生キララ', x: 4620, y: 2850, wander: 90, look: { hair: 'twin', hairColor: '#f39c12', shirt: '#2c3e50', pants: '#2c3e50', skirt: true, skin: '#fff3f3', acc: ['ribbon', 'earring'], h: 163 },
      idle: ['メイク、三時間かかった♡', '写真映えしたいの！ 盛れるとこない？', '顔の話はやめて。すっぴんは国家機密だから'] },
    kurofuku: { name: '黒服の男', x: 5060, y: 2760, wander: 60, look: { hair: 'short', hairColor: '#111', shirt: '#111', pants: '#111', acc: ['sunglasses', 'tie'], h: 186 },
      idle: ['……（ずっと誰かを見守っている）', '……任務中だ', '……（ポケットにヒーローのお面が見える）'] },
    idol: { name: '帽子とサングラスの女性', x: 4400, y: 2920, wander: 90, look: { hair: 'long', hairColor: '#c97a4a', shirt: '#fff', pants: '#5a7aa8', acc: ['sunglasses', 'mask', 'hat'], hatColor: '#ddd', h: 168 },
      idle: ['……しーっ。今日はオフなの', 'バレてない……よね？', '（小さく鼻歌。どこかで聞いたメロディ）'] },
    // ── 着ぐるみ ──
    rabbit: { name: 'ウサギのピョンタ', x: 1500, y: 2900, path: 'rabbitWalk', speed: 60, look: { hair: 'none', shirt: '#fff', pants: '#ffb3d1', costume: '🐰', wide: true, h: 176 },
      idle: ['（ピョンピョン！）', '（手をふっている）', '（なかから「あっつ……」と聞こえた）'] },
    squirrel: { name: 'リスのクルミン', x: 4400, y: 1220, path: 'squirrelWalk', speed: 60, look: { hair: 'none', shirt: '#c97a4a', pants: '#8a5a33', costume: '🐿️', wide: true, h: 176 },
      idle: ['（しっぽをフリフリ）', '（どんぐりを配っている）', '（トイレの方角を指さして、くるくる回った）'] },
    // ── 方言カップル ──
    osaF: { name: '大阪のミサキ', x: 4930, y: 2010, wander: 40, look: { hair: 'bob', hairColor: '#4a2e1e', shirt: '#e74c3c', pants: '#333', acc: ['earring'], h: 165 },
      idle: ['もう足パンパンやわ', 'なんか食べたいなあ、あったかいの', 'ちょっと、聞いてる？'] },
    osaM: { name: '大阪のタツヤ', x: 5020, y: 2022, wander: 40, look: { hair: 'spiky', hairColor: '#222', shirt: '#f1c40f', pants: '#333', h: 180 },
      idle: ['よっしゃ、次いこ次！', 'たこ焼きの屋台、どこやろ'] },
    tohF: { name: '東北のスズ', x: 960, y: 1990, wander: 40, look: { hair: 'long', hairColor: '#2a1a0a', shirt: '#a3cfe8', pants: '#555', acc: ['scarf'], h: 163 },
      idle: ['ふねっこ、ゆさゆさしてらねえ', 'なんだかさみぐなってきたなや', '手っこ、つめでぇ……'] },
    tohM: { name: '東北のケンジ', x: 1040, y: 2000, wander: 40, look: { hair: 'short', hairColor: '#333', shirt: '#7a5a3a', pants: '#333', acc: ['cap'], hatColor: '#355', h: 180 },
      idle: ['んだなあ', 'ほれ、あれっこ乗るべ'] },
    hakF: { name: '博多のアヤ', x: 4560, y: 2000, wander: 40, look: { hair: 'pony', hairColor: '#3a2010', shirt: '#ff8fab', pants: '#fff', skirt: true, acc: ['ribbon'], h: 164 },
      idle: ['お化け屋敷、ちょっとだけこわかぁ', 'ねえ、ちゃんと聞いとう？'] },
    hakM: { name: '博多のリョウ', x: 4640, y: 2010, wander: 40, look: { hair: 'short', hairColor: '#222', shirt: '#2c3e50', pants: '#555', h: 182 },
      idle: ['ラーメン食べたかね〜', 'なんでんよかよ'] },
    climber: { name: '登山家のゴロー', x: 3650, y: 2880, wander: 140, speed: 50, look: { hair: 'short', hairColor: '#333', shirt: '#c0392b', pants: '#5a4a2a', acc: ['beard', 'hat', 'bag'], hatColor: '#6b8e23', muscle: true, h: 183 },
      idle: ['平らな場所は、どうも落ちつかん', 'わしの心は、いつも頂上にある', 'このあたりに、登りがいのある峰はないかのう'] },
    // ── 乗り物（撮れる） ──
    coaster: { name: 'ギャラクシー・コースター', emoji: '🎢', size: 110, x: 250, y: 1090, path: 'coasterLoop', speed: 300, idle: ['キャーーー！', 'ゴォォォォ……', 'ワーーーッ！'], idleEveryMs: 7000 },
    ship: { name: '大海賊船ドクロ丸', emoji: '⛵', size: 250, x: 600, y: 1700, path: 'shipSwing', speed: 260, idle: ['ギィ……ギィ……', 'キャー！ 落ちるー！'], idleEveryMs: 8000 },
    drop: { name: 'スカイドロップ', emoji: '💺', size: 80, x: 3320, y: 1100, path: 'dropLoop', speed: 220, idle: ['ヒュウウウウン！', 'ぎゃああああ！'], idleEveryMs: 8000 },
    // ── 背景の人々（ダミー） ──
    pigeon: { name: 'ハト', emoji: '🕊️', size: 44, x: 3800, y: 2120, wander: 200, speed: 80, idle: ['クルックー'] },
    icecream: { name: 'アイス売り', x: 6080, y: 2640, wander: 40, look: { hair: 'short', hairColor: '#a33', shirt: '#fff', pants: '#3a8ad9', acc: ['apron', 'cap'], hatColor: '#3a8ad9', h: 168 },
      idle: ['アイスいかが〜、とけるまえに〜', 'きょうは何味が人気かなあ'] },
  },
  objects: {
    // 入口・案内所
    info: { name: '案内所', sign: { text: '案内所 i', fill: '#3b8bd9', color: '#fff', s: 30 }, w: 220, h: 70, x: 1030, y: 2330 },
    pa: { name: '場内放送スピーカー', emoji: '📢', size: 64, x: 1392, y: 2240 },
    balloonbunch: { name: '風船の束', emoji: '🎈', size: 120, x: 1720, y: 2560, hidden: true, capturable: false },
    wig: { name: '曲がったカツラ', emoji: '🦱', size: 40, x: 1180, y: 1300, rot: 0.6, minZoom: 1.1 },
    // 空き缶 4 か所
    can1: { name: '空き缶', emoji: '🥫', size: 28, x: 900, y: 2245, minZoom: 1.2, rot: 1.4 },
    can2: { name: '空き缶', emoji: '🥫', size: 28, x: 3290, y: 2075, minZoom: 1.2, rot: -1.3 },
    can3: { name: '空き缶', emoji: '🥫', size: 28, x: 3880, y: 2760, minZoom: 1.2, rot: 1.6 },
    can4: { name: 'ジュースの空き缶', emoji: '🥫', size: 30, x: 3060, y: 2565, minZoom: 1.1, rot: 1.5, hidden: true },
    juice: { name: 'ジュースの自販機', prop: 'vending', propOpts: { color: '#e74c3c' }, size: 170, w: 100, h: 170, x: 2930, y: 2480 },
    camvend: { name: 'カメラの自販機', prop: 'vending', propOpts: { color: '#2c5a9a' }, size: 170, w: 100, h: 170, x: 3050, y: 2480 },
    geta: { name: '下駄', emoji: '🩴', size: 36, x: 5250, y: 2235, minZoom: 1.1 },
    // 怪獣・お化け
    monhead: { name: '怪獣の頭（予備）', emoji: '🐲', size: 70, x: 1990, y: 1690 },
    haunted: { name: 'お化け屋敷', sign: { text: '👻 入口', fill: '#1a1a22', color: '#c8ff7a', s: 26 }, w: 150, h: 64, x: 4240, y: 1690 },
    // 射的・記念写真
    hero: { name: 'ヒーロー像', emoji: '🦸', size: 130, x: 4040, y: 2440 },
    panel: { name: '記念写真パネル', sign: { text: '😀 顔ハメ 😀', fill: '#ffcf3f', color: '#c0392b', s: 22 }, w: 140, h: 180, x: 4280, y: 2535 },
    // 似顔絵・山
    canvas: { name: '似顔絵のキャンバス', sign: { text: '', fill: '#fff', color: '#333', s: 48 }, w: 110, h: 130, x: 4850, y: 2630, capturable: false },
    mountain: { name: 'ドンブラ山（アトラクション）', emoji: '⛰️', size: 200, x: 5560, y: 1120 },
    // ステージの演出用
    rainbow: { name: '虹', emoji: '🌈', size: 420, x: 2950, y: 1250, hidden: true, capturable: false },
    // ── ダミー（撮れるけど何も起きにくい物） ──
    map: { name: '園内マップ', sign: { text: '🗺️ MAP', fill: '#fff', color: '#3b8bd9', s: 22 }, w: 120, h: 90, x: 1530, y: 2560 },
    popcorn: { name: 'ポップコーン', emoji: '🍿', size: 44, x: 2420, y: 2560 },
    icecone: { name: 'ソフトクリーム', emoji: '🍦', size: 40, x: 6150, y: 2600 },
    trashbin: { name: 'ゴミ箱', emoji: '🗑️', size: 54, x: 5560, y: 1960 },
    teacup: { name: 'コーヒーカップの看板', emoji: '☕', size: 60, x: 3600, y: 1170 },
    ferris: { name: '観覧車のミニチュア', emoji: '🎡', size: 90, x: 2900, y: 1170 },
    carousel: { name: 'メリーゴーランドの木馬', emoji: '🎠', size: 90, x: 4850, y: 1110 },
    ticket: { name: '回数券', emoji: '🎫', size: 30, x: 1450, y: 2960, minZoom: 1.1 },
    sunglasses: { name: '落ちたサングラス', emoji: '🕶️', size: 30, x: 5250, y: 2960, minZoom: 1.1 },
    hotdog: { name: 'ホットドッグ', emoji: '🌭', size: 38, x: 5170, y: 2028, z: 2080 },
    bouquet: { name: '花束', emoji: '💐', size: 40, x: 2340, y: 1290 },
    teddy: { name: '景品のクマ', emoji: '🧸', size: 46, x: 3720, y: 2545 },
    pumpkin: { name: 'カボチャのおばけ', emoji: '🎃', size: 50, x: 3900, y: 1850 },
    palette: { name: '絵の具パレット', emoji: '🎨', size: 40, x: 4600, y: 2645 },
    lantern: { name: 'ちょうちん', emoji: '🏮', size: 40, x: 4560, y: 1700 },
    drum: { name: '太鼓', emoji: '🥁', size: 50, x: 2280, y: 1700 },
  },
  paths: {
    coasterLoop: { points: COASTER, speed: 300, loop: true },
    shipSwing: { points: SHIP, speed: 260, loop: true },
    dropLoop: { points: [[3320, 1100], [3320, 330], [3320, 335]], speed: 220, loop: true },
    cleanerRoute: { points: [[600, 2170], [3800, 2170], [3800, 2260], [600, 2260]], speed: 55, loop: true },
    bijinWalk: { points: [[2150, 2140], [3700, 2150], [3700, 2250], [2150, 2240]], speed: 45, loop: true },
    rabbitWalk: { points: [[1400, 2850], [2500, 2820], [2620, 2960], [1500, 2980]], speed: 60, loop: true },
    squirrelWalk: { points: [[3700, 1200], [6200, 1190], [6200, 1290], [3700, 1300]], speed: 60, loop: true },
    minaFly: { points: FLY, speed: 380, loop: false },
    minaFlyB: { points: FLY.map(([x, y]) => [x, y - 130]), speed: 380, loop: false },
    finaleGather: { points: [[2700, 1700], [2950, 1690]], speed: 200, loop: false },
  },
  reactions: [
    { s: 'can1', t: 'cleaner', say: 'おっと、こんなところにも。……ほかにもありそうだね', counter: 'S6-can1', when: [notDone('S6-E23'), { countAtMost: { id: 'S6-can1', value: 0 } }], anim: 'react.think' },
    { s: 'can2', t: 'cleaner', say: '客席の下に缶が！ まだどこかにありそうだ', counter: 'S6-can2', when: [notDone('S6-E23'), { countAtMost: { id: 'S6-can2', value: 0 } }], anim: 'react.think' },
    { s: 'can3', t: 'cleaner', say: '射的屋のほうにも転がってたか。やれやれ', counter: 'S6-can3', when: [notDone('S6-E23'), { countAtMost: { id: 'S6-can3', value: 0 } }], anim: 'react.think' },
    { s: 'can4', t: 'cleaner', say: '自販機の前だね。……でも、まだ見落としがある気がする', counter: 'S6-can4', when: [notDone('S6-E23'), { countAtMost: { id: 'S6-can4', value: 0 } }], anim: 'react.think' },
    { s: 'can1', t: 'cleaner', say: 'その缶はもう覚えたよ。ほかの場所にも落ちてないかねえ', when: [notDone('S6-E23')], anim: 'react.shrug' },
    { s: 'can2', t: 'cleaner', say: 'その缶はもう覚えたよ。ほかの場所にも落ちてないかねえ', when: [notDone('S6-E23')], anim: 'react.shrug' },
    { s: 'can3', t: 'cleaner', say: 'その缶はもう覚えたよ。ほかの場所にも落ちてないかねえ', when: [notDone('S6-E23')], anim: 'react.shrug' },
    { s: 'can4', t: 'cleaner', say: 'その缶はもう覚えたよ。ほかの場所にも落ちてないかねえ', when: [notDone('S6-E23')], anim: 'react.shrug' },
    { s: 'aud5', t: 'host', say: '同じ質問は二度は受けつけません！ ほかのお客さまの声もどうぞ〜', when: [done('S6-E08'), notDone('S6-E52')], anim: 'react.shrug' },
    { s: 'aud5', t: 'host', say: 'その質問は、園内のみんなが笑顔になってからのお楽しみ！', when: [done('S6-E52'), notDone('S6-E53')], anim: 'react.think' },
    { s: 'mina', t: 'papa', say: 'ミ、ミナ……？ いや、写真じゃなくて本人はどこだ！？', when: [notDone('S6-E16'), notDone('S6-E18')], anim: 'react.surprised' },
    { s: 'pa', t: 'papa', say: 'ん？ いまはなにも放送してないな', when: [notDone('S6-E17')], anim: 'react.shrug' },
    { s: 'coaster', t: 'kano', say: 'あれは……見るだけでいい', when: [done('S6-E32')], anim: 'react.shrug' },
  ],
  exclusiveGroups: [
    { id: 'S6-MINA', policy: 'FIRST_TRIGGER_WINS', eventIds: ['S6-E16', 'S6-E17'] },
    { id: 'S6-DATE', policy: 'FIRST_TRIGGER_WINS', eventIds: ['S6-E31', 'S6-E32'] },
  ],
  timeline: [
    { every: 30000, start: 12000, effects: [{ type: 'ACTOR_SPEECH', actorId: 'infostaff', text: '〽ピンポンパンポン♪ 本日はハテナランドにご来園いただき、まことにありがとうございます' }] },
    { every: 30000, start: 27000, effects: [{ type: 'ACTOR_SPEECH', actorId: 'host', text: 'なんでも答えまショー、ただいま質問受付中〜！' }] },
    { every: 45000, start: 40000, effects: [{ type: 'ACTOR_SPEECH', actorId: 'infostaff', text: '〽落とし物のお知らせです。黒いお財布をお預かりしております' }] },
    { every: 2500, start: 2500, when: [done('S6-E24'), notDone('S6-E23'), cnt('S6-can1', 1), cnt('S6-can2', 1), cnt('S6-can3', 1), cnt('S6-can4', 1)], effects: [{ type: 'QUEUE_EVENT', eventId: 'S6-E23' }] },
    { at: 240000, effects: [{ type: 'ACTOR_SPEECH', actorId: 'infostaff', text: '〽まもなく、ステージにてフィナーレの最後の質問コーナーがはじまります！' }, { type: 'PLAY_SOUND', soundId: 'bell' }] },
  ],
  events: [
    // ── 漫才コンビ ──
    { id: 'S6-E01', s: 'coaster', t: 'tetsu', cat: 'FLAVOR', title: 'コースターの上に相方を発見', say: 'おった！ なんで営業前にコースター乗っとんねん！', anim: 'react.surprised', route: 'S6.route.misc',
      fx: [{ type: 'ACTOR_SHOW', actorId: 'boke', delayMs: 1500 }, { type: 'ACTOR_MOVE', actorId: 'tetsu', to: [520, 1220], speed: 220, wander: 60 },
        { type: 'ACTOR_SPEECH', actorId: 'boke', text: 'あ、テツ〜。三周したら髪型こうなってん', delayMs: 4500 }, { type: 'ACTOR_SPEECH', actorId: 'tetsu', text: 'もとからやろ！', delayMs: 6500 }, { type: 'PLAY_SOUND', soundId: 'laugh', delayMs: 6500 }] },
    // ── 怪獣ショー ──
    { id: 'S6-E02', s: 'monhead', t: 'monactor', cat: 'FLAVOR', title: 'ガオゴンの中の人', say: 'ガオ？ 予備の頭……あっ、ずれてる！ 直さなきゃ……', anim: 'react.embarrassed', route: 'S6.route.monster',
      fx: [{ type: 'ACTOR_APPEARANCE', actorId: 'monactor', look: { costume: null, hair: 'bald', hairColor: '#555', acc: ['mustache'] }, delayMs: 1200 }, { type: 'FX', kind: 'smoke', at: 'monactor', delayMs: 1100 },
        { type: 'ACTOR_SPEECH', actorId: 'monactor', text: '……どうも、中の人です。五十八歳です', delayMs: 2600 }, { type: 'ACTOR_SPEECH', actorId: 'gal', text: 'え、ふつうのおじさんじゃん！ ウケる！', delayMs: 4200 },
        { type: 'ACTOR_APPEARANCE', actorId: 'monactor', look: { costume: '🦖' }, delayMs: 9000 }] },
    { id: 'S6-E03', s: 'monman', t: 'monactor', cat: 'FLAVOR', title: '怪獣ショーに新人スカウト', say: 'ガオッ！？ その顔、その迫力……キミ、怪獣やらないか！？', anim: 'react.sparkle', route: 'S6.route.monster',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'monman', to: [1600, 1690], speed: 160, wander: 80 }, { type: 'ACTOR_SPEECH', actorId: 'monman', text: 'お、おれの顔が……役に立つ……！', delayMs: 2400 }, { type: 'ACTOR_APPEARANCE', actorId: 'monman', look: { costume: '🐊' }, delayMs: 5000 }, { type: 'FX', kind: 'stars', at: 'monman', delayMs: 5000 }, { type: 'PLAY_SOUND', soundId: 'roar', delayMs: 5200 }] },

    // ── なんでも答えまショー（8 つの質問） ──
    { id: 'S6-E04', s: 'aud1', t: 'host', cat: 'CHAIN', title: '答え：絶世の美女', say: 'もう一度ときめきたい？ では答えをどうぞ……絶世の美女、ここに見参！ うっふん', anim: 'react.transform', route: 'S6.route.show',
      fx: [qa, { type: 'ACTOR_APPEARANCE', actorId: 'host', look: { hair: 'long', hairColor: '#e6b35a', acc: ['ribbon', 'earring'] }, delayMs: 800 }, { type: 'FX', kind: 'hearts', at: 'host', delayMs: 900 },
        { type: 'ACTOR_APPEARANCE', actorId: 'host', look: { hair: 'short', hairColor: '#222', acc: ['tie', 'hat', 'mustache'] }, delayMs: 7000 }],
      after: [{ actor: 'aud1', text: '……ばあさんのほうが、百倍美人じゃ', delay: 3200 }] },
    { id: 'S6-E05', s: 'aud2', t: 'host', cat: 'CHAIN', title: '答え：鳥になる方法', say: '鳥みたいに飛ぶ方法？ 腕をこう……バサッ、バサッ……ゼェ、ゼェ……心は、飛んだ！', anim: 'react.spin', route: 'S6.route.show',
      fx: [qa, { type: 'FX', kind: 'leaves', at: 'host', delayMs: 600 }, { type: 'ACTOR_SPEECH', actorId: 'pigeon', text: 'クルッ？（ハトが見ている）', delayMs: 2600 }],
      after: [{ actor: 'aud2', text: 'ぜんぜん飛んでないじゃん！ あはは！', delay: 3400 }] },
    { id: 'S6-E06', s: 'aud3', t: 'host', cat: 'CHAIN', title: '答え：世界一のごはん', say: '世界一おいしい食べ物！ それは……おなかペコペコのときの、なんでもないおにぎりだ！', anim: 'react.eat', route: 'S6.route.show',
      fx: [qa, { type: 'FX', kind: 'sparkle', at: 'aud3', delayMs: 1500 }],
      after: [{ actor: 'aud3', text: 'わかる……！ わかりすぎて、おなか鳴った', delay: 3000 }] },
    { id: 'S6-E07', s: 'aud4', t: 'host', cat: 'CHAIN', title: '答え：天使はいる', say: '天使はいるとも。キミが笑うと、となりの人がちょっぴり幸せになる。それが天使のしわざさ', anim: 'react.sparkle', route: 'S6.route.show',
      fx: [qa, { type: 'ACTOR_APPEARANCE', actorId: 'host', look: { acc: ['tie', 'crown', 'mustache'] }, delayMs: 500 }, { type: 'FX', kind: 'stars', at: 'aud4', delayMs: 1500 },
        { type: 'ACTOR_APPEARANCE', actorId: 'host', look: { acc: ['tie', 'hat', 'mustache'] }, delayMs: 8000 }],
      after: [{ actor: 'aud4', text: 'にこ〜っ！', delay: 3000 }] },
    { id: 'S6-E08', s: 'aud5', t: 'host', cat: 'PROGRESSION', title: '答え：虹のふもと', say: '虹のふもと？ 追いかけるほど遠くなる場所さ。だから人は、ずっと歩いていけるんだ', anim: 'react.think', route: 'S6.route.show',
      fx: [qa, { type: 'SPAWN_OBJECT', objectId: 'rainbow', delayMs: 800 }, { type: 'FX', kind: 'sparkle', at: 'rainbow', delayMs: 900 }, { type: 'PLAY_SOUND', soundId: 'success', delayMs: 900 }],
      after: [{ actor: 'aud5', text: 'すてき……。ほかのみんなは、なにを聞くのかな', delay: 3600 }] },
    { id: 'S6-E09', s: 'aud6', t: 'host', cat: 'CHAIN', title: '答え：肩こり解消', say: '体のお悩み？ 両手を上げて、遊園地の空気を吸って〜……ハッハッハと笑う！ はい、なおった！', anim: 'react.laugh', route: 'S6.route.show',
      fx: [qa, { type: 'ACTOR_SET_STATE', actorId: 'aud6', state: 'HAPPY', delayMs: 2000 }, { type: 'FX', kind: 'sparkle', at: 'aud6', delayMs: 2000 }],
      after: [{ actor: 'aud6', text: 'あれ……ほんとに軽い！ 笑うの、何年ぶりだろう', delay: 3200 }] },
    { id: 'S6-E10', s: 'aud7', t: 'host', cat: 'CHAIN', title: '答え：ナゼ太郎の走馬灯', say: '人生はメリーゴーラウンド！ ワタクシのも回ってきた……0歳、泣いた。5歳、ここで迷子。そして今日、みなさんに会えた！', anim: 'react.sad', route: 'S6.route.show',
      fx: [qa, { type: 'FX', kind: 'notes', at: 'host', delayMs: 800 }],
      after: [{ actor: 'aud7', text: 'まあ、あのときの迷子ちゃん！ 立派になって……', delay: 4200 }] },
    { id: 'S6-E11', s: 'aud8', t: 'host', cat: 'CHAIN', title: '答え：瞬間移動', say: '瞬間移動、お見せしましょう！ ワン、ツー……ハテナッ！', anim: 'react.transform', route: 'S6.route.show',
      fx: [qa, { type: 'FX', kind: 'smoke', at: 'host', delayMs: 900 }, { type: 'ACTOR_MOVE', actorId: 'host', to: [2320, 1680], speed: 900, delayMs: 900, wander: 0 }, { type: 'FX', kind: 'smoke', at: 'host', delayMs: 2400 },
        { type: 'ACTOR_MOVE', actorId: 'host', to: [2950, 1680], speed: 120, delayMs: 5000, wander: 160 }],
      after: [{ actor: 'aud8', text: 'いま、ふつうに走ってたよね！？', delay: 3000 }] },

    // ── カツラの紳士の息子：乗り物にキャッチ反応 ──
    { id: 'S6-E12', s: 'coaster', t: 'sota', cat: 'FLAVOR', title: 'ソウタ、コースターに大興奮', say: 'うわー！ 一回転してる！ パパ、もう一回乗ろう！', anim: 'react.happy', route: 'S6.route.wig',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'bucho', text: 'も、もう一回！？ パパの頭がもたん……', delayMs: 2400 }] },
    { id: 'S6-E13', s: 'ship', t: 'sota', cat: 'FLAVOR', title: 'ソウタ、海賊船ごっこ', say: 'ヨーソロー！ オレは船長だ！ 宝はどこだー！', anim: 'react.run', route: 'S6.route.wig',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'sota', to: [1550, 1260], speed: 200 }, { type: 'ACTOR_MOVE', actorId: 'sota', to: [1250, 1220], speed: 160, delayMs: 2600 }] },
    { id: 'S6-E14', s: 'drop', t: 'sota', cat: 'CHAIN', title: 'ソウタ、スカイドロップへ一直線', say: 'あれ乗る！ ひとりで乗れるもん！', anim: 'react.run', route: 'S6.route.wig',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'sota', to: [3420, 1200], speed: 420, wander: 60 }, { type: 'ACTOR_SPEECH', actorId: 'bucho', text: 'ソウタ！？ まちなさーい！ ……足が、足がもう……', delayMs: 2000 },
        { type: 'ACTOR_SPEECH', actorId: 'sota', text: 'ぎゃああああ……たのしーー！', delayMs: 15000 }],
      after: [{ actor: 'ritsuko', text: 'あら、ボクひとり？ ……うちの子も、どこかでひとりなのかしら', delay: 16500 }] },

    // ── 迷子のミナ ──
    { id: 'S6-E15', s: 'mina', t: 'balloon', cat: 'CHAIN', title: 'ミナ、風船をもらう', say: 'ほれ、泣くのはおしまい。一個おまけじゃ', anim: 'react.happy', route: 'S6.route.mina',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'mina', to: [1780, 2660], speed: 120 }, { type: 'ACTOR_SET_STATE', actorId: 'mina', state: 'HAPPY', delayMs: 1600 }, { type: 'ACTOR_SPEECH', actorId: 'mina', text: 'わあ……ありがと。もっとあったら、空からパパ見えるかな', delayMs: 3000 }],
      after: [{ actor: 'balloon', text: 'もっと……？ ほっほっほ、全部持っていくかい？', delay: 6000 }] },
    { id: 'S6-E16', s: 'mina', t: 'balloon', cat: 'BRANCH', requires: ['S6-E15'], title: 'ミナ、風船の束で大空へ', say: 'よし、ぜんぶ持っていけ！ ……あ、あれれ、浮いとる！？', anim: 'react.surprised', route: 'S6.route.mina', focus: true,
      fx: [{ type: 'SPAWN_OBJECT', objectId: 'balloonbunch' }, { type: 'ACTOR_MOVE', actorId: 'mina', pathId: 'minaFly', wander: 0, delayMs: 800 }, { type: 'OBJECT_MOVE', objectId: 'balloonbunch', pathId: 'minaFlyB', delayMs: 800 },
        { type: 'ACTOR_SPEECH', actorId: 'mina', text: 'わああ、とんでるー！ パパー！ どこー！', delayMs: 2500 },
        { type: 'ACTOR_SPEECH', actorId: 'papa', text: 'ん？ 空に……ミナ！？ ミナーーー！', delayMs: 9000 }, { type: 'ACTOR_MOVE', actorId: 'papa', to: [5760, 2790], speed: 300, wander: 30, delayMs: 9000 },
        { type: 'FX', kind: 'hearts', at: 'papa', delayMs: 16500 }, { type: 'HIDE_OBJECT', objectId: 'balloonbunch', delayMs: 17000 }, { type: 'ACTOR_SET_STATE', actorId: 'papa', state: 'HAPPY', delayMs: 16500 }],
      after: [{ actor: 'mina', text: 'パパ、見つけたー！', delay: 17000 }, { actor: 'papa', text: 'もう二度と手をはなさないからな……！', delay: 19000 }] },
    { id: 'S6-E17', s: 'mina', t: 'info', cat: 'BRANCH', title: 'ミナ、案内所で保護される', say: '（案内所）迷子のお嬢ちゃんね。お名前は？ ミナちゃん。すぐ呼び出すからね', anim: 'react.think', route: 'S6.route.mina',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'mina', to: [1100, 2600], speed: 140, wander: 20 }, { type: 'ACTOR_MOVE', actorId: 'infostaff', to: [960, 2590], speed: 120, wander: 20 }, { type: 'SET_FLAG', id: 'mina.atInfo', value: true }, { type: 'PLAY_SOUND', soundId: 'bell', delayMs: 1500 }],
      after: [{ actor: 'infostaff', text: '〽迷子のお知らせです。黄色い服のミナちゃん……（でもスピーカーの声、届くかしら）', delay: 3200 }] },
    { id: 'S6-E18', s: 'pa', t: 'papa', cat: 'PROGRESSION', requires: ['S6-E17'], title: '迷子放送がパパに届く', say: '〽黄色い服のミナちゃんが案内所で……ミナだ！ いま行くぞー！', anim: 'react.run', route: 'S6.route.mina',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'papa', to: [1180, 2610], speed: 420, wander: 30 }, { type: 'ACTOR_SET_STATE', actorId: 'papa', state: 'RUNNING' },
        { type: 'ACTOR_SET_STATE', actorId: 'papa', state: 'HAPPY', delayMs: 14000 }, { type: 'FX', kind: 'hearts', at: 'mina', delayMs: 14000 }, { type: 'PLAY_SOUND', soundId: 'success', delayMs: 14000 }],
      after: [{ actor: 'mina', text: 'パパーーー！', delay: 14000 }, { actor: 'infostaff', text: 'よかったね、ミナちゃん', delay: 16000 }] },
    { id: 'S6-E19', s: 'rabbit', t: 'mina', cat: 'FLAVOR', title: 'ピョンタがミナをはげます', say: 'わあ、ウサギさん！ ……えへへ、ちょっと元気出た', anim: 'react.happy', route: 'S6.route.mina',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'rabbit', text: '（ピョンピョン！ 両手で大きなハート）', delayMs: 1600 }, { type: 'FX', kind: 'hearts', at: 'mina', delayMs: 1800 }] },
    { id: 'S6-E20', s: 'wig', t: 'mina', cat: 'FLAVOR', title: 'ミナ、カツラで大笑い', say: 'なにこれ、毛虫？ あははは！ もじゃもじゃ〜！', anim: 'react.laugh', route: 'S6.route.mina',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'bucho', text: 'け、毛虫……', delayMs: 2400 }] },
    { id: 'S6-E21', s: 'squirrel', t: 'mina', cat: 'FLAVOR', blocksIfCompleted: ['S6-E16', 'S6-E17'], title: 'ミナ、トイレに駆けこむ', say: 'リスさん、あっちをさしてる……あっ！ ミナ、トイレ行きたかったんだ！', anim: 'react.run', route: 'S6.route.mina',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'mina', to: [1150, 1830], speed: 260, wander: 0 }, { type: 'ACTOR_HIDE', actorId: 'mina', delayMs: 14000 }, { type: 'ACTOR_SHOW', actorId: 'mina', delayMs: 19000 },
        { type: 'ACTOR_MOVE', actorId: 'mina', to: [1900, 2780], speed: 260, wander: 60, delayMs: 19000 }, { type: 'ACTOR_SPEECH', actorId: 'mina', text: 'すっきり！ ……でも、パパはいないまんま', delayMs: 20000 }] },

    // ── カツラ ──
    { id: 'S6-E22', s: 'wig', t: 'bucho', cat: 'PROGRESSION', title: '鷹野さん、カツラを取りもどす', say: 'わ、わたしの……いや、知らない毛だ！ ……（さっとかぶる）うむ、これでカンペキ', anim: 'react.sparkle', route: 'S6.route.wig',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'wig', delayMs: 900 }, { type: 'ACTOR_APPEARANCE', actorId: 'bucho', look: { hair: 'short', hairColor: '#2a2a2a' }, delayMs: 1000 }, { type: 'ACTOR_SET_STATE', actorId: 'bucho', state: 'HAPPY', delayMs: 1000 }],
      after: [{ actor: 'sota', text: 'パパ、いつの間に髪生えたの？', delay: 3000 }, { actor: 'bucho', text: '……ソウタ、それは家に帰ってから話そう', delay: 5000 }] },

    // ── いたずら小僧と空き缶 ──
    { id: 'S6-E23', s: 'can4', t: 'cleaner', cat: 'PROGRESSION', requires: ['S6-E24'], cond: [cnt('S6-can1', 1), cnt('S6-can2', 1), cnt('S6-can3', 1)], title: '4つの缶、一斉清掃', say: 'よぉし、これで全部わかった！ ピカ山流・一斉清掃、いざ！', anim: 'react.spin', route: 'S6.route.clean', focus: true,
      fx: [{ type: 'FX', kind: 'stars', at: 'can1', delayMs: 800 }, { type: 'HIDE_OBJECT', objectId: 'can1', delayMs: 1000 }, { type: 'FX', kind: 'stars', at: 'can2', delayMs: 1400 }, { type: 'HIDE_OBJECT', objectId: 'can2', delayMs: 1600 },
        { type: 'FX', kind: 'stars', at: 'can3', delayMs: 2000 }, { type: 'HIDE_OBJECT', objectId: 'can3', delayMs: 2200 }, { type: 'FX', kind: 'stars', at: 'can4', delayMs: 2600 }, { type: 'HIDE_OBJECT', objectId: 'can4', delayMs: 2800 },
        { type: 'PLAY_SOUND', soundId: 'success', delayMs: 3000 }, { type: 'ACTOR_SET_STATE', actorId: 'cleaner', state: 'HAPPY', delayMs: 3000 }],
      after: [{ actor: 'prank', text: 'す、すげえ……ほうき一本で……', delay: 4000 }] },
    { id: 'S6-E24', s: 'juice', t: 'prank', cat: 'CHAIN', title: 'ケン坊、ジュースを一気飲み', say: 'うっひょー、つめてえ！ ……ゴクゴクゴク、プハーッ！ ポイッ！', anim: 'react.drink', route: 'S6.route.clean',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'prank', to: [2960, 2540], speed: 260 }, { type: 'SPAWN_OBJECT', objectId: 'can4', delayMs: 2600 }, { type: 'PLAY_SOUND', soundId: 'pop', delayMs: 2600 }, { type: 'ACTOR_MOVE', actorId: 'prank', to: [3000, 2660], speed: 200, wander: 180, delayMs: 3000 }],
      after: [{ actor: 'cleaner', text: 'いま、カランって音がしたねえ……', delay: 3600 }] },
    { id: 'S6-E25', s: 'prank', t: 'cleaner', cat: 'CHAIN', requires: ['S6-E24'], title: 'ケン坊、ポイ捨てを叱られる', say: 'こら、ボウズ！ 缶は投げるもんじゃない、捨てるもんだ！', anim: 'react.angry', route: 'S6.route.clean',
      fx: [{ type: 'ACTOR_SET_STATE', actorId: 'prank', state: 'EMBARRASSED', delayMs: 1500 }, { type: 'ACTOR_SPEECH', actorId: 'prank', text: 'ご、ごめんなさい……。ボク、どっかおかしいのかな……', delayMs: 2500 }],
      after: [{ actor: 'toolman', text: 'ん？ どこか調子が悪いのかい？', delay: 5000 }] },
    { id: 'S6-E26', s: 'geta', t: 'prank', cat: 'FLAVOR', title: 'ケン坊、下駄でカランコロン', say: 'カランコロン！ うわ、走れねえ！ でもいい音！', anim: 'react.laugh', route: 'S6.route.clean',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'geta' }, { type: 'ACTOR_APPEARANCE', actorId: 'prank', look: { pants: '#3a3a3a' } }, { type: 'ACTOR_MOVE', actorId: 'prank', to: [5300, 2250], speed: 40, wander: 60 }, { type: 'PLAY_SOUND', soundId: 'hit', delayMs: 600 }] },
    { id: 'S6-E27', s: 'prank', t: 'toolman', cat: 'FLAVOR', title: 'ケン坊、工具おじさんに「修理」される', say: 'ガタつく子だねえ。どれ、ネジをキュッと……はい、修理完了！', anim: 'react.think', route: 'S6.route.clean',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'prank', to: [5560, 2010], speed: 160, wander: 20 }, { type: 'FX', kind: 'sparkle', at: 'prank', delayMs: 2200 },
        { type: 'ACTOR_SPEECH', actorId: 'prank', text: 'ピ、ピピッ。ボクハ、イイコ、ニ、ナリマシタ', delayMs: 3200 }, { type: 'ACTOR_APPEARANCE', actorId: 'prank', look: { acc: ['helmet'] }, delayMs: 2200 }, { type: 'ACTOR_SET_STATE', actorId: 'prank', state: 'RESOLVED', delayMs: 3200 }] },

    // ── デート ──
    { id: 'S6-E28', s: 'camvend', t: 'kare', cat: 'CHAIN', title: 'ユウスケ、使い切りカメラを買う', say: 'カメラ……そうだ、カメラを忘れてたんだ！ ここで買えるじゃないか！', anim: 'react.surprised', route: 'S6.route.date',
      fx: [{ type: 'ACTOR_APPEARANCE', actorId: 'kare', look: { acc: ['bag', 'camera'] }, delayMs: 1200 }, { type: 'PLAY_SOUND', soundId: 'pop', delayMs: 1200 }, { type: 'ACTOR_SPEECH', actorId: 'kano', text: 'え、カメラ忘れてたの？ 言ってよ〜', delayMs: 2800 }],
      after: [{ actor: 'kare', text: 'でも、ふたりで写るにはだれかに頼まないと……', delay: 5200 }] },
    { id: 'S6-E29', s: 'lady1', t: 'kare', cat: 'CHAIN', requires: ['S6-E28'], title: '旅の二人組がカップル写真を撮る', say: 'え、撮ってくれるんですか！？ お願いします！', anim: 'react.photo', route: 'S6.route.date',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'lady1', to: [2600, 1290], speed: 260 }, { type: 'ACTOR_MOVE', actorId: 'lady2', to: [2540, 1305], speed: 260 }, { type: 'ACTOR_SPEECH', actorId: 'lady1', text: 'はい、もっとくっついて〜！ 3、2、1……', delayMs: 3500 },
        { type: 'FX', kind: 'flash', at: 'kare', delayMs: 5200 }, { type: 'PLAY_SOUND', soundId: 'capture', delayMs: 5200 }, { type: 'FX', kind: 'hearts', at: 'kano', delayMs: 5600 }],
      after: [{ actor: 'lady2', text: 'いいなあ……ハルカ、わたしたちも撮ろ', delay: 7600 }] },
    { id: 'S6-E30', s: 'ritsuko', t: 'kare', cat: 'FLAVOR', requires: ['S6-E28'], title: 'メガネのママがプロ級の一枚を撮る', say: 'あ、撮ってもらえるんですか？ ……え、そんな低い角度から？', anim: 'react.photo', route: 'S6.route.date',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'ritsuko', to: [2470, 1330], speed: 300, wander: 40 }, { type: 'ACTOR_SPEECH', actorId: 'ritsuko', text: 'はい、寝そべって撮るわよ。背景にコースターを入れて……いま！', delayMs: 3800 },
        { type: 'FX', kind: 'flash', at: 'kare', delayMs: 5600 }, { type: 'PLAY_SOUND', soundId: 'capture', delayMs: 5600 }],
      after: [{ actor: 'kano', text: 'すごい、雑誌の表紙みたい！', delay: 7400 }] },
    { id: 'S6-E31', s: 'coaster', t: 'kano', cat: 'BRANCH', title: 'アカリ、コースターを断固拒否', say: 'ムリムリムリ！ あんなの乗ったら魂が出ちゃう！ ……お化け屋敷にしよ？', anim: 'react.scared', route: 'S6.route.date',
      fx: [{ type: 'SET_FLAG', id: 'date.plan', value: 'haunted' }, { type: 'ACTOR_MOVE', actorId: 'kano', to: [4300, 2020], speed: 160, wander: 40, delayMs: 2000 }, { type: 'ACTOR_MOVE', actorId: 'kare', to: [4230, 2020], speed: 160, wander: 40, delayMs: 2200 }],
      after: [{ actor: 'kare', text: '（お化け屋敷のほうが、ぼくはムリなんだけど……）', delay: 3200 }] },
    { id: 'S6-E32', s: 'haunted', t: 'kano', cat: 'BRANCH', title: 'アカリ、お化け屋敷を断固拒否', say: 'ぜっっったいイヤ！ 暗いのも、おどかされるのも！ ……メリーゴーランドならいいよ', anim: 'react.scared', route: 'S6.route.date',
      fx: [{ type: 'SET_FLAG', id: 'date.plan', value: 'carousel' }, { type: 'ACTOR_MOVE', actorId: 'kano', to: [4800, 1225], speed: 160, wander: 40, delayMs: 2000 }, { type: 'ACTOR_MOVE', actorId: 'kare', to: [4880, 1235], speed: 160, wander: 40, delayMs: 2200 }],
      after: [{ actor: 'kare', text: 'ふう、助かった……いや、なんでもない', delay: 3200 }] },
    { id: 'S6-E33', s: 'bijin', t: 'kare', cat: 'FLAVOR', title: 'ユウスケ、謎の美人に見とれる', say: '……はっ！ い、いや、見てないよ？ 観覧車を見てたんだよ？', anim: 'react.embarrassed', route: 'S6.route.date',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'kano', text: 'ふーん。観覧車、あっちだけど？', delayMs: 2400 }, { type: 'ACTOR_SET_STATE', actorId: 'kano', state: 'ANGRY', delayMs: 2400 }, { type: 'ACTOR_SET_STATE', actorId: 'kano', state: 'IDLE', delayMs: 12000 }] },

    // ── 射的とメガネの親子 ──
    { id: 'S6-E34', s: 'sota', t: 'ritsuko', cat: 'CHAIN', requires: ['S6-E14'], title: 'リツコ、うちの子を見なかったか聞く', say: 'あら、さっきの落ちる乗り物の子ね。ねえ、メガネの男の子見なかった？', anim: 'react.think', route: 'S6.route.shoot',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'sota', text: '射的のとこで、ロボットにらんでたよ！', delayMs: 2400 }, { type: 'ACTOR_MOVE', actorId: 'ritsuko', to: [3420, 2720], speed: 180, wander: 80, delayMs: 3400 }],
      after: [{ actor: 'ritsuko', text: 'やっぱり射的ね。あの子、あきらめが悪いから', delay: 4400 }] },
    { id: 'S6-E35', s: 'hero', t: 'takumi', cat: 'FLAVOR', title: 'タクミ、ヒーローの構えで命中', say: 'ヒーローなら……こう構える！ ……当たった！ ロボット、ゲット！', anim: 'react.sparkle', route: 'S6.route.shoot',
      fx: [{ type: 'PLAY_SOUND', soundId: 'hit', delayMs: 600 }, { type: 'FX', kind: 'confetti', at: 'takumi', delayMs: 900 }, { type: 'ACTOR_SPEECH', actorId: 'shooter', text: 'お見事！ 一等、持ってけドロボー！', delayMs: 2200 }] },
    { id: 'S6-E36', s: 'shooter', t: 'takumi', cat: 'FLAVOR', title: 'タクミ、アドバイスで力んで外す', say: '肩の力をぬいて、心をカラッポ……カラッポ……あっ、外れた', anim: 'react.sad', route: 'S6.route.shoot',
      fx: [{ type: 'PLAY_SOUND', soundId: 'whistle', delayMs: 800 }, { type: 'ACTOR_SPEECH', actorId: 'shooter', text: '……カラッポにしすぎたな', delayMs: 2400 }] },
    { id: 'S6-E37', s: 'panel', t: 'takumi', cat: 'PROGRESSION', title: 'タクミ、顔ハメパネルで記念撮影', say: 'これだ！ 今日の記念！ ……ママー、撮ってー！', anim: 'react.photo', route: 'S6.route.shoot',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'takumi', to: [4280, 2550], speed: 220, wander: 0 }, { type: 'OBJECT_APPEARANCE', objectId: 'panel', look: { sign: { text: '🤓 ヒーロー参上', fill: '#ffcf3f', color: '#c0392b', s: 20 } }, delayMs: 2600 },
        { type: 'FX', kind: 'flash', at: 'panel', delayMs: 3200 }, { type: 'PLAY_SOUND', soundId: 'capture', delayMs: 3200 }, { type: 'ACTOR_MOVE', actorId: 'takumi', to: [4180, 2660], speed: 120, wander: 40, delayMs: 6000 }],
      after: [{ actor: 'takumi', text: '一生の宝物にする！', delay: 4200 }] },

    // ── 落とし物 ──
    { id: 'S6-E38', s: 'pa', t: 'hphone', cat: 'FLAVOR', title: 'DJ青年、自分の落とし物に気づく', say: 'ん？ 黒い財布の落とし物……それ、オレのじゃん！', anim: 'react.surprised', route: 'S6.route.misc',
      fx: [{ type: 'ACTOR_APPEARANCE', actorId: 'hphone', look: { acc: ['sunglasses'] } }, { type: 'ACTOR_MOVE', actorId: 'hphone', to: [1250, 2660], speed: 400, wander: 40, delayMs: 1500 }],
      after: [{ actor: 'infostaff', text: 'やっと持ち主さんが！ ……放送、ちゃんと聞いてくださいね', delay: 19000 }] },

    // ── お化け屋敷 ──
    { id: 'S6-E39', s: 'obake', t: 'hstaff', cat: 'CHAIN', title: 'お化けの正体はバイトくん', say: 'あ、それウチのバイト。中身は大学生です。……あれ、じゃあ今入っていったもうひとりは？', anim: 'react.think', route: 'S6.route.monster',
      fx: [{ type: 'ACTOR_SHOW', actorId: 'ghost', delayMs: 3000 }, { type: 'FX', kind: 'smoke', at: 'ghost', delayMs: 3000 }, { type: 'PLAY_SOUND', soundId: 'thunder', delayMs: 3000 }],
      after: [{ actor: 'obake', text: 'お化け役は、今日ボクひとりですけど……？', delay: 4200 }] },
    { id: 'S6-E40', s: 'ghost', t: 'hstaff', cat: 'FLAVOR', requires: ['S6-E39'], title: '本物の幽霊、スタッフ面接に来る', say: 'ほ、ほ、本物ぉぉ！？ ……え、ここで働きたい？ 時給は……', anim: 'react.scared', route: 'S6.route.monster',
      fx: [{ type: 'ACTOR_SET_STATE', actorId: 'hstaff', state: 'SCARED' }, { type: 'FX', kind: 'lightning', at: 'haunted', delayMs: 600 }, { type: 'ACTOR_SPEECH', actorId: 'ghost', text: '……時給は、いらない……お客さんの悲鳴がごちそう……', delayMs: 2800 },
        { type: 'ACTOR_SPEECH', actorId: 'hstaff', text: '採用！！', delayMs: 5200 }, { type: 'ACTOR_SET_STATE', actorId: 'hstaff', state: 'HAPPY', delayMs: 5200 }] },

    // ── ジャグラー ──
    { id: 'S6-E41', s: 'juggler', t: 'gal', cat: 'FLAVOR', title: 'ギャル、ジャグラーにどハマり', say: 'え、ボールの上でお手玉！？ やば！ 神！ 動画撮っていい！？', anim: 'react.love', route: 'S6.route.misc',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'gal', to: [1800, 2000], speed: 200, wander: 30 }, { type: 'ACTOR_SPEECH', actorId: 'juggler', text: 'オレ……やっと見つけてもらえた……！', delayMs: 2400 }, { type: 'FX', kind: 'confetti', at: 'juggler', delayMs: 2400 }] },

    // ── 似顔絵コーナー ──
    { id: 'S6-E42', s: 'jk', t: 'painter', cat: 'FLAVOR', title: '似顔絵：メイク前のキララ', say: 'ワシの筆はウソがつけん。……ほい、メイク前のお顔じゃ', anim: 'react.think', route: 'S6.route.paint',
      fx: [{ type: 'OBJECT_APPEARANCE', objectId: 'canvas', look: { sign: { text: '😐', fill: '#fff', color: '#333', s: 60 } }, delayMs: 1500 }, { type: 'ACTOR_SPEECH', actorId: 'jk', text: 'ちょ、国家機密ーーっ！！', delayMs: 2800 }, { type: 'ACTOR_SET_STATE', actorId: 'jk', state: 'EMBARRASSED', delayMs: 2800 }] },
    { id: 'S6-E43', s: 'kurofuku', t: 'painter', cat: 'FLAVOR', title: '似顔絵：変身後の黒服', say: 'ふむ、この男の真の姿は……ほれ、変身ヒーローじゃ！', anim: 'react.sparkle', route: 'S6.route.paint',
      fx: [{ type: 'OBJECT_APPEARANCE', objectId: 'canvas', look: { sign: { text: '🦸‍♂️', fill: '#fff', color: '#333', s: 60 } }, delayMs: 1500 }, { type: 'ACTOR_SPEECH', actorId: 'kurofuku', text: '……なぜバレた。（休日はヒーローショーの中の人なのだ）', delayMs: 2800 }] },
    { id: 'S6-E44', s: 'bucho', t: 'painter', cat: 'FLAVOR', title: '似顔絵：おめかし前の鷹野さん', say: '見えたまま描くぞ。……つるりん、っと', anim: 'react.laugh', route: 'S6.route.paint',
      fx: [{ type: 'OBJECT_APPEARANCE', objectId: 'canvas', look: { sign: { text: '👨‍🦲', fill: '#fff', color: '#333', s: 60 } }, delayMs: 1500 }, { type: 'ACTOR_SPEECH', actorId: 'bucho', text: 'な、なぜ準備前を……！ 描きなおしてくれ！', delayMs: 2800 }] },
    { id: 'S6-E45', s: 'rabbit', t: 'painter', cat: 'FLAVOR', title: '似顔絵：ピョンタの中の人', say: 'ウサギの奥に、汗だくの好青年が見えるのう', anim: 'react.think', route: 'S6.route.paint',
      fx: [{ type: 'OBJECT_APPEARANCE', objectId: 'canvas', look: { sign: { text: '🥵', fill: '#fff', color: '#333', s: 60 } }, delayMs: 1500 }, { type: 'ACTOR_SPEECH', actorId: 'rabbit', text: '（シーッ！ 夢をこわさないで！）', delayMs: 2600 }] },
    { id: 'S6-E46', s: 'squirrel', t: 'painter', cat: 'FLAVOR', title: '似顔絵：動きまわるクルミン', say: 'じっとしとれ！ ……ええい、しっぽが十本になってしもうた', anim: 'react.angry', route: 'S6.route.paint',
      fx: [{ type: 'OBJECT_APPEARANCE', objectId: 'canvas', look: { sign: { text: '🌀🐿️🌀', fill: '#fff', color: '#333', s: 34 } }, delayMs: 1500 }, { type: 'ACTOR_SPEECH', actorId: 'squirrel', text: '（くるくる回ってポーズ）', delayMs: 2600 }] },
    { id: 'S6-E47', s: 'idol', t: 'painter', cat: 'FLAVOR', title: '似顔絵：正体不明の女性', say: '帽子、サングラス、マスク……描けるのは小物だけじゃ。じゃが、オーラはまぶしいのう', anim: 'react.think', route: 'S6.route.paint',
      fx: [{ type: 'OBJECT_APPEARANCE', objectId: 'canvas', look: { sign: { text: '👒🕶️😷✨', fill: '#fff', color: '#333', s: 28 } }, delayMs: 1500 }, { type: 'ACTOR_SPEECH', actorId: 'idol', text: 'ふふ、上手。……サインはナイショね', delayMs: 3000 }, { type: 'FX', kind: 'sparkle', at: 'idol', delayMs: 3000 }] },

    // ── 方言カップル ──
    { id: 'S6-E48', s: 'osaF', t: 'osaM', cat: 'FLAVOR', title: '大阪のふたり', say: '足パンパンなんやろ？ ほな、そこ座っとき。熱々のたこ焼き、買うてきたるわ！', anim: 'react.happy', route: 'S6.route.dialect',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'osaM', to: [5140, 1820], speed: 200, wander: 20 }, { type: 'ACTOR_SPEECH', actorId: 'osaF', text: 'もう、そういうとこやで。……好きなん', delayMs: 2600 }, { type: 'FX', kind: 'hearts', at: 'osaF', delayMs: 2600 }, { type: 'ACTOR_MOVE', actorId: 'osaM', to: [5020, 2022], speed: 160, wander: 40, delayMs: 8000 }] },
    { id: 'S6-E49', s: 'tohF', t: 'tohM', cat: 'FLAVOR', title: '東北のふたり', say: '手っこ冷えだべ？ ほれ、オラのポケットさ入れでけろ。ぬぐだまるべ', anim: 'react.love', route: 'S6.route.dialect',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'tohF', text: 'ほんとだ、ぬぐいなや……', delayMs: 2600 }, { type: 'FX', kind: 'hearts', at: 'tohF', delayMs: 2600 }] },
    { id: 'S6-E50', s: 'hakF', t: 'hakM', cat: 'FLAVOR', title: '博多のふたり', say: 'こわかったとや？ よかよか、俺がずーっと横におるけん。なんも心配いらんばい', anim: 'react.love', route: 'S6.route.dialect',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'hakF', text: 'もう……そげん言われたら、また入りたくなるやん', delayMs: 2800 }, { type: 'FX', kind: 'hearts', at: 'hakF', delayMs: 2800 }] },
    // ── 登山家 ──
    { id: 'S6-E51', s: 'mountain', t: 'climber', cat: 'FLAVOR', title: '登山家、作り物の山にほれこむ', say: 'なんと見事な稜線……！ 作り物とは思えん！ 呼ばれておる、山がわしを呼んでおる！', anim: 'react.sparkle', route: 'S6.route.misc',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'climber', to: [5980, 450], speed: 360, wander: 40 }, { type: 'ACTOR_SPEECH', actorId: 'climber', text: 'ヤッホーーー！！', delayMs: 18000 }, { type: 'PLAY_SOUND', soundId: 'whistle', delayMs: 18000 }],
      after: [{ actor: 'painter', text: '……あの登山家、描きがいがありそうじゃのう', delay: 19500 }] },

    // ── フィナーレ ──
    { id: 'S6-E52', s: 'aud5', t: 'host', cat: 'PROGRESSION', requires: ['S6-E08'], cond: [cnt(QA, 5)], title: '答え：らしさとは、おじぎ', say: 'わたしたちらしさ？ それは……（ペコリ）すみません（ペコリ）おそれいります（ペコリ）……おじぎが止まらないことです！', anim: 'react.laugh', route: 'S6.route.show', focus: true,
      fx: [{ type: 'ACTOR_ANIMATION', actorId: 'host', animationId: 'react.embarrassed', delayMs: 2500 }, { type: 'ACTOR_SPEECH', actorId: 'aud1', text: '（つられてペコリ）', delayMs: 3000 }, { type: 'ACTOR_SPEECH', actorId: 'aud6', text: '（つられてペコリ）', delayMs: 3400 }, { type: 'PLAY_SOUND', soundId: 'laugh', delayMs: 3400 }],
      after: [{ actor: 'aud5', text: 'ふふっ。……じゃあ最後に、いちばん聞きたかったこと、聞いてもいいかな', delay: 5600 }, { actor: 'host', text: 'それはぜひ、園内のみなさんが笑顔になってから！', delay: 8200 }] },
    { id: 'S6-E53', s: 'aud5', t: 'host', cat: 'TERMINAL', requires: ['S6-E52'], cond: [done('S6-E22'), done('S6-E37'), { anyEventDone: ['S6-E16', 'S6-E18'] }, { anyEventDone: ['S6-E29', 'S6-E30'] }],
      title: 'さよなら、またいつか！ ハテナランド大フィナーレ', say: '楽しい時間は、なぜ終わるのか？ ……終わるからこそ、また会いたくなるんです！ さあ園内のみなさん、ごいっしょに！ さようなら、そしてまたいつか！', anim: 'react.terminal', route: 'S6.route.end',
      fx: [
        { type: 'CAMERA_FOCUS', x: 2950, y: 1600, zoom: 0.8 },
        { type: 'PLAY_SOUND', soundId: 'fanfare', delayMs: 500 }, { type: 'FX', kind: 'confetti', at: 'host', delayMs: 600 },
        { type: 'SPAWN_OBJECT', objectId: 'rainbow', delayMs: 600 },
        { type: 'FX', kind: 'eruption', x: 2350, y: 1200, delayMs: 1200 }, { type: 'FX', kind: 'eruption', x: 3550, y: 1200, delayMs: 1500 }, { type: 'PLAY_SOUND', soundId: 'boom', delayMs: 1200 },
        { type: 'ACTOR_MOVE', actorId: 'rabbit', to: [2400, 1700], speed: 600, wander: 30, delayMs: 800 }, { type: 'ACTOR_MOVE', actorId: 'squirrel', to: [3500, 1700], speed: 600, wander: 30, delayMs: 800 },
        { type: 'ACTOR_MOVE', actorId: 'mina', to: [2700, 1710], speed: 600, wander: 10, delayMs: 800 }, { type: 'ACTOR_MOVE', actorId: 'papa', to: [2770, 1715], speed: 600, wander: 10, delayMs: 800 },
        { type: 'ACTOR_MOVE', actorId: 'bucho', to: [3150, 1715], speed: 600, wander: 10, delayMs: 800 }, { type: 'ACTOR_MOVE', actorId: 'sota', to: [3215, 1710], speed: 600, wander: 10, delayMs: 800 },
        { type: 'ACTOR_MOVE', actorId: 'takumi', to: [2560, 1715], speed: 600, wander: 10, delayMs: 800 }, { type: 'ACTOR_MOVE', actorId: 'kare', to: [3330, 1715], speed: 600, wander: 10, delayMs: 800 }, { type: 'ACTOR_MOVE', actorId: 'kano', to: [3395, 1715], speed: 600, wander: 10, delayMs: 800 },
        { type: 'ACTOR_SPEECH', actorId: 'mina', text: 'またくるねー！', delayMs: 2200 }, { type: 'ACTOR_SPEECH', actorId: 'bucho', text: '（カツラを高々と振って）さようならー！', delayMs: 2800 },
        { type: 'ACTOR_SPEECH', actorId: 'takumi', text: 'ヒーローは、また来る！', delayMs: 3400 }, { type: 'ACTOR_SPEECH', actorId: 'kano', text: 'また、ふたりで来ようね', delayMs: 4000 },
        { type: 'ACTOR_SPEECH', actorId: 'coaster', text: 'キャーーー！（いい意味で）', delayMs: 4400 }, { type: 'ACTOR_SPEECH', actorId: 'aud5', text: '……うん。また、会いたくなっちゃった', delayMs: 5000 },
        { type: 'FX', kind: 'stars', at: 'rainbow', delayMs: 4600 }, { type: 'FX', kind: 'confetti', at: 'aud5', delayMs: 5000 }, { type: 'ACTOR_SET_STATE', actorId: 'host', state: 'HAPPY', delayMs: 5000 },
        { type: 'WAIT', durationMs: 5600 },
      ] },
  ],
};
