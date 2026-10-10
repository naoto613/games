/* map.js — 「マップ」タブ：検索・しぼりこみ・園内の略図（拡大縮小と移動）・その下に施設の一覧
   位置は相対座標（0〜1）。位置が分からない施設（x/y が null）は地図に置かず、一覧にだけ出す。 */
(function () {
  'use strict';
  var h = HL.h;
  var MAP_IMAGE = './assets/map-base.svg';
  var MAP_RATIO = 0.674; // 画像の 縦/横（assets/map-base.svg の viewBox 1000×674）
  var MIN_S = 1, MAX_S = 4;

  // しぼりこみ（カテゴリをまとめて 5 つに）
  var GROUPS = [
    { id: 'all', label: 'すべて', test: function () { return true; } },
    { id: 'ride', label: '🎡 のりもの', test: function (f) { return f.category === 'attraction'; } },
    { id: 'chara', label: '🎪 ショー・キャラ', test: function (f) { return f.category === 'show' || f.category === 'greeting' || f.category === 'photo'; } },
    { id: 'food', label: '🍽️ 食べる・買う', test: function (f) { return f.category === 'restaurant' || f.category === 'shop'; } },
    { id: 'baby', label: '🍼 赤ちゃん・トイレ・サービス', test: function (f) { return f.category === 'family' || f.category === 'service'; } },
    { id: 'rain', label: '☔ 雨・風で運休', test: function (f) { return HL.rainSuspended(f) || HL.windSuspended(f); } },
    { id: 'kids', label: '👧 年齢でOK', test: function (f) {
      return f.category === 'attraction' && HL.childAges().every(function (a) { var e = HL.eligibility(f, a); return e && (e.level === 'ok' || e.level === 'guardian'); });
    } }
  ];
  // 画面をまたいで保つ表示状態
  var view = { g: 'all', q: '' };

  function hasPos(f) { return f.location && typeof f.location.x === 'number' && typeof f.location.y === 'number'; }
  function hasTimedShow(f) {
    return HL.data.shows.some(function (s) { return s.venue && s.venue.facilityId === f.id && HL.inPeriod(s); });
  }

  HL.screens.map = function (main, r) {
    var err = HL.dataError(['facilities']);
    if (err) main.appendChild(err);
    var focusId = r.params.focus || '';
    var focus = focusId ? HL.facility(focusId) : null;
    if (r.params.f) view.g = r.params.f;
    if (r.params.q != null) view.q = r.params.q;
    if (focus) { view.g = 'all'; view.q = ''; }

    /* --- 検索・しぼりこみ --- */
    var input = h('input', { class: 'search', type: 'search', placeholder: '🔎 名前でさがす（例：トイレ、ファンスタジオ）', 'aria-label': '施設をさがす', value: view.q, autocomplete: 'off' });
    var chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'しぼりこみ' });
    GROUPS.forEach(function (g) {
      if (g.id === 'kids' && !HL.childAges().length) return;
      chips.appendChild(h('button', { class: 'chip', type: 'button', 'aria-pressed': String(view.g === g.id), 'data-g': g.id, text: g.label,
        onclick: function () {
          view.g = g.id;
          Array.prototype.forEach.call(chips.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-g') === view.g)); });
          refresh();
        } }));
    });

    /* --- マップ --- */
    var viewport = h('div', { class: 'map-viewport', role: 'application', 'aria-label': '園内マップ。ドラッグで移動、ピンチやボタンで拡大縮小' });
    var stage = h('div', { class: 'map-stage' });
    var img = h('img', { src: MAP_IMAGE, alt: '園内の略図（独自に作図。エリアと施設のおおよその位置関係）', draggable: 'false' });
    var markerLayer = h('div', { style: { position: 'absolute', inset: '0' } });
    stage.appendChild(img); stage.appendChild(markerLayer);
    viewport.appendChild(stage);
    var popup = h('div', { class: 'map-popup', hidden: true });
    var msg = h('div', { class: 'map-overlay-msg', hidden: true, role: 'status', title: 'タップで閉じる', onclick: function () { msg.hidden = true; } });
    var tools = h('div', { class: 'map-tools' },
      h('button', { type: 'button', 'aria-label': '拡大', text: '＋', onclick: function () { zoomAt(view.s * 1.4); } }),
      h('button', { type: 'button', 'aria-label': '縮小', text: '－', onclick: function () { zoomAt(view.s / 1.4); } }),
      h('button', { type: 'button', 'aria-label': '表示をリセット', text: '⟲', onclick: function () { fit(); } }));
    var wrap = h('div', { class: 'map-wrap' }, viewport, tools, msg, popup);

    img.addEventListener('error', function () {
      wrap.replaceChildren(h('div', { class: 'card warn' }, 'マップ画像を読み込めませんでした。',
        h('div', { class: 'small', text: '下の一覧から探せます。' })));
    });

    var legend = h('details', { class: 'legend-fold' }, h('summary', { text: '地図の見かた' }),
      h('p', { class: 'small', text: '利用者提供の園内マップ画像から位置を読み取って独自に描いた略図です（縮尺・道は正確ではありません。元の画像は載せていません）。' }),
      h('p', { class: 'small', text: '点線のピン「推定」＝地図の番号から推定した位置。灰色の番号＝施設名が分からない番号。🎫 整理券・受付　⏰ ショー会場　☔ 雨天運休　🌬 強風時運休。' }));

    var listBox = h('div', { class: 'list' });
    var countLine = h('h2', { class: 'section-title' });

    main.appendChild(input);
    main.appendChild(chips);
    main.appendChild(wrap);
    main.appendChild(legend);
    main.appendChild(countLine);
    main.appendChild(listBox);

    /* --- 変換（パン・ズーム） --- */
    view.s = view.s || 1; view.tx = view.tx || 0; view.ty = view.ty || 0;
    function size() { var w = viewport.clientWidth || 320; return { w: w, h: w * MAP_RATIO, vw: w, vh: viewport.clientHeight || 300 }; }
    function clamp() {
      var z = size(), cw = z.w * view.s, ch = z.h * view.s;
      var minX = Math.min(0, z.vw - cw), minY = Math.min(0, z.vh - ch);
      var maxX = Math.max(0, (z.vw - cw) / 2), maxY = Math.max(0, (z.vh - ch) / 2);
      if (cw <= z.vw) view.tx = (z.vw - cw) / 2; else view.tx = Math.max(minX, Math.min(0, view.tx));
      if (ch <= z.vh) view.ty = (z.vh - ch) / 2; else view.ty = Math.max(minY, Math.min(0, view.ty));
      void maxX; void maxY;
    }
    function apply() {
      var z = size();
      stage.style.width = z.w + 'px'; stage.style.height = z.h + 'px';
      clamp();
      stage.style.transform = 'translate(' + view.tx + 'px,' + view.ty + 'px) scale(' + view.s + ')';
      stage.style.setProperty('--inv', String(1 / view.s));
    }
    function zoomAt(ns, cx, cy) {
      var z = size();
      ns = Math.max(MIN_S, Math.min(MAX_S, ns));
      if (cx == null) { cx = z.vw / 2; cy = z.vh / 2; }
      var px = (cx - view.tx) / view.s, py = (cy - view.ty) / view.s;
      view.s = ns; view.tx = cx - px * ns; view.ty = cy - py * ns;
      apply();
    }
    function fit() { view.s = 1; view.tx = 0; view.ty = 0; apply(); }
    function centerOn(f) {
      var z = size();
      view.s = Math.max(view.s, 2);
      view.tx = z.vw / 2 - f.location.x * z.w * view.s;
      view.ty = z.vh * 0.3 - f.location.y * z.h * view.s; // 下のポップアップに隠れないよう上寄せ
      apply();
    }
    HL.mapView = { zoomAt: zoomAt, fit: fit, view: view, apply: function () { if (document.body.contains(viewport)) apply(); } };

    // ポインター：1本指で移動、2本指でピンチ
    var pts = {}, last = null, moved = 0;
    viewport.addEventListener('pointerdown', function (e) {
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      moved = 0; last = null;
      viewport.classList.add('dragging');
      if (viewport.setPointerCapture && e.target === viewport) viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return;
      var prev = pts[e.pointerId];
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 1) {
        var dx = e.clientX - prev.x, dy = e.clientY - prev.y;
        moved += Math.abs(dx) + Math.abs(dy);
        view.tx += dx; view.ty += dy; apply();
      } else if (ids.length >= 2) {
        var a = pts[ids[0]], b = pts[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        var rect = viewport.getBoundingClientRect();
        var mx = (a.x + b.x) / 2 - rect.left, my = (a.y + b.y) / 2 - rect.top;
        if (last) { zoomAt(view.s * d / last.d, mx, my); view.tx += mx - last.mx; view.ty += my - last.my; apply(); }
        last = { d: d, mx: mx, my: my };
        moved += 10;
      }
    });
    function up(e) { delete pts[e.pointerId]; last = null; if (!Object.keys(pts).length) viewport.classList.remove('dragging'); }
    viewport.addEventListener('pointerup', up);
    viewport.addEventListener('pointercancel', up);
    viewport.addEventListener('wheel', function (e) {
      e.preventDefault();
      var rect = viewport.getBoundingClientRect();
      zoomAt(view.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX - rect.left, e.clientY - rect.top);
    }, { passive: false });
    if (!HL._mapResizeBound) {
      HL._mapResizeBound = true;
      window.addEventListener('resize', function () { if (HL.mapView) HL.mapView.apply(); });
    }

    /* --- マーカーとポップアップ --- */
    function visible(f) {
      var g = GROUPS.filter(function (x) { return x.id === view.g; })[0] || GROUPS[0];
      if (g.id === 'kids' && !HL.childAges().length) g = GROUPS[0];
      if (!g.test(f)) return false;
      if (view.q.trim()) {
        var q = HL.norm(view.q);
        return [f.name, f.area, f.description, HL.cat(f.category).label].concat(f.tags || []).some(function (t) { return t && HL.norm(t).indexOf(q) >= 0; });
      }
      return true;
    }
    function showPopup(f) {
      popup.replaceChildren(h('div', { class: 'card popup-card' },
        HL.row({ kind: 'facility', o: f }, { sub: h('span', { class: 'row-sub', text: (f.location.positionStatus === 'reference' ? '📍推定位置・' : '') + (f.area || '') }) }),
        h('button', { class: 'popup-close', type: 'button', 'aria-label': '閉じる', text: '×', onclick: function () { popup.hidden = true; select(null); } })));
      popup.hidden = false;
    }
    var selected = null;
    function select(id) {
      selected = id;
      Array.prototype.forEach.call(markerLayer.children, function (m) { m.classList.toggle('active', m.getAttribute('data-id') === id); });
    }
    function marker(f, pt) {
      var c = HL.cat(f.category), st = HL.facilityStatus(f);
      pt = pt || f.location;
      var est = pt.positionStatus === 'reference';
      var flags = [];
      if (est) flags.push('推定');
      if (pt.label) flags.push(pt.label);
      if (HL.needsAdmission(f)) flags.push('🎫');
      if (hasTimedShow(f)) flags.push('⏰');
      if (HL.rainSuspended(f)) flags.push('☔');
      if (HL.windSuspended(f)) flags.push('🌬');
      if (st === 'changed' || st === 'expired') flags.push('休止');
      var m = h('button', { class: 'map-marker' + (est ? ' est' : '') + (selected === f.id ? ' active' : ''), type: 'button', 'data-id': f.id,
        'aria-label': f.name + (pt.label ? '・' + pt.label : '') + '（' + c.label + (est ? '、推定位置' : '') + '、当日' + HL.STATUS[st].label + (HL.needsAdmission(f) ? '、整理券・受付が必要' : '') + '）',
        style: { left: (pt.x * 100) + '%', top: (pt.y * 100) + '%' },
        onclick: function (e) { if (moved > 8) { e.preventDefault(); return; } select(f.id); showPopup(f); } },
        h('span', { class: 'pin', style: { background: c.color } }, h('span', { 'aria-hidden': 'true', text: c.icon })),
        h('span', { class: 'flags', 'aria-hidden': 'true' }, flags.map(function (x) { return h('b', { text: x }); })));
      m.addEventListener('pointerdown', function (e) { e.stopPropagation(); moved = 0; });
      return m;
    }

    function refresh() {
      var placed = HL.data.facilities.filter(hasPos);
      var ms = [];
      placed.filter(visible).forEach(function (f) {
        ms.push(marker(f));
        (f.location.extraPoints || []).forEach(function (p) { ms.push(marker(f, p)); });
      });
      markerLayer.replaceChildren.apply(markerLayer, ms);
      var all = HL.data.facilities.filter(visible);
      countLine.textContent = '一覧（' + all.length + '件）';
      listBox.replaceChildren();
      if (!all.length) listBox.appendChild(h('p', { class: 'empty', text: '該当する施設はありません' }));
      all.forEach(function (f) {
        var pin = hasPos(f)
          ? h('button', { class: 'pin-btn', type: 'button', 'aria-label': f.name + 'を地図で見る', text: '📍', onclick: function () {
            centerOn(f); select(f.id); showPopup(f); wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } })
          : h('span', { class: 'pin-btn none', title: '地図の位置は未確認', text: '－' });
        listBox.appendChild(HL.row({ kind: 'facility', o: f }, { highlight: focus && focus.id === f.id, anchor: true, extra: pin }));
      });
      if (view.g === 'kids') listBox.appendChild(h('p', { class: 'small muted hint', text: '公式一覧の年齢条件に当てはまらないのりもの（保護者同伴を含む）。身長・体重・当日の運行は含みません。' }));
    }

    input.addEventListener('input', function () { view.q = input.value; refresh(); });

    refresh();
    requestAnimationFrame(function () {
      apply();
      if (focusId) {
        if (focus && hasPos(focus) && visible(focus)) { centerOn(focus); select(focus.id); showPopup(focus); }
        else {
          msg.hidden = false;
          msg.textContent = focus ? '「' + focus.name + '」の地図の位置は分かっていません。下の一覧で強調しています。' : 'この場所の位置は分かっていません。';
          var el = document.getElementById('row-' + focusId);
          if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
        }
      }
    });
  };
})();
