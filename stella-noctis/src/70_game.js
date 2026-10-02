// ================================================================ game flow
const S_DEFAULT = JSON.stringify(S);
const Game = { mode: 'boot', skitReady: null, openMenu: () => Game_openMenu() };

// ---------------------------------------------------------------- title scene
const titleScene = new THREE.Scene();
const Title = (() => {
  const sky = makeSky(titleScene); sky.set(SKY.title);
  const g = new THREE.Group(); titleScene.add(g);
  const nz = makeNoise(5);
  const hf = (x, z) => { const d = Math.hypot(x, z - 6); return Math.max(-6, 3.2 - d * d * 0.012) + nz(x * 0.05, z * 0.05) * 2 - (z < -20 ? (-20 - z) * 0.3 : 0); };
  makeTerrain(g, 400, 100, hf, (x, z, c) => { const n = nz(x * .07, z * .07); c.setRGB(0.36 + n * 0.12, 0.42 + n * 0.12, 0.42); }, TEX.grass, 60);
  grassField(g, 2500, () => { const x = rnd(-30, 30), z = rnd(-14, 30); return [x, hf(x, z), z, rnd(0.8, 1.6)]; }, 0x2a4a4a, 0x8aa0a0);
  cityBackdrop(g, -40, -320, 1.4);
  const rings = barrierRings(g, -40, 120, -330, 200, 3);
  mountains(g, 20, 500, 700, 0x4a4a7a);
  trees(g, [[-14, hf(-14, 4), 4, 1.6], [16, hf(16, 10), 10, 1.4], [-20, hf(-20, 16), 16, 1.8]], [0x2a5a50, 0x3a6a58]);
  const sieg = makeModel('sieg'); g.add(sieg.root);
  sieg.root.position.set(0, hf(0, 6), 6); sieg.root.rotation.y = Math.PI * 1.05;
  const lucia = makeModel('lucia'); g.add(lucia.root); lucia.root.position.set(-1.6, hf(-1.6, 7.4), 7.4); lucia.root.rotation.y = Math.PI * 1.1;
  const noa = makeModel('noa'); g.add(noa.root); noa.root.position.set(1.8, hf(1.8, 7.8), 7.8); noa.root.rotation.y = Math.PI * 0.95;
  const mo = motes(g, 60, 0, 0, 25, 0.5, 8, 0xffe7a8);
  let t = 0;
  return {
    update(dt) {
      t += dt; grassUniform.value += dt;
      for (const m of [sieg, lucia, noa]) m.update(dt, { speed: 0, groundY: m.root.position.y });
      rings.update(dt); mo.update(dt);
      const a = Math.sin(t * 0.05) * 0.25;
      camera.position.set(Math.sin(a) * 9 + 1, 4.2 + Math.sin(t * 0.1) * 0.3, 18 + Math.cos(a) * 2);
      camera.lookAt(-6, 9, -40);
      sky.update(dt, camera);
      renderer.render(titleScene, camera);
    }
  };
})();
Game.toTitle = function () {
  UI.stack.length = 0;
  ['#dlg', '#choice', '#skit', '#result', '#menu', '#tip', '#fhud', '#bhud', '#prologue'].forEach(s => $(s).classList.add('hide'));
  if (Battle.on) cleanupBattle();
  Game.mode = 'title'; Game.skitReady = null;
  $('#title').classList.remove('hide'); $('#title .press').classList.remove('hide'); $('#tmenu').classList.add('hide');
  $('#fade').style.opacity = 0; setTouchMode('none');
  Audio2.play('title');
  Game.titleStage = 0;
};
function titleMenu() {
  const tm = $('#tmenu'); tm.classList.remove('hide'); $('#title .press').classList.add('hide');
  const opts = [['NEW GAME', 'はじめから'], ['CONTINUE', 'つづきから'], ['CONTROLS', '操作説明']];
  const can = [true, hasSave(), true];
  let sel = can[1] ? 1 : 0;
  tm.innerHTML = opts.map((o, i) => `<button data-i="${i}" ${can[i] ? '' : 'disabled'}>${o[0]}<small>${o[1]}</small></button>`).join('');
  const btns = [...tm.querySelectorAll('button')];
  const paint = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
  paint();
  const go = (i) => {
    if (!can[i]) return;
    Audio2.sfx('ok');
    if (i === 2) { UI.pop(w); UI.controls(() => { titleMenu(); }); return; }
    UI.pop(w); tm.classList.add('hide');
    if (i === 0) newGame(); else continueGame();
  };
  btns.forEach((b, i) => { b.onclick = () => go(i); b.onmouseenter = () => { if (can[i]) { sel = i; paint(); } }; });
  const w = { update() { if (Input.pressed.u || Input.pressed.d) { do { sel = (sel + (Input.pressed.u ? 2 : 1)) % 3; } while (!can[sel]); paint(); Audio2.sfx('cursor'); } if (Input.pressed.ok) go(sel); } };
  UI.push(w);
}
async function newGame() {
  Object.keys(S).forEach(k => delete S[k]); Object.assign(S, JSON.parse(S_DEFAULT));
  S.chars = {}; initChar('sieg', 1);
  await fadeOut(800);
  $('#title').classList.add('hide');
  Audio2.play('title');
  const el = $('#prologue'); el.classList.remove('hide');
  const L = ['星核（アストラ）――', '古代文明が遺した、奇跡の結晶。', '人々はその力で街に「結界」を張り、<br>魔物の脅威から身を守って暮らしていた。', '帝都アウレリア。<br>空に結界の輪が輝く、世界でもっとも安全な都。', '――その片隅の下町で、<br>ひとつの小さな事件が起ころうとしていた。'];
  let skip = false; const onSkip = () => skip = true; el.addEventListener('pointerdown', onSkip);
  const w = { update() { if (Input.pressed.ok || Input.pressed.cancel) skip = true; } }; UI.push(w);
  $('#fade').style.opacity = 0;
  for (const l of L) {
    if (skip) break;
    el.innerHTML = `<p>${l}</p>`; const p = el.querySelector('p'); await wait(50); p.classList.add('on');
    for (let i = 0; i < 30 && !skip; i++) await wait(100);
    p.classList.remove('on'); for (let i = 0; i < 12 && !skip; i++) await wait(100);
  }
  UI.pop(w); el.removeEventListener('pointerdown', onSkip);
  $('#fade').style.transition = 'none'; $('#fade').style.opacity = 1; el.classList.add('hide');
  enterField('town', [-6, 14, Math.PI]);
  await wait(100); await fadeIn(1200);
}
async function continueGame() {
  await fadeOut(600);
  if (!loadGame()) { Game.toTitle(); return; }
  $('#title').classList.add('hide');
  enterField(S.area, S.pos || null);
  await fadeIn(800);
}
function enterField(area, spawn) {
  Game.mode = 'field';
  $('#fhud').classList.remove('hide');
  setTouchMode('field');
  Field.load(area, spawn || defaultSpawn(area));
}
function defaultSpawn(a) { return { town: [-6, 14, Math.PI], field: [134, 0, -Math.PI / 2], forest: [0, 97, Math.PI], ruins: [0, 84, Math.PI] }[a]; }
Game.goArea = async function (to, spawn) {
  Field.lock = true; Game.mode = 'trans';
  await fadeOut(400);
  Field.load(to, spawn);
  Game.mode = 'field'; Field.lock = false;
  await fadeIn(500);
};

