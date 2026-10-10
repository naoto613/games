// ================================================================ game flow
let TL_I = 0;
function setupDay(d) {
  World.day = d; const D = DAYS[d];
  World.layout = d >= 8 ? 'B' : 'A'; SPOTS = World.layout === 'B' ? SPOT_B : SPOT_A;
  buildDecor(World.layout); buildObjects(d);
  World.rooms = D.rooms.slice(); updateLocks(World.rooms);
  for (const id in DOORS) World.setDoor(id, !(id === 'd_sh' || id === 'd_ent'), true);
  rebuildLOS(); objOccluders();
  for (const k in World.flags) delete World.flags[k];
  World.events = []; World.evByKey = {}; World.heat = {}; World.maxDepth = 0; World.maxExposure = 0; World.goalDone = false; World.caught = false; World.caughtBy = null;
  World.power = World.powerMax = D.power; World.actLog = []; World.rain = false; World.blind = false; World.lastWeird = null; World.speed = 1; World.hallLit = false;
  EVID = 0; Chain.clear(); Chain.show(); UI.clearLog(); UI.clearBubbles(); Parts.clear(); Robo.reset(); Marbles.reset(); UI.closePanel(); UI.tip(null);
  initAgents();
  for (const id of [...FAMILY, 'monaka']) {
    const a = AG[id]; a.home = false; a.mesh.visible = false; a.stack = []; a.susp = 0; a.mode = 'normal'; a.lock = 0; a.cause = null; a.setProp(null); a.carry = null;
    a.inspect = null; a.asleep = false; a.hidden = false; a.anim = 'idle'; a.focus = 0; setFace(a, 'n'); a.style = SEARCH_STYLE[id]; a.inOshiire = false; a.lookSide = 0; a.setFloor(1);
  }
  Ghost.reset(); TL_I = 0;
  $$('#spd button').forEach(c => c.classList.toggle('on', c.dataset.s === '1'));
  // goal card
  $('#gTx').textContent = D.goal; $('#gSub').textContent = D.goalSub || ''; $('#goal').classList.remove('ok');
  $('#hDay').textContent = d <= LAST_DAY ? d + '日目' : '自由な日';
  $$('#flr button').forEach(b => { const f = +b.dataset.f; const has2 = D.rooms.some(r => ROOMS[r].floor === 2); b.disabled = false; b.textContent = f === 2 && !has2 ? '2F🔒' : f === 1 ? '1F' : f === 2 ? '2F' : '全体'; });
}
function seat(a, sp) { a.home = true; a.mesh.visible = true; a.place(sp); a.anim = 'sit'; }
const TABLE = { fumi: 'k_table3', sota: 'k_table1', akari: 'k_table4', misaki: 'k_table2', hiroshi: { room: 'kitchen', f: 1, x: 5.2, z: 3.2, yaw: -Math.PI / 2 } };
async function morning() {
  const D = DAYS[World.day];
  World.phase = 'morning'; World.time = T(7, 30);
  Mood.set('morning'); Music.play('morning');
  for (const id of FAMILY) { seat(AG[id], typeof TABLE[id] === 'string' ? spot(TABLE[id]) : TABLE[id]); AG[id].anim = id === 'misaki' ? 'idle' : 'sit'; }
  AG.misaki.place(spot('k_stove')); AG.misaki.anim = 'cook';
  View.setFloor(1, true); View.zoomRoom('kitchen'); View.distT = 20;
  $('#hud').classList.add('hide');
  await fadeIn();
  await Talk.run(D.morning, (World.day <= LAST_DAY ? World.day + '日目　' : '') + D.title);
  await fadeOut();
  for (const id of FAMILY) { leave(AG[id]); }
}
function fadeOut() { return new Promise(r => { $('#fade').style.opacity = 1; setTimeout(r, HEADLESS ? 0 : 480); }); }
function fadeIn() { return new Promise(r => { $('#fade').style.opacity = 0; setTimeout(r, HEADLESS ? 0 : 480); }); }
function startPrep() {
  const D = DAYS[World.day];
  World.phase = 'prep'; World.time = T(10);
  Mood.set('prep'); Music.play('prep');
  Cat.start(AG.monaka);
  const st = O[D.start] && Ghost.targetOK(O[D.start]) ? D.start : Object.values(O).find(o => Ghost.targetOK(o)).id;
  Ghost.setHost({ type: 'obj', id: st });
  View.setFloor(D.floor || 1, true);
  if (D.floor === 2) View.setFloor(2, true);
  $('#hud').classList.remove('hide');
  APP.mode = 'play';
  UI.toast(World.day <= LAST_DAY ? 'しこみの じかん（るすの あいだ）' : '自由な日');
  if (D.tutorial) Tut.start();
  else UI.tip('のりうつれる ものに <b>白い ○</b>。タップで えらんで、「異変」を しかけよう。（ふしぎ力 ' + D.power + '）', 'pt'), setTimeout(() => UI.tipKey === 'pt' && UI.tip(null), 7000);
}
function endPrep() {
  World.prepLog = World.actLog.filter(x => x.phase === 'prep');
  World.prepHost = Ghost.S.host ? Object.assign({}, Ghost.S.host) : null;
  startChain();
}
function startChainCore() {
  World.phase = 'chain'; World.time = T(14, 30);
  for (const id of FAMILY) { const a = AG[id]; a.stack = [ROUTINES[id](a)]; }
  if (!AG.monaka.home) Cat.start(AG.monaka);
  Ghost.setHost(Ghost.S.host);
  World.blind = !!(Ghost.hostObj() && Ghost.hostObj().def.host.kind === 'inner');
}
function startChain() {
  startChainCore();
  Mood.set('chain'); Music.play('chain');
  UI.toast('ゆうがた。家族が かえってくる…');
  UI.tip(null);
  if (DAYS[World.day].tutorial) Tut.chain();
}
// retry helpers
function replayPrep() {
  World.phase = 'prep'; World.time = T(10);
  Cat.start(AG.monaka);
  for (const x of World.prepLog || []) { Ghost.setHost({ type: 'obj', id: x.obj }); Ghost.act(x.act); }
  if (World.prepHost && (World.prepHost.type !== 'obj' || O[World.prepHost.id])) Ghost.setHost(World.prepHost);
}
async function retryChain() {
  const log = World.prepLog, host = World.prepHost;
  await fadeOut();
  setupDay(World.day); World.prepLog = log; World.prepHost = host;
  replayPrep(); World.prepLog = log; World.prepHost = host;
  $('#hud').classList.remove('hide'); APP.mode = 'play'; APP.paused = false;
  View.setFloor(View.floorMode, false);
  startChain();
  await fadeIn();
}
async function retryPrep() {
  await fadeOut();
  setupDay(World.day); APP.paused = false;
  startPrep();
  await fadeIn();
}
// ---------------------------------------------------------------- tutorial (day 1)
const Tut = (() => {
  let step = 0;
  return {
    start() { step = 1; UI.tip('ぽわは 物に のりうつれる。<b>台所の かべどけい</b>（白い ○）を タップして「のりうつる」！', 't1'); },
    host(o) { if (step === 1 && o.id === 'tokei') { step = 2; UI.tip('のりうつった！ パネルの「<b>5ふん すすめる</b>」を えらぼう。（ふしぎ力を 1 つかう）', 't2'); } else if (step === 3 && o.id === 'remocon') { step = 4; UI.tip('「<b>ソファの 下に かくす</b>」を えらぼう。', 't4'); } },
    acted(o, a) {
      if (step === 2 && o.id === 'tokei') { step = 3; UI.tip('時計が 5ふん すすんだ。つぎは <b>リビングの リモコン</b>に のりうつろう。', 't3'); }
      else if (step === 4 && o.id === 'remocon') { step = 5; UI.tip('じゅんび かんりょう！ 右下の「<b>じゅんび OK</b>」で 家族の 帰りを まとう。', 't5'); }
    },
    chain() { if (step >= 1) { step = 6; UI.tip('家族が かえってくる。▶▶ で はやおくり。家族を タップすると 習慣が わかるよ。', 't6'); setTimeout(() => UI.tipKey === 't6' && UI.tip(null), 9000); } },
    search(a) { if (step === 6 && a.id === 'akari') { step = 7; World.speed = 1; $$('#spd button').forEach(c => c.classList.toggle('on', c.dataset.s === '1')); UI.tip('あかりが スマホで さがしはじめた！ カメラに うつると 見つかる。<b>カーテン</b>に のりうつって にげよう！', 't7'); } },
    hopped(o) { if (step === 7 && o.id === 'curtain') { step = 8; UI.tip('カーテンは ゆれるだけ。でも おなじ 部屋の どこへでも、こっそり うつれる。', 't8'); setTimeout(() => UI.tipKey === 't8' && UI.tip(null), 7000); } },
    get step() { return step; }, reset() { step = 0; },
  };
})();

