// 観測事実（Observation）と原因仮説（Hypothesis）
import { SOURCE_TYPES, CONFIDENCE, OBSERVATION_STATUS, HYPOTHESIS_STATUSES, PRIORITY, STRUCTURAL_LENSES } from '../constants.js';
import { newId, nowIso, asList, str, requireFields } from './common.js';

const oneOf = (list, v, fallback) => (list.some((o) => o.value === v) ? v : fallback);

export function normalizeObservation(r) {
  return {
    id: r.id || newId('observation'),
    initiativeId: r.initiativeId,
    content: str(r.content),
    interpretation: str(r.interpretation),
    sourceType: oneOf(SOURCE_TYPES, r.sourceType, 'other'),
    sourceDescription: str(r.sourceDescription),
    observedAt: str(r.observedAt) || null,
    observationPeriod: str(r.observationPeriod),
    confidence: oneOf(CONFIDENCE, r.confidence, 'medium'),
    status: oneOf(OBSERVATION_STATUS, r.status, 'observed'),
    // 事実はユーザーの入力でのみ作られる（AI由来は禁止）
    origin: 'user',
    createdAt: r.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

export function validateObservation(r) {
  return requireFields(r, { content: '観測した事実' });
}

export function normalizeHypothesis(r) {
  return {
    id: r.id || newId('hypothesis'),
    initiativeId: r.initiativeId,
    title: str(r.title),
    description: str(r.description),
    lens: oneOf(STRUCTURAL_LENSES, r.lens, null),
    supportingObservationIds: Array.isArray(r.supportingObservationIds) ? r.supportingObservationIds : [],
    evidenceNotes: asList(r.evidenceNotes),
    counterEvidence: asList(r.counterEvidence),
    alternativeExplanations: asList(r.alternativeExplanations),
    missingInformation: asList(r.missingInformation),
    verificationMethod: str(r.verificationMethod),
    priority: oneOf(PRIORITY, r.priority, 'medium'),
    status: oneOf(HYPOTHESIS_STATUSES, r.status, 'unverified'),
    userAssessment: str(r.userAssessment) || null,
    assessmentReason: str(r.assessmentReason) || null,
    // 'user' | 'ai'（AI提案をユーザーが確認して採用したもの）
    origin: r.origin === 'ai' ? 'ai' : 'user',
    createdAt: r.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

export function validateHypothesis(r) {
  const errors = requireFields(r, { title: '仮説の内容（見出し）' });
  if (['supported', 'not_supported'].includes(r.status) && !str(r.assessmentReason)) {
    errors.assessmentReason = '「支持された／支持されなかった」と判断した理由を入力してください';
  }
  return errors;
}

// 仮説の根拠の状態：観測事実に紐づいているか
export function evidenceState(h) {
  if (h.supportingObservationIds.length > 0) return { level: 'linked', label: `事実 ${h.supportingObservationIds.length} 件に基づく` };
  if (h.evidenceNotes.length > 0) return { level: 'notes', label: '根拠メモのみ（事実と未接続）' };
  return { level: 'none', label: '根拠未確認' };
}

// 統計：画面上部のサマリー用
export function hypothesisSummary(hyps) {
  const count = (s) => hyps.filter((h) => h.status === s).length;
  return HYPOTHESIS_STATUSES.map((s) => ({ ...s, count: count(s.value) }));
}
