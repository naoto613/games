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
const goto = async (hash) => { await page.goto(BASE + 'index.html' + hash); await page.waitForSelector('#main .card, #main .row, #main .err', { timeout: 5000 }); };

console.log('きょう');
await goto('#today');
ok(await page.textContent('#app-date') === '対象日 2026年10月13日（火）', '対象日を表示');
const td = await page.textContent('#main');
ok(td.includes('営業時間は公式サイトで確認してください'), '営業時間は公式で確認');
ok(td.includes('参考') && td.includes('整理券の条件は公式で確認'), '時刻は参考・整理券は公式で確認');
const times = await page.$$eval('.row-time', els => els.map(e => e.textContent));
ok(JSON.stringify(times) === JSON.stringify(['開園から約20分', '10:30', '11:00', '12:30', '13:30', '15:00', '16:00']), '時間順（平日の時刻）: ' + times.join(' | '));
ok(!td.includes('15:15'), '土日祝の時刻は出さない');
ok(td.includes('受付 10:30〜') && td.includes('先着約90名'), 'ダイコウシンの受付を同じ行に表示');
ok(td.includes('時間の決まっていないもの') && td.includes('デジタル整理券'), 'ファンスタジオの整理券');
ok(await page.locator('.bottom-nav a').count() === 4, 'タブは4つ');
ok(await noHScroll(), '横スクロールなし');
await page.locator('.row', { hasText: 'Magical Masquerade' }).locator('.star').click();
ok(await page.locator('.row', { hasText: 'Magical Masquerade' }).locator('.star.on').count() === 1, '☆でプランに入る');
await shot('01-today');

console.log('詳細');
await page.click('.row-main:has-text("Magical Masquerade")');
await page.waitForSelector('.hero-title');
const md = await page.textContent('#main');
ok(md.includes('平日 16:00〜16:20') && md.includes('出演：') && md.includes('マジカルマスカレードマスク 1,320円'), 'わかっていること');
ok(md.includes('当日確認：') && md.includes('当日の開催と時刻'), '未確認は1行にまとめる');
await page.click('summary:has-text("観覧ルール")');
ok((await page.textContent('#main')).includes('三脚'), '観覧ルール（折りたたみ）');
const ext = page.locator('a.ext').first();
ok(await ext.getAttribute('target') === '_blank' && (await ext.getAttribute('rel')).includes('noopener'), '外部リンク属性');
await goto('#d/fun-studio');
await page.click('button:has-text("行った")');
ok(await page.locator('button:has-text("✔ 行った")').count() === 1, '行ったに切り替え');
ok((await page.textContent('#main')).includes('ファンスタジオ前特設ブース'), '過去の配布場所は過去の情報として表示');
await shot('03-detail');
await page.reload(); await page.waitForSelector('.hero-title');
ok(await page.locator('button:has-text("✔ 行った")').count() === 1, '再読み込み後も保持');

console.log('以前のURL');
await goto('#facility/kitty-castle');
ok((await page.textContent('.hero-title')).includes('キティキャッスル'), '#facility/ → 詳細');
await goto('#tickets');
ok((await page.textContent('#screen-title')) === 'きょうの予定', '#tickets → きょう');
await goto('#list');
ok((await page.textContent('#screen-title')) === 'マップ', '#list → マップ');

