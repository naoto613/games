// ================================================================ story engine
const Story = { cut: false, talker: null, timers: [], dlg: null };
const F = S.flags;
const SPK = {
  futan: ['ふーたん', 520], baaba: ['ばあば', 250], jiiji: ['じいじ', 170], ricky: ['リッキー', 680], leon: ['レオン', 190], shop: ['おみせの おじさん', 220],
  deku: ['デクじいさま', 105], korok: ['コロっぴ', 760], ruru: ['りゅうの ルルー', 150], jab: ['くじらの ジャブ', 85], garuga: ['ガルガ', 120], voice: ['なぞの こえ', 330], sign: ['', 0],
};
function wait(s) { return new Promise(r => Story.timers.push({ t: s, r })); }
function tickTimers(dt) { for (let i = Story.timers.length - 1; i >= 0; i--) { const t = Story.timers[i]; t.t -= dt; if (t.t <= 0) { Story.timers.splice(i, 1); t.r(); } } }
// ---------- dialog
const dlgEl = $('#dlg'), dlgNm = dlgEl.querySelector('.nm'), dlgTx = dlgEl.querySelector('.tx'), dlgNx = dlgEl.querySelector('.nx'), choicesEl = $('#choices');
function say(who, html, o = {}) {
  return new Promise(res => {
    const sp = SPK[who] || [who, 300];
    Story.talker = who === 'futan' ? null : who; PL.talk = who === 'futan';
    dlgEl.classList.remove('hide'); dlgNm.textContent = sp[0]; dlgTx.innerHTML = ''; dlgNx.style.visibility = 'hidden'; choicesEl.innerHTML = '';
    // typewriter over text nodes (keeps tags)
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    const full = tmp.innerHTML; let shown = 0; const plain = tmp.textContent.length;
    const D = { done: false, typing: true };
    function render(n) {
      // clone and truncate text
      const c = tmp.cloneNode(true); let left = n;
      (function walk(node) { for (const ch of [...node.childNodes]) { if (ch.nodeType === 3) { if (left <= 0) ch.textContent = ''; else if (ch.textContent.length > left) { ch.textContent = ch.textContent.slice(0, left); left = 0; } else left -= ch.textContent.length; } else walk(ch); } })(c);
      dlgTx.innerHTML = c.innerHTML;
    }
    const iv = setInterval(() => {
      shown += 2; render(shown);
      if (sp[1] && shown % 6 === 0) Audio2.voice(sp[1], 1);
      if (shown >= plain) { clearInterval(iv); D.typing = false; dlgTx.innerHTML = full; dlgNx.style.visibility = o.choices ? 'hidden' : 'visible'; if (o.choices) showChoices(); }
    }, 34);
    function showChoices() {
      o.choices.forEach((c, i) => { const b = document.createElement('button'); b.className = 'mg'; b.textContent = c; b.onclick = e => { e.stopPropagation(); Audio2.sfx('select'); finish(i); }; choicesEl.appendChild(b); });
    }
    function finish(v) { if (D.done) return; D.done = true; Story.dlg = null; dlgEl.classList.add('hide'); choicesEl.innerHTML = ''; Story.talker = null; PL.talk = false; res(v); }
    Story.dlg = {
      adv() {
        if (D.typing) { clearInterval(iv); D.typing = false; dlgTx.innerHTML = full; dlgNx.style.visibility = o.choices ? 'hidden' : 'visible'; if (o.choices) showChoices(); return; }
        if (!o.choices) { Audio2.sfx('click'); finish(0); }
      }
    };
  });
}
dlgEl.addEventListener('pointerdown', e => { e.stopPropagation(); Story.dlg && Story.dlg.adv(); });
const ask = (who, html, choices) => say(who, html, { choices });
// ---------- banners
function toast(t, sec = 2) { const el = $('#toast'); el.innerHTML = t; el.style.opacity = 1; clearTimeout(el._t); el._t = setTimeout(() => el.style.opacity = 0, sec * 1000); }
function areaBanner(I) { const el = $('#area'); el.querySelector('.n').textContent = I.name; el.querySelector('.s').textContent = I.sub || ''; el.style.opacity = 1; clearTimeout(el._t); el._t = setTimeout(() => el.style.opacity = 0, 3200); }
async function itemGet(icon, text, big = true) {
  const g = $('#get'); g.querySelector('.ic').textContent = icon; g.querySelector('.t').textContent = text;
  PL.hold = true; Audio2.fanfare(big ? 'big' : 'small');
  FX.stars(PL.pos.x, PL.pos.y + 2.4, PL.pos.z, 0xffe04a, 14);
  g.classList.add('on');
  await wait(1.6);
  await say('', `<b>${text}</b>`);
  g.classList.remove('on'); PL.hold = false;
}
async function cut(fn) {
  if (Story.cut) return;
  Story.cut = true; $('#bars').classList.add('on'); $('#tc').classList.add('hide');
  PL.atk = null; PL.spin = null; PL.chargeT = 0; PL.vel.set(0, 0, 0);
  try { await fn(); } catch (e) { console.error(e); }
  Story.cut = false; $('#bars').classList.remove('on'); $('#tc').classList.remove('hide'); camFollow(); saveGame();
}
async function fade(on, black, sec = 0.5) { const f = $('#fade'); f.classList.toggle('black', !!black); f.style.transition = `opacity ${sec}s`; f.style.opacity = on ? 1 : 0; await wait(sec + 0.05); }
function setObjective() {
  const o = objective(); $('#obj').innerHTML = o ? o.t : ''; Story.objPos = o && o.p;
}
function lookAtPlayer(dist = 6, h = 2.2, side = 0.6) {
  const a = PL.face + side; camCut(PL.pos.x + Math.sin(a) * dist, PL.pos.y + h, PL.pos.z + Math.cos(a) * dist, PL.pos.x, PL.pos.y + 1.2, PL.pos.z, 4);
}
function facePlayerTo(x, z) { PL.face = Math.atan2(x - PL.pos.x, z - PL.pos.z); }

// ---------- objectives
function W(id, x, z) { const I = ISL[id]; return { x: I.x + x, z: I.z + z }; }
function objective() {
  const onIs = id => PL.island === ISL[id] && PL.mode === 'foot';
  if (!F.clothes) return { t: '<b>ばあば</b>の おうちへ いこう', p: W('home', 13.6, 12) };
  if (!F.sword) return { t: '<b>じいじ</b>に けんを ならおう', p: W('home', -12, 17) };
  if (!F.taken) return { t: 'おかの うえの <b>リッキー</b>に みせに いこう', p: W('home', -20, -24) };
  if (!F.boat) return { t: '<b>さんばし</b>へ いそごう！', p: W('home', 3.4, 58) };
  if (!F.pearlG) {
    if (onIs('forest')) {
      if (!F.chuClear) return { t: 'チュチュを ぜんぶ やっつけよう', p: null };
      if (!F.leaf) return { t: '<b>デクじいさま</b>に はなしかけよう', p: W('forest', -6, 27) };
      return { t: 'おかに のぼって <b>うちわ</b>で きりかぶへ とぼう', p: W('forest', 30, -30) };
    }
    return { t: 'にしの <b>もりの しま</b>へ いこう', p: W('forest', 0, 58) };
  }
  if (!F.pearlR) {
    if (onIs('fire')) {
      if (!F.gate) return { t: 'いわを おして スイッチに のせよう', p: W('fire', -21, 8) };
      if (!F.pearlR && Enemies.count('fire')) return { t: 'やまの てっぺんで ボコぴょんを やっつけよう', p: W('fire', 10, -6) };
      return { t: 'てっぺんの <b>ルルー</b>に はなしかけよう', p: W('fire', 10, -6) };
    }
    return { t: 'ひがしの <b>ひの やま</b>へ いこう', p: W('fire', -58, 8) };
  }
  if (!F.pearlB) return { t: 'みなみの <b>くじらの いりえ</b>へ いこう', p: W('whale', 24, 60) };
  if (!F.tower) return { t: 'まんなかの <b>かみさまの とう</b>へ しずくを とどけよう', p: W('tower', 0, 0) };
  if (!F.end) {
    if (onIs('fortress')) {
      if (!F.fortGate) return { t: 'みつからないように うえを めざそう', p: W('fortress', -16, -20) };
      return { t: 'てっぺんで <b>リッキー</b>を たすけよう！', p: W('fortress', 0, -42) };
    }
    return { t: 'きたの <b>まものの とりで</b>へ！', p: W('fortress', 0, 72) };
  }
  const left = Things.chests.filter(c => !c.opened).length;
  return { t: left ? `うみを ぼうけん！ たからばこ のこり <b>${left}</b>` : 'たからばこ ぜんぶ みつけた！ すごい！', p: null };
}

