// ================================================================ game state / HUD
const SAVE_KEY = 'chibikko-auto-v1';
const GAME = {
  playing: false, paused: false, money: 0, wanted: 0, wantedT: 99, mission: null, ms: null, save: {}, timeScale: 1, nearCar: null, area: '', cine: null,
  helpT: 0, bigT: 0, subT: 0, police: [], bustT: 0, starTotal: 0, stunt: null, startMarkers: [],
  load() { try { this.save = JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch (e) { this.save = {}; } this.money = this.save.money || 0; this.save.done = this.save.done || {}; },
  saveNow() { this.save.money = this.money; try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.save)); } catch (e) { } },
  addMoney(n) { this.money = Math.max(0, this.money + n); this.moneyFlash = 1; },
  help(html, dur) { const e = $('#help'); e.innerHTML = html; e.style.opacity = '1'; this.helpT = dur || 3; },
  obj(html) { if (this._obj !== html) { this._obj = html; $('#obj').innerHTML = html || ''; } },
  say(who, text, dur) { const e = $('#sub'); e.innerHTML = (who ? `<span class="who">${who}：</span>` : '') + text; e.style.opacity = '1'; this.subT = dur || Math.max(3.5, text.length * 0.12); AU.speak(text); },
  big(t1, t2, cls, dur) { const e = $('#big'); e.className = cls || ''; e.querySelector('.t1').textContent = t1; e.querySelector('.t2').innerHTML = t2 || ''; e.style.opacity = '1'; this.bigT = dur || 3.2; },
  timer(t) { const e = $('#timer'); if (t == null) e.classList.add('hide'); else { e.classList.remove('hide'); e.textContent = fmtTime(t); } },
  counter(s) { const e = $('#counter'); if (s == null) e.classList.add('hide'); else { e.classList.remove('hide'); e.textContent = s; } },

  // ---------------------------------------------- events
  onEnter(v) {
    const e = $('#vehN'); e.textContent = v.T.label; e.style.opacity = '1'; this.vehT = 2.5;
    if (!v.T.siren || v.T.siren === 'police') { AU.setRadio(true); this.showRadio(); }
    this.sirenOn = false; CAM.userT = 9; CAM.yaw = lerpAng(CAM.yaw, v.h, 0.6);
  },
  onExit(v) { AU.setRadio(false); v.siren = this.mission && this.ms && this.ms.veh === v ? v.siren : false; },
  onCrash(hit) {
    const o = hit.what;
    if (o && o.T && hit.impact > 7) {
      if (o.ai === 'police') this.addWanted(1);
      else if (o.ai === 'lane') this.addWanted(0.5);
      if (o.ai === 'lane' && o.driver) bubble(pick(['もー！', 'あぶないよ〜！', 'こら〜！', 'びっくり！']), o, 1.5);
    }
  },
  onPedHit(p) { this.addWanted(1); },
  onPedDodge(p) { if (onRaised(PLAYER.x, PLAYER.z)) this.addWanted(0.25); },
  onProp(p) { if (p.type === 'post') this.addWanted(0.3); },
  addWanted(x) {
    if (this.mission) return;
    const before = Math.ceil(this.wanted);
    this.wanted = Math.min(4, this.wanted + x); this.wantedT = 0;
    if (Math.ceil(this.wanted) > before) { AU.wanted(); if (before === 0) this.say('', 'あっ！ <b>おまわりさん</b>が おいかけて きた！ にげろ〜！', 3); }
  },

  // ---------------------------------------------- missions
  startMission(def) {
    if (this.mission) return;
    this.clearWanted();
    this.mission = def; this.ms = { def };
    for (const m of this.startMarkers) { m.hidden = true; m.armed = false; }
    this.big(def.name, def.desc, 'mission', 3);
    AU.whoosh();
    def.start(this.ms);
  },
  pass(M, extra, bonus) {
    const def = this.mission; if (!def) return;
    const reward = def.reward + (bonus || 0);
    this.addMoney(reward);
    const first = !this.save.done[def.id];
    this.save.done[def.id] = 1; this.saveNow();
    this.big('ミッション クリア！', `+$${reward}` + (extra ? `<br>${extra}` : '') + (first ? '<br>⭐ はじめて クリア！' : ''), 'pass', 5);
    AU.pass(); AU.speak('ミッション クリア！');
    const o = PLAYER.veh || PLAYER; fxConfetti(o.x, (o.y || 0) + 2, o.z, 120);
    this.endMission();
  },
  endMission() {
    const def = this.mission; if (!def) return;
    try { def.cleanup(this.ms); } catch (e) { console.error(e); }
    this.mission = null; this.ms = null; this.obj('');
    setTimeout(() => { for (const m of this.startMarkers) m.hidden = false; }, 4000);
    this.cool = 4;
  },
  quitMission() { if (!this.mission) return; this.endMission(); this.big('ミッション ちゅうし', '', 'busted', 2); },

  // ---------------------------------------------- wanted / police
  clearWanted() {
    this.wanted = 0;
    for (const v of this.police) { v.siren = false; if (VEH.includes(v)) { v.ai = 'park'; v.parkT = 99; recycleToLane(v); } }
    this.police = []; this.bustT = 0;
  },
  updateWanted(dt) {
    this.wantedT += dt;
    if (this.wantedT > 9 && this.wanted > 0) { this.wanted = Math.max(0, this.wanted - dt * 0.14); if (this.wanted === 0) { this.clearWanted(); this.help('🚓 にげきった！ おまわりさんは かえって いったよ', 3); } }
    const stars = Math.ceil(this.wanted - 0.001);
    const want = Math.min(3, stars);
    this.police = this.police.filter(v => VEH.includes(v));
    if (this.police.length < want && (this.police.length === 0 || Math.random() < dt * 1.5)) {
      // spawn a chaser at a node 60–110m away
      const cands = [];
      for (let i = 0; i <= NB; i++) for (let j = 0; j <= NB; j++) { const [x, z] = nodePos(i, j), d = Math.hypot(x - PLAYER.x, z - PLAYER.z); if (d > 60 && d < 120) cands.push([x, z]); }
      if (cands.length) {
        const [x, z] = pick(cands);
        let v = VEH.find(o => o.type === 'police' && o.ai === 'lane' && distToPlayer(o) > 50 && !this.police.includes(o));
        if (v) { v.x = x; v.z = z; } else v = placeVehicle('police', x, z, 0);
        if (v) { v.ai = 'police'; v.driver = true; v.lane = null; v.siren = true; v.h = Math.atan2(PLAYER.x - x, PLAYER.z - z); v.vx = v.vz = 0; v.wp = null; v.stuckT = 0; v.revT = 0; this.police.push(v); }
      }
    }
    // caught?
    let close = false;
    const o = PLAYER.veh || PLAYER, spd = PLAYER.veh ? Math.abs(PLAYER.veh.vf) : Math.hypot(PLAYER.vx, PLAYER.vz);
    for (const v of this.police) if (Math.hypot(v.x - o.x, v.z - o.z) < (PLAYER.veh ? 6 : 3)) close = true;
    if (close && spd < (PLAYER.veh ? 2 : 1.2)) this.bustT += dt; else this.bustT = Math.max(0, this.bustT - dt);
    if (this.bustT > 1.6) this.busted();
    $('#stars').classList.toggle('flash', this.police.length > 0);
  },
  busted() {
    this.bustT = 0;
    const fine = Math.min(100, Math.floor(this.money * 0.1));
    this.big('つかまっちゃった！', `おまわりさん「あんぜん うんてんで ね！」<br>-$${fine}`, 'busted', 4);
    AU.bust(); AU.speak('つかまっちゃった！ あんぜん うんてんで ね！');
    this.addMoney(-fine);
    fade(() => {
      if (PLAYER.veh) exitVehicle();
      this.clearWanted();
      const s = SPOTS.police; PLAYER.x = s.x - 2; PLAYER.z = s.z; PLAYER.y = groundY(PLAYER.x, PLAYER.z); PLAYER.h = Math.PI / 2; CAM.yaw = Math.PI / 2;
    });
  },

  // ---------------------------------------------- pause / menu
  togglePause(force) {
    if (!this.playing) return;
    this.paused = force != null ? force : !this.paused;
    $('#pause').classList.toggle('hide', !this.paused);
    if (this.paused) { buildPauseMenu(); AU.engine(false); AU.screech(0); AU.siren(null); AU.water(false); }
  },
  showRadio() {
    const S = AU.stations[AU.st], e = $('#radioN');
    e.querySelector('.rn').textContent = '📻 ' + S.name; e.querySelector('.rs').textContent = S.sub; e.style.opacity = '1'; this.radioT = 2.5;
  }
};
function fade(mid, cb) {
  const f = $('#fade'); f.style.opacity = '1';
  setTimeout(() => { mid && mid(); setTimeout(() => { f.style.opacity = '0'; cb && cb(); }, 250); }, 450);
}

