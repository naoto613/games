// SCR-03 組織課題分析：事実・解釈・仮説・判断を分けて整理する
import { SOURCE_TYPES, CONFIDENCE, OBSERVATION_STATUS, HYPOTHESIS_STATUSES, PRIORITY, STRUCTURAL_LENSES, labelOf } from '../constants.js';
import { evidenceState, hypothesisSummary, normalizeHypothesis } from '../domain/hypothesis.js';
import { normalizeDecision } from '../domain/intervention.js';
import { today } from '../domain/common.js';
import { h } from '../components/dom.js';
import {
  kindLabel, badge, button, toast, formModal, confirmDialog, renderFields, readForm,
  bulletList, emptyState,
} from '../components/ui.js';
import { runAgentFlow, selectableItem, editableText } from '../components/aiRunner.js';
import { toHypothesisDrafts } from '../ai/agents.js';
import { ValidationError } from '../repositories/repository.js';

const SUPPORT_LABEL = {
  partially_supported_by_input: ['入力情報で一部支持', 'green'],
  needs_verification: ['追加の検証が必要', 'amber'],
  no_evidence: ['入力に根拠なし', 'red'],
};

const SEVERITY = { high: ['重要度：高', 'red'], medium: ['重要度：中', 'amber'], low: ['重要度：低', 'gray'] };
const REVIEW_CATEGORY = {
  fact_interpretation_mix: '事実と解釈の混在', reversed_causality: '因果の逆転', not_falsifiable: '反証できない仮説',
  missing_alternative: '別の仮説の未検討', individual_attribution: '個人への過度な帰属', intervention_mismatch: '施策と原因の不一致', other: 'その他',
};

export async function renderAnalysisTab(body, ctx, bundle) {
  body.append(legend());
  body.append(problemCard(ctx, bundle));
  body.append(observationsCard(ctx, bundle));
  body.append(hypothesesCard(ctx, bundle));
  body.append(aiCard(ctx, bundle));
}

function legend() {
  return h('details', { class: 'legend card' },
    h('summary', {}, '情報の4つの区分（事実・解釈・仮説・判断）'),
    h('table', { class: 'table' },
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, '区分'), h('th', { scope: 'col' }, '定義'), h('th', { scope: 'col' }, '例'))),
      h('tbody', {},
        h('tr', {}, h('td', {}, kindLabel('fact')), h('td', {}, '観測・確認できた情報'), h('td', {}, '直近5施策のうち4施策で、実施前の成功指標が定義されていなかった')),
        h('tr', {}, h('td', {}, kindLabel('interpretation')), h('td', {}, '事実から読み取れる意味'), h('td', {}, '施策の成功を共通の基準で評価できていない可能性がある')),
        h('tr', {}, h('td', {}, kindLabel('hypothesis')), h('td', {}, '検証が必要な原因の説明'), h('td', {}, '成功指標の定義が開発着手後になっていることが、振り返りの難しさにつながっている')),
        h('tr', {}, h('td', {}, kindLabel('decision')), h('td', {}, 'EMが採用した結論や方針'), h('td', {}, '次の2施策で、着手前の指標定義を試す')))),
    h('p', { class: 'small muted' }, 'AIが生成した内容は ', kindLabel('ai'), ' と表示し、確認済みの事実としては保存しません。'));
}

// ---------- A・C：観測された問題と期待する状態 ----------

const PROBLEM_DEFS = [
  { section: 'A. 観測された問題' },
  { name: 'problemDetail.what', label: '何が起きているか', type: 'textarea', rows: 2, placeholder: '例：定例の議題の多くが実装の進捗で、顧客課題や成果についての提案が少ない' },
  { name: 'problemDetail.since', label: 'いつから起きているか', placeholder: '例：直近2四半期' },
  { name: 'problemDetail.extent', label: 'どの範囲で起きているか', placeholder: '例：CRMチームの施策企画・振り返り' },
  { name: 'problemDetail.impact', label: 'どのような影響があるか', type: 'textarea', rows: 2 },
  { section: 'C. 期待する状態' },
  { name: 'expectation.improvedWhen', label: 'どうなれば問題が改善したといえるか', type: 'textarea', rows: 2 },
  { name: 'expectation.behaviorChanges', label: 'どのような行動が増減してほしいか', type: 'textarea', rows: 2 },
  { name: 'expectation.businessContribution', label: 'どの事業・プロダクト成果に寄与するか', type: 'textarea', rows: 2 },
];

