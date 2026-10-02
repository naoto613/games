// ================================================================ UI widgets (dialog / choice / menu / skit / shop)
const UI = {
  stack: [],
  top() { return this.stack[this.stack.length - 1]; },
  push(w) { this.stack.push(w); clearPressed(); return w; },
  pop(w) { const i = this.stack.indexOf(w); if (i >= 0) this.stack.splice(i, 1); clearPressed(); },
  update(dt) { const w = this.top(); if (w) { w.update(dt); return true; } return false; },
};
// ---------------------------------------------------------------- dialog
UI.say = function (who, text, expr = 'normal', o = {}) {
  return new Promise(res => {
    const el = $('#dlg'); el.classList.remove('hide');
    const id = WHO[who] ? WHO[who].p : null;
    el.querySelector('.face').innerHTML = id ? portrait(id, expr) : '';
    el.querySelector('.nm').textContent = WHO[who] ? WHO[who].n : (who || '');
    const T = el.querySelector('.t'); T.innerHTML = '';
    const full = text; let shown = 0;
    const w = {
      t: 0, done: false,
      update(dt) {
        this.t += dt;
        if (!this.done) { shown = Math.min(full.length, shown + dt * 55); T.innerHTML = render(full.slice(0, Math.floor(shown))); if (shown >= full.length) this.done = true; }
        if (Input.pressed.ok || Input.pressed.cancel || this.click) { this.click = false; if (!this.done) { shown = full.length; T.innerHTML = render(full); this.done = true; } else { UI.pop(w); el.classList.add('hide'); el.onclick = null; Audio2.sfx('cursor'); res(); } }
      }
    };
    const render = s => s.replace(/\{(.+?)\}/g, '<b>$1</b>').replace(/\n/g, '<br>');
    el.onclick = () => { w.click = true; };
    UI.push(w);
  });
};
const WHO = {
  sieg: { n: 'ジーク', p: 'sieg' }, lucia: { n: 'リュシア', p: 'lucia' }, noa: { n: 'ノア', p: 'noa' }, garmo: { n: 'ガルモ', p: 'garmo' },
  elder: { n: 'ゴードン爺さん', p: 'elder' }, kid: { n: 'ピコ', p: 'kid' }, woman: { n: 'マーサ', p: 'woman' }, merchant: { n: 'ロッコ', p: 'merchant' },
  knight: { n: '帝国騎士', p: 'knight' }, assassin: { n: '赤眼の刺客', p: 'assassin' }, chef: { n: 'ふしぎなシェフ', p: 'chef' }, man: { n: '下町の男', p: null }, sys: { n: '', p: null },
};
// ---------------------------------------------------------------- choice
UI.choice = function (title, opts, cb, modal, onCancel) {
  const el = $('#choice'); el.classList.remove('hide');
  el.innerHTML = (title ? `<div style="font-family:'Shippori Mincho B1',serif;color:#e8c97a;padding:4px 12px 8px;letter-spacing:.1em;border-bottom:1px solid rgba(232,201,122,.3);margin-bottom:4px">${title}</div>` : '') + opts.map((o, i) => `<button data-i="${i}">${o}</button>`).join('');
  let sel = 0;
  const btns = [...el.querySelectorAll('button')];
  const paint = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
  paint();
  const close = (i) => { UI.pop(w); el.classList.add('hide'); if (i < 0) { Audio2.sfx('cancel'); onCancel && onCancel(); } else { Audio2.sfx('ok'); cb && cb(i); } };
  btns.forEach((b, i) => { b.onclick = () => close(i); b.onmouseenter = () => { sel = i; paint(); }; });
  const w = { update() { if (Input.pressed.u) { sel = (sel + btns.length - 1) % btns.length; paint(); Audio2.sfx('cursor'); } if (Input.pressed.d) { sel = (sel + 1) % btns.length; paint(); Audio2.sfx('cursor'); } if (Input.pressed.ok) close(sel); else if (Input.pressed.cancel && !modal) close(-1); } };
  UI.push(w);
};
UI.ask = (title, opts, modal) => new Promise(r => UI.choice(title, opts, i => r(i), modal, () => r(-1)));
UI.waitOk = function (cb, delay = 0) {
  let t = 0; const w = { update(dt) { t += dt; if (t > delay / 1000 && (Input.pressed.ok || Input.pressed.cancel || w.click)) { UI.pop(w); document.removeEventListener('pointerdown', onp); cb(); } } };
  const onp = () => { w.click = true; }; setTimeout(() => document.addEventListener('pointerdown', onp), delay);
  UI.push(w);
};
// ---------------------------------------------------------------- tips / toast / objective
function showTip(title, html, ms = 5000) { const t = $('#tip'); t.innerHTML = `<h5>${title}</h5>${html}`; t.classList.remove('hide'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.add('hide'), ms); }
function toast(text, ms = 1800) { const t = $('#toast'); t.innerHTML = text; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), ms); }
function setObjective(t) { S.objective = t; $('#objective').innerHTML = t || ''; }
function updateGold() { $('#gold').innerHTML = `<b>${S.lux}</b>LUX`; }

