// 参考画像2と くらべる 画面の 撮影（タイトル・リーフェル・メニュー・戦闘・配合）
// node tools/e2e-screens.mjs <出力dir>
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = process.argv[2] || '/tmp/e2e';
fs.mkdirSync(out, { recursive: true });
const srv = http.createServer((q, s) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); s.end(d); });
}).listen(0);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
const errors = [];
p.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()); });
await p.goto(`http://localhost:${srv.address().port}/index.html`);
await p.evaluate(() => localStorage.setItem('me-settings', JSON.stringify({ textSpeed: 'fast', battleSpeed: 'instant', reduceMotion: true, sound: false, largeText: false })));
await p.reload();
let n = 0;
const shot = async (name) => p.screenshot({ path: path.join(out, `${String(n++).padStart(2, '0')}-${name}.png`) });
const wait = (ms) => p.waitForTimeout(ms);
/** メッセージが出ているあいだ タップし続ける */
const skip = async (max = 80) => { await wait(350); for (let i = 0; i < max; i++) { const nm = p.locator('.panel-foot button', { hasText: 'けってい' }); if (await nm.count() && await p.$('input.name')) { await nm.last().click(); await wait(150); continue; } const has = await p.$('.msgbox:not(:has(+ .choices))'); const ch = await p.$('.choices'); if (ch) { const later = p.locator('.choices .item', { hasText: 'あとで' }); if (await later.count()) { await later.click(); await wait(100); continue; } return 'choice'; } if (!has) { await wait(120); if (!(await p.$('.msgbox'))) return; continue; } await has.click(); await wait(60); } };
const click = async (text) => { const el = p.locator('button', { hasText: text }).first(); await el.click(); await wait(150); };
const hold = async (dir, ms) => { await p.evaluate((d) => window.app.dispatch(d, true), dir); await wait(ms); await p.evaluate((d) => window.app.screen.key(d, false), dir); await wait(200); };

const reshow = () => p.evaluate(() => { window.__Field ??= window.app.screen.constructor; window.app.show(new window.__Field(window.app)); });
await wait(700);
await shot('title');
await click('はじめから');
await click('けってい');
await skip();
// なかまを ふやして（戦闘・配合の 見た目を 確認する ため）
await p.evaluate(() => { const g = window.app.game; g.acceptRecruit('m041', 10); g.acceptRecruit('m023', 10); g.state.monsters.forEach((m, i) => { m.sex = i % 2 ? 'A' : 'B'; m.level = Math.max(m.level, 10); }); });
await reshow(); await wait(400);
await shot('field');
await p.evaluate(() => window.app.screen.key('menu', true)); await wait(500);
await shot('menu');
await p.evaluate(() => window.app.closeAllPanels()); await wait(300);
await p.evaluate(() => { const g = window.app.game; g.clearStage('1-1'); g.startExpedition('komorebi'); g.takeStory(); const s = g.startWildBattle([{ speciesId: 'm041', level: 3 }, { speciesId: 'm023', level: 3 }, { speciesId: 'm043', level: 3 }]); window.__debug.startBattle(window.app, s); });
await wait(2200);
await shot('battle');
await click('めいれい'); await wait(300);
await shot('battle-order');
await p.evaluate(() => { const g = window.app.game; g.battle = null; g.leaveExpedition(); for (const id of ['1-2', '1-3', '2-1']) g.clearStage(id); g.state.player.townMap = 'mizuna_lab'; g.setTownPos({ x: 5, y: 2 }, 'up'); });
await reshow(); await wait(400);
await shot('lab');
await p.evaluate(() => window.app.screen.key('a', true)); await wait(300);
await skip();
await wait(300);
await shot('breed-menu');
console.log(errors.join('\n') || 'no errors'); await b.close(); srv.close();
