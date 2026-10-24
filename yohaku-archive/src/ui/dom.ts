// DOM の小さな道具
export function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, html?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

export function btn(label: string, cls: string, onClick: (ev: MouseEvent) => void): HTMLButtonElement {
  const b = el('button', cls, label);
  b.type = 'button';
  b.addEventListener('click', ev => { ev.stopPropagation(); onClick(ev); });
  return b;
}

export function esc(s: string): string {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

export const SVGNS = 'http://www.w3.org/2000/svg';
export function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}): SVGElementTagNameMap[K] {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}

export function wait(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export function bar(cur: number, max: number, cls: string): string {
  const p = Math.max(0, Math.min(100, (cur / Math.max(1, max)) * 100));
  return `<div class="bar ${cls}"><i style="width:${p}%"></i></div>`;
}
