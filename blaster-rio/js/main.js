'use strict';
// ===== セーブ =====
const SAVE_KEY = 'blasterRio.v1';
const defSave = () => ({ got: {}, beaten: {}, intro: false, mid: false, cleared: false, bolts: 0, up: {}, taken: {}, lives: 3 });
function loadSave() {
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s) return Object.assign(defSave(), s); } catch (e) {}
  return null;
}
function writeSave() { try { G.save.lives = Math.max(2, G.lives); localStorage.setItem(SAVE_KEY, JSON.stringify(G.save)); } catch (e) {} }

// ===== 音楽 =====
const SONGS = {
  title: genSong(11, { root: 45, bpm: 128, prog: [0, 8, 3, 10, 0, 8, 10, 7], density: 0.9 }),
  select: genSong(23, { root: 48, bpm: 120, scale: 'major', prog: [0, 5, 7, 0, 9, 5, 2, 7], density: 0.8, drums: 'k.h.s.h.k.h.s.hh' }),
  boss: genSong(37, { root: 40, bpm: 168, prog: [0, 1, 0, 1, 10, 8, 7, 7], drums: 'k.hhs.hhk.k.s.hh', bassPat: [0, 12, 0, 12, 0, 12, 0, 12] }),
  shop: genSong(51, { root: 50, bpm: 108, scale: 'major', prog: [0, 9, 5, 7], density: 0.7, drums: 'k...h...s...h...' }),
  final: genSong(61, { root: 38, bpm: 156, prog: [0, 8, 10, 7, 0, 8, 1, 7], drums: 'k.hhs.hhk.k.s.hh' }),
  ending: genSong(71, { root: 48, bpm: 96, scale: 'major', prog: [0, 7, 9, 5, 0, 7, 5, 7], density: 0.7, drums: 'k...h...s...h.h.' }),
};
const STAGE_SONG = {};
const stageSong = id => {
  if (id === 'final') return SONGS.final;
  if (!STAGE_SONG[id]) {
    const i = Object.keys(STAGES).indexOf(id);
    const major = id === 'gale' || id === 'frost' || id === 'intro' ? 'dorian' : 'minor';
    STAGE_SONG[id] = genSong(100 + i * 7, { root: 40 + (i * 5) % 9, bpm: 140 + (i % 4) * 8, scale: major, prog: i % 2 ? [0, 8, 3, 10, 5, 7, 8, 10] : [0, 10, 8, 10, 0, 10, 8, 7] });
  }
  return STAGE_SONG[id];
};
const J = {
  ready: () => jingle([[64, 2], [67, 2], [71, 2], [76, 6]], 150),
  victory: () => jingle([[72, 2], [76, 2], [79, 2], [84, 4], [null, 2], [79, 2], [81, 2], [83, 2], [84, 8]], 150),
  weapon: () => jingle([[67, 2], [72, 2], [76, 2], [79, 2], [84, 2], [79, 2], [84, 8]], 140),
  over: () => jingle([[72, 3], [67, 3], [64, 3], [60, 9]], 110),
};

// ===== ゲーム全体 =====
const G = {
  state: 'title', t: 0, st: 0, save: loadSave() || defSave(), hasSave: !!loadSave(), lives: 3, energy: Array(9).fill(28),
  cursor: 0, menu: 0, msg: null,
  weapons() { const l = [0]; for (let i = 1; i <= 8; i++) if (this.save.got[i]) l.push(i); return l; },
};
function go(state) { G.state = state; G.st = 0; G.menu = 0; }

// ===== ステージ開始・再開 =====
function startStage(id, check, retry) {
  const keepW = P ? P.weapon : 0;
  createStage(id);
  S.placed.forEach(p => { if (p.type === 'etank' && G.save.taken[id + ':' + p.id]) p.got = true; });
  S.check = check || null;
  let sx = check ? check.x : 2 * TS + 8, sy = check ? check.y : (ROWS - 2) * TS;
  P = newPlayer(sx, sy);
  P.weapon = retry && G.save.got[keepW] ? keepW : 0;
  P.warp = 'in'; P.warpY = -20;
  if (!retry) G.energy = Array(9).fill(28);
  S.camX = clamp(sx - W / 2, 0, (S.doorCol + 1) * TS - W);
  S.phase = 'ready'; S.pt = 0;
  Music.play(J.ready());
  go('stage');
  if (DEBUG && QS.has('boss')) { P.x = S.doorCol * TS - 40; S.camX = clamp(P.x - W / 2, 0, (S.doorCol + 1) * TS - W); }
}
function bossDefeated(b) {
  b.st = 'gone';
  S.eb = []; S.windDir = 0; S.wind = 0;
  const big = b.id === 'nox1' || b.id === 'nox2' || !S.rush;
  for (let ring = 0; ring < 2; ring++) for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 + ring * 0.4, sp = ring ? 1.3 : 2.6;
    S.fx.push({ kind: 'orb', x: cx(b), y: cy(b), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 170, c: b.d.a });
  }
  SFX.bigExplode(); S.flash = 10;
  if (S.rush && S.rush.i < S.rush.list.length - 1) {
    S.phase = 'rushNext'; S.pt = 0; S.rush.i++;
    if (S.rush.list[S.rush.i] !== 'nox2') addItem('hpL', (RL() + RRt()) / 2, 120, -1);
    Music.stop();
    return;
  }
  Music.stop();
  S.phase = 'victory'; S.pt = 0;
}

