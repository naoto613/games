/* 反応ルール（どこでも起きる遊び：見立て・役割・組み合わせ・連鎖） */
'use strict';
(() => {
  const W = PT.world, R = PT.R, D = R.D, X = PT.FX;
  const isP = (e, t) => e && e.kind === 'prop' && (Array.isArray(t) ? t.includes(e.type) : e.type === t);
  const isC = (e) => e && e.kind === 'char';
  const tag = (e, t) => e && W.has(e, t);
  const nearP = (x, y, r, pred) => W.near(x, y, r, (e) => e.kind === 'prop' && pred(e));
  const nearF = (x, y, r, t) => W.near(x, y, r, (e) => e.kind === 'fix' && W.has(e, t));
  const firstP = (x, y, r, types, excl) => nearP(x, y, r, (p) => p !== excl && (Array.isArray(types) ? types.includes(p.type) : p.type === types))[0] || null;
  const role = (r) => W.chars().find((c) => c.role === r && !c.hidden) || null;
  const pos = (e) => ({ x: e.x, y: e.y });
  R.h = { isP, isC, tag, nearP, nearF, firstP, role };

  /* ================= 発見リスト（どこでも） ================= */
  D('d_eat', 'もぐもぐ おいしい', 'たべものを わたすと おいしそうに たべるよ', ['apple', 'pon']);
  D('d_share', 'はんぶんこ', 'たべていると おともだちが「いいなー」。はんぶんこ してあげたよ', ['banana', 'choco', 'pon']);
  D('d_mokoparty', 'モコの みんなで たべよう', 'モコは たべものを みつけると みんなを よぶよ', ['onigiri', 'moko']);
  D('d_cook', 'おりょうりごっこ', 'おさらを おくと おりょうりが はじまる。できあがったのは…？', ['plate', 'mimi']);
  D('d_meal', 'いただきます', 'おさらと たべものを ならべたら、みんなで ごはん', ['plate', 'apple', 'moko']);
  D('d_restaurant', 'レストランごっこ', 'コックさんが おさらに りょうりを のせて はこんでくれる', ['chef', 'plate', 'onigiri']);
  D('d_picnic', 'ピクニック', 'シートや パラソルと たべもので ピクニックの はじまり', ['sheet', 'onigiri', 'moko']);
  D('d_fort', 'ひみつきち', 'もうふを ソファや テーブルに かけると ひみつきちに！', ['blanket', 'lulu']);
  D('d_shadow', 'かげえあそび', 'ひみつきちや テントに かいちゅうでんとうを おくと かげえが はじまる', ['flashlight', 'blanket']);
  D('d_ghost', 'おばけごっこ', 'もうふを かぶったら おばけに へんしん！', ['blanket', 'pon']);
  D('d_nap', 'すやすや おひるね', 'もうふや クッションで ねんね', ['cushion', 'moko']);
  D('d_light', 'ピカッ！', 'かいちゅうでんとうで ともだちを てらしたよ', ['flashlight', 'gaku']);
  D('d_dino', 'きょうりゅうごっこ', 'きょうりゅうを もったら「がおー！」みんな にげろー', ['dino', 'pon']);
  D('d_tanken', 'たんけんたい しゅっぱつ', 'ぼうし・リュック・かいちゅうでんとう。みんなで たんけんへ', ['explorer', 'bag', 'flashlight']);
  D('d_boxcar', 'だんボールの くるま', 'だんボールに はいって ぶーぶー！', ['box', 'pon']);
  D('d_boxboat', 'だんボールの ふね', 'みずの ちかくの だんボールは ふねに なる', ['box', 'duck']);
  D('d_rocket', 'だんボール ロケット', 'だんボールに おほしさまや ヘルメットで うちゅうへ はっしゃ！', ['box', 'star', 'helmet']);
  D('d_boxshop', 'だんボールの おみせ', 'だんボールと エプロンで おみせやさん', ['box', 'apron']);
  D('d_robot', 'だんボール ロボット', 'だんボールを ふたつ かさねたら ガクが ロボットを つくった', ['box', 'box', 'gaku']);
  D('d_hat', 'たんけんの ポーズ', 'ぼうしを かぶって ポーズ。だれかが まねするかも', ['explorer', 'lulu']);
  D('d_mimic', 'チョコの まねっこ', 'チョコは みんなの うごきを まねするのが だいすき', ['choco', 'star']);
  D('d_shop', 'おみせやさんごっこ', 'エプロンを つけたら てんいんさん。おきゃくさんが やってくる', ['apron', 'counter']);
  D('d_buy', 'おかいもの', 'かいものかごを わたすと おかいものを はじめる', ['basket', 'apple']);
  D('d_chef', 'コックさん', 'コックさんの ぼうしで りょうりにんに へんしん', ['chef', 'moko']);
  D('d_doctor', 'おいしゃさんごっこ', 'おいしゃさんセットで「もしもし」。いたいの とんでけー', ['doctor', 'mimi']);
  D('d_plushdoc', 'ぬいぐるみの しんさつ', 'ぬいぐるみの かんじゃさんを みてあげたよ', ['doctor', 'teddy']);
  D('d_king', 'おうさまごっこ', 'おうかんを かぶると みんなが「ははー！」', ['crown', 'gaku']);
  D('d_hero', 'ヒーローごっこ', 'マントを つけたら そらを とぶ ヒーロー！', ['cape', 'lulu']);
  D('d_space', 'うちゅうひこうし', 'ヘルメットを かぶると ふわふわ うちゅうあるき', ['helmet', 'choco']);
  D('d_cool', 'かっこいい ポーズ', 'サングラスで きめっ！', ['sunglasses', 'pon']);
  D('d_party', 'パーティーの はじまり', 'パーティーぼうしで みんなも おそろい', ['partyhat', 'mimi']);
  D('d_bday', 'ぬいぐるみの おたんじょうびかい', 'ぬいぐるみと ケーキで おたんじょうび おめでとう！', ['teddy', 'cake']);
  D('d_school', 'がっこうごっこ', 'ぬいぐるみと えほんや いすで がっこうごっこ', ['bunny', 'book', 'chair']);
  D('d_tea', 'おちゃかい', 'ぬいぐるみに おさらを ならべて おちゃかい', ['teddy', 'plate']);
  D('d_plushfriends', 'ぬいぐるみの おともだち', 'ぬいぐるみを ならべると、みんなで あそびはじめる', ['teddy', 'bunny']);
  D('d_hugplush', 'ぎゅー', 'ぬいぐるみを わたすと ぎゅっと だっこ', ['bunny', 'mimi']);
  D('d_read', 'えほんの よみきかせ', 'えほんを おくと よみきかせが はじまる', ['book', 'gaku']);
  D('d_pillow', 'まくらなげ', 'クッションを なげっこ！', ['cushion', 'pon']);
  D('d_ball', 'ボール おいかけっこ', 'ボールを おくと みんなで おいかける', ['ball', 'lulu']);
  D('d_catch', 'キャッチボール', 'ボールを わたすと なげっこが はじまる', ['ball', 'gaku', 'choco']);
  D('d_bubbleball', 'ボールで シャボンだま パーン', 'ころがった ボールが シャボンだまに あたったら…', ['ball', 'bubbles']);
  D('d_bubbles', 'シャボンだま あそび', 'シャボンだまを おいかけて パチン！', ['bubbles', 'choco']);
  D('d_dance', 'みんなで ダンス', 'おんがくを ながすと みんなが おどりだす', ['music', 'choco']);
  D('d_parade', 'たいこの パレード', 'たいこを たたくと みんなが ならんで パレード', ['drum', 'gaku']);
  D('d_balloon', 'ふうせん ふわふわ', 'ふうせんを もったら からだも ふわっ', ['balloon', 'mimi']);
  D('d_balloonfly', 'ふうせん とんでった', 'ふうせんが とんでいった！みんなで おいかけよう', ['balloon', 'pon']);
  D('d_confetti', 'おいわい かみふぶき', 'かみふぶきで みんな おおよろこび', ['confetti']);
  D('d_star', 'おほしさまに おねがい', 'おほしさまに おねがいしたら プレゼントが ふってきた', ['star', 'mimi']);
  D('d_wand', 'まほうごっこ', 'まほうの ステッキで ものが へんしん！', ['wand', 'choco']);
  D('d_rainbow', 'にじが でた', 'にじを おくと そらに おおきな にじ', ['rainbow']);
  D('d_firework', 'はなび どーん', 'よぞらに はなびが ひらいた', ['firework']);
  D('d_witch', 'まほうつかい', 'まほうつかいの ぼうしで ふしぎな じゅもん', ['witch', 'mimi']);
  D('d_robotsuit', 'ロボットに へんしん', 'ウィーン ガシャン！ロボットの うごき', ['robotsuit', 'gaku']);
  D('d_unicorn', 'ユニコーンに のったよ', 'ゆらゆら きらきら ユニコーン', ['unicorn', 'mimi']);
  D('d_slide', 'すべりだい すいー', 'すべりだいに おくと すべって あそぶ', ['slide', 'choco']);
  D('d_tramp', 'ぴょんぴょん トランポリン', 'トランポリンで たかく ジャンプ', ['trampoline', 'pon']);
  D('d_drive', 'ぶーん ドライブ', 'のりものに のって おでかけ', ['tricycle', 'gaku']);
  D('d_train', 'でんしゃごっこ', 'でんしゃの おもちゃで みんなが つながって しゅっぱつ しんこう', ['train', 'gaku', 'choco']);
  D('d_swim', 'うきわで ぷかぷか', 'うきわを つけて およいでる つもり？', ['swimring', 'pon']);
  D('d_tent', 'キャンプごっこ', 'テントで おやすみ。あさに なったら おはよう', ['tent', 'moko']);
  D('d_sandcastle', 'すなの おしろ', 'すなばや すなはまに バケツを おくと おしろづくり', ['bucket', 'castle']);
  D('d_shell', 'たからさがし', 'かいがらを みつけたら たからさがしの はじまり', ['shell', 'present']);
  D('d_animals', 'どうぶつが あつまる', 'どんぐりを おくと ちいさな どうぶつが やってくる', ['acorn']);
  D('d_bag', 'リュックで おでかけ', 'リュックを せおって おともだちと おでかけ', ['bag', 'moko']);
  D('d_duck', 'アヒルさん すいすい', 'アヒルを みずに うかべると みんなが あつまる', ['duck']);
  D('d_feedduck', 'アヒルさんに ごはん', 'パンを アヒルさんに あげたよ', ['bread', 'duck']);
  D('d_duckwalk', 'アヒルさんの おさんぽ', 'アヒルの あとを みんなで ついていく', ['duck', 'choco', 'lulu']);
  D('d_sillyhat', 'なんでも ぼうし', 'かおに のせたら なんでも ぼうしに なっちゃう', ['bucket', 'pon']);
  D('d_weird', 'へんな くみあわせ', 'ものの うえに ものを おいたら「あれれ？」', ['apple', 'ball']);
  D('d_swap', 'やくわり こうたい', 'やくわりの ある キャラに キャラを かさねると いれかわる', ['apron', 'mimi', 'pon']);

  /* ================= たべもの ================= */
  const eat = (ch, food, ctx, line = 'おいしい！') => {
    const type = food.type;
    W.remove(food);
    R.claim(ch, 3600).look(food.x).hold(type).face('eat', 1700).pose('eat', 1500).sfx('munch')
      .do(() => W.burst('heart', ch.x, ch.y - 160 * ch.scale, 4, { up: true, sp: 0.12, max: 900, size: 12 }))
      .unhold().face('laugh', 1200).say(line, 'heart', 1400, 'yay').pose('cheer', 700)
      .do(() => { R.found('d_eat'); if (ch.cid === 'moko') R.mimic(ch, 'eat', 1200, 'もぐもぐ まねっこ'); });
    // ほかの子が「いいなー」→ はんぶんこ
    const o = R.free(ch.x, ch.y, [ch], 500)[0];
    if (o && Math.random() < 0.6) {
      W.after(2200, () => {
        if (!R.chars().includes(o) || !R.chars().includes(ch)) return;
        const p = R.besides(ch, o.x < ch.x ? -1 : 1, 100);
        R.claim(o, 3600).go(p.x, p.y).look(ch.x).say('いいなー', type, 1300).wait(700).face('eat', 1400).hold(type).pose('eat', 1200).unhold().face('laugh', 900).say('ありがとう！', 'heart', 1200, 'yay');
        R.claim(ch, 3000).look(o.x).say('はんぶんこ！', type, 1400).pose('hold', 900).do(() => R.found('d_share'));
      });
    }
  };
  R.eat = eat;
  R.add({ id: 'food-on-char', pri: 75, test: (c) => (c.e.kind === 'prop' && c.e.def.food && isC(c.tgt) ? c.tgt : null),
    run(c, ch) { eat(ch, c.e, c, ch.cid === 'moko' ? 'おいしー！もっと！' : 'おいしい！'); } });
  R.add({ id: 'moko-party', pri: 55, cd: 4000, test: (c) => {
    if (!(c.e.kind === 'prop' && c.e.def.food)) return null;
    const m = W.charOf('moko'); if (!m || !R.chars().includes(m) || R.chars().length < 2) return null;
    return m;
  }, run(c, m) {
    const f = c.e;
    R.claim(m, 7000).to(f, -60, 6, true).look(f.x).face('surprise', 600).say('いい におい！', f.type, 1100, 'wow').pose('call', 900).say('みんなで たべよう！', 'heart', 1500, 'yay')
      .pose('sit', 1600).do(() => { eat(m, f, c, 'みんなで たべると おいしいね'); R.found('d_mokoparty'); });
    const others = R.free(f.x, f.y, [m], 2000).slice(0, 3);
    others.forEach((o, i) => { const p = R.ring(f.x, f.y, i + 1, others.length + 1, 120); W.after(900 + i * 250, () => R.claim(o, 5000).go(p.x, p.y, true).look(f.x).say(PT.pick(['わーい！', 'たべる！', 'いただきます！']), null, 1300, 'yay').pose('sit', 1800).face('eat', 1200).pose('eat', 1000).face('laugh', 900)); });
  } });
  R.add({ id: 'food-floor', pri: 30, test: (c) => (c.e.kind === 'prop' && c.e.def.food ? R.one(c.e.x, c.e.y) : null),
    run(c, ch) { R.claim(ch, 5000).to(c.e, -50, 4, true).look(c.e.x).face('surprise', 600).say('おいしそう！', c.e.type, 1100, 'wow').do(() => eat(ch, c.e, c)); } });

  /* おさら：おりょうりごっこ・いただきます・レストラン */
  const foodNear = (x, y, r = 260) => nearP(x, y, r, (p) => p.def.food && !p.heldBy);
  R.add({ id: 'plate-cook', pri: 45, test: (c) => (isP(c.e, 'plate') && !foodNear(c.e.x, c.e.y).length ? R.one(c.e.x, c.e.y, [], 'mimi') : null),
    run(c, ch) {
      const pl = c.e;
      R.claim(ch, 7000).to(pl, -70, 4, true).look(pl.x).say('おりょうり つくるね！', 'plate', 1500, 'yay').pose('eat', 1600).sfx('munch')
        .do(() => { const f = W.addProp(PT.pick(['onigiri', 'apple', 'cake', 'bread']), pl.x, pl.y - 1); f.pop = W.t; f.temp = true; W.burst('star', pl.x, pl.y - 40, 6, { up: true, sp: 0.2, max: 800, size: 10 }); PT.audio.sfx('sparkle'); })
        .say('できあがり！', 'star', 1400, 'yay').pose('cheer', 900).do(() => { R.found('d_cook'); R.chain('combo', { e: pl, x: pl.x, y: pl.y }, 400); });
    } });
  R.add({ id: 'meal', pri: 62, on: 'combo', test: (c) => { const pl = isP(c.e, 'plate') ? c.e : firstP(c.x, c.y, 260, 'plate'); if (!pl) return null; const f = foodNear(pl.x, pl.y, 260)[0]; return f ? { pl, f } : null; },
    run(c, { pl, f }) {
      const chef = role('chef');
      if (chef) { R.restaurant(chef, pl, f); return; }
      const list = R.free(pl.x, pl.y, [], 1800).slice(0, 4);
      list.forEach((ch, i) => { const p = R.ring(pl.x, pl.y, i, list.length, 130); R.claim(ch, 6000).go(p.x, p.y, i % 2 === 0).look(pl.x).pose('sit', 900).say(i === 0 ? 'いただきます！' : '', i === 0 ? 'heart' : null, 1300, 'yay').face('eat', 1500).pose('eat', 1400).face('laugh', 1200).say(i === 1 ? 'ごちそうさま！' : '', null, 1200); });
      W.after(2600, () => { if (!f.removed) { W.remove(f); PT.audio.sfx('munch'); } R.found('d_meal'); });
    } });
  R.restaurant = (chef, pl, f) => {
    const guests = R.free(pl.x, pl.y, [chef], 1800).slice(0, 3);
    R.claim(chef, 8000).to(f, -40, 4, true).hold(f.type).do(() => { f.hidden = true; }).say('いらっしゃいませ！', 'chef', 1500, 'yay')
      .to(pl, -40, 2, false).unhold().do(() => { f.hidden = false; f.x = pl.x; f.y = pl.y + 1; f.scale = pl.scale; f.z = 14; })
      .say('おまちどうさま！', 'star', 1500, 'yay').pose('bow', 900);
    guests.forEach((g, i) => { const p = R.ring(pl.x, pl.y, i + 1, guests.length + 1, 140); R.claim(g, 8000).go(p.x, p.y).look(pl.x).pose('sit', 2600).face('eat', 1500).pose('eat', 1500).face('laugh', 1200).say(i === 0 ? 'おいしい！' : 'ごちそうさま！', 'heart', 1400, 'yay'); });
    W.after(5200, () => { if (!f.removed) W.remove(f); R.found('d_restaurant'); X.confetti(pl.x, 1000); });
  };
  R.add({ id: 'food-plate', pri: 63, test: (c) => (c.e.kind === 'prop' && (c.e.def.food || c.e.type === 'plate') && (c.e.type === 'plate' ? foodNear(c.e.x, c.e.y).length : firstP(c.e.x, c.e.y, 260, 'plate')) ? 1 : null),
    run(c) { R.run('combo', { e: c.e, x: c.e.x, y: c.e.y }); } });

  /* ピクニック */
  R.picnic = (x, y, f) => {
    const list = R.free(x, y, [], 2000).slice(0, 4);
    list.forEach((ch, i) => { const p = R.ring(x, y, i, list.length, 120); R.claim(ch, 7000).go(p.x, p.y, true).look(x).pose('sit', 1200).say(['ピクニック！', 'いいてんき！', 'おなか すいた！', ''][i], i === 0 ? 'sheet' : null, 1300, 'yay').face('eat', 1500).pose('eat', 1500).face('laugh', 1500).pose('sit', 1200); });
    W.after(2800, () => { if (f && !f.removed) W.remove(f); PT.audio.sfx('munch'); W.burst('heart', x, y - 120, 6, { up: true, sp: 0.15, max: 1000 }); });
    W.after(3200, () => R.found('d_picnic'));
  };
  R.add({ id: 'picnic', pri: 72, test: (c) => {
    if (!c.e || c.e.kind !== 'prop') return null;
    const e = c.e;
    if (e.def.food) { const s = firstP(e.x, e.y, 260, ['sheet', 'parasol']); return s ? { s, f: e } : null; }
    if (isP(e, ['sheet', 'parasol'])) { const f = foodNear(e.x, e.y, 300)[0]; return f ? { s: e, f } : null; }
    return null;
  }, run(c, { s, f }) { R.picnic(s.x, s.y + 10, f); } });
  R.add({ id: 'sheet-moko', pri: 40, test: (c) => (isP(c.e, 'sheet') ? R.one(c.e.x, c.e.y, [], 'moko') : null),
    run(c, ch) {
      const s = c.e;
      R.claim(ch, 4000).to(s, 0, -4, true).pose('sit', 900).say('ピクニック しよう！', 'sheet', 1400, 'yay').pose('call', 900)
        .do(() => { const f = W.addProp('onigiri', s.x + 30, s.y + 4); f.pop = W.t; f.temp = true; PT.audio.sfx('pop'); R.picnic(s.x, s.y + 10, f); });
    } });
  R.add({ id: 'parasol-rest', pri: 35, test: (c) => (isP(c.e, 'parasol') ? R.free(c.e.x, c.e.y, [], 1500).slice(0, 2) : null),
    run(c, list) { list.forEach((ch, i) => { const p = R.besides(c.e, i ? 1 : -1, 50); R.claim(ch, 5000).go(p.x, p.y + 6).pose('sit', 2400).say(i ? 'すずしいね' : 'ひかげ だー', null, 1500).face('sleep', 1500); }); } });

  /* ================= へんしん（役割） ================= */
  R.add({ id: 'wear-on-char', pri: 85, test: (c) => (c.e.kind === 'prop' && c.e.def.wear && isC(c.tgt) ? c.tgt : null),
    run(c, ch) { const t = c.e.type; W.remove(c.e); R.wear(ch, t, c); } });
  R.add({ id: 'mimi-role', pri: 50, cd: 6000, test: (c) => {
    if (!(c.e.kind === 'prop' && ['doctor', 'apron', 'chef', 'crown'].includes(c.e.type))) return null;
    const m = W.charOf('mimi'); if (!m || !R.chars().includes(m) || !W.isFree(m)) return null;
    const o = R.free(c.e.x, c.e.y, [m], 1500)[0]; if (!o) return null;
    return { m, o };
  }, run(c, { m, o }) {
    const it = c.e;
    const names = { doctor: 'おいしゃさん', apron: 'おみせやさん', chef: 'コックさん', crown: 'おうさま' };
    R.claim(m, 6000).to(it, -40, 4, true).hold(it.type).do(() => { it.hidden = true; })
      .to(o, o.x < it.x ? 80 : -80, 0, false).look(o.x).say(`${PT.CHARS[o.cid].name}は ${names[it.type]}ね！`, it.type, 1800, 'yay').unhold()
      .do(() => { W.remove(it); R.wear(o, it.type, c); R.found('d_mimirole'); });
    R.claim(o, 2200).look(m.x).face('surprise', 900);
  } });
  D('d_mimirole', 'ミミの やくわり ていあん', 'ミミは「あなたは ○○ね！」と やくわりを きめてくれる', ['mimi', 'doctor']);
  R.add({ id: 'wear-floor', pri: 40, test: (c) => (c.e.kind === 'prop' && c.e.def.wear ? R.one(c.e.x, c.e.y) : null),
    run(c, ch) { const it = c.e; R.claim(ch, 4000).to(it, -40, 4, true).look(it.x).face('surprise', 700).say('みつけた！', it.type, 1100, 'wow').do(() => { W.remove(it); R.wear(ch, it.type, c); }); } });

  const ROLES = R.ROLES;
  ROLES.explorer = (ch, c) => {
    R.claim(ch, 3500).pose('point', 900).face('determined', 1800).say('たんけん しゅっぱつ！', 'star', 1500, 'yay').pose('cheer', 700).do(() => {
      R.found('d_hat');
      const bag = firstP(ch.x, ch.y, 700, 'bag'), fl = firstP(ch.x, ch.y, 700, 'flashlight');
      if (bag || fl || W.ents.some((e) => e.mode === 'fort')) R.tanken(ch, c);
    });
    R.mimic(ch, 'point', 1500, 'わたしも たんけん！');
  };
  ROLES.chef = (ch, c) => {
    const pl = firstP(ch.x, ch.y, 900, 'plate'), f = foodNear(ch.x, ch.y, 1200)[0];
    if (pl && f) { R.claim(ch, 1500).say('なにを つくろうかな', '?', 1200).do(() => R.restaurant(ch, pl, f)); R.found('d_chef'); return; }
    R.claim(ch, 4500).say('コックさんだよ！', 'chef', 1300, 'yay').pose('eat', 1400).sfx('munch')
      .do(() => { const p = W.clampFloor(ch.x + (ch.flip ? -70 : 70), ch.y + 6); const pl2 = W.addProp('plate', p.x, p.y); pl2.pop = W.t; pl2.temp = true; const f2 = W.addProp(PT.pick(['cake', 'onigiri', 'bread']), p.x, p.y + 1); f2.pop = W.t; f2.temp = true; f2.z = 12; PT.audio.sfx('sparkle'); })
      .say('どうぞ めしあがれ！', 'heart', 1500, 'yay').pose('bow', 800).do(() => { R.found('d_chef'); R.audience(ch.x, ch.y, [ch], 'cheer', 2); });
  };
  ROLES.shop = (ch, c) => R.shopOpen(ch);
  R.shopOpen = (ch) => {
    const base = nearF(ch.x, ch.y, 2000, 'counter')[0] || nearF(ch.x, ch.y, 2000, 'stall')[0] || nearP(ch.x, ch.y, 900, (p) => p.type === 'box' || p.type === 'table')[0] || null;
    const a = R.claim(ch, 9000);
    let bx = ch.x, by = ch.y;
    if (base) {
      if (base.kind === 'fix') { bx = base.x; by = base.y - 30; a.go(bx - 40, by - 6, true); }
      else { bx = base.x; by = base.y - 8; a.go(bx, by, true); if (base.type === 'box') base.mode = 'shop'; }
    }
    a.look(ch.x + 1).say('いらっしゃいませー！', 'apron', 1700, 'yay').pose('wave', 1000).rest('idle');
    const isBox = base && base.kind === 'prop' && base.type === 'box';
    const custs = R.free(bx, by, [ch], 2000).slice(0, 2);
    const goods = ['apple', 'banana', 'bread', 'cake', 'onigiri'];
    custs.forEach((cu, i) => {
      const p = W.clampFloor(bx - 140 + i * 280, by + 130);
      W.after(1500 + i * 2200, () => {
        if (!R.chars().includes(cu)) return;
        const g = PT.pick(goods);
        R.claim(cu, 6000).go(p.x, p.y, false).look(bx).say('これ ください！', g, 1500)
          .do(() => { R.claim(ch, 3000).look(cu.x).say('はい どうぞ！', g, 1300, 'yay').sfx('bell').pose('hold', 900); const cnt = base && base.kind === 'fix' && base.type === 'counter' ? base : null; if (cnt) cnt.price = PT.pick(['100', '200', '50']); })
          .wait(1100).hold(g).face('laugh', 1200).say('ありがとう！', 'heart', 1300, 'yay').pose('cheer', 700).wait(1200).unhold();
      });
    });
    W.after(2000, () => { R.found(isBox ? 'd_boxshop' : 'd_shop'); });
  };
  ROLES.king = (ch) => {
    R.claim(ch, 5000).pose('cheer', 900).say('おうさま だぞ！', 'crown', 1500, 'yay').wait(1400).say('みんなで おどろう！', 'note', 1500, 'yay').pose('dance', 1800);
    const subj = R.free(ch.x, ch.y, [ch], 1200).slice(0, 3);
    subj.forEach((o, i) => { const p = R.spot(ch.x, ch.y, i, subj.length, 140); W.after(400 + i * 200, () => R.claim(o, 5000).go(p.x, p.y).look(ch.x).pose('bow', 1000).say(i === 0 ? 'ははー！' : '', null, 1200).wait(900).pose('dance', 1800).face('laugh', 1500)); });
    W.after(1500, () => R.found('d_king'));
  };
  ROLES.hero = (ch) => {
    const t = W.randFloor(200);
    R.claim(ch, 5000).say('ヒーロー さんじょう！', 'cape', 1400, 'yay').pose('cheer', 600).sfx('whoosh')
      .do(() => { const sx = ch.x, sy = ch.y; R.tween(ch, 1400, (k) => { ch.x = PT.lerp(sx, t.x, k); ch.y = PT.lerp(sy, t.y, k); ch.z = Math.sin(k * Math.PI) * 200; ch.pose = 'fly'; ch.flip = t.x < sx; ch.scale = W.depthScale(ch.y); }, () => { ch.z = 0; R.claim(ch, 2000).say('たすけに きたよ！', 'star', 1400, 'yay').pose('point', 1000); R.found('d_hero'); }); });
    R.audience(ch.x, ch.y, [ch], 'wow', 2, 800);
  };
  ROLES.doctor = (ch, c) => {
    const plush = nearP(ch.x, ch.y, 900, (p) => tag(p, 'plush'))[0];
    if (plush) { R.checkup(ch, plush); return; }
    const pat = R.free(ch.x, ch.y, [ch], 1500)[0];
    if (!pat) { R.claim(ch, 2500).say('かんじゃさんは いないかな？', '?', 1600).pose('think', 1000); return; }
    R.checkup(ch, pat);
  };
  R.checkup = (doc, pat, inBed) => {
    const isChar = pat.kind === 'char';
    R.claim(doc, 8000).to(pat, pat.x < doc.x ? 80 : -80, 2, true).look(pat.x).say('どうしましたか？', 'doctor', 1500, 'talk').pose('hold', 1400).say('もしもし…', 'heart', 1400)
      .do(() => { if (!isChar) { pat.bandage = true; } else { pat.headItem = null; } PT.audio.sfx('sparkle'); W.burst('spark', pat.x, pat.y - 80, 8, { sp: 0.15, max: 700, size: 9, col: '#7fd0e8', g: 0 }); })
      .say('いたいの いたいの とんでけー！', 'star', 1800, 'yay').pose('cheer', 900);
    if (isChar) R.claim(pat, 8000).look(doc.x).face('puzzled', 1500).say('あーん', null, 1300, 'hmm').pose('sit', 3000).face('laugh', 1500).say('げんきに なった！', 'heart', 1500, 'yay').jump(50, 500).pose('cheer', 900);
    else W.after(4200, () => { pat.wobbleUntil = W.t + 900; W.burst('heart', pat.x, pat.y - 100, 5, { up: true, sp: 0.12, max: 900 }); });
    W.after(4600, () => R.found(isChar ? 'd_doctor' : 'd_plushdoc'));
  };
  ROLES.astro = (ch, c) => {
    const box = firstP(ch.x, ch.y, 700, 'box');
    R.claim(ch, 5000).say('うちゅうへ しゅっぱつ！', 'helmet', 1400, 'yay').jump(90, 1200).jump(90, 1200).say('ふわふわ〜', 'star', 1300).do(() => {
      R.found('d_space');
      if (box && !box.rider) R.boxPlay(box, 'rocket', ch);
    });
    R.mimic(ch, 'jump', 1000, 'ふわふわ〜');
  };
  ROLES.cool = (ch) => {
    R.claim(ch, 3500).pose('point', 900).say('きまってる？', 'sunglasses', 1500, 'talk').face('laugh', 1200).pose('dance', 1200).do(() => R.found('d_cool'));
    R.mimic(ch, 'point', 1300, 'かっこいい！');
    R.audience(ch.x, ch.y, [ch, W.charOf('choco')], 'laugh', 1, 900);
  };
  ROLES.party = (ch) => {
    R.claim(ch, 4500).say('パーティー しよう！', 'partyhat', 1500, 'yay').pose('cheer', 1400);
    const os = R.free(ch.x, ch.y, [ch], 1500).slice(0, 3);
    os.forEach((o, i) => W.after(900 + i * 300, () => { if (!o.wear.hat) R.wear(o, 'partyhat', {}, true); R.claim(o, 2500).say('おそろい！', 'heart', 1300, 'yay').pose('cheer', 1200); }));
    W.after(2000, () => {
      X.confetti(ch.x);
      R.found('d_party');
      const cake = firstP(ch.x, ch.y, 900, 'cake'), pl = nearP(ch.x, ch.y, 900, (p) => tag(p, 'plush'))[0];
      if (cake && pl) R.chain('combo', { e: cake, x: cake.x, y: cake.y }, 800);
    });
  };
  ROLES.wizard = (ch) => { R.claim(ch, 3000).say('ちちんぷいぷい！', 'witch', 1500, 'yay').pose('point', 900).do(() => { R.found('d_witch'); R.magic(ch); }); };
  ROLES.robot = (ch) => {
    R.claim(ch, 4500).say('ウィーン ガシャン！', 'robotsuit', 1500, 'talk').pose('march', 2000).sfx('zap').pose('spin', 800).say('ロボット です', 'star', 1300).do(() => R.found('d_robotsuit'));
    R.mimic(ch, 'march', 1800, 'ガシャン ガシャン');
  };

  /* やくわり こうたい・だっこ・ハイタッチ */
  R.add({ id: 'role-swap', pri: 80, test: (c) => (isC(c.e) && isC(c.tgt) && (c.tgt.role || c.e.role) && c.tgt.role !== c.e.role ? c.tgt : null),
    run(c, o) {
      const a = c.e;
      const wa = a.wear, ra = a.role;
      a.wear = o.wear; a.role = o.role; o.wear = wa; o.role = ra;
      const p = R.besides(o, a.x < o.x ? -1 : 1, 100); a.x = p.x; a.y = p.y; a.scale = W.depthScale(a.y);
      PT.audio.sfx('sparkle'); W.burst('star', (a.x + o.x) / 2, a.y - 120, 10, { sp: 0.2, max: 800 });
      R.claim(a, 3000).look(o.x).say('こうたい！', 'star', 1300, 'yay').pose('cheer', 900).do(() => { if (a.role) R.roleStart(a, a.role, c); });
      R.claim(o, 3000).look(a.x).face('laugh', 1200).say('こんどは こっち！', null, 1300, 'yay').pose('jump', 500);
      R.found('d_swap');
    } });

  /* ================= だんボール（見立て） ================= */
  R.boxPlay = (box, mode, rider) => {
    const ch = rider || R.one(box.x, box.y, [], mode === 'robot' ? 'gaku' : mode === 'rocket' ? 'lulu' : 'pon');
    if (!ch) return;
    if (mode === 'robot') {
      const other = firstP(box.x, box.y, 300, 'box', box);
      R.claim(ch, 5000).to(box, -70, 4, true).look(box.x).say('くみたて！', 'box', 1200).pose('carry', 900)
        .do(() => { if (other) W.remove(other); box.mode = 'robot'; box.bh = 190; PT.audio.sfx('zap'); W.burst('spark', box.x, box.y - 120, 10, { sp: 0.2, max: 700, col: '#ffd23f', g: 0 }); box.wobbleUntil = W.t + 2500; })
        .say('ロボット できた！', 'star', 1500, 'yay').pose('cheer', 900).do(() => { R.found('d_robot'); R.mimic(ch, 'march', 2000, 'ロボット ダンス！'); });
      return;
    }
    if (mode === 'shop') { box.mode = 'shop'; const k = role('shop') || ch; if (!k.wear.body) R.wear(k, 'apron', {}, true); R.shopOpen(k); return; }
    R.claim(ch, 9000).to(box, 0, -3, true).do(() => {
      box.mode = mode === 'rocket' ? 'rocket' : mode;
      R.ride(ch, box, { z: mode === 'rocket' ? 70 : 34, pose: 'ride', carry: true });
      PT.audio.sfx('pop');
      const a = W.act(ch);
      if (mode === 'car') {
        a.say('ぶーぶー！', 'box', 1300, 'yay');
        for (let i = 0; i < 3; i++) { const p = W.randFloor(160); a.go(p.x, p.y); }
        a.say('とうちゃく！', 'star', 1200, 'yay').do(() => { R.unride(ch); R.found('d_boxcar'); R.audience(ch.x, ch.y, [ch], 'join', 1); });
      } else if (mode === 'boat') {
        a.say('しゅっこう！', 'box', 1300, 'yay').do(() => { R.tween(ch, 4200, (k) => { ch.z = ch.baseZ + Math.sin(k * 20) * 6; ch.x = box.x + Math.sin(k * Math.PI * 2) * 4; }, () => {}); })
          .wait(1500).say('ぎっこん ばったん', 'note', 1500).wait(2400).do(() => { R.unride(ch); R.found('d_boxboat'); });
      } else if (mode === 'rocket') {
        a.say('3、2、1…', 'star', 1300).do(() => {
          W.bigText('はっしゃ！', box.x, box.y - 260, '#ff6f61'); PT.audio.sfx('rocket'); box.flying = true; W.shake = W.t + 600;
          const z0 = box.z;
          R.tween(ch, 3600, (k) => { const h = k < 0.5 ? PT.easeInOut(k * 2) * 900 : PT.easeInOut((1 - k) * 2) * 900; box.z = z0 + h; ch.z = ch.baseZ + h; if (W.t % 200 < 20) W.burst('smoke', box.x, box.y - box.z, 1, { sp: 0.05, max: 700, size: 18, col: '#ffffff', g: 0 }); }, () => {
            box.z = 0; box.flying = false; ch.z = ch.baseZ;
            W.act(ch).say('ただいま！ つきに いってきた！', 'star', 1800, 'yay').do(() => { R.unride(ch); box.mode = null; R.found('d_rocket'); X.confetti(box.x, 1200); });
          });
        });
        R.audience(box.x, box.y, [ch], 'wow', 3, 1200);
      }
    });
  };
  const boxMode = (box) => {
    if (firstP(box.x, box.y, 300, 'box', box)) return 'robot';
    if (firstP(box.x, box.y, 400, ['star', 'helmet']) || W.chars().some((c) => c.wear.hat === 'helmet' && Math.hypot(c.x - box.x, c.y - box.y) < 500)) return 'rocket';
    if (firstP(box.x, box.y, 400, 'apron') || role('shop')) return 'shop';
    if (W.areaAt(box.x, box.y - 20)?.tag === 'water' || nearF(box.x, box.y, 260, 'water').length || (W.stage.id === 'beach' && box.y < 700)) return 'boat';
    if (W.stage.id === 'space') return 'rocket';
    return 'car';
  };
  R.add({ id: 'box', pri: 50, test: (c) => (isP(c.e, 'box') && !c.e.rider ? boxMode(c.e) : null),
    run(c, mode) { const box = c.e; if (mode === 'shop') { const ap = firstP(box.x, box.y, 400, 'apron'); const k = R.one(box.x, box.y, [], 'mimi'); if (ap && k) { W.remove(ap); R.wear(k, 'apron', {}, true); } box.mode = 'shop'; if (k) R.shopOpen(k); return; } R.boxPlay(box, mode); } });
  R.add({ id: 'box-on-char', pri: 78, test: (c) => (isP(c.e, 'box') && isC(c.tgt) ? c.tgt : null), run(c, ch) { c.e.x = ch.x; c.e.y = ch.y + 4; R.boxPlay(c.e, boxMode(c.e), ch); } });
  R.add({ id: 'box-tap', on: 'tapprop', pri: 50, test: (c) => (isP(c.e, 'box') ? 1 : null),
    run(c) { const box = c.e; if (box.rider) { const ch = W.byId(box.rider); if (ch) { R.claim(ch, 1500).say('ぷっぷー！', null, 1000, 'yay'); } return; } if (box.mode === 'robot') { box.wobbleUntil = W.t + 1500; PT.audio.sfx('zap'); W.bigText('ガシャン！', box.x, box.y - 220, '#4c9be8'); return; } R.boxPlay(box, boxMode(box)); } });
  R.add({ id: 'helmet-star-box', pri: 70, test: (c) => (isP(c.e, ['star', 'helmet']) ? firstP(c.e.x, c.e.y, 450, 'box') : null), run(c, box) { if (c.e.type === 'helmet') { const ch = R.one(box.x, box.y, [], 'lulu'); if (ch) { W.remove(c.e); R.wear(ch, 'helmet', {}, true); R.boxPlay(box, 'rocket', ch); } return; } R.boxPlay(box, 'rocket'); } });

  /* ================= もうふ・ひみつきち ================= */
  const fortBase = (b) => {
    if (b.tgt && b.tgt.kind === 'fix' && tag(b.tgt, 'cover-base') && b.tgt.type !== 'tentF') return b.tgt;
    const f = nearF(b.e.x, b.e.y, 220, 'cover-base').find((x) => x.type !== 'tentF');
    if (f) return f;
    return firstP(b.e.x, b.e.y, 200, ['table', 'chair', 'cushion'], b.e);
  };
  R.makeFort = (bl, base) => {
    bl.mode = 'fort';
    const bw = base.kind === 'fix' ? Math.max(240, base.w * 0.95) : 250;
    bl.fw = bw; bl.fh = base.kind === 'fix' ? Math.max(170, Math.min(230, base.h + 40)) : 180;
    bl.x = base.x; bl.y = base.y + 8; bl.scale = 1; bl.bw = bl.fw; bl.bh = bl.fh; bl.keep = true;
    if (base.kind === 'prop') { base.hidden = true; base.coveredBy = bl.id; }
    bl.pop = W.t; PT.audio.sfx('pop');
    const kids = R.free(bl.x, bl.y, [], 2000).slice(0, 3);
    kids.forEach((ch, i) => {
      const px = bl.x - bl.fw * 0.25 + i * (bl.fw * 0.25);
      R.claim(ch, 9000).go(px, bl.y + 20, true).say(i === 0 ? 'ひみつきちだ！' : PT.pick(['いれてー！', 'わーい！']), i === 0 ? 'blanket' : null, 1400, 'yay')
        .do(() => { ch.x = px; ch.y = bl.y - 4; ch.scale = W.depthScale(ch.y); ch.stay = true; })
        .wait(700 + i * 400).jump(80, 700).say(PT.pick(['ばあ！', 'みつかった？', 'うふふ']), null, 1100, 'laugh').wait(1800).jump(80, 700).wait(1200)
        .do(() => { ch.stay = false; const p = W.clampFloor(ch.x + PT.rand(-40, 40), bl.y + 60); ch.y = p.y; ch.scale = W.depthScale(ch.y); });
    });
    W.after(1600, () => R.found('d_fort'));
  };
  R.add({ id: 'fort', pri: 74, test: (c) => (isP(c.e, 'blanket') && c.e.mode !== 'fort' ? fortBase(c) : null), run(c, base) { R.makeFort(c.e, base); } });
  R.add({ id: 'fort2', pri: 72, test: (c) => (isP(c.e, ['cushion', 'table', 'chair']) ? firstP(c.e.x, c.e.y, 220, 'blanket', c.e) : null), run(c, bl) { if (bl.mode === 'fort') return R.fallbackDrop(c); R.makeFort(bl, c.e); } });
  R.ghost = (ch, bl) => {
    if (bl) W.remove(bl);
    ch.wear = Object.assign({}, ch.wear, { hat: 'ghost' }); PT.audio.sfx('ghost');
    const others = R.free(ch.x, ch.y, [ch], 900).slice(0, 2);
    R.claim(ch, 6000).say('おばけだぞ〜', null, 1600, 'hmm').pose('call', 1500).do(() => {
      others.forEach((o, i) => { const p = W.clampFloor(o.x + (o.x < ch.x ? -200 : 200), o.y + PT.rand(-30, 30)); R.claim(o, 4000).face('surprise', 900).say('きゃー！', '!', 1200, 'wow').go(p.x, p.y, true).look(ch.x).face('laugh', 1500).say(i ? 'ポンでしょ！' : 'あはは！', null, 1400, 'laugh').pose('tickle', 900); });
    }).go(ch.x + (ch.flip ? -160 : 160), ch.y, false).wait(1200).do(() => { delete ch.wear.hat; W.poof(ch.x, ch.y - 100); }).face('laugh', 1500).say('ばれたー！', null, 1400, 'laugh').pose('tickle', 900)
      .do(() => { const p = W.clampFloor(ch.x + 60, ch.y + 4); const b = W.addProp('blanket', p.x, p.y); b.pop = W.t; R.found('d_ghost'); });
  };
  R.add({ id: 'ghost-char', pri: 70, test: (c) => (isP(c.e, 'blanket') && isC(c.tgt) ? c.tgt : null), run(c, ch) { R.ghost(ch, c.e); } });
  R.add({ id: 'ghost-pon', pri: 45, test: (c) => {
    if (!isP(c.e, 'blanket') || c.e.mode === 'fort') return null;
    const p = W.charOf('pon'); return p && R.chars().includes(p) && W.isFree(p) && R.chars().length > 1 ? p : null;
  }, run(c, p) { R.claim(p, 3000).to(c.e, 0, 4, true).say('いいこと おもいついた！', '!', 1300, 'yay').do(() => R.ghost(p, c.e)); } });
  R.nap = (ch, under, line = 'おやすみ…') => {
    R.claim(ch, 6500).to(under, 0, -2, false).pose('sleep', 600).face('sleep', 4000).say(line, 'zzz', 1500, null)
      .do(() => { W.burst('zzz', ch.x + 30, ch.y - 150, 3, { up: true, sp: 0.04, minSp: 0.02, g: -0.00001, max: 1800, size: 22, col: '#7a8fb8' }); })
      .pose('sleep', 3000).face('happy').pose('cheer', 900).say('よく ねた！', 'star', 1300, 'yay').do(() => R.found('d_nap'));
    const m = W.charOf('mimi');
    if (m && m !== ch && R.chars().includes(m) && W.isFree(m)) W.after(1500, () => R.claim(m, 3000).to(ch, -90, 0).look(ch.x).say('しーっ', 'heart', 1500).pose('shy', 1200));
  };
  R.add({ id: 'nap', pri: 35, test: (c) => (isP(c.e, ['blanket', 'cushion']) && c.e.mode !== 'fort' ? R.one(c.e.x, c.e.y, [], 'moko') : null), run(c, ch) { R.nap(ch, c.e); } });
  R.add({ id: 'nap-char', pri: 70, test: (c) => (isP(c.e, 'cushion') && isC(c.tgt) ? c.tgt : null), run(c, ch) { c.e.x = ch.x; c.e.y = ch.y + 2; R.nap(ch, c.e); } });

  /* ================= かいちゅうでんとう ================= */
  const darkSpot = (x, y) => W.near(x, y, 330, (e) => (e.kind === 'prop' && (e.mode === 'fort' || e.type === 'tent')) || (e.kind === 'fix' && e.type === 'tentF'))[0];
  R.add({ id: 'shadow', pri: 82, test: (c) => (isP(c.e, 'flashlight') ? darkSpot(c.e.x, c.e.y) : null),
    run(c, spot) {
      const fl = c.e;
      spot.lit = true; fl.on = true;
      const h = spot.kind === 'fix' ? spot.h : spot.mode === 'fort' ? spot.fh : 160;
      X.shadowShow(spot.x, spot.y - h - 150, W.stage.id === 'camp' ? ['rabbit', 'bird', 'dog'] : ['rabbit', 'bird', 'dino'], 7000);
      PT.audio.sfx('magic');
      const kids = R.free(spot.x, spot.y, [], 1500).slice(0, 3);
      const lines = ['うさぎさん！', 'とりさん だ！', W.stage.id === 'camp' ? 'わんちゃん！' : 'きょうりゅう！'];
      kids.forEach((ch, i) => { const p = R.spot(spot.x, spot.y + 40, i, kids.length, 150); R.claim(ch, 8000).go(p.x, p.y).look(spot.x).pose('sit', 600 + i * 2200).say(lines[i], 'star', 1500, 'wow').pose('point', 1200).face('laugh', 2000).pose('sit', 2000); });
      W.after(1500, () => R.found('d_shadow'));
      W.after(7000, () => { spot.lit = false; fl.on = false; const d = firstP(spot.x, spot.y, 700, 'dino'); if (d) R.chain('drop', { e: d, x: d.x, y: d.y }, 200); });
    } });
  R.add({ id: 'light-night', pri: 60, test: (c) => (isP(c.e, 'flashlight') && W.stage.night ? R.one(c.e.x, c.e.y, [], 'lulu') : null),
    run(c, ch) {
      const fl = c.e;
      R.claim(ch, 9000).to(fl, -40, 4, true).hold('flashlight').do(() => { fl.hidden = true; }).say('なにが いるかな？', '?', 1500, 'hmm')
        .do(() => {
          const tx = W.stage.id === 'camp' ? 160 : PT.rand(300, 1300), ty = W.stage.id === 'camp' ? 360 : 300;
          W.dark = true;
          X.beam(ch.x + 30, ch.y - 120, tx, ty, 3500);
          const kind = W.stage.id === 'camp' ? 'owl' : W.stage.id === 'space' ? 'alien' : 'fairy';
          X.critter(kind, [[tx, ty, 1], [tx, ty, 2500], [tx + 10, ty - 10, 800]]);
          for (let i = 0; i < 6; i++) X.critter('firefly', [[PT.rand(200, 1400), PT.rand(400, 700), 1], [PT.rand(200, 1400), PT.rand(300, 600), 3000], [PT.rand(200, 1400), PT.rand(300, 600), 2000]]);
        })
        .pose('point', 1400).face('surprise', 800).say('みつけた！', '!', 1300, 'wow').wait(1700).face('laugh', 1200).say('こんばんは〜', 'heart', 1400, 'yay')
        .do(() => { W.dark = false; fl.hidden = false; fl.x = ch.x + 40; fl.y = ch.y + 6; fl.scale = ch.scale; R.found('d_nightsearch'); }).unhold();
      R.audience(ch.x, ch.y, [ch], 'wow', 2, 2500);
    } });
  D('d_nightsearch', 'よるの たんけん', 'くらい ところで かいちゅうでんとうを てらすと…だれか いた！', ['flashlight', 'lulu'], 'camp');
  R.add({ id: 'light', pri: 40, test: (c) => (isP(c.e, 'flashlight') ? R.one(c.e.x, c.e.y, [], 'gaku') : null),
    run(c, ch) {
      const fl = c.e;
      const tgt = R.free(fl.x, fl.y, [ch], 1500)[0];
      R.claim(ch, 5000).to(fl, -40, 4, true).hold('flashlight').do(() => { fl.hidden = true; }).say('ピカッ！', 'star', 1100, 'yay')
        .do(() => { if (tgt) { ch.flip = tgt.x < ch.x; X.beam(ch.x + (ch.flip ? -30 : 30), ch.y - 110 * ch.scale, tgt.x, tgt.y - 120 * tgt.scale, 1600); R.claim(tgt, 3000).face('surprise', 900).say('まぶしい！', '!', 1200, 'wow').pose('shy', 900).face('laugh', 1200).say('あはは！', null, 1200, 'laugh'); } })
        .pose('point', 1600).unhold().do(() => { fl.hidden = false; fl.x = ch.x + 40; fl.y = ch.y + 6; R.found('d_light'); });
    } });

  /* ================= きょうりゅう・たんけん ================= */
  R.add({ id: 'dino', pri: 50, cd: 2000, test: (c) => (isP(c.e, 'dino') ? R.one(c.e.x, c.e.y, [], 'pon') : null),
    run(c, ch) {
      const d = c.e;
      R.claim(ch, 7000).to(d, -40, 4, true).hold('dino').do(() => { d.hidden = true; }).face('roar', 1500).say('がおー！', 'dino', 1500, null).sfx('roar').pose('roar', 1300)
        .do(() => {
          const others = R.free(ch.x, ch.y, [ch], 1200).slice(0, 3);
          others.forEach((o) => { const p = W.clampFloor(o.x + (o.x < ch.x ? -260 : 260), o.y + PT.rand(-60, 60)); R.claim(o, 4000).face('surprise', 800).say('にげろー！', '!', 1100, 'wow').go(p.x, p.y, true).face('laugh', 1500).say('あはは！', null, 1200, 'laugh'); });
          if (others[0]) W.act(ch).to(others[0], 80, 0, true);
        })
        .face('laugh', 1500).say('まてー！', null, 1100, 'laugh').wait(800).unhold()
        .do(() => { d.hidden = false; d.x = ch.x + 50; d.y = ch.y + 4; d.scale = ch.scale; R.found('d_dino'); if (W.ents.some((e) => e.mode === 'fort' || e.lit) || role('explorer') || firstP(ch.x, ch.y, 900, ['bag', 'explorer'])) R.tanken(role('explorer') || ch, c); });
    } });
  R.tanken = (leader, c) => {
    if ((R.cool.tanken || 0) > W.t) return;
    R.cool.tanken = W.t + 12000;
    const team = [leader].concat(R.avail(leader.x, leader.y, [leader], 2500).slice(0, 3));
    team.forEach((ch) => { R.claim(ch, 12000); if (!ch.wear.hat && Math.random() < 0.5) ch.wear = Object.assign({}, ch.wear, { hat: 'explorer' }); });
    const path = [W.randFloor(200), W.randFloor(200), W.randFloor(200)];
    W.act(leader).say('たんけんたい、しゅっぱつ！', 'explorer', 1600, 'yay').pose('point', 700);
    team.forEach((ch, i) => {
      const a = W.act(ch).wait(1600 + i * 350);
      path.forEach((p) => a.go(p.x - i * 70, p.y + (i % 2) * 20));
      a.look(path[2].x + 100).pose('march', 600);
      if (i === 0) a.say('はっけん！', '!', 1300, 'wow').do(() => { const t = W.addProp(PT.pick(['present', 'shell', 'acorn', 'flower']), path[2].x + 90, path[2].y + 10); t.pop = W.t; t.temp = true; PT.audio.sfx('discover'); W.burst('star', t.x, t.y - 40, 10, { up: true, sp: 0.25 }); R.found('d_tanken'); });
      else a.face('laugh', 1200).say(PT.pick(['すごい！', 'やったね！', 'たからものだ！']), null, 1300, 'yay').pose('cheer', 900);
    });
  };
  R.add({ id: 'tanken-combo', pri: 76, test: (c) => {
    if (!isP(c.e, ['bag', 'flashlight', 'explorer'])) return null;
    const need = ['bag', 'flashlight', 'explorer'].filter((t) => t !== c.e.type);
    const ok = need.every((t) => firstP(c.e.x, c.e.y, 600, t) || W.chars().some((ch) => (t === 'explorer' && ch.wear.hat === 'explorer') || (t === 'bag' && ch.wear.back === 'bag')));
    return ok ? (role('explorer') || R.one(c.e.x, c.e.y, [], 'lulu')) : null;
  }, run(c, ch) { [c.e].concat(['bag', 'flashlight', 'explorer'].map((t) => firstP(c.e.x, c.e.y, 600, t))).forEach((p) => { if (p && !p.removed) { if (p.type === 'explorer') R.wear(ch, 'explorer', {}, true); else if (p.type === 'bag') ch.wear = Object.assign({}, ch.wear, { back: 'bag' }); W.remove(p); } }); R.tanken(ch, c); } });

  /* ================= ボール ================= */
  R.kick = (ch, ball, toward) => {
    const dir = toward ? Math.sign(toward.x - ball.x) || 1 : (Math.random() < 0.5 ? -1 : 1);
    R.claim(ch, 3000).go(ball.x - dir * 50, ball.y + 2, true).look(ball.x).pose('kick', 300)
      .do(() => { ball.vx = dir * PT.rand(0.45, 0.7); ball.vy = toward ? (toward.y - ball.y) * 0.0012 : PT.rand(-0.15, 0.15); PT.audio.sfx('boing'); ball.lastKick = ch.id; })
      .face('laugh', 900).say(PT.pick(['えいっ！', 'それー！', 'いくよー！']), 'ball', 1000, 'yay');
  };
  R.add({ id: 'ball', pri: 45, test: (c) => (isP(c.e, 'ball') ? R.one(c.e.x, c.e.y) : null),
    run(c, ch) { c.e.game = 4; R.kick(ch, c.e, R.free(c.e.x, c.e.y, [ch], 2000)[0]); W.after(1200, () => R.found('d_ball')); } });
  R.onStop = (p) => {
    if (p.type !== 'ball' || !p.game) return;
    p.game--;
    const ch = R.free(p.x, p.y, [W.byId(p.lastKick)].filter(Boolean), 1600)[0];
    if (!ch) return;
    W.after(200, () => R.kick(ch, p, R.free(p.x, p.y, [ch], 2000)[0]));
  };
  R.add({ id: 'ball-catch', pri: 72, test: (c) => (isP(c.e, 'ball') && isC(c.tgt) ? c.tgt : null),
    run(c, ch) {
      const ball = c.e;
      const mate = R.free(ch.x, ch.y, [ch], 1500)[0];
      ball.hidden = true;
      R.claim(ch, 6000).hold('ball').pose('hold', 500).say('キャッチ！', 'ball', 1100, 'yay');
      if (!mate) { W.act(ch).pose('jump', 400).unhold().do(() => { ball.hidden = false; ball.x = ch.x + 40; ball.y = ch.y + 4; R.found('d_catch'); }); return; }
      const p = R.besides(ch, mate.x < ch.x ? -1 : 1, 260);
      R.claim(mate, 6000).go(p.x, p.y, true).look(ch.x).pose('hold', 400).say('こっち こっち！', null, 1200);
      const toss = (from, to, n) => {
        W.act(from).look(to.x).pose('cheer', 300).unhold().do(() => {
          const sx = from.x, sy = from.y, s = { z: 0 };
          ball.hidden = false; ball.z = 80;
          R.tween(s, 800, (k) => { ball.x = PT.lerp(sx, to.x, k); ball.y = PT.lerp(sy, to.y, k) + 2; ball.z = 80 + Math.sin(k * Math.PI) * 140; ball.spin = (ball.spin || 0) + 0.2; ball.scale = W.depthScale(ball.y); }, () => {
            ball.z = 0;
            if (n > 0) { ball.hidden = true; W.act(to).hold('ball').say(n === 2 ? 'ナイス！' : 'とれた！', null, 900, 'yay').pose('hold', 300); toss(to, from, n - 1); }
            else { to.holdType = null; ball.x = to.x + 30; ball.y = to.y + 4; R.found('d_catch'); W.act(to).face('laugh', 1000).say('たのしいね！', 'heart', 1200, 'laugh'); }
          });
        });
      };
      W.after(1300, () => toss(ch, mate, 2));
    } });
  R.add({ id: 'ballbubble', on: 'ballbubble', pri: 50, test: (c) => c.e,
    run(c) { W.addBubbles(c.e.x, c.e.y, 16); PT.audio.sfx('sparkle'); R.found('d_bubbleball'); R.bubbleChase(c.e.x, c.e.y); } });

  /* ================= ぬいぐるみ ================= */
  const plushNear = (x, y, r, excl) => nearP(x, y, r, (p) => tag(p, 'plush') && p !== excl);
  R.add({ id: 'plush-hug', pri: 70, test: (c) => (c.e.kind === 'prop' && tag(c.e, 'plush') && isC(c.tgt) ? c.tgt : null),
    run(c, ch) {
      const p = c.e; p.hidden = true;
      R.claim(ch, 5000).hold(p.type).pose('hug', 1400).face('love', 1800).say('ぎゅー！', 'heart', 1400, 'yay')
        .do(() => W.burst('heart', ch.x, ch.y - 130, 5, { up: true, sp: 0.12, max: 900 }))
        .go(ch.x + PT.rand(-120, 120), ch.y + PT.rand(-20, 20)).pose('hug', 900).unhold().do(() => { p.hidden = false; p.x = ch.x + 50; p.y = ch.y + 4; p.scale = ch.scale; R.found('d_hugplush'); });
      R.mimic(ch, 'hug', 1300, 'ぎゅー まねっこ');
    } });
  R.bday = (cake, guests) => {
    guests.forEach((g) => { g.party = true; g.pop = W.t; });
    const list = R.free(cake.x, cake.y, [], 2000).slice(0, 4);
    list.forEach((ch, i) => { const p = R.ring(cake.x, cake.y, i, list.length, 170); R.claim(ch, 9000).go(p.x, p.y, true).look(cake.x).pose('sit', 600).say(i === 0 ? 'おたんじょうび おめでとう！' : '', i === 0 ? 'cake' : 'note', 2000, 'yay').pose('dance', 2400).pose('cheer', 1200).face('laugh', 1500); });
    X.music(cake.x, cake.y - 120, 3000); PT.audio.sfx('jingle');
    W.after(2600, () => { X.confetti(cake.x); PT.audio.sfx('cheer'); R.found('d_bday'); });
  };
  R.add({ id: 'bday', pri: 80, on: 'combo', test: (c) => { const cake = isP(c.e, 'cake') ? c.e : firstP(c.x, c.y, 350, 'cake'); if (!cake) return null; const ps = plushNear(cake.x, cake.y, 350); return ps.length ? { cake, ps } : null; }, run(c, b) { R.bday(b.cake, b.ps); } });
  R.add({ id: 'school', pri: 70, on: 'combo', test: (c) => { const ps = plushNear(c.x, c.y, 380); if (!ps.length) return null; const bk = firstP(c.x, c.y, 380, ['book', 'chair']); const desk = nearF(c.x, c.y, 380, 'school')[0]; return bk || desk ? { ps, at: bk || desk } : null; },
    run(c, { ps, at }) {
      const t = R.one(at.x, at.y, [], 'mimi');
      if (!t) return;
      const fx = at.x, fy = at.y;
      R.claim(t, 8000).go(fx, fy - 40, true).look(fx + 1).say('みなさん こんにちは！', 'book', 1700, 'yay').pose('point', 1500).say('1たす1は？', '?', 1600).wait(1500).face('laugh', 1200).say('せいかい！ はなまる！', 'star', 1500, 'yay').pose('cheer', 900);
      const st = R.free(fx, fy, [t], 2000).slice(0, 3);
      st.forEach((s, i) => { const p = R.spot(fx, fy + 80, i, st.length, 160); R.claim(s, 8000).go(p.x, p.y).look(fx).pose('sit', 3200).pose('cheer', 600).say(i === 0 ? 'はーい！ 2！' : 'はーい！', null, 1200, 'yay').pose('sit', 1500); });
      ps.forEach((p) => { p.wobbleUntil = W.t + 5000; });
      W.after(4200, () => R.found('d_school'));
    } });
  R.add({ id: 'tea', pri: 66, on: 'combo', test: (c) => { const ps = plushNear(c.x, c.y, 350); const pl = firstP(c.x, c.y, 350, 'plate'); return ps.length && pl ? { ps, pl } : null; },
    run(c, { ps, pl }) {
      const host = R.one(pl.x, pl.y, [], 'mimi');
      if (!host) return;
      R.claim(host, 7000).to(pl, -60, 2, true).say('おちゃかいへ ようこそ！', 'plate', 1600, 'yay').pose('hold', 1200).do(() => { ps.forEach((p) => { p.wobbleUntil = W.t + 1500; }); }).say('どうぞ めしあがれ', 'heart', 1500).pose('eat', 1200).face('laugh', 1200);
      R.audience(pl.x, pl.y, [host], 'join', 2, 900);
      W.after(3000, () => R.found('d_tea'));
    } });
  R.add({ id: 'plush-combo', pri: 64, test: (c) => {
    if (c.e.kind !== 'prop') return null;
    if (!(tag(c.e, 'plush') || isP(c.e, ['cake', 'book', 'chair', 'plate']))) return null;
    const ctx = { e: c.e, x: c.e.x, y: c.e.y };
    return R.list.some((r) => r.on === 'combo' && ['bday', 'school', 'tea'].includes(r.id) && r.test(ctx)) ? ctx : null;
  }, run(c, ctx) { R.run('combo', ctx); } });
  R.add({ id: 'plush-friends', pri: 55, test: (c) => (c.e.kind === 'prop' && tag(c.e, 'plush') && plushNear(c.e.x, c.e.y, 320, c.e).length ? plushNear(c.e.x, c.e.y, 320, c.e)[0] : null),
    run(c, other) {
      const p1 = c.e;
      const list = R.free(p1.x, p1.y, [], 1800).slice(0, 2);
      list.forEach((ch, i) => { const p = R.ring((p1.x + other.x) / 2, p1.y, i, 2, 160); R.claim(ch, 6000).go(p.x, p.y, true).look(p1.x).pose('sit', 900).say(i ? 'こんにちは、くまさん' : 'いっしょに あそぼ！', i ? 'teddy' : 'bunny', 1600, 'yay').pose('dance', 1600).face('laugh', 1200); });
      p1.wobbleUntil = W.t + 3000; other.wobbleUntil = W.t + 3000;
      W.after(2400, () => { R.found('d_plushfriends'); });
    } });
  R.add({ id: 'plush-floor', pri: 32, test: (c) => (c.e.kind === 'prop' && tag(c.e, 'plush') ? R.one(c.e.x, c.e.y, [], 'mimi') : null),
    run(c, ch) { R.claim(ch, 2400).to(c.e, -50, 4, true).say('かわいい！', c.e.type, 1100, 'wow').do(() => R.run('drop', { e: c.e, tgt: ch, x: ch.x, y: ch.y })); } });

  /* ================= えほん・クッション・いす ================= */
  R.add({ id: 'read', pri: 42, test: (c) => (isP(c.e, 'book') ? R.one(c.e.x, c.e.y, [], 'gaku') : null),
    run(c, rd) {
      const bk = c.e;
      R.claim(rd, 8000).to(bk, 0, -2, true).pose('sit', 300).do(() => { bk.open = true; bk.z = 0; }).say('むかし むかし…', 'book', 2000, 'talk').pose('sit', 2400).say('…めでたし めでたし！', 'star', 1600, 'yay').pose('cheer', 800).do(() => { bk.open = false; R.found('d_read'); });
      const ls = R.free(bk.x, bk.y, [rd], 1600).slice(0, 3);
      ls.forEach((l, i) => { const p = R.spot(bk.x, bk.y + 60, i, ls.length, 150); R.claim(l, 8000).go(p.x, p.y).look(bk.x).pose('sit', 4500).face('laugh', 1500).pose('cheer', 700).say(i === 0 ? 'もういっかい！' : '', null, 1200, 'yay'); });
    } });
  R.add({ id: 'pillow', pri: 40, test: (c) => (isP(c.e, 'cushion') && R.chars().length >= 2 ? R.one(c.e.x, c.e.y, [], 'pon') : null),
    run(c, ch) {
      const cu = c.e;
      const tgt = R.free(cu.x, cu.y, [ch], 1500)[0];
      if (!tgt) return R.nap(ch, cu);
      const throwIt = (from, to, n) => {
        W.act(from).look(to.x).pose('cheer', 300).say(n % 2 ? 'えいっ！' : 'それっ！', null, 900, 'yay').do(() => {
          const sx = from.x, sy = from.y, s = {};
          cu.hidden = false; from.holdType = null;
          R.tween(s, 700, (k) => { cu.x = PT.lerp(sx, to.x, k); cu.y = PT.lerp(sy, to.y, k) + 3; cu.z = 90 + Math.sin(k * Math.PI) * 110; cu.scale = W.depthScale(cu.y); }, () => {
            cu.z = 0; PT.audio.sfx('boing');
            W.act(to).face('laugh', 1200).say('あはは！', null, 900, 'laugh').pose('tickle', 500);
            if (n > 0) { cu.hidden = true; to.holdType = 'cushion'; W.after(600, () => throwIt(to, from, n - 1)); }
            else { R.found('d_pillow'); R.audience(to.x, to.y, [from, to], 'join', 1); }
          });
        });
      };
      R.claim(tgt, 7000).look(cu.x);
      R.claim(ch, 7000).to(cu, -40, 4, true).hold('cushion').do(() => { cu.hidden = true; throwIt(ch, tgt, 2); });
    } });
  R.add({ id: 'chair-sit', pri: 30, test: (c) => (isP(c.e, 'chair') ? R.one(c.e.x, c.e.y) : null),
    run(c, ch) { R.claim(ch, 4000).to(c.e, 0, 6, false).do(() => { R.ride(ch, c.e, { z: 22, pose: 'sit', dy: 6 }); }).say('すわっちゃお', 'chair', 1300).wait(2400).do(() => R.unride(ch)); } });

  /* ================= へんな ぼうし・かご・リュック ================= */
  R.add({ id: 'silly-hat', pri: 60, test: (c) => (c.e.kind === 'prop' && isC(c.tgt) && isP(c.e, ['bucket', 'plate', 'book', 'shell', 'acorn', 'duck', 'music', 'drum', 'chair', 'table', 'parasol', 'sheet', 'dino', 'train', 'trampoline', 'tricycle', 'car', 'slide', 'swimring', 'tent', 'flashlight', 'unicorn']) && !['swimring', 'tricycle', 'car', 'unicorn', 'slide', 'trampoline', 'flashlight', 'book'].includes(c.e.type) ? c.tgt : null),
    run(c, ch) {
      const it = c.e; W.remove(it);
      ch.headItem = it.type; PT.audio.sfx('boing');
      R.claim(ch, 4000).face('puzzled', 900).say('ぼうし？', '?', 1200, 'hmm').face('laugh', 1300).say('にあう？', null, 1300, 'laugh').pose('dance', 1200)
        .do(() => { R.found('d_sillyhat'); }).wait(800).do(() => { const p = W.clampFloor(ch.x + 60, ch.y + 4); const b = W.addProp(ch.headItem, p.x, p.y); if (b) b.pop = W.t; ch.headItem = null; });
      R.audience(ch.x, ch.y, [ch], 'laugh', 2, 700);
    } });
  R.shopping = (ch, bk) => {
    if (bk) { W.remove(bk); }
    ch.holdType = 'basket';
    const goods = nearP(ch.x, ch.y, 1400, (p) => p.def.food).slice(0, 2);
    const shelf = nearF(ch.x, ch.y, 2000, 'shop')[0];
    const a = R.claim(ch, 10000).say('おかいもの いってきます！', 'basket', 1500, 'yay').pose('hold', 400);
    goods.forEach((g) => a.to(g, -40, 4).do(() => { if (!g.removed) { W.remove(g); PT.audio.sfx('pop'); } }).say('これ ください', g.type, 1100));
    if (!goods.length && shelf) a.to(shelf, -100, 40).pose('peek', 900).say('りんご と バナナ', 'apple', 1300);
    const k = role('shop');
    if (k) a.to(k, k.x < ch.x ? 90 : -90, 30).look(k.x).say('おねがいします', 'basket', 1300).do(() => { PT.audio.sfx('bell'); R.claim(k, 2000).say('ありがとう ございます！', 'heart', 1400, 'yay').pose('bow', 900); });
    a.face('laugh', 1200).say('かえったよー！', 'heart', 1300, 'yay').pose('cheer', 700).do(() => { ch.holdType = null; const p = W.clampFloor(ch.x + 50, ch.y + 4); const b = W.addProp('basket', p.x, p.y); if (b) b.pop = W.t; R.found('d_buy'); });
  };
  R.add({ id: 'basket-char', pri: 72, test: (c) => (isP(c.e, 'basket') && isC(c.tgt) ? c.tgt : null), run(c, ch) { R.shopping(ch, c.e); } });
  R.add({ id: 'basket-floor', pri: 40, test: (c) => (isP(c.e, 'basket') ? R.one(c.e.x, c.e.y, [], 'mimi') : null), run(c, ch) { R.claim(ch, 2500).to(c.e, -40, 4, true).do(() => R.shopping(ch, c.e)); } });
  R.add({ id: 'bag', pri: 45, test: (c) => (isP(c.e, 'bag') ? (isC(c.tgt) ? c.tgt : R.one(c.e.x, c.e.y, [], 'moko')) : null),
    run(c, ch) {
      const bg = c.e;
      const friend = R.free(bg.x, bg.y, [ch], 1500)[0];
      R.claim(ch, 9000).to(bg, -30, 4, true).do(() => { W.remove(bg); ch.wear = Object.assign({}, ch.wear, { back: 'bag' }); PT.audio.sfx('pop'); }).say('おでかけ しよう！', 'bag', 1500, 'yay');
      const dest = W.randFloor(250);
      W.act(ch).go(dest.x, dest.y).pose('sit', 500).do(() => { const f = W.addProp('onigiri', ch.x + 50, ch.y + 4); f.pop = W.t; f.temp = true; }).say('おべんとう！', 'onigiri', 1400, 'yay').face('eat', 1200).pose('eat', 1200).face('laugh', 1000).do(() => R.found('d_bag'));
      if (friend) R.claim(friend, 9000).wait(1600).go(dest.x + 90, dest.y + 10).look(dest.x).say('まってー！', null, 1100).pose('sit', 1500).face('eat', 1200).pose('eat', 1200);
    } });

  /* ================= ちいさな のりもの ================= */
  R.driveAround = (ch, v, n = 3, line = 'ぶーん！', disc = 'd_drive') => {
    R.claim(ch, 12000).to(v, 0, -3, true).do(() => {
      R.ride(ch, v, { z: v.type === 'unicorn' ? 44 : v.type === 'swimring' ? 0 : 30, pose: v.type === 'swimring' ? 'swim' : 'ride', carry: true });
      PT.audio.sfx('pop');
      const a = W.act(ch).say(line, v.type, 1300, 'yay');
      for (let i = 0; i < n; i++) { const p = W.randFloor(180); a.go(p.x, p.y); }
      a.do(() => { R.unride(ch); R.found(disc); });
    });
  };
  R.add({ id: 'drive', pri: 45, test: (c) => (isP(c.e, ['tricycle', 'car']) && !c.e.rider ? R.one(c.e.x, c.e.y, [], 'gaku') : null), run(c, ch) { R.driveAround(ch, c.e); R.audience(ch.x, ch.y, [ch], 'join', 1, 2000); } });
  R.add({ id: 'unicorn', pri: 45, test: (c) => (isP(c.e, 'unicorn') && !c.e.rider ? R.one(c.e.x, c.e.y, [], 'mimi') : null),
    run(c, ch) {
      const u = c.e;
      R.claim(ch, 7000).to(u, 0, -3, true).do(() => { R.ride(ch, u, { z: 50, pose: 'ride' }); PT.audio.sfx('magic'); X.music(u.x, u.y - 160, 3000); })
        .say('ユニコーンさん！', 'unicorn', 1500, 'yay').do(() => { R.tween(ch, 3500, (k) => { ch.z = 50 + Math.sin(k * 18) * 8; if (Math.random() < 0.1) W.burst('spark', ch.x, ch.y - 100, 1, { sp: 0.1, max: 700, size: 8, col: PT.pick(['#ff8fab', '#ffd23f', '#7fd0e8']), g: 0 }); }, () => { R.unride(ch); R.found('d_unicorn'); }); });
    } });
  R.slideOn = (ch, s) => {
    const lx = s.x - 70 * s.scale, ly = s.y;
    R.claim(ch, 8000).go(lx, ly + 2, true).do(() => {
      ch.flip = false;
      R.tween(ch, 900, (k) => { ch.x = lx; ch.z = k * 150 * s.scale; ch.pose = 'carry'; }, () => {
        PT.audio.sfx('slide');
        R.tween(ch, 1000, (k) => { const e = PT.easeInOut(k); ch.x = lx + e * 170 * s.scale; ch.z = (1 - e) * 150 * s.scale; ch.pose = 'slide'; ch.face = 'laugh'; }, () => {
          ch.z = 0; ch.face = 'happy';
          R.claim(ch, 2000).say(PT.pick(['すいー！', 'もういっかい！', 'たのしい！']), 'star', 1300, 'yay').pose('cheer', 700).do(() => R.found('d_slide'));
        });
      });
    });
  };
  R.add({ id: 'slide-prop', pri: 45, test: (c) => (isP(c.e, 'slide') ? R.free(c.e.x, c.e.y, [], 2000).slice(0, 3) : null),
    run(c, list) { list.forEach((ch, i) => W.after(i * 2100, () => R.chars().includes(ch) && R.slideOn(ch, c.e))); } });
  R.add({ id: 'slide-char', pri: 75, test: (c) => (isC(c.e) && isP(c.tgt, 'slide') ? c.tgt : null), run(c, s) { R.slideOn(c.e, s); } });
  R.bounce = (ch, tr, n = 4) => {
    R.claim(ch, 8000).go(tr.x, tr.y - 2, true).do(() => {
      tr.boing = true; ch.stay = true;
      const a = W.act(ch);
      for (let i = 0; i < n; i++) a.jump(100 + i * 30, 620).sfx('boing');
      a.say('ぴょーん！', 'star', 1300, 'yay').do(() => { tr.boing = false; ch.stay = false; const p = W.clampFloor(tr.x + 110, tr.y + 20); ch.x = p.x; ch.y = p.y; R.found('d_tramp'); });
      R.mimic(ch, 'jump', 1400, 'ぴょんぴょん！');
    });
  };
  R.add({ id: 'tramp', pri: 45, test: (c) => (isP(c.e, 'trampoline') ? R.one(c.e.x, c.e.y, [], 'pon') : null), run(c, ch) { R.bounce(ch, c.e); } });
  R.add({ id: 'tramp-char', pri: 75, test: (c) => (isC(c.e) && isP(c.tgt, 'trampoline') ? c.tgt : null), run(c, t) { R.bounce(c.e, t); } });
  R.add({ id: 'ride-char', pri: 75, test: (c) => (isC(c.e) && isP(c.tgt, ['tricycle', 'car', 'unicorn', 'box']) && !c.tgt.rider ? c.tgt : null),
    run(c, v) { if (v.type === 'box') return R.boxPlay(v, boxMode(v), c.e); if (v.type === 'unicorn') return R.run('drop', { e: v, x: v.x, y: v.y }); R.driveAround(c.e, v); } });
  R.add({ id: 'train', pri: 50, test: (c) => (isP(c.e, 'train') && R.chars().length >= 2 ? R.one(c.e.x, c.e.y, [], 'gaku') : null),
    run(c, lead) {
      const tr = c.e;
      const cars = R.avail(tr.x, tr.y, [lead], 2500).slice(0, 4);
      R.claim(lead, 12000).to(tr, -10, -3, true).do(() => { R.ride(lead, tr, { z: 30, pose: 'ride', carry: true }); PT.audio.sfx('train'); }).say('しゅっぱつ しんこう！', 'train', 1600, 'yay');
      const pts = [W.randFloor(200), W.randFloor(200), W.randFloor(200), W.randFloor(200)];
      const al = W.act(lead).wait(600);
      pts.forEach((p) => al.go(p.x, p.y));
      al.say('とうちゃく〜', 'star', 1300, 'yay').do(() => { R.unride(lead); R.found('d_train'); });
      cars.forEach((ch, i) => {
        R.claim(ch, 14000).go(tr.x - 90 * (i + 1), tr.y + 4, true).say(i === 0 ? 'のせてー！' : 'ガタンゴトン', null, 1200);
        const leader = i === 0 ? lead : cars[i - 1];
        W.after(1500, () => R.follow(ch, () => leader, () => !!lead.riding, () => W.act(ch).face('laugh', 1000).say('たのしかった！', null, 1200, 'yay')));
      });
    } });
  R.add({ id: 'swimring', pri: 45, test: (c) => (isP(c.e, 'swimring') ? (isC(c.tgt) ? c.tgt : R.one(c.e.x, c.e.y, [], 'pon')) : null),
    run(c, ch) {
      const ring = c.e;
      const water = W.areaAt(ring.x, ring.y - 20)?.tag === 'water' || nearF(ring.x, ring.y, 200, 'water').length;
      if (water || W.stage.id === 'beach') { R.swimIn(ch, ring); return; }
      R.claim(ch, 6000).to(ring, 0, -3, true).do(() => { R.ride(ch, ring, { z: 10, pose: 'swim', carry: true }); }).say('およいでる つもり！', 'swimring', 1500, 'yay').go(ch.x + 140, ch.y).go(ch.x - 60, ch.y + 20).face('laugh', 1000)
        .do(() => { R.unride(ch); R.found('d_swim'); R.audience(ch.x, ch.y, [ch], 'laugh', 1); });
    } });
  R.swimIn = (ch, ring) => {
    const sea = W.fixes().find((f) => f.def.area === 'water');
    const wx = sea ? PT.clamp(ring.x, sea.x - sea.w / 2 + 120, sea.x + sea.w / 2 - 120) : ring.x;
    const wy = sea ? sea.y - Math.min(60, sea.h * 0.4) : ring.y;
    R.claim(ch, 9000).go(wx, sea ? sea.y + 10 : wy, true).do(() => {
      ring.x = wx; ring.y = wy; ring.scale = W.depthScale(wy + 60);
      ch.x = wx; ch.y = wy - 2; ch.rest = 'swim'; ch.riding = ring; ch.stay = true; ch.baseZ = 0; ring.rider = ch.id;
      X.splash(wx, wy);
      R.tween(ch, 4200, (k) => { ch.x = wx + Math.sin(k * 6) * 60; ring.x = ch.x; }, () => { R.claim(ch, 1500).say('つめたくて きもちいい！', 'swimring', 1500, 'yay'); W.after(1600, () => { R.unride(ch); R.found('d_swim'); }); });
    });
  };
  R.add({ id: 'tent', pri: 45, test: (c) => (isP(c.e, 'tent') ? R.free(c.e.x, c.e.y, [], 2000).slice(0, 3) : null), run(c, list) { R.camp(c.e, list); } });
  R.camp = (tent, list) => {
    list.forEach((ch, i) => {
      R.claim(ch, 9000).go(tent.x - 30 + i * 30, tent.y + 30, true).say(i === 0 ? 'キャンプ しよう！' : '', 'tent', 1300, 'yay').do(() => { ch.hidden = true; })
        .wait(2600).do(() => { ch.hidden = false; ch.y = tent.y + 40; ch.scale = W.depthScale(ch.y); }).pose('cheer', 900).say(i === 0 ? 'おはよう！' : i === 1 ? 'よく ねた〜' : 'あさだ！', 'star', 1300, 'yay');
    });
    W.after(2500, () => { W.burst('zzz', tent.x, tent.y - (tent.kind === 'fix' ? tent.h : 140), 3, { up: true, sp: 0.04, minSp: 0.02, g: -0.00001, max: 1800, size: 24, col: '#7a8fb8' }); });
    W.after(4400, () => { PT.audio.sfx('ding'); R.found('d_tent'); });
  };

  /* ================= おと・ふしぎ ================= */
  R.bubbleChase = (x, y) => {
    const list = R.avail(x, y, [], 2500).slice(0, 4);
    list.forEach((ch, i) => {
      const a = R.claim(ch, 7000).say(i === 0 ? 'シャボンだま！' : '', 'bubbles', 1300, 'yay');
      for (let k = 0; k < 3; k++) { const b = PT.pick(W.bubbles) || { x, y: y - 100 }; const p = W.clampFloor(b.x + PT.rand(-40, 40), Math.max(W.stage.floor[0] + 40, b.y + 220)); a.go(p.x, p.y, true).jump(70, 500); }
      a.face('laugh', 1200).say('パチン！', 'star', 1000, 'laugh');
    });
  };
  R.add({ id: 'bubbles', pri: 50, test: (c) => (isP(c.e, 'bubbles') ? 1 : null),
    run(c) { const b = c.e; W.remove(b); W.addBubbles(b.x, b.y, 18); PT.audio.sfx('bubble'); R.bubbleChase(b.x, b.y); W.after(1800, () => R.found('d_bubbles')); } });
  R.danceAll = (x, y, ms = 5000) => {
    const list = R.avail(x, y, [], 3000);
    const choco = list.find((c) => c.cid === 'choco');
    list.forEach((ch, i) => {
      const lead = ch === choco || (!choco && i === 0);
      R.claim(ch, ms + 800).wait(lead ? 0 : 600 + i * 200).look(x).say(lead ? 'おどろう！' : '', lead ? 'note' : null, 1300, 'yay').pose('dance', ms - 1000).face('laugh', 1000).pose('cheer', 600);
    });
  };
  R.add({ id: 'music', pri: 50, test: (c) => (isP(c.e, 'music') ? 1 : null),
    run(c) { const m = c.e; m.playing = true; m.playUntil = W.t + 9000; X.music(m.x, m.y - 90, 8000); PT.audio.sfx('jingle'); R.danceAll(m.x, m.y, 6000); W.after(2500, () => R.found('d_dance')); W.after(9000, () => { m.playing = false; }); } });
  R.add({ id: 'music-tap', on: 'tapprop', pri: 50, test: (c) => (isP(c.e, 'music') ? 1 : null), run(c) { R.run('drop', { e: c.e, x: c.e.x, y: c.e.y }); } });
  R.add({ id: 'balloon', pri: 45, test: (c) => (isP(c.e, 'balloon') ? (isC(c.tgt) ? c.tgt : R.one(c.e.x, c.e.y)) : null),
    run(c, ch) {
      const b = c.e;
      const go = c.tgt === ch ? R.claim(ch, 6000) : R.claim(ch, 6000).go(b.x, Math.max(b.y, W.stage.floor[0] + 40), true).jump(80, 500);
      go.do(() => { W.remove(b); ch.holdType = 'balloon'; ch.balloonColor = b.color; PT.audio.sfx('pop'); }).say('ふうせん！', 'balloon', 1300, 'yay')
        .do(() => { R.tween(ch, 2400, (k) => { ch.z = Math.sin(k * Math.PI) * 60; ch.pose = 'hold'; }, () => { ch.z = 0; R.found('d_balloon'); }); })
        .wait(2500).say('ふわふわ〜', 'heart', 1300);
      W.after(9000, () => { if (ch.holdType === 'balloon' && R.chars().includes(ch) && W.isFree(ch)) R.balloonFly(ch); });
    } });
  R.balloonFly = (ch) => {
    ch.holdType = null;
    const b = W.addProp('balloon', ch.x + 20, ch.y + 2, { fly: 0.12, temp: true, color: ch.balloonColor });
    b.z = 120 * ch.scale;
    R.claim(ch, 4000).face('surprise', 900).say('あっ！ とんでった！', '!', 1300, 'wow').pose('point', 1200).jump(60, 500).face('laugh', 1200).say('ばいばーい！', 'heart', 1300, 'laugh').pose('wave', 1200);
    R.audience(ch.x, ch.y, [ch], 'wow', 3, 400).forEach((o) => W.act(o).go(ch.x + PT.rand(-150, 150), ch.y + PT.rand(-30, 30), true).jump(70, 500).pose('wave', 1000));
    W.after(1500, () => R.found('d_balloonfly'));
  };
  R.add({ id: 'balloon-tap', on: 'tapchar', pri: 70, test: (c) => (c.e.holdType === 'balloon' ? 1 : null), run(c) { R.balloonFly(c.e); } });
  R.add({ id: 'confetti', pri: 50, test: (c) => (isP(c.e, 'confetti') ? 1 : null),
    run(c) { W.remove(c.e); X.confetti(c.e.x); R.avail(c.e.x, c.e.y).forEach((ch, i) => R.claim(ch, 2600).wait(i * 150).face('laugh', 1800).say(i === 0 ? 'おめでとう！' : '', null, 1400, 'yay').pose('cheer', 1800)); W.after(800, () => R.found('d_confetti')); } });
  R.add({ id: 'star', pri: 45, test: (c) => (isP(c.e, 'star') ? R.one(c.e.x, c.e.y, [], 'mimi') : null),
    run(c, ch) {
      const st = c.e;
      if (st.y > W.stage.floor[0] + 40) st.zTarget = 200;
      const list = [ch].concat(R.free(st.x, st.y, [ch], 1500).slice(0, 2));
      list.forEach((k, i) => R.claim(k, 6000).look(st.x).face('surprise', 900).say(i === 0 ? 'おねがいごと しよう！' : '', 'star', 1500, 'wow').pose('shy', 2200).face('love', 1200));
      W.after(2600, () => {
        PT.audio.sfx('magic');
        const p = W.clampFloor(st.x + 40, Math.max(st.y + 60, W.stage.floor[0] + 60));
        const g = W.addProp('present', p.x, p.y, { temp: true });
        g.z = 300; g.zTarget = 0; g.pop = W.t;
        W.burst('star', p.x, p.y - 200, 10, { sp: 0.2, max: 900 });
        W.act(ch).wait(600).say('プレゼントだ！', 'present', 1500, 'yay').pose('cheer', 900);
        R.found('d_star');
      });
    } });
  /* プレゼントを タップ → なにかが でてくる */
  R.add({ id: 'present-tap', on: 'tapprop', pri: 60, test: (c) => (isP(c.e, 'present') ? 1 : null),
    run(c) {
      const g = c.e; W.remove(g); PT.audio.sfx('sparkle'); W.burst('star', g.x, g.y - 40, 12, { up: true, sp: 0.25 });
      const pool = ['ball', 'teddy', 'bunny', 'cake', 'balloon', 'dino', 'music', 'star', 'train'];
      const it = W.addProp(PT.pick(pool), g.x, g.y); if (it) { it.pop = W.t; if (it.def.float) it.y = g.y - 80; }
      const ch = R.free(g.x, g.y, [], 900)[0];
      if (ch) R.claim(ch, 2400).look(g.x).face('surprise', 800).say('わあ！', it ? it.type : '!', 1400, 'wow').pose('cheer', 900);
    } });
  R.add({ id: 'drum', pri: 48, test: (c) => (isP(c.e, 'drum') ? R.one(c.e.x, c.e.y, [], 'gaku') : null),
    run(c, ch) {
      const dr = c.e;
      const band = R.avail(dr.x, dr.y, [ch], 2500).slice(0, 4);
      R.claim(ch, 12000).to(dr, -40, 4, true).hold('drum').do(() => { W.remove(dr); }).say('パレード しゅっぱつ！', 'drum', 1500, 'yay');
      const pts = [W.randFloor(200), W.randFloor(200), W.randFloor(200)];
      const a = W.act(ch);
      pts.forEach((p) => a.go(p.x, p.y).sfx('drum').pose('march', 300).sfx('drum'));
      a.say('ドンドン！', 'note', 1200, 'yay').unhold().do(() => { const p = W.clampFloor(ch.x + 50, ch.y + 4); W.addProp('drum', p.x, p.y).pop = W.t; R.found('d_parade'); });
      band.forEach((o, i) => {
        R.claim(o, 12000).say(i === 0 ? 'いれて！' : '', null, 1100, 'yay');
        const leader = i === 0 ? ch : band[i - 1];
        W.after(1500, () => R.follow(o, () => leader, () => ch.holdType === 'drum', () => W.act(o).pose('cheer', 900).face('laugh', 900)));
      });
    } });
  R.magic = (ch) => {
    const MAP = { apple: 'cake', onigiri: 'cake', ball: 'balloon', bread: 'cake', banana: 'star', shell: 'present', acorn: 'flower', chair: 'unicorn', cushion: 'teddy', bucket: 'castle', plate: 'cake', book: 'music' };
    const tgt = nearP(ch.x, ch.y, 900, (p) => !p.temp && (MAP[p.type] || tag(p, 'plush') || p.type === 'box'))[0];
    PT.audio.sfx('magic');
    if (!tgt) { X.sparkleRain(2500); R.claim(ch, 3000).say('きらきら〜', 'star', 1300, 'yay').do(() => { R.tween(ch, 1800, (k) => { ch.z = Math.sin(k * Math.PI) * 120; }, () => { ch.z = 0; }); }); return; }
    X.beam(ch.x, ch.y - 110 * ch.scale, tgt.x, tgt.y - 40, 900);
    W.after(700, () => {
      W.burst('star', tgt.x, tgt.y - 50, 14, { sp: 0.25, max: 900 }); W.poof(tgt.x, tgt.y - 40);
      if (tag(tgt, 'plush')) { tgt.wobbleUntil = W.t + 4000; R.tween(tgt, 3000, (k) => { tgt.z = Math.abs(Math.sin(k * 12)) * 50; }, () => { tgt.z = 0; }); W.act(ch).say('ぬいぐるみが おどった！', 'note', 1500, 'wow'); }
      else if (tgt.type === 'box') { R.boxPlay(tgt, 'rocket'); }
      else { const nt = MAP[tgt.type]; const n = W.addProp(nt, tgt.x, tgt.y); W.remove(tgt); if (n) { n.pop = W.t; if (n.def.float) n.y -= 80; } W.act(ch).say('へんしん！', nt, 1500, 'wow'); }
      R.audience(ch.x, ch.y, [ch], 'wow', 2, 300);
    });
  };
  R.add({ id: 'wand', pri: 50, test: (c) => (isP(c.e, 'wand') ? (isC(c.tgt) ? c.tgt : R.one(c.e.x, c.e.y, [], 'choco')) : null),
    run(c, ch) { const w = c.e; R.claim(ch, 5000).to(w, -40, 4, true).hold('wand').do(() => { w.hidden = true; }).say('ちちんぷいぷい！', 'wand', 1500, 'yay').pose('point', 600).do(() => { R.magic(ch); }).wait(2200).unhold().do(() => { w.hidden = false; w.x = ch.x + 40; w.y = ch.y + 4; R.found('d_wand'); }); } });
  R.add({ id: 'rainbow', pri: 50, test: (c) => (isP(c.e, 'rainbow') ? 1 : null),
    run(c) { W.remove(c.e); X.rainbow(); PT.audio.sfx('sparkle'); R.avail(800, 700).forEach((ch, i) => R.claim(ch, 3500).wait(i * 200).face('surprise', 1000).look(800).say(i === 0 ? 'にじだー！' : i === 1 ? 'きれい！' : '', 'rainbow', 1500, 'wow').pose('point', 1400).face('love', 1000)); W.after(900, () => R.found('d_rainbow')); } });
  R.add({ id: 'firework', pri: 50, test: (c) => (isP(c.e, 'firework') ? 1 : null),
    run(c) {
      W.remove(c.e);
      for (let i = 0; i < 5; i++) W.after(i * 600, () => X.firework(PT.rand(Math.max(250, W.visLeft + 200), Math.min(1350, W.visRight - 200)), PT.rand(120, 300)));
      R.avail(800, 700).forEach((ch, i) => R.claim(ch, 4000).wait(i * 200).look(800).face('surprise', 900).say(i === 0 ? 'たまやー！' : i === 1 ? 'どーん！' : '', 'firework', 1500, 'wow').pose('cheer', 1800));
      W.after(1800, () => R.found('d_firework'));
    } });

  /* ================= すな・かいがら・どんぐり・アヒル ================= */
  const inSand = (x, y) => W.stage.id === 'beach' || W.areaAt(x, y - 10)?.tag === 'sand' || nearF(x, y, 160, 'sand').length;
  R.buildCastle = (x, y, bucket) => {
    const ch = R.one(x, y, [], 'gaku');
    if (!ch) return;
    const helper = R.free(x, y, [ch], 1500)[0];
    const pos = W.clampFloor(x + 90, y + 6);
    let castle = null;
    R.claim(ch, 9000).go(pos.x - 90, pos.y + 4, true).look(pos.x).say('おしろを つくろう！', 'castle', 1500, 'yay')
      .pose('peek', 800).do(() => { X.dig(pos.x, pos.y); castle = W.addProp('castle', pos.x, pos.y, { level: 1, temp: false }); castle.pop = W.t; PT.audio.sfx('place'); })
      .pose('peek', 900).do(() => { X.dig(pos.x, pos.y); castle.level = 2; castle.pop = W.t; PT.audio.sfx('place'); })
      .pose('peek', 900).do(() => { X.dig(pos.x, pos.y); castle.level = 3; castle.pop = W.t; castle.shells = !!firstP(pos.x, pos.y, 500, 'shell'); PT.audio.sfx('sparkle'); W.burst('star', pos.x, pos.y - 120, 8, { up: true, sp: 0.2 }); })
      .say('できたー！', 'star', 1500, 'yay').pose('cheer', 900).do(() => { R.found('d_sandcastle'); if (W.stage.id === 'beach') R.chain('wave', { e: castle, x: castle.x, y: castle.y }, 1500); });
    if (helper) { const p2 = W.clampFloor(pos.x + 100, pos.y + 10); R.claim(helper, 6000).go(p2.x, p2.y, true).look(pos.x).say('てつだう！', null, 1100, 'yay').pose('peek', 2600).face('laugh', 1000); }
  };
  R.add({ id: 'sandcastle', pri: 70, test: (c) => (isP(c.e, 'bucket') && inSand(c.e.x, c.e.y) ? 1 : null), run(c) { R.buildCastle(c.e.x, c.e.y, c.e); } });
  R.add({ id: 'shell', pri: 48, test: (c) => (isP(c.e, 'shell') ? R.free(c.e.x, c.e.y, [], 2000).slice(0, 2) : null),
    run(c, list) {
      const sh = c.e;
      list.forEach((ch, i) => {
        const a = R.claim(ch, 9000).say(i === 0 ? 'たからさがしだ！' : 'わたしも！', 'shell', 1300, 'yay');
        for (let k = 0; k < 2; k++) { const p = W.randFloor(200); a.go(p.x, p.y, true).pose('peek', 800).do(() => { X.dig(ch.x + 30, ch.y); if (Math.random() < 0.6) { const s = W.addProp('shell', ch.x + 40, ch.y + 4, { temp: true }); if (s) s.pop = W.t; } }); }
        if (i === 0) a.say('みつけた！ たからものだ！', 'present', 1600, 'wow').do(() => { const g = W.addProp('present', ch.x + 50, ch.y + 6, { temp: true }); g.pop = W.t; PT.audio.sfx('discover'); R.found('d_shell'); });
        else a.hold('shell').say('うみの おとが するよ', 'note', 1600).pose('shy', 1200).unhold();
      });
    } });
  R.add({ id: 'acorn', pri: 48, test: (c) => (isP(c.e, 'acorn') ? 1 : null),
    run(c) {
      const ac = c.e;
      const fromL = ac.x > 800;
      const sx = fromL ? W.visRight + 40 : W.visLeft - 40;
      const crit = W.stage.id === 'park' ? 'bird' : 'squirrel';
      X.critter(crit, [[sx, crit === 'bird' ? 200 : ac.y + 10, 1], [ac.x + 30, ac.y + 4, 1800], [ac.x + 30, ac.y + 4, 1400], [sx, crit === 'bird' ? 150 : ac.y + 30, 1800]], { onLeg: (f, i) => { if (i === 2 && !ac.removed) { W.remove(ac); f.carry = true; } } });
      X.critter(crit, [[sx, ac.y + 40, 1], [sx, ac.y + 40, 600], [ac.x - 40, ac.y + 30, 1800], [ac.x - 40, ac.y + 30, 1200], [sx, ac.y + 50, 1800]]);
      R.avail(ac.x, ac.y, [], 1500).slice(0, 3).forEach((ch, i) => R.claim(ch, 5000).wait(1200 + i * 200).look(ac.x).face('surprise', 900).say(i === 0 ? 'しーっ…' : i === 1 ? 'かわいい！' : 'どうぶつさんだ', 'heart', 1600, i === 0 ? null : 'wow').pose('shy', 2000));
      W.after(2600, () => R.found('d_animals'));
    } });
  R.add({ id: 'duck-water', pri: 70, test: (c) => {
    if (!isP(c.e, 'duck')) return null;
    const w = c.area?.tag === 'water' ? c.area.fix : nearF(c.e.x, c.e.y, 160, 'water')[0];
    return w || null;
  }, run(c, w) {
    const d = c.e;
    const cx = PT.clamp(d.x, w.x - w.w * 0.35, w.x + w.w * 0.35);
    const cy = w.y - (w.type === 'sea' ? 60 : 50);
    d.x = cx; d.y = cy; d.scale = W.depthScale(w.y); d.keep = true; d.float = true;
    PT.audio.sfx('quack'); X.splash(cx, cy);
    R.tween(d, 6000, (k) => { d.x = cx + Math.sin(k * PT.TAU) * 70; d.z = Math.abs(Math.sin(k * 30)) * 3; }, () => {});
    const list = R.avail(cx, w.y, [], 2000).slice(0, 3);
    list.forEach((ch, i) => { const p = W.clampFloor(cx - 150 + i * 150, w.y + 30); R.claim(ch, 6000).go(p.x, p.y, true).look(cx).say(i === 0 ? 'アヒルさーん！' : '', 'duck', 1400, 'yay').pose('wave', 1600).face('laugh', 1200); });
    W.after(1500, () => { PT.audio.sfx('quack'); R.found('d_duck'); const br = firstP(cx, w.y, 700, 'bread'); if (br) R.chain('drop', { e: br, x: br.x, y: br.y }, 600); });
  } });
  R.add({ id: 'feed-duck', pri: 80, test: (c) => {
    if (!isP(c.e, 'bread')) return null;
    const d = W.props().find((p) => p.type === 'duck' && p.float && Math.hypot(p.x - c.e.x, p.y - c.e.y) < 700);
    return d || null;
  }, run(c, d) {
    const br = c.e;
    const ch = R.one(br.x, br.y, [], 'moko');
    if (!ch) return;
    R.claim(ch, 7000).to(br, -40, 4, true).hold('bread').do(() => { W.remove(br); }).go(d.x - 60, d.y + 90).look(d.x).say('はい どうぞ', 'bread', 1400).pose('point', 900)
      .do(() => { ch.holdType = null; PT.audio.sfx('quack'); W.burst('heart', d.x, d.y - 70, 6, { up: true, sp: 0.12, max: 900 }); d.wobbleUntil = W.t + 1500; W.bigText('ガァガァ！', d.x, d.y - 120, '#ff9f43'); })
      .face('laugh', 1200).say('たべた！', 'heart', 1300, 'yay').pose('cheer', 900).do(() => R.found('d_feedduck'));
  } });
  R.add({ id: 'duck-walk', pri: 40, test: (c) => (isP(c.e, 'duck') && R.chars().length >= 2 ? R.free(c.e.x, c.e.y, [], 2500).slice(0, 3) : null),
    run(c, list) {
      const d = c.e;
      const pts = [W.randFloor(200), W.randFloor(200), W.randFloor(200)];
      let seg = 0; const sx = d.x, sy = d.y;
      const route = [{ x: sx, y: sy }].concat(pts);
      R.tween(d, 7000, (k) => { const f = k * 3; seg = Math.min(2, Math.floor(f)); const kk = f - seg; d.x = PT.lerp(route[seg].x, route[seg + 1].x, kk); d.y = PT.lerp(route[seg].y, route[seg + 1].y, kk); d.scale = W.depthScale(d.y); d.z = Math.abs(Math.sin(k * 60)) * 6; }, () => { d.z = 0; R.found('d_duckwalk'); });
      PT.audio.sfx('quack');
      list.forEach((ch, i) => {
        R.claim(ch, 9000).say(i === 0 ? 'アヒルさん まってー' : '', 'duck', 1300, 'yay');
        W.after(300, () => R.follow(ch, () => (i === 0 ? d : list[i - 1]), () => !!d.inTween, () => W.act(ch).face('laugh', 1000).say(i === 0 ? 'ガァガァ！' : '', null, 1000, 'laugh').pose('cheer', 700)));
      });
    } });
})();
