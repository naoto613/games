# ステージデータの書き方（content-format）

ステージは `js/content/sN.js` の **データだけ** で定義する（エンジンのコードは触らない）。
`js/content/s1.js` が完全な見本。読み込み時に `js/engine/content.js` の `normalizeStage()` が
仕様書 5/13/14 章の StageDefinition / EventDefinition へ展開する。

検証: `node tools/validate.mjs S2`（構文・参照・循環・到達可能性。終端に到達できないとエラー）
単体ファイル検証: `node tools/validate-file.mjs js/content/s2.js`

## 座標系とサイズ感（参考：俯瞰で全体が一望でき、寄ると人物の表情が見える）

- 単位は「ワールド px」。`world.width × world.height`。左上が (0,0)。
- **世界は横 2:1 前後**（例 6400×3200）。開始時は世界全体が一画面に収まる「俯瞰」になり、ピンチで寄って観察する。
  黒い余白を出さないため最小ズームは画面を覆う倍率（端が少し切れる）。
- 広いステージは「横に長い 1 本の道」ではなく、**上下に何段も帯を重ねた 1 枚の地図**にする
  （空と山 → 湖や広場 → 道 → 店の列 → 道 → 店の列 … のように、上ほど奥）。人や店を画面いっぱいに密に置く。
- **actor / object の (x, y) は「足もと（下端中央）」**。y が大きいほど手前に描かれる（y ソート）。
  `z: 数値` を付けると重なり順だけ y の代わりにその値を使う（机の上の小物を机より手前に描く、など）。
- scenery の `emoji` / `text` は中心座標、`rect` / `sign` は左上、`building` / `prop` は下端。
- 人物は頭の大きいイラスト調。大人 `h: 170` 前後、子ども `h: 125` 前後（屋内の近景ステージは 300 以上）。
  俯瞰では小さく見え、ピンチで寄ると表情が分かる。小物（size 26〜40）は寄らないと見つけにくい。`minZoom: 1.3` で「近づかないと撮れない」物を作れる。
- 見た目の確認：`npx http-server -p 8123 -s . &` のあと `NODE_PATH=$(npm root -g) node tools/shot.mjs S2 /tmp/s2 "Pixel 7 landscape" x y zoom`
  （`/tmp/s2-a.png` が開始時の俯瞰、`-b.png` が (x,y) に寄った画面）。

## トップレベル

```js
export default {
  id: 'S2', title: 'ステージ名', subtitle: 'テーマ', theme: '商店街',
  intro: '開始時に出る 1〜2 文の導入',
  timeLimitMs: 300000,
  world: { width, height, minZoom: 0.75, maxZoom: 4, bg: '#色', spawnCamera: { x, y, zoom: 1 } },
  bgm: { tempo: 110, key: 2, mood: 'major' | 'minor' | 'swing' | 'calm' },
  clearEventId: 'S2-E66', timeoutEventId: 'S2-E65',   // S6 は timeoutEventId: null
  routes: { 'S2.route.jiro': '表示名', ... },          // 図鑑のルート別発見率
  scenery: [...], actors: {...}, objects: {...}, paths: {...},
  reactions: [...], exclusiveGroups: [...], timeline: [...], events: [...],
}
```

## scenery（タップできない背景・飾り。50% はダミーで良い）

| t | 項目 |
|---|---|
| rect | x,y,w,h, fill, stroke?, lw?, r?(角丸) |
| ellipse | x,y(中心), rx, ry, fill, stroke? |
| poly | pts:[x,y,x,y,...], fill, stroke? |
| line | pts:[...], stroke, w |
| emoji | e:'🌳', x,y(中心), s(サイズ), rot? |
| text | text, x,y(中心), s, fill, bold? |
| stripes | x,y,w,h, dir:'h'/'v', n, c1, c2 |
| sign | x,y(左上), w,h, text, fill, color, s |
| building | x, y(下端), w, h, fill, roof?:色, roofStyle?:'gable'(既定)/'flat'/'tile'(瓦), sign?:'店名', signFill?, signColor?, signSize?, awning?:色（店先の縞の日よけ＋ショーウィンドウ）, shop?:true（日よけなしの店先）, goods?:[色...], windowColor?, door?, windows?, unit?:全体の拡大率(既定1) |
| prop | kind, x, y(下端), s(高さの目安), flip?, color? ほか種類ごとの項目（下表） |
| sky | x,y,w,h, c1(上の色), c2(下の色) — グラデーションの空 |
| water | x,y,w,h, fill?（波線つき） |
| road | x,y,w,h, fill?（中央線つき） |
| rail | x,y(レール位置), w |
| fence | x,y(下端), w, h?, fill? |

