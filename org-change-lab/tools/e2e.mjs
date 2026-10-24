// 受け入れテスト（設計書17章）の主要な流れを実ブラウザで通す
// 使い方：node server/index.js（または任意の静的サーバー）を起動 → node tools/e2e.mjs [URL]
import { createRequire } from 'module';
import { readFileSync } from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.argv[2] || 'http://127.0.0.1:8787/';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await context.newPage();
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const step = (s) => console.log('✓', s);
const modal = () => page.locator('.modal').last();
const save = () => modal().locator('.modal-footer .btn-primary').click();
const assert = (cond, msg) => { if (!cond) throw new Error(`失敗：${msg}`); };

await page.goto(base);
await page.getByRole('link', { name: '＋ 新しい変革案件を作成' }).click();
await page.getByRole('button', { name: '登録して課題分析へ進む' }).click();
assert(await page.locator('.field-error:not(:empty)').count() >= 4, '必須項目のエラーが項目の近くに出る');
await page.getByLabel('案件名').fill('CRMチームの自律性向上（E2E）');
await page.getByLabel('解決したい問題').fill('改善提案がリーダーに集中している');
await page.getByLabel('期待する状態').fill('メンバーが課題仮説と施策案を提案できる');
await page.getByLabel('対象となるチーム・領域').fill('CRM');
await page.getByLabel('事業・プロダクトとの関係').fill('求職者CRMの価値向上');
await page.getByRole('button', { name: '登録して課題分析へ進む' }).click();
await page.waitForURL(/#\/i\/.+\/analysis/);
const url = page.url();
step('案件を作成できる');
await page.reload();
await page.waitForSelector('h1.page-title');
assert((await page.textContent('h1.page-title')).includes('E2E'), '再読み込み後もデータが残る');
step('再読み込み後もデータが保持される');

// 観測事実
for (const t of ['直近の施策では、成功指標が実装着手後に決まった', '定例の議題の大半が実装進捗だった']) {
  await page.getByRole('button', { name: /事実を追加/ }).first().click();
  await modal().getByLabel('実際に観測した事実').fill(t);
  await save();
  await page.waitForSelector('.modal', { state: 'detached' });
}
assert(await page.locator('.item-fact').count() === 2, '観測事実を複数登録できる');
step('観測事実を複数登録できる');

// 仮説
for (const t of ['成功指標を定義するタイミングが遅い', '顧客情報にアクセスできない']) {
  await page.getByRole('button', { name: /仮説を追加/ }).first().click();
  await modal().getByLabel('仮説の内容（見出し）').fill(t);
  await modal().locator('.checks input').first().check();
  await modal().getByLabel('不足している情報（1行に1つ）').fill('過去の施策で指標を定義したタイミング');
  await modal().getByLabel('確認方法').fill('過去3施策の記録を比較する');
  await save();
  await page.waitForSelector('.modal', { state: 'detached' });
}
assert(await page.locator('.item-hypothesis').count() === 2, '仮説を複数登録できる');
await page.locator('.item-hypothesis select').first().selectOption('supported');
await save();
assert((await modal().locator('.field-error:not(:empty)').first().textContent()).includes('判断理由'), '支持には判断理由が必要');
await modal().getByLabel('判断理由').fill('振り返り記録で確認');
await save();
await page.waitForSelector('.modal', { state: 'detached' });
step('仮説の根拠・不足情報・検証方法・検証状態を記録できる');

// AI（コピー＆ペースト方式）
const factCount = await page.locator('.item-fact').count();
await page.getByRole('button', { name: '構造分析を実行（Agent A）' }).click();
assert((await modal().textContent()).includes('観測事実 2 件'), '送信内容の要約を表示');
await page.getByRole('button', { name: 'プロンプトを表示' }).click();
assert((await modal().locator('textarea').first().inputValue()).includes('JSON Schema'), 'プロンプトにスキーマを含む');
await modal().locator('textarea').nth(1).fill('{"analysisType":"root_cause_analysis"}');
await page.getByRole('button', { name: '検証して読み込む' }).click();
assert((await modal().textContent()).includes('形式ではありません'), '不正なAI応答はエラー');
const ai = {
  analysisType: 'root_cause_analysis', summary: '要約', problemRedefinition: '企画時点で成功指標が定義されていない',
  facts: ['成功指標が実装着手後に決まった'], interpretations: [],
  hypotheses: [{ title: '提案しても意思決定に参加できない', description: '提案の扱いが不明', lens: 'decision', evidence: [], supportStatus: 'needs_verification', missingInformation: ['過去の提案の採否'], alternativeExplanations: [], verificationMethod: '過去の意思決定を振り返る' }],
  structuralPerspectives: [{ lens: 'decision', observation: '意思決定の場が限られている可能性' }],
  unknowns: ['提案の採否の記録があるか'], recommendedNextActions: ['過去の意思決定を3件振り返る'], limitations: ['入力が少ない'],
};
await modal().locator('textarea').nth(1).fill(JSON.stringify(ai));
await page.getByRole('button', { name: '検証して読み込む' }).click();
await modal().getByText('これはAIの提案です').waitFor();
await modal().locator('.checks label', { hasText: '過去の意思決定を3件振り返る' }).click();
await page.getByRole('button', { name: '確認して保存' }).click();
await page.waitForSelector('.modal', { state: 'detached' });
assert(await page.locator('.item-hypothesis').count() === 3, 'AIの仮説を確認して登録');
assert(await page.locator('.item-fact').count() === factCount, 'AIの事実は観測事実として登録しない');
assert((await page.locator('.item-hypothesis', { hasText: '提案しても' }).textContent()).includes('未検証'), 'AI仮説は未検証として登録');
step('AIの結果を確認・選択して保存（事実は登録しない）');

// 介入案
await page.click('a.tab:has-text("介入案")');
for (const t of ['施策企画時の指標定義を標準化', 'メンバーが企画から振り返りまで担当']) {
  await page.getByRole('button', { name: /介入案を追加/ }).first().click();
  await modal().getByLabel('施策名（何を変えるか）').fill(t);
  await modal().locator('.checks input').first().check();
  await modal().getByLabel(/期待する行動変化/).fill('着手前に成功指標が定義される');
  await modal().getByLabel(/想定リスク/).fill('入力負担が増える');
  await modal().getByLabel(/検証方法/).fill('次の2施策で試す');
  await save();
  await page.waitForSelector('.modal', { state: 'detached' });
}
assert(await page.locator('table.compare thead th').count() === 3, '複数の介入案を比較できる');
await page.locator('table.compare').getByRole('button', { name: '却下' }).nth(1).click();
await modal().getByLabel(/却下の理由/).fill('負荷が大きい');
await save();
await page.waitForSelector('.modal', { state: 'detached' });
await page.locator('table.compare').getByRole('button', { name: '採用' }).first().click();
await modal().getByLabel(/採用理由/).fill('小さく試せる');
await save();
await page.getByRole('button', { name: '実行計画を作成' }).click();
await page.waitForURL(/execution/);
await modal().getByLabel('実施する施策').waitFor();
assert((await modal().getByLabel('実施する施策').inputValue()).includes('標準化'), '採用案から計画を作成');
await modal().getByLabel('実施責任者（役割名）').fill('CRMリーダー');
await save();
await page.waitForSelector('.modal', { state: 'detached' });
step('採用・却下と理由を記録し、実行計画を作成できる');

// 指標
await page.getByRole('button', { name: /指標を定義/ }).click();
await modal().getByLabel('指標名').fill('着手前の成功指標定義率');
await modal().getByLabel('測定方法').fill('記録を数える');
await modal().getByLabel('単位').fill('%');
await save();
await page.waitForSelector('.modal', { state: 'detached' });
await page.getByRole('button', { name: '測定結果を記録' }).click();
await modal().getByLabel(/^値/).fill('20');
await save();
await page.waitForSelector('.modal', { state: 'detached' });
assert((await page.locator('.compare-row').textContent()).includes('未入力'), '実施後は未入力のまま（補完しない）');
await page.getByRole('button', { name: '測定結果を記録' }).click();
await modal().getByLabel('時点').selectOption('after');
await modal().getByLabel(/観察記録/).fill('メンバーが企画で指標を説明した');
await save();
await page.waitForSelector('.modal', { state: 'detached' });
assert((await page.locator('.compare-row').textContent()).includes('メンバーが企画で'), '定性の結果を扱える');
step('実施前・実施後の値（定量・定性）を記録できる');

// ステータス変更（成功条件が固定される）
await page.selectOption('.page-head select', 'running');
assert((await modal().textContent()).includes('成功条件が未定義'), '成功条件の未定義を警告');
await save();
await page.waitForSelector('.modal', { state: 'detached' });
assert((await page.textContent('.page-head')).includes('実行中'), 'ステータスを変更できる');
step('ステータスを変更できる');

// 学習記録
await page.click('a.tab:has-text("学習記録")');
await page.getByRole('button', { name: /学びを記録/ }).first().click();
await modal().getByLabel('知見のタイトル').fill('指標定義の学び');
await modal().getByLabel('要約').fill('要約');
await modal().getByLabel('パターン').selectOption('success');
await modal().getByLabel('結果の確認状況').selectOption('unknown');
await save();
assert((await modal().textContent()).includes('成功パターン」にはできません'), '結果未確認は成功にできない');
await modal().getByLabel('パターン').selectOption('mixed');
await save();
await page.waitForSelector('.modal', { state: 'detached' });
step('振り返りを学習記録として保存できる');

// Markdown・エクスポート・削除・インポート
await page.getByRole('button', { name: 'Markdownレポート' }).click();
const md = await modal().locator('textarea').inputValue();
assert(md.includes('## 13. 得られた学び') && md.includes('未評価'), 'Markdownレポート');
await page.keyboard.press('Escape');
const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'JSONエクスポート' }).click()]);
const file = await dl.path();
const json = JSON.parse(readFileSync(file, 'utf8'));
assert(json.data.hypotheses.length === 3 && json.data.decisionRecords.length >= 3, 'エクスポートに関連データを含む');
await page.getByRole('button', { name: '案件を削除' }).click();
assert((await modal().textContent()).includes('元に戻せません'), '削除前に確認');
await modal().locator('input').fill('削除');
await modal().getByRole('button', { name: '削除する' }).click();
await page.waitForURL(/#\/$/);
step('JSON・Markdownを出力し、確認のうえ削除できる');
await page.goto(base + '#/settings/data');
await page.setInputFiles('#import-file', file);
await modal().getByRole('button', { name: 'インポートする' }).click();
await page.waitForSelector('.alert-success');
await page.goto(url.replace(/\/analysis$/, '/analysis'));
await page.waitForSelector('.item-hypothesis');
assert(await page.locator('.item-hypothesis').count() === 3, 'JSONから復元できる');
step('JSONから案件を復元できる');

// 不正なJSON
const bad = file + '.bad.json';
(await import('fs')).writeFileSync(bad, JSON.stringify({ format: 'org-change-lab', schemaVersion: 1, data: { initiatives: [{ id: 'x' }] } }));
await page.goto(base + '#/settings/data');
await page.setInputFiles('#import-file', bad);
await page.waitForSelector('.alert-error');
assert((await page.textContent('.alert-error')).includes('data.initiatives[0]'), '不正なJSONのエラー箇所を表示');
step('不正なJSONは読み込まずエラー箇所を表示');

// AI API が使えない場合
await page.goto(base + '#/settings/ai');
await page.getByLabel('AIの使い方').selectOption('backend');
await page.getByLabel(/バックエンドのURL/).fill('http://127.0.0.1:9/api');
await page.getByRole('button', { name: '保存' }).click();
await page.goto(url);
await page.waitForSelector('.item-hypothesis');
await page.getByRole('button', { name: '構造分析を実行（Agent A）' }).click();
await page.getByRole('button', { name: '確認して送信' }).click();
await modal().locator('.alert-error').waitFor();
assert((await modal().textContent()).includes('接続できませんでした'), 'API接続失敗を表示');
await page.keyboard.press('Escape');
assert(await page.locator('.item-hypothesis').count() === 3, 'API失敗でも保存済みデータを閲覧できる');
step('API接続に失敗しても保存済みデータを閲覧できる');

const relevant = errors.filter((e) => !e.includes('ERR_CONNECTION_REFUSED') && !e.includes('Failed to load resource'));
console.log(relevant.length ? `コンソールエラー：\n${relevant.join('\n')}` : 'コンソールエラーなし');
await browser.close();
process.exit(relevant.length ? 1 : 0);