function problemCard(ctx, bundle) {
  const i = bundle.initiative;
  const form = h('form', { class: 'form', novalidate: true });
  const status = h('span', { class: 'small muted', role: 'status' });
  form.append(renderFields(PROBLEM_DEFS, i), h('div', { class: 'row gap end' }, status, h('button', { class: 'btn btn-primary', type: 'submit' }, '保存')));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = readForm(form, PROBLEM_DEFS);
    try {
      await ctx.svc.update(i, v);
      toast('観測された問題と期待する状態を保存しました');
      ctx.rerender();
    } catch (err) {
      status.textContent = `保存に失敗しました（${err.message}）。入力内容は残っています。`;
      toast('保存に失敗しました。もう一度お試しください', 'error');
    }
  });
  const filled = PROBLEM_DEFS.filter((d) => d.name && d.name.split('.').reduce((o, k) => o?.[k], i)).length;
  return h('details', { class: 'card', open: filled < 3 },
    h('summary', { class: 'card-title' }, `観測された問題（A）と期待する状態（C）`, h('span', { class: 'small muted' }, ` ${filled}/7 項目入力済み`)),
    form);
}

// ---------- B：根拠（観測事実） ----------

function observationDefs() {
  return [
    { name: 'content', label: '実際に観測した事実', type: 'textarea', required: true, rows: 3, help: '推測や評価を含めず、確認できたことだけを書きます。', placeholder: '例：直近の施策では、成功指標が実装着手後に決まった' },
    { name: 'interpretation', label: '解釈（任意）', type: 'textarea', rows: 2, help: 'この事実から読み取れる意味。事実とは分けて保存します。' },
    { name: 'sourceType', label: '情報源の種類', type: 'select', options: SOURCE_TYPES },
    { name: 'sourceDescription', label: '情報源（データや文書など）', placeholder: '例：施策の振り返り記録' },
    { name: 'observedAt', label: '観測日', type: 'date' },
    { name: 'observationPeriod', label: '観測期間', placeholder: '例：2026年7〜9月' },
    { name: 'confidence', label: '事実の確度', type: 'select', options: CONFIDENCE },
    { name: 'status', label: '確認状況', type: 'select', options: OBSERVATION_STATUS },
  ];
}

function editObservation(ctx, bundle, obs = null) {
  formModal({
    title: obs ? '観測事実を編集' : '観測事実を追加',
    defs: observationDefs(),
    values: obs || { sourceType: 'observation', confidence: 'medium', status: 'observed', observedAt: today() },
    onSubmit: async (v) => {
      await ctx.svc.saveChild('observations', { ...(obs || {}), ...v, initiativeId: bundle.initiative.id });
      toast(obs ? '観測事実を更新しました' : '観測事実を追加しました');
      ctx.rerender();
    },
  });
}

