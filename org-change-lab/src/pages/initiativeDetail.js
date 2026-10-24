// SCR-02 変革案件詳細（概要タブと、各タブへの振り分け）・新規作成
import { STATUSES, CONFIRM_STATUSES, DECISION_TYPES, labelOf } from '../constants.js';
import { suggestNextActions, successDefinitionGaps, validateInitiative, INITIATIVE_REQUIRED } from '../domain/initiative.js';
import { AGENT_LABELS } from '../domain/analysis.js';
import { today } from '../domain/common.js';
import { h, fmtDate, download, safeFileName } from '../components/dom.js';
import {
  statusBadge, kindLabel, badge, button, toast, formModal, confirmDialog, openModal,
  renderFields, readForm, showErrors, bulletList, definitionList, emptyState,
} from '../components/ui.js';
import { ValidationError } from '../repositories/repository.js';
import { buildExport, toMarkdown } from '../services/exportService.js';
import { renderAnalysisTab } from './analysis.js';
import { renderInterventionsTab } from './interventions.js';
import { renderStakeholdersTab } from './stakeholders.js';
import { renderExperimentTab } from './experiment.js';
import { renderLearningTab } from './learning.js';

export const TABS = [
  { key: 'overview', label: '概要' },
  { key: 'analysis', label: '課題分析' },
  { key: 'interventions', label: '介入案' },
  { key: 'stakeholders', label: '関係者・合意' },
  { key: 'execution', label: '実行・検証' },
  { key: 'learning', label: '学習記録' },
];

export function initiativeDefs({ isNew = false } = {}) {
  return [
    { name: 'title', label: '案件名', required: true, placeholder: '例：CRMチームの自律性向上', wide: true },
    { name: 'problemStatement', label: '解決したい問題', type: 'textarea', required: true, wide: true, help: '観測できる状態で書くと、後で検証しやすくなります。', placeholder: '例：CRMチームが施策の実装を中心に動いており、顧客課題を起点とする改善提案が少ない。' },
    { name: 'desiredState', label: '期待する状態', type: 'textarea', required: true, wide: true, placeholder: '例：メンバーが課題仮説・成功指標・改善案を提案し、チームで優先順位を議論できる。' },
    { name: 'scope', label: '対象となるチーム・領域', required: true, help: '複数ある場合は「、」かカンマで区切ります。', placeholder: '例：CRM、マーケティング' },
    { name: 'businessContext', label: '事業・プロダクトとの関係', required: true, placeholder: '例：求職者CRMの価値向上' },
    { name: 'startDate', label: '開始日', type: 'date', required: true },
    { name: 'targetEndDate', label: '目標とする終了時期（任意）', type: 'date' },
    ...(isNew ? [] : [{ name: 'targetReviewDate', label: '次の見直し日（任意）', type: 'date' }]),
    { name: 'background', label: '背景（任意）', type: 'textarea', wide: true },
    { name: 'references', label: '参考資料（任意・1行に1つ）', type: 'list', wide: true, rows: 2 },
  ];
}

// 新規案件作成
export async function renderNewInitiative(view, ctx) {
  const defs = initiativeDefs({ isNew: true });
  const form = h('form', { class: 'form card', novalidate: true });
  const banner = h('div', { class: 'form-banner', role: 'alert', hidden: true });
  form.append(
    h('nav', { class: 'breadcrumb', 'aria-label': 'パンくず' }, h('a', { href: '#/' }, 'ホーム'), ' › 新しい変革案件'),
    h('h1', {}, '新しい変革案件'),
    h('p', { class: 'muted' }, '1つの組織課題を1つの案件として登録します。最初は分かる範囲で構いません。登録後に「課題分析」で事実と仮説を整理します。'),
    banner,
    renderFields(defs, { startDate: today() }),
    h('div', { class: 'row gap end' },
      h('a', { class: 'btn', href: '#/' }, 'キャンセル'),
      h('button', { class: 'btn btn-primary', type: 'submit' }, '登録して課題分析へ進む')));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    banner.hidden = true;
    const values = readForm(form, defs);
    const errors = validateInitiative({ ...values, scope: String(values.scope || '').split(/[,、]/).filter((s) => s.trim()) });
    if (showErrors(form, errors)) return;
    try {
      const saved = await ctx.svc.create(values);
      toast('変革案件を登録しました');
      ctx.navigate(`/i/${saved.id}/analysis`);
    } catch (err) {
      if (err instanceof ValidationError) showErrors(form, err.errors);
      else { banner.textContent = `保存に失敗しました。入力内容は残っています。もう一度お試しください（${err.message}）`; banner.hidden = false; }
    }
  });
  view.append(form);
}

