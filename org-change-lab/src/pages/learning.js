// 学習記録（案件ごと）と Agent F
import { RESULT_CERTAINTY, LEARNING_PATTERNS, labelOf } from '../constants.js';
import { resultIsUnknown } from '../domain/learning.js';
import { h } from '../components/dom.js';
import { kindLabel, badge, button, toast, formModal, confirmDialog, bulletList, emptyState } from '../components/ui.js';
import { runAgentFlow } from '../components/aiRunner.js';
import { toLearningDraft } from '../ai/agents.js';

export const PATTERN_TONE = { success: 'green', failure: 'red', mixed: 'amber', unknown: 'gray' };

export function learningDefs() {
  return [
    { name: 'title', label: '知見のタイトル', required: true, wide: true },
    { name: 'summary', label: '要約', type: 'textarea', required: true, wide: true },
    { name: 'targetProblem', label: '対象となった課題', type: 'textarea', rows: 2 },
    { name: 'intervention', label: '採用した介入', type: 'textarea', rows: 2 },
    { name: 'pattern', label: 'パターン', type: 'select', options: LEARNING_PATTERNS, help: '失敗パターンも蓄積します。結果が未確認なら「判断できない」にします。' },
    { name: 'resultCertainty', label: '結果の確認状況', type: 'select', options: RESULT_CERTAINTY },
    { name: 'whatWorked', label: 'うまくいった条件（1行に1つ）', type: 'list' },
    { name: 'whatDidNotWork', label: 'うまくいかなかった条件（1行に1つ）', type: 'list' },
    { name: 'evidence', label: '得られた証拠（1行に1つ）', type: 'list' },
    { name: 'reusableConditions', label: '再利用できる範囲・条件（1行に1つ）', type: 'list' },
    { name: 'cautions', label: '適用時の注意点（1行に1つ）', type: 'list' },
    { name: 'limitations', label: 'この知見の限界（1行に1つ）', type: 'list' },
  ];
}

function editLearning(ctx, bundle, rec = null, draft = null) {
  const unknown = resultIsUnknown(bundle);
  formModal({
    title: rec ? '学習記録を編集' : '学習記録を追加',
    intro: unknown ? h('div', { class: 'alert alert-warning' }, h('p', {}, '実施後の測定結果がまだありません。結果が不明な施策は「成功パターン」として保存できません。')) : null,
    defs: learningDefs(),
    values: rec || draft || { pattern: 'unknown', resultCertainty: unknown ? 'unknown' : 'partial', targetProblem: bundle.initiative.problemStatement, intervention: bundle.interventions.filter((v) => v.status === 'adopted').map((v) => v.title).join('、') },
    size: 'lg',
    onSubmit: async (v) => {
      await ctx.svc.saveChild('learningRecords', { ...(rec || {}), ...v, initiativeId: bundle.initiative.id });
      toast('学習記録を保存しました');
      ctx.rerender();
    },
  });
}

export function learningItem(l, actions = null, initiative = null) {
  return h('li', { class: 'item' },
    h('div', { class: 'item-head' }, h('strong', {}, l.title), badge(labelOf(LEARNING_PATTERNS, l.pattern), PATTERN_TONE[l.pattern]),
      badge(labelOf(RESULT_CERTAINTY, l.resultCertainty), l.resultCertainty === 'confirmed' ? 'green' : 'amber'),
      initiative ? h('a', { class: 'small', href: `#/i/${initiative.id}/learning` }, initiative.title) : null),
    h('p', { class: 'prose' }, l.summary),
    h('div', { class: 'grid-2' },
      h('div', {}, h('h4', {}, 'うまくいった条件'), bulletList(l.whatWorked, '未記録')),
      h('div', {}, h('h4', {}, 'うまくいかなかった条件'), bulletList(l.whatDidNotWork, '未記録')),
      h('div', {}, h('h4', {}, '得られた証拠'), bulletList(l.evidence, '未確認')),
      h('div', {}, h('h4', {}, '再利用できる範囲・注意点'), bulletList([...l.reusableConditions, ...l.cautions.map((c) => `注意：${c}`)], '未記録'))),
    l.limitations.length ? h('details', {}, h('summary', { class: 'small' }, '限界'), bulletList(l.limitations)) : null,
    actions ? h('div', { class: 'item-actions' }, actions) : null);
}

