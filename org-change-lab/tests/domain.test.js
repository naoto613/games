import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitiative, validateInitiative, suggestNextActions, displayNextAction, successDefinitionGaps } from '../src/domain/initiative.js';
import { normalizeHypothesis, validateHypothesis, evidenceState } from '../src/domain/hypothesis.js';
import { normalizeIntervention, decideIntervention, interventionGaps, axisScore } from '../src/domain/intervention.js';
import { normalizeMetric, normalizeMetricObservation, compareMetric, outcomeLevelSummary } from '../src/domain/experiment.js';
import { normalizeLearning, validateLearning } from '../src/domain/learning.js';

const base = { title: 'CRM', problemStatement: '提案が少ない', scope: 'CRM、マーケ', desiredState: '提案が出る', businessContext: 'CRM価値' };

test('案件の必須項目を検証する', () => {
  assert.deepEqual(Object.keys(validateInitiative(createInitiative({ ...base }))), []);
  const errs = validateInitiative(createInitiative({ title: '' }));
  assert.ok(errs.title && errs.problemStatement && errs.scope && errs.desiredState && errs.businessContext);
});

test('対象範囲は区切り文字で配列になる', () => {
  assert.deepEqual(createInitiative({ ...base }).scope, ['CRM', 'マーケ']);
});

test('次の行動：ユーザー設定を優先し、なければ候補を「提案」として返す', () => {
  const i = createInitiative({ ...base });
  const b = { initiative: i, observations: [], hypotheses: [] };
  const d = displayNextAction(b);
  assert.equal(d.source, 'suggested');
  assert.equal(i.nextAction, null, '候補は自動保存しない');
  assert.ok(suggestNextActions(b).some((s) => s.text.includes('観測した事実')));
  const i2 = createInitiative({ ...base, nextAction: '過去の企画を確認' });
  assert.deepEqual(displayNextAction({ initiative: i2 }), { text: '過去の企画を確認', source: 'user' });
});

test('実行準備中は成功条件の未定義を指摘する', () => {
  const i = createInitiative({ ...base, status: 'preparation' });
  assert.equal(successDefinitionGaps(i).length, 8);
  const s = suggestNextActions({ initiative: i, experimentPlans: [], metricDefinitions: [], metricObservations: [] });
  assert.ok(s.some((x) => x.text.includes('成功条件')));
});

test('仮説を支持／不支持と判断するには理由が必要', () => {
  const h = normalizeHypothesis({ initiativeId: 'i', title: 'A', status: 'supported' });
  assert.ok(validateHypothesis(h).assessmentReason);
  const ok = normalizeHypothesis({ initiativeId: 'i', title: 'A', status: 'supported', assessmentReason: '記録で確認' });
  assert.deepEqual(validateHypothesis(ok), {});
  assert.equal(evidenceState(ok).level, 'none');
  assert.equal(evidenceState({ ...ok, supportingObservationIds: ['o1'] }).level, 'linked');
});

test('介入案の判断は意思決定記録と、採用しなかった案を残す', () => {
  const a = normalizeIntervention({ initiativeId: 'i', title: 'A', expectedBehaviorChange: 'x' });
  const b = normalizeIntervention({ initiativeId: 'i', title: 'B', expectedBehaviorChange: 'y', status: 'rejected', decisionReason: '根拠が弱い' });
  const { intervention, decision } = decideIntervention(a, 'adopted', '小さく試せる', [a, b]);
  assert.equal(intervention.status, 'adopted');
  assert.equal(decision.type, 'intervention_decision');
  assert.equal(decision.reason, '小さく試せる');
  assert.ok(decision.alternatives[0].includes('根拠が弱い'));
  assert.deepEqual(interventionGaps(a), ['対象仮説', '想定リスク', '検証方法', '中止条件']);
});

test('評価軸：不明は末尾、コストとリスクは低いほど高評価', () => {
  const iv = normalizeIntervention({ title: 'A', ratings: { cost: 'low', risk: 'high', effect: 'unknown' } });
  assert.equal(axisScore(iv, 'cost'), 3);
  assert.equal(axisScore(iv, 'risk'), 1);
  assert.equal(axisScore(iv, 'effect'), -1);
});

test('指標比較：値がなければ差分を計算しない（推測で補完しない）', () => {
  const m = normalizeMetric({ initiativeId: 'i', name: 'x', measurementMethod: 'y', baselineValue: '' });
  assert.equal(m.baselineValue, null);
  const none = compareMetric(m, []);
  assert.equal(none.before, null);
  assert.equal(none.diff, null);
  const obs = [
    normalizeMetricObservation({ metricId: m.id, phase: 'before', value: '10', observedAt: '2026-01-01' }),
    normalizeMetricObservation({ metricId: m.id, phase: 'after', value: '15', observedAt: '2026-02-01' }),
  ];
  const c = compareMetric(m, obs);
  assert.equal(c.before, 10);
  assert.equal(c.after, 15);
  assert.equal(c.diff, 5);
  const lv = outcomeLevelSummary([m], obs);
  assert.equal(lv.find((l) => l.value === 2).recorded, 1);
});

test('結果未確認の学びを成功パターンにできない', () => {
  const l = normalizeLearning({ title: 't', summary: 's', pattern: 'success', resultCertainty: 'unknown' });
  assert.ok(validateLearning(l).pattern);
  const failure = normalizeLearning({ title: 't', summary: 's', pattern: 'failure', resultCertainty: 'unknown' });
  assert.deepEqual(validateLearning(failure), {});
});
