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
import { TACTICS, resolvePending } from './menus';
import { FieldScreen, rewardText } from './field';
import { STAT_LABEL } from '../components/monster';

const BW = 176, BH = 104;
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
    const show = this.lines.slice(-4);
    show.forEach((l, i) => this.logEl.append(h('p', { class: i < show.length - 2 ? 'old' : '' }, l)));
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
    const big = c.distorted ? 1.5 : 1;
    return { x: (BW * (c.slot + 1)) / (n + 1), y: 72, s: big };
  }

  private draw() {
    const g = this.g;
    const theme = this.session.context.kind === 'arena' ? 'arena' : this.game.state.expedition ? getArea(this.game.state.expedition.areaId).theme : 'forest';
    const sky = { forest: ['#5a9ad8', '#9ad0f0'], cave: ['#1a1a2a', '#3a3040'], highland: ['#f0a060', '#f8d898'], arena: ['#2a2a5a', '#5a5a9a'] }[theme] ?? ['#5a9ad8', '#9ad0f0'];
    const ground = { forest: '#4a8a3a', cave: '#5a4a4a', highland: '#9a8a50', arena: '#b8945a' }[theme] ?? '#4a8a3a';
    const grd = g.createLinearGradient(0, 0, 0, 60);
    grd.addColorStop(0, sky[0]);
    grd.addColorStop(1, sky[1]);
    g.fillStyle = grd;
    g.fillRect(0, 0, BW, 60);
    g.fillStyle = ground;
    g.fillRect(0, 56, BW, BH - 56);
    g.fillStyle = 'rgba(0,0,0,.15)';
    for (let x = 0; x < BW; x += 8) g.fillRect(x + ((x / 8) % 2) * 4, 62 + ((x * 7) % 30), 3, 1);
    if (theme === 'arena') {
      g.fillStyle = '#3a3a6a';
      for (let x = 0; x < BW; x += 12) g.fillRect(x, 40, 10, 16);
    }
    const now = this.frame;
    for (const e of this.st.enemies) {
      const v = this.views.get(e.key)!;
      if (v.dead && v.deadT >= 0 && now - v.deadT > 24) continue;
      if (v.deadT === -999) continue;
      const p = this.enemyPos(e);
      const sp = monsterSprite(e.speciesId, { distorted: e.distorted });
      const w = 40 * p.s, hgt = 40 * p.s;
      const bob = this.app.settings.reduceMotion ? 0 : Math.round(Math.sin((now + e.slot * 20) / 14) * 1.2);
      g.save();
      if (v.dead) g.globalAlpha = Math.max(0, 1 - (now - v.deadT) / 24);
      const hit = now - v.hitT < 16 && Math.floor((now - v.hitT) / 3) % 2 === 0;
      if (!hit) g.drawImage(sp, Math.round(p.x - w / 2), Math.round(p.y - hgt + 6) + bob, w, hgt);
      g.restore();
      // なつき（にく）
      const c = this.st.enemies.find((x) => x.key === e.key)!;
      if (c.affection > 0 && !v.dead) {
        const hearts = Math.min(3, Math.ceil(c.affection / 0.2));
        g.fillStyle = '#ff6a9a';
        for (let i = 0; i < hearts; i++) {
          const hx = Math.round(p.x - 8 + i * 6), hy = Math.round(p.y - hgt);
          g.fillRect(hx, hy, 2, 2); g.fillRect(hx + 3, hy, 2, 2); g.fillRect(hx, hy + 1, 5, 2); g.fillRect(hx + 1, hy + 3, 3, 1); g.fillRect(hx + 2, hy + 4, 1, 1);
        }
      }
      if (v.status.length && !v.dead) {
        g.fillStyle = 'rgba(0,0,0,.6)';
        g.fillRect(Math.round(p.x - 16), Math.round(p.y + 6), 32, 9);
        g.fillStyle = '#ffe070';
        g.font = '8px monospace';
        g.textAlign = 'center';
        g.fillText(v.status[0].slice(0, 4), p.x, p.y + 13);
      }
    }
    // ダメージの数字
    this.pops = this.pops.filter((pp) => now - pp.t0 < 40);
    for (const pp of this.pops) {
      const e = this.st.enemies.find((x) => x.key === pp.key);
      if (!e) continue;
      const p = this.enemyPos(e);
      g.font = 'bold 10px monospace';
      g.textAlign = 'center';
      g.fillStyle = '#000';
      g.fillText(pp.text, p.x + 1, p.y - 22 - (now - pp.t0) / 3 + 1);
      g.fillStyle = pp.color;
      g.fillText(pp.text, p.x, p.y - 22 - (now - pp.t0) / 3);
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
    const tac = TACTICS.find((t) => t.id === this.game.state.player.tactic)!;
    this.setCmds([
      btn('たたかう', () => this.run({ mode: 'auto', player: { kind: 'none' } }), 'primary'),
      btn('めいれい', () => this.orderPhase([], 0)),
      btn('どうぐ', () => this.itemPhase(), st.canUseItems && hasItem ? '' : 'off'),
      btn('にく', () => this.meatPhase(), st.canRecruit && hasMeat ? '' : 'off'),
      btn(h('span', { class: 'small' }, 'さくせん', h('br'), h('span', { class: 'hl' }, tac.short)), () => this.tacticPhase()),
      btn('にげる', () => this.run({ mode: 'auto', player: { kind: 'escape' } }), st.canEscape ? '' : 'off'),
    ]);
    for (const b of this.cmds.querySelectorAll('.off')) (b as HTMLButtonElement).disabled = true;
  }

  private tacticPhase() {
    this.setCmds([
      ...TACTICS.map((t) => btn(h('span', { class: 'small' }, t.name), () => { this.game.setTactic(t.id); this.st = { ...this.st, tactic: t.id }; this.game.battle!.state.tactic = t.id; sfx('ok'); this.log(`さくせんを「${t.name}」に した。`); this.commandPhase(); }, this.game.state.player.tactic === t.id ? 'primary' : '')),
      btn('もどる', () => this.commandPhase()),
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
            await say(`${rc.name}が なかまに なった！${inParty ? '' : '\n（ぼくじょうに おくられた）'}`);
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

export const itemName = (id: string) => getItem(id).name;
export type { PlayerAction };
