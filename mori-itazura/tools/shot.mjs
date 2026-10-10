// 実ブラウザでの確認用：ローカルで index.html を開いてスクリーンショットを撮る
// node tools/shot.mjs <出力dir> [幅] [高さ] [スクリプト(js式)...]
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = process.argv[2] || '.';
const W = +(process.argv[3] || 390), H = +(process.argv[4] || 844);
const steps = process.argv.slice(5);
const srv = http.createServer((q, s) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); s.end(d); });
}).listen(0);
const port = srv.address().port;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--autoplay-policy=no-user-gesture-required', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
const logs = [];
p.on('console', (m) => logs.push(m.type() + ': ' + m.text()));
p.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
await p.goto(`http://localhost:${port}/index.html`);
await p.waitForFunction(() => window.game?.ui.get().screen !== 'loading', null, { timeout: 120000 }).catch(() => logs.push('timeout loading'));
let i = 0;
for (const s of steps) {
  if (s.startsWith('wait:')) { await p.waitForTimeout(+s.slice(5)); continue; }
  if (s === 'shot') { await p.screenshot({ path: path.join(out, `s${i++}.png`) }); continue; }
  try { const r = await p.evaluate(s); if (r !== undefined) logs.push('eval: ' + JSON.stringify(r)); } catch (e) { logs.push('EVALERR: ' + e.message); }
}
await p.screenshot({ path: path.join(out, `s${i++}.png`) });
console.log(logs.slice(0, 60).join('\n'));
await b.close(); srv.close();
