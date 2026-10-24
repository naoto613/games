// SCR-04 介入案比較：複数の案を比べ、採用・保留・却下を判断する
import { INTERVENTION_CATEGORIES, INTERVENTION_STATUSES, LEVEL3, SCALES, RATING_AXES, HYPOTHESIS_STATUSES, labelOf } from '../constants.js';
import { interventionGaps, axisScore, normalizeIntervention } from '../domain/intervention.js';
import { h } from '../components/dom.js';
import { kindLabel, badge, button, toast, formModal, confirmDialog, bulletList, emptyState, openModal, renderFields, readForm } from '../components/ui.js';
import { runAgentFlow, selectableItem } from '../components/aiRunner.js';
import { toInterventionDrafts } from '../ai/agents.js';

const STATUS_TONE = { proposed: 'blue', adopted: 'green', on_hold: 'amber', rejected: 'gray' };
const LEVEL_TONE = (axis, v) => {
  if (v === 'unknown') return 'gray';
  const good = RATING_AXES.find((a) => a.key === axis).good;
  if (v === 'medium') return 'amber';
  return v === good ? 'green' : 'red';
};

// 画面の表示状態（再描画をまたいで保持）
const viewState = { mode: null, sort: null, filter: '' };

function interventionDefs(bundle) {
  return [
    { name: 'title', label: '施策名（何を変えるか）', required: true, wide: true },
    { name: 'category', label: 'カテゴリ', type: 'select', options: INTERVENTION_CATEGORIES, placeholderOption: '（選択）' },
    { name: 'scale', label: '規模', type: 'select', options: SCALES },
    { name: 'description', label: '具体的な実施内容', type: 'textarea', wide: true },
    { name: 'targetHypothesisIds', label: '対象仮説（どの原因仮説に対応するか）', type: 'checkboxes', wide: true, options: bundle.hypotheses.map((x, k) => ({ value: x.id, label: `H${k + 1}：${x.title}（${labelOf(HYPOTHESIS_STATUSES, x.status)}）` })), emptyText: '原因仮説がまだありません（課題分析タブで登録できます）' },
    { name: 'expectedBehaviorChange', label: '期待する行動変化（現場でどの行動が変わるか）', type: 'textarea', required: true, wide: true },
    { name: 'expectedOutcomes', label: '期待する成果（開発・プロダクト・事業への影響。1行に1つ）', type: 'list' },
    { name: 'shortTermEffect', label: '短期効果', type: 'textarea', rows: 2 },
    { name: 'longTermEffect', label: '長期的な組織能力への影響', type: 'textarea', rows: 2 },
    { name: 'costEstimate', label: '実施コスト（時間・工数・調整負荷）', type: 'select', options: LEVEL3 },
    { name: 'requiredCooperation', label: '必要な協力（合意が必要な関係者。1行に1つ）', type: 'list', rows: 2 },
    { name: 'risks', label: '想定リスク（副作用・新たな負担。1行に1つ）', type: 'list', rows: 2 },
    { name: 'reversibility', label: '可逆性（元に戻せるか）', type: 'select', options: LEVEL3 },
    { name: 'verificationPlan', label: '検証方法（効果をどう確認するか）', type: 'textarea', rows: 2 },
    { name: 'stopConditions', label: '中止条件（どのような場合に停止・修正するか。1行に1つ）', type: 'list', rows: 2 },
    { section: '比較の評価（根拠が不足していれば「不明」）' },
    ...RATING_AXES.map((a) => ({ name: `ratings.${a.key}`, label: `${a.label}${a.good === 'low' ? '（低いほど望ましい）' : ''}`, type: 'select', options: LEVEL3 })),
  ];
}

function editIntervention(ctx, bundle, iv = null) {
  formModal({
    title: iv ? '介入案を編集' : '介入案を追加',
    defs: interventionDefs(bundle),
    values: iv || { costEstimate: 'unknown', reversibility: 'unknown', scale: 'unknown', ratings: {} },
    size: 'lg',
    onSubmit: async (v) => {
      await ctx.svc.saveChild('interventions', { ...(iv || {}), ...v, category: v.category || null, initiativeId: bundle.initiative.id });
      toast(iv ? '介入案を更新しました' : '介入案を追加しました');
      ctx.rerender();
    },
  });
}

