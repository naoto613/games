// SCR-06 知見・設定
import { AI_MODES, APP_VERSION, SCHEMA_VERSION, LEARNING_PATTERNS, RESULT_CERTAINTY } from '../constants.js';
import { today } from '../domain/common.js';
import { h, download } from '../components/dom.js';
import { button, toast, confirmDialog, openModal, badge, emptyState, renderFields, readForm } from '../components/ui.js';
import { checkBackend } from '../ai/aiClient.js';
import { buildExport, validateImport, findConflicts, applyImport, initiativesCsv } from '../services/exportService.js';
import { loadSampleData } from '../services/sampleData.js';
import { learningItem } from './learning.js';

const SECTIONS = [
  { key: 'knowledge', label: '知見' },
  { key: 'ai', label: 'AI接続' },
  { key: 'data', label: 'データ' },
  { key: 'privacy', label: 'プライバシー' },
  { key: 'about', label: 'このアプリについて' },
];

export async function renderSettings(view, ctx, params) {
  const section = SECTIONS.some((s) => s.key === params.section) ? params.section : 'ai';
  view.append(h('header', { class: 'page-head' }, h('h1', { class: 'page-title' }, section === 'knowledge' ? '知見' : '設定')));
  view.append(h('nav', { class: 'tabs', 'aria-label': '知見・設定' }, SECTIONS.map((s) => h('a', { class: 'tab', href: `#/settings/${s.key}`, 'aria-current': s.key === section ? 'page' : null }, s.label))));
  const body = h('div', { class: 'tab-body' });
  view.append(body);
  await ({ knowledge, ai, data, privacy, about })[section](body, ctx);
}

// ---------- 知見 ----------

const knowledgeState = { q: '', pattern: '' };

async function knowledge(body, ctx) {
  const bundles = await ctx.repo.loadAllBundles();
  const all = bundles.flatMap((b) => b.learningRecords.map((l) => ({ l, i: b.initiative })))
    .sort((a, b) => String(b.l.createdAt).localeCompare(String(a.l.createdAt)));
  const list = h('ul', { class: 'item-list' });
  const q = h('input', { class: 'input', type: 'search', placeholder: 'キーワード（課題・介入・条件など）', 'aria-label': '知見を検索', value: knowledgeState.q });
  const pattern = h('select', { class: 'input', 'aria-label': 'パターンで絞り込む' }, h('option', { value: '' }, 'すべてのパターン'), LEARNING_PATTERNS.map((p) => h('option', { value: p.value, selected: knowledgeState.pattern === p.value }, p.label)));
  const draw = () => {
    knowledgeState.q = q.value;
    knowledgeState.pattern = pattern.value;
    const kw = q.value.trim().toLowerCase();
    const rows = all.filter(({ l }) => (!pattern.value || l.pattern === pattern.value)
      && (!kw || JSON.stringify(l).toLowerCase().includes(kw)));
    list.replaceChildren(...rows.map(({ l, i }) => learningItem(l, null, i)));
    if (!rows.length) list.append(h('li', { class: 'muted' }, all.length ? '条件に合う知見はありません' : ''));
  };
  q.addEventListener('input', draw);
  pattern.addEventListener('change', draw);
  const count = (p) => all.filter(({ l }) => l.pattern === p).length;
  body.append(h('section', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', { class: 'card-title' }, `蓄積された知見（${all.length}）`), h('div', { class: 'row gap filters' }, q, pattern)),
    h('p', { class: 'small muted' }, `成功パターン ${count('success')}／失敗パターン ${count('failure')}／条件付き ${count('mixed')}／判断できない ${count('unknown')}。結果が未確認の知見は「${RESULT_CERTAINTY[2].label}」と表示します。`),
    all.length ? list : emptyState('まだ知見はありません。案件の「学習記録」タブで、うまくいったこと・いかなかったことを記録すると、ここに集まります。')));
  if (all.length) draw();
}

