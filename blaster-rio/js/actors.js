'use strict';
// ===== プレイヤー =====
const PH = 22, PH_SLIDE = 12, PW = 14;
let P = null;
function newPlayer(x, y) {
  return {
    x: x - PW / 2, y: y - PH, w: PW, h: PH, vx: 0, vy: 0, facing: 1, onGround: false, ladder: false,
    slideT: 0, hurtT: 0, invT: 0, stunT: 0, shootT: 0, charge: 0, anim: 0, dead: false, deadT: 0,
    hp: 28, hpShow: 0, hpQueue: 0, weapon: 0, mover: null, jumpHeld: false, warp: 'in', warpY: -40, landT: 0,
    leaves: null, auto: 0, frozen: false, wfrac: 0, lift: 0,
  };
}
const cx = a => a.x + a.w / 2, cy = a => a.y + a.h / 2;

function hasUp(k) { return (G.save.up[k] || 0) > 0; }
function canStand() {
  // スライディング中に頭上が空いているか
  const ny = P.y + P.h - PH;
  return !rectHitsTile(P.x, ny, P.w, PH - P.h + 1, t => solidT(t));
}
function endSlide() {
  if (P.slideT <= 0 && P.h === PH) return;
  P.slideT = 0;
  if (P.h !== PH) { P.y -= PH - P.h; P.h = PH; }
}
function hurtPlayer(d, src) {
  if (P.dead || P.invT > 0 || S.phase === 'victory' || DEBUG && QS.has('god')) return;
  if (hasUp('armor')) d = Math.max(1, Math.round(d * 0.7));
  P.hp -= d; SFX.hurt();
  P.ladder = false; endSlide();
  if (P.hp <= 0) { P.hp = 0; killPlayer(); return; }
  P.hurtT = 22; P.invT = 70; P.charge = 0;
  P.facing = src !== undefined ? (src < cx(P) ? -1 : 1) : P.facing;
  P.vy = Math.min(P.vy, 0);
  for (let i = 0; i < 4; i++) addPart({ x: cx(P), y: cy(P), vx: rnd(-1.5, 1.5), vy: rnd(-1.5, 1.5), life: 14, c: '#fff', s: 2 });
}
function killPlayer(fall) {
  if (P.dead) return;
  P.dead = true; P.deadT = 0; P.hp = 0; P.charge = 0; P.leaves = null;
  Music.stop();
  if (fall) SFX.fall(); else {
    SFX.death();
    for (let ring = 0; ring < 2; ring++) for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4, sp = ring ? 1.2 : 2.4;
      S.fx.push({ kind: 'orb', x: cx(P), y: cy(P), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 160, c: WEAPONS[P.weapon].a });
    }
  }
}

