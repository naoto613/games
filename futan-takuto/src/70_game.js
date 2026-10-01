// ================================================================ HUD
const HUD = {
  dirty: true, lastHp: -1, lastMax: -1, lastR: -1,
  heartSVG(fill) { // fill 0..1 (half steps)
    const id = 'h' + Math.random().toString(36).slice(2, 7);
    return `<svg viewBox="0 0 30 28"><defs><clipPath id="${id}"><rect x="0" y="0" width="${30 * fill}" height="28"/></clipPath></defs><path d="M15 26 C4 18 1 12 1 8 1 4 4 1 8 1c3 0 5 2 7 4 2-2 4-4 7-4 4 0 7 3 7 7 0 4-3 10-14 18z" fill="#3a1a2a" opacity=".45" stroke="#fff" stroke-width="2"/><path clip-path="url(#${id})" d="M15 26 C4 18 1 12 1 8 1 4 4 1 8 1c3 0 5 2 7 4 2-2 4-4 7-4 4 0 7 3 7 7 0 4-3 10-14 18z" fill="#ff3a5a" stroke="#fff" stroke-width="2"/><ellipse cx="9" cy="7" rx="3" ry="2" fill="#fff" opacity=".7" clip-path="url(#${id})"/></svg>`;
  },
  update() {
    if (S.hp !== this.lastHp || S.maxHp !== this.lastMax) {
      this.lastHp = S.hp; this.lastMax = S.maxHp; let h = '';
      for (let i = 0; i < S.maxHp / 2; i++) h += this.heartSVG(clamp((S.hp - i * 2) / 2, 0, 1));
      $('#hearts').innerHTML = h;
    }
    if (S.rupees !== this.lastR) { this.lastR = S.rupees; $('#rnum').textContent = S.rupees; }
    $('#magic').classList.toggle('hide', !S.items.leaf); $('#magic i').style.width = (PL.magic * 100) + '%';
    $('#pearls').classList.toggle('hide', !F.boat || F.tower);
    for (const k of ['g', 'r', 'b']) $('#pearls .' + k).classList.toggle('on', !!S.pearls[k]);
    $('#wind').classList.toggle('hide', PL.mode !== 'boat');
  },
  hurt() { const h = $('#hearts'); h.classList.remove('hurt'); void h.offsetWidth; h.classList.add('hurt'); },
};
// wind compass (WW style)
const windCv = $('#wind'), wctx = windCv.getContext('2d');
function drawWind() {
  if (PL.mode !== 'boat') return;
  const c = wctx, W = 168, R = 70; c.clearRect(0, 0, W, W);
  c.save(); c.translate(84, 84);
  c.fillStyle = 'rgba(10,40,90,.5)'; c.beginPath(); c.arc(0, 0, R + 8, 0, TAU); c.fill();
  c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.stroke();
  // screen-relative: up = camera forward
  const rel = a => a - (CAM.yaw + Math.PI); // world angle -> screen angle (0 = up)
  const draw = (a, col, len, w) => { c.save(); c.rotate(-rel(a) + Math.PI); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(0, -len * 0.6); c.lineTo(0, len * 0.6); c.stroke(); c.beginPath(); c.moveTo(0, len * 0.8); c.lineTo(-w * 2.2, len * 0.45); c.lineTo(w * 2.2, len * 0.45); c.closePath(); c.fill(); c.restore(); };
  // N marker
  c.save(); c.rotate(-rel(Math.PI) + Math.PI); c.fillStyle = '#ffd84a'; c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.fillText('N', 0, -R + 22); c.restore();
  draw(World.wind.dir, '#fff', R * 1.1, 6);
  draw(BOAT.head, '#ff6a4a', R * 0.55, 4);
  c.restore();
}