// ---------- AI接続 ----------

async function ai(body, ctx) {
  const s = ctx.settings;
  const defs = [
    { name: 'aiMode', label: 'AIの使い方', type: 'select', options: AI_MODES.map((m) => ({ value: m.value, label: m.label })) },
    { name: 'backendUrl', label: 'バックエンドのURL（バックエンド経由の場合）', help: '同じサーバーで server/index.js を起動した場合は ./api のままで動きます。' },
    { name: 'model', label: 'モデル名', help: 'バックエンド側で許可されたモデルのみ使えます。' },
  ];
  const form = h('form', { class: 'form', novalidate: true }, renderFields(defs, s));
  const statusBox = h('div', { role: 'status', 'aria-live': 'polite' });
  const test = async () => {
    statusBox.replaceChildren(h('p', { class: 'muted' }, '接続を確認しています…'));
    try {
      const v = readForm(form, defs);
      const r = await checkBackend(v.backendUrl);
      statusBox.replaceChildren(h('div', { class: r.configured ? 'alert alert-success' : 'alert alert-warning' },
        h('p', { class: 'alert-title' }, r.configured ? '接続できました' : 'バックエンドには接続できましたが、APIキーが設定されていません'),
        h('p', { class: 'small' }, `プロバイダー：${r.provider || '不明'}／既定のモデル：${r.model || '不明'}`),
        !r.configured ? h('p', { class: 'small' }, 'サーバーを起動する端末で環境変数 ANTHROPIC_API_KEY を設定してから再起動してください。') : null));
    } catch (e) {
      statusBox.replaceChildren(h('div', { class: 'alert alert-error' }, h('p', { class: 'alert-title' }, '接続できません'), h('p', { class: 'small' }, e.message),
        h('p', { class: 'small' }, 'GitHub Pages などの静的ホスティングではバックエンドが動かないため、「コピー＆ペースト方式」を使うか、README の手順で server/ を起動してください。')));
    }
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await ctx.repo.saveSettings(readForm(form, defs));
      await ctx.reloadSettings();
      toast('AI接続の設定を保存しました');
      ctx.rerender();
    } catch (err) { toast(`保存に失敗しました：${err.message}`, 'error'); }
  });
  form.append(h('div', { class: 'row gap end' }, button('接続を確認', test), h('button', { class: 'btn btn-primary', type: 'submit' }, '保存')));
  body.append(h('section', { class: 'card' },
    h('h2', { class: 'card-title' }, 'AI接続'),
    h('ul', { class: 'bullets small' }, AI_MODES.map((m) => h('li', {}, h('strong', {}, m.label), `：${m.desc}`))),
    h('div', { class: 'alert alert-info small' },
      h('p', {}, 'APIキーはブラウザ（ローカルストレージ・IndexedDB）に保存しません。バックエンド経由の場合、キーはサーバー側の環境変数でだけ管理します。'),
      h('p', {}, 'AIの利用上限に達した・接続できない場合でも、コピー＆ペースト方式か手動入力で同じ作業を続けられます。')),
    form, statusBox));
}

// ---------- データ ----------