### prop の種類（絵文字よりこちらを優先。フラットなイラスト調で描かれる）

屋外：tree(color, fruit) / pine / palm / bush(color, flower) / flower(color) / tulip / pot / cactus / grass / mountain(color, snow, wide) / hill(color, wide) / cloud / sun /
house(color, roof) / car(color, police) / bus(color) / truck / bike / tent(color) / dome(color) / bench / lamp / signpost(text) / table(cloth) / parasol(color) /
rock / logs / campfire / vending(color) / trash / mailbox / fountain / ferris / boat(color) / fence
屋内：chabudai(w) / tvset(w, on, text) / roomwindow(w, open) / cabinet(w) / hanglamp / fusuma(w, n, art) / wallclock / cushion(color) / calendar(text) / stove
動物：cat(color) / dog(color) / bird(color)

よく使う絵文字（🌳🌲🚗🚌⛺🏠☁️⛰️🐈🐕🐦 など）は自動でこの prop に置き換えて描かれる。
object にも `prop: 'tvset', propOpts: {...}, size, w, h` で使える（OBJECT_APPEARANCE の look.propOpts で見た目を変更できる）。

## actors（人・動物。全員ちょっかいの「相手」にできる。capturable: true なら画像としても撮れる）

```js
jiro: {
  name: '表示名', x, y,
  look: { h:150, skin:'#f2c9a0', hair:'short', hairColor:'#333', shirt:'#色', pants:'#色', skirt:false,
          acc:['glasses'], hatColor:'#色', wide:false, muscle:false, sit:false, kid:false, old:false, costume:null },
  // 動物・着ぐるみ以外の生き物などは look の代わりに emoji: '🐕', size: 70
  wander: 60,            // 足もと周辺をうろうろする幅（0 で静止）
  path: [[x,y],[x,y]],   // 指定すると巡回（ループ）。wander より優先
  speed: 60, hidden: false, capturable: true, minZoom: 0,
  idle: [ '台詞', { text: '条件つきの台詞', when: [ 条件... ], once: false } ],
  idleEveryMs: 9000,
}
```

hair: short / long / bun / bald / spiky / pony / twin / afro / mohawk / bob / topknot(ちょんまげ) / none
acc: glasses / sunglasses / beard / mustache / hat / cap / ribbon / apron / tie / helmet / headphones / mask / bag / scarf / earring / crown / camera / flower
costume: '🐰' のように指定すると頭が着ぐるみになる。

**idle の台詞はヒント**（25.3 章）。答えを言わない（×「ジョウロを撮って私に使って」 ○「花がしおれちゃった……」）。
`when` で「あるイベント後だけ言う」台詞を作ると、連鎖の手がかりになる（新しく条件を満たした台詞は優先して喋る）。

## objects（タップで撮れる物。capturable:false で撮れない飾り）

```js
tissue: { name: 'ティッシュ', emoji: '🧻', size: 40, x, y, minZoom: 0, hidden: false, targetable: false, rot: 0 },
board:  { name: '掲示板', sign: { text: '文字', fill: '#色', color: '#文字色', s: 22 }, w: 120, h: 80, x, y },
```

- hidden: true の物は `SPAWN_OBJECT` で出現させる。
- 何かのイベントの target になっている物は自動で「相手」にもなる。

## events