// ================================================================ wind song
const Song = {
  isOpen: false,
  open(tutorial) {
    return new Promise(res => {
      if (this.isOpen) return res();
      this.isOpen = true; this.res = res; this.phase = 0; this.seq = []; this.tut = tutorial;
      $('#song').classList.remove('hide'); $('#songT').textContent = 'タクトを ふって かぜの うたを ひこう！ （↑ ← →）';
      $('#staff').classList.remove('hide'); [...$('#staff').children].forEach(i => i.classList.remove('ok'));
      $('#songX').classList.toggle('hide', !!tutorial);
      $('#pad .c').textContent = '♪';
      PL.conduct = true; refreshGear(); Audio2.duck(30);
    });
  },
  close() {
    if (!this.isOpen) return; this.isOpen = false; $('#song').classList.add('hide'); PL.conduct = false; refreshGear(); Audio2.duck(0.01);
    const r = this.res; this.res = null; r && r();
  },
  input(n) {
    if (!this.isOpen) return;
    const NOTES = { u: 'D5', l: 'B4', r: 'A5', d: 'F#4', c: 'D4' };
    if (this.phase === 0) {
      Audio2.sfx('note', Audio2.NOTE(NOTES[n]));
      const want = ['u', 'l', 'r'];
      if (n === want[this.seq.length]) { this.seq.push(n); $('#staff').children[this.seq.length - 1].classList.add('ok'); }
      else { this.seq = []; [...$('#staff').children].forEach(i => i.classList.remove('ok')); if (n !== 'c') toast('もういちど！ ↑ ← →', 1.2); }
      if (this.seq.length === 3) {
        this.phase = 1;
        setTimeout(() => { ['D5', 'B4', 'A5', 'D5', 'F#5', 'A5'].forEach((x, i) => setTimeout(() => Audio2.sfx('note', Audio2.NOTE(x)), i * 170)); }, 250);
        setTimeout(() => { $('#songT').textContent = 'かぜを どっちに ふかせる？'; $('#staff').classList.add('hide'); $('#pad .c').innerHTML = 'ふねの<br>むき'; }, 1350);
      }
    } else if (this.phase === 1 && $('#staff').classList.contains('hide')) {
      let ang;
      if (n === 'c') ang = BOAT.head;
      else {
        const m = { u: [0, 1], d: [0, -1], l: [-1, 0], r: [1, 0] }[n]; const b = camBasis();
        ang = Math.atan2(b.rx * m[0] + b.fx * m[1], b.rz * m[0] + b.fz * m[1]);
      }
      World.wind.dir = ang; Audio2.sfx('gust'); Audio2.sfx('chime');
      for (const w of windLines) w.life = w.max;
      this.close(); toast('かぜが かわった！', 1.6);
    }
  },
};
document.querySelectorAll('#pad button[data-n]').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); Song.input(b.dataset.n); }));
$('#songX').addEventListener('click', () => Song.close());
addEventListener('keydown', e => {
  if (!Song.isOpen) return;
  const m = { ArrowUp: 'u', KeyW: 'u', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowDown: 'd', KeyS: 'd', Enter: 'c', KeyZ: 'c', Space: 'c' }[e.code];
  if (m) { e.preventDefault(); Song.input(m); } if (e.code === 'Escape' && !Song.tut) Song.close();
});

// ================================================================ sea chart
const Chart = {
  open: false, cv: $('#mapc'),
  toggle() { if (Story.cut || Song.isOpen) return; this.open = !this.open; $('#mapov').classList.toggle('hide', !this.open); if (this.open) this.draw(); Audio2.sfx('select'); },
  w2m(x, z) { return [(x + 1050) / 2100 * 900, (z + 1250) / 2100 * 900]; },
  draw() {
    const c = this.cv.getContext('2d'), W = 900;
    c.fillStyle = '#ead7a6'; c.fillRect(0, 0, W, W);
    const g = c.createRadialGradient(450, 450, 200, 450, 450, 640); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,80,30,.35)'); c.fillStyle = g; c.fillRect(0, 0, W, W);
    // waves
    c.strokeStyle = 'rgba(70,110,150,.25)'; c.lineWidth = 2;
    for (let y = 30; y < W; y += 46) for (let x = (y / 46 % 2) * 40; x < W; x += 80) { c.beginPath(); c.arc(x, y, 10, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    // grid 7x7
    c.strokeStyle = 'rgba(110,70,30,.35)'; c.lineWidth = 2;
    for (let i = 1; i < 7; i++) { c.beginPath(); c.moveTo(i * W / 7, 0); c.lineTo(i * W / 7, W); c.stroke(); c.beginPath(); c.moveTo(0, i * W / 7); c.lineTo(W, i * W / 7); c.stroke(); }
    // islands
    c.font = 'bold 22px "Kiwi Maru", sans-serif'; c.textAlign = 'center';
    for (const I of Islands) {
      if (!I.poly) continue; const seen = S.seen[I.id];
      const [mx, mz] = this.w2m(I.x, I.z);
      if (!seen) { if (!I.name) continue; c.fillStyle = 'rgba(110,70,30,.5)'; c.font = 'bold 30px sans-serif'; c.fillText('？', mx, mz + 10); c.font = 'bold 22px "Kiwi Maru", sans-serif'; continue; }
      c.beginPath(); I.poly.forEach(([x, z], i) => { const [px, pz] = this.w2m(I.x + x, I.z + z); i ? c.lineTo(px, pz) : c.moveTo(px, pz); }); c.closePath();
      c.fillStyle = I.pal === 'rock' ? '#8a8692' : I.pal === 'fire' ? '#c08a5a' : I.pal === 'holy' ? '#f0ecd8' : '#8ac860'; c.fill();
      c.strokeStyle = '#6a4a24'; c.lineWidth = 2.5; c.stroke();
      if (I.name) { c.fillStyle = '#4a2a10'; c.fillText(I.name, mx, mz - I.R * 900 / 2100 - 10); }
      if (I.id.startsWith('islet')) { const ch = Things.chests.find(q => q.id === I.id); c.fillText(ch && ch.opened ? '✓' : '★', mx, mz + 8); }
    }
    // storm
    if (!F.tower) { const [mx, mz] = this.w2m(ISL.fortress.x, ISL.fortress.z); c.fillStyle = 'rgba(60,50,90,.35)'; c.beginPath(); c.arc(mx, mz, 300 * 900 / 2100, 0, TAU); c.fill(); c.fillStyle = '#3a2a5a'; c.fillText('あらし', mx, mz); }
    // objective
    if (Story.objPos) { const [mx, mz] = this.w2m(Story.objPos.x, Story.objPos.z); const r = 18 + Math.sin(performance.now() / 200) * 3; c.fillStyle = '#e2463a'; c.strokeStyle = '#fff'; c.lineWidth = 3; star(c, mx, mz, r); }
    // player
    const p = PL.mode === 'boat' ? BOAT.pos : PL.pos, h = PL.mode === 'boat' ? BOAT.head : PL.face;
    const [px, pz] = this.w2m(p.x, p.z);
    c.save(); c.translate(px, pz); c.rotate(-h + Math.PI); c.fillStyle = '#e2463a'; c.strokeStyle = '#fff'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(0, 16); c.lineTo(-11, -12); c.lineTo(0, -6); c.lineTo(11, -12); c.closePath(); c.fill(); c.stroke(); c.restore();
    // compass
    c.fillStyle = '#6a4a24'; c.font = 'bold 30px serif'; c.fillText('N', 860, 50); c.beginPath(); c.moveTo(860, 58); c.lineTo(852, 82); c.lineTo(868, 82); c.fill();
    c.font = 'bold 22px "Kiwi Maru", sans-serif'; c.textAlign = 'left'; c.fillStyle = '#4a2a10';
    c.fillText('うみの ちず', 22, 40);
    if (this.open) requestAnimationFrame(() => this.open && this.draw());
  },
};
function star(c, x, y, r) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); c.stroke(); }
Hooks.map = () => { if (Game.state === 'play') Chart.toggle(); };
$('#mapX').addEventListener('click', () => Chart.toggle());
$('#bSnd').addEventListener('click', e => { e.stopPropagation(); const on = Audio2.toggle(); $('#bSnd').textContent = on ? '🔊' : '🔇'; });

