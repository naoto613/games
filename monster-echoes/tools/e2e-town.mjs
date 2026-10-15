// 町の 見た目の 撮影（参考画像3「町の画面」と くらべる）  node tools/e2e-town.mjs <出力dir>
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
const errors = [];
for (const [vw, vh, tag] of (process.argv[3] === 'p' ? [[390, 844, 'p']] : [[390, 844, 'p'], [844, 390, 'l']])) {
  const p = await b.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  p.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await p.goto(`http://localhost:${srv.address().port}/index.html`);
  await p.evaluate(() => localStorage.setItem('me-settings', JSON.stringify({ textSpeed: 'fast', battleSpeed: 'instant', reduceMotion: true, sound: false, largeText: false })));
  await p.reload();
  await p.waitForTimeout(600);
  await p.locator('button', { hasText: 'はじめから' }).first().click(); await p.waitForTimeout(150);
  await p.locator('button', { hasText: 'けってい' }).first().click(); await p.waitForTimeout(300);
  const wait = (ms) => p.waitForTimeout(ms);
  const skip = async (max = 80) => { await wait(350); for (let i = 0; i < max; i++) { const nm = p.locator('.panel-foot button', { hasText: 'けってい' }); if (await nm.count() && await p.$('input.name')) { await nm.last().click(); await wait(150); continue; } const has = await p.$('.msgbox:not(:has(+ .choices))'); const ch = await p.$('.choices'); if (ch) { const later = p.locator('.choices .item', { hasText: 'あとで' }); if (await later.count()) { await later.click(); await wait(100); continue; } return 'choice'; } if (!has) { await wait(120); if (!(await p.$('.msgbox'))) return; continue; } await has.click(); await wait(60); } };
  await skip();
  const reshow = () => p.evaluate(() => { window.__Field ??= window.app.screen.constructor; window.app.show(new window.__Field(window.app)); });
  for (const [town, x, y] of [['liefel', 13, 13], ['mizuna', 13, 14], ['mizuna', 8, 6], ['mizuna', 18, 12]]) {
    await p.evaluate(([t, x, y]) => { const g = window.app.game; for (const id of ['1-1', '1-2', '1-3']) g.clearStage(id); g.takeStory(); g.state.player.townMap = t; g.setTownPos({ x, y }, 'down'); }, [town, x, y]);
    await reshow(); await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(out, `town-${tag}-${town}-${x}-${y}.png`) });
  }
  // 会話の 名前ふだ と どうぐの 絵
  await p.evaluate(() => { void window.app.say('……よくぞ ここまで たどりついた。\nだが おまえたちだけでは この世界は すくえない。', { speaker: 'ノクティル' }); });
  await p.waitForTimeout(600);
  await p.screenshot({ path: path.join(out, `talk-${tag}.png`) });
  await p.locator('.msgbox').click(); await p.waitForTimeout(300);
  // ステータス画面（つよさ・スキル・とくせい）
  await p.evaluate(() => { const g = window.app.game; g.acceptRecruit('m041', 12); g.state.monsters.forEach((m) => { m.level = Math.max(m.level, 12); }); });
  await reshow(); await p.waitForTimeout(300);
  await p.locator('.fmrow', { hasText: 'パーティ' }).click(); await p.waitForTimeout(300);
  await p.locator('.mcard').first().click(); await p.waitForTimeout(300);
  await p.locator('button', { hasText: 'くわしく' }).first().click(); await p.waitForTimeout(300);
  for (const t of ['つよさ', 'スキル', 'とくせい']) {
    await p.locator('.stab', { hasText: t }).click(); await p.waitForTimeout(250);
    await p.screenshot({ path: path.join(out, `status-${tag}-${t}.png`) });
  }
  await p.evaluate(() => window.app.closeAllPanels()); await p.waitForTimeout(200);
  // ダンジョン（森 1F・3F・ボスの へや）
  for (const [fl, nm] of [[0, 'f1'], [2, 'f3'], [4, 'boss']]) {
    await p.evaluate((fl) => { const g = window.app.game; g.leaveExpedition?.(); g.startExpedition('sasayaki'); for (let i = 0; i < fl; i++) g.descend(); g.takeStory(); }, fl);
    await reshow(); await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(out, `dun-${tag}-${nm}.png`) });
  }
  await p.close();
}
console.log(errors.join('\n') || 'ok');
await b.close(); srv.close();
