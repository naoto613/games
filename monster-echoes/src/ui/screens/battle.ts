import { getArea } from '../../data/areas';
import { getItem, ITEM_LIST } from '../../data/items';
import { getSpecies } from '../../data/monsters';
import { getSkill } from '../../data/skills';
import type { BattleSession, BattleSummary } from '../../application/Game';
import type { AllyCommand, BattleEvent, BattleState, Combatant, PlayerAction, TurnInput } from '../../domain/battle/types';
import { playBgm, sfx } from '../../infrastructure/audio/Sound';
import type { App, Key, Screen } from '../App';
import { btn, clear, h, sleep } from '../dom';
import { monsterSprite } from '../gfx/monsters';
import { mkCanvas } from '../gfx/Pix';
import { BD_H, BD_W, backdrop } from '../gfx/backdrops';
import { TACTICS, welcomeMonster, resolvePending } from './menus';
import { FieldScreen, rewardText } from './field';
import { STAT_LABEL } from '../components/monster';

const BW = BD_W, BH = BD_H;
type Pop = { key: string; text: string; color: string; t0: number };
type View = { hp: number; mp: number; maxHp: number; maxMp: number; dead: boolean; status: string[]; hitT: number; deadT: number };

export type AfterBattle = (summary: BattleSummary) => Promise<void>;

export function startBattle(app: App, session: BattleSession, after?: AfterBattle) {
  app.show(new BattleScreen(app, session, after));
}

const STATUS_SHORT: Record<string, string> = { sleep: 'ねむり', paralysis: 'まひ', confusion: 'こんらん', poison: 'どく' };

class BattleScreen implements Screen {
  el: HTMLElement;
  private cv: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  private partyBar: HTMLElement;
  private logEl: HTMLElement;
  private cmds: HTMLElement;
  private lines: string[] = [];
  private views = new Map<string, View>();
  private pops: Pop[] = [];
  private raf = 0;
  private frame = 0;
  private ff = false;
  private st: BattleState;
  private keyHandler: ((k: Key) => void) | null = null;
  private activeAlly = -1;

  constructor(private app: App, private session: BattleSession, private after?: AfterBattle) {
    this.st = session.state;
    [this.cv, this.g] = mkCanvas(BW, BH);
    this.partyBar = h('div', { class: 'party-bar' });
    this.logEl = h('div', { class: 'win log' });
    this.cmds = h('div', { class: 'cmds' });
    const view = h('div', { class: 'bview' }, this.cv);
    this.el = h('div', { class: 'layer' }, this.partyBar, view, this.logEl, this.cmds);
    // 再生中にタップすると早送り
    this.el.addEventListener('pointerdown', (e) => {
      if (!(e.target as HTMLElement).closest('.cmds')) this.ff = true;
    });
    for (const c of [...this.st.allies, ...this.st.enemies]) this.views.set(c.key, this.viewOf(c));
  }

  private viewOf(c: Combatant): View {
    return { hp: c.hp, mp: c.mp, maxHp: c.maxHp, maxMp: c.maxMp, dead: c.hp <= 0, status: this.statusOf(c), hitT: -99, deadT: c.hp <= 0 ? -999 : -1 };
  }
  private statusOf(c: Combatant) {
    const out: string[] = [];
    for (const k of ['sleep', 'paralysis', 'confusion'] as const) if (c.status[k] > 0) out.push(STATUS_SHORT[k]);
    if (c.status.poison) out.push('どく');
    return out;
  }
  private get game() {
    return this.app.game!;
  }
  private get delay() {
    if (this.ff) return 70;
    return { normal: 700, fast: 380, instant: 110 }[this.app.settings.battleSpeed];
  }

