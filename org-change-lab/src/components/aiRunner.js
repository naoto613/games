// AI分析の共通フロー：入力チェック → 送信内容の確認 → 実行（API / コピー＆ペースト）→ 結果の確認・編集 → 保存
import { h, clear } from './dom.js';
import { openModal, toast, kindLabel, button } from './ui.js';
import { AGENT_INFO } from '../ai/agents.js';
import { AiError } from '../ai/aiClient.js';

const PROVIDER_TERMS = 'https://www.anthropic.com/legal/commercial-terms';

function aiErrorView(err, onRetry, onManual) {
  const hint = {
    network: 'ネットワークかバックエンド（server/）の状態を確認してください。AIを使わず手動で入力することもできます。',
    invalid: '応答の形式が不正だったため、何も保存していません。',
    empty: '応答が空だったため、何も保存していません。',
    limit: 'AIの利用上限に達しました。時間をおくか、コピー＆ペースト方式・手動入力に切り替えてください。',
    config: '設定画面でAIの接続方式を確認してください。',
  }[err.kind] || '入力内容は失われていません。';
  return h('div', { class: 'alert alert-error', role: 'alert' },
    h('p', { class: 'alert-title' }, err.message),
    h('p', {}, hint),
    err.details?.length ? h('details', {}, h('summary', {}, `詳細（${err.details.length}件）`), h('ul', { class: 'bullets small' }, err.details.slice(0, 20).map((d) => h('li', {}, d)))) : null,
    h('div', { class: 'row gap' }, onRetry ? button('再試行', onRetry, 'primary') : null, onManual ? button('コピー＆ペースト方式に切り替える', onManual) : null));
}

/**
 * opts:
 *  agent, bundle, options
 *  check(bundle) => { blockers: string[], warnings: string[] }
 *  renderResult(result, warnings) => { node, collect(): any }   // collect は保存時の選択内容
 *  onSave({ result, warnings, selection, mode, model, note }) => Promise<string|void>
 */
