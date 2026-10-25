// きらめきプリンセスルーム — がめんと あそびの しくみ
(function () {
  const KP = window.KP;
  const D = KP.DATA;
  const S = KP.sound;
  const app = document.getElementById('app');
  const fxLayer = document.getElementById('fx');
  const note = document.getElementById('note');
  const svg = KP.svg;
  const icon = KP.icon;
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wide = () => innerWidth > innerHeight;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ================= セーブ =================
  const KEY = 'kirameki-princess-room-v1';
  function freshSave() {
    return {
      version: 2,
      character: { equippedItems: { ...D.DEFAULT_OUTFIT }, savedOutfits: [] },
      room: JSON.parse(JSON.stringify(D.DEFAULT_ROOM)),
      collection: { discoveredItemIds: [], unlockedCharacterIds: ['momo'] },
      album: [],
      newIds: [],
      friends: { inRoom: ['fuutan', 'pyonta', 'momo'], pos: {}, outfits: {} },
      sound: true,
    };
  }
  let G;
  try {
    const raw = localStorage.getItem(KEY);
    G = raw ? JSON.parse(raw) : freshSave();
    const f = freshSave();
    for (const k in f) if (G[k] == null) G[k] = f[k];
    for (const k in f.friends) if (G.friends[k] == null) G.friends[k] = f.friends[k];
  } catch (e) {
    G = freshSave();
  }
  if (G.version < 2) {
    // ふーたんの いろを ピンクに かえた ときの ひっこし（さいしょの ままなら あたらしい いろに）
    const OLD = { tops: 'blouse-lav', skirt: 'frill-lav', onepiece: null, shoes: 'pumps-lav', hair: 'hairbows-lav', ribbon: 'chestbow-pink', magic: 'starwand-lav' };
    if (JSON.stringify(G.character.equippedItems) === JSON.stringify(OLD)) G.character.equippedItems = { ...D.DEFAULT_OUTFIT };
    G.room.furniture.forEach((f) => { if (f.instanceId === 'f3' && f.color === 'lav') f.color = 'pink'; if (f.instanceId === 'f2' && f.color === 'lav') f.color = 'pink'; });
    G.version = 2;
  }
  S.on = G.sound !== false;
  let saveTimer = 0;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(G));
        note.hidden = true;
      } catch (e) {
        note.textContent = 'ほごしゃの かたへ：このブラウザでは ほぞん できませんでした（あそびは つづけられます）';
        note.hidden = false;
      }
    }, 120);
  }
  window.addEventListener('pagehide', () => { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) { /* なにもしない */ } });

  const owned = (id) => !(D.ITEMS[id] && D.ITEMS[id].hidden) || G.collection.discoveredItemIds.includes(id);
  const furnOwned = (f) => !f.hidden || G.collection.discoveredItemIds.includes(f.id);
  const isNew = (id) => G.newIds.includes(id);
  const clearNew = (id) => { const i = G.newIds.indexOf(id); if (i >= 0) { G.newIds.splice(i, 1); save(); } };

  // ================= え の ヘルパ =================
  function toDraw(eq) {
    const o = {};
    for (const slot in eq) {
      const it = D.ITEMS[eq[slot]];
      if (it) o[slot] = { type: it.type, color: it.color };
    }
    return o;
  }
  const CHAR_VB = '0 -30 400 680';
  // かみがた・かみいろ（めの いろは かみに あわせる）
  const HAIR_STYLES = [['long', 'ロング'], ['twin', 'ツインテール'], ['pony', 'ポニーテール'], ['odango', 'おだんご'], ['bob', 'ボブ']];
  const HAIR_COLORS = ['pink', 'lav', 'blue', 'mint', 'yellow', 'brown', 'silver'];
  const EYE_FOR = { pink: 'pink', lav: 'lav', blue: 'blue', mint: 'green', yellow: 'amber', brown: 'amber', silver: 'blue' };
  const hairOpt = (style, color) => ({ hairStyle: style || 'long', hairColor: color || 'pink', eyeColor: EYE_FOR[color || 'pink'] || 'pink' });
  const fuuHair = () => hairOpt(G.character.hairStyle, G.character.hairColor);
  const snapHair = (o) => hairOpt(o && (o._hs || o.hairStyle), o && (o._hc || o.hairColor));
  function fuutanOpt(extra = {}) {
    return { ...fuuHair(), outfit: toDraw(G.character.equippedItems), ...extra };
  }
  // きがえの きろく（ふーたんは G.character、なかまは G.friends.data）
  const EMPTY_OUTFIT = { tops: null, skirt: null, onepiece: null, shoes: null, hair: null, ribbon: null, magic: null };
  function rec(who) {
    if (who === 'fuutan') return G.character;
    if (!G.friends.data) G.friends.data = {};
    const F = D.FRIENDS[who];
    if (!G.friends.data[who]) {
      G.friends.data[who] = { equippedItems: { ...EMPTY_OUTFIT, ...F.outfit, ...(G.friends.outfits[who] || {}) }, hairStyle: F.hairStyle, hairColor: F.hairColor };
    }
    return G.friends.data[who];
  }
  const recHair = (who) => { const r = rec(who); return hairOpt(r.hairStyle, r.hairColor); };
  function friendOpt(fid, extra = {}) {
    if (fid === 'fuutan') return fuutanOpt(extra);
    return { ...recHair(fid), outfit: toDraw(rec(fid).equippedItems), ...extra };
  }
  const charSVG = (opt, cls = '') => svg(CHAR_VB, KP.drawChar(opt), cls);
  const faceSVG = (opt) => svg('108 40 184 184', KP.drawChar({ ...opt, outfit: { hair: opt.outfit && opt.outfit.hair } }));
  const bunnySVG = (expr) => svg('0 -30 200 250', KP.drawBunny(expr));
  function itemSVG(it) {
    return svg(KP.PART_VIEW[it.slot], KP.drawPart(it.slot, it.type, it.color));
  }
  function furnSVG(fid, color, pad = 14) {
    const F = KP.FURN[fid];
    return svg(`${-pad} ${-pad} ${F.w + pad * 2} ${F.h + pad * 2}`, F.draw(KP.PAL[color] || KP.PAL.lav, KP.uid('fi')));
  }
  function findSVG(f) {
    if (f.kind === 'item') return itemSVG(D.ITEMS[f.id]);
    if (f.kind === 'furn') return furnSVG(f.id, f.id === 'bear' ? 'peach' : 'pink');
    return faceSVG(friendOpt(f.id, { expr: 'joy' }));
  }
  function findName(f) {
    if (f.kind === 'item') return D.ITEMS[f.id].name;
    if (f.kind === 'furn') return D.FURN_LIST.find((x) => x.id === f.id).name;
    return D.FRIENDS[f.id].name + 'ちゃん';
  }

  // ロゴ
  function logoSVG() {
    const id = KP.uid('lg');
    return svg('0 0 600 190',
      `<defs>${KP.lg(id + 'a', [[0, '#B89CF4'], [0.5, '#D9A8F0'], [1, '#F29CC2']], 0, 0, 1, 0)}${KP.lg(id + 'b', [[0, '#C9A8F8'], [1, '#F6A9CC']], 0, 0, 1, 0)}</defs>` +
      `<g font-family="'M PLUS Rounded 1c','Hiragino Maru Gothic ProN',sans-serif" font-weight="800" text-anchor="middle" paint-order="stroke" stroke-linejoin="round">` +
      `<text x="300" y="66" font-size="58" fill="url(#${id}b)" stroke="#fff" stroke-width="12" letter-spacing="6">きらめき</text>` +
      `<text x="300" y="150" font-size="70" fill="url(#${id}a)" stroke="#fff" stroke-width="14">プリンセスルーム</text>` +
      `<text x="300" y="150" font-size="70" fill="none" stroke="#8C6FD6" stroke-width="2" opacity=".35">プリンセスルーム</text>` +
      `<text x="300" y="182" font-size="22" fill="#8C6FD6" stroke="#fff" stroke-width="6">〜ふーたんの まほうの せかい〜</text></g>` +
      KP.star(140, 40, 16, KP.GOLD.base, KP.GOLD.line, 2) + KP.sparkle(470, 34, 12, '#fff') + KP.sparkle(486, 30, 8, KP.GOLD.base) + KP.heart(548, 104, 13, '#F8BCD6', '#fff', 3) + KP.star(40, 116, 12, '#C9B5F5', '#fff', 2),
      'logo');
  }

  // ================= こうか =================
  function svgToScreen(svgEl, x, y) {
    const m = svgEl.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = svgEl.createSVGPoint();
    p.x = x; p.y = y;
    const r = p.matrixTransform(m);
    return { x: r.x, y: r.y };
  }
  function screenToSvg(svgEl, cx, cy) {
    const m = svgEl.getScreenCTM();
    const p = svgEl.createSVGPoint();
    p.x = cx; p.y = cy;
    const r = p.matrixTransform(m.inverse());
    return { x: r.x, y: r.y };
  }
  function bubble(x, y, html, dur = 1800) {
    const b = document.createElement('div');
    b.className = 'bubble';
    b.innerHTML = html;
    b.style.top = Math.max(y, 70) + 'px';
    b.style.animationDuration = dur + 'ms';
    fxLayer.appendChild(b);
    const hw = b.offsetWidth / 2 + 6;
    b.style.left = clamp(x, hw, Math.max(hw, innerWidth - hw)) + 'px';
    setTimeout(() => b.remove(), dur + 50);
  }
  const PFX = {
    star: () => KP.star(50, 50, 44, KP.GOLD.base, KP.GOLD.line, 4),
    sparkle: () => KP.sparkle(50, 50, 46, '#fff') + KP.sparkle(50, 50, 26, '#FFE59A'),
    heart: () => KP.heart(50, 54, 40, '#F8BCD6', '#fff', 5),
    lheart: () => KP.heart(50, 54, 40, '#C9B5F5', '#fff', 5),
    note: () => KP.ICONS.music('#B39CEE'),
    flower: () => [0, 1, 2, 3, 4].map((i) => { const a = i * 1.2566 - 1.57; return `<circle cx="${50 + Math.cos(a) * 22}" cy="${50 + Math.sin(a) * 22}" r="18" fill="#F8BCD6" stroke="#fff" stroke-width="3"/>`; }).join('') + '<circle cx="50" cy="50" r="12" fill="#FFE08A"/>',
    leaf: () => `<path d="M50,10 C80,30 80,70 50,90 C20,70 20,30 50,10Z" fill="#9EDDC8" stroke="#4C9C82" stroke-width="4"/>`,
    drop: () => `<path d="M50,10 C70,40 80,56 80,66 A30,30 0 0,1 20,66 C20,56 30,40 50,10Z" fill="#BFE3FF" stroke="#fff" stroke-width="4"/>`,
  };
  function burst(x, y, kinds = ['star', 'sparkle', 'heart'], n = 10, spread = 110) {
    for (let i = 0; i < n; i++) {
      const e = document.createElement('div');
      e.className = 'pfx';
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.6;
      const d = spread * (0.6 + Math.random() * 0.6);
      e.style.left = x + 'px';
      e.style.top = y + 'px';
      e.style.setProperty('--dx', Math.cos(a) * d + 'px');
      e.style.setProperty('--dy', Math.sin(a) * d - 30 + 'px');
      e.style.setProperty('--rot', (Math.random() * 180 - 90) + 'deg');
      e.style.animationDelay = Math.random() * 0.12 + 's';
      const s = 20 + Math.random() * 18;
      e.style.width = e.style.height = s + 'px';
      e.innerHTML = svg('0 0 100 100', PFX[rand(kinds)]());
      fxLayer.appendChild(e);
      setTimeout(() => e.remove(), 1400);
    }
  }
  function flyer(x, y, html, dx, dy, dur = 2400) {
    const e = document.createElement('div');
    e.className = 'fly';
    e.style.left = x + 'px';
    e.style.top = y + 'px';
    e.style.setProperty('--dx', dx + 'px');
    e.style.setProperty('--dy', dy + 'px');
    e.style.animationDuration = dur + 'ms';
    e.innerHTML = html;
    fxLayer.appendChild(e);
    setTimeout(() => e.remove(), dur + 50);
  }

  // ================= ルーター =================
  let cur = null;
  let cleanup = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); cleanup.push(() => clearTimeout(t)); return t; };
  const every = (fn, ms) => { const t = setInterval(fn, ms); cleanup.push(() => clearInterval(t)); return t; };
  function go(name, arg) {
    cleanup.forEach((f) => f());
    cleanup = [];
    fxLayer.innerHTML = '';
    document.querySelectorAll('.modal,.viewer').forEach((m) => m.remove());
    cur = name;
    const el = document.createElement('div');
    el.className = 'screen ' + name;
    app.innerHTML = '';
    app.appendChild(el);
    const music = name === 'henshin' ? null : ['play', 'hide', 'memory', 'balloon', 'cake'].includes(name) ? 'play' : 'home';
    S.setWanted(music);
    SCREENS[name](el, arg || {});
    try { history.replaceState(null, '', '#' + name); } catch (e) { /* なにもしない */ }
  }
  document.addEventListener('pointerdown', () => S.unlock(), { once: true });

  function topbar(title, extraRight = '') {
    return `<div class="topbar"><button class="rbtn" data-act="home" aria-label="ホーム">${icon('home')}</button><div class="title">${title}</div>${extraRight || '<div style="width:58px"></div>'}</div>`;
  }
  function bindHome(el) {
    el.querySelectorAll('[data-act=home]').forEach((b) => b.addEventListener('click', () => { S.tap(); go('home'); }));
  }

  const SCREENS = {};

  // ================= ホーム =================
  function roomFurnitureSVG(room, opt = {}) {
    const list = [...room.furniture].sort((a, b) => {
      const fa = KP.FURN[a.furnitureId], fb = KP.FURN[b.furnitureId];
      const ka = (fa.flat ? 0 : fa.wall ? 1 : 2), kb = (fb.flat ? 0 : fb.wall ? 1 : 2);
      return ka - kb || a.y - b.y;
    });
    let o = '';
    for (const p of list) o += furnG(p, opt.selected === p.instanceId);
    return o;
  }
  function furnScale(fid) { return (D.FURN_LIST.find((f) => f.id === fid) || { scale: 1 }).scale; }
  function furnG(p, sel) {
    const F = KP.FURN[p.furnitureId];
    if (!F) return '';
    const s = furnScale(p.furnitureId);
    const flip = p.rotation === 180 ? `<g transform="translate(${F.w} 0) scale(-1 1)">` : '<g>';
    return `<g class="fitem${sel ? ' sel' : ''}" data-iid="${p.instanceId}" transform="translate(${p.x - (F.w * s) / 2} ${p.y - F.h * s}) scale(${s})">` +
      `<rect class="selbox" x="-12" y="-12" width="${F.w + 24}" height="${F.h + 24}" rx="18" fill="rgba(255,255,255,.25)" stroke="#E07AA8" stroke-width="${4 / s}" stroke-dasharray="${14 / s} ${10 / s}"/>` +
      `<g class="fw">${flip}${F.draw(KP.PAL[p.color] || KP.PAL.lav, KP.uid('f'))}</g></g></g>`;
  }

  SCREENS.home = function (el) {
    const hasNew = (kind) => G.newIds.some((id) => (kind === 'item' ? !!D.ITEMS[id] : kind === 'furn' ? !!KP.FURN[id] : !!D.FRIENDS[id]));
    const badge = (on) => (on ? `<div class="badge">${svg('0 0 100 100', KP.star(50, 50, 44, '#FFE28A', '#E9B44C', 5) + KP.sparkle(50, 50, 18, '#fff'))}</div>` : '');
    const room = G.room;
    const scene =
      `<g>${KP.drawRoomBG(room, 1000, 1180)}</g>` +
      `<g>${roomFurnitureSVG(room)}</g>` +
      `<g class="tapable" id="hFuu" transform="translate(305 365) scale(0.98)"><g class="breathe">${KP.drawChar(fuutanOpt({ pose: 'wave' }))}</g></g>` +
      `<g class="tapable" id="hPyon" transform="translate(268 900) scale(0.72)"><g class="floaty">${KP.drawBunny('normal')}</g></g>` +
      KP.sparkle(220, 470, 12, '#fff', 0.9) + KP.sparkle(780, 420, 10, '#FFE59A') + KP.sparkle(700, 330, 8, '#fff');
    el.innerHTML =
      `<div class="scene">${svg('0 0 1000 1180', scene).replace('<svg ', `<svg preserveAspectRatio="${wide() ? 'xMidYMid' : 'xMidYMax'} slice" `)}</div>` +
      logoSVG() +
      `<div class="topbar"><button class="rbtn" data-act="album" aria-label="アルバム">${icon('album')}</button><button class="rbtn" data-act="sound" aria-label="おと">${icon(S.on ? 'sound' : 'mute')}</button></div>` +
      `<div class="entry-row">` +
      `<button class="entry e1" data-go="dress">${icon('dress', '#fff')}<span>きせかえ</span>${badge(hasNew('item'))}</button>` +
      `<button class="entry e2" data-go="stories">${icon('book', '#fff')}<span>おはなし</span></button>` +
      `<button class="entry e3" data-go="room">${icon('house', '#fff')}<span>おへや</span>${badge(hasNew('furn'))}</button>` +
      `<button class="entry e4" data-go="friends">${icon('friends', '#fff')}<span>なかま</span>${badge(hasNew('friend'))}</button>` +
      `</div>`;
    el.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => { S.pick(); go(b.dataset.go); }));
    el.querySelector('[data-act=album]').addEventListener('click', () => { S.tap(); go('album'); });
    const sb = el.querySelector('[data-act=sound]');
    sb.addEventListener('click', () => {
      S.on = !S.on; G.sound = S.on; save();
      if (S.on) { S.unlock(); S.bgm(S.wanted); } else S.stopBgm();
      sb.innerHTML = icon(S.on ? 'sound' : 'mute');
      S.tap();
    });
    // ふーたんに さわる
    const svgEl = el.querySelector('.scene svg');
    const fuu = el.querySelector('#hFuu');
    let reactI = 0;
    const reacts = [
      { pose: 'joy', expr: 'joy', fx: ['heart', 'sparkle'], say: icon('heart') },
      { pose: 'wave', expr: 'wink', fx: ['star', 'sparkle'], say: icon('star') },
      { pose: 'hips', expr: 'cat', fx: ['note'], say: icon('music') },
      { pose: 'cheer', expr: 'happy', fx: ['star', 'heart'], say: icon('smile') },
    ];
    fuu.addEventListener('click', () => {
      const r = reacts[reactI++ % reacts.length];
      fuu.innerHTML = `<g class="bounce">${KP.drawChar(fuutanOpt({ pose: r.pose, expr: r.expr }))}</g>`;
      S.boing();
      const p = svgToScreen(svgEl, 500, 420);
      burst(p.x, p.y + 60, r.fx, 8);
      bubble(p.x + 60, p.y - 10, r.say);
      later(() => { fuu.innerHTML = `<g class="breathe">${KP.drawChar(fuutanOpt({ pose: 'wave' }))}</g>`; }, 1600);
    });
    const py = el.querySelector('#hPyon');
    py.addEventListener('click', () => {
      py.innerHTML = `<g class="hop">${KP.drawBunny(rand(['happy', 'surprise', 'happy']))}</g>`;
      S.pop();
      const p = svgToScreen(svgEl, 340, 900);
      bubble(p.x, p.y, rand([icon('heart'), icon('star'), icon('music')]));
      later(() => { py.innerHTML = `<g class="floaty">${KP.drawBunny('normal')}</g>`; }, 1300);
    });
    // かぐに さわると ちいさな はんのう
    svgEl.querySelectorAll('.fitem').forEach((g) => g.addEventListener('click', () => {
      const w = g.querySelector('.fw');
      w.classList.remove('wiggle'); void w.getBBox(); w.classList.add('wiggle');
      S.pop();
      const r = g.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 3, ['sparkle', 'star'], 6, 70);
    }));
  };

  // ================= きせかえ =================
  let dressTab = 'tops';
  let dressWho = 'fuutan';
  function dressRoomBG() {
    const id = KP.uid('dr');
    return `<defs>${KP.lg(id + 'a', [[0, '#F3ECFF'], [1, '#FFF0F6']])}${KP.rg(id + 'm', [[0, '#FFFFFF'], [0.7, '#F6F0FF'], [1, '#E6DBFF']], 0.5, 0.4, 0.6)}</defs>` +
      `<rect width="600" height="700" fill="url(#${id}a)"/>` +
      `<path d="M120,700 L120,190 A180,180 0 0,1 480,190 L480,700Z" fill="url(#${id}m)" stroke="#fff" stroke-width="14"/>` +
      `<path d="M120,700 L120,190 A180,180 0 0,1 480,190 L480,700Z" fill="none" stroke="#E2D6F6" stroke-width="4"/>` +
      `<path d="M150,140 L190,100 M140,190 L230,100" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>` +
      KP.drawCurtains(70, 40, 460, 560, KP.PAL.pink) +
      `<ellipse cx="300" cy="660" rx="200" ry="34" fill="#E9DEFF"/><ellipse cx="300" cy="656" rx="160" ry="24" fill="#F6F0FF"/>` +
      KP.sparkle(90, 250, 10, '#fff') + KP.sparkle(520, 300, 12, '#fff') + KP.star(540, 520, 8, '#FFE59A') + KP.heart(70, 470, 8, '#F8BCD6');
  }

  SCREENS.dress = function (el, arg) {
    if (arg.tab) dressTab = arg.tab;
    if (arg.who) dressWho = arg.who;
    if (dressWho !== 'fuutan' && !G.collection.unlockedCharacterIds.includes(dressWho)) dressWho = 'fuutan';
    let R = rec(dressWho);
    let eq = R.equippedItems;
    const whoList = ['fuutan', ...Object.keys(D.FRIENDS).filter((f) => G.collection.unlockedCharacterIds.includes(f))];
    el.innerHTML =
      topbar('きせかえルーム') +
      `<div class="dress-main"><div class="preview">` +
      `<div class="bg">${svg('0 0 600 700', dressRoomBG()).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ')}</div>` +
      `<div class="char" id="dChar"></div>` +
      `<div class="who" id="dWho"></div>` +
      `<div class="pal" id="dPyon">${bunnySVG('normal')}</div>` +
      `<div class="side">` +
      `<div class="sbtn"><button class="rbtn" data-a="reset">${icon('reset')}</button>もとにもどす</div>` +
      `<div class="sbtn"><button class="rbtn" data-a="random">${icon('dice')}</button>おまかせ</div>` +
      `<div class="sbtn"><button class="rbtn" data-a="save">${icon('save')}</button>ほぞん</div>` +
      `</div>` +
      `<button class="henshin-btn" data-a="henshin">${icon('magic')}へんしん！</button>` +
      `</div><div class="panel"><div class="tabs" id="dTabs"></div><div class="grid" id="dGrid"></div></div></div>`;
    bindHome(el);
    const charBox = el.querySelector('#dChar');
    const tabsEl = el.querySelector('#dTabs');
    const gridEl = el.querySelector('#dGrid');
    const pyEl = el.querySelector('#dPyon');
    let exprT = 0;
    function drawChar(expr = 'smile', anim = '') {
      charBox.innerHTML = svg(CHAR_VB, `<g class="${anim}">${KP.drawChar(friendOpt(dressWho, { expr }))}</g>`);
      const s = charBox.querySelector('svg');
      s.addEventListener('click', () => {
        S.boing();
        charBox.innerHTML = svg(CHAR_VB, `<g class="bounce">${KP.drawChar(friendOpt(dressWho, { expr: rand(['wink', 'joy', 'cat']), pose: rand(['wave', 'joy', 'hips']) }))}</g>`);
        const r = charBox.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height * 0.3, ['heart', 'sparkle'], 7);
        clearTimeout(exprT);
        exprT = later(() => drawChar(), 1400);
      });
    }
    drawChar();
    function pyonSay(html, expr = 'happy') {
      pyEl.innerHTML = `<div class="hop">${bunnySVG(expr)}</div>`;
      const r = pyEl.getBoundingClientRect();
      bubble(r.left + r.width / 2, r.top + 4, html);
      later(() => { pyEl.innerHTML = bunnySVG('normal'); }, 1500);
    }
    pyEl.addEventListener('click', () => { S.pop(); pyonSay(rand([icon('heart'), icon('star'), icon('music')])); });

    function tabsHTML() {
      let o = '';
      o += `<button class="tab${dressTab === 'hairdo' ? ' sel' : ''}" data-tab="hairdo">${svg('104 40 192 192', KP.drawChar({ ...recHair(dressWho), outfit: {} }))}かみがた</button>`;
      for (const s of D.SLOTS) {
        const rep = D.ITEM_LIST.find((i) => i.slot === s.id);
        const hasNewIn = D.ITEM_LIST.some((i) => i.slot === s.id && isNew(i.id));
        o += `<button class="tab${dressTab === s.id ? ' sel' : ''}" data-tab="${s.id}">${itemSVG(rep)}${s.name}${hasNewIn ? '<span class="dot"></span>' : ''}</button>`;
      }
      o += `<button class="tab${dressTab === 'saved' ? ' sel' : ''}" data-tab="saved">${svg('0 0 100 100', KP.ICONS.save())}おきにいり</button>`;
      return o;
    }
    function gridHTML() {
      if (dressTab === 'hairdo') {
        const cs = R.hairStyle || 'long', cc = R.hairColor || 'pink';
        const head = (st, co) => svg('36 20 328 400', KP.drawChar({ ...hairOpt(st, co), outfit: {} }));
        return `<div class="grid-h">かみがた</div>` +
          HAIR_STYLES.map(([st, nm]) => `<button class="cell${cs === st ? ' sel' : ''}" data-hs="${st}" aria-label="${nm}">${head(st, cc)}</button>`).join('') +
          `<div class="grid-h">かみの いろ</div>` +
          HAIR_COLORS.map((co) => `<button class="cell${cc === co ? ' sel' : ''}" data-hc="${co}">${head(cs, co)}</button>`).join('');
      }
      if (dressTab === 'saved') {
        if (!G.character.savedOutfits.length) return `<div class="empty-msg" style="grid-column:1/-1">「ほぞん」を おすと ここに はいるよ</div>`;
        return G.character.savedOutfits.map((o, i) =>
          `<button class="cell" data-saved="${i}">${svg('40 -20 320 660', KP.drawChar({ ...snapHair(o), outfit: toDraw(o.equippedItems) }))}</button>`).join('');
      }
      const list = D.ITEM_LIST.filter((i) => i.slot === dressTab && owned(i.id));
      let o = list.map((it) => {
        const sel = eq[it.slot] === it.id && !(eq.onepiece && (it.slot === 'tops' || it.slot === 'skirt'));
        return `<button class="cell${sel ? ' sel' : ''}" data-item="${it.id}" aria-label="${esc(it.name)}">${itemSVG(it)}${isNew(it.id) ? '<span class="new">NEW</span>' : ''}</button>`;
      }).join('');
      D.ITEM_LIST.filter((i) => i.slot === dressTab && !owned(i.id)).forEach((i) => (o += `<button class="cell empty" data-locked="${isPrize(i.id) ? 'prize' : '1'}">${icon('question')}</button>`));
      return o;
    }
    function refresh() {
      tabsEl.innerHTML = tabsHTML();
      gridEl.innerHTML = gridHTML();
    }
    refresh();
    // だれを きがえる？
    const whoEl = el.querySelector('#dWho');
    function drawWho() {
      whoEl.innerHTML = whoList.length > 1 ? whoList.map((w) => `<button class="wface${w === dressWho ? ' sel' : ''}" data-who="${w}" aria-label="${w === 'fuutan' ? 'ふーたん' : esc(D.FRIENDS[w].name)}">${faceSVG(friendOpt(w))}</button>`).join('') : '';
    }
    drawWho();
    whoEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-who]');
      if (!b || b.dataset.who === dressWho) return;
      dressWho = b.dataset.who;
      R = rec(dressWho);
      eq = R.equippedItems;
      save();
      drawWho();
      refresh();
      reactTo(null);
      pyonSay(`${icon('dress')}${dressWho === 'fuutan' ? 'ふーたん' : esc(D.FRIENDS[dressWho].name) + 'ちゃん'}の ばん！`);
    });
    const selTab = tabsEl.querySelector('.sel');
    if (selTab) selTab.scrollIntoView({ inline: 'center', block: 'nearest' });

    tabsEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tab]');
      if (!b) return;
      S.tap();
      dressTab = b.dataset.tab;
      refresh();
      gridEl.scrollTop = 0;
    });
    function reactTo(it) {
      if (typeof drawWho === 'function') drawWho();
      S.pick();
      clearTimeout(exprT);
      drawChar(rand(['happy', 'joy', 'smile']), 'bounce');
      exprT = later(() => drawChar(), 900);
      const r = charBox.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height * (it && it.slot === 'shoes' ? 0.9 : it && it.slot === 'hair' ? 0.12 : 0.5), ['sparkle', 'star'], 6, 80);
      // くみあわせの はんのう
      const colors = Object.values(eq).filter(Boolean).map((id) => D.ITEMS[id] && D.ITEMS[id].color);
      const cnt = {};
      colors.forEach((c) => (cnt[c] = (cnt[c] || 0) + 1));
      const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
      if (it && it.type === 'usamimi') pyonSay(`${icon('heart')}おそろい！`);
      else if (it && it.type === 'bunnywand') pyonSay(`${icon('heart')}ぼくだ！`);
      else if (top && top[1] >= 4 && Math.random() < 0.6) pyonSay(`${icon('star')}いろが おそろい！`);
      else if (Math.random() < 0.3) pyonSay(rand([icon('heart'), icon('star'), `${icon('smile')}かわいい！`]));
    }
    gridEl.addEventListener('click', (e) => {
      const c = e.target.closest('button');
      if (!c) return;
      if (c.dataset.locked) {
        S.tap();
        pyonSay(c.dataset.locked === 'prize' ? `${icon('star')}なかまと あそんで もらおう` : `${icon('book')}おはなしで もらえるよ`, 'notify');
        return;
      }
      if (c.dataset.hs || c.dataset.hc) {
        if (c.dataset.hs) R.hairStyle = c.dataset.hs;
        if (c.dataset.hc) R.hairColor = c.dataset.hc;
        save();
        refresh();
        reactTo({ slot: 'hair', type: 'hairdo' });
        S.sparkle();
        return;
      }
      if (c.dataset.saved != null) {
        const o = G.character.savedOutfits[+c.dataset.saved];
        Object.assign(eq, { ...D.DEFAULT_OUTFIT, ...o.equippedItems });
        if (o.hairStyle && (o.who || 'fuutan') === dressWho) Object.assign(R, { hairStyle: o.hairStyle, hairColor: o.hairColor });
        save();
        reactTo(null);
        return;
      }
      const it = D.ITEMS[c.dataset.item];
      if (!it) return;
      const showing = eq[it.slot] === it.id && !(eq.onepiece && (it.slot === 'tops' || it.slot === 'skirt'));
      if (showing) {
        eq[it.slot] = null;
      } else {
        eq[it.slot] = it.id;
        if (it.slot === 'tops' || it.slot === 'skirt') {
          eq.onepiece = null;
          if (!eq.tops) eq.tops = 'blouse-pink';
          if (!eq.skirt) eq.skirt = 'frill-pink';
        }
      }
      clearNew(it.id);
      save();
      gridEl.innerHTML = gridHTML();
      tabsEl.innerHTML = tabsHTML();
      reactTo(showing ? null : it);
    });
    el.querySelector('[data-a=reset]').addEventListener('click', () => {
      Object.assign(eq, dressWho === 'fuutan' ? D.DEFAULT_OUTFIT : { ...EMPTY_OUTFIT, ...D.FRIENDS[dressWho].outfit });
      save(); refresh(); reactTo(null);
    });
    el.querySelector('[data-a=random]').addEventListener('click', () => {
      const pick = (slot, p = 1) => {
        if (Math.random() > p) return null;
        const l = D.ITEM_LIST.filter((i) => i.slot === slot && owned(i.id));
        return l.length ? rand(l).id : null;
      };
      if (Math.random() < 0.4) Object.assign(eq, { onepiece: pick('onepiece') });
      else Object.assign(eq, { onepiece: null, tops: pick('tops'), skirt: pick('skirt') });
      Object.assign(eq, { shoes: pick('shoes'), hair: pick('hair', 0.9), ribbon: pick('ribbon', 0.8), magic: pick('magic') });
      save(); refresh(); reactTo(null);
      S.sparkle();
    });
    el.querySelector('[data-a=save]').addEventListener('click', (e) => {
      G.character.savedOutfits.unshift({ id: 'o' + Date.now(), equippedItems: { ...eq }, hairStyle: R.hairStyle || 'long', hairColor: R.hairColor || 'pink', who: dressWho });
      if (G.character.savedOutfits.length > 30) G.character.savedOutfits.length = 30;
      save();
      S.done();
      const r = e.currentTarget.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, ['heart', 'lheart'], 10, 70);
      pyonSay(`${icon('save')}ほぞんしたよ`);
      if (dressTab === 'saved') gridEl.innerHTML = gridHTML();
    });
    el.querySelector('[data-a=henshin]').addEventListener('click', () => { S.pick(); go('henshin', { who: dressWho }); });
  };

  // ================= へんしん =================
  SCREENS.henshin = function (el, arg) {
    const who = arg.who && (arg.who === 'fuutan' || D.FRIENDS[arg.who]) ? arg.who : 'fuutan';
    const R = rec(who);
    const id = KP.uid('hs');
    let bg = `<defs>${KP.rg(id + 'g', [[0, '#FFFFFF', 0.95], [0.4, '#FFE9F2', 0.5], [1, '#FFE9F2', 0]])}</defs>`;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      bg += `<path d="M500,520 L${500 + Math.cos(a - 0.06) * 900},${520 + Math.sin(a - 0.06) * 900} L${500 + Math.cos(a + 0.06) * 900},${520 + Math.sin(a + 0.06) * 900}Z" fill="#fff" opacity="${i % 2 ? 0.08 : 0.15}"/>`;
    }
    for (let i = 0; i < 40; i++) {
      const x = (i * 263) % 1000, y = (i * 397) % 1000;
      bg += i % 3 ? KP.sparkle(x, y, 6 + (i % 4) * 3, '#fff', 0.7) : KP.star(x, y, 7 + (i % 3) * 3, '#FFE59A');
    }
    bg += `<circle cx="500" cy="520" r="360" fill="url(#${id}g)"/>`;
    let ring = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x = 50 + Math.cos(a) * 44, y = 50 + Math.sin(a) * 44;
      ring += i % 3 === 0 ? KP.heart(x, y, 3.4, '#F8BCD6', '#fff', 0.6) : i % 3 === 1 ? KP.star(x, y, 3.6, '#FFE59A', '#fff', 0.5) : KP.sparkle(x, y, 3.4, '#fff');
    }
    ring += `<circle cx="50" cy="50" r="44" fill="none" stroke="#fff" stroke-width=".5" stroke-dasharray="1 3" opacity=".8"/>`;
    el.className += ' henshin-stage';
    el.innerHTML =
      `<div class="stagebg">${svg('0 0 1000 1000', bg).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ')}</div>` +
      `<div class="hs-ring">${svg('0 0 100 100', ring)}</div>` +
      `<div class="hs-char" id="hsChar">${charSVG(friendOpt(who, { pose: 'cheer', expr: 'happy' }), 'silhouette')}</div>` +
      `<div class="hs-bunny" id="hsBun">${bunnySVG('happy')}</div>` +
      `<div class="hs-flash" id="hsFlash"></div>` +
      `<div class="hs-title" id="hsTitle">へんしん かんせい！</div>` +
      `<div class="skiphint" id="hsSkip">タッチで とばせるよ</div>` +
      `<div class="hs-actions" id="hsAct">` +
      `<button class="pill" data-a="room">${icon('house')}おへやへ</button>` +
      `<button class="pill main" data-a="again">${icon('magic', '#fff')}もういちど</button>` +
      `<button class="pill" data-a="dress">${icon('dress')}きせかえ</button></div>`;
    const charEl = el.querySelector('#hsChar');
    let done = false;
    S.henshin();
    // ひかりの つぶ
    every(() => {
      if (done) return;
      const r = charEl.getBoundingClientRect();
      burst(r.left + Math.random() * r.width, r.top + r.height * (0.4 + Math.random() * 0.6), ['sparkle', 'star'], 2, 60);
    }, 160);
    function finish() {
      if (done) return;
      done = true;
      const fl = el.querySelector('#hsFlash');
      fl.classList.add('go');
      charEl.innerHTML = svg(CHAR_VB, `<g class="bounce">${KP.drawChar(friendOpt(who, { pose: 'cheer', expr: 'joy' }))}</g>`);
      el.querySelector('.hs-ring').style.opacity = '.55';
      el.querySelector('#hsTitle').classList.add('show');
      el.querySelector('#hsBun').classList.add('show');
      el.querySelector('#hsBun').innerHTML = `<div class="hop">${bunnySVG('happy')}</div>`;
      el.querySelector('#hsSkip').remove();
      S.done();
      const r = charEl.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height * 0.4, ['star', 'heart', 'sparkle'], 18, 180);
      later(() => el.querySelector('#hsAct').classList.add('show'), 500);
      later(() => { const b = el.querySelector('#hsBun').getBoundingClientRect(); bubble(b.left + b.width / 2, b.top, `${icon('heart')}かわいい！`, 2200); }, 700);
      // きねんの しゃしん
      const snap = { ...R.equippedItems, _hs: R.hairStyle || 'long', _hc: R.hairColor || 'pink', _who: who };
      const last = G.album.find((a) => a.type === 'outfit');
      if (!last || JSON.stringify(last.snapshot) !== JSON.stringify(snap)) {
        G.album.unshift({ id: 'a' + Date.now(), type: 'outfit', createdAt: Date.now(), snapshot: snap });
        if (G.album.length > 60) G.album.length = 60;
        save();
      }
    }
    later(finish, 2000);
    el.addEventListener('click', (e) => { if (!done && !e.target.closest('button')) finish(); });
    el.querySelector('[data-a=room]').addEventListener('click', () => { S.tap(); go('room'); });
    el.querySelector('[data-a=again]').addEventListener('click', () => { S.tap(); go('henshin', { who }); });
    el.querySelector('[data-a=dress]').addEventListener('click', () => { S.tap(); go('dress', { who }); });
  };

  // ================= おへやづくり =================
  SCREENS.room = function (el, arg) {
    const room = G.room;
    let selected = null;
    let placing = arg.place || null;
    let mode = null; // 'wall' | 'floor'
    el.innerHTML =
      topbar('おへやづくり', `<button class="rbtn" data-a="photo" aria-label="しゃしん">${icon('camera')}</button>`) +
      `<div class="roomwrap" id="rWrap"></div>` +
      `<div class="tools" id="rTools"></div>` +
      `<div class="palette" id="rPal"></div>`;
    bindHome(el);
    const wrap = el.querySelector('#rWrap');
    const tools = el.querySelector('#rTools');
    const pal = el.querySelector('#rPal');
    let svgEl;
    function drawRoom() {
      wrap.innerHTML = svg('0 0 1000 1000', `<g id="rBG">${KP.drawRoomBG(room)}</g><g id="rF">${roomFurnitureSVG(room, { selected })}</g>`);
      svgEl = wrap.querySelector('svg');
      wrap.classList.toggle('placing', !!placing);
      if (placing) {
        const h = document.createElement('div');
        h.className = 'hint';
        h.innerHTML = `${icon('star')}おきたい ところを タッチ`;
        wrap.appendChild(h);
      }
      bindRoom();
    }
    function redrawFurniture() {
      svgEl.querySelector('#rF').innerHTML = roomFurnitureSVG(room, { selected });
    }
    function drawTools() {
      if (mode) {
        const isWall = mode === 'wall';
        const opts = isWall ? KP.WALLS : KP.FLOORS;
        tools.innerHTML = `<div class="choices">` + Object.keys(opts).map((k) =>
          `<button class="choice${(isWall ? room.wallpaperId : room.floorId) === k ? ' sel' : ''}" data-k="${k}">${svg(isWall ? '0 0 160 160' : '0 640 160 160', opts[k].draw(KP.uid('c'), 160, 360))}</button>`).join('') +
          `<button class="tbtn" data-t="ok"><span class="rbtn">${icon('check')}</span></button></div>`;
        return;
      }
      if (selected) {
        tools.innerHTML =
          `<div class="tbtn"><button class="rbtn" data-t="flip">${icon('flip')}</button>くるっ</div>` +
          `<div class="tbtn"><button class="rbtn" data-t="color">${icon('palette')}</button>いろ</div>` +
          `<div class="tbtn"><button class="rbtn" data-t="del">${icon('trash')}</button>しまう</div>` +
          `<div class="tbtn"><button class="rbtn" data-t="ok">${icon('check')}</button>できた</div>`;
      } else {
        tools.innerHTML =
          `<div class="tbtn"><button class="rbtn" data-t="wall">${icon('wall')}</button>かべがみ</div>` +
          `<div class="tbtn"><button class="rbtn" data-t="floor">${icon('floor')}</button>ゆか</div>` +
          `<span class="lbl">かぐを えらんで おいてね</span>`;
      }
    }
    function drawPalette() {
      pal.innerHTML = D.FURN_LIST.filter(furnOwned).map((f) =>
        `<button class="fcell${placing === f.id ? ' sel' : ''}" data-f="${f.id}" aria-label="${esc(f.name)}">${furnSVG(f.id, f.id === 'bear' ? 'peach' : f.id === 'stardeco' ? 'yellow' : 'lav')}${isNew(f.id) ? '<span class="new">NEW</span>' : ''}</button>`).join('');
      if (placing) {
        const b = pal.querySelector('.sel');
        if (b) b.scrollIntoView({ inline: 'center', block: 'nearest' });
      }
    }
    drawRoom(); drawTools(); drawPalette();

    pal.addEventListener('click', (e) => {
      const b = e.target.closest('[data-f]');
      if (!b) return;
      S.tap();
      placing = placing === b.dataset.f ? null : b.dataset.f;
      selected = null; mode = null;
      clearNew(b.dataset.f);
      drawRoom(); drawTools(); drawPalette();
    });
    tools.addEventListener('click', (e) => {
      const b = e.target.closest('[data-t],[data-k]');
      if (!b) return;
      S.tap();
      if (b.dataset.k) {
        if (mode === 'wall') room.wallpaperId = b.dataset.k; else room.floorId = b.dataset.k;
        save();
        svgEl.querySelector('#rBG').innerHTML = KP.drawRoomBG(room);
        drawTools();
        return;
      }
      const t = b.dataset.t;
      const p = room.furniture.find((x) => x.instanceId === selected);
      if (t === 'wall' || t === 'floor') { mode = t; drawTools(); return; }
      if (t === 'ok') { mode = null; selected = null; redrawFurniture(); drawTools(); return; }
      if (!p) return;
      if (t === 'flip') p.rotation = p.rotation === 180 ? 0 : 180;
      if (t === 'color') {
        const cs = D.FURN_COLORS;
        p.color = cs[(cs.indexOf(p.color) + 1) % cs.length];
        S.sparkle();
      }
      if (t === 'del') {
        room.furniture = room.furniture.filter((x) => x !== p);
        selected = null;
        drawTools();
      }
      save();
      redrawFurniture();
      if (t !== 'del') {
        const g = svgEl.querySelector(`[data-iid="${p.instanceId}"]`);
        if (g) { const r = g.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, ['sparkle', 'star'], 6, 60); }
      }
    });

    function bindRoom() {
      let drag = null;
      svgEl.addEventListener('pointerdown', (e) => {
        if (mode) { mode = null; drawTools(); }
        const pt = screenToSvg(svgEl, e.clientX, e.clientY);
        if (placing) {
          const fid = placing;
          const F = KP.FURN[fid];
          const s = furnScale(fid);
          const inst = {
            instanceId: 'i' + Date.now().toString(36), furnitureId: fid,
            x: Math.round(clamp(pt.x, 40, 960)), y: Math.round(clamp(pt.y + (F.h * s) / 2, F.wall ? F.h * s : 660, 1000)),
            rotation: 0, color: fid === 'bear' ? 'peach' : fid === 'stardeco' ? 'yellow' : 'lav',
          };
          room.furniture.push(inst);
          placing = null;
          selected = inst.instanceId;
          save();
          S.pop();
          drawRoom(); drawTools(); drawPalette();
          burst(e.clientX, e.clientY, ['star', 'sparkle', 'heart'], 10, 90);
          return;
        }
        const g = e.target.closest('.fitem');
        if (!g) {
          if (selected) { selected = null; redrawFurniture(); drawTools(); }
          return;
        }
        const p = room.furniture.find((x) => x.instanceId === g.dataset.iid);
        if (!p) return;
        if (selected !== p.instanceId) {
          selected = p.instanceId;
          redrawFurniture();
          drawTools();
          S.tap();
        }
        drag = { p, ox: pt.x - p.x, oy: pt.y - p.y, moved: false, id: e.pointerId };
        try { svgEl.setPointerCapture(e.pointerId); } catch (err) { /* なにもしない */ }
      });
      svgEl.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const pt = screenToSvg(svgEl, e.clientX, e.clientY);
        const F = KP.FURN[drag.p.furnitureId];
        const s = furnScale(drag.p.furnitureId);
        drag.p.x = Math.round(clamp(pt.x - drag.ox, 20, 980));
        drag.p.y = Math.round(clamp(pt.y - drag.oy, F.h * s * 0.5, 1000));
        drag.moved = true;
        const g = svgEl.querySelector(`[data-iid="${drag.p.instanceId}"]`);
        if (g) g.setAttribute('transform', `translate(${drag.p.x - (F.w * s) / 2} ${drag.p.y - F.h * s}) scale(${s})`);
      });
      const end = () => {
        if (!drag) return;
        if (drag.moved) { save(); redrawFurniture(); }
        drag = null;
      };
      svgEl.addEventListener('pointerup', end);
      svgEl.addEventListener('pointercancel', end);
    }

    el.querySelector('[data-a=photo]').addEventListener('click', () => {
      S.shutter();
      const sh = document.createElement('div');
      sh.className = 'shutter';
      document.body.appendChild(sh);
      setTimeout(() => sh.remove(), 520);
      G.album.unshift({ id: 'a' + Date.now(), type: 'room', createdAt: Date.now(), snapshot: JSON.parse(JSON.stringify({ wallpaperId: room.wallpaperId, floorId: room.floorId, furniture: room.furniture })) });
      if (G.album.length > 60) G.album.length = 60;
      save();
      const r = wrap.getBoundingClientRect();
      bubble(r.left + r.width / 2, r.top + 60, `${icon('album')}アルバムに いれたよ`);
    });
  };

  // ================= なかまたち =================
  const CAST = ['fuutan', 'pyonta', 'momo', 'mizuki', 'lemon'];
  // room を わたすと じぶんで かざった おへやで あそぶ
  function partyBG(room) {
    let o = room ? KP.drawRoomBG(room) + roomFurnitureSVG(room) : KP.drawRoomBG({ wallpaperId: 'dots', floorId: 'check', curtain: 'lav' });
    // ガーランド
    o += `<path d="M0,60 Q250,150 500,70 Q750,150 1000,60" fill="none" stroke="#C9B8E6" stroke-width="3"/>`;
    for (let i = 0; i < 12; i++) {
      const x = 40 + i * 83, t = x / 1000;
      const y = 60 + Math.sin(t * Math.PI * 2) * -10 + 70 * Math.sin(Math.PI * ((x % 500) / 500));
      o += `<path d="M${x - 22},${y - 6} L${x + 22},${y - 6} L${x},${y + 34}Z" fill="${['#F8BCD6', '#C9B5F5', '#FFE59A', '#BDEBDC'][i % 4]}" stroke="#fff" stroke-width="3"/>`;
    }
    if (room) return o;
    o += `<g transform="translate(60 360)">${KP.FURN.shelf.draw(KP.PAL.pink, KP.uid('p'))}</g>`;
    o += `<g transform="translate(780 400) scale(0.9)">${KP.FURN.closet.draw(KP.PAL.mint, KP.uid('p'))}</g>`;
    return o;
  }
  function castG(cid, st, opt = {}) {
    const s = cid === 'pyonta' ? 0.8 : 0.62;
    const w = cid === 'pyonta' ? 200 : 400, h = cid === 'pyonta' ? 220 : 640;
    const inner = cid === 'pyonta' ? KP.drawBunny(opt.expr || 'normal') : KP.drawChar(friendOpt(cid, { pose: opt.pose || 'stand', expr: opt.expr || 'smile' }));
    return `<g class="chr" data-c="${cid}" transform="translate(${st.x - (w * s) / 2} ${st.y - h * s}) scale(${s})"><g class="${opt.anim || 'breathe'}">${inner}</g></g>`;
  }
  const DEFAULT_POS = { fuutan: { x: 500, y: 960 }, pyonta: { x: 390, y: 990 }, momo: { x: 330, y: 900 }, mizuki: { x: 680, y: 900 }, lemon: { x: 630, y: 995 } };

  SCREENS.friends = function (el) {
    const st = {};
    const inRoom = () => CAST.filter((c) => G.friends.inRoom.includes(c) && (c === 'fuutan' || c === 'pyonta' || G.collection.unlockedCharacterIds.includes(c)));
    CAST.forEach((c) => { const p = G.friends.pos[c] || DEFAULT_POS[c]; st[c] = { x: clamp(p.x, 260, 740), y: p.y, expr: null, pose: null, anim: null }; });
    let activity = null; // 'tea' | 'show'
    el.innerHTML =
      topbar('なかまの おへや', `<button class="rbtn" data-a="photo" aria-label="しゃしん">${icon('camera')}</button>`) +
      `<div class="stage" id="fStage"></div>` +
      `<div class="fr-bar" id="fBar"></div>` +
      `<div class="acts-bar" id="fActs"></div>`;
    bindHome(el);
    const stage = el.querySelector('#fStage');
    const bar = el.querySelector('#fBar');
    const acts = el.querySelector('#fActs');
    stage.innerHTML = svg('0 0 1000 1000', `<g>${partyBG(G.room)}</g><g id="fTea"></g><g id="fCast"></g><g id="fLight" class="spot-light"></g>`).replace('<svg ', '<svg preserveAspectRatio="xMidYMax slice" ');
    const svgEl = stage.querySelector('svg');
    svgEl.style.touchAction = 'none';
    const castEl = svgEl.querySelector('#fCast');
    function drawCast() {
      castEl.innerHTML = inRoom().sort((a, b) => st[a].y - st[b].y).map((c) => castG(c, st[c], st[c])).join('');
    }
    function drawBar() {
      bar.innerHTML = CAST.map((c) => {
        if (c === 'pyonta') return `<button class="fr-face${inRoom().includes(c) ? ' in' : ''}" data-f="${c}">${svg('10 0 180 180', KP.drawBunny('normal'))}</button>`;
        const unlocked = c === 'fuutan' || G.collection.unlockedCharacterIds.includes(c);
        if (!unlocked) return `<button class="fr-face locked" data-f="${c}" data-locked="1">${icon('question')}</button>`;
        const isIn = inRoom().includes(c);
        return `<button class="fr-face${isIn ? ' in' : ''}" data-f="${c}">${faceSVG(friendOpt(c))}<span class="tag">${icon(isIn ? 'check' : 'call')}</span>${isNew(c) ? '' : ''}</button>`;
      }).join('');
    }
    function drawActs() {
      acts.innerHTML =
        `<button class="pill${activity === 'tea' ? ' sel' : ''}" data-act2="tea">${icon('tea')}おちゃかい</button>` +
        `<button class="pill${activity === 'show' ? ' sel' : ''}" data-act2="show">${icon('show')}ファッションショー</button>` +
        `<button class="pill main" data-play="1">${icon('star')}ゲームで あそぶ</button>`;
    }
    drawCast(); drawBar(); drawActs();
    G.newIds.filter((id) => D.FRIENDS[id]).forEach(clearNew);

    function react(cid, kind) {
      const s = st[cid];
      const exprs = cid === 'pyonta' ? ['happy', 'surprise', 'notify'] : ['joy', 'wink', 'surprise', 'happy', 'cat'];
      s.expr = kind === 'talk' ? (cid === 'pyonta' ? 'happy' : 'joy') : rand(exprs);
      s.pose = cid === 'pyonta' ? null : kind === 'talk' ? 'wave' : rand(['joy', 'wave', 'hips', 'cheer']);
      s.anim = cid === 'pyonta' ? 'hop' : 'bounce';
      drawCast();
      const p = svgToScreen(svgEl, s.x, s.y - (cid === 'pyonta' ? 170 : 340));
      const say = kind === 'talk' ? rand([icon('heart'), icon('music'), icon('smile'), icon('star'), icon('cake')]) : rand([icon('heart'), icon('star'), icon('music'), icon('smile')]);
      bubble(p.x, p.y, say);
      clearTimeout(s.t);
      s.t = later(() => { s.expr = null; s.pose = null; s.anim = null; drawCast(); }, 1500);
    }
    // ドラッグ・タップ
    let drag = null;
    svgEl.addEventListener('pointerdown', (e) => {
      const g = e.target.closest('.chr');
      if (!g) return;
      const cid = g.dataset.c;
      const pt = screenToSvg(svgEl, e.clientX, e.clientY);
      drag = { cid, ox: pt.x - st[cid].x, oy: pt.y - st[cid].y, sx: e.clientX, sy: e.clientY, moved: false, id: e.pointerId };
      try { svgEl.setPointerCapture(e.pointerId); } catch (err) { /* なにもしない */ }
    });
    svgEl.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 8) return;
      drag.moved = true;
      const pt = screenToSvg(svgEl, e.clientX, e.clientY);
      const s = st[drag.cid];
      s.x = clamp(pt.x - drag.ox, 260, 740);
      s.y = clamp(pt.y - drag.oy, 700, 1000);
      const g = castEl.querySelector(`[data-c="${drag.cid}"]`);
      const sc = drag.cid === 'pyonta' ? 0.8 : 0.62, w = drag.cid === 'pyonta' ? 200 : 400, h = drag.cid === 'pyonta' ? 220 : 640;
      if (g) g.setAttribute('transform', `translate(${s.x - (w * sc) / 2} ${s.y - h * sc}) scale(${sc})`);
    });
    const end = () => {
      if (!drag) return;
      const { cid, moved } = drag;
      drag = null;
      if (!moved) {
        S.boing();
        if (activity === 'show' && cid !== 'fuutan' && cid !== 'pyonta') {
          // ショーの とき：なかまの ふくが かわる
          const pick = (slot, p = 1) => { if (Math.random() > p) return null; const l = D.ITEM_LIST.filter((i) => i.slot === slot); return rand(l).id; };
          const eq = Math.random() < 0.5 ? { onepiece: pick('onepiece') } : { tops: pick('tops'), skirt: pick('skirt') };
          Object.assign(eq, { shoes: pick('shoes'), hair: pick('hair', 0.9), ribbon: pick('ribbon', 0.8), magic: pick('magic') });
          rec(cid).equippedItems = { ...EMPTY_OUTFIT, ...eq };
          save();
          S.sparkle();
          const p = svgToScreen(svgEl, st[cid].x, st[cid].y - 180);
          burst(p.x, p.y, ['star', 'sparkle', 'heart'], 12, 110);
        }
        react(cid, 'tap');
        return;
      }
      G.friends.pos[cid] = { x: Math.round(st[cid].x), y: Math.round(st[cid].y) };
      save();
      drawCast();
      // ちかくに いると おしゃべり
      const near = inRoom().filter((c) => c !== cid && Math.hypot(st[c].x - st[cid].x, (st[c].y - st[cid].y) * 1.5) < 190);
      if (near.length) {
        S.pop();
        react(cid, 'talk');
        later(() => react(near[0], 'talk'), 500);
        if (near[1]) later(() => react(near[1], 'talk'), 1000);
      }
    };
    svgEl.addEventListener('pointerup', end);
    svgEl.addEventListener('pointercancel', end);

    bar.addEventListener('click', (e) => {
      const b = e.target.closest('[data-f]');
      if (!b) return;
      const c = b.dataset.f;
      if (b.dataset.locked) {
        S.tap();
        const r = b.getBoundingClientRect();
        bubble(r.left + r.width / 2, r.top, `${icon('book')}おはなしで あえるかも`);
        return;
      }
      const list = G.friends.inRoom;
      if (list.includes(c)) {
        G.friends.inRoom = list.filter((x) => x !== c);
        S.tap();
      } else {
        list.push(c);
        st[c] = { ...DEFAULT_POS[c] };
        S.find();
        later(() => react(c, 'tap'), 60);
      }
      save();
      drawCast(); drawBar();
    });

    // おちゃかい・ショー
    const teaEl = svgEl.querySelector('#fTea');
    const lightEl = svgEl.querySelector('#fLight');
    let showTimer = null;
    function stopShow() { if (showTimer) { clearInterval(showTimer); showTimer = null; } lightEl.innerHTML = ''; }
    cleanup.push(stopShow);
    acts.addEventListener('click', (e) => {
      if (e.target.closest('[data-play]')) { S.pick(); go('play'); return; }
      const b = e.target.closest('[data-act2]');
      if (!b) return;
      const a = b.dataset.act2;
      stopShow();
      teaEl.innerHTML = '';
      if (activity === a) { activity = null; drawActs(); S.tap(); return; }
      activity = a;
      drawActs();
      const cast = inRoom();
      if (a === 'tea') {
        S.done();
        teaEl.innerHTML = `<g transform="translate(368 742) scale(1.2)">${KP.FURN.teatable.draw(KP.PAL.pink, KP.uid('t'))}</g>`;
        const seats = [[320, 905], [680, 905], [400, 1000], [600, 1000], [500, 1000]];
        cast.forEach((c, i) => { const s = seats[i % seats.length]; st[c].x = s[0]; st[c].y = s[1]; st[c].pose = c === 'pyonta' ? null : 'tea'; st[c].expr = c === 'pyonta' ? 'happy' : 'happy'; });
        drawCast();
        cast.forEach((c, i) => later(() => {
          const p = svgToScreen(svgEl, st[c].x, st[c].y - (c === 'pyonta' ? 170 : 340));
          bubble(p.x, p.y, rand([`${icon('tea')}おいしいね`, `${icon('cake')}`, `${icon('heart')}`]), 2200);
        }, 300 + i * 450));
        later(() => cast.forEach((c) => { st[c].pose = null; st[c].expr = null; }) || drawCast(), 3500);
      } else if (a === 'show') {
        S.henshin();
        const order = cast.slice();
        order.forEach((c, i) => { st[c].x = order.length > 1 ? 290 + (i * 420) / (order.length - 1) : 500; st[c].y = 880; });
        drawCast();
        let k = 0;
        const step = () => {
          const c = order[k % order.length];
          k++;
          order.forEach((o) => { st[o].y = 880; st[o].expr = null; st[o].pose = null; });
          st[c].y = 990;
          st[c].expr = c === 'pyonta' ? 'happy' : 'joy';
          st[c].pose = c === 'pyonta' ? null : rand(['cheer', 'joy', 'wave']);
          st[c].anim = c === 'pyonta' ? 'hop' : 'bounce';
          drawCast();
          lightEl.innerHTML = `<defs>${KP.rg('slg', [[0, '#FFF6CF', 0.65], [1, '#FFF6CF', 0]])}</defs><path d="M${st[c].x - 40},0 L${st[c].x + 40},0 L${st[c].x + 190},1000 L${st[c].x - 190},1000Z" fill="url(#slg)"/>`;
          const p = svgToScreen(svgEl, st[c].x, st[c].y - 200);
          burst(p.x, p.y, ['star', 'sparkle', 'heart'], 10, 120);
          S.sparkle();
          if (k >= order.length * 2) {
            stopShow();
            later(() => { order.forEach((o) => { st[o].y = 930; st[o].expr = o === 'pyonta' ? 'happy' : 'happy'; st[o].pose = o === 'pyonta' ? null : 'cheer'; }); drawCast(); S.done(); }, 1400);
          }
        };
        later(step, 300);
        showTimer = setInterval(step, 1700);
      }
    });

    el.querySelector('[data-a=photo]').addEventListener('click', () => {
      S.shutter();
      const sh = document.createElement('div');
      sh.className = 'shutter';
      document.body.appendChild(sh);
      setTimeout(() => sh.remove(), 520);
      const chars = inRoom().map((c) => ({ id: c, x: st[c].x, y: st[c].y, expr: st[c].expr, pose: st[c].pose, outfit: c === 'pyonta' ? null : { ...rec(c).equippedItems }, ...(c === 'pyonta' ? {} : { hairStyle: rec(c).hairStyle, hairColor: rec(c).hairColor }) }));
      G.album.unshift({ id: 'a' + Date.now(), type: 'photo', createdAt: Date.now(), snapshot: { chars, tea: activity === 'tea', room: JSON.parse(JSON.stringify(G.room)) } });
      if (G.album.length > 60) G.album.length = 60;
      save();
      const r = stage.getBoundingClientRect();
      bubble(r.left + r.width / 2, r.top + 80, `${icon('album')}アルバムに いれたよ`);
    });
  };

  // ================= アルバム =================
  function snapshotSVG(a) {
    if (a.type === 'outfit') {
      const id = KP.uid('ao');
      return svg('0 0 400 500',
        `<defs>${KP.rg(id + 'g', [[0, '#FFFFFF'], [0.5, '#EEE6FF'], [1, '#C9B5F5']], 0.5, 0.45, 0.7)}</defs><rect width="400" height="500" fill="url(#${id}g)"/>` +
        [[40, 60], [350, 90], [60, 400], [340, 380], [200, 30]].map(([x, y], i) => (i % 2 ? KP.star(x, y, 12, '#FFE59A') : KP.sparkle(x, y, 14, '#fff'))).join('') +
        `<g transform="translate(70 0) scale(0.66)">${KP.drawChar({ ...snapHair(a.snapshot), outfit: toDraw(a.snapshot), pose: 'cheer', expr: 'joy' })}</g>` +
        `<g transform="translate(14 360) scale(0.6)">${KP.drawBunny('happy')}</g>`);
    }
    if (A.snapExtra) { const x = A.snapExtra(a); if (x) return x; }
    if (a.type === 'cake') {
      return svg('40 60 520 420', `<rect x="0" y="0" width="600" height="520" fill="#FFF6FA"/>` + drawCake(a.snapshot) + KP.sparkle(90, 120, 14, '#FFE59A') + KP.heart(510, 140, 12, '#F8BCD6')).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
    }
    if (a.type === 'room') {
      return svg('100 0 800 1000', KP.drawRoomBG(a.snapshot) + roomFurnitureSVG(a.snapshot)).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
    }
    const s = a.snapshot;
    let o = partyBG(s.room);
    if (s.tea) o += `<g transform="translate(368 742) scale(1.2)">${KP.FURN.teatable.draw(KP.PAL.pink, KP.uid('t'))}</g>`;
    o += [...s.chars].sort((p, q) => p.y - q.y).map((c) => {
      if (c.id === 'pyonta') return castG('pyonta', c, { expr: c.expr || 'happy', anim: 'x' });
      const base = c.id === 'fuutan' || c.hairStyle ? snapHair(c) : D.FRIENDS[c.id];
      const sc = 0.62;
      return `<g transform="translate(${c.x - 124} ${c.y - 640 * sc}) scale(${sc})">${KP.drawChar({ hairStyle: base.hairStyle, hairColor: base.hairColor, eyeColor: base.eyeColor, outfit: toDraw(c.outfit || {}), pose: c.pose || 'stand', expr: c.expr || 'smile' })}</g>`;
    }).join('');
    return svg('100 200 800 800', o).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
  }
  SCREENS.album = function (el) {
    el.innerHTML = topbar('アルバム') + `<div class="album-body" id="aBody"></div>`;
    bindHome(el);
    const body = el.querySelector('#aBody');
    const fmt = (t) => { const d = new Date(t); return `${d.getMonth() + 1}がつ ${d.getDate()}にち`; };
    const capOf = (a) => ({ outfit: 'へんしん', room: 'おへや', cake: 'ケーキ', show: 'ファッションショー', dish: 'おつかい', clinic: 'はいしゃさん' }[a.type] || 'なかまと');
    function render() {
      let o = `<div class="sec-h">${icon('camera')}きねんの しゃしん</div>`;
      o += G.album.length
        ? `<div class="agrid">` + G.album.map((a, i) => `<div class="photo"><button class="pic" data-v="${i}" style="display:block;width:100%">${snapshotSVG(a)}</button><div class="cap">${capOf(a)}・${fmt(a.createdAt)}</div><button class="del" data-d="${i}" aria-label="けす">${icon('trash')}</button></div>`).join('') + `</div>`
        : `<div class="empty-msg">へんしん したり、しゃしんを とると ここに はいるよ</div>`;
      o += `<div class="sec-h">${icon('save')}おきにいり コーデ</div>`;
      o += G.character.savedOutfits.length
        ? `<div class="agrid">` + G.character.savedOutfits.map((s, i) => `<div class="photo"><button class="pic" data-o="${i}" style="display:block;width:100%">${snapshotSVG({ type: 'outfit', snapshot: { ...s.equippedItems, _hs: s.hairStyle, _hc: s.hairColor } })}</button><div class="cap">きてみる</div><button class="del" data-od="${i}" aria-label="けす">${icon('trash')}</button></div>`).join('') + `</div>`
        : `<div class="empty-msg">きせかえで「ほぞん」すると ここに はいるよ</div>`;
      o += `<div class="sec-h">${icon('star')}みつけた もの・なかま</div><div class="cgrid">`;
      o += D.FINDS.map((f) => {
        const got = G.collection.discoveredItemIds.includes(f.id) || (f.kind === 'friend' && G.collection.unlockedCharacterIds.includes(f.id));
        return `<div class="slot${got ? ' got' : ''}">${got ? findSVG(f) : svg('0 0 100 100', KP.sparkle(50, 50, 22, '#E2D6F6'))}</div>`;
      }).join('') + `</div>`;
      body.innerHTML = o;
    }
    render();
    body.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      S.tap();
      if (b.dataset.v != null) {
        const v = document.createElement('div');
        v.className = 'viewer';
        v.innerHTML = `<div class="pic">${snapshotSVG(G.album[+b.dataset.v])}</div>`;
        v.addEventListener('click', () => v.remove());
        document.body.appendChild(v);
      } else if (b.dataset.o != null) {
        const s = G.character.savedOutfits[+b.dataset.o];
        const w = s.who && (s.who === 'fuutan' || G.collection.unlockedCharacterIds.includes(s.who)) ? s.who : 'fuutan';
        Object.assign(rec(w).equippedItems, { ...EMPTY_OUTFIT, ...s.equippedItems });
        if (s.hairStyle) Object.assign(rec(w), { hairStyle: s.hairStyle, hairColor: s.hairColor });
        save();
        go('dress', { who: w });
      } else if (b.dataset.d != null || b.dataset.od != null) {
        const isO = b.dataset.od != null;
        const idx = +(isO ? b.dataset.od : b.dataset.d);
        const m = document.createElement('div');
        m.className = 'modal';
        m.innerHTML = `<div class="card"><h2 style="font-size:24px;color:var(--ink)">この しゃしんを けす？</h2><div class="acts" style="margin-top:14px"><button class="pill" data-y="1">${icon('trash')}けす</button><button class="pill main" data-n="1">${icon('heart', '#fff')}のこす</button></div></div>`;
        document.body.appendChild(m);
        m.addEventListener('click', (ev) => {
          const y = ev.target.closest('[data-y]'), n = ev.target.closest('[data-n]');
          if (!y && !n && ev.target !== m) return;
          if (y) {
            if (isO) G.character.savedOutfits.splice(idx, 1); else G.album.splice(idx, 1);
            save();
            render();
          }
          S.tap();
          m.remove();
        });
      }
    });
  };

  // ================= なかまと あそぶ（ミニゲーム） =================
  // しっぱい・じかんぎれ なし。おわると スタンプが もらえて、たまると プレゼント。
  const PRIZES = [
    { at: 2, kind: 'item', id: 'princess-yellow' },
    { at: 4, kind: 'item', id: 'boots-pink' },
    { at: 6, kind: 'item', id: 'hearttop-lav' },
    { at: 8, kind: 'furn', id: 'castle' },
    { at: 10, kind: 'item', id: 'bigbow-lav' },
    { at: 12, kind: 'item', id: 'crown-lav' },
    { at: 14, kind: 'furn', id: 'piano' },
    { at: 16, kind: 'furn', id: 'dollhouse' },
  ];
  const isPrize = (id) => PRIZES.some((p) => p.id === id);
  const playMates = () => ['fuutan', ...Object.keys(D.FRIENDS).filter((f) => G.collection.unlockedCharacterIds.includes(f))];
  const mateName = (w) => (w === 'fuutan' ? 'ふーたん' : w === 'pyonta' ? 'ぴょんた' : D.FRIENDS[w].name + 'ちゃん');
  const mateFace = (w, expr) => (w === 'pyonta' ? svg('10 0 180 180', KP.drawBunny(expr === 'joy' ? 'happy' : 'normal')) : faceSVG(friendOpt(w, { expr: expr || 'smile' })));

  function gameTop(title) {
    return `<div class="topbar"><button class="rbtn" data-act="back" aria-label="もどる">${icon('back')}</button><div class="title">${title}</div><button class="rbtn" data-act="home" aria-label="ホーム">${icon('home')}</button></div>`;
  }
  function bindGameTop(el) {
    bindHome(el);
    el.querySelector('[data-act=back]').addEventListener('click', () => { S.tap(); go('play'); });
  }
  const STAMP = (n) => svg('0 0 100 100', `<circle cx="50" cy="50" r="44" fill="#FFF0F6" stroke="#E07AA8" stroke-width="5" stroke-dasharray="7 5"/>` + KP.star(50, 50, 30, '#FFE28A', '#E9B44C', 4) + KP.heart(50, 54, 9, '#F29CC2'));

  function grantPrize() {
    const prize = PRIZES.find((p) => p.at === G.stamps);
    if (prize && !G.collection.discoveredItemIds.includes(prize.id)) {
      G.collection.discoveredItemIds.push(prize.id);
      if (!G.newIds.includes(prize.id)) G.newIds.push(prize.id);
    }
    return prize;
  }
  // opts.cont: たんけんの とちゅう（「つづける」だけ）
  function finishGame(again, opts = {}) {
    G.stamps = (G.stamps || 0) + 1;
    const prize = grantPrize();
    save();
    S.done();
    later(() => {
      const m = document.createElement('div');
      m.className = 'modal';
      const next = PRIZES.find((p) => p.at > G.stamps);
      m.innerHTML = `<div class="card"><h2>やったね！</h2>` +
        `<div class="big stampbig"><div class="rays"></div>${STAMP()}</div>` +
        `<div class="nm">スタンプ ${G.stamps}こめ！</div>` +
        (prize ? `<div class="prize"><div class="ptitle">${icon('star')}プレゼント！</div><div class="pimg">${findSVG(prize)}</div><div class="pname">${esc(findName(prize))}</div></div>`
          : next ? `<div class="nexthint">あと ${next.at - G.stamps}こで プレゼント</div>` : '') +
        `<div class="acts">` +
        (prize ? `<button class="pill main" data-a="use">${icon(prize.kind === 'furn' ? 'house' : 'dress', '#fff')}${prize.kind === 'furn' ? 'おへやに おく' : 'きてみる'}</button>` : '') +
        (opts.cont ? `<button class="pill${prize ? '' : ' main'}" data-a="again">${icon('search', prize ? undefined : '#fff')}つづける</button>`
          : `<button class="pill${prize ? '' : ' main'}" data-a="again">${icon('reset', prize ? undefined : '#fff')}もういちど</button>` +
          `<button class="pill" data-a="menu">${icon('friends')}ほかの あそび</button>`) + `</div>` +
        `<div class="pyon-mini">${bunnySVG('happy')}</div></div>`;
      document.body.appendChild(m);
      const r = m.querySelector('.big').getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, ['star', 'heart', 'sparkle'], 16, 170);
      m.querySelector('[data-a=again]').addEventListener('click', () => { S.tap(); m.remove(); again(); });
      const mb = m.querySelector('[data-a=menu]');
      if (mb) mb.addEventListener('click', () => { S.tap(); m.remove(); go('play'); });
      const u = m.querySelector('[data-a=use]');
      if (u) u.addEventListener('click', () => {
        S.pick();
        m.remove();
        if (prize.kind === 'furn') go('room', { place: prize.id });
        else {
          const it = D.ITEMS[prize.id];
          G.character.equippedItems[it.slot] = it.id;
          if (it.slot === 'onepiece') G.character.equippedItems.onepiece = it.id;
          clearNew(it.id);
          save();
          go('dress', { tab: it.slot, who: 'fuutan' });
        }
      });
    }, 700);
  }

  // ---- メニュー ----
  const GAMES = [
    { id: 'hide', name: 'かくれんぼ', sub: 'どこに かくれたかな？', cls: 'g1', icon: () => KP.ICONS.search('#fff') },
    { id: 'memory', name: 'カードあわせ', sub: 'おなじ えを さがそう', cls: 'g2', icon: () => `<rect x="14" y="20" width="38" height="56" rx="8" fill="#fff" transform="rotate(-10 33 48)"/><rect x="48" y="20" width="38" height="56" rx="8" fill="#fff" transform="rotate(10 67 48)"/>${KP.heart(34, 46, 9, '#F29CC2')}${KP.heart(66, 46, 9, '#F29CC2')}` },
    { id: 'balloon', name: 'ふうせん あつめ', sub: 'ふうせんを タッチ', cls: 'g3', icon: () => `<ellipse cx="38" cy="38" rx="20" ry="24" fill="#fff"/><ellipse cx="64" cy="44" rx="18" ry="22" fill="#FFE9F2"/><path d="M38,62 Q34,76 42,92 M64,66 Q68,80 60,92" stroke="#fff" stroke-width="3" fill="none"/>` },
    { id: 'cake', name: 'ケーキづくり', sub: 'みんなで パーティー', cls: 'g4', icon: () => KP.ICONS.cake('#fff').replace('#FFF6E8', '#fff') },
  ];
  SCREENS.play = function (el) {
    const n = G.stamps || 0;
    let card = '';
    for (let i = 1; i <= 16; i++) {
      const pz = PRIZES.find((p) => p.at === i);
      card += `<div class="st${i <= n ? ' got' : ''}${pz ? ' gift' : ''}">${i <= n ? STAMP() : pz ? findSVG(pz) : `<span>${i}</span>`}</div>`;
    }
    el.innerHTML = topbar('なかまと あそぶ') +
      `<div class="play-body"><div class="mates">${playMates().concat('pyonta').map((w) => `<div class="mate">${mateFace(w, 'joy')}</div>`).join('')}</div>` +
      `<div class="gcards">${GAMES.map((g) => `<button class="gcard ${g.cls}" data-g="${g.id}"><span class="gi">${svg('0 0 100 100', g.icon())}</span><span class="gn">${g.name}</span><span class="gs">${g.sub}</span></button>`).join('')}</div>` +
      `<div class="stampcard"><div class="sc-h">${icon('star')}スタンプカード ${n > 16 ? `<span class="sc-n">${n}こ</span>` : ''}</div><div class="sc-grid">${card}</div></div></div>`;
    bindHome(el);
    el.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => { S.pick(); go(b.dataset.g); }));
  };

  // ---- かくれんぼ ----
  const HIDE_SPOTS = [
    { id: 'plant', furn: 'plant', color: 'pink', x: 240, y: 730, s: 1.2 },
    { id: 'shelf', furn: 'shelf', color: 'mint', x: 475, y: 725, s: 1.0 },
    { id: 'closet', furn: 'closet', color: 'lav', x: 730, y: 722, s: 0.98 },
    { id: 'sofa', furn: 'sofa', color: 'pink', x: 320, y: 975, s: 1.1 },
    { id: 'bed', furn: 'bed', color: 'blue', x: 680, y: 985, s: 0.95 },
  ];
  function spotTop(sp) { return sp.y - KP.FURN[sp.furn].h * sp.s; }
  // みつけた こは まえに ならぶ
  let foundPos = (i) => ({ x: 260 + i * 160, y: 990 });
  // じぶんの おへやの かぐで かくれる（せが たかくて はばの ある かぐ）
  function roomHideSpots() {
    return G.room.furniture.map((p) => ({ id: p.instanceId, furn: p.furnitureId, color: p.color, x: p.x, y: p.y, s: furnScale(p.furnitureId), flip: p.rotation === 180 }))
      .filter((sp) => { const F = KP.FURN[sp.furn]; return F && !F.flat && !F.wall && F.h * sp.s >= 150 && F.w * sp.s >= 120; });
  }
  function hiderG(w, sp, found, side = 0) {
    if (found) sp = { ...found, furn: 'plant', s: 0 };
    if (w === 'pyonta') {
      const sc = 0.62;
      const y = found ? sp.y : spotTop(sp) - 40;
      const x = found ? sp.x : sp.x + 20;
      return `<g transform="translate(${x - 100 * sc} ${found ? y - 220 * sc : y}) scale(${sc})"><g class="hider${found ? ' bounce' : ' peek'}">${KP.drawBunny(found ? 'happy' : 'normal')}</g></g>`;
    }
    const sc = found ? 0.42 : Math.min(0.42, (KP.FURN[sp.furn].h * sp.s + 40) / 600);
    const opt = friendOpt(w, found ? { expr: 'joy', pose: 'joy' } : { expr: 'lookL' });
    if (found) return `<g transform="translate(${sp.x - 200 * sc} ${sp.y - 640 * sc}) scale(${sc})"><g class="hider bounce">${KP.drawChar(opt)}</g></g>`;
    // あたまの うえだけ ちょっと でている
    const y = spotTop(sp) - 150 * sc;
    return `<g transform="translate(${sp.x - 30 - 200 * sc} ${y}) scale(${sc})"><g class="hider peek">${KP.drawChar(opt)}</g></g>`;
  }
  SCREENS.hide = function (el) {
    const hiders = playMates().filter((w) => w !== 'fuutan').concat('pyonta');
    const roomSpots = roomHideSpots();
    const useRoom = roomSpots.length >= hiders.length + 1;
    const SPOTS = useRoom ? roomSpots : HIDE_SPOTS;
    foundPos = useRoom ? (i) => ({ x: 200 + i * 170, y: 995 }) : (i) => ({ x: 260 + i * 160, y: 990 });
    const spots = SPOTS.slice().sort(() => Math.random() - 0.5);
    const where = {};
    hiders.forEach((w, i) => (where[spots[i].id] = w));
    const found = [];
    el.innerHTML = gameTop('かくれんぼ') +
      `<div class="stage" id="hStage"></div>` +
      `<div class="foundbar" id="hBar"></div>`;
    bindGameTop(el);
    const stage = el.querySelector('#hStage');
    const bar = el.querySelector('#hBar');
    function drawBar() {
      bar.innerHTML = `<span class="fb-l">みつけた</span>` + hiders.map((w) => `<div class="slot${found.includes(w) ? ' got' : ''}">${found.includes(w) ? mateFace(w, 'joy') : svg('0 0 100 100', `<circle cx="50" cy="50" r="30" fill="#EDE5FB"/><text x="50" y="62" text-anchor="middle" font-size="36" font-weight="900" fill="#C9B8E6" font-family="sans-serif">?</text>`)}</div>`).join('');
    }
    function draw() {
      const furnG2 = (sp) => { const F = KP.FURN[sp.furn]; return `<g transform="translate(${sp.x - (F.w * sp.s) / 2} ${spotTop(sp)}) scale(${sp.s})"><g class="spot" data-spot="${sp.id}">${sp.flip ? `<g transform="translate(${F.w} 0) scale(-1 1)">` : '<g>'}${F.draw(KP.PAL[sp.color] || KP.PAL.lav, KP.uid('h'))}</g></g></g>`; };
      const hid = (sp) => (where[sp.id] && !found.includes(where[sp.id]) ? hiderG(where[sp.id], sp, false) : '');
      let o;
      if (useRoom) {
        o = KP.drawRoomBG(G.room);
        const list = [...G.room.furniture].sort((a, b) => {
          const fa = KP.FURN[a.furnitureId], fb = KP.FURN[b.furnitureId];
          return (fa.flat ? 0 : fa.wall ? 1 : 2) - (fb.flat ? 0 : fb.wall ? 1 : 2) || a.y - b.y;
        });
        for (const p of list) {
          const sp = SPOTS.find((x) => x.id === p.instanceId);
          o += sp ? hid(sp) + furnG2(sp) : furnG(p, false);
        }
      } else {
        o = KP.drawRoomBG({ wallpaperId: 'hearts', floorId: 'wood', curtain: 'pink' });
        const back = HIDE_SPOTS.filter((x) => x.y < 800), front = HIDE_SPOTS.filter((x) => x.y >= 800);
        for (const row of [back, front]) {
          for (const sp of row) o += hid(sp);
          for (const sp of row) o += furnG2(sp);
        }
      }
      found.forEach((w, i) => (o += hiderG(w, null, foundPos(i))));
      o += `<g id="hHint"></g>`;
      stage.innerHTML = svg(useRoom ? '0 120 1000 880' : '150 180 700 820', o);
      bindSpots();
    }
    let lastFind = Date.now();
    function bindSpots() {
      const sv = stage.querySelector('svg');
      sv.querySelectorAll('.spot').forEach((g) => g.addEventListener('click', () => {
        const id = g.dataset.spot;
        const sp = SPOTS.find((s) => s.id === id);
        const w = where[id];
        const p = svgToScreen(sv, sp.x, spotTop(sp) + 40);
        if (w && !found.includes(w)) {
          found.push(w);
          lastFind = Date.now();
          S.find();
          draw();
          drawBar();
          const sv2 = stage.querySelector('svg');
          const fp = foundPos(found.length - 1);
          const q = svgToScreen(sv2, fp.x, fp.y - 230);
          burst(q.x, q.y + 60, ['star', 'heart', 'sparkle'], 12, 120);
          bubble(q.x, q.y, `${icon('heart')}みつかっちゃった！`);
          if (found.length === hiders.length) later(() => finishGame(() => go('hide')), 1400);
        } else {
          g.classList.remove('wiggle'); void g.getBBox(); g.classList.add('wiggle');
          S.pop();
          burst(p.x, p.y, ['sparkle', 'star'], 6, 70);
          if (Math.random() < 0.5) bubble(p.x, p.y - 10, `${icon('search')}ここには いないね`, 1400);
        }
      }));
    }
    draw();
    drawBar();
    const intro = document.createElement('div');
    intro.className = 'hint';
    intro.style.top = '82px';
    intro.innerHTML = `${icon('search')}みんな どこに かくれたかな？`;
    el.appendChild(intro);
    later(() => intro.remove(), 3500);
    // ヒント：しばらく みつからないと キラキラ
    every(() => {
      if (found.length === hiders.length || Date.now() - lastFind < 9000) return;
      lastFind = Date.now();
      const id = Object.keys(where).find((k) => !found.includes(where[k]));
      const sp = SPOTS.find((s) => s.id === id);
      const h = stage.querySelector('#hHint');
      if (h) h.innerHTML = `<g class="floaty">${KP.sparkle(sp.x + 50, spotTop(sp) - 40, 26, '#FFE28A')}${KP.sparkle(sp.x - 50, spotTop(sp) - 10, 16, '#fff')}</g>`;
      later(() => { const h2 = stage.querySelector('#hHint'); if (h2) h2.innerHTML = ''; }, 2600);
    }, 1500);
  };

  // ---- カードあわせ ----
  SCREENS.memory = function (el) {
    const pool = [
      ...D.ITEM_LIST.filter((i) => owned(i.id)).map((i) => ({ k: i.id, html: () => itemSVG(i) })),
      ...playMates().map((w) => ({ k: 'f-' + w, html: () => mateFace(w, 'joy') })),
      { k: 'pyonta', html: () => mateFace('pyonta', 'joy') },
    ].sort(() => Math.random() - 0.5);
    // なかまの かおは かならず いれる
    const faces = pool.filter((p) => p.k.startsWith('f-') || p.k === 'pyonta').slice(0, 2);
    const rest = pool.filter((p) => !faces.includes(p)).slice(0, 6 - faces.length);
    const pairs = faces.concat(rest);
    const cards = pairs.concat(pairs).map((p, i) => ({ ...p, i, open: false, done: false })).sort(() => Math.random() - 0.5);
    el.innerHTML = gameTop('カードあわせ') +
      `<div class="mem-top" id="mTop"></div><div class="mem-wrap"><div class="mem-grid" id="mGrid"></div></div>`;
    bindGameTop(el);
    const grid = el.querySelector('#mGrid');
    const top = el.querySelector('#mTop');
    const mates = playMates().concat('pyonta');
    let got = 0;
    function drawTop(cheer) {
      top.innerHTML = `<div class="mates">${mates.map((w) => `<div class="mate${cheer ? ' hop' : ''}">${mateFace(w, cheer ? 'joy' : 'smile')}</div>`).join('')}</div>` +
        `<div class="pairs">${pairs.map((_, i) => `<span class="pp${i < got ? ' got' : ''}">${svg('0 0 100 100', KP.star(50, 50, 40, i < got ? '#FFE28A' : '#EDE5FB', i < got ? '#E9B44C' : '#DCD0F0', 5))}</span>`).join('')}</div>`;
    }
    const back = svg('0 0 100 130', `<rect x="4" y="4" width="92" height="122" rx="14" fill="url(#mb)" stroke="#fff" stroke-width="6"/><defs>${KP.lg('mb', [[0, '#D9C9FA'], [1, '#F6B7D2']])}</defs>${KP.star(50, 65, 22, '#fff', null)}${KP.sparkle(26, 30, 7, '#fff')}${KP.sparkle(76, 104, 7, '#fff')}`);
    function drawGrid() {
      grid.innerHTML = cards.map((c, n) => `<button class="mcard${c.open || c.done ? ' open' : ''}${c.done ? ' done' : ''}" data-n="${n}"><span class="face">${c.html()}</span><span class="back">${back}</span></button>`).join('');
    }
    drawTop(false);
    drawGrid();
    let first = null, lock = false;
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('[data-n]');
      if (!b || lock) return;
      const c = cards[+b.dataset.n];
      if (c.open || c.done) return;
      c.open = true;
      b.classList.add('open');
      S.tap();
      if (!first) { first = c; return; }
      const a = first;
      first = null;
      if (a.k === c.k) {
        a.done = c.done = true;
        got++;
        later(() => {
          S.sparkle();
          grid.querySelectorAll('.mcard').forEach((x, n) => { if (cards[n] === a || cards[n] === c) { x.classList.add('done'); const r = x.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, ['star', 'sparkle'], 6, 60); } });
          drawTop(true);
          later(() => drawTop(false), 900);
          if (got === pairs.length) later(() => finishGame(() => go('memory')), 900);
        }, 250);
      } else {
        lock = true;
        later(() => {
          a.open = c.open = false;
          grid.querySelectorAll('.mcard').forEach((x, n) => { if (cards[n] === a || cards[n] === c) x.classList.remove('open'); });
          lock = false;
        }, 1000);
      }
    });
  };

  // ---- ふうせん あつめ ----
  SCREENS.balloon = function (el) {
    const GOAL = 20;
    let n = 0, k = 0, over = false;
    el.innerHTML = gameTop('ふうせん あつめ') +
      `<div class="bal-meter"><div class="bm-bar"><div class="bm-fill" id="bFill"></div></div><span id="bNum">0 / ${GOAL}</span></div>` +
      `<div class="bal-stage" id="bStage"><div class="bal-bg">${svg('0 0 1000 1000', partyBG(G.room)).replace('<svg ', '<svg preserveAspectRatio="xMidYMax slice" ')}</div><div class="bal-mates" id="bMates"></div></div>`;
    bindGameTop(el);
    const stage = el.querySelector('#bStage');
    const fill = el.querySelector('#bFill');
    const num = el.querySelector('#bNum');
    const matesEl = el.querySelector('#bMates');
    const mates = playMates().concat('pyonta');
    function drawMates(cheer) {
      matesEl.innerHTML = mates.map((w) => `<div class="bm${cheer ? ' hop' : ''}">${w === 'pyonta' ? bunnySVG(cheer ? 'happy' : 'normal') : charSVG(friendOpt(w, { pose: cheer ? 'joy' : 'wave', expr: cheer ? 'joy' : 'smile' }))}</div>`).join('');
    }
    drawMates(false);
    const COLORS = [['#F8BCD6', '#E07AA8'], ['#C9B5F5', '#8C6FD6'], ['#BDEBDC', '#6FC3A8'], ['#BCD4FA', '#6F98E2'], ['#FFE59A', '#E9B44C']];
    function spawn() {
      if (over) return;
      k++;
      const gold = k % 9 === 0;
      const [c, d] = gold ? ['#FFE28A', '#D29A3A'] : rand(COLORS);
      const b = document.createElement('button');
      b.className = 'bln' + (gold ? ' gold' : '');
      const W = stage.clientWidth;
      const size = Math.min(110, Math.max(76, W * 0.2));
      b.style.width = size + 'px';
      b.style.height = size * 1.4 + 'px';
      b.style.left = (Math.random() * (W - size)) + 'px';
      b.style.animationDuration = (6 + Math.random() * 2.5) + 's';
      const inner = gold ? KP.star(50, 50, 18, '#fff', null) : rand([KP.heart(50, 52, 12, '#fff'), KP.star(50, 50, 14, '#fff', null), KP.sparkle(50, 50, 14, '#fff')]);
      b.innerHTML = svg('0 0 100 140', `<path d="M50,96 Q44,112 54,124 Q60,132 52,140" fill="none" stroke="#B3A5CF" stroke-width="2"/><ellipse cx="50" cy="50" rx="40" ry="46" fill="${c}" stroke="${d}" stroke-width="3"/><path d="M44,95 L56,95 L52,102 L48,102Z" fill="${d}"/><ellipse cx="34" cy="32" rx="9" ry="14" fill="#fff" opacity=".6" transform="rotate(-20 34 32)"/>${inner}`);
      const pop = (e) => {
        e.preventDefault();
        if (b.dataset.popped) return;
        b.dataset.popped = 1;
        const r = b.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height * 0.35, gold ? ['star', 'sparkle'] : ['sparkle', 'heart', 'star'], gold ? 14 : 8, gold ? 120 : 80);
        b.remove();
        S.pop();
        n = Math.min(GOAL, n + (gold ? 3 : 1));
        fill.style.width = (n / GOAL) * 100 + '%';
        num.textContent = `${n} / ${GOAL}`;
        if (gold) { S.sparkle(); drawMates(true); later(() => !over && drawMates(false), 900); }
        if (n >= GOAL && !over) {
          over = true;
          drawMates(true);
          stage.querySelectorAll('.bln').forEach((x) => x.remove());
          later(() => finishGame(() => go('balloon')), 600);
        }
      };
      b.addEventListener('pointerdown', pop);
      b.addEventListener('animationend', () => b.remove());
      stage.appendChild(b);
    }
    spawn();
    every(spawn, 850);
  };

  // ---- ケーキづくり ----
  const CREAMS = { pink: ['#FFD3E6', '#F29CC2'], white: ['#FFFDF8', '#E8DCCB'], choco: ['#B9805E', '#86553A'], mint: ['#CFF2E5', '#7FCDB2'], lemon: ['#FFF0B8', '#E9C25C'], lav: ['#E6DBFF', '#B39CEE'] };
  const TOPS = ['strawberry', 'star', 'heart', 'candle', 'bunny', 'macaron'];
  function drawTop1(t, x, y) {
    if (t === 'strawberry') return `<g transform="translate(${x} ${y})"><path d="M0,14 C-16,4 -14,-12 0,-10 C14,-12 16,4 0,14Z" fill="#F0506E" stroke="#C23452" stroke-width="1.6"/><path d="M-7,-10 L0,-16 L7,-10 L0,-7Z" fill="#7FCDB2"/><circle cx="-4" cy="-1" r="1.3" fill="#FFE59A"/><circle cx="4" cy="3" r="1.3" fill="#FFE59A"/></g>`;
    if (t === 'star') return KP.star(x, y - 4, 13, '#FFE28A', '#E9B44C', 1.8);
    if (t === 'heart') return KP.heart(x, y - 2, 12, '#F29CC2', '#C9668F', 1.8);
    if (t === 'candle') return `<g transform="translate(${x} ${y})"><rect x="-4" y="-40" width="8" height="40" rx="3" fill="#BCD4FA" stroke="#6F98E2" stroke-width="1.4"/><path d="M-4,-30 L4,-34 M-4,-18 L4,-22" stroke="#fff" stroke-width="2"/><path class="flame" d="M0,-58 C6,-50 6,-44 0,-42 C-6,-44 -6,-50 0,-58Z" fill="#FFB347" stroke="#FF8A3D" stroke-width="1"/></g>`;
    if (t === 'bunny') return `<g transform="translate(${x - 16} ${y - 30}) scale(0.16)">${KP.drawBunny('happy')}</g>`;
    return `<g transform="translate(${x} ${y})"><ellipse cy="-8" rx="13" ry="7" fill="#C9B5F5" stroke="#8C6FD6" stroke-width="1.4"/><rect x="-12" y="-6" width="24" height="5" rx="2" fill="#fff"/><ellipse cy="2" rx="13" ry="7" fill="#C9B5F5" stroke="#8C6FD6" stroke-width="1.4"/></g>`;
  }
  function drawCake(c) {
    const [cr, cd] = CREAMS[c.cream] || CREAMS.pink;
    const drip = (cx, y, rx, ry) => {
      let d = `M${cx - rx},${y} `;
      const n = 9;
      for (let i = 0; i < n; i++) {
        const a0 = Math.PI - (i / n) * Math.PI, a1 = Math.PI - ((i + 1) / n) * Math.PI;
        const x0 = cx + Math.cos(a0) * rx, x1 = cx + Math.cos(a1) * rx;
        const y0 = y + Math.sin(a0) * ry, y1 = y + Math.sin(a1) * ry;
        const dd = 16 + (i % 3) * 8;
        d += `C${x0},${y0 + dd} ${x1},${y1 + dd} ${x1},${y1} `;
      }
      return `<path d="${d}" fill="${cr}" stroke="${cd}" stroke-width="2"/>`;
    };
    const layer = (cx, top, bot, rx, ry) =>
      `<path d="M${cx - rx},${top} L${cx - rx},${bot} A${rx},${ry} 0 0,0 ${cx + rx},${bot} L${cx + rx},${top}Z" fill="#FFF3DF" stroke="#E2C9A6" stroke-width="2"/>` +
      `<path d="M${cx - rx},${(top + bot) / 2 + 6} A${rx},${ry} 0 0,0 ${cx + rx},${(top + bot) / 2 + 6}" fill="none" stroke="#F29CC2" stroke-width="6" opacity=".7"/>` +
      `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="${cr}" stroke="${cd}" stroke-width="2"/>` + drip(cx, top, rx, ry);
    let o = `<ellipse cx="300" cy="420" rx="230" ry="46" fill="#fff" stroke="#DCD0F0" stroke-width="3"/><ellipse cx="300" cy="414" rx="200" ry="34" fill="#F6F0FF"/>`;
    if (c.shape === 'tier') o += layer(300, 300, 400, 160, 42) + layer(300, 190, 280, 100, 26);
    else o += layer(300, 250, 400, 160, 44);
    const tops = (c.tops || []).slice().sort((a, b) => a.y - b.y);
    o += tops.map((t) => `<g transform="translate(${t.x} ${t.y}) scale(1.5) translate(${-t.x} ${-t.y})">${drawTop1(t.t, t.x, t.y)}</g>`).join('');
    return o;
  }
  function cakeSpot(c) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.82;
    if (c.shape === 'tier') return { x: Math.round(300 + Math.cos(a) * r * 84), y: Math.round(192 + Math.sin(a) * r * 20) };
    return { x: Math.round(300 + Math.cos(a) * r * 136), y: Math.round(252 + Math.sin(a) * r * 34) };
  }
  SCREENS.cake = function (el) {
    const c = { shape: 'round', cream: 'pink', tops: [] };
    let step = 'shape';
    el.innerHTML = gameTop('ケーキづくり') +
      `<div class="cake-stage" id="cStage"></div>` +
      `<div class="cake-steps" id="cSteps"></div>` +
      `<div class="cake-opts" id="cOpts"></div>`;
    bindGameTop(el);
    const stage = el.querySelector('#cStage');
    const steps = el.querySelector('#cSteps');
    const opts = el.querySelector('#cOpts');
    function drawStage(guests) {
      let o = `<rect width="600" height="520" fill="#FFF6FA"/>` + [[60, 60], [540, 90], [90, 300], [520, 330]].map(([x, y], i) => (i % 2 ? KP.star(x, y, 10, '#FFE59A') : KP.sparkle(x, y, 12, '#fff'))).join('');
      o += `<rect y="430" width="600" height="90" fill="#F3E3F2"/>`;
      if (guests) {
        const m = playMates().concat('pyonta');
        m.forEach((w, i) => {
          const x = 70 + (i * 460) / Math.max(1, m.length - 1);
          o += w === 'pyonta' ? `<g transform="translate(${x - 50} 330) scale(0.5)">${KP.drawBunny('happy')}</g>` : `<g transform="translate(${x - 56} 230) scale(0.28)">${KP.drawChar(friendOpt(w, { pose: 'joy', expr: 'joy' }))}</g>`;
        });
      }
      o += drawCake(c);
      stage.innerHTML = svg('0 0 600 520', o);
    }
    function drawSteps() {
      steps.innerHTML = [['shape', 'かたち'], ['cream', 'クリーム'], ['tops', 'かざり']].map(([k, n], i) => `<button class="cstep${step === k ? ' sel' : ''}" data-s="${k}"><b>${i + 1}</b>${n}</button>`).join('') +
        `<button class="pill main cdone" data-s="done">${icon('heart', '#fff')}できた！</button>`;
    }
    function drawOpts() {
      if (step === 'shape') {
        opts.innerHTML = [['round', 'まるい'], ['tier', '2だん']].map(([k, n]) => `<button class="copt${c.shape === k ? ' sel' : ''}" data-shape="${k}">${svg('60 120 480 330', drawCake({ shape: k, cream: c.cream, tops: [] }))}<span>${n}</span></button>`).join('');
      } else if (step === 'cream') {
        opts.innerHTML = Object.keys(CREAMS).map((k) => `<button class="copt${c.cream === k ? ' sel' : ''}" data-cream="${k}">${svg('0 0 100 100', `<path d="M20,60 Q20,30 50,24 Q80,30 80,60 Q66,72 50,62 Q34,72 20,60Z" fill="${CREAMS[k][0]}" stroke="${CREAMS[k][1]}" stroke-width="4"/><path d="M40,34 Q46,28 54,30" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`)}</button>`).join('');
      } else {
        opts.innerHTML = TOPS.map((t) => `<button class="copt" data-top="${t}">${svg(t === 'candle' ? '-22 -62 44 66' : t === 'bunny' ? '-20 -36 40 44' : '-19 -23 38 40', drawTop1(t, 0, 0))}</button>`).join('') +
          `<button class="copt" data-top="clear">${icon('reset')}<span>やりなおし</span></button>`;
      }
    }
    drawStage(); drawSteps(); drawOpts();
    steps.addEventListener('click', (e) => {
      const b = e.target.closest('[data-s]');
      if (!b) return;
      S.tap();
      if (b.dataset.s === 'done') {
        drawStage(true);
        S.done();
        const r = stage.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height * 0.45, ['heart', 'star', 'sparkle'], 16, 160);
        bubble(r.left + r.width * 0.25, r.top + r.height * 0.35, `${icon('cake')}おいしそう！`, 2200);
        later(() => bubble(r.left + r.width * 0.75, r.top + r.height * 0.35, `${icon('heart')}いただきます！`, 2200), 500);
        G.album.unshift({ id: 'a' + Date.now(), type: 'cake', createdAt: Date.now(), snapshot: JSON.parse(JSON.stringify(c)) });
        if (G.album.length > 60) G.album.length = 60;
        save();
        later(() => finishGame(() => go('cake')), 1700);
        return;
      }
      step = b.dataset.s;
      drawSteps(); drawOpts();
    });
    opts.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.shape) {
        c.shape = b.dataset.shape;
        c.tops.forEach((t) => Object.assign(t, cakeSpot(c)));
      }
      if (b.dataset.cream) c.cream = b.dataset.cream;
      if (b.dataset.top === 'clear') c.tops = [];
      else if (b.dataset.top) {
        if (c.tops.length >= 18) c.tops.shift();
        c.tops.push({ t: b.dataset.top, ...cakeSpot(c) });
      }
      S.pick();
      drawStage();
      if (!b.dataset.top) drawOpts();
      const r = stage.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height * 0.45, ['sparkle', 'star'], 5, 70);
    });
  };

  // ================= はじめる =================
  // おはなし（story.js）などが つかう なかみ
  const A = (KP.app = {
    D, S, SCREENS, svg, icon, rand, esc, go, later, every, burst, bubble, flyer, save, toDraw, owned, clearNew,
    faceSVG, charSVG, bunnySVG, itemSVG, findSVG, findName, fuutanOpt, friendOpt, fuuHair, hairOpt, EYE_FOR, HAIR_STYLES, HAIR_COLORS,
    topbar, bindHome, partyBG, roomFurnitureSVG, dressRoomBG, grantPrize, rec,
    onCleanup: (fn) => cleanup.push(fn),
    get G() { return G; },
  });
  window.addEventListener('DOMContentLoaded', () => {
    const start = (location.hash || '').slice(1);
    go(SCREENS[start] && !['henshin', 'story'].includes(start) ? start : 'home');
  });
  window.KPGame = { go, get state() { return G; } };
})();
