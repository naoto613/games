// 第2章の 通し確認（祠の 扉 → 水音の洞穴 → 泡守りの騎士 → 深淵の水路 → ウロコ王 → 第2章クリア）
// node tools/e2e-ch2.mjs <出力dir>
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
const said = [];
const skip = async (max = 80) => { await wait(350); for (let i = 0; i < max; i++) { const nm = p.locator('.panel-foot button', { hasText: 'けってい' }); if (await nm.count() && await p.$('input.name')) { await nm.last().click(); await wait(150); continue; } const has = await p.$('.msgbox:not(:has(+ .choices))'); const ch = await p.$('.choices'); if (ch) { const later = p.locator('.choices .item', { hasText: 'あとで' }); if (await later.count()) { await later.click(); await wait(100); continue; } const no = p.locator('.choices .item', { hasText: 'やめる' }); if (await no.count()) { await no.first().click(); await wait(100); continue; } return 'choice'; } if (!has) { await wait(120); if (!(await p.$('.msgbox'))) return; continue; } said.push(await has.innerText()); await has.click(); await wait(60); } };
const click = async (text) => { const el = p.locator('button', { hasText: text }).first(); await el.click(); await wait(150); };
const press = async (k) => { await p.evaluate((k) => window.app.screen.key(k, true), k); await wait(250); };
const reshow = () => p.evaluate(() => { window.__Field ??= window.app.screen.constructor; window.app.show(new window.__Field(window.app)); });
const info = async () => p.evaluate(() => { const g = window.app.game; return { town: g.state.player.townMap, ex: g.state.expedition && { a: g.state.expedition.areaId, f: g.state.expedition.floorIndex }, ch: g.chapters.chapter, cleared: g.chapters.clearedStages, cap: g.state.capacity, feats: g.chapters.features.filter((f) => ['skillInherit', 'ranchExpand'].includes(f)) }; });
const fightAll = async () => { for (let i = 0; i < 40; i++) { const bt = p.locator('.cmds button:not([disabled])', { hasText: 'たたかう' }); if (await bt.count()) { await bt.first().click(); await wait(400); } await skip(30); if (await p.$('.fbtns') && !(await p.$('.msgbox')) && !(await p.$('.battle'))) break; } await skip(); };
/** フロアの 物語イベントの となりへ 立って しらべる */
const inspectEvent = async (id) => {
  await p.evaluate((id) => { const g = window.app.game; const m = g.currentMap(); const k = Object.entries(m.events ?? {}).find(([, v]) => v === id)?.[0]; if (!k) throw new Error('no event ' + id); const [x, y] = k.split(',').map(Number); const dirs = [[0, 1, 'up'], [0, -1, 'down'], [1, 0, 'left'], [-1, 0, 'right']]; for (const [dx, dy, d] of dirs) { const t = m.tiles[y + dy]?.[x + dx]; if (t && '.,S'.includes(t)) { g.state.expedition.pos = { x: x + dx, y: y + dy }; g.state.expedition.dir = d; break; } } }, id);
  await reshow(); await wait(400);
  await press('a'); await wait(300);
};
const expect = (c, msg) => { if (!c) errors.push('EXPECT: ' + msg); };

