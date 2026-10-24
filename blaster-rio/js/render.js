'use strict';
// ===== 主人公リオ（オリジナルデザイン：ひれ型のトサカ＋赤いマフラー） =====
function drawHero(x, y, f, pose, t, pal, shoot, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(f * sc, sc);
  const A = pal.a, B = pal.b, Sc = pal.s, skin = '#ffd9bc', dA = shade(A, -0.28);
  const boot = l => { RR(-3.5, l - 1.5, 8, 4.5, 2, A); R(-2.5, l - 1.5, 6, 1.2, B); };
  const bootB = l => { RR(-3.5, l - 1.5, 8, 4.5, 2, dA); };
  const hand = l => CIR(0, l + 1, 2.4, B);
  const cannon = l => { RR(-3.6, l - 2.5, 7.2, 7.5, 2.6, B); CIR(0, l + 4.6, 1.8, OUT, null); R(-3.6, l, 7.2, 1.2, A); };
  let bob = 0, legF = 0.12, legB = -0.12, armF = 0.25, armB = -0.2, lean = 0, hy = -23;
  if (pose === 'run') { const s = Math.sin(t * 0.33); legF = s * 0.85; legB = -s * 0.85; armF = -s * 0.6; armB = s * 0.6; bob = -Math.abs(Math.cos(t * 0.33)) * 1.2; }
  if (pose === 'jump') { legF = -0.95; legB = 0.55; armF = -0.7; armB = -2.3; }
  if (pose === 'hurt') { legF = 0.4; legB = -0.5; armF = -2.4; armB = -2; lean = -0.3; }
  if (pose === 'land') { bob = 1.5; }
  if (shoot) armF = -1.57;
  // マフラー
  const wave = Math.sin(t * 0.25);
  const sl = pose === 'run' || pose === 'jump' || pose === 'slide' ? 1 : 0.4;
  if (pose === 'climb') {
    // 背中向き
    const k = (t >> 3) % 2 ? 1 : -1;
    limb(-2.5, -9, 8, 5, 0, dA, bootB); limb(2.5, -9 + k * 2, 8, 5, 0, dA, bootB);
    RR(-6, -18, 12, 10, 3, B); R(-6, -11, 12, 2, A);
    limb(-6, -16, 7, 4.5, Math.PI + 0.2 + k * 0.3, A, hand); limb(6, -16, 7, 4.5, Math.PI - 0.2 + k * 0.3, A, hand);
    POLY([-4, -17, 4, -17, 2 + wave, -9, -2 + wave, -10], Sc);
    CIR(0, hy, 6.5, A); CIR(-6.2, hy + 1, 2.2, B); CIR(6.2, hy + 1, 2.2, B);
    POLY([-1.5, hy - 6, 0, hy - 11, 1.5, hy - 6], B);
    ctx.restore(); return;
  }
  if (pose === 'slide') {
    POLY([-1, -10, -12 - sl * 3, -12 + wave * 2, -13 - sl * 3, -8 + wave * 2, -2, -7], Sc);
    limb(-2, -5, 7, 5, 1.1, dA, bootB);
    limb(2, -5, 9, 5, -1.45, A, boot);
    ctx.save(); ctx.translate(0, -5); ctx.rotate(0.5);
    RR(-6, -10, 12, 9, 3, B); R(-6, -3, 12, 2, A);
    limb(4, -8, 6, 4.5, 0.9, A, hand);
    CIR(1, -14, 6.5, A); RR(1.5, -16, 6, 6.5, 2.5, skin); R(4.3, -14.5, 1.8, 2.6, '#14224a'); R(4.6, -14.3, 0.8, 0.9, '#fff');
    CIR(-1.5, -13, 2.3, B); POLY([-5, -18, 2, -21.5, 5.5, -18.5, -1, -17], B); R(1, -21, 2.5, 1.5, Sc);
    ctx.restore();
    ctx.restore(); return;
  }
  ctx.translate(0, bob);
  POLY([-2, -18, -11 - sl * 4, -17 + wave * 2.5, -12 - sl * 4, -13 + wave * 2.5, -3, -15], Sc);
  limb(-2, -9, 8, 5, legB, dA, bootB);
  ctx.save(); ctx.rotate(lean);
  limb(-3, -16, 7, 4.5, armB, dA, hand);
  RR(-6, -18.5, 12, 10.5, 3.2, B);
  POLY([-1, -17, 3, -17, 1, -13], A, null);
  R(-6, -10, 12, 2, A);
  ctx.restore();
  limb(2, -9, 8, 5, legF, A, boot);
  ctx.save(); ctx.rotate(lean);
  // 頭
  CIR(0, hy, 6.8, A);
  RR(0, hy - 2.5, 6.6, 7.2, 2.6, skin);
  const blink = (t % 180) < 6 && pose === 'stand';
  if (pose === 'hurt') { ctx.strokeStyle = '#14224a'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(2.5, hy - 1); ctx.lineTo(4.8, hy + 1); ctx.moveTo(4.8, hy - 1); ctx.lineTo(2.5, hy + 1); ctx.stroke(); }
  else if (blink) R(2.6, hy + 0.5, 2.2, 0.8, '#14224a');
  else { R(2.8, hy - 1.2, 1.9, 2.8, '#14224a'); R(3.1, hy - 1, 0.9, 1, '#fff'); }
  R(0, hy - 3.2, 6.8, 1.6, A);
  CIR(-2.6, hy + 0.8, 2.5, B);
  CIR(-2.6, hy + 0.8, 1, Sc, null);
  // トサカ（後ろへ流れるひれ）
  POLY([-5, hy - 4.5, 3, hy - 8.5, 6.5, hy - 5, -2, hy - 3.5], B);
  R(1.8, hy - 8.2, 2.6, 1.6, Sc);
  ctx.restore();
  limb(3, -16, 7, 4.8, armF, A, shoot ? cannon : hand);
  ctx.restore();
}
function playerPose() {
  const p = P;
  if (p.ladder) return p.shootT > 0 ? 'jump' : 'climb';
  if (p.slideT > 0) return 'slide';
  if (p.hurtT > 0 || p.stunT > 0) return 'hurt';
  if (!p.onGround) return 'jump';
  if (Math.abs(p.vx) > 0.2) return 'run';
  if (p.landT > 0) return 'land';
  return 'stand';
}
function drawPlayer() {
  const p = P, pal = WEAPONS[p.weapon];
  if (p.dead) return;
  if (p.warp && p.warp !== 'done') {
    // テレポート光線
    const yy = p.warpY;
    R(cx(p) - 2, yy - 18, 4, 22, pal.a); R(cx(p) - 1, yy - 18, 2, 22, '#fff');
    return;
  }
  if (p.invT > 0 && p.hurtT <= 0 && p.invT % 4 < 2) return;
  const pose = playerPose();
  drawHero(cx(p), p.y + p.h, p.ladder && p.shootT > 0 ? p.facing : p.facing, pose, p.anim, pal, p.shootT > 0 && pose !== 'slide');
  if (p.chargeLv && S.t % 4 < 2) {
    ctx.save(); ctx.globalAlpha = 0.5;
    const c = p.chargeLv === 2 ? (S.t % 8 < 4 ? '#ffe040' : '#40e8ff') : '#a0f0ff';
    ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx(p), cy(p) - 2, 11, 15, 0, 0, 7); ctx.stroke();
    ctx.restore();
    if (p.chargeLv === 2) addPart({ x: cx(p) + rnd(-10, 10), y: cy(p) + rnd(-12, 12), vx: 0, vy: -0.5, life: 10, c, s: 1.5 });
  }
  if (p.leaves) for (let i = 0; i < 4; i++) { const a = p.leaves.a + i * Math.PI / 2; leafShape(cx(p) + Math.cos(a) * 18, cy(p) + Math.sin(a) * 18, a, '#5ac040'); }
  if (p.stunT > 0) for (let i = 0; i < 3; i++) { const a = S.t * 0.2 + i * 2.1; star(cx(p) + Math.cos(a) * 8, p.y - 6 + Math.sin(a) * 2, 2.5, 1, 5, a, '#ffe040', null); }
}

