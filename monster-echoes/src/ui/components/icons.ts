// メニュー・フィールドの ボタンに つかう 小さな アイコン（参考画像2「メニュー画面」の まるい アイコン）。
// 端末の 絵文字に たよらず、SVG で おなじ 見た目に する。
const P: Record<string, string> = {
  monster: '<path d="M12 21c-4 0-7-2.6-7-5.6C5 11 8.2 6 12 6s7 5 7 9.4C19 18.4 16 21 12 21z"/><circle cx="9.5" cy="14" r="1.2" fill="#0c1430"/><circle cx="14.5" cy="14" r="1.2" fill="#0c1430"/><path d="M11 4.5c.6-1.4 2-2 3-1.5-1 .4-1.6 1.2-1.7 2.4z"/>',
  breed: '<path d="M9 3h6v2h-1v4.5l5 8.5c.8 1.5-.2 3-1.8 3H6.8C5.2 21 4.2 19.5 5 18l5-8.5V5H9z"/><circle cx="10" cy="16" r="1.3" fill="#0c1430"/><circle cx="13.6" cy="17.6" r=".9" fill="#0c1430"/>',
  dex: '<path d="M4 4.5C6.5 3.5 9.5 3.6 12 5c2.5-1.4 5.5-1.5 8-.5V19c-2.5-1-5.5-.9-8 .5-2.5-1.4-5.5-1.5-8-.5z"/><path d="M12 5v14.5" stroke="#0c1430" stroke-width="1.2"/>',
  bag: '<path d="M8 7V6a4 4 0 0 1 8 0v1h2.5l1 13.5H4.5L5.5 7zM10 7h4V6a2 2 0 0 0-4 0z"/>',
  tactic: '<path d="M5 3h1.6v18H5z"/><path d="M7 4h11l-2.6 4L18 12H7z"/>',
  skill: '<path d="M12 2.5l2.6 6 6.4.6-4.9 4.3 1.5 6.3L12 16.4 6.4 19.7l1.5-6.3L3 9.1l6.4-.6z"/>',
  memo: '<path d="M6 3h9l4 4v14H6z"/><path d="M8.5 11h7M8.5 14h7M8.5 17h5" stroke="#0c1430" stroke-width="1.3"/>',
  save: '<path d="M4 4h13l3 3v13H4z"/><path d="M7 4h9v5H7z" fill="#0c1430"/><circle cx="12" cy="15" r="2.6" fill="#0c1430"/>',
  option: '<path d="M10.3 2h3.4l.5 2.6 1.9.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.9 2.6.5v3.4l-2.6.5-.8 1.9 1.5 2.2-2.4 2.4-2.2-1.5-1.9.8-.5 2.6h-3.4l-.5-2.6-1.9-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.9L2 13.7v-3.4l2.6-.5.8-1.9L3.9 5.7l2.4-2.4 2.2 1.5 1.9-.8z"/><circle cx="12" cy="12" r="3" fill="#0c1430"/>',
  home: '<path d="M12 3l9 8h-2.5v9.5h-5V15h-3v5.5h-5V11H3z"/>',
  ranch: '<path d="M3 10l9-6 9 6v10.5H3z"/><path d="M8 20.5v-6h8v6" fill="#0c1430"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M9.5 9.5h4a1.7 1.7 0 0 1 0 3.4h-3a1.7 1.7 0 0 0 0 3.4h4" stroke="#7a5a08" stroke-width="1.5" fill="none"/>',
  spring: '<path d="M12 3c3 4 6 7.4 6 11a6 6 0 0 1-12 0c0-3.6 3-7 6-11z"/>',
};

/** アイコン（SVG）。色は currentColor */
export function icon(name: string, cls = 'ico'): HTMLElement {
  const s = document.createElement('span');
  s.className = cls;
  s.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">${P[name] ?? ''}</svg>`;
  return s;
}
