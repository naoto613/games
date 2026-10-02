// ================================================================ story, events, skits
const say = (w, t, e) => UI.say(w, t, e);
function camTo(pos, look, k = 2.5) { Field.camOv = { pos: new V3(...pos), look: new V3(...look), k }; }
function camFree() { Field.camOv = null; }
function npcWalk(n, x, z, sp = 5) { n.walkTo = [x, z]; n.walkSp = sp; return new Promise(r => { const iv = setInterval(() => { if (!n.walkTo) { clearInterval(iv); r(); } }, 50); }); }
function removeNPC(n) { Field.group.remove(n.m.root); Field.npcs.splice(Field.npcs.indexOf(n), 1); Field.inter = Field.inter.filter(i => i.npc !== n); Field.A.solids = Field.A.solids.filter(s => !(s[0] === n.x && s[1] === n.z)); }
function battle(cfg) { return new Promise(res => Game.startBattle(cfg, res)); }
function joinParty(id) { if (!S.party.includes(id)) { S.party.push(id); const lv = Math.max(1, S.chars.sieg.lv - (id === 'noa' ? 0 : 0)); initChar(id, lv); } }
function fadeOut(ms = 500) { $('#fade').style.transition = `opacity ${ms}ms`; $('#fade').style.opacity = 1; return wait(ms); }
function fadeIn(ms = 500) { $('#fade').style.transition = `opacity ${ms}ms`; $('#fade').style.opacity = 0; return wait(ms); }
function placePlayer(x, z, face) { Field.pos.set(x, Field.A.h(x, z), z); Field.face = face; }

const SKITS = {
  ojousama: { title: 'お嬢様と下町', lines: [
    ['lucia', 'normal', 'あの、ジークさん。下町の方々は皆さん、あのように気さくなんですか？'],
    ['sieg', 'smirk', '気さくっつーか、図太いんだよ。結界の端っこで暮らしてりゃ、自然とそうなる。'],
    ['lucia', 'smile', 'わたし、お城の外のことは本でしか知らなくて……。なんだか、わくわくします。'],
    ['sieg', 'normal', 'わくわく、ね。魔物に追い回されても同じこと言えるか？'],
    ['lucia', 'surprise', 'が、頑張ります！', 'jump'],
  ] },
  outside: { title: '結界の外', lines: [
    ['lucia', 'surprise', 'わあ……！　これが結界の外……。空って、こんなに広かったんですね。'],
    ['sieg', 'normal', '広い分、危ないもんも多い。はぐれんなよ。'],
    ['lucia', 'smile', 'はい！　あ、でも、もしはぐれてしまったら……'],
    ['sieg', 'tired', 'はぐれる前提で話を進めるな。'],
  ] },
  gummy: { title: 'グミの謎', lines: [
    ['lucia', 'normal', 'ジークさん、このグミ……どうして食べると傷が治るんでしょう？'],
    ['sieg', 'normal', 'さあな。うまいし、治る。それで十分だろ。'],
    ['lucia', 'sad', 'でも、気になります……'],
    ['sieg', 'smirk', '世の中にはな、知らなくていいこともあるんだよ。'],
    ['lucia', 'surprise', 'そ、そんなに恐ろしいものなんですか！？', 'shake'],
  ] },
  genius: { title: '天才術士', lines: [
    ['noa', 'angry', '言っとくけど、仲間になったつもりはないから。調査のついでよ、つ・い・で。'],
    ['sieg', 'smirk', 'へいへい。ついでに背中は任せたぜ、天才術士さん。'],
    ['noa', 'surprise', 'ちょっ……勝手に任せないでよ！', 'shake'],
    ['lucia', 'happy', 'ふふっ。ノアさん、お顔が赤いです。'],
    ['noa', 'angry', '赤くない！！', 'shake'],
  ] },
  cooking: { title: '料理当番', lines: [
    ['lucia', 'smile', '今日のお夕飯、わたしが作ってもいいですか？'],
    ['noa', 'surprise', 'お嬢様が料理なんてできるの？'],
    ['lucia', 'happy', '本で読みました！　「マーボーカレー」というお料理を！'],
    ['sieg', 'tired', '……いきなり上級者向けだな。'],
    ['noa', 'normal', 'なにそれ。マーボーなの？　カレーなの？'],
    ['sieg', 'smirk', '両方だよ。……どっかの“ふしぎなシェフ”にでも会えりゃ、教えてもらえるかもな。'],
  ] },
  mystic: { title: '剣に宿る光', lines: [
    ['noa', 'normal', 'ねえジーク。さっきの光……あんた、本当に何も感じなかったの？'],
    ['sieg', 'normal', '熱かったな。……あと、声が聞こえた気がした。'],
    ['noa', 'surprise', '声？'],
    ['sieg', 'smirk', '「まだ終わってない」ってさ。ま、気のせいだろ。'],
    ['lucia', 'sad', '……ジークさん。無茶だけは、しないでくださいね。'],
  ] },
  vesper: { title: '宵の明星', lines: [
    ['lucia', 'normal', '空、暗くなってきましたね。……あ、一番星。'],
    ['noa', 'normal', '宵の明星ね。古代の星詠みたちは、あの星を「道しるべ」って呼んでたらしいわ。'],
    ['sieg', 'normal', '道しるべ、か。……迷ったときは見上げりゃいいってことか。'],
    ['lucia', 'smile', 'ジークさん、意外とロマンチストなんですね。'],
    ['sieg', 'tired', 'うるせえ。'],
  ] },
  knight: { title: '元騎士', lines: [
    ['lucia', 'normal', 'ジークさんは、昔は帝国騎士団にいらしたと聞きました。'],
    ['sieg', 'normal', '……ほんのちょっとな。性に合わなくて辞めた。'],
    ['noa', 'smirk', 'どうせ上官を殴ったとか、そんなとこでしょ。'],
    ['sieg', 'smirk', '……ノーコメントだ。'],
    ['lucia', 'laugh', 'ふふっ。'],
  ] },
};

