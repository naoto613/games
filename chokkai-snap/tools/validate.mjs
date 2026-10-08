// Content Validator + Reachability（47/60/101 章）。CI・手元で: node tools/validate.mjs [S1 ...]
// エラーがあれば終了コード 1。
import { RAW_STAGES, STAGE_ORDER } from '../js/content/index.js';
import { TUTORIAL } from '../js/content/tutorial.js';
import { normalizeStage } from '../js/engine/content.js';
import { validateStage, solveFor } from '../js/engine/validator.js';

const only = process.argv.slice(2).filter(a => !a.startsWith('-'));
const quick = process.argv.includes('--quick');
let failed = false;
const stages = [...STAGE_ORDER.map(id => RAW_STAGES[id]), TUTORIAL];
for (const raw of stages) {
  if (only.length && !only.includes(raw.id)) continue;
  const st = normalizeStage(raw);
  const { errors, warns } = validateStage(st);
  const cats = {};
  for (const e of st.events) cats[e.category] = (cats[e.category] || 0) + 1;
  console.log(`\n== ${st.id} ${st.title}  events=${st.events.length}  ${JSON.stringify(cats)}`);
  errors.forEach(e => console.log('  [ERROR] ' + e));
  warns.forEach(w => console.log('  [WARN]  ' + w));
  if (errors.length) { failed = true; continue; }
  if (quick) continue;
  let unreachable = 0;
  for (const ev of st.events) {
    const r = solveFor(st, ev.id, { allowTerminal: ev.category === 'TERMINAL', maxNodes: 3000 });
    if (!r.ok) {
      unreachable++;
      const sev = ev.id === st.clearEventId ? 'ERROR' : 'WARN';
      if (sev === 'ERROR') failed = true;
      console.log(`  [${sev}]  ${ev.id} は到達できない (${r.reason}, nodes=${r.nodes})`);
    }
  }
  const clear = solveFor(st, st.clearEventId, { allowTerminal: true, maxNodes: 6000 });
  console.log(`  終端 ${st.clearEventId}: ${clear.ok ? '到達可能（最短の一例 ' + clear.path.length + ' 手）' : '到達不能'}  到達不能イベント=${unreachable}`);
}
if (failed) { console.log('\nNG'); process.exit(1); }
console.log('\nOK');
