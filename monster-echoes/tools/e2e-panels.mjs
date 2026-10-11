// 町の施設パネルを開いてスクリーンショット: node tools/e2e-panels.mjs <出力dir>
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = process.argv[2] || '/tmp/e2e-p';
fs.mkdirSync(out, { recursive: true });
const srv = http.createServer((q, s) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); s.end(d); });
}).listen(0);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const errors = [];
p.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
await p.goto(`http://localhost:${srv.address().port}/index.html`);
await p.evaluate(() => localStorage.setItem('me-settings', JSON.stringify({ textSpeed: 'fast', battleSpeed: 'instant', reduceMotion: true, sound: false })));
await p.reload();
const wait = (ms) => p.waitForTimeout(ms);
const skip = async () => { await wait(300); for (let i = 0; i < 40; i++) { const nm = p.locator('.panel-foot button', { hasText: 'けってい' }); if (await nm.count() && await p.$('input.name')) { await nm.last().click(); await wait(150); continue; } if (await p.$('.choices')) { const later = p.locator('.choices .item', { hasText: 'あとで' }); if (await later.count()) { await later.click(); await wait(100); continue; } return 'choice'; } const m = await p.$('.msgbox'); if (!m) { await wait(150); if (!(await p.$('.msgbox'))) return; continue; } await m.click(); await wait(50); } };
await p.locator('button', { hasText: 'はじめから' }).click(); await wait(200);
await p.locator('button', { hasText: 'けってい' }).click();
await skip();
await p.waitForSelector('.fmenu');
// 進行を進めた状態にする
await p.evaluate(() => {
  const s = window.app.game.state;
  s.progress.defeatedBossIds.push('boss_forest'); s.progress.unlockedAreas.push('cave'); s.progress.unlockedArenaRanks.push('arenaF');
  s.discoveredSpeciesIds.push('frostbird', 'leafant', 'darkeye'); s.player.gold = 500;
});
const talk = async (map, x, y, dir, name) => {
  await p.evaluate(([m, x, y, d]) => { const s = window.app.game.state; s.player.townMap = m; s.player.townPos = { x, y }; s.player.townDir = d; window.app.show(new (window.app.screen.constructor)(window.app)); }, [map, x, y, dir]);
  await wait(200);
  await p.evaluate(() => window.app.dispatch('a', true));
  if ((await skip()) === 'choice') await p.locator('.choices .item').first().click();
  await wait(300);
  await p.screenshot({ path: path.join(out, `${name}.png`) });
  await p.evaluate(() => window.app.closeAllPanels());
  await skip();
};
await talk('lab1', 5, 2, 'up', 'doctor-breed');
await talk('ranch1', 5, 5, 'down', 'ranch');
await talk('shop', 4, 2, 'up', 'shop');
await talk('arena1', 5, 2, 'up', 'arena');
// 図鑑
await p.evaluate(() => { const s = window.app.game.state; s.player.townMap = 'lab1'; s.player.townPos = { x: 5, y: 2 }; s.player.townDir = 'up'; window.app.show(new (window.app.screen.constructor)(window.app)); });
await wait(200);
await p.evaluate(() => window.app.dispatch('a', true));
if ((await skip()) === 'choice') await p.locator('.choices .item').nth(1).click();
await wait(300);
await p.screenshot({ path: path.join(out, 'dex.png') });
console.log(errors.join('\n') || 'no errors');
await b.close(); srv.close();