// ===== 敵 =====
function drawEnemy(e) {
  if (e.flash > 0 && e.flash % 2) return;
  const th = S.th, A = th.enemy, B = th.enemy2, t = e.t, f = e.facing;
  ctx.save(); ctx.translate(cx(e), e.y + e.h); ctx.scale(f, 1);
  switch (e.type) {
    case 'shell': {
      const open = e.st === 1 ? e.t / 14 : e.st === 2 ? 1 : 0;
      if (open > 0) { RR(-5, -9 - open * 3, 10, 9, 3, '#e8e8f0'); CIR(1.5, -6 - open * 3, 3, '#fff'); CIR(2.3, -6 - open * 3, 1.5, '#d02040', null); R(-5, -2, 3, 2, OUT); R(2, -2, 3, 2, OUT); }
      ctx.beginPath(); ctx.ellipse(0, -2 - open * 7, 8.5, 8, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = A; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 0.8; ctx.stroke();
      R(-8, -4 - open * 7, 17, 2, B); R(-1, -9 - open * 7, 2, 6, shade(A, 0.35));
      break;
    }
    case 'walker': {
      const s = Math.sin(t * 0.2) * 2;
      R(-5, -6, 3, 6 + s * 0.3, OUT); R(2, -6, 3, 6 - s * 0.3, OUT);
      RR(-7 + s * 0.3, -2, 6, 2.5, 1, B); RR(1 - s * 0.3, -2, 6, 2.5, 1, B);
      RR(-8, -20, 16, 15, 3, A); RR(-5, -17, 11, 6, 2, '#20202a'); R(1 + ((t >> 4) % 2), -15, 3, 2, '#ff4040');
      R(-8, -8, 16, 2, B); R(-1, -24, 2, 4, OUT); CIR(0, -24, 1.6, '#ff4040', null);
      R(7, -14, 5, 3, shade(A, -0.3));
      break;
    }
    case 'flyer': {
      const w = Math.sin(t * 0.5) * 6;
      POLY([-2, -8, -12, -10 - w, -8, -4], B); POLY([2, -8, 12, -10 - w, 8, -4], B);
      CIR(0, -6, 6.5, A); CIR(2, -7, 3, '#fff'); CIR(2.8, -7, 1.5, OUT, null); POLY([-3, -1, 0, 3, 3, -1], '#ccc');
      break;
    }
    case 'hopper': {
      const crouch = e.onGround ? Math.min(4, e.t / 10) : -1;
      ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let i = 0; i < 4; i++) { ctx.moveTo(-5, -1 - i * (5 - crouch) / 4); ctx.lineTo(5, -1 - i * (5 - crouch) / 4); } ctx.stroke();
      RR(-7, -1, 14, 2, 1, B);
      CIR(0, -11 + crouch, 7, A); CIR(-2.5, -15 + crouch, 2.5, '#fff'); CIR(3, -15 + crouch, 2.5, '#fff'); CIR(-2, -15 + crouch, 1.2, OUT, null); CIR(3.5, -15 + crouch, 1.2, OUT, null);
      break;
    }
    case 'turret': {
      ctx.scale(f, 1);
      RR(-8, -8, 16, 8, 2, B);
      const a = Math.atan2(cy(P) - (e.y + 6), cx(P) - cx(e));
      ctx.save(); ctx.translate(0, -11); ctx.rotate(a); RR(0, -2.5, 12, 5, 1.5, '#555'); ctx.restore();
      CIR(0, -11, 6.5, A); CIR(0, -11, 2.5, t % 100 > 40 && t % 100 < 50 ? '#fff' : '#ff3040', null);
      break;
    }
    case 'bomber': {
      const w = Math.abs(Math.sin(t * 0.7)) * 10;
      R(-0.5, -14, 1, 4, OUT); RR(-w / 2, -15, w + 0.5, 1.5, 1, '#ddd', null);
      ctx.beginPath(); ctx.ellipse(0, -5, 11, 5, 0, 0, 7); ctx.fillStyle = A; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 0.8; ctx.stroke();
      R(-11, -5, 22, 2, B); CIR(0, -1, 3, '#333'); CIR(0, -7, 2.5, '#9ff', null);
      break;
    }
    case 'big': {
      const s = Math.sin(t * 0.12) * 2;
      RR(-12, -10 + s, 9, 10, 3, B); RR(3, -10 - s, 9, 10, 3, B);
      RR(-14, -34, 28, 26, 6, A);
      RR(-9, -30, 18, 9, 3, '#20202a'); R(-6 + ((t >> 3) % 3) * 4, -27, 4, 3, '#ff3040');
      R(-14, -14, 28, 3, B);
      limb(13, -28, 10, 7, e.t % 150 > 20 && e.t % 150 < 40 ? -1.5 : 0.3, shade(A, -0.2), l => RR(-4, l - 2, 8, 7, 2, B));
      POLY([-10, -34, -14, -42, -5, -34], B); POLY([10, -34, 14, -42, 5, -34], B);
      break;
    }
  }
  ctx.restore();
  if (e.frozen > 0) { ctx.fillStyle = 'rgba(160,230,255,.55)'; ctx.fillRect(e.x - 1, e.y - 1, e.w + 2, e.h + 2); R(e.x + 2, e.y + 2, 3, 6, '#fff'); }
}

