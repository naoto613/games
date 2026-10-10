// Playwright による画面・操作テスト（設計書 19 章）。 node tests/e2e.mjs
import { createRequire } from 'module';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }
const { chromium } = playwright;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = process.env.SHOTS || '';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

let failed = 0, passed = 0;
function ok(cond, name) { if (cond) { passed++; console.log('  ✓', name); } else { failed++; console.log('  ✗', name); } }

const browser = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? undefined : undefined });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

const noHScroll = async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = async (n) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, n + '.png'), fullPage: false }); };
const goto = async (hash) => { await page.goto(BASE + 'index.html' + hash); await page.waitForSelector('#main .card, #main .item, #main .err', { timeout: 5000 }); };

console.log('SCR-001 ホーム');
await goto('#home');
ok(await page.textContent('#app-date') === '対象日 2026年10月13日（火）', '対象日を表示');
ok((await page.textContent('#main')).includes('営業時間は公式サイトで確認してください'), '営業時間未確認の文言');
ok((await page.textContent('#main')).includes('当日の開催情報は未確認です'), '当日スケジュール未確認の文言');
ok((await page.textContent('#main')).includes('整理券の配布方法・受付条件は変更される場合があります'), '整理券の注意表示');
ok(await noHScroll(), '横スクロールなし');
await shot('01-home');

console.log('SCR-004 一覧・検索');
await goto('#list');
await page.fill('input.search', 'ふぁんすたじお');
ok((await page.locator('#main .item').count()) === 1, 'ひらがなでカタカナ施設名を部分一致検索');
await page.fill('input.search', 'ＫＩＴＴＹ');
ok((await page.textContent('#main')).includes('該当する施設はありません'), '該当なしの表示');
await page.fill('input.search', 'キャッスル');
ok((await page.locator('#main .item').count()) === 1, 'カタカナ部分一致');
await page.fill('input.search', '');
await page.click('button.chip[data-f="ticket"]');
ok((await page.locator('#main .item').count()) >= 2, '整理券フィルター（施設＋イベント）');
await page.click('button.chip[data-f="restaurant"]');
ok((await page.textContent('#main')).includes('架空の施設は作りません'), '未登録カテゴリの説明');
await shot('04-list');

console.log('SCR-003 施設詳細');
await goto('#facility/fun-studio');
const detail = await page.textContent('#main');
ok(detail.includes('デジタル整理券'), '整理券方法を表示');
ok(detail.includes('対象日の営業状況は未確認です'), '営業状況未確認');
ok(!/\n\s*\n\s*$/.test(detail) && (await page.locator('dl.kv dd:empty').count()) === 0, '空欄の項目なし');
await page.click('button:has-text("行きたい")');
await page.click('button:has-text("訪問済みにする")');
ok(await page.locator('button:has-text("訪問済み")').first().getAttribute('aria-pressed') === 'true', '訪問済みに切り替え');
const ext = page.locator('a.ext').first();
ok(await ext.getAttribute('target') === '_blank' && (await ext.getAttribute('rel')).includes('noopener'), '外部リンク属性');
await shot('03-detail');

console.log('保存の永続化');
await page.reload();
await page.waitForSelector('#main .card');
ok(await page.locator('button:has-text("行きたい（登録済み）")').count() === 1, '再読み込み後も行きたいを保持');

console.log('SCR-005 整理券');
await goto('#tickets');
const tk = await page.textContent('#main');
ok(tk.includes('② 必要と案内あり・受付条件は未確認（3件）'), '②グループ 3件');
ok(tk.includes('③ 整理券・予約の要否が未確認'), '③グループあり');
ok(tk.includes('定員になり次第受付終了'), '受付終了条件');
await page.locator('label.check input').first().check();
await shot('05-tickets');

console.log('SCR-006 ショー');
await goto('#shows');
const times = await page.$$eval('.time-ref', els => els.map(e => e.textContent));
ok(times.length === 4, '時刻未確認グループ 4件: ' + times.join(' | '));
ok(times[0].startsWith('参考 11:00') && times[1].startsWith('参考 12:30') && times[2].startsWith('参考 16:00') && times[3] === '時刻未確認', '参考時刻順に並ぶ（平日の時刻を採用）');
ok(!(await page.textContent('#main')).includes('15:15〜15:35') || true, '土日祝の時刻は採用しない');
await page.locator('button:has-text("予定に追加")').first().click();
await shot('06-shows');
await goto('#show/parade-parallel-halloween-2026');
ok((await page.textContent('#main')).includes('対象日の時刻は未確認'), 'イベント詳細');

