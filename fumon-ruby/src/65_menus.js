// ================================================================ menus: start / party / summary / bag / dex / pc / mart / save
function bgPattern(c1, c2) {
  ctx.fillStyle = c1; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = c2;
  for (let y = 0; y < H; y += 8) for (let x = ((y / 8) % 2) * 8; x < W; x += 16) ctx.fillRect(x, y, 8, 8);
}
function monIcon(sp, x, y, s = 32, bob = false) {
  const b = bob ? Math.floor(frame / 8) % 2 : 0;
  ctx.drawImage(monImg(sp), 0, 0, 64, 64, x, y - b, s, s);
}
async function startMenu() {
  AU.sfx('ok');
  for (; ;) {
    const items = [];
    if (flag('dex')) items.push(['ずかん', dexScreen]);
    if (G.party.length) items.push(['ふーモン', () => partyScreen({ mode: 'field' })]);
    items.push(['バッグ', () => bagScreen({})]);
    items.push(['ふーたん', trainerCard]);
    if (flag('starter')) items.push(['レポート', saveGame]);
    items.push(['せってい', optionsMenu]);
    items.push(['とじる', null]);
    const r = await choose(items.map(i => i[0]), { x: 168, y: 2, w: 70, sel: startMenu.sel || 0 });
    if (r < 0 || !items[r][1]) return;
    startMenu.sel = r;
    const res = await items[r][1]();
    if (res === 'close') return;
  }
}
// ---------------------------------------------------------------- party
function partyRects() {
  const r = [{ x: 3, y: 20, w: 90, h: 58 }];
  for (let i = 0; i < 5; i++) r.push({ x: 96, y: 3 + i * 24, w: 141, h: 22 });
  return r;
}
function drawPartySlot(m, r, sel, i, swapSel) {
  const big = i === 0;
  const fainted = m.hp <= 0;
  const bg = fainted ? '#c87070' : sel ? '#f8a050' : '#58a0d8', bgE = fainted ? '#803838' : sel ? '#b05010' : '#205080';
  ctx.fillStyle = bgE; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.fillStyle = bg; ctx.fillRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
  if (swapSel) { ctx.strokeStyle = '#f8f040'; ctx.lineWidth = 1.5; ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2); }
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(r.x + 1, r.y + 1, r.w - 2, 2);
  const f = m.hp / m.maxhp;
  if (big) {
    monIcon(m.sp, r.x + 2, r.y + 2, 32, sel);
    txt(monName(m), r.x + 36, r.y + 6, '#fff', '#404858', 10);
    txt('Lv' + m.lv, r.x + 36, r.y + 18, '#fff', '#404858', 10);
    stTag(m.st, r.x + 62, r.y + 19);
    ctx.fillStyle = '#383838'; ctx.fillRect(r.x + 18, r.y + 37, 66, 5); txt('HP', r.x + 6, r.y + 35, '#f8b830', null, 7);
    ctx.fillStyle = hpCol(f); ctx.fillRect(r.x + 19, r.y + 38, 64 * f, 3);
    txt(`${m.hp}/${m.maxhp}`, r.x + 84, r.y + 44, '#fff', '#404858', 10, 'right');
  } else {
    monIcon(m.sp, r.x + 1, r.y - 4, 26, sel);
    txt(monName(m), r.x + 28, r.y + 1, '#fff', '#404858', 10);
    txt('Lv' + m.lv, r.x + 28, r.y + 11, '#fff', '#404858', 9);
    stTag(m.st, r.x + 52, r.y + 12);
    ctx.fillStyle = '#383838'; ctx.fillRect(r.x + 88, r.y + 4, 50, 5);
    ctx.fillStyle = hpCol(f); ctx.fillRect(r.x + 89, r.y + 5, 48 * f, 3);
    txt(`${m.hp}/${m.maxhp}`, r.x + 138, r.y + 10, '#fff', '#404858', 9, 'right');
  }
}
// returns index or -1 / null
async function partyScreen(o = {}) {
  let sel = o.sel ?? (o.mode === 'battle' ? Math.max(0, G.party.findIndex(m => m.hp > 0 && (!B || m !== B.me))) : 0), msg = o.msg || (o.mode === 'battle' ? 'どの ふーモンを くりだす？' : o.mode === 'item' ? 'どの ふーモンに つかう？' : 'ふーモンを えらんでください'), swapFrom = -1;
  const rects = partyRects();
  const cancelR = { x: 176, y: 127, w: 60, h: 30 };
  const L = pushLayer(() => {
    bgPattern('#307878', '#3a8888');
    for (let i = 0; i < 6; i++) {
      const r = rects[i], m = G.party[i];
      if (!m) { if (i > 0) { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(r.x, r.y, r.w, r.h); } continue; }
      drawPartySlot(m, r, sel === i, i, swapFrom === i);
    }
    win(2, 127, 172, 31, WS.menu); txt(msg, 12, 136, '#303038', '#d0d0d8', 10);
    const cs = sel === 6;
    ctx.fillStyle = cs ? '#b05010' : '#205080'; ctx.fillRect(cancelR.x, cancelR.y + 6, cancelR.w, 20); ctx.fillStyle = cs ? '#f8a050' : '#58a0d8'; ctx.fillRect(cancelR.x + 1, cancelR.y + 7, cancelR.w - 2, 18);
    txt(o.forced ? '' : 'やめる', cancelR.x + 30, cancelR.y + 10, '#fff', '#404858', 11, 'center');
  });
  const n = G.party.length;
  let result;
  for (; ;) {
    await tick();
    const old = sel;
    if (btnr('D')) sel = sel === 6 ? 0 : sel + 1 >= n ? (o.forced ? 0 : 6) : sel + 1;
    if (btnr('U')) sel = sel === 0 ? (o.forced ? n - 1 : 6) : sel === 6 ? n - 1 : sel - 1;
    if (btnr('R') && sel === 0 && n > 1) sel = 1;
    if (btnr('L') && sel > 0 && sel < 6) sel = 0;
    if (old !== sel) AU.sfx('sel');
    let go = btnp('A');
    if (IN.tap) {
      for (let i = 0; i < n; i++) if (tapIn(rects[i].x, rects[i].y, rects[i].w, rects[i].h)) { sel = i; go = true; }
      if (tapIn(cancelR.x, cancelR.y, cancelR.w, cancelR.h) && !o.forced) { sel = 6; go = true; }
    }
    if ((btnp('B') && !o.forced) || (go && sel === 6)) {
      AU.sfx('cancel');
      if (swapFrom >= 0) { swapFrom = -1; msg = 'ふーモンを えらんでください'; continue; }
      result = -1; break;
    }
    if (!go) continue;
    AU.sfx('ok');
    const m = G.party[sel];
    if (swapFrom >= 0) {
      if (swapFrom !== sel) { const t = G.party[swapFrom]; G.party[swapFrom] = G.party[sel]; G.party[sel] = t; }
      swapFrom = -1; msg = 'ふーモンを えらんでください'; continue;
    }
    if (o.mode === 'item' || o.mode === 'pick') { result = sel; break; }
    if (o.mode === 'battle') {
      const c = await choose(['いれかえる', 'つよさを みる', 'やめる'], { x: 150, y: 76, w: 88 });
      if (c === 0) {
        if (m.hp <= 0) { msg = `${monName(m)}は たたかえない！`; continue; }
        if (B && m === B.me && !o.forced) { msg = `${monName(m)}は もう でているよ！`; continue; }
        result = sel; break;
      }
      if (c === 1) await summary(sel);
      continue;
    }
    const c = await choose(['つよさを みる', 'ならびかえ', 'やめる'], { x: 150, y: 76, w: 88 });
    if (c === 0) await summary(sel);
    if (c === 1) { swapFrom = sel; msg = 'どこに いどうする？'; }
  }
  popLayer(L);
  return result;
}
async function summary(i) {
  let idx = i;
  const L = pushLayer(() => {
    const m = G.party[idx];
    bgPattern('#e8e0c8', '#f0e8d0');
    ctx.fillStyle = '#4870c0'; ctx.fillRect(0, 0, W, 16); txt('ふーモンの じょうほう', 6, 2, '#fff', '#203060', 11);
    txt('◀▶', 234, 3, '#fff', null, 9, 'right');
    // left: sprite
    ctx.fillStyle = '#c8d8f0'; ctx.fillRect(4, 20, 84, 84); ctx.fillStyle = '#e0ecff'; ctx.fillRect(6, 22, 80, 80);
    ctx.drawImage(monImg(m.sp), 14, 30);
    txt(monName(m), 8, 106, '#303038'); txt('Lv' + m.lv, 86, 107, '#303038', '#d0d0d8', 10, 'right');
    MON[m.sp].t.forEach((t, k) => { ctx.fillStyle = TYPE_COL[t]; ctx.fillRect(8 + k * 40, 122, 38, 11); txt(t, 27 + k * 40, 122, '#fff', 'rgba(0,0,0,.35)', 9, 'center'); });
    stTag(m.st, 8, 137);
    // right: stats
    win(94, 18, 144, 66, WS.menu);
    const rows = [['HP', `${m.hp}/${m.maxhp}`], ['こうげき', m.atk], ['ぼうぎょ', m.def], ['すばやさ', m.spd]];
    rows.forEach(([a, b], k) => { txt(a, 104, 25 + k * 13, '#303038', '#d0d0d8', 10); txt(String(b), 230, 25 + k * 13, '#303038', '#d0d0d8', 10, 'right'); });
    txt(`つぎの レベルまで あと ${Math.max(0, expFor(m.lv + 1) - m.exp)}`, 96, 86, '#303038', '#d0d0d8', 9);
    // moves
    win(94, 96, 144, 62, WS.menu);
    m.moves.forEach((mv, k) => {
      const d = MOVES[mv.id]; const y = 102 + k * 13;
      ctx.fillStyle = TYPE_COL[d.t]; ctx.fillRect(101, y + 2, 4, 8);
      txt(d.n, 108, y, '#303038', '#d0d0d8', 10); txt(`${mv.pp}/${d.pp}`, 230, y, '#303038', '#d0d0d8', 10, 'right');
    });
  });
  for (; ;) {
    await tick();
    if (btnp('B') || btnp('A') || (IN.tap && IN.tap.y < 100 && IN.tap.x < 200)) { AU.sfx('cancel'); break; }
    if (btnr('D') || btnr('R') || (IN.tap && IN.tap.x >= 200 && IN.tap.y < 20)) { idx = (idx + 1) % G.party.length; AU.sfx('sel'); AU.cry(G.party[idx].sp); }
    if (btnr('U') || btnr('L')) { idx = (idx + G.party.length - 1) % G.party.length; AU.sfx('sel'); AU.cry(G.party[idx].sp); }
  }
  popLayer(L);
}
// ---------------------------------------------------------------- bag
const POCKETS = [['どうぐ', k => !ITEMS[k].ball && !ITEMS[k].key], ['ボール', k => ITEMS[k].ball], ['たいせつな もの', k => ITEMS[k].key]];
async function bagScreen(o = {}) {
  let pocket = o.battle && B && B.wild ? 1 : 0, sel = 0, result = null;
  const list = () => Object.keys(ITEMS).filter(k => G.bag[k] > 0 && POCKETS[pocket][1](k));
  const L = pushLayer(() => {
    bgPattern('#e8b860', '#f0c470');
    // bag icon
    ctx.fillStyle = '#c05828'; ctx.beginPath(); ctx.ellipse(46, 76, 34, 30, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#e07040'; ctx.beginPath(); ctx.ellipse(44, 72, 30, 25, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#803010'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(46, 46, 14, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#f8d878'; ctx.fillRect(30, 70, 32, 10);
    win(4, 4, 84, 20, WS.menu); txt('◀ ' + POCKETS[pocket][0] + ' ▶', 46, 8, '#303038', '#d0d0d8', 9, 'center');
    const items = list();
    win(92, 2, 146, 112, WS.menu);
    items.slice(0, 7).forEach((k, i) => {
      txt(ITEMS[k].n, 108, 9 + i * 14, '#303038', '#d0d0d8', 10);
      if (!ITEMS[k].key) txt('×' + G.bag[k], 230, 9 + i * 14, '#303038', '#d0d0d8', 10, 'right');
    });
    const ci = items.length;
    txt('とじる', 108, 9 + Math.min(7, ci) * 14, '#303038', '#d0d0d8', 10);
    cursorAt(98, 10 + Math.min(sel, 7) * 14);
    win(2, 116, 236, 42, WS.dark);
    const k = items[sel];
    if (k) { ctx.drawImage(itemIcon(k), 10, 124); wrap(ITEMS[k].desc, 196, 10).slice(0, 2).forEach((l, i) => txt(l, 36, 123 + i * 14, '#fff', '#000', 10)); }
    else txt('バッグを とじます', 36, 123, '#fff', '#000', 10);
    txt(`おこづかい ${G.money}えん`, 46, 108, '#603010', null, 9, 'center');
  });
  for (; ;) {
    await tick();
    const items = list(); const n = Math.min(items.length, 7) + 1;
    if (sel >= n) sel = n - 1;
    if (btnr('D')) { sel = (sel + 1) % n; AU.sfx('sel'); }
    if (btnr('U')) { sel = (sel + n - 1) % n; AU.sfx('sel'); }
    if (btnp('R') || (IN.tap && tapIn(4, 4, 84, 20) && IN.tap.x > 46)) { pocket = (pocket + 1) % 3; sel = 0; AU.sfx('sel'); continue; }
    if (btnp('L') || (IN.tap && tapIn(4, 4, 84, 20) && IN.tap.x <= 46)) { pocket = (pocket + 2) % 3; sel = 0; AU.sfx('sel'); continue; }
    let go = btnp('A');
    if (IN.tap) for (let i = 0; i < n; i++) if (tapIn(96, 7 + i * 14, 140, 14)) { sel = i; go = true; }
    if (btnp('B')) { AU.sfx('cancel'); break; }
    if (!go) continue;
    AU.sfx('ok');
    const k = items[sel];
    if (!k) break;
    const it = ITEMS[k];
    if (o.battle) {
      if (it.ball) {
        if (!B.wild) { await menuMsg('ひとの ふーモンは とれないよ！'); continue; }
        if (G.party.length >= 6 && false) continue;
        result = { item: k }; break;
      }
      if (it.key || it.use === 'field') { await menuMsg('いまは つかえないよ！'); continue; }
      const t = await partyScreen({ mode: 'item' });
      if (t < 0) continue;
      const m = G.party[t];
      if (!canUse(it, m)) { await menuMsg('つかっても こうかが ないよ！'); continue; }
      result = { item: k, target: t }; break;
    } else {
      const c = await choose(['つかう', 'やめる'], { x: 170, y: 70, w: 66 });
      if (c !== 0) continue;
      if (it.key || it.ball) { await menuMsg(it.key ? 'これは だいじな ものだよ。' : 'くさむらで ふーモンに あったら つかってね！'); continue; }
      if (it.repel) { G.bag[k]--; G.repel = it.repel; await menuMsg('むしよけスプレーを つかった！ しばらく よわい ふーモンが でてこないよ。'); continue; }
      const t = await partyScreen({ mode: 'item' });
      if (t < 0) continue;
      const m = G.party[t];
      if (!canUse(it, m)) { await menuMsg('つかっても こうかが ないよ！'); continue; }
      G.bag[k]--;
      if (it.heal) { const b4 = m.hp; m.hp = Math.min(m.maxhp, m.hp + it.heal); AU.sfx('heal'); await menuMsg(`${monName(m)}の HPが ${m.hp - b4} かいふくした！`); }
      if (it.cure) { m.st = null; AU.sfx('heal'); await menuMsg(`${monName(m)}は げんきに なった！`); }
      if (it.revive) { m.hp = Math.floor(m.maxhp / 2); AU.sfx('heal'); await menuMsg(`${monName(m)}は げんきを とりもどした！`); }
    }
  }
  popLayer(L);
  return result;
}
function canUse(it, m) {
  if (it.heal) return m.hp > 0 && m.hp < m.maxhp;
  if (it.cure) return m.hp > 0 && !!m.st;
  if (it.revive) return m.hp <= 0;
  return false;
}
async function menuMsg(s) {
  const L = pushLayer(() => { win(2, 116, 236, 42, WS.field); wrap(s, 214, 11).slice(0, 2).forEach((l, i) => txt(l, 12, 125 + i * 15)); nextArrow(222, 146); });
  speak(s);
  await wait(8); await waitOK(); AU.sfx('sel');
  popLayer(L);
}
const ICON = {};
function itemIcon(k) {
  if (ICON[k]) return ICON[k];
  const p = new Pix(20, 20), it = ITEMS[k];
  if (it.ball) { const c = k === 'great' ? '#3878e8' : k === 'ultra' ? '#f0c020' : '#e83040'; p.part(Sub(E(10, 10, 8), R(0, 10, 20, 10)), c); p.part(Sub(E(10, 10, 8), R(0, 0, 20, 10)), '#f0f0f0'); p.hline(2, 18, 10, '#202020'); p.part(E(10, 10, 2.5), '#ffffff', { ol: '#202020' }); }
  else if (it.heal) { const c = k === 'potion' ? '#a050d0' : k === 'superpotion' ? '#f0a020' : '#e03050'; p.part(RR(5, 6, 10, 13, 2), c); p.part(R(7, 2, 6, 5), '#c0c0c8'); p.px(8, 9, '#ffffff'); }
  else if (it.cure) { p.part(RR(5, 6, 10, 13, 2), '#f0d020'); p.part(R(7, 2, 6, 5), '#c0c0c8'); }
  else if (it.revive) { p.part(P(10, 1, 18, 10, 10, 19, 2, 10), '#f8e040', { ol: '#806010' }); }
  else if (it.repel) { p.part(RR(5, 4, 10, 15, 2), '#40b080'); p.part(R(8, 1, 4, 4), '#808088'); }
  else if (k === 'redorb') { p.part(E(10, 10, 8), '#e02040', { hi: '#ff90a0' }); }
  else if (k === 'shoes') { p.part(P(2, 10, 10, 10, 18, 14, 18, 18, 2, 18), '#3878e0'); p.hline(2, 18, 18, '#ffffff'); }
  else p.part(E(10, 10, 7), '#a0a0a0');
  return ICON[k] = p.canvas();
}
// ---------------------------------------------------------------- dex
async function dexScreen() {
  let sel = 1, top = 1;
  const N = MON.length - 1;
  const L = pushLayer(() => {
    bgPattern('#c83040', '#d03848');
    ctx.fillStyle = '#801828'; ctx.fillRect(0, 0, W, 16); txt('ふーモンずかん', 6, 2, '#fff', '#401018', 11);
    const seen = Object.keys(G.seen).length, caught = Object.keys(G.caught).length;
    txt(`みつけた ${seen}  つかまえた ${caught}`, 234, 3, '#fff', '#401018', 9, 'right');
    // left: sprite
    ctx.fillStyle = '#f8f0e0'; ctx.fillRect(6, 22, 84, 84); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(8, 24, 80, 80);
    if (G.seen[sel]) ctx.drawImage(monImg(sel), 16, 32); else txt('？', 48, 52, '#a09070', null, 22, 'center');
    if (G.caught[sel]) { MON[sel].t.forEach((t, k) => { ctx.fillStyle = TYPE_COL[t]; ctx.fillRect(8 + k * 42, 110, 40, 11); txt(t, 28 + k * 42, 110, '#fff', 'rgba(0,0,0,.35)', 9, 'center'); }); }
    // right list
    win(96, 20, 142, 138, WS.menu);
    for (let i = 0; i < 9; i++) {
      const id = top + i; if (id > N) break;
      const y = 27 + i * 14;
      txt(String(id).padStart(3, '0'), 108, y, '#303038', '#d0d0d8', 9);
      if (G.caught[id]) drawBallIcon(128, y + 2, 8);
      txt(G.seen[id] ? MON[id].name : '－－－－－', 140, y, '#303038', '#d0d0d8', 10);
      if (id === sel) cursorAt(100, y + 2);
    }
  });
  for (; ;) {
    await tick();
    if (btnr('D') && sel < N) { sel++; AU.sfx('sel'); }
    if (btnr('U') && sel > 1) { sel--; AU.sfx('sel'); }
    if (btnr('R')) { sel = Math.min(N, sel + 9); AU.sfx('sel'); }
    if (btnr('L')) { sel = Math.max(1, sel - 9); AU.sfx('sel'); }
    if (sel < top) top = sel; if (sel > top + 8) top = sel - 8;
    let go = btnp('A');
    if (IN.tap) { for (let i = 0; i < 9; i++) if (tapIn(100, 25 + i * 14, 136, 14) && top + i <= N) { if (sel === top + i) go = true; sel = top + i; } if (IN.tap.y < 20 && IN.tap.x > 120) { top = Math.min(N - 8, top + 9); sel = top; } }
    if (btnp('B')) { AU.sfx('cancel'); break; }
    if (go && G.seen[sel]) { AU.sfx('ok'); await dexPage(sel); }
  }
  popLayer(L);
}
async function dexPage(sp) {
  const d = MON[sp];
  AU.cry(sp);
  const L = pushLayer(() => {
    bgPattern('#f0e8d0', '#e8e0c4');
    ctx.fillStyle = '#c83040'; ctx.fillRect(0, 0, W, 16); txt('ずかん とうろく', 6, 2, '#fff', '#401018', 11);
    ctx.fillStyle = '#fff'; ctx.fillRect(8, 22, 72, 72); ctx.drawImage(monImg(sp), 12, 26);
    txt('No.' + String(sp).padStart(3, '0'), 90, 24, '#303038', '#d0d0d8', 11);
    txt(d.name, 90, 40, '#303038', '#d0d0d8', 14);
    if (G.caught[sp]) d.t.forEach((t, k) => { ctx.fillStyle = TYPE_COL[t]; ctx.fillRect(90 + k * 44, 62, 42, 12); txt(t, 111 + k * 44, 62, '#fff', 'rgba(0,0,0,.35)', 10, 'center'); });
    win(4, 100, 232, 56, WS.menu);
    wrap(G.caught[sp] ? d.dex : 'まだ くわしい ことは わからない。 つかまえて しらべよう！', 210, 11).slice(0, 3).forEach((l, i) => txt(l, 14, 108 + i * 15));
  });
  speak(d.name + '。 ' + (G.caught[sp] ? d.dex : ''));
  await wait(10); await waitOK(); AU.sfx('cancel');
  popLayer(L);
}
// ---------------------------------------------------------------- trainer card
async function trainerCard() {
  const L = pushLayer(() => {
    bgPattern('#3858a8', '#4060b0');
    ctx.fillStyle = '#f8f0e0'; ctx.fillRect(10, 10, 220, 140); ctx.fillStyle = '#e8d8b8'; ctx.fillRect(10, 10, 220, 18);
    txt('トレーナーカード', 18, 13, '#603010', null, 11);
    ctx.drawImage(portrait('futan'), 158, 34);
    txt('なまえ   ふーたん', 20, 36); txt(`おこづかい   ${G.money}えん`, 20, 54);
    txt(`ずかん   ${Object.keys(G.caught).length}ひき`, 20, 72);
    const t = Math.floor(G.time / 60); txt(`プレイじかん   ${Math.floor(t / 3600)}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}`, 20, 90);
    txt('バッジ', 20, 112);
    const BC = ['#a07850', '#f0c020', '#f05020'];
    for (let i = 0; i < 3; i++) {
      const x = 70 + i * 28, y = 108;
      ctx.fillStyle = '#d8c8a8'; ctx.fillRect(x, y, 22, 22);
      if (G.badges[i]) { ctx.fillStyle = BC[i]; ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 4 : 9, a = k * Math.PI / 5 - Math.PI / 2; ctx.lineTo(x + 11 + Math.cos(a) * r, y + 11 + Math.sin(a) * r); } ctx.fill(); ctx.strokeStyle = '#402010'; ctx.lineWidth = 1; ctx.stroke(); }
    }
  });
  await wait(6); await waitOK(); AU.sfx('cancel');
  popLayer(L);
}
async function optionsMenu() {
  for (; ;) {
    const r = await choose([{ t: 'よみあげ', r: OPT.voice ? 'オン' : 'オフ' }, { t: 'もじの はやさ', r: ['', 'ふつう', 'はやい', '', 'すごく'][OPT.textSpeed] || 'はやい' }, 'もどる'], { x: 110, y: 40, w: 128 });
    if (r === 0) { OPT.voice = !OPT.voice; saveOpt(); if (OPT.voice) speak('よみあげを オンに したよ'); }
    else if (r === 1) { OPT.textSpeed = OPT.textSpeed === 1 ? 2 : OPT.textSpeed === 2 ? 4 : 1; saveOpt(); }
    else return;
  }
}
// ---------------------------------------------------------------- save / load
function serialize() {
  return { v: 1, G: JSON.parse(JSON.stringify(G)), map: F.id, x: F.pl.x, y: F.pl.y, dir: F.pl.dir };
}
async function saveGame() {
  await say('いままでの ぼうけんを レポートに かきますか？', { keep: true });
  if (!(await yesno())) { closeMsg(); return; }
  const ok = store.set(SAVE_KEY, serialize());
  AU.sfx('save');
  await say(ok ? 'ふーたんは レポートに しっかり かきのこした！' : 'レポートが かけなかった……（ブラウザの ほぞんが できないみたい）');
  return 'close';
}
// ---------------------------------------------------------------- PC
async function pcMenu() {
  AU.sfx('ok');
  await say('ふーたんは パソコンの スイッチを いれた！', { keep: true });
  for (; ;) {
    const r = await choose(['ふーモンを あずける', 'ふーモンを ひきだす', 'やめる'], { x: 120, y: 30, w: 118 });
    if (r === 0) {
      if (G.party.length <= 1) { await say('てもちが いなくなっちゃうよ！', { keep: true }); continue; }
      const i = await partyScreen({ mode: 'pick', msg: 'どの ふーモンを あずける？' });
      if (i >= 0) { const m = G.party.splice(i, 1)[0]; healMon(m); G.box.push(m); await say(`${monName(m)}を ボックスに あずけた！`, { keep: true }); }
    } else if (r === 1) {
      if (!G.box.length) { await say('ボックスには だれも いないよ。', { keep: true }); continue; }
      if (G.party.length >= 6) { await say('てもちが いっぱいだよ！', { keep: true }); continue; }
      closeMsg();
      const i = await choose(G.box.map(m => ({ t: monName(m), r: 'Lv' + m.lv })).slice(0, 8), { x: 110, y: 2, w: 128 });
      if (i >= 0) { const m = G.box.splice(i, 1)[0]; G.party.push(m); await say(`${monName(m)}を ひきだした！`, { keep: true }); }
    } else break;
  }
  closeMsg();
}
// ---------------------------------------------------------------- mart
async function martMenu() {
  await say('いらっしゃいませ！ なにに いたしましょう？', { keep: true, who: 'てんいん' });
  for (; ;) {
    const r = await choose(['かう', 'やめる'], { x: 170, y: 60, w: 66 });
    if (r !== 0) break;
    const stock = ['ball', 'potion', 'repel', 'fullheal'];
    if (G.badges.length >= 1) stock.splice(1, 0, 'great'), stock.push('superpotion', 'revive');
    if (G.badges.length >= 2) stock.splice(2, 0, 'ultra'), stock.push('hyperpotion');
    closeMsg();
    for (; ;) {
      const L = pushLayer(() => { win(2, 2, 100, 20, WS.menu); txt(`${G.money}えん`, 94, 7, '#303038', '#d0d0d8', 10, 'right'); });
      const i = await choose(stock.map(k => ({ t: ITEMS[k].n, r: ITEMS[k].price + 'えん' })).concat([{ t: 'やめる' }]), { x: 104, y: 2, w: 134, onMove: () => { } });
      popLayer(L);
      if (i < 0 || i >= stock.length) break;
      const k = stock[i], it = ITEMS[k];
      let n = 1;
      const max = Math.min(99, Math.floor(G.money / it.price));
      if (max < 1) { await say('おかねが たりないみたい……', { who: 'てんいん' }); continue; }
      const QL = pushLayer(() => { win(130, 92, 108, 22, WS.menu); txt(`×${n}`, 140, 98); txt(`${n * it.price}えん`, 228, 98, '#303038', '#d0d0d8', 11, 'right'); });
      await say(`${it.n}ですね。 いくつ かいますか？（↑↓で かず）`, { keep: true, who: 'てんいん' });
      let ok = false;
      for (; ;) {
        await tick();
        if (btnr('U')) { n = n >= max ? 1 : n + 1; AU.sfx('sel'); }
        if (btnr('D')) { n = n <= 1 ? max : n - 1; AU.sfx('sel'); }
        if (btnr('R')) { n = Math.min(max, n + 10); AU.sfx('sel'); }
        if (btnr('L')) { n = Math.max(1, n - 10); AU.sfx('sel'); }
        if (IN.tap) { if (tapIn(130, 92, 54, 22)) { n = n <= 1 ? max : n - 1; } else if (tapIn(184, 92, 54, 22)) { n = n >= max ? 1 : n + 1; } else if (IN.tap.y > 114) { ok = true; break; } AU.sfx('sel'); }
        if (btnp('A')) { ok = true; break; }
        if (btnp('B')) break;
      }
      popLayer(QL);
      if (!ok) { closeMsg(); continue; }
      G.money -= n * it.price; addItem(k, n); AU.sfx('save');
      await say(`${it.n}を ${n}こ ですね。 まいど ありがとう ございます！`, { who: 'てんいん' });
      if (k === 'ball' && n >= 10) { addItem('great', 1); await say('おまけに スーパーボールも どうぞ！', { who: 'てんいん' }); }
    }
    await say('ほかに なにか ございますか？', { keep: true, who: 'てんいん' });
  }
  closeMsg();
  await say('またの おこしを おまちしてます！', { who: 'てんいん' });
}
// ---------------------------------------------------------------- center
async function centerHeal() {
  await say('ふーモンセンターへ ようこそ！ ここでは ふーモンの たいりょくを かいふく いたします。', { who: 'ナースさん' });
  await say('あなたの ふーモンを やすませて あげますか？', { keep: true, who: 'ナースさん' });
  if (!(await yesno())) { closeMsg(); await say('またの ごりよう おまちしてます！', { who: 'ナースさん' }); return; }
  await say('それでは あずからせて いただきます！', { keep: true, who: 'ナースさん' });
  const nurse = F.ents.find(e => e.ch === 'nurse');
  if (nurse) nurse.dir = 'L';
  await wait(10);
  // heal machine balls
  let n = 0;
  const L = pushLayer(() => {
    const [cx, cy] = F.cam;
    const mx = nurse ? nurse.px - 16 - cx : 100, my = nurse ? nurse.py - cy - 6 : 40;
    for (let i = 0; i < n; i++) drawBallIcon(mx + (i % 2) * 7, my + Math.floor(i / 2) * 5, 6, 0, (frame >> 3) % 2 && n === G.party.length ? '#ff90a0' : '#e83040');
  });
  for (let i = 0; i < G.party.length; i++) { n++; AU.sfx('click'); await wait(10); }
  const pb = AU.curName; AU.stopBgm(); AU.jingle('heal'); await wait(110);
  for (const m of G.party) healMon(m);
  popLayer(L); if (nurse) nurse.dir = 'D';
  AU.bgm(pb);
  G.center = { map: F.id, x: F.pl.x, y: F.pl.y };
  await say('おまたせ しました！ おあずかりした ふーモンは みんな げんきに なりましたよ！', { who: 'ナースさん' });
  await say('またの ごりよう おまちしてます！', { who: 'ナースさん' });
}
