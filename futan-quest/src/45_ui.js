// ================================================================ DQ-style window UI
const UI = {
  root: $('#ui'), stack: [], msgEl: null, typing: null,
  push(h) { this.stack.push(h); return h; },
  pop(h) { const i = this.stack.lastIndexOf(h); if (i >= 0) this.stack.splice(i, 1); },
  get busy() { return this.stack.length > 0; },
  input(k) { const h = this.stack[this.stack.length - 1]; if (h) { h.key(k); return true; } return false; },
  win(cls, style) { const e = document.createElement('div'); e.className = 'win ' + (cls || ''); if (style) Object.assign(e.style, style); e.style.pointerEvents = 'auto'; this.root.appendChild(e); return e; },
  // ---------------------------------------------- message window
  ensureMsg() {
    if (!this.msgEl) { const e = this.win('', {}); e.id = 'msg'; e.innerHTML = '<div class="tx"></div><div class="nx hide">▼</div>'; this.msgEl = e; e.addEventListener('pointerdown', ev => { ev.stopPropagation(); this.input('ok'); }); }
    this.msgEl.classList.remove('hide'); return this.msgEl;
  },
  hideMsg() { if (this.msgEl) { this.msgEl.classList.add('hide'); this.msgEl.querySelector('.tx').innerHTML = ''; } this.msgBuf = ''; },
  // text: string; pages separated by \n\n are shown one by one. opts.who, opts.auto (ms), opts.append (keep previous lines)
  async msg(text, opts) {
    opts = opts || {};
    const pages = String(text).split('\n\n');
    for (let p = 0; p < pages.length; p++) await this._page(pages[p], opts, p === pages.length - 1);
  },
  _page(text, opts, last) {
    return new Promise(res => {
      const e = this.ensureMsg(), tx = e.querySelector('.tx'), nx = e.querySelector('.nx');
      const who = opts.who ? `<span class="who">${opts.who}</span>「` : '';
      const full = text + (opts.who ? '」' : '');
      let prev = opts.append && this.msgBuf ? this.msgBuf + '\n' : '';
      // keep at most 4 lines in battle log style
      if (opts.append) { const ls = prev.split('\n').filter(Boolean); prev = ls.slice(-3).join('\n'); if (prev) prev += '\n'; }
      let i = 0, done = false, t0 = performance.now();
      const speed = opts.speed || GAME.textSpeed || 38;
      nx.classList.add('hide');
      if (opts.voice !== false) AU.speak((opts.who ? '' : '') + text);
      const render = () => { tx.innerHTML = prev + (who ? who : '') + esc(full.slice(0, i)); };
      const finish = () => {
        done = true; i = full.length; render(); this.msgBuf = prev + (opts.who ? opts.who + '「' : '') + full;
        if (opts.auto != null) { setTimeout(() => { this.pop(h); res(); }, opts.auto); return; }
        nx.classList.remove('hide');
      };
      const step = () => {
        if (done) return;
        const n = Math.floor((performance.now() - t0) / 1000 * speed);
        if (n > i) { i = Math.min(full.length, n); render(); if (i % 2 === 0) AU.text(); }
        if (i >= full.length) finish(); else requestAnimationFrame(step);
      };
      const h = this.push({
        msg: true,
        key: (k) => {
          if (k !== 'ok' && k !== 'cancel') return;
          if (!done) { finish(); return; }
          if (opts.auto != null) return;
          AU.cursor(); this.pop(h); nx.classList.add('hide'); res();
        }
      });
      render(); requestAnimationFrame(step);
    });
  },
  // ---------------------------------------------- selection list
  choose(items, opts) {
    opts = opts || {};
    return new Promise(res => {
      const e = this.win('', opts.style || {});
      if (opts.title) { const t = document.createElement('div'); t.className = 'ttl'; t.textContent = opts.title; e.appendChild(t); }
      const ul = document.createElement('ul'); ul.className = 'list' + (opts.cols ? ' cols' : ''); e.appendChild(ul);
      const its = items.map(it => typeof it === 'string' ? { label: it } : it);
      const lis = its.map((it, k) => {
        const li = document.createElement('li'); li.innerHTML = esc(it.label) + (it.right != null ? `<span class="r">${esc(String(it.right))}</span>` : '');
        if (it.disabled) li.classList.add('dis');
        li.addEventListener('pointerdown', ev => { ev.stopPropagation(); ev.preventDefault(); sel = k; draw(); pickIt(); });
        li.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse' && sel !== k) { sel = k; draw(); } });
        ul.appendChild(li); return li;
      });
      let sel = clamp(opts.sel || 0, 0, its.length - 1);
      const descEl = opts.desc ? opts.desc : null;
      const draw = () => { lis.forEach((li, k) => li.classList.toggle('sel', k === sel)); if (descEl) descEl.innerHTML = its[sel] && its[sel].desc ? esc(its[sel].desc) : ''; if (opts.onSel) opts.onSel(sel); };
      const close = () => { this.pop(h); if (!opts.keep) e.remove(); };
      const pickIt = () => { if (its[sel].disabled && !opts.allowDisabled) { AU.cancel(); return; } AU.ok(); close(); res(opts.keep ? { i: sel, el: e } : sel); };
      const cols = opts.cols ? 2 : 1;
      const h = this.push({
        key: (k) => {
          if (k === 'up') { sel = (sel - cols + its.length) % its.length; AU.cursor(); draw(); }
          else if (k === 'down') { sel = (sel + cols) % its.length; AU.cursor(); draw(); }
          else if (k === 'left' && cols > 1) { sel = Math.max(0, sel - 1); AU.cursor(); draw(); }
          else if (k === 'right' && cols > 1) { sel = Math.min(its.length - 1, sel + 1); AU.cursor(); draw(); }
          else if (k === 'ok') pickIt();
          else if (k === 'cancel' && opts.cancel !== false) { AU.cancel(); close(); res(opts.keep ? { i: -1, el: e } : -1); }
        }
      });
      draw();
    });
  },
  async yesno(q, opts) {
    if (q) await this.msg(q, opts);
    const r = await this.choose(['はい', 'いいえ'], { style: { right: 'max(16px,env(safe-area-inset-right))', bottom: 'calc(max(14px,env(safe-area-inset-bottom)) + 160px)', minWidth: '140px' } });
    return r === 0;
  },
  panel(html, style, cls) { const e = this.win(cls || '', style); e.innerHTML = html; return e; },
  clearAll() { for (const e of [...this.root.querySelectorAll('.win')]) if (e !== this.msgEl) e.remove(); this.stack.length = 0; this.hideMsg(); },
};
function esc(s) { return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]).replace(/\n/g, '<br>'); }
// global keys -> UI or field
const KEYS = new Set();
addEventListener('keydown', e => {
  AU.init();
  const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right', Enter: 'ok', Space: 'ok', KeyZ: 'ok', KeyE: 'ok', Escape: 'cancel', KeyX: 'cancel', Backspace: 'cancel', KeyM: 'menu', Tab: 'menu' };
  const k = map[e.code];
  if (k) e.preventDefault();
  if (!e.repeat) KEYS.add(e.code);
  if (GAME.onKey && GAME.onKey(k, e)) return;
  if (UI.busy) { if (k && (!e.repeat || ['up', 'down', 'left', 'right'].includes(k))) UI.input(k === 'menu' ? 'cancel' : k); return; }
  if (e.repeat) return;
  if (k === 'ok') FIELD.actPress = true;
  if (k === 'cancel' || k === 'menu') FIELD.menuPress = true;
});
addEventListener('keyup', e => KEYS.delete(e.code));
addEventListener('blur', () => KEYS.clear());