function observationsCard(ctx, bundle) {
  const rows = bundle.observations;
  const usedBy = (id) => bundle.hypotheses.filter((x) => x.supportingObservationIds.includes(id));
  return h('section', { class: 'card' },
    h('div', { class: 'card-head' },
      h('h2', { class: 'card-title' }, `B. 根拠：観測された事実（${rows.length}）`),
      button('＋ 事実を追加', () => editObservation(ctx, bundle), 'primary small')),
    rows.length ? h('ul', { class: 'item-list' }, rows.map((o, k) => h('li', { class: 'item item-fact' },
      h('div', { class: 'item-head' },
        h('span', { class: 'ref' }, `O${k + 1}`), kindLabel('fact'),
        o.status === 'reported' ? badge('伝聞（未確認）', 'amber') : null,
        badge(`確度：${labelOf(CONFIDENCE, o.confidence)}`, o.confidence === 'low' ? 'amber' : 'gray')),
      h('p', { class: 'item-text' }, o.content),
      o.interpretation ? h('p', { class: 'item-sub' }, kindLabel('interpretation'), ' ', o.interpretation) : null,
      h('p', { class: 'small muted' }, [
        `情報源：${labelOf(SOURCE_TYPES, o.sourceType)}${o.sourceDescription ? `（${o.sourceDescription}）` : ''}`,
        o.observedAt ? `観測日：${o.observedAt}` : null,
        o.observationPeriod ? `期間：${o.observationPeriod}` : null,
        usedBy(o.id).length ? `根拠にしている仮説：${usedBy(o.id).map((x) => x.title).join('、')}` : null,
      ].filter(Boolean).join('／')),
      h('div', { class: 'item-actions' },
        button('編集', () => editObservation(ctx, bundle, o), 'small'),
        button('削除', async () => {
          const ok = await confirmDialog({ title: '観測事実を削除しますか？', message: usedBy(o.id).length ? `この事実を根拠にしている仮説が ${usedBy(o.id).length} 件あります。仮説からの紐づけも外れます。` : 'この操作は元に戻せません。', confirmLabel: '削除する', danger: true });
          if (!ok) return;
          await ctx.svc.removeChild('observations', o);
          for (const x of usedBy(o.id)) await ctx.svc.saveChild('hypotheses', { ...x, supportingObservationIds: x.supportingObservationIds.filter((id) => id !== o.id) });
          toast('削除しました');
          ctx.rerender();
        }, 'small btn-ghost')))))
      : emptyState('まだ事実がありません。議事録・課題管理・ヒアリングなどで実際に確認できたことを登録しましょう。', button('最初の事実を追加', () => editObservation(ctx, bundle), 'primary')),
    h('div', { class: 'field' },
      h('p', { class: 'small muted' }, 'まだ確認できていない点は「概要」タブの「未解決の論点」に記録できます。')));
}

// ---------- 原因仮説 ----------

function hypothesisDefs(bundle) {
  return [
    { name: 'title', label: '仮説の内容（見出し）', required: true, placeholder: '例：成功指標を定義するタイミングが遅い' },
    { name: 'description', label: '説明', type: 'textarea', rows: 2 },
    { name: 'lens', label: '構造的な分析観点', type: 'select', options: STRUCTURAL_LENSES, placeholderOption: '（選択しない）' },
    { name: 'supportingObservationIds', label: '根拠となる事実', type: 'checkboxes', options: bundle.observations.map((o, k) => ({ value: o.id, label: `O${k + 1}：${o.content}` })), emptyText: '観測事実がまだありません' },
    { name: 'evidenceNotes', label: '根拠メモ（事実として未登録のもの・1行に1つ）', type: 'list', rows: 2 },
    { name: 'counterEvidence', label: '反証材料（1行に1つ）', type: 'list', rows: 2 },
    { name: 'alternativeExplanations', label: '他の説明可能性（1行に1つ）', type: 'list', rows: 2 },
    { name: 'missingInformation', label: '不足している情報（1行に1つ）', type: 'list', rows: 2 },
    { name: 'verificationMethod', label: '確認方法', type: 'textarea', rows: 2, placeholder: '例：過去3施策の企画・着手・振り返り記録を比較する' },
    { name: 'priority', label: '優先度', type: 'select', options: PRIORITY },
    { name: 'status', label: '検証状況', type: 'select', options: HYPOTHESIS_STATUSES, help: '「支持された」は絶対的な真実ではなく、現在の証拠に照らして採用するのが妥当と判断した状態です。' },
    { name: 'userAssessment', label: 'ユーザーの判断', placeholder: '例：採用する／保留する' },
    { name: 'assessmentReason', label: '判断理由', type: 'textarea', rows: 2 },
  ];
}

// 仮説の保存。検証状況が変わったら意思決定記録も残す
async function saveHypothesis(ctx, bundle, prev, values) {
  const record = { ...(prev || {}), ...values, initiativeId: bundle.initiative.id };
  const items = [{ store: 'hypotheses', record }];
  if (prev && prev.status !== record.status && ['supported', 'not_supported', 'pending'].includes(record.status)) {
    items.push({
      store: 'decisionRecords',
      record: normalizeDecision({
        initiativeId: bundle.initiative.id, type: 'hypothesis_assessment', subjectId: prev.id,
        title: `仮説「${record.title}」`, decision: labelOf(HYPOTHESIS_STATUSES, record.status), reason: record.assessmentReason || '',
      }),
    });
  }
  await ctx.repo.saveMany(items);
  await ctx.repo.touch(bundle.initiative.id);
}

