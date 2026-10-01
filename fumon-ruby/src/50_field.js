// ================================================================ overworld engine
const G = {
  party: [], box: [], bag: {}, money: 3000, badges: [], flags: {}, seen: {}, caught: {},
  repel: 0, center: { map: 'home1', x: 5, y: 5 }, time: 0, steps: 0,
};
const flag = k => !!G.flags[k];
const setFlag = (k, v = true) => { G.flags[k] = v; };
const DIRS = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
const OPP = { U: 'D', D: 'U', L: 'R', R: 'L' };
const F = { map: null, id: '', ents: [], pl: null, lock: 0, weather: null, emotes: [], shake: 0, tint: null };
let MAPS = {};

function mkEnt(o) {
  return Object.assign({ x: 0, y: 0, dir: 'D', moving: false, prog: 0, fr: 0, spd: 1, hop: 0, vis: true, solid: true }, o, { px: o.x * TS, py: o.y * TS });
}
function loadMap(id, x, y, dir) {
  const def = MAPS[id];
  if (!def) throw new Error('no map ' + id);
  const grid = def.grid.map(r => r.split(''));
  const m = { id, def, grid, w: grid[0].length, h: grid.length, solid: [], builds: [], doors: {} };
  for (let yy = 0; yy < m.h; yy++) m.solid.push(new Uint8Array(m.w));
  for (const b of (def.builds || [])) {
    if (b.if && !b.if()) continue;
    const B = BUILD[b.k]; m.builds.push(Object.assign({ B }, b));
    for (let j = 0; j < B.h; j++) for (let i = 0; i < B.w; i++) {
      const tx = b.x + i, ty = b.y + j; if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) continue;
      if (B.doorDx >= 0 && i === B.doorDx && j === B.h - 1) { m.doors[tx + ',' + ty] = b; continue; }
      m.solid[ty][tx] = 1;
    }
  }
  F.map = m; F.id = id;
  F.ents = [];
  for (const n of (def.npcs || [])) {
    if (n.if && !n.if()) continue;
    F.ents.push(mkEnt(Object.assign({ home: [n.x, n.y] }, n)));
  }
  for (const it of (def.items || [])) {
    if (flag('item_' + id + '_' + it.x + '_' + it.y)) continue;
    F.ents.push(mkEnt({ x: it.x, y: it.y, ball: true, item: it.item, n: it.n || 1, flagK: 'item_' + id + '_' + it.x + '_' + it.y }));
  }
  F.pl = F.pl || mkEnt({ ch: 'futan', id: 'player' });
  Object.assign(F.pl, { x, y, px: x * TS, py: y * TS, moving: false, prog: 0, hop: 0, dir: dir || F.pl.dir });
  F.weather = def.weather || null;
  AU.bgm(mapBgm());
  if (def.out) G.lastOut = { map: id, x, y };
  F.mapTitle = def.name && def.out ? { t: def.name, f: 150 } : null;
}
function mapBgm() { const d = F.map && F.map.def; if (!d) return null; return typeof d.bgm === 'function' ? d.bgm() : d.bgm; }
const tileCh = (x, y) => { const m = F.map; if (x < 0 || y < 0 || x >= m.w || y >= m.h) return m.def.border || 'x'; return m.grid[y][x]; };
const tileDef = (x, y) => tileAt(tileCh(x, y));
function entAt(x, y, except) { return F.ents.find(e => e !== except && e.vis && e.solid && ((e.x === x && e.y === y) || (e.moving && e.tx === x && e.ty === y))); }
function blocked(x, y, ent) {
  const m = F.map;
  if (x < 0 || y < 0 || x >= m.w || y >= m.h) return true;
  if (m.solid[y][x]) return true;
  const t = tileDef(x, y); if (t.solid) return true;
  if (t.ledge) return true;
  if (entAt(x, y, ent)) return true;
  if (ent !== F.pl && F.pl.x === x && F.pl.y === y) return true;
  if (ent !== F.pl && F.pl.moving && F.pl.tx === x && F.pl.ty === y) return true;
  return false;
}
function startMove(e, dir, speed = 1) {
  e.dir = dir; const [dx, dy] = DIRS[dir];
  e.tx = e.x + dx; e.ty = e.y + dy; e.moving = true; e.prog = 0; e.spd = speed;
  e.stepN = (e.stepN || 0) + 1;
}
function updEnt(e) {
  if (!e.moving) { e.fr = 0; return false; }
  e.prog += e.spd;
  const len = e.hop ? 32 : 16;
  const [dx, dy] = DIRS[e.dir];
  const p = Math.min(e.prog, len);
  e.px = e.x * TS + dx * p; e.py = e.y * TS + dy * p;
  e.fr = (p < len / 2) ? (e.stepN % 2 ? 1 : 2) : 0;
  if (e.prog >= len) {
    e.x = e.hop ? e.x + dx * 2 : e.tx; e.y = e.hop ? e.y + dy * 2 : e.ty;
    e.px = e.x * TS; e.py = e.y * TS; e.moving = false; e.hop = 0; e.fr = 0;
    return true;
  }
  return false;
}
// scripted movement
async function walk(e, path, speed = 1) {
  for (const d of path) {
    if (d === ' ') continue;
    startMove(e, d, speed);
    while (e.moving) { await tick(); }
  }
}
async function faceTo(e, d) { e.dir = d; await tick(); }
function dirTo(a, b) { const dx = b.x - a.x, dy = b.y - a.y; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U'); }
async function emote(e, kind = '!', n = 40) {
  const em = { e, kind, t: 0 }; F.emotes.push(em);
  if (kind === '!') AU.sfx('excl');
  await wait(n);
  F.emotes.splice(F.emotes.indexOf(em), 1);
}
const ent = id => F.ents.find(e => e.id === id);
async function warp(map, x, y, dir, o = {}) {
  F.lock++;
  if (!o.noSfx) AU.sfx('door');
  await fadeOut(o.fast ? 8 : 12);
  loadMap(map, x, y, dir);
  F.pl.dir = dir || F.pl.dir;
  await wait(4);
  const ent = MAPS[map].onEnter;
  await fadeIn(o.fast ? 8 : 12);
  F.lock--;
  if (ent) await runScript(ent);
}
async function runScript(fn, ...a) {
  F.lock++;
  try { await fn(...a); } catch (e) { console.error(e); }
  F.lock--;
  closeMsg();
}

// ---------------------------------------------------------------- player update
let holdDirT = 0, lastDir = null;
function fieldUpdate() {
  if (MODE !== 'field' || !F.map) return;
  G.time++;
  for (const e of F.ents) {
    if (updEnt(e) && e.onStep) e.onStep();
    if (F.lock === 0 && e.wander && !e.moving && chance(0.008)) {
      const d = pick(['U', 'D', 'L', 'R']), [dx, dy] = DIRS[d];
      const nx = e.x + dx, ny = e.y + dy;
      e.dir = d;
      if (Math.abs(nx - e.home[0]) <= 2 && Math.abs(ny - e.home[1]) <= 2 && !blocked(nx, ny, e)) startMove(e, d, 0.5);
    }
  }
  const pl = F.pl;
  if (pl.moving) {
    const done = updEnt(pl);
    if (done) { stepDone(); }
    return;
  }
  if (F.lock > 0) return;
  // menu
  if (btnp('ST')) { runScript(startMenu); return; }
  if (btnp('A')) { interact(); return; }
  if (btnp('SE') && G.bag.shoes) { G.autoRun = !G.autoRun; AU.sfx('ok'); F.mapTitle = { t: G.autoRun ? 'いつも はしる：オン' : 'いつも はしる：オフ', f: 90 }; return; }
  let d = null;
  for (const k of ['U', 'D', 'L', 'R']) if (btn(k)) { d = k; }
  if (lastDir && btn(lastDir)) d = lastDir;
  if (!d) { holdDirT = 0; lastDir = null; return; }
  if (d !== lastDir) { holdDirT = 0; lastDir = d; }
  holdDirT++;
  if (pl.dir !== d && holdDirT < 5 && !pl.wasMoving) { pl.dir = d; return; }
  tryMove(d);
}
function tryMove(d) {
  const pl = F.pl; const [dx, dy] = DIRS[d]; const nx = pl.x + dx, ny = pl.y + dy;
  pl.dir = d;
  const m = F.map;
  // exit mat
  if (d === 'D' && tileDef(pl.x, pl.y).mat) { const w = findWarp(pl.x, pl.y); if (w) { runScript(() => doWarp(w)); return; } }
  // map edges
  if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) {
    const ed = m.def.edges && m.def.edges[d];
    if (ed && (!ed.if || ed.if())) { runScript(() => edgeWarp(ed, nx, ny, d)); return; }
    if (ed && ed.block) { runScript(ed.block); return; }
    bump(); return;
  }
  // ledge
  if (d === 'D' && tileDef(nx, ny).ledge && !blocked(nx, ny + 1, pl)) {
    pl.hop = 1; startMove(pl, 'D', 2); AU.sfx('ledge'); pl.wasMoving = true; return;
  }
  // door
  const door = m.doors[nx + ',' + ny];
  if (door) {
    if (door.locked && door.locked()) { runScript(door.lockedMsg); return; }
    startMove(pl, d, 1); pl.wasMoving = true; return;
  }
  if (blocked(nx, ny, pl)) { bump(); return; }
  const run = (btn('B') !== !!G.autoRun) && G.bag.shoes;
  startMove(pl, d, run ? 2 : 1); pl.wasMoving = true;
}
let bumpT = 0;
function bump() { const pl = F.pl; pl.wasMoving = false; if (frame - bumpT > 18) { AU.sfx('bump'); bumpT = frame; } }
function findWarp(x, y) { return (F.map.def.warps || []).find(w => w.x === x && w.y === y && (!w.if || w.if())); }
async function doWarp(w) { await warp(w.to, w.tx, w.ty, w.dir || F.pl.dir); }
async function edgeWarp(ed, nx, ny, d) {
  const T = MAPS[ed.to]; const tw_ = T.grid[0].length, th = T.grid.length;
  let x = nx, y = ny;
  if (d === 'U') { y = th - 1; x = nx + (ed.off || 0); }
  if (d === 'D') { y = 0; x = nx + (ed.off || 0); }
  if (d === 'L') { x = tw_ - 1; y = ny + (ed.off || 0); }
  if (d === 'R') { x = 0; y = ny + (ed.off || 0); }
  await warp(ed.to, x, y, d, { noSfx: true, fast: true });
}
function stepDone() {
  const pl = F.pl, m = F.map;
  G.steps++;
  const keepGoing = () => { };
  // door at current pos?
  const door = m.doors[pl.x + ',' + pl.y];
  if (door) { runScript(() => warp(door.to, door.tx, door.ty, 'U')); return; }
  const w = findWarp(pl.x, pl.y);
  if (w && w.step) { runScript(() => doWarp(w)); return; }
  // triggers
  for (const t of (m.def.trigs || [])) {
    if (pl.x >= t.x && pl.x < t.x + (t.w || 1) && pl.y >= t.y && pl.y < t.y + (t.h || 1) && (!t.if || t.if())) { pl.wasMoving = false; runScript(t.run); return; }
  }
  if (checkTrainers()) return;
  // repel
  if (G.repel > 0) { G.repel--; if (G.repel === 0) { runScript(async () => { await say('むしよけスプレーの こうかが きれた！'); }); return; } }
  // encounters
  const td = tileDef(pl.x, pl.y);
  const enc = m.def.enc;
  if (td.enc && enc) {
    const list = (tileCh(pl.x, pl.y) === 'c' ? enc.cave : enc.grass) || enc.grass || enc.cave;
    if (list && chance(0.11 * td.enc) && G.party.length) {
      const tot = list.reduce((a, e) => a + e[3], 0); let r = Math.random() * tot, e = list[0];
      for (const it of list) { r -= it[3]; if (r <= 0) { e = it; break; } }
      const lv = rint(e[1], e[2]);
      const lead = G.party.find(p => p.hp > 0);
      if (G.repel > 0 && lead && lv < lead.lv) return;
      pl.wasMoving = false;
      runScript(() => wildBattle(e[0], lv));
      return;
    }
  }
  // continue walking if key held
  if (!['U', 'D', 'L', 'R'].some(btn)) pl.wasMoving = false;
}
function interact() {
  const pl = F.pl; const [dx, dy] = DIRS[pl.dir]; const x = pl.x + dx, y = pl.y + dy;
  const e = entAt(x, y) || F.ents.find(e => e.vis && e.x === x && e.y === y);
  if (e) {
    if (e.ball) { runScript(() => pickBall(e)); return; }
    if (e.talk || e.tr) { runScript(() => talkTo(e)); return; }
  }
  // counters: talk across
  const t = tileDef(x, y);
  if ((tileCh(x, y) === 'k' || tileCh(x, y) === 'K')) {
    const e2 = F.ents.find(e => e.x === x + dx && e.y === y + dy);
    if (e2 && e2.talk) { runScript(() => talkTo(e2)); return; }
  }
  const sg = F.map.def.signs && F.map.def.signs[x + ',' + y];
  if (sg) { runScript(async () => { typeof sg === 'function' ? await sg() : await say(sg); }); return; }
  if (t.pc) { runScript(pcMenu); return; }
  if (t.tv) { runScript(async () => { await say(pick(['テレビで ふーモンの えいがを やっている。 ……ちょっと みていたいなあ。', 'テレビで ニュースを やっている。 「さいきん カザンだん という あやしい ひとたちが……」'])); }); return; }
  if (tileCh(x, y) === 'b') { runScript(async () => { await say('ふーモンの ほんが いっぱい ならんでいる。'); }); return; }
  if (t.gem) { runScript(async () => { await say('かべに きれいな いしが うまっている。 キラキラ ひかって きれい！'); }); return; }
}
async function talkTo(e) {
  if (!e.noTurn) e.dir = OPP[F.pl.dir];
  await tick();
  if (e.tr && !flag(e.tr.flag)) { await trainerBattle(e); return; }
  if (e.tr && flag(e.tr.flag) && e.tr.after) { await say(e.tr.after, { who: e.who }); return; }
  if (typeof e.talk === 'function') await e.talk(e);
  else if (Array.isArray(e.talk)) { for (const s of e.talk) await say(s, { who: e.who }); }
  else await say(e.talk, { who: e.who });
}
async function pickBall(e) {
  const it = ITEMS[e.item];
  e.vis = false; setFlag(e.flagK);
  F.ents.splice(F.ents.indexOf(e), 1);
  AU.fanfare('item');
  addItem(e.item, e.n);
  await say(`ふーたんは ${it.n}${e.n > 1 ? ' ×' + e.n : ''} を みつけた！`);
}
function addItem(k, n = 1) { G.bag[k] = (G.bag[k] || 0) + n; }
// trainer line of sight
function checkTrainers() {
  const pl = F.pl;
  for (const e of F.ents) {
    if (!e.tr || flag(e.tr.flag) || !e.vis) continue;
    const [dx, dy] = DIRS[e.dir]; const sight = e.tr.sight ?? 4;
    for (let k = 1; k <= sight; k++) {
      const x = e.x + dx * k, y = e.y + dy * k;
      if (x === pl.x && y === pl.y) {
        pl.wasMoving = false;
        runScript(async () => {
          AU.bgm(e.tr.music || 'kazan');
          await emote(e, '!', 36);
          const steps = k - 1; await walk(e, e.dir.repeat(steps));
          F.pl.dir = OPP[e.dir];
          await trainerBattle(e);
        });
        return true;
      }
      if (blocked(x, y, e) && !(x === pl.x && y === pl.y)) break;
    }
  }
  return false;
}
async function trainerBattle(e) {
  const tr = e.tr;
  if (tr.pre) await say(tr.pre, { who: tr.name });
  const won = await battle({ trainer: tr });
  if (won) {
    setFlag(tr.flag);
    if (tr.post) await runInline(tr.post);
  }
}
async function runInline(p) { if (typeof p === 'function') await p(); else await say(p); }

