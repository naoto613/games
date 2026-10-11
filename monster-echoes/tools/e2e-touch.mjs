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
// スマホそうさ（タップ・なぞり）と 冒険中の オートセーブ: node tools/e2e-touch.mjs <出力dir>
await p.reload(); const wait = (ms) => p.waitForTimeout(ms);
await p.locator('button', { hasText: 'はじめから' }).click(); await wait(200);
await p.locator('button', { hasText: 'けってい' }).click();
for (let i = 0; i < 40; i++) { const nm = p.locator('.panel-foot button', { hasText: 'けってい' }); if (await nm.count() && await p.$('input.name')) { await nm.last().click(); await wait(150); continue; } const later = p.locator('.choices .item', { hasText: 'あとで' }); if (await later.count()) await later.click(); const m = await p.$('.msgbox:not(:has(+ .choices))'); if (m && !(await p.$('.choices'))) await m.click(); await wait(80); if (await p.$('.fmenu') && !(await p.$('.msgbox'))) break; }
await wait(300);
await p.screenshot({ path: path.join(out, '01-town.png') });
const pos = () => p.evaluate(() => ({ ...window.app.game.state.player.townPos }));
const box = await p.locator('.view').boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
// なぞる: 下へ
const p0 = await pos();
await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.move(cx, cy + 20, { steps: 3 }); await p.mouse.move(cx, cy + 50, { steps: 3 });
await wait(500); await p.screenshot({ path: path.join(out, '02-drag.png') });
await p.mouse.up(); await wait(300);
const p1 = await pos();
console.log('drag down', p0, '->', p1);
// タップ: 2マス 右へ
const tile = box.width / 11;
const hero = await p.evaluate(() => { const c = document.querySelector('.view canvas').getBoundingClientRect(); return { x: c.x, y: c.y, w: c.width, h: c.height }; });
await p.mouse.click(hero.x + hero.w / 2 + tile * 2, hero.y + hero.h / 2); await wait(1200);
const p2 = await pos();
console.log('tap right2', p1, '->', p2);
// ダンジョンで うごいて、オートセーブされた きろくから 再開できるか
await p.evaluate(() => { const g = window.app.game; g.startExpedition('forest'); window.app.show(new (window.app.screen.constructor)(window.app)); });
await wait(300);
for (const d of ['down', 'right', 'up', 'left']) { await p.evaluate((d) => { window.app.game.state.expedition.stepsSinceBattle = -999; window.app.dispatch(d, true); }, d); await wait(200); await p.evaluate((d) => window.app.screen.key(d, false), d); await wait(100); }
const before = await p.evaluate(() => JSON.stringify(window.app.game.state.expedition));
await wait(1800);
await p.screenshot({ path: path.join(out, '03-dungeon.png') });
await p.reload(); await wait(500);
await p.locator('button', { hasText: 'つづきから' }).click(); await wait(500);
const after = await p.evaluate(() => JSON.stringify(window.app.game.state.expedition));
console.log('resume same expedition:', before === after, after.slice(0, 120));
await p.screenshot({ path: path.join(out, '04-resumed.png') });
console.log(errors.join('\n') || 'no errors'); await b.close(); srv.close();
