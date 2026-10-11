// まちの へや めぐり: node tools/e2e-town.mjs <出力dir>
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = process.argv[2] || '/tmp/e2e-t'; fs.mkdirSync(out, { recursive: true });
const srv = http.createServer((q, s) => { const f = path.join(root, q.url.split('?')[0].replace(/\/$/, '/index.html')); fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); s.end(d); }); }).listen(0);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const errors = []; p.on('pageerror', (e) => errors.push(e.message));
await p.goto(`http://localhost:${srv.address().port}/index.html`);
await p.evaluate(() => localStorage.setItem('me-settings', JSON.stringify({ textSpeed: 'fast', sound: false, reduceMotion: true })));
await p.reload(); const wait = (ms) => p.waitForTimeout(ms);
const shot = (n) => p.screenshot({ path: path.join(out, n + '.png') });
const msgs = async () => { for (let i = 0; i < 80; i++) { const ok = p.locator('.panel-foot button', { hasText: 'けってい' }); if (await ok.count()) { await shot('00-name'); await ok.last().click(); await wait(150); continue; } if (await p.$('.choices')) return; const m = await p.$('.msgbox'); if (!m) { await wait(200); if (!(await p.$('.msgbox')) && !(await p.locator('.panel-foot button', { hasText: 'けってい' }).count())) return; continue; } await m.click(); await wait(60); } };
await p.locator('button', { hasText: 'はじめから' }).click(); await wait(200);
await p.locator('button', { hasText: 'けってい' }).click(); await wait(300);
await msgs(); await p.waitForSelector('.fmenu');
await shot('01-town');
const go = async (map, x, y, dir, name) => {
  await p.evaluate(([m, x, y, d]) => { const s = window.app.game.state; s.player.townMap = m; s.player.townPos = { x, y }; s.player.townDir = d; window.app.show(new (window.app.screen.constructor)(window.app)); }, [map, x, y, dir]);
  await wait(400); await shot(name);
};
const step = async (dir) => { await p.evaluate((d) => window.app.dispatch(d, true), dir); await wait(250); await p.evaluate((d) => window.app.screen.key(d, false), dir); await wait(500); };
// まちの とびら → 神殿
await go('town', 9, 3, 'up', '02-before-shrine');
await step('up');
await shot('03-shrine1');
console.log('map', await p.evaluate(() => window.app.game.state.player.townMap));
// 鍵のかかった階段
await go('shrine1', 8, 4, 'right', '04-shrine-stairs'); await step('right'); await shot('05-locked'); await msgs();
// やかた・ぼくじょう・みせ・とうぎじょう
await p.evaluate(() => { const g = window.app.game; for (const s of ['leafant', 'frostbird', 'stonegolem', 'darkeye', 'kinoborg']) g.acceptRecruit(s, 4); });
await go('lab1', 5, 4, 'up', '06-lab1');
await go('ranch1', 6, 4, 'down', '07-ranch1');
await go('shop', 4, 3, 'up', '08-shop');
await go('arena1', 5, 3, 'up', '09-arena');
// メダルこうかん
await p.evaluate(() => { window.app.game.state.inventory.medal = 9; });
await go('shop', 6, 4, 'right', '10-shop-medal'); await p.evaluate(() => window.app.dispatch('a', true)); await wait(400); await shot('11-medal');
await p.evaluate(() => window.app.closeAllPanels());
// 進行後: 2Fへ
await p.evaluate(() => { const g = window.app.game; g.state.progress.defeatedBossIds.push('boss_forest'); g.state.discoveredSpeciesIds.push('kazetsubame', 'homurawolf'); });
await go('lab1', 8, 5, 'right', '12-lab-stairs'); await step('right'); await shot('13-lab2');
console.log('map', await p.evaluate(() => window.app.game.state.player.townMap));
await go('lab1', 2, 5, 'left', '14-librarian'); await p.evaluate(() => window.app.dispatch('a', true)); await wait(300); await msgs(); await shot('15-dex-reward');
console.log('medals', await p.evaluate(() => window.app.game.state.inventory.medal));
console.log(errors.join('\n') || 'no errors'); await b.close(); srv.close();
