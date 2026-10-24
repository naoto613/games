// SCR-05 実行・効果検証
import {
  PLAN_STATUSES, OUTCOME_LEVELS, METRIC_KINDS, METRIC_PHASES, CONFIDENCE, EXPERIMENT_DECISIONS,
  INTERVENTION_STATUSES, labelOf,
} from '../constants.js';
import { SUCCESS_FIELDS, successDefinitionGaps } from '../domain/initiative.js';
import { compareMetric, outcomeLevelSummary } from '../domain/experiment.js';
import { normalizeDecision } from '../domain/intervention.js';
import { today } from '../domain/common.js';
import { h, download, safeFileName } from '../components/dom.js';
import { kindLabel, badge, button, toast, formModal, confirmDialog, bulletList, emptyState, definitionList, openModal } from '../components/ui.js';
import { runAgentFlow } from '../components/aiRunner.js';
import { toEvaluationDraft } from '../ai/agents.js';
import { parseMetricCsv, toCsv, METRIC_CSV_HEADER } from '../services/exportService.js';

export async function renderExperimentTab(body, ctx, bundle) {
  body.append(successCard(ctx, bundle));
  body.append(plansCard(ctx, bundle));
  body.append(metricsCard(ctx, bundle));
  body.append(evaluationCard(ctx, bundle));

  if (ctx.pendingAction?.type === 'newPlan') {
    const { interventionId } = ctx.pendingAction;
    ctx.pendingAction = null;
    setTimeout(() => editPlan(ctx, bundle, null, interventionId), 0);
  }
}

// ---------- 成功条件（実施前に定義） ----------

function successCard(ctx, bundle) {
  const i = bundle.initiative;
  const gaps = successDefinitionGaps(i);
  const locked = Boolean(i.successDefinitionLockedAt);
  const edit = () => formModal({
    title: '施策実施前の成功条件',
    intro: locked ? h('div', { class: 'alert alert-warning' }, h('p', {}, `実行開始（${i.successDefinitionLockedAt.slice(0, 10)}）後の変更です。実施後に都合のよい条件へ差し替えていないか確認してください。変更内容と理由は意思決定記録に残ります。`)) : h('p', { class: 'small muted' }, '施策を実施する前に定義しておくことで、実施後に都合のよい指標を選ぶことを防ぎます。'),
    defs: [
      ...SUCCESS_FIELDS.map((f) => ({ name: `successDefinition.${f.key}`, label: f.label, type: 'textarea', rows: 2 })),
      ...(locked ? [{ name: 'reason', label: '変更の理由', type: 'textarea', rows: 2, required: true }] : []),
    ],
    values: i,
    size: 'lg',
    onSubmit: async (v) => {
      await ctx.svc.update(i, { successDefinition: v.successDefinition }, v.reason || '');
      toast('成功条件を保存しました');
      ctx.rerender();
    },
  });
  return h('section', { class: 'card' },
    h('div', { class: 'card-head' },
      h('h2', { class: 'card-title' }, '施策実施前の成功条件'),
      h('div', { class: 'row gap' }, locked ? badge(`実行開始時に固定（${i.successDefinitionLockedAt.slice(0, 10)}）`, 'blue') : null, button('編集', edit, 'small'))),
    gaps.length ? h('p', { class: 'small' }, badge(`未定義 ${gaps.length}/8：${gaps.map((g) => g.label).join('、')}`, 'amber')) : h('p', { class: 'small' }, badge('8項目すべて定義済み', 'green')),
    definitionList(SUCCESS_FIELDS.map((f) => [f.label, i.successDefinition[f.key]])));
}

// ---------- 実行計画 ----------

