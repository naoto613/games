# Org Change Lab

エンジニアリングマネージャー（EM）が、組織の問題を発見し、原因を検証し、介入を選び、関係者を巻き込み、実行して、行動変化と成果を確認し、学ぶまでを一つの場所で扱う個人向けワークベンチです（詳細設計書 v1.0 に基づく初期版）。

- 公開版: https://naoto613.github.io/games/org-change-lab/
- HTML / CSS / Vanilla JS（ES Modules）。ビルド不要。
- データはブラウザの IndexedDB にだけ保存。JSON バックアップ・復元、Markdown レポート、指標の CSV 取り込みに対応。
- AI は「提案者」。AI の出力は保存前に必ず確認・選択・編集し、事実（Observation）としては登録しない。

## 使い方

### 1. 静的ファイルとして開く（AI はコピー＆ペースト方式）

GitHub Pages など任意の静的サーバーで動きます。ローカルでは:

```sh
cd org-change-lab
python3 -m http.server 8000   # → http://localhost:8000/
```

（`file://` で直接開くとモジュール読み込みが制限されるため、HTTP サーバー経由で開いてください）

AI 機能は「コピー＆ペースト方式」が既定です。表示されたプロンプトを手元の AI チャットに貼り、返ってきた JSON を貼り戻すと、形式を検証してから確認画面に表示します。API キーは不要です。

### 2. バックエンド経由で Claude を呼び出す

API キーをブラウザに置かないため、AI の呼び出しは `server/` が担当します。

```sh
cd org-change-lab/server && npm install && cd ..
ANTHROPIC_API_KEY=sk-ant-... node server/index.js   # → http://127.0.0.1:8787/
```

画面の「設定 → AI接続」で「バックエンド経由」を選びます（URL は `./api` のまま）。

| 環境変数 | 既定値 | 内容 |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | なし | 必須（未設定でも画面とデータ管理は使えます） |
| `OCL_MODEL` | `claude-opus-5-5` | 既定のモデル |
| `OCL_ALLOWED_MODELS` | `claude-opus-5-5,claude-sonnet-5-5,claude-haiku-5-5,claude-fable-5-1` | 画面から選べるモデル |
| `OCL_MAX_INPUT_BYTES` | `204800` | 1リクエストの入力上限 |
| `PORT` / `HOST` | `8787` / `127.0.0.1` | 待ち受け |

バックエンドは、リクエスト形式と入力サイズの検証 → 機密情報の警告 → プロンプト組み立て → Claude 呼び出し（構造化出力・適応的思考・拒否時のサーバー側フォールバック）→ 応答の JSON Schema 検証（不正なら1回だけ再試行）→ エラー整形、を行います。

## 画面

| ID | 画面 | 場所 |
| --- | --- | --- |
| SCR-01 | ホーム（進行中の案件・次の行動・最近の学び） | `#/` |
| SCR-02 | 変革案件詳細（概要・次の行動・未解決の論点・意思決定の記録） | `#/i/<id>` |
| SCR-03 | 組織課題分析（事実・解釈・仮説・判断の分離、Agent A/B） | `#/i/<id>/analysis` |
| SCR-04 | 介入案比較（比較表・評価軸の並べ替え・採用/保留/却下、Agent C） | `#/i/<id>/interventions` |
| — | 関係者・合意（共同で決める事項／委ねる事項、Agent D） | `#/i/<id>/stakeholders` |
| SCR-05 | 実行・効果検証（成功条件・実行計画・成果の4階層・効果と因果の不確実性、Agent E） | `#/i/<id>/execution` |
| — | 学習記録（Agent F） | `#/i/<id>/learning` |
| SCR-06 | 知見・設定（知見検索・AI接続・データ入出力・プライバシー） | `#/settings` |

## 構成

```
org-change-lab/
├── index.html
├── styles/           tokens.css（設計書10.2のトークン＋ダークモード）/ base / layout / components / pages
├── src/
│   ├── app.js / router.js / constants.js
│   ├── domain/       各 Entity の正規化・検証・業務ルール（次の行動の候補、成功条件、指標比較など。DOM 非依存）
│   ├── repositories/ db.js（IndexedDB とテスト用メモリ版）/ repository.js（検証を通したものだけ保存）
│   ├── services/     initiativeService（作成・ステータス変更・複製・削除）/ exportService（JSON・Markdown・CSV）/ analysisService / sampleData
│   ├── ai/           schemas（出力の JSON Schema）/ promptTemplates（設計書8章）/ responseValidator / agents（入力の組み立て・下書き変換）/ aiClient
│   ├── components/   dom / ui（モーダル・フォーム・ラベル）/ aiRunner（送信内容の確認 → 実行 → 確認・保存）
│   └── pages/        dashboard / initiativeDetail / analysis / interventions / stakeholders / experiment / learning / settings
├── server/           index.js（静的配信＋/api）/ routes/ai.js（Claude 呼び出し）
├── tests/            node --test（domain / validation / repository / workflow / server）
└── tools/            e2e.mjs（受け入れテストを Playwright で通す）/ smoke.mjs / shot.mjs
```

## テスト

```sh
cd org-change-lab
npm test                                  # ユニット・ワークフロー・サーバー
node server/index.js &                    # 別ターミナルでも可（PORT=8787）
node tools/e2e.mjs http://127.0.0.1:8787/ # 受け入れテスト（設計書17章）の主要な流れ
```

## 設計上の決めごと

- AI の仮説・事実・次の行動は、ユーザーが選んで保存するまで確定しない。AI 由来の仮説は「AI提案から登録」「未検証」で登録。
- 入力にない数値が AI 出力にあると警告。値が分からない指標は `null` のまま扱い、Markdown では「未評価」「未確認」と表示。
- ステータスを「実行中」以降にすると成功条件が固定され、以降の変更は理由とともに意思決定記録に残る。実行開始後に追加した指標には印がつく。
- 結果が未確認の学びは「成功パターン」として保存できない。
- 送信前に送信内容の要約・全文と、メールアドレス・個人名らしき表記の警告を表示。内部 ID は送らない。
- API キーはフロントエンドにもローカル保存領域にも置かない。
