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

/** どうぐの アイコン（参考画像3「ダンジョンの画面」：てにいれた どうぐの 絵） */
const ITEM_ICON: Record<string, [string, string]> = {
  heal: ['#6ad86a', '<path d="M12 21c-1-4-6-6-6-11 0-3 2.5-6 6-7 3.5 1 6 4 6 7 0 5-5 7-6 11z"/><path d="M12 20V7" stroke="#1a5a1a" stroke-width="1.3"/>'],
  mp: ['#6ab8ff', '<path d="M12 2.5c3.5 5 6.5 8.4 6.5 12a6.5 6.5 0 0 1-13 0c0-3.6 3-7 6.5-12z"/><ellipse cx="9.6" cy="14" rx="1.6" ry="2.4" fill="#e8f8ff"/>'],
  revive: ['#ffd84a', '<path d="M12 21c-1-4-6-6-6-11 0-3 2.5-6 6-7 3.5 1 6 4 6 7 0 5-5 7-6 11z"/><path d="M12 20V7" stroke="#7a5a08" stroke-width="1.3"/>'],
  cure: ['#b8f0c8', '<path d="M6 20c2-6 2-10 1-15 3 3 4 7 5 15M12 20c0-6 1-10 4-14 0 5 0 9-2 14M17 20c0-4 1-7 3-9-.5 4-1 6-1.5 9"/>'],
  meat: ['#e88a6a', '<path d="M14 4c4 0 7 3 6 7-1 5-7 8-11 7l-3 3-2-2 1-1-2-2 2-1 1-1C5 10 9 4 14 4z"/><circle cx="15" cy="9" r="1.6" fill="#fff0e0"/>'],
  escape: ['#e8f0ff', '<path d="M19 3C11 4 6 9 5 18l-1 3 2-1c1-4 3-7 6-9-2 3-3 5-3.5 7C15 17 19 10 19 3z"/>'],
  key: ['#ffd84a', '<circle cx="8" cy="12" r="4.5"/><path d="M12 11h9v2.5h-2V16h-2.5v-2.5H12z"/><circle cx="8" cy="12" r="1.8" fill="#0c1430"/>'],
  gold: ['#ffd84a', P.coin],
};
export function itemIcon(category: string): HTMLElement {
  const [col, path] = ITEM_ICON[category] ?? ITEM_ICON.heal;
  const s = document.createElement('span');
  s.className = 'iico';
  s.style.color = col;
  s.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">${path}</svg>`;
  return s;
}
