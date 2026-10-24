// SCR-01 ホーム
import { STATUSES, ACTIVE_STATUSES, HYPOTHESIS_STATUSES, LEARNING_PATTERNS, RESULT_CERTAINTY, labelOf } from '../constants.js';
import { displayNextAction, isActive } from '../domain/initiative.js';
import { h, fmtDate } from '../components/dom.js';
import { statusBadge, badge, emptyState, button, toast } from '../components/ui.js';
import { loadSampleData } from '../services/sampleData.js';

const PAGE_SIZE = 20;

export function initiativeCard(bundle) {
  const i = bundle.initiative;
  const next = displayNextAction(bundle);
  return h('li', { class: 'initiative-card' },
    h('div', { class: 'initiative-card-head' },
      h('h3', { class: 'initiative-card-title' }, h('a', { href: `#/i/${i.id}` }, i.title)),
      statusBadge(i.status, labelOf(STATUSES, i.status))),
    h('p', { class: 'initiative-card-next' },
      h('span', { class: 'muted' }, '次の行動：'),
      next.source === 'suggested' ? h('span', {}, badge('候補・未決定', 'gray'), ' ', next.text) : next.text),
    h('div', { class: 'initiative-card-meta' },
      i.scope.length ? h('span', {}, `対象：${i.scope.join('・')}`) : null,
      h('span', {}, `事実 ${bundle.observations.length}／仮説 ${bundle.hypotheses.length}／介入案 ${bundle.interventions.length}`),
      h('span', {}, `最終更新：${fmtDate(i.updatedAt)}`),
      i.isSample ? badge('サンプル', 'gray') : null,
      i.archived ? badge('アーカイブ', 'gray') : null),
    h('a', { class: 'btn btn-small', href: `#/i/${i.id}`, 'aria-label': `${i.title}を開く` }, '案件を開く'));
}

export async function renderDashboard(view, ctx) {
  const bundles = await ctx.repo.loadAllBundles();
  const active = bundles.filter((b) => isActive(b.initiative));
  const others = bundles.filter((b) => !isActive(b.initiative));
  const counts = {
    active: active.length,
    verification: active.filter((b) => b.initiative.status === 'verification' || b.initiative.status === 'running').length,
    done: bundles.filter((b) => b.initiative.status === 'completed').length,
    hold: bundles.filter((b) => ['on_hold', 'cancelled'].includes(b.initiative.status) || b.initiative.archived).length,
  };

  view.append(h('section', { class: 'hero' },
    h('div', {},
      h('h1', { class: 'hero-title' }, '組織を変え、成果につなげる'),
      h('p', { class: 'hero-sub' }, '変革案件を管理し、実行結果から学ぶ')),
    h('a', { class: 'btn btn-primary btn-large', href: '#/new' }, '＋ 新しい変革案件を作成')));

  view.append(h('div', { class: 'stats', role: 'list' },
    stat('進行中の案件', counts.active), stat('実行・効果検証中', counts.verification), stat('完了', counts.done), stat('保留・中止・アーカイブ', counts.hold)));

  // 進行中の変革
  const listSection = h('section', { class: 'card' });
  const search = h('input', { class: 'input', type: 'search', placeholder: '案件名・対象で絞り込み', 'aria-label': '案件を絞り込む' });
  const statusFilter = h('select', { class: 'input', 'aria-label': 'ステータスで絞り込む' },
    h('option', { value: '' }, 'すべてのステータス'), ...STATUSES.filter((s) => ACTIVE_STATUSES.includes(s.value)).map((s) => h('option', { value: s.value }, s.label)));
  const ul = h('ul', { class: 'initiative-list' });
  const more = h('div', { class: 'center' });
  let limit = PAGE_SIZE;
  const draw = () => {
    const q = search.value.trim().toLowerCase();
    const st = statusFilter.value;
    const rows = active.filter((b) => (!st || b.initiative.status === st)
      && (!q || b.initiative.title.toLowerCase().includes(q) || b.initiative.scope.join(' ').toLowerCase().includes(q)));
    ul.replaceChildren(...rows.slice(0, limit).map(initiativeCard));
    more.replaceChildren(rows.length > limit ? button(`さらに表示（残り ${rows.length - limit} 件）`, () => { limit += PAGE_SIZE; draw(); }) : '');
    if (!rows.length && active.length) ul.append(h('li', { class: 'muted' }, '条件に合う案件はありません'));
  };
  search.addEventListener('input', () => { limit = PAGE_SIZE; draw(); });
  statusFilter.addEventListener('change', () => { limit = PAGE_SIZE; draw(); });
  listSection.append(h('div', { class: 'card-head' }, h('h2', { class: 'card-title' }, `進行中の変革（${active.length}）`),
    active.length > 3 ? h('div', { class: 'row gap filters' }, search, statusFilter) : null));
  if (!active.length) {
    listSection.append(emptyState(bundles.length ? '進行中の案件はありません。' : 'まだ変革案件がありません。気になっている組織の問題を1つ登録してみましょう。',
      h('div', { class: 'row gap center' },
        h('a', { class: 'btn btn-primary', href: '#/new' }, '最初の案件を作成'),
        bundles.length ? null : button('サンプルデータを見る', async () => {
          try { await loadSampleData(ctx.repo); toast('サンプルデータを読み込みました（実際の実績値ではありません）'); ctx.rerender(); } catch (e) { toast(`読み込みに失敗しました：${e.message}`, 'error'); }
        }))));
  } else {
    draw();
    listSection.append(ul, more);
  }
  view.append(listSection);

  // 最近の学び
  view.append(recentLearning(bundles));

  if (others.length) {
    const details = h('details', { class: 'card' }, h('summary', { class: 'card-title' }, `完了・保留・中止・アーカイブ（${others.length}）`),
      h('ul', { class: 'initiative-list' }, others.slice(0, 50).map(initiativeCard)));
    view.append(details);
  }
}

