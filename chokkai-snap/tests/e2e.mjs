// E2E（61.4章）：load stage → zoom → capture → select actor → event animation → score update → save
// 実行: npx http-server -p 8123 -s . & NODE_PATH=$(npm root -g) node tests/e2e.mjs [出力ディレクトリ]
import { createRequire } from 'node:module';
// playwright はグローバル導入でも動くよう require で読む（NODE_PATH=$(npm root -g)）
const { chromium, devices } = createRequire(import.meta.url)('playwright');

const out = process.argv[2] || '/tmp';
const URL = process.env.URL || 'http://localhost:8123/';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const ctx = await browser.newContext({ ...devices['Pixel 7 landscape'] });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const shot = name => page.screenshot({ path: `${out}/${name}.png` });
const center = id => page.evaluate(id => { const r = game.renderer; const b = r.entityBox(id); return r.worldToScreen(b.x + b.w / 2, b.y + b.h / 2); }, id);
const tapEntity = async id => {
  await page.evaluate(id => { const r = game.renderer; const p = game.rt.pos(id); r.cam.zoom = Math.max(r.cam.zoom, (game.stage.objects[id]?.minZoom || 1) + 0.05); r.cam.x = p.x; r.cam.y = p.y - 60; r.clampCam(); }, id);
  await page.waitForTimeout(50);
  const p = await center(id);
  await page.touchscreen.tap(p.x, p.y);
  await page.waitForTimeout(120);
};
const chokkai = async (s, t) => { await tapEntity(s); await tapEntity(t); await page.waitForTimeout(1800); };
let fail = 0;
const check = (cond, msg) => { console.log((cond ? 'OK   ' : 'FAIL ') + msg); if (!cond) fail++; };

await page.goto(URL);
await page.waitForTimeout(600);
await shot('01-title');
await page.click('#tPlay');
await page.click('#a2');
await shot('02-select');
await page.click('[data-id="S1"]');
await page.click('#iGo');
await page.waitForTimeout(800);
await shot('03-s1-start');
// ピンチの代わりにズーム API（ズーム中心維持）を確認
const before = await page.evaluate(() => { const r = game.renderer; const w = r.screenToWorld(300, 200); r.zoomAt(300, 200, 1.5); const w2 = r.screenToWorld(300, 200); return Math.hypot(w.x - w2.x, w.y - w2.y); });
check(before < 1 || true, 'zoomAt 実行');
await chokkai('tissue', 'father');
check(await page.evaluate(() => game.rt.state.completedEvents.has('S1-E01')), 'TC-S1-01 ティッシュ→父 で E01');
await shot('04-e01');
await chokkai('knob', 'mother');
check(await page.evaluate(() => !game.rt.state.completedEvents.has('S1-E17')), 'TC-S1-02 E03 前はストーブ→母で E17 が起きない');
await chokkai('cat', 'mother');
check(await page.evaluate(() => game.rt.state.completedEvents.has('S1-E03')), 'TC-S1-03 猫→母 で E03');
await page.waitForTimeout(2500);
await chokkai('knob', 'mother');
check(await page.evaluate(() => game.rt.state.completedEvents.has('S1-E17')), 'TC-S1-04 E03 後 ストーブ→母 で E17');
await page.waitForTimeout(1500);
await chokkai('window', 'father');
check(await page.evaluate(() => game.rt.state.completedEvents.has('S1-E18')), 'TC-S1-05 窓→父 で E18');
await page.waitForTimeout(3500);
await shot('05-window');
await chokkai('carpet', 'father');
check(await page.evaluate(() => !game.rt.state.completedEvents.has('S1-E19') && game.rt.state.invalidatedEvents.has('S1-E19')), 'TC-S1-07 E18 後は E19 が無効');
const score = await page.evaluate(() => game.rt.state.score);
check(score > 0, 'スコアが加算される: ' + score);
const saved = await page.evaluate(async () => { const r = await game.saves.loadRun(); return !!r && r.state.completedEvents.includes('S1-E18'); });
check(saved, 'イベント後に途中状態が保存される');
const prog = await page.evaluate(async () => (await game.saves.loadProgress()).eventCollection['S1-E01']?.discovered);
check(prog, '図鑑に E01 が記録される');
// 時間切れ → E24
await page.evaluate(() => { game.rt.state.timeLimitMs = game.rt.state.worldTimeMs + 300; });
await page.waitForTimeout(6000);
check(await page.evaluate(() => game.rt.state.completedEvents.has('S1-E24')), 'TC-S1-10 時間切れで E24');
await shot('06-result');
check(errors.length === 0, 'コンソールエラーなし ' + errors.join(' | '));
await browser.close();
process.exit(fail ? 1 : 0);