// ===== ステージ更新 =====
function updateStage() {
  S.t++; S.pt++;
  if (S.shake > 0) S.shake *= 0.9, S.shake < 0.3 && (S.shake = 0);
  if (S.flash > 0) S.flash--;
  if (S.weaponFlash > 0) S.weaponFlash--;
  if ((S.phase === 'play' || S.phase === 'boss') && !P.dead && Input.pressed.start) { SFX.pause(); G.menu = Math.max(0, G.weapons().indexOf(P.weapon)); go('pause'); G.prev = 'stage'; return; }

  switch (S.phase) {
    case 'ready':
      if (S.pt > 80) { S.phase = 'warp'; S.pt = 0; }
      break;
    case 'warp':
      P.warpY += 8;
      if (P.warpY >= P.y + P.h) { P.warp = 'done'; P.landT = 8; SFX.warpIn(); S.phase = 'play'; Music.play(stageSong(S.id)); }
      break;
    case 'door': {
      const k = S.pt;
      if (k === 1) { SFX.door(); }
      if (k <= 20) S.doorOpen = k / 20;
      if (k === 20) for (let r = ROWS - 5; r < ROWS - 2; r++) setT(S.doorCol, r, T.E);
      if (k > 20 && k <= 80) { P.auto = 1; S.camX = lerp(S.camStart, S.roomX, (k - 20) / 60); }
      if (k > 80) { P.auto = 0; P.vx = 0; }
      if (k === 82) SFX.door();
      if (k > 80 && k <= 100) S.doorOpen = 1 - (k - 80) / 20;
      if (k === 100) { for (let r = ROWS - 5; r < ROWS - 2; r++) setT(S.doorCol, r, T.DOOR); S.doorOpen = 0; startBoss(); }
      break;
    }
    case 'rushNext':
      if (S.pt === 60 && S.rush.list[S.rush.i] === 'nox2') { S.msg = { text: 'ドクター・ノクス「まだだ…！ ノクスコアの ちからを みせてやる！」', t: 150 }; }
      if (S.pt > (S.rush.list[S.rush.i] === 'nox2' ? 220 : 120)) startBoss();
      break;
    case 'victory':
      if (S.pt === 70) Music.play(J.victory());
      if (S.pt === 260) { P.warp = 'out'; P.warpY = P.y + P.h; SFX.warp(); }
      if (P.warp === 'out') P.warpY -= 8;
      if (S.pt > 300) finishStage();
      break;
  }

  updateMovers();
  if (S.phase !== 'ready' && S.phase !== 'warp' && P.warp !== 'out') updatePlayer();
  if (S.phase === 'play') {
    for (const s of S.spawns) {
      const inV = s.x > S.camX - 8 && s.x < S.camX + W + 8;
      if (!inV) { s.out = true; if (s.state === 'dead') s.state = 'idle'; continue; }
      if (s.state === 'idle' && s.out) { spawnEnemy(s); s.state = 'alive'; s.out = false; }
    }
    for (const it of S.placed) {
      if (it.got || it.alive) continue;
      if (it.x > S.camX - 8 && it.x < S.camX + W + 8) { it.alive = true; addItem(it.type, it.x, it.y, -1, it); }
    }
    for (const c of S.checks) if (cx(P) > c.x && (!S.check || S.check.x < c.x)) S.check = c;
    if (S.doorCol > 0 && P.x + P.w >= S.doorCol * TS - 1 && P.y + P.h > (ROWS - 5) * TS && !P.dead) {
      S.phase = 'door'; S.pt = 0; S.camStart = S.camX; endSlide(); P.ladder = false; P.charge = 0; P.leaves = null;
      S.enemies = []; S.eb = [];
    }
  }
  updateEnemies(); updatePB(); collidePB(); updateEB(); updateItems(); updateHazards();
  if (S.boss) updateBoss(S.boss);
  updateParts();
  if (S.msg && --S.msg.t <= 0) S.msg = null;
  // カメラ
  if (S.phase === 'play') S.camX = clamp(cx(P) - W / 2, 0, (S.doorCol + 1) * TS - W);
  else if (S.phase !== 'door' && S.phase !== 'ready' && S.phase !== 'warp') S.camX = S.roomX;
  // ミス
  if (P.dead && P.deadT > 150) {
    G.lives--;
    if (G.lives < 0) { Music.play(J.over()); go('gameover'); }
    else startStage(S.id, S.check, true);
  }
}
function startBoss() {
  const id = S.def.boss === 'rush' ? null : S.def.boss;
  if (S.def.boss === 'rush') {
    if (!S.rush) S.rush = { i: 0, list: [...ALL8, 'nox1', 'nox2'] };
    const bid = S.rush.list[S.rush.i];
    S.boss = makeBoss(bid, bid.startsWith('nox') ? 28 : 18);
  } else S.boss = makeBoss(id, id === 'guard' ? 20 : 28);
  S.phase = 'bossIntro';
  const fin = S.rush && S.rush.list[S.rush.i].startsWith('nox');
  Music.play(fin ? SONGS.final : SONGS.boss);
}
function finishStage() {
  const id = S.def.boss, s = G.save;
  if (id === 'guard') s.intro = true;
  else if (id === 'drone') s.mid = true;
  else if (id === 'rush') { s.cleared = true; writeSave(); Music.play(SONGS.ending); go('ending'); return; }
  else {
    const first = !s.beaten[id];
    s.beaten[id] = true; s.got[BOSSES[id].weapon] = true;
    writeSave();
    G.gotWeapon = BOSSES[id].weapon; G.firstGet = first;
    Music.play(J.weapon()); go('weaponget'); return;
  }
  writeSave();
  toSelect();
}
function toSelect() {
  Music.play(SONGS.select); go('select');
  G.cursor = 'C';
}

