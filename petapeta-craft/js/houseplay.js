/* おうちづくりの あそびかた：パーツを ドラッグで おいて くみたてる */
'use strict';
(() => {
  const H = PT.house, E = PT.E, P = PT.play, S = PT.save, A = PT.audio, T = PT.TILE;
  const { X0, GR, RH } = H;
  H.LOTS = ['meadow', 'beach', 'snow', 'candy', 'sky'];
  S.data.homes = S.data.homes || {};
  const clone = (o) => JSON.parse(JSON.stringify(o));

  PT.ACH.push(
    ['h_first', 'へやが ふえた！', 'へやを くっつけた', { room: 'kids' }],
    ['h_six', 'にぎやかな おうち', 'へやが 6つ', { room: 'living' }],
    ['h_tall', 'たかい おうち', '3かいだての おうち', { roof: 'blue' }],
    ['h_roof', 'やねを のせた', 'やねを のせかえた', { roof: 'mushroom' }],
    ['h_win', 'まどと ドア', 'まどや ドアを 4つ', { win: 'heart' }],
    ['h_set', 'かぐを ならべた', 'かぐセットを おいた', { set: 'kitchen' }],
    ['h_deco', 'かざりつけ', 'やねや かべの かざりを 4つ', { rdeco: 'lights' }],
    ['h_family', 'みんなで すもう', 'おうちの なかに 4にん', { c: 'futan' }],
  );

  /* ---------- はいる・ほぞん ---------- */
  const defaults = (lot) => {
    const L = (x) => x * T, list = [['gtree', L(X0 - 7)], ['mailbox', L(X0 - 2)], ['flowerbed', L(X0 + 8)], ['picket', L(X0 + 12)]];
    if (lot === 'beach') list[0] = ['parasol', L(X0 - 7)];
    if (lot === 'snow') list[2] = ['snowman', L(X0 + 8)];
    if (lot === 'candy') list[2] = ['icecream', L(X0 + 8)];
    return list;
  };
  H.enter = (lot) => {
    H.lot = lot;
    const wd = PT.WORLDS[lot];
    E.load(wd, { g: '', ents: [] });
    E.mode = 'house'; E.hook = { back: (c) => { H.drawYard(c); H.drawHouse(c, E.t); }, front: (c) => H.drawDrag(c, E.t), holes: H.holes };
    const d = S.data.homes[lot];
    H.state = d && d.h ? d.h : H.fresh();
    H.anim.clear(); H.preview = null;
    H.rebuild();
    if (d && d.ents) E.loadEnts(d.ents);
    else {
      E.ents = [];
      defaults(lot).forEach(([id, x]) => E.addProp(id, x, GR * T));
      const r = H.rooms()[0]; if (r) putSet('living', r);
      wd.chars.slice(0, 2).forEach(([cid], i) => E.addChar(cid, (X0 + 2 + i * 2) * T, (GR - 1) * T));
    }
    E.night = !!(d && d.night); E.nightK = E.night ? 1 : 0;
    E.pushOut(); E.recalc();
    E.bounds = { x0: (X0 - 24) * T, x1: (X0 + 34) * T, y0: (GR - 30) * T, y1: (GR + 2.2) * T };
    H.fit(true);
  };
  H.save = () => { if (!H.lot || E.mode !== 'house') return; S.data.homes[H.lot] = { h: H.state, ents: E.entsData(), night: E.night }; S.write(); };

  /* カメラ */
  H.fit = (now) => {
    let x0 = (X0 - 4) * T, x1 = (X0 + 10) * T, top = (GR - RH) * T;
    for (const r of H.rooms()) { x0 = Math.min(x0, (r.x - 2.5) * T); x1 = Math.max(x1, (r.x + r.w + 2.5) * T); top = Math.min(top, r.y * T); }
    const y0 = top - 260, y1 = (GR + 1.2) * T;
    const { w, h, panel } = E.view; const avail = h - panel - 70;
    let sc = Math.min(w * 0.92 / (x1 - x0), avail / (y1 - y0));
    sc = Math.min(sc, (avail * 0.5) / (RH * T));
    H.cam = { s: sc, x: (x0 + x1) / 2 - w / sc / 2, y: y1 - (h - panel) / sc };
    if (now) { E.cam.s = H.cam.s; E.cam.x = H.cam.x; E.cam.y = H.cam.y; E.clampCam(); H.cam = null; }
  };
  H.tickCam = (dt) => {
    if (!H.cam) return;
    const k = Math.min(1, dt * 0.005), c = E.cam;
    const cx = c.x + E.view.w / c.s / 2, cyb = c.y + (E.view.h - E.view.panel) / c.s;
    const tx = H.cam.x + E.view.w / H.cam.s / 2, tyb = H.cam.y + (E.view.h - E.view.panel) / H.cam.s;
    c.s += (H.cam.s - c.s) * k;
    const ncx = cx + (tx - cx) * k, ncy = cyb + (tyb - cyb) * k;
    c.x = ncx - E.view.w / c.s / 2; c.y = ncy - (E.view.h - E.view.panel) / c.s;
    E.clampCam();
    if (Math.abs(H.cam.s - c.s) < 0.002 && Math.abs(ncx - tx) < 2) H.cam = null;
  };

  /* ---------- もどす ---------- */
  H.snap = () => P.push({ snap: { h: clone(H.state), ents: E.entsData() } });
  H.restore = (snap) => { H.state = snap.h; H.rebuild(); E.loadEnts(snap.ents); E.pushOut(); H.save(); };

  /* ---------- かぐセット ---------- */
  const putSet = (kind, room, wx) => {
    const list = H.ROOMS[kind].props;
    let x0, w, fy;
    if (room) { const I = H.inside(room); x0 = I.x + 24; w = I.w - 48; fy = H.floorOf(room); }
    else { w = 300; x0 = PT.clamp(wx, (X0 - 22) * T, (X0 + 30) * T) - w / 2; fy = GR * T; }
    list.forEach(([it, fx], i) => { const p = E.addProp(it, x0 + fx * w, fy - 2); if (p) p.born = E.t + 120 + i * 110; });
  };
  const after = (x, y) => {
    E.sparkle(x, y, 14); A.sfx('magic'); setTimeout(() => A.sfx('sparkle'), 240);
    const n = H.count();
    if (n >= 2) P.found('h_first');
    if (n >= 6) P.found('h_six');
    if (H.rooms().some((r) => r.y <= GR - 3 * RH)) P.found('h_tall');
    const wd = H.state.pieces.filter((p) => p.t === 'win' || p.t === 'door').length; if (wd >= 4) P.found('h_win');
    const deco = H.state.pieces.filter((p) => p.t === 'wd').length + H.state.pieces.filter((p) => p.t === 'roof').reduce((a, p) => a + Object.values(p.deco || {}).filter(Boolean).length, 0); if (deco >= 4) P.found('h_deco');
    E.chars().forEach((c) => { if (Math.abs(c.x - x) < 600 && !c.sitOn && !c.held) { c.pose = 'cheer'; c.poseUntil = E.t + 900; c.face = 'love'; c.faceUntil = E.t + 1100; } });
    H.fit(); H.save(); PT.ui.markItems();
  };
  const commitRooms = () => {
    H.settle(); H.rebuild();
    // にわの ものが へやに うまったら そとへ よける
    for (const e of E.props()) {
      if (!PT.GARDEN_ITEMS.includes(e.type) || e.held) continue;
      const r = H.rooms().find((q) => e.x > q.x * T - 10 && e.x < (q.x + q.w) * T + 10 && e.y > q.y * T && e.y <= (q.y + RH) * T + 4);
      if (r) { const L = r.x * T - 70, Rr = (r.x + r.w) * T + 70; e.x = Math.abs(e.x - L) < Math.abs(e.x - Rr) ? L : Rr; e.y = GR * T; E.puff(e.x, e.y - 30, 5); }
    }
    E.pushOut();
  };

  /* ---------- パネルから おく ---------- */
  const isPiece = (sp) => !!(sp.room || sp.roof || sp.win || sp.door || sp.wd || sp.rdeco || sp.set);
  H.isPiece = isPiece;
  H.previewSpec = (sp, wx, wy) => {
    if (!isPiece(sp)) { H.preview = null; return; }
    if (sp.room) { const w = H.SIZES[sp.size]; const L = H.landing(Math.round(wx / T - w / 2), Math.round(wy / T - RH / 2), w); H.preview = { t: 'room', x: L.x, y: L.y, w }; }
    else if (sp.roof || sp.rdeco) H.preview = { t: 'roof', room: H.topRoomNear(wx, wy) };
    else H.preview = { t: 'target', room: H.roomAt(wx, wy) };
  };
  H.dropSpec = (sp, wx, wy) => {
    H.preview = null;
    if (!isPiece(sp)) return false;
    if (sp.room) {
      const w = H.SIZES[sp.size]; H.snap();
      const L = H.landing(Math.round(wx / T - w / 2), Math.round(wy / T - RH / 2), w);
      const r = H.add({ t: 'room', k: sp.room, x: L.x, y: L.y, w });
      H.anim.set(r.id, E.t); commitRooms();
      after((r.x + w / 2) * T, (r.y + 2) * T);
      return true;
    }
    if (sp.roof) {
      const r = H.topRoomNear(wx, wy); if (!r) { nope(wx, wy); return true; }
      H.snap();
      const old = H.state.pieces.find((p) => p.t === 'roof' && p.on === r.id);
      const rf = old || H.add({ t: 'roof', k: sp.roof, on: r.id, deco: {} }); rf.k = sp.roof; H.anim.set(rf.id, E.t);
      P.found('h_roof'); after((r.x + r.w / 2) * T, r.y * T - 60);
      return true;
    }
    if (sp.rdeco) {
      const r = H.topRoomNear(wx, wy); const rf = r && H.state.pieces.find((p) => p.t === 'roof' && p.on === r.id);
      if (!rf) { nope(wx, wy); return true; }
      H.snap(); rf.deco = rf.deco || {}; rf.deco[sp.rdeco] = !rf.deco[sp.rdeco];
      after((r.x + r.w / 2) * T, r.y * T - 80);
      return true;
    }
    if (sp.set) {
      const r = H.roomAt(wx, wy); H.snap();
      putSet(sp.set, r, wx); P.found('h_set');
      after(wx, wy);
      return true;
    }
    // まど・ドア・かべの かざり
    const r = H.roomAt(wx, wy); if (!r) { nope(wx, wy); return true; }
    H.snap();
    const t = sp.win ? 'win' : sp.door ? 'door' : 'wd';
    const p = H.add({ t, k: sp.win || sp.door || sp.wd, on: r.id, dx: wx - r.x * T });
    H.anim.set(p.id, E.t);
    after(wx, wy);
    return true;
  };
  const nope = (x, y) => { A.sfx('boing'); E.burst(x, y, 6, { k: 'star', col: '#ffd23f', sp: 0.15 }); };
  /* タップだけでも おける */
  H.tapSpec = (sp) => {
    const rooms = H.rooms();
    if (sp.room) {
      const w = H.SIZES[sp.size];
      const right = rooms.filter((r) => r.y + RH === GR).reduce((m, r) => Math.max(m, r.x + r.w), X0);
      const x = right + w <= H.LOT[1] ? right : Math.max(H.LOT[0], (rooms.length ? Math.min(...rooms.map((r) => r.x)) : X0) - w);
      return H.dropSpec(sp, (x + w / 2) * T, (GR - 2) * T);
    }
    if (!rooms.length) { nope((X0 + 3) * T, (GR - 2) * T); return true; }
    const tops = rooms.filter((r) => !rooms.some((o) => o.y + RH === r.y && o.x < r.x + r.w && r.x < o.x + o.w));
    if (sp.roof || sp.rdeco) {
      const bare = tops.find((r) => !H.state.pieces.some((p) => p.t === 'roof' && p.on === r.id));
      const r = sp.roof ? (bare || tops[0]) : (tops.find((t) => H.state.pieces.some((p) => p.t === 'roof' && p.on === t.id)) || tops[0]);
      return H.dropSpec(sp, (r.x + r.w / 2) * T, r.y * T - 40);
    }
    const busy = (r) => H.state.pieces.filter((p) => p.on === r.id).length + H.entsIn(r).length;
    const r = rooms.slice().sort((a, b) => busy(a) - busy(b))[0];
    const I = H.inside(r);
    return H.dropSpec(sp, I.x + PT.rand(0.25, 0.75) * I.w, I.y + I.h * 0.5);
  };

  /* ---------- おいた パーツを うごかす ---------- */
  let drag = null;
  H.startDrag = (p, wx, wy) => {
    drag = { p, ox: 0, oy: 0, snap: { h: clone(H.state), ents: E.entsData() } };
    if (p.t === 'room') {
      const q = H.rectOf(p); drag.ox = wx - q.x; drag.oy = wy - q.y;
      drag.ents = H.entsIn(p).map((e) => ({ e, dx: e.x - q.x, dy: e.y - q.y }));
      drag.ents.forEach((o) => { o.e.held = true; E.unsit(o.e); });
      p.drag = { x: q.x, y: q.y };
    } else p.drag = { x: wx, y: wy };
    A.sfx('pick');
  };
  H.moveDrag = (wx, wy, overPanel) => {
    if (!drag) return;
    const p = drag.p;
    if (p.t === 'room') {
      p.drag = { x: wx - drag.ox, y: wy - drag.oy };
      drag.ents.forEach((o) => { o.e.x = p.drag.x + o.dx; o.e.y = p.drag.y + o.dy; });
      if (overPanel) H.preview = null; else { const L = H.landing(Math.round(p.drag.x / T), Math.round(p.drag.y / T), p.w, p.id); H.preview = { t: 'room', x: L.x, y: L.y, w: p.w }; }
    } else {
      p.drag = { x: wx, y: wy };
      H.preview = overPanel ? null : p.t === 'roof' ? { t: 'roof', room: H.topRoomNear(wx, wy + 80) } : { t: 'target', room: H.roomAt(wx, wy) };
    }
  };
  H.endDrag = (wx, wy, overPanel) => {
    if (!drag) return;
    const { p } = drag; const d = drag; drag = null; H.preview = null;
    P.push({ snap: d.snap });
    if (overPanel) {
      // おかたづけ
      if (p.t === 'room') { (d.ents || []).forEach((o) => { o.e.held = false; o.e.x = (p.x + p.w / 2) * T + PT.rand(-60, 60); o.e.y = p.y * T; }); }
      const gone = [p, ...H.kids(p.id)];
      H.state.pieces = H.state.pieces.filter((q) => !gone.includes(q));
      if (p.t === 'room') { const q = { x: p.drag.x, y: p.drag.y }; E.puff(q.x + p.w * T / 2, q.y + 100, 12); (d.ents || []).forEach((o) => { if (o.e.kind === 'prop') E.remove(o.e); }); }
      else E.puff(p.drag.x, p.drag.y, 8);
      delete p.drag; A.sfx('trash');
      commitRooms(); H.fit(); H.save(); PT.ui.markItems();
      return;
    }
    if (p.t === 'room') {
      const L = H.landing(Math.round(p.drag.x / T), Math.round(p.drag.y / T), p.w, p.id);
      const dx = L.x * T - p.drag.x, dy = L.y * T - p.drag.y;
      p.x = L.x; p.y = L.y; delete p.drag;
      d.ents.forEach((o) => { o.e.x += dx; o.e.y += dy; o.e.held = false; o.e.vy = 0; });
      H.anim.set(p.id, E.t - 200);
      commitRooms(); A.sfx('place'); E.puff((p.x + p.w / 2) * T, (p.y + RH) * T, 10);
      H.fit(); H.save();
      return;
    }
    delete p.drag;
    if (p.t === 'roof') {
      const r = H.topRoomNear(wx, wy + 80);
      if (r) { const other = H.state.pieces.find((q) => q.t === 'roof' && q.on === r.id && q !== p); if (other) H.state.pieces = H.state.pieces.filter((q) => q !== other); p.on = r.id; H.anim.set(p.id, E.t - 150); A.sfx('place'); }
      else nope(wx, wy);
    } else {
      const r = H.roomAt(wx, wy);
      if (r) { p.on = r.id; p.dx = wx - r.x * T; H.anim.set(p.id, E.t - 150); A.sfx('place'); } else nope(wx, wy);
    }
    H.save();
  };
  H.dragging = () => !!drag;

  /* へやを タップ */
  const ROOMFX = {
    bath: (x, y) => { A.sfx('bubble'); E.burst(x, y, 10, { k: 'puff', col: ['rgba(255,255,255,.95)', 'rgba(190,230,255,.9)'], sp: 0.1, g: -0.0002, s: 10, max: 1200 }); },
    music: (x, y) => { A.sfx('piano'); E.notes(x, y, 5); },
    bedroom: (x, y) => { A.sfx('ghost'); E.zz(x, y); },
    kitchen: (x, y) => { A.sfx('munch'); E.hearts(x, y, 3); },
    space: (x, y) => { A.sfx('zap'); E.sparkle(x, y, 10); },
    play: (x, y) => { A.sfx('boing'); E.burst(x, y, 8, { col: ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a'], sp: 0.3, up: 0.2, s: 8 }); },
    princess: (x, y) => { A.sfx('sparkle'); E.sparkle(x, y, 12); },
  };
  H.tapAt = (wx, wy) => {
    const p = H.hitPiece(wx, wy); if (!p) return false;
    if (p.t === 'room') (ROOMFX[p.k] || ((x, y) => { A.sfx('ding'); E.sparkle(x, y, 6); }))(wx, wy);
    else { H.anim.set(p.id, E.t - 120); A.sfx(p.t === 'door' ? 'bell' : 'tap'); }
    return true;
  };
  H.removeAt = (wx, wy) => {
    const p = H.hitPiece(wx, wy); if (!p) return false;
    H.startDrag(p, wx, wy); H.endDrag(wx, wy, true);
    return true;
  };

  /* キャラの ひとこと */
  const LINES = { living: ['くつろぐ〜', 'テレビ みよう'], kitchen: ['おなか すいた！', 'なに つくる？'], bedroom: ['ねむく なっちゃう', 'おやすみ〜'], bath: ['あわあわ〜', 'おふろ だいすき'], kids: ['おもちゃ いっぱい！', 'あそぼ！'], princess: ['おひめさま みたい', 'すてきな おへや'], music: ['ラララ♪', 'うたおう！'], library: ['ごほん よもう', 'しずかに ね'], play: ['すべりだい しよ！', 'ぴょんぴょん！'], green: ['おはな きれい', 'いい におい'], space: ['うちゅう だ！', 'ほし みえる？'], candy: ['あまい におい', 'たべちゃいたい！'] };
  P.ctxLine = (ch) => {
    if (E.mode !== 'house') return null;
    const r = H.rooms().find((q) => H.entsIn(q).includes(ch));
    if (!r) return null;
    const ins = E.chars().filter((c) => H.rooms().some((q) => H.entsIn(q).includes(c))).length;
    if (ins >= 4) P.found('h_family', ch.x, ch.y - ch.H);
    P.found('house', ch.x, ch.y - ch.H);
    return PT.pick(LINES[r.k] || ['おうち だいすき！']);
  };
})();
