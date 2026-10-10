// ================================================================ conversations, results, album
const SPEAKER = { n: { name: '', col: '#7a6a8a' }, powa: { name: 'ぽわ', col: '#8a9ad8' }, sota: { name: 'そうた', col: '#c89a1a' }, hinata: { name: 'ひなた', col: '#d04050' }, mio: { name: 'みお', col: '#3a9a7a' }, kento: { name: 'けんと', col: '#3a7ac8' }, monaka: { name: 'もなか', col: '#a8783a' } };
const Talk = (() => {
  let resolve = null, lines = [], i = 0, typing = null, full = '', shown = 0;
  const box = $('#tkBox');
  function show() {
    const [who, text] = lines[i]; const sp = SPEAKER[who] || SPEAKER.n;
    $('#tkWho').textContent = sp.name; $('#tkWho').style.background = sp.col; $('#tkWho').style.visibility = sp.name ? '' : 'hidden';
    full = text; shown = 0; $('#tkTxt').textContent = ''; $('#tkTxt').style.fontStyle = who === 'n' ? 'italic' : '';
    const a = AG[who]; if (a && a.home) UI.bubble(a, text.length > 24 ? text.slice(0, 22) + '…' : text, 3.5);
    clearInterval(typing); typing = setInterval(() => { shown += 2; $('#tkTxt').textContent = full.slice(0, shown); if (shown >= full.length) clearInterval(typing); }, 28);
    Sound.sfx('page');
  }
  function next() { if (shown < full.length) { shown = full.length; $('#tkTxt').textContent = full; clearInterval(typing); return; } i++; if (i >= lines.length) return done(); show(); }
  function done() { clearInterval(typing); $('#talk').classList.add('hide'); UI.clearBubbles(); const r = resolve; resolve = null; r && r(); }
  box.addEventListener('click', e => { if (e.target.id === 'tkSkip') return; Sound.unlock(); next(); });
  $('#tkSkip').addEventListener('click', e => { e.stopPropagation(); done(); });
  addEventListener('keydown', e => { if (!resolve) return; if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); next(); } });
  return { run(ls, head) { return new Promise(r => { if (HEADLESS || !ls || !ls.length) { r(); return; } lines = ls; i = 0; resolve = r; $('#talk').classList.remove('hide'); $('#tkHdl').textContent = head || ''; show(); }); }, get active() { return !!resolve; } };
})();
function stars(n) { let s = ''; for (let i = 0; i < 3; i++) s += i < n ? '★' : '<i>★</i>'; return s; }
function visitResult() {
  const kids = FAMILY.map(id => AG[id]);
  const per = kids.map(a => { const den = Math.max(1, World.elapsed - a.arrive); return { id: a.id, r: clamp(a.good / den, 0, 1), cried: a.cried, bored: a.bored }; });
  const avg = per.reduce((s, p) => s + p.r, 0) / Math.max(1, per.length);
  let st = avg >= 0.5 ? 3 : avg >= 0.28 ? 2 : 1;
  if (World.caught) st = Math.max(1, st - 1);
  return { v: World.visit, stars: st, avg, per, caught: World.caught };
}
function kidComment(p) {
  if (World.caught) return pick(['「出たー！」って みんなで わらった', 'おばけ みちゃった！ すごい！']);
  if (p.cried) return 'こわかった… もう こないかも';
  if (p.r >= 0.45) return pick(['たのしかった！ また くる！', 'ドキドキした〜！ また こよう！', 'ちょうど いい こわさ だった！']);
  if (p.r >= 0.22) return pick(['まあまあ たのしかった', 'ちょっと こわかった かな']);
  return p.bored >= 2 ? 'つまんなかった〜' : 'なにも おこらなかったね';
}
function showResult(r) {
  return new Promise(res => {
    const { season, k } = visitInfo(r.v);
    const newItem = r.stars >= 2 && !(Save.d.items || {})[r.v];
    const c = $('#rsCard');
    c.innerHTML = `<h2>${SEASONS[season].name}の ${k}かいめ「${KIND_OF_VISIT[k]}」</h2>
      <div class="rrow"><span class="l">ひょうか<div class="v">${r.caught ? 'つかまっちゃった… でも みんな わらって かえった' : 'ちょうどいい ドキドキの 時間 ' + Math.round(r.avg * 100) + '%'}</div></span><span class="s">${stars(r.stars)}</span></div>
      <div style="margin:8px 0 4px;font-size:13px">かえりみちの 声</div>
      ${r.per.map(p => `<div class="kres"><span class="nm4">${CHAR_DEF[p.id].name}</span><span class="bar"><i style="width:${Math.round(p.r * 100)}%"></i></span><span class="cm">「${kidComment(p)}」</span></div>`).join('')}
      ${r.stars === 3 && visitKids(r.v + 1 <= 16 ? r.v + 1 : r.v).length < 4 ? '<div class="hid">🎈 たのしかったので、つぎは 友だちを つれてくるって！</div>' : ''}
      ${newItem ? `<div class="hid">🎁 わすれもの「${ITEMS[r.v - 1]}」が ぽわの へやに ふえた</div>` : ''}
      <div class="btns">${!r.caught ? `<button class="bigb" data-r="next">${r.v >= 16 ? 'つづける' : 'つぎの 日へ'}</button>` : ''}<button class="bigb blue sm" data-r="retry">もう いちど</button><button class="bigb grey sm" data-r="title">タイトルへ</button></div>`;
    $('#result').classList.remove('hide');
    Sound.sfx(r.stars >= 2 ? 'goal' : 'ok');
    c.onclick = e => { const b = e.target.closest('button'); if (!b) return; Sound.sfx('tap'); $('#result').classList.add('hide'); res(b.dataset.r); };
  });
}
function saveVisit(r) {
  const V = Save.d.visits = Save.d.visits || {};
  const prev = V[r.v] || {};
  V[r.v] = { stars: Math.max(prev.stars || 0, r.caught ? 0 : r.stars), lastStars: r.caught ? 0 : r.stars, done: prev.done || !r.caught };
  if (r.stars >= 2 && !r.caught) { Save.d.items = Save.d.items || {}; Save.d.items[r.v] = 1; }
  if (!r.caught) Save.d.unlocked = Math.max(Save.d.unlocked || 1, Math.min(16, r.v + 1));
  Save.write();
}
function openAlbum() {
  const al = Save.d.album || {}, it = Save.d.items || {};
  let h = '<p style="font-size:13px">子どもたちの びっくり顔。おどろかせかたで 3しゅるい あつまる。</p>';
  for (const id of KIDS_ALL) {
    const m = al[id] || 0;
    h += `<div class="alk"><span class="nm3">${CHAR_DEF[id].name}</span><div class="ph">${[['くすっ', 'happy'], ['きゃっ', 'surp'], ['わーっ', 'panic']].map(([n, e], i) => `<div class="${m & (1 << i) ? '' : 'no'}"><img src="${m & (1 << i) ? UI.faceImg(id, e) : UI.faceImg(id, 'sleep')}" alt="">${m & (1 << i) ? n : '？？？'}</div>`).join('')}</div></div>`;
  }
  h += '<div class="sec">ぽわの へや（わすれもの）</div><div class="items">' + ITEMS.map((n, i) => `<span class="${it[i + 1] ? '' : 'no'}">${it[i + 1] ? n : '？'}</span>`).join('') + '</div>';
  $('#alBody').innerHTML = h; $('#album').classList.remove('hide');
}
function openDays() {
  const g = $('#dGrid'); g.innerHTML = ''; const V = Save.d.visits || {};
  for (let s = 1; s <= 4; s++) {
    const sec = document.createElement('div'); sec.className = 'sea'; sec.textContent = SEASONS[s].name + '（' + SEASONS[s].kids.map(k => CHAR_DEF[k].name).join('・') + '）'; g.appendChild(sec);
    const row = document.createElement('div'); row.className = 'row4'; g.appendChild(row);
    for (let k = 1; k <= 4; k++) {
      const v = (s - 1) * 4 + k; const ok = v <= (Save.d.unlocked || 1); const st = (V[v] || {}).stars || 0;
      const b = document.createElement('button'); b.className = 'dbt'; b.disabled = !ok;
      b.innerHTML = `<span class="n">${k}かいめ</span><span class="s">${KIND_OF_VISIT[k]}</span><span class="r">${'★'.repeat(st)}</span>`;
      b.onclick = () => { $('#days').classList.add('hide'); startVisit(v); };
      row.appendChild(b);
    }
  }
  $('#days').classList.remove('hide');
}
