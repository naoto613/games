/* planner.js — 行きたい施設の追加・削除、訪問済み、予定の登録・編集、メモ、施設詳細への遷移 */
(function () {
  'use strict';
  var h = HL.h;
  var PRIORITY = { high: '高', normal: '中', low: '低' };

  function refOf(p) { return p.kind === 'show' ? HL.showById(p.refId) : HL.facility(p.refId); }

  function sortPlan(list) {
    var order = { high: 0, normal: 1, low: 2 };
    return list.slice().sort(function (a, b) {
      if (a.startTime && b.startTime) return a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0;
      if (a.startTime || b.startTime) return a.startTime ? -1 : 1;
      return (order[a.priority] - order[b.priority]) || (a.createdAt < b.createdAt ? -1 : 1);
    });
  }

  var saveTimer;
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(HL.persist, 400); }

  function itemCard(p) {
    var o = refOf(p);
    var done = HL.isVisited(p.kind, p.refId);
    var name = o ? o.name : '（削除されたデータ：' + p.refId + '）';
    var href = o ? (p.kind === 'show' ? '#show/' : '#facility/') + p.refId : null;
    var icon = p.kind === 'show' ? '🎪' : (o ? HL.cat(o.category).icon : '📍');
    var mapFid = p.kind === 'show' ? (o && o.venue && o.venue.facilityId) : p.refId;

    var start = h('input', { type: 'time', value: p.startTime, 'aria-label': name + 'の予定開始時刻' });
    var end = h('input', { type: 'time', value: p.endTime, 'aria-label': name + 'の予定終了時刻' });
    var pri = h('select', { 'aria-label': name + 'の優先度' }, Object.keys(PRIORITY).map(function (k) { return h('option', { value: k, text: '優先度 ' + PRIORITY[k], selected: p.priority === k }); }));
    var memo = h('textarea', { placeholder: 'メモ（例：トイレを先に済ませる）', 'aria-label': name + 'のメモ', rows: 2 });
    memo.value = p.memo;

    start.addEventListener('change', function () { p.startTime = start.value; HL.persist(); HL.render(); });
    end.addEventListener('change', function () { p.endTime = end.value; HL.persist(); });
    pri.addEventListener('change', function () { p.priority = pri.value; HL.persist(); HL.render(); });
    memo.addEventListener('input', function () { p.memo = memo.value; saveSoon(); });

    var cb = h('input', { type: 'checkbox', checked: done, onchange: function () { HL.toggleVisited(p.kind, p.refId); HL.render(); } });

    // 対象のショーに参考時刻がある場合はヒントとして見せるだけ（自動入力しない）
    var hint = null;
    if (p.kind === 'show' && o && !p.startTime) {
      var sc = HL.targetSchedule(o);
      var refs = HL.refTimes(o);
      if (sc && sc.startTime) hint = h('div', { class: 'small', text: '公式スケジュール：' + sc.startTime + '〜' + (sc.endTime || '') });
      else if (refs.length) hint = h('div', { class: 'small', style: { color: 'var(--color-warning-text)' }, text: '？ 対象日の時刻は未確認（期間中の通常時刻：' + refs.map(function (r) { return r.startTime; }).join('、') + '）' });
    }
    var adm = o && HL.needsAdmission(o) ? h('span', { class: 'badge req', text: '🎫 ' + ((o.admission && o.admission.type) || '整理券・予約') + 'が必要' }) : null;
    var weather = p.kind === 'facility' && o && (HL.rainSuspended(o) || HL.windSuspended(o))
      ? h('span', { class: 'badge ' + (HL.state.rainMode ? 'st-changed' : 'st-unconfirmed'), text: HL.rainSuspended(o) ? '☔ 雨天運休' : '🌬 強風時運休' }) : null;
    var elig = p.kind === 'facility' && o ? HL.eligibilityBadges(o) : null;

    return h('div', { class: 'item' + (done ? ' done' : '') },
      h('div', { class: 'item-head' },
        h('div', { class: 'item-ico', 'aria-hidden': 'true', text: icon }),
        h('div', { style: { flex: 1, minWidth: 0 } },
          href ? h('a', { class: 'item-name', href: href, text: name }) : h('span', { class: 'item-name', text: name }),
          h('div', { class: 'badges' }, h('span', { class: 'badge plain', text: p.kind === 'show' ? 'ショー・イベント' : '施設' }),
            h('span', { class: 'badge cat', text: '優先度 ' + PRIORITY[p.priority] }), adm, weather, elig),
          hint)),
      h('div', { class: 'plan-grid' },
        h('label', { class: 'field' }, '開始（任意）', start),
        h('label', { class: 'field' }, '終了（任意）', end),
        h('label', { class: 'field', style: { gridColumn: '1 / -1' } }, '優先度', pri)),
      h('label', { class: 'field', style: { marginTop: '8px' } }, 'メモ', memo),
      h('div', { class: 'btn-row' },
        h('label', { class: 'check', style: { flex: '1 1 100%' } }, cb, '訪問済み'),
        mapFid ? h('a', { class: 'btn small ghost', href: '#map?focus=' + encodeURIComponent(mapFid), text: '🗺️ マップ' }) : null,
        href ? h('a', { class: 'btn small ghost', href: href, text: '詳細' }) : null,
        h('button', { class: 'btn small danger', type: 'button', text: '削除', onclick: function () {
          HL.state.plan = HL.state.plan.filter(function (x) { return x.id !== p.id; });
          HL.persist(); HL.toast('プランから削除しました'); HL.render();
        } })));
  }

  /* 子どもの年齢（利用条件の確認用） */
  function profileCard() {
    var ages = HL.state.profile.childAges;
    var box = h('section', { class: 'card' }, h('h2', null, '👧 子どもの年齢'),
      h('p', { class: 'small muted', style: { margin: '0 0 6px' }, text: '公式一覧の年齢条件（利用不可・保護者同伴）と照らし合わせます。身長・体重・当日の運行は判定しません。' }));
    var row = h('div', { class: 'btn-row', style: { marginTop: 0 } });
    ages.forEach(function (a, i) {
      row.appendChild(h('span', { class: 'chip', style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } }, a + '歳',
        h('button', { type: 'button', class: 'btn small ghost', style: { minHeight: '28px', padding: '0 8px' }, 'aria-label': a + '歳を削除', text: '×',
          onclick: function () { ages.splice(i, 1); HL.persist(); HL.render(); } })));
    });
    if (ages.length < 6) {
      var sel = h('select', { 'aria-label': '子どもの年齢を追加', style: { minHeight: '40px', borderRadius: '10px', border: '2px solid var(--color-border)', padding: '0 8px' } },
        h('option', { value: '', text: '＋ 年齢を追加' }),
        Array.apply(null, Array(16)).map(function (_, n) { return h('option', { value: String(n), text: n + '歳' }); }));
      sel.addEventListener('change', function () {
        if (sel.value === '') return;
        ages.push(Number(sel.value)); HL.persist(); HL.render();
      });
      row.appendChild(sel);
    }
    box.appendChild(row);
    if (ages.length) box.appendChild(h('div', { class: 'btn-row' }, h('a', { class: 'btn small sub', href: '#list?f=kids', text: '利用できるアトラクションを見る' })));
    return box;
  }

  /* 雨の日モード：雨天・強風で運休する予定と、代わりの候補 */
  function rainCard() {
    var on = HL.state.rainMode;
    var cb = h('input', { type: 'checkbox', checked: on, onchange: function () { HL.state.rainMode = cb.checked; HL.persist(); HL.render(); } });
    var box = h('section', { class: 'card' + (on ? ' warn' : '') }, h('h2', null, '☔ 雨の日モード'),
      h('label', { class: 'check' }, cb, '雨・強風のときの代わりのプランを表示'));
    if (!on) return box;
    var affected = HL.state.plan.filter(function (p) { var o = p.kind === 'facility' && HL.facility(p.refId); return o && (HL.rainSuspended(o) || HL.windSuspended(o)); });
    box.appendChild(h('p', { class: 'small', style: { margin: '4px 0' }, text: (HL.data.opening && HL.data.opening.weather && HL.data.opening.weather.text) || '' }));
    box.appendChild(h('div', { class: 'small' }, h('b', { text: 'プランのうち運休の可能性があるもの：' }),
      affected.length ? affected.map(function (p) { var o = HL.facility(p.refId); return h('div', { text: '・' + o.name + (HL.rainSuspended(o) ? '（雨天運休）' : '（強風時運休）') }); }) : h('div', { text: 'なし' })));
    var ages = HL.childAges();
    var alt = HL.data.facilities.filter(function (f) {
      if (f.category !== 'attraction' && f.category !== 'greeting') return false;
      if (HL.rainSuspended(f) || HL.windSuspended(f)) return false;
      if (HL.planItem('facility', f.id)) return false;
      return ages.every(function (a) { var e = HL.eligibility(f, a); return !e || e.level === 'ok' || e.level === 'guardian'; });
    });
    box.appendChild(h('div', { class: 'small', style: { marginTop: '6px' } }, h('b', { text: '代わりの候補（雨天運休の掲載がない施設）：' })));
    alt.forEach(function (f) {
      box.appendChild(h('div', { class: 'notice-line' }, h('a', { class: 'inlink', style: { flex: 1 }, href: '#facility/' + f.id, text: HL.cat(f.category).icon + ' ' + f.name }),
        h('button', { class: 'btn small sub', type: 'button', text: '＋ 追加', onclick: function () { HL.addToPlan('facility', f.id); HL.toast('プランに追加しました'); HL.render(); } })));
    });
    box.appendChild(h('p', { class: 'small', style: { margin: '6px 0 0' }, text: '？ 屋内かどうか・当日運行するかは未確認です。運休は雨・強風以外の理由でも起こるため、当日の運行状況を確認してください。' }));
    return box;
  }

  /* ショーを軸にした時間割：自分の予定（時刻あり）＋ 参考時刻のショー */
  function timetableCard() {
    var rows = [];
    HL.state.plan.forEach(function (p) {
      if (!p.startTime) return;
      var o = refOf(p);
      rows.push({ t: p.startTime, end: p.endTime, name: o ? o.name : p.refId, href: o ? (p.kind === 'show' ? '#show/' : '#facility/') + p.refId : null, mine: true });
    });
    if (HL.schedule) HL.schedule.dayRows(HL.data.shows.filter(HL.inPeriod)).forEach(function (r) {
      if (!r.start) return;
      var mine = HL.planItem('show', r.show.id);
      if (mine && mine.startTime) return;
      rows.push({ t: r.start, end: r.end, name: r.show.name, href: '#show/' + r.show.id, ref: r.ref, inPlan: !!mine });
    });
    rows.sort(function (a, b) { return a.t < b.t ? -1 : a.t > b.t ? 1 : 0; });
    var ul = h('ul', { class: 'mini-tl' });
    rows.forEach(function (r) {
      ul.appendChild(h('li', null,
        h('span', { class: 't' + (r.ref ? ' ref' : ''), text: (r.ref ? '参考 ' : '') + r.t }),
        h('span', null, r.href ? h('a', { class: 'inlink', href: r.href, text: r.name }) : r.name,
          r.mine ? h('span', { class: 'badge cat', style: { marginLeft: '6px' }, text: '自分の予定' }) : r.inPlan ? h('span', { class: 'badge cat', style: { marginLeft: '6px' }, text: '予定に追加済み' }) : null)));
    });
    return h('section', { class: 'card' }, h('h2', null, '🕒 時間割（ショーを軸に）'),
      rows.length ? ul : h('p', { class: 'empty', text: '時刻のある予定はまだありません。' }),
      h('p', { class: 'small muted', style: { margin: '6px 0 0' }, text: '「参考」は公式に案内された通常の時刻で、10月13日の開催は要確認です。自分で時刻を入れた予定は「自分の予定」と表示します。移動時間は含みません。' }));
  }

  HL.screens.plan = function (main) {
    var warn = HL.storageWarning();
    if (warn) main.appendChild(warn);

    var plan = sortPlan(HL.state.plan);
    var visitedCount = plan.filter(function (p) { return HL.isVisited(p.kind, p.refId); }).length;

    main.appendChild(h('section', { class: 'card hero' },
      h('p', { class: 'hero-title', text: '回り方プラン' }),
      h('p', { class: 'hero-sub', text: '登録 ' + plan.length + '件／訪問済み ' + visitedCount + '件' }),
      h('details', { class: 'fold' }, h('summary', { text: '回り方の考え方（優先順位）' }),
        h('ol', { class: 'steps small' }, ((HL.data.park && HL.data.park.planPriority) || []).map(function (t) { return h('li', { text: t }); })),
        h('p', { class: 'small muted', style: { margin: 0 }, text: '最適ルートの自動作成は行いません。時刻が未確認のものに時刻を自動で入れることもしません。' })),
      HL.data.park && HL.data.park.modelPlan ? h('details', { class: 'fold' }, h('summary', { text: 'モデルプラン（時間の目安）' }),
        HL.data.park.modelPlan.map(function (ph) {
          return h('div', { style: { marginTop: '6px' } }, h('b', { class: 'small', text: ph.phase }),
            h('ul', { class: 'small', style: { margin: '2px 0', paddingLeft: '1.3em' } }, ph.items.map(function (t) { return h('li', { text: t }); })));
        }),
        h('p', { class: 'small', style: { color: 'var(--color-warning-text)', margin: '4px 0 0' }, text: '？ ' + (HL.data.park.modelPlanNote || '') })) : null));

    main.appendChild(profileCard());
    main.appendChild(rainCard());
    main.appendChild(timetableCard());

    // 先に対応が必要なもの（整理券・受付）で、まだプランにないもの
    var needFirst = HL.data.facilities.map(function (f) { return { k: 'facility', o: f }; })
      .concat(HL.data.shows.filter(HL.inPeriod).map(function (s) { return { k: 'show', o: s }; }))
      .filter(function (x) { return HL.needsAdmission(x.o) && !HL.planItem(x.k, x.o.id); });
    if (needFirst.length) {
      main.appendChild(h('section', { class: 'card warn' }, h('h2', null, '🎫 先に確認したい（整理券・受付）'),
        needFirst.map(function (x) {
          return h('div', { class: 'notice-line' }, h('div', { style: { flex: 1 } }, h('a', { class: 'inlink', href: (x.k === 'show' ? '#show/' : '#facility/') + x.o.id, text: x.o.name })),
            h('button', { class: 'btn small sub', type: 'button', text: '＋ 追加', onclick: function () { HL.addToPlan(x.k, x.o.id); HL.toast('プランに追加しました'); HL.render(); } }));
        })));
    }

    main.appendChild(h('h2', { class: 'section-title', text: '📝 予定（時刻順 → 優先度順）' }));
    if (!plan.length) {
      main.appendChild(h('div', { class: 'card' }, h('p', { class: 'empty', text: 'まだ登録がありません。施設詳細の「行きたい」やショーの「予定に追加」から登録できます。' }),
        h('div', { class: 'btn-row' }, h('a', { class: 'btn', href: '#list', text: '施設をさがす' }), h('a', { class: 'btn sub', href: '#shows', text: 'ショーを見る' }))));
    }
    plan.forEach(function (p) { main.appendChild(itemCard(p)); });

    // 施設をすばやく追加
    var addSel = h('select', { 'aria-label': '追加する施設' }, h('option', { value: '', text: '施設・ショーを選んで追加…' }),
      HL.data.facilities.filter(function (f) { return !HL.planItem('facility', f.id); }).map(function (f) { return h('option', { value: 'facility:' + f.id, text: HL.cat(f.category).icon + ' ' + f.name }); }),
      HL.data.shows.filter(function (s) { return HL.inPeriod(s) && !HL.planItem('show', s.id); }).map(function (s) { return h('option', { value: 'show:' + s.id, text: '🎪 ' + s.name }); }));
    addSel.addEventListener('change', function () {
      if (!addSel.value) return;
      var i = addSel.value.indexOf(':');
      HL.addToPlan(addSel.value.slice(0, i), addSel.value.slice(i + 1));
      HL.toast('プランに追加しました');
      HL.render();
    });
    main.appendChild(h('section', { class: 'card' }, h('label', { class: 'field' }, '＋ 追加', addSel)));

    // 全体メモ
    var memo = h('textarea', { placeholder: '持ち物・休憩・食事の予定など', 'aria-label': '全体メモ', rows: 4 });
    memo.value = HL.state.memo;
    memo.addEventListener('input', function () { HL.state.memo = memo.value; saveSoon(); });
    main.appendChild(h('section', { class: 'card' }, h('h2', null, '🗒️ 全体メモ'), memo,
      h('p', { class: 'small muted', style: { margin: '6px 0 0' }, text: 'メモと予定はこの端末のブラウザ内にだけ保存されます。' })));
  };
})();