// ================================================================ actors
const A = {};
function spawnActors() {
  A.baaba = addNPC({ id: 'baaba', P: makeVillager({ robe: 0x8a5ac8, robeTop: 0.22, robeBot: 0.44, robeH: 0.8, style: 'bun', hair: 0xb8b8c0, hunch: true, glasses: true, cane: true, scale: 0.95 }), x: 13.6, z: 12.5, face: 0.3, voice: 250, talk: talkBaaba });
  A.jiiji = addNPC({ id: 'jiiji', P: makeVillager({ robe: 0x3a6ad0, robeTop: 0.26, robeBot: 0.4, robeH: 0.95, style: 'bald', hair: 0xf0f0f0, beard: true, scale: 1.0 }), x: -12, z: 17, face: 1.4, talk: talkJiiji });
  A.ricky = addNPC({ id: 'ricky', P: makeRicky(), x: 4, z: 18, face: Math.PI, talk: talkRicky, r: 2.2 });
  A.shop = addNPC({ id: 'shop', P: makeVillager({ robe: 0xe8a040, belly: true, apron: true, robeTop: 0.3, robeBot: 0.44, style: 'short', hair: 0x5a3a22, mustache: 0x5a3a22, hat: 0xe2463a }), x: 20.6, z: 20.9, face: -0.5, r: 3.6, talk: talkShop, look: false });
  // villagers for flavor
  A.kid1 = addNPC({ id: 'kid1', P: makeVillager({ scale: 0.8, robe: 0xff8a5a, style: 'short', hair: 0x3a2a1a }), x: 26, z: 8, face: -1, talk: async () => { await say('kid1', 'ふーたん おたんじょうび おめでとう！ <br>' + (F.end ? 'リッキーが かえってきて よかったね！' : F.taken ? 'リッキー きっと たすけてね！' : 'みどりの ふく いいなあ！')); } });
  SPK.kid1 = ['ともだちの ケン', 600];
  // forest
  A.deku = addNPC({ id: 'deku', P: { g: new THREE.Group(), eyes: [], tw: 0 }, x: -436, z: -208 + 5, r: 7.5, look: false, talk: talkDeku, anim: () => { } });
  A.deku.pos.set(ISL.forest.x - 6, 2.6, ISL.forest.z + 27.5); A.deku.fixedY = true;
  A.korok1 = addNPC({ id: 'korok', P: makeKorok(), x: ISL.forest.x + 3, z: ISL.forest.z + 42, face: Math.PI, talk: talkKorok, anim: animKorokFn() });
  A.korok2 = addNPC({ id: 'korok2', P: makeKorok(0x9ad04a), x: ISL.forest.x - 18, z: ISL.forest.z + 20, talk: async () => say('korok', 'デクじいさまは とっても ものしり なんだよ〜'), anim: animKorokFn() });
  // fire
  A.ruru = addNPC({ id: 'ruru', P: makeDragon(), x: ISL.fire.x + 9, z: ISL.fire.z - 11, face: 0.6, r: 7, look: false, talk: talkRuru, anim: dt => { A.ruru.P.head.rotation.x = Math.sin(World.t * 1.2) * 0.1; A.ruru.P.neck.rotation.z = Math.sin(World.t * 0.8) * 0.05; blinkEyes(A.ruru.P.eyes, World.t); } });
  A.ruru.P.g.scale.setScalar(0.85); addCol(ISL.fire, 9, -11, 3.4);
  // whale
  A.jab = addNPC({ id: 'jab', P: makeWhale(), x: ISL.whale.x + 24, z: ISL.whale.z + 62, y: -1.5, face: -1.2, r: 20, look: false, talk: talkJab, anim: dt => { A.jab.P.tail.rotation.x = Math.sin(World.t * 2) * 0.2; A.jab.pos.y = -1.8 + Math.sin(World.t * 0.9) * 0.4; } });
  A.jab.fixedY = true; A.jab.boatTalk = true;
  // spare npc on whale isle
  A.fisher = addNPC({ id: 'fisher', P: makeVillager({ robe: 0x3a9a8a, style: 'short', hair: 0x2a2a2a, hat: 0xf0e0a0 }), x: ISL.whale.x - 4, z: ISL.whale.z - 14, talk: async () => say('fisher', F.pearlB ? 'ジャブと きょうそうして かったって！？ すごいなあ！' : 'くじらの ジャブは しまの みなみに いるよ。 ふねで はなしかけて ごらん。') });
  SPK.fisher = ['りょうしの おじさん', 200];
  // boat npc for talking (Leon)
}
function animKorokFn() { let t = Math.random() * 5; return function (dt) { t += dt; this && 0; }; }
// animate koroks generically
function animKoroks(dt) { for (const n of [A.korok1, A.korok2]) { if (!n) continue; n.P.tw += dt; n.P.g.position.y = n.pos.y + Math.abs(Math.sin(n.P.tw * 3)) * 0.15; n.P.mask.rotation.z = Math.sin(n.P.tw * 2) * 0.15; } }