// ---------------------------------------------------------------- hooks
Hooks.goal = text => {
  $('#goal').classList.add('ok'); World.goalText = text;
  if (World.phase === 'chain' && !HEADLESS) { Sound.sfx('goal'); UI.toast('お題 たっせい！ ' + (text || ''), 'gold'); }
};
Hooks.hostChanged = () => { const o = Ghost.hostObj(); if (o && DAYS[World.day].tutorial) Tut.host(o); if (UI.sel) UI.refreshPanelLive(true); };
Hooks.acted = (o, a, id) => {
  if (DAYS[World.day].tutorial) Tut.acted(o, a);
  // the cat chases a swaying curtain
  if (a.id === 'sway' && /curtain/.test(o.id)) {
    const c = AG.monaka;
    if (c.home && c.floor === o.floor && (c.room === objRoomNow(o)) && !World.flags.catCurtain) {
      c.push((function* () { yield* go(c, objSpot(o, 0.5), { run: true }); Sound.sfx('meow'); UI.bubble(c, 'ニャッ ニャッ！', 1.6); E(c, 'cat_curtain', 'もなかが カーテンに じゃれた', [id]); World.flags.catCurtain = 1; yield* waitS(2); })(), true);
    }
  }
};
Hooks.hopped = o => { if (DAYS[World.day].tutorial) Tut.hopped(o); };
Hooks.searchStart = a => {
  if (World.phase !== 'chain') return;
  Mood.set('search');
  if (!HEADLESS) UI.toast(a.def.name + 'が さがしはじめた！', 'red');
  if (World.speed > 1) { World.speed = 1; $$('#spd button').forEach(c => c.classList.toggle('on', c.dataset.s === '1')); }
  if (DAYS[World.day].tutorial) Tut.search(a);
};
Hooks.searchEnd = a => { if (!FAMILY.some(id => AG[id].mode === 'search')) { Mood.set('chain'); Music.play('chain'); } };
Hooks.caught = by => {
  if (World.caught || World.phase !== 'chain') return;
  World.caught = true; World.caughtBy = by;
  if (!HEADLESS) caughtScene(by);
};
async function caughtScene(by) {
  APP.mode = 'scene';
  Sound.sfx('caught'); Music.stop();
  const gm = Ghost.gm; gm.visible = true; gm.position.copy(Ghost.hostPos()); gm.position.y += 0.2;
  if (by) { setFace(by, 'surp'); UI.bubble(by, pick(['み、みつけた〜〜！？', 'で、でたあああ！', 'いた！ おばけ！']), 3, 'loud'); }
  UI.toast('みつかっちゃった…！', 'red');
  await new Promise(r => setTimeout(r, 2200));
  gm.visible = false;
  const r = dayResult();
  $('#hud').classList.add('hide');
  const ch = await showResult(r);
  handleChoice(ch, r);
}
// ---------------------------------------------------------------- end of day
async function endDay() {
  APP.mode = 'scene'; World.phase = 'night';
  UI.closePanel(); UI.tip(null); UI.clearMarks(); Chain.hide(); UI.clearBubbles();
  const r = dayResult(); const D = DAYS[r.day];
  await fadeOut();
  $('#hud').classList.add('hide');
  World.blind = false; Ghost.setHost(null);
  Mood.set('night', true); Music.play('night');
  for (const id of FAMILY) { const a = AG[id]; a.stack = []; a.setProp(null); if (a.carry) putDown(a, a.carry); a.mode = 'normal'; a.inspect = null; a.lock = 0; a.hidden = false; a.asleep = false; seat(a, typeof TABLE[id] === 'string' ? spot(TABLE[id]) : TABLE[id]); setFace(a, r.goal ? 'smile' : 'n'); }
  AG.monaka.stack = []; AG.monaka.place({ f: 1, x: 2.0, z: 4.6, yaw: 0 }); AG.monaka.anim = 'sleep';
  if (r.day === LAST_DAY && r.goal) { await ending(r); return; }
  View.setFloor(1, true); View.zoomRoom('kitchen'); View.distT = 19;
  await fadeIn();
  const lines = D.dinner(r).slice();
  if (r.depth >= 5) lines.push(['akari', 'きょうは なんか、へんな 日だったね。']);
  if (!r.goal && D.hints && !D.free) lines.push(['n', '（ヒント）' + D.hints[0]]);
  await Talk.run(lines, 'よる　ゆうごはん');
  const img = await replay();
  diaryEntry(r, img); saveDay(r);
  const ch = await showResult(r);
  handleChoice(ch, r);
}
async function replay() {
  if (!World.events.length || HEADLESS) return captureImg();
  for (const id of FAMILY) AG[id].mesh.visible = false;
  const has2 = World.events.some(e => e.pos && e.pos.f === 2);
  View.setFloor(has2 ? 0 : 1); View.distT = has2 ? 44 : 32;
  Mood.set('chain');
  UI.toast('きょうの れんさを ふりかえろう');
  Chain.replayPrep(); Chain.show();
  await new Promise(r => setTimeout(r, 900));
  const evs = World.events.filter(e => e.pos && e.key !== 'goal');
  for (const e of evs) { Chain.replayStep(e); Sound.sfx('chain', Math.min(9, e.depth)); await new Promise(r => setTimeout(r, Math.max(160, 900 / Math.sqrt(evs.length + 1)))); }
  await new Promise(r => setTimeout(r, 900));
  const img = captureImg();
  await new Promise(r => setTimeout(r, 500));
  Mood.set('night'); Chain.hide();
  for (const id of FAMILY) AG[id].mesh.visible = AG[id].home;
  return img;
}
async function ending(r) {
  // everyone in the washitsu, the letter, ぽわ appears
  const pos = { fumi: [4.2, -1.6, Math.PI], misaki: [3.2, -2.6, Math.PI / 2], hiroshi: [5.2, -2.6, -Math.PI / 2], akari: [3.6, -3.6, 0.4], sota: [4.8, -3.6, -0.4] };
  for (const id of FAMILY) { const p = pos[id]; seat(AG[id], { room: 'washitsu', f: 1, x: p[0], z: p[1], yaw: p[2] }); }
  View.setFloor(1, true); View.zoomRoom('washitsu'); View.distT = 17;
  Mood.set('night', true); Music.play('end');
  await fadeIn();
  Hooks.powaSpeak = () => { const gm = Ghost.gm; gm.visible = true; gm.position.set(4.2, 1.4, -2.6); FG[1].localToWorld(gm.position); };
  await Talk.run(ENDING, 'さいごの 日　わすれもの');
  Hooks.powaSpeak = null;
  const img = captureImg(); Ghost.gm.visible = false;
  diaryEntry(r, img); saveDay(r);
  Save.d.cleared = 1; Save.write();
  await fadeOut();
  APP.mode = 'title'; showTitle();
  await fadeIn();
  openDiary(LAST_DAY);
}
async function handleChoice(ch, r) {
  if (ch === 'next') {
    if (r.day >= LAST_DAY) { await fadeOut(); showTitle(); await fadeIn(); return; }
    await startDay(r.day + 1);
  } else if (ch === 'retry') { await retryChain(); }
  else if (ch === 'retry0') { await retryPrep(); }
  else { await fadeOut(); showTitle(); await fadeIn(); }
}
async function startDay(d) {
  APP.mode = 'scene'; APP.paused = false;
  await fadeOut();
  $('#title').classList.add('hide');
  setupDay(d);
  if (DAYS[d].morning && DAYS[d].morning.length) await morning(); else await fadeIn();
  setupDayKeep();
  startPrep();
  await fadeIn();
}
function setupDayKeep() { World.phase = 'prep'; }

