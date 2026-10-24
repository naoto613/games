import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryDb } from '../src/repositories/db.js';
import { Repository } from '../src/repositories/repository.js';
import { InitiativeService } from '../src/services/initiativeService.js';
import { buildExport, validateImport, applyImport, findConflicts, toMarkdown, parseMetricCsv, parseCsv } from '../src/services/exportService.js';
import { loadSampleData } from '../src/services/sampleData.js';
import { CHILD_STORES } from '../src/constants.js';

async function setup() {
  const repo = new Repository(createMemoryDb());
  return { repo, svc: new InitiativeService(repo) };
}

test('課題登録から学習記録まで、一つの案件で記録できる', async () => {
  const { repo, svc } = await setup();
  let i = await svc.create({ title: 'CRMチームの自律性向上', problemStatement: '提案が少ない', scope: 'CRM', desiredState: '提案が出る', businessContext: 'CRM' });
  const o = await svc.saveChild('observations', { initiativeId: i.id, content: '成功指標が着手後に決まった' });
  const h1 = await svc.saveChild('hypotheses', { initiativeId: i.id, title: '指標定義が遅い', supportingObservationIds: [o.id] });
  await svc.saveChild('hypotheses', { initiativeId: i.id, title: '情報不足' });
  const iv = await svc.saveChild('interventions', { initiativeId: i.id, title: '指標定義の標準化', expectedBehaviorChange: '着手前に定義', targetHypothesisIds: [h1.id], risks: ['負担'], verificationPlan: '2施策で試す' });
  let bundle = await repo.loadBundle(i.id);
  await svc.decideIntervention(bundle, iv, 'adopted', '小さく試せる');
  const plan = await svc.saveChild('experimentPlans', { initiativeId: i.id, interventionId: iv.id, title: '試行', owner: 'EM', successCriteria: ['定義率が上がる'] });
  const m = await svc.saveChild('metricDefinitions', { initiativeId: i.id, planId: plan.id, name: '定義率', measurementMethod: '数える', level: 2 });
  await svc.saveChild('metricObservations', { initiativeId: i.id, metricId: m.id, phase: 'before', value: 20 });
  i = await svc.changeStatus(i, 'running', '準備完了');
  assert.ok(i.successDefinitionLockedAt, '実行開始で成功条件が固定される');
  i = await svc.update(i, { successDefinition: { ...i.successDefinition, measurement: '別の指標' } }, '測定できなかったため');
  await svc.saveChild('metricObservations', { initiativeId: i.id, metricId: m.id, phase: 'after', note: '定性的に改善を確認' });
  await svc.saveChild('learningRecords', { initiativeId: i.id, title: '学び', summary: '要約', pattern: 'failure' });
  bundle = await repo.loadBundle(i.id);
  assert.equal(bundle.interventions[0].status, 'adopted');
  const types = bundle.decisionRecords.map((d) => d.type).sort();
  assert.deepEqual(types, ['intervention_decision', 'status_change', 'success_definition_change']);
  assert.ok(bundle.decisionRecords.find((d) => d.type === 'success_definition_change').reason.includes('測定できなかった'));
  assert.equal(bundle.learningRecords.length, 1);

  const md = toMarkdown(bundle);
  for (let n = 1; n <= 13; n += 1) assert.ok(md.includes(`## ${n}. `), `見出し ${n}`);
  assert.ok(md.includes('未評価'));
  assert.ok(md.includes('[事実]') && md.includes('[仮説]'));
});

test('JSONエクスポートから元の案件を復元できる', async () => {
  const { repo } = await setup();
  await loadSampleData(repo);
  const ids = (await repo.listInitiatives()).map((i) => i.id);
  const bundles = await Promise.all(ids.map((id) => repo.loadBundle(id)));
  const json = JSON.parse(JSON.stringify(buildExport(bundles)));
  const v = validateImport(json);
  assert.ok(v.ok, JSON.stringify(v.errors));

  const fresh = new Repository(createMemoryDb());
  assert.deepEqual(await findConflicts(fresh, v.data), []);
  const r = await applyImport(fresh, v.data);
  assert.equal(r.added, 3);
  for (const id of ids) {
    const a = await repo.loadBundle(id);
    const b = await fresh.loadBundle(id);
    assert.equal(b.initiative.title, a.initiative.title);
    for (const s of CHILD_STORES) assert.equal(b[s].length, a[s].length, s);
    assert.deepEqual(b.hypotheses.map((h) => h.supportingObservationIds), a.hypotheses.map((h) => h.supportingObservationIds));
  }
});