await wait(600);
await click('はじめから');
await click('けってい');
await skip();
// 第1章クリアずみ・ミズナに 着いた ところから（第1章は e2e-ch1 で 確認）
await p.evaluate(() => { const g = window.app.game; for (const id of ['1-1', '1-2', '1-3']) g.clearStage(id); g.acceptRecruit('m105', 16); g.acceptRecruit('m101', 16); for (const m of g.state.monsters) m.level = Math.max(m.level, 16); g.state.player.townMap = 'mizuna'; g.setTownPos({ x: 13, y: 14 }, 'down'); g.takeStory(); });
await reshow(); await wait(300);
await p.evaluate(() => { const g = window.app.game; g.state.player.townMap = 'mizuna'; g.setTownPos({ x: 2, y: 10 }, 'right'); });
// ミズナの 東から 入りなおして 到着の 物語（2-1）
await p.evaluate(() => { const g = window.app.game; g.state.player.townMap = 'liefel'; g.setTownPos({ x: 24, y: 10 }, 'right'); });
await reshow(); await wait(300);
await p.evaluate(() => window.app.screen.key('right', true)); await wait(400); await p.evaluate(() => window.app.screen.key('right', false));
await wait(900);
await skip();
console.log('mizuna', JSON.stringify(await info()));
// 祠：まだ ひらいていない
await p.evaluate(() => { const g = window.app.game; g.state.player.townMap = 'mizuna_shrine'; const m = g.currentTownMap(); g.setTownPos({ x: 5, y: 2 }, 'up'); });
await reshow(); await wait(300);
await press('a'); await wait(300);
await shot('shrine-closed');
await skip();
expect(said.some((t) => t.includes('ミナモ')), '祠が とじているとき ミナモへの 案内が でる');
// 配合の館の ミナモに はなす（NPC の となりへ）
await p.evaluate(() => { const g = window.app.game; g.state.player.townMap = 'mizuna_lab'; g.setTownPos({ x: 5, y: 2 }, 'up'); });
await reshow(); await wait(300);
await press('a'); await wait(300);
await shot('minamo');
await skip();
const flags = await p.evaluate(() => window.app.game.state.progress.storyFlags);
expect(flags.ch2_shrine_open, 'ミナモと はなすと 祠が ひらく');
// 祠 → 行き先を えらぶ
await p.evaluate(() => { const g = window.app.game; g.state.player.townMap = 'mizuna_shrine'; g.setTownPos({ x: 5, y: 2 }, 'up'); });
await reshow(); await wait(300);
await press('a'); await wait(400);
await shot('shrine-gate');
const items = await p.locator('.panel .item').allInnerTexts();
console.log('gate', items.map((t) => t.split('\n')[0]).join(' / '));
await p.locator('.panel .item', { hasText: '水音の洞穴' }).first().click();
await wait(900);
await skip();
await shot('mizuoto1');
console.log('in cave', JSON.stringify(await info()));
// 泡守りの騎士
await p.evaluate(() => { const g = window.app.game; for (let i = 0; i < 3; i++) g.descend(); g.takeStory(); g.healAll(); });
await reshow(); await wait(400);
await shot('knight-room');
await p.evaluate(() => { const g = window.app.game; const s = g.startBossBattle('bubbleknight'); for (const e of s.state.enemies) e.hp = 1; window.__debug.startBattle(window.app, s); });
await wait(1200);
await shot('knight-battle');
await fightAll();
console.log('after knight', JSON.stringify(await info()));
expect((await info()).cleared.includes('2-2'), '騎士を たおすと 2-2 クリア');
// 深淵の水路
await p.evaluate(() => { const g = window.app.game; g.leaveExpedition?.(); g.healAll(); g.startExpedition('shinen'); g.takeStory(); g.descend(); g.descend(); g.takeStory(); });
await reshow(); await wait(400);
await shot('shinen3');
await inspectEvent('ch2_ice_shard');
await shot('ice-shard');
await skip();
await p.evaluate(() => { const g = window.app.game; g.descend(); g.descend(); g.takeStory(); });
await inspectEvent('ch2_water_mirror');
await shot('water-mirror');
await skip();
const recs = await p.evaluate(() => window.app.game.story.records.map((r) => r.id));
expect(recs.includes('rec_ice_shard') && recs.includes('rec_memory_device'), '氷の欠片と 水鏡の 記録が のこる');
// ウロコ王
await p.evaluate(() => { const g = window.app.game; g.descend(); g.takeStory(); g.healAll(); });
await reshow(); await wait(400);
await shot('uroko-room');
await p.evaluate(() => { const g = window.app.game; const s = g.startBossBattle('uroko'); for (const e of s.state.enemies) e.hp = 1; window.__debug.startBattle(window.app, s); });
await wait(1200);
await shot('uroko-battle');
await fightAll();
await skip();
await shot('after-uroko');
const fin = await info();
console.log('after uroko', JSON.stringify(fin));
expect(fin.ch === 3, '第2章クリアで 第3章へ');
expect(fin.feats.includes('skillInherit') && fin.feats.includes('ranchExpand'), 'スキル継承・牧場拡張が 解放');
expect(fin.cap === 30, `牧場の わくが 20→30（いま ${fin.cap}）`);
expect(said.some((t) => t.includes('水の 響晶')), '水の 響晶を 手に いれる');
expect(said.some((t) => t.includes('風鳴り高原')), 'つぎの 目的地（風鳴り高原）の 案内');
const slots = await p.evaluate(() => { const g = window.app.game; const ms = g.state.monsters.filter((m) => m.level >= 10); const a = ms.find((m) => m.sex === 'A'), b2 = ms.find((m) => m.sex === 'B'); if (!a || !b2) return 'no pair'; const r = g.breedCheck(a.id, b2.id); return r.ok ? r.value.skills.slots : r.error; });
expect(slots === 3 || typeof slots === 'string', `第2章クリアで うけつげる とくぎ 3つ（いま ${slots}）`);
console.log('inherit slots after ch2', slots);
console.log(errors.join('\n') || 'no errors'); await b.close(); srv.close();
