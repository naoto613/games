// ================================================================ LMBS battle
const battleScene = new THREE.Scene();
const bSky = makeSky(battleScene);
const ARENA_R = 15.5;
const GRAV = 24;
const _v1 = new V3(), _v2 = new V3(), _v3 = new V3();
const FS_COL = { red: 0xff4a4a, blue: 0x4a9aff, green: 0x5aff7a };

function buildArena(area) {
  const g = new THREE.Group(); battleScene.add(g);
  const preset = { town: 'town', field: 'field', forest: 'forest', ruins: 'ruins', altar: 'ruins' }[area] || 'field';
  bSky.set(SKY[preset]);
  const upd = [];
  const nz = makeNoise(area.length * 7 + 3);
  const hf = (x, z) => { const d = Math.hypot(x, z); return d < 20 ? 0 : (d - 20) * (area === 'forest' ? 0.12 : area === 'ruins' || area === 'altar' ? 0.02 : 0.18) * (0.6 + nz(x * 0.05, z * 0.05) * 0.8); };
  if (area === 'town') {
    makeTerrain(g, 160, 64, () => 0, (x, z, c) => c.setRGB(0.95, 0.9, 0.84).multiplyScalar(0.92 + nz(x * .1, z * .1) * 0.12), TEX.cobble, 60);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + 0.2, r = rnd(25, 30); house(g, Math.cos(a) * r, Math.sin(a) * r, rnd(6, 8), rnd(5, 6), rnd(5, 7), -a - Math.PI / 2); }
    upd.push(barrierRings(g, 0, 80, -60, 110, 3));
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; const l = mk(G.cyl(0.08, 0.1, 3.2, 6), 0x3a3a40, 0.02); l.position.set(Math.cos(a) * 19, 1.6, Math.sin(a) * 19); g.add(l); const lp = new THREE.Mesh(G.sph(0.25, 8, 6), BM(0xffe8a0)); lp.position.set(Math.cos(a) * 19, 3.3, Math.sin(a) * 19); g.add(lp); }
  } else if (area === 'field') {
    makeTerrain(g, 220, 80, hf, (x, z, c) => { const n = nz(x * .06, z * .06); c.setRGB(0.42 + n * 0.2, 0.68 + n * 0.12, 0.3); }, TEX.grass, 50);
    const tl = []; for (let i = 0; i < 40; i++) { const a = rnd(0, TAU), r = rnd(24, 60); tl.push([Math.cos(a) * r, hf(Math.cos(a) * r, Math.sin(a) * r), Math.sin(a) * r, rnd(1, 1.6)]); }
    trees(g, tl);
    const rl = []; for (let i = 0; i < 16; i++) { const a = rnd(0, TAU), r = rnd(19, 40); rl.push([Math.cos(a) * r, hf(Math.cos(a) * r, Math.sin(a) * r), Math.sin(a) * r, rnd(0.6, 1.8)]); } rocks(g, rl);
    grassField(g, 7000, () => { const a = rnd(0, TAU), r = Math.sqrt(Math.random()) * 34; return [Math.cos(a) * r, hf(Math.cos(a) * r, Math.sin(a) * r), Math.sin(a) * r]; });
    const fl = []; for (let i = 0; i < 160; i++) { const a = rnd(0, TAU), r = rnd(2, 30); fl.push([Math.cos(a) * r, 0, Math.sin(a) * r]); } flowers(g, fl);
  } else if (area === 'forest') {
    makeTerrain(g, 200, 70, hf, (x, z, c) => { const n = nz(x * .08, z * .08); c.setRGB(0.3 + n * 0.12, 0.5 + n * 0.12, 0.3); }, TEX.grass, 50);
    const tl = []; for (let i = 0; i < 70; i++) { const a = rnd(0, TAU), r = rnd(20, 50); tl.push([Math.cos(a) * r, hf(Math.cos(a) * r, Math.sin(a) * r), Math.sin(a) * r, rnd(1.5, 2.6)]); }
    trees(g, tl, [0x2f7a4a, 0x3a8a50, 0x4a9a58, 0x2a6a5a], 0x5a4030);
    grassField(g, 5000, () => { const a = rnd(0, TAU), r = Math.sqrt(Math.random()) * 26; return [Math.cos(a) * r, 0, Math.sin(a) * r]; }, 0x2a6a3a, 0x7ac080);
    upd.push(motes(g, 80, 0, 0, 20, 0.5, 6));
    for (let i = 0; i < 6; i++) lightShaft(g, rnd(-14, 14), 0, rnd(-14, 14), 30, rnd(2, 4));
    for (let i = 0; i < 10; i++) { const a = rnd(0, TAU), r = rnd(17, 22); const m = mushroom(g, Math.cos(a) * r, 0, Math.sin(a) * r, rnd(1, 2.5)); }
  } else {
    makeTerrain(g, 200, 60, hf, (x, z, c) => c.setRGB(0.9, 0.86, 0.92).multiplyScalar(0.85 + nz(x * .1, z * .1) * 0.2), TEX.tiles, 80);
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 19; const h = Math.random() < 0.3 ? rnd(2, 4) : rnd(7, 10); const p = mk(GEO.pillar, 0, 0.04, TM(0xd8d0e0, { map: TEX.stone })); p.scale.set(1, h, 1); p.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); g.add(p); if (h > 6) { const cap = mk(G.box(2, 0.5, 2), 0, 0.04, TM(0xc8c0d0, { map: TEX.stone })); cap.position.set(Math.cos(a) * r, h + 0.25, Math.sin(a) * r); g.add(cap); } }
    const rune = new THREE.Mesh(new THREE.RingGeometry(12, 13.5, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xb080ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
    rune.position.y = 0.04; g.add(rune);
    const c2 = new THREE.Mesh(new THREE.CircleGeometry(9, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: TEX.circle, color: 0x9a70ff, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
    c2.position.y = 0.05; g.add(c2); upd.push({ update(dt) { c2.rotation.y += dt * 0.05; } });
    if (area === 'altar') { const core = astraCore(g, 0, 14, -30, 4); upd.push(core); upd.push(barrierRings(g, 0, 14, -30, 10, 2)); }
    upd.push(motes(g, 60, 0, 0, 18, 0.5, 8, 0xc8a0ff));
  }
  return { g, update(dt) { for (const u of upd) u.update(dt); grassUniform.value += dt; } };
}
function mushroom(parent, x, y, z, s) {
  const st = mk(G.cyl(0.15 * s, 0.22 * s, 0.9 * s, 8), 0xf0e8d0, 0.03); st.position.set(x, y + 0.45 * s, z); parent.add(st);
  const cap = mk(G.sph(0.6 * s, 14, 8), 0, 0.03, new THREE.MeshToonMaterial({ color: 0x6ad0ff, gradientMap: gradTex, emissive: 0x2a8aff, emissiveIntensity: 0.4 })); cap.scale.y = 0.5; cap.position.set(x, y + 0.95 * s, z); parent.add(cap);
  return cap;
}
function astraCore(parent, x, y, z, s) {
  const g = grp(parent, x, y, z);
  const c = new THREE.Mesh(new THREE.OctahedronGeometry(s), new THREE.MeshToonMaterial({ color: 0x8ad8ff, gradientMap: gradTex, emissive: 0x3a8aff, emissiveIntensity: 0.6, transparent: true, opacity: 0.92 }));
  c.scale.y = 1.6; g.add(c);
  const gl = glowSprite(0x6ab8ff, s * 6); g.add(gl);
  let t = 0;
  return { g, c, update(dt) { t += dt; c.rotation.y += dt * 0.4; g.position.y = y + Math.sin(t) * 0.5; gl.material.opacity = 0.6 + Math.sin(t * 2) * 0.2; } };
}

// ---------------------------------------------------------------- fighters
function mkFighter(o) {
  const model = makeModel(o.model);
  battleScene.add(model.root);
  const f = Object.assign({
    pos: new V3(o.x || 0, 0, o.z || 0), vy: 0, air: false, face: o.face || 0, knock: new V3(), state: 'idle', act: null, stun: 0, inv: 0, down: 0,
    target: null, chain: { stage: 0, count: 0, prevTier: '' }, guard: false, ai: { t: rnd(0.5, 1.5), cd: rnd(0.8, 2), tgtT: 0 }, flash: 0, dead: false, deadT: 0,
    model, speed: 0, buffer: null, fsReady: 0, fsG: 0, fsMax: 0, poise: 0, poiseMax: 0, castInfo: null, hitCount: 0, lastHurt: 0,
  }, o);
  f.mkind = o.model; f.model = model;
  return f;
}

const Battle = {
  on: false, fighters: [], allies: [], enemies: [], projs: [], player: null, t: 0, ts: 1, stop: 0, shake: 0,
  combo: { hits: 0, dmg: 0, t: 0, max: 0 }, ol: { g: 0, on: false, t: 0, shown: false }, special: null, cfg: null, arena: null,
  cam: { pos: new V3(), look: new V3(), side: 1, intro: 0 }, end: null, stats: null, paused: false, tipShown: {},
};

Battle.start = function (cfg) {
  const B = Battle;
  B.cfg = cfg; B.on = true; B.t = 0; B.ts = 1; B.stop = 0; B.shake = 0; B.special = null; B.end = null; B.paused = false;
  B.combo = { hits: 0, dmg: 0, t: 0, max: 0 }; B.ol.on = false; B.ol.t = 0;
  B.stats = { fs: 0, dmgTaken: 0, maxCombo: 0, kills: 0, time: 0 };
  B.snapshot = JSON.stringify(S.chars);
  FX.init(battleScene); FX.clear(); DMG.clear();
  if (B.arena) { battleScene.remove(B.arena.g); }
  B.arena = buildArena(cfg.area || 'field');
  B.fighters = []; B.allies = []; B.enemies = []; B.projs = [];
  // allies
  S.party.forEach((id, i) => {
    const c = S.chars[id];
    const f = mkFighter({ id, name: PARTY_DEF[id].name, team: 'ally', model: id, x: -6 - (i === 0 ? 0 : 1.5), z: (i === 0 ? 0 : i === 1 ? 2.6 : -2.6), face: Math.PI / 2, rad: 0.45, h: 1.7, c, spd: 6.4, role: PARTY_DEF[id].role });
    Object.defineProperty(f, 'hp', { get: () => c.hp, set: v => c.hp = v });
    Object.defineProperty(f, 'tp', { get: () => c.tp, set: v => c.tp = v });
    f.mhp = c.mhp; f.mtp = c.mtp; f.atk = c.atk; f.def = c.def; f.mat = c.mat; f.mdef = c.mdef; f.lv = c.lv;
    if (c.hp <= 0) { f.dead = true; f.state = 'dead'; }
    if (id === 'sieg') { f.trail = FX.trail(v => f.model.m.tip.getWorldPosition(v), v => f.model.m.base.getWorldPosition(v), 0x8ab8ff, 12); f.trail.on = false; B.player = f; }
    if (id === 'lucia') { f.trail = FX.trail(v => f.model.m.tip.getWorldPosition(v), v => f.model.m.base.getWorldPosition(v), 0xffb0d0, 10); f.trail.on = false; }
    B.fighters.push(f); B.allies.push(f);
  });
  // enemies
  const n = cfg.enemies.length;
  cfg.enemies.forEach((k, i) => {
    const d = ENEMY[k];
    const z = n === 1 ? 0 : lerp(-3.5, 3.5, i / (n - 1));
    const f = mkFighter({ id: k + i, key: k, name: d.name, team: 'enemy', model: d.model, x: 6 + (i % 2) * 1.5 + (d.boss ? 2 : 0), z, face: -Math.PI / 2, rad: d.rad, h: d.h, d, hp: d.hp, mhp: d.hp, atk: d.atk, def: d.def, mat: d.atk, mdef: d.mdef, spd: d.spd, boss: !!d.boss });
    f.fsMax = f.fsG = d.boss ? 140 : 40 + d.hp * 0.04; f.fsCol = d.fs;
    f.poiseMax = f.poise = (d.armor || 0) * 7;
    f.fsMark = new THREE.Sprite(new THREE.SpriteMaterial({ map: FX.starTex, color: FS_COL[d.fs], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    f.fsMark.visible = false; battleScene.add(f.fsMark);
    if (d.model === 'soldier' || d.model === 'assassin' || d.model === 'garmo') f.isHuman = true;
    B.fighters.push(f); B.enemies.push(f);
  });
  for (const f of B.fighters) syncModel(f, 0);
  B.player.target = B.enemies[0];
  // camera intro
  B.cam.intro = 1.4; B.cam.side = 1;
  B.cam.pos.set(14, 6, 18); B.cam.look.set(0, 1, 0);
  buildPartyHud();
  $('#bhud').classList.remove('hide'); $('#fhud').classList.add('hide');
  setTouchMode('battle');
  Audio2.play(cfg.music || (cfg.boss ? 'boss' : 'battle'));
  if (cfg.onStart) cfg.onStart();
};
function syncModel(f, dt) {
  const r = f.model.root;
  r.position.copy(f.pos); r.rotation.y = f.face;
  if (f.spinY) r.rotation.y += f.spinY;
  const loco = { speed: f.speed, air: f.air, vy: f.vy, battle: true, down: f.down > 0 || f.state === 'dead', groundY: 0 };
  f.model.update(dt, loco);
  // hit flash
  if (f.flash > 0) { f.flash -= dt; r.position.x += Math.sin(f.flash * 120) * 0.04; }
}

// ---------------------------------------------------------------- helpers
const alive = arr => arr.filter(f => !f.dead);
const hdist = (a, b) => Math.hypot(a.pos.x - b.pos.x, a.pos.z - b.pos.z);
function faceTo(f, t) { f.face = Math.atan2(t.pos.x - f.pos.x, t.pos.z - f.pos.z); }
function fwd(f) { return _v3.set(Math.sin(f.face), 0, Math.cos(f.face)); }
function nearest(f, list) { let b = null, bd = 1e9; for (const e of list) if (!e.dead) { const d = hdist(f, e); if (d < bd) { bd = d; b = e; } } return b; }
function arteName(text, ally) {
  const el = ally ? $('#arteName2') : $('#arteName');
  el.textContent = text; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), ally ? 1100 : 1300);
}
function banner(text) { const b = $('#banner'); b.textContent = text; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); }
function flashScreen(a = 0.7, col = '#fff') { const f = $('#flash'); f.style.background = col; f.style.transition = 'none'; f.style.opacity = a; requestAnimationFrame(() => { f.style.transition = 'opacity .45s'; f.style.opacity = 0; }); }
function partyOf(f) { return f.team === 'ally' ? Battle.allies : Battle.enemies; }
function foesOf(f) { return f.team === 'ally' ? Battle.enemies : Battle.allies; }

// ---------------------------------------------------------------- actions (player / ally melee)
function startAct(f, def, kind, extra) {
  f.act = Object.assign({ def, kind, t: 0, done: new Set(), dur: def.dur, cancel: def.cancel || def.dur * 0.7, tier: def.tier || 'normal', landed: false }, extra || {});
  f.state = 'act';
  if (def.clip && CLIPS[def.clip]) f.model.play(CLIPS[def.clip]);
  if (f.trail) f.trail.on = true;
  if (def.jump && !f.air) { f.act.jumpAt = def.jump[0]; }
  if (def.dive && f.air) { f.vy = -def.dive * 0.25; }
  if (def.clip === 'spin' || def.clip === 'waltz' || def.clip === 'skySpin') f.act.spin = def.clip === 'waltz' ? 3 : 2;
}
function endAct(f) {
  f.act = null; f.state = 'idle'; f.spinY = 0;
  if (f.trail) f.trail.on = false;
}
function tickAct(f, dt) {
  const a = f.act, d = a.def; a.t += dt;
  // spin
  if (a.spin) f.spinY = clamp(a.t / (d.dur * 0.65), 0, 1) * TAU * a.spin;
  // lunge
  if (d.lunge && a.t >= d.lunge[0] && a.t <= d.lunge[1]) {
    const tg = f.target; const sp = d.lunge[2];
    if (!tg || tg.dead || hdist(f, tg) > f.rad + tg.rad + 0.9) { const fw = fwd(f); f.pos.x += fw.x * sp * dt; f.pos.z += fw.z * sp * dt; }
  }
  if (a.jumpAt != null && a.t >= a.jumpAt && !a.jumped) { a.jumped = true; f.vy = d.jump[1]; f.air = true; }
  if (d.slam && a.t >= d.slam && !a.slammed && f.air) { a.slammed = true; f.vy = -22; }
  if (d.dive && f.air) { const fw = fwd(f); f.pos.x += fw.x * 7 * dt; f.pos.z += fw.z * 7 * dt; f.vy = Math.min(f.vy, -d.dive); }
  // air float during air attacks
  if (f.air && a.kind === 'atk' && f.vy < 0) f.vy = Math.max(f.vy, -3);
  if (f.air && a.kind === 'arte' && d.hits && d.hits.some(h => h.y) && !a.slammed && f.vy < 0) f.vy = Math.max(f.vy, -2);
  // hits
  if (d.hits) d.hits.forEach((h, i) => {
    if (a.done.has(i)) return;
    if (h.onLand) { if (a.landed || (!f.air && a.t > 0.05 && !d.dive && !d.slam)) { a.done.add(i); doHit(f, h, a); } return; }
    if (a.t >= h.t) { a.done.add(i); doHit(f, h, a); }
  });
  if (d.proj) d.proj.forEach((p, i) => { if (!a.done.has('p' + i) && a.t >= p.t) { a.done.add('p' + i); spawnProj(f, p); } });
  if (a.t >= a.dur || (d.dive && !f.air && a.t > 0.12 && a.done.size === d.hits.length && a.t > 0.3)) endAct(f);
}
function doHit(att, h, act) {
  const foes = foesOf(att); let any = false;
  const fw = fwd(att).clone();
  const origin = att.pos;
  for (const t of foes) {
    if (t.dead || t.inv > 0) continue;
    const dx = t.pos.x - origin.x, dz = t.pos.z - origin.z, d = Math.hypot(dx, dz);
    const dy = t.pos.y - att.pos.y;
    if (Math.abs(dy) > (h.y ? 3 : 1.4) + t.h * 0.5) continue;
    if (h.aoe) { if (d > h.aoe + t.rad) continue; }
    else {
      if (d > (h.r || 1.8) + t.rad) continue;
      if (d > 0.3) { const dot = (dx * fw.x + dz * fw.z) / d; if (dot < Math.cos(h.arc || 0.8)) continue; }
    }
    any = true;
    damage(att, t, h, { phys: true, arte: act && act.kind !== 'atk', act });
    if (h.fx === 'ring' || h.fx === 'burst') FX.shock(t.pos.clone().setY(0), 0x8ab8ff, 3, 0.4);
  }
  if (h.fx === 'ring' && !any) FX.shock(att.pos.clone().setY(0), 0x8ab8ff, h.aoe || 3, 0.4);
  if (h.onLand) { Audio2.sfx('land'); Battle.shake = Math.max(Battle.shake, 0.25); }
  return any;
}
function calcDmg(att, t, mult, magic) {
  const a = magic ? att.mat : att.atk, df = magic ? t.mdef : t.def;
  let d = a * mult * rnd(0.92, 1.08) - df * 0.5;
  d = Math.max(1 + Math.random() * 3, d);
  let crit = Math.random() < (magic ? 0.03 : 0.07);
  if (crit) d *= 1.5;
  return { d: Math.round(d), crit };
}
function damage(att, t, h, o = {}) {
  const B = Battle;
  if (t.dead) return;
  let { d, crit } = calcDmg(att, t, h.dmg || 1, o.magic);
  if (o.fixed) { d = o.fixed; crit = false; }
  const fromDir = _v1.set(att.pos.x - t.pos.x, 0, att.pos.z - t.pos.z).normalize();
  const tf = fwd(t);
  let guarded = false;
  // guard
  if (!o.unblockable && ((t.state === 'guard') || (t.d && t.d.guard && t.stun <= 0 && !t.air && t.state !== 'act' && Math.random() < t.d.guard)) && fromDir.dot(tf) > 0.2) {
    guarded = true; d = Math.max(1, Math.round(d * (t.team === 'ally' ? 0.12 : 0.2)));
    Audio2.sfx('guard'); FX.spark(t.pos.clone().add(new V3(fromDir.x * 0.5, 1.1, fromDir.z * 0.5)), 0xffffff, 6, 5, 0.25);
    DMG.add('GUARD', t.pos.clone().setY(t.pos.y + t.h + 0.2), 'small');
    if (t.team === 'ally') { B.ol.g = Math.min(100, B.ol.g + 1.5); t.knock.addScaledVector(fromDir, -2); }
  }
  t.hp = Math.max(0, t.hp - d);
  const hp = t.pos.clone(); hp.y += t.h * 0.6;
  DMG.add(String(d), hp.clone().setY(hp.y + 0.4), (crit ? 'crit ' : '') + (t.team === 'ally' ? 'ally' : ''));
  if (crit) DMG.add('CRITICAL!', hp.clone().setY(hp.y + 1.0), 'small');
  if (!guarded) {
    FX.spark(hp.clone().addScaledVector(fromDir, t.rad * 0.6), o.magic ? 0xffd080 : (t.team === 'ally' ? 0xff8a6a : 0xbfe0ff), crit ? 16 : 9, 8, crit ? 0.5 : 0.35);
    Audio2.sfx(crit ? 'crit' : (h.kb > 4 || h.lift ? 'hitHeavy' : 'hit'));
    t.flash = 0.15; t.lastHurt = B.t;
    // stagger
    const armored = (t.poiseMax > 0 && t.poise > 0) || (t.team === 'ally' && t === B.player && B.ol.on) || (t.special);
    if (t.poiseMax > 0) { t.poise -= (h.stun || 0.4) * 2.5 + (o.arte ? 1 : 0); if (t.poise <= 0 && !t.broken) { t.broken = 1; DMG.add('BREAK', hp.clone().setY(hp.y + 1.2), 'small'); } }
    if (!armored || t.broken) {
      t.stun = Math.max(t.stun, (h.stun || 0.35) * (t.boss ? 0.6 : 1));
      if (t.casting) interruptCast(t);
      if (t.act && t.team === 'enemy') { t.act = null; t.state = 'idle'; }
      if (t.act && t.team === 'ally' && t !== B.player) endAct(t);
      if (t === B.player && t.act) endAct(t);
      if (t.state === 'guard') t.state = 'idle';
      if (t.model.type === 'human') t.model.play(CLIPS.hurt); else t.model.act('hurt', 0.35);
      const kb = (h.kb || 1) * (t.boss ? 0.25 : 1);
      t.knock.addScaledVector(fromDir, -kb);
      if (h.lift && !t.boss && t.d !== ENEMY.beetle2) { t.vy = h.lift; t.air = true; }
      else if (t.air && !t.boss) t.vy = Math.max(t.vy, 2.5);
    }
    if (t.broken && t.poise <= -6) { t.broken = 0; t.poise = t.poiseMax; }
  }
  // FS gauge
  if (t.team === 'enemy' && att.team === 'ally' && !t.dead) {
    const mag = (o.arte || o.magic ? 6 : 3) * (h.fs && h.fs === t.fsCol ? 2 : 1);
    t.fsG -= mag; t.fsLast = B.t;
    if (t.fsG <= 0 && !t.fsReady && t.hp > 0) {
      t.fsReady = 2.6; t.stun = Math.max(t.stun, 1.0); t.fsG = 0;
      if (!B.tipShown.fs && S.flags.tutFS !== 1) { B.tipShown.fs = 1; S.flags.tutFS = 1; showTip('FATAL STRIKE', `敵の頭上に<b style="color:#ffd27a">★</b>が光ったら <kbd>${keyLabel('fs')}</kbd> で<b>フェイタルストライク</b>！<br>通常の敵は一撃で倒せる。色の合った術技で攻めるとゲージが早く削れる。`, 6000); }
    }
  }
  // combo / OL / TP
  if (att.team === 'ally' && t.team === 'enemy') {
    B.combo.hits++; B.combo.dmg += d; B.combo.t = 1.4;
    B.combo.max = Math.max(B.combo.max, B.combo.hits); B.stats.maxCombo = B.combo.max;
    comboHud(true);
    if (!B.ol.on) B.ol.g = Math.min(100, B.ol.g + (att === B.player ? 1.1 : 0.45));
    if (att === B.player && !o.arte && !o.magic) att.tp = Math.min(att.mtp, att.tp + 1);
    if (att === B.player) B.stop = Math.max(B.stop, crit || h.kb > 4 ? 0.07 : 0.04);
  }
  if (t.team === 'ally') { B.stats.dmgTaken += d; if (!B.ol.on) B.ol.g = Math.min(100, B.ol.g + 2); if (t === B.player) B.shake = Math.max(B.shake, 0.18); }
  if (t.hp <= 0) kill(t, att);
}
function kill(t, att) {
  const B = Battle;
  t.dead = true; t.state = 'dead'; t.deadT = 0; t.act = null; t.casting && interruptCast(t); t.fsReady = 0; t.stun = 0;
  if (t.trail) t.trail.on = false;
  if (t.model.type === 'human') t.model.play(CLIPS.hurt); else t.model.act('down', 9);
  Audio2.sfx('down');
  if (t.team === 'enemy') {
    B.stats.kills++;
  } else {
    DMG.add('DOWN', t.pos.clone().setY(2), 'small');
    if (t === B.player) { /* AI keeps fighting */ }
  }
}

// ---------------------------------------------------------------- projectiles
function spawnProj(f, p) {
  const fw = fwd(f).clone();
  const pr = { owner: f, team: f.team, kind: p.kind, pos: f.pos.clone().addScaledVector(fw, 0.8), vel: fw.clone().multiplyScalar(p.speed), life: p.life, t: 0, hit: new Set(), p, rad: (p.big || 1) * 0.9 };
  pr.pos.y = f.air ? f.pos.y : 0;
  if (p.kind === 'wave') { pr.mesh = FX.waveMesh(0x8ab8ff, p.big || 1); Audio2.sfx('wave'); }
  Battle.projs.push(pr);
}
function spawnOrb(f, target, o) {
  // fireballs / seeds
  const from = f.pos.clone(); from.y = (f.h || 1.6) * 0.7 + f.pos.y;
  if (o.offset) from.add(o.offset);
  const to = target.pos.clone(); to.y += target.h * 0.5;
  const vel = to.clone().sub(from).normalize().multiplyScalar(o.speed || 12);
  const pr = { owner: f, team: f.team, kind: o.kind, pos: from, vel, life: 2.5, t: 0, hit: new Set(), p: o, rad: o.rad || 0.6, target, single: true, magic: o.magic, home: o.home };
  pr.mesh = FX.orb(o.color || 0xff8a3a, o.size || 0.7);
  pr.mesh.position.copy(from);
  Battle.projs.push(pr);
}
function updateProjs(dt) {
  const B = Battle;
  for (let i = B.projs.length - 1; i >= 0; i--) {
    const pr = B.projs[i]; pr.t += dt;
    if (pr.home && pr.target && !pr.target.dead) { const to = pr.target.pos.clone(); to.y += pr.target.h * 0.5; const want = to.sub(pr.pos).normalize().multiplyScalar(pr.vel.length()); pr.vel.lerp(want, 1 - Math.exp(-pr.home * dt)); }
    pr.pos.addScaledVector(pr.vel, dt);
    if (pr.mesh) { pr.mesh.position.copy(pr.pos); if (pr.kind === 'wave') pr.mesh.rotation.y = Math.atan2(pr.vel.x, pr.vel.z) + Math.PI / 2; }
    if (pr.kind !== 'wave' && Math.random() < 0.6) FX.particle(pr.pos, { color: pr.p.color || 0xff8a3a, size: 0.5, life: 0.25, vel: new V3(rnd(-1, 1), rnd(0, 1), rnd(-1, 1)) });
    let gone = pr.t >= pr.life || Math.hypot(pr.pos.x, pr.pos.z) > ARENA_R + 6 || (pr.kind !== 'wave' && pr.pos.y < 0);
    for (const t of (pr.team === 'ally' ? B.enemies : B.allies)) {
      if (t.dead || pr.hit.has(t)) continue;
      const d = Math.hypot(t.pos.x - pr.pos.x, t.pos.z - pr.pos.z);
      const dy = pr.kind === 'wave' ? t.pos.y - pr.pos.y : pr.pos.y - (t.pos.y + t.h * 0.5);
      if (d < pr.rad + t.rad && Math.abs(dy) < (pr.kind === 'wave' ? 1.8 : t.h * 0.6 + 0.4)) {
        pr.hit.add(t);
        damage(pr.owner, t, pr.p, { arte: true, magic: pr.magic });
        if (pr.single) { gone = true; FX.spark(pr.pos, pr.p.color || 0xff8a3a, 14, 7, 0.5); if (pr.kind === 'fire') Audio2.sfx('fire', 0.6); break; }
      }
    }
    if (gone) { if (pr.mesh) FX.add({ obj: pr.mesh, life: 0, t: 0 }); if (pr.kind === 'fire' && pr.pos.y <= 0) FX.spark(pr.pos, 0xff8a3a, 10, 6, 0.5); B.projs.splice(i, 1); }
  }
}

// ---------------------------------------------------------------- spells (casting)
function startCast(f, key, target) {
  const sp = SPELLS[key];
  f.casting = { key, sp, t: 0, target, circle: FX.circle(f.pos.clone().setY(0), sp.kind.startsWith('heal') || sp.kind === 'revive' ? 0x7aff9a : sp.elem === 'fire' ? 0xff8a4a : sp.elem === 'ice' ? 0x8ad8ff : sp.elem === 'thunder' ? 0xfff07a : sp.elem === 'earth' ? 0xd8a060 : sp.elem === 'light' ? 0xfff0b0 : 0xd060ff, 1.4) };
  f.state = 'cast';
  if (f.model.type === 'human') f.model.play(f.id === 'lucia' && sp.kind !== 'pillar' ? CLIPS.pray : CLIPS.cast);
  if (f.team === 'ally') f.tp -= sp.tp || 0;
  Audio2.sfx('cast');
  if (f.boss || f.team === 'enemy') arteName(sp.name, true);
}
function interruptCast(f) {
  if (!f.casting) return;
  f.casting.circle.end(); f.casting = null; f.state = 'idle';
  DMG.add('詠唱中断', f.pos.clone().setY(2.2), 'small');
}
function tickCast(f, dt) {
  const c = f.casting; c.t += dt * (Battle.ol.on && f.team === 'ally' ? 1.6 : 1);
  if (Math.random() < 0.4) FX.particle(f.pos.clone().add(new V3(rnd(-1, 1), 0.1, rnd(-1, 1))), { color: 0xffffff, size: 0.25, life: 0.6, vel: new V3(0, 2.5, 0) });
  if (c.t >= c.sp.cast) {
    c.circle.end(); f.casting = null; f.state = 'idle';
    if (f.model.type === 'human') f.model.play(CLIPS.release);
    if (f.team === 'ally') arteName(c.sp.name, true);
    resolveSpell(f, c.sp, c.target);
    f.ai.cd = rnd(0.6, 1.4);
  }
}
function resolveSpell(f, sp, tgt) {
  const B = Battle;
  if (sp.kind === 'heal' || sp.kind === 'healAll' || sp.kind === 'revive') {
    const list = sp.kind === 'healAll' ? alive(B.allies) : [tgt];
    for (const t of list) {
      if (!t) continue;
      if (sp.kind === 'revive') { if (!t.dead) continue; t.dead = false; t.state = 'idle'; t.hp = Math.round(t.mhp * sp.pow); t.down = 0; t.model.play(CLIPS.release); }
      else { if (t.dead) continue; const v = Math.round(t.mhp * sp.pow + f.mat * 1.5); t.hp = Math.min(t.mhp, t.hp + v); DMG.add(String(v), t.pos.clone().setY(t.h + 0.5), 'heal'); }
      FX.ring(t.pos.clone().setY(0), 0x7aff9a, 2, 0.6);
      for (let i = 0; i < 14; i++) FX.particle(t.pos.clone().add(new V3(rnd(-0.8, 0.8), rnd(0, 0.5), rnd(-0.8, 0.8))), { color: 0x9affb0, size: 0.4, life: 0.9, vel: new V3(0, rnd(1.5, 3.5), 0) });
    }
    Audio2.sfx('heal');
    return;
  }
  if (!tgt || tgt.dead) tgt = nearest(f, foesOf(f)); if (!tgt) return;
  const P = tgt.pos.clone().setY(0);
  const area = (r, mult, extra = {}) => { for (const t of foesOf(f)) if (!t.dead && Math.hypot(t.pos.x - P.x, t.pos.z - P.z) < r + t.rad) damage(f, t, Object.assign({ dmg: mult, kb: 2, stun: 0.5, fs: sp.fs }, extra), { magic: true, arte: true }); };
  switch (sp.kind) {
    case 'fireballs': for (let i = 0; i < sp.n; i++) setTimeout(() => { if (Battle.on && !tgt.dead) { spawnOrb(f, tgt, { kind: 'fire', color: f.team === 'enemy' ? 0xc040ff : 0xff7a2a, speed: 14, home: 3, magic: true, dmg: sp.dmg, kb: 2, stun: 0.45, fs: sp.fs, offset: new V3(rnd(-0.8, 0.8), rnd(0, 0.8), rnd(-0.8, 0.8)) }); Audio2.sfx('fire', 0.5); } }, i * 160); break;
    case 'icicle': FX.spikes(P, 0x9ae0ff, 9, 2.6, 2.6, 1.0); Audio2.sfx('ice'); area(2.8, sp.dmg * 0.5, { lift: 7 }); setTimeout(() => Battle.on && area(2.8, sp.dmg * 0.5, { lift: 5 }), 250); break;
    case 'spark': { const o = FX.orb(0xfff07a, 2.5); o.position.copy(P).setY(1.4); FX.add({ obj: o, life: 1.3, t: 0, upd() { o.scale.setScalar(1 + Math.sin(this.t * 40) * 0.1); } }); for (let i = 0; i < sp.n; i++) setTimeout(() => { if (!Battle.on) return; FX.bolt(P.clone().setY(1.4), P.clone().add(new V3(rnd(-2.5, 2.5), rnd(0, 2), rnd(-2.5, 2.5))), 0xfff8b0, 0.08); Audio2.sfx('thunder', 0.4); area(2.6, sp.dmg, { kb: 0.3, stun: 0.5 }); }, i * 180); break; }
    case 'gaia': FX.spikes(P, 0xb08050, 12, 4, 4, 1.4, new THREE.DodecahedronGeometry(0.8, 0).translate(0, 0.5, 0)); Audio2.sfx('rock'); B.shake = 0.5; for (let k = 0; k < 3; k++) setTimeout(() => Battle.on && area(4.2, sp.dmg / 3, { lift: 6 + k * 2 }), k * 220); break;
    case 'pillar': FX.pillar(P, 0xfff0b0, 14, 1.4, 0.9); Audio2.sfx('heal'); Audio2.sfx('thunder', 0.3); for (let k = 0; k < 3; k++) setTimeout(() => Battle.on && area(2.4, sp.dmg / 3, { stun: 0.6 }), k * 150); break;
    case 'bolt': setTimeout(() => { if (!Battle.on) return; FX.bolt(P.clone().setY(16), P.clone().setY(0), 0xd8a0ff, 0.3); FX.bolt(P.clone().setY(16).add(new V3(1, 0, 0)), P.clone().setY(0), 0xffffff, 0.12); FX.shock(P, 0xd8a0ff, 3, 0.4); flashScreen(0.35, '#e0c8ff'); Audio2.sfx('thunder'); area(2.6, sp.dmg, { kb: 4, stun: 0.6 }); }, 250); FX.ring(P, 0xff4060, 2.6, 0.3); break;
    case 'nova': { const o = FX.orb(0x9a30ff, 6); o.position.copy(P).setY(1.5); FX.add({ obj: o, life: 1.2, t: 0, upd() { o.scale.setScalar(0.3 + this.t * 1.4); } }); FX.ring(P, 0xff3060, 5.5, 1.1); setTimeout(() => { if (!Battle.on) return; FX.shock(P, 0xc040ff, 6, 0.7); flashScreen(0.5, '#d080ff'); Audio2.sfx('boom'); B.shake = 0.7; area(5.5, sp.dmg, { kb: 8, stun: 0.8 }); }, 1100); break; }
  }
}

// ---------------------------------------------------------------- player control
function camBasis() {
  const fwdC = _v1.set(0, 0, 0); camera.getWorldDirection(fwdC); fwdC.y = 0; fwdC.normalize();
  const right = _v2.set(-fwdC.z, 0, fwdC.x);
  return { f: fwdC.clone(), r: right.clone() };
}
function arteDir(f) {
  if (f.air) return 'air';
  if (Input.my > 0.5) return 'u';
  if (Input.my < -0.5) return 'd';
  if (Math.abs(Input.mx) > 0.4) {
    const { r } = camBasis(); const mv = r.multiplyScalar(Input.mx);
    const tg = f.target; if (tg && !tg.dead) { const dx = tg.pos.x - f.pos.x, dz = tg.pos.z - f.pos.z; if (mv.x * dx + mv.z * dz > 0) return 'f'; }
    else return 'f';
  }
  return 'n';
}
function learned(key) { const a = ARTES[key]; return a && S.chars.sieg.lv >= a.lv; }
function tryArte(f) {
  const B = Battle; const dir = arteDir(f); const slot = SLOTS[dir]; if (!slot) return false;
  let key = null;
  const a = f.act;
  if (!a) key = slot[0];
  else if (a.kind === 'atk') key = slot[0];
  else if (a.kind === 'arte') {
    if (B.ol.on) key = a.tier === 'base' && slot[1] && learned(slot[1]) ? slot[1] : slot[0];
    else if (a.tier === 'base' && slot[1] && learned(slot[1])) key = slot[1];
    else return false;
  }
  if (!key || !learned(key)) { if (dir !== 'n' && learned(SLOTS.n[0]) && (!a || a.kind === 'atk')) key = SLOTS.n[0]; else return false; }
  const def = ARTES[key];
  const cost = B.ol.on ? Math.ceil(def.tp / 2) : def.tp;
  if (f.tp < cost) { DMG.add('TP不足', f.pos.clone().setY(2.3), 'small'); return false; }
  f.tp -= cost;
  if (a) endAct(f);
  const tg = f.target; if (tg && !tg.dead && !f.air) faceTo(f, tg);
  startAct(f, def, 'arte', { tier: def.tier });
  arteName(def.name); Audio2.sfx('arte'); Audio2.sfx('slash2');
  return true;
}
function tryAttack(f) {
  const a = f.act;
  let n = 0;
  if (a) { if (a.kind !== 'atk') { if (!Battle.ol.on) return false; } else n = a.n; }
  const maxN = f.air ? 2 : 3;
  if (a && a.kind === 'atk' && n >= maxN) return false;
  if (a) endAct(f);
  const tg = f.target; if (tg && !tg.dead && !f.air) faceTo(f, tg);
  const idx = n + 1;
  const clip = f.air ? 'airAtk' + idx : 'atk' + idx;
  const C = CLIPS[clip];
  const hitT = idx === 3 ? 0.2 : 0.13;
  const def = { clip, dur: C.dur, cancel: idx === 3 ? 0.3 : 0.2, hits: [{ t: hitT, r: 2.0, arc: 1.0, dmg: idx === 3 ? 1.25 : 0.95, kb: idx === 3 ? 4 : 0.8, stun: 0.42, y: f.air ? 1 : 0 }], lunge: [0.02, hitT, idx === 3 ? 7 : 4.5] };
  startAct(f, def, 'atk', { n: idx });
  Audio2.sfx('slash');
  return true;
}
function playerControl(f, dt) {
  const B = Battle;
  if (f.dead) return;
  // target
  if (!f.target || f.target.dead) f.target = nearest(f, B.enemies);
  if (Input.pressed.tgt) { const al = alive(B.enemies); if (al.length) { const i = al.indexOf(f.target); f.target = al[(i + 1) % al.length]; Audio2.sfx('cursor'); } }
  // buffer
  if (Input.pressed.atk) f.buffer = { k: 'atk', t: 0.28 };
  if (Input.pressed.arte) f.buffer = { k: 'arte', t: 0.28 };
  if (f.buffer) { f.buffer.t -= dt; if (f.buffer.t <= 0) f.buffer = null; }
  // OL / burst
  if (Input.pressed.ol) {
    if (B.ol.on) startBurst(f);
    else if (B.ol.g >= 100) startOL();
  }
  if (Input.pressed.fs) tryFS(f);
  if (f.stun > 0 || f.down > 0) return;
  const canAct = !f.act || f.act.t >= f.act.cancel;
  if (f.buffer && canAct && f.state !== 'cast') {
    const ok = f.buffer.k === 'atk' ? tryAttack(f) : tryArte(f);
    if (ok) f.buffer = null;
  }
  if (f.act) { f.speed = 0; return; }
  // guard
  if (Input.held.guard && !f.air) { if (f.state !== 'guard') { f.state = 'guard'; f.model.play(CLIPS.guard); } f.speed = 0; if (f.target) faceTo(f, f.target); f.tp = Math.min(f.mtp, f.tp + dt * 2); return; }
  if (f.state === 'guard') { f.state = 'idle'; f.model.m.clip = null; }
  // move
  const { r, f: cf } = camBasis();
  const free = Input.held.free || !f.target;
  let mv = new V3();
  if (free) mv.addScaledVector(r, Input.mx).addScaledVector(cf, Input.my);
  else {
    const tg = f.target; const d = _v1.set(tg.pos.x - f.pos.x, 0, tg.pos.z - f.pos.z).normalize();
    const along = r.dot(d) * Input.mx + (Math.abs(Input.mx) < 0.2 ? 0 : 0);
    mv.copy(d).multiplyScalar(Math.abs(along) > 0.15 ? Math.sign(along) * Math.min(1, Math.abs(Input.mx)) : 0);
  }
  const L = mv.length(); const sp = free ? 7 : 6.4;
  if (L > 0.1) {
    mv.multiplyScalar(1 / Math.max(1, L));
    f.pos.addScaledVector(mv, sp * dt * (f.air ? 0.8 : 1));
    f.speed = sp * Math.min(1, L);
    const wantFace = Math.atan2(mv.x, mv.z);
    f.face = dampAng(f.face, wantFace, 20, dt);
    if (Math.random() < dt * 4 && !f.air) Audio2.sfx('step');
  } else {
    f.speed = 0;
    if (f.target && !f.air) f.face = dampAng(f.face, Math.atan2(f.target.pos.x - f.pos.x, f.target.pos.z - f.pos.z), 12, dt);
  }
  if (Input.pressed.jump && !f.air) { f.vy = 9; f.air = true; Audio2.sfx('jump'); }
}

// ---------------------------------------------------------------- OL / Burst / Mystic / FS
function startOL() {
  const B = Battle; B.ol.on = true; B.ol.t = 12; B.ol.g = 100;
  Audio2.sfx('ol'); flashScreen(0.5, '#ffe7a8');
  FX.shock(B.player.pos.clone().setY(0), 0xffd36a, 4, 0.6);
  banner('OVER LIMIT');
  if (!B.player.aura) { B.player.aura = glowSprite(0xffcf5a, 3); battleScene.add(B.player.aura); }
  B.player.aura.visible = true;
  if (!B.tipShown.ol && !S.flags.tutOL2) { B.tipShown.ol = 1; S.flags.tutOL2 = 1; showTip('OVER LIMIT', `オーバーリミット中は怯まず、術技を何度でも連携できる（TP 消費半分）。<br>もう一度 <kbd>${keyLabel('ol')}</kbd> で<b>バーストアーツ</b>「${BURST.name}」！${S.flags.mystic ? `<br>バーストアーツ中に <kbd>${keyLabel('arte')}</kbd> を<b>押しっぱなし</b>で…秘奥義！` : ''}`, 6500); }
}
function endOL() { const B = Battle; B.ol.on = false; B.ol.g = 0; if (B.player.aura) B.player.aura.visible = false; }
function startBurst(f) {
  const B = Battle; if (B.special || f.dead) return;
  const tg = f.target && !f.target.dead ? f.target : nearest(f, B.enemies); if (!tg) return;
  if (f.act) endAct(f);
  B.special = { kind: 'burst', t: 0, tg, n: 0, mysticReady: !!S.flags.mystic };
  arteName(BURST.name); Audio2.sfx('ol'); flashScreen(0.4, '#cfe3ff');
  if (f.trail) f.trail.on = true;
}
function tickBurst(dt) {
  const B = Battle, s = B.special, f = B.player, tg = s.tg; s.t += dt;
  if (tg.dead && s.t < 1.3) { const nt = nearest(f, B.enemies); if (nt) s.tg = nt; else s.t = Math.max(s.t, 1.3); return; }
  const ang = s.n * 2.2;
  if (s.t < 1.3) {
    const k = Math.floor(s.t / 0.12);
    if (k > s.n - 1 && s.n < BURST.hits) {
      s.n++;
      const side = s.n % 2 ? 1 : -1;
      const off = new V3(Math.sin(ang) * (tg.rad + 1.2), 0, Math.cos(ang) * (tg.rad + 1.2));
      f.pos.set(tg.pos.x + off.x, tg.boss ? 0 : Math.max(0, tg.pos.y), tg.pos.z + off.z); faceTo(f, tg); if (f.trail) f.trail.reset();
      f.model.play(s.n % 2 ? CLIPS.burstSlash : CLIPS.burstSlash2);
      damage(f, tg, { dmg: BURST.dmg, kb: 0, stun: 0.6, fs: 'blue' }, { arte: true, unblockable: true });
      Audio2.sfx('slash2'); FX.particle(f.pos.clone().setY(1), { color: 0x8ab8ff, size: 2, life: 0.15, grow: 2 });
      tg.knock.set(0, 0, 0);
      if (!tg.boss) { tg.vy = Math.max(tg.vy, 1.5); }
    }
    if (s.mysticReady) { $('#fsPrompt').textContent = `HOLD ${keyLabel('arte')} ― 秘奥義`; $('#fsPrompt').classList.remove('hide'); }
  } else if (!s.fin) {
    s.fin = 1; $('#fsPrompt').classList.add('hide');
    if (s.mysticReady && Input.held.arte) { startMystic(); return; }
    faceTo(f, tg); f.pos.addScaledVector(fwd(f), -1.2); if (f.trail) f.trail.reset();
    f.model.play(CLIPS.atk3, 1.6);
    setTimeout(() => {
      if (!Battle.on) return;
      for (const e of alive(B.enemies)) if (hdist(e, tg) < 4 + e.rad) damage(f, e, { dmg: BURST.fin, kb: 9, lift: 6, stun: 0.9, fs: 'blue' }, { arte: true, unblockable: true });
      FX.shock(tg.pos.clone().setY(0), 0x8ab8ff, 5, 0.6); FX.pillar(tg.pos.clone().setY(0), 0x8ab8ff, 8, 1.8, 0.5);
      Audio2.sfx('boom'); B.shake = 0.6; flashScreen(0.3);
    }, 130);
  }
  if (s.t > 1.9) { B.special = null; endOL(); if (f.trail) f.trail.on = false; f.model.m.clip = null; }
}
function startMystic() {
  const B = Battle, f = B.player;
  B.special = { kind: 'mystic', t: 0, tg: B.special.tg, hits: 0 };
  B.ts = 1;
  Audio2.sfx('mystic');
  const ci = $('#cutin'); ci.querySelector('.por').innerHTML = portrait('sieg', 'angry'); ci.querySelector('.nm').innerHTML = `<small>MYSTIC ARTE</small>${MYSTIC.name}`;
  ci.classList.remove('hide');
  ci.querySelectorAll('div').forEach(d => { d.style.animation = 'none'; void d.offsetWidth; d.style.animation = ''; });
  $('#bars').classList.add('on');
}
function tickMystic(dt) {
  const B = Battle, s = B.special, f = B.player; s.t += dt;
  let tg = s.tg; if (tg.dead) tg = s.tg = nearest(f, B.enemies) || tg;
  const t = s.t;
  if (t > 2.6 && !s.night) { s.night = 1; $('#cutin').classList.add('hide'); s.prevSky = Battle.cfg.area; bSky.set(SKY.title); flashScreen(0.8, '#000'); }
  if (t > 2.7 && t < 3.1) { f.pos.set(tg.pos.x - 2, lerp(0, 7, (t - 2.7) / 0.4), tg.pos.z); f.air = true; f.vy = 0; f.model.play(CLIPS.rising); }
  if (t >= 3.1 && t < 4.5) {
    const k = Math.floor((t - 3.1) / 0.17);
    if (k >= s.hits && s.hits < 8) {
      s.hits++;
      const a = s.hits * 2.4, r = tg.rad + 2.5, y = tg.boss ? rnd(0.5, 4) : rnd(1, 5);
      const from = f.pos.clone();
      f.pos.set(tg.pos.x + Math.sin(a) * r, y, tg.pos.z + Math.cos(a) * r); faceTo(f, tg); if (f.trail) f.trail.reset();
      FX.bolt(from.setY(from.y + 1), f.pos.clone().setY(f.pos.y + 1), 0xb080ff, 0.12);
      const through = tg.pos.clone().setY(tg.pos.y + tg.h * 0.5);
      FX.bolt(f.pos.clone().setY(f.pos.y + 1), through.clone().multiplyScalar(2).sub(f.pos.clone().setY(f.pos.y + 1)), 0xe8d8ff, 0.2);
      f.model.play(s.hits % 2 ? CLIPS.burstSlash : CLIPS.burstSlash2);
      for (const e of alive(B.enemies)) if (hdist(e, tg) < 3 + e.rad) damage(f, e, { dmg: 1.0, kb: 0, stun: 1 }, { arte: true, unblockable: true });
      Audio2.sfx('slash2'); B.shake = 0.15;
    }
  }
  if (t >= 4.5 && !s.rise) { s.rise = 1; f.pos.set(tg.pos.x, 10, tg.pos.z - 0.5); faceTo(f, tg); f.model.play(CLIPS.atk3); if (f.trail) f.trail.reset(); }
  if (t >= 4.5 && t < 4.85) { f.pos.y = lerp(10, 0.2, (t - 4.5) / 0.35); }
  if (t >= 4.85 && !s.boom) {
    s.boom = 1; f.pos.y = 0; f.air = false;
    const P = tg.pos.clone().setY(0);
    FX.pillar(P, 0xc8a8ff, 30, 3.5, 1.2); FX.pillar(P, 0xffffff, 30, 1.4, 1.0); FX.shock(P, 0xb080ff, 12, 1.0); FX.shock(P, 0xffe7a8, 8, 0.8);
    for (let i = 0; i < 40; i++) FX.particle(P.clone().setY(1), { tex: FX.starTex, color: pick([0xffe7a8, 0xc8a8ff, 0xffffff]), size: rnd(0.6, 1.4), life: rnd(0.8, 1.5), vel: new V3(rnd(-12, 12), rnd(4, 16), rnd(-12, 12)), g: 10, spin: 3 });
    flashScreen(1); Audio2.sfx('boom'); Audio2.sfx('shatter'); B.shake = 1.2;
    for (const e of alive(B.enemies)) damage(f, e, { dmg: MYSTIC.dmg, kb: 12, lift: e.boss ? 0 : 10, stun: 1.2 }, { arte: true, unblockable: true });
    banner(MYSTIC.name);
  }
  if (t > 6.0) { B.special = null; endOL(); bSky.set(SKY[{ town: 'town', field: 'field', forest: 'forest', ruins: 'ruins', altar: 'ruins' }[B.cfg.area] || 'field']); $('#bars').classList.remove('on'); f.model.play(CLIPS.pose); if (f.trail) f.trail.on = false; S.flags.mysticUsed = (S.flags.mysticUsed || 0) + 1; }
}
function tryFS(f) {
  const B = Battle; if (B.special || f.dead) return;
  const ready = alive(B.enemies).filter(e => e.fsReady > 0);
  if (!ready.length) return;
  ready.sort((a, b) => (a === f.target ? -1 : 0) - (b === f.target ? -1 : 0) || hdist(f, a) - hdist(f, b));
  const tg = ready[0];
  if (f.act) endAct(f);
  B.special = { kind: 'fs', t: 0, tg, chain: ready.filter(e => e !== tg && hdist(e, tg) < 5) };
  const back = _v1.set(f.pos.x - tg.pos.x, 0, f.pos.z - tg.pos.z).normalize();
  f.pos.set(tg.pos.x + back.x * (tg.rad + 1.3), 0, tg.pos.z + back.z * (tg.rad + 1.3)); f.air = false; f.vy = 0; if (f.trail) f.trail.reset();
  faceTo(f, tg);
  f.model.play(CLIPS.atk3, 1.3);
  if (f.trail) f.trail.on = true;
  Audio2.sfx('fs');
  B.ts = 0.35;
}
function tickFS(dt) {
  const B = Battle, s = B.special, f = B.player, tg = s.tg; s.t += dt;
  if (s.t > 0.16 && !s.hit) {
    s.hit = 1;
    const col = FS_COL[tg.fsCol];
    for (const e of [tg].concat(s.chain)) {
      if (e.dead) continue;
      e.fsReady = 0;
      if (e.boss) { damage(f, e, { dmg: 1, kb: 6, stun: 1.5 }, { fixed: Math.round(e.mhp * 0.12), unblockable: true }); e.fsG = e.fsMax; }
      else { damage(f, e, { dmg: 1, kb: 10, lift: 8, stun: 1 }, { fixed: e.hp, unblockable: true }); e.fsKilled = 1; }
      FX.shock(e.pos.clone().setY(0), col, 4, 0.6);
      for (let i = 0; i < 24; i++) FX.particle(e.pos.clone().setY(e.h * 0.6), { tex: FX.starTex, color: col, size: rnd(0.5, 1.2), life: rnd(0.5, 0.9), vel: new V3(rnd(-10, 10), rnd(2, 10), rnd(-10, 10)), g: 12, spin: 4 });
      B.stats.fs++;
    }
    flashScreen(0.6, '#' + col.toString(16).padStart(6, '0'));
    Audio2.sfx('shatter'); B.shake = 0.6;
    banner('FATAL STRIKE');
  }
  if (s.t > 0.3) B.ts = damp(B.ts, 1, 6, dt / Math.max(B.ts, 0.1));
  if (s.t > 0.75) { B.special = null; B.ts = 1; if (f.trail) f.trail.on = false; }
}

// ---------------------------------------------------------------- ally AI
function allyAI(f, dt) {
  const B = Battle;
  if (f.dead || f.stun > 0 || f.down > 0) { f.speed = 0; return; }
  f.tp = Math.min(f.mtp, f.tp + dt * 1.2);
  if (f.casting) { f.speed = 0; tickCast(f, dt); return; }
  if (f.act) { f.speed = 0; return; }
  f.ai.cd -= dt;
  const kit = ALLY_KIT[f.id];
  const lv = S.chars[f.id].lv;
  const has = k => kit.spells.includes(k) && SPELLS[k].lv <= lv && f.tp >= SPELLS[k].tp;
  // decide
  if (f.ai.cd <= 0) {
    if (f.role === 'healer') {
      const downed = B.allies.find(a => a.dead);
      const allyAlive = alive(B.allies);
      const low = allyAlive.slice().sort((a, b) => a.hp / a.mhp - b.hp / b.mhp)[0];
      const lowN = allyAlive.filter(a => a.hp / a.mhp < 0.6).length;
      if (downed && has('revive')) { startCast(f, 'revive', downed); return; }
      if (lowN >= 2 && has('circle')) { startCast(f, 'circle', null); return; }
      if (low && low.hp / low.mhp < 0.5 && has('heal')) { startCast(f, 'heal', low); return; }
      if (Math.random() < 0.3 && has('stellar')) { startCast(f, 'stellar', f.target || nearest(f, B.enemies)); return; }
    } else if (f.role === 'mage') {
      const tg = (B.player.target && !B.player.target.dead) ? B.player.target : nearest(f, B.enemies);
      if (tg) {
        const opts = ['blaze', 'icicle', 'spark', 'gaia'].filter(has);
        if (opts.length) {
          let k = opts[Math.floor(Math.random() * opts.length)];
          if (opts.includes('gaia') && Math.random() < 0.35) k = 'gaia';
          startCast(f, k, tg); return;
        }
      }
    }
  }
  // movement
  if (!f.target || f.target.dead || Math.random() < dt * 0.3) f.target = f.role === 'mage' && B.player.target && !B.player.target.dead ? B.player.target : nearest(f, B.enemies);
  const tg = f.target; if (!tg) { f.speed = 0; return; }
  const d = hdist(f, tg);
  const want = f.role === 'mage' ? 8 : 1.6 + tg.rad;
  const dir = _v1.set(tg.pos.x - f.pos.x, 0, tg.pos.z - f.pos.z).normalize();
  // mages flee when an enemy is close
  const close = alive(B.enemies).find(e => hdist(e, f) < 2.6 + e.rad);
  let mv = 0;
  if (f.role === 'mage' && close) { dir.set(f.pos.x - close.pos.x, 0, f.pos.z - close.pos.z).normalize(); mv = 1; }
  else if (d > want + 0.6) mv = 1; else if (d < want - 1.5 && f.role === 'mage') mv = -1;
  if (mv) { f.pos.addScaledVector(dir, mv * f.spd * dt); f.speed = f.spd; f.face = dampAng(f.face, Math.atan2(dir.x * mv, dir.z * mv), 12, dt); }
  else { f.speed = 0; faceTo(f, tg); }
  // melee (lucia)
  if (f.role === 'healer' && d < want + 0.8 && f.ai.cd <= 0) {
    faceTo(f, tg);
    startAct(f, { clip: 'luciaSlash', dur: 0.55, cancel: 0.55, hits: [{ t: 0.14, r: 1.9, arc: 0.9, dmg: 0.9, kb: 0.6, stun: 0.4, fs: 'green' }, { t: 0.34, r: 2.0, arc: 0.9, dmg: 1.0, kb: 3, stun: 0.45, fs: 'green' }], lunge: [0.02, 0.15, 4] }, 'atk', { n: 1 });
    Audio2.sfx('slash', 0.6);
    if (Math.random() < 0.3) arteName(ALLY_KIT.lucia.melee.name, true);
    f.ai.cd = rnd(0.4, 1.0);
  }
}

// ---------------------------------------------------------------- enemy AI
function enemyAI(f, dt) {
  const B = Battle, d = f.d;
  if (f.dead) return;
  if (f.stun > 0 || f.down > 0 || f.air) { f.speed = 0; return; }
  if (f.casting) { f.speed = 0; tickCast(f, dt); return; }
  if (f.act) { f.speed = 0; tickEnemyAct(f, dt); return; }
  f.ai.cd -= dt * (f.boss && f.hp < f.mhp * 0.4 ? 1.5 : 1); f.ai.tgtT -= dt;
  if (!f.target || f.target.dead || f.ai.tgtT <= 0) {
    const al = alive(B.allies); if (!al.length) return;
    f.target = Math.random() < 0.55 && !B.player.dead ? B.player : pick(al); f.ai.tgtT = rnd(3, 6);
  }
  const tg = f.target; const dist = hdist(f, tg) - tg.rad - f.rad;
  const dir = _v1.set(tg.pos.x - f.pos.x, 0, tg.pos.z - f.pos.z).normalize();
  // mage boss keeps distance and casts
  if (d.ai === 'mage') {
    f.ai.blink = (f.ai.blink || 0) + (dist < 2 ? dt : 0);
    if (f.ai.blink > 2.2) { f.ai.blink = 0; FX.spark(f.pos.clone().setY(1), 0xc040ff, 16, 6, 0.6); const a = rnd(0, TAU); f.pos.set(Math.cos(a) * 10, 0, Math.sin(a) * 10); FX.spark(f.pos.clone().setY(1), 0xc040ff, 16, 6, 0.6); Audio2.sfx('cast'); return; }
    if (f.ai.cd <= 0) {
      if (dist < 1.5) { startEnemyAtk(f, d.atks[0]); f.ai.cd = rnd(1.5, 2.2); return; }
      const sp = f.hp < f.mhp * 0.6 && Math.random() < 0.3 ? 'eMeteor' : Math.random() < 0.5 ? 'eThunder' : 'eFire';
      startCast(f, sp, tg); f.ai.cd = rnd(2.2, 3.4); return;
    }
    if (dist < 5) { f.pos.addScaledVector(dir, -f.spd * dt); f.speed = f.spd; f.face = Math.atan2(-dir.x, -dir.z); }
    else { f.speed = 0; faceTo(f, tg); }
    return;
  }
  if (d.ai === 'turret') {
    faceTo(f, tg); f.speed = 0;
    if (f.ai.cd <= 0) { const near = dist < 1.6; const a = d.atks.find(x => near ? x.near : !x.near); startEnemyAtk(f, a); f.ai.cd = rnd(1.6, 2.8); }
    return;
  }
  // melee types
  const range = d.range;
  if (dist > range * 0.75) {
    const charge = d.atks.find(a => a.dash && a.act === 'charge');
    if (charge && dist > 5 && f.ai.cd <= 0 && Math.random() < dt * 1.2) { faceTo(f, tg); startEnemyAtk(f, charge); f.ai.cd = rnd(2, 3); return; }
    f.pos.addScaledVector(dir, f.spd * dt); f.speed = f.spd; f.face = dampAng(f.face, Math.atan2(dir.x, dir.z), 10, dt);
  } else {
    f.speed = 0; f.face = dampAng(f.face, Math.atan2(dir.x, dir.z), 10, dt);
    if (f.ai.cd <= 0) {
      let opts = d.atks.filter(a => !a.near && !(a.act === 'charge'));
      if (f.boss) {
        if (f.ai.roarT == null) f.ai.roarT = 10;
        f.ai.roarT -= 1;
        const roar = d.atks.find(a => a.roar), breath = d.atks.find(a => a.beam);
        if (roar && f.ai.roarT <= 0) { f.ai.roarT = rndi(6, 9); startEnemyAtk(f, roar); f.ai.cd = rnd(1.2, 2); return; }
        if (breath && Math.random() < (f.hp < f.mhp * 0.5 ? 0.35 : 0.2)) { startEnemyAtk(f, breath); f.ai.cd = rnd(1.5, 2.5); return; }
        opts = opts.filter(a => !a.roar && !a.beam);
      }
      startEnemyAtk(f, pick(opts));
      f.ai.cd = f.boss ? rnd(1.0, 2.0) : rnd(1.4, 2.8);
    }
  }
}
function startEnemyAtk(f, a) {
  f.act = { kind: 'enemy', a, t: 0, dur: a.dur, hitDone: false, hitSet: new Set() };
  f.state = 'act';
  if (a.clip) f.model.play(CLIPS[a.clip]); else f.model.act(a.act, a.dur);
  if (f.target) faceTo(f, f.target);
  if (a.aoe && !a.roar) { f.act.tele = FX.ring(f.pos.clone().setY(0), 0xff3040, a.aoe, a.t); }
  if (a.roar) { Audio2.sfx('roar'); }
  if (a.beam) { f.act.tele = FX.circle(f.pos.clone().setY(0), 0xff4060, 2); arteName('ノクス・ブレス', true); }
  if (f.boss && a.act === 'slam') arteName(f.d.model === 'bear' ? '剛爪撃' : 'メテオスタンプ', true);
  if (f.boss && a.act === 'charge') arteName('猛進', true);
}
function tickEnemyAct(f, dt) {
  const B = Battle, A = f.act, a = A.a; A.t += dt;
  if (a.dash && A.t >= a.t * 0.6 && A.t < (a.multi ? a.dur - 0.2 : a.t + 0.2)) { const fw = fwd(f); f.pos.addScaledVector(fw, a.dash * dt); f.speed = a.dash; if (Math.random() < 0.3) FX.particle(f.pos.clone().setY(0.2), { color: 0xc8b8a0, size: 1.2, life: 0.5, add: false, vel: new V3(rnd(-1, 1), 1, rnd(-1, 1)) }); }
  const hitNow = !A.hitDone && A.t >= a.t;
  const multi = a.multi && A.t >= a.t && A.t < a.dur - 0.2;
  if (a.beam && A.t >= a.t && A.t < a.dur - 0.2) {
    // breath beam: tick damage in a cone
    A.bt = (A.bt || 0) - dt;
    if (A.bt <= 0) {
      A.bt = 0.15;
      const fw = fwd(f).clone();
      const mouth = f.pos.clone().addScaledVector(fw, f.rad * 1.2); mouth.y = f.h * 0.55;
      for (let i = 0; i < 3; i++) FX.particle(mouth, { color: pick([0xb050ff, 0xff4080, 0x60c8ff]), size: rnd(1, 2.2), life: 0.6, vel: fw.clone().multiplyScalar(rnd(14, 20)).add(new V3(rnd(-2, 2), rnd(-1.5, 0.5), rnd(-2, 2))), grow: 1.5 });
      for (const t of alive(B.allies)) { const dx = t.pos.x - f.pos.x, dz = t.pos.z - f.pos.z, d = Math.hypot(dx, dz); if (d < 14 && (dx * fw.x + dz * fw.z) / d > 0.85) damage(f, t, { dmg: a.dmg, kb: a.kb, stun: 0.3 }, { magic: true }); }
      Audio2.sfx('fire', 0.25);
    }
    f.face = dampAng(f.face, Math.atan2(f.target.pos.x - f.pos.x, f.target.pos.z - f.pos.z), 1.2, dt);
  }
  if (hitNow || multi) {
    if (hitNow) A.hitDone = true;
    if (a.proj) {
      const n = a.n || 1;
      for (let i = 0; i < n; i++) spawnOrb(f, f.target, { kind: 'seed', color: 0xb8ff5a, size: 0.5, speed: 11, dmg: a.dmg, kb: a.kb, stun: 0.35, rad: 0.5, home: 0.8, offset: new V3(0, 0, 0).set(rnd(-0.5, 0.5), 0, rnd(-0.5, 0.5)) });
      Audio2.sfx('cancel');
    } else if (a.aoe) {
      if (hitNow) {
        for (const t of alive(B.allies)) if (hdist(t, f) < a.aoe + t.rad && t.pos.y < 2) damage(f, t, { dmg: a.dmg, kb: a.kb, stun: 0.6, lift: a.roar ? 0 : 5 });
        FX.shock(f.pos.clone().setY(0), a.roar ? 0xffffff : 0xffb070, a.aoe, 0.5);
        if (a.shake || a.roar) B.shake = 0.6; Audio2.sfx(a.roar ? 'hitHeavy' : 'boom');
      }
    } else if (!a.beam) {
      const fw = fwd(f);
      for (const t of alive(B.allies)) {
        if (A.hitSet.has(t)) continue;
        const dx = t.pos.x - f.pos.x, dz = t.pos.z - f.pos.z, d = Math.hypot(dx, dz);
        if (d < a.r + t.rad + f.rad * 0.5 && (dx * fw.x + dz * fw.z) / Math.max(d, 0.01) > 0.3 && t.pos.y < 2.2) { A.hitSet.add(t); damage(f, t, { dmg: a.dmg, kb: a.kb, stun: 0.5 }); }
      }
      if (hitNow) Audio2.sfx(f.isHuman ? 'slash' : 'hit', 0.6);
    }
  }
  if (A.t >= A.dur) { if (A.tele && A.tele.end) A.tele.end(); f.act = null; f.state = 'idle'; f.speed = 0; }
}

// ---------------------------------------------------------------- physics
function physics(f, dt) {
  // knockback
  if (f.knock.lengthSq() > 0.0001) { f.pos.addScaledVector(f.knock, dt * 4); f.knock.multiplyScalar(Math.exp(-8 * dt)); }
  // gravity
  if (f.air || f.pos.y > 0) {
    f.vy -= GRAV * dt * (f.team === 'enemy' && f.stun > 0 ? 0.65 : 1);
    f.pos.y += f.vy * dt;
    if (f.pos.y <= 0) {
      f.pos.y = 0; const wasFall = f.vy < -6; f.vy = 0; f.air = false;
      if (f.act) f.act.landed = true;
      if (f.team === 'enemy' && wasFall && !f.boss && !f.dead) { f.down = 0.7; f.model.act('down', 0.7); }
      if (f === Battle.player && wasFall) Audio2.sfx('land');
    }
  }
  if (f.stun > 0) f.stun -= dt;
  if (f.down > 0) { f.down -= dt; if (f.down <= 0 && f.model.type === 'human') f.model.m.clip = null; }
  if (f.inv > 0) f.inv -= dt;
  if (f.fsReady > 0) { f.fsReady -= dt; if (f.fsReady <= 0) { f.fsG = f.fsMax * 0.6; } }
  if (f.team === 'enemy' && !f.fsReady && f.fsG < f.fsMax && Battle.t - (f.fsLast || 0) > 2.5) f.fsG = Math.min(f.fsMax, f.fsG + dt * 8);
  if (f.poiseMax && Battle.t - f.lastHurt > 2.5) { f.poise = f.poiseMax; f.broken = 0; }
  // arena clamp
  const r = Math.hypot(f.pos.x, f.pos.z), R = ARENA_R - f.rad;
  if (r > R) { f.pos.x *= R / r; f.pos.z *= R / r; }
}
function separate() {
  const F = Battle.fighters;
  for (let i = 0; i < F.length; i++) for (let j = i + 1; j < F.length; j++) {
    const a = F[i], b = F[j]; if (a.dead || b.dead) continue;
    if (a.team === b.team && a.team === 'ally') continue;
    if (Math.abs(a.pos.y - b.pos.y) > 1.5) continue;
    const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z, d = Math.hypot(dx, dz), m = a.rad + b.rad;
    if (d < m && d > 0.001) {
      const p = (m - d) / d;
      const wa = a.boss ? 0.1 : b.boss ? 0.9 : 0.5;
      a.pos.x -= dx * p * wa; a.pos.z -= dz * p * wa; b.pos.x += dx * p * (1 - wa); b.pos.z += dz * p * (1 - wa);
    }
  }
}

// ---------------------------------------------------------------- camera
function battleCamera(dt) {
  const B = Battle, c = B.cam, p = B.player;
  let focus = p.dead ? (alive(B.allies)[0] || p) : p;
  const tg = (focus.target && !focus.target.dead) ? focus.target : nearest(focus, B.enemies);
  let wantPos = new V3(), wantLook = new V3();
  const sp = B.special;
  if (B.end && B.end.kind === 'win' && B.end.t > 0.8) {
    const a = B.end.t * 0.35 + 0.8;
    wantLook.set(p.pos.x, 1.2, p.pos.z);
    wantPos.set(p.pos.x + Math.sin(p.face + a) * 5.5, 2.0, p.pos.z + Math.cos(p.face + a) * 5.5);
  } else if (sp && sp.kind === 'mystic') {
    const t = sp.t, T = sp.tg;
    wantLook.copy(T.pos).setY(Math.max(1.5, p.pos.y * 0.6 + 1));
    const a = t * 0.6;
    const R = t < 4.4 ? 14 : 18;
    wantPos.set(T.pos.x + Math.sin(a) * R, t < 4.4 ? 5 : 3, T.pos.z + Math.cos(a) * R);
  } else if (sp && sp.kind === 'burst') {
    const T = sp.tg; wantLook.copy(T.pos).setY(1.4);
    const a = sp.t * 1.2 + c.side; wantPos.set(T.pos.x + Math.sin(a) * 7, 2.8, T.pos.z + Math.cos(a) * 7);
  } else if (sp && sp.kind === 'fs') {
    const T = sp.tg; wantLook.copy(T.pos).setY(1.2);
    const d = _v1.set(T.pos.x - p.pos.x, 0, T.pos.z - p.pos.z).normalize();
    wantPos.set(p.pos.x - d.z * 4.5 - d.x * 2, 1.8, p.pos.z + d.x * 4.5 - d.z * 2);
  } else if (tg) {
    const dx = tg.pos.x - focus.pos.x, dz = tg.pos.z - focus.pos.z; const L = Math.max(0.01, Math.hypot(dx, dz));
    let nx = -dz / L, nz = dx / L;
    // keep camera on the same side
    const cur = _v2.set(c.pos.x - (focus.pos.x + tg.pos.x) / 2, 0, c.pos.z - (focus.pos.z + tg.pos.z) / 2);
    if (cur.x * nx + cur.z * nz < 0) { nx = -nx; nz = -nz; }
    const mid = _v3.set((focus.pos.x * 0.6 + tg.pos.x * 0.4), 0, (focus.pos.z * 0.6 + tg.pos.z * 0.4));
    const dist = clamp(7.5 + L * 0.55 + (tg.boss ? 2 + tg.rad * 1.6 : 0), 8, 22) * (camera.aspect < 1 ? 1.5 : 1);
    wantLook.set(mid.x, 1.2 + (tg.boss ? 1.0 : 0) + Math.max(focus.pos.y, 0) * 0.4, mid.z);
    wantPos.set(mid.x + nx * dist - (dx / L) * 1.5, 3.2 + dist * 0.12, mid.z + nz * dist - (dz / L) * 1.5);
  } else {
    wantLook.set(focus.pos.x, 1.2, focus.pos.z); wantPos.set(focus.pos.x, 4, focus.pos.z + 10);
  }
  let k = sp && sp.kind !== 'fs' ? 5 : sp ? 10 : 4.5;
  if (c.intro > 0) { c.intro -= dt; k = 2.4; }
  c.pos.x = damp(c.pos.x, wantPos.x, k, dt); c.pos.y = damp(c.pos.y, wantPos.y, k, dt); c.pos.z = damp(c.pos.z, wantPos.z, k, dt);
  c.look.x = damp(c.look.x, wantLook.x, k * 1.4, dt); c.look.y = damp(c.look.y, wantLook.y, k * 1.4, dt); c.look.z = damp(c.look.z, wantLook.z, k * 1.4, dt);
  camera.position.copy(c.pos);
  if (B.shake > 0) { B.shake = Math.max(0, B.shake - dt * 2); camera.position.add(new V3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).multiplyScalar(B.shake * 0.25)); }
  camera.lookAt(c.look);
}

// ---------------------------------------------------------------- HUD
function buildPartyHud() {
  const host = $('#party'); host.innerHTML = '';
  for (const f of Battle.allies) {
    const d = document.createElement('div'); d.className = 'pp' + (f === Battle.player ? ' ctl' : '');
    d.innerHTML = `<div class="fc">${portrait(f.id, 'normal')}</div><div class="n">${f.name}</div><div class="hp">0<small> /0</small></div><div class="bar"><i></i></div><div class="tp">TP 0</div><div class="bar t"><i></i></div><div class="cast"></div>`;
    host.appendChild(d); f.hud = d;
  }
}
function comboHud(pop) {
  const c = $('#combo'), B = Battle;
  c.querySelector('.h').innerHTML = B.combo.hits + '<small>HITS</small>';
  c.querySelector('.d').textContent = B.combo.dmg + ' DAMAGE';
  c.classList.add('on');
  if (pop) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
}
function battleHud(dt) {
  const B = Battle;
  for (const f of B.allies) {
    const h = f.hud; if (!h) continue;
    const hpEl = h.querySelector('.hp');
    const hpTxt = `${Math.round(f.hp)}<small> /${f.mhp}</small>`;
    if (hpEl._v !== hpTxt) { hpEl.innerHTML = hpTxt; hpEl._v = hpTxt; }
    h.querySelector('.bar i').style.width = (f.hp / f.mhp * 100) + '%';
    h.querySelector('.bar.t i').style.width = (f.tp / f.mtp * 100) + '%';
    h.querySelector('.tp').textContent = 'TP ' + Math.floor(f.tp);
    h.classList.toggle('low', f.hp / f.mhp < 0.5); h.classList.toggle('crit', f.hp / f.mhp < 0.25); h.classList.toggle('dead', f.dead);
    h.querySelector('.cast').textContent = f.casting ? f.casting.sp.name + '…' : '';
  }
  if (B.combo.t > 0) { B.combo.t -= dt; if (B.combo.t <= 0) { $('#combo').classList.remove('on'); B.combo.hits = 0; B.combo.dmg = 0; } }
  // OL
  const arc = $('#olArc'); const g = B.ol.on ? B.ol.t / 12 * 100 : B.ol.g;
  arc.setAttribute('stroke-dasharray', `${(g / 100 * 264).toFixed(1)} 264`);
  arc.setAttribute('stroke', B.ol.on ? '#ff7ad8' : B.ol.g >= 100 ? '#fff0a0' : '#ffcf5a');
  $('#ol .v').textContent = B.ol.on ? 'ACTIVE' : Math.floor(B.ol.g) + '%';
  $('#ol').classList.toggle('ready', B.ol.g >= 100 && !B.ol.on);
  $('#tO').classList.toggle('glow', B.ol.g >= 100 || B.ol.on);
  // target
  const p = B.player, t = p.target && !p.target.dead ? p.target : null;
  const tgEl = $('#tgt');
  if (t) {
    tgEl.classList.remove('hide');
    tgEl.querySelector('.n').textContent = t.name + (t.boss ? '' : '');
    tgEl.querySelector('.b i').style.width = (t.hp / t.mhp * 100) + '%';
    const fi = tgEl.querySelector('.f i'); fi.style.width = (t.fsReady ? 100 : (1 - t.fsG / t.fsMax) * 100) + '%'; fi.style.background = '#' + FS_COL[t.fsCol].toString(16).padStart(6, '0');
  } else tgEl.classList.add('hide');
  // FS marks
  let anyFS = false;
  for (const e of B.enemies) {
    const show = e.fsReady > 0 && !e.dead;
    e.fsMark.visible = show;
    if (show) { anyFS = true; e.fsMark.position.copy(e.pos).setY(e.pos.y + e.h + 0.7); const s = 1.2 + Math.sin(B.t * 14) * 0.2; e.fsMark.scale.setScalar(s); e.fsMark.material.rotation += dt * 3; }
  }
  if (!(B.special && B.special.kind === 'burst')) { $('#fsPrompt').textContent = `FATAL STRIKE ! [${keyLabel('fs')}]`; $('#fsPrompt').classList.toggle('hide', !anyFS || !!B.special); }
  $('#tS').classList.toggle('glow', anyFS);
}

// ---------------------------------------------------------------- main update
Battle.update = function (rdt) {
  const B = Battle;
  if (!B.on) return;
  if (B.paused) { renderer.render(battleScene, camera); return; }
  let dt = rdt * B.ts;
  B.t += dt; B.stats.time += rdt;
  if (B.stop > 0) { B.stop -= rdt; dt = 0; }
  const sp = B.special;
  if (sp) {
    if (sp.kind === 'burst') tickBurst(rdt);
    else if (sp.kind === 'mystic') tickMystic(rdt);
    else if (sp.kind === 'fs') tickFS(rdt);
  }
  const frozen = sp && sp.kind !== 'fs';
  if (!B.end) {
    if (!frozen) {
      playerControl(B.player, dt);
      for (const f of B.fighters) {
        if (f.team === 'ally' && f !== B.player) allyAI(f, dt);
        if (f.team === 'enemy') enemyAI(f, dt);
        if (f.act && f.team === 'ally') tickAct(f, dt);
        if (f === B.player && f.casting) tickCast(f, dt);
        physics(f, dt);
      }
      separate();
      updateProjs(dt);
    }
    if (B.ol.on && !sp) { B.ol.t -= rdt; if (B.ol.t <= 0) endOL(); }
  }
  // dead enemies sink
  for (const f of B.enemies) if (f.dead) { f.deadT += rdt; if (f.deadT > 1.0) { f.model.root.traverse(o => { if (o.material && !o.userData.fadeMat) { o.material = o.material.clone(); o.material.transparent = true; o.userData.fadeMat = 1; } if (o.material) o.material.opacity = Math.max(0, 1 - (f.deadT - 1.0) * 1.5); }); if (f.deadT > 1.7) f.model.root.visible = false; } }
  for (const f of B.fighters) syncModel(f, frozen && f !== B.player ? 0 : (f === B.player && sp ? rdt : dt));
  if (B.player.aura) { B.player.aura.position.copy(B.player.pos).setY(B.player.pos.y + 1); B.player.aura.material.opacity = 0.5 + Math.sin(B.t * 10) * 0.2; }
  B.arena.update(rdt);
  FX.update(rdt);
  battleCamera(rdt);
  bSky.update(rdt, camera);
  DMG.update(rdt, camera);
  battleHud(rdt);
  // end conditions
  if (!B.end && !sp) {
    if (B.enemies.every(e => e.dead)) { B.end = { kind: 'win', t: -1.0 }; }
    else if (B.allies.every(a => a.dead)) { B.end = { kind: 'lose', t: 0 }; }
  }
  if (B.end) tickEnd(rdt);
  if (!B.end && !B.special && Input.pressed.menu) openBattleMenu();
  renderer.render(battleScene, camera);
};
function tickEnd(dt) {
  const B = Battle, e = B.end; e.t += dt;
  if (e.kind === 'win') {
    if (e.t >= 0 && !e.fan) {
      e.fan = 1; Audio2.fanfare(); endOL();
      $('#fsPrompt').classList.add('hide'); $('#combo').classList.remove('on');
      for (const f of B.allies) { if (f.dead) continue; if (f.act) endAct(f); if (f.casting) interruptCast(f); f.state = 'idle'; f.speed = 0; f.face = Math.atan2(camera.position.x - f.pos.x, camera.position.z - f.pos.z); f.model.play(CLIPS[f.id === 'sieg' ? 'victory' : f.id === 'lucia' ? 'victoryL' : 'victoryN']); }
      const quotes = (B.cfg.quotes || VICTORY_QUOTES)();
      e.q = quotes;
      setTimeout(() => B.on && B.end && arteName(e.q[0], true), 700);
      if (e.q[1]) setTimeout(() => B.on && B.end && arteName(e.q[1], true), 2000);
    }
    if (e.t > 3.0 && !e.res) { e.res = 1; showResult(); }
  } else {
    if (!e.go) { e.go = 1; Audio2.stop(); setTimeout(() => showGameOver(), 1200); }
  }
}
function VICTORY_QUOTES() {
  const al = alive(Battle.allies).map(f => f.id);
  const Q = {
    sieg: ['ジーク「ま、こんなもんだろ」', 'ジーク「準備運動にもならねえな」', 'ジーク「悪いな、急いでんだ」', 'ジーク「次はもうちょい骨のあるヤツを頼むぜ」'],
    lucia: ['リュシア「みなさん、お怪我はありませんか？」', 'リュシア「やりました！…ですよね？」', 'リュシア「わたしも、少しはお役に立てたでしょうか」'],
    noa: ['ノア「はいはい、実験終了」', 'ノア「術式の効率、まだ上げられるわね」', 'ノア「…あんたたち、前に出すぎ」'],
  };
  const out = [pick(Q[al.includes('sieg') ? 'sieg' : al[0]] || Q.sieg)];
  const other = al.filter(x => x !== 'sieg'); if (other.length && Math.random() < 0.8) out.push(pick(Q[pick(other)]));
  return out;
}
function showResult() {
  const B = Battle;
  let exp = 0, lux = 0; const drops = [];
  for (const e of B.enemies) { exp += e.d.exp * (e.fsKilled ? 1.3 : 1); lux += e.d.lux; for (const [it, p] of e.d.drops) if (Math.random() < p) drops.push(it); }
  const grade = Math.max(0, Math.round(B.stats.maxCombo / 4 + B.stats.fs * 2 + (B.stats.time < 30 ? 3 : 0) - B.stats.dmgTaken / 300));
  exp = Math.round(exp * (1 + Math.min(grade, 20) * 0.01));
  S.lux += lux; for (const it of drops) S.items[it] = (S.items[it] || 0) + 1;
  S.fsCount += B.stats.fs; S.battles++; S.maxCombo = Math.max(S.maxCombo, B.stats.maxCombo);
  const ups = {};
  for (const id of S.party) { ups[id] = gainExp(id, exp); const c = S.chars[id]; if (c.hp <= 0) c.hp = 1; }
  const learnedNow = [];
  if (ups.sieg) for (const k in ARTES) { const a = ARTES[k]; if (a.lv > S.chars.sieg.lv - ups.sieg && a.lv <= S.chars.sieg.lv) learnedNow.push(a.name + (a.tier === 'arcane' ? '（奥義）' : '')); }
  for (const id of ['lucia', 'noa']) if (ups[id]) for (const k of ALLY_KIT[id].spells) { const s = SPELLS[k]; if (s.lv > S.chars[id].lv - ups[id] && s.lv <= S.chars[id].lv) learnedNow.push(PARTY_DEF[id].name + '：' + s.name); }
  const box = $('#result .box');
  box.innerHTML = `<h2>RESULT</h2><div class="grade">GRADE +${grade}</div>
  <div class="row"><span>最大コンボ</span><b>${B.stats.maxCombo} HITS</b></div>
  <div class="row"><span>フェイタルストライク</span><b>${B.stats.fs}</b></div>
  <div class="row"><span>戦闘時間</span><b>${B.stats.time.toFixed(1)} s</b></div>
  <div class="row"><span>獲得経験値</span><b>${exp} EXP</b></div>
  <div class="row"><span>獲得ルクス</span><b>${lux} LUX</b></div>
  ${drops.length ? `<div class="row"><span>アイテム</span><b>${drops.map(i => ITEMS[i].name).join('、')}</b></div>` : ''}
  <div class="pl">${S.party.map(id => { const c = S.chars[id]; return `<div><div>${PARTY_DEF[id].name} <span class="lv">Lv ${c.lv}</span> ${ups[id] ? '<span class="up">LEVEL UP!</span>' : ''}</div><div class="ex"><i style="width:${c.exp / expNext(c.lv) * 100}%"></i></div><div style="font-size:11px;color:#9aa6cc">NEXT ${expNext(c.lv) - c.exp}</div></div>`; }).join('')}</div>
  ${learnedNow.length ? `<div class="msg">✦ 新たな術技を習得：<b>${learnedNow.join('、')}</b></div>` : ''}
  <div class="msg" style="text-align:right;color:#e8c97a">▶ ${keyLabel('ok')}</div>`;
  $('#result').classList.remove('hide');
  if (Object.values(ups).some(x => x)) Audio2.sfx('levelup');
  UI.waitOk(() => { $('#result').classList.add('hide'); finishBattle('win'); }, 600);
}
function showGameOver() {
  UI.choice('GAME OVER ― 全滅してしまった…', ['もう一度戦う', 'タイトルへ戻る'], (i) => {
    if (i === 0) { S.chars = JSON.parse(Battle.snapshot); const cfg = Battle.cfg; cleanupBattle(); Battle.start(cfg); }
    else { cleanupBattle(); Game.toTitle(); }
  }, true);
}
function cleanupBattle() {
  const B = Battle;
  for (const f of B.fighters) { battleScene.remove(f.model.root); if (f.fsMark) battleScene.remove(f.fsMark); if (f.aura) battleScene.remove(f.aura); }
  if (B.player && B.player.aura) { battleScene.remove(B.player.aura); B.player.aura = null; }
  FX.clear(); DMG.clear();
  B.projs = []; B.on = false; B.special = null;
  $('#bhud').classList.add('hide'); $('#fsPrompt').classList.add('hide'); $('#combo').classList.remove('on'); $('#cutin').classList.add('hide'); $('#bars').classList.remove('on');
}
function finishBattle(res) {
  const cb = Battle.cfg.onEnd;
  cleanupBattle();
  cb && cb(res);
}
function openBattleMenu() {
  const B = Battle; B.paused = true;
  const opts = ['アイテム', B.cfg.boss || B.cfg.noEscape ? '（逃げられない）' : '逃げる', '操作説明', '戦闘に戻る'];
  UI.choice('BATTLE MENU', opts, (i) => {
    if (i === 0) UI.itemMenu(true, () => { B.paused = false; });
    else if (i === 1 && !(B.cfg.boss || B.cfg.noEscape)) { B.paused = false; Audio2.sfx('cancel'); finishBattle('escape'); }
    else if (i === 2) UI.controls(() => { B.paused = false; });
    else B.paused = false;
  }, false, () => { B.paused = false; });
}
