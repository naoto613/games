// ステージ5：駅（52 イベント）。登場人物・台詞はすべてオリジナル。
// 左から 駅前広場（x0〜2500）→ 駅コンコース（x2500〜5600）→ 改札 → ホーム（x5600〜10000、頭端式の終着駅）。
// 列車は右端から入ってきて停まり、また右へ出ていく。時間そのものがギミック（timeline）。
const done = id => ({ eventDone: id });
const notDone = id => ({ eventNotDone: id });
const vis = id => ({ objectVisible: id });
const notVis = id => ({ not: { objectVisible: id } });

// ── 背景の部品を手早く並べるための小道具 ──
const bench = (x, y) => [
  { t: 'rect', x, y, w: 200, h: 18, fill: '#7a5a3a', r: 4 },
  { t: 'rect', x: x + 14, y: y + 18, w: 12, h: 30, fill: '#555' },
  { t: 'rect', x: x + 174, y: y + 18, w: 12, h: 30, fill: '#555' },
];
const pillar = (x, y0, y1, fill = '#9a9a9a') => ({ t: 'rect', x, y: y0, w: 26, h: y1 - y0, fill });
const gate = (x, y) => [
  { t: 'rect', x, y, w: 70, h: 110, fill: '#d9dde3', stroke: '#8a95a5', lw: 3, r: 6 },
  { t: 'rect', x: x + 8, y: y + 10, w: 54, h: 16, fill: '#3a8a4a' },
  { t: 'text', text: 'IC', x: x + 35, y: y + 60, s: 18, fill: '#2a5aa8', bold: true },
];
const platformSet = (y, h, num) => [
  { t: 'rect', x: 5600, y, w: 4400, h, fill: '#cbc4b6' },
  { t: 'stripes', x: 5600, y, w: 4400, h, dir: 'v', n: 22, c1: 'rgba(0,0,0,0)', c2: 'rgba(80,70,50,.06)' },
  { t: 'rect', x: 5600, y: y + 14, w: 4400, h: 12, fill: '#f2cf2e' },
  { t: 'rect', x: 5600, y: y + h - 26, w: 4400, h: 12, fill: '#f2cf2e' },
  { t: 'sign', x: 6400, y: y + 40, w: 150, h: 46, text: num, fill: '#1d4f8f', color: '#fff', s: 22 },
];
const trackBed = (y, h) => [
  { t: 'rect', x: 5600, y, w: 4400, h, fill: '#7f776d' },
  { t: 'stripes', x: 5600, y, w: 4400, h, dir: 'v', n: 60, c1: 'rgba(0,0,0,0)', c2: 'rgba(40,30,20,.18)' },
];

const scenery = [
  // ── 空と遠景 ──
  { t: 'rect', x: 0, y: 0, w: 10000, h: 820, fill: '#bfe2f4' },
  { t: 'ellipse', x: 900, y: 140, rx: 160, ry: 46, fill: '#fff' }, { t: 'ellipse', x: 1050, y: 120, rx: 110, ry: 40, fill: '#fff' },
  { t: 'ellipse', x: 7200, y: 120, rx: 180, ry: 50, fill: '#fff' }, { t: 'ellipse', x: 9300, y: 180, rx: 140, ry: 40, fill: '#fff' },
  { t: 'emoji', e: '☀️', x: 300, y: 110, s: 90 },
  { t: 'emoji', e: '🏙️', x: 8600, y: 300, s: 160 }, { t: 'emoji', e: '🗼', x: 9500, y: 260, s: 140 },

  // ── 駅前広場（x0〜2500） ──
  { t: 'building', x: 40, y: 820, w: 520, h: 430, fill: '#ece6d8', roof: '#3a5a8a', sign: '交番 KOBAN', signFill: '#1b3a7a', signColor: '#fff', door: true, windows: true },
  { t: 'emoji', e: '🚨', x: 300, y: 360, s: 50 },
  { t: 'building', x: 620, y: 820, w: 520, h: 660, fill: '#c7cdd6', roof: '#8a8f99', sign: 'ひなた台ビル', windows: true },
  { t: 'building', x: 1170, y: 820, w: 300, h: 440, fill: '#f0d9b5', roof: '#a0522d', sign: '喫茶 ポッポ', awning: '#c0392b', door: true },
  { t: 'building', x: 1500, y: 820, w: 400, h: 380, fill: '#d8e4d0', roof: '#5a7a4a', sign: '公衆トイレ', signFill: '#2e6b3a', signColor: '#fff' },
  { t: 'building', x: 1930, y: 820, w: 420, h: 600, fill: '#e2d6c6', roof: '#7a6a5a', sign: 'ホテル', windows: true },
  { t: 'rect', x: 0, y: 820, w: 2500, h: 1480, fill: '#d4cbbc' },
  { t: 'stripes', x: 0, y: 820, w: 2500, h: 1480, dir: 'v', n: 25, c1: 'rgba(0,0,0,0)', c2: 'rgba(90,70,40,.07)' },
  { t: 'stripes', x: 0, y: 820, w: 2500, h: 1480, dir: 'h', n: 15, c1: 'rgba(0,0,0,0)', c2: 'rgba(90,70,40,.05)' },
  { t: 'road', x: 0, y: 2150, w: 2500, h: 150, fill: '#555b63' },
  { t: 'emoji', e: '🚕', x: 500, y: 2200, s: 110 }, { t: 'emoji', e: '🚌', x: 1500, y: 2195, s: 130 },
  { t: 'sign', x: 760, y: 900, w: 120, h: 50, text: 'バス停', fill: '#2a7a3a', color: '#fff', s: 20 },
  { t: 'rect', x: 815, y: 950, w: 10, h: 120, fill: '#555' },
  { t: 'emoji', e: '🌳', x: 120, y: 1350, s: 150 }, { t: 'emoji', e: '🌳', x: 2350, y: 2000, s: 140 },
  { t: 'emoji', e: '🌷', x: 900, y: 1960, s: 50 }, { t: 'emoji', e: '🌷', x: 960, y: 1970, s: 46 }, { t: 'emoji', e: '🌼', x: 1020, y: 1965, s: 46 },
  { t: 'ellipse', x: 960, y: 1990, rx: 110, ry: 30, fill: '#6a8a4a' },
  { t: 'emoji', e: '⛲', x: 1250, y: 1450, s: 150 },
  ...bench(1880, 1640), ...bench(500, 1700),
  { t: 'emoji', e: '🚲', x: 1900, y: 1300, s: 70 }, { t: 'emoji', e: '🚲', x: 1980, y: 1310, s: 70 },
  { t: 'emoji', e: '🗑️', x: 2280, y: 1550, s: 50 },
  { t: 'text', text: '← バスのりば', x: 700, y: 2120, s: 26, fill: '#fff', bold: true },

  // ── 駅舎の正面 ──
  { t: 'rect', x: 2420, y: 0, w: 100, h: 820, fill: '#8a7a68' },
  { t: 'sign', x: 2160, y: 60, w: 620, h: 110, text: 'ひなた台駅  HINATADAI STA.', fill: '#203a5a', color: '#fff', s: 40 },
  { t: 'emoji', e: '🕰️', x: 2470, y: 260, s: 90 },

  // ── コンコース（x2500〜5600） ──
  { t: 'rect', x: 2520, y: 180, w: 3080, h: 640, fill: '#ece5d6' },
  { t: 'rect', x: 2520, y: 520, w: 3080, h: 36, fill: '#9a8a74' },
  { t: 'rect', x: 2520, y: 790, w: 3080, h: 30, fill: '#b8a88f' },
  { t: 'rect', x: 2520, y: 820, w: 3080, h: 1480, fill: '#e1dacb' },
  { t: 'stripes', x: 2520, y: 820, w: 3080, h: 1480, dir: 'v', n: 30, c1: 'rgba(0,0,0,0)', c2: 'rgba(60,60,80,.06)' },
  { t: 'stripes', x: 2520, y: 820, w: 3080, h: 1480, dir: 'h', n: 18, c1: 'rgba(0,0,0,0)', c2: 'rgba(60,60,80,.05)' },
  { t: 'rect', x: 2520, y: 1380, w: 3080, h: 30, fill: '#e8d36a' },
  { t: 'sign', x: 2800, y: 250, w: 360, h: 70, text: '🚻 トイレ  ← 出口', fill: '#1d1d1d', color: '#ffd84a', s: 28 },
  { t: 'sign', x: 4700, y: 250, w: 420, h: 70, text: '改札 →  1・2・3番線', fill: '#1d1d1d', color: '#ffd84a', s: 28 },
  { t: 'sign', x: 3500, y: 250, w: 420, h: 70, text: 'のりかえ  ひなた線', fill: '#1d1d1d', color: '#9fe0ff', s: 28 },
  // 券売機
  { t: 'rect', x: 2950, y: 820, w: 320, h: 16, fill: '#666' },
  { t: 'sign', x: 2950, y: 560, w: 320, h: 60, text: 'きっぷうりば', fill: '#2a4a7a', color: '#fff', s: 24 },
  { t: 'sign', x: 2950, y: 630, w: 320, h: 120, text: '運賃表  140 / 170 / 210', fill: '#fff', color: '#333', s: 18 },
  // ベンチ
  ...bench(4330, 1500), ...bench(3500, 1490), ...bench(2700, 1900),
  { t: 'emoji', e: '🪴', x: 2600, y: 1350, s: 80 }, { t: 'emoji', e: '🪴', x: 5420, y: 960, s: 70 },
  { t: 'emoji', e: '🗑️', x: 4720, y: 1470, s: 46 }, { t: 'emoji', e: '♻️', x: 4760, y: 1470, s: 36 },
  // バンドのスペース
  { t: 'rect', x: 3150, y: 1990, w: 360, h: 150, fill: '#b06a5a', r: 14 },
  { t: 'emoji', e: '🥁', x: 3420, y: 2040, s: 60 }, { t: 'emoji', e: '🎸', x: 3200, y: 2020, s: 50 }, { t: 'emoji', e: '🎤', x: 3290, y: 1990, s: 40 },
  { t: 'sign', x: 3160, y: 1930, w: 340, h: 46, text: '路上ライブ「終電ズ」', fill: '#222', color: '#ff7ab8', s: 22 },
  // 壁のポスター（飾り）
  { t: 'sign', x: 5300, y: 600, w: 130, h: 170, text: 'スマホ歩き ×', fill: '#fff6d8', color: '#c33', s: 18 },
  { t: 'sign', x: 3260, y: 590, w: 120, h: 170, text: '温泉へ行こう', fill: '#d8eef8', color: '#246', s: 18 },
  { t: 'emoji', e: '♨️', x: 3320, y: 700, s: 40 },
  // 改札
  { t: 'rect', x: 5460, y: 820, w: 160, h: 1480, fill: '#cfd3d8' },
  ...gate(5500, 1000), ...gate(5500, 1300), ...gate(5500, 1600), ...gate(5500, 1900), ...gate(5500, 2160),
  { t: 'sign', x: 5440, y: 830, w: 200, h: 50, text: '改札口', fill: '#1b3a7a', color: '#fff', s: 22 },

  // ── ホーム（x5600〜10000） ──
  // 屋根
  { t: 'poly', pts: [5600, 300, 10000, 300, 10000, 360, 5600, 360], fill: '#7a8a96' },
  { t: 'poly', pts: [5600, 360, 10000, 360, 10000, 380, 5600, 380], fill: '#5a6a76' },
  pillar(6000, 380, 830), pillar(7000, 380, 830), pillar(8000, 380, 830), pillar(9000, 380, 830),
  { t: 'emoji', e: '🕰️', x: 7500, y: 470, s: 60 },
  { t: 'sign', x: 6100, y: 420, w: 300, h: 60, text: '1番線  普通 みなと行', fill: '#1d1d1d', color: '#7cff7c', s: 20 },
  { t: 'sign', x: 8300, y: 420, w: 300, h: 60, text: '発車  10:42  10:47', fill: '#1d1d1d', color: '#ffb84a', s: 20 },
  // 1番線の線路
  ...trackBed(740, 90),
  { t: 'rail', x: 5880, y: 800, w: 4120 },
  // 島式ホーム（1・2番線）
  ...platformSet(830, 590, '1・2番線'),
  // 2番線の線路
  ...trackBed(1420, 90),
  { t: 'rail', x: 5880, y: 1480, w: 4120 },
  // 3番線ホーム（2・3番線）
  ...platformSet(1510, 520, '2・3番線'),
  // 3番線の線路
  ...trackBed(2030, 100),
  { t: 'rail', x: 5880, y: 2075, w: 4120 },
  { t: 'rect', x: 5600, y: 2130, w: 4400, h: 170, fill: '#9aa58a' },
  { t: 'fence', x: 5600, y: 2300, w: 4400, h: 80, fill: '#6a6a6a' },
  // 車止め
  { t: 'rect', x: 5840, y: 740, w: 40, h: 80, fill: '#d33' }, { t: 'rect', x: 5840, y: 1420, w: 40, h: 80, fill: '#d33' }, { t: 'rect', x: 5840, y: 2030, w: 40, h: 90, fill: '#d33' },
  { t: 'stripes', x: 5840, y: 740, w: 40, h: 80, dir: 'h', n: 4, c1: '#d33', c2: '#ffd84a' },
  { t: 'stripes', x: 5840, y: 1420, w: 40, h: 80, dir: 'h', n: 4, c1: '#d33', c2: '#ffd84a' },
  { t: 'stripes', x: 5840, y: 2030, w: 40, h: 90, dir: 'h', n: 4, c1: '#d33', c2: '#ffd84a' },
  // ホームの小物
  ...bench(6600, 1240), ...bench(8600, 1240), ...bench(7600, 1840), ...bench(9300, 1260),
  { t: 'emoji', e: '🥤', x: 6250, y: 1120, s: 70 },
  { t: 'sign', x: 8950, y: 1560, w: 150, h: 46, text: '3番線 →', fill: '#1d4f8f', color: '#fff', s: 20 },
  { t: 'sign', x: 7150, y: 1580, w: 200, h: 50, text: 'ドア位置 🚪 3', fill: '#fff', color: '#c33', s: 18 },
  { t: 'sign', x: 7650, y: 1580, w: 200, h: 50, text: 'ドア位置 🚪 4', fill: '#fff', color: '#c33', s: 18 },
  { t: 'emoji', e: '🧯', x: 9900, y: 1360, s: 40 }, { t: 'emoji', e: '🚏', x: 9900, y: 1960, s: 60 },
  { t: 'text', text: 'ここから先 立入禁止', x: 9800, y: 2210, s: 22, fill: '#fff', bold: true },
  { t: 'emoji', e: '🌸', x: 9600, y: 2190, s: 50 }, { t: 'emoji', e: '🌸', x: 8800, y: 2200, s: 44 }, { t: 'emoji', e: '🌱', x: 7200, y: 2200, s: 40 },
];

