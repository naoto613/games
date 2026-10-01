// ================================================================ characters (overworld 16x24 + battle portraits 64x64)
const CH = {
  futan: { skin: '#fcd8b8', hair: '#3a2418', hs: 'pig', hat: { t: 'bandana', c: '#e02848' }, top: '#f05070', bot: '#3a4a8a', skirt: true, shoes: '#e02848', rib: '#ff7aa8' },
  mom: { skin: '#fcd8b8', hair: '#8a4a28', hs: 'long', top: '#f0a040', bot: '#5a6ab0', skirt: true, apron: '#ffffff', big: true },
  ricky: { skin: '#fce0c8', hair: '#5a3a20', hs: 'baby', top: '#78c8f0', bot: '#f8f8f8', small: true },
  prof: { skin: '#f0c8a0', hair: '#6a4020', hs: 'short', top: '#4a8ad0', bot: '#5a4a3a', coat: '#f4f4f4', big: true, beard: true },
  sota: { skin: '#fcd8b8', hair: '#5a3018', hs: 'short', hat: { t: 'cap', c: '#38a860' }, top: '#3888e0', bot: '#303848', shoes: '#e05030' },
  nurse: { skin: '#fcd8b8', hair: '#f070a0', hs: 'pig', hat: { t: 'nurse', c: '#ffffff' }, top: '#f8a0c0', bot: '#ffffff', skirt: true, big: true, rib: '#f070a0' },
  clerk: { skin: '#f0c8a0', hair: '#303030', hs: 'short', hat: { t: 'cap', c: '#3858c8' }, top: '#4878e0', bot: '#303848', big: true },
  grunt: { skin: '#f0c8a0', hair: '#303030', hs: 'short', hat: { t: 'hood', c: '#d02838' }, top: '#d02838', bot: '#282028', big: true, belt: '#f0c020' },
  gruntF: { skin: '#f0c8a0', hair: '#303030', hs: 'long', hat: { t: 'hood', c: '#d02838' }, top: '#d02838', bot: '#282028', skirt: true, big: true, belt: '#f0c020' },
  boss: { skin: '#e8b890', hair: '#202020', hs: 'short', hat: { t: 'hood', c: '#a01828' }, top: '#a01828', bot: '#181018', coat: '#282028', big: true, beard: true, belt: '#f0c020' },
  gorota: { skin: '#e8b890', hair: '#6a4020', hs: 'short', hat: { t: 'cap', c: '#a07850' }, top: '#c09060', bot: '#5a4a3a', big: true, beard: true },
  pikari: { skin: '#fcd8b8', hair: '#f8d030', hs: 'spiky', top: '#2a2a3a', bot: '#f0c020', skirt: true, big: true },
  homura: { skin: '#f8d0b0', hair: '#e83820', hs: 'pony', top: '#f8f8f8', bot: '#3a3a4a', big: true, rib: '#f8d040' },
  ruri: { skin: '#fcd8b8', hair: '#3858c8', hs: 'long', top: '#f0f0ff', bot: '#3858c8', coat: '#3858c8', skirt: true, big: true },
  boy: { skin: '#fcd8b8', hair: '#3a2418', hs: 'short', hat: { t: 'cap', c: '#e05030' }, top: '#f0d040', bot: '#3a5ab0' },
  girl: { skin: '#fcd8b8', hair: '#c06830', hs: 'pig', top: '#a070e0', bot: '#f8f8f8', skirt: true, rib: '#f8f8f8' },
  lass: { skin: '#fcd8b8', hair: '#f0c060', hs: 'long', top: '#f8a0b8', bot: '#f8f8f8', skirt: true, big: true },
  oldman: { skin: '#f0c8a0', hair: '#d0d0d0', hs: 'bald', top: '#a08060', bot: '#5a5048', big: true, beard: true },
  oldlady: { skin: '#f0c8a0', hair: '#e0e0e8', hs: 'bun', top: '#b078a0', bot: '#6a4a6a', skirt: true, big: true },
  fisher: { skin: '#e8b890', hair: '#3a2418', hs: 'short', hat: { t: 'cap', c: '#f0e8c0' }, top: '#48a0a0', bot: '#3a4a5a', big: true },
  hiker: { skin: '#e8b890', hair: '#5a3018', hs: 'short', hat: { t: 'cap', c: '#6a8a40' }, top: '#a06030', bot: '#5a4a3a', big: true, beard: true },
  bug: { skin: '#fcd8b8', hair: '#3a2418', hs: 'short', hat: { t: 'straw', c: '#f0d070' }, top: '#78c060', bot: '#6a5040' },
  sailor: { skin: '#e8b890', hair: '#303030', hs: 'short', hat: { t: 'sailor', c: '#ffffff' }, top: '#ffffff', bot: '#3050a0', big: true },
  miner: { skin: '#e8b890', hair: '#303030', hs: 'short', hat: { t: 'helmet', c: '#f0c020' }, top: '#6a7a8a', bot: '#4a4a5a', big: true },
  scientist: { skin: '#f0c8a0', hair: '#303030', hs: 'short', top: '#a0b0c0', bot: '#4a4a5a', coat: '#f4f4f4', big: true, glasses: true },
};

