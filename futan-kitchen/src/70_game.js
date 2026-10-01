// ================================================================ views
function setView(v) {
  K.root.visible = K.env.visible = v === 'kitchen';
  MapW.root.visible = v === 'map';
  Story.root.visible = v === 'story';
  if (v !== 'kitchen') Floats.end();
  if (v === 'story') { scene.background.setHex(0x9fdcff); camera.fov = VW < VH ? 60 : 45; camera.updateProjectionMatrix(); aimSun(0, 0); }
}
const show = (id, on) => $(id).classList.toggle('hide', !on);
function blurAll() { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }

// ================================================================ game flow
const Game = {
  lv: 0, menuCtl: new Ctl(['all', 'touch', 'pad0']), endT: 0, resultFor: null,
  toTitle() {
    APP.mode = 'title'; Voice.stop();
    for (const s of ['#hud', '#tc', '#intro', '#result', '#pauseM', '#mapUI', '#story', '#help']) show(s, false);
    MapW.leave();
    show('#title', true);
    buildKitchen(LEVELS[0]); setupPlayers(); K.phase = 'off'; K.easy = Save.d.diff === 'easy';
    setView('kitchen'); K.titleT = 0;
    Music.play('title');
  },
  start(twoP) {
    APP.twoP = twoP; Sound.unlock(); Sound.sfx('click');
    show('#title', false);
    if (!Save.d.seenIntro) Story.play('intro', () => { Save.d.seenIntro = 1; Save.write(); this.toMap(0); });
    else this.toMap();
  },
  toMap(focus) {
    for (const s of ['#hud', '#intro', '#result', '#pauseM', '#title']) show(s, false);
    show('#tc', false);
    Floats.clear(); clearKitchen();
    if (focus == null) { focus = 0; for (let i = 0; i < LEVELS.length; i++) if (MapW.unlocked(i)) focus = i; }
    MapW.enter(focus);
  },
  openIntro(i) {
    const L = LEVELS[i];
    if (L.boss && !Save.d.seenBoss) { MapW.leave(); Story.play('boss', () => { Save.d.seenBoss = 1; Save.write(); this.openIntro(i); }); return; }
    this.lv = i; MapW.leave(); show('#title', false);
    APP.mode = 'intro'; setView('kitchen');
    K.easy = Save.d.diff === 'easy';
    buildKitchen(L); setupPlayers(); K.phase = 'off'; K.t = 0;
    Music.play(K.th.music);
    fitKitchenCam(0, true);
    const chain = k => COMP[k].how.map(x => x.startsWith('×') ? `<b style="font-size:16px">${x}</b>` : `<img src="${iconURL(x)}" alt="">`).join('<span class="ar">▸</span>').replace(/<span class="ar">▸<\/span><b/g, '<b');
    const kb = isTouch ? '' : APP.twoP
      ? `<div class="keys">1P: <kbd>WASD</kbd> いどう <kbd>スペース</kbd> つかむ・おく <kbd>E</kbd> きる・あらう${L.throw ? '・なげる' : ''} <kbd>左Shift</kbd> ダッシュ<br>2P: <kbd>↑↓←→</kbd> いどう <kbd>Enter</kbd> つかむ・おく <kbd>右Shift</kbd> きる・あらう <kbd>/</kbd> ダッシュ　（ゲームパッドも OK）</div>`
      : `<div class="keys"><kbd>↑↓←→</kbd>/<kbd>WASD</kbd> いどう　<kbd>スペース</kbd> つかむ・おく　<kbd>E</kbd> きる・あらう${L.throw ? '・なげる' : ''}${L.fire || L.erupt ? '・けす' : ''}　<kbd>Shift</kbd> ダッシュ　<kbd>Tab</kbd> こうたい</div>`;
    $('#introC').innerHTML = `<div class="no">ステージ ${L.id}</div><h2>${L.name}</h2>
      <div class="recipes">${L.recipes.map(r => { const R = RECIPES[r]; return `<div class="rcp"><img class="dish" src="${iconURL(R.ic)}" alt=""><span class="nm">${R.n}</span><span class="eq">＝</span>${R.items.map(k => `<span class="chain">${chain(k)}</span>`).join('<span class="eq">＋</span>')}</div>`; }).join('')}</div>
      <div class="talk"><img src="${PORTRAIT.enchou}" alt=""><div>${L.talk}</div></div>
      <button class="btn red" id="goBtn">🍳 スタート！${isTouch ? '' : '（スペース）'}</button>${kb}`;
    show('#intro', true); blurAll();
    $('#goBtn').onclick = () => this.begin();
    Voice.say(L.talk, 0.9);
    this.menuCtl.poll(); this.menuCtl.clear(); this.inputLock = 0.4;
  },
  begin() {
    if (APP.mode !== 'intro') return;
    Sound.unlock(); Sound.sfx('click'); Voice.stop();
    show('#intro', false);
    APP.mode = 'play';
    const L = LEVELS[this.lv];
    K.score = 0; K.delivered = 0; K.failed = 0; K.tipSum = 0; K.time = 0; K.T = L.time + (K.easy ? 30 : 0);
    K.phase = 'ready'; K.readyT = 2.6; K.nextOrder = 0.5; K.eruptT = K.easy ? 16 : 12; K.meteor = null; K.t = 0;
    Tut.on = !!L.tut || K.easy;
    show('#hud', true); $('#hud').classList.add('hasOrders');
    show('#boss', !!L.boss);
    if (L.boss) { K.boss.fill = 0; bossCheck(); }
    if (isTouch) { show('#tc', true); $('#tc').classList.remove('maponly'); show('#tSwap', !APP.twoP); }
    $('#orders').innerHTML = ''; $('#tips').textContent = '';
    updHUD();
    bigText('よーい…'); Sound.sfx('count'); Voice.say('よーい');
    Music.fast = 1;
  },
  endRound(win) {
    if (K.phase !== 'run') return;
    K.phase = 'over'; this.endT = 2.6;
    Tut.target = null; Tut.text = '';
    const L = LEVELS[this.lv];
    if (L.boss) { if (win) { bigText('まんぷく！'); Sound.sfx('fanfare'); } else { bigText('タイムアップ！', true); Sound.sfx('whistle'); } }
    else { bigText('タイムアップ！'); Sound.sfx('whistle'); }
    Voice.say(L.boss && win ? 'まんぷく！' : 'タイムアップ！');
    for (const p of K.players) { p.task = null; p.cheer = true; }
    for (const o of K.orders) o.el.classList.remove('shake');
  },
  showResult() {
    APP.mode = 'result';
    show('#hud', false); show('#tc', false);
    const L = LEVELS[this.lv]; const mul = K.easy ? 0.75 : 1;
    const th = L.stars.map(s => Math.round(s * mul));
    let stars = th.filter(s => K.score >= s).length;
    const lose = L.boss && !(K.boss && K.boss.won);
    if (lose) stars = 0;
    const prev = Save.d.stars[L.id] || 0;
    if (stars > prev) Save.d.stars[L.id] = stars;
    if (K.score > (Save.d.best[L.id] || 0)) Save.d.best[L.id] = K.score;
    Save.write();
    const hasNext = this.lv + 1 < LEVELS.length && MapW.unlocked(this.lv + 1);
    const title = lose ? 'ざんねん…' : stars === 3 ? 'すごーい！' : stars === 2 ? 'じょうず！' : stars === 1 ? 'クリア！' : 'もう ちょっと！';
    $('#resultC').innerHTML = `<h2>${title}</h2>
      <div style="font-size:16px">ステージ ${L.id}　${L.name}</div>
      <div id="rStars"><span>★</span><span>★</span><span>★</span></div>
      <table id="rTable">
        <tr><td>🍽️ できた りょうり</td><td>${K.delivered} こ</td></tr>
        <tr><td>💰 チップ</td><td>${K.tipSum}</td></tr>
        <tr><td>⏰ まにあわなかった</td><td>${K.failed} こ</td></tr>
        ${L.boss ? `<tr><td>😋 ハラペコンの おなか</td><td>${lose ? 'まだ ペコペコ…' : 'まんぷく！'}</td></tr>` : ''}
        <tr class="tot"><td>とくてん</td><td class="dg">${K.score}</td></tr>
      </table>
      <div id="rNeed">★ ${th[0]}　★★ ${th[1]}　★★★ ${th[2]}${lose ? '<br>ハラペコンを まんぷくに すると クリアだよ！' : ''}</div>
      <div class="row">
        ${L.boss && !lose ? `<button class="btn red" id="rEnd">🎉 エンディングへ</button>` : ''}
        ${hasNext && !L.boss ? `<button class="btn red" id="rNext">▶ つぎの ステージ</button>` : ''}
        <button class="btn ${(!hasNext || stars === 0) && !(L.boss && !lose) ? 'red' : ''}" id="rRetry">↺ もういちど</button>
        <button class="btn white" id="rMap">🚌 ちずへ</button>
      </div>`;
    show('#result', true); blurAll();
    this.resDefault = $('#rEnd') ? 'end' : $('#rNext') && stars > 0 ? 'next' : 'retry';
    const sp = $$('#rStars span');
    sp.forEach((s, k) => { if (k < stars) s.classList.add('got'); setTimeout(() => { s.classList.add('pop'); if (k < stars) Sound.sfx('star'); }, 400 + k * 450); });
    setTimeout(() => { Sound.sfx(stars ? 'fanfare' : 'sad'); Voice.say(title + '。 ' + K.score + 'てん！'); }, 400 + 3 * 450);
    if ($('#rEnd')) $('#rEnd').onclick = () => this.ending();
    if ($('#rNext')) $('#rNext').onclick = () => { Sound.sfx('click'); show('#result', false); this.openIntro(this.lv + 1); };
    $('#rRetry').onclick = () => { Sound.sfx('click'); show('#result', false); this.openIntro(this.lv); };
    $('#rMap').onclick = () => { Sound.sfx('click'); this.toMap(this.lv); };
    this.menuCtl.poll(); this.menuCtl.clear(); this.inputLock = 1.2;
  },
  ending() {
    Sound.sfx('click'); show('#result', false); Floats.clear(); clearKitchen();
    Story.play('ending', () => { Save.d.cleared = 1; Save.write(); this.toMap(LEVELS.length - 1); });
  },
  pause() {
    if (APP.mode === 'play' && K.phase !== 'over') { APP.mode = 'pause'; show('#pauseM', true); syncOpts(); blurAll(); Voice.stop(); }
    else if (APP.mode === 'pause') this.resume();
  },
  resume() { if (APP.mode !== 'pause') return; show('#pauseM', false); APP.mode = 'play'; },
};
Hooks.pause = () => Game.pause();
$('#bPause').addEventListener('click', () => { Sound.sfx('click'); Game.pause(); });
$('#pRes').addEventListener('click', () => Game.resume());
$('#pRetry').addEventListener('click', () => { show('#pauseM', false); Floats.clear(); Game.openIntro(Game.lv); });
$('#pMap').addEventListener('click', () => { show('#pauseM', false); Game.toMap(Game.lv); });
$('#b1p').addEventListener('click', () => Game.start(false));
$('#b2p').addEventListener('click', () => Game.start(true));
$('#bMapTitle').addEventListener('click', () => { Sound.sfx('click'); MapW.leave(); Game.toTitle(); });
function syncOpts() {
  $$('[data-diff]').forEach(b => b.classList.toggle('on', b.dataset.diff === Save.d.diff));
  $$('[data-voice]').forEach(b => b.classList.toggle('on', +b.dataset.voice === (Voice.on ? 1 : 0)));
  $$('[data-snd]').forEach(b => b.classList.toggle('on', +b.dataset.snd === (Sound.on ? 1 : 0)));
}
$$('[data-diff]').forEach(b => b.addEventListener('click', () => { Save.d.diff = b.dataset.diff; Save.write(); K.easy = Save.d.diff === 'easy'; Sound.unlock(); Sound.sfx('click'); syncOpts(); }));
$$('[data-voice]').forEach(b => b.addEventListener('click', () => { Voice.setOn(b.dataset.voice === '1'); Sound.unlock(); Sound.sfx('click'); syncOpts(); if (Voice.on) Voice.say('よみあげ オン'); }));
$$('[data-snd]').forEach(b => b.addEventListener('click', () => { Sound.unlock(); Sound.setOn(b.dataset.snd === '1'); Sound.sfx('click'); syncOpts(); }));
$('#bHelp').addEventListener('click', () => {
  Sound.unlock(); Sound.sfx('click');
  $('#helpC').innerHTML = `<h2>あそびかた</h2>
  <div style="font-size:15px;line-height:1.6">ちゅうもん（うえの かみ）の りょうりを つくって 「うけとりぐち」🔔へ もっていこう！ はやく だすと チップが もらえるよ。</div>
  <div class="hgrid">
    <div><b>✋ つかむ・おく</b>はこから ざいりょうを とる・カウンターに おく・おさらに のせる・なべに いれる</div>
    <div><b>🔪 きる・あらう</b>まないたの まえで おすと トントン きるよ。 ながしでは おさらを あらう</div>
    <div><b>🍲 なべ・フライパン</b>いれると コンロで にえるよ。 ✓が でたら おさらに もりつけ。 ほっとくと こげる！</div>
    <div><b>🔄 こうたい</b>ひとりで あそぶ ときは ふーたんと リッキーを いれかえられるよ</div>
    <div><b>💨 ダッシュ</b>すばやく うごける！</div>
    <div><b>🧯 しょうかき</b>ひが ついたら もって 🔪ボタンで けそう</div>
    <div><b>⌨️ キーボード</b>いどう: ↑↓←→/WASD<br>つかむ: スペース　きる: E<br>ダッシュ: Shift　こうたい: Tab<br>ポーズ: Esc</div>
    <div><b>👭 ふたりで</b>1P: WASD・スペース・E・左Shift<br>2P: ↑↓←→・Enter・右Shift・/<br>ゲームパッド 2こ でも あそべるよ</div>
  </div>
  <button class="btn red" id="helpOk">わかった！</button>`;
  show('#help', true); $('#helpOk').onclick = () => { Sound.sfx('click'); show('#help', false); };
});