// ---------------------------------------------------------------- title & menus
function showTitle() {
  APP.mode = 'title'; APP.paused = false;
  const d = Math.min(LAST_DAY, Save.d.unlocked || 1);
  setupDay(d); World.phase = 'title'; World.time = T(17);
  Mood.set('chain', true); Music.play('night');
  $('#hud').classList.add('hide'); $('#title').classList.remove('hide');
  $('#tPlay').textContent = (Save.d.unlocked || 1) > 1 ? (Math.min(LAST_DAY, Save.d.unlocked) + '日目から') : 'はじめる';
  View.setFloor(1, true); View.distT = 40; View.dist = 40;
  Cat.start(AG.monaka);
  const gm = Ghost.gm; gm.visible = true;
}
function openDays() {
  const g = $('#dGrid'); g.innerHTML = '';
  for (let d = 1; d <= LAST_DAY; d++) {
    const s = Save.d.days[d] || {}; const ok = d <= (Save.d.unlocked || 1);
    const b = document.createElement('button'); b.className = 'dbt' + (d === Save.d.unlocked ? ' cur' : ''); b.disabled = !ok;
    b.innerHTML = `<span class="n">${d}日目</span><span class="s">${ok ? DAYS[d].title : '？？？'}</span><span class="r">${s.goal ? '✔ ' : ''}${s.goal ? '★'.repeat((s.hide || 0) + (s.chain || 0)) : ''}${s.hidden ? ' 🎉' : ''}</span>`;
    b.onclick = () => { $('#days').classList.add('hide'); startDay(d); };
    g.appendChild(b);
  }
  const f = $('#dFree'); f.innerHTML = '';
  const fb = document.createElement('button'); fb.className = 'bigb blue sm'; fb.textContent = Save.d.cleared ? '自由な日（お題なし）' : '🔒 自由な日（14日目 クリアで）'; fb.disabled = !Save.d.cleared;
  fb.onclick = () => { $('#days').classList.add('hide'); startDay(15); }; f.appendChild(fb);
  $('#days').classList.remove('hide');
}
$('#tPlay').onclick = () => { Sound.unlock(); Sound.sfx('ok'); startDay(Math.min(LAST_DAY, Save.d.unlocked || 1)); };
$('#tDays').onclick = () => { Sound.unlock(); Sound.sfx('tap'); openDays(); };
$('#tDiary').onclick = () => { Sound.unlock(); Sound.sfx('page'); openDiary(); };
$('#tHow').onclick = () => { Sound.unlock(); $('#how').classList.remove('hide'); };
$$('[data-close]').forEach(b => b.onclick = () => { b.closest('.scr').classList.add('hide'); Sound.sfx('tap'); });
$('#bReady').onclick = () => { if (World.phase !== 'prep') return; Sound.sfx('ok'); UI.closePanel(); endPrep(); };
// pause
let hintN = 0;
Hooks.menu = () => {
  if (APP.mode !== 'play') return;
  APP.paused = true; $('#pause').classList.remove('hide');
  $('#oSnd').textContent = Sound.on ? 'ON' : 'OFF'; $('#oSnd').classList.toggle('on', Sound.on);
  $('#oCone').textContent = Save.d.cone ? 'ON' : 'OFF'; $('#oCone').classList.toggle('on', !!Save.d.cone);
  $('#pRetry').classList.toggle('hide', World.phase !== 'chain');
  hintN = 0; $('#hintBox').classList.add('hide');
};
$('#bMenu').onclick = () => { Sound.unlock(); Hooks.menu(); };
$('#pRes').onclick = () => { APP.paused = false; $('#pause').classList.add('hide'); };
$('#oSnd').onclick = () => { Sound.unlock(); Sound.setOn(!Sound.on); $('#oSnd').textContent = Sound.on ? 'ON' : 'OFF'; $('#oSnd').classList.toggle('on', Sound.on); };
$('#oCone').onclick = () => { Save.d.cone = Save.d.cone ? 0 : 1; Save.write(); $('#oCone').textContent = Save.d.cone ? 'ON' : 'OFF'; $('#oCone').classList.toggle('on', !!Save.d.cone); };
$('#oHint').onclick = () => { const H = DAYS[World.day].hints || []; hintN = Math.min(H.length, hintN + 1); const b = $('#hintBox'); b.classList.remove('hide'); b.innerHTML = H.slice(0, hintN).map((h, i) => `💡${i + 1}. ${h}`).join('<br>') + (hintN < H.length ? '<br><span style="color:#8a7a9a">（もう いちど おすと つぎの ヒント）</span>' : ''); };
$('#pRetry').onclick = () => { $('#pause').classList.add('hide'); retryChain(); };
$('#pRetry0').onclick = () => { $('#pause').classList.add('hide'); retryPrep(); };
$('#pTitle').onclick = async () => { $('#pause').classList.add('hide'); await fadeOut(); showTitle(); await fadeIn(); };
Hooks.togglePause = () => { if (APP.paused) { APP.paused = false; $('#pause').classList.add('hide'); } else Hooks.menu(); };
addEventListener('visibilitychange', () => { if (document.hidden && APP.mode === 'play' && World.phase === 'chain') Hooks.menu(); });

