/* おうちづくりの あそびかた：へやを ふやす・とりかえる・やねや いろを かえる */
'use strict';
(() => {
  const H = PT.house, E = PT.E, P = PT.play, S = PT.save, A = PT.audio, T = PT.TILE;
  const { X0, RW, GR, NF, NC } = H;
  H.LOTS = ['meadow', 'beach', 'snow', 'candy', 'sky'];
  S.data.houses = S.data.houses || {};
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* はっけん（おうち） */
  PT.ACH.push(
    ['h_first', 'へやが ふえた！', 'おうちに へやを たした', { r: 'kids' }],
    ['h_six', 'にぎやかな おうち', 'へやが 6つ', { r: 'living' }],
    ['h_tall', 'たかい おうち', '3かいだての おうち', { roof: 'blue' }],
    ['h_full', 'おおきな おやしき', 'へやを ぜんぶ うめた', { roof: 'castle' }],
    ['h_roof', 'やねを かえた', 'すきな やねに した', { roof: 'mushroom' }],
    ['h_paint', 'ぬりかえ', 'かべの いろを かえた', { wall: 'pink' }],
    ['h_deco', 'かざりつけ', 'かざりを 4つ', { deco: 'lights' }],
    ['h_family', 'みんなで すもう', 'おうちの なかに 4にん', { c: 'futan' }],
  );

  /* ---------- はいる・ほぞん ---------- */
  const defaultsFor = (lot) => {
    const L = (x) => x * T;
    const list = [['gtree', L(X0 - 9)], ['mailbox', L(X0 - 3.2)], ['flowerbed', L(X0 + 3 * RW + 3)], ['picket', L(X0 + 3 * RW + 7)]];
    if (lot === 'beach') list[0] = ['parasol', L(X0 - 9)];
    if (lot === 'snow') list[2] = ['snowman', L(X0 + 3 * RW + 3)];
    if (lot === 'candy') list[2] = ['icecream', L(X0 + 3 * RW + 3)];
    return list;
  };
  H.enter = (lot) => {
    H.lot = lot;
    const wd = PT.WORLDS[lot];
    E.load(wd, { g: '', ents: [] });
    E.mode = 'house'; E.hook = { back: hookBack, front: hookFront, holes: H.holes };
    const d = S.data.houses[lot];
    H.state = d && d.h ? d.h : H.fresh();
    H.anim.clear(); H.roofT = 0;
    H.rebuild();
    if (d && d.ents) E.loadEnts(d.ents);
    else {
      E.ents = [];
      defaultsFor(lot).forEach(([id, x]) => E.addProp(id, x, GR * T));
      spawnProps(0, 1, 'living');
      wd.chars.slice(0, 2).forEach(([cid], i) => E.addChar(cid, (X0 + 5 + i * 3) * T, GR * T));
    }
    E.night = !!(d && d.night); E.nightK = E.night ? 1 : 0;
    E.pushOut(); E.recalc();
    E.bounds = { x0: (X0 - 16) * T, x1: (X0 + NC * RW + 16) * T, y0: (GR - NF * 5 - 6) * T, y1: (GR + 2.2) * T };
    H.fit(true);
  };
  H.save = () => { if (!H.lot || E.mode !== 'house') return; S.data.houses[H.lot] = { h: H.state, ents: E.entsData(), night: E.night }; S.write(); };

  /* カメラを おうち ぜんたいに あわせる */
  H.fit = (now) => {
    const s = H.state; let k0 = NC, k1 = -1, top = 0;
    for (let k = 0; k < NC; k++) { const t = H.topOf(k); if (t >= 0) { k0 = Math.min(k0, k); k1 = Math.max(k1, k); top = Math.max(top, t); } }
    if (k1 < 0) { k0 = 1; k1 = 1; }
    // つぎに ふやせる ばしょも はいるように
    const nx = H.nextSlot(); if (nx) { k0 = Math.min(k0, nx[1]); k1 = Math.max(k1, nx[1]); top = Math.max(top, nx[0]); }
    const x0 = (X0 + k0 * RW - 4) * T, x1 = (X0 + (k1 + 1) * RW + 4) * T;
    const y0 = (GR - (top + 1) * 5) * T - 300, y1 = (GR + 1.3) * T;
    const { w, h, panel } = E.view; const avail = h - panel - 70;
    let sc = Math.min(w * 0.92 / (x1 - x0), avail / (y1 - y0));
    sc = Math.min(sc, (w * 0.4) / (RW * T), (avail * 0.62) / (5 * T));
    H.cam = { s: sc, x: (x0 + x1) / 2 - w / sc / 2, y: y1 - (h - panel) / sc };
    void s;
    if (now) { E.cam.s = H.cam.s; E.cam.x = H.cam.x; E.cam.y = H.cam.y; E.clampCam(); H.cam = null; }
  };
  H.tickCam = (dt) => {
    if (!H.cam) return;
    const k = Math.min(1, dt * 0.006), c = E.cam;
    // ズームの ちゅうしんを たもつ
    const cx = c.x + E.view.w / c.s / 2, cyb = c.y + (E.view.h - E.view.panel) / c.s;
    const tx = H.cam.x + E.view.w / H.cam.s / 2, tyb = H.cam.y + (E.view.h - E.view.panel) / H.cam.s;
    c.s += (H.cam.s - c.s) * k;
    const ncx = cx + (tx - cx) * k, ncy = cyb + (tyb - cyb) * k;
    c.x = ncx - E.view.w / c.s / 2; c.y = ncy - (E.view.h - E.view.panel) / c.s;
    E.clampCam();
    if (Math.abs(H.cam.s - c.s) < 0.002 && Math.abs(ncx - tx) < 2) H.cam = null;
  };

  /* ---------- へや ---------- */
  const key = (f, k) => f + ':' + k;
  const spawnProps = (f, k, rid) => {
    const r = H.slotRect(f, k), fy = H.floorY(f);
    H.ROOMS[rid].props.forEach(([it, fx], i) => { const p = E.addProp(it, r.x + fx * r.w, fy - 4, { room: key(f, k) }); if (p) p.born = E.t + 200 + i * 120; });
  };
  const clearProps = (f, k) => {
    const kk = key(f, k), r = H.slotRect(f, k);
    E.props().filter((p) => p.room === kk || (p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y <= r.y + r.h + 4)).forEach((p) => { E.puff(p.x, p.y - 30, 5); E.remove(p); });
  };
  H.snap = () => P.push({ snap: { h: clone(H.state), ents: E.entsData() } });
  H.restore = (snap) => { H.state = snap.h; H.rebuild(); E.loadEnts(snap.ents); E.pushOut(); H.fit(); H.save(); };
  const celebrate = (f, k) => {
    const r = H.slotRect(f, k);
    A.sfx('magic'); setTimeout(() => A.sfx('sparkle'), 260);
    E.sparkle(r.x + r.w / 2, r.y + r.h / 2, 18);
    E.chars().forEach((c) => { if (Math.abs(c.x - (r.x + r.w / 2)) < 700 && !c.sitOn) { c.pose = 'cheer'; c.poseUntil = E.t + 900; c.face = 'love'; c.faceUntil = E.t + 1100; } });
  };
  const after = () => {
    const n = H.count();
    if (n >= 2) P.found('h_first');
    if (n >= 6) P.found('h_six');
    if (H.state.rooms[2].some(Boolean)) P.found('h_tall');
    if (n >= NF * NC) P.found('h_full');
    H.fit(); H.save(); PT.ui.markItems();
  };
  H.addRoom = (rid, slot) => {
    const s = slot || H.nextSlot();
    if (!s) { A.sfx('boing'); E.burst((X0 + 7.5) * T, (GR - 10) * T, 8, { k: 'star', col: '#ffd23f', sp: 0.2 }); return false; }
    const [f, k] = s;
    H.snap();
    if (H.state.rooms[f][k]) clearProps(f, k);
    H.state.rooms[f][k] = rid; H.anim.set(key(f, k), E.t);
    H.rebuild(); spawnProps(f, k, rid); celebrate(f, k);
    after();
    return true;
  };
  H.dropRoom = (rid, wx, wy) => {
    const s = H.slotAt(wx, wy);
    if (s && (H.state.rooms[s[0]][s[1]] || H.canAdd(s[0], s[1]))) return H.addRoom(rid, s);
    return H.addRoom(rid);
  };
  H.removeAt = (wx, wy) => {
    const s = H.roomAt(wx, wy); if (!s) return false;
    const [f, k] = s;
    if (H.topOf(k) !== f) { A.sfx('boing'); const r = H.slotRect(f, k); E.burst(r.x + r.w / 2, r.y + 20, 6, { k: 'star', col: '#ffd23f', sp: 0.15 }); return true; }
    H.snap();
    clearProps(f, k);
    const r = H.slotRect(f, k);
    H.state.rooms[f][k] = null;
    E.chunks(r.x + r.w / 2, r.y + r.h / 2, { col: PT.house.WALLS[H.state.wall].col });
    E.burst(r.x + r.w / 2, r.y + r.h / 2, 16, { k: 'chunk', col: [PT.house.WALLS[H.state.wall].col, '#ffffff', '#d99a5b'], sp: 0.5, up: 0.3, s: 12, max: 900 });
    A.sfx('pop'); A.noise(0.2, { vol: 0.2, filter: 700 });
    H.rebuild(); H.fit(); H.save(); PT.ui.markItems();
    return true;
  };
  H.setPart = (kind, id) => {
    if (H.state[kind] === id) { A.sfx('tap'); return; }
    H.snap(); H.state[kind] = id;
    A.sfx('magic');
    const cx = (X0 + 7.5) * T;
    if (kind === 'roof') { H.roofT = E.t; (H.roofSpans || []).forEach(([x0, x1, y, h]) => E.sparkle((x0 + x1) / 2, y - h / 2, 14)); P.found('h_roof'); }
    else { E.sparkle(cx, (GR - 3) * T, 12); for (let f = 0; f < NF; f++) for (let k = 0; k < NC; k++) if (H.state.rooms[f][k] && kind === 'wall') E.sparkle(H.slotRect(f, k).x, H.slotRect(f, k).y + 100, 4); }
    if (kind === 'wall') P.found('h_paint');
    H.save(); PT.ui.markItems();
  };
  H.toggleDeco = (id) => {
    H.snap(); H.state.deco[id] = !H.state.deco[id];
    A.sfx(H.state.deco[id] ? 'sparkle' : 'tap');
    if (H.state.deco[id]) (H.roofSpans || []).slice(0, 1).forEach(([x0, x1, y]) => E.sparkle((x0 + x1) / 2, y - 60, 10));
    if (Object.values(H.state.deco).filter(Boolean).length >= 4) P.found('h_deco');
    H.save(); PT.ui.markItems();
  };

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
  H.tapRoom = (wx, wy) => {
    const s = H.roomAt(wx, wy); if (!s) return false;
    const rid = H.state.rooms[s[0]][s[1]];
    (ROOMFX[rid] || ((x, y) => { A.sfx('ding'); E.sparkle(x, y, 6); }))(wx, wy);
    return true;
  };
  /* キャラの ひとこと */
  const LINES = { living: ['くつろぐ〜', 'テレビ みよう'], kitchen: ['おなか すいた！', 'なに つくる？'], bedroom: ['ねむく なっちゃう', 'おやすみ〜'], bath: ['あわあわ〜', 'おふろ だいすき'], kids: ['おもちゃ いっぱい！', 'あそぼ！'], princess: ['おひめさま みたい', 'すてきな おへや'], music: ['ラララ♪', 'うたおう！'], library: ['ごほん よもう', 'しずかに ね'], play: ['すべりだい しよ！', 'ぴょんぴょん！'], green: ['おはな きれい', 'いい におい'], space: ['うちゅう だ！', 'ほし みえる？'], candy: ['あまい におい', 'たべちゃいたい！'] };
  P.ctxLine = (ch) => {
    if (E.mode !== 'house') return null;
    const s = H.roomAt(ch.x, ch.y - 30);
    if (!s) return null;
    const ins = E.chars().filter((c) => H.roomAt(c.x, c.y - 30)).length;
    if (ins >= 4) P.found('h_family', ch.x, ch.y - ch.H);
    P.found('house', ch.x, ch.y - ch.H);
    return PT.pick(LINES[H.state.rooms[s[0]][s[1]]] || ['おうち だいすき！']);
  };

  /* ---------- えがく ---------- */
  function hookBack(c) { H.drawYard(c, E.t); H.drawHouse(c, E.t); }
  function hookFront(c) { H.drawSlots(c, E.t, PT.ui.tab === 'rooms' || PT.ui.draggingRoom); }
})();