export async function renderInitiative(view, ctx, params) {
  const bundle = await ctx.repo.loadBundle(params.id);
  if (!bundle) {
    view.append(h('div', { class: 'card' }, h('h1', {}, '案件が見つかりません'), h('p', {}, '削除されたか、別のブラウザで作成された可能性があります。'), h('a', { class: 'btn', href: '#/' }, 'ホームへ戻る')));
    return;
  }
  const tab = TABS.some((t) => t.key === params.tab) ? params.tab : 'overview';
  const i = bundle.initiative;
  view.append(header(ctx, bundle));
  view.append(h('nav', { class: 'tabs', 'aria-label': '案件のタブ' },
    TABS.map((t) => h('a', { href: `#/i/${i.id}/${t.key}`, class: 'tab', 'aria-current': t.key === tab ? 'page' : null }, t.label, tabCount(t.key, bundle)))));
  const body = h('div', { class: 'tab-body' });
  view.append(body);
  const renderers = {
    overview: renderOverview,
    analysis: renderAnalysisTab,
    interventions: renderInterventionsTab,
    stakeholders: renderStakeholdersTab,
    execution: renderExperimentTab,
    learning: renderLearningTab,
  };
  await renderers[tab](body, ctx, bundle);
}

function tabCount(key, b) {
  const n = { analysis: b.observations.length + b.hypotheses.length, interventions: b.interventions.length, stakeholders: b.stakeholders.length, execution: b.experimentPlans.length + b.metricDefinitions.length, learning: b.learningRecords.length }[key];
  return n ? h('span', { class: 'tab-count', 'aria-label': `${n}件` }, String(n)) : null;
}

function header(ctx, bundle) {
  const i = bundle.initiative;
  const statusSelect = h('select', { class: 'input input-inline', 'aria-label': 'ステータス' }, STATUSES.map((s) => h('option', { value: s.value, selected: s.value === i.status }, s.label)));
  statusSelect.addEventListener('change', () => changeStatus(ctx, bundle, statusSelect.value, () => { statusSelect.value = i.status; }));
  const menu = h('div', { class: 'row gap wrap' },
    button('編集', () => editInitiative(ctx, bundle), 'small'),
    button('複製', async () => {
      try { const id = await ctx.svc.duplicate(bundle); toast('案件を複製しました'); ctx.navigate(`/i/${id}`); } catch (e) { toast(`複製に失敗しました：${e.message}`, 'error'); }
    }, 'small'),
    button(i.archived ? 'アーカイブを解除' : 'アーカイブ', async () => {
      try { await ctx.svc.setArchived(i, !i.archived); toast(i.archived ? 'アーカイブを解除しました' : 'アーカイブしました（ホームの「完了・保留・中止・アーカイブ」に移動）'); ctx.rerender(); } catch (e) { toast(`保存に失敗しました：${e.message}`, 'error'); }
    }, 'small'),
    button('JSONエクスポート', () => {
      download(`org-change-lab_${safeFileName(i.title)}_${today()}.json`, JSON.stringify(buildExport([bundle]), null, 2), 'application/json');
      toast('JSONを書き出しました');
    }, 'small'),
    button('Markdownレポート', () => showMarkdown(bundle), 'small'),
    button('案件を削除', () => deleteInitiative(ctx, bundle), 'small btn-danger-outline'));
  return h('header', { class: 'page-head' },
    h('nav', { class: 'breadcrumb', 'aria-label': 'パンくず' }, h('a', { href: '#/' }, 'ホーム'), ` › ${i.title}`),
    h('div', { class: 'page-head-main' },
      h('div', {},
        h('h1', { class: 'page-title' }, i.title),
        h('div', { class: 'row gap wrap' },
          statusBadge(i.status, labelOf(STATUSES, i.status)),
          h('label', { class: 'small muted' }, 'ステータス変更：', statusSelect),
          i.isSample ? badge('サンプル（実績値ではありません）', 'gray') : null,
          i.archived ? badge('アーカイブ済み', 'gray') : null,
          h('span', { class: 'small muted' }, `最終更新：${fmtDate(i.updatedAt)}`))),
      menu));
}

