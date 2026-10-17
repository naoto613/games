/* あそびの ルール：ぬる・こわす・スタンプ・もどす・キャラの はんのう・はっけん・セーブ */
'use strict';
(() => {
  const E = PT.E, A = PT.audio, T = PT.TILE, COLS = PT.COLS, ROWS = PT.ROWS;
  const BL = PT.BLOCKS, BY = PT.BLOCK;

  /* ---------- セーブ ---------- */
  const KEY = 'petapeta-craft-v1';
  const S = (PT.save = { data: { worlds: {}, ach: {}, opts: { bgm: true, sfx: true, vol: 0.8 }, tut: false, placed: 0, notes: 0 } });
  try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d) S.data = Object.assign(S.data, d); } catch (e) { /* ほぞん できなくても あそべる */ }
  S.write = () => { try { localStorage.setItem(KEY, JSON.stringify(S.data)); } catch (e) { /* いっぱい */ } };
  let saveT = 0;
  S.soon = () => { clearTimeout(saveT); saveT = setTimeout(S.saveWorld, 1200); };
  S.saveWorld = () => { if (!E.world) return; S.data.worlds[E.world.id] = E.serialize(); S.write(); };

  const P = (PT.play = { tool: 'place', block: 'grass', stamp: null, undo: [], onChange: null });

  /* ---------- はっけん ---------- */
  const ACH = (PT.ACH = [
    ['first', 'はじめの いっぽ', 'ブロックを おいてみた', { b: 'grass' }],
    ['break', 'こわして つくる', 'ブロックを こわした', { b: 'stone' }],
    ['house', 'おうち できた！', 'おうちの なかで おしゃべり', { s: 'house' }],
    ['tower', 'そらまで とどけ', 'うんと たかい ところに ブロック', { b: 'cloud' }],
    ['bounce', 'ぴょーん！', 'トランポリンで はねた', { b: 'bounce' }],
    ['music', 'おんがくか', 'おんがく ブロックを 8かい ならした', { b: 'note' }],
    ['firework', 'はなび たいかい', 'はなびを うちあげた', { b: 'firework' }],
    ['grow', 'たねから そだった', 'たねが おはなや きに なった', { b: 'seed' }],
    ['swim', 'すいすい', 'みずの なかで およいだ', { b: 'water' }],
    ['night', 'よるの まち', 'よるに あかりを 5こ いじょう', { b: 'lamp' }],
    ['castle', 'おしろの あるじ', 'おしろを たてた', { s: 'castle' }],
    ['eat', 'いただきます', 'たべものを あげた', { i: 'cake' }],
    ['dress', 'へんしん！', 'ふくや ぼうしを きせた', { i: 'gown_rose' }],
    ['sleep', 'おやすみなさい', 'ベッドで ねんね', { i: 'bed' }],
    ['walk', 'おさんぽ', 'みんなで おさんぽ', { c: 'lulu' }],
    ['friends', 'みんな あつまれ', 'なかまが 6にん いじょう', { c: 'mimi' }],
    ['builder', 'けんちくか', 'ブロックを 300こ おいた', { b: 'brick' }],
    ['ladder', 'のぼって のぼって', 'はしごを のぼった', { b: 'ladder' }],
    ['dig', 'ちか たんけん', 'ちかの ふかい ところまで ほった', { b: 'gem' }],
    ['rainbow', 'にじを かけよう', 'にじの はしを かけた', { s: 'rainbowbridge' }],
    ['sit', 'ひとやすみ', 'いすや ソファに すわった', { i: 'sofa' }],
    ['stampall', 'まちづくり', 'スタンプを 5かい つかった', { s: 'pinkhouse' }],
  ]);
  P.found = (id, x, y) => {
    if (S.data.ach[id]) return;
    S.data.ach[id] = Date.now(); S.write();
    A.sfx('discover');
    if (x !== undefined) E.sparkle(x, y, 14);
    PT.bus.emit('ach', id);
  };

  /* ---------- ブロックを おく・こわす ---------- */
  let soundAt = 0;
  const charOn = (x, y) => E.chars().some((ch) => !ch.held && ch.x + ch.hw > x * T && ch.x - ch.hw < (x + 1) * T && ch.y > y * T + 2 && ch.y - ch.H < (y + 1) * T - 2);
  P.placeAt = (x, y, rec) => {
    const b = BY[P.block]; const cur = BL[E.get(x, y)];
    if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return false;
    if (cur && !(cur.liquid || cur.deco) && cur !== b) return false;
    if (b.solid && charOn(x, y)) return false;
    if (!E.set(x, y, b.code, { rec })) return false;
    if (E.t - soundAt > 45) { soundAt = E.t; A.tone(PT.rand(300, 420) * (b.solid ? 1 : 1.4), 0.09, { type: 'sine', slide: 0.6, vol: 0.3 }); }
    E.puff(x * T + T / 2, y * T + T, 3);
    S.data.placed = (S.data.placed || 0) + 1;
    P.found('first');
    if (y <= 3) P.found('tower', x * T, y * T);
    if (S.data.placed >= 300) P.found('builder');
    if (b.id === 'rainbow' && countBlock('rainbow') >= 10) P.found('rainbow', x * T, y * T);
    return true;
  };
  P.breakAt = (x, y, rec) => {
    const b = BL[E.get(x, y)]; if (!b) return false;
    E.set(x, y, 0, { rec });
    E.chunks(x * T + T / 2, y * T + T / 2, b);
    if (E.t - soundAt > 45) { soundAt = E.t; A.tone(PT.rand(180, 260), 0.1, { type: 'triangle', slide: 0.5, vol: 0.28 }); A.noise(0.06, { vol: 0.14, filter: 1400 }); }
    P.found('break');
    if (y >= ROWS - 5) P.found('dig', x * T, y * T);
    return true;
  };
  const countBlock = (id) => { const c = BY[id].code; let n = 0; for (let i = 0; i < E.grid.length; i++) if (E.grid[i] === c) n++; return n; };
  P.line = (x0, y0, x1, y1, f) => {
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx - dy, n = 0;
    for (;;) { f(x0, y0); if ((x0 === x1 && y0 === y1) || n++ > 200) break; const e2 = 2 * err; if (e2 > -dy) { err -= dy; x0 += sx; } if (e2 < dx) { err += dx; y0 += sy; } }
  };
  let stampN = 0;
  P.stampAt = (sid, x, y) => {
    const rec = [];
    PT.stampInto(E.grid, sid, x, y, (i, o, n) => rec.push([i, o, n]));
    if (!rec.length) return;
    rec.forEach(([i], k) => { E.anim.set(i, E.t + k * 12); if (BL[E.grid[i]] && BL[E.grid[i]].plant) E.plants.set(i, E.t); });
    E.dirty = true; E.pushOut();
    P.push({ cells: rec, ents: [] });
    A.sfx('magic'); setTimeout(() => A.sfx('sparkle'), 250);
    const st = PT.STAMPS[sid]; E.sparkle(x * T + T / 2, (y - st.h / 2) * T, 16);
    if (sid === 'castle') P.found('castle', x * T, y * T);
    if (sid === 'rainbowbridge') P.found('rainbow', x * T, y * T);
    if (++stampN >= 5) P.found('stampall');
    S.soon();
  };

  /* ---------- もどす ---------- */
  P.push = (act) => { P.undo.push(act); if (P.undo.length > 60) P.undo.shift(); if (P.onChange) P.onChange(); };
  P.doUndo = () => {
    const act = P.undo.pop(); if (!act) { A.sfx('back'); return; }
    for (let k = act.cells.length - 1; k >= 0; k--) { const [i, o] = act.cells[k]; E.grid[i] = o; E.anim.set(i, E.t); if (BL[o] && BL[o].plant) E.plants.set(i, E.t); else E.plants.delete(i); }
    for (const e of act.ents) if (E.ents.includes(e)) { E.puff(e.x, e.y - 30, 6); E.remove(e); }
    E.dirty = true; E.pushOut();
    A.tone(660, 0.07, { type: 'triangle', vol: 0.18 }); A.tone(440, 0.12, { type: 'triangle', vol: 0.16, delay: 0.06 });
    S.soon(); if (P.onChange) P.onChange();
  };

  /* ---------- ブロックを タップ ---------- */
  const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  let noteN = 0;
  E.on('note', (x, y) => {
    const n = SCALE[(x + (ROWS - y) * 3) % SCALE.length];
    A.tone(440 * Math.pow(2, (60 + n - 57) / 12), 0.45, { type: 'triangle', vol: 0.22 });
    A.tone(880 * Math.pow(2, (60 + n - 57) / 12), 0.3, { type: 'sine', vol: 0.06 });
    E.notes(x * T + T / 2, y * T, 2); E.anim.set(y * COLS + x, E.t - 60);
    if (++noteN >= 8) P.found('music', x * T, y * T);
  });
  E.on('bounce', (e) => { A.sfx('boing'); if (e.kind === 'char') { e.pose = 'jump'; e.poseUntil = E.t + 700; e.face = 'love'; e.faceUntil = E.t + 900; P.found('bounce', e.x, e.y - 100); } });
  E.on('swim', (e) => { A.sfx('splash'); P.found('swim', e.x, e.y - 80); });
  E.on('grow', (x, y) => { A.sfx('sparkle'); P.found('grow', x * T, y * T); S.soon(); });
  P.tapBlock = (x, y) => {
    const b = BL[E.get(x, y)]; if (!b) return false;
    if (b.note) { E.emit('note', x, y); return true; }
    if (b.firework) { E.rocket(x * T + T / 2, y * T); A.sfx('whoosh'); E.anim.set(y * COLS + x, E.t - 60); P.found('firework', x * T, y * T); return true; }
    if (b.plant) { E.plants.set(y * COLS + x, E.t - 7000); A.sfx('bubble'); E.burst(x * T + T / 2, y * T + 10, 6, { col: ['#9fd8ff', '#ffffff'], sp: 0.1, s: 4 }); return true; }
    if (b.bounce) { A.sfx('boing'); E.anim.set(y * COLS + x, E.t - 80); return true; }
    if (b.light) { A.sfx('ding'); E.sparkle(x * T + T / 2, y * T + T / 2, 6); return true; }
    E.anim.set(y * COLS + x, E.t - 100); A.sfx('tap');
    return true;
  };

  /* ---------- キャラの はんのう ---------- */
  const say = (ch, txt, ms = 1800) => { ch.bubble = { txt, t0: E.t, until: E.t + ms }; };
  P.say = say;
  const indoor = (ch) => {
    const cx = Math.floor(ch.x / T), ry = Math.floor((ch.y - 10) / T);
    let roof = false; for (let y = ry - 1; y >= Math.max(0, ry - 8); y--) { const b = E.blk(cx, y); if (b && b.solid) { roof = true; break; } }
    if (!roof) return false;
    const side = (d) => { for (let k = 1; k <= 10; k++) { const b = E.blk(cx + d * k, ry); const b2 = E.blk(cx + d * k, ry - 1); if ((b && (b.solid || b.door)) || (b2 && (b2.solid || b2.door))) return true; } return false; };
    return side(-1) && side(1);
  };
  P.tapChar = (ch) => {
    const name = ch.def.name;
    A.voice(ch.def.voice, 'yay');
    if (ch.sitOn && ch.pose === 'sleep') { E.unsit(ch); ch.vy = -0.6; say(ch, 'おはよう！'); ch.pose = 'cheer'; ch.poseUntil = E.t + 900; return; }
    if (ch.sitOn) { E.hearts(ch.x, ch.y - ch.H, 3); say(ch, PT.pick(['ふかふか〜', 'いい きもち', 'ここ すき！'])); return; }
    const now = E.t;
    ch.taps = now - (ch.lastTap || 0) < 1600 ? (ch.taps || 0) + 1 : 1; ch.lastTap = now;
    if (ch.ground || ch.onLadder) { ch.vy = -0.75; ch.squash = E.t; }
    ch.face = 'love'; ch.faceUntil = E.t + 1200;
    if (ch.taps >= 3) { ch.pose = 'dance'; ch.poseUntil = E.t + 1800; E.notes(ch.x, ch.y - ch.H, 3); say(ch, 'ルンルン♪'); A.sfx('jingle'); return; }
    ch.pose = 'cheer'; ch.poseUntil = E.t + 900;
    let txt;
    if (ch.inWater) { txt = 'およぐの たのしい！'; ch.pose = 'swim'; }
    else if (indoor(ch)) { txt = PT.pick(['おうち だいすき！', 'すてきな おへや！', 'ここに すみたい！']); P.found('house', ch.x, ch.y - ch.H); }
    else if (ch.y < 9 * T) txt = PT.pick(['たかーい！', 'とおくまで みえる！', 'やっほー！']);
    else if (E.night) txt = PT.pick(['おほしさま きれい', 'よるも たのしいね', 'ねむく なってきた…']);
    else if (ch.wear && (ch.wear.body || ch.wear.hat)) txt = PT.pick(['にあう？', 'みてみて！', 'おしゃれ でしょ']);
    else txt = PT.pick([`${name}だよ！`, 'なにを つくる？', 'いっしょに あそぼ！', 'すごい せかい！', 'わーい！', 'おうち つくって！']);
    say(ch, txt);
    E.hearts(ch.x, ch.y - ch.H, 2);
  };

  /* ---------- おとしたとき ---------- */
  const SEATS = { chair: 1, cushion: 1, throne: 1, sofa: 1, bed: 1, horse: 1, whitehorse: 1, unicorn: 1, swimring: 1, carriage: 1, car: 1, tricycle: 1 };
  const charAt = (x, y, not) => E.chars().filter((c) => c !== not && !c.held && Math.abs(c.x - x) < 46 && y > c.y - c.H - 20 && y < c.y + 20).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0];
  P.dropEnt = (e) => {
    if (e.kind === 'prop') {
      const ch = charAt(e.x, e.y - e.H * 0.5);
      const d = e.def;
      if (ch) {
        if (d.cat === 'food') {
          E.remove(e); ch.pose = 'eat'; ch.face = 'eat'; ch.poseUntil = E.t + 1500; ch.faceUntil = E.t + 1500; A.sfx('munch'); say(ch, 'おいしい！'); E.hearts(ch.x, ch.y - ch.H, 4); P.found('eat', ch.x, ch.y - ch.H); return;
        }
        if (d.wear) {
          const [slot, kind] = d.wear; E.remove(e);
          ch.wear = Object.assign({}, ch.wear); if (ch.wear[slot] === kind) delete ch.wear[slot]; else ch.wear[slot] = kind;
          A.sfx('magic'); E.sparkle(ch.x, ch.y - ch.H * 0.6, 12); ch.pose = 'spin'; ch.poseUntil = E.t + 900; ch.face = 'love'; ch.faceUntil = E.t + 1200; say(ch, PT.pick(['にあう？', 'へんしん！', 'わあ すてき！'])); P.found('dress', ch.x, ch.y - ch.H); S.soon(); return;
        }
        if (!SEATS[e.type] && d.w <= 130 && d.cat !== 'home' && d.cat !== 'rides') {
          E.remove(e); ch.holdType = e.type; A.sfx('pick'); say(ch, 'ありがとう！'); ch.pose = 'cheer'; ch.poseUntil = E.t + 800; E.hearts(ch.x, ch.y - ch.H, 2); S.soon(); return;
        }
      }
      A.sfx('place');
      return;
    }
    // キャラを おいた
    const seat = E.props().find((p) => SEATS[p.type] && !E.chars().some((o) => o.sitOn === p) && Math.abs(p.x - e.x) < Math.max(40, p.hw) && e.y > p.y - p.H - 60 && e.y < p.y + 40);
    if (seat) {
      E.sit(e, seat); A.voice(e.def.voice, 'yay');
      if (seat.def.sleep) { say(e, 'おやすみなさい'); A.sfx('ghost'); P.found('sleep', e.x, e.y - 80); }
      else { say(e, PT.pick(['すわっちゃお', 'らくちん！', 'しゅっぱーつ！'])); P.found('sit', e.x, e.y - 80); }
      S.soon(); return;
    }
    const other = charAt(e.x, e.y - 40, e);
    if (other) { e.x += (e.x >= other.x ? 1 : -1) * 46; E.hearts((e.x + other.x) / 2, e.y - e.H, 5); A.voice(e.def.voice, 'laugh'); say(other, 'なかよし！'); other.face = 'love'; other.faceUntil = E.t + 1200; e.face = 'love'; e.faceUntil = E.t + 1200; }
    A.voice(e.def.voice, 'talk');
  };

  /* ---------- まいフレームの ちいさな こと ---------- */
  let zzAt = 0, ladderSeen = false;
  P.tick = () => {
    if (E.t > zzAt) {
      zzAt = E.t + 1500;
      for (const ch of E.chars()) if (ch.sitOn && ch.pose === 'sleep') E.zz(ch.x + 20, ch.y - ch.H * 0.6);
      if (E.night && E.lights.length >= 5) P.found('night');
      if (E.chars().length >= 6) P.found('friends');
    }
    if (!ladderSeen && E.chars().some((c) => c.climbing)) { ladderSeen = true; P.found('ladder'); }
  };
})();
