// ステージ6：遊園地（53 イベント・最終ステージ）。登場人物・台詞はすべてオリジナル。
// 独立したミニストーリーを園内いっぱいに並列配置し、最後に「なんでも答えまショー」のフィナーレで全員が集まる。
const done = id => ({ eventDone: id });
const notDone = id => ({ eventNotDone: id });
const cnt = (id, value) => ({ countAtLeast: { id, value } });
const QA = 'S6-qa';
const qa = { type: 'INCREMENT_COUNTER', id: QA, amount: 1 };

// ── 背景の繰り返し部品 ──
const tree = (x, y, s = 110) => ({ t: 'emoji', e: '🌳', x, y, s });
const lamp = x => [{ t: 'rect', x: x - 5, y: 1010, w: 10, h: 150, fill: '#5b5b6b' }, { t: 'ellipse', x, y: 1005, rx: 22, ry: 14, fill: '#ffe9a8', stroke: '#5b5b6b' }];
const flag = (x, c) => [{ t: 'line', pts: [x, 980, x, 860], stroke: '#777', w: 4 }, { t: 'poly', pts: [x, 860, x + 46, 875, x, 892], fill: c }];
const bench = (x, y) => [{ t: 'rect', x, y, w: 150, h: 16, fill: '#9a6a3a', r: 4 }, { t: 'rect', x: x + 10, y: y + 16, w: 10, h: 26, fill: '#555' }, { t: 'rect', x: x + 130, y: y + 16, w: 10, h: 26, fill: '#555' }];
const garland = (x1, x2, y) => [{ t: 'line', pts: [x1, y, (x1 + x2) / 2, y + 40, x2, y], stroke: '#fff', w: 3 },
  ...[0.15, 0.35, 0.5, 0.65, 0.85].map((f, i) => ({ t: 'emoji', e: ['🔴', '🟡', '🔵', '🟢', '🟣'][i], x: x1 + (x2 - x1) * f, y: y + 40 * (1 - Math.abs(f - 0.5) * 2) + 10, s: 22 }))];

// ジェットコースターのレール（車両の足もと座標と同じ）
const COASTER = [[1600, 1180], [1780, 1180], [1900, 760], [2050, 430], [2200, 600], [2330, 960], [2480, 720], [2600, 520], [2760, 700], [2880, 1020], [2720, 1150], [2300, 1170], [1950, 1180], [1600, 1180]];
// 海賊船のふりこ（支点 6000,480）
const SHIP = [-55, -35, -15, 0, 15, 35, 55, 35, 15, 0, -15, -35].map(a => [Math.round(6000 + 430 * Math.sin(a * Math.PI / 180)), Math.round(480 + 430 * Math.cos(a * Math.PI / 180))]);

