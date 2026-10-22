/* ステージ 61〜72 の あそび（まちの おしごと） */
'use strict';
(() => {
  const W = PT.world, R = PT.R, D = R.D, X = PT.FX, A = PT.audio;
  if (!R || !R.h) return;
  const { isC } = R.h;
  const onFix = (c, type) => (c.tgt && c.tgt.kind === 'fix' && c.tgt.type === type ? c.tgt : null);
  const tapFix = (c, type) => (c.e.kind === 'fix' && c.e.type === type ? c.e : null);
  const spark = (x, y, col = '#ffd23f', n = 10) => W.burst('spark', x, y, n, { sp: 0.2, max: 800, size: 10, col, g: 0 });
  const hearts = (x, y, n = 5) => W.burst('heart', x, y, n, { up: true, sp: 0.12, max: 900 });
  const near = (f, n = 2, r = 1600, excl = []) => R.free(f.x, f.y, excl, r).slice(0, n);
  const pop = (id, x, y) => { if (!PT.ITEMS[id]) return null; const p = W.addProp(id, x, y); p.pop = W.t; return p; };
  const back = (ch, f, dx = 160) => { ch.stay = false; ch.z = 0; ch.baseZ = 0; ch.rest = 'idle'; ch.hidden = false; const p = W.clampFloor(f.x + dx, f.y + 40); ch.x = p.x; ch.y = p.y; ch.scale = W.depthScale(ch.y); };
  const lineUp = (f, lines, pose = 'cheer', excl = []) => near(f, 2, 1500, excl).forEach((ch, i) => R.claim(ch, 3000).wait(300 + i * 300).look(f.x).face('surprise', 800).say(lines[i % lines.length], null, 1400, 'wow').pose(pose, 900));
  const T = (stage, type, disc, tap, put) => {
    if (tap) R.add({ id: 's6-' + type + '-tap', on: 'tapfix', pri: 52, stage, test: (c) => tapFix(c, type), run(c, f) { tap(f); W.after(900, () => R.found(disc)); } });
    const p = put === 'tap' ? (ch, f) => tap(f, ch) : put;
    if (p) R.add({ id: 's6-' + type + '-char', pri: 78, stage, test: (c) => (isC(c.e) ? onFix(c, type) : null), run(c, f) { p(c.e, f); W.after(1500, () => R.found(disc)); } });
  };
  const ride = (ch, f, ms, pose, fn, done) => R.claim(ch, ms + 2000).go(f.x, f.y + 6, true).do(() => { ch.stay = true; ch.flip = false; const sx = ch.x, sy = ch.y; R.tween(ch, ms, (k) => { ch.pose = pose; fn(k, sx, sy); ch.scale = W.depthScale(ch.y); }, () => { back(ch, f); done && done(ch); }); });
  const sit = (ch, f, ms, dx = 0, z = 30) => R.claim(ch, ms + 2500).go(f.x + dx, f.y + 6, true).do(() => { ch.stay = true; ch.rest = 'sit'; ch.z = z; ch.flip = false; });
  const who = (f, w) => w || near(f, 1)[0];
  const tune = (notes, step = 0.22, type = 'triangle', vol = 0.08) => notes.forEach((n, i) => n && A.tone(440 * Math.pow(2, (n - 69) / 12), step * 0.95, { type, vol, delay: i * step }));
  const wear = (ch, o) => { ch.wear = Object.assign({}, ch.wear, o); };

  /* 61 としょかん */
  D('d6_popbook', 'とびだす えほん', 'おおきな えほんを ひらくと えが とびだす！', ['s6_bigbook', 'book'], 'library');
  D('d6_bookfly', 'とりに なった ほん', 'はしごを タップすると ほんが ぱたぱた とんでいく', ['s6_ladder', 'book'], 'library');
  D('d6_storytime', 'よみきかせ', 'いすに すわって むかし むかし…', ['s6_storychair', 'jiji'], 'library');
  T('library', 's6_bigbook', 'd6_popbook', (f, w) => {
    f.open = W.t + 3400; f.pk = (f.pk || 0) + 1; A.sfx('magic'); W.after(500, () => { A.sfx('pop'); spark(f.x, f.y - 300, '#ffe066', 14); });
    const ch = w; if (ch) R.claim(ch, 4000).go(f.x + 170, f.y + 20, true).look(f.x).face('surprise', 900).say('とびだした！', 'book', 1400, 'wow').pose('cheer', 900);
    lineUp(f, ['わあ！ とびだした！', 'えほん すごい！'], 'jump', ch ? [ch] : []);
  }, 'tap');
  T('library', 's6_ladder', 'd6_bookfly', (f) => { f.fly = W.t + 2800; f.slide = W.t + 1800; A.sfx('whoosh'); W.after(300, () => A.sfx('tickle')); lineUp(f, ['ほんが とんでる！', 'ぱたぱた〜！']); }, (ch, f) => {
    f.slide = W.t + 1800; A.sfx('boing');
    ride(ch, f, 3000, 'hold', (k, sx, sy) => { ch.x = sx + 100; ch.y = sy; ch.z = Math.sin(k * Math.PI) * 260; if (k > 0.5 && !ch._s6b) { ch._s6b = true; f.fly = W.t + 2800; A.sfx('whoosh'); } }, (c2) => { c2._s6b = false; R.claim(c2, 2500).hold('book').say('この ほん よもう！', 'book', 1400, 'yay').pose('cheer', 800).unhold(); });
  });
  function story(f, reader) {
    if (!reader) return; f.story = W.t + 6000; A.sfx('ding');
    sit(reader, f, 5000).hold('book').say('むかし むかし…', 'book', 1800, 'talk').say('おしまい！', 'star', 1300, 'yay').unhold().do(() => back(reader, f, -200));
    near(f, 3, 1800, [reader]).forEach((ch, i) => R.claim(ch, 6000).go(f.x - 260 + i * 110, f.y + 120, true).look(f.x).do(() => { ch.stay = true; ch.rest = 'sit'; }).pose('sit', 3000).face('love', 1200).say('たのしい！', 'heart', 1200, 'yay').do(() => { ch.stay = false; ch.rest = 'idle'; }));
  }
  T('library', 's6_storychair', 'd6_storytime', (f, w) => story(f, who(f, w)), 'tap');

  /* 62 アトリエ */
  D('d6_easel', 'おえかき タイム', 'イーゼルを タップすると えが かわる', ['s6_easel', 'beret'], 'atelier');
  D('d6_paints', 'えのぐ ぱしゃっ', 'えのぐが とびはねて カラフルな あしあと', ['s6_paintpots', 'crayons'], 'atelier');
  D('d6_clay', 'ねんどの ちょうこく', 'ろくろが くるくる。なにが できるかな？', ['s6_clay'], 'atelier');
  T('atelier', 's6_easel', 'd6_easel', (f, w) => {
    f.pic = (f.pic || 0) + 1; f.paint = W.t + 1600; A.sfx('sparkle'); W.after(1650, () => { A.sfx('ding'); spark(f.x, f.y - 250, '#ff8fb1', 12); });
    if (w) { wear(w, { hat: 'beret' }); R.claim(w, 4000).go(f.x - 150, f.y + 20, true).look(f.x).hold('crayons').pose('hold', 1600).unhold().say('かけた！', 'crayons', 1400, 'yay').pose('cheer', 800); }
    lineUp(f, ['じょうず！', 'すてきな え！'], 'cheer', w ? [w] : []);
  }, 'tap');
  T('atelier', 's6_paintpots', 'd6_paints', (f) => { f.splash = W.t + 1600; A.sfx('splash'); ['#ff6f91', '#ffd23f', '#58b9f0'].forEach((col, i) => W.burst('spark', f.x - 80 + i * 80, f.y - 100, 6, { up: true, sp: 0.25, col, max: 900 })); lineUp(f, ['ぱしゃっ！', 'カラフル〜！']); }, (ch, f) => {
    f.splash = W.t + 1600; A.sfx('splash');
    R.claim(ch, 4500).go(f.x, f.y + 20, true).jump(70, 500).do(() => { f.prints = ['#ff6f91', '#ffd23f', '#58b9f0', '#7bd36a', '#c38be0']; W.burst('confetti', f.x, f.y - 60, 14, { up: true, sp: 0.25 }); }).face('laugh', 1200).say('あしあと カラフル！', 'rainbow', 1400, 'laugh').go(f.x + 380, f.y + 20).pose('dance', 900);
  });
  function clay(f, ch) {
    f.spin = W.t + 1800; A.sfx('whoosh');
    W.after(1800, () => { f.shape = (f.shape || 0) + 1; f.done = W.t + 2000; A.sfx('magic'); spark(f.x, f.y - 220, '#ffd23f', 12); });
    if (ch) R.claim(ch, 4500).go(f.x + 140, f.y + 20, true).look(f.x).pose('hold', 1700).say('こねこね…', null, 1000).face('love', 1000).say('できた！', 'star', 1300, 'yay').pose('cheer', 800);
  }
  T('atelier', 's6_clay', 'd6_clay', (f, w) => clay(f, w || near(f, 1)[0]), 'tap');

  /* 63 おんがく きょうしつ */
  D('d6_piano', 'ピアノの えんそうかい', 'ピアノを タップすると きらきらぼしが ながれる', ['s6_grandpiano', 'music'], 'musicroom');
  D('d6_bells', 'ドレミの ベル', 'ハンドベルが じゅんばんに ドレミファソ', ['s6_handbells'], 'musicroom');
  D('d6_conductor', 'しきしゃさん', 'だいに のって ふると みんなが えんそう', ['s6_podium', 'trumpet'], 'musicroom');
  const MEL = [60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60];
  T('musicroom', 's6_grandpiano', 'd6_piano', (f, w) => {
    f.play = W.t + 3400; tune(MEL.map((n) => n + 12), 0.23, 'triangle', 0.1);
    if (w) R.claim(w, 4500).go(f.x + 200, f.y + 20, true).look(f.x).pose('dance', 3000).say('ぼくの えんそう！', 'music', 1300, 'yay');
    W.chars().forEach((ch) => { if (ch !== w && W.isFree(ch)) R.claim(ch, 4000).wait(400).look(f.x).pose('dance', 2400).face('love', 1200); });
  }, 'tap');
  T('musicroom', 's6_handbells', 'd6_bells', (f) => { f.seq = [0, 1, 2, 3, 4, 5, 6, 7]; f.ring = W.t + 8 * 260 + 600; W.after(500, () => tune([72, 74, 76, 77, 79, 81, 83, 84], 0.26, 'sine', 0.12)); lineUp(f, ['ドレミファソラシド！', 'きれいな おと！']); }, (ch, f) => {
    f.seq = [4, 2, 2, 3, 1, 1, 0, 1, 2, 3, 4, 4, 4]; f.ring = W.t + f.seq.length * 260 + 600; W.after(500, () => tune([79, 76, 76, 77, 74, 74, 72, 74, 76, 77, 79, 79, 79], 0.26, 'sine', 0.12));
    R.claim(ch, 5000).go(f.x, f.y + 40, true).pose('dance', 3200).say('ちょうちょ〜♪', 'music', 1400, 'yay');
  });
  function conduct(f, ch) {
    if (!ch) return; f.conduct = W.t + 4500;
    R.claim(ch, 6000).go(f.x, f.y + 4, true).do(() => { ch.stay = true; ch.z = 36; ch.flip = false; tune([67, 72, 72, 76, 74, 72, 0, 79, 77, 76, 74, 72], 0.3, 'square', 0.05); }).pose('wave', 1600).say('さん、はい！', 'music', 1200, 'yay').pose('wave', 1600).do(() => back(ch, f, 0));
    const ins = ['trumpet', 'drum', 'tambourine', 'maracas'];
    near(f, 4, 2000, [ch]).forEach((o, i) => R.claim(o, 5000).wait(500).look(f.x).hold(ins[i % 4]).pose('dance', 3000).unhold());
  }
  T('musicroom', 's6_podium', 'd6_conductor', (f, w) => conduct(f, w || near(f, 1)[0]), 'tap');

  /* 64 けいさつしょ */
  D('d6_patlamp', 'パトランプ ピカピカ', 'パトカーの ランプが ピカピカ ウーウー', ['s6_patrolcar', 'police'], 'policestation');
  D('d6_signal', 'しんごうを わたろう', 'あおに なったら てを あげて わたろう', ['s6_signal'], 'policestation');
  D('d6_lostfound', 'おとしもの みつけた', 'おとしものの はこから なにか でてきた', ['s6_lostfound', 'teddy'], 'policestation');
  const siren = () => { for (let i = 0; i < 6; i++) A.tone(i % 2 ? 660 : 880, 0.28, { type: 'triangle', vol: 0.06, delay: i * 0.3 }); };
  T('policestation', 's6_patrolcar', 'd6_patlamp', (f) => { f.siren = W.t + 3000; siren(); lineUp(f, ['ピーポー ピカピカ！', 'かっこいい〜！'], 'point'); }, (ch, f) => {
    wear(ch, { hat: 'police' }); f.siren = W.t + 3400; siren();
    ride(ch, f, 3200, 'sit', (k, sx, sy) => { const dx = Math.sin(k * Math.PI) * 360; f.x = sx + dx; ch.x = sx + dx - 20; ch.y = sy; ch.z = 70; }, (c2) => R.claim(c2, 1800).say('パトロール しゅっぱつ！', 'police', 1400, 'yay').pose('point', 800));
  });
  T('policestation', 's6_signal', 'd6_signal', (f) => { f.sig = ((f.sig || 0) + 1) % 3; A.sfx('ding'); spark(f.x - 56 + f.sig * 56, f.y - 318, ['#3ad07a', '#ffd23f', '#ff4a4a'][f.sig], 8); lineUp(f, [['あおは すすめ！', 'きいろは ちゅうい！', 'あかは とまれ！'][f.sig], 'わかった！']); }, (ch, f) => {
    f.sig = 2; A.sfx('ding');
    R.claim(ch, 7000).go(f.x + 80, f.y + 40, true).say('あかは とまれ！', '!', 1200).do(() => { f.sig = 0; f.walk = W.t + 3000; A.sfx('bell'); }).say('みぎ ひだり…', '?', 1100).pose('cheer', 600).go(f.x + 440, f.y + 40).say('わたれたよ！', 'star', 1300, 'yay').pose('jump', 700);
  });
  T('policestation', 's6_lostfound', 'd6_lostfound', (f) => {
    f.pop = W.t + 1400; A.sfx('pop'); const it = PT.pick(['teddy', 'umbrella', 'ball', 'bag', 'bunny', 'letter']);
    W.after(500, () => { const p = pop(it, f.x + 120, f.y + 50); const ch = near(f, 1)[0]; if (ch && p) R.claim(ch, 3500).go(p.x + 70, p.y, true).look(p.x).face('surprise', 800).say('あった！ ありがとう！', it, 1500, 'yay').pose('jump', 700); });
  }, (ch, f) => {
    wear(ch, { hat: 'police' }); f.pop = W.t + 1400; A.sfx('ding');
    R.claim(ch, 5000).go(f.x - 200, f.y + 20, true).pose('point', 800).say('まかせて ください！', 'police', 1400, 'yay').hold('magnifier').go(f.x - 420, f.y + 40).look(f.x).say('みつけた！', '!', 1200, 'wow').unhold().do(() => pop('teddy', f.x - 360, f.y + 60));
  });

  /* 65 ゆうびんきょく */
  D('d6_postbox', 'おてがみ とどいた', 'ポストに いれると おてがみが とんでいく', ['s6_postbox', 'letter'], 'postoffice');
  D('d6_stamp', 'ポンと スタンプ', 'スタンプを おすと ハートや ほしの しるし', ['s6_stampdesk'], 'postoffice');
  D('d6_delivery', 'はいたつ しゅっぱつ', 'ゆうびんバイクで おとどけもの', ['s6_postbike', 'present'], 'postoffice');
  function flyLetter(f, from) {
    const to = PT.pick(W.chars().filter((c) => c !== from && !c.hidden)) || null; if (!to) return;
    const x0 = f.x, y0 = f.y - 220, x1 = to.x, y1 = to.y - 200; f.sent = W.t + 900; A.sfx('whoosh');
    W.special({ type: 's6letter', max: 1600, draw(c, fx, k) { const x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 220, fl = Math.sin(W.t * 0.04) * 0.6; for (const s of [-1, 1]) { c.save(); c.translate(x + s * 22, y - 6); c.rotate(s * fl); PT.G.ell(c, s * 14, 0, 16, 8); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#9fc8e8'; c.lineWidth = 2; c.stroke(); c.restore(); } PT.G.rr(c, x - 24, y - 16, 48, 32, 4); PT.G.fillO(c, '#ffffff', 2.5); PT.G.heart(c, x, y + 4, 8); c.fillStyle = '#ff6f91'; c.fill(); } });
    W.after(1600, () => { A.sfx('ding'); if (to.removed) return; pop('letter', to.x + 60, to.y + 10); R.claim(to, 3000).face('surprise', 800).jump(40, 400).say('おてがみ きた！', 'letter', 1500, 'yay').face('love', 1000); hearts(to.x, to.y - 180, 4); });
  }
  function post(f, ch) {
    if (!ch) return;
    R.claim(ch, 5000).go(f.x + 100, f.y + 20, true).look(f.x).hold('letter').pose('hold', 600).unhold().do(() => { f.post = W.t + 1000; A.sfx('place'); W.after(1000, () => flyLetter(f, ch)); }).say('とどきますように！', 'letter', 1400, 'yay');
  }
  T('postoffice', 's6_postbox', 'd6_postbox', (f, w) => post(f, w || near(f, 1)[0]), 'tap');
  const stamp = (f) => { f.marks = (f.marks || []).concat([[PT.rand(-80, 40), PT.rand(-120, -40), PT.pick(['#ff6f91', '#58b9f0', '#7bd36a', '#c38be0']), PT.irand(0, 2)]]).slice(-7); f.stamp = W.t + 900; W.after(450, () => { A.sfx('drum'); spark(f.x - 30, f.y - 180, '#ff8fb1', 6); }); };
  T('postoffice', 's6_stampdesk', 'd6_stamp', (f) => { stamp(f); lineUp(f, ['ポン！', 'かわいい しるし！']); }, (ch, f) => { R.claim(ch, 5000).go(f.x + 200, f.y + 20, true).look(f.x).do(() => stamp(f)).pose('hold', 900).say('ポン！', null, 900, 'yay').do(() => stamp(f)).pose('hold', 900).say('ポンポン！', 'star', 1200, 'laugh'); });
  function deliver(f, ch) {
    if (!ch) return; f.ride = W.t + 3600; A.sfx('train');
    ride(ch, f, 3400, 'sit', (k, sx, sy) => { const dx = -Math.sin(k * Math.PI) * 520; f.x = sx + dx; ch.x = sx + dx - 10; ch.y = sy; ch.z = 70; if (k > 0.5 && !ch._s6d) { ch._s6d = true; pop(PT.pick(['present', 'letter', 'box']), ch.x, ch.y + 50); A.sfx('pop'); } }, (c2) => { c2._s6d = false; R.claim(c2, 1800).say('おとどけ しました！', 'present', 1400, 'yay').pose('point', 700); });
  }
  T('postoffice', 's6_postbike', 'd6_delivery', (f, w) => deliver(f, who(f, w)), 'tap');

  /* 66 こうじげんば */
  D('d6_excavator', 'ショベルカー ほりほり', 'ショベルカーが すなを ほって やまに', ['s6_excavator', 'bucket'], 'construction');
  D('d6_crane', 'クレーンで つみあげ', 'クレーンが ブロックを つみあげて ビルを つくる', ['s6_crane', 'blocks'], 'construction');
  D('d6_mixer', 'ミキサーしゃ ぐるぐる', 'ミキサーしゃの ドラムが ぐるぐる まわる', ['s6_mixer'], 'construction');
  const dig = (f) => { f.dig = W.t + 3000; A.sfx('roar'); W.after(1000, () => X.dig && X.dig(f.x + 260, f.y)); W.after(2400, () => { f.pile = (f.pile == null ? 2 : f.pile) + 1; A.sfx('pop'); if (f.pile >= 5) { f.pile = 1; pop('castle', f.x + 240, f.y + 60); A.sfx('cheer'); spark(f.x + 240, f.y - 80, '#ffd23f', 14); } }); };
  T('construction', 's6_excavator', 'd6_excavator', (f) => { dig(f); lineUp(f, ['ほりほり〜！', 'ちからもち！'], 'point'); }, (ch, f) => {
    wear(ch, { hat: 'explorer' }); dig(f);
    ride(ch, f, 3000, 'sit', (k, sx, sy) => { ch.x = sx - 80; ch.y = sy; ch.z = 110 + Math.sin(k * 30) * 3; }, (c2) => R.claim(c2, 1600).say('うんてん じょうず！', 'star', 1300, 'yay'));
  });
  T('construction', 's6_crane', 'd6_crane', (f) => {
    f.lift = W.t + 3000; A.sfx('rocket');
    W.after(3000, () => { const fl = (f.floors == null ? 2 : f.floors) + 1; A.sfx('drum'); spark(f.x + 130, f.y - fl * 50, '#ffd23f', 10); if (fl >= 6) { f.floors = 0; A.sfx('cheer'); X.confetti && X.confetti(f.x, 1400); } else f.floors = fl; });
    lineUp(f, ['あがった〜！', 'ビルが できる！']);
  }, (ch, f) => {
    f.carry = W.t + 3400; A.sfx('whoosh');
    ride(ch, f, 3200, 'hold', (k, sx, sy) => { ch.x = sx + 240; ch.y = sy; ch.z = Math.sin(k * Math.PI) * 300; f.cz = ch.z; }, (c2) => { f.cz = 0; R.claim(c2, 1600).say('たかーい！', 'star', 1300, 'yay'); });
  });
  const mix = (f) => { f.mix = W.t + 2600; A.sfx('drumroll'); W.after(2500, () => { A.sfx('pop'); pop('blocks', f.x - 200, f.y + 50); }); };
  T('construction', 's6_mixer', 'd6_mixer', (f) => { mix(f); lineUp(f, ['ぐるぐる〜！', 'なにが でるかな？']); }, (ch, f) => { mix(f); R.claim(ch, 4000).go(f.x + 220, f.y + 20, true).look(f.x).pose('spin', 1200).say('ぐるぐる〜！', null, 1300, 'laugh').face('laugh', 900).pose('cheer', 800); });

  /* 67 びよういん */
  D('d6_haircut', 'かわいく へんしん', 'いすに すわると チョキチョキ。かわいく なった！', ['s6_salonchair', 'ribbon'], 'hairsalon');
  D('d6_afro', 'ドライヤーで アフロ', 'ドライヤーで ブオーッ。かみが もこもこ アフロに！', ['s6_dryer'], 'hairsalon');
  D('d6_shampoo', 'あわあわ シャンプー', 'シャンプーで あわが もこもこ', ['s6_shampoo', 'bubbles'], 'hairsalon');
  function haircut(f, ch) {
    if (!ch) return;
    sit(ch, f, 4500, 0, 40).do(() => { f.cut = W.t + 2400; for (let i = 0; i < 6; i++) A.tone(1800, 0.05, { type: 'square', vol: 0.03, delay: i * 0.35 }); }).say('チョキ チョキ…', null, 1200).wait(1200).do(() => { f.shine = W.t + 2500; wear(ch, { hat: PT.pick(['ribbon', 'tiara', 'flowercrown', 'hearttiara', 'catears', 'tiara_flower']) }); A.sfx('magic'); spark(ch.x, ch.y - ch.z - 160, '#ff8fd0', 14); }).face('love', 1400).say('かわいく なった！', 'mirror', 1500, 'yay').do(() => back(ch, f, 180));
  }
  T('hairsalon', 's6_salonchair', 'd6_haircut', (f, w) => haircut(f, who(f, w)), 'tap');
  const afro = (ch, ms = 4500) => W.special({ type: 's6afro', max: ms, draw(c) { if (ch.removed || ch.hidden) return; const s = (ch.scale || 1) * ch.def.size, x = ch.x, y = ch.y - (ch.z || 0) - 128 * s; for (let i = 0; i < 11; i++) { const a = Math.PI * 0.95 + (i / 10) * Math.PI * 1.1, rr = 62 * s; PT.G.circ(c, x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.95, 28 * s); c.fillStyle = i % 2 ? '#4a2a1a' : '#5a3424'; c.fill(); } PT.G.circ(c, x, y - 70 * s, 34 * s); c.fillStyle = '#5a3424'; c.fill(); PT.G.circ(c, x + 40 * s, y - 92 * s, 9 * s); c.fillStyle = '#ff8fd0'; c.fill(); } });
  function dryer(f, ch) {
    if (!ch) return;
    sit(ch, f, 5000, 0, 40).do(() => { f.dry = W.t + 2200; A.noise && A.noise(1.6, { vol: 0.05 }); A.sfx('whoosh'); }).face('sleep', 1800).wait(2000).do(() => { afro(ch, 5000); A.sfx('boing'); W.poof(ch.x, ch.y - ch.z - 150); }).face('laugh', 1400).say('もこもこ アフロ〜！', '!', 1500, 'laugh').do(() => back(ch, f, 180)).pose('dance', 1200);
    lineUp(f, ['アフロだ〜！', 'おもしろーい！'], 'jump', [ch]);
  }
  T('hairsalon', 's6_dryer', 'd6_afro', (f, w) => dryer(f, who(f, w)), 'tap');
  const foamHead = (ch, ms = 3000) => W.special({ type: 's6foam', max: ms, draw(c) { if (ch.removed) return; const s = (ch.scale || 1) * ch.def.size, x = ch.x, y = ch.y - (ch.z || 0) - 150 * s; for (let i = 0; i < 7; i++) { PT.G.circ(c, x - 45 * s + i * 15 * s, y - Math.sin(i) * 10 * s + Math.sin(W.t * 0.01 + i) * 3, (16 + (i % 3) * 5) * s); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#bfe0f5'; c.lineWidth = 2; c.stroke(); } } });
  T('hairsalon', 's6_shampoo', 'd6_shampoo', (f) => { f.foam = W.t + 3000; A.sfx('bubble'); W.addBubbles(f.x - 80, f.y - 140, 12); lineUp(f, ['あわあわ〜！', 'シャボンだま！']); }, (ch, f) => {
    sit(ch, f, 4500, 40, 50).do(() => { f.foam = W.t + 3200; A.sfx('bubble'); foamHead(ch, 3200); W.addBubbles(ch.x, ch.y - 200, 10); }).face('laugh', 1400).say('あわあわ きもちいい〜', 'heart', 1500, 'laugh').wait(1200).do(() => back(ch, f, 200)).say('さっぱり！', 'star', 1200, 'yay');
  });

  /* 68 ラーメンやさん */
  D('d6_ramen', 'ラーメン ずるずる', 'ラーメンを ずるずる〜っと たべよう', ['s6_ramenbowl'], 'ramen');
  D('d6_yugiri', 'ちゃっちゃっ ゆぎり', 'めんを ちゃっちゃっと ふって できあがり', ['s6_noodlepot', 'chef'], 'ramen');
  D('d6_charumera', 'やたいの ラッパ', 'やたいの ラッパで みんなが あつまる', ['s6_yatai', 'trumpet'], 'ramen');
  T('ramen', 's6_ramenbowl', 'd6_ramen', (f) => { f.slurp = W.t + 2600; A.sfx('munch'); W.after(800, () => A.sfx('munch')); lineUp(f, ['ずるずる〜！', 'おいしそう！']); }, (ch, f) => {
    f.slurp = W.t + 2800; R.claim(ch, 5000).go(f.x + 180, f.y + 30, true).look(f.x).face('eat', 1800).pose('eat', 1800).sfx('munch').say('ずるずる〜 おいしい！', 'heart', 1500, 'yay').face('love', 1000); hearts(f.x, f.y - 260);
  });
  const yugiri = (f) => { f.boil = W.t + 2600; for (let i = 0; i < 5; i++) A.tone(320, 0.08, { type: 'square', vol: 0.05, delay: 0.2 + i * 0.4 }); W.after(2600, () => { A.sfx('ding'); spark(f.x + 30, f.y - 260, '#ffe28a', 10); }); };
  T('ramen', 's6_noodlepot', 'd6_yugiri', (f) => { yugiri(f); lineUp(f, ['ちゃっ ちゃっ！', 'いい におい〜']); }, (ch, f) => { wear(ch, { hat: 'chef', body: ch.wear.body || 'apron' }); yugiri(f); R.claim(ch, 4500).go(f.x + 170, f.y + 20, true).look(f.x).pose('hold', 1400).say('ちゃっ ちゃっ！', null, 1200, 'yay').say('へい おまち！', 'chef', 1400, 'yay').pose('cheer', 800); });
  const CHAR = [72, 74, 76, 0, 74, 72, 0, 0, 72, 74, 76, 74, 72, 74];
  function charumera(f, ch) {
    f.toot = W.t + 4500; tune(CHAR, 0.2, 'sawtooth', 0.05);
    if (ch) R.claim(ch, 5000).go(f.x - 230, f.y + 20, true).hold('trumpet').pose('hold', 2800).unhold().say('いらっしゃい！', 'chef', 1400, 'yay');
    near(f, 3, 2400, ch ? [ch] : []).forEach((o, i) => R.claim(o, 5000).wait(600 + i * 300).go(f.x - 60 + i * 110, f.y + 110, true).look(f.x).face('love', 1200).say(PT.pick(['いい におい〜', 'ラーメン ください！', 'おなか すいた〜']), null, 1400, 'yay'));
  }
  T('ramen', 's6_yatai', 'd6_charumera', (f, w) => charumera(f, w), 'tap');

  /* 69 アイスクリームやさん */
  D('d6_icetower', 'アイスの タワー', 'アイスを どんどん つみあげて タワーに！', ['s6_icetower', 'icecream'], 'icecreamshop');
  D('d6_softserve', 'ソフトクリーム くるくる', 'レバーを ひくと ソフトクリームが くるくる', ['s6_softserve'], 'icecreamshop');
  D('d6_parfait', 'パフェを つくろう', 'パフェの グラスに どんどん かさねて いただきます', ['s6_parfait', 'strawberry'], 'icecreamshop');
  const addScoop = (f) => {
    const n = (f.n == null ? 2 : f.n);
    if (n >= 8) { f.n = 1; f.add = W.t + 500; A.sfx('pop'); return; }
    f.n = n + 1; f.add = W.t + 500; A.sfx('boing'); A.tone(440 * Math.pow(2, (60 + f.n * 2 - 69) / 12), 0.15, { type: 'triangle', vol: 0.08, delay: 0.4 });
    if (f.n >= 8) W.after(500, () => { f.full = W.t + 2500; A.sfx('cheer'); W.bigText('アイス タワー！', f.x, f.y - 520, '#ff6f91'); spark(f.x, f.y - 500, '#ffd23f', 14); });
  };
  T('icecreamshop', 's6_icetower', 'd6_icetower', (f) => { addScoop(f); lineUp(f, ['ぽこっ！', 'たかーい！']); }, (ch, f) => { addScoop(f); R.claim(ch, 4500).go(f.x + 140, f.y + 20, true).look(f.x).do(() => addScoop(f)).hold('icecream').pose('eat', 1400).say('つめたくて おいしい！', 'icecream', 1500, 'yay').unhold(); });
  function soft(f, ch) {
    f.swirl = W.t + 2000; A.sfx('bubble'); W.after(2000, () => { A.sfx('ding'); if (!ch) pop('icecream', f.x + 150, f.y + 40); });
    if (ch) R.claim(ch, 5000).go(f.x + 150, f.y + 20, true).look(f.x).pose('hold', 1800).hold('icecream').face('love', 1000).say('くるくる ソフト！', 'icecream', 1400, 'yay').pose('eat', 1200).unhold();
  }
  T('icecreamshop', 's6_softserve', 'd6_softserve', (f, w) => { soft(f, w); if (!w) lineUp(f, ['くるくる〜！', 'たべたい！']); }, 'tap');
  T('icecreamshop', 's6_parfait', 'd6_parfait', (f) => {
    const L = f.lay == null ? 3 : f.lay; f.lay = L >= 6 ? 1 : L + 1; f.add = W.t + 500; A.sfx('place');
    if (f.lay === 6) W.after(500, () => { A.sfx('magic'); spark(f.x, f.y - 400, '#ff6f91', 14); W.bigText('パフェ かんせい！', f.x, f.y - 460, '#ff6f91'); });
    lineUp(f, ['かさねて かさねて〜', 'おいしそう！']);
  }, (ch, f) => {
    if ((f.lay == null ? 3 : f.lay) < 4) f.lay = 6;
    R.claim(ch, 5500).go(f.x + 130, f.y + 20, true).look(f.x).say('いただきます！', 'heart', 1000, 'yay').do(() => { f.eat = W.t + 2400; A.sfx('munch'); W.after(1000, () => A.sfx('munch')); }).face('eat', 2000).pose('eat', 2000).do(() => { f.lay = 0; }).face('love', 1000).say('ごちそうさま！', 'star', 1300, 'yay');
    W.after(5000, () => { if (f.lay === 0) f.lay = 1; });
  });

  /* 70 おはなやさん */
  D('d6_bouquet', 'はなたばの プレゼント', 'おはなを あつめて はなたばを つくろう', ['s6_bouquet', 'rose'], 'flowershop');
  D('d6_bloom', 'いっせいに さいた', 'おはなが いっせいに さいて ちょうちょが くる', ['s6_flowerstand', 'flower'], 'flowershop');
  D('d6_sunflower', 'ぐんぐん ひまわり', 'みずを あげると ひまわりが ぐんぐん のびる', ['s6_bigpot', 'wateringcan'], 'flowershop');
  T('flowershop', 's6_bouquet', 'd6_bouquet', (f) => {
    const nb = f.nb == null ? 2 : f.nb;
    if (nb >= 5) { f.nb = 1; f.add = W.t + 500; A.sfx('pop'); return; }
    f.nb = nb + 1; f.add = W.t + 500; A.sfx('place');
    if (f.nb >= 5) { f.wrap = W.t + 2500; W.after(500, () => { A.sfx('jingle'); pop('rose', f.x + 170, f.y + 40); W.bigText('はなたば！', f.x, f.y - 320, '#ff6f91'); }); lineUp(f, ['はなたば できた！', 'きれい〜！']); }
  }, (ch, f) => {
    f.nb = 5; f.wrap = W.t + 2500; A.sfx('jingle');
    const to = near(f, 1, 3000, [ch])[0];
    const a = R.claim(ch, 7000).go(f.x + 150, f.y + 20, true).hold('rose').say('はなたば できた！', 'rose', 1200, 'yay');
    if (to) { a.to(to, 90, 0, true).look(to.x).say('どうぞ！', 'heart', 1200, 'yay').unhold().do(() => { hearts(to.x, to.y - 180, 6); R.claim(to, 3000).face('love', 1500).hold('rose').say('ありがとう！', 'heart', 1400, 'yay').pose('hug', 1000).unhold(); }); }
    else a.pose('spin', 900).unhold();
  });
  T('flowershop', 's6_flowerstand', 'd6_bloom', (f) => { f.bloom = W.t + 2600; A.sfx('sparkle'); W.burst('leaf', f.x, f.y - 200, 12, { up: true, sp: 0.18, col: '#ffb3d1' }); lineUp(f, ['さいた さいた！', 'ちょうちょ だ！']); }, (ch, f) => {
    f.bloom = W.t + 2600; A.sfx('sparkle');
    R.claim(ch, 4500).go(f.x + 200, f.y + 20, true).look(f.x).pose('think', 900).face('love', 1400).say('いい におい〜', 'flower', 1500, 'yay').pose('spin', 800); W.burst('leaf', f.x, f.y - 200, 10, { up: true, sp: 0.15, col: '#ffd1e0' });
  });
  function water(f, ch) {
    f.water = W.t + 1600; A.sfx('splash');
    W.after(1500, () => { const g = f.g == null ? 1 : f.g; if (g >= 3) { f.g = 0; f.grow = W.t + 1000; A.sfx('pop'); return; } f.g = g + 1; f.grow = W.t + 1000; A.sfx('magic'); spark(f.x, f.y - 200 - f.g * 80, '#ffd23f', 10); if (f.g === 3) W.after(700, () => W.bigText('おおきく なった！', f.x, f.y - 470, '#ff9f4a')); });
    if (ch) R.claim(ch, 4500).go(f.x - 150, f.y + 20, true).look(f.x).hold('wateringcan').pose('hold', 1600).unhold().face('love', 1000).say('ぐんぐん のびた！', 'sunflower', 1400, 'yay');
  }
  T('flowershop', 's6_bigpot', 'd6_sunflower', (f, w) => { water(f, w); if (!w) lineUp(f, ['のびて〜！', 'ひまわり さん！']); }, 'tap');

  /* 71 ペットショップ */
  D('d6_puppy', 'しっぽ ふりふり', 'こいぬを なでると しっぽを ふって ワン！', ['s6_puppypen', 'lulu'], 'petshop');
  D('d6_petfish', 'さかなに ごはん', 'すいそうに えさを あげると さかなが あつまる', ['s6_fishtank', 'goldfish'], 'petshop');
  D('d6_hamster', 'ハムスター がんばれ', 'まわしぐるまが くるくる くるくる', ['s6_hamster'], 'petshop');
  const bark = () => { A.tone(700, 0.1, { type: 'square', vol: 0.06, slide: 0.7 }); A.tone(760, 0.1, { type: 'square', vol: 0.06, slide: 0.7, delay: 0.25 }); };
  T('petshop', 's6_puppypen', 'd6_puppy', (f) => { f.wag = W.t + 2600; bark(); hearts(f.x, f.y - 150, 4); lineUp(f, ['かわいい〜！', 'しっぽ ふってる！']); }, (ch, f) => {
    f.wag = W.t + 3200; bark(); W.after(1200, bark);
    R.claim(ch, 4500).go(f.x + 40, f.y + 40, true).pose('hug', 1400).face('laugh', 1400).say('くすぐったい〜！', 'heart', 1500, 'laugh').pose('jump', 700); hearts(f.x, f.y - 160, 6);
  });
  T('petshop', 's6_fishtank', 'd6_petfish', (f) => { f.feed = W.t + 3000; A.sfx('bubble'); W.after(400, () => A.sfx('bubble')); lineUp(f, ['ごはんだよ〜', 'あつまってきた！']); }, (ch, f) => {
    f.look = W.t + 3000; A.sfx('bubble');
    R.claim(ch, 4500).go(f.x + 40, f.y + 40, true).look(f.x).face('love', 1500).say('こっちに きたよ！', 'goldfish', 1500, 'yay').pose('wave', 900);
  });
  T('petshop', 's6_hamster', 'd6_hamster', (f) => { f.run = W.t + 3000; A.sfx('tickle'); for (let i = 0; i < 8; i++) A.tone(1200, 0.04, { type: 'square', vol: 0.025, delay: i * 0.3 }); lineUp(f, ['はやーい！', 'がんばれ〜！']); }, (ch, f) => {
    f.run = W.t + 3500; A.sfx('tickle');
    R.claim(ch, 5000).go(f.x + 170, f.y + 20, true).look(f.x).say('がんばれ〜！', '!', 1200, 'yay').pose('run', 1500).face('laugh', 1000).say('いっしょに はしった！', 'star', 1300, 'laugh');
  });

  /* 72 テレビきょく */
  D('d6_onair', 'ON AIR！', 'カメラの まえで ポーズ！ テレビに でちゃった', ['s6_tvcamera', 'camera'], 'tvstudio');
  D('d6_news', 'ニュースの じかん', 'つくえに すわって ニュースを よもう', ['s6_newsdesk'], 'tvstudio');
  D('d6_weather', 'てんきよほう', 'ボードを タップすると はれ・あめ・ゆき・にじ', ['s6_weatherboard', 'umbrella'], 'tvstudio');
  T('tvstudio', 's6_tvcamera', 'd6_onair', (f) => {
    f.onair = W.t + 4000; A.sfx('ding'); W.bigText('ON AIR!', f.x, f.y - 380, '#e2433b');
    W.chars().forEach((ch, i) => { if (W.isFree(ch)) R.claim(ch, 4000).wait(300 + i * 120).look(f.x).pose(PT.pick(['cheer', 'point', 'spin', 'wave']), 1200).say(PT.pick(['はーい！', 'みてる〜？', 'ピース！']), 'star', 1300, 'yay'); });
  }, (ch, f) => {
    f.onair = W.t + 4500; A.sfx('ding');
    R.claim(ch, 5500).go(f.x + 300, f.y + 20, true).look(f.x).do(() => { W.bigText('ON AIR!', f.x, f.y - 380, '#e2433b'); spark(ch.x, ch.y - 120, '#ffd23f', 14); A.sfx('cheer'); }).pose('spin', 900).pose('cheer', 900).say('テレビに でたよ〜！', 'camera', 1500, 'yay').face('love', 1000);
  });
  function news(f, ch) {
    f.news = W.t + 6000; tune([72, 76, 79, 84], 0.18, 'sine', 0.1);
    if (ch) R.claim(ch, 6500).go(f.x - 20, f.y - 14, true).do(() => { ch.stay = true; ch.flip = false; }).pose('sit', 400).say('ニュースです！', null, 1400, 'talk').say('きょうは はれ！ げんきに あそぼう！', 'star', 2000, 'yay').do(() => { ch.stay = false; back(ch, f, 220); });
  }
  T('tvstudio', 's6_newsdesk', 'd6_news', (f, w) => news(f, who(f, w)), 'tap');
  function weather(f) {
    f.wx = ((f.wx || 0) + 1) % 4; f.change = W.t + 700; A.sfx('pop');
    if (f.wx === 0) { A.sfx('sparkle'); X.sparkleRain && X.sparkleRain(1800); }
    else if (f.wx === 1) { A.sfx('splash'); for (let i = 0; i < 4; i++) W.after(i * 200, () => W.burst('drop', PT.rand(200, 1400), 120, 8, { sp: 0.05, g: 0.0012, max: 1200 })); }
    else if (f.wx === 2) { A.sfx('jingle'); for (let i = 0; i < 4; i++) W.after(i * 250, () => W.burst('spark', PT.rand(200, 1400), 100, 8, { sp: 0.06, g: 0.0003, max: 1800, col: '#ffffff' })); }
    else { A.sfx('magic'); X.rainbow && X.rainbow(4000); }
    return ['はれ', 'あめ', 'ゆき', 'にじ'][f.wx];
  }
  T('tvstudio', 's6_weatherboard', 'd6_weather', (f) => { const s = weather(f); lineUp(f, [s + ' だって！', 'わあ〜！']); }, (ch, f) => {
    R.claim(ch, 5000).go(f.x - 210, f.y + 20, true).look(f.x).pose('point', 900).do(() => { const s = weather(f); W.say(ch, 'あしたは ' + s + ' でしょう！', 'star', 1800, 'yay'); }).wait(1900).pose('cheer', 800);
  });

  const O = (stage, text, goals, hint) => ({ id: stage + ':' + text, stage, text, goals, hint });
  (PT.ODAI2 = PT.ODAI2 || []).push(
    O('library', 'としょかんで ほんを たのしもう', ['d6_popbook', 'd6_bookfly', 'd6_storytime'], ['s6_bigbook']),
    O('atelier', 'アトリエで げいじゅつか', ['d6_easel', 'd6_paints', 'd6_clay'], ['s6_easel']),
    O('musicroom', 'みんなで えんそうかい', ['d6_piano', 'd6_bells', 'd6_conductor'], ['s6_grandpiano']),
    O('policestation', 'おまわりさんに なろう', ['d6_patlamp', 'd6_signal', 'd6_lostfound'], ['s6_patrolcar']),
    O('postoffice', 'おてがみを とどけよう', ['d6_postbox', 'd6_stamp', 'd6_delivery'], ['s6_postbox']),
    O('construction', 'こうじげんばで はたらこう', ['d6_excavator', 'd6_crane', 'd6_mixer'], ['s6_excavator']),
    O('hairsalon', 'びよういんで おしゃれ', ['d6_haircut', 'd6_afro', 'd6_shampoo'], ['s6_salonchair']),
    O('ramen', 'ラーメンやさんを ひらこう', ['d6_ramen', 'd6_yugiri', 'd6_charumera'], ['s6_ramenbowl']),
    O('icecreamshop', 'アイスやさんで ひんやり', ['d6_icetower', 'd6_softserve', 'd6_parfait'], ['s6_icetower']),
    O('flowershop', 'おはなやさんで はなたば', ['d6_bouquet', 'd6_bloom', 'd6_sunflower'], ['s6_bouquet']),
    O('petshop', 'ペットと なかよく なろう', ['d6_puppy', 'd6_petfish', 'd6_hamster'], ['s6_puppypen']),
    O('tvstudio', 'テレビに でよう', ['d6_onair', 'd6_news', 'd6_weather'], ['s6_tvcamera']),
  );
})();