export default {
  id: 'S5', title: 'ひなた台駅の5分半', subtitle: '駅', theme: '駅',
  intro: 'ここは終着駅・ひなた台。電車が着いては出ていくあいだに、人も物も迷子だらけ。撮り鉄の少年は、駅ネコの「キップ」をなんとか撮りたいらしい。',
  timeLimitMs: 330000,
  world: { width: 10000, height: 2300, minZoom: 0.75, maxZoom: 4, bg: '#d4cbbc', spawnCamera: { x: 3700, y: 1450, zoom: 1 } },
  bgm: { tempo: 124, key: 5, mood: 'swing' },
  clearEventId: 'S5-E52', timeoutEventId: 'S5-E51',
  routes: {
    'S5.route.cat': '駅ネコと撮り鉄', 'S5.route.tomato': 'トマトとゴルフ', 'S5.route.train': '列車と押し屋',
    'S5.route.wig': '駅長のカツラ', 'S5.route.lost': '落とし物と迷い人', 'S5.route.family': '再会と人さがし',
    'S5.route.zip': 'ノブオの社会の窓', 'S5.route.toilet': 'トイレ事情', 'S5.route.punk': 'パンクとマナー',
    'S5.route.food': '駅の食べもの', 'S5.route.misc': '駅のあれこれ', 'S5.route.end': '駅ネコのゆくえ',
  },
  scenery,
  actors: {
    // ── 駅前広場 ──
    police: {
      name: '交番のカタダ巡査', x: 300, y: 1150, path: 'policeBeat', speed: 70,
      look: { hair: 'short', hairColor: '#222', shirt: '#2b3f73', pants: '#1f2d55', acc: ['cap'], hatColor: '#1f2d55', h: 165 },
      idle: [
        '本官は 道案内が 少しだけ苦手であります',
        { text: '最近、駅のどこかで サングラスの手配犯が 目撃されている……', when: [notDone('S5-E18')] },
        { text: '広場で 勝手に物を売っている者が いるらしい', when: [notDone('S5-E28')] },
        { text: '落とし物があったら、本官が 掲示板に 貼っておこう', when: [notDone('S5-E38')] },
        { text: '手配犯、確保！ 本日の本官は 冴えている', when: [done('S5-E18')] },
      ],
    },
    vendor: {
      name: '露店のおやじ', x: 2150, y: 1265, wander: 30,
      look: { hair: 'bald', hairColor: '#444', shirt: '#c97a2a', pants: '#5a4a3a', acc: ['mustache', 'apron'], h: 155 },
      idle: [
        'さあさあ 何でも100円！ 案内図より 安いよ！',
        'おまわりさんには ナイショだよ',
        { text: 'へっ、場所を変えりゃ いいんだろ……', when: [done('S5-E28')] },
      ],
    },
    minami: {
      name: '方向オンチのミナミさん', x: 900, y: 1500, wander: 140,
      look: { hair: 'bob', hairColor: '#5a3a2a', shirt: '#7ab0d8', pants: '#445', skirt: true, acc: ['bag'], h: 150 },
      idle: [
        '友だちが 赤ちゃんを産んだの。ひなた台病院って どっち？',
        { text: '案内図があったはずなのに、お店のかげで 見えないわ', when: [notDone('S5-E28')] },
        { text: 'やっと 案内図が 見られるようになったわね', when: [done('S5-E28'), notDone('S5-E29'), notDone('S5-E30')] },
        { text: '右に行って左に行って、また右……ここ、どこ？', when: [done('S5-E30')] },
      ],
    },
    kirara: {
      name: 'ギャルのキララ', x: 1300, y: 2000, wander: 160,
      look: { hair: 'long', hairColor: '#f2d27a', skin: '#8a5a3a', shirt: '#ff7ab8', pants: '#fff', skirt: true, acc: ['earring', 'sunglasses'], h: 152 },
      idle: [
        'マジ 日焼けサロン 最高なんだけど〜',
        { text: 'パパ、今日 迎えに来るって言ってたけど……わかるかな、アタシのこと', when: [notDone('S5-E31'), notDone('S5-E32')] },
        'ホームのほうに 似たようなメガネのおじさん いっぱいいるし',
        { text: 'パパ、泣きすぎ〜。でも ちょっと うれしい', when: [{ anyEventDone: ['S5-E31', 'S5-E32'] }] },
      ],
    },
    ayane: {
      name: '着がえたいアヤネ', x: 1150, y: 1750, wander: 60,
      look: { hair: 'pony', hairColor: '#3a2a1a', shirt: '#5a8a5a', pants: '#5a8a5a', acc: ['bag'], h: 155 },
      idle: [
        'これから二次会なのに、まだジャージ……',
        'どこか 着がえられる場所 ないかなあ',
        { text: 'トイレ、ずっと清掃中なんだもん', when: [notDone('S5-E47'), notDone('S5-E49')] },
        { text: 'もういいや、ジャージで行く……', when: [done('S5-E49')] },
        { text: 'ねえ見て！ 変身完了〜！', when: [done('S5-E50')] },
      ],
    },
    cleaner: {
      name: '清掃員のおばさん', x: 1760, y: 1090, wander: 40,
      look: { hair: 'bun', hairColor: '#888', shirt: '#6aa0c8', pants: '#3a5a7a', acc: ['apron', 'cap'], hatColor: '#6aa0c8', old: true, h: 145 },
      idle: [
        'ピッカピカにするまで 開けないよ',
        { text: 'よっぽど 困ってる人でも来たら、そりゃ 開けるけどね', when: [notDone('S5-E47')] },
        { text: 'はい、おそうじ おしまい！', when: [done('S5-E47')] },
      ],
    },
    hayami: {
      name: '遅刻中のハヤミ', x: 320, y: 1950, wander: 90,
      look: { hair: 'long', hairColor: '#2a1a1a', shirt: '#e8a23a', pants: '#3a3a5a', skirt: true, acc: ['bag', 'earring'], h: 155 },
      idle: [
        'バスが遅れて 大遅刻！ 夫は どこで待ってるの？',
        'スマホの電池が切れちゃった……',
        { text: 'お義母さんなら 伝言板に何か書いてくれそうなんだけど', when: [notDone('S5-E48')] },
        { text: 'そば屋の前ね！ 今いくわ！', when: [done('S5-E48')] },
      ],
    },
    rikiya: {
      name: 'こわもてのリキヤ', x: 2300, y: 1800, wander: 80,
      look: { hair: 'spiky', hairColor: '#111', shirt: '#2a2a2a', pants: '#2a2a2a', acc: ['sunglasses'], muscle: true, wide: true, h: 175 },
      idle: [
        '……なに見てんだ',
        'オレだって たまには 手紙くらい もらいてえよ',
        { text: 'オレに ラブレター……。返事、なんて書こう', when: [done('S5-E20')] },
      ],
    },
    hato2: { name: '広場のハト', emoji: '🐦', size: 40, x: 1100, y: 1650, wander: 220, speed: 50, idle: ['クルックー', 'ポッポ（パンくずを さがしている）'] },
    comm2: {
      name: '急ぐ会社員', x: 200, y: 1400, path: [[200, 1400], [2400, 1450], [3200, 1350], [2400, 1500], [200, 1450]], speed: 110,
      look: { hair: 'short', hairColor: '#333', shirt: '#eee', pants: '#333', acc: ['tie', 'bag'], h: 165 },
      idle: ['遅刻だ 遅刻だ！', '定期、定期……あった！'],
    },

    // ── コンコース ──
    komachi: {
      name: '小柄なコマチさん', x: 3050, y: 1070, wander: 20,
      look: { hair: 'bun', hairColor: '#4a2a1a', shirt: '#e8b4d0', pants: '#555', skirt: true, h: 112 },
      idle: [
        'う〜ん、いちばん上のボタンが……とどかない',
        '背の高い人、通らないかしら',
        { text: 'ありがとう、のっぽさん！', when: [done('S5-E36')] },
      ],
    },
    takagi: {
      name: 'ノッポのタカギ', x: 3320, y: 1260, wander: 90,
      look: { hair: 'short', hairColor: '#3a2a1a', shirt: '#8ab04a', pants: '#3a4a2a', acc: ['headphones'], h: 205 },
      idle: [
        '背が高いと 電車のつり革が じゃまでさ',
        '家の鍵は クマのキーホルダーつき。なくすわけ ないって',
        { text: 'あれ……？ 鍵がない！ さっき かがんだ時か？', when: [done('S5-E36'), notDone('S5-E37'), notDone('S5-E39')] },
        { text: '落とし物って、どこに 届くんだろう', when: [done('S5-E36'), notDone('S5-E37'), notDone('S5-E39')] },
        { text: 'クマちゃん、おかえり', when: [{ anyEventDone: ['S5-E37', 'S5-E39'] }] },
      ],
    },
    maue: {
      name: 'メガネをさがすマウエさん', x: 3560, y: 1460, wander: 0,
      look: { hair: 'short', hairColor: '#777', shirt: '#9a8a6a', pants: '#4a4a4a', acc: ['mustache'], h: 158 },
      idle: [
        'メガネ、メガネ……どこに置いたかなあ',
        '新聞を買ったのに、字が ぼやけて読めん',
        '息子が 家を出て三日。この駅で見たって 聞いたんだが',
        { text: 'カケル！ よく帰ってきた！', when: [done('S5-E22')] },
      ],
    },
    koeyama: {
      name: '電話中のコエヤマ', x: 4180, y: 1150, wander: 10,
      look: { hair: 'short', hairColor: '#222', shirt: '#4a6aa8', pants: '#2a2a3a', acc: ['tie'], wide: true, h: 170 },
      idle: [
        'もしもしィ！？ 聞こえる！？ 今 駅！ エ・キ！',
        'だからァ、その件はァ、部長がァ！',
        { text: '……すみませんでした。外で かけます', when: [done('S5-E44')] },
      ],
    },
    clerk: {
      name: '売店のおばちゃん', x: 4380, y: 990, wander: 0,
      look: { hair: 'bun', hairColor: '#999', shirt: '#e85a5a', pants: '#555', acc: ['apron'], old: true, h: 145 },
      idle: [
        'いらっしゃい。新聞、お弁当、胃ぐすりも あるよ',
        '駅弁は 迷ってる人ほど 最後に 特上を買うのよ',
      ],
    },
    speaker: {
      name: '構内放送のスピーカー', emoji: '📢', size: 60, x: 4700, y: 470, wander: 0, idleEveryMs: 14000,
      idle: [
        'ピンポンパーン♪ 駅構内では 大声での通話は ご遠慮ください',
        'ピンポンパーン♪ 床に座りこむのは おやめください',
        'ピンポンパーン♪ お忘れ物は 掲示板で ご確認ください',
      ],
    },
    sobaya: {
      name: '立ちそば屋の大将', x: 4880, y: 990, wander: 0,
      look: { hair: 'bald', hairColor: '#333', shirt: '#fff', pants: '#333', acc: ['apron', 'beard'], wide: true, h: 165 },
      idle: [
        'へいらっしゃい！ 七味は かけ放題だよ',
        'うちのかき揚げは 横取りされるほど うまいって評判さ',
        { text: 'ハックション……ここまで 七味が 飛んできた', when: [done('S5-E27')] },
      ],
    },
    beniko: {
      name: 'トマト好きのベニコ', x: 5150, y: 1260, wander: 90,
      look: { hair: 'twin', hairColor: '#8a2a1a', shirt: '#f4f0e0', pants: '#a33', skirt: true, acc: ['ribbon'], h: 152 },
      idle: [
        { text: 'のどかわいた〜。赤いのが 飲みたいな', when: [notDone('S5-E03')] },
        'トマトは 一日三缶 までって 決めてるの',
        { text: '自販機、なにか ピカピカしてない？', when: [done('S5-E03'), notDone('S5-E04')] },
        { text: 'もう！ 服が まっかっか！', when: [done('S5-E05')] },
      ],
    },
    harada: {
      name: '腹ペコのハラダ', x: 4420, y: 1500, wander: 0,
      look: { hair: 'short', hairColor: '#333', shirt: '#dfe6ee', pants: '#3a3a4a', acc: ['tie', 'glasses'], sit: true, h: 165 },
      idle: [
        '妻と母と ここで待ち合わせなんだが……',
        { text: '弁当、持ってきたんだけど……なんか 食欲がな', when: [notDone('S5-E08')] },
        { text: '売店の駅弁、どれも うまそうで 決められん', when: [notDone('S5-E08')] },
        { text: '母さん、トイレに行ったきり 戻ってこない', when: [notDone('S5-E47')] },
        { text: 'おーい、こっちこっち！', when: [done('S5-E48')] },
      ],
    },
    uchida: {
      name: 'ゴルフ狂のウチダ課長', x: 3800, y: 1760, wander: 110,
      look: { hair: 'short', hairColor: '#555', shirt: '#f2f2f2', pants: '#6a5a3a', acc: ['cap', 'tie'], hatColor: '#fff', h: 162 },
      idle: [
        '（かさで 素振り）ファー！……いや、いい当たりだ',
        '何か 丸っこいものを 打ちたいなあ',
        { text: 'ナイスショット！ ……あれ、だれかに当たった？', when: [done('S5-E05')] },
      ],
    },
    yoichi: {
      name: '二日酔いのヨイチ', x: 4650, y: 1850, wander: 60, speed: 40,
      look: { hair: 'spiky', hairColor: '#4a3a2a', skin: '#c9d6a8', shirt: '#8a6a9a', pants: '#3a3a3a', acc: ['tie'], h: 168 },
      idle: [
        { text: 'うぅ……頭が ガンガンする……', when: [notDone('S5-E10'), notDone('S5-E11')] },
        { text: '胃ぐすりか……いや、いっそ もう一杯……', when: [notDone('S5-E10'), notDone('S5-E11')] },
        { text: 'しゃっきり！ 今日も がんばるぞ', when: [done('S5-E10')] },
        { text: 'ぐぅ……（ベンチで寝ている）', when: [done('S5-E11')] },
      ],
    },
    ume: {
      name: 'トイレをさがすウメばあちゃん', x: 5050, y: 1960, wander: 130,
      look: { hair: 'bun', hairColor: '#ddd', shirt: '#9a6a8a', pants: '#5a4a5a', skirt: true, acc: ['bag'], old: true, h: 138 },
      idle: [
        { text: 'おトイレは どこかしらねえ……', when: [notDone('S5-E47')] },
        { text: '駅の中のおトイレは 長い行列でねえ', when: [notDone('S5-E47')] },
        { text: '外の広場にも あるって 聞いたけど', when: [notDone('S5-E47')] },
        '息子とお嫁さんと 待ち合わせなのよ',
        { text: 'ああ すっきり。伝言板に 書いておいたからね', when: [done('S5-E47')] },
      ],
    },
    masaki: {
      name: 'マナーにうるさいマサキ', x: 4300, y: 1960, wander: 70,
      look: { hair: 'short', hairColor: '#222', shirt: '#3a3a3a', pants: '#222', acc: ['glasses', 'tie'], h: 170 },
      idle: [
        'まったく、最近は マナーのなってない人が 多い',
        '大声の電話、床に座る若者……けしからん',
        { text: 'わかればよろしい', when: [done('S5-E44')] },
      ],
    },
    togemaru: {
      name: 'パンクのトゲマル', x: 4560, y: 2160, wander: 40,
      look: { hair: 'mohawk', hairColor: '#e33', shirt: '#222', pants: '#333', acc: ['earring', 'sunglasses'], sit: true, h: 168 },
      idle: [
        'ケッ、駅なんて つまんねえ場所だぜ',
        'オレらに 好きなもんなんて ねえよ……',
        { text: '（ちらちら）……あのポスター、見えねえんだよ、そこの電話野郎', when: [notDone('S5-E44')] },
        { text: 'ル、ルルちゃん……', when: [done('S5-E45'), notDone('S5-E46')] },
        { text: 'ファンは ポスターを はがさない……覚えたぜ', when: [done('S5-E46')] },
      ],
    },
    punk2: {
      name: 'パンクのピン', x: 4720, y: 2180, wander: 30,
      look: { hair: 'spiky', hairColor: '#6a3', shirt: '#333', pants: '#222', acc: ['earring'], sit: true, h: 160 },
      idle: [
        'リーダー、じつは アイドル好きなんすよ',
        { text: 'リーダー、それ はがしたら 捕まるっすよ', when: [done('S5-E45')] },
      ],
    },
    raita: {
      name: 'おなかピンチのライタ', x: 3950, y: 2010, wander: 160, speed: 110,
      look: { hair: 'short', hairColor: '#3a2a1a', shirt: '#d8c84a', pants: '#3a5a8a', acc: ['bag'], h: 160 },
      idle: [
        { text: 'お、おなかが……ゴロゴロ……', when: [notDone('S5-E33')] },
        { text: 'トイレ……トイレの看板は……', when: [notDone('S5-E33')] },
        { text: '紙がなーーい！ だれか〜〜！', when: [done('S5-E33'), notDone('S5-E35')] },
        { text: '生きて 出られた……', when: [done('S5-E35')] },
      ],
    },
    hanami: {
      name: '花粉症のハナミ', x: 3200, y: 1660, wander: 90,
      look: { hair: 'short', hairColor: '#5a4a3a', shirt: '#a8c8a8', pants: '#556', acc: ['mask', 'glasses'], h: 165 },
      idle: [
        { text: 'ずびっ……鼻が……とまらない……', when: [notDone('S5-E34')] },
        { text: 'ティッシュ、使いきっちゃった……', when: [notDone('S5-E34')] },
        { text: 'ふう、すっきり。10円で 救われた', when: [done('S5-E34')] },
      ],
    },
    gal1: {
      name: '噂好きのユイ', x: 3900, y: 1560, wander: 20,
      look: { hair: 'long', hairColor: '#6a3a1a', shirt: '#2a3a6a', pants: '#2a3a6a', skirt: true, acc: ['ribbon', 'bag'], h: 150 },
      idle: [
        'ねえねえ、あそこの人……ふふっ',
        { text: '言ってあげたほうが いいのかな、あれ', when: [notDone('S5-E25'), notDone('S5-E41')] },
        'モモカ、だれかから 手紙もらいたいって 言ってたよね',
      ],
    },
    gal2: {
      name: '噂好きのマキ', x: 3990, y: 1570, wander: 20,
      look: { hair: 'bob', hairColor: '#222', shirt: '#2a3a6a', pants: '#2a3a6a', skirt: true, acc: ['ribbon'], h: 148 },
      idle: [
        'やだ〜、見ちゃった〜',
        { text: '本人 ぜんぜん 気づいてないし！', when: [notDone('S5-E25'), notDone('S5-E41')] },
      ],
    },
    nobuo: {
      name: 'うっかりノブオ', x: 4100, y: 1720, wander: 0,
      look: { hair: 'short', hairColor: '#2a1a0a', shirt: '#e8e8e8', pants: '#2a4a8a', acc: ['bag'], h: 162 },
      idle: [
        '今日は なんだか 風通しが いいなあ',
        { text: 'あの子たち、オレのこと 見てる……？', when: [notDone('S5-E24')] },
        '姉ちゃん、今日 寝坊して あわてて出かけてったっけ',
        { text: 'は……は……（くしゃみが 出そうで 出ない）', when: [done('S5-E25'), notDone('S5-E27')] },
      ],
    },
    bandv: {
      name: '「終電ズ」のボーカル', x: 3270, y: 2100, wander: 20,
      look: { hair: 'long', hairColor: '#1a1a1a', shirt: '#a33', pants: '#222', acc: ['earring'], h: 165 },
      idle: [
        '♪ 終電〜 逃して〜 ひなた台〜',
        'ギターが ひとり 足りないんだよなあ',
        { text: '駅員さん、最高のギターだったぜ！', when: [done('S5-E09')] },
      ],
    },
    band2: {
      name: '「終電ズ」のドラム', x: 3430, y: 2090, wander: 10,
      look: { hair: 'afro', hairColor: '#3a2a1a', shirt: '#fff', pants: '#336', h: 160 },
      idle: ['ドン ツク ドン ツク', 'あの改札の駅員さん、昔 バンドやってたって ウワサ'],
    },
    momoka: {
      name: '女子高生モモカ', x: 3650, y: 2060, wander: 90,
      look: { hair: 'pony', hairColor: '#3a2a1a', shirt: '#fff', pants: '#2a3a6a', skirt: true, acc: ['ribbon', 'bag'], h: 150 },
      idle: [
        'あ〜あ、だれか ラブレター くれないかなあ',
        'さっき このへんで だれかが 何か落としてた',
        { text: 'この手紙の人、どこにいるの〜！', when: [done('S5-E19')] },
      ],
    },
    neko: {
      name: '駅ネコのキップ', emoji: '🐈', size: 54, x: 4400, y: 520, wander: 120, speed: 50,
      idle: [
        { text: 'ニャ〜（梁の上で しっぽを ゆらしている）', when: [notDone('S5-E05')] },
        { text: 'ニャ……（大きな音が きらい）', when: [notDone('S5-E05')] },
        { text: 'ニャウ……（おなかが すいている）', when: [notDone('S5-E47')] },
        { text: 'ゴロゴロ……（煮干しのにおいで ごきげん）', when: [done('S5-E47')] },
      ],
    },
    todoroki: {
      name: '駅員トドロキ', x: 5420, y: 1100, path: [[5420, 1100], [5420, 2100]], speed: 50,
      look: { hair: 'short', hairColor: '#222', shirt: '#2b3f73', pants: '#1f2d55', acc: ['cap', 'earring'], hatColor: '#1f2d55', h: 170 },
      idle: [
        'きっぷを 拝見……。……はい、どうぞ',
        { text: '（足で リズムを とっている）', when: [notDone('S5-E09')] },
        { text: 'あのバンド、ギターが 足りてねえな……', when: [notDone('S5-E09')] },
        { text: 'ロックは 制服を着ても 死なねえ！', when: [done('S5-E09')] },
      ],
    },
    comm1: {
      name: '通勤客', x: 2650, y: 1300, path: [[2650, 1300], [5500, 1350], [6500, 1200], [8800, 1150], [6500, 1300], [5500, 1450], [2650, 1450]], speed: 100,
      look: { hair: 'short', hairColor: '#222', shirt: '#56708a', pants: '#2a2a2a', acc: ['tie', 'bag'], h: 168 },
      idle: ['すみません、通ります', '2番線の快速、いつも 満員なんだよな'],
    },

    // ── ホーム ──
    ritsu: {
      name: '鉄道少年リツ', x: 6300, y: 1310, wander: 60,
      look: { hair: 'short', hairColor: '#222', shirt: '#3a8ad8', pants: '#335', acc: ['cap'], hatColor: '#d33', kid: true, h: 112 },
      idle: [
        { text: 'ラジコン電車、電池が 切れちゃった……', when: [notDone('S5-E01')] },
        { text: 'コンビニに 電池 売ってるかなあ', when: [notDone('S5-E01')] },
        '3番線のレール、こわれてるって 保線のおじさんが 言ってた',
        { text: '見て見て！ ぼくの特急、はやいでしょ！', when: [done('S5-E01')] },
      ],
    },
    hazama: {
      name: 'ドアに挟まるハザマさん', x: 6900, y: 880, wander: 0,
      look: { hair: 'long', hairColor: '#4a2a1a', shirt: '#c86a8a', pants: '#444', skirt: true, acc: ['bag'], h: 155 },
      idle: [
        { text: 'ドアに カバンが はさまって……動けない〜！', when: [vis('train1')] },
        { text: 'だれか 押して〜！ プロの人〜！', when: [vis('train1')] },
        { text: 'また 乗りそびれた……次こそ', when: [notVis('train1')] },
      ],
    },
    tsumeta: {
      name: 'ドアに挟まるツメタ係長', x: 7900, y: 880, wander: 0,
      look: { hair: 'short', hairColor: '#555', shirt: '#eee', pants: '#2a2a3a', acc: ['tie', 'glasses'], wide: true, h: 165 },
      idle: [
        { text: 'おなかが……ドアに……つかえて……', when: [vis('train1')] },
        { text: '駅員さーん、うしろから ひと押し お願い……', when: [vis('train1')] },
        { text: 'ダイエットしてから 乗ろう……', when: [notVis('train1')] },
      ],
    },
    yoneda: {
      name: '新人駅員ヨネダ', x: 6200, y: 1010, path: [[6200, 1010], [8800, 1010]], speed: 60,
      look: { hair: 'short', hairColor: '#3a2a1a', shirt: '#2b3f73', pants: '#1f2d55', acc: ['cap'], hatColor: '#1f2d55', h: 165 },
      idle: [
        '1番線、ドア 閉まりまーす……閉まらない……',
        'お客さまが 困っていたら すぐ 駆けつけます！ ……呼ばれたら',
        { text: '列車が いないと、押すものも ないなあ', when: [notVis('train1')] },
      ],
    },
    ekicho: {
      name: '駅長', x: 7300, y: 1260, wander: 160,
      look: { hair: 'short', hairColor: '#222', shirt: '#1f2d55', pants: '#1f2d55', acc: ['cap', 'mustache'], hatColor: '#1f2d55', old: true, h: 165 },
      idle: [
        '本日も 定刻どおり。よきかな よきかな',
        '電車が通ると 風が強くてな。帽子が 飛ばされんように……',
        { text: 'ワシの……ワシの頭の あれが 線路に……！', when: [vis('wig'), notDone('S5-E13'), notDone('S5-E14'), notDone('S5-E15')] },
        { text: 'ハトのやつ、ワシの髪で 巣を作りおった', when: [done('S5-E14')] },
      ],
    },
    hato: {
      name: 'ホームのハト', emoji: '🕊️', size: 46, x: 8300, y: 1220, wander: 220, speed: 60,
      idle: ['クルッポー（巣の材料を さがしている）', 'ポッポ……（ふわふわしたものが 好き）'],
    },
    sanae: {
      name: 'ノブオの姉サナエ', x: 8500, y: 1110, wander: 70,
      look: { hair: 'bun', hairColor: '#4a2a1a', shirt: '#f0c8a8', pants: '#556', skirt: true, acc: ['ribbon', 'bag'], h: 158 },
      idle: [
        { text: '寝坊して カーラー つけたまま 出てきちゃった', when: [notDone('S5-E40')] },
        { text: 'あれ、カーラーが ひとつ 足りない', when: [notDone('S5-E40')] },
        '弟は ほんと うっかりしてるのよね',
      ],
    },
    kumade: {
      name: '押し屋クマデ', x: 7000, y: 1660, wander: 60,
      look: { hair: 'short', hairColor: '#222', shirt: '#2b3f73', pants: '#1f2d55', acc: ['cap'], hatColor: '#1f2d55', muscle: true, wide: true, h: 178 },
      idle: [
        '押し屋 一筋 二十年。ドアの数だけ 腕が鳴る',
        { text: '快速が 来るまでは ヒマなんだよな', when: [notVis('train2')] },
        { text: 'ドアが いっぱい……燃えてきた！', when: [vis('train2'), notDone('S5-E23')] },
      ],
    },
    p1: {
      name: '乗れない乗客A', x: 7600, y: 1570, wander: 10,
      look: { hair: 'short', hairColor: '#222', shirt: '#7a7a9a', pants: '#333', acc: ['tie'], h: 165 },
      idle: [{ text: 'ぐぬぬ、満員で 乗れない！', when: [vis('train2')] }, '次の快速は いつだっけ'],
    },
    p2: {
      name: '乗れない乗客B', x: 7720, y: 1575, wander: 10,
      look: { hair: 'long', hairColor: '#3a2a1a', shirt: '#b0a080', pants: '#444', skirt: true, h: 155 },
      idle: [{ text: 'あとひと押し あれば……', when: [vis('train2')] }, '今日も 遅刻かも'],
    },
    p3: {
      name: '乗れない乗客C', x: 7840, y: 1572, wander: 10,
      look: { hair: 'bald', hairColor: '#666', shirt: '#6a8a6a', pants: '#333', acc: ['glasses'], h: 160 },
      idle: [{ text: 'ドアの数は 多いのに……', when: [vis('train2')] }, 'ふう、また見送りか'],
    },
    hannin: {
      name: 'サングラスの男', x: 8200, y: 1860, wander: 130,
      look: { hair: 'short', hairColor: '#111', shirt: '#3a3a3a', pants: '#222', acc: ['sunglasses', 'mask', 'cap'], hatColor: '#222', h: 168 },
      idle: [
        '（キョロキョロ）……',
        'へへっ、駅は 人が多くて 隠れやすいぜ',
        'おまわりは 広場の交番だろ。ここまでは 来ねえさ',
      ],
    },
    iwao: {
      name: 'キララの父イワオ', x: 8800, y: 1710, wander: 90,
      look: { hair: 'short', hairColor: '#777', shirt: '#8a7a5a', pants: '#3a3a3a', acc: ['glasses'], h: 165 },
      idle: [
        { text: '娘を迎えに来たんだが……三年ぶりで 顔が わかるかな', when: [notDone('S5-E31'), notDone('S5-E32')] },
        { text: '色白で おとなしい子でな。広場で 待ってるはずなんだ', when: [notDone('S5-E31'), notDone('S5-E32')] },
        { text: '娘よ……日焼けしても 娘は 娘だ', when: [{ anyEventDone: ['S5-E31', 'S5-E32'] }] },
      ],
    },
    sumo: {
      name: '力士・福ノ岩', x: 6600, y: 1960, wander: 70,
      look: { hair: 'topknot', hairColor: '#111', skin: '#f2c9a0', shirt: '#6a4a8a', pants: '#6a4a8a', wide: true, muscle: true, h: 178 },
      idle: [
        '黄色い電車を見ると 幸せになれると 聞いたでごわす',
        { text: 'でも 3番線は 線路の点検中で 黄色いのが 来ないでごわす', when: [notDone('S5-E02')] },
        { text: '黄色いのが 来たでごわす！ 乗りたいでごわす！', when: [done('S5-E02'), notDone('S5-E21')] },
      ],
    },
    kakeru: {
      name: '家出少年カケル', x: 9200, y: 1310, wander: 30,
      look: { hair: 'spiky', hairColor: '#2a1a0a', shirt: '#d8783a', pants: '#3a4a6a', acc: ['bag'], kid: true, sit: true, h: 120 },
      idle: [
        '……もう 帰らないって 決めたんだ',
        '父さん、きっと まだ 怒ってる',
        { text: '新聞……？ そんなの 読まないし', when: [done('S5-E12'), notDone('S5-E22')] },
      ],
    },
    tettei: {
      name: '修理員テッペイ', x: 9350, y: 1960, wander: 40,
      look: { hair: 'short', hairColor: '#333', shirt: '#f28a2a', pants: '#f28a2a', acc: ['helmet'], hatColor: '#ffd84a', h: 168 },
      idle: [
        { text: 'どこかのレールが 割れてるって 連絡なんだが……', when: [notDone('S5-E02')] },
        { text: '場所さえ わかれば すぐ直すんだけどなあ', when: [notDone('S5-E02')] },
        { text: 'これで 黄色い点検車も 走れるぞ', when: [done('S5-E02')] },
      ],
    },
    haruto: {
      name: '撮り鉄のハルト', x: 9700, y: 1860, wander: 30,
      look: { hair: 'short', hairColor: '#2a1a0a', shirt: '#4a6a3a', pants: '#3a3a3a', acc: ['camera', 'cap'], hatColor: '#2a4a2a', h: 150 },
      idle: [
        '駅ネコ キップの写真で コンテストに 出たいんだ',
        { text: 'キップ、あんな高い梁の上……大きな音でも すれば 飛び降りるのに', when: [notDone('S5-E05')] },
        { text: 'おなかが すいてると、キップは じっとしてくれないんだ', when: [notDone('S5-E47')] },
        { text: '今の悲鳴！ キップが 床に 降りた？', when: [done('S5-E05'), notDone('S5-E47')] },
        { text: '今なら キップ、ごきげんのはず……！', when: [done('S5-E05'), done('S5-E47')] },
      ],
    },
    pspeaker: {
      name: 'ホームのスピーカー', emoji: '📢', size: 54, x: 8000, y: 560, wander: 0, capturable: false, idleEveryMs: 16000,
      idle: ['ピンポンパーン♪ 黄色い線の 内側まで お下がりください', 'ピンポンパーン♪ 駆けこみ乗車は おやめください'],
    },
  },
  objects: {
    // 列車（timeline で出入りする）
    train1: { name: '1番線の普通電車', sign: { text: '🚪　　🚪　普通 みなと行　🚪　　🚪', fill: '#3b8a5a', color: '#fff', s: 34 }, w: 2800, h: 200, x: 7500, y: 815 },
    train2: { name: '2番線の快速（ドアがたくさん）', sign: { text: '🚪🚪🚪 快速 そらの台行 🚪🚪🚪', fill: '#d0682a', color: '#fff', s: 34 }, w: 2800, h: 200, x: 11600, y: 1495, hidden: true },
    ytrain: { name: '黄色い点検車', sign: { text: '★ 点検車 イエローライナー ★', fill: '#f2d22e', color: '#333', s: 34 }, w: 2200, h: 190, x: 11600, y: 2080, hidden: true },
    // 広場
    stall: { name: 'あやしい露店', sign: { text: '何でも100円', fill: '#d8783a', color: '#fff', s: 22 }, w: 230, h: 120, x: 2150, y: 1235 },
    guide: { name: '駅周辺案内図', sign: { text: '案内図 🏥→', fill: '#2a5a8a', color: '#fff', s: 22 }, w: 200, h: 200, x: 2200, y: 1110 },
    pwc: { name: '公衆トイレ', sign: { text: '🚻 公衆トイレ', fill: '#2e6b3a', color: '#fff', s: 24 }, w: 220, h: 240, x: 1690, y: 1020 },
    cleaningsign: { name: '「清掃中」の立て札', emoji: '🚧', size: 52, x: 1830, y: 1060 },
    wanted: { name: '指名手配のポスター', sign: { text: '指名手配 🕶️ サングラスの男', fill: '#fff', color: '#c33', s: 16 }, w: 130, h: 170, x: 640, y: 990 },
    tissue: { name: 'ポケットティッシュ', emoji: '🧻', size: 32, x: 1960, y: 1640, minZoom: 1.1 },
    niboshi: { name: 'ばあちゃんの煮干し', emoji: '🐟', size: 30, x: 1580, y: 1130, hidden: true },
    busbench: { name: 'バス停の時刻表', sign: { text: '10:45 ひなた循環', fill: '#fff', color: '#333', s: 16 }, w: 120, h: 70, x: 900, y: 1070 },
    // コンコース
    wc: { name: '駅のトイレ', sign: { text: '🚻 駅トイレ', fill: '#1b3a7a', color: '#fff', s: 24 }, w: 200, h: 260, x: 2700, y: 1010 },
    tissuebox: { name: 'ティッシュ自販機', sign: { text: '🧻 10円', fill: '#f4f0e0', color: '#333', s: 20 }, w: 90, h: 150, x: 2860, y: 1000 },
    kenbaiki: { name: '券売機', sign: { text: '券売機 ▢▢▢', fill: '#d8dde4', color: '#2a4a7a', s: 22 }, w: 300, h: 190, x: 3110, y: 1000 },
    key: { name: 'クマの鍵', emoji: '🔑', size: 30, x: 3180, y: 1100, minZoom: 1.3, hidden: true },
    dengon: { name: '伝言板', sign: { text: '伝言板', fill: '#2a4a3a', color: '#fff', s: 22 }, w: 200, h: 150, x: 3420, y: 980 },
    lostboard: { name: '落とし物の掲示板', sign: { text: '落とし物のお知らせ', fill: '#fff8d8', color: '#333', s: 18 }, w: 200, h: 150, x: 3640, y: 980 },
    glasses: { name: 'マウエさんの頭の上のメガネ', emoji: '👓', size: 28, x: 3560, y: 1308, minZoom: 1.5, layer: 1 },
    newspaper: { name: '尋ね人欄つきの新聞', emoji: '📰', size: 40, x: 3660, y: 1488, hidden: true },
    conbini: { name: '駅ナカのコンビニ', sign: { text: 'ひなたマート 🔋🍙', fill: '#3a9a5a', color: '#fff', s: 26 }, w: 340, h: 280, x: 3890, y: 1000 },
    idolposter: { name: 'アイドルのポスター', sign: { text: '星乃ルル LIVE☆', fill: '#ffb8d8', color: '#a33', s: 18 }, w: 150, h: 220, x: 4180, y: 900 },
    kiosk: { name: '売店', sign: { text: '売店  新聞・弁当・胃ぐすり', fill: '#c0392b', color: '#fff', s: 18 }, w: 240, h: 190, x: 4380, y: 1060 },
    sakeposter: { name: 'お酒のポスター', sign: { text: '🍶 今夜も一杯', fill: '#2a2a4a', color: '#ffd84a', s: 18 }, w: 150, h: 200, x: 4570, y: 900 },
    soba: { name: '立ちそば屋', sign: { text: '立ちそば 🍜 かき揚げ', fill: '#5a3a1a', color: '#fff', s: 24 }, w: 300, h: 250, x: 4880, y: 1050 },
    shichimi: { name: '七味の缶', emoji: '🌶️', size: 28, x: 5000, y: 1075, minZoom: 1.4, layer: 1 },
    vending: { name: '自販機', sign: { text: '🥤 自販機', fill: '#d33', color: '#fff', s: 20 }, w: 140, h: 230, x: 5220, y: 1050 },
    lotto: { name: '自販機の当たりルーレット', sign: { text: '0 0 0 0', fill: '#111', color: '#7cff7c', s: 18 }, w: 100, h: 34, x: 5340, y: 1000, minZoom: 1.2 },
    tomatocan: { name: 'トマトジュースの空き缶', emoji: '🥫', size: 30, x: 5000, y: 1410, minZoom: 1.1 },
    bento: { name: 'ハラダの手作り弁当', emoji: '🍱', size: 34, x: 4510, y: 1505 },
    zipper: { name: 'ノブオのズボンのファスナー', emoji: '🤐', size: 22, x: 4100, y: 1655, minZoom: 1.6, layer: 1 },
    letter: { name: '落ちていたラブレター', emoji: '💌', size: 30, x: 3000, y: 2200, minZoom: 1.2 },
    kasa: { name: 'だれかの傘', emoji: '🌂', size: 40, x: 2620, y: 1620, rot: 0.6 },
    guitarcase: { name: 'ギターケース（投げ銭）', emoji: '🪙', size: 34, x: 3330, y: 2150 },
    mannersposter: { name: 'マナーポスター', sign: { text: 'ゆずりあい', fill: '#e8f4e8', color: '#2a6a3a', s: 18 }, w: 120, h: 160, x: 5080, y: 760 },
    // ホーム
    rc: { name: 'ラジコン電車', emoji: '🚂', size: 36, x: 6420, y: 1320 },
    wig: { name: '線路に落ちたカツラ', emoji: '🦱', size: 40, x: 7050, y: 1470, hidden: true, layer: 1 },
    curler: { name: '落ちていたカーラー', emoji: '🌀', size: 26, x: 6100, y: 1260, minZoom: 1.3 },
    brokenrail: { name: '割れたレール', emoji: '⚡', size: 44, x: 9150, y: 2085, rot: 0.3 },
    timetable: { name: 'ホームの時刻表', sign: { text: '時刻表  :05 :15 :25', fill: '#fff', color: '#333', s: 16 }, w: 140, h: 120, x: 6700, y: 1050 },
    ekiben: { name: '駅弁ののぼり', emoji: '🎏', size: 50, x: 9600, y: 1300 },
    pigeonnest: { name: 'ハトの巣', emoji: '🪺', size: 40, x: 8000, y: 420, hidden: true },
  },
  paths: {
    policeBeat: { points: [[300, 1150], [1300, 1250], [2250, 1350], [1300, 1720], [400, 1600]], speed: 70, loop: true },
    yonedaBeat: { points: [[6200, 1010], [8800, 1010]], speed: 60, loop: true },
    rcRun: { points: [[6700, 1330], [6900, 1380], [6600, 1400], [6300, 1360], [6450, 1320]], speed: 260, loop: false },
  },
  reactions: [
    { s: 'kiosk', t: 'harada', say: 'うーん、幕の内か、かつサンドか……もう少し 迷わせてくれ', anim: 'react.think', when: [notDone('S5-E08')] },
    { s: 'neko', t: 'haruto', say: 'キップ……まだ 撮れる感じじゃ ないなあ', anim: 'react.sad', when: [{ not: { allEventsDone: ['S5-E05', 'S5-E47'] } }] },
    { s: 'guide', t: 'minami', say: '案内図？ 露店のかげで 見えないのよ', anim: 'react.shrug', when: [notDone('S5-E28')] },
    { s: 'police', t: 'minami', say: 'おまわりさん、なんだか 忙しそうね', anim: 'react.shrug', when: [notDone('S5-E28')] },
    { s: 'wc', t: 'ume', say: '駅の中のおトイレは 行列でねえ……とても 待てないわ', anim: 'react.sad' },
    { s: 'idolposter', t: 'togemaru', say: 'あ？ 電話野郎の でけえ背中しか 見えねえよ', anim: 'react.angry', when: [notDone('S5-E44')] },
    { s: 'tissue', t: 'raita', say: 'ティッシュ？ いや、今は それより トイレ……！', anim: 'react.scared', when: [notDone('S5-E33')] },
    { s: 'newspaper', t: 'maue', say: '同じ新聞を 五部も 買ってしまった', anim: 'react.shrug' },
    { s: 'lostboard', t: 'takagi', say: '落とし物？ オレは 何も なくしてないよ', anim: 'react.shrug', when: [notDone('S5-E38')] },
    { s: 'dengon', t: 'hayami', say: '伝言板……まだ 何も 書いてないわね', anim: 'react.sad', when: [notDone('S5-E47')] },
    { s: 'tomatocan', t: 'beniko', say: 'それ、さっき わたしが飲んだ缶。もう からっぽ', anim: 'react.shrug' },
    { s: 'wig', t: 'kakeru', say: '……毛？', anim: 'react.surprised' },
    { s: 'train1', t: 'kumade', say: '1番線は 新人のヨネダの担当だ', anim: 'react.shrug' },
    { s: 'kenbaiki', t: 'komachi', say: 'ボタンは あそこ……ずっと 上なの', anim: 'react.sad' },
  ],
  exclusiveGroups: [
    { id: 'S5-HANGOVER', policy: 'FIRST_TRIGGER_WINS', eventIds: ['S5-E10', 'S5-E11'] },
    { id: 'S5-WIG', policy: 'FIRST_TRIGGER_WINS', eventIds: ['S5-E13', 'S5-E14', 'S5-E15'] },
    { id: 'S5-LETTER', policy: 'FIRST_TRIGGER_WINS', eventIds: ['S5-E19', 'S5-E20'] },
    { id: 'S5-HOSPITAL', policy: 'FIRST_TRIGGER_WINS', eventIds: ['S5-E29', 'S5-E30'] },
    { id: 'S5-REUNION', policy: 'FIRST_TRIGGER_WINS', eventIds: ['S5-E31', 'S5-E32'] },
    { id: 'S5-KEY', policy: 'FIRST_TRIGGER_WINS', eventIds: ['S5-E37', 'S5-E39'] },
    { id: 'S5-ZIP', policy: 'FIRST_TRIGGER_WINS', eventIds: ['S5-E25', 'S5-E41'] },
    { id: 'S5-CHANGE', policy: 'FIRST_TRIGGER_WINS', eventIds: ['S5-E49', 'S5-E50'] },
    { id: 's5-ending', policy: 'FIRST_TRIGGER_WINS', eventIds: ['S5-E51', 'S5-E52'] },
  ],
  timeline: [
    // ── 1番線：最初は停車中。出発 → 到着 をくり返す ──
    { every: 60000, start: 25000, effects: [
      { type: 'ACTOR_SPEECH', actorId: 'pspeaker', text: '1番線、ドアが 閉まります。ご注意ください' },
      { type: 'PLAY_SOUND', soundId: 'whistle' },
      { type: 'OBJECT_MOVE', objectId: 'train1', to: [11600, 815], speed: 600, delayMs: 1200 },
      { type: 'PLAY_SOUND', soundId: 'train', delayMs: 1200 },
      { type: 'HIDE_OBJECT', objectId: 'train1', delayMs: 8500 },
    ] },
    { every: 60000, start: 25000, when: [notDone('S5-E16')], effects: [{ type: 'ACTOR_SPEECH', actorId: 'hazama', text: 'あっ……ドアが ポンって 開いて 押し出された……', delayMs: 1500 }] },
    { every: 60000, start: 45000, effects: [
      { type: 'ACTOR_SPEECH', actorId: 'pspeaker', text: 'まもなく 1番線に 普通 みなと行きが 到着します' },
      { type: 'SPAWN_OBJECT', objectId: 'train1' },
      { type: 'OBJECT_MOVE', objectId: 'train1', to: [7500, 815], speed: 600 },
      { type: 'PLAY_SOUND', soundId: 'train' },
    ] },
    // ── 2番線：快速（満員） ──
    { every: 50000, start: 10000, effects: [
      { type: 'ACTOR_SPEECH', actorId: 'pspeaker', text: '2番線に 快速 そらの台行きが まいります。車内 たいへん 混雑しております' },
      { type: 'SPAWN_OBJECT', objectId: 'train2' },
      { type: 'OBJECT_MOVE', objectId: 'train2', to: [7500, 1495], speed: 600 },
      { type: 'PLAY_SOUND', soundId: 'train' },
    ] },
    { every: 50000, start: 35000, when: [vis('train2')], effects: [
      { type: 'PLAY_SOUND', soundId: 'bell' },
      { type: 'OBJECT_MOVE', objectId: 'train2', to: [11600, 1495], speed: 600, delayMs: 1000 },
      { type: 'HIDE_OBJECT', objectId: 'train2', delayMs: 8500 },
    ] },
    { every: 50000, start: 35000, when: [notDone('S5-E23')], effects: [{ type: 'ACTOR_SPEECH', actorId: 'p1', text: 'また 見送りだ……', delayMs: 1500 }] },
    // ── 3番線：黄色い点検車（レールが直ってから） ──
    { every: 40000, start: 20000, when: [done('S5-E02')], effects: [
      { type: 'ACTOR_SPEECH', actorId: 'pspeaker', text: '3番線に 黄色い点検車が 入ります。この車両には ご乗車 いただけません' },
      { type: 'SPAWN_OBJECT', objectId: 'ytrain' },
      { type: 'OBJECT_MOVE', objectId: 'ytrain', to: [7300, 2080], speed: 550 },
      { type: 'PLAY_SOUND', soundId: 'vehicle' },
    ] },
    { every: 40000, start: 35000, when: [vis('ytrain')], effects: [
      { type: 'OBJECT_MOVE', objectId: 'ytrain', to: [11600, 2080], speed: 600 },
      { type: 'HIDE_OBJECT', objectId: 'ytrain', delayMs: 7500 },
    ] },
    // ── 駅長のカツラ ──
    { at: 36000, effects: [
      { type: 'FX', kind: 'leaves', at: 'ekicho' },
      { type: 'ACTOR_APPEARANCE', actorId: 'ekicho', look: { hair: 'bald' } },
      { type: 'ACTOR_SPEECH', actorId: 'ekicho', text: 'うおっ、電車の風が！ ……頭が すずしい……', delayMs: 300 },
      { type: 'SPAWN_OBJECT', objectId: 'wig', delayMs: 600 },
    ] },
    { at: 115500, when: [vis('wig'), notDone('S5-E13'), notDone('S5-E14')], effects: [
      { type: 'SET_FLAG', id: 'wig.flat', value: true },
      { type: 'FX', kind: 'smoke', at: 'wig' },
      { type: 'OBJECT_APPEARANCE', objectId: 'wig', look: { emoji: '🫓', size: 46, rot: 0 } },
      { type: 'ACTOR_SPEECH', actorId: 'ekicho', text: 'ああっ！ ワシのが 快速に ひかれて ペッタンコに……', delayMs: 800 },
    ] },
    // ── 構内放送 ──
    { at: 3000, effects: [{ type: 'ACTOR_SPEECH', actorId: 'speaker', text: '本日も ひなた台駅を ご利用いただき ありがとうございます' }] },
    { every: 70000, start: 55000, when: [notDone('S5-E28')], effects: [{ type: 'ACTOR_SPEECH', actorId: 'speaker', text: '駅前広場での 無許可の 路上販売は 禁止されております' }] },
    { every: 80000, start: 90000, when: [notDone('S5-E44')], effects: [{ type: 'ACTOR_SPEECH', actorId: 'speaker', text: 'コンコースで 大声で 通話中の お客さま……' }] },
    { at: 240000, effects: [{ type: 'ACTOR_SPEECH', actorId: 'speaker', text: 'お知らせします。まもなく 夕方の ラッシュの時間です' }] },
    { at: 300000, effects: [{ type: 'ACTOR_SPEECH', actorId: 'pspeaker', text: '駅ネコ キップは そろそろ お昼寝の 時間です' }, { type: 'FX', kind: 'zzz', at: 'neko' }] },
  ],
  events: [
    // ── 鉄道少年とラジコン ──
    { id: 'S5-E01', s: 'conbini', t: 'ritsu', cat: 'FLAVOR', title: 'ラジコン電車、復活', say: 'そうだ、コンビニで 電池！ ……よーし、発車オーライ！', anim: 'react.happy', route: 'S5.route.misc',
      fx: [{ type: 'OBJECT_MOVE', objectId: 'rc', pathId: 'rcRun', delayMs: 800 }, { type: 'PLAY_SOUND', soundId: 'vehicle', delayMs: 800 }, { type: 'FX', kind: 'stars', at: 'rc', delayMs: 900 }, { type: 'ACTOR_SET_STATE', actorId: 'ritsu', state: 'HAPPY' }, { type: 'ACTOR_SPEECH', actorId: 'hato', text: 'ポッ！？（びっくりして 跳ねた）', delayMs: 2200 }],
      after: [{ actor: 'ritsu', text: 'ほんものの線路も 早く直るといいね。3番線の 先っぽのほう', delay: 3600 }] },
    { id: 'S5-E02', s: 'brokenrail', t: 'tettei', cat: 'CHAIN', title: '修理員、割れたレールを直す', say: 'ここだったか！ よっしゃ、まかせとけ！', anim: 'react.think', route: 'S5.route.train',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'tettei', to: [9150, 2000], speed: 180 }, { type: 'FX', kind: 'sparkle', at: 'brokenrail', delayMs: 1600 }, { type: 'PLAY_SOUND', soundId: 'hit', delayMs: 1600 }, { type: 'OBJECT_APPEARANCE', objectId: 'brokenrail', look: { emoji: '🔩', rot: 0 }, delayMs: 2400 }, { type: 'SET_FLAG', id: 'rail.fixed', value: true }, { type: 'ACTOR_SET_STATE', actorId: 'tettei', state: 'HAPPY', delayMs: 2400 }],
      after: [{ actor: 'tettei', text: '修理完了！ 点検車に 来てもらって 確認だ', delay: 3200 }, { actor: 'sumo', text: '黄色い点検車……！ 来るでごわすか！', delay: 5200 }] },

    // ── トマトとゴルフ ──
    { id: 'S5-E03', s: 'vending', t: 'beniko', cat: 'CHAIN', title: 'ベニコ、トマトジュースを一気飲み', say: 'やっぱり トマトよね！ ゴクゴク……ぷはー！', anim: 'react.drink', route: 'S5.route.tomato',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'beniko', to: [5200, 1120], speed: 160 }, { type: 'PLAY_SOUND', soundId: 'pop', delayMs: 900 }, { type: 'OBJECT_APPEARANCE', objectId: 'lotto', look: { sign: { text: '7 7 7 7', fill: '#111', color: '#ffd84a', s: 18 } }, delayMs: 2000 }, { type: 'FX', kind: 'sparkle', at: 'lotto', delayMs: 2000 }, { type: 'PLAY_SOUND', soundId: 'bell', delayMs: 2000 }],
      after: [{ actor: 'beniko', text: '……ん？ 自販機の横で なにか ピカピカ光ってる？', delay: 3400 }] },
    { id: 'S5-E04', s: 'lotto', t: 'beniko', cat: 'FLAVOR', requires: ['S5-E03'], title: 'ベニコ、当たりに気づく', say: '7777！？ もう一本！ もちろん トマト！', anim: 'react.sparkle', route: 'S5.route.tomato',
      fx: [{ type: 'FX', kind: 'confetti', at: 'beniko' }, { type: 'PLAY_SOUND', soundId: 'success' }, { type: 'OBJECT_APPEARANCE', objectId: 'lotto', look: { sign: { text: 'あたり！', fill: '#111', color: '#ff7ab8', s: 18 } }, delayMs: 600 }, { type: 'ACTOR_SET_STATE', actorId: 'beniko', state: 'HAPPY' }] },
    { id: 'S5-E05', s: 'tomatocan', t: 'uchida', cat: 'PROGRESSION', title: 'ナイスショット！ 空き缶がベニコに命中', say: 'お、ちょうどいい丸さ……ファーーッ！！', anim: 'react.hit', route: 'S5.route.tomato', focus: true,
      fx: [{ type: 'ACTOR_MOVE', actorId: 'uchida', to: [4940, 1420], speed: 220 }, { type: 'PLAY_SOUND', soundId: 'hit', delayMs: 1600 }, { type: 'OBJECT_MOVE', objectId: 'tomatocan', to: [5150, 1150], speed: 900, delayMs: 1600 }, { type: 'FX', kind: 'splash', at: 'beniko', delayMs: 2300 }, { type: 'HIDE_OBJECT', objectId: 'tomatocan', delayMs: 2400 }, { type: 'ACTOR_APPEARANCE', actorId: 'beniko', look: { shirt: '#d42a2a' }, delayMs: 2400 }, { type: 'ACTOR_SPEECH', actorId: 'beniko', text: 'キャーーーッ！！ 血！？ ……なんだ、トマトか', delayMs: 2500 }, { type: 'ACTOR_SET_STATE', actorId: 'beniko', state: 'ANGRY', delayMs: 2500 }, { type: 'PLAY_SOUND', soundId: 'surprise', delayMs: 2500 }, { type: 'ACTOR_SPEECH', actorId: 'neko', text: 'ニャーーッ！？', delayMs: 3200 }, { type: 'ACTOR_MOVE', actorId: 'neko', to: [4600, 1650], speed: 420, wander: 160, delayMs: 3300 }, { type: 'FX', kind: 'stars', at: 'neko', delayMs: 3400 }],
      after: [{ actor: 'haruto', text: '悲鳴が 聞こえた！ ……キップ、梁から 飛び降りたって！？', delay: 5200 }] },

    // ── 腹ペコのハラダ ──
    { id: 'S5-E06', s: 'bento', t: 'harada', cat: 'FLAVOR', title: 'ハラダ、自分の弁当に食欲がわかない', say: '……またのり弁か。いや、ありがたいんだけどさ', anim: 'react.sad', route: 'S5.route.food',
      fx: [{ type: 'ACTOR_SET_STATE', actorId: 'harada', state: 'SAD' }] },
    { id: 'S5-E07', s: 'soba', t: 'harada', cat: 'FLAVOR', title: '立ちそばで弟を思い出すハラダ', say: 'かき揚げ……弟のやつ、いつも 俺のを 横取りしやがって！ 思い出したら 腹が立ってきた！', anim: 'react.angry', route: 'S5.route.food',
      fx: [{ type: 'ACTOR_SET_STATE', actorId: 'harada', state: 'ANGRY' }, { type: 'ACTOR_SPEECH', actorId: 'sobaya', text: 'お客さん、うちのかき揚げに 罪はないよ', delayMs: 2200 }] },
    { id: 'S5-E08', s: 'kiosk', t: 'harada', cat: 'FLAVOR', triggerCountMin: 3, title: 'さんざん迷って 特上駅弁', say: 'よし、決めた！ 特上 ひなた幕の内！', anim: 'react.eat', route: 'S5.route.food',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'harada', to: [4380, 1120], speed: 160 }, { type: 'ACTOR_MOVE', actorId: 'harada', to: [4420, 1500], speed: 160, delayMs: 2600 }, { type: 'ACTOR_SET_STATE', actorId: 'harada', state: 'HAPPY', delayMs: 2600 }, { type: 'ACTOR_SPEECH', actorId: 'clerk', text: 'ほらね、迷う人ほど 特上なのよ', delayMs: 2000 }] },

    // ── パンク駅員 ──
    { id: 'S5-E09', s: 'bandv', t: 'todoroki', cat: 'FLAVOR', title: 'パンク駅員、路上ライブに乱入', say: '……もう ガマンできねえ！ ギター貸せ！', anim: 'react.transform', route: 'S5.route.punk',
      fx: [{ type: 'ACTOR_APPEARANCE', actorId: 'todoroki', look: { hair: 'mohawk', hairColor: '#e33', acc: ['earring', 'sunglasses'] }, delayMs: 300 }, { type: 'ACTOR_MOVE', actorId: 'todoroki', to: [3330, 2120], speed: 320, wander: 30, delayMs: 500 }, { type: 'FX', kind: 'notes', at: 'bandv', delayMs: 3500 }, { type: 'PLAY_SOUND', soundId: 'fanfare', delayMs: 3500 }, { type: 'ACTOR_SPEECH', actorId: 'band2', text: '駅員さん、うますぎ！', delayMs: 4500 }, { type: 'ACTOR_SPEECH', actorId: 'masaki', text: 'け、けしからん……でも いい音だ', delayMs: 6000 }] },

    // ── 二日酔い ──
    { id: 'S5-E10', s: 'kiosk', t: 'yoichi', cat: 'BRANCH', group: 'S5-HANGOVER', title: 'ヨイチ、胃ぐすりで復活', say: 'おばちゃん、いちばん効くやつ……ゴクッ。……しゃっきり！', anim: 'react.sparkle', route: 'S5.route.food',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'yoichi', to: [4400, 1130], speed: 90 }, { type: 'ACTOR_APPEARANCE', actorId: 'yoichi', look: { skin: '#f2c9a0' }, delayMs: 2500 }, { type: 'ACTOR_SET_STATE', actorId: 'yoichi', state: 'HAPPY', delayMs: 2500 }, { type: 'FX', kind: 'sparkle', at: 'yoichi', delayMs: 2500 }] },
    { id: 'S5-E11', s: 'sakeposter', t: 'yoichi', cat: 'FLAVOR', group: 'S5-HANGOVER', decoy: true, title: 'ヨイチ、迎え酒で撃沈', say: 'そうだ……迎え酒だ……ひっく', anim: 'react.drink', route: 'S5.route.food',
      fx: [{ type: 'ACTOR_APPEARANCE', actorId: 'yoichi', look: { skin: '#e88a7a' }, delayMs: 1500 }, { type: 'ACTOR_ANIMATION', actorId: 'yoichi', animationId: 'react.fall', delayMs: 2200 }, { type: 'ACTOR_SET_STATE', actorId: 'yoichi', state: 'SAD', delayMs: 2200 }, { type: 'FX', kind: 'zzz', at: 'yoichi', delayMs: 3200 }, { type: 'ACTOR_SPEECH', actorId: 'clerk', text: 'あらあら、胃ぐすりに しとけば よかったのに', delayMs: 3600 }] },

    // ── 人さがし：メガネと家出少年 ──
    { id: 'S5-E12', s: 'glasses', t: 'maue', cat: 'CHAIN', title: 'マウエさん、頭の上のメガネを発見', say: 'おお、見える見える！ ……なんだ、この新聞、わしが出した尋ね人の広告じゃないか', anim: 'react.sparkle', route: 'S5.route.family',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'glasses' }, { type: 'ACTOR_APPEARANCE', actorId: 'maue', look: { acc: ['mustache', 'glasses'] } }, { type: 'SPAWN_OBJECT', objectId: 'newspaper', delayMs: 2400 }, { type: 'FX', kind: 'paper', at: 'newspaper', delayMs: 2400 }],
      after: [{ actor: 'maue', text: '同じのを 五部も 買っとった。一部 ここに 置いていこう。だれか 読んでくれんかな', delay: 3600 }] },
    { id: 'S5-E22', s: 'newspaper', t: 'kakeru', cat: 'PROGRESSION', requires: ['S5-E12'], title: '家出少年、尋ね人欄で父の想いを知る', say: '「カケルへ 怒ってないぞ ハンバーグ作って待ってる 父」……父さん……！', anim: 'react.sad', route: 'S5.route.family',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'newspaper' }, { type: 'ACTOR_MOVE', actorId: 'kakeru', to: [3640, 1480], speed: 300, wander: 20, delayMs: 1800 }, { type: 'ACTOR_APPEARANCE', actorId: 'kakeru', look: { sit: false }, delayMs: 1800 }, { type: 'ACTOR_SPEECH', actorId: 'kakeru', text: '父さーーん！', delayMs: 2200 }, { type: 'ACTOR_SPEECH', actorId: 'maue', text: 'カ、カケル！？', delayMs: 9000 }, { type: 'FX', kind: 'hearts', at: 'maue', delayMs: 9200 }, { type: 'ACTOR_SET_STATE', actorId: 'maue', state: 'HAPPY', delayMs: 9200 }] },

    // ── 駅長のカツラ ──
    { id: 'S5-E13', s: 'wig', t: 'ekicho', cat: 'BRANCH', group: 'S5-WIG', cond: [{ not: { flagEquals: { id: 'wig.flat', value: true } } }], title: '駅長、カツラを拾ってさっと装着', say: 'おっと、それは ワシの……いや、落とし物だ！ 拾得！', anim: 'react.embarrassed', route: 'S5.route.wig',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'ekicho', to: [7050, 1390], speed: 200 }, { type: 'HIDE_OBJECT', objectId: 'wig', delayMs: 1500 }, { type: 'ACTOR_APPEARANCE', actorId: 'ekicho', look: { hair: 'short' }, delayMs: 1600 }, { type: 'FX', kind: 'sparkle', at: 'ekicho', delayMs: 1600 }, { type: 'ACTOR_SPEECH', actorId: 'yoneda', text: '駅長、今 頭に なにか……', delayMs: 2800 }, { type: 'ACTOR_SPEECH', actorId: 'ekicho', text: 'なにも ないぞ。なにもな', delayMs: 4200 }] },
    { id: 'S5-E14', s: 'wig', t: 'hato', cat: 'FLAVOR', group: 'S5-WIG', title: 'ハト、カツラで巣づくり', say: 'クルッポー！（最高の巣材だ）', anim: 'react.happy', route: 'S5.route.wig',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'hato', to: [7050, 1450], speed: 300 }, { type: 'HIDE_OBJECT', objectId: 'wig', delayMs: 1600 }, { type: 'ACTOR_MOVE', actorId: 'hato', to: [8000, 440], speed: 260, wander: 0, delayMs: 1700 }, { type: 'SPAWN_OBJECT', objectId: 'pigeonnest', delayMs: 5600 }, { type: 'ACTOR_SPEECH', actorId: 'ekicho', text: 'ワ、ワシの……あああ……', delayMs: 3000 }, { type: 'ACTOR_SET_STATE', actorId: 'ekicho', state: 'SAD', delayMs: 3000 }] },
    { id: 'S5-E15', s: 'wig', t: 'ekicho', cat: 'BRANCH', group: 'S5-WIG', cond: [{ flagEquals: { id: 'wig.flat', value: true } }], title: '駅長、ペッタンコのカツラをかぶる', say: 'ペッタンコでも ワシのは ワシのじゃ……！', anim: 'react.sad', route: 'S5.route.wig',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'ekicho', to: [7050, 1390], speed: 160 }, { type: 'HIDE_OBJECT', objectId: 'wig', delayMs: 1500 }, { type: 'ACTOR_APPEARANCE', actorId: 'ekicho', look: { hair: 'topknot' }, delayMs: 1600 }, { type: 'ACTOR_SPEECH', actorId: 'sumo', text: 'おお、駅長どの、いい髷でごわす', delayMs: 3200 }] },

    // ── 1番線のドア ──
    { id: 'S5-E16', s: 'hazama', t: 'yoneda', cat: 'FLAVOR', cond: [vis('train1')], title: '新人駅員、はさまった女性を押しこむ', say: 'お客さま、失礼します！ せーのっ！', anim: 'react.run', route: 'S5.route.train',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'yoneda', to: [6930, 930], speed: 240 }, { type: 'FX', kind: 'stars', at: 'hazama', delayMs: 1800 }, { type: 'ACTOR_SPEECH', actorId: 'hazama', text: 'は、入れたー！', delayMs: 1900 }, { type: 'ACTOR_HIDE', actorId: 'hazama', delayMs: 2300 }, { type: 'ACTOR_MOVE', actorId: 'yoneda', pathId: 'yonedaBeat', delayMs: 3500 }] },
    { id: 'S5-E17', s: 'tsumeta', t: 'yoneda', cat: 'FLAVOR', cond: [vis('train1')], title: '新人駅員、係長のおなかを押しこむ', say: 'おなか、引っこめてくださーい！ えいっ！', anim: 'react.hit', route: 'S5.route.train',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'yoneda', to: [7930, 930], speed: 240 }, { type: 'FX', kind: 'stars', at: 'tsumeta', delayMs: 1800 }, { type: 'ACTOR_SPEECH', actorId: 'tsumeta', text: 'ぐえっ……乗れた……', delayMs: 1900 }, { type: 'ACTOR_HIDE', actorId: 'tsumeta', delayMs: 2300 }, { type: 'ACTOR_MOVE', actorId: 'yoneda', pathId: 'yonedaBeat', delayMs: 3500 }] },

    // ── 手配犯 ──
    { id: 'S5-E18', s: 'hannin', t: 'police', cat: 'PROGRESSION', title: '指名手配犯、確保！', say: 'む、この顔！ 手配書の男！ 待てーい！', anim: 'react.run', route: 'S5.route.lost',
      fx: [{ type: 'PLAY_SOUND', soundId: 'whistle' }, { type: 'ACTOR_MOVE', actorId: 'police', to: [8150, 1860], speed: 420, delayMs: 300 }, { type: 'ACTOR_SPEECH', actorId: 'hannin', text: 'げっ！ なんで ここが……！', delayMs: 2000 }, { type: 'ACTOR_MOVE', actorId: 'hannin', to: [9000, 1900], speed: 260, delayMs: 2000 }, { type: 'FX', kind: 'smoke', at: 'hannin', delayMs: 9000 }, { type: 'ACTOR_HIDE', actorId: 'hannin', delayMs: 9500 }, { type: 'ACTOR_SPEECH', actorId: 'police', text: '確保ーっ！ 本官、やりました！', delayMs: 9600 }, { type: 'ACTOR_MOVE', actorId: 'police', pathId: 'policeBeat', delayMs: 12000 }] },

    // ── ラブレター ──
    { id: 'S5-E19', s: 'letter', t: 'momoka', cat: 'BRANCH', group: 'S5-LETTER', title: 'モモカ、ラブレターに大よろこび', say: '「いつも 2番線で 見てます」……きゃー！ だれだろ！', anim: 'react.love', route: 'S5.route.misc',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'letter' }, { type: 'ACTOR_SET_STATE', actorId: 'momoka', state: 'HAPPY' }, { type: 'ACTOR_SPEECH', actorId: 'gal1', text: 'え〜！ モモカ、すご〜い！', delayMs: 2200 }] },
    { id: 'S5-E20', s: 'letter', t: 'rikiya', cat: 'FLAVOR', group: 'S5-LETTER', decoy: true, title: 'こわもて、ラブレターを勘ちがい', say: 'お、お、オレに……！？ ……まいったな、照れるぜ', anim: 'react.embarrassed', route: 'S5.route.misc',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'letter' }, { type: 'ACTOR_SET_STATE', actorId: 'rikiya', state: 'EMBARRASSED' }, { type: 'FX', kind: 'hearts', at: 'rikiya', delayMs: 800 }, { type: 'ACTOR_SPEECH', actorId: 'momoka', text: 'あれ？ 落ちてた手紙、なくなってる', delayMs: 3000 }] },

    // ── 黄色い点検車と力士 ──
    { id: 'S5-E21', s: 'ytrain', t: 'sumo', cat: 'PROGRESSION', title: '力士、黄色い点検車に無理やり乗車', say: '幸せの黄色い電車！ ごっつぁんです！！', anim: 'react.run', route: 'S5.route.train', focus: true,
      fx: [{ type: 'ACTOR_MOVE', actorId: 'sumo', to: [7300, 2040], speed: 280 }, { type: 'PLAY_SOUND', soundId: 'crash', delayMs: 1800 }, { type: 'FX', kind: 'big', at: 'ytrain', delayMs: 1800 }, { type: 'OBJECT_APPEARANCE', objectId: 'ytrain', look: { rot: 0.03 }, delayMs: 1900 }, { type: 'ACTOR_HIDE', actorId: 'sumo', delayMs: 2000 }, { type: 'ACTOR_SPEECH', actorId: 'pspeaker', text: 'お客さま！ 点検車には ご乗車 いただけません！ お客さまーっ！', delayMs: 2600 }, { type: 'ACTOR_SPEECH', actorId: 'tettei', text: '車体が かたむいてる……！', delayMs: 4200 }] },

    // ── 押し屋 ──
    { id: 'S5-E23', s: 'train2', t: 'kumade', cat: 'CHAIN', title: '押し屋、3人まとめて押しこむ', say: 'ドアの数だけ 押してやる！ どっせーい！！', anim: 'react.hit', route: 'S5.route.train',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'kumade', to: [7700, 1640], speed: 260 }, { type: 'FX', kind: 'big', at: 'p2', delayMs: 1600 }, { type: 'PLAY_SOUND', soundId: 'hit', delayMs: 1600 }, { type: 'ACTOR_HIDE', actorId: 'p1', delayMs: 1800 }, { type: 'ACTOR_HIDE', actorId: 'p2', delayMs: 1900 }, { type: 'ACTOR_HIDE', actorId: 'p3', delayMs: 2000 }, { type: 'ACTOR_SET_STATE', actorId: 'kumade', state: 'HAPPY', delayMs: 2200 }, { type: 'ACTOR_SPEECH', actorId: 'comm1', text: 'すげえ……三人 いっぺんに', delayMs: 3200 }],
      after: [{ actor: 'kumade', text: 'ふう……押すものが なくなると さみしいな', delay: 4400 }] },

    // ── ノブオの社会の窓 ──
    { id: 'S5-E24', s: 'gal1', t: 'nobuo', cat: 'FLAVOR', blocksIfCompleted: ['S5-E25'], title: 'ノブオ、うわさ話に照れる', say: 'あの子たち、オレのこと 話してる……？ まいったなあ', anim: 'react.embarrassed', route: 'S5.route.zip',
      fx: [{ type: 'ACTOR_SET_STATE', actorId: 'nobuo', state: 'EMBARRASSED' }, { type: 'ACTOR_SPEECH', actorId: 'gal2', text: 'ちがうってば、見てるのは そこじゃなくて……ぷぷっ', delayMs: 2200 }],
      after: [{ actor: 'gal1', text: '下のほう、気づいて〜', delay: 3800 }] },
    { id: 'S5-E25', s: 'zipper', t: 'nobuo', cat: 'CHAIN', group: 'S5-ZIP', requires: ['S5-E24'], title: 'ノブオ、社会の窓に気づく', say: 'うわあああ！ 全開！？ だから風通しが……！', anim: 'react.embarrassed', route: 'S5.route.zip',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'zipper' }, { type: 'ACTOR_SET_STATE', actorId: 'nobuo', state: 'EMBARRASSED' }, { type: 'ACTOR_SPEECH', actorId: 'nobuo', text: 'さむっ……は、は、はっ……', delayMs: 2600 }],
      after: [{ actor: 'sobaya', text: 'くしゃみってのは、出そうで出ないのが いちばん つらいねえ', delay: 4200 }] },
    { id: 'S5-E26', s: 'curler', t: 'nobuo', cat: 'CHAIN', title: 'ノブオ、姉のカーラーに気づく', say: 'これ、姉ちゃんの カーラー！ 近くに いるのか？', anim: 'react.think', route: 'S5.route.zip',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'nobuo', text: '姉ちゃーん！ いるんだろー！', delayMs: 1200 }, { type: 'ACTOR_MOVE', actorId: 'sanae', to: [4220, 1740], speed: 300, wander: 40, delayMs: 2000 }, { type: 'ACTOR_SPEECH', actorId: 'sanae', text: 'あら、ノブオ。大声で 呼ばないでよ', delayMs: 14000 }] },
    { id: 'S5-E27', s: 'shichimi', t: 'nobuo', cat: 'FLAVOR', requires: ['S5-E25'], title: '七味で 特大くしゃみ', say: 'は……は……ハーーックション！！！', anim: 'react.surprised', route: 'S5.route.zip',
      fx: [{ type: 'FX', kind: 'big', at: 'nobuo', delayMs: 300 }, { type: 'PLAY_SOUND', soundId: 'boom', delayMs: 300 }, { type: 'FX', kind: 'leaves', at: 'nobuo', delayMs: 500 }, { type: 'ACTOR_SET_STATE', actorId: 'nobuo', state: 'HAPPY', delayMs: 1500 }, { type: 'ACTOR_SPEECH', actorId: 'gal1', text: 'きゃっ！ 風が！', delayMs: 1600 }] },
    { id: 'S5-E40', s: 'curler', t: 'sanae', cat: 'FLAVOR', title: 'サナエ、カーラーを見つける', say: 'あった！ 私のカーラー。……って、まだ 頭に つけてたの 私！？', anim: 'react.embarrassed', route: 'S5.route.zip',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'sanae', to: [6150, 1270], speed: 200 }, { type: 'HIDE_OBJECT', objectId: 'curler', delayMs: 3500 }, { type: 'ACTOR_SET_STATE', actorId: 'sanae', state: 'EMBARRASSED', delayMs: 3500 }] },
    { id: 'S5-E41', s: 'nobuo', t: 'sanae', cat: 'FLAVOR', group: 'S5-ZIP', title: '姉、弟の社会の窓を発見', say: 'ノブオ！ あんた 社会の窓 全開よ！ もう、恥ずかしい！', anim: 'react.angry', route: 'S5.route.zip',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'zipper' }, { type: 'ACTOR_SET_STATE', actorId: 'nobuo', state: 'EMBARRASSED', delayMs: 800 }, { type: 'ACTOR_SPEECH', actorId: 'nobuo', text: '姉ちゃんこそ カーラー つけたままじゃん！', delayMs: 2400 }] },

    // ── 露店と迷い人 ──
    { id: 'S5-E28', s: 'stall', t: 'police', cat: 'CHAIN', title: '巡査、無許可の露店を注意', say: 'こら！ ここで 物を売っちゃいかん！', anim: 'react.angry', route: 'S5.route.lost',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'police', to: [2080, 1300], speed: 260 }, { type: 'ACTOR_SPEECH', actorId: 'vendor', text: 'へいへい、店じまい 店じまい……', delayMs: 2600 }, { type: 'HIDE_OBJECT', objectId: 'stall', delayMs: 3600 }, { type: 'FX', kind: 'smoke', at: 'stall', delayMs: 3500 }, { type: 'ACTOR_MOVE', actorId: 'vendor', to: [700, 2050], speed: 140, wander: 60, delayMs: 3600 }, { type: 'ACTOR_MOVE', actorId: 'police', to: [1700, 1450], speed: 120, wander: 40, delayMs: 4000 }],
      after: [{ actor: 'minami', text: 'あっ、露店が どいたら 案内図が 見える！', delay: 4800 }] },
    { id: 'S5-E29', s: 'guide', t: 'minami', cat: 'PROGRESSION', group: 'S5-HOSPITAL', requires: ['S5-E28'], title: 'ミナミさん、案内図で病院への道を知る', say: 'なるほど、バスで 三つ目ね！ 赤ちゃん、今いくわよ〜！', anim: 'react.happy', route: 'S5.route.lost',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'minami', to: [820, 1080], speed: 200, wander: 0 }, { type: 'ACTOR_SET_STATE', actorId: 'minami', state: 'HAPPY' }, { type: 'PLAY_SOUND', soundId: 'vehicle', delayMs: 5500 }, { type: 'ACTOR_HIDE', actorId: 'minami', delayMs: 6000 }] },
    { id: 'S5-E30', s: 'police', t: 'minami', cat: 'FLAVOR', group: 'S5-HOSPITAL', requires: ['S5-E28'], decoy: true, title: '巡査の道案内で ますます迷う', say: 'おまわりさん、病院は……「右、左、右、たぶん右」？ ……もっと わからなくなったわ', anim: 'react.spin', route: 'S5.route.lost',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'police', text: '本官、道案内は 少しだけ……すまない', delayMs: 2200 }, { type: 'ACTOR_MOVE', actorId: 'minami', to: [300, 1800], speed: 160, wander: 200, delayMs: 2600 }] },

    // ── ギャルと父 ──
    { id: 'S5-E31', s: 'kirara', t: 'iwao', cat: 'BRANCH', group: 'S5-REUNION', title: '父、ギャルになった娘と再会', say: 'この写真の子は……キ、キララ！？ 真っ黒じゃないか！ ……でも、元気そうで よかった', anim: 'react.surprised', route: 'S5.route.family',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'iwao', to: [1380, 1990], speed: 280, wander: 30, delayMs: 1200 }, { type: 'ACTOR_SPEECH', actorId: 'kirara', text: 'パパ！？ 来るの おそ〜い！', delayMs: 12000 }, { type: 'FX', kind: 'hearts', at: 'kirara', delayMs: 12200 }] },
    { id: 'S5-E32', s: 'iwao', t: 'kirara', cat: 'BRANCH', group: 'S5-REUNION', title: '娘、ホームの父を見つける', say: 'え、これ パパじゃん！ ホームで 待ってたの！？ マジうける〜！', anim: 'react.laugh', route: 'S5.route.family',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'kirara', to: [8720, 1720], speed: 300, wander: 30, delayMs: 1000 }, { type: 'ACTOR_SPEECH', actorId: 'iwao', text: 'だ、だれだ君は……キララ！？ キララなのか！？', delayMs: 12500 }, { type: 'FX', kind: 'hearts', at: 'iwao', delayMs: 12700 }] },

    // ── トイレとティッシュ ──
    { id: 'S5-E33', s: 'wc', t: 'raita', cat: 'CHAIN', title: 'ライタ、トイレに駆けこむも紙がない', say: 'あった、トイレ！！ ……って、紙が ない！？', anim: 'react.run', route: 'S5.route.toilet',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'raita', to: [2760, 1040], speed: 360, wander: 0 }, { type: 'ACTOR_SET_STATE', actorId: 'raita', state: 'SCARED', delayMs: 4000 }, { type: 'ACTOR_SPEECH', actorId: 'raita', text: 'だれか〜！ 紙〜！ 紙を〜！！', delayMs: 4600 }] },
    { id: 'S5-E34', s: 'tissuebox', t: 'hanami', cat: 'FLAVOR', title: 'ハナミ、10円ティッシュで鼻をかむ', say: '10円で 買えるの！？ ……チーーーン！ 生き返った！', anim: 'react.happy', route: 'S5.route.toilet',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'hanami', to: [2880, 1080], speed: 200 }, { type: 'FX', kind: 'paper', at: 'hanami', delayMs: 2200 }, { type: 'PLAY_SOUND', soundId: 'laugh', delayMs: 2200 }] },
    { id: 'S5-E35', s: 'tissue', t: 'raita', cat: 'PROGRESSION', requires: ['S5-E33'], title: 'ライタ、紙を確保して生還', say: 'ティッシュ！！ 神さま……いや、紙さま……！', anim: 'react.sparkle', route: 'S5.route.toilet',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'tissue' }, { type: 'FX', kind: 'sparkle', at: 'raita', delayMs: 600 }, { type: 'ACTOR_SET_STATE', actorId: 'raita', state: 'HAPPY', delayMs: 3500 }, { type: 'ACTOR_MOVE', actorId: 'raita', to: [3600, 1950], speed: 120, wander: 120, delayMs: 5000 }] },

    // ── 背の高い人と鍵 ──
    { id: 'S5-E36', s: 'komachi', t: 'takagi', cat: 'CHAIN', title: 'ノッポ、券売機のボタンを押してあげる', say: 'いちばん上のボタン？ はい、ポチッとな', anim: 'react.happy', route: 'S5.route.lost',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'takagi', to: [3150, 1090], speed: 200 }, { type: 'PLAY_SOUND', soundId: 'pop', delayMs: 2000 }, { type: 'SPAWN_OBJECT', objectId: 'key', delayMs: 2200 }, { type: 'PLAY_SOUND', soundId: 'bell', delayMs: 2200 }, { type: 'ACTOR_SPEECH', actorId: 'komachi', text: 'ありがとう！ ……あら、いま チャリンって 鳴らなかった？', delayMs: 2800 }, { type: 'ACTOR_MOVE', actorId: 'takagi', to: [3320, 1260], speed: 100, wander: 90, delayMs: 4500 }] },
    { id: 'S5-E37', s: 'key', t: 'takagi', cat: 'BRANCH', group: 'S5-KEY', requires: ['S5-E36'], blocksIfCompleted: ['S5-E38'], title: 'ノッポ、落とした鍵に気づく', say: 'クマちゃん！ オレの鍵！ いつのまに！', anim: 'react.surprised', route: 'S5.route.lost',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'key', delayMs: 1200 }, { type: 'ACTOR_SET_STATE', actorId: 'takagi', state: 'HAPPY', delayMs: 1200 }] },
    { id: 'S5-E38', s: 'key', t: 'police', cat: 'CHAIN', requires: ['S5-E36'], title: '巡査、落とし物の鍵を掲示する', say: 'クマの鍵の 落とし物。本官が 掲示しておこう', anim: 'react.think', route: 'S5.route.lost',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'key', delayMs: 400 }, { type: 'ACTOR_MOVE', actorId: 'police', to: [3640, 1100], speed: 300, delayMs: 400 }, { type: 'OBJECT_APPEARANCE', objectId: 'lostboard', look: { sign: { text: '落とし物：🔑クマの鍵', fill: '#fff8d8', color: '#c33', s: 18 } }, delayMs: 6000 }, { type: 'FX', kind: 'paper', at: 'lostboard', delayMs: 6000 }, { type: 'ACTOR_MOVE', actorId: 'police', pathId: 'policeBeat', delayMs: 9000 }],
      after: [{ actor: 'takagi', text: 'あれ？ オレの鍵……ない！ どこかに 届いてないかな', delay: 7500 }] },
    { id: 'S5-E39', s: 'lostboard', t: 'takagi', cat: 'PROGRESSION', group: 'S5-KEY', requires: ['S5-E38'], title: 'ノッポ、掲示板で鍵を取りもどす', say: '「クマの鍵」……オレのだ！ 掲示板って 便利だな', anim: 'react.happy', route: 'S5.route.lost',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'takagi', to: [3640, 1100], speed: 200, wander: 60 }, { type: 'OBJECT_APPEARANCE', objectId: 'lostboard', look: { sign: { text: '落とし物のお知らせ', fill: '#fff8d8', color: '#333', s: 18 } }, delayMs: 2500 }, { type: 'FX', kind: 'sparkle', at: 'takagi', delayMs: 2500 }] },

    // ── パンクとマナー ──
    { id: 'S5-E42', s: 'speaker', t: 'togemaru', cat: 'FLAVOR', title: 'マナー放送にパンクが逆ギレ', say: 'ああ！？ 床に座って 何が悪い！ 放送のくせに 生意気だぞ！', anim: 'react.angry', route: 'S5.route.punk',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'speaker', text: 'ピンポンパーン♪ ……床に 座らないでください', delayMs: 2200 }, { type: 'ACTOR_SET_STATE', actorId: 'togemaru', state: 'ANGRY' }] },
    { id: 'S5-E43', s: 'masaki', t: 'togemaru', cat: 'FLAVOR', title: 'マナー男とパンク、にらみあい', say: 'あぁん？ オッサン、文句あんのか？', anim: 'react.angry', route: 'S5.route.punk',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'masaki', to: [4480, 2150], speed: 160 }, { type: 'ACTOR_SPEECH', actorId: 'masaki', text: '大ありだ！ 床は 座る場所ではない！', delayMs: 2200 }, { type: 'FX', kind: 'lightning', at: 'masaki', delayMs: 3000 }, { type: 'ACTOR_SET_STATE', actorId: 'masaki', state: 'ANGRY', delayMs: 3000 }, { type: 'ACTOR_MOVE', actorId: 'masaki', to: [4300, 1960], speed: 120, wander: 70, delayMs: 6000 }] },
    { id: 'S5-E44', s: 'koeyama', t: 'masaki', cat: 'CHAIN', title: 'マナー男、大声電話を退場させる', say: 'そこの きみ！ 構内での 大声の通話は 迷惑だ！ 外で やりなさい！', anim: 'react.angry', route: 'S5.route.punk',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'masaki', to: [4250, 1200], speed: 200 }, { type: 'ACTOR_SPEECH', actorId: 'koeyama', text: 'あ……すみません……', delayMs: 2600 }, { type: 'ACTOR_MOVE', actorId: 'koeyama', to: [700, 1350], speed: 160, wander: 80, delayMs: 3200 }, { type: 'ACTOR_MOVE', actorId: 'masaki', to: [4300, 1960], speed: 120, wander: 70, delayMs: 5000 }],
      after: [{ actor: 'togemaru', text: '……おい。電話野郎が どいたら……あのポスター……', delay: 6500 }] },
    { id: 'S5-E45', s: 'idolposter', t: 'togemaru', cat: 'CHAIN', requires: ['S5-E44'], title: 'パンク、アイドルのポスターに一目ぼれ', say: 'ル……ルルちゃん……！ か、かわいい……！', anim: 'react.love', route: 'S5.route.punk',
      fx: [{ type: 'ACTOR_APPEARANCE', actorId: 'togemaru', look: { sit: false } }, { type: 'ACTOR_MOVE', actorId: 'togemaru', to: [4180, 1150], speed: 260, wander: 0, delayMs: 600 }, { type: 'ACTOR_SET_STATE', actorId: 'togemaru', state: 'HAPPY', delayMs: 600 }, { type: 'ACTOR_SPEECH', actorId: 'togemaru', text: 'こ、これ……持って帰りてえ……（ペリペリ）', delayMs: 5200 }, { type: 'OBJECT_APPEARANCE', objectId: 'idolposter', look: { rot: 0.15 }, delayMs: 5600 }] },
    { id: 'S5-E46', s: 'togemaru', t: 'police', cat: 'PROGRESSION', requires: ['S5-E45'], title: '巡査、ポスター泥棒を未然に防ぐ', say: 'こらこら！ ポスターは 駅のものだ！ ファンなら 正々堂々 ライブに行きなさい', anim: 'react.angry', route: 'S5.route.punk',
      fx: [{ type: 'PLAY_SOUND', soundId: 'whistle' }, { type: 'ACTOR_MOVE', actorId: 'police', to: [4300, 1200], speed: 400 }, { type: 'OBJECT_APPEARANCE', objectId: 'idolposter', look: { rot: 0 }, delayMs: 5500 }, { type: 'ACTOR_SPEECH', actorId: 'togemaru', text: '……ライブ、行く。チケット 買う……', delayMs: 6000 }, { type: 'ACTOR_SET_STATE', actorId: 'togemaru', state: 'SAD', delayMs: 6000 }, { type: 'ACTOR_MOVE', actorId: 'police', pathId: 'policeBeat', delayMs: 9000 }] },

    // ── トイレをさがすウメばあちゃん ──
    { id: 'S5-E47', s: 'ume', t: 'pwc', cat: 'PROGRESSION', title: 'ウメばあちゃん、外のトイレにたどりつく', anim: 'react.happy', route: 'S5.route.toilet', focus: true,
      fx: [{ type: 'ACTOR_MOVE', actorId: 'ume', to: [1690, 1060], speed: 300, wander: 0 }, { type: 'ACTOR_SPEECH', actorId: 'ume', text: 'あったわ〜！ 失礼しますよ！', delayMs: 800 }, { type: 'ACTOR_SPEECH', actorId: 'cleaner', text: 'おばあちゃん、どうぞ どうぞ！ ちょうど 終わったところ！', delayMs: 1300 }, { type: 'HIDE_OBJECT', objectId: 'cleaningsign', delayMs: 1500 }, { type: 'ACTOR_SET_STATE', actorId: 'cleaner', state: 'HAPPY', delayMs: 1500 }, { type: 'SPAWN_OBJECT', objectId: 'niboshi', delayMs: 2000 }, { type: 'ACTOR_HIDE', actorId: 'ume', delayMs: 9000 }, { type: 'ACTOR_SHOW', actorId: 'ume', delayMs: 14000 }, { type: 'ACTOR_SPEECH', actorId: 'ume', text: 'ああ すっきり。あら、煮干しの袋 落としちゃった。ネコちゃんにでも あげてね', delayMs: 14500 }, { type: 'ACTOR_MOVE', actorId: 'ume', to: [3420, 1080], speed: 120, wander: 40, delayMs: 16000 }, { type: 'OBJECT_APPEARANCE', objectId: 'dengon', look: { sign: { text: 'ハヤミさんへ ハラダは そば屋の前 ウメ', fill: '#2a4a3a', color: '#fff', s: 14 } }, delayMs: 16000 }, { type: 'ACTOR_SPEECH', actorId: 'neko', text: 'ニャ……？（いいにおい……）', delayMs: 3000 }, { type: 'ACTOR_SET_STATE', actorId: 'neko', state: 'HAPPY', delayMs: 3000 }],
      after: [{ actor: 'haruto', text: 'キップが ごろごろ言ってる……おなか いっぱいみたい！', delay: 6000 }] },
    { id: 'S5-E48', s: 'hayami', t: 'dengon', cat: 'PROGRESSION', requires: ['S5-E47'], title: '遅刻妻、伝言板で夫の居場所を知る', anim: 'react.sparkle', route: 'S5.route.family',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'hayami', to: [3420, 1100], speed: 320 }, { type: 'ACTOR_SPEECH', actorId: 'hayami', text: '「ハラダは そば屋の前」……お義母さん、ナイス！', delayMs: 1200 }, { type: 'ACTOR_MOVE', actorId: 'hayami', to: [4500, 1520], speed: 280, wander: 20, delayMs: 2500 }, { type: 'ACTOR_SPEECH', actorId: 'harada', text: 'おそいぞ〜！ ……まあ、いいか。駅弁 半分こ しよう', delayMs: 7000 }, { type: 'FX', kind: 'hearts', at: 'harada', delayMs: 7200 }, { type: 'ACTOR_SET_STATE', actorId: 'harada', state: 'HAPPY', delayMs: 7200 }] },
    { id: 'S5-E49', s: 'pwc', t: 'ayane', cat: 'FLAVOR', group: 'S5-CHANGE', blocksIfCompleted: ['S5-E47'], title: '公衆トイレは清掃中', say: '着がえさせて……え、清掃中？ ……あと どれくらい？', anim: 'react.sad', route: 'S5.route.toilet',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'ayane', to: [1600, 1100], speed: 200 }, { type: 'ACTOR_SPEECH', actorId: 'cleaner', text: 'ごめんね、ピカピカに なるまで ダメ！', delayMs: 2200 }, { type: 'ACTOR_SET_STATE', actorId: 'ayane', state: 'SAD', delayMs: 3000 }, { type: 'ACTOR_MOVE', actorId: 'ayane', to: [1150, 1750], speed: 120, wander: 60, delayMs: 3600 }] },
    { id: 'S5-E50', s: 'pwc', t: 'ayane', cat: 'PROGRESSION', group: 'S5-CHANGE', requires: ['S5-E47'], title: 'アヤネ、トイレでドレスに変身', say: 'あいた！ 3分で 着がえてくる！', anim: 'react.happy', route: 'S5.route.toilet',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'ayane', to: [1650, 1080], speed: 260, wander: 0 }, { type: 'ACTOR_HIDE', actorId: 'ayane', delayMs: 3000 }, { type: 'ACTOR_APPEARANCE', actorId: 'ayane', look: { shirt: '#c83a6a', pants: '#c83a6a', skirt: true, hair: 'long', acc: ['earring', 'flower'] }, delayMs: 3500 }, { type: 'ACTOR_SHOW', actorId: 'ayane', delayMs: 7000 }, { type: 'FX', kind: 'sparkle', at: 'ayane', delayMs: 7100 }, { type: 'ACTOR_MOVE', actorId: 'ayane', to: [1150, 1750], speed: 140, wander: 60, delayMs: 7500 }, { type: 'ACTOR_SPEECH', actorId: 'rikiya', text: '……き、きれいだ', delayMs: 9000 }] },

    // ── 終わり ──
    { id: 'S5-E51', s: 'neko', t: 'haruto', cat: 'TIMEOUT', title: '駅ネコ、お昼寝タイムに突入', say: 'ああ……キップ、寝ちゃった。今日は 撮れなかったな……', anim: 'react.timeout', route: 'S5.route.end',
      fx: [{ type: 'FX', kind: 'zzz', at: 'neko' }, { type: 'ACTOR_SET_STATE', actorId: 'haruto', state: 'SAD' }, { type: 'ACTOR_SPEECH', actorId: 'pspeaker', text: '本日の 撮影可能時間は 終了しました……', delayMs: 1600 }] },
    { id: 'S5-E52', s: 'neko', t: 'haruto', cat: 'TERMINAL', requires: ['S5-E05', 'S5-E47'], title: '駅ネコ、一日駅長に就任！', say: 'キップ！ そこで ストップ……今だ！！', anim: 'react.terminal', route: 'S5.route.end',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'neko', to: [9620, 1860], speed: 900, wander: 0 }, { type: 'FX', kind: 'flash', at: 'haruto', delayMs: 1200 }, { type: 'PLAY_SOUND', soundId: 'capture', delayMs: 1200 }, { type: 'ACTOR_SPEECH', actorId: 'neko', text: 'ニャッ！（キリッ）', delayMs: 1500 }, { type: 'FX', kind: 'confetti', at: 'neko', delayMs: 2000 }, { type: 'PLAY_SOUND', soundId: 'fanfare', delayMs: 2000 }, { type: 'ACTOR_SPEECH', actorId: 'pspeaker', text: 'ピンポンパーン♪ 本日 駅ネコ キップを 一日駅長に 任命いたします！', delayMs: 2400 }, { type: 'ACTOR_SPEECH', actorId: 'ekicho', text: 'うむ。帽子は ワシのを 貸してやろう', delayMs: 3200 }, { type: 'ACTOR_SPEECH', actorId: 'beniko', text: 'トマトまみれでも 見に行かなきゃ！', delayMs: 3600 }, { type: 'WAIT', durationMs: 4200 }] },
  ],
};