function planDefs(bundle) {
  const ivs = [...bundle.interventions].sort((a, b) => (a.status === 'adopted' ? -1 : 0) - (b.status === 'adopted' ? -1 : 0));
  return [
    { name: 'interventionId', label: '対象の介入案', type: 'select', placeholderOption: '（紐づけない）', options: ivs.map((v) => ({ value: v.id, label: `${v.title}（${labelOf(INTERVENTION_STATUSES, v.status)}）` })) },
    { name: 'title', label: '実施する施策', required: true },
    { name: 'scope', label: '対象範囲', placeholder: '例：CRMチームの次の2施策' },
    { name: 'startDate', label: '実施開始日', type: 'date' },
    { name: 'reviewDate', label: '検証予定日', type: 'date' },
    { name: 'owner', label: '実施責任者（役割名）', required: true },
    { name: 'collaborators', label: '協力者（1行に1つ）', type: 'list', rows: 2 },
    { name: 'steps', label: '実施手順（1行に1つ）', type: 'list', rows: 4 },
    { name: 'successCriteria', label: '成功条件（1行に1つ）', type: 'list', rows: 3, required: true },
    { name: 'stopConditions', label: '中止・修正条件（1行に1つ）', type: 'list', rows: 2 },
    { name: 'status', label: '実施状況', type: 'select', options: PLAN_STATUSES },
  ];
}

function editPlan(ctx, bundle, plan = null, interventionId = null) {
  let values = plan;
  if (!plan) {
    const iv = bundle.interventions.find((v) => v.id === interventionId);
    values = iv ? {
      interventionId: iv.id, title: iv.title, steps: iv.description ? [iv.description] : [],
      successCriteria: iv.expectedBehaviorChange ? [iv.expectedBehaviorChange] : [], stopConditions: iv.stopConditions,
      collaborators: iv.requiredCooperation, startDate: today(), status: 'planned',
    } : { startDate: today(), status: 'planned' };
  }
  formModal({
    title: plan ? '実行計画を編集' : '実行計画を作成',
    intro: h('p', { class: 'small muted' }, '外部システムへのタスク登録は行いません。計画は Markdown レポートに含めて共有できます。'),
    defs: planDefs(bundle),
    values,
    size: 'lg',
    onSubmit: async (v) => {
      await ctx.svc.saveChild('experimentPlans', { ...(plan || {}), ...v, interventionId: v.interventionId || null, initiativeId: bundle.initiative.id });
      toast(plan ? '実行計画を更新しました' : '実行計画を作成しました');
      ctx.rerender();
    },
  });
}

function plansCard(ctx, bundle) {
  const ivTitle = (id) => bundle.interventions.find((v) => v.id === id)?.title;
  const adoptedWithoutPlan = bundle.interventions.filter((v) => v.status === 'adopted' && !bundle.experimentPlans.some((p) => p.interventionId === v.id));
  return h('section', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', { class: 'card-title' }, `実行計画（${bundle.experimentPlans.length}）`), button('＋ 実行計画を作成', () => editPlan(ctx, bundle), 'primary small')),
    adoptedWithoutPlan.length ? h('div', { class: 'alert alert-info' }, h('p', {}, '採用済みで計画がない介入案：'),
      h('div', { class: 'row gap wrap' }, adoptedWithoutPlan.map((v) => button(`「${v.title}」の計画を作成`, () => editPlan(ctx, bundle, null, v.id), 'small')))) : null,
    bundle.experimentPlans.length ? h('ul', { class: 'item-list' }, bundle.experimentPlans.map((p) => h('li', { class: 'item' },
      h('div', { class: 'item-head' }, h('strong', {}, p.title), badge(labelOf(PLAN_STATUSES, p.status), p.status === 'running' ? 'green' : 'gray'),
        p.reviewDate && p.reviewDate <= today() && p.status !== 'done' ? badge('検証予定日を過ぎています', 'amber') : null),
      definitionList([
        ['介入案', ivTitle(p.interventionId)], ['対象範囲', p.scope], ['期間', `${p.startDate || '未定'} 〜 検証予定 ${p.reviewDate || '未定'}`],
        ['実施責任者', p.owner], ['協力者', p.collaborators.join('、')],
      ]),
      h('div', { class: 'grid-3' },
        h('div', {}, h('h4', {}, '実施手順'), h('ol', { class: 'bullets small' }, p.steps.map((s) => h('li', {}, s)))),
        h('div', {}, h('h4', {}, '成功条件'), bulletList(p.successCriteria)),
        h('div', {}, h('h4', {}, '中止・修正条件'), bulletList(p.stopConditions, '未定義'))),
      h('div', { class: 'item-actions' },
        button('編集', () => editPlan(ctx, bundle, p), 'small'),
        button('削除', async () => {
          if (!(await confirmDialog({ title: '実行計画を削除しますか？', message: '効果検証の記録も一緒に削除されます。指標は残ります。', confirmLabel: '削除する', danger: true }))) return;
          await ctx.svc.removeChild('experimentPlans', p); toast('削除しました'); ctx.rerender();
        }, 'small btn-ghost')))))
      : emptyState('まだ実行計画がありません。「介入案」タブで案を採用すると、ここから計画を作成できます。'));
}