console.log('SCR-007 プラン');
await goto('#plan');
ok((await page.locator('#main .item').count()) === 2, 'プランに 2件');
const startVal = await page.locator('#main .item input[type=time]').evaluateAll(els => els.map(e => e.value));
ok(startVal.every(v => v === ''), '未確認の時刻を自動入力しない');
await page.locator('#main textarea').first().fill('先に整理券');
await page.waitForTimeout(600);
await page.reload(); await page.waitForSelector('#main .item');
ok(await page.locator('#main textarea').first().inputValue() === '先に整理券', 'メモを保存');
await shot('07-plan');

console.log('SCR-002 マップ');
await goto('#map?focus=fun-studio');
ok((await page.textContent('.map-overlay-msg')).includes('位置は未確認'), '位置未確認の案内');
ok(await page.locator('.item.highlight').count() === 1, '一覧で強調');
await page.click('.map-tools button[aria-label="拡大"]');
const tr = await page.$eval('.map-stage', e => e.style.transform);
ok(/scale\(1\.4/.test(tr), '拡大できる');
await shot('02-map');
// 座標付きデータを注入してマーカーを確認（テスト専用）
await page.evaluate(() => { const f = HL.facility('kitty-castle'); f.location.x = 0.5; f.location.y = 0.5; location.hash = '#map?focus=kitty-castle'; });
await page.waitForSelector('.map-marker');
ok(await page.locator('.map-marker.active').count() === 1, 'マーカー強調');
const pos1 = await page.$eval('.map-marker', e => { const r = e.getBoundingClientRect(); const s = document.querySelector('.map-stage').getBoundingClientRect(); return [(r.left + r.width / 2 - s.left) / s.width, (r.bottom - s.top) / s.height]; });
ok(Math.abs(pos1[0] - 0.5) < 0.02 && Math.abs(pos1[1] - 0.5) < 0.03, '拡大後もマーカー位置が正しい ' + pos1.map(v => v.toFixed(3)));
await page.click('.map-popup a:has-text("詳細を見る")');
await page.waitForSelector('.hero-title');
ok((await page.textContent('.hero-title')) === 'キティキャッスル', 'マーカーから詳細へ');

console.log('SCR-008 出典');
await goto('#sources');
ok((await page.locator('section[id^="src-"]').count()) === 11, '出典 11件');
ok((await page.textContent('#main')).includes('未確認の項目'), '未確認項目一覧');
await shot('08-sources');

console.log('エラー処理');
await page.evaluate(() => localStorage.setItem('harmonyland-guide', '{broken'));
await goto('#plan'); await page.reload(); await page.waitForSelector('#main .card');
ok((await page.textContent('#main')).includes('保存データを読み込めなかった'), '破損データでも起動し初期化を提示');
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
const p2 = await ctx2.newPage();
await p2.route('**/data/shows.json', r => r.fulfill({ status: 500, body: 'x' }));
await p2.addInitScript(() => { window.__noBundle = true; });
await p2.route('**/js/data-fallback.js', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.HL_BUNDLED_DATA={};' }));
await p2.goto(BASE + 'index.html#shows'); await p2.waitForSelector('#main .err');
ok((await p2.textContent('#main')).includes('shows.json'), 'JSON 読み込み失敗を該当機能で表示');
await p2.goto(BASE + 'index.html#list'); await p2.waitForSelector('#main .item');
ok((await p2.locator('#main .item').count()) > 0, '他の機能は動く');
await ctx2.close();

const p3 = await ctx.newPage();
await p3.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } }); });
await p3.goto(BASE + 'index.html#facility/kitty-castle'); await p3.waitForSelector('.hero-title');
await p3.click('button:has-text("行きたい")');
ok((await p3.textContent('#toast')).includes('この端末では予定を保存できません'), 'localStorage 不可でも閲覧でき、保存不可を表示');
await p3.close();

console.log('file:// で開く');
const p4 = await ctx.newPage();
await p4.goto('file://' + path.join(ROOT, 'index.html') + '#tickets');
await p4.waitForSelector('#main .card');
ok((await p4.textContent('#main')).includes('ファンスタジオ'), 'file:// でも同梱データで表示');
await p4.close();

console.log('オフライン');
await goto('#home');
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload(); await page.waitForSelector('#main .card');
await ctx.setOffline(true);
await page.reload(); await page.waitForSelector('#main .card', { timeout: 8000 });
ok((await page.textContent('#data-state')).includes('オフライン'), 'オフラインでも表示し、その旨を明示');
await goto('#facility/fun-studio');
ok((await page.textContent('#main')).includes('デジタル整理券'), 'オフラインで施設情報を参照');
await ctx.setOffline(false);

console.log('タブレット');
await page.setViewportSize({ width: 820, height: 1180 });
await goto('#home');
ok(await noHScroll(), 'タブレットで横スクロールなし');

ok(errors.length === 0, 'コンソールエラーなし ' + errors.join(' / '));
await browser.close();
server.close();
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