// ===== 描画（ステージ） =====
function drawStage() {
  const sh = S.shake > 0 ? (Math.random() - 0.5) * S.shake : 0, sv = S.shake > 0 ? (Math.random() - 0.5) * S.shake * 0.6 : 0;
  ctx.setTransform(SC, 0, 0, SC, 0, 0);
  drawBG();
  const camX = Math.round(S.camX * SC) / SC;
  ctx.setTransform(SC, 0, 0, SC, (-camX + sh) * SC, sv * SC);
  ctx.drawImage(S.layer, camX * SC, 0, W * SC, H * SC, camX, 0, W, H);
  drawDynTiles(); drawHazards(); drawMovers();
  for (const it of S.items) drawItem(it);
  for (const e of S.enemies) drawEnemy(e);
  if (S.boss) drawBoss(S.boss);
  drawPlayer();
  for (const b of S.pb) drawPB(b);
  for (const b of S.eb) drawEB(b);
  drawParts();
  if (S.th.water) { ctx.fillStyle = 'rgba(40,120,220,.10)'; ctx.fillRect(camX, 0, W, H); }
  ctx.setTransform(SC, 0, 0, SC, 0, 0);
  if (S.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${S.flash / 50})`; ctx.fillRect(0, 0, W, H); }
  if (S.phase !== 'ready' && P.warp === 'done' || S.phase === 'victory') drawHUD();
  if (S.phase === 'ready' && S.pt % 16 < 10) TXT('READY', W / 2, H / 2 - 8, 16, '#fff', 'center');
  if (S.phase === 'ready' && S.pt < 60) TXT(S.def.name, W / 2, H / 2 + 14, 9, '#ffe080', 'center');
  if (S.msg) { RR(16, H - 46, W - 32, 30, 4, 'rgba(10,0,20,.85)', '#ff2a5a', 1); wrapText(S.msg.text, 24, H - 41, W - 48, 9, '#fff'); }
}
function wrapText(s, x, y, w, size, c, lh = 1.45, align = 'left') {
  ctx.font = `${size}px ${FONT}`;
  let line = '', yy = y;
  const lines = [];
  for (const ch of s) {
    if (ch === '\n') { lines.push(line); line = ''; continue; }
    if (ctx.measureText(line + ch).width > w) { lines.push(line); line = ch; } else line += ch;
  }
  lines.push(line);
  for (const l of lines) { TXT(l, align === 'center' ? x + w / 2 : x, yy, size, c, align); yy += size * lh; }
  return yy;
}

// ===== タイトル =====
const STORY = [
  'せいれき 2190ねん。\nロボットと にんげんが ともに くらす\nかいじょうとし リュミエール。',
  'あるよる、そらから くろい いんせきが おちてきた。\nなかに ねむっていたのは なぞの エネルギー\n「ノクスコア」。',
  'それを てにした かがくしゃ ドクター・ノクスは\nまちの さぎょうロボット 8たいを かいぞうし\n「ギア」として はんらんを おこした！',
  'アルトはかせが うみだした せんとうロボット リオ。\nいま、まちを まもる たたかいが はじまる！',
];
function bgStars(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#05041a'); g.addColorStop(0.6, '#1a1050'); g.addColorStop(1, '#4a2060');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = mulberry(5);
  for (let i = 0; i < 70; i++) { const x = (r() * W - t * (0.1 + r() * 0.4)) % W, y = r() * H * 0.8; R((x + W) % W, y, 1, 1, r() > 0.8 ? '#ffe8a0' : '#cfd8ff'); }
  for (let i = 0; i < 9; i++) { const x = (i * 40 - t * 0.2) % (W + 40); R((x + W + 40) % (W + 40) - 40, H - 40 - (i * 37) % 50, 30, 100, '#120c30'); }
}
function updateTitle() {
  G.st++;
  const items = G.hasSave ? ['つづきから', 'はじめから'] : ['はじめから'];
  if (Input.pressed.up || Input.pressed.down) { G.menu = (G.menu + 1) % items.length; SFX.menu(); }
  if (Input.pressed.jump || Input.pressed.start || Input.pressed.shoot) {
    SFX.select();
    if (items[G.menu] === 'はじめから') { G.save = defSave(); G.lives = 3; go('story'); Music.play(SONGS.title); }
    else { G.save = loadSave() || defSave(); G.lives = Math.max(2, G.save.lives || 3); if (G.save.intro) toSelect(); else startStage('intro'); }
  }
}
function drawTitle() {
  ctx.setTransform(SC, 0, 0, SC, 0, 0);
  bgStars(G.st);
  // 黒い隕石
  const mx = 250, my = 50 + Math.sin(G.st * 0.03) * 3;
  for (let i = 1; i < 6; i++) CIR(mx + i * 7, my - i * 5, 9 - i, `rgba(200,64,255,${0.4 - i * 0.06})`, null);
  CIR(mx, my, 11, '#1a0a24', '#c040ff', 1.2); CIR(mx - 3, my - 2, 3, '#c040ff', null);
  // ロゴ
  ctx.save();
  ctx.translate(W / 2, 64);
  ctx.font = `bold 34px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 6; ctx.strokeStyle = '#0a0a20'; ctx.strokeText('BLASTER RIO', 0, 0);
  const g = ctx.createLinearGradient(0, -16, 0, 16); g.addColorStop(0, '#fff'); g.addColorStop(0.45, '#7ff0ff'); g.addColorStop(0.55, '#22b8c8'); g.addColorStop(1, '#0a5a8a');
  ctx.fillStyle = g; ctx.fillText('BLASTER RIO', 0, 0);
  ctx.restore();
  TXT('ブラスター・リオ 〜8つのギアと くろいいんせき〜', W / 2, 88, 9, '#ffd040', 'center');
  drawHero(78, 200, 1, 'stand', G.st, WEAPONS[0], true, 2.6);
  if ((G.st >> 4) % 2) { R(110, 150, 6, 4, '#fff7a0'); }
  const items = G.hasSave ? ['つづきから', 'はじめから'] : ['はじめから'];
  items.forEach((s, i) => {
    const sel = i === G.menu, y = 140 + i * 18;
    if (sel) { POLY([186, y + 1, 192, y + 5, 186, y + 9], '#ffe040'); }
    TXT(s, 198, y, 11, sel ? '#fff' : '#8a8ab0');
  });
  ['Z・スペース：ジャンプ', 'X：ショット（おしっぱなしで ためうち）', 'C（↓＋ジャンプ）：スライディング', 'A・S：ぶき きりかえ  Enter：ポーズ', 'M：おと ON/OFF'].forEach((s, i) => TXT(s, 176, 176 + i * 10, 7, '#bfc8ff'));
  
}
function updateStory() {
  G.st++;
  if (Input.pressed.start) { startStage('intro'); return; }
  if (Input.pressed.jump || Input.pressed.shoot) {
    const full = STORY[G.menu].length * 2;
    if (G.st < full) G.st = full; else { G.menu++; G.st = 0; SFX.menu(); if (G.menu >= STORY.length) startStage('intro'); }
  }
}
function drawStory() {
  ctx.setTransform(SC, 0, 0, SC, 0, 0);
  bgStars(G.t);
  const i = Math.min(G.menu, STORY.length - 1);
  // 場面のイラスト
  ctx.save(); ctx.beginPath(); ctx.rect(40, 20, 240, 110); ctx.clip();
  R(40, 20, 240, 110, '#0a0c2a');
  if (i === 0) { for (let k = 0; k < 10; k++) R(50 + k * 24, 130 - 30 - (k * 37) % 60, 18, 100, '#1c2250'); R(40, 110, 240, 20, '#0a3a6a'); for (let k = 0; k < 20; k++) R(40 + k * 12, 112 + (k % 2) * 4, 8, 1, '#3a8ad0'); }
  if (i === 1) { const k = G.st; CIR(160 + 60 - k * 0.5, 30 + k * 0.4, 10, '#1a0a24', '#c040ff', 1.5); for (let n = 1; n < 6; n++) CIR(160 + 60 - k * 0.5 + n * 8, 30 + k * 0.4 - n * 6, 8 - n, `rgba(200,64,255,${0.5 - n * 0.08})`, null); }
  if (i === 2) {
    // ドクター・ノクス（シルエット）
    R(40, 20, 240, 110, '#1a0414');
    CIR(160, 60, 16, '#2a1030', null); RR(130, 74, 60, 60, 12, '#2a1030', null); R(146, 56, 28, 6, '#000'); R(149, 57, 8, 4, '#ff3050'); R(163, 57, 8, 4, '#ff3050');
    for (let k = 0; k < 8; k++) CIR(60 + k * 28, 120, 6, BOSSES[ALL8[k]].a, null);
  }
  if (i === 3) { drawHero(160, 122, 1, 'stand', G.t, WEAPONS[0], false, 3); }
  ctx.restore();
  RR(40, 20, 240, 110, 4, 'rgba(0,0,0,0)', '#7ff0ff', 1.2);
  const s = STORY[i].slice(0, Math.floor(G.st / 2));
  wrapText(s, 36, 146, 252, 10, '#fff', 1.6);
  if (G.st > STORY[i].length * 2 && G.t % 30 < 20) POLY([290, 214, 298, 214, 294, 220], '#fff');
  TXT('Enter: スキップ', W - 8, 228, 7, '#8a8ab0', 'right');
}

