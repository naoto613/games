/* info.js — 「情報」タブ：確認チェックリスト・子ども連れ／園内サービス・出典と確認状況（どれも折りたたみ） */
(function () {
  'use strict';
  var h = HL.h;

  function fold(title, body, open) {
    return h('details', { class: 'card fold', open: !!open }, h('summary', { text: title }), body);
  }

  function checklist(cl) {
    var count = function () { return cl.items.filter(function (it) { return HL.state.checked.indexOf('cl:' + cl.id + ':' + it[0]) >= 0; }).length; };
    var body = h('div');
    var det = fold('☑ ' + cl.title + '（' + count() + '／' + cl.items.length + '）', body, cl.id === 'before' && count() < cl.items.length);
    cl.items.forEach(function (it) {
      var key = 'cl:' + cl.id + ':' + it[0];
      var cb = h('input', { type: 'checkbox', checked: HL.state.checked.indexOf(key) >= 0, onchange: function () {
        var i = HL.state.checked.indexOf(key);
        if (cb.checked && i < 0) HL.state.checked.push(key);
        if (!cb.checked && i >= 0) HL.state.checked.splice(i, 1);
        HL.persist();
        det.firstChild.textContent = '☑ ' + cl.title + '（' + count() + '／' + cl.items.length + '）';
      } });
      body.appendChild(h('label', { class: 'check', style: { display: 'flex' } }, cb, it[1]));
    });
    return det;
  }

  HL.screens.info = function (main) {
    var park = HL.data.park, cfg = HL.data.config || {};
    var err = HL.dataError(['park-info', 'sources']);
    if (err) main.appendChild(err);

    if (park && park.checklists) park.checklists.forEach(function (cl) { main.appendChild(checklist(cl)); });

    if (park && park.parkInfo) {
      main.appendChild(h('h2', { class: 'section-title', text: '子ども連れ・園内サービス' }));
      park.parkInfo.forEach(function (sec) {
        main.appendChild(fold(sec.title, h('ul', { class: 'facts' }, sec.items.map(function (t) { return h('li', { text: t }); }))));
      });
      main.appendChild(h('p', { class: 'small muted hint', text: '公式FAQの内容です。料金や運用は変わることがあります。' }));
      main.appendChild(HL.extLink('https://www.harmonyland.jp/faq', '公式FAQで確認', { block: true }));
    }

    // 出典と確認状況
    main.appendChild(h('h2', { class: 'section-title', text: 'この情報について' }));
    var srcList = h('ul', { class: 'facts' });
    HL.data.sources.forEach(function (s) {
      srcList.appendChild(h('li', null,
        s.url ? HL.extLink(s.url, s.title, { official: s.official }) : h('b', { text: s.title + '（アプリ外の資料・URLなし）' }), ' ',
        HL.statusBadge(s.verificationStatus),
        h('div', { class: 'small muted', text: (s.checkedAt ? '確認 ' + HL.fmtDate(s.checkedAt) : '本文未確認') + (s.publishedAt ? '／公開 ' + HL.fmtDate(s.publishedAt) : '') + (s.notes ? '／' + s.notes : '') })));
    });
    main.appendChild(fold('出典（' + HL.data.sources.length + '件）', srcList));
    main.appendChild(fold('データについて', h('div', { class: 'small' },
      h('p', { text: cfg.dataNote || '' }),
      h('p', { text: 'データ作成日：' + (HL.fmtDate(cfg.dataPreparedAt) || '—') + '／情報の対象期間：' + (cfg.informationPeriod ? HL.fmtDate(cfg.informationPeriod.startDate) + '〜' + HL.fmtDate(cfg.informationPeriod.endDate) : '—') }),
      h('p', { text: '表示の意味：「参考」＝公式に案内された通常の時刻や内容。「当日確認」＝当日の公式情報で確かめる必要があるもの。アプリは公式サイトから自動で情報を取りに行きません。' }))));

    var warn = HL.storageWarning();
    if (warn) main.appendChild(warn);
    main.appendChild(fold('この端末の保存データ', h('div', { class: 'small' },
      h('p', { text: 'プラン・行った・メモ・チェック・子どもの年齢は、この端末のブラウザの中にだけ保存されます。' }),
      h('button', { class: 'btn small danger', type: 'button', text: '保存データを消す', onclick: function () {
        if (!window.confirm('プラン・行った・メモ・チェックをすべて消します。よろしいですか？')) return;
        HL.state = HL.storage.reset(); HL.persist(); HL.toast('保存データを消しました'); HL.render();
      } }))));
  };
})();