// ================================================================ interaction
function findAction() {
  const p = PL.pos;
  if (PL.mode === 'boat') {
    for (const n of NPCs) if (n.visible && n.boatTalk && Math.hypot(BOAT.pos.x - n.pos.x, BOAT.pos.z - n.pos.z) < n.r) return { label: 'はなす', fn: () => n.talk() };
    if (BOAT.speed < 9) { const l = findLanding(); if (l) return { label: 'おりる', fn: () => disembark(l) }; }
    return S.items.sword ? { label: 'きる', fn: () => { if (!PL.atk) { PL.atk = { t: 0, type: 1, hit: false }; Audio2.sfx('swing'); } } } : null;
  }
  if (PL.swim) { if (F.boat && Math.hypot(p.x - BOAT.pos.x, p.z - BOAT.pos.z) < 5) return { label: 'のる', fn: embark }; return null; }
  let best = null, bd = 99;
  const fx = Math.sin(PL.face), fz = Math.cos(PL.face);
  const facing = (x, z, r) => { const dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz); return d < r && (d < 1.2 || (dx * fx + dz * fz) / d > 0.3) ? d : 99; };
  for (const n of NPCs) { if (!n.visible || !n.talk || n.boatTalk && n.id === 'jab' && false) continue; const d = facing(n.pos.x, n.pos.z, n.r); if (Math.abs(n.pos.y - p.y) < 4 && d < bd) { bd = d; best = { label: 'はなす', fn: () => n.talk() }; } }
  for (const s of Things.signs) { const d = facing(s.x, s.z, 2.2); if (d < bd) { bd = d; best = { label: 'よむ', fn: () => say('sign', s.text) }; } }
  for (const c of Things.chests) { if (c.opened || c.hidden) continue; const d = facing(c.x, c.z, 2.3); if (d < bd) { bd = d; best = { label: 'あける', fn: () => openChest(c) }; } }
  if (F.boat && Math.hypot(p.x - BOAT.pos.x, p.z - BOAT.pos.z) < 4.8 && Math.abs(p.y - BOAT.pos.y) < 3) { const d = Math.hypot(p.x - BOAT.pos.x, p.z - BOAT.pos.z); if (d < bd + 1) best = { label: 'のる', fn: embark }; }
  if (best) return best;
  return S.items.sword ? { label: 'きる', fn: startAttack, attack: true } : null;
}
function embark() {
  PL.mode = 'boat'; PL.swim = false; PL.glide = false; refreshGear(); Audio2.sfx('jump');
  CAM.yaw = BOAT.head + Math.PI; CAM.pitch = 0.26; Audio2.music(Race.on ? 'whale' : 'sea');
}
function disembark(l) {
  PL.mode = 'foot'; refreshGear(); BOAT.speed = 0; Audio2.sfx('jump');
  placePlayer(l.x, l.z, BOAT.head); PL.P.shadow.visible = true; Audio2.setWind(0);
  Story.areaShown = null;
}
async function openChest(c) {
  c.opened = true; S.chests[c.id] = 1;
  await cut(async () => {
    facePlayerTo(c.x, c.z); lookAtPlayer(4, 2, 0.8);
    Audio2.sfx('open');
    for (let t = 0; t < 0.6; t += 1 / 60) { c.lid.rotation.x = -1.9 * smooth(0, 1, t / 0.6); await wait(1 / 60); }
    Audio2.sfx('found');
    if (c.content === 'heart') { S.maxHp += 2; S.hp = S.maxHp; await itemGet('❤️', 'ハートの うつわ！ ハートが ふえた！'); }
    else { const v = c.content === 'r100' ? 100 : 50; S.rupees = Math.min(999, S.rupees + v); await itemGet('💎', `キラキラ ${v}こ！`, false); }
  });
  setObjective();
}