const STORY = {};
STORY.afterBattle = function () {
  if (S.party.includes('lucia') && !S.skitsSeen.gummy && S.area === 'field') setTimeout(() => offerSkit('gummy'), 600);
};
STORY.setupArea = function (id, F, A) {
  updateGold();
  setObjective(S.objective || '');
  const fl = S.flags;
  const chef = (key, x, z, recipe, label) => { if (S.chefs[key]) return; F.inter.push({ x, z, r: 2.6, label, fn: async () => {
    Audio2.sfx('shatter'); flashScreen(0.5);
    if (A.chefObj) { A.chefObj.visible = false; }
    await say('chef', 'ムムッ！？　ワタシの完璧な変装を見破るとは……アナタ、なかなかやるネ！', 'surprise');
    await say('chef', `褒美に、このレシピを授けるヨ！　――「${RECIPES[recipe].name}」！　アデュー！`, 'laugh');
    S.chefs[key] = 1; S.recipes.push(recipe); Audio2.sfx('levelup'); toast(`レシピ「${RECIPES[recipe].name}」を覚えた！`, 2500);
    F.inter = F.inter.filter(i => i.label !== label);
    if (A.chefObj && A.chefObj.parent) A.chefObj.parent.remove(A.chefObj);
  } }); };
  if (id === 'town') {
    F.exits.push({ x: -37.5, z: 0, r: 3, to: 'field', spawn: [134, 0, -Math.PI / 2], cond: () => fl.lucia || fl.clear, blocked: async () => { await say('sieg', '……おっと。西門の前がなんか騒がしいな。', 'normal'); placePlayer(-31, 0, Math.PI / 2); } });
    // NPCs
    F.addNPC({ kind: 'elder', x: 3, z: 6, face: Math.PI, talk: async () => {
      if (fl.clear) { await say('elder', '水が戻って、下町もすっかり元通りじゃ。……ジーク、お前は下町の誇りじゃよ。', 'happy'); return; }
      if (fl.lucia) { await say('elder', 'そのお嬢さんは……いや、詮索はせんでおこう。気をつけて行くんじゃぞ。', 'normal'); return; }
      await say('elder', '水の星核がなけりゃ、下町は干上がってしまう。頼んだぞ、ジーク。', 'sad');
    } });
    F.addNPC({ kind: 'kid', x: -6, z: -7, face: 0.5, talk: async () => {
      if (fl.clear) { await say('kid', 'ジーク！　おれも大きくなったら、ジークみたいなギルドを作るんだ！', 'laugh'); return; }
      await say('kid', 'フードの男と、赤い目の変な奴らが西門の方に行ったんだ！　ジーク、やっつけてよ！', 'angry');
    } });
    F.addNPC({ kind: 'woman', x: 22, z: 14, face: -Math.PI / 2, label: '宿屋（休む）', talk: async () => {
      await say('woman', fl.clear ? 'おかえり、ジーク！　今夜はお祝いだよ。お代はいらないから、ゆっくり休んでいきな！' : 'いらっしゃい！　ひと晩 20 ルクスだよ。ゆっくり休んでいきな。', 'smile');
      const i = await UI.ask('宿屋', [fl.clear ? '休む（無料）' : '休む（20 LUX）', 'やめる']);
      if (i !== 0) return;
      if (!fl.clear && S.lux < 20) { await say('woman', 'おや、お金が足りないよ。', 'sad'); return; }
      if (!fl.clear) S.lux -= 20; updateGold();
      await fadeOut(600); for (const id of S.party) { const c = S.chars[id]; c.hp = c.mhp; c.tp = c.mtp; } Audio2.sfx('heal'); await wait(500); await fadeIn(600);
      toast('HP と TP が全回復した！');
    } });
    F.addNPC({ kind: 'merchant', x: 14, z: 14.4, face: Math.PI - 0.4, label: '買い物', talk: async () => { await say('merchant', 'へいらっしゃい！　ロッコの道具屋だ。外に出るならグミは多めにな！', 'smile'); await shopMenu(); } });
    F.addNPC({ kind: 'man', x: -14, z: 6, face: 1.2, talk: async () => {
      if (fl.clear) { await say('man', '聞いたぜ、遺跡の化け物を倒したんだって？　さすがは下町の一匹狼だ！', 'normal'); return; }
      await say('man', '最近、帝都のあちこちで星核が盗まれてるらしい。騎士団は貴族街の警備で手一杯だとさ。', 'normal');
    } });
    if (fl.clear) F.addNPC({ kind: 'knight', x: -28, z: -6, face: Math.PI / 2, talk: async () => { await say('knight', '下町の星核の件、騎士団としても礼を言う。……いつか、騎士団に戻る気はないか？', 'normal'); await say('sieg', '悪いが、もうギルドの仲間がいるんでね。', 'smirk'); } });
    F.inter.push({ x: A.save.x, z: 12, r: 2.6, label: 'セーブポイント', fn: () => savePointMenu() });
    F.inter.push({ x: 0, z: 0, r: 5.6, label: '噴水を見る', fn: async () => { if (fl.clear) await say('sieg', '水の星核が戻って、噴水も元通りだ。……やっぱこの音がねえとな。', 'smile'); else await say('sieg', '……台座ごともぎ取られてやがる。乱暴な盗み方しやがって。', 'angry'); } });
    chef('town', 21, -19, 'onigiri', '怪しい樽を調べる');
    // opening event
    if (!fl.intro) F.triggers.push({ x: F.pos.x, z: F.pos.z, r: 99, fn: openingEvent });
    if (fl.intro && !fl.lucia) F.triggers.push({ x: -30, z: 0, r: 7, fn: luciaEvent });
    if (fl.clear && !fl.credits) F.triggers.push({ x: F.pos.x, z: F.pos.z, r: 99, fn: endingTown });
  }
  if (id === 'field') {
    F.exits.push({ x: 143, z: 0, r: 4, to: 'town', spawn: [-33, 0, Math.PI / 2] });
    F.exits.push({ x: -104, z: -116, r: 4, to: 'forest', spawn: [0, 97, Math.PI] });
    F.exits.push({ x: -114, z: 114, r: 4.5, to: 'ruins', spawn: [0, 84, Math.PI], cond: () => fl.sealOpen, blocked: async () => {
      await say('sieg', '……なんだ、この光の壁は。', 'normal');
      if (!fl.sealSeen) {
        fl.sealSeen = 1;
        await say('lucia', '結界……いいえ、封印術です。わたしの力では、とても解けません……', 'sad');
        await say('sieg', '星核に詳しい奴がいりゃあな……。そういや、北西の森に変わり者の術士が籠もってるって噂を聞いたことがある。', 'normal');
        await say('lucia', '行ってみましょう、ジークさん！', 'smile');
        setObjective('北西の<b>翠光の森</b>へ。星核に詳しい術士を探せ');
      }
      placePlayer(-106, 106, -Math.PI / 4 + Math.PI);
    } });
    F.inter.push({ x: 108, z: 10, r: 2.6, label: 'セーブポイント', fn: () => savePointMenu() });
    F.inter.push({ x: 36, z: -4, r: 2.4, label: '立て札を読む', fn: async () => { await say('sys', '北西：翠光の森　／　南西：星詠みの遺跡　／　東：帝都アウレリア', ''); } });
    A.symbolSpots = [[80, -22], [60, 26], [22, -30], [10, 24], [-20, -6], [-30, -48], [-62, -40], [-40, 40], [-72, 66], [-80, -86], [-6, 60], [60, -60], [-90, 20]].map(([x, z], i) => [x, z, GROUPS.field[i % GROUPS.field.length]]);
    if (!S.skitsSeen.outside && fl.lucia) F.triggers.push({ x: 120, z: 0, r: 12, fn: async () => offerSkit('outside') });
    if (fl.noa && !S.skitsSeen.knight) F.triggers.push({ x: -60, z: 70, r: 20, fn: async () => offerSkit('knight') });
    if (fl.lucia && !fl.fieldHint) F.triggers.push({ x: 40, z: 0, r: 10, fn: async () => { fl.fieldHint = 1; await say('lucia', '星詠みの遺跡は、ここから南西の方角です。', 'normal'); await say('sieg', 'よし、道なりに行ってみるか。……途中の魔物には気をつけろよ。', 'normal'); } });
    if (fl.forestDone && !fl.sealOpen) F.triggers.push({ x: F.pos.x, z: F.pos.z, r: 99, fn: unsealEvent });
  }
  if (id === 'forest') {
    F.exits.push({ x: 0, z: 103.5, r: 3, to: 'field', spawn: [-98, -108, Math.PI / 4] });
    F.inter.push({ x: 8, z: -40, r: 2.6, label: 'セーブポイント', fn: () => savePointMenu() });
    A.symbolSpots = [[10, 62], [-10, 32], [-30, 10], [12, -14], [-4, -48], [2, 84]].map(([x, z], i) => [x, z, GROUPS.forest[i % GROUPS.forest.length]]);
    chef('forest', -36, 6, 'stew', 'ゆらゆら揺れるキノコを調べる');
    if (!fl.noa) {
      const noa = F.addNPC({ kind: 'noa', x: -27, z: -2, face: Math.PI });
      F.noaNPC = noa;
      F.triggers.push({ x: -25, z: 5, r: 11, fn: noaEvent });
      setObjective(fl.sealSeen ? '翠光の森で、星核に詳しい術士を探せ' : S.objective);
    }
    if (fl.noa && !fl.forestDone) F.triggers.push({ x: 0, z: -72, r: 8, fn: bearEvent });
    if (fl.noa && !S.skitsSeen.cooking) F.triggers.push({ x: 8, z: -40, r: 6, fn: async () => offerSkit('cooking') });
  }
  if (id === 'ruins') {
    F.exits.push({ x: 0, z: 90.5, r: 3, to: 'field', spawn: [-106, 106, 3 * Math.PI / 4] });
    F.inter.push({ x: 10, z: -6, r: 2.6, label: 'セーブポイント', fn: () => savePointMenu() });
    A.symbolSpots = [[0, 66], [-8, 46], [8, 28], [-4, 10]].map(([x, z], i) => [x, z, GROUPS.ruins[i % GROUPS.ruins.length]]);
    chef('ruins', -19, 52, 'curry', '妙に生々しい石像を調べる');
    if (!S.skitsSeen.vesper) F.triggers.push({ x: 0, z: 78, r: 8, fn: async () => offerSkit('vesper') });
    if (!fl.clear) {
      F.garmoNPC = F.addNPC({ kind: 'garmo', x: 0, z: -52, face: 0 });
      F.triggers.push({ x: 0, z: -34, r: 6, fn: garmoEvent });
    }
  }
};
async function savePointMenu() {
  Audio2.sfx('save');
  for (const id of S.party) { const c = S.chars[id]; c.hp = c.mhp; c.tp = c.mtp; }
  toast('セーブポイントの光で HP・TP が回復した');
  const i = await UI.ask('セーブポイント', ['セーブする', '料理をする', 'やめる']);
  if (i === 0) { S.pos = [Field.pos.x, Field.pos.z, Field.face]; saveGame(); Audio2.sfx('ok'); toast('セーブしました'); }
  if (i === 1) await new Promise(r => cookMenu(r));
}

