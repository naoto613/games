/* detail.js — 施設・イベント共通の詳細画面（#d/ID）
   「わかっていること」だけを箇条書きにし、未確認の項目は 1 行にまとめる。 */
(function () {
  'use strict';
  var h = HL.h;
  var DAY = { all: '期間中', weekday: '平日', holiday: '土日祝' };

  function li(label, value, cls) {
    return h('li', { class: cls || null }, label ? h('b', { text: label + '：' }) : null, value);
  }

  function admissionLines(a, out) {
    if (!a) return;
    var kind = a.required === 'optional' ? '（任意）' : 'が必要';
    out.push(li('🎫 ' + a.type + kind, a.method || '方法は未確認'));
    if (a.distributionLocation) out.push(li('受付・取得場所', a.distributionLocation));
    if (a.distributionStartTime) out.push(li('受付開始', a.distributionStartTime));
    if (a.participationTime) out.push(li('参加時間', a.participationTime));
    if (a.fee) out.push(li('料金', a.fee));
    if (a.capacity) out.push(li('定員', a.capacity));
    if (a.endCondition) out.push(li('受付終了', a.endCondition));
    if (a.statusNote) out.push(li(null, a.statusNote, 'muted'));
    if (a.pastInfo) out.push(li('過去の情報', a.pastInfo, 'muted'));
  }

  HL.screens.d = function (main, r) {
    var x = HL.find(r.id);
    if (!x) {
      main.appendChild(h('div', { class: 'card' }, '見つかりませんでした。', h('div', { class: 'btn-row' }, h('a', { class: 'btn', href: '#map', text: 'マップから探す' }))));
      return;
    }
    var o = x.o, isF = x.kind === 'facility';
    var rq = o.requirements || {}, op = o.operation || {}, a = o.admission;
    var catLabel = isF ? HL.cat(o.category).label : (HL.SHOW_CATEGORIES[o.category] || 'イベント');

    // 地図の位置（施設そのもの、またはイベントの会場）
    var mapId = isF ? o.id : (o.venue && o.venue.facilityId);
    var mapF = mapId && HL.facility(mapId);
    var hasPos = mapF && mapF.location && mapF.location.x != null;

    main.appendChild(h('section', { class: 'card hero' },
      h('p', { class: 'hero-title', text: HL.icon(x) + ' ' + o.name }),
      h('p', { class: 'hero-sub', text: catLabel + (isF && o.area ? '・' + o.area : '') }),
      o.description ? h('p', { class: 'small', style: { margin: '6px 0 0' }, text: o.description }) : null));

    var vis = HL.isVisited(x.kind, o.id);
    main.appendChild(h('div', { class: 'btn-row actions' },
      HL.starButton(x.kind, o.id, { big: true }),
      h('button', { class: 'btn' + (vis ? ' on' : ' sub'), type: 'button', 'aria-pressed': String(vis), text: vis ? '✔ 行った' : '行った',
        onclick: function () { HL.toast(HL.toggleVisited(x.kind, o.id) ? '「行った」にしました' : '「行った」を取り消しました'); HL.render(); } }),
      hasPos ? h('a', { class: 'btn ghost', href: '#map?focus=' + encodeURIComponent(mapId), text: '🗺️ 地図' }) : null));

    // わかっていること
    var known = [];
    if (isF) {
      HL.restrictionLines(rq).forEach(function (t) { known.push(li(null, t)); });
      HL.childAges().forEach(function (age) {
        var e = HL.eligibility(o, age);
        if (e) known.push(li(null, ({ ng: '✕ ', guardian: '👪 ', ok: '○ ', unknown: '？ ' }[e.level]) + e.text, 'age-' + e.level));
      });
      if (rq.price) known.push(li('料金', rq.price));
      if (op.weatherPolicy && op.weatherPolicy !== 'unconfirmed') known.push(li('天候', op.weatherPolicy));
      admissionLines(a, known);
      if (hasPos && o.location.positionStatus === 'reference') known.push(li(null, '📍 地図の位置は推定です（' + (o.location.positionNote || '') + '）', 'muted'));
    } else {
      var p = o.eventPeriod || {};
      var refs = o.announcedTimes || [];
      if (refs.length) known.push(li('時刻（参考）', refs.map(function (t) {
        return (DAY[t.dayType] || '') + ' ' + (t.startTime ? t.startTime + (t.endTime ? '〜' + t.endTime : '〜') : t.label);
      }).join('／')));
      if (o.days === 'weekday') known.push(li(null, '平日のみ'));
      if (o.venue && o.venue.name && o.venue.name !== '未確認') known.push(li('会場', o.venue.name));
      if (p.startDate) known.push(li('期間', HL.fmtDate(p.startDate) + '〜' + HL.fmtDate(p.endDate)));
      if (o.characters && o.characters.length) known.push(li('出演', o.characters.join('、')));
      if (rq.price && !(a && a.fee)) known.push(li('料金', rq.price));
      admissionLines(a, known);
      if (o.goods && o.goods.length) known.push(li('参加グッズ', o.goods.map(function (g) { return g.name + ' ' + g.price; }).join('／')));
    }
    (o.notes || []).forEach(function (t) { known.push(li(null, t, 'muted')); });
    var knownCard = h('section', { class: 'card' }, h('h2', null, 'わかっていること'),
      known.length ? h('ul', { class: 'facts' }, known) : h('p', { class: 'empty', text: '公式情報で確認できた内容はまだありません。' }));
    if (!isF && o.viewingRules && o.viewingRules.length) {
      knownCard.appendChild(h('details', { class: 'fold' }, h('summary', { text: '観覧ルール（' + o.viewingRules.length + '）' }),
        h('ul', { class: 'facts' }, o.viewingRules.map(function (t) { return li(null, t); }))));
    }
    main.appendChild(knownCard);

    // 未確認（当日確認）をまとめて 1 行に
    var unk = [];
    if (isF) {
      unk.push('当日の営業');
      if (!op.openingTime) unk.push('営業時間');
      if (!rq.price && o.category === 'attraction') unk.push('料金');
      if (o.category === 'attraction' && !rq.heightRestriction) unk.push('身長制限');
      if (!a && rq.ticketRequired === 'unknown' && (o.category === 'attraction' || o.category === 'greeting')) unk.push('整理券の要否');
      if (a && !a.distributionStartTime) unk.push('整理券の取得時刻');
      if ((!op.weatherPolicy || op.weatherPolicy === 'unconfirmed') && o.category === 'attraction') unk.push('雨天時');
      if (!o.location || o.location.x == null) unk.push('地図の位置');
    } else {
      unk.push('当日の開催と時刻');
      if (!o.venue || !o.venue.name || /未確認/.test(o.venue.name)) unk.push('会場');
      if (!rq.price && !(a && a.fee)) unk.push('料金');
      if (!o.weatherPolicy || o.weatherPolicy === 'unconfirmed') unk.push('雨天時');
    }
    main.appendChild(h('section', { class: 'card warn small' }, h('b', { text: '⏱ 当日確認：' }), unk.join('・')));

    main.appendChild(HL.officialButton(o.sources, '公式情報を確認'));
    main.appendChild(h('details', { class: 'fold card' }, h('summary', { text: '出典と確認日' }), HL.sourcesBlock(o.sources)));
  };
})();
