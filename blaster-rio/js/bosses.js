'use strict';
// ===== ボス =====
const FLOOR = (ROWS - 2) * TS;
const RL = () => S.roomX + TS, RRt = () => S.roomX + 19 * TS;
const BOSS_SIZE = { guard: [32, 40], drone: [38, 26], nox1: [52, 70], nox2: [38, 38] };

function makeBoss(id, hp = 28) {
  const d = BOSSES[id], sz = BOSS_SIZE[id] || [22, 30];
  return {
    id, d, x: RRt() - 60, y: -sz[1] - 10, w: sz[0], h: sz[1], vx: 0, vy: 0, hp: 0, maxHp: hp, facing: -1,
    st: 'enter', act: 'idle', at: 0, t: 0, n: 0, inv: 0, flinch: 0, onGround: false, fly: id === 'drone' || id === 'nox2',
    pose: 'stand', alpha: 1, ghost: false, shield: false, last: null,
  };
}
function bFace(b) { b.facing = cx(P) < cx(b) ? -1 : 1; }
function bAct(b, a) { b.act = a; b.at = 0; b.n = 0; b.pose = 'stand'; }
function bChoose(b, list) {
  let a = pick(list);
  if (a === b.last && Math.random() < 0.65) a = pick(list);
  b.last = a; bAct(b, a);
}
function bJumpTo(b, tx, vy) {
  const g = stageEnv().g, air = 2 * Math.abs(vy) / g;
  b.vy = vy; b.vx = clamp((tx - cx(b)) / air, -3.4, 3.4); b.onGround = false; b.pose = 'jump';
}
function arcVX(fromX, fromY, toX, toY, vy, g) {
  const dy = toY - fromY, t = (-vy + Math.sqrt(Math.max(0, vy * vy + 2 * g * dy))) / g;
  return (toX - fromX) / Math.max(10, t);
}

function updateBoss(b) {
  const e = stageEnv();
  b.t++; b.landed = false;
  if (b.inv > 0) b.inv--;
  if (b.st === 'enter') {
    b.vy = Math.min(b.vy + e.g, e.mf);
    if (b.fly) { b.vy = 2; if (b.y > 60) { b.vy = 0; b.st = 'pose'; b.t = 0; } b.y += b.vy; }
    else { b.onGround = moveY(b, b.vy) === 1; if (b.onGround) { b.st = 'pose'; b.t = 0; b.vy = 0; S.shake = 6; SFX.land(); } }
    return;
  }
  if (b.st === 'pose') { b.pose = b.t < 40 ? 'up' : 'stand'; if (b.t > 50) { b.st = 'fill'; b.t = 0; } return; }
  if (b.st === 'fill') { if (b.t % 2 === 0) { b.hp++; SFX.hpFill(); } if (b.hp >= b.maxHp) { b.hp = b.maxHp; b.st = 'fight'; bAct(b, 'idle'); S.phase = 'boss'; } return; }
  if (b.st !== 'fight') return;
  if (b.flinch > 0) { b.flinch--; b.vx *= 0.8; b.pose = 'hurt'; }
  else (AI[b.id] || AI.guard)(b, e);
  // 物理
  if (!b.fly) b.vy = Math.min(b.vy + e.g, e.mf);
  b.hitWall = moveX(b, b.vx);
  const r = moveY(b, b.vy, !b.fly);
  if (r === 1) { if (!b.onGround) b.landed = true; b.onGround = true; b.vy = 0; } else b.onGround = false;
  if (r === -1) b.vy = 0;
  if (b.y < 4 && b.fly) b.y = 4;
  b.x = clamp(b.x, RL(), RRt() - b.w);
  if (!b.ghost && !P.dead && overlap(insetBox(b, 3), P)) hurtPlayer(b.d.big ? 6 : 4, cx(b));
  if (b.whip > 0) {
    b.whip--;
    const wb = { x: b.facing > 0 ? b.x + b.w : b.x - 38, y: b.y + 8, w: 38, h: 10 };
    if (overlap(wb, P)) hurtPlayer(4, cx(b));
  }
}
const insetBox = (a, k) => ({ x: a.x + k, y: a.y + k, w: a.w - k * 2, h: a.h - k });

function damageBoss(b, w, bullet, nova) {
  if (b.st !== 'fight' || b.ghost) return 'pass';
  if (b.inv > 0) return 'pass';
  const d = b.d;
  if (b.shield && w !== 1 && w !== 7) {
    if (bullet && bullet.vx !== undefined) { bullet.reflected = true; bullet.vx = -bullet.vx; bullet.vy = -2.5; bullet.dmg = 0; }
    SFX.tink(); return 'block';
  }
  let dmg;
  if (w === 0) dmg = bullet.k === 'full' ? 3 : bullet.k === 'half' ? 2 : 1;
  else if (w === d.weak) dmg = 4;
  else if (w === d.weapon) dmg = 0;
  else dmg = 1;
  if (b.id === 'nox2' && w === 0 && bullet.k === 'buster') dmg = 1;
  if (dmg === 0) {
    if (bullet && bullet.vx !== undefined && !nova) { bullet.reflected = true; bullet.vx = -bullet.vx; bullet.vy = -2.5; bullet.dmg = 0; }
    SFX.tink(); return 'block';
  }
  b.hp -= dmg; b.inv = 30; SFX.bossHit();
  if (w === d.weak && w !== 0) {
    b.flinch = 26; b.vx = 0;
    if (b.shield) b.shield = false;
    for (let i = 0; i < 8; i++) addPart({ x: cx(b), y: cy(b), vx: rnd(-2.5, 2.5), vy: rnd(-2.5, 1), life: 22, c: WEAPONS[w].b, s: 3 });
  }
  if (b.hp <= 0) { b.hp = 0; bossDefeated(b); }
  return 'hit';
}