// ---------------------------------------------------------------- encounter transition (glass shatter)
function shatter(url) {
  const host = $('#shatter'); host.innerHTML = '';
  const cols = 6, rows = 4, W = 100 / cols, H = 100 / rows;
  const pts = []; for (let r = 0; r <= rows; r++) { pts[r] = []; for (let c = 0; c <= cols; c++) pts[r][c] = [c * W + (c > 0 && c < cols ? rnd(-W * .3, W * .3) : 0), r * H + (r > 0 && r < rows ? rnd(-H * .3, H * .3) : 0)]; }
  const pieces = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const a = pts[r][c], b = pts[r][c + 1], d = pts[r + 1][c], e = pts[r + 1][c + 1];
    for (const tri of (Math.random() < 0.5 ? [[a, b, e], [a, e, d]] : [[a, b, d], [b, e, d]])) {
      const i = document.createElement('i');
      i.style.backgroundImage = `url(${url})`;
      i.style.clipPath = `polygon(${tri.map(p => p[0] + '% ' + p[1] + '%').join(',')})`;
      const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
      i.style.transformOrigin = `${cx}% ${cy}%`;
      host.appendChild(i); pieces.push({ i, cx, cy });
    }
  }
  return {
    fly() {
      for (const p of pieces) {
        const dx = (p.cx - 50) * rnd(1.5, 3), dy = (p.cy - 50) * rnd(1.5, 3) + 30;
        p.i.style.transition = `transform ${rnd(0.7, 1.1)}s cubic-bezier(.4,.0,.8,.6), opacity 1s`;
        p.i.style.transform = `translate(${dx}vw, ${dy}vh) rotate(${rnd(-200, 200)}deg) scale(${rnd(0.6, 1)})`;
        p.i.style.opacity = 0;
      }
      setTimeout(() => host.innerHTML = '', 1300);
    }
  };
}
Game.startBattle = function (cfg, cb) {
  const prevMode = Game.mode;
  Game.mode = 'trans'; Field.lock = true;
  renderer.render(fieldScene, camera);
  let url = ''; try { url = canvas.toDataURL('image/jpeg', 0.75); } catch (_) { }
  flashScreen(0.6);
  Audio2.sfx('shatter');
  const sh = url ? shatter(url) : null;
  $('#fhud').classList.add('hide'); $('#prompt').classList.add('hide');
  setTimeout(() => {
    cfg.onEnd = async (res) => {
      Game.mode = 'trans';
      await fadeOut(350);
      Game.mode = 'field'; Field.lock = (Field.inEvent || 0) > 0;
      $('#fhud').classList.remove('hide'); setTouchMode('field'); updateGold();
      Audio2.play(S.flags.clear && Field.area === 'town' ? 'ending' : Field.def.music);
      Field.grace = 2.5;
      Field.snapCam();
      await fadeIn(400);
      cb && cb(res);
    };
    Battle.start(cfg);
    Game.mode = 'battle';
    if (sh) sh.fly();
    if (cfg.tutorial) battleTutorial();
  }, 380);
};
async function battleTutorial() {
  const T = [
    ['LINEAR MOTION BATTLE', `<kbd>←</kbd><kbd>→</kbd> で敵との<b>ライン上</b>を移動。<kbd>${keyLabel('atk')}</kbd> で通常攻撃（3連撃）。<br><kbd>${keyLabel('free')}</kbd> を押しっぱなしで<b>フリーラン</b>（自由に走る）。`, 6500],
    ['ARTES', `<kbd>${keyLabel('arte')}</kbd> で<b>術技</b>「${ARTES.souseninn.name}」！ <kbd>→</kbd>(敵の方向)＋<kbd>${keyLabel('arte')}</kbd> で「${ARTES.garou.name}」。<br>通常攻撃 → 術技 とつなげてコンボを狙え！ 術技は TP を消費する。`, 7000],
    ['DEFENSE', `<kbd>${keyLabel('guard')}</kbd> 押しっぱなしで<b>ガード</b>、<kbd>${keyLabel('jump')}</kbd> で<b>ジャンプ</b>。<kbd>${keyLabel('tgt')}</kbd> でターゲット切替。<br>左下の <b>OVER LIMIT</b> ゲージが溜まったら <kbd>${keyLabel('ol')}</kbd>！`, 7000],
  ];
  for (const [h, b, ms] of T) { if (!Battle.on) return; showTip(h, b, ms); await wait(ms + 300); }
}

