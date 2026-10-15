/* キャラクター同士の掛け合い・タップ反応・ふだんの行動（アンビエント） */
'use strict';
(() => {
  const W = PT.world, R = PT.R, D = R.D;
  const { isP, isC, tag, nearP, firstP, role } = R.h;

  D('d_hug', 'ぎゅー なかよし', 'キャラを キャラに かさねると ぎゅっと ハグ', ['lulu', 'pon']);
  D('d_highfive', 'ハイタッチ', 'キャラを となりに おくと「イエーイ！」', ['choco', 'gaku']);
  D('d_tickle', 'こちょこちょ', 'キャラを なんかいも タップすると くすぐったい！', ['mimi']);
  D('d_funnyface', 'ポンの へんがお', 'ポンを タップすると へんがお。みんな おおわらい', ['pon']);
  D('d_lulucall', 'ルルの「みてみて！」', 'ルルは あたらしい ものを みつけると みんなを よぶ', ['lulu', 'star']);
  D('d_sleep', 'モコの おひるね', 'モコは のんびり。すぐ ねむくなっちゃう', ['moko']);
  D('d_hide', 'かくれんぼ', 'なんども タップすると あそびが はじまる。かくれんぼ！', ['lulu', 'choco', 'sofa']);
  D('d_tag', 'おにごっこ', 'まてまてー！ タッチしたら こんどは おに', ['pon', 'choco']);
  D('d_secret', 'ないしょばなし', 'ふたりで ひそひそ。なにを はなしてるのかな？', ['mimi', 'choco']);
  D('d_oops', 'ころんでも へっちゃら', 'ポンが ころんだ！でも わらって たちあがる', ['pon', 'gaku']);
  D('d_gakuidea', 'ガクの アイデア', 'ガクを タップすると、まわりの ものを つかって あそびを かんがえる', ['gaku', 'box']);

  /* ---------- キャラを キャラに かさねる・となりに おく ---------- */
  R.add({ id: 'hug', pri: 62, test: (c) => (isC(c.e) && isC(c.tgt) ? c.tgt : null),
    run(c, o) {
      const a = c.e;
      const p = R.besides(o, a.x < o.x ? -1 : 1, 70); a.x = p.x; a.y = p.y; a.scale = W.depthScale(a.y);
      R.claim(a, 3000).look(o.x).pose('hug', 1400).face('love', 1500).say('ぎゅー！', 'heart', 1300, 'yay').face('laugh', 900);
      R.claim(o, 3000).look(a.x).pose('hug', 1400).face('love', 1500).say('なかよし！', 'heart', 1300, 'yay');
      W.burst('heart', (a.x + o.x) / 2, a.y - 170, 6, { up: true, sp: 0.12, max: 1000 });
      R.found('d_hug');
    } });
  R.add({ id: 'highfive', pri: 40, test: (c) => (isC(c.e) && !c.tgt ? R.avail(c.e.x, c.e.y, [c.e], 230)[0] || null : null),
    run(c, o) {
      const a = c.e;
      R.claim(a, 2600).look(o.x).pose('wave', 500).do(() => { PT.audio.sfx('pop'); W.burst('star', (a.x + o.x) / 2, a.y - 160, 6, { sp: 0.15, max: 600 }); }).face('laugh', 1200).say('イエーイ！', 'star', 1200, 'yay').pose('cheer', 600);
      R.claim(o, 2600).look(a.x).pose('wave', 500).face('laugh', 1200).say('ハイタッチ！', null, 1200, 'yay');
      R.found('d_highfive');
    } });

  /* ---------- タップ：1かいめ＝せいかく、2かいめ＝こちょこちょ、3かいめ＝あそび ---------- */
  const personal = {
    lulu(ch) {
      const fresh = R.newestUnnoticed(ch);
      if (fresh) { fresh.noticed = true; R.callFriends(ch, fresh.x, fresh.y); R.found('d_lulucall'); W.after(1800, () => !fresh.removed && R.run('drop', { e: fresh, x: fresh.x, y: fresh.y, user: false })); return; }
      R.claim(ch, 3000).look(ch.x + (Math.random() < 0.5 ? -1 : 1)).face('puzzled', 900).say('なにか ないかな？', '?', 1300, 'hmm').pose('think', 900).face('happy').pose('point', 700).say('あっちに いこう！', '!', 1100, 'yay');
    },
    pon(ch) {
      R.claim(ch, 3000).face('silly', 1800).say('べー！', null, 1100, 'laugh').pose('tickle', 1200).face('laugh', 900);
      R.audience(ch.x, ch.y, [ch], 'laugh', 3, 500);
      W.after(800, () => R.found('d_funnyface'));
    },
    mimi(ch) {
      const ideas = [['apron', 'おみせやさん しよう？'], ['doctor', 'おいしゃさん ごっこは？'], ['cake', 'おちゃかい しない？'], ['book', 'えほん よもうか？']];
      const [icon, line] = PT.pick(ideas);
      const f = R.free(ch.x, ch.y, [ch], 1000)[0];
      R.claim(ch, 3200).pose('wave', 800).say(line, icon, 1700, 'talk').pose('shy', 900);
      if (f) W.after(900, () => R.claim(f, 2200).look(ch.x).say('いいね！', null, 1200, 'yay').pose('cheer', 800));
    },
    gaku(ch) {
      const p = nearP(ch.x, ch.y, 900, (q) => !q.temp && !q.def.food && !q.def.oneShot && q.mode !== 'fort')[0];
      R.claim(ch, 2600).pose('think', 900).say('ふむふむ…', null, 1100, 'hmm').do(() => W.burst('spark', ch.x + 20, ch.y - 125 * ch.scale, 3, { sp: 0.1, max: 500, size: 8, col: '#ffffff', g: 0 }))
        .say(p ? 'いいこと かんがえた！' : 'なにを つくろうかな', p ? '!' : '?', 1300, 'yay')
        .do(() => { if (p) { R.found('d_gakuidea'); R.run('drop', { e: p, x: p.x, y: p.y, user: false }); } });
    },
    choco(ch) {
      R.claim(ch, 4000).say('いっしょに おどろう！', 'note', 1400, 'yay').pose('dance', 2600).face('laugh', 900);
      R.free(ch.x, ch.y, [ch], 1200).slice(0, 3).forEach((o, i) => W.after(600 + i * 250, () => R.claim(o, 3200).look(ch.x).pose('dance', 2200).say(i === 0 ? 'まねっこ！' : '', null, 1100, 'yay')));
      W.after(1200, () => R.found('d_mimic'));
    },
    moko(ch) {
      if (ch.pose === 'sleep' || ch.rest === 'sleep') { ch.rest = 'idle'; R.claim(ch, 2000).face('surprise', 800).say('はっ！ おきた！', '!', 1200, 'wow').jump(40, 400).face('laugh', 800); return; }
      R.sleepy(ch);
    },
  };
  R.sleepy = (ch) => {
    R.claim(ch, 7000).say('ふわぁ…', 'zzz', 1200, 'hmm').pose('sleep', 400).face('sleep', 4500).do(() => W.burst('zzz', ch.x + 30, ch.y - 140, 3, { up: true, sp: 0.04, minSp: 0.02, g: -0.00001, max: 1800, size: 22, col: '#7a8fb8' }))
      .pose('sleep', 3800).face('happy').pose('cheer', 700).say('よく ねた〜', 'star', 1200, 'yay').do(() => R.found('d_sleep'));
  };
  R.newestUnnoticed = (ch) => W.props().filter((p) => !p.noticed && !p.temp && !p.hidden && !p.heldBy && !p.def.oneShot && p.mode !== 'fort' && W.t - p.bornT < 60000 && Math.hypot(p.x - ch.x, p.y - ch.y) < 1500).sort((a, b) => b.bornT - a.bornT)[0];

  R.add({ id: 'tap-tickle', on: 'tapchar', pri: 55, test: (c) => (c.e.tapN === 2 ? 1 : null),
    run(c) { const ch = c.e; PT.audio.sfx('tickle'); R.claim(ch, 2400).face('laugh', 1800).pose('tickle', 1500).say('くすぐったい！', null, 1300, 'laugh'); R.found('d_tickle'); } });
  R.add({ id: 'tap-game', on: 'tapchar', pri: 60, test: (c) => (c.e.tapN >= 3 ? 1 : null),
    run(c) { c.e.tapN = 0; if (R.chars().length >= 3 && Math.random() < 0.6) R.hideSeek(c.e); else if (R.chars().length >= 2) R.tagGame(c.e); else personal[c.e.cid](c.e); } });
  R.add({ id: 'tap-personal', on: 'tapchar', pri: 30, test: (c) => (personal[c.e.cid] ? 1 : null), run(c) { personal[c.e.cid](c.e); } });

  /* かくれんぼ */
  R.hideSeek = (oni) => {
    const spots = W.ents.filter((e) => (e.kind === 'fix' && !e.def.area && !e.def.sky && !e.def.wall && !e.def.hidden && e.h > 90) || (e.kind === 'prop' && ['box', 'tent', 'table', 'parasol', 'slide'].includes(e.type) && !e.hidden));
    const hiders = R.free(oni.x, oni.y, [oni], 3000).slice(0, 3);
    if (!hiders.length) return;
    R.claim(oni, 16000).say('かくれんぼ しよう！', '!', 1400, 'yay').pose('count', 3000).say('1、2、3…', null, 1500).pose('count', 1500).say('もういいかい？', '?', 1500, 'talk');
    const used = [];
    hiders.forEach((h, i) => {
      let s = PT.shuffle(spots).find((x) => !used.includes(x));
      if (s) used.push(s);
      const tx = s ? s.x + PT.rand(-30, 30) : (i % 2 ? W.visRight - 60 : W.visLeft + 60);
      const ty = s ? s.y - 6 : W.stage.floor[0] + 30;
      h._hideAt = { x: tx, y: ty, s };
      R.claim(h, 16000).go(tx, ty + 30, true).do(() => { h.x = tx; h.y = ty; h.scale = W.depthScale(ty); h.stay = true; }).pose('sit', 1800 + i * 300).say('もういいよ！', null, 1200, 'talk').pose('sit', 12000);
    });
    W.after(6800, () => {
      const a = W.act(oni);
      hiders.forEach((h) => {
        const at = h._hideAt;
        a.go(at.x + 90, at.y + 50, true).look(at.x).say('みーつけた！', '!', 1200, 'yay').do(() => {
          h.stay = false; h.queue = []; h.cur = null; const p = W.clampFloor(at.x + 40, at.y + 60); h.y = p.y; h.scale = W.depthScale(h.y);
          R.claim(h, 3000).jump(60, 500).face('laugh', 1500).say(PT.pick(['みつかったー！', 'あはは！', 'はやーい！']), null, 1300, 'laugh');
        });
      });
      a.face('laugh', 1500).say('ぜんいん みつけた！', 'star', 1500, 'yay').pose('cheer', 900).do(() => R.found('d_hide'));
    });
  };
  /* おにごっこ */
  R.tagGame = (oni) => {
    const players = [oni].concat(R.free(oni.x, oni.y, [oni], 2500).slice(0, 3));
    if (players.length < 2) return;
    players.forEach((p) => R.claim(p, 15000));
    W.act(oni).say('おにごっこ！ まてまてー！', '!', 1400, 'yay');
    let cur = oni, swaps = 0;
    const tok = {}; R.tagTok = tok;
    const runAway = (p) => { if (p === cur) return; const q = W.randFloor(160); p.queue = []; p.cur = null; W.act(p).go(q.x, q.y, true); };
    players.forEach(runAway);
    const step = () => {
      if (R.tagTok !== tok || players.some((p) => p.removed)) return;
      const others = players.filter((p) => p !== cur);
      const tgt = others.sort((a, b) => Math.hypot(a.x - cur.x, a.y - cur.y) - Math.hypot(b.x - cur.x, b.y - cur.y))[0];
      if (Math.hypot(tgt.x - cur.x, (tgt.y - cur.y) * 2) < 70) {
        swaps++;
        PT.audio.sfx('pop'); W.say(cur, 'タッチ！', 'star', 1000, 'yay');
        W.say(tgt, swaps >= 3 ? 'つかまったー！' : 'こんどは おに！', null, 1100, 'laugh');
        cur.queue = []; cur.cur = null;
        if (swaps >= 3) { players.forEach((p) => { p.queue = []; p.cur = null; p.lockUntil = W.t + 1500; W.act(p).face('laugh', 1500).pose('cheer', 1000); }); R.found('d_tag'); return; }
        const prev = cur; cur = tgt; cur.queue = []; cur.cur = null;
        W.act(cur).pose('count', 700);
        runAway(prev);
        W.after(900, step); return;
      }
      if (!cur.cur || cur.cur.t !== 'go' || Math.random() < 0.4) { cur.queue = []; cur.cur = null; W.act(cur).go(tgt.x, tgt.y, true); }
      others.forEach((p) => { if (!p.cur && !p.queue.length) runAway(p); });
      players.forEach((p) => { p.lockUntil = W.t + 3000; });
      W.after(300, step);
    };
    W.after(1200, step);
  };
  R.add({ id: 'tag-tap', on: 'tapchar', pri: 90, test: (c) => (R.tagTok && c.e.lockUntil > W.t && Math.random() < 0.01 ? 1 : null), run() {} });

  /* ---------- ふだんの行動（アンビエント） ---------- */
  const social = (ch) => {
    const o = R.free(ch.x, ch.y, [ch], 600)[0];
    const r = Math.random();
    if (ch.cid === 'pon' && r < 0.35) {
      const p = W.randFloor(200);
      R.claim(ch, 5000).go(p.x, p.y, true).pose('trip', 900).face('surprise', 600).say('わわっ！', 'sweat', 900, 'wow').pose('sit', 500).face('laugh', 1200).say('へっちゃら！', null, 1200, 'laugh').pose('cheer', 600).do(() => R.found('d_oops'));
      const g = W.charOf('gaku') && W.isFree(W.charOf('gaku')) ? W.charOf('gaku') : o;
      if (g) W.after(900, () => R.chars().includes(g) && R.claim(g, 3000).go(p.x + 90, p.y + 10, true).look(p.x).say('だいじょうぶ？', 'heart', 1300).face('laugh', 1000));
      return true;
    }
    if (ch.cid === 'moko' && r < 0.3) { R.sleepy(ch); return true; }
    if (!o) return false;
    if (ch.cid === 'choco' || (r < 0.3 && W.charOf('choco') && W.isFree(W.charOf('choco')))) {
      const src = ch.cid === 'choco' ? o : ch;
      const pose = PT.pick(['wave', 'dance', 'point', 'cheer', 'think']);
      R.claim(src, 3000).pose(pose, 1500).say(PT.pick(['ふんふん♪', 'やっほー', 'えへへ']), null, 1100);
      return R.mimic(src, pose, 1500);
    }
    if (r < 0.65) {
      const p = R.besides(o, ch.x < o.x ? -1 : 1, 80);
      const icon = PT.pick(['heart', 'note', 'star', 'cake', 'ball', 'dino', 'balloon']);
      R.claim(ch, 4500).go(p.x, p.y).look(o.x).pose('shy', 1200).say('ないしょ…', icon, 1500, 'talk');
      R.claim(o, 4500).look(ch.x).wait(1300).face('surprise', 700).say('えー！ ほんと？', '!', 1300, 'wow').face('laugh', 1200).pose('tickle', 900);
      W.after(2200, () => R.found('d_secret'));
      return true;
    }
    R.claim(ch, 2400).look(o.x).pose('wave', 900).say(PT.pick(['あそぼ！', 'ねえねえ', 'たのしいね！']), null, 1200);
    R.claim(o, 2400).look(ch.x).pose('wave', 900).say(PT.pick(['うん！', 'いいよ！', 'えへへ']), null, 1100);
    return true;
  };
  const useProp = (ch) => {
    // あたらしい物は ルルが みつけて みんなを よぶ
    const lulu = W.charOf('lulu');
    if (lulu && W.isFree(lulu) && R.chars().includes(lulu)) {
      const fresh = R.newestUnnoticed(lulu);
      if (fresh && W.t - fresh.bornT > 6000) {
        fresh.noticed = true;
        R.callFriends(lulu, fresh.x, fresh.y);
        W.after(400, () => R.found('d_lulucall'));
        W.after(1900, () => !fresh.removed && R.run('drop', { e: fresh, x: fresh.x, y: fresh.y, user: false, ambient: true }));
        return true;
      }
    }
    const p = nearP(ch.x, ch.y, 900, (q) => !q.temp && !q.hidden && !q.def.food && !q.def.oneShot && !q.def.wear && q.mode !== 'fort' && !q.rider && W.t - (q.lastUse || 0) > 15000 && !['castle', 'present'].includes(q.type))[0];
    if (!p) return false;
    p.lastUse = W.t; p.noticed = true;
    R.run('drop', { e: p, x: p.x, y: p.y, user: false, ambient: true });
    return true;
  };
  R.ambientTick = () => {
    if (W.t < R.ambAt) return;
    R.ambAt = W.t + PT.rand(2200, 3800) + R.chars().length * -150;
    if (W.t - R.lastUser < 2500) return;
    if (PT.game && PT.game.paused) return;
    const idle = R.chars().filter((c) => W.isFree(c) && !c.cur && !c.queue.length && !c.riding && !c.stay);
    if (!idle.length) return;
    const ch = PT.pick(idle);
    const music = W.props().find((p) => p.playing);
    if (music) { R.claim(ch, 3000).look(music.x).pose('dance', 2600); return; }
    const r = Math.random();
    if (r < 0.28 && social(ch)) return;
    if (r < 0.55 && useProp(ch)) return;
    if (r < 0.7) {
      const looks = { lulu: ['think', 'なにかな？'], pon: ['dance', 'ふんふーん♪'], mimi: ['wave', 'るんるん'], gaku: ['think', 'ふむ'], choco: ['jump', 'ぴょん！'], moko: ['sit', 'のんびり〜'] }[ch.cid];
      R.claim(ch, 2500).pose(looks[0], 1400).say(Math.random() < 0.5 ? looks[1] : '', null, 1100, Math.random() < 0.5 ? 'talk' : null);
      return;
    }
    const p = W.randFloor(160);
    const d = Math.hypot(p.x - ch.x, p.y - ch.y);
    const k = Math.min(1, 380 / Math.max(1, d));
    R.claim(ch, 4000).go(ch.x + (p.x - ch.x) * k, ch.y + (p.y - ch.y) * k);
  };
})();
