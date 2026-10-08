# ステージデータの書き方（content-format）

ステージは `js/content/sN.js` の **データだけ** で定義する（エンジンのコードは触らない）。
`js/content/s1.js` が完全な見本。読み込み時に `js/engine/content.js` の `normalizeStage()` が
仕様書 5/13/14 章の StageDefinition / EventDefinition へ展開する。

検証: `node tools/validate.mjs S2`（構文・参照・循環・到達可能性。終端に到達できないとエラー）
単体ファイル検証: `node tools/validate-file.mjs js/content/s2.js`

## 座標系

- 単位は「ワールド px」。`world.width × world.height`。左上が (0,0)。
- **actor / object の (x, y) は「足もと（下端中央）」**。y が大きいほど手前に描かれる（y ソート）。
- scenery の `emoji` / `text` は中心座標、`rect` / `sign` / `building` は左上（building は下端 y）。
- 等倍ズーム 1.0 で画面の縦にだいたい 900 ワールド px が映る。大人は高さ約 150。
  小物（emoji size 26〜40）はズームしないと見つけにくい。`minZoom: 1.3` などで「近づかないと撮れない」物を作れる。

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
| building | x, y(下端), w, h, fill, roof?:色, sign?:'店名', signFill?, signColor?, door?:true, windows?:true, awning?:色 |
| water | x,y,w,h, fill?（波線つき） |
| road | x,y,w,h, fill?（中央線つき） |
| rail | x,y(レール位置), w |
| fence | x,y(下端), w, h?, fill? |

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