// ---------- overworld sprite (16x24, feet at bottom row)
function owFrame(o, dir, fr) {
  const p = new Pix(16, 24);
  const sm = o.small, big = o.big;
  const by = sm ? 8 : big ? 0 : 2;          // head top offset
  const legY = 19, legH = 4;
  const sk = o.skin, hair = o.hair;
  const swing = fr === 1 ? 1 : fr === 2 ? -1 : 0;
  // legs
  if (!sm) {
    const lc = o.skirt ? o.skin : o.bot;
    if (dir === 'L') {
      p.part(R(6 - swing, legY, 3, legH), lc, { flat: true }); p.part(R(8 + swing, legY, 3, legH), shade(lc, 0.85), { flat: true });
      p.rect(6 - swing, 22, 3, 2, o.shoes || '#584038'); p.rect(8 + swing, 22, 3, 2, o.shoes || '#584038');
    } else {
      const l1 = fr === 1 ? 1 : 0, l2 = fr === 2 ? 1 : 0;
      p.part(R(5, legY, 3, legH - l1), lc, { flat: true }); p.part(R(9, legY, 3, legH - l2), lc, { flat: true });
      p.rect(5, 22 - l1, 3, 2, o.shoes || '#584038'); p.rect(9, 22 - l2, 3, 2, o.shoes || '#584038');
    }
  } else {
    p.part(E(8, 21, 4, 2.5), o.bot, { flat: true });
  }
  // body
  const ty = sm ? 16 : big ? 11 : 13, th = sm ? 5 : big ? 9 : 7;
  if (o.coat) p.part(R(3, ty, 10, th + 1), o.coat, { flat: true });
  p.part(RR(4, ty, 8, th, 1), o.top, { hiT: 2, loT: -0.6 });
  if (o.apron) p.part(R(6, ty + 2, 4, th - 1), o.apron, { flat: true, ol: '#a0a0a0' });
  if (o.belt) p.hline(5, 11, ty + th - 2, o.belt);
  if (o.skirt) p.part(P(4, ty + th - 2, 12, ty + th - 2, 13, ty + th + 2, 3, ty + th + 2), o.bot, { hiT: 2 });
  else if (!sm) p.part(R(5, ty + th - 1, 7, 2), o.bot, { flat: true });
  // arms
  if (dir === 'L') {
    p.part(R(7 + swing, ty + 1, 3, 5), shade(o.coat || o.top, 0.9), { flat: true }); p.px(8 + swing, ty + 6, sk);
  } else if (!sm) {
    p.part(R(2, ty + 1 - (fr === 1 ? 1 : 0), 2, 5), o.coat || o.top, { flat: true }); p.px(2, ty + 6 - (fr === 1 ? 1 : 0), sk);
    p.part(R(12, ty + 1 - (fr === 2 ? 1 : 0), 2, 5), o.coat || o.top, { flat: true }); p.px(13, ty + 6 - (fr === 2 ? 1 : 0), sk);
  }
  // head
  const hx = 8, hy = by + 6, hr = sm ? 4.6 : 5.6;
  const bob = 0;
  if (o.hs === 'long' && dir !== 'D') p.part(R(3, hy, 10, 9), hair, { flat: true });
  if (o.hs === 'long' && dir === 'D') { p.part(R(2, hy, 3, 8), hair, { flat: true }); p.part(R(11, hy, 3, 8), hair, { flat: true }); }
  if (o.hs === 'pony' && dir !== 'D') p.part(E(dir === 'L' ? 13 : 8, hy + 5, 2.5, 4), hair);
  if (o.hs === 'pig') {
    const rc = o.rib || '#ff7aa8';
    if (dir === 'L') { p.part(E(12.5, hy + 3, 2.3, 3), hair); p.px(12, hy - 0, rc); p.px(13, hy, rc); }
    else { p.part(E(2, hy + 3, 2.2, 3), hair); p.part(E(14, hy + 3, 2.2, 3), hair); p.px(3, hy - 0, rc); p.px(13, hy, rc); p.px(2, hy, rc); p.px(14, hy, rc); }
  }
  p.part(E(hx, hy, hr, hr - 0.4 + bob), sk, { ol: shade(sk, 0.45), hiT: 2, loT: -0.75 });
  // hair cap
  if (o.hs !== 'bald') {
    if (dir === 'U') p.part(E(hx, hy - 0.5, hr + 0.3, hr), hair);
    else if (dir === 'L') { p.part(U(E(hx + 1, hy - 1.5, hr, hr - 1.6), R(hx, hy - 2, hr + 1, hr + 1)), hair); }
    else p.part(U(E(hx, hy - 2, hr + 0.2, hr - 2.2), R(hx - hr, hy - 2, 2, 4), R(hx + hr - 2, hy - 2, 2, 4)), hair);
  } else if (dir !== 'D') p.part(E(hx, hy + 1, hr, hr - 2), hair);
  if (o.hs === 'spiky') { p.part(P(3, hy - 3, 5, hy - 8, 7, hy - 4, 9, hy - 9, 11, hy - 4, 13, hy - 7, 13, hy - 1), hair); }
  if (o.hs === 'bun') p.part(E(hx, hy - hr, 2.5), hair);
  if (o.hs === 'baby') p.px(hx, hy - hr, hair);
  // face
  if (dir === 'D') {
    const ey = hy + 1;
    p.rect(hx - 3, ey, 1, 2, '#202028'); p.rect(hx + 2, ey, 1, 2, '#202028');
    if (o.glasses) { p.hline(hx - 4, hx + 3, ey, '#404040'); }
    if (o.beard) { p.part(E(hx, hy + 4, 3, 1.6), o.hair === '#d0d0d0' ? '#e8e8e8' : shade(o.hair, 0.9), { flat: true }); }
    else p.px(hx - 1 + (sm ? 0 : 0), hy + 3, '#e88080');
  } else if (dir === 'L') {
    p.rect(hx - 4, hy + 1, 1, 2, '#202028');
    if (o.beard) p.part(E(hx - 3, hy + 4, 2, 1.4), shade(o.hair === '#d0d0d0' ? '#e8e8e8' : o.hair, 0.9), { flat: true });
  }
  // hats
  if (o.hat) {
    const c = o.hat.c;
    if (o.hat.t === 'bandana') {
      if (dir === 'U') p.part(E(hx, hy - 2.5, hr + 0.4, 3.4), c);
      else p.part(U(E(hx + (dir === 'L' ? 1 : 0), hy - 3, hr + 0.4, 3), R(hx - hr, hy - 3, hr * 2 + 1, 2)), c);
      if (dir !== 'D') { p.px(dir === 'L' ? 14 : 7, hy - 1, c); p.px(dir === 'L' ? 15 : 9, hy, c); }
      p.px(hx - 2, hy - 4, '#ffffff'); p.px(hx + 2, hy - 3, '#ffffff');
    } else if (o.hat.t === 'cap' || o.hat.t === 'helmet' || o.hat.t === 'sailor') {
      p.part(E(hx, hy - 2.5, hr + 0.3, 3.6), c);
      if (dir === 'D') p.part(R(hx - 4, hy - 1, 9, 2), shade(c, 0.85), { flat: true });
      if (dir === 'L') p.part(R(hx - 7, hy - 1, 5, 2), shade(c, 0.85), { flat: true });
      if (o.hat.t === 'helmet') p.px(hx, hy - 4, '#ffffff');
    } else if (o.hat.t === 'hood') {
      p.part(U(E(hx, hy - 1.5, hr + 1, hr - 0.5), P(hx - 5, hy - 4, hx - 6, hy - 10, hx - 2, hy - 5), P(hx + 5, hy - 4, hx + 6, hy - 10, hx + 2, hy - 5)), c);
      if (dir === 'D') { p.part(E(hx, hy + 1.5, hr - 1.6, hr - 2.6), o.skin, { flat: true }); p.rect(hx - 3, hy + 1, 1, 2, '#202028'); p.rect(hx + 2, hy + 1, 1, 2, '#202028'); }
      if (dir === 'L') { p.part(E(hx - 2, hy + 1.5, 3, 3), o.skin, { flat: true }); p.rect(hx - 4, hy + 1, 1, 2, '#202028'); }
    } else if (o.hat.t === 'nurse') {
      p.part(R(hx - 3, hy - hr - 1, 7, 3), c, { flat: true, ol: '#c0a0b0' }); p.px(hx, hy - hr, '#f04870');
    } else if (o.hat.t === 'straw') {
      p.part(E(hx, hy - 3, hr + 2.5, 2), c); p.part(E(hx, hy - 4, hr - 1.5, 2.5), c);
    }
  }
  return p.canvas();
}
const OW = {};
function owSprites(key) {
  if (OW[key]) return OW[key];
  const o = CH[key]; const s = {};
  for (const d of ['D', 'U', 'L']) s[d] = [0, 1, 2].map(f => owFrame(o, d, f));
  s.R = s.L.map(flipH);
  return OW[key] = s;
}