function decide(ctx, bundle, iv, status) {
  const label = labelOf(INTERVENTION_STATUSES, status);
  const others = bundle.interventions.filter((o) => o.id !== iv.id);
  const gaps = interventionGaps(iv);
  formModal({
    title: `「${iv.title}」を${label}`,
    intro: h('div', {},
      status === 'adopted' && gaps.length ? h('div', { class: 'alert alert-warning' }, h('p', {}, `未定義の項目があります：${gaps.join('、')}。採用後に「編集」で補うこともできます。`)) : null,
      others.length ? h('p', { class: 'small muted' }, `他の案（${others.map((o) => `${o.title}：${labelOf(INTERVENTION_STATUSES, o.status)}`).join('、')}）の状態も意思決定記録に残ります。`) : null),
    defs: [{
      name: 'reason',
      label: status === 'adopted' ? '採用理由（入力を推奨）' : `${label}の理由（任意）`,
      type: 'textarea',
      help: status === 'adopted' ? 'なぜ他の案ではなくこの案なのか。後で振り返るときの手がかりになります。' : '採用しなかった理由も、次の判断に役立ちます。',
    }],
    values: { reason: iv.decisionReason || '' },
    submitLabel: `${label}する`,
    onSubmit: async (v) => {
      await ctx.svc.decideIntervention(bundle, iv, status, v.reason.trim());
      toast(`「${iv.title}」を${label}にしました`);
      ctx.rerender();
      if (status === 'adopted') {
        // フォームが閉じてから確認を出す
        setTimeout(async () => {
          const go = await confirmDialog({ title: '実行計画を作成しますか？', message: '採用した介入案の実行計画（実施範囲・責任者・成功条件・中止条件）を作成します。', confirmLabel: '実行計画を作成' });
          if (!go) return;
          ctx.pendingAction = { type: 'newPlan', interventionId: iv.id };
          ctx.navigate(`/i/${bundle.initiative.id}/execution`);
        }, 0);
      }
    },
  });
}

function actionButtons(ctx, bundle, iv) {
  return h('div', { class: 'row gap wrap' },
    iv.status !== 'adopted' ? button('採用', () => decide(ctx, bundle, iv, 'adopted'), 'small btn-primary') : null,
    iv.status !== 'on_hold' ? button('保留', () => decide(ctx, bundle, iv, 'on_hold'), 'small') : null,
    iv.status !== 'rejected' ? button('却下', () => decide(ctx, bundle, iv, 'rejected'), 'small') : null,
    button('編集', () => editIntervention(ctx, bundle, iv), 'small btn-ghost'),
    button('削除', async () => {
      const plans = bundle.experimentPlans.filter((p) => p.interventionId === iv.id);
      const ok = await confirmDialog({ title: '介入案を削除しますか？', message: plans.length ? `この介入案に紐づく実行計画が ${plans.length} 件あります（計画は残り、紐づけが外れます）。` : 'この操作は元に戻せません。却下として記録を残す方法もあります。', confirmLabel: '削除する', danger: true });
      if (!ok) return;
      await ctx.svc.removeChild('interventions', iv);
      for (const p of plans) await ctx.svc.saveChild('experimentPlans', { ...p, interventionId: null });
      toast('削除しました');
      ctx.rerender();
    }, 'small btn-ghost'));
}