// ---------------------------------------------------------------- generic list menu helper
function listNav(items, sel, onPaint) {
  if (Input.pressed.u) { sel = (sel + items - 1) % items; Audio2.sfx('cursor'); onPaint(sel); }
  if (Input.pressed.d) { sel = (sel + 1) % items; Audio2.sfx('cursor'); onPaint(sel); }
  return sel;
}
// item use (field or battle)
UI.itemMenu = function (inBattle, onClose) {
  const M = $('#menu'); M.classList.remove('hide');
  const side = M.querySelector('.side'), main = M.querySelector('.main');
  let stage = 0, sel = 0, tsel = 0, keys = [];
  const chars = () => S.party.map(id => S.chars[id]);
  const paint = () => {
    keys = Object.keys(ITEMS).filter(k => S.items[k] > 0);
    side.innerHTML = `<h3>ITEMS</h3>` + chars().map((c, i) => `<button class="${stage === 1 && i === tsel ? 'sel' : ''}" data-t="${i}">${PARTY_DEF[c.id].name}<br><small style="color:#9aa6cc;font-family:Cinzel">HP ${c.hp}/${c.mhp} TP ${c.tp}/${c.mtp}</small></button>`).join('') + `<div class="info"><b>${S.lux}</b> LUX</div>`;
    main.innerHTML = `<h4>アイテム</h4>` + (keys.length ? `<div class="list">${keys.map((k, i) => `<div class="it ${i === sel ? 'sel' : ''}" data-i="${i}"><div>${ITEMS[k].name}<small>${ITEMS[k].desc}</small></div><div class="r">× ${S.items[k]}</div></div>`).join('')}</div>` : '<p>アイテムを持っていない</p>') + `<div class="hint">${stage === 0 ? '使うアイテムを選択' : '誰に使う？'}　${keyLabel('ok')}：決定　${Input.lastDevice === 'key' ? 'X/ESC' : 'B'}：戻る</div>`;
    main.querySelectorAll('.it').forEach(e => e.onclick = () => { sel = +e.dataset.i; stage = 1; Audio2.sfx('ok'); paint(); });
    side.querySelectorAll('button').forEach(e => e.onclick = () => { if (stage === 1) { tsel = +e.dataset.t; use(); } });
  };
  const use = () => {
    const k = keys[sel], c = chars()[tsel];
    if (!k) return;
    const ok = ITEMS[k].use(c);
    if (ok) { S.items[k]--; Audio2.sfx('item'); if (inBattle) { const f = Battle.allies.find(a => a.id === c.id); if (f && ITEMS[k].dead && c.hp > 0) { f.dead = false; f.state = 'idle'; f.down = 0; } } }
    else Audio2.sfx('cancel');
    if (!S.items[k]) stage = 0;
    sel = Math.min(sel, Math.max(0, Object.keys(ITEMS).filter(x => S.items[x] > 0).length - 1));
    paint();
  };
  paint();
  const w = {
    update() {
      if (stage === 0) { if (keys.length) sel = listNav(keys.length, sel, paint); if (Input.pressed.ok && keys.length) { stage = 1; Audio2.sfx('ok'); paint(); } else if (Input.pressed.cancel || Input.pressed.menu) close(); }
      else { tsel = listNav(S.party.length, tsel, paint); if (Input.pressed.ok) use(); else if (Input.pressed.cancel) { stage = 0; Audio2.sfx('cancel'); paint(); } }
    }
  };
  const close = () => { UI.pop(w); M.classList.add('hide'); Audio2.sfx('cancel'); onClose && onClose(); };
  UI.push(w);
};
UI.controls = function (onClose) {
  const M = $('#menu'); M.classList.remove('hide');
  M.querySelector('.side').innerHTML = '<h3>CONTROLS</h3><div class="info">戻る：' + keyLabel('ok') + '</div>';
  M.querySelector('.main').innerHTML = controlsHtml();
  UI.waitOk(() => { M.classList.add('hide'); onClose && onClose(); }, 200);
};
function controlsHtml() {
  return `<h4>操作説明</h4><div class="keys">
  <span><b>フィールド</b></span><span></span>
  <kbd>WASD / 矢印 / 左スティック</kbd><span>移動（SHIFT でゆっくり歩く）</span>
  <kbd>ドラッグ / U・P / 右スティック</kbd><span>カメラ回転</span>
  <kbd>Z / ENTER / Ⓐ</kbd><span>調べる・話す・決定</span>
  <kbd>TAB / BACK</kbd><span>スキットを見る</span>
  <kbd>ESC / M / START</kbd><span>メニュー</span>
  <span><b>バトル（リニアモーションバトル）</b></span><span></span>
  <kbd>← →</kbd><span>敵へのライン上を移動</span>
  <kbd>SHIFT / LT 押しっぱなし</kbd><span>フリーラン（自由に走る）</span>
  <kbd>Z / Ⓐ</kbd><span>通常攻撃（3連撃まで）</span>
  <kbd>X / Ⓑ ＋ 方向</kbd><span>術技（ニュートラル／前／上／下・空中）。特技 → 同じボタンで奥義へ連携</span>
  <kbd>SPACE / Ⓨ</kbd><span>ジャンプ（空中で攻撃・崩襲脚）</span>
  <kbd>C / Ⓧ 押しっぱなし</kbd><span>ガード</span>
  <kbd>R / LB</kbd><span>ターゲット切替</span>
  <kbd>Q / RB</kbd><span>オーバーリミット → もう一度でバーストアーツ</span>
  <kbd>E / RT</kbd><span>フェイタルストライク（敵に ★ が出たとき）</span>
  <kbd>ESC / START</kbd><span>バトルメニュー（アイテム・逃げる）</span>
  </div><p class="hint">スマホ：左側をドラッグで移動、右のボタンで操作。横持ち推奨。ゲームパッドにも対応しています。</p>`;
}

