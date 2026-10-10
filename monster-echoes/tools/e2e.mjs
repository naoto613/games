// 実ブラウザ（スマホ幅）で 町→森→戦闘→牧場→配合 を自動で操作してスクリーンショットを撮る
// node tools/e2e.mjs <出力dir>
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

await wait(500);
await shot('title');
await click('はじめから');
await click('けってい');
await skip();
await shot('town');
// 北の たびのとびらへ
await p.waitForSelector('.pad-area');
await hold('left', 300);
await skip();
await p.evaluate(() => { const s = window.app.game.state; s.player.townMap = 'shrine1'; s.player.townPos = { x: 5, y: 2 }; s.player.townDir = 'up'; window.app.show(new (window.app.screen.constructor)(window.app)); });
await wait(300);
await p.evaluate(() => window.app.dispatch('a', true)); await wait(300);
await skip();
await shot('gate');
await p.locator('.choices .item').first().click();
await wait(800);
await shot('forest');
// 歩きまわって せんとう
const dirs = ['down', 'down', 'right', 'right', 'down', 'left', 'up', 'right'];
for (let i = 0; i < 60 && !(await p.$('.party-bar')); i++) {
  await hold(dirs[i % dirs.length], 400);
  if (await p.$('.choices')) await p.locator('.choices .item').last().click();
  await skip();
}
await wait(300);
await shot('battle');
// にくを なげる → たたかう
if (await p.locator('.cmds button:not([disabled])', { hasText: 'にく' }).count()) { await click('にく'); const b2 = p.locator('.cmds button').first(); await b2.click(); await wait(400); await shot('meat'); }
for (let i = 0; i < 20 && (await p.$('.party-bar')); i++) {
  const c = await skip();
  if (c === 'choice') { await shot('recruit'); await p.locator('.choices .item').first().click(); await wait(200); continue; }
  const t = p.locator('.cmds button', { hasText: 'たたかう' });
  if (await t.count()) await t.click();
  else if (await p.locator('.cmds button').count()) await p.locator('.cmds button').first().click();
  await wait(400);
}
await skip();
await shot('after-battle');
// 次の戦闘に入っていたら決着まで
for (let i = 0; i < 30 && (await p.$('.party-bar')); i++) {
  if ((await skip()) === 'choice') { await p.locator('.choices .item').last().click(); continue; }
  const bs = p.locator('.cmds button:not([disabled])');
  if (await bs.count()) await bs.first().click();
  await wait(300);
}
// メニュー → つよさ
await p.evaluate(() => window.app.dispatch('menu', true)); await wait(200);
await shot('menu');
await p.locator('.panel .item', { hasText: 'つよさ' }).click(); await wait(200);
await p.locator('.panel').last().locator('.mcard').first().click(); await wait(200);
await shot('detail');
await p.evaluate(() => window.app.closeAllPanels());
// 配合: テスト用に Lv10 のモンスターを用意
await p.evaluate(async () => {
  const g = window.app.game;
  g.state.monsters = g.state.monsters.map((m) => ({ ...m, level: 12 }));
  g.state.expedition = null;
  window.app.show(new (window.app.screen.constructor)(window.app));
});
await wait(300);
await p.evaluate(() => { const g = window.app.game; const s = g.state; s.player.townMap = 'lab1'; s.player.townPos = { x: 5, y: 2 }; s.player.townDir = 'up'; window.app.show(new (window.app.screen.constructor)(window.app)); });
await wait(200);
await p.evaluate(() => window.app.dispatch('a', true)); await wait(300);
await skip();
await p.locator('.choices .item', { hasText: '配合する' }).click(); await wait(300);
await p.locator('.pcard').first().click(); await wait(200);
await p.locator('.panel').last().locator('.item').first().click(); await wait(200);
await p.locator('.pcard').nth(1).click(); await wait(200);
await p.locator('.panel').last().locator('.item:not([disabled])').last().click(); await wait(300);
await shot('breed-preview');
await p.locator('.panel-body').last().evaluate((e) => e.scrollTop = 9999); await wait(100);
await shot('breed-preview2');
await p.locator('.panel-foot button', { hasText: '配合する' }).last().click(); await wait(400);
await shot('breed-confirm');
await p.locator('.choices .item').first().click(); await wait(1800);
await shot('birth');
await skip();
await shot('child');
console.log(errors.join('\n') || 'no errors');
await b.close(); srv.close();
