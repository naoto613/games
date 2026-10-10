// ================================================================ children (+ the cat) driven by generator scripts
const AG_ROOT = { 1: new THREE.Group(), 2: new THREE.Group() };
FG[1].add(AG_ROOT[1]); FG[2].add(AG_ROOT[2]);
const SPEED = { sota: 2.0, hinata: 2.3, mio: 2.1, kento: 1.8, monaka: 2.4 };
class Agent {
  constructor(id) {
    this.isAgent = true; this.id = id; this.def = CHAR_DEF[id]; this.name = this.def.name;
    this.mesh = id === 'monaka' ? buildCat() : buildPerson(id);
    this.P = this.mesh.userData.parts; this.H = this.P.H;
    if (id !== 'monaka') { this.mesh.scale.setScalar(1.3); this.H *= 1.3; }
    this.floor = 1; this.pos = new V3(); this.yaw = 0; this.yawT = 0; this.home = false;
    this.stack = []; this.epoch = 0; this.susp = 0; this.mode = 'normal'; this.cause = null;
    this.fov = 120; this.spd = SPEED[id]; this.moving = 0; this.anim = 'idle'; this.animT = 0; this.focus = 0;
    this.bub = null; this.prop = null; this.carry = null; this.lock = 0; this.expr = 'n'; this.walkPh = 0; this.seat = 0;
    this.style = 'look'; this.inspect = null; this.cone = null; this.searchRoom = null; this.asleep = false;
    AG_ROOT[1].add(this.mesh); this.mesh.visible = false;
  }
  get room() { return roomAt(this.floor, this.pos.x, this.pos.z); }
  setFloor(f) { if (this.floor === f) return; this.floor = f; AG_ROOT[f].add(this.mesh); if (this.carry) { const o = this.carry; o.floor = f; OBJ_ROOT[f].add(o.g); } }
  place(sp) { const s = typeof sp === 'string' ? spot(sp) : sp; this.setFloor(s.f); this.pos.set(s.x, 0, s.z); if (s.yaw != null) this.yaw = this.yawT = s.yaw; }
  push(gen, force) { if (this.lock && !force) return false; this.stack.push(gen); this.epoch++; return true; }
  clearStack() { this.stack.length = 1; this.epoch++; }
  setProp(kind) {
    if (this.prop) { this.prop.parent && this.prop.parent.remove(this.prop); this.prop = null; }
    if (kind) { this.prop = propMesh(kind); this.P.hand.add(this.prop); this.propKind = kind; } else this.propKind = null;
  }
  tick(dts) {
    // run script
    let guard = 0;
    while (this.stack.length && guard++ < 4) {
      const g = this.stack[this.stack.length - 1];
      let r; try { r = g.next(); } catch (e) { console.error(this.id, e); r = { done: true }; }
      if (r.done) { const i = this.stack.lastIndexOf(g); if (i >= 0) this.stack.splice(i, 1); this.epoch++; continue; }
      break;
    }
  }
  animate(dt) {
    const m = this.mesh; m.visible = this.home && !World.blind;
    if (this.jump > 0) { this.jump -= dt; }
    if (!this.home) return;
    this.yaw = dampAng(this.yaw, this.yawT, 9, dt);
    // stairs height
    let y = 0;
    if (this.floor === 1 && this.pos.x < STAIRS.x1 && this.pos.x > STAIRS.x0 - 0.3 && this.pos.z < STAIRS.z1 && this.pos.z > STAIRS.z0) y = clamp((STAIRS.x1 - this.pos.x) / (STAIRS.x1 - STAIRS.x0), 0, 1) * 3.0;
    this.pos.y = y;
    m.position.copy(this.pos); m.rotation.y = this.yaw;
    const P = this.P; this.animT += dt;
    const sit = this.anim === 'sit' || this.anim === 'tv' || this.anim === 'sleep' || this.anim === 'stare';
    if (this.moving > 0.01) {
      this.walkPh += dt * (this.id === 'monaka' ? 14 : 9) * Math.min(1.8, this.moving / 1.6);
      const s = Math.sin(this.walkPh);
      if (this.id === 'monaka') { P.legs.forEach((l, i) => l.rotation.x = s * 0.6 * (i % 2 ? 1 : -1) * (i < 2 ? 1 : -1)); }
      else { P.legs[0].rotation.x = s * 0.55; P.legs[1].rotation.x = -s * 0.55; P.arms[0].rotation.x = -s * 0.5; if (!this.prop) P.arms[1].rotation.x = s * 0.5; }
      m.children[0].position.y = Math.abs(Math.cos(this.walkPh)) * 0.05;
    } else {
      if (this.id !== 'monaka') { P.legs[0].rotation.x = damp(P.legs[0].rotation.x, sit ? -1.3 : 0, 10, dt); P.legs[1].rotation.x = P.legs[0].rotation.x; P.arms[0].rotation.x = damp(P.arms[0].rotation.x, this.anim === 'search' ? -0.6 + Math.sin(this.animT * 3) * 0.3 : 0, 8, dt); }
      else P.legs.forEach(l => l.rotation.x = 0);
      m.children[0].position.y = (sit ? -this.H * 0.12 + Math.sin(this.animT * 2) * 0.008 : Math.sin(this.animT * 2.2) * 0.012) + (this.jump > 0 ? Math.sin(this.jump / 0.5 * Math.PI) * 0.35 : 0) + (this.anim === 'play' ? Math.abs(Math.sin(this.animT * 5)) * 0.04 : 0);
      if (this.anim === 'cry') m.children[0].rotation.z = Math.sin(this.animT * 18) * 0.05; else m.children[0].rotation.z = 0;
    }
    if (this.id !== 'monaka') {
      const ra = this.prop ? (this.propKind === 'umb' || this.propKind === 'umb1' ? -0.15 : -1.15) : (this.anim === 'cook' || this.anim === 'fold' ? -0.9 + Math.sin(this.animT * 6) * 0.25 : this.anim === 'phone' ? -2.2 : null);
      if (ra != null) P.arms[1].rotation.x = damp(P.arms[1].rotation.x, ra, 10, dt);
      else if (this.moving <= 0.01) P.arms[1].rotation.x = damp(P.arms[1].rotation.x, 0, 8, dt);
      P.head.rotation.y = damp(P.head.rotation.y, this.lookSide || 0, 6, dt);
      P.head.rotation.x = damp(P.head.rotation.x, this.anim === 'tv' ? -0.05 : this.anim === 'cook' || this.anim === 'fold' || this.anim === 'read' ? 0.35 : 0, 6, dt);
    } else {
      P.tail.rotation.z = Math.sin(this.animT * 3) * 0.4;
      m.children[0].position.y = this.anim === 'sleep' ? -0.12 : m.children[0].position.y;
    }
    if (this.carry) {
      const o = this.carry; const fw = new V3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
      o.pos.set(this.pos.x + fw.x * 0.45, this.pos.y + (o.id === 'kuma' ? this.H * 0.45 : this.H * 0.42), this.pos.z + fw.z * 0.45);
      o.g.position.copy(o.pos); o.g.rotation.y = this.yaw;
    }
    this.moving = 0;
  }
}
const AG = {};
const KIDS_ALL = ['sota', 'hinata', 'mio', 'kento'];
let FAMILY = []; // kids visiting now (name kept for shared view code)
function initAgents() { for (const id of [...KIDS_ALL, 'monaka']) if (!AG[id]) AG[id] = new Agent(id); }