// ---------- 指標・成果の階層 ----------

function metricDefs(bundle) {
  return [
    { name: 'level', label: '成果の階層', type: 'select', options: OUTCOME_LEVELS.map((l) => ({ value: l.value, label: `${l.label}（${l.desc}）` })) },
    { name: 'kind', label: '種類', type: 'select', options: METRIC_KINDS, help: '数値がない場合は「定性」を選び、観察記録で残します。' },
    { name: 'name', label: '指標名', required: true },
    { name: 'description', label: '指標の意味', type: 'textarea', rows: 2 },
    { name: 'measurementMethod', label: '測定方法', type: 'textarea', rows: 2, required: true },
    { name: 'target', label: '集計対象', placeholder: '例：対象施策の企画ドキュメント' },
    { name: 'period', label: '測定期間' },
    { name: 'unit', label: '単位', placeholder: '例：%、件、日' },
    { name: 'baselineValue', label: '実施前の値（不明なら空欄）', type: 'number', help: '分からない場合は空欄のままにします。推測で埋めないでください。' },
    { name: 'targetValue', label: '目標値（任意）', type: 'number' },
    { name: 'dataSource', label: 'データソース' },
    { name: 'reliability', label: 'データの信頼性', type: 'select', options: CONFIDENCE },
    { name: 'planId', label: '対象の実行計画', type: 'select', placeholderOption: '（紐づけない）', options: bundle.experimentPlans.map((p) => ({ value: p.id, label: p.title })) },
    { name: 'notes', label: '補足事項', type: 'textarea', rows: 2 },
  ];
}

function editMetric(ctx, bundle, m = null, level = 2) {
  const locked = Boolean(bundle.initiative.successDefinitionLockedAt);
  formModal({
    title: m ? '指標を編集' : '指標を定義',
    intro: !m && locked ? h('div', { class: 'alert alert-warning' }, h('p', {}, '実行開始後に追加する指標は「実行開始後に追加」と表示されます。事前に定義した指標と区別して評価してください。')) : null,
    defs: metricDefs(bundle),
    values: m || { level, kind: 'quantitative', reliability: 'medium', planId: bundle.experimentPlans[0]?.id || '' },
    size: 'lg',
    onSubmit: async (v) => {
      await ctx.svc.saveChild('metricDefinitions', { ...(m || { definedAfterStart: locked }), ...v, planId: v.planId || null, initiativeId: bundle.initiative.id });
      toast(m ? '指標を更新しました' : '指標を定義しました');
      ctx.rerender();
    },
  });
}

