// 牧場の いれかえ・地図タップ移動・まちメニューを確認: node tools/e2e-ranch.mjs <出力dir>
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = process.argv[2] || '/tmp/e2e-r'; fs.mkdirSync(out, { recursive: true });
const srv = http.createServer((q, s) => { const f = path.join(root, q.url.split('?')[0].replace(/\/$/, '/index.html')); fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); s.end(d); }); }).listen(0);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const errors = []; p.on('pageerror', (e) => errors.push(e.message));
await p.goto(`http://localhost:${srv.address().port}/index.html`);
await p.evaluate(() => localStorage.setItem('me-settings', JSON.stringify({ textSpeed: 'fast', sound: false, reduceMotion: true })));
await p.reload(); const wait = (ms) => p.waitForTimeout(ms);
const shot = (n) => p.screenshot({ path: path.join(out, n + '.png') });
const msgs = async () => { for (let i = 0; i < 80; i++) { const later = p.locator('.choices .item', { hasText: 'あとで' }); if (await later.count()) { await later.click(); await wait(80); continue; } if (await p.$('.choices')) return; const m = await p.$('.msgbox'); if (!m) { await wait(150); if (!(await p.$('.msgbox'))) return; continue; } await m.click(); await wait(60); } };
const party = () => p.evaluate(() => window.app.game.party.map((m) => m.speciesId));
await p.locator('button', { hasText: 'はじめから' }).click(); await wait(200);
await p.locator('button', { hasText: 'けってい' }).click(); await wait(300);
await msgs(); await p.waitForSelector('.pad-area');
await shot('01-field-strip');
await p.evaluate(() => { const g = window.app.game; for (const s of ['mossglow', 'yorufukuro', 'iwatokage', 'tsukipon']) g.acceptRecruit(s, 4); });
// まちメニュー → ぼくじょう
await p.evaluate(() => window.app.dispatch('menu', true)); await wait(200);
await shot('02-menu');
await p.locator('.panel .item', { hasText: 'ぼくじょう' }).click(); await wait(200);
console.log('party before', await party());
await shot('03-ranch');
// パーティ1番 → 牧場の ヨルフクロ で いれかえ
await p.locator('.panel').last().locator('.mcard').nth(0).click(); await wait(150);
await shot('04-ranch-selected');
await p.locator('.panel').last().locator('.mcard', { hasText: 'ヨルフクロ' }).click(); await wait(200);
console.log('after swap', await party());
// 牧場の イワトカゲ → パーティ2番
await p.locator('.panel').last().locator('.mcard', { hasText: 'イワトカゲ' }).click(); await wait(150);
await p.locator('.panel').last().locator('.mcard').nth(1).click(); await wait(200);
console.log('after box->party', await party());
// パーティどうし ならびかえ（1と3）
await p.locator('.panel').last().locator('.mcard').nth(0).click(); await wait(100);
await p.locator('.panel').last().locator('.mcard').nth(2).click(); await wait(200);
console.log('after reorder', await party());
await shot('05-ranch-after');
await p.evaluate(() => window.app.closeAllPanels()); await wait(200);
// 地図タップで 歩く（ふんすいの そばへ）
const pos0 = await p.evaluate(() => ({ ...window.app.game.state.player.townPos }));
const box = await p.locator('.view canvas').boundingBox();
await p.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.25); await wait(1500);
const pos1 = await p.evaluate(() => ({ ...window.app.game.state.player.townPos }));
console.log('tap walk', pos0, '->', pos1);
await shot('06-after-tapwalk');
console.log(errors.join('\n') || 'no errors'); await b.close(); srv.close();
