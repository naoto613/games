// 変革案件（ChangeInitiative）のルールと「次に取るべき行動」の候補
import { SCHEMA_VERSION, STATUSES, ACTIVE_STATUSES } from '../constants.js';
import { newId, nowIso, today, isBlank, asList, str, requireFields } from './common.js';

// 施策実施前に定義しておく成功条件（設計原則3）
export const SUCCESS_FIELDS = [
  { key: 'problem', label: '解決したい問題' },
  { key: 'currentState', label: '現在の状態' },
  { key: 'behaviorChange', label: '変えたい行動' },
  { key: 'expectedOutcome', label: '期待する成果' },
  { key: 'measurement', label: '測定方法' },
  { key: 'period', label: '検証期間' },
  { key: 'sideEffects', label: '想定する副作用' },
  { key: 'stopConditions', label: '中止・修正の判断条件' },
];

export const INITIATIVE_REQUIRED = {
  title: '案件名',
  problemStatement: '解決したい問題',
  scope: '対象となるチーム・領域',
  desiredState: '期待する状態',
  businessContext: '事業・プロダクトとの関係',
  startDate: '開始日',
};

export function createInitiative(input = {}) {
  const t = nowIso();
  return normalizeInitiative({
    id: newId('initiative'),
    status: 'problem_discovery',
    startDate: today(),
    createdAt: t,
    updatedAt: t,
    ...input,
  });
}

export function normalizeInitiative(r) {
  return {
    id: r.id,
    title: str(r.title),
    problemStatement: str(r.problemStatement),
    desiredState: str(r.desiredState),
    scope: asList(Array.isArray(r.scope) ? r.scope : str(r.scope).split(/[,、\n]/)),
    businessContext: str(r.businessContext),
    status: STATUSES.some((s) => s.value === r.status) ? r.status : 'problem_discovery',
    nextAction: str(r.nextAction) || null,
    nextActionSource: r.nextAction ? (r.nextActionSource || 'user') : null,
    startDate: str(r.startDate) || null,
    targetReviewDate: str(r.targetReviewDate) || null,
    targetEndDate: str(r.targetEndDate) || null,
    background: str(r.background),
    references: asList(r.references),
    relatedInitiativeIds: Array.isArray(r.relatedInitiativeIds) ? r.relatedInitiativeIds : [],
    openQuestions: asList(r.openQuestions),
    // SCR-03 A/C：観測された問題と期待する状態の詳細
    problemDetail: {
      what: str(r.problemDetail?.what),
      since: str(r.problemDetail?.since),
      extent: str(r.problemDetail?.extent),
      impact: str(r.problemDetail?.impact),
    },
    expectation: {
      improvedWhen: str(r.expectation?.improvedWhen),
      behaviorChanges: str(r.expectation?.behaviorChanges),
      businessContribution: str(r.expectation?.businessContribution),
    },
    successDefinition: Object.fromEntries(SUCCESS_FIELDS.map((f) => [f.key, str(r.successDefinition?.[f.key])])),
    successDefinitionLockedAt: r.successDefinitionLockedAt || null,
    agreements: {
      jointDecisions: asList(r.agreements?.jointDecisions),
      delegatedDecisions: asList(r.agreements?.delegatedDecisions),
      decisionProcess: str(r.agreements?.decisionProcess),
      agreedItems: asList(r.agreements?.agreedItems),
    },
    archived: Boolean(r.archived),
    isSample: Boolean(r.isSample),
    createdAt: r.createdAt || nowIso(),
    updatedAt: r.updatedAt || nowIso(),
    schemaVersion: SCHEMA_VERSION,
  };
}

export function validateInitiative(r) {
  return requireFields(r, INITIATIVE_REQUIRED);
}

export function isActive(initiative) {
  return !initiative.archived && ACTIVE_STATUSES.includes(initiative.status);
}

export function successDefinitionGaps(initiative) {
  const sd = initiative.successDefinition || {};
  return SUCCESS_FIELDS.filter((f) => isBlank(sd[f.key]));
}

// 実行中以降に成功条件を変更すると「実施後の変更」として記録対象にする
export function isSuccessDefinitionLocked(initiative) {
  return Boolean(initiative.successDefinitionLockedAt);
}

/**
 * 次に取るべき行動の候補（ステータスと未完了の必須項目から機械的に導く）。
 * ここで返すのは候補であり、ユーザーが選ぶまで initiative.nextAction には保存しない。
 */