// ---------- conversations
async function talkBaaba() {
  if (!F.clothes) {
    await cut(async () => {
      facePlayerTo(A.baaba.pos.x, A.baaba.pos.z);
      camCut(A.baaba.pos.x - 4, A.baaba.pos.y + 2.4, A.baaba.pos.z + 5, (A.baaba.pos.x + PL.pos.x) / 2, PL.pos.y + 1.2, (A.baaba.pos.z + PL.pos.z) / 2, 4);
      await say('baaba', 'ふーたん、 <b>おたんじょうび おめでとう</b>。 きょうで 5さい だねえ。');
      await say('baaba', 'この しまでは 5さいに なった こに <em>みどりの ふく</em>を きせる ならわしが あるのよ。');
      await say('baaba', 'むかし かぜと いっしょに まものを やっつけた <b>ゆうしゃ</b>の ふく なんだって。 さあ、 きてごらん。');
      await fade(true, false, 0.6);
      S.outfit = 'hero'; setOutfit(PL.P, 'hero');
      await wait(0.4); await fade(false, false, 0.6);
      lookAtPlayer(4.5, 1.8, 0.3);
      F.clothes = 1; await itemGet('👕', 'ゆうしゃの ふくを きた！');
      await say('futan', 'わーい！ ぼうしも ついてる！ にあう？');
      await say('baaba', 'まあまあ、 よく にあうこと！ <b>じいじ</b>にも みせておいで。 <br>おうちの ひだりで けんの おけいこを してくれるよ。');
    });
    setObjective(); return;
  }
  if (F.taken && !F.boat) return say('baaba', 'リッキーが… <br>ふーたん、 さんばしの あかい ふねへ いそいで！');
  if (F.end) return say('baaba', 'ふーたん、 リッキーを たすけてくれて ありがとう。 <br>あなたは ほんとうの <b>ゆうしゃ</b>だね。');
  if (F.boat) {
    const hint = objective();
    await say('baaba', 'ふーたん、 むりは しないでね。 <br>つぼを わると ハートが でることが あるよ。');
    if (S.hp < S.maxHp) { S.hp = S.maxHp; Audio2.sfx('heart'); await say('baaba', 'さあ、 おばあちゃんの スープを おのみ。 <b>げんき いっぱい！</b>'); }
    return;
  }
  return say('baaba', 'じいじは おうちの ひだりの わらにんぎょうの ところに いるよ。');
}
async function talkJiiji() {
  if (!F.clothes) return say('jiiji', 'おや ふーたん。 ばあばが よんでおったぞ。 はやく いっておいで。');
  if (!F.sword && !Story.training) {
    await cut(async () => {
      facePlayerTo(A.jiiji.pos.x, A.jiiji.pos.z);
      camCut(A.jiiji.pos.x + 4, A.jiiji.pos.y + 2.4, A.jiiji.pos.z + 5, (A.jiiji.pos.x + PL.pos.x) / 2, PL.pos.y + 1.2, (A.jiiji.pos.z + PL.pos.z) / 2, 4);
      await say('jiiji', 'おお ふーたん！ その ふく… まるで むかしの ゆうしゃ そっくりじゃ！');
      await say('jiiji', 'ゆうしゃには けんが ひつようじゃな。 これを やろう。');
      lookAtPlayer(4.5, 1.8, -0.4);
      S.items.sword = 1; await itemGet('🗡️', 'きの けんを もらった！');
      await say('jiiji', '<b>A</b>ボタンで けんを ふれるぞ。 <br>あの <em>わらにんぎょう</em>を <b>3かい</b> たたいてごらん。');
    });
    Story.training = { hits: 0, spin: false }; $('#counter').textContent = 'たたいた かず 0 / 3';
    $('#obj').innerHTML = 'わらにんぎょうを <b>3かい</b> たたこう'; return;
  }
  if (Story.training) return say('jiiji', Story.training.hits < 3 ? 'わらにんぎょうを Aボタンで 3かい たたくのじゃ！' : '<b>A</b>を ながーく おして… はなすと <b>かいてんぎり</b>じゃ！');
  if (F.end) return say('jiiji', 'わっはっは！ ガルガを やっつけるとは！ もう じいじより つよいのう！');
  if (S.items.light) return say('jiiji', 'その けん… ひかって おるな！ かいてんぎりも わすれずにな。');
  return say('jiiji', 'こまったら <b>かいてんぎり</b>じゃ！ Aを ながおし して はなすのじゃぞ。');
}
Hooks.dummyHit = async (d, spin) => {
  const T = Story.training; if (!T) return;
  if (T.hits < 3) {
    T.hits++; $('#counter').textContent = `たたいた かず ${T.hits} / 3`;
    if (T.hits >= 3) {
      $('#counter').textContent = '';
      await cut(async () => {
        await say('jiiji', 'じょうず じょうず！ つぎは <b>かいてんぎり</b>じゃ。');
        await say('jiiji', '<b>A</b>ボタンを <em>ながーく おして</em>… きらきら したら はなす！ やってごらん。');
      });
      $('#obj').innerHTML = 'A を ながおし → はなして <b>かいてんぎり</b>！';
    }
  } else if (spin && !T.spin) {
    T.spin = true;
    await cut(async () => {
      Audio2.sfx('cheer');
      await say('jiiji', 'すばらしい！ もう いちにんまえの <b>ゆうしゃ</b>じゃ！');
      await say('jiiji', 'そうじゃ、 リッキーが おかの うえで まっておったぞ。 その すがたを みせて おやり。');
    });
    Story.training = null; F.sword = 1; setObjective(); saveGame();
  }
};
async function talkRicky() {
  if (F.end) return say('ricky', pick(['ねーね だいすき！', 'ねーね かっこいい！ ゆうしゃ！', 'また ふね のりたい！']));
  if (!F.clothes) return say('ricky', 'ばあばが よんでたよ！ おうちに きてって！');
  return say('ricky', 'ねーね かっこいい！ おかの うえで まってるね！');
}
async function talkShop() {
  if (!F.clothes) return say('shop', 'いらっしゃい！ …おや、 ふーたん おたんじょうび おめでとう！');
  const items = [];
  if (S.maxHp < 14) items.push(['ハートの うつわ (80)', 80, 'heart']);
  if (!S.fastSail && F.boat) items.push(['はやい ほ (60)', 60, 'sail']);
  items.push([S.outfit === 'pink' ? 'みどりの ふくに もどす (0)' : 'ピンクの ふく (30)', S.outfit === 'pink' ? 0 : 30, 'pink']);
  items.push(['やめる', 0, 'no']);
  const i = await ask('shop', `いらっしゃい！ <b>キラキラ</b>で おかいもの できるよ。 <br>（いま <b>${S.rupees}</b> こ もってる）`, items.map(x => x[0]));
  const it = items[i]; if (!it || it[2] === 'no') return say('shop', 'また きてね〜！');
  if (S.rupees < it[1]) return say('shop', 'キラキラが たりないみたい。 くさを きったり つぼを わったり してみて！');
  S.rupees -= it[1]; HUD.dirty = true; Audio2.sfx('rupeeB');
  if (it[2] === 'heart') { await cut(async () => { lookAtPlayer(); S.maxHp += 2; S.hp = S.maxHp; await itemGet('❤️', 'ハートの うつわ！ ハートが ふえた！'); }); }
  else if (it[2] === 'sail') { S.fastSail = 1; await cut(async () => { lookAtPlayer(); await itemGet('⛵', 'はやい ほ！ ふねが はやく なった！'); }); }
  else { S.outfit = S.outfit === 'pink' ? 'hero' : 'pink'; setOutfit(PL.P, S.outfit); Audio2.sfx('chime'); await say('shop', S.outfit === 'pink' ? 'ピンクも すてきだね！' : 'やっぱり みどりも いいね！'); }
  saveGame();
}
async function talkKorok() {
  if (!F.forestMet) return;
  if (!F.chuClear) return say('korok', 'チュチュを ぜんぶ やっつけて〜！ のこり <b>' + Enemies.count('forest') + '</b> ひき！');
  if (!F.leaf) return say('korok', 'デクじいさまが おれいを したいって！');
  if (!F.pearlG) return say('korok', 'たかい おかから とびおりて <b>Y</b>ボタン！ ふんわり とべるよ〜');
  return say('korok', 'ありがと〜 ゆうしゃさん！ また きてね〜');
}
async function talkDeku() {
  if (!F.chuClear) return say('deku', 'おお… ちいさな ゆうしゃよ… もりの チュチュを たいじして おくれ…');
  if (!F.leaf) {
    await cut(async () => {
      const D = A.deku.pos; facePlayerTo(D.x, D.z);
      camCut(PL.pos.x + 6, PL.pos.y + 3, PL.pos.z + 8, D.x, D.y + 7, D.z, 3);
      Story.talker = 'deku';
      await say('deku', 'ありがとう ちいさな ゆうしゃよ。 もりに へいわが もどった。');
      await say('deku', 'おれいに この <b>はっぱの うちわ</b>を あげよう。');
      lookAtPlayer();
      S.items.leaf = 1; F.leaf = 1; await itemGet('🍃', 'はっぱの うちわを てにいれた！');
      await say('deku', 'たかい ところから とびおりて <b>Y</b>ボタンを おすと <em>ふんわり</em> とべる。 <br>じめんで <b>Y</b>を おすと <em>かぜ</em>を おこせるぞ。');
      await say('deku', 'みどりの しずくは あの <b>たかい きりかぶ</b>の うえに ある。 <br>うらの おかに のぼって とんで ゆくのじゃ。');
      camCut(ISL.forest.x + 2, 22, ISL.forest.z - 4, ISL.forest.x + 30, 8, ISL.forest.z - 30, 2);
      await wait(2.4);
    });
    setObjective(); return;
  }
  return say('deku', F.pearlG ? 'かぜの ゆうしゃよ… そなたの たびに かぜの みちびきが あらんことを…' : 'おかの うえから きりかぶへ とぶのじゃ。 ちからが へったら じめんで やすむと よい。');
}
async function talkRuru() {
  if (Enemies.count('fire')) return say('ruru', 'うわーん！ ボコぴょんたちを やっつけて〜！');
  if (!F.pearlR) {
    await cut(async () => {
      const R = A.ruru.pos; facePlayerTo(R.x, R.z);
      camCut(PL.pos.x - 7, PL.pos.y + 4, PL.pos.z + 7, R.x, R.y + 4, R.z, 3);
      await say('ruru', 'ぐすっ… ありがとう！ ボコぴょんたちが ぼくの おやまで いたずら してたんだ。');
      await say('ruru', 'きみ ゆうしゃ なんだね！ これ… ぼくの たからもの。 きみに あげる！');
      lookAtPlayer();
      S.pearls.r = 1; F.pearlR = 1; await itemGet('🔴', 'あかい しずくを てにいれた！');
      await say('ruru', 'がんばってね！ ガルガなんか ぼくの ほのおで… あちっ！ じぶんが あつい！');
    });
    setObjective(); return;
  }
  return say('ruru', 'また あそびに きてね！ やまの うえは あったかいよ〜');
}
async function talkJab() {
  if (PL.mode !== 'boat') return say('jab', 'やっほー！ <b>ふねに のってから</b> はなしかけてね〜！');
  if (F.pearlB) return say('jab', 'また きょうそう しようね〜！ ばしゃーん！');
  if (Race.on) return;
  await cut(async () => {
    { const dx = BOAT.pos.x - A.jab.pos.x, dz = BOAT.pos.z - A.jab.pos.z, d = Math.hypot(dx, dz) || 1; camCut(BOAT.pos.x + dx / d * 14 + dz / d * 6, 9, BOAT.pos.z + dz / d * 14 - dx / d * 6, (A.jab.pos.x + BOAT.pos.x) / 2, 2, (A.jab.pos.z + BOAT.pos.z) / 2, 3); }
    if (!F.whaleMet) {
      F.whaleMet = 1;
      await say('jab', 'やあ！ ぼくは くじらの <b>ジャブ</b>！ あおい しずくが ほしいの？');
      await say('jab', 'じゃあ ぼくと <b>きょうそう</b>しよう！ しまの まわりの <em>8つの わっか</em>を じゅんばんに くぐってね！');
      await say('leon', 'かぜは わたしに まかせなさい。 ふーたんは かじとりに しゅうちゅうだ！');
    }
    const i = await ask('jab', 'じゅんびは いい？ <b>90びょう</b>いないだよ！', ['はじめる！', 'あとで']);
    if (i === 0) Race.start();
  });
}

// ================================================================ events
Hooks.enemyDead = e => {
  if (e.tag === 'forest' && !Enemies.count('forest') && !F.chuClear) {
    F.chuClear = 1; $('#counter').textContent = '';
    cut(async () => { Audio2.sfx('cheer'); lookAtPlayer(); await say('korok', 'やった〜！ チュチュが いなくなった！ <br><b>デクじいさま</b>が よんでるよ〜'); }).then(setObjective);
  } else if (e.tag === 'forest') $('#counter').textContent = `チュチュ のこり ${Enemies.count('forest')}`;
  if (e.tag === 'fire' && !Enemies.count('fire')) { cut(async () => { Audio2.sfx('cheer'); await say('ruru', 'わあ！ ボコぴょんが いなくなった！ ありがとう〜！ <br>こっちに きて！'); }).then(setObjective); }
  if (e.tag === 'fort' && !Enemies.count('fort') && !F.fortGate) openFortGate();
};
Hooks.lost = () => { fade(true, false, 0.3).then(() => { placePlayer(PL.lastSafe.x, PL.lastSafe.z); fade(false, false, 0.4); toast('りくに もどったよ'); }); };
Hooks.dead = () => {
  if (PL.dead) return; PL.dead = true;
  cut(async () => {
    lookAtPlayer(4, 2, 0); await wait(0.6);
    await fade(true, true, 0.8);
    S.hp = S.maxHp; if (PL.mode === 'foot') placePlayer(PL.lastSafe.x, PL.lastSafe.z);
    PL.inv = 2; Enemies.list.forEach(e => { if (e.state !== 'under') { e.state = 'idle'; e.t = 0; } });
    await fade(false, true, 0.6);
    await say('leon', 'ふーたん、 だいじょうぶか？ <b>ハートが ぜんぶ もどった</b>ぞ。 もういちど がんばろう！');
  }).then(() => { PL.dead = false; });
};
Hooks.edge = () => { if (!Story.edgeT || World.t - Story.edgeT > 8) { Story.edgeT = World.t; toast('この さきは うみの はて…'); } };

