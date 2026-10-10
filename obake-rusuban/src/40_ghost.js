// ================================================================ the player: ぽわ (possession, anomalies, detection)
const RIM_MAT = new THREE.MeshBasicMaterial({ color: 0xf4f8ff, side: THREE.BackSide, transparent: true, opacity: 0.55, depthWrite: false });
const Ghost = (() => {
  const gm = buildGhost(); gm.visible = false; scene.add(gm);
  const eyes = new THREE.Sprite(new THREE.SpriteMaterial({ map: EYE_TEX, transparent: true, depthTest: false, depthWrite: false })); eyes.scale.set(0.42, 0.21, 1); eyes.renderOrder = 20; eyes.visible = false;
  let rims = [], hostTop = 0.5;
  const S = { host: null, hop: null, exposure: 0, catUsed: false, catT: 0, seenBy: new Set(), lastExpose: 0 };
  function hostObj() { return S.host && S.host.type === 'obj' ? O[S.host.id] : null; }
  function hostPos(out = new V3()) {
    if (!S.host) return out.set(0, 0, 0);
    if (S.host.type === 'cat') { const c = AG.monaka; out.set(c.pos.x, c.pos.y + 0.5, c.pos.z); return FG[c.floor].localToWorld(out); }
    const o = O[S.host.id]; out.set(o.pos.x, o.pos.y + hostTop * 0.6, o.pos.z); return FG[o.floor].localToWorld(out);
  }
  function hostFloor() { if (!S.host) return 1; return S.host.type === 'cat' ? AG.monaka.floor : O[S.host.id].floor; }
  function hostRoom() { if (!S.host) return null; if (S.host.type === 'cat') return AG.monaka.room; const o = O[S.host.id]; return objRoomNow(o); }
  function hostRooms() { if (!S.host) return []; if (S.host.type === 'cat') return [AG.monaka.room]; const o = O[S.host.id]; return o.def.door ? o.rooms : [objRoomNow(o)]; }
  function clearRims() { for (const r of rims) r.parent && r.parent.remove(r); rims = []; eyes.parent && eyes.parent.remove(eyes); eyes.visible = false; }
  function makeRims(o) {
    clearRims();
    const root = o.def.door ? DOORS[o.def.door].mesh : o.g;
    const box = new THREE.Box3();
    root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
    root.traverse(m => {
      if (!m.isMesh || m.material === PICK_MAT || m.material === RIM_MAT || !m.visible) return;
      const r = new THREE.Mesh(m.geometry, RIM_MAT); r.scale.setScalar(1.08); r.renderOrder = -1; m.add(r); rims.push(r);
      m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld)); box.union(bb);
    });
    hostTop = isFinite(box.max.y) ? box.max.y : 0.5;
    if (o.def.door) hostTop = 2.2;
    if (o.def.host.kind === 'inner') hostTop = Math.min(hostTop, 2.0);
    eyes.position.set(0, hostTop + 0.16, 0); if (o.def.door) eyes.position.set(0, 1.5, 0);
    (o.def.door ? DOORS[o.def.door].mesh : o.g).add(eyes); eyes.visible = true;
  }
  function setHost(h) {
    const prev = hostObj(); if (prev) prev.possessed = false;
    S.host = h; clearRims();
    if (h && h.type === 'obj') { const o = O[h.id]; o.possessed = true; makeRims(o); o.wig = 0.4; }
    if (h && h.type === 'cat') { AG.monaka.mesh.add(eyes); eyes.position.set(0, 0.95, 0.2); eyes.visible = true; }
    World.blind = !!(h && h.type === 'obj' && O[h.id].def.host.kind === 'inner') && World.phase === 'chain';
    Hooks.hostChanged && Hooks.hostChanged();
  }
  // ------------------------------------------------ hop rules
  function unlocked(room) { return World.rooms.includes(room); }
  function targetOK(o) { return o && o.def.host && !o.carried && unlocked(o.def.door ? (unlocked(o.rooms[0]) ? o.rooms[0] : o.rooms[1]) : objRoomNow(o)); }
  function canHop(o) {
    if (!targetOK(o) || S.hop) return false;
    const h = S.host; if (!h) return true;
    if (h.type === 'obj' && h.id === o.id) return false;
    if (World.phase !== 'chain') return true;
    const fr = hostRooms(), tr = o.def.door ? o.rooms : [objRoomNow(o)];
    const hf = hostFloor();
    // secret passages
    if (World.day >= 8) {
      if (h.type === 'obj' && h.id === 'oshiire' && tr.includes('akari')) return 'secret';
      if (o.id === 'oshiire' && fr.includes('akari')) return 'secret';
    }
    if (hf !== o.floor) { return (fr.includes('hall') && tr.includes('hall2')) || (fr.includes('hall2') && tr.includes('hall')) ? 'stairs' : false; }
    const hp = h.type === 'cat' ? AG.monaka.pos : O[h.id].pos;
    const same = fr.some(r => tr.includes(r));
    if (h.type === 'obj' && O[h.id].def.host.kind === 'curtain' && same) return 'curtain';
    if (h.type === 'cat' && same) return 'cat';
    const d = Math.hypot(hp.x - o.pos.x, hp.z - o.pos.z);
    if (d > 6.5) return false;
    if (!same && !losClear(hf, hp.x, hp.z, o.pos.x, o.pos.z)) return false;
    return true;
  }
  function hop(o) {
    const how = canHop(o); if (!how) return false;
    if (World.phase !== 'chain' || !S.host) { setHost({ type: 'obj', id: o.id }); Sound.sfx('possess'); burst(o); return true; }
    const from = hostPos(); const fromFloor = hostFloor(); const fromP = (S.host.type === 'cat' ? AG.monaka.pos : O[S.host.id].pos).clone();
    const hidden = how === 'curtain' || how === 'cat' || how === 'secret';
    setHost(null);
    S.hop = { o, t: 0, dur: hidden ? 0.25 : 0.6, from, fromFloor, fromP, hidden, seen: new Set() };
    gm.visible = !hidden; Sound.sfx('hop');
    return true;
  }
  function burst(o) { Parts.burst(o.g.parent, o.pos.clone().add(new V3(0, hostTop * 0.6, 0)), 10, { col: 0xeaf2ff, size: 0.2, life: 0.8, spd: 1.2, up: 1.4, add: true }); }
  const tmp = new V3(), tmp2 = new V3();
  function updateHop(dt) {
    const H = S.hop; if (!H) return;
    H.t += dt / H.dur; const t = Math.min(1, H.t);
    const to = objWorldPos(H.o, tmp2);
    tmp.lerpVectors(H.from, to, t); tmp.y += Math.sin(t * Math.PI) * 1.0;
    gm.position.copy(tmp); gm.position.y -= 0.4; gm.rotation.y += dt * 4;
    if (!H.hidden && World.phase === 'chain') {
      // where is the wisp in floor-local coords? interpolate local positions
      const f = t < 0.5 ? H.fromFloor : H.o.floor;
      const lx = lerp(H.fromP.x, H.o.pos.x, t), lz = lerp(H.fromP.z, H.o.pos.z, t);
      for (const id of FAMILY) {
        const a = AG[id]; if (H.seen.has(id) || !a.home) continue;
        if (canSee(a, f, lx, lz, 1.2, 8)) {
          H.seen.add(id); World.lastWeird = roomAt(f, lx, lz) || World.lastWeird;
          if (a.mode === 'search') expose(0.7, a); else { expose(0.3, a); a.susp = 100; setFace(a, 'surp'); say(a, pick(['い、いま しろいのが…！', 'えっ！？ なにか とんだ！', 'ゆ、ゆうれい！？']), 2.4, 'loud'); }
        }
      }
    }
    if (t >= 1) { S.hop = null; gm.visible = false; setHost({ type: 'obj', id: H.o.id }); Sound.sfx('possess'); burst(H.o); }
  }
  // ------------------------------------------------ anomalies
  function act(actId) {
    const o = hostObj(); if (!o) return false;
    const a = o.def.acts.find(x => x.id === actId); if (!a) return false;
    if (a.can && !a.can(o)) return false;
    if (a.phase && a.phase !== World.phase) return false;
    const cost = a.cost || 1; if (World.power < cost) { UI.toast('ふしぎ力が たりない…', 'red'); Sound.sfx('no'); return false; }
    World.power -= cost;
    a.do(o); o.def.refresh && o.def.refresh(o); o.wig = 0.6;
    Sound.sfx('act');
    Parts.burst(o.g.parent, o.pos.clone().add(new V3(0, hostTop * 0.7, 0)), 14, { col: 0xdfeaff, size: 0.14, life: 0.9, spd: 1.0, up: 1.6, add: true, star: true });
    const id = ev('act:' + o.id + ':' + a.id + ':' + World.events.length, (World.phase === 'prep' ? 'しこみ：' : 'いへん：') + o.def.name + 'を ' + a.label.replace(/^(.*)$/, '$1'), { at: o, player: true, who: 'powa' });
    o.cause = id; o.acts = o.acts || {}; o.acts[a.id] = id;
    World.actLog.push({ obj: o.id, act: a.id, t: World.time, phase: World.phase });
    if (World.phase === 'chain') {
      const room = objRoomNow(o);
      World.heat[room] = (World.heat[room] || 0) + 1;
      // witnesses
      for (const fid of FAMILY) {
        const ag = AG[fid]; if (!ag.home) continue;
        if (canSeeObj(ag, o, 8.5)) {
          World.lastWeird = room;
          if (ag.mode === 'search') expose(0.45, ag);
          else { addSusp(ag, 42, room); setFace(ag, 'surp'); say(ag, pick(['え…？ いま うごいた？', 'あれっ…？', 'ひとりでに…？']), 2.2, 'think'); }
        }
      }
      if ((World.heat[room] || 0) >= 3) for (const fid of FAMILY) { const ag = AG[fid]; if (ag.home && ag.room === room) addSusp(ag, 15, room); }
      if (a.sound) World.noise(o.floor, room, a.sound, 'act:' + o.id + ':' + a.id, o, id);
    }
    Hooks.acted && Hooks.acted(o, a, id);
    return true;
  }
  // ------------------------------------------------ cat trick
  function catNear() {
    const c = AG.monaka; if (!c.home || S.catUsed || World.phase !== 'chain' || !S.host || S.host.type !== 'obj') return false;
    const o = hostObj(); if (o.floor !== c.floor) return false;
    return Math.hypot(o.pos.x - c.pos.x, o.pos.z - c.pos.z) < 5.5 && (hostRooms().includes(c.room) || losClear(c.floor, o.pos.x, o.pos.z, c.pos.x, c.pos.z));
  }
  function useCat() {
    if (!catNear()) return false;
    S.catUsed = true; setHost({ type: 'cat' }); S.catT = 0; Sound.sfx('meow');
    const c = AG.monaka; const room = c.room;
    for (const id of FAMILY) {
      const a = AG[id]; if (!a.home) continue;
      if (a.mode === 'search' || canSee(a, c.floor, c.pos.x, c.pos.z, 0.4, 9) || a.room === room) {
        if (a.mode === 'search') { a.stack.length = Math.max(1, a.stack.length - 1); a.mode = 'normal'; a.lock = 0; a.inspect = null; a.setProp(null); a.anim = 'idle'; a.epoch++; }
        a.susp = 15; setFace(a, 'smile'); say(a, pick(['なーんだ、もなかの しわざか。', 'もなか〜！ あんたね〜', 'ねこか…。びっくりした。']), 2.6);
      }
    }
    for (const k in World.heat) World.heat[k] = Math.floor(World.heat[k] / 2);
    S.exposure = Math.min(S.exposure, 0.2);
    ev('cat:' + World.time, 'もなかの しわざ に した', { at: c, player: true, quiet: false });
    Cat.flee();
    Music.play('chain');
    return true;
  }
  // ------------------------------------------------ detection
  const camF = { plush: 0.55, curtain: 0.7, robot: 1.2, door: 0.8 };
  const lookF = [0, 1.25, 0.8, 0.42, 0.5];
  function expose(n, a) { S.exposure = Math.min(1, S.exposure + n); S.lastExpose = 0; if (a) S.by = a; if (S.exposure >= 1) Hooks.caught && Hooks.caught(a); }
  function updateDetect(dt) {
    if (World.phase !== 'chain' || World.caught) return;
    let inc = 0, by = null; const o = hostObj(); S.near = null;
    if (o) {
      const kind = o.def.host.kind, hide = o.def.host.hide, inner = kind === 'inner';
      const rooms = hostRooms();
      for (const id of FAMILY) {
        const a = AG[id]; if (!a.home) continue;
        if (a.mode === 'search' && rooms.includes(a.searchRoom)) S.near = a;
        if (a.mode !== 'search') continue;
        let v = 0;
        if (a.style === 'look' || a.style === 'tidy') { if (a.inspect === o.id) v = (a.id === 'hiroshi' ? 0.6 : 0.5) * lookF[hide]; }
        else if (a.style === 'touch') { if (a.inspect === o.id) v = inner ? 0.55 : kind === 'plush' ? 0.75 : 1.0; else if (o.def.host.warm && a.floor === o.floor && a.pos.distanceTo(o.pos) < 2.4) v = 0.18; }
        else if (a.style === 'camera' || a.style === 'light') {
          if (!inner && canSee(a, o.floor, o.pos.x, o.pos.z, o.pos.y + 0.2, a.style === 'camera' ? 7.5 : 6.0, a.style === 'camera' ? 46 : 58)) v = (a.style === 'camera' ? 0.6 : 0.55) * (camF[kind] || 1) * (World.day === 1 ? 0.6 : 1);
        }
        if (v > 0) { inc += v; by = a; S.near = a; }
      }
      // a moving robot draws looks
      if (kind === 'robot' && Robo.running) for (const id of FAMILY) { const a = AG[id]; if (a.home && a.mode !== 'search' && canSeeObj(a, o, 7)) addSusp(a, 6 * World.dtm, a.room); }
    }
    if (inc > 0) { S.exposure = Math.min(1, S.exposure + inc * dt); S.lastExpose = 0; S.by = by; if (Math.random() < dt * 3) Sound.sfx('danger'); }
    else { S.lastExpose += dt; if (S.lastExpose > 0.6) S.exposure = Math.max(0, S.exposure - 0.12 * dt); }
    World.maxExposure = Math.max(World.maxExposure || 0, S.exposure);
    if (S.exposure >= 1) Hooks.caught && Hooks.caught(by);
  }
  // ------------------------------------------------ visuals
  let flick = 0;
  function update(dt, dts) {
    updateHop(dts);
    if (S.host && S.host.type === 'cat') {
      S.catT += dts;
      if (S.catT > 9 && !Cat.fleeing) { // shake off into nearest thing
        const c = AG.monaka; let best = null, bd = 99;
        for (const o of Object.values(O)) { if (!targetOK(o) || o.floor !== c.floor) continue; const d = o.pos.distanceTo(c.pos); if (d < bd) { bd = d; best = o; } }
        if (best) { setHost({ type: 'obj', id: best.id }); Sound.sfx('possess'); burst(best); UI.toast('もなかから ' + best.def.name + 'へ うつった'); }
      }
    }
    updateDetect(dts);
    // eyes & rim feedback
    const danger = S.exposure > 0.05 || !!S.near;
    flick += dt;
    eyes.material.map = danger ? EYE_TEX2 : EYE_TEX;
    if (eyes.visible) { const s = danger ? 1 + Math.sin(flick * 20) * 0.08 : 1 + Math.sin(flick * 2) * 0.04; eyes.scale.set(0.42 * s, 0.21 * s, 1); eyes.center.set(0.5 + (danger ? Math.sin(flick * 13) * 0.08 : 0), 0.5); }
    RIM_MAT.opacity = danger ? 0.25 + Math.abs(Math.sin(flick * 14)) * 0.5 : 0.42 + Math.sin(flick * 2.5) * 0.12;
    gm.userData.mat.opacity = 0.7 + Math.sin(flick * 6) * 0.1;
  }
  function reset() { S.hop = null; S.exposure = 0; S.catUsed = false; S.near = null; S.by = null; gm.visible = false; setHost(null); }
  return { S, gm, hostObj, hostPos, hostFloor, hostRoom, hostRooms, setHost, canHop, hop, act, catNear, useCat, expose, update, reset, targetOK, unlocked };
})();