// ---------- battle portraits (64x64 front view, upper body)
const PORT = {};
function portrait(key) {
  if (PORT[key]) return PORT[key];
  const o = CH[key]; const p = new Pix(64, 64);
  const sk = o.skin, hair = o.hair, hx = 32, hy = 22, hr = 13;
  // back hair
  if (o.hs === 'long') p.part(RR(16, 14, 32, 34, 8), hair);
  if (o.hs === 'pony') p.part(E(46, 26, 6, 12), hair);
  if (o.hs === 'pig') { p.part(E(13, 30, 6, 9), hair); p.part(E(51, 30, 6, 9), hair); const rc = o.rib || '#ff7aa8'; p.part(E(17, 20, 3.5, 2.5), rc); p.part(E(47, 20, 3.5, 2.5), rc); }
  // body
  if (o.coat) p.part(P(10, 64, 14, 40, 50, 40, 54, 64), o.coat);
  p.part(P(14, 64, 18, 40, 46, 40, 50, 64), o.top);
  if (o.apron) p.part(R(24, 44, 16, 20), o.apron);
  if (o.belt) p.rect(18, 56, 28, 3, o.belt);
  p.part(E(hx, 40, 6, 3), sk);
  // head
  p.part(E(hx, hy, hr, hr - 1), sk, { ol: shade(sk, 0.45), hiT: 2, loT: -0.7 });
  p.part(E(hx - hr, hy + 1, 2.5, 3.5), sk); p.part(E(hx + hr, hy + 1, 2.5, 3.5), sk);
  if (o.hs !== 'bald') p.part(U(E(hx, hy - 6, hr + 1, hr - 5), R(hx - hr - 1, hy - 7, 4, 10), R(hx + hr - 3, hy - 7, 4, 10)), hair);
  else p.part(E(hx, hy - 9, hr - 3, 3), hair);
  if (o.hs === 'spiky') p.part(P(16, 14, 18, 0, 24, 9, 30, -2, 36, 8, 44, 0, 46, 10, 50, 4, 48, 18), hair);
  if (o.hs === 'bun') p.part(E(hx, 4, 6), hair);
  // face
  p.eye(hx - 6, hy + 2, 2.6); p.eye(hx + 6, hy + 2, 2.6);
  if (o.glasses) { p.part(R(hx - 10, hy - 1, 8, 6), '#ffffff', { flat: true, ol: '#404040' }); p.part(R(hx + 2, hy - 1, 8, 6), '#ffffff', { flat: true, ol: '#404040' }); p.eye(hx - 6, hy + 2, 1.6); p.eye(hx + 6, hy + 2, 1.6); }
  p.px(hx - 9, hy + 6, '#f09090'); p.px(hx + 9, hy + 6, '#f09090'); p.px(hx - 8, hy + 6, '#f09090'); p.px(hx + 8, hy + 6, '#f09090');
  if (o.beard) p.part(E(hx, hy + 9, 8, 4), o.hs === 'bald' ? '#e8e8e8' : shade(hair, 0.95));
  else { p.hline(hx - 2, hx + 2, hy + 8, '#a04040'); p.px(hx - 3, hy + 7, '#a04040'); p.px(hx + 3, hy + 7, '#a04040'); }
  if (o.hat) {
    const c = o.hat.c;
    if (o.hat.t === 'bandana') { p.part(U(E(hx, hy - 9, hr + 1, 7), R(hx - hr - 1, hy - 9, hr * 2 + 3, 4)), c); p.part(E(hx - 5, hy - 12, 2), '#ffffff', { flat: true, noOl: true }); p.part(E(hx + 6, hy - 10, 1.5), '#ffffff', { flat: true, noOl: true }); }
    if (o.hat.t === 'cap' || o.hat.t === 'helmet' || o.hat.t === 'sailor') { p.part(E(hx, hy - 9, hr + 1, 8), c); p.part(R(hx - 14, hy - 4, 28, 4), shade(c, 0.8)); }
    if (o.hat.t === 'hood') { p.part(Sub(U(E(hx, hy - 1, hr + 4, hr + 3), P(18, 10, 12, -4, 25, 6), P(46, 10, 52, -4, 39, 6)), E(hx, hy + 3, hr - 3, hr - 4)), c); }
    if (o.hat.t === 'nurse') { p.part(R(hx - 8, 2, 16, 7), '#ffffff', { ol: '#c0a0b0' }); p.part(R(hx - 1, 3, 3, 5), '#f04870', { noOl: true, flat: true }); }
    if (o.hat.t === 'straw') p.part(E(hx, hy - 9, hr + 8, 5), c);
  }
  return PORT[key] = p.canvas();
}

