// 役割別エージェント（設計書 7章）：入力の組み立てと、出力を「保存前の下書き」に変換する処理
import { SOURCE_TYPES, CONFIDENCE, HYPOTHESIS_STATUSES, INTERVENTION_STATUSES, labelOf } from '../constants.js';
import { resultIsUnknown } from '../domain/learning.js';
import { SUCCESS_FIELDS } from '../domain/initiative.js';

export const AGENT_INFO = {
  structure: { name: 'Agent A：構造分析担当', desc: '観測された問題を整理し、複数の原因仮説と検証方法を出します。' },
  review: { name: 'Agent B：批判的レビュアー', desc: '分析や仮説の論理の飛躍、別の説明可能性を指摘します。' },
  intervention: { name: 'Agent C：介入設計担当', desc: '原因仮説に対応する、性質の異なる介入案を設計します。' },
  stakeholder: { name: 'Agent D：ステークホルダー担当', desc: '関係者の関心と懸念、共同で決める事項を整理します。' },
  verification: { name: 'Agent E：効果検証担当', desc: '実施前の期待と実施後の結果を比べ、判断できること・できないことを分けます。' },
  learning: { name: 'Agent F：学習記録担当', desc: '再利用できる知見を抽出します。結果不明の施策は成功扱いしません。' },
};

// ---------- 入力の組み立て（内部IDは送らず、O1 / H1 などの参照記号を使う） ----------

function refs(bundle) {
  const obs = new Map((bundle.observations || []).map((o, k) => [o.id, `O${k + 1}`]));
  const hyp = new Map((bundle.hypotheses || []).map((h, k) => [h.id, `H${k + 1}`]));
  return { obs, hyp };
}

function initiativeCtx(i) {
  return {
    案件名: i.title,
    解決したい問題: i.problemStatement,
    対象: i.scope,
    期待する状態: i.desiredState,
    事業との関係: i.businessContext,
    背景: i.background || null,
    観測された問題: {
      何が起きているか: i.problemDetail.what || null,
      いつから: i.problemDetail.since || null,
      範囲: i.problemDetail.extent || null,
      影響: i.problemDetail.impact || null,
    },
    改善の定義: {
      どうなれば改善か: i.expectation.improvedWhen || null,
      増減してほしい行動: i.expectation.behaviorChanges || null,
      寄与する成果: i.expectation.businessContribution || null,
    },
    未解決の論点: i.openQuestions,
  };
}

function observationsCtx(bundle, r) {
  return (bundle.observations || []).map((o) => ({
    ref: r.obs.get(o.id),
    事実: o.content,
    解釈メモ: o.interpretation || null,
    情報源: `${labelOf(SOURCE_TYPES, o.sourceType)}${o.sourceDescription ? `：${o.sourceDescription}` : ''}`,
    確度: labelOf(CONFIDENCE, o.confidence),
    確認状況: o.status === 'observed' ? '確認済み' : '伝聞（未確認）',
    観測日: o.observedAt,
  }));
}

function hypothesesCtx(hyps, r) {
  return hyps.map((h) => ({
    ref: r.hyp.get(h.id),
    仮説: h.title,
    説明: h.description || null,
    検証状況: labelOf(HYPOTHESIS_STATUSES, h.status),
    根拠となる事実: h.supportingObservationIds.map((id) => r.obs.get(id)).filter(Boolean),
    根拠メモ: h.evidenceNotes,
    反証材料: h.counterEvidence,
    不足情報: h.missingInformation,
    検証方法: h.verificationMethod || null,
    ユーザーの判断: h.userAssessment ? `${h.userAssessment}（${h.assessmentReason || ''}）` : null,
  }));
}

function metricsCtx(bundle, planId = null) {
  const ms = (bundle.metricDefinitions || []).filter((m) => !planId || !m.planId || m.planId === planId);
  return ms.map((m) => ({
    指標名: m.name,
    成果レベル: m.level,
    種類: m.kind === 'quantitative' ? '定量' : '定性',
    意味: m.description || null,
    測定方法: m.measurementMethod,
    単位: m.unit || null,
    実施前の値: m.baselineValue,
    目標値: m.targetValue,
    データの信頼性: labelOf(CONFIDENCE, m.reliability),
    実行開始後に追加された指標: m.definedAfterStart,
    測定結果: (bundle.metricObservations || []).filter((o) => o.metricId === m.id).map((o) => ({
      時点: { before: '実施前', during: '実施中', after: '実施後' }[o.phase],
      値: o.value,
      観察記録: o.note || null,
      日付: o.observedAt,
      信頼性: labelOf(CONFIDENCE, o.reliability),
    })),
  }));
}