function addObservation(ctx, bundle, m, obs = null) {
  formModal({
    title: `測定結果を${obs ? '編集' : '記録'}：${m.name}`,
    defs: [
      { name: 'phase', label: '時点', type: 'select', options: METRIC_PHASES },
      { name: 'observedAt', label: '測定日', type: 'date' },
      ...(m.kind === 'quantitative' ? [{ name: 'value', label: `値${m.unit ? `（${m.unit}）` : ''}`, type: 'number', help: '数値がなければ空欄にし、下の観察記録に書きます。' }] : []),
      { name: 'note', label: m.kind === 'quantitative' ? '観察記録・補足（任意）' : '観察記録', type: 'textarea', rows: 3 },
      { name: 'source', label: 'データソース' },
      { name: 'reliability', label: '信頼性', type: 'select', options: CONFIDENCE },
    ],
    values: obs || { phase: bundle.metricObservations.some((o) => o.metricId === m.id && o.phase === 'before') ? 'after' : 'before', observedAt: today(), source: m.dataSource, reliability: m.reliability },
    onSubmit: async (v) => {
      await ctx.svc.saveChild('metricObservations', { ...(obs || {}), ...v, metricId: m.id, initiativeId: bundle.initiative.id });
      toast('測定結果を記録しました');
      ctx.rerender();
    },
  });
}

function fmtVal(v, unit) {
  return v === null || v === undefined ? null : `${v}${unit ? ` ${unit}` : ''}`;
}

function metricItem(ctx, bundle, m) {
  const c = compareMetric(m, bundle.metricObservations);
  const before = fmtVal(c.before, m.unit) || c.beforeNote || null;
  const after = fmtVal(c.after, m.unit) || c.afterNote || null;
  return h('li', { class: 'item metric' },
    h('div', { class: 'item-head' }, h('strong', {}, m.name), badge(labelOf(METRIC_KINDS, m.kind), 'gray'),
      m.definedAfterStart ? badge('実行開始後に追加', 'amber') : null, badge(`信頼性：${labelOf(CONFIDENCE, m.reliability)}`, 'gray')),
    m.description ? h('p', { class: 'small' }, m.description) : null,
    h('p', { class: 'small muted' }, [`測定方法：${m.measurementMethod}`, m.dataSource && `データソース：${m.dataSource}`, m.period && `期間：${m.period}`, m.targetValue !== null ? `目標：${fmtVal(m.targetValue, m.unit)}` : null].filter(Boolean).join('／')),
    h('div', { class: 'compare-row', role: 'group', 'aria-label': `${m.name}の実施前後` },
      h('div', { class: 'compare-cell' }, h('span', { class: 'small muted' }, '実施前'), h('span', { class: 'compare-value' }, before || '未入力')),
      h('span', { class: 'compare-arrow', 'aria-hidden': 'true' }, '→'),
      h('div', { class: 'compare-cell' }, h('span', { class: 'small muted' }, '実施後'), h('span', { class: 'compare-value' }, after || '未入力')),
      h('div', { class: 'compare-cell' }, h('span', { class: 'small muted' }, '観測された差'), h('span', { class: 'compare-value' }, c.diff !== null ? `${c.diff > 0 ? '+' : ''}${c.diff}${m.unit ? ` ${m.unit}` : ''}` : '—'))),
    c.diff !== null ? h('p', { class: 'small muted' }, '※ 観測された変化であり、施策の効果とは限りません。') : null,
    c.observations.length ? h('details', {}, h('summary', { class: 'small' }, `測定結果の記録（${c.observations.length}）`),
      h('ul', { class: 'plain-list small' }, c.observations.map((o) => h('li', { class: 'row space wrap' },
        h('span', {}, kindLabel('fact', labelOf(METRIC_PHASES, o.phase)), ` ${o.observedAt || '日付なし'}：${fmtVal(o.value, m.unit) ?? ''}${o.note ? ` ${o.note}` : ''}${o.source ? `（${o.source}）` : ''}`),
        h('span', { class: 'row gap' }, button('編集', () => addObservation(ctx, bundle, m, o), 'small btn-ghost'),
          button('削除', async () => {
            if (!(await confirmDialog({ title: '測定結果を削除しますか？', message: 'この操作は元に戻せません。', confirmLabel: '削除する', danger: true }))) return;
            await ctx.svc.removeChild('metricObservations', o); toast('削除しました'); ctx.rerender();
          }, 'small btn-ghost')))))) : null,
    h('div', { class: 'item-actions' },
      button('測定結果を記録', () => addObservation(ctx, bundle, m), 'small btn-primary'),
      button('編集', () => editMetric(ctx, bundle, m), 'small'),
      button('削除', async () => {
        const n = bundle.metricObservations.filter((o) => o.metricId === m.id).length;
        if (!(await confirmDialog({ title: '指標を削除しますか？', message: `この指標と測定結果 ${n} 件を削除します。`, confirmLabel: '削除する', danger: true }))) return;
        await ctx.repo.db.batch([{ type: 'delete', store: 'metricDefinitions', id: m.id }, ...bundle.metricObservations.filter((o) => o.metricId === m.id).map((o) => ({ type: 'delete', store: 'metricObservations', id: o.id }))]);
        await ctx.repo.touch(bundle.initiative.id);
        toast('削除しました'); ctx.rerender();
      }, 'small btn-ghost')));
}