export async function renderInterventionsTab(body, ctx, bundle) {
  if (!viewState.mode) viewState.mode = window.matchMedia('(min-width: 900px)').matches ? 'table' : 'cards';
  const hypRef = new Map(bundle.hypotheses.map((x, k) => [x.id, `H${k + 1}`]));
  const hypTitle = (id) => `${hypRef.get(id)}：${bundle.hypotheses.find((x) => x.id === id)?.title || ''}`;
  let rows = bundle.interventions.filter((v) => !viewState.filter || v.status === viewState.filter);
  if (viewState.sort) rows = [...rows].sort((a, b) => axisScore(b, viewState.sort) - axisScore(a, viewState.sort));

  body.append(h('section', { class: 'card' },
    h('div', { class: 'card-head' },
      h('h2', { class: 'card-title' }, `介入案の比較（${bundle.interventions.length}）`),
      h('div', { class: 'row gap wrap' },
        ctx.settings.aiMode !== 'off' ? button('✦ AIで介入案を生成（Agent C）', () => startInterventionAi(ctx, bundle)) : null,
        button('＋ 介入案を追加', () => editIntervention(ctx, bundle), 'primary small'))),
    h('p', { class: 'small muted' }, '小さく試せる案と構造を大きく変える案、短期効果と長期的な組織能力への影響を分けて比べます。根拠が不足している評価は「不明」のままにします。'),
    bundle.interventions.length ? toolbar(ctx) : null,
    !bundle.interventions.length
      ? emptyState('まだ介入案がありません。性質の異なる2〜3案を並べて比べると、判断の根拠が残ります。', button('介入案を追加', () => editIntervention(ctx, bundle), 'primary'))
      : rows.length === 0 ? h('p', { class: 'muted' }, 'この条件に合う介入案はありません。')
        : viewState.mode === 'table' ? compareTable(ctx, bundle, rows, hypTitle) : cardsView(ctx, bundle, rows, hypTitle),
    bundle.interventions.length === 1 ? h('p', { class: 'alert alert-info small' }, '比較のため、性質の異なる案をもう1つ以上追加することを推奨します。') : null));

  const decisions = bundle.decisionRecords.filter((d) => d.type === 'intervention_decision').reverse();
  body.append(h('section', { class: 'card' }, h('h2', { class: 'card-title' }, `採否の記録（${decisions.length}）`),
    decisions.length ? h('ol', { class: 'timeline' }, decisions.map((d) => h('li', {},
      h('div', { class: 'row gap wrap' }, kindLabel('decision'), h('strong', {}, `${d.title}：${d.decision}`), h('span', { class: 'small muted' }, d.decidedAt)),
      d.reason ? h('p', { class: 'small' }, `理由：${d.reason}`) : h('p', { class: 'small muted' }, '理由の記録なし'),
      d.alternatives.length ? h('details', {}, h('summary', { class: 'small' }, '判断時の他の案'), bulletList(d.alternatives)) : null)))
      : h('p', { class: 'muted small' }, '採用・保留・却下を選ぶと、理由とともにここに記録されます。')));
}

function toolbar(ctx) {
  const toggle = (mode, label) => h('button', { type: 'button', class: 'seg', 'aria-pressed': String(viewState.mode === mode), onClick: () => { viewState.mode = mode; ctx.rerender(); } }, label);
  const sortBtn = (key, label) => h('button', { type: 'button', class: 'seg', 'aria-pressed': String(viewState.sort === key), onClick: () => { viewState.sort = viewState.sort === key ? null : key; ctx.rerender(); } }, label);
  const filter = h('select', { class: 'input input-inline', 'aria-label': '状態で絞り込む' }, h('option', { value: '' }, 'すべての状態'), INTERVENTION_STATUSES.map((s) => h('option', { value: s.value, selected: viewState.filter === s.value }, s.label)));
  filter.addEventListener('change', () => { viewState.filter = filter.value; ctx.rerender(); });
  return h('div', { class: 'toolbar' },
    h('div', { class: 'segmented', role: 'group', 'aria-label': '表示方法' }, toggle('table', '表で比較'), toggle('cards', 'カード')),
    h('div', { class: 'segmented', role: 'group', 'aria-label': '評価軸で並べ替え（望ましい順）' }, h('span', { class: 'small muted seg-label' }, '並べ替え：'), RATING_AXES.map((a) => sortBtn(a.key, a.label))),
    filter);
}

function ratingBadges(iv) {
  return h('div', { class: 'ratings' }, RATING_AXES.map((a) => badge(`${a.label}：${labelOf(LEVEL3, iv.ratings[a.key])}`, LEVEL_TONE(a.key, iv.ratings[a.key]))));
}

