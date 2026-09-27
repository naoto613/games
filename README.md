# games

ブラウザで遊べるゲームを GitHub Pages で公開するリポジトリです。

- 一覧ページ: https://naoto613.github.io/games/
- こっそりトレジャー: https://naoto613.github.io/games/kossori-treasure/
- ふーちゃんのまち: https://naoto613.github.io/games/fuchan-town/

## 構成

```
.
├── index.html              # ゲーム一覧ページ
├── .nojekyll               # Jekyll 処理を無効化（ファイルをそのまま配信）
├── README.md
├── kossori-treasure/
│   └── index.html          # こっそりトレジャー（単一 HTML で完結）
└── fuchan-town/
    ├── index.html          # ふーちゃんのまち（4歳向け・スマホ縦持ち想定。ビルド済み成果物）
    ├── build.py            # src/*.js を連結して index.html を生成
    └── src/                # ソース（キャラ・データ・絵・各シーン・たんてい/ふわふわタウン）
```

各ゲームは `<ゲーム名>/index.html` の 1 フォルダ 1 ゲーム構成で、置いた HTML がそのまま配信されます。
`fuchan-town` だけはソースを `src/` に分割しているので、編集後に `cd fuchan-town && python3 build.py` で `index.html` を再生成してからコミットしてください。

## ゲームの追加方法

1. ルートに英小文字・ハイフン区切りのフォルダを作る（例: `new-game/`）。
2. その中に `index.html` を置く。画像や JS などを分ける場合は同じフォルダに入れ、相対パス（`./img/foo.png` など）で参照する。
3. ルートの `index.html` の `<ul id="games">` にリンクを 1 行追加する。

   ```html
   <li><a class="game" href="./new-game/"><div class="name">ゲーム名</div><div class="desc">ひとこと説明</div></a></li>
   ```

4. `main` に push すると、数分で `https://naoto613.github.io/games/new-game/` で公開される。

## GitHub Pages の設定

リポジトリの **Settings → Pages** で、Source を「Deploy from a branch」、Branch を `main` / `/ (root)` にしてください（初回のみ）。