function updatePlayer() {
  const p = P, e = stageEnv();
  p.anim++;
  if (p.dead) { p.deadT++; return; }
  if (p.invT > 0) p.invT--;
  if (p.shootT > 0) p.shootT--;
  if (p.landT > 0) p.landT--;
  const auto = S.phase !== 'play' && S.phase !== 'boss';
  const I = auto ? { held: {}, pressed: {}, released: {} } : Input;
  const L = I.held.left, Rr = I.held.right, U = I.held.up, D = I.held.down;
  const dir = auto ? (p.auto || 0) : (Rr ? 1 : 0) - (L ? 1 : 0);
  const ice = S.th.ice && p.onGround;

  // 移動床の追従
  if (p.mover) {
    const m = p.mover;
    moveX(p, m.dx);
    if (m.st !== 3) p.y = m.y - p.h;
  }

  // 武器切り替え
  if (!auto && G.weapons().length > 1 && (I.pressed.prev || I.pressed.next)) {
    const list = G.weapons();
    let i = list.indexOf(p.weapon);
    i = (i + (I.pressed.next ? 1 : -1) + list.length) % list.length;
    setWeapon(list[i]);
  }

  if (p.stunT > 0) {
    p.stunT--; p.vx = 0;
  } else if (p.hurtT > 0) {
    p.hurtT--; p.vx = -p.facing * 0.55;
    if (p.slideT) endSlide();
  } else if (p.ladder) {
    // はしご
    p.vx = 0; p.vy = 0;
    if (dir) p.facing = dir;
    if (p.shootT <= 0) p.vy = (D ? CLIMB : 0) - (U ? CLIMB : 0);
    if (I.pressed.jump) { p.ladder = false; p.vy = 0; }
  } else {
    // スライディング開始
    if (p.onGround && !p.slideT && (I.pressed.slide || (D && I.pressed.jump))) {
      p.slideT = 26; p.y += PH - PH_SLIDE; p.h = PH_SLIDE; p.charge = Math.min(p.charge, p.charge);
      if (dir) p.facing = dir;
      for (let i = 0; i < 3; i++) addPart({ x: cx(p) - p.facing * 6, y: p.y + p.h - 2, vx: -p.facing * rnd(0.3, 1), vy: rnd(-0.6, 0), life: 18, c: '#fff8', s: 3 });
    }
    if (p.slideT > 0) {
      p.vx = p.facing * 2.6;
      p.slideT--;
      if (dir === -p.facing) { p.facing = dir; p.slideT = Math.max(p.slideT, 0); if (canStand()) endSlide(); }
      if (I.pressed.jump && !D && canStand()) { endSlide(); p.vy = e.jv; p.onGround = false; p.jumpHeld = true; }
      else if (p.slideT === 0) { if (canStand()) endSlide(); else p.slideT = 1; }
      if (!p.onGround && p.slideT && canStand()) endSlide();
    } else {
      if (ice) {
        if (dir) p.vx = clamp(p.vx + dir * 0.09, -WALK, WALK); else p.vx *= 0.965;
        if (Math.abs(p.vx) < 0.05) p.vx = 0;
      } else p.vx = dir * WALK;
      if (dir) p.facing = dir;
      if (I.pressed.jump && p.onGround && !D) { p.vy = e.jv; p.onGround = false; p.jumpHeld = true; }
    }
    if (p.jumpHeld && !I.held.jump && p.vy < 0) { p.vy = 0; p.jumpHeld = false; }
    if (p.vy >= 0) p.jumpHeld = false;
    // はしごにつかまる
    const ccol = Math.floor(cx(p) / TS);
    if (U && !p.slideT) {
      const r1 = Math.floor((p.y + p.h * 0.5) / TS), r2 = Math.floor((p.y + p.h - 2) / TS);
      if (tAt(ccol, r1) === T.LAD || tAt(ccol, r2) === T.LAD) grabLadder(ccol);
    }
    if (D && p.onGround && !p.slideT && !I.pressed.jump) {
      const rb = Math.floor((p.y + p.h + 1) / TS);
      if (tAt(ccol, rb) === T.LAD) { grabLadder(ccol); p.y += 7; }
    }
  }

  // 重力
  if (!p.ladder) {
    p.vy = Math.min(p.vy + e.g, e.mf);
    if (p.lift > 0) { p.lift--; p.vy = Math.min(p.vy, -3.2); }
  }
  // 風
  let wx = 0;
  if (!p.ladder) for (const z of S.zones) if (z.type === 'wind' && cx(p) > z.x0 && cx(p) < z.x1 && z.on) wx = -0.85;
  if (S.wind) wx += S.wind;

  moveX(p, p.vx + wx);
  const wasGround = p.onGround;
  p.onGround = false; p.mover = null;
  const prevB = p.y + p.h;
  if (p.ladder) {
    const hit = moveY(p, p.vy, false);
    ladderCheck(prevB);
    if (hit === 1) { p.ladder = false; p.onGround = true; }
  } else {
    const hit = moveY(p, p.vy);
    if (hit === 1) { p.vy = 0; p.onGround = true; }
    if (hit === -1) { p.vy = 0; p.jumpHeld = false; }
    // 移動床
    if (p.vy >= 0) for (const m of S.movers) {
      if (m.st === 3) continue;
      if (p.x + p.w > m.x + 1 && p.x < m.x + m.w - 1 && prevB <= m.y + 1.5 && p.y + p.h >= m.y) {
        p.y = m.y - p.h; p.vy = 0; p.onGround = true; p.mover = m;
        if (m.type === 'fall' && m.st === 0) { m.st = 1; m.t = 0; }
      }
    }
  }
  if (p.onGround && !wasGround && !p.ladder) { SFX.land(); p.landT = 6; }

  // 射撃
  if (!auto && p.hurtT <= 0 && p.stunT <= 0) handleShoot(I);
  if (p.leaves) updateLeaves();

  // トゲ・溶岩・落下
  const hz = rectHitsTile(p.x + 2, p.y + 2, p.w - 4, p.h - 2, t => t === T.SPIKE || t === T.LAVA);
  if (hz) {
    if (hasUp('guard') && tAt(hz.c, hz.r) === T.SPIKE) { if (p.invT <= 0) { hurtPlayer(8); p.vy = -4; } }
    else if (p.invT <= 0 || tAt(hz.c, hz.r) === T.LAVA) killPlayer();
  }
  if (p.y > H + 24) killPlayer(true);
  if (p.x < 0) p.x = 0;
  // 回復キュー（MM のように少しずつ増える）
  if (p.hpQueue > 0 && S.t % 3 === 0) { p.hpQueue--; if (p.hp < 28) { p.hp++; SFX.hpFill(); } else p.hpQueue = 0; }
}
const WALK = 1.4, CLIMB = 1.3;
function grabLadder(col) {
  const p = P; endSlide();
  p.ladder = true; p.x = col * TS + TS / 2 - p.w / 2; p.vx = 0; p.vy = 0; p.charge = Math.min(p.charge, 0);
}
function ladderCheck() {
  const p = P, col = Math.floor(cx(p) / TS);
  const rc = Math.floor((p.y + p.h * 0.45) / TS), rf = Math.floor((p.y + p.h - 1) / TS);
  if (p.vy < 0 && tAt(col, rc) !== T.LAD) {
    // てっぺんまで のぼった
    let r = rf; while (r < ROWS && tAt(col, r) !== T.LAD) r++;
    if (tAt(col, r) === T.LAD && tAt(col, r - 1) !== T.LAD) { p.y = r * TS - p.h; p.ladder = false; p.onGround = true; return; }
  }
  if (tAt(col, rc) !== T.LAD && tAt(col, rf) !== T.LAD) p.ladder = false;
}