function editHypothesis(ctx, bundle, hyp = null) {
  formModal({
    title: hyp ? '原因仮説を編集' : '原因仮説を追加',
    defs: hypothesisDefs(bundle),
    values: hyp || { priority: 'medium', status: 'unverified' },
    size: 'lg',
    onSubmit: async (v) => {
      await saveHypothesis(ctx, bundle, hyp, { ...v, lens: v.lens || null });
      toast(hyp ? '仮説を更新しました' : '仮説を追加しました');
      ctx.rerender();
    },
  });
}

function changeHypothesisStatus(ctx, bundle, hyp, status, revert) {
  if (!['supported', 'not_supported', 'pending'].includes(status)) {
    saveHypothesis(ctx, bundle, hyp, { status }).then(() => { toast('検証状況を更新しました'); ctx.rerender(); })
      .catch((e) => { revert(); toast(`保存に失敗しました：${e.message}`, 'error'); });
    return;
  }
  formModal({
    title: `仮説を「${labelOf(HYPOTHESIS_STATUSES, status)}」と判断`,
    intro: h('p', { class: 'small muted' }, `仮説：${hyp.title}`),
    defs: [
      { name: 'userAssessment', label: 'ユーザーの判断', placeholder: '例：採用する／別の仮説を優先する' },
      { name: 'assessmentReason', label: '判断理由', type: 'textarea', required: status !== 'pending', help: 'どの事実・確認結果に基づいて判断したかを書きます。' },
    ],
    values: { userAssessment: hyp.userAssessment || '', assessmentReason: hyp.assessmentReason || '' },
    submitLabel: '判断を記録',
    onClose: (saved) => { if (!saved) revert(); },
    onSubmit: async (v) => {
      await saveHypothesis(ctx, bundle, hyp, { ...v, status });
      toast('判断を記録しました');
      ctx.rerender();
    },
  });
}

