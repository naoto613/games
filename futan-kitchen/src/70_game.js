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
  lv: 0, menuCtl: new Ctl(['all', 'touch', 'pad0']), endT: 0,
  toTitle() {
    APP.mode = 'title';
    for (const s of ['#hud', '#tc', '#intro', '#result', '#pauseM', '#mapUI', '#story', '#help']) show(s, false);
    MapW.leave();
    show('#title', true);
    buildKitchen(LEVELS[1]); setupPlayers(); K.phase = 'off';
    setView('kitchen'); K.titleT = 0;
    Music.play('title');
  },
  start(twoP) {
    APP.twoP = twoP; Sound.unlock(); Sound.sfx('click');
    show('#title', false);
    if (!Save.d.seenIntro) Story.play('intro', () => this.openIntro(0));
    else this.toMap();
  },
  toMap(focus) {
    for (const s of ['#hud', '#intro', '#result', '#pauseM', '#title']) show(s, false);
    show('#tc', false);
    Floats.clear(); clearKitchen();
    if (focus == null) { focus = 0; for (let i = 0; i < LEVELS.length - 1; i++) if (MapW.unlocked(i)) focus = i; }
    MapW.enter(focus);
  },
  openIntro(i) {
    const L = LEVELS[i];
    if (L.id === 'FINAL' && !Save.d.seenBoss) { MapW.leave(); Story.play('boss', () => { Save.d.seenBoss = 1; Save.write(); this.openIntro(i); }); return; }
    this.lv = i; MapW.leave(); show('#title', false); show('#result', false); show('#pauseM', false);
    APP.mode = 'intro'; setView('kitchen');
    K.easy = false;
    buildKitchen(L); setupPlayers(); K.phase = 'off'; K.t = 0;
    Music.play(K.th.music);
    fitKitchenCam(0, true);
    const chain = k => COMP[k].how.map(x => x.startsWith('×') ? `<b style="font-size:15px">${x}</b>` : `<img src="${iconURL(x)}" alt="">`).join('<span class="ar">▸</span>').replace(/<span class="ar">▸<\/span><b/g, '<b');
    const kb = isTouch ? '' : APP.twoP
      ? `<div class="keys">1P：<kbd>WASD</kbd> 移動　<kbd>Space</kbd> 持つ/置く　<kbd>E</kbd> 切る/洗う/投げる　<kbd>左Shift</kbd> ダッシュ<br>2P：<kbd>↑↓←→</kbd> 移動　<kbd>Enter</kbd> 持つ/置く　<kbd>右Shift</kbd> 切る/洗う/投げる　<kbd>/</kbd> ダッシュ　（ゲームパッド対応）</div>`
      : `<div class="keys"><kbd>WASD</kbd>/<kbd>↑↓←→</kbd> 移動　<kbd>Space</kbd> 持つ/置く　<kbd>E</kbd>/<kbd>Ctrl</kbd> 切る/洗う/投げる/消火　<kbd>Shift</kbd> ダッシュ　<kbd>Tab</kbd> シェフ交代　<kbd>Esc</kbd> ポーズ</div>`;
    const head = L.prologue ? `<div class="tagno">プロローグ</div><h2>${L.name}</h2>`
      : `<div class="tagno">${L.id === 'FINAL' ? '最終ステージ' : 'ステージ ' + L.id}</div><h2>${L.name}</h2><div class="starrow">${L.stars.map((v, k) => `<span><b>${'★'.repeat(k + 1)}</b> ${v}</span>`).join('')}</div>`;
    const talk = L.prologue ? 'ハラペコンに料理を100皿！ ……とにかく、作れるだけ作るのじゃ！' : L.talk;
    $('#introC').innerHTML = `${head}
      <div class="recipes">${L.recipes.map(r => { const R = RECIPES[r]; return `<div class="rcp"><img class="dish" src="${iconURL(R.ic)}" alt=""><span class="nm">${R.n}</span><span class="eq">＝</span>${R.items.map(k => `<span class="chain">${chain(k)}</span>`).join('<span class="eq">＋</span>')}</div>`; }).join('')}</div>
      ${talk ? `<div class="talk"><img src="${PORTRAIT.enchou}" alt=""><div>${talk}</div></div>` : ''}
      <button class="btn" id="goBtn">▶ スタート${isTouch ? '' : '（Space）'}</button>${kb}`;
    show('#intro', true); blurAll();
    $('#goBtn').onclick = () => this.begin();
    this.menuCtl.poll(); this.menuCtl.clear(); this.inputLock = 0.4;
  },
  begin() {
    if (APP.mode !== 'intro') return;
    Sound.unlock(); Sound.sfx('click');
    show('#intro', false);
    APP.mode = 'play';
    const L = LEVELS[this.lv];
    K.score = 0; K.base = 0; K.delivered = 0; K.failed = 0; K.tipSum = 0; K.wrong = 0; K.time = 0; K.T = L.time; K.combo = 1;
    K.phase = 'ready'; K.readyT = 2.6; K.nextOrder = 0.5; K.eruptT = 12; K.meteor = null; K.t = 0;
    Tut.on = !!L.tut;
    show('#hud', true);
    show('#boss', !!L.boss);
    if (L.boss) { K.boss.fill = 0; bossCheck(); }
    if (isTouch) { show('#tc', true); $('#tc').classList.remove('maponly'); show('#tSwap', !APP.twoP); }
    $('#orders').innerHTML = ''; $('#tips').textContent = '';
    updHUD();
    bigText('Ready…'); Sound.sfx('count');
    Music.fast = 1;
  },
  endRound(win) {
    if (K.phase !== 'run') return;
    K.phase = 'over'; this.endT = 2.6;
    Tut.target = null; Tut.text = '';
    const L = LEVELS[this.lv];
    if (L.boss && win) { bigText('満腹！'); Sound.sfx('fanfare'); }
    else { bigText('タイムアップ！', true); Sound.sfx('whistle'); }
    for (const p of K.players) { p.task = null; p.cheer = !(L.prologue); p.sad = !!L.prologue; }
    for (const o of K.orders) o.el.classList.remove('shake');
  },
  showResult() {
    const L = LEVELS[this.lv];
    if (L.prologue) {
      show('#hud', false); show('#tc', false); Floats.clear(); clearKitchen();
      Story.play('intro2', () => { Save.d.seenIntro = 1; Save.write(); this.toMap(0); });
      return;
    }
    APP.mode = 'result';
    show('#hud', false); show('#tc', false);
    const th = L.stars;
    let stars = th.filter(s => K.score >= s).length;
    const lose = L.boss && !(K.boss && K.boss.won);
    if (lose) stars = 0;
    const prev = Save.d.stars[L.id] || 0;
    if (stars > prev) Save.d.stars[L.id] = stars;
    const newBest = K.score > (Save.d.best[L.id] || 0);
    if (newBest) Save.d.best[L.id] = K.score;
    Save.write();
    const hasNext = this.lv + 1 < LEVELS.length && MapW.unlocked(this.lv);
    const title = lose ? 'ハラペコンはまだ腹ペコ…' : L.boss && stars === 0 ? 'ハラペコン満腹！' : stars === 3 ? 'パーフェクト！' : stars === 2 ? 'グレート！' : stars === 1 ? 'クリア！' : '失敗…';
    $('#resultC').innerHTML = `<h2>${title}</h2>
      <div style="font-size:15px;color:#c8d4f0">${L.id === 'FINAL' ? '最終ステージ' : 'ステージ ' + L.id}　${L.name}</div>
      <div id="rStars"><span>★</span><span>★</span><span>★</span></div>
      <table id="rTable">
        <tr><td>🍽️ 提供した料理 ×${K.delivered}</td><td>+${K.base}</td></tr>
        <tr><td>💰 チップ</td><td>+${K.tipSum}</td></tr>
        <tr><td>⏰ 時間切れの注文 ×${K.failed}</td><td>-${K.failed * 10}</td></tr>
        ${K.wrong ? `<tr><td>❌ 間違えた料理 ×${K.wrong}</td><td>0</td></tr>` : ''}
        ${L.boss ? `<tr><td>😋 ハラペコン</td><td>${lose ? K.boss.fill + ' / ' + bossNeed() : '満腹！'}</td></tr>` : ''}
        <tr class="tot"><td>スコア${newBest && K.score ? ' <small style="font-size:13px">NEW BEST!</small>' : ''}</td><td class="dg">${K.score}</td></tr>
      </table>
      <div id="rNeed">★ ${th[0]}　★★ ${th[1]}　★★★ ${th[2]}${lose ? '<br>ハラペコンを満腹にすればクリア' : ''}</div>
      <div class="row">
        ${L.boss && !lose ? `<button class="btn" id="rEnd">🎉 エンディングへ</button>` : ''}
        ${hasNext && !L.boss && stars > 0 ? `<button class="btn" id="rNext">▶ 次のステージ</button>` : ''}
        <button class="btn blue" id="rRetry">↺ リトライ</button>
        <button class="btn grey" id="rMap">🚌 マップへ</button>
      </div>`;
    show('#result', true); blurAll();
    this.resDefault = $('#rEnd') ? 'end' : $('#rNext') ? 'next' : 'retry';
    const sp = $$('#rStars span');
    sp.forEach((s, k) => { if (k < stars) s.classList.add('got'); setTimeout(() => { s.classList.add('pop'); if (k < stars) Sound.sfx('star'); }, 400 + k * 450); });
    setTimeout(() => Sound.sfx(stars ? 'fanfare' : 'sad'), 400 + 3 * 450);
    if ($('#rEnd')) $('#rEnd').onclick = () => this.ending();
    if ($('#rNext')) $('#rNext').onclick = () => { Sound.sfx('click'); show('#result', false); this.openIntro(this.lv + 1); };
    $('#rRetry').onclick = () => { Sound.sfx('click'); show('#result', false); this.openIntro(this.lv); };
    $('#rMap').onclick = () => { Sound.sfx('click'); this.toMap(this.lv - 1); };
    this.menuCtl.poll(); this.menuCtl.clear(); this.inputLock = 1.2;
  },
  ending() {
    Sound.sfx('click'); show('#result', false); Floats.clear(); clearKitchen();
    Story.play('ending', () => { Save.d.cleared = 1; Save.write(); this.toMap(LEVELS.length - 2); });
  },
  pause() {
    if (APP.mode === 'play' && K.phase !== 'over') { APP.mode = 'pause'; show('#pauseM', true); syncOpts(); blurAll(); }
    else if (APP.mode === 'pause') this.resume();
  },
  resume() { if (APP.mode !== 'pause') return; show('#pauseM', false); APP.mode = 'play'; },
};
Hooks.pause = () => Game.pause();
$('#bPause').addEventListener('click', () => { Sound.sfx('click'); Game.pause(); });
$('#pRes').addEventListener('click', () => Game.resume());
$('#pRetry').addEventListener('click', () => { show('#pauseM', false); Floats.clear(); Game.openIntro(Game.lv); });
$('#pMap').addEventListener('click', () => { show('#pauseM', false); if (LEVELS[Game.lv].prologue) { Game.endT = 0; APP.mode = 'play'; K.phase = 'over'; return; } Game.toMap(Game.lv - 1); });
$('#b1p').addEventListener('click', () => Game.start(false));
$('#b2p').addEventListener('click', () => Game.start(true));
$('#bMapTitle').addEventListener('click', () => { Sound.sfx('click'); MapW.leave(); Game.toTitle(); });
function syncOpts() {
  $$('[data-snd]').forEach(b => b.classList.toggle('on', +b.dataset.snd === (Sound.on ? 1 : 0)));
}
$$('[data-snd]').forEach(b => b.addEventListener('click', () => { Sound.unlock(); Sound.setOn(b.dataset.snd === '1'); Sound.sfx('click'); syncOpts(); }));
$('#bHelp').addEventListener('click', () => {
  Sound.unlock(); Sound.sfx('click');
  $('#helpC').innerHTML = `<h2>操作方法</h2>
  <div style="font-size:14px;line-height:1.6;font-weight:500">画面左上の注文を、左から順に作って受け取り口🔔へ。左端の注文から順番に出すとチップ倍率（最大×4）が上がり、時間切れや順番飛ばしでリセット。注文が時間切れになると -10点。</div>
  <div class="hgrid">
    <div><b>持つ／置く</b>木箱から食材を取る、カウンターに置く、皿に盛る、鍋に入れる、料理を提供する。</div>
    <div><b>切る／洗う／投げる</b>まな板の前で切る（その場を離れると中断）。シンクで皿洗い。食材を持っているときは投げる。</div>
    <div><b>調理と焦げ</b>✓が出たら完成。放置すると「!」が点滅して焦げ、やがて火事に。延焼するので消火器で消そう。</div>
    <div><b>シェフ交代</b>ひとりプレイではふーたんとリッキーを切り替えて2人分働かせる。切っている途中で交代しても作業は続く。</div>
    <div><b>落下</b>水・溶岩・隙間に落ちると5秒後に復活。持っていた食材は失われる。</div>
    <div><b>キーボード（ひとり）</b>移動 WASD/矢印　持つ Space　切る E/Ctrl<br>ダッシュ Shift　交代 Tab/Q　ポーズ Esc</div>
    <div><b>ふたりプレイ</b>1P：WASD・Space・E・左Shift<br>2P：矢印・Enter・右Shift・/<br>ゲームパッド2台でもOK（A持つ X切る B ダッシュ）</div>
  </div>
  <button class="btn" id="helpOk">OK</button>`;
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
    if (before > 0.9 && K.readyT <= 0.9) { bigText('GO!'); Sound.sfx('go'); }
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