// ================================================================ ambient life: gulls, barrels, octos
const Gulls = [];
function spawnAmbient() {
  for (let i = 0; i < 10; i++) { const P = makeGull(); P.g.scale.setScalar(1.4); scene.add(P.g); const I = Islands[i % 6]; Gulls.push({ P, cx: I.x + rnd(-30, 30), cz: I.z + rnd(-30, 30), r: rnd(18, 40), h: rnd(14, 30), sp: rnd(0.25, 0.5) * (i % 2 ? 1 : -1), a: rnd(0, TAU) }); }
  // floating barrels with treasure
  Floaties.list = [];
  const r = mulberry(5);
  for (let i = 0; i < 26; i++) { let x, z; do { x = (r() - 0.5) * 1700; z = -1150 + r() * 1900; } while (islandAt(x, z) || Math.hypot(x - ISL.fortress.x, z - ISL.fortress.z) < 320); Floaties.add(x, z); }
  // sea octos
  [[-200, -120], [230, -150], [-120, 250], [200, -520], [-260, -520], [520, -420], [-560, -260], [120, 230]].forEach(([x, z]) => Enemies.spawn('octo', x, z, { tag: 'sea' }));
  Story.octoT = 0;
}
const Floaties = {
  list: [],
  add(x, z) { const g = new THREE.Group(); const b = mk(G.cyl(0.8, 0.8, 1.6, 12), 0x9a6a3a, 0.04); b.rotation.z = Math.PI / 2; g.add(b); for (const s of [-0.5, 0.5]) { const r = mk(G.cyl(0.84, 0.84, 0.14, 12), 0x5a5a62, 0); r.rotation.z = Math.PI / 2; r.position.x = s; g.add(r); } g.position.set(x, 0, z); scene.add(g); this.list.push({ g, x, z, alive: true, t: 0 }); },
  update(dt) {
    for (const f of this.list) {
      if (!f.alive) { f.t += dt; if (f.t > 90 && Math.hypot(f.x - BOAT.pos.x, f.z - BOAT.pos.z) > 150) { f.alive = true; f.g.visible = true; } continue; }
      f.g.position.y = waveH(f.x, f.z) * 0.8 + 0.1; f.g.rotation.y += dt * 0.2; f.g.rotation.x = Math.sin(World.t + f.x) * 0.15;
      if (PL.mode === 'boat' && Math.hypot(f.x - BOAT.pos.x, f.z - BOAT.pos.z) < 3.4) this.smash(f);
    }
  },
  smash(f) { f.alive = false; f.t = 0; f.g.visible = false; Audio2.sfx('pot'); FX.shards(f.x, 0.8, f.z, 0x9a6a3a); FX.splash(f.x, f.z, 0.8); const n = 1 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) Pickups.drop(f.x, 1, f.z, Math.random() < 0.2 ? 'r' : Math.random() < 0.6 ? 'b' : 'g'); },
};
Hooks.boatHit = test => { for (const f of Floaties.list) if (f.alive && test(f.x, f.z)) Floaties.smash(f); };
function updateAmbient(dt) {
  for (const g of Gulls) { g.a += g.sp * dt; g.P.g.position.set(g.cx + Math.cos(g.a) * g.r, g.h + Math.sin(g.a * 3) * 1.5, g.cz + Math.sin(g.a) * g.r); g.P.g.rotation.y = Math.atan2(-Math.sin(g.a) * g.sp, Math.cos(g.a) * g.sp); g.P.g.rotation.z = -Math.sign(g.sp) * 0.3; for (const w of g.P.w) w.w.rotation.z = w.s * Math.sin(World.t * 6 + g.a) * 0.4; }
  Floaties.update(dt);
  // respawn octos over time
  Story.octoT += dt;
  if (Story.octoT > 80) { Story.octoT = 0; const live = Enemies.list.filter(e => e.alive && e.tag === 'sea').length; if (live < 6) { const a = Math.random() * TAU, d = 120; const x = BOAT.pos.x + Math.cos(a) * d, z = BOAT.pos.z + Math.sin(a) * d; if (!islandAt(x, z) && Math.hypot(x - ISL.fortress.x, z - ISL.fortress.z) > 320) Enemies.spawn('octo', x, z, { tag: 'sea' }); } }
  // grass/pot respawn
  for (const g of Things.grass) if (!g.alive) { g.respawn -= dt; if (g.respawn <= 0 && Math.hypot(g.x - PL.pos.x, g.z - PL.pos.z) > 20) { g.alive = true; g.g.visible = true; } }
  for (const p of Things.pots) if (!p.alive) { p.respawn -= dt; if (p.respawn <= 0 && Math.hypot(p.x - PL.pos.x, p.z - PL.pos.z) > 25) { p.alive = true; p.g.visible = true; p.col.on = true; } }
  for (const d of Things.dummies) { d.wob = Math.max(0, d.wob - dt * 1.5); d.b.rotation.z = Math.sin(World.t * 18) * 0.25 * d.wob; }
  for (const f of Things.anim) f(dt);
  // volcano smoke
  if (ISL.fire && Math.random() < dt * 4) { const s = ISL.fire.smoke; if (Math.hypot(camera.position.x - s.x, camera.position.z - s.z) < 600) FX.smoke(s.x, s.y + 1, s.z, 1.5); }
  // pearl on the forest stump
  if (Puzzle.pearlMeshG && Puzzle.pearlMeshG.visible) { Puzzle.pearlMeshG.rotation.y += dt * 2; Puzzle.pearlMeshG.position.y = Puzzle.pearlG.y + 1.2 + Math.sin(World.t * 2) * 0.2; }
}

