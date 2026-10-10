// ================================================================ the player: ぽわ (possess, scare, don't get seen)
const RIM_MAT = new THREE.MeshBasicMaterial({ color: 0xf4f8ff, side: THREE.BackSide, transparent: true, opacity: 0.55, depthWrite: false });
const SEARCH_ROOMS = ['living', 'kitchen', 'washitsu', 'hall', 'kodomo', 'hall2', 'akari', 'shinshitsu', 'garden', 'engawa'];
const Ghost = (() => {
  const gm = buildGhost(); gm.visible = false; scene.add(gm);
  const eyes = new THREE.Sprite(new THREE.SpriteMaterial({ map: EYE_TEX, transparent: true, depthTest: false, depthWrite: false })); eyes.scale.set(0.42, 0.21, 1); eyes.renderOrder = 20; eyes.visible = false;
  let rims = [], hostTop = 0.5, last = null;
  const S = { host: null, hop: null, catUsed: false, danger: 0 };
  function hostObj() { return S.host ? O[S.host] : null; }
  function hostPos(out = new V3()) { const o = hostObj(); if (!o) return out.set(0, 0, 0); out.set(o.pos.x, o.pos.y + hostTop * 0.6, o.pos.z); return FG[o.floor].localToWorld(out); }
  function clearRims() { for (const r of rims) r.parent && r.parent.remove(r); rims = []; eyes.parent && eyes.parent.remove(eyes); eyes.visible = false; }
  function makeRims(o) {
    clearRims();
    const root = o.def.door ? DOORS[o.def.door].mesh : o.g;
    const box = new THREE.Box3(); root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
    root.traverse(m => {
      if (!m.isMesh || m.material === PICK_MAT || m.material === RIM_MAT || !m.visible) return;
      const r = new THREE.Mesh(m.geometry, RIM_MAT); r.scale.setScalar(1.08); r.renderOrder = -1; m.add(r); rims.push(r);
      m.geometry.computeBoundingBox(); box.union(m.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld)));
    });
    hostTop = isFinite(box.max.y) ? Math.min(box.max.y, 3.6) : 0.5;
    if (o.def.door) hostTop = 2.2;
    eyes.position.set(0, hostTop + 0.16, 0); if (o.def.door) eyes.position.set(0, 1.5, 0);
    if (o.id === 'furin') eyes.position.set(0, 0.25, 0);
    (o.def.door ? DOORS[o.def.door].mesh : o.g).add(eyes); eyes.visible = true;
  }
  function setHost(id) {
    const prev = hostObj(); if (prev) prev.possessed = false;
    S.host = id; clearRims();
    const o = hostObj(); if (o) { o.possessed = true; makeRims(o); o.wig = 0.4; }
    Hooks.hostChanged && Hooks.hostChanged();
  }
  const isInner = o => o.def.host && o.def.host.kind === 'inner';
  function blocked() { // inside a closet with a child in front of it
    const o = hostObj(); if (!o || !isInner(o) || !World.search) return false;
    return FAMILY.some(id => { const a = AG[id]; return a.home && a.mode === 'search' && a.floor === o.floor && a.pos.distanceTo(o.pos) < 1.4; });
  }
  function canHop(o) {
    if (!o || !o.def.host || S.hop || o.id === S.host) return false;
    const h = hostObj(); if (!h) return true;
    if (World.phase === 'explore') return true;
    if (blocked()) return false;
    const fr = objRooms(h), tr = objRooms(o);
    if (h.floor !== o.floor) return (fr.includes('hall') && tr.includes('hall2')) || (fr.includes('hall2') && tr.includes('hall')) ? 'stairs' : false;
    const same = fr.some(r => tr.includes(r));
    if (h.def.host.kind === 'curtain' && same) return 'quiet';
    const d = Math.hypot(h.pos.x - o.pos.x, h.pos.z - o.pos.z);
    if (d > 6.5) return false;
    if (!same && !losClear(h.floor, h.pos.x, h.pos.z, o.pos.x, o.pos.z)) return false;
    return true;
  }
  function whyNot(o) { if (!o.def.host) return 'のりうつれない'; if (blocked()) return '入り口を ふさがれている！'; return 'とおすぎる・かべの むこう'; }
  function hop(o) {
    const how = canHop(o); if (!how) return false;
    const h = hostObj();
    if (!h || World.phase !== 'play') { setHost(o.id); Sound.sfx('possess'); burst(o); return true; }
    const from = hostPos();
    S.hop = { o, t: 0, dur: how === 'quiet' ? 0.25 : 0.55, from, fromFloor: h.floor, fromP: h.pos.clone(), quiet: how === 'quiet', seen: new Set() };
    setHost(null); gm.visible = !S.hop.quiet; Sound.sfx('hop');
    return true;
  }
  function burst(o) { Parts.burst(o.g.parent, o.pos.clone().add(new V3(0, hostTop * 0.6, 0)), 10, { col: 0xeaf2ff, size: 0.2, life: 0.8, spd: 1.2, up: 1.4, add: true }); }
  // does child a notice something at local point?
  function sees(a, f, x, z, y) {
    if (!a.home || a.asleep || a.gone) return false;
    if (World.search && World.season === 2) { // power cut: only the flashlight or very close
      if (a.floor !== f) return false; const d = Math.hypot(a.pos.x - x, a.pos.z - z);
      if (d < 2.2) return losClear(f, a.pos.x, a.pos.z, x, z);
      return a.propKind === 'light' && canSee(a, f, x, z, y, 6.5, 50);
    }
    const fov = World.search && World.season === 1 ? 170 : a.fov;
    return canSee(a, f, x, z, y, 8, fov);
  }
  const tmp = new V3(), tmp2 = new V3();
  function updateHop(dt) {
    const H = S.hop; if (!H) return;
    H.t += dt / H.dur; const t = Math.min(1, H.t);
    const to = objWorldPos(H.o, tmp2);
    tmp.lerpVectors(H.from, to, t); tmp.y += Math.sin(t * Math.PI) * 1.0;
    gm.position.copy(tmp); gm.position.y -= 0.4; gm.rotation.y += dt * 4;
    if (!H.quiet && World.phase === 'play') {
      const f = t < 0.5 ? H.fromFloor : H.o.floor, lx = lerp(H.fromP.x, H.o.pos.x, t), lz = lerp(H.fromP.z, H.o.pos.z, t);
      for (const id of FAMILY) {
        const a = AG[id]; if (H.seen.has(id)) continue;
        if (sees(a, f, lx, lz, 1.2)) {
          H.seen.add(id);
          if (World.search) { if (a.mode === 'search') { caught(a); return; } }
          else suspect(a, 'いま なにか とんだ…？');
        }
      }
    }
    if (t >= 1) { S.hop = null; gm.visible = false; setHost(H.o.id); Sound.sfx('possess'); burst(H.o); }
  }
  // ------------------------------------------------ suspicion
  function suspect(a, text) {
    if (World.search || a.susCD > 0 || World.phase !== 'play') return;
    a.susCD = 4; World.sus = Math.min(3, World.sus + 1); setFace(a, 'sus'); say(a, text || pick(LINES.sus), 2.2, 'think'); Sound.sfx('q');
    UI.toast('あやしまれた！（' + World.sus + '/3）', 'red');
    if (World.sus >= 3) setTimeout(() => startSearch('sus'), 900);
  }
  // ------------------------------------------------ scaring
  function scare(big) {
    const o = hostObj(); if (!o || S.hop || World.phase !== 'play') return false;
    if (World.search) { UI.toast('おばけさがし中は にげるだけ！'); return false; }
    if (o.cd > 0) return false;
    const sd = scareDef(o); if (!sd) return false;
    o.cd = big ? 2.4 : 0.9;
    scareFx(o, big);
    const rooms = objRooms(o); const [label, power] = big ? sd.b : sd.s;
    // combo: two things moved one after another (winter skill)
    let combo = 1; const now = performance.now() / 1000;
    if (last && World.season === 4 && now - last.t < 2.5 && last.id !== o.id && rooms.some(r => last.rooms.includes(r))) { combo = 1.6; UI.toast('ダブル！', 'gold'); Sound.sfx('jingle'); }
    last = { t: now, id: o.id, rooms };
    let watched = null;
    for (const id of FAMILY) {
      const a = AG[id]; if (!a.home || a.gone) continue;
      const P = kidP(a); const r = a.room; let f = 0;
      const d = a.floor === o.floor ? Math.hypot(a.pos.x - o.pos.x, a.pos.z - o.pos.z) : 99;
      if (rooms.includes(r)) {
        if (sd.light) f = 1;
        else if (big) f = d < 4 ? 1 : 0.75;
        else f = d < 2.6 ? 1 : d < 4.6 ? 0.5 : 0.15;
      } else {
        const v = Math.max(...rooms.map(x => heardVol(x, r)));
        if (big && v > 0) f = (sd.far ? 0.7 : 0.3) * v * 1.6;
        else if (sd.far && v > 0.5) f = 0.3;
      }
      if (f <= 0) continue;
      if (sd.window && d < 3) f *= 1.5;
      if (sd.wind && big) { for (const c of Object.values(O)) if (c !== o && rooms.includes(objRoomNow(c)) && (c.def.host && (c.def.host.kind === 'curtain' || c.id === 'furin'))) { c.st.sway = 1; if (a.pos.distanceTo(c.pos) < 2.6) f *= 1.4; } }
      if (a.asleep) { if (big && f >= 0.5) { a.asleep = false; a.wokeT = 8; a.wantMove = false; setFace(a, 'surp'); say(a, 'ふぁっ…？ なに？', 1.6); a.jump = 0.5; } continue; }
      let m = big ? P.mb : P.ms;
      if (P.brave && sd.brave) m *= 1.4;
      if (a.wokeT > 0) m *= 1.6;
      const gain = power * f * m * combo;
      const [lo, hi] = band(a); const before = a.doki;
      a.doki = Math.min(120, a.doki + gain); a.peak = Math.max(a.peak, a.doki);
      a.jump = big ? 0.5 : 0.25; faceObj(a, o); a.boredT = 0;
      // reaction
      if (a.doki >= cryLine(a)) { kidCry(a); continue; }
      if (a.doki > hi) { setFace(a, 'panic'); say(a, pick(LINES.over), 1.8, 'loud'); Sound.sfx('eek'); Album.add(a.id, 2); }
      else if (a.doki >= lo) { setFace(a, big ? 'surp' : 'happy'); say(a, pick(big ? LINES.inB : LINES.inS), 1.6, big ? 'loud' : null); Album.add(a.id, big ? 1 : 0); }
      else { setFace(a, 'n'); say(a, pick(P.brave ? LINES.braveS : ['…ん？', 'なに？']), 1.4); }
      if (P.curious && !a.lock && Math.random() < 0.6 && a.room === objRoomNow(o)) a.push(kidStare(a, o), true);
      if (sd.lure && big && P.small && !a.lock) a.push(kidLure(a, o), true);
      if (!watched && (a.staring === o.id || canSeeObj(a, o, 7.5))) watched = a;
    }
    if (watched) suspect(watched);
    Hooks.scared && Hooks.scared(o, big);
    return true;
  }
  // ------------------------------------------------ hide & seek
  function startSearch(why) {
    if (World.search || World.phase !== 'play' || World.caught) return;
    World.search = { t: 60, why };
    for (const id of FAMILY) { const a = AG[id]; if (!a.home || a.gone) continue; a.asleep = false; a.staring = null; a.lock = 0; a.mode = 'search'; a.stack = [searchGen(a)]; a.epoch++; }
    Hooks.searchStart && Hooks.searchStart(why);
  }
  function* searchGen(a) {
    const kids = FAMILY.filter(id => AG[id].home && !AG[id].gone); const i = kids.indexOf(a.id);
    setFace(a, 'surp');
    yield* talk(a, World.search.why === 'day' ? pick(['おばけ さがし しよう！', 'さがすぞー！']) : pick(['やっぱり なんか いる！', 'さがそう！']), 1.8, 'loud');
    const hunter = World.season === 3 && a.id === 'hinata';
    if (World.season === 2 && a.id === 'hinata') a.setProp('light');
    if (hunter) a.setProp('net');
    const rooms = SEARCH_ROOMS.slice(i % 3).concat(SEARCH_ROOMS.slice(0, i % 3)).sort(() => Math.random() - 0.5);
    a.anim = 'search';
    for (const room of rooms) {
      if (!World.search) break;
      const c = roomCenter(room); yield* go(a, { room, f: ROOMS[room].floor, x: c.x + rnd(-1, 1), z: c.z + rnd(-0.8, 0.8) }, { run: true });
      const list = Object.values(O).filter(o => o.def.host && objRooms(o).includes(room)).sort(() => Math.random() - 0.5).slice(0, 4);
      for (const o of list) {
        if (!World.search) break;
        if (isInner(o) && !(hunter || o.id === 'kotatsu' || Math.random() < 0.3)) continue;
        yield* go(a, objSpot(o, 0.7), { run: true }); faceObj(a, o);
        if (o.id === 'kotatsu') say(a, 'あし いれてみよ…', 1.2);
        a.inspect = o.id; a.inspectT = 0;
        const tt = hunter ? 0.55 : 0.95;
        while (a.inspectT < tt && World.search) { a.inspectT += World.dts; yield; }
        a.inspect = null;
      }
    }
    while (World.search) yield;
  }
  function endSearch() {
    World.search = null; World.sus = 0;
    for (const id of FAMILY) { const a = AG[id]; if (!a.home || a.gone) continue; a.mode = 'normal'; a.inspect = null; a.setProp(null); a.anim = 'idle'; a.stack = [kidLife(a, 0, true)]; a.home = true; a.doki = Math.min(band(a)[1], a.doki + 14); setFace(a, 'happy'); say(a, pick(['やっぱり いないよ〜', 'きのせい だったか', 'たんけん たのしかった！']), 2.2); a.epoch++; }
    Hooks.searchEnd && Hooks.searchEnd();
  }
  function caught(by) {
    if (World.caught) return; World.caught = true; World.caughtBy = by;
    Hooks.caught && Hooks.caught(by);
  }
  function useCat() {
    if (S.catUsed || !World.search) return false;
    const c = AG.monaka; S.catUsed = true; Sound.sfx('meow');
    const o = hostObj(); const room = o ? objRoomNow(o) : 'living';
    // the cat dashes through the search party
    const kids = FAMILY.map(id => AG[id]).filter(a => a.home && !a.gone && a.mode === 'search').sort((p, q) => (p.room === room ? -1 : 0) - (q.room === room ? -1 : 0) || p.pos.distanceTo(c.pos) - q.pos.distanceTo(c.pos)).slice(0, 2);
    World.search.t = Math.max(3, World.search.t - 15);
    for (const a of kids) a.push((function* () { a.inspect = null; yield* go(a, { room: c.room || 'living', f: c.floor, x: c.pos.x + 0.6, z: c.pos.z + 0.4 }, { run: true }); faceAg(a, c); setFace(a, 'smile'); yield* talk(a, 'なんだ、ねこかぁ。', 2); yield* waitS(2.5); })(), true);
    Cat.zoom();
    return true;
  }
  // ------------------------------------------------ per frame
  let flick = 0;
  function update(dt, dts) {
    updateHop(dts);
    S.danger = 0;
    if (World.phase === 'play' && World.search && !World.caught) {
      World.search.t -= dts;
      const o = hostObj();
      for (const id of FAMILY) {
        const a = AG[id]; if (a.mode !== 'search' || !a.home) continue;
        if (o && a.floor === o.floor && a.pos.distanceTo(o.pos) < 3.5) S.danger = Math.max(S.danger, 1 - a.pos.distanceTo(o.pos) / 3.5);
        if (o && a.inspect === o.id && a.inspectT > 0.4) { caught(a); break; }
      }
      if (World.search && World.search.t <= 0 && !World.caught) endSearch();
    }
    flick += dt; const danger = S.danger > 0.2;
    eyes.material.map = danger ? EYE_TEX2 : EYE_TEX;
    if (eyes.visible) { const s = danger ? 1 + Math.sin(flick * 20) * 0.08 : 1 + Math.sin(flick * 2) * 0.04; eyes.scale.set(0.42 * s, 0.21 * s, 1); eyes.center.set(0.5 + (danger ? Math.sin(flick * 13) * 0.08 : 0), 0.5); }
    RIM_MAT.opacity = danger ? 0.25 + Math.abs(Math.sin(flick * 14)) * 0.5 : 0.42 + Math.sin(flick * 2.5) * 0.12;
    gm.userData.mat.opacity = 0.7 + Math.sin(flick * 6) * 0.1;
  }
  function reset() { S.hop = null; S.catUsed = false; last = null; gm.visible = false; setHost(null); }
  return { S, gm, hostObj, hostPos, setHost, canHop, whyNot, hop, scare, startSearch, endSearch, useCat, update, reset, blocked, sees };
})();

