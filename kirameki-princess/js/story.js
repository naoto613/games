// おはなし（ストーリーゲーム）：ファッションショー・ママの おつかい・はいしゃさんの おてつだい
(function () {
  const KP = window.KP;
  const A = KP.app;
  const { D, S, SCREENS, svg, icon, rand, esc, go, later, every, burst, bubble, flyer, save, toDraw } = A;
  const G = () => A.G;
  const shuffle = (a) => a.slice().sort(() => Math.random() - 0.5);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ================= とうじょうじんぶつ =================
  const mamaOpt = (x = {}) => ({ hairStyle: 'pony', hairColor: 'brown', eyeColor: 'amber', outfit: toDraw({ onepiece: 'apron-pink', shoes: 'pumps-pink', hair: 'heartclips-pink' }), ...x });
  const aniSVG = (kind, expr, wear) => svg('0 -20 240 330', KP.drawAnimal(kind, expr, wear));
  const aniFace = (kind, expr, wear) => svg('30 18 180 180', KP.drawAnimal(kind, expr, wear));
  const CAST = {
    fuutan: { name: 'ふーたん', pitch: 1.45, face: (e, look) => A.faceSVG(A.fuutanOpt({ expr: e || 'smile', ...(look || {}) })) },
    pyonta: { name: 'ぴょんた', pitch: 1.8, face: (e) => svg('10 0 180 180', KP.drawBunny(e === 'joy' ? 'happy' : e || 'normal')) },
    mama: { name: 'ママ', pitch: 1.15, face: (e) => A.faceSVG(mamaOpt({ expr: e || 'smile' })) },
    doctor: { name: 'くま せんせい', pitch: 0.75, face: (e) => aniFace('bear', e === 'joy' ? 'happy' : 'smile', { kind: 'coat' }) },
    stylist: { name: 'ねこの スタイリストさん', pitch: 1.3, face: (e) => aniFace('cat', e === 'joy' ? 'happy' : 'smile', { kind: 'apron', color: 'pink' }) },
    yaoya: { name: 'やおやの いぬさん', pitch: 0.9, face: (e) => aniFace('dog', e === 'joy' ? 'happy' : 'smile', { kind: 'apron', color: 'mint', band: 1 }) },
    market: { name: 'マーケットの ねこさん', pitch: 1.2, face: (e) => aniFace('cat', e === 'joy' ? 'happy' : 'smile', { kind: 'apron', color: 'blue' }) },
    artist: { name: 'ねこの えのぐせんせい', pitch: 1.25, face: (e) => aniFace('cat', e === 'joy' ? 'happy' : 'smile', { kind: 'artist' }) },
    teacher: { name: 'うさぎ せんせい', pitch: 1.2, face: (e) => aniFace('rabbit', e === 'joy' ? 'happy' : 'smile', { kind: 'teacher' }) },
    host: { name: 'しかいの パンダさん', pitch: 1.0, face: (e) => aniFace('panda', e === 'joy' ? 'happy' : 'smile') },
  };
  const friendCast = (fid) => ({ name: D.FRIENDS[fid].name + 'ちゃん', pitch: 1.5, face: (e) => A.faceSVG(A.friendOpt(fid, { expr: e || 'smile' })) });

  // ================= エンジン =================
  function makeStage(el, title) {
    el.innerHTML =
      `<div class="st-stage" id="stStage"><div class="st-bg" id="stBg"></div><div class="st-actors" id="stActors"></div></div>` +
      `<div class="topbar st-top"><button class="rbtn" data-act="home" aria-label="ホーム">${icon('home')}</button><div class="title"><span class="st-title">${title}</span></div><button class="rbtn" data-act="list" aria-label="おはなし">${icon('book')}</button></div>` +
      `<div class="st-panel" id="stPanel" hidden></div>` +
      `<div class="st-dialog" id="stDlg" hidden><div class="st-face" id="stFace"></div><div class="st-body"><div class="st-name" id="stName"></div><div class="st-text" id="stText"></div></div><div class="st-next">${icon('back', '#E07AA8')}</div></div>`;
    A.bindHome(el);
    el.querySelector('[data-act=list]').addEventListener('click', () => { S.tap(); go('stories'); });
    const alive = { v: true };
    let missCount = 0;
    A.onCleanup(() => { alive.v = false; S.hush(); });
    const never = new Promise(() => {});
    const guard = async (p) => { const r = await p; return alive.v ? r : never; };
    const $ = (s) => el.querySelector(s);
    let actors = {};
    const c = {
      el, alive,
      get miss() { return missCount; },
      oops() { missCount++; },
      bg(svgStr, par = 'xMidYMid slice') {
        $('#stBg').innerHTML = svg('0 0 750 1000', svgStr).replace('<svg ', `<svg preserveAspectRatio="${par}" `);
      },
      // a: { id: { html, x(%), y(%: あしもと), h(%: たかさ), z, cls } }
      actor(id, a) {
        const box = $('#stActors');
        let d = box.querySelector(`[data-a="${id}"]`);
        if (!a) { if (d) { d.classList.add('leave'); setTimeout(() => d.remove(), 350); } delete actors[id]; return; }
        const prev = actors[id] || {};
        a = { ...prev, ...a };
        actors[id] = a;
        if (!d) { d = document.createElement('div'); d.className = 'st-actor enter'; d.dataset.a = id; box.appendChild(d); }
        if (a.html !== prev.html || !d.innerHTML) d.innerHTML = `<div class="st-in ${a.anim || ''}">${a.html}</div>`;
        d.style.left = a.x + '%';
        d.style.bottom = (100 - a.y) + '%';
        d.style.height = a.h + '%';
        d.style.zIndex = a.z || Math.round(a.y);
        d.style.transform = `translateX(-50%)${a.flip ? ' scaleX(-1)' : ''}`;
        return d;
      },
      bounce(id) {
        const d = $(`#stActors [data-a="${id}"] .st-in`);
        if (d) { d.classList.remove('bounce'); void d.offsetWidth; d.classList.add('bounce'); }
      },
      clearActors() { $('#stActors').innerHTML = ''; actors = {}; },
      // はなす ひとに カメラを よせて、まわりは すこし ぼかす
      focus(id) {
        const st = $('#stStage');
        const a = actors[id];
        st.classList.add('talking');
        $('#stActors').querySelectorAll('.st-actor').forEach((d) => { d.classList.toggle('speaking', d.dataset.a === id); d.classList.toggle('dim', !!a && d.dataset.a !== id); });
        const x = a ? a.x : 50, y = a ? a.y - a.h * 0.6 : 55;
        st.style.transformOrigin = `${x}% ${Math.max(20, Math.min(85, y))}%`;
        st.style.transform = a ? 'scale(1.08)' : 'scale(1.02)';
      },
      unfocus() {
        const st = $('#stStage');
        st.classList.remove('talking');
        st.style.transform = '';
        $('#stActors').querySelectorAll('.st-actor').forEach((d) => d.classList.remove('speaking', 'dim'));
      },
      emote(id, kind) {
        const d = $(`#stActors [data-a="${id}"]`);
        if (!d) return;
        const e = document.createElement('div');
        e.className = 'emote ' + kind;
        e.innerHTML = kind === 'joy' ? svg('0 0 100 100', KP.heart(36, 50, 22, '#FF8FB8', '#fff', 4) + KP.heart(70, 30, 14, '#FFB8D6', '#fff', 3)) : kind === 'surprise' ? '<b>！</b>' : kind === 'sad' ? svg('0 0 100 100', `<path d="M50,10 C70,40 78,56 78,66 A28,28 0 0,1 22,66 C22,56 30,40 50,10Z" fill="#BFE3FF" stroke="#7FA4E6" stroke-width="5"/>`) : svg('0 0 100 100', KP.ICONS.music('#B39CEE'));
        d.appendChild(e);
        setTimeout(() => e.remove(), 1500);
      },
      async say(who, text, opt = {}) {
        const C = typeof who === 'string' ? (CAST[who] || friendCast(who)) : who;
        const dlg = $('#stDlg');
        dlg.hidden = false;
        const aid = opt.actor === false ? null : opt.actor || (typeof who === 'string' ? who : null);
        c.focus(aid);
        if (aid && ['joy', 'surprise', 'sad'].includes(opt.expr)) c.emote(aid, opt.expr);
        dlg.classList.toggle('right', !!opt.right);
        $('#stFace').innerHTML = C.face(opt.expr, opt.look);
        $('#stName').textContent = C.name;
        const tx = $('#stText');
        tx.textContent = '';
        if (opt.actor !== false) c.bounce(opt.actor || who);
        S.speak(text, C.pitch);
        let i = 0, done = false;
        await new Promise((res) => {
          const t = setInterval(() => {
            if (!alive.v) { clearInterval(t); return; }
            i++;
            tx.textContent = text.slice(0, i);
            if (i >= text.length) { clearInterval(t); done = true; }
          }, 38);
          const on = (e) => {
            e.stopPropagation();
            if (!done) { clearInterval(t); tx.textContent = text; done = true; return; }
            dlg.removeEventListener('click', on);
            $('#stStage').removeEventListener('click', on);
            S.tap();
            res();
          };
          setTimeout(() => { dlg.addEventListener('click', on); $('#stStage').addEventListener('click', on); }, 250);
        });
        return guard(Promise.resolve());
      },
      hideDialog() { $('#stDlg').hidden = true; c.unfocus(); },
      panel(html, cls = '') {
        // まえの パネルの イベントを のこさない ように つくりなおす
        const old = $('#stPanel');
        const p = old.cloneNode(false);
        old.replaceWith(p);
        p.className = 'st-panel ' + cls;
        p.innerHTML = html;
        p.hidden = false;
        c.hideDialog();
        return p;
      },
      hidePanel() { const p = $('#stPanel'); p.hidden = true; p.innerHTML = ''; },
      // ボタンを えらぶ
      async choose(items, prompt) {
        const p = c.panel(`${prompt ? `<div class="st-prompt">${prompt}</div>` : ''}<div class="st-choices">${items.map((it, i) => `<button class="st-choice${it.main ? ' main' : ''}" data-i="${i}">${it.icon ? `<span class="ci">${it.icon}</span>` : ''}<span>${it.label}</span></button>`).join('')}</div>`, 'bottom');
        const v = await new Promise((res) => p.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) { S.pick(); res(items[+b.dataset.i].value); } }));
        c.hidePanel();
        return guard(Promise.resolve(v));
      },
      // おおきな カード（タップで とじる）
      async card(html, cap) {
        const p = c.panel(`<div class="st-card pop">${html}${cap ? `<div class="st-cap">${cap}</div>` : ''}<div class="st-tapnext">${icon('back', '#E07AA8')}タッチ</div></div>`, 'center');
        if (cap) S.speak(cap, 1.3);
        await new Promise((res) => setTimeout(() => p.addEventListener('click', res, { once: true }), 400));
        S.tap();
        c.hidePanel();
        return guard(Promise.resolve());
      },
      wait: (ms) => guard(sleep(ms)),
      async waitClick(node) { await new Promise((res) => node.addEventListener('click', res, { once: true })); return guard(Promise.resolve()); },
      center() { const r = $('#stStage').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.45 }; },
      sparkleAt(id, kinds = ['star', 'sparkle', 'heart'], n = 12) {
        const d = $(`#stActors [data-a="${id}"]`);
        const r = d ? d.getBoundingClientRect() : $('#stStage').getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height * 0.35, kinds, n, 120);
      },
      guard,
    };
    return c;
  }

  // ふーたん・なかまの え
  const fuuHTML = (x = {}, look) => svg('0 -30 400 680', KP.drawChar(A.fuutanOpt({ ...x, ...(look ? lookOpt(look) : {}) })));
  const lookOpt = (L) => ({ outfit: toDraw(L.outfit), hairStyle: L.hairStyle, hairColor: L.hairColor, eyeColor: A.EYE_FOR[L.hairColor] || 'pink', makeup: L.makeup });
  const charHTML = (opt) => svg('0 -30 400 680', KP.drawChar(opt));
  const bunHTML = (e = 'normal') => svg('0 -30 200 250', KP.drawBunny(e));

  // ================= クリア =================
  const STORY_POOL = {
    fashion: (f) => f.kind === 'item' && ['onepiece', 'shoes', 'hair'].includes(D.ITEMS[f.id].slot),
    shop: (f) => f.kind === 'furn' || (f.kind === 'item' && D.ITEMS[f.id].slot === 'tops'),
    dentist: (f) => f.kind === 'item' && ['magic', 'ribbon'].includes(D.ITEMS[f.id].slot),
    writing: (f) => f.kind === 'item' && ['hair', 'ribbon', 'magic'].includes(D.ITEMS[f.id].slot),
    paint: (f) => f.kind === 'furn' || (f.kind === 'item' && ['onepiece', 'tops'].includes(D.ITEMS[f.id].slot)),
  };
  const UNLOCK_FRIEND = { fashion: 'mizuki', shop: 'lemon' };
  // ★の ひょうか：まちがいの かず（c.miss）か、おはなしが きめた かず
  function storyClear(c, sid, starsIn) {
    const g = G();
    g.stories = g.stories || {};
    g.stories[sid] = (g.stories[sid] || 0) + 1;
    const stars = starsIn || (c.miss <= 1 ? 3 : c.miss <= 4 ? 2 : 1);
    g.storyStars = g.storyStars || {};
    const best = Math.max(stars, g.storyStars[sid] || 0);
    const newBest = stars > (g.storyStars[sid] || 0);
    g.storyStars[sid] = best;
    const got = (f) => g.collection.discoveredItemIds.includes(f.id) || (f.kind === 'friend' && g.collection.unlockedCharacterIds.includes(f.id));
    let reward = null;
    const fr = UNLOCK_FRIEND[sid];
    if (fr && !g.collection.unlockedCharacterIds.includes(fr)) {
      reward = { kind: 'friend', id: fr };
      g.collection.unlockedCharacterIds.push(fr);
      if (!g.friends.inRoom.includes(fr)) g.friends.inRoom.push(fr);
    } else {
      let pool = D.FINDS.filter((f) => f.kind !== 'friend' && !got(f) && STORY_POOL[sid](f));
      if (!pool.length) pool = D.FINDS.filter((f) => f.kind !== 'friend' && !got(f));
      if (pool.length) {
        reward = rand(pool);
        g.collection.discoveredItemIds.push(reward.id);
      }
    }
    if (reward && !g.newIds.includes(reward.id)) g.newIds.push(reward.id);
    g.stamps = (g.stamps || 0) + 1;
    const prize = A.grantPrize();
    save();
    S.done();
    c.hideDialog();
    const m = document.createElement('div');
    m.className = 'modal';
    const rHTML = (r) => r.kind === 'friend' ? A.charSVG(A.friendOpt(r.id, { expr: 'joy', pose: 'wave' })) : A.findSVG(r);
    m.innerHTML = `<div class="card${reward && prize ? ' two' : ''}"><h2>おはなし クリア！</h2>` +
      `<div class="big stampbig"><div class="rays"></div>${svg('0 0 200 160', KP.drawTrophy())}</div>` +
      `<div class="starrow">${[0, 1, 2].map((i) => `<span class="bigstar${i < stars ? ' on' : ''}" style="animation-delay:${0.5 + i * 0.35}s">${svg('0 0 100 100', KP.star(50, 52, 44, i < stars ? '#FFD772' : '#EDE5FB', i < stars ? '#E9B44C' : '#DCD0F0', 5))}</span>`).join('')}</div>` +
      (newBest ? `<div class="newbest">しんきろく！</div>` : '') +
      `<div class="nm">スタンプ ${g.stamps}こめ！</div>` +
      `<div class="prizes">` + (reward ? `<div class="prize"><div class="ptitle">${icon('star')}${reward.kind === 'friend' ? (prize ? 'なかま！' : 'あたらしい なかま！') : 'ごほうび！'}</div><div class="pimg">${rHTML(reward)}</div><div class="pname">${esc(A.findName(reward))}</div></div>` : '') +
      (prize ? `<div class="prize"><div class="ptitle">${icon('star')}${reward ? 'プレゼント！' : 'スタンプの プレゼント！'}</div><div class="pimg">${A.findSVG(prize)}</div><div class="pname">${esc(A.findName(prize))}</div></div>` : '') + `</div>` +
      `<div class="acts"><button class="pill main" data-a="again">${icon('reset', '#fff')}もういちど</button><button class="pill" data-a="list">${icon('book')}ほかの おはなし</button></div>` +
      `<div class="pyon-mini">${A.bunnySVG('happy')}</div></div>`;
    document.body.appendChild(m);
    const r = m.querySelector('.big').getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, ['star', 'heart', 'sparkle'], 18, 170);
    if (KP.fx) KP.fx.confetti(innerWidth / 2, innerHeight * 0.3, 110, 1);
    for (let i = 0; i < stars; i++) setTimeout(() => S.pick(), 500 + i * 350);
    setTimeout(() => A.gainExp(20 + stars * 10, innerWidth / 2, innerHeight * 0.32), 500 + stars * 350);
    m.querySelector('[data-a=again]').addEventListener('click', () => { S.tap(); m.remove(); go('story', { id: sid }); });
    m.querySelector('[data-a=list]').addEventListener('click', () => { S.tap(); m.remove(); go('stories'); });
  }
  function album(type, snapshot) {
    const g = G();
    g.album.unshift({ id: 'a' + Date.now(), type, createdAt: Date.now(), snapshot });
    if (g.album.length > 60) g.album.length = 60;
    save();
  }

  // ================= おはなし いちらん =================
  const STORIES = [
    { id: 'fashion', name: 'ファッションショー', sub: 'いしょう・おけしょう・ランウェイ', cls: 's1', art: () => KP.drawChar(A.fuutanOpt({ pose: 'cheer', expr: 'joy' })), vb: '20 -30 360 520' },
    { id: 'shop', name: 'ママの おつかい', sub: 'メモを みて おかいもの', cls: 's2', art: () => `<g transform="translate(-10 0)">${KP.drawChar(mamaOpt({ pose: 'wave' }))}</g>`, vb: '20 -30 360 520' },
    { id: 'dentist', name: 'はいしゃさんの おてつだい', sub: 'むしばきんを やっつけろ', cls: 's3', art: () => KP.drawAnimal('bear', 'happy', { kind: 'coat' }), vb: '0 -10 240 300' },
    { id: 'paint', name: 'おえかき きょうしつ', sub: 'すきな いろで ぬりえ', cls: 's5', art: () => KP.drawAnimal('cat', 'happy', { kind: 'artist' }), vb: '0 -10 240 310' },
    { id: 'writing', name: 'かきかた きょうしつ', sub: 'ひらがなを なぞって かこう', cls: 's4', art: () => KP.drawAnimal('rabbit', 'happy', { kind: 'teacher' }), vb: '0 -70 240 360' },
  ];
  SCREENS.stories = function (el) {
    const g = G();
    el.innerHTML = A.topbar('おはなしを えらぼう') +
      `<div class="story-list">${STORIES.map((s) => {
        const n = (g.stories && g.stories[s.id]) || 0;
        const bs = (g.storyStars && g.storyStars[s.id]) || 0;
        return `<button class="story-card ${s.cls}" data-s="${s.id}"><span class="sc-art">${svg(s.vb, s.art())}</span><span class="sc-txt"><b>${s.name}</b><small>${s.sub}</small><span class="sc-medal">${n ? `<span class="sc-stars">${[0, 1, 2].map((i) => svg('0 0 100 100', KP.star(50, 52, 44, i < bs ? '#FFD772' : '#EDE5FB', i < bs ? '#E9B44C' : '#DCD0F0', 6))).join('')}</span>${n}かい` : 'はじめて！'}</span></span></button>`;
      }).join('')}</div>`;
    A.bindHome(el);
    el.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', () => { S.pick(); go('story', { id: b.dataset.s }); }));
  };
  SCREENS.story = function (el, arg) {
    const s = STORIES.find((x) => x.id === arg.id) || STORIES[0];
    const c = makeStage(el, s.name);
    RUN[s.id](c).catch((e) => console.error(e));
  };
  const RUN = {};

  // ================= ① ファッションショー =================
  const THEMES = [
    { name: 'ピンクの プリンセス', colors: ['pink'], types: ['princess', 'tiara', 'heartwand'] },
    { name: 'ゆめかわ パステル', colors: ['lav', 'mint', 'blue'], types: ['tutu', 'usamimi', 'bunnywand'] },
    { name: 'ほしぞらの よる', colors: ['navy', 'blue'], types: ['starry', 'starskirt', 'starpins', 'moonrod', 'crystalwand', 'glass'] },
    { name: 'おはなの ようせい', colors: ['mint'], types: ['fairy', 'flowers', 'flowerwand', 'sandal'] },
    { name: 'キラキラ アイドル', colors: [], types: ['idol', 'idoltop', 'mic', 'starpins', 'ribbonband', 'heartclips'] },
  ];
  const matchTheme = (T, it) => it && (T.colors.includes(it.color) || T.types.includes(it.type));
  const LIPS = ['#FF5A8A', '#FF8FB0', '#E0466E', '#C77AE0', '#FF9A6A'];
  const CHEEKS = ['#FF9DB8', '#FFB3A0', '#E6A8F0', '#FFC2D6'];
  const SHADOWS = ['#B39CEE', '#F29CC2', '#9DBDF4', '#9EDDC8', '#FFD772'];

  RUN.fashion = async function (c) {
    const g = G();
    const T = rand(THEMES);
    const eq0 = g.character.equippedItems;
    const look = { outfit: { ...eq0 }, hairStyle: g.character.hairStyle || 'long', hairColor: g.character.hairColor || 'pink', makeup: {} };
    S.setWanted('home');
    // --- 1. おてがみ ---
    c.bg(`<g transform="translate(-125 0)">${KP.drawRoomBG(g.room) + A.roomFurnitureSVG(g.room)}</g>`);
    c.actor('fuutan', { html: fuuHTML({ pose: 'stand' }), x: 58, y: 96, h: 60 });
    c.actor('pyonta', { html: bunHTML('notify'), x: 24, y: 97, h: 22 });
    await c.say('pyonta', 'ふーたん！ たいへん たいへん！ おてがみが とどいたよ！');
    await c.card(svg('0 0 400 320', KP.drawLetter()), 'きらめき ファッションショーに モデルとして でてください！');
    c.actor('fuutan', { html: fuuHTML({ pose: 'joy', expr: 'joy' }) });
    await c.say('fuutan', 'えっ！ わたしが モデルさん！？ でたい でたい！', { expr: 'joy' });
    await c.say('pyonta', `こんかいの テーマは「${T.name}」だって！`, { expr: 'joy' });
    // --- 2. がくや：いしょう ---
    c.clearActors();
    c.bg(`<g transform="scale(1.25 1.43)">${A.dressRoomBG()}</g>`);
    c.actor('stylist', { html: aniSVG('cat', 'smile', { kind: 'apron', color: 'pink' }), x: 22, y: 98, h: 30 });
    c.actor('fuutan', { html: fuuHTML({}, look), x: 62, y: 96, h: 62 });
    await c.say('stylist', 'ようこそ！ わたしは スタイリストの ねこです。いっしょに すてきに しようね！');
    await c.say('stylist', `テーマは「${T.name}」。★の マークが ついた ものは テーマに ぴったりだよ！`);
    c.actor('stylist', null);
    c.actor('fuutan', { x: 50, y: 58, h: 50 });
    const steps = [['onepiece', 'ドレスを えらぼう'], ['shoes', 'くつを えらぼう'], ['hair', 'かみかざりを えらぼう'], ['magic', 'もちものを えらぼう']];
    for (const [slot, prompt] of steps) await pickItem(c, look, slot, prompt, T);
    // かみがた
    await pickHair(c, look);
    // --- 3. おけしょう ---
    c.actor('fuutan', { html: fuuHTML({ expr: 'smile' }, look), x: 62, y: 96, h: 62 });
    c.actor('stylist', { html: aniSVG('cat', 'happy', { kind: 'apron', color: 'pink' }), x: 22, y: 98, h: 30 });
    await c.say('stylist', 'つぎは おけしょう！ おかおを アップに するよ〜');
    c.actor('stylist', null);
    await makeupGame(c, look);
    c.actor('fuutan', { html: fuuHTML({ pose: 'joy', expr: 'joy' }, look) });
    c.sparkleAt('fuutan');
    S.sparkle();
    await c.say('fuutan', 'わあ… かがみの なかの わたし、キラキラしてる！', { expr: 'joy', look: lookOpt(look) });
    // --- 4. ぶたいうら ---
    c.actor('pyonta', { html: bunHTML('normal'), x: 22, y: 97, h: 22 });
    c.actor('fuutan', { html: fuuHTML({ expr: 'surprise' }, look) });
    await c.say('fuutan', 'ど、どきどき してきた…', { expr: 'surprise', look: lookOpt(look) });
    c.actor('pyonta', { html: bunHTML('happy') });
    await c.say('pyonta', 'だいじょうぶ！ ハートが まるに きたら タッチ！ リズムに のって あるこう！');
    c.actor('fuutan', { html: fuuHTML({ pose: 'cheer', expr: 'joy' }, look) });
    await c.say('fuutan', 'うん！ がんばる！', { expr: 'joy', look: lookOpt(look) });
    // --- 5. ランウェイ ---
    c.clearActors();
    c.bg(KP.BG.runway());
    c.actor('host', { html: aniSVG('panda', 'happy'), x: 14, y: 52, h: 18 });
    await c.say('host', `おまたせしました！ つぎの モデルは… ふーたん です！`);
    c.actor('host', null);
    const res = await runwayGame(c, look);
    // --- 6. はっぴょう ---
    const themeN = ['onepiece', 'shoes', 'hair', 'magic'].filter((sl) => matchTheme(T, D.ITEMS[look.outfit[sl]])).length;
    const mkN = Object.keys(look.makeup).length;
    const score = Math.min(15, 6 + Math.round((res.hits / res.total) * 5) + themeN + Math.min(2, Math.floor(mkN / 2)));
    const judges = [['pyonta'], ...(Object.keys(D.FRIENDS).filter((f) => g.collection.unlockedCharacterIds.includes(f)).slice(0, 1).map((f) => [f])), ['stylist']];
    c.clearActors();
    c.bg(KP.BG.runway());
    c.actor('fuutan', { html: fuuHTML({ pose: res.pose, expr: 'joy' }, look), x: 50, y: 98, h: 64 });
    await c.say('host', 'しんさいんの みなさん、てんすうを どうぞ！', { actor: false });
    const per = [Math.ceil(score / 3), Math.round(score / 3), Math.floor(score / 3)].map((n) => Math.max(3, Math.min(5, n)));
    const jp = c.panel(`<div class="judges">${judges.map((j, i) => `<div class="judge" style="animation-delay:${i * 0.5}s"><div class="jface">${j[0] === 'pyonta' ? bunHTML('happy') : j[0] === 'stylist' ? aniFace('cat', 'happy', { kind: 'apron', color: 'pink' }) : A.faceSVG(A.friendOpt(j[0], { expr: 'joy' }))}</div><div class="jboard">${Array.from({ length: 5 }, (_, k) => icon('heart', k < per[i] ? '#F29CC2' : '#EDE5FB')).join('')}</div></div>`).join('')}</div>`, 'top');
    for (let i = 0; i < judges.length; i++) { await c.wait(500); S.pop(); }
    await c.wait(700);
    const total = per.reduce((a, b) => a + b, 0);
    const title = total >= 14 ? 'グランプリ' : total >= 12 ? 'キラキラしょう' : 'すてきで しょう';
    S.henshin();
    c.sparkleAt('fuutan', ['star', 'heart', 'sparkle'], 24);
    await c.card(`${svg('0 0 200 160', KP.drawTrophy())}<div class="award">${title}！</div>`, `ふーたん、${title} です！ おめでとう！`);
    jp.hidden = true;
    c.actor('fuutan', { html: fuuHTML({ pose: 'cheer', expr: 'joy' }, look) });
    await c.say('fuutan', 'やったー！ みんな ありがとう！', { expr: 'joy', look: lookOpt(look) });
    // ふくと かみは そのまま きる
    Object.assign(g.character.equippedItems, look.outfit);
    g.character.hairStyle = look.hairStyle;
    g.character.hairColor = look.hairColor;
    album('show', { ...look.outfit, _hs: look.hairStyle, _hc: look.hairColor, _mk: look.makeup, _pose: res.pose, _title: title });
    storyClear(c, 'fashion', total >= 14 ? 3 : total >= 12 ? 2 : 1);
  };

  async function pickItem(c, look, slot, prompt, T) {
    const list = D.ITEM_LIST.filter((i) => i.slot === slot && A.owned(i.id));
    const sorted = [...list.filter((i) => matchTheme(T, i)), ...list.filter((i) => !matchTheme(T, i))];
    const p = c.panel(`<div class="st-prompt">${prompt}</div><div class="pick-grid">${sorted.map((it) => `<button class="cell${look.outfit[slot] === it.id ? ' sel' : ''}" data-id="${it.id}">${A.itemSVG(it)}${matchTheme(T, it) ? `<span class="tstar">${icon('star')}</span>` : ''}</button>`).join('')}</div><button class="pill main st-ok">${icon('check', '#fff')}これに する</button>`, 'bottom pick');
    S.speak(prompt, 1.45);
    await new Promise((res) => {
      p.addEventListener('click', (e) => {
        if (e.target.closest('.st-ok')) { S.pick(); res(); return; }
        const b = e.target.closest('[data-id]');
        if (!b) return;
        const it = D.ITEMS[b.dataset.id];
        look.outfit[slot] = it.id;
        if (slot === 'onepiece') { /* ワンピースが ゆうせん */ }
        p.querySelectorAll('.cell').forEach((x) => x.classList.toggle('sel', x === b));
        c.actor('fuutan', { html: fuuHTML({ expr: rand(['joy', 'happy', 'wink']) }, look) });
        c.bounce('fuutan');
        S.pick();
        c.sparkleAt('fuutan', ['sparkle', 'star'], 6);
        if (matchTheme(T, it)) { const r = b.getBoundingClientRect(); bubble(r.left + r.width / 2, r.top, `${icon('star')}ぴったり！`, 1200); }
      });
    });
    c.hidePanel();
    c.actor('fuutan', { html: fuuHTML({}, look) });
    return c.guard(Promise.resolve());
  }
  async function pickHair(c, look) {
    const head = (st, co) => svg('36 20 328 400', KP.drawChar({ hairStyle: st, hairColor: co, eyeColor: A.EYE_FOR[co], outfit: {} }));
    const draw = () => `<div class="st-prompt">かみがたを えらぼう</div><div class="pick-grid">${A.HAIR_STYLES.map(([st]) => `<button class="cell${look.hairStyle === st ? ' sel' : ''}" data-hs="${st}">${head(st, look.hairColor)}</button>`).join('')}${A.HAIR_COLORS.map((co) => `<button class="cell${look.hairColor === co ? ' sel' : ''}" data-hc="${co}">${head(look.hairStyle, co)}</button>`).join('')}</div><button class="pill main st-ok">${icon('check', '#fff')}これに する</button>`;
    const p = c.panel(draw(), 'bottom pick');
    S.speak('かみがたを えらぼう', 1.45);
    await new Promise((res) => {
      p.addEventListener('click', (e) => {
        if (e.target.closest('.st-ok')) { S.pick(); res(); return; }
        const b = e.target.closest('[data-hs],[data-hc]');
        if (!b) return;
        if (b.dataset.hs) look.hairStyle = b.dataset.hs;
        if (b.dataset.hc) look.hairColor = b.dataset.hc;
        const sc = p.querySelector('.pick-grid').scrollTop;
        p.innerHTML = draw();
        p.querySelector('.pick-grid').scrollTop = sc;
        c.actor('fuutan', { html: fuuHTML({ expr: 'joy' }, look) });
        c.bounce('fuutan');
        S.sparkle();
      });
    });
    c.hidePanel();
    return c.guard(Promise.resolve());
  }

  async function makeupGame(c, look) {
    const mk = look.makeup;
    const TOOLS = [
      ['lip', 'リップ', LIPS], ['cheek', 'チーク', CHEEKS], ['shadow', 'アイシャドウ', SHADOWS], ['sticker', 'シール', ['star', 'heart', 'moon']], ['lash', 'まつげ', [true]],
    ];
    let tool = 'lip';
    const face = (expr = 'smile') => svg('104 76 192 196', KP.drawChar({ ...lookOpt(look), outfit: toDraw({ hair: look.outfit.hair }), expr }));
    const p = c.panel(`<div class="mk-face" id="mkFace">${face()}</div><div class="mk-mirror"></div>` +
      `<div class="mk-tools" id="mkTools"></div><div class="mk-opts" id="mkOpts"></div><button class="pill main st-ok">${icon('heart', '#fff')}できた！</button>`, 'full makeup');
    S.speak('どの おけしょうに する？', 1.45);
    const toolsEl = p.querySelector('#mkTools'), optsEl = p.querySelector('#mkOpts'), faceEl = p.querySelector('#mkFace');
    const drawTools = () => (toolsEl.innerHTML = TOOLS.map(([k, n, v]) => `<button class="mk-tool${tool === k ? ' sel' : ''}" data-t="${k}">${svg('0 0 100 100', KP.MAKEUP_ICON[k](k === 'sticker' ? 'star' : v[0]))}<span>${n}</span>${mk[k] ? '<i></i>' : ''}</button>`).join(''));
    const drawOpts = () => {
      const T = TOOLS.find((t) => t[0] === tool);
      optsEl.innerHTML = T[2].map((v, i) => `<button class="mk-opt${mk[tool] === v ? ' sel' : ''}" data-v="${i}">${svg('0 0 100 100', KP.MAKEUP_ICON[tool](v))}</button>`).join('') + `<button class="mk-opt" data-v="off">${icon('reset')}</button>`;
    };
    drawTools(); drawOpts();
    await new Promise((res) => {
      p.addEventListener('click', (e) => {
        if (e.target.closest('.st-ok')) { S.pick(); res(); return; }
        const t = e.target.closest('[data-t]');
        if (t) { tool = t.dataset.t; S.tap(); drawTools(); drawOpts(); return; }
        const o = e.target.closest('[data-v]');
        if (!o) return;
        const T = TOOLS.find((x) => x[0] === tool);
        if (o.dataset.v === 'off') delete mk[tool];
        else {
          mk[tool] = T[2][+o.dataset.v];
          // ブラシが おかおへ
          const r = o.getBoundingClientRect(), f = faceEl.getBoundingClientRect();
          const tx = f.left + f.width * (tool === 'lip' ? 0.5 : tool === 'shadow' || tool === 'lash' ? 0.33 : 0.72), ty = f.top + f.height * (tool === 'lip' ? 0.8 : tool === 'shadow' || tool === 'lash' ? 0.52 : 0.68);
          flyer(r.left + r.width / 2, r.top + r.height / 2, svg('0 0 100 100', KP.MAKEUP_ICON[tool](tool === 'sticker' ? mk[tool] : T[2][+o.dataset.v])), tx - r.left - r.width / 2, ty - r.top - r.height / 2, 520);
          setTimeout(() => burst(tx, ty, ['sparkle', 'heart'], 7, 50), 480);
          S.sparkle();
        }
        setTimeout(() => {
          faceEl.innerHTML = face(rand(['joy', 'wink', 'smile']));
          setTimeout(() => (faceEl.innerHTML = face()), 900);
        }, 480);
        drawTools(); drawOpts();
      });
    });
    c.hidePanel();
    return c.guard(Promise.resolve());
  }

  async function runwayGame(c, look) {
    const sticks = (side) => `<div class="glow ${side}">${Array.from({ length: 5 }, (_, i) => `<i style="animation-delay:-${i * 0.17}s;background:${['#FF8FB8', '#9DCDF4', '#FFE07A', '#C9B5F5', '#9EDC9A'][i]}"></i>`).join('')}</div>`;
    const p = c.panel(`<div class="rw-fever"></div>${sticks('l')}${sticks('r')}<div class="rw-hud"><div class="rw-score">SCORE <b id="rwScore">0</b></div><div class="rw-combo" id="rwCombo"></div></div><div class="rw-hits" id="rwHits"></div><div class="rw-lane" id="rwLane"><div class="rw-target"></div></div><button class="rw-tap" id="rwTap">${icon('heart', '#fff')}タッチ！</button><div class="rw-msg" id="rwMsg"></div>`, 'runway');
    const lane = p.querySelector('#rwLane'), msg = p.querySelector('#rwMsg'), hitsEl = p.querySelector('#rwHits'), scoreEl = p.querySelector('#rwScore'), comboEl = p.querySelector('#rwCombo');
    const POSES = ['stand', 'wave', 'joy', 'hips'];
    c.actor('fuutan', { html: fuuHTML({ expr: 'smile' }, look), x: 50, y: 40, h: 20, anim: 'walk' });
    S.hush();
    const clk = S.restartBgm('play');
    const spb = clk ? clk.spb : 60 / 132;
    const now = () => (clk ? S.now() : performance.now() / 1000);
    const base = clk ? clk.t0 : now() + 0.2;
    // まえはんは 2はくごと、さいごは 1はくごとの もりあがり。4こめごとに ほしノーツ
    const beats = [];
    for (let i = 0; i < 12; i++) beats.push(4 + i * 2);
    for (let i = 0; i < 8; i++) beats.push(28 + i);
    const notes = beats.map((bt, i) => ({ t: base + spb * bt, el: null, done: false, star: i % 4 === 3 }));
    const NOTES = notes.length;
    const TRAVEL = spb * 4;
    let hits = 0, combo = 0, maxCombo = 0, score = 0, fever = false;
    const show = (t, cls) => { msg.textContent = t; msg.className = 'rw-msg show ' + cls; clearTimeout(show.t); show.t = setTimeout(() => (msg.className = 'rw-msg'), 500); };
    const drawHits = () => (hitsEl.innerHTML = Array.from({ length: NOTES }, (_, i) => `<i class="${i < hits ? 'on' : ''}"></i>`).join(''));
    const drawCombo = () => { comboEl.innerHTML = combo >= 2 ? `<b>${combo}</b> COMBO` : ''; comboEl.classList.remove('bump'); void comboEl.offsetWidth; comboEl.classList.add('bump'); };
    drawHits();
    const setFever = (on) => {
      if (on === fever) return;
      fever = on;
      p.classList.toggle('fever', on);
      if (on) { KP.fx.banner('FEVER！', 'gold'); KP.fx.mode('stage'); S.henshin(); }
    };
    const tap = (e) => {
      e.preventDefault();
      const t = now();
      let best = null, bd = 9;
      for (const n of notes) { if (n.done) continue; const d = Math.abs(n.t - t); if (d < bd) { bd = d; best = n; } }
      const rr = lane.getBoundingClientRect();
      if (best && bd < 0.24) {
        best.done = true;
        hits++; combo++; maxCombo = Math.max(maxCombo, combo);
        const pf = bd < 0.1;
        score += Math.round((pf ? 300 : 150) * (best.star ? 2 : 1) * (1 + Math.floor(combo / 5) * 0.5) * (fever ? 1.5 : 1));
        scoreEl.textContent = score;
        if (best.el) best.el.classList.add('hit');
        show(pf ? 'PERFECT！' : 'GOOD！', pf ? 'pf' : 'gd');
        const ring = document.createElement('div'); ring.className = 'rw-ring' + (pf ? ' pf' : ''); lane.appendChild(ring); setTimeout(() => ring.remove(), 500);
        burst(rr.left + rr.width * 0.18, rr.top + rr.height / 2, best.star ? ['star', 'sparkle'] : ['heart', 'star', 'sparkle'], pf ? 12 : 6, pf ? 90 : 60);
        if (fever) KP.fx.confetti(rr.left + rr.width * 0.18, rr.top, 14, 0.6);
        S.pick();
        drawHits(); drawCombo();
        if (combo >= 6) setFever(true);
        if (combo % 4 === 0) {
          c.actor('fuutan', { html: fuuHTML({ pose: POSES[(combo / 4) % POSES.length], expr: rand(['joy', 'wink', 'smile']) }, look) });
          c.sparkleAt('fuutan', ['star', 'sparkle'], 8); flash();
        }
      } else S.tap();
      const btn = p.querySelector('#rwTap'); btn.classList.remove('pressed'); void btn.offsetWidth; btn.classList.add('pressed');
    };
    const flash = () => { KP.fx.flash('rgba(255,255,255,.6)', 300); S.shutter(); };
    p.querySelector('#rwTap').addEventListener('pointerdown', tap);
    const end = notes[NOTES - 1].t + 1.0;
    await new Promise((res) => {
      const loop = () => {
        if (!c.alive.v) return;
        const t = now();
        for (const n of notes) {
          const dt = n.t - t;
          if (!n.el && dt < TRAVEL && !n.done) {
            n.el = document.createElement('div');
            n.el.className = 'rw-note' + (n.star ? ' star' : '');
            n.el.innerHTML = n.star ? svg('0 0 100 100', KP.star(50, 52, 44, '#FFD772', '#E9B44C', 5) + KP.sparkle(70, 28, 12, '#fff')) : icon('heart', rand(['#F29CC2', '#B39CEE', '#FFB8D6']));
            lane.appendChild(n.el);
          }
          if (n.el) {
            const x = 18 + (dt / TRAVEL) * 82;
            n.el.style.left = x + '%';
            if (!n.done && dt < -0.25) { n.done = true; n.el.classList.add('miss'); combo = 0; drawCombo(); setFever(false); show('おしい！', 'ms'); }
            if (dt < -0.6 && n.el.parentNode) n.el.remove();
          }
        }
        const prog = Math.max(0, Math.min(1, (t - (notes[0].t - spb * 2)) / (end - notes[0].t)));
        c.actor('fuutan', { y: 40 + prog * 58, h: 20 + prog * 46 });
        if (t > end) { res(); return; }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });
    c.hidePanel();
    S.setWanted(null);
    S.stopBgm();
    KP.fx.mode('sparkle');
    const pose = await c.choose([
      { label: 'ウインク', value: 'wave', icon: svg('0 0 100 100', KP.ICONS.heart()) },
      { label: 'バンザイ', value: 'cheer', icon: svg('0 0 100 100', KP.ICONS.star()) },
      { label: 'にっこり', value: 'joy', icon: svg('0 0 100 100', KP.ICONS.smile()) },
    ], 'さいごの ポーズを えらんでね！');
    c.actor('fuutan', { html: fuuHTML({ pose, expr: pose === 'wave' ? 'wink' : 'joy' }, look), anim: '' });
    for (let i = 0; i < 3; i++) { flash(); c.sparkleAt('fuutan', ['star', 'sparkle', 'heart'], 10); await c.wait(300); }
    // ポラロイドしゃしん
    const pol = document.createElement('div');
    pol.className = 'polaroid';
    pol.innerHTML = `<div class="pol-pic">${svg('100 180 550 600', KP.BG.runway() + `<g transform="translate(205 260) scale(.85)">${KP.drawChar(A.fuutanOpt({ ...lookOpt(look), pose, expr: pose === 'wave' ? 'wink' : 'joy' }))}</g>`).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ')}</div><div class="pol-cap">SCORE ${score}　MAX ${maxCombo} COMBO</div>`;
    document.body.appendChild(pol);
    S.done();
    KP.fx.confetti(innerWidth / 2, innerHeight * 0.3, 80, 1);
    await c.wait(2300);
    pol.classList.add('out');
    setTimeout(() => pol.remove(), 500);
    S.setWanted('home');
    await c.wait(300);
    return { hits, total: NOTES, pose, score, maxCombo };
  }


  // ================= ② ママの おつかい =================
  // おはなしは 3しゅ（ばんごはん・ママの おたんじょうび・ピクニック）。おみせ・みちの できごと・りょうりの しかたが まいかい かわる
  const SHOPS = {
    yaoya: { name: 'やおやさん', who: 'yaoya', kind: 'dog', wear: { kind: 'apron', color: 'mint', band: 1 }, shelf: ['carrot', 'potato', 'onion', 'tomato', 'lettuce', 'strawberry', 'banana', 'apple', 'corn', 'grape', 'peach'] },
    market: { name: 'マーケット', who: 'market', kind: 'cat', wear: { kind: 'apron', color: 'blue' }, shelf: ['egg', 'cheese', 'milk', 'curry', 'icecream', 'juice', 'cookie', 'mix', 'sausage', 'butter'] },
    bakery: { name: 'パンやさん', who: 'baker', kind: 'bear', wear: { kind: 'chef' }, shelf: ['bread', 'croissant', 'melonpan', 'donut', 'cookie'] },
    florist: { name: 'おはなやさん', who: 'florist', kind: 'rabbit', wear: { kind: 'apron', color: 'pink' }, shelf: ['fl_pink', 'fl_yellow', 'fl_white', 'fl_lav', 'fl_red'] },
  };
  Object.assign(CAST, {
    baker: { name: 'パンやの くまさん', pitch: 0.85, face: (e) => aniFace('bear', e === 'joy' ? 'happy' : 'smile', { kind: 'chef' }) },
    florist: { name: 'おはなやの うさぎさん', pitch: 1.35, face: (e) => aniFace('rabbit', e === 'joy' ? 'happy' : 'smile', { kind: 'apron', color: 'pink' }) },
    puppy: { name: 'こいぬ', pitch: 1.7, face: (e) => aniFace('dog', e === 'joy' ? 'happy' : e === 'sad' ? 'sad' : 'smile') },
  });
  const DINNERS = [
    { id: 'curry', name: 'カレー', buy: { yaoya: [['carrot', 1], ['potato', 2], ['onion', 1]], market: [['curry', 1]] }, cook: 'stir' },
    { id: 'sand', name: 'サンドイッチ', buy: { bakery: [['bread', 1]], yaoya: [['tomato', 1], ['lettuce', 1]], market: [['egg', 1]] }, cook: 'stack' },
    { id: 'parfait', name: 'フルーツパフェ', buy: { yaoya: [['strawberry', 2], ['banana', 1]], market: [['icecream', 1]] }, cook: 'glass' },
    { id: 'pancake', name: 'ホットケーキ', buy: { market: [['mix', 1], ['egg', 1], ['milk', 1], ['butter', 1]], yaoya: [['strawberry', 2]] }, cook: 'flip' },
    { id: 'pizza', name: 'ピザ', buy: { yaoya: [['tomato', 1], ['corn', 1]], market: [['cheese', 1], ['sausage', 2]] }, cook: 'pizza' },
  ];
  const FLOWERS = ['fl_pink', 'fl_yellow', 'fl_white', 'fl_lav', 'fl_red'];
  const PICNIC_FRUIT = ['apple', 'grape', 'banana', 'peach', 'strawberry'];
  const PICNIC_BREAD = ['croissant', 'melonpan', 'donut', 'bread'];
  const memoHTML = (list, got) => `<div class="memo">${list.map(([k, n]) => { const g = got[k] || 0; return `<span class="mm${g >= n ? ' got' : ''}">${KP.foodSVG(k)}${n > 1 ? `<b>${g}/${n}</b>` : ''}${g >= n ? `<i>${icon('check')}</i>` : ''}</span>`; }).join('')}</div>`;

  RUN.shop = async function (c) {
    const g = G();
    const kind = rand(['dinner', 'dinner', 'birthday', 'picnic']);
    let plan, title, dishKey, cook;
    if (kind === 'dinner') {
      const d = rand(DINNERS);
      plan = d.buy; title = d.name; dishKey = d.id; cook = d.cook;
    } else if (kind === 'birthday') {
      const fl = rand(FLOWERS);
      plan = { florist: [[fl, 3]], yaoya: [['strawberry', 3]], market: [['egg', 1], ['milk', 1]] };
      title = 'おたんじょうびケーキ'; dishKey = 'cake'; cook = 'cake';
    } else {
      plan = { bakery: [[rand(PICNIC_BREAD), 2]], yaoya: [[rand(PICNIC_FRUIT), 2]], market: [['juice', 1]] };
      title = 'ピクニックの おべんとう'; dishKey = 'bento'; cook = 'bento';
    }
    const list = Object.values(plan).flat();
    const got = {};
    // --- 1. はじまり ---
    c.bg(KP.BG.kitchen());
    c.actor('pyonta', { html: bunHTML('normal'), x: 88, y: 98, h: 18 });
    if (kind === 'birthday') {
      c.actor('fuutan', { html: fuuHTML({}), x: 50, y: 97, h: 56 });
      c.actor('pyonta', { html: bunHTML('notify') });
      await c.say('pyonta', 'ふーたん、しってる？ あしたは ママの おたんじょうび なんだって！');
      c.actor('fuutan', { html: fuuHTML({ expr: 'surprise' }) });
      await c.say('fuutan', 'ほんと！？ じゃあ ないしょで サプライズ しよう！', { expr: 'surprise' });
      await c.say('pyonta', 'おはなと ケーキの ざいりょうを かいに いこう！ メモを かいたよ', { expr: 'joy' });
    } else {
      c.actor('mama', { html: charHTML(mamaOpt({ pose: 'wave' })), x: 30, y: 96, h: 66 });
      c.actor('fuutan', { html: fuuHTML({}), x: 68, y: 97, h: 56 });
      if (kind === 'picnic') await c.say('mama', 'あしたは みんなで ピクニック！ おべんとうの ざいりょうを かってきて くれるかな？');
      else await c.say('mama', `ふーたん、おつかいに いってくれる？ きょうの ごはんは ${title} だよ`);
      c.actor('fuutan', { html: fuuHTML({ pose: 'cheer', expr: 'joy' }) });
      await c.say('fuutan', 'うん！ まかせて！', { expr: 'joy' });
    }
    await c.card(`<div class="memo-card"><div class="memo-title">${icon('book')}かいものメモ</div>${memoHTML(list, {})}<div class="memo-shops">${Object.keys(plan).map((k) => `<span>${SHOPS[k].name}</span>`).join('')}</div></div>`,
      `${list.map(([k, n]) => `${KP.FOOD[k].name}${n > 1 ? `を ${n}つ` : ''}`).join('、')}`);
    if (kind !== 'birthday') await c.say('mama', 'おさいふも わたすね。きを つけて いってらっしゃい！');
    await c.say('fuutan', 'いってきまーす！', { expr: 'joy' });
    // --- 2. おみせを まわる（あいだに みちの できごと） ---
    const events = shuffle(['signal', 'puddle', 'puppy', 'friend']);
    const shopKeys = Object.keys(plan);
    for (let i = 0; i < shopKeys.length; i++) {
      if (i < 2) await streetEvent(c, events[i]);
      await shopVisit(c, shopKeys[i], plan[shopKeys[i]], list, got);
    }
    // --- 3. かえって つくる ---
    c.clearActors();
    if (kind === 'picnic') c.bg(KP.BG.kitchen());
    else c.bg(KP.BG.kitchen());
    c.actor('fuutan', { html: fuuHTML({ pose: 'joy', expr: 'joy' }), x: 68, y: 97, h: 56 });
    c.actor('pyonta', { html: bunHTML('happy'), x: 88, y: 98, h: 18 });
    if (kind === 'birthday') {
      await c.say('fuutan', 'ママが かえって くる まえに、ケーキを かざろう！', { expr: 'joy' });
      await cakeDecorate(c);
      c.actor('mama', { html: charHTML(mamaOpt({ pose: 'stand', expr: 'surprise' })), x: 28, y: 96, h: 66 });
      await c.say('mama', 'ただいま〜。あれ？ なんだか いい におい……', { expr: 'surprise' });
      c.actor('fuutan', { html: fuuHTML({ pose: 'cheer', expr: 'joy' }) });
      S.henshin();
      c.sparkleAt('fuutan', ['heart', 'star', 'sparkle'], 20);
      await c.say('fuutan', 'ママ、おたんじょうび おめでとう！ おはなも どうぞ！', { expr: 'joy' });
      c.actor('mama', { html: charHTML(mamaOpt({ pose: 'joy', expr: 'joy' })) });
      c.actor('dish', { html: KP.foodSVG(plan.florist[0][0]), x: 46, y: 60, h: 12, z: 200 });
      await c.say('mama', 'わあ…！ ふーたん、ありがとう！ ママ とっても うれしい！', { expr: 'joy' });
    } else {
      c.actor('mama', { html: charHTML(mamaOpt({ pose: 'joy', expr: 'joy' })), x: 28, y: 96, h: 66 });
      await c.say('fuutan', 'ただいま！ ぜんぶ かえたよ！', { expr: 'joy' });
      await c.say('mama', 'ありがとう！ すごいね！ じゃあ いっしょに つくろう！', { expr: 'joy' });
      if (cook === 'stir' || cook === 'stack' || cook === 'glass') await cookGame(c, dishKey, cook, list.map((x) => x[0]));
      else if (cook === 'flip') await pancakeGame(c);
      else if (cook === 'pizza') await pizzaGame(c);
      else if (cook === 'bento') await bentoGame(c, list.map((x) => x[0]));
      if (kind === 'picnic') {
        c.clearActors();
        c.bg(KP.BG.park());
        c.actor('mama', { html: charHTML(mamaOpt({ pose: 'joy', expr: 'joy' })), x: 22, y: 92, h: 50 });
        c.actor('fuutan', { html: fuuHTML({ pose: 'cheer', expr: 'joy' }), x: 74, y: 92, h: 44 });
        const fr = Object.keys(D.FRIENDS).filter((f) => g.collection.unlockedCharacterIds.includes(f));
        if (fr.length) c.actor('friend', { html: charHTML(A.friendOpt(rand(fr), { pose: 'wave', expr: 'joy' })), x: 50, y: 80, h: 34 });
        c.actor('pyonta', { html: bunHTML('happy'), x: 90, y: 96, h: 14 });
        c.actor('dish', { html: svg('0 0 300 200', KP.DISH.bento + bentoFill(list.map((x) => x[0]))), x: 50, y: 96, h: 16, z: 200 });
        await c.say('fuutan', 'いい おてんき！ いただきまーす！', { expr: 'joy' });
      } else {
        c.actor('dish', { html: svg('0 0 300 190', KP.DISH[dishKey]), x: 50, y: 70, h: 18, z: 200 });
        await c.say('fuutan', 'いただきまーす！', { expr: 'joy' });
      }
      c.sparkleAt('dish', ['heart', 'star'], 14);
      await c.say('mama', 'ん〜 おいしい！ ふーたんが がんばった から とくべつ おいしいね', { expr: 'joy' });
    }
    album('dish', { dish: dishKey === 'cake' ? 'bday' : dishKey });
    storyClear(c, 'shop');
  };
  function bentoFill(items) {
    const slots = [[96, 72], [204, 72], [96, 128], [204, 128]];
    return items.slice(0, 4).map((k, i) => `<g transform="translate(${slots[i][0] - 28} ${slots[i][1] - 28}) scale(.56)">${KP.FOOD[k].d}</g>`).join('');
  }

  // --- みちの できごと ---
  async function streetEvent(c, ev) {
    const g = G();
    c.clearActors();
    if (ev === 'puddle' || ev === 'puppy') c.bg(KP.BG.park()); else c.bg(KP.BG.street('red'));
    c.actor('fuutan', { html: fuuHTML({}), x: 40, y: 82, h: 28 });
    c.actor('pyonta', { html: bunHTML('normal'), x: 58, y: 82, h: 9 });
    if (ev === 'signal') {
      await c.say('pyonta', 'しんごうだ！ あおに なったら わたろうね');
      await crossGame(c);
    } else if (ev === 'friend') {
      c.bg(KP.BG.street('green'));
      const fr = Object.keys(D.FRIENDS).filter((f) => g.collection.unlockedCharacterIds.includes(f));
      const f = fr.length ? rand(fr) : null;
      if (f) {
        c.actor('friend', { html: charHTML(A.friendOpt(f, { pose: 'wave', expr: 'joy' })), x: 76, y: 80, h: 28 });
        await c.say(f, 'あっ ふーたん！ おつかい？ えらいね！ これ あげる！', { expr: 'joy', actor: 'friend' });
        S.find();
        c.sparkleAt('fuutan', ['heart', 'star'], 10);
        await c.say('fuutan', 'わあ、キラキラの シール！ ありがとう！', { expr: 'joy' });
        c.actor('friend', null);
      } else {
        await c.say('pyonta', 'みどりの しんごうだ。みぎ・ひだり みて わたろう！');
      }
      c.actor('fuutan', { y: 60, h: 22, anim: 'walk' });
      await c.wait(900);
    } else if (ev === 'puddle') {
      await c.say('pyonta', 'きのうの あめで みずたまりが いっぱい！ ジャンプで とびこえよう！');
      await puddleGame(c);
    } else if (ev === 'puppy') {
      c.actor('puppy', { html: aniSVG('dog', 'sad'), x: 74, y: 86, h: 16 });
      await c.say('puppy', 'くぅ〜ん… ボールが どこかに いっちゃったの', { actor: 'puppy', expr: 'sad' });
      await c.say('fuutan', 'いっしょに さがして あげるね！', { expr: 'joy' });
      await puppyGame(c);
      c.actor('puppy', { html: aniSVG('dog', 'happy') });
      c.sparkleAt('puppy', ['heart', 'star'], 10);
      await c.say('puppy', 'わんわん！ ありがとう！', { actor: 'puppy', expr: 'joy' });
    }
    return c.guard(Promise.resolve());
  }
  async function puddleGame(c) {
    const p = c.panel(`<div class="st-prompt">みずたまりが きたら ジャンプ！</div><div class="pd-lane" id="pdLane"><div class="pd-me">${svg('0 -30 400 680', KP.drawChar(A.fuutanOpt({ expr: 'joy' })))}</div></div><button class="pill main big" id="jump">${icon('star', '#fff')}ジャンプ！</button>`, 'bottom puddle');
    const lane = p.querySelector('#pdLane'), me = lane.querySelector('.pd-me');
    let jumping = false, n = 0, ok = 0;
    const jump = () => { if (jumping) return; jumping = true; me.classList.add('jump'); S.boing(); setTimeout(() => { me.classList.remove('jump'); jumping = false; }, 650); };
    p.querySelector('#jump').addEventListener('pointerdown', (e) => { e.preventDefault(); jump(); });
    await new Promise((res) => {
      const spawn = () => {
        if (!c.alive.v) return;
        if (n >= 3) return;
        n++;
        const d = document.createElement('div');
        d.className = 'pd-puddle';
        d.innerHTML = svg('0 0 120 60', KP.drawPuddle());
        lane.appendChild(d);
        const t0 = performance.now();
        let judged = false;
        const step = (t) => {
          if (!c.alive.v) return;
          const x = 100 - ((t - t0) / 2200) * 120;
          d.style.left = x + '%';
          if (!judged && x < 22) {
            judged = true;
            if (jumping) { ok++; const r = me.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, ['star', 'sparkle'], 6, 60); S.pick(); }
            else { const r = me.getBoundingClientRect(); burst(r.left + r.width / 2, r.bottom, ['drop'], 10, 60); bubble(r.left + r.width / 2, r.top, 'ぱしゃっ！ えへへ', 1000); S.tap(); }
          }
          if (x > -25) requestAnimationFrame(step);
          else { d.remove(); if (n >= 3 && !lane.querySelector('.pd-puddle')) res(); }
        };
        requestAnimationFrame(step);
        setTimeout(spawn, 1500 + Math.random() * 700);
      };
      setTimeout(spawn, 600);
    });
    c.hidePanel();
    await c.say('pyonta', ok >= 2 ? 'ジャンプ じょうず！ くつも ぬれなかったね！' : 'ぱしゃぱしゃ たのしかったね！', { expr: 'joy' });
    return c.guard(Promise.resolve());
  }
  async function puppyGame(c) {
    const where = Math.floor(Math.random() * 3);
    let tries = 0;
    const p = c.panel(`<div class="st-prompt">どこに あるかな？ くさむらを タッチ！</div><div class="bushes">${[0, 1, 2].map((i) => `<button class="bush" data-b="${i}">${svg('0 0 160 100', KP.drawBush(['#9EDDC8', '#BDEBA0', '#A8E3C6'][i]))}</button>`).join('')}</div>`, 'bottom');
    await new Promise((res) => {
      p.addEventListener('click', (e) => {
        const b = e.target.closest('[data-b]');
        if (!b || b.classList.contains('opened')) return;
        tries++;
        b.classList.add('opened');
        const r = b.getBoundingClientRect();
        if (+b.dataset.b === where || tries >= 3) {
          b.innerHTML += `<span class="ball">${svg('0 0 100 100', KP.drawBall())}</span>`;
          S.find();
          burst(r.left + r.width / 2, r.top + r.height / 2, ['star', 'sparkle'], 12, 90);
          setTimeout(res, 900);
        } else {
          S.tap();
          burst(r.left + r.width / 2, r.top + r.height / 2, ['leaf'], 7, 60);
          bubble(r.left + r.width / 2, r.top, rand(['ここには ないね', 'ちょうちょ だった！', 'はっぱ だけ']), 1200);
        }
      });
    });
    c.hidePanel();
    return c.guard(Promise.resolve());
  }
  async function crossGame(c) {
    const p = c.panel(`<div class="st-prompt">あおに なったら「わたる」を タッチ！</div><div class="cross"><span class="sig" id="sig">${svg('0 0 100 100', KP.drawTrafficIcon('red'))}</span><button class="pill main big" id="go">${icon('star', '#fff')}わたる！</button></div>`, 'bottom');
    let light = 'red';
    const sig = p.querySelector('#sig');
    const tid = setTimeout(() => {
      light = 'green';
      sig.innerHTML = svg('0 0 100 100', KP.drawTrafficIcon('green'));
      c.bg(KP.BG.street('green'));
      S.pop();
    }, 2500 + Math.random() * 1500);
    A.onCleanup(() => clearTimeout(tid));
    await new Promise((res) => {
      p.querySelector('#go').addEventListener('click', () => {
        if (light === 'red') {
          S.tap();
          c.oops();
          c.actor('pyonta', { html: bunHTML('surprise') });
          const r = p.getBoundingClientRect();
          bubble(r.left + r.width / 2, r.top, `${svg('0 0 100 100', KP.drawTrafficIcon('red')).replace('<svg', '<svg class="ico"')}あかは とまれ だよ`, 1600);
          return;
        }
        res();
      });
    });
    c.hidePanel();
    await c.say('fuutan', 'みぎ・ひだり・みぎ…… よし！', { expr: 'smile' });
    c.actor('fuutan', { y: 60, h: 22, anim: 'walk' });
    c.actor('pyonta', { html: bunHTML('happy'), y: 60, h: 8 });
    await c.wait(1300);
    await c.say('pyonta', 'じょうずに わたれたね！', { expr: 'joy' });
    return c.guard(Promise.resolve());
  }

  // --- おみせ ---
  async function shopVisit(c, shop, need, list, got) {
    const SH = SHOPS[shop];
    c.clearActors();
    c.bg(KP.BG.shop(shop));
    c.actor('keeper', { html: aniSVG(SH.kind, 'happy', SH.wear), x: 74, y: 40, h: 22 });
    c.actor('fuutan', { html: fuuHTML({}), x: 26, y: 44, h: 28 });
    await c.say(SH.who, rand([`いらっしゃいませ！ ${SH.name}へ ようこそ！`, 'いらっしゃい！ なにに しますか？', 'こんにちは！ きょうも げんきだね！']), { expr: 'joy', actor: 'keeper' });
    const counts = need.some(([, n]) => n > 1);
    // たなから えらぶ（かずも かぞえる）
    const items = shuffle([...new Set([...need.map((x) => x[0]), ...shuffle(SH.shelf).slice(0, 8)])]).slice(0, 8);
    const p = c.panel(`<div class="shop-memo" id="smemo">${memoHTML(need, got)}</div><div class="st-prompt">${counts ? 'かずも かぞえて タッチしてね' : 'メモの ものを タッチしてね'}</div><div class="shelf">${items.map((k) => `<button class="sitem" data-k="${k}">${KP.foodSVG(k)}</button>`).join('')}</div><div class="basket" id="basket">${svg('0 0 120 90', `<path d="M10,30 L110,30 L98,86 L22,86Z" fill="#F5DEC8" stroke="#B5835E" stroke-width="4"/><path d="M24,30 Q60,-14 96,30" fill="none" stroke="#B5835E" stroke-width="6"/><path d="M20,48 H100 M24,66 H96" stroke="#B5835E" stroke-width="3"/>`)}</div>`, 'bottom shop');
    S.speak(counts ? 'かずも かぞえて タッチしてね' : 'メモの ものを タッチしてね', 1.45);
    const left = () => need.filter(([k, n]) => (got[k] || 0) < n);
    await new Promise((res) => {
      p.addEventListener('click', (e) => {
        const b = e.target.closest('[data-k]');
        if (!b) return;
        const k = b.dataset.k;
        const r = b.getBoundingClientRect();
        const want = need.find((x) => x[0] === k);
        if (want && (got[k] || 0) < want[1]) {
          got[k] = (got[k] || 0) + 1;
          const bk = p.querySelector('#basket').getBoundingClientRect();
          flyer(r.left + r.width / 2, r.top + r.height / 2, KP.foodSVG(k), bk.left + bk.width / 2 - r.left - r.width / 2, bk.top + 20 - r.top - r.height / 2, 600);
          S.pick();
          if (want[1] > 1) S.speak(['いち', 'に', 'さん', 'よん'][got[k] - 1] || '', 1.4);
          if (got[k] >= want[1]) b.classList.add('taken');
          setTimeout(() => { p.querySelector('#smemo').innerHTML = memoHTML(need, got); burst(bk.left + bk.width / 2, bk.top + 10, ['sparkle', 'star'], 6, 50); }, 560);
          if (!left().length) setTimeout(res, 900);
        } else {
          S.tap();
          b.classList.remove('wiggle'); void b.offsetWidth; b.classList.add('wiggle');
          bubble(r.left + r.width / 2, r.top, want ? 'もう じゅうぶん だよ' : `${KP.FOOD[k].name}は メモに ないね`, 1300);
          c.oops();
        }
      });
    });
    c.hidePanel();
    c.actor('keeper', { x: 76, y: 66, h: 26 });
    c.actor('fuutan', { x: 30, y: 99, h: 44 });
    // おかいけい
    const price = Math.min(6, need.reduce((a, [, n]) => a + n, 0) + Math.floor(Math.random() * 2));
    await c.say(SH.who, `おかいけいは コイン ${price}まい です`, { actor: 'keeper' });
    await payGame(c, price);
    if (Math.random() < 0.5) {
      const bag = await c.choose([{ label: 'エコバッグ', value: 'eco', icon: svg('0 0 100 100', `<path d="M24,36 L76,36 L70,90 L30,90Z" fill="#BDEBDC" stroke="#3F9C83" stroke-width="4"/><path d="M36,36 Q36,14 50,14 Q64,14 64,36" fill="none" stroke="#3F9C83" stroke-width="5"/>${KP.heart(50, 62, 9, '#fff')}`) }, { label: 'ふくろ ください', value: 'bag', icon: svg('0 0 100 100', `<path d="M26,30 L74,30 L70,90 L30,90Z" fill="#fff" stroke="#B9C4DA" stroke-width="4"/><path d="M38,30 L38,18 M62,30 L62,18" stroke="#B9C4DA" stroke-width="5"/>`) }], 'ふくろは いりますか？');
      await c.say(SH.who, bag === 'eco' ? 'エコバッグ えらいね！ ちきゅうも にっこり！' : 'はい、どうぞ！', { actor: 'keeper', expr: 'joy' });
    }
    await c.say(SH.who, rand(['ちょうど ですね！ ありがとう！ おまけに あめを どうぞ', 'ありがとう！ また きてね！', 'おつかい えらいね！ おまけの シールだよ']), { expr: 'joy', actor: 'keeper' });
    c.actor('fuutan', { html: fuuHTML({ pose: 'joy', expr: 'joy' }) });
    c.sparkleAt('fuutan', ['heart', 'sparkle'], 8);
    await c.say('fuutan', 'ありがとうございます！', { expr: 'joy' });
    return c.guard(Promise.resolve());
  }
  async function payGame(c, price) {
    let paid = 0;
    const p = c.panel(`<div class="st-prompt">コインを ${price}まい おいてね</div><div class="tray" id="tray">${Array.from({ length: price }, (_, i) => `<span class="slot" data-i="${i}"></span>`).join('')}</div><div class="purse">${Array.from({ length: 8 }, (_, i) => `<button class="coinb" data-c="${i}">${svg('0 0 100 100', KP.coin())}</button>`).join('')}</div>`, 'bottom pay');
    S.speak(`コインを ${price}まい おいてね`, 1.45);
    await new Promise((res) => {
      p.addEventListener('click', (e) => {
        const b = e.target.closest('[data-c]');
        if (!b || b.classList.contains('used') || paid >= price) return;
        const slot = p.querySelectorAll('.tray .slot')[paid];
        const r = b.getBoundingClientRect(), sr = slot.getBoundingClientRect();
        b.classList.add('used');
        flyer(r.left + r.width / 2, r.top + r.height / 2, svg('0 0 100 100', KP.coin()), sr.left + sr.width / 2 - r.left - r.width / 2, sr.top + sr.height / 2 - r.top - r.height / 2, 380);
        paid++;
        S.pop();
        S.speak(['いち', 'に', 'さん', 'よん', 'ご', 'ろく'][paid - 1] || '', 1.4);
        setTimeout(() => { slot.innerHTML = svg('0 0 100 100', KP.coin()); slot.classList.add('on'); }, 360);
        if (paid >= price) setTimeout(() => { S.done(); res(); }, 800);
      });
    });
    c.hidePanel();
    return c.guard(Promise.resolve());
  }

  // --- りょうり ---
  async function addIngredients(p, holder, list, onAdd) {
    let cnt = 0;
    await new Promise((res) => {
      p.addEventListener('click', (e) => {
        const b = e.target.closest('[data-k]');
        if (!b || b.classList.contains('taken')) return;
        b.classList.add('taken');
        cnt++;
        const r = b.getBoundingClientRect(), cr = holder.getBoundingClientRect();
        flyer(r.left + r.width / 2, r.top + r.height / 2, KP.foodSVG(b.dataset.k), cr.left + cr.width / 2 - r.left - r.width / 2, cr.top + cr.height * 0.3 - r.top - r.height / 2, 500);
        S.pop();
        setTimeout(() => { onAdd(b.dataset.k); burst(cr.left + cr.width / 2, cr.top + cr.height * 0.35, ['drop', 'sparkle'], 6, 60); }, 480);
        if (cnt >= list.length) setTimeout(res, 800);
      });
    });
  }
  async function tapAction(p, label, n, onTap) {
    p.querySelector('.ings').innerHTML = `<button class="pill main big" id="act">${icon('magic', '#fff')}${label}</button>`;
    let k = 0;
    await new Promise((res) => {
      p.querySelector('#act').addEventListener('click', () => { k++; onTap(k); S.boing(); if (k >= n) setTimeout(res, 500); });
    });
  }
  async function reveal(c, p, holder, svgStr, name) {
    holder.innerHTML = svgStr;
    holder.classList.remove('pop'); void holder.offsetWidth; holder.classList.add('pop');
    S.henshin();
    const cr = holder.getBoundingClientRect();
    burst(cr.left + cr.width / 2, cr.top + cr.height / 2, ['star', 'heart', 'sparkle'], 20, 160);
    p.querySelector('.st-prompt').textContent = `${name}の できあがり！`;
    p.querySelector('.ings').innerHTML = '';
    S.speak(`${name}の できあがり！`, 1.45);
    await c.wait(2200);
    c.hidePanel();
  }
  async function cookGame(c, dk, tool, list) {
    const vessel = tool === 'stir'
      ? `<path d="M40,80 L260,80 L244,190 Q150,214 56,190Z" fill="#B9C4DA" stroke="#6A7490" stroke-width="5"/><ellipse cx="150" cy="80" rx="112" ry="22" fill="#C98C25" stroke="#6A7490" stroke-width="5"/><path d="M40,90 Q10,90 14,110 M260,90 Q290,90 286,110" fill="none" stroke="#6A7490" stroke-width="8" stroke-linecap="round"/>`
      : tool === 'glass'
        ? `<path d="M90,20 L210,20 L184,190 L116,190Z" fill="#F7F2FF" stroke="#C9B8E6" stroke-width="5" opacity=".95"/><path d="M130,190 L170,190 L180,210 L120,210Z" fill="#C9B8E6"/>`
        : `<rect x="20" y="90" width="260" height="110" rx="16" fill="#E6C08A" stroke="#B5835E" stroke-width="5"/><path d="M50,120 L150,60 L250,120Z" fill="#F6E1B8" stroke="#C99A5E" stroke-width="4"/>`;
    const added = [];
    const draw = (stir = 0) => svg('0 0 300 230', vessel + added.map((k, i) => `<g transform="translate(${70 + (i % 4) * 44 + (stir % 2) * 6} ${tool === 'glass' ? 130 - i * 26 : 40 + Math.floor(i / 4) * 20}) scale(.5) rotate(${stir * 30 + i * 20} 50 50)">${KP.FOOD[k].d}</g>`).join('') +
      (stir ? `<path d="M120,40 Q110,20 124,6 M150,36 Q140,16 154,2 M180,40 Q170,20 184,6" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>` : ''));
    const p = c.panel(`<div class="st-prompt">ざいりょうを いれよう</div><div class="cook" id="cook">${draw()}</div><div class="ings">${list.map((k) => `<button class="sitem" data-k="${k}">${KP.foodSVG(k)}</button>`).join('')}</div>`, 'full cookp');
    S.speak('ざいりょうを いれよう', 1.45);
    const cook = p.querySelector('#cook');
    await addIngredients(p, cook, list, (k) => { added.push(k); cook.innerHTML = draw(); });
    const verb = tool === 'stir' ? 'ぐつぐつ にこもう！ まぜまぜ タッチ！' : tool === 'glass' ? 'グラスに もりつけよう！' : 'パンに はさもう！';
    p.querySelector('.st-prompt').textContent = verb;
    S.speak(verb, 1.45);
    await tapAction(p, tool === 'stir' ? 'まぜまぜ' : tool === 'glass' ? 'のせる' : 'はさむ', 6, (k) => { cook.innerHTML = draw(k); const cr = cook.getBoundingClientRect(); burst(cr.left + cr.width / 2, cr.top + cr.height * 0.3, ['heart', 'sparkle'], 5, 60); });
    await reveal(c, p, cook, svg('0 0 300 190', KP.DISH[dk]), { curry: 'カレー', sand: 'サンドイッチ', parfait: 'フルーツパフェ' }[dk]);
    return c.guard(Promise.resolve());
  }
  async function pancakeGame(c) {
    const pan = (st, bubbles = 0, flipped = false, stack = 0) => svg('0 0 300 230',
      `<ellipse cx="150" cy="150" rx="120" ry="44" fill="#5A5F7A" stroke="#3A3D50" stroke-width="5"/><path d="M262,150 L300,140" stroke="#3A3D50" stroke-width="12" stroke-linecap="round"/>` +
      (st ? `<ellipse cx="150" cy="140" rx="86" ry="28" fill="${flipped ? '#E6A85A' : '#FFF0C8'}" stroke="#D2A43A" stroke-width="3"/>` + Array.from({ length: bubbles }, (_, i) => `<circle cx="${100 + (i * 37) % 100}" cy="${130 + (i * 13) % 20}" r="4" fill="#fff" stroke="#E9C25C"/>`).join('') : '') +
      Array.from({ length: stack }, (_, i) => `<g transform="translate(0 ${-i * 8})"><ellipse cx="60" cy="210" rx="44" ry="12" fill="#E6A85A" stroke="#B5835E" stroke-width="2"/></g>`).join(''));
    const p = c.panel(`<div class="st-prompt">ざいりょうを ボウルに いれよう</div><div class="cook" id="cook">${pan(false)}</div><div class="ings">${['mix', 'egg', 'milk'].map((k) => `<button class="sitem" data-k="${k}">${KP.foodSVG(k)}</button>`).join('')}</div>`, 'full cookp');
    S.speak('ざいりょうを ボウルに いれよう', 1.45);
    const cook = p.querySelector('#cook');
    await addIngredients(p, cook, ['mix', 'egg', 'milk'], () => {});
    p.querySelector('.st-prompt').textContent = 'まぜまぜ して フライパンへ！';
    await tapAction(p, 'まぜまぜ', 4, () => { const cr = cook.getBoundingClientRect(); burst(cr.left + cr.width / 2, cr.top + cr.height * 0.4, ['sparkle'], 4, 50); });
    let made = 0;
    for (let round = 0; round < 3; round++) {
      let bub = 0, ready = false, done = false;
      cook.innerHTML = pan(true, 0, false, made);
      p.querySelector('.st-prompt').textContent = 'ぷつぷつ あわが でたら ひっくりかえす！';
      S.speak('ぷつぷつ あわが でたら ひっくりかえそう', 1.45);
      p.querySelector('.ings').innerHTML = `<button class="pill main big" id="flip">${icon('reset', '#fff')}ひっくりかえす</button>`;
      const iv = setInterval(() => { if (!c.alive.v || done) return; bub = Math.min(8, bub + 1); cook.innerHTML = pan(true, bub, false, made); if (bub >= 6 && !ready) { ready = true; const cr = cook.getBoundingClientRect(); bubble(cr.left + cr.width / 2, cr.top + 20, 'いまだ！', 900); S.pop(); } }, 450);
      A.onCleanup(() => clearInterval(iv));
      await new Promise((res) => {
        p.querySelector('#flip').addEventListener('click', () => {
          if (!ready) { const cr = cook.getBoundingClientRect(); bubble(cr.left + cr.width / 2, cr.top + 20, 'まだ ちょっと はやいかも', 900); S.tap(); return; }
          done = true;
          clearInterval(iv);
          cook.classList.remove('flip'); void cook.offsetWidth; cook.classList.add('flip');
          S.boing();
          setTimeout(() => { cook.innerHTML = pan(true, 0, true, made); const cr = cook.getBoundingClientRect(); burst(cr.left + cr.width / 2, cr.top + cr.height * 0.6, ['star', 'sparkle'], 8, 70); S.pick(); }, 300);
          setTimeout(res, 1000);
        });
      });
      made++;
    }
    p.querySelector('.st-prompt').textContent = 'いちごと バターを のせよう！';
    p.querySelector('.ings').innerHTML = ['strawberry', 'butter'].map((k) => `<button class="sitem" data-k="${k}">${KP.foodSVG(k)}</button>`).join('');
    await addIngredients(p, cook, ['strawberry', 'butter'], () => {});
    await reveal(c, p, cook, svg('0 0 300 190', KP.DISH.pancake), 'ホットケーキ');
    return c.guard(Promise.resolve());
  }
  async function pizzaGame(c) {
    const p = c.panel(`<div class="st-prompt">ゆびで こすって ソースを ぬろう！</div><div class="cook pz" id="cook"><canvas id="pzc"></canvas></div><div class="ings"></div>`, 'full cookp');
    S.speak('ゆびで こすって ソースを ぬろう', 1.45);
    const cook = p.querySelector('#cook'), cv = p.querySelector('#pzc');
    const W = Math.round(cook.getBoundingClientRect().width) || 300, H = Math.round(W * 0.66);
    cv.width = W; cv.height = H; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const g = cv.getContext('2d');
    const cx = W / 2, cy = H / 2, R = H * 0.46;
    const base = () => { g.fillStyle = '#F2C27C'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.strokeStyle = '#B5835E'; g.lineWidth = 5; g.stroke(); g.fillStyle = '#FBE3B8'; g.beginPath(); g.arc(cx, cy, R * 0.86, 0, 7); g.fill(); };
    base();
    let painted = 0, drawing = false;
    const total = 40;
    const done1 = new Promise((res) => {
      const paint = (e) => {
        const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        if (Math.hypot(x - cx, y - cy) > R * 0.86) return;
        g.fillStyle = '#E0465E'; g.beginPath(); g.arc(x, y, R * 0.18, 0, 7); g.fill();
        painted++;
        if (painted % 6 === 0) S.tap();
        if (painted >= total) res();
      };
      cv.addEventListener('pointerdown', (e) => { drawing = true; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* なし */ } paint(e); });
      cv.addEventListener('pointermove', (e) => { if (drawing) paint(e); });
      cv.addEventListener('pointerup', () => (drawing = false));
    });
    await done1;
    g.fillStyle = '#E0465E'; g.beginPath(); g.arc(cx, cy, R * 0.86, 0, 7); g.fill();
    S.sparkle();
    p.querySelector('.st-prompt').textContent = 'すきな ぐを のせよう！';
    S.speak('すきな ぐを のせよう', 1.45);
    const tops = ['cheese', 'corn', 'sausage', 'tomato'];
    p.querySelector('.ings').innerHTML = tops.map((k) => `<button class="sitem" data-k="${k}">${KP.foodSVG(k)}</button>`).join('') + `<button class="pill main" id="oven">${icon('star', '#fff')}やく！</button>`;
    let placed = 0;
    await new Promise((res) => {
      p.querySelector('.ings').addEventListener('click', (e) => {
        if (e.target.closest('#oven')) { if (placed >= 3) res(); else { const r = cook.getBoundingClientRect(); bubble(r.left + r.width / 2, r.top + 20, 'もっと のせよう！', 900); } return; }
        const b = e.target.closest('[data-k]');
        if (!b) return;
        const a = Math.random() * 7, rr = Math.random() * R * 0.62;
        const im = new Image();
        im.onload = () => g.drawImage(im, cx + Math.cos(a) * rr - R * 0.17, cy + Math.sin(a) * rr - R * 0.17, R * 0.34, R * 0.34);
        im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(KP.foodSVG(b.dataset.k).replace('<svg ', '<svg width="100" height="100" '));
        placed++;
        S.pop();
      });
    });
    p.querySelector('.st-prompt').textContent = 'オーブンで こんがり…';
    S.speak('オーブンで こんがり', 1.45);
    cook.classList.add('oven');
    for (let i = 3; i > 0; i--) { const r = cook.getBoundingClientRect(); bubble(r.left + r.width / 2, r.top + 10, `${i}`, 800); S.tap(); await c.wait(900); }
    cook.classList.remove('oven');
    await reveal(c, p, cook, svg('0 0 300 200', KP.DISH.pizza), 'ピザ');
    return c.guard(Promise.resolve());
  }
  async function bentoGame(c, list) {
    const items = [];
    const draw = () => svg('0 0 300 200', KP.DISH.bento + bentoFill(items));
    const p = c.panel(`<div class="st-prompt">おべんとうばこに つめよう！</div><div class="cook" id="cook">${draw()}</div><div class="ings">${list.map((k) => `<button class="sitem" data-k="${k}">${KP.foodSVG(k)}</button>`).join('')}</div>`, 'full cookp');
    S.speak('おべんとうばこに つめよう', 1.45);
    const cook = p.querySelector('#cook');
    await addIngredients(p, cook, list, (k) => { items.push(k); cook.innerHTML = draw(); });
    p.querySelector('.st-prompt').textContent = 'ハートの ピックを さそう！';
    await tapAction(p, 'ピックを さす', 3, (k) => { cook.innerHTML = draw().replace('</svg>', [[120, 60], [230, 120], [80, 140]].slice(0, k).map(([x, y]) => KP.heart(x, y, 10, '#F29CC2', '#fff', 2)).join('') + '</svg>'); });
    await reveal(c, p, cook, draw().replace('</svg>', KP.heart(120, 60, 10, '#F29CC2', '#fff', 2) + KP.heart(230, 120, 10, '#F29CC2', '#fff', 2) + KP.sparkle(260, 40, 12, '#FFE59A') + '</svg>'), 'おべんとう');
    return c.guard(Promise.resolve());
  }
  async function cakeDecorate(c) {
    const cake = { shape: 'round', cream: rand(['pink', 'white', 'choco']), tops: [] };
    const draw = () => svg('60 120 480 330', A.drawCake(cake));
    const p = c.panel(`<div class="st-prompt">いちごと ろうそくで かざろう！</div><div class="cook" id="cook">${draw()}</div><div class="ings">${['strawberry', 'candle', 'heart', 'star'].map((t) => `<button class="sitem" data-t="${t}">${svg(t === 'candle' ? '-22 -62 44 66' : '-19 -23 38 40', A.drawTop1(t, 0, 0))}</button>`).join('')}<button class="pill main" id="ok">${icon('check', '#fff')}できた！</button></div>`, 'full cookp');
    S.speak('いちごと ろうそくで かざろう', 1.45);
    const cook = p.querySelector('#cook');
    await new Promise((res) => {
      p.querySelector('.ings').addEventListener('click', (e) => {
        if (e.target.closest('#ok')) { if (cake.tops.length >= 3) res(); else { const r = cook.getBoundingClientRect(); bubble(r.left + r.width / 2, r.top + 20, 'もっと かざろう！', 900); } return; }
        const b = e.target.closest('[data-t]');
        if (!b) return;
        if (cake.tops.length >= 16) cake.tops.shift();
        cake.tops.push({ t: b.dataset.t, ...A.cakeSpot(cake) });
        cook.innerHTML = draw();
        S.pop();
      });
    });
    await reveal(c, p, cook, draw(), 'ケーキ');
    return c.guard(Promise.resolve());
  }

  // ================= ③ はいしゃさんの おてつだい =================
  // なやみは 5しゅ（むしば・たべかす・ぐらぐら・はみがき・しみる あな）。こわがりさんや クイズも まじる
  const PATIENTS = [
    { kind: 'cat', name: 'ねこちゃん' }, { kind: 'dog', name: 'いぬくん' }, { kind: 'panda', name: 'パンダちゃん' }, { kind: 'pig', name: 'こぶたちゃん' }, { kind: 'bear', name: 'くまの こ' }, { kind: 'rabbit', name: 'うさぎちゃん' },
  ];
  const PROBLEMS = {
    mushiba: { say: 'えーん… はが いたいの…', phases: ['light', 'germ', 'water'] },
    kasu: { say: 'はに なにか はさまってるの…', phases: ['light', 'bit', 'stain', 'water'] },
    gura: { say: 'まえばが ぐらぐら するの…', phases: ['light', 'loose', 'water'] },
    migaki: { say: 'はみがきの しかたを おしえて！', phases: ['zone', 'water'], lit: true },
    ana: { say: 'つめたい ものが しみるの…', phases: ['light', 'germ', 'hole', 'water'] },
  };
  const NURSE = { onepiece: 'nurse-pink', hair: 'nursecap-pink', shoes: 'pumps-pink', tops: null, skirt: null, ribbon: null, magic: null };
  const nurseHTML = (x = {}) => svg('0 -30 400 680', KP.drawChar({ ...A.fuuHair(), outfit: toDraw(NURSE), ...x }));
  KP.DATA.ITEMS['nurse-pink'] = KP.DATA.ITEMS['nurse-pink'] || { id: 'nurse-pink', slot: 'onepiece', type: 'nurse', color: 'pink', name: 'ナースふく', hidden: true, story: true };
  KP.DATA.ITEMS['nursecap-pink'] = KP.DATA.ITEMS['nursecap-pink'] || { id: 'nursecap-pink', slot: 'hair', type: 'nursecap', color: 'pink', name: 'ナースぼうし', hidden: true, story: true };
  KP.DATA.ITEMS['apron-pink'] = KP.DATA.ITEMS['apron-pink'] || { id: 'apron-pink', slot: 'onepiece', type: 'apron', color: 'pink', name: 'エプロン', hidden: true, story: true };
  const QUIZ = [
    { q: 'はに やさしい おやつは どっち？', a: [['apple', 'りんご', 1], ['candy', 'キャンディ', 0]], why: 'あまい ものを たべたら はみがき しようね' },
    { q: 'はに やさしい のみものは どっち？', a: [['milk', 'ぎゅうにゅう', 1], ['juice', 'ジュース', 0]], why: 'ジュースの あとは おみずで くちを ゆすごうね' },
    { q: 'おやつに いいのは どっち？', a: [['cheese', 'チーズ', 1], ['choco', 'チョコ', 0]], why: 'チーズは はを つよく してくれるよ' },
    { q: 'ねる まえに のむなら どっち？', a: [['water', 'おみず', 1], ['juice', 'ジュース', 0]], why: 'ねる まえは おみずが いちばん！' },
  ];
  RUN.dentist = async function (c) {
    const pats = shuffle(PATIENTS).slice(0, 3);
    const probs = shuffle(Object.keys(PROBLEMS));
    c.bg(KP.BG.clinic());
    c.actor('doctor', { html: aniSVG('bear', 'smile', { kind: 'coat' }), x: 18, y: 99, h: 36 });
    c.actor('fuutan', { html: fuuHTML({}), x: 80, y: 99, h: 52 });
    await c.say('doctor', rand(['やあ ふーたん！ きょうも おてつだい よろしくね', 'ふーたん、きてくれて ありがとう！ きょうは かんじゃさんが いっぱいだよ']));
    await c.say('doctor', 'まずは かんごしさんの ふくに おきがえ しよう！');
    c.sparkleAt('fuutan', ['sparkle', 'star', 'heart'], 16);
    S.henshin();
    await c.wait(500);
    c.actor('fuutan', { html: nurseHTML({ pose: 'cheer', expr: 'joy' }) });
    await c.say('fuutan', 'じゃーん！ かんごしさんに なったよ！', { expr: 'joy' });
    for (let i = 0; i < pats.length; i++) {
      const P = pats[i];
      const prob = probs[i % probs.length];
      const PR = PROBLEMS[prob];
      const pc = { name: P.name, pitch: 1.6, face: (e) => aniFace(P.kind, e === 'joy' ? 'happy' : e || 'sad') };
      c.actor('fuutan', { html: nurseHTML({}) });
      c.actor('pat', { html: aniSVG(P.kind, 'sad', { kind: 'bib' }), x: 49, y: 72, h: 26, z: 150 });
      await c.say(pc, `${i === 0 ? 'こんにちは… ' : ''}${PR.say}`, { actor: 'pat', expr: 'sad' });
      // こわがりさん
      if (Math.random() < 0.45) {
        await c.say(pc, 'でも… はいしゃさん ちょっと こわいよ〜', { actor: 'pat', expr: 'sad' });
        const how = await c.choose([
          { label: 'ぬいぐるみ', value: 'plush', icon: svg('0 -30 200 250', KP.drawBunny('happy')) },
          { label: 'うたを うたう', value: 'song', icon: svg('0 0 100 100', KP.ICONS.music()) },
          { label: 'てを にぎる', value: 'hand', icon: svg('0 0 100 100', KP.ICONS.heart()) },
        ], 'どうやって あんしん させる？');
        if (how === 'song') { for (let k = 0; k < 4; k++) { c.sparkleAt('pat', ['note'], 4); S.sparkle(); await c.wait(300); } }
        else c.sparkleAt('pat', ['heart', 'sparkle'], 10);
        c.actor('fuutan', { html: nurseHTML({ pose: how === 'song' ? 'joy' : 'wave', expr: 'joy' }) });
        await c.say('fuutan', how === 'plush' ? 'ぴょんたの ぬいぐるみ、ぎゅって してていいよ' : how === 'song' ? 'は〜みがき じょうずかな〜♪ だいじょうぶ だいじょうぶ♪' : 'てを にぎってるから だいじょうぶだよ', { expr: 'joy' });
        c.actor('pat', { html: aniSVG(P.kind, 'smile', { kind: 'bib' }) });
        await c.say(pc, '……うん。がんばる！', { actor: 'pat', expr: 'smile' });
      } else {
        await c.say('fuutan', `だいじょうぶだよ、${P.name}。いすに すわってね`, {});
      }
      await c.say('doctor', prob === 'migaki' ? 'よし、ふーたん。はみがきの おてほんを みせて あげて！' : 'はい、あーん して ください。ふーたん、おくちの なかを みてみよう！');
      await mouthGame(c, P, prob);
      c.actor('pat', { html: aniSVG(P.kind, 'happy', { kind: 'bib' }) });
      c.sparkleAt('pat', ['star', 'heart', 'sparkle'], 14);
      await c.say(pc, { mushiba: 'もう いたくない！ ありがとう！', kasu: 'すっきり した〜！ ありがとう！', gura: 'ぬけた！ おとなの はが はえて くるんだね！', migaki: 'じょうずに みがけるように なったよ！', ana: 'もう しみない！ キラキラの つめもの かわいい！' }[prob], { actor: 'pat', expr: 'joy' });
      // クイズ
      if (Math.random() < 0.6) {
        const Q = rand(QUIZ);
        const opts = shuffle(Q.a);
        const v = await c.choose(opts.map(([k, l, ok]) => ({ label: l, value: ok, icon: KP.foodSVG(k) })), `${P.name}から しつもん！ ${Q.q}`);
        if (v) { S.done(); c.sparkleAt('fuutan', ['star', 'heart'], 10); await c.say('doctor', `せいかい！ ${Q.why}`, { expr: 'joy' }); }
        else await c.say('doctor', `どっちも おいしいけど、はには もう ひとつの ほうが やさしいんだ。${Q.why}`);
      }
      const st = await c.choose(shuffle([
        { label: 'ほし', value: 'star', icon: svg('0 0 100 100', KP.ICONS.star()) },
        { label: 'ハート', value: 'heart', icon: svg('0 0 100 100', KP.ICONS.heart()) },
        { label: 'ぴかぴか', value: 'tooth', icon: svg('0 0 100 100', `<path d="M30,40 Q30,16 50,18 Q70,16 70,40 Q70,70 62,88 Q58,92 54,76 Q52,66 50,66 Q48,66 46,76 Q42,92 38,88 Q30,70 30,40Z" fill="#fff" stroke="#9DBDF4" stroke-width="5"/>${KP.sparkle(76, 20, 9, '#FFE08A')}`) },
        { label: 'うさぎ', value: 'bunny', icon: svg('0 -30 200 250', KP.drawBunny('happy')) },
        { label: 'おはな', value: 'flower', icon: svg('0 0 100 100', KP.ICONS.flower()) },
      ]).slice(0, 3), 'がんばった ごほうびの シールを えらんでね');
      c.actor('pat', { html: aniSVG(P.kind, 'happy', { kind: 'bib' }), anim: 'bounce' });
      c.sparkleAt('pat', [st === 'heart' ? 'heart' : 'star', 'sparkle'], 10);
      S.done();
      await c.say(pc, rand(['シール うれしい！ まいにち はみがき するね！', 'ありがとう、かんごしさん！ また くるね！', 'わーい！ みんなに みせて くる！']), { actor: 'pat', expr: 'joy' });
      c.actor('pat', null);
      await c.wait(400);
    }
    c.actor('doctor', { html: aniSVG('bear', 'happy', { kind: 'coat' }) });
    await c.say('doctor', 'ふーたん、すごい！ りっぱな かんごしさん だったよ！', { expr: 'joy' });
    c.actor('fuutan', { html: nurseHTML({ pose: 'joy', expr: 'joy' }) });
    await c.say('fuutan', 'えへへ。わたしも まいにち はみがき がんばる！', { expr: 'joy' });
    album('clinic', { pats: pats.map((p) => p.kind), hs: G().character.hairStyle, hc: G().character.hairColor });
    storyClear(c, 'dentist');
  };

  // おくちの なか：フェーズごとに どうぐを つかう
  const TOOL_ART = {
    light: ['ライト', `<rect x="34" y="40" width="34" height="50" rx="8" fill="#B9C4DA" stroke="#6A7490" stroke-width="4"/><path d="M20,40 L82,40 L70,14 L32,14Z" fill="#FFE59A" stroke="#D29A3A" stroke-width="4"/>${KP.sparkle(52, 6, 8, '#FFE59A')}`],
    brush: ['はブラシ', `<rect x="44" y="30" width="12" height="66" rx="6" fill="#9DBDF4" stroke="#6F98E2" stroke-width="3"/><rect x="36" y="8" width="28" height="28" rx="6" fill="#fff" stroke="#9DBDF4" stroke-width="3"/><path d="M42,12 V32 M50,12 V32 M58,12 V32" stroke="#BFE3FF" stroke-width="3"/>`],
    pinset: ['ピンセット', `<path d="M30,92 L46,10 M70,92 L54,10" stroke="#B9C4DA" stroke-width="8" stroke-linecap="round"/><path d="M30,92 L70,92" stroke="#8A94AE" stroke-width="8" stroke-linecap="round"/>`],
    fill: ['つめもの', `<rect x="38" y="40" width="24" height="54" rx="6" fill="#F29CC2" stroke="#C9668F" stroke-width="3"/><path d="M42,40 L50,8 L58,40Z" fill="#fff" stroke="#C9668F" stroke-width="3"/>${KP.sparkle(70, 20, 9, '#FFE59A')}`],
    water: ['おみず', `<path d="M28,30 L72,30 L66,90 L34,90Z" fill="#EAF6FF" stroke="#8CB4E8" stroke-width="4"/><path d="M32,52 L68,52 L66,88 L34,88Z" fill="#9DCDF4"/><path d="M50,4 C60,18 62,22 62,26 A12,12 0 0,1 38,26 C38,22 40,18 50,4Z" fill="#BFE3FF" stroke="#8CB4E8" stroke-width="3"/>`],
  };
  const PHASE_TOOL = { light: 'light', germ: 'brush', stain: 'brush', zone: 'brush', bit: 'pinset', loose: 'pinset', hole: 'fill', water: 'water' };
  const PHASE_TEXT = {
    light: 'くらくて みえないね。ライトを つけよう！', germ: 'むしばきんを はブラシで ごしごし！', stain: 'よごれを はブラシで ぴかぴかに！', bit: 'はさまった たべかすを ピンセットで とろう！',
    loose: 'ぐらぐらの はを ピンセットで そっと タッチ！', hole: 'あなを つめもので ふさごう！', zone: 'ひかって いる ところを はブラシで ごしごし！', water: 'おみずで きれいに しよう！',
  };
  const BIT_ART = [`<path d="M-8,-10 Q0,-16 8,-10 Q12,0 8,10 Q0,16 -8,10 Q-12,0 -8,-10Z" fill="#FFE07A" stroke="#D2A43A" stroke-width="2"/>`, `<path d="M-14,4 Q-4,-16 14,-8 Q4,12 -14,4Z" fill="#6FAE5A" stroke="#3F7A3A" stroke-width="2"/>`, `<rect x="-9" y="-9" width="18" height="18" rx="4" fill="#8A5A3A" stroke="#5A3A20" stroke-width="2"/>`];
  const ZONES = [{ x: 300, y: 268, w: 140, h: 70 }, { x: 206, y: 272, w: 90, h: 70 }, { x: 394, y: 272, w: 90, h: 70 }, { x: 300, y: 452, w: 140, h: 70 }];
  async function mouthGame(c, P, prob) {
    const PR = PROBLEMS[prob];
    const ti = shuffle(KP.TEETH.map((_, i) => i));
    const objs = [];
    let k = 0;
    const take = () => ti[k++ % ti.length];
    if (PR.phases.includes('germ')) for (let n = 0; n < (prob === 'ana' ? 2 : 3 + Math.floor(Math.random() * 3)); n++) objs.push({ kind: 'germ', ti: take(), hp: 3, v: n % 3 });
    // たまに ボスの「むしばキング」
    const boss = prob === 'mushiba' && Math.random() < 0.55;
    if (boss) objs.push({ kind: 'germ', ti: take(), hp: 10, v: 0, boss: true });
    if (PR.phases.includes('bit')) for (let n = 0; n < 3; n++) objs.push({ kind: 'bit', ti: take(), hp: 1, v: n % 3 });
    if (PR.phases.includes('stain')) for (let n = 0; n < 3; n++) objs.push({ kind: 'stain', ti: take(), hp: 3 });
    if (PR.phases.includes('hole')) for (let n = 0; n < 2; n++) objs.push({ kind: 'hole', ti: take(), hp: 1 });
    if (PR.phases.includes('loose')) objs.push({ kind: 'loose', ti: rand([2, 3, 8, 9]), hp: 5 });
    if (PR.phases.includes('zone')) ZONES.forEach((z, i) => objs.push({ kind: 'zone', zi: i, hp: 7 }));
    objs.forEach((o, i) => (o.id = i));
    const fillCol = rand([['#FFFFFF', 'しろ'], ['#FFE08A', 'きんいろ'], ['#FFB8D6', 'ピンク']]);
    let lit = !!PR.lit, rinsed = false, ph = 0, hidden = [];
    const phase = () => PR.phases[ph];
    const doneKind = (kd) => objs.filter((o) => o.kind === kd).every((o) => o.done);
    const draw = () => {
      let o = KP.drawMouthView(P.kind, { light: lit, nervous: !rinsed, happy: rinsed, shine: rinsed, hide: hidden });
      if (lit) {
        for (const ob of objs) {
          const t = KP.TEETH[ob.ti] || { x: 0, y: 0 };
          if (ob.kind === 'germ') {
            if (ob.foam && !rinsed) o += KP.drawFoam(t.x, t.y, 3 + ob.foam * 2);
            if (!ob.done) o += ob.boss
              ? `<g class="mobj germ boss" data-o="${ob.id}"><g class="wob">${KP.drawGerm(t.x, t.y, 1.6 + ob.hp * 0.05, 0)}<path d="M${t.x - 22},${t.y - 40} L${t.x - 26},${t.y - 64} L${t.x - 10},${t.y - 50} L${t.x},${t.y - 70} L${t.x + 10},${t.y - 50} L${t.x + 26},${t.y - 64} L${t.x + 22},${t.y - 40}Z" fill="#FFD772" stroke="#C99234" stroke-width="3"/><rect x="${t.x - 30}" y="${t.y + 40}" width="60" height="8" rx="4" fill="#5A3A60"/><rect x="${t.x - 30}" y="${t.y + 40}" width="${6 * ob.hp}" height="8" rx="4" fill="#FF5A8A"/></g></g>`
              : `<g class="mobj germ" data-o="${ob.id}"><g class="wob">${KP.drawGerm(t.x, t.y, 0.9 + ob.hp * 0.12, ob.v)}</g></g>`;
          } else if (ob.kind === 'bit' && !ob.done) o += `<g class="mobj" data-o="${ob.id}" transform="translate(${t.x + 22} ${t.y + (KP.TEETH[ob.ti].up ? 18 : -18)}) scale(1.6)"><circle r="16" fill="transparent"/>${BIT_ART[ob.v]}</g>`;
          else if (ob.kind === 'stain' && !ob.done) o += `<g class="mobj" data-o="${ob.id}"><ellipse cx="${t.x}" cy="${t.y}" rx="16" ry="20" fill="#A8743A" opacity="${0.2 + ob.hp * 0.18}"/></g>`;
          else if (ob.kind === 'hole') o += ob.done ? `<g><circle cx="${t.x}" cy="${t.y}" r="11" fill="${fillCol[0]}" stroke="#E9C25C" stroke-width="2"/>${KP.sparkle(t.x + 4, t.y - 4, 5, '#fff')}</g>` : (doneKind('germ') ? `<g class="mobj" data-o="${ob.id}"><circle cx="${t.x}" cy="${t.y}" r="16" fill="transparent"/><circle cx="${t.x}" cy="${t.y}" r="10" fill="#3A2A2A"/></g>` : '');
          else if (ob.kind === 'loose' && !ob.done) o += `<g class="mobj" data-o="${ob.id}"><g class="wob big" style="animation-duration:${0.25 + ob.hp * 0.12}s"><rect x="${t.x - 22}" y="${t.y - 32}" width="44" height="64" rx="14" fill="#FFF8D6" stroke="#F2B94A" stroke-width="4"/></g></g>`;
          else if (ob.kind === 'zone') {
            const z = ZONES[ob.zi];
            const cur = phase() === 'zone' && objs.filter((x) => x.kind === 'zone' && !x.done)[0] === ob;
            if (cur) o += `<g class="mobj" data-o="${ob.id}"><rect x="${z.x - z.w / 2}" y="${z.y - z.h / 2}" width="${z.w}" height="${z.h}" rx="20" fill="#FFE28A" opacity=".45" stroke="#E9B44C" stroke-width="4" stroke-dasharray="10 8"/><rect x="${z.x - z.w / 2}" y="${z.y + z.h / 2 + 6}" width="${(z.w * (7 - ob.hp)) / 7}" height="8" rx="4" fill="#F29CC2"/></g>`;
            else if (ob.done) o += KP.sparkle(z.x, z.y - 20, 10, '#fff');
          }
        }
        if (rinsed) KP.TEETH.forEach((t, i) => { if (i % 2 === 0 && !hidden.includes(i)) o += KP.sparkle(t.x + 12, t.y - 18, 9, '#fff'); });
      }
      return svg('0 0 600 600', o);
    };
    const tools = [...new Set(PR.phases.map((x) => PHASE_TOOL[x]))];
    const p = c.panel(`<div class="st-prompt" id="mPrompt"></div><div class="mouth" id="mouth">${draw()}</div><div class="tools" id="mTools"></div>`, 'full mouthp');
    const mouth = p.querySelector('#mouth'), toolsEl = p.querySelector('#mTools'), prompt = p.querySelector('#mPrompt');
    let tool = PHASE_TOOL[phase()];
    const setPrompt = () => { const t = PHASE_TEXT[phase()]; prompt.textContent = t; S.speak(t, 1.45); };
    const drawTools = () => (toolsEl.innerHTML = tools.map((kk) => `<button class="mk-tool${tool === kk ? ' sel' : ''}${PHASE_TOOL[phase()] === kk ? ' nexttool' : ''}" data-t="${kk}">${svg('0 0 100 100', TOOL_ART[kk][1])}<span>${TOOL_ART[kk][0]}</span></button>`).join(''));
    let finish;
    const finished = new Promise((r) => (finish = r));
    const next = () => {
      ph++;
      if (ph >= PR.phases.length) return;
      tool = PHASE_TOOL[phase()];
      setTimeout(() => { mouth.innerHTML = draw(); setPrompt(); drawTools(); }, 300);
    };
    setPrompt(); drawTools();
    const say = (txt, from) => { const r = (from || mouth).getBoundingClientRect(); bubble(r.left + r.width / 2, r.top + 30, txt, 1400); };
    const action = (kk, from) => {
      if (ph >= PR.phases.length) return;
      if (kk !== PHASE_TOOL[phase()]) {
        tool = kk; drawTools();
        c.oops();
        say(kk === 'water' ? 'さきに ' + PHASE_TEXT[phase()].replace(/！$/, '') : kk === 'light' ? 'もう あかるいよ' : 'いまは ' + TOOL_ART[PHASE_TOOL[phase()]][0] + ' だよ', from);
        return;
      }
      tool = kk; drawTools();
      if (kk === 'light') {
        lit = true;
        mouth.innerHTML = draw();
        S.sparkle();
        const r = mouth.getBoundingClientRect();
        bubble(r.left + r.width / 2, r.top + r.height * 0.3, `${icon('search')}${boss ? 'ボスの むしばキングが いる！' : prob === 'mushiba' || prob === 'ana' ? 'むしばきんが いた！' : prob === 'kasu' ? 'なにか はさまってる！' : 'この はが ぐらぐらだね'}`, 1600);
        if (boss) { KP.fx.shake(mouth, 6); S.boing(); }
        next();
      } else if (kk === 'water') {
        rinsed = true;
        const r = mouth.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height * 0.5, ['drop'], 18, 160);
        S.sparkle();
        setTimeout(() => { mouth.innerHTML = draw(); burst(r.left + r.width / 2, r.top + r.height * 0.5, ['sparkle', 'star'], 14, 150); S.done(); prompt.textContent = 'ぴかぴかに なったね！'; S.speak('ぴかぴかに なったね！', 1.45); }, 600);
        setTimeout(finish, 2200);
        ph = PR.phases.length;
      }
    };
    let combo = 0, lastHit = 0;
    const comboEl = document.createElement('div');
    comboEl.className = 'scrub-combo';
    const hit = (oid) => {
      const ob = objs[oid];
      if (!ob || ob.done || ob.kind !== phase()) return;
      const nowT = performance.now();
      combo = nowT - lastHit < 700 ? combo + 1 : 1;
      lastHit = nowT;
      if (combo >= 3) {
        if (!comboEl.parentNode) mouth.parentNode.appendChild(comboEl);
        comboEl.innerHTML = `ごしごし <b>×${combo}</b>`;
        comboEl.classList.remove('bump'); void comboEl.offsetWidth; comboEl.classList.add('bump');
        if (combo % 10 === 0) { KP.fx.confetti(innerWidth / 2, innerHeight * 0.4, 30, 0.6); S.sparkle(); }
      }
      if (PHASE_TOOL[ob.kind] !== tool) { tool = PHASE_TOOL[ob.kind]; drawTools(); }
      const el = mouth.querySelector(`[data-o="${oid}"]`);
      const r = el ? el.getBoundingClientRect() : mouth.getBoundingClientRect();
      ob.hp--;
      if (ob.kind === 'germ') ob.foam = (ob.foam || 0) + 1;
      S.pop();
      burst(r.left + r.width / 2, r.top + r.height / 2, ob.kind === 'zone' ? ['drop', 'sparkle'] : ['sparkle'], 4, 40);
      if (ob.hp <= 0) {
        ob.done = true;
        if (ob.kind === 'germ' && ob.boss) { KP.fx.shake(mouth, 10); KP.fx.flash('#FFF6CF', 400); KP.fx.banner('むしばキング たいじ！', 'gold'); KP.fx.confetti(innerWidth / 2, innerHeight * 0.35, 100, 1); S.henshin(); }
        else if (ob.kind === 'germ') { flyer(r.left + r.width / 2, r.top + r.height / 2, svg('-40 -40 80 80', KP.drawGerm(0, 0, 1, ob.v)), (Math.random() < 0.5 ? -1 : 1) * innerWidth * 0.6, -200, 900); bubble(r.left + r.width / 2, r.top, 'にげろ〜！', 1000); S.boing(); }
        if (ob.kind === 'bit') { flyer(r.left + r.width / 2, r.top + r.height / 2, svg('-20 -20 40 40', BIT_ART[ob.v]), 0, -260, 700); S.pick(); }
        if (ob.kind === 'stain') S.sparkle();
        if (ob.kind === 'hole') { S.sparkle(); burst(r.left + r.width / 2, r.top + r.height / 2, ['star', 'sparkle'], 8, 50); }
        if (ob.kind === 'loose') { hidden.push(ob.ti); flyer(r.left + r.width / 2, r.top + r.height / 2, svg('0 0 60 80', `<rect x="8" y="8" width="44" height="64" rx="14" fill="#FFF8D6" stroke="#F2B94A" stroke-width="4"/>`), 0, -300, 900); S.henshin(); bubble(r.left + r.width / 2, r.top, 'ぽろっ！ ぬけた！', 1400); }
        if (ob.kind === 'zone') { S.done(); bubble(r.left + r.width / 2, r.top, rand(['ぴかぴか！', 'じょうず！', 'シュッシュッ！']), 900); }
        if (doneKind(ob.kind)) next();
      } else if (ob.kind === 'loose') bubble(r.left + r.width / 2, r.top, ['ぐら…', 'ぐらぐら…', 'もうすこし！', 'あと ちょっと！'][4 - ob.hp] || 'ぐら', 700);
      mouth.innerHTML = draw();
    };
    // むしばきんは ときどき となりの はに にげる
    const hop = setInterval(() => {
      if (!c.alive.v || phase() !== 'germ' || prob !== 'mushiba') return;
      const g = objs.filter((o) => o.kind === 'germ' && !o.done);
      if (g.length > 1 && Math.random() < 0.5) { const ob = rand(g); const used = objs.map((o) => o.ti); const free = KP.TEETH.map((_, i) => i).filter((i) => !used.includes(i)); if (free.length) { ob.ti = rand(free); ob.foam = 0; mouth.innerHTML = draw(); } }
    }, 2600);
    A.onCleanup(() => clearInterval(hop));
    // タップ・ドラッグ・こする
    const objAt = (x, y) => { const el = document.elementFromPoint(x, y); const g = el && el.closest && el.closest('[data-o]'); return g ? +g.dataset.o : -1; };
    const overMouth = (x, y) => { const r = mouth.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
    const RUB = { germ: 220, stain: 220, zone: 120, bit: 400, loose: 350, hole: 400 };
    let drag = null;
    p.addEventListener('pointerdown', (e) => {
      const t = e.target.closest('[data-t]');
      if (t) {
        drag = { k: t.dataset.t, el: t, sx: e.clientX, sy: e.clientY, moved: false, ghost: null, last: -1, lastT: 0, id: e.pointerId };
        try { p.setPointerCapture(e.pointerId); } catch (er) { /* なし */ }
        return;
      }
      if (overMouth(e.clientX, e.clientY)) {
        drag = { k: tool, rub: true, moved: true, last: -1, lastT: 0, id: e.pointerId };
        try { p.setPointerCapture(e.pointerId); } catch (er) { /* なし */ }
        const oi = objAt(e.clientX, e.clientY);
        if (oi >= 0) { hit(oi); drag.last = oi; drag.lastT = performance.now(); }
      }
    });
    p.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 10) {
        drag.moved = true;
        drag.ghost = document.createElement('div');
        drag.ghost.className = 'tool-ghost';
        drag.ghost.innerHTML = svg('0 0 100 100', TOOL_ART[drag.k][1]);
        document.body.appendChild(drag.ghost);
      }
      if (drag.ghost) { drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px'; }
      // むしばきんは はブラシが ちかづくと たまに にげる
      if (lit && phase() === 'germ') {
        for (const ob of objs) {
          if (ob.kind !== 'germ' || ob.done || ob.boss || (ob.dodge || 0) >= 1) continue;
          const el = mouth.querySelector(`[data-o="${ob.id}"]`);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY) < r.width * 1.2 && Math.random() < 0.08) {
            ob.dodge = (ob.dodge || 0) + 1;
            const used = objs.map((o) => o.ti);
            const free = KP.TEETH.map((_, i) => i).filter((i) => !used.includes(i));
            if (free.length) { ob.ti = rand(free); ob.foam = 0; bubble(r.left + r.width / 2, r.top, 'べーっ！', 900); mouth.innerHTML = draw(); }
          }
        }
      }
      if (drag.moved && lit) {
        const oi = objAt(e.clientX, e.clientY);
        const now = performance.now();
        if (oi >= 0) {
          const ob = objs[oi];
          if (ob && PHASE_TOOL[ob.kind] === (drag.rub ? PHASE_TOOL[ob.kind] : drag.k) && (oi !== drag.last || now - drag.lastT > (RUB[ob.kind] || 250))) { hit(oi); drag.last = oi; drag.lastT = now; }
        }
      }
    });
    const endDrag = (e) => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      const d = drag;
      drag = null;
      if (d.ghost) d.ghost.remove();
      if (d.rub) return;
      if (!d.moved) { S.tap(); action(d.k, d.el); if (['brush', 'pinset', 'fill'].includes(d.k)) { tool = d.k; drawTools(); } return; }
      if (['light', 'water'].includes(d.k) && e && overMouth(e.clientX, e.clientY)) { S.tap(); action(d.k, d.el); }
    };
    p.addEventListener('pointerup', endDrag);
    p.addEventListener('pointercancel', endDrag);
    A.onCleanup(() => document.querySelectorAll('.tool-ghost').forEach((g) => g.remove()));
    await finished;
    clearInterval(hop);
    c.hidePanel();
    return c.guard(Promise.resolve());
  }


  // ================= ④ かきかた きょうしつ =================
  const WORDS = [
    { w: 'いちご', pic: () => svg('0 0 100 100', KP.FOOD.strawberry.d) },
    { w: 'りんご', pic: () => svg('0 0 100 100', KP.FOOD.apple.d) },
    { w: 'たまご', pic: () => svg('0 0 100 100', KP.FOOD.egg.d) },
    { w: 'うさぎ', pic: () => svg('0 -30 200 250', KP.drawBunny('happy')) },
    { w: 'ねこ', pic: () => aniFace('cat', 'happy') },
    { w: 'いぬ', pic: () => aniFace('dog', 'happy') },
    { w: 'くま', pic: () => aniFace('bear', 'happy') },
    { w: 'ぶた', pic: () => aniFace('pig', 'happy') },
    { w: 'ほし', pic: () => svg('0 0 100 100', KP.ICONS.star()) },
    { w: 'はな', pic: () => svg('0 0 100 100', KP.ICONS.flower()) },
    { w: 'あめ', pic: () => svg('0 0 100 100', `<path d="M14,50 L30,36 L30,64Z M86,50 L70,36 L70,64Z" fill="#F8BCD6" stroke="#E07AA8" stroke-width="3"/><circle cx="50" cy="50" r="22" fill="#F29CC2" stroke="#E07AA8" stroke-width="3"/><path d="M36,40 Q50,60 64,40" stroke="#fff" stroke-width="5" fill="none"/>`) },
    { w: 'かさ', pic: () => svg('-80 -170 160 200', PARTS_PARASOL()) },
  ];
  const PARTS_PARASOL = () => { const r = KP.PARTS.parasol(KP.PAL.pink, KP.uid('ps')); return `<defs>${r.defs}</defs>${r.magic}`; };
  const FONT = "600 1px 'Klee One', 'M PLUS Rounded 1c', sans-serif";
  RUN.writing = async function (c) {
    try { await document.fonts.load("600 200px 'Klee One'", 'あいうえおかきくけこ'); } catch (e) { /* なし */ }
    const two = shuffle(WORDS.filter((x) => x.w.length === 2))[0], three = shuffle(WORDS.filter((x) => x.w.length === 3))[0];
    const words = [two, three];
    c.bg(KP.BG.classroom());
    c.actor('teacher', { html: aniSVG('rabbit', 'happy', { kind: 'teacher' }), x: 22, y: 86, h: 30 });
    c.actor('fuutan', { html: fuuHTML({}), x: 72, y: 96, h: 50 });
    c.actor('pyonta', { html: bunHTML('normal'), x: 92, y: 98, h: 14 });
    await c.say('teacher', 'かきかた きょうしつへ ようこそ！ わたしは うさぎ せんせい です');
    c.actor('fuutan', { html: fuuHTML({ pose: 'wave', expr: 'joy' }) });
    await c.say('fuutan', 'よろしく おねがいします！', { expr: 'joy' });
    await c.say('teacher', 'きょうは ひらがなを なぞって かく れんしゅうを しようね。');
    await c.say('teacher', 'まずは おてほんで かきじゅんを みてね。きいろい まるから、ばんごうの じゅんばんに なぞるんだよ');
    const written = [];
    for (const W of words) {
      await c.card(`<div class="w-pic">${W.pic()}</div><div class="w-word">${W.w}</div>`, `これは なにかな？ 「${W.w}」だね！`);
      const imgs = [];
      for (let i = 0; i < W.w.length; i++) {
        const ch = W.w[i];
        await c.say('teacher', `「${ch}」は ${W.w}の「${ch}」だよ。いっしょに かいてみよう！`);
        imgs.push(await traceGame(c, ch, W, i));
      }
      const img = await joinInk(imgs, W.w);
      written.push({ w: W.w, img });
      await c.card(`<div class="w-pic">${W.pic()}</div><img class="w-ink" src="${img}" alt="">`, `${W.w.split('').join('、')}…… 「${W.w}」！ じょうずに かけたね！`);
      c.actor('fuutan', { html: fuuHTML({ pose: 'joy', expr: 'joy' }) });
      c.sparkleAt('fuutan', ['star', 'heart', 'sparkle'], 12);
      S.done();
    }
    c.actor('teacher', { html: aniSVG('rabbit', 'happy', { kind: 'teacher' }) });
    await c.say('teacher', 'ぜんぶ はなまる！ ふーたん、とっても じょうずに かけました！', { expr: 'joy' });
    c.actor('pyonta', { html: bunHTML('happy') });
    await c.say('fuutan', 'やったあ！ もっと ひらがな かけるように なりたいな！', { expr: 'joy' });
    album('writing', { words: written });
    storyClear(c, 'writing');
  };
  // ゆびで なぞる：かきじゅん（KanjiVG）どおりに 1かくずつ。はみだしても OK
  const NUMS = ['いち', 'に', 'さん', 'よん', 'ご', 'ろく'];
  let measureSvg = null;
  function strokeInfo(d) {
    if (!measureSvg) {
      measureSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      measureSvg.setAttribute('style', 'position:absolute;width:0;height:0;visibility:hidden');
      document.body.appendChild(measureSvg);
    }
    const pth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pth.setAttribute('d', d);
    measureSvg.appendChild(pth);
    const len = pth.getTotalLength();
    const pts = [];
    for (let l = 0; l <= len; l += 2) { const q = pth.getPointAtLength(l); pts.push([q.x, q.y]); }
    const q1 = pth.getPointAtLength(Math.min(len, 6));
    pth.remove();
    return { d, len, pts, start: pts[0], dir: [q1.x - pts[0][0], q1.y - pts[0][1]] };
  }
  async function traceGame(c, ch, W, idx) {
    const strokes = (KP.STROKES[ch] || []).map(strokeInfo);
    const p = c.panel(`<div class="tr-head"><div class="tr-pic">${W.pic()}</div><div class="tr-word">${W.w.split('').map((x, i) => `<span class="${i === idx ? 'cur' : i < idx ? 'done' : ''}">${x}</span>`).join('')}</div></div>` +
      `<div class="st-prompt" id="trPrompt">「${ch}」の かきじゅんを みてね</div>` +
      `<div class="tr-box" id="trBox"><canvas id="trBg"></canvas><div class="tr-guide" id="trGuide"></div><canvas id="trInk"></canvas><canvas id="trCur"></canvas><div class="tr-anim" id="trAnim"></div><div class="tr-maru" id="trMaru"></div></div>` +
      `<div class="tr-strokes" id="trSteps"></div>` +
      `<div class="tr-acts"><button class="pill" data-a="clear">${icon('reset')}けす</button><button class="pill" data-a="demo">${icon('magic')}おてほん</button><button class="pill" data-a="hear">${icon('sound')}きく</button></div>`, 'full trace');
    const box = p.querySelector('#trBox'), bg = p.querySelector('#trBg'), ink = p.querySelector('#trInk'), cur = p.querySelector('#trCur');
    const guideEl = p.querySelector('#trGuide'), animEl = p.querySelector('#trAnim'), stepsEl = p.querySelector('#trSteps'), prompt = p.querySelector('#trPrompt');
    const size = Math.round(box.getBoundingClientRect().width) || 300;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const K = size / 109;
    for (const cv of [bg, ink, cur]) { cv.width = size * dpr; cv.height = size * dpr; cv.style.width = cv.style.height = size + 'px'; cv.getContext('2d').scale(dpr, dpr); }
    const gb = bg.getContext('2d'), gi = ink.getContext('2d'), gc = cur.getContext('2d');
    gb.fillStyle = '#FFFDF8'; gb.fillRect(0, 0, size, size);
    gb.strokeStyle = '#F2C6D8'; gb.lineWidth = 2; gb.setLineDash([8, 8]);
    gb.beginPath(); gb.moveTo(size / 2, 0); gb.lineTo(size / 2, size); gb.moveTo(0, size / 2); gb.lineTo(size, size / 2); gb.stroke();
    for (const g of [gi, gc]) { g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#E0559A'; g.lineWidth = size * 0.12; }
    let step = 0, done = false, fails = 0;
    const numPos = (st, i) => {
      const L = Math.hypot(...st.dir) || 1;
      return [st.start[0] - (st.dir[0] / L) * 7 - (st.dir[1] / L) * 6, st.start[1] - (st.dir[1] / L) * 7 + (st.dir[0] / L) * 6];
    };
    // おてほんの せん（しずかな ガイド）
    const drawGuide = () => {
      let o = '';
      strokes.forEach((st, i) => {
        const col = i < step ? 'transparent' : i === step ? '#FFB8D6' : '#F3DCE6';
        o += `<path d="${st.d}" fill="none" stroke="${col}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      });
      strokes.forEach((st, i) => {
        if (i < step) return;
        const [x, y] = numPos(st, i);
        o += `<circle cx="${x}" cy="${y}" r="5" fill="${i === step ? '#FFD772' : '#fff'}" stroke="${i === step ? '#E9B44C' : '#E8B4C8'}" stroke-width="1"/><text x="${x}" y="${y + 2.4}" text-anchor="middle" font-size="7" font-weight="800" fill="${i === step ? '#8A5A10' : '#C98FA8'}" font-family="'M PLUS Rounded 1c',sans-serif">${i + 1}</text>`;
      });
      guideEl.innerHTML = svg('0 0 109 109', o);
      // いま かく せん：むきを しめす ながれと スタートの まる
      if (step < strokes.length && !done) {
        const st = strokes[step];
        animEl.innerHTML = svg('0 0 109 109', `<path class="flow" d="${st.d}" fill="none" stroke="#E0559A" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="3 7"/>` +
          `<circle class="startdot" cx="${st.start[0]}" cy="${st.start[1]}" r="4.2" fill="#FFE28A" stroke="#E9B44C" stroke-width="1"/>`);
      } else animEl.innerHTML = '';
      stepsEl.innerHTML = strokes.map((_, i) => `<span class="${i < step ? 'ok' : i === step ? 'now' : ''}">${i + 1}</span>`).join('');
    };
    // おてほんの アニメ（1かくずつ のびる）
    let demoing = false;
    const demo = async (only) => {
      demoing = true;
      const list = only != null ? [only] : strokes.map((_, i) => i);
      for (const i of list) {
        if (!c.alive.v) return;
        const st = strokes[i];
        animEl.innerHTML = svg('0 0 109 109', `<path d="${st.d}" fill="none" stroke="#E0559A" stroke-width="8.5" stroke-linecap="round" style="stroke-dasharray:${st.len};stroke-dashoffset:${st.len};animation:drawStroke .8s ease-in-out forwards"/>` +
          strokes.slice(0, i).map((s2) => `<path d="${s2.d}" fill="none" stroke="#F29CC2" stroke-width="8.5" stroke-linecap="round" opacity="${only != null ? 0 : 0.7}"/>`).join(''));
        S.speak(NUMS[i] || String(i + 1), 1.3);
        S.tap();
        await sleep(1000);
      }
      demoing = false;
      drawGuide();
    };
    drawGuide();
    animEl.innerHTML = '';
    S.speak(`${ch}。${W.w}の ${ch}。かきじゅんを みてね`, 1.3);
    await sleep(1400);
    await demo();
    if (!c.alive.v) return c.guard(Promise.resolve());
    prompt.textContent = `${strokes.length > 1 ? '1ばんから じゅんばんに ' : ''}なぞって かこう`;
    S.speak(prompt.textContent, 1.3);
    // かく
    let drawing = null;
    const pos = (e) => { const r = cur.getBoundingClientRect(); return [(e.clientX - r.left) * (size / r.width), (e.clientY - r.top) * (size / r.height)]; };
    cur.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (done || demoing) return;
      try { cur.setPointerCapture(e.pointerId); } catch (er) { /* なし */ }
      drawing = pos(e);
      gc.beginPath(); gc.moveTo(...drawing); gc.lineTo(drawing[0] + 0.1, drawing[1]); gc.stroke();
    });
    cur.addEventListener('pointermove', (e) => { if (!drawing) return; const q = pos(e); gc.beginPath(); gc.moveTo(...drawing); gc.lineTo(...q); gc.stroke(); drawing = q; });
    const coverage = (st) => {
      const d = gc.getImageData(0, 0, size * dpr, size * dpr).data;
      let hit = 0;
      // すこし ずれても OK（まわりも しらべる）
      const W2 = size * dpr, rr = size * 0.06 * dpr;
      const offs = [[0, 0], [rr, 0], [-rr, 0], [0, rr], [0, -rr], [rr * 0.7, rr * 0.7], [-rr * 0.7, -rr * 0.7], [rr * 0.7, -rr * 0.7], [-rr * 0.7, rr * 0.7]];
      for (const [x, y] of st.pts) {
        const px = x * K * dpr, py = y * K * dpr;
        if (offs.some(([ox, oy]) => { const qx = Math.round(px + ox), qy = Math.round(py + oy); return qx >= 0 && qy >= 0 && qx < W2 && qy < W2 && d[(qy * W2 + qx) * 4 + 3] > 40; })) hit++;
      }
      return hit / st.pts.length;
    };
    let resolve;
    const finished = new Promise((r) => (resolve = r));
    const commit = (auto) => {
      if (auto) {
        // せんせいと いっしょに かく
        const st = strokes[step];
        gc.save(); gc.scale(K, K); gc.lineWidth = size * 0.12 / K; gc.stroke(new Path2D(st.d)); gc.restore();
      }
      gi.drawImage(cur, 0, 0, size, size);
      gc.clearRect(0, 0, size, size);
      const st = strokes[step];
      const r = box.getBoundingClientRect();
      burst(r.left + (st.pts[st.pts.length - 1][0] * r.width) / 109, r.top + (st.pts[st.pts.length - 1][1] * r.height) / 109, ['star', 'sparkle'], 6, 50);
      S.pick();
      step++;
      fails = 0;
      if (step >= strokes.length) { success(); return; }
      S.speak(NUMS[step] || String(step + 1), 1.3);
      drawGuide();
    };
    const success = async () => {
      if (done) return;
      done = true;
      drawGuide();
      p.querySelector('#trMaru').innerHTML = svg('0 0 200 200', KP.drawHanamaru());
      p.querySelector('#trMaru').classList.add('show');
      const r = box.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, ['star', 'heart', 'sparkle'], 16, 160);
      S.done();
      S.speak(rand(['はなまる！ じょうず！', 'すごい！ かきじゅんも ばっちり！', 'きれいに かけたね！']), 1.3);
      await sleep(1700);
      resolve(ink.toDataURL('image/png'));
    };
    const up = () => {
      if (!drawing) return;
      drawing = null;
      const st = strokes[step];
      const cv = coverage(st);
      if (cv >= 0.45) { commit(false); return; }
      // ほかの せんを かいちゃった ときは やさしく おしえる
      const wrong = cv < 0.12;
      if (wrong) {
        fails++;
        c.oops();
        gc.clearRect(0, 0, size, size);
        if (fails >= 2) {
          const rr = box.getBoundingClientRect();
          bubble(rr.left + rr.width / 2, rr.top + 30, 'いっしょに かこうね', 1500);
          S.speak('いっしょに かこうね', 1.2);
          demo(step).then(() => c.alive.v && !done && commit(true));
          return;
        }
        const rr = box.getBoundingClientRect();
        bubble(rr.left + rr.width / 2, rr.top + 30, `${step + 1}ばんは きいろい まるから だよ`, 1600);
        S.speak(`${NUMS[step] || step + 1}ばんは きいろい まるから だよ`, 1.2);
        demo(step);
      }
    };
    cur.addEventListener('pointerup', up);
    cur.addEventListener('pointercancel', up);
    p.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]');
      if (!b || done || demoing) return;
      S.tap();
      if (b.dataset.a === 'clear') { gc.clearRect(0, 0, size, size); }
      if (b.dataset.a === 'hear') S.speak(`${ch}。${W.w}の ${ch}`, 1.3);
      if (b.dataset.a === 'demo') { gc.clearRect(0, 0, size, size); demo(); }
    });
    const img = await finished;
    c.hidePanel();
    return c.guard(Promise.resolve({ ch, img }));
  }
  function joinInk(imgs, word) {
    const n = imgs.length, H = 140;
    const cv = document.createElement('canvas'); cv.width = H * n; cv.height = H;
    const g = cv.getContext('2d');
    g.fillStyle = '#FFFDF8'; g.fillRect(0, 0, cv.width, H);
    imgs.forEach((im, i) => {
      g.strokeStyle = '#F2C6D8'; g.lineWidth = 2; g.strokeRect(i * H + 4, 4, H - 8, H - 8);
      g.font = FONT.replace('1px', Math.round(H * 0.8) + 'px'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#F6E3EC'; g.fillText(word[i], i * H + H / 2, H * 0.53);
    });
    return new Promise((res) => {
      let left = n;
      imgs.forEach((im, i) => { const m = new Image(); m.onload = () => { g.drawImage(m, i * H, 0, H, H); if (--left === 0) res(cv.toDataURL('image/png')); }; m.src = im.img; });
    });
  }

  // ================= ⑤ おえかき きょうしつ（ぬりえ） =================
  const PICTURES = [
    { name: 'ぴょんた', vb: '0 -30 200 250', art: () => KP.drawBunny('happy') },
    { name: 'おしろ', vb: '-10 -10 180 220', art: () => KP.FURN.castle.draw(KP.PAL.lav, KP.uid('pc')) },
    { name: 'ユニコーン', vb: '0 -10 230 230', art: () => KP.FURN.unicorn.draw(KP.PAL.pink, KP.uid('pc')) },
    { name: 'ケーキ', vb: '70 100 460 350', art: () => A.drawCake({ shape: 'tier', cream: 'pink', tops: [{ t: 'strawberry', x: 270, y: 190 }, { t: 'strawberry', x: 330, y: 194 }, { t: 'candle', x: 300, y: 186 }, { t: 'heart', x: 220, y: 300 }, { t: 'star', x: 380, y: 300 }] }) },
    { name: 'くまさん', vb: '0 -10 240 310', art: () => KP.drawAnimal('bear', 'happy') },
    { name: 'ねこちゃん', vb: '0 -10 240 310', art: () => KP.drawAnimal('cat', 'happy', { kind: 'apron', color: 'pink' }) },
    { name: 'ドレス', vb: '70 262 260 260', art: () => { const r = KP.PARTS.princess(KP.PAL.pink, KP.uid('pc')); return `<defs>${r.defs}</defs>${r.dress}${r.sleeves}`; } },
    { name: 'ハートの ベッド', vb: '-10 -10 320 280', art: () => KP.FURN.bed.draw(KP.PAL.pink, KP.uid('pc')) },
    { name: 'おはなの かびん', vb: '0 0 110 175', art: () => KP.FURN.flowervase.draw(KP.PAL.pink, KP.uid('pc')) },
    { name: 'ドールハウス', vb: '0 0 200 235', art: () => KP.FURN.dollhouse.draw(KP.PAL.mint, KP.uid('pc')) },
    { name: 'ふーたん', vb: '40 20 320 620', art: () => KP.drawChar(A.fuutanOpt({ pose: 'cheer', expr: 'joy', noShadow: true })) },
    { name: 'パンダさん', vb: '0 -10 240 310', art: () => KP.drawAnimal('panda', 'happy') },
  ];
  const PALETTE = ['#FF8FB8', '#F0506E', '#FF9A4A', '#FFE07A', '#9EDC9A', '#6FC3A8', '#9DCDF4', '#6F98E2', '#C9B5F5', '#8C6FD6', '#D9AE8C', '#8A5A3A', '#FFFFFF', '#4A4A5E', 'kira', 'rainbow', 'dots'];
  // いつもの え から いろを ぬいて ぬりえに する
  function toColoring(pic) {
    const id = KP.uid('nr');
    const tmp = document.createElement('div');
    tmp.innerHTML = svg(pic.vb, pic.art());
    const sv = tmp.firstElementChild;
    sv.querySelectorAll('defs').forEach((d) => d.remove());
    const regions = [];
    sv.querySelectorAll('path,rect,circle,ellipse,polygon').forEach((el) => {
      const f = (el.getAttribute('fill') || '').trim();
      const st = el.getAttribute('stroke');
      if (f === 'none' || f === 'transparent') { el.setAttribute('pointer-events', 'none'); if (st) el.setAttribute('stroke', '#5A4A6E'); return; }
      const op = parseFloat(el.getAttribute('opacity') || '1');
      const white = /^#?f{3}(f{3})?$/i.test(f) || f === 'white';
      if ((!st && (white || op < 0.6)) || op < 0.3) { el.remove(); return; }
      el.dataset.orig = f.startsWith('url') ? '#F8BCD6' : f;
      el.setAttribute('fill', '#FFFFFF');
      el.removeAttribute('opacity');
      el.setAttribute('stroke', '#5A4A6E');
      if (!el.getAttribute('stroke-width')) el.setAttribute('stroke-width', '1.6');
      el.setAttribute('class', 'region');
      el.dataset.r = regions.length;
      regions.push(el);
    });
    sv.querySelectorAll('text').forEach((t) => t.remove());
    // とくべつな いろ（キラキラ・にじ・みずたま）は もじれつで くみこんで よみなおす（Safari でも はんえい される ように）
    const DEFS = `<defs>${KP.lg(id + 'k', [[0, '#FFF6CF'], [0.5, '#FFD772'], [1, '#F2B94A']], 0, 0, 1, 1)}${KP.lg(id + 'r', [[0, '#FF8FB8'], [0.25, '#FFE07A'], [0.5, '#9EDC9A'], [0.75, '#9DCDF4'], [1, '#C9B5F5']], 0, 0, 1, 0)}<pattern id="${id}d" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#FFD3E6"/><circle cx="7" cy="7" r="3.4" fill="#fff"/></pattern></defs>`;
    const html = sv.outerHTML.replace(/^(<svg[^>]*>)/, `$1${DEFS}`);
    tmp.innerHTML = html;
    const sv2 = tmp.firstElementChild;
    const regions2 = [...sv2.querySelectorAll('.region')].sort((x, y) => x.dataset.r - y.dataset.r);
    return { sv: sv2, regions: regions2, id };
  }
  const paintFill = (id, col) => (col === 'kira' ? `url(#${id}k)` : col === 'rainbow' ? `url(#${id}r)` : col === 'dots' ? `url(#${id}d)` : col);
  const swatch = (col) => col === 'kira' ? `<span class="sw kira">${svg('0 0 100 100', KP.star(50, 52, 34, '#FFE07A', '#E9B44C', 4) + KP.sparkle(76, 22, 12, '#fff'))}</span>`
    : col === 'rainbow' ? `<span class="sw rainbow"></span>` : col === 'dots' ? `<span class="sw dots"></span>` : `<span class="sw" style="background:${col}"></span>`;

  RUN.paint = async function (c) {
    const g = G();
    c.bg(KP.BG.atelier());
    c.actor('artist', { html: aniSVG('cat', 'happy', { kind: 'artist' }), x: 22, y: 96, h: 32 });
    c.actor('fuutan', { html: fuuHTML({}), x: 70, y: 97, h: 52 });
    c.actor('pyonta', { html: bunHTML('normal'), x: 90, y: 98, h: 14 });
    await c.say('artist', 'おえかき きょうしつへ ようこそ！ わたしは ねこの えのぐせんせい です');
    await c.say('artist', 'きょうは ぬりえを しよう。すきな いろで ぬって いいんだよ。おなじ いろじゃ なくても だいじょうぶ！');
    c.actor('fuutan', { html: fuuHTML({ pose: 'joy', expr: 'joy' }) });
    await c.say('fuutan', 'わあい！ どれに しようかな〜', { expr: 'joy' });
    const works = [];
    for (let round = 0; round < 2; round++) {
      const opts = shuffle(PICTURES).slice(0, 3);
      const pic = await c.choose(opts.map((pc) => ({ label: pc.name, value: pc, icon: (() => { const t = toColoring(pc); return t.sv.outerHTML; })() })), 'どの えを ぬる？');
      const res = await paintGame(c, pic);
      works.push(res);
      album('paint', { svg: res.svg, name: pic.name });
      c.actor('artist', { html: aniSVG('cat', 'happy', { kind: 'artist' }) });
      await c.card(`<div class="paint-frame">${res.svg}</div>`, `「${pic.name}」の できあがり！ ${rand(['すてきな いろだね！', 'とっても はなやか！', 'ふーたんらしい いろだね！'])}`);
      const fr = Object.keys(D.FRIENDS).filter((f) => g.collection.unlockedCharacterIds.includes(f));
      if (fr.length) {
        const f = rand(fr);
        c.actor('friend', { html: charHTML(A.friendOpt(f, { pose: 'wave', expr: 'joy' })), x: 46, y: 92, h: 36 });
        await c.say(f, rand(['わあ、その いろ かわいい！', 'わたしも ぬりえ したく なっちゃった！', 'キラキラで すてき！']), { expr: 'joy', actor: 'friend' });
        c.actor('friend', null);
      }
      if (round === 0) {
        const more = await c.choose([{ label: 'もう 1まい ぬる！', value: 1, main: true, icon: svg('0 0 100 100', KP.ICONS.palette()) }, { label: 'おしまい', value: 0, icon: svg('0 0 100 100', KP.ICONS.check()) }], 'もう 1まい ぬる？');
        if (!more) break;
      }
    }
    await c.say('artist', 'ふーたんの え、てんらんかいに かざろうね！', { expr: 'joy' });
    await c.card(`<div class="paint-gallery">${works.map((w) => `<div class="paint-frame small">${w.svg}</div>`).join('')}</div>`, 'てんらんかい だよ！ みんな みにきてくれたよ');
    c.actor('fuutan', { html: fuuHTML({ pose: 'cheer', expr: 'joy' }) });
    c.sparkleAt('fuutan', ['heart', 'star', 'sparkle'], 16);
    await c.say('fuutan', 'えへへ、たのしかった！ また ぬりたいな！', { expr: 'joy' });
    storyClear(c, 'paint', (c.paintRatio || 0) >= 0.8 ? 3 : (c.paintRatio || 0) >= 0.5 ? 2 : 1);
  };
  async function paintGame(c, pic) {
    const { sv, regions, id } = toColoring(pic);
    let col = rand(['#FF8FB8', '#9DCDF4', '#FFE07A', '#C9B5F5']);
    const undo = [];
    const p = c.panel(`<div class="st-prompt">いろを えらんで、ぬりたい ところを タッチ！</div>` +
      `<div class="paint-wrap"><div class="paint-area" id="pArea"></div><div class="paint-sample" id="pSample" hidden></div></div>` +
      `<div class="palette2" id="pPal"></div>` +
      `<div class="tr-acts"><button class="pill" data-a="undo">${icon('reset')}もどす</button><button class="pill" data-a="sample">${icon('search')}おてほん</button><button class="pill main" data-a="ok">${icon('check', '#fff')}できた！</button></div>`, 'full paintp');
    S.speak('いろを えらんで、ぬりたい ところを タッチ！', 1.4);
    const area = p.querySelector('#pArea'), pal = p.querySelector('#pPal'), sample = p.querySelector('#pSample');
    area.appendChild(sv);
    const drawPal = () => (pal.innerHTML = PALETTE.map((cc) => `<button class="pcol${cc === col ? ' sel' : ''}" data-c="${cc}">${swatch(cc)}</button>`).join(''));
    drawPal();
    // おてほん（もとの いろ）
    // おてほんは べつの え（おなじ id を つくらない）
    const sm = sv.cloneNode(true);
    sm.querySelectorAll('defs').forEach((d) => d.remove());
    sm.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    sm.querySelectorAll('.region').forEach((el) => { el.setAttribute('fill', el.dataset.orig); el.removeAttribute('class'); });
    sample.appendChild(sm);
    let finish;
    const finished = new Promise((r) => (finish = r));
    const paintAt = (el, x, y) => {
      const f = paintFill(id, col);
      if (el.getAttribute('fill') === f) return;
      undo.push([el, el.getAttribute('fill')]);
      el.setAttribute('fill', f);
      el.classList.remove('pop2'); void el.getBBox(); el.classList.add('pop2');
      S.pop();
      burst(x, y, col === 'kira' ? ['star', 'sparkle'] : ['sparkle'], col === 'kira' ? 7 : 3, 40);
    };
    sv.addEventListener('click', (e) => {
      const el = e.target.closest('.region');
      if (el) paintAt(el, e.clientX, e.clientY);
    });
    p.addEventListener('click', (e) => {
      const cb = e.target.closest('[data-c]');
      if (cb) { col = cb.dataset.c; S.tap(); drawPal(); return; }
      const b = e.target.closest('[data-a]');
      if (!b) return;
      S.tap();
      if (b.dataset.a === 'undo') { const u = undo.pop(); if (u) u[0].setAttribute('fill', u[1]); }
      if (b.dataset.a === 'sample') sample.hidden = !sample.hidden;
      if (b.dataset.a === 'ok') {
        const n = regions.filter((el) => el.getAttribute('fill') !== '#FFFFFF').length;
        if (n < Math.min(5, Math.ceil(regions.length * 0.3))) {
          const r = area.getBoundingClientRect();
          bubble(r.left + r.width / 2, r.top + 30, 'もうすこし ぬってみよう', 1400);
          S.speak('もうすこし ぬってみよう', 1.3);
          return;
        }
        S.done();
        const r = area.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, ['star', 'heart', 'sparkle'], 18, 160);
        c.paintRatio = Math.max(c.paintRatio || 0, n / regions.length);
        finish();
      }
    });
    await finished;
    sv.querySelectorAll('.region').forEach((el) => el.classList.remove('pop2'));
    const out = sv.outerHTML;
    c.hidePanel();
    return c.guard(Promise.resolve({ svg: out }));
  }
  // ================= アルバムの え =================
  A.snapExtra = function (a) {
    const s = a.snapshot;
    if (a.type === 'show') {
      const o = KP.BG.runway() + `<g transform="translate(155 300) scale(1.1)">${KP.drawChar({ hairStyle: s._hs || 'long', hairColor: s._hc || 'pink', eyeColor: A.EYE_FOR[s._hc || 'pink'], outfit: toDraw(s), makeup: s._mk || {}, pose: s._pose || 'cheer', expr: 'joy' })}</g>` + `<g transform="translate(560 40) scale(.8)">${KP.drawTrophy()}</g>`;
      return svg('60 120 630 790', o).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
    }
    if (a.type === 'dish') {
      const dish = s.dish === 'bday' ? `<g transform="translate(0 -60) scale(.5)">${A.drawCake({ shape: 'tier', cream: 'pink', tops: [{ t: 'candle', x: 280, y: 190 }, { t: 'strawberry', x: 320, y: 196 }, { t: 'heart', x: 300, y: 300 }] })}</g>` : s.dish === 'bento' ? KP.DISH.bento : KP.DISH[s.dish] || '';
      const o = KP.BG.kitchen() + `<g transform="translate(40 380) scale(.9)">${KP.drawChar(mamaOpt({ pose: 'joy', expr: 'joy' }))}</g><g transform="translate(380 420) scale(.8)">${KP.drawChar(A.fuutanOpt({ pose: 'joy', expr: 'joy' }))}</g><g transform="translate(225 720) scale(1)">${dish}</g>`;
      return svg('0 300 750 700', o).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
    }
    if (a.type === 'paint') {
      return `<div class="paint-album">${s.svg || ''}</div>`;
    }
    if (a.type === 'writing') {
      const ws = s.words || [];
      let o = KP.BG.classroom() + `<g transform="translate(20 560) scale(1.1)">${KP.drawAnimal('rabbit', 'happy', { kind: 'teacher' })}</g>`;
      ws.forEach((w, i) => { const wd = 160 * w.w.length; o += `<image href="${w.img}" x="${375 - wd / 2 * 0.9}" y="${470 + i * 160}" width="${wd * 0.9}" height="${144}"/>`; });
      return svg('0 100 750 900', o).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
    }
    if (a.type === 'clinic') {
      let o = KP.BG.clinic() + `<g transform="translate(20 560) scale(1.2)">${KP.drawAnimal('bear', 'happy', { kind: 'coat' })}</g>`;
      o += `<g transform="translate(300 360) scale(.85)">${KP.drawChar({ ...A.hairOpt(s.hs, s.hc), outfit: toDraw(NURSE), pose: 'cheer', expr: 'joy' })}</g>`;
      (s.pats || []).forEach((k, i) => (o += `<g transform="translate(${180 + i * 300} 760) scale(.8)">${KP.drawAnimal(k, 'happy', { kind: 'bib' })}</g>`));
      return svg('0 300 750 700', o).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
    }
    return null;
  };
})();