function hypothesesCard(ctx, bundle) {
  const rows = [...bundle.hypotheses].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]));
  const obsRef = new Map(bundle.observations.map((o, k) => [o.id, { ref: `O${k + 1}`, o }]));
  const refOf = new Map(bundle.hypotheses.map((x, k) => [x.id, `H${k + 1}`]));
  const summary = hypothesisSummary(bundle.hypotheses).filter((s) => s.count);
  return h('section', { class: 'card' },
    h('div', { class: 'card-head' },
      h('h2', { class: 'card-title' }, `原因仮説（${rows.length}）`),
      button('＋ 仮説を追加', () => editHypothesis(ctx, bundle), 'primary small')),
    summary.length ? h('p', { class: 'small muted' }, summary.map((s) => `${s.label} ${s.count}`).join('／')) : null,
    rows.length === 1 ? h('p', { class: 'alert alert-info small' }, '1つの原因に早く収束させないよう、別の説明可能性も仮説として立ててみましょう。') : null,
    rows.length ? h('ul', { class: 'item-list' }, rows.map((x) => {
      const ev = evidenceState(x);
      const sel = h('select', { class: 'input input-inline', 'aria-label': `検証状況：${x.title}` }, HYPOTHESIS_STATUSES.map((s) => h('option', { value: s.value, selected: s.value === x.status }, s.label)));
      sel.addEventListener('change', () => changeHypothesisStatus(ctx, bundle, x, sel.value, () => { sel.value = x.status; }));
      return h('li', { class: 'item item-hypothesis' },
        h('div', { class: 'item-head' },
          h('span', { class: 'ref' }, refOf.get(x.id)), kindLabel('hypothesis'),
          x.origin === 'ai' ? kindLabel('ai', 'AI提案から登録') : null,
          badge(`優先度：${labelOf(PRIORITY, x.priority)}`, x.priority === 'high' ? 'red' : 'gray'),
          x.lens ? badge(labelOf(STRUCTURAL_LENSES, x.lens), 'blue') : null,
          badge(ev.label, ev.level === 'linked' ? 'green' : 'amber')),
        h('p', { class: 'item-text' }, h('strong', {}, x.title)),
        x.description ? h('p', {}, x.description) : null,
        h('div', { class: 'hyp-grid' },
          h('div', {}, h('h4', {}, '根拠'),
            x.supportingObservationIds.length ? h('ul', { class: 'bullets small' }, x.supportingObservationIds.map((id) => obsRef.get(id)).filter(Boolean).map(({ ref, o }) => h('li', {}, kindLabel('fact', ref), ' ', o.content))) : null,
            x.evidenceNotes.length ? bulletList(x.evidenceNotes) : null,
            !x.supportingObservationIds.length && !x.evidenceNotes.length ? h('p', { class: 'muted small' }, '根拠未確認') : null),
          h('div', {}, h('h4', {}, '反証材料・他の説明'), bulletList([...x.counterEvidence, ...x.alternativeExplanations.map((a) => `別の説明：${a}`)], 'なし（未検討）')),
          h('div', {}, h('h4', {}, '不足している情報'), bulletList(x.missingInformation, '未記入')),
          h('div', {}, h('h4', {}, '確認方法'), h('p', { class: 'small' }, x.verificationMethod || '未記入'))),
        x.userAssessment || x.assessmentReason ? h('p', { class: 'item-sub' }, kindLabel('decision'), ` ${x.userAssessment || ''}${x.assessmentReason ? `（理由：${x.assessmentReason}）` : ''}`) : null,
        h('div', { class: 'item-actions' },
          h('label', { class: 'small' }, '検証状況：', sel),
          button('編集', () => editHypothesis(ctx, bundle, x), 'small'),
          button('削除', async () => {
            const linked = bundle.interventions.filter((v) => v.targetHypothesisIds.includes(x.id));
            const ok = await confirmDialog({ title: '仮説を削除しますか？', message: linked.length ? `この仮説を対象にしている介入案が ${linked.length} 件あります。介入案からの紐づけも外れます。` : 'この操作は元に戻せません。', confirmLabel: '削除する', danger: true });
            if (!ok) return;
            await ctx.svc.removeChild('hypotheses', x);
            for (const v of linked) await ctx.svc.saveChild('interventions', { ...v, targetHypothesisIds: v.targetHypothesisIds.filter((id) => id !== x.id) });
            toast('削除しました');
            ctx.rerender();
          }, 'small btn-ghost')));
    }))
      : emptyState('まだ仮説がありません。個人の能力より先に、役割・情報・意思決定などの構造的な要因を考えてみましょう。', button('仮説を追加', () => editHypothesis(ctx, bundle), 'primary')));
}

// ---------- AI支援（Agent A・B） ----------

function aiCard(ctx, bundle) {
  if (ctx.settings.aiMode === 'off') {
    return h('section', { class: 'card' }, h('h2', { class: 'card-title' }, 'AIで分析を支援'), h('p', { class: 'muted' }, 'AI機能は無効です（設定で変更できます）。上のフォームで手動で分析を進められます。'));
  }
  const latestStructure = [...bundle.aiAnalyses].reverse().find((a) => a.agent === 'structure');
  return h('section', { class: 'card ai-card' },
    h('h2', { class: 'card-title' }, kindLabel('ai'), ' AIで分析を支援'),
    h('p', { class: 'muted small' }, 'AIは原因を決めつけず、検証可能な仮説と調査方法を提案します。どの仮説を採用するかはあなたが決めます。'),
    h('div', { class: 'ai-actions' },
      h('div', {}, button('構造分析を実行（Agent A）', () => runStructure(ctx, bundle), 'primary'), h('p', { class: 'small muted' }, '問題の再定義・原因仮説・検証方法・未確認事項')),
      h('div', {}, button('批判的レビュー（Agent B）', () => runReview(ctx, bundle, latestStructure)), h('p', { class: 'small muted' }, latestStructure ? '直近の構造分析と登録済みの仮説をレビュー' : '登録済みの仮説をレビュー'))));
}