// ===== 武器 =====
function setWeapon(i) {
  if (P.weapon === i) return;
  P.weapon = i; P.charge = 0; P.leaves = null; SFX.menu();
  S.weaponFlash = 50;
}
function energyOf(i) { return i === 0 ? 28 : G.energy[i]; }
function spend(i) {
  if (G.energy[i] <= 0) return false;
  let c = WEAPONS[i].cost;
  if (hasUp('saver')) { P.wfrac += c / 2; c = Math.floor(P.wfrac); P.wfrac -= c; }
  G.energy[i] = Math.max(0, G.energy[i] - c);
  return true;
}
const countPB = k => S.pb.filter(b => b.k === k).length;
function shotOrigin() {
  const p = P;
  return { x: cx(p) + p.facing * 11, y: p.ladder ? p.y + 9 : p.y + 11 };
}
function handleShoot(I) {
  const p = P, w = p.weapon;
  const q = hasUp('quick');
  const c1 = q ? 22 : 34, c2 = q ? 55 : 80;
  if (p.slideT > 0) { if (I.held.shoot && w === 0) p.charge++; return; }
  if (I.pressed.shoot) fireWeapon(w, 0);
  if (w === 0) {
    if (I.held.shoot) {
      p.charge++;
      if (p.charge === c1) SFX.chargeTick(1);
      if (p.charge > c1 && p.charge % (p.charge > c2 ? 8 : 14) === 0) SFX.chargeTick(p.charge > c2 ? 2 : 1);
    }
    if (I.released.shoot || (!I.held.shoot && p.charge > 0)) {
      if (p.charge >= c2) fireWeapon(0, 2); else if (p.charge >= c1) fireWeapon(0, 1);
      p.charge = 0;
    }
  }
  p.chargeLv = p.charge >= c2 ? 2 : p.charge >= c1 ? 1 : 0;
}
function pb(o) { const b = Object.assign({ w: 6, h: 6, vx: 0, vy: 0, life: 120, dmg: 1, pierce: false, hits: new Set(), t: 0 }, o); b.x -= b.w / 2; b.y -= b.h / 2; S.pb.push(b); return b; }
function fireWeapon(w, lv) {
  const p = P, o = shotOrigin(), f = p.facing;
  const pose = () => { p.shootT = 16; };
  if (w === 0) {
    if (lv === 0) { if (countPB('buster') >= 3) return; pb({ k: 'buster', x: o.x, y: o.y, w: 7, h: 5, vx: f * 5, dmg: 1 }); SFX.shoot(); }
    else if (lv === 1) { pb({ k: 'half', x: o.x, y: o.y, w: 12, h: 10, vx: f * 5, dmg: 2 }); SFX.half(); }
    else { pb({ k: 'full', x: o.x + f * 4, y: o.y, w: 24, h: 18, vx: f * 5.5, dmg: 3, pierce: true }); SFX.full(); }
    pose(); return;
  }
  if (G.energy[w] <= 0) { SFX.deny(); return; }
  switch (w) {
    case 1: if (countPB('flare')) return; if (!spend(w)) return; pb({ k: 'flare', x: o.x, y: p.y + p.h - 8, w: 14, h: 16, vx: f * 3, dmg: 2, pierce: true, life: 80 }); SFX.fire(); break;
    case 2: if (countPB('bubble') >= 2) return; if (!spend(w)) return; pb({ k: 'bubble', x: o.x, y: o.y, w: 10, h: 10, vx: f * 2.2, dmg: 2, life: 150 }); SFX.bubble(); break;
    case 3: if (countPB('volt')) return; if (!spend(w)) return; for (const a of [-0.45, 0, 0.45]) pb({ k: 'volt', x: o.x, y: o.y, w: 8, h: 8, vx: Math.cos(a) * 4.2 * f, vy: Math.sin(a) * 4.2, dmg: 2 }); SFX.zap(); break;
    case 4: if (countPB('ice') >= 2) return; if (!spend(w)) return; pb({ k: 'ice', x: o.x, y: o.y, w: 18, h: 5, vx: f * 6, dmg: 2, pierce: true }); SFX.ice(); break;
    case 5: if (countPB('rock')) return; if (!spend(w)) return; pb({ k: 'rock', x: o.x, y: o.y - 2, w: 12, h: 12, vx: f * 2.6, vy: -3.6, dmg: 3, life: 140, bounce: 2 }); SFX.rock(); break;
    case 6: if (countPB('cyclone')) return; if (!spend(w)) return; pb({ k: 'cyclone', x: o.x + f * 8, y: p.y + p.h - 18, w: 20, h: 36, vx: f * 1.3, dmg: 2, pierce: true, life: 110 }); SFX.wind(); break;
    case 7: if (S.flash > 0) return; if (!spend(w)) return; starNova(); break;
    case 8:
      if (p.leaves) { // 投げる
        pb({ k: 'leaf', x: cx(p), y: cy(p), w: 30, h: 30, vx: f * 4, dmg: 2, pierce: true, life: 90 }); p.leaves = null; SFX.leaf();
      } else { if (!spend(w)) return; p.leaves = { a: 0, t: 0 }; SFX.leaf(); }
      break;
  }
  pose();
}
function updateLeaves() {
  const l = P.leaves; l.a += 0.18; l.t++;
  const box = { x: cx(P) - 20, y: cy(P) - 20, w: 40, h: 40 };
  for (const b of S.eb) if (!b.big && overlap(box, b)) { b.dead = true; addPart({ x: b.x, y: b.y, life: 10, c: '#c8f070', s: 3 }); }
  for (const en of S.enemies) if (overlap(box, en) && !(en.inv > 0)) damageEnemy(en, 1, 8, null);
  if (S.boss && S.boss.st === 'fight' && overlap(box, S.boss)) { if (damageBoss(S.boss, 8, { dmg: 2 }) === 'hit') P.leaves = null; }
}
function starNova() {
  S.flash = 40; SFX.nova(); S.shake = 12;
  for (const b of S.eb) b.dead = true;
  for (const en of S.enemies) if (en.x > S.camX - 8 && en.x < S.camX + W + 8) damageEnemy(en, 4, 7, null, true);
  if (S.boss && S.boss.st === 'fight') damageBoss(S.boss, 7, { dmg: 1 }, true);
}
function updatePB() {
  for (const b of S.pb) {
    b.t++; b.life--;
    switch (b.k) {
      case 'flare': {
        b.vy = Math.min((b.vy || 0) + 0.4, 6);
        moveY(b, b.vy) === 1 && (b.vy = 0);
        if (moveX(b, b.vx)) b.dead = true;
        if (b.t % 3 === 0) addPart({ x: b.x + rnd(b.w), y: b.y + rnd(b.h), vx: 0, vy: -1, life: 16, c: pick(['#ffd23a', '#ff5a1f']), s: 3 });
        break;
      }
      case 'bubble': {
        const tg = nearestTarget(b, 180);
        if (tg) { const dx = cx(tg) - cx(b), dy = cy(tg) - cy(b), d = Math.hypot(dx, dy) || 1; b.vx = lerp(b.vx, dx / d * 2.6, 0.08); b.vy = lerp(b.vy, dy / d * 2.6, 0.08); }
        else b.vy = lerp(b.vy, -0.3, 0.05);
        b.x += b.vx; b.y += b.vy + Math.sin(b.t * 0.2) * 0.3;
        break;
      }
      case 'rock': {
        b.vy += 0.22; b.x += b.vx;
        const hx = rectHitsTile(b.x, b.y, b.w, b.h, t => solidT(t));
        if (hx) {
          if (tAt(hx.c, hx.r) === T.BRK) { damageBrk(hx.c, hx.r, 9); b.dead = true; break; }
          b.x -= b.vx; b.vx = -b.vx * 0.8;
        }
        if (moveY(b, b.vy) === 1) { if (b.bounce-- > 0) { b.vy = -3.2; SFX.rock(); } else b.dead = true; }
        break;
      }
      case 'cyclone': {
        b.x += b.vx; b.y -= 0.15;
        if (overlap(b, P) && !P.ladder) { P.lift = 4; P.onGround = false; }
        break;
      }
      default: b.x += b.vx; b.y += b.vy;
    }
    if (b.k === 'buster' || b.k === 'half' || b.k === 'full') {
      const hb = rectHitsTile(b.x, b.y, b.w, b.h, t => t === T.BRK);
      if (hb) { damageBrk(hb.c, hb.r, b.k === 'full' ? 9 : b.dmg); if (b.k !== 'full') b.dead = true; }
    }
    if (b.life <= 0 || b.x < S.camX - 40 || b.x > S.camX + W + 40 || b.y < -60 || b.y > H + 30) b.dead = true;
  }
  S.pb = S.pb.filter(b => !b.dead);
}
function nearestTarget(b, range) {
  let best = null, bd = range;
  const cands = S.enemies.slice(); if (S.boss && S.boss.st === 'fight') cands.push(S.boss);
  for (const e of cands) { const d = Math.hypot(cx(e) - cx(b), cy(e) - cy(b)); if (d < bd) { bd = d; best = e; } }
  return best;
}