export default {
  id: 'S6', title: 'ハテナランドの長い一日', subtitle: '遊園地', theme: '遊園地',
  intro: '日曜日の遊園地「ハテナランド」。迷子、カツラ、デート、幽霊……園内のあちこちで小さな事件が起きている。目玉はステージの「なんでも答えまショー」！',
  timeLimitMs: 330000,
  world: { width: 9000, height: 2700, minZoom: 0.75, maxZoom: 4, bg: '#bfe6ff', spawnCamera: { x: 1300, y: 1500, zoom: 1 } },
  bgm: { tempo: 128, key: 5, mood: 'major' },
  clearEventId: 'S6-E53', timeoutEventId: null,
  routes: {
    'S6.route.show': 'なんでも答えまショー', 'S6.route.mina': '迷子のミナ', 'S6.route.wig': 'カツラの紳士と息子', 'S6.route.clean': 'いたずら小僧と空き缶',
    'S6.route.date': 'デート中のふたり', 'S6.route.shoot': '射的とメガネの親子', 'S6.route.monster': '怪獣ショーとお化け屋敷',
    'S6.route.paint': '似顔絵コーナー', 'S6.route.dialect': '方言カップル', 'S6.route.misc': '園内のあれこれ', 'S6.route.end': 'フィナーレ',
  },
  scenery: [
    // 空・遠景
    { t: 'rect', x: 0, y: 0, w: 9000, h: 420, fill: '#a6dbff' },
    { t: 'emoji', e: '☀️', x: 4500, y: 140, s: 120 },
    ...[[600, 160], [2300, 110], [3700, 220], [5300, 130], [7000, 190], [8400, 120]].map(([x, y]) => ({ t: 'emoji', e: '☁️', x, y, s: 130 })),
    { t: 'poly', pts: [0, 1000, 700, 760, 1500, 900, 2600, 780, 3600, 920, 5000, 800, 6400, 900, 7600, 780, 9000, 880, 9000, 1000], fill: '#9fd39a' },
    // 地面と園路
    { t: 'rect', x: 0, y: 1000, w: 9000, h: 1700, fill: '#8fcf7a' },
    { t: 'rect', x: 0, y: 1150, w: 9000, h: 1250, fill: '#e9d7b0' },
    { t: 'stripes', x: 0, y: 1150, w: 9000, h: 1250, dir: 'v', n: 45, c1: 'rgba(0,0,0,0)', c2: 'rgba(160,120,70,.08)' },
    { t: 'rect', x: 0, y: 2400, w: 9000, h: 300, fill: '#7cc069' },
    { t: 'fence', x: 0, y: 2420, w: 9000, h: 40, fill: '#d9c08a' },
    // 入場ゲート
    { t: 'rect', x: 80, y: 700, w: 60, h: 460, fill: '#e2574c' }, { t: 'rect', x: 460, y: 700, w: 60, h: 460, fill: '#e2574c' },
    { t: 'rect', x: 60, y: 640, w: 480, h: 110, fill: '#ffcf3f', r: 20, stroke: '#e2574c', lw: 6 },
    { t: 'text', text: 'ハテナランド', x: 300, y: 695, s: 46, fill: '#c0392b', bold: true },
    { t: 'emoji', e: '❓', x: 300, y: 600, s: 70 },
    ...flag(120, '#ff6b6b'), ...flag(500, '#4dabf7'),
    // 案内所
    { t: 'building', x: 620, y: 1160, w: 380, h: 300, fill: '#fff4dc', roof: '#3b8bd9', door: true, windows: true, awning: '#3b8bd9' },
    { t: 'rect', x: 1135, y: 900, w: 12, h: 260, fill: '#666' },
    // 風船売りの屋台・ベンチ
    ...bench(1300, 2000), ...bench(150, 1900),
    { t: 'emoji', e: '🎈', x: 1420, y: 1180, s: 50 }, { t: 'emoji', e: '🎈', x: 1480, y: 1150, s: 46 },
    // トイレ
    { t: 'building', x: 4440, y: 1160, w: 160, h: 170, fill: '#e8f0f7', roof: '#7a8fa6', sign: '🚻', signFill: '#fff', signColor: '#333', door: true },
    // ジェットコースター
    { t: 'line', pts: COASTER.flat(), stroke: '#e2574c', w: 14 },
    ...[1900, 2050, 2200, 2330, 2480, 2600, 2760, 2880].map((x, i) => ({ t: 'rect', x: x - 6, y: [760, 430, 600, 960, 720, 520, 700, 1020][i], w: 12, h: 1160 - [760, 430, 600, 960, 720, 520, 700, 1020][i], fill: '#b0b4bb' })),
    { t: 'rect', x: 1520, y: 1180, w: 300, h: 20, fill: '#7a5230' },
    { t: 'sign', x: 1540, y: 1030, w: 260, h: 60, text: 'ギャラクシー・コースター', fill: '#2b2d6e', color: '#ffe066', s: 22 },
    // ステージ（なんでも答えまショー）
    { t: 'rect', x: 3250, y: 620, w: 1100, h: 400, fill: '#5a2a7a' },
    { t: 'stripes', x: 3250, y: 620, w: 1100, h: 400, dir: 'v', n: 12, c1: 'rgba(0,0,0,0)', c2: 'rgba(255,255,255,.08)' },
    { t: 'rect', x: 3200, y: 1010, w: 1200, h: 300, fill: '#8a5a33' },
    { t: 'rect', x: 3200, y: 1290, w: 1200, h: 30, fill: '#5a3a1e' },
    { t: 'sign', x: 3420, y: 650, w: 760, h: 90, text: 'ナゼ太郎の なんでも答えまショー', fill: '#ffcf3f', color: '#5a2a7a', s: 38 },
    { t: 'emoji', e: '❓', x: 3330, y: 840, s: 120 }, { t: 'emoji', e: '❔', x: 4270, y: 840, s: 120 },
    { t: 'emoji', e: '💡', x: 3500, y: 590, s: 50 }, { t: 'emoji', e: '💡', x: 4100, y: 590, s: 50 },
    ...bench(3330, 1610), ...bench(3580, 1610), ...bench(3830, 1610), ...bench(4080, 1610),
    ...bench(3330, 1830), ...bench(3580, 1830), ...bench(3830, 1830), ...bench(4080, 1830),
    // フードコート
    { t: 'building', x: 5050, y: 1160, w: 420, h: 220, fill: '#ffe1b3', roof: '#e07a2f', sign: 'フードコート', signFill: '#e07a2f', signColor: '#fff', awning: '#f2a65a', windows: true },
    ...[[5000, 1700], [5250, 1780], [5500, 1700]].map(([x, y]) => ({ t: 'ellipse', x, y, rx: 60, ry: 22, fill: '#fff', stroke: '#ccc' })),
    { t: 'emoji', e: '⛱️', x: 5000, y: 1610, s: 120 }, { t: 'emoji', e: '⛱️', x: 5500, y: 1610, s: 120 },
    // 海賊船
    { t: 'poly', pts: [5700, 1160, 6000, 470, 6300, 1160, 6260, 1160, 6000, 540, 5740, 1160], fill: '#6b4a2f' },
    { t: 'ellipse', x: 6000, y: 480, rx: 20, ry: 20, fill: '#333' },
    { t: 'sign', x: 5860, y: 1060, w: 280, h: 56, text: '大海賊船ドクロ丸', fill: '#222', color: '#fff', s: 24 },
    // 落下タワー
    { t: 'rect', x: 6520, y: 260, w: 60, h: 900, fill: '#c9ccd3', stroke: '#888', lw: 3 },
    { t: 'stripes', x: 6520, y: 260, w: 60, h: 900, dir: 'h', n: 18, c1: 'rgba(0,0,0,0)', c2: 'rgba(0,0,0,.12)' },
    { t: 'emoji', e: '⭐', x: 6550, y: 240, s: 60 },
    { t: 'sign', x: 6430, y: 1080, w: 240, h: 56, text: 'スカイドロップ', fill: '#e2574c', color: '#fff', s: 24 },
    // 射的屋
    { t: 'building', x: 6800, y: 1160, w: 460, h: 230, fill: '#fbe6e6', roof: '#c0392b', sign: '射的', signFill: '#c0392b', signColor: '#fff', awning: '#e74c3c' },
    { t: 'emoji', e: '🧸', x: 6880, y: 1060, s: 44 }, { t: 'emoji', e: '🎁', x: 6960, y: 1060, s: 40 }, { t: 'emoji', e: '🤖', x: 7040, y: 1060, s: 40 }, { t: 'emoji', e: '🎯', x: 7130, y: 1060, s: 44 },
    { t: 'ellipse', x: 7400, y: 1745, rx: 48, ry: 46, fill: '#ff6b6b', stroke: '#fff', lw: 6 },
    // 怪獣ショーのステージ
    { t: 'rect', x: 7480, y: 880, w: 560, h: 280, fill: '#2f3b2f' },
    { t: 'poly', pts: [7480, 880, 7560, 760, 7640, 880, 7720, 740, 7800, 880, 7880, 770, 7960, 880, 8040, 880], fill: '#3f5a3f' },
    { t: 'sign', x: 7560, y: 900, w: 400, h: 60, text: '怪獣ガオゴンショー', fill: '#9ae66e', color: '#1e2a1e', s: 28 },
    { t: 'rect', x: 7460, y: 1160, w: 600, h: 120, fill: '#555' },
    // お化け屋敷
    { t: 'building', x: 8080, y: 1160, w: 420, h: 380, fill: '#4a4458', roof: '#2b2735', sign: 'うらめし館', signFill: '#111', signColor: '#c33', door: true },
    { t: 'emoji', e: '🦇', x: 8200, y: 760, s: 40 }, { t: 'emoji', e: '🕸️', x: 8460, y: 840, s: 60 }, { t: 'emoji', e: '🎃', x: 8120, y: 1150, s: 46 },
    // 似顔絵広場と山
    { t: 'poly', pts: [8520, 1160, 8760, 600, 8880, 760, 9000, 640, 9000, 1160], fill: '#7c8a6a' },
    { t: 'poly', pts: [8700, 740, 8760, 600, 8820, 720, 8780, 700], fill: '#fff' },
    { t: 'sign', x: 8560, y: 1250, w: 240, h: 50, text: '似顔絵 一枚500円', fill: '#fff', color: '#7a3fb0', s: 20 },
    // 街灯・旗・植えこみ
    ...[900, 2300, 3100, 4700, 5600, 6700, 7300, 8000].flatMap(lamp),
    ...garland(3250, 4350, 590), ...garland(6800, 7260, 900),
    ...[[30, 1120], [560, 1120], [1240, 1100], [2950, 1110], [4380, 1100], [4980, 1110], [6400, 1110], [7300, 1100], [8540, 1110]].map(([x, y]) => tree(x, y)),
    ...[[200, 2470], [1100, 2480], [2100, 2470], [3000, 2490], [4200, 2470], [5200, 2480], [6200, 2470], [7200, 2490], [8200, 2470]].map(([x, y]) => ({ t: 'emoji', e: '🌷', x, y, s: 40 })),
    ...[[700, 2520], [2600, 2520], [4700, 2520], [6700, 2520], [8700, 2520]].map(([x, y]) => tree(x, y, 140)),
    // 地面の小物
    { t: 'emoji', e: '🍿', x: 2950, y: 2200, s: 30 }, { t: 'emoji', e: '🎟️', x: 600, y: 2250, s: 28, rot: 0.4 }, { t: 'emoji', e: '🪶', x: 6100, y: 2150, s: 26 },
    { t: 'text', text: '← 入口', x: 1000, y: 2370, s: 26, fill: '#a07a40', bold: true }, { t: 'text', text: 'ステージ →', x: 2800, y: 2370, s: 26, fill: '#a07a40', bold: true },
    { t: 'text', text: 'お化け屋敷 →', x: 7000, y: 2370, s: 26, fill: '#a07a40', bold: true },
  ],
  actors: {
    // ── なんでも答えまショー ──
    host: {
      name: '司会のナゼ太郎', x: 3800, y: 1260, wander: 160, speed: 70,
      look: { hair: 'short', hairColor: '#222', shirt: '#7a3fb0', pants: '#2b1a3a', acc: ['tie', 'hat', 'mustache'], hatColor: '#ffcf3f', h: 165 },
      idle: [
        'さあさあ、どんな質問にも答えちゃうよ〜！',
        '客席のみなさん、遠慮はいりません！ 心の声、聞かせて！',
        { text: '手が挙がらないなあ……みんな、もじもじさんかな？', when: [{ countAtMost: { id: QA, value: 1 } }] },
        { text: 'ラスト質問のお客さまを、まだ待ってるよ〜', when: [done('S6-E52'), notDone('S6-E53')] },
        { text: 'フィナーレは、園内のみんなが笑顔になってから！ 迷子さん、カツラの紳士、メガネの坊や、デートのふたり……どうしてるかな', when: [done('S6-E52'), notDone('S6-E53')] },
      ],
    },
    aud1: { name: '観客のおじいさん', x: 3400, y: 1625, wander: 0, look: { hair: 'bald', hairColor: '#ddd', shirt: '#8a7a5a', pants: '#4a4a3a', acc: ['glasses'], old: true, sit: true, h: 145 },
      idle: [{ text: 'わしにも、もう一度ときめく日が来るかのう', when: [notDone('S6-E04')] }, { text: 'ばあさんと出会ったのも、こんな遊園地じゃった', when: [notDone('S6-E04')] }, '手を挙げたいが、肩が上がらんのじゃ', { text: '……やっぱり、ばあさんがいちばんの美人じゃ', when: [done('S6-E04')] }] },
    aud2: { name: '観客の男の子', x: 3655, y: 1625, wander: 0, look: { hair: 'spiky', hairColor: '#333', shirt: '#4dabf7', pants: '#335', kid: true, sit: true, h: 110 },
      idle: [{ text: 'ハトっていいなあ。どこへでも行けて', when: [notDone('S6-E05')] }, { text: '空、とんでみたいなあ……', when: [notDone('S6-E05')] }, '司会のおじさん、帽子へんなの', { text: 'ぜんぜん飛んでなかった！', when: [done('S6-E05')] }] },
    aud3: { name: '観客の食いしん坊', x: 3905, y: 1625, wander: 0, look: { hair: 'short', hairColor: '#432', shirt: '#f2a65a', pants: '#555', wide: true, sit: true, h: 155 },
      idle: [{ text: 'ショーのあと、なに食べようかなあ', when: [notDone('S6-E06')] }, { text: 'グゥ〜……あ、いまの聞こえた？', when: [notDone('S6-E06')] }, 'ポップコーン、さっき落としちゃった', { text: 'おにぎり、買いに行かなきゃ', when: [done('S6-E06')] }] },
    aud4: { name: '観客の女の子', x: 4155, y: 1625, wander: 0, look: { hair: 'twin', hairColor: '#5a3a1a', shirt: '#ffb3d1', pants: '#fff', skirt: true, kid: true, sit: true, h: 105 },
      idle: [{ text: 'てんしさまって、ほんとにいるのかな', when: [notDone('S6-E07')] }, { text: 'おばあちゃん、お空でげんきかなあ', when: [notDone('S6-E07')] }, 'ショー、まだかな〜', { text: 'てんし、みーつけた！', when: [done('S6-E07')] }] },
    aud5: { name: '観客のお姉さん ソラ', x: 3400, y: 1845, wander: 0, look: { hair: 'long', hairColor: '#3a2a1a', shirt: '#9ad0ec', pants: '#f0f0f0', skirt: true, sit: true, h: 155, acc: ['flower'] },
      idle: [
        { text: '雨あがりに、ここから虹が見えたことがあるの', when: [notDone('S6-E08')] },
        { text: '虹のはしっこって、どこにあるんだろう', when: [notDone('S6-E08')] },
        { text: 'ほかのお客さんの質問も、もっと聞いてみたいな', when: [done('S6-E08'), notDone('S6-E52')] },
        { text: 'わたしたちらしさって、なんだろう……聞いてみようかな', when: [done('S6-E08'), cnt(QA, 5), notDone('S6-E52')] },
        { text: '楽しい時間って、どうして終わっちゃうんだろう……', when: [done('S6-E52'), notDone('S6-E53')] },
      ] },
    aud6: { name: '観客のサラリーマン', x: 3655, y: 1845, wander: 0, look: { hair: 'short', hairColor: '#333', shirt: '#fff', pants: '#334', acc: ['tie', 'glasses'], sit: true, h: 160 },
      idle: [{ text: 'あいたた……肩がバキバキだ', when: [notDone('S6-E09')] }, { text: '休日なのに、体がなまりみたいに重い……', when: [notDone('S6-E09')] }, '娘にむりやり連れてこられまして', { text: '肩がかるい！ ハハハ！', when: [done('S6-E09')] }] },
    aud7: { name: '観客のおばあさん', x: 3905, y: 1845, wander: 0, look: { hair: 'bun', hairColor: '#ccc', shirt: '#b07aa1', pants: '#555', skirt: true, old: true, sit: true, h: 140 },
      idle: [{ text: '人生なんて、あっという間ねえ', when: [notDone('S6-E10')] }, { text: 'この遊園地、むかしは原っぱだったのよ', when: [notDone('S6-E10')] }, 'あの司会さん、どこかで見た顔ねえ', { text: 'あの子、五歳のときここで迷子になった子だわ', when: [done('S6-E10')] }] },
    aud8: { name: '観客のゲーム少年', x: 4155, y: 1845, wander: 0, look: { hair: 'bob', hairColor: '#222', shirt: '#2ecc71', pants: '#333', kid: true, sit: true, h: 110, acc: ['headphones'] },
      idle: [{ text: 'ワープできたら、学校まで一瞬なのになあ', when: [notDone('S6-E11')] }, { text: '並ぶの、もう飽きた〜', when: [notDone('S6-E11')] }, 'このショー、セーブポイントある？', { text: 'いまの、ぜったい走ってたよね！？', when: [done('S6-E11')] }] },

    // ── 迷子のミナ ──
    mina: { name: '迷子のミナ', x: 1050, y: 1720, wander: 60, speed: 50, look: { hair: 'pony', hairColor: '#5a3a1a', shirt: '#ffcf3f', pants: '#e2574c', skirt: true, kid: true, h: 100, acc: ['ribbon'] },
      idle: [
        { text: 'パパぁ……どこぉ……', when: [notDone('S6-E16'), notDone('S6-E18')] },
        { text: 'あのフワフワ、ほしいなあ', when: [notDone('S6-E15')] },
        { text: 'もっといっぱいあったら、お空からパパさがせるかな', when: [done('S6-E15'), notDone('S6-E16'), notDone('S6-E17')] },
        { text: '迷子のときは、どこに行けばいいんだっけ……', when: [notDone('S6-E16'), notDone('S6-E17')] },
        { text: 'もじもじ……（足をくねくねさせている）', when: [notDone('S6-E16'), notDone('S6-E17'), notDone('S6-E21')] },
        { text: 'パパ、だっこ〜！', when: [{ anyEventDone: ['S6-E16', 'S6-E18'] }] },
      ] },
    papa: { name: 'ミナのパパ', x: 6300, y: 1700, wander: 320, speed: 90, look: { hair: 'short', hairColor: '#2a2a2a', shirt: '#6aa84f', pants: '#3a3a5a', acc: ['bag'], h: 170 },
      idle: [
        { text: 'ミナー！ ミナー！ どこ行ったんだー！', when: [notDone('S6-E16'), notDone('S6-E18')] },
        { text: 'ちょっと目をはなしたすきに……ああ……', when: [notDone('S6-E16'), notDone('S6-E18')] },
        { text: 'こんなに広いと、声も届かない……', when: [notDone('S6-E16'), notDone('S6-E18')] },
        { text: 'もう二度と手をはなさないぞ', when: [{ anyEventDone: ['S6-E16', 'S6-E18'] }] },
      ] },
    balloon: { name: '風船売りのフワ爺', x: 1400, y: 1480, wander: 30, look: { hair: 'bald', hairColor: '#eee', shirt: '#ff8fab', pants: '#555', acc: ['beard', 'hat'], hatColor: '#4dabf7', old: true, h: 150 },
      idle: [{ text: 'ふうせん、ふうせん、一個百円だよ〜', when: [notDone('S6-E15')] }, 'きょうは風が強いから、気をつけてな', '泣いとる子には、風船がいちばんの薬じゃ', { text: 'ありったけ持たせたら、あの子、飛んでいっちまうかもなあ。ほっほ', when: [done('S6-E15'), notDone('S6-E16'), notDone('S6-E17')] }] },
    infostaff: { name: '案内係の音羽さん', x: 820, y: 1330, wander: 50, look: { hair: 'bob', hairColor: '#4a2e1e', shirt: '#3b8bd9', pants: '#223', skirt: true, acc: ['scarf'], h: 155 },
      idle: [
        'インフォメーションです。お困りのことはありませんか？',
        { text: '迷子のお子さまは、こちらでお預かりしていますよ〜', when: [notDone('S6-E17')] },
        { text: '放送で呼び出しますね。……でも、ちゃんと聞いてくださるかしら', when: [done('S6-E17'), notDone('S6-E18')] },
        '落とし物も届いていますのに、持ち主さんが来なくて……',
      ] },
    // ── カツラの紳士と息子 ──
    bucho: { name: 'カツラの鷹野さん', x: 2150, y: 1600, wander: 40, speed: 40, look: { hair: 'bald', hairColor: '#333', shirt: '#4a5a7a', pants: '#2a2a2a', acc: ['tie', 'glasses'], h: 165 },
      idle: [
        { text: 'さっきのコースターで、頭が……スースーする……', when: [notDone('S6-E22')] },
        { text: 'だ、だれも見てないな？ わたしの頭を見てないな？', when: [notDone('S6-E22')] },
        'ソウタ、走るんじゃない！ パパはもうヘトヘトだ',
        { text: 'ふふふ、カンペキだ。……カンペキだよな？', when: [done('S6-E22')] },
      ] },
    sota: { name: '息子のソウタ', x: 2350, y: 1720, wander: 120, speed: 80, look: { hair: 'spiky', hairColor: '#222', shirt: '#ff6b6b', pants: '#2a4a8a', kid: true, h: 115, acc: ['cap'], hatColor: '#ffcf3f' },
      idle: [
        'ねえパパ、次なに乗る！？ なに乗る！？',
        { text: 'グルグル回るやつ、ぜんぶ乗りたい！', when: [notDone('S6-E12')] },
        { text: 'ヒューって落ちるやつ、身長たりるかな？', when: [notDone('S6-E14')] },
        { text: 'ふねがブランコみたいになってた！', when: [notDone('S6-E13')] },
        { text: 'さっきのおばちゃん、だれかさがしてたよ', when: [done('S6-E34')] },
      ] },
    // ── 漫才コンビ ──
    tetsu: { name: 'ツッコミのテツ', x: 2650, y: 1500, wander: 140, speed: 70, look: { hair: 'short', hairColor: '#222', shirt: '#e2574c', pants: '#222', acc: ['tie'], h: 165 },
      idle: [{ text: '相方のボン、どこ行ったんや……営業前やのに', when: [notDone('S6-E01')] }, { text: 'あいつ、高いとこ好きやからなあ', when: [notDone('S6-E01')] }, 'なんでやねん、の練習でもしとこ', { text: 'こいつと組んで十年、ずっとこれや', when: [done('S6-E01')] }] },
    boke: { name: 'ボケのボン', x: 1700, y: 1260, hidden: true, wander: 60, look: { hair: 'afro', hairColor: '#5a3a1a', shirt: '#ffcf3f', pants: '#222', acc: ['tie'], h: 160 },
      idle: ['コースター、もう一周いっとく？', 'テツ、ボクのことさがしてたん？ 知らんかった〜'] },

    // ── いたずら小僧と空き缶 ──
    prank: { name: 'いたずら小僧のケン坊', x: 4900, y: 1650, wander: 180, speed: 110, look: { hair: 'mohawk', hairColor: '#333', shirt: '#2ecc71', pants: '#8a5a33', kid: true, h: 115 },
      idle: [
        { text: 'あっちー！ のど、カラッカラだぜ', when: [notDone('S6-E24')] },
        'へへーん、つかまえてみろー！',
        { text: 'カラコロいう靴、かっこよさそう', when: [notDone('S6-E26')] },
        { text: 'ポイッとな。ゴミ箱？ 遠いもん', when: [done('S6-E24'), notDone('S6-E25')] },
        { text: '……ボク、どっか壊れてるのかな', when: [done('S6-E25'), notDone('S6-E27')] },
      ] },
    cleaner: { name: '清掃員のピカ山さん', x: 5300, y: 1900, path: 'cleanerRoute', speed: 55, look: { hair: 'short', hairColor: '#777', shirt: '#4a8a6a', pants: '#3a5a4a', acc: ['cap'], hatColor: '#4a8a6a', old: true, h: 155 },
      idle: [
        '園内ピカピカ、心もピカピカ',
        { text: 'どこかに缶が転がってる気がするんだが、目が悪くてねえ', when: [notDone('S6-E23')] },
        { text: 'あと何個あるかねえ……', when: [{ any: [cnt('S6-can1', 1), cnt('S6-can2', 1), cnt('S6-can3', 1), cnt('S6-can4', 1)] }, notDone('S6-E23')] },
        { text: 'ポイ捨てする子には、ひとこと言わんとな', when: [notDone('S6-E25')] },
        { text: 'これで園内、ぜんぶピカピカだ！', when: [done('S6-E23')] },
      ] },
    toolman: { name: '工具おじさん', x: 5450, y: 1450, wander: 60, look: { hair: 'short', hairColor: '#555', shirt: '#4a6fa5', pants: '#2b3a55', acc: ['helmet', 'mustache'], hatColor: '#ffcf3f', muscle: true, h: 170 },
      idle: ['ガタガタいうもんは、なんでも直すぞ', 'ネジがゆるんどるやつは、おらんかね', 'コースターの点検、今日もバッチリ'] },

    // ── デート ──
    kare: { name: 'デート中のユウスケ', x: 2900, y: 1950, wander: 50, look: { hair: 'short', hairColor: '#4a2e1e', shirt: '#fff', pants: '#3a5a8a', acc: ['bag'], h: 170 },
      idle: [
        { text: 'しまった、カメラ忘れた……いや、言わなきゃバレない', when: [notDone('S6-E28')] },
        'アカリ、なに乗りたい？ ぼくはなんでも平気だよ（ほんとは高いとこ苦手）',
        { text: 'ふたりの写真、だれかに撮ってもらえないかな', when: [done('S6-E28'), notDone('S6-E29'), notDone('S6-E30')] },
        { text: 'いい写真が撮れた。一生の宝物だ', when: [{ anyEventDone: ['S6-E29', 'S6-E30'] }] },
      ] },
    kano: { name: '彼女のアカリ', x: 2980, y: 1960, wander: 50, look: { hair: 'long', hairColor: '#6a3a1a', shirt: '#ff8fab', pants: '#fff', skirt: true, acc: ['earring', 'bag'], h: 158 },
      idle: [
        'ねえ、記念写真撮ろうよ',
        { text: 'こわいのはイヤ。キャーってなるのはもっとイヤ', when: [notDone('S6-E31'), notDone('S6-E32')] },
        { text: 'ユウスケ、いまどこ見てた？', when: [done('S6-E33')] },
      ] },
    lady1: { name: '旅行中のハルカ', x: 5050, y: 2120, wander: 70, look: { hair: 'bob', hairColor: '#222', shirt: '#9b59b6', pants: '#333', acc: ['camera', 'sunglasses'], h: 158 },
      idle: ['写真撮るの、だ〜いすき！', 'カップルを見ると撮ってあげたくなるのよねえ', 'はい、チーズ……って練習中'] },
    lady2: { name: '旅行中のナツミ', x: 5140, y: 2130, wander: 70, look: { hair: 'pony', hairColor: '#7a4a2a', shirt: '#f39c12', pants: '#333', acc: ['bag'], h: 156 },
      idle: ['ハルカ、また人の写真撮る気でしょ', 'わたしたちも、いつか彼氏と来たいね……'] },
    bijin: { name: '謎の美人', x: 3200, y: 2100, path: 'bijinWalk', speed: 45, look: { hair: 'long', hairColor: '#111', shirt: '#c0392b', pants: '#111', skirt: true, acc: ['sunglasses', 'earring'], h: 172 },
      idle: ['……ふふっ', 'いい天気ね', '（すれちがう人がみんな振りかえる）'] },

    // ── 射的とメガネの親子 ──
    takumi: { name: 'メガネのタクミ', x: 7000, y: 1500, wander: 50, look: { hair: 'bob', hairColor: '#222', shirt: '#f1c40f', pants: '#2a4a8a', kid: true, h: 115, acc: ['glasses'] },
      idle: [
        { text: 'あのロボット、ぜったいほしい……でも当たらない', when: [notDone('S6-E35')] },
        'ぼく、ヒーローみたいにかっこよくなりたいんだ',
        { text: '今日の記念、なにか残したいな', when: [notDone('S6-E37')] },
        { text: 'ママ、どこ行ったんだろ。ぼくは迷子じゃないよ', when: [notDone('S6-E34')] },
      ] },
    ritsuko: { name: 'メガネのリツコ', x: 6250, y: 1850, wander: 120, look: { hair: 'bun', hairColor: '#3a2a1a', shirt: '#e67e22', pants: '#4a3a2a', acc: ['glasses', 'bag'], h: 160 },
      idle: [
        'タクミったら、すぐどこかに行っちゃうんだから',
        'わたし、写真の腕にはちょっと自信があるのよ',
        { text: 'あの落ちるやつ、子どもはこわくないのかしら', when: [notDone('S6-E34')] },
      ] },
    shooter: { name: '射撃スタッフのバン', x: 7150, y: 1350, wander: 60, look: { hair: 'spiky', hairColor: '#a33', shirt: '#c0392b', pants: '#222', acc: ['apron', 'headphones'], h: 168 },
      idle: ['さあ、一回三発！ 景品はでっかいぞ〜', 'コツ？ 肩の力をぬいて、心をカラッポにするのさ', 'ヒーローってのは、外してもくじけないもんだ'] },
    // ── ジャグラー ──
    juggler: { name: 'ジャグラーのコロ助', x: 7400, y: 1700, wander: 0, look: { hair: 'afro', hairColor: '#e74c3c', shirt: '#fff', pants: '#3498db', acc: ['hat'], hatColor: '#2ecc71', h: 160 },
      idle: ['ボールの上でも、お手玉三つ！ ……おっとっと', 'だれか、オレのこと見てくれー！', '拍手はいつでも受けつけ中！'] },
    gal: { name: '日焼けギャルのマリン', x: 7650, y: 1950, wander: 100, look: { hair: 'long', hairColor: '#f5d76e', skin: '#9a6a44', shirt: '#ff5ec4', pants: '#fff', skirt: true, acc: ['earring', 'sunglasses'], h: 158 },
      idle: ['ちょ、遊園地まじアガるんだけど', 'なんかオモロいの、ないの〜？', 'ウチ、かわいいものとすごいものには弱いんよ'] },
    // ── 怪獣ショー・お化け屋敷 ──
    monactor: { name: '怪獣ガオゴン', x: 7760, y: 1250, wander: 160, speed: 60, look: { hair: 'none', shirt: '#4caf50', pants: '#2e7d32', costume: '🦖', wide: true, h: 180 },
      idle: [
        { text: 'ガオーーッ！ ……（なかの人、息が切れている）', when: [notDone('S6-E02')] },
        { text: '（頭がずれる……おさえなきゃ）', when: [notDone('S6-E02')] },
        'ガオォ……人手不足だガオ……',
        { text: 'ガオゴン二号、いい顔してるなあ', when: [done('S6-E03')] },
      ] },
    monman: { name: 'こわもての男', x: 7300, y: 2150, wander: 160, look: { hair: 'afro', hairColor: '#111', shirt: '#444', pants: '#222', acc: ['beard', 'scarf'], muscle: true, wide: true, h: 185 },
      idle: ['……（子どもに泣かれた）', 'おれ、顔がこわいって言われるんだ', 'なにか、この顔が役に立つ仕事はないかなあ'] },
    obake: { name: 'お化け役のバイト', x: 8200, y: 1400, wander: 90, look: { hair: 'long', hairColor: '#222', shirt: '#eee', pants: '#eee', skirt: true, skin: '#dfe8ea', h: 160 },
      idle: ['うらめしや〜……あ、休憩まだかな', 'この白い服、すぐ汚れるんですよね', 'うらめしや〜（棒読み）'] },
    hstaff: { name: 'お化け屋敷スタッフ', x: 8400, y: 1500, wander: 70, look: { hair: 'short', hairColor: '#333', shirt: '#2b2735', pants: '#111', acc: ['cap'], hatColor: '#c33', h: 165 },
      idle: [
        'うちのお化けは日本一こわいですよ！ ……たぶん',
        { text: '本物？ そんなもん、いるわけないでしょ', when: [notDone('S6-E40')] },
        { text: 'お化け役、もうひとりいたっけ……？', when: [done('S6-E39'), notDone('S6-E40')] },
      ] },
    ghost: { name: '本物の幽霊', emoji: '👻', size: 80, x: 8300, y: 1250, hidden: true, wander: 120, speed: 30, idle: ['……ここ、居心地いいの……', '……ひゅ〜どろどろ……'] },
    hphone: { name: 'ヘッドホンのDJ青年', x: 7850, y: 2250, wander: 120, look: { hair: 'spiky', hairColor: '#4a90e2', shirt: '#222', pants: '#555', acc: ['headphones', 'sunglasses'], h: 170 },
      idle: ['ズンチャ、ズンチャ♪（なにも聞こえていない）', 'あれ、財布……まあいっか、ズンチャ♪', 'いまなんか言った？ ……ま、いっか'] },
    // ── 似顔絵コーナー ──
    painter: { name: '肖像画家のエノグ先生', x: 8620, y: 1700, wander: 0, look: { hair: 'long', hairColor: '#777', shirt: '#d35400', pants: '#3a3a3a', acc: ['beard', 'hat'], hatColor: '#222', h: 168 },
      idle: ['似顔絵いかが？ 見たままを、いや、見えないものまで描きますぞ', 'ワシの筆は、ウソがつけんのじゃ', 'モデルさん、来ないかのう……'] },
    jk: { name: '厚化粧の女子高生キララ', x: 8450, y: 2000, wander: 90, look: { hair: 'twin', hairColor: '#f39c12', shirt: '#2c3e50', pants: '#2c3e50', skirt: true, skin: '#fff3f3', acc: ['ribbon', 'earring'], h: 155 },
      idle: ['メイク、三時間かかった♡', '写真映えしたいの！ 盛れるとこない？', '顔の話はやめて。すっぴんは国家機密だから'] },
    kurofuku: { name: '黒服の男', x: 8800, y: 1850, wander: 60, look: { hair: 'short', hairColor: '#111', shirt: '#111', pants: '#111', acc: ['sunglasses', 'tie'], h: 178 },
      idle: ['……（ずっと誰かを見守っている）', '……任務中だ', '……（ポケットにヒーローのお面が見える）'] },
    idol: { name: '帽子とサングラスの女性', x: 7100, y: 2250, wander: 90, look: { hair: 'long', hairColor: '#c97a4a', shirt: '#fff', pants: '#5a7aa8', acc: ['sunglasses', 'mask', 'hat'], hatColor: '#ddd', h: 160 },
      idle: ['……しーっ。今日はオフなの', 'バレてない……よね？', '（小さく鼻歌。どこかで聞いたメロディ）'] },
    // ── 着ぐるみ ──
    rabbit: { name: 'ウサギのピョンタ', x: 1800, y: 2000, path: 'rabbitWalk', speed: 60, look: { hair: 'none', shirt: '#fff', pants: '#ffb3d1', costume: '🐰', wide: true, h: 170 },
      idle: ['（ピョンピョン！）', '（手をふっている）', '（なかから「あっつ……」と聞こえた）'] },
    squirrel: { name: 'リスのクルミン', x: 5600, y: 2050, path: 'squirrelWalk', speed: 60, look: { hair: 'none', shirt: '#c97a4a', pants: '#8a5a33', costume: '🐿️', wide: true, h: 160 },
      idle: ['（しっぽをフリフリ）', '（どんぐりを配っている）', '（トイレの方角を指さして、くるくる回った）'] },
    // ── 方言カップル ──
    osaF: { name: '大阪のミサキ', x: 5250, y: 1500, wander: 40, look: { hair: 'bob', hairColor: '#4a2e1e', shirt: '#e74c3c', pants: '#333', acc: ['earring'], h: 157 },
      idle: ['もう足パンパンやわ', 'なんか食べたいなあ、あったかいの', 'ちょっと、聞いてる？'] },
    osaM: { name: '大阪のタツヤ', x: 5330, y: 1500, wander: 40, look: { hair: 'spiky', hairColor: '#222', shirt: '#f1c40f', pants: '#333', h: 172 },
      idle: ['よっしゃ、次いこ次！', 'たこ焼きの屋台、どこやろ'] },
    tohF: { name: '東北のスズ', x: 6200, y: 2150, wander: 40, look: { hair: 'long', hairColor: '#2a1a0a', shirt: '#a3cfe8', pants: '#555', acc: ['scarf'], h: 155 },
      idle: ['ふねっこ、ゆさゆさしてらねえ', 'なんだかさみぐなってきたなや', '手っこ、つめでぇ……'] },
    tohM: { name: '東北のケンジ', x: 6280, y: 2160, wander: 40, look: { hair: 'short', hairColor: '#333', shirt: '#7a5a3a', pants: '#333', acc: ['cap'], hatColor: '#355', h: 172 },
      idle: ['んだなあ', 'ほれ、あれっこ乗るべ'] },
    hakF: { name: '博多のアヤ', x: 8050, y: 2000, wander: 40, look: { hair: 'pony', hairColor: '#3a2010', shirt: '#ff8fab', pants: '#fff', skirt: true, acc: ['ribbon'], h: 156 },
      idle: ['お化け屋敷、ちょっとだけこわかぁ', 'ねえ、ちゃんと聞いとう？'] },
    hakM: { name: '博多のリョウ', x: 8130, y: 2010, wander: 40, look: { hair: 'short', hairColor: '#222', shirt: '#2c3e50', pants: '#555', h: 174 },
      idle: ['ラーメン食べたかね〜', 'なんでんよかよ'] },
    climber: { name: '登山家のゴロー', x: 2750, y: 2250, wander: 140, speed: 50, look: { hair: 'short', hairColor: '#333', shirt: '#c0392b', pants: '#5a4a2a', acc: ['beard', 'hat', 'bag'], hatColor: '#6b8e23', muscle: true, h: 175 },
      idle: ['平らな場所は、どうも落ちつかん', 'わしの心は、いつも頂上にある', 'このあたりに、登りがいのある峰はないかのう'] },
    // ── 乗り物（撮れる） ──
    coaster: { name: 'ギャラクシー・コースター', emoji: '🎢', size: 110, x: 1600, y: 1180, path: 'coasterLoop', speed: 300, idle: ['キャーーー！', 'ゴォォォォ……', 'ワーーーッ！'], idleEveryMs: 7000 },
    ship: { name: '大海賊船ドクロ丸', emoji: '⛵', size: 190, x: 6000, y: 910, path: 'shipSwing', speed: 260, idle: ['ギィ……ギィ……', 'キャー！ 落ちるー！'], idleEveryMs: 8000 },
    drop: { name: 'スカイドロップ', emoji: '💺', size: 80, x: 6550, y: 1150, path: 'dropLoop', speed: 220, idle: ['ヒュウウウウン！', 'ぎゃああああ！'], idleEveryMs: 8000 },
    // ── 背景の人々（ダミー） ──
    pigeon: { name: 'ハト', emoji: '🕊️', size: 44, x: 3900, y: 2250, wander: 200, speed: 80, idle: ['クルックー'] },
    icecream: { name: 'アイス売り', x: 4300, y: 2200, wander: 40, look: { hair: 'short', hairColor: '#a33', shirt: '#fff', pants: '#3a8ad9', acc: ['apron', 'cap'], hatColor: '#3a8ad9', h: 160 },
      idle: ['アイスいかが〜、とけるまえに〜', 'きょうは何味が人気かなあ'] },
  },
  objects: {
    // 入口・案内所
    info: { name: '案内所', sign: { text: '案内所 i', fill: '#3b8bd9', color: '#fff', s: 30 }, w: 220, h: 70, x: 810, y: 1060 },
    pa: { name: '場内放送スピーカー', emoji: '📢', size: 64, x: 1141, y: 940 },
    balloonbunch: { name: '風船の束', emoji: '🎈', size: 120, x: 1400, y: 1300, hidden: true, capturable: false },
    wig: { name: '曲がったカツラ', emoji: '🦱', size: 40, x: 1950, y: 1780, rot: 0.6, minZoom: 1.1 },
    // 空き缶 4 か所
    can1: { name: '空き缶', emoji: '🥫', size: 28, x: 2480, y: 2230, minZoom: 1.2, rot: 1.4 },
    can2: { name: '空き缶', emoji: '🥫', size: 28, x: 4300, y: 1980, minZoom: 1.2, rot: -1.3 },
    can3: { name: '空き缶', emoji: '🥫', size: 28, x: 7250, y: 2330, minZoom: 1.2, rot: 1.6 },
    can4: { name: 'ジュースの空き缶', emoji: '🥫', size: 30, x: 4800, y: 1820, minZoom: 1.1, rot: 1.5, hidden: true },
    juice: { name: 'ジュースの自販機', sign: { text: '🥤 COLD', fill: '#e74c3c', color: '#fff', s: 22 }, w: 90, h: 160, x: 4720, y: 1330 },
    camvend: { name: 'カメラの自販機', sign: { text: '📷 使い切りカメラ', fill: '#2c3e50', color: '#fff', s: 16 }, w: 100, h: 160, x: 4850, y: 1330 },
    geta: { name: '下駄', emoji: '🩴', size: 36, x: 5600, y: 2280, minZoom: 1.1 },
    // 怪獣・お化け
    monhead: { name: '怪獣の頭（予備）', emoji: '🐲', size: 70, x: 8000, y: 1300 },
    haunted: { name: 'お化け屋敷', emoji: '🏚️', size: 150, x: 8300, y: 1170 },
    // 射的・記念写真
    hero: { name: 'ヒーロー像', emoji: '🦸', size: 130, x: 6700, y: 1500 },
    panel: { name: '記念写真パネル', sign: { text: '😀 顔ハメ 😀', fill: '#ffcf3f', color: '#c0392b', s: 22 }, w: 140, h: 180, x: 7700, y: 1550 },
    // 似顔絵・山
    canvas: { name: '似顔絵のキャンバス', sign: { text: '', fill: '#fff', color: '#333', s: 48 }, w: 110, h: 130, x: 8720, y: 1700, capturable: false },
    mountain: { name: 'ドンブラ山（アトラクション）', emoji: '⛰️', size: 220, x: 8820, y: 1180 },
    // ステージの演出用
    rainbow: { name: '虹', emoji: '🌈', size: 260, x: 3800, y: 980, hidden: true, capturable: false },
    // ── ダミー（撮れるけど何も起きにくい物） ──
    map: { name: '園内マップ', sign: { text: '🗺️ MAP', fill: '#fff', color: '#3b8bd9', s: 22 }, w: 120, h: 90, x: 1200, y: 1250 },
    popcorn: { name: 'ポップコーン', emoji: '🍿', size: 44, x: 3100, y: 1400 },
    icecone: { name: 'ソフトクリーム', emoji: '🍦', size: 40, x: 4380, y: 2150 },
    trashbin: { name: 'ゴミ箱', emoji: '🗑️', size: 54, x: 5800, y: 1400 },
    teacup: { name: 'コーヒーカップの看板', emoji: '☕', size: 60, x: 3050, y: 1250 },
    ferris: { name: '観覧車のミニチュア', emoji: '🎡', size: 90, x: 2950, y: 1250 },
    carousel: { name: 'メリーゴーランドの木馬', emoji: '🎠', size: 90, x: 450, y: 1500 },
    ticket: { name: '回数券', emoji: '🎫', size: 30, x: 1600, y: 2150, minZoom: 1.1 },
    sunglasses: { name: '落ちたサングラス', emoji: '🕶️', size: 30, x: 6150, y: 2350, minZoom: 1.1 },
    hotdog: { name: 'ホットドッグ', emoji: '🌭', size: 38, x: 5250, y: 1680 },
    bouquet: { name: '花束', emoji: '💐', size: 40, x: 2700, y: 2000 },
    teddy: { name: '景品のクマ', emoji: '🧸', size: 46, x: 7300, y: 1400 },
    pumpkin: { name: 'カボチャのおばけ', emoji: '🎃', size: 50, x: 8550, y: 1450 },
    palette: { name: '絵の具パレット', emoji: '🎨', size: 40, x: 8560, y: 1760 },
    lantern: { name: 'ちょうちん', emoji: '🏮', size: 40, x: 8000, y: 1600 },
    drum: { name: '太鼓', emoji: '🥁', size: 50, x: 3250, y: 1250 },
  },
  paths: {
    coasterLoop: { points: COASTER, speed: 300, loop: true },
    shipSwing: { points: SHIP, speed: 260, loop: true },
    dropLoop: { points: [[6550, 1150], [6550, 330], [6550, 335]], speed: 220, loop: true },
    cleanerRoute: { points: [[4650, 1900], [5800, 1900], [5800, 2250], [4650, 2250]], speed: 55, loop: true },
    bijinWalk: { points: [[2600, 2100], [3700, 2150], [3700, 2300], [2600, 2250]], speed: 45, loop: true },
    rabbitWalk: { points: [[900, 2000], [2600, 2050], [3100, 2300], [1500, 2300]], speed: 60, loop: true },
    squirrelWalk: { points: [[4600, 2050], [6900, 2000], [6900, 2300], [4600, 2300]], speed: 60, loop: true },
    minaFly: { points: [[1250, 1200], [1500, 760], [3000, 560], [4800, 600], [6000, 760], [6300, 1100], [6330, 1700]], speed: 380, loop: false },
    minaFlyB: { points: [[1250, 1080], [1500, 640], [3000, 440], [4800, 480], [6000, 640], [6300, 980], [6330, 1580]], speed: 380, loop: false },
    finaleGather: { points: [[3600, 1450], [3800, 1420]], speed: 200, loop: false },
  },
  reactions: [
    { s: 'can1', t: 'cleaner', say: 'おっと、こんなところにも。……ほかにもありそうだね', counter: 'S6-can1', when: [notDone('S6-E23')], anim: 'react.think' },
    { s: 'can2', t: 'cleaner', say: '客席の下に缶が！ まだどこかにありそうだ', counter: 'S6-can2', when: [notDone('S6-E23')], anim: 'react.think' },
    { s: 'can3', t: 'cleaner', say: '射的屋のほうにも転がってたか。やれやれ', counter: 'S6-can3', when: [notDone('S6-E23')], anim: 'react.think' },
    { s: 'can4', t: 'cleaner', say: '自販機の前だね。……でも、まだ見落としがある気がする', counter: 'S6-can4', when: [notDone('S6-E23')], anim: 'react.think' },
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
      fx: [{ type: 'ACTOR_SHOW', actorId: 'boke', delayMs: 1500 }, { type: 'ACTOR_MOVE', actorId: 'tetsu', to: [1800, 1300], speed: 220, wander: 60 },
        { type: 'ACTOR_SPEECH', actorId: 'boke', text: 'あ、テツ〜。三周したら髪型こうなってん', delayMs: 4500 }, { type: 'ACTOR_SPEECH', actorId: 'tetsu', text: 'もとからやろ！', delayMs: 6500 }, { type: 'PLAY_SOUND', soundId: 'laugh', delayMs: 6500 }] },
    // ── 怪獣ショー ──
    { id: 'S6-E02', s: 'monhead', t: 'monactor', cat: 'FLAVOR', title: 'ガオゴンの中の人', say: 'ガオ？ 予備の頭……あっ、ずれてる！ 直さなきゃ……', anim: 'react.embarrassed', route: 'S6.route.monster',
      fx: [{ type: 'ACTOR_APPEARANCE', actorId: 'monactor', look: { costume: null, hair: 'bald', hairColor: '#555', acc: ['mustache'] }, delayMs: 1200 }, { type: 'FX', kind: 'smoke', at: 'monactor', delayMs: 1100 },
        { type: 'ACTOR_SPEECH', actorId: 'monactor', text: '……どうも、中の人です。五十八歳です', delayMs: 2600 }, { type: 'ACTOR_SPEECH', actorId: 'gal', text: 'え、ふつうのおじさんじゃん！ ウケる！', delayMs: 4200 },
        { type: 'ACTOR_APPEARANCE', actorId: 'monactor', look: { costume: '🦖' }, delayMs: 9000 }] },
    { id: 'S6-E03', s: 'monman', t: 'monactor', cat: 'FLAVOR', title: '怪獣ショーに新人スカウト', say: 'ガオッ！？ その顔、その迫力……キミ、怪獣やらないか！？', anim: 'react.sparkle', route: 'S6.route.monster',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'monman', to: [7650, 1240], speed: 160, wander: 80 }, { type: 'ACTOR_SPEECH', actorId: 'monman', text: 'お、おれの顔が……役に立つ……！', delayMs: 2400 }, { type: 'ACTOR_APPEARANCE', actorId: 'monman', look: { costume: '🐊' }, delayMs: 5000 }, { type: 'FX', kind: 'stars', at: 'monman', delayMs: 5000 }, { type: 'PLAY_SOUND', soundId: 'roar', delayMs: 5200 }] },

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
      fx: [qa, { type: 'FX', kind: 'smoke', at: 'host', delayMs: 900 }, { type: 'ACTOR_MOVE', actorId: 'host', to: [3300, 1260], speed: 900, delayMs: 900, wander: 0 }, { type: 'FX', kind: 'smoke', at: 'host', delayMs: 2400 },
        { type: 'ACTOR_MOVE', actorId: 'host', to: [3800, 1260], speed: 120, delayMs: 5000, wander: 160 }],
      after: [{ actor: 'aud8', text: 'いま、ふつうに走ってたよね！？', delay: 3000 }] },

    // ── カツラの紳士の息子：乗り物にキャッチ反応 ──
    { id: 'S6-E12', s: 'coaster', t: 'sota', cat: 'FLAVOR', title: 'ソウタ、コースターに大興奮', say: 'うわー！ 一回転してる！ パパ、もう一回乗ろう！', anim: 'react.happy', route: 'S6.route.wig',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'bucho', text: 'も、もう一回！？ パパの頭がもたん……', delayMs: 2400 }] },
    { id: 'S6-E13', s: 'ship', t: 'sota', cat: 'FLAVOR', title: 'ソウタ、海賊船ごっこ', say: 'ヨーソロー！ オレは船長だ！ 宝はどこだー！', anim: 'react.run', route: 'S6.route.wig',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'sota', to: [2600, 1800], speed: 200 }, { type: 'ACTOR_MOVE', actorId: 'sota', to: [2350, 1720], speed: 160, delayMs: 2600 }] },
    { id: 'S6-E14', s: 'drop', t: 'sota', cat: 'CHAIN', title: 'ソウタ、スカイドロップへ一直線', say: 'あれ乗る！ ひとりで乗れるもん！', anim: 'react.run', route: 'S6.route.wig',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'sota', to: [6450, 1350], speed: 420, wander: 60 }, { type: 'ACTOR_SPEECH', actorId: 'bucho', text: 'ソウタ！？ まちなさーい！ ……足が、足がもう……', delayMs: 2000 },
        { type: 'ACTOR_SPEECH', actorId: 'sota', text: 'ぎゃああああ……たのしーー！', delayMs: 15000 }],
      after: [{ actor: 'ritsuko', text: 'あら、ボクひとり？ ……うちの子も、どこかでひとりなのかしら', delay: 16500 }] },

    // ── 迷子のミナ ──
    { id: 'S6-E15', s: 'mina', t: 'balloon', cat: 'CHAIN', title: 'ミナ、風船をもらう', say: 'ほれ、泣くのはおしまい。一個おまけじゃ', anim: 'react.happy', route: 'S6.route.mina',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'mina', to: [1330, 1520], speed: 120 }, { type: 'ACTOR_SET_STATE', actorId: 'mina', state: 'HAPPY', delayMs: 1600 }, { type: 'ACTOR_SPEECH', actorId: 'mina', text: 'わあ……ありがと。もっとあったら、空からパパ見えるかな', delayMs: 3000 }],
      after: [{ actor: 'balloon', text: 'もっと……？ ほっほっほ、全部持っていくかい？', delay: 6000 }] },
    { id: 'S6-E16', s: 'mina', t: 'balloon', cat: 'BRANCH', requires: ['S6-E15'], title: 'ミナ、風船の束で大空へ', say: 'よし、ぜんぶ持っていけ！ ……あ、あれれ、浮いとる！？', anim: 'react.surprised', route: 'S6.route.mina', focus: true,
      fx: [{ type: 'SPAWN_OBJECT', objectId: 'balloonbunch' }, { type: 'ACTOR_MOVE', actorId: 'mina', pathId: 'minaFly', wander: 0, delayMs: 800 }, { type: 'OBJECT_MOVE', objectId: 'balloonbunch', pathId: 'minaFlyB', delayMs: 800 },
        { type: 'ACTOR_SPEECH', actorId: 'mina', text: 'わああ、とんでるー！ パパー！ どこー！', delayMs: 2500 },
        { type: 'ACTOR_SPEECH', actorId: 'papa', text: 'ん？ 空に……ミナ！？ ミナーーー！', delayMs: 9000 }, { type: 'ACTOR_MOVE', actorId: 'papa', to: [6400, 1700], speed: 300, wander: 30, delayMs: 9000 },
        { type: 'FX', kind: 'hearts', at: 'papa', delayMs: 16500 }, { type: 'HIDE_OBJECT', objectId: 'balloonbunch', delayMs: 17000 }, { type: 'ACTOR_SET_STATE', actorId: 'papa', state: 'HAPPY', delayMs: 16500 }],
      after: [{ actor: 'mina', text: 'パパ、見つけたー！', delay: 17000 }, { actor: 'papa', text: 'もう二度と手をはなさないからな……！', delay: 19000 }] },
    { id: 'S6-E17', s: 'mina', t: 'info', cat: 'BRANCH', title: 'ミナ、案内所で保護される', say: '（案内所）迷子のお嬢ちゃんね。お名前は？ ミナちゃん。すぐ呼び出すからね', anim: 'react.think', route: 'S6.route.mina',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'mina', to: [880, 1380], speed: 140, wander: 20 }, { type: 'ACTOR_MOVE', actorId: 'infostaff', to: [760, 1360], speed: 120, wander: 20 }, { type: 'SET_FLAG', id: 'mina.atInfo', value: true }, { type: 'PLAY_SOUND', soundId: 'bell', delayMs: 1500 }],
      after: [{ actor: 'infostaff', text: '〽迷子のお知らせです。黄色い服のミナちゃん……（でもスピーカーの声、届くかしら）', delay: 3200 }] },
    { id: 'S6-E18', s: 'pa', t: 'papa', cat: 'PROGRESSION', requires: ['S6-E17'], title: '迷子放送がパパに届く', say: '〽黄色い服のミナちゃんが案内所で……ミナだ！ いま行くぞー！', anim: 'react.run', route: 'S6.route.mina',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'papa', to: [960, 1400], speed: 420, wander: 30 }, { type: 'ACTOR_SET_STATE', actorId: 'papa', state: 'RUNNING' },
        { type: 'ACTOR_SET_STATE', actorId: 'papa', state: 'HAPPY', delayMs: 14000 }, { type: 'FX', kind: 'hearts', at: 'mina', delayMs: 14000 }, { type: 'PLAY_SOUND', soundId: 'success', delayMs: 14000 }],
      after: [{ actor: 'mina', text: 'パパーーー！', delay: 14000 }, { actor: 'infostaff', text: 'よかったね、ミナちゃん', delay: 16000 }] },
    { id: 'S6-E19', s: 'rabbit', t: 'mina', cat: 'FLAVOR', title: 'ピョンタがミナをはげます', say: 'わあ、ウサギさん！ ……えへへ、ちょっと元気出た', anim: 'react.happy', route: 'S6.route.mina',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'rabbit', text: '（ピョンピョン！ 両手で大きなハート）', delayMs: 1600 }, { type: 'FX', kind: 'hearts', at: 'mina', delayMs: 1800 }] },
    { id: 'S6-E20', s: 'wig', t: 'mina', cat: 'FLAVOR', title: 'ミナ、カツラで大笑い', say: 'なにこれ、毛虫？ あははは！ もじゃもじゃ〜！', anim: 'react.laugh', route: 'S6.route.mina',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'bucho', text: 'け、毛虫……', delayMs: 2400 }] },
    { id: 'S6-E21', s: 'squirrel', t: 'mina', cat: 'FLAVOR', blocksIfCompleted: ['S6-E16', 'S6-E17'], title: 'ミナ、トイレに駆けこむ', say: 'リスさん、あっちをさしてる……あっ！ ミナ、トイレ行きたかったんだ！', anim: 'react.run', route: 'S6.route.mina',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'mina', to: [4520, 1300], speed: 260, wander: 0 }, { type: 'ACTOR_HIDE', actorId: 'mina', delayMs: 14000 }, { type: 'ACTOR_SHOW', actorId: 'mina', delayMs: 19000 },
        { type: 'ACTOR_MOVE', actorId: 'mina', to: [1050, 1720], speed: 260, wander: 60, delayMs: 19000 }, { type: 'ACTOR_SPEECH', actorId: 'mina', text: 'すっきり！ ……でも、パパはいないまんま', delayMs: 20000 }] },

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
      fx: [{ type: 'ACTOR_MOVE', actorId: 'prank', to: [4780, 1400], speed: 260 }, { type: 'SPAWN_OBJECT', objectId: 'can4', delayMs: 2600 }, { type: 'PLAY_SOUND', soundId: 'pop', delayMs: 2600 }, { type: 'ACTOR_MOVE', actorId: 'prank', to: [4900, 1650], speed: 200, wander: 180, delayMs: 3000 }],
      after: [{ actor: 'cleaner', text: 'いま、カランって音がしたねえ……', delay: 3600 }] },
    { id: 'S6-E25', s: 'prank', t: 'cleaner', cat: 'CHAIN', requires: ['S6-E24'], title: 'ケン坊、ポイ捨てを叱られる', say: 'こら、ボウズ！ 缶は投げるもんじゃない、捨てるもんだ！', anim: 'react.angry', route: 'S6.route.clean',
      fx: [{ type: 'ACTOR_SET_STATE', actorId: 'prank', state: 'EMBARRASSED', delayMs: 1500 }, { type: 'ACTOR_SPEECH', actorId: 'prank', text: 'ご、ごめんなさい……。ボク、どっかおかしいのかな……', delayMs: 2500 }],
      after: [{ actor: 'toolman', text: 'ん？ どこか調子が悪いのかい？', delay: 5000 }] },
    { id: 'S6-E26', s: 'geta', t: 'prank', cat: 'FLAVOR', title: 'ケン坊、下駄でカランコロン', say: 'カランコロン！ うわ、走れねえ！ でもいい音！', anim: 'react.laugh', route: 'S6.route.clean',
      fx: [{ type: 'HIDE_OBJECT', objectId: 'geta' }, { type: 'ACTOR_APPEARANCE', actorId: 'prank', look: { pants: '#3a3a3a' } }, { type: 'ACTOR_MOVE', actorId: 'prank', to: [5400, 1800], speed: 40, wander: 60 }, { type: 'PLAY_SOUND', soundId: 'hit', delayMs: 600 }] },
    { id: 'S6-E27', s: 'prank', t: 'toolman', cat: 'FLAVOR', title: 'ケン坊、工具おじさんに「修理」される', say: 'ガタつく子だねえ。どれ、ネジをキュッと……はい、修理完了！', anim: 'react.think', route: 'S6.route.clean',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'prank', to: [5380, 1460], speed: 160, wander: 20 }, { type: 'FX', kind: 'sparkle', at: 'prank', delayMs: 2200 },
        { type: 'ACTOR_SPEECH', actorId: 'prank', text: 'ピ、ピピッ。ボクハ、イイコ、ニ、ナリマシタ', delayMs: 3200 }, { type: 'ACTOR_APPEARANCE', actorId: 'prank', look: { acc: ['helmet'] }, delayMs: 2200 }, { type: 'ACTOR_SET_STATE', actorId: 'prank', state: 'RESOLVED', delayMs: 3200 }] },

    // ── デート ──
    { id: 'S6-E28', s: 'camvend', t: 'kare', cat: 'CHAIN', title: 'ユウスケ、使い切りカメラを買う', say: 'カメラ……そうだ、カメラを忘れてたんだ！ ここで買えるじゃないか！', anim: 'react.surprised', route: 'S6.route.date',
      fx: [{ type: 'ACTOR_APPEARANCE', actorId: 'kare', look: { acc: ['bag', 'camera'] }, delayMs: 1200 }, { type: 'PLAY_SOUND', soundId: 'pop', delayMs: 1200 }, { type: 'ACTOR_SPEECH', actorId: 'kano', text: 'え、カメラ忘れてたの？ 言ってよ〜', delayMs: 2800 }],
      after: [{ actor: 'kare', text: 'でも、ふたりで写るにはだれかに頼まないと……', delay: 5200 }] },
    { id: 'S6-E29', s: 'lady1', t: 'kare', cat: 'CHAIN', requires: ['S6-E28'], title: '旅の二人組がカップル写真を撮る', say: 'え、撮ってくれるんですか！？ お願いします！', anim: 'react.photo', route: 'S6.route.date',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'lady1', to: [2780, 2000], speed: 260 }, { type: 'ACTOR_MOVE', actorId: 'lady2', to: [2720, 2020], speed: 260 }, { type: 'ACTOR_SPEECH', actorId: 'lady1', text: 'はい、もっとくっついて〜！ 3、2、1……', delayMs: 3500 },
        { type: 'FX', kind: 'flash', at: 'kare', delayMs: 5200 }, { type: 'PLAY_SOUND', soundId: 'capture', delayMs: 5200 }, { type: 'FX', kind: 'hearts', at: 'kano', delayMs: 5600 }],
      after: [{ actor: 'lady2', text: 'いいなあ……ハルカ、わたしたちも撮ろ', delay: 7600 }] },
    { id: 'S6-E30', s: 'ritsuko', t: 'kare', cat: 'FLAVOR', requires: ['S6-E28'], title: 'メガネのママがプロ級の一枚を撮る', say: 'あ、撮ってもらえるんですか？ ……え、そんな低い角度から？', anim: 'react.photo', route: 'S6.route.date',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'ritsuko', to: [2780, 2050], speed: 300, wander: 40 }, { type: 'ACTOR_SPEECH', actorId: 'ritsuko', text: 'はい、寝そべって撮るわよ。背景にコースターを入れて……いま！', delayMs: 3800 },
        { type: 'FX', kind: 'flash', at: 'kare', delayMs: 5600 }, { type: 'PLAY_SOUND', soundId: 'capture', delayMs: 5600 }],
      after: [{ actor: 'kano', text: 'すごい、雑誌の表紙みたい！', delay: 7400 }] },
    { id: 'S6-E31', s: 'coaster', t: 'kano', cat: 'BRANCH', title: 'アカリ、コースターを断固拒否', say: 'ムリムリムリ！ あんなの乗ったら魂が出ちゃう！ ……お化け屋敷にしよ？', anim: 'react.scared', route: 'S6.route.date',
      fx: [{ type: 'SET_FLAG', id: 'date.plan', value: 'haunted' }, { type: 'ACTOR_MOVE', actorId: 'kano', to: [7950, 1900], speed: 160, wander: 40, delayMs: 2000 }, { type: 'ACTOR_MOVE', actorId: 'kare', to: [7880, 1900], speed: 160, wander: 40, delayMs: 2200 }],
      after: [{ actor: 'kare', text: '（お化け屋敷のほうが、ぼくはムリなんだけど……）', delay: 3200 }] },
    { id: 'S6-E32', s: 'haunted', t: 'kano', cat: 'BRANCH', title: 'アカリ、お化け屋敷を断固拒否', say: 'ぜっっったいイヤ！ 暗いのも、おどかされるのも！ ……メリーゴーランドならいいよ', anim: 'react.scared', route: 'S6.route.date',
      fx: [{ type: 'SET_FLAG', id: 'date.plan', value: 'carousel' }, { type: 'ACTOR_MOVE', actorId: 'kano', to: [560, 1600], speed: 160, wander: 40, delayMs: 2000 }, { type: 'ACTOR_MOVE', actorId: 'kare', to: [640, 1610], speed: 160, wander: 40, delayMs: 2200 }],
      after: [{ actor: 'kare', text: 'ふう、助かった……いや、なんでもない', delay: 3200 }] },
    { id: 'S6-E33', s: 'bijin', t: 'kare', cat: 'FLAVOR', title: 'ユウスケ、謎の美人に見とれる', say: '……はっ！ い、いや、見てないよ？ 観覧車を見てたんだよ？', anim: 'react.embarrassed', route: 'S6.route.date',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'kano', text: 'ふーん。観覧車、あっちだけど？', delayMs: 2400 }, { type: 'ACTOR_SET_STATE', actorId: 'kano', state: 'ANGRY', delayMs: 2400 }, { type: 'ACTOR_SET_STATE', actorId: 'kano', state: 'IDLE', delayMs: 12000 }] },

    // ── 射的とメガネの親子 ──
    { id: 'S6-E34', s: 'sota', t: 'ritsuko', cat: 'CHAIN', requires: ['S6-E14'], title: 'リツコ、うちの子を見なかったか聞く', say: 'あら、さっきの落ちる乗り物の子ね。ねえ、メガネの男の子見なかった？', anim: 'react.think', route: 'S6.route.shoot',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'sota', text: '射的のとこで、ロボットにらんでたよ！', delayMs: 2400 }, { type: 'ACTOR_MOVE', actorId: 'ritsuko', to: [6900, 1600], speed: 180, wander: 80, delayMs: 3400 }],
      after: [{ actor: 'ritsuko', text: 'やっぱり射的ね。あの子、あきらめが悪いから', delay: 4400 }] },
    { id: 'S6-E35', s: 'hero', t: 'takumi', cat: 'FLAVOR', title: 'タクミ、ヒーローの構えで命中', say: 'ヒーローなら……こう構える！ ……当たった！ ロボット、ゲット！', anim: 'react.sparkle', route: 'S6.route.shoot',
      fx: [{ type: 'PLAY_SOUND', soundId: 'hit', delayMs: 600 }, { type: 'FX', kind: 'confetti', at: 'takumi', delayMs: 900 }, { type: 'ACTOR_SPEECH', actorId: 'shooter', text: 'お見事！ 一等、持ってけドロボー！', delayMs: 2200 }] },
    { id: 'S6-E36', s: 'shooter', t: 'takumi', cat: 'FLAVOR', title: 'タクミ、アドバイスで力んで外す', say: '肩の力をぬいて、心をカラッポ……カラッポ……あっ、外れた', anim: 'react.sad', route: 'S6.route.shoot',
      fx: [{ type: 'PLAY_SOUND', soundId: 'whistle', delayMs: 800 }, { type: 'ACTOR_SPEECH', actorId: 'shooter', text: '……カラッポにしすぎたな', delayMs: 2400 }] },
    { id: 'S6-E37', s: 'panel', t: 'takumi', cat: 'PROGRESSION', title: 'タクミ、顔ハメパネルで記念撮影', say: 'これだ！ 今日の記念！ ……ママー、撮ってー！', anim: 'react.photo', route: 'S6.route.shoot',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'takumi', to: [7700, 1560], speed: 220, wander: 0 }, { type: 'OBJECT_APPEARANCE', objectId: 'panel', look: { sign: { text: '🤓 ヒーロー参上', fill: '#ffcf3f', color: '#c0392b', s: 20 } }, delayMs: 2600 },
        { type: 'FX', kind: 'flash', at: 'panel', delayMs: 3200 }, { type: 'PLAY_SOUND', soundId: 'capture', delayMs: 3200 }, { type: 'ACTOR_MOVE', actorId: 'takumi', to: [7550, 1650], speed: 120, wander: 40, delayMs: 6000 }],
      after: [{ actor: 'takumi', text: '一生の宝物にする！', delay: 4200 }] },

    // ── 落とし物 ──
    { id: 'S6-E38', s: 'pa', t: 'hphone', cat: 'FLAVOR', title: 'DJ青年、自分の落とし物に気づく', say: 'ん？ 黒い財布の落とし物……それ、オレのじゃん！', anim: 'react.surprised', route: 'S6.route.misc',
      fx: [{ type: 'ACTOR_APPEARANCE', actorId: 'hphone', look: { acc: ['sunglasses'] } }, { type: 'ACTOR_MOVE', actorId: 'hphone', to: [1000, 1450], speed: 400, wander: 40, delayMs: 1500 }],
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
      fx: [{ type: 'ACTOR_MOVE', actorId: 'gal', to: [7500, 1780], speed: 200, wander: 30 }, { type: 'ACTOR_SPEECH', actorId: 'juggler', text: 'オレ……やっと見つけてもらえた……！', delayMs: 2400 }, { type: 'FX', kind: 'confetti', at: 'juggler', delayMs: 2400 }] },

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
      fx: [{ type: 'ACTOR_MOVE', actorId: 'osaM', to: [5200, 1250], speed: 200, wander: 20 }, { type: 'ACTOR_SPEECH', actorId: 'osaF', text: 'もう、そういうとこやで。……好きなん', delayMs: 2600 }, { type: 'FX', kind: 'hearts', at: 'osaF', delayMs: 2600 }, { type: 'ACTOR_MOVE', actorId: 'osaM', to: [5330, 1500], speed: 160, wander: 40, delayMs: 8000 }] },
    { id: 'S6-E49', s: 'tohF', t: 'tohM', cat: 'FLAVOR', title: '東北のふたり', say: '手っこ冷えだべ？ ほれ、オラのポケットさ入れでけろ。ぬぐだまるべ', anim: 'react.love', route: 'S6.route.dialect',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'tohF', text: 'ほんとだ、ぬぐいなや……', delayMs: 2600 }, { type: 'FX', kind: 'hearts', at: 'tohF', delayMs: 2600 }] },
    { id: 'S6-E50', s: 'hakF', t: 'hakM', cat: 'FLAVOR', title: '博多のふたり', say: 'こわかったとや？ よかよか、俺がずーっと横におるけん。なんも心配いらんばい', anim: 'react.love', route: 'S6.route.dialect',
      fx: [{ type: 'ACTOR_SPEECH', actorId: 'hakF', text: 'もう……そげん言われたら、また入りたくなるやん', delayMs: 2800 }, { type: 'FX', kind: 'hearts', at: 'hakF', delayMs: 2800 }] },
    // ── 登山家 ──
    { id: 'S6-E51', s: 'mountain', t: 'climber', cat: 'FLAVOR', title: '登山家、作り物の山にほれこむ', say: 'なんと見事な稜線……！ 作り物とは思えん！ 呼ばれておる、山がわしを呼んでおる！', anim: 'react.sparkle', route: 'S6.route.misc',
      fx: [{ type: 'ACTOR_MOVE', actorId: 'climber', to: [8820, 1250], speed: 360, wander: 40 }, { type: 'ACTOR_SPEECH', actorId: 'climber', text: 'ヤッホーーー！！', delayMs: 18000 }, { type: 'PLAY_SOUND', soundId: 'whistle', delayMs: 18000 }],
      after: [{ actor: 'painter', text: '……あの登山家、描きがいがありそうじゃのう', delay: 19500 }] },

    // ── フィナーレ ──
    { id: 'S6-E52', s: 'aud5', t: 'host', cat: 'PROGRESSION', requires: ['S6-E08'], cond: [cnt(QA, 5)], title: '答え：らしさとは、おじぎ', say: 'わたしたちらしさ？ それは……（ペコリ）すみません（ペコリ）おそれいります（ペコリ）……おじぎが止まらないことです！', anim: 'react.laugh', route: 'S6.route.show', focus: true,
      fx: [{ type: 'ACTOR_ANIMATION', actorId: 'host', animationId: 'react.embarrassed', delayMs: 2500 }, { type: 'ACTOR_SPEECH', actorId: 'aud1', text: '（つられてペコリ）', delayMs: 3000 }, { type: 'ACTOR_SPEECH', actorId: 'aud6', text: '（つられてペコリ）', delayMs: 3400 }, { type: 'PLAY_SOUND', soundId: 'laugh', delayMs: 3400 }],
      after: [{ actor: 'aud5', text: 'ふふっ。……じゃあ最後に、いちばん聞きたかったこと、聞いてもいいかな', delay: 5600 }, { actor: 'host', text: 'それはぜひ、園内のみなさんが笑顔になってから！', delay: 8200 }] },
    { id: 'S6-E53', s: 'aud5', t: 'host', cat: 'TERMINAL', requires: ['S6-E52'], cond: [done('S6-E22'), done('S6-E37'), { anyEventDone: ['S6-E16', 'S6-E18'] }, { anyEventDone: ['S6-E29', 'S6-E30'] }],
      title: 'さよなら、またいつか！ ハテナランド大フィナーレ', say: '楽しい時間は、なぜ終わるのか？ ……終わるからこそ、また会いたくなるんです！ さあ園内のみなさん、ごいっしょに！ さようなら、そしてまたいつか！', anim: 'react.terminal', route: 'S6.route.end',
      fx: [
        { type: 'CAMERA_FOCUS', x: 3800, y: 1400, zoom: 0.8 },
        { type: 'PLAY_SOUND', soundId: 'fanfare', delayMs: 500 }, { type: 'FX', kind: 'confetti', at: 'host', delayMs: 600 },
        { type: 'SPAWN_OBJECT', objectId: 'rainbow', delayMs: 600 },
        { type: 'FX', kind: 'eruption', x: 3400, y: 700, delayMs: 1200 }, { type: 'FX', kind: 'eruption', x: 4200, y: 700, delayMs: 1500 }, { type: 'PLAY_SOUND', soundId: 'boom', delayMs: 1200 },
        { type: 'ACTOR_MOVE', actorId: 'rabbit', to: [3550, 1420], speed: 600, wander: 30, delayMs: 800 }, { type: 'ACTOR_MOVE', actorId: 'squirrel', to: [4050, 1420], speed: 600, wander: 30, delayMs: 800 },
        { type: 'ACTOR_MOVE', actorId: 'mina', to: [3700, 1470], speed: 600, wander: 10, delayMs: 800 }, { type: 'ACTOR_MOVE', actorId: 'papa', to: [3760, 1480], speed: 600, wander: 10, delayMs: 800 },
        { type: 'ACTOR_MOVE', actorId: 'bucho', to: [3900, 1480], speed: 600, wander: 10, delayMs: 800 }, { type: 'ACTOR_MOVE', actorId: 'sota', to: [3960, 1470], speed: 600, wander: 10, delayMs: 800 },
        { type: 'ACTOR_MOVE', actorId: 'takumi', to: [3450, 1480], speed: 600, wander: 10, delayMs: 800 }, { type: 'ACTOR_MOVE', actorId: 'kare', to: [4150, 1480], speed: 600, wander: 10, delayMs: 800 }, { type: 'ACTOR_MOVE', actorId: 'kano', to: [4210, 1480], speed: 600, wander: 10, delayMs: 800 },
        { type: 'ACTOR_SPEECH', actorId: 'mina', text: 'またくるねー！', delayMs: 2200 }, { type: 'ACTOR_SPEECH', actorId: 'bucho', text: '（カツラを高々と振って）さようならー！', delayMs: 2800 },
        { type: 'ACTOR_SPEECH', actorId: 'takumi', text: 'ヒーローは、また来る！', delayMs: 3400 }, { type: 'ACTOR_SPEECH', actorId: 'kano', text: 'また、ふたりで来ようね', delayMs: 4000 },
        { type: 'ACTOR_SPEECH', actorId: 'coaster', text: 'キャーーー！（いい意味で）', delayMs: 4400 }, { type: 'ACTOR_SPEECH', actorId: 'aud5', text: '……うん。また、会いたくなっちゃった', delayMs: 5000 },
        { type: 'FX', kind: 'stars', at: 'rainbow', delayMs: 4600 }, { type: 'FX', kind: 'confetti', at: 'aud5', delayMs: 5000 }, { type: 'ACTOR_SET_STATE', actorId: 'host', state: 'HAPPY', delayMs: 5000 },
        { type: 'WAIT', durationMs: 5600 },
      ] },
  ],
};
