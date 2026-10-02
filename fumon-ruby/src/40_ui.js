// ================================================================ UI: windows, text, menus
const FONT = '"DotGothic16","Hiragino Sans","Noto Sans JP",monospace';
const UI = { layers: [], fade: 0, fadeCol: '#000', flash: 0 };
function pushLayer(fn) { UI.layers.push(fn); return fn; }
function pushUnder(fn) { UI.layers.unshift(fn); return fn; }
function popLayer(fn) { const i = UI.layers.indexOf(fn); if (i >= 0) UI.layers.splice(i, 1); }
function drawUI() {
  for (const f of UI.layers.slice()) f();
  if (UI.fade > 0) { ctx.globalAlpha = clamp(UI.fade, 0, 1); ctx.fillStyle = UI.fadeCol; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (UI.flash > 0) { ctx.globalAlpha = clamp(UI.flash, 0, 1); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; UI.flash -= 0.08; }
}
async function fadeOut(n = 14, col = '#000') { UI.fadeCol = col; for (let i = 1; i <= n; i++) { UI.fade = i / n; await tick(); } UI.fade = 1; }
async function fadeIn(n = 14) { for (let i = n - 1; i >= 0; i--) { UI.fade = i / n; await tick(); } UI.fade = 0; }

function setFont(sz = 11) { ctx.font = `${sz}px ${FONT}`; ctx.textBaseline = 'top'; }
function txt(s, x, y, col = '#303038', sh = '#d0d0d8', sz = 11, align = 'left') {
  setFont(sz); ctx.textAlign = align;
  if (sh) { ctx.fillStyle = sh; ctx.fillText(s, x + 0.67, y + 0.67); }
  ctx.fillStyle = col; ctx.fillText(s, x, y);
  ctx.textAlign = 'left';
}
const tw = (s, sz = 11) => { setFont(sz); return ctx.measureText(s).width; };

// window styles
const WS = {
  field: { o: '#40507c', m: '#ffffff', i: '#98b0e0', bg: '#ffffff', fg: '#303038', sh: '#d0d0d8' },
  battle: { o: '#401818', m: '#e86040', i: '#f8b048', bg: '#2a4860', fg: '#ffffff', sh: '#5a6878' },
  menu: { o: '#384868', m: '#f8f8f8', i: '#5878b8', bg: '#ffffff', fg: '#303038', sh: '#d0d0d8' },
  dark: { o: '#000000', m: '#c0c8d8', i: '#606880', bg: '#283040', fg: '#ffffff', sh: '#000000' },
};
function win(x, y, w, h, st = WS.field) {
  ctx.fillStyle = st.o; ctx.fillRect(x + 1, y, w - 2, h); ctx.fillRect(x, y + 1, w, h - 2);
  ctx.fillStyle = st.m; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = st.i; ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
  ctx.fillStyle = st.bg; ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
}
function cursorAt(x, y, col = '#e03838') {
  const b = (frame >> 4) % 2;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x + b, y); ctx.lineTo(x + 5 + b, y + 4); ctx.lineTo(x + b, y + 8); ctx.closePath(); ctx.fill();
}
function nextArrow(x, y, col = '#e03838') {
  const b = (frame >> 3) % 2;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y + b); ctx.lineTo(x + 7, y + b); ctx.lineTo(x + 3.5, y + 4 + b); ctx.closePath(); ctx.fill();
}

// ---------- text wrapping
function wrap(text, maxW, sz = 11) {
  setFont(sz);
  const out = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    const tokens = para.split(/(\s+)/);
    for (const tk of tokens) {
      if (!tk) continue;
      const tryL = line + tk;
      if (ctx.measureText(tryL).width <= maxW) { line = tryL; continue; }
      if (/^\s+$/.test(tk)) { out.push(line); line = ''; continue; }
      if (line.trim()) { out.push(line.replace(/\s+$/, '')); line = ''; }
      for (const ch of tk) { if (ctx.measureText(line + ch).width > maxW) { out.push(line); line = ''; } line += ch; }
    }
    out.push(line.replace(/\s+$/, ''));
  }
  return out;
}

// ---------- speech (よみあげ)
const OPT = Object.assign({ voice: true, textSpeed: 2 }, store.get('fumon-ruby-opt') || {});
function saveOpt() { store.set('fumon-ruby-opt', OPT); }
let jaVoice = null;
function speak(s) {
  if (!OPT.voice || !window.speechSynthesis) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(s.replace(/[「」『』\n]/g, ' ').replace(/ふーモン/g, 'ふーもん'));
    u.lang = 'ja-JP'; u.rate = 1.05; u.pitch = 1.15;
    if (!jaVoice) jaVoice = speechSynthesis.getVoices().find(v => /ja/i.test(v.lang)) || null;
    if (jaVoice) u.voice = jaVoice;
    speechSynthesis.speak(u);
  } catch (e) { }
}