// ===== 弾 =====
function drawPB(b) {
  const x = b.x + b.w / 2, y = b.y + b.h / 2, t = b.t;
  switch (b.k) {
    case 'buster': ctx.beginPath(); ctx.ellipse(x, y, 4, 3, 0, 0, 7); ctx.fillStyle = '#fff7a0'; ctx.fill(); ctx.strokeStyle = '#ff9a20'; ctx.lineWidth = 1; ctx.stroke(); break;
    case 'half': CIR(x, y, 6, '#40e0ff', '#fff', 1.5); CIR(x, y, 3, '#fff', null); break;
    case 'full': {
      const c = t % 4 < 2 ? '#40e8ff' : '#ffe040', s = sign(b.vx);
      ctx.save(); ctx.translate(x, y); ctx.scale(s, 1);
      POLY([-16, -9, 2, -9, 12, 0, 2, 9, -16, 9, -8, 0], c, '#fff', 1.2); CIR(2, 0, 6, '#fff', null);
      ctx.restore(); break;
    }
    case 'flare': for (let i = 0; i < 3; i++) POLY([b.x + i * 4, b.y + b.h, b.x + 2 + i * 4 + Math.sin(t * 0.5 + i) * 2, b.y + 2 + (i % 2) * 4, b.x + 6 + i * 4, b.y + b.h], i % 2 ? '#ffd23a' : '#ff5a1f', null); break;
    case 'bubble': CIR(x, y, 5.5, 'rgba(120,200,255,.5)', '#e8faff', 1); CIR(x - 2, y - 2, 1.5, '#fff', null); break;
    case 'volt': { ctx.strokeStyle = t % 4 < 2 ? '#fff6a0' : '#e8c400'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 4, y - 3); ctx.lineTo(x, y + 1); ctx.lineTo(x - 1, y - 1); ctx.lineTo(x + 4, y + 3); ctx.stroke(); CIR(x, y, 2, '#fff', null); break; }
    case 'ice': { const s = sign(b.vx); POLY([x - s * 9, y - 2, x + s * 4, y - 2.5, x + s * 10, y, x + s * 4, y + 2.5, x - s * 9, y + 2], '#c0f0ff', '#3a8ad0'); break; }
    case 'rock': { ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.2); POLY([-6, -3, -2, -6, 4, -5, 6, 1, 2, 6, -5, 4], '#9a6a3a'); R(-2, -3, 3, 2, '#c8a070'); ctx.restore(); break; }
    case 'cyclone': {
      ctx.save(); ctx.globalAlpha = 0.85;
      for (let i = 0; i < 6; i++) { const yy = b.y + b.h - i * 6, w = 4 + i * 2.2, o = Math.sin(t * 0.4 + i) * 2; ctx.beginPath(); ctx.ellipse(x + o, yy, w, 2.2, 0, 0, 7); ctx.strokeStyle = i % 2 ? '#e8fff4' : '#2cc890'; ctx.lineWidth = 1.5; ctx.stroke(); }
      ctx.restore(); break;
    }
    case 'leaf': for (let i = 0; i < 4; i++) { const a = t * 0.25 + i * Math.PI / 2; leafShape(x + Math.cos(a) * 10, y + Math.sin(a) * 10, a, '#5ac040'); } break;
  }
}
function drawEB(b) {
  const x = b.x + b.w / 2, y = b.y + b.h / 2, t = b.t;
  const warn = b.delay && t <= b.delay;
  switch (b.kind) {
    case 'gfire': for (let i = 0; i < 3; i++) POLY([b.x + i * 4, b.y + b.h, b.x + 2 + i * 4 + Math.sin(t * 0.5 + i) * 2, b.y + (i % 2) * 5, b.x + 6 + i * 4, b.y + b.h], i % 2 ? '#ffd040' : '#ff4a10', null); break;
    case 'fireball': CIR(x, y, 5, '#ff7a20', '#ffd040', 1.2); CIR(x, y, 2, '#fff6c0', null); break;
    case 'bub': CIR(x, y, 6, 'rgba(90,170,255,.55)', '#c8f0ff', 1); CIR(x - 2, y - 2, 1.5, '#fff', null); break;
    case 'wave': for (let i = 0; i < 3; i++) CIR(x + Math.sin(t * 0.3 + i) * 2, b.y + b.h - 4 - i * 6, 6 - i, i ? '#a8e8ff' : '#3a90e0', null); break;
    case 'bolt':
      if (warn) { if (t % 6 < 3) { R(x - 7, 0, 14, 4, '#ffe040'); R(x - 1, 0, 2, H, 'rgba(255,240,100,.25)'); } }
      else { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); let yy = 0, xx = x; ctx.moveTo(xx, 0); while (yy < FLOOR) { yy += 14; xx = x + rnd(-5, 5); ctx.lineTo(xx, yy); } ctx.stroke(); ctx.strokeStyle = '#ffe040'; ctx.lineWidth = 1.5; ctx.stroke(); }
      break;
    case 'spark': CIR(x, y, 4, t % 4 < 2 ? '#fff6a0' : '#ffe040', '#fff', 1); break;
    case 'lance': { const a = Math.atan2(b.vy, b.vx); ctx.save(); ctx.translate(x, y); ctx.rotate(a); POLY([-8, -2, 4, -2.5, 9, 0, 4, 2.5, -8, 2], '#d8f6ff', '#3a8ad0'); ctx.restore(); break; }
    case 'icicle': POLY([b.x, b.y, b.x + b.w, b.y, b.x + b.w / 2, b.y + b.h], '#d8f6ff', '#3a8ad0'); break;
    case 'boulder': case 'rock': case 'pebble': { ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.1); const r = b.w / 2; POLY([-r, -r * 0.4, -r * 0.4, -r, r * 0.6, -r * 0.8, r, r * 0.2, r * 0.3, r, -r * 0.7, r * 0.7], b.c || '#8a6a4a'); ctx.restore(); break; }
    case 'cutter': { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(b.vy, b.vx)); ctx.beginPath(); ctx.arc(0, 0, 7, -1.2, 1.2); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); break; }
    case 'tornado': for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(x + Math.sin(t * 0.4 + i) * 2, b.y + b.h - i * 6, 3 + i * 1.8, 2, 0, 0, 7); ctx.strokeStyle = i % 2 ? '#fff' : '#40d0a0'; ctx.lineWidth = 1.5; ctx.stroke(); } break;
    case 'star': star(x, y, 5.5, 2.5, 5, t * 0.15, '#ffe070'); break;
    case 'meteor': CIR(x, y, 7, b.c || '#c890ff'); for (let i = 1; i < 4; i++) CIR(x + i * 4, y - i * 7, 5 - i, 'rgba(255,200,255,.4)', null); break;
    case 'seed': CIR(x, y, 4, '#8a5a2a'); R(x - 1, y - 5, 2, 3, '#5ac040'); break;
    case 'thorn':
      if (warn) { if (t % 6 < 3) R(b.x, b.y + b.h - 3, b.w, 3, '#5ac040'); }
      else { const hh = Math.min(b.h, (t - b.delay) * 4); for (let i = 0; i < 3; i++) POLY([b.x + i * 4, b.y + b.h, b.x + i * 4 + 2, b.y + b.h - hh + (i % 2) * 5, b.x + i * 4 + 4, b.y + b.h], '#3a8a2a', '#123a14'); }
      break;
    case 'leafE': leafShape(x, y, t * 0.3, '#5ac040'); break;
    case 'ball': CIR(x, y, 10, '#ff3050', '#ffd0d8', 1.5); CIR(x - 3, y - 3, 3, '#fff', null); break;
    case 'missile': { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(b.vy, b.vx)); RR(-5, -3, 10, 6, 3, '#d0d0e0'); R(-7, -2, 3, 4, '#ff8030'); R(2, -3, 3, 6, '#c02a4a'); ctx.restore(); break; }
    case 'mine': CIR(x, y, 5, '#3a2a50'); CIR(x, y, 2, t % 20 < 10 ? '#ff3050' : '#ffe040', null); break;
    case 'bomb': CIR(x, y, 4.5, '#2a2a3a'); R(x - 1, y - 7, 2, 3, '#aaa'); break;
    default: CIR(x, y, b.w / 2 + 0.5, '#fff0a0', '#ff4a30', 1.2);
  }
}