// ---------------------------------------------------------------- simulation step
function simStep(dt) {
  const ph = World.phase;
  if (ph === 'prep') {
    World.dts = dt; World.dtm = dt * RATE_PREP; World.time += World.dtm;
    AG.monaka.tick(World.dts);
    if (World.time >= T(14) && !HEADLESS) { UI.toast('もうすぐ 家族が かえってくる！'); endPrep(); }
  } else if (ph === 'chain') {
    const sp = World.speed; World.dts = dt * sp; World.dtm = dt * sp * RATE_CHAIN;
    if (sp === 0) return;
    World.time += World.dtm;
    const tl = TIMELINE[World.day] || [];
    while (TL_I < tl.length && World.time >= tl[TL_I][0]) { tl[TL_I][1](); TL_I++; }
    for (const id of FAMILY) AG[id].tick(World.dts);
    AG.monaka.tick(World.dts);
    Robo.update(World.dts); Marbles.update(World.dts);
    const D = DAYS[World.day]; if (!World.goalDone && D.check && D.check()) goal(D.checkText || 'お題 たっせい', [World.events.length ? World.events[World.events.length - 1].id : null]);
    if (World.time >= T(19) && !World.caught) { if (!HEADLESS) endDay(); else World.phase = 'done'; }
  } else if (ph === 'title') {
    World.dts = dt; World.dtm = dt; AG.monaka.tick(dt);
  }
}
let last = performance.now(), titleT = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if ((APP.mode === 'play') && !APP.paused) simStep(dt);
  if (APP.mode === 'title') { simStep(dt); titleT += dt; View.yaw += dt * 0.05; const gm = Ghost.gm; gm.position.set(-2 + Math.sin(titleT * 0.6) * 1.5, 3.2 + Math.sin(titleT * 1.3) * 0.25, 2 + Math.cos(titleT * 0.6) * 1.2); gm.rotation.y = Math.sin(titleT) * 0.4; }
  const playing = APP.mode === 'play' && !APP.paused;
  Ghost.update(dt, playing && World.phase === 'chain' ? World.dts : playing ? dt : 0);
  updateObjects(dt);
  for (const id of [...FAMILY, 'monaka']) AG[id] && AG[id].animate(dt * (playing ? Math.max(1, World.speed) : 1));
  if (APP.mode === 'title') View.update(dt); else View.update(dt);
  if (APP.mode === 'title') { View.yawI = Math.round(View.yaw / (Math.PI / 2)); }
  Mood.update(dt); updateDoors(dt); Parts.update(dt);
  Dust.update(dt, World.phase === 'prep'); Rain.update(dt, !!World.rain && World.phase === 'chain');
  Chain.update(dt, View.moved); View.moved = false;
  Cones.update(dt); SearchFX.update();
  if (APP.mode === 'play' || APP.mode === 'scene') { UI.frame(dt); if (APP.mode === 'play') UI.hud(); }
  renderer.render(scene, camera);
}