// ---------- triggers checked each frame
function checkTriggers(dt) {
  if (Story.cut) return;
  const p = PL.pos;
  // intro handled by startGame
  if (F.sword && !F.taken && PL.mode === 'foot') { const r = W('home', -20, -24); if (Math.hypot(p.x - r.x, p.z - r.z) < 13) kidnap(); }
  if (F.taken && !F.boat && PL.mode === 'foot') { if (Math.hypot(p.x - BOAT.pos.x, p.z - BOAT.pos.z) < 7) leonMeet(); }
  if (F.boat && !F.forestMet && PL.mode === 'foot' && PL.island === ISL.forest) forestArrive();
  if (F.forestMet && !F.pearlG) { const pg = Puzzle.pearlG; const wx = pg.I.x + pg.x, wz = pg.I.z + pg.z; if (Math.hypot(p.x - wx, p.z - wz) < 2 && p.y > pg.y - 0.5) getPearlG(); }
  if (PL.mode === 'foot' && PL.island === ISL.fire && !F.fireMet) { F.fireMet = 1; toast(S.items.leaf ? 'やまの てっぺんを めざそう！' : 'ほのおが じゃま… なにか つかえる ものは？', 3); }
  if (PL.mode === 'foot' && PL.island === ISL.fire && !F.pearlR && !F.fireTop && p.y > 14) { F.fireTop = 1; fireTop(); }
  // fire gate hint
  if (PL.mode === 'foot' && PL.island === ISL.fire && !S.items.leaf) { for (const f of Things.fires) if (f.on && Math.hypot(p.x - f.x, p.z - f.z) < 6 && (!Story.fhT || World.t - Story.fhT > 8)) { Story.fhT = World.t; toast('あつい！ ほのおを けす どうぐが ひつようだ'); } }
  // tower
  if (F.pearlG && F.pearlR && F.pearlB && !F.tower && PL.mode === 'boat') { const T = ISL.tower; if (Math.hypot(BOAT.pos.x - T.x, BOAT.pos.z - T.z) < 15) towerRise(); }
  // fortress
  if (PL.mode === 'foot' && PL.island === ISL.fortress && F.tower && !F.fortMet) { F.fortMet = 1; fortArrive(); }
  if (PL.mode === 'foot' && PL.island === ISL.fortress && F.fortGate && !Boss.on && !F.end && p.y > 16.3) bossStart();
}

// ================================================================ cutscenes
async function introScene() {
  await cut(async () => {
    setMood('day', true); Audio2.music('island');
    placePlayer(ISL.home.x + 2, ISL.home.z + 16, Math.PI);
    A.ricky.pos.set(2, 0, 13.5); A.ricky.face = 0;
    camCut(60, 30, 110, 0, 5, 0, 1, true);
    areaBanner(ISL.home);
    await wait(1.0);
    camCut(14, 8, 34, 2, 2, 14, 0.8);
    await wait(3.2);
    camCut(PL.pos.x + 4, PL.pos.y + 2.2, PL.pos.z + 3, 2, 1.4, 15, 2.5);
    await wait(1.2);
    await say('ricky', 'ねーね！ <b>おたんじょうび おめでとう</b>！');
    await say('futan', 'ありがとう リッキー！ ふーたん きょうで <b>5さい</b>！');
    await say('ricky', 'ばあばが よんでたよ！ おうちに きてって！');
    await say('futan', 'わかった！ いってくるね！');
  });
  // ricky goes to the hill
  A.ricky.pos.set(-19, 0, -21); A.ricky.face = 0.4;
  setObjective();
  toast(isTouch ? 'ひだりの ゆびで あるくよ' : 'WASD / やじるしキーで あるくよ', 3.5);
}
async function kidnap() {
  F.taken = 1;
  await cut(async () => {
    const r = A.ricky.pos.clone();
    facePlayerTo(r.x, r.z);
    camCut(PL.pos.x + 5, PL.pos.y + 3, PL.pos.z + 6, r.x, r.y + 1, r.z, 3);
    await say('ricky', 'ねーね！ みてみて！ おそらに <b>おっきな とり</b>！');
    Audio2.music('none'); Audio2.sfx('screech');
    const B = Boss.ensureBird(); B.g.visible = true;
    // fly in from the north
    const path = t => new V3(r.x + Math.sin(t * 2.2) * lerp(60, 0, t), lerp(60, r.y + 4.5, t), r.z + lerp(-120, 0, t));
    camCut(r.x + 12, r.y + 6, r.z + 16, r.x, r.y + 8, r.z - 20, 2);
    World.stormK = 0.6;
    for (let t = 0; t <= 1; t += 1 / 150) { const q = path(t); B.g.position.copy(q); B.g.lookAt(path(Math.min(1, t + 0.01))); animBird(B, 1 / 60, 1.2, t > 0.8); await wait(1 / 60); }
    Audio2.sfx('screech');
    await say('futan', 'リッキー！！ あぶない！');
    // grab
    A.ricky.follow = () => B.g.position.clone().add(new V3(0, -3.6, 0.6));
    for (let t = 0; t < 2.6; t += 1 / 60) {
      B.g.position.y += t * 0.25; B.g.position.z -= t * 0.9; B.g.rotation.set(-0.3, Math.PI, 0); animBird(B, 1 / 60, 1.5, true);
      camCut(r.x + 10, r.y + 5, r.z + 16, B.g.position.x, B.g.position.y - 1, B.g.position.z, 3);
      await wait(1 / 60);
    }
    await say('ricky', 'ねーねー！ たすけてー！');
    for (let t = 0; t < 2.5; t += 1 / 60) { B.g.position.y += 0.35; B.g.position.z -= 1.4; animBird(B, 1 / 60, 1.5, true); await wait(1 / 60); }
    B.g.visible = false; A.ricky.follow = null; A.ricky.visible = false;
    lookAtPlayer(5, 2, 0.4);
    await say('futan', 'リッキーーー！！');
    World.stormK = 0;
    await wait(0.8);
    // grandma brings shield
    A.baaba.pos.set(PL.pos.x + 2.5, 0, PL.pos.z + 2.5); facePlayerTo(A.baaba.pos.x, A.baaba.pos.z); A.baaba.face = Math.atan2(PL.pos.x - A.baaba.pos.x, PL.pos.z - A.baaba.pos.z);
    camCut(PL.pos.x - 5, PL.pos.y + 2.5, PL.pos.z + 5, (PL.pos.x + A.baaba.pos.x) / 2, PL.pos.y + 1.2, (PL.pos.z + A.baaba.pos.z) / 2, 3);
    await say('baaba', 'ふーたん！ いま おおきな とりが リッキーを…！');
    await say('futan', 'ばあば… ふーたん、 リッキーを たすけに いく！');
    await say('baaba', '…そう いうと おもったよ。 これは おじいさんが むかし つかっていた <b>たて</b>。 もって おいき。');
    lookAtPlayer();
    S.items.shield = 1; await itemGet('🛡️', 'ゆうしゃの たてを もらった！');
    // the boat arrives at the pier
    Audio2.sfx('chime');
    const H = ISL.home;
    placeBoat(H.x + 3.4, H.z + 90, Math.PI); BOAT.auto = { x: H.x + 3.4, z: H.z + 58, sail: 0.6 };
    camCut(H.x + 14, 8, H.z + 50, H.x + 3, 1, H.z + 64, 2);
    await say('leon', 'おーい！ そこの <b>みどりの ふくの こ</b>！ さんばしまで きなさい！');
    for (let t = 0; t < 4.5; t += 1 / 60) { await wait(1 / 60); if (BOAT.pos.z < H.z + 60) break; }
    BOAT.auto = null; placeBoat(H.x + 3.4, H.z + 58, Math.PI);
    await say('futan', 'ふねが… しゃべった！？');
    A.baaba.pos.set(13.6, 0, 12.5);
  });
  Audio2.music('island'); setObjective();
}
async function leonMeet() {
  F.boat = 1;
  await cut(async () => {
    facePlayerTo(BOAT.pos.x, BOAT.pos.z);
    camCut(BOAT.pos.x + 7, 4, BOAT.pos.z + 3, BOAT.pos.x, 1.5, BOAT.pos.z + 1, 3);
    Story.talker = 'leon';
    await say('leon', 'わたしは しゃべる ふね <b>レオン</b>。 さっきの おおどりは <b>ガルガ</b>。 きたの <b>まものの とりで</b>に すんでいる。');
    await say('leon', 'でも とりでは <em>まものの あらし</em>に まもられていて、 このままでは ちかづけないのだ。');
    await say('leon', 'あらしを けすには うみの <b>3つの しずく</b> ─ <em>みどり・あか・あお</em> ─ を あつめて、 <b>かみさまの とう</b>に とどけるのだ。');
    await say('futan', 'ふーたん がんばる！ ぜったい リッキーを たすける！');
    await say('leon', 'よく いった！ では これを もっていきなさい。');
    lookAtPlayer();
    S.items.baton = 1; await itemGet('🪄', 'そよかぜの タクトを てにいれた！');
    await say('leon', 'タクトを ふって <b>かぜの うた</b>を ひくと、 <em>かぜの むき</em>を かえられる。 さあ、 ふねに のって ためして みよう！');
    await fade(true, false, 0.4);
    PL.mode = 'boat'; refreshGear(); CAM.yaw = BOAT.head + Math.PI;
    placeBoat(BOAT.pos.x, BOAT.pos.z + 6, 0);
    await fade(false, false, 0.4);
    camCut(BOAT.pos.x + 6, 5, BOAT.pos.z - 7, BOAT.pos.x, 1.5, BOAT.pos.z, 3);
    await say('leon', 'タクトの うたは <b>↑ ← →</b> の じゅんばんだ。 やってごらん！');
    await Song.open(true);
    await say('leon', 'みごとだ！ かぜを <b>せなか</b>に うけると ふねは はやく すすむぞ。 <br>いつでも <b>Y</b>ボタンで かぜの うたを ひけるからな。');
    await say('leon', 'さあ、 まずは にしの <b>もりの しま</b>へ！ <br><em>ひかりの はしら</em>が めじるしだ。 ちずは 🗺 ボタン！');
  });
  Audio2.music('sea'); setObjective();
}
async function forestArrive() {
  F.forestMet = 1;
  Enemies.clear('forest');
  const I = ISL.forest;
  [[-8, 30], [10, 26], [16, 10], [-20, 8], [-12, -24], [20, -2], [4, 14]].forEach(([x, z], i) => Enemies.spawn(i % 3 === 2 ? 'chuR' : 'chu', I.x + x, I.z + z, { tag: 'forest', leash: 10, aggro: 9 }));
  await cut(async () => {
    const k = A.korok1; facePlayerTo(k.pos.x, k.pos.z);
    camCut(PL.pos.x + 5, PL.pos.y + 2.5, PL.pos.z + 3, k.pos.x, k.pos.y + 0.8, k.pos.z, 3);
    await say('korok', 'たすけて〜！ もりに <b>チュチュ</b>が いっぱい！ デクじいさまが こまってるの〜');
    await say('futan', 'まかせて！ ふーたんが やっつける！');
  });
  $('#counter').textContent = `チュチュ のこり ${Enemies.count('forest')}`; setObjective();
}
async function getPearlG() {
  F.pearlG = 1; S.pearls.g = 1; Puzzle.pearlMeshG && (Puzzle.pearlMeshG.visible = false);
  await cut(async () => { lookAtPlayer(5, 2, 0.5); await itemGet('🟢', 'みどりの しずくを てにいれた！'); await say('leon', '（とおくから） よくやった ふーたん！ つぎは ひがしの <b>ひの やま</b>だ。 ふねに もどろう！'); });
  setObjective();
}
async function fireTop() {
  await cut(async () => {
    const R = A.ruru.pos;
    camCut(PL.pos.x - 6, PL.pos.y + 5, PL.pos.z + 8, R.x, R.y + 4, R.z, 2);
    Audio2.sfx('screech');
    await say('ruru', 'うわーん！ ボコぴょんたちが いじわる するよ〜！ たすけて〜！');
    await say('futan', 'りゅうさんを いじめちゃ だめー！');
  });
  setObjective();
}
// block push
function updateBlock(dt) {
  const B = Puzzle.block; if (!B || B.solved) { PL.push = 0; return; }
  const bx = B.I.x + B.lx, bz = B.I.z + B.lz;
  if (B.moving) {
    B.moving -= dt; const k = 1 - Math.max(0, B.moving) / 0.6;
    B.lz = lerp(B.from, B.to, smooth(0, 1, k)); B.g.position.z = B.lz; B.g.position.y = tH(B.I, B.lx, B.lz);
    B.col.x = B.I.x + B.lx; B.col.z = B.I.z + B.lz;
    if (B.moving <= 0) { B.moving = 0; B.lz = B.to; if (B.lz >= B.z1 - 0.01) solveGate(); }
    return;
  }
  if (PL.mode !== 'foot' || Story.cut) { PL.push = 0; return; }
  const dx = bx - PL.pos.x, dz = bz - PL.pos.z, d = Math.hypot(dx, dz);
  const mv = Math.hypot(Input.mx, Input.my) > 0.4;
  // must be pushing along z axis
  const fz = Math.cos(PL.face), fx = Math.sin(PL.face);
  if (d < 2.4 && mv && PL.onGround && Math.abs(dz) > Math.abs(dx) * 1.3 && (dx * fx + dz * fz) / d > 0.7) {
    PL.push += dt;
    if (PL.push > 0.45) {
      const dir = Math.sign(dz), to = clamp(B.lz + dir * 4, B.z0, B.z1);
      PL.push = 0;
      if (Math.abs(to - B.lz) > 0.1) { B.from = B.lz; B.to = to; B.moving = 0.6; Audio2.sfx('push'); }
      else Audio2.sfx('rock');
    }
  } else PL.push = Math.max(0, PL.push - dt * 2);
}
async function solveGate() {
  const B = Puzzle.block; B.solved = true; F.gate = 1; Audio2.sfx('click');
  await cut(async () => {
    const G2 = Puzzle.gate, gp = new V3(); G2.g.getWorldPosition(gp);
    camCut(gp.x - 9, gp.y + 7, gp.z + 9, gp.x, gp.y + 1.5, gp.z, 2.5);
    await wait(0.8); Audio2.sfx('gate'); Audio2.sfx('found');
    for (let t = 0; t < 1.6; t += 1 / 60) { G2.g.position.y -= 4.6 / 96; if (Math.random() < 0.3) FX.puff(gp.x + rnd(-3, 3), gp.y + 0.3, gp.z + rnd(-1, 1), 0.6, 0xc8b8a0); await wait(1 / 60); }
    G2.col.on = false; G2.g.visible = false;
    await wait(0.5);
  });
  setObjective();
}
function applyPuzzleState() {
  // restore world from flags (on load)
  const B = Puzzle.block;
  if (F.gate) { B.solved = true; B.lz = B.z1; B.g.position.z = B.z1; B.g.position.y = tH(B.I, B.lx, B.z1); B.col.z = B.I.z + B.z1; Puzzle.gate.col.on = false; Puzzle.gate.g.visible = false; }
  if (F.fire1) { Puzzle.fire1.on = false; Puzzle.fire1.col.on = false; Puzzle.fire1.g.visible = false; }
  if (F.fire2) { Puzzle.fire2.on = false; Puzzle.fire2.col.on = false; Puzzle.fire2.g.visible = false; }
  if (F.pearlG && Puzzle.pearlMeshG) Puzzle.pearlMeshG.visible = false;
  if (F.taken && !F.end) A.ricky.visible = false;
  if (F.end) { A.ricky.visible = true; A.ricky.pos.set(6, 0, 16); }
  if (!F.taken && F.clothes) A.ricky.pos.set(-19, 0, -21);
  if (F.tower) raiseTowerInstant();
  if (F.fortGate) { Puzzle.fortGate.col.on = false; Puzzle.fortGate.g.visible = false; }
  for (const c of Things.chests) if (S.chests[c.id]) { c.opened = true; c.lid.rotation.x = -1.9; }
  if (!F.pearlR && F.pearlG) { }
  if (!F.pearlR) spawnFireBoko();
  if (F.tower && !F.fortGate) spawnFortEnemies();
}
Hooks.fireOut = f => { if (f === Puzzle.fire1) F.fire1 = 1; if (f === Puzzle.fire2) F.fire2 = 1; toast('ほのおが きえた！'); saveGame(); };
function spawnFireBoko() {
  Enemies.clear('fire'); const I = ISL.fire;
  [[6, -2], [15, -4], [4, -9]].forEach(([x, z]) => Enemies.spawn('boko', I.x + x, I.z + z, { tag: 'fire', leash: 9, aggro: 9 }));
}

