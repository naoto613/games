// ================================================================ habits (routines) and reactions — the chain material
const DD = () => DAYS[World.day];
const F = World.flags;
function E(a, key, text, parents, o = {}) { return ev(key, text, Object.assign({ at: a, who: a && a.id, parents }, o)); }
function oc(id, act) { const o = O[id]; if (!o) return null; return act && o.acts && o.acts[act] != null ? o.acts[act] : o.cause; }
function inRoom(room, ids) { return ids.every(id => AG[id].home && AG[id].room === room); }
function countIn(room) { return FAMILY.filter(id => AG[id].home && AG[id].room === room).length; }
function pickUp(a, o) { if (!o) return; o.carried = a; a.carry = o; o.floor !== a.floor && (o.floor = a.floor); OBJ_ROOT[a.floor].add(o.g); }
function putDown(a, o, x, y, z) {
  if (!o) return; o.carried = null; a.carry = null;
  if (x == null) { const fw = new V3(Math.sin(a.yaw), 0, Math.cos(a.yaw)); x = a.pos.x + fw.x * 0.5; z = a.pos.z + fw.z * 0.5; y = 0; }
  o.floor = a.floor; OBJ_ROOT[a.floor].add(o.g); o.pos.set(x, y, z); o.target = o.pos.clone(); o.home = o.pos.clone();
  o.room = roomAt(o.floor, x, z) || o.room; o.rooms = [o.room];
}
function* sitUntil(a, t, anim = 'sit', focus = 0) { a.anim = anim; a.focus = focus; yield* until(t); a.anim = 'idle'; a.focus = 0; }
function* sitFor(a, m, anim = 'sit', focus = 0) { a.anim = anim; a.focus = focus; yield* waitM(m); a.anim = 'idle'; a.focus = 0; }
function* walkUp(a, sp, opt) { yield* go(a, sp, opt); }
const ROUTINES = {};
function goal(text, parents) { if (World.goalDone) return; World.goalDone = true; Hooks.goal && Hooks.goal(text); }

