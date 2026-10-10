/*
 * ui-renderer.js: DOM の生成・更新、メッセージ表示、アニメーション開始
 * ゲームルールは持たない（状態を読んで描くだけ）。
 * 住人・アイテムの見た目は絵文字の仮素材。art / avatar / icon を差し替えればイラストに置換できる。
 */
(function (root) {
  'use strict';
  const OY = (root.OY = root.OY || {});

  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function createRenderer(stage, state) {
    const Rules = OY.Rules;
    const GS = OY.GameState;
    const charDef = {};
    stage.characters.forEach((c) => (charDef[c.id] = c));
    const itemDef = {};
    stage.items.forEach((i) => (itemDef[i.id] = i));
    const locDef = {};
    stage.locations.forEach((l) => (locDef[l.id] = l));

    const el = {
      screens: {
        title: $('sc-title'),
        intro: $('sc-intro'),
        game: $('sc-game'),
        clear: $('sc-clear')
      },
      town: $('town'),
      wrap: $('town-wrap'),
      layer: $('town-layer'),
      fx: $('fx'),
      tray: $('tray'),
      guide: $('guide'),
      msg: $('message'),
      card: $('event-card'),
      toast: $('toast')
    };
    const actorEls = {};
    const itemEls = {};
    const locEls = {};
    const trayEls = {};
    const bubbleTimers = {};
    let toastTimer = 0;
    let barAnim = null;
    let confirmResolve = null;
    let introPage = 0;
    let hintLevel = 0;

    /* ---------- 町の生成 ---------- */

    function box(o) {
      return `left:${o.x}%;top:${o.y}%;width:${o.w}%;height:${o.h}%`;
    }

    function decorInner(d) {
      switch (d.type) {
        case 'bunting': {
          const colors = ['#e85d4a', '#f6c445', '#4aa3df', '#6cc070', '#b07ad9'];
          let s = '<i class="bunting-line"></i>';
          for (let i = 0; i < 14; i++) s += `<b style="left:${3 + i * 7}%;background:${colors[i % colors.length]}"></b>`;
          return s;
        }
        case 'shop':
          return `<i class="shop-roof"></i><i class="shop-wall"><i class="shop-win"></i><i class="shop-win"></i></i><i class="shop-sign">${esc(d.label || '')}</i>`;
        case 'tree':
          return '<i class="tree-top"></i><i class="tree-trunk"></i>';
        case 'lamp':
          return '<i class="lamp-head"></i><i class="lamp-pole"></i>';
        case 'stand':
          return '<i class="stand-board"></i><i class="stand-leg"></i>';
        case 'table':
          return '<i class="table-top"></i>';
        case 'flowers':
          return '<span>🌷🌼🌷🌼</span>';
        default:
          return '';
      }
    }

    function locInner(l) {
      switch (l.art) {
        case 'bakery':
          return `<i class="bk-roof"></i><i class="bk-wall"><i class="bk-win"><span>🥖🍞</span></i><i class="bk-door"></i></i><i class="bk-awning"></i><i class="bk-sign">${esc(l.sign || l.name)}</i>`;
        case 'bench':
          return '<i class="bench-back"></i><i class="bench-seat"></i><i class="bench-leg l"></i><i class="bench-leg r"></i>';
        case 'square':
          return '<i class="sq-floor"></i><i class="sq-ring"></i><i class="sq-stage"></i>';
        default:
          return '';
      }
    }

    function buildTown() {
      let html = '';
      stage.decor.forEach((d) => {
        html += `<div class="deco deco-${d.type}" style="${box(d)}" aria-hidden="true">${decorInner(d)}</div>`;
      });
      stage.locations.forEach((l) => {
        html += `<button type="button" class="loc loc-${l.art}" data-loc="${l.id}" style="${box(l.zone)}" aria-label="場所：${esc(l.name)}">${locInner(l)}<span class="loc-name">${esc(l.name)}</span></button>`;
      });
      stage.items.forEach((it) => {
        html += `<button type="button" class="thing" data-item="${it.id}" style="left:${it.pos.x}%;top:${it.pos.y}%" aria-label="${esc(it.name)}"><span class="thing-icon">${it.icon}</span><span class="thing-name">${esc(it.name)}</span></button>`;
      });
      stage.characters.forEach((c) => {
        html += `<div class="actor" data-actor="${c.id}">
          <button type="button" class="actor-btn" data-char="${c.id}" aria-label="${esc(c.role + 'の' + c.name)}">
            <span class="actor-shadow" aria-hidden="true"></span>
            <span class="actor-body" aria-hidden="true">${c.avatar}</span>
            <span class="actor-mood" aria-hidden="true"></span>
            <span class="actor-prop" aria-hidden="true"></span>
          </button>
          <span class="actor-name"><b>${esc(c.name)}</b><small class="actor-state"></small></span>
          <div class="bubble" aria-hidden="true"></div>
        </div>`;
      });
      el.layer.innerHTML = html;
      el.layer.querySelectorAll('[data-actor]').forEach((n) => (actorEls[n.dataset.actor] = n));
      el.layer.querySelectorAll('[data-item]').forEach((n) => (itemEls[n.dataset.item] = n));
      el.layer.querySelectorAll('[data-loc]').forEach((n) => (locEls[n.dataset.loc] = n));

      el.tray.innerHTML = stage.items
        .map(
          (it) =>
            `<button type="button" class="tray-item" data-item="${it.id}" aria-pressed="false"><span class="tray-icon" aria-hidden="true">${it.icon}</span><span class="tray-name">${esc(it.name)}</span><span class="tray-status"></span></button>`
        )
        .join('');
      el.tray.querySelectorAll('[data-item]').forEach((n) => (trayEls[n.dataset.item] = n));
      $('hud-stage').textContent = stage.name;
    }

    /* ---------- レイアウト（画面サイズ・回転に追従） ---------- */

    function layout() {
      const w = el.wrap.clientWidth;
      const h = el.wrap.clientHeight;
      if (!w || !h) return;
      const ratio = 3 / 4; // 幅:高さ
      let tw = w;
      let th = w / ratio;
      if (th > h) {
        th = h;
        tw = h * ratio;
      }
      el.town.style.width = Math.floor(tw) + 'px';
      el.town.style.height = Math.floor(th) + 'px';
      el.town.classList.toggle('is-compact', tw < 340);
      el.town.style.setProperty('--u', (tw / 100).toFixed(3) + 'px');
      document.documentElement.classList.toggle('is-short', window.innerHeight < 620);
    }

    /* ---------- 状態の描画 ---------- */

    function showScreen(name) {
      Object.entries(el.screens).forEach(([k, n]) => n.classList.toggle('is-active', k === name));
    }

    function render() {
      const base = GS.baseScreen(state);
      const screenName = { title: 'title', intro: 'intro', playing: 'game', resolving: 'game', cleared: 'clear' }[base] || 'title';
      showScreen(screenName);
      $('ov-pause').hidden = state.screen !== 'paused';
      document.body.classList.toggle('is-busy', base === 'resolving');
      if (screenName !== 'game') return;

      const selected = state.selectedItemId;
      const targets = selected ? Rules.targetsForItem(stage, state, selected).all : [];

      stage.characters.forEach((def) => {
        const c = state.characters[def.id];
        const n = actorEls[def.id];
        const slot = def.slots[c.locationId] || { x: 50, y: 50 };
        n.style.left = slot.x + '%';
        n.style.top = slot.y + '%';
        [...n.classList].forEach((k) => k.startsWith('st-') && n.classList.remove(k));
        n.classList.add('st-' + c.state);
        const st = def.states[c.state] || {};
        n.querySelector('.actor-mood').textContent = st.mood || '';
        n.querySelector('.actor-state').textContent = st.label || '';
        n.querySelector('.actor-prop').textContent = propFor(def.id);
        n.classList.toggle('is-target', targets.includes(def.id));
        n.classList.toggle('is-selected', state.selectedTargetId === def.id);
        n.querySelector('.actor-btn').setAttribute(
          'aria-label',
          `${def.role}の${def.name}（${st.label || ''}）` + (targets.includes(def.id) ? '：アイテムを使える' : '')
        );
      });

      stage.items.forEach((def) => {
        const it = state.items[def.id];
        const n = itemEls[def.id];
        n.hidden = it.used;
        n.classList.toggle('is-selected', selected === def.id);
        const t = trayEls[def.id];
        t.disabled = it.used || state.screen !== 'playing';
        t.classList.toggle('is-used', it.used);
        t.classList.toggle('is-selected', selected === def.id);
        t.setAttribute('aria-pressed', String(selected === def.id));
        t.querySelector('.tray-status').textContent = it.used
          ? it.holderId
            ? state.characters[it.holderId].name + 'の手に'
            : '使った'
          : selected === def.id
          ? '選択中'
          : '';
      });

      stage.locations.forEach((def) => {
        const n = locEls[def.id];
        n.classList.toggle('is-target', targets.includes(def.id));
        n.classList.toggle('is-selected', state.selectedTargetId === def.id);
      });

      el.town.classList.toggle('has-selection', !!selected);
      const done = Rules.objectives(stage, state);
      $('goal-count').textContent = `${done.filter((o) => o.done).length}/${done.length}`;
      el.guide.innerHTML = guideText();
    }

    function propFor(id) {
      if (charDef[id].prop) return charDef[id].prop; // 常に持っている物（ネネのバイオリンなど）
      const holding = Object.values(state.items).find((it) => it.holderId === id);
      return holding ? holding.icon : '';
    }

    function guideText() {
      if (state.screen === 'resolving') return '👀 住人たちのようすを見守ろう';
      if (state.selectedItemId) {
        const it = itemDef[state.selectedItemId];
        return `${it.icon} <b>${esc(it.name)}</b>を、光っている住人か場所に使ってみよう（もう一度タップで解除）`;
      }
      const h = Rules.currentHint(stage, state);
      if (!h) return '';
      if ((state.stats.missStreak || 0) >= 3) return '💡 ' + esc(h.direct);
      return '🔎 ' + esc(h.soft);
    }

    /* ---------- メッセージ・吹き出し ---------- */

    function setMessage({ icon, title, sub, text }) {
      $('msg-icon').textContent = icon || '👀';
      $('msg-title').textContent = title || '';
      $('msg-sub').textContent = sub || '';
      $('msg-text').textContent = text || '';
      el.msg.classList.remove('flash');
      void el.msg.offsetWidth;
      el.msg.classList.add('flash');
    }

    function showBubble(charId, text, ms) {
      const n = actorEls[charId];
      if (!n) return;
      const b = n.querySelector('.bubble');
      b.textContent = text;
      b.classList.add('is-show');
      // 吹き出しが町の端からはみ出さないよう左右に寄せる
      const x = parseFloat(n.style.left) || 50;
      b.classList.toggle('to-left', x > 66);
      b.classList.toggle('to-right', x < 34);
      clearTimeout(bubbleTimers[charId]);
      bubbleTimers[charId] = setTimeout(() => b.classList.remove('is-show'), ms || 3200);
    }

    function hideBubbles() {
      Object.values(actorEls).forEach((n) => n.querySelector('.bubble').classList.remove('is-show'));
    }

    function pulse(id) {
      const n = actorEls[id] || locEls[id] || itemEls[id];
      if (!n) return;
      n.classList.remove('pulse');
      void n.offsetWidth;
      n.classList.add('pulse');
    }

    function describeCharacter(id) {
      const def = charDef[id];
      const c = state.characters[id];
      const st = def.states[c.state];
      setMessage({
        icon: def.avatar,
        title: `${def.name}（${def.role}）`,
        sub: `${st.mood} ${st.label}`,
        text: `${st.observe}　目的：${def.goal}。`
      });
      const lines = st.lines || [];
      const n = (describeCharacter.count[id + c.state] = (describeCharacter.count[id + c.state] || 0) + 1);
      if (lines.length) showBubble(id, lines[(n - 1) % lines.length]);
      pulse(id);
    }
    describeCharacter.count = {};

    function describeLocation(id) {
      const def = locDef[id];
      const here = Object.values(state.characters)
        .filter((c) => c.locationId === id)
        .map((c) => c.name);
      setMessage({
        icon: { bakery: '🏠', bench: '🪑', square: '⛲' }[def.art] || '📍',
        title: def.name,
        sub: here.length ? 'いる人：' + here.join('・') : 'だれもいない',
        text: def.description
      });
    }

    function describeItem(id) {
      const def = itemDef[id];
      setMessage({ icon: def.icon, title: def.name, sub: '選択中', text: def.description + ' 使いたい相手をタップしよう。' });
    }

    function deselectMessage() {
      setMessage({ icon: '👀', title: '横丁のようす', sub: '', text: '選択を解除した。住人や場所をタップして観察しよう。' });
    }

    function showReaction({ reaction, text, targetId, itemId, repeated, isNew }) {
      const it = itemDef[itemId];
      const kind = Rules.targetKind(stage, targetId);
      const name = kind === 'character' ? charDef[targetId].name : locDef[targetId].name;
      setMessage({
        icon: it.icon,
        title: `${it.name} → ${name}`,
        sub: repeated ? '同じ反応だ' : '変化なし',
        text: repeated ? text + '（別のきっかけを試してみよう）' : text
      });
      if (kind === 'character') {
        // 「マル「……」」のようなセリフはカッコの中だけを吹き出しに
        const m = text.match(/「(.+)」/);
        showBubble(targetId, m ? m[1] : '……？', 2600);
      }
      pulse(targetId);
      if (isNew) toast(`📖 新しい反応「${reaction.title}」を見つけた`);
    }

    /* ---------- イベントカード（SC-04） ---------- */

    function showEventCard(ev) {
      const sp = ev.speaker ? charDef[ev.speaker] : null;
      $('event-icon').textContent = sp ? sp.avatar : '🎉';
      $('event-msg').textContent = ev.message;
      $('event-line').textContent = sp && ev.line ? `${sp.name}「${ev.line}」` : '';
      el.card.hidden = false;
      el.card.classList.toggle('is-final', !!ev.final);
      el.card.classList.remove('in');
      void el.card.offsetWidth;
      el.card.classList.add('in');
      const bar = $('event-bar');
      if (barAnim) barAnim.cancel();
      if (bar.animate) {
        barAnim = bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 2600, easing: 'linear', fill: 'forwards' });
        if (state.screen === 'paused') barAnim.pause();
      }
      setMessage({ icon: sp ? sp.avatar : '🎉', title: 'できごと', sub: '', text: ev.message + (ev.line && sp ? `　${sp.name}「${ev.line}」` : '') });
      hideBubbles(); // セリフはカードに出すので、吹き出しは重ねない
      const ids = new Set();
      (ev.effects || []).forEach((e) => {
        if (e.characterId) ids.add(e.characterId);
        if (e.holderId) ids.add(e.holderId);
      });
      ids.forEach(pulse);
      if (ev.effects.some((e) => e.type === 'move_character')) {
        ev.effects.filter((e) => e.type === 'move_character').forEach((e) => trail(e.characterId));
      }
    }

    function hideEventCard() {
      el.card.hidden = true;
    }

    function setPausedVisual(paused) {
      if (barAnim) paused ? barAnim.pause() : barAnim.play();
      document.body.classList.toggle('is-paused', paused);
    }

    function trail(charId) {
      const n = actorEls[charId];
      if (!n) return;
      n.classList.add('is-moving');
      setTimeout(() => n.classList.remove('is-moving'), 650);
    }

    /* ---------- 演出 ---------- */

    function celebrate() {
      const marks = ['♪', '♫', '🎈', '🥐', '✨', '♪', '🎉'];
      let html = '';
      for (let i = 0; i < 26; i++) {
        const x = (i * 37) % 100;
        const d = (i % 7) * 0.12;
        html += `<span class="fx-bit" style="left:${x}%;animation-delay:${d}s">${marks[i % marks.length]}</span>`;
      }
      el.fx.innerHTML = html;
      el.town.classList.add('is-concert');
      setTimeout(() => (el.fx.innerHTML = ''), 3200);
    }

    function toast(text, ms) {
      el.toast.textContent = text;
      el.toast.hidden = false;
      el.toast.classList.remove('in');
      void el.toast.offsetWidth;
      el.toast.classList.add('in');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => (el.toast.hidden = true), ms || 2400);
    }

    function warn(text) {
      toast('⚠ ' + text, 4000);
    }

    function afterResolve() {
      const h = Rules.currentHint(stage, state);
      if (h) {
        $('msg-sub').textContent = '';
      }
    }

    /* ---------- 結果画面 ---------- */

    function showClear(sum) {
      const ending = stage.ending;
      $('clear-story').textContent = ending.base;
      $('clear-route').textContent = (sum.route && ending.routes[sum.route]) || '';
      $('clear-stats').innerHTML =
        `<div><dt>介入した回数</dt><dd>${sum.interventions}回</dd></div>` +
        `<div><dt>空振り</dt><dd>${sum.reactions}回</dd></div>` +
        `<div><dt>かかった時間</dt><dd>${Math.floor(sum.seconds / 60)}分${sum.seconds % 60}秒</dd></div>`;
      $('clear-found').textContent = `${sum.foundCount} / ${sum.total}`;
      $('clear-list').innerHTML = sum.discoveries
        .map((d) => `<li class="${d.found ? 'is-found' : ''}">${d.found ? (d.type === 'event' ? '⭐ ' : '📖 ') + esc(d.title) : '？？？'}</li>`)
        .join('');
      el.town.classList.remove('is-concert');
      render();
      const card = el.screens.clear.querySelector('.clear-card');
      if (card) card.scrollTop = 0;
    }

    /* ---------- 導入 ---------- */

    function renderIntro(page) {
      introPage = page;
      const p = stage.intro[page];
      $('intro-title').textContent = p.title;
      $('intro-body').innerHTML = p.body.map((t) => `<p>${esc(t)}</p>`).join('');
      $('intro-dots').innerHTML = stage.intro.map((_, i) => `<i class="${i === page ? 'on' : ''}"></i>`).join('');
      $('intro-next').textContent = page >= stage.intro.length - 1 ? 'あそぶ！' : 'つぎへ';
    }

    /* ---------- オーバーレイ ---------- */

    function openGoal() {
      const list = Rules.objectives(stage, state);
      $('goal-list').innerHTML = list
        .map((o) => `<li class="${o.done ? 'is-done' : ''}"><span class="goal-mark">${o.done ? '✔' : '○'}</span>${esc(o.text)}${o.done ? '<span class="sr">（達成）</span>' : ''}</li>`)
        .join('');
      hintLevel = 0;
      renderHint();
      $('ov-goal').hidden = false;
    }

    function renderHint() {
      const h = Rules.currentHint(stage, state);
      const btn = $('btn-more-hint');
      if (!h) {
        $('goal-hint').innerHTML = state.screen === 'resolving' ? '👀 いまは連鎖のとちゅう。見守ろう。' : '';
        btn.hidden = true;
        return;
      }
      $('goal-hint').innerHTML = '🔎 ' + esc(h.soft) + (hintLevel > 0 ? '<br><strong>💡 ' + esc(h.direct) + '</strong>' : '');
      btn.hidden = hintLevel > 0;
    }

    function moreHint() {
      hintLevel = 1;
      renderHint();
    }

    function closeGoal() {
      $('ov-goal').hidden = true;
    }

    function confirm(text) {
      $('confirm-text').textContent = text;
      $('ov-confirm').hidden = false;
      return new Promise((resolve) => (confirmResolve = resolve));
    }

    function answerConfirm(yes) {
      $('ov-confirm').hidden = true;
      const r = confirmResolve;
      confirmResolve = null;
      if (r) r(yes);
    }

    function showError(text) {
      $('error-text').textContent = text || 'ゲームの処理中にエラーが発生しました。';
      $('ov-error').hidden = false;
    }

    function hideError() {
      $('ov-error').hidden = true;
    }

    function toggleMessage() {
      const collapsed = el.msg.classList.toggle('is-collapsed');
      const b = el.msg.querySelector('.msg-toggle');
      b.textContent = collapsed ? '▴' : '▾';
      b.setAttribute('aria-expanded', String(!collapsed));
      b.setAttribute('aria-label', collapsed ? 'メッセージを開く' : 'メッセージを折りたたむ');
      requestAnimationFrame(layout);
    }

    function resetVisuals() {
      hideEventCard();
      hideBubbles();
      el.fx.innerHTML = '';
      el.town.classList.remove('is-concert');
      closeGoal();
      describeCharacter.count = {};
      setMessage({ icon: '👀', title: '横丁のようす', sub: '', text: '住人や場所をタップして、ようすを観察してみよう。' });
    }

    /** 何もしていないときの、住人のひとりごと（順番に） */
    let chatterIndex = 0;
    function chatter() {
      if (state.screen !== 'playing' || state.selectedItemId) return;
      const def = stage.characters[chatterIndex++ % stage.characters.length];
      const c = state.characters[def.id];
      const lines = def.states[c.state].lines || [];
      if (lines.length) showBubble(def.id, lines[Math.floor(chatterIndex / stage.characters.length) % lines.length], 2800);
    }

    buildTown();

    return {
      el,
      render,
      layout,
      renderIntro,
      introPage: () => introPage,
      setMessage,
      describeCharacter,
      describeLocation,
      describeItem,
      deselectMessage,
      showReaction,
      showEventCard,
      hideEventCard,
      setPausedVisual,
      celebrate,
      toast,
      warn,
      afterResolve,
      showClear,
      openGoal,
      moreHint,
      closeGoal,
      confirm,
      answerConfirm,
      showError,
      hideError,
      toggleMessage,
      resetVisuals,
      chatter
    };
  }

  OY.createRenderer = createRenderer;
})(typeof window !== 'undefined' ? window : globalThis);