// ===== ステージセレクト =====
const SEL_POS = { TL: [70, 52], TR: [250, 52], BL: [70, 148], BR: [250, 148], C: [160, 100], SHOP: [160, 196] };
const SEL_NAV = {
  TL: { right: 'TR', down: 'BL' }, TR: { left: 'TL', down: 'BR' },
  BL: { up: 'TL', right: 'BR', down: 'SHOP' }, BR: { up: 'TR', left: 'BL', down: 'SHOP' },
  C: { up: 'TL', left: 'BL', right: 'BR', down: 'SHOP' }, SHOP: { up: 'C', left: 'BL', right: 'BR' },
};
function selBosses() { return G.save.mid ? SECOND4 : FIRST4; }
function specialStage() {
  const s = G.save;
  if (!s.mid && FIRST4.every(b => s.beaten[b])) return 'mid';
  if (s.mid && ALL8.every(b => s.beaten[b])) return 'final';
  return null;
}
function updateSelect() {
  G.st++;
  for (const d of ['up', 'down', 'left', 'right']) if (Input.pressed[d] && SEL_NAV[G.cursor][d]) { G.cursor = SEL_NAV[G.cursor][d]; SFX.menu(); }
  if (Input.pressed.jump || Input.pressed.start || Input.pressed.shoot) {
    const list = selBosses(), k = G.cursor;
    if (k === 'SHOP') { SFX.select(); Music.play(SONGS.shop); go('shop'); return; }
    if (k === 'C') {
      const sp = specialStage();
      if (sp) { SFX.select(); Music.stop(); startStage(sp); } else SFX.deny();
      return;
    }
    const id = list[['TL', 'TR', 'BL', 'BR'].indexOf(k)];
    SFX.select(); Music.stop(); G.introBoss = id; go('bossintro');
  }
}
function portrait(id, x, y, sel, done) {
  const d = BOSSES[id];
  RR(x - 34, y - 30, 68, 60, 4, sel ? '#ffe040' : '#3a3a6a', OUT, 1);
  RR(x - 31, y - 27, 62, 54, 3, done ? '#1a1a22' : '#0c1030', null);
  ctx.save(); ctx.beginPath(); ctx.rect(x - 31, y - 27, 62, 54); ctx.clip();
  for (let i = 0; i < 5; i++) R(x - 31, y - 27 + i * 12 + (G.st * 0.3) % 12, 62, 2, done ? '#22222a' : '#14204a');
  ctx.translate(x, y + 54); ctx.scale(2, 2);
  if (done) ctx.globalAlpha = 0.45;
  drawGear(d, 0, 0, -1, sel && G.st % 40 < 20 ? 'up' : 'stand', G.st, null);
  ctx.restore();
  TXT(d.en, x, y + 33, 7.5, sel ? '#fff' : '#aab', 'center');
  if (done) TXT('CLEAR', x, y - 6, 10, '#ff5a5a', 'center');
}
function drawSelect() {
  ctx.setTransform(SC, 0, 0, SC, 0, 0);
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0a1a40'); g.addColorStop(1, '#2a0a3a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) R(0, (i * 24 + G.st * 0.5) % H, W, 1, '#ffffff10');
  TXT('STAGE SELECT', W / 2, 6, 11, '#7ff0ff', 'center');
  const list = selBosses();
  ['TL', 'TR', 'BL', 'BR'].forEach((k, i) => portrait(list[i], SEL_POS[k][0], SEL_POS[k][1], G.cursor === k, G.save.beaten[list[i]]));
  // 中央
  const sp = specialStage(), [x, y] = SEL_POS.C, sel = G.cursor === 'C';
  RR(x - 30, y - 26, 60, 52, 4, sel ? '#ffe040' : sp && G.st % 30 < 15 ? '#ff4080' : '#3a3a6a', OUT, 1);
  RR(x - 27, y - 23, 54, 46, 3, '#0c1030', null);
  ctx.save(); ctx.beginPath(); ctx.rect(x - 27, y - 23, 54, 46); ctx.clip();
  if (sp) {
    CIR(x, y, 14, '#1a0a24', '#c040ff', 1.5); CIR(x - 4, y - 3, 4, '#c040ff', null);
    TXT(sp === 'mid' ? 'CRATER' : 'FORTRESS', x, y + 12, 7, '#ff80c0', 'center');
  } else drawHero(x, y + 26, 1, 'stand', G.st, WEAPONS[0], false, 1.6);
  ctx.restore();
  // ショップ
  const [sx, sy] = SEL_POS.SHOP, ss = G.cursor === 'SHOP';
  RR(sx - 40, sy - 9, 80, 18, 4, ss ? '#ffe040' : '#3a3a6a', OUT, 1);
  TXT('ラボ（ショップ）', sx, sy - 5, 9, ss ? '#20203a' : '#fff', 'center', null);
  // 情報
  const k = G.cursor;
  let info = '';
  if (k === 'SHOP') info = 'ミルカの ラボ。ボルトで パーツを かえるよ。';
  else if (k === 'C') info = sp ? (sp === 'mid' ? 'くろい いんせきの おちた クレーターへ！' : 'ドクター・ノクスの ようさいへ！') : 'のこりの ギアを たおそう。';
  else { const d = BOSSES[list[['TL', 'TR', 'BL', 'BR'].indexOf(k)]]; info = d.name + ' ／ ' + STAGES[d.stage].name; }
  TXT(info, W / 2, 222, 8, '#ffe8a0', 'center');
  TXT('ボルト ' + G.save.bolts, 8, 6, 8, '#ffcc30');
  TXT('のこり ×' + G.lives, W - 8, 6, 8, '#fff', 'right');
}

