/*
 * ui-renderer.js: DOM の生成・更新、メッセージ表示、アニメーション開始
 * ゲームルールは持たない（状態を読んで描くだけ）。
 * 町・住人・アイテムの絵は art.js の SVG。タップ判定は絵より少し広い透明ボタン／多角形で取る。
 */
(function (root) {
  'use strict';
  const OY = (root.OY = root.OY || {});

  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const MOVE_MS = 1100; // 住人が歩く時間
  const PLAZA = { gx: 7.2, gy: 7.2 };
  // アイテムのタップ位置（足元からのずれ、SVG の単位）
  const ITEM_HIT = { 'IT-01': { dx: -12, dy: -66, r: 26 }, 'IT-02': { dx: 0, dy: -12, r: 24 }, 'IT-03': { dx: 0, dy: -32, r: 24 } };
  // 住人の背の高さ（吹き出し・タップ領域の目安）
  const CHAR_H = { 'CH-01': 98, 'CH-02': 72, 'CH-03': 86 };
  // 演奏会に集まってくる見物人（見た目だけ。ゲームの状態には関わらない）
  const EXTRAS = [
    { id: 'master', from: { gx: 7.8, gy: 3.2 }, to: { gx: 5.4, gy: 5.6 }, delay: 0 },
    { id: 'granny', from: { gx: 11.8, gy: 6.0 }, to: { gx: 11.0, gy: 8.0 }, delay: 350 },
    { id: 'cat', from: { gx: 4.9, gy: 11.2 }, to: { gx: 8.2, gy: 9.6 }, delay: 650 }
  ];

  function createRenderer(stage, state) {
    const Rules = OY.Rules;
    const GS = OY.GameState;
    const Art = OY.Art;
    const VB = Art.VB;
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
    const actorEls = {}; // HTML（タップ・名札・吹き出し）
    const charSpr = {}; // SVG の住人
    const itemSpr = {};
    const itemEls = {};
    const locEls = {};
    const locTags = {};
    const trayEls = {};
    const bubbleTimers = {};
    const drawn = {}; // 住人ごとの描画済み状態
    const lastLoc = {};
    let standSpr = null;
    const facingOverride = {}; // 何かに気づいて振り向いた向き（歩くまで続く）
    const extraSpr = {};
    let extrasShown = false;
    let standSheet = null;
    let spritesG = null;
    let toastTimer = 0;
    let barAnim = null;
    let confirmResolve = null;
    let introPage = 0;
    let hintLevel = 0;

    const pctX = (sx) => ((sx - VB.x) / VB.w) * 100;
    const pctY = (sy) => ((sy - VB.y) / VB.h) * 100;
    const r1 = (n) => Math.round(n * 10) / 10;

    /* ---------- 町の生成 ---------- */

    function buildTown() {
      const NS = 'http://www.w3.org/2000/svg';
      let sprites = '';
      Art.decorSprites().forEach((d, i) => {
        if (d.key === 'stand') {
          sprites += `<g class="spr spr-stand" data-depth="${d.gx + d.gy}" data-gx="${d.gx}" id="spr-stand"></g>`;
        } else {
          sprites += `<g class="spr" data-depth="${d.gx + d.gy}" data-gx="${d.gx}">${d.svg}</g>`;
        }
      });
      stage.items.forEach((it) => {
        sprites += `<g class="spr spr-item" data-spr="${it.id}" data-depth="${it.pos.gx + it.pos.gy}" data-gx="${it.pos.gx}"></g>`;
      });
      stage.characters.forEach((c) => {
        sprites += `<g class="spr spr-char" data-spr="${c.id}"><ellipse class="ring" cx="0" cy="0" rx="22" ry="9"/><g class="spr-face"><g class="spr-in"></g></g></g>`;
      });
      EXTRAS.forEach((x) => {
        sprites += `<g class="spr spr-extra" data-extra="${x.id}" style="display:none"><g class="spr-face"><g class="spr-in">${Art.extraSVG(x.id)}</g></g></g>`;
      });
      let hits = '';
      stage.locations.forEach((l) => {
        const h = Art.locationHit(l.art);
        const a = `class="loc-hit" data-loc="${l.id}" role="button" tabindex="0" aria-label="場所：${esc(l.name)}"`;
        hits += h.type === 'poly' ? `<polygon ${a} points="${h.points}"/>` : `<ellipse ${a} cx="${h.cx}" cy="${h.cy}" rx="${h.rx}" ry="${h.ry}"/>`;
      });
      el.layer.innerHTML =
        `<svg class="town-svg" id="town-svg" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" xmlns="${NS}" aria-hidden="false">` +
        Art.defs +
        `<g class="scene-bg" aria-hidden="true">${Art.sceneBackgroundSVG({ noSky: true })}</g>` +
        `<g class="hits">${hits}</g>` +
        `<g class="sprites" id="sprites" aria-hidden="true">${sprites}</g>` +
        `</svg><div class="town-ov" id="town-overlay"></div>`;
      spritesG = $('sprites');
      spritesG.querySelectorAll('[data-extra]').forEach((n) => (extraSpr[n.dataset.extra] = n));
      // 町の上を流れる雲
      if (!el.wrap.querySelector('.sky-clouds')) {
        const sk = document.createElement('div');
        sk.className = 'sky-clouds';
        sk.setAttribute('aria-hidden', 'true');
        sk.innerHTML = `<i style="top:4%;animation-duration:70s;animation-delay:-20s">${Art.cloudSVG(110)}</i><i style="top:14%;animation-duration:95s;animation-delay:-60s">${Art.cloudSVG(80)}</i><i style="top:26%;animation-duration:80s;animation-delay:-5s">${Art.cloudSVG(60)}</i>`;
        el.wrap.insertBefore(sk, el.wrap.firstChild);
      }
      standSpr = $('spr-stand');
      spritesG.querySelectorAll('[data-spr]').forEach((n) => {
        if (n.classList.contains('spr-item')) itemSpr[n.dataset.spr] = n;
        else charSpr[n.dataset.spr] = n;
      });
      el.layer.querySelectorAll('[data-loc]').forEach((n) => (locEls[n.dataset.loc] = n));

      // アイテムの絵
      stage.items.forEach((it) => {
        const [x, y] = Art.P(it.pos.gx, it.pos.gy);
        const n = itemSpr[it.id];
        n.setAttribute('transform', `translate(${r1(x)} ${r1(y)})`);
        n.innerHTML = `<ellipse class="ring" cx="0" cy="0" rx="18" ry="7"/><g class="spr-in">${Art.itemSceneSVG(it.id)}</g>`;
      });

      // HTML の重ね（タップ領域・名札・吹き出し）
      let ov = '';
      stage.locations.forEach((l) => {
        const h = Art.locationHit(l.art);
        let cx, cy;
        if (h.type === 'ellipse') {
          cx = h.cx;
          cy = h.cy + h.ry * 0.62;
        } else {
          const ps = h.points.split(' ').map((p) => p.split(',').map(Number));
          cx = ps.reduce((a, p) => a + p[0], 0) / ps.length;
          cy = Math.max(...ps.map((p) => p[1])) - 8;
        }
        ov += `<span class="loc-tag" data-loctag="${l.id}" style="left:${pctX(cx)}%;top:${pctY(cy)}%">${esc(l.name)}</span>`;
      });
      stage.items.forEach((it) => {
        const [x, y] = Art.P(it.pos.gx, it.pos.gy);
        const o = ITEM_HIT[it.id];
        ov += `<button type="button" class="thing" data-item="${it.id}" style="left:${pctX(x + o.dx)}%;top:${pctY(y + o.dy)}%;--r:${o.r}" aria-label="${esc(it.name)}"><span class="thing-name">${esc(it.name)}</span></button>`;
      });
      stage.characters.forEach((c) => {
        ov += `<div class="actor" data-actor="${c.id}" style="--h:${CHAR_H[c.id]}">
          <button type="button" class="actor-btn" data-char="${c.id}" aria-label="${esc(c.role + 'の' + c.name)}"></button>
          <span class="actor-name">${esc(c.name)}</span>
          <div class="bubble" aria-hidden="true"></div>
        </div>`;
      });
      $('town-overlay').innerHTML = ov;
      $('town-overlay')
        .querySelectorAll('[data-actor]')
        .forEach((n) => (actorEls[n.dataset.actor] = n));
      $('town-overlay')
        .querySelectorAll('.thing')
        .forEach((n) => (itemEls[n.dataset.item] = n));
      $('town-overlay')
        .querySelectorAll('[data-loctag]')
        .forEach((n) => (locTags[n.dataset.loctag] = n));

      el.tray.innerHTML = stage.items
        .map(
          (it) =>
            `<button type="button" class="tray-item" data-item="${it.id}" aria-pressed="false"><span class="tray-icon">${Art.itemIconSVG(it.id)}</span><span class="tray-text"><span class="tray-name">${esc(it.name)}</span><span class="tray-status"></span></span></button>`
        )
        .join('');
      el.tray.querySelectorAll('[data-item]').forEach((n) => (trayEls[n.dataset.item] = n));
      $('hud-stage').textContent = stage.name;

      // タイトル画面・クリア画面の絵
      const tt = $('title-town');
      if (tt) tt.innerHTML = Art.staticTownSVG(stage);
      const burst = $('clear-burst');
      if (burst) burst.innerHTML = stage.items.map((it) => `<span>${Art.itemIconSVG(it.id)}</span>`).join('');
    }

    /* ---------- レイアウト（画面サイズ・回転に追従） ---------- */

    function layout() {
      const w = el.wrap.clientWidth;
      const h = el.wrap.clientHeight;
      if (!w || !h) return;
      const ratio = VB.w / VB.h;
      let tw = w;
      let th = w / ratio;
      if (th > h) {
        th = h;
        tw = h * ratio;
      }
      el.town.style.width = Math.floor(tw) + 'px';
      el.town.style.height = Math.floor(th) + 'px';
      el.town.style.setProperty('--su', (tw / VB.w).toFixed(4) + 'px');
      document.documentElement.classList.toggle('is-short', window.innerHeight < 620);
    }

    /* ---------- 状態の描画 ---------- */

    function showScreen(name) {
      Object.entries(el.screens).forEach(([k, n]) => n.classList.toggle('is-active', k === name));
    }

    function screenXOf(id) {
      if (state.characters[id]) {
        const d = charDef[id];
        const sl = d.slots[state.characters[id].locationId];
        return Art.P(sl.gx, sl.gy)[0];
      }
      if (itemDef[id]) return Art.P(itemDef[id].pos.gx, itemDef[id].pos.gy)[0];
      return null;
    }

    function facingFor(def, c, from) {
      if (!from && facingOverride[def.id]) {
        const tx = screenXOf(facingOverride[def.id]);
        const sl = def.slots[c.locationId];
        if (tx !== null) return tx < Art.P(sl.gx, sl.gy)[0] ? 'left' : 'right';
      }
      if (from && from !== c.locationId) {
        // 歩いている向き
        const a = Art.P(def.slots[from].gx, def.slots[from].gy)[0];
        const b = Art.P(def.slots[c.locationId].gx, def.slots[c.locationId].gy)[0];
        return b < a ? 'left' : 'right';
      }
      if (c.locationId === 'LOC-03') {
        const s = def.slots['LOC-03'];
        return Art.P(PLAZA.gx, PLAZA.gy)[0] < Art.P(s.gx, s.gy)[0] ? 'left' : 'right';
      }
      return def.facing || 'right';
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
      let reorder = false;

      stage.characters.forEach((def) => {
        const c = state.characters[def.id];
        const slot = def.slots[c.locationId] || def.slots[def.locationId];
        const [sx, sy] = Art.P(slot.gx, slot.gy);
        const spr = charSpr[def.id];
        const prevLoc = lastLoc[def.id];
        const moving = prevLoc && prevLoc !== c.locationId;
        // 絵（状態が変わったときだけ描き直す）
        if (drawn[def.id] !== c.state) {
          spr.querySelector('.spr-in').innerHTML = Art.characterSVG(def.id, c.state);
          [...spr.classList].forEach((k) => k.startsWith('st-') && spr.classList.remove(k));
          spr.classList.add('st-' + c.state);
          drawn[def.id] = c.state;
        }
        const face = facingFor(def, c, moving ? prevLoc : null);
        spr.querySelector('.spr-face').setAttribute('transform', face === 'left' ? 'scale(-1 1)' : '');
        spr.style.transform = `translate(${r1(sx)}px, ${r1(sy)}px)`;
        if (spr.dataset.depth !== String(slot.gx + slot.gy)) {
          spr.dataset.depth = slot.gx + slot.gy;
          spr.dataset.gx = slot.gx;
          reorder = true;
        }
        if (moving) {
          delete facingOverride[def.id];
          walk(def.id, c);
        }
        lastLoc[def.id] = c.locationId;
        spr.classList.toggle('is-target', targets.includes(def.id));
        spr.classList.toggle('is-selected', state.selectedTargetId === def.id);

        const n = actorEls[def.id];
        n.style.left = pctX(sx) + '%';
        n.style.top = pctY(sy) + '%';
        n.classList.toggle('is-target', targets.includes(def.id));
        const st = def.states[c.state] || {};
        n.querySelector('.actor-btn').setAttribute(
          'aria-label',
          `${def.role}の${def.name}（${st.label || ''}）` + (targets.includes(def.id) ? '：アイテムを使える' : '')
        );
      });
      if (reorder) sortSprites();

      stage.items.forEach((def) => {
        const it = state.items[def.id];
        itemEls[def.id].hidden = it.used;
        itemSpr[def.id].style.display = it.used ? 'none' : '';
        itemSpr[def.id].classList.toggle('is-selected', selected === def.id);
        itemEls[def.id].classList.toggle('is-selected', selected === def.id);
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

      // 譜面台（楽譜を渡したら楽譜が載る）
      const sheet = state.items['IT-02'] && state.items['IT-02'].used;
      if (standSheet !== sheet) {
        const d = Art.decorSprites().find((x) => x.key === 'stand');
        standSpr.innerHTML = Art.musicStand(d.gx, d.gy, sheet);
        standSheet = sheet;
      }

      stage.locations.forEach((def) => {
        locEls[def.id].classList.toggle('is-target', targets.includes(def.id));
        locEls[def.id].classList.toggle('is-selected', state.selectedTargetId === def.id);
        locTags[def.id].classList.toggle('is-show', targets.includes(def.id) || state.selectedTargetId === def.id);
      });

      el.town.classList.toggle('has-selection', !!selected);
      const concert = state.triggeredEventIds.includes('EV-008');
      el.town.classList.toggle('is-concert', concert);
      if (concert && !extrasShown) gatherExtras();
      const done = Rules.objectives(stage, state);
      $('goal-count').textContent = `${done.filter((o) => o.done).length}/${done.length}`;
      el.guide.innerHTML = guideText();
    }

    function sortSprites() {
      const list = [...spritesG.children];
      list.sort((a, b) => +a.dataset.depth - +b.dataset.depth || +a.dataset.gx - +b.dataset.gx);
      list.forEach((n) => spritesG.appendChild(n));
    }

    function walk(id, c) {
      const spr = charSpr[id];
      const n = actorEls[id];
      spr.classList.add('is-walking');
      n.classList.add('is-walking');
      setTimeout(() => {
        spr.classList.remove('is-walking');
        n.classList.remove('is-walking');
        // 着いたら、広場の真ん中を向く
        const def = charDef[id];
        const face = facingFor(def, state.characters[id], null);
        spr.querySelector('.spr-face').setAttribute('transform', face === 'left' ? 'scale(-1 1)' : '');
      }, MOVE_MS);
    }

    function guideText() {
      if (state.screen === 'resolving') return '住人たちのようすを見守ろう';
      if (state.selectedItemId) {
        const it = itemDef[state.selectedItemId];
        return `<b>${esc(it.name)}</b>を、光っている住人か場所に使ってみよう`;
      }
      const h = Rules.currentHint(stage, state);
      if (!h) return '';
      if ((state.stats.missStreak || 0) >= 3) return '<span class="guide-mark">ヒント</span>' + esc(h.direct);
      return esc(h.soft);
    }

    /* ---------- メッセージ・吹き出し ---------- */

    function setMessage({ icon, title, sub, text }) {
      const ic = $('msg-icon');
      ic.innerHTML = icon || '';
      ic.hidden = !icon;
      $('msg-title').textContent = title || '';
      $('msg-sub').textContent = sub || '';
      $('msg-text').textContent = text || '';
      el.msg.classList.remove('flash');
      void el.msg.offsetWidth;
      el.msg.classList.add('flash');
    }

    const portrait = (id) => Art.portraitSVG(id, state.characters[id].state);

    function showBubble(charId, text, ms) {
      const n = actorEls[charId];
      if (!n) return;
      const b = n.querySelector('.bubble');
      b.textContent = text;
      b.classList.add('is-show');
      const x = parseFloat(n.style.left) || 50;
      b.classList.toggle('to-left', x > 64);
      b.classList.toggle('to-right', x < 36);
      clearTimeout(bubbleTimers[charId]);
      bubbleTimers[charId] = setTimeout(() => b.classList.remove('is-show'), ms || 3000);
    }

    function hideBubbles() {
      Object.values(actorEls).forEach((n) => n.querySelector('.bubble').classList.remove('is-show'));
    }

    function pulse(id) {
      const n = charSpr[id] || itemSpr[id] || locEls[id];
      if (!n) return;
      n.classList.remove('pulse');
      void n.getBoundingClientRect();
      n.classList.add('pulse');
    }

    function describeCharacter(id) {
      const def = charDef[id];
      const c = state.characters[id];
      const st = def.states[c.state];
      setMessage({ icon: portrait(id), title: `${def.name}（${def.role}）`, sub: st.label, text: `${st.observe}　目的：${def.goal}。` });
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
      setMessage({ icon: '', title: def.name, sub: here.length ? 'いる人：' + here.join('・') : 'だれもいない', text: def.description });
      pulse(id);
    }

    function describeItem(id) {
      const def = itemDef[id];
      setMessage({ icon: Art.itemIconSVG(id), title: def.name, sub: '選択中', text: def.description });
      pulse(id);
    }

    function deselectMessage() {
      setMessage({ icon: '', title: '横丁のようす', sub: '', text: '住人や場所をタップして、ようすを観察してみよう。' });
    }

    function showReaction({ reaction, text, targetId, itemId, repeated, isNew }) {
      const it = itemDef[itemId];
      const kind = Rules.targetKind(stage, targetId);
      const name = kind === 'character' ? charDef[targetId].name : locDef[targetId].name;
      setMessage({
        icon: kind === 'character' ? portrait(targetId) : Art.itemIconSVG(itemId),
        title: `${it.name} → ${name}`,
        sub: repeated ? '同じ反応だ' : '変化なし',
        text: repeated ? text + '（別のきっかけを試してみよう）' : text
      });
      if (kind === 'character') {
        const m = text.match(/「(.+)」/);
        showBubble(targetId, m ? m[1] : '……？', 2600);
      }
      pulse(targetId);
      if (isNew) toast(`新しい反応「${reaction.title}」を見つけた`);
    }

    /* ---------- イベントカード（SC-04） ---------- */

    function showEventCard(ev) {
      const sp = ev.speaker ? charDef[ev.speaker] : null;
      const icon = sp ? portrait(ev.speaker) : `<svg viewBox="-14 -16 28 28" aria-hidden="true">${Art.note(-4, 6, 1.3, '#7B5BA6')}${Art.note(6, 2, 1, '#E8876D')}</svg>`;
      $('event-icon').innerHTML = icon;
      $('event-msg').textContent = ev.message;
      $('event-line').textContent = sp && ev.line ? `${sp.name}「${ev.line}」` : '';
      // カードはメッセージ欄の上に重ねる（町を隠さない）
      el.card.style.minHeight = el.msg.offsetHeight + 'px';
      el.card.parentElement.classList.add('is-event');
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
      setMessage({ icon, title: 'できごと', sub: '', text: ev.message + (ev.line && sp ? `　${sp.name}「${ev.line}」` : '') });
      hideBubbles();
      if (sp && ev.line) showBubble(ev.speaker, ev.line, 2700);
      playEventAnim(ev);
      const ids = new Set();
      (ev.effects || []).forEach((e) => {
        if (e.characterId) ids.add(e.characterId);
        if (e.holderId) ids.add(e.holderId);
      });
      ids.forEach(pulse);
    }

    function hideEventCard() {
      el.card.hidden = true;
      el.card.parentElement.classList.remove('is-event');
    }

    function setPausedVisual(paused) {
      if (barAnim) paused ? barAnim.pause() : barAnim.play();
      document.body.classList.toggle('is-paused', paused);
      if (el.town.getAnimations) el.town.getAnimations({ subtree: true }).forEach((a) => (paused ? a.pause() : a.play()));
    }

    /* ---------- イベントの動き（手渡し・振り向き・反応のしるし・音符） ---------- */

    function headPoint(id) {
      const c = state.characters[id];
      const sl = charDef[id].slots[c.locationId];
      const [x, y] = Art.P(sl.gx, sl.gy);
      return [x, y - CHAR_H[id]];
    }

    function playEventAnim(ev) {
      const a = ev.anim || {};
      (ev.effects || []).forEach((e) => {
        if (e.type === 'use_item' && e.holderId) flyItem(e.itemId, e.holderId);
      });
      (a.look || []).forEach(([who, target]) => {
        facingOverride[who] = target;
        const spr = charSpr[who];
        if (spr && !spr.classList.contains('is-walking')) {
          const face = facingFor(charDef[who], state.characters[who], null);
          spr.querySelector('.spr-face').setAttribute('transform', face === 'left' ? 'scale(-1 1)' : '');
        }
      });
      (a.mark || []).forEach(([who, kind], i) => setTimeout(() => popMark(who, kind), 120 + i * 260));
      if (a.notes) flowNotes(a.notes[0], a.notes[1]);
    }

    function svgEl(html) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.innerHTML = html;
      return g;
    }

    function flyItem(itemId, holderId) {
      const def = itemDef[itemId];
      const o = ITEM_HIT[itemId];
      const [x0, y0] = Art.P(def.pos.gx, def.pos.gy);
      const sx = x0 + o.dx;
      const sy = y0 + o.dy;
      const [hx, hy] = headPoint(holderId);
      const ex = hx;
      const ey = hy + CHAR_H[holderId] * 0.45;
      const g = svgEl(Art.itemFlySVG(itemId));
      g.classList.add('fly');
      spritesG.appendChild(g);
      if (!g.animate) return g.remove();
      const mx = (sx + ex) / 2;
      const my = Math.min(sy, ey) - 50;
      const anim = g.animate(
        [
          { transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 1 },
          { transform: `translate(${mx}px, ${my}px) scale(1.15)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${ex}px, ${ey}px) scale(.8)`, opacity: 0 }
        ],
        { duration: 700, easing: 'ease-in-out', fill: 'forwards' }
      );
      anim.onfinish = () => g.remove();
    }

    function popMark(who, kind) {
      const spr = charSpr[who];
      if (!spr) return;
      const g = svgEl(`<g class="mark-in">${Art.markSVG(kind)}</g>`);
      g.setAttribute('transform', `translate(${who === 'CH-02' ? 22 : 26} ${-CHAR_H[who] + 22}) scale(1.25)`);
      g.classList.add('mark');
      spr.appendChild(g);
      setTimeout(() => g.remove(), 1700);
    }

    function flowNotes(from, to) {
      const [ax, ay] = headPoint(from);
      const [bx, by] = headPoint(to);
      const cols = ['#7B5BA6', '#E8876D', '#5E9C8F', '#7B5BA6'];
      cols.forEach((c, i) => {
        const g = svgEl(Art.note(0, 0, 1.5, c));
        g.classList.add('fly');
        spritesG.appendChild(g);
        if (!g.animate) return g.remove();
        const wob = i % 2 ? 14 : -14;
        const anim = g.animate(
          [
            { transform: `translate(${ax}px, ${ay}px)`, opacity: 0 },
            { transform: `translate(${ax + (bx - ax) * 0.33}px, ${ay + (by - ay) * 0.33 + wob}px)`, opacity: 1, offset: 0.3 },
            { transform: `translate(${ax + (bx - ax) * 0.66}px, ${ay + (by - ay) * 0.66 - wob}px)`, opacity: 1, offset: 0.65 },
            { transform: `translate(${bx}px, ${by}px)`, opacity: 0 }
          ],
          { duration: 1500, delay: i * 220, easing: 'ease-in-out', fill: 'both' }
        );
        anim.onfinish = () => g.remove();
      });
    }

    /** 演奏会：見物人が集まってくる */
    function gatherExtras() {
      extrasShown = true;
      EXTRAS.forEach((x) => {
        const n = extraSpr[x.id];
        const [fx, fy] = Art.P(x.from.gx, x.from.gy);
        const [tx, ty] = Art.P(x.to.gx, x.to.gy);
        n.style.transition = 'none';
        n.style.transform = `translate(${fx}px, ${fy}px)`;
        n.style.opacity = '0';
        n.style.display = '';
        n.dataset.depth = x.to.gx + x.to.gy;
        n.dataset.gx = x.to.gx;
        n.querySelector('.spr-face').setAttribute('transform', tx < fx ? 'scale(-1 1)' : '');
        n.classList.add('is-walking');
        sortSprites();
        setTimeout(() => {
          n.style.transition = '';
          void n.getBoundingClientRect();
          n.style.opacity = '1';
          n.style.transform = `translate(${tx}px, ${ty}px)`;
          setTimeout(() => {
            n.classList.remove('is-walking');
            // 着いたらネネのほうを向く
            const nx = screenXOf('CH-03');
            n.querySelector('.spr-face').setAttribute('transform', nx < tx ? 'scale(-1 1)' : '');
          }, 1500);
        }, 60 + x.delay);
      });
    }

    function hideExtras() {
      extrasShown = false;
      Object.values(extraSpr).forEach((n) => {
        n.style.display = 'none';
        n.classList.remove('is-walking');
      });
    }

    /* ---------- 演出 ---------- */

    function celebrate() {
      const cols = ['#7B5BA6', '#E8876D', '#5E9C8F', '#E85D5D', '#F7D778'];
      let html = '';
      for (let i = 0; i < 16; i++) {
        const x = 22 + ((i * 37) % 60);
        const d = (i % 6) * 0.18;
        html += `<span class="fx-bit" style="left:${x}%;animation-delay:${d}s"><svg viewBox="-8 -14 16 16">${Art.note(0, 0, 1, cols[i % cols.length])}</svg></span>`;
      }
      el.fx.innerHTML = html;
      setTimeout(() => (el.fx.innerHTML = ''), 3600);
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
      $('msg-sub').textContent = '';
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
        .map((d) => `<li class="${d.found ? 'is-found' : ''}">${d.found ? (d.type === 'event' ? '★ ' : '・') + esc(d.title) : '？？？'}</li>`)
        .join('');
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
        .map((o) => `<li class="${o.done ? 'is-done' : ''}"><span class="goal-mark">${o.done ? '✔' : ''}</span>${esc(o.text)}${o.done ? '<span class="sr">（達成）</span>' : ''}</li>`)
        .join('');
      hintLevel = 0;
      renderHint();
      $('ov-goal').hidden = false;
    }

    function renderHint() {
      const h = Rules.currentHint(stage, state);
      const btn = $('btn-more-hint');
      if (!h) {
        $('goal-hint').innerHTML = state.screen === 'resolving' ? 'いまは連鎖のとちゅう。見守ろう。' : '';
        btn.hidden = true;
        return;
      }
      $('goal-hint').innerHTML = esc(h.soft) + (hintLevel > 0 ? '<br><strong>ヒント：' + esc(h.direct) + '</strong>' : '');
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
      closeGoal();
      describeCharacter.count = {};
      Object.keys(lastLoc).forEach((k) => delete lastLoc[k]);
      Object.keys(facingOverride).forEach((k) => delete facingOverride[k]);
      hideExtras();
      spritesG.querySelectorAll('.fly, .mark').forEach((n) => n.remove());
      Object.values(charSpr).forEach((n) => n.classList.remove('is-walking'));
      // 位置を一瞬で戻す（歩かせない）
      el.town.classList.add('no-anim');
      requestAnimationFrame(() => requestAnimationFrame(() => el.town.classList.remove('no-anim')));
      setMessage({ icon: '', title: '横丁のようす', sub: '', text: '住人や場所をタップして、ようすを観察してみよう。' });
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
