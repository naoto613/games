// 実ブラウザでの確認用: node tools/shot.mjs <html> <出力png> [幅] [高さ] [js...]
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [page = 'index.html', out = 'shot.png', W = 390, H = 844, ...steps] = process.argv.slice(2);
const srv = http.createServer((q, s) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.png') ? 'image/png' : 'text/html' }); s.end(d); });
}).listen(0);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
const logs = [];
p.on('console', (m) => logs.push(m.type() + ': ' + m.text()));
p.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
await p.goto(`http://localhost:${srv.address().port}/${page}`);
await p.waitForTimeout(800);
let i = 0;
for (const s of steps) {
  if (s.startsWith('wait:')) { await p.waitForTimeout(+s.slice(5)); continue; }
  if (s === 'shot') { await p.screenshot({ path: out.replace('.png', `-${i++}.png`) }); continue; }
  try { const r = await p.evaluate(s); if (r !== undefined) logs.push('eval: ' + JSON.stringify(r)); } catch (e) { logs.push('EVALERR: ' + e.message); }
}
await p.screenshot({ path: out });
console.log(logs.slice(0, 60).join('\n'));
await b.close(); srv.close();
