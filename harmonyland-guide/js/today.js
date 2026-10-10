/* today.js — 「きょう」タブ：その日のショー・イベント・受付を時間順に 1 本のリストで見せる */
(function () {
  'use strict';
  var h = HL.h;

  // 「開園から約20分」のような相対表記は開園直後として先頭に並べる
  function key(r) { return r.start || (r.label ? '00:00' : null); }
  function cmp(a, b) {
    var x = key(a), y = key(b);
    if (x && y) return x < y ? -1 : x > y ? 1 : 0;
    return x ? -1 : y ? 1 : 0;
  }

  // 対象日の行。公式の当日スケジュールで確定した時刻だけ ref:false、それ以外は公式に案内された通常時刻（参考）
  HL.dayRows = function (shows) {
    var date = HL.targetDate(), rows = [];
    shows.forEach(function (s) {
      var sc = (s.schedule || []).filter(function (x) { return x.date === date; })[0];
      if (sc && sc.startTime && ['confirmed', 'scheduled', 'changed'].indexOf(sc.status) >= 0) {
        rows.push({ show: s, start: sc.startTime, end: sc.endTime, status: sc.status, ref: false });
        return;
      }
      var refs = HL.refTimes(s);
      if (refs.length) refs.forEach(function (r) { rows.push({ show: s, start: r.startTime, end: r.endTime, label: r.label, status: (sc && sc.status) || 'unconfirmed', ref: true }); });
      else rows.push({ show: s, start: null, end: null, status: (sc && sc.status) || 'unconfirmed', ref: true });
    });
    return rows.sort(cmp);
  };

  function subLine(s) {
    var a = s.admission, parts = [];
    if (s.venue && s.venue.name && s.venue.name !== '未確認' && !/^未確認（/.test(s.venue.name)) parts.push(s.venue.name);
    if (a && a.distributionStartTime) parts.push('受付 ' + a.distributionStartTime.replace(/（.*?）/g, ''));
    if (a && a.distributionLocation && !(s.venue && s.venue.name === a.distributionLocation)) parts.push('受付場所 ' + a.distributionLocation);
    if (a && a.capacity) parts.push('先着' + a.capacity);
    if (a && a.fee) parts.push(a.required === 'optional' ? '最前列 ' + a.fee + '（任意）' : a.fee);
    if (a && a.type && /予約/.test(a.type)) parts.push('要予約');
    return parts.length ? h('span', { class: 'row-sub', text: parts.join('・') }) : null;
  }

  HL.screens.today = function (main) {
    var err = HL.dataError(['shows', 'facilities']);
    if (err) main.appendChild(err);
    var op = HL.data.opening, cfg = HL.data.config || {};

    // 1 枚だけの注意カード
    var hours = op && op.status === 'confirmed' && op.openingTime ? '営業時間 ' + op.openingTime + '〜' + (op.closingTime || '') : '営業時間は公式サイトで確認してください';
    main.appendChild(h('section', { class: 'card notice' },
      h('p', { class: 'notice-date', text: HL.targetLabel() }),
      h('p', { text: '🕙 ' + hours }),
      h('p', { text: '⏱ 時刻は公式に案内された通常の時刻（参考）。当日の開催と整理券の条件は公式で確認を。' }),
      HL.extLink(cfg.officialUrl || 'https://www.harmonyland.jp/', '公式サイトで確認', { block: true })));

    if (HL.state.rainMode) {
      var n = HL.data.facilities.filter(function (f) { return HL.rainSuspended(f) || HL.windSuspended(f); }).length;
      main.appendChild(h('a', { class: 'card warn banner', href: '#map?f=rain', text: '☔ 雨の日モード：雨・強風で運休する施設 ' + n + '件 →' }));
    }

    // 時間順
    var shows = HL.data.shows.filter(HL.inPeriod);
    var rows = HL.dayRows(shows);
    var timed = rows.filter(function (r) { return r.start || r.label; });
    var now = new Date();
    var todayIso = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
    var hhmm = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
    var nextId = todayIso === HL.targetDate() ? (timed.filter(function (r) { return r.start && r.start >= hhmm; })[0] || {}).show : null;

    main.appendChild(h('h2', { class: 'section-title', text: '時間順' }));
    var list = h('div', { class: 'list' });
    timed.forEach(function (r) {
      list.appendChild(HL.row({ kind: 'show', o: r.show }, {
        time: r.start || r.label, timeRef: r.ref, sub: subLine(r.show), highlight: nextId && nextId.id === r.show.id
      }));
    });
    if (!timed.length) list.appendChild(h('p', { class: 'empty', text: '当日の開催情報は未確認です' }));
    main.appendChild(list);

    // 時間の決まっていないもの（整理券が必要な施設・時刻未確認のイベント）
    var untimed = HL.data.facilities.filter(HL.needsAdmission).map(function (f) { return { kind: 'facility', o: f }; })
      .concat(rows.filter(function (r) { return !r.start && !r.label; }).map(function (r) { return { kind: 'show', o: r.show }; }));
    if (untimed.length) {
      main.appendChild(h('h2', { class: 'section-title', text: '時間の決まっていないもの' }));
      var l2 = h('div', { class: 'list' });
      untimed.forEach(function (x) {
        var a = x.o.admission;
        l2.appendChild(HL.row(x, { sub: a && a.method ? h('span', { class: 'row-sub', text: a.method }) : (x.kind === 'show' ? subLine(x.o) : null) }));
      });
      main.appendChild(l2);
    }
    main.appendChild(h('p', { class: 'small muted hint', text: '☆ をタップするとプランに入ります。名前をタップすると詳しい条件が見られます。' }));
  };
})();
