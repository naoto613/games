/* ステージ 25〜48 の あそび */
'use strict';
(() => {
  const W = PT.world, R = PT.R, D = R.D, X = PT.FX, A = PT.audio;
  const { isC } = R.h;
  const onFix = (c, type) => (c.tgt && c.tgt.kind === 'fix' && c.tgt.type === type ? c.tgt : null);
  const tapFix = (c, type) => (c.e.kind === 'fix' && c.e.type === type ? c.e : null);
  const spark = (x, y, col = '#ffd23f', n = 10) => W.burst('spark', x, y, n, { sp: 0.2, max: 800, size: 10, col, g: 0 });
  const hearts = (x, y, n = 5) => W.burst('heart', x, y, n, { up: true, sp: 0.12, max: 900 });
  const near = (f, n = 2, r = 1600) => R.free(f.x, f.y, [], r).slice(0, n);
  const pop = (id, x, y) => { if (!PT.ITEMS[id]) return null; const p = W.addProp(id, x, y); p.pop = W.t; return p; };
  const back = (ch, f, dx = 160) => { ch.stay = false; ch.z = 0; ch.baseZ = 0; ch.rest = 'idle'; ch.hidden = false; const p = W.clampFloor(f.x + dx, f.y + 40); ch.x = p.x; ch.y = p.y; ch.scale = W.depthScale(ch.y); };
  const lineUp = (f, lines, pose = 'cheer') => near(f, 2, 1500).forEach((ch, i) => R.claim(ch, 3000).wait(300 + i * 300).look(f.x).face('surprise', 800).say(lines[i % lines.length], null, 1400, 'wow').pose(pose, 900));
  const T = (stage, type, disc, tap, put) => {
    if (tap) R.add({ id: type + '-tap3', on: 'tapfix', pri: 52, stage, test: (c) => tapFix(c, type), run(c, f) { tap(f); W.after(900, () => R.found(disc)); } });
    const p = put === 'tap' ? (ch, f) => tap(f, ch) : put;
    if (p) R.add({ id: type + '-char3', pri: 78, stage, test: (c) => (isC(c.e) ? onFix(c, type) : null), run(c, f) { p(c.e, f); W.after(1500, () => R.found(disc)); } });
  };
  const ride = (ch, f, ms, pose, fn, done) => R.claim(ch, ms + 2000).go(f.x, f.y + 6, true).do(() => { ch.stay = true; ch.flip = false; const sx = ch.x, sy = ch.y; R.tween(ch, ms, (k) => { ch.pose = pose; fn(k, sx, sy); ch.scale = W.depthScale(ch.y); }, () => { back(ch, f); done && done(ch); }); });
  const firstFix = (type) => W.fixes().find((x) => x.type === type);

  /* 25 まほうの がっこう */
  D('d_bigcauldron', 'おおなべの まほう', 'おおなべを タップすると ぐつぐつ なにかが できる', ['bigcauldron', 'potion'], 'magicschool');
  D('d_broomfly', 'ほうきの じゅぎょう', 'ほうきに のって とぶ れんしゅう', ['broomrack', 'magicbroom'], 'magicschool');
  D('d_mirror2', 'へんしんの かがみ', 'かがみを のぞくと まじょっこに へんしん', ['magicmirror', 'witchpink'], 'magicschool');
  T('magicschool', 'bigcauldron', 'd_bigcauldron', (f) => { f.brew = W.t + 2200; f.col = PT.pick(['#7fe08a', '#9fd8ff', '#ffb3e6', '#ffe066']); A.sfx('bubble'); W.after(2100, () => { A.sfx('magic'); pop(PT.pick(['potion', 'potion2', 'star', 'cake', 'balloon', 'blackcat', 'owl', 'present', 'crystalball']), f.x + 170, f.y + 30); W.burst('smoke', f.x, f.y - 200, 10, { sp: 0.14, col: '#e0c0ff', g: 0, up: true }); }); lineUp(f, ['ぐつぐつ…', 'なにが できるかな？']); }, null);
  T('magicschool', 'broomrack', 'd_broomfly', (f) => { const ch = near(f, 1)[0]; if (ch) bfly(ch, f); }, (ch, f) => bfly(ch, f));
  function bfly(ch, f) { if (!/witch|wizard|apprentice/.test(ch.wear.hat || '')) ch.wear = Object.assign({}, ch.wear, { hat: 'witchpurple' }); ch.holdType = 'magicbroom'; A.sfx('whoosh'); ride(ch, f, 3200, 'ride', (k, sx, sy) => { ch.x = sx + Math.sin(k * PT.TAU) * 360; ch.y = sy; ch.z = Math.sin(k * Math.PI) * 280; ch.flip = Math.cos(k * PT.TAU) < 0; if (Math.random() < 0.3) W.burst('spark', ch.x, ch.y - ch.z - 30, 1, { sp: 0.05, max: 600, col: '#ffd23f', g: 0 }); }, (ch2) => { ch2.holdType = null; R.claim(ch2, 1600).say('とべた！', 'star', 1200, 'yay'); }); }
  T('magicschool', 'magicmirror', 'd_mirror2', (f, who) => { f.flash = W.t + 600; A.sfx('magic'); const ch = who || near(f, 1)[0]; if (!ch) return; R.claim(ch, 4000).go(f.x + 100, f.y + 20, true).look(f.x).do(() => { ch.wear = Object.assign({}, ch.wear, { hat: PT.pick(['witchpink', 'witchpurple', 'witchbow', 'wizardblue', 'witchgreen']), body: PT.pick(['witchpink', 'witchpurple', 'witchdress', 'wizardrobe']), back: PT.pick(['witchcape', 'starcape', 'pinkcape']) }); ch.role = 'witch'; spark(ch.x, ch.y - 120, '#c9a0ff', 14); }).pose('spin', 900).say('まじょっこに なった！', 'witchpink', 1400, 'yay'); }, 'tap');
  /* 26 おかしの いえ */
  D('d_gingerhouse', 'おかしの いえの とびら', 'とびらを あけると あまい おかしが ころころ', ['gingerhouse', 'cookie'], 'candyhouse');
  D('d_chocofountain', 'チョコの ふんすい', 'チョコが とろーり。ひたして たべよう', ['chocofountain', 'strawberry'], 'candyhouse');
  D('d_lollitree', 'キャンディの き', 'きを ゆらすと キャンディが おちてくる', ['lollitree', 'candy'], 'candyhouse');
  T('candyhouse', 'gingerhouse', 'd_gingerhouse', (f) => { f.open = W.t + 2500; A.sfx('ding'); for (let i = 0; i < 3; i++) W.after(300 + i * 250, () => pop(PT.pick(['cookie', 'candy', 'donut', 'cake', 'pudding']), f.x + PT.rand(-120, 120), f.y + 40)); lineUp(f, ['いい におい！', 'おかしが でてきた！']); }, null);
  T('candyhouse', 'chocofountain', 'd_chocofountain', (f) => { f.flow = W.t + 2500; A.sfx('splash'); lineUp(f, ['とろ〜り！', 'おいしそう！']); }, (ch, f) => { f.flow = W.t + 2500; R.claim(ch, 4000).go(f.x + 120, f.y + 20, true).look(f.x).hold('strawberry').pose('eat', 1400).say('チョコ いちご！', 'heart', 1400, 'yay').unhold(); hearts(f.x, f.y - 200); });
  T('candyhouse', 'lollitree', 'd_lollitree', (f) => { f.shake = W.t + 1200; A.sfx('tickle'); for (let i = 0; i < 3; i++) W.after(400 + i * 200, () => pop('candy', f.x + PT.rand(-100, 100), f.y + PT.rand(10, 60))); lineUp(f, ['キャンディ！', 'やったー！']); }, 'tap');
  /* 27 ハロウィン */
  D('d_pumpkinhouse', 'かぼちゃの おうち', 'おうちを タップすると おばけが ばあ！', ['pumpkinhouse', 'jackolantern'], 'halloween');
  D('d_ghost2', 'おばけと なかよし', 'おばけに タッチすると「ばあ！」…でも やさしい', ['ghostF', 'blanket'], 'halloween');
  D('d_pumpkinpatch', 'かぼちゃばたけ', 'はたけから かぼちゃの ランタンが ぽこっ', ['pumpkinpatch'], 'halloween');
  T('halloween', 'pumpkinhouse', 'd_pumpkinhouse', (f) => { f.lit = W.t + 3000; f.boo = W.t + 1600; A.sfx('ghost'); near(f, 3).forEach((ch, i) => R.claim(ch, 3000).wait(i * 150).face('surprise', 900).jump(50, 400).say('きゃー！', '!', 1100, 'wow').face('laugh', 900).say('おばけ かわいい！', null, 1200, 'laugh')); }, null);
  T('halloween', 'ghostF', 'd_ghost2', (f) => { f.boo = W.t + 1200; A.sfx('ghost'); lineUp(f, ['ばあ！ だって', 'こわくないよ〜']); }, (ch, f) => { f.boo = W.t + 1200; R.claim(ch, 3500).go(f.x + 100, f.y + 20, true).look(f.x).pose('hug', 1400).say('おばけさん なかよし！', 'heart', 1500, 'yay'); hearts(f.x, f.y - 160); });
  T('halloween', 'pumpkinpatch', 'd_pumpkinpatch', (f) => { A.sfx('pop'); pop(PT.pick(['jackolantern', 'candybag', 'jackolantern']), f.x + PT.rand(-120, 120), f.y + 40); lineUp(f, ['かぼちゃ ランタン！', 'ひかってる！']); }, null);
  /* 28 クリスマス */
  D('d_xmastree', 'クリスマスツリー', 'ツリーを タップすると ライトが ピカピカ。プレゼントも！', ['xmastree', 'present'], 'xmas');
  D('d_sleigh', 'サンタの そり', 'そりに のって よぞらを ひとっとび', ['sleigh', 'santa'], 'xmas');
  D('d_stocking', 'くつしたの プレゼント', 'だんろを タップすると くつしたに プレゼント', ['fireplace', 'present'], 'xmas');
  T('xmas', 'xmastree', 'd_xmastree', (f) => { f.lit = W.t + 6000; A.sfx('jingle'); W.after(800, () => pop('present', f.x + PT.rand(-140, 140), f.y + 50)); lineUp(f, ['ピカピカ！', 'メリークリスマス！']); }, null);
  T('xmas', 'sleigh', 'd_sleigh', (f) => { const ch = near(f, 1)[0]; if (ch) sl(ch, f); }, (ch, f) => sl(ch, f));
  function sl(ch, f) { ch.wear = Object.assign({}, ch.wear, { hat: 'santa' }); f.fly = W.t + 3000; A.sfx('jingle'); ride(ch, f, 3000, 'sit', (k, sx, sy) => { ch.x = sx; ch.y = sy; ch.z = 60 + Math.sin(k * Math.PI) * 200; if (Math.random() < 0.3) W.burst('star', ch.x, ch.y - ch.z, 1, { sp: 0.1 }); }, (c2) => R.claim(c2, 1600).say('メリークリスマス！', 'present', 1400, 'yay')); }
  T('xmas', 'fireplace', 'd_stocking', (f) => { f.gift = W.t + 5000; A.sfx('bell'); pop('present', f.x + PT.rand(-80, 80), f.y + 60); lineUp(f, ['プレゼント！', 'サンタさん きたのかな？']); }, null);
  /* 29 にんじゃ */
  D('d_spinwall', 'どんでんがえし', 'かべに はいると くるっと まわって きえちゃう！', ['spinwall', 'kon'], 'ninja');
  D('d_shuriken', 'しゅりけんの しゅぎょう', 'まとを タップすると しゅりけんが ささる', ['target'], 'ninja');
  D('d_ninjabell', 'しのびの すず', 'すずを ならすと にんじゃが どろん！', ['bellrope'], 'ninja');
  T('ninja', 'spinwall', 'd_spinwall', (f, who) => { f.spin = W.t + 900; A.sfx('whoosh'); const ch = who || near(f, 1)[0]; if (!ch) return; R.claim(ch, 4500).go(f.x, f.y + 6, true).do(() => { ch.hidden = true; W.poof(f.x, f.y - 100); }).wait(1500).do(() => { back(ch, f, PT.pick([-260, 260, 500])); W.poof(ch.x, ch.y - 80); ch.hidden = false; }).say('どろん！', 'star', 1300, 'yay').pose('point', 900); }, 'tap');
  T('ninja', 'target', 'd_shuriken', (f) => { f.hits = (f.hits || []).concat([[PT.rand(-40, 40), PT.rand(-40, 40)]]).slice(-6); A.sfx('zap'); spark(f.x, f.y - 140, '#ffffff'); const ch = near(f, 1)[0]; if (ch) R.claim(ch, 2500).look(f.x).pose('point', 800).say('えいっ！', 'star', 1200, 'yay'); }, null);
  T('ninja', 'bellrope', 'd_ninjabell', (f) => { f.ring = W.t + 1500; A.sfx('bell'); near(f, 3, 2000).forEach((ch, i) => R.claim(ch, 3000).wait(400 + i * 200).do(() => { W.poof(ch.x, ch.y - 80); ch.wear = Object.assign({}, ch.wear, { face: 'mask' }); }).say('しゅたっ！', 'star', 1200, 'yay').pose('point', 800)); }, null);
  /* 30 かいぞくせん */
  D('d_shipwheel', 'おもかじ いっぱい', 'かじを まわすと ふねが ぐらり', ['shipwheel', 'pirate'], 'pirate');
  D('d_cannon', 'たいほう どーん', 'たいほうから かみふぶきが どーん！', ['cannon', 'confetti'], 'pirate');
  D('d_crowsnest', 'みはりだい', 'マストに のぼって「しまが みえるぞー！」', ['mast', 'camera'], 'pirate');
  T('pirate', 'shipwheel', 'd_shipwheel', (f, who) => { f.spin = W.t + 1500; f.rot = (f.rot || 0) + 1.5; A.sfx('wave'); W.chars().forEach((ch) => { if (W.isFree(ch)) R.claim(ch, 1800).do(() => { R.tween(ch, 1500, (k) => { ch.x += Math.sin(k * PT.TAU) * 2; ch.pose = 'trip'; }); }).say('ぐらぐら〜', '!', 1000, 'laugh'); }); }, 'tap');
  T('pirate', 'cannon', 'd_cannon', (f) => { f.boom = W.t + 600; A.sfx('firework'); X.confetti && X.confetti(f.x + 200, 1500); W.burst('smoke', f.x + 100, f.y - 120, 8, { sp: 0.15, col: '#ffffff', g: 0 }); lineUp(f, ['どーん！', 'すごい！']); }, null);
  T('pirate', 'mast', 'd_crowsnest', (f) => { const ch = near(f, 1)[0]; if (ch) climb(ch, f); }, (ch, f) => climb(ch, f));
  function climb(ch, f) { ch.wear = Object.assign({}, ch.wear, { hat: ch.wear.hat || 'pirate' }); ride(ch, f, 3200, 'hold', (k, sx, sy) => { ch.x = sx; ch.y = sy; ch.z = Math.sin(k * Math.PI) * 400; if (k > 0.45 && k < 0.55 && !ch._said) { ch._said = true; W.say(ch, 'しまが みえるぞー！', 'star', 1200, 'yay'); } }, (c2) => { c2._said = false; }); }
  /* 31 ジャングル */
  D('d_waterfall', 'たきの にじ', 'たきを タップすると にじが かかる', ['waterfall', 'rainbow'], 'jungle');
  D('d_vine', 'つるで アーアアー', 'つるに つかまって ぶらーん！', ['vine', 'pon'], 'jungle');
  D('d_toucan', 'オオハシの うた', 'とりを タップすると とびまわって うたう', ['toucan'], 'jungle');
  T('jungle', 'waterfall', 'd_waterfall', (f) => { A.sfx('splash'); X.rainbow && X.rainbow(5000); lineUp(f, ['にじだ！', 'きれい〜！']); }, (ch, f) => { R.claim(ch, 3500).go(f.x + 160, f.y + 20, true).face('laugh', 1200).say('つめたーい！', 'drop', 1300, 'laugh').pose('dance', 1000); W.burst('drop', f.x + 120, f.y - 60, 10, { up: true, sp: 0.2 }); });
  T('jungle', 'vine', 'd_vine', (f) => { const ch = near(f, 1)[0]; if (ch) vs(ch, f); }, (ch, f) => vs(ch, f));
  function vs(ch, f) { f.swing = W.t + 3000; A.sfx('whoosh'); ride(ch, f, 2800, 'hold', (k, sx, sy) => { const a = Math.sin(k * PT.TAU * 1.5) * 0.6; ch.x = sx + Math.sin(a) * 360; ch.y = sy; ch.z = 120 - Math.cos(a) * 100 + 40; }, (c2) => R.claim(c2, 1500).say('アーアアー！', 'star', 1200, 'yay')); }
  T('jungle', 'toucan', 'd_toucan', (f) => { f.fly = W.t + 2000; A.sfx('quack'); W.burst('note', f.x, f.y - 260, 5, { up: true, sp: 0.12 }); lineUp(f, ['とんだ！', 'カラフル〜！']); }, null);
  /* 32 さばく */
  D('d_camel', 'ラクダで ゆらゆら', 'ラクダに のって さばくを おさんぽ', ['camel', 'lulu'], 'desert');
  D('d_pyramid', 'ピラミッドの ひみつ', 'いりぐちを タップすると たからものが きらり', ['pyramidF', 'chest'], 'desert');
  D('d_coconut', 'ヤシの み', 'ヤシの きを タップすると みが ぽとっ', ['oasis'], 'desert');
  T('desert', 'camel', 'd_camel', (f) => { const ch = near(f, 1)[0]; if (ch) cr(ch, f); }, (ch, f) => cr(ch, f));
  function cr(ch, f) { f.walk = W.t + 3000; ride(ch, f, 3000, 'ride', (k, sx, sy) => { const dx = Math.sin(k * Math.PI) * 300; f.x = sx + dx; ch.x = sx + dx; ch.y = sy; ch.z = 150 + Math.sin(k * 30) * 6; }, (c2) => { R.claim(c2, 1500).say('ゆらゆら たのしい！', 'heart', 1300, 'yay'); }); }
  T('desert', 'pyramidF', 'd_pyramid', (f) => { f.open = W.t + 4000; A.sfx('discover'); spark(f.x, f.y - 60, '#f5c242', 16); W.after(800, () => pop(PT.pick(['chest', 'crystalball', 'star']), f.x + 140, f.y + 40)); lineUp(f, ['たからもの！', 'ひらいた！']); }, null);
  T('desert', 'oasis', 'd_coconut', (f) => { f.drop = W.t + 3000; A.sfx('pop'); pop(PT.pick(['juice', 'watermelon', 'banana']), f.x + 60, f.y + 30); lineUp(f, ['ぽとっ！', 'おいしそう！']); }, null);
  /* 33 きょうりゅうの くに */
  D('d_volcano', 'かざん どかーん', 'かざんを タップすると きらきらの ふんか！', ['volcano'], 'dinoland');
  D('d_hatch', 'たまごが われた', 'たまごを タップすると あかちゃん きょうりゅうが うまれる', ['dinoegg', 'dino'], 'dinoland');
  D('d_bigdino', 'おおきな きょうりゅう', 'きょうりゅうを タップすると ガオー！ みんな ぴょん', ['bigdino'], 'dinoland');
  T('dinoland', 'volcano', 'd_volcano', (f) => { f.erupt = W.t + 2500; A.sfx('firework'); for (let i = 0; i < 4; i++) W.after(300 + i * 300, () => X.firework && X.firework(f.x + PT.rand(-200, 200), f.y - 400 - PT.rand(0, 100), PT.pick(['#ff6f3d', '#ffd23f', '#ff9a3d']))); lineUp(f, ['ふんかだ！', 'きらきら！'], 'jump'); }, null);
  T('dinoland', 'dinoegg', 'd_hatch', (f) => { f.hatch = W.t + 1500; A.sfx('pop'); W.after(1400, () => { pop('dino', f.x + PT.rand(-60, 60), f.y + 40); A.sfx('roar'); }); lineUp(f, ['うごいた！', 'うまれた！']); }, null);
  T('dinoland', 'bigdino', 'd_bigdino', (f) => { f.roar = W.t + 1500; A.sfx('roar'); W.chars().forEach((ch) => { if (W.isFree(ch)) R.claim(ch, 1800).jump(60, 500).face('surprise', 900).say('ガオー！', '!', 1000, 'wow'); }); }, (ch, f) => { f.roar = W.t + 1500; R.claim(ch, 3500).go(f.x + 200, f.y + 20, true).look(f.x).pose('roar', 1200).say('がおー！ ともだち！', 'heart', 1400, 'laugh'); });
  /* 34 ロボット こうじょう */
  D('d_conveyor', 'おもちゃ せいぞう', 'ベルトコンベアから おもちゃが つぎつぎ', ['conveyor', 'robottoy'], 'robotfactory');
  D('d_robotarm', 'ロボットアーム', 'アームが おもちゃを つかんで くるっ', ['robotarm'], 'robotfactory');
  D('d_buttons', 'ボタン ポチポチ', 'ボタンを おすと ピコピコ', ['buttonpanel', 'gaku'], 'robotfactory');
  T('robotfactory', 'conveyor', 'd_conveyor', (f) => { f.run = W.t + 2500; A.sfx('train'); for (let i = 0; i < 3; i++) W.after(600 + i * 500, () => pop(PT.pick(['robottoy', 'car', 'train', 'blocks', 'ball', 'teddy', 'dino']), f.x + 300, f.y + PT.rand(0, 60))); lineUp(f, ['できた！', 'つぎは なに？']); }, null);
  T('robotfactory', 'robotarm', 'd_robotarm', (f) => { f.move = W.t + 2000; f.holding = PT.pick(['teddy', 'ball', 'robottoy', 'present']); A.sfx('zap'); W.after(2000, () => { pop(f.holding, f.x + 160, f.y + 30); f.holding = null; }); lineUp(f, ['うごいた！', 'すごい アーム！']); }, null);
  T('robotfactory', 'buttonpanel', 'd_buttons', (f) => { f.beep = W.t + 2000; for (let i = 0; i < 5; i++) A.tone(PT.pick([660, 880, 990, 1320]), 0.1, { type: 'square', vol: 0.05, delay: i * 0.12 }); const ch = near(f, 1)[0]; if (ch) R.claim(ch, 2500).look(f.x).say('ピコピコ！', 'star', 1200, 'yay').pose('march', 900); }, 'tap');
  /* 35 おもちゃの くに */
  D('d_jackbox', 'びっくりばこ', 'はこを タップすると ぴょーん！', ['jackbox'], 'toyland');
  D('d_bigtop', 'くるくる コマ', 'コマを タップすると ぐるぐる まわる', ['bigtop'], 'toyland');
  D('d_toytrack', 'おもちゃの きしゃ', 'せんろを タップすると きしゃが はしる', ['toytrack', 'train'], 'toyland');
  T('toyland', 'jackbox', 'd_jackbox', (f) => { f.pop = W.t + 2600; A.sfx('boing'); W.chars().forEach((ch) => { if (W.isFree(ch) && Math.abs(ch.x - f.x) < 800) R.claim(ch, 1600).jump(50, 400).face('surprise', 900).say('びっくり！', '!', 1000, 'wow'); }); }, null);
  T('toyland', 'bigtop', 'd_bigtop', (f) => { f.spin = W.t + 3000; A.sfx('whoosh'); lineUp(f, ['くるくる〜！', 'めが まわる〜'], 'spin'); }, null);
  T('toyland', 'toytrack', 'd_toytrack', (f) => { f.run = W.t + 4000; A.sfx('train'); lineUp(f, ['シュッシュッ！', 'はやい！']); }, null);
  /* 36 サーカス */
  D('d_ballbalance', 'たまのり', 'おおきな たまの うえで バランス', ['circusball', 'pon'], 'circus');
  D('d_trapeze', 'くうちゅう ブランコ', 'ブランコで ひゅーん！', ['trapeze'], 'circus');
  D('d_cannonman', 'にんげん たいほう', 'たいほうで ネットまで びゅーん！', ['circuscannon'], 'circus');
  T('circus', 'circusball', 'd_ballbalance', (f) => { const ch = near(f, 1)[0]; if (ch) bb(ch, f); }, (ch, f) => bb(ch, f));
  function bb(ch, f) { f.roll = W.t + 3000; A.sfx('drumroll'); ride(ch, f, 3000, 'cheer', (k, sx, sy) => { ch.x = sx + Math.sin(W.t * 0.004) * 40; ch.y = sy; ch.z = 160 + Math.sin(k * 30) * 4; ch.pose = Math.sin(k * 20) > 0 ? 'cheer' : 'wave'; }, (c2) => { A.sfx('cheer'); R.audience(c2.x, c2.y, [c2], 'cheer', 3, 300); }); }
  T('circus', 'trapeze', 'd_trapeze', (f) => { const ch = near(f, 1)[0]; if (ch) tz(ch, f); }, (ch, f) => tz(ch, f));
  function tz(ch, f) { f.swing = W.t + 3000; A.sfx('whoosh'); ride(ch, f, 3000, 'hold', (k, sx, sy) => { const a = Math.sin(W.t * 0.006) * 0.7; ch.x = f.x + Math.sin(a) * 240; ch.y = sy; ch.z = 220 - Math.cos(a) * 240 + 200; }, (c2) => { A.sfx('cheer'); R.audience(c2.x, c2.y, [c2], 'cheer', 3, 300); }); }
  T('circus', 'circuscannon', 'd_cannonman', (f) => { const ch = near(f, 1)[0]; if (ch) cm(ch, f); }, (ch, f) => cm(ch, f));
  function cm(ch, f) { f.fire = W.t + 2600; A.sfx('firework'); W.burst('smoke', f.x + 100, f.y - 160, 8, { sp: 0.15, col: '#ffffff', g: 0 }); ride(ch, f, 2200, 'fly', (k, sx, sy) => { ch.x = sx - k * 900; ch.y = sy; ch.z = Math.sin(k * Math.PI) * 420; ch.flip = true; }, (c2) => { A.sfx('boing'); R.claim(c2, 1800).jump(60, 500).say('ネットで ぽよーん！', 'star', 1400, 'yay'); }); }
  /* 37 コンサート */
  D('d_spotlight', 'スポットライト', 'ライトを タップすると カラフルに！', ['spotlights', 'mirrorball'], 'concert');
  D('d_sing', 'アイドルデビュー', 'マイクの まえで うたうと みんなが もりあがる', ['micstand', 'sakura'], 'concert');
  D('d_drums', 'ドラム ドンドン', 'ドラムを タップすると リズムが はじまる', ['drumset', 'drum'], 'concert');
  T('concert', 'spotlights', 'd_spotlight', (f) => { f.party = W.t + 5000; A.sfx('jingle'); W.chars().forEach((ch) => { if (W.isFree(ch)) R.claim(ch, 3000).pose('dance', 2400).face('love', 1500); }); }, null);
  T('concert', 'micstand', 'd_sing', (f) => { const ch = near(f, 1)[0]; if (ch) sing(ch, f); }, (ch, f) => sing(ch, f));
  function sing(ch, f) { f.sing = W.t + 3500; const sp = firstFix('spotlights'); if (sp) sp.party = W.t + 4000; R.claim(ch, 5000).go(f.x - 40, f.y + 10, true).look(f.x).do(() => { [72, 74, 76, 79, 76, 74, 72].forEach((n, i) => A.tone(440 * Math.pow(2, (n - 69) / 12), 0.35, { type: 'triangle', vol: 0.12, delay: i * 0.3 })); }).say('ラララ〜♪', 'music', 1600, 'yay').pose('dance', 1500).pose('cheer', 800); R.audience(f.x, f.y, [ch], 'cheer', 3, 1200); }
  T('concert', 'drumset', 'd_drums', (f) => { f.beat = W.t + 2500; for (let i = 0; i < 8; i++) A.sfx && W.after(i * 250, () => A.sfx('drum')); lineUp(f, ['ドンドン！', 'かっこいい！'], 'dance'); }, 'tap');
  /* 38 ゲームセンター */
  D('d_claw', 'UFOキャッチャー', 'アームが おりて…ぬいぐるみ ゲット！', ['clawmachine', 'teddy'], 'arcade');
  D('d_whack', 'もぐらたたき', 'もぐらが ぴょこぴょこ', ['whack'], 'arcade');
  D('d_photo', 'プリントシール', 'ブースで ピース！ きらきらの しゃしん', ['photobooth', 'camera'], 'arcade');
  T('arcade', 'clawmachine', 'd_claw', (f) => { f.grab = W.t + 2400; A.sfx('tickle'); W.after(2300, () => { A.sfx('discover'); pop(PT.pick(['teddy', 'bunny', 'panda', 'penguin', 'elephant', 'duck']), f.x + 140, f.y + 30); }); lineUp(f, ['とれるかな？', 'がんばれー！']); }, null);
  T('arcade', 'whack', 'd_whack', (f) => { f.play = W.t + 4000; A.sfx('tickle'); const ch = near(f, 1)[0]; if (ch) R.claim(ch, 4000).go(f.x, f.y + 40, true).pose('point', 600).say('えいっ！', 'star', 900, 'yay').pose('point', 600).say('とうっ！', 'star', 900, 'yay'); }, 'tap');
  T('arcade', 'photobooth', 'd_photo', (f, who) => { f.flash = W.t + 400; A.sfx('zap'); const cs = who ? [who] : near(f, 2); cs.forEach((ch, i) => R.claim(ch, 3000).go(f.x + (i ? 60 : -40), f.y + 20, true).pose('wave', 800).say('ピース！', 'star', 1200, 'yay').do(() => { ch.wear = Object.assign({}, ch.wear, { face: PT.pick(['heartglasses', 'starglasses', 'sunglasses']) }); spark(ch.x, ch.y - 120, '#ffffff'); })); }, 'tap');
  /* 39 スケート */
  D('d_skate', 'くるくる スケート', 'リンクに のせると すいすい くるくる', ['rink', 'penta'], 'skate');
  D('d_cocoa', 'あったか ココア', 'ココアやさんで ほっと ひといき', ['cocoastand', 'juice'], 'skate');
  D('d_snowglobe', 'スノードーム', 'ドームを タップすると ゆきが ふわふわ', ['snowglobe'], 'skate');
  T('skate', 'rink', 'd_skate', (f) => { near(f, 2).forEach((ch) => sk(ch, f)); }, (ch, f) => sk(ch, f));
  function sk(ch, f) { A.sfx('slide'); ride(ch, f, 3200, 'spin', (k, sx, sy) => { const a = k * PT.TAU * 1.5; ch.x = f.x + Math.cos(a) * 240; ch.y = f.y - 90 + Math.sin(a) * 50; ch.z = 0; ch.pose = k > 0.8 ? 'spin' : 'slide'; ch.flip = Math.sin(a) > 0; }, (c2) => R.claim(c2, 1500).say('すいすい〜！', 'snow', 1200, 'yay')); }
  T('skate', 'cocoastand', 'd_cocoa', (f, who) => { const ch = who || near(f, 1)[0]; if (!ch) return; R.claim(ch, 4000).go(f.x + 120, f.y + 30, true).look(f.x).hold('juice').pose('eat', 1400).say('ぽかぽか〜', 'heart', 1300, 'yay').unhold(); A.sfx('ding'); }, 'tap');
  T('skate', 'snowglobe', 'd_snowglobe', (f) => { f.shake = W.t + 3000; A.sfx('sparkle'); lineUp(f, ['ゆきが ふってる！', 'きれい〜']); }, null);
  /* 40 つりぼり */
  D('d_fishing', 'つれた！', 'さんばしで つりを すると おさかなが つれる', ['dock', 'fishingrod'], 'fishing');
  D('d_frog', 'カエルの ジャンプ', 'はっぱを タップすると カエルが ぴょーん', ['frogpad'], 'fishing');
  D('d_pondfish', 'こいの えさやり', 'いけを タップすると さかなが あつまる', ['pondF', 'bread'], 'fishing');
  T('fishing', 'dock', 'd_fishing', (f, who) => { const ch = who || near(f, 1)[0]; if (!ch) return; f.fish = W.t + 2500; R.claim(ch, 5000).go(f.x + 80, f.y - 60, true).hold('fishingrod').say('しずかに…', 'fishingrod', 1500, 'talk').wait(900).unhold().do(() => { A.sfx('splash'); pop('goldfish', ch.x + 60, ch.y); }).say('つれたー！', 'star', 1400, 'yay').pose('cheer', 900); }, 'tap');
  T('fishing', 'frogpad', 'd_frog', (f) => { f.jump = W.t + 1000; A.sfx('boing'); A.tone(220, 0.15, { type: 'square', vol: 0.06, delay: 0.1 }); lineUp(f, ['ケロケロ！', 'ぴょーん！'], 'jump'); }, null);
  T('fishing', 'pondF', 'd_pondfish', (f) => { A.sfx('bubble'); W.addBubbles(f.x, f.y - 80, 8); lineUp(f, ['さかなが きた！', 'パクパク！']); }, (ch, f) => { A.sfx('splash'); R.claim(ch, 3500).go(f.x + PT.rand(-200, 200), f.y - 80, true).pose('swim', 2000).say('すいすい！', 'drop', 1300, 'yay'); });
  /* 41 くうこう */
  D('d_takeoff', 'りりく！', 'ひこうきが そらへ とびたつ', ['planeF', 'airplane'], 'airport');
  D('d_baggage', 'にもつが くるくる', 'ベルトコンベアで にもつが まわる', ['carousel2', 'bag'], 'airport');
  D('d_tower', 'かんせいとう', 'とうを タップすると「こちら かんせいとう」', ['tower'], 'airport');
  T('airport', 'planeF', 'd_takeoff', (f) => { f.fly = W.t + 3500; A.sfx('rocket'); W.chars().forEach((ch) => { if (W.isFree(ch)) R.claim(ch, 3000).look(f.x).pose('wave', 1600).say('いってらっしゃーい！', 'airplane', 1400, 'yay'); }); W.after(3600, () => { f.fly = 0; }); }, null);
  T('airport', 'carousel2', 'd_baggage', (f) => { f.run = W.t + 3000; A.sfx('train'); W.after(1500, () => pop('bag', f.x + 200, f.y + 30)); lineUp(f, ['わたしの にもつ！', 'まわってる〜']); }, null);
  T('airport', 'tower', 'd_tower', (f) => { f.call = W.t + 2000; A.sfx('zap'); const ch = near(f, 1)[0]; if (ch) R.claim(ch, 3000).look(f.x).say('こちら かんせいとう！', 'phone', 1500, 'talk').say('りりく どうぞ！', 'airplane', 1300, 'yay'); const pl = firstFix('planeF'); if (pl) W.after(1800, () => { pl.fly = W.t + 3500; A.sfx('rocket'); }); }, null);
  /* 42 うちゅうステーション */
  D('d_launch', 'ロケット はっしゃ', 'カウントダウンで ロケットが うちゅうへ', ['launchpad', 'helmet'], 'station2');
  D('d_ufo', 'UFOが きた！', 'UFOを タップすると ひかりで ふわっと', ['ufo'], 'station2');
  D('d_zerog', 'むじゅうりょく', 'へやに いれると ふわふわ うかぶ', ['zerog', 'gaku'], 'station2');
  T('station2', 'launchpad', 'd_launch', (f) => { const cs = near(f, 3); ['3', '2', '1'].forEach((n, i) => W.after(i * 700, () => { W.bigText(n, f.x, f.y - 500, '#ffd23f'); A.sfx('tap'); cs.forEach((ch) => W.say(ch, n + '！', null, 600, 'talk')); })); W.after(2100, () => { f.launch = W.t + 3500; A.sfx('rocket'); W.bigText('はっしゃ！', f.x, f.y - 500, '#ff6f61'); }); W.after(5800, () => { f.launch = 0; }); }, null);
  T('station2', 'ufo', 'd_ufo', (f) => { f.beam = W.t + 2400; A.sfx('magic'); const ch = near(f, 1, 900)[0]; if (ch) { R.claim(ch, 3000).face('surprise', 900).do(() => { R.tween(ch, 2200, (k) => { ch.z = Math.sin(k * Math.PI) * 200; ch.pose = 'fly'; }, () => { ch.z = 0; }); }).say('うわ〜 うかぶ〜！', '!', 1400, 'wow'); } }, null);
  T('station2', 'zerog', 'd_zerog', (f) => { near(f, 2).forEach((ch) => zg(ch, f)); }, (ch, f) => zg(ch, f));
  function zg(ch, f) { A.sfx('magic'); ride(ch, f, 3500, 'fly', (k, sx, sy) => { ch.x = f.x + Math.sin(k * 6) * 60; ch.y = sy; ch.z = 80 + Math.sin(k * Math.PI) * 60 + Math.sin(k * 12) * 10; ch.flip = Math.sin(k * 6) < 0; }, (c2) => R.claim(c2, 1500).say('ふわふわ だった！', 'star', 1200, 'yay')); }
  /* 43 つき */
  D('d_mochi', 'うさぎの もちつき', 'うすを タップすると ぺったん ぺったん', ['mochiusu', 'pyoko'], 'moon');
  D('d_moonjump', 'つきで ジャンプ', 'クレーターで ぴょーんと たかく', ['crater2', 'lulu'], 'moon');
  D('d_earth', 'ちきゅうが みえる', 'ちきゅうを タップすると きらりと ひかる', ['earthview'], 'moon');
  T('moon', 'mochiusu', 'd_mochi', (f) => { f.pound = W.t + 2600; for (let i = 0; i < 6; i++) W.after(i * 420, () => A.sfx('drum')); W.after(2600, () => pop(PT.pick(['marshmallow', 'donut', 'pudding']) , f.x + 150, f.y + 30)); const py = W.charOf('pyoko'); if (py && W.isFree(py)) R.claim(py, 3500).go(f.x - 160, f.y + 20, true).look(f.x).say('ぺったん！', 'heart', 1200, 'yay').pose('jump', 800); }, 'tap');
  T('moon', 'crater2', 'd_moonjump', (f) => { near(f, 2).forEach((ch) => mj(ch, f)); }, (ch, f) => mj(ch, f));
  function mj(ch, f) { A.sfx('boing'); ride(ch, f, 2600, 'jump', (k, sx, sy) => { ch.x = sx; ch.y = sy; ch.z = Math.abs(Math.sin(k * Math.PI * 2)) * 300; }, (c2) => R.claim(c2, 1500).say('ふわ〜っ！', 'moon', 1200, 'yay')); }
  T('moon', 'earthview', 'd_earth', (f) => { f.glow = W.t + 2000; A.sfx('sparkle'); lineUp(f, ['ちきゅう きれい！', 'あおいね〜']); }, null);
  /* 44 ようせいの くに */
  D('d_mushhouse', 'きのこの おうち', 'きのこの おうちに あかりが ともって ようせいが あそびに くる', ['mushhouse'], 'fairy');
  D('d_fairyring', 'ようせいの わ', 'きのこの わの なかで おどると ほしが まう', ['fairyring', 'wings'], 'fairy');
  D('d_bellflower', 'すずらんの おと', 'はなを タップすると チリリン', ['bellflower'], 'fairy');
  T('fairy', 'mushhouse', 'd_mushhouse', (f) => { f.lit = W.t + 5000; A.sfx('magic'); X.critter && X.critter('fairy', [[f.x - 200, f.y - 300, 1], [f.x, f.y - 200, 1600], [f.x + 300, f.y - 350, 1600]], {}); lineUp(f, ['ようせいさん！', 'あかりが ついた！']); }, null);
  T('fairy', 'fairyring', 'd_fairyring', (f) => { f.dance = W.t + 4000; A.sfx('magic'); near(f, 3).forEach((ch, i) => R.claim(ch, 5000).go(f.x + (i - 1) * 100, f.y - 30, true).do(() => { ch.wear = Object.assign({}, ch.wear, { back: 'wings' }); }).pose('dance', 2500).face('love', 1500)); }, 'tap');
  T('fairy', 'bellflower', 'd_bellflower', (f) => { f.ring = W.t + 1500; [88, 91, 95, 100].forEach((n, i) => A.tone(440 * Math.pow(2, (n - 69) / 12), 0.6, { type: 'sine', vol: 0.1, delay: i * 0.12 })); spark(f.x, f.y - 200, '#c9b2ff'); }, null);
  /* 45 レストラン */
  D('d_pizza', 'やきたて ピザ', 'かまどを タップすると ピザが やける', ['pizzaoven', 'pizza'], 'restaurant');
  D('d_sushi', 'くるくる おすし', 'レーンを タップすると おりょうりが まわってくる', ['sushibelt', 'onigiri'], 'restaurant');
  D('d_chefpot', 'シェフの スープ', 'おなべを タップすると いい におい', ['chefpot', 'chef'], 'restaurant');
  T('restaurant', 'pizzaoven', 'd_pizza', (f) => { f.bake = W.t + 2000; A.sfx('drumroll'); W.after(2000, () => { A.sfx('ding'); pop('pizza', f.x + 170, f.y + 30); }); lineUp(f, ['やけるかな？', 'いい におい〜']); }, null);
  T('restaurant', 'sushibelt', 'd_sushi', (f) => { f.run = W.t + 3000; A.sfx('train'); W.after(1200, () => pop(PT.pick(['onigiri', 'bento', 'burger', 'pancake', 'cake']), f.x + 320, f.y + 30)); lineUp(f, ['まわってくる！', 'どれに しよう？']); }, null);
  T('restaurant', 'chefpot', 'd_chefpot', (f, who) => { f.cook = W.t + 3000; A.sfx('bubble'); const ch = who || near(f, 1)[0]; if (ch) { if (!ch.wear.hat) ch.wear = Object.assign({}, ch.wear, { hat: 'chef' }); R.claim(ch, 4000).go(f.x + 110, f.y + 20, true).look(f.x).pose('hold', 1200).say('おいしく なあれ！', 'chef', 1400, 'yay').do(() => pop('bento', f.x + 160, f.y + 40)); } }, 'tap');
  /* 46 えいがかん */
  D('d_movie', 'じょうえい かいし', 'スクリーンを タップすると えいがが はじまる', ['screenF'], 'cinema');
  D('d_popcorn', 'ポップコーン', 'マシンを タップすると ポンポン はじける', ['popcorn'], 'cinema');
  D('d_cinemaseat', 'えいがかんの せき', 'いすに すわって えいがを みよう', ['cinemaseat', 'mimi'], 'cinema');
  T('cinema', 'screenF', 'd_movie', (f) => { f.play = W.t + 6000; f.scene = PT.irand(0, 2); A.sfx('piano'); W.chars().forEach((ch) => { if (W.isFree(ch)) R.claim(ch, 5000).look(f.x).wait(1500).face('laugh', 1500).say(PT.pick(['わあ！', 'おもしろい！', 'すごい！']), null, 1300, 'laugh'); }); }, null);
  T('cinema', 'popcorn', 'd_popcorn', (f) => { f.pop = W.t + 2000; for (let i = 0; i < 6; i++) W.after(i * 200, () => A.sfx('pop')); W.burst('confetti', f.x, f.y - 200, 8, { up: true, sp: 0.2, col: '#fff8d6' }); lineUp(f, ['ポンポン！', 'たべたい！']); }, null);
  T('cinema', 'cinemaseat', 'd_cinemaseat', (f) => { near(f, 3).forEach((ch, i) => R.claim(ch, 5000).go(f.x - 120 + i * 120, f.y + 4, true).do(() => { ch.stay = true; ch.rest = 'sit'; ch.z = 30; }).pose('sit', 3000).do(() => back(ch, f, -120 + i * 120))); }, (ch, f) => { R.claim(ch, 5000).go(f.x, f.y + 4, true).do(() => { ch.stay = true; ch.rest = 'sit'; ch.z = 30; }).pose('sit', 2500).say('えいが たのしみ！', 'heart', 1300, 'yay').do(() => back(ch, f)); });
  /* 47 おばけやしき */
  D('d_closet', 'クローゼットの おばけ', 'クローゼットを あけると「ばあ！」', ['closet'], 'ghosthouse');
  D('d_portrait', 'うごく えの め', 'えを タップすると めが きょろきょろ', ['portraits'], 'ghosthouse');
  D('d_candle', 'ろうそくが きえた', 'ろうそくを タップすると ふっと きえて…', ['candelabra', 'flashlight'], 'ghosthouse');
  T('ghosthouse', 'closet', 'd_closet', (f) => { f.boo = W.t + 1800; A.sfx('ghost'); W.chars().forEach((ch) => { if (W.isFree(ch) && Math.abs(ch.x - f.x) < 900) R.claim(ch, 2400).jump(60, 400).face('surprise', 1000).say('きゃー！', '!', 1000, 'wow').face('laugh', 800); }); }, null);
  T('ghosthouse', 'portraits', 'd_portrait', (f) => { f.look = W.t + 2500; A.sfx('ghost'); lineUp(f, ['いま うごいた！？', 'みてる〜！']); }, null);
  T('ghosthouse', 'candelabra', 'd_candle', (f) => { f.out = W.t + 2500; A.sfx('whoosh'); lineUp(f, ['くらいよ〜', 'こわくないもん！']); W.after(2600, () => { A.sfx('ding'); spark(f.x, f.y - 230, '#ffd23f'); }); }, null);
  /* 48 カーニバル */
  D('d_parade', 'パレード しゅっぱつ', 'フロートが うごいて みんなで パレード', ['paradefloat', 'trumpet'], 'carnival');
  D('d_fwlaunch', 'はなび たいかい', 'はなびを タップすると よぞらに どーん', ['fwlauncher', 'firework'], 'carnival');
  D('d_confettiF', 'かみふぶき', 'クラッカーを タップすると かみふぶき', ['confettiF', 'confetti'], 'carnival');
  T('carnival', 'paradefloat', 'd_parade', (f, who) => { f.go = W.t + 5000; A.sfx('cheer'); [72, 76, 79, 84, 79, 76, 72, 76].forEach((n, i) => A.tone(440 * Math.pow(2, (n - 69) / 12), 0.25, { type: 'square', vol: 0.05, delay: i * 0.25 })); W.chars().forEach((ch) => { if (W.isFree(ch)) R.claim(ch, 4500).pose('march', 1500).pose('dance', 1500).face('love', 1500); }); }, 'tap');
  T('carnival', 'fwlauncher', 'd_fwlaunch', (f) => { A.sfx('firework'); for (let i = 0; i < 5; i++) W.after(i * 350, () => X.firework && X.firework(PT.rand(200, 1400), PT.rand(120, 320), PT.pick(['#ff5d78', '#ffd23f', '#58b9f0', '#7bd36a', '#c38be0']))); lineUp(f, ['たまや〜！', 'きれい！']); }, null);
  T('carnival', 'confettiF', 'd_confettiF', (f) => { f.pop = W.t + 800; A.sfx('pop'); X.confetti && X.confetti(f.x, 1600); lineUp(f, ['パーン！', 'おめでとう！'], 'jump'); }, null);

  const O = (stage, text, goals, hint) => ({ id: stage + ':' + text, stage, text, goals, hint });
  PT.ODAI2 = (PT.ODAI2 || []).concat([
    O('magicschool', 'まほうの じゅぎょうを うけよう', ['d_bigcauldron', 'd_broomfly', 'd_mirror2'], ['bigcauldron']),
    O('candyhouse', 'おかしの いえを たんけん', ['d_gingerhouse', 'd_chocofountain', 'd_lollitree'], ['gingerhouse']),
    O('halloween', 'ハロウィンの よるを たのしもう', ['d_pumpkinhouse', 'd_ghost2', 'd_pumpkinpatch', 'd_halloween'], ['pumpkinhouse']),
    O('xmas', 'クリスマスの じゅんびを しよう', ['d_xmastree', 'd_sleigh', 'd_stocking'], ['xmastree']),
    O('ninja', 'にんじゃの しゅぎょうを しよう', ['d_spinwall', 'd_shuriken', 'd_ninjabell'], ['spinwall']),
    O('pirate', 'かいぞくせんで ぼうけん', ['d_shipwheel', 'd_cannon', 'd_crowsnest'], ['mast']),
    O('jungle', 'ジャングルを たんけんしよう', ['d_waterfall', 'd_vine', 'd_toucan'], ['vine']),
    O('desert', 'さばくの たからを さがそう', ['d_camel', 'd_pyramid', 'd_coconut'], ['pyramidF']),
    O('dinoland', 'きょうりゅうに あいに いこう', ['d_volcano', 'd_hatch', 'd_bigdino'], ['dinoegg']),
    O('robotfactory', 'ロボットこうじょうを うごかそう', ['d_conveyor', 'd_robotarm', 'd_buttons'], ['conveyor']),
    O('toyland', 'おもちゃたちと あそぼう', ['d_jackbox', 'd_bigtop', 'd_toytrack'], ['jackbox']),
    O('circus', 'サーカスの スターに なろう', ['d_ballbalance', 'd_trapeze', 'd_cannonman'], ['trapeze']),
    O('concert', 'コンサートを もりあげよう', ['d_spotlight', 'd_sing', 'd_drums'], ['micstand']),
    O('arcade', 'ゲームセンターで あそぼう', ['d_claw', 'd_whack', 'd_photo'], ['clawmachine']),
    O('skate', 'スケートを たのしもう', ['d_skate', 'd_cocoa', 'd_snowglobe'], ['rink']),
    O('fishing', 'おさかなを つろう', ['d_fishing', 'd_frog', 'd_pondfish'], ['dock']),
    O('airport', 'ひこうきを とばそう', ['d_takeoff', 'd_tower', 'd_baggage'], ['planeF']),
    O('station2', 'うちゅうへ しゅっぱつ', ['d_launch', 'd_ufo', 'd_zerog'], ['launchpad']),
    O('moon', 'つきの うさぎと あそぼう', ['d_mochi', 'd_moonjump', 'd_earth'], ['mochiusu']),
    O('fairy', 'ようせいの くにで あそぼう', ['d_mushhouse', 'd_fairyring', 'd_bellflower'], ['fairyring']),
    O('restaurant', 'レストランを ひらこう', ['d_pizza', 'd_sushi', 'd_chefpot'], ['pizzaoven']),
    O('cinema', 'えいがを みよう', ['d_movie', 'd_popcorn', 'd_cinemaseat'], ['screenF']),
    O('ghosthouse', 'おばけやしきに いってみよう', ['d_closet', 'd_portrait', 'd_candle'], ['closet']),
    O('carnival', 'カーニバルを もりあげよう', ['d_parade', 'd_fwlaunch', 'd_confettiF'], ['paradefloat']),
  ]);
})();