// ---------------------------------------------------------------- ring race (whale)
const Race = {
  on: false, rings: [], idx: 0, t: 0,
  build() {
    const I = ISL.whale;
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU + Math.PI / 2; const r = 92;
      const g = new THREE.Group(); const m = mk(new THREE.TorusGeometry(4.5, 0.45, 8, 24), 0xffd84a, 0.05); g.add(m);
      g.position.set(I.x + Math.cos(a) * r, 3.4, I.z + Math.sin(a) * r); g.rotation.y = -a; g.visible = false; scene.add(g);
      this.rings.push({ g, m });
    }
  },
  start() {
    this.on = true; this.idx = 0; this.t = 90; this.rings.forEach(r => r.g.visible = true); Audio2.music('whale'); this.refresh();
    toast('スタート！', 1.5); Audio2.sfx('cheer');
  },
  refresh() { this.rings.forEach((r, i) => { r.g.visible = i >= this.idx; setCol(r.m, i === this.idx ? 0xffd84a : 0x9ad0ff); r.g.scale.setScalar(i === this.idx ? 1.15 : 0.8); }); },
  stop() { this.on = false; this.rings.forEach(r => r.g.visible = false); $('#counter').textContent = ''; },
  update(dt) {
    if (!this.on) return;
    if (!Story.cut) this.t -= dt;
    World.wind.dir = dampAng(World.wind.dir, BOAT.head, 3, dt);
    const r = this.rings[this.idx]; r.g.rotation.z += dt;
    $('#counter').textContent = `わっか ${this.idx} / 8　のこり ${Math.ceil(this.t)}びょう`;
    if (PL.mode !== 'boat') { this.stop(); toast('きょうそうは おわり'); return; }
    if (Math.hypot(BOAT.pos.x - r.g.position.x, BOAT.pos.z - r.g.position.z) < 6) {
      this.idx++; Audio2.sfx('ring'); FX.stars(r.g.position.x, 3, r.g.position.z, 0xffd84a, 12);
      if (this.idx >= 8) { this.stop(); raceWin(); return; }
      this.refresh();
    }
    if (this.t <= 0) { this.stop(); cut(async () => { await say('jab', 'ざんねーん！ じかん ぎれ〜！ <br>また はなしかけてね。 いつでも さいちょうせん できるよ！'); }); }
  },
};
async function raceWin() {
  await cut(async () => {
    Audio2.sfx('cheer');
    camCut(BOAT.pos.x - 16, 9, BOAT.pos.z - 4, BOAT.pos.x + 6, 1.5, BOAT.pos.z + 4, 3);
    A.jab.pos.x = BOAT.pos.x + 16; A.jab.pos.z = BOAT.pos.z + 10; A.jab.face = Math.atan2(BOAT.pos.x - A.jab.pos.x, BOAT.pos.z - A.jab.pos.z);
    FX.splash(A.jab.pos.x, A.jab.pos.z, 3); Audio2.sfx('splash');
    await say('jab', 'すごーい！ ぜんぶ くぐった！ きみの かち〜！');
    await say('jab', 'やくそくの <b>あおい しずく</b>だよ！ ぷしゅーっ！');
    for (let i = 0; i < 20; i++) FX.emit({ x: A.jab.pos.x, y: 3, z: A.jab.pos.z, s: 0.5, s1: 0.2, c: 0xbfe8ff, vx: rnd(-2, 2), vy: rnd(8, 14), vz: rnd(-2, 2), g: 14, max: 1.4 });
    lookAtPlayer(6, 3, 0.6);
    S.pearls.b = 1; F.pearlB = 1; await itemGet('🔵', 'あおい しずくを てにいれた！');
    await say('leon', 'これで しずくが 3つ そろった！ うみの まんなかの <b>かみさまの とう</b>へ いこう！');
  });
  A.jab.pos.set(ISL.whale.x + 24, -1.5, ISL.whale.z + 62);
  Audio2.music('sea'); setObjective();
}