export async function renderLearningTab(body, ctx, bundle) {
  const unknown = resultIsUnknown(bundle);
  body.append(h('section', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', { class: 'card-title' }, `学習記録（${bundle.learningRecords.length}）`),
      h('div', { class: 'row gap wrap' },
        ctx.settings.aiMode !== 'off' ? button('✦ AIで知見を抽出（Agent F）', () => runLearningAi(ctx, bundle)) : null,
        button('＋ 学びを記録', () => editLearning(ctx, bundle), 'primary small'))),
    h('p', { class: 'small muted' }, '成功パターンだけでなく、失敗パターンや「判断できなかったこと」も残します。'),
    unknown ? h('p', { class: 'small' }, badge('実施後の結果は未確認', 'amber')) : null,
    bundle.learningRecords.length ? h('ul', { class: 'item-list' }, bundle.learningRecords.map((l) => learningItem(l, [
      button('編集', () => editLearning(ctx, bundle, l), 'small'),
      button('削除', async () => {
        if (!(await confirmDialog({ title: '学習記録を削除しますか？', message: 'この操作は元に戻せません。', confirmLabel: '削除する', danger: true }))) return;
        await ctx.svc.removeChild('learningRecords', l); toast('削除しました'); ctx.rerender();
      }, 'small btn-ghost'),
    ])))
      : emptyState('まだ学びの記録はありません。施策がうまくいかなかった場合も、条件と証拠を残すと次に活かせます。', button('学びを記録', () => editLearning(ctx, bundle), 'primary'))));
}

function runLearningAi(ctx, bundle) {
  runAgentFlow(ctx, {
    agent: 'learning',
    bundle,
    check: () => ({
      blockers: [],
      warnings: [
        ...(resultIsUnknown(bundle) ? ['実施後の測定結果がありません。抽出される知見は「結果未確認」になります'] : []),
        ...(['completed', 'cancelled', 'verification'].includes(bundle.initiative.status) ? [] : ['案件はまだ完了していません']),
      ],
    }),
    renderResult: (r) => {
      const draft = toLearningDraft(r, bundle);
      return {
        node: h('div', { class: 'ai-result' },
          h('div', { class: 'row gap wrap' }, kindLabel('ai'), badge(labelOf(RESULT_CERTAINTY, draft.resultCertainty), 'amber'),
            r.resultCertainty !== draft.resultCertainty ? h('span', { class: 'small' }, '（実施後の測定結果がないため「結果未確認」に補正しました）') : null),
          h('h3', { class: 'subhead' }, r.title), h('p', { class: 'prose' }, r.summary),
          h('h4', {}, '課題の構造'), h('p', {}, r.problemStructure),
          h('div', { class: 'grid-2' },
            h('div', {}, h('h4', {}, '有効だった介入'), bulletList(r.effectiveInterventions, 'なし')),
            h('div', {}, h('h4', {}, '有効だった条件'), bulletList(r.effectiveConditions, 'なし')),
            h('div', {}, h('h4', {}, 'うまくいかなかったこと'), bulletList(r.whatDidNotWork, 'なし')),
            h('div', {}, h('h4', {}, '得られた根拠'), bulletList(r.evidence, 'なし')),
            h('div', {}, h('h4', {}, '他のチームに適用できる条件'), bulletList(r.applicableConditions, 'なし')),
            h('div', {}, h('h4', {}, '適用時の注意点'), bulletList(r.cautions, 'なし'))),
          h('p', { class: 'small muted' }, '「確認して保存」を押すと、この内容を下書きとして学習記録フォームを開きます。保存前に編集できます。')),
        collect: () => draft,
      };
    },
    onSave: async ({ result, warnings, selection, mode, model, note }) => {
      await ctx.analysis.saveAnalysis({ initiativeId: bundle.initiative.id, agent: 'learning', mode, model, result, warnings, userNote: note });
      setTimeout(() => editLearning(ctx, bundle, null, selection), 0);
      return 'AIの結果を保存しました。下書きを確認して学習記録として保存してください';
    },
  });
}
