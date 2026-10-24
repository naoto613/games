// 戦闘画面：敵の行動予告と成立条件を見ながら、行動と因果編集を選ぶ
import {
  battleEditEnv, checkBattleEdit, doBattleEdit, editLimit, evalBattle, intentHolds, intentOf, resolveTurn, rewards, startBattle,
  tryEscape, writeBack, enemyAtk, enemyDef, type BattleState, type BEvent, type Command, type Fighter,
} from '../engine/battle';
import { BATTLE_MAP, ENEMY_MAP } from '../data/enemies';
import { ITEM_MAP } from '../data/items';
import { SKILL_MAP } from '../data/skills';
import { gainExp, addItem, marginMax, type GameState } from '../engine/state';
import { linkVisible, nodeVisible, type Op, type Target } from '../engine/causal';
import { el, btn, esc, bar, wait } from './dom';
import { drawEnemy } from './sprites';
import { sfx, playBgm } from './audio';
import { CausalEditor } from './editor';
import type { DialogUI } from './dialog';

export type BattleOutcome = 'win' | 'lose' | 'escape';

const STATUS_NAME: Record<string, string> = { charged: '溜め', broken: '崩れ', exposed: '弱点露見', bleed: '裂傷', sealed: '沈黙', stun: '気絶' };

const TUTORIAL: Record<string, string[]> = {
  first: [
    '敵の上に「次の行動」が予告されている。予告の下に並んでいるのは、その行動が成立するための条件だ。',
    '条件を崩せば、行動そのものが成立しなくなる。下の「因果編集」を開いて、「見えていれば噛みつく」という線を選び、「切断」してみよう。',
  ],
  beast: [
    '断絶獣は「矛盾が2つ以上」かつ「強化中」のとき、全体攻撃「断絶の咆哮」を放つ。',
    '対処法はいくつもある：攻撃で押し切る／矛盾の線を切断して数を減らす／矛盾を味方の力に繋ぎ替えて強化を奪う／ドランの「崩し」で強化を解く／（使えれば）咆哮を保留する。',
  ],
  king: [
    '沈黙の王は攻撃を受けるたびに石を纏い、防御が上がっていく。',
    '碑文の言葉を思い出そう。「打たれることではなく、知られること」。因果を確かめ、鐘楼の仕掛け（分銅）も使える。',
  ],
};

export class BattleUI {
  private root: HTMLDivElement;
  private b!: BattleState;
  private cmds: Command[] = [];
  private actorIdx = 0;
  private pick: null | { kind: 'attack' | 'skill' | 'item' | 'device'; id?: string; side: 'enemy' | 'ally' } = null;
  private busy = false;
  private resolve!: (r: BattleOutcome) => void;
  private editor: CausalEditor | null = null;
  private logLines: string[] = [];
  private enemyCanvases = new Map<string, HTMLCanvasElement>();
  private raf = 0;
  private t = 0;
  private snapshot = '';

  constructor(private parent: HTMLElement, private s: GameState, private dlg: DialogUI, private onSave: () => void) {
    this.root = el('div', 'battle');
  }

  run(battleId: string): Promise<BattleOutcome> {
    const def = BATTLE_MAP.get(battleId)!;
    this.snapshot = JSON.stringify(this.s);
    this.b = startBattle(def, this.s, (Date.now() ^ (this.s.playtime * 1000)) >>> 0);
    this.root.className = 'battle bg-' + def.bg + (def.boss ? ' boss' : '');
    this.parent.append(this.root);
    document.body.dataset.mode = 'battle';
    playBgm(def.boss ? 'boss' : 'battle');
    sfx('encounter');
    this.cmds = [];
    this.actorIdx = this.firstActor(0);
    this.logLines = [];
    const names = this.b.enemies.map(e => e.name).join('、');
    this.log(`${names}が現れた！`);
    this.render();
    this.loop();
    return new Promise(r => {
      this.resolve = r;
      void this.tutorial(def.tutorial);
    });
  }