// ================================================================ main loop
function titleUpdate(dt) {
  K.t += dt; K.titleT += dt;
  const a = Math.sin(K.titleT * 0.18) * 0.35;
  const d = 14;
  camera.fov = VW < VH ? 55 : 36; camera.updateProjectionMatrix();
  camera.position.set(Math.sin(a) * d * 0.6, 9.5, Math.cos(a) * d * 0.75); camera.lookAt(0, 0.4, 0.5);
  // demo chefs wander a bit
  K.players.forEach((p, i) => {
    const tt = K.titleT * 0.5 + i * 2.5;
    const tx = Math.sin(tt) * 2.5 + (i ? 1.5 : -1.5), tz = Math.cos(tt * 1.3) * 0.6 + 0.6;
    const dx = tx - p.x, dz = tz - p.z, d2 = Math.hypot(dx, dz);
    if (d2 > 0.1) { p.face = dampAng(p.face, Math.atan2(dx, dz), 8, dt); p.x += dx / d2 * Math.min(d2, 1.6 * dt); p.z += dz / d2 * Math.min(d2, 1.6 * dt); }
    p.phase += dt * 8;
    animChef(p.P, { move: d2 > 0.1 ? 0.8 : 0, phase: p.phase, cheer: (K.titleT % 7) > 6 }, dt);
    p.P.g.position.set(p.x, 0, p.z); p.P.g.rotation.y = p.face;
    p.ring.visible = false; p.arrow.visible = false;
  });
  const c = Game.menuCtl; c.poll();
  if (c.pressed.pick && $('#help').classList.contains('hide')) Game.start(false);
}
function playUpdate(dt) {
  K.t += dt;
  if (K.phase === 'ready') {
    const before = K.readyT; K.readyT -= dt;
    if (before > 0.9 && K.readyT <= 0.9) { bigText('スタート！'); Sound.sfx('go'); Voice.say('スタート！'); }
    if (K.readyT <= 0) { K.phase = 'run'; if (!APP.twoP) showWho(); }
  } else if (K.phase === 'run') {
    K.time += dt; updOrders(dt); updFire(dt);
    const left = K.T - K.time;
    if (left < 30) Music.fast = 1.12;
    if (left < 10 && Math.floor(left + dt) !== Math.floor(left)) Sound.sfx('tick');
    if (K.time >= K.T) Game.endRound(false);
  } else if (K.phase === 'over') {
    Game.endT -= dt;
    if (Game.endT <= 0) { Game.showResult(); return; }
  }
  simPlayers(dt); simStations(dt); updFlying(dt); simMisc(dt);
  Tut.compute(); updHUD(); fitKitchenCam(dt); updFloats(); updPops(dt);
}
function idleKitchen(dt) {
  K.t += dt;
  for (const p of K.players) { animChef(p.P, { cheer: APP.mode === 'result' && p.cheer }, dt); p.hl.visible = false; }
  if (K.boss) animHarapekon(K.boss.P, {}, dt);
  fitKitchenCam(dt);
}
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
  pollPadStart();
  Game.inputLock = Math.max(0, (Game.inputLock || 0) - dt);
  switch (APP.mode) {
    case 'title': titleUpdate(dt); break;
    case 'map': MapW.update(dt); break;
    case 'story': Story.update(dt); break;
    case 'play': playUpdate(dt); break;
    case 'intro': idleKitchen(dt); Game.menuCtl.poll(); if (Game.menuCtl.pressed.pick && !Game.inputLock) Game.begin(); break;
    case 'result': {
      idleKitchen(dt); const c = Game.menuCtl; c.poll();
      if (c.pressed.pick && !Game.inputLock) { const b = Game.resDefault === 'end' ? $('#rEnd') : Game.resDefault === 'next' ? $('#rNext') : $('#rRetry'); b && b.click(); }
      break;
    }
    case 'pause': break;
  }
  Parts.update(APP.mode === 'pause' ? 0 : dt);
  renderer.render(scene, camera);
}

// ================================================================ boot
resize();
makePortraits();
syncOpts();
Game.toTitle();
if (DEBUG) { window.step = (n, dt = 1 / 30) => { for (let i = 0; i < n; i++) { if (APP.mode === 'play') playUpdate(dt); else if (APP.mode === 'map') MapW.update(dt); Parts.update(dt); } }; window.K = K; window.Game = Game; window.Save = Save; window.MapW = MapW; window.Story = Story; window.LEVELS = LEVELS; }
requestAnimationFrame(frame);