// ================================================================ objective beacon
let beacon;
function updateBeacon() {
  const p = Story.objPos; const c = PL.mode === 'boat' ? BOAT.pos : PL.pos;
  const show = p && !Story.cut && Math.hypot(p.x - c.x, p.z - c.z) > 45;
  beacon.visible = !!show; if (show) beacon.position.set(p.x, 0, p.z);
  beacon.children.forEach((m, i) => m.material.opacity = (i ? 0.45 : 0.25) + Math.sin(World.t * 3) * 0.08);
}

// ================================================================ save / load
const SAVE_KEY = 'futan-takuto-v1';
function saveGame() {
  if (Game.state !== 'play') return;
  try {
    const d = JSON.parse(JSON.stringify(S));
    d.pos = PL.mode === 'foot' && PL.island && !PL.swim ? { x: PL.lastSafe.x, z: PL.lastSafe.z, island: PL.island.id } : null;
    d.boat = { x: BOAT.pos.x, z: BOAT.pos.z, h: BOAT.head, mode: PL.mode };
    d.wind = World.wind.dir;
    localStorage.setItem(SAVE_KEY, JSON.stringify(d));
  } catch (e) { }
}
function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { return null; } }
function applySave(d) {
  for (const k of ['rupees', 'maxHp', 'hp', 'outfit', 'fastSail', 'kills']) if (d[k] != null) S[k] = d[k];
  Object.assign(S.flags, d.flags || {}); Object.assign(S.items, d.items || {}); Object.assign(S.pearls, d.pearls || {}); Object.assign(S.chests, d.chests || {}); Object.assign(S.seen, d.seen || {});
  S.hp = Math.max(S.hp, 4);
  setOutfit(PL.P, S.outfit);
  if (d.boat) placeBoat(d.boat.x, d.boat.z, d.boat.h);
  if (d.wind != null) World.wind.dir = d.wind;
  if (d.boat && d.boat.mode === 'boat' && F.boat) { PL.mode = 'boat'; CAM.yaw = BOAT.head + Math.PI; }
  else if (d.pos) placePlayer(d.pos.x, d.pos.z, Math.PI);
  else { const H = ISL.home; placePlayer(H.x + H.spawn.x, H.z + H.spawn.z, Math.PI); }
  if (!F.boat) { if (F.taken) placeBoat(ISL.home.x + 3.4, ISL.home.z + 58, Math.PI); else placeBoat(0, 2000, 0); }
  refreshGear();
}

