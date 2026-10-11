// ギャラリーを 撮影: node tools/v2/gallery.mjs <出力dir>
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const out = process.argv[2] || '/tmp/gallery';
fs.mkdirSync(out, { recursive: true });
execSync(`npx esbuild tools/v2/gallery.ts --bundle --outfile=tools/v2/_gallery.js --format=iife --loader:.css=text`, { cwd: root, stdio: 'ignore' });
fs.writeFileSync(path.join(root, 'tools/v2/_gallery.html'), '<!doctype html><meta charset=utf-8><body><script src="_gallery.js"></script>');
const types = { '.js': 'text/javascript', '.png': 'image/png', '.json': 'application/json', '.html': 'text/html' };
const srv = http.createServer((q, s) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'content-type': types[path.extname(f)] ?? 'application/octet-stream' }); s.end(d); });
}).listen(0);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errors = [];
for (const [name, q, w] of [['grid', 'mode=grid', 1400], ['motion', 'mode=motion&ids=m001,m021,m165,m115,m200', 760]]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(`http://localhost:${srv.address().port}/tools/v2/_gallery.html?${q}`);
  await p.waitForFunction(() => window.ready, null, { timeout: 15000 });
  await p.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
  await p.close();
}
console.log(errors.join('\n') || 'no errors');
await b.close(); srv.close();
fs.rmSync(path.join(root, 'tools/v2/_gallery.js')); fs.rmSync(path.join(root, 'tools/v2/_gallery.html'));