// ===== 敵 =====
const ENEMY = {
  shell: { w: 16, h: 14, hp: 1 },
  walker: { w: 16, h: 20, hp: 3 },
  flyer: { w: 16, h: 12, hp: 1, fly: true },
  hopper: { w: 16, h: 16, hp: 2 },
  turret: { w: 16, h: 18, hp: 3 },
  bomber: { w: 22, h: 12, hp: 2, fly: true },
  big: { w: 30, h: 34, hp: 12 },
};
function spawnEnemy(s) {
  const d = ENEMY[s.type];
  const e = { type: s.type, x: s.x - d.w / 2, y: s.y - d.h, w: d.w, h: d.h, hp: d.hp, vx: 0, vy: 0, t: 0, st: 0, facing: P && cx(P) < s.x ? -1 : 1, spawn: s, flash: 0, frozen: 0, inv: 0, onGround: false };
  if (d.fly) { e.y = s.y - 70 - (s.x % 3) * 8; e.baseY = e.y; }
  S.enemies.push(e);
}
function eb(o) { const b = Object.assign({ w: 6, h: 6, vx: 0, vy: 0, life: 240, dmg: 3, g: 0, t: 0 }, o); b.x -= b.w / 2; b.y -= b.h / 2; S.eb.push(b); return b; }
function aim(fromX, fromY, sp, off = 0) { const a = Math.atan2(cy(P) - fromY, cx(P) - fromX) + off; return { vx: Math.cos(a) * sp, vy: Math.sin(a) * sp }; }
function updateEnemies() {
  const e0 = stageEnv();
  for (const e of S.enemies) {
    if (e.flash > 0) e.flash--;
    if (e.inv > 0) e.inv--;
    if (e.frozen > 0) { e.frozen--; continue; }
    e.t++;
    const px = cx(P), dx = px - cx(e), adx = Math.abs(dx);
    const fly = ENEMY[e.type].fly;
    switch (e.type) {
      case 'shell':
        // 0: かくれる 1: ひらく 2: うつ 3: とじる
        if (e.st === 0) { if (adx < 110 && e.t > 50) { e.st = 1; e.t = 0; } }
        else if (e.st === 1) { if (e.t > 14) { e.st = 2; e.t = 0; e.facing = sign(dx); for (const a of [-0.35, 0, 0.35]) eb({ x: cx(e), y: e.y + 6, vx: Math.cos(a) * 2.2 * e.facing, vy: Math.sin(a) * 2.2, dmg: 2 }); SFX.enemyShot(); } }
        else if (e.st === 2) { if (e.t > 40) { e.st = 0; e.t = 0; } }
        break;
      case 'walker':
        e.vx = e.facing * 0.6;
        if (e.t % 120 === 60 && adx < 150) { e.facing = sign(dx); eb({ x: cx(e) + e.facing * 8, y: e.y + 8, vx: e.facing * 2.4, dmg: 2 }); SFX.enemyShot(); }
        break;
      case 'flyer': {
        e.facing = sign(dx);
        e.x += e.facing * 0.9;
        const ty = cy(P) - 16;
        e.baseY = lerp(e.baseY, ty, 0.012);
        e.y = e.baseY + Math.sin(e.t * 0.08) * 12;
        break;
      }
      case 'hopper':
        if (e.onGround) { e.vx = 0; if (e.t > 40) { e.t = 0; e.facing = sign(dx); e.vy = e0.jv * 0.9; e.vx = e.facing * clamp(adx / 40, 0.6, 1.6); } }
        break;
      case 'turret':
        e.facing = sign(dx);
        if (e.t % 100 === 50 && adx < 180) { const v = aim(cx(e), e.y + 6, 2.4); eb({ x: cx(e) + e.facing * 8, y: e.y + 6, ...v, dmg: 3 }); SFX.enemyShot(); }
        break;
      case 'bomber':
        e.facing = sign(dx);
        e.x += clamp(dx * 0.02, -1.2, 1.2);
        e.y = e.baseY + Math.sin(e.t * 0.05) * 6;
        if (e.t % 90 === 0 && adx < 30) { eb({ x: cx(e), y: e.y + e.h, vy: 0, g: e0.g * 0.7, dmg: 3, kind: 'bomb', w: 8, h: 8 }); }
        break;
      case 'big':
        if (e.onGround) {
          e.vx = e.facing * 0.4;
          if (e.t % 150 === 100) { e.vy = e0.jv * 0.8; e.facing = sign(dx); }
          if (e.t % 150 === 30) { e.facing = sign(dx); for (const a of [-0.3, 0, 0.3]) eb({ x: cx(e) + e.facing * 14, y: e.y + 12, vx: Math.cos(a) * 2.6 * e.facing, vy: Math.sin(a) * 2.6, dmg: 3, w: 8, h: 8 }); SFX.enemyShot(); }
        }
        break;
    }
    if (!fly) {
      e.vy = Math.min(e.vy + e0.g, e0.mf);
      const was = e.onGround;
      if (moveX(e, e.vx) && e.type === 'walker') e.facing *= -1;
      e.onGround = moveY(e, e.vy) === 1;
      if (e.onGround) e.vy = 0;
      // がけで ひきかえす
      if (e.type === 'walker' || e.type === 'big') {
        const fx = e.facing > 0 ? e.x + e.w + 1 : e.x - 1;
        if (e.onGround && !solidT(tAtPx(fx, e.y + e.h + 2)) && tAtPx(fx, e.y + e.h + 2) !== T.ONE) e.facing *= -1;
      }
      if (!was && e.onGround && e.type === 'hopper') e.t = 0;
    }
    if (overlap(e, P) && !P.dead) hurtPlayer(e.type === 'big' ? 5 : 3, cx(e));
    if (e.y > H + 20) e.dead = true;
  }
  S.enemies = S.enemies.filter(e => {
    if (e.dead) return false;
    if (e.x < S.camX - 80 || e.x > S.camX + W + 80) { e.spawn.state = 'idle'; return false; }
    return true;
  });
}
function shellClosed(e) { return e.type === 'shell' && e.st === 0; }
function damageEnemy(e, dmg, w, b, ignoreShell) {
  if (e.inv > 0) return false;
  if (shellClosed(e) && !ignoreShell && w !== 5 && w !== 7) {
    if (b && !b.reflected) { b.reflected = true; b.vx = -b.vx * 0.8; b.vy = -3; b.pierce = true; b.dmg = 0; SFX.tink(); }
    return false;
  }
  if (w === 4 && e.type !== 'big') { e.frozen = 150; }
  e.hp -= dmg; e.flash = 6; e.inv = b && b.pierce ? 8 : 0;
  if (e.hp <= 0) {
    e.dead = true; e.spawn.state = 'dead';
    explodeAt(cx(e), cy(e), e.type === 'big');
    dropItem(cx(e), cy(e), e.type === 'big');
  } else SFX.hit();
  return true;
}
function explodeAt(x, y, big) {
  SFX.explode();
  S.fx.push({ kind: 'boom', x, y, life: big ? 28 : 18, max: big ? 28 : 18, r: big ? 22 : 12 });
  for (let i = 0; i < (big ? 10 : 5); i++) addPart({ x, y, vx: rnd(-2, 2), vy: rnd(-2.5, 0.5), g: 0.1, life: 24, c: pick(['#ffd040', '#ff7020', '#fff']), s: 2 });
}