async function changeStatus(ctx, bundle, status, revert) {
  const i = bundle.initiative;
  if (status === i.status) return;
  const notes = [];
  if (['running', 'verification'].includes(status)) {
    const gaps = successDefinitionGaps(i);
    if (gaps.length) notes.push(h('div', { class: 'alert alert-warning' }, h('p', { class: 'alert-title' }, '施策実施前の成功条件が未定義です'), h('p', {}, gaps.map((g) => g.label).join('、')), h('p', { class: 'small' }, '実施後に都合のよい指標を選ばないよう、先に「実行・検証」タブで定義することを推奨します。')));
    if (!i.successDefinitionLockedAt) notes.push(h('p', { class: 'small' }, 'この変更で成功条件が固定され、以降の変更は理由とともに意思決定記録に残ります。'));
  }
  if (status === 'completed' && !bundle.learningRecords.length) notes.push(h('div', { class: 'alert alert-warning' }, h('p', {}, '学習記録がまだありません。完了前に学びを記録することを推奨します。')));
  if (CONFIRM_STATUSES.includes(status)) notes.push(h('p', {}, `「${labelOf(STATUSES, status)}」に変更します。この判断は意思決定記録に残ります。`));
  formModal({
    title: `ステータスを「${labelOf(STATUSES, status)}」に変更`,
    intro: h('div', {}, ...notes),
    defs: [{ name: 'reason', label: CONFIRM_STATUSES.includes(status) ? '変更の理由' : '変更の理由（任意）', type: 'textarea', rows: 2, required: CONFIRM_STATUSES.includes(status) }],
    submitLabel: '変更する',
    // キャンセル時はセレクトを元に戻す
    onClose: (saved) => { if (!saved) revert(); },
    onSubmit: async (v) => {
      await ctx.svc.changeStatus(i, status, v.reason);
      toast(`ステータスを「${labelOf(STATUSES, status)}」に変更しました`);
      ctx.rerender();
    },
  });
}

function editInitiative(ctx, bundle) {
  formModal({
    title: '案件の編集',
    defs: initiativeDefs(),
    values: { ...bundle.initiative, scope: bundle.initiative.scope.join('、') },
    size: 'lg',
    onSubmit: async (v) => {
      await ctx.svc.update(bundle.initiative, v);
      toast('保存しました');
      ctx.rerender();
    },
  });
}

async function deleteInitiative(ctx, bundle) {
  const i = bundle.initiative;
  const related = ['observations', 'hypotheses', 'interventions', 'experimentPlans', 'metricDefinitions', 'metricObservations', 'stakeholders', 'decisionRecords', 'learningRecords', 'aiAnalyses'].reduce((n, s) => n + bundle[s].length, 0);
  const ok = await confirmDialog({
    title: '案件を削除しますか？',
    message: [`「${i.title}」と関連データ ${related} 件（事実・仮説・介入案・計画・指標・学びなど）をすべて削除します。この操作は元に戻せません。`, '必要であれば、先に「JSONエクスポート」でバックアップを取ってください。'],
    confirmLabel: '削除する',
    danger: true,
    requireText: '削除',
  });
  if (!ok) return;
  try {
    await ctx.svc.remove(i.id);
    toast('案件を削除しました');
    ctx.navigate('/');
  } catch (e) {
    toast(`削除に失敗しました：${e.message}`, 'error');
  }
}

