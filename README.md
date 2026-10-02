# games

ブラウザで遊べるゲームを GitHub Pages で公開するリポジトリです。

- 一覧ページ: https://naoto613.github.io/games/
- こっそりトレジャー: https://naoto613.github.io/games/kossori-treasure/
- ふーちゃんのまち: https://naoto613.github.io/games/fuchan-town/
- キュアふーたん サバイバー: https://naoto613.github.io/games/futan-survivor/
- ふーたんの こっそりミッション: https://naoto613.github.io/games/futan-stealth/
- ふーたんと リッキーの ブロックパズル: https://naoto613.github.io/games/futan-block/
- キュアふーたんの キラキラカート: https://naoto613.github.io/games/futan-kart/
- ふーたんと リッキー すくすく にっき: https://naoto613.github.io/games/ricky-sukusuku/
- キュアふーたん ストライク: https://naoto613.github.io/games/futan-strike/
- ふーちゃんと リッキーの キラキラびょういん: https://naoto613.github.io/games/fuchan-hospital/
- キュアたんてい ふーちゃん: https://naoto613.github.io/games/cure-tantei/
- ふーたんと リッキーの こえあそびランド: https://naoto613.github.io/games/koe-asobi/
- SKY GLIDER: https://naoto613.github.io/games/sky-glider/
- GRAND CHIBIKKO AUTO: https://naoto613.github.io/games/chibikko-auto/
- ふーたんと そよかぜの タクト: https://naoto613.github.io/games/futan-takuto/
- ふーたん クエスト: https://naoto613.github.io/games/futan-quest/
- ふーたんの はちゃめちゃキッチン: https://naoto613.github.io/games/futan-kitchen/
- リモコロン 〜ふーたんと リッキーの ちょっかいタウン〜: https://naoto613.github.io/games/futan-remocolon/
- ふーモン ルビー: https://naoto613.github.io/games/fumon-ruby/

## 構成

