/* planner.js — 「プラン」タブ：☆を付けた場所を時間順に並べ、行ったらチェック。子どもの年齢・雨の日モード・メモ */
(function () {
  'use strict';
  var h = HL.h;

  function refOf(p) { return HL.find(p.refId); }

  // 並び順の時刻：自分で入れた時刻 → イベントの参考時刻 → なし
  function timeOf(p, x) {
    if (p.startTime) return { t: p.startTime, ref: false };
    if (x && x.kind === 'show') {
      var r = HL.dayRows([x.o]).filter(function (r) { return r.start || r.label; })[0];
      if (r) return { t: r.start || r.label, ref: true, sort: r.start || '00:00' };
    }
    return null;
  }

  var saveTimer;
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(HL.persist, 400); }

  function settingsCard() {
    var ages = HL.state.profile.childAges;
    var agesRow = h('div', { class: 'inline' }, h('b', { text: '👧 子どもの年齢' }));
    ages.forEach(function (a, i) {
      agesRow.appendChild(h('button', { class: 'chip', type: 'button', 'aria-label': a + '歳を削除', text: a + '歳 ×',
        onclick: function () { ages.splice(i, 1); HL.persist(); HL.render(); } }));
    });
    if (ages.length < 6) {
      var sel = h('select', { class: 'chip', 'aria-label': '子どもの年齢を追加' }, h('option', { value: '', text: '＋ 追加' }),
        Array.apply(null, Array(16)).map(function (_, n) { return h('option', { value: String(n), text: n + '歳' }); }));
      sel.addEventListener('change', function () { if (sel.value !== '') { ages.push(Number(sel.value)); HL.persist(); HL.render(); } });
      agesRow.appendChild(sel);
    }
    var rain = h('input', { type: 'checkbox', checked: HL.state.rainMode, onchange: function () { HL.state.rainMode = rain.checked; HL.persist(); HL.render(); } });
    return h('section', { class: 'card' }, agesRow,
      h('p', { class: 'small muted', style: { margin: '2px 0 8px' }, text: '年齢を入れると、のりものに「不可」「保護者同伴」が出ます（身長・体重は判定しません）。' }),
      h('label', { class: 'check' }, rain, '☔ 雨の日モード（雨・強風で運休するものに印を付ける）'));
  }

  HL.screens.plan = function (main) {
    var warn = HL.storageWarning();
    if (warn) main.appendChild(warn);
    main.appendChild(settingsCard());

    var items = HL.state.plan.map(function (p) { var x = refOf(p); return { p: p, x: x, tm: timeOf(p, x) }; });
    items.sort(function (a, b) {
      var x = a.tm ? (a.tm.sort || a.tm.t) : '99', y = b.tm ? (b.tm.sort || b.tm.t) : '99';
      return x < y ? -1 : x > y ? 1 : (a.p.createdAt < b.p.createdAt ? -1 : 1);
    });
    var done = items.filter(function (it) { return HL.isVisited(it.p.kind, it.p.refId); }).length;

    main.appendChild(h('h2', { class: 'section-title', text: '★ 行きたいところ（' + done + '／' + items.length + ' 行った）' }));
    if (!items.length) {
      main.appendChild(h('div', { class: 'card' }, h('p', { class: 'empty', text: '「きょう」や「マップ」で ☆ をタップすると、ここに並びます。' }),
        h('div', { class: 'btn-row' }, h('a', { class: 'btn', href: '#today', text: 'きょうの予定を見る' }), h('a', { class: 'btn sub', href: '#map', text: 'マップで探す' }))));
    }
    var list = h('div', { class: 'list' });
    items.forEach(function (it) {
      var p = it.p, x = it.x;
      if (!x) {
        list.appendChild(h('div', { class: 'row' }, h('span', { class: 'row-main', text: '（データが見つかりません：' + p.refId + '）' }),
          h('button', { class: 'star on', type: 'button', text: '★', onclick: function () { HL.removeFromPlan(p.kind, p.refId); HL.render(); } })));
        return;
      }
      var vis = HL.isVisited(p.kind, p.refId);
      var cb = h('input', { type: 'checkbox', checked: vis, 'aria-label': x.o.name + 'に行った', onchange: function () { HL.toggleVisited(p.kind, p.refId); HL.render(); } });
      var time = h('input', { type: 'time', class: 'time-in', value: p.startTime, 'aria-label': x.o.name + 'の時刻（任意）' });
      time.addEventListener('change', function () { p.startTime = time.value; HL.persist(); HL.render(); });
      var rainFlag = HL.state.rainMode && x.kind === 'facility' && (HL.rainSuspended(x.o) || HL.windSuspended(x.o));
      list.appendChild(h('div', { class: 'plan-item' + (vis ? ' done' : '') + (rainFlag ? ' rain' : '') },
        HL.row(x, { time: it.tm ? it.tm.t : '－', timeRef: it.tm && it.tm.ref }),
        h('div', { class: 'plan-ctrl' }, h('label', { class: 'check' }, cb, '行った'), h('label', { class: 'small muted' }, '時刻 ', time),
          rainFlag ? h('span', { class: 'tag ng', text: '☔ 雨・風だと運休' }) : null)));
    });
    main.appendChild(list);
    if (items.some(function (it) { return it.tm && it.tm.ref; })) {
      main.appendChild(h('p', { class: 'small muted hint', text: '点線の時刻は公式に案内された通常の時刻（参考）です。当日の開催は公式で確認してください。時刻を自分で入れるとその時刻で並びます。' }));
    }

    var memo = h('textarea', { placeholder: 'メモ（持ち物・休憩・食事など）', 'aria-label': 'メモ', rows: 3 });
    memo.value = HL.state.memo;
    memo.addEventListener('input', function () { HL.state.memo = memo.value; saveSoon(); });
    main.appendChild(h('section', { class: 'card' }, h('h2', null, '🗒️ メモ'), memo));
  };
})();
