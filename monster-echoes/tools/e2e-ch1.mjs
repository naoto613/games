// 第1章の 流れを 実ブラウザで たしかめる：タイトル → リーフェル → 石碑 → 森の入口 → 木漏れ日の小道 → 石碑の グリーンスプライト → モルグ → ミズナ
// node tools/e2e-ch1.mjs <出力dir>
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

const at = async (x, y, dir) => { await p.evaluate(([x, y, d]) => { const g = window.app.game; g.setTownPos({ x, y }, d); window.app.show(new (window.app.screen.constructor)(window.app)); }, [x, y, dir]); await wait(300); };
const press = async (k) => { await p.evaluate((k) => window.app.screen.key(k, true), k); await wait(250); };
const info = async () => p.evaluate(() => { const g = window.app.game; return { town: g.state.player.townMap, ex: g.state.expedition && { a: g.state.expedition.areaId, f: g.state.expedition.floorIndex }, ch: g.chapters.chapter, cleared: g.chapters.clearedStages, party: g.party.map((m) => m.speciesId) }; });

await wait(500);
await shot('title');
await click('はじめから');
await click('けってい');
await skip();
await shot('liefel');
// 石碑（8,3）を しらべる
await at(11, 4, 'up');
await press('a');
await shot('stone');
await skip();
console.log('after stone', JSON.stringify(await info()));
// 森の入口（9,0）
await at(13, 1, 'up');
await press('a');
await wait(300);
await shot('gate');
await p.locator('.panel .item', { hasText: '木漏れ日の小道' }).first().click();
await wait(900);
await skip();
await shot('komorebi1');
console.log('in dungeon', JSON.stringify(await info()));
// 3F の 石碑へ（API で 階を すすめて、イベントの となりへ）
await p.evaluate(() => { const g = window.app.game; g.acceptRecruit('m033', 20); g.acceptRecruit('m033', 20); g.descend(); g.descend(); g.takeStory(); const m = g.currentMap(); const k = Object.entries(m.events).find(([, id]) => id === 'ch1_first_recruit')[0]; const [x, y] = k.split(',').map(Number); const dirs = [[0, 1, 'up'], [0, -1, 'down'], [1, 0, 'left'], [-1, 0, 'right']]; for (const [dx, dy, d] of dirs) { const t = m.tiles[y + dy]?.[x + dx]; if (t && '.,S'.includes(t)) { g.state.expedition.pos = { x: x + dx, y: y + dy }; g.state.expedition.dir = d; break; } } window.app.show(new (window.app.screen.constructor)(window.app)); });
await wait(400);
await shot('komorebi3');
await press('a');
await wait(300);
await shot('stone-event');
await skip();
await wait(800);
await shot('recruit-battle');
// 戦闘は おまかせで
for (let i = 0; i < 30; i++) { const b = p.locator('.cmds button', { hasText: 'たたかう' }); if (await b.count()) { await b.first().click(); await wait(400); } const r = await skip(20); if (r === 'choice') { const yes = p.locator('.choices .item', { hasText: 'はい' }); if (await yes.count()) await yes.first().click(); await wait(200); } if (await p.$('.fmenu')) break; }
await skip();
console.log('after recruit battle', JSON.stringify(await info()));
await shot('after-battle');
// ステージクリア → 1-3 → モルグ（API で ボスの へやへ）
await p.evaluate(() => { const g = window.app.game; g.finishStage(); g.takeStory(); g.startExpedition('sasayaki'); g.takeStory(); for (let i = 0; i < 4; i++) g.descend(); g.takeStory(); g.healAll(); window.app.show(new (window.app.screen.constructor)(window.app)); });
await wait(500);
await shot('morg-room');
await p.evaluate(() => { const g = window.app.game; const s = g.startBossBattle('morg'); for (const e of s.state.enemies) e.hp = 1; window.__debug.startBattle(window.app, s); });
await wait(1200);
await shot('morg-battle');
for (let i = 0; i < 40; i++) { const b = p.locator('.cmds button', { hasText: 'たたかう' }); if (await b.count()) { await b.first().click(); await wait(400); } await skip(30); if (await p.$('.fmenu') && !(await p.$('.msgbox'))) break; }
await skip();
console.log('after morg', JSON.stringify(await info()));
await shot('after-morg');
// ミズナへ
await at(24, 10, 'right');
await p.evaluate(() => window.app.screen.key('right', true)); await wait(400); await p.evaluate(() => window.app.screen.key('right', false));
await wait(900);
await shot('mizuna-arrive');
await skip();
console.log('mizuna', JSON.stringify(await info()));
await shot('mizuna');
await p.evaluate(() => { const g = window.app.game; g.setTownPos({ x: 5, y: 2 }, 'up'); g.state.player.townMap = 'mizuna_lab'; window.app.show(new (window.app.screen.constructor)(window.app)); });
await wait(400);
await press('a');
await skip();
await shot('lab');
console.log(errors.join('\n') || 'no errors'); await b.close(); srv.close();
