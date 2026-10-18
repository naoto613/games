/* さいしょの せかい（テンプレート） */
'use strict';
(() => {
  const COLS = (PT.COLS = 96), ROWS = (PT.ROWS = 32);
  const id = (n) => PT.BLOCK[n].code;

  const make = () => new Uint8Array(COLS * ROWS);
  const put = (g, x, y, n) => { if (x >= 0 && y >= 0 && x < COLS && y < ROWS) g[y * COLS + x] = n ? id(n) : 0; };
  const get = (g, x, y) => (x >= 0 && y >= 0 && x < COLS && y < ROWS ? g[y * COLS + x] : 0);
  /* スタンプを おく（cx = まんなか、by = いちばん した の だん） */
  PT.stampInto = (g, sid, cx, by, onSet) => {
    const st = PT.STAMPS[sid]; const x0 = cx - (st.w >> 1), y0 = by - st.h + 1;
    st.rows.forEach((row, y) => [...row].forEach((ch, x) => {
      const code = PT.stampCell(ch); if (code < 0) return;
      const gx = x0 + x, gy = y0 + y; if (gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS) return;
      const i = gy * COLS + gx; if (g[i] === code) return;
      if (onSet) onSet(i, g[i], code); g[i] = code;
    }));
  };
  const terrain = (g, hf, top, mid, deep = 'stone', midN = 3) => {
    const hs = [];
    for (let x = 0; x < COLS; x++) {
      const h = Math.round(hf(x)); hs.push(h);
      for (let y = h; y < ROWS; y++) put(g, x, y, y === h ? top : y <= h + midN ? mid : deep);
    }
    return hs;
  };
  const surf = (g, x) => { for (let y = 0; y < ROWS; y++) if (get(g, x, y)) return y; return ROWS; };

  const W = (PT.WORLDS = {});
  const add = (wid, o) => { W[wid] = Object.assign({ id: wid }, o); };

  add('meadow', { name: 'くさはら', num: 1, color: '#58c46b', sky: ['#8fd3ff', '#e6f7ff'], hills: ['#9fdc8a', '#7cc874'], deco: 'hills', bgm: 'park',
    gen() {
      const g = make();
      const hs = terrain(g, (x) => 21 + 1.6 * Math.sin(x * 0.12) + 1.1 * Math.sin(x * 0.29 + 1), 'grass', 'dirt');
      // いけ
      for (let x = 62; x < 70; x++) { const d = x === 62 || x === 69 ? 1 : 2; for (let y = hs[x]; y < hs[x] + d; y++) put(g, x, y, 'water'); }
      [[10, 'tree'], [44, 'bigtree'], [80, 'tree'], [90, 'tree']].forEach(([x, s]) => PT.stampInto(g, s, x, surf(g, x) - 1));
      [5, 16, 18, 27, 36, 52, 55, 74, 77, 86].forEach((x, i) => put(g, x, surf(g, x) - 1, i % 4 === 3 ? 'mushroom' : 'flower'));
      return g;
    },
    chars: [['lulu', 22], ['mimi', 27], ['pyoko', 32]] });

  add('beach', { name: 'うみべ', num: 2, color: '#58b9f0', sky: ['#7cc8ff', '#fff3d6'], hills: ['#bfe8a8', '#9fd88a'], deco: 'sea', bgm: 'beach',
    gen() {
      const g = make();
      const hs = terrain(g, (x) => (x < 40 ? 20 + Math.sin(x * 0.2) : 20 + (x - 40) * 0.22 + Math.sin(x * 0.3) * 0.6), 'grass', 'dirt');
      for (let x = 34; x < COLS; x++) for (let y = hs[x]; y < hs[x] + 3; y++) put(g, x, y, 'sand');
      const sea = 24;
      for (let x = 50; x < COLS; x++) for (let y = sea; y < surf(g, x); y++) if (!get(g, x, y)) put(g, x, y, 'water');
      [[8, 'tree'], [26, 'tree']].forEach(([x, s]) => PT.stampInto(g, s, x, surf(g, x) - 1));
      // ヤシの き
      for (const x of [40, 47]) { const s = surf(g, x); for (let k = 1; k <= 4; k++) put(g, x, s - k, 'log'); [[-2, 0], [-1, -1], [0, -1], [1, -1], [2, 0], [0, -2]].forEach(([dx, dy]) => put(g, x + dx, s - 5 + dy, 'leaves')); }
      [3, 14, 20, 31].forEach((x) => put(g, x, surf(g, x) - 1, 'flower'));
      return g;
    },
    chars: [['pon', 20], ['moko', 36], ['futan', 44]] });

  add('snow', { name: 'ゆきやま', num: 3, color: '#7fb6ef', sky: ['#a9d4ff', '#f4f9ff'], hills: ['#ffffff', '#e3f0ff'], deco: 'mountain', bgm: 'night',
    gen() {
      const g = make();
      const hs = terrain(g, (x) => 20 + 3 * Math.sin(x * 0.09) + 1.2 * Math.sin(x * 0.27 + 2), 'snow', 'dirt');
      for (let x = 50; x < 60; x++) { put(g, x, hs[x], 'ice'); }
      [[14, 'tree'], [70, 'bigtree'], [86, 'tree']].forEach(([x, s]) => PT.stampInto(g, s, x, surf(g, x) - 1));
      PT.stampInto(g, 'snowman', 32, surf(g, 32) - 1);
      return g;
    },
    chars: [['choco', 22], ['penta', 40], ['yuto', 45]] });

  add('candy', { name: 'おかしの くに', num: 4, color: '#ff8fb1', sky: ['#ffc9e0', '#fff4e8'], hills: ['#ffd1e3', '#ffb8d2'], deco: 'candy', bgm: 'fun',
    gen() {
      const g = make();
      terrain(g, (x) => 21 + 1.4 * Math.sin(x * 0.15) + Math.sin(x * 0.33), 'cake', 'cookie', 'choco', 2);
      // ぺろぺろキャンディの き
      for (const x of [8, 30, 58, 84]) { const s = surf(g, x); for (let k = 1; k <= 3; k++) put(g, x, s - k, 'candy'); [[-1, 0], [0, 0], [1, 0], [0, -1], [-1, -1], [1, -1]].forEach(([dx, dy], i) => put(g, x + dx, s - 4 + dy, i % 2 ? 'heart' : 'cloud')); }
      PT.stampInto(g, 'candyhouse', 44, surf(g, 44) - 1);
      [16, 20, 70, 74].forEach((x) => put(g, x, surf(g, x) - 1, 'mushroom'));
      return g;
    },
    chars: [['mimi', 20], ['nyan', 36], ['sakura', 64]] });

  add('sky', { name: 'そらの しま', num: 5, color: '#9b8cff', sky: ['#7fb2ff', '#ffe9f4'], hills: [], deco: 'clouds', bgm: 'title',
    gen() {
      const g = make();
      for (let x = 0; x < COLS; x++) { put(g, x, ROWS - 1, 'cloud'); put(g, x, ROWS - 2, 'cloud'); }
      const isl = [[12, 22, 9], [34, 17, 7], [56, 21, 11], [80, 16, 8]];
      isl.forEach(([cx, y, w]) => {
        for (let x = cx - (w >> 1); x <= cx + (w >> 1); x++) { put(g, x, y, 'grass'); put(g, x, y + 1, 'dirt'); if (Math.abs(x - cx) < (w >> 1) - 1) put(g, x, y + 2, 'dirt'); if (Math.abs(x - cx) < (w >> 1) - 2) put(g, x, y + 3, 'stone'); }
      });
      PT.stampInto(g, 'tree', 58, 20);
      PT.stampInto(g, 'rainbowbridge', 23, 21);
      [10, 14, 33, 52, 62, 78].forEach((x) => { const s = surf(g, x); if (s < ROWS - 2) put(g, x, s - 1, 'flower'); });
      return g;
    },
    chars: [['yume', 12], ['pyoko', 56], ['kon', 80]] });

  add('flat', { name: 'まっさら', num: 6, color: '#ffb04a', sky: ['#8fd3ff', '#eef8ff'], hills: ['#b5e3a2', '#a8dc8f'], deco: 'hills', bgm: 'home',
    gen() { const g = make(); terrain(g, () => 21, 'grass', 'dirt'); return g; },
    chars: [['lulu', 44], ['ricky', 50]] });

  PT.WORLD_LIST = ['meadow', 'beach', 'snow', 'candy', 'sky', 'flat'];
  PT.surfRow = surf;
})();
