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
    A.onCleanup(() => { alive.v = false; S.hush(); });
    const never = new Promise(() => {});
    const guard = async (p) => { const r = await p; return alive.v ? r : never; };
    const $ = (s) => el.querySelector(s);
    let actors = {};
    const c = {
      el, alive,
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
      async say(who, text, opt = {}) {
        const C = typeof who === 'string' ? (CAST[who] || friendCast(who)) : who;
        const dlg = $('#stDlg');
        dlg.hidden = false;
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
      hideDialog() { $('#stDlg').hidden = true; },
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
  };
  const UNLOCK_FRIEND = { fashion: 'mizuki', shop: 'lemon' };
  function storyClear(c, sid, again) {
    const g = G();
    g.stories = g.stories || {};
    g.stories[sid] = (g.stories[sid] || 0) + 1;
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
    m.innerHTML = `<div class="card"><h2>おはなし クリア！</h2>` +
      `<div class="big stampbig"><div class="rays"></div>${svg('0 0 200 160', KP.drawTrophy())}</div>` +
      `<div class="nm">スタンプ ${g.stamps}こめ！</div>` +
      (reward ? `<div class="prize"><div class="ptitle">${icon('star')}${reward.kind === 'friend' ? 'あたらしい なかま！' : 'ごほうび！'}</div><div class="pimg">${rHTML(reward)}</div><div class="pname">${esc(A.findName(reward))}</div></div>` : '') +
      (prize ? `<div class="prize"><div class="ptitle">${icon('star')}スタンプの プレゼント！</div><div class="pimg">${A.findSVG(prize)}</div><div class="pname">${esc(A.findName(prize))}</div></div>` : '') +
      `<div class="acts"><button class="pill main" data-a="again">${icon('reset', '#fff')}もういちど</button><button class="pill" data-a="list">${icon('book')}ほかの おはなし</button></div>` +
      `<div class="pyon-mini">${A.bunnySVG('happy')}</div></div>`;
    document.body.appendChild(m);
    const r = m.querySelector('.big').getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, ['star', 'heart', 'sparkle'], 18, 170);
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
    { id: 'writing', name: 'かきかた きょうしつ', sub: 'ひらがなを なぞって かこう', cls: 's4', art: () => KP.drawAnimal('rabbit', 'happy', { kind: 'teacher' }), vb: '0 -70 240 360' },
  ];
  SCREENS.stories = function (el) {
    const g = G();
    el.innerHTML = A.topbar('おはなしを えらぼう') +
      `<div class="story-list">${STORIES.map((s) => {
        const n = (g.stories && g.stories[s.id]) || 0;
        return `<button class="story-card ${s.cls}" data-s="${s.id}"><span class="sc-art">${svg(s.vb, s.art())}</span><span class="sc-txt"><b>${s.name}</b><small>${s.sub}</small><span class="sc-medal">${n ? `${icon('star')}×${n}` : 'はじめて！'}</span></span></button>`;
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
    storyClear(c, 'fashion');
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
    const NOTES = 16;
    const p = c.panel(`<div class="rw-hits" id="rwHits"></div><div class="rw-lane" id="rwLane"><div class="rw-target"></div></div><button class="rw-tap" id="rwTap">${icon('heart', '#fff')}タッチ！</button><div class="rw-msg" id="rwMsg"></div>`, 'runway');
    const lane = p.querySelector('#rwLane'), msg = p.querySelector('#rwMsg'), hitsEl = p.querySelector('#rwHits');
    // あるく ふーたん
    c.actor('fuutan', { html: fuuHTML({ expr: 'smile' }, look), x: 50, y: 40, h: 20, anim: 'walk' });
    S.hush();
    const clk = S.restartBgm('play');
    const spb = clk ? clk.spb : 60 / 132;
    const now = () => (clk ? S.now() : performance.now() / 1000);
    const base = clk ? clk.t0 : now() + 0.2;
    const notes = Array.from({ length: NOTES }, (_, i) => ({ t: base + spb * 4 + i * spb * 2, el: null, done: false }));
    const TRAVEL = spb * 4;
    let hits = 0, combo = 0;
    const show = (t, cls) => { msg.textContent = t; msg.className = 'rw-msg show ' + cls; clearTimeout(show.t); show.t = setTimeout(() => (msg.className = 'rw-msg'), 500); };
    const drawHits = () => (hitsEl.innerHTML = Array.from({ length: NOTES }, (_, i) => `<i class="${i < hits ? 'on' : ''}"></i>`).join(''));
    drawHits();
    const tap = (e) => {
      e.preventDefault();
      const t = now();
      let best = null, bd = 9;
      for (const n of notes) { if (n.done) continue; const d = Math.abs(n.t - t); if (d < bd) { bd = d; best = n; } }
      const rr = lane.getBoundingClientRect();
      if (best && bd < 0.24) {
        best.done = true;
        hits++; combo++;
        if (best.el) { best.el.classList.add('hit'); }
        show(bd < 0.1 ? 'ぴったり！' : 'いいね！', bd < 0.1 ? 'pf' : 'gd');
        burst(rr.left + rr.width * 0.18, rr.top + rr.height / 2, ['heart', 'star', 'sparkle'], bd < 0.1 ? 10 : 6, 70);
        S.pick();
        drawHits();
        if (combo % 4 === 0) { c.sparkleAt('fuutan', ['star', 'sparkle'], 8); flash(); }
      } else S.tap();
      const btn = p.querySelector('#rwTap'); btn.classList.remove('pressed'); void btn.offsetWidth; btn.classList.add('pressed');
    };
    const flash = () => { const f = document.createElement('div'); f.className = 'shutter'; f.style.opacity = '.5'; document.body.appendChild(f); setTimeout(() => f.remove(), 500); S.shutter(); };
    p.querySelector('#rwTap').addEventListener('pointerdown', tap);
    const end = notes[NOTES - 1].t + 1.0;
    await new Promise((res) => {
      const loop = () => {
        if (!c.alive.v) return;
        const t = now();
        // ノーツ
        for (const n of notes) {
          const dt = n.t - t;
          if (!n.el && dt < TRAVEL && !n.done) {
            n.el = document.createElement('div');
            n.el.className = 'rw-note';
            n.el.innerHTML = icon('heart', rand(['#F29CC2', '#B39CEE', '#FFB8D6']));
            lane.appendChild(n.el);
          }
          if (n.el) {
            const x = 18 + (dt / TRAVEL) * 82;
            n.el.style.left = x + '%';
            if (!n.done && dt < -0.25) { n.done = true; n.el.classList.add('miss'); combo = 0; show('おしい！', 'ms'); }
            if (dt < -0.6 && n.el.parentNode) { n.el.remove(); }
          }
        }
        // あるく
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
    // ポーズ
    const pose = await c.choose([
      { label: 'ウインク', value: 'wave', icon: svg('0 0 100 100', KP.ICONS.heart()) },
      { label: 'バンザイ', value: 'cheer', icon: svg('0 0 100 100', KP.ICONS.star()) },
      { label: 'にっこり', value: 'joy', icon: svg('0 0 100 100', KP.ICONS.smile()) },
    ], 'さいごの ポーズを えらんでね！');
    c.actor('fuutan', { html: fuuHTML({ pose, expr: pose === 'wave' ? 'wink' : 'joy' }, look), anim: '' });
    for (let i = 0; i < 3; i++) { flash(); c.sparkleAt('fuutan', ['star', 'sparkle', 'heart'], 10); await c.wait(380); }
    S.done();
    S.setWanted('home');
    await c.wait(500);
    return { hits, total: NOTES, pose };
  }

  // ================= ② ママの おつかい =================
  const DISHES = {
    curry: { name: 'カレー', yaoya: ['carrot', 'potato', 'onion'], market: ['curry'], verb: 'ぐつぐつ にこもう', tool: 'pot' },
    sand: { name: 'サンドイッチ', yaoya: ['tomato', 'lettuce'], market: ['bread', 'egg', 'cheese'], verb: 'パンに はさもう', tool: 'board' },
    parfait: { name: 'フルーツパフェ', yaoya: ['strawberry', 'banana'], market: ['icecream', 'milk'], verb: 'グラスに もりつけよう', tool: 'glass' },
  };
  const SHELF = { yaoya: ['carrot', 'potato', 'onion', 'tomato', 'lettuce', 'strawberry', 'banana', 'apple'], market: ['bread', 'egg', 'cheese', 'milk', 'curry', 'icecream', 'juice', 'cookie'] };
  const memoHTML = (list, got) => `<div class="memo">${list.map((k) => `<span class="mm${got.includes(k) ? ' got' : ''}">${KP.foodSVG(k)}${got.includes(k) ? `<i>${icon('check')}</i>` : ''}</span>`).join('')}</div>`;
  RUN.shop = async function (c) {
    const g = G();
    const dk = rand(Object.keys(DISHES));
    const DI = DISHES[dk];
    const list = [...DI.yaoya, ...DI.market];
    const got = [];
    // --- 1. キッチン ---
    c.bg(KP.BG.kitchen());
    c.actor('mama', { html: charHTML(mamaOpt({ pose: 'wave' })), x: 30, y: 96, h: 66 });
    c.actor('fuutan', { html: fuuHTML({}), x: 70, y: 97, h: 56 });
    c.actor('pyonta', { html: bunHTML('normal'), x: 88, y: 98, h: 18 });
    await c.say('mama', 'ふーたん、ちょっと おねがいが あるの。おつかいに いってくれるかな？');
    c.actor('fuutan', { html: fuuHTML({ pose: 'cheer', expr: 'joy' }) });
    await c.say('fuutan', 'うん！ まかせて！', { expr: 'joy' });
    await c.say('mama', `きょうの ごはんは ${DI.name} だよ。かうものは この メモに かいてあるからね`);
    await c.card(`<div class="memo-card"><div class="memo-title">${icon('book')}かいものメモ</div>${memoHTML(list, [])}<div class="memo-dish">${svg('0 0 300 190', KP.DISH[dk])}</div></div>`, `${list.map((k) => KP.FOOD[k].name).join('、')} を かってきてね`);
    await c.say('mama', 'おさいふも わたすね。くるまに きを つけて いってらっしゃい！');
    c.actor('fuutan', { html: fuuHTML({ pose: 'wave', expr: 'joy' }) });
    await c.say('fuutan', 'いってきまーす！', { expr: 'joy' });
    // --- 2. しんごう ---
    c.clearActors();
    c.bg(KP.BG.street('red'));
    c.actor('fuutan', { html: fuuHTML({}), x: 40, y: 82, h: 28 });
    c.actor('pyonta', { html: bunHTML('normal'), x: 58, y: 82, h: 9 });
    await c.say('pyonta', 'しんごうだ！ あおに なったら わたろうね');
    await crossGame(c);
    // すみれちゃんに あう
    const fr = Object.keys(D.FRIENDS).filter((f) => g.collection.unlockedCharacterIds.includes(f));
    if (fr.length) {
      const f = rand(fr);
      c.actor('friend', { html: charHTML(A.friendOpt(f, { pose: 'wave', expr: 'joy' })), x: 80, y: 82, h: 28 });
      await c.say(f, `あっ ふーたん！ おつかい？ えらいね！ がんばってね！`, { expr: 'joy', actor: 'friend' });
      c.actor('friend', null);
    }
    // --- 3. おみせ ---
    for (const shop of ['yaoya', 'market']) {
      await shopVisit(c, shop, DI[shop], list, got);
    }
    // --- 4. おうちで おりょうり ---
    c.clearActors();
    c.bg(KP.BG.kitchen());
    c.actor('mama', { html: charHTML(mamaOpt({ pose: 'joy', expr: 'joy' })), x: 30, y: 96, h: 66 });
    c.actor('fuutan', { html: fuuHTML({ pose: 'joy', expr: 'joy' }), x: 70, y: 97, h: 56 });
    await c.say('fuutan', 'ただいま！ ぜんぶ かえたよ！', { expr: 'joy' });
    await c.say('mama', 'わあ、ありがとう！ ふーたん すごいね！ じゃあ いっしょに つくろう！', { expr: 'joy' });
    await cookGame(c, dk, DI, list);
    c.actor('pyonta', { html: bunHTML('happy'), x: 88, y: 98, h: 18 });
    c.actor('dish', { html: svg('0 0 300 190', KP.DISH[dk]), x: 50, y: 70, h: 18, z: 200 });
    await c.say('fuutan', 'いただきまーす！', { expr: 'joy' });
    c.sparkleAt('dish', ['heart', 'star'], 14);
    await c.say('mama', 'ん〜 おいしい！ ふーたんが がんばった から とくべつ おいしいね', { expr: 'joy' });
    album('dish', { dish: dk });
    storyClear(c, 'shop');
  };
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
  async function shopVisit(c, shop, need, list, got) {
    const keeper = shop === 'yaoya' ? { kind: 'dog', wear: { kind: 'apron', color: 'mint', band: 1 } } : { kind: 'cat', wear: { kind: 'apron', color: 'blue' } };
    c.clearActors();
    c.bg(KP.BG.shop(shop));
    c.actor('keeper', { html: aniSVG(keeper.kind, 'happy', keeper.wear), x: 76, y: 66, h: 26 });
    c.actor('fuutan', { html: fuuHTML({}), x: 30, y: 99, h: 44 });
    await c.say(shop, 'いらっしゃいませ！', { expr: 'joy', actor: 'keeper' });
    await c.say('fuutan', 'メモの ものを ください！', {});
    // たなから えらぶ
    const items = shuffle(SHELF[shop]);
    c.actor('keeper', { x: 74, y: 40, h: 22 });
    c.actor('fuutan', { x: 26, y: 44, h: 28 });
    const p = c.panel(`<div class="shop-memo" id="smemo">${memoHTML(list, got)}</div><div class="shelf">${items.map((k) => `<button class="sitem" data-k="${k}">${KP.foodSVG(k)}</button>`).join('')}</div><div class="basket" id="basket">${svg('0 0 120 90', `<path d="M10,30 L110,30 L98,86 L22,86Z" fill="#F5DEC8" stroke="#B5835E" stroke-width="4"/><path d="M24,30 Q60,-14 96,30" fill="none" stroke="#B5835E" stroke-width="6"/><path d="M20,48 H100 M24,66 H96" stroke="#B5835E" stroke-width="3"/>`)}</div>`, 'bottom shop');
    S.speak('メモに ある ものを タッチしてね', 1.45);
    const left = () => need.filter((k) => !got.includes(k));
    await new Promise((res) => {
      p.addEventListener('click', (e) => {
        const b = e.target.closest('[data-k]');
        if (!b || b.classList.contains('taken')) return;
        const k = b.dataset.k;
        const r = b.getBoundingClientRect();
        if (need.includes(k) && !got.includes(k)) {
          got.push(k);
          b.classList.add('taken');
          const bk = p.querySelector('#basket').getBoundingClientRect();
          flyer(r.left + r.width / 2, r.top + r.height / 2, KP.foodSVG(k), bk.left + bk.width / 2 - r.left - r.width / 2, bk.top + 20 - r.top - r.height / 2, 600);
          S.pick();
          setTimeout(() => { p.querySelector('#smemo').innerHTML = memoHTML(list, got); burst(bk.left + bk.width / 2, bk.top + 10, ['sparkle', 'star'], 6, 50); }, 560);
          if (!left().length) setTimeout(res, 900);
        } else {
          S.tap();
          b.classList.remove('wiggle'); void b.offsetWidth; b.classList.add('wiggle');
          bubble(r.left + r.width / 2, r.top, `${KP.FOOD[k].name}は メモに ないね`, 1300);
        }
      });
    });
    c.hidePanel();
    c.actor('keeper', { x: 76, y: 66, h: 26 });
    c.actor('fuutan', { x: 30, y: 99, h: 44 });
    // おかいけい
    const price = need.length + 1 + Math.floor(Math.random() * 2);
    await c.say(shop, `おかいけいは コイン ${price}まい です`, { actor: 'keeper' });
    await payGame(c, price);
    c.actor('keeper', { html: aniSVG(keeper.kind, 'happy', keeper.wear) });
    await c.say(shop, 'ちょうど ですね！ ありがとう！ おまけに あめを どうぞ', { expr: 'joy', actor: 'keeper' });
    c.actor('fuutan', { html: fuuHTML({ pose: 'joy', expr: 'joy' }) });
    c.sparkleAt('fuutan', ['heart', 'sparkle'], 8);
    await c.say('fuutan', 'わあい！ ありがとうございます！', { expr: 'joy' });
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
        const n = paid;
        setTimeout(() => { slot.innerHTML = svg('0 0 100 100', KP.coin()); slot.classList.add('on'); slot.dataset.n = n; }, 360);
        if (paid >= price) setTimeout(() => { S.done(); res(); }, 800);
      });
    });
    c.hidePanel();
    return c.guard(Promise.resolve());
  }
  async function cookGame(c, dk, DI, list) {
    const vessel = DI.tool === 'pot'
      ? `<path d="M40,80 L260,80 L244,190 Q150,214 56,190Z" fill="#B9C4DA" stroke="#6A7490" stroke-width="5"/><ellipse cx="150" cy="80" rx="112" ry="22" fill="#C98C25" stroke="#6A7490" stroke-width="5"/><path d="M40,90 Q10,90 14,110 M260,90 Q290,90 286,110" fill="none" stroke="#6A7490" stroke-width="8" stroke-linecap="round"/>`
      : DI.tool === 'glass'
        ? `<path d="M90,20 L210,20 L184,190 L116,190Z" fill="#F7F2FF" stroke="#C9B8E6" stroke-width="5" opacity=".95"/><path d="M130,190 L170,190 L180,210 L120,210Z" fill="#C9B8E6"/>`
        : `<rect x="20" y="90" width="260" height="110" rx="16" fill="#E6C08A" stroke="#B5835E" stroke-width="5"/><path d="M50,120 L150,60 L250,120Z" fill="#F6E1B8" stroke="#C99A5E" stroke-width="4"/>`;
    const added = [];
    let cnt = 0;
    const draw = (stir = 0) => svg('0 0 300 230', vessel + added.map((k, i) => `<g transform="translate(${70 + (i % 4) * 44 + (stir % 2) * 6} ${DI.tool === 'glass' ? 130 - i * 26 : 40 + Math.floor(i / 4) * 20}) scale(.5) rotate(${stir * 30 + i * 20} 50 50)">${KP.FOOD[k].d}</g>`).join('') +
      (stir ? `<path d="M120,40 Q110,20 124,6 M150,36 Q140,16 154,2 M180,40 Q170,20 184,6" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>` : ''));
    const p = c.panel(`<div class="st-prompt">ざいりょうを いれよう</div><div class="cook" id="cook">${draw()}</div><div class="ings">${list.map((k) => `<button class="sitem" data-k="${k}">${KP.foodSVG(k)}</button>`).join('')}</div>`, 'full cookp');
    S.speak('ざいりょうを いれよう', 1.45);
    const cook = p.querySelector('#cook');
    await new Promise((res) => {
      p.addEventListener('click', (e) => {
        const b = e.target.closest('[data-k]');
        if (!b || b.classList.contains('taken')) return;
        b.classList.add('taken');
        cnt++;
        const r = b.getBoundingClientRect(), cr = cook.getBoundingClientRect();
        flyer(r.left + r.width / 2, r.top + r.height / 2, KP.foodSVG(b.dataset.k), cr.left + cr.width / 2 - r.left - r.width / 2, cr.top + cr.height * 0.3 - r.top - r.height / 2, 500);
        S.pop();
        setTimeout(() => { added.push(b.dataset.k); cook.innerHTML = draw(); burst(cr.left + cr.width / 2, cr.top + cr.height * 0.35, ['drop', 'sparkle'], 6, 60); }, 480);
        if (cnt >= list.length) setTimeout(res, 800);
      });
    });
    // まぜる
    p.querySelector('.st-prompt').textContent = `${DI.verb}！ なんかいも タッチ！`;
    p.querySelector('.ings').innerHTML = `<button class="pill main big" id="mix">${icon('magic', '#fff')}${DI.tool === 'pot' ? 'まぜまぜ' : DI.tool === 'glass' ? 'のせる' : 'はさむ'}</button>`;
    S.speak(`${DI.verb}`, 1.45);
    let n = 0;
    await new Promise((res) => {
      p.querySelector('#mix').addEventListener('click', () => {
        n++;
        cook.innerHTML = draw(n);
        S.boing();
        const cr = cook.getBoundingClientRect();
        burst(cr.left + cr.width / 2, cr.top + cr.height * 0.3, ['heart', 'sparkle'], 5, 60);
        if (n >= 6) setTimeout(res, 500);
      });
    });
    cook.innerHTML = svg('0 0 300 190', KP.DISH[dk]);
    cook.classList.add('pop');
    S.henshin();
    const cr = cook.getBoundingClientRect();
    burst(cr.left + cr.width / 2, cr.top + cr.height / 2, ['star', 'heart', 'sparkle'], 20, 160);
    p.querySelector('.st-prompt').textContent = `${DI.name}の できあがり！`;
    p.querySelector('.ings').innerHTML = '';
    S.speak(`${DI.name}の できあがり！`, 1.45);
    await c.wait(2200);
    c.hidePanel();
    return c.guard(Promise.resolve());
  }

  // ================= ③ はいしゃさんの おてつだい =================
  const PATIENTS = [
    { kind: 'cat', name: 'ねこちゃん' }, { kind: 'dog', name: 'いぬくん' }, { kind: 'panda', name: 'パンダちゃん' }, { kind: 'pig', name: 'こぶたちゃん' }, { kind: 'bear', name: 'くまの こ' },
  ];
  const NURSE = { onepiece: 'nurse-pink', hair: 'nursecap-pink', shoes: 'pumps-pink', tops: null, skirt: null, ribbon: null, magic: null };
  const nurseHTML = (x = {}) => svg('0 -30 400 680', KP.drawChar({ ...A.fuuHair(), outfit: toDraw(NURSE), ...x }));
  KP.DATA.ITEMS['nurse-pink'] = KP.DATA.ITEMS['nurse-pink'] || { id: 'nurse-pink', slot: 'onepiece', type: 'nurse', color: 'pink', name: 'ナースふく', hidden: true, story: true };
  KP.DATA.ITEMS['nursecap-pink'] = KP.DATA.ITEMS['nursecap-pink'] || { id: 'nursecap-pink', slot: 'hair', type: 'nursecap', color: 'pink', name: 'ナースぼうし', hidden: true, story: true };
  KP.DATA.ITEMS['apron-pink'] = KP.DATA.ITEMS['apron-pink'] || { id: 'apron-pink', slot: 'onepiece', type: 'apron', color: 'pink', name: 'エプロン', hidden: true, story: true };
  RUN.dentist = async function (c) {
    const pats = shuffle(PATIENTS).slice(0, 2);
    c.bg(KP.BG.clinic());
    c.actor('doctor', { html: aniSVG('bear', 'smile', { kind: 'coat' }), x: 18, y: 99, h: 36 });
    c.actor('fuutan', { html: fuuHTML({}), x: 80, y: 99, h: 52 });
    await c.say('doctor', 'やあ ふーたん！ きょうは はいしゃさんの おてつだい、よろしくね');
    await c.say('fuutan', 'はい！ がんばります！', { expr: 'joy' });
    await c.say('doctor', 'まずは かんごしさんの ふくに おきがえ しよう！');
    c.sparkleAt('fuutan', ['sparkle', 'star', 'heart'], 16);
    S.henshin();
    await c.wait(500);
    c.actor('fuutan', { html: nurseHTML({ pose: 'cheer', expr: 'joy' }) });
    await c.say('fuutan', 'じゃーん！ かんごしさんに なったよ！', { expr: 'joy' });
    for (let i = 0; i < pats.length; i++) {
      const P = pats[i];
      c.actor('fuutan', { html: nurseHTML({}) });
      c.actor('pat', { html: aniSVG(P.kind, 'sad', { kind: 'bib' }), x: 49, y: 72, h: 26, z: 150 });
      await c.say({ name: P.name, pitch: 1.6, face: () => aniFace(P.kind, 'sad') }, 'えーん… はが いたいの…', { actor: 'pat' });
      c.actor('fuutan', { html: nurseHTML({ pose: 'wave', expr: 'smile' }) });
      await c.say('fuutan', `だいじょうぶだよ、${P.name}。いすに すわってね`, {});
      await c.say('doctor', 'はい、あーん して ください。ふーたん、おくちの なかを みてみよう！');
      await mouthGame(c, P);
      c.actor('pat', { html: aniSVG(P.kind, 'happy', { kind: 'bib' }) });
      c.sparkleAt('pat', ['star', 'heart', 'sparkle'], 14);
      await c.say({ name: P.name, pitch: 1.6, face: () => aniFace(P.kind, 'happy') }, 'わあ！ もう いたくない！ ありがとう！', { actor: 'pat' });
      // シールを えらぶ
      const st = await c.choose([
        { label: 'ほし', value: 'star', icon: svg('0 0 100 100', KP.ICONS.star()) },
        { label: 'ハート', value: 'heart', icon: svg('0 0 100 100', KP.ICONS.heart()) },
        { label: 'ぴかぴか', value: 'tooth', icon: svg('0 0 100 100', `<path d="M30,40 Q30,16 50,18 Q70,16 70,40 Q70,70 62,88 Q58,92 54,76 Q52,66 50,66 Q48,66 46,76 Q42,92 38,88 Q30,70 30,40Z" fill="#fff" stroke="#9DBDF4" stroke-width="5"/>${KP.sparkle(76, 20, 9, '#FFE08A')}`) },
      ], 'がんばった ごほうびの シールを えらんでね');
      c.actor('pat', { html: aniSVG(P.kind, 'happy', { kind: 'bib' }), anim: 'bounce' });
      c.sparkleAt('pat', [st === 'heart' ? 'heart' : 'star', 'sparkle'], 10);
      S.done();
      await c.say({ name: P.name, pitch: 1.6, face: () => aniFace(P.kind, 'happy') }, 'シール うれしい！ まいにち はみがき するね！', { actor: 'pat' });
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
  async function mouthGame(c, P) {
    const teeth = shuffle(KP.TEETH.map((_, i) => i));
    const germs = teeth.slice(0, 3 + Math.floor(Math.random() * 2)).map((ti, k) => ({ ti, hp: 3, v: k % 3, gone: false, foam: 0 }));
    let lit = false, tool = 'light', rinsed = false;
    const draw = () => {
      let o = KP.drawMouthView(P.kind, { light: lit, nervous: !rinsed, happy: rinsed, shine: rinsed });
      if (lit) {
        for (const gm of germs) {
          const t = KP.TEETH[gm.ti];
          if (gm.foam && !rinsed) o += KP.drawFoam(t.x, t.y, 3 + gm.foam * 2);
          if (!gm.gone) o += `<g class="germ" data-g="${germs.indexOf(gm)}"><g class="wob">${KP.drawGerm(t.x, t.y, 0.9 + gm.hp * 0.12, gm.v)}</g></g>`;
        }
        if (rinsed) KP.TEETH.forEach((t, i) => { if (i % 2 === 0) o += KP.sparkle(t.x + 12, t.y - 18, 9, '#fff'); });
      }
      return svg('0 0 600 600', o);
    };
    const TOOLS = [['light', 'ライト', `<rect x="34" y="40" width="34" height="50" rx="8" fill="#B9C4DA" stroke="#6A7490" stroke-width="4"/><path d="M20,40 L82,40 L70,14 L32,14Z" fill="#FFE59A" stroke="#D29A3A" stroke-width="4"/>${KP.sparkle(52, 6, 8, '#FFE59A')}`],
      ['brush', 'はブラシ', `<rect x="44" y="30" width="12" height="66" rx="6" fill="#9DBDF4" stroke="#6F98E2" stroke-width="3"/><rect x="36" y="8" width="28" height="28" rx="6" fill="#fff" stroke="#9DBDF4" stroke-width="3"/><path d="M42,12 V32 M50,12 V32 M58,12 V32" stroke="#BFE3FF" stroke-width="3"/>`],
      ['water', 'おみず', `<path d="M28,30 L72,30 L66,90 L34,90Z" fill="#EAF6FF" stroke="#8CB4E8" stroke-width="4"/><path d="M32,52 L68,52 L66,88 L34,88Z" fill="#9DCDF4"/><path d="M50,4 C60,18 62,22 62,26 A12,12 0 0,1 38,26 C38,22 40,18 50,4Z" fill="#BFE3FF" stroke="#8CB4E8" stroke-width="3"/>`]];
    const p = c.panel(`<div class="st-prompt" id="mPrompt"></div><div class="mouth" id="mouth">${draw()}</div><div class="tools" id="mTools"></div>`, 'full mouthp');
    const mouth = p.querySelector('#mouth'), toolsEl = p.querySelector('#mTools'), prompt = p.querySelector('#mPrompt');
    const want = () => (!lit ? 'light' : germs.some((g) => !g.gone) ? 'brush' : 'water');
    const setPrompt = () => {
      const t = !lit ? 'くらくて みえないね。ライトを つけよう！' : germs.some((g) => !g.gone) ? 'むしばきんを はブラシで ごしごし！' : 'おみずで きれいに しよう！';
      prompt.textContent = t;
      S.speak(t, 1.45);
    };
    const drawTools = () => (toolsEl.innerHTML = TOOLS.map(([k, n, ic]) => `<button class="mk-tool${tool === k ? ' sel' : ''}${want() === k ? ' hint' : ''}" data-t="${k}">${svg('0 0 100 100', ic)}<span>${n}</span></button>`).join(''));
    setPrompt(); drawTools();
    await new Promise((res) => {
      p.addEventListener('click', (e) => {
        const t = e.target.closest('[data-t]');
        if (t) {
          tool = t.dataset.t;
          S.tap();
          if (tool === 'light' && !lit) {
            lit = true;
            mouth.innerHTML = draw();
            S.sparkle();
            const r = mouth.getBoundingClientRect();
            bubble(r.left + r.width / 2, r.top + r.height * 0.3, `${icon('search')}むしばきんが いた！`, 1600);
            tool = 'brush';
            setPrompt();
          } else if (tool === 'water') {
            if (germs.some((g) => !g.gone)) { const r = t.getBoundingClientRect(); bubble(r.left + r.width / 2, r.top, 'さきに むしばきんを やっつけよう', 1400); tool = lit ? 'brush' : 'light'; }
            else if (!rinsed) {
              rinsed = true;
              const r = mouth.getBoundingClientRect();
              burst(r.left + r.width / 2, r.top + r.height * 0.5, ['drop'], 18, 160);
              S.sparkle();
              setTimeout(() => { mouth.innerHTML = draw(); burst(r.left + r.width / 2, r.top + r.height * 0.5, ['sparkle', 'star'], 14, 150); S.done(); prompt.textContent = 'ぴかぴかに なったね！'; S.speak('ぴかぴかに なったね！', 1.45); }, 600);
              setTimeout(res, 2200);
            }
          } else if (tool === 'brush' && !lit) { const r = t.getBoundingClientRect(); bubble(r.left + r.width / 2, r.top, 'くらくて みえないよ', 1300); tool = 'light'; }
          drawTools();
          return;
        }
        const gEl = e.target.closest('[data-g]');
        if (!gEl || !lit) return;
        if (tool !== 'brush') { tool = 'brush'; drawTools(); }
        const gm = germs[+gEl.dataset.g];
        gm.hp--;
        gm.foam++;
        const r = gEl.getBoundingClientRect();
        S.pop();
        burst(r.left + r.width / 2, r.top + r.height / 2, ['sparkle'], 5, 40);
        if (gm.hp <= 0) {
          gm.gone = true;
          flyer(r.left + r.width / 2, r.top + r.height / 2, svg('-40 -40 80 80', KP.drawGerm(0, 0, 1, gm.v)), (Math.random() < 0.5 ? -1 : 1) * innerWidth * 0.6, -200, 900);
          bubble(r.left + r.width / 2, r.top, 'にげろ〜！', 1000);
          S.boing();
          if (!germs.some((g) => !g.gone)) { setTimeout(() => { setPrompt(); drawTools(); }, 300); }
        }
        mouth.innerHTML = draw();
      });
    });
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
    await c.say('teacher', 'きょうは ひらがなを なぞって かく れんしゅうを しようね。ゆびで ゆっくり なぞってね');
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
  // ゆびで なぞる（はみだしても OK。うえから なぞれたら はなまる）
  async function traceGame(c, ch, W, idx) {
    const p = c.panel(`<div class="tr-head"><div class="tr-pic">${W.pic()}</div><div class="tr-word">${W.w.split('').map((x, i) => `<span class="${i === idx ? 'cur' : i < idx ? 'done' : ''}">${x}</span>`).join('')}</div></div>` +
      `<div class="st-prompt">「${ch}」を なぞって かこう</div>` +
      `<div class="tr-box" id="trBox"><canvas id="trBg"></canvas><canvas id="trInk"></canvas><div class="tr-maru" id="trMaru"></div></div>` +
      `<div class="tr-meter"><i id="trMeter"></i></div>` +
      `<div class="tr-acts"><button class="pill" data-a="clear">${icon('reset')}けす</button><button class="pill" data-a="hear">${icon('sound')}きく</button><button class="pill main" data-a="ok">${icon('check', '#fff')}できた！</button></div>`, 'full trace');
    const box = p.querySelector('#trBox'), bg = p.querySelector('#trBg'), ink = p.querySelector('#trInk'), meter = p.querySelector('#trMeter');
    const size = Math.round(box.getBoundingClientRect().width) || 300;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    for (const cv of [bg, ink]) { cv.width = size * dpr; cv.height = size * dpr; cv.style.width = cv.style.height = size + 'px'; }
    const gb = bg.getContext('2d'), gi = ink.getContext('2d');
    gb.scale(dpr, dpr); gi.scale(dpr, dpr);
    // ますめ
    gb.fillStyle = '#FFFDF8'; gb.fillRect(0, 0, size, size);
    gb.strokeStyle = '#F2C6D8'; gb.lineWidth = 2; gb.setLineDash([8, 8]);
    gb.beginPath(); gb.moveTo(size / 2, 0); gb.lineTo(size / 2, size); gb.moveTo(0, size / 2); gb.lineTo(size, size / 2); gb.stroke();
    gb.setLineDash([]);
    const font = FONT.replace('1px', Math.round(size * 0.8) + 'px');
    const drawGlyph = (g, col) => { g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(ch, size / 2, size * 0.53); };
    drawGlyph(gb, '#F3D7E3');
    gb.lineWidth = 2; gb.strokeStyle = '#E8B4C8'; gb.font = font; gb.textAlign = 'center'; gb.textBaseline = 'middle'; gb.setLineDash([5, 6]); gb.strokeText(ch, size / 2, size * 0.53); gb.setLineDash([]);
    // おてほんの まと（なぞるべき ところ）
    const mk = document.createElement('canvas'); mk.width = mk.height = size;
    const gm = mk.getContext('2d'); drawGlyph(gm, '#000');
    const md = gm.getImageData(0, 0, size, size).data;
    const STEP = Math.max(3, Math.round(size / 90));
    const guide = [];
    for (let y = 0; y < size; y += STEP) for (let x = 0; x < size; x += STEP) if (md[(y * size + x) * 4 + 3] > 128) guide.push([x, y]);
    S.speak(`${ch}。${W.w}の ${ch}`, 1.3);
    // かく
    gi.lineCap = 'round'; gi.lineJoin = 'round'; gi.strokeStyle = '#E0559A'; gi.lineWidth = size * 0.085;
    let drawing = null;
    const pos = (e) => { const r = ink.getBoundingClientRect(); return [(e.clientX - r.left) * (size / r.width), (e.clientY - r.top) * (size / r.height)]; };
    ink.addEventListener('pointerdown', (e) => { e.preventDefault(); try { ink.setPointerCapture(e.pointerId); } catch (er) { /* なし */ } drawing = pos(e); gi.beginPath(); gi.moveTo(...drawing); gi.lineTo(drawing[0] + 0.1, drawing[1]); gi.stroke(); });
    ink.addEventListener('pointermove', (e) => { if (!drawing) return; const q = pos(e); gi.beginPath(); gi.moveTo(...drawing); gi.lineTo(...q); gi.stroke(); drawing = q; if (Math.random() < 0.15) S.tap(); });
    const coverage = () => {
      const d = gi.getImageData(0, 0, size * dpr, size * dpr).data;
      let hit = 0;
      for (const [x, y] of guide) if (d[((Math.round(y * dpr)) * size * dpr + Math.round(x * dpr)) * 4 + 3] > 40) hit++;
      return guide.length ? hit / guide.length : 1;
    };
    let done = false;
    let resolve;
    const finished = new Promise((r) => (resolve = r));
    const success = async () => {
      if (done) return;
      done = true;
      p.querySelector('#trMaru').innerHTML = svg('0 0 200 200', KP.drawHanamaru());
      p.querySelector('#trMaru').classList.add('show');
      const r = box.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, ['star', 'heart', 'sparkle'], 16, 160);
      S.done();
      S.speak(rand(['はなまる！ じょうず！', 'すごい！ きれいに かけたね！', 'ばっちり！']), 1.3);
      await sleep(1600);
      resolve(ink.toDataURL('image/png'));
    };
    const check = () => {
      const cv = coverage();
      meter.style.width = Math.min(100, Math.round((cv / 0.62) * 100)) + '%';
      if (cv >= 0.62) success();
      return cv;
    };
    const up = () => { if (drawing) { drawing = null; check(); } };
    ink.addEventListener('pointerup', up);
    ink.addEventListener('pointercancel', up);
    p.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]');
      if (!b || done) return;
      S.tap();
      if (b.dataset.a === 'clear') { gi.clearRect(0, 0, size, size); meter.style.width = '0%'; }
      if (b.dataset.a === 'hear') S.speak(`${ch}。${W.w}の ${ch}`, 1.3);
      if (b.dataset.a === 'ok') {
        const cv = check();
        if (cv >= 0.3) success();
        else { const r = box.getBoundingClientRect(); bubble(r.left + r.width / 2, r.top + 30, 'もうすこし なぞってみよう', 1500); S.speak('もうすこし なぞってみよう', 1.2); }
      }
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
  // ================= アルバムの え =================
  A.snapExtra = function (a) {
    const s = a.snapshot;
    if (a.type === 'show') {
      const o = KP.BG.runway() + `<g transform="translate(155 300) scale(1.1)">${KP.drawChar({ hairStyle: s._hs || 'long', hairColor: s._hc || 'pink', eyeColor: A.EYE_FOR[s._hc || 'pink'], outfit: toDraw(s), makeup: s._mk || {}, pose: s._pose || 'cheer', expr: 'joy' })}</g>` + `<g transform="translate(560 40) scale(.8)">${KP.drawTrophy()}</g>`;
      return svg('60 120 630 790', o).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
    }
    if (a.type === 'dish') {
      const o = KP.BG.kitchen() + `<g transform="translate(40 380) scale(.9)">${KP.drawChar(mamaOpt({ pose: 'joy', expr: 'joy' }))}</g><g transform="translate(380 420) scale(.8)">${KP.drawChar(A.fuutanOpt({ pose: 'joy', expr: 'joy' }))}</g><g transform="translate(225 720) scale(1)">${KP.DISH[s.dish]}</g>`;
      return svg('0 300 750 700', o).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
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