// ---------------------------------------------------------------- tower of the gods
function raiseTowerInstant() {
  const T = ISL.tower; Puzzle.tower.visible = true; Puzzle.tower.position.y = -0.5;
  if (!T.blobs.find(b => b.tw)) { const b = [0, 0, 11.5, 1.5, 1.5]; b.tw = true; T.blobs.push(b); T.noShore = false; buildTerrain(T); buildShore(); }
  T.towerCol.r = 10; T.towerCol.on = true;
  Puzzle.statues.forEach(s => s.socket.material = BM(s.gemCol));
  setTowerBeams(true);
}
function setTowerBeams(on) {
  if (!Puzzle.beams) { Puzzle.beams = Puzzle.statues.map(s => { const p = new V3(); s.g.getWorldPosition(p); const b = lightPillar(s.gemCol, 1.2, 140); b.position.set(p.x, 0, p.z); b.visible = false; return b; }); }
  Puzzle.beams.forEach(b => b.visible = on);
}
async function towerRise() {
  F.tower = 1;
  await cut(async () => {
    Audio2.music('tower');
    BOAT.speed = 0; const T = ISL.tower;
    // move boat to south side
    placeBoat(T.x, T.z + 34, Math.PI); CAM.yaw = 0;
    camCut(T.x + 30, 16, T.z + 48, T.x, 5, T.z, 1.5, true);
    await say('voice', 'よくぞ きた… <b>しずく</b>を もつ ちいさな ゆうしゃよ…');
    // pearls fly to statues
    const cols = [0x5df05a, 0xff6a4a, 0x5ab0ff];
    const flies = Puzzle.statues.map((s, i) => { const m = pearlMesh(cols[i], 0.5); m.position.set(BOAT.pos.x, 3, BOAT.pos.z); scene.add(m); const p = new V3(); s.socket.getWorldPosition(p); return { m, p, s }; });
    for (let t = 0; t <= 1; t += 1 / 120) { for (const f of flies) { f.m.position.lerpVectors(new V3(BOAT.pos.x, 3, BOAT.pos.z), f.p, smooth(0, 1, t)); f.m.position.y += Math.sin(t * Math.PI) * 10; } await wait(1 / 60); }
    flies.forEach(f => { scene.remove(f.m); f.s.socket.material = BM(f.s.gemCol); Audio2.sfx('chime'); FX.stars(f.p.x, f.p.y, f.p.z, f.s.gemCol, 16); });
    setTowerBeams(true);
    await wait(1.2);
    // rumble: the tower rises
    camCut(T.x + 40, 12, T.z + 50, T.x, 14, T.z, 1.5);
    Audio2.sfx('boom'); Audio2.sfx('gate');
    Puzzle.tower.visible = true;
    for (let t = 0; t <= 1; t += 1 / 300) {
      Puzzle.tower.position.y = lerp(-50, -0.5, smooth(0, 1, t));
      camera.position.x += Math.sin(t * 200) * 0.2;
      if (Math.random() < 0.6) FX.splash(T.x + rnd(-10, 10), T.z + rnd(-10, 10), 1.5);
      if (t > 0.3 && Math.random() < 0.05) Audio2.sfx('boom');
      await wait(1 / 60);
    }
    raiseTowerInstant();
    Audio2.sfx('found');
    await wait(0.8);
    camCut(T.x + 18, 8, T.z + 40, T.x, 20, T.z, 2);
    await say('voice', 'そなたの ゆうきに こたえ、 この <b>ひかりの けん</b>を さずけよう。');
    // light sword
    PL.P.g.visible = true;
    lookAtPlayer(6, 3, 0.4);
    S.items.light = 1; refreshGear(); await itemGet('⚔️', 'ひかりの けんを てにいれた！');
    await say('voice', 'きたの <b>あらし</b>は きえた。 まものの とりでへ ゆき、 おとうとを たすけるが よい…');
    // storm clears (view to the north)
    camCut(BOAT.pos.x, 30, BOAT.pos.z + 20, ISL.fortress.x, 10, ISL.fortress.z, 1);
    for (let t = 0; t < 2.5; t += 1 / 60) { StormFx.clear = Math.min(1, t / 2); await wait(1 / 60); }
    await say('leon', 'あらしが はれた！ ふーたん、 いよいよ <b>まものの とりで</b>だ！ リッキーを たすけに いこう！');
  });
  Audio2.music('sea'); setObjective();
}

// ---------------------------------------------------------------- storm around the fortress
const StormFx = {
  clear: 0, clouds: [], bolts: 0,
  build() {
    const M = ISL.fortress; const r = mulberry(99);
    const dark = new THREE.MeshToonMaterial({ color: 0x4a4460, gradientMap: gradTex, emissive: 0x1a1830 });
    for (let i = 0; i < 26; i++) {
      const g = new THREE.Group(); const a = i / 26 * TAU; const R = 230 + r() * 60;
      for (let k = 0; k < 5; k++) { const m = new THREE.Mesh(G.sph(1, 10, 7), dark); const s = 16 + r() * 18; m.scale.set(s * 1.4, s * 0.9, s); m.position.set((k - 2) * 18, r() * 10, r() * 10); g.add(m); }
      g.position.set(M.x + Math.cos(a) * R, 40 + r() * 50, M.z + Math.sin(a) * R); g.rotation.y = -a; mergeStatic(g, () => true); scene.add(g); this.clouds.push(g);
    }
    // ceiling over the fortress
    for (let i = 0; i < 10; i++) { const g = new THREE.Group(); for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(G.sph(1, 10, 7), dark); const s = 22 + r() * 16; m.scale.set(s * 1.5, s * 0.6, s * 1.2); m.position.set((k - 1.5) * 26, r() * 8, r() * 20); g.add(m); } g.position.set(M.x + (r() - 0.5) * 300, 120 + r() * 30, M.z + (r() - 0.5) * 300); mergeStatic(g, () => true); scene.add(g); this.clouds.push(g); }
    this.bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.4, 120, 5), new THREE.MeshBasicMaterial({ color: 0xffffcc, fog: false })); this.bolt.visible = false; scene.add(this.bolt);
  },
  update(dt) {
    const M = ISL.fortress, c = PL.mode === 'boat' ? BOAT.pos : PL.pos;
    const d = Math.hypot(c.x - M.x, c.z - M.z);
    const near = 1 - smooth(200, 700, d);
    const strength = F.tower ? lerp(1, 0.45, this.clear || (F.tower ? 1 : 0)) : 1;
    if (!Story.forceStorm) World.stormK = near * strength * (F.end ? 0.2 : 1);
    this.clouds.forEach((g, i) => { g.visible = !F.end && (i >= 26 || !F.tower || this.clear < 1); g.rotation.y += dt * 0.02; if (F.tower && i < 26) g.position.y = lerp(g.position.y, F.tower ? 40 + (i % 5) * 10 - this.clear * 200 : g.position.y, 0.01); });
    // lightning
    World.flash = Math.max(0, (World.flash || 0) - dt * 3);
    if (!F.tower && near > 0.3 && Math.random() < dt * 0.25) {
      World.flash = 0.8; const a = Math.random() * TAU, R = 150 + Math.random() * 150;
      this.bolt.position.set(M.x + Math.cos(a) * R, 60, M.z + Math.sin(a) * R); this.bolt.rotation.z = rnd(-.2, .2); this.bolt.visible = true;
      setTimeout(() => this.bolt.visible = false, 120); setTimeout(() => Audio2.sfx('boom'), 300 + Math.random() * 500);
    }
  },
};
Hooks.barrier = (x, z) => {
  if (F.tower) return null;
  const M = ISL.fortress, dx = x - M.x, dz = z - M.z, d = Math.hypot(dx, dz), R = 300;
  if (d < R) {
    if (!Story.barT || World.t - Story.barT > 6) { Story.barT = World.t; (async () => { if (!Story.cut) { await cut(async () => { await say('leon', 'うっ… あらしが つよすぎて すすめない！ <br><b>3つの しずく</b>を あつめて あらしを けすのだ！'); }); } })(); }
    return { x: M.x + dx / d * R, z: M.z + dz / d * R };
  }
  return null;
};

