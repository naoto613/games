// ================================================================ battle
let MODE = 'title';
let B = null;
const FOE_C = [176, 46], ME_C = [64, 82];
const stageMul = s => s >= 0 ? (2 + s) / 2 : 2 / (2 - s);

function newStages() { return { atk: 0, def: 0, spd: 0, acc: 0 }; }
function battleEnv() {
  const d = F.map && F.map.def; return (d && d.benv) || 'grass';
}
const ENV = {
  grass: { sky: ['#a8d8f8', '#e0f4ff'], far: '#58a860', gnd: '#b8e098', pf: '#88c868', pfE: '#5a9848' },
  cave: { sky: ['#3a2a20', '#5a4434'], far: '#2a1c14', gnd: '#8a6c50', pf: '#a88a68', pfE: '#6a5038' },
  gym: { sky: ['#c8ccd8', '#e8eaf0'], far: '#a0a4b8', gnd: '#d8dce8', pf: '#b8bcd0', pfE: '#8890a8' },
  ash: { sky: ['#a8a8a0', '#d8d8d0'], far: '#787870', gnd: '#c0c0b8', pf: '#a8a8a0', pfE: '#787870' },
  sea: { sky: ['#78c0f8', '#c8e8ff'], far: '#3878d8', gnd: '#f0e0a8', pf: '#e8d498', pfE: '#c0a870' },
  volcano: { sky: ['#a03020', '#f09050'], far: '#502018', gnd: '#8c6c58', pf: '#a88a74', pfE: '#6c4c3a' },
  ruin: { sky: ['#5a4838', '#8a7458'], far: '#3a2c20', gnd: '#c8b490', pf: '#e2d2b0', pfE: '#a08c68' },
  league: { sky: ['#302048', '#584078'], far: '#201430', gnd: '#c02840', pf: '#e8c048', pfE: '#a08020' },
};
function hpCol(f) { return f > 0.5 ? '#40d860' : f > 0.2 ? '#f8c020' : '#f04838'; }
function drawHPBar(x, y, w, f) {
  ctx.fillStyle = '#383838'; ctx.fillRect(x - 13, y - 1, w + 14, 5);
  txt('HP', x - 12, y - 3, '#f8b830', null, 7);
  ctx.fillStyle = '#585858'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = hpCol(f); ctx.fillRect(x, y, Math.ceil(w * clamp(f, 0, 1)), 3);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x, y, Math.ceil(w * clamp(f, 0, 1)), 1);
}
function stTag(st, x, y) {
  if (!st) return; ctx.fillStyle = ST_COL[st]; ctx.fillRect(x, y, 22, 9); txt(st, x + 11, y - 1, '#fff', null, 8, 'center');
}
function drawBox(side) {
  const m = side === 'foe' ? B.foe : B.me; if (!m) return;
  const show = side === 'foe' ? B.foeBox : B.meBox; if (!show) return;
  const d = side === 'foe' ? B.foeHPd : B.meHPd;
  if (side === 'foe') {
    const x = 10 - (1 - show) * 120, y = 10;
    ctx.fillStyle = '#304030'; ctx.fillRect(x, y, 104, 30); ctx.fillStyle = '#f8f8e8'; ctx.fillRect(x + 1, y + 1, 102, 28);
    ctx.fillStyle = '#d8e0c0'; ctx.fillRect(x + 1, y + 24, 102, 5);
    txt(monName(m), x + 6, y + 3, '#303038', '#d0d0c0', 11);
    txt('Lv' + m.lv, x + 98, y + 4, '#303038', '#d0d0c0', 10, 'right');
    drawHPBar(x + 40, y + 19, 58, d / m.maxhp);
    stTag(m.st, x + 4, y + 15);
    if (B.wild && G.caught[m.sp]) drawBallIcon(x + 84 - tw('Lv' + m.lv, 10) - 8, y + 6, 6);
  } else {
    const x = 128 + (1 - show) * 130, y = 72;
    ctx.fillStyle = '#304030'; ctx.fillRect(x, y, 108, 38); ctx.fillStyle = '#f8f8e8'; ctx.fillRect(x + 1, y + 1, 106, 36);
    txt(monName(m), x + 8, y + 3, '#303038', '#d0d0c0', 11);
    txt('Lv' + m.lv, x + 102, y + 4, '#303038', '#d0d0c0', 10, 'right');
    drawHPBar(x + 44, y + 18, 58, d / m.maxhp);
    txt(`${Math.max(0, Math.ceil(d))}/${m.maxhp}`, x + 102, y + 22, '#303038', '#d0d0c0', 10, 'right');
    stTag(m.st, x + 6, y + 23);
    const e0 = expFor(m.lv), e1 = expFor(m.lv + 1);
    const ef = m.lv >= 100 ? 0 : clamp((B.meEXPd - e0) / (e1 - e0), 0, 1);
    ctx.fillStyle = '#383838'; ctx.fillRect(x + 30, y + 33, 74, 3); ctx.fillStyle = '#48a8f8'; ctx.fillRect(x + 31, y + 34, 72 * ef, 1);
  }
}
function drawBattle() {
  const env = ENV[B.env] || ENV.grass;
  let ox = 0, oy = 0; if (B.shake > 0) { ox = rint(-3, 3); oy = rint(-2, 2); B.shake--; }
  ctx.save(); ctx.translate(ox, oy);
  const g = ctx.createLinearGradient(0, 0, 0, 70); g.addColorStop(0, env.sky[0]); g.addColorStop(1, env.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(-4, -4, W + 8, 74);
  // distant silhouettes
  ctx.fillStyle = env.far;
  for (let x = -8; x < W + 16; x += 14) { const h = 8 + (Math.sin(x * 0.7) * 0.5 + 0.5) * 10; ctx.beginPath(); ctx.ellipse(x, 66, 10, h, 0, Math.PI, 0); ctx.fill(); }
  ctx.fillRect(-4, 64, W + 8, 8);
  ctx.fillStyle = env.gnd; ctx.fillRect(-4, 70, W + 8, 50);
  if (B.env === 'sea') { ctx.fillStyle = '#5898e8'; ctx.fillRect(-4, 56, W + 8, 14); ctx.fillStyle = '#b8e0ff'; for (let x = 0; x < W; x += 20) ctx.fillRect((x + frame * 0.2) % W, 60 + (x % 3), 8, 1); }
  // platforms
  const pf = (cx, cy, rx, ry) => { ctx.fillStyle = env.pfE; ctx.beginPath(); ctx.ellipse(cx, cy + 1, rx + 1, ry + 1, 0, 0, 7); ctx.fill(); ctx.fillStyle = env.pf; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(cx - 6, cy - 2, rx * 0.6, ry * 0.45, 0, 0, 7); ctx.fill(); };
  pf(176 + B.foeSlide, 74, 44, 10); pf(66 - B.meSlide, 116, 58, 12);
  // foe trainer / mon
  if (B.trSpr && B.trSprX < 200) ctx.drawImage(B.trSpr, 144 + B.trSprX + B.foeSlide, 10);
  if (B.foe && B.foeVis) {
    const img = monImg(B.foe.sp), sc = B.foeScale;
    const blink = B.blink === 'foe' && (frame >> 2) % 2;
    if (!blink && sc > 0) {
      const sz = 64 * sc, x = 176 - sz / 2 + B.foeSlide + B.foeDX, y = 76 - sz + B.foeDrop + B.foeDY;
      if (B.foeDrop > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 76); ctx.clip(); }
      ctx.drawImage(B.foeWhite ? tintC(img, B.foeWhite) : img, x, y, sz, sz);
      if (B.foeDrop > 0) ctx.restore();
    }
  }
  // my mon / trainer
  if (B.plSprX > -80) ctx.drawImage(futanBack()[B.plFrame], 34 - B.meSlide + B.plSprX, 52);
  if (B.me && B.meVis) {
    const img = monImg(B.me.sp, true), sc = B.meScale;
    const blink = B.blink === 'me' && (frame >> 2) % 2;
    if (!blink && sc > 0) {
      const sz = 64 * sc, x = 64 - sz / 2 + B.meDX, y = 116 - sz + B.meDrop + B.meDY + (B.idle ? Math.floor(frame / 16) % 2 : 0);
      if (B.meDrop > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 116); ctx.clip(); }
      ctx.drawImage(B.meWhite ? tintC(img, B.meWhite) : img, x, y, sz, sz);
      if (B.meDrop > 0) ctx.restore();
    }
  }
  // ball
  if (B.ball) { const b = B.ball; if (b.open) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.open * 10, 0, 7); ctx.fill(); } drawBallIcon(b.x - 5 + (b.rot || 0), b.y - 5, 10, 0, b.col); }
  // party indicator
  if (B.partyInd) drawPartyInd(B.partyInd);
  // particles
  for (const p of B.fx) drawParticle(p);
  ctx.restore();
  if (B.screen) { ctx.fillStyle = B.screen; ctx.fillRect(0, 0, W, H); }
  drawBox('foe'); drawBox('me');
  // bottom text area base
  ctx.fillStyle = '#28303c'; ctx.fillRect(0, 112, W, 48);
  if (!MSG) { win(2, 114, 236, 44, WS.battle); }
}
function drawPartyInd(side) {
  const list = side === 'foe' ? B.foeParty : G.party;
  const x0 = side === 'foe' ? 12 : 136, y = side === 'foe' ? 30 : 92;
  ctx.fillStyle = 'rgba(40,40,48,0.8)'; ctx.fillRect(x0 - 4, y + 9, 92, 3);
  for (let i = 0; i < 6; i++) {
    const m = list[i]; const x = x0 + (side === 'foe' ? 76 - i * 12 : i * 12);
    if (!m) { ctx.fillStyle = '#909098'; ctx.beginPath(); ctx.arc(x + 4, y + 4, 3.5, 0, 7); ctx.fill(); continue; }
    drawBallIcon(x, y, 8, 0, m.hp > 0 ? '#e83040' : '#606068');
  }
}
// ---------------------------------------------------------------- particles / fx
function drawParticle(p) {
  ctx.globalAlpha = p.a ?? 1;
  const s = p.s || 3;
  switch (p.k) {
    case 'sq': ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s); break;
    case 'ci': ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, 7); ctx.fill(); break;
    case 'ring': ctx.strokeStyle = p.c; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, 7); ctx.stroke(); break;
    case 'bub': ctx.strokeStyle = p.c; ctx.lineWidth = 1; ctx.fillStyle = 'rgba(200,230,255,0.5)'; ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(p.x - s / 2, p.y - s / 2, 1, 1); break;
    case 'flame': { const r = s * (1 - (p.t / p.life) * 0.6); ctx.fillStyle = '#f04020'; ctx.beginPath(); ctx.ellipse(p.x, p.y, r, r * 1.4, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#f8c040'; ctx.beginPath(); ctx.ellipse(p.x, p.y + r * 0.3, r * 0.55, r * 0.8, 0, 0, 7); ctx.fill(); break; }
    case 'leaf': ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.t * 0.4); ctx.fillStyle = '#48b048'; ctx.beginPath(); ctx.ellipse(0, 0, s * 1.6, s * 0.7, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#286828'; ctx.fillRect(-s * 1.4, -0.3, s * 2.8, 0.7); ctx.restore(); break;
    case 'line': ctx.strokeStyle = p.c; ctx.lineWidth = p.w || 2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x2, p.y2); ctx.stroke(); break;
    case 'zig': { ctx.strokeStyle = p.c; ctx.lineWidth = 2; ctx.beginPath(); let x = p.x, y = p.y; ctx.moveTo(x, y); for (let i = 0; i < 6; i++) { x += (i % 2 ? -6 : 6) * (p.dir || 1); y += 7; ctx.lineTo(x, y); } ctx.stroke(); break; }
    case 'star': { ctx.fillStyle = p.c; ctx.save(); ctx.translate(p.x, p.y); ctx.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? s * 0.4 : s; const a = i * Math.PI / 4 + p.t * 0.1; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill(); ctx.restore(); break; }
    case 'note': txt('♪', p.x, p.y, p.c, null, 12); break;
    case 'rock': ctx.fillStyle = '#a08060'; ctx.beginPath(); ctx.moveTo(p.x - s, p.y); ctx.lineTo(p.x - s / 2, p.y - s); ctx.lineTo(p.x + s, p.y - s / 2); ctx.lineTo(p.x + s / 2, p.y + s); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#403020'; ctx.lineWidth = 1; ctx.stroke(); break;
    case 'jaw': { const o = p.o; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#303030'; ctx.lineWidth = 1; for (const sg of [-1, 1]) { ctx.beginPath(); const y = p.y + sg * o; ctx.moveTo(p.x - 14, y); for (let i = 0; i <= 4; i++) ctx.lineTo(p.x - 14 + i * 7, y - sg * (i % 2 ? 0 : 6)); ctx.lineTo(p.x + 14, y); ctx.closePath(); ctx.fill(); ctx.stroke(); } break; }
    case 'wave': ctx.fillStyle = 'rgba(80,140,240,0.7)'; ctx.fillRect(p.x, p.y, p.s, 40); ctx.fillStyle = 'rgba(220,240,255,0.9)'; ctx.fillRect(p.x + p.s - 3, p.y, 3, 40); break;
  }
  ctx.globalAlpha = 1;
}
function stepFx() {
  if (!B) return;
  for (const p of B.fx) {
    p.t = (p.t || 0) + 1; p.x += p.vx || 0; p.y += p.vy || 0; if (p.g) p.vy += p.g;
    if (p.tx != null) { const k = p.t / p.life; p.x = lerp(p.sx, p.tx, k) + (p.wob ? Math.sin(p.t * 0.5) * p.wob : 0); p.y = lerp(p.sy, p.ty, k) - (p.arc ? Math.sin(k * Math.PI) * p.arc : 0); }
    if (p.fade) p.a = 1 - p.t / p.life;
    if (p.grow) p.s += p.grow;
  }
  B.fx = B.fx.filter(p => p.t < p.life);
}
updaters.push(() => { if (MODE === 'battle') stepFx(); });
const fxAdd = p => B.fx.push(Object.assign({ t: 0, life: 30 }, p));
async function fxWait() { while (B.fx.length) await tick(); }
async function lunge(side, d = 10) {
  const k = side === 'me' ? 1 : -1;
  for (let i = 0; i < 4; i++) { B[side + 'DX'] = k * d * (i + 1) / 4; await tick(); }
  for (let i = 3; i >= 0; i--) { B[side + 'DX'] = k * d * i / 4; await tick(); }
}
async function playFx(kind, atkSide) {
  const tgt = atkSide === 'me' ? FOE_C : ME_C, src = atkSide === 'me' ? ME_C : FOE_C, tSide = atkSide === 'me' ? 'foe' : 'me';
  const [tx, ty] = tgt, [sx, sy] = src;
  switch (kind) {
    case 'hit': case 'dash': await lunge(atkSide, kind === 'dash' ? 26 : 12); AU.sfx('weakhit'); fxAdd({ k: 'star', x: tx, y: ty, s: 10, c: '#fff8a0', life: 12, fade: true }); break;
    case 'slash': AU.sfx('weakhit'); for (let i = 0; i < 3; i++) { fxAdd({ k: 'line', x: tx - 16 + i * 8, y: ty - 16, x2: tx + 4 + i * 8, y2: ty + 14, c: '#ffffff', w: 2, life: 14, fade: true }); await wait(4); } break;
    case 'bite': AU.sfx('weakhit'); { const p = { k: 'jaw', x: tx, y: ty, o: 16, life: 18 }; fxAdd(p); for (let i = 0; i < 12; i++) { p.o = Math.max(0, 16 - i * 2); await tick(); } } break;
    case 'fire': AU.sfx('fire'); for (let i = 0; i < 14; i++) { fxAdd({ k: 'flame', sx, sy, tx: tx + rnd(-8, 8), ty: ty + rnd(-6, 8), s: 4, life: 18 + i }); await wait(2); } break;
    case 'bigfire': AU.sfx('fire'); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; fxAdd({ k: 'flame', x: tx + Math.cos(a) * 22, y: ty + Math.sin(a) * 18, vy: -0.4, s: 5, life: 30 }); if (i % 3 === 0) await tick(); } B.shake = 12; break;
    case 'water': AU.sfx('water'); for (let i = 0; i < 12; i++) { fxAdd({ k: 'bub', sx, sy: sy - 8, tx: tx + rnd(-8, 8), ty: ty + rnd(-8, 8), s: rnd(2, 4), c: '#4890e0', life: 20, wob: 3 }); await wait(2); } break;
    case 'wave': AU.sfx('water'); { const dir = atkSide === 'me' ? 1 : -1; const p = { k: 'wave', x: dir > 0 ? 20 : 220, y: ty - 20, s: 20, vx: dir * 7, life: 28 }; fxAdd(p); } B.shake = 6; break;
    case 'leaf': AU.sfx('leaf'); for (let i = 0; i < 8; i++) { fxAdd({ k: 'leaf', sx, sy: sy - 10, tx: tx + rnd(-10, 10), ty: ty + rnd(-10, 10), s: 3, life: 18, arc: 12 }); await wait(3); } break;
    case 'drain': for (let i = 0; i < 10; i++) { fxAdd({ k: 'ci', sx: tx + rnd(-10, 10), sy: ty + rnd(-10, 10), tx: sx, ty: sy - 10, s: 2.5, c: '#80f080', life: 22, arc: 10 }); await wait(2); } AU.sfx('heal'); break;
    case 'zap': AU.sfx('zap'); for (let i = 0; i < 4; i++) { fxAdd({ k: 'zig', x: tx - 10 + i * 6, y: ty - 22, c: i % 2 ? '#f8f040' : '#ffffff', life: 8, dir: i % 2 ? 1 : -1 }); await wait(3); } break;
    case 'bolt': AU.sfx('zap'); B.screen = 'rgba(255,255,160,0.35)'; for (let i = 0; i < 6; i++) { fxAdd({ k: 'zig', x: tx + rnd(-4, 4), y: -6 + (i % 3) * 14, c: i % 2 ? '#f8f040' : '#ffffff', life: 6, dir: i % 2 ? 1 : -1 }); await wait(3); } B.screen = null; break;
    case 'rock': AU.sfx('rock'); for (let i = 0; i < 6; i++) { fxAdd({ k: 'rock', x: tx + rnd(-18, 18), y: ty - 50, vy: 3, g: 0.3, s: rnd(3, 6), life: 16 }); await wait(3); } B.shake = 8; break;
    case 'mud': AU.sfx('weakhit'); for (let i = 0; i < 6; i++) { fxAdd({ k: 'ci', sx, sy, tx: tx + rnd(-8, 8), ty: ty + rnd(-6, 6), s: 3, c: '#8a6440', life: 16, arc: 16 }); await wait(2); } break;
    case 'quake': AU.sfx('quake'); B.shake = 40; break;
    case 'magma': AU.sfx('quake'); B.shake = 40; B.screen = 'rgba(255,60,20,0.35)'; for (let i = 0; i < 10; i++) { fxAdd({ k: 'flame', x: tx + rnd(-24, 24), y: ty + 20, vy: -1.5, s: 6, life: 28 }); await wait(3); } B.screen = null; break;
    case 'wind': AU.sfx('wind'); for (let i = 0; i < 10; i++) { fxAdd({ k: 'ring', x: tx + rnd(-10, 10), y: ty + rnd(-10, 10), s: 2, grow: 0.8, c: '#ffffff', life: 16, fade: true }); await wait(2); } break;
    case 'psy': AU.sfx('psy'); for (let i = 0; i < 6; i++) { fxAdd({ k: 'ring', x: tx, y: ty, s: 3, grow: 1.5, c: ['#f870c0', '#a070f0', '#70c0f0'][i % 3], life: 20, fade: true }); await wait(4); } break;
    case 'sound': AU.sfx('up'); for (let i = 0; i < 4; i++) { fxAdd({ k: 'note', sx: sx + 10, sy: sy - 20, tx: tx, ty: ty - 10, c: '#303038', life: 22, wob: 4 }); await wait(5); } break;
    case 'wiggle': for (let i = 0; i < 12; i++) { B[atkSide + 'DX'] = (i % 2 ? 3 : -3); await wait(2); } B[atkSide + 'DX'] = 0; break;
    case 'shine': AU.sfx('stat'); for (let i = 0; i < 8; i++) { fxAdd({ k: 'star', x: sx + rnd(-16, 16), y: sy + rnd(-20, 10), s: 4, c: '#fff8a0', vy: -0.5, life: 16, fade: true }); await wait(2); } break;
    case 'heal': AU.sfx('heal'); for (let i = 0; i < 10; i++) { fxAdd({ k: 'ci', x: sx + rnd(-16, 16), y: sy + 10, vy: -1.2, s: 2, c: '#90f8a0', life: 20, fade: true }); await wait(2); } break;
    case 'powder': AU.sfx('leaf'); for (let i = 0; i < 14; i++) { fxAdd({ k: 'sq', x: tx + rnd(-18, 18), y: ty - 30, vy: 1.6, s: 2, c: pick(['#f0f080', '#c080f0', '#ffffff']), life: 24, fade: true }); await wait(1); } break;
    case 'string': fxAdd({ k: 'line', x: sx + 10, y: sy - 10, x2: tx, y2: ty, c: '#ffffff', w: 1, life: 20 }); await wait(10); break;
  }
  await fxWait();
}
async function hitBlink(side, n = 18) { B.blink = side; await wait(n); B.blink = null; }
async function animHP(side, to) {
  const m = side === 'foe' ? B.foe : B.me, k = side + 'HPd';
  to = clamp(to, 0, m.maxhp);
  const step = Math.max(0.5, Math.abs(B[k] - to) / 28);
  while (Math.abs(B[k] - to) > 0.01) { B[k] = B[k] < to ? Math.min(to, B[k] + step) : Math.max(to, B[k] - step); await tick(); }
}