// ===== アイテム =====
const ITEM = {
  hpS: { w: 8, h: 8 }, hpL: { w: 14, h: 12 }, wpS: { w: 8, h: 8 }, wpL: { w: 14, h: 12 },
  life: { w: 14, h: 14 }, bolt: { w: 8, h: 8 }, bolt5: { w: 12, h: 12 }, etank: { w: 14, h: 14 },
};
function addItem(type, x, y, life = 400, placed = null) {
  const d = ITEM[type];
  const it = { type, x: x - d.w / 2, y: y - d.h, w: d.w, h: d.h, vy: placed ? 0 : -2.5, life, placed, t: 0 };
  S.items.push(it); return it;
}
function dropItem(x, y, big) {
  const r = Math.random();
  const tbl = big
    ? [['hpL', 0.3], ['wpL', 0.2], ['bolt5', 0.3], ['life', 0.05]]
    : [['bolt', 0.18], ['hpS', 0.12], ['wpS', 0.1], ['hpL', 0.04], ['wpL', 0.03], ['bolt5', 0.03], ['life', 0.008]];
  let acc = 0;
  for (const [k, p] of tbl) { acc += p; if (r < acc) { addItem(k, x, y); return; } }
}
function updateItems() {
  const e = stageEnv();
  for (const it of S.items) {
    it.t++;
    if (it.life > 0 && !it.placed) { it.life--; if (it.life <= 0) it.dead = true; }
    if (hasUp('magnet') && (it.type === 'bolt' || it.type === 'bolt5')) {
      const dx = cx(P) - cx(it), dy = cy(P) - cy(it);
      if (Math.hypot(dx, dy) < 90) { it.x += sign(dx) * 1.6; it.y += sign(dy) * 1.6; it.vy = 0; it.mag = true; }
    }
    if (!it.mag) { it.vy = Math.min(it.vy + e.g, 4); if (moveY(it, it.vy) === 1) it.vy = 0; }
    if (!P.dead && overlap(it, P)) { collect(it); it.dead = true; }
    if (it.y > H + 20) it.dead = true;
  }
  S.items = S.items.filter(i => !i.dead);
}
function collect(it) {
  if (it.placed) it.placed.got = true;
  const s = G.save;
  switch (it.type) {
    case 'hpS': P.hpQueue += 2; break;
    case 'hpL': P.hpQueue += 10; break;
    case 'wpS': case 'wpL': {
      const n = it.type === 'wpS' ? 2 : 10;
      let w = P.weapon;
      if (w === 0 || G.energy[w] >= 28) { // いちばん へっている 武器へ
        let low = 0, lv = 29; for (const i of G.weapons()) if (i && G.energy[i] < lv) { lv = G.energy[i]; low = i; }
        w = low;
      }
      if (w) { G.energy[w] = Math.min(28, G.energy[w] + n); SFX.energy(); }
      break;
    }
    case 'life': G.lives = Math.min(9, G.lives + 1); SFX.oneup(); return;
    case 'bolt': s.bolts = Math.min(9999, s.bolts + 2); SFX.bolt(); return;
    case 'bolt5': s.bolts = Math.min(9999, s.bolts + 10); SFX.bolt(); return;
    case 'etank': s.up.etank = Math.min(4, (s.up.etank || 0) + 1); if (it.placed) s.taken[S.id + ':' + it.placed.id] = true; SFX.oneup(); return;
  }
  SFX.item();
}

