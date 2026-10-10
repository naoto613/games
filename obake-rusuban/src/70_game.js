// ================================================================ game flow
const GARDEN_TINT = { 1: 0xffffff, 2: 0xe8ffe0, 3: 0xf8d090, 4: 0xf4f8ff };
function setupVisit(v) {
  const { season, k } = visitInfo(v);
  Object.assign(World, { visit: v, season, k, layout: season >= 3 ? 'B' : 'A', sus: 0, search: null, caught: false, caughtBy: null, elapsed: 0, time: T0, speed: 1, darkRoom: null, chimeT: 0 });
  for (const f in World.flags) delete World.flags[f];
  SPOTS = World.layout === 'B' ? SPOT_B : SPOT_A;
  buildDecor(World.layout, season); buildObjects(SEASON_OBJS[season]);
  World.rooms = ROOM_IDS.slice(); updateLocks(World.rooms);
  for (const id in DOORS) World.setDoor(id, !(id === 'd_sh' || id === 'd_ent'), true);
  rebuildLOS(); objOccluders();
  STATIC[1].traverse(m => { if (m.userData.room === 'garden' && m.material) m.material.color.setHex(GARDEN_TINT[season]); });
  Parts.clear(); UI.clear(); UI.tip(null);
  initAgents();
  FAMILY = visitKids(v);
  for (const id of KIDS_ALL) resetKid(AG[id]);
  Ghost.reset();
  $$('#spd button').forEach(c => c.classList.toggle('on', c.dataset.s === '1'));
  $('#hDay').textContent = SEASONS[season].name + ' ' + k + 'かいめ';
  UI.buildKids();
  Cat.start(AG.monaka);
  Mood.set(SEASONS[season].mood, true);
}
function fadeOut() { return new Promise(r => { $('#fade').style.opacity = 1; setTimeout(r, HEADLESS ? 0 : 480); }); }
function fadeIn() { return new Promise(r => { $('#fade').style.opacity = 0; setTimeout(r, HEADLESS ? 0 : 480); }); }
async function startVisit(v) {
  APP.mode = 'scene'; APP.paused = false;
  await fadeOut();
  $('#title').classList.add('hide'); $('#hud').classList.add('hide');
  setupVisit(v);
  const { season, k } = visitInfo(v);
  View.setFloor(1, true); View.setYaw(0);
  Music.play('morning');
  await fadeIn();
  const intro = (INTRO[v] || []).slice();
  if (k === 1) intro.push(['n', '模様替えの日：' + SEASONS[season].deco + '。新しく のりうつれる 物を ためしてみよう。']);
  const extra = FAMILY.filter(id => !SEASONS[season].kids.includes(id));
  if (extra.length) intro.push(['n', 'こんかいは ' + extra.map(id => CHAR_DEF[id].name).join('・') + 'も あそびに くるらしい。（また来たい！）']);
  await Talk.run(intro, SEASONS[season].name + '　' + k + 'かいめ「' + KIND_OF_VISIT[k] + '」');
  $('#hud').classList.remove('hide');
  Ghost.setHost(k === 1 ? (NEW_OBJS[season][0]) : 'curtain');
  APP.mode = 'play';
  if (k === 1) startExplore(); else startPlay();
}
function startExplore() {
  World.phase = 'explore'; World.exploreT = 40; Music.play('prep');
  UI.tip('模様替えの日：子どもが くるまで、家じゅうの 物を ためせるよ。<b>' + NEW_OBJS[World.season].map(id => OBJDEF[id].name).join('・') + '</b> が あたらしい。おぼえる こと：' + SEASONS[World.season].skill, 'ex');
}
function startPlay() {
  World.phase = 'play'; World.elapsed = 0; World.time = T0; World.speed = 1;
  UI.tip(null); Music.play('chain');
  FAMILY.forEach((id, i) => { const a = AG[id]; a.stack = [kidLife(a, 1 + i * 3.5)]; });
  if (World.visit === 1) UI.tip('白い ○ を タップで のりうつる。<b>おどかす</b>ボタン：かるく おすと 小さく、ながおしで 大きく。頭の うえの メーターを <b>緑の 帯</b>に いれよう！', 'tut', 14);
}
function endVisit(how) {
  if (World.phase !== 'play') return;
  World.phase = 'chime'; World.chimeT = 0; World.endHow = how;
  if (World.search) { World.search = null; }
  if (how === 'chime') { Sound.sfx('chime'); UI.toast('ゆうやけこやけの チャイム♪'); }
  for (const id of FAMILY) { const a = AG[id]; if (a.home && !a.left) { a.mode = 'normal'; a.inspect = null; a.setProp(null); a.stack = [kidLeave(a, 'bye')]; say(a, how === 'caught' ? pick(['出たー！', 'おばけ みちゃった！', 'ほんとに いた〜！']) : pick(['またね〜！', 'かえろっか', 'たのしかった〜']), 2.2, 'loud'); setFace(a, 'happy'); } }
}
Hooks.caught = by => {
  const gm = Ghost.gm; gm.visible = true; gm.position.copy(Ghost.hostPos()); gm.position.y += 0.3;
  Sound.sfx('caught'); UI.toast('つかまっちゃった！', 'red');
  if (by) { setFace(by, 'surp'); }
  for (const id of FAMILY) AG[id].home && setFace(AG[id], 'happy');
  setTimeout(() => { gm.visible = false; }, 2200);
  endVisit('caught');
};
Hooks.searchStart = why => {
  Music.play('search'); Mood.set(World.season === 2 ? 'dark' : 'search');
  if (World.speed > 1) { World.speed = 1; $$('#spd button').forEach(c => c.classList.toggle('on', c.dataset.s === '1')); }
  UI.toast(why === 'day' ? 'かくれんぼの日！ おばけさがしが はじまった' : 'おばけさがしが はじまった！', 'red');
  UI.tip('60秒 にげきろう！ さわられたら、目の前で うつったら つかまる。' + SEASONS[World.season].searchTip, 'srch', 9);
  if (World.season === 2) Sound.sfx('thunder');
};
Hooks.searchEnd = () => { Music.play('chain'); Mood.set(SEASONS[World.season].mood); UI.toast('にげきった！ ドキドキ アップ', 'gold'); Sound.sfx('goal'); };
async function finishVisit() {
  APP.mode = 'scene'; World.phase = 'result';
  const r = visitResult(); saveVisit(r);
  UI.clear(); $('#hud').classList.add('hide');
  Mood.set('night'); Music.play('night');
  if (r.v === 16 && !r.caught) { await ending(); }
  const ch = await showResult(r);
  if (ch === 'next') { if (r.v >= 16) { await fadeOut(); showTitle(); await fadeIn(); openAlbum(); } else startVisit(r.v + 1); }
  else if (ch === 'retry') startVisit(r.v);
  else { await fadeOut(); showTitle(); await fadeIn(); }
}
async function ending() {
  const m = AG.mio; m.home = true; m.left = false; m.mesh.visible = true; m.place({ f: 1, x: 3.2, z: -1.6, yaw: Math.PI }); m.anim = 'idle';
  View.setFloor(1, true); View.zoomRoom('washitsu'); View.distT = 17;
  World.flags.mikan = true; O.kotatsu && O.kotatsu.def.refresh(O.kotatsu);
  Music.play('end');
  await Talk.run(ENDING, 'ふゆの おわりに');
  Save.d.cleared = 1; Save.write();
}
// ---------------------------------------------------------------- title & menus
function showTitle() {
  APP.mode = 'title'; APP.paused = false;
  setupVisit(Math.min(16, Save.d.unlocked || 1)); World.phase = 'title';
  $('#hud').classList.add('hide'); $('#title').classList.remove('hide');
  $('#tPlay').textContent = (Save.d.unlocked || 1) > 1 ? 'つづきから' : 'はじめる';
  Music.play('night'); View.setFloor(1, true); View.distT = 40; View.dist = 40;
  Ghost.gm.visible = true;
}
$('#tPlay').onclick = () => { Sound.unlock(); Sound.sfx('ok'); startVisit(Math.min(16, Save.d.unlocked || 1)); };
$('#tDays').onclick = () => { Sound.unlock(); Sound.sfx('tap'); openDays(); };
$('#tAlbum').onclick = () => { Sound.unlock(); Sound.sfx('page'); openAlbum(); };
$('#tHow').onclick = () => { Sound.unlock(); $('#how').classList.remove('hide'); };
$$('[data-close]').forEach(b => b.onclick = () => { b.closest('.scr').classList.add('hide'); Sound.sfx('tap'); });
$('#bReady').onclick = () => { if (World.phase === 'explore') { Sound.sfx('ok'); startPlay(); } };
Hooks.menu = () => {
  if (APP.mode !== 'play') return;
  APP.paused = true; $('#pause').classList.remove('hide');
  $('#oSnd').textContent = Sound.on ? 'ON' : 'OFF'; $('#oSnd').classList.toggle('on', Sound.on);
  $('#oCone').textContent = Save.d.cone ? 'ON' : 'OFF'; $('#oCone').classList.toggle('on', !!Save.d.cone);
};
$('#bMenu').onclick = () => { Sound.unlock(); Hooks.menu(); };
$('#pRes').onclick = () => { APP.paused = false; $('#pause').classList.add('hide'); };
$('#oSnd').onclick = () => { Sound.unlock(); Sound.setOn(!Sound.on); $('#oSnd').textContent = Sound.on ? 'ON' : 'OFF'; $('#oSnd').classList.toggle('on', Sound.on); };
$('#oCone').onclick = () => { Save.d.cone = Save.d.cone ? 0 : 1; Save.write(); $('#oCone').textContent = Save.d.cone ? 'ON' : 'OFF'; $('#oCone').classList.toggle('on', !!Save.d.cone); };
$('#pRetry').onclick = () => { $('#pause').classList.add('hide'); startVisit(World.visit); };
$('#pTitle').onclick = async () => { $('#pause').classList.add('hide'); await fadeOut(); showTitle(); await fadeIn(); };
addEventListener('visibilitychange', () => { if (document.hidden && APP.mode === 'play' && World.phase === 'play') Hooks.menu(); });

