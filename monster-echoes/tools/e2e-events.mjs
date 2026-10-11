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
// 固有イベントを 実際に しらべて 撮影: node tools/e2e-events.mjs <出力dir>
await p.reload(); const wait = (ms) => p.waitForTimeout(ms);
await p.locator('button', { hasText: 'はじめから' }).click(); await wait(200);
await p.locator('button', { hasText: 'けってい' }).click();
for (let i = 0; i < 40; i++) { const nm = p.locator('.panel-foot button', { hasText: 'けってい' }); if (await nm.count() && await p.$('input.name')) { await nm.last().click(); await wait(150); continue; } const later = p.locator('.choices .item', { hasText: 'あとで' }); if (await later.count()) await later.click(); const m = await p.$('.msgbox:not(:has(+ .choices))'); if (m && !(await p.$('.choices'))) await m.click(); await wait(80); if (await p.$('.fmenu') && !(await p.$('.msgbox'))) break; }
const pages = async (name) => { let n = 0; for (let i = 0; i < 12; i++) { if (!(await p.$('.msgbox'))) break; if (n++ === 1) await p.screenshot({ path: path.join(out, name + '.png') }); await p.locator('.tap-catcher').click({ force: true }).catch(() => {}); await wait(120); } };
// 指定の フロアで イベントの となりまで ワープして しらべる
const visit = async (floor, kind, name) => {
  const info = await p.evaluate(([fl, kind]) => {
    const g = window.app.game;
    g.state.progress.unlockedAreas.push('forest');
    if (!g.state.expedition) g.startExpedition('forest');
    while (g.state.expedition.floorIndex < fl) g.descend();
    const map = g.currentMap();
    const evs = Object.entries(map.events || {});
    const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    for (const [pos, id] of evs) {
      const [x, y] = pos.split(',').map(Number);
      if (!id.includes(kind)) continue;
      for (const [d, [dx, dy]] of Object.entries(D)) {
        const nx = x - dx, ny = y - dy, t = map.tiles[ny]?.[nx];
        if (t && '.,S'.includes(t)) { g.state.expedition.pos = { x: nx, y: ny }; g.state.expedition.dir = d; window.app.show(new (window.app.screen.constructor)(window.app)); return { id, d, x: nx, y: ny }; }
      }
    }
    return null;
  }, [floor, kind]);
  if (!info) { console.log('NOT FOUND', kind); return; }
  await wait(400);
  await p.screenshot({ path: path.join(out, name + '-field.png') });
  await p.evaluate((d) => { window.app.game.state.expedition.stepsSinceBattle = -999; window.app.dispatch(d, true); }, info.d);
  await wait(300); await p.evaluate((d) => window.app.screen.key(d, false), info.d);
  await wait(300);
  await pages(name);
  console.log(name, info.id);
};
await visit(0, 'blight', 'ev-blight');
await visit(0, 'trail1', 'ev-trail1');
await visit(1, 'trail2', 'ev-trail2');
// かくし とびら → ひらく → ほうもつこ
await visit(1, 'hidden', 'ev-hidden');
await p.evaluate(() => { const g = window.app.game; const map = g.currentMap(); for (const [pos, id] of Object.entries(map.events)) if (id === 'forest_vault') { const [x, y] = pos.split(',').map(Number); g.state.expedition.pos = { x, y: y + 1 }; g.state.expedition.dir = 'up'; window.app.show(new (window.app.screen.constructor)(window.app)); } });
await wait(400); await p.screenshot({ path: path.join(out, 'ev-opened.png') });
await p.evaluate(() => window.app.dispatch('up', true)); await wait(300); await p.evaluate(() => window.app.screen.key('up', false)); await wait(300);
await pages('ev-vault');
// すみか（せんとう）
await visit(2, 'nest', 'ev-nest');
await wait(800);
await p.screenshot({ path: path.join(out, 'ev-nest-battle.png') });
console.log(errors.join('\n') || 'no errors'); await b.close(); srv.close();
