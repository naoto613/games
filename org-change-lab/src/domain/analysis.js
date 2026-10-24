// AI分析結果（AIAnalysis）。AIの出力は「提案」として保存し、事実や決定とは別に扱う
import { newId, nowIso, str } from './common.js';

export const AGENT_LABELS = {
  structure: 'Agent A：構造分析',
  review: 'Agent B：批判的レビュー',
  intervention: 'Agent C：介入設計',
  stakeholder: 'Agent D：ステークホルダー',
  verification: 'Agent E：効果検証',
  learning: 'Agent F：学習記録',
};

export function normalizeAnalysis(r) {
  return {
    id: r.id || newId('analysis'),
    initiativeId: r.initiativeId,
    agent: str(r.agent),
    analysisType: str(r.analysisType || r.result?.analysisType),
    mode: str(r.mode) || 'manual',
    model: str(r.model) || null,
    result: r.result && typeof r.result === 'object' ? r.result : {},
    warnings: Array.isArray(r.warnings) ? r.warnings.map(String) : [],
    // ユーザーが内容を確認して保存したか
    reviewedByUser: Boolean(r.reviewedByUser),
    userNote: str(r.userNote),
    createdAt: r.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

export function validateAnalysis(r) {
  const errors = {};
  if (!AGENT_LABELS[r.agent]) errors.agent = '不明な分析種別です';
  if (!r.result || typeof r.result !== 'object') errors.result = '分析結果がありません';
  return errors;
}