// ---------------------------------------------- pause menu
function buildPauseMenu() {
  const L = $('#mlist'); L.innerHTML = '';
  for (const def of MISSIONS) {
    const b = document.createElement('button'); b.className = 'mi';
    b.innerHTML = `<span class="e">${def.icon}</span><span>${def.name}<br><small style="color:#bbb;font-weight:700">${def.desc}</small></span><span class="d">${GAME.save.done[def.id] ? '✔ クリア' : ''}</span>`;
    b.onclick = () => {
      GAME.togglePause(false);
      if (GAME.mission) GAME.endMission();
      fade(() => {
        if (PLAYER.veh) exitVehicle();
        GAME.clearWanted();
        const w = def.where(); const [sx, sz] = [w.x, w.z];
        PLAYER.x = sx; PLAYER.z = sz + 0.01; PLAYER.y = groundY(sx, sz); CAM.userT = 9;
        GAME.cool = 0;
        GAME.startMission(def);
      });
    };
    L.appendChild(b);
  }
  const got = Object.keys(GAME.save.stars || {}).length, done = Object.keys(GAME.save.done).length;
  $('#pstat').innerHTML = `ミッション <b>${done} / ${MISSIONS.length}</b>　かくれ ほし <b>${got} / ${GAME.starTotal}</b>　おかね <b>$${GAME.money}</b>` + (GAME.save.raceBest ? `<br>タイムアタック ベスト <b>${fmtTime(GAME.save.raceBest)}</b>` : '') + `<br><span style="font-size:12px">ミッションを えらぶと その ばしょへ ワープするよ</span>`;
  $('#bQuit').style.display = GAME.mission ? '' : 'none';
  drawMap($('#bigmap'), true);
}
$('#bResume').onclick = () => GAME.togglePause(false);
$('#bQuit').onclick = () => { GAME.quitMission(); GAME.togglePause(false); };
$('#bSnd').onclick = () => { AU.setOn(!AU.on); $('#bSnd').textContent = AU.on ? '🔊 おと' : '🔇 おと'; };