console.log('マップ');
await goto('#map');
await page.fill('input.search', 'ふぁんすたじお');
ok((await page.locator('#main .list .row-name').first().textContent()).includes('ファンスタジオ'), 'ひらがなでカタカナを検索');
await page.fill('input.search', 'トイレ');
ok((await page.textContent('#main .list')).includes('トイレ（各エリア）'), 'トイレを検索');
await page.fill('input.search', 'ＸＹＺ');
ok((await page.textContent('#main')).includes('該当する施設はありません'), '該当なし');
await page.fill('input.search', '');
await page.click('button.chip[data-g="rain"]');
ok(await page.locator('#main .list .row').count() === 5, '雨・風で運休 5件');
await page.click('button.chip[data-g="baby"]');
ok((await page.textContent('#main .list')).includes('ベビーセンター（インフォメーション横）'), '赤ちゃん・サービス');
await page.click('button.chip[data-g="all"]');
ok(await page.locator('.map-marker').count() === 11, 'マーカー 11件（10施設＋2つ目の駅）');
ok(await page.locator('.map-marker.est').count() === 6, '推定位置は点線 6件');
await page.click('.map-tools button[aria-label="拡大"]');
ok(/scale\(1\.4/.test(await page.$eval('.map-stage', e => e.style.transform)), '拡大できる');
await goto('#map?focus=information');
ok((await page.textContent('.map-overlay-msg')).includes('分かっていません'), '位置が分からない施設の案内');
ok(await page.locator('.row.highlight').count() === 1, '一覧で強調');
await page.evaluate(() => { location.hash = '#map?focus=kitty-castle'; });
await page.waitForSelector('.map-marker.active');
const pos1 = await page.$eval('.map-marker.active', e => { const r = e.getBoundingClientRect(); const s = document.querySelector('.map-stage').getBoundingClientRect(); return [(r.left + r.width / 2 - s.left) / s.width, (r.bottom - s.top) / s.height]; });
ok(Math.abs(pos1[0] - 0.725) < 0.02 && Math.abs(pos1[1] - 0.38) < 0.03, '拡大後もマーカー位置が正しい ' + pos1.map(v => v.toFixed(3)));
await shot('02-map');
await page.click('.map-popup .row-main');
await page.waitForSelector('.hero-title');
ok((await page.textContent('.hero-title')).includes('キティキャッスル'), 'マーカーから詳細へ');

console.log('プラン');
await goto('#plan');
const pl = await page.$$eval('.plan-item .row-name', els => els.map(e => e.textContent));
ok(pl.length === 1 && pl[0].includes('Magical Masquerade'), '☆を付けたものがプランに並ぶ: ' + pl.join(' / '));
const tv = await page.locator('.plan-item input[type=time]').evaluateAll(els => els.map(e => e.value));
ok(tv.every(v => v === ''), '参考時刻を自動入力しない');
await page.selectOption('select[aria-label="子どもの年齢を追加"]', '3');
await page.waitForSelector('text=3歳 ×');
await page.check('text=雨の日モード');
await page.locator('#main textarea').fill('先に整理券');
await page.waitForTimeout(600);
await page.reload(); await page.waitForSelector('.plan-item');
ok(await page.locator('#main textarea').inputValue() === '先に整理券', 'メモを保存');
ok(await page.locator('text=3歳 ×').count() === 1 && await page.isChecked('text=雨の日モード'), '年齢と雨の日モードを保存');
await shot('04-plan');
await goto('#d/rhythmic-coaster');
ok((await page.textContent('#main')).includes('3歳：利用不可（4歳未満）'), '年齢で利用不可');
await goto('#d/kitty-castle');
ok((await page.textContent('#main')).includes('3歳：保護者同伴が必要'), '年齢で保護者同伴');
await goto('#map?f=kids');
const kids = await page.$$eval('#main .list .row-name', els => els.map(e => e.textContent));
ok(!kids.includes('リズミックコースター') && kids.includes('キティキャッスル') && !kids.includes('Sky Pal Collection'), '年齢でOKの絞り込み: ' + kids.length + '件');
await goto('#today');
ok((await page.textContent('#main')).includes('雨の日モード'), '雨の日モードの案内');

console.log('情報');
await goto('#info');
const cb0 = page.locator('details.fold input[type=checkbox]').first();
await cb0.check();
await page.reload(); await page.waitForSelector('#main .card');
ok(await page.locator('details.fold input[type=checkbox]').first().isChecked(), 'チェックリストを保存');
await page.click('summary:has-text("赤ちゃん")');
ok((await page.textContent('#main')).includes('男性はベビーセンター内に入室できない'), '子ども連れ情報');
await page.click('summary:has-text("出典")');
ok((await page.locator('details:has(summary:has-text("出典")) li').count()) === 15, '出典 15件');
await shot('05-info');

console.log('エラー処理');
await page.evaluate(() => localStorage.setItem('harmonyland-guide', '{broken'));
await goto('#plan'); await page.reload(); await page.waitForSelector('#main .card');
ok((await page.textContent('#main')).includes('保存データを読み込めなかった'), '破損データでも起動し初期化を提示');
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
const p2 = await ctx2.newPage();
await p2.route('**/data/shows.json', r => r.fulfill({ status: 500, body: 'x' }));
await p2.addInitScript(() => { window.__noBundle = true; });
await p2.route('**/js/data-fallback.js', r => r.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.HL_BUNDLED_DATA={};' }));
await p2.goto(BASE + 'index.html#today'); await p2.waitForSelector('#main .err');
ok((await p2.textContent('#main')).includes('shows.json'), 'JSON 読み込み失敗を該当機能で表示');
await p2.goto(BASE + 'index.html#map'); await p2.waitForSelector('#main .row');
ok((await p2.locator('#main .row').count()) > 0, '他の機能は動く');
await ctx2.close();

const p3 = await ctx.newPage();
await p3.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } }); });
await p3.goto(BASE + 'index.html#d/kitty-castle'); await p3.waitForSelector('.hero-title');
await p3.click('button.star');
ok((await p3.textContent('#toast')).includes('この端末では予定を保存できません'), 'localStorage 不可でも閲覧でき、保存不可を表示');
await p3.close();

console.log('file:// で開く');
const p4 = await ctx.newPage();
await p4.goto('file://' + path.join(ROOT, 'index.html') + '#today');
await p4.waitForSelector('#main .card');
ok((await p4.textContent('#main')).includes('ファンスタジオ'), 'file:// でも同梱データで表示');
await p4.close();

console.log('オフライン');
await goto('#today');
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload(); await page.waitForSelector('#main .card');
await ctx.setOffline(true);
await page.reload(); await page.waitForSelector('#main .card', { timeout: 8000 });
ok((await page.textContent('#data-state')).includes('オフライン'), 'オフラインでも表示し、その旨を明示');
await goto('#d/fun-studio');
ok((await page.textContent('#main')).includes('デジタル整理券'), 'オフラインで施設情報を参照');
await ctx.setOffline(false);

console.log('タブレット');
await page.setViewportSize({ width: 820, height: 1180 });
await goto('#today');
ok(await noHScroll(), 'タブレットで横スクロールなし');

ok(errors.length === 0, 'コンソールエラーなし ' + errors.join(' / '));
await browser.close();
server.close();
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
