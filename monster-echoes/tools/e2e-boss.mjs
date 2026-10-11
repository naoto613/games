// ボスの へやを 撮影: node tools/e2e-boss.mjs <出力dir>
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = process.argv[2] || '/tmp/e2e-boss';
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
await p.reload(); const wait = (ms) => p.waitForTimeout(ms);
await p.locator('button', { hasText: 'はじめから' }).click(); await wait(200);
await p.locator('button', { hasText: 'けってい' }).click();
for (let i = 0; i < 40; i++) { const nm = p.locator('.panel-foot button', { hasText: 'けってい' }); if (await nm.count() && await p.$('input.name')) { await nm.last().click(); await wait(150); continue; } const later = p.locator('.choices .item', { hasText: 'あとで' }); if (await later.count()) await later.click(); const m = await p.$('.msgbox:not(:has(+ .choices))'); if (m && !(await p.$('.choices'))) await m.click(); await wait(80); if (await p.$('.fmenu') && !(await p.$('.msgbox'))) break; }
for (const area of ['forest', 'cave', 'highland', 'tower', 'snow', 'volcano']) {
  await p.evaluate((a) => { const g = window.app.game; g.state.progress.unlockedAreas.push(a); g.startExpedition(a); const n = window.app.game.floor.area.floors.length; for (let i = 0; i < n - 1; i++) g.descend(); window.app.show(new (window.app.screen.constructor)(window.app)); }, area);
  await wait(500); await p.screenshot({ path: path.join(out, `boss-${area}.png`) });
}
console.log(errors.join('\n') || 'no errors'); await b.close(); srv.close();