  enter() {
    playBgm('battle');
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.frame++;
      this.draw();
    };
    loop();
    this.renderParty();
    (async () => {
      const names = this.st.enemies.map((e) => e.name);
      if (this.session.context.kind === 'boss') this.log(`${this.st.enemies.find((e) => e.distorted)?.name ?? names[0]}が たちはだかった！`);
      else if (names.length === 1) this.log(`${names[0]}が あらわれた！`);
      else this.log(`${names[0]}たちが あらわれた！`);
      await sleep(this.delay);
      this.commandPhase();
    })();
  }
  leave() {
    cancelAnimationFrame(this.raf);
  }
  key(k: Key, down: boolean) {
    if (down) this.keyHandler?.(k);
  }

  // ---------------------------------------------------------------- 表示
  private log(text: string) {
    for (const l of text.split('\n')) this.lines.push(l);
    if (this.lines.length > 40) this.lines.splice(0, this.lines.length - 40);
    clear(this.logEl);
    const max = Math.max(4, Math.floor((this.logEl.clientHeight - 16) / 24));
    const show = this.lines.slice(-max);
    show.forEach((l, i) => this.logEl.append(h('p', { class: i < show.length - 3 ? 'old' : '' }, l)));
  }

  private renderParty() {
    clear(this.partyBar);
    this.st.allies.forEach((c, i) => {
      const v = this.views.get(c.key)!;
      const low = !v.dead && v.hp < v.maxHp * 0.3;
      const box = h('div', { class: `win pbox${v.dead ? ' dead' : low ? ' low' : ''}${this.activeAlly === i ? ' act' : ''}`, 'data-key': c.key },
        h('div', { class: 'nm' }, c.name),
        h('div', null, `HP ${v.hp}`),
        h('div', { class: 'bar' }, h('i', { style: `width:${(100 * v.hp) / v.maxHp}%;${low ? 'background:var(--warn)' : ''}` })),
        h('div', null, `MP ${v.mp}`, h('span', { class: 'muted' }, ` Lv${c.level}`)),
        h('div', { class: 'small' }, v.dead ? 'たおれている' : v.status.join(' ')),
      );
      this.partyBar.append(box);
    });
    for (let i = this.st.allies.length; i < 3; i++) this.partyBar.append(h('div'));
  }

  private enemyPos(c: Combatant) {
    const n = this.st.enemies.length;
    const big = (c.distorted ? 1.3 : 1) * (n === 1 ? 1.3 : n === 2 ? 1.15 : 1);
    const spread = n === 1 ? 0 : n === 2 ? 90 : 112;
    return { x: BW / 2 + (n === 1 ? 0 : (c.slot / (n - 1) - 0.5) * 2 * spread), y: 190, s: big };
  }

  private draw() {
    const g = this.g;
    const theme = this.session.context.kind === 'arena' ? 'arena' : this.game.state.expedition ? getArea(this.game.state.expedition.areaId).theme : 'forest';
    g.drawImage(backdrop(theme), 0, 0);
    const now = this.frame;
    const order = [...this.st.enemies].sort((a, b) => (a.slot === 1 ? 1 : 0) - (b.slot === 1 ? 1 : 0));
    for (const e of order) {
      const v = this.views.get(e.key)!;
      if (v.dead && v.deadT >= 0 && now - v.deadT > 24) continue;
      if (v.deadT === -999) continue;
      const p = this.enemyPos(e);
      const sp = monsterSprite(e.speciesId, { distorted: e.distorted });
      const w = 96 * p.s, hgt = 96 * p.s;
      const bob = this.app.settings.reduceMotion ? 0 : Math.round(Math.sin((now + e.slot * 20) / 14) * 2);
      g.save();
      if (v.dead) g.globalAlpha = Math.max(0, 1 - (now - v.deadT) / 24);
      g.fillStyle = 'rgba(0,0,0,.28)';
      g.beginPath();
      g.ellipse(p.x, p.y - 2, w * 0.32, 7 * p.s, 0, 0, Math.PI * 2);
      g.fill();
      const hit = now - v.hitT < 16 && Math.floor((now - v.hitT) / 3) % 2 === 0;
      if (!hit) g.drawImage(sp, Math.round(p.x - w / 2), Math.round(p.y - hgt + 4) + bob, w, hgt);
      g.restore();
      const top = p.y - hgt + 6;
      // なつき（にく）
      const c = this.st.enemies.find((x) => x.key === e.key)!;
      if (c.affection > 0 && !v.dead) {
        const hearts = Math.min(3, Math.ceil(c.affection / 0.2));
        for (let i = 0; i < hearts; i++) heart(g, p.x - (hearts - 1) * 9 + i * 18, top - 4 + Math.sin((now + i * 9) / 8) * 1.5);
      }
      if (v.status.length && !v.dead) {
        g.font = 'bold 12px "DotGothic16", monospace';
        g.textAlign = 'center';
        const tw = g.measureText(v.status[0]).width + 10;
        g.fillStyle = 'rgba(16,18,30,.85)';
        g.fillRect(Math.round(p.x - tw / 2), Math.round(p.y + 6), Math.round(tw), 16);
        g.strokeStyle = '#ffe070'; g.lineWidth = 1;
        g.strokeRect(Math.round(p.x - tw / 2) + 0.5, Math.round(p.y + 6) + 0.5, Math.round(tw) - 1, 15);
        g.fillStyle = '#ffe070';
        g.fillText(v.status[0], p.x, p.y + 18);
      }
    }
    // ダメージの数字
    this.pops = this.pops.filter((pp) => now - pp.t0 < 40);
    for (const pp of this.pops) {
      const e = this.st.enemies.find((x) => x.key === pp.key);
      if (!e) continue;
      const p = this.enemyPos(e);
      const y = p.y - 60 * p.s - Math.min(12, (now - pp.t0) * 1.2);
      g.font = 'bold 22px "DotGothic16", monospace';
      g.textAlign = 'center';
      g.lineWidth = 4;
      g.strokeStyle = '#140c1c';
      g.strokeText(pp.text, p.x, y);
      g.fillStyle = pp.color;
      g.fillText(pp.text, p.x, y);
    }
  }

  // ---------------------------------------------------------------- コマンド
  private setCmds(buttons: HTMLElement[], cls = '') {
    clear(this.cmds);
    this.cmds.className = `cmds ${cls}`;
    this.cmds.append(...buttons);
    // キーボード: 1つ目のボタンを A、もどるを B に
    this.keyHandler = (k) => {
      const bs = [...this.cmds.querySelectorAll('button:not([disabled])')] as HTMLButtonElement[];
      if (k === 'a' && bs[0]) bs[0].click();
      if (k === 'b') bs.find((b) => b.textContent?.includes('もどる'))?.click();
    };
  }

  private commandPhase() {
    this.activeAlly = -1;
    this.renderParty();
    const st = this.st;
    const hasMeat = ITEM_LIST.some((i) => i.category === 'meat' && (this.game.state.inventory[i.id] ?? 0) > 0);
    const hasItem = ITEM_LIST.some((i) => i.battle && i.category !== 'meat' && (this.game.state.inventory[i.id] ?? 0) > 0);
    const tset = new Set(this.st.allies.map((c) => c.tactic ?? this.st.tactic));
    const tacLabel = tset.size === 1 ? TACTICS.find((t) => t.id === [...tset][0])!.short : 'こべつ';
    this.setCmds([
      btn('たたかう', () => this.run({ mode: 'auto', player: { kind: 'none' } }), 'primary'),
      btn('めいれい', () => this.orderPhase([], 0)),
      btn('どうぐ', () => this.itemPhase(), st.canUseItems && hasItem ? '' : 'off'),
      btn('にく', () => this.meatPhase(), st.canRecruit && hasMeat ? '' : 'off'),
      btn(h('span', { class: 'small' }, 'さくせん', h('br'), h('span', { class: 'hl' }, tacLabel)), () => this.tacticPhase()),
      btn('にげる', () => this.run({ mode: 'auto', player: { kind: 'escape' } }), st.canEscape ? '' : 'off'),
    ]);
    for (const b of this.cmds.querySelectorAll('.off')) (b as HTMLButtonElement).disabled = true;
  }

  /** さくせん: みんなまとめて、または 1体ずつ */
  private tacticPhase() {
    const allies = this.st.allies;
    const short = (c: Combatant) => TACTICS.find((t) => t.id === (c.tactic ?? this.st.tactic))!.short;
    this.setCmds([
      btn(h('span', { class: 'small' }, 'みんな'), () => this.tacticPick(null)),
      ...allies.map((c, i) => btn(h('span', { class: 'small' }, c.name, h('br'), h('span', { class: 'hl' }, short(c))), () => this.tacticPick(i))),
      btn('もどる', () => this.commandPhase()),
    ], 'two');
  }
  private tacticPick(i: number | null) {
    const c = i === null ? null : this.st.allies[i];
    const cur = c ? (c.tactic ?? this.st.tactic) : null;
    this.log(c ? `${c.name}の さくせんは？` : 'みんなの さくせんは？');
    this.setCmds([
      ...TACTICS.map((t) => btn(h('span', { class: 'small' }, t.name), () => {
        if (c?.instanceId) this.game.setMonsterTactic(c.instanceId, t.id);
        else this.game.setTactic(t.id);
        this.st = this.game.battle!.state;
        sfx('ok');
        this.log(`${c ? c.name + 'の ' : 'みんなの '}さくせんを「${t.name}」に した。`);
        this.tacticPhase();
      }, cur === t.id ? 'primary' : '')),
      btn('もどる', () => this.tacticPhase()),
    ], 'two');
  }

  /** 1体ずつ命令する */
  private orderPhase(cmds: AllyCommand[], i: number) {
    const allies = this.st.allies;
    while (i < allies.length && allies[i].hp <= 0) { cmds[i] = { kind: 'defend' }; i++; }
    if (i >= allies.length) return this.run({ mode: 'command', commands: cmds, player: { kind: 'none' } });
    const a = allies[i];
    this.activeAlly = i;
    this.renderParty();
    const next = (c: AllyCommand) => { cmds[i] = c; sfx('cursor'); this.orderPhase(cmds, i + 1); };
    const back = () => (i === 0 ? this.commandPhase() : this.orderPhase(cmds, i - 1));
    const skillBtns = a.skills.map((id) => {
      const s = getSkill(id);
      const b = btn(h('span', { class: 'small' }, s.name, h('br'), h('span', { class: 'muted' }, `MP${s.mpCost}`)), () => this.targetPhase(a.key, id, (t) => next({ kind: 'skill', skillId: id, target: t }), () => this.orderPhase(cmds, i)));
      if (s.mpCost > a.mp) b.disabled = true;
      return b;
    });
    this.log(`${a.name}は どうする？`);
    this.setCmds([
      btn('こうげき', () => this.targetPhase(a.key, 'attack', (t) => next({ kind: 'attack', target: t! }), () => this.orderPhase(cmds, i)), 'primary'),
      ...skillBtns,
      btn('ぼうぎょ', () => next({ kind: 'defend' })),
      btn('もどる', back),
    ]);
  }

  private targetPhase(_actor: string, skillId: string, done: (t?: string) => void, back: () => void) {
    const s = getSkill(skillId);
    if (s.target === 'self' || s.target === 'allAllies' || s.target === 'allEnemies' || s.target === 'randomEnemies') return done(undefined);
    const pool = s.target === 'oneEnemy' ? this.st.enemies.filter((e) => e.hp > 0) : s.category === 'revive' ? this.st.allies.filter((c) => c.hp <= 0) : this.st.allies.filter((c) => c.hp > 0);
    if (pool.length === 1 && s.target === 'oneEnemy') return done(pool[0].key);
    this.setCmds([
      ...pool.map((c) => btn(h('span', { class: 'small' }, c.name, c.side === 'ally' ? h('span', { class: 'muted' }, ` ${c.hp}/${c.maxHp}`) : null), () => done(c.key))),
      btn('もどる', back),
    ], 'two');
  }

  private itemPhase() {
    const inv = ITEM_LIST.filter((i) => i.battle && i.category !== 'meat' && (this.game.state.inventory[i.id] ?? 0) > 0);
    this.setCmds([
      ...inv.map((it) => btn(h('span', { class: 'small' }, it.name, h('span', { class: 'muted' }, ` ×${this.game.state.inventory[it.id]}`)), () => {
        const pool = it.category === 'revive' ? this.st.allies.filter((c) => c.hp <= 0) : this.st.allies.filter((c) => c.hp > 0);
        if (!pool.length) return this.app.toast('つかえる あいてが いません。');
        this.setCmds([
          ...pool.map((c) => btn(h('span', { class: 'small' }, c.name, h('span', { class: 'muted' }, ` ${c.hp}/${c.maxHp}`)), () => this.run({ mode: 'auto', player: { kind: 'item', itemId: it.id, target: c.key } }))),
          btn('もどる', () => this.itemPhase()),
        ], 'two');
      })),
      btn('もどる', () => this.commandPhase()),
    ], 'two');
  }

  private meatPhase() {
    const meats = ITEM_LIST.filter((i) => i.category === 'meat' && (this.game.state.inventory[i.id] ?? 0) > 0);
    this.setCmds([
      ...meats.map((it) => btn(h('span', { class: 'small' }, it.name, h('span', { class: 'muted' }, ` ×${this.game.state.inventory[it.id]}`)), () => {
        const pool = this.st.enemies.filter((e) => e.hp > 0);
        const throwAt = (key: string) => this.run({ mode: 'auto', player: { kind: 'item', itemId: it.id, target: key } });
        if (pool.length === 1) return throwAt(pool[0].key);
        this.setCmds([...pool.map((e) => btn(h('span', { class: 'small' }, e.name), () => throwAt(e.key))), btn('もどる', () => this.meatPhase())], 'two');
      })),
      btn('もどる', () => this.commandPhase()),
    ], 'two');
  }

  // ---------------------------------------------------------------- ターンの実行と再生
  private async run(input: TurnInput) {
    this.keyHandler = null;
    this.activeAlly = -1;
    this.setCmds([]);
    const r = this.game.battleTurn(input);
    if (!r.ok) {
      this.app.toast(r.error);
      return this.commandPhase();
    }
    this.ff = false;
    for (const ev of r.value.events) await this.play(ev);
    this.st = r.value.state;
    for (const c of [...this.st.allies, ...this.st.enemies]) {
      const v = this.views.get(c.key)!;
      v.status = this.statusOf(c);
      v.hp = c.hp;
      v.mp = c.mp;
    }
    this.renderParty();
    this.ff = false;
    if (this.st.outcome) return this.end();
    this.commandPhase();
  }

  private async play(ev: BattleEvent) {
    const v = 'target' in ev ? this.views.get(ev.target) : undefined;
    const isEnemy = 'target' in ev && ev.target.startsWith('e');
    switch (ev.t) {
      case 'act': {
        const s = getSkill(ev.skillId);
        sfx(s.category === 'magic' || s.category === 'breath' ? 'magic' : s.category === 'heal' || s.category === 'revive' ? 'heal' : 'cursor');
        break;
      }
      case 'damage':
        if (v) {
          v.hp = ev.hp;
          v.hitT = this.frame;
          if (isEnemy) this.pops.push({ key: ev.target, text: String(ev.amount), color: ev.weak ? '#ffe040' : '#ffffff', t0: this.frame });
        }
        sfx(ev.crit ? 'crit' : 'hit');
        if (!isEnemy) {
          this.renderParty();
          const box = this.partyBar.querySelector(`[data-key="${ev.target}"]`);
          box?.classList.add('hit');
          if (!this.app.settings.reduceMotion) this.el.querySelector('.bview')?.classList.add('flash');
          setTimeout(() => this.el.querySelector('.bview')?.classList.remove('flash'), 300);
        }
        break;
      case 'heal':
      case 'revive':
        if (v) { v.hp = ev.hp; if (ev.t === 'revive') { v.dead = false; v.deadT = -1; } }
        if (isEnemy && ev.t === 'heal') this.pops.push({ key: ev.target, text: `+${ev.amount}`, color: '#80ff9a', t0: this.frame });
        this.renderParty();
        break;
      case 'mp':
        if (v) v.mp = ev.mp;
        this.renderParty();
        if (!ev.text) return;
        break;
      case 'faint':
        if (v) { v.dead = true; v.hp = 0; v.deadT = this.frame; v.status = []; }
        sfx('dead');
        this.renderParty();
        break;
      case 'status':
        if (v && ev.status !== 'buff') {
          if (ev.on) v.status = [...new Set([...v.status, STATUS_SHORT[ev.status]])];
          else v.status = ev.status === 'poison' && ev.text.includes('もとに') ? [] : v.status.filter((s) => s !== STATUS_SHORT[ev.status]);
        }
        sfx('status');
        this.renderParty();
        break;
      case 'miss':
        sfx('bump');
        break;
      case 'item':
        sfx('ok');
        break;
      case 'end':
        break;
    }
    if ('text' in ev && ev.text) this.log(ev.text);
    await sleep(ev.t === 'act' ? this.delay * 0.6 : this.delay);
  }

  /** パーティが いっぱいのとき、だれと 入れかえるか えらぶ */
  private async offerSwap(newId: string, name: string) {
    const party = this.game.party;
    const c = await this.app.ask(`パーティは いっぱいだ。${name}を つれていきますか？`, [...party.map((m) => `${m.nickname || getSpecies(m.speciesId).name} と いれかえる`), `${name}は ぼくじょうへ おくる`], { cancel: false });
    if (c < 0 || c >= party.length) return this.app.say(`${name}は ぼくじょうへ おくられた。`);
    const out = party[c];
    const r = this.game.swapIntoParty(newId, out.id);
    if (!r.ok) return this.app.say(r.error);
    sfx('ok');
    await this.app.say(`${name}が パーティに くわわった！\n${out.nickname || getSpecies(out.speciesId).name}は ぼくじょうへ おくられた。`);
  }

  // ---------------------------------------------------------------- 戦闘のおわり
  private async end() {
    const outcome = this.st.outcome!;
    const ctx = this.session.context;
    const recruitNames = this.st.enemies.map((e) => getSpecies(e.speciesId).name);
    void recruitNames;
    const sum = this.game.finishBattle();
    const say = (t: string | string[]) => this.app.say(t);
    if (outcome === 'win') {
      sfx('win');
      await sleep(300);
      const lines: string[] = [];
      if (sum.exp) lines.push(`けいけんちを ${sum.exp} かくとく！${sum.gold ? `\n${sum.gold}ゴールドを てにいれた！` : ''}`);
      await say(lines);
      for (const lu of sum.levelUps) {
        const last = lu.events[lu.events.length - 1];
        sfx('levelup');
        const gains = lu.events.reduce((acc, e) => { for (const k of Object.keys(e.gains) as (keyof typeof e.gains)[]) acc[k] = (acc[k] ?? 0) + e.gains[k]; return acc; }, {} as Record<string, number>);
        const gtxt = Object.entries(gains).filter(([, n]) => n > 0).map(([k, n]) => `${STAT_LABEL[k as keyof typeof STAT_LABEL]}+${n}`).join(' ');
        const msgs = [`${lu.name}は レベル${last.level}に あがった！\n${gtxt}`];
        for (const e of lu.events) {
          for (const s of e.learned) msgs.push(`${lu.name}は ${getSkill(s).name}を おぼえた！`);
          for (const u of e.upgraded) msgs.push(`${lu.name}の ${getSkill(u.from).name}が ${getSkill(u.to).name}に しんかした！`);
        }
        await say(msgs);
      }
      for (const lu of sum.levelUps) {
        const m = this.game.monster(lu.monsterId);
        if (m?.pendingSkills.length) await resolvePending(this.app, m);
      }
      if (sum.recruitBlocked) await say('モンスターが なかまに なりたそうに していたが、ぼくじょうが いっぱいだった…。');
      if (sum.recruit) {
        const rc = sum.recruit;
        await say(`${rc.name}が おきあがって ちかよってきた。\nなかまに なりたいようだ！`);
        if (await this.app.confirm(`${rc.name}を なかまに しますか？`)) {
          const r = this.game.acceptRecruit(rc.speciesId, rc.level);
          if (r.ok) {
            sfx('recruit');
            const inParty = this.game.state.partyIds.includes(r.value.id);
            await say(`${rc.name}が なかまに なった！`);
            await welcomeMonster(this.app, r.value.id, 'あたらしい なかま');
            const nm = this.game.monster(r.value.id)?.nickname || rc.name;
            if (!inParty) await this.offerSwap(r.value.id, nm);
          } else await say(r.error);
        } else await say(`${rc.name}は さびしそうに さっていった…。`);
      }
      if (sum.boss) {
        await say(sum.boss.texts);
        for (const r of sum.boss.rewards) if (r.type !== 'item' || r.itemId !== 'shard') await say(`${rewardText(r)}を てにいれた！`);
        await say('ゆがみが はらわれ、ひかりの みちが まちへと つながった。');
      }
    } else if (outcome === 'lose') {
      sfx('lose');
      if (ctx.kind === 'arena') await say(['まけてしまった…。', 'モンスターたちは てあてを うけて げんきに なった。']);
      else await say(['めのまえが まっくらに なった…。', `……ルナフィアの まちで めを さました。${sum.goldLost ? `\nおかねを ${sum.goldLost}ゴールド なくしてしまった…。` : ''}`]);
    }
    for (const a of sum.unlocked.areas) await say(`あたらしい たびのとびら「${getArea(a).name}」が ひらいた！`);
    if (sum.unlocked.ranks.length) await say('とうぎじょうで あたらしい ランクに さんか できるように なった！');
    await this.app.saveNow();
    if (this.after) return this.after(sum);
    this.app.show(new FieldScreen(this.app));
  }
}

function heart(g: CanvasRenderingContext2D, x: number, y: number) {
  g.fillStyle = '#1a0a14';
  g.beginPath(); g.arc(x - 3.5, y - 1, 5, 0, Math.PI * 2); g.arc(x + 3.5, y - 1, 5, 0, Math.PI * 2); g.moveTo(x - 8.5, y); g.lineTo(x, y + 9); g.lineTo(x + 8.5, y); g.fill();
  g.fillStyle = '#ff5a8a';
  g.beginPath(); g.arc(x - 3.5, y - 1, 3.6, 0, Math.PI * 2); g.arc(x + 3.5, y - 1, 3.6, 0, Math.PI * 2); g.moveTo(x - 7, y); g.lineTo(x, y + 7); g.lineTo(x + 7, y); g.fill();
  g.fillStyle = '#ffd0e0'; g.fillRect(x - 5, y - 3, 2, 2);
}

export const itemName = (id: string) => getItem(id).name;
export type { PlayerAction };