// ===== アイテム =====
function drawItem(it) {
  if (!it.placed && it.life > 0 && it.life < 80 && it.life % 6 < 3) return;
  const x = it.x + it.w / 2, y = it.y + it.h / 2, t = it.t;
  switch (it.type) {
    case 'hpS': case 'hpL': case 'wpS': case 'wpL': {
      const big = it.type.endsWith('L'), hp = it.type.startsWith('hp');
      const w = big ? 13 : 7, h = big ? 10 : 7, c = hp ? '#ff4060' : '#30a0ff', c2 = hp ? '#ffe0a0' : '#a0ffff';
      RR(x - w / 2, y - h / 2, w, h, 3, '#fff');
      R(x - w / 2 + 1, y - h / 2 + 1, w / 2 - 1, h - 2, t % 10 < 5 ? c : c2);
      R(x, y - h / 2 + 1, w / 2 - 1, h - 2, t % 10 < 5 ? c2 : c);
      break;
    }
    case 'bolt': case 'bolt5': {
      const r = it.type === 'bolt5' ? 5.5 : 3.6;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 0.08) * 0.5);
      const pts = []; for (let i = 0; i < 6; i++) pts.push(Math.cos(i * Math.PI / 3) * r, Math.sin(i * Math.PI / 3) * r);
      POLY(pts, '#ffcc30'); CIR(0, 0, r * 0.45, '#8a5a10', null); R(-r * 0.2, -r * 0.9, r * 0.4, r * 0.5, '#fff6');
      ctx.restore(); break;
    }
    case 'life': CIR(x, y, 6.5, '#22b8c8'); RR(x - 1, y - 3, 6, 6, 2, '#ffd9bc', null); R(x + 2, y - 1.5, 1.5, 2.4, OUT); POLY([x - 5, y - 4, x + 2, y - 8, x + 5, y - 5], '#fff'); break;
    case 'etank': RR(x - 6, y - 7, 12, 14, 2, '#2a8aff'); R(x - 4, y - 5, 8, 10, '#a0e8ff'); TXT('E', x - 2.6, y - 5, 9, '#1a3a8a', 'left', null); break;
  }
}