function metricsCard(ctx, bundle) {
  const levels = outcomeLevelSummary(bundle.metricDefinitions, bundle.metricObservations);
  const l2 = levels.find((l) => l.value === 2).recorded;
  const l4 = levels.find((l) => l.value === 4).recorded;
  return h('section', { class: 'card' },
    h('div', { class: 'card-head' },
      h('h2', { class: 'card-title' }, `成果の階層と指標（${bundle.metricDefinitions.length}）`),
      h('div', { class: 'row gap wrap' },
        button('CSVを取り込む', () => importCsv(ctx, bundle), 'small'),
        bundle.metricObservations.length ? button('測定結果をCSVで出力', () => exportCsv(bundle), 'small') : null,
        button('＋ 指標を定義', () => editMetric(ctx, bundle), 'primary small'))),
    h('p', { class: 'small muted' }, 'レベル4の成果がすぐに測定できない場合でも、レベル1〜3を記録します。'),
    l2 && !l4 ? h('div', { class: 'alert alert-info small' }, h('p', {}, '行動変化（レベル2）を確認しただけで、事業成果（レベル4）が改善したとは断定できません。')) : null,
    h('ol', { class: 'levels' }, levels.map((lv) => h('li', { class: 'level' },
      h('div', { class: 'level-head' },
        h('div', {}, h('h3', { class: 'subhead' }, lv.label), h('p', { class: 'small muted' }, `${lv.desc}（例：${lv.example}）`)),
        h('div', { class: 'row gap' }, badge(lv.state, lv.recorded ? 'green' : 'gray'), button('＋', () => editMetric(ctx, bundle, null, lv.value), 'small', { 'aria-label': `${lv.label}に指標を追加` }))),
      lv.metrics.length ? h('ul', { class: 'item-list' }, lv.metrics.map((m) => metricItem(ctx, bundle, m))) : null))));
}

