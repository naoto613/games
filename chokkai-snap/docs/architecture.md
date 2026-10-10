# ちょっかいスナップ アーキテクチャ

ビルド不要の静的 Web アプリ（ES Modules + Canvas 2D + Web Audio + IndexedDB）。GitHub Pages でそのまま配信する。
対象はスマートフォン／タブレットの Chrome（タッチ操作のみ）。

```
index.html            HUD・画面の DOM と CSS（Safe Area / 100dvh / touch-action:none）
js/main.js            Game App：起動フロー・入力→コマンド・ループ・ヒント・セーブ・リプレイ・チュートリアル
js/engine/            DOM 非依存（Node からもテスト・検証できる）
  condition.js        条件エンジン（全条件型）・Condition Debugger 用 explain・Condition DSL
  content.js          ステージ記法 → StageDefinition / EventDefinition への正規化、カテゴリ別の priority / points
  runtime.js          Stage Runtime：Clock・Capture・Chokkai（Source×Target 選択）・排他・連鎖・Event Queue（min 時刻順）
                      ・Effect Runner・Actor FSM（状態＋移動＋吹き出し）・Timeout・Score・Journal・Action Log・serialize
  animations.js       Event Animation（Timeline Clip の集合、共通リアクション）
  validator.js        Content Validator・Event Graph・Automated Stage Solver（到達可能性）
js/game/
  render.js           Camera（ズーム中心維持・easeOutCubic）・World/Actor/Object 描画・吹き出し・FX・Spatial Hash 当たり判定
  input.js            Pointer Events（タップ／パン／ピンチ／ダブルタップ／長押し、TAP_SLOP 8px・LONG_PRESS 500ms）
  audio.js            Web Audio 合成の SE（priority / maxInstances）と BGM
  save.js             IndexedDB + LocalStorage バックアップ、schemaVersion 3、マイグレーション、途中状態の保存
  ui.js               タイトル・ステージ選択・図鑑・設定・結果・一時停止・デバッグ（Inspector / Graph / Condition Debugger / Play Event）
js/content/           ステージデータ（s1〜s6, tutorial）。書き方は content-format.md
tools/validate.mjs    全ステージの検証＋全イベントの到達可能性（CI で失敗させる）
tests/run.mjs         Unit / Event / Graph テスト（S1 の TC-S1-01〜10、全ステージ終端・時間切れ）
tests/e2e.mjs         Playwright のスマホ（タッチ）E2E
```

## 1 回のちょっかい

タップ → `Renderer.pick`（Spatial Hash、UI > 画像を持っているときの相手 > Source > Actor の順）
→ `StageRuntime.capture` / `send` → `tryChokkai`（Source×Target の候補 → 条件 → priority/sortOrder → 排他）
→ `resolveEvent`（コミット：完了・無効化・得点・記録）→ Effect を Event Queue に予約 → 描画層へ通知。

## 状態の分離

- StageRunState（今回のラン）: `runtime.state`。30 秒ごと・イベント後・離脱時に `run` キーへ保存（復帰可能）。
- GlobalProgress（過去の結果）: 解放・クリア・ベストスコア・イベント図鑑・設定。`progress` キー。

## デバッグ

`?debug` を付けて開くか、設定で「開発者ツール」を ON。HUD の 🐞 から当たり判定・イベント ID・時計停止・+30 秒・
次イベント強制・全オブジェクト表示・図鑑全表示・イベントグラフ・操作ログ書き出し・Inspector・Condition Debugger・Play Event・Validator。
