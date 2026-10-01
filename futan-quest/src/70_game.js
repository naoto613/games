// ================================================================ game state / menus / main loop
const SAVE_KEY = 'futan-quest-v1';
const GAME = {
  mode: 'loading', party: [], gold: 0, bag: {}, ebag: [], flags: {}, save: { chests: {} }, textSpeed: 38, bspeed: 1, grassAway: false,
  // ---------------------------------------------- party / items
  member(id, lv) {
    const p = { id, lv: lv || 1, exp: expFor(lv || 1), hp: 0, mp: 0, eq: { w: { futan: 'toy', ricky: 'rattle', pochi: 'bone' }[id], a: { futan: 'smock', ricky: 'babywear', pochi: 'redcollar' }[id], s: null } };
    const s = pStats(p); p.hp = s.maxhp; p.mp = s.maxmp; return p;
  },
  join(id) {
    if (this.party.some(p => p.id === id)) return;
    const f = this.party[0];
    const lv = id === 'ricky' ? Math.max(1, f.lv - 1) : Math.max(1, f.lv);
    const m = this.member(id, lv);
    if (id === 'pochi') m.exp = Math.max(m.exp, Math.floor(f.exp * 0.9));
    this.party.push(m); syncFollowers(true); refreshLooks(); this.refreshHUD();
  },
  fullHeal() { for (const p of this.party) { const s = pStats(p); p.hp = s.maxhp; p.mp = s.maxmp; p.sleep = 0; } this.refreshHUD(); },
  addItem(id, n) { this.bag[id] = (this.bag[id] || 0) + (n || 1); },
  removeItem(id) { if (this.bag[id]) { this.bag[id]--; if (!this.bag[id]) delete this.bag[id]; } },
  useItem(id) { this.removeItem(id); },
  bagList(battle) { return Object.entries(this.bag).filter(([id, n]) => n > 0 && !ITEMS[id].key && (!battle || ITEMS[id].battle !== false)); },
  // ---------------------------------------------- save / load
  persist() {
    const P = FIELD.P;
    if (P && FIELD.area === 'world' && (this.mode === 'field' || this.mode === 'event')) this.save.pos = { x: +P.x.toFixed(2), z: +P.z.toFixed(2), h: +P.h.toFixed(3) };
    else if (FIELD.area !== 'world') this.save.pos = { dungeon: FIELD.area };
    const data = { party: this.party.map(p => ({ id: p.id, lv: p.lv, exp: p.exp, hp: p.hp, mp: p.mp, eq: p.eq })), gold: this.gold, bag: this.bag, ebag: this.ebag, flags: this.flags, save: this.save, opt: { voice: AU.voice, snd: AU.on, ts: this.textSpeed, bs: this.bspeed } };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { }
  },
  hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } },
  loadSave() {
    let d = null; try { d = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { }
    if (!d) return false;
    this.party = d.party.map(p => Object.assign(this.member(p.id, p.lv), p));
    this.gold = d.gold; this.bag = d.bag || {}; this.ebag = d.ebag || []; this.flags = d.flags || {}; this.save = Object.assign({ chests: {} }, d.save || {});
    if (d.opt) { AU.voice = d.opt.voice !== false; AU.on = d.opt.snd !== false; this.textSpeed = d.opt.ts || 38; this.bspeed = d.opt.bs || 1; }
    return true;
  },
  newGame() {
    this.party = [this.member('futan', 1)]; this.gold = 50; this.bag = { band: 2 }; this.ebag = []; this.flags = {}; this.save = { chests: {}, home: 'village' };
  },
  applyFlags() {
    const f = this.flags;
    if (f.bridge) fixBridge(false);
    if (f.barrier) { BARRIER.on = false; barrier.visible = false; }
    if (BOSSM.bear) { BOSSM.bear.visible = true; }
    if (f.bell && BOSSM.knight) BOSSM.knight.visible = false;
    if (f.king && BOSSM.king) BOSSM.king.visible = false;
    for (const id in DUNG) for (const c of DUNG[id].chests) if (this.save.chests[id + c.key]) c.model.userData.lid.rotation.x = -1.9;
    refreshLooks();
  },
  // ---------------------------------------------- HUD
  refreshHUD() {
    if (!this.party.length) return;
    $('#party').innerHTML = this.party.map(p => { const s = pStats(p); const low = p.hp > 0 && p.hp <= s.maxhp / 4; return `<div class="pc ${p.hp <= 0 ? 'dead' : low ? 'low' : ''}"><div class="nm">${CHARS[p.id].name}<i>Lv${p.lv}</i></div><div class="bar"><b style="width:${p.hp / s.maxhp * 100}%"></b></div><div class="nums"><span>HP ${p.hp}</span><span>MP ${p.mp}</span></div></div>`; }).join('');
    $('#gold').innerHTML = `<b>${this.gold}</b> G`;
    const q = this.quest(); $('#quest').textContent = q ? q[0] : '';
    this.goal = q ? q[1] : null;
  },
  quest() {
    const f = this.flags;
    if (f.sunback) return ['せかいに おひさまが もどった！ ありがとう ゆうしゃ ふーたん！', null];
    if (!f.bear) return ['ひがしの どんぐりの どうくつで リッキーを たすけよう', [SPOT.cave.x, SPOT.cave.z]];
    if (!f.bridge) return ['きたの こわれた はしを まほうの つみきで なおそう', [0, PL.bridge.z + 5]];
    if (!f.pochi && !f.elder) return ['はしを わたって にしの もりの まち ポプラへ', [PL.forest.x, PL.forest.z]];
    if (!f.elder) return ['ポプラの ちょうろうに はなしを きこう', [SPOT.elder.x, SPOT.elder.z]];
    if (!f.bell) return ['ひがしの みずうみの ほこらで ひかりの すずを さがそう', [PL.shrine.x, PL.shrine.z]];
    if (!f.barrier) return ['きたの まおうの しろへ。 やみの かべで すずを ならそう', [0, -196]];
    return ['まおうの しろで よふかし まおうを とめよう！', [SPOT.castle.x, SPOT.castle.z]];
  },
  tip(touch, keys) { const e = $('#hint'); e.innerHTML = isTouch ? touch : keys; e.style.opacity = '1'; this.tipT = 7; },
  // ---------------------------------------------- music
  musicForPlace(force) {
    if (this.mode === 'battle') return;
    let m;
    if (FIELD.area !== 'world') m = FIELD.area === 'castle' ? 'night' : 'dungeon';
    else {
      const P = FIELD.P; const inTown = ['village', 'forest'].some(k => Math.hypot(P.x - PL[k].x, P.z - PL[k].z) < PL[k].r + 6);
      m = inTown ? 'village' : darkAt(P.z) > 0.45 ? 'night' : 'field';
    }
    if (force || AU.curName !== m) AU.play(m);
  },
  // ---------------------------------------------- encounters
  async encounter(s) {
    this.mode = 'battle';
    const r = await startBattle({ zone: s.zone, first: s.id });
    if (r === 'lose') return this.defeated();
    if (r === 'win') removeSym(s); else FIELD.safeT = 3;
    await endBattleScene();
    this.mode = 'field'; this.musicForPlace(true); this.persist();
    await fadeIn(350);
  },
  async defeated() {
    await endBattleScene();
    UI.clearAll(); camRelease();
    this.gold = Math.floor(this.gold / 2);
    for (const p of this.party) { const s = pStats(p); p.hp = s.maxhp; p.mp = s.maxmp; }
    setArea('world');
    const home = this.save.home === 'forest' ? SPOT.inn2 : SPOT.inn1;
    initPlayer(home.x + Math.sin(home.h) * 2, home.z + Math.cos(home.h) * 2, home.h);
    this.mode = 'event'; AU.play('village');
    await fadeIn(900);
    await UI.msg('…ふーたんたちは やどやの ベッドで めを さました。');
    await UI.msg('やどやの ごしゅじん「たおれていた ところを はこんで きたんですよ。 ゴールドは はんぶん おせわ代に いただきました。 むりは いけませんよ。」');
    UI.hideMsg(); this.mode = 'field'; this.refreshHUD(); this.persist(); this.musicForPlace(true);
  },
  // ---------------------------------------------- inn
  async inn(price, where) {
    const cost = price * this.party.length;
    await UI.msg(`たびびとの やどへ ようこそ。 ひとばん おひるね ${cost}ゴールド ですが、 おとまりに なりますか？`, { who: 'やどやの ごしゅじん' });
    const g = UI.panel(`<b style="color:var(--gold);font-weight:400">${this.gold}</b> G`, { right: 'max(16px,env(safe-area-inset-right))', top: 'calc(max(10px,env(safe-area-inset-top)) + 48px)' });
    const ok = await UI.yesno(null); g.remove();
    if (!ok) { await UI.msg('またの おこしを おまちしております。', { who: 'やどやの ごしゅじん' }); return; }
    if (this.gold < cost) { await UI.msg('おや、 ゴールドが たりない ようですね…。 まものを やっつけると ゴールドが もらえますよ。', { who: 'やどやの ごしゅじん' }); return; }
    this.gold -= cost; UI.hideMsg();
    await fadeOut(800); AU.stop(0.5); AU.noResume = true; await AU.jingle('inn'); AU.noResume = false;
    this.fullHeal(); this.save.home = where; this.persist();
    this.musicForPlace(true); await fadeIn(800);
    await UI.msg('おはよう ございます。 ゆうべは よく ねむれましたか？\n\nぼうけんの きろくも つけて おきましたよ。 いってらっしゃいませ！', { who: 'やどやの ごしゅじん' });
  },
  // ---------------------------------------------- shop
  async shop(id) {
    const S = SHOPS[id];
    await UI.msg(S.hello, { who: S.title });
    const gw = UI.panel('', { right: 'max(16px,env(safe-area-inset-right))', top: 'calc(max(10px,env(safe-area-inset-top)) + 48px)' });
    const upd = () => gw.innerHTML = `<b style="color:var(--gold);font-weight:400">${this.gold}</b> G`; upd();
    try {
      while (true) {
        const c = await UI.choose(['かう', 'うる', 'やめる'], { style: { left: 'max(16px,env(safe-area-inset-left))', top: 'calc(max(10px,env(safe-area-inset-top)) + 48px)', minWidth: '140px' } });
        if (c === 0) await this.shopBuy(S, upd);
        else if (c === 1) await this.shopSell(upd);
        else break;
        UI.hideMsg();
      }
    } finally { gw.remove(); }
    await UI.msg('まいど ありがとう！ また きてね！', { who: S.title });
  },
  async shopBuy(S, upd) {
    let sel = 0;
    while (true) {
      const info = UI.panel('', { left: '50%', transform: 'translateX(-50%)', bottom: 'calc(max(14px,env(safe-area-inset-bottom)) + 150px)', fontSize: '15px', minWidth: 'min(92vw,420px)', lineHeight: '1.5' });
      const items = S.items.map(id => { const e = EQUIP[id], it = ITEMS[id]; return { id, label: (e || it).name, right: (e || it).price + 'G', disabled: (e || it).price > this.gold }; });
      const r = await UI.choose(items, { title: 'なにを かう？', sel, allowDisabled: true, style: { left: 'max(16px,env(safe-area-inset-left))', top: 'calc(max(10px,env(safe-area-inset-top)) + 48px)', minWidth: 'min(70vw,330px)', maxHeight: '52vh', overflowY: 'auto' }, onSel: i => { info.innerHTML = this.itemInfo(items[i].id); } });
      info.remove();
      if (r < 0) return;
      sel = r;
      const id = items[r].id, e = EQUIP[id], it = ITEMS[id], price = (e || it).price;
      if (price > this.gold) { AU.cancel(); await UI.msg('ゴールドが たりないみたい…。', { who: S.title }); continue; }
      if (e) {
        const who = this.party.filter(p => e.who.includes(p.id));
        if (!who.length) { await UI.msg('それは いまの なかまには そうび できないよ。', { who: S.title }); continue; }
        await UI.msg(`${e.name}だね。 ${price}ゴールド だけど いいかい？`, { who: S.title });
        if (!await UI.yesno(null)) continue;
        this.gold -= price; upd(); AU.chest();
        let p = who[0];
        if (who.length > 1) { const k = await UI.choose(who.map(q => CHARS[q.id].name), { title: 'だれが そうびする？', cancel: false, style: { left: '50%', top: '30%', transform: 'translateX(-50%)' } }); p = who[k]; }
        const old = p.eq[e.slot]; p.eq[e.slot] = id; if (old) this.ebag.push(old);
        refreshLooks(); this.refreshHUD();
        await UI.msg(`${CHARS[p.id].name}は ${e.name}を そうびした！` + (old ? `\n（${EQUIP[old].name}は ふくろに しまったよ）` : ''));
      } else {
        await UI.msg(`${it.name}だね。 ${price}ゴールド だよ。`, { who: S.title });
        if (!await UI.yesno(null)) continue;
        this.gold -= price; this.addItem(id, 1); upd(); AU.chest();
        await UI.msg(`${it.name}を かった！ （${this.bag[id]}こ もっている）`);
      }
      this.persist();
    }
  },
  itemInfo(id) {
    const e = EQUIP[id];
    if (!e) return esc(ITEMS[id].desc);
    const kind = { w: 'ぶき', a: 'よろい', s: 'たて' }[e.slot];
    const lines = [`${kind}：${e.slot === 'w' ? 'ちから' : 'まもり'} +${e.pow}`];
    for (const p of this.party) {
      if (!e.who.includes(p.id)) { lines.push(`${CHARS[p.id].name}：そうび できない`); continue; }
      const cur = p.eq[e.slot] ? EQUIP[p.eq[e.slot]].pow : 0, d = e.pow - cur;
      lines.push(`${CHARS[p.id].name}：${d > 0 ? '▲ ' + d + ' つよく なる' : d < 0 ? '▼ ' + (-d) + ' よわく なる' : 'かわらない'}`);
    }
    return lines.join('<br>');
  },
  async shopSell(upd) {
    while (true) {
      const list = [...this.bagList(false).map(([id, n]) => ({ id, label: ITEMS[id].name + (n > 1 ? ' ×' + n : ''), right: Math.floor(ITEMS[id].price / 2) + 'G', eq: false })), ...this.ebag.map((id, k) => ({ id, k, label: EQUIP[id].name, right: Math.floor((EQUIP[id].price || 40) / 2) + 'G', eq: true }))];
      if (!list.length) { await UI.msg('うれる ものを もっていないみたい。'); return; }
      const r = await UI.choose(list, { title: 'なにを うる？', style: { left: 'max(16px,env(safe-area-inset-left))', top: 'calc(max(10px,env(safe-area-inset-top)) + 48px)', minWidth: 'min(70vw,320px)', maxHeight: '52vh', overflowY: 'auto' } });
      if (r < 0) return;
      const x = list[r], price = parseInt(x.right);
      await UI.msg(`${x.label.split(' ×')[0]}を ${price}ゴールドで かいとるよ。 いいかい？`);
      if (!await UI.yesno(null)) continue;
      if (x.eq) this.ebag.splice(x.k, 1); else this.removeItem(x.id);
      this.gold += price; upd(); AU.chest(); this.persist();
    }
  },
  async offerEquip(id) {
    const e = EQUIP[id]; const who = this.party.filter(p => e.who.includes(p.id)); if (!who.length) return;
    const p = who[0];
    if (!await UI.yesno(`${CHARS[p.id].name}に ${e.name}を そうび させますか？`)) return;
    const old = p.eq[e.slot]; p.eq[e.slot] = id; this.ebag.splice(this.ebag.indexOf(id), 1); if (old) this.ebag.push(old);
    refreshLooks(); AU.ok();
    await UI.msg(`${CHARS[p.id].name}は ${e.name}を そうびした！`);
  },
  // ---------------------------------------------- field menu
  async fieldMenu() {
    FIELD.frozen = true; AU.ok();
    const st = { left: 'max(12px,env(safe-area-inset-left))', top: 'calc(max(10px,env(safe-area-inset-top)) + 84px)', minWidth: '150px' };
    let sel = 0;
    try {
      while (true) {
        const c = await UI.choose(['どうぐ', 'じゅもん', 'そうび', 'つよさ', 'せってい', 'きろく', 'とじる'], { style: st, sel, title: 'メニュー' });
        if (c < 0 || c === 6) break;
        sel = c;
        if (c === 0) { if (await this.menuItems()) break; }
        else if (c === 1) { if (await this.menuSpells()) break; }
        else if (c === 2) await this.menuEquip();
        else if (c === 3) await this.menuStatus();
        else if (c === 4) await this.menuOptions();
        else if (c === 5) { this.persist(); AU.jingle('item'); await UI.msg('ぼうけんの きろくを つけました。\n（つぎに あそぶときは 「つづきから」を えらんでね）'); UI.hideMsg(); }
        this.refreshHUD();
      }
    } finally { UI.hideMsg(); FIELD.frozen = false; this.refreshHUD(); }
  },
  async pickMember(filter, title) {
    const list = this.party.filter(filter || (() => true));
    if (!list.length) return null;
    if (list.length === 1 && !title) return list[0];
    const r = await UI.choose(list.map(p => ({ label: CHARS[p.id].name, right: `HP ${p.hp}/${pStats(p).maxhp}` })), { title: title || 'だれ？', style: { left: 'calc(max(12px,env(safe-area-inset-left)) + 170px)', top: 'calc(max(10px,env(safe-area-inset-top)) + 84px)' } });
    return r >= 0 ? list[r] : null;
  },
  async menuItems() {
    const list = Object.entries(this.bag).filter(([, n]) => n > 0);
    if (!list.length) { await UI.msg('なにも もっていない。'); UI.hideMsg(); return; }
    const desc = UI.panel('', { left: '50%', transform: 'translateX(-50%)', bottom: 'calc(max(14px,env(safe-area-inset-bottom)) + 150px)', fontSize: '15px', minWidth: '260px' });
    const r = await UI.choose(list.map(([id, n]) => ({ label: ITEMS[id].name, right: ITEMS[id].key ? '★' : n, desc: ITEMS[id].desc })), { title: 'どうぐ', desc, style: { left: 'calc(max(12px,env(safe-area-inset-left)) + 170px)', top: 'calc(max(10px,env(safe-area-inset-top)) + 84px)', maxHeight: '50vh', overflowY: 'auto' } });
    desc.remove();
    if (r < 0) return;
    const id = list[r][0], it = ITEMS[id];
    if (it.key) { await UI.msg(it.desc); UI.hideMsg(); return; }
    if (it.kind === 'home') {
      if (FIELD.area !== 'world' && false) return;
      this.removeItem(id); UI.clearAll();
      await UI.msg('ふうせんを ふくらませた！ ふわふわ〜…');
      UI.hideMsg(); await warpTo(this.flags.forest && await this.chooseTown() === 1 ? 'forest' : 'village'); return true;
    }
    const t = await this.pickMember(it.kind === 'revive' ? p => p.hp <= 0 : p => p.hp > 0, 'だれに つかう？'); if (!t) return;
    this.removeItem(id);
    const s = pStats(t);
    if (it.kind === 'heal') { const h = Math.min(s.maxhp - t.hp, it.pow); t.hp += h; AU.heal(); await UI.msg(`${CHARS[t.id].name}の HPが ${h} かいふくした！`); }
    else if (it.kind === 'mp') { const h = Math.min(s.maxmp - t.mp, it.pow); t.mp += h; AU.heal(); await UI.msg(`${CHARS[t.id].name}の MPが ${h} かいふくした！`); }
    else if (it.kind === 'revive') { t.hp = Math.ceil(s.maxhp / 2); AU.heal(); await UI.msg(`${CHARS[t.id].name}が げんきに なった！`); }
    UI.hideMsg(); this.refreshHUD(); this.persist();
  },
  async chooseTown() {
    const r = await UI.choose(['ひかりむら', 'もりの まち ポプラ'], { title: 'どこへ？', cancel: false, style: { left: '50%', top: '30%', transform: 'translateX(-50%)' } });
    return r;
  },
  async menuSpells() {
    const casters = this.party.filter(p => p.hp > 0 && spellsOf(p).some(s => SPELLS[s].field));
    if (!casters.length) { await UI.msg('いまは つかえる じゅもんが ない。'); UI.hideMsg(); return; }
    const p = await this.pickMember(q => casters.includes(q), 'だれが つかう？'); if (!p) return;
    const sp = spellsOf(p).filter(s => SPELLS[s].field);
    const r = await UI.choose(sp.map(s => ({ label: SPELLS[s].name, right: SPELLS[s].mp, disabled: p.mp < SPELLS[s].mp })), { title: 'MP ' + p.mp, style: { left: '50%', top: 'calc(max(10px,env(safe-area-inset-top)) + 84px)', transform: 'translateX(-50%)' } });
    if (r < 0) return;
    const s = SPELLS[sp[r]];
    if (p.mp < s.mp) { await UI.msg('MPが たりない！'); UI.hideMsg(); return; }
    if (s.kind === 'home') {
      if (FIELD.area !== 'world') { await UI.msg('ここでは つかえない！'); UI.hideMsg(); return; }
      const town = this.flags.forest ? await this.chooseTown() : 0;
      p.mp -= s.mp; UI.clearAll();
      await UI.msg(`${CHARS[p.id].name}は ${s.name}を となえた！`); UI.hideMsg(); await warpTo(town === 1 ? 'forest' : 'village'); return true;
    }
    if (s.kind === 'heal' && s.tgt === 'allies') { p.mp -= s.mp; AU.heal(); for (const t of this.party) if (t.hp > 0) t.hp = Math.min(pStats(t).maxhp, t.hp + Math.round(mr(s.pow[0], s.pow[1]))); await UI.msg(`${CHARS[p.id].name}は ${s.name}を となえた！ みんなの けがが なおった！`); }
    else if (s.kind === 'heal') { const t = await this.pickMember(q => q.hp > 0, 'だれに？'); if (!t) return; p.mp -= s.mp; const h = Math.min(pStats(t).maxhp - t.hp, Math.round(mr(s.pow[0], s.pow[1]))); t.hp += h; AU.heal(); await UI.msg(`${CHARS[t.id].name}の HPが ${h} かいふくした！`); }
    else if (s.kind === 'revive') { const t = await this.pickMember(q => q.hp <= 0, 'だれに？'); if (!t) { await UI.msg('たおれている なかまは いない。'); UI.hideMsg(); return; } p.mp -= s.mp; t.hp = Math.ceil(pStats(t).maxhp / 2); AU.heal(); await UI.msg(`${CHARS[t.id].name}が げんきに なった！`); }
    UI.hideMsg(); this.refreshHUD(); this.persist();
  },
  async menuEquip() {
    const p = await this.pickMember(null, 'だれの そうび？'); if (!p) return;
    while (true) {
      const slots = p.id === 'futan' ? ['w', 'a', 's'] : ['w', 'a'];
      const nm = { w: 'ぶき', a: 'よろい', s: 'たて' };
      const r = await UI.choose(slots.map(sl => ({ label: nm[sl] + '：' + (p.eq[sl] ? EQUIP[p.eq[sl]].name : 'なし') })), { title: CHARS[p.id].name + 'の そうび', style: { left: '50%', top: 'calc(max(10px,env(safe-area-inset-top)) + 84px)', transform: 'translateX(-50%)', minWidth: 'min(86vw,360px)' } });
      if (r < 0) return;
      const sl = slots[r];
      const cand = this.ebag.map((id, k) => [id, k]).filter(([id]) => EQUIP[id].slot === sl && EQUIP[id].who.includes(p.id));
      if (!cand.length) { await UI.msg('かえられる そうびを もっていない。'); UI.hideMsg(); continue; }
      const c = await UI.choose(cand.map(([id]) => ({ label: EQUIP[id].name, right: '+' + EQUIP[id].pow })), { title: 'どれに する？', style: { left: '50%', top: 'calc(max(10px,env(safe-area-inset-top)) + 240px)', transform: 'translateX(-50%)' } });
      if (c < 0) continue;
      const [id, k] = cand[c]; const old = p.eq[sl]; p.eq[sl] = id; this.ebag.splice(k, 1); if (old) this.ebag.push(old);
      refreshLooks(); AU.ok();
    }
  },
  async menuStatus() {
    const html = this.party.map(p => { const s = pStats(p); const nx = p.lv >= MAXLV ? '-' : expFor(p.lv + 1) - p.exp; return `<div style="min-width:180px"><div style="color:var(--gold)">${CHARS[p.id].name}</div><div style="font-size:.8em;color:#ccc">${CHARS[p.id].job}</div>レベル ${p.lv}<br>HP ${p.hp}/${s.maxhp}<br>MP ${p.mp}/${s.maxmp}<br>ちから ${s.atk}<br>まもり ${s.def}<br>すばやさ ${s.agi}<br><span style="font-size:.85em">つぎの レベルまで ${nx}</span><div style="font-size:.78em;color:#ddd;margin-top:6px;line-height:1.4">${EQUIP[p.eq.w].name}<br>${EQUIP[p.eq.a].name}${p.eq.s ? '<br>' + EQUIP[p.eq.s].name : ''}</div></div>`; }).join('');
    const w = UI.panel(`<div style="display:flex;gap:22px;flex-wrap:wrap;font-size:16px;line-height:1.55">${html}</div>`, { left: '50%', top: '50%', transform: 'translate(-50%,-50%)', maxWidth: '94vw', maxHeight: '86vh', overflowY: 'auto' });
    await new Promise(res => { const h = UI.push({ key: k => { if (k === 'ok' || k === 'cancel') { UI.pop(h); res(); } } }); w.addEventListener('pointerdown', e => { e.stopPropagation(); UI.pop(h); res(); }); });
    w.remove();
  },
  async menuOptions() {
    let sel = 0;
    while (true) {
      const r = await UI.choose([
        { label: 'よみあげ こえ', right: AU.voice ? 'ON' : 'OFF' }, { label: 'おと', right: AU.on ? 'ON' : 'OFF' },
        { label: 'もじの はやさ', right: this.textSpeed > 50 ? 'はやい' : this.textSpeed < 30 ? 'ゆっくり' : 'ふつう' }, { label: 'せんとうの はやさ', right: this.bspeed > 1.2 ? 'はやい' : 'ふつう' },
      ], { sel, title: 'せってい', style: { left: '50%', top: 'calc(max(10px,env(safe-area-inset-top)) + 84px)', transform: 'translateX(-50%)', minWidth: '300px' } });
      if (r < 0) break; sel = r;
      if (r === 0) { AU.voice = !AU.voice; if (!AU.voice) AU.hush(); }
      if (r === 1) AU.setOn(!AU.on);
      if (r === 2) this.textSpeed = this.textSpeed > 50 ? 22 : this.textSpeed < 30 ? 38 : 70;
      if (r === 3) this.bspeed = this.bspeed > 1.2 ? 1 : 1.6;
    }
    this.persist();
  },
  // ---------------------------------------------- title
  async title() {
    this.mode = 'title';
    $('#title').classList.remove('hide'); $('#hud').classList.add('hide'); $('#touch').classList.add('hide');
    $('#press').classList.remove('hide'); $('#tmenu').classList.add('hide');
    setArea('world'); setAtmos(0, true);
    this._titleWait = true;
  },
  async titleTap() {
    if (!this._titleWait) return;
    this._titleWait = false; AU.init(); AU.play('title'); AU.ok();
    $('#press').classList.add('hide');
    const has = this.hasSave();
    const tm = $('#tmenu'); tm.classList.remove('hide');
    const items = has ? ['つづきから', 'はじめから'] : ['はじめから'];
    // reuse UI.choose but render inside the title box
    tm.remove(); const r = await UI.choose(items, { cancel: false, style: { left: '50%', top: '66%', transform: 'translateX(-50%)', minWidth: '230px', fontSize: '22px' } });
    let fresh = items[r] === 'はじめから';
    if (fresh && has) { const ok = await UI.yesno('まえの きろくは きえて しまいます。 はじめから あそびますか？'); UI.hideMsg(); if (!ok) { this._titleWait = true; return this.titleTap(); } }
    $('#title').classList.add('hide');
    await this.start(fresh);
  },
  async start(fresh) {
    await fadeOut(600);
    $('#title').classList.add('hide'); this._titleWait = false;
    if (fresh || !this.loadSave()) { this.newGame(); fresh = true; }
    this.applyFlags();
    for (const p of this.party) partyModel(p.id);
    setArea('world');
    let x = SPOT.start.x, z = SPOT.start.z, h = Math.PI;
    const pos = this.save.pos;
    if (pos && pos.dungeon) { const sp = { cave: [SPOT.cave.x - 2.5, SPOT.cave.z, -Math.PI / 2], shrine: [PL.shrine.x, PL.shrine.z + 8.5, 0], castle: [SPOT.castle.x, SPOT.castle.z + 4, 0] }[pos.dungeon]; if (sp) [x, z, h] = sp; }
    else if (pos && pos.x != null) { x = pos.x; z = pos.z; h = pos.h; }
    initPlayer(x, z, h); refreshLooks();
    $('#hud').classList.remove('hide'); if (isTouch) $('#touch').classList.remove('hide');
    this.refreshHUD();
    if (fresh) { await openingScene(); return; }
    this.mode = 'field'; this.musicForPlace(true);
    await fadeIn(600);
    showArea('ぼうけんの つづき', 'CONTINUE');
  },
};
// ---------------------------------------------------------------- per-frame field logic
let trigBusy = false;
function updateTriggers() {
  const P = FIELD.P;
  for (const t of TRIG) {
    if (t.area !== FIELD.area) { t.inside = false; continue; }
    const inside = Math.hypot(P.x - t.x, P.z - t.z) < t.r;
    if (inside && !t.inside) {
      t.inside = true;
      if (t.once && GAME.flags[t.once]) continue;
      if (t.silent) { t.fn(t); continue; }
      if (trigBusy) { t.inside = false; continue; }
      trigBusy = true; FIELD.frozen = true;
      Promise.resolve(t.fn(t)).catch(e => console.error(e)).finally(() => { trigBusy = false; FIELD.frozen = false; UI.hideMsg(); });
    } else if (!inside) t.inside = false;
  }
}
let musicT = 0, saveT = 0;
function updateFieldLogic(dt) {
  if (FIELD.safeT > 0) FIELD.safeT -= dt;
  const t = !UI.busy && !FIELD.frozen ? nearestThing() : null;
  const hint = $('#hint');
  if (GAME.tipT > 0) { GAME.tipT -= dt; if (GAME.tipT <= 0) hint.style.opacity = '0'; }
  else if (t) { hint.innerHTML = `<b>${isTouch ? 'Ａ' : 'Enter'}</b>：${t.type === 'npc' ? 'はなす' : t.a.label}`; hint.style.opacity = '1'; }
  else hint.style.opacity = '0';
  $('#bA').classList.toggle('glow', !!t);
  $('#bA').textContent = t ? (t.type === 'npc' ? 'はなす' : t.a.label) : 'しらべる';
  if (FIELD.actPress) { FIELD.actPress = false; if (t && !UI.busy && !FIELD.frozen) doInteract(t); }
  if (FIELD.menuPress) { FIELD.menuPress = false; if (!UI.busy && !FIELD.frozen) GAME.fieldMenu(); }
  if (!FIELD.frozen && !UI.busy) updateTriggers();
  musicT -= dt; if (musicT <= 0) { musicT = 1; GAME.musicForPlace(false); }
  saveT -= dt; if (saveT <= 0) { saveT = 20; if (!FIELD.frozen && !UI.busy) GAME.persist(); }
}
function updateCompass() {
  const P = FIELD.P; if (!P) return;
  const fx = P.x - camera.position.x, fz = P.z - camera.position.z;
  const head = Math.atan2(fx, -fz), ppr = 110 / (Math.PI / 2);
  const strip = $('#compass .strip');
  const labels = [['きた', 0, 'n'], ['ひがし', Math.PI / 2], ['みなみ', Math.PI], ['にし', -Math.PI / 2]];
  let html = '';
  for (const [l, a, c] of labels) { const d = angWrap(a - head); if (Math.abs(d) < 1.6) html += `<span class="${c || ''}" style="left:${110 + d * ppr}px">${l}</span>`; }
  if (GAME.goal && FIELD.area === 'world') { const ga = Math.atan2(GAME.goal[0] - P.x, -(GAME.goal[1] - P.z)); const d = angWrap(ga - head); html += `<span class="goal" style="left:${110 + clamp(d, -1.0, 1.0) * ppr}px">★</span>`; }
  strip.innerHTML = html;
}
// ---------------------------------------------------------------- main loop
let last = performance.now(), TIME = 0, titleA = 0, hudT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; TIME += dt;
  skyU.uTime.value = TIME; WU.uTime.value = TIME; GU.uTime.value = TIME; BU.uTime.value = TIME;
  if (GAME.mode === 'loading') return;
  if (GAME.mode === 'title') {
    titleA += dt * 0.05;
    const c = PL.village, a = Math.PI + Math.sin(titleA) * 0.9, r = 58;
    camera.position.set(c.x + Math.sin(a) * r, c.h + 16 + Math.sin(titleA * 0.7) * 3, c.z + Math.cos(a) * r);
    camera.lookAt(c.x, c.h + 5, c.z + 4);
    for (const n of FIELD.npcs) if (n.area === 'world') { n.model.visible = true; animChar(n.model, dt, 0); }
  } else if (GAME.mode === 'battle') {
    updateBattleCam(dt, TIME);
  } else {
    updatePlayer(dt);
    updateNPCs(dt);
    if (GAME.mode === 'field') { updateSyms(dt); updateFieldLogic(dt); }
    else for (const s of FIELD.syms) animMonster(s.model, dt, false);
    updateCamera(dt);
    hudT -= dt; if (hudT <= 0) { hudT = 0.1; updateCompass(); }
  }
  if (areaTimer > 0) { areaTimer -= dt; if (areaTimer <= 0) $('#area').style.opacity = '0'; }
  // world atmosphere
  const P = FIELD.P;
  if (FIELD.area === 'world') {
    const z = GAME.mode === 'title' ? 100 : (BT.on ? BT.C.z : P ? P.z : 0);
    if (GAME.mode !== 'event' || !CAM.override || !GAME.flags.sunback) setAtmos(ATM.n < 0 ? darkAt(z) : damp(ATM.n, darkAt(z), 1.5, dt));
    const fx = BT.on ? BT.C : (P ? P.model.position : camera.position);
    updateSun(fx.x, fx.y || 0, fx.z);
    GU.uCenter.value.set(fx.x, fx.z);
    if (P && !GAME.grassAway) GU.uPlayer.value.copy(P.model.position); else GU.uPlayer.value.set(1e5, 0, 1e5);
    updateAmbient(dt, TIME);
    updateLights(TIME, darkAt(fx.z) > 0.3 ? TORCHES : null, 0xffa050);
    lantern.intensity = 0;
  } else {
    const d = DUNG[FIELD.area], th = THEMES[d.D.theme];
    updateLights(TIME, BT.on && BT.arena ? BT.arena.torches : d.torches, th.torch);
    const lp = BT.on ? BT.C : P.model.position;
    lantern.position.set(lp.x, 2.4, lp.z + (BT.on ? 0 : 0)); lantern.intensity = 1.3;
  }
  updateFX(dt);
  renderer.render(scene, camera);
}
// ---------------------------------------------------------------- boot
async function boot() {
  const bar = $('#loading .bar b'); const prog = async (k) => { bar.style.width = (k * 100) + '%'; await sleep(16); };
  try { await Promise.race([document.fonts.load('800 64px "Shippori Mincho B1"'), sleep(2500)]); await Promise.race([document.fonts.load('20px "DotGothic16"'), sleep(1500)]); } catch (e) { }
  await prog(0.05);
  buildTextures(); await prog(0.25);
  buildHeightmap(); await prog(0.4);
  buildTerrain(); buildWater(); await prog(0.5);
  buildGrass(); buildTrees(); await prog(0.65);
  buildAll(); await prog(0.75);
  for (const id in DMAPS) buildDungeon(id);
  for (const t of ['cave', 'shrine', 'castle', 'throne']) buildArena(t);
  await prog(0.85);
  buildEnv(); setAtmos(0, true);
  buildNPCs(); buildAmbient();
  await prog(0.95);
  FIELD.P = null;
  initPlayer(SPOT.start.x, SPOT.start.z, Math.PI); FIELD.P.model.visible = false;
  camera.position.set(0, 20, 220); camera.lookAt(0, 0, 178);
  try { renderer.compile(scene, camera); } catch (e) { }
  await prog(1);
  $('#loading').style.transition = 'opacity .6s'; $('#loading').style.opacity = '0'; setTimeout(() => $('#loading').remove(), 700);
  GAME.title();
  GAME.onKey = (k) => { if (GAME.mode === 'title' && GAME._titleWait && k) { GAME.titleTap(); return true; } return false; };
  $('#title').addEventListener('pointerdown', () => { if (GAME._titleWait) GAME.titleTap(); });
}
requestAnimationFrame(frame);
boot().catch(e => { console.error(e); $('#loading').innerHTML = '<div style="padding:20px;text-align:center;line-height:1.8">よみこみに しっぱい しました…<br><small>' + esc(e.message) + '</small></div>'; });