// ---------------------------------------------------------------- the cat もなか: suns itself, sometimes follows ぽわ
const Cat = (() => {
  let zoomT = 0;
  function* life(c) {
    const spots = [['living', -6.8, 4.6], ['washitsu', 6.6, -1.2], ['engawa', 8.8, -4.4], ['kitchen', 6.8, 2.8], ['living', -1.4, 3.6]];
    while (true) {
      const o = Ghost.hostObj();
      let tgt;
      if (o && o.floor === 1 && Math.random() < 0.35 && World.phase === 'play' && !World.search) { tgt = objSpot(o, 1.0); }
      else { const s = pick(spots); tgt = { room: s[0], f: 1, x: s[1], z: s[2] }; }
      if (!tgt.room || !ROOMS[tgt.room] || ROOMS[tgt.room].floor !== 1) { yield* waitS(2); continue; }
      yield* go(c, tgt);
      if (o && Ghost.hostObj() === o && c.pos.distanceTo(o.pos) < 1.6) {
        faceObj(c, o); Sound.sfx('meow'); UI.bubble(c, 'ニャ〜', 1.4);
        // children look over at the cat — and at ぽわ's thing
        for (const id of FAMILY) { const a = AG[id]; if (a.home && a.room === c.room && !a.lock && a.mode !== 'search') faceTo(a, c.pos.x, c.pos.z); }
      }
      c.anim = 'sleep'; setFace(c, 'sleep');
      yield* waitS(rnd(8, 16));
      setFace(c, 'n');
    }
  }
  function* zoom(c) {
    setFace(c, 'surp'); UI.bubble(c, 'ニャーン！', 1.4, 'loud');
    const r = pick(['living', 'kitchen', 'washitsu', 'hall']); const rc = roomCenter(r);
    yield* go(c, { room: r, f: 1, x: rc.x + rnd(-1, 1), z: rc.z + rnd(-1, 1) }, { run: true });
    setFace(c, 'n'); yield* waitS(4);
  }
  return {
    start(c) { c.home = true; c.place({ f: 1, x: -6.8, z: 4.6, yaw: 0 }); c.mesh.visible = true; c.stack = [life(c)]; },
    zoom() { const c = AG.monaka; c.push(zoom(c), true); },
  };
})();

// ---------------------------------------------------------------- びっくりアルバム
const Album = {
  add(kid, idx) {
    const al = Save.d.album = Save.d.album || {}; const m = al[kid] || 0;
    if (m & (1 << idx)) return; al[kid] = m | (1 << idx); Save.write();
    if (!HEADLESS) setTimeout(() => UI.toast('📷 びっくりアルバムに「' + CHAR_DEF[kid].name + '・' + ['くすっ', 'きゃっ', 'わーっ'][idx] + '」', 'gold'), 300);
  },
};