// ===== ボス紹介 =====
function updateBossIntro() {
  G.st++;
  if (G.st === 2) Music.play(jingle([[60, 2], [63, 2], [67, 2], [72, 2], [70, 2], [67, 2], [75, 6]], 150));
  if (G.st > 170 || (G.st > 30 && (Input.pressed.jump || Input.pressed.start))) startStage(BOSSES[G.introBoss].stage);
}
function drawBossIntro() {
  ctx.setTransform(SC, 0, 0, SC, 0, 0);
  const d = BOSSES[G.introBoss];
  R(0, 0, W, H, '#05061a');
  for (let i = 0; i < 20; i++) { const y = (i * 37) % H, x = (i * 97 - G.st * (3 + i % 3) * 2) % (W + 60); R((x + W + 60) % (W + 60) - 60, y, 40, 1, '#4a6aff55'); }
  R(0, 70, W, 100, d.c);
  R(0, 70, W, 2, d.b); R(0, 168, W, 2, d.b);
  const by = Math.min(150, -40 + G.st * 6);
  ctx.save(); ctx.translate(110, by); ctx.scale(2.2, 2.2);
  drawGear(d, 0, 0, 1, G.st > 40 && G.st < 90 ? 'up' : 'stand', G.st, null);
  ctx.restore();
  const n = Math.floor(Math.max(0, G.st - 40) / 3);
  TXT(d.en.slice(0, n), 170, 96, 14, '#fff');
  if (G.st > 80) TXT(d.name, 170, 118, 10, d.b);
  if (G.st > 100) TXT('「' + d.line + '」', 170, 140, 8, '#ddd');
}