function showMarkdown(bundle) {
  const md = toMarkdown(bundle);
  const area = h('textarea', { class: 'input code', rows: 18, readonly: true, 'aria-label': 'Markdownレポート' }, md);
  openModal({
    title: 'Markdownレポート',
    size: 'lg',
    body: h('div', {}, h('p', { class: 'muted small' }, '未入力の項目は「未評価」「未確認」と表示し、AIによる推測で補完していません。'), area),
    actions: [
      { label: 'コピー', onClick: async () => { try { await navigator.clipboard.writeText(md); toast('コピーしました'); } catch { area.select(); toast('選択しました。Ctrl+C でコピーしてください', 'info'); } } },
      { label: 'ダウンロード（.md）', kind: 'primary', onClick: () => { download(`${safeFileName(bundle.initiative.title)}_${today()}.md`, md, 'text/markdown'); toast('Markdownを書き出しました'); } },
    ],
  });
}

// ---------- 概要タブ ----------

async function renderOverview(body, ctx, bundle) {
  const i = bundle.initiative;
  const missing = Object.keys(validateInitiative(i));
  const status = STATUSES.find((s) => s.value === i.status);

  if (missing.length) {
    body.append(h('div', { class: 'alert alert-warning' }, h('p', { class: 'alert-title' }, '必須情報が未入力です'),
      h('p', {}, missing.map((k) => INITIATIVE_REQUIRED[k]).join('、')), button('編集する', () => editInitiative(ctx, bundle), 'small')));
  }

  body.append(h('div', { class: 'grid-2' },
    h('section', { class: 'card' },
      h('h2', { class: 'card-title' }, '解決したい問題'), h('p', { class: 'prose' }, i.problemStatement || '未入力'),
      h('h2', { class: 'card-title' }, '期待する状態'), h('p', { class: 'prose' }, i.desiredState || '未入力'),
      definitionList([
        ['対象', i.scope.join('、')],
        ['事業・プロダクトとの関係', i.businessContext],
        ['開始日', i.startDate],
        ['目標とする終了時期', i.targetEndDate],
        ['次の見直し日', i.targetReviewDate],
      ])),
    h('div', { class: 'stack' },
      h('section', { class: 'card' },
        h('h2', { class: 'card-title' }, '現在のフェーズ'),
        h('p', {}, statusBadge(i.status, status.label), ' ', h('span', { class: 'muted' }, status.desc))),
      nextActionCard(ctx, bundle),
      openQuestionsCard(ctx, bundle))));

  body.append(progressCard(bundle));

  body.append(h('div', { class: 'row gap wrap' },
    h('a', { class: 'btn btn-primary', href: `#/i/${i.id}/analysis` }, 'AIで分析を支援（課題分析へ）'),
    button('次の行動を設定', () => setNextAction(ctx, bundle))));

  body.append(decisionLog(ctx, bundle));
  body.append(analysisHistory(ctx, bundle));

  if (i.background || i.references.length) {
    body.append(h('section', { class: 'card' }, h('h2', { class: 'card-title' }, '背景・参考資料'),
      i.background ? h('p', { class: 'prose' }, i.background) : null, bulletList(i.references, '参考資料なし')));
  }
}

