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
├── cure-tantei/
│   ├── index.html          # キュアたんてい ふーちゃん（5歳向け・スマホ縦持ちの 探偵＋お医者さん＋プリキュアバトル 長編。ビルド済み成果物）
│   ├── build.py            # src/*.js を連結して index.html を生成
│   └── src/                # ソース（キャラ・アイコン・背景・各ステップ・おいしゃさん・バトル・ストーリー）
├── futan-kart/
│   ├── index.html          # キュアふーたんの キラキラカート（5歳向け・タブレット想定の 3D カートレース）
│   └── three.min.js        # three.js r149（fuchan-town と同じもの）
├── fuchan-hospital/
│   ├── index.html          # ふーちゃんと リッキーの キラキラびょういん（5歳向け・スマホ縦持ちの おいしゃさんごっこ。ビルド済み成果物）
│   ├── build.py            # src/*.js を連結して index.html を生成
│   └── src/                # ソース（00_base は ふーちゃんのまち から流用した絵・音・声、30〜39 が各おへや）
└── fuchan-town/
    ├── index.html          # ふーちゃんのまち（4歳向け・スマホ縦持ち想定。ビルド済み成果物）
    ├── build.py            # src/*.js を連結して index.html を生成
    └── src/                # ソース（キャラ・データ・絵・各シーン・たんてい/ふわふわタウン）
```

各ゲームは `<ゲーム名>/index.html` の 1 フォルダ 1 ゲーム構成で、置いた HTML がそのまま配信されます。
`fuchan-town`・`fuchan-hospital`・`cure-tantei` はソースを `src/` に分割しているので、編集後に `cd <フォルダ> && python3 build.py` で `index.html` を再生成してからコミットしてください。

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