// ---------------------------------------------------------------- intro transition
async function battleSwirl() {
  AU.sfx('swirl');
  for (let i = 0; i < 3; i++) { UI.flash = 0.9; await wait(6); }
  let k = 0;
  const L = pushLayer(() => { ctx.fillStyle = '#000'; for (let j = 0; j < 8; j++) ctx.fillRect(j % 2 ? 0 : W - W * k, j * 20, W * k, 20); });
  for (let i = 0; i <= 24; i++) { k = i / 24; await tick(); }
  UI.fade = 1; popLayer(L);
}

// ---------------------------------------------------------------- main battle
async function wildBattle(sp, lv) {
  return battle({ wild: makeMon(sp, lv) });
}
async function battle(o) {
  const prevBgm = AU.curName;
  const trainer = o.trainer;
  if (!o.noSwirl) await battleSwirl();
  AU.bgm(o.music || (trainer ? (trainer.music || 'trainer') : (o.legend ? 'boss' : 'wild')));
  B = {
    env: o.env || battleEnv(), wild: !trainer, trainer, fx: [], foeParty: trainer ? (trainer.party || trainer.partyFn()).map(([sp, lv, mv]) => makeMon(sp, lv, mv ? { moves: mv } : {})) : [o.wild],
    foe: null, me: null, foeVis: false, meVis: false, foeScale: 1, meScale: 1, foeSlide: -200, meSlide: -200, foeDX: 0, meDX: 0, foeDY: 0, meDY: 0, foeDrop: 0, meDrop: 0,
    foeHPd: 0, meHPd: 0, meEXPd: 0, foeBox: 0, meBox: 0, trSpr: trainer ? portrait(trainer.ch) : null, trSprX: 0, plSprX: 0, plFrame: 0,
    st: { me: newStages(), foe: newStages() }, part: new Set(), shake: 0, blink: null, ball: null, idle: false, partyInd: null, runs: 0, legend: o.legend, tutorial: o.tutorial,
  };
  MODE = 'battle';
  const L = pushUnder(drawBattle);
  UI.fade = 0;
  // slide in
  for (let i = 0; i <= 40; i++) { const k = 1 - Math.pow(1 - i / 40, 2); B.foeSlide = -200 * (1 - k); B.meSlide = -200 * (1 - k); if (B.wild) { B.foe = B.foeParty[0]; B.foeVis = true; B.foeHPd = B.foe.hp; } await tick(); }
  let result;
  if (B.wild) {
    B.foeWhite = null; AU.cry(B.foe.sp);
    G.seen[B.foe.sp] = true;
    for (let i = 0; i <= 10; i++) { B.foeBox = i / 10; await tick(); }
    await bsay(o.legend ? `${monName(B.foe)}が あらわれた！` : `あ！ やせいの ${monName(B.foe)}が とびだしてきた！`);
  } else {
    B.partyInd = 'foe';
    await bsay(`${trainer.name}が しょうぶを しかけてきた！`);
    B.partyInd = null;
    for (let i = 0; i <= 20; i++) { B.trSprX = i * 5; await tick(); }
    await sendOutFoe(0);
  }
  // player sends out
  const first = G.party.findIndex(m => m.hp > 0);
  B.partyInd = 'me';
  await wait(10); B.partyInd = null;
  await sendOutMe(first, true);
  result = await battleLoop();
  // end
  B.idle = false;
  const won = result === 'win' || result === 'caught' || result === 'run';
  G.lastResult = result;
  if (result === 'win' && trainer) {
    AU.bgm('victory');
    for (let i = 20; i >= 0; i--) { B.trSprX = i * 5; B.foeVis = false; await tick(); }
    await bsay(`${trainer.name}との しょうぶに かった！`);
    if (trainer.win) await bsay(trainer.win, { auto: 0 });
    const money = trainer.money || 100;
    G.money += money;
    await bsay(`ふーたんは ${money}えん もらった！`);
  }
  if (result === 'lose') {
    await bsay('ふーたんの てもとには たたかえる ふーモンが いない！', { auto: 0 });
    await bsay('ふーたんは めのまえが まっくらに なった！', { auto: 0 });
  }
  await fadeOut(16);
  popLayer(L); closeMsg();
  for (const m of G.party) { m.stg = null; }
  // evolution
  if (result !== 'lose') for (const m of G.party) if (m.evoReady && m.hp > 0) { m.evoReady = false; await evolve(m); }
  B = null; MODE = 'field';
  if (result === 'lose') {
    for (const m of G.party) healMon(m);
    loadMap(G.center.map, G.center.x, G.center.y, 'U');
    await fadeIn();
    await say('ふーモンたちは すっかり げんきに なった！ さあ もういちど がんばろう！');
    return false;
  }
  if (!o.keepMusic) AU.bgm(mapBgm());
  await fadeIn(12);
  return won;
}
async function sendOutFoe(i) {
  B.foe = B.foeParty[i]; B.foeHPd = B.foe.hp; B.st.foe = newStages(); B.foeDrop = 0;
  G.seen[B.foe.sp] = true;
  await bsay(`${B.trainer.name}は ${monName(B.foe)}を くりだした！`, { keep: true, auto: 0 });
  B.ball = { x: 200, y: 20, col: '#e83040' }; AU.sfx('throw');
  for (let i = 0; i <= 14; i++) { B.ball.x = lerp(200, 176, i / 14); B.ball.y = lerp(10, 60, i / 14) - Math.sin(i / 14 * Math.PI) * 10; await tick(); }
  AU.sfx('pop'); B.ball.open = 1; B.foeVis = true; B.foeScale = 0; B.foeWhite = '#ffffff';
  for (let i = 1; i <= 10; i++) { B.foeScale = i / 10; B.ball.open = 1 - i / 10; await tick(); }
  B.ball = null; B.foeWhite = null; AU.cry(B.foe.sp);
  for (let i = 0; i <= 10; i++) { B.foeBox = i / 10; await tick(); }
  closeMsg(); await wait(10);
}
async function sendOutMe(i, first) {
  B.me = G.party[i]; B.meIdx = i; B.meHPd = B.me.hp; B.meEXPd = B.me.exp; B.st.me = newStages(); B.meDrop = 0;
  B.part.add(B.me);
  B.me.stg = null;
  B.foeLock = false;
  if (first) {
    for (let f = 0; f < 3; f++) { B.plFrame = f; await wait(5); }
  }
  B.ball = { x: 40, y: 70 };
  AU.sfx('throw');
  const msg = say(`いけっ！ ${monName(B.me)}！`, { battle: true, keep: true });
  for (let k = 0; k <= 16; k++) { B.ball.x = lerp(40, 64, k / 16); B.ball.y = lerp(60, 92, k / 16) - Math.sin(k / 16 * Math.PI) * 24; if (first) B.plSprX = -k * 6; await tick(); }
  AU.sfx('pop'); B.ball.open = 1; B.meVis = true; B.meScale = 0; B.meWhite = '#ffffff';
  for (let k = 1; k <= 10; k++) { B.meScale = k / 10; B.ball.open = 1 - k / 10; if (first) B.plSprX -= 6; await tick(); }
  B.ball = null; B.meWhite = null; B.plSprX = -200; AU.cry(B.me.sp);
  await msg;
  for (let k = 0; k <= 10; k++) { B.meBox = k / 10; await tick(); }
  closeMsg();
  B.idle = true;
}
async function withdrawMe() {
  await bsay(`もどれ！ ${monName(B.me)}！`, { auto: 40 });
  B.meBox = 0; AU.sfx('throw');
  B.meWhite = '#f06070';
  for (let k = 10; k >= 0; k--) { B.meScale = k / 10; await tick(); }
  B.meVis = false; B.meWhite = null; B.meScale = 1;
}
async function battleLoop() {
  for (; ;) {
    // ------ player choice
    let act = null;
    while (!act) {
      B.idle = true;
      const m = B.me;
      await say(`${monName(m)}は\nどうする？`, { battle: true, keep: true, noVoice: true });
      const c = await choose(['たたかう', 'バッグ', 'ふーモン', 'にげる'], { x: 120, y: 114, w: 118, cols: 2, lh: 17, st: WS.menu, cancel: false });
      if (c === 0) {
        const mv = await chooseMove();
        if (mv != null) act = { k: 'move', mv };
      } else if (c === 1) {
        closeMsg();
        const r = await bagScreen({ battle: true });
        if (r) act = { k: 'item', ...r };
      } else if (c === 2) {
        closeMsg();
        const idx = await partyScreen({ mode: 'battle' });
        if (idx != null && idx >= 0) act = { k: 'switch', idx };
      } else if (c === 3) {
        closeMsg();
        if (B.legend) { await bsay('にげられない！ ルビドンを しずめなきゃ！', { auto: 0 }); continue; }
        if (B.trainer) { await bsay('だめだ！ しょうぶの さいちゅうに あいてに せなかを みせられない！', { auto: 0 }); continue; }
        AU.sfx('run');
        await bsay('うまく にげきれた！', { auto: 50 });
        return 'run';
      }
    }
    B.idle = false;
    closeMsg();
    // ------ foe choice
    const fmv = foeChoose();
    // ------ order
    const turnOrder = [];
    if (act.k !== 'move') {
      // switching / items go first
      const r = await doPlayerNonMove(act);
      if (r) return r;
      turnOrder.push(['foe', fmv, B.foe]);
    } else {
      const pm = MOVES[act.mv.id], fm = MOVES[fmv.id];
      const ps = effSpd('me'), fs = effSpd('foe');
      const meFirst = (pm.pri || 0) !== (fm.pri || 0) ? (pm.pri || 0) > (fm.pri || 0) : ps !== fs ? ps > fs : chance(0.5);
      if (meFirst) turnOrder.push(['me', act.mv, B.me], ['foe', fmv, B.foe]); else turnOrder.push(['foe', fmv, B.foe], ['me', act.mv, B.me]);
    }
    for (const [side, mv, ref] of turnOrder) {
      const user = side === 'me' ? B.me : B.foe; if (user !== ref || user.hp <= 0) continue;
      const tgt = side === 'me' ? B.foe : B.me; if (tgt.hp <= 0) continue;
      await useMove(side, mv);
      const r = await checkFaints(); if (r) return r;
      if (r === false) break;
    }
    // ------ end of turn status damage
    for (const side of ['me', 'foe']) {
      const m = side === 'me' ? B.me : B.foe;
      if (!m || m.hp <= 0) continue;
      if (m.st === 'やけど' || m.st === 'どく') {
        await bsay(`${who(side)}は ${m.st === 'やけど' ? 'やけどの' : 'どくの'} ダメージを うけている！`, { auto: 50 });
        await hitBlink(side, 10);
        m.hp = Math.max(0, m.hp - Math.max(1, Math.floor(m.maxhp / 8)));
        await animHP(side, m.hp);
        const r = await checkFaints(); if (r) return r;
      }
    }
  }
}
const who = side => side === 'me' ? monName(B.me) : (B.wild ? 'やせいの ' : 'あいての ') + monName(B.foe);
function effSpd(side) { const m = side === 'me' ? B.me : B.foe; return m.spd * stageMul(B.st[side].spd) * (m.st === 'まひ' ? 0.5 : 1); }
function foeChoose() {
  const m = B.foe; const usable = m.moves.filter(x => x.pp > 0);
  if (!usable.length) return { id: 'tackle', pp: 99 };
  const smart = B.trainer ? (B.trainer.music === 'boss' ? 0.9 : 0.6) : 0.35;
  const scored = usable.map(x => {
    const mv = MOVES[x.id];
    let s = mv.p ? mv.p * typeEff(mv.t, monTypes(B.me)) * (MON[m.sp].t.includes(mv.t) ? 1.5 : 1) : 35;
    if (mv.eff && mv.eff.st && B.me.st) s = 0;
    if (mv.eff && mv.eff.heal && m.hp > m.maxhp * 0.6) s = 0;
    if (mv.eff && mv.eff.self && B.st.foe[mv.eff.self] >= 2) s = 5;
    return [x, s * smart + 40 * (1 - smart) + rnd(0, 30)];
  });
  scored.sort((a, b) => b[1] - a[1]);
  return scored[0][0];
}
async function chooseMove() {
  const m = B.me;
  const effOf = mv => MOVES[mv.id].p ? typeEff(MOVES[mv.id].t, monTypes(B.foe)) : 1;
  const items = [0, 1, 2, 3].map(i => { const mv = m.moves[i]; return mv ? { t: MOVES[mv.id].n, dis: mv.pp <= 0, r: effOf(mv) > 1 ? '◎' : '' } : { t: '－', dis: true }; });
  let sel = 0;
  const info = pushLayer(() => {
    win(162, 114, 76, 44, WS.menu);
    const mv = m.moves[sel]; if (!mv) return;
    const d = MOVES[mv.id];
    txt('PP', 168, 120, '#303038', '#d0d0d8', 10); txt(`${mv.pp}/${d.pp}`, 230, 120, mv.pp ? '#303038' : '#e03838', '#d0d0d8', 10, 'right');
    ctx.fillStyle = TYPE_COL[d.t]; ctx.fillRect(166, 134, 66, 12);
    txt(d.t, 199, 134, '#fff', 'rgba(0,0,0,0.35)', 10, 'center');
    if (d.p) { const e = typeEff(d.t, monTypes(B.foe)); txt(e > 1 ? 'ばつぐん！' : e === 0 ? 'きかない' : e < 1 ? 'いまひとつ' : '', 199, 145, e > 1 ? '#e03838' : '#6070a0', null, 9, 'center'); }
  });
  closeMsg();
  if (m.moves.every(x => x.pp <= 0)) { popLayer(info); await bsay(`${monName(m)}は だせる わざが ない！`); return { id: 'tackle', pp: 99 }; }
  const r = await choose(items, { x: 2, y: 114, w: 160, cols: 2, lh: 17, st: WS.menu, onMove: s => sel = s, sz: 10 });
  popLayer(info);
  if (r < 0) return null;
  return m.moves[r];
}
async function doPlayerNonMove(act) {
  if (act.k === 'switch') {
    await withdrawMe();
    await sendOutMe(act.idx, false);
    return null;
  }
  if (act.k === 'item') {
    const it = ITEMS[act.item];
    if (it.ball) return await throwBall(act.item);
    G.bag[act.item]--;
    const m = G.party[act.target];
    await bsay(`ふーたんは ${it.n}を つかった！`, { auto: 40 });
    if (it.heal) { const before = m.hp; m.hp = Math.min(m.maxhp, m.hp + it.heal); if (m === B.me) { AU.sfx('heal'); await animHP('me', m.hp); } await bsay(`${monName(m)}の HPが ${m.hp - before} かいふくした！`, { auto: 50 }); }
    if (it.cure) { m.st = null; await bsay(`${monName(m)}は げんきに なった！`, { auto: 50 }); }
    if (it.revive) { m.hp = Math.floor(m.maxhp / 2); await bsay(`${monName(m)}は げんきを とりもどした！`, { auto: 50 }); }
    return null;
  }
}
async function throwBall(key) {
  const it = ITEMS[key];
  G.bag[key]--;
  if (B.legend === 'nocatch') { await bsay('……ボールが はじかれた！ いまは つかまえられないみたい！'); return null; }
  await say(`ふーたんは ${it.n}を なげた！`, { battle: true, keep: true });
  const col = key === 'great' ? '#3878e8' : key === 'ultra' ? '#f0c020' : '#e83040';
  B.ball = { x: 40, y: 90, col }; AU.sfx('throw');
  for (let k = 0; k <= 20; k++) { B.ball.x = lerp(40, 176, k / 20); B.ball.y = lerp(90, 40, k / 20) - Math.sin(k / 20 * Math.PI) * 40; await tick(); }
  AU.sfx('pop'); B.ball.open = 1; B.foeWhite = '#ff7090';
  for (let k = 10; k >= 0; k--) { B.foeScale = k / 10; B.ball.open = k / 10; await tick(); }
  B.foeVis = false; B.foeWhite = null;
  for (let k = 0; k <= 12; k++) { B.ball.y = lerp(40, 66, k / 12); await tick(); }
  // catch calc
  const m = B.foe, cr = MON[m.sp].cr;
  const stb = m.st === 'ねむり' ? 2 : m.st ? 1.5 : 1;
  let a = (3 * m.maxhp - 2 * m.hp) * cr * it.ball / (3 * m.maxhp) * stb * 1.6;
  if (B.legend) a = Math.max(a, 8 * it.ball * (1 + (1 - m.hp / m.maxhp) * 2));
  let shakes = 0;
  if (a >= 255) shakes = 4; else { const b = 1048560 / Math.sqrt(Math.sqrt(16711680 / a)); while (shakes < 4 && Math.random() * 65536 < b) shakes++; }
  for (let s = 0; s < Math.min(3, shakes); s++) {
    await wait(20); AU.sfx('shake');
    for (let k = 0; k < 12; k++) { B.ball.rot = Math.sin(k / 12 * Math.PI * 2) * 3; await tick(); }
    B.ball.rot = 0;
  }
  await wait(20);
  closeMsg();
  if (shakes >= 4) {
    AU.sfx('click');
    for (let i = 0; i < 6; i++) { fxAdd({ k: 'star', x: 176 + rnd(-10, 10), y: 60, vy: -1, s: 3, c: '#fff8a0', life: 20, fade: true }); }
    await wait(20);
    AU.stopBgm(); AU.jingle('caught');
    await bsay(`やったー！ ${monName(m)}を つかまえたぞ！`, { auto: 150 });
    const first = !G.caught[m.sp];
    G.caught[m.sp] = true; G.seen[m.sp] = true;
    if (first) { await bsay(`${monName(m)}の データが あたらしく ふーモンずかんに とうろく された！`, { auto: 0 }); await dexPage(m.sp); }
    m.st = null; m.stg = null;
    if (G.party.length < 6) G.party.push(m);
    else { G.box.push(m); await bsay(`${monName(m)}は パソコンの ボックスへ おくられた！`, { auto: 0 }); }
    B.ball = null;
    return 'caught';
  }
  AU.sfx('breakout');
  B.ball = null; B.foeVis = true; B.foeScale = 1;
  await bsay(['ああ！ ふーモンが ボールから でてしまった！', 'ああっ！ もうすこしで つかまえられたのに！', 'ざんねん！ あと ちょっとだったのに！'][Math.min(2, shakes)], { auto: 60 });
  return null;
}
async function useMove(side, mvSlot) {
  const user = side === 'me' ? B.me : B.foe, tgt = side === 'me' ? B.foe : B.me, tSide = side === 'me' ? 'foe' : 'me';
  const mv = MOVES[mvSlot.id];
  // status gate
  if (user.st === 'ねむり') {
    user.sleep = (user.sleep ?? rint(1, 3)) - 1;
    if (user.sleep < 0) { user.st = null; user.sleep = null; await bsay(`${who(side)}は めを さました！`, { auto: 50 }); }
    else { await bsay(`${who(side)}は ぐうぐう ねむっている……`, { auto: 50 }); return; }
  }
  if (user.st === 'まひ' && chance(0.25)) { await bsay(`${who(side)}は からだが しびれて うごけない！`, { auto: 50 }); return; }
  mvSlot.pp = Math.max(0, mvSlot.pp - 1);
  await bsay(`${who(side)}の ${mv.n}！`, { auto: 34 });
  // accuracy
  if (mv.a) {
    const acc = mv.a / 100 * stageMul(B.st[side].acc);
    if (Math.random() > acc) { await wait(6); AU.sfx('miss'); await bsay(`しかし ${who(tSide)}には あたらなかった！`, { auto: 50 }); return; }
  }
  await playFx(mv.fx, side);
  if (mv.p > 0) {
    const eff = typeEff(mv.t, monTypes(tgt));
    if (eff === 0) { await bsay(`${who(tSide)}には こうかが ないみたいだ……`, { auto: 50 }); return; }
    const crit = chance(mv.crit ? 1 / 8 : 1 / 16);
    const A = user.atk * stageMul(B.st[side].atk) * (user.st === 'やけど' ? 0.5 : 1);
    const D = tgt.def * stageMul(B.st[tSide].def);
    let dmg = Math.floor(Math.floor(Math.floor(2 * user.lv / 5 + 2) * mv.p * A / D) / 50) + 2;
    dmg = Math.floor(dmg * (MON[user.sp].t.includes(mv.t) ? 1.5 : 1) * eff * rnd(0.85, 1) * (crit ? 1.5 : 1));
    if (side === 'foe' && !B.trainer && !B.legend) dmg = Math.floor(dmg * 0.9);
    if (side === 'foe' && B.tutorial) dmg = Math.floor(dmg * 0.3);
    if (side === 'foe' && B.trainer) dmg = Math.floor(dmg * 0.85);
    dmg = Math.max(1, dmg);
    AU.sfx(eff > 1 ? 'superhit' : eff < 1 ? 'weakhit' : 'hit');
    await hitBlink(tSide, 16);
    tgt.hp = Math.max(0, tgt.hp - dmg);
    await animHP(tSide, tgt.hp);
    if (crit) await bsay('きゅうしょに あたった！', { auto: 45 });
    if (eff > 1) await bsay('こうかは ばつぐんだ！', { auto: 45 });
    if (eff < 1) await bsay('こうかは いまひとつの ようだ……', { auto: 45 });
    if (mv.eff && mv.eff.drain && user.hp > 0) {
      const h = Math.max(1, Math.floor(dmg * mv.eff.drain)); user.hp = Math.min(user.maxhp, user.hp + h);
      await animHP(side, user.hp); await bsay(`${who(tSide)}から たいりょくを すいとった！`, { auto: 45 });
    }
    if (tgt.hp <= 0) return;
  }
  const ef = mv.eff; if (!ef) return;
  if (mv.p > 0 && ef.ch != null && !chance(ef.ch)) return;
  if (ef.heal) {
    if (user.hp >= user.maxhp) { await bsay('しかし HPは まんタンだ！', { auto: 45 }); return; }
    user.hp = Math.min(user.maxhp, user.hp + Math.floor(user.maxhp * ef.heal)); await animHP(side, user.hp);
    await bsay(`${who(side)}の たいりょくが かいふくした！`, { auto: 45 });
  }
  if (ef.st) {
    if (tgt.st) { if (!mv.p) await bsay('しかし うまく きまらなかった！', { auto: 45 }); return; }
    if (ef.st === 'やけど' && monTypes(tgt).includes('ほのお')) return;
    if (ef.st === 'まひ' && monTypes(tgt).includes('でんき')) return;
    tgt.st = ef.st; if (ef.st === 'ねむり') tgt.sleep = rint(1, 3);
    AU.sfx('down');
    const txtS = { 'まひ': 'まひして わざが でにくくなった！', 'やけど': 'やけどを おった！', 'ねむり': 'ねむって しまった！', 'どく': 'どくを あびた！' }[ef.st];
    await bsay(`${who(tSide)}は ${txtS}`, { auto: 50 });
  }
  const statChange = async (s, stat, d) => {
    const st = B.st[s];
    if ((d > 0 && st[stat] >= 6) || (d < 0 && st[stat] <= -6)) { await bsay(`${who(s)}の ${STAT_N[stat]}は もう ${d > 0 ? 'あがらない' : 'さがらない'}！`, { auto: 45 }); return; }
    st[stat] = clamp(st[stat] + d, -6, 6);
    AU.sfx(d > 0 ? 'up' : 'down');
    if (d < 0) { const p = s === 'me' ? ME_C : FOE_C; for (let i = 0; i < 8; i++) fxAdd({ k: 'sq', x: p[0] + rnd(-16, 16), y: p[1] - 20, vy: 1.5, s: 2, c: '#7090f0', life: 18 }); await fxWait(); }
    await bsay(`${who(s)}の ${STAT_N[stat]}が ${Math.abs(d) > 1 ? 'ぐーんと ' : ''}${d > 0 ? 'あがった' : 'さがった'}！`, { auto: 45 });
  };
  if (ef.self) await statChange(side, ef.self, ef.d);
  if (ef.foe) await statChange(tSide, ef.foe, ef.d);
}
async function faintAnim(side) {
  const m = side === 'me' ? B.me : B.foe;
  AU.cry(m.sp, 0.7); await wait(20); AU.sfx('faint');
  for (let i = 0; i <= 16; i++) { B[side + 'Drop'] = i * 5; await tick(); }
  B[side + 'Vis'] = false; B[side + 'Drop'] = 0; B[side + 'Box'] = 0;
  await bsay(`${who(side)}は たおれた！`, { auto: 55 });
}
// returns 'win' | 'lose' | null
async function checkFaints() {
  if (B.foe.hp <= 0 && B.foeVis) {
    await faintAnim('foe');
    await gainExp();
    const next = B.foeParty.findIndex(m => m.hp > 0);
    if (next < 0) return 'win';
    await sendOutFoe(next);
  }
  if (B.me.hp <= 0 && B.meVis) {
    await faintAnim('me');
    if (!G.party.some(m => m.hp > 0)) return 'lose';
    if (B.foe.hp <= 0 && !B.foeParty.some(m => m.hp > 0)) return 'win';
    const idx = await partyScreen({ mode: 'battle', forced: true });
    await sendOutMe(idx, false);
    return false;
  }
  return null;
}
async function gainExp() {
  const f = B.foe; const base = MON[f.sp].xp * f.lv / 7 * (B.trainer ? 1.5 : 1) * 2;
  const parts = [...B.part].filter(m => m.hp > 0 && G.party.includes(m));
  for (const m of G.party) {
    if (m.hp <= 0 || m.lv >= 100) continue;
    const isP = parts.includes(m);
    const gain = Math.max(1, Math.floor(isP ? base : base * 0.5));
    if (isP) await bsay(`${monName(m)}は ${gain} けいけんちを もらった！`, { auto: 45 });
    await addExp(m, gain, isP);
  }
  if (!parts.length) { }
  if (!B.shareMsg && G.party.some(m => !parts.includes(m) && m.hp > 0)) B.shareMsg = true, await bsay('ほかの ふーモンたちも みんなで いっしょに けいけんちを もらった！', { auto: 45 });
  B.part = new Set([B.me]);
}
async function addExp(m, gain, show) {
  const target = m.exp + gain;
  while (m.exp < target) {
    const next = expFor(m.lv + 1);
    const to = Math.min(target, next);
    if (show && m === B.me) { AU.sfx('exp'); const st = B.meEXPd; for (let i = 1; i <= 20; i++) { B.meEXPd = lerp(st, to, i / 20); await tick(); } }
    m.exp = to;
    if (m.exp >= next) await levelUp(m, show && m === B.me);
  }
  if (m === B?.me) B.meEXPd = m.exp;
}
async function levelUp(m, onField) {
  const old = { hp: m.maxhp, atk: m.atk, def: m.def, spd: m.spd };
  m.lv++; calcStats(m);
  if (m === B.me) { B.meHPd = m.hp; B.meEXPd = expFor(m.lv); }
  AU.jingle('level');
  await bsay(`${monName(m)}は レベル ${m.lv} に あがった！`, { auto: 0 });
  if (m === B.me) {
    const L = pushLayer(() => {
      win(120, 18, 118, 74, WS.menu);
      [['HP', 'hp', 'maxhp'], ['こうげき', 'atk', 'atk'], ['ぼうぎょ', 'def', 'def'], ['すばやさ', 'spd', 'spd']].forEach(([n, k, k2], i) => {
        txt(n, 130, 26 + i * 15); txt('+' + (m[k2] - old[k]), 228, 26 + i * 15, '#e03838', '#d0d0d8', 11, 'right');
      });
    });
    await waitOK(); popLayer(L);
  }
  // learn moves
  for (const [l, id] of MON[m.sp].mv) if (l === m.lv) await learnMove(m, id, true);
  const ev = MON[m.sp].evo; if (ev && m.lv >= ev[0]) m.evoReady = true;
}
async function learnMove(m, id, battleStyle) {
  const s = battleStyle ? bsay : say;
  const opt = battleStyle ? { auto: 0 } : {};
  if (m.moves.some(x => x.id === id)) return;
  const nm = MOVES[id].n;
  if (m.moves.length < 4) { m.moves.push({ id, pp: MOVES[id].pp }); AU.jingle('level'); await s(`${monName(m)}は あたらしく ${nm}を おぼえた！`, opt); return; }
  for (; ;) {
    await s(`${monName(m)}は あたらしく ${nm}を おぼえたい……`, opt);
    await s(`でも わざを 4つ おぼえるので せいいっぱいだ！`, opt);
    await s(`${nm}の かわりに ほかの わざを わすれさせますか？`, Object.assign({ keep: true }, opt));
    if (await yesno()) {
      closeMsg();
      const r = await choose(m.moves.map(x => MOVES[x.id].n).concat([nm]), { x: 120, y: 10, w: 116 });
      if (r >= 0 && r < 4) {
        const oldN = MOVES[m.moves[r].id].n;
        await s('1 2の …… ポカン！', opt);
        await s(`${monName(m)}は ${oldN}の つかいかたを きれいに わすれた！ そして……`, opt);
        m.moves[r] = { id, pp: MOVES[id].pp };
        AU.jingle('level');
        await s(`${monName(m)}は あたらしく ${nm}を おぼえた！`, opt);
        return;
      }
    }
    await s(`${nm}を おぼえるのを あきらめますか？`, Object.assign({ keep: true }, opt));
    if (await yesno()) { closeMsg(); await s(`${monName(m)}は ${nm}を おぼえずに おわった！`, opt); return; }
    closeMsg();
  }
}
// ---------------------------------------------------------------- evolution
async function evolve(m) {
  const from = m.sp, to = MON[from].evo[1];
  MODE = 'evo';
  let cur = from, white = 0, sc = 1;
  const L = pushUnder(() => {
    ctx.fillStyle = '#101828'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + frame * 0.01; ctx.fillStyle = i % 2 ? '#283858' : '#1c2840'; ctx.beginPath(); ctx.moveTo(120, 56); ctx.arc(120, 56, 200, a, a + Math.PI / 24); ctx.fill(); }
    const img = monImg(cur); const s = 64 * sc;
    ctx.drawImage(white > 0 ? tintC(img, '#ffffff') : img, 120 - s / 2, 88 - s, s, s);
  });
  UI.fade = 0; AU.stopBgm();
  await say(`おや……？ ${monName(m)}の ようすが……！`, { keep: true });
  AU.cry(from); await wait(40);
  AU.jingle('evo');
  white = 1;
  for (let i = 0; i < 14; i++) {
    const n = Math.max(3, 16 - i);
    cur = to; sc = 0.95; await wait(n); cur = from; sc = 1; await wait(n);
    if (i % 3 === 0) AU.sfx('sel');
  }
  cur = to; UI.flash = 1; await wait(30); white = 0;
  const oldName = monName(m);
  m.sp = to; calcStats(m); G.seen[to] = true; G.caught[to] = true;
  AU.cry(to);
  AU.jingle('caught');
  await say(`おめでとう！ ${oldName}は ${MON[to].name}に しんかした！`);
  for (const [l, id] of MON[to].mv) if (l === m.lv) await learnMove(m, id, false);
  popLayer(L); UI.fade = 1;
  MODE = 'field';
}