  private async tutorial(kind?: string): Promise<void> {
    let key = kind;
    if (!key && this.b.enemies.some(e => e.tpl === 'beast')) key = 'beast';
    if (!key || this.s.flags['tut:' + key]) return;
    this.s.flags['tut:' + key] = 1;
    this.busy = true;
    for (const line of TUTORIAL[key]) await this.dlg.say('', line);
    this.busy = false;
    this.render();
  }

  private loop = () => {
    this.t += 1 / 60;
    for (const e of this.b.enemies) {
      const cv = this.enemyCanvases.get(e.uid);
      if (!cv) continue;
      const g = cv.getContext('2d')!;
      g.clearRect(0, 0, cv.width, cv.height);
      if (e.alive) drawEnemy(g, ENEMY_MAP.get(e.tpl!)!.art, cv.width / 2, cv.height / 2, cv.width * 0.92, this.t, Number(e.uid.slice(1)) + 1);
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  private firstActor(from: number): number {
    for (let i = from; i < this.b.party.length; i++) if (this.b.party[i].alive && !(this.b.party[i].st.stun > 0)) return i;
    return -1;
  }

  private log(t: string): void {
    this.logLines.push(t);
    if (this.logLines.length > 3) this.logLines.shift();
  }

  // ---------- 描画 ----------

  private intentHtml(e: Fighter): string {
    const plan = this.b.planned[e.uid];
    if (!plan || !e.alive) return '';
    const it = intentOf(e, plan.intent)!;
    const env = battleEditEnv(this.b, this.s);
    const rule = ENEMY_MAP.get(e.tpl!)!.rule;
    let html = `<div class="intent ${it.kind === 'aoe' ? 'danger' : ''}"><div class="it-name">▶ ${esc(it.name)}<small>${esc(it.desc)}</small></div>`;
    if (rule && this.b.def.boss) html += `<div class="it-rule">${esc(rule)}</div>`;
    if (plan.carried) html += `<div class="it-cond carried">次のターンに持ち越し中</div>`;
    else if (it.node) {
      const nodeId = `${e.uid}.${it.node}`;
      const res = evalBattle(this.b);
      const conds = this.b.graph.links.filter(l => l.to === nodeId && (l.type ?? 'cause') === 'cause');
      const inh = this.b.graph.links.filter(l => l.to === nodeId && l.type === 'inhibit');
      const parts: string[] = [];
      for (const l of conds) {
        const n = this.b.graph.nodes.find(x => x.id === l.from)!;
        const vis = nodeVisible(n, env) && linkVisible(this.b.graph, l, this.b.edit, env);
        const st = this.b.edit.links[l.id] ?? l.state;
        if (st === 'possible') continue;
        const ok = st === 'intact' && res.active.has(n.id);
        parts.push(`<span class="${ok ? 'ok' : 'ng'}">${vis ? esc(n.label) : '？？？'} ${st === 'severed' ? '✂' : ok ? '✓' : '✗'}</span>`);
      }
      for (const l of inh) {
        const n = this.b.graph.nodes.find(x => x.id === l.from)!;
        if (res.active.has(n.id) && (this.b.edit.links[l.id] ?? l.state) === 'intact') parts.push(`<span class="ng">${esc(n.label)}で打ち消し</span>`);
      }
      if (nodeId in this.b.edit.held) parts.push('<span class="held">保留中 ⏸</span>');
      html += `<div class="it-cond">条件：${parts.join(' ') || '（常に成立）'}</div>`;
      if (!(nodeId in this.b.edit.held) && !intentHolds(this.b, e, it)) html += `<div class="it-fail">→ 条件不成立：このままなら失敗する</div>`;
    }
    return html + '</div>';
  }

  private render(): void {
    const b = this.b;
    this.root.innerHTML = '';
    const top = el('div', 'b-enemies');
    for (const e of b.enemies) {
      const tpl = ENEMY_MAP.get(e.tpl!)!;
      const card = el('div', 'b-enemy' + (e.alive ? '' : ' dead') + (this.pick?.side === 'enemy' && e.alive ? ' pickable' : ''));
      card.dataset.uid = e.uid;
      let cv = this.enemyCanvases.get(e.uid);
      if (!cv) { cv = document.createElement('canvas'); cv.width = cv.height = 200; this.enemyCanvases.set(e.uid, cv); }
      const st = Object.keys(e.st).map(k => `<span class="chip">${STATUS_NAME[k] ?? k}</span>`).join('');
      const extra = e.stacks ? `<span class="chip">${tpl.nodes.some(n => n.effect?.includes('stackDef')) ? `石×${e.stacks}` : `頁×${e.stacks}`}</span>` : '';
      card.innerHTML = `${this.intentHtml(e)}`;
      card.append(cv);
      const info = el('div', 'e-info', `<div class="e-name">${esc(e.name)} ${st}${extra}</div>${bar(e.hp, e.maxHp, 'hp')}<div class="e-num">${e.hp}/${e.maxHp}　攻${Math.round(enemyAtk(b, e))} 防${Math.round(enemyDef(e))}</div>`);
      card.append(info);
      card.addEventListener('click', () => this.onPickEnemy(e));
      top.append(card);
    }
    const logBox = el('div', 'b-log', this.logLines.map(l => `<div>${esc(l)}</div>`).join(''));
    const party = el('div', 'b-party');
    b.party.forEach((p, i) => {
      const st = Object.keys(p.st).map(k => `<span class="chip">${STATUS_NAME[k] ?? k}</span>`).join('');
      const c = el('div', 'b-member' + (p.alive ? '' : ' dead') + (i === this.actorIdx && !this.busy ? ' active' : '') + (this.pick?.side === 'ally' && p.alive ? ' pickable' : ''));
      c.dataset.uid = p.uid;
      const chosen = this.cmds.find(x => x.actor === p.uid);
      c.innerHTML = `<div class="m-name">${esc(p.name)} ${st}</div>${bar(p.hp, p.maxHp, 'hp')}<div class="m-num">HP ${p.hp}/${p.maxHp}</div>${bar(p.ap, p.maxAp, 'ap')}<div class="m-num">AP ${p.ap}/${p.maxAp}</div>${chosen ? `<div class="m-cmd">${esc(this.cmdLabel(chosen))}</div>` : ''}`;
      c.addEventListener('click', () => this.onPickAlly(p));
      party.append(c);
    });
    const cmd = el('div', 'b-cmd');
    if (!this.busy && !b.result) this.renderCommands(cmd);
    const header = el('div', 'b-head', `<span>ターン ${b.turn}</span><span class="pill margin">余白 <b>${b.margin}</b></span>`);
    this.root.append(header, top, logBox, party, cmd);
  }

  private cmdLabel(c: Command): string {
    if (c.kind === 'attack') return '攻撃';
    if (c.kind === 'defend') return '防御';
    if (c.kind === 'skill') return SKILL_MAP.get(c.skill)!.name;
    if (c.kind === 'item') return ITEM_MAP.get(c.item)!.name;
    return this.b.def.devices?.find(d => d.id === c.device)?.name ?? '環境';
  }

  private renderCommands(box: HTMLElement): void {
    const b = this.b;
    const actor = b.party[this.actorIdx];
    const editsLeft = editLimit(this.s) - b.editsThisTurn;
    const top = el('div', 'cmd-row top');
    const ed = btn(`因果編集 <small>残り${editsLeft}回</small>`, 'edit-btn' + (editsLeft > 0 ? ' glow' : ''), () => this.openEditor());
    top.append(ed);
    if (this.cmds.length > 0) top.append(btn('← 戻る', 'small', () => { this.cmds.pop(); this.actorIdx = this.nextAfterCmds(); this.pick = null; this.render(); }));
    if (!b.def.boss) top.append(btn('逃げる', 'small', () => this.escape()));
    box.append(top);
    if (!actor) return;
    if (this.pick) {
      const p = el('div', 'cmd-row');
      p.append(el('div', 'pick-msg', this.pick.side === 'enemy' ? '対象の敵をタップ' : '対象の味方をタップ'), btn('キャンセル', 'small', () => { this.pick = null; this.render(); }));
      box.append(p);
      return;
    }
    const row = el('div', 'cmd-row');
    row.append(el('div', 'who', `${esc(actor.name)}の行動`));
    row.append(btn('攻撃', 'cmd', () => this.choose({ kind: 'attack', side: 'enemy' })));
    const skills = this.s.members[actor.char!]!.skills.map(id => SKILL_MAP.get(id)!).filter(sk => sk.ap);
    if (skills.length) row.append(btn('スキル', 'cmd', () => this.skillMenu(box)));
    row.append(btn('防御', 'cmd', () => this.push({ actor: actor.uid, kind: 'defend' })));
    row.append(btn('道具', 'cmd', () => this.itemMenu(box)));
    if (b.def.devices?.length) {
      for (const d of b.def.devices) {
        const cd = b.deviceCd[d.id] ?? 0;
        const already = this.cmds.some(c => c.kind === 'device' && c.device === d.id);
        const bb = btn(`${esc(d.name)}${cd ? `<small>あと${cd}</small>` : ''}`, 'cmd env', () => this.choose({ kind: 'device', id: d.id, side: 'enemy' }));
        bb.disabled = cd > 0 || already;
        bb.title = d.desc;
        row.append(bb);
      }
    }
    box.append(row);
  }

  private nextAfterCmds(): number {
    for (let i = 0; i < this.b.party.length; i++) {
      const p = this.b.party[i];
      if (!p.alive || p.st.stun > 0) continue;
      if (!this.cmds.some(c => c.actor === p.uid)) return i;
    }
    return -1;
  }

  private skillMenu(box: HTMLElement): void {
    const actor = this.b.party[this.actorIdx];
    box.innerHTML = '';
    const list = el('div', 'cmd-list');
    for (const id of this.s.members[actor.char!]!.skills) {
      const sk = SKILL_MAP.get(id)!;
      if (!sk.ap) continue;
      const sealed = (actor.st.sealed ?? 0) > 0;
      const b = btn(`${esc(sk.name)} <small>AP${sk.ap}</small><span>${esc(sk.desc)}</span>`, 'list-item', () => {
        if (sk.target === 'enemy') this.choose({ kind: 'skill', id, side: 'enemy' });
        else if (sk.target === 'ally') this.choose({ kind: 'skill', id, side: 'ally' });
        else this.push({ actor: actor.uid, kind: 'skill', skill: id, target: actor.uid });
      });
      b.disabled = actor.ap < sk.ap || sealed;
      list.append(b);
    }
    list.append(btn('戻る', 'small', () => this.render()));
    box.append(list);
  }

  private itemMenu(box: HTMLElement): void {
    const actor = this.b.party[this.actorIdx];
    box.innerHTML = '';
    const list = el('div', 'cmd-list');
    const reserved = (id: string) => this.cmds.filter(c => c.kind === 'item' && c.item === id).length;
    let any = false;
    for (const [id, n] of Object.entries(this.s.inv)) {
      const it = ITEM_MAP.get(id);
      if (!it?.use?.battle || n - reserved(id) <= 0) continue;
      any = true;
      list.append(btn(`${esc(it.name)} ×${n - reserved(id)}<span>${esc(it.desc)}</span>`, 'list-item', () => {
        if (it.use!.target === 'ally') this.choose({ kind: 'item', id, side: 'ally' });
        else this.push({ actor: actor.uid, kind: 'item', item: id, target: actor.uid });
      }));
    }
    if (!any) list.append(el('div', 'hint', '戦闘で使える道具がない。'));
    list.append(btn('戻る', 'small', () => this.render()));
    box.append(list);
  }

  private choose(p: NonNullable<BattleUI['pick']>): void {
    const alive = (p.side === 'enemy' ? this.b.enemies : this.b.party).filter(f => f.alive);
    if (alive.length === 1 && p.side === 'enemy') { this.finishPick(alive[0]); return; }
    this.pick = p;
    sfx('select');
    this.render();
  }

  private onPickEnemy(e: Fighter): void {
    if (!this.pick || this.pick.side !== 'enemy' || !e.alive) return;
    this.finishPick(e);
  }

  private onPickAlly(p: Fighter): void {
    if (!this.pick || this.pick.side !== 'ally' || !p.alive) return;
    this.finishPick(p);
  }

  private finishPick(target: Fighter): void {
    const actor = this.b.party[this.actorIdx];
    const p = this.pick ?? { kind: 'attack' as const, side: 'enemy' as const };
    this.pick = null;
    if (p.kind === 'attack') this.push({ actor: actor.uid, kind: 'attack', target: target.uid });
    else if (p.kind === 'skill') this.push({ actor: actor.uid, kind: 'skill', skill: p.id!, target: target.uid });
    else if (p.kind === 'item') this.push({ actor: actor.uid, kind: 'item', item: p.id!, target: target.uid });
    else if (p.kind === 'device') this.push({ actor: actor.uid, kind: 'device', device: p.id!, target: target.uid });
  }

  private push(c: Command): void {
    sfx('select');
    this.cmds.push(c);
    this.actorIdx = this.nextAfterCmds();
    if (this.actorIdx < 0) void this.execute();
    else this.render();
  }

  // ---------- 因果編集 ----------

  private async openEditor(): Promise<void> {
    const b = this.b;
    const deadPrefixes = b.enemies.filter(e => !e.alive).map(e => e.uid + '.');
    const ed = new CausalEditor(this.root, b.graph, b.edit, () => battleEditEnv(b, this.s), {
      kind: 'battle',
      editsLeft: () => editLimit(this.s) - b.editsThisTurn,
      expiry: () => b.expiry,
      hiddenNode: id => deadPrefixes.some(p => id.startsWith(p)),
      groups: b.enemies.filter(e => e.alive).map(e => ({ label: e.name, prefix: e.uid + '.' })),
      predict: this.s.party.some(c => this.s.members[c]!.skills.includes('s_predict')),
      nodeNote: id => {
        const e = b.enemies.find(x => id.startsWith(x.uid + '.'));
        if (!e) return null;
        const plan = b.planned[e.uid];
        const it = plan && intentOf(e, plan.intent);
        if (it && it.node && `${e.uid}.${it.node}` === id) return `${e.name}が予告中`;
        if (id.endsWith('.see') || id.endsWith('.bite')) return e.name;
        return null;
      },
      apply: (t: Target, op: Op) => this.applyEdit(t, op),
    });
    this.editor = ed;
    await ed.open();
    this.editor = null;
    this.render();
  }

  private applyEdit(t: Target, op: Op): void {
    const chk = checkBattleEdit(this.b, this.s, t, op);
    if (!chk.ok) return;
    const ev = doBattleEdit(this.b, this.s, t, op);
    for (const e of ev) if (e.t === 'edit' || e.t === 'log') this.log(e.text);
    this.editor?.setEdit(this.b.edit);
    if (this.b.result === 'win') { this.editor?.close(null); void this.finish(); }
  }

  // ---------- 解決 ----------

  private async execute(): Promise<void> {
    this.busy = true;
    this.render();
    const ev = resolveTurn(this.b, this.s, this.cmds);
    this.cmds = [];
    await this.play(ev);
    this.busy = false;
    if (this.b.result) { await this.finish(); return; }
    this.actorIdx = this.firstActor(0);
    if (this.actorIdx < 0) {
      // 全員動けない：そのままターンを進める
      void this.execute();
      return;
    }
    this.render();
  }

  private async play(ev: BEvent[]): Promise<void> {
    const k = (window as unknown as { GAME_FAST?: boolean }).GAME_FAST ? 0.1 : 1;
    const w = (ms: number) => wait(ms * k);
    for (const e of ev) {
      switch (e.t) {
        case 'log': case 'edit': this.log(e.text); this.render(); await w(e.t === 'edit' ? 260 : 400); break;
        case 'act': this.flashCard(e.uid, 'acting'); await w(100); break;
        case 'dmg': sfx(e.big ? 'crit' : 'hit'); this.render(); this.floatNum(e.uid, String(e.amount), 'dmg'); this.flashCard(e.uid, 'shake'); await w(240); break;
        case 'heal': sfx('heal'); this.render(); this.floatNum(e.uid, '+' + e.amount, 'heal'); await w(240); break;
        case 'fail': sfx('fail'); this.render(); this.stamp(e.uid, e.text); await w(700); break;
        case 'death': sfx('death'); this.render(); await w(260); break;
        case 'revive': sfx('revive'); this.render(); await w(300); break;
      }
    }
    this.render();
  }

  private cardOf(uid: string): HTMLElement | null {
    return this.root.querySelector(`[data-uid="${uid}"]`);
  }

  private flashCard(uid: string, cls: string): void {
    const c = this.cardOf(uid);
    if (!c) return;
    c.classList.remove(cls);
    void c.offsetWidth;
    c.classList.add(cls);
  }

  private floatNum(uid: string, txt: string, cls: string): void {
    const c = this.cardOf(uid);
    if (!c) return;
    const f = el('div', 'float ' + cls, txt);
    c.append(f);
    setTimeout(() => f.remove(), 900);
  }

  private stamp(uid: string, txt: string): void {
    const c = this.cardOf(uid);
    if (!c) return;
    const f = el('div', 'stamp', esc(txt) + '！');
    c.append(f);
    setTimeout(() => f.remove(), 1200);
  }

  private async escape(): Promise<void> {
    this.busy = true;
    const ev = tryEscape(this.b, this.s);
    await this.play(ev);
    this.busy = false;
    if (this.b.result) { await this.finish(); return; }
    this.cmds = [];
    this.actorIdx = this.firstActor(0);
    this.render();
  }

  private async finish(): Promise<void> {
    const b = this.b;
    cancelAnimationFrame(this.raf);
    if (b.result === 'win') {
      sfx('victory');
      const r = rewards(b);
      writeBack(b, this.s);
      this.s.gold += r.gold;
      const before = this.s.margin;
      this.s.margin = Math.min(this.s.margin + r.margin, 99);
      this.s.margin = Math.min(this.s.margin, marginMax(this.s));
      for (const d of r.drops) addItem(this.s, d);
      const lv = gainExp(this.s, r.exp);
      if (lv.length) sfx('levelup');
      const html = `<h2>勝利</h2><div class="rw">経験値 +${r.exp}　灰貨 +${r.gold}${this.s.margin > before ? `　余白 +${this.s.margin - before}` : ''}</div>
        ${r.drops.length ? `<div class="rw">入手：${r.drops.map(d => esc(ITEM_MAP.get(d)!.name)).join('、')}</div>` : ''}
        ${lv.map(l => `<div class="lv">${esc(l)}</div>`).join('')}`;
      await this.dlg.panel(html, ['つづける'], 'victory');
      this.close('win');
    } else if (b.result === 'escape') {
      writeBack(b, this.s);
      this.close('escape');
    } else {
      const i = await this.dlg.panel('<h2>全滅……</h2><p>結果だけが残り、原因は失われた。</p>', ['戦闘をやり直す', '最後のセーブから再開']);
      if (i === 0) {
        Object.assign(this.s, JSON.parse(this.snapshot));
        this.root.remove();
        const r = await new BattleUI(this.parent, this.s, this.dlg, this.onSave).run(b.def.id);
        this.resolve(r);
      } else {
        this.close('lose');
      }
    }
  }

  private close(r: BattleOutcome): void {
    cancelAnimationFrame(this.raf);
    this.root.remove();
    this.resolve(r);
  }
}