async function data(body, ctx) {
  const initiatives = await ctx.repo.listInitiatives();
  let persisted = null;
  try { persisted = navigator.storage?.persisted ? await navigator.storage.persisted() : null; } catch { persisted = null; }

  const exportAll = async () => {
    const bundles = await ctx.repo.loadAllBundles();
    if (!bundles.length) { toast('エクスポートする案件がありません', 'info'); return; }
    download(`org-change-lab_backup_${today()}.json`, JSON.stringify(buildExport(bundles), null, 2), 'application/json');
    toast(`${bundles.length} 件の案件を書き出しました`);
  };

  const file = h('input', { type: 'file', accept: '.json,application/json', class: 'input', id: 'import-file' });
  const importBox = h('div', { role: 'status' });
  file.addEventListener('change', () => handleImport(ctx, file, importBox));

  body.append(h('section', { class: 'card' },
    h('h2', { class: 'card-title' }, 'バックアップ（JSONエクスポート）'),
    h('p', {}, `保存されている案件：${initiatives.length} 件。案件・事実・仮説・介入案・計画・指標・意思決定・学び・AI分析結果をすべて含みます。`),
    h('div', { class: 'row gap wrap' }, button('すべてをJSONでエクスポート', exportAll, 'primary'),
      initiatives.length ? button('案件一覧をCSVで出力', () => download(`org-change-lab_initiatives_${today()}.csv`, initiativesCsv(initiatives), 'text/csv')) : null),
    h('p', { class: 'small muted' }, '案件ごとのエクスポートは、各案件の画面上部から行えます。')));

  body.append(h('section', { class: 'card' },
    h('h2', { class: 'card-title' }, '復元（JSONインポート）'),
    h('p', { class: 'small' }, '読み込む前に内容を検証します。不正なファイルは読み込まず、エラー箇所を表示します。同じIDの案件がある場合は、上書き・別案件として追加・スキップを選べます。'),
    h('label', { class: 'label', for: 'import-file' }, 'JSONファイルを選択'), file, importBox));

  body.append(h('section', { class: 'card' },
    h('h2', { class: 'card-title' }, 'サンプルデータ'),
    h('p', { class: 'small' }, '設計書の利用シーン（CRMチームの自律性向上・チーム間の共同意思決定・Backlogテンプレートの効果検証）を【サンプル】として追加します。表示される値は実際の実績値ではありません。'),
    button('サンプルデータを読み込む', async () => {
      try { const n = await loadSampleData(ctx.repo); toast(`サンプル案件を ${n} 件追加しました`); ctx.navigate('/'); } catch (e) { toast(`読み込みに失敗しました：${e.message}`, 'error'); }
    })));

  body.append(h('section', { class: 'card' },
    h('h2', { class: 'card-title' }, '保存場所について'),
    h('p', { class: 'small' }, ctx.repo.persistent ? 'データはこのブラウザの IndexedDB に保存されています。' : '現在、保存領域を利用できないため、データは保存されていません（ページを閉じると失われます）。'),
    h('p', { class: 'small' }, 'ブラウザのデータ消去・プライベートブラウズ・容量不足などでデータが失われる可能性があります。失われたデータは復旧できない場合があるため、JSONバックアップから復元してください。'),
    persisted === false && navigator.storage?.persist ? button('このサイトのデータを消去されにくくする（永続化をリクエスト）', async () => {
      const ok = await navigator.storage.persist();
      toast(ok ? '永続化が許可されました' : 'ブラウザが永続化を許可しませんでした', ok ? 'success' : 'info');
    }, 'small') : persisted ? h('p', { class: 'small' }, badge('永続化が有効', 'green')) : null));

  body.append(h('section', { class: 'card danger-zone' },
    h('h2', { class: 'card-title' }, 'アプリ内データの初期化'),
    h('p', { class: 'small' }, 'このブラウザに保存されているすべての案件・設定を削除します。元に戻せません。先にバックアップを取ってください。'),
    button('すべてのデータを削除', async () => {
      const ok = await confirmDialog({ title: 'すべてのデータを削除しますか？', message: [`案件 ${initiatives.length} 件と関連データ、設定をすべて削除します。この操作は元に戻せません。`], confirmLabel: 'すべて削除', danger: true, requireText: '初期化' });
      if (!ok) return;
      try { await ctx.repo.clearAll(); await ctx.reloadSettings(); toast('すべてのデータを削除しました'); ctx.navigate('/'); } catch (e) { toast(`削除に失敗しました：${e.message}`, 'error'); }
    }, 'danger')));
}

