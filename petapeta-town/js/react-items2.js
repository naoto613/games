/* 追加アイテムの反応 */
'use strict';
(() => {
  const W = PT.world, R = PT.R, D = R.D, X = PT.FX;
  const { isP, isC, tag, nearP, nearF, firstP } = R.h;
  const G = PT.G;

  /* 追加の いきもの */
  X.CRIT.butterfly = (c, f) => {
    const fl = Math.abs(Math.sin(f.life * 0.02));
    c.translate(f.x, f.y);
    for (const sd of [-1, 1]) { c.save(); c.scale(sd * (0.3 + fl * 0.7), 1); G.ell(c, 9, -6, 10, 8, -0.4); G.fillO(c, f.col || '#ffb3d0', 2); G.ell(c, 7, 6, 7, 6, 0.4); G.fillO(c, f.col || '#ffb3d0', 2); c.restore(); }
    G.ell(c, 0, 0, 2.5, 9); c.fillStyle = '#3e3550'; c.fill();
  };
  X.CRIT.chick = (c, f) => {
    const hop = Math.abs(Math.sin(f.life * 0.015)) * 8;
    c.translate(f.x, f.y - hop); c.scale(f.dir || 1, 1);
    G.circ(c, 0, -14, 14); G.fillO(c, '#ffe36a', 2.5);
    G.poly(c, [12, -16, 20, -13, 12, -10]); c.fillStyle = '#ff9f43'; c.fill();
    G.circ(c, 5, -18, 2.2); c.fillStyle = '#2b2440'; c.fill();
    G.ell(c, -6, -12, 6, 4, 0.4); c.fillStyle = '#f5cf4a'; c.fill();
  };

  D('d_carrot', 'にんじん だいすき', 'ピョコは にんじんが だいすき！', ['carrot', 'pyoko']);
  D('d_suikawari', 'すいかわり', 'すいかを おくと めかくしで すいかわり', ['watermelon', 'pon']);
  D('d_pizza', 'みんなで わけっこ', 'ピザや おべんとうは みんなで わけて たべるよ', ['pizza', 'moko']);
  D('d_icecream', 'つめたい アイス', 'アイスを たべたら あたまが キーン！', ['icecream', 'choco']);
  D('d_kanpai', 'かんぱい！', 'ジュースで みんなで かんぱい', ['juice', 'gaku']);
  D('d_blocks', 'つみき タワー', 'つみきを たかく つんで…ガラガラ！', ['blocks', 'gaku', 'pon']);
  D('d_robottoy', 'ロボットの おさんぽ', 'ロボットの おもちゃが あるきだした', ['robottoy']);
  D('d_garden', 'おはなに みずやり', 'じょうろで みずを あげると おはなが さく', ['wateringcan', 'flower']);
  D('d_seed', 'たねから ひまわり', 'たねを うえると ぐんぐん のびて ひまわりに', ['seed', 'sunflower']);
  D('d_bug', 'ちょうちょ つかまえた', 'むしあみで ちょうちょを おいかけよう', ['bugnet', 'lulu']);
  D('d_fishing', 'おさかな つり', 'みずの ちかくで つりざおを つかうと…', ['fishingrod', 'gaku']);
  D('d_photo', 'はい チーズ！', 'カメラを おくと みんなで きねんしゃしん', ['camera', 'mimi']);
  D('d_phone', 'もしもし でんわ', 'でんわで とおくの おともだちと おはなし', ['phone', 'pyoko']);
  D('d_sweep', 'おそうじ', 'ほうきで きれいに おかたづけ', ['broom', 'mimi']);
  D('d_umbrella', 'あいあいがさ', 'かさを ひらくと あめ。みんなで かさに はいろう', ['umbrella', 'pyoko']);
  D('d_drawing', 'おえかき', 'クレヨンで じめんに おえかき', ['crayons', 'choco']);
  D('d_letter', 'おてがみ ゆうびん', 'おてがみを とどけると とっても うれしそう', ['letter', 'lulu']);
  D('d_magnify', 'むしめがねで はっけん', 'むしめがねで のぞくと ちいさな ともだちが', ['magnifier', 'gaku']);
  D('d_kite', 'たこあげ', 'たこを あげると かぜに のって たかーく', ['kite', 'pon']);
  D('d_pinwheel', 'かざぐるま くるくる', 'ふーっと ふくと くるくる まわる', ['pinwheel', 'pyoko']);
  D('d_instrument', 'えんそう', 'がっきを おくと えんそうが はじまる', ['guitar', 'pon']);
  D('d_band', 'みんなで バンド', 'がっきを ふたつ いじょう おくと バンドに なる', ['trumpet', 'tambourine', 'maracas']);
  D('d_musicbox', 'オルゴールの こもりうた', 'やさしい おとで みんな うとうと', ['musicbox', 'moko']);
  D('d_skate', 'スケボーで ジャンプ', 'スケボーに のって くるっと ジャンプ', ['skateboard', 'pon']);
  D('d_airplane', 'ひこうきで おそらへ', 'ひこうきに のって そらを ひとまわり', ['airplane', 'lulu']);
  D('d_bus', 'バスで おでかけ', 'みんなで バスに のって しゅっぱつ', ['bus', 'gaku']);
  D('d_rescue', 'きんきゅう しゅつどう', 'きゅうきゅうしゃや しょうぼうしゃが ピーポー！', ['ambulance', 'firetruck']);
  D('d_horse', 'おうまさん ぱっかぱか', 'もくばに のって ゆらゆら', ['horse', 'mimi']);
  D('d_boat', 'ボートで すいすい', 'ボートを こいで みずの うえを すいすい', ['boat', 'gaku']);
  D('d_seesaw', 'シーソー ぎったんばったん', 'ふたりで シーソー', ['seesaw', 'choco', 'pon']);
  D('d_pool', 'プールで ぱしゃぱしゃ', 'ビニールプールで みずあそび', ['pool', 'pyoko']);
  D('d_snow', 'ゆきが ふった', 'ゆきを おくと ゆきが ふって ゆきだるまが できる', ['snow', 'snowman']);
  D('d_carpet', 'そらとぶ じゅうたん', 'まほうの じゅうたんで そらの さんぽ', ['carpet', 'mimi']);
  D('d_lamp', 'ランプの まほう', 'ランプを こすると ねがいごとが かなう？', ['lamp', 'present']);
  D('d_egg', 'たまごが われた', 'ふしぎな たまごから ひよこが うまれたよ', ['egg', 'pyoko']);
  D('d_chest', 'たからばこ オープン', 'たからばこを あけると…', ['chest', 'pon']);
  D('d_disco', 'ミラーボールで ダンス', 'キラキラの ひかりで ダンスパーティー', ['mirrorball', 'choco']);
  D('d_moon', 'よるに なった', 'おつきさまを おくと よるに なる', ['moon', 'moko']);
  D('d_cloud', 'あめふり と にじ', 'くもを おくと あめ。そのあとは…', ['cloud', 'rainbow']);
  D('d_petals', 'はなびらの シャワー', 'はなびらが ひらひら。みんなで くるくる', ['petals', 'mimi']);

  const one = (x, y, pref) => R.one(x, y, [], pref);
  const fetch = (ch, p, ms = 8000) => R.claim(ch, ms).to(p, -50, 4, true).look(p.x);

  /* ---------- たべもの ---------- */
  R.add({ id: 'carrot', pri: 72, test: (c) => (isP(c.e, 'carrot') && W.charOf('pyoko') && R.chars().includes(W.charOf('pyoko')) ? W.charOf('pyoko') : null),
    run(c, ch) { R.claim(ch, 6000).face('surprise', 600).say('にんじん！', 'carrot', 1000, 'wow').to(c.e, -50, 4, true).jump(80, 500).do(() => { R.eat(ch, c.e, c, 'にんじん だいすき！'); R.found('d_carrot'); }); } });
  R.add({ id: 'suikawari', pri: 66, test: (c) => (isP(c.e, 'watermelon') && !c.e.split && R.chars().length >= 2 ? one(c.e.x, c.e.y, 'pon') : null),
    run(c, ch) {
      const w = c.e;
      const fans = R.free(w.x, w.y, [ch], 1500).slice(0, 3);
      const start = W.clampFloor(w.x - 260, w.y + 20);
      R.claim(ch, 12000).go(start.x, start.y, true).say('すいかわり！', 'watermelon', 1300, 'yay').face('sleep', 6000).say('みえない〜', null, 1200, 'hmm')
        .go(w.x - 150, w.y + 40).go(w.x - 90, w.y - 10).go(w.x - 50, w.y + 4).pose('cheer', 500)
        .do(() => { w.split = true; PT.audio.sfx('pop'); W.bigText('パカーン！', w.x, w.y - 140, '#ff5d6c'); W.burst('confetti', w.x, w.y - 40, 14, { up: true, sp: 0.25, col: '#ff5d6c' }); })
        .face('laugh', 1500).say('われたー！', 'star', 1400, 'yay').do(() => { R.found('d_suikawari'); R.picnic(w.x, w.y + 10, null); });
      fans.forEach((o, i) => { const p = R.spot(w.x, w.y + 60, i, fans.length, 170); R.claim(o, 9000).go(p.x, p.y).look(ch.x).say(['みぎ みぎー！', 'ひだり！', 'まっすぐ！'][i], null, 1400, 'yay').wait(1600).say(['そこそこ！', 'もうちょっと！', 'いけー！'][i], null, 1300, 'yay').pose('cheer', 1500); });
    } });
  const share = (food, ctx) => {
    const list = R.free(food.x, food.y, [], 2000).slice(0, 5);
    list.forEach((ch, i) => { const p = R.ring(food.x, food.y, i, list.length, 140); R.claim(ch, 7000).go(p.x, p.y, true).look(food.x).pose('sit', 700).say(i === 0 ? 'わけっこ しよう！' : '', i === 0 ? food.type : null, 1400, 'yay').hold(food.type).face('eat', 1400).pose('eat', 1400).unhold().face('laugh', 1200).say(i === 1 ? 'おいしいね！' : '', 'heart', 1200, 'yay'); });
    W.after(1500, () => { if (!food.removed) W.remove(food); PT.audio.sfx('munch'); });
    W.after(3600, () => R.found('d_pizza'));
  };
  R.add({ id: 'share-food', pri: 68, test: (c) => (isP(c.e, ['pizza', 'bento']) && R.chars().length >= 3 ? 1 : null), run(c) { share(c.e, c); } });
  R.add({ id: 'icecream', pri: 76, test: (c) => (isP(c.e, 'icecream') ? (isC(c.tgt) ? c.tgt : one(c.e.x, c.e.y, 'choco')) : null),
    run(c, ch) {
      const ic = c.e;
      const a = c.tgt === ch ? R.claim(ch, 6000) : fetch(ch, ic, 6000);
      a.do(() => { W.remove(ic); ch.holdType = 'icecream'; }).face('eat', 1300).pose('eat', 1200).face('surprise', 900).say('キーン！', 'sweat', 1200, 'wow').pose('tickle', 800).unhold().face('laugh', 1200).say('つめたくて おいしい！', 'heart', 1400, 'laugh').do(() => R.found('d_icecream'));
      R.audience(ch.x, ch.y, [ch], 'laugh', 1, 2800);
    } });
  R.add({ id: 'kanpai', pri: 70, test: (c) => (isP(c.e, 'juice') && R.chars().length >= 2 ? 1 : null),
    run(c) {
      const j = c.e; W.remove(j);
      const list = R.free(j.x, j.y, [], 1800).slice(0, 4);
      list.forEach((ch, i) => { const p = R.ring(j.x, j.y, i, list.length, 110); R.claim(ch, 5000).go(p.x, p.y, true).look(j.x).hold('juice').pose('cheer', 900).say(i === 0 ? 'かんぱーい！' : '', 'star', 1300, 'yay').face('eat', 1000).pose('eat', 900).unhold().face('laugh', 1000); });
      W.after(1600, () => { PT.audio.sfx('ding'); W.burst('star', j.x, j.y - 160, 8, { sp: 0.15, max: 700 }); R.found('d_kanpai'); });
    } });

  /* ---------- どうぐ ---------- */
  R.add({ id: 'blocks', pri: 50, test: (c) => (isP(c.e, 'blocks') ? one(c.e.x, c.e.y, 'gaku') : null),
    run(c, ch) {
      const b = c.e; b.level = 1;
      const a = fetch(ch, b, 12000).say('たかく つもう！', 'blocks', 1300, 'yay');
      for (let i = 2; i <= 5; i++) a.pose('carry', 600).do(() => { b.level = i; b.bh = 40 + i * 26; b.pop = W.t; PT.audio.sfx('place'); });
      a.say('できた！', 'star', 1200, 'yay').pose('cheer', 700);
      const p = W.charOf('pon');
      if (p && p !== ch && R.chars().includes(p)) {
        W.after(4400, () => R.claim(p, 5000).go(b.x + 70, b.y + 6, true).look(b.x).say('えいっ！', null, 900, 'laugh').pose('kick', 400)
          .do(() => { b.level = 1; b.bh = 0; PT.audio.sfx('drumroll'); W.bigText('ガラガラ！', b.x, b.y - 160, '#ff6f61'); W.burst('confetti', b.x, b.y - 80, 10, { sp: 0.3 }); R.claim(ch, 3000).face('surprise', 800).say('あー！', '!', 900, 'wow').face('laugh', 1200).say('もういっかい！', null, 1200, 'laugh'); })
          .face('laugh', 1200).say('ごめーん！', null, 1200, 'laugh').do(() => R.found('d_blocks')));
      } else W.after(4600, () => { b.wobbleUntil = W.t + 1000; R.found('d_blocks'); });
    } });
  R.add({ id: 'robottoy', pri: 50, test: (c) => (isP(c.e, 'robottoy') ? 1 : null),
    run(c) {
      const r = c.e; r.walking = true; PT.audio.sfx('zap');
      const sx = r.x, sy = r.y, to = W.randFloor(220);
      R.tween(r, 4500, (k) => { r.x = PT.lerp(sx, to.x, k); r.y = PT.lerp(sy, to.y, k); r.scale = W.depthScale(r.y); r.z = Math.abs(Math.sin(k * 30)) * 4; }, () => { r.walking = false; r.z = 0; W.bigText('ピコピコ！', r.x, r.y - 140, '#4c9be8'); R.found('d_robottoy'); });
      R.free(sx, sy, [], 1500).slice(0, 2).forEach((ch, i) => W.after(300 + i * 300, () => R.claim(ch, 6000).look(sx).face('surprise', 800).say(i ? 'まってー！' : 'うごいた！', null, 1200, 'wow').to(r, -90 - i * 70, 10).pose('cheer', 800)));
    } });
  R.add({ id: 'garden', pri: 52, test: (c) => (isP(c.e, 'wateringcan') ? one(c.e.x, c.e.y, 'mimi') : null),
    run(c, ch) {
      const wc = c.e;
      const seed = nearP(wc.x, wc.y, 900, (p) => p.type === 'sunflower' || p.type === 'seed')[0];
      fetch(ch, wc, 8000).hold('wateringcan').do(() => { wc.hidden = true; }).go(seed ? seed.x - 70 : ch.x, seed ? seed.y : ch.y).say('おみず あげよう', 'wateringcan', 1300).pose('point', 1400)
        .do(() => {
          for (let i = 0; i < 10; i++) W.after(i * 90, () => W.fx.push({ type: 'drop', x: ch.x + (ch.flip ? -60 : 60) + PT.rand(-10, 10), y: ch.y - 90, vx: 0, vy: 0.3, life: 0, max: 400, size: 9, g: 0.001 }));
          if (seed && seed.type === 'sunflower') { seed.grow = 1; seed.pop = W.t; }
          else for (let i = 0; i < 4; i++) { const p = W.clampFloor(ch.x + PT.rand(-160, 160), ch.y + PT.rand(-40, 60)); const f = W.addProp('flower', p.x, p.y, { temp: true }); if (f) f.pop = W.t + i * 150; }
          PT.audio.sfx('sparkle');
        }).face('love', 1200).say('さいた！', 'flower', 1300, 'yay').unhold().do(() => { wc.hidden = false; wc.x = ch.x + 50; wc.y = ch.y + 4; R.found('d_garden'); });
    } });
  R.add({ id: 'seed', pri: 52, test: (c) => (isP(c.e, 'seed') ? one(c.e.x, c.e.y, 'pyoko') : null),
    run(c, ch) {
      const s = c.e;
      fetch(ch, s, 9000).pose('peek', 900).do(() => { X.dig(s.x, s.y); const sf = W.addProp('sunflower', s.x, s.y, { grow: 0.05 }); W.remove(s); R.tween(sf, 4000, (k) => { sf.grow = 0.05 + k * 0.95; sf.bh = 160 * sf.grow; }, () => { PT.audio.sfx('sparkle'); W.burst('star', sf.x, sf.y - 150, 8, { sp: 0.2 }); R.found('d_seed'); }); })
        .say('おおきく なあれ', 'seed', 1500, 'talk').pose('shy', 2400).face('surprise', 800).say('ひまわり！', 'sunflower', 1400, 'wow').pose('cheer', 900);
      R.audience(s.x, s.y, [ch], 'wow', 2, 3600);
    } });
  R.add({ id: 'bugnet', pri: 50, test: (c) => (isP(c.e, 'bugnet') ? one(c.e.x, c.e.y, 'lulu') : null),
    run(c, ch) {
      const n = c.e;
      const p1 = W.randFloor(200), p2 = W.randFloor(200);
      fetch(ch, n, 10000).hold('bugnet').do(() => { n.hidden = true; X.critter('butterfly', [[p1.x, p1.y - 200, 1], [p2.x, p2.y - 180, 2200], [p1.x, p1.y - 220, 2200], [p2.x, p2.y - 140, 1600]], { col: PT.pick(['#ffb3d0', '#ffe36a', '#9fd8ff']) }); })
        .say('ちょうちょ だ！', 'heart', 1200, 'wow').go(p2.x - 60, p2.y + 20, true).jump(60, 500).go(p1.x - 60, p1.y + 20, true).jump(60, 500).go(p2.x - 60, p2.y + 40, true).jump(80, 600)
        .face('laugh', 1200).say('つかまえた！ …ばいばい', 'star', 1600, 'yay').unhold().do(() => { n.hidden = false; n.x = ch.x + 50; n.y = ch.y + 4; X.critter('butterfly', [[ch.x + 30, ch.y - 150, 1], [ch.x + 400, ch.y - 450, 2400]]); R.found('d_bug'); });
    } });
  R.add({ id: 'fishing', pri: 50, test: (c) => (isP(c.e, 'fishingrod') ? one(c.e.x, c.e.y, 'gaku') : null),
    run(c, ch) {
      const rod = c.e;
      const w = W.fixes().find((f) => f.def.area === 'water');
      const sx = w ? PT.clamp(rod.x, w.x - w.w * 0.4, w.x + w.w * 0.4) : rod.x;
      const sy = w ? w.y + 40 : rod.y;
      fetch(ch, rod, 10000).hold('fishingrod').do(() => { rod.hidden = true; }).go(sx - 60, sy, false).look(sx + 100).say('つれるかな？', '?', 1500, 'hmm').pose('sit', 2400)
        .do(() => { if (w) { X.splash(sx + 40, w.y - 40); X.critter('fish', [[sx + 40, w.y - 40, 1], [sx + 20, w.y - 200, 500], [ch.x, ch.y - 140, 500]]); } else W.bigText('ながぐつ？', ch.x, ch.y - 200, '#4c9be8'); })
        .pose('cheer', 900).face('laugh', 1200).say(w ? 'つれたー！' : 'おさかな いないね', w ? 'star' : 'sweat', 1400, w ? 'yay' : 'laugh').unhold().do(() => { rod.hidden = false; rod.x = ch.x + 50; rod.y = ch.y + 4; R.found('d_fishing'); });
    } });
  R.add({ id: 'camera', pri: 52, test: (c) => (isP(c.e, 'camera') ? one(c.e.x, c.e.y, 'mimi') : null),
    run(c, ch) {
      const cam = c.e;
      const list = R.avail(cam.x, cam.y, [ch], 3000).slice(0, 5);
      const cx = PT.clamp(cam.x, 400, 1200), cy = Math.min(W.stage.floor[0] + 120, 760);
      list.forEach((o, i) => { const p = W.clampFloor(cx - 220 + i * 110, cy + (i % 2) * 30); R.claim(o, 8000).go(p.x, p.y, true).look(cx).pose(PT.pick(['wave', 'cheer', 'point', 'shy']), 3000).face('laugh', 2000); });
      fetch(ch, cam, 8000).hold('camera').do(() => { cam.hidden = true; }).go(cx, cy + 200).look(cx).say('はい チーズ！', 'camera', 1800, 'yay').wait(1200)
        .do(() => {
          PT.audio.sfx('zap');
          W.special({ type: 'flash', max: 500, draw(c2, f, k) { c2.fillStyle = `rgba(255,255,255,${1 - k})`; c2.fillRect(-500, -100, 2600, 1200); } });
          const icons = list.map((o) => PT.iconCache.char(o.cid, 96));
          W.special({ type: 'photo', x: cx, y: 260, max: 4500, draw(c2, f, k) {
            c2.save(); c2.translate(f.x, f.y); c2.rotate(-0.05);
            G.rr(c2, -200, -90, 400, 180, 8); c2.fillStyle = '#fff'; c2.fill(); c2.strokeStyle = '#cfe0f5'; c2.lineWidth = 4; c2.stroke();
            G.rr(c2, -186, -78, 372, 132, 4); c2.fillStyle = '#d9f1ff'; c2.fill();
            icons.forEach((ic, i) => c2.drawImage(ic, -180 + i * 72, -70, 80, 80));
            c2.restore();
          } });
          R.found('d_photo');
        }).unhold().do(() => { cam.hidden = false; cam.x = ch.x + 50; cam.y = ch.y + 4; });
    } });
  R.add({ id: 'phone', pri: 50, test: (c) => (isP(c.e, 'phone') && R.chars().length >= 2 ? one(c.e.x, c.e.y, 'pyoko') : null),
    run(c, ch) {
      const far = R.avail(ch.x, ch.y, [ch]).slice(-1)[0];
      fetch(ch, c.e, 7000).pose('hold', 400).say('もしもし？', 'phone', 1500, 'talk').wait(1600).face('laugh', 1500).say('うん うん！', 'heart', 1400, 'laugh').do(() => R.found('d_phone'));
      if (far) W.after(1600, () => { PT.audio.sfx('bell'); R.claim(far, 4000).pose('hold', 400).face('surprise', 600).say('はーい！ もしもし！', 'phone', 1600, 'yay').wait(800).say('あそぼう！', 'star', 1300, 'yay'); });
    } });
  R.add({ id: 'broom', pri: 50, test: (c) => (isP(c.e, 'broom') ? (W.chars().find((x) => x.wear.hat === 'witch') || one(c.e.x, c.e.y, 'mimi')) : null),
    run(c, ch) {
      const b = c.e;
      if (ch.wear.hat === 'witch') {
        fetch(ch, b, 6000).do(() => { W.remove(b); ch.holdType = 'broom'; R.tween(ch, 3000, (k) => { ch.z = Math.sin(k * Math.PI) * 220; ch.x += Math.sin(k * 8) * 2; ch.pose = 'ride'; if (Math.random() < 0.3) W.burst('spark', ch.x, ch.y - ch.z - 40, 1, { sp: 0.05, max: 600, col: '#ffd23f', g: 0 }); }, () => { ch.z = 0; ch.holdType = null; const p = W.addProp('broom', ch.x + 40, ch.y + 4); R.found('d_witch'); R.found('d_sweep'); }); });
        return;
      }
      const mess = nearP(b.x, b.y, 900, (p) => p.temp || ['shell', 'acorn', 'present', 'flower'].includes(p.type)).slice(0, 4);
      const a = fetch(ch, b, 10000).hold('broom').do(() => { b.hidden = true; }).say('おそうじ しよう', 'broom', 1300);
      mess.forEach((m) => a.to(m, -50, 4).pose('march', 600).do(() => { if (!m.removed) { W.poof(m.x, m.y - 20); W.remove(m); PT.audio.sfx('whoosh'); } }));
      if (!mess.length) a.pose('march', 1200).do(() => X.dig(ch.x + 40, ch.y));
      a.say('ぴかぴか！', 'star', 1300, 'yay').unhold().do(() => { b.hidden = false; b.x = ch.x + 50; b.y = ch.y + 4; R.found('d_sweep'); });
    } });
  const rainFx = (ms = 4000) => {
    let acc = 0;
    W.special({ type: 'rain', max: ms, step(f, dt) { acc += dt; if (acc > 35) { acc = 0; W.fx.push({ type: 'drop', x: PT.rand(W.visLeft, W.visRight), y: PT.rand(0, 200), vx: -0.05, vy: 0.9, life: 0, max: 900, size: 9, g: 0 }); } }, draw(c2, f, k) { c2.fillStyle = `rgba(60,80,130,${0.12 * Math.sin(k * Math.PI)})`; c2.fillRect(-500, -100, 2600, 1200); } });
    PT.audio.sfx('wave');
  };
  R.rainFx = rainFx;
  R.add({ id: 'umbrella', pri: 50, test: (c) => (isP(c.e, 'umbrella') ? one(c.e.x, c.e.y, 'pyoko') : null),
    run(c, ch) {
      const u = c.e;
      fetch(ch, u, 8000).hold('umbrella').do(() => { u.hidden = true; rainFx(4500); }).say('あめ だ！ はいって！', 'umbrella', 1500, 'yay').pose('hold', 3000).face('laugh', 1200).unhold()
        .do(() => { u.hidden = false; u.x = ch.x + 60; u.y = ch.y + 4; R.found('d_umbrella'); });
      R.free(ch.x, ch.y, [ch], 1500).slice(0, 2).forEach((o, i) => W.after(600, () => R.claim(o, 5000).face('surprise', 600).say('ぬれちゃう〜', 'sweat', 1000, 'wow').go(ch.x + (i ? 60 : -60), ch.y + 10, true).look(ch.x).pose('shy', 2400).face('love', 1200)));
    } });
  R.add({ id: 'crayons', pri: 50, test: (c) => (isP(c.e, 'crayons') ? one(c.e.x, c.e.y, 'choco') : null),
    run(c, ch) {
      const cr = c.e;
      const pics = ['sun', 'flower', 'house', 'heart', 'star', 'rainbow'];
      const pic = PT.pick(pics);
      fetch(ch, cr, 7000).pose('peek', 2200).do(() => {
        const x = ch.x + (ch.flip ? -130 : 130), y = ch.y + 10;
        W.special({ type: 'chalk', x, y, max: 12000, draw(c2, f, k) {
          const kk = Math.min(1, f.life / 1500);
          c2.save(); c2.translate(f.x, f.y); c2.scale(1, 0.45); c2.globalAlpha *= 0.9; c2.lineWidth = 7; c2.lineCap = 'round';
          if (pic === 'sun') { c2.strokeStyle = '#ffb02e'; c2.beginPath(); c2.arc(0, 0, 40, 0, PT.TAU * kk); c2.stroke(); for (let i = 0; i < 8 * kk; i++) { const a = (i / 8) * PT.TAU; c2.beginPath(); c2.moveTo(Math.cos(a) * 52, Math.sin(a) * 52); c2.lineTo(Math.cos(a) * 72, Math.sin(a) * 72); c2.stroke(); } }
          if (pic === 'flower') { c2.strokeStyle = '#ff6f91'; for (let i = 0; i < 6 * kk; i++) { const a = (i / 6) * PT.TAU; c2.beginPath(); c2.arc(Math.cos(a) * 30, Math.sin(a) * 30, 18, 0, PT.TAU); c2.stroke(); } c2.strokeStyle = '#ffd23f'; c2.beginPath(); c2.arc(0, 0, 14, 0, PT.TAU); c2.stroke(); }
          if (pic === 'house') { c2.strokeStyle = '#4c9be8'; c2.strokeRect(-50, -20, 100 * kk, 70); c2.strokeStyle = '#ff6f61'; c2.beginPath(); c2.moveTo(-60, -20); c2.lineTo(0, -70); c2.lineTo(60 * kk, -20); c2.stroke(); }
          if (pic === 'heart') { c2.strokeStyle = '#ff6f91'; G.heart(c2, 0, 10, 60 * kk); c2.stroke(); }
          if (pic === 'star') { c2.strokeStyle = '#ffb02e'; G.star(c2, 0, 0, 70 * kk, 30 * kk); c2.stroke(); }
          if (pic === 'rainbow') { ['#ff6b6b', '#ffa94d', '#ffd84a', '#69db7c', '#4dabf7'].forEach((col, i) => { c2.strokeStyle = col; c2.beginPath(); c2.arc(0, 30, 80 - i * 9, Math.PI, Math.PI + Math.PI * kk); c2.stroke(); }); }
          c2.restore();
        } });
      }).face('laugh', 1200).say('じょうずに かけた！', 'crayons', 1500, 'yay').pose('cheer', 900).do(() => R.found('d_drawing'));
      R.mimic(ch, 'peek', 1500, 'わたしも かく！');
    } });
  R.add({ id: 'letter', pri: 52, test: (c) => (isP(c.e, 'letter') && R.chars().length >= 2 ? one(c.e.x, c.e.y, 'lulu') : null),
    run(c, ch) {
      const l = c.e;
      const to = isC(c.tgt) && c.tgt !== ch ? c.tgt : R.avail(ch.x, ch.y, [ch]).slice(-1)[0];
      fetch(ch, l, 10000).hold('letter').do(() => { W.remove(l); }).say('ゆうびんでーす！', 'letter', 1400, 'yay').to(to, to.x < ch.x ? 90 : -90, 4, true).look(to.x).say(PT.CHARS[to.cid].name + 'へ おてがみ！', 'letter', 1500, 'yay').unhold()
        .do(() => { R.claim(to, 4000).look(ch.x).hold('letter').face('surprise', 700).say('わたしに？', '!', 1100, 'wow').face('love', 1500).say('ありがとう！', 'heart', 1400, 'yay').unhold(); W.burst('heart', to.x, to.y - 160, 6, { up: true, sp: 0.12 }); R.found('d_letter'); });
    } });
  R.add({ id: 'magnifier', pri: 50, test: (c) => (isP(c.e, 'magnifier') ? one(c.e.x, c.e.y, 'gaku') : null),
    run(c, ch) {
      const m = c.e;
      fetch(ch, m, 8000).hold('magnifier').do(() => { m.hidden = true; }).pose('peek', 1200).say('なにが いるかな…', 'magnifier', 1500, 'hmm').pose('peek', 1200)
        .do(() => { const kind = PT.pick(['butterfly', 'chick', 'crab', 'squirrel']); const sx = ch.x + (ch.flip ? -100 : 100); X.critter(kind, [[sx, ch.y + 10, 1], [sx, ch.y + 10, 1800], [sx + 300, ch.y + (kind === 'butterfly' ? -300 : 20), 2000]]); })
        .face('surprise', 900).say('みつけた！', '!', 1300, 'wow').face('laugh', 1200).unhold().do(() => { m.hidden = false; m.x = ch.x + 40; m.y = ch.y + 4; R.found('d_magnify'); });
    } });
  R.add({ id: 'kite', pri: 50, test: (c) => (isP(c.e, 'kite') ? one(c.e.x, c.e.y, 'pon') : null),
    run(c, ch) {
      const k = c.e;
      fetch(ch, k, 9000).do(() => { k.heldKite = true; PT.audio.sfx('whoosh'); R.tween(k, 6000, (t2) => { k.x = ch.x + 120 + Math.sin(t2 * 9) * 40; k.y = ch.y + 2; k.z = 120 + Math.sin(t2 * Math.PI) * 260; k.scale = W.depthScale(ch.y); }, () => { k.z = 0; k.heldKite = false; R.found('d_kite'); }); })
        .say('たこあげ！', 'kite', 1300, 'yay').pose('point', 1500).go(ch.x - 140, ch.y, true).pose('point', 1500).face('laugh', 1200).say('たかーい！', 'star', 1300, 'yay');
      R.audience(ch.x, ch.y, [ch], 'wow', 2, 1500);
    } });
  R.add({ id: 'pinwheel', pri: 50, test: (c) => (isP(c.e, 'pinwheel') ? one(c.e.x, c.e.y, 'pyoko') : null),
    run(c, ch) { const p = c.e; fetch(ch, p, 5000).say('ふーっ！', null, 1200, 'talk').do(() => { p.spin = true; PT.audio.sfx('whoosh'); }).pose('shy', 2000).face('laugh', 1200).say('くるくる〜！', 'pinwheel', 1300, 'yay').do(() => { p.spin = false; R.found('d_pinwheel'); }); } });

  /* ---------- がっき ---------- */
  const NOTES = { trumpet: [72, 76, 79, 84], guitar: [60, 64, 67, 72], tambourine: null, maracas: null, xylophone: [84, 86, 88, 91, 93] };
  const playInst = (type, n = 6) => {
    const A = PT.audio;
    for (let i = 0; i < n; i++) {
      const d = i * 0.22;
      if (type === 'tambourine' || type === 'maracas') A.noise(0.08, { vol: 0.15, filter: type === 'maracas' ? 5000 : 3500, delay: d });
      else { const ns = NOTES[type]; A.tone(440 * Math.pow(2, (ns[i % ns.length] - 69) / 12), 0.2, { type: type === 'trumpet' ? 'square' : type === 'guitar' ? 'triangle' : 'sine', vol: 0.1, delay: d }); }
    }
  };
  R.add({ id: 'instrument', pri: 50, test: (c) => (c.e.kind === 'prop' && tag(c.e, 'instrument') ? one(c.e.x, c.e.y) : null),
    run(c, ch) {
      const ins = c.e;
      const others = nearP(ins.x, ins.y, 700, (p) => p !== ins && tag(p, 'instrument') && !p.hidden);
      if (others.length) {
        const all = [ins].concat(others).slice(0, 4);
        const players = R.avail(ins.x, ins.y, [], 3000).slice(0, all.length);
        X.music(ins.x, ins.y - 160, 6000); PT.audio.sfx('jingle');
        players.forEach((p, i) => { const it = all[i]; R.claim(p, 9000).to(it, -40, 4, true).hold(it.type).do(() => { it.hidden = true; playInst(it.type, 10); }).say(i === 0 ? 'バンド はじめるよ！' : '', it.type, 1400, 'yay').pose('dance', 3600).unhold().do(() => { it.hidden = false; it.x = p.x + 40; it.y = p.y + 4; }); });
        R.free(ins.x, ins.y, players, 3000).forEach((o) => R.claim(o, 6000).look(ins.x).pose('cheer', 4500));
        W.after(4000, () => R.found('d_band'));
        return;
      }
      fetch(ch, ins, 7000).hold(ins.type).do(() => { ins.hidden = true; playInst(ins.type); X.music(ch.x, ch.y - 180, 2500); }).say('♪〜', ins.type, 1400, null).pose('dance', 2400).unhold()
        .do(() => { ins.hidden = false; ins.x = ch.x + 40; ins.y = ch.y + 4; R.found('d_instrument'); });
      R.audience(ch.x, ch.y, [ch], 'cheer', 2, 900);
    } });
  R.add({ id: 'musicbox', pri: 52, test: (c) => (isP(c.e, 'musicbox') ? 1 : null),
    run(c) {
      const m = c.e; m.playing = true;
      [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84].forEach((n, i) => PT.audio.tone(440 * Math.pow(2, (n - 57) / 12), 0.5, { type: 'sine', vol: 0.12, delay: i * 0.35 }));
      X.music(m.x, m.y - 80, 4200);
      R.free(m.x, m.y, [], 1500).slice(0, 4).forEach((ch, i) => R.claim(ch, 7000).look(m.x).pose('dance', 1800).face('sleep', 3000).say(i === 0 ? 'ねむくなっちゃう…' : '', 'zzz', 1400, null).pose('sleep', 2400).face('happy'));
      W.after(4500, () => { m.playing = false; R.found('d_musicbox'); });
    } });

  /* ---------- のりもの ---------- */
  R.add({ id: 'vehicle', pri: 44, test: (c) => (c.e.kind === 'prop' && tag(c.e, 'vehicle') && !['tricycle', 'car'].includes(c.e.type) && !c.e.rider ? one(c.e.x, c.e.y) : null),
    run(c, ch) {
      const v = c.e;
      switch (v.type) {
        case 'skateboard':
          R.claim(ch, 9000).to(v, 0, -3, true).do(() => { R.ride(ch, v, { z: 18, pose: 'cheer', carry: true }); const a = W.act(ch).say('いくぜ！', 'skateboard', 1200, 'yay'); const p = W.randFloor(200); a.go(p.x, p.y).jump(110, 700).say('きまった！', 'star', 1200, 'yay').go(p.x + 150, p.y).do(() => { R.unride(ch); R.found('d_skate'); }); });
          R.mimic(ch, 'cheer', 1200, 'かっこいい！');
          break;
        case 'airplane':
          R.claim(ch, 10000).to(v, 0, -3, true).do(() => {
            R.ride(ch, v, { z: 30, pose: 'ride' }); PT.audio.sfx('whoosh');
            const sx = v.x, sy = v.y;
            R.tween(ch, 5500, (k) => { const a = k * PT.TAU; v.x = sx + Math.sin(a) * 380; v.y = sy; v.z = Math.sin(k * Math.PI) * 330; ch.x = v.x; ch.y = v.y - 2; ch.z = v.z + 30; ch.flip = Math.cos(a) < 0; ch.pose = 'ride'; ch.face = 'laugh'; }, () => { v.z = 0; ch.face = 'happy'; R.unride(ch); W.act(ch).say('ただいま！', 'heart', 1300, 'yay'); R.found('d_airplane'); });
          });
          R.audience(v.x, v.y, [ch], 'wow', 2, 1500);
          break;
        case 'bus': {
          const riders = R.avail(v.x, v.y, [], 3000).slice(0, 5);
          riders.forEach((r, i) => R.claim(r, 12000).go(v.x - 60, v.y + 20, true).do(() => { r.hidden = true; r.stay = true; }));
          PT.audio.sfx('ding');
          W.after(2600, () => {
            const sx = v.x; PT.audio.sfx('train');
            R.tween(v, 5000, (k) => { v.x = sx + Math.sin(k * Math.PI) * (sx > 800 ? -500 : 500); v.wobbleUntil = W.t + 50; }, () => {
              riders.forEach((r, i) => { r.hidden = false; r.stay = false; const p = W.clampFloor(v.x - 150 + i * 70, v.y + 40); r.x = p.x; r.y = p.y; r.scale = W.depthScale(r.y); R.claim(r, 2000).say(i === 0 ? 'とうちゃく！' : '', 'star', 1200, 'yay').pose('cheer', 900); });
              R.found('d_bus');
            });
          });
          if (riders[0]) W.after(2000, () => W.bigText('しゅっぱつ しんこう！', v.x, v.y - 160, '#ff8a1f'));
          break;
        }
        case 'ambulance': case 'firetruck':
          W.bigText(v.type === 'ambulance' ? 'ピーポー ピーポー' : 'ウーウー！', v.x, v.y - 140, '#e8424a');
          for (let i = 0; i < 4; i++) PT.audio.tone(i % 2 ? 660 : 880, 0.4, { type: 'square', vol: 0.05, delay: i * 0.4 });
          R.claim(ch, 9000).to(v, 0, -3, true).do(() => {
            R.ride(ch, v, { z: 26, pose: 'ride', carry: true });
            if (v.type === 'firetruck') { if (!ch.wear.hat) ch.wear = Object.assign({}, ch.wear, { hat: 'firehat' }); }
            else if (!ch.wear.body) ch.wear = Object.assign({}, ch.wear, { body: 'doctor' });
            const p = W.randFloor(200);
            W.act(ch).say('しゅつどう！', v.type, 1300, 'yay').go(p.x, p.y).do(() => { R.unride(ch); if (v.type === 'firetruck') R.ROLES.fire(ch); else { const pat = R.free(ch.x, ch.y, [ch], 1500)[0] || nearP(ch.x, ch.y, 1500, (q) => tag(q, 'plush'))[0]; if (pat) R.checkup(ch, pat); } R.found('d_rescue'); });
          });
          break;
        case 'horse':
          R.claim(ch, 7000).to(v, 0, -3, true).do(() => { R.ride(ch, v, { z: 50, pose: 'ride' }); PT.audio.sfx('pop'); }).say('ぱっかぱか！', 'horse', 1400, 'yay')
            .do(() => { R.tween(ch, 3000, (k) => { ch.z = 50 + Math.sin(k * 18) * 8; }, () => { R.unride(ch); R.found('d_horse'); }); });
          break;
        case 'boat': {
          const w = W.fixes().find((f) => f.def.area === 'water');
          if (w) { v.x = PT.clamp(v.x, w.x - w.w * 0.35, w.x + w.w * 0.35); v.y = w.y - 40; v.scale = W.depthScale(w.y); }
          R.claim(ch, 9000).go(v.x, v.y + 30, true).do(() => {
            R.ride(ch, v, { z: 20, pose: 'ride' });
            const sx = v.x;
            R.tween(ch, 4500, (k) => { v.x = sx + Math.sin(k * PT.TAU) * 120; ch.x = v.x; ch.z = 20 + Math.sin(k * 20) * 3; }, () => { R.unride(ch); R.found('d_boat'); });
          }).say('すいすい〜', 'boat', 1400, 'yay');
          break;
        }
        case 'seesaw': {
          const b = R.free(v.x, v.y, [ch], 2000)[0];
          if (!b) { R.claim(ch, 3000).to(v, 0, 10).say('ひとりじゃ うごかない…', 'sweat', 1500, 'hmm').face('laugh', 1000); break; }
          const s = v.scale;
          R.claim(ch, 9000).go(v.x - 85 * s, v.y + 2, true); R.claim(b, 9000).go(v.x + 80 * s, v.y + 2, true);
          W.after(1800, () => {
            v.rock = true; ch.stay = b.stay = true;
            R.tween(ch, 4000, (k) => { const a = Math.sin(W.t * 0.005) * 0.2; ch.x = v.x - 85 * s; ch.z = (44 - Math.sin(a) * 85) * s; ch.pose = 'sit'; ch.face = 'laugh'; }, () => { ch.z = 0; ch.stay = false; v.rock = false; R.found('d_seesaw'); });
            R.tween(b, 4000, (k) => { const a = Math.sin(W.t * 0.005) * 0.2; b.x = v.x + 80 * s; b.z = (44 + Math.sin(a) * 80) * s; b.pose = 'sit'; b.face = 'laugh'; }, () => { b.z = 0; b.stay = false; });
            W.say(ch, 'ぎったん！', null, 1400, 'yay'); W.after(1500, () => W.say(b, 'ばったん！', null, 1400, 'yay'));
          });
          break;
        }
        case 'pool': {
          const kids = R.avail(v.x, v.y, [], 2000).slice(0, 3);
          kids.forEach((k2, i) => R.claim(k2, 8000).go(v.x - 40 + i * 40, v.y - 6, true).do(() => { k2.rest = 'swim'; k2.stay = true; X.splash(k2.x, k2.y - 10); }).say(i === 0 ? 'ぱしゃぱしゃ！' : 'つめたーい！', null, 1300, 'laugh').pose('swim', 2600).do(() => { X.splash(k2.x, k2.y); k2.rest = 'idle'; k2.stay = false; const p = W.clampFloor(k2.x, v.y + 60); k2.y = p.y; }).jump(50, 500));
          W.after(3000, () => R.found('d_pool'));
          break;
        }
        default: R.driveAround(ch, v); break;
      }
    } });
  R.add({ id: 'ride-char2', pri: 76, test: (c) => (isC(c.e) && c.tgt && c.tgt.kind === 'prop' && tag(c.tgt, 'vehicle') && !['tricycle', 'car'].includes(c.tgt.type) && !c.tgt.rider ? c.tgt : null),
    run(c, v) { R.list.find((q) => q.id === 'vehicle').run({ e: v, x: v.x, y: v.y }, c.e); } });

  /* ---------- ふしぎ ---------- */
  R.add({ id: 'snow', pri: 52, test: (c) => (isP(c.e, 'snow') ? 1 : null),
    run(c) {
      const s = c.e; W.remove(s);
      let acc = 0;
      W.special({ type: 'snowfall', max: 7000, step(f, dt) { acc += dt; if (acc > 50) { acc = 0; W.fx.push({ type: 'spark', x: PT.rand(W.visLeft, W.visRight), y: PT.rand(-20, 100), vx: PT.rand(-0.03, 0.03), vy: 0.12, life: 0, max: 5000, size: PT.rand(5, 9), col: '#ffffff', rot: 0, vr: 0.002, g: 0 }); } }, draw(c2, f, k) { c2.fillStyle = `rgba(220,235,255,${0.2 * Math.sin(k * Math.PI)})`; c2.fillRect(-500, -100, 2600, 1200); } });
      PT.audio.sfx('sparkle');
      const kids = R.avail(s.x, s.y, [], 2500).slice(0, 3);
      kids.forEach((k2, i) => R.claim(k2, 7000).look(s.x).face('surprise', 900).say(i === 0 ? 'ゆきだー！' : 'つめたい！', 'snow', 1400, 'wow').to({ x: s.x, y: s.y }, -120 + i * 90, 20, true).pose('peek', 1600).face('laugh', 1200));
      W.after(3500, () => { const sm = W.addProp('snowman', s.x, s.y + 4, { temp: true }); sm.pop = W.t; PT.audio.sfx('cheer'); kids.forEach((k2) => R.claim(k2, 2500).pose('cheer', 1500)); R.found('d_snow'); });
    } });
  R.add({ id: 'carpet', pri: 52, test: (c) => (isP(c.e, 'carpet') ? one(c.e.x, c.e.y, 'mimi') : null),
    run(c, ch) {
      const cp = c.e;
      R.claim(ch, 10000).to(cp, 0, -3, true).do(() => {
        R.ride(ch, cp, { z: 14, pose: 'sit' }); PT.audio.sfx('magic');
        const sx = cp.x, sy = cp.y;
        R.tween(ch, 6000, (k) => { const a = k * PT.TAU; cp.x = sx + Math.sin(a) * 420; cp.y = sy; cp.z = Math.sin(k * Math.PI) * 300 + Math.sin(k * 20) * 8; ch.x = cp.x; ch.y = cp.y - 2; ch.z = cp.z + 14; ch.pose = 'sit'; ch.face = 'laugh'; if (Math.random() < 0.2) W.burst('spark', cp.x, cp.y - cp.z, 1, { sp: 0.05, max: 600, col: '#ffd23f', g: 0 }); }, () => { cp.z = 0; ch.face = 'happy'; R.unride(ch); W.act(ch).say('そらの さんぽ たのしかった！', 'star', 1500, 'yay'); R.found('d_carpet'); });
      }).say('ひらけ ごま〜！', 'carpet', 1300, 'yay');
      R.audience(cp.x, cp.y, [ch], 'wow', 2, 1500);
    } });
  R.add({ id: 'lamp', pri: 52, test: (c) => (isP(c.e, 'lamp') ? one(c.e.x, c.e.y) : null),
    run(c, ch) {
      const l = c.e;
      fetch(ch, l, 7000).pose('hold', 400).say('ごしごし…', null, 1300, 'talk').pose('tickle', 1200)
        .do(() => {
          PT.audio.sfx('magic'); W.burst('smoke', l.x + 20, l.y - 60, 14, { up: true, sp: 0.12, max: 1500, size: 26, col: '#c4a8ee', g: 0 });
          W.after(900, () => { for (let i = 0; i < 3; i++) { const p = W.clampFloor(l.x - 140 + i * 140, l.y + 50); const it = W.addProp(PT.pick(['present', 'cake', 'star', 'balloon', 'teddy', 'flower']), p.x, p.y, { temp: true }); if (it) { it.pop = W.t + i * 200; if (it.def.float) it.y -= 120; } } R.found('d_lamp'); });
        }).face('surprise', 900).say('ねがいが かなった！', 'star', 1500, 'wow').pose('cheer', 900);
    } });
  R.add({ id: 'egg', pri: 52, test: (c) => (isP(c.e, 'egg') ? 1 : null),
    run(c) {
      const e = c.e; e.wobbleUntil = W.t + 2500;
      R.free(e.x, e.y, [], 1500).slice(0, 3).forEach((ch, i) => R.claim(ch, 6000).go(e.x - 140 + i * 140, e.y + 50, true).look(e.x).say(i === 0 ? 'うごいてる！' : '', '!', 1200, 'wow').pose('peek', 1800).face('love', 1500).pose('cheer', 900));
      W.after(2600, () => {
        W.remove(e); PT.audio.sfx('pop'); W.burst('star', e.x, e.y - 40, 10, { up: true, sp: 0.2 });
        const pts = [[e.x, e.y + 4, 1], [e.x, e.y + 4, 800]];
        for (let i = 0; i < 4; i++) { const p = W.randFloor(200); pts.push([p.x, p.y, 1600]); }
        X.critter('chick', pts);
        PT.audio.tone(1800, 0.1, { type: 'sine', vol: 0.1 }); PT.audio.tone(1900, 0.1, { type: 'sine', vol: 0.1, delay: 0.15 });
        R.found('d_egg');
      });
    } });
  R.add({ id: 'chest', pri: 52, test: (c) => (isP(c.e, 'chest') && !c.e.open ? one(c.e.x, c.e.y, 'pon') : null),
    run(c, ch) {
      const b = c.e;
      fetch(ch, b, 7000).say('なにが はいってるかな？', '?', 1400, 'hmm').pose('peek', 800).do(() => {
        b.open = true; PT.audio.sfx('discover'); W.burst('star', b.x, b.y - 60, 16, { up: true, sp: 0.3 });
        const pool = ['crown', 'tiara', 'present', 'star', 'cake', 'ball', 'shell', 'wand'];
        for (let i = 0; i < 3; i++) { const it = W.addProp(PT.pick(pool.filter((id) => PT.ITEMS[id])), b.x, b.y); const p = W.clampFloor(b.x - 160 + i * 160, b.y + 60); const sx = b.x, sy = b.y; it.temp = true; R.tween(it, 700, (k) => { it.x = PT.lerp(sx, p.x, k); it.y = PT.lerp(sy, p.y, k); it.z = Math.sin(k * Math.PI) * 140; it.scale = W.depthScale(it.y); }, () => { it.z = 0; }); }
      }).face('surprise', 900).say('おたからだ！', 'star', 1500, 'wow').pose('cheer', 1000).do(() => { R.found('d_chest'); W.after(6000, () => { b.open = false; }); });
      R.audience(b.x, b.y, [ch], 'wow', 2, 1400);
    } });
  R.add({ id: 'mirrorball', pri: 52, test: (c) => (isP(c.e, 'mirrorball') ? 1 : null),
    run(c) {
      const m = c.e;
      W.special({ type: 'disco', max: 6000, draw(c2, f, k) {
        const a = Math.sin(k * Math.PI);
        c2.fillStyle = `rgba(30,20,70,${0.35 * a})`; c2.fillRect(-500, -100, 2600, 1200);
        for (let i = 0; i < 6; i++) { const ang = f.life * 0.002 + i; const x = m.x + Math.cos(ang) * 500, y = 700 + Math.sin(ang * 1.3) * 120; c2.fillStyle = `rgba(${['255,120,170', '120,200,255', '255,230,120'][i % 3]},${0.35 * a})`; c2.beginPath(); c2.moveTo(m.x, m.y - (m.z || 0) - 50); c2.lineTo(x - 50, y); c2.lineTo(x + 50, y); c2.closePath(); c2.fill(); }
      } });
      PT.audio.sfx('jingle'); X.music(m.x, m.y - 120, 5500);
      R.danceAll(m.x, 750, 5200);
      W.after(2500, () => R.found('d_disco'));
    } });
  R.add({ id: 'moon', pri: 52, test: (c) => (isP(c.e, 'moon') ? 1 : null),
    run(c) {
      const m = c.e; m.zTarget = m.y > W.stage.floor[0] ? 260 : 0;
      const stars = Array.from({ length: 40 }, () => [PT.rand(W.visLeft, W.visRight), PT.rand(40, 380), Math.random() * 6]);
      W.special({ type: 'night', max: 9000, draw(c2, f, k) {
        const a = Math.min(1, Math.sin(k * Math.PI) * 1.6);
        c2.fillStyle = `rgba(20,25,80,${0.45 * a})`; c2.fillRect(-500, -100, 2600, 1200);
        stars.forEach(([x, y, s]) => { c2.globalAlpha = a * (0.6 + Math.sin(f.life * 0.004 + s) * 0.4); G.star(c2, x, y, 7, 3); c2.fillStyle = '#fff6b8'; c2.fill(); });
        c2.globalAlpha = 1;
      } });
      PT.audio.sfx('magic');
      R.avail(m.x, 760).slice(0, 4).forEach((ch, i) => R.claim(ch, 7000).look(m.x).face('surprise', 800).say(i === 0 ? 'よるに なった！' : i === 1 ? 'おほしさま！' : '', 'moon', 1400, 'wow').pose('point', 1500).face('sleep', 2500).pose('sleep', 2500).face('happy'));
      W.after(2000, () => R.found('d_moon'));
    } });
  R.add({ id: 'cloud', pri: 52, test: (c) => (isP(c.e, 'cloud') ? 1 : null),
    run(c) {
      const cl = c.e; if (cl.y > W.stage.floor[0]) cl.zTarget = 250;
      R.rainFx(4200);
      R.avail(cl.x, 760).slice(0, 3).forEach((ch, i) => R.claim(ch, 7000).face('surprise', 800).say(i === 0 ? 'あめだー！' : 'ぬれちゃう！', 'sweat', 1300, 'wow').pose('shy', 2600).face('laugh', 1000));
      W.after(4300, () => { X.rainbow(5000); PT.audio.sfx('sparkle'); R.avail(800, 760).slice(0, 3).forEach((ch, i) => R.claim(ch, 3000).look(800).say(i === 0 ? 'にじ だー！' : '', 'rainbow', 1400, 'yay').pose('point', 1500)); R.found('d_cloud'); });
    } });
  R.add({ id: 'petals', pri: 52, test: (c) => (isP(c.e, 'petals') ? 1 : null),
    run(c) {
      W.remove(c.e);
      let acc = 0;
      W.special({ type: 'petals', max: 5000, step(f, dt) { acc += dt; if (acc > 60) { acc = 0; W.fx.push({ type: 'leaf', x: PT.rand(W.visLeft, W.visRight), y: PT.rand(-20, 80), vx: PT.rand(-0.06, 0.06), vy: PT.rand(0.06, 0.12), life: 0, max: 5000, size: 16, col: PT.pick(['#ff8fab', '#ffb3c8', '#ffffff', '#ffd1e0']), rot: PT.rand(0, 6), vr: 0.004, g: 0 }); } }, draw() {} });
      PT.audio.sfx('sparkle');
      R.avail(c.e.x, c.e.y).slice(0, 5).forEach((ch, i) => R.claim(ch, 5000).wait(i * 150).face('love', 1500).say(i === 0 ? 'きれい〜！' : '', 'flower', 1300, 'yay').pose('spin', 1500).pose('dance', 1500));
      W.after(1500, () => R.found('d_petals'));
    } });
})();
