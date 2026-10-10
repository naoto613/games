/* schedule.js — ショー・イベント一覧（日付フィルター・時刻順・開催状態・会場リンク）とイベント詳細 */
(function () {
  'use strict';
  var h = HL.h;

  // 「開園から約20分」のような相対表記は開園直後として先頭に並べる
  function key(r) { return r.start || (r.label ? '00:00' : null); }
  function cmpTime(a, b) {
    var x = key(a), y = key(b);
    if (x && y) return x < y ? -1 : x > y ? 1 : 0;
    return x ? -1 : y ? 1 : 0;
  }

  // 指定日の表示行。対象日の公式スケジュールで時刻が確定したものだけ ref:false。
  function dayRows(shows, date) {
    date = date || HL.targetDate();
    var rows = [];
    shows.forEach(function (s) {
      var sc = (s.schedule || []).filter(function (x) { return x.date === date; })[0];
      if (sc && sc.startTime && (sc.status === 'confirmed' || sc.status === 'scheduled' || sc.status === 'changed')) {
        rows.push({ show: s, start: sc.startTime, end: sc.endTime, status: sc.status, ref: false });
        return;
      }
      var refs = date === HL.targetDate() ? HL.refTimes(s) : [];
      if (refs.length) refs.forEach(function (r) { rows.push({ show: s, start: r.startTime, end: r.endTime, label: r.label, note: r.note, status: (sc && sc.status) || 'unconfirmed', ref: true }); });
      else rows.push({ show: s, start: null, end: null, status: (sc && sc.status) || 'unconfirmed', ref: true });
    });
    return rows.sort(cmpTime);
  }

  function planButton(s, row) {
    var inPlan = !!HL.planItem('show', s.id);
    return h('button', { class: 'btn small' + (inPlan ? ' on' : ' sub'), type: 'button', 'aria-pressed': String(inPlan), text: inPlan ? '✓ 予定に追加済み' : '＋ 予定に追加',
      onclick: function () {
        if (HL.planItem('show', s.id)) { HL.removeFromPlan('show', s.id); HL.toast('予定から外しました'); }
        else {
          // 時刻は公式に確定したものだけ入れる（参考時刻は自動入力しない）
          HL.addToPlan('show', s.id, row && !row.ref ? row.start : '', row && !row.ref ? row.end : '');
          HL.toast(row && !row.ref ? '予定に追加しました' : '予定に追加しました（時刻は未確認のため空欄）');
        }
        HL.render();
      } });
  }

  function venueButton(s) {
    var fid = s.venue && s.venue.facilityId;
    return h('a', { class: 'btn small ghost', href: '#map?focus=' + encodeURIComponent(fid || ''), text: '🗺️ 会場をマップで見る' });
  }

  function reqLine(s) {
    var rq = s.requirements || {};
    return h('div', { class: 'small' },
      '整理券・参加券：', HL.needsAdmission(s) && s.admission ? h('b', { text: s.admission.type + 'が必要' + (s.admission.fee ? '（' + s.admission.fee + '）' : '') })
        : HL.isOptionalTicket(s) ? h('span', { text: s.admission.type + ' ' + (s.admission.fee || '') }) : HL.requiredNode(rq.ticketRequired),
      '／料金：', HL.val(rq.price));
  }

  function rowCard(row) {
    var s = row.show;
    var timeNode = row.ref
      ? h('div', null,
        h('div', { class: 'time-ref', text: row.start ? '参考 ' + row.start + (row.end ? '〜' + row.end : '') : row.label ? '参考 ' + row.label : '時刻未確認' }),
        h('div', { class: 'small', style: { color: 'var(--color-warning-text)' } }, row.start || row.label ? '公式に案内された時刻（' + (row.note || '期間中の通常時刻') + '）。対象日の開催・時刻は要確認' : '時刻は公式スケジュールで確認してください'))
      : h('div', { class: 'time-big', text: row.start + (row.end ? '〜' + row.end : '') });
    return h('li', { class: row.ref ? 'ref' : '' }, h('div', { class: 'item' },
      timeNode,
      h('a', { class: 'item-name', href: '#show/' + s.id, text: s.name }),
      h('div', { class: 'item-meta', text: (HL.SHOW_CATEGORIES[s.category] || 'イベント') + '／会場：' + ((s.venue && s.venue.name) || '未確認') }),
      h('div', { class: 'badges' }, HL.statusBadge(row.status, '当日：' + HL.STATUS[row.status].label),
        HL.needsAdmission(s) ? h('span', { class: 'badge req', text: '🎫 ' + ((s.admission && s.admission.type) || '受付') + 'が必要' }) : null),
      s.characters && s.characters.length ? h('div', { class: 'small', text: '出演：' + s.characters.join('、') }) : null,
      reqLine(s),
      h('div', { class: 'btn-row' }, planButton(s, row), venueButton(s))));
  }

  /* ===== SCR-006 ショー・イベント ===== */
  HL.screens.shows = function (main, r) {
    var err = HL.dataError(['shows']);
    if (err) main.appendChild(err);
    var dates = [];
    HL.data.shows.forEach(function (s) { (s.schedule || []).forEach(function (x) { if (dates.indexOf(x.date) < 0) dates.push(x.date); }); });
    if (dates.indexOf(HL.targetDate()) < 0) dates.push(HL.targetDate());
    dates.sort();
    var date = r.params.date && dates.indexOf(r.params.date) >= 0 ? r.params.date : HL.targetDate();

    if (dates.length > 1) {
      var chips = h('div', { class: 'chips', role: 'group', 'aria-label': '日付' });
      dates.forEach(function (d) { chips.appendChild(h('button', { class: 'chip', type: 'button', 'aria-pressed': String(d === date), text: HL.fmtDate(d), onclick: function () { HL.go('#shows?date=' + d); } })); });
      main.appendChild(chips);
    } else {
      main.appendChild(h('p', { class: 'small muted', style: { margin: '0 4px 8px' }, text: '表示日：' + HL.fmtDate(date) }));
    }

    var shows = HL.data.shows.filter(function (s) {
      var p = s.eventPeriod || {};
      return (!p.startDate || p.startDate <= date) && (!p.endDate || date <= p.endDate);
    });
    var rows = dayRows(shows, date);
    var fixed = rows.filter(function (x) { return !x.ref; });
    var pending = rows.filter(function (x) { return x.ref; });

    main.appendChild(h('h2', { class: 'section-title', text: '⏰ 当日の予定（公式スケジュールで確認済み）' }));
    if (!fixed.length) main.appendChild(h('div', { class: 'card' }, HL.unknown('当日の開催情報は未確認です'), h('div', { class: 'small muted', text: '対象日の公式スケジュールを確認できたものだけをここに表示します。過去の時刻や期間中の通常時刻を当日の確定情報としては扱いません。' })));
    else { var tl = h('ol', { class: 'timeline' }); fixed.forEach(function (x) { tl.appendChild(rowCard(x)); }); main.appendChild(tl); }

    main.appendChild(h('h2', { class: 'section-title', text: '？ 時刻未確認（' + pending.length + '件）' }));
    if (pending.length) {
      main.appendChild(h('p', { class: 'small muted', style: { margin: '-4px 4px 8px' }, text: '開催期間中に公式に案内された通常の時刻を「参考」として時刻順に並べています。対象日に必ず開催されるとは限りません。' }));
      var tl2 = h('ol', { class: 'timeline' }); pending.forEach(function (x) { tl2.appendChild(rowCard(x)); }); main.appendChild(tl2);
    } else main.appendChild(h('p', { class: 'empty', style: { padding: '0 4px' }, text: '該当なし' }));

    main.appendChild(h('div', { class: 'card note small' }, '雨天時の扱い・観覧条件は各イベントの詳細を確認してください。',
      HL.extLink('https://www.harmonyland.jp/sp/halloween2026/index.html', '公式スケジュール（ハロウィーン2026 特設ページ）', { block: true })));
  };

  /* ===== イベント詳細 ===== */
  HL.screens.show = function (main, r) {
    var s = HL.showById(r.id);
    if (!s) { main.appendChild(h('div', { class: 'card' }, 'イベントが見つかりません。', h('div', { class: 'btn-row' }, h('a', { class: 'btn', href: '#shows', text: 'ショー一覧へ' })))); return; }
    var st = HL.showDayStatus(s), rq = s.requirements || {}, a = s.admission;
    var sc = HL.targetSchedule(s);
    var row = sc && sc.startTime ? { start: sc.startTime, end: sc.endTime, ref: false } : null;
    main.appendChild(h('section', { class: 'card hero' },
      h('p', { class: 'hero-title', text: s.name }),
      h('div', { class: 'badges' }, h('span', { class: 'badge cat', text: HL.SHOW_CATEGORIES[s.category] || 'イベント' }), HL.statusBadge(st, '当日：' + HL.STATUS[st].label),
        HL.needsAdmission(s) ? h('span', { class: 'badge req', text: '🎫 ' + ((a && a.type) || '受付') + 'が必要' }) : null),
      s.description ? h('p', { class: 'small', style: { margin: '6px 0 0' }, text: s.description }) : null));
    main.appendChild(h('div', { class: 'btn-row', style: { marginTop: 0, marginBottom: '12px' } }, planButton(s, row || { ref: true }), venueButton(s)));

    var kv = h('dl', { class: 'kv' });
    function add(k, v) { kv.appendChild(h('dt', { text: k })); kv.appendChild(h('dd', null, v)); }
    var p = s.eventPeriod || {};
    add('開催期間', p.startDate ? HL.fmtDate(p.startDate) + '〜' + (HL.fmtDate(p.endDate) || '') : HL.unknown());
    add('開催日', s.days === 'weekday' ? '期間中の平日のみと案内' : s.days === 'all' ? '期間中と案内（休園日・個別日は未確認）' : HL.unknown());
    var refs = HL.refTimes(s);
    add('開始・終了時刻（対象日）', row ? row.start + '〜' + (row.end || '？') : h('div', null, HL.unknown('対象日の時刻は未確認'),
      (s.announcedTimes || []).map(function (t) { return h('div', { class: 'small muted', text: '参考：' + ({ all: '期間中', weekday: '平日', holiday: '土日祝' }[t.dayType] || '') + ' ' + (t.startTime ? t.startTime + '〜' + (t.endTime || '') : (t.label || '')) + (t.note ? '（' + t.note + '）' : '') }); }),
      refs.length ? h('div', { class: 'small', text: '対象日は' + (HL.dayType() === 'weekday' ? '平日' : '土日祝') + 'のため、参考時刻は ' + refs.map(function (t) { return t.startTime || t.label; }).join('、') + ' です。' }) : null));
    add('出演キャラクター', s.characters && s.characters.length ? s.characters.join('、') : HL.unknown());
    add('会場', h('span', null, HL.val(s.venue && s.venue.name), s.venue && s.venue.facilityId ? h('div', null, h('a', { class: 'inlink small', href: '#facility/' + s.venue.facilityId, text: '会場の施設情報 →' })) : null));
    add('開催状態', HL.statusBadge(st));
    add('観覧条件・ルール', s.viewingRules && s.viewingRules.length ? h('div', null, s.viewingRules.map(function (t) { return h('div', { class: 'small', text: '・' + t }); })) : HL.val(rq.viewingConditions));
    if (s.goods && s.goods.length) add('参加グッズ', h('div', null, s.goods.map(function (g) { return h('div', { class: 'small', text: g.name + '：' + g.price }); })));
    add('料金', HL.val(rq.price));
    add('整理券・参加券', a ? h('div', null, h('b', { text: a.type + '：' }), a.method || HL.unknown(),
      h('div', { class: 'small' }, '受付場所：', HL.val(a.distributionLocation)),
      h('div', { class: 'small' }, '受付開始：', HL.val(a.distributionStartTime)),
      h('div', { class: 'small' }, '参加時間：', HL.val(a.participationTime)),
      h('div', { class: 'small' }, '料金：', HL.val(a.fee)),
      h('div', { class: 'small' }, '定員：', HL.val(a.capacity)),
      h('div', { class: 'small' }, '受付終了：', HL.val(a.endCondition)),
      a.statusNote ? h('div', { class: 'small muted', text: a.statusNote }) : null) : HL.requiredNode(rq.ticketRequired));
    add('予約', HL.requiredNode(rq.reservationRequired));
    add('雨天時の扱い', s.weatherPolicy && s.weatherPolicy !== 'unconfirmed' ? s.weatherPolicy : HL.unknown());
    if (s.notes && s.notes.length) add('メモ', h('div', null, s.notes.map(function (t) { return h('div', { class: 'small', text: '・' + t }); })));
    add('出典', HL.sourcesBlock(s.sources));
    add('最終確認日時', HL.lastVerified(s.lastVerifiedAt));
    main.appendChild(h('section', { class: 'card' }, kv));
    main.appendChild(HL.officialButton(s.sources, '公式スケジュールを確認'));
  };

  HL.schedule = { dayRows: dayRows };
})();
