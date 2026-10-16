/* 追加の いしょう：かわいい へんしんと その あそび */
'use strict';
(() => {
  const W = PT.world, R = PT.R, D = R.D, X = PT.FX;
  const ROLES = R.ROLES;

  D('d_cat', 'ねこごっこ', 'ねこみみを つけると「ニャー」。みんなが なでなで', ['catears', 'mimi']);
  D('d_flowercrown', 'おはなばたけ', 'はなかんむりを かぶると まわりに おはなが さいたよ', ['flowercrown', 'pyoko']);
  D('d_princess', 'おひめさまの ぶとうかい', 'ドレスや ティアラで くるくる おどろう', ['dress', 'tiara']);
  D('d_ballet', 'バレリーナ', 'チュチュを はいて つまさきで くるり', ['tutu', 'choco']);
  D('d_fairy', 'ようせいに なった', 'はねを つけると ふわっと そらへ', ['wings', 'pyoko']);
  D('d_cute', 'リボンで ポーズ', 'おおきな リボンで「かわいい？」', ['ribbon', 'mimi']);
  D('d_pirate', 'かいぞくごっこ', 'かいぞくの ぼうしで たからさがしへ しゅっぱつ', ['pirate', 'present']);
  D('d_fire', 'しょうぼうしごっこ', 'しょうぼうしの ぼうしで「しょうか しまーす！」', ['firehat', 'gaku']);
  D('d_police', 'おまわりさんごっこ', 'ピピーッ！みんなで ならんで おうだんほどう', ['police', 'lulu']);
  D('d_santa', 'サンタさんごっこ', 'サンタさんが みんなに プレゼント', ['santa', 'present']);
  D('d_nightcap', 'おやすみごっこ', 'ナイトキャップで「おやすみなさい」。みんなも ふわぁ…', ['nightcap', 'moko']);
  D('d_artist', 'がかさんごっこ', 'ベレーぼうで おともだちの えを かいたよ', ['beret', 'choco']);
  D('d_frog', 'かえるの うた', 'かえるの フードで ケロケロ ぴょーん', ['frog', 'pon']);
  D('d_yukata', 'ゆかたで おまつり', 'ゆかたを きると おまつり きぶん', ['yukata', 'firework']);
  D('d_rain', 'あめふり ぴちゃぴちゃ', 'レインコートで あめの なかを おさんぽ', ['raincoat', 'duck']);
  D('d_gentle', 'しんしの あいさつ', 'ちょうネクタイで「ごきげんよう」', ['bowtie', 'gaku']);
  D('d_love', 'ハートが いっぱい', 'ハートの めがねで みんなに ハートを とどけよう', ['heartglasses', 'mimi']);
  D('d_mustache', 'おひげの おじさん', 'おひげを つけたら「えっへん！」みんな おおわらい', ['mustache', 'pon']);

  const near = (ch, n = 2, r = 900) => R.free(ch.x, ch.y, [ch], r).slice(0, n);

  ROLES.cat = (ch) => {
    R.claim(ch, 4000).pose('peek', 900).say('ニャー！', 'catears', 1400, 'yay').pose('tickle', 900).face('laugh', 1000).do(() => R.found('d_cat'));
    near(ch, 1, 500).forEach((o) => R.claim(o, 3000).look(ch.x).say('よしよし', 'heart', 1400).pose('hold', 1400).face('love', 1200));
    R.mimic(ch, 'peek', 1200, 'ニャーニャー！');
  };
  ROLES.flower = (ch) => {
    R.claim(ch, 4000).pose('cheer', 900).say('おはな いっぱい！', 'flower', 1500, 'yay').do(() => {
      PT.audio.sfx('magic');
      for (let i = 0; i < 5; i++) { const p = W.clampFloor(ch.x + PT.rand(-220, 220), ch.y + PT.rand(-50, 60)); const f = W.addProp('flower', p.x, p.y, { temp: true }); if (f) f.pop = W.t + i * 120; }
      W.burst('heart', ch.x, ch.y - 150, 6, { up: true, sp: 0.12, max: 1000 });
      R.found('d_flowercrown');
    }).face('love', 1500).pose('shy', 1200);
  };
  ROLES.princess = (ch) => {
    const partner = near(ch, 1, 700)[0];
    R.claim(ch, 5000).say('ぶとうかいへ ようこそ', 'tiara', 1500, 'yay').pose('bow', 700).pose('spin', 1400).pose('dance', 1600).do(() => R.found('d_princess'));
    X.music(ch.x, ch.y - 200, 3500);
    if (partner) R.claim(partner, 5000).look(ch.x).pose('bow', 900).say('おどりましょう', 'heart', 1400).pose('dance', 2400).face('laugh', 1000);
  };
  ROLES.ballet = (ch) => {
    R.claim(ch, 4000).say('くるりん！', 'tutu', 1300, 'yay').pose('spin', 1200).jump(40, 500).pose('spin', 900).face('laugh', 900).do(() => { W.burst('star', ch.x, ch.y - 120, 8, { sp: 0.15, max: 800 }); R.found('d_ballet'); });
    R.mimic(ch, 'spin', 1200, 'わたしも くるり');
  };
  ROLES.fairy = (ch) => {
    R.claim(ch, 4500).say('ようせいさん だよ', 'wings', 1400, 'yay').do(() => {
      PT.audio.sfx('magic');
      R.tween(ch, 2600, (k) => { ch.z = Math.sin(k * Math.PI) * 140; ch.pose = 'jump'; if (Math.random() < 0.25) W.burst('spark', ch.x + PT.rand(-40, 40), ch.y - ch.z - 80, 1, { sp: 0.06, max: 700, size: 8, col: PT.pick(['#ffd23f', '#ff8fab', '#7fd0e8']), g: 0 }); }, () => { ch.z = 0; R.found('d_fairy'); });
    });
    R.audience(ch.x, ch.y, [ch], 'wow', 2, 600);
  };
  ROLES.cute = (ch) => {
    R.claim(ch, 3500).pose('shy', 900).say('かわいい？', 'ribbon', 1400, 'talk').face('love', 1200).pose('dance', 1000).do(() => R.found('d_cute'));
    near(ch, 1, 600).forEach((o) => R.claim(o, 2500).look(ch.x).face('love', 1200).say('かわいい！', 'heart', 1300, 'yay').pose('cheer', 900));
  };
  ROLES.pirate = (ch) => {
    const crew = near(ch, 2, 1200);
    const dest = W.randFloor(220);
    R.claim(ch, 9000).say('たからは どこだー！', 'pirate', 1500, 'yay').pose('point', 900).go(dest.x, dest.y, true).pose('peek', 900).do(() => X.dig(ch.x + 40, ch.y))
      .do(() => { const g = W.addProp('present', ch.x + 60, ch.y + 6, { temp: true }); g.pop = W.t; PT.audio.sfx('discover'); W.burst('star', g.x, g.y - 40, 10, { up: true }); R.found('d_pirate'); })
      .say('おたから はっけん！', 'present', 1500, 'yay').pose('cheer', 900);
    crew.forEach((o, i) => R.claim(o, 9000).wait(500 + i * 300).say(i ? 'アイアイサー！' : 'おー！', null, 1100, 'yay').go(dest.x - 90 - i * 70, dest.y + 20, true).pose('cheer', 900));
  };
  ROLES.fire = (ch) => {
    const tx = PT.clamp(ch.x + (ch.flip ? -260 : 260), W.visLeft + 100, W.visRight - 100);
    R.claim(ch, 5000).say('しょうか しまーす！', 'firehat', 1500, 'yay').look(tx).pose('point', 2200).do(() => {
      PT.audio.sfx('splash');
      let n = 0; const spray = () => { if (n++ > 10) return; W.burst('drop', ch.x + (tx > ch.x ? 40 : -40), ch.y - 110, 3, { sp: 0.35, minSp: 0.25, g: 0.0009, max: 900, size: 12 }); W.fx.slice(-3).forEach((f) => { f.vx = Math.abs(f.vx) * (tx > ch.x ? 1 : -1); f.vy = -Math.abs(f.vy) * 0.6; }); W.after(150, spray); };
      spray();
    }).say('ちんか かんりょう！', 'star', 1400, 'yay').pose('cheer', 800).do(() => R.found('d_fire'));
    R.audience(ch.x, ch.y, [ch], 'cheer', 2, 1800);
  };
  ROLES.police = (ch) => {
    const kids = near(ch, 3, 1500);
    PT.audio.tone(2200, 0.25, { type: 'square', vol: 0.06 }); PT.audio.tone(2400, 0.4, { type: 'square', vol: 0.06, delay: 0.3 });
    W.bigText('ピピーッ！', ch.x, ch.y - 230, '#2f4a8a');
    R.claim(ch, 7000).pose('wave', 1200).say('おうだんほどうを わたりまーす', 'police', 1800, 'talk').pose('point', 2400).do(() => R.found('d_police'));
    kids.forEach((o, i) => R.claim(o, 7000).wait(600).go(ch.x + 80 + i * 80, ch.y + 40).pose('cheer', 300).say(i === 0 ? 'はーい！' : '', null, 1000, 'yay').go(ch.x + 80 + i * 80, ch.y + 140).pose('wave', 900));
  };
  ROLES.santa = (ch) => {
    const kids = near(ch, 4, 2000);
    const a = R.claim(ch, 12000).say('メリークリスマス！', 'santa', 1600, 'yay').pose('cheer', 700);
    kids.forEach((o) => a.to(o, o.x < ch.x ? 90 : -90, 4).look(o.x).say('どうぞ！', 'present', 1100, 'yay').do(() => { const g = W.addProp('present', o.x + 40, o.y + 6, { temp: true }); g.pop = W.t; PT.audio.sfx('ding'); R.claim(o, 2500).face('love', 1200).say('ありがとう！', 'heart', 1300, 'yay').pose('cheer', 900); }));
    a.say('ホッホッホー！', 'star', 1400, 'laugh').do(() => R.found('d_santa'));
  };
  ROLES.sleepy = (ch) => {
    R.nap(ch, ch, 'おやすみなさい…');
    near(ch, 2, 900).forEach((o, i) => W.after(1200 + i * 500, () => R.claim(o, 3000).face('sleep', 1500).say('ふわぁ…', 'zzz', 1300, 'hmm').pose('sleep', 1500).face('happy')));
    W.after(1500, () => R.found('d_nightcap'));
  };
  ROLES.artist = (ch) => {
    const model = near(ch, 1, 1000)[0];
    R.claim(ch, 6000).say('え を かくよ！', 'beret', 1400, 'yay').pose('hold', 2000).do(() => {
      const cid = model ? model.cid : ch.cid;
      const icon = PT.iconCache.char(cid, 96);
      W.special({ type: 'easel', x: ch.x + (ch.flip ? -110 : 110), y: ch.y, max: 5000, draw(c, f, k) {
        c.save(); c.translate(f.x, f.y);
        c.strokeStyle = '#8a5a2b'; c.lineWidth = 6; c.beginPath(); c.moveTo(-40, 0); c.lineTo(-10, -200); c.moveTo(40, 0); c.lineTo(10, -200); c.stroke();
        PT.G.rr(c, -60, -190, 120, 100, 6); PT.G.fillO(c, '#ffffff', 4);
        c.globalAlpha *= Math.min(1, f.life / 1200); c.drawImage(icon, -44, -186, 88, 88);
        c.restore();
      } });
      PT.audio.sfx('sparkle');
    }).say('できた！ にてる？', 'star', 1500, 'yay').pose('cheer', 900).do(() => R.found('d_artist'));
    if (model) R.claim(model, 6000).look(ch.x).pose('point', 1800).say('ポーズ！', 'star', 1300).wait(1400).face('laugh', 1200).say('そっくり！', 'heart', 1300, 'laugh');
  };
  ROLES.frog = (ch) => {
    R.claim(ch, 5000).say('ケロケロ！', 'frog', 1300, 'yay').jump(70, 450).jump(70, 450).jump(70, 450).face('laugh', 1000).say('かえるの うた！', 'note', 1400, 'yay').do(() => R.found('d_frog'));
    X.music(ch.x, ch.y - 180, 2500);
    R.mimic(ch, 'jump', 1200, 'ケロケロ まねっこ');
  };
  ROLES.yukata = (ch) => {
    R.claim(ch, 5000).say('おまつり みたい！', 'yukata', 1500, 'yay').pose('dance', 2400).do(() => {
      for (let i = 0; i < 3; i++) W.after(i * 500, () => X.firework(PT.rand(Math.max(300, W.visLeft + 200), Math.min(1300, W.visRight - 200)), PT.rand(200, 330)));
      R.found('d_yukata');
    });
    near(ch, 2, 900).forEach((o, i) => W.after(600 + i * 300, () => R.claim(o, 3000).look(ch.x).pose('dance', 2200).face('laugh', 1200)));
  };
  ROLES.rain = (ch) => {
    let acc = 0;
    W.special({ type: 'rain', max: 4500, step(f, dt) { acc += dt; if (acc > 40) { acc = 0; W.fx.push({ type: 'drop', x: PT.rand(W.visLeft, W.visRight), y: PT.rand(0, 200), vx: -0.05, vy: 0.9, life: 0, max: 900, size: 9, g: 0 }); } }, draw() {} });
    PT.audio.sfx('wave');
    R.claim(ch, 5500).say('あめ だー！', 'raincoat', 1300, 'yay').jump(40, 450).do(() => PT.FX.splash(ch.x, ch.y)).jump(40, 450).do(() => PT.FX.splash(ch.x, ch.y)).face('laugh', 1200).say('ぴちゃぴちゃ！', null, 1300, 'laugh').do(() => R.found('d_rain'));
    near(ch, 2, 900).forEach((o) => R.claim(o, 3000).look(ch.x).face('surprise', 900).say('つめたい！', 'sweat', 1300, 'wow').pose('shy', 1200).face('laugh', 900));
  };
  ROLES.gentle = (ch) => {
    const o = near(ch, 1, 800)[0];
    R.claim(ch, 4000).pose('bow', 1000).say('ごきげんよう', 'bowtie', 1600, 'talk').face('laugh', 900).do(() => R.found('d_gentle'));
    if (o) R.claim(o, 3000).look(ch.x).pose('bow', 1000).say('ごきげんよう〜', null, 1400).face('laugh', 1000);
  };
  ROLES.love = (ch) => {
    R.claim(ch, 4000).say('みんな だいすき！', 'heart', 1600, 'yay').pose('hug', 1500).do(() => {
      R.chars().filter((o) => o !== ch).forEach((o, i) => W.after(i * 200, () => { W.burst('heart', o.x, o.y - 170 * o.scale, 3, { up: true, sp: 0.1, max: 1000 }); W.setFace(o, 'love', 1500); }));
      R.found('d_love');
    });
  };
  ROLES.mustache = (ch) => {
    R.claim(ch, 3500).pose('think', 900).say('えっへん！', 'mustache', 1300, 'talk').face('laugh', 1200).pose('cheer', 700).do(() => R.found('d_mustache'));
    R.audience(ch.x, ch.y, [ch], 'laugh', 3, 800);
  };
})();