// ===== ボスAI =====
const AI = {
  volca(b, e) {
    switch (b.act) {
      case 'idle': b.vx = 0; bFace(b); if (++b.at > 28) bChoose(b, ['flare', 'jump', 'rain', 'jump', 'flare']); break;
      case 'flare':
        b.vx = 0; b.pose = 'shoot';
        if (b.at === 12 || b.at === 44) { eb({ kind: 'gfire', x: cx(b) + b.facing * 14, y: FLOOR - 8, w: 14, h: 16, vx: b.facing * 2.4, ground: true, dmg: 4, life: 220, persist: true }); SFX.fire(); }
        if (++b.at > 72) bAct(b, 'idle'); break;
      case 'jump':
        if (b.at === 0) bJumpTo(b, cx(P), e.jv * 1.2);
        if (++b.at > 4 && b.onGround) { b.vx = 0; S.shake = 4; bAct(b, 'idle'); } break;
      case 'rain':
        b.pose = 'up'; b.vx = 0;
        if (b.at % 10 === 0 && b.at < 50) { eb({ kind: 'fireball', x: cx(b), y: b.y, w: 10, h: 10, vx: rnd(-2.8, 2.8), vy: -5.5, g: 0.18, dmg: 3, shatter: true, c: '#ff8a20' }); SFX.fire(); }
        if (++b.at > 92) bAct(b, 'idle'); break;
    }
  },
  aqua(b, e) {
    switch (b.act) {
      case 'idle': b.vx = 0; bFace(b); if (++b.at > 26) bChoose(b, ['hop', 'bubble', 'splash']); break;
      case 'hop':
        b.at++;
        if (b.onGround && b.at > 10) {
          if (b.n < 3) { b.n++; bFace(b); bJumpTo(b, clamp(cx(b) + b.facing * 70, RL() + 20, RRt() - 20), -3.2); b.at = 0; }
          else { b.vx = 0; bAct(b, 'idle'); }
        } break;
      case 'bubble':
        b.pose = 'shoot'; b.vx = 0;
        if (b.at === 10 || b.at === 32 || b.at === 54) { const v = aim(cx(b), cy(b), 1.1); eb({ kind: 'bub', x: cx(b) + b.facing * 12, y: cy(b), w: 12, h: 12, ...v, homing: 0.025, sp: 1.15, hp: 1, dmg: 3, life: 280 }); SFX.bubble(); }
        if (++b.at > 84) bAct(b, 'idle'); break;
      case 'splash':
        if (b.at === 0) bJumpTo(b, (RL() + RRt()) / 2, -5);
        if (++b.at > 5 && b.onGround) {
          for (const s of [-1, 1]) eb({ kind: 'wave', x: cx(b) + s * 14, y: FLOOR - 10, w: 12, h: 20, vx: s * 2, ground: true, dmg: 4, persist: true });
          SFX.quake(); S.shake = 10; b.vx = 0; bAct(b, 'idle');
        } break;
    }
  },
  spark(b, e) {
    switch (b.act) {
      case 'idle': b.vx = 0; bFace(b); if (++b.at > 24) bChoose(b, ['dash', 'ceil', 'shot']); break;
      case 'dash':
        if (b.at < 22) { b.pose = 'crouch'; b.vx = 0; if (b.at === 0) bFace(b); if (b.at % 4 === 0) addPart({ x: cx(b) + rnd(-10, 10), y: b.y + rnd(b.h), life: 8, c: '#fff6a0', s: 2 }); }
        else { b.pose = 'dash'; b.vx = b.facing * 3.8; if (b.at % 3 === 0) addPart({ x: cx(b) - b.facing * 10, y: b.y + rnd(b.h), vx: -b.facing, life: 12, c: '#ffe040', s: 2 }); if ((b.hitWall && b.at > 24) || b.at > 140) { b.vx = 0; S.shake = 4; bAct(b, 'idle'); } }
        b.at++; break;
      case 'ceil':
        if (b.at === 0) { b.vy = -10; b.vx = 0; b.pose = 'jump'; }
        b.at++;
        if (!b.hang && b.y <= 18 && b.vy < 0) { b.hang = true; b.fly = true; b.vy = 0; b.y = 16; b.at = 1; }
        if (b.hang) {
          b.pose = 'hang'; b.vy = 0; b.vx = 0;
          if (b.at % 40 === 1 && b.n < 3) {
            b.n++;
            eb({ kind: 'bolt', x: cx(P), y: H / 2, w: 14, h: H, life: 48, delay: 30, persist: true, dmg: 4, onTick: o => { if (o.t === o.delay) { SFX.zap(); S.shake = 3; } } });
          }
          if (b.at > 150) { b.hang = false; b.fly = false; }
        } else if (b.at > 10 && b.onGround) bAct(b, 'idle');
        break;
      case 'shot':
        b.pose = 'shoot'; b.vx = 0;
        if (b.at === 16) { for (const o of [-0.28, 0, 0.28]) eb({ kind: 'spark', x: cx(b) + b.facing * 12, y: b.y + 12, w: 10, h: 10, ...aim(cx(b), b.y + 12, 3, o), dmg: 3 }); SFX.zap(); }
        if (++b.at > 50) bAct(b, 'idle'); break;
    }
  },
  frost(b, e) {
    switch (b.act) {
      case 'idle': b.vx *= 0.9; bFace(b); if (++b.at > 26) bChoose(b, ['slide', 'lance', 'icicle']); break;
      case 'slide':
        if (b.at < 14) { b.pose = 'crouch'; b.vx = 0; if (b.at === 0) bFace(b); }
        else { b.pose = 'dash'; b.vx = b.facing * 4; if (b.at % 3 === 0) addPart({ x: cx(b), y: b.y + b.h - 2, vx: -b.facing, vy: -0.5, life: 14, c: '#e0f8ff', s: 2 }); if ((b.hitWall && b.at > 16) || b.at > 120) { b.vx = -b.facing * 0.8; bAct(b, 'idle'); } }
        b.at++; break;
      case 'lance':
        b.pose = 'shoot'; b.vx = 0;
        if (b.at === 12 || b.at === 40) { for (const o of [-0.25, 0, 0.25]) eb({ kind: 'lance', x: cx(b) + b.facing * 12, y: b.y + 12, w: 14, h: 6, ...aim(cx(b), b.y + 12, 3.6, o), dmg: 3 }); SFX.ice(); }
        if (++b.at > 66) bAct(b, 'idle'); break;
      case 'icicle':
        if (b.at === 0) bJumpTo(b, cx(b), e.jv);
        if (++b.at > 5 && b.onGround) {
          S.shake = 10; SFX.quake();
          for (let i = 0; i < 4; i++) eb({ kind: 'icicle', x: RL() + 30 + i * 72 + rnd(-16, 16), y: -2, w: 10, h: 18, g: 0, delay: 32, shatter: true, dmg: 4, onTick: o => { if (o.t > o.delay) o.vy = Math.min(o.vy + 0.25, 6); } });
          bAct(b, 'idle');
        } break;
    }
  },
  terra(b, e) {
    switch (b.act) {
      case 'idle': b.vx = 0; bFace(b); if (++b.at > 32) bChoose(b, ['throw', 'slam', 'roll']); break;
      case 'throw':
        b.pose = 'up'; b.vx = 0;
        if (b.at === 18) { const y0 = b.y - 6; eb({ kind: 'boulder', x: cx(b), y: y0, w: 18, h: 18, vx: arcVX(cx(b), y0, cx(P), FLOOR - 9, -5, 0.22), vy: -5, g: 0.22, shatter: true, split: true, dmg: 4, c: '#9a6a3a' }); SFX.rock(); }
        if (++b.at > 52) bAct(b, 'idle'); break;
      case 'slam':
        if (b.at === 0) bJumpTo(b, cx(P), e.jv * 1.25);
        if (++b.at > 5 && b.onGround) {
          S.shake = 22; SFX.quake();
          if (P.onGround) P.stunT = 40;
          for (let i = 0; i < 3; i++) eb({ kind: 'rock', x: rnd(RL() + 10, RRt() - 10), y: -10 - i * 30, w: 12, h: 12, g: 0.18, shatter: true, dmg: 3 });
          b.vx = 0; bAct(b, 'idle');
        } break;
      case 'roll':
        b.pose = 'ball';
        if (b.at < 14) b.vx = 0;
        else { if (b.at === 14) bFace(b); if (!b.vx) b.vx = b.facing * 3.3; if (b.hitWall) { b.n++; S.shake = 6; SFX.rock(); b.facing *= -1; b.vx = b.facing * 3.3; if (b.n >= 2) { b.vx = 0; bAct(b, 'idle'); } } }
        b.at++; break;
    }
  },
  gale(b, e) {
    switch (b.act) {
      case 'idle': if (!b.fly) b.vx = 0; bFace(b); if (++b.at > 24) bChoose(b, ['fly', 'gust', 'tornado']); break;
      case 'fly': {
        b.fly = true; b.pose = 'fly';
        if (b.at < 130) {
          const tx = clamp(cx(P) - b.facing * 40, RL() + 20, RRt() - 20);
          b.vx = clamp((tx - cx(b)) * 0.03, -2, 2); b.vy = (36 + Math.sin(b.at * 0.08) * 10 - b.y) * 0.06; bFace(b);
          if (b.at % 32 === 16) { eb({ kind: 'cutter', x: cx(b), y: b.y + b.h, w: 12, h: 6, ...aim(cx(b), b.y + b.h, 3.2), dmg: 3 }); SFX.wind(); }
        } else if (b.at === 130) { const v = aim(cx(b), cy(b), 4.3); b.vx = v.vx; b.vy = v.vy; b.pose = 'dash'; }
        else if (b.onGround || b.hitWall || b.at > 200 || b.y + b.h >= FLOOR - 1) { b.fly = false; b.vx = 0; bAct(b, 'idle'); }
        b.at++; break;
      }
      case 'gust':
        if (!b.onGround) { b.fly = false; break; }
        b.pose = 'blow'; b.vx = 0;
        if (b.at === 1) SFX.wind();
        if (b.at > 10 && b.at < 150) { S.windDir = sign(cx(P) - cx(b)); if (b.at % 3 === 0) addPart({ kind: 'streak', x: cx(b), y: rnd(60, FLOOR), vx: S.windDir * 6, life: 50, c: '#ffffffaa', s: 1 }); if (b.at % 38 === 20) eb({ kind: 'cutter', x: cx(b), y: rnd(FLOOR - 50, FLOOR - 10), w: 12, h: 6, vx: S.windDir * 2.6, dmg: 3 }); }
        if (++b.at > 160) { S.windDir = 0; bAct(b, 'idle'); } break;
      case 'tornado':
        if (!b.onGround) { b.fly = false; break; }
        b.pose = 'shoot'; b.vx = 0;
        if (b.at === 16) { eb({ kind: 'tornado', x: cx(b) + b.facing * 16, y: FLOOR - 16, w: 18, h: 32, vx: b.facing * 1.8, ground: true, dmg: 4, persist: true, life: 300 }); SFX.wind(); }
        if (++b.at > 50) bAct(b, 'idle'); break;
    }
  },
  stella(b, e) {
    switch (b.act) {
      case 'idle': b.vx = 0; bFace(b); if (++b.at > 26) bChoose(b, ['warp', 'stars', 'ring', 'meteor']); break;
      case 'warp':
        b.vx = 0; b.vy = 0;
        if (b.at < 16) { b.alpha = 1 - b.at / 16; b.ghost = b.at > 6; }
        else if (b.at === 16) {
          SFX.warp();
          b.x = rnd(RL() + 16, RRt() - 40);
          if (Math.random() < 0.5) { b.fly = true; b.y = 60 + rnd(30); } else { b.fly = false; b.y = FLOOR - b.h; }
        } else if (b.at < 32) { b.alpha = (b.at - 16) / 16; b.ghost = b.at < 26; }
        else { b.alpha = 1; b.ghost = false; bAct(b, 'idle'); }
        b.at++; break;
      case 'stars':
        b.pose = 'shoot'; b.vx = 0; if (b.fly) b.vy = 0;
        if (b.at === 14) { for (const o of [-0.5, -0.25, 0, 0.25, 0.5]) eb({ kind: 'star', x: cx(b), y: cy(b), w: 10, h: 10, ...aim(cx(b), cy(b), 2.4, o), dmg: 3 }); SFX.zap(); }
        if (++b.at > 52) { b.fly = false; bAct(b, 'idle'); } break;
      case 'ring':
        b.pose = 'up'; b.vx = 0; if (b.fly) b.vy = 0;
        if (b.at === 10 || b.at === 42) { const off = b.at === 42 ? Math.PI / 10 : 0; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 + off; eb({ kind: 'star', x: cx(b), y: cy(b), w: 10, h: 10, vx: Math.cos(a) * 1.5, vy: Math.sin(a) * 1.5, dmg: 3 }); } SFX.nova(); }
        if (++b.at > 76) { b.fly = false; bAct(b, 'idle'); } break;
      case 'meteor':
        b.pose = 'up'; b.vx = 0; if (b.fly) b.vy = 0;
        if (b.at % 16 === 8 && b.at < 60) eb({ kind: 'meteor', x: rnd(RL() + 40, RRt() + 20), y: -10, vx: -1.3, vy: 2.4, w: 14, h: 14, dmg: 4, shatter: true, c: '#c890ff' });
        if (++b.at > 84) { b.fly = false; bAct(b, 'idle'); } break;
    }
  },
  vine(b, e) {
    switch (b.act) {
      case 'idle': b.vx = 0; bFace(b); if (++b.at > 28) bChoose(b, ['seed', 'whip', 'shield']); break;
      case 'seed':
        b.pose = 'up'; b.vx = 0;
        if (b.at === 14) for (const o of [-26, 26]) {
          const tx = clamp(cx(P) + o, RL() + 10, RRt() - 10);
          eb({ kind: 'seed', x: cx(b), y: b.y, w: 8, h: 8, vx: arcVX(cx(b), b.y, tx, FLOOR - 4, -4.5, 0.2), vy: -4.5, g: 0.2, shatter: true, dmg: 3,
            onLand: o2 => eb({ kind: 'thorn', x: cx(o2), y: FLOOR - 16, w: 12, h: 32, life: 230, delay: 24, persist: true, dmg: 4 }) });
        }
        if (++b.at > 50) bAct(b, 'idle'); break;
      case 'whip':
        if (b.at < 18) { b.pose = 'wind'; b.vx = 0; if (b.at === 0) bFace(b); }
        else if (b.at === 18) { b.vx = b.facing * 2.6; b.whip = 24; b.pose = 'whip'; SFX.leaf(); }
        else if (b.at > 46) { b.vx = 0; bAct(b, 'idle'); }
        b.at++; break;
      case 'shield':
        b.vx = 0; b.pose = 'up';
        if (b.at === 0) { b.shield = true; SFX.leaf(); }
        if (b.at === 130 && b.shield) { for (const o of [-0.3, 0, 0.3]) eb({ kind: 'leafE', x: cx(b), y: cy(b), w: 10, h: 8, ...aim(cx(b), cy(b), 3, o), dmg: 3 }); SFX.leaf(); }
        if (b.at >= 130) b.shield = false;
        if (++b.at > 150 || (!b.shield && b.at > 2 && b.at < 130)) { b.shield = false; bAct(b, 'idle'); } break;
    }
  },
  guard(b, e) {
    switch (b.act) {
      case 'idle': b.vx = 0; bFace(b); if (++b.at > 40) bChoose(b, ['walk', 'jump', 'shot']); break;
      case 'walk': b.pose = 'walk'; b.vx = b.facing * 0.7; if (++b.at > 70) bAct(b, 'idle'); break;
      case 'jump':
        if (b.at === 0) bJumpTo(b, cx(P), e.jv * 1.1);
        if (++b.at > 5 && b.onGround) { b.vx = 0; S.shake = 10; SFX.quake(); bAct(b, 'idle'); } break;
      case 'shot':
        b.pose = 'shoot'; b.vx = 0;
        if (b.at === 15 || b.at === 40) { for (const o of [-0.3, 0, 0.3]) eb({ x: cx(b) + b.facing * 16, y: b.y + 16, w: 8, h: 8, ...aim(cx(b), b.y + 16, 2.5, o), dmg: 3 }); SFX.enemyShot(); }
        if (++b.at > 60) bAct(b, 'idle'); break;
    }
  },
  drone(b, e) {
    b.fly = true;
    switch (b.act) {
      case 'idle': case 'hover': {
        const tx = (RL() + RRt()) / 2 + Math.sin(b.t * 0.02) * 110;
        b.vx = clamp((tx - cx(b)) * 0.04, -2, 2); b.vy = (40 + Math.sin(b.t * 0.05) * 10 - b.y) * 0.05; bFace(b);
        if (b.at % 50 === 25 && Math.abs(cx(P) - cx(b)) < 50) eb({ kind: 'bomb', x: cx(b), y: b.y + b.h, w: 10, h: 10, g: 0.12, dmg: 3 });
        if (++b.at > 130) bChoose(b, ['dash', 'laser', 'hover']); break;
      }
      case 'dash':
        if (b.at < 40) { b.vx = 0; b.vy = (FLOOR - 30 - b.y) * 0.08; b.pose = 'warn'; if (b.at === 0) { b.side = cx(b) < (RL() + RRt()) / 2 ? -1 : 1; } b.x = lerp(b.x, b.side < 0 ? RL() : RRt() - b.w, 0.08); }
        else { b.pose = 'dash'; b.vy = 0; b.vx = -b.side * 4.2; if ((b.hitWall && b.at > 44) || b.at > 140) bAct(b, 'idle'); }
        b.at++; break;
      case 'laser':
        b.vx *= 0.9; b.vy *= 0.9;
        if (b.at % 18 === 10 && b.at < 60) { eb({ kind: 'spark', x: cx(b), y: b.y + b.h, w: 8, h: 8, ...aim(cx(b), b.y + b.h, 3.2), dmg: 3 }); SFX.enemyShot(); }
        if (++b.at > 70) bAct(b, 'idle'); break;
    }
  },
  nox1(b, e) {
    switch (b.act) {
      case 'idle': b.vx = 0; bFace(b); if (++b.at > 30) bChoose(b, ['cannon', 'missile', 'stomp', 'cannon']); break;
      case 'cannon':
        b.pose = 'shoot'; b.vx = 0;
        if (b.at === 22 || b.at === 52) { eb({ kind: 'ball', x: cx(b) + b.facing * 26, y: FLOOR - 34, w: 20, h: 20, vx: b.facing * 2.3, dmg: 5 }); SFX.full(); }
        if (++b.at > 80) bAct(b, 'idle'); break;
      case 'missile':
        b.pose = 'up'; b.vx = 0;
        if (b.at % 15 === 10 && b.at < 50) { eb({ kind: 'missile', x: cx(b), y: b.y + 10, w: 10, h: 8, vx: b.facing * 1, vy: -2.5, homing: 0.04, sp: 1.9, hp: 2, dmg: 3, life: 240 }); SFX.enemyShot(); }
        if (++b.at > 70) bAct(b, 'idle'); break;
      case 'stomp':
        if (b.at === 0) bJumpTo(b, cx(P), e.jv * 1.15);
        if (++b.at > 5 && b.onGround) {
          S.shake = 24; SFX.quake(); if (P.onGround) P.stunT = 36;
          for (let i = 0; i < 2; i++) eb({ kind: 'rock', x: rnd(RL() + 10, RRt() - 10), y: -10 - i * 40, w: 12, h: 12, g: 0.18, shatter: true, dmg: 3 });
          b.vx = 0; bAct(b, 'idle');
        } break;
    }
  },
  nox2(b, e) {
    b.fly = true;
    const mx = (RL() + RRt()) / 2;
    switch (b.act) {
      case 'idle': case 'orbit': {
        const tx = mx + Math.cos(b.t * 0.018) * 100 - b.w / 2, ty = 70 + Math.sin(b.t * 0.036) * 40;
        b.vx = clamp((tx - b.x) * 0.06, -2.5, 2.5); b.vy = clamp((ty - b.y) * 0.06, -2.5, 2.5); bFace(b);
        if (b.at % 70 === 35) { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + b.t * 0.1; eb({ kind: 'spark', x: cx(b), y: cy(b), w: 8, h: 8, vx: Math.cos(a) * 1.8, vy: Math.sin(a) * 1.8, dmg: 3 }); } SFX.zap(); }
        if (++b.at > 150) bChoose(b, ['mines', 'charge', 'orbit']); break;
      }
      case 'mines':
        b.vx *= 0.9; b.vy *= 0.9;
        if (b.at % 20 === 5 && b.at < 60) eb({ kind: 'mine', x: cx(b), y: cy(b), w: 10, h: 10, vx: rnd(-1.5, 1.5), vy: -1, g: 0.15, dmg: 3, life: 130, onTick: o => {
          if (o.y + o.h >= FLOOR) { o.y = FLOOR - o.h; o.vy = 0; o.g = 0; o.vx = 0; }
          if (o.t === 120) { o.dead = true; explodeAt(cx(o), cy(o)); for (const [vx, vy] of [[2, 0], [-2, 0], [1.4, -1.4], [-1.4, -1.4]]) eb({ kind: 'spark', x: cx(o), y: cy(o), w: 8, h: 8, vx, vy, dmg: 3 }); }
        } });
        if (++b.at > 80) bAct(b, 'idle'); break;
      case 'charge':
        if (b.at < 30) { b.vx = 0; b.vy = 0; b.pose = 'warn'; }
        else if (b.at === 30) { const v = aim(cx(b), cy(b), 4.4); b.vx = v.vx; b.vy = v.vy; b.pose = 'dash'; }
        else if (b.hitWall || b.y + b.h >= FLOOR - 2 || b.at > 110) { b.vx = 0; b.vy = -1.5; bAct(b, 'idle'); }
        b.at++; break;
    }
  },
};