// ===== ポーズ =====
function pauseItems() {
  const l = G.weapons().map(i => ({ k: 'w', i }));
  l.push({ k: 'etank' }, { k: 'wtank' }, { k: 'exit' });
  return l;
}
function updatePause() {
  G.st++;
  const items = pauseItems();
  if (Input.pressed.up) { G.menu = (G.menu - 1 + items.length) % items.length; SFX.menu(); }
  if (Input.pressed.down) { G.menu = (G.menu + 1) % items.length; SFX.menu(); }
  if (Input.pressed.start) { SFX.pause(); go('stage'); return; }
  if (Input.pressed.jump || Input.pressed.shoot) {
    const it = items[G.menu], up = G.save.up;
    if (it.k === 'w') { setWeapon(it.i); go('stage'); SFX.select(); }
    else if (it.k === 'etank') { if ((up.etank || 0) > 0 && P.hp < 28) { up.etank--; P.hpQueue = 28; SFX.oneup(); writeSave(); } else SFX.deny(); }
    else if (it.k === 'wtank') { if ((up.wtank || 0) > 0) { up.wtank--; for (let i = 1; i < 9; i++) G.energy[i] = 28; SFX.oneup(); writeSave(); } else SFX.deny(); }
    else if (it.k === 'exit') { if (S.phase === 'boss' && S.rush) { SFX.deny(); return; } writeSave(); toSelect(); }
  }
}
function drawPause() {
  drawStage();
  ctx.setTransform(SC, 0, 0, SC, 0, 0);
  ctx.fillStyle = 'rgba(0,0,20,.72)'; ctx.fillRect(0, 0, W, H);
  RR(40, 8, 240, 226, 6, '#0e1438', '#7ff0ff', 1.2);
  TXT('PAUSE', W / 2, 12, 10, '#7ff0ff', 'center');
  const items = pauseItems();
  let y = 28;
  items.forEach((it, i) => {
    const sel = i === G.menu;
    if (sel) R(48, y - 2, 224, 13, '#2a3a7a');
    if (it.k === 'w') {
      const w = WEAPONS[it.i];
      CIR(58, y + 5, 4.5, w.a, OUT); CIR(58, y + 5, 2, w.b, null);
      TXT(w.name, 68, y, 9, sel ? '#fff' : '#aab');
      if (it.i) { R(170, y + 2, 90, 6, '#1a1a2a'); R(171, y + 3, 88 * G.energy[it.i] / 28, 4, w.a); }
      else TXT('∞', 210, y, 9, '#aab');
    } else if (it.k === 'etank') TXT('Eカン ×' + (G.save.up.etank || 0) + '  （ライフ かいふく）', 68, y, 9, sel ? '#fff' : '#aab');
    else if (it.k === 'wtank') TXT('Wカン ×' + (G.save.up.wtank || 0) + '  （ぶき かいふく）', 68, y, 9, sel ? '#fff' : '#aab');
    else TXT('ステージを ぬける', 68, y, 9, sel ? '#ff9a9a' : '#a88');
    y += 14;
  });
  const it = items[G.menu];
  R(48, 205, 224, 1, '#3a4a8a');
  if (it && it.k === 'w') wrapText(WEAPONS[it.i].desc, 52, 210, 216, 8, '#ffe8a0');
  else TXT('ジャンプ: けってい ／ Enter: もどる', W / 2, 212, 8, '#8a9ac8', 'center');
}