// ================================================================ prologue (picture book)
const PROLOGUE = [
  { t: 'むかし むかし、 ひろい ひろい うみの まんなかに、 ちいさな しまが ありました。', svg: '<path d="M0 290 Q80 270 160 290 T320 290 T480 290 T640 290 V400 H0Z" fill="#8ab0c0"/><path d="M200 290 Q320 170 440 290Z" fill="#a08a5a"/><path d="M300 210 l0 -50 M300 160 q-30 -10 -40 10 M300 160 q30 -10 40 10 M300 160 q-10 -30 -30 -30 M300 160 q10 -30 30 -30" stroke="#5a4020" stroke-width="6" fill="none"/><circle cx="520" cy="90" r="34" fill="#e8c070"/><path d="M60 330 q20 -12 40 0 M500 340 q20 -12 40 0 M260 360 q20 -12 40 0" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/>' },
  { t: 'その しまでは、 5さいに なった こどもに <b>みどりの ふく</b>を きせる ならわしが ありました。', svg: '<path d="M0 320 H640 V400 H0Z" fill="#a08a5a"/><g transform="translate(320 200)"><circle r="44" fill="#f0d0b0" stroke="#5a4020" stroke-width="5"/><path d="M-46 -10 Q-40 -70 30 -60 L110 30 Q60 -20 40 -20 Z" fill="#5a8a3a" stroke="#5a4020" stroke-width="5"/><circle cx="-14" cy="6" r="7" fill="#3a2a10"/><circle cx="14" cy="6" r="7" fill="#3a2a10"/><path d="M-36 44 L-56 130 H56 L36 44Z" fill="#5a8a3a" stroke="#5a4020" stroke-width="5"/></g>' },
  { t: 'それは むかし、 <b>かぜ</b>と ともに まものを やっつけた <b>ゆうしゃ</b>の ふく。', svg: '<path d="M0 330 H640 V400 H0Z" fill="#8a7a5a"/><g stroke="#5a4020" stroke-width="5" fill="none"><path d="M80 120 q100 -40 180 0 q40 20 20 50 q-30 30 -50 0"/><path d="M100 200 q140 -40 260 0 q40 20 20 50 q-30 30 -50 0"/><path d="M60 260 q120 -30 200 0"/></g><g transform="translate(460 250)"><path d="M0 -150 L12 -20 H-12Z" fill="#c0c0c8" stroke="#5a4020" stroke-width="5"/><rect x="-36" y="-22" width="72" height="12" fill="#a08a5a" stroke="#5a4020" stroke-width="4"/><rect x="-7" y="-10" width="14" height="40" fill="#6a4a2a"/></g><path d="M540 120 q30 -40 60 -10 q20 40 -40 60 q-60 10 -80 -40" fill="#4a3a4a" stroke="#2a1a2a" stroke-width="4"/>' },
  { t: 'そして きょうは…… <b>ふーたんの 5さいの おたんじょうび</b>！', svg: '<rect width="640" height="400" fill="#f6e6bf"/><g transform="translate(320 230)"><rect x="-90" y="-10" width="180" height="70" rx="10" fill="#fff0e0" stroke="#5a4020" stroke-width="5"/><path d="M-90 10 q30 20 60 0 q30 20 60 0 q30 20 60 0" stroke="#e08aa0" stroke-width="10" fill="none"/>' + [-60, -30, 0, 30, 60].map(x => `<rect x="${x - 5}" y="-50" width="10" height="40" fill="#8ab0e0" stroke="#5a4020" stroke-width="3"/><path d="M${x} -70 q8 10 0 18 q-8 -8 0 -18" fill="#ffb020"/>`).join('') + '</g><text x="320" y="110" text-anchor="middle" font-size="54" fill="#c0503a" font-family="Yusei Magic, sans-serif">5</text><g fill="#e8c070"><circle cx="120" cy="90" r="10"/><circle cx="520" cy="120" r="12"/><circle cx="90" cy="300" r="8"/><circle cx="560" cy="300" r="9"/></g>' },
];
function playPrologue() {
  return new Promise(res => {
    const ov = $('#intro'), svg = $('#isvg'), cap = $('#icap'); let i = 0;
    ov.classList.remove('hide'); Audio2.music('title');
    const show = () => { svg.innerHTML = PROLOGUE[i].svg; cap.innerHTML = PROLOGUE[i].t; ov.querySelector('.pg').style.opacity = 0; requestAnimationFrame(() => ov.querySelector('.pg').style.opacity = 1); };
    show();
    const next = () => { Audio2.sfx('click'); i++; if (i >= PROLOGUE.length) { ov.removeEventListener('pointerdown', next); removeEventListener('keydown', key); ov.classList.add('hide'); res(); } else show(); };
    const key = e => { if (/Enter|Space|KeyZ/.test(e.code)) next(); };
    ov.addEventListener('pointerdown', next); addEventListener('keydown', key);
  });
}
async function showEnding() {
  const el = $('#ending');
  const hrs = Math.floor((performance.now() - Game.t0) / 60000);
  $('#endtx').innerHTML = `ふーたんは リッキーを たすけだし、 しまに へいわが もどりました。<br>やっつけた まもの <b>${S.kills}</b>ひき ／ キラキラ <b>${S.rupees}</b>こ<br><br>そのあとも ふーたんは レオンと いっしょに<br>うみの ぼうけんを つづけたのでした。`;
  el.classList.remove('hide'); Audio2.fanfare('big');
  await new Promise(r => { $('#endB').onclick = () => { el.classList.add('hide'); r(); }; });
}

// ================================================================ game flow
const Game = { state: 'title', t0: performance.now() };
function initWorld() {
  buildIslands();
  // island outline polygons for the chart
  for (const I of Islands) { I.poly = []; for (let i = 0; i < 48; i++) { const a = i / 48 * TAU; const r = shoreRadius(I, a) || 0; I.poly.push([Math.cos(a) * r, Math.sin(a) * r]); } if (I.id === 'tower') I.poly = Array.from({ length: 24 }, (_, i) => [Math.cos(i / 24 * TAU) * 11, Math.sin(i / 24 * TAU) * 11]); }
  initPlayer();
  spawnActors();
  Race.build(); StormFx.build(); Lights.build();
  // fortress top gate
  Puzzle.fortGate = stoneGate(ISL.fortress, 15, -22.2, Math.atan2(10, 14), 6.8);
  // pearl on stump
  const pg = Puzzle.pearlG; Puzzle.pearlMeshG = pearlMesh(0x5df05a, 0.5); Puzzle.pearlMeshG.position.set(pg.I.x + pg.x, pg.y + 1.2, pg.I.z + pg.z); scene.add(Puzzle.pearlMeshG);
  beacon = lightPillar(0xfff2a0, 3, 160); beacon.visible = false;
  spawnAmbient();
  setOutfit(PL.P, 'hero');
}
function startGame(cont) {
  $('#title').classList.add('hide'); $('#back').classList.add('hide');
  Game.state = 'play'; $('#hud').classList.remove('hide'); $('#tc').classList.remove('hide');
  if (isTouch) $('#keys').classList.add('hide');
  const d = cont && loadSave();
  if (d) { applySave(d); applyPuzzleState(); if (F.tower) StormFx.clear = 1; setObjective(); Audio2.music(PL.mode === 'boat' ? 'sea' : 'island'); camFollow(); toast('つづきから はじめるよ！'); }
  else {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
    setOutfit(PL.P, S.outfit);
    applyPuzzleState(); placeBoat(0, 2000, 0);
    playPrologue().then(() => { introScene(); });
  }
}
$('#bNew').addEventListener('click', () => { Audio2.unlock(); startGame(false); });
$('#bCont').addEventListener('click', () => { Audio2.unlock(); startGame(true); });