function compareTable(ctx, bundle, rows, hypTitle) {
  const line = (label, render) => h('tr', {}, h('th', { scope: 'row' }, label), rows.map((v) => h('td', {}, render(v))));
  const list = (arr) => bulletList(arr, '不明');
  const text = (s) => (s ? h('span', {}, s) : h('span', { class: 'muted' }, '不明'));
  return h('div', { class: 'table-scroll', tabindex: '0', role: 'region', 'aria-label': '介入案の比較表（横にスクロールできます）' },
    h('table', { class: 'table compare' },
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, '比較項目'), rows.map((v, k) => h('th', { scope: 'col' },
        h('span', { class: 'small muted' }, `案 ${String.fromCharCode(65 + k)}`), h('div', {}, v.title),
        h('div', { class: 'row gap wrap' }, badge(labelOf(INTERVENTION_STATUSES, v.status), STATUS_TONE[v.status]), v.origin === 'ai' ? kindLabel('ai', 'AI提案') : null))))),
      h('tbody', {},
        line('カテゴリ', (v) => text(labelOf(INTERVENTION_CATEGORIES, v.category, ''))),
        line('規模', (v) => text(v.scale === 'unknown' ? '' : labelOf(SCALES, v.scale))),
        line('対象仮説', (v) => list(v.targetHypothesisIds.map(hypTitle))),
        line('期待する行動変化', (v) => text(v.expectedBehaviorChange)),
        line('期待する成果', (v) => list(v.expectedOutcomes)),
        line('短期効果／長期影響', (v) => h('div', {}, h('p', { class: 'small' }, `短期：${v.shortTermEffect || '不明'}`), h('p', { class: 'small' }, `長期：${v.longTermEffect || '不明'}`))),
        line('実施コスト', (v) => text(labelOf(LEVEL3, v.costEstimate))),
        line('必要な協力', (v) => list(v.requiredCooperation)),
        line('想定リスク', (v) => list(v.risks)),
        line('可逆性', (v) => text(labelOf(LEVEL3, v.reversibility))),
        line('検証方法', (v) => text(v.verificationPlan)),
        line('中止条件', (v) => list(v.stopConditions)),
        line('評価', (v) => ratingBadges(v)),
        line('未定義の項目', (v) => { const g = interventionGaps(v); return g.length ? badge(g.join('・'), 'amber') : badge('揃っています', 'green'); }),
        line('判断理由', (v) => (v.decisionReason ? h('span', {}, kindLabel('decision'), ' ', v.decisionReason) : h('span', { class: 'muted' }, '—'))),
        line('操作', (v) => actionButtons(ctx, bundle, v)))));
}

function cardsView(ctx, bundle, rows, hypTitle) {
  return h('ul', { class: 'item-list' }, rows.map((v, k) => {
    const gaps = interventionGaps(v);
    return h('li', { class: 'item' },
      h('div', { class: 'item-head' }, h('span', { class: 'ref' }, `案 ${String.fromCharCode(65 + k)}`), badge(labelOf(INTERVENTION_STATUSES, v.status), STATUS_TONE[v.status]),
        v.category ? badge(labelOf(INTERVENTION_CATEGORIES, v.category), 'blue') : null, v.scale !== 'unknown' ? badge(labelOf(SCALES, v.scale), 'gray') : null,
        v.origin === 'ai' ? kindLabel('ai', 'AI提案') : null),
      h('p', { class: 'item-text' }, h('strong', {}, v.title)),
      v.description ? h('p', {}, v.description) : null,
      h('dl', { class: 'deflist' },
        h('dt', {}, '対象仮説'), h('dd', {}, v.targetHypothesisIds.map(hypTitle).join('、') || '不明'),
        h('dt', {}, '期待する行動変化'), h('dd', {}, v.expectedBehaviorChange || '不明'),
        h('dt', {}, '期待する成果'), h('dd', {}, v.expectedOutcomes.join('、') || '不明'),
        h('dt', {}, 'コスト／可逆性'), h('dd', {}, `${labelOf(LEVEL3, v.costEstimate)}／${labelOf(LEVEL3, v.reversibility)}`),
        h('dt', {}, '想定リスク'), h('dd', {}, v.risks.join('、') || '不明'),
        h('dt', {}, '検証方法'), h('dd', {}, v.verificationPlan || '不明'),
        h('dt', {}, '中止条件'), h('dd', {}, v.stopConditions.join('、') || '不明')),
      ratingBadges(v),
      gaps.length ? h('p', { class: 'small' }, badge(`未定義：${gaps.join('・')}`, 'amber')) : null,
      v.decisionReason ? h('p', { class: 'item-sub' }, kindLabel('decision'), ' ', v.decisionReason) : null,
      h('div', { class: 'item-actions' }, actionButtons(ctx, bundle, v)));
  }));
}

// ---------- Agent C ----------

function startInterventionAi(ctx, bundle) {
  if (!bundle.hypotheses.length) {
    toast('先に「課題分析」タブで原因仮説を登録してください', 'info');
    return;
  }
  const defs = [
    { name: 'hypothesisIds', label: '対象にする原因仮説', type: 'checkboxes', options: bundle.hypotheses.map((x, k) => ({ value: x.id, label: `H${k + 1}：${x.title}（${labelOf(HYPOTHESIS_STATUSES, x.status)}）` })) },
    { name: 'constraints', label: '組織上の制約（任意）', type: 'textarea', rows: 3, placeholder: '例：今期のリリース日程は動かせない／会議は増やしたくない', help: '関係者タブに登録した制約も自動で含めます。' },
  ];
  const form = h('form', {}, renderFields(defs, { hypothesisIds: bundle.hypotheses.filter((x) => x.status !== 'not_supported').map((x) => x.id) }));
  const m = openModal({
    title: '介入案の生成：対象の選択',
    body: form,
    actions: [{ label: 'キャンセル' }, {
      label: '次へ', kind: 'primary', onClick: () => {
        const v = readForm(form, defs);
        if (!v.hypothesisIds.length) { toast('対象の仮説を1つ以上選んでください', 'error'); return; }
        m.close();
        runInterventionAi(ctx, bundle, v);
      },
    }],
  });
}