// ===== ショップ =====
function updateShop() {
  G.st++;
  const n = SHOP.length + 1;
  if (Input.pressed.up) { G.menu = (G.menu - 1 + n) % n; SFX.menu(); }
  if (Input.pressed.down) { G.menu = (G.menu + 1) % n; SFX.menu(); }
  if (Input.pressed.start || (Input.pressed.jump && G.menu === SHOP.length)) { writeSave(); toSelect(); return; }
  if (Input.pressed.jump || Input.pressed.shoot) {
    const it = SHOP[G.menu]; if (!it) return;
    const s = G.save, own = it.id === 'life' ? G.lives : (s.up[it.id] || 0);
    if (s.bolts >= it.price && own < it.max) {
      s.bolts -= it.price;
      if (it.id === 'life') G.lives++; else s.up[it.id] = own + 1;
      SFX.buy(); G.shopMsg = { t: 90, text: 'まいどあり！' }; writeSave();
    } else { SFX.deny(); G.shopMsg = { t: 90, text: own >= it.max ? 'それは もう いっぱい だよ。' : 'ボルトが たりないみたい…。' }; }
  }
  if (G.shopMsg && --G.shopMsg.t <= 0) G.shopMsg = null;
}
function drawMilka(x, y, t) {
  // ミルカ（サポートロボット）
  const bob = Math.sin(t * 0.06) * 1.5;
  ctx.save(); ctx.translate(x, y + bob);
  RR(-12, -20, 24, 22, 8, '#ffb0c8'); RR(-8, -16, 16, 10, 4, '#fff');
  CIR(-10, -2, 3, '#ff80a8'); CIR(10, -2, 3, '#ff80a8');
  CIR(0, -34, 13, '#ffe8f0'); RR(-9, -38, 18, 10, 4, '#3a2a5a');
  const blink = t % 150 < 5;
  if (blink) { R(-6, -34, 4, 1, '#7ff0ff'); R(2, -34, 4, 1, '#7ff0ff'); } else { RR(-6, -36, 4, 5, 1.5, '#7ff0ff', null); RR(2, -36, 4, 5, 1.5, '#7ff0ff', null); }
  R(-1, -48, 2, 6, '#c8c8d8'); CIR(0, -49, 2.5, t % 40 < 20 ? '#ff5a8a' : '#ffe040', null);
  CIR(-13, -34, 4, '#ff80a8'); CIR(13, -34, 4, '#ff80a8');
  ctx.restore();
}
function drawShop() {
  ctx.setTransform(SC, 0, 0, SC, 0, 0);
  R(0, 0, W, H, '#1a2240');
  for (let i = 0; i < 8; i++) R(i * 44, 0, 2, 120, '#22305a');
  R(0, 118, W, 4, '#3a4a7a'); R(0, 122, W, H, '#141a30');
  drawMilka(52, 112, G.st);
  RR(84, 16, 220, 34, 6, '#fff', '#ffb0c8', 1.2);
  wrapText(G.shopMsg ? G.shopMsg.text : (SHOP[G.menu] ? SHOP[G.menu].desc : 'また きてね！'), 92, 22, 204, 8.5, '#3a2a5a');
  RR(84, 70, 230, 162, 5, 'rgba(10,14,40,.92)', '#3a4a7a', 1);
  TXT('ボルト ' + G.save.bolts, W - 10, 56, 9, '#ffcc30', 'right');
  let y = 76;
  SHOP.forEach((it, i) => {
    const sel = i === G.menu, own = it.id === 'life' ? G.lives : (G.save.up[it.id] || 0), full = own >= it.max;
    if (sel) R(84, y - 2, 226, 14, '#2a3a7a');
    TXT(it.name, 92, y, 9, full ? '#666' : sel ? '#fff' : '#bcd');
    TXT(it.max > 1 ? '×' + own : (own ? 'もっている' : ''), 220, y, 8, '#9ab');
    TXT(it.price + 'B', 304, y, 9, G.save.bolts >= it.price ? '#ffcc30' : '#7a6a4a', 'right');
    y += 15;
  });
  const sel = G.menu === SHOP.length;
  if (sel) R(84, y - 2, 226, 14, '#2a3a7a');
  TXT('もどる', 92, y, 9, sel ? '#fff' : '#bcd');
}

// ===== ぶきゲット =====
function updateWeaponGet() {
  G.st++;
  if (G.st > 90 && (Input.pressed.jump || Input.pressed.start || Input.pressed.shoot)) toSelect();
}
function drawWeaponGet() {
  ctx.setTransform(SC, 0, 0, SC, 0, 0);
  const w = WEAPONS[G.gotWeapon];
  R(0, 0, W, H, '#05061a');
  for (let i = 0; i < 14; i++) { const a = i * Math.PI / 7 + G.st * 0.005; ctx.fillStyle = i % 2 ? shade(w.a, -0.7) : '#05061a'; ctx.beginPath(); ctx.moveTo(90, 130); ctx.arc(90, 130, 300, a, a + Math.PI / 7); ctx.fill(); }
  const pal = G.st % 8 < 4 && G.st < 60 ? WEAPONS[0] : w;
  drawHero(90, 170, 1, G.st > 60 && G.st % 60 < 20 ? 'stand' : 'stand', G.st, pal, G.st > 60 && G.st % 60 < 20, 2.4);
  TXT('WEAPON GET!', 214, 60, 14, '#fff', 'center');
  TXT(w.en, 214, 88, 11, w.b, 'center');
  TXT(w.name, 214, 106, 12, w.a, 'center');
  wrapText(w.desc, 150, 132, 130, 8.5, '#ddd', 1.6);
  if (G.st > 90 && G.st % 40 < 28) TXT('PRESS BUTTON', 214, 200, 8, '#8a8ab0', 'center');
}