```
.
├── index.html              # ゲーム一覧ページ（サムネイル・タイトル・説明のカード形式）
├── thumbs/                 # 一覧ページ用サムネイル（<ゲームフォルダ名>.jpg、800×500）
├── .nojekyll               # Jekyll 処理を無効化（ファイルをそのまま配信）
├── README.md
├── kossori-treasure/
│   └── index.html          # こっそりトレジャー（単一 HTML で完結）
├── futan-survivor/
│   └── index.html          # キュアふーたん サバイバー（5歳向けサバイバー系アクション。単一 HTML で完結）
├── futan-stealth/
│   └── index.html          # ふーたんの こっそりミッション（5歳向けステルスゲーム。単一 HTML で完結）
├── futan-block/
│   └── index.html          # ふーたんと リッキーの ブロックパズル（8×8 の列そろえパズル。単一 HTML で完結）
├── ricky-sukusuku/
│   └── index.html          # ふーたんと リッキー すくすく にっき（4歳向け・スマホ縦持ちの育成ゲーム。単一 HTML で完結）
├── futan-strike/
│   └── index.html          # キュアふーたん ストライク（5歳向け・スマホ縦持ちの ひっぱりアクション。単一 HTML で完結）
├── koe-asobi/
│   └── index.html          # ふーたんと リッキーの こえあそびランド（4歳〜・スマホ縦持ちの マイク録音あそび。こえへんしん15種・アカペラカラオケ（音程採点・かさねどり・ハモり）・まぜまぜぶんしょう・こえピアノ・こえビート・さかさまチャレンジ・こごえロケット。単一 HTML で完結、録音は IndexedDB に保存）
├── cure-tantei/
│   ├── index.html          # キュアたんてい ふーちゃん（5歳向け・スマホ縦持ちの 探偵＋お医者さん＋プリキュアバトル 長編。ビルド済み成果物）
│   ├── build.py            # src/*.js を連結して index.html を生成
│   └── src/                # ソース（キャラ・アイコン・背景・各ステップ・おいしゃさん・バトル・ストーリー）
├── futan-takuto/
│   ├── index.html          # ふーたんと そよかぜの タクト（5歳〜・トゥーン調 3D の うみと しまの ぼうけん。かぜのタクトで かぜを かえて ふねで しまを めぐり、3つの しずく→かみさまの とう→まものの とりでの ボス。ビルド済み成果物）
│   ├── build.py            # src/*.js を連結して index.html を生成
│   ├── three.min.js        # three.js r149（chibikko-auto と同じもの）
│   └── src/                # ソース（00 描画基盤・トゥーン/アウトライン・入力、05 おと（BGM/効果音は すべて合成）、10 そら・うみシェーダー・かぜ・地形、15 小物、20 しまの配置、30 キャラ、40 プレイヤー・ふね・カメラ、50 エフェクト・てき・NPC、60 ストーリー・ボス、70 HUD・ちず・セーブ・メインループ）
├── fumon-ruby/
│   ├── index.html          # ふーモン ルビー（5歳〜・GBA ふうの ドット絵 モンスター育成 RPG。240×160 キャンバス、タイル・キャラ・モンスターは すべて コードで 描画。町4つ／道路3本／どうくつ／火山／いせき／ジム3つ／リーグ、25種の ふーモン・捕獲・しんか・ずかん・PC・ショップ・レポート（localStorage）。BGM/効果音は すべて合成。ビルド済み成果物）
│   ├── build.py            # src/*.js を連結して index.html を生成
│   └── src/                # ソース（00 入力・ループ、05 おと、10 ドット描画、15 タイル、16 たてもの、20 キャラ、25 ふーモン、30 わざ・どうぐ、40 ウィンドウ・メッセージ、50 フィールド、60 バトル、65 メニュー、70 マップ、75 ストーリー、80 タイトル）
├── futan-kitchen/
│   ├── index.html          # ふーたんの はちゃめちゃキッチン（オーバークック風の協力クッキング。本家並みの難易度：チップ倍率×4・時間切れ減点・焦げ→延焼・皿洗い・落下リスポーン。プロローグ＋4ワールド×4ステージ＋最終決戦（トラックの隙間・通行人・揺れる船・コンベア・フライヤー・いかだ・氷・ワープ・溶岩・地震）。ひとり（シェフ交代）／ふたり（キーボード・ゲームパッド）、バスで走るワールドマップ。ビルド済み成果物）
│   ├── build.py            # src/*.js を連結して index.html を生成
│   ├── three.min.js        # three.js r149（futan-takuto と同じもの）
│   └── src/                # ソース（00 描画基盤・角丸ボックス・手続きテクスチャ・アイコン・入力・セーブ、05 BGM/効果音（すべて合成）、10 シェフ（浮いた手）・食材・調理器具のモデル、20 レシピ・テーマ・ステージ、30 厨房ルール（調理・提供・チップ・投げる・火事・隙間・ワープ・通行人・落下）、40 プレイヤー・HUD・カメラ、60 ストーリー、65 ワールドマップ、70 ゲーム進行・メインループ）
├── futan-remocolon/
│   └── index.html          # リモコロン 〜ふーたんと リッキーの ちょっかいタウン〜（4歳〜・スマホ縦持ち。PS2『リモココロン』風の ちょっかい アドベンチャー。リモコンの ようせい コロンで つんつん→ビデオで ろくが→こまった ひとの こころに うつして えがおに。てがき ふうの ゆらゆら せん・3ステージ・よみあげ ナビ。単一 HTML で完結）
├── futan-quest/
│   ├── index.html          # ふーたん クエスト（5歳〜・リアル調 3D のドラクエ風 RPG。フィールド／町2つ／ダンジョン3つ／コマンドバトル（おまかせ付き）／レベル・じゅもん・装備・店・宿／ボス3体＋2形態のラスボス／エンディング。ビルド済み成果物）
│   ├── build.py            # src/*.js を連結して index.html を生成
│   ├── three.min.js        # three.js r149（chibikko-auto と同じもの）
│   └── src/                # ソース（00 描画基盤・空・テクスチャ、10 地形・草・木、15 建物・町、20 ダンジョン、30 キャラ・モンスター、35 音楽、40 データ、45 ウィンドウUI、50 フィールド、55 エフェクト、60 バトル、65 ストーリー、70 ゲーム進行・メニュー）
├── chibikko-auto/
│   ├── index.html          # GRAND CHIBIKKO AUTO（5歳〜・リアル調 3D オープンワールド。GTA 風の まちを あるく／くるまに のる／7 ミッション／てはい＆パトカー／スタントジャンプ／かくれほし／ラジオ。ビルド済み成果物）
│   ├── build.py            # src/*.js を連結して index.html を生成
│   ├── three.min.js        # three.js r149（sky-glider と同じもの）
│   └── src/                # ソース（00 描画基盤・空・テクスチャ、10 まち生成・当たり判定、20 くるま、30 ひと、35 おと、40 プレイヤー・カメラ、50 エフェクト・マーカー、60 ミッション、70 ゲーム進行・HUD・レーダー）
├── sky-glider/
│   ├── index.html          # SKY GLIDER（全年齢・リアル調の 3D グライダーアクション。手続き生成の渓谷・物理ベースの空と大気フォグ・地形の影焼き込み。単一 HTML＋three.js）
│   └── three.min.js        # three.js r149（futan-kart と同じもの）
├── futan-kart/
│   ├── index.html          # キュアふーたんの キラキラカート（5歳向け・タブレット想定の 3D カートレース）
│   └── three.min.js        # three.js r149（fuchan-town と同じもの）
├── fuchan-hospital/
│   ├── index.html          # ふーちゃんと リッキーの キラキラびょういん（5歳向け・スマホ縦持ちの おいしゃさんごっこ。ビルド済み成果物）
│   ├── build.py            # src/*.js を連結して index.html を生成
│   └── src/                # ソース（00_base は ふーちゃんのまち から流用した絵・音・声、23_town が さいしょの まち（びょういん／しかいいんを えらぶ）、22_map が たてものの なかの マップ、30〜3e が びょういんの おへや、33_dentist と 40〜43 が しかいいん（はいしゃさん 11しゅるい））
└── fuchan-town/
    ├── index.html          # ふーちゃんのまち（4歳向け・スマホ縦持ち想定。ビルド済み成果物）
    ├── build.py            # src/*.js を連結して index.html を生成
    └── src/                # ソース（キャラ・データ・絵・各シーン・たんてい/ふわふわタウン）
```