// ---------------------------------------------------------------- render
let animF = 0;
function drawField() {
  const m = F.map; if (!m) return;
  animF = Math.floor(frame / 16);
  const pl = F.pl;
  let cx = Math.round(pl.px + 8 - W / 2), cy = Math.round(pl.py + 8 - H / 2 - (pl.hop ? 0 : 0));
  if (m.w * TS <= W) cx = Math.round((m.w * TS - W) / 2);
  if (m.h * TS <= H) cy = Math.round((m.h * TS - H) / 2);
  if (F.shake > 0) { cx += rint(-2, 2); cy += rint(-2, 2); F.shake--; }
  F.cam = [cx, cy];
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const x0 = Math.floor(cx / TS), y0 = Math.floor(cy / TS);
  const border = m.def.border;
  const steam = [];
  for (let ty = y0; ty <= y0 + 11; ty++) for (let tx = x0; tx <= x0 + 16; tx++) {
    const inb = tx >= 0 && ty >= 0 && tx < m.w && ty < m.h;
    if (!inb && !border) continue;
    const ch = inb ? m.grid[ty][tx] : border;
    const d = tileAt(ch); const fr = d.frames[(animF + (d.frames.length > 2 ? 0 : 0)) % d.frames.length];
    ctx.drawImage(fr, tx * TS - cx, ty * TS - cy);
    if (ch === 'h') steam.push([tx * TS - cx, ty * TS - cy, tx * 7 + ty * 13]);
  }
  for (const [sx, sy, k] of steam) {
    const t = (frame + k * 9) % 90, a = Math.sin(t / 90 * Math.PI) * 0.45;
    ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.beginPath(); ctx.arc(sx + 8 + Math.sin((frame + k) * 0.05) * 3, sy + 10 - t * 0.25, 2 + t * 0.04, 0, 7); ctx.fill();
  }
  for (const b of m.builds) ctx.drawImage(b.B.img, b.x * TS - cx, b.y * TS - cy);
  // entities
  const list = F.ents.filter(e => e.vis).concat([pl]).sort((a, b) => a.py - b.py);
  for (const e of list) drawEnt(e, cx, cy);
  // emotes
  for (const em of F.emotes) {
    const x = em.e.px - cx + 4, y = em.e.py - cy - 24 - Math.min(4, em.t++ / 2) + 4;
    ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, y, 10, 12); ctx.fillRect(x, y - 1, 8, 14);
    ctx.fillStyle = '#303038'; ctx.fillRect(x - 1, y - 1, 1, 1);
    if (em.kind === '!') { ctx.fillStyle = '#e02838'; ctx.fillRect(x + 3, y + 1, 2, 7); ctx.fillRect(x + 3, y + 9, 2, 2); }
    else if (em.kind === '?') txt('?', x + 1, y - 1, '#3858c8', null, 11);
    else txt(em.kind, x, y - 1, '#e02838', null, 10);
  }
  // weather
  if (F.weather === 'ash') {
    ctx.fillStyle = 'rgba(80,70,70,0.12)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e8e8e0';
    for (let i = 0; i < 40; i++) { const x = (i * 53 + frame * 0.4 + Math.sin(i + frame * 0.03) * 6) % W, y = (i * 37 + frame * 0.7) % H; ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1); }
  }
  if (F.weather === 'cave') { const g = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 150); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  if (F.weather === 'heat') { ctx.fillStyle = 'rgba(255,120,40,0.10)'; ctx.fillRect(0, 0, W, H); }
  if (F.tint) { ctx.fillStyle = F.tint; ctx.fillRect(0, 0, W, H); }
  // map title popup
  if (F.mapTitle && F.mapTitle.f > 0) {
    const f = F.mapTitle.f--; const y = f > 130 ? -(f - 130) * 1.2 : f < 20 ? -(20 - f) * 1.2 : 0;
    const w = tw(F.mapTitle.t) + 20;
    win(2, 2 + y, w, 22, WS.menu); txt(F.mapTitle.t, 12, 8 + y);
  }
}
function drawEnt(e, cx, cy) {
  const x = Math.round(e.px - cx), y = Math.round(e.py - cy);
  if (x < -32 || y < -40 || x > W + 32 || y > H + 32) return;
  if (e.ball) { drawBallIcon(x + 3, y + 3, 10); return; }
  let hopY = 0;
  if (e.hop && e.moving) { const t = Math.min(1, e.prog / 32); hopY = -Math.sin(t * Math.PI) * 10; ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x + 8, y + 15, 6, 2.5, 0, 0, 7); ctx.fill(); }
  if (e.mon) {
    const img = monImg(e.mon), s = e.big ? 32 : 24;
    const bob = Math.floor(frame / 12) % 2;
    ctx.drawImage(img, 0, 0, 64, 64, x + 8 - s / 2, y + 16 - s - bob, s, s);
    return;
  }
  const spr = owSprites(e.ch);
  const img = spr[e.dir][e.fr || 0];
  ctx.drawImage(img, x, y - 8 + hopY);
  // tall grass overlay
  if (!e.hop) {
    const tx = Math.round(e.px / TS), ty = Math.round(e.py / TS);
    const td = tileDef(tx, ty);
    if (td.over && !(e.moving && e.prog < 8)) { ctx.drawImage(td.frames[0], 0, 9, 16, 7, tx * TS - cx, ty * TS - cy + 9, 16, 7); }
  }
}
function drawBallIcon(x, y, s = 10, open = 0, col = '#e83040') {
  ctx.fillStyle = '#202028'; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 2 + 0.6, 0, 7); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 2 - 0.4, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#f8f8f8'; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 2 - 0.4, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#202028'; ctx.fillRect(x, y + s / 2 - 0.6, s, 1.2);
  ctx.fillStyle = '#f8f8f8'; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 6 + 0.3, 0, 7); ctx.fill();
  ctx.strokeStyle = '#202028'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(x + s * 0.25, y + s * 0.2, 1.2, 1.2);
}
