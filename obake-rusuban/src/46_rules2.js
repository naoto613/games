// ================================================================ day-specific chains
// ---------- generic: TV switched on by ぽわ
hx('act:tv:on', '*', (hs, src, room, cause) => {
  const d = World.day;
  if (d === 3) {
    const s = hs.find(x => x.a.id === 'sota'); if (!s || World.time < T(17, 30) || F.d3glued) return;
    s.a.push(sotaGlued(s.a, cause), true); return 'stop';
  }
  if (d === 13 && hs.find(x => x.a.id === 'misaki') && F.sotaHiding && !F.d13notice) { const m = AG.misaki; m.push(mom13notice(m, cause), true); return 'stop'; }
  // somebody nearby turns it off again
  const h = hs.find(x => x.a.focus < 2 && x.a.mode !== 'search' && x.a.room === 'living');
  if (h && !(h.a.id === 'sota' && d !== 1)) { h.a.push(tvOff(h.a), true); }
  else if (hs.find(x => x.a.id === 'sota' && x.a.room === 'living')) { const a = AG.sota; a.push(sotaGlued(a, cause), true); }
  return 'stop';
});
function* tvOff(a) { yield* talk(a, 'あれ？ テレビ つけっぱなし…', 1.8, 'think'); yield* go(a, 'tv_front'); O.tv.st.on = false; O.tv.def.refresh(O.tv); addSusp(a, 20, 'living'); }
function* sotaGlued(a, cause) {
  setFace(a, 'happy');
  yield* talk(a, 'あっ！ テレビ ついた！ アニメの さいほうそう だ！', 2.4, 'loud');
  const g = E(a, 'd3_glued', 'そうたが テレビに くぎづけ', [cause]); F.d3glued = g;
  yield* go(a, 'tv_watch'); a.anim = 'tv'; a.focus = 2;
  while (O.tv.st.on && World.time < T(18, 40)) yield;
  a.anim = 'idle'; a.focus = 0; setFace(a, 'n');
}
hx('act:tv:off', '*', (hs, src, room, cause) => {
  for (const { a } of hs) if (a.anim === 'tv' && a.room === 'living') { a.push((function* () { setFace(a, 'surp'); yield* talk(a, 'あれっ！？ きえた！', 1.6); F.tvKilled = E(a, 'tvoff_' + a.id, a.name + '「テレビが きえた…」', [cause]); setFace(a, 'n'); })(), true); }
});
// ---------- the phone (day 3)
function phoneAnswerer(hs) {
  const c = hs.filter(x => x.a.focus < 2 && x.a.mode !== 'search' && !x.a.lock && x.a.home);
  c.sort((p, q) => (q.v - p.v) || (p.a.focus - q.a.focus) || (p.a.pos.distanceTo(O.denwa.pos) - q.a.pos.distanceTo(O.denwa.pos)));
  return c[0] && c[0].a;
}
hx('phone', '*', (hs, src, room, cause) => {
  const a = phoneAnswerer(hs);
  if (!a) { F.phoneNobody = 1; return 'stop'; }
  a.push(answerAkari(a), true); return 'stop';
});
hx('act:denwa:ring', '*', (hs, src, room, cause) => {
  const a = phoneAnswerer(hs); if (!a) return 'stop';
  a.push((function* () {
    yield* go(a, 'phone', { run: true }); O.denwa.st.ring = 0;
    yield* talk(a, 'もしもし？ …もしもーし？', 2.2); setFace(a, 'sus');
    yield* talk(a, '…きれちゃった。', 1.6); addSusp(a, 25, 'hall'); setFace(a, 'n');
    E(a, 'prank_' + World.time, a.name + 'が でんわに でた（だれも いない）', [cause]);
  })(), true);
  return 'stop';
});
function* answerAkari(a) {
  yield* go(a, 'phone', { run: true }); O.denwa.st.ring = 0; a.anim = 'phone';
  const par = [a.id === 'hiroshi' ? F.d3glued : null, F.d3door];
  yield* talk(a, 'もしもし。', 1.4);
  yield* talk(a, a.id === 'sota' ? 'おねえちゃん？ …うん、うん！' : 'あかり？ …かさ わすれた？ はいはい。', 2.4);
  a.anim = 'idle';
  if (a.id === 'hiroshi') {
    const p = E(a, 'd3_dadphone', 'おとうさんが でんわに でた', par);
    yield* dadFetch(a, p);
  } else if (a.id === 'fumi') {
    const p = E(a, 'd3_fumiphone', 'おばあちゃんが でんわに でた', par);
    yield* talk(a, 'ひろしさーん！ あかりちゃんを むかえに いって おくれ。', 2.6, 'loud');
    const d = AG.hiroshi; if (d.home) d.push(dadFetch(d, p), true);
  } else {
    const p = E(a, 'd3_other', a.name + 'が でんわに でた', par);
    if (a.id === 'sota') { yield* go(a, 'k_stove', { run: true }); yield* talk(a, 'おかあさん！ おねえちゃんが かさ ないって！', 2.4, 'loud'); }
    const m = AG.misaki; m.push(momFetch(m, p), true);
  }
}
function* dadFetch(a, cause) {
  a.lock = 1;
  yield* talk(a, 'よし、むかえに いくか。', 1.8);
  yield* go(a, 'umb'); faceObj(a, O.kasatate);
  const k = O.kasatate; const n = 2 - (k.st.hid ? 1 : 0);
  k.st.taken = 3; k.def.refresh(k);
  if (n >= 2) { a.setProp('umb'); const e = E(a, 'd3_umb2', 'おとうさんが かさを 2本 もった', [cause]); yield* talk(a, 'あかりの ぶんと、2本っと。', 1.8); goal('おとうさんが かさを 2本 もって でかけた', [e]); F.d3two = 1; }
  else { a.setProp('umb1'); E(a, 'd3_umb1', 'かさが 1本しか ない…', [cause, oc('kasatate', 'hide')]); yield* talk(a, 'あれ、1本しか ない。…まあ いいか！', 2.2); F.d3one = 1; }
  yield* go(a, 'ent'); leave(a); World.setDoor('d_ent', true); setTimeout(() => World.setDoor('d_ent', false), 800);
  F.d3out = World.time;
  yield* waitM(28);
  // come back with akari
  arrive(a); a.setProp(F.d3one ? 'umbOpen' : null); const ak = AG.akari; arrive(ak); ak.place({ f: 1, x: -7.2, z: -3.4, yaw: Math.PI / 2 });
  if (F.d3one) { E(a, 'd3_aiaigasa', 'あいあいがさで かえってきた', [evId('d3_umb1')]); F.d3aiai = 1; yield* talk(ak, 'おとうさんと あいあいがさ…はずかしかった〜', 2.6); }
  else yield* talk(ak, 'ただいま〜。おとうさん ありがと！', 2.2);
  a.setProp(null); a.lock = 0;
  ak.stack = [(function* () { yield* go(ak, 'k_table4'); yield* sitUntil(ak, T(19)); })()];
  yield* go(a, 'k_table2'); yield* sitUntil(a, T(19));
}
function* momFetch(a, cause) {
  a.lock = 1; a.anim = 'idle'; a.focus = 0;
  yield* talk(a, 'まあ。じゃあ わたしが いってくるわ。', 2.0);
  yield* go(a, 'umb'); O.kasatate.st.taken = 2; O.kasatate.def.refresh(O.kasatate); a.setProp('umb');
  E(a, 'd3_momgo', 'おかあさんが むかえに いった', [cause]); F.d3mom = 1;
  yield* go(a, 'ent'); leave(a);
  yield* waitM(28);
  arrive(a); const ak = AG.akari; arrive(ak); ak.place({ f: 1, x: -7.2, z: -3.4, yaw: Math.PI / 2 });
  yield* talk(ak, 'ただいま〜。', 1.4); a.lock = 0;
  ak.stack = [(function* () { yield* go(ak, 'k_table4'); yield* sitUntil(ak, T(19)); })()];
  yield* go(a, 'k_stove'); a.anim = 'cook'; yield* until(T(18, 58)); yield* go(a, 'k_table2'); yield* sitUntil(a, T(19));
}
function* dad3(a) {
  yield* talk(a, 'すごい 雨だ…。', 1.6);
  yield* go(a, 'umb'); yield* waitS(0.5);
  yield* go(a, 'sofa'); a.setProp('paper'); a.anim = 'read'; a.focus = 1;
  while (World.time < T(18, 55)) yield;
  a.anim = 'idle'; a.focus = 0; a.setProp(null);
  yield* go(a, 'k_table2'); yield* sitUntil(a, T(19));
}
// ---------- day 4: the alarm upstairs, the dark hallway
hx('act:mezamashi:ring', '*', (hs, src, room, cause) => {
  const s = hs.find(x => x.a.id === 'sota');
  if (World.day === 7) { if (s) { s.a.push(sotaUp7(s.a, cause), true); } return 'stop'; }
  if (s && s.a.floor === 1) { s.a.push(sotaAlarm(s.a, cause), true); return 'stop'; }
  if (s && s.a.floor === 2) { s.a.push(stopAlarm(s.a)); return 'stop'; }
});
function* stopAlarm(a) { yield* go(a, objSpot(O.mezamashi, 0.7)); O.mezamashi.st.ring = 0; yield* talk(a, 'うるさいなあ。', 1.4); }
function* sotaAlarm(a, cause) {
  a.anim = 'idle'; a.focus = 0;
  setFace(a, 'surp'); yield* talk(a, '2かいで なにか なってる…？', 2.0, 'think');
  const h = E(a, 'd4_hear', 'そうた「2かいで おとが…」', [cause]);
  yield* go(a, { room: 'hall', f: 1, x: -0.9, z: -3.6, yaw: -Math.PI / 2 });
  if (O.denki && O.denki.st.on) {
    setFace(a, 'happy'); yield* talk(a, 'あかるい…！ よし、ひとりで いける！', 2.2);
    const u = E(a, 'd4_up', 'そうたが ひとりで 2かいへ！', [h, oc('denki', 'on')]); F.d4up = u;
    goal('そうたが ひとりで 2かいへ あがった', [u]);
    yield* go(a, objSpot(O.mezamashi, 0.7)); O.mezamashi.st.ring = 0;
    const st = E(a, 'd4_stop', 'そうたが めざましを とめた', [u]);
    yield* talk(a, 'とまった。…あれ？', 1.6);
    if (O.kuma && O.kuma.st.turned) {
      faceObj(a, O.kuma); setFace(a, 'surp');
      yield* talk(a, 'くまさん、むきが かわってる…。', 2.0, 'think');
      yield* talk(a, '…ぽわ？ いるの？ ぼく、しってるよ。', 2.8, 'think');
      E(a, 'd4_powa', 'そうた「…ぽわ？」', [st, oc('kuma', 'turn')]); F.d4powa = 1; addSusp(a, 35, 'kodomo');
    }
    setFace(a, 'smile');
    yield* go(a, 'k2_floor'); a.anim = 'sit'; yield* until(T(16, 50)); a.anim = 'idle';
  } else {
    setFace(a, 'sad'); yield* talk(a, 'くらい…。こわいよう…。', 2.0);
    E(a, 'd4_scared', 'そうたは くらい ろうかが こわい', [h]);
    yield* talk(a, 'おばあちゃーん、いっしょに きて〜。', 2.2, 'loud');
    if (AG.fumi.home) { const f = AG.fumi; f.push((function* () { yield* talk(f, 'ばあちゃんは ひざが いたくてねえ…。', 2.4); })(), true); }
    yield* go(a, 'liv_floor'); a.anim = 'sit'; setFace(a, 'n');
  }
}
// ---------- marbles
Hooks.marbles = () => {
  const o = O.bidama; const cause = oc('bidama', 'roll');
  Sound.sfx('roll');
  World.noise(1, 'hall', 0.6, 'marbles', null, cause);
  const c = AG.monaka;
  if (c.home && c.floor === 1 && ['hall', 'living', 'washitsu', 'kitchen'].includes(c.room)) {
    c.push((function* () { yield* Cat.gen.startle(c, new V3(-0.9, 0, -3.6), 'ニャッ！？'); })(), true);
    E(c, 'marble_cat', 'ビーだまに もなかが びっくり！', [cause]); F.marbleCat = 1;
  }
};
// ---------- day 5: the photo
rx('akari', 'camera', (a, o) => o.st.shot > 0 && World.day === 5, function* (a, o) {
  a.anim = 'sit'; yield* waitS(1.0);
  setFace(a, 'surp');
  yield* talk(a, 'あれ？ しゃしんが ふえてる…。', 2.0, 'think');
  const b = E(a, 'd5_blur', 'あかり「なにか しろいのが うつってる！」', [oc('camera', 'shoot')]); addSusp(a, 45, 'akari');
  yield* talk(a, 'なにこれ、しろい もやもや…！ そうたに みせよ！', 2.4, 'loud');
  a.setProp('camera'); a.cause = b;
  const s = AG.sota;
  yield* go(a, { room: s.room || 'living', f: s.floor, x: s.pos.x + 0.7, z: s.pos.z + 0.4 }, { run: true });
  faceAg(a, s); faceAg(s, a);
  s.push((function* () { setFace(s, 'happy'); yield* talk(s, 'ぽわだ！ ぼく、しってるもん！', 2.4); })(), true);
  const c = E(a, 'd5_sota', 'そうた「ぽわだ！」', [b]); F.d5sota = c;
  yield* waitS(2.6);
  yield* talk(a, 'おばあちゃんにも みせよう！', 1.8);
  // gather in the living room
  s.push((function* () { s.lock = 1; yield* go(s, 'sofa2'); s.anim = 'sit'; while (World.time < T(17, 35) && !F.d5photo) yield; s.anim = 'idle'; s.lock = 0; })(), true);
  const f = AG.fumi; if (f.home) f.push((function* () { yield* waitS(1.5); yield* go(f, 'sofa'); f.anim = 'sit'; yield* talk(f, '…おや、まあ。ふしぎだねえ。', 2.4); E(f, 'd5_fumi', 'おばあちゃんも あつまった', [c]); while (World.time < T(17, 35) && !F.d5photo) yield; f.anim = 'idle'; })(), true);
  yield* go(a, 'liv_fold'); a.anim = 'sit';
  F.d5gather = 1;
  while (World.time < T(17, 35) && !F.d5photo) {
    if (countIn('living') >= 4 && AG.misaki.room === 'living') {
      a.anim = 'idle'; yield* talk(a, 'せっかくだし、みんなで とろうよ！ はい、チーズ！', 2.6, 'loud');
      Sound.sfx('shutter'); flashAt({ pos: a.pos.clone().add(new V3(0, 1.4, 0)), floor: a.floor });
      const p = E(a, 'd5_photo', 'あかりが 家族4人の しゃしんを とった', [c, F.d5mom]); F.d5photo = p;
      goal('家族4人の しゃしん', [p]);
      FAMILY.forEach(id => AG[id].home && AG[id].room === 'living' && setFace(AG[id], 'happy'));
      break;
    }
    yield;
  }
  a.anim = 'idle'; a.setProp(null); a.cause = null;
  yield* go(a, 'a2_desk'); a.anim = 'sit'; a.setProp('phone');
});
rx('misaki', 'pc', (a, o) => o.st.off && World.day >= 5, function* (a, o) {
  a.anim = 'sit'; yield* waitS(1.0); setFace(a, 'panic');
  yield* talk(a, 'あっ！ がめんが きえた！', 1.8, 'loud');
  const p = E(a, 'd5_pc', 'おかあさんの パソコンが きえた', [oc('pc', 'off')]); addSusp(a, 25, 'shinshitsu');
  yield* talk(a, '…もう、きゅうけい！', 1.6); setFace(a, 'n');
  o.st.off = false; o.def.refresh(o);
  F.d5mom = p;
  if (World.day === 5 && F.d5gather && !F.d5photo) {
    yield* go(a, 'liv_door');
    yield* talk(a, 'なに みんなで みてるの？', 1.8);
    E(a, 'd5_momjoin', 'おかあさんも リビングへ', [p]);
    yield* go(a, 'sofa'); a.anim = 'sit';
    while (!F.d5photo && World.time < T(17, 35)) yield;
    a.anim = 'idle';
  } else { yield* go(a, 'k_teapot'); yield* sitFor(a, 6, 'tea'); }
});
rx('misaki', 'album', (a, o) => o.st.open, function* (a, o) {
  faceObj(a, o); yield* waitS(0.8); setFace(a, 'smile');
  yield* talk(a, 'あかり… こんなに みんなの しゃしん とってたの…。', 2.8);
  E(a, 'album_mom', 'おかあさんが あかりの アルバムを みた', [oc('album', 'open')]); F.albumMom = 1;
  setFace(a, 'n');
});
// ---------- day 6: the piano
function catPianoCheck(c) {
  if (World.day < 6 || !O.piano || O.piano.st.cloth || F.catPiano || World.phase !== 'chain') return false;
  if (c.room !== 'living' || World.time < T(16, 45)) return false;
  return true;
}
function* catPiano(c) {
  F.catPiano = 1; const p = O.piano;
  yield* go(c, objSpot(p, 0.6)); c.anim = 'idle';
  c.pos.y = 0; Sound.sfx('piano', 392); setTimeout(() => Sound.sfx('piano', 330), 260); setTimeout(() => Sound.sfx('piano', 523), 600);
  UI.bubble(c, '♪ ポロン ポロン', 1.6);
  const e = E(c, 'd6_cat', 'もなかが けんばんを ふんだ ♪', [oc('piano', 'cloth')]);
  World.noise(1, 'living', 0.85, 'piano', p, e);
  yield* waitS(2.0);
}
for (const kind of ['piano', 'act:piano:key']) hx(kind, '*', (hs, src, room, cause) => {
  if (World.day < 6) return;
  const s = hs.find(x => x.a.id === 'sota' && x.a.mode !== 'search');
  if (s && !F.d6sota) { F.d6sota = -1; s.a.push(sotaPiano(s.a, cause), true); return 'stop'; }
});
function* sotaPiano(a, cause) {
  a.lock = 1; a.focus = 0;
  yield* talk(a, 'ピアノの おと！', 1.4);
  yield* go(a, 'piano', { run: true });
  setFace(a, 'happy'); yield* talk(a, 'ぼく、ねこふんじゃった ひける！', 2.0);
  const e = E(a, 'd6_sota', 'そうたが ピアノを ひきはじめた', [cause]); F.d6sota = e;
  for (let i = 0; i < 6; i++) { Sound.sfx('piano', [392, 349, 330, 523, 494, 262][i]); yield* waitS(0.35); }
  World.noise(1, 'living', 0.85, 'piano2', O.piano, e);
  a.anim = 'idle';
  while (!F.d6mom && World.time < T(17, 20)) { yield* waitS(0.7); if (Math.random() < 0.5) Sound.sfx('piano', pick([262, 330, 392, 440, 523])); }
  if (F.d6mom) { yield* go(a, 'sofa2'); a.anim = 'sit'; while (World.time < T(17, 25)) yield; a.anim = 'idle'; }
  a.lock = 0; setFace(a, 'n');
}
hx('piano2', '*', (hs, src, room, cause) => {
  const m = hs.find(x => x.a.id === 'misaki' && x.a.mode !== 'search');
  if (m && !F.d6mom) { F.d6mom = -1; m.a.push(momPiano(m.a, cause), true); return 'stop'; }
});
function* momPiano(a, cause) {
  a.lock = 1; a.anim = 'idle'; a.focus = 0;
  yield* talk(a, 'あら、ピアノ…？', 1.4);
  yield* go(a, { room: 'living', f: 1, x: O.piano.pos.x + (World.layout === 'B' ? 1.0 : 0.6), z: O.piano.pos.z + (World.layout === 'B' ? 0.6 : 1.0) });
  yield* talk(a, 'ちがう ちがう、こうよ。', 1.8);
  const e = E(a, 'd6_mom', 'おかあさんが ピアノを ひいた', [cause]); F.d6mom = e;
  goal('おかあさんが ピアノを ひいた', [e]);
  setFace(a, 'smile');
  const mel = [523, 587, 659, 523, 659, 784, 698, 659, 587, 523];
  for (const f of mel) { Sound.sfx('piano', f); yield* waitS(0.4); }
  World.noise(1, 'living', 1.0, 'piano3', O.piano, e);
  a.anim = 'idle';
  for (let k = 0; k < 2; k++) for (const f of mel) { Sound.sfx('piano', f); yield* waitS(0.4); }
  if (F.d6fumi) {
    yield* talk(a, 'わたし むかし、ちよ先生に ピアノ ならってたの。この家で。', 3.0);
    E(a, 'd6_secret', 'おかあさんの ひみつ：ちよ先生の ピアノ', [F.d6fumi]); F.d6secret = 1;
  }
  yield* waitM(3);
  a.lock = 0; setFace(a, 'n');
}
hx('piano3', '*', (hs, src, room, cause) => {
  const f = hs.find(x => x.a.id === 'fumi');
  if (f && !F.d6fumi) { f.a.push((function* () { const a = f.a; a.anim = 'idle'; a.focus = 0; yield* talk(a, 'この きょく…。', 1.6); yield* go(a, 'sofa'); setFace(a, 'smile'); yield* talk(a, 'ちよさんが よく ひいてた きょくだねえ。', 2.6); F.d6fumi = E(a, 'd6_fumi', 'おばあちゃん「ちよさんの きょくだねえ」', [cause]); a.anim = 'sit'; yield* waitM(8); a.anim = 'idle'; setFace(a, 'n'); })(), true); return 'stop'; }
});
// ---------- day 7: grandma climbs the stairs
function* sotaUp7(a, cause) {
  a.anim = 'idle'; a.focus = 0;
  yield* talk(a, 'ぼくの めざまし！？', 1.6, 'loud');
  const u = E(a, 'd7_sotaup', 'そうたが 2かいへ かけあがった', [cause]); F.d7up = u;
  if (O.tv.st.on) { O.tv.st.on = false; O.tv.def.refresh(O.tv); }
  yield* go(a, objSpot(O.mezamashi, 0.7), { run: true }); O.mezamashi.st.ring = 0;
  yield* talk(a, 'とまった。なんで なったんだろ？', 2.0);
  yield* go(a, 'k2_floor'); a.anim = 'sit';
  while (World.time < T(17, 20)) yield; a.anim = 'idle';
}
hx('act:hondana:drop', '*', (hs, src, room, cause) => {
  const f = hs.find(x => x.a.id === 'fumi' && !x.a.asleep);
  if (World.day === 7 && f && !F.d7worry) { F.d7worry = -1; f.a.push(fumiUp7(f.a, cause), true); return 'stop'; }
});
function* fumiUp7(a, cause) {
  a.anim = 'idle'; a.focus = 0; a.setProp(null);
  const s = AG.sota;
  if (s.home && s.floor === 2) {
    setFace(a, 'surp');
    yield* talk(a, 'そうちゃん！？ おちたのかい！？', 2.0, 'loud');
    const w = E(a, 'd7_worry', 'おばあちゃんが しんぱいした', [cause, F.d7up]);
    a.lock = 1;
    yield* go(a, 'a2_mid', { slow: 0.8 });
    const u = E(a, 'd7_up', 'おばあちゃんが 2かいへ あがった！', [w]); F.d7fumiUp = u;
    goal('おばあちゃんが 2かいへ あがった', [u]);
    yield* talk(a, 'ほんが おちてる…。そうちゃんじゃ ないね。', 2.4);
    s.push((function* () { yield* go(s, { room: 'akari', f: 2, x: 3.4, z: -1.4 }); yield* talk(s, 'ぼくじゃ ないよ！', 1.6); })(), true);
    yield* waitS(2.4);
    setFace(a, 'sus');
    yield* talk(a, '…やっぱり、いるんだね。', 2.4, 'think');
    a.lock = 0;
    World.lastWeird = 'akari'; a.susp = 100; startSearch(a, 'akari');
    while (a.mode === 'search') yield;
    yield* talk(a, 'ちよさん…。あんたなのかい？', 2.8, 'think');
    E(a, 'd7_chiyo', 'おばあちゃん「ちよさん… あんたなのかい？」', [u]);
    yield* go(a, 'k_stove', { slow: true });
  } else {
    yield* talk(a, 'おや、2かいで なにか おちたね。あとで あかりに いおう。', 2.6);
    E(a, 'd7_no', 'おばあちゃんは 2かいへ いかなかった', [cause]);
  }
}
// ---------- day 8: the radio in the shed
function* dad8(a) {
  yield* talk(a, 'さて、もようがえの つづきだ。ものおきから 工具を とってこよう。', 2.6);
  const hk = O.hako, rd = O.radio;
  yield* go(a, 'sh_in');
  if (F.d8told || (hk && hk.st.fallen) || (rd && rd.st.on)) {
    if (hk && !hk.st.fallen) { yield* talk(a, 'だんボールの おくに… よいしょ。', 1.8); hk.st.fallen = true; hk.def.refresh(hk); }
    yield* go(a, 'sh_radio'); faceObj(a, rd); setFace(a, 'surp');
    yield* talk(a, 'これは… おやじの ラジオ！', 2.2, 'loud');
    const e = E(a, 'd8_dad', 'おとうさんが ラジオを みつけた', [F.d8told, hk && hk.st.fallen ? oc('hako', 'fall') : null, rd.st.on ? oc('radio', 'on') : null]);
    goal('おとうさんが ラジオを みつけた', [e]);
    setFace(a, 'smile');
    yield* talk(a, 'すてられなくて、ここに しまってたんだ…。', 2.6);
    pickUp(a, rd);
    if (O.tegami && O.tegami.st.glow) {
      faceObj(a, O.tegami); yield* talk(a, 'ん…？ この 手紙は…？ あとで みよう。', 2.4);
      E(a, 'd8_letter', 'おとうさんが ふるい 手紙に きづいた', [oc('tegami', 'glow')]); F.d8letter = 1;
    }
    yield* go(a, 'fish'); putDown(a, rd, -1.6, 0.82, 0.5);
    E(a, 'd8_bring', 'ラジオが リビングに やってきた', [e]);
  } else {
    yield* go(a, 'sh_box'); yield* talk(a, '工具 工具… あった。', 1.8);
    yield* go(a, 'liv_floor'); a.anim = 'sit'; yield* waitM(8); a.anim = 'idle';
  }
}
hx('act:radio:on', '*', (hs, src, room, cause) => {
  const d = World.day;
  if (d === 8) {
    const m = hs.find(x => x.a.id === 'misaki' && x.a.room === 'garden');
    if (m && !F.d8mom) { F.d8mom = 1; m.a.push(momRadio8(m.a, cause), true); return 'stop'; }
    return 'stop';
  }
  if (d === 9) {
    const h = hs.find(x => x.a.id === 'hiroshi');
    if (h && h.a.room === 'living') { h.a.push(dadHum(h.a, cause), true); }
    for (const x of hs) if (x.a.id === 'fumi' && !F.d9fumi && F.d9hum) { F.d9fumi = 1; x.a.push(fumiSing(x.a), true); }
    return 'stop';
  }
  if (d === 11 || d === 14) {
    const h = hs.find(x => x.a.id === 'hiroshi');
    if (h && !F.d11stay && d === 11) { h.a.push(dad11radio(h.a, cause), true); }
    return 'stop';
  }
});
function* momRadio8(a, cause) {
  const k = a.carry; a.anim = 'idle';
  yield* talk(a, 'あら？ ものおきから おんがく…？', 2.0, 'think');
  const e = E(a, 'd8_momhear', 'おかあさんが ものおきの おとに きづいた', [cause]);
  if (k) putDown(a, k, 12.6, 0, 1.6);
  yield* go(a, 'sh_in');
  if (O.hako && !O.hako.st.fallen) { yield* talk(a, 'だんボールの おく…？ よいしょ。', 1.8); O.hako.st.fallen = true; O.hako.def.refresh(O.hako); }
  yield* go(a, 'sh_radio'); faceObj(a, O.radio);
  yield* talk(a, 'これ… あの人の ラジオ。こんな ところに。', 2.4);
  O.radio.st.on = false; O.radio.def.refresh(O.radio);
  F.d8told = E(a, 'd8_mom', 'おかあさんが ラジオを みつけた', [e]);
  yield* talk(a, 'かえってきたら おしえて あげよう。', 2.0);
  yield* go(a, 'g_hoshi'); if (k) pickUp(a, k);
}
// ---------- day 9: humming
function* dad9(a) {
  const r = O.remocon;
  yield* go(a, 'sofa'); faceObj(a, O.tv);
  if (r && r.st.hidden) {
    yield* talk(a, 'リモコンは… ない。まあ いいか、しんぶん でも よもう。', 2.6);
    F.d9relax = E(a, 'd9_paper', 'おとうさんが しんぶんで のんびり', [oc('remocon', 'hide')]);
    a.setProp('paper'); a.anim = 'read'; a.focus = 1;
  } else {
    yield* watchTVsofa(a);
    if (!F.tvKilled) { a.anim = 'idle'; return; }
    yield* talk(a, 'まあ いいか、しんぶん でも よもう。', 2.0);
    F.d9relax = E(a, 'd9_paper', 'おとうさんが しんぶんで のんびり', [F.tvKilled]);
    a.setProp('paper'); a.anim = 'read'; a.focus = 1;
  }
  if (O.radio && O.radio.st.on && !F.d9hum) { a.push(dadHum(a, oc('radio', 'on')), true); }
  while (World.time < T(18, 50)) yield;
  a.anim = 'idle'; a.focus = 0; a.setProp(null);
}
function* watchTVsofa(a) {
  O.tv.st.on = true; O.tv.def.refresh(O.tv); a.anim = 'tv'; a.focus = 2;
  while (World.time < T(18, 50) && O.tv.st.on) yield;
  a.anim = 'idle'; a.focus = 0;
}
function* dadHum(a, cause) {
  if (a.focus >= 2) { yield* talk(a, 'ん？ ラジオ？ テレビが きこえないなあ。', 2.2); yield* go(a, 'fish'); O.radio.st.on = false; O.radio.def.refresh(O.radio); addSusp(a, 40, 'living'); yield* go(a, 'sofa'); a.anim = 'tv'; a.focus = 2; return; }
  if (F.d9hum) return;
  yield* waitS(1.2); setFace(a, 'smile');
  yield* talk(a, 'この うた… なつかしいな。', 2.0);
  const h = E(a, 'd9_hum', 'おとうさんが はなうたを うたった ♪', [cause, F.d9relax]); F.d9hum = h;
  goal('おとうさんの はなうた', [h]);
  UI.bubble(a, 'ふんふふ〜ん ♪', 3.0);
  const f = AG.fumi; if (f.home && !F.d9fumi && heardVol('living', f.room, 0.6) >= 0.3) { F.d9fumi = 1; f.push(fumiSing(f), true); }
  yield* waitS(3.2);
}
function* fumiSing(a) {
  a.anim = 'idle'; a.focus = 0;
  yield* talk(a, 'あら、いい うただねえ。', 1.8);
  yield* go(a, 'sofa2'); setFace(a, 'happy');
  UI.bubble(a, 'ら〜らら〜 ♪', 2.6);
  E(a, 'd9_sing', 'おばあちゃんも いっしょに うたった', [F.d9hum]); F.d9sing = 1;
  yield* waitS(2.8);
  yield* talk(AG.hiroshi, 'おやじも よく この うた きいてたんだ。', 2.6);
  a.anim = 'sit'; yield* waitM(6); a.anim = 'idle'; setFace(a, 'n');
  yield* go(a, 'k_stove');
}
// ---------- day 10: the letter
function catLetterCheck(c) {
  const t = O.tegami; if (World.day < 10 || !t || F.catLetter || World.phase !== 'chain') return false;
  if (!t.st.glow || t.st.flown || !World.doorOpen('d_sh')) return false;
  return c.room === 'garden' || c.room === 'engawa';
}
function* catLetter(c) {
  F.catLetter = 1; const t = O.tegami;
  yield* go(c, 'sh_box', {});
  UI.bubble(c, 'ニャ？', 1.2); yield* waitS(1.0);
  t.st.flown = true; t.def.refresh(t); c.setProp && (c.prop = null);
  const e = E(c, 'd10_cat', 'もなかが 手紙を くわえた', [oc('tegami', 'glow'), oc('door_d_sh', 'open')]); F.d10cat = e;
  const k = O.kago;
  const tgt = k && k.room === 'garden' && !k.carried ? { room: 'garden', f: 1, x: k.pos.x + 0.6, z: k.pos.z } : { room: 'garden', f: 1, x: 11.6, z: 1.0 };
  yield* go(c, tgt);
  if (k && k.room === 'garden' && !k.carried && c.pos.distanceTo(k.pos) < 1.5) { t.st.inBasket = 1; k.st.letter = true; k.def.refresh(k); E(c, 'd10_basket', '手紙が せんたくかごに', [e]); }
  else if (k && k.carried && k.carried.room === 'garden') { t.st.inBasket = 1; k.st.letter = true; k.def.refresh(k); E(c, 'd10_basket', '手紙が せんたくかごに', [e]); }
  else { t.st.onGrass = 1; t.pos.set(c.pos.x + 0.3, 0.02, c.pos.z); t.target = t.pos.clone(); t.st.flown = false; t.def.refresh(t); E(c, 'd10_grass', '手紙が しばふに', [e]); }
  c.anim = 'sleep';
}
rx('misaki', 'hoshi', (a, o) => World.day === 8 && O.radio && O.radio.st.on && World.doorOpen('d_sh') && !F.d8mom, function* (a, o) { F.d8mom = 1; yield* momRadio8(a, oc('radio', 'on')); });
rx('misaki', 'hoshi', (a, o) => O.tegami && (O.tegami.st.onGrass || O.tegami.st.landed), function* (a, o) {
  const t = O.tegami;
  yield* talk(a, 'あら？ なにか おちてる。', 1.6, 'think');
  yield* go(a, objSpot(t, 0.6)); t.st.flown = true; t.st.onGrass = 0; t.st.landed = 0; t.def.refresh(t);
  a.carry && (a.carry.st.letter = true); O.kago.st.letter = true; O.kago.def.refresh(O.kago);
  E(a, 'd10_pick', 'おかあさんが 手紙を ひろった', [t.cause, F.d10cat]);
  yield* go(a, 'g_hoshi');
});
function* momLetter(a) {
  a.anim = 'idle';
  yield* talk(a, 'あら… この 手紙…。', 1.8);
  setFace(a, 'surp');
  yield* talk(a, '「ふみちゃんと みさきちゃんへ」… ちよ先生の 字…！', 3.0, 'loud');
  const e = E(a, 'd10_read', 'おかあさんが ちよ先生の 手紙を みつけた', [evId('d10_basket') || evId('d10_pick') || oc('tegami', 'fly')]); F.d10read = e;
  goal('手紙が おかあさんに とどいた', [e]);
  setFace(a, 'n');
  yield* talk(a, '…おかあさんに わたさなきゃ。でも…まだ ひらけない。', 2.6);
  O.kago.st.letter = false; O.kago.def.refresh(O.kago);
}
// ---------- day 11: dad and mom
function* dad11(a) {
  yield* go(a, 's2_bed'); a.anim = 'sit'; a.setProp('paper'); a.focus = 1;
  while (World.time < T(18, 55) && !F.d11stay) yield;
  a.anim = 'idle'; a.focus = 0; a.setProp(null);
  if (F.d11stay) return;
  yield* go(a, 'k_table2'); yield* sitUntil(a, T(19));
}
function* dadSlip11(a) {
  if (!(O.slipper && O.slipper.st.hidden)) return;
  F.d11slip = 1;
  yield* talk(a, 'あれ、スリッパが かたほう ない…。', 2.0);
  E(a, 'd11_slip', 'おとうさんが スリッパを さがす', [oc('slipper', 'hide')]);
  yield* go(a, 'hall_mid'); a.anim = 'search'; yield* waitM(4); a.anim = 'idle';
  O.slipper.st.hidden = false; O.slipper.def.refresh(O.slipper);
  yield* talk(a, 'あった あった。', 1.4);
}
function* dad11radio(a, cause) {
  if (a.floor === 2 && a.room !== 'hall2') { yield* talk(a, '…下で なにか なってる？', 1.6, 'think'); }
  a.anim = 'idle'; a.focus = 0; a.setProp(null);
  yield* talk(a, 'この うた…。', 1.4);
  yield* go(a, 'sofa'); setFace(a, 'smile');
  F.d11stay = E(a, 'd11_dadradio', 'おとうさんが ラジオの まえに すわった', [cause]);
  a.anim = 'sit'; a.focus = 1;
  while (World.time < T(18, 55)) yield;
  a.anim = 'idle'; a.focus = 0;
  yield* go(a, 'k_table2'); yield* sitUntil(a, T(19));
}
function* momTea11(a) {
  yield* go(a, 'k_stove'); a.anim = 'cook'; a.focus = 2; yield* until(T(18, 22)); a.anim = 'idle'; a.focus = 0;
  const k = O.kyusu;
  yield* go(a, 'k_teapot');
  if (k.st.cups >= 2) {
    yield* talk(a, 'ゆのみが ふたつ…。', 1.6, 'think');
    yield* talk(a, '…あの人にも、もっていこうかな。', 2.2);
    const t = E(a, 'd11_tea2', 'おかあさんが お茶を ふたつ いれた', [oc('kyusu', 'cups')]); a.setProp('cup');
    const d = AG.hiroshi;
    if (d.home && d.room === 'living' && F.d11stay) {
      yield* go(a, 'sofa2'); faceAg(a, d);
      yield* talk(a, '…はい、お茶。', 1.4);
      yield* talk(d, 'ありがとう。…おやじが よく この ラジオで 野球 きいてたんだ。', 3.0);
      yield* talk(a, '…すてるなんて いって、ごめんね。', 2.4);
      const r = E(a, 'd11_ok', 'おとうさんと おかあさんが なかなおり', [t, F.d11stay]); F.d11ok = r;
      goal('ラジオの まえで なかなおり', [r]);
      setFace(a, 'smile'); setFace(d, 'smile');
      a.anim = 'sit'; yield* waitM(10); a.anim = 'idle';
    } else if (d.home) {
      yield* go(a, 's2_tansu'); yield* talk(a, '…ここ、おいとくね。', 1.8); E(a, 'd11_door', 'お茶を おいて もどった', [t]);
    }
    a.setProp(null);
  } else { a.setProp('cup'); yield* sitFor(a, 5, 'tea'); a.setProp(null); }
}
// ---------- day 12: akari's room
function* akari12(a) {
  a.focus = 2;
  while (World.time < T(17, 20)) yield;
  if (O.juden && O.juden.st.unplug) {
    a.setProp(null); setFace(a, 'sad');
    yield* talk(a, 'あ… でんち きれた。', 1.6);
    const d = E(a, 'd12_dead', 'あかりの スマホの でんちが きれた', [oc('juden', 'unplug')]); a.focus = 0;
    yield* talk(a, 'たいくつ…。', 1.4);
    if (O.album && O.album.st.open) {
      yield* go(a, objSpot(O.album, 0.6)); setFace(a, 'smile');
      yield* talk(a, '…ちいさい ころの しゃしん。みんな わらってる。', 2.6);
      const b = E(a, 'd12_album', 'あかりが アルバムを ながめた', [d, oc('album', 'open')]);
      yield* talk(a, '…したに もっていこ。', 1.6);
      O.album.st.open = false; O.album.def.refresh(O.album); a.setProp('paper');
      yield* go(a, 'sofa');
      const g = E(a, 'd12_down', 'あかりが リビングに おりてきた', [b]); F.d12down = g;
      goal('あかりが リビングへ おりてきた', [g]);
      a.anim = 'sit';
      const m = AG.misaki;
      if (m.home) {
        m.push((function* () { m.anim = 'idle'; m.focus = 0; yield* go(m, 'sofa2'); yield* talk(m, 'あかり…それ、アルバム？', 1.8); yield* talk(a, '…うん。いっしょに みる？', 1.8); E(m, 'd12_talk', 'あかりと おかあさんが アルバムを みた', [g]); F.d12talk = 1; setFace(m, 'smile'); setFace(a, 'smile'); m.anim = 'sit'; yield* waitM(12); m.anim = 'idle'; yield* go(m, 'k_stove'); m.anim = 'cook'; })(), true);
      }
      while (World.time < T(18, 40)) yield;
      a.anim = 'idle'; a.setProp(null);
      yield* go(a, 'k_table4'); yield* sitUntil(a, T(19));
    } else {
      yield* go(a, 'a2_bed'); a.anim = 'sit'; yield* talk(a, '…ねよ。', 1.2); a.asleep = true; setFace(a, 'sleep');
      while (World.time < T(18, 50)) yield; a.asleep = false;
    }
  }
}
function* akari14(a) {
  while (World.time < T(17, 20)) yield;
  if (O.juden && O.juden.st.unplug) {
    a.setProp(null); yield* talk(a, 'あ、でんち きれた…。イヤホンも つかえない。', 2.2);
    E(a, 'd14_dead', 'あかりの スマホが きれた', [oc('juden', 'unplug')]); a.focus = 0;
  }
}
// ---------- day 13: sota hides
function* sotaHide(a) {
  setFace(a, 'sad');
  yield* talk(a, '…みんな ケンカ ばっかり。', 2.0);
  yield* talk(a, 'ぼくが いなくなっても、だれも きづかないんだ。', 2.4);
  yield* go(a, 'w_oshi');
  if (Ghost.hostObj() === O.oshiire) yield* talk(a, '…ぽわ？ いっしょに いて くれるの？', 2.4, 'think');
  a.mesh.visible = false; a.hidden = true; a.home = true; a.inOshiire = true;
  a.pos.set(2.2, 0, -5.0); F.sotaHiding = 1; a.asleep = true;
  E(a, 'd13_hide', 'そうたが おしいれに かくれた', []);
  while (!F.d13found && World.time < T(18, 45)) yield;
  a.asleep = false; a.inOshiire = false; a.hidden = false;
  a.pos.set(2.2, 0, -4.3);
  if (F.d13found) { setFace(a, 'happy'); yield* waitM(1); }
  yield* go(a, 'k_table1'); setFace(a, 'n'); yield* sitUntil(a, T(19));
}
function* momSota13(a) {
  yield* go(a, 'liv_door');
  yield* talk(a, 'そうた〜？ アニメ はじまるわよ〜。', 2.2, 'loud');
  yield* waitS(1.6);
  yield* talk(a, '…あそびに いったのかしら。', 1.8);
}
function* mom13notice(a, cause) {
  a.lock = 1; a.anim = 'idle'; a.focus = 0;
  yield* go(a, 'tv_front');
  yield* talk(a, 'テレビ つけっぱなしで… そうた？', 2.0, 'think');
  F.d13notice = E(a, 'd13_notice', 'おかあさんが そうたの いないことに きづいた', [cause]);
  setFace(a, 'panic');
  yield* talk(a, 'そうた！？ どこ！？ みんな、そうたが いないの！', 2.6, 'loud');
  const c = E(a, 'd13_call', 'おかあさんが みんなを よんだ', [F.d13notice]); F.d13call = c;
  World.noise(1, 'living', 1.0, 'call13', a, c);
  a.lock = 0;
  for (const id of ['misaki', 'akari', 'fumi', 'hiroshi']) { const b = AG[id]; if (b.home && (b === a || b.room)) { b.lock = 0; b.push(familySearch13(b), true); b.lock = 1; } }
}
const SEARCH13 = ['living', 'kitchen', 'hall', 'washitsu', 'hall2', 'kodomo', 'akari', 'shinshitsu', 'garden'];
function* familySearch13(a) {
  a.anim = 'idle'; a.focus = 0; a.asleep = false; setFace(a, 'panic'); a.setProp(null);
  const order = SEARCH13.slice().sort(() => Math.random() - 0.5);
  if (a.id === 'fumi') order.unshift('washitsu');
  while (!F.d13found && World.time < T(18, 40)) {
    if (F.d13hint) { // the rattling oshiire
      yield* talk(a, 'おしいれから おとが…！', 1.6, 'loud');
      yield* go(a, 'w_oshi', { run: true });
      if (!F.d13found) {
        F.d13found = E(a, 'd13_found', a.name + 'が そうたを みつけた！', [F.d13hint, F.d13call]);
        Sound.sfx('door');
        if (Ghost.hostObj() === O.oshiire) Ghost.expose(0.6, a);
      }
      break;
    }
    const r = order.shift(); if (!r) { order.push(...SEARCH13); continue; }
    const c = roomCenter(r);
    yield* go(a, { room: r, f: ROOMS[r].floor, x: c.x + rnd(-1, 1), z: c.z + rnd(-0.8, 0.8) }, { run: true });
    yield* talk(a, 'そうた〜？', 1.2, 'loud');
    // look into a couple of things
    const objs = searchable(r).slice(0, 2);
    for (const o of objs) { if (F.d13hint || F.d13found) break; yield* go(a, objSpot(o, 0.7)); faceObj(a, o); a.inspect = o.id; a.mode = 'search'; a.style = a.id === 'akari' ? 'look' : SEARCH_STYLE[a.id] === 'touch' ? 'touch' : 'look'; yield* waitS(1.2); a.inspect = null; a.mode = 'normal'; }
  }
  a.inspect = null; a.mode = 'normal'; a.lock = 0;
  if (F.d13found) {
    yield* go(a, { room: 'washitsu', f: 1, x: 2.2 + rnd(-1.5, 1.5), z: -3.4 + rnd(-0.6, 0.6) });
    faceTo(a, 2.2, -5.0);
    if (!F.d13hug && countIn('washitsu') >= 3) {
      F.d13hug = 1; const s = AG.sota;
      yield* talk(a, 'よかった…！', 1.4);
      const h = E(a, 'd13_hug', 'みんなで そうたを ぎゅっと した', [F.d13found]);
      goal('かくれた そうたが みつかった', [h]);
      yield* talk(s, '…みんな、さがして くれたの？', 2.2);
      yield* talk(AG.misaki, 'あたりまえでしょ。', 1.8);
      FAMILY.forEach(id => AG[id].home && setFace(AG[id], 'happy'));
    }
    a.anim = 'idle'; yield* waitM(6); setFace(a, 'n');
  }
}
hx('act:oshiire:rattle', '*', (hs, src, room, cause) => {
  if (World.day === 13 && F.sotaHiding && !F.d13found) {
    const any = hs.find(x => F.d13call); if (any) { F.d13hint = E(any.a, 'd13_rattle', 'おしいれが ガタガタ…', [cause]); return 'stop'; }
  }
});
// ---------- day 14: everyone in the washitsu
function* mom14(a) {
  const t = O.tegami;
  if (t && t.st.glow) {
    yield* go(a, objSpot(t, 0.7)); faceObj(a, t);
    yield* talk(a, '…手紙が、ひかってる…？', 2.0, 'think');
    yield* talk(a, 'いま、わたさなきゃ。', 1.6);
    const g = E(a, 'd14_take', 'おかあさんが 手紙を もった', [oc('tegami', 'glow')]);
    pickUp(a, t);
    yield* go(a, 'w_sit2');
    putDown(a, t, 3.8, 0.43, -2.4);
    const f = AG.fumi;
    yield* talk(a, 'おかあさん、これ… ちよ先生の 手紙。', 2.4);
    yield* talk(f, '…ちよさんの。「ふみちゃんと みさきちゃんへ」。', 2.8);
    const r = E(f, 'd14_read', 'おばあちゃんが 手紙を うけとった', [g]); F.d14read = r;
    yield* talk(f, 'みんなで よもうかね。みんなを よんで おくれ。', 2.6);
    yield* go(a, 'hall_mid');
    yield* talk(a, 'みんな〜！ 和室に あつまって〜！', 2.6, 'loud');
    const c = E(a, 'd14_call', 'おかあさんが みんなを よんだ', [r]); F.d14call = c;
    World.noise(1, 'hall', 1.0, 'call14', a, c);
    yield* go(a, 'w_sit'); a.anim = 'sit';
    while (World.time < T(19)) { if (!F.d14all && FAMILY.every(id => AG[id].home && AG[id].room === 'washitsu')) { F.d14all = E(f, 'd14_all', '家族 みんなが 和室に そろった', [c]); goal('家族 みんなが 和室に そろった', [F.d14all]); } yield; }
  } else {
    yield* go(a, 'k_stove'); a.anim = 'cook'; a.focus = 2; yield* until(T(18, 55)); a.anim = 'idle'; a.focus = 0;
    yield* go(a, 'k_table2'); yield* sitUntil(a, T(19));
  }
}
hx('call14', '*', (hs, src, room, cause) => {
  for (const { a } of hs) {
    if (a.id === 'misaki' || a.id === 'fumi') continue;
    if (a.focus >= 2 || a.asleep) { a.push((function* () { yield* waitS(1); say(a, '…？', 1.0); })(), true); continue; }
    a.push(come14(a, cause), true);
  }
  return 'stop';
});
function* come14(a, cause) {
  a.lock = 1; a.anim = 'idle'; a.focus = 0; a.setProp(null);
  yield* talk(a, 'はーい。', 1.0);
  yield* go(a, { room: 'washitsu', f: 1, x: 3.0 + rnd(0, 2.5), z: -3.4 + rnd(-0.5, 0.8) });
  faceTo(a, 4.2, -2.6); a.anim = 'sit';
  E(a, 'd14_come_' + a.id, a.name + 'が 和室に きた', [cause]);
  while (World.time < T(19)) yield;
}
// ---------- world timeline events
const TIMELINE = {
  3: [[T(17, 30), () => { World.rain = true; }], [T(18, 10), () => { if (!O.denwa) return; O.denwa.st.ring = 1; Sound.sfx('ring'); UI.toast('ジリリリ… でんわだ！'); World.noise(1, 'hall', 1.0, 'phone', O.denwa); }]],
};