async function handleImport(ctx, file, box) {
  const f = file.files[0];
  if (!f) return;
  box.replaceChildren(h('p', { class: 'muted' }, `読み込み中…（${Math.ceil(f.size / 1024)} KB）`));
  let json;
  try {
    if (f.size > 50 * 1024 * 1024) throw new Error('ファイルが大きすぎます（50MBまで）');
    json = JSON.parse(await f.text());
  } catch (e) {
    box.replaceChildren(h('div', { class: 'alert alert-error' }, h('p', { class: 'alert-title' }, '読み込みを中止しました'), h('p', {}, `JSONとして読み取れません：${e.message}`)));
    file.value = '';
    return;
  }
  const v = validateImport(json);
  if (!v.ok) {
    box.replaceChildren(h('div', { class: 'alert alert-error' },
      h('p', { class: 'alert-title' }, `読み込みを中止しました（エラー ${v.errors.length} 件）。データは変更していません。`),
      h('ul', { class: 'bullets small' }, v.errors.slice(0, 50).map((e) => h('li', {}, h('code', {}, e.path), `：${e.message}`)))));
    file.value = '';
    return;
  }
  const conflicts = await findConflicts(ctx.repo, v.data);
  const choices = new Map(conflicts.map((c) => [c.id, h('select', { class: 'input input-inline', 'aria-label': `「${c.title}」の扱い` },
    h('option', { value: 'skip' }, 'スキップ（既存を残す）'), h('option', { value: 'overwrite' }, '上書き'), h('option', { value: 'add_new' }, '別案件として追加'))]));
  const total = v.data.initiatives.length;
  const m = openModal({
    title: 'インポートの確認',
    size: 'lg',
    body: h('div', {},
      h('p', {}, `案件 ${total} 件（新規 ${total - conflicts.length} 件／同じIDが既にある ${conflicts.length} 件）を読み込みます。`),
      h('p', { class: 'small muted' }, `エクスポート日時：${json.exportedAt || '不明'}／スキーマ v${json.schemaVersion}`),
      conflicts.length ? h('div', {}, h('h3', { class: 'subhead' }, '同じIDの案件の扱い'),
        h('table', { class: 'table' }, h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'ファイルの案件'), h('th', { scope: 'col' }, '既存の案件'), h('th', { scope: 'col' }, '扱い'))),
          h('tbody', {}, conflicts.map((c) => h('tr', {}, h('td', {}, c.title), h('td', {}, c.existingTitle, h('div', { class: 'small muted' }, `更新：${String(c.existingUpdatedAt).slice(0, 10)}`)), h('td', {}, choices.get(c.id))))))) : null,
      h('p', { class: 'small' }, '「上書き」を選ぶと、既存の案件と関連データはファイルの内容に置き換わります。')),
    actions: [
      { label: 'キャンセル', onClick: (_, { close }) => { close(); file.value = ''; box.replaceChildren(h('p', { class: 'muted small' }, 'インポートをキャンセルしました')); } },
      {
        label: 'インポートする', kind: 'primary', onClick: async (_, { close }) => {
          const decisions = Object.fromEntries([...choices.entries()].map(([id, sel]) => [id, sel.value]));
          try {
            const r = await applyImport(ctx.repo, v.data, decisions);
            close();
            file.value = '';
            box.replaceChildren(h('div', { class: 'alert alert-success' }, h('p', {}, `追加 ${r.added} 件／上書き ${r.overwritten} 件／スキップ ${r.skipped} 件`)));
            toast('インポートしました');
          } catch (e) { toast(`インポートに失敗しました：${e.message}`, 'error'); }
        },
      },
    ],
  });
  return m;
}

// ---------- プライバシー ----------

