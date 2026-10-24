// 実行計画（ExperimentPlan）・指標（MetricDefinition / MetricObservation）・関係者（Stakeholder）
import { PLAN_STATUSES, METRIC_KINDS, METRIC_PHASES, CONFIDENCE, EXPERIMENT_DECISIONS, OUTCOME_LEVELS } from '../constants.js';
import { newId, nowIso, asList, str, numOrNull, requireFields } from './common.js';

const oneOf = (list, v, fallback) => (list.some((o) => o.value === v) ? v : fallback);

export function normalizePlan(r) {
  const ev = r.evaluation || {};
  return {
    id: r.id || newId('plan'),
    initiativeId: r.initiativeId,
    interventionId: r.interventionId || null,
    title: str(r.title),
    scope: str(r.scope),
    startDate: str(r.startDate) || null,
    reviewDate: str(r.reviewDate) || null,
    owner: str(r.owner),
    collaborators: asList(r.collaborators),
    steps: asList(r.steps),
    successCriteria: asList(r.successCriteria),
    stopConditions: asList(r.stopConditions),
    status: oneOf(PLAN_STATUSES, r.status, 'planned'),
    // 効果検証（SCR-05）。効果と、因果の不確実性を分けて保持する
    evaluation: {
      implementation: str(ev.implementation),
      expectedChanges: asList(ev.expectedChanges),
      observedChanges: asList(ev.observedChanges),
      supporting: asList(ev.supporting),
      contradicting: asList(ev.contradicting),
      confounders: asList(ev.confounders),
      canConclude: asList(ev.canConclude),
      cannotConclude: asList(ev.cannotConclude),
      nextVerification: asList(ev.nextVerification),
      decision: oneOf(EXPERIMENT_DECISIONS, ev.decision, 'undecided'),
      decisionReason: str(ev.decisionReason),
    },
    createdAt: r.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

export function validatePlan(r) {
  const errors = requireFields(r, { title: '実施する施策', owner: '実施責任者', successCriteria: '成功条件' });
  if (r.startDate && r.reviewDate && r.reviewDate < r.startDate) errors.reviewDate = '検証予定日は実施開始日より後にしてください';
  return errors;
}

export function normalizeMetric(r) {
  return {
    id: r.id || newId('metric'),
    initiativeId: r.initiativeId,
    planId: r.planId || null,
    level: OUTCOME_LEVELS.some((l) => l.value === Number(r.level)) ? Number(r.level) : 2,
    kind: oneOf(METRIC_KINDS, r.kind, 'quantitative'),
    name: str(r.name),
    description: str(r.description),
    measurementMethod: str(r.measurementMethod),
    target: str(r.target),
    unit: str(r.unit),
    period: str(r.period),
    // 不明な値は null のまま（推測で補完しない）
    baselineValue: numOrNull(r.baselineValue),
    targetValue: numOrNull(r.targetValue),
    dataSource: str(r.dataSource),
    reliability: oneOf(CONFIDENCE, r.reliability, 'medium'),
    notes: str(r.notes),
    definedAfterStart: Boolean(r.definedAfterStart),
    createdAt: r.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

export function validateMetric(r) {
  return requireFields(r, { name: '指標名', measurementMethod: '測定方法' });
}

export function normalizeMetricObservation(r) {
  return {
    id: r.id || newId('mobs'),
    initiativeId: r.initiativeId,
    metricId: r.metricId,
    phase: oneOf(METRIC_PHASES, r.phase, 'after'),
    value: numOrNull(r.value),
    note: str(r.note),
    observedAt: str(r.observedAt) || null,
    source: str(r.source),
    reliability: oneOf(CONFIDENCE, r.reliability, 'medium'),
    createdAt: r.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

export function validateMetricObservation(r) {
  const errors = requireFields(r, { metricId: '指標' });
  if (r.value === null && !str(r.note)) errors.value = '数値か観察記録のどちらかを入力してください';
  return errors;
}

/**
 * 実施前・実施後の比較。値がない側は null を返し、差分も計算しない。
 * ここで出す差分は「観測された変化」であり、施策の効果とは限らない。
 */
export function compareMetric(metric, observations) {
  const mine = observations.filter((o) => o.metricId === metric.id)
    .sort((a, b) => String(a.observedAt || '').localeCompare(String(b.observedAt || '')));
  const lastOf = (phase) => [...mine].reverse().find((o) => o.phase === phase) || null;
  const beforeObs = lastOf('before');
  const afterObs = lastOf('after');
  const before = beforeObs?.value ?? metric.baselineValue ?? null;
  const after = afterObs?.value ?? null;
  const diff = before !== null && after !== null ? Math.round((after - before) * 1000) / 1000 : null;
  return {
    before, after, diff,
    beforeNote: beforeObs?.note || '',
    afterNote: afterObs?.note || '',
    count: mine.length,
    hasAfter: Boolean(afterObs),
    observations: mine,
  };
}

export function outcomeLevelSummary(metrics, observations) {
  return OUTCOME_LEVELS.map((lv) => {
    const ms = metrics.filter((m) => m.level === lv.value);
    const withAfter = ms.filter((m) => observations.some((o) => o.metricId === m.id && o.phase === 'after'));
    let state = '未定義';
    if (ms.length) state = withAfter.length ? `${withAfter.length}/${ms.length} 指標で実施後を記録` : '実施後は未記録';
    return { ...lv, metrics: ms, recorded: withAfter.length, state };
  });
}

export function normalizeStakeholder(r) {
  return {
    id: r.id || newId('stakeholder'),
    initiativeId: r.initiativeId,
    role: str(r.role),
    team: str(r.team),
    goals: asList(r.goals),
    constraints: asList(r.constraints),
    concerns: asList(r.concerns),
    knownOpinion: str(r.knownOpinion),
    opinionConfirmed: Boolean(r.opinionConfirmed),
    decisionRights: str(r.decisionRights),
    createdAt: r.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

export function validateStakeholder(r) {
  return requireFields(r, { role: '役割名' });
}