// ---------------------------------------------------------------- fortress
const Lights = { list: [], build() {
  const M = ISL.fortress;
  for (let i = 0; i < 2; i++) {
    const disc = new THREE.Mesh(new THREE.CircleGeometry(4.6, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xfff6a0, transparent: true, opacity: 0.55, depthWrite: false, fog: false }));
    disc.renderOrder = 2; scene.add(disc);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 4.6, 1, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff6a0, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    scene.add(beam);
    const src = new V3(M.x + (i ? 36 : -36), 13, M.z + 22);
    this.list.push({ disc, beam, src, i, x: 0, z: 0 });
  }
}, update(dt) {
  const M = ISL.fortress; const on = !F.end && F.tower && !F.fortGate;
  for (const L of this.list) {
    L.disc.visible = L.beam.visible = on && (PL.island === M || Math.hypot(PL.pos.x - M.x, PL.pos.z - M.z) < 200);
    if (!L.disc.visible) continue;
    const t = World.t * 0.55 + L.i * 2.6;
    L.x = M.x + Math.sin(t) * 20; L.z = M.z + 18 + Math.cos(t * 0.73 + L.i) * 14;
    const y = groundH(L.x, L.z) + 0.08; L.disc.position.set(L.x, y, L.z);
    const top = L.src, mid = new V3((top.x + L.x) / 2, (top.y + y) / 2, (top.z + L.z) / 2);
    const len = Math.hypot(top.x - L.x, top.y - y, top.z - L.z);
    L.beam.position.copy(mid); L.beam.scale.set(1, len, 1); L.beam.lookAt(top); L.beam.rotateX(Math.PI / 2);
    if (PL.mode === 'foot' && !Story.cut && Math.hypot(PL.pos.x - L.x, PL.pos.z - L.z) < 4.2 && Math.abs(PL.pos.y - y) < 2.5) caught();
  }
} };
async function caught() {
  await cut(async () => {
    Audio2.sfx('spotted'); toast('みつかった！', 1.5);
    lookAtPlayer(5, 2.5, 0.3);
    await say('', '「ブヒッ！ しんにゅうしゃ だブー！」');
    await fade(true, true, 0.5);
    const M = ISL.fortress; placePlayer(M.x + M.spawn.x, M.z + M.spawn.z, Math.PI);
    await fade(false, true, 0.5);
    await say('leon', 'ひかりに みつからないように <b>タイミング</b>を みて すすむのだ！');
  });
}
async function fortArrive() {
  spawnFortEnemies();
  await cut(async () => {
    const M = ISL.fortress;
    camCut(M.x + 30, 40, M.z + 40, M.x, 14, M.z - 20, 1);
    areaBanner(M);
    await wait(2.4);
    camCut(M.x, 30, M.z + 30, M.x, 4, M.z + 18, 1.5);
    await say('leon', 'あの <b>ひかり</b>に みつかると つまみだされて しまう。 ひかりを よけて すすむのだ！');
    await say('leon', 'ひだりおくの <b>さか</b>から うえへ いける。 きを つけるのだぞ、 ふーたん！');
  });
  setObjective();
}
function spawnFortEnemies() {
  Enemies.clear('fort'); const M = ISL.fortress;
  [['boko', -8, -22], ['boko', 8, -28], ['moblin', 2, -14]].forEach(([t, x, z]) => Enemies.spawn(t, M.x + x, M.z + z, { tag: 'fort', leash: 14, aggro: 11 }));
}
async function openFortGate() {
  F.fortGate = 1;
  await cut(async () => {
    const G2 = Puzzle.fortGate, gp = new V3(); G2.g.getWorldPosition(gp);
    camCut(gp.x + 10, gp.y + 6, gp.z + 6, gp.x, gp.y + 1, gp.z, 2);
    await wait(0.6); Audio2.sfx('gate');
    for (let t = 0; t < 1.4; t += 1 / 60) { G2.g.position.y -= 0.06; await wait(1 / 60); }
    G2.col.on = false; G2.g.visible = false;
    await say('leon', 'さかの さきが てっぺんだ！ リッキーは きっと そこに いる！');
  });
  setObjective();
}

