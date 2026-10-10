// ================================================================ HUD / overlays / input
const UI = (() => {
  const ov = $('#ov');
  const bubs = []; // {a, el, t, max}
  const marks = {}; const names = {};
  const tgts = {}; let sel = null; let tipKey = null;
  const P = new V3();
  function proj(f, x, y, z) { P.set(x, y, z); FG[f].localToWorld(P); P.project(camera); return { x: (P.x + 1) / 2 * VW, y: (1 - P.y) / 2 * VH, ok: P.z < 1 && P.z > -1 }; }
  function agentHead(a, extra = 0) { return proj(a.floor, a.pos.x, a.pos.y + a.H + 0.15 + extra, a.pos.z); }
  // ------------------------------------------------ speech bubbles
  function bubble(a, text, secs = 2.6, kind) {
    if (HEADLESS) return;
    for (let i = bubs.length - 1; i >= 0; i--) if (bubs[i].a === a) { bubs[i].el.remove(); bubs.splice(i, 1); }
    const el = document.createElement('div'); el.className = 'bub' + (kind ? ' ' + kind : ''); el.textContent = text; ov.appendChild(el);
    bubs.push({ a, el, t: 0, max: secs });
  }
  function clearBubbles() { for (const b of bubs) b.el.remove(); bubs.length = 0; }
  // ------------------------------------------------ toast / tips
  let toastT = null;
  function toast(text, kind) {
    if (HEADLESS) return;
    const t = $('#toast'); t.innerHTML = ''; const d = document.createElement('div'); d.textContent = text; if (kind) d.className = kind; t.appendChild(d);
    clearTimeout(toastT); toastT = setTimeout(() => { t.innerHTML = ''; }, 2600);
  }
  function tip(html, key) { tipKey = key || null; const t = $('#tip'); if (!html) { t.classList.add('hide'); return; } t.innerHTML = html; t.classList.remove('hide'); }
  // ------------------------------------------------ chain log
  function logEv(e) {
    if (HEADLESS) return;
    const L = $('#log'); const d = document.createElement('div'); d.className = 'lg' + (e.depth >= 5 ? ' gold' : '');
    d.innerHTML = `<b>${e.depth}</b><span></span>`; d.querySelector('span').textContent = e.text; L.prepend(d);
    while (L.children.length > 5) L.lastChild.remove();
    [...L.children].forEach((c, i) => c.classList.toggle('old', i > 1));
  }
  function clearLog() { $('#log').innerHTML = ''; }
  // ------------------------------------------------ HUD
  function powerHTML() { let s = '<span style="margin-right:2px">ふしぎ力</span>'; for (let i = 0; i < World.powerMax; i++) s += `<i class="${i < World.power ? '' : 'off'}"></i>`; return s; }
  let lastPow = -1, lastPh = '';
  function hud() {
    $('#hClk').textContent = fmtT(World.time);
    const ph = World.phase === 'prep' ? 'しこみ' : World.phase === 'chain' ? (FAMILY.some(id => AG[id].mode === 'search' && AG[id].home) ? 'かくれんぼ' : 'れんさ') : '';
    if (ph !== lastPh) { lastPh = ph; const e = $('#hPh'); e.textContent = ph; e.style.background = ph === 'しこみ' ? '#8a9ad8' : ph === 'かくれんぼ' ? '#e0504a' : '#f08a3c'; }
    const pk = World.power * 100 + World.powerMax; if (pk !== lastPow) { lastPow = pk; $('#pow').innerHTML = powerHTML(); }
    $('#bReady').classList.toggle('hide', World.phase !== 'prep');
    $('#spd').classList.toggle('hide', World.phase !== 'chain');
    // danger
    const S = Ghost.S; const dg = $('#danger');
    const show = World.phase === 'chain' && (S.exposure > 0.03 || S.near);
    dg.classList.toggle('hide', !show);
    if (show) { $('#dBar').style.width = (S.exposure * 100) + '%'; $('#dTx').textContent = S.exposure > 0.5 ? 'みつかりそう！' : S.near ? (S.near.name + 'が さがしてる') : 'あぶない！'; }
    $('#vign').className = World.blind ? 'inner' : (S.exposure > 0.35 && World.phase === 'chain') ? 'danger' : '';
  }
  // ------------------------------------------------ per-frame overlays
  function frame(dt) {
    if (HEADLESS) return;
    for (let i = bubs.length - 1; i >= 0; i--) {
      const b = bubs[i]; b.t += dt * Math.max(1, Math.sqrt(World.speed || 1));
      if (b.t > b.max || !b.a.home) { b.el.remove(); bubs.splice(i, 1); continue; }
      const p = agentHead(b.a, 0.35); const vis = p.ok && FG[b.a.floor].visible && !World.blind && !b.a.hidden;
      b.el.style.display = vis ? '' : 'none'; if (vis) { b.el.style.left = p.x + 'px'; b.el.style.top = p.y + 'px'; }
    }
    for (const id of FAMILY) {
      const a = AG[id];
      let m = marks[id]; if (!m) { m = marks[id] = document.createElement('div'); m.className = 'mark'; ov.appendChild(m); }
      let n = names[id]; if (!n) { n = names[id] = document.createElement('div'); n.className = 'nm'; n.textContent = a.def.short; ov.appendChild(n); }
      const vis = a.home && FG[a.floor].visible && World.phase === 'chain' && !World.blind && !a.hidden;
      const hasBub = bubs.some(b => b.a === a);
      if (!vis) { m.style.display = 'none'; n.style.display = 'none'; continue; }
      const p = agentHead(a, 0.05);
      if (a.mode === 'search') { m.className = 'mark ex'; m.textContent = '！'; m.style.fontSize = '34px'; m.style.display = hasBub ? 'none' : ''; }
      else if (a.susp > 12) { m.className = 'mark'; m.textContent = '？'; m.style.fontSize = (14 + a.susp * 0.22) + 'px'; m.style.color = a.susp > 70 ? '#ff7a4a' : a.susp > 40 ? '#ffc86a' : '#fff'; m.style.display = hasBub ? 'none' : ''; }
      else m.style.display = 'none';
      m.style.left = p.x + 'px'; m.style.top = p.y + 'px';
      const q = proj(a.floor, a.pos.x, a.pos.y - 0.05, a.pos.z);
      n.style.display = Save.d.cone ? '' : 'none'; n.style.left = q.x + 'px'; n.style.top = (q.y + 2) + 'px';
    }
    // footsteps while blind (inside a closed thing)
    if (World.blind && World.phase === 'chain') {
      for (const id of FAMILY) {
        const a = AG[id]; if (!a.home || a.hidden) continue;
        a._stepT = (a._stepT || 0) - dt; if (a._lastPos && a._lastPos.distanceTo(a.pos) > 0.02 && a._stepT < 0) {
          a._stepT = 0.45; const q = proj(a.floor, a.pos.x, 0.05, a.pos.z);
          if (q.ok && FG[a.floor].visible) { const s = document.createElement('div'); s.className = 'step'; s.style.left = q.x + 'px'; s.style.top = q.y + 'px'; ov.appendChild(s); setTimeout(() => s.remove(), 1000); Sound.sfx('step'); }
        }
        a._lastPos = (a._lastPos || new V3()).copy(a.pos);
      }
    }
    // hop targets
    const showT = (World.phase === 'prep' || World.phase === 'chain') && !Ghost.S.hop && !APP.paused;
    const seen = new Set();
    if (showT) for (const o of Object.values(O)) {
      if (!o.def.host || !FG[o.floor].visible || !Ghost.targetOK(o)) continue;
      const h = Ghost.S.host; if (h && h.type === 'obj' && h.id === o.id) continue;
      const ok = Ghost.canHop(o);
      const p = proj(o.floor, o.pos.x, o.pos.y + (o.def.pickY != null ? o.def.pickY : 0.3), o.pos.z); if (!p.ok) continue;
      let el = tgts[o.id]; if (!el) { el = tgts[o.id] = document.createElement('div'); ov.appendChild(el); }
      el.className = 'tgt' + (ok ? '' : ' far') + (sel === o.id ? ' sel' : ''); el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; el.style.display = '';
      seen.add(o.id);
    }
    for (const k in tgts) if (!seen.has(k)) tgts[k].style.display = 'none';
    if (sel && panelOpen) refreshPanelLive();
  }
  // ------------------------------------------------ object / person panel
  let panelOpen = false, panelSig = '';
  function closePanel() { panelOpen = false; sel = null; $('#panel').classList.add('hide'); }
  function openObj(id) { sel = id; panelOpen = true; panelSig = ''; refreshPanelLive(true); Sound.sfx('tap'); }
  function openAgent(a) { sel = 'ag:' + a.id; panelOpen = true; panelSig = ''; refreshPanelLive(true); Sound.sfx('tap'); }
  function actLabel(a, o) { return a.label; }
  function refreshPanelLive(force) {
    const p = $('#panel');
    if (!sel) return;
    if (sel.startsWith('ag:')) {
      const a = AG[sel.slice(3)]; const sig = a.id + Math.round(a.susp / 10) + a.mode + a.home;
      if (!force && sig === panelSig) return; panelSig = sig;
      const H = HABITS[a.id] || {};
      const sus = a.mode === 'search' ? '<b style="color:#e0504a">さがしている！</b>' : a.susp > 70 ? 'かなり あやしんでいる' : a.susp > 35 ? 'すこし あやしんでいる' : a.susp > 12 ? 'ちょっと へんだと おもっている' : 'いつもどおり';
      p.innerHTML = `<div class="hd"><span class="t">${a.def.name}</span><span class="rm">${a.home ? (ROOMS[a.room] ? ROOMS[a.room].name : '') : 'おでかけ中'}</span><button class="x" data-x>×</button></div><div class="st"><span>きもち：<b>${sus}</b></span><span>さがしかた：<b>${H.search || ''}</b></span></div><div class="ds">${(H.habit || []).map(x => '・' + x).join('<br>')}</div>`;
      p.classList.remove('hide'); return;
    }
    const o = O[sel]; if (!o) { closePanel(); return; }
    const h = Ghost.S.host; const isHost = h && h.type === 'obj' && h.id === o.id;
    const hop = Ghost.canHop(o);
    const sig = [o.id, isHost, !!hop, World.power, World.phase, JSON.stringify(o.st), Ghost.catNear(), Ghost.S.hop ? 1 : 0, World.doorOpen(o.def.door || '')].join('|');
    if (!force && sig === panelSig) return; panelSig = sig;
    const H = o.def.host || {};
    const room = o.def.door ? o.rooms.filter(r => ROOMS[r]).map(r => ROOMS[r].name).join('／') : (ROOMS[objRoomNow(o)] || {}).name || '';
    let html = `<div class="hd"><span class="t">${o.def.name}</span><span class="rm">${room}</span><button class="x" data-x>×</button></div>`;
    if (o.def.host) html += `<div class="st"><span>かくれやすさ：<b>${HIDE_TXT[H.hide] || ''}</b></span><span>うごきやすさ：<b>${MOVE_TXT[H.move || 'none']}</b></span>${H.warm ? '<span><b>のりうつると あたたかい</b></span>' : ''}</div>`;
    html += `<div class="ds">${o.def.desc || ''}</div><div class="acts">`;
    if (!isHost) {
      if (o.def.host) {
        const why = !Ghost.targetOK(o) ? 'まだ いけない ばしょ' : Ghost.S.hop ? 'いどうちゅう' : !hop ? 'とおすぎる・かべの むこう' : '';
        html += `<button class="ab go" data-hop ${hop ? '' : 'disabled'}>👻 のりうつる${why ? `<span class="c">${why}</span>` : (World.phase === 'chain' && hop === true ? '<span class="c">とんでいる あいだ 見られるかも</span>' : hop === 'curtain' || hop === 'cat' || hop === 'secret' ? '<span class="c">こっそり うつれる</span>' : '')}</button>`;
      }
    } else {
      for (const a of o.def.acts || []) {
        const can = (!a.can || a.can(o)) && (!a.phase || a.phase === World.phase);
        const cost = a.cost || 1;
        html += `<button class="ab" data-act="${a.id}" ${can && World.power >= cost ? '' : 'disabled'}>${actLabel(a, o)}${a.sound >= 0.5 && World.phase === 'chain' ? '<span class="snd">おと 大</span>' : ''}<span class="c">ふしぎ力 ${cost}</span></button>`;
      }
      if (!(o.def.acts || []).length) html += `<div class="ds" style="margin:0">ここでは かくれるだけ。</div>`;
      if (o.id === 'robo' && World.phase === 'chain' && !Robo.running) for (const r of ['living', 'kitchen', 'hall'].filter(r => r !== objRoomNow(o) && Ghost.unlocked(r))) html += `<button class="ab" data-robo="${r}">🧹 ${ROOMS[r].name}へ はしる<span class="snd">おと</span></button>`;
      if (Ghost.catNear()) html += `<button class="ab cat" data-cat>🐈 もなかに のりうつる（ねこの しわざ）<span class="c">1日1回</span></button>`;
    }
    html += '</div>';
    p.innerHTML = html; p.classList.remove('hide');
  }
  $('#panel').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; Sound.unlock();
    if (b.dataset.x != null) { closePanel(); return; }
    if (b.dataset.hop != null) { const o = O[sel]; if (Ghost.hop(o)) { Hooks.hopped && Hooks.hopped(o); refreshPanelLive(true); } return; }
    if (b.dataset.act) { if (Ghost.act(b.dataset.act)) { Hooks.afterAct && Hooks.afterAct(b.dataset.act); refreshPanelLive(true); } return; }
    if (b.dataset.robo) { Robo.start(b.dataset.robo); Sound.sfx('robot'); World.noise(1, objRoomNow(O.robo), 0.4, 'robo', O.robo); refreshPanelLive(true); return; }
    if (b.dataset.cat != null) { if (Ghost.useCat()) { UI.toast('ねこの しわざ！', 'gold'); closePanel(); } return; }
  });
  // ------------------------------------------------ pointer input on the canvas
  const ray = new THREE.Raycaster(); const ptrs = new Map(); let downAt = null, moved = 0, pinch0 = 0, lastTap = 0;
  function pickAt(x, y) {
    ray.setFromCamera({ x: x / VW * 2 - 1, y: -(y / VH) * 2 + 1 }, camera);
    const list = [];
    for (const o of Object.values(O)) if (o.pick && FG[o.floor].visible) list.push(o.pick);
    for (const id of FAMILY) { const a = AG[id]; if (a.home && a.mesh.visible && FG[a.floor].visible) list.push(a.mesh); }
    const hits = ray.intersectObjects(list, true);
    for (const h of hits) {
      let n = h.object; while (n && !n.userData.obj && !(n.userData.parts && !n.userData.obj)) n = n.parent;
      if (!n) continue;
      if (n.userData.obj) return { obj: n.userData.obj };
      for (const id of FAMILY) if (AG[id].mesh === n) return { ag: AG[id] };
    }
    // floor → room
    const fl = []; for (const f of [1, 2]) if (FG[f].visible) STATIC[f].children.forEach(c => c.userData.room && fl.push(c));
    const fh = ray.intersectObjects(fl, false); if (fh.length) return { room: fh[0].object.userData.room };
    return null;
  }
  canvas.addEventListener('pointerdown', e => {
    Sound.unlock(); canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) { downAt = { x: e.clientX, y: e.clientY, t: performance.now() }; moved = 0; }
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); moved = 99; }
  });
  canvas.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (ptrs.size === 1 && APP.mode === 'play') {
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 8) { // pan in ground plane
        const s = View.dist / VH * 1.25; const yaw = View.yaw;
        const rx = Math.cos(yaw), rz = -Math.sin(yaw), fx = -Math.sin(yaw), fz = -Math.cos(yaw);
        View.targetT.x -= (dx * rx - dy * fx * 1.4) * s; View.targetT.z -= (dx * rz - dy * fz * 1.4) * s;
        View.targetT.x = clamp(View.targetT.x, -12, 20); View.targetT.z = clamp(View.targetT.z, -12, 12);
      }
    } else if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch0 > 0) { View.distT = clamp(View.distT * pinch0 / d, 10, 60); pinch0 = d; }
    }
  });
  const up = e => {
    if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId);
    if (ptrs.size === 0 && downAt && moved < 8 && APP.mode === 'play') {
      const now = performance.now(); const hit = pickAt(e.clientX, e.clientY);
      if (hit && hit.obj) openObj(hit.obj);
      else if (hit && hit.ag) openAgent(hit.ag);
      else if (hit && hit.room) { if (now - lastTap < 320) View.zoomRoom(hit.room); else closePanel(); }
      else closePanel();
      lastTap = now;
    }
    if (ptrs.size < 2) pinch0 = 0;
  };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', e => { e.preventDefault(); View.distT = clamp(View.distT * Math.exp(e.deltaY * 0.0012), 10, 60); }, { passive: false });
  addEventListener('keydown', e => {
    if (APP.mode !== 'play') return;
    if (e.code === 'KeyQ') View.setYaw(View.yawI - 1);
    if (e.code === 'KeyE') View.setYaw(View.yawI + 1);
    if (e.code === 'Digit1') View.setFloor(1); if (e.code === 'Digit2') View.setFloor(2); if (e.code === 'Digit3' || e.code === 'Digit0') View.setFloor(0);
    if (e.code === 'KeyX') View.xrayT = 1;
    if (e.code === 'Space') { e.preventDefault(); Hooks.togglePause && Hooks.togglePause(); }
    if (e.code === 'Escape') Hooks.menu && Hooks.menu();
  });
  addEventListener('keyup', e => { if (e.code === 'KeyX') View.xrayT = 0; });
  // HUD buttons
  $('#bRotL').onclick = () => { View.setYaw(View.yawI - 1); Sound.sfx('tap'); };
  $('#bRotR').onclick = () => { View.setYaw(View.yawI + 1); Sound.sfx('tap'); };
  $$('#flr button').forEach(b => b.onclick = () => { View.setFloor(+b.dataset.f); Sound.sfx('tap'); });
  const xb = $('#bXray');
  xb.addEventListener('pointerdown', e => { e.preventDefault(); View.xrayT = 1; xb.classList.add('on'); });
  const xu = () => { View.xrayT = 0; xb.classList.remove('on'); };
  xb.addEventListener('pointerup', xu); xb.addEventListener('pointerleave', xu); xb.addEventListener('pointercancel', xu);
  $$('#spd button').forEach(b => b.onclick = () => { World.speed = +b.dataset.s; $$('#spd button').forEach(c => c.classList.toggle('on', c === b)); Sound.sfx('tap'); });
  $('#goal').onclick = () => { const s = $('#gSub'); s.style.display = s.style.display === 'block' ? '' : 'block'; };
  return {
    bubble, clearBubbles, toast, tip, logEv, clearLog, hud, frame, closePanel, openObj, refreshPanelLive,
    get sel() { return sel; }, get tipKey() { return tipKey; },
    clearMarks() { for (const k in tgts) tgts[k].style.display = 'none'; for (const k in marks) marks[k].style.display = 'none'; for (const k in names) names[k].style.display = 'none'; },
  };
})();
const HABITS = {
  hiroshi: { search: 'ものを ひとつずつ しらべる。いちど うたがうと しつこい', habit: ['かえると 2かいで きがえる', 'ソファで ニュースを みる（テレビに むちゅう）', 'じっかの ふるい ラジオを すてられない…？'] },
  misaki: { search: 'ちらかった ものから かたづけながら さがす', habit: ['かえると すぐ せんたくものを とりこむ', '5時すぎ ろうかで せんたくものを たたむ', '夕方は しごと、6時まえから りょうり'] },
  akari: { search: 'スマホの カメラで へやを うつす（気配が うつる）', habit: ['かえると まず じぶんの へやで カメラと スマホ', '写真部。家族の 写真を こっそり…？'] },
  sota: { search: 'かいちゅうでんとうで てらす（光で のりうつりが とけかける）', habit: ['3時半に かえって プリン', '17時の アニメを かかさない（台所の 時計で たしかめる）', 'こわがりで こうきしん おうせい'] },
  fumi: { search: 'さわって「あたたかさ」で 気配を さぐる。いちばん てごわい', habit: ['3時に えんがわで お茶', 'そのあと 和室で あみもの', '5時半から だいどころの てつだい'] },
};