// ---------------------------------------------------------------- shared habit pieces
function* watchTV(a, endT, cause) {
  const r = O.remocon;
  if (r && r.st.hidden && !O.tv.st.on) { yield* talk(a, 'リモコンが ない…。', 1.6); return false; }
  if (r && !r.st.hidden && !O.tv.st.on) { a.setProp('remote'); yield* waitS(0.6); a.setProp(null); }
  O.tv.st.on = true; O.tv.def.refresh(O.tv); Sound.sfx('tv');
  yield* go(a, 'tv_watch'); a.anim = 'tv'; a.focus = 2; setFace(a, 'smile');
  while (World.time < endT && O.tv.st.on) yield;
  a.anim = 'idle'; a.focus = 0; setFace(a, 'n');
  if (O.tv.st.on && !F.keepTV) { O.tv.st.on = false; O.tv.def.refresh(O.tv); }
}
// ---------------------------------------------------------------- ふみ (grandma)
ROUTINES.fumi = function* (a) {
  const d = World.day, Dd = DD();
  yield* until(Dd.arr.fumi); arrive(a); yield* talk(a, 'ただいま。', 1.4);
  yield* go(a, 'w_sit'); yield* sitUntil(a, T(15));
  // 15:00 tea on the engawa
  const r = yield* use(a, 'kyusu', { spot: 'k_teapot' });
  if (!r) yield* teaAlone(a);
  // knitting
  yield* go(a, d === 13 ? 'eng_sit' : 'w_knit');
  if (d === 7 && O.megane && O.megane.st.hidden) yield* noGlasses(a);
  a.setProp('knit'); yield* sitUntil(a, d === 14 ? T(17, 20) : T(17, 30), 'sit', 1); a.setProp(null);
  // help cooking
  if (d === 14) { yield* go(a, 'w_sit'); yield* sitUntil(a, T(19)); return; }
  yield* go(a, 'k_stove'); a.anim = 'cook'; a.focus = 1; yield* until(T(18, 50)); a.anim = 'idle'; a.focus = 0;
  yield* go(a, 'k_table3'); yield* sitUntil(a, T(19));
};
function* teaAlone(a) {
  const k = O.kyusu; pickUp(a, k);
  yield* go(a, 'eng_sit'); putDown(a, k, 8.75, 0.06, -3.35);
  a.setProp('cup'); yield* sitUntil(a, T(15, 40), 'tea', 1); a.setProp(null);
  pickUp(a, k); yield* go(a, 'k_teapot'); putDown(a, k, 4.3, 0.8, 3.0);
}
// day 2: two cups → grandma waits for a companion
rx('fumi', 'kyusu', (a, o) => World.day === 2 && o.st.cups >= 2, function* (a, o) {
  setFace(a, 'smile');
  const w = E(a, 'd2_wait', 'おばあちゃん「ゆのみが ふたつ…。だれか くるのかね」', [oc('kyusu', 'cups')]);
  a.cause = w; F.fumiWait = w;
  yield* go(a, 'k_table3'); a.anim = 'sit';
  // warm teapot check (if the ghost is inside it)
  if (Ghost.hostObj() === o) { yield* talk(a, 'おや…きゅうすが もう あったかい。', 2.4, 'think'); addSusp(a, 55, 'kitchen'); }
  while (World.time < T(15, 58) && !F.sotaSad) yield;
  a.anim = 'idle';
  if (F.sotaSad) {
    const s = AG.sota;
    const inv = E(a, 'd2_invite', 'おばあちゃん「そうちゃん、おせんべいと お茶に しようか」', [w, F.sotaSad]);
    yield* talk(a, 'そうちゃん、おせんべいと お茶に しようか。', 2.6);
    F.d2inv = inv;
    pickUp(a, o); yield* go(a, 'eng_sit'); putDown(a, o, 8.75, 0.06, -3.35);
    a.setProp('cup'); a.anim = 'tea'; a.focus = 1;
    while (s.room !== 'engawa' && World.time < T(16, 20)) yield;
    if (s.room === 'engawa') {
      const t = E(a, 'd2_tea', 'えんがわで ふたりで お茶の じかん', [inv]); F.d2tea = t;
      goal('おばあちゃんと そうたが いっしょに お茶', [t]);
      yield* talk(a, 'むかしねえ、この家には ちよさんって 人が すんでいてね…', 3.2);
      yield* talk(s, 'ねえ、この家って おばけ いるの？', 2.4);
      E(a, 'd2_story', 'おばあちゃんの むかしばなし', [t]);
      yield* talk(a, 'ふふ。いたら たのしいねえ。', 2.4);
    }
    yield* sitUntil(a, T(16, 30), 'tea', 1); a.setProp(null);
    pickUp(a, o); yield* go(a, 'k_teapot'); putDown(a, o, 4.3, 0.8, 3.0);
  } else {
    yield* talk(a, 'だれも こないね。ひとりで のもうかね。', 2.2);
    yield* teaAlone(a);
  }
  a.cause = null;
});
// day 7: glasses gone → grandma can't knit; she dozes
function* noGlasses(a) {
  yield* talk(a, 'めがね めがね…。どこへ やったかね。', 2.4);
  const g = E(a, 'd7_glasses', 'おばあちゃん「めがねが ない…」', [oc('megane', 'hide')]); F.d7g = g;
  a.anim = 'sit'; yield* waitM(3);
  yield* talk(a, 'まあ いいさ。ひとやすみ。', 1.8); a.asleep = true; a.anim = 'sit'; setFace(a, 'sleep');
  yield* waitM(10); a.asleep = false; setFace(a, 'n');
}
// ---------------------------------------------------------------- そうた
ROUTINES.sota = function* (a) {
  const d = World.day, Dd = DD();
  yield* until(Dd.arr.sota); arrive(a); yield* talk(a, 'ただいま〜！', 1.4);
  if (d >= 4) { yield* go(a, 'k2_desk'); yield* waitS(0.8); }
  else { yield* go(a, 'liv_floor'); yield* waitS(0.6); }
  // snack
  if (World.time < T(15, 40)) yield* until(T(15, 40));
  const r = yield* use(a, 'reizoko', { spot: 'k_fridge' });
  if (!r) { a.setProp('pudding'); yield* go(a, 'k_table1'); yield* sitFor(a, 8); a.setProp(null); }
  if (F.sotaTea) { while (World.time < T(16, 30)) yield; }
  // play
  if (d === 13) { yield* sotaHide(a); return; }
  if (d >= 4) yield* playUpstairs(a); else { yield* go(a, 'liv_floor'); yield* sitUntil(a, T(16, 50)); }
  // anime
  yield* animeTime(a);
  // evening
  if (d === 3 && F.d3glued) { while (World.time < T(18, 40)) yield; }
  else if (World.time < T(18, 40)) { yield* go(a, 'liv_floor'); yield* sitUntil(a, T(18, 40)); }
  yield* go(a, 'k_table1'); yield* sitUntil(a, T(19));
};
function* playUpstairs(a) {
  const d = World.day;
  // day 4: the dark hallway
  if (d === 4) {
    yield* go(a, 'liv_floor'); yield* sitFor(a, 2);
    yield* talk(a, 'くまさんと あそびたい けど… 2かい くらいんだもん。', 2.6, 'think');
    yield* sitUntil(a, T(16, 50));
    return;
  }
  if (d === 7) { // special TV program downstairs at 16:00
    yield* go(a, 'k2_floor'); yield* sitUntil(a, T(16));
    yield* go(a, 'tv_watch'); a.anim = 'tv'; a.focus = 2; O.tv.st.on = true; O.tv.def.refresh(O.tv);
    while (World.time < T(16, 45) && !F.d7up) yield;
    a.anim = 'idle'; a.focus = 0;
    if (!F.d7up) { O.tv.st.on = false; O.tv.def.refresh(O.tv); }
    while (F.d7up && World.time < T(17, 20)) yield;
    return;
  }
  yield* go(a, 'k2_floor'); a.anim = 'sit';
  if (O.kuma && O.kuma.floor === 2 && !O.kuma.carried) { pickUp(a, O.kuma); }
  yield* until(T(16, 48)); a.anim = 'idle';
  if (a.carry && a.carry.id === 'kuma') putDown(a, a.carry, -6.6, 0.62, 4.4);
}
function* animeTime(a) {
  const d = World.day;
  if (World.time < T(16, 50)) yield* until(T(16, 50));
  const tk = O.tokei;
  yield* go(a, 'k_clock'); faceObj(a, tk);
  say(a, 'アニメ まだかな…', 1.6, 'think');
  while (World.time + tk.st.off < T(17)) yield;
  let cid = null;
  if (tk.st.off > 0 && World.time < T(17)) cid = E(a, 'sota_clock', 'そうた「もう 5時！ アニメ はじまっちゃう！」', [oc('tokei', 'fast5')]);
  a.cause = cid;
  yield* talk(a, 'アニメの じかんだ！', 1.3, 'loud');
  const r = yield* use(a, 'tv', { spot: 'tv_watch', run: true });
  if (!r) yield* watchTV(a, T(17, 30));
  a.cause = null;
}
// fridge: day 2 pudding missing
rx('sota', 'reizoko', (a, o) => o.st.shuffled && World.day === 2, function* (a, o) {
  yield* waitS(0.8); setFace(a, 'sad');
  const s = E(a, 'd2_pudding', 'そうた「プリンが ない〜…」', [oc('reizoko', 'shuffle')]);
  yield* talk(a, 'あれ…？ プリンが ない…。', 2.2);
  F.sotaSad = s; a.cause = s;
  if (F.fumiWait && AG.fumi.room === 'kitchen') {
    yield* go(a, 'k_table1'); a.anim = 'sit';
    while (!F.d2inv && World.time < T(16, 5)) yield;
    if (F.d2inv) {
      a.anim = 'idle'; setFace(a, 'happy'); yield* talk(a, 'うん！ のむ！', 1.6); F.sotaTea = 1;
      a.setProp('senbei'); yield* go(a, 'eng_sit2'); a.anim = 'tea'; yield* until(T(16, 25)); a.anim = 'idle'; a.setProp(null);
    }
  } else {
    yield* go(a, 'liv_floor'); yield* talk(a, 'つまんないの…', 1.8); yield* sitFor(a, 6);
  }
  setFace(a, 'n'); a.cause = null;
});
rx('sota', 'reizoko', (a, o) => o.st.shuffled, function* (a, o) {
  yield* waitS(0.8);
  yield* talk(a, 'プリン…あ、おくに あった！', 2.0);
  a.setProp('pudding'); yield* go(a, 'k_table1'); yield* sitFor(a, 8); a.setProp(null);
});
// day 1: the remote is missing → call big sister
rx('sota', 'tv', (a, o) => O.remocon && O.remocon.st.hidden && !O.tv.st.on, function* (a, o) {
  setFace(a, 'panic');
  yield* talk(a, 'あれ？ リモコンが ない！', 1.8);
  const b = E(a, 'd1_noremote', 'そうた「リモコンが ない〜！」', [oc('remocon', 'hide'), a.cause]);
  a.cause = b;
  yield* go(a, 'liv_door');
  yield* talk(a, 'おねえちゃーん！ リモコン しらない〜？', 2.2, 'loud');
  World.noise(1, 'living', 0.9, 'shout', a);
  const ak = AG.akari;
  if (ak.home && ak.mode !== 'search') { ak.push(akariFindsRemote(ak, b), true); }
  else if (AG.fumi.home) { AG.fumi.push(fumiFindsRemote(AG.fumi, b), true); }
  yield* go(a, 'sofa2'); a.anim = 'sit';
  while (O.remocon.st.hidden && World.time < T(17, 40)) yield;
  a.anim = 'idle'; setFace(a, 'n');
  if (!O.remocon.st.hidden) { yield* talk(a, 'あった！', 1.2); yield* watchTV(a, T(17, 30)); }
});
function* akariFindsRemote(a, cause) {
  a.lock = 1;
  yield* talk(a, 'もう、なに〜？', 1.6);
  yield* go(a, 'liv_door', { run: true });
  const c = E(a, 'd1_akari', 'あかりが 2かいから おりてきた', [cause]); a.cause = c;
  yield* go(a, { room: 'living', f: 1, x: World.layout === 'B' ? -5.6 : -5.2, z: World.layout === 'B' ? 3.4 : 1.6, yaw: Math.PI / 2 });
  a.anim = 'search'; yield* talk(a, 'テーブルの うえは… ない。', 1.8); yield* waitM(1); a.anim = 'idle';
  yield* talk(a, 'ソファの 下かも。よいしょっ！', 1.8, 'loud');
  O.sofa.st.moved = true; O.sofa.def.refresh(O.sofa); Sound.sfx('thud'); objOccluders();
  const s = E(a, 'd1_sofa', 'あかりが ソファを ずらした', [c]); O.sofa.cause = s; a.cause = s;
  World.noise(1, 'living', 0.95, 'sofa', O.sofa, s);
  yield* waitS(0.6);
  O.remocon.st.hidden = false; O.remocon.def.refresh(O.remocon);
  setFace(a, 'sus');
  yield* talk(a, 'あった。…でも なんで ソファの 下に？', 2.4, 'think');
  F.remoteFound = 1;
  a.lock = 0; a.cause = null;
  World.lastWeird = 'living';
  a.susp = 100; startSearch(a, 'living');
}
function* fumiFindsRemote(a, cause) {
  yield* talk(a, 'はいはい。', 1.4);
  yield* go(a, 'sofa');
  yield* talk(a, 'ソファの 下に ころがってたよ。', 2.0);
  O.remocon.st.hidden = false; O.remocon.def.refresh(O.remocon);
  E(a, 'd1_fumi', 'おばあちゃんが リモコンを みつけた', [cause]);
  addSusp(a, 30, 'living');
}
// mom hears the sofa thud (day 1)
hx('sofa', ['misaki'], (hs, src, room, cause) => {
  const h = hs.find(x => x.a.id === 'misaki'); if (!h || World.day !== 1) return;
  const m = h.a; m.push(momSofa(m, cause), true); m.lock = 1;
});
function* momSofa(a, cause) {
  setFace(a, 'surp');
  yield* talk(a, 'なに！？ いまの おと！', 1.6, 'loud');
  const k = O.kago; if (!a.carry && k && a.pos.distanceTo(k.pos) < 2 && a.floor === k.floor) pickUp(a, k);
  yield* go(a, 'liv_door', { run: true });
  if (O.sofa.st.moved && World.layout === 'A') {
    yield* talk(a, 'あれっ、ドアが… ソファが じゃま！ えいっ！', 2.2, 'loud');
    if (a.carry) { const kk = a.carry; putDown(a, kk, -3.0, 0, 1.0); kk.st.spilled = true; kk.def.refresh(kk); Sound.sfx('clatter'); }
  }
  const m = E(a, 'd1_mom', 'おかあさん「ちょっと！ なにごと！？」', [cause]); F.d1mom = m;
  if (a.carry) { const kk = a.carry; putDown(a, kk); }
  a.lock = 0;
  yield* go(a, 'liv_fold'); faceAg(a, AG.akari);
  yield* talk(a, 'もう、ふたりとも！ せんたくもの ちらかって…', 2.6);
  addSusp(a, 25, 'living');
  // cat dives into the laundry
  if (O.kago.st.spilled && AG.monaka.home && AG.monaka.floor === 1) { AG.monaka.push(catDive(AG.monaka, m), true); }
  a.anim = 'fold'; yield* waitM(12); a.anim = 'idle'; setFace(a, 'n');
  F.momDone1 = 1;
}
function* catDive(c, cause) {
  const k = O.kago;
  yield* go(c, { room: 'living', f: 1, x: k.pos.x + 0.6, z: k.pos.z + 0.4 }, { run: true });
  Sound.sfx('meow'); UI.bubble(c, 'ニャ〜♪', 1.4);
  E(c, 'd1_cat', 'もなかが せんたくものに ダイブ！', [cause]); F.d1cat = 1;
  c.anim = 'sleep'; setFace(c, 'sleep'); yield* waitM(20);
}
// ---------------------------------------------------------------- みさき (mom)
ROUTINES.misaki = function* (a) {
  const d = World.day, Dd = DD();
  yield* until(Dd.arr.misaki); arrive(a); yield* talk(a, 'ただいま〜。', 1.4);
  yield* go(a, 'shoes'); yield* waitS(0.6);
  // laundry from the garden
  const k = O.kago; yield* go(a, 'kago'); pickUp(a, k);
  yield* go(a, 'g_hoshi');
  const rh = yield* use(a, 'hoshi', { spot: 'g_hoshi' });
  a.anim = 'fold'; yield* waitM(6); a.anim = 'idle';
  if (O.hoshi) { O.hoshi.st.taken = true; O.hoshi.def.refresh(O.hoshi); }
  k.st.full = true; if (O.tegami && O.tegami.st.inBasket) k.st.letter = true; k.def.refresh(k);
  yield* go(a, 'kago'); putDown(a, k, -2.5, 0, -2.9);
  // groceries
  const rf = yield* use(a, 'reizoko', { spot: 'k_fridge' });
  if (!rf) yield* waitM(4);
  yield* go(a, 'k_sink'); a.anim = 'cook'; yield* until(T(16, 55)); a.anim = 'idle';
  // sort laundry in the hall
  if (d === 13 && !F.d13found) { yield* momSota13(a); }
  if (!k.st.spilled) { yield* go(a, 'kago'); a.anim = 'fold'; yield* until(T(17, 6)); a.anim = 'idle'; }
  if (d === 10 && k.st.letter) { yield* momLetter(a); }
  if (k.st.spilled) { while (!F.momDone1 && World.time < T(17, 40)) yield; yield* go(a, 'k_stove'); a.anim = 'cook'; a.focus = 2; yield* until(T(18, 55)); a.anim = 'idle'; a.focus = 0; yield* go(a, 'k_table2'); yield* sitUntil(a, T(19)); return; }
  // put clothes away upstairs
  pickUp(a, k); yield* go(a, 's2_tansu'); a.anim = 'fold'; yield* waitM(3); a.anim = 'idle';
  if (d >= 5) { const rp = yield* use(a, 'album', { spot: 'a2_mid' }); }
  putDown(a, k, 3.0, 0, 1.2); k.st.full = false; k.st.letter = false; k.def.refresh(k);
  // work
  if (d >= 5) {
    const r = yield* use(a, 'pc', { spot: 's2_pc' });
    if (!r) { a.anim = 'sit'; a.focus = 2; yield* until(T(17, 45)); a.anim = 'idle'; a.focus = 0; }
  } else { yield* go(a, 'k_table2'); a.anim = 'read'; a.focus = 1; yield* until(T(17, 45)); a.anim = 'idle'; a.focus = 0; }
  // cooking
  if (d === 11) { yield* momTea11(a); }
  if (d === 14) { yield* mom14(a); return; }
  yield* go(a, 'k_stove'); a.anim = 'cook'; a.focus = 2;
  yield* until(T(18, 55)); a.anim = 'idle'; a.focus = 0;
  yield* go(a, 'k_table2'); yield* sitUntil(a, T(19));
};
// ---------------------------------------------------------------- あかり
ROUTINES.akari = function* (a) {
  const d = World.day, Dd = DD();
  yield* until(Dd.arr.akari); arrive(a); yield* talk(a, 'ただいま。', 1.2);
  if (d === 3) { /* at club: comes home with dad */ return; }
  const r = yield* use(a, 'camera', { spot: 'a2_desk' });
  a.anim = 'sit'; a.focus = d === 12 || d === 14 ? 2 : 1; a.setProp('phone');
  if (d === 12) yield* akari12(a);
  if (d === 14) yield* akari14(a);
  yield* until(T(18, 40)); a.anim = 'idle'; a.focus = 0; a.setProp(null);
  if (d === 12 && !F.d12down) { yield* sitUntil(a, T(19)); return; }
  yield* go(a, 'k_table4'); yield* sitUntil(a, T(19));
};
// ---------------------------------------------------------------- ひろし (dad)
ROUTINES.hiroshi = function* (a) {
  const d = World.day, Dd = DD();
  yield* until(Dd.arr.hiroshi); arrive(a); yield* talk(a, 'ただいま〜。', 1.4);
  if (d === 3) { yield* dad3(a); return; }
  if (d === 8) { yield* dad8(a); }
  if (d === 11) { yield* dadSlip11(a); if (O.radio && O.radio.st.on) { yield* dad11radio(a, oc('radio', 'on')); return; } }
  // change clothes upstairs
  const rn = yield* use(a, 'tansu2', { spot: 's2_tansu' });
  yield* waitM(4);
  if (d === 11 && !F.d11stay) { yield* dad11(a); return; }
  // evening news on the sofa
  if (d === 9) { yield* dad9(a); }
  else {
    const r = yield* use(a, 'tv', { spot: 'sofa' });
    if (!r) { yield* watchTV(a, T(18, 50)); }
  }
  yield* go(a, 'k_table2'); yield* sitUntil(a, T(19));
};
// dad: no remote → newspaper instead of TV
rx('hiroshi', 'tv', (a) => O.remocon && O.remocon.st.hidden && !O.tv.st.on && World.day !== 9, function* (a) {
  yield* talk(a, 'リモコンが ない…。しんぶん でも よむか。', 2.2);
  E(a, 'dad_paper_' + World.day, 'おとうさんが しんぶんを ひろげた', [oc('remocon', 'hide')]); F.dadPaper = 1;
  a.setProp('paper'); a.anim = 'read'; a.focus = 1;
  while (World.time < T(18, 50)) yield;
  a.anim = 'idle'; a.focus = 0; a.setProp(null);
});
function routineFor(id) { return ROUTINES[id]; }