test('同じIDの案件：上書き・別案件として追加・スキップを選べる', async () => {
  const { repo, svc } = await setup();
  const i = await svc.create({ title: '元', problemStatement: 'p', scope: 'CRM', desiredState: 'd', businessContext: 'b' });
  await svc.saveChild('observations', { initiativeId: i.id, content: 'x' });
  const json = buildExport([await repo.loadBundle(i.id)]);
  json.data.initiatives[0].title = 'ファイル側';
  const v = validateImport(json);
  assert.equal((await findConflicts(repo, v.data)).length, 1);
  assert.deepEqual(await applyImport(repo, v.data, {}), { added: 0, overwritten: 0, skipped: 1 });
  await applyImport(repo, v.data, { [i.id]: 'add_new' });
  let list = await repo.listInitiatives();
  assert.equal(list.length, 2);
  const copy = list.find((x) => x.id !== i.id);
  assert.equal((await repo.loadBundle(copy.id)).observations.length, 1);
  await applyImport(repo, v.data, { [i.id]: 'overwrite' });
  assert.equal((await repo.get('initiatives', i.id)).title, 'ファイル側');
  list = await repo.listInitiatives();
  assert.equal(list.length, 2);
});

test('不正なJSONは読み込まず、エラー箇所を示す', () => {
  assert.equal(validateImport([]).ok, false);
  const r = validateImport({ format: 'org-change-lab', schemaVersion: 1, data: {
    initiatives: [{ id: 'i1', title: 'a', problemStatement: 'p', scope: ['x'], desiredState: 'd', businessContext: 'b', startDate: '2026-01-01' }],
    hypotheses: [{ id: 'h1', initiativeId: 'i1', title: 123 }, { id: 'h2', initiativeId: 'missing', title: 'x' }, { id: 'h2', initiativeId: 'i1', title: 'y' }],
  } });
  assert.equal(r.ok, false);
  const paths = r.errors.map((e) => e.path);
  assert.ok(paths.includes('data.hypotheses[0].title'));
  assert.ok(paths.includes('data.hypotheses[2].id'));
  assert.ok(paths.some((p) => p.startsWith('data.hypotheses[1]') && p.endsWith('initiativeId')));
  assert.equal(validateImport({ format: 'org-change-lab', schemaVersion: 99, data: { initiatives: [] } }).ok, false);
});

test('案件の複製は参照を新しいIDに付け替える', async () => {
  const { repo, svc } = await setup();
  await loadSampleData(repo);
  const src = (await repo.listInitiatives()).find((i) => i.title.includes('CRMチーム'));
  const bundle = await repo.loadBundle(src.id);
  const newId = await svc.duplicate(bundle);
  const copy = await repo.loadBundle(newId);
  assert.ok(copy.initiative.title.endsWith('（複製）'));
  const obsIds = new Set(copy.observations.map((o) => o.id));
  for (const h of copy.hypotheses) for (const id of h.supportingObservationIds) assert.ok(obsIds.has(id));
  const metricIds = new Set(copy.metricDefinitions.map((m) => m.id));
  for (const o of copy.metricObservations) assert.ok(metricIds.has(o.metricId));
});

test('指標CSVを取り込み、不正な行はエラーにする', () => {
  assert.deepEqual(parseCsv('a,"b,c"\n"d""e",f\n'), [['a', 'b,c'], ['d"e', 'f']]);
  const metrics = [{ id: 'm1', name: '定義率' }];
  const csv = 'metric,phase,observedAt,value,note\n定義率,実施前,2026-01-01,20,\n定義率,after,2026-02-01,,改善を確認\n不明,after,,1,\n定義率,after,,abc,\n';
  const r = parseMetricCsv(csv, metrics, 'i1');
  assert.equal(r.records.length, 2);
  assert.equal(r.records[0].value, 20);
  assert.equal(r.records[1].value, null);
  assert.deepEqual(r.errors.map((e) => e.line), [4, 5]);
});
