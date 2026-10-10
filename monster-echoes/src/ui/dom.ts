// DOM を組み立てる小さな関数
type Child = Node | string | number | null | undefined | false | Child[];
type Attrs = Record<string, unknown> & { class?: string; style?: string; onclick?: (e: MouseEvent) => void };

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs | null = null, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs)
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
      else if (k === 'class') el.className = String(v);
      else if (k === 'style') el.setAttribute('style', String(v));
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    }
  append(el, children);
  return el;
}
function append(el: Node, children: Child[]) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
  }
}
export const clear = (el: Element) => {
  while (el.firstChild) el.removeChild(el.firstChild);
};

/** 連打で二重に実行されないボタン */
export function btn(label: Child, onClick: () => void | Promise<unknown>, cls = ''): HTMLButtonElement {
  let busy = false;
  const b = h('button', { class: `btn ${cls}`, type: 'button' }, label);
  b.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (busy) return;
    busy = true;
    try {
      await onClick();
    } finally {
      setTimeout(() => (busy = false), 250);
    }
  });
  return b;
}

/** リストの 1 行（▶ カーソルつき） */
export function item(label: Child, onClick: () => void, opts: { disabled?: boolean; sel?: boolean; meta?: Child } = {}) {
  const b = h('button', { class: `item${opts.sel ? ' sel' : ''}`, type: 'button', disabled: opts.disabled }, h('span', { class: 'grow' }, label), opts.meta ? h('span', { class: 'meta' }, opts.meta) : null);
  let busy = false;
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    if (busy) return;
    busy = true;
    setTimeout(() => (busy = false), 250);
    onClick();
  });
  return b;
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
