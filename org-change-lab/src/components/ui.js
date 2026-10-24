// 共通 UI 部品：トースト・モーダル・確認ダイアログ・フォーム・ラベル
import { h, clear, nextId } from './dom.js';
import { ValidationError } from '../repositories/repository.js';

// ---------- トースト ----------

export function toast(message, kind = 'success', timeout = 3500) {
  let region = document.getElementById('toasts');
  if (!region) {
    region = h('div', { id: 'toasts', class: 'toasts', 'aria-live': 'polite', role: 'status' });
    document.body.append(region);
  }
  const icon = { success: '✓', error: '!', info: 'i', warning: '!' }[kind] || 'i';
  const el = h('div', { class: `toast toast-${kind}` }, h('span', { class: 'toast-icon', 'aria-hidden': 'true' }, icon), h('span', {}, message));
  if (kind === 'error') el.setAttribute('role', 'alert');
  region.append(el);
  setTimeout(() => el.remove(), kind === 'error' ? timeout * 2 : timeout);
}

// ---------- モーダル ----------

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function openModal({ title, body, actions = [], size = 'md', onClose, dismissable = true }) {
  const previous = document.activeElement;
  const titleId = nextId('modal-title');
  const footer = h('div', { class: 'modal-footer' });
  const dialog = h('div', { class: `modal modal-${size}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
    h('div', { class: 'modal-header' },
      h('h2', { id: titleId, class: 'modal-title' }, title),
      dismissable ? h('button', { class: 'btn-icon', type: 'button', 'aria-label': '閉じる', onClick: () => close() }, '×') : null),
    h('div', { class: 'modal-body' }, body),
    footer);
  const backdrop = h('div', { class: 'modal-backdrop' }, dialog);
  let closed = false;
  function close(result) {
    if (closed) return;
    closed = true;
    backdrop.remove();
    document.removeEventListener('keydown', onKey, true);
    document.body.classList.remove('modal-open');
    if (previous && previous.focus) previous.focus();
    if (onClose) onClose(result);
  }
  function onKey(e) {
    if (e.key === 'Escape' && dismissable) { e.stopPropagation(); close(); }
    if (e.key === 'Tab') {
      const items = [...dialog.querySelectorAll(FOCUSABLE)].filter((x) => x.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  function setActions(list) {
    clear(footer);
    for (const a of list) {
      footer.append(h('button', {
        type: a.type || 'button',
        class: `btn ${a.kind ? `btn-${a.kind}` : ''}`,
        disabled: a.disabled,
        onClick: (e) => (a.onClick ? a.onClick(e, { close }) : close()),
      }, a.label));
    }
    footer.hidden = list.length === 0;
  }
  setActions(actions);
  backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop && dismissable) close(); });
  document.addEventListener('keydown', onKey, true);
  document.body.append(backdrop);
  document.body.classList.add('modal-open');
  const firstInput = dialog.querySelector('.modal-body ' + FOCUSABLE) || dialog.querySelector(FOCUSABLE);
  if (firstInput) firstInput.focus();
  return { close, dialog, setActions, footer };
}

export function confirmDialog({ title, message, confirmLabel = 'OK', danger = false, requireText = null }) {
  return new Promise((resolve) => {
    let input = null;
    const body = h('div', {}, ...(Array.isArray(message) ? message : [message]).map((m) => (m instanceof Node ? m : h('p', {}, m))));
    if (requireText) {
      const id = nextId('confirm');
      input = h('input', { id, class: 'input', autocomplete: 'off' });
      body.append(h('label', { class: 'label', for: id }, `確認のため「${requireText}」と入力してください`), input);
    }
    const m = openModal({
      title, body, size: 'sm',
      onClose: (r) => resolve(Boolean(r)),
      actions: [
        { label: 'キャンセル', onClick: (_, { close }) => close(false) },
        {
          label: confirmLabel, kind: danger ? 'danger' : 'primary',
          onClick: (_, { close }) => {
            if (requireText && input.value.trim() !== requireText) { input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
            close(true);
          },
        },
      ],
    });
    if (!requireText) m.footer.lastChild.focus();
  });
}

// ---------- フォーム ----------
// def: { name, label, type: text|textarea|list|select|date|number|checkbox|checkboxes, required, options, help, placeholder, rows }

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setPath(obj, path, value) {
  const keys = path.split('.');
  let o = obj;
  keys.slice(0, -1).forEach((k) => { o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {}; o = o[k]; });
  o[keys[keys.length - 1]] = value;
}

export function renderField(def, values = {}) {
  const id = nextId('f');
  const v = def.value !== undefined ? def.value : getPath(values, def.name);
  const helpId = def.help ? `${id}-help` : null;
  const errId = `${id}-err`;
  const describedBy = [helpId, errId].filter(Boolean).join(' ');
  const common = { id, name: def.name, 'aria-describedby': describedBy, required: def.required && def.type !== 'checkboxes' ? true : null, placeholder: def.placeholder || null };
  let control;
  switch (def.type) {
    case 'textarea':
      control = h('textarea', { ...common, class: 'input', rows: def.rows || 3 }, v ?? '');
      break;
    case 'list':
      control = h('textarea', { ...common, class: 'input', rows: def.rows || 3, dataset: { kind: 'list' } }, Array.isArray(v) ? v.join('\n') : (v ?? ''));
      break;
    case 'select':
      control = h('select', { ...common, class: 'input' },
        def.placeholderOption ? h('option', { value: '' }, def.placeholderOption) : null,
        ...def.options.map((o) => h('option', { value: o.value, selected: String(o.value) === String(v ?? '') }, o.label)));
      break;
    case 'checkbox':
      control = h('input', { ...common, type: 'checkbox', checked: Boolean(v), class: 'checkbox' });
      return h('div', { class: 'field field-checkbox', dataset: { field: def.name } },
        h('label', { class: 'check', for: id }, control, h('span', {}, def.label)),
        def.help ? h('p', { class: 'help', id: helpId }, def.help) : null,
        h('p', { class: 'field-error', id: errId, 'data-error-for': def.name }));
    case 'checkboxes': {
      const set = new Set(Array.isArray(v) ? v : []);
      control = h('div', { class: 'checks', role: 'group', 'aria-labelledby': `${id}-legend`, dataset: { kind: 'checkboxes', name: def.name } },
        def.options.length === 0 ? h('p', { class: 'muted' }, def.emptyText || '選択肢がありません') : null,
        ...def.options.map((o) => {
          const cid = nextId('c');
          return h('label', { class: 'check', for: cid }, h('input', { id: cid, type: 'checkbox', value: o.value, checked: set.has(o.value), class: 'checkbox' }), h('span', {}, o.label));
        }));
      return h('div', { class: 'field', dataset: { field: def.name } },
        h('span', { class: 'label', id: `${id}-legend` }, def.label, def.required ? h('span', { class: 'req' }, '必須') : null),
        def.help ? h('p', { class: 'help', id: helpId }, def.help) : null,
        control,
        h('p', { class: 'field-error', id: errId, 'data-error-for': def.name }));
    }
    default:
      control = h('input', { ...common, class: 'input', type: def.type || 'text', value: v ?? '', step: def.type === 'number' ? 'any' : null });
  }
  return h('div', { class: ['field', def.wide ? 'field-wide' : ''], dataset: { field: def.name } },
    h('label', { class: 'label', for: id }, def.label, def.required ? h('span', { class: 'req' }, '必須') : null),
    def.help ? h('p', { class: 'help', id: helpId }, def.help) : null,
    control,
    h('p', { class: 'field-error', id: errId, 'data-error-for': def.name }));
}

export function renderFields(defs, values) {
  return h('div', { class: 'form-grid' }, defs.map((d) => (d.section ? h('h3', { class: 'form-section' }, d.section) : renderField(d, values))));
}

export function readForm(root, defs) {
  const out = {};
  for (const d of defs) {
    if (d.section) continue;
    const wrap = root.querySelector(`[data-field="${CSS.escape(d.name)}"]`);
    if (!wrap) continue;
    let v;
    if (d.type === 'checkbox') v = wrap.querySelector('input').checked;
    else if (d.type === 'checkboxes') v = [...wrap.querySelectorAll('input:checked')].map((x) => x.value);
    else {
      const el = wrap.querySelector('input, textarea, select');
      v = el.value;
      if (d.type === 'list') v = v.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
      else if (d.type === 'number') v = v.trim() === '' ? null : v;
    }
    setPath(out, d.name, v);
  }
  return out;
}

export function showErrors(root, errors = {}) {
  root.querySelectorAll('.field-error').forEach((e) => { e.textContent = ''; });
  root.querySelectorAll('[aria-invalid]').forEach((e) => e.removeAttribute('aria-invalid'));
  let first = null;
  for (const [name, msg] of Object.entries(errors)) {
    const slot = root.querySelector(`[data-error-for="${CSS.escape(name)}"]`);
    if (!slot) continue;
    slot.textContent = msg;
    const input = slot.parentElement.querySelector('input, textarea, select');
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      if (!first) first = input;
    }
  }
  if (first) first.focus();
  return Object.keys(errors).length;
}

/**
 * フォームモーダル。onSubmit が ValidationError を投げたら項目の近くに表示し、
 * それ以外の失敗（保存失敗など）はモーダル内に表示して入力内容を保持する。
 */
export function formModal({ title, defs, values = {}, onSubmit, submitLabel = '保存', intro = null, size = 'md', extraActions = [], onClose = null }) {
  const form = h('form', { class: 'form', novalidate: true });
  const banner = h('div', { class: 'form-banner', role: 'alert', hidden: true });
  form.append(banner);
  if (intro) form.append(intro);
  form.append(renderFields(defs, values));
  const submit = async (e) => {
    if (e) e.preventDefault();
    banner.hidden = true;
    const data = readForm(form, defs);
    try {
      const localErrors = defs.filter((d) => d.required && !d.section).reduce((acc, d) => {
        const v = getPath(data, d.name);
        if (v === undefined || v === null || (Array.isArray(v) ? v.length === 0 : String(v).trim() === '')) acc[d.name] = `${d.label}を入力してください`;
        return acc;
      }, {});
      if (showErrors(form, localErrors)) return;
      m.footer.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      await onSubmit(data);
      m.close(true);
    } catch (err) {
      m.footer.querySelectorAll('button').forEach((b) => { b.disabled = false; });
      if (err instanceof ValidationError) {
        const shown = showErrors(form, err.errors);
        if (!shown || Object.keys(err.errors).some((k) => !form.querySelector(`[data-error-for="${CSS.escape(k)}"]`))) {
          banner.textContent = err.message;
          banner.hidden = false;
        }
      } else {
        banner.textContent = `保存に失敗しました。入力内容は残っています。もう一度お試しください（${err.message}）`;
        banner.hidden = false;
        banner.scrollIntoView({ block: 'nearest' });
      }
    }
  };
  form.addEventListener('submit', submit);
  const m = openModal({
    title, body: form, size, onClose,
    actions: [
      ...extraActions,
      { label: 'キャンセル' },
      { label: submitLabel, kind: 'primary', onClick: () => submit() },
    ],
  });
  return m;
}

// ---------- ラベル・バッジ ----------
// 色だけで意味を伝えないよう、必ず記号とテキストを併記する

const KIND = {
  fact: { icon: '■', text: '事実' },
  interpretation: { icon: '◇', text: '解釈' },
  hypothesis: { icon: '△', text: '仮説' },
  decision: { icon: '●', text: '判断' },
  ai: { icon: '✦', text: 'AI提案' },
  warning: { icon: '!', text: '注意' },
};

export function kindLabel(kind, text) {
  const k = KIND[kind];
  return h('span', { class: `kind kind-${kind}` }, h('span', { 'aria-hidden': 'true' }, k.icon), ` ${text || k.text}`);
}

export function badge(text, tone = 'neutral', title = null) {
  return h('span', { class: `badge badge-${tone}`, title }, text);
}

export function statusBadge(status, label) {
  const tone = {
    problem_discovery: 'blue', hypothesis_testing: 'amber', intervention_design: 'violet', preparation: 'teal',
    running: 'green', verification: 'orange', completed: 'gray', on_hold: 'gray', cancelled: 'red',
  }[status] || 'neutral';
  return h('span', { class: `badge badge-${tone} status-badge` }, label);
}

export function emptyState(message, action = null) {
  return h('div', { class: 'empty' }, h('p', {}, message), action);
}

export function button(label, onClick, kind = '', attrs = {}) {
  return h('button', { type: 'button', class: `btn ${kind ? `btn-${kind}` : ''}`, onClick, ...attrs }, label);
}

export function section(title, ...children) {
  return h('section', { class: 'card' }, h('h2', { class: 'card-title' }, title), ...children);
}

export function bulletList(items, empty = '未入力') {
  if (!items || !items.length) return h('p', { class: 'muted' }, empty);
  return h('ul', { class: 'bullets' }, items.map((x) => h('li', {}, x)));
}

export function definitionList(rows) {
  return h('dl', { class: 'deflist' }, rows.filter(Boolean).map(([k, v]) => [h('dt', {}, k), h('dd', {}, v === null || v === undefined || v === '' ? h('span', { class: 'muted' }, '未入力') : v)]));
}
