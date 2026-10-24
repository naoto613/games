// 関係者と合意形成（Agent D を含む）
import { today } from '../domain/common.js';
import { h } from '../components/dom.js';
import { kindLabel, badge, button, toast, formModal, confirmDialog, bulletList, emptyState, definitionList } from '../components/ui.js';
import { runAgentFlow } from '../components/aiRunner.js';

function stakeholderDefs() {
  return [
    { name: 'role', label: '役割名', required: true, help: '個人名ではなく役割名（例：CRMリーダー、マーケティング担当）で記録することを推奨します。' },
    { name: 'team', label: 'チーム・部署' },
    { name: 'goals', label: '目標（1行に1つ）', type: 'list', rows: 2 },
    { name: 'constraints', label: '制約（1行に1つ）', type: 'list', rows: 2 },
    { name: 'concerns', label: '懸念（1行に1つ）', type: 'list', rows: 2 },
    { name: 'knownOpinion', label: '把握している意見', type: 'textarea', rows: 2 },
    { name: 'opinionConfirmed', label: '本人に確認した意見である（チェックがない場合、AIは推測として扱います）', type: 'checkbox' },
    { name: 'decisionRights', label: '決定権限・責任範囲' },
  ];
}

function editStakeholder(ctx, bundle, s = null) {
  formModal({
    title: s ? '関係者を編集' : '関係者を追加',
    defs: stakeholderDefs(),
    values: s || {},
    onSubmit: async (v) => {
      await ctx.svc.saveChild('stakeholders', { ...(s || {}), ...v, initiativeId: bundle.initiative.id });
      toast('保存しました');
      ctx.rerender();
    },
  });
}

const AGREEMENT_DEFS = [
  { name: 'agreements.jointDecisions', label: '共同で決める事項（1行に1つ）', type: 'list' },
  { name: 'agreements.delegatedDecisions', label: '各チームに委ねる事項（1行に1つ）', type: 'list' },
  { name: 'agreements.decisionProcess', label: '意思決定の方法', type: 'textarea', rows: 2 },
  { name: 'agreements.agreedItems', label: '合意済みの内容（1行に1つ）', type: 'list' },
];

export async function renderStakeholdersTab(body, ctx, bundle) {
  const i = bundle.initiative;
  body.append(h('section', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', { class: 'card-title' }, `関係者（${bundle.stakeholders.length}）`), button('＋ 関係者を追加', () => editStakeholder(ctx, bundle), 'primary small')),
    h('p', { class: 'small muted' }, '関係者の能力や性格ではなく、役割・目標・制約から合意形成を考えます。'),
    bundle.stakeholders.length ? h('ul', { class: 'item-list grid-cards' }, bundle.stakeholders.map((s) => h('li', { class: 'item' },
      h('div', { class: 'item-head' }, h('strong', {}, s.role), s.team ? badge(s.team, 'blue') : null,
        s.opinionConfirmed ? badge('意見は確認済み', 'green') : badge('意見は未確認', 'amber')),
      definitionList([
        ['目標', s.goals.join('、')], ['制約', s.constraints.join('、')], ['懸念', s.concerns.join('、')],
        ['把握している意見', s.knownOpinion], ['決定権限', s.decisionRights],
      ]),
      h('div', { class: 'item-actions' },
        button('編集', () => editStakeholder(ctx, bundle, s), 'small'),
        button('削除', async () => {
          if (!(await confirmDialog({ title: '関係者を削除しますか？', message: 'この操作は元に戻せません。', confirmLabel: '削除する', danger: true }))) return;
          await ctx.svc.removeChild('stakeholders', s); toast('削除しました'); ctx.rerender();
        }, 'small btn-ghost')))))
      : emptyState('まだ関係者が登録されていません。合意が必要な役割を登録しましょう。')));

  const a = i.agreements;
  body.append(h('section', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', { class: 'card-title' }, '合意と意思決定の境界'),
      h('div', { class: 'row gap' },
        button('編集', () => formModal({ title: '合意と意思決定の境界', defs: AGREEMENT_DEFS, values: i, onSubmit: async (v) => { await ctx.svc.update(i, v); toast('保存しました'); ctx.rerender(); } }), 'small'),
        button('合意を記録', () => formModal({
          title: '合意を記録',
          defs: [
            { name: 'title', label: '何についての合意か', required: true },
            { name: 'decision', label: '合意した内容', type: 'textarea', required: true },
            { name: 'decidedBy', label: '合意した関係者（役割名）' },
            { name: 'reason', label: '背景・理由', type: 'textarea' },
            { name: 'decidedAt', label: '日付', type: 'date' },
          ],
          values: { decidedAt: today() },
          onSubmit: async (v) => {
            await ctx.svc.saveChild('decisionRecords', { ...v, type: 'agreement', initiativeId: i.id });
            await ctx.svc.update(await ctx.repo.get('initiatives', i.id), { agreements: { ...a, agreedItems: [...a.agreedItems, `${v.title}：${v.decision}`] } });
            toast('合意を記録しました'); ctx.rerender();
          },
        }), 'small'))),
    h('div', { class: 'grid-2' },
      h('div', {}, h('h3', { class: 'subhead' }, '共同で決める事項'), bulletList(a.jointDecisions, '未定義')),
      h('div', {}, h('h3', { class: 'subhead' }, '各チームに委ねる事項'), bulletList(a.delegatedDecisions, '未定義'))),
    h('h3', { class: 'subhead' }, '意思決定の方法'), h('p', {}, a.decisionProcess || h('span', { class: 'muted' }, '未定義')),
    h('h3', { class: 'subhead' }, kindLabel('decision'), ' 合意済みの内容'), bulletList(a.agreedItems, 'まだ合意した内容はありません')));

  if (ctx.settings.aiMode !== 'off') {
    body.append(h('section', { class: 'card ai-card' },
      h('h2', { class: 'card-title' }, kindLabel('ai'), ' 合意形成の支援（Agent D）'),
      h('p', { class: 'small muted' }, '関係者ごとの関心・懸念、共同で決める事項と委ねる事項、意思決定プロセスを整理します。本人に確認していない意見は推測として扱います。'),
      button('関係者分析を実行', () => runStakeholderAi(ctx, bundle), 'primary')));
  }
}