// ---------- player back sprite for battle (ふーたん from behind), 3 frames: idle / wind-up / throw
let FUTAN_BACK = null;
function futanBack() {
  if (FUTAN_BACK) return FUTAN_BACK;
  const o = CH.futan;
  FUTAN_BACK = [0, 1, 2].map(f => {
    const p = new Pix(64, 64);
    const hx = 30, hy = 26;
    if (f === 1) { p.part(P(44, 48, 50, 26, 56, 28, 51, 50), o.top); p.part(E(53, 24, 4), o.skin); p.part(E(55, 18, 4.5), '#f04050', { hi: '#ffa0a0' }); p.hline(51, 59, 18, '#202020'); }
    p.part(P(6, 64, 11, 47, 49, 47, 54, 64), o.top);
    p.part(R(22, 44, 16, 5), o.skin, { flat: true });
    p.part(E(hx - 17, hy + 9, 5, 8.5), o.hair); p.part(E(hx + 17, hy + 9, 5, 8.5), o.hair);
    p.part(E(hx - 15, hy + 1, 3.5, 2.6), o.rib); p.part(E(hx + 15, hy + 1, 3.5, 2.6), o.rib);
    p.part(E(hx, hy, 15, 15), o.hair, { hi: '#6a4a38' });
    for (const dx of [-8, -3, 3, 8]) p.line(hx + dx, hy + 2, hx + dx * 1.15, hy + 13, '#2a1a10');
    p.part(Sub(E(hx, hy - 1, 16, 15), R(0, hy - 4, 64, 64)), o.hat.c);
    p.part(P(hx - 2, hy - 5, hx + 2, hy - 5, hx + 6, hy + 6, hx + 1, hy + 4), o.hat.c);
    p.part(P(hx - 2, hy - 5, hx - 1, hy + 4, hx - 6, hy + 5), shade(o.hat.c, 0.9));
    for (const [x, y] of [[hx - 8, hy - 9], [hx + 3, hy - 12], [hx + 9, hy - 7], [hx - 2, hy - 7]]) p.part(E(x, y, 1.2), '#ffffff', { noOl: true, flat: true });
    if (f === 0) { p.part(R(4, 50, 7, 14), o.top); p.part(R(49, 50, 7, 14), o.top); }
    if (f === 2) { p.part(R(4, 50, 7, 14), o.top); p.part(P(46, 50, 58, 38, 62, 42, 50, 56), o.top); p.part(E(60, 39, 3), o.skin); }
    return p.canvas();
  });
  return FUTAN_BACK;
}
