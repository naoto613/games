# AI PM Radar — Product & Org Intelligence Hub

AI活用・FDE（Forward Deployed Engineer）・PdM・EM の4テーマに絞って、良質な公開情報を集めて読むための静的 HTML アプリと、APIキーを使わない定期収集ジョブです。静的ページ＋`data/*.json`＋Python 収集スクリプト＋GitHub Actions のつくりです。旧 LayerX Radar（LayerX の公開技術情報）は「LayerX」タブとして統合しました。

- 公開URL: https://naoto613.github.io/games/ai-pm-radar/

## できること

- 上に固定したタブ（日本語／English／LayerX）で、日本語の情報・英語の記事・LayerX の公開技術情報を分けて表示（混ぜない。選んだタブはブラウザに記憶）
- テーマは **AI活用・FDE・PdM・EM の4つだけ**。タブの下のチップ（件数つき）か、記事についたテーマをタップして切り替え
- 一覧はいつも新しい順。「すべて／未読／★ 保存／✎ メモ」の切り替えと媒体の絞り込みだけを置き、検索はヘッダーの ⌕ から開く
- 既読／未読、保存（ブックマーク）、学びのメモ、URL の手動追加（いずれもブラウザ内に保存）、状態のエクスポート／インポート。旧 LayerX Radar の既読・ブックマーク・メモ・手動追加は、初めて開いたときに自動で引き継ぐ
- 設定画面（⚙）で情報源ごとの取得状況（最終成功時刻・件数・エラー）を確認

## 情報源（`data/sources.json`）— 情報過多にならないよう絞っている

| タブ | 情報源 | 絞り方 |
| --- | --- | --- |
| 日本語 | Zenn トピック（pdm・productmanagement・engineeringmanager・em・fde。公開API）、Qiita タグ（PdM・プロダクトマネジメント・エンジニアリングマネージャー・EM・FDE。API v2） | いいね数で足切り（`minLikes`：Zenn 15、Qiita 10）。トピック／タグのテーマは必ず付く（`baseTags`） |
| 日本語 | はてなブックマーク検索 RSS（プロダクトマネージャー・エンジニアリングマネージャー・Forward Deployed Engineer・FDE エンジニア・生成AI プロダクト開発） | 一定数以上ブックマークされた記事だけ（`minBookmarks`：PdM・EM 30、FDE 10、AI 50） |
| English | Lenny's Newsletter、The Pragmatic Engineer、SVPG、Product Talk、Irrational Exuberance、Engineering Leadership | 4テーマに当たる記事だけ。ニュースまとめ（The Pulse・Community Wisdom）は除外（`excludeTitle`） |
| LayerX | LayerX エンジニアブログ・YouTube・Speaker Deck | 全件（テーマ推定だけする） |

- テーマはタイトル・概要のキーワードからの推定で、収集のたびに今のルールで付け直します。「AI活用」はどこにでも出てくるので、タイトルに AI の語があるときだけ付けます。
- 4テーマのどれにも当たらない記事（LayerX 以外）と、180日より古い記事（LayerX 以外）は残しません。
- 情報源ごとに `lang`、`tab`（表示するタブ。省略時は `lang`）、`minLikes`、`baseTags`、`requireTag`（4テーマに当たる記事だけ残す。既定 true）、`minBookmarks`、`excludeTitle`、`mustContain`、`maxAgeDays`（既定 180 日）を指定できます。
- YouTube の `channelId` は空のままで、`resolveFromVideo`／`resolveFromUrl` から自動で調べて保存します。
- 同じ記事が複数の情報源に出たときは、先に取った情報源のまま、はてブ数（`bookmarks`）だけ更新します（LayerX の情報源を先頭に置いているので、LayerX の記事は LayerX タブに入ります）。
- `sources.json` から外した（または `enabled: false` にした）情報源の項目は、次の収集で `items.json` から消えます。

## 収集のしくみ（APIキー不要）

`.github/workflows/ai-pm-radar-update.yml`（リポジトリ直下）が毎朝6時すぎ（日本時間）・手動実行・`sources.json` や収集スクリプトの変更時に `scripts/fetch_sources.py` を実行し、`data/` に変更があれば `main` へコミットします。

```bash
cd ai-pm-radar
python -m pip install -r requirements.txt
python scripts/fetch_sources.py
```

## ローカルで見る

`file://` で開くと JSON を読めないので、`cd ai-pm-radar && python -m http.server 8000` で `http://localhost:8000` を開きます。データが空のときはサンプル表示になります。

## データモデル

`items.json` は配列で、各アイテムは `id`（正規化URLの SHA-256 先頭24桁）, `title`, `url`, `sourceId`, `sourceType`（`bookmark`/`newsletter`/`blog`/`slides`/`youtube`）, `publishedAt`, `lang`, `tab`, `discoveredAt`, `description`, `author`, `tags`, `learningTypes`, `tagsEstimated`, `thumbnailUrl`, `bookmarks`（はてブ数・あれば）を持ちます。