function runStakeholderAi(ctx, bundle) {
  const i = bundle.initiative;
  runAgentFlow(ctx, {
    agent: 'stakeholder',
    bundle,
    check: () => ({
      blockers: bundle.stakeholders.length ? [] : ['関係者（役割名）を1人以上登録してください'],
      warnings: [
        ...(bundle.interventions.length ? [] : ['介入案がありません。関係者への影響を具体的に検討できません']),
        ...(bundle.stakeholders.some((s) => !s.opinionConfirmed) ? ['本人に確認していない意見があります。AIの出力はその分推測を含みます'] : []),
      ],
    }),
    renderResult: (r) => {
      const pick = (arr) => arr.map((t) => ({ t, box: h('input', { type: 'checkbox', class: 'checkbox', checked: true }) }));
      const joint = pick(r.jointDecisions);
      const deleg = pick(r.delegatedDecisions);
      const checks = (rows) => (rows.length ? h('div', { class: 'checks' }, rows.map(({ t, box }) => h('label', { class: 'check' }, box, h('span', {}, t)))) : h('p', { class: 'muted' }, 'なし'));
      return {
        node: h('div', { class: 'ai-result' },
          !r.basedOnConfirmedOpinions ? h('div', { class: 'alert alert-warning' }, h('p', {}, 'この分析は、関係者本人に確認していない情報からの推測を含みます。')) : null,
          h('p', { class: 'prose' }, r.summary),
          h('ul', { class: 'item-list' }, r.stakeholders.map((s) => h('li', { class: 'item' },
            h('div', { class: 'item-head' }, h('strong', {}, s.role), s.concernsAreSpeculative ? badge('懸念は推測', 'amber') : badge('確認済みの情報に基づく', 'green')),
            definitionList([['関心事項', s.interests.join('、')], ['想定される懸念', s.concerns.join('、')], ['事前に確認すべき事項', s.questionsToConfirm.join('、')]])))),
          h('h3', { class: 'subhead' }, '共同で決める事項（反映するものを選択）'), checks(joint),
          h('h3', { class: 'subhead' }, '各チームに委ねる事項（反映するものを選択）'), checks(deleg),
          h('h3', { class: 'subhead' }, '推奨する意思決定プロセス'), h('p', {}, r.decisionProcess),
          h('h3', { class: 'subhead' }, '合意できない場合の選択肢'), bulletList(r.ifNoAgreement, 'なし'),
          r.limitations.length ? [h('h3', { class: 'subhead' }, '限界'), bulletList(r.limitations)] : null),
        collect: () => ({ joint: joint.filter((x) => x.box.checked).map((x) => x.t), deleg: deleg.filter((x) => x.box.checked).map((x) => x.t) }),
      };
    },
    onSave: async ({ result, warnings, selection, mode, model, note }) => {
      await ctx.analysis.saveAnalysis({ initiativeId: i.id, agent: 'stakeholder', mode, model, result, warnings, userNote: note });
      if (selection.joint.length || selection.deleg.length) {
        const cur = await ctx.repo.get('initiatives', i.id);
        await ctx.svc.update(cur, {
          agreements: {
            ...cur.agreements,
            jointDecisions: [...new Set([...cur.agreements.jointDecisions, ...selection.joint])],
            delegatedDecisions: [...new Set([...cur.agreements.delegatedDecisions, ...selection.deleg])],
          },
        });
      }
      return '関係者分析を保存しました（合意事項の候補は「未合意」のまま反映しています）';
    },
  });
}
