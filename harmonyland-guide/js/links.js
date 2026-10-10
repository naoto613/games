/* links.js — 「リンク」タブ（最初の画面）：役に立つ公式ページへ迷わず行けるリンク集。
   下に確認チェックリスト・子ども連れメモ・データについて（折りたたみ）。リンクは data/links.json で管理。 */
(function () {
  'use strict';
  var h = HL.h;

  function fold(title, body, open) {
    return h('details', { class: 'card fold', open: !!open }, h('summary', { text: title }), body);
  }

  function checklist(cl) {
    var count = function () { return cl.items.filter(function (it) { return HL.state.checked.indexOf('cl:' + cl.id + ':' + it[0]) >= 0; }).length; };
    var body = h('div');
    var det = fold('☑ ' + cl.title + '（' + count() + '／' + cl.items.length + '）', body, false);
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

  function domain(url) { var m = /^https?:\/\/([^/]+)/.exec(url || ''); return m ? m[1].replace(/^www\./, '') : ''; }

  // リンク 1 件：外部は新しいタブで開き、アプリ内は画面を切り替える
  function linkCard(l, big) {
    var internal = !!l.internal;
    var href = internal ? l.href : l.url;
    if (!href || (!internal && !/^https:\/\//.test(href))) return null;
    var a = h('a', { class: 'link-card' + (big ? ' big' : '') + (internal ? ' internal' : ''), href: href },
      h('span', { class: 'link-ico', 'aria-hidden': 'true', text: l.icon || '🔗' }),
      h('span', { class: 'link-body' },
        h('span', { class: 'link-title', text: l.title }),
        l.desc ? h('span', { class: 'link-desc', text: l.desc }) : null,
        h('span', { class: 'link-meta' },
          internal ? h('span', { class: 'link-tag app', text: 'アプリ内' })
            : h('span', { class: 'link-tag' + (l.official ? ' off' : ''), text: l.official ? '公式' : '外部' }),
          internal ? null : h('span', { text: domain(href) }))),
      h('span', { class: 'link-go', 'aria-hidden': 'true', text: internal ? '›' : '↗' }));
    if (!internal) { a.target = '_blank'; a.rel = 'noopener noreferrer external'; a.setAttribute('aria-label', l.title + '（外部サイトを新しいタブで開く）'); }
    return a;
  }

  HL.screens.links = function (main) {
    var park = HL.data.park, cfg = HL.data.config || {}, L = HL.data.links;
    var err = HL.dataError(['links', 'park-info']);
    if (err) main.appendChild(err);

    main.appendChild(h('section', { class: 'card notice' },
      h('p', { class: 'notice-date', text: HL.targetLabel() + ' のハーモニーランド' }),
      h('p', { text: '当日の朝、まず上の3つを確認。営業時間・ショーの時刻・整理券の取り方は日によって変わります。' })));

    if (L) {
      main.appendChild(h('div', { class: 'link-list' }, (L.top || []).map(function (l) { return linkCard(l, true); })));
      // 見出しへのジャンプ
      main.appendChild(h('nav', { class: 'chips', 'aria-label': 'リンクの分類' }, (L.sections || []).map(function (sec) {
        return h('a', { class: 'chip', href: '#links', text: sec.icon + ' ' + sec.title.replace(/（.*?）/, ''), onclick: function (e) {
          e.preventDefault(); var t = document.getElementById('sec-' + sec.id); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } });
      })));
      (L.sections || []).forEach(function (sec) {
        main.appendChild(h('h2', { class: 'section-title', id: 'sec-' + sec.id, text: sec.icon + ' ' + sec.title }));
        main.appendChild(h('div', { class: 'link-list' }, sec.items.map(function (l) { return linkCard(l); })));
      });
      if (L.note) main.appendChild(h('p', { class: 'small muted hint', text: L.note }));
    }

    main.appendChild(h('h2', { class: 'section-title', text: '☑ メモ・チェック' }));
    if (park && park.checklists) park.checklists.forEach(function (cl) { main.appendChild(checklist(cl)); });

    if (park && park.parkInfo) {
      main.appendChild(fold('🍼 子ども連れ・園内サービスのメモ（公式FAQより）', h('div', null,
        park.parkInfo.map(function (sec) {
          return h('div', null, h('b', { class: 'small', text: sec.title }), h('ul', { class: 'facts' }, sec.items.map(function (t) { return h('li', { text: t }); })));
        }),
        h('p', { class: 'small muted', text: '料金や運用は変わることがあります。最新は公式FAQで確認してください。' }))));
    }

    // 出典と確認状況
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
