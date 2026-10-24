// 学習記録（LearningRecord）
import { RESULT_CERTAINTY, LEARNING_PATTERNS } from '../constants.js';
import { newId, nowIso, asList, str, requireFields } from './common.js';

const oneOf = (list, v, fallback) => (list.some((o) => o.value === v) ? v : fallback);

export function normalizeLearning(r) {
  return {
    id: r.id || newId('learning'),
    initiativeId: r.initiativeId,
    title: str(r.title),
    summary: str(r.summary),
    targetProblem: str(r.targetProblem),
    intervention: str(r.intervention),
    whatWorked: asList(r.whatWorked),
    whatDidNotWork: asList(r.whatDidNotWork),
    evidence: asList(r.evidence),
    limitations: asList(r.limitations),
    reusableConditions: asList(r.reusableConditions),
    cautions: asList(r.cautions),
    resultCertainty: oneOf(RESULT_CERTAINTY, r.resultCertainty, 'unknown'),
    pattern: oneOf(LEARNING_PATTERNS, r.pattern, 'unknown'),
    createdAt: r.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

export function validateLearning(r) {
  const errors = requireFields(r, { title: '知見のタイトル', summary: '要約' });
  // 結果が不明な施策を成功事例として扱わない
  if (r.pattern === 'success' && r.resultCertainty === 'unknown') {
    errors.pattern = '結果が未確認のため「成功パターン」にはできません。結果の確認状況を見直してください';
  }
  if (r.pattern === 'success' && r.evidence.length === 0) {
    errors.evidence = '成功パターンとして残すには、得られた証拠を1つ以上記録してください';
  }
  return errors;
}

// 実施後の観測値が1件もなければ「結果未確認」
export function resultIsUnknown(bundle) {
  return !(bundle.metricObservations || []).some((o) => o.phase === 'after');
}