export function runAgentFlow(ctx, opts) {
  const settings = ctx.settings;
  if (settings.aiMode === 'off') {
    toast('AI機能は無効になっています。設定画面で有効にできます。手動での入力はいつでも可能です。', 'info');
    return;
  }
  const info = AGENT_INFO[opts.agent];
  const check = opts.check ? opts.check(opts.bundle) : { blockers: [], warnings: [] };
  let prepared;
  try {
    prepared = ctx.analysis.prepare(opts.agent, opts.bundle, opts.options);
  } catch (e) {
    toast(`AIへの入力を準備できませんでした：${e.message}`, 'error');
    return;
  }

  const body = h('div', { class: 'ai-flow' });
  const m = openModal({ title: `${info.name}`, body, size: 'lg' });
  let mode = settings.aiMode;

  function renderPreview() {
    clear(body);
    body.append(
      h('p', { class: 'muted' }, info.desc),
      check.blockers.length ? h('div', { class: 'alert alert-error', role: 'alert' },
        h('p', { class: 'alert-title' }, '実行前に次の情報を入力してください'),
        h('ul', { class: 'bullets' }, check.blockers.map((b) => h('li', {}, b)))) : null,
      check.warnings.length ? h('div', { class: 'alert alert-warning' },
        h('p', { class: 'alert-title' }, '入力が不足しています（このまま実行すると分析の質が下がります）'),
        h('ul', { class: 'bullets' }, check.warnings.map((b) => h('li', {}, b)))) : null,
      h('h3', { class: 'subhead' }, mode === 'backend' ? '外部AI APIに送信する内容' : 'AIに渡す内容'),
      h('ul', { class: 'bullets' }, prepared.summary.map((s) => h('li', {}, s))),
      h('p', { class: 'small muted' }, `送信サイズ：約 ${Math.ceil(prepared.size / 1024)} KB。内部IDは送らず、O1・H1 などの参照記号に置き換えています。`),
      prepared.sensitive.length ? h('div', { class: 'alert alert-warning' },
        h('p', { class: 'alert-title' }, '個人情報が含まれている可能性があります'),
        h('ul', { class: 'bullets' }, prepared.sensitive.map((s) => h('li', {}, `${s.label}：${s.samples.join('、')}`))),
        h('p', {}, '分析には役割名や匿名化した情報の利用を推奨します。該当箇所を編集してから実行してください。')) : null,
      h('details', { class: 'payload' }, h('summary', {}, '送信する全文を確認する'), h('pre', { class: 'code' }, JSON.stringify(prepared.input, null, 2))),
      mode === 'backend' ? h('p', { class: 'small muted' }, '外部APIの利用条件・データ保持条件は ', h('a', { href: PROVIDER_TERMS, target: '_blank', rel: 'noopener' }, 'プロバイダーの規約'), ' を確認してください。') : null,
    );
    const actions = [{ label: 'キャンセル' }];
    if (mode === 'backend') actions.push({ label: 'コピー＆ペースト方式で行う', onClick: () => { mode = 'manual'; renderPreview(); } });
    actions.push({
      label: mode === 'backend' ? '確認して送信' : 'プロンプトを表示',
      kind: 'primary',
      disabled: check.blockers.length > 0,
      onClick: () => (mode === 'backend' ? runBackend() : renderManual()),
    });
    m.setActions(actions);
  }

  async function runBackend() {
    clear(body);
    const controller = new AbortController();
    const started = Date.now();
    const status = h('p', { class: 'progress-text', role: 'status', 'aria-live': 'polite' }, 'AIが分析しています…');
    body.append(h('div', { class: 'progress' }, h('div', { class: 'spinner', 'aria-hidden': 'true' }), status),
      h('p', { class: 'small muted' }, '数十秒〜数分かかることがあります。中止しても入力内容は失われません。'));
    const timer = setInterval(() => { status.textContent = `AIが分析しています…（${Math.round((Date.now() - started) / 1000)}秒）`; }, 1000);
    m.setActions([{ label: '中止', onClick: () => controller.abort() }]);
    try {
      const res = await ctx.analysis.runBackend(prepared, settings, controller.signal);
      clearInterval(timer);
      renderReview(res.result, res.warnings, 'backend', res.model);
    } catch (e) {
      clearInterval(timer);
      const err = e instanceof AiError ? e : new AiError(e.message);
      clear(body);
      if (err.kind === 'aborted') { renderPreview(); toast('AI分析を中止しました', 'info'); return; }
      body.append(aiErrorView(err, runBackend, () => { mode = 'manual'; renderManual(); }));
      m.setActions([{ label: '閉じる' }]);
    }
  }

  function renderManual() {
    clear(body);
    const promptBox = h('textarea', { class: 'input code', rows: 10, readonly: true, 'aria-label': 'AIに貼り付けるプロンプト' }, prepared.manualPrompt);
    const answer = h('textarea', { class: 'input code', rows: 10, 'aria-label': 'AIの応答（JSON）', placeholder: '{ "analysisType": ... }' });
    const errSlot = h('div');
    body.append(
      h('ol', { class: 'steps' },
        h('li', {}, '下のプロンプトをコピーし、利用を認められているAIチャットに貼り付けます。'),
        h('li', {}, 'AIが返した JSON をそのまま下の欄に貼り付けます。'),
        h('li', {}, '形式を検証してから、内容を確認・編集して保存します。')),
      h('div', { class: 'row space' }, h('h3', { class: 'subhead' }, '1. プロンプト'),
        button('コピー', async () => {
          try { await navigator.clipboard.writeText(prepared.manualPrompt); toast('コピーしました'); } catch { promptBox.select(); toast('選択しました。Ctrl+C でコピーしてください', 'info'); }
        }, 'small')),
      promptBox,
      h('h3', { class: 'subhead' }, '2. AIの応答（JSON）'),
      answer, errSlot);
    m.setActions([
      { label: 'キャンセル' },
      {
        label: '検証して読み込む', kind: 'primary', onClick: () => {
          clear(errSlot);
          try {
            const res = ctx.analysis.parseManual(prepared, answer.value);
            renderReview(res.result, res.warnings, 'manual', null);
          } catch (e) {
            const err = e instanceof AiError ? e : new AiError(e.message, { kind: 'invalid' });
            errSlot.append(aiErrorView(err, null, null));
            answer.focus();
          }
        },
      },
    ]);
  }

  function renderReview(result, warnings, usedMode, model) {
    clear(body);
    const view = opts.renderResult(result, warnings);
    const note = h('textarea', { class: 'input', rows: 2, id: 'ai-note', placeholder: '例：仮説Bは根拠が弱いので保留' });
    body.append(
      h('div', { class: 'ai-banner' }, kindLabel('ai'),
        h('span', {}, 'これはAIの提案です。事実として確定したものではありません。採用する項目を選び、必要なら編集してから保存してください。')),
      warnings.length ? h('div', { class: 'alert alert-warning' }, h('p', { class: 'alert-title' }, '確認が必要な点'), h('ul', { class: 'bullets' }, warnings.map((w) => h('li', {}, w)))) : null,
      view.node,
      h('label', { class: 'label', for: 'ai-note' }, 'この分析についてのメモ（任意）'), note);
    m.setActions([
      { label: '破棄する', onClick: (_, { close }) => { close(); toast('AIの結果を破棄しました（何も保存していません）', 'info'); } },
      {
        label: '確認して保存', kind: 'primary', onClick: async (e) => {
          e.target.disabled = true;
          try {
            const msg = await opts.onSave({ result, warnings, selection: view.collect(), mode: usedMode, model, note: note.value });
            m.close();
            toast(msg || '保存しました');
            ctx.rerender();
          } catch (err) {
            e.target.disabled = false;
            toast(`保存に失敗しました。もう一度お試しください（${err.message}）`, 'error');
          }
        },
      },
    ]);
  }

  renderPreview();
}

// 結果表示用の小さな部品
export function selectableItem({ checked = true, title, children = [], label = '採用する' }) {
  const box = h('input', { type: 'checkbox', class: 'checkbox', checked, 'aria-label': `${label}：${title}` });
  const item = h('div', { class: 'ai-item' },
    h('label', { class: 'check ai-item-head' }, box, h('strong', {}, title)),
    h('div', { class: 'ai-item-body' }, children));
  return { item, box };
}

export function editableText(value, rows = 2, label = '') {
  return h('textarea', { class: 'input', rows, 'aria-label': label }, value || '');
}
