/* app.js — 初期化・JSON 読み込み・画面切り替え・共通 UI・初期化エラー表示
   画面：ホーム / 施設詳細 / 施設一覧・検索 / 整理券攻略 / 情報・出典（マップ・ショー・プランは別ファイル） */
window.HL = window.HL || {};

(function () {
  'use strict';

  var DATA_FILES = ['app-config', 'facilities', 'shows', 'sources', 'opening-info'];

  HL.data = { config: null, facilities: [], shows: [], sources: [], opening: null };
  HL.errors = {};          // データファイルごとの読み込みエラー
  HL.dataOrigin = {};      // 'network' | 'bundled'
  HL.screens = {};
  HL.state = null;

  /* ---------- 定数 ---------- */
  HL.CATEGORIES = [
    { id: 'attraction', label: 'アトラクション', icon: '🎡', color: '#E96FA8' },
    { id: 'greeting', label: 'グリーティング', icon: '🤝', color: '#F29A4B' },
    { id: 'show', label: 'ショー・イベント', icon: '🎪', color: '#8D6BE0' },
    { id: 'restaurant', label: '飲食店', icon: '🍽️', color: '#3FA37A' },
    { id: 'shop', label: 'ショップ', icon: '🛍️', color: '#3E8FD6' },
    { id: 'service', label: 'サービス', icon: 'ℹ️', color: '#6B7A8F' },
    { id: 'family', label: '子ども向け設備', icon: '🍼', color: '#D9A400' }
  ];
  HL.SHOW_CATEGORIES = { parade: 'パレード', show: 'ショー', greeting: 'グリーティング', event: 'イベント' };

  HL.STATUS = {
    confirmed: { label: '確認済み', icon: '✓' },
    scheduled: { label: '開催予定', icon: '◆' },
    unconfirmed: { label: '未確認', icon: '？' },
    changed: { label: '変更あり', icon: '！' },
    expired: { label: '期限切れ', icon: '×' }
  };

  HL.TICKET_NOTICE = '整理券の配布方法・受付条件は変更される場合があります。対象日の最新情報を公式案内で確認してください。';

  HL.SCREEN_TITLES = {
    home: 'ホーム', map: '園内マップ', facility: '施設詳細', show: 'ショー・イベント詳細', list: '施設一覧・検索',
    tickets: '整理券攻略', shows: 'ショー・イベント', plan: '回り方プラン', sources: '情報・出典'
  };
  var NAV_OF = { facility: null, show: 'shows', list: null, sources: null };

  /* ---------- DOM ヘルパー（文字列は常に textContent で入れる） ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k in el && k !== 'list' && typeof v !== 'string') el[k] = v;
        else el.setAttribute(k, v === true ? '' : String(v));
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  HL.h = h;

  /* 外部リンク：新しいタブ・noopener・視覚的に区別 */
  HL.extLink = function (url, label, opts) {
    opts = opts || {};
    if (!url || !/^https:\/\//.test(url)) return h('span', { class: 'unk', text: 'リンク未登録' });
    return h('a', {
      class: 'ext' + (opts.block ? ' block' : ''), href: url, target: '_blank', rel: 'noopener noreferrer external',
      title: '外部サイトを開きます：' + url
    }, h('span', { class: 'ext-tag', text: opts.official === false ? '外部' : '公式' }), label || url);
  };

  HL.statusBadge = function (status, labelOverride) {
    var s = HL.STATUS[status] || HL.STATUS.unconfirmed;
    var key = HL.STATUS[status] ? status : 'unconfirmed';
    return h('span', { class: 'badge st-' + key }, h('span', { class: 'bi', 'aria-hidden': 'true', text: s.icon }), labelOverride || s.label);
  };

  HL.unknown = function (text) { return h('span', { class: 'unk', text: text || '未確認' }); };
  HL.val = function (v, fallback) {
    if (v == null || v === '') return HL.unknown(fallback);
    return String(v);
  };
  HL.requiredText = function (v) {
    if (v === true) return '必要（公式案内あり）';
    if (v === false) return '不要（公式案内あり）';
    return null;
  };
  HL.requiredNode = function (v) {
    var t = HL.requiredText(v);
    return t ? t : HL.unknown('要否は未確認');
  };

  HL.cat = function (id) {
    for (var i = 0; i < HL.CATEGORIES.length; i++) if (HL.CATEGORIES[i].id === id) return HL.CATEGORIES[i];
    return { id: id, label: id || '未分類', icon: '📍', color: '#999' };
  };
  HL.facility = function (id) { return HL.data.facilities.filter(function (f) { return f.id === id; })[0] || null; };
  HL.showById = function (id) { return HL.data.shows.filter(function (s) { return s.id === id; })[0] || null; };
  HL.source = function (id) { return HL.data.sources.filter(function (s) { return s.id === id; })[0] || null; };
  HL.firstSourceUrl = function (ids) {
    for (var i = 0; i < (ids || []).length; i++) { var s = HL.source(ids[i]); if (s && s.official) return s; }
    for (var j = 0; j < (ids || []).length; j++) { var t = HL.source(ids[j]); if (t) return t; }
    return null;
  };

  HL.targetDate = function () { return (HL.data.config && HL.data.config.targetDate) || '2026-10-13'; };
  HL.targetLabel = function () { return (HL.data.config && HL.data.config.targetDateLabel) || HL.targetDate(); };
  HL.dayType = function () { return (HL.data.config && HL.data.config.targetDayType) || 'unknown'; };
  HL.fmtDate = function (iso) {
    if (!iso) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!m) return iso;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return (+m[1]) + '年' + (+m[2]) + '月' + (+m[3]) + '日（' + '日月火水木金土'.charAt(d.getDay()) + '）';
  };
  HL.fmtDateTime = function (iso) {
    if (!iso) return null;
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  };

  /* 検索用の正規化：全角半角・大文字小文字・カタカナ／ひらがな・記号や空白の差を吸収 */
  HL.norm = function (s) {
    s = String(s || '');
    try { s = s.normalize('NFKC'); } catch (e) { /* noop */ }
    s = s.toLowerCase().replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); });
    return s.replace(/[\s・〜~ー\-‐－!！?？★☆、。,.（）()「」『』]/g, '');
  };

  /* ---------- 状態判定 ---------- */
  // 施設の「当日の状態」
  HL.facilityStatus = function (f) { return (f.operation && f.operation.status) || 'unconfirmed'; };
  // 施設が未確認の情報を含むか
  HL.hasUnconfirmed = function (f) {
    var op = f.operation || {}, rq = f.requirements || {};
    return op.status !== 'confirmed' || op.openingTime == null || rq.ticketRequired === 'unknown' ||
      rq.reservationRequired === 'unknown' || rq.price == null || (f.location && f.location.x == null) ||
      (f.admission && f.admission.status !== 'confirmed');
  };
  HL.needsAdmission = function (o) {
    var rq = o.requirements || {};
    return (o.admission && o.admission.required === true) || rq.ticketRequired === true || rq.reservationRequired === true;
  };
  HL.admissionUnknown = function (o) {
    if (HL.needsAdmission(o)) return false;
    var rq = o.requirements || {};
    return !(rq.ticketRequired === false && rq.reservationRequired === false);
  };
  // 対象日の時刻：公式の当日スケジュールで確定したもののみ返す
  HL.targetSchedule = function (show) {
    var t = HL.targetDate();
    return (show.schedule || []).filter(function (s) { return s.date === t; })[0] || null;
  };
  HL.inPeriod = function (show) {
    var p = show.eventPeriod || {}, t = HL.targetDate();
    return (!p.startDate || p.startDate <= t) && (!p.endDate || t <= p.endDate);
  };
  // 期間中の通常時刻（参考）：対象日の曜日区分に合うもの
  HL.refTimes = function (show) {
    var dt = HL.dayType();
    if (show.days === 'weekday' && dt !== 'weekday') return [];
    if (show.days === 'holiday' && dt !== 'holiday') return [];
    return (show.announcedTimes || []).filter(function (a) { return a.dayType === 'all' || a.dayType === dt; });
  };
  HL.showDayStatus = function (show) {
    if (!HL.inPeriod(show)) return 'expired';
    var s = HL.targetSchedule(show);
    return (s && s.status) || 'unconfirmed';
  };

  /* ---------- 保存 ---------- */
  HL.persist = function () {
    var ok = HL.storage.save(HL.state);
    if (!ok) HL.toast('この端末では予定を保存できません', true);
    return ok;
  };
  HL.visitKey = function (kind, id) { return kind + ':' + id; };
  HL.isVisited = function (kind, id) { return HL.state.visited.indexOf(HL.visitKey(kind, id)) >= 0; };
  HL.toggleVisited = function (kind, id) {
    var k = HL.visitKey(kind, id), i = HL.state.visited.indexOf(k);
    if (i >= 0) HL.state.visited.splice(i, 1); else HL.state.visited.push(k);
    HL.persist();
    return i < 0;
  };
  HL.planItem = function (kind, id) {
    return HL.state.plan.filter(function (p) { return p.kind === kind && p.refId === id; })[0] || null;
  };
  HL.addToPlan = function (kind, id, startTime, endTime) {
    if (HL.planItem(kind, id)) return false;
    HL.state.plan.push({
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      kind: kind, refId: id, startTime: startTime || '', endTime: endTime || '', priority: 'normal', memo: '',
      createdAt: new Date().toISOString()
    });
    HL.persist();
    return true;
  };
  HL.removeFromPlan = function (kind, id) {
    HL.state.plan = HL.state.plan.filter(function (p) { return !(p.kind === kind && p.refId === id); });
    HL.persist();
  };

  var toastTimer, toastWarnUntil = 0;
  // warn=true の警告は表示中に通常のお知らせで上書きしない
  HL.toast = function (msg, warn) {
    if (!warn && Date.now() < toastWarnUntil) return;
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    if (warn) toastWarnUntil = Date.now() + 2500;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, warn ? 3000 : 2200);
  };

  /* ---------- 共通部品 ---------- */
  HL.sourcesBlock = function (ids) {
    var wrap = h('div');
    if (!ids || !ids.length) { wrap.appendChild(HL.unknown('出典未登録（情報未確認として扱います）')); return wrap; }
    ids.forEach(function (id) {
      var s = HL.source(id);
      if (!s) { wrap.appendChild(h('div', null, HL.unknown('出典データが見つかりません：' + id))); return; }
      wrap.appendChild(h('div', { style: { marginBottom: '6px' } },
        HL.extLink(s.url, s.title, { official: s.official }),
        h('div', { class: 'small muted' },
          '公開日：' + (HL.fmtDate(s.publishedAt) || '未確認') + '　確認日：' + (s.checkedAt ? HL.fmtDate(s.checkedAt) : '本文未確認') +
          (s.searchedAt ? '（' + HL.fmtDate(s.searchedAt) + ' 検索で概要を確認）' : ''))));
    });
    return wrap;
  };

  HL.officialButton = function (ids, label) {
    var s = HL.firstSourceUrl(ids);
    if (!s) return HL.unknown('公式リンク未登録');
    return HL.extLink(s.url, label || '公式情報を確認', { block: true, official: s.official });
  };

  HL.lastVerified = function (v) { return v ? HL.fmtDateTime(v) : HL.unknown('未確認（公式本文での確認なし）'); };

  HL.facilityCard = function (f, opts) {
    opts = opts || {};
    var c = HL.cat(f.category), rq = f.requirements || {};
    var badges = h('div', { class: 'badges' },
      h('span', { class: 'badge cat', text: c.icon + ' ' + c.label }),
      HL.needsAdmission(f) ? h('span', { class: 'badge req', text: '🎫 ' + ((f.admission && f.admission.type) || '整理券・予約') + 'が必要' })
        : (rq.ticketRequired === false && rq.reservationRequired === false ? h('span', { class: 'badge plain', text: '整理券・予約 不要' })
          : h('span', { class: 'badge plain', text: '整理券 要否未確認' })),
      HL.statusBadge(HL.facilityStatus(f), '当日：' + HL.STATUS[HL.facilityStatus(f)].label),
      HL.isVisited('facility', f.id) ? h('span', { class: 'badge st-confirmed', text: '✔ 訪問済み' }) : null,
      HL.planItem('facility', f.id) ? h('span', { class: 'badge cat', text: '♥ 行きたい' }) : null);
    return h('div', { class: 'item' + (opts.highlight ? ' highlight' : ''), id: opts.anchor ? 'fac-' + f.id : null },
      h('div', { class: 'item-head' },
        h('div', { class: 'item-ico', 'aria-hidden': 'true', text: c.icon }),
        h('div', { style: { minWidth: 0, flex: 1 } },
          h('a', { class: 'item-name', href: '#facility/' + f.id, text: f.name }),
          h('div', { class: 'item-meta', text: 'エリア：' + (f.area || '未確認') }),
          badges,
          opts.extra || null)));
  };

  /* ---------- ルーター ---------- */
  HL.parseHash = function () {
    var raw = (location.hash || '').replace(/^#/, '');
    var q = '', i = raw.indexOf('?');
    if (i >= 0) { q = raw.slice(i + 1); raw = raw.slice(0, i); }
    var parts = raw.split('/').filter(Boolean).map(decodeURIComponent);
    var params = {};
    q.split('&').forEach(function (kv) {
      if (!kv) return;
      var j = kv.indexOf('=');
      params[decodeURIComponent(j < 0 ? kv : kv.slice(0, j))] = j < 0 ? '' : decodeURIComponent(kv.slice(j + 1));
    });
    return { name: parts[0] || (HL.data.config && HL.data.config.defaultTab) || 'home', id: parts[1] || null, params: params };
  };
  HL.go = function (hash) { if (location.hash === hash) render(); else location.hash = hash; };

  function render() {
    var r = HL.parseHash();
    var screen = HL.screens[r.name] ? r.name : 'home';
    var main = document.getElementById('main');
    main.textContent = '';
    document.getElementById('screen-title').textContent = HL.SCREEN_TITLES[screen] || '';
    document.title = (HL.SCREEN_TITLES[screen] || '') + '｜ハーモニーランド攻略ナビ';
    var tab = NAV_OF.hasOwnProperty(screen) ? NAV_OF[screen] : screen;
    Array.prototype.forEach.call(document.querySelectorAll('.bottom-nav a'), function (a) {
      if (a.getAttribute('data-tab') === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    try {
      HL.screens[screen](main, r);
    } catch (e) {
      main.appendChild(h('div', { class: 'err' }, '画面の表示中にエラーが発生しました：' + (e && e.message)));
      if (window.console) console.error(e);
    }
    if (!r.params.keepScroll) window.scrollTo(0, 0);
  }
  HL.render = render;

  function updateHeader() {
    var cfg = HL.data.config;
    document.getElementById('app-name').textContent = (cfg && cfg.appName) || 'ハーモニーランド攻略ナビ';
    document.getElementById('app-date').textContent = '対象日 ' + HL.targetLabel();
    var st = document.getElementById('data-state');
    if (!navigator.onLine) { st.className = 'data-state offline'; st.textContent = 'オフライン・保存済み情報'; return; }
    var op = HL.data.opening;
    var anyConfirmed = op && op.status === 'confirmed';
    st.className = 'data-state' + (anyConfirmed ? ' ok' : '');
    st.textContent = anyConfirmed ? '当日情報 確認済み' : '？ 当日情報 未確認あり';
  }
  HL.updateHeader = updateHeader;

  /* ---------- データ読み込み（ファイルごとに失敗を分離） ---------- */
  function loadOne(name) {
    var bundled = window.HL_BUNDLED_DATA && window.HL_BUNDLED_DATA[name];
    var useBundledFirst = location.protocol === 'file:';
    function fromBundle(err) {
      if (bundled !== undefined) { HL.dataOrigin[name] = 'bundled'; return bundled; }
      throw err || new Error('データがありません');
    }
    if (useBundledFirst || !window.fetch) return Promise.resolve().then(function () { return fromBundle(); });
    return fetch('./data/' + name + '.json', { cache: 'no-cache' }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (j) { HL.dataOrigin[name] = 'network'; return j; }).catch(fromBundle);
  }

  HL.start = function () {
    HL.state = HL.storage.load();
    Promise.all(DATA_FILES.map(function (n) {
      return loadOne(n).then(function (d) { return [n, d, null]; }, function (e) { return [n, null, e]; });
    })).then(function (results) {
      results.forEach(function (r) {
        var n = r[0], d = r[1], e = r[2];
        if (e) { HL.errors[n] = (e && e.message) || '読み込み失敗'; return; }
        if (n === 'app-config') HL.data.config = d;
        else if (n === 'opening-info') HL.data.opening = d;
        else if (Array.isArray(d)) HL.data[n] = d;
        else HL.errors[n] = '形式が正しくありません';
      });
      updateHeader();
      window.addEventListener('hashchange', render);
      window.addEventListener('online', updateHeader);
      window.addEventListener('offline', updateHeader);
      render();
      registerSW();
    });
  };

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    var ok = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!ok) return;
    navigator.serviceWorker.register('./sw.js').catch(function () { /* オフライン非対応でも動く */ });
  }

  HL.dataError = function (names) {
    var bad = names.filter(function (n) { return HL.errors[n]; });
    if (!bad.length) return null;
    return h('div', { class: 'err', role: 'alert' },
      'データを読み込めませんでした（' + bad.map(function (n) { return n + '.json'; }).join('、') + '）。この機能の一部を表示できません。',
      h('div', { class: 'small' }, 'ほかの画面は利用できます。再読み込みするか、公式サイトで確認してください。'));
  };

  HL.storageWarning = function () {
    var st = HL.storage.status, box = h('div');
    if (!st.available) box.appendChild(h('div', { class: 'card warn small' }, '⚠ この端末では予定を保存できません（ブラウザの設定で保存が無効です）。施設の閲覧はそのまま利用できます。'));
    else if (st.lastSaveFailed) box.appendChild(h('div', { class: 'card warn small' }, '⚠ この端末では予定を保存できませんでした。'));
    if (st.corrupted) {
      box.appendChild(h('div', { class: 'card warn small' },
        '⚠ 保存データを読み込めなかったため、初期状態で表示しています。',
        h('div', { class: 'btn-row' }, h('button', {
          class: 'btn small danger', type: 'button', text: '保存データを初期化する',
          onclick: function () { HL.state = HL.storage.reset(); HL.persist(); HL.toast('保存データを初期化しました'); render(); }
        }))));
    }
    return box.childNodes.length ? box : null;
  };

  /* =====================================================================
     SCR-001 ホーム
     ===================================================================== */
  HL.screens.home = function (main) {
    var cfg = HL.data.config || {}, op = HL.data.opening;
    append(main, HL.dataError(DATA_FILES));
    append(main, HL.storageWarning());

    // 1. 対象日と施設名
    main.appendChild(h('section', { class: 'card hero' },
      h('p', { class: 'hero-title', text: HL.targetLabel() }),
      h('p', { class: 'hero-sub', text: (cfg.facilityName || 'サンリオキャラクターパーク ハーモニーランド') + (cfg.facilityAddress ? '（' + cfg.facilityAddress + '）' : '') }),
      h('p', { class: 'small muted', style: { margin: '6px 0 0' }, text: 'このアプリは非公式の攻略メモです。公式アプリ・公式サービスではありません。' })));

    // 2. 当日限定の整理券・受付情報（最優先）
    var adm = HL.data.facilities.map(function (f) { return { kind: 'facility', o: f }; })
      .concat(HL.data.shows.filter(HL.inPeriod).map(function (s) { return { kind: 'show', o: s }; }))
      .filter(function (x) { return HL.needsAdmission(x.o); });
    var tCard = h('section', { class: 'card' }, h('h2', null, '🎫 整理券・受付が必要なもの'),
      h('p', { class: 'small warn', style: { margin: '0 0 8px', padding: '8px 10px', borderRadius: '10px', background: 'var(--color-warning)', color: 'var(--color-warning-text)' }, text: HL.TICKET_NOTICE }));
    if (!adm.length) tCard.appendChild(h('p', { class: 'empty', text: '整理券・受付が必要と確認できた施設は登録されていません。' }));
    adm.forEach(function (x) {
      var a = x.o.admission || {};
      var checked = HL.state.checked.indexOf(x.kind + ':' + x.o.id) >= 0;
      tCard.appendChild(h('div', { class: 'notice-line' },
        h('span', { 'aria-hidden': 'true', text: checked ? '☑' : '☐' }),
        h('div', { style: { flex: 1 } },
          h('a', { class: 'inlink', href: (x.kind === 'show' ? '#show/' : '#facility/') + x.o.id, text: x.o.name }),
          h('div', { class: 'small' }, (a.type || '整理券・予約') + '：' + (a.method || '方法は未確認')),
          h('div', { class: 'badges' }, HL.statusBadge(a.status || 'unconfirmed', '受付条件：' + HL.STATUS[a.status || 'unconfirmed'].label),
            checked ? h('span', { class: 'badge st-confirmed', text: '自分で確認済み' }) : null))));
    });
    tCard.appendChild(h('div', { class: 'btn-row' }, h('a', { class: 'btn', href: '#tickets', text: '整理券を確認' })));
    main.appendChild(tCard);

    // 3. 当日のショー・イベント
    var sCard = h('section', { class: 'card' }, h('h2', null, '🎪 当日のショー・イベント'));
    var inPeriod = HL.data.shows.filter(HL.inPeriod);
    var confirmedToday = inPeriod.filter(function (s) { var t = HL.targetSchedule(s); return t && t.startTime && t.status !== 'expired'; });
    if (HL.errors.shows) sCard.appendChild(h('p', { class: 'empty', text: 'ショー情報を読み込めませんでした。' }));
    else if (!confirmedToday.length) {
      sCard.appendChild(h('p', { class: 'small', style: { margin: '0 0 6px' } }, HL.unknown('当日の開催情報は未確認です'),
        '。以下は開催期間中に公式に案内された通常の時刻（参考）です。対象日の開催・時刻は公式スケジュールで確認してください。'));
    }
    var rows = HL.schedule ? HL.schedule.dayRows(inPeriod) : [];
    if (rows.length) {
      var ul = h('ul', { class: 'mini-tl' });
      rows.forEach(function (r) {
        ul.appendChild(h('li', null,
          h('span', { class: 't' + (r.ref ? ' ref' : ''), text: r.ref ? (r.start ? '参考 ' + r.start : '時刻未確認') : r.start }),
          h('span', null, h('a', { class: 'inlink', href: '#show/' + r.show.id, text: r.show.name }),
            h('span', { class: 'small muted', text: '　' + ((r.show.venue && r.show.venue.name) || '会場未確認') }))));
      });
      sCard.appendChild(ul);
    }
    sCard.appendChild(h('div', { class: 'btn-row' }, h('a', { class: 'btn', href: '#shows', text: 'ショーを見る' })));
    main.appendChild(sCard);

    // 4. 休止・変更・雨天
    var nCard = h('section', { class: 'card' }, h('h2', null, '⚠ 休止・変更・雨天'));
    var changed = HL.data.facilities.filter(function (f) { return ['changed', 'expired'].indexOf(HL.facilityStatus(f)) >= 0; })
      .concat(HL.data.shows.filter(function (s) { return HL.showDayStatus(s) === 'changed'; }));
    if (changed.length) changed.forEach(function (o) { nCard.appendChild(h('div', { class: 'notice-line' }, HL.statusBadge('changed'), o.name)); });
    else nCard.appendChild(h('p', { class: 'empty', style: { paddingTop: 0 } }, '休止・変更の情報は登録されていません（休止がないことを確認したわけではありません）。'));
    if (op && op.weather) nCard.appendChild(h('div', { class: 'notice-line' }, HL.statusBadge(op.weather.status), op.weather.text));
    main.appendChild(nCard);

    // 5. 営業時間
    var oCard = h('section', { class: 'card' }, h('h2', null, '🕙 営業情報'));
    if (!op || HL.errors['opening-info']) oCard.appendChild(h('p', { class: 'empty' }, '営業情報を読み込めませんでした。営業時間は公式サイトで確認してください。'));
    else if (op.status !== 'confirmed' || !op.openingTime) {
      oCard.appendChild(h('p', { style: { margin: 0 } }, HL.statusBadge(op.status || 'unconfirmed'), ' 営業時間は公式サイトで確認してください'));
      (op.notes || []).forEach(function (n) { oCard.appendChild(h('div', { class: 'notice-line small' }, '・', n.text)); });
    } else {
      oCard.appendChild(h('p', { style: { margin: 0 } }, HL.statusBadge('confirmed'), ' ' + op.openingTime + '〜' + (op.closingTime || '？')));
    }
    if (op) oCard.appendChild(HL.officialButton(op.sources, '公式の営業カレンダーを確認'));
    main.appendChild(oCard);

    // 6. 行きたい施設
    var wants = HL.state.plan.length;
    var visited = HL.state.visited.length;
    main.appendChild(h('section', { class: 'card' }, h('h2', null, '📝 わたしのプラン'),
      h('p', { style: { margin: 0 } }, '行きたい・予定：', h('b', { text: wants + '件' }), '　訪問済み：', h('b', { text: visited + '件' })),
      h('div', { class: 'btn-row' }, h('a', { class: 'btn sub', href: '#plan', text: '回り方プラン' }))));

    // 7. 主要機能
    main.appendChild(h('h2', { class: 'section-title', text: 'さがす・しらべる' }));
    var quick = h('nav', { class: 'quick', 'aria-label': '主要機能へのリンク' });
    [['#map', '🗺️', '園内マップ', '場所を確認'], ['#list', '🔎', '施設一覧・検索', '名前やカテゴリで'], ['#tickets', '🎫', '整理券を確認', '受付が必要なもの'],
      ['#shows', '🎪', 'ショーを見る', '時間順に'], ['#plan', '📝', '回り方プラン', '行きたい・訪問済み'], ['#sources', '📚', '情報・出典', '確認日と未確認項目']]
      .forEach(function (q) { quick.appendChild(h('a', { href: q[0] }, h('span', { class: 'qi', 'aria-hidden': 'true', text: q[1] }), h('span', null, q[2], h('small', { text: q[3] })))); });
    main.appendChild(quick);

    // 8. 情報の確認状況
    var counts = {};
    HL.data.sources.forEach(function (s) { counts[s.verificationStatus] = (counts[s.verificationStatus] || 0) + 1; });
    var stCard = h('section', { class: 'card note', style: { marginTop: '12px' } }, h('h2', null, '📚 情報の確認状況'),
      h('div', { class: 'badges' }, Object.keys(HL.STATUS).filter(function (k) { return counts[k]; }).map(function (k) {
        return HL.statusBadge(k, HL.STATUS[k].label + ' ' + counts[k] + '件');
      })),
      cfg.dataNote ? h('p', { class: 'small muted', text: cfg.dataNote }) : null,
      h('p', { class: 'small muted', style: { margin: 0 }, text: 'データ作成日：' + (HL.fmtDate(cfg.dataPreparedAt) || '未確認') + '／情報収集対象期間：' +
        (cfg.informationPeriod ? HL.fmtDate(cfg.informationPeriod.startDate) + '〜' + HL.fmtDate(cfg.informationPeriod.endDate) : '未設定') }),
      h('div', { class: 'small', style: { marginTop: '8px' } }, '再確認のタイミング：', h('b', { text: '来園前' }), '（営業カレンダー・イベント・整理券）／', h('b', { text: '当日朝' }), '（営業時間・ショー・整理券・休止）'),
      h('div', { class: 'btn-row' }, h('a', { class: 'btn ghost small', href: '#sources', text: '出典と確認日を見る' })));
    main.appendChild(stCard);

    // 9. 公式サイト
    main.appendChild(HL.extLink(cfg.officialUrl || 'https://www.harmonyland.jp/', '公式情報を確認（ハーモニーランド公式サイト）', { block: true }));
  };

  /* =====================================================================
     SCR-003 施設詳細
     ===================================================================== */
  HL.screens.facility = function (main, r) {
    var f = HL.facility(r.id);
    append(main, HL.dataError(['facilities', 'sources']));
    if (!f) {
      main.appendChild(h('div', { class: 'card' }, '施設が見つかりません。', h('div', { class: 'btn-row' }, h('a', { class: 'btn', href: '#list', text: '施設一覧へ' }))));
      return;
    }
    var c = HL.cat(f.category), op = f.operation || {}, rq = f.requirements || {}, loc = f.location || {}, a = f.admission;
    var st = HL.facilityStatus(f);

    var head = h('section', { class: 'card hero' },
      h('p', { class: 'hero-title', text: f.name }),
      h('div', { class: 'badges' }, h('span', { class: 'badge cat', text: c.icon + ' ' + c.label }), HL.statusBadge(st, '当日の営業：' + HL.STATUS[st].label),
        HL.needsAdmission(f) ? h('span', { class: 'badge req', text: '🎫 ' + ((a && a.type) || '整理券・予約') + 'が必要' }) : null));
    main.appendChild(head);

    // 行きたい／訪問済み（画面遷移なしで完結）
    var want = !!HL.planItem('facility', f.id), vis = HL.isVisited('facility', f.id);
    var wantBtn = h('button', { class: 'btn' + (want ? ' on' : ' sub'), type: 'button', 'aria-pressed': String(want), text: want ? '♥ 行きたい（登録済み）' : '♡ 行きたい',
      onclick: function () {
        if (HL.planItem('facility', f.id)) { HL.removeFromPlan('facility', f.id); HL.toast('プランから外しました'); }
        else { HL.addToPlan('facility', f.id); HL.toast('プランに追加しました'); }
        render();
      } });
    var visBtn = h('button', { class: 'btn' + (vis ? ' on' : ' sub'), type: 'button', 'aria-pressed': String(vis), text: vis ? '✔ 訪問済み' : '□ 訪問済みにする',
      onclick: function () { HL.toast(HL.toggleVisited('facility', f.id) ? '訪問済みにしました' : '訪問済みを取り消しました'); render(); } });
    main.appendChild(h('div', { class: 'btn-row', style: { marginTop: 0, marginBottom: '12px' } }, wantBtn, visBtn,
      h('a', { class: 'btn ghost', href: '#map?focus=' + encodeURIComponent(f.id), text: '🗺️ マップで見る' })));

    // 施設画像：利用条件を確認した画像のみ
    var imgNode = f.image && f.image.url && f.image.licenseConfirmed ? h('img', { src: f.image.url, alt: f.name, style: { borderRadius: '12px' } }) : h('span', { class: 'muted small', text: '利用条件を確認した画像がないため表示していません' });

    var desc = f.description || '';
    var descNode = desc.length > 80 ? h('details', { class: 'fold' }, h('summary', { text: desc.slice(0, 60) + '…（続きを読む）' }), h('p', { text: desc })) : (desc || HL.unknown());

    var posNode = loc.x != null && loc.y != null ? h('span', null, 'マップに登録済み', loc.positionSource ? h('span', { class: 'small muted', text: '（根拠：' + loc.positionSource + '）' }) : null)
      : HL.unknown('位置は未確認（マップに表示していません）');

    var hours = op.openingTime ? op.openingTime + '〜' + (op.closingTime || '？') : HL.unknown('公式情報を確認してください');

    var admNode;
    if (!a) admNode = HL.unknown('受付方法は未確認');
    else admNode = h('div', null,
      h('div', null, h('b', { text: (a.type || '整理券') + '：' }), a.method || HL.unknown('方法は未確認'),
        a.methodStatus ? h('span', null, ' ', HL.statusBadge(a.methodStatus)) : null),
      h('div', { class: 'small' }, '配布・受付場所：', HL.val(a.distributionLocation)),
      h('div', { class: 'small' }, '開始時刻：', HL.val(a.distributionStartTime)),
      h('div', { class: 'small' }, '受付終了条件：', HL.val(a.endCondition)),
      a.statusNote ? h('div', { class: 'small muted', text: a.statusNote }) : null);

    var kv = h('dl', { class: 'kv' });
    function row(k, v) { kv.appendChild(h('dt', { text: k })); kv.appendChild(h('dd', null, v)); }
    row('施設画像', imgNode);
    row('カテゴリ', c.icon + ' ' + c.label);
    row('園内エリア', HL.val(f.area));
    row('マップ上の位置', posNode);
    row('概要', descNode);
    row('利用条件', rq.note ? h('span', null, HL.unknown('対象日の条件は未確認'), h('div', { class: 'small muted', text: rq.note })) : HL.unknown('公式情報を確認してください'));
    row('年齢・身長制限', h('div', null,
      h('div', null, '年齢：', rq.ageRestriction ? h('span', null, rq.ageRestriction, h('span', { class: 'small muted', text: '（掲載日未確認の公式情報）' })) : HL.unknown()),
      h('div', null, '身長：', HL.val(rq.heightRestriction))));
    row('料金', HL.val(rq.price, '公式情報を確認してください'));
    row('営業時間', hours);
    row('整理券の要否', HL.requiredNode(a ? a.required : rq.ticketRequired));
    if (a && a.requiredNote) kv.lastChild.appendChild(h('div', { class: 'small muted', text: a.requiredNote }));
    row('予約の要否', HL.requiredNode(rq.reservationRequired));
    row('受付方法', admNode);
    row('雨天時の扱い', op.weatherPolicy && op.weatherPolicy !== 'unconfirmed' ? op.weatherPolicy : HL.unknown());
    row('営業・休止状況', st === 'unconfirmed' ? HL.unknown('対象日の営業状況は未確認です') : HL.statusBadge(st));
    row('情報の確認日', HL.lastVerified(f.lastVerifiedAt));
    row('情報の出典', HL.sourcesBlock(f.sources));
    main.appendChild(h('section', { class: 'card' }, kv));

    if (f.notes && f.notes.length) {
      main.appendChild(h('section', { class: 'card note' }, h('h2', null, '📌 メモ'),
        f.notes.map(function (n) { return h('div', { class: 'notice-line small' }, '・', n); })));
    }
    // 関連するショー
    var rel = HL.data.shows.filter(function (s) { return s.venue && s.venue.facilityId === f.id; });
    if (rel.length) {
      main.appendChild(h('section', { class: 'card' }, h('h2', null, '🎪 この場所のショー・イベント'),
        rel.map(function (s) { return h('div', { class: 'notice-line' }, h('a', { class: 'inlink', href: '#show/' + s.id, text: s.name }), HL.statusBadge(HL.showDayStatus(s))); })));
    }
    main.appendChild(HL.officialButton(f.sources, '公式情報を確認'));
  };

  /* =====================================================================
     SCR-004 施設一覧・検索
     ===================================================================== */
  var LIST_FILTERS = [
    { id: 'all', label: 'すべて' },
    { id: 'attraction', label: 'アトラクション' },
    { id: 'greeting', label: 'グリーティング' },
    { id: 'show', label: 'ショー・イベント' },
    { id: 'restaurant', label: '飲食店' },
    { id: 'shop', label: 'ショップ' },
    { id: 'family', label: '子ども向け設備' },
    { id: 'ticket', label: '整理券・予約が必要' },
    { id: 'unconfirmed', label: '未確認情報がある施設' }
  ];
  HL.screens.list = function (main, r) {
    append(main, HL.dataError(['facilities']));
    var state = { q: r.params.q || '', f: r.params.f || 'all' };
    var input = h('input', { class: 'search', type: 'search', placeholder: '施設名・エリア・カテゴリで検索', 'aria-label': '施設を検索', value: state.q, autocomplete: 'off' });
    var chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'フィルター' });
    var out = h('div', { 'aria-live': 'polite' });
    LIST_FILTERS.forEach(function (lf) {
      chips.appendChild(h('button', { class: 'chip', type: 'button', 'aria-pressed': String(lf.id === state.f), 'data-f': lf.id, text: lf.label,
        onclick: function () {
          state.f = lf.id;
          Array.prototype.forEach.call(chips.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-f') === state.f)); });
          draw(); sync();
        } }));
    });
    input.addEventListener('input', function () { state.q = input.value; draw(); sync(); });
    function sync() {
      var hsh = '#list' + (state.q || state.f !== 'all' ? '?' + [state.q ? 'q=' + encodeURIComponent(state.q) : '', state.f !== 'all' ? 'f=' + state.f : ''].filter(Boolean).join('&') : '');
      if (history.replaceState) history.replaceState(null, '', hsh);
    }
    function matchFilter(f) {
      switch (state.f) {
        case 'all': return true;
        case 'ticket': return HL.needsAdmission(f);
        case 'unconfirmed': return HL.hasUnconfirmed(f);
        default: return f.category === state.f;
      }
    }
    function matchText(f) {
      if (!state.q.trim()) return true;
      var q = HL.norm(state.q), c = HL.cat(f.category);
      return [f.name, f.kana, f.area, c.label].concat(f.tags || []).some(function (t) { return t && HL.norm(t).indexOf(q) >= 0; });
    }
    function draw() {
      out.textContent = '';
      var list = HL.data.facilities.filter(function (f) { return matchFilter(f) && matchText(f); });
      // ショー・イベントもあわせて検索対象にする
      var shows = (state.f === 'all' || state.f === 'show' || state.f === 'greeting' || state.f === 'ticket' || state.f === 'unconfirmed')
        ? HL.data.shows.filter(function (s) {
          if (state.f === 'greeting' && s.category !== 'greeting') return false;
          if (state.f === 'show' && s.category === 'greeting') return false;
          if (state.f === 'ticket' && !HL.needsAdmission(s)) return false;
          if (state.f === 'unconfirmed' && HL.showDayStatus(s) === 'confirmed') return false;
          return !state.q.trim() || [s.name, s.venue && s.venue.name, HL.SHOW_CATEGORIES[s.category]].some(function (t) { return t && HL.norm(t).indexOf(HL.norm(state.q)) >= 0; });
        }) : [];
      out.appendChild(h('p', { class: 'small muted', text: '施設 ' + list.length + '件' + (shows.length ? '／ショー・イベント ' + shows.length + '件' : '') }));
      if (!list.length && !shows.length) {
        out.appendChild(h('p', { class: 'card', text: '該当する施設はありません' }));
        if (['restaurant', 'shop', 'family', 'service'].indexOf(state.f) >= 0) {
          out.appendChild(h('p', { class: 'small muted', text: 'このカテゴリの施設は、公式情報で名称・位置を確認できていないため登録していません（架空の施設は作りません）。' }));
          out.appendChild(HL.extLink((HL.data.config || {}).officialUrl || 'https://www.harmonyland.jp/', '公式サイトで確認', { block: true }));
        }
      }
      list.forEach(function (f) { out.appendChild(HL.facilityCard(f)); });
      shows.forEach(function (s) {
        out.appendChild(h('div', { class: 'item' }, h('div', { class: 'item-head' },
          h('div', { class: 'item-ico', 'aria-hidden': 'true', text: s.category === 'greeting' ? '🤝' : '🎪' }),
          h('div', { style: { flex: 1, minWidth: 0 } },
            h('a', { class: 'item-name', href: '#show/' + s.id, text: s.name }),
            h('div', { class: 'item-meta', text: (HL.SHOW_CATEGORIES[s.category] || 'イベント') + '／会場：' + ((s.venue && s.venue.name) || '未確認') }),
            h('div', { class: 'badges' }, HL.statusBadge(HL.showDayStatus(s), '当日：' + HL.STATUS[HL.showDayStatus(s)].label),
              HL.needsAdmission(s) ? h('span', { class: 'badge req', text: '🎫 ' + ((s.admission && s.admission.type) || '受付') + 'が必要' }) : null)))));
      });
    }
    main.appendChild(input);
    main.appendChild(chips);
    main.appendChild(out);
    draw();
  };

  /* =====================================================================
     SCR-005 整理券攻略
     ===================================================================== */
  HL.screens.tickets = function (main) {
    append(main, HL.dataError(['facilities', 'shows']));
    main.appendChild(h('div', { class: 'card warn', role: 'note' }, h('b', { text: '⚠ ご注意　' }), HL.TICKET_NOTICE));
    main.appendChild(h('p', { class: 'small muted', text: 'このアプリは整理券を発行・取得しません。「自分で確認した」のチェックは、公式情報を自分で確認したことのメモです。' }));

    var all = HL.data.facilities.map(function (f) { return { kind: 'facility', o: f }; })
      .concat(HL.data.shows.filter(HL.inPeriod).map(function (s) { return { kind: 'show', o: s }; }));
    var g1 = [], g2 = [], g3 = [], g4 = [], notNeeded = [];
    all.forEach(function (x) {
      var a = x.o.admission;
      if (a && a.status === 'expired') g4.push(x);
      else if (HL.needsAdmission(x.o)) (a && a.status === 'confirmed' ? g1 : g2).push(x);
      else if (HL.admissionUnknown(x.o)) g3.push(x);
      else notNeeded.push(x);
    });

    function admCard(x) {
      var o = x.o, a = o.admission || {}, key = x.kind + ':' + o.id;
      var checked = HL.state.checked.indexOf(key) >= 0;
      var kv = h('dl', { class: 'kv' });
      function row(k, v) { kv.appendChild(h('dt', { text: k })); kv.appendChild(h('dd', null, v)); }
      row('必要な手続き', a.type ? h('span', null, a.type, h('div', { class: 'small muted', text: a.requiredNote || '' })) : HL.unknown());
      row('方法', a.method ? h('span', null, a.method, ' ', HL.statusBadge(a.methodStatus || 'unconfirmed')) : HL.unknown());
      row('取得場所', HL.val(a.distributionLocation));
      row('取得開始時刻', HL.val(a.distributionStartTime));
      row('受付終了条件', HL.val(a.endCondition));
      row('定員', HL.val(a.capacity));
      row('参加条件', HL.val(a.eligibility));
      if (x.kind === 'show') {
        var ref = HL.refTimes(o);
        row('開催時刻', ref.length ? h('span', null, HL.unknown('対象日は未確認'), h('div', { class: 'small muted', text: '参考：期間中の通常時刻 ' + ref.map(function (t) { return t.startTime + '〜' + (t.endTime || ''); }).join('、') })) : HL.unknown());
      }
      row('当日の状態', h('span', null, HL.statusBadge(a.status || 'unconfirmed'), a.statusNote ? h('div', { class: 'small muted', text: a.statusNote }) : null));
      row('最終確認日時', HL.lastVerified(o.lastVerifiedAt));
      var cb = h('input', { type: 'checkbox', checked: checked, onchange: function () {
        var i = HL.state.checked.indexOf(key);
        if (cb.checked && i < 0) HL.state.checked.push(key);
        if (!cb.checked && i >= 0) HL.state.checked.splice(i, 1);
        HL.persist();
      } });
      return h('section', { class: 'card' },
        h('h2', null, h('a', { class: 'inlink', href: (x.kind === 'show' ? '#show/' : '#facility/') + o.id, text: o.name })),
        kv,
        h('label', { class: 'check' }, cb, '公式情報を自分で確認した'),
        HL.officialButton(o.sources, '公式情報を確認'));
    }
    function group(title, desc, arr, renderer) {
      main.appendChild(h('h2', { class: 'section-title', text: title + '（' + arr.length + '件）' }));
      if (desc) main.appendChild(h('p', { class: 'small muted', style: { margin: '-4px 4px 8px' }, text: desc }));
      if (!arr.length) main.appendChild(h('p', { class: 'empty', style: { padding: '0 4px 8px' }, text: '該当なし' }));
      arr.forEach(function (x) { main.appendChild(renderer(x)); });
    }
    function shortCard(x) {
      return HL.facilityCard(x.o, { extra: h('div', { class: 'small' }, HL.unknown('整理券・予約の要否は未確認'), ' ', HL.officialButton(x.o.sources, '公式で確認')) });
    }
    group('① 必要性と受付条件を確認済み', '対象日の必要性と受付条件まで公式情報で確認できたもの。', g1, admCard);
    group('② 必要と案内あり・受付条件は未確認', '整理券・予約・受付が必要と公式に案内されているが、対象日の取得方法や時刻は確認できていないもの。', g2, admCard);
    group('③ 整理券・予約の要否が未確認', '必要とも不要とも確認できていない施設です。現地や公式情報で確認してください。', g3.filter(function (x) { return x.kind === 'facility'; }).concat(g3.filter(function (x) { return x.kind === 'show'; })), function (x) {
      return x.kind === 'facility' ? shortCard(x) : h('div', { class: 'item' }, h('a', { class: 'item-name', href: '#show/' + x.o.id, text: '🎪 ' + x.o.name }), h('div', { class: 'small' }, HL.unknown('整理券・予約の要否は未確認')));
    });
    group('④ 過去の情報のみ', '過去の配布方法などしか確認できていないもの。当日の情報としては使えません。', g4, admCard);
    if (notNeeded.length) group('整理券・予約が不要と確認済み', null, notNeeded, function (x) { return HL.facilityCard(x.o); });
  };

  /* =====================================================================
     SCR-008 情報・出典
     ===================================================================== */
  HL.screens.sources = function (main) {
    var cfg = HL.data.config || {};
    append(main, HL.dataError(DATA_FILES));
    main.appendChild(h('section', { class: 'card note' }, h('h2', null, '📚 この情報について'),
      cfg.dataNote ? h('p', { class: 'small', text: cfg.dataNote }) : null,
      h('p', { class: 'small', style: { margin: 0 } }, '情報収集対象期間：' + (cfg.informationPeriod ? HL.fmtDate(cfg.informationPeriod.startDate) + '〜' + HL.fmtDate(cfg.informationPeriod.endDate) : '未設定')),
      h('p', { class: 'small', style: { margin: 0 } }, 'データ作成日：' + (HL.fmtDate(cfg.dataPreparedAt) || '未確認') + '　データ版：' + (cfg.dataVersion || '—')),
      h('p', { class: 'small muted', style: { margin: '6px 0 0' }, text: 'アプリは公式サイトから情報を自動取得しません。データファイル（data/*.json）を差し替えて更新します。' })));

    // 状態の凡例
    main.appendChild(h('section', { class: 'card' }, h('h2', null, '状態の見かた'),
      [['confirmed', '出典と対象日の適用条件まで確認済み'], ['scheduled', '公式に予定として発表されている（対象日の実施とは別）'], ['unconfirmed', '情報が不足している・確認できていない'], ['changed', '変更・中止の情報を確認した'], ['expired', '有効期間を過ぎている']]
        .map(function (x) { return h('div', { class: 'notice-line small' }, HL.statusBadge(x[0]), x[1]); })));

    main.appendChild(h('h2', { class: 'section-title', text: '出典一覧（' + HL.data.sources.length + '件）' }));
    HL.data.sources.forEach(function (s) {
      var kv = h('dl', { class: 'kv' });
      function row(k, v) { kv.appendChild(h('dt', { text: k })); kv.appendChild(h('dd', null, v)); }
      row('情報の対象', HL.val(s.target));
      row('出典URL', HL.extLink(s.url, s.url, { official: s.official }));
      row('発行元', h('span', null, HL.val(s.publisher), s.official ? '' : h('span', { class: 'small muted', text: '（公式かどうか未確認）' })));
      row('公開日', HL.val(HL.fmtDate(s.publishedAt)));
      row('更新日', HL.val(HL.fmtDate(s.updatedAt)));
      row('アプリでの確認日', s.checkedAt ? HL.fmtDateTime(s.checkedAt) : h('span', null, HL.unknown('本文未確認'), s.searchedAt ? h('div', { class: 'small muted', text: HL.fmtDate(s.searchedAt) + ' に検索結果で概要を確認' }) : null));
      row('確認方法', HL.val(s.checkMethod));
      row('対象日への適用', h('span', null, HL.statusBadge(s.verificationStatus), ' ', HL.fmtDate(s.applicableDate) || ''));
      row('注意事項', HL.val(s.notes, 'なし'));
      main.appendChild(h('section', { class: 'card', id: 'src-' + s.id }, h('h3', { text: s.title }), kv));
    });

    // 未確認項目
    var un = [];
    var op = HL.data.opening;
    if (!op || op.status !== 'confirmed') un.push(['営業情報', '対象日の営業・営業時間']);
    HL.data.facilities.forEach(function (f) {
      var miss = [];
      if (HL.facilityStatus(f) !== 'confirmed') miss.push('当日の営業');
      if (!f.location || f.location.x == null) miss.push('位置');
      if (!f.operation || !f.operation.openingTime) miss.push('営業時間');
      if (!f.requirements || f.requirements.price == null) miss.push('料金');
      if (f.admission && f.admission.status !== 'confirmed') miss.push('整理券の受付条件');
      if (!f.admission && f.requirements && f.requirements.ticketRequired === 'unknown') miss.push('整理券の要否');
      if (miss.length) un.push([f.name, miss.join('・')]);
    });
    HL.data.shows.forEach(function (s) {
      if (HL.showDayStatus(s) !== 'confirmed') un.push([s.name, '対象日の開催・時刻']);
    });
    ['restaurant', 'shop', 'family', 'service'].forEach(function (c) {
      if (!HL.data.facilities.some(function (f) { return f.category === c; })) un.push([HL.cat(c).label, '施設名・位置・営業情報（未登録）']);
    });
    main.appendChild(h('h2', { class: 'section-title', text: '未確認の項目（' + un.length + '件）' }));
    main.appendChild(h('section', { class: 'card' }, un.map(function (u) { return h('div', { class: 'notice-line small' }, HL.unknown(''), h('div', null, h('b', { text: u[0] }), '：' + u[1])); })));

    // 端末の保存データ
    main.appendChild(h('h2', { class: 'section-title', text: 'この端末の保存データ' }));
    append(main, HL.storageWarning());
    main.appendChild(h('section', { class: 'card small' },
      h('p', { style: { margin: 0 }, text: '保存しているもの：行きたい施設・予定・訪問済み・メモ・「自分で確認した」チェック（この端末のブラウザ内のみ。個人情報や位置情報は保存・送信しません）。' }),
      h('div', { class: 'btn-row' }, h('button', { class: 'btn small danger', type: 'button', text: '保存データを初期化する', onclick: function () {
        if (!window.confirm('プラン・訪問済み・メモをすべて消去します。よろしいですか？')) return;
        HL.state = HL.storage.reset(); HL.persist(); HL.toast('保存データを初期化しました'); render();
      } }))));
  };
})();