// ---------------------------------------------------------------- script primitives (generators)
function* until(t) { while (World.time < t) yield; }
function* waitM(m) { const e = World.time + m; while (World.time < e) yield; }
function* waitS(s) { let e = 0; while (e < s) { e += World.dts; yield; } }
function moveToward(a, x, z, spd) {
  const dx = x - a.pos.x, dz = z - a.pos.z, d = Math.hypot(dx, dz);
  if (d < 0.05) { a.pos.x = x; a.pos.z = z; return true; }
  const s = Math.min(d, spd * World.dts);
  a.pos.x += dx / d * s; a.pos.z += dz / d * s; a.moving = spd; a.yawT = Math.atan2(dx, dz);
  return d - s < 0.05;
}
function routeTo(a, tgt) {
  const from = a.room || (a.floor === 1 ? 'hall' : 'hall2');
  const rp = roomPath(from, tgt.room); const pts = [];
  if (rp) for (const e of rp) { for (const p of e.pts) pts.push(Object.assign({ via: e.via }, p)); }
  pts.push({ f: tgt.f, x: tgt.x, z: tgt.z });
  return pts;
}
// walk to a spot id or {room,f,x,z,yaw}
function* go(a, target, opt = {}) {
  const tgt = typeof target === 'string' ? spot(target) : target;
  const spd = a.spd * (opt.run ? 1.75 : 1) * (opt.slow ? (typeof opt.slow === 'number' ? opt.slow : 0.6) : 1);
  let ep = -1, pts = [];
  a.anim = 'walk';
  for (let guard = 0; guard < 4000; guard++) {
    if (ep !== a.epoch) { ep = a.epoch; pts = routeTo(a, tgt); }
    if (!pts.length) break;
    const p = pts[0];
    if (p.f !== a.floor) { a.setFloor(p.f); a.pos.x = p.x; a.pos.z = p.z; pts.shift(); continue; }
    // doors on the way get opened
    if (p.via && DOORS[p.via] && !World.doorOpen(p.via) && Math.hypot(p.x - a.pos.x, p.z - a.pos.z) < 0.2) {
      a.moving = 0; yield* waitS(0.35); World.setDoor(p.via, true); Sound.sfx('door');
      yield* waitS(0.3);
    }
    const sp = p.stair ? spd * 0.7 : spd;
    if (moveToward(a, p.x, p.z, sp)) pts.shift();
    yield;
  }
  if (tgt.yaw != null) a.yawT = tgt.yaw;
  a.anim = 'idle';
}
function faceTo(a, x, z) { a.yawT = Math.atan2(x - a.pos.x, z - a.pos.z); }
function faceObj(a, o) { faceTo(a, o.pos.x, o.pos.z); }
function faceAg(a, b) { faceTo(a, b.pos.x, b.pos.z); }
// speech
function say(a, text, secs = 2.6, kind) { UI.bubble(a, text, secs, kind); }
function* talk(a, text, secs = 2.6, kind) { UI.bubble(a, text, secs, kind); yield* waitS(secs * 0.92); }
function* pose(a, anim, mins, focus = 0) { a.anim = anim; a.focus = focus; yield* waitM(mins); a.anim = 'idle'; a.focus = 0; }
// approach a point next to an object
function objSpot(o, dist = 0.85) {
  const fwd = o.def.door ? 0 : o.ry; let x = o.pos.x + Math.sin(fwd) * dist, z = o.pos.z + Math.cos(fwd) * dist;
  const r = roomAt(o.floor, x, z);
  if (!r || (o.room && r !== o.room && !o.def.door)) { x = o.pos.x; z = o.pos.z + dist; if (!roomAt(o.floor, x, z)) z = o.pos.z - dist; }
  const room = roomAt(o.floor, x, z) || o.room;
  return { room, f: o.floor, x, z, yaw: null };
}