function importCsv(ctx, bundle) {
  if (!bundle.metricDefinitions.length) { toast('先に指標を定義してください', 'info'); return; }
  const file = h('input', { type: 'file', accept: '.csv,text/csv', class: 'input', id: 'csv-file' });
  const preview = h('div', { role: 'status' });
  let records = [];
  file.addEventListener('change', async () => {
    const f = file.files[0];
    if (!f) return;
    preview.replaceChildren(h('p', { class: 'muted' }, '読み込み中…'));
    try {
      if (f.size > 5 * 1024 * 1024) throw new Error('ファイルが大きすぎます（5MBまで）');
      const res = parseMetricCsv(await f.text(), bundle.metricDefinitions, bundle.initiative.id);
      records = res.records;
      preview.replaceChildren(
        h('p', {}, `取り込める行：${res.records.length} 件／エラー：${res.errors.length} 件`),
        res.errors.length ? h('div', { class: 'alert alert-error' }, h('ul', { class: 'bullets small' }, res.errors.slice(0, 30).map((e) => h('li', {}, `${e.line}行目：${e.message}`)))) : null);
      m.setActions([{ label: 'キャンセル' }, { label: `${records.length} 件を取り込む`, kind: 'primary', disabled: !records.length, onClick: save }]);
    } catch (e) {
      preview.replaceChildren(h('p', { class: 'alert alert-error' }, `読み込めませんでした：${e.message}`));
    }
  });
  async function save(_, { close }) {
    try {
      await ctx.repo.db.batch(records.map((r) => ({ type: 'put', store: 'metricObservations', record: r })));
      await ctx.repo.touch(bundle.initiative.id);
      close(true);
      toast(`測定結果を ${records.length} 件取り込みました`);
      ctx.rerender();
    } catch (e) { toast(`取り込みに失敗しました：${e.message}`, 'error'); }
  }
  const template = toCsv([METRIC_CSV_HEADER, [bundle.metricDefinitions[0].name, 'before', today(), '', '定性的な記録はここへ', '']]);
  const m = openModal({
    title: '指標の測定結果をCSVで取り込む',
    body: h('div', {},
      h('p', { class: 'small' }, `1行目に列名（${METRIC_CSV_HEADER.join(', ')}）が必要です。metric は定義済みの指標名、phase は before / during / after（実施前 / 実施中 / 実施後）。`),
      button('テンプレートをダウンロード', () => download('metric_template.csv', template, 'text/csv'), 'small'),
      h('label', { class: 'label', for: 'csv-file' }, 'CSVファイル'), file, preview),
    actions: [{ label: 'キャンセル' }, { label: '取り込む', kind: 'primary', disabled: true }],
  });
}

function exportCsv(bundle) {
  const name = (id) => bundle.metricDefinitions.find((m) => m.id === id)?.name || id;
  const csv = toCsv([METRIC_CSV_HEADER, ...bundle.metricObservations.map((o) => [name(o.metricId), o.phase, o.observedAt || '', o.value ?? '', o.note, o.source])]);
  download(`${safeFileName(bundle.initiative.title)}_metrics_${today()}.csv`, csv, 'text/csv');
}

// ---------- 効果検証 ----------

const EVAL_FIELDS = [
  { key: 'implementation', label: '1. 実施内容と実施状況', single: true },
  { key: 'expectedChanges', label: '2. 期待していた変化' },
  { key: 'observedChanges', label: '3. 観測された変化' },
  { key: 'supporting', label: '4. 仮説を支持する情報' },
  { key: 'contradicting', label: '5. 仮説に反する情報' },
  { key: 'confounders', label: '6. 外部要因や交絡要因' },
  { key: 'canConclude', label: '7a. 判断できること' },
  { key: 'cannotConclude', label: '7b. 判断できないこと' },
  { key: 'nextVerification', label: '9. 次に検証すべきこと' },
];