// ---------------------------------------------------------------- main loop
let last = performance.now();
function frame(now) {
  const rdt = Math.min(0.05, Math.max(0.0001, (now - last) / 1000)); last = now;
  pollInput(rdt);
  if (UI.update(rdt)) clearPressed();
  if (Game.mode === 'title') {
    if (Game.titleStage === 0 && (Input.any || Input.pressed.ok)) { Game.titleStage = 1; Input.any = false; Audio2.unlock(); Audio2.play('title'); Audio2.sfx('ok'); titleMenu(); }
    Title.update(rdt);
  } else if (Game.mode === 'battle') { S.time += rdt; Battle.update(rdt); }
  else if (Game.mode === 'field' || Game.mode === 'menu') { S.time += rdt; Field.update(rdt); }
  else if (Game.mode === 'trans') { if (Battle.on) Battle.update(rdt); else if (Field.A) Field.update(rdt); else Title.update(rdt); }
  Input.any = false;
  requestAnimationFrame(frame);
}
// boot
(function boot() {
  Game.toTitle();
  // debug shortcuts: ?debug&area=forest&lv=8&party=sieg,lucia,noa&battle=bear
  if (DEBUG) {
    const q = new URLSearchParams(location.search);
    Object.keys(S).forEach(k => delete S[k]); Object.assign(S, JSON.parse(S_DEFAULT)); S.chars = {};
    const lv = +(q.get('lv') || 1);
    for (const id of (q.get('party') || 'sieg').split(',')) { S.party.includes(id) || S.party.push(id); initChar(id, lv); }
    S.party = (q.get('party') || 'sieg').split(',');
    for (const f of (q.get('flags') || '').split(',')) if (f) S.flags[f] = 1;
    if (q.get('ol')) Battle.ol.g = 100;
    if (q.get('area')) {
      $('#title').classList.add('hide');
      enterField(q.get('area'), q.get('pos') ? q.get('pos').split(',').map(Number) : null);
      if (q.get('battle')) setTimeout(() => Game.startBattle({ enemies: q.get('battle').split(','), area: q.get('arena') || q.get('area'), boss: !!q.get('boss') }, () => { }), 400);
    }
  }
  requestAnimationFrame(frame);
})();