// ---------------------------------------------------------------- the cat もなか: follows the sun, startles, can be possessed
const Cat = (() => {
  const C = { fleeing: false };
  function* life(c) {
    // sunny spots across the day
    const plan = [[T(10), 'living', -6.8, 4.6], [T(12), 'washitsu', 6.6, -1.2], [T(14), 'engawa', 8.8, -4.4], [T(15, 30), 'garden', 11.0, 3.6], [T(16, 10), 'kitchen', 6.8, 2.8], [T(16, 50), 'living', -1.4, 3.6], [T(17, 40), 'living', -6.4, 4.4], [T(18, 20), 'washitsu', 5.6, -1.4]];
    while (true) {
      if (catPianoCheck(c)) { yield* catPiano(c); continue; }
      if (catLetterCheck(c)) { yield* catLetter(c); continue; }
      let cur = plan[0]; for (const p of plan) if (World.time >= p[0]) cur = p;
      const tgt = { room: cur[1], f: 1, x: cur[2], z: cur[3] };
      if (Math.hypot(c.pos.x - tgt.x, c.pos.z - tgt.z) > 0.3 || c.floor !== 1) { yield* go(c, tgt); }
      c.anim = 'sleep'; setFace(c, 'sleep');
      yield* waitS(0.8);
    }
  }
  function* startle(c, from, text) {
    setFace(c, 'surp'); c.anim = 'idle'; Sound.sfx('cat');
    UI.bubble(c, text || 'ニャッ！', 1.4, 'loud');
    const away = from ? new V3(c.pos.x - from.x, 0, c.pos.z - from.z).normalize() : new V3(1, 0, 0);
    // dash to a neighbouring room
    const nb = (NAV[c.room] || []).filter(e => e.via !== 'stairs' && (!DOORS[e.via] || World.doorOpen(e.via)) && !['shed'].includes(e.to));
    const pickE = nb.sort((p, q) => { const a = roomCenter(p.to), b = roomCenter(q.to); return ((b.x - c.pos.x) * away.x + (b.z - c.pos.z) * away.z) - ((a.x - c.pos.x) * away.x + (a.z - c.pos.z) * away.z); })[0];
    if (pickE) { const rc = roomCenter(pickE.to); yield* go(c, { room: pickE.to, f: 1, x: rc.x + rnd(-1, 1), z: rc.z + rnd(-0.8, 0.8) }, { run: true }); }
    setFace(c, 'n');
    yield* waitS(2.0);
  }
  function* flee(c) {
    C.fleeing = true;
    yield* startle(c, null, 'ニャ〜ン');
    C.fleeing = false;
  }
  return {
    get fleeing() { return C.fleeing; },
    start(c) { c.home = true; c.place({ f: 1, x: -6.8, z: 4.6, yaw: 0 }); c.mesh.visible = true; c.stack = [life(c)]; },
    startle(from, text, cause) { const c = AG.monaka; if (!c.home) return false; c.push(startle(c, from, text), true); return true; },
    flee() { const c = AG.monaka; c.push(flee(c), true); },
    gen: { startle },
  };
})();
