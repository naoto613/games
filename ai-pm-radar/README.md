# AI PM Radar — Product & Org Intelligence Hub

AI を活用したプロダクトマネジメント・エンジニアリングマネジメント・プロダクト開発・組織づくりの公開情報を集めて読むための静的 HTML アプリと、APIキーを使わない定期収集ジョブです。静的ページ＋`data/*.json`＋Python 収集スクリプト＋GitHub Actions のつくりです。旧 LayerX Radar（LayerX の公開技術情報）は「LayerX」タブとして統合しました。

- 公開URL: https://naoto613.github.io/games/ai-pm-radar/

## できること

- 日本語／English／LayerX のタブで分けて表示（混ぜない。選んだタブはブラウザに記憶。テーマ・レーダーや件数・未読数もタブごと）
- LayerX タブは技術寄りのテーマ（アーキテクチャ・バックエンド・SRE など）で分類。旧 LayerX Radar の既読・ブックマーク・メモ・手動追加は、初めて開いたときに自動で引き継ぐ
- ダッシュボード：テーマ・レーダー（直近30日のテーマ別件数と、そのうち AI活用に関係する件数）、AI × プロダクト・組織の注目（AI活用と PM・EM・開発・組織のテーマが重なる新着）、新着フィード
- FOCUS（AI活用・プロダクトマネジメント・EM・プロダクト開発・組織づくり）と媒体（国内コミュニティ・はてブで話題・海外ニュースレター・動画/Podcast）で切り替え
- 検索、媒体・テーマ・既読状態での絞り込み、「✦ AI活用だけ」トグル、はてブ数順の並び替え
- 既読／未読、ブックマーク、学びのメモ、URL の手動追加（いずれもブラウザ内に保存）、状態のエクスポート／インポート
- 設定画面で情報源ごとの取得状況（最終成功時刻・件数・エラー）を確認

## 情報源（`data/sources.json`）

| 種類 | 情報源 |
| --- | --- |
| 国内コミュニティ | Zenn トピック（pdm・productmanagement・engineeringmanager・management）、Qiita タグ（PdM・プロダクトマネジメント・エンジニアリングマネージャー・組織開発） |
| はてブで話題 | はてなブックマーク検索 RSS（プロダクトマネージャー・エンジニアリングマネージャー・組織づくり・生成AI プロダクト開発／5users以上） |
| 海外ニュースレター | Lenny's Newsletter、The Pragmatic Engineer、SVPG、Product Talk、Mind the Product、Irrational Exuberance、The Beautiful Mess、Engineering Leadership、Product Growth |
| 動画・Podcast | Lenny's Podcast、The Pragmatic Engineer（YouTube 公開チャンネルフィード） |
| LayerX タブ | LayerX エンジニアブログ（RSS）、LayerX YouTube（公開チャンネルフィード。取れないときはチャンネルの動画ページ）、LayerX Speaker Deck（Atom） |

- 情報源ごとに `lang`（`ja`/`en`）、`tab`（表示するタブ。省略時は `lang`、LayerX は `layerx`）、`tagRules`（`tech` で技術寄りのテーマ推定）、`mustContain`（含むべき語）、`maxAgeDays`（これより古い記事は取らない。既定 400 日）を指定できます。
- YouTube の `channelId` は空のままで、`resolveFromUrl` のチャンネルページから自動で調べて保存します。
- 同じ記事が複数の情報源（Zenn とはてブなど）に出たときは、先に取った情報源のまま、はてブ数（`bookmarks`）だけ更新します。
- テーマ（tags）と学びの種類（learningTypes）は日本語・英語のキーワードからの推定です（`tagsEstimated: true`）。`items.json` で手直しした値は次回以降も保持されます。
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

`items.json` は配列で、各アイテムは `id`（正規化URLの SHA-256 先頭24桁）, `title`, `url`, `sourceId`, `sourceType`（`community`/`bookmark`/`newsletter`/`youtube`/`blog`/`slides`）, `publishedAt`, `lang`, `tab`, `discoveredAt`, `description`, `author`, `tags`, `learningTypes`, `tagsEstimated`, `thumbnailUrl`, `bookmarks`（はてブ数・あれば）を持ちます。
