/* ステージ 49〜60 の あそび（スポーツと おでかけ） */
'use strict';
(() => {
  const W = PT.world, R = PT.R, D = R.D, X = PT.FX, A = PT.audio;
  const { isC } = R.h;
  const on = (f, k) => f[k] && W.t < f[k];
  const onFix = (c, type) => (c.tgt && c.tgt.kind === 'fix' && c.tgt.type === type ? c.tgt : null);
  const tapFix = (c, type) => (c.e.kind === 'fix' && c.e.type === type ? c.e : null);
  const spark = (x, y, col = '#ffd23f', n = 10) => W.burst('spark', x, y, n, { sp: 0.2, max: 800, size: 10, col, g: 0 });
  const hearts = (x, y, n = 5) => W.burst('heart', x, y, n, { up: true, sp: 0.12, max: 900 });
  const drops = (x, y, n = 10) => W.burst('drop', x, y, n, { up: true, sp: 0.3, minSp: 0.12, g: 0.001, max: 900, size: 14 });
  const near = (f, n = 2, r = 1600) => R.free(f.x, f.y, [], r).slice(0, n);
  const pop = (id, x, y) => { if (!PT.ITEMS[id]) return null; const p = W.addProp(id, x, y); p.pop = W.t; return p; };
  const back = (ch, f, dx = 160) => { ch.stay = false; ch.z = 0; ch.baseZ = 0; ch.rest = 'idle'; ch.hidden = false; ch.holdType = null; const p = W.clampFloor(f.x + dx, f.y + 40); ch.x = p.x; ch.y = p.y; ch.scale = W.depthScale(ch.y); };
  const lineUp = (f, lines, pose = 'cheer') => near(f, 2, 1500).forEach((ch, i) => R.claim(ch, 3000).wait(300 + i * 300).look(f.x).face('surprise', 800).say(lines[i % lines.length], null, 1400, 'wow').pose(pose, 900));
  const firstFix = (type) => W.fixes().find((x) => x.type === type);
  const tone = (n, d, o) => A.tone(440 * Math.pow(2, (n - 69) / 12), d, o);
  const echo = (txt, x, y, size, col) => W.fx.push({ type: 'text', txt, x, y, life: 0, max: 1600, col, vy: -0.02, vx: 0, size, g: 0 });
  /* T: タップ と キャラおき の はんのう（id は s5- で はじまる） */
  const T = (stage, type, disc, tap, put) => {
    const nm = 's5-' + type.replace(/^s5_/, '');
    if (tap) R.add({ id: nm + '-tap', on: 'tapfix', pri: 52, stage, test: (c) => tapFix(c, type), run(c, f) { tap(f); W.after(900, () => R.found(disc)); } });
    const p = put === 'tap' ? (ch, f) => tap(f, ch) : put;
    if (p) R.add({ id: nm + '-char', pri: 78, stage, test: (c) => (isC(c.e) ? onFix(c, type) : null), run(c, f) { p(c.e, f); W.after(1500, () => R.found(disc)); } });
  };
  /* run2: そこまで いって から うごきを する */
  const run2 = (ch, x, y, ms, fn, done) => R.claim(ch, ms + 3000).go(x, y, true).do(() => { ch.stay = true; ch.flip = false; R.tween(ch, ms, (k) => { fn(k); ch.scale = W.depthScale(ch.y); }, () => { done && done(ch); }); });
  const solo = (who, f) => who || near(f, 1)[0];

  /* ===== 49 うんどうかい ===== */
  D('d5_kusudama', 'くすだま パカッ', 'ひもを ひくと くすだまが われて「おめでとう」', ['s5_kusudama', 'confetti'], 'sportsday');
  D('d5_tamaire', 'たまいれ', 'みんなで たまを なげて かごに いれよう', ['s5_tamaire', 'ball'], 'sportsday');
  D('d5_kakekko', 'かけっこ 1ばん', 'よーい どん！ ゴールテープを きって 1ばん', ['s5_goaltape', 'yuto'], 'sportsday');
  const kusu = (f, who) => {
    const ch = solo(who, f);
    const open = () => { if (on(f, 'open')) return; f.open = W.t + 5000; A.sfx('pop'); A.sfx('cheer'); X.confetti && X.confetti(f.x, 2000); W.bigText('おめでとう！', f.x, f.y - 480, '#ff6f61'); W.chars().forEach((c2) => { if (c2 !== ch && W.isFree(c2)) R.claim(c2, 2600).wait(300).look(f.x).pose('cheer', 1400).say('わーい！', 'star', 1200, 'yay'); }); };
    if (!ch) return open();
    R.claim(ch, 5000).go(f.x + 30, f.y + 20, true).look(f.x).pose('hold', 400).do(() => { f.pull = W.t + 500; A.sfx('tap'); }).wait(400).do(open).pose('cheer', 1200).say('やったー！', 'confetti', 1400, 'yay');
  };
  T('sportsday', 's5_kusudama', 'd5_kusudama', kusu, 'tap');
  const toss = (f) => { f.toss = W.t + 1400; A.sfx('whoosh'); W.after(1000, () => { A.sfx('pop'); f.n = (f.n == null ? 3 : f.n) + 2; if (f.n >= 9) { A.sfx('cheer'); W.bigText('いっぱい！', f.x, f.y - 500, '#ff6f61'); X.confetti && X.confetti(f.x, 1200); W.after(2200, () => { f.n = 0; }); } }); };
  T('sportsday', 's5_tamaire', 'd5_tamaire', (f, who) => {
    const cs = who ? [who] : near(f, 2); if (!cs.length) return toss(f);
    cs.forEach((ch, i) => R.claim(ch, 5000).go(f.x + (i ? 1 : -1) * 150, f.y + 30, true).look(f.x).pose('point', 300).do(() => { if (i === 0) toss(f); }).pose('cheer', 500).pose('point', 300).say(i ? 'えいっ！' : 'はいった！', 'ball', 1200, 'yay'));
  }, 'tap');
  const race = (f, who) => {
    const cs = (who ? [who] : []).concat(near(f, who ? 1 : 2).filter((x) => x !== who)).slice(0, 2);
    A.sfx('drum');
    cs.forEach((ch, i) => R.claim(ch, 7000).do(() => { W.poof(ch.x, ch.y - 60); const p = W.clampFloor(f.x - 560, f.y + 10 + i * 50); ch.x = p.x; ch.y = p.y; ch.scale = W.depthScale(ch.y); ch.flip = false; }).say(i ? 'まけないぞ！' : 'よーい どん！', null, 800, 'talk').wait(200 + i * 250).go(f.x + 70 + i * 60, f.y + 10 + i * 50, true).do(() => {
      if (!on(f, 'break')) { f.break = W.t + 3000; A.sfx('cheer'); W.bigText('1ばん！', f.x, f.y - 300, '#ffd23f'); X.confetti && X.confetti(f.x, 1400); W.say(ch, '1ばん！', 'star', 1400, 'yay'); }
      else W.say(ch, 'ゴール！', 'heart', 1200, 'yay');
    }).pose('cheer', 1200));
    if (!cs.length) { f.break = W.t + 3000; A.sfx('cheer'); }
  };
  T('sportsday', 's5_goaltape', 'd5_kakekko', race, 'tap');

  /* ===== 50 サッカー ===== */
  D('d5_goal', 'シュート！ ゴール！', 'ボールを けると ネットが ゆれて ゴール！', ['s5_soccergoal', 'ball'], 'soccer');
  D('d5_score', 'とくてんばん', 'とくてんばんを タップすると てんすうが ふえる', ['s5_scoreboard'], 'soccer');
  D('d5_heading', 'ヘディング', 'ボールかごの まえで ぽんぽん ヘディング', ['s5_ballcart', 'ball'], 'soccer');
  const goal = (f) => {
    f.goal = W.t + 2200; A.sfx('boing');
    W.after(660, () => { A.sfx('cheer'); W.bigText('ゴール！', f.x, f.y - 330, '#ffd23f'); X.confetti && X.confetti(f.x, 1400); const sb = firstFix('s5_scoreboard'); if (sb) { sb.a = (sb.a || 0) + 1; sb.flash = W.t + 2200; } });
    lineUp(f, ['ゴール！', 'ナイス シュート！']);
  };
  T('soccer', 's5_soccergoal', 'd5_goal', (f, who) => { const ch = solo(who, f); if (!ch) return goal(f); R.claim(ch, 5000).go(f.x - 430, f.y + 20, true).look(f.x).pose('kick', 500).do(() => goal(f)).wait(700).pose('cheer', 1200).say('ゴール！', 'ball', 1400, 'yay'); }, 'tap');
  const score = (f) => { f.flash = W.t + 2500; if (Math.random() < 0.5) f.a = (f.a || 0) + 1; else f.b = (f.b || 0) + 1; A.sfx('ding'); [76, 79, 84].forEach((n, i) => tone(n, 0.2, { type: 'square', vol: 0.05, delay: i * 0.15 })); };
  T('soccer', 's5_scoreboard', 'd5_score', (f) => { score(f); lineUp(f, ['1てん はいった！', 'がんばれー！']); }, (ch, f) => { R.claim(ch, 4000).go(f.x + 160, f.y + 20, true).look(f.x).pose('point', 600).do(() => score(f)).pose('cheer', 1200).say('いっ てーん！', 'star', 1300, 'yay'); });
  T('soccer', 's5_ballcart', 'd5_heading', (f) => { f.out = W.t + 1200; A.sfx('boing'); W.after(700, () => { pop('ball', f.x - 160, f.y + 50); pop('ball', f.x + 160, f.y + 60); }); lineUp(f, ['ボールが いっぱい！', 'サッカー しよう！']); }, (ch, f) => {
    R.claim(ch, 6000).go(f.x + 150, f.y + 10, true).do(() => { ch.flip = false; f.hx = 150; f.head = W.t + 3000; for (let i = 0; i < 5; i++) W.after(i * 600 + 300, () => A.sfx('pop')); }).jump(20, 600).jump(20, 600).jump(20, 600).jump(20, 600).jump(20, 600).say('ヘディング！', 'ball', 1400, 'yay').pose('cheer', 800);
  });

  /* ===== 51 やきゅう ===== */
  D('d5_homerun', 'ホームラン！', 'バットを ふると ボールが そらの かなたへ', ['s5_batbox', 'ball'], 'baseball');
  D('d5_pitch', 'ピッチャー なげました', 'マウンドから なげると バッターが カキーン！', ['s5_mound', 'ball'], 'baseball');
  D('d5_wave', 'おうえんの ウェーブ', 'おうえんせきで みんなが ウェーブ', ['s5_cheerstand', 'trumpet'], 'baseball');
  const hit = (f) => {
    if (!f || on(f, 'hit')) return; f.hit = W.t + 3000; tone(100, 0.25, { type: 'square', vol: 0.08 }); A.sfx('cheer');
    W.bigText('ホームラン！', f.x + 200, f.y - 400, '#ffd23f');
    for (let i = 0; i < 3; i++) W.after(1200 + i * 350, () => X.firework && X.firework(PT.rand(600, 1400), PT.rand(120, 300), PT.pick(['#ff5d78', '#ffd23f', '#58b9f0'])));
    const cs = firstFix('s5_cheerstand'); if (cs) cs.wave = W.t + 3000;
    lineUp(f, ['とんだー！', 'すごーい！']);
  };
  const bat = (f, who) => { const ch = solo(who, f); if (!ch) return hit(f); R.claim(ch, 5000).go(f.x - 40, f.y + 14, true).do(() => { ch.flip = false; }).pose('hold', 600).pose('spin', 400).do(() => hit(f)).pose('cheer', 1500).say('ホームラン！', 'ball', 1500, 'yay'); };
  T('baseball', 's5_batbox', 'd5_homerun', bat, 'tap');
  T('baseball', 's5_mound', 'd5_pitch', (f, who) => {
    const ch = solo(who, f), bb = firstFix('s5_batbox');
    const throwIt = () => { f.pitch = W.t + 800; A.sfx('whoosh'); if (bb) W.after(800, () => { const b = near(bb, 1, 500)[0]; if (b) R.claim(b, 2000).look(f.x).pose('spin', 400).pose('cheer', 1200).say('カキーン！', 'ball', 1200, 'yay'); hit(bb); }); };
    if (!ch) return throwIt();
    R.claim(ch, 4000).go(f.x + 40, f.y + 10, true).look(f.x - 600).pose('hold', 500).pose('point', 400).do(throwIt).say('えいっ！', 'ball', 1200, 'yay');
  }, 'tap');
  const wave = (f) => { f.wave = W.t + 3000; A.sfx('cheer'); for (let i = 0; i < 4; i++) W.after(i * 300, () => A.sfx('drum')); W.chars().forEach((ch, i) => { if (W.isFree(ch)) R.claim(ch, 2500).wait(i * 200).pose('cheer', 1200).say('ウェーブ！', 'star', 1000, 'yay'); }); };
  T('baseball', 's5_cheerstand', 'd5_wave', wave, (ch, f) => { R.claim(ch, 5000).go(f.x + 60, f.y + 30, true).look(f.x).hold('trumpet').do(() => { [67, 67, 72, 72, 76, 79].forEach((n, i) => tone(n, 0.18, { type: 'square', vol: 0.06, delay: i * 0.18 })); }).pose('hold', 1200).unhold().do(() => wave(f)).say('かっとばせー！', 'trumpet', 1400, 'yay'); });

  /* ===== 52 ボウリング ===== */
  D('d5_strike', 'ストライク！', 'ボールを ころがすと ピンが ぜんぶ たおれる', ['s5_lane', 'ball'], 'bowling');
  D('d5_ballreturn', 'ボールが もどってくる', 'マシンから ボールが ころん。もって なげよう', ['s5_ballreturn', 'ball'], 'bowling');
  D('d5_pinkun', 'ピンくんの ダンス', 'おおきな ピンくんが くねくね おどる', ['s5_pinmascot'], 'bowling');
  const roll = (f) => { if (!f) return; f.roll = W.t + 2600; f.col = PT.pick(['#9b6fd6', '#e2433b', '#58b9f0', '#7bd36a']); A.sfx('drumroll'); W.after(1300, () => { A.sfx('drum'); A.sfx('cheer'); W.bigText('ストライク！', f.x + 260, f.y - 260, '#ff6f61'); spark(f.x + 290, f.y - 60, '#ffd23f', 14); const pm = firstFix('s5_pinmascot'); if (pm) pm.dance = W.t + 3000; }); };
  const bowl = (ch, f) => R.claim(ch, 6000).go(f.x - 420, f.y + 10, true).look(f.x).hold('ball').pose('carry', 600).unhold().pose('point', 300).do(() => roll(f)).wait(1300).say('ストライク！', 'star', 1400, 'yay').pose('cheer', 1000);
  T('bowling', 's5_lane', 'd5_strike', (f, who) => { const ch = solo(who, f); if (ch) bowl(ch, f); else roll(f); }, 'tap');
  T('bowling', 's5_ballreturn', 'd5_ballreturn', (f) => { f.out = W.t + 1600; A.sfx('whoosh'); W.after(800, () => A.sfx('pop')); lineUp(f, ['ボールが でてきた！', 'どれに しよう？']); }, (ch, f) => {
    f.out = W.t + 1600; A.sfx('whoosh');
    const a = R.claim(ch, 9000).go(f.x + 130, f.y + 20, true).look(f.x).hold('ball').pose('carry', 1000).say('おもたーい！', 'ball', 1200, 'laugh');
    const ln = firstFix('s5_lane'); if (ln) a.go(ln.x - 420, ln.y + 10, true).look(ln.x).unhold().pose('point', 300).do(() => roll(ln)).wait(1200).pose('cheer', 900); else a.unhold();
  });
  const pinDance = (f) => { f.dance = W.t + 3000; A.sfx('boing'); [72, 76, 79, 76, 72].forEach((n, i) => tone(n, 0.2, { type: 'triangle', vol: 0.1, delay: i * 0.2 })); W.burst('note', f.x, f.y - 300, 5, { up: true, sp: 0.12 }); };
  T('bowling', 's5_pinmascot', 'd5_pinkun', (f) => { pinDance(f); near(f, 2).forEach((ch) => R.claim(ch, 3000).look(f.x).pose('dance', 2200).say('くねくね〜', 'note', 1200, 'laugh')); }, (ch, f) => { pinDance(f); hearts(f.x, f.y - 280); R.claim(ch, 4000).go(f.x + 110, f.y + 20, true).look(f.x).pose('hug', 1000).pose('dance', 1600).say('ピンくん なかよし！', 'heart', 1400, 'yay'); });

  /* ===== 53 ミニゴルフ ===== */
  D('d5_windmill', 'かざぐるまの トンネル', 'くるくる まわる かざぐるまの したを ボールが くぐる', ['s5_windmillhole'], 'minigolf');
  D('d5_cupin', 'カップイン！', 'ころころ… ぽとん！ はたが ぴょこっ', ['s5_golfcup', 'ball'], 'minigolf');
  D('d5_loop', 'くるりん ループ', 'ボールが ループを ぐるっと 1しゅう', ['s5_loop'], 'minigolf');
  const putt = (f, who, dx, fn, line) => { const ch = solo(who, f); if (!ch) return fn(f); R.claim(ch, 5000).go(f.x + dx, f.y + 14, true).look(f.x).pose('hold', 600).pose('point', 300).do(() => fn(f)).wait(1500).say(line, 'star', 1300, 'yay').pose('cheer', 900); };
  const wm = (f) => { f.shot = W.t + 2600; A.sfx('slide'); W.after(1100, () => A.sfx('whoosh')); W.after(1700, () => { A.sfx('ding'); spark(f.x + 100, f.y - 50, '#ffffff'); }); };
  T('minigolf', 's5_windmillhole', 'd5_windmill', (f, who) => putt(f, who, -210, wm, 'くぐった！'), 'tap');
  const cup = (f) => { f.putt = W.t + 2400; A.sfx('slide'); W.after(1450, () => { A.sfx('ding'); A.sfx('cheer'); W.bigText('カップイン！', f.x + 90, f.y - 320, '#ffd23f'); spark(f.x + 90, f.y - 60, '#ffd23f', 14); }); };
  T('minigolf', 's5_golfcup', 'd5_cupin', (f, who) => putt(f, who, -210, cup, 'はいった！'), 'tap');
  const lp = (f) => { f.go = W.t + 2600; A.sfx('whoosh'); W.after(800, () => A.sfx('sparkle')); W.after(2000, () => { A.sfx('ding'); W.bigText('くるりん！', f.x + 40, f.y - 300, '#58b9f0'); }); };
  T('minigolf', 's5_loop', 'd5_loop', (f, who) => putt(f, who, -250, lp, 'くるっと まわった！'), 'tap');

  /* ===== 54 たいいくかん ===== */
  D('d5_vault', 'とびばこ ジャンプ', 'はしって ふみきって とびばこを ぴょーん', ['s5_vaultbox', 'pyoko'], 'gym');
  D('d5_mat', 'マットで ころころ', 'マットの うえで ころころ くるりん', ['s5_mat'], 'gym');
  D('d5_bigball', 'おおだま ころがし', 'おおきな たまを よいしょ よいしょ', ['s5_bigball'], 'gym');
  const vault = (ch, f) => { let boing = false; run2(ch, f.x - 340, f.y + 10, 2400, (k) => {
    if (k < 0.4) { ch.x = f.x - 340 + (k / 0.4) * 230; ch.z = 0; ch.pose = 'run'; }
    else if (k < 0.8) { if (!boing) { boing = true; f.boing = W.t + 300; A.sfx('boing'); } const u = (k - 0.4) / 0.4; ch.x = f.x - 110 + u * 280; ch.z = Math.sin(u * Math.PI) * 230; ch.pose = 'jump'; }
    else { ch.x = f.x + 170 + ((k - 0.8) / 0.2) * 30; ch.z = 0; ch.pose = 'cheer'; }
  }, (c2) => { back(c2, f, 220); A.sfx('cheer'); spark(c2.x, c2.y - 140, '#ffd23f'); R.claim(c2, 2000).say('とべた！ 10てん！', 'star', 1400, 'yay').pose('cheer', 800); }); };
  T('gym', 's5_vaultbox', 'd5_vault', (f) => { const ch = near(f, 1)[0]; if (ch) vault(ch, f); else { f.boing = W.t + 300; A.sfx('boing'); } }, (ch, f) => vault(ch, f));
  const mat = (ch, f) => run2(ch, f.x - 180, f.y + 10, 2400, (k) => { if (!on(f, 'roll')) { f.roll = W.t + 2600; A.sfx('whoosh'); } ch.x = f.x - 180 + k * 360; ch.z = Math.abs(Math.sin(k * Math.PI * 3)) * 40; ch.pose = 'spin'; }, (c2) => { back(c2, f, 230); R.claim(c2, 2000).say('ころころ〜！', 'star', 1300, 'yay').pose('cheer', 800); });
  T('gym', 's5_mat', 'd5_mat', (f) => { const ch = near(f, 1)[0]; if (ch) mat(ch, f); else { f.roll = W.t + 2600; A.sfx('whoosh'); } }, (ch, f) => mat(ch, f));
  T('gym', 's5_bigball', 'd5_bigball', (f) => { f.roll = W.t + 3600; A.sfx('drumroll'); lineUp(f, ['おおきい たま！', 'ころがれ〜！']); }, (ch, f) => {
    run2(ch, f.x - 160, f.y + 10, 1800, (k) => { if (!on(f, 'roll')) { f.roll = W.t + 3600; A.sfx('drumroll'); } ch.x = f.x - 160 + Math.sin(k * Math.PI / 2) * 280; ch.pose = 'carry'; }, (c2) => { c2.stay = false; R.claim(c2, 2000).say('よいしょー！', 'star', 1300, 'yay').pose('cheer', 900); });
  });

  /* ===== 55 サーフィン ===== */
  D('d5_surf', 'なみのり', 'おおきな なみに のって サーフィン！', ['s5_surfwave', 'sakura'], 'surf');
  D('d5_lifeguard', 'ライフガード', 'たかい いすから「うみは たのしいね！」', ['s5_lifeguard'], 'surf');
  D('d5_kakigori', 'かきごおり キーン', 'かきごおりを たべると あたまが キーン！', ['s5_shaveice', 'icecream'], 'surf');
  const bigWave = (f) => { f.wave = W.t + 3400; A.sfx('wave'); W.after(1600, () => A.sfx('splash')); };
  const surf = (ch, f) => { bigWave(f); f.surf = W.t + 3400; W.poof(ch.x, ch.y - 60); R.claim(ch, 6000).do(() => { ch.stay = true; ch.flip = false; const y0 = f.y - 70; R.tween(ch, 3300, (k) => { const hh = 110 * Math.sin(Math.min(1, k * 4) * Math.PI / 2) * (k > 0.85 ? (1 - k) / 0.15 : 1); f.bx = -730 + k * 1400; ch.x = f.x + f.bx; ch.y = y0; ch.z = 24 + hh + Math.sin(k * 20) * 6; f.by = -70 - ch.z + 4; ch.pose = 'jump'; ch.scale = W.depthScale(ch.y); if (Math.random() < 0.15) drops(ch.x - 40, ch.y - ch.z, 2); }, () => { f.surf = 0; back(ch, f, 0); R.claim(ch, 2000).say('なみのり さいこう！', 'swimring', 1400, 'yay').pose('cheer', 900); }); }); };
  T('surf', 's5_surfwave', 'd5_surf', (f) => { bigWave(f); W.chars().forEach((ch) => { if (W.isFree(ch) && Math.abs(ch.x - f.x) < 900) R.claim(ch, 2400).wait(1200).jump(60, 450).face('surprise', 900).say('ざぶーん！', '!', 1100, 'wow'); }); }, (ch, f) => surf(ch, f));
  const whistle = () => { tone(96, 0.18, { type: 'sine', vol: 0.08 }); tone(96, 0.35, { type: 'sine', vol: 0.08, delay: 0.25 }); };
  T('surf', 's5_lifeguard', 'd5_lifeguard', (f) => { f.flag = W.t + 2500; whistle(); W.chars().forEach((ch) => { if (W.isFree(ch)) R.claim(ch, 2400).look(f.x).pose('wave', 1400).say('はーい！', null, 1100, 'yay'); }); }, (ch, f) => {
    f.flag = W.t + 3500; whistle();
    run2(ch, f.x, f.y + 8, 3200, (k) => { ch.x = f.x; ch.y = f.y + 8; ch.z = Math.min(1, k * 3) * 230 * (k > 0.85 ? (1 - k) / 0.15 : 1); ch.pose = k < 0.33 ? 'carry' : 'wave'; if (k > 0.45 && k < 0.5 && !ch._s5) { ch._s5 = true; W.say(ch, 'うみは たのしいね！', 'star', 1300, 'yay'); } }, (c2) => { c2._s5 = false; back(c2, f, 150); });
  });
  T('surf', 's5_shaveice', 'd5_kakigori', (f, who) => { f.shave = W.t + 2000; A.sfx('tickle'); const ch = solo(who, f); if (!ch) { W.after(1800, () => pop('icecream', f.x + 160, f.y + 30)); return; } R.claim(ch, 6000).go(f.x + 160, f.y + 20, true).look(f.x).wait(800).hold('icecream').pose('eat', 1200).face('surprise', 700).say('キーン！', '!', 1000, 'wow').face('laugh', 800).say('つめたくて おいしい！', 'icecream', 1300, 'yay').unhold(); }, 'tap');

  /* ===== 56 スキー ===== */
  D('d5_ski', 'スキーで シュー', 'さかの うえから ジグザグ すべりおりる', ['s5_slope', 'penta'], 'ski');
  D('d5_lift', 'リフトで ゆらゆら', 'リフトに のって たかい ところまで', ['s5_skilift'], 'ski');
  D('d5_kamakura', 'かまくらの なか', 'かまくらに はいると ぽかぽか あったか', ['s5_kamakura', 'marshmallow'], 'ski');
  const slopeZ = (x) => 330 * Math.pow(Math.max(0, (360 - x) / 720), 1.1);
  const ski = (ch, f) => { f.ski = W.t + 3800; run2(ch, f.x - 300, f.y + 10, 3200, (k) => {
    if (k === 0 || !ch._s5) { ch._s5 = true; W.poof(ch.x, ch.y - slopeZ(-300) - 60); A.sfx('slide'); }
    const x = -300 + k * 640, z = slopeZ(x); ch.x = f.x + x + Math.sin(k * PT.TAU * 2) * 30; ch.z = z; f.skx = ch.x - f.x; f.skz = z; f.ska = 0.35 * (1 - k); ch.pose = k > 0.92 ? 'cheer' : 'hold'; ch.flip = false;
    if (Math.random() < 0.25) W.burst('smoke', ch.x - 30, ch.y - z, 1, { sp: 0.08, col: '#ffffff', g: 0, max: 500, size: 14 });
  }, (c2) => { c2._s5 = false; f.ski = 0; back(c2, f, 360); R.claim(c2, 2000).say('シュー！ すべれた！', 'snow', 1400, 'yay').pose('cheer', 900); }); };
  T('ski', 's5_slope', 'd5_ski', (f) => { const ch = near(f, 1)[0]; if (ch) ski(ch, f); }, (ch, f) => ski(ch, f));
  const lift = (ch, f) => { f.run = W.t + 4200; f.ride = W.t + 4000; run2(ch, f.x - 140, f.y + 10, 3600, (k) => {
    f.lx = -140 + k * 280; f.lz = 60 + k * 340; ch.x = f.x + f.lx; ch.z = f.lz + 12; ch.pose = 'sit'; ch.flip = false;
  }, (c2) => { f.ride = 0; W.poof(c2.x, c2.y - c2.z - 60); back(c2, f, 220); R.claim(c2, 2200).say('たかかった〜！ やっほー！', 'star', 1500, 'yay').pose('cheer', 900); }); };
  T('ski', 's5_skilift', 'd5_lift', (f) => { const ch = near(f, 1)[0]; if (ch) lift(ch, f); else { f.run = W.t + 3000; } A.sfx('bell'); }, (ch, f) => { A.sfx('bell'); lift(ch, f); });
  T('ski', 's5_kamakura', 'd5_kamakura', (f) => { f.lit = W.t + 4000; A.sfx('bell'); W.after(700, () => pop('marshmallow', f.x + PT.rand(-120, 120), f.y + 50)); lineUp(f, ['あったかそう！', 'かまくらだ！']); }, (ch, f) => {
    R.claim(ch, 5000).go(f.x, f.y + 6, true).do(() => { ch.hidden = true; f.lit = W.t + 4000; W.poof(f.x, f.y - 60); A.sfx('pop'); }).wait(1500).do(() => { back(ch, f, 0); W.poof(ch.x, ch.y - 80); spark(ch.x, ch.y - 140, '#ffcf70'); }).face('love', 1400).say('あったか〜い！', 'heart', 1400, 'yay');
  });

  /* ===== 57 おんせん ===== */
  D('d5_onsen', 'おんせんで ほかほか', 'おゆに つかると ほかほか。おさるさんも いっしょ', ['s5_onsen', 'baba'], 'onsen');
  D('d5_milk', 'おふろあがりの ぎゅうにゅう', 'こしに てを あてて ごくごく ぷはー！', ['s5_milkcooler', 'juice'], 'onsen');
  D('d5_pingpong', 'おんせん たっきゅう', 'ピンポン ピンポン ラリーが つづく', ['s5_pingpong'], 'onsen');
  const monkeyIn = (f) => { f.monkey = W.t + 6000; f.hoka = W.t + 3000; A.sfx('splash'); W.after(400, () => { tone(84, 0.08, { type: 'square', vol: 0.06 }); tone(88, 0.1, { type: 'square', vol: 0.06, delay: 0.1 }); }); };
  T('onsen', 's5_onsen', 'd5_onsen', (f) => { monkeyIn(f); lineUp(f, ['おさるさん！', 'ほかほか〜']); }, (ch, f) => {
    R.claim(ch, 7000).go(f.x + PT.rand(-180, 60), f.y - 90, true).do(() => { ch.stay = true; ch.rest = 'swim'; A.sfx('splash'); drops(ch.x, ch.y - 30, 6); }).pose('swim', 1200).do(() => monkeyIn(f)).face('love', 1600).say('ほかほか〜', 'heart', 1500, 'yay').pose('swim', 1500).do(() => { ch.rest = 'idle'; ch.stay = false; });
  });
  T('onsen', 's5_milkcooler', 'd5_milk', (f, who) => { f.pop = W.t + 1200; A.sfx('ding'); const ch = solo(who, f); if (!ch) { pop('juice', f.x + 130, f.y + 30); return; } R.claim(ch, 5000).go(f.x + 130, f.y + 20, true).look(f.x).wait(700).hold('juice').pose('eat', 1400).say('ごくごく… ぷはー！', 'juice', 1400, 'yay').unhold().pose('cheer', 700); }, 'tap');
  T('onsen', 's5_pingpong', 'd5_pingpong', (f, who) => {
    const cs = (who ? [who] : []).concat(near(f, 2).filter((x) => x !== who)).slice(0, 2);
    const rally = () => { f.rally = W.t + 3600; for (let i = 0; i < 6; i++) W.after(i * 600, () => A.sfx('tap')); };
    if (!cs.length) return rally();
    cs.forEach((ch, i) => R.claim(ch, 7000).go(f.x + (i ? 250 : -250), f.y + 10, true).look(f.x).do(() => { if (i === 0) rally(); }).pose('point', 600).pose('hold', 600).pose('point', 600).pose('hold', 600).say(i ? 'ピンポン！' : 'それっ！', 'star', 1100, 'yay').pose('cheer', 700));
  }, 'tap');

  /* ===== 58 やまのぼり ===== */
  D('d5_yahho', 'ちょうじょうで やっほー', 'やまの てっぺんで やっほー！ こだまが かえってくる', ['s5_summit', 'explorer'], 'mountain');
  D('d5_bridge', 'つりばし ゆらゆら', 'ゆれる つりばしを そーっと わたる', ['s5_ropebridge'], 'mountain');
  D('d5_squirrel', 'リスと どんぐり', 'きを ゆらすと リスが かおを だして どんぐりが ころん', ['s5_squirreltree', 'acorn'], 'mountain');
  const yaho = (f, ch) => {
    f.yaho = W.t + 3500; W.say(ch, 'やっほー！', 'star', 1500, 'yay'); A.sfx('cheer');
    W.after(900, () => { echo('やっほー…', 260, 260, 34, 'rgba(90,130,200,.9)'); tone(76, 0.3, { type: 'sine', vol: 0.06 }); });
    W.after(1800, () => { echo('やっほー…', 1380, 230, 26, 'rgba(90,130,200,.7)'); tone(76, 0.3, { type: 'sine', vol: 0.035 }); });
    X.critter && X.critter('bird', [[f.x - 80, f.y - 440, 1], [f.x + 500, f.y - 620, 2200]]);
  };
  const climb = (ch, f) => { let said = false; run2(ch, f.x - 200, f.y + 6, 3800, (k) => { const u = Math.min(1, k / 0.7); ch.x = f.x - 200 + u * 200 + Math.sin(u * Math.PI * 3) * 40 * (1 - u); ch.z = u * 395; ch.pose = u < 1 ? 'walk' : 'cheer'; if (u >= 1 && !said) { said = true; yaho(f, ch); } }, (c2) => { back(c2, f, 300); R.claim(c2, 1800).say('のぼれた！', 'explorer', 1300, 'yay'); }); };
  T('mountain', 's5_summit', 'd5_yahho', (f) => { const ch = near(f, 1)[0]; if (ch) climb(ch, f); else { f.yaho = W.t + 3000; echo('やっほー…', 260, 260, 34, 'rgba(90,130,200,.9)'); } }, (ch, f) => climb(ch, f));
  const cross = (ch, f) => { f.sway = W.t + 3400; let said = false; run2(ch, f.x - 220, f.y + 10, 3200, (k) => { const x = -220 + k * 440, sw = Math.sin(W.t * 0.012) * 18 * (1 - Math.abs(x / 220)); ch.x = f.x + x; ch.z = 110 - (1 - (x / 220) * (x / 220)) * 50 - sw + 4; ch.pose = 'walk'; if (k > 0.45 && !said) { said = true; W.say(ch, 'ゆれる〜！', '!', 1100, 'wow'); } }, (c2) => { back(c2, f, 280); R.claim(c2, 1800).say('わたれた！', 'star', 1300, 'yay').pose('cheer', 800); }); };
  T('mountain', 's5_ropebridge', 'd5_bridge', (f) => { const ch = near(f, 1)[0]; if (ch) cross(ch, f); else f.sway = W.t + 3000; A.sfx('whoosh'); }, (ch, f) => cross(ch, f));
  const squirrel = (f) => { f.peek = W.t + 3000; f.shake = W.t + 800; A.sfx('tickle'); W.after(600, () => { A.sfx('pop'); pop('acorn', f.x - 60, f.y + 40); pop('acorn', f.x + 70, f.y + 50); }); X.critter && X.critter('squirrel', [[f.x, f.y - 140, 1], [f.x + 40, f.y - 140, 1600], [f.x + 400, f.y + 30, 1600]]); };
  T('mountain', 's5_squirreltree', 'd5_squirrel', (f) => { squirrel(f); lineUp(f, ['リスさん！', 'どんぐり！']); }, (ch, f) => { R.claim(ch, 5000).go(f.x + 110, f.y + 20, true).look(f.x).pose('tickle', 800).do(() => squirrel(f)).wait(700).hold('acorn').say('どんぐり ゲット！', 'acorn', 1400, 'yay').pose('cheer', 800).unhold(); });

  /* ===== 59 ピクニック ===== */
  D('d5_bento', 'みんなで おべんとう', 'シートに すわって いただきます！', ['s5_picnicsheet', 'bento'], 'picnic');
  D('d5_butterfly', 'ちょうちょ ひらひら', 'おはなばたけから ちょうちょが いっせいに', ['s5_flowerfield', 'bugnet'], 'picnic');
  D('d5_dandelion', 'たんぽぽの わたげ', 'ふーっと ふくと わたげが そらへ', ['s5_dandelion'], 'picnic');
  const eat = (ch, f, i) => R.claim(ch, 6500).go(f.x + (i - 1) * 120, f.y - 30, true).do(() => { ch.stay = true; ch.rest = 'sit'; }).hold(PT.pick(['onigiri', 'apple', 'strawberry', 'bento'])).pose('eat', 1600).say(i === 1 ? 'いただきます！' : 'おいしいね！', 'onigiri', 1300, 'yay').unhold().do(() => { ch.rest = 'idle'; ch.stay = false; });
  const openBento = (f) => { f.open = W.t + 8000; A.sfx('ding'); spark(f.x, f.y - 100, '#ffffff'); };
  T('picnic', 's5_picnicsheet', 'd5_bento', (f) => { openBento(f); W.after(500, () => pop(PT.pick(['onigiri', 'apple', 'strawberry']), f.x + 200, f.y + 40)); near(f, 3).forEach((ch, i) => eat(ch, f, i)); }, (ch, f) => { openBento(f); hearts(f.x, f.y - 140); eat(ch, f, 1); });
  T('picnic', 's5_flowerfield', 'd5_butterfly', (f) => { f.fly = W.t + 3500; A.sfx('sparkle'); lineUp(f, ['ちょうちょ！', 'ひらひら〜']); }, (ch, f) => {
    f.fly = W.t + 3500; A.sfx('sparkle');
    run2(ch, f.x, f.y + 20, 3000, (k) => { ch.x = f.x + Math.sin(k * PT.TAU) * 180; ch.pose = 'run'; ch.flip = Math.cos(k * PT.TAU) < 0; ch.holdType = 'bugnet'; }, (c2) => { c2.holdType = null; c2.stay = false; R.claim(c2, 2000).say('まてまて〜 ちょうちょ！', 'heart', 1400, 'laugh'); });
  });
  const blow = (f) => { f.blow = W.t + 3200; A.sfx('whoosh'); };
  T('picnic', 's5_dandelion', 'd5_dandelion', (f) => { blow(f); lineUp(f, ['わたげ〜！', 'とんでいけ〜！']); }, (ch, f) => { R.claim(ch, 4500).go(f.x - 130, f.y + 10, true).look(f.x).pose('call', 400).say('ふーっ！', null, 900, 'talk').do(() => blow(f)).face('love', 1200).say('とんでった！', 'flower', 1300, 'yay'); });

  /* ===== 60 かわあそび ===== */
  D('d5_fishjump', 'さかなが ぴちっ', 'かわを タップすると さかなが はねる', ['s5_river', 'goldfish'], 'riverplay');
  D('d5_stones', 'とびいし ぴょんぴょん', 'とびいしを ぴょん ぴょん わたる', ['s5_stones', 'kon'], 'riverplay');
  D('d5_watermill', 'すいしゃの みずしぶき', 'すいしゃが くるくる。しぶきが ぱしゃっ', ['s5_watermill'], 'riverplay');
  const fishJump = (f, x) => { f.jump = W.t + 2400; f.jx = x == null ? PT.rand(-400, 400) : x; A.sfx('splash'); W.after(700, () => A.sfx('splash')); };
  T('riverplay', 's5_river', 'd5_fishjump', (f) => { fishJump(f); lineUp(f, ['さかなが はねた！', 'ぴちぴち！']); }, (ch, f) => {
    R.claim(ch, 5000).go(PT.clamp(ch.x, f.x - 600, f.x + 600), f.y - 60, true).do(() => { A.sfx('splash'); drops(ch.x, ch.y - 40, 12); fishJump(f, PT.clamp(ch.x - f.x + 160, -700, 700)); }).pose('swim', 1400).face('laugh', 1200).say('つめたーい！', '!', 1200, 'laugh').say('さかなも いた！', 'goldfish', 1300, 'yay');
  });
  const hop = (ch, f) => { let last = -1; R.claim(ch, 7000).go(f.x - 290, f.y + 30, true).do(() => { ch.stay = true; ch.flip = false; R.tween(ch, 3000, (k) => {
    const s = Math.min(4, k * 4.4), i = Math.floor(s), u = s - i; ch.x = f.x - 200 + s * 100; ch.y = f.y + 2; ch.z = 22 + Math.sin(u * Math.PI) * 70 * (s >= 4 ? 0 : 1); ch.pose = 'jump'; ch.scale = W.depthScale(ch.y);
    if (i !== last) { last = i; f.si = i; f.hop = W.t + 250; A.sfx('boing'); drops(ch.x, ch.y - 10, 4); }
  }, () => { back(ch, f, 300); R.claim(ch, 1800).say('わたれた！', 'star', 1300, 'yay').pose('cheer', 800); }); }); };
  T('riverplay', 's5_stones', 'd5_stones', (f) => { const ch = near(f, 1)[0]; if (ch) hop(ch, f); }, (ch, f) => hop(ch, f));
  const spin = (f) => { f.spin = W.t + 3000; A.sfx('splash'); drops(f.x - 60, f.y - 120, 12); };
  T('riverplay', 's5_watermill', 'd5_watermill', (f) => { spin(f); lineUp(f, ['くるくる まわる！', 'しぶきが きれい！']); }, (ch, f) => { R.claim(ch, 4500).go(f.x - 180, f.y + 20, true).look(f.x).do(() => { spin(f); drops(ch.x, ch.y - 160, 10); }).face('surprise', 800).say('きゃっ つめたい！', '!', 1100, 'wow').face('laugh', 1000).pose('dance', 1000); });

  /* ===== おだい ===== */
  const O = (stage, text, goals, hint) => ({ id: stage + ':' + text, stage, text, goals, hint });
  PT.ODAI2 = (PT.ODAI2 || []).concat([
    O('sportsday', 'うんどうかいで 1ばんに なろう', ['d5_kakekko', 'd5_tamaire', 'd5_kusudama'], ['s5_goaltape']),
    O('soccer', 'シュートを きめよう', ['d5_goal', 'd5_heading'], ['s5_soccergoal', 'ball']),
    O('baseball', 'ホームランを うとう', ['d5_homerun', 'd5_pitch'], ['s5_batbox']),
    O('bowling', 'ストライクを ねらおう', ['d5_strike', 'd5_ballreturn'], ['s5_lane']),
    O('minigolf', 'ボールを カップに いれよう', ['d5_cupin', 'd5_windmill', 'd5_loop'], ['s5_golfcup']),
    O('gym', 'とびばこを とんでみよう', ['d5_vault', 'd5_mat'], ['s5_vaultbox']),
    O('surf', 'なみに のってみよう', ['d5_surf'], ['s5_surfwave']),
    O('ski', 'スキーで すべろう', ['d5_ski', 'd5_lift'], ['s5_slope']),
    O('onsen', 'おんせんで ほかほか しよう', ['d5_onsen', 'd5_milk'], ['s5_onsen']),
    O('mountain', 'やまの てっぺんで やっほー', ['d5_yahho'], ['s5_summit']),
    O('picnic', 'みんなで おべんとうを たべよう', ['d5_bento'], ['s5_picnicsheet', 'bento']),
    O('riverplay', 'かわで さかなを みつけよう', ['d5_fishjump', 'd5_stones'], ['s5_river']),
  ]);
})();