// ---------- message box
let MSG = null;   // current message state (persistent while keep)
function drawMsg() {
  const m = MSG; if (!m) return;
  const st = m.st, bx = 2, by = 114, bw = 236, bh = 44;
  if (m.who) { const w = tw(m.who, 10) + 14; win(bx + 4, by - 15, w, 17, st); txt(m.who, bx + 11, by - 11, st === WS.battle ? '#f8d070' : '#3858b8', st.sh, 10); }
  win(bx, by, bw, bh, st);
  let left = m.shown;
  for (let i = 0; i < m.page.length; i++) {
    const L = m.page[i]; const s = L.slice(0, Math.max(0, left)); left -= L.length;
    txt(s, bx + 10, by + 9 + i * 15, st.fg, st.sh);
  }
  if (m.wait) nextArrow(bx + bw - 16, by + bh - 12, st === WS.battle ? '#f8b048' : '#e03838');
}
pushLayer(drawMsg);
async function say(text, o = {}) {
  const st = o.battle ? WS.battle : WS.field;
  const lines = wrap(text, 214);
  const pages = []; for (let i = 0; i < lines.length; i += 2) pages.push(lines.slice(i, i + 2));
  if (!o.noVoice && !(o.battle && o.auto)) speak(text);
  for (let pi = 0; pi < pages.length; pi++) {
    const page = pages[pi], total = page.join('').length;
    MSG = { st, page, shown: 0, wait: false, who: o.who };
    if (o.sfx !== false && pi === 0 && !o.battle) { }
    while (MSG.shown < total) {
      await tick();
      if (btn('A') || btn('B') || IN.tap) MSG.shown = total; else MSG.shown += OPT.textSpeed;
    }
    const last = pi === pages.length - 1;
    if (last && o.keep) return;
    MSG.wait = true;
    let t = 0;
    for (; ;) {
      await tick(); t++;
      if (btnp('A') || btnp('B') || IN.tap) { if (!o.battle || !last) AU.sfx('sel'); break; }
      if (o.auto && t >= o.auto && last) break;
    }
    MSG.wait = false;
  }
  if (!o.keep) MSG = null;
}
function closeMsg() { MSG = null; }
const bsay = (t, o = {}) => say(t, Object.assign({ battle: true, auto: 75 }, o));

// ---------- generic menu
// items: [{t, dis, r(right text)}] or strings
async function choose(items, o = {}) {
  items = items.map(it => typeof it === 'string' ? { t: it } : it);
  const cols = o.cols || 1, rows = Math.ceil(items.length / cols);
  const lh = o.lh || 15;
  const w = o.w || Math.max(...items.map(it => tw(it.t) + (it.r ? tw(it.r) + 12 : 0))) + 26;
  const h = rows * lh + 12;
  const x = o.x ?? (W - w - 2), y = o.y ?? (o.above ? 114 - h - 1 : 2);
  const st = o.st || WS.menu;
  let sel = o.sel || 0;
  const colW = (w - 12) / cols;
  const pos = i => [x + 6 + (i % cols) * colW, y + 6 + Math.floor(i / cols) * lh];
  const layer = pushLayer(() => {
    if (o.draw) o.draw(sel);
    win(x, y, w, h, st);
    items.forEach((it, i) => {
      const [ix, iy] = pos(i);
      let sz = o.sz || 11; const avail = colW - 12 - (it.r ? tw(it.r) + 6 : 0), ww = tw(it.t, sz); if (ww > avail) sz = sz * avail / ww;
      txt(it.t, ix + 10, iy + 2 + (11 - sz) / 2, it.dis ? '#a0a0a8' : st.fg, st.sh, sz);
      if (it.r) txt(it.r, cols > 1 ? ix + colW - 4 : x + w - 10, iy + 2, it.r === '◎' ? '#e03838' : st.fg, st.sh, 11, 'right');
      if (i === sel) cursorAt(ix + 1, iy + 3);
    });
  });
  let res;
  for (; ;) {
    await tick();
    const old = sel;
    if (cols > 1) {
      if (btnr('R') && sel % cols < cols - 1 && sel + 1 < items.length) sel++;
      if (btnr('L') && sel % cols > 0) sel--;
      if (btnr('D') && sel + cols < items.length) sel += cols;
      if (btnr('U') && sel - cols >= 0) sel -= cols;
    } else {
      if (btnr('D')) sel = (sel + 1) % items.length;
      if (btnr('U')) sel = (sel + items.length - 1) % items.length;
    }
    if (sel !== old) { AU.sfx('sel'); if (o.onMove) o.onMove(sel); }
    if (IN.tap) {
      let hit = -1;
      items.forEach((_, i) => { const [ix, iy] = pos(i); if (tapIn(ix, iy, colW, lh)) hit = i; });
      if (hit >= 0) { if (hit === sel || o.tapGo !== false) { sel = hit; res = sel; } else sel = hit; if (o.onMove) o.onMove(sel); }
      else if (o.cancel !== false && !tapIn(x, y, w, h) && o.tapOut) res = -1;
    }
    if (btnp('A')) res = sel;
    if (btnp('B') && o.cancel !== false) res = -1;
    if (res !== undefined) {
      if (res >= 0 && items[res].dis) { AU.sfx('bump'); res = undefined; continue; }
      AU.sfx(res >= 0 ? 'ok' : 'cancel');
      break;
    }
  }
  popLayer(layer);
  return res;
}
async function yesno(o = {}) {
  const r = await choose(['はい', 'いいえ'], Object.assign({ x: 186, y: 76, w: 52 }, o));
  return r === 0;
}
// wait for A (used in custom screens)
async function waitOK() { for (; ;) { await tick(); if (okp() || btnp('B')) return; } }