// ---------------------------------------------------------------- main menu (field)
function Game_openMenu() {
  Game.mode = 'menu';
  const M = $('#menu'); M.classList.remove('hide');
  const side = M.querySelector('.side'), main = M.querySelector('.main');
  const nearSave = Field.A && Field.A.save && Math.hypot(Field.A.save.x - Field.pos.x, Field.A.save.z - Field.pos.z) < 3.5;
  const items = ['ステータス', '術技', 'アイテム', '料理', nearSave ? 'セーブ' : '（セーブ：セーブポイントで）', '操作説明', 'タイトルへ', '閉じる'];
  let sel = 0;
  const fmtTime = t => { t = Math.floor(t); return `${Math.floor(t / 3600)}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
  const paintSide = () => {
    side.innerHTML = '<h3>MENU</h3>' + items.map((t, i) => `<button class="${i === sel ? 'sel' : ''}" data-i="${i}">${t}</button>`).join('') + `<div class="info"><b>${S.lux}</b> LUX<br>TIME ${fmtTime(S.time)}<br>BATTLES ${S.battles}<br>FATAL STRIKE ${S.fsCount}</div>`;
    side.querySelectorAll('button').forEach(b => { b.onclick = () => { sel = +b.dataset.i; paintSide(); act(); }; });
    preview();
  };
  const preview = () => {
    if (sel === 1) main.innerHTML = artesHtml();
    else if (sel === 5) main.innerHTML = controlsHtml();
    else main.innerHTML = statusHtml();
  };
  const act = () => {
    Audio2.sfx('ok');
    if (sel === 2) { UI.pop(w); M.classList.add('hide'); UI.itemMenu(false, () => Game_openMenu()); }
    else if (sel === 3) { UI.pop(w); M.classList.add('hide'); cookMenu(() => Game_openMenu()); }
    else if (sel === 4 && nearSave) { saveGame(); Audio2.sfx('save'); toast('セーブしました'); paintSide(); }
    else if (sel === 6) { UI.pop(w); M.classList.add('hide'); UI.choice('タイトルへ戻りますか？（セーブしていない進行は失われます）', ['戻る', 'やめる'], i => { if (i === 0) Game.toTitle(); else Game_openMenu(); }, false, () => Game_openMenu()); }
    else if (sel === 7) close();
  };
  const close = () => { UI.pop(w); M.classList.add('hide'); Game.mode = 'field'; Audio2.sfx('cancel'); };
  const w = { update() { sel = listNav(items.length, sel, paintSide); if (Input.pressed.ok) act(); else if (Input.pressed.cancel || Input.pressed.menu) close(); } };
  paintSide();
  UI.push(w);
};
function statusHtml() {
  return '<h4>ステータス</h4>' + S.party.map(id => {
    const c = S.chars[id], d = PARTY_DEF[id];
    return `<div class="stcard"><div class="fc">${portrait(id, 'normal')}</div><div style="flex:1"><div class="ttl">${d.title}</div><div class="nm">${d.full} <span class="cz" style="color:#e8c97a;font-size:13px">Lv ${c.lv}</span></div>
    <div class="st"><div>HP<b>${c.hp}/${c.mhp}</b></div><div>TP<b>${c.tp}/${c.mtp}</b></div><div>攻撃<b>${c.atk}</b></div><div>防御<b>${c.def}</b></div><div>術攻<b>${c.mat}</b></div><div>術防<b>${c.mdef}</b></div><div>NEXT<b>${expNext(c.lv) - c.exp}</b></div></div>
    <div style="font-size:12px;color:#b9c2dc;margin-top:4px">${d.desc}</div></div></div>`;
  }).join('');
}
function artesHtml() {
  const lv = S.chars.sieg.lv;
  const row = (lbl, k) => { const a = ARTES[k]; if (!a) return '<div class="x no">―</div>'; const ok = lv >= a.lv; return `<div class="x ${ok ? '' : 'no'}">${ok ? a.name : '？？？'} <small style="color:#9aa6cc">TP${a.tp}</small><br><small style="color:#9aa6cc">${ok ? a.desc : 'Lv' + a.lv + 'で習得'}</small></div>`; };
  let h = `<h4>ジークの術技</h4><div class="arte"><div></div><div class="h">特技 BASE</div><div class="h">奥義 ARCANE</div>`;
  for (const [d, l] of [['n', 'ニュートラル'], ['f', '前（敵の方向）'], ['u', '上'], ['d', '下'], ['air', '空中']]) h += `<div class="h" style="font-family:inherit;letter-spacing:0">${l}</div>${row(l, SLOTS[d][0])}${SLOTS[d][1] ? row(l, SLOTS[d][1]) : '<div class="x no">―</div>'}`;
  h += `</div><p class="hint">特技の後に術技ボタンで、入力方向の奥義へ連携。オーバーリミット中は何度でも連携できる。</p>`;
  h += `<div class="arte" style="grid-template-columns:120px 1fr"><div class="h">BURST ARTE</div><div class="x">${BURST.name}<br><small style="color:#9aa6cc">オーバーリミット中にもう一度リミットボタン</small></div><div class="h">MYSTIC ARTE</div><div class="x ${S.flags.mystic ? '' : 'no'}">${S.flags.mystic ? MYSTIC.name : '？？？'}<br><small style="color:#9aa6cc">${S.flags.mystic ? 'バーストアーツ中に術技ボタンを押し続ける' : '物語の中で目覚める'}</small></div></div>`;
  for (const id of S.party.filter(x => x !== 'sieg')) {
    h += `<h4 style="margin-top:12px">${PARTY_DEF[id].name}の術（自動で使用）</h4><div class="list">` + ALLY_KIT[id].spells.map(k => { const s = SPELLS[k]; const ok = S.chars[id].lv >= s.lv; return `<div class="it ${ok ? '' : 'off'}"><div>${ok ? s.name : '？？？'}<small>${ok ? ({ heal: '味方1人の HP を回復', healAll: '味方全員の HP を回復', revive: '戦闘不能を回復', pillar: '光の柱で敵を撃つ', fireballs: '火球を連続で放つ', icicle: '氷の刃で突き上げる', spark: '雷球で連続ダメージ', gaia: '大地を隆起させる上級術' })[s.kind] : 'Lv' + s.lv + 'で習得'}</small></div><div class="r">TP ${s.tp}</div></div>`; }).join('') + '</div>';
  }
  return h;
}
function cookMenu(onClose) {
  const M = $('#menu'); M.classList.remove('hide');
  const side = M.querySelector('.side'), main = M.querySelector('.main');
  let sel = 0; const keys = () => S.recipes;
  const paint = () => {
    side.innerHTML = `<h3>COOKING</h3>` + S.party.map(id => { const c = S.chars[id]; return `<div style="padding:4px 10px;font-size:13px">${PARTY_DEF[id].name}<br><small style="color:#9aa6cc;font-family:Cinzel">HP ${c.hp}/${c.mhp}　TP ${c.tp}/${c.mtp}</small></div>`; }).join('') + `<div class="info"><b>${S.lux}</b> LUX</div>`;
    main.innerHTML = `<h4>料理（食材代を払って全員で食べる）</h4><div class="list">${keys().map((k, i) => `<div class="it ${i === sel ? 'sel' : ''} ${S.lux < RECIPES[k].cost ? 'off' : ''}" data-i="${i}"><div>${RECIPES[k].name}<small>${RECIPES[k].desc}</small></div><div class="r">${RECIPES[k].cost} LUX</div></div>`).join('')}</div><p class="hint">各地に隠れている「ふしぎなシェフ」を見つけると、レシピが増える。</p>`;
    main.querySelectorAll('.it').forEach(e => e.onclick = () => { sel = +e.dataset.i; cook(); });
  };
  const cook = () => {
    const r = RECIPES[keys()[sel]];
    if (S.lux < r.cost) { Audio2.sfx('cancel'); toast('ルクスが足りない'); return; }
    S.lux -= r.cost; for (const id of S.party) r.fx(S.chars[id]);
    Audio2.sfx('heal'); toast(`${r.name}を作った！　${pick(['「うまい！」', '「おかわり！」', '「…悪くないわね」', '「美味しいです！」'])}`); updateGold(); paint();
  };
  paint();
  const w = { update() { sel = listNav(keys().length, sel, paint); if (Input.pressed.ok) cook(); else if (Input.pressed.cancel || Input.pressed.menu) { UI.pop(w); M.classList.add('hide'); Audio2.sfx('cancel'); onClose && onClose(); } } };
  UI.push(w);
}
function shopMenu() {
  return new Promise(res => {
    const M = $('#menu'); M.classList.remove('hide');
    const side = M.querySelector('.side'), main = M.querySelector('.main');
    const keys = Object.keys(ITEMS); let sel = 0;
    const paint = () => {
      side.innerHTML = `<h3>SHOP</h3><div style="padding:6px;font-size:13px;line-height:1.7">ロッコの道具屋<br><small style="color:#9aa6cc">「安くしとくぜ、下町価格だ！」</small></div><div class="info"><b>${S.lux}</b> LUX</div>`;
      main.innerHTML = `<h4>買い物</h4><div class="list">${keys.map((k, i) => `<div class="it ${i === sel ? 'sel' : ''} ${S.lux < ITEMS[k].price ? 'off' : ''}" data-i="${i}"><div>${ITEMS[k].name}<small>${ITEMS[k].desc}　（所持 ${S.items[k] || 0}）</small></div><div class="r">${ITEMS[k].price} LUX</div></div>`).join('')}</div><p class="hint">${keyLabel('ok')}：1個買う　戻る：${Input.lastDevice === 'key' ? 'X/ESC' : 'B'}</p>`;
      main.querySelectorAll('.it').forEach(e => e.onclick = () => { sel = +e.dataset.i; buy(); });
    };
    const buy = () => { const k = keys[sel]; if (S.lux < ITEMS[k].price) { Audio2.sfx('cancel'); return; } S.lux -= ITEMS[k].price; S.items[k] = (S.items[k] || 0) + 1; Audio2.sfx('buy'); updateGold(); paint(); };
    paint();
    const w = { update() { sel = listNav(keys.length, sel, paint); if (Input.pressed.ok) buy(); else if (Input.pressed.cancel || Input.pressed.menu) { UI.pop(w); M.classList.add('hide'); Audio2.sfx('cancel'); res(); } } };
    UI.push(w);
  });
}

// ---------------------------------------------------------------- skits
function playSkit(sk) {
  return new Promise(res => {
    Game.skitReady = null; $('#skitNote').classList.add('hide'); $('#tK').classList.add('hide');
    S.skitsSeen[sk.id] = 1;
    Audio2.sfx('skit');
    const el = $('#skit'); el.classList.remove('hide');
    el.querySelector('.ttl span').textContent = sk.title;
    const stage = el.querySelector('.stage'); stage.innerHTML = '';
    const cast = [...new Set(sk.lines.map(l => l[0]))];
    const panels = {};
    cast.forEach((id, i) => {
      const d = document.createElement('div'); d.className = 'pf in'; d.style.animationDelay = (i * 0.12) + 's';
      d.innerHTML = `<div class="fr">${portrait(id, 'normal', i === 0 && cast.length > 1 ? false : i % 2 === 1)}</div><div class="nm">${WHO[id].n}</div>`;
      stage.appendChild(d); panels[id] = d;
    });
    const txt = el.querySelector('.txt');
    let i = -1, shown = 0, full = '', holdT = 0;
    const next = () => {
      i++;
      if (i >= sk.lines.length) { UI.pop(w); el.classList.add('hide'); el.onclick = null; res(); return; }
      const [who, ex, text, anim] = sk.lines[i];
      for (const id in panels) panels[id].classList.toggle('on', id === who);
      const p = panels[who];
      p.querySelector('.fr').innerHTML = portrait(who, ex, cast.indexOf(who) % 2 === 1);
      p.classList.remove('jump', 'shake', 'in'); void p.offsetWidth; if (anim) p.classList.add(anim); else p.classList.add('jump');
      full = text; shown = 0; txt.innerHTML = `<span class="who">${WHO[who].n}</span>`;
    };
    const w = {
      update(dt) {
        if (shown < full.length) { shown = Math.min(full.length, shown + dt * 50); txt.innerHTML = `<span class="who">${WHO[sk.lines[i][0]].n}</span>${full.slice(0, Math.floor(shown))}`; }
        if (Input.held.cancel) { holdT += dt; if (holdT > 0.6) { i = sk.lines.length; next(); return; } } else holdT = 0;
        if (Input.pressed.ok || w.click) { w.click = false; if (shown < full.length) shown = full.length; else next(); }
      }
    };
    el.onclick = () => { w.click = true; };
    UI.push(w); next();
  });
}
function offerSkit(id) {
  const sk = SKITS[id]; if (!sk || S.skitsSeen[id]) return;
  Game.skitReady = Object.assign({ id }, sk);
  $('#skitTitle').textContent = sk.title; $('#skitKey').textContent = keyLabel('skit');
  $('#skitNote').classList.remove('hide');
  $('#skitNote').onclick = () => { if (Game.mode === 'field' && !Field.lock && Game.skitReady) Field.runEvent(() => playSkit(Game.skitReady)); };
  if (isTouch && Game.mode === 'field') $('#tK').classList.remove('hide');
  Audio2.sfx('skit');
  clearTimeout(Game._skT); Game._skT = setTimeout(() => { if (Game.skitReady && Game.skitReady.id === id) { Game.skitReady = null; $('#skitNote').classList.add('hide'); $('#tK').classList.add('hide'); } }, 40000);
}