function runStructure(ctx, bundle) {
  const i = bundle.initiative;
  runAgentFlow(ctx, {
    agent: 'structure',
    bundle,
    check: () => ({
      blockers: i.problemStatement ? [] : ['解決したい問題（概要タブで編集）'],
      warnings: [
        ...(bundle.observations.length ? [] : ['観測事実がありません。仮説の根拠を入力情報で確認できないため、すべて「追加の検証が必要」になります']),
        ...(i.problemDetail.what ? [] : ['観測された問題（A）の「何が起きているか」']),
      ],
    }),
    renderResult: (r) => {
      const drafts = toHypothesisDrafts(r, i.id);
      const items = drafts.map((d, k) => {
        const title = editableText(d.title, 1, `仮説${k + 1}の見出し`);
        const desc = editableText(d.description, 2, `仮説${k + 1}の説明`);
        const [label, tone] = SUPPORT_LABEL[d.supportStatus] || ['不明', 'gray'];
        const { item, box } = selectableItem({
          checked: true,
          title: `仮説${k + 1}`,
          label: '仮説として登録する',
          children: [
            h('div', { class: 'row gap wrap' }, kindLabel('hypothesis'), badge(label, tone), d.lens ? badge(labelOf(STRUCTURAL_LENSES, d.lens), 'blue') : null),
            h('label', { class: 'small' }, '見出し', title), h('label', { class: 'small' }, '説明', desc),
            h('div', { class: 'hyp-grid small' },
              h('div', {}, h('h4', {}, '根拠'), bulletList(d.evidenceNotes, '入力内容だけでは未確認')),
              h('div', {}, h('h4', {}, '根拠の不足'), bulletList(d.missingInformation)),
              h('div', {}, h('h4', {}, '他の説明可能性'), bulletList(d.alternativeExplanations, 'なし')),
              h('div', {}, h('h4', {}, '検証方法'), h('p', {}, d.verificationMethod || '未記入'))),
          ],
        });
        return { item, box, title, desc, d };
      });
      const unknowns = r.unknowns.map((u) => ({ u, box: h('input', { type: 'checkbox', class: 'checkbox', checked: true }) }));
      const actions = r.recommendedNextActions.map((a, k) => ({ a, radio: h('input', { type: 'radio', name: 'ai-next', class: 'checkbox', value: String(k) }) }));
      const none = h('input', { type: 'radio', name: 'ai-next', class: 'checkbox', value: '', checked: true });
      const node = h('div', { class: 'ai-result' },
        h('h3', { class: 'subhead' }, '1. 問題の再定義'), h('p', { class: 'prose' }, r.problemRedefinition || r.summary),
        h('h3', { class: 'subhead' }, '2. 観測された事実（AIによる整理・参考表示）'),
        h('p', { class: 'small muted' }, 'AIが整理した事実は保存しません。事実はB欄にあなたが登録したものだけです。'),
        bulletList(r.facts, '（なし）'),
        r.interpretations.length ? [h('h4', {}, kindLabel('interpretation'), ' 解釈'), bulletList(r.interpretations)] : null,
        h('h3', { class: 'subhead' }, `3. 原因仮説（${drafts.length}）— 登録するものを選んでください`),
        h('div', { class: 'ai-items' }, items.map((x) => x.item)),
        h('h3', { class: 'subhead' }, '4. 構造的な分析観点'),
        h('ul', { class: 'bullets' }, r.structuralPerspectives.map((p) => h('li', {}, h('strong', {}, labelOf(STRUCTURAL_LENSES, p.lens)), `：${p.observation}`))),
        h('h3', { class: 'subhead' }, '5. 未確認事項 — 「未解決の論点」に追加するもの'),
        unknowns.length ? h('div', { class: 'checks' }, unknowns.map(({ u, box }) => h('label', { class: 'check' }, box, h('span', {}, u)))) : h('p', { class: 'muted' }, 'なし'),
        h('h3', { class: 'subhead' }, '6. 次の行動 — 採用するなら1つ選択'),
        h('div', { class: 'checks' }, h('label', { class: 'check' }, none, h('span', {}, '採用しない')), actions.map(({ a, radio }) => h('label', { class: 'check' }, radio, h('span', {}, a)))),
        r.limitations.length ? [h('h3', { class: 'subhead' }, '分析の限界'), bulletList(r.limitations)] : null);
      return {
        node,
        collect: () => ({
          hypotheses: items.filter((x) => x.box.checked).map((x) => ({ ...x.d, title: x.title.value.trim(), description: x.desc.value.trim() })),
          unknowns: unknowns.filter((x) => x.box.checked).map((x) => x.u),
          nextAction: actions.find((x) => x.radio.checked)?.a || null,
        }),
      };
    },
    onSave: async ({ result, warnings, selection, mode, model, note }) => {
      const items = selection.hypotheses.map((d) => ({ store: 'hypotheses', record: normalizeHypothesis(d) }));
      const bad = items.find((x) => !x.record.title);
      if (bad) throw new ValidationError({ title: '見出しが空の仮説があります' }, '原因仮説');
      const patch = {};
      if (selection.unknowns.length) patch.openQuestions = [...new Set([...i.openQuestions, ...selection.unknowns])];
      if (selection.nextAction) Object.assign(patch, { nextAction: selection.nextAction, nextActionSource: 'ai' });
      await ctx.repo.saveMany([
        { store: 'aiAnalyses', record: { initiativeId: i.id, agent: 'structure', mode, model, result, warnings, userNote: note, reviewedByUser: true } },
        ...items,
      ]);
      if (Object.keys(patch).length) await ctx.svc.update(i, patch);
      else await ctx.repo.touch(i.id);
      return `分析結果を保存しました（仮説 ${items.length} 件を「未検証」として登録）`;
    },
  });
}

