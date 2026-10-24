import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractJson, validateSchema, validateAiResult, findUnsupportedNumbers } from '../src/ai/responseValidator.js';
import { SCHEMAS } from '../src/ai/schemas.js';
import { buildPrompt, buildManualPrompt, AGENTS } from '../src/ai/promptTemplates.js';
import { buildAgentInput, toInterventionDrafts, toLearningDraft, scanSensitive } from '../src/ai/agents.js';
import { createInitiative } from '../src/domain/initiative.js';
import { normalizeHypothesis, normalizeObservation } from '../src/domain/hypothesis.js';

const validStructure = {
  analysisType: 'root_cause_analysis', summary: '要約', problemRedefinition: '再定義', facts: ['事実'], interpretations: [],
  hypotheses: [{ title: '情報不足', description: 'd', lens: 'information', evidence: [], supportStatus: 'needs_verification', missingInformation: ['x'], alternativeExplanations: [], verificationMethod: 'm' }],
  structuralPerspectives: [{ lens: 'role', observation: 'o' }], unknowns: [], recommendedNextActions: ['確認する'], limitations: [],
};

test('コードフェンスや前置きのある応答から JSON を取り出す', () => {
  assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(extractJson('結果です：{"a":2} 以上'), { a: 2 });
  assert.throws(() => extractJson(''), /空/);
  assert.throws(() => extractJson('not json'), /JSON/);
});

test('スキーマ検証：必須項目・型・列挙値', () => {
  assert.ok(validateSchema(validStructure, SCHEMAS.structure).ok);
  const bad = structuredClone(validStructure);
  delete bad.summary;
  bad.hypotheses[0].lens = 'personality';
  bad.facts = 'x';
  const r = validateSchema(bad, SCHEMAS.structure);
  assert.equal(r.ok, false);
  assert.equal(r.errors.length, 3);
});

test('不正な応答は保存用の結果を返さない', () => {
  const r = validateAiResult('{"analysisType":"root_cause_analysis"}', SCHEMAS.structure, '');
  assert.equal(r.ok, false);
  assert.equal(r.result, undefined);
});

test('入力にない数値を警告する', () => {
  assert.deepEqual(findUnsupportedNumbers({ a: '提案数が30%増える見込み。2〜3案を比較' }, '入力'), ['30%']);
  assert.deepEqual(findUnsupportedNumbers({ a: '直近5施策のうち4施策' }, '直近5施策のうち4施策'), []);
  const r = validateAiResult({ ...validStructure, summary: '効果は45%' }, SCHEMAS.structure, '');
  assert.ok(r.ok);
  assert.ok(r.warnings.some((w) => w.includes('45%')));
});

test('全エージェントのプロンプトを組み立てられ、スキーマは構造化出力の要件を満たす', () => {
  const i = createInitiative({ title: 't', problemStatement: 'p', scope: 'CRM', desiredState: 'd', businessContext: 'b' });
  const bundle = { initiative: i, observations: [], hypotheses: [], interventions: [], experimentPlans: [], metricDefinitions: [], metricObservations: [], stakeholders: [] };
  const check = (s) => {
    if (s.type === 'object') {
      assert.equal(s.additionalProperties, false);
      assert.deepEqual([...s.required].sort(), Object.keys(s.properties).sort());
      Object.values(s.properties).forEach(check);
    }
    if (s.type === 'array') check(s.items);
  };
  for (const a of AGENTS) {
    const input = buildAgentInput(a, bundle);
    const p = buildPrompt(a, input);
    assert.ok(p.system.includes('入力にない数値や事実を生成してはならない'));
    assert.ok(buildManualPrompt(a, input).includes('JSON Schema'));
    check(SCHEMAS[a]);
  }
});

test('AIへの入力は内部IDを含まず、参照記号で仮説を指し、戻り値でIDに戻す', () => {
  const i = createInitiative({ title: 't', problemStatement: 'p', scope: 'CRM', desiredState: 'd', businessContext: 'b' });
  const o = normalizeObservation({ initiativeId: i.id, content: '事実' });
  const h = normalizeHypothesis({ initiativeId: i.id, title: '仮説', supportingObservationIds: [o.id] });
  const bundle = { initiative: i, observations: [o], hypotheses: [h], interventions: [], stakeholders: [] };
  const input = buildAgentInput('intervention', bundle);
  const text = JSON.stringify(input);
  assert.ok(!text.includes(h.id) && !text.includes(o.id) && !text.includes(i.id));
  assert.ok(text.includes('"H1"') && text.includes('"O1"'));
  const drafts = toInterventionDrafts({ interventions: [{ title: 'x', category: 'process', targetHypothesisRefs: ['H1', 'H9'], description: '', expectedBehaviorChange: 'e', expectedOutcomes: [], cost: 'unknown', stakeholders: [], risks: [], reversibility: 'unknown', verificationMethod: '', stopConditions: [], scale: 'small_experiment', shortTermEffect: '', longTermEffect: '' }] }, bundle);
  assert.deepEqual(drafts[0].targetHypothesisIds, [h.id]);
  assert.deepEqual(drafts[0].unknownRefs, ['H9']);
});

test('実施後の結果がなければ、AIが確認済みと言っても学びは結果未確認になる', () => {
  const i = createInitiative({ title: 't' });
  const d = toLearningDraft({ title: 't', summary: 's', problemStructure: '', effectiveInterventions: [], effectiveConditions: [], whatDidNotWork: [], evidence: [], applicableConditions: [], cautions: [], resultCertainty: 'confirmed', limitations: [] }, { initiative: i, metricObservations: [] });
  assert.equal(d.resultCertainty, 'unknown');
  assert.equal(d.pattern, 'unknown');
});

test('メールアドレスや個人名らしき表記を送信前に検出する', () => {
  const hits = scanSensitive({ a: '山田さんに確認（yamada@example.com）' });
  assert.deepEqual(hits.map((h) => h.label).sort(), ['メールアドレス', '個人名と思われる表記'].sort());
});