// ===== ギミック =====
function drawHazards() {
  for (const h of S.haz) {
    if (h.x < S.camX - 30 || h.x > S.camX + W + 30) continue;
    if (h.type === 'vent' && h.on && h.box) {
      const b = h.box;
      for (let i = 0; i < 4; i++) { const ox = Math.sin(S.t * 0.5 + i * 1.7) * 2; RR(b.x + ox + i * 0.5, b.y + i * 3, b.w - i, b.h - i * 3, 5, i % 2 ? '#ffd040' : '#ff5a10', null); }
      R(b.x + 4, b.y + 4, 4, b.h - 4, '#fff6c0');
    }
    if (h.type === 'icicle' && h.st < 3) {
      const sh = h.st === 1 ? Math.sin(S.t) * 1 : 0;
      POLY([h.x + sh, h.y, h.x + 10 + sh, h.y, h.x + 5 + sh, h.y + 18], '#d8f6ff', '#3a8ad0');
      R(h.x + 3 + sh, h.y + 1, 1.5, 8, '#fff');
    }
    if (h.type === 'beam') {
      RR(h.x - 3, 0, 14, 8, 2, '#5a5a78'); R(h.x, 6, 8, 3, h.on ? '#ffe040' : h.warn && S.t % 6 < 3 ? '#ff4040' : '#2a2a3a');
      RR(h.x - 3, h.y - 6, 14, 6, 2, '#5a5a78');
      if (h.on) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(h.x + 4, 8);
        for (let y = 8; y < h.y - 6; y += 10) ctx.lineTo(h.x + 4 + rnd(-3, 3), y + 10);
        ctx.stroke(); ctx.strokeStyle = '#ffe040aa'; ctx.lineWidth = 6; ctx.stroke();
      } else if (h.warn) { R(h.x + 3, 8, 2, h.y - 14, 'rgba(255,240,100,.25)'); }
    }
  }
}
function drawMovers() {
  for (const m of S.movers) {
    if (m.st === 3) continue;
    if (m.x + m.w < S.camX - 10 || m.x > S.camX + W + 10) continue;
    const sh = m.st === 1 ? Math.sin(S.t * 1.5) : 0;
    const th = S.th;
    if (th.style === 'cloud' || m.type === 'fall') {
      if (th.style === 'cloud') { for (let i = 0; i < 4; i++) CIR(m.x + 5 + i * 7.3 + sh, m.y + 4, 5, '#fff', null); R(m.x + 2 + sh, m.y + 4, m.w - 4, 5, '#e0e8f4'); }
      else { RR(m.x + sh, m.y, m.w, m.h, 2, th.hi, th.lo); R(m.x + 2 + sh, m.y + 2, m.w - 4, 1, '#fff6'); R(m.x + 6 + sh, m.y + m.h, 4, 3, th.lo); R(m.x + m.w - 10 + sh, m.y + m.h, 4, 3, th.lo); }
    } else {
      RR(m.x, m.y, m.w, m.h, 2, '#8a90a8', OUT); R(m.x + 2, m.y + 1, m.w - 4, 1.5, '#d8dcef');
      R(m.x + 4, m.y + m.h, 6, 3, '#ff6a30'); R(m.x + m.w - 10, m.y + m.h, 6, 3, '#ff6a30');
      if (S.t % 4 < 2) { R(m.x + 5, m.y + m.h + 3, 4, 3, '#ffd040'); R(m.x + m.w - 9, m.y + m.h + 3, 4, 3, '#ffd040'); }
    }
  }
}
function drawParts() {
  for (const p of S.parts) {
    const a = clamp(p.life / p.max, 0, 1);
    ctx.globalAlpha = a;
    if (p.kind === 'streak') R(p.x, p.y, 14, 1, p.c);
    else R(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s, p.c);
  }
  ctx.globalAlpha = 1;
  for (const f of S.fx) {
    if (f.kind === 'boom') {
      const k = 1 - f.life / f.max;
      CIR(f.x, f.y, f.r * (0.4 + k), k < 0.5 ? '#fff6c0' : '#ff8a30', null);
      CIR(f.x, f.y, f.r * (0.2 + k * 0.8), k < 0.3 ? '#fff' : '#ffd040', null);
    } else if (f.kind === 'orb') {
      const s = (f.life >> 2) % 2;
      CIR(f.x, f.y, 5, s ? '#fff' : f.c, null); CIR(f.x, f.y, 2.5, s ? f.c : '#fff', null);
    }
  }
}

