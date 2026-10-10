// ================================================================ conversations, results, diary
const Talk = (() => {
  let resolve = null, lines = [], i = 0, typing = null, full = '', shown = 0, skipAll = false;
  const box = $('#tkBox');
  function show() {
    const [who, text] = lines[i]; const sp = SPEAKER[who] || SPEAKER.n;
    $('#tkWho').textContent = sp.name; $('#tkWho').style.background = sp.col; $('#tkWho').style.visibility = sp.name ? '' : 'hidden';
    full = text; shown = 0; $('#tkTxt').textContent = '';
    $('#tkTxt').style.fontStyle = who === 'n' ? 'italic' : '';
    const a = AG[who]; if (a && a.home) UI.bubble(a, text.length > 26 ? text.slice(0, 24) + '…' : text, 3.5);
    if (who === 'powa') Hooks.powaSpeak && Hooks.powaSpeak(text);
    clearInterval(typing);
    typing = setInterval(() => { shown += 2; $('#tkTxt').textContent = full.slice(0, shown); if (shown >= full.length) clearInterval(typing); }, 28);
    Sound.sfx('page');
  }
  function next() {
    if (shown < full.length) { shown = full.length; $('#tkTxt').textContent = full; clearInterval(typing); return; }
    i++; if (i >= lines.length) return done();
    show();
  }
  function done() { clearInterval(typing); $('#talk').classList.add('hide'); UI.clearBubbles(); const r = resolve; resolve = null; r && r(); }
  box.addEventListener('click', e => { if (e.target.id === 'tkSkip') return; Sound.unlock(); next(); });
  $('#tkSkip').addEventListener('click', e => { e.stopPropagation(); done(); });
  addEventListener('keydown', e => { if (!resolve) return; if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); next(); } });
  return {
    run(ls, head) {
      return new Promise(r => {
        if (HEADLESS || !ls || !ls.length) { r(); return; }
        lines = ls; i = 0; resolve = r; $('#talk').classList.remove('hide'); $('#tkHdl').textContent = head || ''; show();
      });
    },
    get active() { return !!resolve; },
  };
})();
function stars(n, max = 3) { let s = ''; for (let i = 0; i < max; i++) s += i < n ? '★' : '<i>★</i>'; return s; }
function dayResult() {
  const d = World.day, D = DAYS[d];
  const ex = World.maxExposure || 0;
  const hide = World.caught ? 0 : ex < 0.3 ? 3 : ex < 0.7 ? 2 : 1;
  const md = World.maxDepth;
  const chain = md >= 6 ? 3 : md >= 4 ? 2 : md >= 2 ? 1 : 0;
  const goal = !World.caught && (D.free ? true : !!World.goalDone);
  let hidden = false; try { hidden = !!D.hiddenOK(); } catch (e) { }
  return { day: d, goal, hide, chain, depth: md, hidden, events: World.events.filter(e => !e.player).length, caught: World.caught };
}
function showResult(r) {
  return new Promise(res => {
    const D = DAYS[r.day];
    const c = $('#rsCard');
    c.innerHTML = `<h2>${r.day <= LAST_DAY ? r.day + '日目の ふりかえり' : '自由な日の ふりかえり'}</h2>
      <div class="rrow"><span class="l">お題<div class="v">${D.goalShort}</div></span><span class="s" style="color:${r.goal ? '#e0a020' : '#c0b0a0'}">${r.goal ? 'たっせい！' : 'まだ…'}</span></div>
      <div class="rrow"><span class="l">かくれんぼ<div class="v">${r.caught ? 'みつかっちゃった' : r.hide === 3 ? 'だれにも 気づかれなかった' : r.hide === 2 ? 'ちょっと あぶなかった' : 'ぎりぎり にげきった'}</div></span><span class="s">${stars(r.hide)}</span></div>
      <div class="rrow"><span class="l">れんさ<div class="v">いちばん ながい れんさ：${r.depth}つ（できごと ${r.events}こ）</div></span><span class="s">${stars(r.chain)}</span></div>
      <div class="hid">${r.hidden ? '🎉 かくしお題 たっせい：' + D.hidden : '🔒 かくしお題：' + (Save.d.days[r.day] && Save.d.days[r.day].hidden ? D.hidden : '？？？（' + D.hidden.slice(0, 6) + '…）')}</div>
      <div class="btns">${r.goal ? `<button class="bigb" data-r="next">${r.day >= LAST_DAY ? 'つづける' : 'つぎの 日へ'}</button>` : ''}<button class="bigb blue sm" data-r="retry">帰宅から やりなおす</button><button class="bigb blue sm" data-r="retry0">しこみから やりなおす</button><button class="bigb grey sm" data-r="title">タイトルへ</button></div>`;
    $('#result').classList.remove('hide');
    if (r.goal) Sound.sfx('goal');
    c.onclick = e => { const b = e.target.closest('button'); if (!b) return; Sound.sfx('tap'); $('#result').classList.add('hide'); res(b.dataset.r); };
  });
}
function saveDay(r) {
  if (r.day > LAST_DAY) return;
  const prev = Save.d.days[r.day] || {};
  Save.d.days[r.day] = { goal: prev.goal || r.goal, hide: Math.max(prev.hide || 0, r.goal ? r.hide : 0), chain: Math.max(prev.chain || 0, r.chain), hidden: prev.hidden || r.hidden };
  if (r.goal) Save.d.unlocked = Math.max(Save.d.unlocked, Math.min(LAST_DAY + 1, r.day + 1));
  Save.write();
}
function diaryEntry(r, img) {
  if (r.day > LAST_DAY) return;
  const D = DAYS[r.day];
  const txt = D.diary(r) + (r.depth >= 5 ? '\n…きょうは なんだか、へんな 日だった。' : '');
  const prev = Save.d.diary[r.day];
  if (!prev || r.goal || !prev.goal) Save.d.diary[r.day] = { text: txt, img: img || (prev && prev.img) || null, goal: r.goal };
  Save.write();
}
function openDiary(onlyDay) {
  const b = $('#dyBody'); b.innerHTML = '';
  const days = Object.keys(Save.d.diary).map(Number).sort((a, b) => a - b).filter(d => !onlyDay || d === onlyDay);
  if (!days.length) b.innerHTML = '<p style="font-size:16px">まだ なにも かかれていない。</p>';
  for (const d of days) {
    const e = Save.d.diary[d]; const pg = document.createElement('div'); pg.className = 'dpage';
    pg.innerHTML = `<div class="dt">${d}日目 「${DAYS[d].title}」</div>${e.img ? `<img src="${e.img}" alt="">` : ''}<div class="tx"></div>`;
    pg.querySelector('.tx').textContent = e.text; b.appendChild(pg);
  }
  $('#diary').classList.remove('hide');
  if (onlyDay) $('#diary .card').scrollTop = 0;
}
function captureImg() {
  if (HEADLESS) return null;
  try {
    renderer.render(scene, camera);
    const src = renderer.domElement; const w = 420, h = Math.round(w * src.height / src.width);
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    x.drawImage(src, 0, 0, w, h);
    // warm diary tint
    x.fillStyle = 'rgba(255,230,190,.12)'; x.fillRect(0, 0, w, h);
    return c.toDataURL('image/jpeg', 0.62);
  } catch (e) { return null; }
}