// ===== ゲームオーバー・エンディング =====
function updateGameOver() {
  G.st++;
  if (Input.pressed.up || Input.pressed.down) { G.menu = 1 - G.menu; SFX.menu(); }
  if (G.st > 40 && (Input.pressed.jump || Input.pressed.start || Input.pressed.shoot)) {
    SFX.select(); G.lives = 3; writeSave();
    if (G.menu === 0) { if (G.save.intro) toSelect(); else startStage('intro'); }
    else { G.hasSave = true; go('title'); Music.play(SONGS.title); }
  }
}
function drawGameOver() {
  ctx.setTransform(SC, 0, 0, SC, 0, 0);
  R(0, 0, W, H, '#000');
  TXT('GAME OVER', W / 2, 80, 20, '#ff4060', 'center');
  ['つづける', 'タイトルへ'].forEach((s, i) => { const sel = i === G.menu; if (sel) POLY([120, 133 + i * 20, 126, 137 + i * 20, 120, 141 + i * 20], '#ffe040'); TXT(s, 132, 132 + i * 20, 11, sel ? '#fff' : '#888'); });
}
const ENDING = [
  'ノクスコアは こなごなに くだけ、\nドクター・ノクスは すがたを けした。',
  'ギアたちは もとの さぎょうロボットに もどり、\nまちの ふっこうを てつだっている。',
  'リュミエールの そらに、ふたたび あさひが のぼる。',
  'リオの たたかいは おわった。\n…いまは まだ。',
  'BLASTER RIO\n\nTHANK YOU FOR PLAYING!',
];
function updateEnding() {
  G.st++;
  if (G.st > 60 && (Input.pressed.jump || Input.pressed.start || Input.pressed.shoot)) {
    G.menu++; G.st = 0;
    if (G.menu >= ENDING.length) { G.hasSave = true; go('title'); Music.play(SONGS.title); }
  }
}
function drawEnding() {
  ctx.setTransform(SC, 0, 0, SC, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a3a8a'); g.addColorStop(0.6, '#ff9a6a'); g.addColorStop(1, '#ffd890');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  CIR(220, 150 - Math.min(40, G.t * 0.05), 26, '#fff4c0', null);
  for (let i = 0; i < 12; i++) R(i * 28, 150 - (i * 37) % 50, 20, 100, '#5a3a6a');
  POLY([0, 190, 80, 168, 160, 176, 240, 162, 320, 174, 320, 240, 0, 240], '#2a1a3a', null);
  drawHero(120, 176, 1, 'stand', G.t, WEAPONS[0], false, 1.6);
  drawMilka(150, 178, G.t);
  RR(20, 196, 280, 40, 5, 'rgba(10,10,30,.75)', null);
  wrapText(ENDING[Math.min(G.menu, ENDING.length - 1)], 20, 200, 280, 9, '#fff', 1.4, 'center');
}

// ===== メインループ =====
const UPD = { title: updateTitle, story: updateStory, select: updateSelect, bossintro: updateBossIntro, stage: updateStage, pause: updatePause, shop: updateShop, weaponget: updateWeaponGet, gameover: updateGameOver, ending: updateEnding };
const DRW = { title: drawTitle, story: drawStory, select: drawSelect, bossintro: drawBossIntro, stage: drawStage, pause: drawPause, shop: drawShop, weaponget: drawWeaponGet, gameover: drawGameOver, ending: drawEnding };
let last = performance.now(), acc = 0;
function frame(now) {
  acc += Math.min(100, now - last); last = now;
  const step = 1000 / 60;
  while (acc >= step) {
    pollPad();
    if (Input.pressed.mute) Sound.toggleMute();
    G.t++;
    try { UPD[G.state](); } catch (e) { console.error(e); window.__err = String(e.stack || e); }
    Input.end();
    acc -= step;
  }
  ctx.setTransform(SC, 0, 0, SC, 0, 0);
  try { DRW[G.state](); } catch (e) { console.error(e); window.__err = String(e.stack || e); }
  requestAnimationFrame(frame);
}
function boot() {
  setupTouch();
  if (DEBUG) {
    const st = QS.get('stage');
    if (QS.has('all')) { for (let i = 1; i <= 8; i++) G.save.got[i] = true; G.save.bolts = 999; }
    if (QS.has('mid')) { G.save.intro = true; G.save.mid = true; }
    if (QS.has('beat')) { G.save.intro = true; for (const b of (QS.get('beat') === '8' ? ALL8 : FIRST4)) G.save.beaten[b] = true; }
    if (st) startStage(st);
    else if (QS.has('select')) { G.save.intro = true; toSelect(); }
  }
  requestAnimationFrame(frame);
}
window.__G = G;
const fontReady = document.fonts && document.fonts.load ? document.fonts.load('10px "DotGothic16"').catch(() => {}) : Promise.resolve();
Promise.race([fontReady, new Promise(r => setTimeout(r, 1500))]).then(boot);