function nextActionCard(ctx, bundle) {
  const i = bundle.initiative;
  const suggestions = suggestNextActions(bundle);
  return h('section', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', { class: 'card-title' }, '次の行動'), button(i.nextAction ? '変更' : '設定', () => setNextAction(ctx, bundle), 'small')),
    i.nextAction
      ? h('p', { class: 'next-action' }, kindLabel('decision', i.nextActionSource === 'ai' ? '決定（AI提案を採用）' : '決定'), ' ', i.nextAction)
      : h('p', { class: 'muted' }, 'まだ設定されていません。下の候補から選ぶか、自分で設定してください。'),
    h('details', { open: !i.nextAction }, h('summary', { class: 'small' }, `現在の状況から考えられる候補（${suggestions.length}）`),
      h('ul', { class: 'suggestions' }, suggestions.map((s) => h('li', {},
        h('div', {}, h('strong', {}, s.text), s.reason ? h('p', { class: 'small muted' }, s.reason) : null),
        h('div', { class: 'row gap' },
          button('これにする', async () => {
            try { await ctx.svc.setNextAction(i, s.text, 'user'); toast('次の行動を設定しました'); ctx.rerender(); } catch (e) { toast(`保存に失敗しました：${e.message}`, 'error'); }
          }, 'small'),
          s.tab && s.tab !== 'overview' ? h('a', { class: 'btn btn-small btn-ghost', href: `#/i/${i.id}/${s.tab}` }, '移動') : null))))));
}

function setNextAction(ctx, bundle) {
  formModal({
    title: '次の行動を設定',
    defs: [{ name: 'nextAction', label: '次に取るべき行動', type: 'textarea', rows: 2, help: '空にすると未設定に戻ります。', placeholder: '例：過去3施策の企画・着手・振り返り記録を比較する' }],
    values: { nextAction: bundle.initiative.nextAction || '' },
    onSubmit: async (v) => {
      await ctx.svc.setNextAction(bundle.initiative, v.nextAction.trim(), 'user');
      toast('次の行動を保存しました');
      ctx.rerender();
    },
  });
}

function openQuestionsCard(ctx, bundle) {
  const i = bundle.initiative;
  const fromHyps = bundle.hypotheses.filter((x) => ['unverified', 'testing'].includes(x.status)).flatMap((x) => x.missingInformation.map((m) => `${m}（仮説「${x.title}」）`));
  return h('section', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', { class: 'card-title' }, '未解決の論点'),
      button('編集', () => formModal({
        title: '未解決の論点',
        defs: [{ name: 'openQuestions', label: '論点（1行に1つ）', type: 'list', rows: 6 }],
        values: i,
        onSubmit: async (v) => { await ctx.svc.update(i, v); toast('保存しました'); ctx.rerender(); },
      }), 'small')),
    bulletList(i.openQuestions, '登録された論点はありません'),
    fromHyps.length ? h('details', {}, h('summary', { class: 'small' }, `仮説の不足情報（${fromHyps.length}）`), bulletList(fromHyps)) : null);
}

function progressCard(bundle) {
  const b = bundle;
  const supported = b.hypotheses.filter((x) => x.status === 'supported').length;
  const adopted = b.interventions.filter((x) => x.status === 'adopted').length;
  const after = b.metricObservations.filter((x) => x.phase === 'after').length;
  const sdGaps = successDefinitionGaps(b.initiative).length;
  const steps = [
    { label: '問題と根拠', value: `事実 ${b.observations.length} 件`, done: b.observations.length > 0, tab: 'analysis' },
    { label: '原因仮説', value: `${b.hypotheses.length} 件（支持 ${supported}）`, done: b.hypotheses.length >= 2, tab: 'analysis' },
    { label: '介入案の比較', value: `${b.interventions.length} 案（採用 ${adopted}）`, done: adopted > 0, tab: 'interventions' },
    { label: '関係者・合意', value: `関係者 ${b.stakeholders.length}`, done: b.stakeholders.length > 0, tab: 'stakeholders' },
    { label: '成功条件・計画', value: `計画 ${b.experimentPlans.length}／成功条件 未定義 ${sdGaps}`, done: b.experimentPlans.length > 0 && sdGaps === 0, tab: 'execution' },
    { label: '効果検証', value: `指標 ${b.metricDefinitions.length}／実施後の記録 ${after}`, done: after > 0, tab: 'execution' },
    { label: '学び', value: `${b.learningRecords.length} 件`, done: b.learningRecords.length > 0, tab: 'learning' },
  ];
  return h('section', { class: 'card' }, h('h2', { class: 'card-title' }, '変革サイクルの進み具合'),
    h('ol', { class: 'cycle' }, steps.map((s) => h('li', { class: ['cycle-step', s.done ? 'is-done' : ''] },
      h('span', { class: 'cycle-mark', 'aria-hidden': 'true' }, s.done ? '✓' : '○'),
      h('a', { href: `#/i/${b.initiative.id}/${s.tab}` }, s.label),
      h('span', { class: 'small muted' }, s.value),
      h('span', { class: 'sr-only' }, s.done ? '（記録あり）' : '（未着手）')))),
    h('p', { class: 'small muted' }, '順番どおりに進める必要はありません。状況に応じて分析に戻ったり、施策を修正したりできます。'));
}