// ---------------------------------------------------------------- debug / test API
function simRun(d, plan = {}) {
  const was = APP.mode; APP.mode = 'sim';
  setupDay(d); World.phase = 'prep'; World.time = T(10); Cat.start(AG.monaka);
  for (const [obj, act] of plan.prep || []) { Ghost.setHost({ type: 'obj', id: obj }); if (!Ghost.act(act)) console.warn('prep act failed', obj, act); }
  Ghost.setHost({ type: 'obj', id: plan.host || DAYS[d].start });
  startChainCore(); World.speed = plan.speed || 2;
  const acts = (plan.chain || []).slice().sort((a, b) => a[0] - b[0]);
  let guard = 0; const log = [];
  while (World.time < T(19) && !World.caught && guard++ < 400000) {
    while (acts.length && World.time >= acts[0][0]) { const [t, obj, act] = acts.shift(); if (obj) Ghost.setHost({ type: 'obj', id: obj }); if (act && !Ghost.act(act)) log.push('act failed ' + obj + ' ' + act + ' ' + fmtT(World.time)); }
    simStep(0.05);
    Ghost.update(0.05, World.dts);
    for (const id of [...FAMILY, 'monaka']) AG[id].animate(0.05);
    updateObjects(0.05);
    if (plan.until && plan.until()) break;
  }
  const res = Object.assign(dayResult(), { log, time: fmtT(World.time), ev: World.events.map(e => fmtT(e.t) + ' [' + e.depth + '] ' + e.text), exposure: +(World.maxExposure || 0).toFixed(2), caughtBy: World.caughtBy && World.caughtBy.id });
  APP.mode = was;
  return res;
}
function screenOf(id) { const o = O[id] || AG[id]; if (!o) return null; const p = new V3(o.pos.x, o.pos.y + (o.def && o.def.pickY != null ? o.def.pickY : 0.5), o.pos.z); FG[o.floor].localToWorld(p); p.project(camera); return { x: (p.x + 1) / 2 * VW, y: (1 - p.y) / 2 * VH }; }
function ff(mins) { const end = World.time + mins; let g = 0; while (World.time < end && World.phase === 'chain' && g++ < 100000) { simStep(0.05); Ghost.update(0.05, World.dts); for (const id of [...FAMILY, 'monaka']) AG[id].animate(0.05); updateObjects(0.05); } }
window.DBG = { simRun, screenOf, ff, setupDay, startDay, World, O, AG, Ghost, DAYS, SOLUTIONS: null, View };

// ---------------------------------------------------------------- boot
resize();
buildStatic();
initAgents();
View.setYaw(0);
Mood.set('chain', true);
if (!HEADLESS) { showTitle(); requestAnimationFrame(loop); }
else { setupDay(1); }