// ===== HUD =====
function bar(x, y, val, c1, c2) {
  R(x - 1, y - 1, 9, 60, OUT);
  R(x, y, 7, 58, '#1a1a2a');
  for (let i = 0; i < 28; i++) {
    const yy = y + 56 - i * 2;
    if (i < val) { R(x + 1, yy, 5, 1.4, c1); R(x + 2.5, yy, 2, 1.4, c2); }
  }
}
function drawHUD() {
  bar(12, 12, P.hp, '#ffe060', '#fffbe0');
  if (P.weapon) { const w = WEAPONS[P.weapon]; bar(23, 12, G.energy[P.weapon], w.a, w.b); }
  if (S.boss && S.boss.st !== 'enter' && S.boss.st !== 'gone') bar(W - 21, 12, S.boss.hp * 28 / S.boss.maxHp, '#ff5a5a', '#ffd0d0');
  // ボルト・残機
  const bx = S.boss ? W - 80 : W - 58;
  ctx.save(); ctx.translate(bx, 16);
  const pts = []; for (let i = 0; i < 6; i++) pts.push(Math.cos(i * Math.PI / 3) * 4, Math.sin(i * Math.PI / 3) * 4);
  POLY(pts, '#ffcc30'); CIR(0, 0, 1.6, '#8a5a10', null);
  ctx.restore();
  TXT(String(G.save.bolts).padStart(4, '0'), bx + 7, 11, 9, '#fff');
  CIR(bx + 1, 32, 4.5, '#22b8c8'); R(bx + 1, 30, 4, 4, '#ffd9bc');
  TXT('×' + Math.max(0, G.lives), bx + 7, 27, 9, '#fff');
  if (S.weaponFlash > 0) {
    const w = WEAPONS[P.weapon];
    RR(W / 2 - 60, 14, 120, 16, 3, 'rgba(0,0,20,.7)', w.a, 1);
    TXT(w.name, W / 2, 17, 10, w.b, 'center');
  }
}