// ===== ボス描画 =====
function drawBoss(b) {
  if (b.st === 'gone') return;
  if (b.inv > 0 && b.inv % 4 < 2 && b.st === 'fight') return;
  ctx.save();
  ctx.globalAlpha = b.alpha ?? 1;
  const x = cx(b), y = b.y + b.h;
  if (b.id === 'guard') drawGuard(b, x, y);
  else if (b.id === 'drone') drawDrone(b, x, y);
  else if (b.id === 'nox1') drawTitan(b, x, y);
  else if (b.id === 'nox2') drawCore(b, x, y);
  else drawGear(b.d, x, y, b.facing, b.pose, b.t, b);
  ctx.restore();
  if (b.shield) {
    for (let i = 0; i < 6; i++) { const a = b.t * 0.15 + i * Math.PI / 3; leafShape(cx(b) + Math.cos(a) * 22, cy(b) + Math.sin(a) * 22, a, '#5ac040'); }
  }
  if (b.whip > 0) {
    ctx.strokeStyle = '#3a8a2a'; ctx.lineWidth = 2.5;
    const sx = cx(b) + b.facing * 8, sy = b.y + 13;
    ctx.beginPath(); ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + b.facing * 20, sy - 8 + Math.sin(b.t) * 4, sx + b.facing * 40, sy + 2); ctx.stroke();
    leafShape(sx + b.facing * 40, sy + 2, 0, '#7ad050');
  }
}
function leafShape(x, y, a, c) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.beginPath(); ctx.ellipse(0, 0, 6, 3, 0, 0, 7); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 0.7; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.strokeStyle = shade(c, -0.4); ctx.stroke();
  ctx.restore();
}
// 8体のギア（人型）
function drawGear(d, x, y, f, pose, t, b) {
  ctx.save(); ctx.translate(x, y); ctx.scale(f, 1);
  const A = d.a, B = d.b, C = d.c, E = d.eye;
  if (pose === 'ball') {
    ctx.rotate(t * 0.3 * f);
    CIR(0, -14, 14, A); CIR(0, -14, 9, B, null);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; POLY([Math.cos(a) * 12, -14 + Math.sin(a) * 12, Math.cos(a + 0.3) * 18, -14 + Math.sin(a + 0.3) * 18, Math.cos(a + 0.5) * 12, -14 + Math.sin(a + 0.5) * 12], C); }
    ctx.restore(); return;
  }
  const crouch = pose === 'crouch' ? 5 : pose === 'jump' ? 1 : 0;
  const walk = pose === 'walk' || pose === 'dash' ? Math.sin(t * 0.4) * 0.5 : 0;
  const hipY = -12 + crouch;
  // 背中の装備
  if (d.helm === 'fin') { RR(-14, hipY - 14, 7, 12, 3, B); R(-13, hipY - 12, 5, 2, '#fff'); }
  if (d.helm === 'wing') {
    const fl = pose === 'fly' || pose === 'dash' ? Math.sin(t * 0.5) * 0.5 : 0.1;
    for (const k of [0, 1]) { ctx.save(); ctx.translate(-4, hipY - 12); ctx.rotate(-0.6 - fl - k * 0.3); POLY([0, 0, -22, -6, -26, 2, -20, 4, -22, 9, -14, 8, -12, 12, -4, 6], k ? shade(B, -0.1) : B); ctx.restore(); }
  }
  if (d.helm === 'star') { ctx.save(); ctx.translate(-2, hipY - 20); ctx.rotate(t * 0.02); ctx.strokeStyle = B; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 15, 0, 7); ctx.stroke(); ctx.restore(); }
  // 脚
  const legA = pose === 'jump' ? [-0.5, 0.6] : pose === 'dash' ? [-0.9, 0.7] : [walk, -walk];
  const boot = len => { RR(-4, len - 1, 9, 5, 2, C); R(-3, len - 1, 7, 1.5, B); };
  limb(-3, hipY, 10 - crouch * 0.6, 5.5, legA[1], shade(A, -0.25), boot);
  limb(3, hipY, 10 - crouch * 0.6, 5.5, legA[0], A, boot);
  // 胴体
  const lean = pose === 'dash' ? 0.3 : pose === 'hurt' ? -0.25 : 0;
  ctx.save(); ctx.translate(0, hipY); ctx.rotate(lean);
  const big = d.helm === 'rock' ? 2 : 0;
  // 後ろ腕
  const armBack = pose === 'up' || pose === 'hang' ? -2.6 : pose === 'blow' ? -1.4 : 0.3 + walk;
  limb(-6 - big, -12, 9, 5, armBack, shade(A, -0.25), l => CIR(0, l + 1, 3, C));
  RR(-9 - big, -15, 18 + big * 2, 15, 5, A);
  RR(-6, -13, 12, 7, 3, B);
  CIR(0, -9.5, 2, E, OUT, 0.6);
  R(-9 - big, -3, 18 + big * 2, 3, C);
  // 前腕
  let armF = 0.2 - walk;
  if (pose === 'shoot' || pose === 'blow') armF = -1.57;
  if (pose === 'up' || pose === 'hang') armF = -2.9;
  if (pose === 'wind') armF = 1.8;
  if (pose === 'whip') armF = -1.3;
  limb(6 + big, -12, 9, 5.5, armF, A, l => { RR(-3.5, l - 2, 7, 6, 2.5, B); R(-2, l + 2, 4, 2, C); });
  // 肩
  if (d.helm === 'rock') { CIR(-9, -13, 6, '#8a6a4a'); CIR(9, -13, 6, '#9a7a5a'); R(6, -16, 2, 2, '#c8a070'); }
  else if (d.helm === 'horn') { RR(-12, -16, 7, 6, 2, B); RR(5, -16, 7, 6, 2, B); for (let i = 0; i < 3; i++) R(6 + i * 2, -15, 1, 4, '#ffe040'); }
  else if (d.helm === 'crystal') { POLY([4, -12, 10, -22, 13, -11], B); POLY([-4, -12, -10, -21, -12, -11], shade(B, -0.1)); }
  else if (d.helm === 'leaf') { leafShape(9, -14, -0.6, '#5ac040'); leafShape(-9, -14, 0.6, '#3a9a30'); }
  else if (d.helm === 'flame') { RR(-12, -16, 7, 6, 2, C); RR(5, -16, 7, 6, 2, C); CIR(8.5, -15, 1.5, '#ffb020', null); }
  else { CIR(-8, -13, 4.2, B); CIR(8, -13, 4.2, B); }
  // 頭
  const hy = -21;
  CIR(0, hy, 7.5, A);
  RR(-1, hy - 2.5, 8, 6, 2, C);
  R(2, hy - 1, 3.5, 2.2, E);
  if (pose === 'hurt') { R(2, hy - 1, 3.5, 1, '#fff'); }
  R(-6, hy + 1, 3, 3, B);
  // 頭の飾り
  switch (d.helm) {
    case 'flame': {
      for (let i = 0; i < 3; i++) { const fl = Math.sin(t * 0.3 + i * 2) * 2; POLY([-5 + i * 4, hy - 5, -4 + i * 4 + fl * 0.5, hy - 14 - (i === 1 ? 4 : 0) + fl, -1 + i * 4, hy - 5], i === 1 ? '#ffd040' : '#ff6a20'); }
      break;
    }
    case 'fin': POLY([-6, hy - 4, -1, hy - 15, 4, hy - 6], B); R(-4, hy - 4, 9, 2, '#fff8'); break;
    case 'horn': POLY([-4, hy - 5, -8, hy - 11, -5, hy - 11, -9, hy - 18, -2, hy - 9, -5, hy - 9], '#ffe040'); POLY([3, hy - 6, 6, hy - 12, 3, hy - 12, 8, hy - 19, 9, hy - 10, 6, hy - 10], '#ffe040'); break;
    case 'crystal': for (let i = 0; i < 4; i++) POLY([-6 + i * 4, hy - 5, -5 + i * 4, hy - 11 - (i % 2) * 4, -3 + i * 4, hy - 5], i % 2 ? '#fff' : B); break;
    case 'rock': POLY([2, hy - 6, 7, hy - 16, 8, hy - 5], '#d8c090'); RR(-7, hy - 8, 10, 4, 2, '#8a6a4a'); break;
    case 'wing': POLY([-2, hy - 6, -10, hy - 14, -3, hy - 10, -6, hy - 18, 2, hy - 8], B); break;
    case 'star': star(-1, hy - 9, 7, 3, 5, -Math.PI / 2 + Math.sin(t * 0.05) * 0.2, B); CIR(-1, hy - 9, 1.5, E, null); break;
    case 'leaf': leafShape(-1, hy - 9, -1.2, '#6ad040'); leafShape(-6, hy - 6, -2.2, '#3a9a30'); CIR(3, hy - 7, 2, '#ff5a8a'); break;
  }
  ctx.restore();
  ctx.restore();
}
function drawGuard(b, x, y) {
  const d = b.d, f = b.facing, t = b.t;
  ctx.save(); ctx.translate(x, y); ctx.scale(f, 1);
  const st = b.pose === 'walk' ? Math.sin(t * 0.25) * 2 : 0;
  RR(-14, -10 + st, 11, 10, 3, d.c); RR(3, -10 - st, 11, 10, 3, d.c);
  RR(-16, -36, 32, 28, 6, d.a);
  RR(-11, -32, 22, 12, 3, d.c); R(-8, -28, 16, 4, d.eye); R(-8 + ((t >> 3) % 4) * 4, -28, 4, 4, '#fff');
  R(-16, -16, 32, 3, d.b); for (let i = 0; i < 4; i++) R(-14 + i * 8, -16, 4, 3, OUT);
  const arm = b.pose === 'shoot' ? -1.4 : 0.2;
  limb(14, -30, 12, 8, arm, d.a, l => { RR(-5, l - 2, 10, 8, 3, d.b); CIR(0, l + 6, 2, OUT, null); });
  RR(-6, -42, 12, 8, 3, d.a); R(-2, -46, 4, 5, d.b);
  ctx.restore();
}
function drawDrone(b, x, y) {
  const d = b.d, t = b.t;
  ctx.save(); ctx.translate(x, y - 13);
  for (const s of [-1, 1]) { R(s * 16 - 1, -12, 2, 8, OUT); const w = Math.abs(Math.sin(t * 0.8)) * 12; RR(s * 16 - w / 2, -14, w + 0.5, 2, 1, '#ccd', null); }
  ctx.beginPath(); ctx.ellipse(0, 0, 19, 10, 0, 0, 7); ctx.fillStyle = d.a; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 0.8; ctx.stroke();
  R(-19, -1, 38, 3, d.c);
  CIR(0, 2, 7, d.c); CIR(cx(P) < x ? -2 : 2, 2, 4, b.pose === 'warn' && t % 6 < 3 ? '#fff' : d.eye, null);
  for (let i = 0; i < 5; i++) CIR(-12 + i * 6, -5, 1, (t >> 2) % 5 === i ? d.b : '#333', null);
  ctx.restore();
}
function drawTitan(b, x, y) {
  const d = b.d, f = b.facing, t = b.t;
  ctx.save(); ctx.translate(x, y); ctx.scale(f, 1);
  RR(-22, -18, 16, 18, 4, d.c); RR(6, -18, 16, 18, 4, d.c);
  RR(-20, -26, 12, 10, 3, d.a); RR(8, -26, 12, 10, 3, d.a);
  RR(-26, -62, 52, 40, 10, d.a);
  RR(-16, -56, 32, 22, 6, d.c);
  // コクピット（ドクター・ノクス）
  RR(-10, -54, 20, 16, 5, '#5a2a6a');
  CIR(0, -47, 4.5, '#d8b8a8', null); R(-4, -50, 8, 2.5, '#222'); R(-3, -49.5, 2, 1.5, '#ff4060'); R(1, -49.5, 2, 1.5, '#ff4060');
  R(-5, -44, 10, 4, '#3a1a4a');
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-9, -53, 6, 14);
  R(-26, -30, 52, 4, d.b);
  // 腕（キャノン）
  const arm = b.pose === 'shoot' ? -1.57 : b.pose === 'up' ? -2.6 : 0.15;
  limb(24, -54, 16, 11, arm, d.a, l => { RR(-7, l - 4, 14, 14, 4, d.c); CIR(0, l + 10, 4, b.pose === 'shoot' && t % 8 < 4 ? '#ffe040' : '#ff3050', null); });
  limb(-24, -54, 14, 10, 0.25, shade(d.a, -0.2));
  // 角
  POLY([-20, -60, -28, -76, -12, -62], d.b); POLY([20, -60, 28, -76, 12, -62], d.b);
  ctx.restore();
}
function drawCore(b, x, y) {
  const d = b.d, t = b.t;
  ctx.save(); ctx.translate(x, y - 19);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t * 0.04; POLY([Math.cos(a) * 16, Math.sin(a) * 16, Math.cos(a + 0.2) * 26, Math.sin(a + 0.2) * 26, Math.cos(a + 0.4) * 16, Math.sin(a + 0.4) * 16], d.b); }
  CIR(0, 0, 18, d.a);
  CIR(0, 0, 12, b.pose === 'warn' && t % 6 < 3 ? '#fff' : '#6a2a8a');
  CIR(0, 1, 5, '#d8b8a8', null); R(-4.5, -2, 9, 2.5, '#222'); R(-3.5, -1.6, 2.4, 1.6, d.eye); R(1.1, -1.6, 2.4, 1.6, d.eye);
  ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.ellipse(-5, -5, 4, 6, 0.5, 0, 7); ctx.fill();
  ctx.restore();
}
