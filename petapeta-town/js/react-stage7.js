/* ステージ 73〜84 の あそび（はっけん・リアクション・おだい） */
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
    if (tap) R.add({ id: 's7-' + type + '-tap', on: 'tapfix', pri: 52, stage, test: (c) => tapFix(c, type), run(c, f) { tap(f); W.after(900, () => R.found(disc)); } });
    const p = put === 'tap' ? (ch, f) => tap(f, ch) : put;
    if (p) R.add({ id: 's7-' + type + '-char', pri: 78, stage, test: (c) => (isC(c.e) ? onFix(c, type) : null), run(c, f) { p(c.e, f); W.after(1500, () => R.found(disc)); } });
  };
  const ride = (ch, f, ms, pose, fn, done) => R.claim(ch, ms + 2000).go(f.x, f.y + 6, true).do(() => { ch.stay = true; ch.flip = false; const sx = ch.x, sy = ch.y; R.tween(ch, ms, (k) => { ch.pose = pose; fn(k, sx, sy); ch.scale = W.depthScale(ch.y); }, () => { back(ch, f); done && done(ch); }); });
  const once = (ch, key, k, at, fn) => { if (k > at && !ch[key]) { ch[key] = true; fn(); } };
  const melody = (notes, step = 0.18, o = {}) => notes.forEach((n, i) => n && A.tone(440 * Math.pow(2, (n - 69) / 12), step * 1.3, Object.assign({ type: 'triangle', vol: 0.12, delay: i * step }, o)));
  const go = (ch, f, dx = 120, dy = 20, ms = 4000) => R.claim(ch, ms).go(f.x + dx, f.y + dy, true).look(f.x);
  const leafBurst = (x, y, n = 4) => ['#e2433b', '#f57c2a', '#ffd23f'].forEach((col) => W.burst('leaf', x, y, n, { up: true, sp: 0.3, col, max: 1400, size: 18 }));

  /* ---------- 73 しんかい たんけん ---------- */
  D('d7_sub', 'せんすいかんで しんかいへ', 'せんすいかんの まどから おさかなが みえる。のると しんかいへ しゅっぱつ', ['s7_sub', 'camera'], 'deepsea');
  D('d7_angler', 'ちょうちんあんこう', 'ちょうちんが ぴかーっ。ちいさな おさかなが あつまってくる', ['s7_angler', 'flashlight'], 'deepsea');
  D('d7_octo', 'たこさんの おてだま', 'たこさんが 8ぽんの あしで おてだま。ぎゅーっと ハグも', ['s7_octo', 'shell'], 'deepsea');
  T('deepsea', 's7_sub', 'd7_sub', (f) => { f.peek = W.t + 3500; A.sfx('bubble'); W.after(300, () => A.sfx('bubble')); W.burst('spark', f.x, f.y - 140, 8, { sp: 0.1, max: 900, size: 8, col: '#bfe9ff', g: 0, up: true }); lineUp(f, ['おさかな みえた！', 'まどから のぞいてる！']); },
    (ch, f) => { f.peek = W.t + 4000; f.go = W.t + 4600; f.rider = true; f.rcol = ch.def.skin || ch.def.col || '#ffd8b0'; A.sfx('bubble'); ride(ch, f, 4000, 'sit', (k, sx, sy) => { ch.hidden = true; ch.x = sx; ch.y = sy; if (Math.random() < 0.2) W.burst('spark', f.x - 180, f.y - 140, 1, { sp: 0.05, max: 700, size: 8, col: '#bfe9ff', g: 0 }); }, (c2) => { f.rider = false; W.poof(c2.x, c2.y - 80); R.claim(c2, 2000).say('しんかい たのしかった！', 'star', 1500, 'yay').pose('cheer', 900); }); });
  T('deepsea', 's7_angler', 'd7_angler', (f) => { f.glow = W.t + 3500; A.sfx('sparkle'); spark(f.x + 70, f.y - 240, '#fff3a0'); lineUp(f, ['あかるーい！', 'ちょうちん みたい！']); },
    (ch, f) => { f.glow = W.t + 3500; A.sfx('sparkle'); go(ch, f, 140).face('love', 1200).say('ぴかぴか だね！', 'star', 1400, 'yay').pose('cheer', 900); spark(f.x + 70, f.y - 240, '#fff3a0', 14); });
  T('deepsea', 's7_octo', 'd7_octo', (f) => { f.juggle = W.t + 3000; A.sfx('tickle'); lineUp(f, ['じょうず〜！', 'くるくる まわってる！']); },
    (ch, f) => { f.hug = W.t + 3000; A.sfx('tickle'); go(ch, f, 110).pose('hug', 1500).say('ぎゅーっ！', 'heart', 1400, 'laugh'); hearts(f.x, f.y - 220); });

  /* ---------- 74 なんきょく ---------- */
  D('d7_penslide', 'ペンギンの すべりだい', 'こおりの さかを ペンギンと いっしょに すいーっ', ['s7_iceslope', 'penguin'], 'southpole');
  D('d7_penparade', 'ペンギンの おさんぽ', 'ペンギンたちが よちよち。いっしょに おどろう', ['s7_penguins', 'penguin'], 'southpole');
  D('d7_whale', 'くじらの しおふき', 'くじらが しおを ぷしゅー！ せなかに のると たかーく', ['s7_whale', 'rainbow'], 'southpole');
  T('southpole', 's7_iceslope', 'd7_penslide', (f) => { f.slide = W.t + 2500; A.sfx('slide'); W.after(2100, () => spark(f.x + 200, f.y - 20, '#bfe9ff')); lineUp(f, ['すべった〜！', 'はやーい！']); },
    (ch, f) => { f.slide = W.t + 2900; A.sfx('slide'); const P = PT.FIX.s7_iceslope.path; ride(ch, f, 2400, 'slide', (k, sx, sy) => { const p = P(PT.easeInOut(k)); ch.x = f.x + p.x + 30; ch.y = sy; ch.z = Math.max(0, -p.y - 10); }, (c2) => { spark(c2.x, c2.y - 40, '#bfe9ff'); R.claim(c2, 2000).say('すいーっ！', 'star', 1300, 'yay').pose('cheer', 800); }); });
  T('southpole', 's7_penguins', 'd7_penparade', (f) => { f.waddle = W.t + 3000; A.sfx('quack'); W.after(500, () => A.sfx('quack')); lineUp(f, ['よちよち！', 'かわいい〜！']); },
    (ch, f) => { f.dance = W.t + 3600; A.sfx('jingle'); go(ch, f, 0, 40).pose('dance', 1500).say('ペンギン ダンス！', 'note', 1400, 'yay').pose('jump', 800); });
  T('southpole', 's7_whale', 'd7_whale', (f) => { f.spout = W.t + 2600; A.sfx('splash'); W.burst('drop', f.x + 30, f.y - 300, 12, { up: true, sp: 0.25 }); X.rainbow && X.rainbow(3500); lineUp(f, ['しおふき！', 'にじが でた！']); },
    (ch, f) => { A.sfx('wave'); ride(ch, f, 2800, 'cheer', (k, sx, sy) => { if (k > 0.15 && !f._sp) { f._sp = true; f.spout = W.t + 2400; A.sfx('splash'); } ch.x = f.x - 20; ch.y = sy; ch.z = 70 + Math.max(0, Math.sin(Math.min(1, (k - 0.15) / 0.85) * Math.PI)) * 220; }, (c2) => { f._sp = false; R.claim(c2, 2000).say('たかーい！', 'star', 1300, 'yay'); W.burst('drop', c2.x, c2.y - 120, 8, { up: true, sp: 0.2 }); }); });

  /* ---------- 75 サバンナ ---------- */
  D('d7_kirin', 'キリンの ながい くび', 'キリンが くびを のばして はっぱを もぐもぐ。のると たかーい', ['s7_kirin', 'explorer'], 'savanna');
  D('d7_lion', 'ライオンの おおあくび', 'ライオンが ふわぁ〜。たてがみは ふわふわ', ['s7_lion'], 'savanna');
  D('d7_hippo', 'カバの みずあび', 'みずから カバが ざばーっ。いっしょに みずあそび', ['s7_hippo', 'swimring'], 'savanna');
  T('savanna', 's7_kirin', 'd7_kirin', (f) => { f.neck = W.t + 3000; A.sfx('boing'); W.after(1300, () => A.sfx('munch')); lineUp(f, ['くびが のびた！', 'はっぱ たべてる！']); },
    (ch, f) => { f.neck = W.t + 3400; A.sfx('boing'); const N = PT.FIX.s7_kirin; ride(ch, f, 3200, 'ride', (k, sx, sy) => { const L = N.neckAt(f, W.t); ch.x = f.x + 64 + 0.2 * L; ch.y = sy; ch.z = 170 + 0.98 * L; once(ch, '_s7k', k, 0.45, () => W.say(ch, 'たかーい！', 'star', 1200, 'yay')); }, (c2) => { c2._s7k = false; }); });
  T('savanna', 's7_lion', 'd7_lion', (f) => { f.yawn = W.t + 2200; A.sfx('roar'); lineUp(f, ['おおあくび！', 'ねむいのかな？']); },
    (ch, f) => { f.fluff = W.t + 3000; A.sfx('tickle'); go(ch, f, -40, 30).pose('hug', 1500).say('ふわふわ〜！', 'heart', 1400, 'laugh'); hearts(f.x - 70, f.y - 180); });
  T('savanna', 's7_hippo', 'd7_hippo', (f) => { f.up = W.t + 2400; A.sfx('boing'); W.after(700, () => A.sfx('bubble')); lineUp(f, ['カバさん！', 'おくち おおきい〜！']); },
    (ch, f) => { f.up = W.t + 2600; f.splash = W.t + 2600; A.sfx('splash'); go(ch, f, 200, 30).face('laugh', 1200).say('つめたーい！', 'heart', 1400, 'laugh').pose('jump', 800); W.burst('drop', f.x, f.y - 120, 12, { up: true, sp: 0.25 }); });

  /* ---------- 76 ひみつきち ---------- */
  D('d7_hut', 'きのうえの ひみつきち', 'はしごを のぼって ひみつきちへ。まどから りすさんが こんにちは', ['s7_treehut', 'flashlight'], 'treehouse');
  D('d7_rope', 'ロープのぼり', 'ロープを よいしょ よいしょ。てっぺんで すずが ちりん', ['s7_rope'], 'treehouse');
  D('d7_tire', 'タイヤの ブランコ', 'タイヤの ブランコで びゅーん', ['s7_tire'], 'treehouse');
  T('treehouse', 's7_treehut', 'd7_hut', (f) => { f.lights = W.t + 3500; A.sfx('ding'); lineUp(f, ['りすさんが いた！', 'ひみつきち だ！']); },
    (ch, f) => { f.lights = W.t + 4500; A.sfx('jump'); ride(ch, f, 4200, 'hold', (k, sx, sy) => { ch.x = f.x - 150; ch.y = sy; ch.z = (k < 0.35 ? k / 0.35 : k < 0.7 ? 1 : (1 - k) / 0.3) * 320; if (k > 0.35 && k < 0.7) ch.pose = 'wave'; once(ch, '_s7h', k, 0.4, () => W.say(ch, 'ひみつきち！', 'star', 1300, 'yay')); }, (c2) => { c2._s7h = false; }); });
  const climb = (ch, f) => { f.climb = W.t + 3800; A.sfx('jump'); ride(ch, f, 3600, 'hold', (k, sx, sy) => { ch.x = f.x; ch.y = sy; ch.z = Math.sin(k * Math.PI) * 360; once(ch, '_s7r', k, 0.5, () => { f.bell = W.t + 1400; A.sfx('bell'); W.say(ch, 'てっぺん！', 'star', 1200, 'yay'); spark(f.x + 40, f.y - 520); }); }, (c2) => { c2._s7r = false; }); };
  T('treehouse', 's7_rope', 'd7_rope', (f) => { const ch = near(f, 1)[0]; if (ch) climb(ch, f); else { f.bell = W.t + 1400; A.sfx('bell'); } }, (ch, f) => climb(ch, f));
  T('treehouse', 's7_tire', 'd7_tire', (f) => { f.swing = W.t + 3200; A.sfx('whoosh'); lineUp(f, ['ゆれてる！', 'のりたーい！']); },
    (ch, f) => { f.swing = W.t + 3400; A.sfx('whoosh'); const S = PT.FIX.s7_tire; ride(ch, f, 3200, 'sit', (k, sx, sy) => { const a = S.angAt(f, W.t); ch.x = f.x - Math.sin(a) * 330; ch.y = sy; ch.z = 450 - Math.cos(a) * 330; }, (c2) => R.claim(c2, 1800).say('びゅーん！', 'star', 1300, 'yay')); });

  /* ---------- 77 かざんの しま ---------- */
  D('d7_kazan', 'かざんが どーん！', 'かざんを タップすると どーん！ でてきたのは わたあめみたいな くも', ['s7_kazan', 'cloud'], 'volcano');
  D('d7_onsen', 'しまの おんせん', 'カピバラさんと いっしょに あったか おんせん', ['s7_onsen'], 'volcano');
  D('d7_turtle', 'うみがめの おやこ', 'うみがめが あかちゃんと おさんぽ。せなかに のせて くれるよ', ['s7_turtle', 'shell'], 'volcano');
  T('volcano', 's7_kazan', 'd7_kazan', (f) => { f.boom = W.t + 4200; A.sfx('drum'); W.shake = W.t + 300; W.bigText('どーん！', f.x, f.y - 420, '#ff6f91'); W.after(400, () => { A.sfx('pop'); W.burst('smoke', f.x, f.y - 380, 10, { sp: 0.18, col: '#ffd1e0', g: 0, up: true, size: 26 }); }); W.after(1500, () => pop('cloud', f.x + PT.rand(-260, 260), f.y + 120)); lineUp(f, ['どーん！', 'わたあめ みたい！'], 'jump'); },
    (ch, f) => { f.boom = W.t + 4600; A.sfx('drum'); W.bigText('どーん！', f.x, f.y - 420, '#ff6f91'); ride(ch, f, 4200, 'fly', (k, sx, sy) => { ch.x = f.x + Math.sin(k * PT.TAU) * 160; ch.y = sy; ch.z = 250 * Math.min(1, k * 4) + Math.sin(k * Math.PI) * 100 - (k > 0.8 ? (k - 0.8) / 0.2 * 250 : 0); if (Math.random() < 0.2) W.burst('smoke', ch.x, ch.y - ch.z + 10, 1, { sp: 0.04, col: '#ffffff', g: 0, size: 20, max: 600 }); once(ch, '_s7v', k, 0.4, () => W.say(ch, 'ふわふわ くも！', 'heart', 1300, 'yay')); }, (c2) => { c2._s7v = false; }); });
  T('volcano', 's7_onsen', 'd7_onsen', (f) => { f.steam = W.t + 3000; A.sfx('bubble'); lineUp(f, ['あったかそう〜', 'カピバラさん きもちよさそう']); },
    (ch, f) => { f.steam = W.t + 3600; A.sfx('splash'); ride(ch, f, 3400, 'sit', (k, sx, sy) => { ch.x = f.x - 40; ch.y = sy; ch.z = 0; if (k > 0.2) ch.face = 'love'; once(ch, '_s7o', k, 0.3, () => W.say(ch, 'いい おゆ〜', 'heart', 1400, 'yay')); }, (c2) => { c2._s7o = false; hearts(c2.x, c2.y - 160); }); });
  const tride = (ch, f) => { const fx0 = f.x; f.ride = W.t + 3400; A.sfx('tickle'); ride(ch, f, 3200, 'ride', (k) => { f.x = fx0 + Math.sin(k * Math.PI) * 240; ch.x = f.x; ch.y = f.y + 6; ch.z = 80; }, (c2) => { f.x = fx0; R.claim(c2, 1800).say('のせてくれて ありがとう！', 'heart', 1400, 'yay'); }); };
  T('volcano', 's7_turtle', 'd7_turtle', (f) => { f.walk = W.t + 3200; A.sfx('tickle'); lineUp(f, ['あかちゃん かめ！', 'よちよち〜']); }, (ch, f) => tride(ch, f));

  /* ---------- 78 キラキラ どうくつ ---------- */
  D('d7_gems', 'ひかる ほうせき', 'ほうせきが じゅんばんに ひかって おとが なる', ['s7_gems', 'jewelbox'], 'cave');
  D('d7_cart', 'トロッコ ごー！', 'トロッコに のって どうくつを ガタンゴトン', ['s7_cart', 'helmet'], 'cave');
  D('d7_echo', 'やっほーの こだま', 'あなに むかって さけぶと こえが かえってくる', ['s7_echo'], 'cave');
  T('cave', 's7_gems', 'd7_gems', (f) => { f.glow = W.t + 3500; melody([72, 74, 76, 79, 81, 84, 88], 0.25, { type: 'sine', vol: 0.14 }); lineUp(f, ['キラキラ！', 'ほうせき ひかった！']); },
    (ch, f) => { f.shine = W.t + 3000; A.sfx('sparkle'); go(ch, f, 170).face('love', 1500).say('きれい〜！', 'star', 1400, 'yay').pose('cheer', 900); ['#ff6f91', '#58b9f0', '#ffd23f', '#7bd36a'].forEach((col, i) => W.after(i * 200, () => spark(f.x + PT.rand(-150, 150), f.y - PT.rand(80, 300), col, 6))); W.after(1000, () => pop('jewelbox', f.x + 200, f.y + 60)); });
  T('cave', 's7_cart', 'd7_cart', (f) => { f.roll = W.t + 3000; A.sfx('train'); lineUp(f, ['ガタンゴトン！', 'トロッコ はやい！']); },
    (ch, f) => { f.ride = W.t + 3600; A.sfx('train'); W.after(1600, () => A.sfx('train')); ride(ch, f, 3400, 'sit', (k, sx, sy) => { f.dx = Math.sin(k * PT.TAU) * 170; ch.x = f.x + f.dx; ch.y = sy; ch.z = 70; }, (c2) => { f.dx = 0; R.claim(c2, 1800).say('ガタンゴトン たのしい！', 'star', 1400, 'yay'); }); });
  const echo = (f, word) => { f.word = word; f.echo = W.t + 3200; [0, 0.55, 1.1, 1.65].forEach((d, i) => A.tone(660 - i * 30, 0.25, { type: 'triangle', vol: 0.14 * (1 - i * 0.22), delay: d, slide: 0.8 })); };
  T('cave', 's7_echo', 'd7_echo', (f) => { echo(f, 'やっほー'); const ch = near(f, 1)[0]; if (ch) R.claim(ch, 3500).look(f.x).pose('call', 900).say('やっほー！', null, 1100, 'yay').face('surprise', 900).say('かえってきた！', '!', 1300, 'wow'); },
    (ch, f) => { const w = PT.pick(['やっほー', 'おーい', 'こんにちは']); go(ch, f, -40, 40).pose('call', 900).say(w + '！', null, 1000, 'yay').do(() => echo(f, w)).wait(400).face('laugh', 1200).say('こだま だ！', 'star', 1300, 'laugh'); });

  /* ---------- 79 みずうみの ボート ---------- */
  D('d7_rowboat', 'ボートを こごう', 'オールで ぎっこん。ボートが みずうみを すいすい', ['s7_rowboat', 'boat'], 'lakeboat');
  D('d7_swan', 'スワンボート', 'スワンボートが くるくる。のって みずうみを いっしゅう', ['s7_swan'], 'lakeboat');
  D('d7_ducks', 'かもの おやこ', 'かもの おやこが いっしょに おさんぽ。パンを あげると あつまるよ', ['s7_ducks', 'bread'], 'lakeboat');
  T('lakeboat', 's7_rowboat', 'd7_rowboat', (f) => { f.row = W.t + 4000; A.sfx('wave'); lineUp(f, ['ボート すすむ！', 'ぎっこん ぎっこん']); },
    (ch, f) => { f.ride = W.t + 4400; A.sfx('wave'); ride(ch, f, 4200, 'sit', (k, sx, sy) => { f.dx = Math.sin(k * PT.TAU) * 260; ch.x = f.x + f.dx; ch.y = sy; ch.z = 30; ch.flip = Math.cos(k * PT.TAU) < 0; }, (c2) => { f.dx = 0; R.claim(c2, 1800).say('すいすい〜！', 'star', 1300, 'yay'); }); });
  T('lakeboat', 's7_swan', 'd7_swan', (f) => { f.spin = W.t + 2200; A.sfx('quack'); lineUp(f, ['くるくる〜！', 'スワンさん かわいい']); },
    (ch, f) => { A.sfx('quack'); ride(ch, f, 4200, 'sit', (k, sx, sy) => { f.dx = -Math.sin(k * PT.TAU) * 220; f.dy = -(1 - Math.cos(k * PT.TAU)) * 30; ch.x = f.x + f.dx - 30; ch.y = sy + f.dy; ch.z = 36; ch.flip = Math.cos(k * PT.TAU) > 0; }, (c2) => { f.dx = 0; f.dy = 0; f.spin = W.t + 2200; hearts(f.x, f.y - 200); R.claim(c2, 1800).say('いっしゅう したよ！', 'heart', 1400, 'yay'); }); });
  T('lakeboat', 's7_ducks', 'd7_ducks', (f) => { f.parade = W.t + 4000; A.sfx('quack'); W.after(600, () => A.sfx('quack')); W.after(1200, () => A.sfx('quack')); lineUp(f, ['かもの おやこ！', 'いっしょに おさんぽ']); },
    (ch, f) => { f.feed = W.t + 3600; go(ch, f, -170, 50).hold('bread').say('パン どうぞ！', 'bread', 1300, 'yay').do(() => { A.sfx('quack'); W.after(400, () => A.sfx('quack')); }).wait(1000).unhold().face('laugh', 900); });

  /* ---------- 80 パンダの たけやぶ ---------- */
  D('d7_pandaroll', 'ころころ パンダ', 'パンダが ころころ ころん。めが まわっちゃう', ['s7_pandaroll', 'panda'], 'bamboo');
  D('d7_takenoko', 'たけのこ ぐんぐん', 'たけのこが ぐんぐん のびて たけに なる！', ['s7_takenoko'], 'bamboo');
  D('d7_pandaeat', 'パンダの ごはん', 'パンダの おやこが たけを もぐもぐ。いっしょに たべよう', ['s7_pandaeat', 'onigiri'], 'bamboo');
  T('bamboo', 's7_pandaroll', 'd7_pandaroll', (f) => { f.roll = W.t + 2600; f.dizzy = W.t + 4600; A.sfx('boing'); lineUp(f, ['ころころ〜！', 'パンダさん まわってる']); },
    (ch, f) => { f.roll = W.t + 2900; f.dizzy = W.t + 4900; A.sfx('boing'); ride(ch, f, 2600, 'spin', (k, sx, sy) => { ch.x = sx + Math.sin(k * Math.PI) * 200; ch.y = sy + 20; ch.z = 0; }, (c2) => R.claim(c2, 2000).face('laugh', 1400).say('めが まわる〜', 'star', 1400, 'laugh')); });
  T('bamboo', 's7_takenoko', 'd7_takenoko', (f) => { f.grow = W.t + 4000; A.sfx('magic'); W.after(3400, () => { W.poof(f.x, f.y - 120); A.sfx('pop'); }); lineUp(f, ['ぐんぐん のびた！', 'たけに なった！']); },
    (ch, f) => { f.grow = W.t + 4400; A.sfx('magic'); const TK = PT.FIX.s7_takenoko; ride(ch, f, 4200, 'hold', (k, sx, sy) => { ch.x = f.x + 20; ch.y = sy; ch.z = Math.max(0, TK.hAt(f, W.t) - 90); once(ch, '_s7t', k, 0.4, () => W.say(ch, 'たかーい！', 'star', 1200, 'yay')); }, (c2) => { c2._s7t = false; W.poof(f.x, f.y - 100); }); });
  T('bamboo', 's7_pandaeat', 'd7_pandaeat', (f) => { f.munch = W.t + 3000; A.sfx('munch'); W.after(800, () => A.sfx('munch')); lineUp(f, ['もぐもぐ してる', 'おいしそう〜']); },
    (ch, f) => { f.hug = W.t + 3400; go(ch, f, 0, 40).hold('onigiri').pose('eat', 1400).say('いっしょに たべよう！', 'heart', 1400, 'yay').unhold(); A.sfx('munch'); hearts(f.x, f.y - 200); });

  /* ---------- 81 さくらの おはなみ ---------- */
  D('d7_fubuki', 'さくらふぶき', 'さくらの きを タップすると はなびらが ひらひら', ['s7_sakura', 'petals'], 'hanami');
  D('d7_hanamibento', 'おはなみ べんとう', 'おべんとうを あけて みんなで いただきます', ['s7_picnic', 'bento'], 'hanami');
  D('d7_uguisu', 'うぐいすの うた', 'うぐいすが ホーホケキョ。まねして うたおう', ['s7_uguisu'], 'hanami');
  const fubuki = (f) => { f.fubuki = W.t + 3500; A.sfx('whoosh'); W.after(200, () => A.sfx('sparkle')); W.burst('leaf', f.x, f.y - 360, 14, { sp: 0.3, col: '#ffb7cf', max: 1800, size: 16 }); W.burst('leaf', f.x, f.y - 360, 8, { sp: 0.3, col: '#ffffff', max: 1800, size: 14 }); };
  T('hanami', 's7_sakura', 'd7_fubuki', (f) => { fubuki(f); lineUp(f, ['さくらふぶき！', 'きれい〜！']); },
    (ch, f) => { fubuki(f); go(ch, f, 60, 40).do(() => { ch.wear = Object.assign({}, ch.wear, { hat: 'flowercrown' }); spark(ch.x, ch.y - 180, '#ffb7cf'); }).pose('dance', 1400).say('はなびらの シャワー！', 'heart', 1400, 'yay'); });
  T('hanami', 's7_picnic', 'd7_hanamibento', (f) => { f.open = W.t + 3000; A.sfx('ding'); W.after(600, () => pop(PT.pick(['onigiri', 'strawberry', 'cookie']), f.x + PT.rand(-160, 160), f.y + 60)); lineUp(f, ['おべんとう！', 'いただきまーす！']); },
    (ch, f) => { f.open = W.t + 3600; f.eat = W.t + 3600; go(ch, f, -40, 30).pose('sit', 500).hold('onigiri').pose('eat', 1400).say('おいしい！', 'heart', 1300, 'yay').unhold(); A.sfx('munch'); });
  const hohoke = () => { A.tone(880, 0.6, { type: 'sine', vol: 0.12, slide: 1.3 }); [84, 86, 83].forEach((n, i) => A.tone(440 * Math.pow(2, (n - 69) / 12), 0.18, { type: 'sine', vol: 0.12, delay: 0.75 + i * 0.2 })); };
  T('hanami', 's7_uguisu', 'd7_uguisu', (f) => { f.sing = W.t + 2600; hohoke(); lineUp(f, ['ホーホケキョ！', 'はるだね〜']); },
    (ch, f) => { go(ch, f, 120).pose('call', 900).say('ホーホケキョ♪', 'note', 1300, 'yay').do(() => { f.sing = W.t + 2600; hohoke(); }).wait(800).face('laugh', 1000).say('おへんじ した！', 'heart', 1300, 'laugh'); });

  /* ---------- 82 もみじの やま ---------- */
  D('d7_leafdive', 'おちばに ダイブ', 'おちばの やまに ダイブ！ がさがさ ふわっ', ['s7_leafpile'], 'autumn');
  D('d7_donguri', 'どんぐり ころころ', 'きを ゆらすと りすさんが はしって どんぐりが ぽとぽと', ['s7_donguri', 'acorn'], 'autumn');
  D('d7_kakashi', 'おどる かかし', 'かかしが ゆらゆら おどりだす。いっしょに おどろう', ['s7_kakashi'], 'autumn');
  T('autumn', 's7_leafpile', 'd7_leafdive', (f) => { f.puff = W.t + 2200; A.sfx('whoosh'); leafBurst(f.x, f.y - 60); lineUp(f, ['がさがさ！', 'おちばの シャワー！']); },
    (ch, f) => { R.claim(ch, 4500).go(f.x, f.y + 10, true).jump(120, 600).do(() => { ch.hidden = true; f.puff = W.t + 2200; A.sfx('whoosh'); leafBurst(f.x, f.y - 60, 5); }).wait(1300).do(() => { ch.hidden = false; leafBurst(ch.x, ch.y - 80, 2); }).jump(60, 400).face('laugh', 1200).say('ダイブ！', 'star', 1300, 'laugh'); });
  const shakeOak = (f) => { f.shake = W.t + 2400; A.sfx('tickle'); for (let i = 0; i < 3; i++) W.after(500 + i * 300, () => { pop('acorn', f.x + PT.rand(-160, 160), f.y + PT.rand(20, 80)); A.sfx('pop'); }); };
  T('autumn', 's7_donguri', 'd7_donguri', (f) => { shakeOak(f); lineUp(f, ['どんぐり！', 'りすさん はやーい！']); },
    (ch, f) => { go(ch, f, 70, 30).pose('hug', 900).do(() => shakeOak(f)).say('どんぐり いっぱい！', 'acorn', 1400, 'yay').pose('cheer', 800); });
  T('autumn', 's7_kakashi', 'd7_kakashi', (f) => { f.dance = W.t + 3000; melody([67, 69, 72, 69, 67, 64, 67], 0.2); lineUp(f, ['かかしが おどった！', 'ことりさんも！'], 'dance'); },
    (ch, f) => { f.dance = W.t + 3600; melody([67, 69, 72, 69, 67, 64, 67, 72], 0.2); go(ch, f, 130, 30).pose('dance', 1600).say('いっしょに おどろう！', 'note', 1400, 'yay').pose('spin', 900); });

  /* ---------- 83 ほたるの よる ---------- */
  D('d7_hotaru', 'ほたるの ハート', 'ほたるが あつまって ハートの かたちに', ['s7_hotarubush', 'bugnet'], 'firefly');
  D('d7_frogchorus', 'かえるの がっしょう', 'かえるさんたちが ケロケロ がっしょう', ['s7_frogs'], 'firefly');
  D('d7_hotarujar', 'ほたるの びん', 'ふたを あけると ほたるが ふわーっと とんでいく', ['s7_jar', 'yukata'], 'firefly');
  T('firefly', 's7_hotarubush', 'd7_hotaru', (f) => { f.gather = W.t + 4000; A.sfx('sparkle'); lineUp(f, ['ハートに なった！', 'ほたる きれい〜']); },
    (ch, f) => { f.gather = W.t + 4000; A.sfx('sparkle'); go(ch, f, 0, 50).pose('cheer', 900).face('love', 1500).say('ほたるさん あつまれ〜', 'heart', 1500, 'yay'); });
  const kero = () => [0, 0.3, 0.6, 0.9, 1.2, 1.5].forEach((d, i) => A.tone([196, 247, 220][i % 3], 0.16, { type: 'square', vol: 0.05, delay: d, slide: 1.3 }));
  T('firefly', 's7_frogs', 'd7_frogchorus', (f) => { f.sing = W.t + 3000; kero(); lineUp(f, ['ケロケロ！', 'がっしょう だ！']); },
    (ch, f) => { f.sing = W.t + 3400; kero(); go(ch, f, 170, 30).pose('call', 900).say('ケロケロ♪', 'note', 1300, 'yay').pose('dance', 1000); X.music && X.music(f.x, f.y - 160, 2500); });
  T('firefly', 's7_jar', 'd7_hotarujar', (f) => { f.open = W.t + 4000; f.lit = W.t + 4000; A.sfx('magic'); lineUp(f, ['ほたるが とんだ！', 'ふわふわ〜']); },
    (ch, f) => { f.lit = W.t + 3500; A.sfx('sparkle'); go(ch, f, 110, 20).face('love', 1500).say('ぽかぽか ひかってる', 'star', 1500, 'yay').do(() => { f.open = W.t + 4000; A.sfx('magic'); }).wait(600).pose('wave', 1000).say('またね〜', 'heart', 1200, 'yay'); });

  /* ---------- 84 たなばた ---------- */
  D('d7_tanzaku', 'たんざくに おねがい', 'たんざくに おねがいを かくと ながれぼしが すーっ', ['s7_sasa', 'letter'], 'tanabata');
  D('d7_amanogawa', 'おりひめと ひこぼし', 'あまのがわに とりの はしが かかって ふたりが あえた', ['star', 'moon'], 'tanabata');
  D('d7_telescope', 'ぼうえんきょうで ほしみ', 'ぼうえんきょうを のぞくと せいざが みえる', ['s7_telescope', 'star'], 'tanabata');
  const wish = (f) => { f.wish = W.t + 2800; A.sfx('magic'); W.after(900, () => A.sfx('sparkle')); };
  const WISHES = ['みんな なかよし！', 'おおきく なれますように', 'うちゅうに いけますように', 'ケーキやさんに なりたい', 'ずっと えがおで いられますように'];
  T('tanabata', 's7_sasa', 'd7_tanzaku', (f) => { wish(f); lineUp(f, ['ながれぼし！', 'おねがい かなうかな？']); },
    (ch, f) => { go(ch, f, 140, 20, 5000).hold('letter').say(PT.pick(WISHES), 'star', 1800, 'yay').do(() => { f.n = ((f.n || 0) + 1) % 6; wish(f); spark(f.x, f.y - 300, '#fff6b8'); }).unhold().pose('cheer', 900); });
  T('tanabata', 's7_amanogawa', 'd7_amanogawa', (f) => { f.meet = W.t + 5000; A.sfx('jingle'); W.after(1600, () => A.sfx('sparkle')); W.after(1600, () => spark(f.x + 50, f.y - 230, '#ff8fb1', 14)); lineUp(f, ['おりひめと ひこぼし！', 'あえて よかったね']); }, null);
  const LYRA = [[1050, 110], [1130, 70], [1210, 120], [1290, 80], [1370, 140], [1210, 200]];
  const look = (f) => { f.look = W.t + 3200; A.sfx('ding'); W.after(700, () => { A.sfx('sparkle'); X.constellation && X.constellation(LYRA, 'はくちょうざ'); }); };
  T('tanabata', 's7_telescope', 'd7_telescope', (f) => { look(f); lineUp(f, ['おほしさま みえた！', 'せいざ だ！']); },
    (ch, f) => { go(ch, f, -110, 20).look(f.x + 400).do(() => look(f)).pose('point', 1200).say('ほしが みえた！', 'star', 1400, 'yay'); });

  /* ---------- おだい ---------- */
  const O = (stage, text, goals, hint) => ({ id: stage + ':' + text, stage, text, goals, hint });
  PT.ODAI2 = PT.ODAI2 || [];
  PT.ODAI2.push(
    O('deepsea', 'しんかいを たんけんしよう', ['d7_sub', 'd7_angler', 'd7_octo'], ['s7_sub']),
    O('southpole', 'ペンギンと あそぼう', ['d7_penslide', 'd7_penparade', 'd7_whale'], ['s7_iceslope']),
    O('savanna', 'サバンナの どうぶつに あおう', ['d7_kirin', 'd7_lion', 'd7_hippo'], ['s7_kirin']),
    O('treehouse', 'ひみつきちで あそぼう', ['d7_hut', 'd7_rope', 'd7_tire'], ['s7_treehut']),
    O('volcano', 'かざんの しまを たんけん', ['d7_kazan', 'd7_onsen', 'd7_turtle'], ['s7_kazan']),
    O('cave', 'どうくつの ひみつを みつけよう', ['d7_gems', 'd7_cart', 'd7_echo'], ['s7_gems']),
    O('lakeboat', 'みずうみで ボートあそび', ['d7_rowboat', 'd7_swan', 'd7_ducks'], ['s7_rowboat']),
    O('bamboo', 'パンダさんと なかよく なろう', ['d7_pandaroll', 'd7_takenoko', 'd7_pandaeat'], ['s7_pandaroll']),
    O('hanami', 'おはなみを たのしもう', ['d7_fubuki', 'd7_hanamibento', 'd7_uguisu'], ['s7_sakura']),
    O('autumn', 'あきの やまで あそぼう', ['d7_leafdive', 'd7_donguri', 'd7_kakashi'], ['s7_leafpile']),
    O('firefly', 'ほたるを みに いこう', ['d7_hotaru', 'd7_frogchorus', 'd7_hotarujar'], ['s7_hotarubush']),
    O('tanabata', 'たなばたの おねがいを しよう', ['d7_tanzaku', 'd7_amanogawa', 'd7_telescope'], ['s7_sasa'])
  );
})();