function interventionsCtx(ivs, r) {
  return ivs.map((v) => ({
    施策名: v.title,
    内容: v.description || null,
    対象仮説: v.targetHypothesisIds.map((id) => r.hyp.get(id)).filter(Boolean),
    期待する行動変化: v.expectedBehaviorChange,
    状態: labelOf(INTERVENTION_STATUSES, v.status),
    判断理由: v.decisionReason || null,
  }));
}

/**
 * options: { hypothesisIds, constraints, planId, reviewTarget }
 */
export function buildAgentInput(agent, bundle, options = {}) {
  const r = refs(bundle);
  const i = bundle.initiative;
  const hyps = bundle.hypotheses || [];
  switch (agent) {
    case 'structure':
      return { initiative: initiativeCtx(i), observations: observationsCtx(bundle, r), hypotheses: hypothesesCtx(hyps, r) };
    case 'review':
      return {
        initiative: initiativeCtx(i),
        observations: observationsCtx(bundle, r),
        target: options.reviewTarget || { 登録済みの仮説: hypothesesCtx(hyps, r) },
      };
    case 'intervention': {
      const selected = options.hypothesisIds?.length
        ? hyps.filter((h) => options.hypothesisIds.includes(h.id))
        : hyps.filter((h) => h.status !== 'not_supported');
      const constraints = [
        ...(options.constraints ? [options.constraints] : []),
        ...(bundle.stakeholders || []).flatMap((s) => s.constraints.map((c) => `${s.role}：${c}`)),
      ];
      return {
        selectedHypotheses: hypothesesCtx(selected, r),
        observations: observationsCtx(bundle, r),
        constraints: constraints.length ? constraints : ['（制約は入力されていません）'],
        existingInterventions: interventionsCtx(bundle.interventions || [], r),
      };
    }
    case 'stakeholder': {
      const ivs = (bundle.interventions || []).filter((v) => v.status !== 'rejected');
      return {
        initiative: initiativeCtx(i),
        stakeholders: (bundle.stakeholders || []).map((s) => ({
          役割: s.role, チーム: s.team || null, 目標: s.goals, 制約: s.constraints, 懸念: s.concerns,
          把握している意見: s.knownOpinion || null, opinionConfirmed: s.opinionConfirmed, 決定権限: s.decisionRights || null,
        })),
        interventions: interventionsCtx(ivs, r),
      };
    }
    case 'verification': {
      const plan = (bundle.experimentPlans || []).find((p) => p.id === options.planId) || (bundle.experimentPlans || [])[0];
      const iv = plan && (bundle.interventions || []).find((v) => v.id === plan.interventionId);
      const target = iv ? hyps.filter((h) => iv.targetHypothesisIds.includes(h.id)) : hyps;
      return {
        initiative: initiativeCtx(i),
        successDefinition: Object.fromEntries(SUCCESS_FIELDS.map((f) => [f.label, i.successDefinition[f.key] || null])),
        plan: plan ? {
          施策: plan.title, 介入案: iv?.title || null, 期待する行動変化: iv?.expectedBehaviorChange || null,
          対象範囲: plan.scope || null, 実施開始日: plan.startDate, 検証予定日: plan.reviewDate,
          実施手順: plan.steps, 成功条件: plan.successCriteria, 中止条件: plan.stopConditions,
          実施状況メモ: plan.evaluation.implementation || null,
        } : null,
        hypotheses: hypothesesCtx(target, r),
        metrics: metricsCtx(bundle, plan?.id),
      };
    }
    case 'learning':
      return {
        initiative: { ...initiativeCtx(i), ステータス: i.status },
        hypotheses: hypothesesCtx(hyps, r),
        interventions: interventionsCtx(bundle.interventions || [], r),
        evaluations: (bundle.experimentPlans || []).map((p) => ({ 施策: p.title, ...p.evaluation })),
        metrics: metricsCtx(bundle),
        実施後の測定結果の有無: resultIsUnknown(bundle) ? 'なし（結果未確認）' : 'あり',
      };
    default:
      throw new Error(`不明なエージェントです：${agent}`);
  }
}

// ---------- 送信前の確認（設計書 12章） ----------

const PII_PATTERNS = [
  { re: /[\w.+-]+@[\w-]+\.[\w.-]+/g, label: 'メールアドレス' },
  { re: /0\d{1,4}-\d{1,4}-\d{3,4}/g, label: '電話番号' },
  { re: /[一-龥ぁ-んァ-ヶ]{1,6}(?:さん|様|氏|くん|君)/g, label: '個人名と思われる表記' },
];