// ---------------------------------------------- map / radar
let MAPC = null; const MAPE = EDGE + 40;
function buildMapCanvas() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), k = S / (MAPE * 2);
  const X = v => (v + MAPE) * k;
  x.fillStyle = '#2d5f7d'; x.fillRect(0, 0, S, S);
  x.fillStyle = '#8c939a'; x.fillRect(X(-EDGE), X(-EDGE), EDGE * 2 * k, EDGE * 2 * k);
  x.fillStyle = '#5b636a'; x.fillRect(X(-HALF - RW), X(-HALF - RW), (HALF + RW) * 2 * k, (HALF + RW) * 2 * k);
  x.fillStyle = '#8c939a';
  for (let k2 = 0; k2 <= NB; k2++) { const r = roadC(k2); x.fillRect(X(r - RW), X(-HALF - RW), RW * 2 * k, (HALF + RW) * 2 * k); x.fillRect(X(-HALF - RW), X(r - RW), (HALF + RW) * 2 * k, RW * 2 * k); }
  for (let j = 0; j < NB; j++) for (let i = 0; i < NB; i++) {
    const b = blockRect(i, j), t = blockType(i, j);
    x.fillStyle = t === 'P' || t === 'T' ? '#55804a' : t === 'K' ? '#b8a46a' : '#3f464c';
    x.fillRect(X(b.x0), X(b.z0), (b.x1 - b.x0) * k, (b.z1 - b.z0) * k);
  }
  x.fillStyle = '#2a3035';
  for (const b of BUILDINGS) x.fillRect(X(b.x0), X(b.z0), (b.x1 - b.x0) * k, (b.z1 - b.z0) * k);
  if (SPOTS.pond) { x.fillStyle = '#2d5f7d'; x.beginPath(); x.arc(X(SPOTS.pond.x), X(SPOTS.pond.z), 9 * k, 0, 7); x.fill(); }
  x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 1;
  for (let k2 = 0; k2 <= NB; k2++) { const r = roadC(k2); x.beginPath(); x.moveTo(X(r), X(-HALF)); x.lineTo(X(r), X(HALF)); x.stroke(); x.beginPath(); x.moveTo(X(-HALF), X(r)); x.lineTo(X(HALF), X(r)); x.stroke(); }
  MAPC = { c, k, S };
}
const _icoCache = {};
function blipList() {
  const L = [];
  for (const m of MARKERS) if (!m.hidden && m.blip) L.push({ x: m.x, z: m.z, col: m.blipCol, icon: m.icon && !m.area ? m.icon : null, area: m.area ? m.r : 0, start: m.start });
  for (const v of GAME.police) L.push({ x: v.x, z: v.z, police: true });
  if (GAME.ms && GAME.ms.thief) L.push({ x: GAME.ms.thief.x, z: GAME.ms.thief.z, col: '#ff3030', big: true });
  return L;
}
function drawMap(cv, full) {
  if (!MAPC) return;
  const x = cv.getContext('2d'), W = cv.width, H = cv.height;
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H);
  const k = W / MAPC.S;
  x.drawImage(MAPC.c, 0, 0, W, H);
  const P2 = (wx, wz) => [(wx + MAPE) * MAPC.k * k, (wz + MAPE) * MAPC.k * k];
  const t = performance.now() / 1000;
  for (const b of blipList()) {
    const [px, py] = P2(b.x, b.z);
    if (b.area) { x.fillStyle = 'rgba(255,210,63,.3)'; x.beginPath(); x.arc(px, py, b.area * MAPC.k * k, 0, 7); x.fill(); continue; }
    if (b.icon) { x.font = `${full ? 34 : 22}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(b.icon, px, py); continue; }
    x.fillStyle = b.police ? (Math.sin(t * 10) > 0 ? '#ff3030' : '#3080ff') : b.col || '#ffd23f';
    x.beginPath(); x.arc(px, py, full ? 10 : 6, 0, 7); x.fill(); x.lineWidth = 2; x.strokeStyle = '#000'; x.stroke();
  }
  const o = PLAYER.veh || PLAYER, [px, py] = P2(o.x, o.z), h = o.h;
  x.save(); x.translate(px, py); x.rotate(-h + Math.PI);
  x.fillStyle = '#fff'; x.strokeStyle = '#000'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, -18); x.lineTo(12, 14); x.lineTo(0, 7); x.lineTo(-12, 14); x.closePath(); x.stroke(); x.fill();
  x.restore();
}
function drawRadar() {
  const cv = $('#radar'), x = cv.getContext('2d'), W = cv.width, R = W / 2;
  const o = PLAYER.veh || PLAYER, yaw = CAM.yaw;
  const spd = PLAYER.veh ? Math.abs(PLAYER.veh.vf) : 0;
  GAME.radarS = damp(GAME.radarS || 1.6, spd > 12 ? 1.05 : 1.6, 1.5, 1 / 60);
  const s = GAME.radarS, ms = MAPC.k, kk = s / ms, cs = Math.cos(yaw), sn = Math.sin(yaw);
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, W);
  x.save(); x.beginPath(); x.arc(R, R, R, 0, 7); x.clip();
  x.fillStyle = '#2d5f7d'; x.fillRect(0, 0, W, W);
  const E = MAPE;
  x.setTransform(-cs * kk, -sn * kk, sn * kk, -cs * kk, R + s * (-cs * (-E - o.x) + sn * (-E - o.z)), R + s * (-sn * (-E - o.x) - cs * (-E - o.z)));
  x.drawImage(MAPC.c, 0, 0);
  x.setTransform(1, 0, 0, 1, 0, 0);
  const toR = (wx, wz) => { const dx = wx - o.x, dz = wz - o.z; return [R + (-dx * cs + dz * sn) * s, R - (dx * sn + dz * cs) * s]; };
  const t = performance.now() / 1000;
  for (const b of blipList()) {
    let [bx, by] = toR(b.x, b.z);
    if (b.area) { x.fillStyle = 'rgba(255,210,63,.32)'; x.beginPath(); x.arc(bx, by, b.area * s, 0, 7); x.fill(); continue; }
    const dx = bx - R, dy = by - R, d = Math.hypot(dx, dy), lim = R - 16;
    if (d > lim) { bx = R + dx / d * lim; by = R + dy / d * lim; }
    if (b.icon) { x.font = '26px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(b.icon, bx, by); continue; }
    x.fillStyle = b.police ? (Math.sin(t * 10) > 0 ? '#ff3030' : '#3080ff') : b.col || '#ffd23f';
    x.beginPath(); x.arc(bx, by, b.big ? 11 : 8, 0, 7); x.fill(); x.lineWidth = 2.5; x.strokeStyle = '#000'; x.stroke();
  }
  // player arrow
  x.save(); x.translate(R, R); x.rotate(-(o.h - yaw));
  x.fillStyle = '#fff'; x.strokeStyle = '#000'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, -15); x.lineTo(10, 12); x.lineTo(0, 6); x.lineTo(-10, 12); x.closePath(); x.stroke(); x.fill();
  x.restore();
  // north
  const [nx, ny] = (() => { const a = -yaw; const dx = Math.sin(a + Math.PI), dy = Math.cos(a + Math.PI); return [R + dx * (R - 14), R + dy * (R - 14)]; })();
  x.restore();
  x.beginPath(); x.arc(R, R, R - 2, 0, 7); x.lineWidth = 4; x.strokeStyle = 'rgba(0,0,0,.6)'; x.stroke();
  // wanted ring flash
  if (GAME.police.length) { x.beginPath(); x.arc(R, R, R - 5, 0, 7); x.lineWidth = 7; x.strokeStyle = Math.sin(t * 10) > 0 ? 'rgba(255,40,40,.8)' : 'rgba(40,120,255,.8)'; x.stroke(); }
  const north = toR(o.x, o.z - 1000); let ndx = north[0] - R, ndy = north[1] - R; const nd = Math.hypot(ndx, ndy); ndx /= nd; ndy /= nd;
  x.fillStyle = '#222'; x.beginPath(); x.arc(R + ndx * (R - 14), R + ndy * (R - 14), 12, 0, 7); x.fill();
  x.fillStyle = '#fff'; x.font = '900 16px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('N', R + ndx * (R - 14), R + ndy * (R - 14) + 1);
}

// ---------------------------------------------- HUD update
let hudMoney = -1;
function updateHUD(dt) {
  if (GAME.helpT > 0) { GAME.helpT -= dt; if (GAME.helpT <= 0) $('#help').style.opacity = '0'; }
  if (GAME.bigT > 0) { GAME.bigT -= dt; if (GAME.bigT <= 0) $('#big').style.opacity = '0'; }
  if (GAME.subT > 0) { GAME.subT -= dt; if (GAME.subT <= 0) $('#sub').style.opacity = '0'; }
  if (GAME.vehT > 0) { GAME.vehT -= dt; if (GAME.vehT <= 0) $('#vehN').style.opacity = '0'; }
  if (GAME.radioT > 0) { GAME.radioT -= dt; if (GAME.radioT <= 0) $('#radioN').style.opacity = '0'; }
  if (GAME.areaT > 0) { GAME.areaT -= dt; if (GAME.areaT <= 0) $('#areaN').style.opacity = '0'; }
  // money counts up like GTA
  GAME.shownMoney = GAME.shownMoney == null ? GAME.money : GAME.shownMoney;
  if (GAME.shownMoney !== GAME.money) { const d = GAME.money - GAME.shownMoney; GAME.shownMoney += Math.sign(d) * Math.max(1, Math.ceil(Math.abs(d) * dt * 4)); if (Math.sign(GAME.money - GAME.shownMoney) !== Math.sign(d)) GAME.shownMoney = GAME.money; }
  if (hudMoney !== GAME.shownMoney) { hudMoney = GAME.shownMoney; $('#money').textContent = '$' + String(hudMoney).padStart(8, '0'); }
  const stars = Math.ceil(GAME.wanted - 0.001), st = $('#stars').children;
  for (let k = 0; k < 5; k++) st[k].classList.toggle('on', k < stars);
  // area name
  const a = districtAt(PLAYER.x, PLAYER.z);
  if (a !== GAME.area) { GAME.areaCand = a; GAME.areaCT = (GAME.areaCT || 0) + dt; if (GAME.areaCT > 0.8) { GAME.area = a; GAME.areaCT = 0; const e = $('#areaN'); e.textContent = a; e.style.opacity = '1'; GAME.areaT = 2.6; } } else GAME.areaCT = 0;
  // speed
  const sp = $('#speedo');
  if (PLAYER.veh) { sp.classList.remove('hide'); sp.textContent = Math.round(Math.abs(PLAYER.veh.vf) * 3.6) + ' km/h'; } else sp.classList.add('hide');
  // touch buttons
  if (isTouch || IN.touchUsed) updateButtons();
  drawRadar();
}
let btnState = '';
function updateButtons() {
  const v = PLAYER.veh;
  let s;
  if (v) {
    const c = GAME.ms && GAME.ms.def.id === 'fire' && v === GAME.ms.veh ? ['💦', 'みず'] : v.type === 'police' && !GAME.mission ? ['🚨', 'サイレン'] : ['📣', 'プップー'];
    s = `car|${c[0]}|${c[1]}`;
  } else s = `foot|${GAME.nearCar ? 1 : 0}`;
  if (s === btnState) return; btnState = s;
  const set = (id, ic, lb, show, pulse) => { const b = $(id); b.style.display = show ? '' : 'none'; b.querySelector('.ic').textContent = ic; b.querySelector('.lb').textContent = lb; b.classList.toggle('pulse', !!pulse); };
  if (v) {
    const p = s.split('|');
    set('#bA', '🛑', 'ブレーキ', true); set('#bB', '🚪', 'おりる', true); set('#bC', p[1], p[2], true); set('#bD', '📻', 'ラジオ', true); set('#bE', '🏃', 'はしる', false);
  } else {
    set('#bA', '⤴', 'ジャンプ', true); set('#bB', '🚗', 'のる', !!GAME.nearCar, true); set('#bC', '👋', 'てを ふる', true); set('#bD', '📻', 'ラジオ', false); set('#bE', '🏃', 'はしる', true, IN.runT);
  }
}

// ================================================================ world population
function populateTraffic() {
  const types = ['sedan', 'sedan', 'kei', 'kei', 'sedan', 'kei', 'sedan', 'kei'];
  for (let k = 0; k < 26; k++) {
    const type = k < 2 ? 'police' : k === 2 ? 'sports' : k === 3 ? 'bus' : types[k % types.length];
    const v = spawnVehicle(type, 0, 0, 0); if (!v) continue;
    randomLaneSpawn(v, null, null, 0); v.cruise = rr(8.5, 11.5);
  }
  for (const s of PARKING) { const v = spawnVehicle(s.type, s.x, s.z, s.h); if (v) { v.ai = 'park'; v.home = true; } }
  // fire truck & ice van parked at their bases
  const f = SPOTS.fire; const ft = spawnVehicle('fire', f.x + 12, f.z - 1, Math.PI / 2); if (ft) ft.home = true;
  const ic = SPOTS.ice; const iv = spawnVehicle('ice', ic.x - 3, ic.z + 3.6, Math.PI / 2); if (iv) iv.home = true;
  // a few curbside parked cars
  for (let k = 0; k < 8; k++) {
    const i = ri(0, NB - 1), j = ri(1, NB - 1), x = roadC(i) + rr(RW + 14, P - RW - 14), z = roadC(j) + (RND() < 0.5 ? 1 : -1) * 5.6;
    if (VEH.some(o => Math.hypot(o.x - x, o.z - z) < 7)) continue;
    const v = spawnVehicle(pick(['sedan', 'kei']), x, z, z > roadC(j) ? -Math.PI / 2 : Math.PI / 2); if (v) { v.ai = 'park'; v.parkT = 0; v.curb = true; }
  }
}
function updateTraffic(dt) {
  for (const v of VEH) {
    if (v.ai === 'lane') updateLaneAI(v, dt);
    else if (v.ai === 'police') {
      const o = PLAYER.veh || PLAYER;
      const hit = chaseAI(v, o.x, o.z, dt, PLAYER.veh ? v.T.maxV * 0.92 : 9);
      if (Math.random() < dt * 0.25 && distToPlayer(v) < 30) bubble(pick(['まちなさ〜い！', 'とまって〜！', 'あぶないよ〜！']), v, 1.4);
    }
    else if (v.ai === 'park') {
      settleVehicle(v, dt);
      v.parkT = (v.parkT || 0) + dt;
      if (!v.mission && !v.home && !v.curb && v.parkT > 25 && distToPlayer(v) > 110 && ['sedan', 'kei', 'sports', 'police'].includes(v.type)) { recycleToLane(v); v.cruise = rr(8.5, 11.5); }
    }
    // lane cars too far from everything? keep them; city is small
  }
}

// ================================================================ stunts
function updateStunt(dt) {
  const v = PLAYER.veh;
  if (!GAME.stunt) {
    if (v && v.air && v.airT > 0.12 && Math.abs(v.vf) > 11 && !GAME.mission) {
      const [fx, fz] = vAxes(v), side = (RND() < 0.5 ? 1 : -1);
      GAME.stunt = { x0: v.x, z0: v.z, t: 0 };
      CAM.cine = { t: 0, target: v, x: v.x + fz * side * 9 + fx * 10, y: v.y + 2.5, z: v.z - fx * side * 9 + fz * 10 };
      GAME.timeScale = 0.35; $('#slowfx').style.opacity = '1'; AU.whoosh();
    }
  } else {
    GAME.stunt.t += dt;
    if (!v || !v.air || GAME.stunt.t > 4) {
      const d = v ? Math.hypot(v.x - GAME.stunt.x0, v.z - GAME.stunt.z0) : 0;
      GAME.timeScale = 1; CAM.cine = null; $('#slowfx').style.opacity = '0';
      if (v && d > 8) { const r = Math.round(20 + d * 2); GAME.big('スーパー ジャンプ！', `とおさ ${d.toFixed(1)}m　+$${r}`, 'pass', 2.6); GAME.addMoney(r); AU.coin(); fxDust(v.x, v.z, 10); CAM.shake = 0.6; }
      GAME.stunt = null; CAM.userT = 9;
    }
  }
}

// ================================================================ boot
const tick = () => new Promise(r => setTimeout(r, 16));
async function boot() {
  const bar = $('#lbar'), tip = $('#ltip');
  const prog = (f, t) => { bar.style.width = (f * 100) + '%'; if (t) tip.textContent = t; };
  GAME.load(); syncTitle();
  prog(0.05, 'テクスチャを つくっているよ…'); await tick();
  buildTextures(); prog(0.15); await tick();
  buildMaterials(); buildDecorInstances(); PT = propTypes();
  prog(0.2, 'まちを つくっているよ…'); await tick();
  buildCity(f => prog(0.2 + f * 0.5));
  flushStatic(); flushWires();
  prog(0.72, 'くるまを ならべているよ…'); await tick();
  defineVehicles(); buildPedMeshes(); initFX();
  for (const k in INST) { INST[k].instanceMatrix.needsUpdate = true; if (INST[k].instanceColor) INST[k].instanceColor.needsUpdate = true; }
  updateTrafficLights(0.01);
  prog(0.8, 'そらを えがいているよ…'); await tick();
  buildEnv();
  initPlayer(!!GAME.save.girl, SPOTS.home.x, SPOTS.home.z, Math.PI);
  PLAYER.model.visible = false;
  populateTraffic(); populatePeds(46);
  buildStars(); buildMapCanvas();
  for (const def of MISSIONS) { const w = def.where(); const m = makeMarker(w.x, w.z, { r: 1.3, icon: def.icon, iconRing: '#1b1b1b', start: def }); m.start = def; GAME.startMarkers.push(m); }
  prog(0.95, 'じゅんび OK！'); await tick();
  // compile shaders
  renderer.compile(scene, camera);
  prog(1); await tick();
  $('#loading').classList.add('hide');
  $('#title').classList.remove('hide');
  GAME.titleT = 0;
  requestAnimationFrame(frame);
}

// title buttons
document.querySelectorAll('[data-kid]').forEach(b => b.onclick = () => { document.querySelectorAll('[data-kid]').forEach(o => o.classList.toggle('on', o === b)); GAME.save.girl = b.dataset.kid === '1'; });
document.querySelectorAll('[data-snd]').forEach(b => b.onclick = () => { document.querySelectorAll('[data-snd]').forEach(o => o.classList.toggle('on', o === b)); AU.setOn(b.dataset.snd === '1'); $('#bSnd').textContent = AU.on ? '🔊 おと' : '🔇 おと'; });
function syncTitle() { document.querySelectorAll('[data-kid]').forEach(o => o.classList.toggle('on', (o.dataset.kid === '1') === !!GAME.save.girl)); }
$('#bStart').onclick = () => {
  AU.init();
  try { if (window.speechSynthesis && AU.on) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } } catch (e) { }
  fade(() => {
    $('#title').classList.add('hide'); $('#back').classList.add('hide');
    $('#hud').classList.remove('hide');
    if (isTouch) $('#tc').classList.remove('hide'); else { $('#tc').classList.remove('hide'); for (const id of ['#bA', '#bB', '#bC', '#bD', '#bE', '#stickHint']) $(id).classList.add('hide'); }
    initPlayer(!!GAME.save.girl, SPOTS.home.x, SPOTS.home.z, Math.PI);
    GAME.saveNow();
    GAME.playing = true; CAM.userT = 9; CAM.tx = PLAYER.x; CAM.ty = PLAYER.y + 1; CAM.tz = PLAYER.z;
    camera.fov = 60; camera.updateProjectionMatrix();
    setTimeout(() => {
      GAME.say('', 'ここは <b>ちびっこ シティ</b>！ まちを じゆうに ぼうけんしよう！', 4.5);
      setTimeout(() => GAME.help(isTouch ? '👈 ひだりがわを ゆびで なぞって あるこう<br>🚗 くるまの そばで <b>のる</b> ボタン<br>ちずの <b>マーク</b>は ミッションだよ！' : '<b>WASD</b> で あるく・<b>F</b> で くるまに のる<br>ちずの <b>マーク</b>は ミッションだよ！ <b>ESC</b> で メニュー', 7), 4800);
    }, 600);
  });
};

// ================================================================ main loop
let last = performance.now(), tAcc = 0;
const DR = { acc: 0, n: 0, pr: Q.pr };
function frame(now) {
  requestAnimationFrame(frame);
  let rdt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!rdt) rdt = 1 / 60;
  const t = now / 1000;
  MAT.water.normalMap.offset.set(t * 0.004, t * 0.006);
  if (!GAME.playing) {
    // title flyover
    GAME.titleT += rdt;
    const a = GAME.titleT * 0.035 + 2.6, r = 250;
    camera.position.set(Math.sin(a) * r, 78 + Math.sin(GAME.titleT * 0.1) * 8, Math.cos(a) * r);
    camera.lookAt(Math.sin(a) * 40, 0, Math.cos(a) * 40);
    updateTrafficLights(rdt); updateTraffic(rdt); updatePeds(rdt);
    renderVehicles(rdt); renderPeds(); updateSun(camera.position.x * 0.5, camera.position.z * 0.5);
    sky.position.copy(camera.position);
    renderer.render(scene, camera);
    return;
  }
  if (GAME.paused) { renderer.render(scene, camera); IN.jumpE = IN.actE = IN.radioE = IN.hornE = false; return; }
  const dt = rdt * GAME.timeScale;
  // dynamic resolution: keep tablets smooth
  DR.acc += rdt; DR.n++;
  if (DR.acc > 2) {
    const avg = DR.acc / DR.n; DR.acc = 0; DR.n = 0;
    let pr = DR.pr;
    if (avg > 0.024) pr = Math.max(0.7, pr - 0.15); else if (avg < 0.0145) pr = Math.min(Q.pr, pr + 0.1);
    if (Math.abs(pr - DR.pr) > 0.01) { DR.pr = pr; renderer.setPixelRatio(pr); renderer.setSize(innerWidth, innerHeight); }
  }
  updateTrafficLights(dt);
  // player
  if (PLAYER.veh) updatePlayerDrive(dt); else updatePlayerFoot(dt);
  playerExtras(dt, t);
  updateTraffic(dt);
  updatePeds(dt);
  updateProps(dt);
  updateFires(dt, t);
  FXN.update(dt); FXA.update(dt);
  updateStars(dt, t);
  updateMarkers(dt, t);
  updateStunt(rdt);
  // missions
  if (GAME.cool > 0) GAME.cool -= rdt;
  if (GAME.mission) { try { GAME.mission.update(GAME.ms, dt); } catch (e) { console.error(e); GAME.endMission(); } }
  else if (!(GAME.cool > 0)) {
    for (const m of GAME.startMarkers) {
      const r = PLAYER.veh ? 3.2 : 1.6;
      if (m.hidden) continue;
      if (!inMarker(m, r + 2.5)) m.armed = true;
      if (m.armed && inMarker(m, r)) { m.armed = false; GAME.startMission(m.start); break; }
    }
  }
  if (!GAME.mission) { GAME.obj(GAME.wanted > 0 ? '<b>おまわりさん</b>から にげよう！ しばらく いたずら しないと あきらめるよ' : ''); }
  GAME.updateWanted(dt);
  AU.sirenTick(rdt); AU.radioTick();
  // temp peds cleanup
  for (let k = PEDS.length - 1; k >= 0; k--) { const p = PEDS[k]; if (p.temp) { p.life -= dt; if (p.life <= 0 && distToPlayer(p) > 25) removePed(p); } }
  renderVehicles(dt); renderPeds();
  updateCamera(rdt);
  updateBubbles(rdt);
  updateSun(PLAYER.x + Math.sin(CAM.yaw) * 30, PLAYER.z + Math.cos(CAM.yaw) * 30);
  sky.position.copy(camera.position);
  updateHUD(rdt);
  renderer.render(scene, camera);
  IN.jumpE = IN.actE = IN.radioE = IN.hornE = false;
  // autosave
  tAcc += rdt; if (tAcc > 10) { tAcc = 0; GAME.saveNow(); }
}
function playerExtras(dt, t) {
  const v = PLAYER.veh;
  const hornKey = IN.keys.has('KeyH');
  if (v) {
    const isFire = GAME.ms && GAME.ms.def.id === 'fire' && v === GAME.ms.veh;
    if (!isFire) {
      if (v.type === 'police' && !GAME.mission) {
        if (IN.hornE || (hornKey && !GAME._hk)) { v.siren = !v.siren; AU.siren(v.siren ? 'police' : null); if (v.siren) GAME.help('🚨 サイレン オン！ くるまが みちを あけてくれるよ', 2); }
        if (v.siren) {
          for (const o of VEH) if (o.ai === 'lane' && Math.hypot(o.x - v.x, o.z - v.z) < 28) o.bumpT = Math.max(o.bumpT, 0.5);
        }
      } else if (IN.hornE || (hornKey && !GAME._hk)) {
        AU.honk(1, v.T.mass > 1.5);
        for (const p of PEDS) if (!p.immune && Math.hypot(p.x - v.x, p.z - v.z) < 12 && p.state === 'walk' && RND() < 0.5) { bubble(pick(['こんにちは〜！', 'やあ！', 'いいくるまだね！', 'ブーブー！']), p, 1.4); }
      }
    }
    if (v.siren && AU.sirType !== v.T.siren && v.T.siren !== 'ice') AU.siren(v.T.siren);
    if (!v.siren && AU.sirType && AU.sirType !== 'ice' && !GAME.mission) AU.siren(null);
    if (IN.radioE) { AU.st = (AU.st + 1) % AU.stations.length; AU.setRadio(true, AU.st); GAME.showRadio(); }
  } else {
    if (IN.hornE || (hornKey && !GAME._hk)) {
      PLAYER.waveT = 1.2;
      let n = 0;
      for (const p of PEDS) if (!p.immune && Math.hypot(p.x - PLAYER.x, p.z - PLAYER.z) < 9 && n < 3 && p.state === 'walk') { n++; p.state = 'wave'; p.stateT = 0; p.face = PLAYER; p.waveBack = 2.2; bubble(pick(['こんにちは！', 'やっほー！', 'げんきだね！', 'おはよう！']), p, 1.8); }
      if (!n) bubble('こんにちは〜！', PLAYER, 1.2);
    }
    if (PLAYER.waveT > 0) { PLAYER.waveT -= dt; const u = PLAYER.model.userData; u.armR.rotation.x = -2.8 + Math.sin(t * 14) * 0.3; u.armR.rotation.z = -0.4; } else PLAYER.model.userData.armR.rotation.z = -0.15;
    if (GAME.nearCar && !GAME.mission && !GAME._carHint) { GAME._carHint = true; GAME.help(isTouch ? '🚗 <b>のる</b> ボタンで くるまに のれるよ！' : '🚗 <b>F</b> キーで くるまに のれるよ！', 3); }
  }
  GAME._hk = hornKey;
  // peds that waved go back to walking
  for (const p of PEDS) if (p.waveBack > 0) { p.waveBack -= dt; if (p.waveBack <= 0 && p.loop) { p.state = 'walk'; p.face = null; } }
  // fell into the sea? (shouldn't happen, but be safe)
  const o = v || PLAYER;
  if (Math.abs(o.x) > EDGE + 2 || Math.abs(o.z) > EDGE + 2 || o.y < -5) {
    o.x = clamp(o.x, -EDGE + 8, EDGE - 8); o.z = clamp(o.z, -EDGE + 8, EDGE - 8); o.y = groundY(o.x, o.z); if (v) { v.vx = v.vz = 0; v.vy = 0; v.air = false; }
  }
}
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && GAME.playing && !GAME.paused) GAME.togglePause(true); });
syncTitle();
boot().catch(e => { console.error(e); $('#ltip').textContent = 'エラー: ' + e.message; });
