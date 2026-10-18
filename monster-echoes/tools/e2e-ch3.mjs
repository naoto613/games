// 第3章の 通し確認（ミズナの 北の道 → カゼノ → 研究所・そうび → 風渡りの峡谷 → 風見の番人 → 信頼 → 逆風の塔 → 分身 → グリフォン → 扉間移動）
// node tools/e2e-ch3.mjs <出力dir>
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
const skip = async (max = 80, pick = 'やめる') => { await wait(350); for (let i = 0; i < max; i++) { const nm = p.locator('.panel-foot button', { hasText: 'けってい' }); if (await nm.count() && await p.$('input.name')) { await nm.last().click(); await wait(150); continue; } const has = await p.$('.msgbox:not(:has(+ .choices))'); const ch = await p.$('.choices'); if (ch) { const later = p.locator('.choices .item', { hasText: 'あとで' }); if (await later.count()) { await later.click(); await wait(100); continue; } const no = p.locator('.choices .item', { hasText: pick }); if (await no.count()) { await no.first().click(); await wait(100); continue; } return 'choice'; } if (!has) { await wait(200); if (!(await p.$('.msgbox'))) { await wait(300); if (!(await p.$('.msgbox'))) return; } continue; } said.push(await has.innerText()); await has.click(); await wait(60); } };
const click = async (text) => { const el = p.locator('button', { hasText: text }).first(); await el.click(); await wait(150); };
const press = async (k) => { await p.evaluate((k) => window.app.screen.key(k, true), k); await wait(250); };
const reshow = () => p.evaluate(() => { window.__Field ??= window.app.screen.constructor; window.app.show(new window.__Field(window.app)); });
const info = async () => p.evaluate(() => { const g = window.app.game; return { town: g.state.player.townMap, ex: g.state.expedition && { a: g.state.expedition.areaId, f: g.state.expedition.floorIndex }, ch: g.chapters.chapter, cleared: g.chapters.clearedStages.filter((s) => s.startsWith('3')), feats: g.chapters.features.filter((f) => ['doorWarp', 'familyDex', 'resistView', 'equipment'].includes(f)), gold: g.state.player.gold }; });
const fightAll = async () => { for (let i = 0; i < 40; i++) { const bt = p.locator('.cmds button:not([disabled])', { hasText: 'たたかう' }); if (await bt.count()) { await bt.first().click(); await wait(400); } await skip(30); if (await p.$('.fbtns') && !(await p.$('.msgbox')) && !(await p.$('.battle'))) break; } await skip(); };
const talkAt = async (map, x, y, dir) => { await p.evaluate(([map, x, y, dir]) => { const g = window.app.game; g.state.player.townMap = map; g.setTownPos({ x, y }, dir); }, [map, x, y, dir]); await reshow(); await wait(300); await press('a'); await wait(300); };
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
// 第2章クリアずみ・ミズナから（第1・2章は e2e-ch1・e2e-ch2 で 確認）
await p.evaluate(() => { const g = window.app.game; for (const id of ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3']) g.clearStage(id); g.acceptRecruit('m105', 22); g.acceptRecruit('m028', 22); for (const m of g.state.monsters) m.level = Math.max(m.level, 22); g.state.player.gold = 2000; g.takeStory(); });
// ミズナの 北の 道（11,0）へ
await p.evaluate(() => { const g = window.app.game; g.state.player.townMap = 'mizuna'; g.setTownPos({ x: 11, y: 1 }, 'up'); });
await reshow(); await wait(300);
await p.evaluate(() => window.app.screen.key('up', true)); await wait(400); await p.evaluate(() => window.app.screen.key('up', false));
await wait(900);
await shot('kazeno-arrive');
await skip();
let st = await info();
console.log('kazeno', JSON.stringify(st));
expect(st.town === 'kazeno', 'ミズナの 北の 道から カゼノへ');
expect(['familyDex', 'resistView', 'equipment'].every((f) => st.feats.includes(f)), 'カゼノで 系統図鑑・耐性表示・そうびが ひらく');
expect(await p.evaluate(() => window.app.game.story.seen.includes('ch3_kazeno_arrive') && !!window.app.game.state.progress.storyFlags.ch3_distrust), '見はりの ゴウが 旅人を こばむ（到着の 物語）');
// 研究所の ホルン → かぜのおまもり
await talkAt('kazeno_lab', 5, 2, 'up');
await shot('hakase');
await skip();
const owned = await p.evaluate(() => window.app.game.state.v2.equipment.owned);
expect(owned.windcharm === 1, `かぜのおまもりを もらう（${JSON.stringify(owned)}）`);
// 行商人で そうびを かう
await talkAt('kazeno', 16, 13, 'right');
await wait(200);
const chs = await p.locator('.choices .item').allInnerTexts();
expect(chs.some((t) => t.includes('そうびを かう')), '行商人に「そうびを かう」が ある');
await p.locator('.choices .item', { hasText: 'そうびを かう' }).click(); await wait(400);
await shot('equip-shop');
await p.locator('.panel .item', { hasText: 'ちからのゆびわ' }).first().click(); await wait(300);
await skip(5, 'はい');
const yes = p.locator('.choices .item', { hasText: 'はい' }); if (await yes.count()) { await yes.first().click(); await wait(300); }
await p.evaluate(() => window.app.closeAllPanels()); await wait(300);
const owned2 = await p.evaluate(() => window.app.game.state.v2.equipment.owned);
expect(owned2.powerring === 1, `ちからのゆびわを かう（${JSON.stringify(owned2)}）`);
// ステータス画面から そうびする
await reshow(); await wait(300);
await p.locator('.fmrow', { hasText: 'パーティ' }).click(); await wait(300);
await p.locator('.mcard').first().click(); await wait(300);
await p.locator('button', { hasText: 'くわしく' }).first().click(); await wait(300);
await p.locator('.eqrow').click(); await wait(300);
await shot('equip-picker');
await p.locator('.panel .item', { hasText: 'ちからのゆびわ' }).first().click(); await wait(300);
await shot('equipped');
const eqd = await p.evaluate(() => { const g = window.app.game; return g.equipOf(g.party[0].id)?.id ?? null; });
expect(eqd === 'powerring', `ステータス画面から そうびできる（${eqd}）`);
await p.evaluate(() => window.app.closeAllPanels()); await wait(300);
// 図鑑：系統タブ
await reshow(); await wait(300);
await p.locator('.fmrow', { hasText: '図鑑' }).click(); await wait(300);
expect((await p.locator('.dtab').count()) >= 5, '図鑑に 系統の タブ');
await p.locator('.dtab').nth(4).click(); await wait(300);
await shot('dex-family');
await p.evaluate(() => window.app.closeAllPanels()); await wait(300);
// 高原入口 → 風渡りの峡谷
await p.evaluate(() => { const g = window.app.game; g.state.player.townMap = 'kazeno'; g.setTownPos({ x: 21, y: 1 }, 'up'); g.healAll(); });
await reshow(); await wait(300);
await press('a'); await wait(400);
await shot('gate');
await p.locator('.panel .item', { hasText: '風渡りの峡谷' }).first().click();
await wait(900);
await skip();
// 弱点の 表示（フェザーバット：雷）
await p.evaluate(() => { const g = window.app.game; const s = g.startWildBattle([{ speciesId: 'm081', level: 10 }]); window.__debug.startBattle(window.app, s); });
await wait(1200);
await shot('weakness');
expect((await p.locator('.erow .ew').count()) > 0, '戦闘で 敵の 弱点が 出る');
await p.evaluate(() => { const g = window.app.game; for (const e of g.battle.state.enemies) e.hp = 1; });
await fightAll();
// 3F 風の橋
await p.evaluate(() => { const g = window.app.game; g.descend(); g.descend(); g.takeStory(); });
await inspectEvent('ch3_wind_bridge');
await shot('wind-bridge');
await skip();
// 風見の番人
await p.evaluate(() => { const g = window.app.game; g.descend(); g.descend(); g.takeStory(); g.healAll(); });
await reshow(); await wait(400);
await shot('guard-room');
await p.evaluate(() => { const g = window.app.game; const s = g.startBossBattle('kazami_guard'); for (const e of s.state.enemies) e.hp = 1; window.__debug.startBattle(window.app, s); });
await wait(1200);
await fightAll();
st = await info();
console.log('after guard', JSON.stringify(st));
expect(st.cleared.includes('3-2'), '番人を たおすと 3-2 クリア');
// ゴウの 信頼 → 宿屋 むりょう
await p.evaluate(() => { const g = window.app.game; g.leaveExpedition?.(); });
await talkAt('kazeno', 13, 18, 'left');
await skip();
const trusted = await p.evaluate(() => !!window.app.game.state.progress.storyFlags.ch3_trusted);
expect(trusted, 'ゴウが こころを ひらく');
const g0 = (await info()).gold;
await talkAt('kazeno_inn', 4, 2, 'up');
await skip(10, 'とまる');
await skip();
expect((await info()).gold === g0, '宿屋が むりょう');
// 逆風の塔
await p.evaluate(() => { const g = window.app.game; g.healAll(); g.startExpedition('gyakufu'); g.takeStory(); g.descend(); g.descend(); g.takeStory(); });
await reshow(); await wait(300);
await inspectEvent('ch3_cloud_chest');
await shot('cloud-chest');
await skip();
await p.evaluate(() => { const g = window.app.game; g.descend(); g.descend(); g.takeStory(); });
await inspectEvent('ch3_wind_memory');
await shot('wind-memory');
await skip();
await p.evaluate(() => { const g = window.app.game; g.descend(); g.takeStory(); g.healAll(); });
await inspectEvent('ch3_griffon_clone');
await skip();
await wait(1200);
await shot('clone-battle');
await p.evaluate(() => { const g = window.app.game; if (g.battle) for (const e of g.battle.state.enemies) e.hp = 1; });
await fightAll();
await p.evaluate(() => { const g = window.app.game; g.descend(); g.takeStory(); g.healAll(); });
await reshow(); await wait(400);
await shot('griffon-room');
await p.evaluate(() => { const g = window.app.game; const s = g.startBossBattle('griffon'); for (const e of s.state.enemies) e.hp = 1; window.__debug.startBattle(window.app, s); });
await wait(1200);
await shot('griffon-battle');
await fightAll();
await skip();
st = await info();
console.log('after griffon', JSON.stringify(st));
expect(st.ch === 4, '第3章クリアで 第4章へ');
expect(st.feats.includes('doorWarp'), '第3章クリアで 扉間移動');
expect(said.some((t) => t.includes('風の響晶')), '風の響晶を 手に いれる');
expect(said.some((t) => t.includes('黒い 結晶')), '黒い結晶の 真相');
const recs = await p.evaluate(() => window.app.game.story.records.map((r) => r.id));
expect(['rec_black_light', 'rec_black_crystal', 'rec_crystal_sky'].every((r) => recs.includes(r)), '第3章の 記録が のこる');
// 扉間移動：カゼノの 旅の扉 → ミズナ
await p.evaluate(() => { const g = window.app.game; g.leaveExpedition?.(); });
await talkAt('kazeno_shrine', 5, 2, 'up');
await wait(300);
await shot('warp-list');
await p.locator('.panel .item', { hasText: '水辺の街ミズナ' }).first().click();
await wait(1000);
st = await info();
console.log('after warp', JSON.stringify(st));
expect(st.town === 'mizuna_shrine', `扉間移動で ミズナへ（${st.town}）`);
console.log(errors.join('\n') || 'no errors'); await b.close(); srv.close();