function stat(label, value) {
  return h('div', { class: 'stat', role: 'listitem' }, h('span', { class: 'stat-value' }, String(value)), h('span', { class: 'stat-label' }, label));
}

function recentLearning(bundles) {
  const learnings = bundles.flatMap((b) => b.learningRecords.map((l) => ({ l, i: b.initiative })))
    .sort((a, b) => String(b.l.createdAt).localeCompare(String(a.l.createdAt))).slice(0, 5);
  const verified = bundles.filter((b) => b.experimentPlans.some((p) => p.evaluation.observedChanges.length || p.evaluation.decision !== 'undecided')).slice(0, 5);
  const testing = bundles.flatMap((b) => b.hypotheses.filter((h2) => h2.status === 'testing').map((hy) => ({ hy, i: b.initiative }))).slice(0, 5);
  const reconsider = bundles.flatMap((b) => b.interventions.filter((v) => v.status === 'on_hold').map((v) => ({ v, i: b.initiative }))).slice(0, 5);
  const col = (title, items, empty) => h('div', { class: 'learn-col' }, h('h3', { class: 'subhead' }, title), items.length ? h('ul', { class: 'bullets' }, items) : h('p', { class: 'muted small' }, empty));
  return h('section', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', { class: 'card-title' }, '最近の学び'), h('a', { href: '#/settings/knowledge', class: 'small' }, '知見をすべて見る')),
    h('div', { class: 'learn-grid' },
      col('学習記録', learnings.map(({ l, i }) => h('li', {}, h('a', { href: `#/i/${i.id}/learning` }, l.title), ' ', badge(labelOf(LEARNING_PATTERNS, l.pattern), l.pattern === 'failure' ? 'red' : l.pattern === 'success' ? 'green' : 'gray'), ' ', h('span', { class: 'muted small' }, labelOf(RESULT_CERTAINTY, l.resultCertainty)))), '学習記録はまだありません'),
      col('検証結果が記録された案件', verified.map((b) => h('li', {}, h('a', { href: `#/i/${b.initiative.id}/execution` }, b.initiative.title))), '効果検証はまだありません'),
      col('検証中の仮説', testing.map(({ hy, i }) => h('li', {}, h('a', { href: `#/i/${i.id}/analysis` }, hy.title), h('span', { class: 'muted small' }, `（${labelOf(HYPOTHESIS_STATUSES, hy.status)}）`))), '検証中の仮説はありません'),
      col('再検討が必要な介入案（保留）', reconsider.map(({ v, i }) => h('li', {}, h('a', { href: `#/i/${i.id}/interventions` }, v.title), v.decisionReason ? h('span', { class: 'muted small' }, `：${v.decisionReason}`) : null)), '保留中の介入案はありません')));
}