// ---------------------------------------------------------------- simulation step
function simStep(dt) {
  const ph = World.phase;
  World.dts = dt; World.dtm = 0;
  if (ph === 'explore') {
    World.exploreT -= dt; AG.monaka.tick(dt);
    if (World.exploreT <= 0 && !HEADLESS) startPlay();
  } else if (ph === 'play') {
    const sp = World.speed; World.dts = dt * sp; if (sp === 0) return;
    World.elapsed += World.dts; World.time = T0 + World.elapsed * (T1 - T0) / VISIT_SECS;
    if (World.k === 3 && !World.flags.seekDay && World.elapsed > VISIT_SECS * 0.5) { World.flags.seekDay = 1; Ghost.startSearch('day'); }
    for (const id of FAMILY) { const a = AG[id]; a.tick(World.dts); kidTick(a, World.dts); }
    AG.monaka.tick(World.dts);
    if (World.darkRoom && (World.darkRoom.t -= World.dts) <= 0) World.darkRoom = null;
    if (World.time >= T1) endVisit('chime');
    else if (FAMILY.every(id => AG[id].left || AG[id].gone)) endVisit('empty');
    if (World.search && World.season === 2 && Math.random() < World.dts * 0.12) { Sound.sfx('thunder'); flashSky(); }
  } else if (ph === 'chime') {
    World.dts = dt * Math.max(1, World.speed); World.chimeT += World.dts;
    for (const id of FAMILY) AG[id].tick(World.dts);
    if ((FAMILY.every(id => !AG[id].home) || World.chimeT > 8) && !HEADLESS) finishVisit();
  } else if (ph === 'title') { AG.monaka.tick(dt); }
}
function flashSky() { const e = renderer.toneMappingExposure; renderer.toneMappingExposure = 2.4; setTimeout(() => renderer.toneMappingExposure = e, 90); }
let last = performance.now(), titleT = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if ((APP.mode === 'play' || APP.mode === 'scene' && World.phase === 'chime') && !APP.paused) simStep(dt);
  if (APP.mode === 'title') { simStep(dt); titleT += dt; View.yaw += dt * 0.05; View.yawI = Math.round(View.yaw / (Math.PI / 2)); const gm = Ghost.gm; gm.position.set(-2 + Math.sin(titleT * 0.6) * 1.5, 3.2 + Math.sin(titleT * 1.3) * 0.25, 2 + Math.cos(titleT * 0.6) * 1.2); gm.rotation.y = Math.sin(titleT) * 0.4; }
  const playing = APP.mode === 'play' && !APP.paused;
  Ghost.update(dt, playing ? World.dts : 0);
  updateObjects(dt);
  for (const id of [...KIDS_ALL, 'monaka']) AG[id] && AG[id].animate(dt * (playing ? Math.max(1, World.speed) : 1));
  View.update(dt); Mood.update(dt);
  if (World.darkRoom) renderer.toneMappingExposure *= World.darkRoom.flick ? (Math.random() < 0.5 ? 0.5 : 1) : 0.35;
  updateDoors(dt); Parts.update(dt);
  Dust.update(dt, World.phase === 'explore');
  Rain.update(dt, World.season === 4 ? 'snow' : (World.search && World.season === 2 ? 'rain' : null));
  Cones.update(dt); SearchFX.update();
  if (APP.mode === 'play' || APP.mode === 'scene') { UI.frame(dt); if (APP.mode === 'play') UI.hud(); }
  renderer.render(scene, camera);
}

