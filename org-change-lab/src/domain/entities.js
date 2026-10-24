// ストア名 → 正規化・検証関数の対応表
import { normalizeInitiative, validateInitiative } from './initiative.js';
import { normalizeObservation, validateObservation, normalizeHypothesis, validateHypothesis } from './hypothesis.js';
import { normalizeIntervention, validateIntervention, normalizeDecision, validateDecision } from './intervention.js';
import {
  normalizePlan, validatePlan, normalizeMetric, validateMetric,
  normalizeMetricObservation, validateMetricObservation, normalizeStakeholder, validateStakeholder,
} from './experiment.js';
import { normalizeLearning, validateLearning } from './learning.js';
import { normalizeAnalysis, validateAnalysis } from './analysis.js';

export const ENTITIES = {
  initiatives: { label: '変革案件', normalize: normalizeInitiative, validate: validateInitiative },
  observations: { label: '観測事実', normalize: normalizeObservation, validate: validateObservation },
  hypotheses: { label: '原因仮説', normalize: normalizeHypothesis, validate: validateHypothesis },
  interventions: { label: '介入案', normalize: normalizeIntervention, validate: validateIntervention },
  experimentPlans: { label: '実行計画', normalize: normalizePlan, validate: validatePlan },
  metricDefinitions: { label: '指標定義', normalize: normalizeMetric, validate: validateMetric },
  metricObservations: { label: '指標の測定結果', normalize: normalizeMetricObservation, validate: validateMetricObservation },
  stakeholders: { label: '関係者', normalize: normalizeStakeholder, validate: validateStakeholder },
  decisionRecords: { label: '意思決定記録', normalize: normalizeDecision, validate: validateDecision },
  learningRecords: { label: '学習記録', normalize: normalizeLearning, validate: validateLearning },
  aiAnalyses: { label: 'AI分析結果', normalize: normalizeAnalysis, validate: validateAnalysis },
};
