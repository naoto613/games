// 介入案（Intervention）と意思決定記録（DecisionRecord）
import { INTERVENTION_CATEGORIES, INTERVENTION_STATUSES, LEVEL3, SCALES, RATING_AXES, DECISION_TYPES } from '../constants.js';
import { newId, nowIso, today, asList, str, requireFields } from './common.js';

const oneOf = (list, v, fallback) => (list.some((o) => o.value === v) ? v : fallback);

export function normalizeIntervention(r) {
  const ratings = {};
  for (const ax of RATING_AXES) ratings[ax.key] = oneOf(LEVEL3, r.ratings?.[ax.key], 'unknown');
  return {
    id: r.id || newId('intervention'),
    initiativeId: r.initiativeId,
    title: str(r.title),
    category: oneOf(INTERVENTION_CATEGORIES, r.category, null),
    description: str(r.description),
    targetHypothesisIds: Array.isArray(r.targetHypothesisIds) ? r.targetHypothesisIds : [],
    expectedBehaviorChange: str(r.expectedBehaviorChange),
    expectedOutcomes: asList(r.expectedOutcomes),
    costEstimate: oneOf(LEVEL3, r.costEstimate, 'unknown'),
    requiredCooperation: asList(r.requiredCooperation),
    risks: asList(r.risks),
    reversibility: oneOf(LEVEL3, r.reversibility, 'unknown'),
    verificationPlan: str(r.verificationPlan),
    stopConditions: asList(r.stopConditions),
    scale: oneOf(SCALES, r.scale, 'unknown'),
    shortTermEffect: str(r.shortTermEffect),
    longTermEffect: str(r.longTermEffect),
    ratings,
    status: oneOf(INTERVENTION_STATUSES, r.status, 'proposed'),
    decisionReason: str(r.decisionReason) || null,
    origin: r.origin === 'ai' ? 'ai' : 'user',
    createdAt: r.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

export function validateIntervention(r) {
  return requireFields(r, { title: '施策名', expectedBehaviorChange: '期待する行動変化' });
}

// 実施前に揃っているべき項目（受け入れテスト17.3：リスクと検証方法）
export function interventionGaps(iv) {
  const gaps = [];
  if (!iv.targetHypothesisIds.length) gaps.push('対象仮説');
  if (!iv.risks.length) gaps.push('想定リスク');
  if (!iv.verificationPlan) gaps.push('検証方法');
  if (!iv.stopConditions.length) gaps.push('中止条件');
  return gaps;
}

export function normalizeDecision(r) {
  return {
    id: r.id || newId('decision'),
    initiativeId: r.initiativeId,
    type: oneOf(DECISION_TYPES, r.type, 'other'),
    subjectId: r.subjectId || null,
    title: str(r.title),
    decision: str(r.decision),
    reason: str(r.reason),
    alternatives: asList(r.alternatives),
    decidedBy: str(r.decidedBy) || 'EM（本人）',
    decidedAt: str(r.decidedAt) || today(),
    createdAt: r.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

export function validateDecision(r) {
  return requireFields(r, { title: '何についての判断か', decision: '判断内容' });
}

/**
 * 介入案に採用・保留・却下を適用し、意思決定記録を一緒に返す。
 * 他の案の状態も alternatives に残す（採用しなかった案とその理由を記録する）。
 */
export function decideIntervention(iv, status, reason, allInterventions = []) {
  const label = INTERVENTION_STATUSES.find((s) => s.value === status)?.label || status;
  const updated = normalizeIntervention({ ...iv, status, decisionReason: reason || null });
  const alternatives = allInterventions
    .filter((o) => o.id !== iv.id)
    .map((o) => `${o.title}（${INTERVENTION_STATUSES.find((s) => s.value === o.status)?.label || ''}${o.decisionReason ? `：${o.decisionReason}` : ''}）`);
  const decision = normalizeDecision({
    initiativeId: iv.initiativeId,
    type: 'intervention_decision',
    subjectId: iv.id,
    title: `介入案「${iv.title}」`,
    decision: label,
    reason: reason || '',
    alternatives,
  });
  return { intervention: updated, decision };
}

// 比較画面での並べ替え用スコア（不明は中間より低く扱わず、末尾に送る）
export function axisScore(iv, axisKey) {
  const ax = RATING_AXES.find((a) => a.key === axisKey);
  const v = iv.ratings[axisKey];
  if (v === 'unknown') return -1;
  const base = { high: 3, medium: 2, low: 1 }[v];
  return ax.good === 'high' ? base : 4 - base;
}