// ---------- per-frame island bookkeeping: names, music
function updateIslandState(dt) {
  const c = PL.mode === 'boat' ? BOAT.pos : PL.pos;
  const I = islandAt(c.x, c.z);
  for (const J of Islands) { const d = Math.hypot(camera.position.x - J.x, camera.position.z - J.z); J.group.visible = d < 1100; if (!S.seen[J.id] && Math.hypot(c.x - J.x, c.z - J.z) < J.R + 160 && J.name) { S.seen[J.id] = 1; } }
  if (I && I.name && Story.areaShown !== I.id && !Story.cut) { Story.areaShown = I.id; if (PL.mode === 'foot' || Math.hypot(c.x - I.x, c.z - I.z) < I.R) areaBanner(I); }
  if (!I && PL.mode === 'boat' && Story.areaShown && Math.hypot(c.x - ISL[Story.areaShown].x, c.z - ISL[Story.areaShown].z) > ISL[Story.areaShown].R + 60) Story.areaShown = null;
  if (Story.cut || Race.on || Boss.on || Game.state !== 'play') return;
  let m = 'sea';
  if (PL.mode === 'foot') { const id = PL.island && PL.island.id; m = id === 'forest' ? 'forest' : id === 'fire' ? 'fire' : id === 'whale' ? 'whale' : id === 'fortress' ? 'fortress' : id === 'tower' ? 'tower' : 'island'; }
  else if (I && I.id === 'tower' && F.tower) m = 'tower';
  if (Audio2.current() !== m) Audio2.music(m);
}

