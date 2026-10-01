// ================================================================ turn based battle (DQ style)
const BT = { on: false, en: [], C: new V3(), F: new V3(0, 0, -1), R: new V3(1, 0, 0), arena: null, t: 0, camT: 0, focus: null, boss: false };
const LETTERS = ['A', 'B', 'C', 'D'];
function pStats(p) {
  const L = p.lv, e = p.eq;
  return {
    maxhp: statAt(p.id, 'hp', L), maxmp: statAt(p.id, 'mp', L),
    atk: statAt(p.id, 'atk', L) + (EQUIP[e.w] ? EQUIP[e.w].pow : 0),
    def: statAt(p.id, 'def', L) + (EQUIP[e.a] ? EQUIP[e.a].pow : 0) + (e.s && EQUIP[e.s] ? EQUIP[e.s].pow : 0),
    agi: statAt(p.id, 'agi', L), mag: EQUIP[e.w] && EQUIP[e.w].mag || 1,
  };
}
function spellsOf(p) { return LEARN[p.id].filter(([l]) => l <= p.lv).map(([, s]) => s); }
const alive = a => a.hp > 0;
// ---------------------------------------------------------------- setup
function chooseBattleDir(cx, cz, h) {
  if (FIELD.area !== 'world') return null;
  const y0 = groundY(cx, cz); let best = h, bs = -1;
  for (let k = 0; k < 16; k++) {
    const a = h + k / 16 * Math.PI * 2; const fx = Math.sin(a), fz = Math.cos(a), rx = Math.cos(a), rz = -Math.sin(a);
    let s = 0;
    for (let d = -3; d <= 9; d += 1.5) for (let l = -4; l <= 4; l += 2) {
      const x = cx + fx * d + rx * l, z = cz + fz * d + rz * l, g = groundY(x, z);
      if (g > -0.2 && Math.abs(g - y0) < 1.6 && !overworldBlocked(x, z, 0.6)) s++;
    }
    s -= k === 0 ? 0 : 0.5;
    if (s > bs) { bs = s; best = a; }
  }
  return best;
}
function placeBattle() {
  const n = BT.en.length;
  BT.en.forEach((e, i) => {
    const sp = e.def.boss ? 0 : Math.max(1.7, (e.def.scale || 1) * 1.7);
    const off = (i - (n - 1) / 2) * sp, fwd = e.def.boss ? (e.def.model === 'bigdragon' ? 9 : 7) : 5.6 + (i % 2) * 0.6;
    const p = BT.C.clone().addScaledVector(BT.F, fwd).addScaledVector(BT.R, off);
    p.y = BT.gy(p.x, p.z);
    e.home = p.clone(); e.model.position.copy(p); e.model.rotation.y = Math.atan2(-BT.F.x, -BT.F.z);
  });
  const ps = GAME.party, m = ps.length;
  ps.forEach((p, i) => {
    const mdl = partyModel(p.id); mdl.visible = true;
    const pos = BT.C.clone().addScaledVector(BT.R, (i - (m - 1) / 2) * 1.5).addScaledVector(BT.F, i === 0 ? 0.3 : 0);
    pos.y = BT.gy(pos.x, pos.z);
    p.home = pos.clone(); mdl.position.copy(pos); mdl.rotation.y = Math.atan2(BT.F.x, BT.F.z);
    setAct(mdl, p.hp > 0 ? null : 'down');
  });
}
function bpartyHTML() {
  return GAME.party.map((p, i) => { const s = pStats(p); const low = p.hp > 0 && p.hp <= s.maxhp / 4; return `<div class="pc ${p.hp <= 0 ? 'dead' : low ? 'low' : ''} ${BT.cur === i ? 'act' : ''}"><div class="nm">${CHARS[p.id].name}<i>Lv${p.lv}</i></div><div class="nums"><span>HP</span><span>${p.hp}</span></div><div class="bar"><b style="width:${p.hp / s.maxhp * 100}%"></b></div><div class="nums"><span>MP</span><span>${p.mp}</span></div><div class="bar m"><b style="width:${s.maxmp ? p.mp / s.maxmp * 100 : 0}%"></b></div>${p.sleep ? '<div class="nums" style="color:#9cc8ff">ねむり</div>' : ''}</div>`; }).join('');
}
function drawBParty() { $('#bparty').innerHTML = bpartyHTML(); }
let enemyWin = null;
function drawEnemyWin() {
  if (!enemyWin) return;
  const groups = {}; for (const e of BT.en) if (e.hp > 0) groups[e.def.name] = (groups[e.def.name] || 0) + 1;
  enemyWin.innerHTML = Object.entries(groups).map(([n, c]) => `<div>${n}${c > 1 ? ` <span style="color:#ccc">${c}ひき</span>` : ''}</div>`).join('') || '&nbsp;';
}
async function bmsg(t, ms, voice) { await UI.msg(t, { append: true, auto: Math.round((ms || 620) / GAME.bspeed), voice: !!voice, speed: 60 * GAME.bspeed }); }
// ---------------------------------------------------------------- start
async function startBattle(opts) {
  // opts: {zone, first, ids: [], boss, music, arena, noRun, intro}
  GAME.mode = 'battle'; BT.on = true; BT.boss = !!opts.boss; BT.cur = -1;
  $('#hud').classList.add('hide'); $('#touch').classList.add('hide');
  AU.encounter();
  await swirl();
  // build enemies
  let ids = opts.ids;
  if (!ids) {
    const Z = ZONES[opts.zone], n = wpick(Z.size);
    ids = [opts.first || wpick(Z.mons)]; for (let i = 1; i < n; i++) ids.push(Math.random() < 0.5 ? ids[0] : wpick(Z.mons));
  }
  const cnt = {}; ids.forEach(id => cnt[id] = (cnt[id] || 0) + 1);
  const seen = {};
  BT.en = ids.map(id => {
    const d = MONS[id]; seen[id] = (seen[id] || 0);
    const name = d.name + (cnt[id] > 1 ? LETTERS[seen[id]++] : '');
    const m = makeMonster(d); scene.add(m);
    const hp = Math.round(d.hp * (d.boss ? 1 : (0.9 + Math.random() * 0.2)));
    return { id, def: d, name, hp, maxhp: hp, atk: d.atk, df: d.def, agi: d.agi, model: m, sleep: 0, atkMul: 1, defMul: 1 };
  });
  // stage
  for (const s of FIELD.syms) s.model.visible = false;
  for (const n of FIELD.npcs) n.model.visible = false;
  if (FIELD.area === 'world') {
    const P = FIELD.P; const a = chooseBattleDir(P.x, P.z, P.h);
    BT.C.set(P.x, P.y, P.z); BT.F.set(Math.sin(a), 0, Math.cos(a)); BT.R.set(Math.cos(a), 0, -Math.sin(a)); BT.arena = null;
    BT.gy = (x, z) => groundY(x, z);
    BT.lights = DARK_TORCHES();
  } else {
    const key = opts.arena || DMAPS[FIELD.area].theme; const A = ARENA[key];
    DUNG[FIELD.area].grp.visible = false; A.grp.visible = true; BT.arena = A;
    BT.C.set(A.x, 0, A.z + 4); BT.F.set(0, 0, -1); BT.R.set(1, 0, 0); BT.gy = () => 0; BT.lights = A.torches;
  }
  placeBattle();
  GAME.grassAway = true;
  BT.t = 0; BT.camT = 0; BT.focus = null; BT.snap = true;
  AU.play(opts.music || (BT.boss ? 'boss' : 'battle'), { restart: true });
  $('#bwrap').classList.remove('hide'); drawBParty();
  enemyWin = UI.panel('', { left: 'max(10px,env(safe-area-inset-left))', bottom: 'calc(max(14px,env(safe-area-inset-bottom)) + 150px)', minWidth: '170px', fontSize: '17px', lineHeight: '1.5' });
  drawEnemyWin();
  $('#fade').style.transition = 'opacity .4s'; $('#fade').style.opacity = '0';
  await sleep(350);
  if (opts.intro) await opts.intro();
  else {
    const names = Object.keys(cnt).map(id => MONS[id].name + (cnt[id] > 1 ? 'たち' : ''));
    await UI.msg(names.join('と ') + 'が あらわれた！', { append: false, auto: 900, voice: true });
  }
  const res = await battleLoop(opts);
  return res;
}
function DARK_TORCHES() { return TORCHES; }
// ---------------------------------------------------------------- main loop
async function battleLoop(opts) {
  let round = 0;
  rounds: while (true) {
    round++;
    // ---- command phase
    const acts = [];
    let fled = false;
    let top;
    while (true) {
      UI.msgBuf = '';
      top = await UI.choose([{ label: 'たたかう' }, { label: 'おまかせ' }, { label: 'にげる' }], { cancel: false, style: cmdStyle(), title: 'コマンド' });
      if (top === 0) { const r = await chooseCommands(); if (r) { acts.push(...r); break; } }
      else if (top === 1) { acts.push(...autoCommands()); break; }
      else break;
    }
    BT.cur = -1; drawBParty();
    if (top === 2) {
      await bmsg('ふーたんたちは にげだした！', 500);
      if (opts.noRun || BT.boss) { await bmsg('しかし まわりこまれて しまった！', 800); }
      else {
        const pa = avg(GAME.party.filter(alive).map(p => pStats(p).agi)), ea = avg(BT.en.filter(alive).map(e => e.agi));
        if (Math.random() < clamp(0.6 + (pa - ea) * 0.012 + (round - 1) * 0.1, 0.3, 0.95)) { AU.run(); await sleep(400); return finishBattle('run'); }
        await bmsg('しかし まわりこまれて しまった！', 800);
      }
    }
    // enemy actions
    for (const e of BT.en) if (alive(e)) { acts.push({ who: e, enemy: true }); if (e.def.twice) acts.push({ who: e, enemy: true }); }
    // order by agility
    for (const a of acts) a.ord = (a.enemy ? a.who.agi : pStats(a.who).agi) * (0.55 + Math.random() * 0.45) + (a.guard ? 999 : 0);
    acts.sort((a, b) => b.ord - a.ord);
    for (const p of GAME.party) p.guard = false;
    for (const a of acts) if (a.guard && !a.enemy) a.who.guard = true;
    for (const a of acts) {
      if (!alive(a.who)) continue;
      if (a.enemy) await enemyAct(a.who); else await partyAct(a);
      drawBParty(); drawEnemyWin();
      if (!GAME.party.some(alive)) return finishBattle('lose');
      if (!BT.en.some(alive)) { if (opts.next) { const nx = opts.next; opts.next = null; await nx(); drawBParty(); drawEnemyWin(); continue rounds; } return finishBattle('win'); }
    }
  }
}
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
function cmdStyle() { return { left: 'max(10px,env(safe-area-inset-left))', bottom: 'calc(max(14px,env(safe-area-inset-bottom)) + 150px)', minWidth: '170px', zIndex: 2 }; }
function subStyle() { return { left: 'calc(max(10px,env(safe-area-inset-left)) + min(188px, 44vw))', bottom: 'calc(max(14px,env(safe-area-inset-bottom)) + 150px)', minWidth: '210px', maxHeight: '46vh', overflowY: 'auto' }; }
async function chooseCommands() {
  const out = [];
  const members = GAME.party.map((p, i) => i).filter(i => alive(GAME.party[i]) && !GAME.party[i].sleep);
  let k = 0;
  while (k < members.length) {
    const i = members[k], p = GAME.party[i]; BT.cur = i; drawBParty();
    const sp = spellsOf(p).filter(s => SPELLS[s].battle !== false);
    const c = await UI.choose([{ label: 'こうげき' }, { label: p.id === 'pochi' ? 'わざ' : 'じゅもん', disabled: !sp.length }, { label: 'どうぐ', disabled: !GAME.bagList(true).length }, { label: 'ぼうぎょ' }], { style: cmdStyle(), title: CHARS[p.id].name });
    if (c < 0) { if (k === 0) { BT.cur = -1; drawBParty(); return null; } k--; out.pop(); continue; }
    let act = null;
    if (c === 0) { const t = await pickEnemy(); if (t) act = { who: p, kind: 'atk', tgt: t }; }
    else if (c === 1) {
      const desc = UI.panel('', { left: '50%', transform: 'translateX(-50%)', top: 'calc(max(10px,env(safe-area-inset-top)) + 130px)', fontSize: '15px', minWidth: '260px', textAlign: 'center' });
      const si = await UI.choose(sp.map(s => ({ label: SPELLS[s].name, right: SPELLS[s].mp, disabled: p.mp < SPELLS[s].mp, desc: SPELLS[s].desc })), { style: subStyle(), title: 'MP ' + p.mp, desc });
      desc.remove();
      if (si >= 0) { const s = SPELLS[sp[si]]; const t = await pickTarget(s.tgt); if (t) act = { who: p, kind: 'spell', spell: sp[si], tgt: t }; }
    } else if (c === 2) {
      const bag = GAME.bagList(true);
      const ii = await UI.choose(bag.map(([id, n]) => ({ label: ITEMS[id].name, right: n, desc: ITEMS[id].desc })), { style: subStyle(), title: 'どうぐ' });
      if (ii >= 0) { const it = ITEMS[bag[ii][0]]; const t = await pickTarget(it.tgt); if (t) act = { who: p, kind: 'item', item: bag[ii][0], tgt: t }; }
    } else if (c === 3) act = { who: p, kind: 'guard', guard: true };
    if (act) { out.push(act); k++; }
  }
  return out;
}
async function pickEnemy() {
  const live = BT.en.filter(alive);
  if (live.length === 1) return live[0];
  const marker = arrowMarker();
  const r = await UI.choose(live.map(e => ({ label: e.name, right: '' })), { style: subStyle(), title: 'だれを？', onSel: i => { BT.focus = live[i]; marker.target = live[i]; } });
  marker.remove(); BT.focus = null;
  return r >= 0 ? live[r] : null;
}
async function pickTarget(t) {
  if (t === 'enemy') return pickEnemy();
  if (t === 'enemies') return 'enemies';
  if (t === 'allies') return 'allies';
  if (t === 'none') return 'none';
  const list = GAME.party.filter(p => t === 'dead' ? !alive(p) : alive(p));
  if (!list.length) { AU.cancel(); return null; }
  const r = await UI.choose(list.map(p => ({ label: CHARS[p.id].name, right: `HP ${p.hp}` })), { style: subStyle(), title: 'だれに？' });
  return r >= 0 ? list[r] : null;
}
let ARROW;
function arrowMarker() {
  if (!ARROW) { ARROW = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 4), new THREE.MeshBasicMaterial({ color: 0xffd45a })); ARROW.rotation.x = Math.PI; }
  scene.add(ARROW); const o = { target: BT.en.find(alive), remove() { scene.remove(ARROW); ARROW.userData.o = null; } };
  ARROW.userData.o = o; return o;
}
function autoCommands() {
  const out = [];
  for (const p of GAME.party) {
    if (!alive(p) || p.sleep) continue;
    const sp = spellsOf(p), st = pStats(p), live = BT.en.filter(alive);
    const weakest = live.reduce((a, b) => a.hp < b.hp ? a : b);
    const low = GAME.party.filter(q => alive(q) && q.hp < pStats(q).maxhp * (BT.boss ? 0.5 : 0.4));
    const dead = GAME.party.filter(q => !alive(q));
    const can = s => sp.includes(s) && p.mp >= SPELLS[s].mp;
    if (dead.length && can('revive')) { out.push({ who: p, kind: 'spell', spell: 'revive', tgt: dead[0] }); continue; }
    if (dead.length && GAME.bag.leaf && p.id !== 'ricky' && !out.some(a => a.item === 'leaf')) { out.push({ who: p, kind: 'item', item: 'leaf', tgt: dead[0] }); continue; }
    if (low.length >= 2 && can('healall')) { out.push({ who: p, kind: 'spell', spell: 'healall', tgt: 'allies' }); continue; }
    if (low.length) {
      const lo = low.reduce((a, b) => a.hp / pStats(a).maxhp < b.hp / pStats(b).maxhp ? a : b);
      if (can('heal2') && pStats(lo).maxhp - lo.hp > 60) { out.push({ who: p, kind: 'spell', spell: 'heal2', tgt: lo }); continue; }
      if (can('heal1')) { out.push({ who: p, kind: 'spell', spell: 'heal1', tgt: lo }); continue; }
      const it = GAME.bag.candy ? 'candy' : GAME.bag.band ? 'band' : null;
      if (it && lo.hp < pStats(lo).maxhp * 0.3 && !out.some(a => a.kind === 'item' && a.tgt === lo)) { out.push({ who: p, kind: 'item', item: it, tgt: lo }); continue; }
    }
    if (p.id === 'ricky') {
      if (live.length >= 2 && can('fire2') && p.mp > 16) { out.push({ who: p, kind: 'spell', spell: 'fire2', tgt: 'enemies' }); continue; }
      if (live.length >= 2 && can('wind') && p.mp > 10) { out.push({ who: p, kind: 'spell', spell: 'wind', tgt: 'enemies' }); continue; }
      if (can('fire1') && p.mp > 6) { out.push({ who: p, kind: 'spell', spell: 'fire1', tgt: BT.boss ? live[0] : weakest }); continue; }
    }
    if (p.id === 'futan') {
      if (BT.boss && can('hero') && p.mp > 14) { out.push({ who: p, kind: 'spell', spell: 'hero', tgt: live[0] }); continue; }
      if (live.length >= 3 && can('light2') && p.mp > 10) { out.push({ who: p, kind: 'spell', spell: 'light2', tgt: 'enemies' }); continue; }
    }
    if (p.id === 'pochi') {
      if (BT.boss && can('howl') && live[0].atkMul > 0.8 && Math.random() < 0.5) { out.push({ who: p, kind: 'spell', spell: 'howl', tgt: 'enemies' }); continue; }
      if (can('wonder') && Math.random() < 0.5) { out.push({ who: p, kind: 'spell', spell: 'wonder', tgt: BT.boss ? live[0] : weakest }); continue; }
      if (can('bite') && Math.random() < 0.4) { out.push({ who: p, kind: 'spell', spell: 'bite', tgt: BT.boss ? live[0] : weakest }); continue; }
    }
    out.push({ who: p, kind: 'atk', tgt: weakest });
  }
  return out;
}
// ---------------------------------------------------------------- actions
const pname = p => CHARS[p.id].name;
const headPos = (e) => e.model.position.clone().add(new V3(0, (e.def ? (e.def.model === 'bigdragon' ? 4.2 : e.def.boss ? 2.6 : e.def.model === 'bat' ? 1.1 : 0.9) * (e.def.scale || 1) : 1.0), 0));
const midPos = (e) => e.model.position.clone().add(new V3(0, e.def ? (e.def.model === 'bigdragon' ? 2.5 : e.def.boss ? 1.6 : e.def.model === 'bat' ? 1.0 : 0.5) * (e.def.scale || 1) : 0.6, 0));
async function moveModel(m, to, dur) {
  const from = m.position.clone(), t0 = performance.now();
  while (true) { const k = Math.min(1, (performance.now() - t0) / (dur * 1000 / GAME.bspeed)); m.position.lerpVectors(from, to, smooth(k)); m.userData.moving = k < 1; if (k >= 1) break; await sleep(16); }
  m.userData.moving = false;
}
function retarget(t) { if (t && t.hp > 0) return t; const l = BT.en.filter(alive); return l[Math.floor(Math.random() * l.length)]; }
async function partyAct(a) {
  const p = a.who, st = pStats(p), m = partyModel(p.id);
  BT.focus = null;
  if (p.sleep) {
    if (p.sleep > 1 && Math.random() < 0.5) { p.sleep = 0; await bmsg(pname(p) + 'は めを さました！'); setAct(m, null); }
    else { p.sleep++; fxSleep(m.position.clone().add(new V3(0, 1.1, 0))); await bmsg(pname(p) + 'は ぐうぐう ねむっている…'); return; }
  }
  if (a.kind === 'guard') { setAct(m, 'guard'); await bmsg(pname(p) + 'は みを まもっている。', 500); return; }
  if (a.kind === 'atk' || (a.kind === 'spell' && SPELLS[a.spell].kind === 'phys')) {
    const sp = a.kind === 'spell' ? SPELLS[a.spell] : null;
    if (sp) { if (p.mp < sp.mp) { await bmsg(pname(p) + 'の ' + sp.name + '！ しかし MPが たりない！'); return; } p.mp -= sp.mp; drawBParty(); }
    const t = retarget(a.tgt); if (!t) return;
    BT.focus = t;
    const hit = p.id === 'pochi' ? (sp ? ['がぶがぶっ！', 'わんっ！'][0] : '') : '';
    await bmsg(sp ? `${pname(p)}の ${sp.name}！` : `${pname(p)}の こうげき！`, 260);
    const near = t.model.position.clone().addScaledVector(BT.F, -1.3 * Math.max(1, (t.def.scale || 1) * (t.def.boss ? 1.8 : 1))); near.y = BT.gy(near.x, near.z);
    m.lookAt(t.model.position.x, m.position.y, t.model.position.z);
    await moveModel(m, near, 0.28);
    setAct(m, 'attack'); AU.tone(300, 0.08, 'triangle', 0.08, null, 600);
    await sleep(220 / GAME.bspeed);
    let crit = Math.random() < (p.id === 'futan' ? 1 / 16 : 1 / 28);
    let dmg = physDamage(st.atk, t.df * t.defMul, crit) * (sp ? sp.mult : 1);
    dmg = Math.round(dmg);
    if (crit) { screenFlash('#fff', 0.5, 250); AU.crit(); }
    await hitEnemy(t, dmg, crit, p.id === 'pochi' ? 0xffe0a0 : 0xffffff);
    if (crit) await bmsg('かいしんの いちげき！！', 300);
    await bmsg(dmg > 0 ? `${t.name}に ${dmg}の ダメージ！` : `ミス！ ${t.name}に ダメージを あたえられない！`, 420);
    await killCheck(t);
    await moveModel(m, p.home, 0.3);
    m.rotation.y = Math.atan2(BT.F.x, BT.F.z);
    return;
  }
  if (a.kind === 'spell') {
    const s = SPELLS[a.spell];
    if (p.mp < s.mp) { await bmsg(`${pname(p)}は ${s.name}を となえた！ しかし MPが たりない！`); return; }
    p.mp -= s.mp; drawBParty();
    setAct(m, 'cast'); AU.magic();
    for (let i = 0; i < 16; i++) fxP({ p: m.position.clone().add(new V3(0, 0.6, 0)).add(rv(0.8)), v: new V3(0, 1.5, 0), color: s.kind === 'heal' ? 0x9aff9a : 0xd8c0ff, size: 0.2, life: 0.6 });
    await bmsg(`${pname(p)}は ${s.name}を となえた！`, 420);
    await castSpell(p, s, a.tgt, st);
    return;
  }
  if (a.kind === 'item') {
    const it = ITEMS[a.item];
    if (!GAME.bag[a.item]) { await bmsg(`しかし ${it.name}は もう ない！`); return; }
    GAME.useItem(a.item);
    await bmsg(`${pname(p)}は ${it.name}を つかった！`, 420);
    await applyItem(it, a.tgt);
  }
}
function physDamage(atk, def, crit) {
  if (crit) return atk * (0.95 + Math.random() * 0.1);
  const base = (atk - def / 2) / 2;
  if (base < 1) return Math.random() < 0.5 ? 0 : 1;
  return Math.max(0, base * (0.85 + Math.random() * 0.3));
}
async function hitEnemy(t, dmg, crit, color) {
  const hp = midPos(t);
  if (dmg > 0) {
    fxSlash(hp, color); AU.hit(crit);
    t.hp = Math.max(0, t.hp - dmg); if (t.sleep && Math.random() < 0.6) t.sleep = 0;
    dmgNum(headPos(t), dmg, crit ? 'crit' : '');
    blinkEnemy(t);
  } else { AU.miss(); dmgNum(headPos(t), 'ミス', 'miss'); }
}
function blinkEnemy(t) {
  const m = t.model; let n = 0;
  const iv = setInterval(() => { m.visible = !m.visible; if (++n >= 6) { clearInterval(iv); m.visible = true; } }, 55);
  for (const mt of m.userData.mats) if (mt.emissive) { mt.emissive.setRGB(1, 1, 1); setTimeout(() => { if (mt.userData.baseEm) mt.emissive.copy(mt.userData.baseEm); }, 160); }
}
async function killCheck(t) {
  if (t.hp > 0 || t.dead) return;
  t.dead = true; AU.defeat();
  const m = t.model, t0 = performance.now(); const p0 = midPos(t);
  fxBurst(p0, 0xffffff, 24, 3, 0.3, 0.7); fxBurst(p0, 0xc8a0ff, 16, 2, 0.4, 0.9);
  for (const mt of m.userData.mats) { mt.transparent = true; }
  while (true) { const k = (performance.now() - t0) / 450; if (k >= 1) break; m.scale.setScalar((t.def.scale || 1) * (1 - k * 0.6)); for (const mt of m.userData.mats) mt.opacity = (mt.userData.baseOp || 1) * (1 - k); await sleep(16); }
  m.visible = false;
  await bmsg(`${t.name}を やっつけた！`, 380);
}
async function castSpell(p, s, tgt, st) {
  const m = partyModel(p.id);
  if (s.kind === 'dmg') {
    const targets = tgt === 'enemies' ? BT.en.filter(alive) : [retarget(tgt)].filter(Boolean);
    if (s.fx === 'fire' || s.fx === 'light') { const t = targets[0]; BT.focus = t; await fxFireball(m.position.clone().add(new V3(0, 0.8, 0)), midPos(t), s.fx === 'light' ? 0xfff6a0 : 0xff8a30); if (s.fx === 'fire') AU.fire(); else AU.magic(); }
    else if (s.fx === 'stars') { for (const t of targets) fxStars(midPos(t)); AU.magic(); await sleep(500); }
    else if (s.fx === 'wind') { for (const t of targets) fxWind(t.model.position.clone()); AU.run(); await sleep(450); }
    else if (s.fx === 'volcano') { screenFlash('#ff8a30', 0.35, 400); for (const t of targets) fxColumn(t.model.position.clone()); AU.fire(); CAM.shake = 0.6; await sleep(500); }
    else if (s.fx === 'hero') { screenFlash('#fff', 0.8, 500); fxHero(targets[0].model.position.clone()); AU.magic(); await sleep(600); }
    for (const t of targets) {
      const dmg = Math.round(mr(s.pow[0], s.pow[1]) * (st.mag || 1) * (p.id === 'ricky' ? 1 + (p.lv - 1) * 0.012 : 1));
      t.hp = Math.max(0, t.hp - dmg); dmgNum(headPos(t), dmg); blinkEnemy(t); if (t.sleep && Math.random() < 0.5) t.sleep = 0;
      await bmsg(`${t.name}に ${dmg}の ダメージ！`, 380);
      await killCheck(t);
    }
  } else if (s.kind === 'heal') {
    const targets = tgt === 'allies' ? GAME.party.filter(alive) : [tgt];
    AU.heal();
    for (const t of targets) {
      if (!alive(t)) { await bmsg(`しかし ${pname(t)}は たおれている…`); continue; }
      const mx = pStats(t).maxhp, h = Math.min(mx - t.hp, Math.round(mr(s.pow[0], s.pow[1])));
      t.hp += h; fxHeal(partyModel(t.id).position.clone()); dmgNum(partyModel(t.id).position.clone().add(new V3(0, 1, 0)), h, 'heal'); drawBParty();
      await bmsg(t.hp >= mx ? `${pname(t)}の けがが ぜんぶ なおった！` : `${pname(t)}の HPが ${h} かいふくした！`, 420);
    }
  } else if (s.kind === 'revive') {
    const t = tgt; if (alive(t)) { await bmsg('しかし なにも おこらなかった。'); return; }
    if (Math.random() < 0.85) { t.hp = Math.ceil(pStats(t).maxhp / 2); t.sleep = 0; setAct(partyModel(t.id), null); fxHeal(partyModel(t.id).position.clone()); AU.heal(); await bmsg(`${pname(t)}が げんきに おきあがった！`); }
    else await bmsg('しかし うまく いかなかった…');
  } else if (s.kind === 'sleep') {
    AU.sleep();
    for (const t of BT.en.filter(alive)) {
      fxSleep(headPos(t));
      const ch = t.id === 'king2' || t.id === 'king1' ? 0 : t.def.boss ? 0.18 : 0.7;
      if (Math.random() < ch) { t.sleep = 1; await bmsg(`${t.name}は ねむって しまった！ Zzz…`, 380); }
      else await bmsg(`${t.name}には きかなかった！`, 380);
    }
  } else if (s.kind === 'weaken') {
    AU.bark(); CAM.shake = 0.3;
    for (const t of BT.en.filter(alive)) {
      if (t.atkMul <= 0.55) { await bmsg(`${t.name}の ちからは もう さがらない！`, 380); continue; }
      t.atkMul = Math.max(0.5, t.atkMul - 0.25); fxBurst(midPos(t), 0x9ac8ff, 12, 2, 0.25, 0.6);
      await bmsg(`${t.name}は びっくりして ちからが さがった！`, 380);
    }
  }
}
async function applyItem(it, tgt) {
  if (it.kind === 'heal' || it.kind === 'mp') {
    if (!alive(tgt)) { await bmsg('しかし なにも おこらなかった。'); return; }
    const s = pStats(tgt); AU.heal(); fxHeal(partyModel(tgt.id).position.clone());
    if (it.kind === 'heal') { const h = Math.min(s.maxhp - tgt.hp, it.pow + mi(-3, 3)); tgt.hp += h; dmgNum(partyModel(tgt.id).position.clone().add(new V3(0, 1, 0)), h, 'heal'); await bmsg(`${pname(tgt)}の HPが ${h} かいふくした！`); }
    else { const h = Math.min(s.maxmp - tgt.mp, it.pow); tgt.mp += h; await bmsg(`${pname(tgt)}の MPが ${h} かいふくした！`); }
  } else if (it.kind === 'revive') {
    if (alive(tgt)) { await bmsg('しかし なにも おこらなかった。'); return; }
    tgt.hp = Math.ceil(pStats(tgt).maxhp / 2); setAct(partyModel(tgt.id), null); AU.heal(); fxHeal(partyModel(tgt.id).position.clone());
    await bmsg(`${pname(tgt)}が げんきに おきあがった！`);
  }
  drawBParty();
}
async function enemyAct(e) {
  BT.focus = null;
  if (e.sleep) {
    if (e.sleep > 1 && Math.random() < 0.45) { e.sleep = 0; await bmsg(`${e.name}は めを さました！`, 400); }
    else { e.sleep++; fxSleep(headPos(e)); await bmsg(`${e.name}は ねむっている…`, 400); return; }
  }
  let actId = e.def.act ? wpick(e.def.act) : 'atk';
  if (actId === 'nightheal' && (e.hp > e.maxhp * 0.6 || e.healed > 2)) actId = 'atk';
  if (actId === 'nightheal') e.healed = (e.healed || 0) + 1;
  const livep = GAME.party.filter(alive); if (!livep.length) return;
  const tgt = livep[Math.floor(Math.random() * livep.length)];
  const m = e.model;
  const lunge = async (fn) => {
    const to = m.position.clone().addScaledVector(BT.F, -1.2); to.y = m.position.y;
    await moveModel(m, to, 0.18); await fn(); await moveModel(m, e.home, 0.25);
  };
  if (actId === 'atk' || MSKILL[actId] && MSKILL[actId].kind === 'phys') {
    const sk = actId === 'atk' ? null : MSKILL[actId];
    await bmsg(sk ? sk.msg.replace('{n}', e.name) : `${e.name}の こうげき！`, 300);
    await lunge(async () => {
      const st = pStats(tgt);
      let dmg = Math.round(physDamage(e.atk * e.atkMul * (sk ? sk.mult : 1), st.def) * (tgt.guard ? 0.5 : 1));
      await hurtParty(tgt, dmg);
    });
    return;
  }
  const sk = MSKILL[actId];
  await bmsg(sk.msg.replace('{n}', e.name), 500);
  if (sk.kind === 'none') { fxSleep(headPos(e)); return; }
  if (sk.kind === 'buff') { e.defMul = Math.min(1.6, e.defMul * 1.3); fxBurst(midPos(e), 0x9ac8ff, 14, 2, 0.3, 0.6); return; }
  if (sk.kind === 'selfheal') { const h = Math.min(e.maxhp - e.hp, Math.round(mr(sk.pow[0], sk.pow[1]))); e.hp += h; fxHeal(e.model.position.clone()); AU.heal(); await bmsg(`${e.name}の HPが ${h} かいふくした！`); return; }
  if (sk.kind === 'sleep') {
    AU.sleep();
    const tg = sk.tgt === 'all' ? livep : [tgt];
    for (const t of tg) {
      fxSleep(partyModel(t.id).position.clone().add(new V3(0, 1.1, 0)));
      if (!t.sleep && Math.random() < sk.chance) { t.sleep = 1; setAct(partyModel(t.id), 'sleep'); await bmsg(`${pname(t)}は ねむって しまった！`, 450); }
      else if (sk.tgt !== 'all') await bmsg(`しかし ${pname(t)}は ねむらなかった！`, 450);
    }
    if (sk.tgt === 'all' && !tg.some(t => t.sleep === 1)) await bmsg('しかし だれも ねむらなかった！', 450);
    drawBParty(); return;
  }
  if (sk.kind === 'magic') {
    const tg = sk.tgt === 'all' ? livep : [tgt];
    const from = headPos(e);
    if (sk.fx === 'breath') { fxBreath(from, BT.C.clone().add(new V3(0, 0.6, 0))); AU.fire(); await sleep(600); }
    else if (sk.fx === 'thunder') { AU.thunder(); screenFlash('#e0d0ff', 0.8, 400); fxThunder(partyModel(tgt.id).position.clone()); await sleep(300); }
    else if (sk.fx === 'dark') { for (const t of tg) fxDark(partyModel(t.id).position.clone().add(new V3(0, 0.6, 0))); AU.magic(); await sleep(400); }
    else { for (const t of tg) fxBurst(partyModel(t.id).position.clone().add(new V3(0, 0.6, 0)), 0xbfe8ff, 18, 2.5, 0.3, 0.7); AU.magic(); await sleep(300); }
    for (const t of tg) { if (!alive(t)) continue; const dmg = Math.round(mr(sk.pow[0], sk.pow[1]) * (t.guard ? 0.5 : 1)); await hurtParty(t, dmg); }
  }
}
async function hurtParty(t, dmg) {
  const m = partyModel(t.id);
  if (dmg <= 0) { AU.miss(); dmgNum(m.position.clone().add(new V3(0, 1, 0)), 'ミス', 'miss'); await bmsg(`${pname(t)}は ひらりと かわした！`, 380); return; }
  t.hp = Math.max(0, t.hp - dmg); AU.hurt(); CAM.shake = Math.min(1, 0.25 + dmg / 80);
  if (t.sleep && Math.random() < 0.5) { t.sleep = 0; setAct(m, null); }
  setAct(m, 'hurt'); screenFlash('#ff2a1a', 0.25, 220);
  dmgNum(m.position.clone().add(new V3(0, 1, 0)), dmg, 'hurt');
  drawBParty();
  await bmsg(`${pname(t)}は ${dmg}の ダメージを うけた！`, 420);
  if (t.hp <= 0) { t.sleep = 0; setAct(m, 'down'); AU.tone(200, 0.6, 'triangle', 0.1, null, 80); await bmsg(`${pname(t)}は たおれて しまった…`, 600); }
}
// ---------------------------------------------------------------- end
async function finishBattle(res) {
  BT.focus = null; BT.cur = -1; drawBParty();
  if (res === 'win') {
    const exp = BT.en.reduce((a, e) => a + e.def.exp, 0), gold = BT.en.reduce((a, e) => a + Math.round(e.def.gold * (0.9 + Math.random() * 0.2)), 0);
    AU.stop(0.2); AU.noResume = true; AU.jingle('win'); AU.noResume = false;
    for (const p of GAME.party) if (alive(p)) setAct(partyModel(p.id), 'cheer');
    if (exp || gold) {
      await UI.msg(BT.en.length > 1 ? 'まものたちを やっつけた！' : `${BT.en[0].def.name}を やっつけた！`, { append: true, auto: 900, voice: true });
      if (exp) await bmsg(`それぞれ ${exp}ポイントの けいけんちを かくとく！`, 900);
      if (gold) { GAME.gold += gold; await bmsg(`${gold}ゴールドを てにいれた！`, 800); }
      for (const e of BT.en) if (e.def.drop && Math.random() < e.def.drop[1]) { GAME.addItem(e.def.drop[0], 1); AU.jingle('item'); await bmsg(`${e.def.name}は ${ITEMS[e.def.drop[0]].name}を おとしていった！`, 900); break; }
      for (const p of GAME.party) if (alive(p)) { p.exp += exp; await levelUps(p); }
    }
    await sleep(300);
  }
  if (res === 'lose') {
    AU.stop(0.3); await AU.jingle('bad');
    await UI.msg('ふーたんたちは ちからつきて しまった…', { append: true, voice: true });
  }
  BT.result = res;
  return res;
}
async function levelUps(p) {
  while (p.lv < MAXLV && p.exp >= expFor(p.lv + 1)) {
    const before = pStats(p), oldSp = spellsOf(p);
    p.lv++;
    const after = pStats(p);
    p.hp += after.maxhp - before.maxhp; p.mp += after.maxmp - before.maxmp;
    await AU.jingle('lvup');
    setAct(partyModel(p.id), 'cheer'); fxBurst(partyModel(p.id).position.clone().add(new V3(0, 1, 0)), 0xffe08a, 30, 3, 0.3, 1);
    await UI.msg(`${pname(p)}は レベル${p.lv}に あがった！`, { append: true, voice: true });
    const parts = [];
    if (after.atk - before.atk) parts.push(`ちから +${after.atk - before.atk}`);
    if (after.maxhp - before.maxhp) parts.push(`HP +${after.maxhp - before.maxhp}`);
    if (after.maxmp - before.maxmp) parts.push(`MP +${after.maxmp - before.maxmp}`);
    if (after.def - before.def) parts.push(`まもり +${after.def - before.def}`);
    await UI.msg(parts.join('　'), { append: true, auto: 1100, voice: false });
    for (const s of spellsOf(p)) if (!oldSp.includes(s)) await UI.msg(`${pname(p)}は ${SPELLS[s].name}を おぼえた！`, { append: true, voice: true });
    drawBParty();
  }
}
async function endBattleScene() {
  await fadeOut(350);
  UI.clearAll(); enemyWin = null;
  for (const e of BT.en) { scene.remove(e.model); }
  BT.en = []; BT.on = false; GAME.grassAway = false;
  $('#bwrap').classList.add('hide');
  if (BT.arena) { BT.arena.grp.visible = false; DUNG[FIELD.area].grp.visible = true; BT.arena = null; }
  for (const p of GAME.party) { const m = partyModel(p.id); setAct(m, null); m.userData.body.rotation.set(0, 0, 0); m.userData.body.position.y = 0; p.sleep = 0; p.guard = false; }
  for (const s of FIELD.syms) s.model.visible = true;
  GAME.mode = 'event';
  syncFollowers(true);
  const P = FIELD.P; P.model.position.set(P.x, P.y, P.z); P.model.rotation.y = P.h;
  CAM.yaw = P.h + Math.PI; CAM.x = P.x + Math.sin(CAM.yaw) * 6; CAM.z = P.z + Math.cos(CAM.yaw) * 6; CAM.y = P.y + 3; CAM.lx = CAM.ly = CAM.lz = null;
  $('#hud').classList.remove('hide'); if (isTouch) $('#touch').classList.remove('hide');
  GAME.refreshHUD();
}
function updateBattleCam(dt, time) {
  BT.camT += dt;
  const sway = Math.sin(BT.camT * 0.25) * 0.22;
  const f = BT.F.clone().applyAxisAngle(new V3(0, 1, 0), sway);
  const big = BT.en.some(e => e.def.boss) ? (BT.en.some(e => e.def.model === 'bigdragon') ? 1.6 : 1.25) : 1;
  let look = BT.C.clone().addScaledVector(BT.F, 4.2).add(new V3(0, 0.2 + 0.7 * big, 0));
  let pos = BT.C.clone().addScaledVector(f, -3.6 * big).add(new V3(0, 2.1 * big, 0)).addScaledVector(BT.R, (2.6 + 0.8 * Math.sin(BT.camT * 0.17)) * big);
  if (BT.focus && BT.focus.model) { const fp = midPos(BT.focus); look.lerp(fp, 0.35); pos.lerp(fp.clone().addScaledVector(BT.F, -5 * big).add(new V3(0, 1.6 * big, 0)), 0.25); }
  const k = BT.snap ? 1 : 1 - Math.exp(-3 * dt); BT.snap = false;
  CAM.x = lerp(CAM.x, pos.x, k); CAM.y = lerp(CAM.y, pos.y, k); CAM.z = lerp(CAM.z, pos.z, k);
  CAM.lx = CAM.lx == null ? look.x : lerp(CAM.lx, look.x, k); CAM.ly = CAM.ly == null ? look.y : lerp(CAM.ly, look.y, k); CAM.lz = CAM.lz == null ? look.z : lerp(CAM.lz, look.z, k);
  camera.position.set(CAM.x, CAM.y, CAM.z);
  if (CAM.shake > 0) { CAM.shake = Math.max(0, CAM.shake - dt * 2.5); camera.position.x += (Math.random() - 0.5) * CAM.shake * 0.25; camera.position.y += (Math.random() - 0.5) * CAM.shake * 0.25; }
  camera.lookAt(CAM.lx, CAM.ly, CAM.lz);
  for (const e of BT.en) if (!e.dead) animMonster(e.model, dt, !!e.model.userData.moving);
  for (const p of GAME.party) animChar(partyModel(p.id), dt, partyModel(p.id).userData.moving ? 1 : 0);
  if (ARROW && ARROW.userData.o && ARROW.userData.o.target) { const t = ARROW.userData.o.target; ARROW.position.copy(headPos(t)).add(new V3(0, 0.45 + Math.sin(time * 6) * 0.1, 0)); ARROW.rotation.y += dt * 3; }
}
