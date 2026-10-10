/* app.js — 初期化・JSON 読み込み・画面切り替え・共通 UI・初期化エラー表示
   画面は 4 つのタブ（リンク links.js／きょう today.js／マップ map.js／プラン planner.js）と、共通の詳細画面（detail.js）。
   最初の画面はリンク集。役に立つ公式ページへ迷わず行けることを基本にする。 */
window.HL = window.HL || {};

(function () {
  'use strict';

  var DATA_FILES = ['app-config', 'facilities', 'shows', 'sources', 'opening-info', 'park-info', 'links'];

  HL.data = { config: null, facilities: [], shows: [], sources: [], opening: null, park: null, links: null };
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
    { id: 'family', label: '子ども向け設備', icon: '🍼', color: '#D9A400' },
    { id: 'photo', label: 'フォトスポット', icon: '📸', color: '#C2558F' }
  ];
  HL.SHOW_CATEGORIES = { parade: 'パレード', show: 'ショー', greeting: 'グリーティング', event: 'イベント' };

  HL.STATUS = {
    confirmed: { label: '確認済み', icon: '✓' },
    scheduled: { label: '開催予定', icon: '◆' },
    reference: { label: '参考情報', icon: 'ⓘ' },
    day_of_check: { label: '当日要確認', icon: '⏱' },
    unconfirmed: { label: '未確認', icon: '？' },
    unverified: { label: '未確認', icon: '？' },
    changed: { label: '変更あり', icon: '！' },
    expired: { label: '期限切れ', icon: '×' }
  };

  HL.TICKET_NOTICE = '整理券の配布方法・受付条件は変更される場合があります。対象日の最新情報を公式案内で確認してください。';

  HL.SCREEN_TITLES = { links: 'リンク集', today: 'きょうの予定（参考）', map: 'マップ', plan: 'わたしのプラン', d: '詳細' };
  // 以前の URL（ブックマーク）は新しい画面へ読み替える
  var ALIAS = { home: 'links', info: 'links', sources: 'links', tickets: 'today', shows: 'today', list: 'map', facility: 'd', show: 'd' };

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

  /* ---------- 利用条件と子どもの年齢 ---------- */
  HL.restrictionLines = function (rq) {
    rq = rq || {};
    var out = [];
    if (rq.ageMin != null) out.push(rq.ageMin + '歳未満は利用不可');
    if (rq.guardianUnder != null) out.push(rq.guardianUnder + '歳未満は保護者同伴');
    if (rq.pregnancyNotAllowed) out.push('妊娠中の方は利用不可');
    if (rq.weightRestriction) out.push('体重：' + rq.weightRestriction);
    if (rq.heightRestriction) out.push('身長：' + rq.heightRestriction);
    if (rq.otherConditions) out.push(rq.otherConditions);
    return out;
  };
  HL.hasRestrictionData = function (f) {
    var rq = f.requirements || {};
    return f.category === 'attraction' && (rq.ageMin != null || rq.guardianUnder != null || rq.pregnancyNotAllowed != null || !!rq.note);
  };
  // 子どもの年齢から見た利用可否。公式の条件が不明なら「乗れる」とは判定しない
  HL.eligibility = function (f, age) {
    if (f.category !== 'attraction' || age == null || age === '') return null;
    var rq = f.requirements || {};
    if (!HL.hasRestrictionData(f)) return { level: 'unknown', text: age + '歳：利用条件は未確認' };
    if (rq.ageMin != null && age < rq.ageMin) return { level: 'ng', text: age + '歳：利用不可（' + rq.ageMin + '歳未満）' };
    if (rq.guardianUnder != null && age < rq.guardianUnder) return { level: 'guardian', text: age + '歳：保護者同伴が必要' };
    var extra = rq.weightRestriction || rq.heightRestriction || rq.otherConditions;
    return { level: 'ok', text: age + '歳：掲載の年齢条件に該当なし' + (extra ? '（ほかの条件あり）' : '') };
  };
  HL.childAges = function () { return ((HL.state.profile && HL.state.profile.childAges) || []).filter(function (a) { return a !== '' && a != null; }); };
  HL.eligibilityBadges = function (f) {
    return HL.childAges().map(function (age) {
      var e = HL.eligibility(f, age);
      if (!e) return null;
      var cls = { ng: 'st-changed', guardian: 'st-unconfirmed', ok: 'st-confirmed', unknown: 'plain' }[e.level];
      var ico = { ng: '✕ ', guardian: '👪 ', ok: '○ ', unknown: '？ ' }[e.level];
      return h('span', { class: 'badge ' + cls, text: ico + e.text });
    });
  };
  HL.rainSuspended = function (f) { return ((f.operation && f.operation.weatherSuspend) || []).indexOf('rain') >= 0; };
  HL.windSuspended = function (f) { return ((f.operation && f.operation.weatherSuspend) || []).indexOf('wind') >= 0; };
  HL.isOptionalTicket = function (o) { return !!(o.admission && o.admission.required === 'optional'); };

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
        s.url ? HL.extLink(s.url, s.title, { official: s.official }) : h('a', { class: 'inlink', href: '#links', text: s.title + '（アプリ外の資料）' }),
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

  // 施設・イベントを ID でまとめて引く（ID は両方で重ならない）
  HL.find = function (id) {
    var f = HL.facility(id);
    if (f) return { kind: 'facility', o: f };
    var s = HL.showById(id);
    return s ? { kind: 'show', o: s } : null;
  };
  HL.icon = function (x) {
    if (x.kind === 'facility') return HL.cat(x.o.category).icon;
    return { parade: '🎉', greeting: '🤝', event: '🔎' }[x.o.category] || '🎪';
  };

  // ★（プランに入れる）トグル
  HL.starButton = function (kind, id, opts) {
    opts = opts || {};
    var on = !!HL.planItem(kind, id);
    return h('button', { class: 'star' + (on ? ' on' : '') + (opts.big ? ' big' : ''), type: 'button', 'aria-pressed': String(on),
      'aria-label': on ? 'プランから外す' : 'プランに入れる', text: on ? '★' + (opts.big ? ' プランに入れた' : '') : '☆' + (opts.big ? ' プランに入れる' : ''),
      onclick: function (e) {
        e.preventDefault(); e.stopPropagation();
        if (HL.planItem(kind, id)) { HL.removeFromPlan(kind, id); HL.toast('プランから外しました'); }
        else { HL.addToPlan(kind, id); HL.toast('プランに入れました'); }
        render();
      } });
  };

  // 一覧の 1 行（施設・イベント共通）。タップで詳細へ
  HL.row = function (x, opts) {
    opts = opts || {};
    var o = x.o;
    var tags = [];
    if (HL.needsAdmission(o)) tags.push(h('span', { class: 'tag req', text: '🎫 ' + ((o.admission && o.admission.type) || '整理券') }));
    if (x.kind === 'facility') {
      if (HL.rainSuspended(o)) tags.push(h('span', { class: 'tag', text: '☔ 雨天運休' }));
      if (HL.windSuspended(o)) tags.push(h('span', { class: 'tag', text: '🌬 強風運休' }));
      HL.childAges().forEach(function (a) {
        var e = HL.eligibility(o, a);
        if (e && e.level === 'ng') tags.push(h('span', { class: 'tag ng', text: '✕ ' + a + '歳不可' }));
        else if (e && e.level === 'guardian') tags.push(h('span', { class: 'tag', text: '👪 ' + a + '歳は同伴' }));
      });
    }
    if (HL.isVisited(x.kind, o.id)) tags.push(h('span', { class: 'tag ok', text: '✔ 行った' }));
    return h('div', { class: 'row' + (opts.highlight ? ' highlight' : ''), id: opts.anchor ? 'row-' + o.id : null },
      h('a', { class: 'row-main', href: '#d/' + o.id },
        opts.time != null ? h('span', { class: 'row-time' + (opts.timeRef ? ' ref' : ''), text: opts.time }) : h('span', { class: 'row-ico', 'aria-hidden': 'true', text: HL.icon(x) }),
        h('span', { class: 'row-body' },
          h('span', { class: 'row-name', text: (opts.time != null ? HL.icon(x) + ' ' : '') + o.name }),
          opts.sub || (x.kind === 'facility' ? (o.area ? h('span', { class: 'row-sub', text: o.area }) : null) : null),
          tags.length ? h('span', { class: 'tags' }, tags) : null)),
      opts.extra || null,
      HL.starButton(x.kind, o.id));
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
    return { name: parts[0] || 'links', id: parts[1] || null, params: params };
  };
  HL.go = function (hash) { if (location.hash === hash) render(); else location.hash = hash; };

  function render() {
    var r = HL.parseHash();
    if (ALIAS[r.name]) r.name = ALIAS[r.name];
    var screen = HL.screens[r.name] ? r.name : 'links';
    var main = document.getElementById('main');
    main.textContent = '';
    document.getElementById('screen-title').textContent = HL.SCREEN_TITLES[screen] || '';
    document.title = (HL.SCREEN_TITLES[screen] || '') + '｜ハーモニーランド攻略ナビ';
    var tab = screen;
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
    // ふだんは出さず、オフラインのときだけ知らせる
    st.hidden = navigator.onLine;
    st.className = 'data-state offline';
    st.textContent = 'オフライン・保存済み情報';
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
        else if (n === 'park-info') HL.data.park = d;
        else if (n === 'links') HL.data.links = d;
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
})();