function runReview(ctx, bundle, latestStructure) {
  const i = bundle.initiative;
  const reviewTarget = latestStructure ? { 直近の構造分析: latestStructure.result } : null;
  runAgentFlow(ctx, {
    agent: 'review',
    bundle,
    options: reviewTarget ? { reviewTarget: { ...reviewTarget, 登録済みの仮説: bundle.hypotheses.map((x) => ({ 仮説: x.title, 説明: x.description, 検証状況: labelOf(HYPOTHESIS_STATUSES, x.status) })) } } : {},
    check: () => ({
      blockers: !bundle.hypotheses.length && !latestStructure ? ['レビュー対象の仮説（仮説を登録するか、先に構造分析を実行してください）'] : [],
      warnings: [],
    }),
    renderResult: (r) => {
      const rows = r.findings.map((f) => ({ f, box: h('input', { type: 'checkbox', class: 'checkbox', checked: f.severity === 'high' }) }));
      const node = h('div', { class: 'ai-result' },
        h('p', { class: 'prose' }, r.summary),
        rows.length ? h('ul', { class: 'item-list' }, rows.map(({ f, box }) => {
          const [label, tone] = SEVERITY[f.severity];
          return h('li', { class: 'item' },
            h('div', { class: 'item-head' }, badge(label, tone), badge(REVIEW_CATEGORY[f.category] || f.category, 'gray'), f.target ? h('span', { class: 'small muted' }, `対象：${f.target}`) : null),
            h('p', { class: 'item-text' }, f.issue),
            h('p', { class: 'small' }, h('strong', {}, '追加で必要な根拠：'), f.requiredEvidence || '—'),
            h('p', { class: 'small' }, h('strong', {}, '修正案：'), f.suggestion || '—'),
            f.requiredEvidence ? h('label', { class: 'check small' }, box, h('span', {}, '必要な根拠を「未解決の論点」に追加')) : null);
        })) : h('p', { class: 'muted' }, '指摘事項はありませんでした。'),
        r.limitations.length ? [h('h3', { class: 'subhead' }, 'レビューの限界'), bulletList(r.limitations)] : null);
      return { node, collect: () => rows.filter((x) => x.box.checked && x.f.requiredEvidence).map((x) => x.f.requiredEvidence) };
    },
    onSave: async ({ result, warnings, selection, mode, model, note }) => {
      await ctx.analysis.saveAnalysis({ initiativeId: i.id, agent: 'review', mode, model, result, warnings, userNote: note });
      if (selection.length) await ctx.svc.update(await ctx.repo.get('initiatives', i.id), { openQuestions: [...new Set([...i.openQuestions, ...selection])] });
      return `レビュー結果を保存しました${selection.length ? `（論点を ${selection.length} 件追加）` : ''}`;
    },
  });
}

// 他タブから使う
export { editHypothesis, editObservation };
