/* みんなで あそぶ しくみ：みんなで ダンス・てんき・かくれた ほし・びっくりアイテム・なでなで */
'use strict';
(() => {
  const G = PT.G;
  const F = (PT.fun = {});
  const FUN_IDS = ['funegg', 'gacha', 'kisekae', 'kuji', 'fundice'];
  F.ITEMS = FUN_IDS;

  /* ================= びっくりアイテム（え） ================= */
  const def = (id, o) => { PT.ITEMS[id] = Object.assign({ id, cat: 'magic', tags: ['magic', 'fun', 'surprise'], w: 90, h: 90 }, o); };
  const CAP = ['#ff6f91', '#ffd23f', '#58c46b', '#4c9be8', '#b39ae8', '#ff8a65'];
  const capsule = (c, x, y, r, col, rot = 0) => {
    c.save(); c.translate(x, y); c.rotate(rot);
    G.circ(c, 0, 0, r); c.fillStyle = '#ffffff'; c.fill();
    c.beginPath(); c.arc(0, 0, r, Math.PI, 0); c.closePath(); c.fillStyle = col; c.fill();
    G.circ(c, 0, 0, r); c.strokeStyle = PT.line(col); c.lineWidth = 2; c.stroke();
    G.ell(c, -r * 0.35, -r * 0.45, r * 0.25, r * 0.15, -0.5); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill();
    c.restore();
  };
  F.capsule = capsule;

  // びっくり たまご
  def('funegg', { name: 'びっくり たまご', w: 80, h: 100,
    draw(c, t, st) {
      t = t || 0;
      const cr = (st && st.crack) || 0;
      c.save();
      c.rotate(Math.sin(t * 0.004 + ((st && st.seed) || 0)) * 0.05);
      G.ell(c, 0, -46, 36, 46); G.fillO(c, '#fff3d6', 3);
      c.save(); G.ell(c, 0, -46, 34.5, 44.5); c.clip();
      c.fillStyle = '#ff9ec4'; c.beginPath(); c.moveTo(-40, -52);
      for (let i = 0; i <= 8; i++) c.lineTo(-40 + i * 10, i % 2 ? -62 : -52);
      c.lineTo(40, -40);
      for (let i = 8; i >= 0; i--) c.lineTo(-40 + i * 10, i % 2 ? -50 : -40);
      c.closePath(); c.fill();
      for (const [x, y, col] of [[-14, -78, '#7fd0f8'], [16, -74, '#ffd23f'], [-18, -22, '#9fe08a'], [14, -18, '#c9a0ff'], [0, -30, '#ff9ec4']]) { G.circ(c, x, y, 6); c.fillStyle = col; c.fill(); }
      c.restore();
      G.ell(c, 0, -46, 36, 46); c.strokeStyle = PT.line('#fff3d6'); c.lineWidth = 3; c.stroke();
      G.ell(c, -15, -70, 7, 11, -0.4); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill();
      // はてな
      c.font = `900 22px ${PT.FONT}`; c.textAlign = 'center'; c.lineWidth = 5; c.strokeStyle = '#ffffff'; c.strokeText('?', 0, -48); c.fillStyle = '#ff6f91'; c.fillText('?', 0, -48);
      if (cr) {
        c.strokeStyle = '#8a6a4a'; c.lineWidth = 3; c.lineJoin = 'round'; c.beginPath();
        c.moveTo(-22, -60); c.lineTo(-12, -52); c.lineTo(-4, -62); c.lineTo(6, -52);
        if (cr > 1) { c.lineTo(14, -62); c.lineTo(24, -52); c.lineTo(32, -60); }
        c.stroke();
      }
      // きらきら
      const tw = 0.5 + 0.5 * Math.sin(t * 0.006);
      c.fillStyle = `rgba(255,214,80,${0.4 + tw * 0.6})`; G.star(c, 30, -86, 6 + tw * 3, 2.5, 4); c.fill();
      c.restore();
    } });

  // ガチャガチャ
  def('gacha', { name: 'ガチャガチャ', w: 100, h: 176,
    draw(c, t, st) {
      t = t || 0;
      const turn = st && st.turnAt ? PT.clamp((t - st.turnAt) / 700, 0, 1) : 0;
      const shake = turn > 0 && turn < 1 ? Math.sin(t * 0.06) * 3 : 0;
      G.rr(c, -44, -72, 88, 72, 12); G.fillO(c, '#ff6f61', 3);
      G.rr(c, -18, -30, 36, 22, 8); c.fillStyle = '#8a3530'; c.fill();
      c.fillStyle = 'rgba(255,255,255,.85)'; c.font = `900 13px ${PT.FONT}`; c.textAlign = 'center'; c.fillText('ガチャ', 0, -38 + 24);
      c.save(); c.translate(0, -52); c.rotate(turn * PT.TAU);
      G.circ(c, 0, 0, 13); G.fillO(c, '#ffd23f', 2.5);
      c.fillStyle = '#c99a22'; G.rr(c, -11, -3.5, 22, 7, 3); c.fill();
      c.restore();
      G.rr(c, -32, -86, 64, 16, 6); G.fillO(c, '#ffffff', 2.5);
      // ドーム
      G.circ(c, 0, -128, 44); c.fillStyle = 'rgba(220,240,255,.6)'; c.fill();
      c.save(); G.circ(c, 0, -128, 42); c.clip();
      const pts = [[-24, -100], [0, -96], [24, -100], [-30, -122], [-8, -118], [16, -120], [34, -124], [-18, -142], [8, -140], [-4, -160], [24, -146]];
      pts.forEach(([x, y], i) => capsule(c, x + shake * (i % 2 ? 1 : -1), y + (turn > 0 && turn < 1 ? Math.sin(t * 0.05 + i) * 3 : 0), 11, CAP[i % CAP.length], i * 0.7));
      c.restore();
      G.circ(c, 0, -128, 44); c.strokeStyle = '#8fb8e0'; c.lineWidth = 3; c.stroke();
      G.ell(c, -20, -150, 9, 15, 0.6); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill();
      G.rr(c, -14, -176, 28, 10, 4); G.fillO(c, '#ff6f61', 2);
    } });

  // きせかえ ボックス
  def('kisekae', { name: 'きせかえ ボックス', w: 112, h: 126,
    draw(c, t, st) {
      t = t || 0;
      const busy = st && st.busyUntil && t < st.busyUntil;
      const jig = busy ? Math.sin(t * 0.05) * 0.04 : 0;
      c.save(); c.rotate(jig);
      G.rr(c, -50, -100, 100, 100, 14); G.fillO(c, '#b39ae8', 3);
      c.fillStyle = '#ffd23f'; c.fillRect(-8, -100, 16, 100);
      // ハンガーと ふく
      c.strokeStyle = '#ffffff'; c.lineWidth = 3.5; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.arc(-26, -74, 5, Math.PI, Math.PI * 2.3); c.stroke();
      c.beginPath(); c.moveTo(-26, -68); c.lineTo(-42, -58); c.lineTo(-10, -58); c.closePath(); c.stroke();
      G.poly(c, [-38, -54, -30, -58, -22, -58, -14, -54, -18, -46, -22, -48, -22, -24, -30, -24, -30, -48, -34, -46]); G.fillO(c, '#ff8fb1', 2);
      G.heart(c, -26, -40, 5); c.fillStyle = '#ffffff'; c.fill();
      // はてな
      c.font = `900 34px ${PT.FONT}`; c.textAlign = 'center'; c.lineWidth = 6; c.strokeStyle = '#7a5ad0'; c.strokeText('?', 28, -32); c.fillStyle = '#ffffff'; c.fillText('?', 28, -32);
      // ふた と リボン
      G.rr(c, -56, -114, 112, 22, 10); G.fillO(c, '#ff8fb1', 3);
      c.fillStyle = '#ffd23f'; c.fillRect(-8, -114, 16, 22);
      for (const s of [-1, 1]) { G.ell(c, s * 16, -124, 16, 10, s * 0.4); G.fillO(c, '#ffd23f', 2.5); }
      G.circ(c, 0, -122, 7); G.fillO(c, '#ffc21a', 2);
      c.restore();
      const tw = 0.5 + 0.5 * Math.sin(t * 0.005);
      c.fillStyle = `rgba(255,236,140,${0.5 + tw * 0.5})`; G.star(c, 50, -112, 5 + tw * 3, 2, 4); c.fill(); G.star(c, -52, -84, 4 + (1 - tw) * 3, 1.6, 4); c.fill();
    } });

  // プレゼント くじ
  def('kuji', { name: 'プレゼント くじ', w: 100, h: 116,
    draw(c, t, st) {
      t = t || 0;
      const busy = st && st.busyUntil && t < st.busyUntil;
      c.save(); if (busy) c.rotate(Math.sin(t * 0.04) * 0.05);
      // くじの かみ
      [[-16, '#ff8fb1', -0.3], [2, '#ffd23f', 0.05], [18, '#9fd8ff', 0.35]].forEach(([x, col, r]) => { c.save(); c.translate(x, -92); c.rotate(r); G.rr(c, -7, -24, 14, 28, 3); G.fillO(c, col, 2); c.restore(); });
      G.rr(c, -46, -92, 92, 92, 12); G.fillO(c, '#58b9f0', 3);
      G.ell(c, 0, -92, 24, 7); c.fillStyle = '#2a5f8f'; c.fill();
      // ちいさな プレゼントの え
      G.rr(c, -18, -66, 36, 28, 4); G.fillO(c, '#ff6f91', 2.5);
      c.fillStyle = '#ffd23f'; c.fillRect(-3, -66, 6, 28); c.fillRect(-18, -55, 36, 6);
      for (const s of [-1, 1]) { G.ell(c, s * 8, -70, 8, 5, s * 0.4); G.fillO(c, '#ffd23f', 2); }
      c.font = `900 20px ${PT.FONT}`; c.textAlign = 'center'; c.lineWidth = 5; c.strokeStyle = '#2a6fb0'; c.strokeText('くじ', 0, -12); c.fillStyle = '#ffffff'; c.fillText('くじ', 0, -12);
      for (const [x, y, col] of [[-34, -78, '#ffd23f'], [34, -80, '#ff8fb1'], [-34, -30, '#ffffff'], [36, -30, '#ffd23f']]) { G.circ(c, x, y, 4); c.fillStyle = col; c.fill(); }
      c.restore();
    } });

  // ジャンボ サイコロ
  const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  def('fundice', { name: 'ジャンボ サイコロ', w: 90, h: 90,
    draw(c, t, st) {
      const n = (st && st.dn) || 5;
      c.save(); c.translate(0, -42); c.rotate((st && st.drot) || 0);
      G.rr(c, -38, -38, 76, 76, 18); G.fillO(c, '#ff8fb1', 3);
      G.rr(c, -30, -34, 40, 12, 6); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
      PIPS[n].forEach(([x, y]) => { G.circ(c, x * 19, y * 19, n === 1 ? 11 : 7.5); c.fillStyle = n === 1 ? '#ff4d6d' : '#ffffff'; c.fill(); c.strokeStyle = '#d0507a'; c.lineWidth = 1.5; c.stroke(); });
      c.restore();
    } });

  /* ================= あそび ================= */
  const W = PT.world, R = PT.R, A = PT.audio, X = PT.FX;
  if (!R || !R.h || !R.h.isP) return;
  const { isP, isC } = R.h;
  const D = R.D;
  const S = () => PT.save.data;
  const N = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const clamp = PT.clamp;
  const alive = (ch) => ch && !ch.removed && W.ents.includes(ch);
  const headY = (ch) => ch.y - ch.z - 150 * ch.scale * (ch.def.size || 1);

  D('f_dance', 'みんなで ダンス', 'ダンスボタンを おすと みんなで おどるよ！', ['music', 'lulu']);
  D('f_rain', 'あめが ふってきた', 'てんきボタンで あめ。みんな かさを さすよ', ['umbrella', 'pon']);
  D('f_snow', 'ゆきが ふってきた', 'てんきボタンで ゆき。みんな おおはしゃぎ', ['snow', 'mimi']);
  D('f_night', 'よるに なった', 'てんきボタンで よる。ほたるが ひかって ふあ〜あ', ['moon', 'gaku']);
  D('f_rainbow', 'にじが でた', 'てんきボタンで にじ。わあ きれい！', ['rainbow', 'choco']);
  D('f_star', 'かくれた ほし', 'どこかに かくれた ちいさな ほしを みつけた！', ['star', 'pyoko']);
  D('f_pet', 'なでなで', 'キャラの うえで ゆびを ごしごし すると ハートが いっぱい', ['heart', 'mimi']);
  D('f_egg', 'びっくり たまご', 'たまごが われて なにかが うまれたよ', ['funegg', 'pyoko']);
  D('f_gacha', 'ガチャガチャ', 'ハンドルを まわすと カプセルが ころん！', ['gacha', 'pon']);
  D('f_kisekae', 'きせかえ ボックス', 'はこに はいると ぜんしん おきがえ！', ['kisekae', 'lulu']);
  D('f_kuji', 'プレゼント くじ', 'くじを ひいたら あたり！ プレゼントが でたよ', ['kuji', 'present']);
  D('f_dice', 'ジャンボ サイコロ', 'でた かずだけ みんなで ジャンプ！', ['fundice', 'gaku']);

  /* ---------- ランダムな アイテム ---------- */
  const unlocked = (it) => !it.lock || (S() && S().unlockedObjectIds.includes(it.id));
  const randomItem = (cats = ['food', 'tools', 'magic']) => {
    const list = Object.values(PT.ITEMS).filter((it) => cats.includes(it.cat) && !FUN_IDS.includes(it.id) && !it.oneShot && unlocked(it) && it.w <= 220 && it.h <= 220);
    return list.length ? PT.pick(list).id : 'star';
  };
  F.randomItem = randomItem;
  const popItem = (type, x, y) => {
    const p = W.clampFloor(x, y, 60);
    const it = W.addProp(type, p.x, p.y);
    if (!it) return null;
    it.pop = W.t;
    if (it.def.float) it.y -= 120;
    W.burst('spark', it.x, it.y - 40, 8, { sp: 0.2, max: 700, size: 10, col: '#ffd23f', g: 0 });
    W.burst('star', it.x, it.y - 50, 4, { up: true, sp: 0.2 });
    return it;
  };
  F.popItem = popItem;
  const fanfare = () => {
    [[67, 0], [72, 0.12], [76, 0.24], [79, 0.36], [76, 0.52], [79, 0.62], [84, 0.74]].forEach(([n, d], i) => {
      A.tone(N(n), i === 6 ? 0.7 : 0.16, { type: 'square', vol: 0.06, delay: d });
      A.tone(N(n), i === 6 ? 0.7 : 0.16, { type: 'triangle', vol: 0.12, delay: d });
    });
    A.tone(N(48), 0.5, { type: 'sine', vol: 0.25, delay: 0.74 });
  };
  F.fanfare = fanfare;
  const refresh = () => { if (PT.game && PT.game.refreshPanel && PT.game.tab === 'friends') PT.game.refreshPanel(); };

  /* ================= みんなで ダンス ================= */
  const DANCE_MS = 7000, BEAT = 470;
  F.danceAt = -1e9; F.danceUntil = 0;
  F.isDancing = () => W.t < F.danceAt + DANCE_MS + 300;
  const danceBtn = () => document.querySelector('[data-act="dance"]');
  function danceMusic() {
    if (!A.ctx) return;
    if (A.bgmGain) A.bgmGain.gain.setTargetAtTime(0.0001, A.ctx.currentTime, 0.08);
    const e = BEAT / 2000; // 8ぶおんぷ
    const mel = [72, 76, 79, 76, 81, 79, 76, 79, 72, 76, 79, 84, 81, 79, 76, 74, 72, 76, 79, 76, 81, 79, 76, 79, 84, 81, 79, 76, 74, 76, 72, -1];
    mel.forEach((m, i) => { if (m > 0) A.tone(N(m), e * 1.5, { type: 'square', vol: 0.05, delay: i * e }); if (m > 0) A.tone(N(m), e * 1.6, { type: 'triangle', vol: 0.1, delay: i * e }); });
    const bass = [48, 55, 53, 55, 45, 52, 50, 55];
    for (let q = 0; q < 16; q++) {
      A.tone(N(bass[q % 8]), e * 1.8, { type: 'sine', vol: 0.28, delay: q * 2 * e });
      A.tone(110, 0.16, { type: 'sine', slide: 0.5, vol: 0.32, delay: q * 2 * e });
      A.noise(0.04, { vol: 0.06, filter: 7000, type: 'highpass', delay: q * 2 * e + e });
    }
    A.tone(N(84), 0.5, { type: 'triangle', vol: 0.14, delay: 32 * e });
  }
  const CHOREO = (a, i) => {
    a.face('laugh', DANCE_MS).pose('dance', BEAT * 4)
      .jump(60, BEAT).jump(60, BEAT)
      .pose('spin', BEAT * 2).pose('cheer', BEAT * 2)
      .pose('dance', BEAT * 2).jump(80, BEAT)
      .pose('spin', BEAT);
    return a;
  };
  F.dance = () => {
    if (!W.stage) return;
    A.init();
    if (F.isDancing()) {
      // れんだ：こわさずに もりあげるだけ
      if (W.t - (F.extraAt || 0) > 350) {
        F.extraAt = W.t;
        A.sfx('pop');
        for (let i = 0; i < 6; i++) W.fx.push({ type: 'confetti', x: PT.rand(W.visLeft, W.visRight), y: W.visTop + PT.rand(-20, 40), vx: PT.rand(-0.05, 0.05), vy: PT.rand(0.12, 0.25), life: 0, max: 2200, size: PT.rand(10, 16), col: PT.pick(CAP), rot: PT.rand(0, 6), vr: PT.rand(-0.01, 0.01), g: 0 });
      }
      return;
    }
    F.danceAt = W.t;
    const b = danceBtn(); if (b) b.classList.add('on');
    A.sfx('jingle');
    danceMusic();
    const cs = R.chars();
    cs.forEach((ch, i) => {
      const a = R.claim(ch, DANCE_MS + 2200);
      ch.flip = i % 2 === 1;
      CHOREO(a, i);
      a.face('laugh', 1600).say('たのしかった！', 'heart', 1800, i < 3 ? 'yay' : null).pose('cheer', 900);
    });
    // おわり
    const tok = (F.danceTok = {});
    W.after(DANCE_MS, () => {
      if (F.danceTok !== tok) return;
      A.apply();
      const bb = danceBtn(); if (bb) bb.classList.remove('on');
      const cx = (W.visLeft + W.visRight) / 2;
      X.confetti(cx, 1800);
      W.bigText('たのしかった！', cx, W.visTop + 230, '#ff6f91');
      R.found('f_dance');
    });
  };
  function drawDance(c) {
    const t = W.t - F.danceAt;
    if (t < 0 || t > DANCE_MS + 300) return;
    const env = clamp(t / 400, 0, 1) * clamp((DANCE_MS + 300 - t) / 600, 0, 1);
    const L = W.visLeft, Rr = W.visRight, T = W.visTop, wv = Rr - L, st = W.stage;
    c.save();
    c.globalAlpha = 0.2 * env; c.fillStyle = '#2a2060'; c.fillRect(L - 20, T - 20, wv + 40, PT.H - T + 40);
    const beat = Math.floor(t / BEAT);
    for (let i = 0; i < 6; i++) {
      const bx = L + (wv * (i + 0.5)) / 6;
      const ang = Math.sin(W.t * 0.0018 + i * 1.3) * 0.55;
      const col = CAP[(i + beat) % CAP.length];
      c.save(); c.translate(bx, T); c.rotate(ang); c.globalAlpha = 0.38 * env;
      const g = c.createLinearGradient(0, 0, 0, 950); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(-10, 0); c.lineTo(-140, 950); c.lineTo(140, 950); c.lineTo(10, 0); c.closePath(); c.fill();
      c.restore();
    }
    // ゆかの スポットライト
    const [fa, fb] = st.floor;
    for (let i = 0; i < 4; i++) {
      const x = L + wv * (0.5 + 0.42 * Math.sin(W.t * 0.0012 + i * 1.7));
      const y = fa + (fb - fa) * (0.25 + 0.18 * i);
      c.globalAlpha = 0.28 * env; c.fillStyle = CAP[(i * 2 + beat) % CAP.length];
      G.ell(c, x, y, 120, 30); c.fill();
    }
    // ミラーボール
    const mx = (L + Rr) / 2, my = T + 150;
    c.globalAlpha = env;
    c.strokeStyle = '#9aa8c0'; c.lineWidth = 3; c.beginPath(); c.moveTo(mx, T - 10); c.lineTo(mx, my - 40); c.stroke();
    G.circ(c, mx, my, 40); c.fillStyle = '#dfe8f5'; c.fill();
    c.save(); G.circ(c, mx, my, 40); c.clip();
    const sp = (W.t * 0.02) % 14;
    for (let x = -42; x < 46; x += 14) for (let y = -42; y < 46; y += 14) {
      const k = (Math.floor((x + sp + 42) / 14) + Math.floor((y + 42) / 14) + beat) % 4;
      c.fillStyle = ['#ffffff', '#c6d4ea', '#f6e7ff', '#e0f4ff'][k]; c.fillRect(mx + x + sp - 7, my + y, 12, 12);
    }
    c.restore();
    G.circ(c, mx, my, 40); c.strokeStyle = '#8a98b8'; c.lineWidth = 3; c.stroke();
    for (let i = 0; i < 6; i++) {
      const a = W.t * 0.003 + i * 1.05, r = 60 + (i % 2) * 18;
      c.fillStyle = CAP[(i + beat) % CAP.length]; G.star(c, mx + Math.cos(a) * r, my + Math.sin(a) * r * 0.6, 7, 3, 4); c.fill();
    }
    c.restore();
  }
  function tickDance(dt) {
    const t = W.t - F.danceAt;
    if (t < 0 || t > DANCE_MS) return;
    F.danceAcc = (F.danceAcc || 0) + dt;
    if (F.danceAcc > 260) {
      F.danceAcc = 0;
      for (let i = 0; i < 4; i++) W.fx.push({ type: 'confetti', x: PT.rand(W.visLeft, W.visRight), y: W.visTop + PT.rand(-20, 30), vx: PT.rand(-0.05, 0.05), vy: PT.rand(0.12, 0.24), life: 0, max: 2600, size: PT.rand(9, 15), col: PT.pick(CAP), rot: PT.rand(0, 6), vr: PT.rand(-0.012, 0.012), g: 0 });
      const ch = PT.pick(R.chars());
      if (ch && Math.random() < 0.6) W.burst('note', ch.x + PT.rand(-30, 30), headY(ch) - 40, 1, { up: true, sp: 0.08, minSp: 0.04, g: -0.00002, max: 1300, size: PT.rand(14, 20), col: PT.pick(['#9b6fd6', '#ff6f91', '#4c9be8', '#58c46b']) });
    }
  }

  /* ================= てんき ================= */
  const WEATHERS = ['sun', 'rain', 'snow', 'night', 'rainbow'];
  F.weather = 'sun'; F.wAt = 0;
  let rain = [], snow = [], splash = [], flies = [], nstars = [];
  const syncBtn = () => {
    const b = document.querySelector('[data-act="weather"]');
    if (!b) return;
    b.dataset.w = F.weather;
    const ic = b.querySelector('.fico'); if (ic) ic.className = 'fico fico-w-' + F.weather;
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  };
  const LINES = {
    sun: [['はれた！', 'star'], ['いい てんき！', 'star'], ['ぽかぽか〜', 'heart']],
    rain: [['あめだ〜', 'umbrella'], ['ぽつぽつ…', 'umbrella'], ['かさ さそう！', 'umbrella']],
    snow: [['ゆきだ〜！', 'snow'], ['つめたーい！', 'snow'], ['まっしろ！', 'snow']],
    night: [['ふあ〜あ', 'zzz'], ['ねむたい…', 'zzz'], ['ほたるだ…', 'star']],
    rainbow: [['わあ！ にじ！', 'rainbow'], ['きれ〜い！', 'rainbow'], ['なないろ！', 'rainbow']],
  };
  function reactWeather(w) {
    if (F.isDancing()) return;
    const cs = R.free(800, 700, [], 99999).slice(0, 8);
    cs.forEach((ch, i) => W.after(150 + i * 170, () => {
      if (!alive(ch) || !W.isFree(ch) || F.weather !== w) return;
      const [txt, ic] = PT.pick(LINES[w]);
      const v = i < 3;
      const a = R.claim(ch, 2800);
      if (w === 'rain') { a.face('surprise', 800).say(txt, ic, 1500, v ? 'wow' : null).do(() => { ch.funUmb = true; ch.rest = 'hold'; A.sfx('pop'); }).pose('hold', 1200); }
      else if (w === 'snow') a.face('laugh', 2000).say(txt, ic, 1500, v ? 'yay' : null).jump(60, 450).pose('cheer', 800).jump(50, 420);
      else if (w === 'night') a.face('sleep', 2200).say(txt, ic, 1700, v ? 'talk' : null).do(() => W.burst('zzz', ch.x + 30, headY(ch) - 20, 2, { up: true, sp: 0.05, max: 1400, size: 24, g: 0 })).pose('sleep', 1600).face('happy');
      else if (w === 'rainbow') a.face('surprise', 1000).say(txt, ic, 1600, v ? 'wow' : null).pose('point', 1000).face('laugh', 1000).pose('cheer', 800);
      else a.face('laugh', 1200).say(txt, ic, 1400, v ? 'yay' : null).pose('wave', 1000);
    }));
  }
  function spawnWeather(w) {
    const L = W.visLeft, Rr = W.visRight, T = W.visTop, st = W.stage;
    rain = []; snow = []; splash = []; flies = []; nstars = [];
    if (w === 'rain') for (let i = 0; i < 90; i++) rain.push({ x: PT.rand(L - 60, Rr + 60), y: PT.rand(T - 300, PT.H), sp: PT.rand(1.1, 1.5), len: PT.rand(20, 32), land: PT.rand(st.floor[0], Math.min(st.floor[1], W.visBottom)) });
    if (w === 'snow') for (let i = 0; i < 70; i++) snow.push({ x: PT.rand(L, Rr), y: PT.rand(T - 400, PT.H), sp: PT.rand(0.05, 0.11), r: PT.rand(4, 9), ph: PT.rand(0, 6), land: PT.rand(st.floor[0], Math.min(st.floor[1], W.visBottom)) });
    if (w === 'night') {
      for (let i = 0; i < 28; i++) nstars.push({ x: PT.rand(L + 20, Rr - 20), y: PT.rand(T + 20, Math.max(T + 60, st.floor[0] - 60)), r: PT.rand(3, 7), ph: PT.rand(0, 6) });
      for (let i = 0; i < 14; i++) flies.push({ x: PT.rand(L + 40, Rr - 40), y: PT.rand(st.floor[0] - 220, st.floor[1] - 40), ph: PT.rand(0, 6), vx: PT.rand(-0.03, 0.03), vy: PT.rand(-0.02, 0.02) });
    }
  }
  F.setWeather = (w, quiet) => {
    const prev = F.weather;
    F.weather = w; F.wAt = W.t;
    if (prev === 'rain' && w !== 'rain') W.chars().forEach((ch) => { if (ch.funUmb) { ch.funUmb = false; if (ch.rest === 'hold') ch.rest = 'idle'; } });
    if (W.stage) spawnWeather(w);
    syncBtn();
    if (quiet) return;
    if (w === 'rain') { A.noise(1.6, { vol: 0.12, filter: 3000, type: 'highpass' }); A.sfx('splash'); }
    else if (w === 'snow') A.sfx('sparkle');
    else if (w === 'night') { A.sfx('bell'); W.after(300, () => A.sfx('piano')); }
    else if (w === 'rainbow') A.sfx('magic');
    else A.sfx('ding');
    reactWeather(w);
    const id = { rain: 'f_rain', snow: 'f_snow', night: 'f_night', rainbow: 'f_rainbow' }[w];
    if (id) W.after(1600, () => { if (F.weather === w) R.found(id); });
  };
  F.nextWeather = () => {
    if (!W.stage) return;
    A.init();
    const i = WEATHERS.indexOf(F.weather);
    F.setWeather(WEATHERS[(i + 1) % WEATHERS.length]);
  };
  function tickWeather(dt) {
    const w = F.weather;
    if (w === 'rain') {
      for (const d of rain) {
        d.y += d.sp * dt; d.x -= d.sp * dt * 0.18;
        if (d.y > d.land) {
          if (splash.length < 40 && d.x > W.visLeft && d.x < W.visRight) splash.push({ x: d.x, y: d.y, life: 0 });
          d.y = W.visTop - PT.rand(0, 200); d.x = PT.rand(W.visLeft - 60, W.visRight + 160);
        }
      }
      for (const s of splash) s.life += dt;
      splash = splash.filter((s) => s.life < 300);
    } else if (w === 'snow') {
      for (const f of snow) {
        f.y += f.sp * dt; f.x += Math.sin(W.t * 0.0015 + f.ph) * 0.03 * dt;
        if (f.y > f.land) { f.y = W.visTop - PT.rand(0, 120); f.x = PT.rand(W.visLeft, W.visRight); }
      }
    } else if (w === 'night') {
      for (const f of flies) {
        f.vx += PT.rand(-0.002, 0.002); f.vy += PT.rand(-0.002, 0.002);
        f.vx = clamp(f.vx, -0.05, 0.05); f.vy = clamp(f.vy, -0.035, 0.035);
        f.x += f.vx * dt; f.y += f.vy * dt;
        if (f.x < W.visLeft + 30 || f.x > W.visRight - 30) f.vx = -f.vx;
        if (f.y < W.stage.floor[0] - 260 || f.y > W.stage.floor[1] - 20) f.vy = -f.vy;
      }
    }
  }
  const drawSun = (c, x, y, a, t) => {
    c.save(); c.globalAlpha = a;
    c.fillStyle = 'rgba(255,240,170,.35)'; G.circ(c, x, y, 110 + Math.sin(t * 0.003) * 8); c.fill();
    c.strokeStyle = '#ffb02e'; c.lineWidth = 9; c.lineCap = 'round';
    for (let i = 0; i < 10; i++) { const an = i * (PT.TAU / 10) + t * 0.0004; c.beginPath(); c.moveTo(x + Math.cos(an) * 70, y + Math.sin(an) * 70); c.lineTo(x + Math.cos(an) * 92, y + Math.sin(an) * 92); c.stroke(); }
    G.circ(c, x, y, 56); G.fillO(c, '#ffd84a', 4);
    c.restore();
  };
  function drawWeatherBack(c) {
    const w = F.weather, st = W.stage;
    const k = clamp((W.t - F.wAt) / 700, 0, 1);
    const L = W.visLeft, Rr = W.visRight, T = W.visTop, wv = Rr - L;
    if (w === 'sun') {
      const age = W.t - F.wAt;
      if (F.wAt && age < 2600 && !st.night) drawSun(c, Rr - 200, T + 210, Math.min(1, age / 300) * clamp((2600 - age) / 600, 0, 1), W.t);
    } else if (w === 'rain') {
      c.save(); c.globalAlpha = 0.22 * k; c.fillStyle = '#4a5f8a'; c.fillRect(L - 20, T - 20, wv + 40, PT.H - T + 40);
      // くも
      c.globalAlpha = 0.9 * k;
      for (let i = 0; i < 5; i++) { const x = L + wv * (0.1 + i * 0.2) + Math.sin(W.t * 0.0004 + i) * 30, y = T + 70 + (i % 2) * 30; for (const [dx, dy, r] of [[-50, 10, 46], [0, -10, 60], [55, 8, 44]]) { G.circ(c, x + dx, y + dy, r); c.fillStyle = '#c3cde0'; c.fill(); } }
      c.restore();
    } else if (w === 'snow') {
      c.save(); c.globalAlpha = 0.18 * k; c.fillStyle = '#e8f2ff'; c.fillRect(L - 20, T - 20, wv + 40, PT.H - T + 40);
      // ゆかが すこし しろく
      const kk = clamp((W.t - F.wAt) / 6000, 0, 1) * 0.35;
      c.globalAlpha = kk; c.fillStyle = '#ffffff'; c.fillRect(L - 20, st.floor[0] - 10, wv + 40, PT.H - st.floor[0] + 20);
      c.restore();
    } else if (w === 'night') {
      c.save(); c.globalAlpha = (st.night ? 0.3 : 0.55) * k; c.fillStyle = '#141a4a'; c.fillRect(L - 20, T - 20, wv + 40, PT.H - T + 40);
      c.globalAlpha = k;
      for (const s of nstars) { const tw = 0.5 + 0.5 * Math.sin(W.t * 0.003 + s.ph); c.fillStyle = `rgba(255,246,184,${0.4 + tw * 0.6})`; G.star(c, s.x, s.y, s.r + tw * 2, (s.r + tw * 2) * 0.42); c.fill(); }
      const mx = L + wv * 0.3, my = T + 130;
      c.fillStyle = 'rgba(255,240,170,.25)'; G.circ(c, mx, my, 80); c.fill();
      c.beginPath(); c.arc(mx, my, 50, 0, PT.TAU); c.arc(mx + 24, my - 14, 44, 0, PT.TAU, true); c.fillStyle = '#ffe680'; c.fill('evenodd');
      c.restore();
    } else if (w === 'rainbow') {
      c.save(); c.globalAlpha = 0.85 * k;
      const cx = (L + Rr) / 2, cy = st.floor[0] + 80, r0 = Math.min(wv * 0.46, 720);
      ['#ff6b6b', '#ffa94d', '#ffd84a', '#69db7c', '#4dabf7', '#9775fa'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 28; c.beginPath(); c.arc(cx, cy, r0 - i * 27, Math.PI, 0); c.stroke(); });
      for (const s of [-1, 1]) { const x = cx + s * (r0 - 70); for (const [dx, dy, r] of [[-50, 0, 44], [0, -18, 56], [50, 0, 44]]) { G.circ(c, x + dx, cy - 20 + dy, r); c.fillStyle = '#ffffff'; c.fill(); } }
      c.restore();
      if (!st.night) drawSun(c, Rr - 180, T + 190, k, W.t);
      if (Math.random() < 0.12) W.burst('spark', PT.rand(L, Rr), PT.rand(T + 40, st.floor[0]), 1, { sp: 0.03, max: 900, size: 9, col: PT.pick(['#ffffff', '#ffd23f', '#ff8fab']), g: 0 });
    }
  }
  const UMB = ['#ff6f91', '#ffd23f', '#58b9f0', '#58c46b', '#b39ae8', '#ff8a65'];
  function drawUmbrella(c, ch) {
    const k = ch.scale * (ch.def.size || 1), ext = (ch.def.legExt || 0) + (ch.def.hover || 0);
    const col = UMB[(ch.id || 0) % UMB.length];
    const top = ch.y - ch.z - (232 + ext + (ch.wear.hat ? 30 : 0)) * k;
    const sway = Math.sin(W.t * 0.003 + ch.seed) * 0.06;
    c.save(); c.translate(ch.x, top); c.rotate(sway); c.scale(k, k);
    c.strokeStyle = '#7a5a3a'; c.lineWidth = 5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -4); c.lineTo(0, 150 - (ch.wear.hat ? 0 : 30)); c.stroke();
    c.beginPath(); c.moveTo(-82, 4); c.quadraticCurveTo(-80, -66, 0, -70); c.quadraticCurveTo(80, -66, 82, 4);
    for (let i = 0; i < 4; i++) { const x0 = 82 - i * 41; c.quadraticCurveTo(x0 - 20.5, -14, x0 - 41, 4); }
    c.closePath(); G._bb = { x0: -82, y0: -70, x1: 82, y1: 4 }; G.fillO(c, col, 3);
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3;
    for (const x of [-41, 0, 41]) { c.beginPath(); c.moveTo(0, -68); c.quadraticCurveTo(x * 0.6, -40, x, -4); c.stroke(); }
    G.circ(c, 0, -72, 6); G.fillO(c, '#ffffff', 2);
    c.restore();
  }
  function drawWeatherFront(c) {
    const w = F.weather;
    const k = clamp((W.t - F.wAt) / 700, 0, 1);
    const L = W.visLeft, Rr = W.visRight, T = W.visTop, wv = Rr - L;
    if (w === 'rain') {
      for (const ch of W.chars()) if (ch.funUmb && !ch.hidden && !ch.heldBy) drawUmbrella(c, ch);
      c.save(); c.globalAlpha = k; c.strokeStyle = 'rgba(140,185,255,.8)'; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); for (const d of rain) { c.moveTo(d.x, d.y); c.lineTo(d.x + d.len * 0.18, d.y - d.len); } c.stroke();
      c.strokeStyle = 'rgba(170,205,255,.85)'; c.lineWidth = 2;
      for (const s of splash) { const kk = s.life / 300; G.ell(c, s.x, s.y, 6 + kk * 16, 2 + kk * 5); c.globalAlpha = k * (1 - kk); c.stroke(); }
      c.restore();
    } else if (w === 'snow') {
      c.save(); c.globalAlpha = k;
      for (const f of snow) { G.circ(c, f.x, f.y, f.r); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = 'rgba(150,185,230,.6)'; c.lineWidth = 1.5; c.stroke(); }
      c.restore();
    } else if (w === 'night') {
      c.save(); c.globalAlpha = (W.stage.night ? 0.12 : 0.22) * k; c.fillStyle = '#1a2060'; c.fillRect(L - 20, T - 20, wv + 40, PT.H - T + 40);
      c.globalAlpha = k;
      for (const f of flies) { const a = 0.45 + 0.55 * Math.sin(W.t * 0.004 + f.ph); c.fillStyle = `rgba(230,255,140,${a * 0.3})`; G.circ(c, f.x, f.y, 18); c.fill(); c.fillStyle = `rgba(240,255,170,${a})`; G.circ(c, f.x, f.y, 6); c.fill(); }
      c.restore();
    }
  }

  /* ================= かくれた ほし ================= */
  F.star = null; F.starWant = false;
  function placeStar() {
    const st = W.stage, sc = W.scale || 1;
    const left = W.visLeft + 70 / sc + 20, right = W.visRight - 150 / sc;
    const top = W.visTop + 100 / sc, bottom = Math.min(st.floor[1] - 20, W.visBottom - 30);
    const cands = [];
    W.fixes().forEach((f) => {
      if (f.def.area || f.def.deco || f.def.hidden || f.def.sky || f.def.wall || f.type === 'skystar') return;
      for (const s of [-1, 1]) cands.push({ x: f.x + s * (f.w / 2 - 12), y: f.y - PT.rand(18, Math.max(24, Math.min(f.h * 0.55, 140))) });
    });
    for (let i = 0; i < 3; i++) cands.push({ x: PT.rand(left, right), y: PT.rand(top, Math.max(top + 10, st.floor[0] - 40)) });
    for (let i = 0; i < 2; i++) cands.push({ x: PT.rand(left, right), y: PT.rand(st.floor[0] + 10, bottom) });
    const ok = cands.filter((p) => p.x > left && p.x < right && p.y > top && p.y < bottom);
    const p = ok.length ? PT.pick(ok) : { x: (left + right) / 2, y: top + 60 };
    F.star = { x: p.x, y: p.y, ph: Math.random() * 6 };
  }
  const starR = () => Math.max(14, 10 / (W.scale || 1));
  function drawStar(c) {
    const s = F.star; if (!s) return;
    const r = starR();
    const tw = 0.5 + 0.5 * Math.sin(W.t * 0.005 + s.ph);
    c.save();
    c.fillStyle = `rgba(255,240,150,${0.25 + tw * 0.3})`; G.circ(c, s.x, s.y, r * 1.7); c.fill();
    G.star(c, s.x, s.y, r * (0.92 + tw * 0.12), r * 0.45, 5, -Math.PI / 2 + Math.sin(W.t * 0.002) * 0.2); c.fillStyle = '#ffd23f'; c.fill(); c.strokeStyle = '#e09a10'; c.lineWidth = Math.max(2, r * 0.14); c.stroke();
    // キラッ
    const fl = (W.t + s.ph * 300) % 1600;
    if (fl < 380) { const kk = Math.sin((fl / 380) * Math.PI); c.fillStyle = `rgba(255,255,255,${kk})`; G.star(c, s.x + r * 0.9, s.y - r * 0.9, r * 0.9 * kk + 1, r * 0.18, 4, 0); c.fill(); }
    c.restore();
  }
  F.tapAt = (x, y) => {
    const s = F.star;
    if (!s || !W.stage) return false;
    if (Math.hypot(x - s.x, y - s.y) > Math.max(56, 30 / (W.scale || 1))) return false;
    foundStar();
    return true;
  };
  function foundStar() {
    const s = F.star; F.star = null;
    const sid = W.stage.id;
    const d = S();
    if (d) { d.funStars = d.funStars || {}; d.funStars[sid] = (d.funStars[sid] || 0) + 1; PT.save.touch(); }
    const cnt = d ? d.funStars[sid] : 1;
    fanfare(); A.sfx('sparkle');
    const r0 = starR();
    W.special({ type: 'funstar', x: s.x, y: s.y, max: 1500, draw(c, f, k) {
      c.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
      const up = PT.easeOut(Math.min(1, k * 1.6));
      const r = r0 + (90 - r0) * up;
      c.save(); c.translate(f.x, f.y - up * 160); c.rotate(up * PT.TAU);
      c.fillStyle = 'rgba(255,240,150,.4)'; G.circ(c, 0, 0, r * 1.6); c.fill();
      G.star(c, 0, 0, r, r * 0.45); G.fillO(c, '#ffd23f', 5);
      c.restore();
    } });
    W.ring(s.x, s.y, '#ffd23f', 800, 120);
    W.burst('star', s.x, s.y, 14, { sp: 0.35, max: 1200, g: 0.0004 });
    W.burst('spark', s.x, s.y, 10, { sp: 0.25, max: 900, size: 12, col: '#ffffff', g: 0 });
    const tx = clamp(s.x, W.visLeft + 160, W.visRight - 160), ty = clamp(s.y - 190, W.visTop + 120, PT.H);
    W.after(450, () => { W.bigText('みつけた！', tx, ty, '#ff9a3d'); });
    W.after(1100, () => { if (cnt > 1) W.bigText(`${cnt}こめ！`, tx, ty + 60, '#4c9be8'); });
    R.free(s.x, s.y, [], 1400).slice(0, 2).forEach((ch, i) => {
      const p = W.clampFloor(s.x + (i ? 120 : -120), Math.max(W.stage.floor[0] + 20, Math.min(s.y + 60, W.stage.floor[1])), 60);
      R.claim(ch, 3600).go(p.x, p.y, true).look(s.x).face('surprise', 800).say(i ? 'すごーい！' : 'ほし みっけ！', 'star', 1500, 'yay').jump(60, 450).pose('cheer', 900).face('laugh', 900);
    });
    R.found('f_star');
  }

  /* ================= なでなで ================= */
  F.pet = (ch) => {
    if (!alive(ch)) return;
    R.claim(ch, 2000).face('love', 1800).pose('shy', 1600).say(PT.pick(['えへへ♪', 'きもちいい〜', 'うふふ']), 'heart', 1400, 'laugh');
    W.burst('heart', ch.x, headY(ch) - 20, 4, { up: true, sp: 0.15, max: 1100, size: 18 });
    A.tone(N(84), 0.12, { type: 'sine', vol: 0.14 }); A.tone(N(88), 0.14, { type: 'sine', vol: 0.12, delay: 0.08 });
    F.petAt = W.t;
    R.found('f_pet');
  };
  F.petMore = (ch) => {
    if (!alive(ch) || W.t - (F.petAt || 0) < 140) return;
    F.petAt = W.t;
    ch.lockUntil = Math.max(ch.lockUntil, W.t + 1200);
    W.setFace(ch, 'love', 1500);
    if (!ch.cur && !ch.queue.length) { ch.pose = 'shy'; }
    W.burst('heart', ch.x + PT.rand(-30, 30), headY(ch) - 10, 1, { up: true, sp: 0.15, max: 1000, size: PT.rand(14, 22) });
    A.tone(N(PT.pick([84, 86, 88, 91])), 0.1, { type: 'sine', vol: 0.1 });
  };
  F.petEnd = (ch) => { if (alive(ch) && W.t - (F.petAt || 0) < 600) R.claim(ch, 1200).face('laugh', 1000).say('もっと〜', 'heart', 1000, null).pose('hug', 800); };

  /* ================= びっくりアイテムの はんのう ================= */
  // たまご
  const BORN = ['pyoko', 'penta', 'nyan', 'kon', 'choco', 'mimi', 'panda'];
  const PLUSH = ['teddy', 'bunny', 'panda', 'penguin', 'elephant', 'duck', 'dino'];
  function hatch(e) {
    if (e.busy) return; e.busy = true;
    e.wobbleUntil = W.t + 1900;
    A.sfx('tickle');
    R.free(e.x, e.y, [], 1300).slice(0, 2).forEach((ch, i) => R.claim(ch, 4200).go(e.x + (i ? 130 : -130), e.y + 30, true).look(e.x).face('surprise', 900).say(i ? 'なにかな？' : 'うごいてる！', '!', 1300, 'wow').pose('peek', 1500).face('laugh', 1200).pose('cheer', 900));
    W.after(650, () => { e.crack = 1; A.sfx('tap'); });
    W.after(1250, () => { e.crack = 2; A.sfx('tickle'); });
    W.after(1900, () => {
      if (e.removed) return;
      W.remove(e);
      A.sfx('pop'); A.sfx('discover');
      for (const s of [-1, 1]) W.special({ type: 'eggshell', x: e.x + s * 10, y: e.y - 60 * e.scale, max: 900, draw(c, f, k) {
        c.globalAlpha = 1 - k;
        c.save(); c.translate(f.x + s * k * 80, f.y - Math.sin(k * Math.PI) * 60 + k * 50); c.rotate(s * k * 1.6); c.scale(e.scale, e.scale);
        c.beginPath(); c.arc(0, 0, 34, s < 0 ? Math.PI * 0.5 : -Math.PI * 0.5, s < 0 ? Math.PI * 1.5 : Math.PI * 0.5); c.closePath(); G.fillO(c, '#fff3d6', 3);
        c.restore();
      } });
      W.burst('star', e.x, e.y - 50, 12, { up: true, sp: 0.25 });
      W.ring(e.x, e.y - 50, '#ff9ec4', 700, 100);
      const free = BORN.filter((cid) => PT.CHARS[cid] && !W.charOf(cid));
      if (free.length && Math.random() < 0.45) {
        const ch = W.addChar(PT.pick(free), e.x, e.y);
        ch.pop = W.t; ch.pose = 'jump'; ch.poseT = 0;
        R.claim(ch, 2600).jump(70, 500).face('laugh', 1500).say('うまれたよ〜！', 'heart', 1600, 'yay').pose('cheer', 900);
        refresh();
      } else {
        popItem(PT.pick(PLUSH), e.x, e.y + 4);
      }
      W.after(500, () => popItem(randomItem(), e.x + PT.pick([-1, 1]) * 120, e.y + 20));
      R.found('f_egg');
    });
  }
  R.add({ id: 'fun-egg', pri: 70, test: (c) => (isP(c.e, 'funegg') && !c.e.busy ? 1 : null), run(c) { hatch(c.e); } });
  R.add({ id: 'fun-egg-tap', on: 'tapprop', pri: 70, test: (c) => (isP(c.e, 'funegg') && !c.e.busy ? 1 : null), run(c) { hatch(c.e); } });

  // ガチャガチャ
  function gacha(g, ch) {
    if (g.busyUntil && W.t < g.busyUntil) return;
    g.busyUntil = W.t + 2200; g.turnAt = W.t;
    for (let i = 0; i < 4; i++) A.noise(0.05, { vol: 0.18, filter: 1800, delay: i * 0.16 });
    A.tone(N(76), 0.1, { type: 'triangle', vol: 0.12, delay: 0.66 });
    if (ch) R.claim(ch, 3600).look(g.x).say('なにが でるかな？', 'gacha', 1500, 'talk').pose('peek', 1500).face('laugh', 1200).say('やったー！', 'star', 1300, 'yay').pose('cheer', 900);
    const sx = g.x, sy = g.y - 20 * g.scale;
    const side = ch ? (ch.x < g.x ? -1 : 1) : PT.pick([-1, 1]);
    const lx = g.x + side * 110, ly = W.clampFloor(g.x, g.y + 40, 60).y;
    const col = PT.pick(CAP);
    W.after(700, () => {
      A.sfx('pop');
      W.special({ type: 'capsule', max: 1700, draw(c, f) {
        c.globalAlpha = f.life > 1300 ? (1700 - f.life) / 400 : 1;
        const k1 = Math.min(1, f.life / 600);
        const x = sx + (lx - sx) * k1, y = sy + (ly - 18 - sy) * k1 - Math.sin(k1 * Math.PI) * 50;
        if (f.life < 800) { capsule(c, x, y, 18, col, k1 * 6 * side); return; }
        const k2 = Math.min(1, (f.life - 800) / 400);
        c.save(); c.translate(x, y - k2 * 40); c.rotate(-k2 * 1.2 * side);
        c.beginPath(); c.arc(0, 0, 18, Math.PI, 0); c.closePath(); G.fillO(c, col, 2); c.restore();
        c.save(); c.translate(x, y); c.beginPath(); c.arc(0, 0, 18, 0, Math.PI); c.closePath(); G.fillO(c, '#ffffff', 2); c.restore();
      } });
      W.after(450, () => A.sfx('boing'));
    });
    W.after(1550, () => {
      A.sfx('sparkle');
      popItem(randomItem(['food', 'tools', 'magic', 'dress']), lx, ly + 6);
      R.found('f_gacha');
    });
  }
  R.add({ id: 'fun-gacha-tap', on: 'tapprop', pri: 70, test: (c) => (isP(c.e, 'gacha') ? 1 : null), run(c) { gacha(c.e, R.free(c.e.x, c.e.y, [], 600)[0] || null); } });
  R.add({ id: 'fun-gacha', pri: 70, test: (c) => (isP(c.e, 'gacha') ? 1 : null),
    run(c) {
      const g = c.e; const ch = R.free(g.x, g.y, [], 1600)[0];
      if (!ch) { gacha(g, null); return; }
      g.busyUntil = W.t + 4000;
      R.claim(ch, 4000).to(g, ch.x < g.x ? -90 : 90, 6, true).look(g.x).say('まわして みよう！', 'gacha', 1100, 'yay').pose('hold', 500).do(() => { g.busyUntil = 0; gacha(g, ch); });
    } });

  // きせかえ ボックス
  const wearList = (slot) => Object.values(PT.ITEMS).filter((it) => it.wear && it.wear[0] === slot && unlocked(it));
  F.randomOutfit = () => {
    const out = {}; let role = null;
    const pick = (slot, p) => { const l = wearList(slot); if (l.length && Math.random() < p) { const it = PT.pick(l); out[slot] = it.wear[1]; role = it.role || role; } };
    pick('hat', 1); pick('back', 0.45); pick('face', 0.3); pick('body', 1);
    return { wear: out, role };
  };
  function kisekae(box, ch) {
    if (!alive(ch)) return;
    box.busyUntil = W.t + 1800;
    const sx = ch.x, sy = ch.y;
    R.claim(ch, 3800).to(box, ch.x < box.x ? -70 : 70, 6, true).look(box.x).say('おきがえ〜！', 'kisekae', 1000, 'yay').do(() => {
      box.busyUntil = W.t + 1600;
      A.sfx('whoosh');
      W.poof(ch.x, ch.y - 60); W.poof(ch.x, ch.y - 120);
      ch.hidden = true;
      W.after(800, () => {
        if (!alive(ch)) return;
        const o = F.randomOutfit();
        ch.wear = o.wear; ch.role = o.role;
        ch.hidden = false;
        A.sfx('magic');
        W.burst('spark', ch.x, ch.y - 120 * ch.scale, 14, { sp: 0.25, max: 800, size: 12, col: '#ffd23f', g: 0 });
        W.burst('star', ch.x, ch.y - 100, 6, { up: true, sp: 0.2 });
        R.claim(ch, 2600).pose('spin', 800).face('laugh', 1500).say('じゃーん！', 'star', 1500, 'yay').pose('cheer', 900).do(() => R.found('f_kisekae'));
        R.audience(ch.x, ch.y, [ch], 'wow', 2, 700);
        PT.game && PT.game.saveStageSoon && PT.game.saveStageSoon();
      });
    });
    void sx; void sy;
  }
  const busy = (e) => e.busyUntil && W.t < e.busyUntil;
  R.add({ id: 'fun-kisekae', pri: 72, test: (c) => {
    if (!isP(c.e, 'kisekae') || busy(c.e)) return null;
    if (isC(c.tgt)) return c.tgt;
    return R.free(c.e.x, c.e.y, [], 1600)[0] || null;
  }, run(c, ch) { kisekae(c.e, ch); } });
  R.add({ id: 'fun-kisekae-tap', on: 'tapprop', pri: 70, test: (c) => (isP(c.e, 'kisekae') && !busy(c.e) ? R.free(c.e.x, c.e.y, [], 1600)[0] || null : null), run(c, ch) { kisekae(c.e, ch); } });
  // キャラを きせかえボックスに のせた
  R.add({ id: 'fun-kisekae-char', pri: 76, test: (c) => (isC(c.e) && isP(c.tgt, 'kisekae') && !busy(c.tgt) ? c.tgt : null), run(c, box) { kisekae(box, c.e); } });

  // プレゼント くじ
  function kuji(box, ch) {
    if (busy(box)) return;
    box.busyUntil = W.t + 2600;
    const big = Math.random() < 0.25;
    const go = () => {
      A.sfx('drumroll');
      box.busyUntil = W.t + 1800;
      W.after(1200, () => {
        W.special({ type: 'ticket', x: box.x, y: box.y - 100 * box.scale, max: 1600, draw(c, f, k) {
          const up = PT.easeOut(Math.min(1, k * 2));
          c.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1;
          c.save(); c.translate(f.x, f.y - up * 90); c.rotate(Math.sin(k * 10) * 0.08);
          G.rr(c, -46, -22, 92, 44, 8); G.fillO(c, big ? '#ffd23f' : '#ff8fb1', 3);
          c.font = `900 24px ${PT.FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffffff'; c.strokeStyle = big ? '#c98a00' : '#d0507a'; c.lineWidth = 5; c.strokeText('あたり', 0, 2); c.fillText('あたり', 0, 2);
          c.restore();
        } });
        fanfare();
        W.bigText(big ? 'だいあたり！' : 'あたり！', clamp(box.x, W.visLeft + 160, W.visRight - 160), clamp(box.y - 230, W.visTop + 120, PT.H), big ? '#ff9a3d' : '#ff6f91');
        W.after(600, () => {
          popItem('present', box.x + 120, box.y + 20);
          if (big) { for (let i = 0; i < 3; i++) W.after(200 + i * 220, () => popItem(randomItem(), box.x - 140 + i * 140, box.y + 70)); X.confetti(box.x, 1400); }
          else popItem(randomItem(), box.x - 120, box.y + 30);
          R.found('f_kuji');
        });
        if (ch && alive(ch)) R.claim(ch, 2600).face('laugh', 1500).say(big ? 'だいあたり〜！' : 'あたった！', 'present', 1500, 'yay').jump(60, 450).pose('cheer', 900);
      });
    };
    if (ch) R.claim(ch, 4000).to(box, ch.x < box.x ? -80 : 80, 6, true).look(box.x).say('どれに しようかな…', 'kuji', 1200, 'hmm').pose('peek', 900).do(go);
    else go();
  }
  R.add({ id: 'fun-kuji', pri: 70, test: (c) => (isP(c.e, 'kuji') && !busy(c.e) ? 1 : null), run(c) { kuji(c.e, isC(c.tgt) ? c.tgt : R.free(c.e.x, c.e.y, [], 1600)[0] || null); } });
  R.add({ id: 'fun-kuji-tap', on: 'tapprop', pri: 70, test: (c) => (isP(c.e, 'kuji') && !busy(c.e) ? 1 : null), run(c) { kuji(c.e, R.free(c.e.x, c.e.y, [], 1600)[0] || null); } });

  // ジャンボ サイコロ
  const KAZU = ['いち', 'に', 'さん', 'よん', 'ご', 'ろく'];
  function roll(d) {
    if (busy(d) || d.inTween) return;
    d.busyUntil = W.t + 1200 + 6 * 460 + 800;
    const n = 1 + Math.floor(Math.random() * 6);
    A.sfx('boing');
    let last = 0;
    const z0 = d.z || 0;
    R.tween(d, 1000, (k) => {
      d.z = z0 + Math.abs(Math.sin(k * Math.PI * 2)) * 90 * (1 - k * 0.5);
      d.drot = k * PT.TAU * 2;
      if (W.t - last > 90) { last = W.t; d.dn = 1 + Math.floor(Math.random() * 6); A.sfx('tap'); }
    }, () => {
      d.z = z0; d.drot = 0; d.dn = n;
      A.sfx('ding');
      W.ring(d.x, d.y - 40, '#ff8fb1', 600, 90);
      W.bigText(`${n}！ ${KAZU[n - 1]}`, clamp(d.x, W.visLeft + 160, W.visRight - 160), clamp(d.y - 170, W.visTop + 120, PT.H), '#ff6f91');
      const cs = R.free(d.x, d.y, [], 99999).slice(0, 8);
      cs.forEach((ch, i) => {
        const a = R.claim(ch, 800 + n * 480 + 2000).look(d.x).wait(500);
        for (let j = 0; j < n; j++) a.say(`${KAZU[j]}！`, null, 440, i === 0 ? 'yay' : null).jump(55, 440);
        a.face('laugh', 1200).pose('cheer', 800);
      });
      W.after(700 + n * 460, () => { A.sfx('cheer'); R.found('f_dice'); });
    });
  }
  R.add({ id: 'fun-dice', pri: 70, test: (c) => (isP(c.e, 'fundice') && !busy(c.e) ? 1 : null), run(c) { roll(c.e); } });
  R.add({ id: 'fun-dice-tap', on: 'tapprop', pri: 70, test: (c) => (isP(c.e, 'fundice') && !busy(c.e) ? 1 : null), run(c) { roll(c.e); } });

  /* ================= ワールドとの つなぎ ================= */
  F.onLoad = () => {
    F.danceAt = -1e9; F.danceTok = null; F.extraAt = 0;
    const b = danceBtn(); if (b) b.classList.remove('on');
    A.apply();
    F.weather = 'sun'; F.wAt = 0;
    rain = []; snow = []; splash = []; flies = []; nstars = [];
    const wb = document.querySelector('[data-act="weather"]');
    if (wb) { wb.dataset.w = 'sun'; const ic = wb.querySelector('.fico'); if (ic) ic.className = 'fico fico-w-sun'; }
    F.star = null; F.starWant = true;
  };
  F.tick = (dt) => {
    if (F.starWant && W.stage && PT.game && PT.game.screen === 'play') { F.starWant = false; placeStar(); }
    tickWeather(dt);
    tickDance(dt);
  };
  F.drawBack = (c) => {
    drawWeatherBack(c);
    drawStar(c);
  };
  F.drawFront = (c) => {
    drawWeatherFront(c);
    drawDance(c);
  };
})();