function decisionLog(ctx, bundle) {
  const rows = [...bundle.decisionRecords].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const addBtn = button('判断を記録', () => formModal({
    title: '意思決定を記録',
    defs: [
      { name: 'type', label: '種類', type: 'select', options: DECISION_TYPES },
      { name: 'title', label: '何についての判断か', required: true },
      { name: 'decision', label: '判断内容', type: 'textarea', required: true },
      { name: 'reason', label: '理由', type: 'textarea' },
      { name: 'alternatives', label: '検討した他の選択肢（1行に1つ）', type: 'list' },
      { name: 'decidedBy', label: '決めた人・場（役割名）', placeholder: 'EM（本人）' },
      { name: 'decidedAt', label: '日付', type: 'date' },
    ],
    values: { type: 'other', decidedAt: today() },
    onSubmit: async (v) => { await ctx.svc.saveChild('decisionRecords', { ...v, initiativeId: bundle.initiative.id }); toast('意思決定を記録しました'); ctx.rerender(); },
  }), 'small');
  return h('section', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', { class: 'card-title' }, `意思決定の記録（${rows.length}）`), addBtn),
    rows.length ? h('ol', { class: 'timeline' }, rows.slice(0, 30).map((d) => h('li', {},
      h('div', { class: 'row gap wrap' }, kindLabel('decision'), h('strong', {}, d.title), badge(labelOf(DECISION_TYPES, d.type), 'gray'), h('span', { class: 'small muted' }, d.decidedAt)),
      h('p', { class: 'prose' }, d.decision),
      d.reason ? h('p', { class: 'small' }, `理由：${d.reason}`) : null,
      d.alternatives.length ? h('details', {}, h('summary', { class: 'small' }, '他の選択肢'), bulletList(d.alternatives)) : null)))
      : emptyState('まだ判断の記録はありません。ステータス変更・仮説の判断・介入案の採否は自動で記録されます。'));
}

function analysisHistory(ctx, bundle) {
  const rows = [...bundle.aiAnalyses].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  if (!rows.length) return '';
  return h('details', { class: 'card' },
    h('summary', { class: 'card-title' }, `AI分析の履歴（${rows.length}）`),
    h('ul', { class: 'plain-list' }, rows.map((r) => h('li', { class: 'row space wrap' },
      h('span', {}, kindLabel('ai'), ' ', AGENT_LABELS[r.agent] || r.agent, h('span', { class: 'small muted' }, ` ${fmtDate(r.createdAt)}／${r.mode === 'backend' ? 'API' : 'コピー＆ペースト'}${r.model ? `／${r.model}` : ''}`)),
      h('span', { class: 'row gap' },
        button('表示', () => openModal({ title: AGENT_LABELS[r.agent] || 'AI分析', size: 'lg', body: h('div', {}, r.userNote ? h('p', {}, `メモ：${r.userNote}`) : null, r.warnings.length ? bulletList(r.warnings) : null, h('pre', { class: 'code' }, JSON.stringify(r.result, null, 2))) }), 'small'),
        button('削除', async () => {
          if (!(await confirmDialog({ title: 'AI分析結果を削除しますか？', message: 'この分析結果の記録を削除します。採用済みの仮説や介入案は削除されません。', confirmLabel: '削除する', danger: true }))) return;
          await ctx.svc.removeChild('aiAnalyses', r); toast('削除しました'); ctx.rerender();
        }, 'small btn-ghost'))))));
}