function editEvaluation(ctx, bundle, plan) {
  formModal({
    title: `効果検証：${plan.title}`,
    defs: [
      ...EVAL_FIELDS.map((f) => ({ name: `evaluation.${f.key}`, label: f.single ? f.label : `${f.label}（1行に1つ）`, type: f.single ? 'textarea' : 'list', rows: 2 })),
      { section: '8. 継続・修正・中止の判断' },
      { name: 'evaluation.decision', label: '判断', type: 'select', options: EXPERIMENT_DECISIONS },
      { name: 'evaluation.decisionReason', label: '判断理由', type: 'textarea', rows: 2 },
    ],
    values: plan,
    size: 'lg',
    onSubmit: async (v) => {
      const next = { ...plan, evaluation: { ...plan.evaluation, ...v.evaluation } };
      const items = [{ store: 'experimentPlans', record: next }];
      const d = next.evaluation.decision;
      if (d !== 'undecided' && (d !== plan.evaluation.decision || next.evaluation.decisionReason !== plan.evaluation.decisionReason)) {
        items.push({ store: 'decisionRecords', record: normalizeDecision({ initiativeId: bundle.initiative.id, type: 'experiment_decision', subjectId: plan.id, title: `施策「${plan.title}」`, decision: labelOf(EXPERIMENT_DECISIONS, d), reason: next.evaluation.decisionReason }) });
      }
      await ctx.repo.saveMany(items);
      await ctx.repo.touch(bundle.initiative.id);
      toast('効果検証を保存しました');
      ctx.rerender();
    },
  });
}

function evaluationCard(ctx, bundle) {
  if (!bundle.experimentPlans.length) {
    return h('section', { class: 'card' }, h('h2', { class: 'card-title' }, '効果検証'), h('p', { class: 'muted' }, '実行計画を作成すると、計画ごとに効果検証を記録できます。'));
  }
  return h('section', { class: 'card' },
    h('h2', { class: 'card-title' }, '効果検証'),
    h('p', { class: 'alert alert-info small' }, '施策の実施前後に変化があったとしても、施策が変化の唯一の原因だとは限りません。「効果」と「因果の不確実性」を分けて記録します。'),
    bundle.experimentPlans.map((p) => {
      const e = p.evaluation;
      return h('div', { class: 'eval' },
        h('div', { class: 'card-head' }, h('h3', { class: 'subhead' }, p.title),
          h('div', { class: 'row gap wrap' },
            badge(`判断：${labelOf(EXPERIMENT_DECISIONS, e.decision)}`, e.decision === 'undecided' ? 'gray' : 'blue'),
            ctx.settings.aiMode !== 'off' ? button('✦ AIで効果検証（Agent E）', () => runVerificationAi(ctx, bundle, p), 'small') : null,
            button('記録・判断する', () => editEvaluation(ctx, bundle, p), 'small btn-primary'))),
        h('p', {}, h('strong', {}, '実施状況：'), e.implementation || h('span', { class: 'muted' }, '未評価')),
        h('div', { class: 'grid-2 eval-grid' },
          h('div', { class: 'eval-box eval-effect' }, h('h4', {}, '効果（観測された事実）'),
            h('p', { class: 'small muted' }, '期待していた変化'), bulletList(e.expectedChanges, '未評価'),
            h('p', { class: 'small muted' }, '観測された変化'), bulletList(e.observedChanges, '未評価'),
            h('p', { class: 'small muted' }, '仮説を支持する情報'), bulletList(e.supporting, '未評価'),
            h('p', { class: 'small muted' }, '仮説に反する情報'), bulletList(e.contradicting, '未評価')),
          h('div', { class: 'eval-box eval-uncertainty' }, h('h4', {}, '因果の不確実性'),
            h('p', { class: 'small muted' }, '外部要因や交絡要因'), bulletList(e.confounders, '未評価'),
            h('p', { class: 'small muted' }, '判断できること'), bulletList(e.canConclude, '未評価'),
            h('p', { class: 'small muted' }, '判断できないこと'), bulletList(e.cannotConclude, '未評価'))),
        e.decision !== 'undecided' ? h('p', { class: 'item-sub' }, kindLabel('decision'), ` ${labelOf(EXPERIMENT_DECISIONS, e.decision)}${e.decisionReason ? `：${e.decisionReason}` : ''}`) : null,
        e.nextVerification.length ? [h('p', { class: 'small muted' }, '次に検証すべきこと'), bulletList(e.nextVerification)] : null);
    }));
}