export function scanSensitive(input) {
  const text = JSON.stringify(input);
  const hits = [];
  for (const p of PII_PATTERNS) {
    const m = text.match(p.re);
    if (m) hits.push({ label: p.label, samples: [...new Set(m)].slice(0, 5) });
  }
  return hits;
}

export function summarizeInput(agent, input) {
  const rows = [];
  const count = (v) => (Array.isArray(v) ? v.length : v ? 1 : 0);
  if (input.initiative) rows.push('案件情報（案件名・解決したい問題・対象・期待する状態・事業との関係・未解決の論点）');
  if (input.observations) rows.push(`観測事実 ${count(input.observations)} 件`);
  if (input.hypotheses) rows.push(`原因仮説 ${count(input.hypotheses)} 件`);
  if (input.selectedHypotheses) rows.push(`対象の原因仮説 ${count(input.selectedHypotheses)} 件`);
  if (input.target) rows.push('レビュー対象の分析');
  if (input.constraints) rows.push(`組織上の制約 ${count(input.constraints)} 件`);
  if (input.existingInterventions) rows.push(`既存の介入案 ${count(input.existingInterventions)} 件`);
  if (input.interventions) rows.push(`介入案 ${count(input.interventions)} 件`);
  if (input.stakeholders) rows.push(`関係者（役割名） ${count(input.stakeholders)} 件`);
  if (input.plan) rows.push('実行計画');
  if (input.successDefinition) rows.push('実施前に定義した成功条件');
  if (input.metrics) rows.push(`指標と測定結果 ${count(input.metrics)} 件`);
  if (input.evaluations) rows.push(`効果検証 ${count(input.evaluations)} 件`);
  return rows;
}

// ---------- 出力 → 保存前の下書き ----------

export function toHypothesisDrafts(result, initiativeId) {
  return (result.hypotheses || []).map((h) => ({
    initiativeId,
    title: h.title,
    description: h.description,
    lens: h.lens,
    evidenceNotes: h.evidence,
    alternativeExplanations: h.alternativeExplanations,
    missingInformation: h.missingInformation,
    verificationMethod: h.verificationMethod,
    status: 'unverified',
    origin: 'ai',
    supportStatus: h.supportStatus,
  }));
}

export function toInterventionDrafts(result, bundle) {
  const r = refs(bundle);
  const back = new Map([...r.hyp.entries()].map(([id, ref]) => [ref, id]));
  return (result.interventions || []).map((v) => ({
    initiativeId: bundle.initiative.id,
    title: v.title,
    category: v.category,
    description: v.description,
    targetHypothesisIds: v.targetHypothesisRefs.map((ref) => back.get(ref.trim())).filter(Boolean),
    unknownRefs: v.targetHypothesisRefs.filter((ref) => !back.has(ref.trim())),
    expectedBehaviorChange: v.expectedBehaviorChange,
    expectedOutcomes: v.expectedOutcomes,
    costEstimate: v.cost,
    requiredCooperation: v.stakeholders,
    risks: v.risks,
    reversibility: v.reversibility,
    verificationPlan: v.verificationMethod,
    stopConditions: v.stopConditions,
    scale: v.scale,
    shortTermEffect: v.shortTermEffect,
    longTermEffect: v.longTermEffect,
    status: 'proposed',
    origin: 'ai',
  }));
}

export function toEvaluationDraft(result) {
  return {
    implementation: result.implementationStatus,
    expectedChanges: result.expectedChanges,
    observedChanges: result.observedChanges,
    supporting: result.supportingEvidence,
    contradicting: result.contradictingEvidence,
    confounders: result.confounders,
    canConclude: result.canConclude,
    cannotConclude: result.cannotConclude,
    nextVerification: result.nextVerification,
    // 判断はユーザーが行うため、AIの選択肢は理由欄の参考にとどめる
    decision: 'undecided',
    decisionReason: '',
  };
}

export function toLearningDraft(result, bundle) {
  const unknown = resultIsUnknown(bundle);
  const certainty = unknown ? 'unknown' : result.resultCertainty;
  return {
    initiativeId: bundle.initiative.id,
    title: result.title,
    summary: result.summary,
    targetProblem: result.problemStructure,
    intervention: result.effectiveInterventions.join('\n'),
    whatWorked: [...result.effectiveInterventions, ...result.effectiveConditions.map((c) => `条件：${c}`)],
    whatDidNotWork: result.whatDidNotWork,
    evidence: result.evidence,
    reusableConditions: result.applicableConditions,
    cautions: result.cautions,
    limitations: result.limitations,
    resultCertainty: certainty,
    pattern: certainty === 'unknown' ? 'unknown' : 'mixed',
  };
}