各ゲームは `<ゲーム名>/index.html` の 1 フォルダ 1 ゲーム構成で、置いた HTML がそのまま配信されます。
`fuchan-town`・`fuchan-hospital`・`cure-tantei`・`chibikko-auto`・`futan-quest`・`futan-takuto`・`futan-kitchen`・`fumon-ruby` はソースを `src/` に分割しているので、編集後に `cd <フォルダ> && python3 build.py` で `index.html` を再生成してからコミットしてください。

## ゲームの追加方法

1. ルートに英小文字・ハイフン区切りのフォルダを作る（例: `new-game/`）。
2. その中に `index.html` を置く。画像や JS などを分ける場合は同じフォルダに入れ、相対パス（`./img/foo.png` など）で参照する。
3. タイトル画面のスクリーンショットを 800×500 の JPEG で `thumbs/<フォルダ名>.jpg` に置く。
4. ルートの `index.html` の `<ul id="games">` にカードを 1 つ追加する（新しいものほど上に）。

   ```html
   <li><a class="game" href="./new-game/">
     <div class="thumb"><img src="./thumbs/new-game.jpg" alt="" width="800" height="500" loading="lazy"></div>
     <div class="body"><div class="name">ゲーム名</div><div class="desc">かんたんな せつめい</div><div class="tags"><span>5さい〜</span><span>ジャンル</span></div></div>
   </a></li>
   ```

5. `main` に push すると、数分で `https://naoto613.github.io/games/new-game/` で公開される。

## GitHub Pages の設定

リポジトリの **Settings → Pages** で、Source を「Deploy from a branch」、Branch を `main` / `/ (root)` にしてください（初回のみ）。
