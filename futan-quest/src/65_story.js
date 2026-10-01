// ================================================================ story, NPCs, events
const F = () => GAME.flags;
const LOOK = {
  principal: { hair: 0x8a8a8a, hairStyle: 'bun', top: 0xe88aa8, bottom: 0x4a4a6a, skirt: true, apron: 0xffffff, glasses: true, shoes: 0x4a2a1a },
  mama: { hair: 0x3a2214, hairStyle: 'long', top: 0xf2b84a, bottom: 0x6a8ab8, skirt: true, apron: 0xfff2e0, shoes: 0x8a3a2a },
  granny: { hair: 0xd8d8d8, hairStyle: 'bun', top: 0x7a5a8a, bottom: 0x4a3a5a, skirt: true, hat: 'scarf', hatCol: 0x8a2a3a },
  kidboy: { kid: true, hair: 0x2a1a10, top: 0x3ab86a, bottom: 0x2a3a6a, hat: 'kinder', shoes: 0x2a6ad8 },
  kidgirl: { kid: true, hair: 0x5a3010, hairStyle: 'pigtails', top: 0xff9ac8, bottom: 0xffffff, skirt: true, shoes: 0xe84a6a },
  man: { hair: 0x3a2a1a, top: 0x6a8a4a, bottom: 0x4a3a2a, belt: true, beard: true, hat: 'cap', hatCol: 0x6a4a2a },
  guard: { hair: 0x2a1a10, top: 0x3a5ab8, bottom: 0x2a2a3a, belt: true, hat: 'cap', hatCol: 0x2a3a7a, sword: 'hero' },
  merchant: { hair: 0x6a4a2a, top: 0x8a3a2a, bottom: 0x3a2a1a, apron: 0xd8c8a0, belt: true },
  smith: { hair: 0x1a1a1a, hairStyle: 'bald', top: 0x5a4a3a, bottom: 0x2a2a2a, apron: 0x4a3020, beard: true, belt: true },
  shopgirl: { hair: 0xa8541a, hairStyle: 'pigtails', top: 0x4ab8a8, bottom: 0xffffff, skirt: true, apron: 0xffffff },
  inn: { hair: 0x4a3a2a, top: 0xffffff, bottom: 0x2a2a2a, hat: 'chef', belt: true, beard: false },
  elder: { hair: 0xf0f0f0, hairStyle: 'bald', top: 0x5a7a4a, bottom: 0x3a4a2a, beard: true, skirt: true },
  traveler: { hair: 0x6a3a1a, top: 0x8a6a3a, bottom: 0x4a3a2a, hat: 'cap', hatCol: 0x3a5a2a, cape: 0x5a3a1a },
  worker: { hair: 0x2a1a10, top: 0xd88a2a, bottom: 0x3a4a6a, hat: 'cap', hatCol: 0xf8d21c, belt: true },
};
const say = (who, t) => UI.msg(t, { who });
const nar = t => UI.msg(t);
function buildNPCs() {
  const V = PL.village, Fo = PL.forest;
  // ---------------- village
  addNPC({ id: 'principal', look: LOOK.principal, x: SPOT.kinder.x, z: SPOT.kinder.z, h: Math.PI, talk: async () => {
    const f = F();
    if (f.sunback) return say('えんちょう せんせい', 'ふーたん！ ほんとうに ありがとう！ おひさまが もどって きたわ。 あなたは ひかりようちえんの ほこりよ！');
    if (!f.bear) return say('えんちょう せんせい', 'リッキーは ひがしの どんぐりの どうくつに いるはずよ。 むらの ひがしの みちを まっすぐ すすんでね。\n\nまものが つよいと おもったら、 むらの まわりで レベルを あげてから いくのよ。');
    if (!f.bridge) return say('えんちょう せんせい', 'リッキー！ ぶじで よかった〜！\n\nまほうの つみき？ それで きたの こわれた はしが なおせるかも しれないわ！');
    if (!f.bell) return say('えんちょう せんせい', 'もりの まちの ちょうろうさんは とても ものしりなの。 まおうの ことも しっている はずよ。');
    return say('えんちょう せんせい', 'いよいよ まおうの しろね…。 ふーたん、 リッキー、 ポチ。 みんなで ちからを あわせてね！');
  } });
  addNPC({ id: 'mama', look: LOOK.mama, x: V.x - 6, z: V.z + 12, h: Math.PI * 0.9, wander: 1.5, talk: async () => {
    if (F().sunback) { await say('ママ', 'おかえり、 ちいさな ゆうしゃさん。 きょうは ごちそうよ！'); }
    else await say('ママ', 'ふーたん、 むりは しないでね。 ちょっと こっちに おいで…');
    GAME.fullHeal(); AU.heal(); fxHeal(FIELD.P.model.position.clone());
    await nar('ママに ぎゅーっと してもらった！ みんなの HPと MPが ぜんぶ かいふくした！');
  } });
  addNPC({ id: 'granny', look: LOOK.granny, x: V.x - 12, z: V.z - 6, h: 0.5, wander: 2.5, talk: () => F().sunback ? say('おばあさん', 'おひさまって あったかいねえ。 せんたくものが よく かわくよ。') : say('おばあさん', 'きたの そらが まっくらでねえ。 せんたくものが ちっとも かわかないんだよ…') });
  addNPC({ id: 'yukun', look: LOOK.kidboy, x: V.x + 6, z: V.z - 10, h: 2, wander: 4, talk: () => F().sunback ? say('ゆうくん', 'ふーたん すごーい！ ほんものの ゆうしゃだ！ こんど ぼくも ぼうけんに つれてって！') : say('ゆうくん', 'ふーたん、 ゆうしゃ なの？ すごーい！\n\nしってる？ たたかいで 「おまかせ」を えらぶと、 みんなが かってに がんばって くれるんだよ！') });
  addNPC({ id: 'mika', look: LOOK.kidgirl, x: V.x + 3, z: V.z + 9, h: 3, wander: 3, talk: () => say('みかちゃん', F().sunback ? 'また いっしょに すべりだい しようね！' : 'まものと たたかうと 「けいけんち」が たまって レベルが あがるんだって。 レベルが あがると つよく なるよ！') });
  addNPC({ id: 'oji', look: LOOK.man, x: V.x + 4, z: V.z - 37, h: 0, talk: () => F().bridge ? say('おじさん', 'はしが なおったんだって？ さすが ゆうしゃさまだ！') : say('おじさん', 'このさきの きたの はしは、 まものに こわされて わたれないんだ。 なにか なおす ほうほうが あれば いいんだが…') });
  addNPC({ id: 'guard', look: LOOK.guard, x: V.x + 22, z: V.z - 16, h: 2.2, talk: () => F().bear ? say('へいたいさん', 'あの ねぼすけベアを おとなしく させたのか！ たいした ものだ！') : say('へいたいさん', 'ひがしの どうくつには ねぼすけな おおきな くまが すんでいるらしい。\n\nレベル 5くらいに なってから いくと あんしんだぞ。 ぶきや ぼうぐも わすれずにな！') });
  addNPC({ id: 'trader', look: LOOK.traveler, x: V.x - 5, z: V.z - 14, h: 1, wander: 2, talk: () => say('たびの しょうにん', '「おうちに かえる ふうせん」を つかうと、 どこからでも ひかりむらに かえれるのさ。 どうぐやで うってるよ。\n\nそれと メニューの 「きろく」で、 いつでも ぼうけんを セーブ できるぞ。') });
  addNPC({ id: 'inn1', look: LOOK.inn, x: SPOT.inn1.x, z: SPOT.inn1.z, h: SPOT.inn1.h, talk: () => GAME.inn(3, 'village') });
  addNPC({ id: 'shop_w1', look: LOOK.smith, x: SPOT.weapon1.x, z: SPOT.weapon1.z, h: SPOT.weapon1.h + Math.PI, talkR: 3.4, talk: () => GAME.shop('weapon1') });
  addNPC({ id: 'shop_i1', look: LOOK.shopgirl, x: SPOT.item1.x, z: SPOT.item1.z, h: SPOT.item1.h + Math.PI, talkR: 3.4, talk: () => GAME.shop('item1') });
  addNPC({ id: 'worker', look: LOOK.worker, x: 5, z: BRIDGE.z1 + 4, h: Math.PI, cond: () => !F().sunback || true, talk: () => F().bridge ? say('だいくさん', 'つみきの はし、 かわいくて じょうぶで さいこうだね！') : say('だいくさん', 'まものに はしを こわされちゃってね…。 ふつうの どうぐじゃ なおせないんだ。 まほうの ちからでも あれば なあ…') });
  // ---------------- forest town
  addNPC({ id: 'elder', look: LOOK.elder, x: SPOT.elder.x, z: SPOT.elder.z, h: Math.PI, talk: async () => {
    const f = F();
    if (f.sunback) return say('ちょうろう', 'ほっほっほ。 まおうも いまごろ ぐっすり ねむって おるじゃろう。 よるは ねむる じかん、 ひるは あそぶ じかん じゃ。');
    if (f.bell) return say('ちょうろう', 'ひかりの すずを てにいれたか！ まおうの しろの まえで すずを ならせば、 やみの かべは きえるはずじゃ。');
    f.elder = 1; GAME.persist(); GAME.refreshHUD();
    await say('ちょうろう', 'おお…！ その ちいさな つるぎ…。 そなたが ひかりむらの ゆうしゃか。');
    await say('ちょうろう', 'よふかし まおうの しろは、 「やみの かべ」に まもられて おる。 ふつうでは ちかづく ことも できん。\n\nかべを けすには、 ひがしの みずうみの ほこらに ねむる 「ひかりの すず」が ひつようじゃ。');
    await say('ちょうろう', 'ほこらの おくには、 まおうの けらい 「かげナイト」が いるという。 じゅうぶんに じゅんびを してから いくのじゃぞ。');
  } });
  addNPC({ id: 'pochi', look: 'dog', x: SPOT.pochi.x, z: SPOT.pochi.z, h: 0, cond: () => !F().pochi, talk: async (n) => {
    AU.bark();
    await say('ポチ', 'わん！ わんわん！');
    if (!F().bear) { await nar('いぬは しっぽを ふっている。 でも なんだか だれかを まっているみたい…'); return; }
    await nar('ポチは ふーたんの おもちゃの つるぎを じっと みつめている…');
    await say('ポチ', 'わおーん！');
    GAME.join('pochi'); n.model.visible = false;
    await AU.jingle('join');
    await nar('いぬの ポチが なかまに くわわった！');
    await say('かいぬしの おにいさん', 'ポチは むかし ゆうしゃと たびを した いぬの まごなんだ。 ずっと ゆうしゃを まっていたんだね。 ポチを よろしく たのむよ！');
  } });
  addNPC({ id: 'pochiowner', look: LOOK.man, x: SPOT.pochi.x + 2.5, z: SPOT.pochi.z + 1.5, h: -1, talk: () => F().pochi ? say('かいぬしの おにいさん', 'ポチは げんきに しているかい？ ポチの 「とおぼえ」は まものを びっくり させるんだ。') : say('かいぬしの おにいさん', 'その いぬは ポチ。 むかし ゆうしゃと たびを した いぬの まごなんだって。 ゆうしゃが くるのを ずっと まっているんだよ。') });
  addNPC({ id: 'fwoman', look: LOOK.mama, x: Fo.x + 8, z: Fo.z - 12, h: 0, wander: 3, talk: () => say('まちの おねえさん', F().sunback ? 'もりに ひかりが もどって、 ことりたちが うたってるわ！' : 'よるが ちかづいて きて、 もりの ふくろうたちが ずっと さわいでいるの…') });
  addNPC({ id: 'fboy', look: LOOK.kidboy, x: Fo.x - 10, z: Fo.z - 6, h: 1, wander: 3, talk: () => say('ポプラの こども', 'みずうみの ほこらには たからばこが あるらしいよ。 「ゆうしゃの つるぎ」って きいたこと ある？') });
  addNPC({ id: 'fgirl', look: LOOK.kidgirl, x: Fo.x + 12, z: Fo.z + 10, h: 3, wander: 2, talk: () => say('ポプラの おんなのこ', F().sunback ? 'まおうさんと こんど いっしょに あそぶんだ！ ひるまにね！' : 'まおうって ほんとうは さびしがりや なんじゃないかな。 ひとりで よふかし してても つまらないもん。') });
  addNPC({ id: 'fman', look: LOOK.traveler, x: Fo.x + 27, z: Fo.z + 9, h: 1.6, talk: () => say('たびびと', 'まおうの しろの まわりは ずっと よる。 まものも つよいぞ。 「あめだま」を たくさん もっていくと いい。') });
  addNPC({ id: 'inn2', look: LOOK.inn, x: SPOT.inn2.x, z: SPOT.inn2.z, h: SPOT.inn2.h, talk: () => GAME.inn(6, 'forest') });
  addNPC({ id: 'shop_w2', look: LOOK.smith, x: SPOT.weapon2.x, z: SPOT.weapon2.z, h: SPOT.weapon2.h + Math.PI, talkR: 3.4, talk: () => GAME.shop('weapon2') });
  addNPC({ id: 'shop_i2', look: LOOK.shopgirl, x: SPOT.item2.x, z: SPOT.item2.z, h: SPOT.item2.h + Math.PI, talkR: 3.4, talk: () => GAME.shop('item2') });
  // ---------------- interactables
  addAct({ x: SPOT.cave.x, z: SPOT.cave.z, r: 2.6, label: 'はいる', fn: () => enterDungeon('cave') });
  addAct({ x: SPOT.shrine.x, z: SPOT.shrine.z - 2.2, r: 2.2, label: 'はいる', fn: () => enterDungeon('shrine') });
  addAct({ x: SPOT.castle.x, z: SPOT.castle.z, r: 3, label: 'はいる', cond: () => !BARRIER.on, fn: () => enterDungeon('castle') });
  addAct({ x: 0, z: PL.bridge.z + 5.5, r: 3.2, label: 'しらべる', cond: () => !BRIDGE.fixed, fn: bridgeEvent });
  // dungeon exits + chests
  for (const id in DUNG) {
    const d = DUNG[id];
    addAct({ area: id, x: d.start.x, z: d.start.z, r: 2.2, label: 'そとへ', fn: async () => { if (await UI.yesno('そとに でますか？')) { UI.hideMsg(); await exitDungeon(); } } });
    for (const c of d.chests) addAct({ area: id, x: c.x, z: c.z, r: 1.6, label: 'あける', cond: () => !GAME.save.chests[id + c.key], fn: () => openChest(id, c) });
  }
  // bosses standing in their rooms
  const bear = makeMonster(MONS.bear); const bd = DUNG.cave.boss; bear.position.set(bd.x, 0, bd.z); bear.rotation.y = 0; DUNG.cave.grp.add(bear); BOSSM.bear = bear;
  const rk = partyModel('ricky'); // Ricky hugged by the bear before rescue
  BOSSM.rickyCap = { x: bd.x + 0.3, z: bd.z + 1.1 };
  const kn = makeMonster(MONS.knight); const sd = DUNG.shrine.boss; kn.position.set(sd.x, 0, sd.z); kn.rotation.y = Math.PI; DUNG.shrine.grp.add(kn); BOSSM.knight = kn;
  const ow = makeMonster(MONS.king1); const cd = DUNG.castle.boss; ow.position.set(cd.x, 0, cd.z - 1); ow.rotation.y = 0; DUNG.castle.grp.add(ow); BOSSM.king = ow;
  addTrig({ area: 'cave', x: bd.x, z: bd.z, r: 6.5, once: 'bear', fn: bearEvent });
  addTrig({ area: 'shrine', x: sd.x, z: sd.z, r: 6, once: 'bell', fn: knightEvent });
  addTrig({ area: 'castle', x: cd.x, z: cd.z, r: 8, once: 'king', fn: kingEvent });
  addAct({ area: 'cave', x: bd.x, z: bd.z, r: 3.5, label: 'はなす', cond: () => F().bear, fn: () => say('ねぼすけベア', 'ぐう… ぐう… むにゃ… もう だきまくらには しないよ…') });
  // barrier
  addTrig({ x: BARRIER.x, z: BARRIER.z, r: BARRIER.r + 8, fn: barrierEvent, repeat: true });
  // place names
  addTrig({ x: PL.village.x, z: PL.village.z, r: PL.village.r + 4, fn: () => { showArea(PL.village.name, PL.village.sub); GAME.save.home = GAME.save.home || 'village'; }, repeat: true, silent: true });
  addTrig({ x: PL.forest.x, z: PL.forest.z, r: PL.forest.r + 4, fn: () => { showArea(PL.forest.name, PL.forest.sub); if (!F().forest) { F().forest = 1; GAME.persist(); } }, repeat: true, silent: true });
  addTrig({ x: PL.lake.x, z: PL.lake.z, r: PL.lake.r + 10, fn: () => showArea('かがみの みずうみ', 'MIRROR LAKE'), repeat: true, silent: true });
  addTrig({ x: PL.castle.x, z: PL.castle.z, r: 70, fn: () => showArea('よるの だいち', 'LAND OF NIGHT'), repeat: true, silent: true });
}
const BOSSM = {};
async function openChest(id, c) {
  const m = c.model; AU.chest();
  for (let i = 0; i <= 10; i++) { m.userData.lid.rotation.x = -i / 10 * 1.9; await sleep(25); }
  GAME.save.chests[id + c.key] = 1;
  const [it, n] = c.item;
  fxBurst(m.position.clone().add(new V3(0, 0.6, 0)), 0xffe08a, 20, 2, 0.25, 0.8);
  await nar('ふーたんは たからばこを あけた！');
  if (it === 'gold') { GAME.gold += n; AU.jingle('item'); await nar(`なかには ${n}ゴールドが はいっていた！`); }
  else if (EQUIP[it]) { GAME.ebag.push(it); AU.jingle('item'); await nar(`なんと！ ${EQUIP[it].name}を みつけた！`); await GAME.offerEquip(it); }
  else { GAME.addItem(it, n); AU.jingle('item'); await nar(`${ITEMS[it].name}を ${n > 1 ? n + 'こ ' : ''}てにいれた！`); }
  GAME.persist();
}
// ---------------------------------------------------------------- cutscene camera helper
function camTo(pos, look, dur) {
  return new Promise(res => {
    const p0 = camera.position.clone(), l0 = CAM.look ? CAM.look.clone() : FIELD.P.model.position.clone().add(new V3(0, 1, 0)), t0 = performance.now();
    CAM.override = () => {
      const k = smooth(Math.min(1, (performance.now() - t0) / (dur * 1000)));
      camera.position.lerpVectors(p0, pos, k); CAM.look = l0.clone().lerp(look, k); camera.lookAt(CAM.look);
      CAM.x = camera.position.x; CAM.y = camera.position.y; CAM.z = camera.position.z;
      if (k >= 1 && !CAM._done) { CAM._done = true; res(); }
    };
    CAM._done = false;
  });
}
function camRelease() { CAM.override = null; CAM.look = null; }
// ---------------------------------------------------------------- opening
async function openingScene() {
  GAME.mode = 'event';
  const k = SPOT.kinder;
  FIELD.P.x = k.x; FIELD.P.z = k.z - 2.4; FIELD.P.h = 0; FIELD.P.model.position.set(FIELD.P.x, groundY(FIELD.P.x, FIELD.P.z), FIELD.P.z); FIELD.P.model.rotation.y = 0;
  // sky shot of the dark north
  camera.position.set(0, 30, 140); CAM.look = new V3(0, 20, -220); camera.lookAt(CAM.look);
  CAM.override = () => { camera.lookAt(CAM.look); };
  AU.play('title');
  await fadeIn(1200);
  await nar('ここは ひかりむら。 いつも おひさまが にこにこ わらっている、 ちいさな むら。');
  await camTo(new V3(10, 40, 40), new V3(0, 30, -240), 4);
  await nar('ところが ある ひ…。 きたの おしろに すむ 「よふかし まおう」が、 おひさまを とじこめて しまった！');
  await say('よふかし まおう', 'ほーっほっほ！ よるは たのしいぞ！ ずーっと よるに して、 みんなで よふかし するのだー！');
  await nar('きたの そらは まっくら。 よるは だんだん みなみへ ひろがって きている…');
  await camTo(new V3(k.x + 4, groundY(k.x, k.z) + 2.6, k.z - 9), new V3(k.x, groundY(k.x, k.z) + 1.0, k.z - 1), 3);
  AU.play('village');
  await say('えんちょう せんせい', 'ふーたん！ たいへんなの。 よふかし まおうの せいで、 このままじゃ せかいじゅうが ずっと よるに なっちゃう…！');
  await say('えんちょう せんせい', 'それにね、 おとうとの リッキーが ひがしの 「どんぐりの どうくつ」に まよいこんで しまった みたいなの。');
  await say('えんちょう せんせい', 'ふーたん、 あなたは ようちえんで いちばん げんきで やさしい こ。\n\nどうか リッキーを たすけて、 おひさまを とりもどして きて！');
  await say('えんちょう せんせい', 'これは ようちえんに つたわる 「おもちゃの つるぎ」。 それと おこづかいの 50ゴールドよ。');
  AU.jingle('item'); setAct(FIELD.P.model, 'cheer');
  await nar('ふーたんは おもちゃの つるぎを てにいれた！');
  await say('えんちょう せんせい', 'むらの ぶきやと どうぐやで じゅんびを してから でかけてね。 つかれたら やどやで おひるねすると げんきに なるわ。 ママに あいに いっても いいのよ。');
  await say('えんちょう せんせい', 'まものに あったら 「たたかう」か 「おまかせ」を えらんでね。 あぶない ときは 「にげる」も できるわ。\n\nいってらっしゃい、 ちいさな ゆうしゃさん！');
  UI.hideMsg();
  F().intro = 1;
  camRelease(); CAM.yaw = Math.PI; GAME.mode = 'field';
  GAME.musicForPlace(true); GAME.persist(); GAME.refreshHUD();
  GAME.tip('ひだりの まるで いどう、 みぎを ドラッグで カメラ。 ひとに ちかづいて 「はなす」を おしてね。', 'やじるしキー/WASDで いどう、 Enter/Spaceで はなす、 Escで メニュー');
}
// ---------------------------------------------------------------- bear
async function bearEvent() {
  GAME.mode = 'event'; FIELD.frozen = true;
  const b = BOSSM.bear, rk = partyModel('ricky');
  rk.visible = true; rk.position.set(b.position.x + 0.2, 0.9, b.position.z + 0.95); rk.rotation.y = 0; setAct(rk, 'sleep');
  await camTo(new V3(b.position.x + 4, 3, b.position.z + 7), b.position.clone().add(new V3(0, 1.4, 0)), 1.5);
  await nar('おおきな くまが リッキーを だきまくらに して ぐうぐう ねている！');
  setAct(rk, 'cheer');
  await say('リッキー', 'ねえね〜！ たすけて〜！ くまさん、 はなして くれないの〜！');
  AU.roar(); CAM.shake = 0.6;
  await say('ねぼすけベア', 'むにゃ…。 だれだ… おれの おひるねを じゃまする やつは…。 がおーっ！');
  UI.hideMsg(); camRelease();
  rk.visible = false; b.visible = false;
  const r = await startBattle({ ids: ['bear'], boss: true, noRun: true });
  if (r === 'lose') return GAME.defeated();
  await endBattleScene();
  b.visible = true; setAct(rk, null);
  rk.visible = true; rk.position.set(b.position.x - 1.2, 0, b.position.z + 2.2); rk.rotation.y = Math.PI;
  await fadeIn(300);
  await camTo(new V3(b.position.x + 3.5, 2.6, b.position.z + 7), b.position.clone().add(new V3(-0.5, 1.1, 1)), 1.2);
  await say('ねぼすけベア', 'いてて…。 ごめんよ。 どうくつの なかは くらくて さびしくて、 つい だきまくらに しちゃったんだ。');
  await say('ねぼすけベア', 'おわびに これを あげる。 「まほうの つみき」だよ。 こわれた ものを なおせる ふしぎな つみきなんだ。');
  GAME.addItem('tsumiki', 1); await AU.jingle('key');
  await nar('ふーたんは まほうの つみきを てにいれた！');
  await say('リッキー', 'ねえね、 ありがとう！ ぼくも いっしょに いく！ ぼく、 まほうが つかえるんだよ！ ぽかぽか〜って！');
  GAME.join('ricky'); await AU.jingle('join');
  await nar('おとうとの リッキーが なかまに くわわった！');
  await say('ねぼすけベア', 'ふわぁ〜…。 じゃあ おれは もう ひとねむり…。 ぐう…');
  F().bear = 1; UI.hideMsg(); camRelease();
  syncFollowers(true); FIELD.frozen = false; GAME.mode = 'field';
  AU.play('dungeon'); GAME.persist(); GAME.refreshHUD();
}
// ---------------------------------------------------------------- bridge
async function bridgeEvent() {
  if (!GAME.bag.tsumiki) { await nar('はしの まんなかが こわれていて わたれない…。\n\nなにか なおす ほうほうは ないかな？'); return; }
  if (!await UI.yesno('はしが こわれている。 まほうの つみきを つかいますか？')) return;
  UI.hideMsg(); GAME.mode = 'event';
  await camTo(new V3(14, 9, PL.bridge.z + 14), new V3(0, 1.5, PL.bridge.z), 1.5);
  AU.magic(); setAct(FIELD.P.model, 'cast');
  // toy blocks fly into place
  const cols = [0xe84a3a, 0x3a8fe8, 0xf8c81c, 0x4ab84a, 0xa84ae8];
  const blocks = [];
  for (let i = 0; i < 24; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: cols[i % 5], roughness: 0.4 }));
    m.position.copy(FIELD.P.model.position).add(new V3(0, 1, 0)); m.castShadow = true; scene.add(m);
    blocks.push({ m, to: new V3((i % 6 - 2.5) * 0.8, bridgeDeckY(PL.bridge.z) - 0.4, PL.bridge.z - 2.6 + Math.floor(i / 6) * 1.6) });
  }
  const t0 = performance.now();
  while (true) {
    const k = (performance.now() - t0) / 1600; if (k > 1.2) break;
    blocks.forEach((b, i) => { const kk = clamp(k * 1.2 - i * 0.015, 0, 1); const from = FIELD.P.model.position.clone().add(new V3(0, 1, 0)); b.m.position.lerpVectors(from, b.to, smooth(kk)); b.m.position.y += Math.sin(kk * Math.PI) * 4; b.m.rotation.set(kk * 6, kk * 4, 0); });
    await sleep(16);
  }
  screenFlash('#fff', 0.8, 600); AU.bell();
  for (const b of blocks) { scene.remove(b.m); }
  fixBridge(false); BRIDGE.mesh.material.color.set(0xffffff);
  GAME.removeItem('tsumiki');
  await AU.jingle('key');
  await nar('つみきが ぴったり はまって、 はしが なおった！');
  F().bridge = 1; UI.hideMsg(); camRelease(); GAME.mode = 'field'; GAME.persist(); GAME.refreshHUD();
}
// ---------------------------------------------------------------- knight
async function knightEvent() {
  GAME.mode = 'event'; FIELD.frozen = true;
  const k = BOSSM.knight;
  await camTo(new V3(k.position.x - 3, 3, k.position.z - 6), k.position.clone().add(new V3(0, 1.6, 0)), 1.5);
  AU.roar();
  await nar('くらやみの なかから かげナイトが あらわれた！');
  await say('かげナイト', 'ちいさき ゆうしゃよ。 ここに ある 「ひかりの すず」は わたさぬ。\n\nまおうさまの よふかしを じゃまする ものは、 この つるぎで おいかえす！');
  UI.hideMsg(); camRelease(); k.visible = false;
  const r = await startBattle({ ids: ['knight'], boss: true, noRun: true });
  if (r === 'lose') { k.visible = true; return GAME.defeated(); }
  await endBattleScene(); k.visible = true;
  await fadeIn(300);
  await say('かげナイト', '…みごとだ。 その すずを もっていくが よい。\n\nまおうさまは…ほんとうは ずっと ひとりぼっちで…。 たのむ、 ゆうしゃよ…');
  for (let i = 0; i < 30; i++) { k.scale.multiplyScalar(0.95); fxBurst(k.position.clone().add(new V3(0, 1, 0)), 0x6a3a9a, 3, 2, 0.3, 0.6); await sleep(30); }
  k.visible = false;
  await nar('かげナイトは かげに とけて きえていった…');
  GAME.addItem('bell', 1); AU.bell(); await AU.jingle('key');
  await nar('ふーたんは ひかりの すずを てにいれた！ りん…と きれいな おとが する。');
  F().bell = 1; UI.hideMsg(); FIELD.frozen = false; GAME.mode = 'field'; AU.play('dungeon'); GAME.persist(); GAME.refreshHUD();
}
// ---------------------------------------------------------------- barrier
let barrierCool = 0;
async function barrierEvent() {
  if (!BARRIER.on || performance.now() < barrierCool) return;
  barrierCool = performance.now() + 6000;
  if (!GAME.bag.bell) { await nar('むらさきいろの 「やみの かべ」が あって、 さきへ すすめない…。\n\nもりの まちの ちょうろうなら なにか しっているかも しれない。'); UI.hideMsg(); return; }
  if (!await UI.yesno('やみの かべが ある。 ひかりの すずを ならしますか？')) { UI.hideMsg(); return; }
  UI.hideMsg(); GAME.mode = 'event'; FIELD.frozen = true;
  await camTo(new V3(FIELD.P.x + 6, FIELD.P.y + 6, FIELD.P.z + 12), new V3(BARRIER.x, 14, BARRIER.z), 1.5);
  setAct(FIELD.P.model, 'cast');
  for (let i = 0; i < 3; i++) { AU.bell(); fxBurst(FIELD.P.model.position.clone().add(new V3(0, 1.4, 0)), 0xfff6c0, 30, 4, 0.3, 1.2); await sleep(700); }
  screenFlash('#fff', 0.9, 1200);
  const t0 = performance.now();
  while (true) { const k = (performance.now() - t0) / 2000; if (k > 1) break; BU.uFade.value = 1 - k; barrier.scale.setScalar(1 + k * 0.1); await sleep(16); }
  barrier.visible = false; BARRIER.on = false; F().barrier = 1;
  await AU.jingle('key');
  await nar('すずの ひかりで やみの かべが きえた！ まおうの しろへ すすめる！');
  UI.hideMsg(); camRelease(); FIELD.frozen = false; GAME.mode = 'field'; GAME.persist(); GAME.refreshHUD();
}
// ---------------------------------------------------------------- final boss
async function kingEvent() {
  GAME.mode = 'event'; FIELD.frozen = true;
  const k = BOSSM.king;
  await camTo(new V3(k.position.x + 3, 3.4, k.position.z + 8), k.position.clone().add(new V3(0, 2.4, 0)), 2);
  AU.play('night');
  await say('よふかし まおう', 'ほーっほっほ！ よくぞ きた、 ちいさな ゆうしゃよ。\n\nよるは たのしいぞ。 ずーっと おきていられる。 おまえたちも よふかし するのだ！');
  await say('ふーたん', 'だめだよ！ よるは ねる じかん！ おひさまを みんなに かえして！');
  await say('リッキー', 'そうだ そうだー！');
  AU.bark(); await say('ポチ', 'わんわん！');
  await say('よふかし まおう', 'ならば ちからずくで ねむらせて…いや、 おこして… ええい！ いくぞ！');
  UI.hideMsg(); camRelease(); k.visible = false;
  const r = await startBattle({
    ids: ['king1'], boss: true, noRun: true, arena: 'throne', music: 'boss',
    next: async () => {
      // second form
      const e0 = BT.en[0];
      await UI.msg('よふかし まおう「ぐぬぬ…。 こうなったら ほんとうの すがたを みせてやる！」', { append: true, voice: true });
      AU.roar(); screenFlash('#a040ff', 0.9, 1200); CAM.shake = 1.2;
      scene.remove(e0.model);
      const d = MONS.king2, m = makeMonster(d); scene.add(m);
      const e = { id: 'king2', def: d, name: d.name, hp: d.hp, maxhp: d.hp, atk: d.atk, df: d.def, agi: d.agi, model: m, sleep: 0, atkMul: 1, defMul: 1 };
      BT.en = [e]; placeBattle();
      for (let i = 0; i < 40; i++) fxDark(m.position.clone().add(new V3(0, 2, 0)));
      await sleep(900);
      await UI.msg('やみの まおう ヨフカシが すがたを あらわした！', { append: true, voice: true });
      AU.heal();
      for (const p of GAME.party) { const s = pStats(p); if (p.hp <= 0) setAct(partyModel(p.id), null); p.hp = s.maxhp; p.mp = s.maxmp; p.sleep = 0; fxHeal(partyModel(p.id).position.clone()); }
      drawBParty();
      await UI.msg('そのとき、 ふーたんの つるぎが ぴかっと ひかった！ みんなの HPと MPが ぜんぶ かいふくした！', { append: true, voice: true });
    }
  });
  if (r === 'lose') { k.visible = true; return GAME.defeated(); }
  await endingScene();
}
// ---------------------------------------------------------------- ending
async function endingScene() {
  const e = BT.en[0];
  AU.stop(1.5);
  // the dragon shrinks back into a small sleepy owl
  const owl = makeMonster(MONS.king1); owl.position.copy(e.model.position); scene.add(owl); owl.scale.setScalar(0.01);
  for (let i = 0; i < 60; i++) { e.model.scale.multiplyScalar(0.94); owl.scale.setScalar(Math.min(0.55, i / 60 * 0.55)); if (i % 4 === 0) fxBurst(e.model.position.clone().add(new V3(0, 2, 0)), 0xfff6c0, 6, 3, 0.3, 0.8); await sleep(30); }
  scene.remove(e.model); e.model = owl; BT.focus = e;
  await UI.msg('まおうは しゅるしゅると ちいさく なって いく…', { append: true, voice: true });
  UI.hideMsg();
  await say('よふかし まおう', 'うう…。 ほんとうは…ずっと ひとりで よるに おきていて、 さびしかったのだ…。\n\nみんなと あそびたかった だけ なのだ…。');
  await say('ふーたん', 'じゃあ あした、 おひさまの したで いっしょに あそぼう！ だから こんやは ちゃんと ねようね。');
  await say('リッキー', 'おにごっこ しよう！');
  AU.bark(); await say('ポチ', 'わん！');
  await say('よふかし まおう', '…うむ。 やくそく なのだ。 おひさまは かえす。 …ふわぁ〜。 おやすみ なさい…');
  fxSleep(owl.position.clone().add(new V3(0, 1.2, 0)));
  UI.hideMsg();
  await fadeOut(1500);
  // back outside: the sun returns
  await endBattleScene();
  scene.remove(owl);
  F().king = 1; F().sunback = 1;
  setArea('world');
  initPlayer(SPOT.castle.x, SPOT.castle.z + 8, 0);
  GAME.mode = 'event';
  const c = PL.castle;
  camera.position.set(c.x + 20, c.h + 8, c.z + 50); CAM.look = new V3(c.x, c.h + 20, c.z - 10); camera.lookAt(CAM.look);
  CAM.override = () => camera.lookAt(CAM.look);
  setAtmos(0.97, true);
  await fadeIn(1500);
  await nar('そのとき…');
  AU.play('ending');
  const t0 = performance.now();
  await new Promise(res => { const step = () => { const k = Math.min(1, (performance.now() - t0) / 6000); setAtmos(0.97 * (1 - smooth(k)), true); CAM.look.y = c.h + 20 + k * 30; if (k < 1) requestAnimationFrame(step); else res(); }; step(); });
  screenFlash('#fff8d0', 0.7, 1500);
  await nar('とじこめられて いた おひさまが、 そらに もどって きた！');
  await nar('せかいに あさが きた。 ひかりむらにも、 もりの まちにも、 あたたかい ひかりが ふりそそぐ。');
  UI.hideMsg();
  await creditsRoll();
  GAME.save.clear = 1;
  await fadeOut(1000);
  // return to the village, celebrating
  initPlayer(SPOT.start.x, SPOT.start.z - 6, Math.PI);
  camRelease(); CAM.yaw = 0;
  GAME.mode = 'field'; GAME.fullHeal();
  GAME.musicForPlace(true); GAME.persist(); GAME.refreshHUD();
  await fadeIn(1000);
  await nar('ふーたんたちは ひかりむらに かえってきた。 むらの みんなが まっている！\n\nおしまい。 …でも ぼうけんは まだまだ つづけられるよ！');
  UI.hideMsg();
}
async function creditsRoll() {
  const el = $('#ending'), roll = el.querySelector('.roll');
  roll.innerHTML = `<h2>ふーたん クエスト</h2><small>〜 ねむれる おひさまと よふかし まおう 〜</small><br><br>
  ゆうしゃ<br>ふーたん<br><br>まほうつかい<br>リッキー<br><br>いぬの せんし<br>ポチ<br><br>
  えんちょう せんせい<br>ママ<br>ねぼすけベア<br>かげナイト<br>よふかし まおう<br><br>
  ひかりむらの みんな<br>ポプラの みんな<br><br><h2>そして</h2>あそんで くれた きみ<br><br><br><h2>THE END</h2><small>おひさまの したで また あそぼうね</small>`;
  el.classList.remove('hide'); el.style.opacity = '1'; $('#hud').classList.add('hide'); $('#touch').classList.add('hide');
  const H = roll.offsetHeight, t0 = performance.now(), dur = 38000;
  const c = PL.village;
  CAM.override = () => {
    const k = (performance.now() - t0) / dur;
    const a = k * Math.PI * 1.6 + 1.2, r = 160 - k * 90;
    camera.position.set(Math.sin(a) * r, 40 - k * 20, Math.cos(a) * r - 30);
    camera.lookAt(0, 6, -40 + k * 120);
  };
  await new Promise(res => {
    const step = () => { const k = (performance.now() - t0) / dur; roll.style.transform = `translateY(${innerHeight - k * (H + innerHeight)}px)`; if (k < 1) requestAnimationFrame(step); else res(); };
    const skip = () => { if (performance.now() - t0 > 3000) { /* allow skip */ } };
    step();
  });
  el.classList.add('hide'); $('#hud').classList.remove('hide'); if (isTouch) $('#touch').classList.remove('hide');
}
