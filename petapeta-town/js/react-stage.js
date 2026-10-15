/* ステージごとの遊具・場所の反応 */
'use strict';
(() => {
  const W = PT.world, R = PT.R, D = R.D, X = PT.FX;
  const { isP, isC, tag, nearP, nearF, firstP, role } = R.h;
  const onFix = (c, type) => (c.tgt && c.tgt.kind === 'fix' && (Array.isArray(type) ? type.includes(c.tgt.type) : c.tgt.type === type) ? c.tgt : null);
  const tapFix = (c, type) => (c.e.kind === 'fix' && (Array.isArray(type) ? type.includes(c.e.type) : c.e.type === type) ? c.e : null);
  const fixOf = (type) => W.fixes().find((f) => f.type === type);

  /* ================= 1 みんなの おうち ================= */
  D('d_sofa', 'ソファで ぴょんぴょん', 'ソファに のせると ぴょんぴょん！ミミは ちょっと こまりがお', ['sofa', 'pon'], 'home');
  D('d_toybox', 'おもちゃばこ', 'おもちゃばこを タップすると なにかが とびだす', ['toybox'], 'home');
  R.sofa = (ch, f) => {
    const sx = f.x + PT.rand(-80, 80);
    R.claim(ch, 6000).go(sx, f.y + 10, true).do(() => { ch.x = sx; ch.y = f.y - 30; ch.stay = true; ch.baseZ = 60; ch.z = 60; })
      .jump(80, 520).sfx('boing').jump(90, 520).sfx('boing').jump(100, 520).sfx('boing').say('ぴょんぴょん！', 'star', 1300, 'yay')
      .do(() => { ch.baseZ = 0; ch.z = 0; ch.stay = false; const p = W.clampFloor(ch.x, f.y + 60); ch.y = p.y; ch.scale = W.depthScale(ch.y); R.found('d_sofa'); });
    const m = W.charOf('mimi');
    if (m && m !== ch && R.chars().includes(m)) W.after(900, () => R.claim(m, 3000).look(f.x).face('puzzled', 1200).say('おぎょうぎ わるいよ〜', null, 1500, 'hmm').face('laugh', 1200).say('でも たのしそう！', null, 1300, 'laugh').pose('jump', 400));
    else R.mimic(ch, 'jump', 1400, 'わたしも ぴょん！');
  };
  R.add({ id: 'sofa-char', pri: 76, stage: 'home', test: (c) => (isC(c.e) ? onFix(c, 'sofa') : null), run(c, f) { R.sofa(c.e, f); } });
  R.add({ id: 'sofa-tap', on: 'tapfix', pri: 50, stage: 'home', test: (c) => (tapFix(c, 'sofa') ? R.one(c.e.x, c.e.y) : null), run(c, ch) { R.sofa(ch, c.e); } });
  R.toybox = (f) => {
    f.open = W.t + 1300; PT.audio.sfx('pop');
    const it = PT.pick(['ball', 'dino', 'teddy', 'bunny', 'train', 'car', 'book', 'music', 'drum', 'bubbles']);
    const p = W.clampFloor(f.x + PT.rand(-200, 120), f.y + PT.rand(40, 140));
    const pr = W.addProp(it, f.x, f.y - 60);
    const sx = f.x, sy = f.y - 60;
    pr.pop = W.t;
    R.tween(pr, 700, (k) => { pr.x = PT.lerp(sx, p.x, k); pr.y = PT.lerp(sy + 60, p.y, k); pr.z = Math.sin(k * Math.PI) * 160 + (1 - k) * 60; pr.scale = W.depthScale(pr.y); }, () => {
      pr.z = 0; PT.audio.sfx('place');
      const ch = R.free(pr.x, pr.y, [], 1200)[0];
      if (ch) R.claim(ch, 2400).look(pr.x).face('surprise', 800).say('なにか でてきた！', it, 1400, 'wow').do(() => { if (!pr.def.oneShot) R.chain('drop', { e: pr, x: pr.x, y: pr.y }, 1200); else R.run('drop', { e: pr, x: pr.x, y: pr.y }); });
      R.found('d_toybox');
    });
  };
  R.add({ id: 'toybox-tap', on: 'tapfix', pri: 50, stage: 'home', test: (c) => tapFix(c, 'toybox'), run(c, f) { R.toybox(f); } });
  R.add({ id: 'toybox-char', pri: 76, stage: 'home', test: (c) => (isC(c.e) ? onFix(c, 'toybox') : null), run(c, f) { R.claim(c.e, 2500).go(f.x - 110, f.y + 30).look(f.x).pose('peek', 800).say('なにが あるかな？', '?', 1200).do(() => R.toybox(f)); } });

  /* ================= 2 わくわく こうえん ================= */
  D('d_swing', 'ブランコ ゆらゆら', 'ブランコに のせると ゆらゆら。おともだちが おしてくれる', ['swing', 'choco'], 'park');
  D('d_dig', 'すなばで ほりほり', 'すなばに キャラを おくと なにかを ほりあてる', ['sandbox', 'gaku'], 'park');
  D('d_splash', 'ぱしゃぱしゃ みずあそび', 'みずに キャラを おくと「つめたーい！」', ['pond', 'pon'], 'park');
  D('d_tree', 'きの うえの ことり', 'おおきな きを タップすると…ことりが とびだした', ['bigtree'], 'park');
  R.swing = (ch, f) => {
    f.swingA = f.swingA || [false, false];
    const i = f.swingA[0] ? (f.swingA[1] ? -1 : 1) : 0;
    if (i < 0) { R.claim(ch, 2000).go(f.x, f.y + 60).say('じゅんばん まってる！', null, 1300); return; }
    const sx = f.x + (i ? 60 : -60), topY = f.y - 286;
    R.claim(ch, 9000).go(sx, f.y + 6, true).do(() => {
      f.swingA[i] = true; ch.stay = true; ch.flip = false;
      R.tween(ch, 5000, (k) => { const a = Math.sin(W.t * 0.004 + i) * 0.45; ch.x = sx + Math.sin(a) * 236; ch.y = f.y - 2; ch.z = 300 - 236 * Math.cos(a) - 22 + 4; ch.pose = 'sit'; ch.face = 'laugh'; }, () => {
        f.swingA[i] = false; ch.z = 0; ch.x = sx; ch.y = f.y + 40; ch.face = 'happy'; ch.stay = false; ch.scale = W.depthScale(ch.y);
        R.claim(ch, 1500).say('たのしかった！', 'star', 1300, 'yay').pose('cheer', 700); R.found('d_swing');
      });
    });
    const pusher = R.free(f.x, f.y, [ch], 1200)[0];
    if (pusher) W.after(900, () => R.claim(pusher, 5000).go(sx - 120, f.y + 50, true).look(sx).say('おすよー！', null, 1200, 'yay').pose('hold', 900).pose('cheer', 600).pose('hold', 900).say('もっと たかく！', null, 1200).face('laugh', 1200));
  };
  R.add({ id: 'swing-char', pri: 76, stage: 'park', test: (c) => (isC(c.e) ? onFix(c, 'swing') : null), run(c, f) { R.swing(c.e, f); } });
  R.add({ id: 'swing-tap', on: 'tapfix', pri: 50, stage: 'park', test: (c) => (tapFix(c, 'swing') ? R.one(c.e.x, c.e.y) : null), run(c, ch) { R.swing(ch, c.e); } });
  R.slideFix = (ch, f) => {
    const lx = f.x - 90, ly = f.y + 4;
    R.claim(ch, 9000).go(lx, ly, true).do(() => {
      ch.flip = false; ch.stay = true;
      R.tween(ch, 1100, (k) => { ch.x = lx; ch.y = ly; ch.z = k * 238; ch.pose = 'carry'; ch.poseT = k * 1200; }, () => {
        R.tween(ch, 400, (k) => { ch.x = lx + k * 60; ch.z = 238; ch.pose = 'sit'; }, () => {
          PT.audio.sfx('slide');
          R.tween(ch, 1100, (k) => { const e = PT.easeInOut(k); ch.x = lx + 60 + e * 190; ch.z = 238 * Math.pow(1 - e, 1.6); ch.pose = 'slide'; ch.face = 'laugh'; }, () => {
            ch.z = 0; ch.face = 'happy'; ch.stay = false;
            R.claim(ch, 2000).say(PT.pick(['すいー！', 'もういっかい！', 'はやーい！']), 'star', 1300, 'yay').pose('cheer', 700).do(() => R.found('d_slide'));
          });
        });
      });
    });
  };
  R.add({ id: 'slidefix-char', pri: 76, stage: 'park', test: (c) => (isC(c.e) ? onFix(c, 'slideP') : null), run(c, f) { R.slideFix(c.e, f); } });
  R.add({ id: 'slidefix-tap', on: 'tapfix', pri: 50, stage: 'park', test: (c) => (tapFix(c, 'slideP') ? R.free(c.e.x, c.e.y, [], 2000).slice(0, 2) : null), run(c, list) { list.forEach((ch, i) => W.after(i * 2600, () => R.chars().includes(ch) && R.slideFix(ch, c.e))); } });
  R.add({ id: 'dig', pri: 74, stage: ['park', 'beach'], test: (c) => (isC(c.e) && (onFix(c, 'sandbox') || (W.stage.id === 'beach' && !c.tgt && !c.area && c.y > 660 && Math.random() < 0.4)) ? 1 : null),
    run(c) {
      const ch = c.e;
      R.claim(ch, 6000).say('ほりほり…', null, 1200).pose('peek', 900).do(() => X.dig(ch.x + 30, ch.y)).pose('peek', 900).do(() => X.dig(ch.x + 30, ch.y))
        .do(() => { const it = W.addProp(PT.pick(['shell', 'present', 'dino', 'ball', 'acorn']), ch.x + 50, ch.y + 6, { temp: true }); it.pop = W.t; PT.audio.sfx('discover'); W.burst('star', it.x, it.y - 30, 8, { up: true }); })
        .face('surprise', 900).say('なにか でてきた！', '!', 1400, 'wow').pose('cheer', 900).do(() => R.found('d_dig'));
    } });
  R.splashIn = (ch, w) => {
    const px = PT.clamp(ch.x, w.x - w.w * 0.35, w.x + w.w * 0.35);
    R.claim(ch, 5000).do(() => { ch.x = px; ch.y = w.y - 40; ch.rest = 'swim'; ch.stay = true; X.splash(ch.x, ch.y); })
      .face('surprise', 900).say('つめたーい！', 'sweat', 1300, 'wow').pose('swim', 1500).face('laugh', 1500).say('ぱしゃぱしゃ！', null, 1200, 'laugh')
      .do(() => { X.splash(ch.x, ch.y); ch.rest = 'idle'; ch.stay = false; const p = W.clampFloor(ch.x + 40, w.y + 50); ch.x = p.x; ch.y = p.y; ch.scale = W.depthScale(ch.y); }).jump(60, 500).do(() => R.found('d_splash'));
    R.audience(ch.x, ch.y, [ch], 'laugh', 1, 800);
  };
  R.add({ id: 'pond-char', pri: 74, stage: ['park', 'camp'], test: (c) => (isC(c.e) ? onFix(c, ['pond', 'river']) : null), run(c, w) { R.splashIn(c.e, w); } });
  R.add({ id: 'tree-tap', on: 'tapfix', pri: 50, stage: 'park', test: (c) => tapFix(c, 'bigtree'),
    run(c, f) {
      f.wobbleUntil = W.t + 900; PT.audio.sfx('whoosh');
      for (let i = 0; i < 8; i++) W.fx.push({ type: 'leaf', x: f.x + PT.rand(-100, 100), y: f.y - PT.rand(250, 340), vx: PT.rand(-0.04, 0.04), vy: PT.rand(0.03, 0.08), life: 0, max: 2500, size: 18, col: PT.pick(['#6dbb5f', '#9ad07a', '#ffd23f']), rot: PT.rand(0, 6), vr: 0.004, g: 0 });
      X.critter('bird', [[f.x + 20, f.y - 300, 1], [f.x + 20, f.y - 300, 500], [f.x + 500, f.y - 420, 1600], [f.x + 900, f.y - 360, 1600]], { col: '#ff8fab' });
      R.avail(f.x, f.y, [], 1200).slice(0, 2).forEach((ch, i) => R.claim(ch, 3000).wait(400 + i * 200).look(f.x + 400).face('surprise', 900).say(i ? 'まってー！' : 'ことりさん！', 'heart', 1400, 'wow').pose('point', 1200));
      W.after(800, () => { PT.audio.sfx('tickle'); R.found('d_tree'); });
    } });

  /* ================= 3 まちの おみせやさん ================= */
  D('d_register', 'レジで ちーん', 'レジを タップすると てんいんさんが やってくる', ['counter', 'mimi'], 'shop');
  D('d_shelf', 'しなだし', 'たべものを たなに おくと おきゃくさんが かいにくる', ['shelf', 'banana'], 'shop');
  D('d_bananabday', 'くまさんへの プレゼント', 'かった バナナを ぬいぐるみに プレゼント → おたんじょうびかいに！', ['banana', 'teddy', 'cake'], 'shop');
  D('d_cart', 'カートで GO', 'カートに のせると おともだちが おしてくれる', ['cart', 'choco'], 'shop');
  R.add({ id: 'register-tap', on: 'tapfix', pri: 50, stage: 'shop', test: (c) => tapFix(c, 'counter'),
    run(c, f) {
      PT.audio.sfx('bell'); W.bigText('ちーん！', f.x + 86, f.y - 220, '#ff6f61'); f.price = PT.pick(['100', '120', '50', '300']);
      const k = role('shop') || R.one(f.x, f.y, [], 'mimi');
      if (k && !k.wear.body) R.wear(k, 'apron', {}, true);
      if (k) R.shopOpen(k);
      W.after(600, () => R.found('d_register'));
    } });
  R.add({ id: 'counter-char', pri: 76, stage: 'shop', test: (c) => (isC(c.e) ? onFix(c, 'counter') : null), run(c) { if (!c.e.wear.body) R.wear(c.e, 'apron', {}, true); R.shopOpen(c.e); } });
  R.add({ id: 'shelf-food', pri: 80, stage: 'shop', test: (c) => (c.e.kind === 'prop' && c.e.def.food ? onFix(c, 'shelf') || (nearF(c.e.x, c.e.y, 200, 'shelf')[0] || null) : null),
    run(c, f) {
      const food = c.e;
      food.x = f.x + PT.rand(-90, 90); food.y = f.y + 6; food.z = 70; food.scale = 0.9; food.pop = W.t;
      PT.audio.sfx('place');
      const cu = R.one(f.x, f.y);
      if (!cu) return;
      R.claim(cu, 9000).wait(500).go(food.x - 60, f.y + 40, true).look(food.x).face('surprise', 800).say('おいしそうな ' + food.def.name + '！', food.type, 1500, 'wow')
        .hold(food.type).do(() => { W.remove(food); PT.audio.sfx('bell'); W.bigText('ちーん！', f.x, f.y - 260, '#ff6f61'); }).say('かいました！', 'heart', 1300, 'yay').pose('cheer', 700)
        .do(() => {
          R.found('d_shelf');
          const pl = nearP(cu.x, cu.y, 2000, (p) => tag(p, 'plush'))[0];
          if (pl) {
            W.act(cu).to(pl, -70, 4, true).look(pl.x).say((pl.type === 'teddy' ? 'くまさん' : 'うさぎさん') + 'に プレゼント！', food.type, 1600, 'yay').unhold()
              .do(() => { const f2 = W.addProp(food.type, pl.x + 40, pl.y + 4, { temp: true }); f2.pop = W.t; const cake = W.addProp('cake', pl.x - 50, pl.y + 10, { temp: true }); cake.pop = W.t; R.bday(cake, [pl]); R.found('d_bananabday'); });
          } else W.act(cu).face('eat', 1200).pose('eat', 1200).unhold().face('laugh', 1000);
        });
    } });
  R.cartRide = (ch, f) => {
    const pusher = R.free(f.x, f.y, [ch], 1500)[0];
    const cx = f.x, cy = f.y;
    R.claim(ch, 9000).go(f.x, f.y - 2, true).do(() => {
      ch.stay = true; ch.z = 40; ch.rest = 'ride';
      if (pusher) R.claim(pusher, 9000).go(f.x - 90, f.y + 2, true).say('しゅっぱーつ！', null, 1200, 'yay');
      const tgt = W.randFloor(260);
      W.after(1200, () => {
        R.tween(f, 2600, (k) => { const e = Math.sin(k * Math.PI); f.x = PT.lerp(cx, tgt.x, e); f.y = PT.lerp(cy, tgt.y, e); ch.x = f.x; ch.y = f.y - 2; ch.z = 40; ch.pose = 'cheer'; ch.face = 'laugh'; if (pusher && !pusher.cur) { pusher.x = f.x - 90; pusher.y = f.y + 2; pusher.pose = 'run'; } }, () => {
          ch.z = 0; ch.rest = 'idle'; ch.stay = false; ch.face = 'happy'; const p = W.clampFloor(f.x + 90, f.y + 20); ch.x = p.x; ch.y = p.y;
          R.claim(ch, 1500).say('はやかった！', 'star', 1200, 'yay'); if (pusher) R.claim(pusher, 1500).face('laugh', 1000); R.found('d_cart');
        });
      });
    });
  };
  R.add({ id: 'cart-char', pri: 76, stage: 'shop', test: (c) => (isC(c.e) ? onFix(c, 'cart') : null), run(c, f) { R.cartRide(c.e, f); } });
  R.add({ id: 'cart-tap', on: 'tapfix', pri: 50, stage: 'shop', test: (c) => (tapFix(c, 'cart') ? R.one(c.e.x, c.e.y, [], 'choco') : null), run(c, ch) { R.cartRide(ch, c.e); } });

  /* ================= 4 ビーチ ================= */
  D('d_sea', 'うみで ちゃぷちゃぷ', 'うみに キャラを おくと なみと あそぶ', ['sea', 'lulu'], 'beach');
  D('d_splashbow', 'みずしぶきの にじ', 'みずを ぱしゃっ！しぶきに ちいさな にじが かかった', ['sea', 'rainbow'], 'beach');
  D('d_wave', 'なみが きた！', 'すなの おしろに なみが ざぶーん。「もういっかい つくろう！」', ['castle', 'sea'], 'beach');
  D('d_crab', 'カニさん よこあるき', 'いわを タップすると カニさんが でてくる。みんなで よこあるき', ['rock'], 'beach');
  R.add({ id: 'sea-char', pri: 76, stage: 'beach', test: (c) => (isC(c.e) && (onFix(c, 'sea') || c.y < 600) ? fixOf('sea') : null),
    run(c, sea) {
      const ch = c.e;
      const px = PT.clamp(ch.x, 200, 1400);
      R.claim(ch, 7000).do(() => { ch.x = px; ch.y = sea.y - 50; ch.rest = 'swim'; ch.stay = true; X.splash(px, ch.y); })
        .say('うみだー！', 'star', 1300, 'yay').pose('swim', 1400).do(() => { X.splash(ch.x, ch.y); X.splash(ch.x + 60, ch.y - 10); })
        .face('laugh', 1500).say('ぱしゃっ！', null, 1000, 'laugh').do(() => {
          if (Math.random() < 0.6) { W.special({ type: 'mini-bow', x: ch.x, y: ch.y - 90, max: 3000, draw(c2, f, k) { ['#ff6b6b', '#ffa94d', '#ffd84a', '#69db7c', '#4dabf7', '#9775fa'].forEach((col, i) => { c2.strokeStyle = col; c2.lineWidth = 7; c2.beginPath(); c2.arc(f.x, f.y + 40, 90 - i * 7, Math.PI, 0); c2.stroke(); }); } }); PT.audio.sfx('sparkle'); W.act(ch).say('にじ！', 'rainbow', 1300, 'wow'); R.found('d_splashbow'); }
        })
        .wait(1500).do(() => { ch.rest = 'idle'; ch.stay = false; const p = W.clampFloor(ch.x, sea.y + 60); ch.x = p.x; ch.y = p.y; ch.scale = W.depthScale(ch.y); R.found('d_sea'); });
      R.audience(ch.x, ch.y, [ch], 'join', 1, 1500);
    } });
  R.add({ id: 'wave', on: 'wave', pri: 50, stage: 'beach', test: (c) => (c.e && c.e.type === 'castle' && !c.e.removed ? c.e : null),
    run(c, castle) {
      const kids = R.avail(castle.x, castle.y, [], 1200).slice(0, 2);
      X.wave(600, () => { castle.level = 1; castle.wobbleUntil = W.t + 800; kids.forEach((k) => R.claim(k, 4000).look(castle.x).face('surprise', 900).say('あー！', '!', 1100, 'wow').face('laugh', 1200).say('もういっかい つくろう！', 'castle', 1500, 'laugh').pose('peek', 900).do(() => { if (!castle.removed) { castle.level = 3; castle.pop = W.t; PT.audio.sfx('sparkle'); } })); R.found('d_wave'); });
    } });
  R.add({ id: 'crab-tap', on: 'tapfix', pri: 50, stage: 'beach', test: (c) => tapFix(c, 'rock'),
    run(c, f) {
      PT.audio.sfx('tickle');
      X.critter('crab', [[f.x, f.y + 10, 1], [f.x - 200, f.y + 40, 2200], [f.x - 400, f.y + 60, 2200], [f.x - 300, f.y + 20, 1600]]);
      const kids = R.avail(f.x, f.y, [], 1800).slice(0, 3);
      kids.forEach((ch, i) => R.claim(ch, 7000).wait(500 + i * 300).look(f.x).face('surprise', 900).say(i === 0 ? 'カニさん！' : 'よこあるき！', 'heart', 1400, 'wow').go(ch.x - 150, ch.y + 10).pose('march', 600).go(ch.x - 280, ch.y + 10).face('laugh', 1200).say('カニカニ！', null, 1200, 'laugh'));
      W.after(1500, () => R.found('d_crab'));
    } });

  /* ================= 5 キャンプ ================= */
  D('d_marsh', 'マシュマロ やき', 'たきびに あつまって マシュマロを やいたよ', ['campfire', 'marshmallow'], 'camp');
  D('d_constellation', 'ほしの せいざ', 'よぞらの ほしを タップすると せいざが みえる', ['star'], 'camp');
  D('d_campsong', 'キャンプの うた', 'まるたに すわって みんなで うたう', ['log', 'music'], 'camp');
  R.add({ id: 'tent-fix', on: 'tapfix', pri: 50, stage: 'camp', test: (c) => tapFix(c, 'tentF'), run(c, f) { R.camp(f, R.free(f.x, f.y, [], 2000).slice(0, 3)); } });
  R.add({ id: 'tent-fix-char', pri: 76, test: (c) => (isC(c.e) ? onFix(c, 'tentF') || (isP(c.tgt, 'tent') ? c.tgt : null) : null), run(c, f) { R.camp(f, [c.e].concat(R.free(f.x, f.y, [c.e], 1500).slice(0, 1))); } });
  R.marsh = (f) => {
    const kids = R.avail(f.x, f.y, [], 2500).slice(0, 4);
    kids.forEach((ch, i) => {
      const p = R.ring(f.x, f.y + 20, i, kids.length, 170);
      R.claim(ch, 8000).go(p.x, p.y, true).look(f.x).pose('sit', 300).hold('marshmallow').pose('sit', 2600).face('eat', 1500).say(i === 0 ? 'あまーい！' : i === 1 ? 'とろとろ〜' : '', 'heart', 1400, 'yay').pose('eat', 1400).unhold().face('laugh', 1200);
    });
    W.after(2800, () => { PT.audio.sfx('munch'); W.burst('spark', f.x, f.y - 100, 10, { up: true, sp: 0.2, max: 900, col: '#ffb02e', g: 0 }); R.found('d_marsh'); });
  };
  R.add({ id: 'fire-tap', on: 'tapfix', pri: 50, stage: 'camp', test: (c) => tapFix(c, 'campfire'), run(c, f) { R.marsh(f); } });
  R.add({ id: 'fire-char', pri: 76, stage: 'camp', test: (c) => (isC(c.e) ? onFix(c, 'campfire') : null), run(c, f) { R.marsh(f); } });
  R.add({ id: 'fire-food', pri: 78, stage: 'camp', test: (c) => (c.e.kind === 'prop' && c.e.def.food ? onFix(c, 'campfire') || nearF(c.e.x, c.e.y, 160, 'fire')[0] || null : null), run(c, f) { W.remove(c.e); R.marsh(f); } });
  const SHAPES = [['うさぎざ', 'bunny'], ['わんちゃんざ', 'lulu'], ['ケーキざ', 'cake'], ['ロケットざ', 'box'], ['おさかなざ', 'duck']];
  R.add({ id: 'skystar-tap', on: 'tapfix', pri: 50, test: (c) => tapFix(c, 'skystar'),
    run(c, f) {
      f.lit = W.t + 5000; PT.audio.sfx('sparkle');
      const stars = W.fixes().filter((s) => s.type === 'skystar').sort((a, b) => Math.hypot(a.x - f.x, a.y - f.y) - Math.hypot(b.x - f.x, b.y - f.y)).slice(0, 4);
      stars.forEach((s) => { s.lit = W.t + 5000; });
      const [name, icon] = PT.pick(SHAPES);
      X.constellation(stars.map((s) => [s.x, s.y]), name);
      R.avail(f.x, 700, [], 3000).slice(0, 3).forEach((ch, i) => R.claim(ch, 4500).wait(300 + i * 200).look(f.x).face('surprise', 900).say(i === 0 ? name + '！' : 'きれい〜', i === 0 ? icon : 'star', 1600, 'wow').pose('point', 1500).face('love', 1000));
      W.after(1500, () => R.found('d_constellation'));
    } });
  R.campSong = (f) => {
    const kids = R.avail(f.x, f.y, [], 2500).slice(0, 4);
    kids.forEach((ch, i) => { const p = W.clampFloor(f.x - 90 + (i % 2) * 180, f.y + (i < 2 ? -4 : 50)); R.claim(ch, 7000).go(p.x, p.y, true).look(f.x + (i % 2 ? -1 : 1) * 100).pose('sit', 400).say(i === 0 ? 'うたおう！' : '', 'note', 1200, 'yay').pose('dance', 3200).face('laugh', 1200).pose('sit', 900); });
    X.music(f.x, f.y - 120, 4500); PT.audio.sfx('piano');
    W.after(2000, () => R.found('d_campsong'));
  };
  R.add({ id: 'log-tap', on: 'tapfix', pri: 50, stage: 'camp', test: (c) => tapFix(c, 'log'), run(c, f) { R.campSong(f); } });
  R.add({ id: 'log-music', pri: 80, stage: 'camp', test: (c) => (isP(c.e, ['music', 'drum']) || isC(c.e) ? onFix(c, 'log') : null), run(c, f) { if (c.e.kind === 'prop' && c.e.type === 'drum') W.remove(c.e); R.campSong(f); } });

  /* ================= 6 ゆめの ゆうえんち ================= */
  D('d_ferris', 'かんらんしゃ', 'かんらんしゃに のせると ぐるーっと たかいところへ', ['ferris', 'mimi'], 'fun');
  D('d_carousel', 'メリーゴーラウンド', 'メリーゴーラウンドで くるくる', ['carousel', 'choco'], 'fun');
  D('d_concert', 'ステージで コンサート', 'ステージに のせたり おんがくを おくと コンサート', ['stageF', 'music'], 'fun');
  D('d_stallballoon', 'ふうせんやさん', 'ふうせんやさんを タップすると ふうせんを もらえる', ['stall', 'balloon'], 'fun');
  D('d_allparty', 'みんなで おいわい', 'いろんな あそびが いっぺんに おきたら、さいごは みんなで おいわい！', ['confetti', 'firework', 'lulu'], 'fun');
  R.ferris = (ch, f) => {
    R.claim(ch, 14000).go(f.x, f.y + 10, true).do(() => {
      ch.stay = true;
      const cx = f.x, cy = f.y - 320, Rr = 210;
      const a0 = Math.PI / 2;
      R.tween(ch, 7000, (k) => { const a = a0 + k * PT.TAU; ch.x = cx + Math.cos(a) * Rr; ch.y = f.y + 30; ch.z = (f.y + 30) - (cy + Math.sin(a) * Rr + 58); ch.pose = 'sit'; ch.scale = 0.62; ch.sortBias = 400; ch.face = k > 0.3 && k < 0.7 ? 'surprise' : 'laugh'; if (k > 0.45 && k < 0.47 && !ch._said) { ch._said = 1; W.say(ch, 'たかーい！', 'star', 1500, 'wow'); } }, () => {
        ch._said = 0; ch.z = 0; ch.sortBias = 0; ch.stay = false; ch.face = 'happy'; const p = W.clampFloor(f.x + 140, f.y + 40); ch.x = p.x; ch.y = p.y; ch.scale = W.depthScale(ch.y);
        R.claim(ch, 1500).say('いい けしきだった！', 'heart', 1400, 'yay').pose('cheer', 700); R.found('d_ferris');
      });
    });
  };
  R.add({ id: 'ferris-char', pri: 76, stage: 'fun', test: (c) => (isC(c.e) ? onFix(c, 'ferris') : null), run(c, f) { R.ferris(c.e, f); } });
  R.add({ id: 'ferris-tap', on: 'tapfix', pri: 50, stage: 'fun', test: (c) => (tapFix(c, 'ferris') ? R.one(c.e.x, c.e.y) : null), run(c, ch) { R.ferris(ch, c.e); } });
  R.carousel = (list, f) => {
    f.fast = true; PT.audio.sfx('jingle'); X.music(f.x, f.y - 300, 6000);
    list.forEach((ch, i) => {
      R.claim(ch, 12000).go(f.x + (i % 2 ? 1 : -1) * 120, f.y + 30, true).do(() => {
        ch.stay = true;
        R.tween(ch, 6500, (k) => { const a = k * PT.TAU * 2 + i * 2.1; ch.x = f.x + Math.cos(a) * 130; ch.y = f.y - 10 + Math.sin(a) * 16; ch.z = 40 + Math.sin(W.t * 0.004 + i) * 12; ch.sortBias = Math.sin(a) > 0 ? 20 : -60; ch.flip = Math.cos(a + 0.01) > 0; ch.pose = 'ride'; ch.face = 'laugh'; ch.scale = 0.8; }, () => {
          ch.z = 0; ch.sortBias = 0; ch.stay = false; ch.face = 'happy'; const p = W.clampFloor(f.x - 220 + i * 120, f.y + 60); ch.x = p.x; ch.y = p.y; ch.scale = W.depthScale(ch.y);
          R.claim(ch, 1500).say(i === 0 ? 'くるくる〜！' : 'めがまわる〜', 'star', 1300, 'yay').pose('spin', 800);
          if (i === 0) { f.fast = false; R.found('d_carousel'); }
        });
      });
    });
  };
  R.add({ id: 'carousel-char', pri: 76, stage: 'fun', test: (c) => (isC(c.e) ? onFix(c, 'carousel') : null), run(c, f) { R.carousel([c.e].concat(R.free(f.x, f.y, [c.e], 1500).slice(0, 1)), f); } });
  R.add({ id: 'carousel-tap', on: 'tapfix', pri: 50, stage: 'fun', test: (c) => tapFix(c, 'carousel'), run(c, f) { R.carousel(R.free(f.x, f.y, [], 2000).slice(0, 2), f); } });
  R.concert = (f, star) => {
    f.show = true; PT.audio.sfx('jingle'); X.music(f.x, f.y - 200, 6000);
    const perf = star || R.one(f.x, f.y, [], 'choco');
    if (!perf) return;
    R.claim(perf, 9000).go(f.x, f.y - 90, true).do(() => { perf.stay = true; perf.baseZ = 0; }).look(f.x + 1).say('みんな〜 いくよー！', 'note', 1500, 'yay').pose('dance', 4000).pose('cheer', 900).do(() => { f.show = false; perf.stay = false; const p = W.clampFloor(f.x, f.y + 60); perf.y = p.y; perf.scale = W.depthScale(perf.y); X.confetti(f.x); R.found('d_concert'); });
    R.free(f.x, f.y, [perf], 2500).slice(0, 4).forEach((ch, i) => { const p = W.clampFloor(f.x - 240 + i * 160, f.y + 120 + (i % 2) * 30); R.claim(ch, 9000).go(p.x, p.y, true).look(f.x).pose('cheer', 1500).say(i === 0 ? 'がんばれー！' : '', 'heart', 1400, 'yay').pose('dance', 3000).pose('cheer', 900); });
  };
  R.add({ id: 'stage-char', pri: 76, stage: 'fun', test: (c) => (isC(c.e) ? onFix(c, 'stageF') : null), run(c, f) { R.concert(f, c.e); } });
  R.add({ id: 'stage-tap', on: 'tapfix', pri: 50, stage: 'fun', test: (c) => tapFix(c, 'stageF'), run(c, f) { R.concert(f); } });
  R.add({ id: 'stage-music', pri: 82, stage: 'fun', test: (c) => (isP(c.e, ['music', 'drum']) ? onFix(c, 'stageF') || nearF(c.e.x, c.e.y, 300, 'stage')[0] || null : null), run(c, f) { if (c.e.type === 'drum') W.remove(c.e); R.concert(f); } });
  R.add({ id: 'stall-balloon', on: 'tapfix', pri: 50, stage: 'fun', test: (c) => (tapFix(c, 'stall') ? R.one(c.e.x, c.e.y) : null),
    run(c, ch) { const f = c.e; R.claim(ch, 4000).go(f.x - 40, f.y + 40, true).look(f.x).say('ふうせん ください！', 'balloon', 1300).do(() => { ch.holdType = 'balloon'; ch.balloonColor = PT.pick(['#ff5d78', '#58b9f0', '#ffd23f', '#9b6fd6']); PT.audio.sfx('pop'); }).face('laugh', 1200).say('ありがとう！', 'heart', 1300, 'yay').pose('cheer', 800).do(() => R.found('d_stallballoon')); } });
  R.allParty = () => {
    R.partyAt = W.t + 60000;
    W.bigText('みんなで おいわい！', 800, 300, '#ff6f61');
    PT.audio.sfx('cheer');
    const list = R.chars();
    list.forEach((ch, i) => { const p = R.ring(800, 760, i, list.length, 230); R.claim(ch, 7000).go(p.x, p.y, true).look(800).pose('dance', 3000).face('laugh', 2000).pose('cheer', 1200); });
    for (let i = 0; i < 6; i++) W.after(800 + i * 500, () => X.firework(PT.rand(300, 1300), PT.rand(120, 300)));
    W.after(1500, () => { X.confetti(800, 2500); R.found('d_allparty'); });
  };
  PT.bus.on('reaction', (id) => {
    if (W.stage.id !== 'fun' || W.t < R.partyAt || id === 'd_allparty') return;
    const ids = new Set(R.recent.filter((r) => W.t - r.t < 45000).map((r) => r.id));
    if (ids.size >= 3) W.after(2500, R.allParty);
  });

  /* ================= 7 どうぶつ びょういん ================= */
  D('d_bedrest', 'ベッドで ねんね', 'ぬいぐるみを ベッドに ねかせると おいしゃさんが みてくれる', ['bed', 'teddy', 'doctor'], 'clinic');
  D('d_medicine', 'おくすりの じかん', 'くすりの たなを タップすると おくすりごっこ', ['medshelf', 'gaku'], 'clinic');
  D('d_recover', 'げんきに なった おいわい', 'かんじゃさんが げんきに なったら みんなで おいわい', ['doctor', 'confetti'], 'clinic');
  const docOrMimi = (x, y) => { let d = role('doctor'); if (d) return d; d = R.one(x, y, [], 'mimi'); if (d) R.wear(d, 'doctor', {}, true); return d; };
  R.add({ id: 'bed-plush', pri: 82, stage: 'clinic', test: (c) => (c.e.kind === 'prop' && tag(c.e, 'plush') ? onFix(c, 'bed') || nearF(c.e.x, c.e.y, 180, 'bed')[0] || null : null),
    run(c, bed) {
      const p = c.e; p.x = bed.x - 60; p.y = bed.y + 2; p.z = 60; p.scale = 0.9; p.pop = W.t; p.keep = true;
      const doc = docOrMimi(bed.x, bed.y);
      if (!doc) return;
      R.claim(doc, 2000).say('ねんね してね', 'heart', 1400).do(() => R.checkup(doc, p));
      W.after(5500, () => { p.z = 0; p.y = bed.y + 40; p.scale = W.depthScale(p.y); R.found('d_bedrest'); X.confetti(bed.x, 1200); R.found('d_recover'); R.audience(bed.x, bed.y, [doc], 'cheer', 2); });
    } });
  R.add({ id: 'bed-char', pri: 76, stage: 'clinic', test: (c) => (isC(c.e) ? onFix(c, 'bed') : null),
    run(c, bed) {
      const ch = c.e;
      R.claim(ch, 7000).do(() => { ch.x = bed.x - 20; ch.y = bed.y - 2; ch.z = 50; ch.stay = true; ch.rest = 'sleep'; }).face('sleep', 2000).say('ちょっと おねつ…', 'sweat', 1500, 'hmm');
      const doc = docOrMimi(bed.x, bed.y);
      if (doc && doc !== ch) W.after(800, () => {
        R.claim(doc, 6000).go(bed.x + 130, bed.y + 20, true).look(bed.x).say('もしもし…', 'doctor', 1400).pose('hold', 1200).say('いたいの とんでけー！', 'star', 1500, 'yay').pose('cheer', 800);
        W.after(4200, () => { ch.rest = 'idle'; ch.z = 0; ch.stay = false; const p = W.clampFloor(bed.x, bed.y + 50); ch.y = p.y; ch.scale = W.depthScale(ch.y); R.claim(ch, 2500).jump(60, 500).face('laugh', 1500).say('げんきに なった！', 'heart', 1500, 'yay').pose('cheer', 900); X.confetti(bed.x, 1200); R.found('d_recover'); R.found('d_doctor'); });
      });
    } });
  R.add({ id: 'medshelf-tap', on: 'tapfix', pri: 50, stage: 'clinic', test: (c) => (tapFix(c, 'medshelf') ? R.free(c.e.x, c.e.y, [], 2000).slice(0, 3) : null),
    run(c, list) {
      const f = c.e;
      list.forEach((ch, i) => R.claim(ch, 5000).go(f.x - 160 + i * 90, f.y + 40, i === 0).look(f.x).say(i === 0 ? 'おくすりの じかん！' : i === 1 ? 'にがくない？' : 'いちごあじ！', i === 0 ? 'heart' : null, 1400, 'yay').pose('eat', 1000).face('laugh', 1200).pose('cheer', 700));
      W.props().filter((p) => tag(p, 'plush')).forEach((p) => { p.bandage = true; p.wobbleUntil = W.t + 1000; });
      PT.audio.sfx('sparkle');
      W.after(1500, () => R.found('d_medicine'));
    } });

  /* ================= 8 どきどき ようちえん ================= */
  D('d_blackboard', 'こくばんに おえかき', 'こくばんを タップすると えが かわって みんなで よむ', ['blackboard'], 'kinder');
  D('d_piano', 'ピアノで おうた', 'ピアノを ひくと みんなで うたう', ['piano', 'mimi'], 'kinder');
  D('d_taiso', 'みんなで たいそう', 'ようちえんで おんがくや たいこを ならすと たいそうの じかん', ['music', 'drum'], 'kinder');
  R.add({ id: 'board-tap', on: 'tapfix', pri: 50, stage: 'kinder', test: (c) => tapFix(c, 'blackboard'),
    run(c, f) {
      f.drawing = (f.drawing || 0) + 1; PT.audio.sfx('zap'); W.burst('spark', f.x - 110, f.y - 150, 10, { sp: 0.2, max: 700, col: '#ffffff', g: 0 });
      R.avail(f.x, 760, [], 2500).slice(0, 3).forEach((ch, i) => R.claim(ch, 3500).wait(i * 200).look(f.x).face('surprise', 700).say(i === 0 ? 'よめるよ！' : 'じょうず！', 'star', 1400, 'yay').pose('point', 1100).face('laugh', 1000));
      W.after(800, () => R.found('d_blackboard'));
    } });
  R.piano = (f, player) => {
    PT.audio.sfx('piano'); X.music(f.x, f.y - 180, 4000);
    const p = player || R.one(f.x, f.y, [], 'mimi');
    if (p) R.claim(p, 6000).go(f.x - 150, f.y + 20, true).look(f.x).pose('hold', 2600).say('ドレミ〜♪', 'note', 1600, 'yay').face('laugh', 1200);
    R.free(f.x, f.y, [p], 2500).slice(0, 3).forEach((ch, i) => { const q = W.clampFloor(f.x - 420 + i * 130, f.y + 100); R.claim(ch, 6000).go(q.x, q.y, true).look(f.x).pose('dance', 3000).say(i === 0 ? 'らら〜♪' : '', 'note', 1400, 'yay').pose('cheer', 700); });
    W.after(2000, () => R.found('d_piano'));
  };
  R.add({ id: 'piano-tap', on: 'tapfix', pri: 50, stage: 'kinder', test: (c) => tapFix(c, 'piano'), run(c, f) { R.piano(f); } });
  R.add({ id: 'piano-char', pri: 76, stage: 'kinder', test: (c) => (isC(c.e) ? onFix(c, 'piano') : null), run(c, f) { R.piano(f, c.e); } });
  R.add({ id: 'taiso', pri: 80, stage: 'kinder', test: (c) => (isP(c.e, ['music', 'drum']) ? 1 : null),
    run(c) {
      const m = c.e; if (m.type === 'music') { m.playing = true; X.music(m.x, m.y - 90, 6000); }
      PT.audio.sfx('jingle');
      const list = R.avail(800, 760).slice(0, 5);
      const lead = list.find((x) => x.cid === 'gaku') || list[0];
      list.forEach((ch, i) => {
        const p = W.clampFloor(500 + i * 150, 780 + (i % 2) * 30);
        const a = R.claim(ch, 9000).go(p.x, p.y, true).look(800).say(ch === lead ? 'たいそう はじめ！' : '', 'star', 1300, 'yay');
        ['cheer', 'wave', 'jump', 'spin', 'cheer'].forEach((ps) => (ps === 'jump' ? a.jump(50, 500) : a.pose(ps, 800)));
        a.face('laugh', 1000).say(ch === lead ? 'よく できました！' : '', 'heart', 1300, 'yay');
      });
      W.after(4000, () => { m.playing = false; R.found('d_taiso'); });
    } });

  /* ================= 9 ガタンゴトン えき ================= */
  D('d_trainarrive', 'でんしゃが きた', 'でんしゃを タップすると でんしゃが いったり きたり', ['trainF'], 'station');
  D('d_travel', 'でんしゃで おでかけ', 'でんしゃに のせると、おでかけして おみやげを もって かえってくる', ['trainF', 'present'], 'station');
  D('d_gate', 'かいさつ ピッ', 'かいさつに キャラを おくと ピッ！', ['gate', 'ticket'], 'station');
  D('d_bench', 'でんしゃを まつ', 'ベンチで まっていると でんしゃが くる', ['bench', 'choco'], 'station');
  R.trainMove = (f, to, ms = 2600, done) => {
    const from = f.offset || 0; PT.audio.sfx('train');
    R.tween(f, ms, (k) => { f.offset = PT.lerp(from, to, PT.easeInOut(k)); }, () => { f.offset = to; done && done(); });
  };
  R.add({ id: 'train-tap', on: 'tapfix', pri: 50, stage: 'station', test: (c) => (tapFix(c, 'trainF') && !c.e.inTween ? c.e : null),
    run(c, f) {
      if (Math.abs(f.offset || 0) > 10) { f.offset = -2200; R.trainMove(f, 0, 2600, () => { R.found('d_trainarrive'); R.avail(f.x, 760, [], 2500).slice(0, 2).forEach((ch, i) => R.claim(ch, 2500).look(f.x).say(i ? 'ガタンゴトン！' : 'でんしゃ きた！', 'star', 1400, 'yay').pose('wave', 1200)); }); }
      else { R.avail(f.x, 760, [], 2500).slice(0, 2).forEach((ch) => R.claim(ch, 2500).look(f.x).say('いってらっしゃーい', null, 1400, 'yay').pose('wave', 1600)); R.trainMove(f, 2200, 2600, () => { W.after(2500, () => { f.offset = -2200; R.trainMove(f, 0, 2600, () => R.found('d_trainarrive')); }); }); }
    } });
  R.add({ id: 'train-char', pri: 76, stage: 'station', test: (c) => (isC(c.e) ? onFix(c, 'trainF') : null),
    run(c, f) {
      const ch = c.e;
      if (Math.abs(f.offset || 0) > 10 || f.inTween) { R.claim(ch, 2500).go(f.x, f.y + 80).say('でんしゃ まだかな？', '?', 1500); return; }
      R.claim(ch, 12000).go(ch.x, f.y + 30, true).say('いってきまーす！', 'heart', 1300, 'yay').do(() => { ch.hidden = true; ch.stay = true; PT.audio.sfx('ding');
        R.trainMove(f, 2200, 2600, () => W.after(2000, () => { f.offset = -2200; R.trainMove(f, 0, 2600, () => {
          ch.hidden = false; ch.stay = false; ch.y = f.y + 60; ch.scale = W.depthScale(ch.y);
          R.claim(ch, 3000).say('ただいま！ おみやげ！', 'present', 1600, 'yay').pose('cheer', 900).do(() => { const g = W.addProp('present', ch.x + 60, ch.y + 6, { temp: true }); g.pop = W.t; R.found('d_travel'); });
          R.audience(ch.x, ch.y, [ch], 'cheer', 2);
        }); })); });
    } });
  R.add({ id: 'gate-char', pri: 76, stage: 'station', test: (c) => (isC(c.e) ? onFix(c, 'gate') : null),
    run(c, f) { const ch = c.e; R.claim(ch, 4000).go(f.x - 20, f.y + 40).do(() => { PT.audio.sfx('ding'); W.bigText('ピッ！', f.x, f.y - 160, '#58c46b'); }).go(f.x - 20, f.y - 30).go(f.x - 200, f.y - 30).say('とおれた！', 'ticket', 1300, 'yay').pose('cheer', 700).do(() => R.found('d_gate')); } });
  R.add({ id: 'gate-tap', on: 'tapfix', pri: 50, stage: 'station', test: (c) => (tapFix(c, 'gate') ? R.one(c.e.x, c.e.y) : null), run(c, ch) { R.run('drop', { e: ch, tgt: c.e, x: c.e.x, y: c.e.y }); } });
  R.add({ id: 'bench-tap', on: 'tapfix', pri: 50, stage: 'station', test: (c) => (tapFix(c, 'bench') ? R.free(c.e.x, c.e.y, [], 2000).slice(0, 2) : null),
    run(c, list) {
      const f = c.e, tr = fixOf('trainF');
      list.forEach((ch, i) => R.claim(ch, 6000).go(f.x - 60 + i * 120, f.y + 6, true).do(() => { ch.y = f.y - 4; ch.z = 20; ch.stay = true; }).pose('sit', 1500).say(i ? 'まだかな〜' : 'でんしゃ まってる', '?', 1400).pose('sit', 2000).do(() => { ch.z = 0; ch.stay = false; ch.y = f.y + 30; }).pose('cheer', 800));
      if (tr) W.after(2400, () => { if (Math.abs(tr.offset || 0) < 10 && !tr.inTween) { tr.offset = -2200; } if (!tr.inTween) R.trainMove(tr, 0, 2400); });
      W.after(4000, () => R.found('d_bench'));
    } });
  R.add({ id: 'bench-char', pri: 74, stage: 'station', test: (c) => (isC(c.e) ? onFix(c, 'bench') : null), run(c, f) { R.run('tapfix', { e: f, x: f.x, y: f.y }); } });

  /* ================= 10 うちゅう ================= */
  D('d_moonjump', 'ふわふわ ジャンプ', 'うちゅうでは からだが かるい！ぴょーんと たかく とべる', ['helmet', 'lulu'], 'space');
  D('d_rocketride', 'ロケット はっしゃ', 'ロケットに のせると うちゅうの たびへ', ['rocketF', 'gaku'], 'space');
  D('d_alien', 'うちゅうじんと あいさつ', 'わくせいを タップすると うちゅうじんが あそびに くる', ['planet'], 'space');
  R.add({ id: 'moonjump', pri: 28, stage: 'space', test: (c) => (isC(c.e) && !c.tgt ? c.e : null),
    run(c, ch) { R.claim(ch, 5000).say('ふわふわ〜！', 'star', 1300, 'yay').jump(120, 1500).jump(160, 1700).face('laugh', 1200).say('からだが かるい！', null, 1300, 'laugh').do(() => R.found('d_moonjump')); R.mimic(ch, 'jump', 1500, 'ふわ〜'); } });
  R.add({ id: 'crater-char', pri: 74, stage: 'space', test: (c) => (isC(c.e) ? onFix(c, 'crater') : null), run(c) { R.run('drop', { e: c.e, x: c.e.x, y: c.e.y }); } });
  R.rocketRide = (f, ch) => {
    if (f.inTween || f.rider) return;
    R.claim(ch, 14000).go(f.x - 90, f.y + 20, true).say('のりまーす！', 'heart', 1200, 'yay').do(() => {
      ch.hidden = true; ch.stay = true; f.rider = ch.id;
      W.bigText('3、2、1…', f.x, f.y - 460, '#4c9be8');
      W.after(1300, () => {
        PT.audio.sfx('rocket'); W.shake = W.t + 700; W.bigText('はっしゃ！', f.x, f.y - 460, '#ff6f61');
        R.tween(f, 5200, (k) => { f.lift = k < 0.5 ? PT.easeInOut(k * 2) * 1100 : PT.easeInOut((1 - k) * 2) * 1100; if (Math.random() < 0.3) W.burst('smoke', f.x + PT.rand(-30, 30), f.y - f.lift + 10, 1, { sp: 0.05, max: 800, size: 20, col: '#ffffff', g: 0 }); }, () => {
          f.lift = 0; f.rider = null; ch.hidden = false; ch.stay = false; ch.x = f.x - 120; ch.y = f.y + 40; ch.scale = W.depthScale(ch.y);
          R.claim(ch, 3000).say('ただいま！ ほしを とってきた！', 'star', 1700, 'yay').pose('cheer', 900).do(() => { const s = W.addProp('star', ch.x + 70, ch.y - 160, { temp: true }); s.pop = W.t; R.found('d_rocketride'); });
        });
      });
    });
    R.audience(f.x, f.y, [ch], 'wow', 2, 2200);
  };
  R.add({ id: 'rocket-char', pri: 76, stage: 'space', test: (c) => (isC(c.e) ? onFix(c, 'rocketF') : null), run(c, f) { R.rocketRide(f, c.e); } });
  R.add({ id: 'rocket-tap', on: 'tapfix', pri: 50, stage: 'space', test: (c) => (tapFix(c, 'rocketF') && !c.e.inTween ? R.one(c.e.x, c.e.y, [], 'gaku') : null), run(c, ch) { R.rocketRide(c.e, ch); } });
  R.add({ id: 'planet-tap', on: 'tapfix', pri: 50, stage: 'space', test: (c) => tapFix(c, 'planet'),
    run(c, f) {
      PT.audio.sfx('zap');
      const tx = PT.clamp(f.x + 200, 300, 1300);
      X.critter('alien', [[f.x, f.y - 80, 1], [tx, 470, 1800], [tx, 470, 3000], [tx + 300, 520, 1200], [tx + 300, 520, 800], [f.x, f.y - 80, 1800]]);
      R.avail(tx, 760, [], 3000).slice(0, 3).forEach((ch, i) => R.claim(ch, 6000).wait(1800 + i * 250).look(tx).face('surprise', 900).say(i === 0 ? 'こんにちは！' : i === 1 ? 'うちゅうじんさん！' : 'あそぼう！', 'heart', 1500, 'wow').pose('wave', 1800).face('laugh', 1200));
      W.after(2400, () => { W.bigText('ピポパ〜', tx, 400, '#58c46b'); R.found('d_alien'); });
    } });

  /* ================= 11 まほうの もり ================= */
  D('d_mushroom', 'きのこ トランポリン', 'おおきな きのこに のせると ぽよーん', ['mushroom', 'pon'], 'forest');
  D('d_magictree', 'ひかる まほうの き', 'まほうの きを タップすると ようせいが とびだす', ['magictree'], 'forest');
  D('d_fairypond', 'まほうの いずみ', 'いずみに ものを いれると ふしぎな へんしん', ['fairypond', 'wand'], 'forest');
  R.mush = (ch, f) => {
    R.claim(ch, 7000).go(f.x, f.y + 6, true).do(() => { ch.stay = true; ch.baseZ = 200; ch.z = 200; ch.y = f.y - 4; }).do(() => { f.boing = W.t + 600; PT.audio.sfx('boing'); }).jump(140, 700)
      .do(() => { f.boing = W.t + 600; PT.audio.sfx('boing'); }).jump(180, 800).say('ぽよーん！', 'star', 1300, 'yay')
      .do(() => { ch.baseZ = 0; ch.z = 0; ch.stay = false; const p = W.clampFloor(f.x + 150, f.y + 40); ch.x = p.x; ch.y = p.y; ch.scale = W.depthScale(ch.y); R.found('d_mushroom'); });
    R.mimic(ch, 'jump', 1300, 'ぽよーん まねっこ');
  };
  R.add({ id: 'mush-char', pri: 76, stage: 'forest', test: (c) => (isC(c.e) ? onFix(c, 'mushroom') : null), run(c, f) { R.mush(c.e, f); } });
  R.add({ id: 'mush-tap', on: 'tapfix', pri: 50, stage: 'forest', test: (c) => (tapFix(c, 'mushroom') ? R.one(c.e.x, c.e.y, [], 'pon') : null), run(c, ch) { R.mush(ch, c.e); } });
  R.add({ id: 'mtree-tap', on: 'tapfix', pri: 50, stage: 'forest', test: (c) => tapFix(c, 'magictree'),
    run(c, f) {
      f.glow = W.t + 4000; PT.audio.sfx('magic'); X.sparkleRain(3000);
      for (let i = 0; i < 3; i++) X.critter('fairy', [[f.x + PT.rand(-80, 80), f.y - 300, 1], [PT.rand(300, 1300), PT.rand(200, 450), 2200], [PT.rand(300, 1300), PT.rand(200, 450), 2200], [f.x, f.y - 320, 2000]]);
      const it = W.addProp(PT.pick(['apple', 'star', 'cake', 'flower', 'present']), f.x + PT.rand(-120, 120), f.y + 60, { temp: true });
      if (it) { it.z = 300; it.zTarget = it.def.float ? 200 : 0; it.pop = W.t; }
      R.avail(f.x, f.y, [], 2500).slice(0, 3).forEach((ch, i) => R.claim(ch, 4000).wait(300 + i * 200).look(f.x).face('surprise', 900).say(i === 0 ? 'ようせいさん！' : 'きらきら！', 'star', 1500, 'wow').pose('point', 1200).face('love', 1000));
      W.after(1200, () => R.found('d_magictree'));
    } });
  R.add({ id: 'fpond-prop', pri: 84, stage: 'forest', test: (c) => (c.e.kind === 'prop' && !c.e.def.float && (onFix(c, 'fairypond') || c.area?.fix?.type === 'fairypond') ? (onFix(c, 'fairypond') || c.area.fix) : null),
    run(c, f) {
      const e = c.e;
      const MAP = { apple: 'cake', onigiri: 'cake', ball: 'balloon', teddy: 'unicorn', bunny: 'unicorn', box: 'present', shell: 'star', acorn: 'flower', duck: 'goldfish', book: 'music', blanket: 'rainbow', cushion: 'star', bread: 'cake', banana: 'star' };
      const nt = MAP[e.type] || PT.pick(['star', 'flower', 'present']);
      PT.audio.sfx('magic'); W.burst('star', e.x, e.y - 40, 14, { sp: 0.25 }); W.poof(e.x, e.y - 30);
      const x = e.x, y = f.y + 50;
      W.remove(e);
      W.after(500, () => { if (nt === 'rainbow') { X.rainbow(); } else { const n = W.addProp(nt, x, nt === 'star' || nt === 'balloon' ? y - 200 : y, { temp: true }); if (n) n.pop = W.t; } });
      R.avail(x, y, [], 1500).slice(0, 2).forEach((ch, i) => R.claim(ch, 3000).wait(500 + i * 200).look(x).face('surprise', 900).say(i === 0 ? 'へんしんした！' : 'まほうだ！', nt === 'rainbow' ? 'rainbow' : nt, 1500, 'wow').pose('cheer', 900));
      W.after(800, () => R.found('d_fairypond'));
    } });
  R.add({ id: 'fpond-char', pri: 76, stage: 'forest', test: (c) => (isC(c.e) ? onFix(c, 'fairypond') : null),
    run(c, f) { const ch = c.e; R.claim(ch, 5000).do(() => { ch.x = PT.clamp(ch.x, f.x - 120, f.x + 120); ch.y = f.y - 40; ch.rest = 'swim'; ch.stay = true; PT.audio.sfx('magic'); ch.glow = true; W.burst('star', ch.x, ch.y - 80, 14, { sp: 0.2 }); }).say('きらきらに なった！', 'star', 1600, 'wow').pose('swim', 1500).do(() => { ch.rest = 'idle'; ch.stay = false; const p = W.clampFloor(ch.x, f.y + 50); ch.y = p.y; ch.scale = W.depthScale(ch.y); W.after(4000, () => { ch.glow = false; }); R.found('d_fairypond'); }).jump(60, 500); } });

  /* ================= 12 おまつり ひろば ================= */
  D('d_bonodori', 'ぼんおどり', 'やぐらの たいこを たたくと みんなで まるく おどる', ['yagura', 'drum'], 'fest');
  D('d_goldfish', 'きんぎょすくい', 'きんぎょやさんを タップすると きんぎょすくい', ['stall', 'goldfish'], 'fest');
  D('d_festfood', 'やたいの ごちそう', 'たべものやさんで おいしい ものを もらったよ', ['stall', 'cake'], 'fest');
  R.bon = (f) => {
    f.beat = W.t + 300;
    let n = 0;
    const iv = () => { if (n++ > 12) return; f.beat = W.t + 300; PT.audio.sfx('drum'); W.after(500, iv); };
    iv();
    const list = R.avail(f.x, f.y, [], 3000);
    const cx = f.x, cy = f.y + 70;
    list.forEach((ch, i) => {
      R.claim(ch, 9000).do(() => {
        ch.stay = true;
        R.tween(ch, 6500, (k) => { const a = k * PT.TAU + (i / list.length) * PT.TAU; ch.x = cx + Math.cos(a) * 280; ch.y = cy + Math.sin(a) * 50; ch.scale = W.depthScale(ch.y); ch.pose = 'dance'; ch.face = 'laugh'; ch.flip = Math.sin(a) > 0; }, () => { ch.stay = false; ch.face = 'happy'; if (i === 0) { R.found('d_bonodori'); X.confetti(cx); } });
      });
    });
    X.music(f.x, f.y - 340, 6000);
  };
  R.add({ id: 'yagura-tap', on: 'tapfix', pri: 50, stage: 'fest', test: (c) => tapFix(c, 'yagura'), run(c, f) { R.bon(f); } });
  R.add({ id: 'yagura-drum', pri: 82, stage: 'fest', test: (c) => (isP(c.e, ['drum', 'music']) || isC(c.e) ? onFix(c, 'yagura') || (isP(c.e, ['drum', 'music']) ? fixOf('yagura') : null) : null), run(c, f) { if (c.e.kind === 'prop' && c.e.type === 'drum') W.remove(c.e); R.bon(f); } });
  R.add({ id: 'fishstall', on: 'tapfix', pri: 50, stage: 'fest', test: (c) => (tapFix(c, 'stall') && c.e.goods === 'fish' ? R.one(c.e.x, c.e.y) : null),
    run(c, ch) { const f = c.e; R.claim(ch, 6000).go(f.x, f.y + 40, true).look(f.x).say('えいっ！', null, 900, 'yay').pose('peek', 900).do(() => { X.critter('fish', [[f.x, f.y - 60, 1], [f.x + 20, f.y - 150, 400], [ch.x, ch.y - 120, 400]]); PT.audio.sfx('splash'); }).do(() => { ch.holdType = 'goldfish'; }).face('laugh', 1200).say('すくえた！', 'goldfish', 1500, 'yay').pose('cheer', 800).do(() => R.found('d_goldfish')).wait(2500).unhold(); } });
  R.add({ id: 'foodstall', on: 'tapfix', pri: 50, stage: 'fest', test: (c) => (tapFix(c, 'stall') && c.e.goods === 'food' ? R.one(c.e.x, c.e.y, [], 'moko') : null),
    run(c, ch) { const f = c.e; const food = PT.pick(['cake', 'onigiri', 'apple', 'banana']); R.claim(ch, 6000).go(f.x, f.y + 40, true).look(f.x).say('ひとつ ください！', food, 1400).hold(food).do(() => PT.audio.sfx('bell')).face('eat', 1300).pose('eat', 1300).unhold().face('laugh', 1200).say('おいしい！', 'heart', 1300, 'yay').do(() => R.found('d_festfood')); } });
  R.add({ id: 'fest-fire', pri: 60, stage: 'fest', test: (c) => (isP(c.e, 'firework') ? 1 : null),
    run(c) { W.remove(c.e); for (let i = 0; i < 8; i++) W.after(i * 450, () => X.firework(PT.rand(250, 1350), PT.rand(100, 280))); R.avail(800, 760).forEach((ch, i) => R.claim(ch, 4500).look(800).face('surprise', 900).say(i === 0 ? 'たまやー！' : i === 1 ? 'かぎやー！' : '', 'firework', 1500, 'wow').pose('cheer', 2000)); W.after(1800, () => R.found('d_firework')); } });
})();
