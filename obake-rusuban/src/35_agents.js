// ================================================================ agents (family + cat) driven by generator scripts
const AG_ROOT = { 1: new THREE.Group(), 2: new THREE.Group() };
FG[1].add(AG_ROOT[1]); FG[2].add(AG_ROOT[2]);
const SPEED = { hiroshi: 2.0, misaki: 2.0, akari: 2.1, sota: 2.2, fumi: 1.35, monaka: 2.4 };
const SEARCH_STYLE = { hiroshi: 'look', misaki: 'tidy', akari: 'camera', sota: 'light', fumi: 'touch' };
class Agent {
  constructor(id) {
    this.isAgent = true; this.id = id; this.def = CHAR_DEF[id]; this.name = this.def.name;
    this.mesh = id === 'monaka' ? buildCat() : buildPerson(id);
    this.P = this.mesh.userData.parts; this.H = this.P.H;
    this.floor = 1; this.pos = new V3(); this.yaw = 0; this.yawT = 0; this.home = false;
    this.stack = []; this.epoch = 0; this.susp = 0; this.mode = 'normal'; this.cause = null;
    this.fov = 120; this.spd = SPEED[id]; this.moving = 0; this.anim = 'idle'; this.animT = 0; this.focus = 0;
    this.bub = null; this.prop = null; this.carry = null; this.lock = 0; this.expr = 'n'; this.walkPh = 0; this.seat = 0;
    this.style = SEARCH_STYLE[id]; this.inspect = null; this.cone = null; this.searchRoom = null; this.asleep = false;
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
    // suspicion decay
    if (this.mode !== 'search') { const k = this.focus >= 2 ? 3.2 : 1.2; this.susp = Math.max(0, this.susp - k * World.dtm); }
    if (this.susp >= 100 && this.mode !== 'search' && this.id !== 'monaka' && this.home && !this.lock && World.phase === 'chain') startSearch(this);
  }
  animate(dt) {
    const m = this.mesh; m.visible = this.home && !World.blind;
    if (!this.home) return;
    this.yaw = dampAng(this.yaw, this.yawT, 9, dt);
    // stairs height
    let y = 0;
    if (this.floor === 1 && this.pos.x < STAIRS.x1 && this.pos.x > STAIRS.x0 - 0.3 && this.pos.z < STAIRS.z1 && this.pos.z > STAIRS.z0) y = clamp((STAIRS.x1 - this.pos.x) / (STAIRS.x1 - STAIRS.x0), 0, 1) * 3.0;
    this.pos.y = y;
    m.position.copy(this.pos); m.rotation.y = this.yaw;
    const P = this.P; this.animT += dt;
    const sit = this.anim === 'sit' || this.anim === 'tv' || this.anim === 'fold' || this.anim === 'tea';
    if (this.moving > 0.01) {
      this.walkPh += dt * (this.id === 'monaka' ? 14 : 9) * Math.min(1.8, this.moving / 1.6);
      const s = Math.sin(this.walkPh);
      if (this.id === 'monaka') { P.legs.forEach((l, i) => l.rotation.x = s * 0.6 * (i % 2 ? 1 : -1) * (i < 2 ? 1 : -1)); }
      else { P.legs[0].rotation.x = s * 0.55; P.legs[1].rotation.x = -s * 0.55; P.arms[0].rotation.x = -s * 0.5; if (!this.prop) P.arms[1].rotation.x = s * 0.5; }
      m.children[0].position.y = Math.abs(Math.cos(this.walkPh)) * 0.05;
    } else {
      if (this.id !== 'monaka') { P.legs[0].rotation.x = damp(P.legs[0].rotation.x, sit ? -1.3 : 0, 10, dt); P.legs[1].rotation.x = P.legs[0].rotation.x; P.arms[0].rotation.x = damp(P.arms[0].rotation.x, this.anim === 'search' ? -0.6 + Math.sin(this.animT * 3) * 0.3 : 0, 8, dt); }
      else P.legs.forEach(l => l.rotation.x = 0);
      m.children[0].position.y = sit ? -this.H * 0.12 + Math.sin(this.animT * 2) * 0.008 : Math.sin(this.animT * 2.2) * 0.012;
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
const FAMILY = ['fumi', 'sota', 'misaki', 'akari', 'hiroshi'];
function initAgents() { for (const id of [...FAMILY, 'monaka']) if (!AG[id]) AG[id] = new Agent(id); }

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
      Hooks.doorOpened && Hooks.doorOpened(a, p.via);
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
// arrive home through the front door
function arrive(a) {
  a.home = true; a.place({ f: 1, x: -7.6, z: -2.8, yaw: Math.PI / 2 });
  World.setDoor('d_ent', true); setTimeout(() => World.setDoor('d_ent', false), 900);
  Sound.sfx('door'); a.mesh.visible = true;
  World.noise(1, 'hall', 0.3, 'arrive', a);
}
function leave(a) { a.home = false; a.mesh.visible = false; a.setProp(null); }
// rule hooks: reactions when an agent uses / notices an object
const RX = [];
function rx(who, obj, when, run, days) { RX.push({ who, obj, when, run, days }); }
function findRx(a, objId) {
  for (const r of RX) {
    if (r.obj !== objId) continue;
    if (r.who !== '*' && r.who !== a.id && !(Array.isArray(r.who) && r.who.includes(a.id))) continue;
    if (r.days && (World.day < r.days[0] || World.day > r.days[1])) continue;
    const o = O[objId];
    if (!o && r.when) continue;
    if (r.when && !r.when(a, o)) continue;
    return r;
  }
  return null;
}
// walk to an object and use it; a matching reaction replaces the normal use
function* use(a, objId, opt = {}) {
  const o = O[objId];
  if (o) {
    if (opt.spot) yield* go(a, opt.spot, opt); else yield* go(a, objSpot(o, opt.dist || 0.8), opt);
    faceObj(a, o);
  } else if (opt.spot) yield* go(a, opt.spot, opt);
  const r = findRx(a, objId);
  if (r) { yield* r.run(a, o); return true; }
  return false;
}
// default reaction to hearing a noise
function* investigate(a, room, src) {
  a.anim = 'idle';
  yield* talk(a, pick(['ん？ なんの おと？', 'いま なにか おとが…', 'あれ？']), 1.8, 'think');
  const c = src && src.isAgent ? { room: src.room, f: src.floor, x: src.pos.x, z: src.pos.z + 0.8 } : src && src.def ? objSpot(src, 1.0) : Object.assign({ room, f: ROOMS[room].floor }, roomCenter(room));
  if (c.room && roomPath(a.room, c.room) && ROOMS[c.room] && !ROOMS[c.room].outdoor) {
    yield* go(a, c);
    if (src && src.def) faceObj(a, src);
    yield* waitS(1.2);
    a.lookSide = 0.6; yield* waitS(0.6); a.lookSide = -0.6; yield* waitS(0.6); a.lookSide = 0;
    yield* talk(a, pick(['…きのせい かな', 'なにも ないね', 'へんなの']), 1.8);
  }
}
// noise handling (from World.noise)
const HX = []; // {kind, who, run(a, src, vol)}
function hx(kind, who, run, when) { HX.push({ kind, who, run, when }); }
World.noise = function (floor, room, loud, kind, src, cause) {
  if (World.phase !== 'chain') return;
  const hearers = [];
  for (const id of FAMILY) {
    const a = AG[id]; if (!a.home || (src && src.isAgent && src === a)) continue;
    const v = heardVol(room, a.room, loud);
    if (v >= 0.3) hearers.push({ a, v });
  }
  hearers.sort((p, q) => q.v - p.v);
  // special handlers first (e.g. phone ring answered by one person)
  for (const h of HX) {
    if (h.kind !== kind) continue;
    if (h.when && !h.when(src)) continue;
    const ok = hearers.filter(x => h.who === '*' || h.who.includes(x.a.id));
    if (h.run(ok, src, room, cause) === 'stop') return hearers;
  }
  for (const { a, v } of hearers) {
    a.susp = Math.min(99, a.susp + v * 10 * heatMul(room));
    if (a.mode === 'search') { if (v >= 0.35 && ROOMS[room] && !ROOMS[room].outdoor) { a.searchRoom = room; a.epoch++; } continue; }
    if (kind === 'shout' || kind.startsWith('call')) continue;
    if (v >= 0.55 && a.focus < 2 && !a.lock && kind !== 'arrive' && kind !== 'robo') {
      if (a.stack.length <= 1 && World.phase === 'chain') a.push(investigate(a, room, src));
    } else if (a.focus < 2) { if (src) faceTo(a, src.pos.x, src.pos.z); }
  }
  return hearers;
};
function heatMul(room) { const h = World.heat[room] || 0; return 1 + Math.max(0, h - 1) * 0.6; }
function addSusp(a, n, room) { a.susp = Math.min(100, a.susp + n * heatMul(room || a.room)); }

// ---------------------------------------------------------------- searching (かくれんぼ)
function startSearch(a, room) {
  if (a.mode === 'search') return;
  a.mode = 'search'; a.searchRoom = room || World.lastWeird || a.room;
  a.lock = 0; a.push(searchGen(a), true); a.lock = 1;
  Sound.sfx('alert'); Music.play('search');
  Hooks.searchStart && Hooks.searchStart(a);
}
function searchable(room) {
  return Object.values(O).filter(o => o.def.host && (objRoomNow(o) === room || o.rooms.includes(room)) && !o.carried && !o.def.door);
}
function* searchGen(a) {
  const dur = { hiroshi: 26, misaki: 14, akari: 12, sota: 12, fumi: 18 }[a.id] || 12;
  const end = World.time + dur;
  setFace(a, 'surp');
  yield* talk(a, { hiroshi: 'む…？ やっぱり なにか いるぞ。', misaki: 'もう！ だれが ちらかしたの？', akari: '…なんか いる。とってみよ。', sota: 'お、おばけ…？ ライト もってこよ！', fumi: 'おや…。だれか いるのかい？' }[a.id] || '…？', 2.6, 'loud');
  // equipment
  if (a.id === 'akari') { if (O.juden && O.juden.st.unplug) { yield* talk(a, 'あれ、スマホの でんち きれてる…', 2.2); a.style = 'look'; } else { a.setProp('phone'); a.style = 'camera'; } }
  if (a.id === 'sota') { if (O.kaichu && O.kaichu.st.hidden) { yield* talk(a, 'ライトが ない…', 2.0); a.style = 'look'; } else { a.setProp('light'); a.style = 'light'; } }
  a.anim = 'search';
  let checked = new Set(); let lastRoom = null;
  while (World.time < end && World.phase === 'chain') {
    const room = a.searchRoom;
    if (room !== lastRoom) { lastRoom = room; checked = new Set(); if (a.room !== room && roomPath(a.room, room)) yield* go(a, Object.assign({ room, f: ROOMS[room].floor }, roomCenter(room))); a.anim = 'search'; }
    const list = searchable(room).filter(o => !checked.has(o.id));
    if (!list.length) { checked = new Set(); yield* waitS(0.6); continue; }
    // nearest unchecked object (mom: messy things first)
    list.sort((p, q) => (a.id === 'misaki' ? (isMessy(q) - isMessy(p)) * 10 : 0) + p.pos.distanceTo(a.pos) - q.pos.distanceTo(a.pos));
    const o = list[0]; checked.add(o.id);
    if (a.style === 'camera' || a.style === 'light') {
      // sweep from a vantage point
      const vp = objSpot(o, 2.2); yield* go(a, vp); faceObj(a, o);
      a.inspect = null; const base = a.yawT; let t = 0;
      while (t < 2.4 && a.searchRoom === room) { t += World.dts; a.yawT = base + Math.sin(t * 2.2) * 0.7; yield; }
    } else {
      yield* go(a, objSpot(o, 0.7)); faceObj(a, o);
      a.inspect = o.id; let t = 0; const it = a.style === 'touch' ? 2.2 : a.id === 'hiroshi' ? 2.4 : 1.8;
      while (t < it && a.searchRoom === room) { t += World.dts; yield; }
      a.inspect = null;
      if (a.style === 'tidy' && isMessy(o)) { yield* tidy(a, o); }
    }
  }
  a.inspect = null; a.anim = 'idle'; a.setProp(null); a.lock = 0; a.mode = 'normal'; a.susp = 45; setFace(a, 'n');
  yield* talk(a, { hiroshi: 'うーん、きのせい だったか…', misaki: 'まったく もう。', akari: '…うつって なかった。', sota: 'いない…よね？', fumi: 'ふふ、まあ いいさ。' }[a.id] || '…', 2.2);
  Hooks.searchEnd && Hooks.searchEnd(a);
}
function isMessy(o) { const s = o.st; return (s.hidden || s.moved || s.turned || s.fallen || s.spilled || s.open || (s.off && o.id === 'tokei')) ? 1 : 0; }
function* tidy(a, o) {
  yield* talk(a, 'ちゃんと もどして おかないと…', 1.8);
  const s = o.st;
  if (s.hidden) s.hidden = false; if (s.turned) s.turned = false; if (s.open) s.open = false; if (o.id === 'tokei') s.off = 0; if (s.moved) s.moved = false;
  o.def.refresh && o.def.refresh(o); o.wig = 0.5;
  // putting a possessed thing back on the shelf jostles the ghost
  if (Ghost.hostObj() === o) Ghost.expose(0.25, a);
}
