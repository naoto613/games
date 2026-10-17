/* がめん・パネル・ゆびの そうさ */
'use strict';
(() => {
  const E = PT.E, P = PT.play, S = PT.save, A = PT.audio, T = PT.TILE;
  const $ = (q) => document.querySelector(q), $$ = (q) => [...document.querySelectorAll(q)];
  const U = (PT.ui = { screen: 'title', tab: 'rooms', mode: 'house', zoomRows: 8, panDir: 0, panY: 0 });
  const H = PT.house;
  const isHouse = () => E.mode === 'house';

  /* ---------- オプション ---------- */
  const applyOpts = () => { const o = S.data.opts; A.bgmOn = o.bgm; A.sfxOn = o.sfx; A.volume = o.vol; A.apply(); $$('[data-act="bgm"]').forEach((b) => { b.classList.toggle('off', !o.bgm); b.querySelector('.ico').className = 'ico ' + (o.bgm ? 'ico-music' : 'ico-musicoff'); }); };
  applyOpts();

  /* ---------- がめん きりかえ ---------- */
  const show = (id) => { $$('.screen').forEach((s) => s.classList.toggle('on', s.id === 'scr-' + id)); U.screen = id; if (id === 'title' || id === 'worlds' || id === 'modes') A.playBgm('title'); };

  /* ---------- アイコン ---------- */
  const icon = (spec, size = 96) => {
    if (spec.b) return PT.blockIcon(spec.b, size);
    if (spec.s) return PT.stampIcon(spec.s, size);
    if (spec.c) return PT.charIcon(spec.c, size);
    if (spec.r) return H.icon('room', spec.r, size);
    for (const k of ['roof', 'wall', 'win', 'door', 'deco']) if (spec[k]) return H.icon(k, spec[k], size);
    return itemIcon(spec.i, size);
  };
  const itemIcon = (id, size = 96) => {
    const it = PT.ITEMS[id]; const cv = document.createElement('canvas');
    const dpr = Math.min(3, Math.max(2, window.devicePixelRatio || 1)); cv.width = cv.height = Math.round(size * dpr);
    const c = cv.getContext('2d'); c.scale(dpr, dpr);
    const k = (size * 0.82) / Math.max(it.w, it.h); c.translate(size / 2, size / 2 + (it.h * k) / 2); c.scale(k, k);
    try { it.draw(c, 300, {}); } catch (e) { /* */ }
    return cv;
  };
  const iconCache = new Map();
  const cachedIcon = (key, spec, size) => { if (!iconCache.has(key)) iconCache.set(key, icon(spec, size)); const src = iconCache.get(key); const cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height; cv.getContext('2d').drawImage(src, 0, 0); return cv; };

  /* ---------- タイトル ---------- */
  const tcv = $('#title-cv'), tc = tcv.getContext('2d');
  const titleChars = ['lulu', 'mimi', 'pyoko', 'futan', 'pon'].map((cid, i) => ({ def: PT.CHARS[cid], cid, x: 0, y: 0, pose: i % 2 ? 'wave' : 'cheer', poseT: 0, face: 'happy', wear: i === 1 ? { hat: 'tiara_rainbow' } : i === 3 ? { body: 'gown_strawberry' } : {}, seed: i * 1.7, scale: 1, look: 0 }));
  const drawTitle = (t) => {
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = tcv.clientWidth, h = tcv.clientHeight;
    if (tcv.width !== Math.round(w * dpr)) { tcv.width = Math.round(w * dpr); tcv.height = Math.round(h * dpr); }
    tc.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = tc.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8fd3ff'); g.addColorStop(1, '#eaf8ff'); tc.fillStyle = g; tc.fillRect(0, 0, w, h);
    const s = Math.max(0.4, Math.min(0.85, h / 1000)), ts = T * s, px = Math.round(ts * dpr);
    tc.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 5; i++) { const x = ((i * 300 + t * 0.012) % (w + 300)) - 150, y = 60 + (i % 3) * 50; PT.G.ell(tc, x, y, 60, 18); tc.fill(); PT.G.circ(tc, x + 14, y - 14, 24); tc.fill(); }
    tc.fillStyle = '#a8dc8f'; tc.beginPath(); tc.moveTo(0, h); for (let x = 0; x <= w; x += 20) tc.lineTo(x, h - ts * 2.6 - Math.sin(x * 0.006) * 30 * s); tc.lineTo(w, h); tc.fill();
    const rows = 2, cols = Math.ceil(w / ts) + 1, gy = h - ts * rows;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const b = PT.BLOCK[y ? 'dirt' : 'grass']; tc.fillStyle = PT.shade(b.col, -0.3); tc.fillRect(x * ts, gy + y * ts, ts, ts); tc.drawImage(PT.tileImg(b, y ? 0 : 'top', px), x * ts, gy + y * ts, ts, ts); }
    // スタンプの いえ と き
    const stampAt = (sid, cx) => { const st = PT.STAMPS[sid]; st.rows.forEach((row, y) => [...row].forEach((ch, x) => { const code = PT.stampCell(ch); if (code <= 0) return; const b = PT.BLOCKS[code]; let v = b.variants ? b.variants[0] : (x + y) % 3; if (b.door) v = st.rows[y + 1] && st.rows[y + 1][x] === ch ? 'top' : 'bottom'; tc.drawImage(PT.tileImg(b, v, px), (cx - (st.w >> 1) + x) * ts, gy - (st.h - y) * ts, ts, ts); })); };
    stampAt('tree', 2); stampAt('house', Math.floor(cols - 5)); stampAt('tree', cols - 1);
    const n = Math.floor(t / 260) % 12, bx = Math.floor(cols / 2) - 3; for (let k = 0; k < Math.min(n, 6); k++) { const b = PT.BLOCK[['heart', 'star', 'rainbow', 'candy', 'gem', 'note'][k]]; tc.drawImage(PT.tileImg(b, 0, px), (bx + k) * ts, gy - ts, ts, ts); }
    titleChars.forEach((ch, i) => { ch.x = w * (0.16 + i * 0.15); ch.y = gy - Math.abs(Math.sin(t * 0.004 + i)) * 8 * s; ch.scale = 0.62 * s; ch.poseT = t; ch.flip = i > 2; PT.drawChar(tc, ch, t); });
  };

  /* ---------- せかい えらび ---------- */
  const thumb = (wid) => {
    const wd = PT.WORLDS[wid]; const saved = S.data.worlds[wid];
    const cv = document.createElement('canvas'); const W = 320, H = 180; cv.width = W * 2; cv.height = H * 2;
    const c = cv.getContext('2d'); c.scale(2, 2);
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, wd.sky[0]); g.addColorStop(1, wd.sky[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
    let grid; if (saved && saved.g) { grid = new Uint8Array(saved.g.length); for (let i = 0; i < grid.length; i++) grid[i] = saved.g.charCodeAt(i) - 48; } else grid = wd.gen();
    const cell = 10, cx0 = Math.max(0, Math.min(PT.COLS - Math.ceil(W / cell), Math.floor(((saved && saved.cam ? saved.cam.x / T : wd.chars[0][1] - 16)))));
    const cy0 = Math.max(0, Math.min(PT.ROWS - 18, PT.surfRow(grid, cx0 + 16) - 11));
    for (let y = cy0; y < PT.ROWS; y++) for (let x = cx0; x < cx0 + Math.ceil(W / cell) + 1; x++) { const b = PT.BLOCKS[grid[y * PT.COLS + x]]; if (!b) continue; c.fillStyle = b.id === 'grass' && !(PT.BLOCKS[grid[(y - 1) * PT.COLS + x]] || {}).solid ? '#6ab45a' : b.col; c.fillRect((x - cx0) * cell, (y - cy0) * cell, cell - 1, cell - 1); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect((x - cx0) * cell, (y - cy0) * cell, cell - 1, 2); }
    return cv;
  };
  const houseThumb = (lot) => {
    const wd = PT.WORLDS[lot], d = S.data.houses[lot];
    const cv = document.createElement('canvas'); const W = 320, Hh = 180; cv.width = W * 2; cv.height = Hh * 2;
    const c = cv.getContext('2d'); c.scale(2, 2);
    const g = c.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, wd.sky[0]); g.addColorStop(1, wd.sky[1]); c.fillStyle = g; c.fillRect(0, 0, W, Hh);
    const keepS = H.state, keepL = H.lot, keepN = E.nightK;
    H.state = d && d.h ? d.h : H.fresh(); H.lot = lot; E.nightK = 0;
    let top = 0; for (let k = 0; k < H.NC; k++) top = Math.max(top, H.topOf(k));
    const x0 = (H.X0 - 4) * T, x1 = (H.X0 + 19) * T, yb = (H.GR + 1.2) * T, yt = (H.GR - (top + 1) * 5) * T - 320;
    const sc = Math.min(W / (x1 - x0), Hh / (yb - yt));
    c.save(); c.translate(W / 2 - ((x0 + x1) / 2) * sc, Hh - yb * sc); c.scale(sc, sc);
    PT.SHADE = false; try { H.drawYard(c, 0); H.drawHouse(c, 300); } catch (e) { console.error(e); } PT.SHADE = true;
    (d && d.ents ? d.ents : []).forEach((en) => { try { if (en.k === 'c') { const D = PT.CHARS[en.cid]; if (D) PT.drawChar(c, { def: D, cid: en.cid, x: en.x, y: en.y, pose: 'idle', poseT: 0, face: 'happy', wear: en.wear || {}, seed: 1, scale: PT.CS, look: 0 }, 300); } else { const it = PT.ITEMS[en.type]; if (it) { c.save(); c.translate(en.x, en.y); c.scale(PT.CS, PT.CS); it.draw(c, 300, {}); c.restore(); } } } catch (e) { /* */ } });
    c.restore();
    H.state = keepS; H.lot = keepL; E.nightK = keepN;
    return cv;
  };
  const buildWorlds = () => {
    const grid = $('#world-grid'); grid.innerHTML = '';
    const hm = U.mode === 'house';
    $('#worlds-title').textContent = hm ? 'どこに たてる？' : 'どこで つくる？';
    (hm ? H.LOTS : PT.WORLD_LIST).forEach((wid) => {
      const wd = PT.WORLDS[wid]; const saved = !!(hm ? S.data.houses[wid] : S.data.worlds[wid]);
      const card = document.createElement('button'); card.className = 'stage-card world-card';
      card.appendChild(hm ? houseThumb(wid) : thumb(wid));
      card.insertAdjacentHTML('beforeend', `<span class="sc-name"><span class="sc-num" style="background:${wd.color}">${wd.num}</span>${wd.name}${hm ? 'の おうち' : ''}</span>${saved ? '<span class="sc-found">つづきから</span>' : ''}`);
      card.addEventListener('click', () => { A.init(); A.sfx('ui'); enter(wid); });
      if (saved) {
        const rb = document.createElement('span'); rb.className = 'reset-chip'; rb.textContent = 'さいしょから';
        rb.addEventListener('click', (ev) => { ev.stopPropagation(); A.sfx('ui'); confirmBox(`「${wd.name}」を さいしょから にする？`, cachedIcon('w-' + wid, { s: 'house' }, 90), () => { if (hm) delete S.data.houses[wid]; else delete S.data.worlds[wid]; S.write(); buildWorlds(); }); });
        card.appendChild(rb);
      }
      grid.appendChild(card);
    });
  };

  /* ---------- あそぶ がめん ---------- */
  const cv = $('#game'), ctx = cv.getContext('2d');
  const layout = () => {
    const dpr = Math.min(2.5, window.devicePixelRatio || 1), w = innerWidth, h = innerHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const panelH = Math.round(Math.max(118, Math.min(176, h * 0.24)));
    document.documentElement.style.setProperty('--panel-h', panelH + 'px');
    const old = E.view.w ? E.toWorld(E.view.w / 2, (E.view.h - E.view.panel) / 2) : null;
    E.view = { w, h, panel: panelH, dpr };
    if (isHouse() && U.screen === 'play' && H.state && E.bounds) { E.clampCam(); H.fit(true); return; }
    if (!U.zoomSet) { const avail = h - panelH; U.zoomRows = PT.clamp(Math.round(avail / 56), 6, 12); }
    E.cam.s = (h - panelH) / (U.zoomRows * T);
    if (old) { E.cam.x = old.x - w / E.cam.s / 2; E.cam.y = old.y - (h - panelH) / E.cam.s / 2; }
    E.clampCam();
  };
  const zoomTo = (rows, fx, fy) => {
    if (isHouse()) { H.cam = null; rows = PT.clamp(rows, 4, 40); } else { rows = PT.clamp(rows, 4, 16); U.zoomSet = true; }
    U.zoomRows = rows;
    const cx = fx ?? E.view.w / 2, cy = fy ?? (E.view.h - E.view.panel) / 2;
    const wpt = E.toWorld(cx, cy);
    E.cam.s = (E.view.h - E.view.panel) / (rows * T);
    E.cam.x = wpt.x - cx / E.cam.s; E.cam.y = wpt.y - cy / E.cam.s; E.clampCam();
  };

  const enter = (wid) => {
    const wd = PT.WORLDS[wid];
    show('play'); E.mode = U.mode; layout();
    $('#scr-play').classList.toggle('house', U.mode === 'house');
    if (U.mode === 'house') { H.enter(wid); U.zoomRows = (E.view.h - E.view.panel) / (E.cam.s * T); }
    else E.load(wd, S.data.worlds[wid]);
    P.undo = []; U.refreshUndo();
    $('#world-name').textContent = wd.name + (U.mode === 'house' ? 'の おうち' : '');
    const wi = $('#world-icon'); wi.innerHTML = ''; wi.style.background = wd.color; wi.appendChild(cachedIcon('wi-' + wid, { b: { meadow: 'grass', beach: 'sand', snow: 'snow', candy: 'candy', sky: 'cloud', flat: 'plank' }[wid] }, 36));
    A.playBgm(wd.bgm);
    setNightBtn(); setWalkBtn();
    U.tab = U.mode === 'house' ? 'rooms' : 'nature'; buildTabs(); buildItems();
    if (U.mode === 'house') { setTool('hand', true); if (!S.data.tutH) showTut('したの へやを タップすると<br>おうちが おおきく なるよ！'); }
    else { setTool(P.tool === 'break' ? 'break' : 'place', true); if (!S.data.tut) showTut('したの ブロックを えらんで<br>ゆびで なぞってね！'); }
  };
  const leave = () => { S.saveWorld(); E.preview = null; show('worlds'); buildWorlds(); };

  /* チュートリアル */
  const showTut = (html) => { $('#tut-text').innerHTML = html; $('#tutorial').classList.remove('hidden'); };
  const hideTut = () => { const k = isHouse() ? 'tutH' : 'tut'; if (!S.data[k]) { S.data[k] = true; S.write(); } $('#tutorial').classList.add('hidden'); };

  /* ---------- パネル ---------- */
  const HTABS = [
    { id: 'rooms', name: 'へや', ic: { r: 'kids' } },
    { id: 'roof', name: 'やね', ic: { roof: 'red' } },
    { id: 'wall', name: 'かべの いろ', ic: { wall: 'pink' } },
    { id: 'windoor', name: 'まど・ドア', ic: { win: 'heart' } },
    { id: 'deco', name: 'かざり', ic: { deco: 'startop' } },
    { id: 'garden', name: 'にわ', ic: { i: 'gtree' } },
    { id: 'home', name: 'かぐ', ic: { i: 'bed' } },
    { id: 'friends', name: 'なかま', ic: { c: 'lulu' } },
    { id: 'items', name: 'どうぐ', ic: { i: 'strawberry' } },
    { id: 'dress', name: 'へんしん', ic: { i: 'crown' } },
  ];
  const TABS = [
    { id: 'nature', name: 'しぜん', ic: { b: 'grass' } },
    { id: 'build', name: 'たてもの', ic: { b: 'brick' } },
    { id: 'cute', name: 'かわいい', ic: { b: 'heart' } },
    { id: 'trick', name: 'しかけ', ic: { b: 'bounce' } },
    { id: 'stamp', name: 'ポン！', ic: { s: 'house' } },
    { id: 'friends', name: 'なかま', ic: { c: 'lulu' } },
    { id: 'home', name: 'かぐ', ic: { i: 'bed' } },
    { id: 'items', name: 'どうぐ', ic: { i: 'strawberry' } },
    { id: 'dress', name: 'へんしん', ic: { i: 'crown' } },
  ];
  const itemsFor = (tab) => {
    if (tab === 'rooms') return H.ROOM_LIST.map((r) => ({ key: 'r-' + r, r }));
    if (tab === 'roof') return H.ROOF_LIST.map((x) => ({ key: 'roof-' + x, roof: x }));
    if (tab === 'wall') return H.WALL_LIST.map((x) => ({ key: 'wall-' + x, wall: x }));
    if (tab === 'windoor') return H.WIN_LIST.map((x) => ({ key: 'win-' + x, win: x })).concat(H.DOOR_LIST.map((x) => ({ key: 'door-' + x, door: x })));
    if (tab === 'deco') return H.DECO_LIST.map((x) => ({ key: 'deco-' + x, deco: x }));
    if (tab === 'garden') return PT.GARDEN_ITEMS.filter((i) => PT.ITEMS[i]).map((i) => ({ key: 'i-' + i, i }));
    if (PT.BLOCK_CATS[tab]) return PT.BLOCK_CATS[tab].map((b) => ({ key: 'b-' + b, b }));
    if (tab === 'stamp') return PT.STAMP_LIST.map((s) => ({ key: 's-' + s, s }));
    if (tab === 'friends') return PT.CHAR_IDS.map((c) => ({ key: 'c-' + c, c }));
    if (tab === 'home') return PT.HOME_ITEMS.filter((i) => PT.ITEMS[i]).map((i) => ({ key: 'i-' + i, i }));
    if (tab === 'dress') return (PT.ROYAL_FAVS || []).concat(Object.values(PT.ITEMS).filter((i) => i.cat === 'dress' && !i.lock).map((i) => i.id)).filter((v, k, a) => PT.ITEMS[v] && PT.ITEMS[v].wear && a.indexOf(v) === k).map((i) => ({ key: 'i-' + i, i }));
    const all = Object.values(PT.ITEMS).filter((i) => !i.lock && (i.cat === 'food' || i.cat === 'tools' || i.cat === 'rides' || i.cat === 'magic') && !PT.HOME_ITEMS.includes(i.id)).sort((a, b) => ['food', 'rides', 'tools', 'magic'].indexOf(a.cat) - ['food', 'rides', 'tools', 'magic'].indexOf(b.cat));
    return all.map((i) => ({ key: 'i-' + i.id, i: i.id }));
  };
  const buildTabs = () => {
    const el = $('#tabs'); el.innerHTML = '';
    (isHouse() ? HTABS : TABS).forEach((tb) => {
      const b = document.createElement('button'); b.className = 'tab' + (U.tab === tb.id ? ' on' : '');
      b.appendChild(cachedIcon('tab-' + tb.id, tb.ic, 26)); b.insertAdjacentHTML('beforeend', `<span>${tb.name}</span>`);
      b.addEventListener('click', () => { A.sfx('tap'); U.tab = tb.id; buildTabs(); buildItems(); });
      el.appendChild(b);
    });
  };
  const buildItems = () => {
    const el = $('#items'); el.innerHTML = ''; el.scrollLeft = 0;
    itemsFor(U.tab).forEach((spec) => {
      const b = document.createElement('div'); b.className = 'item'; b.dataset.key = spec.key;
      b.appendChild(cachedIcon(spec.key, spec, 96));
      if (spec.b) b.insertAdjacentHTML('beforeend', `<small class="nm">${PT.BLOCK[spec.b].name}</small>`);
      if (spec.s) b.insertAdjacentHTML('beforeend', `<small class="nm">${PT.STAMPS[spec.s].name}</small>`);
      const nm = spec.r ? H.ROOMS[spec.r].name : spec.roof ? H.ROOFS[spec.roof].name : spec.wall ? H.WALLS[spec.wall].name : spec.win ? H.WINS[spec.win].name : spec.door ? H.DOORS[spec.door].name : spec.deco ? H.DECO[spec.deco] : null;
      if (nm) b.insertAdjacentHTML('beforeend', `<small class="nm">${nm}</small>`);
      if (spec.r) b.classList.add('room');
      bindItem(b, spec);
      el.appendChild(b);
    });
    markItems();
  };
  const markItems = () => {
    $$('#items .item').forEach((b) => {
      const k = b.dataset.key;
      const hs = isHouse() && H.state;
      b.classList.toggle('sel', hs ? (k === 'roof-' + hs.roof || k === 'wall-' + hs.wall || k === 'win-' + hs.win || k === 'door-' + hs.door || (k.startsWith('deco-') && !!hs.deco[k.slice(5)])) : ((P.tool === 'place' && !P.stamp && k === 'b-' + P.block) || (P.stamp && k === 's-' + P.stamp)));
      b.classList.toggle('present', k.startsWith('c-') && E.chars().some((c) => 'c-' + c.cid === k));
    });
  };
  U.markItems = markItems;

  /* パネルの アイテムを タップ／ドラッグ */
  const ghost = $('#drag-ghost'), panel = $('#panel');
  let pdrag = null;
  const bindItem = (el, spec) => {
    el.addEventListener('pointerdown', (ev) => {
      A.init();
      pdrag = { el, spec, id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, on: false };
    });
  };
  const startGhost = (spec, x, y) => {
    ghost.innerHTML = ''; ghost.appendChild(cachedIcon(spec.key || ('k' + JSON.stringify(spec)), spec, 110)); ghost.classList.remove('hidden');
    moveGhost(x, y); panel.classList.add('dragging');
  };
  const moveGhost = (x, y) => { ghost.style.transform = `translate(${x - 55}px, ${y - 55}px)`; };
  const overPanel = (y) => y > innerHeight - E.view.panel;
  window.addEventListener('pointermove', (ev) => {
    if (!pdrag || ev.pointerId !== pdrag.id) return;
    const dx = ev.clientX - pdrag.x0, dy = ev.clientY - pdrag.y0;
    if (!pdrag.on) {
      if ((pdrag.spec.c || pdrag.spec.i || pdrag.spec.r) && dy < -14 && Math.abs(dy) > Math.abs(dx)) { pdrag.on = true; startGhost(pdrag.spec, ev.clientX, ev.clientY); A.sfx('pick'); if (pdrag.spec.r) U.draggingRoom = true; hideTutLater(); }
      else if (Math.abs(dx) > 12) { pdrag = null; }
      return;
    }
    moveGhost(ev.clientX, ev.clientY); panel.classList.toggle('over', overPanel(ev.clientY));
    U.edge(ev.clientX, ev.clientY);
  });
  const endPanel = (ev) => {
    if (!pdrag || ev.pointerId !== pdrag.id) return;
    const d = pdrag; pdrag = null; U.panDir = 0; U.panY = 0; U.draggingRoom = false;
    if (!d.on) { if (ev.type === 'pointerup') tapItem(d.spec); return; }
    ghost.classList.add('hidden'); panel.classList.remove('dragging', 'over');
    if (overPanel(ev.clientY)) return;
    const w = E.toWorld(ev.clientX, ev.clientY);
    if (d.spec.r) { H.dropRoom(d.spec.r, w.x, w.y); hideTutLater(); return; }
    spawn(d.spec, w.x, w.y);
  };
  window.addEventListener('pointerup', endPanel); window.addEventListener('pointercancel', endPanel);

  const spawn = (spec, wx, wy) => {
    let e;
    if (spec.c) {
      e = E.chars().find((c) => c.cid === spec.c);
      if (e) { E.unsit(e); e.x = wx; e.y = wy + e.H * 0.5; e.vy = 0; E.puff(e.x, e.y - 40, 6); }
      else { e = E.addChar(spec.c, wx, 0); e.y = wy + e.H * 0.5; P.push({ cells: [], ents: [e] }); }
      A.voice(e.def.voice, 'yay'); P.say(e, PT.pick(['やっほー！', 'なにする？', 'きたよ！']), 1400);
    } else {
      e = E.addProp(spec.i, wx, 0); e.y = wy + e.H * 0.5; P.push({ cells: [], ents: [e] });
      const props = E.props(); if (!isHouse() && props.length > 40) { const old = props[0]; E.puff(old.x, old.y - 30, 6); E.remove(old); }
    }
    E.pushOut(); P.dropEnt(e); markItems(); S.soon();
  };
  const tapItem = (spec) => {
    A.sfx('tap');
    if (spec.r) { H.addRoom(spec.r); hideTutLater(); return; }
    for (const k of ['roof', 'wall', 'win', 'door']) if (spec[k]) { H.setPart(k, spec[k]); return; }
    if (spec.deco) { H.toggleDeco(spec.deco); return; }
    if (spec.b) { P.block = spec.b; P.stamp = null; setTool('place'); }
    else if (spec.s) { P.stamp = spec.s; setTool('place'); }
    else { const c = E.toWorld(E.view.w / 2 + PT.rand(-80, 80), 90); spawn(spec, c.x, c.y); hideTutLater(); }
    markItems();
  };

  /* ---------- どうぐ（さわる・おく・こわす） ---------- */
  const setTool = (t, quiet) => {
    P.tool = t; $$('.tool[data-tool]').forEach((b) => b.classList.toggle('on', b.dataset.tool === t));
    const tb = $('#tool-block'); tb.innerHTML = '';
    tb.appendChild(P.stamp ? cachedIcon('s-' + P.stamp, { s: P.stamp }, 96) : cachedIcon('b-' + P.block, { b: P.block }, 96));
    $('.tool[data-tool="place"] small').textContent = P.stamp ? 'ポン！' : 'おく';
    if (t !== 'place') E.preview = null;
    if (!quiet) A.sfx('ui');
    markItems();
  };
  $$('.tool[data-tool]').forEach((b) => b.addEventListener('click', () => { A.init(); if (b.dataset.tool === 'place' && P.tool === 'place' && P.stamp) { P.stamp = null; } setTool(b.dataset.tool); }));
  U.refreshUndo = () => { $('.tool.undo').classList.toggle('dim', !P.undo.length); };
  P.onChange = U.refreshUndo;

  /* ---------- ゆびの そうさ（せかい） ---------- */
  const ptrs = new Map();
  let g = null;   // いまの ジェスチャー
  let tutTimer = 0;
  const hideTutLater = () => { clearTimeout(tutTimer); tutTimer = setTimeout(hideTut, 600); };
  const pos = (ev) => { const r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; };
  const endStroke = () => { if (g && g.rec && g.rec.length) { P.push({ cells: g.rec, ents: [] }); S.soon(); } };
  cv.addEventListener('pointerdown', (ev) => {
    A.init(); cv.setPointerCapture(ev.pointerId);
    const p = pos(ev); ptrs.set(ev.pointerId, p);
    if (ptrs.size === 2) {
      endStroke(); if (g && g.ent) { g.ent.held = false; }
      const [a, b] = [...ptrs.values()];
      g = { kind: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y), rows0: U.zoomRows, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, cam: { ...E.cam } };
      E.preview = null; return;
    }
    if (ptrs.size > 2) return;
    const w = E.toWorld(p.x, p.y);
    const [cx, cy] = E.cellOf(w.x, w.y);
    g = { kind: null, x0: p.x, y0: p.y, moved: false, cell: [cx, cy], last: [cx, cy] };
    H.cam = null;
    if (isHouse()) {
      const hit = E.hitEnt(w.x, w.y);
      if (hit) { g.kind = 'ent'; g.ent = hit; g.off = { x: hit.x - w.x, y: hit.y - w.y }; return; }
      g.kind = 'pan'; g.cam = { ...E.cam }; g.w = w; return;
    }
    if (P.tool === 'place' && P.stamp) { g.kind = 'stamp'; E.preview = { stamp: P.stamp, x: cx, y: cy }; return; }
    const hit = E.hitEnt(w.x, w.y);
    if (hit) { g.kind = 'ent'; g.ent = hit; g.off = { x: hit.x - w.x, y: hit.y - w.y }; return; }
    if (P.tool === 'place') { g.kind = 'paint'; g.rec = []; if (!E.blk(cx, cy) || E.blk(cx, cy).liquid || E.blk(cx, cy).deco) { if (P.placeAt(cx, cy, g.rec)) hideTutLater(); } }
    else if (P.tool === 'break') { g.kind = 'erase'; g.rec = []; P.breakAt(cx, cy, g.rec); }
    else { g.kind = 'pan'; g.cam = { ...E.cam }; }
  });
  cv.addEventListener('pointermove', (ev) => {
    if (!ptrs.has(ev.pointerId)) {
      if (ev.pointerType === 'mouse' && P.tool === 'place' && !g) { const w = E.toWorld(pos(ev).x, pos(ev).y); const [cx, cy] = E.cellOf(w.x, w.y); E.preview = P.stamp ? { stamp: P.stamp, x: cx, y: cy } : { x: cx, y: cy }; }
      return;
    }
    const p = pos(ev); ptrs.set(ev.pointerId, p);
    if (!g) return;
    if (g.kind === 'pinch') {
      const [a, b] = [...ptrs.values()]; if (!b) return;
      const d = Math.hypot(a.x - b.x, a.y - b.y), mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      E.cam = { ...g.cam }; zoomTo(g.rows0 * g.d0 / Math.max(20, d), g.mid.x, g.mid.y);
      E.cam.x -= (mid.x - g.mid.x) / E.cam.s; E.cam.y -= (mid.y - g.mid.y) / E.cam.s; E.clampCam();
      return;
    }
    if (Math.hypot(p.x - g.x0, p.y - g.y0) > 10) g.moved = true;
    const w = E.toWorld(p.x, p.y);
    const [cx, cy] = E.cellOf(w.x, w.y);
    if (g.kind === 'stamp') { E.preview = { stamp: P.stamp, x: cx, y: cy }; U.edge(ev.clientX, ev.clientY); return; }
    if (g.kind === 'ent') {
      if (!g.moved) return;
      const e = g.ent;
      if (!e.held) { e.held = true; if (e.kind === 'char') { E.unsit(e); e.climbing = false; e.vx = 0; e.pose = 'hold'; } A.sfx('pick'); panel.classList.add('dragging'); }
      e.x = w.x + g.off.x; e.y = w.y + g.off.y; e.vy = 0;
      panel.classList.toggle('over', overPanel(ev.clientY));
      U.edge(ev.clientX, ev.clientY);
      return;
    }
    if (g.kind === 'paint' || g.kind === 'erase') {
      if (cx === g.last[0] && cy === g.last[1]) return;
      P.line(g.last[0], g.last[1], cx, cy, (x, y) => { if (g.kind === 'paint') { if (P.placeAt(x, y, g.rec)) hideTutLater(); } else P.breakAt(x, y, g.rec); });
      g.last = [cx, cy];
      U.edge(ev.clientX, ev.clientY);
      return;
    }
    if (g.kind === 'pan') { E.cam.x = g.cam.x - (p.x - g.x0) / E.cam.s; E.cam.y = g.cam.y - (p.y - g.y0) / E.cam.s; E.clampCam(); }
  });
  const up = (ev) => {
    if (!ptrs.has(ev.pointerId)) return;
    ptrs.delete(ev.pointerId);
    U.panDir = 0; U.panY = 0;
    if (!g) return;
    if (g.kind === 'pinch') { if (ptrs.size === 0) g = null; else g = { kind: 'none' }; return; }
    const cancel = ev.type === 'pointercancel';
    if (g.kind === 'stamp') { if (!cancel && E.preview) P.stampAt(P.stamp, E.preview.x, E.preview.y); E.preview = null; hideTutLater(); }
    else if (g.kind === 'ent') {
      const e = g.ent;
      panel.classList.remove('dragging', 'over');
      if (!g.moved) {
        if (e.kind === 'char') P.tapChar(e);
        else if (P.tool === 'break') { E.puff(e.x, e.y - 30, 8); A.sfx('trash'); E.remove(e); S.soon(); }
        else { e.wobble = E.t + 500; A.sfx('tap'); }
      } else {
        e.held = false;
        if (overPanel(ev.clientY)) { E.puff(e.x, e.y - 40, 8); A.sfx('trash'); E.remove(e); markItems(); }
        else { E.pushOut(); P.dropEnt(e); }
        S.soon();
      }
    } else if (g.kind === 'paint' || g.kind === 'erase' || g.kind === 'pan') {
      if (g.kind !== 'pan') endStroke();
      if (isHouse()) { if (!g.moved) { if (P.tool === 'break') H.removeAt(g.w.x, g.w.y); else H.tapRoom(g.w.x, g.w.y); } }
      else if (!g.moved && !(g.rec && g.rec.length)) P.tapBlock(g.cell[0], g.cell[1]);
      if (g.kind === 'pan') S.soon();
    }
    g = null;
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', (ev) => { ev.preventDefault(); const p = pos(ev); zoomTo(U.zoomRows * (ev.deltaY > 0 ? 1.1 : 0.9), p.x, p.y); }, { passive: false });
  cv.addEventListener('pointerleave', (ev) => { if (ev.pointerType === 'mouse' && !ptrs.size && !(P.stamp && g)) E.preview = null; });

  /* はしっこで じどうで うごく */
  U.edge = (x, y) => {
    const w = innerWidth, top = 70, bot = innerHeight - E.view.panel - 10;
    U.panDir = x < 46 ? -1 : x > w - 46 ? 1 : 0;
    U.panY = y < top ? -1 : y > bot - 30 && y < bot + 5 ? 1 : 0;
  };
  /* やじるし ボタン */
  $$('[data-pan]').forEach((b) => {
    const d = +b.dataset.pan; let held = false;
    b.addEventListener('pointerdown', (ev) => { ev.preventDefault(); held = true; U.btnPan = d; A.sfx('tap'); });
    const stop = () => { held = false; U.btnPan = 0; };
    b.addEventListener('pointerup', stop); b.addEventListener('pointerleave', stop); b.addEventListener('pointercancel', stop);
  });
  U.tickPan = (dt) => {
    const d = U.btnPan || U.panDir; const dy = U.panY;
    if (!d && !dy) return;
    E.cam.x += (d * 0.75 * dt) / E.cam.s; E.cam.y += (dy * 0.5 * dt) / E.cam.s; E.clampCam();
    // ひっぱって いる ものも いっしょに
    if (g && g.ent && g.ent.held) { const last = [...ptrs.values()][0]; if (last) { const w = E.toWorld(last.x, last.y); g.ent.x = w.x + g.off.x; g.ent.y = w.y + g.off.y; } }
    if (g && (g.kind === 'paint' || g.kind === 'erase')) { const last = [...ptrs.values()][0]; if (last) { const w = E.toWorld(last.x, last.y); const [cx, cy] = E.cellOf(w.x, w.y); if (cx !== g.last[0] || cy !== g.last[1]) { P.line(g.last[0], g.last[1], cx, cy, (x, y) => (g.kind === 'paint' ? P.placeAt(x, y, g.rec) : P.breakAt(x, y, g.rec))); g.last = [cx, cy]; } } }
  };

  /* ---------- ボタン ---------- */
  const setNightBtn = () => { const b = $('#btn-night'); b.querySelector('.ico').className = 'ico ' + (E.night ? 'ico-moon' : 'ico-sun'); b.classList.toggle('night', E.night); };
  const setWalkBtn = () => { $('#btn-walk').classList.toggle('on', E.walk); };
  let confirmFn = null;
  const confirmBox = (txt, iconCv, fn) => { $('#confirm-text').textContent = txt; const ic = $('#confirm-icon'); ic.innerHTML = ''; if (iconCv) ic.appendChild(iconCv); confirmFn = fn; $('#ov-confirm').classList.add('on'); };
  const ACT = {
    start: () => { A.init(); show('modes'); },
    'mode-house': () => { U.mode = 'house'; show('worlds'); buildWorlds(); },
    'mode-block': () => { U.mode = 'block'; show('worlds'); buildWorlds(); },
    'back-modes': () => show('modes'),
    'back-title': () => show('title'),
    'back-worlds': leave,
    undo: () => P.doUndo(),
    night: () => { E.night = !E.night; setNightBtn(); A.sfx(E.night ? 'ghost' : 'ding'); if (E.night) { E.chars().forEach((c) => { if (!c.sitOn) { c.face = 'sleep'; c.faceUntil = E.t + 1200; } }); } S.soon(); },
    walk: () => { E.walk = !E.walk; setWalkBtn(); A.sfx(E.walk ? 'jingle' : 'tap'); if (E.walk) { P.found('walk'); E.chars().forEach((c) => { c.walkUntil = 0; c.restUntil = E.t + PT.rand(0, 900); }); } },
    bgm: () => { S.data.opts.bgm = !S.data.opts.bgm; S.write(); applyOpts(); },
    'zoom-in': () => { A.sfx('tap'); zoomTo(U.zoomRows / 1.25); },
    'zoom-out': () => { A.sfx('tap'); zoomTo(U.zoomRows * 1.25); },
    album: () => { A.sfx('ui'); openAlbum(); },
    'close-album': () => { $('#ov-album').classList.remove('on'); },
    'close-parent': () => { $('#ov-parent').classList.remove('on'); },
    'to-title': () => { $('#ov-parent').classList.remove('on'); if (U.screen === 'play') S.saveWorld(); show('title'); },
    wipe: () => confirmBox('つくった せかいと カードを ぜんぶ けしても いい？', null, () => { S.data.worlds = {}; S.data.ach = {}; S.data.placed = 0; S.write(); $('#ov-parent').classList.remove('on'); show('title'); }),
    'confirm-yes': () => { $('#ov-confirm').classList.remove('on'); A.sfx('ui'); if (confirmFn) confirmFn(); confirmFn = null; },
    'confirm-no': () => { $('#ov-confirm').classList.remove('on'); A.sfx('back'); confirmFn = null; },
    'dismiss-rotate': () => { $('#rotate').classList.remove('show'); U.noRotate = true; },
  };
  document.addEventListener('click', (ev) => { const b = ev.target.closest('[data-act]'); if (!b) return; A.init(); const f = ACT[b.dataset.act]; if (f) { if (!/undo|night|walk|zoom|confirm/.test(b.dataset.act)) A.sfx('ui'); f(); } });
  $$('[data-hold]').forEach((b) => {
    let t = 0;
    const start = (e) => { e.preventDefault(); A.init(); b.classList.add('holding'); t = setTimeout(() => { b.classList.remove('holding'); A.sfx('ui'); openParent(); }, 1200); };
    const stop = () => { clearTimeout(t); b.classList.remove('holding'); };
    b.addEventListener('pointerdown', start); b.addEventListener('pointerup', stop); b.addEventListener('pointerleave', stop); b.addEventListener('pointercancel', stop);
  });
  const openParent = () => {
    const o = S.data.opts; $('#vol').value = o.vol; $('#opt-bgm').checked = o.bgm; $('#opt-sfx').checked = o.sfx;
    $('#ov-parent').classList.add('on');
  };
  $('#vol').addEventListener('input', (e) => { S.data.opts.vol = +e.target.value; applyOpts(); S.write(); });
  $('#opt-bgm').addEventListener('change', (e) => { S.data.opts.bgm = e.target.checked; applyOpts(); S.write(); });
  $('#opt-sfx').addEventListener('change', (e) => { S.data.opts.sfx = e.target.checked; applyOpts(); S.write(); });

  /* ---------- はっけんカード ---------- */
  const openAlbum = () => {
    const grid = $('#album-grid'); grid.innerHTML = '';
    let n = 0;
    PT.ACH.forEach(([id, name, desc, ic]) => {
      const got = !!S.data.ach[id]; if (got) n++;
      const d = document.createElement('div'); d.className = 'acard' + (got ? '' : ' unk');
      if (got) { const a = document.createElement('div'); a.className = 'a-ic'; a.appendChild(cachedIcon('ach-' + id, ic, 60)); d.appendChild(a); d.insertAdjacentHTML('beforeend', `<b>${name}</b><small>${desc}</small>`); }
      else d.innerHTML = `<div class="q">？</div><b>？？？</b><small>${desc}</small>`;
      grid.appendChild(d);
    });
    $('#album-count').textContent = `${n} / ${PT.ACH.length}`;
    $('#album-badge').classList.add('hidden');
    $('#ov-album').classList.add('on');
  };
  PT.bus.on('ach', () => { $('#album-badge').classList.remove('hidden'); const b = $('#btn-album'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); });

  /* ---------- ループ ---------- */
  let last = performance.now(), saveAt = 0;
  const loop = (now) => {
    const dt = Math.min(50, now - last); last = now;
    if (U.screen === 'title') drawTitle(now);
    if (U.screen === 'play') {
      U.tickPan(dt); if (isHouse()) H.tickCam(dt);
      E.update(dt); P.tick();
      E.render(ctx);
      if (now > saveAt) { saveAt = now + 10000; S.saveWorld(); }
    }
    requestAnimationFrame(loop);
  };
  U.start = () => {
    addEventListener('resize', () => { if (U.screen === 'play') layout(); checkRotate(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && U.screen === 'play') S.saveWorld(); });
    addEventListener('pagehide', () => { if (U.screen === 'play') S.saveWorld(); });
    checkRotate();
    requestAnimationFrame(loop);
  };
  const checkRotate = () => { $('#rotate').classList.toggle('show', !U.noRotate && innerHeight > innerWidth && innerWidth < 700); };
  U.enter = enter; U.show = show;
})();