function runInterventionAi(ctx, bundle, { hypothesisIds, constraints }) {
  runAgentFlow(ctx, {
    agent: 'intervention',
    bundle,
    options: { hypothesisIds, constraints },
    check: () => ({
      blockers: [],
      warnings: bundle.observations.length ? [] : ['観測事実がありません。介入案の根拠が弱くなります'],
    }),
    renderResult: (r) => {
      const drafts = toInterventionDrafts(r, bundle);
      const hypRef = new Map(bundle.hypotheses.map((x, k) => [x.id, `H${k + 1}`]));
      const items = drafts.map((d, k) => {
        const title = h('input', { class: 'input', value: d.title, 'aria-label': `案${k + 1}の施策名` });
        const { item, box } = selectableItem({
          title: `案 ${k + 1}`,
          label: '介入案として登録する',
          children: [
            h('div', { class: 'row gap wrap' }, badge(labelOf(INTERVENTION_CATEGORIES, d.category), 'blue'), badge(labelOf(SCALES, d.scale), 'gray'),
              badge(`コスト：${labelOf(LEVEL3, d.costEstimate)}`, 'gray'), badge(`可逆性：${labelOf(LEVEL3, d.reversibility)}`, 'gray')),
            h('label', { class: 'small' }, '施策名', title),
            h('p', {}, d.description),
            h('dl', { class: 'deflist small' },
              h('dt', {}, '対象仮説'), h('dd', {}, d.targetHypothesisIds.map((id) => hypRef.get(id)).join('、') || '対応なし'),
              h('dt', {}, '期待する行動変化'), h('dd', {}, d.expectedBehaviorChange),
              h('dt', {}, '期待する成果'), h('dd', {}, d.expectedOutcomes.join('、') || '不明'),
              h('dt', {}, '短期／長期'), h('dd', {}, `${d.shortTermEffect || '不明'}／${d.longTermEffect || '不明'}`),
              h('dt', {}, '必要な関係者'), h('dd', {}, d.requiredCooperation.join('、') || '不明'),
              h('dt', {}, '想定リスク'), h('dd', {}, d.risks.join('、') || '不明'),
              h('dt', {}, '検証方法'), h('dd', {}, d.verificationPlan || '不明'),
              h('dt', {}, '中止条件'), h('dd', {}, d.stopConditions.join('、') || '不明')),
            d.unknownRefs.length ? h('p', { class: 'alert alert-warning small' }, `存在しない仮説への参照（${d.unknownRefs.join('、')}）は除外しました。`) : null,
          ],
        });
        return { item, box, title, d };
      });
      return {
        node: h('div', { class: 'ai-result' },
          h('p', { class: 'prose' }, r.summary),
          r.uncertainty ? h('div', { class: 'alert alert-info' }, h('p', { class: 'alert-title' }, '不確実性'), h('p', {}, r.uncertainty)) : null,
          h('div', { class: 'ai-items' }, items.map((x) => x.item)),
          r.limitations.length ? [h('h3', { class: 'subhead' }, '限界'), bulletList(r.limitations)] : null,
          h('p', { class: 'small muted' }, '登録した案は「検討中」になります。比較の評価（効果・リスクなど）は、あなたが判断して入力してください。')),
        collect: () => items.filter((x) => x.box.checked).map((x) => ({ ...x.d, title: x.title.value.trim() })),
      };
    },
    onSave: async ({ result, warnings, selection, mode, model, note }) => {
      const items = selection.map((d) => ({ store: 'interventions', record: normalizeIntervention({ ...d, ratings: { cost: d.costEstimate } }) }));
      await ctx.repo.saveMany([
        { store: 'aiAnalyses', record: { initiativeId: bundle.initiative.id, agent: 'intervention', mode, model, result, warnings, userNote: note, reviewedByUser: true } },
        ...items,
      ]);
      await ctx.repo.touch(bundle.initiative.id);
      return `介入案 ${items.length} 件を「検討中」として登録しました`;
    },
  });
}