// ---------------------------------------------------------------- events
async function openingEvent() {
  const F = Field; const fl = S.flags;
  placePlayer(-6, 14, Math.PI);
  camTo([14, 18, 30], [0, 6, -20], 0.8);
  await wait(1800);
  camTo([6, 3.5, 12], [0, 2.5, 0], 1.6);
  await wait(1200);
  const elder = F.npcs.find(n => n.m.kind === 'elder'), kid = F.npcs.find(n => n.m.kind === 'kid');
  kid.x = -3; kid.z = 9; kid.face = Math.PI * 0.8;
  await npcWalk(kid, -5, 11.5, 5);
  kid.face = Math.atan2(F.pos.x - kid.x, F.pos.z - kid.z);
  camTo([-1, 2.6, 17], [-5, 1.5, 12], 3);
  await say('kid', 'ジーク！　大変だよ、大変！　噴水の星核が盗まれちゃったんだ！', 'surprise');
  await say('sieg', '……道理で静かなわけだ。朝から水の音がしねえと思ったら。', 'tired');
  camTo([-2, 3, 18], [1, 1.5, 8], 3);
  await say('elder', '昨夜、フードをかぶった男が噴水の星核をもぎ取っていきおった。あれがなけりゃ、下町は水も汲めん。', 'sad');
  await say('sieg', '騎士団には？', 'normal');
  await say('elder', '届けたとも。……「下町の噴水ごとき、後回しだ」と追い返されたわい。', 'angry');
  await say('sieg', 'ったく、相変わらずだな。……わかった。俺が取り返してくる。', 'smirk');
  await say('kid', '犯人、西門の方へ逃げてったよ！　赤い目をした変な奴らも一緒だった！', 'angry');
  await say('sieg', '赤い目、ね。……ま、行ってみりゃわかるか。', 'normal');
  await say('elder', '待て、ジーク。外は魔物がうろついとる。ロッコの店でグミでも買っていけ。それと、宿で休むのも忘れるでないぞ。', 'normal');
  camFree(); kid.walkTo = [-6, -7];
  fl.intro = 1;
  setObjective('西門から外へ。盗まれた<b>水の星核</b>を追え');
  showTip('FIELD', `移動：<kbd>WASD</kbd>/<kbd>矢印</kbd>　調べる・話す：<kbd>${keyLabel('ok')}</kbd>　メニュー：<kbd>${keyLabel('menu')}</kbd><br>マウスドラッグ（スマホは右側をドラッグ）でカメラを回せる。<br>光る球体は<b>セーブポイント</b>。HP・TP も回復する。`, 8000);
  F.triggers.push({ x: -30, z: 0, r: 7, fn: luciaEvent });
}
async function luciaEvent() {
  const F = Field, fl = S.flags;
  placePlayer(-26, 0, -Math.PI / 2);
  const lucia = F.addNPC({ kind: 'lucia', x: -20, z: -22, face: 0 });
  const a1 = F.addNPC({ kind: 'assassin', x: -22, z: -30, face: 0 }), a2 = F.addNPC({ kind: 'assassin', x: -18, z: -31, face: 0 });
  camTo([-14, 4, 6], [-24, 1.4, -6], 2);
  await say('lucia', 'どなたか……！　道を開けてください！', 'surprise');
  npcWalk(a1, -27, -6, 7); npcWalk(a2, -22, -5, 7);
  await npcWalk(lucia, -28, -2, 7.5);
  lucia.face = Math.atan2(F.pos.x - lucia.x, F.pos.z - lucia.z);
  F.face = Math.atan2(lucia.x - F.pos.x, lucia.z - F.pos.z);
  camTo([-20, 3, 6], [-27, 1.4, -2], 2.5);
  await say('sieg', 'ん？', 'normal');
  await say('assassin', '……標的を確認。邪魔者ごと始末する。', 'angry');
  await say('sieg', 'おいおい、女の子ひとりに物騒なこった。', 'smirk');
  await say('lucia', 'あ、あなたは……？', 'surprise');
  await say('sieg', '通りすがりの、下町の住人だよ。……下がってな。', 'smirk');
  camFree();
  S.flags.tutorial = 1;
  await battle({ enemies: ['assassin', 'assassin'], area: 'town', noEscape: true, tutorial: true });
  removeNPC(a1); removeNPC(a2);
  lucia.face = Math.atan2(F.pos.x - lucia.x, F.pos.z - lucia.z);
  camTo([-22, 2.6, 6], [-27, 1.4, -1], 2.5);
  await say('lucia', '助けていただいて、ありがとうございます。わたし、リュシアと申します。', 'smile');
  await say('sieg', 'ジークだ。で、なんで追われてた？', 'normal');
  await say('lucia', '……いま帝都では、星核が次々と盗まれているんです。盗んだ者たちは、南西の{星詠みの遺跡}で何かを企てていると……。', 'sad');
  await say('lucia', 'わたし、それを確かめなくてはいけないんです。', 'normal');
  await say('sieg', '星核泥棒ね。奇遇だな、俺もそいつを追ってる。', 'normal');
  await say('lucia', '本当ですか！？　でしたら、ご一緒させてください！　癒しの術なら、少しは使えます！', 'happy');
  await say('sieg', '……外は遊びじゃねえぞ。', 'tired');
  await say('lucia', '承知の上です。', 'normal');
  await say('sieg', 'ったく。好きにしな。', 'smirk');
  removeNPC(lucia); camFree();
  joinParty('lucia'); fl.lucia = 1;
  Audio2.sfx('levelup'); toast('<b style="color:#ffd88a">リュシア</b>が仲間になった！', 2600);
  setObjective('西門を出て<b>ルクス平原</b>へ。南西の<b>星詠みの遺跡</b>を目指せ');
  setTimeout(() => offerSkit('ojousama'), 2600);
}
async function noaEvent() {
  const F = Field, fl = S.flags, noa = F.noaNPC;
  camTo([-14, 4, 16], [-26, 1.5, 0], 2);
  noa.m.play(CLIPS.cast);
  await wait(400);
  await say('noa', 'ああもう、しつこい！　──燃えちゃえっ！', 'angry');
  noa.m.play(CLIPS.release); Audio2.sfx('fire'); flashScreen(0.4, '#ffb070');
  await wait(500);
  await say('sieg', 'おーおー、派手にやってんな。', 'smirk');
  noa.face = Math.atan2(F.pos.x - noa.x, F.pos.z - noa.z);
  await say('noa', '誰よあんたたち！　邪魔するなら、まとめて吹き飛ばすわよ！', 'angry');
  await say('lucia', '危ない、後ろです！　魔物が……！', 'surprise');
  await say('sieg', 'ちっ、話はあとだ。手ぇ貸すぜ！', 'angry');
  camFree();
  joinParty('noa');
  await battle({ enemies: ['bloom2', 'wolf2', 'bloom2'], area: 'forest', noEscape: true });
  removeNPC(noa);
  const n2 = F.addNPC({ kind: 'noa', x: -27, z: -2, face: Math.atan2(F.pos.x + 27, F.pos.z + 2) });
  camTo([-18, 3, 10], [-26, 1.4, 0], 2.5);
  await say('noa', '……ふん。助けてなんて頼んでないけど。……一応、お礼は言っとく。', 'tired');
  await say('sieg', '素直じゃねえな。俺はジーク。こっちはリュシア。星核泥棒を追ってる。', 'smirk');
  await say('noa', '泥棒！？　……あたしはノア。星核の研究者よ。この森の星核が暴走してるから調べに来たの。', 'surprise');
  await say('noa', '誰かが無理やり星核を抜き取ったせいで、残った力が暴れて、森の魔物が凶暴になってる。', 'normal');
  await say('lucia', 'では、犯人はこの森にも……。あの、ノアさん。遺跡に張られた封印のことは、何かご存じですか？', 'normal');
  await say('noa', '星詠みの遺跡の封印？　あんなの、あたしなら三秒で解けるわ。', 'smirk');
  await say('noa', '……ただし条件がある。森の奥で暴れてる{森の主}をなんとかしないと、星核の流れが乱れて術式が組めないの。', 'normal');
  await say('sieg', '要は、そいつをぶっ飛ばせばいいんだな。', 'smirk');
  await say('noa', '……単純ね、あんた。', 'tired');
  removeNPC(n2); camFree();
  fl.noa = 1;
  Audio2.sfx('levelup'); toast('<b style="color:#ffd88a">ノア</b>が仲間になった！', 2600);
  setObjective('森の奥で暴れる<b>森の主</b>を鎮めろ');
  setTimeout(() => offerSkit('genius'), 2600);
  F.triggers.push({ x: 0, z: -72, r: 8, fn: bearEvent });
}
async function bearEvent() {
  const F = Field, fl = S.flags;
  const bear = F.addNPC({ kind: 'bear', x: 0, z: -96, face: 0 });
  camTo([10, 5, -66], [0, 3, -90], 2);
  Audio2.sfx('roar'); Field.shakeT = 1;
  await wait(900);
  await say('noa', '来るわよ！　星核の暴走で、体がおかしくなってる……！', 'surprise');
  await say('lucia', '苦しんでいるみたい……。', 'sad');
  await say('sieg', 'なら、さっさと楽にしてやるさ。……行くぞ！', 'angry');
  camFree();
  await battle({ enemies: ['bear'], area: 'forest', boss: true });
  removeNPC(bear);
  camTo([6, 3, -70], [0, 1.5, -80], 2.5);
  await say('noa', '……やっぱり。無理やり核を抜かれた痕。残った“滓”が、この子を狂わせてたのね。', 'sad');
  await say('noa', 'これで流れは安定した。遺跡の封印、解きにいくわよ。', 'normal');
  // awakening
  Audio2.sfx('mystic'); flashScreen(0.6, '#c8a8ff');
  const glow = glowSprite(0xb080ff, 4); glow.position.copy(F.pos).setY(F.pos.y + 1.2); F.group.add(glow);
  await wait(1200);
  await say('lucia', 'ジークさん、剣が……光って……！', 'surprise');
  await say('sieg', '……なんだ、こりゃ。体の奥から、力が湧いてくる。', 'surprise');
  await say('noa', '星核の残滓が、あんたの剣に宿った……？　前例がないわ。あとで絶対に調べさせなさいよ！', 'surprise');
  F.group.remove(glow); camFree();
  fl.mystic = 1; fl.forestDone = 1;
  showTip('MYSTIC ARTE 解放', `オーバーリミット中に <kbd>${keyLabel('ol')}</kbd> でバーストアーツを発動し、その間 <kbd>${keyLabel('arte')}</kbd> を<b>押しっぱなし</b>にすると<br>秘奥義「<b>${MYSTIC.name}</b>」が発動！`, 9000);
  offerSkit('mystic');
  setObjective('ルクス平原 南西、<b>星詠みの遺跡</b>の封印を解け');
}
async function unsealEvent() {
  const F = Field, fl = S.flags;
  await wait(400);
  if (Math.hypot(F.pos.x + 114, F.pos.z - 114) > 30) {
    await say('noa', 'さ、遺跡に行くわよ。封印は南西。……のんびりしてると置いてくから。', 'normal');
    F.triggers.push({ x: -112, z: 112, r: 14, fn: doUnseal });
    return;
  }
  await doUnseal();
}
async function doUnseal() {
  const F = Field, fl = S.flags;
  camTo([-100, 6, 100], [-114, 2, 114], 2);
  await say('noa', '術式解析……展開……', 'closed');
  Audio2.sfx('cast'); await wait(800);
  await say('noa', '解除っ！', 'angry');
  Audio2.sfx('shatter'); flashScreen(0.7, '#d8c0ff');
  fl.sealOpen = 1; F.A.seal.visible = false;
  await wait(600);
  await say('lucia', 'すごい……本当に三秒でした！', 'happy');
  await say('noa', 'でしょ？', 'smirk');
  camFree();
  setObjective('<b>星詠みの遺跡</b>へ。星核泥棒を捕まえろ');
}
async function garmoEvent() {
  const F = Field, fl = S.flags, g = F.garmoNPC;
  const s1 = F.addNPC({ kind: 'soldier', x: -4, z: -46, face: 0 }), s2 = F.addNPC({ kind: 'soldier', x: 4, z: -46, face: 0 });
  camTo([10, 9, -28], [0, 6, -50], 2);
  await say('garmo', 'ククク……よくぞここまで来た、下町のネズミども。', 'smirk');
  await say('sieg', 'お前か。下町の噴水から星核を盗んだのは。', 'angry');
  await say('garmo', '噴水？　ああ、あのちっぽけな水の星核か。安心しろ、無駄にはせん。', 'smirk');
  camTo([0, 12, -30], [0, 18, -62], 2);
  await say('garmo', '集めた星核で、この遺跡に眠る{星喰獣}を目覚めさせるのだ！', 'laugh');
  camTo([8, 8, -30], [0, 6, -48], 2.5);
  await say('noa', 'バカじゃないの！？　星核をそんな使い方したら、このあたり一帯の結界ごと吹き飛ぶわよ！', 'angry');
  await say('garmo', 'それこそが望みよ！　結界の中でぬくぬくと生きる帝都の連中に、真の恐怖を教えてやる！', 'angry');
  await say('lucia', 'そんなこと……させません！', 'angry');
  await say('sieg', '同感だ。悪いが、その星核は返してもらうぜ。', 'smirk');
  camFree();
  await battle({ enemies: ['garmo', 'soldier', 'soldier'], area: 'altar', boss: true });
  removeNPC(s1); removeNPC(s2);
  camTo([8, 9, -30], [0, 7, -50], 2.5);
  await say('garmo', 'ぐっ……まだだ……！　目覚めよ、{ノクス・ベヒモス}！　我が星核を、すべて喰らえぇぇ！', 'angry');
  Audio2.sfx('mystic'); flashScreen(0.9, '#b080ff');
  camTo([0, 10, -24], [0, 16, -62], 1.6);
  await wait(900);
  Audio2.sfx('boom'); flashScreen(1, '#fff');
  removeNPC(g);
  const beh = F.addNPC({ kind: 'behemoth', x: 0, z: -58, face: 0 });
  Audio2.sfx('roar');
  await wait(1200);
  camTo([10, 8, -30], [0, 7, -54], 2);
  await say('noa', 'うそ……本当に起動した……！？', 'surprise');
  await say('sieg', 'デカブツのお出ましか。……リュシア、ノア、行けるか？', 'angry');
  await say('lucia', 'はい！', 'angry');
  await say('noa', '当然でしょ！　さっさと片付けるわよ！', 'angry');
  camFree();
  await battle({ enemies: ['behemoth'], area: 'altar', boss: true, music: 'boss' });
  removeNPC(beh);
  await finale();
}
async function finale() {
  const F = Field, fl = S.flags;
  camTo([6, 8, -30], [0, 6, -45], 2);
  Audio2.play('ending');
  await say('noa', '星核の暴走反応……消えた。終わったのね。', 'closed');
  await say('lucia', 'ジークさん、これ……。', 'smile');
  await say('sys', '{水の星核}を取り戻した！', '');
  await say('sieg', 'ああ。下町の水の星核だ。これで婆さんたちも洗濯ができる。', 'smile');
  await fadeOut(1200);
  fl.clear = 1; fl.credits = 0;
  setObjective('');
  Field.load('town', [-4, 12, Math.PI]);
  await wait(200);
  camFree();
}
async function endingTown() {
  const F = Field, fl = S.flags;
  camTo([0, 4, 14], [0, 3, 0], 6);
  await fadeIn(1200);
  await wait(800);
  const elder = F.npcs.find(n => n.m.kind === 'elder');
  await say('elder', 'おお……水が戻った！　ジーク、よくやってくれた！', 'happy');
  await say('kid', 'ジーク、すっげー！！', 'laugh');
  await say('sieg', '大げさだっての。……ま、礼なら、こいつらにも言ってやってくれ。', 'smirk');
  await fadeOut(1000);
  // the evening star
  placePlayer(-30, 30, Math.PI);
  camTo([-32, 3.0, 36], [-12, 40, -120], 6);
  await fadeIn(1500);
  await wait(1000);
  await say('lucia', '見てください、宵の明星……。', 'smile');
  await say('sieg', '……騎士団にいた頃は、何を守るべきなのか見えなくなってた。けど今日、ちょっとだけ見えた気がする。', 'normal');
  await say('noa', 'ねえ。星核を悪用する連中は、まだ他にもいるはずよ。……それに、あたしまだ、あんたの剣を調べ終わってないんだけど。', 'normal');
  await say('lucia', 'わたしも……もっと世界を見てみたいです。皆さんと一緒に。', 'smile');
  await say('sieg', 'ったく、物好きばっかりだな。……なら、名前でもつけるか。俺たちの{ギルド}に。', 'smirk');
  await say('lucia', 'ギルド……！', 'surprise');
  await say('sieg', '宵の空に光る一番星――{ステラ・ノクティス}。どうだ？', 'smile');
  await say('noa', '……悪くないわね。', 'smirk');
  await say('lucia', '素敵です！', 'happy');
  await credits();
  fl.credits = 1;
  camFree();
  placePlayer(-6, 12, Math.PI);
  const i = await UI.ask('クリアデータをセーブしますか？（クリア後も冒険を続けられます）', ['セーブする', 'しない'], true);
  if (i === 0) { S.pos = [Field.pos.x, Field.pos.z, Field.face]; saveGame(); toast('セーブしました'); }
  setObjective('クリアおめでとう！　フィールドを自由に冒険できる');
}
async function credits() {
  const el = $('#prologue'); el.classList.remove('hide'); el.style.background = 'rgba(0,0,0,.82)';
  const lines = ['<div class="cz" style="font-size:clamp(28px,6vw,60px);letter-spacing:.15em;color:#ffe7a8">STELLA NOCTIS</div><div style="letter-spacing:.4em">― 宵星のレガリア ―</div>', 'ジーク・ヴァルド ／ リュシア・エルフェン ／ ノア・ブリッツ', `最大コンボ ${S.maxCombo} HITS　／　フェイタルストライク ${S.fsCount} 回　／　戦闘 ${S.battles} 回`, '<span class="cz" style="letter-spacing:.3em">THE END</span><br><small>…and the tale of the evening star continues.</small>'];
  for (const l of lines) {
    el.innerHTML = `<p>${l}</p>`; const p = el.querySelector('p'); await wait(60); p.classList.add('on');
    await wait(3200); p.classList.remove('on'); await wait(1300);
  }
  el.classList.add('hide'); el.style.background = '';
}
