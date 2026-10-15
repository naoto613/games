/* 反応システムの土台：候補の評価・優先度・クールダウン・連鎖・共通ヘルパー */
'use strict';
(() => {
  const W = PT.world;
  const R = (PT.R = { list: [], cool: {}, tweens: [], recent: [], ambAt: 4000, chainN: 0, lastUser: 0, partyAt: 0 });
  PT.DISC = {}; PT.DISC_ORDER = [];

  /* 発見（ふしぎアルバムに のる できごと） */
  R.D = (id, title, desc, icons, stage = 'any') => { PT.DISC[id] = { id, title, desc, icons, stage }; PT.DISC_ORDER.push(id); };
  R.add = (o) => { R.list.push(Object.assign({ pri: 50, cd: 500, on: 'drop' }, o)); };
  R.found = (id) => {
    if (!PT.DISC[id]) { console.warn('unknown disc', id); return; }
    R.recent.push({ id, t: W.t });
    if (R.recent.length > 30) R.recent.shift();
    PT.game && PT.game.onReaction(id);
  };

  R.run = (on, ctx) => {
    const cands = [];
    for (const r of R.list) {
      if (r.on !== on) continue;
      if (r.stage && !(Array.isArray(r.stage) ? r.stage.includes(W.stage.id) : r.stage === W.stage.id)) continue;
      if ((R.cool[r.id] || 0) > W.t) continue;
      let b = null;
      try { b = r.test(ctx); } catch (e) { console.error(r.id, e); }
      if (b) cands.push({ r, b });
    }
    if (!cands.length) return false;
    const top = Math.max(...cands.map((c) => c.r.pri));
    const { r, b } = PT.pick(cands.filter((c) => c.r.pri === top));
    R.cool[r.id] = W.t + r.cd;
    try { r.run(ctx, b); } catch (e) { console.error(r.id, e); return false; }
    ctx.ran = r.id;
    return true;
  };

  R.onDrop = (e, info) => {
    R.lastUser = W.t;
    const ctx = Object.assign({ e, on: 'drop', user: true }, info);
    if (e.kind === 'prop') { e.noticed = false; }
    if (!R.run('drop', ctx)) R.fallbackDrop(ctx);
  };
  R.onTap = (e) => {
    R.lastUser = W.t;
    const ctx = { e, x: e.x, y: e.y, on: 'tap', user: true };
    const kind = e.kind === 'fix' ? 'tapfix' : e.kind === 'char' ? 'tapchar' : 'tapprop';
    if (!R.run(kind, ctx)) R.fallbackTap(ctx);
  };
  /* 連鎖イベント（上限つき） */
  R.chain = (on, ctx, delay = 600) => {
    const depth = (ctx.depth || 0) + 1;
    if (depth > 4) return;
    W.after(delay, () => { R.run(on, Object.assign({}, ctx, { depth, on, user: false })); });
  };
  R.chainOnce = (on, e) => {
    if ((R.cool['chain:' + on] || 0) > W.t) return;
    R.cool['chain:' + on] = W.t + 4000;
    R.run(on, { e, x: e.x, y: e.y, depth: 1, user: false });
  };

  /* ---------- ヘルパー ---------- */
  const chars = () => W.chars().filter((c) => !c.removed && !c.hidden && !c.inTween && !c.dragging);
  R.chars = chars;
  /* 使えるキャラ（ひまなキャラを優先、つぎに近さ） */
  R.avail = (x, y, excl = [], maxD = 3000) => chars().filter((c) => !excl.includes(c) && Math.hypot(c.x - x, c.y - y) < maxD)
    .sort((a, b) => (W.isFree(b) - W.isFree(a)) || (Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y)));
  R.free = (x, y, excl = [], maxD = 3000) => R.avail(x, y, excl, maxD).filter((c) => W.isFree(c));
  R.one = (x, y, excl = [], pref = null) => {
    if (pref) { const p = W.charOf(pref); if (p && chars().includes(p) && !excl.includes(p)) return p; }
    return R.avail(x, y, excl)[0] || null;
  };
  R.claim = (ch, ms = 4000) => { if (ch.riding) R.unride(ch); ch.stay = false; ch.followTag = null; return W.claim(ch, ms); };
  /* 列になって ついていく（でんしゃ・パレード・アヒル） */
  R.follow = (ch, getLeader, active, onEnd, gap = 85) => {
    const tok = {}; ch.followTag = tok; ch.lockUntil = W.t + 60000;
    const step = () => {
      if (ch.followTag !== tok || ch.removed) return;
      if (!active()) { ch.queue = []; ch.cur = null; ch.followTag = null; ch.lockUntil = W.t + 1500; onEnd && onEnd(); return; }
      const L = getLeader();
      const dx = L.x - ch.x, dy = L.y - ch.y, d = Math.hypot(dx, dy) || 1;
      if (!ch.cur && !ch.queue.length) { if (d > gap + 12) W.act(ch).go(L.x - (dx / d) * gap, L.y - (dy / d) * 24); else W.act(ch).pose('march', 240); }
      W.after(250, step);
    };
    step();
  };
  R.spot = (x, y, i, n, r = 120) => {
    const a = n === 1 ? Math.PI / 2 : Math.PI * (0.08 + 0.84 * (i / (n - 1)));
    const p = W.clampFloor(x + Math.cos(a) * r * 1.3 * (i % 2 ? -1 : 1) * (n === 1 ? 0 : 1), y + Math.sin(a) * r * 0.35 + 10, 60);
    return p;
  };
  R.ring = (x, y, i, n, r = 150) => {
    const a = (i / n) * PT.TAU + 0.3;
    return W.clampFloor(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.4, 60);
  };
  R.besides = (e, side, gap = 90) => W.clampFloor(e.x + side * gap, e.y + 4, 60);
  R.tween = (obj, ms, fn, done) => { obj.inTween = true; R.tweens.push({ obj, t0: W.t, ms, fn, done }); };
  R.stopTweens = () => { R.tweens = []; };

  /* 見ているキャラの反応（掛け合い） */
  const LINES = {
    cheer: ['すごーい！', 'わーい！', 'いいね！', 'やったー！'],
    laugh: ['あはは！', 'うふふ', 'おもしろーい', 'へんなのー！'],
    wow: ['わあ！', 'えっ！？', 'なになに？', 'びっくり！'],
    join: ['いれて！', 'わたしも！', 'ぼくも やる！', 'いっしょに！'],
  };
  R.audience = (x, y, excl = [], kind = 'cheer', n = 2, delay = 350) => {
    const list = R.free(x, y, excl, 900).slice(0, n);
    list.forEach((ch, i) => {
      W.after(delay + i * 260, () => {
        if (!W.isFree(ch) && W.t < ch.lockUntil - 100) return;
        const a = R.claim(ch, 2200).look(x);
        if (kind === 'laugh') a.face('laugh', 1600).say(PT.pick(LINES.laugh), null, 1600, 'laugh').pose('tickle', 1200);
        else if (kind === 'wow') a.face('surprise', 1200).say(PT.pick(LINES.wow), '!', 1500, 'wow').jump(30, 400).pose('point', 900);
        else a.face('laugh', 1500).say(PT.pick(LINES[kind] || LINES.cheer), null, 1600, 'yay').pose('cheer', 1300);
      });
    });
    return list;
  };
  /* チョコの まねっこ */
  R.mimic = (src, pose, ms = 1600, line = 'まねっこ！') => {
    const ch = W.charOf('choco');
    if (!ch || ch === src || !chars().includes(ch) || (!W.isFree(ch) && Math.random() < 0.6)) return false;
    W.after(700, () => {
      if (!chars().includes(ch)) return;
      const side = ch.x < src.x ? -1 : 1;
      const p = R.besides(src, side, 100);
      R.claim(ch, ms + 2500).go(p.x, p.y, true).look(src.x).say(line, 'star', 1500, 'yay').pose(pose, ms).face('laugh', 900).do(() => R.found('d_mimic'));
    });
    return true;
  };
  /* ルルが みんなを よぶ */
  R.callFriends = (caller, x, y, line = 'みてみて！') => {
    R.claim(caller, 3000).look(x).pose('call', 900).say(line, '!', 1500, 'yay');
    const others = R.free(x, y, [caller], 1500).slice(0, 3);
    others.forEach((o, i) => { const p = R.spot(x, y, i, Math.max(2, others.length), 150); W.after(500 + i * 200, () => R.claim(o, 3000).go(p.x, p.y, true).look(x).face('surprise', 900).say(PT.pick(['なになに？', 'どれどれ？', 'わあ！']), '?', 1300)); });
    return others;
  };

  /* のる・おりる */
  R.ride = (ch, mount, o = {}) => {
    ch.riding = mount; ch.rest = o.pose || 'ride'; ch.baseZ = o.z || 0; ch.z = ch.baseZ;
    ch.homeX = ch.x; ch.homeY = ch.y;
    ch.x = mount.x + (o.dx || 0); ch.y = mount.y - 2 + (o.dy || 0);
    ch.scale = W.depthScale(mount.y);
    ch.carry = !!o.carry; ch.stay = true;
    if (mount.kind === 'prop') mount.rider = ch.id;
  };
  R.unride = (ch) => {
    const m = ch.riding; if (!m) return;
    ch.riding = null; ch.rest = 'idle'; ch.baseZ = 0; ch.z = 0; ch.stay = false; ch.carry = false;
    if (m.kind === 'prop') { m.rider = null; if (m.type === 'box' && m.mode !== 'robot' && m.mode !== 'shop') m.mode = null; }
    const p = W.clampFloor(m.x + (m.def && m.def.w ? m.def.w * 0.45 : 80), m.y + 20, 60);
    ch.x = p.x; ch.y = p.y; ch.scale = W.depthScale(ch.y);
  };

  /* 衣装を着る */
  R.wear = (ch, itemId, ctx = {}, silent = false) => {
    const it = PT.ITEMS[itemId];
    if (!it || !it.wear) return;
    const [slot, kind] = it.wear;
    ch.wear = Object.assign({}, ch.wear, { [slot]: kind });
    if (slot === 'body' && ch.wear.hat === 'ghost') delete ch.wear.hat;
    ch.role = it.role;
    W.burst('spark', ch.x, ch.y - 120 * ch.scale, 10, { sp: 0.2, max: 700, size: 10, col: '#ffd23f', g: 0 });
    PT.audio.sfx('sparkle');
    if (!silent) R.roleStart(ch, it.role, ctx);
  };
  R.roleStart = (ch, role, ctx) => { const f = R.ROLES[role]; if (f) f(ch, ctx); };
  R.ROLES = {};

  /* 物をひろって使う */
  R.fetch = (ch, prop, then, run = true) => {
    return R.claim(ch, 6000).to(prop, -40, 4, run).look(prop.x).pose('peek', 300).do(() => { then && then(ch, prop); });
  };

  /* ---------- フォールバック（専用の反応がないとき） ---------- */
  const ITEM_LINES = {
    tools: ['これ なあに？', 'みつけた！', 'なんだろう？'],
    rides: ['のってみたい！', 'あそべるかな？'],
    dress: ['きてみたいな', 'かわいい！'],
    magic: ['ふしぎ〜', 'きらきら！'],
  };
  R.fallbackDrop = (ctx) => {
    const e = ctx.e;
    if (e.kind === 'char') {
      // そっと着地して、まわりを見る
      const a = R.claim(e, 2200).face('happy');
      const n = R.free(e.x, e.y, [e], 500)[0];
      if (n) { a.look(n.x).pose('wave', 900).say(PT.pick(['やっほー！', 'なにする？', 'こんにちは！']), null, 1500); R.claim(n, 1800).look(e.x).pose('wave', 900).say(PT.pick(['あそぼ！', 'やっほー！']), null, 1300); }
      else a.pose('jump', 300).say(PT.pick(['ここ どこかな？', 'なにして あそぼう？', 'やっほー！']), '?', 1600).pose('think', 900);
      return;
    }
    if (e.kind !== 'prop') return;
    const it = e.def;
    const ch = R.one(e.x, e.y);
    if (!ch) { e.wobbleUntil = W.t + 600; return; }
    // 変な場所に置いた → 不思議そうに見て笑う
    const weird = ctx.tgt && ctx.tgt.kind === 'prop' && ctx.tgt !== e;
    R.claim(ch, 4200).to(e, e.x < ch.x ? 70 : -70, 6, true).look(e.x)
      .face(weird ? 'puzzled' : 'surprise', 900).say(weird ? 'あれれ？' : PT.pick(ITEM_LINES[it.cat] || ITEM_LINES.tools), weird ? '?' : e.type, 1500, weird ? 'hmm' : 'wow')
      .pose('think', 800).do(() => { e.wobbleUntil = W.t + 500; })
      .face('laugh', 1200).say(weird ? 'へんなのー！' : 'えへへ', null, 1300, 'laugh').pose('tickle', 700)
      .do(() => { if (weird) R.found('d_weird'); });
    if (weird) R.audience(e.x, e.y, [ch], 'laugh', 1, 1400);
  };
  R.fallbackTap = (ctx) => {
    const e = ctx.e;
    if (e.kind === 'prop') {
      e.wobbleUntil = W.t + 500; PT.audio.sfx('tap');
      W.burst('spark', e.x, e.y - 40, 4, { sp: 0.12, max: 500, size: 8, col: '#ffd23f', g: 0 });
      const ch = R.free(e.x, e.y, [], 500)[0];
      if (ch) R.claim(ch, 1600).look(e.x).face('surprise', 800).say('', '!', 900, 'wow');
      return;
    }
    if (e.kind === 'fix') {
      e.wobbleUntil = W.t + 500; PT.audio.sfx('tap');
      W.burst('spark', e.x, e.y - e.h * 0.5, 5, { sp: 0.15, max: 500, size: 8, col: '#ffffff', g: 0 });
      return;
    }
    if (e.kind === 'char') { R.claim(e, 1200).jump(30, 360).say('', 'heart', 900); }
  };

  /* ---------- 毎フレーム ---------- */
  R.tick = (dt) => {
    // 動き（トゥイーン）
    const done = [];
    for (const tw of R.tweens) {
      const k = Math.min(1, (W.t - tw.t0) / tw.ms);
      try { tw.fn(k); } catch (e) { console.error(e); }
      if (k >= 1) done.push(tw);
    }
    if (done.length) {
      R.tweens = R.tweens.filter((t) => !done.includes(t));
      done.forEach((tw) => { tw.obj.inTween = false; tw.done && tw.done(); });
    }
    // のりものを運ぶ
    for (const ch of W.chars()) {
      if (ch.riding && ch.carry && ch.riding.kind === 'prop') { ch.riding.x = ch.x; ch.riding.y = ch.y + 3; ch.riding.scale = ch.scale; }
      if (ch.riding && ch.riding.removed) R.unride(ch);
    }
    R.ambientTick && R.ambientTick(dt);
  };

  R.reset = () => { R.tweens = []; R.cool = {}; R.recent = []; R.ambAt = W.t + 3000; };
})();
