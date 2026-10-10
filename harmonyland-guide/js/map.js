/* map.js — マップ（模式図）表示・施設マーカー・カテゴリフィルター・選択と強調・拡大縮小と移動
   位置は相対座標（0〜1）。位置が確認できない施設（x/y が null）はマップに置かず、下の一覧から詳細へ進める。 */
(function () {
  'use strict';
  var h = HL.h;
  var MAP_IMAGE = './assets/map-base.svg';
  var MAP_RATIO = 0.674; // 画像の 縦/横（assets/map-base.svg の viewBox 1000×674）
  var MIN_S = 1, MAX_S = 4;

  // 画面をまたいで保つ表示状態
  var view = { hidden: {}, q: '' };

  function hasPos(f) { return f.location && typeof f.location.x === 'number' && typeof f.location.y === 'number'; }
  function hasTimedShow(f) {
    return HL.data.shows.some(function (s) { return s.venue && s.venue.facilityId === f.id && HL.inPeriod(s); });
  }

  HL.screens.map = function (main, r) {
    var err = HL.dataError(['facilities']);
    if (err) main.appendChild(err);
    var focusId = r.params.focus || '';
    var focus = focusId ? HL.facility(focusId) : null;

    /* --- 検索・カテゴリ --- */
    var input = h('input', { class: 'search', type: 'search', placeholder: '施設名で検索', 'aria-label': 'マップの施設を検索', value: view.q, autocomplete: 'off' });
    var chips = h('div', { class: 'chips', role: 'group', 'aria-label': '表示するカテゴリ' });
    HL.CATEGORIES.forEach(function (c) {
      var n = HL.data.facilities.filter(function (f) { return f.category === c.id; }).length;
      chips.appendChild(h('button', { class: 'chip', type: 'button', 'aria-pressed': String(!view.hidden[c.id]), 'data-c': c.id,
        style: { borderColor: view.hidden[c.id] ? '' : c.color },
        text: c.icon + ' ' + c.label + '（' + n + '）',
        onclick: function (e) {
          view.hidden[c.id] = !view.hidden[c.id];
          e.currentTarget.setAttribute('aria-pressed', String(!view.hidden[c.id]));
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
        h('div', { class: 'btn-row' }, h('a', { class: 'btn', href: '#list', text: '施設一覧から探す' }))));
    });

    var legend = h('div', { class: 'legend' },
      h('span', null, '🎫 整理券・受付'), h('span', null, '⏰ ショー会場'), h('span', null, '☔ 雨天運休'), h('span', null, '🌬 強風時運休'),
      h('span', null, '推定 = 番号からの推定位置（点線）'), h('span', null, '灰色の番号 = 施設名と未対応'), h('span', null, '休止 = 休止・中止'));
    var quickFind = h('div', { class: 'chips', 'aria-label': 'すぐ探す' },
      h('a', { class: 'chip', href: '#list?f=family', text: '🚻 トイレ・授乳室' }),
      h('a', { class: 'chip', href: '#info', text: 'ℹ️ 貸し出し・迷子' }),
      h('a', { class: 'chip', href: '#tickets', text: '🎫 整理券の受付場所' }),
      h('a', { class: 'chip', href: '#list?f=rain', text: '☔ 雨天運休' }));

    var listBox = h('div');

    main.appendChild(input);
    main.appendChild(chips);
    main.appendChild(wrap);
    main.appendChild(legend);
    main.appendChild(quickFind);
    var src = HL.source('source-digital-map');
    main.appendChild(h('div', { class: 'card note small' },
      'このマップは、利用者提供の園内マップ画像からエリアと施設のおおよその位置を読み取って独自に作図した略図です（元の画像は掲載していません）。地図上に名前が書かれていた施設は実線、番号と公式一覧の順番から推定した施設は点線の「推定」で表示します。トイレ・授乳室など位置が分からない施設は下の一覧から探せます。現在地からの経路案内には対応していません。',
      src ? HL.extLink(src.url, '園内の位置は外部のデジタルマップで確認（公式提供かは未確認）', { block: true, official: false }) : null));
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
      if (view.hidden[f.category]) return false;
      if (view.q.trim() && HL.norm(f.name).indexOf(HL.norm(view.q)) < 0 && HL.norm(f.area || '').indexOf(HL.norm(view.q)) < 0) return false;
      return true;
    }
    function showPopup(f) {
      var c = HL.cat(f.category), st = HL.facilityStatus(f);
      popup.replaceChildren(h('div', { class: 'card' },
        h('h3', { text: c.icon + ' ' + f.name }),
        h('div', { class: 'badges' }, HL.statusBadge(st, '当日：' + HL.STATUS[st].label),
          f.location.positionStatus === 'reference' ? h('span', { class: 'badge st-unconfirmed', text: '📍 推定位置' }) : null,
          HL.needsAdmission(f) ? h('span', { class: 'badge req', text: '🎫 整理券・受付が必要' }) : null,
          HL.rainSuspended(f) ? h('span', { class: 'badge st-unconfirmed', text: '☔ 雨天運休' }) : null,
          HL.windSuspended(f) ? h('span', { class: 'badge st-unconfirmed', text: '🌬 強風時運休' }) : null,
          HL.eligibilityBadges(f)),
        h('p', { class: 'small', style: { margin: '4px 0' }, text: f.description || '' }),
        h('div', { class: 'btn-row' }, h('a', { class: 'btn small', href: '#facility/' + f.id, text: '詳細を見る' }),
          h('button', { class: 'btn small ghost', type: 'button', text: '閉じる', onclick: function () { popup.hidden = true; select(null); } }))));
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
      var unplaced = HL.data.facilities.filter(function (f) { return !hasPos(f) && visible(f); });

      if (!placed.length) {
        msg.hidden = false;
        msg.textContent = '位置が確認できた施設はまだありません。施設は下の一覧から探せます。';
      } else msg.hidden = true;

      listBox.replaceChildren(
        h('h2', { class: 'section-title', text: '位置未確認の施設（' + unplaced.length + '件）' }),
        h('p', { class: 'small muted', style: { margin: '-4px 4px 8px' }, text: '位置が確認できないため、マップには表示していません。詳細は各施設から確認できます。' }));
      if (!unplaced.length) listBox.appendChild(h('p', { class: 'empty', text: '該当する施設はありません' }));
      unplaced.forEach(function (f) { listBox.appendChild(HL.facilityCard(f, { highlight: focus && focus.id === f.id, anchor: true })); });
    }

    input.addEventListener('input', function () { view.q = input.value; refresh(); });

    refresh();
    requestAnimationFrame(function () {
      apply();
      if (focusId) {
        if (focus && hasPos(focus) && visible(focus)) { centerOn(focus); select(focus.id); showPopup(focus); }
        else {
          msg.hidden = false;
          msg.textContent = focus ? '「' + focus.name + '」の位置は未確認のため、マップに表示できません。下の一覧で強調しています。' : 'この場所の位置は未確認です。';
          var el = document.getElementById('fac-' + focusId);
          if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
        }
      }
    });
  };
})();