// ================================================================ main loop
let last = performance.now(), saveT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (Chart.open) { renderer.render(scene, camera); return; }
  step(dt);
  renderer.render(scene, camera);
}
function step(dt) {
  World.t += dt;
  pollInput();
  tickTimers(dt);
  if (Story.dlg && (Input.pressed.A || Input.pressed.B)) Story.dlg.adv();
  if (Input.anyTap && Story.dlg) Story.dlg.adv();
  Input.anyTap = false;
  const playing = Game.state === 'play';
  const ctl = playing && !Story.cut && !Story.dlg && !Story.talking && !Song.isOpen;
  // actions
  let act = null;
  if (ctl) {
    act = findAction();
    if (Input.pressed.A && act) {
      if (act.attack) act.fn();
      else { Story.talking = true; Promise.resolve(act.fn()).finally(() => { Story.talking = false; }); }
    }
    if (Input.pressed.B) {
      if (PL.mode === 'foot' && PL.onGround && !PL.swim && !PL.hold) { PL.vy = 10.5; PL.onGround = false; Audio2.sfx('jump'); }
      else if (PL.mode === 'boat' && !BOAT.hop) { BOAT.hop = true; BOAT.vy = 11; Audio2.sfx('jump'); }
    }
    if (Input.pressed.Y) {
      if (PL.mode === 'foot' && S.items.leaf && !PL.swim) {
        if (!PL.onGround) { if (PL.glide) PL.glide = false; else if (PL.magic > 0.05) { PL.glide = true; PL.vy = Math.max(PL.vy, -1); Audio2.sfx('gust'); } }
        else gust();
      } else if (S.items.baton) Song.open(false);
    }
  }
  // labels
  if (playing) {
    setBtn('A', act ? act.label : '', !act);
    setBtn('B', PL.mode === 'boat' ? 'ジャンプ' : PL.swim ? '' : 'ジャンプ', PL.swim);
    let y = ''; if (PL.mode === 'foot' && S.items.leaf && !PL.swim) y = PL.onGround ? 'うちわ' : PL.glide ? 'やめる' : 'ふんわり'; else if (S.items.baton) y = 'タクト';
    setBtn('Y', y, !y);
    $('#bA').classList.toggle('pulse', !!act && !act.attack && act.label !== 'きる');
  }
  // updates
  if (playing) {
    if (PL.mode === 'foot') footUpdate(dt, ctl);
    if (PL.mode === 'boat' || BOAT.auto) boatUpdate(dt, ctl && PL.mode === 'boat');
    else { BOAT.P.g.position.y = waveH(BOAT.pos.x, BOAT.pos.z) * 0.8; BOAT.P.g.position.x = BOAT.pos.x; BOAT.P.g.position.z = BOAT.pos.z; BOAT.P.g.rotation.set(Math.sin(World.t * 1.3) * 0.04, BOAT.head, Math.sin(World.t * 1.1) * 0.05); animBoat(BOAT.P, dt, 0, Story.talker === 'leon'); Audio2.setWind(0); }
    refreshGear();
    Enemies.update(dt); Pickups.update(dt); updateNPCs(dt); animKoroks(dt);
    updateBlock(dt); Race.update(dt); Boss.update(dt); StormFx.update(dt); Lights.update(dt);
    checkTriggers(dt); updateAmbient(dt); updateIslandState(dt); updateBeacon();
    HUD.update(); drawWind();
    Story.objT = (Story.objT || 0) + dt; if (Story.objT > 0.5) { Story.objT = 0; if (!Story.training) setObjective(); }
    saveT += dt; if (saveT > 10 && !Story.cut) { saveT = 0; saveGame(); }
  } else {
    // title: orbit the boat on the sea
    const a = World.t * 0.08;
    BOAT.pos.set(Math.sin(World.t * 0.1) * 6, 0, 90); BOAT.head = Math.PI + 0.25;
    BOAT.P.g.position.set(BOAT.pos.x, waveH(BOAT.pos.x, BOAT.pos.z) * 0.8, BOAT.pos.z); BOAT.P.g.rotation.set(Math.sin(World.t * 1.3) * 0.05, BOAT.head, Math.sin(World.t) * 0.05);
    animBoat(BOAT.P, dt, 1, false);
    PL.P.g.position.set(BOAT.pos.x - Math.sin(BOAT.head) * 0.9, BOAT.P.g.position.y + 0.5, BOAT.pos.z - Math.cos(BOAT.head) * 0.9); PL.P.g.rotation.y = a + 0.35; PL.P.g.position.y += 0.15; PL.P.baton.visible = true; PL.P.sword.visible = false; animFutan(PL.P, { conduct: true }, dt); PL.P.shadow.visible = false;
    camCut(BOAT.pos.x + Math.sin(a) * 10.5, 3.6 + Math.sin(World.t * 0.2) * 0.6, BOAT.pos.z + Math.cos(a) * 10.5, BOAT.pos.x, 2.9, BOAT.pos.z, 2, Game.firstTitle !== false); Game.firstTitle = false;
    World.wind.dir = BOAT.head; updateAmbient(dt); Enemies.update(dt);
  }
  updateCamera(dt);
  FX.update(dt);
  applyMood(dt);
  seaMat.uniforms.time.value = World.t;
  sea.position.set(Math.round(camera.position.x / 20) * 20, 0, Math.round(camera.position.z / 20) * 20);
  sky.position.copy(camera.position);
  const sd = new V3(0.45, 0.55, -0.7).normalize(); sunSpr.position.copy(camera.position).addScaledVector(sd, 1500);
  updateWind(dt, PL.mode === 'boat' ? BOAT.pos : PL.pos, playing ? (PL.mode === 'boat' ? 0.9 : 0.25) : 0.6);
}

// ================================================================ boot
initWorld();
setMood('day', true);
if (loadSave() && loadSave().flags && loadSave().flags.clothes) $('#bCont').classList.remove('hide');
$('#title').classList.remove('hide');
if (isTouch) $('#keys').classList.add('hide');
requestAnimationFrame(frame);
// debug helpers
if (DEBUG) {
  window.DBG = { Song, S, F, PL, BOAT, ISL, Story, Boss, Enemies, CAM, Puzzle, Race, World,
    warp(id, foot = true) { const I = ISL[id]; if (foot) { PL.mode = 'foot'; placePlayer(I.x + (I.spawn ? I.spawn.x : 0), I.z + (I.spawn ? I.spawn.z : I.R + 5), Math.PI); } else { PL.mode = 'boat'; const d = I.dock || { x: 0, z: I.R + 10 }; placeBoat(I.x + d.x, I.z + d.z + 12, Math.PI); } refreshGear(); camFollow(); },
    async sim(sec, keys) { const n = Math.round(sec * 30); for (let i = 0; i < n; i++) { if (keys) Object.assign(Input.keys, keys); step(1 / 30); for (let k = 0; k < 12; k++) await null; } if (keys) for (const k in keys) Input.keys[k] = 0; },
    async press(k) { Input.keys[k] = 1; step(1 / 30); for (let j = 0; j < 12; j++) await null; Input.keys[k] = 0; step(1 / 30); for (let j = 0; j < 12; j++) await null; },
    async talk(n, gap = 0.5) { for (let i = 0; i < n; i++) { await this.press('KeyZ'); await this.sim(gap); } },
    obj() { return document.querySelector('#obj').textContent; }, dlg() { return document.querySelector('#dlg').classList.contains('hide') ? '' : document.querySelector('#dlg .tx').textContent; },
    give() { Object.assign(S.items, { sword: 1, shield: 1, baton: 1, leaf: 1 }); Object.assign(F, { start: 1, clothes: 1, sword: 1, taken: 1, boat: 1 }); S.outfit = 'hero'; setOutfit(PL.P, 'hero'); placeBoat(ISL.home.x + 3.4, ISL.home.z + 58, Math.PI); refreshGear(); setObjective(); },
  };
}
