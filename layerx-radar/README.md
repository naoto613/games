# LayerX Radar — Engineering Intelligence Hub

LayerX の公開技術情報を横断的にキャッチアップするための静的 HTML アプリと、APIキーを使わない定期収集ジョブです。

- 公開URL: https://naoto613.github.io/games/layerx-radar/

## できること

- ダッシュボード、全情報フィード、媒体別表示
- タイトル・概要・タグの検索、媒体・テーマ・既読状態での絞り込み
- 既読／未読の表示、ブックマーク（また見返したいものを残す）、学びのメモ、URL の手動追加（いずれもブラウザ内に保存）
- 状態のエクスポート／インポート（別端末へ移すとき用）
- 設定画面で情報源ごとの取得状況（最終成功時刻・件数・エラー）を確認

## 収集のしくみ（APIキー不要）

`.github/workflows/layerx-radar-update.yml`（リポジトリ直下）が毎朝6時（日本時間）・手動実行・`sources.json` や収集スクリプトの変更時に `scripts/fetch_sources.py` を実行し、`data/` に変更があれば `main` へコミットします。GitHub Pages はそのまま新しい JSON を配信します。

| 情報源 | fetchMethod | 取得先 |
| --- | --- | --- |
| エンジニアブログ | `rss` | `https://tech.layerx.co.jp/feed` |
| Speaker Deck | `rss` | `https://speakerdeck.com/layerx.atom` |
| YouTube | `youtube` | `https://www.youtube.com/feeds/videos.xml?channel_id=…`（公開チャンネルフィード・最新15本） |

- YouTube はチャンネルフィード → アップロード再生リストのフィード → チャンネルの動画ページの順に試します（フィードは時々 404 を返すため。動画ページから取った場合の公開日は「3週間前」などからのおおよその日付）。
- YouTube の `channelId` は空のままで、LayerX の動画ページ（`resolveFromVideo`）から自動で調べて `sources.json` に保存します。違うチャンネルになった場合は `channelId` を直接書き換えてください。
- 公式ニュースは収集しません。`sources.json` から外した（または `enabled: false` にした）情報源の項目は、次の収集で `items.json` から消えます。
- テーマ（tags）と学びの種類（learningTypes）はタイトル・概要のキーワードからの推定です（`tagsEstimated: true`）。`items.json` で手直しした値は次回以降も保持されます。
- 過去に取得した項目は残り続けます（最大 1500 件）。

### 手動実行

```bash
cd layerx-radar
python -m pip install -r requirements.txt
python scripts/fetch_sources.py
```

GitHub の Actions タブ →「layerx-radar data update」→「Run workflow」でも実行できます。

## ローカルで見る

`file://` で開くと JSON を読めないので、`cd layerx-radar && python -m http.server 8000` で `http://localhost:8000` を開きます。

## データモデル

`items.json` は配列で、各アイテムは `id`（正規化URLの SHA-256 先頭24桁）, `title`, `url`, `sourceId`, `sourceType`, `publishedAt`, `discoveredAt`, `description`, `author`, `tags`, `learningTypes`, `tagsEstimated`, `thumbnailUrl` を持ちます。

## 拡張候補

- YouTube Data API（キーを GitHub Secrets に置く）で 16 本目以降の動画や再生リストを取得
- 社員の個人ブログ・Zenn・note などの RSS を `sources.json` に追加（`type: "external"`）
- AI による要約・分類（推定であることを明示）