async function privacy(body) {
  body.append(h('section', { class: 'card prose-card' },
    h('h2', { class: 'card-title' }, 'プライバシーとデータの取り扱い'),
    h('h3', { class: 'subhead' }, '保存'),
    h('ul', { class: 'bullets' },
      h('li', {}, '入力したデータは、このブラウザの IndexedDB にだけ保存されます。開発者や外部のサーバーには送信されません。'),
      h('li', {}, 'ローカル保存は、端末やブラウザへのアクセスを制御する認証・暗号化の代わりにはなりません。共有端末では利用しないでください。'),
      h('li', {}, 'エクスポートと削除はいつでも実行できます（「データ」タブ）。')),
    h('h3', { class: 'subhead' }, 'AIへの送信'),
    h('ul', { class: 'bullets' },
      h('li', {}, 'AIを使うときは、送信前に送信する内容の要約と全文を表示します。内部IDは送りません。'),
      h('li', {}, 'メールアドレス・電話番号・「〜さん」などの個人名らしき表記を検出したら警告します。分析には役割名や匿名化した情報を使ってください。'),
      h('li', {}, 'APIキーはブラウザに保存せず、バックエンドの環境変数でのみ扱います。外部APIの利用条件・データ保持条件はプロバイダーの規約で確認してください。'),
      h('li', {}, 'AIの出力を自動で社内システムに投稿することはありません。')),
    h('h3', { class: 'subhead' }, '人事評価に使わない'),
    h('ul', { class: 'bullets' },
      h('li', {}, 'このアプリは、個人の能力・意欲・心理状態・将来性を評価するものではありません。'),
      h('li', {}, '分析の対象は、プロセス・責任境界・依存関係・情報共有・意思決定などの構造です。実在する個人の能力評価や人事判断にAIの推測を使わないでください。')),
    h('p', { class: 'small muted' }, '機密性の高い情報を扱う場合は、保存・送信の方式を別途検討してください。')));
}

function themeCard() {
  let current = 'auto';
  try { current = localStorage.getItem('ocl-theme') || 'auto'; } catch { /* 保存領域が使えない環境 */ }
  const sel = h('select', { class: 'input input-inline', id: 'theme-select' },
    [['auto', 'OSの設定に合わせる'], ['light', 'ライト'], ['dark', 'ダーク']].map(([v, l]) => h('option', { value: v, selected: v === current }, l)));
  sel.addEventListener('change', () => {
    // テーマのような少量の設定だけ localStorage に置く（案件データは IndexedDB）
    try { if (sel.value === 'auto') localStorage.removeItem('ocl-theme'); else localStorage.setItem('ocl-theme', sel.value); } catch { /* 保存できなくても表示は切り替える */ }
    if (sel.value === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = sel.value;
    toast('表示テーマを変更しました');
  });
  return h('section', { class: 'card' }, h('h2', { class: 'card-title' }, '表示'), h('label', { class: 'label', for: 'theme-select' }, 'テーマ'), sel);
}

async function about(body) {
  body.append(themeCard());
  body.append(h('section', { class: 'card prose-card' },
    h('h2', { class: 'card-title' }, 'Org Change Lab'),
    h('p', {}, 'エンジニアリングマネージャーが、組織の問題を発見し、原因を検証し、介入を選び、関係者を巻き込み、実行して、行動変化と成果を確認し、学ぶまでを一つの場所で扱うワークベンチです。'),
    h('p', {}, 'AIは提案者であり、決定者ではありません。どの問題を優先するか、どの仮説を採用するか、どの施策を実行するかは、あなたが決めます。'),
    h('dl', { class: 'deflist' }, h('dt', {}, 'バージョン'), h('dd', {}, APP_VERSION), h('dt', {}, 'データスキーマ'), h('dd', {}, `v${SCHEMA_VERSION}`)),
    h('h3', { class: 'subhead' }, 'キーボード操作'),
    h('ul', { class: 'bullets small' }, h('li', {}, 'Tab / Shift+Tab：項目の移動'), h('li', {}, 'Enter：ボタン・リンクの実行'), h('li', {}, 'Esc：ダイアログを閉じる'))));
}