// ---------------------------------------------------------------- the children
// band = ちょうどいい帯 [lo, hi]; mult for small/big scares
const KID = {
  sota: { band: [10, 32], ms: 1.0, mb: 1.55, fov: 110, rooms: { kodomo: 4, living: 3, kitchen: 1, washitsu: 1 }, small: 1, line: '怖がり。でも 友だちの 前では へいきな ふり', tip: '小さな「カタッ」で じゅうぶん。大きな 音は 一発で 泣く' },
  hinata: { band: [56, 88], ms: 0.55, mb: 1.15, fov: 120, rooms: { living: 4, garden: 3, kitchen: 2, washitsu: 1, kodomo: 1 }, brave: 1, line: '強がり。「おばけなんか いないし」が 口ぐせ', tip: '大きな しかけを つづけないと たいくつする' },
  mio: { band: [26, 74], ms: 1.0, mb: 1.0, fov: 160, rooms: { washitsu: 3, kitchen: 2, living: 2, akari: 3, kodomo: 1, garden: 1 }, curious: 1, line: '好奇心おうせい。驚くより 先に 近づいて 確かめる', tip: 'おどかしやすいが、すぐ 物を じっと 見るので 見られやすい' },
  kento: { band: [16, 46], ms: 1.0, mb: 1.0, fov: 110, rooms: { washitsu: 4, living: 3, kodomo: 2 }, sleepy: 1, small: 1, line: 'ひなたの 弟。マイペースで よく 寝る', tip: '寝ている ときは 驚かない。起きた 直後が ねらいどき' },
};
const PLAY_SPOTS = {
  living: ['tv_watch', 'liv_floor', 'sofa', 'liv_fold', 'curtain'],
  kitchen: ['k_table1', 'k_table3', 'k_teapot', 'k_clock'],
  washitsu: ['w_sit', 'w_sit2', 'w_knit'],
  kodomo: ['k2_floor', 'k2_bed', 'k2_toy', 'k2_desk'],
  garden: ['g_sun', 'g_mid', 'g_hoshi'],
  akari: ['a2_mid', 'a2_bed', 'a2_window'],
};
const SIT_SPOTS = new Set(['sofa', 'k_table1', 'k_table3', 'w_sit', 'w_sit2', 'w_knit', 'k2_bed', 'a2_bed', 'liv_floor', 'k2_floor', 'liv_fold']);
const LINES = {
  inS: ['くすっ', 'あれ？', 'いまの なに？', 'ふふっ'], inB: ['きゃっ！', 'わっ！', 'びっくりした〜！'],
  over: ['こ、こわい…', 'ひゃあっ', 'や、やだ…'], cry: ['うわーん！ もう かえる〜！', 'こわいよ〜！ かえる！'],
  bored: ['つまんない…', 'たいくつ〜', 'ほかの へや いこ'], braveS: ['ふーん', 'べつに こわくないし', 'なんか いった？'],
  sus: ['…あやしい', 'いま、うごいた…？', 'なんか いる？'],
};
function kidP(a) { return KID[a.id]; }
function band(a) { const b = kidP(a).band; const add = World.k === 4 ? 10 : 0; return [b[0] + add, b[1] + add]; }
function cryLine(a) { return band(a)[1] + (World.k === 4 ? 26 : 16); }
function resetKid(a) {
  Object.assign(a, { arrive: 0, wantMove: false, doki: 0, good: 0, present: 0, boredT: 0, gone: false, cried: false, bored: 0, asleep: false, wokeT: 0, staring: null, inspect: null, mode: 'normal', lock: 0, susCD: 0, jump: 0, peak: 0, left: false, guest: false, inspectT: 0 });
  a.fov = kidP(a).fov; a.home = false; a.mesh.visible = false; a.stack = []; a.setProp(null); a.anim = 'idle'; setFace(a, 'n'); a.setFloor(1);
}
function chooseRoom(a) {
  const pref = kidP(a).rooms; const list = [];
  for (const [r, w] of Object.entries(pref)) { if (r === 'garden' && World.season === 2 && World.flags.rainy) continue; let ww = w; if (r === a.room) ww *= 0.25; const n = FAMILY.filter(id => AG[id] !== a && AG[id].home && AG[id].room === r).length; ww *= 1 + n * 0.4; for (let i = 0; i < ww * 4; i++) list.push(r); }
  return pick(list);
}
function freeSpot(room, a) {
  const ids = PLAY_SPOTS[room] || []; const cand = ids.map(id => Object.assign(spot(id), { id })).filter(s => !FAMILY.some(id => { const b = AG[id]; return b !== a && b.home && Math.hypot(b.pos.x - s.x, b.pos.z - s.z) < 0.8; }));
  const s = cand.length ? pick(cand) : Object.assign({ room, f: ROOMS[room].floor }, roomCenter(room));
  return s;
}
function* kidLife(a, delay, resume) {
  if (!resume) {
  yield* waitS(delay);
  a.home = true; a.arrive = World.elapsed; a.place({ f: 1, x: -7.6, z: -2.8, yaw: Math.PI / 2 }); a.mesh.visible = true; World.setDoor('d_ent', true); setTimeout(() => World.setDoor('d_ent', false), 900); Sound.sfx('door');
  yield* talk(a, pick(['おじゃましまーす！', 'こんにちはー！', 'あそびに きたよ！']), 1.6);
  }
  while (true) {
    const room = chooseRoom(a); const s = freeSpot(room, a);
    yield* go(a, s);
    if (kidP(a).sleepy && Math.random() < 0.4 && room !== 'garden') {
      a.anim = 'sleep'; a.asleep = true; setFace(a, 'sleep'); say(a, 'すやすや…', 2);
      let t = rnd(20, 32); while (t > 0 && a.asleep) { t -= World.dts; yield; }
      if (a.asleep) { a.asleep = false; a.wokeT = 8; setFace(a, 'n'); say(a, 'ふぁ〜… よく ねた', 1.6); }
      a.anim = 'idle'; continue;
    }
    a.anim = SIT_SPOTS.has(s.id) || Math.random() < 0.5 ? 'sit' : 'play';
    let t = rnd(14, 26);
    while (t > 0 && !a.wantMove) { t -= World.dts; if (Math.random() < World.dts * 0.15) a.lookSide = rnd(-0.6, 0.6); yield; }
    a.wantMove = false; a.anim = 'idle'; a.lookSide = 0;
  }
}
function* kidLeave(a, how) {
  a.lock = 1; a.anim = how === 'cry' ? 'cry' : 'idle';
  yield* go(a, { room: 'hall', f: 1, x: -7.4, z: -2.8 }, { run: how === 'cry' });
  World.setDoor('d_ent', true); setTimeout(() => World.setDoor('d_ent', false), 700); Sound.sfx('door');
  a.home = false; a.mesh.visible = false; a.left = true;
}
function* kidStare(a, o) {
  a.lock = 1;
  yield* go(a, objSpot(o, 1.1)); faceObj(a, o);
  a.anim = 'stare'; a.staring = o.id; say(a, pick(['じーっ…', 'なんだろう…', 'さっき うごいたよね？']), 2.4, 'think');
  yield* waitS(5);
  a.staring = null; a.anim = 'idle'; a.lock = 0;
}
function* kidLure(a, o) {
  a.lock = 1; say(a, 'くまさん…？', 1.6, 'think');
  yield* go(a, objSpot(o, 0.9)); faceObj(a, o); a.anim = 'sit'; yield* waitS(4); a.anim = 'idle'; a.lock = 0;
}
// every frame for each child at home
function kidTick(a, dts) {
  if (!a.home || a.left) return;
  a.present += dts; if (a.susCD > 0) a.susCD -= dts; if (a.wokeT > 0) a.wokeT -= dts;
  if (World.phase !== 'play' || a.gone) return;
  const [lo, hi] = band(a);
  if (!a.asleep) a.doki = Math.max(0, a.doki - dts * (a.doki > hi ? 4 : 2.0));
  const inBand = a.doki >= lo && a.doki <= hi;
  if (inBand) { a.good += dts; a.boredT = 0; if (a.expr !== 'happy' && a.expr !== 'surp' && !a.asleep) setFace(a, 'happy'); if (Math.random() < dts * 0.12) Sound.sfx('laugh'); }
  else if (a.doki > hi) { if (!a.asleep) setFace(a, 'panic'); }
  else if (!a.asleep && a.mode !== 'search') {
    if (a.expr === 'happy' || a.expr === 'panic') setFace(a, 'n');
    a.boredT += dts;
    if (a.boredT > 15) { a.boredT = 0; a.bored++; setFace(a, 'sad'); say(a, pick(LINES.bored), 2); a.wantMove = true; }
  }
}
function kidCry(a) {
  if (a.gone) return; a.gone = true; a.cried = true; setFace(a, 'sad'); say(a, pick(LINES.cry), 2.6, 'loud'); Sound.sfx('cry');
  Album.add(a.id, 2);
  a.stack = [kidLeave(a, 'cry')];
  UI.toast(a.def.name + 'が ないて かえっちゃった…', 'red');
}
