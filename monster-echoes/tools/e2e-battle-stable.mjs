// 戦闘画面の がたつき チェック：開始〜ターン再生中の 場面・コマンド・カードの いちが かわらないか
// node tools/e2e-battle-stable.mjs
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const srv = http.createServer((q, s) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); s.end(d); });
}).listen(0);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(`http://localhost:${srv.address().port}/index.html`);
await p.evaluate(() => localStorage.setItem('me-settings', JSON.stringify({ textSpeed: 'fast', battleSpeed: 'normal', reduceMotion: false, sound: false, largeText: false })));
await p.reload(); await p.waitForTimeout(600);
await p.locator('button', { hasText: 'はじめから' }).first().click(); await p.waitForTimeout(150);
await p.locator('button', { hasText: 'けってい' }).first().click(); await p.waitForTimeout(300);
const wait = (ms) => p.waitForTimeout(ms);
const skip = async (max = 80) => { await wait(350); for (let i = 0; i < max; i++) { const nm = p.locator('.panel-foot button', { hasText: 'けってい' }); if (await nm.count() && await p.$('input.name')) { await nm.last().click(); await wait(150); continue; } const has = await p.$('.msgbox:not(:has(+ .choices))'); const ch = await p.$('.choices'); if (ch) { const later = p.locator('.choices .item', { hasText: 'あとで' }); if (await later.count()) { await later.click(); await wait(100); continue; } return 'choice'; } if (!has) { await wait(120); if (!(await p.$('.msgbox'))) return; continue; } await has.click(); await wait(60); } };
await skip();
const snap = () => p.evaluate(() => {
  const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.height)].join(','); };
  const cv = document.querySelector('.bview canvas');
  return JSON.stringify({ view: r('.bview'), cv: cv ? cv.height : 0, mid: r('.battle-mid'), cmds: r('.cmds'), party: r('.party-bar') });
});
await p.evaluate(() => { const g = window.app.game; g.clearStage('1-1'); g.startExpedition('komorebi'); g.takeStory(); const s = g.startWildBattle([{ speciesId: 'm041', level: 2 }, { speciesId: 'm023', level: 2 }]); window.__debug.startBattle(window.app, s); });
const seen = new Set();
for (let i = 0; i < 25; i++) { seen.add(await snap()); await p.waitForTimeout(60); }
console.log('start states:', seen.size, [...seen]);
await p.locator('.cmds button:not([disabled])', { hasText: 'たたかう' }).click();
const seen2 = new Set();
for (let i = 0; i < 40; i++) { seen2.add(await snap()); await p.waitForTimeout(80); }
await p.screenshot({ path: process.argv[2] || '/tmp/busy.png' });
console.log('turn states:', seen2.size, [...seen2]);
const all = new Set([...seen, ...seen2]);
console.log(all.size === 1 ? 'STABLE' : 'MOVED', errors.join('\n') || 'no errors');
await b.close(); srv.close();
