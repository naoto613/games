/* 画面・操作・お題・おはなし・アルバム */
'use strict';
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const W = PT.world, R = PT.R, A = PT.audio, S = PT.save;

  const game = (PT.game = { screen: 'title', mode: 'free', stage: null, paused: false, odai: null, story: null, storyStep: 0, tab: 'friends', lastAct: 0 });

  /* ---------- 画面切り替え ---------- */
  game.show = (name) => {
    $$('.screen').forEach((s) => s.classList.toggle('on', s.id === 'scr-' + name));
    game.screen = name;
    if (name === 'title') A.playBgm('title');
    if (name === 'map') { buildMap(); A.playBgm('title'); }
    if (name === 'mode' || name === 'title') A.playBgm('title');
    PT.bus.emit('screen', name);
  };
  const overlay = (id, on) => $('#' + id).classList.toggle('on', on);

  /* ---------- 確認ダイアログ ---------- */
  let confirmCb = null;
  game.confirm = (text, iconId, cb) => {
    $('#confirm-text').textContent = text;
    const ic = $('#confirm-icon'); ic.innerHTML = '';
    if (iconId) ic.appendChild(cloneCv(PT.iconCache.any(iconId, 90)));
    confirmCb = cb; overlay('ov-confirm', true);
    A.speak(text);
  };
  const cloneCv = (src) => { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0); return c; };

  /* ---------- マップ ---------- */
  function buildMap() {
    const g = $('#map-grid'); g.innerHTML = '';
    const mc = $('#map-mode');
    mc.textContent = { free: 'じゆう', odai: 'ふしぎはっけん', story: 'おはなし' }[game.mode];
    mc.className = 'mode-chip ' + game.mode;
    const d = S.data;
    PT.STAGES.forEach((st) => {
      const b = document.createElement('button');
      b.className = 'stage-card';
      b.appendChild(cloneCv(PT.stageThumb(st, 360)));
      const n = document.createElement('div'); n.className = 'sc-name';
      n.innerHTML = `<span class="sc-num" style="background:${st.color}">${String(st.num).padStart(2, '0')}</span><span>${st.name}</span>`;
      b.appendChild(n);
      const cnt = Object.values(d.discoveredReactionIds).filter((v) => v.stage === st.id).length;
      if (cnt) { const f = document.createElement('span'); f.className = 'sc-found'; f.textContent = `★ ${cnt}`; b.appendChild(f); }
      if (d.stamps[st.id]) { const s = document.createElement('span'); s.className = 'sc-stamp'; s.textContent = 'すたんぷ'; b.appendChild(s); }
      // かくれた ほしを みつけた かず
      const hs = (d.funStars || {})[st.id];
      if (hs) { const h = document.createElement('span'); h.className = 'sc-hstar'; h.setAttribute('aria-label', `かくれた ほし ${hs}`); h.innerHTML = `<i></i>${hs}`; n.appendChild(h); }
      b.addEventListener('click', () => { A.sfx('ui'); game.enter(st.id); });
      g.appendChild(b);
    });
  }

  /* ---------- ステージに入る ---------- */
  game.enter = (id) => {
    const st = PT.stageById(id);
    game.stage = st;
    R.reset();
    W.t = Math.max(W.t, 1);
    W.load(st, S.data.stageSnapshots[id]);
    W.bg = null; game.layout(true);
    $('#stage-name').textContent = st.name;
    const si = $('#stage-icon'); si.innerHTML = ''; si.style.background = st.color; si.appendChild(cloneCv(PT.stageThumb(st, 72)));
    game.show('play');
    A.playBgm(st.bgm);
    game.tab = 'friends'; buildTabs(); buildItems();
    $('#card').classList.add('hidden'); $('#scr-play').classList.remove('has-card');
    game.odai = null; game.story = null;
    if (game.mode === 'odai') W.after(900, nextOdai);
    if (game.mode === 'story') W.after(900, startStory);
    if (!S.data.seenTutorial) { $('#tutorial').classList.remove('hidden'); }
    game.lastAct = W.t;
  };
  game.saveStage = () => {
    if (!game.stage || game.screen !== 'play') return;
    S.data.stageSnapshots[game.stage.id] = W.snapshot();
    S.touch();
  };
  PT.bus.on('beforeSave', () => { if (game.screen === 'play') S.data.stageSnapshots[game.stage.id] = W.snapshot(); });

  /* ---------- レイアウト（ワールド→画面） ---------- */
  const cv = $('#game');
  const ctx = cv.getContext('2d');
  let dpr = 1, vw = 0, vh = 0, panelH = 170;
  game.layout = (force) => {
    const nvw = window.innerWidth, nvh = window.innerHeight;
    if (!force && nvw === vw && nvh === vh) return;
    vw = nvw; vh = nvh;
    dpr = Math.min(2.5, window.devicePixelRatio || 1);
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
    panelH = Math.round(PT.clamp(vh * 0.27, 112, 190));
    document.documentElement.style.setProperty('--panel-h', panelH + 'px');
    // 床の いちばん手前は 半透明パネルの 下に すこし かくす（そのぶん 上が ひろく 見える）
    const avail = vh - panelH + Math.min(70, panelH * 0.45);
    const sH = avail / (PT.H - 150);
    const s = Math.max(sH, vw / PT.W);
    W.scale = s;
    const worldW = PT.W * s;
    W.ox = worldW > vw ? PT.clamp(W.ox, vw - worldW, 0) : (vw - worldW) / 2;
    if (force && worldW > vw) W.ox = (vw - worldW) / 2;
    W.oy = avail - PT.H * s;
    updateVis();
    if (game.stage) {
      const want = Math.min(3, Math.max(0.6, s * dpr * 1.15));
      if (!W.bg || Math.abs(W.bgScale - want) > 0.05) { W.bg = PT.renderStageBg(game.stage, want); W.bgScale = want; }
    }
    $('#rotate').classList.toggle('show', vh > vw && !game.rotateOk);
  };
  function updateVis() {
    W.visLeft = -W.ox / W.scale; W.visRight = (vw - W.ox) / W.scale;
    W.visTop = -W.oy / W.scale; W.visBottom = Math.min(PT.H, (vh - panelH - W.oy) / W.scale + 10);
  }
  const toWorld = (x, y) => ({ x: (x - W.ox) / W.scale, y: (y - W.oy) / W.scale });
  game.toScreen = (x, y) => ({ x: x * W.scale + W.ox, y: y * W.scale + W.oy });
  window.addEventListener('resize', () => game.layout());

  /* ---------- パネル ---------- */
  const TABS = [
    { id: 'friends', name: 'なかま', icon: 'lulu' },
    { id: 'food', name: 'たべもの', icon: 'strawberry' },
    { id: 'tools', name: 'どうぐ', icon: 'teddy' },
    { id: 'rides', name: 'のりもの', icon: 'slide' },
    { id: 'dress', name: 'へんしん', icon: 'crown' },
    { id: 'magic', name: 'おと・ふしぎ', icon: 'balloon' },
  ];
  const unlocked = (id) => { const it = PT.ITEMS[id]; return !it.lock || S.data.unlockedObjectIds.includes(id); };
  game.itemsFor = (tab) => {
    const st = game.stage;
    if (tab === 'friends') return PT.CHAR_IDS.slice();
    const all = Object.values(PT.ITEMS).filter((i) => i.cat === tab && unlocked(i.id)).map((i) => i.id);
    // そのステージに あう物を まえに、ほかの物も ぜんぶ つかえる
    const fav = (st.favs || []).concat(st.tools || [], st.rides || [], PT.ROYAL_FAVS || []).filter((id) => PT.ITEMS[id] && all.includes(id));
    return [...new Set(fav.concat(all))];
  };
  function buildTabs() {
    const t = $('#tabs'); t.innerHTML = '';
    TABS.forEach((tb) => {
      const b = document.createElement('button');
      b.className = 'tab' + (game.tab === tb.id ? ' on' : '');
      b.appendChild(cloneCv(PT.iconCache.any(tb.icon, 52)));
      b.appendChild(document.createTextNode(tb.name));
      b.addEventListener('click', () => { A.sfx('tap'); game.tab = tb.id; buildTabs(); buildItems(); });
      t.appendChild(b);
    });
  }
  let hintIds = [];
  function buildItems() {
    const box = $('#items'); box.innerHTML = ''; box.scrollLeft = 0;
    game.itemsFor(game.tab).forEach((id) => {
      const b = document.createElement('div');
      b.className = 'item';
      b.dataset.id = id;
      if (game.tab === 'friends' && W.charOf(id)) b.classList.add('present');
      if (hintIds.includes(id)) b.classList.add('hintme');
      if (S.data.newItems && S.data.newItems.includes(id)) b.classList.add('new');
      b.appendChild(cloneCv(game.tab === 'friends' ? PT.iconCache.char(id, 104) : PT.iconCache.item(id, 104)));
      b.setAttribute('aria-label', game.tab === 'friends' ? PT.CHARS[id].name : PT.ITEMS[id].name);
      b.addEventListener('pointerdown', (e) => panelDown(e, id));
      box.appendChild(b);
    });
  }
  game.refreshPanel = () => { if (game.screen === 'play') buildItems(); };

  /* ---------- 入力：パネルからドラッグ ---------- */
  const ghost = $('#drag-ghost');
  let drag = null; // { kind:'panel'|'ent', id, ent, startX, startY, sx, sy, started, timer, pointerId, offY }

  function panelDown(e, id) {
    if (drag) return;
    A.init();
    drag = { kind: 'panel', id, isChar: game.tab === 'friends', startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, started: false, pointerId: e.pointerId, t0: performance.now() };
    drag.timer = setTimeout(() => { if (drag && !drag.started) beginPanelDrag(); }, 260);
  }
  function beginPanelDrag() {
    drag.started = true;
    clearTimeout(drag.timer);
    ghost.innerHTML = '';
    ghost.appendChild(cloneCv(drag.isChar ? PT.iconCache.charFull(drag.id, 160) : PT.iconCache.item(drag.id, 140)));
    ghost.classList.remove('hidden');
    A.sfx('pick');
    W.dragGhost = { id: drag.id };
    $('#tutorial').classList.add('hidden');
    if (!S.data.seenTutorial) { S.data.seenTutorial = true; S.touch(); }
    moveGhost();
  }
  function moveGhost() {
    const size = drag.isChar ? 130 : 110;
    ghost.style.width = ghost.style.height = size + 'px';
    // ゆびの いちに そのまま 表示（物の まんなか＝ゆび）。置く ばしょは 物の あしもと
    ghost.style.transform = `translate(${drag.x - size / 2}px, ${drag.y - size / 2}px)`;
    drag.baseOff = size * (drag.isChar ? 0.47 : 0.36);
    const wp = toWorld(drag.x, drag.y + drag.baseOff);
    const tgt = W.pick(wp.x, wp.y, { pad: 10 });
    setHover(tgt);
    const onPanel = drag.y > vh - panelH;
    W.dragGhost.drop = onPanel ? null : dropPos(wp, drag.isChar ? null : PT.ITEMS[drag.id]);
  }
  function setHover(t) {
    if (W.hover && W.hover !== t) W.hover.glow = false;
    W.hover = t; if (t) t.glow = true;
  }
  /* 置く位置（床にスナップ。ふわふわ物はそのまま） */
  function dropPos(wp, item) {
    if (item && item.float) {
      return { x: PT.clamp(wp.x, W.visLeft + 40, W.visRight - 40), y: PT.clamp(wp.y, W.visTop + 120, W.visBottom - 20) };
    }
    return W.clampFloor(wp.x, wp.y, 50);
  }

  /* ---------- 入力：ワールド ---------- */
  let press = null;
  cv.addEventListener('pointerdown', (e) => {
    if (drag || game.screen !== 'play') return;
    A.init();
    cv.setPointerCapture(e.pointerId);
    const wp = toWorld(e.clientX, e.clientY);
    // かくれた ほし（fun.js）
    if (PT.fun && PT.fun.tapAt && PT.fun.tapAt(wp.x, wp.y)) return;
    // シャボン玉
    const b = W.bubbles.find((bb) => Math.hypot(bb.x - wp.x, bb.y - wp.y) < bb.r + 24);
    if (b) { W.popBubble(b); return; }
    const ent = W.pick(wp.x, wp.y, { pad: 12 });
    press = { ent, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, ox: W.ox, moved: false, t0: performance.now(), pointerId: e.pointerId };
    if (ent && ent.kind !== 'fix' && !ent.inTween) {
      press.timer = setTimeout(() => { if (press && !press.moved && press.ent) beginEntDrag(); }, 350);
    }
  });
  cv.addEventListener('pointermove', (e) => {
    if (drag && drag.kind === 'pet') { petMove(e.clientX, e.clientY); return; }
    if (drag && drag.kind === 'ent') { drag.x = e.clientX; drag.y = e.clientY; entDragMove(); return; }
    if (!press) return;
    press.x = e.clientX; press.y = e.clientY;
    const d = Math.hypot(e.clientX - press.sx, e.clientY - press.sy);
    if (d > 12 && !press.moved) {
      press.moved = true;
      if (press.ent && press.ent.kind !== 'fix' && !press.ent.inTween) { beginEntDrag(); return; }
    }
    if (press.moved && !press.ent) {
      // 画面より広いときは ひっぱって 見わたせる
      const worldW = PT.W * W.scale;
      if (worldW > vw) { W.ox = PT.clamp(press.ox + (e.clientX - press.sx), vw - worldW, 0); updateVis(); }
    }
  });
  const endPress = (e) => {
    if (drag && drag.kind === 'pet') { const d = drag; drag = null; if (PT.fun && PT.fun.petEnd) PT.fun.petEnd(d.ent); game.lastAct = W.t; return; }
    if (drag && drag.kind === 'ent') { finishEntDrag(e.type === 'pointercancel'); return; }
    if (!press) return;
    clearTimeout(press.timer);
    const p = press; press = null;
    if (!p.moved && p.ent) { A.sfx('tap'); tapEnt(p.ent); }
    else if (!p.moved) { const wp = toWorld(p.x, p.y); W.burst('spark', wp.x, wp.y, 4, { sp: 0.1, max: 500, size: 8, col: '#ffffff', g: 0 }); }
  };
  cv.addEventListener('pointerup', endPress);
  cv.addEventListener('pointercancel', endPress);

  function tapEnt(e) {
    game.lastAct = W.t;
    if (e.kind === 'char') {
      e.tapN = W.t - (e.lastTap || 0) < 1500 ? (e.tapN || 0) + 1 : 1;
      e.lastTap = W.t;
    }
    R.onTap(e);
    game.saveStageSoon();
  }
  function beginEntDrag() {
    const e = press.ent;
    clearTimeout(press.timer);
    drag = { kind: 'ent', ent: e, x: press.x, y: press.y, started: true, pointerId: press.pointerId };
    // なでなで：キャラの うえで ゆびを ごしごし（左右に いったり きたり）したら ドラッグを やめて なでなでに する
    if (e.kind === 'char' && PT.fun && PT.fun.pet) drag.rub = { x0: press.sx, y0: press.sy, lx: press.x, dir: 0, flips: 0, ex: e.x, ey: e.y };
    // つかんだ ところが ゆびに くっついたまま うごく
    const g0 = toWorld(press.x, press.y);
    drag.dx = e.x - g0.x; drag.dy = e.y - g0.y;
    press = null;
    if (e.kind === 'char') { R.claim(e, 0); if (e.riding) R.unride(e); e.dragging = true; e.hidden = false; e.stay = false; e.z = 0; e.pose = 'jump'; W.setFace(e, 'surprise', 0); W.say(e, PT.pick(['わわっ', 'どこいくの？', 'たかーい！']), null, 1000, 'wow'); }
    else { e.dragging = true; if (e.mode === 'fort') { e.mode = null; e.bw = e.bh = 0; W.props().forEach((p) => { if (p.coveredBy === e.id) { p.hidden = false; p.coveredBy = null; } }); } e.zTarget = undefined; e.vx = e.vy = 0; if (e.rider) { const ch = W.byId(e.rider); if (ch) R.unride(ch); } }
    A.sfx('pick');
    W.dragGhost = { id: e.id };
    $('#panel').classList.add('dragging');
    entDragMove();
  }
  function entDragMove() {
    const e = drag.ent;
    const rb = drag.rub;
    if (rb) {
      if (Math.hypot(drag.x - rb.x0, drag.y - rb.y0) > 90) drag.rub = null; // とおくへ うごかした → ふつうの ドラッグ
      else {
        const dx = drag.x - rb.lx;
        if (Math.abs(dx) > 7) { const dir = Math.sign(dx); if (rb.dir && dir !== rb.dir) rb.flips++; rb.dir = dir; rb.lx = drag.x; }
        if (rb.flips >= 3) { startPet(); return; }
      }
    }
    const g = toWorld(drag.x, drag.y);
    const wp = { x: g.x + drag.dx, y: g.y + drag.dy };
    e.x = wp.x; e.y = wp.y;
    e.scale = W.depthScale(Math.max(W.stage.floor[0], wp.y));
    e.z = 0;
    const onPanel = drag.y > vh - panelH;
    $('#panel').classList.toggle('over', onPanel);
    const tgt = W.pick(wp.x, wp.y, { pad: 10, exclude: e });
    setHover(onPanel ? null : tgt);
    W.dragGhost.drop = onPanel ? null : dropPos(wp, e.kind === 'prop' ? e.def : null);
  }
  function finishEntDrag(cancel) {
    const e = drag.ent; const d = drag; drag = null;
    $('#panel').classList.remove('dragging', 'over');
    e.dragging = false;
    const tgt = W.hover; setHover(null);
    W.dragGhost = null;
    const onPanel = d.y > vh - panelH;
    if (onPanel && !cancel) {
      // おかたづけ
      W.poof(e.x, e.y - 40); A.sfx('trash');
      if (e.kind === 'char') { e.queue = []; e.cur = null; }
      W.remove(e);
      if (game.tab === 'friends') buildItems();
      game.saveStageSoon();
      return;
    }
    const wp = { x: e.x, y: e.y };
    const p = dropPos(wp, e.kind === 'prop' ? e.def : null);
    const area = W.areaAt(wp.x, wp.y);
    e.x = p.x; e.y = p.y; e.scale = W.depthScale(p.y); e.pop = W.t;
    if (e.kind === 'char') { e.pose = 'idle'; e.face = 'happy'; e.lockUntil = 0; }
    A.sfx('place');
    if (!cancel) R.onDrop(e, { tgt: tgt && tgt !== e ? tgt : null, x: wp.x, y: wp.y, area });
    game.lastAct = W.t;
    game.saveStageSoon();
  }

  /* なでなで */
  function startPet() {
    const e = drag.ent, rb = drag.rub;
    $('#panel').classList.remove('dragging', 'over');
    e.dragging = false; setHover(null); W.dragGhost = null;
    e.x = rb.ex; e.y = rb.ey; e.scale = W.depthScale(e.y); e.z = 0; e.pose = 'idle';
    drag = { kind: 'pet', ent: e, lx: rb.lx, dir: rb.dir, pointerId: drag.pointerId };
    PT.fun.pet(e);
  }
  function petMove(x, y) {
    const dx = x - drag.lx;
    if (Math.abs(dx) > 7) { const dir = Math.sign(dx); if (drag.dir && dir !== drag.dir && PT.fun.petMore) PT.fun.petMore(drag.ent); drag.dir = dir; drag.lx = x; }
  }

  /* パネルドラッグ：document で追う（パネル内の横スクロールと区別） */
  document.addEventListener('pointermove', (e) => {
    if (!drag || drag.kind !== 'panel' || e.pointerId !== drag.pointerId) return;
    drag.x = e.clientX; drag.y = e.clientY;
    if (!drag.started) {
      const dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 0.8) beginPanelDrag();
      else if (Math.abs(dx) > 14) { clearTimeout(drag.timer); drag = null; }
      return;
    }
    e.preventDefault();
    moveGhost();
  }, { passive: false });
  const panelUp = (e) => {
    if (!drag || drag.kind !== 'panel' || e.pointerId !== drag.pointerId) return;
    clearTimeout(drag.timer);
    const d = drag; drag = null;
    ghost.classList.add('hidden');
    const tgt = W.hover; setHover(null);
    const drop = W.dragGhost && W.dragGhost.drop; W.dragGhost = null;
    if (!d.started) {
      // タップ：キャラなら その子が ぴょん、物なら ちいさく ゆれる
      if (d.isChar) { const ch = W.charOf(d.id); if (ch) { R.claim(ch, 1200).jump(50, 450).say('ここだよ！', 'heart', 1200, 'yay'); A.sfx('pop'); } else A.sfx('tap'); }
      else { A.voice(500, 'talk', 1); A.speak(PT.ITEMS[d.id].name); }
      return;
    }
    if (e.type === 'pointercancel' || !drop) { A.sfx('back'); return; } // パネルの上で はなした → なにも なくならない
    const wp = toWorld(d.x, d.y + (d.baseOff || 0));
    const area = W.areaAt(wp.x, wp.y);
    let ent;
    if (d.isChar) {
      ent = W.charOf(d.id);
      if (ent) { W.poof(ent.x, ent.y - 60); R.claim(ent, 0); if (ent.riding) R.unride(ent); ent.x = drop.x; ent.y = drop.y; ent.hidden = false; ent.stay = false; ent.z = 0; ent.scale = W.depthScale(ent.y); }
      else ent = W.addChar(d.id, drop.x, drop.y);
      ent.pose = 'jump'; ent.poseT = 0;
      W.say(ent, PT.pick(['やっほー！', 'きたよ！', 'あそぼ！']), null, 1200, 'yay');
      buildItems();
    } else {
      ent = W.addProp(d.id, drop.x, drop.y);
      if (S.data.newItems && S.data.newItems.includes(d.id)) { S.data.newItems = S.data.newItems.filter((x) => x !== d.id); buildItems(); }
    }
    ent.pop = W.t;
    A.sfx('place');
    W.burst('spark', drop.x, drop.y - 20, 6, { sp: 0.15, max: 500, size: 8, col: '#ffffff', g: 0 });
    if (ent.kind === 'prop') game.onPlace(ent.type);
    R.onDrop(ent, { tgt: tgt && tgt !== ent ? tgt : null, x: wp.x, y: wp.y, area, fromPanel: true });
    game.lastAct = W.t;
    game.saveStageSoon();
  };
  document.addEventListener('pointerup', panelUp);
  document.addEventListener('pointercancel', panelUp);

  let saveT = null;
  game.saveStageSoon = () => { clearTimeout(saveT); saveT = setTimeout(game.saveStage, 1500); };

  /* ---------- はっけん・お題・おはなし ---------- */
  game.onReaction = (id) => {
    const d = S.data;
    PT.bus.emit('reaction', id);
    if (game.stage && !d.discoveredReactionIds[id]) {
      d.discoveredReactionIds[id] = { stage: game.stage.id, at: Date.now() };
      toastDisc(id);
      checkRewards();
      S.touch();
    }
    checkGoals(id);
  };
  game.onPlace = (type) => checkGoals('*' + type);

  function iconRow(ids, size) { const w = document.createElement('div'); ids.slice(0, 3).forEach((i) => w.appendChild(cloneCv(PT.iconCache.any(i, size)))); return w; }
  function toast(kind, title, icons, cls = '') {
    const t = document.createElement('div');
    t.className = 'toast ' + cls;
    const ic = iconRow(icons, 88); ic.className = 't-ic';
    t.appendChild(ic);
    const b = document.createElement('div'); b.innerHTML = `<small>${kind}</small><b>${title}</b>`;
    t.appendChild(b);
    const area = $('#toast-area'); area.appendChild(t);
    while (area.children.length > 3) area.firstElementChild.remove();
    setTimeout(() => t.remove(), 4300);
  }
  function toastDisc(id) {
    // ふきだしは 出さない（アルバムには きろくされる）。音と アルバムボタンの ゆれだけで しらせる
    A.sfx('discover');
    const ab = $('.side-btns .round-btn'); ab.classList.add('pulse'); setTimeout(() => ab.classList.remove('pulse'), 2500);
  }
  function checkRewards() {
    const d = S.data;
    const n = Object.keys(d.discoveredReactionIds).length;
    PT.REWARDS.forEach((r) => {
      if (n >= r.at && !d.unlockedObjectIds.includes(r.item)) {
        d.unlockedObjectIds.push(r.item);
        d.newItems = (d.newItems || []).concat(r.item);
        setTimeout(() => { toast('あたらしい アイテム！', PT.ITEMS[r.item].name, [r.item], 'reward'); A.sfx('cheer'); game.refreshPanel(); }, 1800);
      }
    });
    if (game.stage) {
      const sid = game.stage.id;
      const c = Object.values(d.discoveredReactionIds).filter((v) => v.stage === sid).length;
      if (c >= 3 && !d.stamps[sid]) { d.stamps[sid] = true; setTimeout(() => { toast('きねん スタンプ！', game.stage.name, ['star'], 'reward'); A.sfx('jingle'); }, 3200); }
    }
  }

  /* ふしぎ発見モード：お題 */
  function odaiList() { const sid = game.stage.id; return PT.ODAI.filter((o) => o.stage === sid).concat(PT.ODAI_ANY); }
  function nextOdai() {
    if (game.screen !== 'play' || game.mode !== 'odai') return;
    const list = odaiList();
    const notDone = list.filter((o) => !S.data.odaiDone[o.id]);
    const pool = notDone.length ? notDone : list;
    const prev = game.odai;
    game.odai = pool.find((o) => o !== prev) || pool[0];
    game.odaiAt = W.t; game.hinted = false;
    showCard('odai');
  }
  function startStory() {
    const sid = game.stage.id;
    const list = PT.STORIES.filter((s) => s.stage === sid);
    if (!list.length) { game.mode = 'free'; return; }
    game.story = list.find((s) => !S.data.storyDone[s.id]) || PT.pick(list);
    game.storyStep = 0; game.odaiAt = W.t; game.hinted = false;
    showCard('story');
    A.sfx('jingle');
  }
  function showCard(kind, done) {
    const card = $('#card');
    $('#scr-play').classList.add('has-card');
    card.className = 'task-card ' + (kind === 'story' ? 'story' : '') + (done ? ' done' : '');
    let text, icon, label;
    if (kind === 'odai') { text = game.odai.text; icon = game.odai.hint[0]; label = done ? 'できた！ すごい！' : 'おだい'; }
    else {
      const s = game.story;
      if (game.storyStep >= s.steps.length) { text = s.end; icon = 'star'; label = 'おしまい'; }
      else { const step = s.steps[game.storyStep]; text = step.text; icon = step.hint[0]; label = `おはなし「${s.title}」`; }
    }
    $('#tc-kind').textContent = label;
    $('#tc-text').textContent = text;
    const ic = $('#tc-icon'); ic.innerHTML = ''; ic.appendChild(cloneCv(PT.iconCache.any(done ? 'star' : icon, 100)));
    const dots = $('#tc-dots'); dots.innerHTML = '';
    if (kind === 'story') game.story.steps.forEach((_, i) => { const d = document.createElement('i'); if (i < game.storyStep) d.className = 'on'; dots.appendChild(d); });
    // 同じ内容でもアニメーションをやりなおす
    card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
    if (!done) A.speak(text);
  }
  function checkGoals(id) {
    if (game.screen !== 'play') return;
    if (game.mode === 'odai' && game.odai && game.odai.goals.includes(id) && !game.odaiCleared) {
      game.odaiCleared = true;
      S.data.odaiDone[game.odai.id] = true; S.touch();
      showCard('odai', true); A.sfx('cheer'); A.speak('できた！ すごい！');
      W.after(3400, () => { game.odaiCleared = false; clearHints(); nextOdai(); });
    }
    if (game.mode === 'story' && game.story && game.storyStep < game.story.steps.length) {
      const step = game.story.steps[game.storyStep];
      if (step.goals.includes(id)) {
        game.storyStep++; game.odaiAt = W.t; game.hinted = false; clearHints();
        A.sfx('ding');
        if (game.storyStep >= game.story.steps.length) {
          S.data.storyDone[game.story.id] = true; S.touch();
          W.after(1500, () => { showCard('story'); PT.FX.confetti(800, 2400); A.sfx('cheer'); A.speak(game.story.end); });
          W.after(9000, () => { if (game.mode === 'story' && game.screen === 'play' && game.storyStep >= game.story.steps.length) { const others = PT.STORIES.filter((s) => s.stage === game.stage.id && s !== game.story); if (others.length) { game.story = PT.pick(others); game.storyStep = 0; showCard('story'); } else $('#card').classList.add('hidden'); } });
        } else W.after(1200, () => showCard('story'));
      }
    }
  }
  $('#tc-speak').addEventListener('click', () => { A.init(); A.speak($('#tc-text').textContent); A.sfx('tap'); });
  $('#tc-next').addEventListener('click', () => {
    A.sfx('ui');
    if (game.mode === 'odai') nextOdai();
    else if (game.mode === 'story' && game.story) {
      if (game.storyStep < game.story.steps.length) { game.storyStep++; if (game.storyStep >= game.story.steps.length) { S.data.storyDone[game.story.id] = true; } showCard('story'); }
      else startStory();
    }
  });

  /* ヒント */
  function clearHints() { hintIds = []; W.fixes().forEach((f) => { f.glow = false; }); game.refreshPanel(); $('.hint-btn').classList.remove('pulse'); }
  const SUGGEST = ['blocks', 'camera', 'seed', 'snow', 'egg', 'chest', 'guitar', 'bus', 'carpet', 'watermelon', 'pizza', 'kite', 'blanket', 'box', 'ball', 'teddy', 'music', 'bubbles', 'apron', 'crown', 'cake', 'flashlight', 'drum', 'balloon', 'dino', 'book', 'star'];
  game.hint = () => {
    A.init();
    let ids;
    if (game.mode === 'odai' && game.odai) { ids = game.odai.hint; showCard('odai'); }
    else if (game.mode === 'story' && game.story && game.storyStep < game.story.steps.length) { ids = game.story.steps[game.storyStep].hint; showCard('story'); }
    else {
      const avail = SUGGEST.filter((id) => ['food', 'tools', 'rides', 'dress', 'magic'].some((t) => game.itemsFor(t).includes(id)));
      const fixT = W.fixes().filter((f) => !f.def.area && !f.def.deco && !f.def.hidden && f.type !== 'skystar');
      ids = [Math.random() < 0.35 && fixT.length ? PT.pick(fixT).type : PT.pick(avail)];
      const ch = PT.pick(R.chars());
      if (ch) { const it = ids[0]; R.claim(ch, 2600).pose('point', 900).say(PT.FIX[it] ? 'ここ タップしてみて！' : 'これ おいてみて！', it, 2200, 'yay'); }
    }
    hintIds = ids.filter((id) => PT.ITEMS[id] || PT.CHARS[id]);
    const fx = ids.filter((id) => PT.FIX[id]);
    W.fixes().forEach((f) => { f.glow = fx.includes(f.type); });
    if (hintIds.length) {
      const tab = PT.CHARS[hintIds[0]] ? 'friends' : PT.ITEMS[hintIds[0]].cat;
      if (['food', 'tools', 'rides', 'dress', 'magic', 'friends'].includes(tab)) { game.tab = tab; buildTabs(); }
      buildItems();
      const el = $(`.item[data-id="${hintIds[0]}"]`); if (el) el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
    A.sfx('sparkle');
    clearTimeout(game.hintT); game.hintT = setTimeout(clearHints, 9000);
  };

  /* ---------- アルバム ---------- */
  let albumTab = 'all';
  game.openAlbum = () => {
    A.sfx('ui');
    game.paused = true;
    overlay('ov-album', true);
    renderAlbum();
  };
  function renderAlbum() {
    const d = S.data;
    const found = Object.keys(d.discoveredReactionIds).filter((id) => PT.DISC[id]);
    $('#album-count').textContent = `みつけた かず ${found.length}`;
    const stp = $('#album-stamps'); stp.innerHTML = '';
    PT.STAGES.forEach((s) => { const e = document.createElement('div'); e.className = 'stamp' + (d.stamps[s.id] ? ' on' : ''); e.textContent = String(s.num).padStart(2, '0'); e.title = s.name; stp.appendChild(e); });
    const tabs = $('#album-tabs'); tabs.innerHTML = '';
    [['all', 'ぜんぶ'], ['any', 'どこでも']].concat(PT.STAGES.map((s) => [s.id, s.name])).forEach(([id, name]) => {
      const b = document.createElement('button'); b.className = 'tab' + (albumTab === id ? ' on' : ''); b.textContent = name;
      b.addEventListener('click', () => { albumTab = id; A.sfx('tap'); renderAlbum(); });
      tabs.appendChild(b);
    });
    const g = $('#album-grid'); g.innerHTML = '';
    PT.DISC_ORDER.filter((id) => albumTab === 'all' || PT.DISC[id].stage === albumTab).sort((a, b) => !!d.discoveredReactionIds[b] - !!d.discoveredReactionIds[a]).forEach((id) => {
      const D = PT.DISC[id]; const got = d.discoveredReactionIds[id];
      const c = document.createElement('button');
      c.className = 'acard' + (got ? '' : ' unk');
      if (got) {
        const ic = iconRow(D.icons, 108); ic.className = 'a-ic'; c.appendChild(ic);
        const st = PT.stageById(got.stage);
        c.insertAdjacentHTML('beforeend', `<b>${D.title}</b><small>${st ? st.name : ''}</small>`);
        c.addEventListener('click', () => showDetail(id));
      } else {
        c.innerHTML = `<span class="q">？</span><small>${D.stage === 'any' ? 'どこかで みつかるよ' : PT.stageById(D.stage).name}</small>`;
      }
      g.appendChild(c);
    });
  }
  function showDetail(id) {
    const D = PT.DISC[id]; const got = S.data.discoveredReactionIds[id];
    const el = $('#album-detail'); el.innerHTML = '';
    const box = document.createElement('div'); box.className = 'dbox';
    const ic = iconRow(D.icons, 200); ic.className = 'd-ic'; box.appendChild(ic);
    box.insertAdjacentHTML('beforeend', `<h4>${D.title}</h4><small>${PT.stageById(got.stage)?.name || ''}で みつけたよ</small><p>${D.desc}</p>`);
    const btn = document.createElement('button'); btn.className = 'btn-pill'; btn.innerHTML = '<span class="ico ico-sound"></span>よむ';
    btn.addEventListener('click', (e) => { e.stopPropagation(); A.speak(D.title + '。' + D.desc); });
    box.appendChild(btn);
    el.appendChild(box);
    el.classList.remove('hidden');
    A.sfx('pop'); A.speak(D.title);
    el.onclick = () => { el.classList.add('hidden'); };
  }

  /* ---------- 保護者メニュー ---------- */
  game.openParent = () => {
    game.paused = true;
    const st = S.data.settings;
    $('#vol').value = st.volume; $('#opt-bgm').checked = st.bgm; $('#opt-sfx').checked = st.sfx; $('#opt-speak').checked = st.speak;
    overlay('ov-parent', true);
  };
  game.applySettings = () => {
    const st = S.data.settings;
    A.volume = +st.volume; A.bgmOn = st.bgm; A.sfxOn = st.sfx; A.speakOn = st.speak;
    A.apply();
    const bgmB = $('[data-act="bgm"]'), sfxB = $('[data-act="sfx"]');
    bgmB.classList.toggle('off', !st.bgm); bgmB.firstElementChild.className = 'ico ' + (st.bgm ? 'ico-music' : 'ico-musicoff');
    sfxB.classList.toggle('off', !st.sfx); sfxB.firstElementChild.className = 'ico ' + (st.sfx ? 'ico-sound' : 'ico-mute');
    if (st.bgm && game.screen === 'play' && game.stage) { A.bgmTheme = null; A.playBgm(game.stage.bgm); }
  };
  $('#vol').addEventListener('input', (e) => { S.data.settings.volume = +e.target.value; game.applySettings(); S.touch(); });
  [['opt-bgm', 'bgm'], ['opt-sfx', 'sfx'], ['opt-speak', 'speak']].forEach(([el, k]) => $('#' + el).addEventListener('change', (e) => { S.data.settings[k] = e.target.checked; game.applySettings(); S.touch(); }));

  /* 長押しボタン（保護者用：こどもが うっかり 押しにくく） */
  $$('[data-hold]').forEach((b) => {
    let t = null;
    const start = (e) => { e.preventDefault(); A.init(); b.classList.add('holding'); t = setTimeout(() => { b.classList.remove('holding'); A.sfx('ui'); game.openParent(); }, 1200); };
    const stop = () => { clearTimeout(t); b.classList.remove('holding'); };
    b.addEventListener('pointerdown', start);
    b.addEventListener('pointerup', stop); b.addEventListener('pointerleave', stop); b.addEventListener('pointercancel', stop);
  });

  /* ---------- ボタン ---------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act],[data-mode]');
    if (!b) return;
    A.init();
    if (b.dataset.mode) { A.sfx('ui'); game.mode = b.dataset.mode; game.show('map'); return; }
    const act = b.dataset.act;
    switch (act) {
      case 'start': A.sfx('ui'); game.show('mode'); break;
      case 'back-title': A.sfx('back'); game.show('title'); break;
      case 'back-mode': A.sfx('back'); game.show('mode'); break;
      case 'back-map': A.sfx('back'); game.saveStage(); S.writeNow(); W.stage && (W.ents = []); game.stage = null; A.stopBgm(); game.show('map'); break;
      case 'album': game.openAlbum(); break;
      case 'close-album': A.sfx('back'); overlay('ov-album', false); $('#album-detail').classList.add('hidden'); game.paused = false; break;
      case 'close-parent': A.sfx('back'); overlay('ov-parent', false); game.paused = false; break;
      case 'hint': game.hint(); break;
      case 'dance': if (PT.fun && PT.fun.dance) PT.fun.dance(); game.lastAct = W.t; break;
      case 'weather': if (PT.fun && PT.fun.nextWeather) PT.fun.nextWeather(); game.lastAct = W.t; break;
      case 'bgm': S.data.settings.bgm = !S.data.settings.bgm; game.applySettings(); S.touch(); A.sfx('tap'); break;
      case 'sfx': S.data.settings.sfx = !S.data.settings.sfx; game.applySettings(); S.touch(); A.sfx('tap'); break;
      case 'reset':
        A.sfx('ui');
        game.confirm('おかたづけ して はじめに もどす？', 'box', () => {
          S.data.stageSnapshots[game.stage.id] = null;
          R.reset(); W.load(game.stage, null); A.sfx('whoosh'); PT.FX.sparkleRain(1200);
          buildItems(); game.saveStage();
        });
        break;
      case 'confirm-yes': overlay('ov-confirm', false); A.sfx('ui'); if (confirmCb) confirmCb(); confirmCb = null; break;
      case 'confirm-no': overlay('ov-confirm', false); A.sfx('back'); confirmCb = null; break;
      case 'to-title': overlay('ov-parent', false); game.paused = false; if (game.screen === 'play') { game.saveStage(); game.stage = null; } game.show('title'); break;
      case 'wipe':
        overlay('ov-parent', false);
        game.confirm('はっけんの きろくと ごほうびを ぜんぶ けしますか？（もとに もどせません）', 'album', () => {
          game.confirm('ほんとうに けしますか？', 'album', () => { S.wipe(); game.applySettings(); if (game.screen === 'play') { game.refreshPanel(); } if (game.screen === 'map') buildMap(); toast('けしました', 'きろくを リセット', ['star']); });
        });
        break;
      case 'dismiss-rotate': game.rotateOk = true; $('#rotate').classList.remove('show'); break;
      default: break;
    }
  });

  /* ---------- 描画ループ ---------- */
  let last = performance.now();
  game.frame = (now) => {
    const dt = Math.min(50, now - last); last = now;
    if (game.screen === 'play' && game.stage) {
      game.layout();
      if (!game.paused) W.update(dt);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W.render(ctx, vw, vh);
      // ずっと なにもしないときは ヒントボタンが そっと ゆれる
      const idleFor = W.t - Math.max(game.lastAct, game.odaiAt || 0);
      $('.hint-btn').classList.toggle('pulse', idleFor > 30000 || hintIds.length > 0);
    }
    if (game.screen === 'title' && PT.titleFrame) PT.titleFrame(dt);
    requestAnimationFrame(game.frame);
  };
})();