```js
{ id: 'S2-E05', s: 'source の id', t: 'target の id', cat: 'FLAVOR'|'CHAIN'|'PROGRESSION'|'BRANCH'|'TERMINAL'|'TIMEOUT',
  title: '図鑑に出る出来事名', say: 'target の反応台詞', anim: 'react.happy',
  route: 'S2.route.xxx',
  cond: [ 条件... ], requires: ['S2-E01'], blocksIfCompleted: ['S2-E07'],
  group: '排他グループID',        // 同じ group で最初に起きた 1 つ以外は無効化（FIRST_TRIGGER_WINS）
  invalidates: ['S2-E09'], triggerCountMin: 3, decoy: false, focus: false, points: 省略可(カテゴリで自動),
  fx: [ 効果... ],
  after: [ { actor: 'id', text: '連鎖の手がかりになる台詞', delay: 2600 } ],
}
```

- 同じ source×target に複数イベントがあってもよい（priority→記述順で 1 つ選ばれる）。順番に起きるものは requires でつなぐ。
- TIMEOUT は時間切れで強制発生する（プレイヤー操作では起きない）。TERMINAL が起きるとクリア。
- **後続イベントの source / target は、そのイベントが起こせる時点で見えている（hidden でない）こと。**

### 条件

`{eventDone}` `{eventNotDone}` `{anyEventDone:[]}` `{allEventsDone:[]}` `{countAtLeast:{id,value}}` `{countAtMost:{id,value}}`
`{flagEquals:{id,value}}` `{actorStateEquals:{actorId,value}}` `{objectStateEquals:{objectId,value}}`
`{timeRemainingAtLeastMs}` `{timeRemainingAtMostMs}` `{actorVisible}` `{objectVisible}` `{all:[]}` `{any:[]}` `{not:{}}`

### 効果（fx）。`delayMs` で反応からの遅れを指定できる。`WAIT` は以降の効果をまとめて遅らせる

| type | 項目 |
|---|---|
| ACTOR_SET_STATE | actorId, state（IDLE/WALKING/RUNNING/WAITING/BUSY/HAPPY/ANGRY/SURPRISED/EMBARRASSED/SAD/SCARED/RESOLVED） |
| ACTOR_MOVE | actorId, to:[x,y] か pathId, speed?, wander?（移動後のうろうろ幅） |
| ACTOR_FACE | actorId, direction: LEFT/RIGHT |
| ACTOR_SPEECH | actorId, text |
| ACTOR_ANIMATION | actorId, animationId |
| ACTOR_APPEARANCE | actorId, look:{ 変更する見た目だけ }（例 {skin:'#333'} {hair:'afro'} {muscle:true}） |
| ACTOR_SHOW / ACTOR_HIDE | actorId |
| OBJECT_SET_STATE | objectId, state（VISIBLE/HIDDEN/MOVING/USED/BROKEN） |
| OBJECT_MOVE | objectId, to:[x,y] か pathId, speed? |
| OBJECT_APPEARANCE | objectId, look:{ emoji?, sign?, size?, rot? } |
| SPAWN_OBJECT / HIDE_OBJECT | objectId（actor の id でも可） |
| SET_FLAG | id, value |
| INCREMENT_COUNTER | id, amount |
| FX | kind, at:'entity id' または x,y |
| PLAY_SOUND | soundId |
| CAMERA_FOCUS | x, y, zoom |
| QUEUE_EVENT | eventId, delayMs（条件を満たしていれば自動で起きる） |
| WAIT | durationMs |

FX kind: sparkle / hearts / smoke / steam / fire / splash / flash / confetti / stars / paper / eruption / lightning / big / zzz / ink / bubbles / notes / leaves
soundId: capture / send / success / surprise / laugh / hit / vehicle / tv / boom / splash / train / bell / whistle / roar / fanfare / thunder / pop / crash

### アニメーション（anim）

react.surprised / happy / angry / think / sad / scared / embarrassed / laugh / love / eat / drink / fall / run / spin / sleep / wake / sparkle / transform / splash / fire / hit / photo / shrug / terminal / timeout

## reactions（イベントではない「ちょっとした反応」。カウンタを進められる）

```js
{ s: 'hotpot', t: 'daughter', say: '台詞', counter: 'S1-hotpot-hint', when: [条件], anim: 'react.angry' }
```

## timeline（世界の時間軸。列車の到着など）

```js
{ at: 30000, effects: [...] }                         // 1 回
{ every: 45000, start: 20000, when: [条件], effects: [...] }  // くり返し
```

## paths

```js
paths: { busRoute: { points: [[x,y], ...], speed: 120, loop: true } }
```