export function suggestNextActions(bundle) {
  const { initiative: i } = bundle;
  const obs = bundle.observations || [];
  const hyps = bundle.hypotheses || [];
  const ivs = bundle.interventions || [];
  const plans = bundle.experimentPlans || [];
  const metrics = bundle.metricDefinitions || [];
  const mobs = bundle.metricObservations || [];
  const learnings = bundle.learningRecords || [];
  const out = [];
  const add = (text, reason, tab) => out.push({ text, reason, tab });

  const missing = Object.keys(validateInitiative(i));
  if (missing.length) add('案件の必須情報を埋める', `未入力：${missing.map((k) => INITIATIVE_REQUIRED[k]).join('、')}`, 'overview');

  switch (i.status) {
    case 'problem_discovery':
      if (obs.length === 0) add('観測した事実を登録する', '根拠となる事実がまだありません', 'analysis');
      if (isBlank(i.problemDetail.what) || isBlank(i.problemDetail.impact)) add('何が起きているか・どんな影響があるかを具体化する', '観測された問題（A）が未入力です', 'analysis');
      if (hyps.length < 2) add('複数の原因仮説を立てる', '1つの原因に早く収束させないため、2つ以上を推奨', 'analysis');
      break;
    case 'hypothesis_testing': {
      const open = hyps.filter((h) => h.status === 'unverified' || h.status === 'testing');
      const top = open.find((h) => h.priority === 'high') || open[0];
      if (top) add(`仮説「${top.title}」を検証する`, top.verificationMethod ? `検証方法：${top.verificationMethod}` : '検証方法が未定義です', 'analysis');
      if (hyps.length && !open.length && !hyps.some((h) => h.status === 'supported')) add('支持できる仮説がないため、事実の収集に戻る', '全ての仮説が不支持または保留です', 'analysis');
      if (hyps.length === 0) add('原因仮説を登録する', '仮説がありません', 'analysis');
      break;
    }
    case 'intervention_design':
      if (ivs.length < 2) add('性質の異なる介入案を2つ以上用意する', '比較できる案が不足しています', 'interventions');
      else if (!ivs.some((v) => v.status === 'adopted')) add('介入案の採用・保留・却下を判断する', '採用した案がまだありません', 'interventions');
      if (ivs.some((v) => v.targetHypothesisIds.length === 0)) add('介入案と原因仮説を対応づける', '対象仮説のない介入案があります', 'interventions');
      break;
    case 'preparation': {
      if (plans.length === 0) add('実行計画を作成する', '採用した介入案の実行計画がありません', 'execution');
      const gaps = successDefinitionGaps(i);
      if (gaps.length) add('施策実施前の成功条件を定義する', `未定義：${gaps.map((g) => g.label).join('、')}`, 'execution');
      if (metrics.length === 0) add('評価指標を定義する', '指標がありません', 'execution');
      else if (metrics.some((m) => !mobs.some((o) => o.metricId === m.id && o.phase === 'before') && m.baselineValue === null)) add('実施前の値を記録する', '実施前の値がない指標があります（不明なら定性的な記録でも可）', 'execution');
      break;
    }
    case 'running': {
      add('実施状況（レベル1）と行動変化（レベル2）を記録する', '事業成果が出る前でも過程を記録します', 'execution');
      const due = plans.find((p) => p.reviewDate && p.reviewDate <= today());
      if (due) add('効果検証に進む', `検証予定日（${due.reviewDate}）を過ぎています`, 'execution');
      break;
    }
    case 'verification':
      if (!mobs.some((o) => o.phase === 'after')) add('実施後の値を記録する', '実施後の観測値がありません', 'execution');
      if (!plans.some((p) => p.evaluation?.decision && p.evaluation.decision !== 'undecided')) add('継続・修正・中止を判断する', '判断が記録されていません', 'execution');
      break;
    case 'completed':
      if (learnings.length === 0) add('学びを記録する', '完了した案件の知見がありません', 'learning');
      break;
    case 'on_hold':
      add('保留理由と再開条件を記録する', '再開の判断ができるようにします', 'overview');
      break;
    case 'cancelled':
      if (learnings.length === 0) add('中止の理由と学びを記録する', '中止した施策からも学びを抽出します', 'learning');
      break;
    default:
  }
  if (out.length === 0) add('現在のステータスで必要な情報は揃っています。次のステータスへの移行を検討する', '', 'overview');
  return out;
}

// ホームなどで表示する次の行動。ユーザー設定 > 候補（提案として明示）
export function displayNextAction(bundle) {
  const i = bundle.initiative;
  if (!isBlank(i.nextAction)) return { text: i.nextAction, source: 'user' };
  const [first] = suggestNextActions(bundle);
  return first ? { text: first.text, source: 'suggested' } : { text: '未設定', source: 'none' };
}
