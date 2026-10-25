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
  const BUTTERFLY = (c = '#F8BCD6') => svg('0 0 100 100', `<g><ellipse cx="32" cy="38" rx="24" ry="20" fill="${c}" stroke="#fff" stroke-width="4"/><ellipse cx="68" cy="38" rx="24" ry="20" fill="${c}" stroke="#fff" stroke-width="4"/><ellipse cx="36" cy="68" rx="16" ry="14" fill="#C9B5F5" stroke="#fff" stroke-width="4"/><ellipse cx="64" cy="68" rx="16" ry="14" fill="#C9B5F5" stroke="#fff" stroke-width="4"/><rect x="46" y="28" width="8" height="52" rx="4" fill="#7458B8"/></g>`);
  const BIRD = svg('0 0 100 100', `<ellipse cx="50" cy="56" rx="30" ry="24" fill="#BCD4FA" stroke="#fff" stroke-width="4"/><circle cx="66" cy="44" r="16" fill="#BCD4FA" stroke="#fff" stroke-width="4"/><circle cx="70" cy="42" r="3.5" fill="#4A2A63"/><path d="M82,46 L94,50 L82,54Z" fill="#FFD772"/><path d="M30,50 Q40,30 56,46" fill="#9DBDF4" stroke="#fff" stroke-width="3"/>`);
  const FISH = svg('0 0 100 100', `<ellipse cx="46" cy="50" rx="30" ry="18" fill="#FFB8A8" stroke="#fff" stroke-width="4"/><path d="M74,50 L94,34 L94,66Z" fill="#FFB8A8" stroke="#fff" stroke-width="4"/><circle cx="32" cy="46" r="4" fill="#4A2A63"/>`);

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
      `${flip}${F.draw(KP.PAL[p.color] || KP.PAL.lav, KP.uid('f'))}</g></g>`;
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
      `<button class="entry e2" data-go="explore">${icon('search', '#fff')}<span>たんけん</span></button>` +
      `<button class="entry e3" data-go="room">${icon('house', '#fff')}<span>おへや</span>${badge(hasNew('furn'))}</button>` +
      `<button class="entry e4" data-go="friends">${icon('friends', '#fff')}<span>なかま</span>${badge(hasNew('friend'))}</button>` +
      `</div>`;
    el.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => { S.pick(); go(b.dataset.go); }));
    el.querySelector('[data-act=album]').addEventListener('click', () => { S.tap(); go('album'); });
    const sb = el.querySelector('[data-act=sound]');
    sb.addEventListener('click', () => {
      S.on = !S.on; G.sound = S.on; save();
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
      g.classList.remove('wiggle'); void g.getBBox(); g.classList.add('wiggle');
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
      const locked = D.ITEM_LIST.filter((i) => i.slot === dressTab && !owned(i.id)).length;
      let o = list.map((it) => {
        const sel = eq[it.slot] === it.id && !(eq.onepiece && (it.slot === 'tops' || it.slot === 'skirt'));
        return `<button class="cell${sel ? ' sel' : ''}" data-item="${it.id}" aria-label="${esc(it.name)}">${itemSVG(it)}${isNew(it.id) ? '<span class="new">NEW</span>' : ''}</button>`;
      }).join('');
      for (let i = 0; i < locked; i++) o += `<button class="cell empty" data-locked="1">${icon('question')}</button>`;
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
        pyonSay(`${icon('search')}たんけんで みつけよう`, 'notify');
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

  // ================= たんけん =================
  let exploreArea = 'garden';
  const SPOT_FX = {
    cloud: ['stars', 'sparkle', 'rainbow'], tree: ['bird', 'leaves', 'peek'], birdhouse: ['bird', 'note'], bushL: ['butterfly', 'flowers', 'peek'], bushR: ['butterfly', 'flowers', 'peek'],
    pond: ['fish', 'drops'], mushroom: ['sparkle', 'boing', 'hearts'], flowers: ['butterfly', 'flowers'], bench: ['hearts', 'peek'], basket: ['hearts', 'sparkle'], grass: ['butterfly', 'leaves'],
    clock: ['note', 'sparkle'], painting: ['stars', 'sparkle'], shelf: ['note', 'sparkle'], teatable: ['hearts', 'sparkle'], chest: ['stars', 'sparkle'], vase: ['flowers', 'butterfly'],
    cushion: ['boing', 'hearts'], toybox: ['note', 'stars', 'boing'], curtain: ['peek', 'sparkle'], rugcorner: ['sparkle', 'hearts'],
  };
  SCREENS.explore = function (el) {
    const scene = KP.SCENES[exploreArea]();
    el.classList.add(exploreArea);
    const remaining = () => D.FINDS.filter((f) => f.area === exploreArea && !G.collection.discoveredItemIds.includes(f.id) && !(f.kind === 'friend' && G.collection.unlockedCharacterIds.includes(f.id)));
    // こんかいの かくしばしょ（まいかい かわる）
    const plan = {};
    const spotIds = scene.spots.map((s) => s.id).sort(() => Math.random() - 0.5);
    remaining().forEach((f, i) => { if (i < spotIds.length) plan[spotIds[i]] = f; });
    const pyPos = exploreArea === 'garden' ? { x: 420, y: 600 } : { x: 300, y: 600 };
    const sceneSVG =
      scene.bg +
      scene.spots.map((s) => `<g class="spot" data-spot="${s.id}">${s.id === 'curtain' ? `<rect x="230" y="90" width="290" height="340" fill="transparent"/>` : s.draw}</g>`).join('') +
      `<g id="ePyon" class="tapable" transform="translate(${pyPos.x} ${pyPos.y}) scale(0.62)"><g class="floaty">${KP.drawBunny('normal')}</g></g>` +
      `<g id="eHint"></g>`;
    el.innerHTML =
      topbar('', `<div class="areas"><button data-area="house" class="${exploreArea === 'house' ? 'sel' : ''}">${icon('house', exploreArea === 'house' ? '#fff' : '#F29CC2')}おうち</button><button data-area="garden" class="${exploreArea === 'garden' ? 'sel' : ''}">${icon('flower', exploreArea === 'garden' ? '#fff' : '#6FC3A8')}おにわ</button></div>`) +
      `<div class="stage">${svg('0 0 750 1000', sceneSVG).replace('<svg ', `<svg preserveAspectRatio="xMidYMid ${wide() ? 'meet' : 'slice'}" `)}</div>` +
      `<div class="foundbar" id="eFound"></div>`;
    el.querySelector('.topbar .title').remove();
    bindHome(el);
    const svgEl = el.querySelector('.stage svg');
    const foundEl = el.querySelector('#eFound');
    function foundBar() {
      foundEl.innerHTML = D.FINDS.filter((f) => f.area === exploreArea).map((f) => {
        const got = G.collection.discoveredItemIds.includes(f.id) || (f.kind === 'friend' && G.collection.unlockedCharacterIds.includes(f.id));
        return `<div class="slot${got ? ' got' : ''}">${got ? findSVG(f) : svg('0 0 100 100', KP.sparkle(50, 50, 22, '#E2D6F6'))}</div>`;
      }).join('');
    }
    foundBar();
    el.querySelectorAll('[data-area]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.area === exploreArea) return;
      S.tap();
      exploreArea = b.dataset.area;
      go('explore');
    }));
    const py = el.querySelector('#ePyon');
    function pyon(expr, ms = 1300) {
      py.innerHTML = `<g class="hop">${KP.drawBunny(expr)}</g>`;
      later(() => { py.innerHTML = `<g class="floaty">${KP.drawBunny('normal')}</g>`; }, ms);
    }
    py.addEventListener('click', (e) => {
      e.stopPropagation();
      S.pop();
      const p = svgToScreen(svgEl, pyPos.x + 62, pyPos.y);
      const r = remaining();
      if (r.length) { pyon('notify'); bubble(p.x, p.y, `${icon('search')}どこかな？`); showHint(); }
      else { pyon('happy'); bubble(p.x, p.y, `${icon('heart')}ぜんぶ みつけたね！`); }
    });
    let lastFind = Date.now();
    function showHint() {
      const ids = Object.keys(plan);
      if (!ids.length) return;
      const s = scene.spots.find((x) => x.id === ids[0]);
      const h = el.querySelector('#eHint');
      h.innerHTML = `<g class="floaty">${KP.sparkle(s.x + 30, s.y - 40, 22, '#FFE28A')}${KP.sparkle(s.x - 26, s.y - 10, 14, '#fff')}</g>`;
      later(() => { h.innerHTML = ''; }, 2600);
    }
    every(() => {
      if (Object.keys(plan).length && Date.now() - lastFind > 12000) {
        lastFind = Date.now();
        pyon('notify', 1800);
        showHint();
      }
    }, 2000);

    function reaction(s) {
      const p = svgToScreen(svgEl, s.x, s.y);
      const kind = rand(SPOT_FX[s.id] || ['sparkle']);
      const W = innerWidth;
      if (kind === 'butterfly') {
        S.sparkle();
        for (let i = 0; i < 3; i++) later(() => flyer(p.x, p.y, BUTTERFLY(rand(['#F8BCD6', '#FFE59A', '#BDEBDC'])), (Math.random() - 0.5) * W * 0.8, -200 - Math.random() * 200), i * 200);
      } else if (kind === 'bird') {
        S.tap();
        flyer(p.x, p.y, BIRD, W * (Math.random() < 0.5 ? -0.7 : 0.7), -250);
        bubble(p.x, p.y - 20, icon('music'));
      } else if (kind === 'fish') {
        S.boing();
        flyer(p.x, p.y, FISH, 60, -120, 1200);
        burst(p.x, p.y, ['drop'], 8, 70);
      } else if (kind === 'peek') {
        // ぴょんたが かおを だす
        S.pop();
        const e = document.createElement('div');
        e.className = 'fly';
        e.style.cssText = `left:${p.x}px;top:${p.y}px;width:70px;height:70px;margin:-50px -35px;--dx:0px;--dy:-30px;animation-duration:1.6s`;
        e.innerHTML = bunnySVG(rand(['happy', 'surprise']));
        fxLayer.appendChild(e);
        setTimeout(() => e.remove(), 1650);
      } else if (kind === 'boing') {
        S.boing();
        burst(p.x, p.y, ['star', 'heart'], 8, 80);
      } else if (kind === 'rainbow' || kind === 'stars') {
        S.sparkle();
        burst(p.x, p.y, ['star', 'sparkle'], 14, 140);
      } else if (kind === 'leaves') {
        S.tap();
        burst(p.x, p.y, ['leaf'], 9, 100);
      } else if (kind === 'flowers') {
        S.sparkle();
        burst(p.x, p.y, ['flower', 'heart'], 10, 100);
      } else if (kind === 'drops') {
        S.tap();
        burst(p.x, p.y, ['drop'], 10, 80);
      } else if (kind === 'note') {
        S.sparkle();
        burst(p.x, p.y, ['note'], 7, 90);
      } else if (kind === 'hearts') {
        S.pop();
        burst(p.x, p.y, ['heart', 'lheart'], 9, 90);
      } else {
        S.sparkle();
        burst(p.x, p.y, ['sparkle', 'star'], 9, 90);
      }
    }
    svgEl.querySelectorAll('.spot').forEach((g) => g.addEventListener('click', () => {
      const s = scene.spots.find((x) => x.id === g.dataset.spot);
      g.classList.remove('wiggle'); void g.getBBox(); g.classList.add('wiggle');
      const f = plan[s.id];
      if (f) {
        delete plan[s.id];
        lastFind = Date.now();
        discover(f, s);
      } else reaction(s);
    }));

    function discover(f, s) {
      const p = svgToScreen(svgEl, s.x, s.y);
      S.find();
      burst(p.x, p.y, ['star', 'sparkle', 'heart'], 16, 140);
      if (f.kind === 'friend') {
        if (!G.collection.unlockedCharacterIds.includes(f.id)) G.collection.unlockedCharacterIds.push(f.id);
        if (!G.friends.inRoom.includes(f.id)) G.friends.inRoom.push(f.id);
      } else if (!G.collection.discoveredItemIds.includes(f.id)) G.collection.discoveredItemIds.push(f.id);
      if (!G.newIds.includes(f.id)) G.newIds.push(f.id);
      save();
      pyon('notify', 2000);
      foundBar();
      later(() => showFound(f), 450);
    }
    function showFound(f) {
      const m = document.createElement('div');
      m.className = 'modal';
      const useBtn = f.kind === 'item'
        ? `<button class="pill main" data-a="use">${icon('dress', '#fff')}きてみる</button>`
        : f.kind === 'furn'
          ? `<button class="pill main" data-a="use">${icon('house', '#fff')}おへやに おく</button>`
          : `<button class="pill main" data-a="use">${icon('friends', '#fff')}あそびに いく</button>`;
      m.innerHTML = `<div class="card"><h2>${f.kind === 'friend' ? 'なかまに なったよ！' : 'みつけた！'}</h2>` +
        `<div class="big"><div class="rays"></div>${f.kind === 'friend' ? charSVG(friendOpt(f.id, { expr: 'joy', pose: 'wave' })) : findSVG(f)}</div>` +
        `<div class="nm">${esc(findName(f))}</div>` +
        `<div class="acts">${useBtn}<button class="pill" data-a="cont">${icon('search')}つづける</button></div>` +
        `<div class="pyon-mini">${bunnySVG('notify')}</div></div>`;
      document.body.appendChild(m);
      const r = m.querySelector('.big').getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, ['star', 'sparkle'], 12, 160);
      m.querySelector('[data-a=cont]').addEventListener('click', () => { S.tap(); m.remove(); });
      m.querySelector('[data-a=use]').addEventListener('click', () => {
        S.pick();
        m.remove();
        if (f.kind === 'item') {
          const it = D.ITEMS[f.id];
          const eq = G.character.equippedItems;
          eq[it.slot] = it.id;
          clearNew(it.id);
          save();
          go('dress', { tab: it.slot });
        } else if (f.kind === 'furn') go('room', { place: f.id });
        else { clearNew(f.id); go('friends'); }
      });
    }
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
  function partyBG() {
    let o = KP.drawRoomBG({ wallpaperId: 'dots', floorId: 'check', curtain: 'lav' });
    // ガーランド
    o += `<path d="M0,60 Q250,150 500,70 Q750,150 1000,60" fill="none" stroke="#C9B8E6" stroke-width="3"/>`;
    for (let i = 0; i < 12; i++) {
      const x = 40 + i * 83, t = x / 1000;
      const y = 60 + Math.sin(t * Math.PI * 2) * -10 + 70 * Math.sin(Math.PI * ((x % 500) / 500));
      o += `<path d="M${x - 22},${y - 6} L${x + 22},${y - 6} L${x},${y + 34}Z" fill="${['#F8BCD6', '#C9B5F5', '#FFE59A', '#BDEBDC'][i % 4]}" stroke="#fff" stroke-width="3"/>`;
    }
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
    stage.innerHTML = svg('0 0 1000 1000', `<g>${partyBG()}</g><g id="fTea"></g><g id="fCast"></g><g id="fLight" class="spot-light"></g>`).replace('<svg ', '<svg preserveAspectRatio="xMidYMax slice" ');
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
        `<button class="pill${activity === 'show' ? ' sel' : ''}" data-act2="show">${icon('show')}ファッションショー</button>`;
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
        bubble(r.left + r.width / 2, r.top, `${icon('search')}たんけんで あえるかも`);
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
      G.album.unshift({ id: 'a' + Date.now(), type: 'photo', createdAt: Date.now(), snapshot: { chars, tea: activity === 'tea' } });
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
    if (a.type === 'room') {
      return svg('100 0 800 1000', KP.drawRoomBG(a.snapshot) + roomFurnitureSVG(a.snapshot)).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
    }
    const s = a.snapshot;
    let o = partyBG();
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
    const capOf = (a) => (a.type === 'outfit' ? 'へんしん' : a.type === 'room' ? 'おへや' : 'なかまと');
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

  // ================= はじめる =================
  const start = (location.hash || '').slice(1);
  go(SCREENS[start] && start !== 'henshin' ? start : 'home');
  window.KPGame = { go, get state() { return G; } };
})();