// ===== ギミック =====
function updateHazards() {
  const e = stageEnv();
  for (const h of S.haz) {
    h.t++;
    const on = h.x > S.camX - 40 && h.x < S.camX + W + 40;
    switch (h.type) {
      case 'vent': {
        const c = h.t % 160;
        h.on = c > 70 && c < 130;
        h.warn = c > 40 && c <= 70;
        if (h.on && on && c === 71) SFX.fire();
        if (h.on) {
          const hh = Math.min(80, (c - 70) * 6);
          h.box = { x: h.x + 2, y: h.y - hh, w: 12, h: hh };
          if (overlap(h.box, P)) hurtPlayer(4, h.x + 8);
          if (S.t % 3 === 0) addPart({ x: h.x + rnd(4, 12), y: h.y - rnd(hh), vx: rnd(-0.3, 0.3), vy: -1.5, life: 14, c: pick(['#ffd23a', '#ff5a1f', '#fff0a0']), s: 3 });
        }
        if (h.warn && S.t % 5 === 0) addPart({ x: h.x + rnd(4, 12), y: h.y - 2, vx: 0, vy: -0.6, life: 20, c: '#7a6a6a', s: 2 });
        break;
      }
      case 'icicle': {
        if (h.st === 0) { if (Math.abs(cx(P) - (h.x + 5)) < 34 && P.y > h.y) { h.st = 1; h.t = 0; } }
        else if (h.st === 1) { if (h.t > 18) { h.st = 2; h.vy = 0; } }
        else if (h.st === 2) {
          h.vy = Math.min((h.vy || 0) + e.g, 6); h.y += h.vy;
          const box = { x: h.x, y: h.y, w: 10, h: 18 };
          if (overlap(box, P)) { hurtPlayer(4, h.x); h.st = 3; }
          if (solidT(tAtPx(h.x + 5, h.y + 18)) || h.y > H) { h.st = 3; SFX.ice(); for (let i = 0; i < 6; i++) addPart({ x: h.x + 5, y: h.y + 16, vx: rnd(-1.5, 1.5), vy: rnd(-2, 0), g: 0.15, life: 20, c: '#e0f8ff', s: 2 }); }
        } else if (h.st === 3 && !on) { h.st = 0; h.y = h.hy; }
        break;
      }
      case 'beam': {
        const c = h.t % 200;
        h.on = c >= 120; h.warn = c >= 80 && c < 120;
        if (h.on && c === 120 && on) SFX.zap();
        if (h.on && overlap({ x: h.x, y: 0, w: 8, h: h.y }, P)) hurtPlayer(4, h.x + 4);
        break;
      }
    }
  }
  S.wind = S.windDir ? S.windDir * 0.95 : 0;
  for (const z of S.zones) {
    z.t++;
    const inZ = cx(P) > z.x0 - 80 && cx(P) < z.x1 + 80;
    if (z.type === 'wind') {
      z.on = z.t % 260 < 170;
      if (z.on && inZ && S.t % 3 === 0) addPart({ kind: 'streak', x: S.camX + W + 4, y: rnd(10, H - 30), vx: -6, vy: 0, life: 60, c: '#ffffffaa', s: 1 });
      if (z.on && z.t % 260 === 1 && inZ) SFX.wind();
    }
    if (z.type === 'rocks' && cx(P) > z.x0 - 40 && cx(P) < z.x1) {
      if (z.t % 55 === 0) {
        const x = clamp(cx(P) + rnd(-60, 90), z.x0, z.x1);
        eb({ kind: 'rock', x, y: -10, w: 12, h: 12, vy: 0, g: 0.18, dmg: 4, life: 200, shatter: true });
      }
    }
  }
}
function updateMovers() {
  for (const m of S.movers) {
    const ox = m.x, oy = m.y;
    if (m.type === 'h') {
      m.x += m.v * m.dir;
      if (m.x >= m.x1) { m.x = m.x1; m.dir = -1; }
      if (m.x <= m.x0) { m.x = m.x0; m.dir = 1; }
    } else if (m.type === 'fall') {
      if (m.st === 1) { m.t++; if (m.t > 22) { m.st = 2; m.vy = 0; } }
      else if (m.st === 2) { m.vy = Math.min(m.vy + 0.2, 5); m.y += m.vy; if (m.y > H + 10) { m.st = 3; m.t = 0; } }
      else if (m.st === 3) { m.t++; if (m.t > 150 && (m.x + m.w < S.camX || m.x > S.camX + W || m.t > 260)) { m.st = 0; m.y = m.y0; } }
    }
    m.dx = m.x - ox; m.dy = m.y - oy;
  }
}
function updateEB() {
  for (const b of S.eb) {
    b.t++; b.life--;
    if (b.homing) { const v = aim(cx(b), cy(b), b.sp); b.vx = lerp(b.vx, v.vx, b.homing); b.vy = lerp(b.vy, v.vy, b.homing); }
    if (b.g) b.vy += b.g;
    if (b.ground) {
      // 床を はう
      b.x += b.vx;
      if (solidT(tAtPx(b.vx > 0 ? b.x + b.w : b.x, b.y + b.h - 2))) b.dead = true;
    } else { b.x += b.vx; b.y += b.vy; }
    if ((b.kind === 'bomb' || b.shatter) && !(b.delay && b.t <= b.delay)) {
      if (b.vy > 0 && solidT(tAtPx(cx(b), b.y + b.h))) {
        b.dead = true;
        if (b.onLand) b.onLand(b);
        if (b.kind === 'bomb') { explodeAt(cx(b), b.y + b.h - 4); S.fx.push({ kind: 'hurt', x: cx(b) - 14, y: b.y - 10, w: 28, h: 20, life: 8 }); }
        else { SFX.rock(); for (let i = 0; i < 5; i++) addPart({ x: cx(b), y: b.y + b.h, vx: rnd(-1.5, 1.5), vy: rnd(-2.5, -0.5), g: 0.15, life: 20, c: b.c || S.th.hi, s: 2.5 }); if (b.split) for (const v of [-1.6, 0, 1.6]) eb({ kind: 'pebble', x: cx(b), y: b.y + 4, vx: v, vy: -3, g: 0.2, dmg: 2, w: 6, h: 6, c: b.c, shatter: true }); }
      }
    }
    if (b.onTick) b.onTick(b);
    if (!b.dead && !P.dead && !(b.delay && b.t <= b.delay) && overlap(b, P)) { hurtPlayer(b.dmg, cx(b)); if (!b.persist) b.dead = true; }
    if (b.hp !== undefined) for (const s of S.pb) if (!s.dead && overlap(s, b)) { b.hp -= s.dmg; if (!s.pierce) s.dead = true; if (b.hp <= 0) { b.dead = true; explodeAt(cx(b), cy(b)); } }
    if (b.life <= 0 || b.x < S.camX - 60 || b.x > S.camX + W + 60 || b.y > H + 30 || b.y < -120) b.dead = true;
  }
  for (const f of S.fx) if (f.kind === 'hurt' && overlap(f, P)) hurtPlayer(3, f.x + f.w / 2);
  S.eb = S.eb.filter(b => !b.dead);
}
function addPart(p) { S.parts.push(Object.assign({ vx: 0, vy: 0, g: 0, life: 20, s: 2, c: '#fff' }, p, { max: p.life || 20 })); }
function updateParts() {
  for (const p of S.parts) { p.vy += p.g; p.x += p.vx; p.y += p.vy; p.life--; }
  S.parts = S.parts.filter(p => p.life > 0);
  for (const f of S.fx) { f.life--; if (f.kind === 'orb') { f.x += f.vx; f.y += f.vy; } }
  S.fx = S.fx.filter(f => f.life > 0);
}

// プレイヤー弾 × 敵
function collidePB() {
  for (const b of S.pb) {
    if (b.dead || b.reflected) continue;
    const w = kindWeapon(b.k);
    for (const e of S.enemies) {
      if (e.dead || !overlap(b, e) || b.hits.has(e)) continue;
      b.hits.add(e);
      const dm = w === 0 ? b.dmg : weaponVsEnemy(w);
      const ok = damageEnemy(e, dm, w, b);
      if (ok && (!b.pierce || (b.k === 'full' && e.hp > 0))) { if (b.k !== 'full') b.dead = true; else if (e.hp > 0) b.dead = true; }
      if (b.dead) break;
    }
    if (!b.dead && S.boss && S.boss.st === 'fight' && overlap(b, S.boss)) {
      const r = damageBoss(S.boss, w, b);
      if (r === 'hit' && b.k !== 'cyclone') b.dead = true;
    }
  }
}
const kindWeapon = k => ({ buster: 0, half: 0, full: 0, flare: 1, bubble: 2, volt: 3, ice: 4, rock: 5, cyclone: 6, leaf: 8 })[k] ?? 0;
const weaponVsEnemy = w => [1, 3, 2, 2, 2, 3, 2, 4, 2][w];
