// ================================================================ HUD / overlays / input
const UI = (() => {
  const ov = $('#ov');
  const bubs = []; const hms = {}; const tgts = {};
  const P = new V3();
  function proj(f, x, y, z) { P.set(x, y, z); FG[f].localToWorld(P); P.project(camera); return { x: (P.x + 1) / 2 * VW, y: (1 - P.y) / 2 * VH, ok: P.z < 1 && P.z > -1 }; }
  function head(a, extra = 0) { return proj(a.floor, a.pos.x, a.pos.y + a.H + 0.15 + extra, a.pos.z); }
  function bubble(a, text, secs = 2.4, kind) {
    if (HEADLESS) return;
    for (let i = bubs.length - 1; i >= 0; i--) if (bubs[i].a === a) { bubs[i].el.remove(); bubs.splice(i, 1); }
    const el = document.createElement('div'); el.className = 'bub' + (kind ? ' ' + kind : ''); el.textContent = text; ov.appendChild(el);
    bubs.push({ a, el, t: 0, max: secs });
  }
  function clearBubbles() { for (const b of bubs) b.el.remove(); bubs.length = 0; }
  let toastT = null;
  function toast(text, kind) {
    if (HEADLESS) return;
    const t = $('#toast'); t.innerHTML = ''; const d = document.createElement('div'); d.textContent = text; if (kind) d.className = kind; t.appendChild(d);
    clearTimeout(toastT); toastT = setTimeout(() => { t.innerHTML = ''; }, 2400);
  }
  let tipKey = null;
  function tip(html, key, secs) { tipKey = key || null; const t = $('#tip'); if (!html) { t.classList.add('hide'); return; } t.innerHTML = html; t.classList.remove('hide'); if (secs) { const k = key; setTimeout(() => { if (tipKey === k) tip(null); }, secs * 1000); } }
  // ------------------------------------------------ kid cards + meters
  const faceURL = {};
  function faceImg(id, expr) { const k = id + expr; if (!faceURL[k]) { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = CHAR_DEF[id].skin; x.beginPath(); x.arc(32, 32, 30, 0, TAU); x.fill(); x.drawImage(faceTexFor(id, expr).image, 0, 0, 64, 64); faceURL[k] = c.toDataURL(); } return faceURL[k]; }
  function meterHTML() { return '<div class="meter"><div class="bd"></div><div class="cl"></div><div class="v"></div></div>'; }
  function setMeter(el, a) {
    const [lo, hi] = band(a), cl = cryLine(a), mx = Math.max(100, cl + 4);
    const bd = el.querySelector('.bd'), c = el.querySelector('.cl'), v = el.querySelector('.v');
    bd.style.left = (lo / mx * 100) + '%'; bd.style.width = ((hi - lo) / mx * 100) + '%';
    c.style.width = ((mx - cl) / mx * 100) + '%';
    v.style.left = (Math.min(a.doki, mx) / mx * 100) + '%';
  }
  function buildKids() {
    const k = $('#kids'); k.innerHTML = '';
    for (const id of FAMILY) {
      const d = document.createElement('div'); d.className = 'kc'; d.id = 'kc_' + id; d.style.setProperty('--kc', CHAR_DEF[id].tag);
      d.innerHTML = `<div class="nm2"><img class="fc" alt=""><span>${CHAR_DEF[id].name}</span></div>${meterHTML()}<div class="st"></div>`;
      k.appendChild(d);
    }
    for (const id in hms) { hms[id].remove(); delete hms[id]; }
  }
  function kidState(a) {
    if (a.left) return a.cried ? 'ないて かえった' : 'かえった';
    if (!a.home) return 'まだ きていない';
    if (a.mode === 'search') return 'さがしている！';
    if (a.asleep) return 'ねている';
    const [lo, hi] = band(a);
    return a.doki > hi ? 'こわすぎ！' : a.doki >= lo ? 'たのしい！' : 'たいくつ…';
  }
  let lastExpr = {};
  function hud() {
    $('#hClk').textContent = fmtT(World.time);
    $('#hChime').style.width = (clamp((World.time - T0) / (T1 - T0), 0, 1) * 100) + '%';
    for (const id of FAMILY) {
      const a = AG[id], el = $('#kc_' + id); if (!el) continue;
      setMeter(el, a); el.classList.toggle('out', !a.home);
      const e = a.expr || 'n'; if (lastExpr[id] !== e) { lastExpr[id] = e; el.querySelector('.fc').src = faceImg(id, e); }
      el.querySelector('.st').textContent = kidState(a);
    }
    let s = '<span style="margin-right:2px">あやしい</span>'; for (let i = 0; i < 3; i++) s += `<i class="${i < World.sus ? 'on' : ''}">？</i>`;
    if ($('#sus').dataset.v !== String(World.sus)) { $('#sus').innerHTML = s; $('#sus').dataset.v = World.sus; }
    const sb = $('#searchBar'); sb.classList.toggle('hide', !World.search);
    if (World.search) { $('#sbT').textContent = Math.max(0, Math.ceil(World.search.t)); $('#bCat').disabled = Ghost.S.catUsed; $('#bCat').textContent = Ghost.S.catUsed ? '🐈 もう つかった' : '🐈 もなかを うごかす'; }
    $('#bReady').classList.toggle('hide', World.phase !== 'explore');
    $('#spd').classList.toggle('hide', World.phase !== 'play');
    $('#vign').className = World.search ? 'danger' : '';
    $('#vign').style.opacity = World.search ? (0.35 + Ghost.S.danger * 0.65) : '';
  }
  // ------------------------------------------------ per frame overlays
  function frame(dt) {
    if (HEADLESS) return;
    for (let i = bubs.length - 1; i >= 0; i--) {
      const b = bubs[i]; b.t += dt * Math.max(1, World.speed || 1);
      if (b.t > b.max || !b.a.home) { b.el.remove(); bubs.splice(i, 1); continue; }
      const p = head(b.a, 0.55); const vis = p.ok && FG[b.a.floor].visible;
      b.el.style.display = vis ? '' : 'none'; if (vis) { b.el.style.left = p.x + 'px'; b.el.style.top = p.y + 'px'; }
    }
    for (const id of FAMILY) {
      const a = AG[id]; let m = hms[id];
      if (!m) { m = hms[id] = document.createElement('div'); m.className = 'hm'; m.innerHTML = meterHTML(); ov.appendChild(m); }
      const vis = a.home && FG[a.floor].visible && (World.phase === 'play') && !bubs.some(b => b.a === a);
      m.style.display = vis ? '' : 'none'; if (!vis) continue;
      const p = head(a, 0.12); m.style.left = p.x + 'px'; m.style.top = p.y + 'px'; setMeter(m, a); m.classList.toggle('sleep', !!a.asleep);
    }
    const showT = (World.phase === 'explore' || World.phase === 'play') && !Ghost.S.hop && !APP.paused;
    const seen = new Set();
    if (showT) for (const o of Object.values(O)) {
      if (!o.def.host || !FG[o.floor].visible || o.id === Ghost.S.host) continue;
      const ok = Ghost.canHop(o);
      const p = proj(o.floor, o.pos.x, o.pos.y + (o.def.pickY != null ? o.def.pickY : 0.3), o.pos.z); if (!p.ok) continue;
      let el = tgts[o.id]; if (!el) { el = tgts[o.id] = document.createElement('div'); ov.appendChild(el); }
      el.className = 'tgt' + (ok ? '' : ' far'); el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; el.style.display = '';
      seen.add(o.id);
    }
    for (const k in tgts) if (!seen.has(k)) tgts[k].style.display = 'none';
    panel();
  }
  // ------------------------------------------------ the host panel (scare button)
  let pSig = '', kidSel = null;
  function panel() {
    const p = $('#panel');
    if (kidSel) return;
    const o = Ghost.hostObj();
    if (!o || !(World.phase === 'play' || World.phase === 'explore')) { p.classList.add('hide'); pSig = ''; return; }
    const sd = scareDef(o);
    const sig = o.id + '|' + !!World.search + '|' + World.phase + '|' + Ghost.blocked();
    if (sig === pSig) { const b = $('#bScare'); if (b) b.disabled = o.cd > 0 || !!World.search; return; }
    pSig = sig;
    const H = o.def.host;
    p.innerHTML = `<div class="hd"><span class="t">${o.def.name}</span><span class="rm">${ROOMS[objRoomNow(o)] ? ROOMS[objRoomNow(o)].name : ''}</span><span class="rm">かくれやすさ：${HIDE_TXT[H.hide] || ''}</span></div>
      <div class="scare"><button id="bScare" ${World.search ? 'disabled' : ''}>おどかす<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#f08a3c" stroke-width="7" stroke-dasharray="289" stroke-dashoffset="289" id="chg"/></svg></button>
      <div class="lbs">${World.search ? '<b>おばけさがし中</b> おどかせない。にげよう！' + (Ghost.blocked() ? '<br><b style="background:#f4c0b8">入り口を ふさがれた！</b>' : '') : World.phase === 'explore' ? '<b>ためし</b> いまは 子どもが いない。どんな うごきか ためせるよ' : ''}${!World.search && sd ? `<div><b>かるく</b>${sd.s[0]}</div><div><b>ながおし</b>${sd.b[0]}</div>${sd.tip ? `<div class="tp">${sd.tip}</div>` : ''}` : ''}</div></div>`;
    p.classList.remove('hide');
    hookScare($('#bScare'));
  }
  // tap = small, hold = big
  let hold = null;
  function doScare(big) { if (World.phase === 'explore') { const o = Ghost.hostObj(); if (o && o.cd <= 0) { o.cd = big ? 1.2 : 0.5; scareFx(o, big); } return; } Ghost.scare(big); }
  function hookScare(b) {
    if (!b) return;
    const ring = b.querySelector('#chg');
    const start = e => { e.preventDefault(); Sound.unlock(); if (b.disabled) return; hold = { t0: performance.now(), done: false }; const step = () => { if (!hold) { ring.style.strokeDashoffset = 289; return; } const k = Math.min(1, (performance.now() - hold.t0) / 450); ring.style.strokeDashoffset = 289 * (1 - k); if (k >= 1 && !hold.done) { hold.done = true; doScare(true); } requestAnimationFrame(step); }; step(); };
    const end = e => { if (!hold) return; if (!hold.done) doScare(false); hold = null; };
    b.addEventListener('pointerdown', start); b.addEventListener('pointerup', end); b.addEventListener('pointerleave', () => { hold = null; }); b.addEventListener('pointercancel', () => { hold = null; });
    b.addEventListener('contextmenu', e => e.preventDefault());
  }
  let keyHold = null;
  addEventListener('keydown', e => {
    if (e.code === 'Space' && APP.mode === 'play' && !e.repeat) { e.preventDefault(); keyHold = performance.now(); setTimeout(() => { if (keyHold && performance.now() - keyHold >= 440) { keyHold = null; doScare(true); } }, 460); }
  });
  addEventListener('keyup', e => { if (e.code === 'Space' && keyHold) { keyHold = null; doScare(false); } });
  function showKid(a) {
    kidSel = a.id; const P = kidP(a); const [lo, hi] = band(a); const p = $('#panel');
    p.innerHTML = `<div class="hd"><span class="t">${a.def.name}</span><span class="rm">${kidState(a)}</span><button class="x" data-x>×</button></div><div class="ds">${P.line}<br>💡 ${P.tip}<br>ちょうどいい帯：${lo}〜${hi}（${cryLine(a)}で 泣いて かえる）</div>`;
    p.classList.remove('hide'); pSig = '';
    p.querySelector('[data-x]').onclick = () => { kidSel = null; };
    setTimeout(() => { if (kidSel === a.id) kidSel = null; }, 5000);
  }
  // ------------------------------------------------ pointer input
  const ray = new THREE.Raycaster(); const ptrs = new Map(); let downAt = null, moved = 0, pinch0 = 0, lastTap = 0;
  function pickAt(x, y) {
    ray.setFromCamera({ x: x / VW * 2 - 1, y: -(y / VH) * 2 + 1 }, camera);
    const list = [];
    for (const o of Object.values(O)) if (o.pick && FG[o.floor].visible) list.push(o.pick);
    for (const id of FAMILY) { const a = AG[id]; if (a.home && a.mesh.visible && FG[a.floor].visible) list.push(a.mesh); }
    const hits = ray.intersectObjects(list, true);
    for (const h of hits) {
      let n = h.object; while (n && !n.userData.obj && !n.userData.parts) n = n.parent;
      if (!n) continue;
      if (n.userData.obj) return { obj: n.userData.obj };
      for (const id of FAMILY) if (AG[id].mesh === n) return { ag: AG[id] };
    }
    const fl = []; for (const f of [1, 2]) if (FG[f].visible) STATIC[f].children.forEach(c => c.userData.room && fl.push(c));
    const fh = ray.intersectObjects(fl, false); if (fh.length) return { room: fh[0].object.userData.room };
    return null;
  }
  canvas.addEventListener('pointerdown', e => {
    Sound.unlock(); canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) { downAt = { x: e.clientX, y: e.clientY }; moved = 0; }
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); moved = 99; }
  });
  canvas.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (ptrs.size === 1 && APP.mode === 'play') {
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 8) { const s = View.dist / VH * 1.25; const yaw = View.yaw; const rx = Math.cos(yaw), rz = -Math.sin(yaw), fx = -Math.sin(yaw), fz = -Math.cos(yaw);
        View.targetT.x = clamp(View.targetT.x - (dx * rx - dy * fx * 1.4) * s, -12, 20); View.targetT.z = clamp(View.targetT.z - (dx * rz - dy * fz * 1.4) * s, -12, 12); }
    } else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch0 > 0) { View.distT = clamp(View.distT * pinch0 / d, 10, 60); pinch0 = d; } }
  });
  const up = e => {
    if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId);
    if (ptrs.size === 0 && downAt && moved < 8 && APP.mode === 'play') {
      const now = performance.now(); const hit = pickAt(e.clientX, e.clientY);
      if (hit && hit.obj) { const o = O[hit.obj]; if (o.id !== Ghost.S.host) { if (Ghost.hop(o)) { Sound.sfx('tap'); kidSel = null; } else { toast(Ghost.whyNot(o)); Sound.sfx('no'); } } }
      else if (hit && hit.ag) showKid(hit.ag);
      else if (hit && hit.room && now - lastTap < 320) View.zoomRoom(hit.room);
      lastTap = now;
    }
    if (ptrs.size < 2) pinch0 = 0;
  };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', e => { e.preventDefault(); View.distT = clamp(View.distT * Math.exp(e.deltaY * 0.0012), 10, 60); }, { passive: false });
  addEventListener('keydown', e => {
    if (APP.mode !== 'play') return;
    if (e.code === 'KeyQ') View.setYaw(View.yawI - 1); if (e.code === 'KeyE') View.setYaw(View.yawI + 1);
    if (e.code === 'Digit1') View.setFloor(1); if (e.code === 'Digit2') View.setFloor(2); if (e.code === 'Digit3') View.setFloor(0);
    if (e.code === 'KeyX') View.xrayT = 1;
    if (e.code === 'Escape' || e.code === 'KeyP') Hooks.menu && Hooks.menu();
  });
  addEventListener('keyup', e => { if (e.code === 'KeyX') View.xrayT = 0; });
  $('#bRotL').onclick = () => { View.setYaw(View.yawI - 1); Sound.sfx('tap'); };
  $('#bRotR').onclick = () => { View.setYaw(View.yawI + 1); Sound.sfx('tap'); };
  $$('#flr button').forEach(b => b.onclick = () => { View.setFloor(+b.dataset.f); Sound.sfx('tap'); });
  const xb = $('#bXray');
  xb.addEventListener('pointerdown', e => { e.preventDefault(); View.xrayT = 1; xb.classList.add('on'); });
  const xu = () => { View.xrayT = 0; xb.classList.remove('on'); };
  xb.addEventListener('pointerup', xu); xb.addEventListener('pointerleave', xu); xb.addEventListener('pointercancel', xu);
  $$('#spd button').forEach(b => b.onclick = () => { World.speed = +b.dataset.s; $$('#spd button').forEach(c => c.classList.toggle('on', c === b)); Sound.sfx('tap'); });
  $('#bCat').onclick = () => { if (Ghost.useCat()) { toast('「なんだ、ねこかぁ」', 'gold'); } };
  return {
    bubble, clearBubbles, toast, tip, hud, frame, buildKids, faceImg,
    get tipKey() { return tipKey; },
    clear() { clearBubbles(); for (const k in tgts) tgts[k].style.display = 'none'; for (const k in hms) hms[k].style.display = 'none'; $('#panel').classList.add('hide'); pSig = ''; kidSel = null; },
  };
})();