function runVerificationAi(ctx, bundle, plan) {
  runAgentFlow(ctx, {
    agent: 'verification',
    bundle,
    options: { planId: plan.id },
    check: () => {
      const metrics = bundle.metricDefinitions.filter((m) => !m.planId || m.planId === plan.id);
      return {
        blockers: metrics.length ? [] : ['この計画の指標（「成果の階層と指標」で定義）'],
        warnings: [
          ...(bundle.metricObservations.some((o) => o.phase === 'after') ? [] : ['実施後の測定結果がありません。「判断できない」という結果になる可能性が高いです']),
          ...(successDefinitionGaps(bundle.initiative).length ? ['施策実施前の成功条件に未定義の項目があります'] : []),
        ],
      };
    },
    renderResult: (r) => {
      const apply = h('input', { type: 'checkbox', class: 'checkbox', checked: true });
      const DETECTED = { yes: ['変化あり', 'green'], no: ['変化なし', 'gray'], mixed: ['一部で変化', 'amber'], insufficient_data: ['データ不足で判断できない', 'amber'] };
      const [dl, dt] = DETECTED[r.changeDetected] || ['不明', 'gray'];
      return {
        node: h('div', { class: 'ai-result' },
          h('p', { class: 'prose' }, r.summary), h('p', {}, badge(dl, dt)),
          h('div', { class: 'grid-2 eval-grid' },
            h('div', { class: 'eval-box eval-effect' }, h('h4', {}, '効果'),
              h('p', { class: 'small muted' }, '実施状況'), h('p', {}, r.implementationStatus),
              h('p', { class: 'small muted' }, '期待していた変化'), bulletList(r.expectedChanges),
              h('p', { class: 'small muted' }, '観測された変化'), bulletList(r.observedChanges),
              h('p', { class: 'small muted' }, '支持する情報'), bulletList(r.supportingEvidence, 'なし'),
              h('p', { class: 'small muted' }, '反する情報'), bulletList(r.contradictingEvidence, 'なし')),
            h('div', { class: 'eval-box eval-uncertainty' }, h('h4', {}, '因果の不確実性'),
              h('p', { class: 'small muted' }, '交絡要因'), bulletList(r.confounders, 'なし'),
              h('p', { class: 'small muted' }, '判断できること'), bulletList(r.canConclude, 'なし'),
              h('p', { class: 'small muted' }, '判断できないこと'), bulletList(r.cannotConclude, 'なし'))),
          h('h3', { class: 'subhead' }, '継続・修正・中止の選択肢（判断はあなたが行います）'),
          h('ul', { class: 'bullets' }, r.options.map((o) => h('li', {}, h('strong', {}, labelOf(EXPERIMENT_DECISIONS, o.option)), `：${o.rationale}`))),
          h('h3', { class: 'subhead' }, '次に検証すべきこと'), bulletList(r.nextVerification, 'なし'),
          r.limitations.length ? [h('h3', { class: 'subhead' }, '限界'), bulletList(r.limitations)] : null,
          h('label', { class: 'check' }, apply, h('span', {}, 'この内容を効果検証欄に反映する（判断は「未判断」のまま。反映後に編集できます）'))),
        collect: () => ({ apply: apply.checked }),
      };
    },
    onSave: async ({ result, warnings, selection, mode, model, note }) => {
      const items = [{ store: 'aiAnalyses', record: { initiativeId: bundle.initiative.id, agent: 'verification', mode, model, result, warnings, userNote: note, reviewedByUser: true } }];
      if (selection.apply) {
        const draft = toEvaluationDraft(result);
        items.push({ store: 'experimentPlans', record: { ...plan, evaluation: { ...draft, decision: plan.evaluation.decision, decisionReason: plan.evaluation.decisionReason } } });
      }
      await ctx.repo.saveMany(items);
      await ctx.repo.touch(bundle.initiative.id);
      return selection.apply ? '効果検証欄に反映しました。内容を確認し、継続・修正・中止を判断してください' : '分析結果を保存しました';
    },
  });
}
