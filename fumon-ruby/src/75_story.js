// ================================================================ story scripts
const LEADERS = [
  {
    name: 'ジムリーダー ゴロタ', ch: 'gorota', badge: 'ゴツゴツバッジ', party: [[15, 10], [23, 11], [15, 12]], money: 1200,
    pre: ['よく きたな、 ちいさな チャレンジャー！', 'わしは はなさきジムの リーダー ゴロタ！ いわのように かたい ハートで、 しょうぶ だ！'],
    win: 'ぬう…… みごとだ！ この バッジを うけとれ！',
    after: 'いわは かたいが、 みずや くさには よわい。 タイプを かんがえて たたかうんだぞ。 つぎは ひがしの うみかぜシティを めざすと いい！',
    reward: [['great', 3]],
  },
  {
    name: 'ジムリーダー ピカリ', ch: 'pikari', badge: 'ピカピカバッジ', party: [[13, 15], [17, 15], [14, 17]], money: 2000,
    pre: ['きゃはっ！ チャレンジャー だね！', 'あたしは うみかぜジムの ピカリ！ でんきみたいに ビリビリ もえる しょうぶ、 しよっ！'],
    win: 'ビリビリ〜！ まけちゃった！ はい、 これ あげる！',
    after: 'きたの えんとつやまに カザンだんが あつまってるって。 きをつけてね！',
    reward: [['superpotion', 3]],
  },
  {
    name: 'ジムリーダー ホムラ', ch: 'homura', badge: 'メラメラバッジ', party: [[21, 23], [21, 24], [4, 26]], money: 2800,
    pre: ['あつい あつい ジムへ ようこそ！', 'あたしは ホムラ！ ほのおの ように あつい ハートで いくよ！ もえろー！'],
    win: 'あっつ〜…… まいった！ あなたの ほうが あつかったね！',
    after: 'カザンだんが ひがしの いせきへ むかったって！ ルビドンを めざめさせる つもりよ。 おねがい、 とめて！',
    reward: [['ultra', 2], ['revive', 1]],
  },
];
async function gymLeader(i) {
  const L = LEADERS[i];
  const who = L.name.replace('ジムリーダー ', '');
  if (G.badges[i]) { await say(L.after, { who }); return; }
  AU.bgm('boss');
  for (const s of L.pre) await say(s, { who });
  const won = await battle({ trainer: { name: L.name, ch: L.ch, party: L.party, money: L.money, music: 'boss', win: L.win } });
  if (!won) return;
  G.badges[i] = true;
  AU.stopBgm(); AU.jingle('badge');
  await say(`ふーたんは ${who}から ${L.badge}を もらった！`);
  await wait(30);
  for (const [k, n] of L.reward) { addItem(k, n); AU.fanfare('item'); await say(`${who}「これも もっていって！」 ……ふーたんは ${ITEMS[k].n} ×${n} を もらった！`); }
  AU.bgm(mapBgm());
  await say(L.after, { who });
}
function rivalStarter() { return { 1: 5, 3: 1, 5: 3 }[G.starter] || 5; }
function rivalParty(n) {
  const s = rivalStarter();
  if (n === 1) return [[s, 5]];
  return [[10, 29], [22, 30], [14, 30], [s + 1, 32]];
}
// ------------------------------------------------------------ intro
async function profIntro() {
  MODE = 'intro';
  let show = 'prof', monA = 0, prof = 1;
  const L = pushUnder(() => {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#182040'); g.addColorStop(1, '#402858'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.ellipse(120, 96, 30 + i * 14, 8 + i * 4, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#c8b8e8'; ctx.beginPath(); ctx.ellipse(120, 96, 50, 10, 0, 0, 7); ctx.fill();
    if (show === 'prof' || show === 'both') { ctx.globalAlpha = prof; ctx.drawImage(portrait('prof'), 88, 34); ctx.globalAlpha = 1; }
    if (show === 'both' && monA > 0) { const s = 40 * monA; ctx.drawImage(monImg(22), 168 - s / 2, 98 - s, s, s); }
    if (show === 'futan') { ctx.globalAlpha = prof; ctx.drawImage(portrait('futan'), 88, 34); ctx.globalAlpha = 1; }
  });
  AU.bgm('center');
  await fadeIn(20);
  const w = { who: 'キノミはかせ' };
  await say('やあ！ ふーモンの せかいへ ようこそ！', w);
  await say('わたしの なまえは キノミ。 みんなからは ふーモン はかせと よばれて おるよ。', w);
  show = 'both'; AU.sfx('pop'); for (let i = 1; i <= 10; i++) { monA = i / 10; await tick(); } AU.cry(22);
  await say('この せかいには ふーモン という ふしぎな いきものが あちこちに すんでいる！', w);
  await say('ひとと ふーモンは なかよく いっしょに くらしたり、 しょうぶを して あそんだり しているんだ。', w);
  await say('わたしは その ふーモンの ことを しらべて いるんだよ。', w);
  for (let i = 10; i >= 0; i--) { prof = i / 10; await tick(); }
  show = 'futan'; for (let i = 0; i <= 10; i++) { prof = i / 10; await tick(); }
  await say('さて、 きみの なまえは……', w);
  await say('ふーたん！ ようちえんの ふーたん ちゃんだね！', w);
  await say('きょうから きみの ふーモン ものがたりが はじまる！ ゆめと ぼうけんの せかいへ、 レッツゴー！', w);
  AU.sfx('swirl');
  for (let i = 10; i >= 0; i--) { prof = i / 10; await tick(); }
  await fadeOut(20);
  popLayer(L);
  MODE = 'field';
}
async function introTruck() {
  if (flag('truckStop')) return;
  F.lock++;
  AU.stopBgm();
  for (let i = 0; i < 3; i++) { F.shake = 20; AU.sfx('bump'); await wait(30); }
  await say('ガタン…… ゴトン……');
  await say('ふーたんは ひっこしの トラックに ゆられている。');
  for (let i = 0; i < 2; i++) { F.shake = 16; AU.sfx('bump'); await wait(26); }
  await wait(30);
  AU.sfx('door');
  await say('……トラックが とまった！ したの でぐちから そとへ でよう！（したに あるこう）');
  setFlag('truckStop');
  F.lock--;
}
async function townEnter() {
  if (flag('arrived')) return;
  setFlag('arrived');
  AU.bgm('town');
  const mom = ent('momOut'); if (!mom) return;
  await wait(20);
  await emote(mom, '!', 30);
  await walk(mom, 'DD');
  const w = { who: 'ママ' };
  await say('ふーたん、 おつかれさま！ ながい ドライブ だったわね。', w);
  await say('ここが あたらしい おうちの ある まち、 どんぐりタウンよ！', w);
  await say('さあ、 おうちに はいって みましょう！ ママ さきに いってるわね。', w);
  await walk(mom, 'UURUU');
  AU.sfx('door'); mom.vis = false;
}
async function homeEnter() {
  if (flag('momHome')) return;
  setFlag('momHome');
  const mom = ent('mom');
  const w = { who: 'ママ' };
  await say('ふーたん、 いらっしゃい！ ここが あたらしい おうちよ！ ステキでしょう？', w);
  await say('おとうとの リッキーも うれしそうに はいはい してるわ。', w);
  await say('そうそう！ ひっこし おいわいに、 これを あげる！', w);
  addItem('shoes'); AU.fanfare('item');
  await say('ふーたんは ランニングシューズを もらった！');
  await say('Bボタンを おしたまま あるくと、 びゅーんと はやく はしれるのよ！', w);
  await say('SELECTボタンを おすと、 ずっと はしったままにも できるわ！', w);
  await say('それから おとなりの キノミはかせに ごあいさつ してきてね。 はかせの けんきゅうじょは まちの みなみがわよ。', w);
}
async function momTalk() {
  const w = { who: 'ママ' };
  if (flag('champion')) { await say('ふーたん、 チャンピオン おめでとう！ ママ、 とっても ほこらしいわ！', w); }
  else if (flag('starter')) {
    await say('まあ、 ふーモンを もらったの？ よかったわね！', w);
    await say('つかれたら いつでも おうちで やすんで いってね。', w);
    AU.stopBgm(); AU.jingle('heal'); await wait(100); AU.bgm(mapBgm());
    for (const m of G.party) healMon(m);
    await say('ふーモンたちは すっかり げんきに なった！');
  } else await say('キノミはかせの けんきゅうじょは まちの みなみがわよ。 ごあいさつ してきてね。', w);
}
async function profTalk() {
  const w = { who: 'キノミはかせ' };
  const c = Object.keys(G.caught).length;
  await say(`ずかんを みせて くれるかな？ ……ほう！ つかまえた ふーモンは ${c}ひき！`, w);
  await say(c >= 15 ? 'すばらしい！ りっぱな ふーモン はかせに なれるぞ！' : c >= 8 ? 'いい ちょうしだ！ この ちょうしで いろんな ふーモンに あって みよう！' : 'まだまだ これから！ くさむらや どうくつで いろんな ふーモンを さがして みよう！', w);
}
// ------------------------------------------------------------ starter
async function chooseStarter() {
  const opts = [1, 3, 5];
  let sel = 0;
  const L = pushLayer(() => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#a05828'; ctx.beginPath(); ctx.ellipse(120, 62, 100, 50, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#c87038'; ctx.beginPath(); ctx.ellipse(120, 58, 94, 44, 0, 0, 7); ctx.fill();
    opts.forEach((sp, i) => {
      const x = 52 + i * 68, y = 54;
      if (i === sel) { ctx.fillStyle = 'rgba(255,240,160,0.5)'; ctx.beginPath(); ctx.arc(x, y, 26, 0, 7); ctx.fill(); }
      const b = i === sel ? Math.floor(frame / 8) % 2 : 0;
      ctx.drawImage(monImg(sp), x - 26, y - 34 - b, 52, 52);
      drawBallIcon(x - 6, y + 18, 12);
    });
    const sp = opts[sel], m = MON[sp];
    win(36, 112, 168, 44, WS.menu);
    txt(m.name, 46, 118); ctx.fillStyle = TYPE_COL[m.t[0]]; ctx.fillRect(150, 119, 46, 12); txt(m.t[0], 173, 119, '#fff', 'rgba(0,0,0,.3)', 10, 'center');
    txt(['くさタイプ。 すばやくて げんき！', 'ほのおタイプ。 ちから もち！', 'みずタイプ。 がんばりやさん！'][sel], 46, 136, '#303038', '#d0d0d8', 10);
  });
  for (; ;) {
    await tick();
    const o = sel;
    if (btnr('R')) sel = (sel + 1) % 3;
    if (btnr('L')) sel = (sel + 2) % 3;
    let go = btnp('A');
    if (IN.tap) for (let i = 0; i < 3; i++) if (tapIn(52 + i * 68 - 30, 14, 60, 70)) { if (sel === i) go = true; sel = i; }
    if (o !== sel) { AU.sfx('sel'); AU.cry(opts[sel]); }
    if (go) {
      AU.sfx('ok');
      popLayer(L);
      await say(`${MON[opts[sel]].name}に きめる？`, { keep: true });
      const ok = await yesno(); closeMsg();
      if (ok) return opts[sel];
      pushLayer(L);
    }
  }
}
async function route1Enter() {
  if (flag('starter')) return;
  F.lock++;
  const prof = ent('prof'), dog = ent('wildpochi');
  AU.bgm('kazan');
  await wait(20);
  await say('「うわー！ だれか たすけてー！」', { who: '？？？' });
  const px = F.pl.x;
  await walk(F.pl, 'UU');
  for (let i = 0; i < 2; i++) {
    await walk(prof, 'L', 2); await walk(dog, 'D', 2); await walk(dog, 'L', 2); await walk(dog, 'U', 2);
    await walk(prof, 'R', 2); await walk(dog, 'R', 2);
  }
  prof.dir = 'D';
  await emote(prof, '!', 30);
  const w = { who: 'はかせ' };
  await say('おお、 そこの きみ！ たすけて おくれ！', w);
  await say('そこに ある わたしの かばんの なかに ボールが はいってる！ なかの ふーモンを つかって たたかうんだ！', w);
  const sp = await chooseStarter();
  G.starter = sp;
  const m = makeMon(sp, 5); G.party = [m]; G.seen[sp] = true;
  await say(`ふーたんは ${MON[sp].name}を くりだした！`);
  const won = await battle({ wild: makeMon(7, 2), tutorial: true });
  G.caught[sp] = true;
  setFlag('starter');
  await say('ふう……！ たすかったよ！ ありがとう！', w);
  await say('きみは…… となりに ひっこして きた ふーたん ちゃん だね！ ここでは なんだから、 けんきゅうじょへ いこう！', w);
  F.lock--;
  await warp('lab', 5, 4, 'U');
  F.lock++;
  const W2 = { who: 'キノミはかせ' };
  await say('あらためて、 さっきは ありがとう！ わたしが キノミはかせだ。', W2);
  await say(`きみの たたかいぶり、 すばらしかった！ その ${MON[sp].name}は、 きみに あげよう！`, W2);
  AU.fanfare('caught');
  await say(`ふーたんは はかせから ${MON[sp].name}を もらった！`);
  await say('それから これも。 ふーモンずかん だ！ あった ふーモンを じどうで きろく してくれる すごい きかいなんだよ。', W2);
  setFlag('dex'); AU.fanfare('item');
  await say('ふーたんは ふーモンずかんを もらった！');
  addItem('ball', 5); addItem('potion', 3);
  await say('ふーモンボール ×5 と きずぐすり ×3 も もっていきなさい！ よわらせた やせいの ふーモンに ボールを なげると つかまえられるぞ。', W2);
  await say('STARTボタンで メニューが ひらけるよ。 「レポート」で きろくを のこせるからね。', W2);
  await say('そうそう、 わたしの こどもの ソウタが 1ばんどうろの きたの ほうで ふーモンを しらべている。 あいに いってごらん！', W2);
  G.center = { map: 'home1', x: 4, y: 4 };
  F.lock--;
}
async function rivalBattle1() {
  const s = ent('sota'); if (!s) return;
  AU.bgm('trainer');
  await emote(s, '!', 30);
  s.dir = dirTo(s, F.pl);
  const w = { who: 'ソウタ' };
  await say('あ！ きみが となりに ひっこして きた ふーたん？ ぼく ソウタ！', w);
  await say('おとうさんから ふーモンを もらったんだね！ ……ねえ、 ぼくと しょうぶ しよう！', w);
  const won = await battle({ trainer: { name: 'ソウタ', ch: 'sota', party: rivalParty(1), money: 300, win: 'わあ…… ふーたん、 つよいね！' } });
  if (!won) return;
  setFlag('rival1');
  await say('ふーたん すごいや！ ぼくも まけないように がんばるね！', w);
  await say('この さきの はなさきシティには ジムが あるんだ。 ジムリーダーに かつと ジムバッジが もらえるよ！', w);
  await say('じゃあね！ また しょうぶ しよう！', w);
  await walk(s, 'UU', 2); s.vis = false;
}
async function giftYumeusa() {
  const w = { who: 'おねえさん' };
  if (flag('gift_yume')) { await say('ゆめうさは げんき？ かわいがって あげてね！', w); return; }
  await say('こんにちは！ うちの ゆめうさが たくさん こどもを うんだの。', w);
  await say('よかったら ひとり つれて いって くれない？', { keep: true, who: 'おねえさん' });
  if (!(await yesno())) { closeMsg(); await say('そう…… きが かわったら また きてね。', w); return; }
  closeMsg();
  const m = makeMon(18, 12);
  G.seen[18] = true; G.caught[18] = true;
  AU.fanfare('caught');
  if (G.party.length < 6) { G.party.push(m); await say('ふーたんは ゆめうさを もらった！'); }
  else { G.box.push(m); await say('ふーたんは ゆめうさを もらった！ （パソコンの ボックスに おくられた）'); }
  setFlag('gift_yume');
  await say('ゆめうさは エスパータイプ。 ふしぎな ちからで たたかうのよ！', w);
}
// ------------------------------------------------------------ team kazan
async function bossVolcano() {
  const boss = ent('boss');
  F.pl.wasMoving = false;
  AU.bgm('kazan');
  await emote(boss, '!', 30);
  const w = { who: 'ドカン' };
  await say('なんだ？ こどもが こんな ところまで のぼって きたのか？', { who: '？？？' });
  await say('わしは カザンだんの ボス、 ドカン！', w);
  await say('この あかいたまに やまの ちからを ためて、 だいちを もっと もっと ひろげるのだ！', w);
  await say('うみなんか ぜんぶ じめんに なれば いい！ そうすれば カザンだんの おおきな くにが できるのだ！ がっはっは！', w);
  await say('じゃまを するなら、 こどもでも よういしゃ しないぞ！', w);
  const won = await battle({ trainer: { name: 'カザンだんの ボス ドカン', ch: 'boss', party: [[21, 20], [20, 20], [15, 21]], money: 2000, music: 'boss', win: 'ぐぬぬぬ……！ こ、 こむすめ めー！' } });
  if (!won) return;
  await say('ぐぬぬ……！ だが あかいたまの ちからは もう じゅうぶん たまったわ！', w);
  await say('つぎは ひがしの ふるい いせきで、 でんせつの ふーモン ルビドンを めざめさせて やる！', w);
  await say('そうすれば だいちは どこまでも ひろがるのだ！ わっはっは！ さらばだ！', w);
  await fadeOut(16);
  setFlag('boss1');
  for (const id of ['boss', 'vg1', 'vg2', 'vgate']) { const e = ent(id); if (e) e.vis = false; }
  AU.bgm('route');
  await fadeIn(16);
  await say('カザンだんは どこかへ いって しまった……。 ひがしの みちが とおれる ように なった！');
}
async function ruinsEvent() {
  const boss = ent('boss2'), rb = ent('rubidon');
  F.pl.wasMoving = false;
  AU.bgm('kazan');
  await wait(10);
  boss.dir = 'D';
  await emote(boss, '!', 30);
  const w = { who: 'ドカン' };
  await say('また きたのか、 こむすめ！ だが もう おそい！', w);
  await say('みるが いい！ これが だいちの かみさま…… でんせつの ふーモン、 ルビドンだ！', w);
  boss.dir = 'U';
  await say('あかいたまよ！ ルビドンを めざめさせろー！', w);
  AU.stopBgm();
  for (let i = 0; i < 4; i++) { UI.flash = 0.8; F.tint = 'rgba(255,40,40,0.25)'; await wait(8); F.tint = null; await wait(8); }
  AU.sfx('quake'); F.shake = 90;
  F.tint = 'rgba(255,60,30,0.22)';
  await wait(50);
  AU.cry(24, 0.6); await wait(30); AU.cry(24, 0.5);
  AU.bgm('legend');
  await say('ゴゴゴゴゴ……！！');
  await say('ルビドンが めを さました！');
  F.shake = 40; AU.sfx('quake');
  await say('な、 なんという ちからだ……！ あかいたまでも おさえきれん！', w);
  await say('う、 うわああ！ あついっ！ た、 たすけてー！', w);
  AU.sfx('run'); UI.flash = 0.6; boss.vis = false;
  await say('ドカンは にげだして しまった！');
  await wait(20);
  // champion arrives
  const ruri = mkEnt({ id: 'ruri', ch: 'ruri', x: 7, y: 14, dir: 'U' }); F.ents.push(ruri);
  await walk(ruri, 'UUU', 2);
  ruri.dir = dirTo(ruri, F.pl);
  const r = { who: 'ルリ' };
  await say('たいへん！ ルビドンの ちからで、 そとの おひさまが ギラギラ…… どんどん あつく なってる！', r);
  await say('わたしは ふーモンリーグの チャンピオン、 ルリ。', r);
  await say('ふーたん ちゃん、 あなたと ふーモンたちの ちからで ルビドンを しずめて！ よわらせて ボールで つかまえる ことも できるわ！', r);
  await say('ルビドンが こちらを にらんでいる……！');
  F.tint = null;
  const won = await battle({ wild: makeMon(24, 30), legend: true, music: 'boss', env: 'ruin' });
  if (G.lastResult === 'lose') { return; }
  const caught = G.lastResult === 'caught';
  if (caught) { setFlag('rubidonCaught'); rb.vis = false; }
  else { await say('ルビドンは おとなしく なり、 しずかに ねむりに ついた……'); }
  setFlag('rubidon');
  AU.bgm('cave');
  ruri.dir = dirTo(ruri, F.pl);
  await say('すごい……！ おひさまが やさしく なったわ。 だいちが おちついたのね！', r);
  if (caught) await say('ルビドンも あなたを みとめた みたい。 たいせつに してあげてね。', r);
  await say('ふーたん ちゃん、 あなたは ほんとうに つよい トレーナーね。', r);
  await say('いせきの きたに ある ふーモンリーグで まってるわ。 こんどは チャンピオンとして しょうぶ しましょう！', r);
  await walk(ruri, 'DDD', 2); ruri.vis = false;
  addItem('hyperpotion', 2);
  await say('いせきの そとへ でると、 きたの みちが ひらけている！');
}
async function rubidonAgain() {
  await say('ルビドンが しずかに ねむっている……。 そっと ちかづいて みますか？', { keep: true });
  if (!(await yesno())) { closeMsg(); return; }
  closeMsg();
  AU.cry(24, 0.6);
  await battle({ wild: makeMon(24, 30), legend: true, music: 'boss', env: 'ruin' });
  if (G.lastResult === 'caught') { setFlag('rubidonCaught'); const e = ent('rubidon'); if (e) e.vis = false; }
  else if (G.lastResult === 'win') await say('ルビドンは また ねむりに ついた……');
}
// ------------------------------------------------------------ league
async function rivalLeaguePost() {
  const s = ent('sota2');
  await say('ぼく、 もっと もっと ふーモンと なかよく なるよ。 チャンピオンは この おくだ。 いってらっしゃい！', { who: 'ソウタ' });
  await walk(s, 'R'); s.dir = 'L';
}
async function championBattle() {
  const r = ent('ruri');
  F.pl.wasMoving = false;
  AU.bgm('legend');
  const w = { who: 'ルリ' };
  await say('ようこそ、 ふーたん ちゃん。 まってたわ。', w);
  await say('あなたが ルビドンを しずめて くれた おかげで、 だいちも うみも なかよく なれたの。', w);
  await say('でも ここは ふーモンリーグ。 チャンピオンの わたしと、 ほんきの しょうぶよ！', w);
  const won = await battle({ trainer: { name: 'チャンピオン ルリ', ch: 'ruri', party: [[17, 31], [19, 32], [10, 32], [25, 34]], money: 5000, music: 'boss', win: '……みごとだわ。 あなたの かちよ！' } });
  if (!won) return;
  setFlag('champion');
  await say('おめでとう、 ふーたん ちゃん！ あなたが あたらしい ふーモンリーグ チャンピオンよ！', w);
  await say('さあ、 でんどういりの へやへ いきましょう。 あなたと ふーモンたちの なまえを のこすの！', w);
  await hallOfFame();
}
async function hallOfFame() {
  await fadeOut(20);
  MODE = 'hof';
  AU.bgm('victory');
  let cur = -1, all = false, t = 0;
  const L = pushUnder(() => {
    t++;
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#201040'); g.addColorStop(1, '#503078'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 30; i++) { const x = (i * 71 + t * 0.3) % W, y = (i * 43) % 110; ctx.fillStyle = (i + (t >> 3)) % 3 ? '#fff8c0' : '#a0c0ff'; ctx.fillRect(x, y, 1, 1); }
    ctx.fillStyle = 'rgba(255,240,160,0.15)'; ctx.beginPath(); ctx.moveTo(120, 0); ctx.lineTo(60, 120); ctx.lineTo(180, 120); ctx.fill();
    ctx.fillStyle = '#e8c048'; ctx.beginPath(); ctx.ellipse(120, 104, 90, 12, 0, 0, 7); ctx.fill();
    if (all) {
      G.party.forEach((m, i) => { const n = G.party.length, x = 120 + (i - (n - 1) / 2) * 36; ctx.drawImage(monImg(m.sp), x - 20, 64, 40, 40); });
      ctx.drawImage(portrait('futan'), 104, 20, 32, 32);
    } else if (cur >= 0) {
      const m = G.party[cur]; ctx.drawImage(monImg(m.sp), 88, 40);
      win(150, 40, 86, 34, WS.menu); txt(monName(m), 158, 46, '#303038', '#d0d0d8', 10); txt('Lv' + m.lv, 158, 58, '#303038', '#d0d0d8', 10);
    }
    txt('でんどういり', 120, 4, '#fff8a0', '#603010', 14, 'center');
  });
  await fadeIn(20);
  for (cur = 0; cur < G.party.length; cur++) { AU.cry(G.party[cur].sp); UI.flash = 0.5; await wait(80); }
  all = true; UI.flash = 1;
  await say('ふーたんと ふーモンたちは でんどういりを はたした！ おめでとう！');
  await fadeOut(30);
  popLayer(L);
  await credits();
}
async function credits() {
  MODE = 'credits';
  AU.bgm('ending');
  const lines = [
    'ふーモン ルビー', '〜ふーたんと だいちの ルビドン〜', '', '',
    'しゅじんこう', 'ふーたん', '', 'ママ ・ リッキー', '', 'キノミはかせ ・ ソウタ', '',
    'ジムリーダー', 'ゴロタ ・ ピカリ ・ ホムラ', '', 'カザンだん', 'ボス ドカン と したっぱの みんな', '',
    'チャンピオン', 'ルリ', '', 'でんせつの ふーモン', 'ルビドン', '', '',
    'そして……', 'いっしょに ぼうけん してくれた', 'きみの ふーモンたち！', '', '',
    'あそんで くれて ありがとう！', '', 'おしまい',
  ];
  let y = H + 10;
  const L = pushUnder(() => {
    ctx.fillStyle = '#100818'; ctx.fillRect(0, 0, W, H);
    lines.forEach((s, i) => { const yy = y + i * 18; if (yy > -20 && yy < 112) txt(s, 120, yy, i === 0 ? '#ff6080' : '#ffffff', '#402040', i === 0 ? 16 : 11, 'center'); });
    ctx.fillStyle = '#1c1028'; ctx.fillRect(0, 122, W, 38); G.party.forEach((m, i) => { const x = 120 - G.party.length * 19 + i * 38 + 3; ctx.drawImage(monImg(m.sp), x, 124 - (Math.floor(frame / 10 + i) % 2), 32, 32); });
  });
  await fadeIn(20);
  const end = -(lines.length * 18) + 60;
  while (y > end) { y -= btn('A') ? 1.5 : 0.35; await tick(); }
  await wait(120);
  await waitOK();
  await fadeOut(30);
  popLayer(L);
  // after credits: wake up at home
  for (const m of G.party) healMon(m);
  MODE = 'field';
  loadMap('home1', 4, 4, 'D');
  G.center = { map: 'home1', x: 4, y: 4 };
  store.set(SAVE_KEY, serialize());
  await fadeIn(20);
  await say('……ぼうけんの きろくは じどうで レポートに かかれた！');
  await say('ママ「おかえり、 チャンピオン！ これからも ふーモンたちと たくさん あそんでね！」');
}