// ---------------------------------------------------------------- debug / balance bot
function screenOf(id) { const o = O[id] || AG[id]; if (!o) return null; const p = new V3(o.pos.x, o.pos.y + (o.def && o.def.pickY != null ? o.def.pickY : 0.5), o.pos.z); FG[o.floor].localToWorld(p); p.project(camera); return { x: (p.x + 1) / 2 * VW, y: (1 - p.y) / 2 * VH }; }
function botRun(v, opt = {}) {
  // a simple player: finds the most under-scared kid, jumps next to it and scares just enough
  const was = APP.mode; APP.mode = 'sim';
  setupVisit(v); Ghost.setHost('curtain'); World.phase = 'play'; World.elapsed = 0; World.time = T0;
  FAMILY.forEach((id, i) => { const a = AG[id]; a.stack = [kidLife(a, 1 + i * 3.5)]; });
  let think = 0, guard = 0;
  while (World.phase === 'play' && guard++ < 100000) {
    simStep(0.05); Ghost.update(0.05, World.dts); for (const id of [...KIDS_ALL, 'monaka']) AG[id].animate(0.05); updateObjects(0.05);
    think -= 0.05; if (think > 0) continue; think = opt.think || 1.2;
    if (World.search) { // flee: hop to a thing nobody is near
      const h = Ghost.hostObj(); const near = FAMILY.some(id => { const a = AG[id]; return a.mode === 'search' && h && a.floor === h.floor && a.pos.distanceTo(h.pos) < 3; });
      if (near) { const c = Object.values(O).filter(o => o.def.host && Ghost.canHop(o) && !FAMILY.some(id => AG[id].home && AG[id].floor === o.floor && AG[id].pos.distanceTo(o.pos) < 4)); if (c.length) { const o = pick(c); Ghost.S.hop = null; Ghost.setHost(o.id); } }
      continue;
    }
    const kids = FAMILY.map(id => AG[id]).filter(a => a.home && !a.gone && !a.left && !a.asleep && a.mode !== 'search' && !a.lock);
    if (!kids.length) continue;
    kids.sort((p, q) => (p.doki - band(p)[0]) - (q.doki - band(q)[0]));
    const a = kids[0]; const [lo, hi] = band(a); if (a.doki >= lo + 2) continue;
    const big = (lo - a.doki) > 18 || kidP(a).brave;
    // choose a thing in the kid's room, not watched by anyone
    const cand = Object.values(O).filter(o => scareDef(o) && objRooms(o).includes(a.room) && o.cd <= 0 && (opt.careless || !FAMILY.some(id => AG[id].home && canSeeObj(AG[id], o, 7.5))));
    if (!cand.length) continue;
    cand.sort((p, q) => p.pos.distanceTo(a.pos) - q.pos.distanceTo(a.pos));
    const o = cand[0]; Ghost.setHost(o.id);
    // don't overshoot others in the room
    const risky = FAMILY.some(id => { const b = AG[id]; return b !== a && b.home && b.room === a.room && b.doki + 30 > cryLine(b); });
    Ghost.scare(big && !risky);
  }
  const r = visitResult(); APP.mode = was;
  return { v, stars: r.stars, avg: +r.avg.toFixed(2), caught: r.caught, per: r.per.map(p => p.id + ':' + p.r.toFixed(2) + (p.cried ? '(cry)' : '')), sus: World.sus };
}
window.DBG = { botRun, screenOf, startVisit, World, O, AG, Ghost, View, setupVisit };

// ---------------------------------------------------------------- boot
resize();
buildStatic();
initAgents();
View.setYaw(0);
Mood.set('autumn', true);
if (!HEADLESS) { showTitle(); requestAnimationFrame(loop); }
