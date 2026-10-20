/* ふえた ステージの あそび（タップ・キャラを のせる） */
'use strict';
(() => {
  const W = PT.world, R = PT.R, D = R.D, X = PT.FX;
  const { isC } = R.h;
  const onFix = (c, type) => (c.tgt && c.tgt.kind === 'fix' && c.tgt.type === type ? c.tgt : null);
  const tapFix = (c, type) => (c.e.kind === 'fix' && c.e.type === type ? c.e : null);
  const A = PT.audio;
  const spark = (x, y, col = '#ffd23f', n = 10) => W.burst('spark', x, y, n, { sp: 0.2, max: 800, size: 10, col, g: 0 });
  const hearts = (x, y, n = 5) => W.burst('heart', x, y, n, { up: true, sp: 0.12, max: 900 });
  const notes = (x, y) => W.burst('note', x, y, 6, { up: true, sp: 0.12, max: 1200 });
  const near = (f, n = 2, r = 1600) => R.free(f.x, f.y, [], r).slice(0, n);
  /* タップと のせたときを まとめて とうろく */
  const T = (stage, type, disc, tap, put) => {
    if (tap) R.add({ id: type + '-tap', on: 'tapfix', pri: 52, stage, test: (c) => tapFix(c, type), run(c, f) { tap(f); W.after(900, () => R.found(disc)); } });
    if (put) R.add({ id: type + '-char', pri: 78, stage, test: (c) => (isC(c.e) ? onFix(c, type) : null), run(c, f) { put(c.e, f); W.after(1500, () => R.found(disc)); } });
  };
  const lineUp = (f, lines, pose = 'cheer') => near(f, 2, 1500).forEach((ch, i) => R.claim(ch, 3000).wait(300 + i * 300).look(f.x).face('surprise', 800).say(lines[i % lines.length], null, 1400, 'wow').pose(pose, 900));
  const back = (ch, f, dx = 160) => { ch.stay = false; ch.z = 0; ch.baseZ = 0; ch.rest = 'idle'; const p = W.clampFloor(f.x + dx, f.y + 40); ch.x = p.x; ch.y = p.y; ch.scale = W.depthScale(ch.y); };

  /* 13 ゆきの ひろば */
  D('d_snowman2', 'ゆきだるまの あいさつ', 'ゆきだるまを タップすると てを ふって マフラーが かわる', ['snowmanF'], 'snow');
  D('d_igloo', 'かまくらで ぬくぬく', 'かまくらに はいると なかが ぽかぽか あかるく', ['igloo', 'penta'], 'snow');
  D('d_sled', 'そりすべり', 'さかの うえから そりで しゅーっ！', ['sledhill', 'yuto'], 'snow');
  T('snow', 'snowmanF', 'd_snowman2', (f) => { f.wave = W.t + 1600; f.scarf = PT.pick(['#ff6f91', '#58b9f0', '#ffd23f', '#7bd36a', '#9b8cff']); A.sfx('bell'); spark(f.x, f.y - 200, '#ffffff'); lineUp(f, ['こんにちは ゆきだるまさん！', 'マフラー かわいい！']); },
    (ch, f) => { R.claim(ch, 4000).go(f.x + 100, f.y + 20, true).look(f.x).pose('hug', 1400).say('つめたーい！', 'snowman', 1400, 'laugh').face('laugh', 1000); hearts(f.x, f.y - 160); });
  T('snow', 'igloo', 'd_igloo', (f) => { f.glow = W.t + 3000; A.sfx('ding'); spark(f.x, f.y - 60, '#ffd76a'); lineUp(f, ['なかが あかるい！', 'あったかそう！']); },
    (ch, f) => { f.glow = W.t + 4000; R.claim(ch, 5000).go(f.x, f.y + 4, true).do(() => { ch.hidden = true; A.sfx('pop'); }).wait(2200).do(() => { ch.hidden = false; back(ch, f, 0); W.burst('zzz', f.x, f.y - 120, 2, { up: true }); }).say('ぽかぽか〜', 'heart', 1400, 'yay').pose('cheer', 900); });
  T('snow', 'sledhill', 'd_sled', (f) => { const ch = near(f, 1)[0]; if (ch) slide(ch, f); },
    (ch, f) => slide(ch, f));
  function slide(ch, f) {
    R.claim(ch, 5000).go(f.x - 150, f.y + 10, true).do(() => {
      ch.stay = true; A.sfx('whoosh');
      R.tween(ch, 1500, (k) => { ch.x = f.x - 170 + k * 380; ch.y = f.y; ch.z = Math.max(0, 200 * (1 - k) * (1 - k) * 1.0); ch.pose = 'slide'; ch.flip = false; ch.scale = W.depthScale(ch.y); }, () => { back(ch, f, 230); R.claim(ch, 2000).say('もういっかい！', 'star', 1300, 'yay').pose('cheer', 800); W.burst('smoke', ch.x, ch.y, 8, { sp: 0.15, col: '#ffffff', g: 0 }); });
    });
  }

  /* 14 すいぞくかん */
  D('d_tank', 'さかなの パレード', 'すいそうを タップすると さかなが ぐるぐる', ['bigtank', 'mimi'], 'aqua');
  D('d_dolphin', 'イルカショー', 'イルカが ジャンプ！ みんなで はくしゅ', ['dolphinpool'], 'aqua');
  D('d_penguin2', 'ペンギンの すべりだい', 'ペンギンが いわの うえから つるーん', ['penguinrock', 'penta'], 'aqua');
  T('aqua', 'bigtank', 'd_tank', (f) => { f.swirl = W.t + 3000; A.sfx('bubble'); W.addBubbles(f.x, f.y - 100, 10); lineUp(f, ['おさかな はやーい！', 'きれい〜！']); },
    (ch, f) => { R.claim(ch, 4000).go(f.x + PT.rand(-150, 150), f.y + 30, true).look(f.x).pose('peek', 1600).say('おさかなさん こんにちは', 'heart', 1500, 'talk'); f.swirl = W.t + 2500; });
  T('aqua', 'dolphinpool', 'd_dolphin', (f) => { f.jump = W.t + 1600; A.sfx('splash'); W.after(1500, () => { X.splash && X.splash(f.x + 140, f.y - 50); }); near(f, 3).forEach((ch, i) => R.claim(ch, 3000).wait(900 + i * 200).look(f.x).pose('cheer', 1000).say(PT.pick(['すごーい！', 'ジャンプ した！', 'パチパチ！']), 'star', 1300, 'yay')); }, null);
  T('aqua', 'penguinrock', 'd_penguin2', (f) => { f.slide = W.t + 1500; A.sfx('slide'); W.after(1400, () => A.sfx('splash')); lineUp(f, ['つるーん！', 'ペンギン かわいい！']); },
    (ch, f) => { f.slide = W.t + 1500; R.claim(ch, 4000).go(f.x + 140, f.y + 20, true).look(f.x).pose('fly', 1200).say('ペンギン みたいに ペタペタ', 'heart', 1500, 'laugh'); });

  /* 15 どうぶつえん */
  D('d_giraffe', 'キリンの おしょくじ', 'くびを のばして はっぱを もぐもぐ', ['giraffe', 'banana'], 'zoo');
  D('d_elephant', 'ゾウさんの シャワー', 'ゾウさんが はなで みずを ぴゅー', ['elephantF'], 'zoo');
  D('d_monkey', 'おさるの ブランコ', 'おさるさんが ぶらーん ぶらーん', ['monkeytree', 'pon'], 'zoo');
  T('zoo', 'giraffe', 'd_giraffe', (f) => { f.eat = W.t + 1800; A.sfx('munch'); W.burst('leaf', f.x + 80, f.y - 380, 6, { sp: 0.15 }); lineUp(f, ['くびが のびた！', 'もぐもぐ してる']); },
    (ch, f) => { R.claim(ch, 4000).go(f.x + 120, f.y + 20, true).look(f.x).jump(80, 600).say('せが たかーい！', 'star', 1500, 'wow').pose('point', 900); f.eat = W.t + 1800; });
  T('zoo', 'elephantF', 'd_elephant', (f) => { f.spray = W.t + 2400; A.sfx('splash'); const ch = near(f, 1)[0]; if (ch) R.claim(ch, 3000).go(f.x + 230, f.y + 20, true).face('laugh', 1400).say('つめたーい！', 'drop', 1400, 'laugh').pose('tickle', 900); },
    (ch, f) => { f.spray = W.t + 2400; A.sfx('splash'); R.claim(ch, 4000).go(f.x + 220, f.y + 20, true).face('laugh', 1400).say('シャワー きもちいい！', 'drop', 1500, 'laugh').pose('dance', 1200); });
  T('zoo', 'monkeytree', 'd_monkey', (f) => { f.swing = W.t + 2500; A.sfx('tickle'); lineUp(f, ['ウキキ！', 'たのしそう！'], 'jump'); },
    (ch, f) => { f.swing = W.t + 2500; R.claim(ch, 4000).go(f.x - 100, f.y + 20, true).look(f.x).pose('jump', 500).jump(70, 500).jump(70, 500).say('ウッキー！', 'banana', 1400, 'laugh').pose('tickle', 900); });

  /* 16 ぼくじょう */
  D('d_barn', 'こやの なかには？', 'こやを あけると どうぶつたちが こんにちは', ['barn'], 'farm');
  D('d_cow', 'ウシさんの ミルク', 'ウシさんを タップすると「モー」。ミルクが でてくる', ['cowF', 'juice'], 'farm');
  D('d_egg', 'たまご みつけた', 'にわとりごやを タップすると たまごが ころん', ['henhouse', 'egg'], 'farm');
  T('farm', 'barn', 'd_barn', (f) => { f.open = W.t + 3500; A.sfx('quack'); X.critter && X.critter('kitty', [[f.x, f.y, 1], [f.x + 300, f.y + 60, 1600], [f.x + 500, f.y + 100, 1500]], {}); lineUp(f, ['だれか いる！', 'こんにちは〜！']); }, null);
  T('farm', 'cowF', 'd_cow', (f) => { f.moo = W.t + 1500; A.tone(150, 0.8, { type: 'sawtooth', slide: 0.8, vol: 0.12, vib: 6 }); const p = W.addProp('juice', f.x + 140, f.y + 30); p.pop = W.t; lineUp(f, ['モー だって！', 'ミルク でた！']); },
    (ch, f) => { f.moo = W.t + 1500; R.claim(ch, 4000).go(f.x + 140, f.y + 20, true).look(f.x).pose('hug', 1400).say('ふわふわ…じゃなくて すべすべ', 'heart', 1600, 'laugh'); });
  T('farm', 'henhouse', 'd_egg', (f) => { A.sfx('pop'); const p = W.addProp('egg', f.x + PT.rand(-40, 40), f.y + 40); p.pop = W.t; lineUp(f, ['たまご！', 'コケコッコー！']); }, null);

  /* 17 ケーキやさん */
  D('d_oven', 'やきたて おかし', 'オーブンを タップすると ケーキや パンが やけるよ', ['oven', 'cake'], 'bakery');
  D('d_showcase', 'どれに しようかな', 'ショーケースを タップして おかしを えらぼう', ['showcase', 'mimi'], 'bakery');
  T('bakery', 'oven', 'd_oven', (f) => { f.bake = W.t + 1800; A.sfx('drumroll'); W.after(1800, () => { A.sfx('ding'); const it = PT.pick(['cake', 'bread', 'cookie', 'donut', 'pancake', 'pudding']); const p = W.addProp(it, f.x + 150, f.y + 30); p.pop = W.t; spark(p.x, p.y - 60); W.burst('smoke', f.x, f.y - 200, 6, { sp: 0.1, col: '#ffffff', g: 0, up: true }); }); lineUp(f, ['いい におい〜', 'なにが やけるかな？']); }, null);
  T('bakery', 'showcase', 'd_showcase', (f) => { const ch = near(f, 1)[0]; A.sfx('ui'); spark(f.x, f.y - 160, '#ff8fb1'); if (ch) { const it = PT.pick(['cake', 'donut', 'cookie', 'pudding', 'royalcake']); R.claim(ch, 4500).go(f.x + 60, f.y + 40, true).look(f.x).say('これ ください！', it, 1400, 'yay').hold(it).pose('eat', 1400).say('おいしい！', 'heart', 1300, 'yay').unhold(); } }, null);

  /* 18 おしろ */
  D('d_throne2', 'おうさまに なった', 'おうさまの いすに すわると かんむりが のるよ', ['throneF', 'royalcrown'], 'castle');
  D('d_chand2', 'シャンデリアの きらめき', 'シャンデリアを タップすると ダンスが はじまる', ['chandelierF', 'gown_rose'], 'castle');
  T('castle', 'throneF', 'd_throne2', (f) => { const ch = near(f, 1)[0]; if (ch) sitThrone(ch, f); }, (ch, f) => sitThrone(ch, f));
  function sitThrone(ch, f) {
    R.claim(ch, 5000).go(f.x, f.y + 6, true).do(() => { ch.stay = true; ch.x = f.x; ch.y = f.y - 4; ch.z = 60; ch.rest = 'sit'; ch.flip = false; ch.wear = Object.assign({}, ch.wear, { hat: ch.wear.hat || 'royalcrown' }); A.sfx('jingle'); spark(ch.x, ch.y - 200); }).pose('sit', 2200).say('わたしが おうさま！', 'royalcrown', 1500, 'yay')
      .do(() => { back(ch, f, 170); });
    R.audience(f.x, f.y, [ch], 'cheer', 3, 900);
  }
  T('castle', 'chandelierF', 'd_chand2', (f) => { f.shine = W.t + 1500; A.sfx('sparkle'); const cs = near(f, 4, 2000); for (let i = 0; i + 1 < cs.length; i += 2) { const a = cs[i], b = cs[i + 1], cx = W.clampFloor(f.x, f.y + 380).x; [a, b].forEach((ch, k) => R.claim(ch, 5000).go(cx + (k ? 50 : -50) + i * 70, 720, true).look(cx).pose('bow', 600).pose('dance', 2400).face('love', 1500)); } notes(f.x, f.y - 120); }, null);

  /* 19 プール */
  D('d_waterslide', 'ウォータースライダー', 'すべって プールに ざぶーん！', ['waterslide', 'pon'], 'pool');
  D('d_pool', 'すいすい およごう', 'プールに いれると すいすい およぐよ', ['poolF', 'swimring'], 'pool');
  D('d_hydrant2', 'みずでっぽう', 'しょうかせんを タップすると みずが ぴゅー', ['hydrant'], 'pool');
  T('pool', 'waterslide', 'd_waterslide', (f) => { const ch = near(f, 1)[0]; if (ch) wslide(ch, f); }, (ch, f) => wslide(ch, f));
  function wslide(ch, f) {
    R.claim(ch, 5000).go(f.x - 150, f.y + 10, true).do(() => {
      ch.stay = true; A.sfx('slide');
      R.tween(ch, 1600, (k) => { const u = k; ch.x = f.x - 120 + u * 310; ch.y = f.y; ch.z = 320 * Math.pow(1 - u, 1.6); ch.pose = 'slide'; ch.flip = false; ch.scale = W.depthScale(ch.y); }, () => { back(ch, f, 200); A.sfx('splash'); X.splash && X.splash(ch.x, ch.y); R.claim(ch, 2000).say('ざぶーん！', 'drop', 1300, 'laugh').pose('swim', 1000); });
    });
  }
  T('pool', 'poolF', 'd_pool', (f) => { A.sfx('splash'); W.burst('drop', f.x, f.y - 80, 10, { up: true, sp: 0.25 }); near(f, 2).forEach((ch) => R.claim(ch, 4000).go(f.x + PT.rand(-200, 200), f.y - 70, true).pose('swim', 2200).say('すいすい〜', 'drop', 1300, 'yay')); },
    (ch, f) => { R.claim(ch, 4000).go(f.x + PT.rand(-200, 200), f.y - 70, true).pose('swim', 2400).say('きもちいい！', 'drop', 1300, 'yay'); A.sfx('splash'); });
  const hyd = (f) => { f.spray = W.t + 2400; A.sfx('splash'); const ch = near(f, 1)[0]; if (ch) R.claim(ch, 3000).go(f.x + 200, f.y + 20, true).face('laugh', 1400).say('きゃー！ つめたい！', 'drop', 1400, 'laugh').pose('jump', 800); };
  T(['pool', 'fire'], 'hydrant', 'd_hydrant2', hyd, (ch, f) => { f.spray = W.t + 2400; A.sfx('splash'); R.claim(ch, 3000).go(f.x + 200, f.y + 20, true).say('みずあそび！', 'drop', 1400, 'laugh').pose('dance', 1200); });

  /* 20 しょうぼうしょ */
  D('d_firetruck2', 'しゅつどう！', 'しょうぼうしゃを タップすると サイレンが なって みんな しゅつどう', ['firetruckF', 'firehat'], 'fire');
  D('d_firepole', 'ポールで すべりおり', 'ポールを つかって しゅるしゅる〜', ['firepole', 'gaku'], 'fire');
  T('fire', 'firetruckF', 'd_firetruck2', (f) => { f.siren = W.t + 3500; for (let i = 0; i < 4; i++) A.tone(i % 2 ? 660 : 880, 0.35, { type: 'square', vol: 0.06, delay: i * 0.4 }); near(f, 3).forEach((ch, i) => { if (!ch.wear.hat) R.wear(ch, 'firehat', {}, true); R.claim(ch, 4000).wait(i * 300).go(f.x - 120 + i * 120, f.y + 40, true).pose('march', 1000).say('しゅつどう！', 'firehat', 1300, 'yay').pose('point', 900); }); }, null);
  T('fire', 'firepole', 'd_firepole', (f) => { const ch = near(f, 1)[0]; if (ch) pole(ch, f); }, (ch, f) => pole(ch, f));
  function pole(ch, f) {
    R.claim(ch, 4000).go(f.x + 10, f.y + 4, true).do(() => {
      ch.stay = true; A.sfx('whoosh');
      R.tween(ch, 1300, (k) => { ch.x = f.x + 10; ch.y = f.y; ch.z = 360 * (1 - k); ch.pose = 'hold'; ch.scale = W.depthScale(ch.y); }, () => { back(ch, f, 90); R.claim(ch, 1800).say('しゅたっ！', 'star', 1200, 'yay').pose('cheer', 800); });
    });
  }

  /* 21 おはなばたけ */
  D('d_windmill', 'くるくる ふうしゃ', 'ふうしゃを タップすると かぜが ふいて はなびらが まう', ['windmill', 'pinwheel'], 'flower');
  D('d_arch', 'はなの アーチ', 'はなの アーチを くぐると おはなの かんむりが のるよ', ['flowerarch', 'flowercrown'], 'flower');
  D('d_bee', 'ミツバチ ブンブン', 'すばこを タップすると ミツバチが ぶんぶん', ['beehive'], 'flower');
  T('flower', 'windmill', 'd_windmill', (f) => { f.spin = W.t + 3000; A.sfx('whoosh'); W.burst('leaf', f.x, f.y - 300, 12, { sp: 0.3, col: '#ff8fb1' }); lineUp(f, ['かぜだ〜！', 'くるくる まわる！'], 'spin'); }, null);
  T('flower', 'flowerarch', 'd_arch', (f) => { const ch = near(f, 1)[0]; if (ch) arch(ch, f); }, (ch, f) => arch(ch, f));
  function arch(ch, f) { R.claim(ch, 4000).go(f.x - 200, f.y + 10, true).go(f.x + 200, f.y + 10).do(() => { ch.wear = Object.assign({}, ch.wear, { hat: 'flowercrown' }); spark(ch.x, ch.y - 150, '#ff8fb1'); A.sfx('sparkle'); }).say('おはなの かんむり！', 'flowercrown', 1400, 'yay').pose('spin', 900); }
  T('flower', 'beehive', 'd_bee', (f) => { f.buzz = W.t + 3500; A.tone(220, 1.2, { type: 'sawtooth', vol: 0.05, vib: 20 }); const ch = near(f, 1)[0]; if (ch) R.claim(ch, 3000).look(f.x).face('surprise', 900).say('ブンブン！', 'flower', 1300, 'wow').pose('run', 900); }, null);

  /* 22 うみの なか */
  D('d_treasure2', 'かいていの たからもの', 'たからばこを あけると きらきらの ほうせき', ['treasure', 'chest'], 'sea');
  D('d_pearl', 'しんじゅ みつけた', 'かいを タップすると しんじゅが ぴかっ', ['clam'], 'sea');
  D('d_coral', 'さんごの おうち', 'さんごに ちかづくと さかなが あそびに くる', ['coral'], 'sea');
  T('sea', 'treasure', 'd_treasure2', (f) => { f.open = W.t + 4000; A.sfx('discover'); spark(f.x, f.y - 120, '#ffd23f', 16); lineUp(f, ['たからもの だ！', 'きらきら！']); }, null);
  T('sea', 'clam', 'd_pearl', (f) => { f.open = W.t + 3000; A.sfx('sparkle'); spark(f.x, f.y - 60, '#ffffff'); lineUp(f, ['しんじゅ！', 'きれい〜']); }, null);
  T('sea', 'coral', 'd_coral', (f) => { A.sfx('bubble'); W.addBubbles(f.x, f.y - 80, 8); X.critter && X.critter('fish', [[f.x - 400, f.y - 200, 1], [f.x, f.y - 150, 1500], [f.x + 400, f.y - 220, 1500]], {}); lineUp(f, ['おさかな きた！', 'こんにちは〜']); },
    (ch, f) => { R.claim(ch, 4000).go(f.x + 140, f.y + 20, true).pose('swim', 2000).say('すいすい〜', 'shell', 1400, 'yay'); W.addBubbles(ch.x, ch.y - 80, 8); });

  /* 23 にじと くもの おうこく */
  D('d_rainbowslide', 'にじの すべりだい', 'にじの すべりだいで くもに ふわっと ちゃくち', ['rainbowslide', 'yume'], 'cloud');
  D('d_cloudbed', 'くもの ベッド', 'ふわふわの くもで おひるね', ['cloudbed', 'pyoko'], 'cloud');
  D('d_starfountain', 'ほしの ふんすい', 'ふんすいを タップすると ほしが いっぱい', ['starfountain', 'wand'], 'cloud');
  T('cloud', 'rainbowslide', 'd_rainbowslide', (f) => { const ch = near(f, 1)[0]; if (ch) rslide(ch, f); }, (ch, f) => rslide(ch, f));
  function rslide(ch, f) {
    R.claim(ch, 5000).go(f.x - 200, f.y + 10, true).do(() => {
      ch.stay = true; A.sfx('magic');
      R.tween(ch, 1800, (k) => { ch.x = f.x - 220 + k * 450; ch.y = f.y; ch.z = 300 * Math.pow(1 - k, 1.5); ch.pose = 'slide'; ch.flip = false; ch.scale = W.depthScale(ch.y); }, () => { back(ch, f, 260); spark(ch.x, ch.y - 80, '#ff8fb1'); R.claim(ch, 2000).say('ふわっ！', 'rainbow', 1300, 'yay').pose('spin', 900); });
    });
  }
  T('cloud', 'cloudbed', 'd_cloudbed', (f) => { const ch = near(f, 1)[0]; if (ch) nap(ch, f); }, (ch, f) => nap(ch, f));
  function nap(ch, f) { R.claim(ch, 6000).go(f.x, f.y + 6, true).do(() => { ch.stay = true; ch.x = f.x; ch.y = f.y - 4; ch.z = 50; ch.rest = 'sleep'; }).pose('sleep', 3000).say('ふわふわ…すやすや', 'cloud', 1600, 'talk').do(() => { back(ch, f, 170); }).say('いい ゆめ みた！', 'star', 1300, 'yay'); W.burst('zzz', f.x + 40, f.y - 140, 3, { up: true, sp: 0.06 }); }
  T('cloud', 'starfountain', 'd_starfountain', (f) => { f.burst = W.t + 2500; A.sfx('magic'); X.sparkleRain && X.sparkleRain(2500); lineUp(f, ['おほしさま いっぱい！', 'ねがいごと しよう！'], 'spin'); }, null);

  /* 24 はくぶつかん */
  D('d_dinoskel', 'ほねほね ダンス', 'きょうりゅうの ほねを タップすると…うごいた！？', ['dinoskel', 'dino'], 'museum');
  D('d_fossil', 'かせき はっけん', 'すなばを ほると かせきが でてくる', ['digbox', 'magnifier'], 'museum');
  D('d_gem', 'ほうせきの ひかり', 'ほうせきを タップすると きらりん', ['gemcase'], 'museum');
  T('museum', 'dinoskel', 'd_dinoskel', (f) => { f.dance = W.t + 2600; A.sfx('roar'); lineUp(f, ['うごいた！？', 'ガオー！'], 'jump'); W.after(1200, () => near(f, 2).forEach((ch) => R.claim(ch, 2400).pose('dance', 1600).face('laugh', 1200))); }, null);
  T('museum', 'digbox', 'd_fossil', (f) => { A.sfx('pop'); W.burst('smoke', f.x, f.y - 40, 8, { sp: 0.15, col: '#f2d8a0', g: 0 }); const p = W.addProp(PT.pick(['egg', 'dino', 'shell', 'chest']), f.x + PT.rand(-80, 80), f.y + 30); p.pop = W.t; lineUp(f, ['なにか でた！', 'かせき だ！']); },
    (ch, f) => { R.claim(ch, 4000).go(f.x, f.y + 10, true).pose('peek', 1400).say('ほりほり…', 'magnifier', 1400, 'talk').do(() => { const p = W.addProp(PT.pick(['egg', 'dino', 'shell']), f.x + 100, f.y + 30); p.pop = W.t; }).say('みつけた！', '!', 1200, 'wow').pose('cheer', 800); });
  T('museum', 'gemcase', 'd_gem', (f) => { A.sfx('sparkle'); spark(f.x, f.y - 160, '#b39ae8', 14); lineUp(f, ['きらきら！', 'ほうせき だ！']); }, null);

  /* お題 */
  const O = (stage, text, goals, hint) => ({ id: stage + ':' + text, stage, text, goals, hint });
  PT.ODAI2 = [
    O('snow', 'ゆきの ひろばで あそぼう', ['d_snowman2', 'd_igloo', 'd_sled'], ['snowmanF']),
    O('aqua', 'すいぞくかんの いきものに あいに いこう', ['d_tank', 'd_dolphin', 'd_penguin2'], ['bigtank']),
    O('zoo', 'どうぶつたちと なかよく なろう', ['d_giraffe', 'd_elephant', 'd_monkey'], ['giraffe']),
    O('farm', 'ぼくじょうの おしごとを してみよう', ['d_cow', 'd_egg', 'd_barn'], ['cowF']),
    O('bakery', 'おいしい おかしを やいてみよう', ['d_oven', 'd_showcase'], ['oven']),
    O('castle', 'おしろの ぶとうかいを ひらこう', ['d_chand2', 'd_throne2', 'd_ball'], ['chandelierF']),
    O('pool', 'プールで おもいっきり あそぼう', ['d_waterslide', 'd_pool', 'd_hydrant2'], ['waterslide']),
    O('fire', 'しょうぼうしさんに なって しゅつどう', ['d_firetruck2', 'd_firepole'], ['firetruckF']),
    O('flower', 'おはなばたけで かぜと あそぼう', ['d_windmill', 'd_arch', 'd_bee'], ['windmill']),
    O('sea', 'うみの なかの たからものを さがそう', ['d_treasure2', 'd_pearl', 'd_coral'], ['treasure']),
    O('cloud', 'くもの うえで ふわふわ あそぼう', ['d_rainbowslide', 'd_cloudbed', 'd_starfountain'], ['rainbowslide']),
    O('museum', 'はくぶつかんで だいはっけん', ['d_dinoskel', 'd_fossil', 'd_gem'], ['dinoskel']),
  ];
})();
