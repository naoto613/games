// どうくつ・こうげんの フィールドを撮影: node tools/e2e-areas.mjs <出力dir>
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = process.argv[2] || '/tmp/e2e-a'; fs.mkdirSync(out, { recursive: true });
const srv = http.createServer((q, s) => { const f = path.join(root, q.url.split('?')[0].replace(/\/$/, '/index.html')); fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); s.end(d); }); }).listen(0);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const errors = []; p.on('pageerror', (e) => errors.push(e.message));
await p.goto(`http://localhost:${srv.address().port}/index.html`);
await p.evaluate(() => localStorage.setItem('me-settings', JSON.stringify({ textSpeed: 'fast', sound: false, reduceMotion: true })));
await p.reload(); const wait = (ms) => p.waitForTimeout(ms);
await p.locator('button', { hasText: 'はじめから' }).click(); await wait(200);
await p.locator('button', { hasText: 'けってい' }).click();
for (let i = 0; i < 40; i++) { const nm = p.locator('.panel-foot button', { hasText: 'けってい' }); if (await nm.count() && await p.$('input.name')) { await nm.last().click(); await wait(150); continue; } const later = p.locator('.choices .item', { hasText: 'あとで' }); if (await later.count()) await later.click(); const m = await p.$('.msgbox:not(:has(+ .choices))'); if (m && !(await p.$('.choices'))) await m.click(); await wait(80); if (await p.$('.pad-area') && !(await p.$('.msgbox'))) break; }
for (const [area, fl, x, y] of [['cave', 1, 0, 0], ['highland', 0, 0, 0], ['forest', 2, 0, 0], ['tower', 0, 0, 0], ['forest', 0, 0, 0]]) {
  await p.evaluate(([a, f, x, y]) => { const g = window.app.game; g.state.progress.unlockedAreas.push(a); g.startExpedition(a); for (let i = 0; i < f; i++) g.descend(); window.app.show(new (window.app.screen.constructor)(window.app)); }, [area, fl, x, y]);
  await wait(400); await p.screenshot({ path: path.join(out, `${area}${fl}.png`) });
}
console.log(errors.join('\n') || 'no errors'); await b.close(); srv.close();
