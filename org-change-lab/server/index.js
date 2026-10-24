// Org Change Lab のローカルサーバー：静的ファイルの配信と AI 接続（/api）
// 起動：ANTHROPIC_API_KEY=... node server/index.js  → http://localhost:8787/
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { health, validateRequest, runAi, HttpError, MAX_INPUT_BYTES } from './routes/ai.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.md': 'text/markdown; charset=utf-8',
};
// 配信しないパス（サーバーのコードや依存パッケージ）
const BLOCKED = [/^\/server\//, /^\/node_modules\//, /\/\./];

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_INPUT_BYTES + 1024) throw new HttpError(413, `入力が大きすぎます（上限 ${Math.round(MAX_INPUT_BYTES / 1024)} KB）`, 'invalid');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return { body: JSON.parse(raw), size };
  } catch {
    throw new HttpError(400, 'JSON として読み取れません', 'invalid');
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, 'http://localhost');
  let p = decodeURIComponent(url.pathname);
  if (BLOCKED.some((re) => re.test(p))) { res.writeHead(404); res.end('Not found'); return; }
  if (p.endsWith('/')) p += 'index.html';
  const file = path.resolve(ROOT, `.${p}`);
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
  try {
    const s = await stat(file);
    if (!s.isFile()) throw new Error('not a file');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/health') && req.method === 'GET') return sendJson(res, 200, health());
    if (req.url.startsWith('/api/ai')) {
      if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'POST のみ受け付けます' });
      const { body, size } = await readBody(req);
      const request = validateRequest(body, size);
      const started = Date.now();
      const out = await runAi(request);
      console.log(`[ai] ${request.agent} ${out.model} ${Date.now() - started}ms`);
      return sendJson(res, 200, { ok: true, ...out });
    }
    if (req.url.startsWith('/api/')) return sendJson(res, 404, { ok: false, error: '不明なAPIです' });
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return undefined; }
    return serveStatic(req, res);
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    if (status >= 500) console.error('[error]', e.message);
    return sendJson(res, status, { ok: false, error: e instanceof HttpError ? e.message : 'サーバーでエラーが発生しました', kind: e.kind || 'error', details: e.details || [] });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Org Change Lab: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/`);
  console.log(process.env.ANTHROPIC_API_KEY ? 'AI接続：有効（ANTHROPIC_API_KEY を検出）' : 'AI接続：無効（ANTHROPIC_API_KEY 未設定。画面とデータ管理はそのまま使えます）');
});
