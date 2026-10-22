/* ステージ 85〜96 の あそび（リアクション・はっけん・おだい） */
'use strict';
(() => {
  const W = PT.world, R = PT.R, D = R.D, X = PT.FX, A = PT.audio, P8 = PT.S8;
  if (!R || !R.h || !P8) return;
  const { isC } = R.h;
  const onFix = (c, type) => (c.tgt && c.tgt.kind === 'fix' && c.tgt.type === type ? c.tgt : null);
  const tapFix = (c, type) => (c.e.kind === 'fix' && c.e.type === type ? c.e : null);
  const spark = (x, y, col = '#ffd23f', n = 10) => W.burst('spark', x, y, n, { sp: 0.2, max: 800, size: 10, col, g: 0 });
  const hearts = (x, y, n = 5) => W.burst('heart', x, y, n, { up: true, sp: 0.12, max: 900 });
  const stars = (x, y, n = 6) => W.burst('star', x, y, n, { up: true, sp: 0.18, max: 1000 });
  const near = (f, n = 2, r = 1600) => R.free(f.x, f.y, [], r).slice(0, n);
  const pop = (id, x, y) => { if (!PT.ITEMS[id]) return null; const p = W.addProp(id, x, y); p.pop = W.t; return p; };
  const back = (ch, f, dx = 160) => { ch.stay = false; ch.z = 0; ch.baseZ = 0; ch.rest = 'idle'; ch.hidden = false; const p = W.clampFloor(f.x + dx, f.y + 40); ch.x = p.x; ch.y = p.y; ch.scale = W.depthScale(ch.y); };
  const lineUp = (f, lines, pose = 'cheer') => near(f, 2, 1500).forEach((ch, i) => R.claim(ch, 3000).wait(300 + i * 300).look(f.x).face('surprise', 800).say(lines[i % lines.length], null, 1400, 'wow').pose(pose, 900));
  const tune = (notes, type = 'triangle', gap = 0.22, vol = 0.1) => notes.forEach((n, i) => n && A.tone(440 * Math.pow(2, (n - 69) / 12), gap * 1.4, { type, vol, delay: i * gap }));
  const wear = (ch, o) => { ch.wear = Object.assign({}, ch.wear, o); };
  /* T: タップと キャラおきの りょうほう */
  const T = (stage, type, disc, tap, put) => {
    const k = type.replace('s8_', '');
    if (tap) R.add({ id: 's8-' + k + '-tap', on: 'tapfix', pri: 52, stage, test: (c) => tapFix(c, type), run(c, f) { tap(f); W.after(900, () => R.found(disc)); } });
    const p = put === 'tap' ? (ch, f) => tap(f, ch) : put;
    if (p) R.add({ id: 's8-' + k + '-char', pri: 78, stage, test: (c) => (isC(c.e) ? onFix(c, type) : null), run(c, f) { p(c.e, f); W.after(1500, () => R.found(disc)); } });
  };
  /* のりもの：start は のりはじめに よぶ（遊具の アニメと あわせる） */
  const ride = (ch, f, ms, pose, fn, done, start) => R.claim(ch, ms + 4000).go(f.x, f.y + 6, true).do(() => { ch.stay = true; ch.flip = false; const sx = ch.x, sy = ch.y; if (start) start(); R.tween(ch, ms, (k) => { ch.pose = pose; fn(k, sx, sy); ch.scale = W.depthScale(ch.y); }, () => { back(ch, f); if (done) done(ch); }); });
  const yay = (ch, txt, icon = 'star') => R.claim(ch, 1800).say(txt, icon, 1400, 'yay').pose('cheer', 900);
  const one = (f, who) => who || near(f, 1)[0];

  /* ---------- 85 おしょうがつ ---------- */
  D('d8_mochi', 'もちつき ぺったん', 'うすと きねで おもちを ぺったん ぺったん', ['s8_mochi', 'marshmallow'], 'newyear');
  D('d8_kite', 'たこあげ', 'たこが たかーく あがって キャラも ふわり', ['s8_kite', 'kite'], 'newyear');
  D('d8_koma', 'こままわし', 'こまが くるくる。のると いっしょに まわっちゃう', ['s8_koma'], 'newyear');
  T('newyear', 's8_mochi', 'd8_mochi', (f) => { f.pound = W.t + 2600; for (let i = 0; i < 6; i++) W.after(i * 420, () => A.sfx('drum')); W.after(2600, () => { A.sfx('ding'); pop('marshmallow', f.x + 160, f.y + 30); }); lineUp(f, ['ぺったん！', 'よいしょ！'], 'jump'); },
    (ch, f) => { R.claim(ch, 5000).go(f.x - 150, f.y + 20, true).look(f.x).do(() => { f.pound = W.t + 2600; for (let i = 0; i < 6; i++) W.after(i * 420, () => A.sfx('drum')); }).say('よいしょ！', null, 1200, 'yay').pose('jump', 1300).do(() => { pop('marshmallow', f.x + 160, f.y + 30); spark(f.x, f.y - 120, '#ffffff'); }).hold('marshmallow').pose('eat', 1200).say('おもち のびる〜', 'heart', 1400, 'laugh').unhold(); });
  T('newyear', 's8_kite', 'd8_kite', (f) => { f.soar = W.t + 3000; A.sfx('whoosh'); W.burst('leaf', f.x, f.y - 300, 6, { sp: 0.2 }); lineUp(f, ['たかーい！', 'あがれ あがれ！']); },
    (ch, f) => { A.sfx('whoosh'); ride(ch, f, 3400, 'hold', (k, sx, sy) => { ch.x = sx + Math.sin(k * PT.TAU) * 60; ch.y = sy; ch.z = Math.sin(k * Math.PI) * 220; }, (c2) => yay(c2, 'そらを とんだ！', 'kite'), () => { f.lift = W.t + 3400; }); });
  T('newyear', 's8_koma', 'd8_koma', (f) => { f.spin = W.t + 3000; A.sfx('whoosh'); A.sfx('tickle'); lineUp(f, ['くるくる〜！', 'じょうず！'], 'spin'); },
    (ch, f) => { A.sfx('whoosh'); ride(ch, f, 3000, 'spin', (k, sx, sy) => { ch.x = sx; ch.y = sy; ch.z = 110; ch.flip = Math.floor(k * 16) % 2 === 0; }, (c2) => R.claim(c2, 2000).face('silly', 1400).say('めが まわる〜', 'star', 1400, 'laugh').pose('trip', 800), () => { f.spin = W.t + 3000; }); });

  /* ---------- 86 こどもの ひ ---------- */
  D('d8_koinobori', 'こいのぼりに のって', 'こいのぼりに のって おおぞらを およぐ', ['s8_koinobori'], 'kodomonohi');
  D('d8_kabuto', 'かぶとで えいえい おー', 'かぶとが ピカッ。みんな つよい こ！', ['s8_kabuto', 'kabuto'], 'kodomonohi');
  D('d8_shobu', 'しょうぶゆ ぽかぽか', 'しょうぶの おふろで ぽかぽか', ['s8_shobu'], 'kodomonohi');
  T('kodomonohi', 's8_koinobori', 'd8_koinobori', (f) => { f.wind = W.t + 3500; A.sfx('whoosh'); W.burst('leaf', f.x - 300, f.y - 400, 8, { sp: 0.25 }); lineUp(f, ['かぜが ふいた！', 'およいでる〜！']); },
    (ch, f) => { A.sfx('whoosh'); ride(ch, f, 3600, 'fly', (k, sx, sy) => { const u = Math.sin(k * Math.PI); ch.x = f.x - 120 + u * 120 + Math.sin(W.t * 0.006) * 12; ch.y = sy; ch.z = u * 400; }, (c2) => yay(c2, 'こいのぼり さいこう！'), () => { f.ride = W.t + 3600; }); });
  T('kodomonohi', 's8_kabuto', 'd8_kabuto', (f) => { f.shine = W.t + 2500; A.sfx('drumroll'); spark(f.x, f.y - 250, '#ffd23f', 14); near(f, 3).forEach((ch, i) => R.claim(ch, 3000).wait(i * 200).look(f.x).say('えいえい おー！', 'star', 1300, 'yay').pose('cheer', 1000)); },
    (ch, f) => { f.shine = W.t + 2500; A.sfx('magic'); R.claim(ch, 4000).go(f.x + 150, f.y + 20, true).look(f.x).do(() => { wear(ch, { hat: PT.ITEMS.kabuto ? 'kabuto' : 'knighthelm' }); spark(ch.x, ch.y - 140, '#ffd23f', 12); }).pose('cheer', 1000).say('つよく なるぞ！', 'star', 1400, 'yay'); });
  T('kodomonohi', 's8_shobu', 'd8_shobu', (f) => { f.splash = W.t + 2500; A.sfx('splash'); W.addBubbles(f.x, f.y - 80, 6); lineUp(f, ['いい におい！', 'ぽかぽか〜']); },
    (ch, f) => { A.sfx('splash'); ride(ch, f, 3600, 'sit', (k, sx, sy) => { ch.x = f.x + Math.sin(k * 8) * 6; ch.y = f.y - 24; ch.z = 10; }, (c2) => { W.addBubbles(c2.x, c2.y - 80, 4); R.claim(c2, 1800).say('ぽかぽか〜', 'heart', 1400, 'yay'); }, () => { f.splash = W.t + 3600; X.splash && X.splash(f.x, f.y - 110); }); });

  /* ---------- 87 うちゅうじんの ほし ---------- */
  D('d8_ufo', 'うちゅうじんと あくしゅ', 'UFOの とびらが ひらいて うちゅうじんが こんにちは', ['s8_ufo2'], 'alienplanet');
  D('d8_crystal', 'うたう クリスタル', 'クリスタルが キラキラ ドレミ', ['s8_crystal'], 'alienplanet');
  D('d8_jelly', 'ぷるぷる ジャンプ', 'ぷるぷるの しょくぶつで びよーん！', ['s8_jelly'], 'alienplanet');
  T('alienplanet', 's8_ufo2', 'd8_ufo', (f) => { f.open = W.t + 3500; A.sfx('magic'); X.critter && X.critter('alien', [[f.x - 60, f.y + 20, 1], [f.x - 260, f.y + 60, 1500], [f.x - 60, f.y + 20, 1500]], {}); near(f, 2).forEach((ch, i) => R.claim(ch, 3200).wait(500 + i * 300).look(f.x).face('surprise', 800).say(i ? 'ピコピコ？' : 'こんにちは！', '!', 1300, 'wow').pose('wave', 1000)); },
    (ch, f) => { A.sfx('rocket'); ride(ch, f, 4000, 'cheer', (k) => { const [dx, dy] = P8.ufo(k); ch.x = f.x + dx; ch.y = f.y + 6; ch.z = 176 - dy; }, (c2) => yay(c2, 'うちゅう りょこう！', 'star'), () => { f.fly = W.t + 4000; }); });
  T('alienplanet', 's8_crystal', 'd8_crystal', (f) => { f.ring = W.t + 2500; tune([84, 88, 91, 96, 91, 88], 'sine', 0.16, 0.1); spark(f.x, f.y - 200, '#b49aff', 14); lineUp(f, ['きれいな おと！', 'キラキラ！']); },
    (ch, f) => { f.float = W.t + 3200; tune([72, 76, 79, 84], 'sine', 0.2, 0.1); ride(ch, f, 3200, 'fly', (k, sx, sy) => { ch.x = sx + Math.sin(k * 10) * 20; ch.y = sy; ch.z = Math.sin(k * Math.PI) * 240; if (Math.random() < 0.25) W.burst('spark', ch.x, ch.y - ch.z - 40, 1, { sp: 0.05, max: 600, col: '#b49aff', g: 0 }); }, (c2) => yay(c2, 'ふわ〜っ！', 'star')); });
  T('alienplanet', 's8_jelly', 'd8_jelly', (f) => { f.wob = W.t + 1800; A.sfx('boing'); W.addBubbles(f.x, f.y - 160, 5); lineUp(f, ['ぷるぷる〜！', 'かわいい！'], 'jump'); },
    (ch, f) => { f.bounce = W.t + 3000; ride(ch, f, 3000, 'jump', (k, sx, sy) => { ch.x = sx; ch.y = sy; const b = Math.abs(Math.sin(k * Math.PI * 3)); ch.z = 150 + b * 380; if (b < 0.05 && Math.random() < 0.5) A.sfx('boing'); }, (c2) => yay(c2, 'びよーん！')); });

  /* ---------- 88 みらいの まち ---------- */
  D('d8_tube', 'チューブで びゅーん', 'すきとおった チューブを びゅーんと とおりぬけ', ['s8_tube'], 'futurecity');
  D('d8_flycar', 'そらとぶ くるま', 'くるまが ふわっと うかんで そらの さんぽ', ['s8_flycar', 'car'], 'futurecity');
  D('d8_holo', 'ホログラム', 'ひかりの えが くるくる。のると みらいの ふくに', ['s8_holo', 'robotsuit'], 'futurecity');
  T('futurecity', 's8_tube', 'd8_tube', (f) => { f.pod = W.t + 1800; A.sfx('whoosh'); W.after(1700, () => spark(f.x + 300, f.y - 60, '#7fffd4')); lineUp(f, ['はやーい！', 'びゅーん！']); },
    (ch, f) => { A.sfx('whoosh'); R.claim(ch, 7000).go(f.x - 300, f.y + 6, true).do(() => { ch.stay = true; ch.flip = false; R.tween(ch, 2200, (k) => { const [x, y] = P8.tube(k); ch.pose = 'fly'; ch.x = f.x + x; ch.y = f.y + 6; ch.z = -y - 50; ch.scale = W.depthScale(ch.y); }, () => { back(ch, f, 380); spark(ch.x, ch.y - 80, '#7fffd4'); R.claim(ch, 1800).say('びゅーん！', 'star', 1300, 'yay').pose('cheer', 800); }); }); });
  T('futurecity', 's8_flycar', 'd8_flycar', (f) => { f.fly = W.t + 4000; A.sfx('rocket'); W.chars().forEach((ch) => { if (W.isFree(ch) && Math.abs(ch.x - f.x) < 900) R.claim(ch, 3000).look(f.x).say('とんでる！', 'car', 1300, 'wow').pose('point', 1000); }); },
    (ch, f) => { A.sfx('rocket'); ride(ch, f, 4000, 'sit', (k) => { const [dx, dy] = P8.car(k); ch.x = f.x + dx; ch.y = f.y + 6; ch.z = 70 - dy; ch.flip = Math.cos(k * PT.TAU) < 0; }, (c2) => yay(c2, 'そらの ドライブ！', 'car'), () => { f.fly = W.t + 4000; }); });
  T('futurecity', 's8_holo', 'd8_holo', (f) => { f.shape = ((f.shape || 0) + 1) % 4; f.zap = W.t + 1500; A.sfx('zap'); spark(f.x, f.y - 200, '#7fffd4', 12); lineUp(f, ['かわった！', 'すごい ひかり！']); },
    (ch, f) => { f.zap = W.t + 2000; A.sfx('magic'); R.claim(ch, 4000).go(f.x, f.y + 6, true).do(() => { W.poof(ch.x, ch.y - 80); wear(ch, { body: 'robot', face: 'starglasses' }); spark(ch.x, ch.y - 120, '#7fffd4', 14); }).pose('spin', 900).say('みらいの ふく！', 'robotsuit', 1500, 'yay').pose('march', 900); });

  /* ---------- 89 むかしばなしの むら ---------- */
  D('d8_peach', 'ももが どんぶらこ', 'かわから おおきな ももが どんぶらこ…ぱかっ！', ['s8_peach'], 'momotaro');
  D('d8_dango', 'きびだんごで なかま', 'だんごを たべると どうぶつの なかまが あつまる', ['s8_dango', 'marshmallow'], 'momotaro');
  D('d8_bamboo', 'ひかる たけ', 'たけが ひかって にょきにょき のびる', ['s8_bamboo', 'moon'], 'momotaro');
  const peachPop = (f) => { f.pop = W.t + 2400; A.sfx('discover'); stars(f.x + P8.peach(1), f.y - 100, 8); pop('present', f.x + P8.peach(1), f.y + 30); };
  T('momotaro', 's8_peach', 'd8_peach', (f) => { f.flow = W.t + 3200; A.sfx('wave'); near(f, 2).forEach((ch, i) => R.claim(ch, 3600).wait(i * 300).look(f.x).say(i ? 'おおきな もも！' : 'どんぶらこ〜', null, 1400, 'wow').wait(800).face('surprise', 900).pose('jump', 800)); W.after(3200, () => peachPop(f)); },
    (ch, f) => { A.sfx('wave'); ride(ch, f, 3200, 'sit', (k) => { ch.x = f.x + P8.peach(k); ch.y = f.y + 6; ch.z = 100 + Math.sin(W.t * 0.005) * 6; }, (c2) => { peachPop(f); yay(c2, 'どんぶらこ〜！', 'heart'); }, () => { f.flow = W.t + 3200; }); });
  const friends = (x, y) => { X.critter && X.critter('bird', [[x - 500, y - 300, 1], [x - 80, y - 160, 1500], [x - 60, y - 200, 1500]], {}); X.critter && X.critter('kitty', [[x + 500, y + 40, 1], [x + 100, y + 40, 1800], [x + 140, y + 40, 1200]], {}); X.critter && X.critter('squirrel', [[x - 500, y + 60, 1], [x - 120, y + 60, 1600], [x - 160, y + 60, 1400]], {}); };
  T('momotaro', 's8_dango', 'd8_dango', (f) => { f.serve = W.t + 2500; A.sfx('pop'); pop('marshmallow', f.x + 170, f.y + 30); friends(f.x, f.y); lineUp(f, ['なかまが きた！', 'いっしょに いこう！']); },
    (ch, f) => { f.serve = W.t + 2500; R.claim(ch, 5000).go(f.x + 150, f.y + 20, true).look(f.x).hold('marshmallow').pose('eat', 1300).unhold().do(() => { friends(ch.x, ch.y); A.sfx('cheer'); }).say('なかまに なろう！', 'heart', 1500, 'yay').pose('march', 1200); });
  T('momotaro', 's8_bamboo', 'd8_bamboo', (f) => { f.glow = W.t + 3000; A.sfx('sparkle'); W.after(1200, () => { pop('moon', f.x + 150, f.y + 30); spark(f.x, f.y - 160, '#fff3a0', 14); }); lineUp(f, ['たけが ひかってる！', 'ふしぎ〜']); },
    (ch, f) => { A.sfx('magic'); ride(ch, f, 3600, 'cheer', (k, sx, sy) => { ch.x = f.x; ch.y = f.y + 6; ch.z = 150 + Math.sin(k * Math.PI) * 280; }, (c2) => yay(c2, 'にょきにょき〜！'), () => { f.grow = W.t + 3600; f.glow = W.t + 3600; }); });

  /* ---------- 90 こびとの もり ---------- */
  D('d8_bigmush', 'きのこの トランポリン', 'おおきな きのこで ぽよーん ぽよーん', ['s8_bigmush'], 'tinyworld');
  D('d8_acorn', 'おおきな どんぐり', 'どんぐりの ぼうしが ぽーん。ころころ ころがる', ['s8_acorn', 'acorn'], 'tinyworld');
  D('d8_leaf', 'はっぱの すべりだい', 'はっぱの うえを しずくと いっしょに すべる', ['s8_leaf'], 'tinyworld');
  T('tinyworld', 's8_bigmush', 'd8_bigmush', (f) => { f.puff = W.t + 2400; A.sfx('boing'); spark(f.x, f.y - 340, '#fff0a0', 12); lineUp(f, ['きらきらの こな！', 'ぽよん！'], 'jump'); },
    (ch, f) => { f.bounce = W.t + 3200; ride(ch, f, 3200, 'jump', (k, sx, sy) => { ch.x = sx; ch.y = sy; const b = Math.abs(Math.sin(k * Math.PI * 3)); ch.z = 300 + b * 260; }, (c2) => yay(c2, 'ぽよーん！'), () => A.sfx('boing')); });
  T('tinyworld', 's8_acorn', 'd8_acorn', (f) => { f.pop = W.t + 1600; A.sfx('pop'); for (let i = 0; i < 3; i++) W.after(500 + i * 200, () => pop('acorn', f.x + PT.rand(-160, 160), f.y + PT.rand(20, 60))); X.critter && X.critter('squirrel', [[f.x + 500, f.y + 40, 1], [f.x + 150, f.y + 40, 1500], [f.x + 500, f.y + 40, 1500]], {}); lineUp(f, ['ぼうしが とんだ！', 'どんぐり いっぱい！']); },
    (ch, f) => { A.sfx('tickle'); ride(ch, f, 3600, 'run', (k) => { ch.x = f.x + P8.acorn(k); ch.y = f.y + 6; ch.z = 190 + Math.abs(Math.sin(k * 20)) * 8; ch.flip = k > 0.5; }, (c2) => yay(c2, 'ころころ〜！', 'acorn'), () => { f.roll = W.t + 3600; }); });
  T('tinyworld', 's8_leaf', 'd8_leaf', (f) => { f.drop = W.t + 1600; A.sfx('slide'); W.after(1200, () => { A.sfx('splash'); X.rainbow && X.rainbow(3000); }); lineUp(f, ['しずくが すべった！', 'にじだ！']); },
    (ch, f) => { A.sfx('slide'); ride(ch, f, 1800, 'slide', (k) => { ch.x = f.x - 150 + k * 360; ch.y = f.y + 6; ch.z = Math.max(0, 240 * (1 - k * 1.1)); }, (c2) => { W.burst('drop', c2.x, c2.y - 20, 8, { up: true, sp: 0.2 }); yay(c2, 'すべった〜！'); }, () => { f.drop = W.t + 1600; }); });

  /* ---------- 91 アイスの くに ---------- */
  D('d8_softserve', 'ソフトクリーム マシン', 'レバーを ひくと ソフトクリームが にゅるにゅる', ['s8_softserve', 'icecream'], 'icecreamland');
  D('d8_creamslide', 'アイスの やまの すべりだい', 'アイスの やまを すべって トッピング きらきら', ['s8_creamslide'], 'icecreamland');
  D('d8_soda', 'シュワシュワ ソーダ', 'ソーダの あわで ふわふわ うかぶ', ['s8_soda', 'juice'], 'icecreamland');
  T('icecreamland', 's8_softserve', 'd8_softserve', (f) => { f.swirl = W.t + 2200; A.sfx('bubble'); W.after(2200, () => { A.sfx('ding'); pop('icecream', f.x + 160, f.y + 30); }); lineUp(f, ['にゅるにゅる〜', 'おいしそう！']); },
    (ch, f) => { f.swirl = W.t + 2200; A.sfx('bubble'); R.claim(ch, 5000).go(f.x + 140, f.y + 20, true).look(f.x).wait(1200).hold('icecream').pose('eat', 1500).face('love', 1200).say('つめたくて おいしい！', 'icecream', 1500, 'yay').unhold(); });
  T('icecreamland', 's8_creamslide', 'd8_creamslide', (f) => { f.sprinkle = W.t + 2500; A.sfx('sparkle'); W.burst('confetti', f.x, f.y - 300, 14, { up: true, sp: 0.25 }); lineUp(f, ['トッピング！', 'カラフル〜！']); },
    (ch, f) => { A.sfx('slide'); ride(ch, f, 2200, 'slide', (k) => { const q = k; ch.x = f.x - 120 + q * 340; ch.y = f.y + 6; ch.z = Math.max(0, 290 * (1 - q) * (1 - q * 0.3)); }, (c2) => { W.burst('confetti', c2.x, c2.y - 40, 10, { up: true, sp: 0.2 }); yay(c2, 'あまーい すべりだい！', 'icecream'); }, () => { f.sprinkle = W.t + 2200; }); });
  T('icecreamland', 's8_soda', 'd8_soda', (f) => { f.fizz = W.t + 2500; A.sfx('bubble'); W.addBubbles(f.x, f.y - 280, 10); lineUp(f, ['シュワシュワ！', 'あわが いっぱい！']); },
    (ch, f) => { f.fizz = W.t + 3600; A.sfx('bubble'); ride(ch, f, 3600, 'fly', (k, sx, sy) => { ch.x = sx + Math.sin(k * 9) * 30; ch.y = sy; ch.z = Math.sin(k * Math.PI) * 300; }, (c2) => { W.addBubbles(c2.x, c2.y - 60, 6); yay(c2, 'あわで ふわふわ！'); }, () => W.addBubbles(f.x, f.y - 100, 6)); });

  /* ---------- 92 ほしの うみ ---------- */
  D('d8_moonboat', 'みかづきの ふね', 'つきの ふねに のって ほしの うみを ゆらゆら', ['s8_moonboat', 'moon'], 'galaxysea');
  D('d8_starwhale', 'ほしの クジラ', 'クジラが しおの かわりに ほしを ふきだす', ['s8_starwhale', 'star'], 'galaxysea');
  D('d8_telescope', 'ぼうえんきょうで せいざ', 'ぼうえんきょうで ながれぼし と せいざを みつける', ['s8_telescope'], 'galaxysea');
  T('galaxysea', 's8_moonboat', 'd8_moonboat', (f) => { f.rock = W.t + 2600; A.sfx('wave'); lineUp(f, ['ゆらゆら〜', 'ほしが のぼっていく！']); },
    (ch, f) => { A.sfx('wave'); ride(ch, f, 4000, 'sit', (k) => { ch.x = f.x + P8.boat(k); ch.y = f.y + 6; ch.z = 90 + Math.sin(W.t * 0.004) * 6; }, (c2) => yay(c2, 'ほしの うみ きれい！', 'moon'), () => { f.sail = W.t + 4000; f.rock = W.t + 4000; }); });
  T('galaxysea', 's8_starwhale', 'd8_starwhale', (f) => { f.spout = W.t + 2600; A.sfx('splash'); stars(f.x - 40, f.y - 260, 8); lineUp(f, ['ほしの しお！', 'クジラさーん！']); },
    (ch, f) => { f.spout = W.t + 3400; A.sfx('splash'); ride(ch, f, 3400, 'fly', (k, sx, sy) => { ch.x = f.x - 40; ch.y = sy; ch.z = 200 + Math.sin(k * Math.PI) * 300; if (Math.random() < 0.2) W.burst('star', ch.x, ch.y - ch.z, 1, { sp: 0.1 }); }, (c2) => yay(c2, 'ほしの シャワー！')); });
  const CONS = [[[[0, 0], [60, -40], [120, 0], [100, 70], [20, 70], [0, 0]], 'さかなざ'], [[[0, 0], [40, -80], [80, 0], [140, -20], [180, 40]], 'うさぎざ'], [[[0, 0], [70, -30], [140, 0], [70, 60], [0, 0], [70, -30]], 'ハートざ']];
  const cons = (f) => { const [pts, name] = PT.pick(CONS); const ox = PT.rand(300, 1100), oy = PT.rand(120, 240); X.constellation && X.constellation(pts.map(([x, y]) => [ox + x * 1.5, oy + y * 1.5]), name); A.sfx('sparkle'); };
  T('galaxysea', 's8_telescope', 'd8_telescope', (f) => { f.shoot = W.t + 2600; A.sfx('whoosh'); W.after(600, () => A.sfx('sparkle')); lineUp(f, ['ながれぼし！', 'おねがいごと しよう！']); },
    (ch, f) => { f.look = W.t + 3000; R.claim(ch, 5000).go(f.x - 120, f.y + 20, true).look(f.x).pose('peek', 1500).do(() => cons(f)).say('せいざ みつけた！', 'star', 1500, 'yay').pose('point', 1000); });

  /* ---------- 93 ドールハウス ---------- */
  D('d8_dhouse', 'ちいさく なって おじゃまします', 'ドールハウスに あかりが ついて ちいさく なって はいれる', ['s8_dhouse'], 'dollhouse');
  D('d8_teaparty', 'おにんぎょうの おちゃかい', 'ティーポットから こぽこぽ。おちゃかいの はじまり', ['s8_teaparty', 'teaset'], 'dollhouse');
  D('d8_musicbox', 'オルゴールの バレリーナ', 'オルゴールの うえで くるくる バレリーナ', ['s8_musicbox2', 'tutu'], 'dollhouse');
  T('dollhouse', 's8_dhouse', 'd8_dhouse', (f) => { f.lit = W.t + 4500; A.sfx('ding'); W.after(700, () => A.sfx('ding')); lineUp(f, ['あかりが ついた！', 'ちいさな おにんぎょう！']); },
    (ch, f) => { f.lit = W.t + 4500; A.sfx('magic'); R.claim(ch, 8000).go(f.x + 60, f.y + 6, true).do(() => { ch.stay = true; W.poof(ch.x, ch.y - 60); R.tween(ch, 3600, (k) => { const s = k < 0.15 ? 1 - k / 0.15 * 0.6 : k > 0.85 ? 0.4 + (k - 0.85) / 0.15 * 0.6 : 0.4; ch.pose = 'wave'; ch.x = f.x + (k < 0.5 ? -88 : 88); ch.y = f.y + 6; ch.z = k > 0.15 && k < 0.85 ? (k < 0.5 ? 190 : 20) : 0; ch.scale = W.depthScale(ch.y) * s; }, () => { back(ch, f); W.poof(ch.x, ch.y - 60); R.claim(ch, 1800).say('ちいさく なってた！', 'heart', 1400, 'laugh'); }); }); });
  T('dollhouse', 's8_teaparty', 'd8_teaparty', (f) => { f.pour = W.t + 2200; A.sfx('bubble'); W.after(2000, () => pop('cookie', f.x + 200, f.y + 30)); lineUp(f, ['こぽこぽ〜', 'おちゃかい しよう！']); },
    (ch, f) => { f.pour = W.t + 2200; R.claim(ch, 5000).go(f.x - 170, f.y + 20, true).look(f.x).wait(1200).hold('teaset').pose('eat', 1400).say('おいしい おちゃ！', 'heart', 1400, 'yay').unhold().pose('wave', 700); hearts(f.x, f.y - 200); });
  T('dollhouse', 's8_musicbox2', 'd8_musicbox', (f) => { f.play = W.t + 3500; tune([76, 79, 84, 83, 79, 76, 74, 76], 'sine', 0.3, 0.1); lineUp(f, ['きれいな おと〜', 'くるくる！'], 'spin'); },
    (ch, f) => { f.play = W.t + 3600; tune([76, 79, 84, 83, 79, 76, 74, 76], 'sine', 0.3, 0.1); ride(ch, f, 3600, 'spin', (k, sx, sy) => { ch.x = f.x; ch.y = sy; ch.z = 140; ch.flip = Math.floor(k * 12) % 2 === 0; }, (c2) => yay(c2, 'バレリーナ みたい！', 'heart'), () => wear(ch, { body: 'tutu' })); });

  /* ---------- 94 えほんの せかい ---------- */
  D('d8_bigbook', 'とびだす えほん', 'ページを めくると えが とびだす。はいると へんしん！', ['s8_bigbook', 'book'], 'picturebook');
  D('d8_crayon', 'クレヨンの にじ', 'おおきな クレヨンで そらに にじを かく', ['s8_crayon', 'crayons'], 'picturebook');
  D('d8_beanstalk', 'まめのきを のぼろう', 'まめのきを のぼって くもの うえへ', ['s8_beanstalk', 'egg'], 'picturebook');
  T('picturebook', 's8_bigbook', 'd8_bigbook', (f) => { f.scene = ((f.scene || 0) + 1) % 3; f.flip = W.t + 4000; A.sfx('whoosh'); W.after(1200, () => { A.sfx('sparkle'); spark(f.x, f.y - 250, '#ffd23f', 12); }); lineUp(f, ['とびだした！', 'つぎの ページ！']); },
    (ch, f) => { f.flip = W.t + 4000; A.sfx('magic'); R.claim(ch, 6000).go(f.x, f.y + 6, true).do(() => { W.poof(ch.x, ch.y - 80); ch.hidden = true; }).wait(1600).do(() => { const [hat, body] = PT.pick([['crown', 'princecoat'], ['tiara', 'dress'], ['pirate', null], ['witch', 'witchdress'], ['frog', null]]); wear(ch, body ? { hat, body } : { hat }); back(ch, f, PT.pick([-260, 260])); ch.hidden = false; W.poof(ch.x, ch.y - 80); stars(ch.x, ch.y - 120); }).say('えほんの なかから こんにちは！', 'book', 1600, 'yay').pose('cheer', 900); });
  T('picturebook', 's8_crayon', 'd8_crayon', (f) => { f.draw = W.t + 3500; A.sfx('tickle'); W.after(2400, () => A.sfx('sparkle')); lineUp(f, ['にじを かいた！', 'じょうず〜！']); },
    (ch, f) => { f.draw = W.t + 3500; R.claim(ch, 5000).go(f.x - 140, f.y + 20, true).look(f.x).hold('crayons').pose('point', 1200).say('かきかき…', 'crayons', 1300, 'talk').unhold().do(() => { pop('flower', ch.x - 60, ch.y + 20); spark(ch.x - 60, ch.y - 40, '#ff6f91'); }).say('おはなが でてきた！', 'flower', 1400, 'yay'); });
  T('picturebook', 's8_beanstalk', 'd8_beanstalk', (f) => { f.grow = W.t + 2600; A.sfx('magic'); W.after(1800, () => { pop('egg', f.x + 160, f.y + 30); spark(f.x + 160, f.y - 40, '#ffd23f', 12); }); lineUp(f, ['のびてる〜！', 'きんの たまご！']); },
    (ch, f) => { A.sfx('magic'); ride(ch, f, 4000, 'hold', (k) => { ch.x = f.x + Math.sin(W.t * 0.008) * 10; ch.y = f.y + 6; ch.z = Math.sin(k * Math.PI) * 500; if (k > 0.45 && k < 0.55 && !ch._s8said) { ch._s8said = true; W.say(ch, 'くもの うえだ！', 'cloud', 1200, 'yay'); } }, (c2) => { c2._s8said = false; yay(c2, 'たかかった〜！'); }, () => { f.climb = W.t + 4000; }); });

  /* ---------- 95 ジェットコースター ---------- */
  D('d8_coaster', 'ジェットコースター', 'コースターに のって きゃー！ びゅーん！', ['s8_coaster'], 'coaster');
  D('d8_teacup', 'くるくる コーヒーカップ', 'カップが ぐるぐる。めが まわる〜', ['s8_teacup'], 'coaster');
  D('d8_droptower', 'フリーフォール', 'ゆっくり のぼって…すとーん！', ['s8_droptower'], 'coaster');
  T('coaster', 's8_coaster', 'd8_coaster', (f) => { f.run = W.t + 4500; A.sfx('train'); W.after(1000, () => A.sfx('whoosh')); W.chars().forEach((ch) => { if (W.isFree(ch)) R.claim(ch, 3000).look(f.x).say('はやーい！', '!', 1300, 'wow').pose('cheer', 1000); }); },
    (ch, f) => { A.sfx('train'); R.claim(ch, 9000).go(f.x - 400, f.y + 6, true).do(() => { ch.stay = true; ch.flip = false; f.run = W.t + 4500; R.tween(ch, 4500, (k) => { const [x, y] = P8.coaster(k); ch.pose = 'cheer'; ch.x = f.x + x; ch.y = f.y + 6; ch.z = -y + 30; ch.scale = W.depthScale(ch.y); if (k > 0.15 && k < 0.2 && !ch._s8said) { ch._s8said = true; W.say(ch, 'きゃー！', '!', 900, 'wow'); A.sfx('whoosh'); } }, () => { ch._s8said = false; back(ch, f, 440); A.sfx('cheer'); R.claim(ch, 1800).say('もう いっかい！', 'star', 1400, 'yay').pose('jump', 800); }); }); });
  T('coaster', 's8_teacup', 'd8_teacup', (f) => { f.spin = W.t + 3000; A.sfx('whoosh'); lineUp(f, ['ぐるぐる〜！', 'はやい はやい！'], 'spin'); },
    (ch, f) => { A.sfx('whoosh'); ride(ch, f, 3200, 'sit', (k) => { const a = k * PT.TAU * 2.5; ch.x = f.x + Math.cos(a) * 110; ch.y = f.y - 30 + Math.sin(a) * 30; ch.z = 30; ch.flip = Math.sin(a) > 0; }, (c2) => R.claim(c2, 2000).face('silly', 1400).say('めが まわる〜', 'star', 1400, 'laugh').pose('trip', 900), () => { f.spin = W.t + 3200; }); });
  T('coaster', 's8_droptower', 'd8_droptower', (f) => { f.drop = W.t + 5000; A.sfx('drumroll'); W.after(3400, () => A.sfx('whoosh')); lineUp(f, ['のぼっていく…', 'すとーん！']); },
    (ch, f) => { A.sfx('drumroll'); ride(ch, f, 5000, 'sit', (k) => { ch.x = f.x - 56; ch.y = f.y + 6; ch.z = P8.tower(k) + 60; if (k > 0.68 && !ch._s8said) { ch._s8said = true; W.say(ch, 'きゃー！', '!', 1000, 'wow'); A.sfx('whoosh'); } }, (c2) => { c2._s8said = false; yay(c2, 'ドキドキした〜！'); }, () => { f.drop = W.t + 5000; }); });

  /* ---------- 96 おたんじょうび パーティー ---------- */
  D('d8_kusudama', 'くすだま パッカーン', 'くすだまが われて「おめでとう！」', ['s8_kusudama', 'confetti'], 'birthday');
  D('d8_bigcake', 'ろうそく ふーっ', 'ハッピーバースデーを うたって ろうそくを ふーっ', ['s8_bigcake', 'cake'], 'birthday');
  D('d8_gifts', 'プレゼントの やま', 'プレゼントが ぱかっ。なにが はいってるかな？', ['s8_gifts', 'present'], 'birthday');
  const kusu = (f) => { f.open = W.t + 5000; A.sfx('pop'); A.sfx('cheer'); X.confetti && X.confetti(f.x, 2400); W.bigText('おめでとう！', f.x, f.y - 520, '#ff6f91'); for (let i = 0; i < 4; i++) W.after(600 + i * 400, () => X.firework && X.firework(PT.rand(200, 1400), PT.rand(120, 300), PT.pick(['#ff5d78', '#ffd23f', '#58b9f0', '#7bd36a']))); W.chars().forEach((ch) => { if (W.isFree(ch)) R.claim(ch, 4000).look(f.x).face('laugh', 2000).pose('dance', 1500).say(PT.pick(['おめでとう！', 'やったー！', 'わーい！']), 'heart', 1400, 'yay').pose('cheer', 900); }); };
  T('birthday', 's8_kusudama', 'd8_kusudama', (f) => kusu(f),
    (ch, f) => { R.claim(ch, 5000).go(f.x + 30, f.y + 20, true).look(f.x).say('せーの！', null, 900, 'talk').pose('hold', 700).do(() => { kusu(f); wear(ch, { hat: 'party' }); }).pose('cheer', 1200); });
  const HB = [67, 67, 69, 67, 72, 71, 0, 67, 67, 69, 67, 74, 72];
  const blow = (f, ch) => { f.sing = W.t + 3600; tune(HB, 'triangle', 0.3, 0.1); W.after(3700, () => { f.blow = W.t + 3500; A.sfx('whoosh'); W.after(300, () => { A.sfx('cheer'); X.confetti && X.confetti(f.x, 1600); pop('cake', f.x + 200, f.y + 30); }); if (ch) W.say(ch, 'ふーっ！', null, 1000, 'yay'); }); };
  T('birthday', 's8_bigcake', 'd8_bigcake', (f) => { blow(f); near(f, 3).forEach((ch, i) => R.claim(ch, 5200).wait(i * 150).look(f.x).say('ハッピー バースデー♪', 'note', 2400, 'yay').pose('dance', 1200).wait(800).pose('cheer', 900)); },
    (ch, f) => { R.claim(ch, 7000).go(f.x + 140, f.y + 20, true).look(f.x).do(() => { wear(ch, { hat: 'party' }); blow(f, ch); }).pose('dance', 3400).pose('cheer', 900).say('おめでとう ありがとう！', 'cake', 1500, 'yay'); R.audience(f.x, f.y, [ch], 'cheer', 3, 4200); });
  const gift = (f) => { f.open = W.t + 3000; A.sfx('jingle'); W.after(700, () => { A.sfx('discover'); stars(f.x + 10, f.y - 300, 8); pop(PT.pick(['teddy', 'ball', 'robottoy', 'bunny', 'blocks', 'panda', 'musicbox', 'train']), f.x + PT.rand(-200, 200), f.y + 40); }); };
  T('birthday', 's8_gifts', 'd8_gifts', (f) => { gift(f); lineUp(f, ['なにかな？', 'プレゼント！']); },
    (ch, f) => { A.sfx('jump'); ride(ch, f, 3000, 'cheer', (k) => { ch.x = f.x + 10; ch.y = f.y + 6; ch.z = Math.min(1, k * 3) * 290 * (k > 0.85 ? (1 - k) / 0.15 : 1); }, (c2) => yay(c2, 'プレゼント いっぱい！', 'present'), () => gift(f)); });

  /* ---------- おだい ---------- */
  const O = (stage, text, goals, hint) => ({ id: stage + ':' + text, stage, text, goals, hint });
  PT.ODAI2 = (PT.ODAI2 || []).concat([
    O('newyear', 'おしょうがつを たのしもう', ['d8_mochi', 'd8_kite', 'd8_koma'], ['s8_mochi']),
    O('kodomonohi', 'こどもの ひを おいわいしよう', ['d8_koinobori', 'd8_kabuto', 'd8_shobu'], ['s8_koinobori']),
    O('alienplanet', 'うちゅうじんと なかよく なろう', ['d8_ufo', 'd8_crystal', 'd8_jelly'], ['s8_ufo2']),
    O('futurecity', 'みらいの まちを たんけん', ['d8_tube', 'd8_flycar', 'd8_holo'], ['s8_tube']),
    O('momotaro', 'むかしばなしの せかいへ', ['d8_peach', 'd8_dango', 'd8_bamboo'], ['s8_peach']),
    O('tinyworld', 'こびとに なって あそぼう', ['d8_bigmush', 'd8_acorn', 'd8_leaf'], ['s8_bigmush']),
    O('icecreamland', 'アイスの くにで あまあま', ['d8_softserve', 'd8_creamslide', 'd8_soda'], ['s8_softserve']),
    O('galaxysea', 'ほしの うみを たびしよう', ['d8_moonboat', 'd8_starwhale', 'd8_telescope'], ['s8_moonboat']),
    O('dollhouse', 'ドールハウスで おままごと', ['d8_dhouse', 'd8_teaparty', 'd8_musicbox'], ['s8_dhouse']),
    O('picturebook', 'えほんの なかを ぼうけん', ['d8_bigbook', 'd8_crayon', 'd8_beanstalk'], ['s8_bigbook']),
    O('coaster', 'のりものを ぜんぶ のろう', ['d8_coaster', 'd8_teacup', 'd8_droptower'], ['s8_coaster']),
    O('birthday', 'おたんじょうびを おいわいしよう', ['d8_kusudama', 'd8_bigcake', 'd8_gifts'], ['s8_kusudama']),
  ]);
})();
