// 単体ステージファイルの検証: node tools/validate-file.mjs js/content/s2.js [--quick]
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { normalizeStage } from '../js/engine/content.js';
import { validateStage, solveFor } from '../js/engine/validator.js';

const file = process.argv[2];
const quick = process.argv.includes('--quick');
const raw = (await import(pathToFileURL(path.resolve(file)).href)).default;
const st = normalizeStage(raw);
const { errors, warns } = validateStage(st);
const cats = {};
for (const e of st.events) cats[e.category] = (cats[e.category] || 0) + 1;
console.log(`== ${st.id} ${st.title} events=${st.events.length} ${JSON.stringify(cats)}`);
errors.forEach(e => console.log('  [ERROR] ' + e));
warns.forEach(w => console.log('  [WARN]  ' + w));
let bad = errors.length > 0;
if (!bad && !quick) {
  for (const ev of st.events) {
    const r = solveFor(st, ev.id, { allowTerminal: ev.category === 'TERMINAL', maxNodes: 3000 });
    if (!r.ok) { console.log(`  [${ev.id === st.clearEventId ? 'ERROR' : 'WARN'}]  ${ev.id} 到達不能 (${r.reason})`); if (ev.id === st.clearEventId) bad = true; }
  }
  const c = solveFor(st, st.clearEventId, { allowTerminal: true, maxNodes: 6000 });
  console.log(`  終端 ${st.clearEventId}: ${c.ok ? 'OK ' + c.path.length + '手: ' + c.path.map(p => p.join('→')).join(', ') : 'NG'}`);
}
process.exit(bad ? 1 : 0);