// ---------------------------------------------------------------- boss: ガルガ
const Boss = {
  on: false, B: null, hp: 14, st: 'circle', t: 0, ang: 0, mark: null,
  ensureBird() { if (!this.B) { this.B = makeBird(); this.B.g.scale.setScalar(0.9); this.B.g.visible = false; scene.add(this.B.g); } return this.B; },
  arena() { const M = ISL.fortress; return { x: M.x, z: M.z - 42, y: 17 }; },
  update(dt) {
    if (!this.on) return;
    const B = this.B, ar = this.arena(); this.t += dt;
    if (Story.cut) { animBird(B, dt, 1, false); return; }
    const head = new V3(); B.head.getWorldPosition(head); this.headPos = head;
    if (this.st === 'circle') {
      this.ang += dt * 0.6; const tx = ar.x + Math.cos(this.ang) * 24, tz = ar.z + Math.sin(this.ang) * 24;
      B.g.position.lerp(new V3(tx, ar.y + 16, tz), 1 - Math.exp(-2 * dt));
      B.g.rotation.set(0, Math.atan2(-Math.sin(this.ang), Math.cos(this.ang)) + 0.0, -0.3);
      animBird(B, dt, 1, false);
      if (this.t > 3.2) { this.st = 'aim'; this.t = 0; Audio2.sfx('screech'); }
    } else if (this.st === 'aim') {
      const tx = PL.pos.x, tz = PL.pos.z;
      this.mark.visible = true; this.mark.position.x = damp(this.mark.position.x, tx, 4, dt); this.mark.position.z = damp(this.mark.position.z, tz, 4, dt);
      this.mark.position.y = groundH(this.mark.position.x, this.mark.position.z) + 0.1; this.mark.scale.setScalar(1 + Math.sin(this.t * 10) * 0.08);
      B.g.position.lerp(new V3(this.mark.position.x, ar.y + 14, this.mark.position.z - 6), 1 - Math.exp(-2.5 * dt));
      B.g.rotation.set(0.2, 0, 0); animBird(B, dt, 1.8, false);
      if (this.t > 1.9) { this.st = 'dive'; this.t = 0; this.from = B.g.position.clone(); Audio2.sfx('flap'); }
    } else if (this.st === 'dive') {
      const k = Math.min(1, this.t / 0.45), m = this.mark.position;
      B.g.position.set(lerp(this.from.x, m.x, k), lerp(this.from.y, m.y + 3.0, k * k), lerp(this.from.z, m.z - 3.4, k));
      B.g.rotation.set(lerp(0.2, 0.9, k), 0, 0); animBird(B, dt, 0.3, true);
      if (k >= 1) {
        this.st = 'stuck'; this.t = 0; Audio2.sfx('boom'); FX.pop(m.x, m.y + 0.5, m.z, 0xc8b8a0, 16); this.mark.visible = false;
        if (Math.hypot(PL.pos.x - m.x, PL.pos.z - m.z) < 3.2) playerHurt(2, m.x, m.z);
        CAM.lockOn = { x: m.x, z: m.z };
      }
    } else if (this.st === 'stuck') {
      animBird(B, dt, 0.4, true);
      B.g.rotation.z = Math.sin(this.t * 14) * 0.06;
      if (Math.random() < 0.08) FX.spark(head.x + rnd(-1, 1), head.y + 1.5, head.z, 0xffe04a);
      if (this.t > 4.0) { this.st = 'rise'; this.t = 0; CAM.lockOn = null; Audio2.sfx('screech'); }
    } else if (this.st === 'rise') {
      B.g.position.y += dt * 12; B.g.rotation.x = damp(B.g.rotation.x, 0, 3, dt); animBird(B, dt, 2, false);
      // wing gust pushes player back
      if (this.t < 0.6) { const dx = PL.pos.x - B.g.position.x, dz = PL.pos.z - B.g.position.z, d = Math.hypot(dx, dz) || 1; if (d < 8) { PL.kb.x += dx / d * dt * 2; PL.kb.z += dz / d * dt * 2; } }
      if (this.t > 1.4) { this.st = 'circle'; this.t = 0; }
    }
    $('#bosshp').style.width = (this.hp / this.max * 100) + '%';
  },
};
Hooks.swordHit = (test, dmg, spin) => {
  if (!Boss.on || Boss.st !== 'stuck' || !Boss.headPos) return;
  const h = Boss.headPos;
  if (Math.abs(PL.pos.y + 1 - h.y) < 4 && test(h.x, h.z, 1.6)) {
    if (Boss.inv && World.t - Boss.inv < 0.25) return; Boss.inv = World.t;
    Boss.hp -= dmg + (spin ? 1 : 0); Audio2.sfx('hit'); Audio2.sfx('clank'); FX.stars(h.x, h.y, h.z, 0xffffff, 10);
    if (Boss.hp <= 0) { Boss.hp = 0; bossWin(); }
  }
};
async function bossStart() {
  Boss.on = true; Boss.ensureBird(); Boss.max = Boss.hp = 14;
  const ar = Boss.arena(), B = Boss.B;
  if (!Boss.mark) { Boss.mark = new THREE.Mesh(new THREE.RingGeometry(2.2, 3.0, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff3a3a, transparent: true, opacity: 0.8, depthWrite: false })); scene.add(Boss.mark); }
  Boss.mark.visible = false;
  // ricky in a cage
  if (!Boss.cage) {
    const g = new THREE.Group(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; g.add(at(mk(G.cyl(0.07, 0.07, 3, 5), 0x5a5a66, 0.02), Math.cos(a) * 1.3, 1.5, Math.sin(a) * 1.3)); }
    g.add(at(mk(G.cyl(1.5, 1.5, 0.25, 14), 0x4a4a56, 0.03), 0, 3, 0)); g.add(at(mk(G.cyl(1.5, 1.5, 0.25, 14), 0x4a4a56, 0.03), 0, 0.1, 0));
    // nest
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; const s = mk(G.cyl(0.15, 0.15, 3.6, 5), 0x8a6a3a, 0.02); s.position.set(Math.cos(a) * 2.3, 0.3, Math.sin(a) * 2.3); s.rotation.set(Math.sin(a) * 1.3, a, 0.3); g.add(s); }
    g.position.set(ISL.fortress.x + Puzzle.nest.x, 17, ISL.fortress.z + Puzzle.nest.z); scene.add(g); Boss.cage = g;
    addCol(ISL.fortress, Puzzle.nest.x, Puzzle.nest.z, 2.4);
  }
  A.ricky.visible = true; A.ricky.follow = null; A.ricky.pos.set(Boss.cage.position.x, 17, Boss.cage.position.z); A.ricky.fixedY = true; A.ricky.face = 0;
  await cut(async () => {
    Audio2.music('none');
    camCut(PL.pos.x + 3, PL.pos.y + 3, PL.pos.z + 6, A.ricky.pos.x, 18, A.ricky.pos.z, 2);
    await say('ricky', 'ねーねー！！');
    await say('futan', 'リッキー！ いま たすけるからね！');
    Audio2.sfx('screech');
    B.g.visible = true; B.g.position.set(ar.x, ar.y + 50, ar.z - 30);
    camCut(ar.x + 14, ar.y + 6, ar.z + 14, ar.x, ar.y + 10, ar.z - 4, 2);
    for (let t = 0; t < 2; t += 1 / 60) { B.g.position.lerp(new V3(ar.x, ar.y + 9, ar.z - 4), 0.04); B.g.rotation.set(0, 0, 0); animBird(B, 1 / 60, 1.4, true); await wait(1 / 60); }
    await say('garuga', 'ギャオーーーッ！！ <br>（ガルガは おこっている！）');
    await say('leon', '（とおくから） ふーたん！ ガルガが <b>つっこんで</b> きたら よけるのだ！ <br>くちばしが <em>ささって うごけない</em> ときが チャンスだ！');
  });
  $('#bossbar').classList.remove('hide'); Boss.st = 'circle'; Boss.t = 0; Audio2.music('boss');
}
async function bossWin() {
  Boss.on = false; CAM.lockOn = null; $('#bossbar').classList.add('hide'); Boss.mark.visible = false;
  const B = Boss.B;
  await cut(async () => {
    Audio2.music('none'); Audio2.sfx('screech');
    camCut(PL.pos.x + 10, PL.pos.y + 6, PL.pos.z + 10, B.g.position.x, B.g.position.y + 2, B.g.position.z, 2);
    for (let t = 0; t < 1.5; t += 1 / 60) { B.g.rotation.z = Math.sin(t * 30) * 0.3; FX.stars(B.g.position.x, B.g.position.y + 3, B.g.position.z, 0xffffff, 1); await wait(1 / 60); }
    await say('garuga', 'ギャ… ギャオ〜〜ン…！ <br>（ガルガは そらの かなたへ とんで いった！）');
    for (let t = 0; t < 3; t += 1 / 60) { B.g.position.y += 0.5; B.g.position.z -= 1.2; B.g.rotation.x = -0.5; animBird(B, 1 / 60, 2.5, false); await wait(1 / 60); }
    B.g.visible = false;
    Audio2.fanfare('big');
    // open cage
    camCut(Boss.cage.position.x + 6, 21, Boss.cage.position.z + 8, Boss.cage.position.x, 18, Boss.cage.position.z, 2);
    await wait(0.6); Audio2.sfx('open');
    for (let t = 0; t < 1; t += 1 / 60) { Boss.cage.children.slice(0, 11).forEach(c => c.position.y += 0.1); await wait(1 / 60); }
    Boss.cage.visible = false;
    // ricky runs to futan
    const from = A.ricky.pos.clone(); const to = new V3(PL.pos.x + Math.sin(PL.face) * 1.3, PL.pos.y, PL.pos.z + Math.cos(PL.face) * 1.3);
    A.ricky.face = Math.atan2(to.x - from.x, to.z - from.z);
    for (let t = 0; t <= 1; t += 1 / 100) { A.ricky.pos.lerpVectors(from, to, t); A.ricky.pos.y = groundH(A.ricky.pos.x, A.ricky.pos.z) + Math.abs(Math.sin(t * 30)) * 0.15; await wait(1 / 60); }
    facePlayerTo(A.ricky.pos.x, A.ricky.pos.z);
    lookAtPlayer(5, 2, 1.2);
    Audio2.music('ending');
    await say('ricky', 'ねーねー！ こわかったよー！');
    await say('futan', 'リッキー！ もう だいじょうぶ！ いっしょに おうちに かえろう！');
    await say('ricky', 'ねーね、 <b>ゆうしゃ</b>みたい！ かっこいい！');
    F.end = 1; S.hp = S.maxHp; saveGame();
    await fade(true, false, 1.2);
    // sunset sail
    setMood('sunset', true); World.stormK = 0; Story.forceStorm = true;
    PL.mode = 'boat'; refreshGear(); const H = ISL.home;
    placeBoat(H.x + 40, H.z - 160, Math.PI * 0.95); World.wind.dir = BOAT.head;
    A.ricky.follow = () => new V3(BOAT.pos.x + Math.sin(BOAT.head) * 0.6, BOAT.pos.y + 0.55, BOAT.pos.z + Math.cos(BOAT.head) * 0.6); A.ricky.look = false;
    BOAT.auto = { x: H.x + 3, z: H.z + 40, sail: 1 };
    await fade(false, false, 1.2);
    for (let t = 0; t < 2.5; t += 1 / 60) { camCut(BOAT.pos.x + 12, 6, BOAT.pos.z + 4, BOAT.pos.x, 2, BOAT.pos.z, 3, t === 0); await wait(1 / 60); }
    await say('leon', 'ふーたん、 よく がんばったな。 きみは ほんとうの <b>かぜの ゆうしゃ</b>だ。');
    await say('futan', 'レオンの おかげだよ！ ありがとう！');
    await say('ricky', 'レオン、 ありがと！');
    await say('leon', 'さあ、 みんなが まっている。 かえろう、 <b>ふーたんの しま</b>へ！');
    await fade(true, false, 1.0);
    BOAT.auto = null; Story.forceStorm = false;
    // party at home
    setMood('dusk', true);
    PL.mode = 'foot'; refreshGear(); placePlayer(H.x + 4, H.z + 18, Math.PI);
    placeBoat(H.x + 3.4, H.z + 58, Math.PI);
    A.ricky.follow = null; A.ricky.look = true; A.ricky.fixedY = false; A.ricky.pos.set(H.x + 6, 0, H.z + 16.5);
    A.baaba.pos.set(H.x + 2, 0, H.z + 13); A.jiiji.pos.set(H.x + 7, 0, H.z + 13); A.shop.pos.set(H.x - 1, 0, H.z + 15); A.kid1.pos.set(H.x + 9, 0, H.z + 17);
    if (!Story.cake) { const c = new THREE.Group(); c.add(at(mk(G.cyl(0.8, 0.8, 0.6, 16), 0xfff0f4, 0.03), 0, 0.3, 0)); c.add(at(mk(G.cyl(0.82, 0.82, 0.12, 16), 0xff7aa0, 0.02), 0, 0.62, 0)); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; c.add(at(mk(G.cyl(0.04, 0.04, 0.3, 5), 0x9ad0ff, 0.01), Math.cos(a) * 0.5, 0.85, Math.sin(a) * 0.5)); const f = flame(0.12); f.position.set(Math.cos(a) * 0.5, 1.0, Math.sin(a) * 0.5); c.add(f); } c.add(at(mk(G.cyl(1.4, 1.4, 0.1, 16), 0xb07a44, 0.03), 0, -0.05, 0)); c.position.set(H.x + 4.5, groundH(H.x + 4.5, H.z + 14.5) + 0.7, H.z + 14.5); scene.add(c); Story.cake = c; const tb = mk(G.cyl(0.25, 0.3, 0.7, 8), 0x8a5a34, 0.03); tb.position.set(H.x + 4.5, groundH(H.x + 4.5, H.z + 14.5) + 0.35, H.z + 14.5); scene.add(tb); }
    PL.face = Math.PI; camCut(H.x + 4, 5, H.z + 26, H.x + 4.5, 1.5, H.z + 14, 2, true);
    await fade(false, false, 1.0);
    await say('baaba', 'おかえり ふーたん、 リッキー！ <br>あらためて… <b>おたんじょうび おめでとう</b>！');
    Audio2.sfx('cheer');
    await say('jiiji', 'わっはっは！ きょうは ふーたんの おたんじょうびと ゆうしゃの おいわいじゃ！');
    await say('ricky', 'ねーね、 おたんじょうび おめでとう！ だいすき！');
    await say('futan', 'みんな ありがとう！ ふーたん、 5さいの おたんじょうび いちばん すてきな ひに なったよ！');
    await wait(0.5);
    await showEnding();
    setMood('day');
  });
  Audio2.music('island'); setObjective();
}
