import { getArea } from '../../data/areas';
import { getItem, ITEM_LIST } from '../../data/items';
import { getSpecies } from '../../data/monsters';
import { getSkill } from '../../data/skills';
import type { BattleSession, BattleSummary } from '../../application/Game';
import type { AllyCommand, BattleEvent, BattleState, Combatant, PlayerAction, TurnInput } from '../../domain/battle/types';
import { playBgm, sfx } from '../../infrastructure/audio/Sound';
import type { App, Key, Screen } from '../App';
import { btn, clear, h, sleep } from '../dom';
import { flashSprite, monsterSprite, needFlip, spriteFoot } from '../gfx/monsters';
import { drawWithPose, motionPose, MOTION_LENGTH } from '../gfx/motion';
import { MONSTER2_BY_ID } from '../../data/v2/monsters';
import { mkCanvas } from '../gfx/Pix';
import { BD_H, BD_W, backdrop, type Backdrop } from '../gfx/backdrops';
import { TACTICS, welcomeMonster, resolvePending } from './menus';
import { FieldScreen, rewardText } from './field';
import { elemIcon, monIcon, STAT_LABEL } from '../components/monster';
import { ELEMENT_IDS } from '../../data/types';
import { recruitFx } from '../components/fx';

const BW = BD_W, BH = BD_H;
type Pop = { key: string; text: string; color: string; t0: number };
type View = { hp: number; mp: number; maxHp: number; maxMp: number; dead: boolean; status: string[]; hitT: number; deadT: number; actT: number };

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
  /** えらぶ リストの 下に いつも 出す ボタン（もどる・ぼうぎょ）。リストが ながくても かくれない */
  private pin: HTMLElement;
  private lines: string[] = [];
  private views = new Map<string, View>();
  private pops: Pop[] = [];
  private raf = 0;
  private frame = 0;
  private ff = false;
  /** とくべつな せんとうの バナー（はじめて であう モンスター・ボス）。frame まで ひょうじ */
  private banner: { lines: string[]; until: number } | null = null;
  private hitsAfterAct = 0;
  private st: BattleState;
  private keyHandler: ((k: Key) => void) | null = null;
  private activeAlly = -1;
  private mid!: HTMLElement;
  private einfo: HTMLElement;
  private skyTheme = '';
  private skyCol = '#000';
  private ro: ResizeObserver | null = null;
  private skyTop = '#000';

  constructor(private app: App, private session: BattleSession, private after?: AfterBattle) {
    this.st = session.state;
    [this.cv, this.g] = mkCanvas(BW, BH);
    this.partyBar = h('div', { class: 'party-bar' });
    this.logEl = h('div', { class: 'win log blog' });
    this.cmds = h('div', { class: 'cmds' });
    this.pin = h('div', { class: 'cmdpin' });
    this.einfo = h('div', { class: 'einfo' });
    const view = h('div', { class: 'bview' }, this.cv, this.einfo);
    // 参考画像3「戦闘画面」：場面に 味方（左）と 敵（右）、右上に 敵の 名前と HP、下に 2れつの コマンドと 味方の カード
    this.mid = h('div', { class: 'battle-mid' }, this.logEl, this.cmds, this.pin);
    this.el = h('div', { class: 'layer battle' }, view, this.mid, this.partyBar);
    // 再生中にタップすると早送り
    this.el.addEventListener('pointerdown', (e) => {
      if (!(e.target as HTMLElement).closest('.cmds, .cmdpin')) this.ff = true;
    });
    for (const c of [...this.st.allies, ...this.st.enemies]) this.views.set(c.key, this.viewOf(c));
  }

  private viewOf(c: Combatant): View {
    return { hp: c.hp, mp: c.mp, maxHp: c.maxHp, maxMp: c.maxMp, dead: c.hp <= 0, status: this.statusOf(c), hitT: -99, deadT: c.hp <= 0 ? -999 : -1, actT: -99 };
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
    if (this.ff) return 40;
    // ふつうの せんとうは さくさく すすむ（けっかは ログと ダメージ表示で つたわる）
    return { normal: 520, fast: 270, instant: 80 }[this.app.settings.battleSpeed];
  }

  enter() {
    playBgm('battle');
    // 場面の 大きさは 表示わくが かわった ときだけ あわせる（とちゅうで 場面が ゆれない）
    this.ro = new ResizeObserver(() => this.fitCanvas());
    this.ro.observe(this.cv.parentElement!);
    this.fitCanvas();
    this.renderParty();
    // はじめから コマンドの わくを 出しておく（あとから 出て 画面が ずれない）
    this.commandPhase(true);
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.frame++;
      this.draw();
    };
    loop();
    (async () => {
      const names = this.st.enemies.map((e) => e.name);
      if (this.session.context.kind === 'boss') this.log(`${this.st.enemies.find((e) => e.distorted)?.name ?? names[0]}が たちはだかった！`);
      else if (names.length === 1) this.log(`${names[0]}が あらわれた！`);
      else this.log(`${names[0]}たちが あらわれた！`);
      // とくべつな せんとう（はじめて であう モンスター／はじめての ボス）は 演出を つよく。2回目からは みじかく
      const fresh = this.session.firstSeen.map((id) => getSpecies(id).name);
      if (this.session.firstBoss) {
        this.banner = { lines: [`${this.st.enemies.find((e) => e.script || e.distorted)?.name ?? 'ボス'}との けっせん！`], until: this.frame + 110 };
        sfx('encounter');
        await sleep(this.ff ? 200 : 900);
      } else if (fresh.length) {
        this.banner = { lines: ['はじめて であう モンスター！', `「${fresh[0]}」${fresh.length > 1 ? ` ほか` : ''}`], until: this.frame + 120 };
        sfx('discover');
        this.log('ずかんに あたらしく とうろくされた！');
        await sleep(this.ff ? 200 : 1000);
      } else await sleep(this.delay * 0.4);
      this.commandPhase();
    })();
  }
  leave() {
    this.ro?.disconnect();
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
    const show = this.lines.slice(-2);
    show.forEach((l, i) => this.logEl.append(h('p', { class: i < show.length - 1 ? 'old' : '' }, l)));
  }

  private renderParty() {
    clear(this.partyBar);
    this.st.allies.forEach((c, i) => {
      const v = this.views.get(c.key)!;
      const low = !v.dead && v.hp < v.maxHp * 0.3;
      // 参考画像3 の 下段の カード：名前・Lv・顔・HP／MP の 数字と バー
      const gauge = (k: string, n: number, max: number, cls: string) => h('div', { class: `gauge ${cls}` },
        h('div', { class: 'gl' }, h('span', { class: 'k' }, k), h('span', { class: 'n' }, String(n))),
        h('div', { class: 'bar' }, h('i', { style: `width:${max ? (100 * n) / max : 0}%;${cls === 'hp' && low ? 'background:var(--warn)' : ''}` })));
      const box = h('div', { class: `win pbox${v.dead ? ' dead' : low ? ' low' : ''}${this.activeAlly === i ? ' act' : ''}`, 'data-key': c.key },
        h('div', { class: 'nm' }, c.name),
        h('div', { class: 'pbody' },
          h('div', { class: 'pface' }, h('span', { class: 'lv' }, `Lv ${c.level}`), monIcon(c.speciesId, 'face')),
          h('div', { class: 'pg' }, gauge('HP', v.hp, v.maxHp, 'hp'), gauge('MP', v.mp, v.maxMp, 'mp'))),
        h('div', { class: 'st small' }, v.dead ? 'たおれている' : v.status.join(' ')),
      );
      this.partyBar.append(box);
    });
    for (let i = this.st.allies.length; i < 3; i++) this.partyBar.append(h('div'));
    this.renderEnemies();
  }

  /** 右上の 敵の 名前・Lv（参考画像3。HP は 見せない） */
  private renderEnemies() {
    clear(this.einfo);
    for (const e of this.st.enemies) {
      const v = this.views.get(e.key);
      if (!v || v.dead) continue;
      // 敵の HP は 見せない（名前と Lv だけ）。第3章の 魔物研究所で「耐性の 表示」が ひらくと 弱点の 属性を 出す
      const weak = this.game.hasFeature('resistView') ? ELEMENT_IDS.filter((k) => (e.resist[k] ?? 0) < 0) : [];
      this.einfo.append(h('div', { class: 'erow' },
        h('div', { class: 'eh' }, h('span', { class: 'en' }, e.name), h('span', { class: 'el' }, `Lv ${e.level}`)),
        weak.length ? h('div', { class: 'ew' }, h('span', null, 'じゃくてん'), ...weak.map((k) => elemIcon(k))) : null));
    }
  }

  /** 敵は 右の おく、味方は 左の 手前（参考画像3） */
  private enemyPos(c: Combatant) {
    const n = this.st.enemies.length;
    const big = (c.distorted ? 1.25 : 1) * (n === 1 ? 1.35 : n === 2 ? 1.1 : n === 3 ? 0.92 : 0.85);
    const xs = n === 1 ? [262] : n === 2 ? [222, 302] : n === 3 ? [214, 272, 326] : [200, 246, 292, 334];
    const ys = n <= 2 ? [212, 222] : [204, 220, 208, 222];
    return { x: xs[c.slot % xs.length] ?? 260, y: ys[c.slot % ys.length] ?? 214, s: big };
  }
  private allyPos(i: number) {
    return { x: [42, 98, 152][i] ?? 42, y: [266, 252, 274][i] ?? 266, s: 0.95 };
  }

  private drawAllies(now: number) {
    const g = this.g;
    this.st.allies.forEach((a, i) => {
      const v = this.views.get(a.key);
      if (!v) return;
      const p = this.allyPos(i);
      const sp = monsterSprite(a.speciesId);
      let w = Math.round(sp.width * p.s), hgt = Math.round(sp.height * p.s);
      if (hgt > 96) { const k = 96 / hgt; w = Math.round(w * k); hgt = Math.round(hgt * k); }
      const k = hgt / sp.height;
      const foot = spriteFoot(a.speciesId) ?? sp.height - 4;
      const by = p.y + Math.round((sp.height - foot) * k);
      const still = this.app.settings.reduceMotion;
      const pose = v.dead ? motionPose('faint', Math.min(now - v.deadT, MOTION_LENGTH.faint - 8))
        : now - v.hitT < MOTION_LENGTH.hit ? motionPose('hit', now - v.hitT)
        : now - v.actT < MOTION_LENGTH.attack && !still ? motionPose('attack', now - v.actT)
        : still ? motionPose('idle', 0) : motionPose('idle', now, i * 17);
      if (still) { pose.dx = 0; pose.dy = Math.min(pose.dy, 0); }
      // 攻撃の ふみこみは 右（敵の ほう）へ
      if (now - v.actT < MOTION_LENGTH.attack && !v.dead) { pose.dx += pose.dy * 0.8; pose.dy = -pose.dy * 0.2; }
      g.save();
      g.fillStyle = 'rgba(0,0,0,.28)';
      g.beginPath(); g.ellipse(p.x, p.y - 2, w * 0.3, 6, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      g.save();
      if (v.dead) g.globalAlpha = 0.45;
      if (needFlip(a.speciesId, true)) { g.translate(p.x * 2, 0); g.scale(-1, 1); pose.dx = -pose.dx; }
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      drawWithPose(g, sp, flashSprite(sp), p.x, by, w, hgt, pose);
      g.restore();
    });
  }

  private draw() {
    const g = this.g;
    const base = this.session.context.kind === 'arena' || this.session.context.kind === 'practice' ? 'arena' : this.game.state.expedition ? getArea(this.game.state.expedition.areaId).theme : 'forest';
    const boss = this.session.context.kind === 'boss';
    const theme: Backdrop = boss && base === 'forest' ? 'grove' : (base as Backdrop);
    // 画面が たて長なら 空を 上へ のばす（場面は 下に そろえる）
    const off = this.cv.height - BH;
    if (this.skyTheme !== theme) {
      this.skyTheme = theme;
      const [r, gg, bb] = backdrop(theme).getContext('2d')!.getImageData(BW / 2, 0, 1, 1).data;
      this.skyCol = `rgb(${r},${gg},${bb})`;
      this.skyTop = `rgb(${Math.round(r * 0.7 + 16 * 0.3)},${Math.round(gg * 0.7 + 32 * 0.3)},${Math.round(bb * 0.7 + 96 * 0.3)})`;
      this.cv.parentElement!.style.background = this.skyCol;
    }
    if (off > 0) {
      const gr = g.createLinearGradient(0, 0, 0, off + 2);
      gr.addColorStop(0, this.skyTop); gr.addColorStop(1, this.skyCol);
      g.fillStyle = gr; g.fillRect(0, 0, BW, off + 2);
    }
    g.save();
    g.translate(0, off);
    g.drawImage(backdrop(theme), 0, 0);
    const now = this.frame;
    const order = [...this.st.enemies].sort((a, b) => (a.slot === 1 ? 1 : 0) - (b.slot === 1 ? 1 : 0));
    for (const e of order) {
      const v = this.views.get(e.key)!;
      if (v.dead && v.deadT >= 0 && now - v.deadT > MOTION_LENGTH.faint) continue;
      if (v.deadT === -999) continue;
      const p = this.enemyPos(e);
      const sp = monsterSprite(e.speciesId, { distorted: e.distorted });
      let w = Math.round(sp.width * p.s), hgt = Math.round(sp.height * p.s);
      // 大きい絵は 画面に おさまるように ちぢめる
      if (hgt > 184) { const k = 184 / hgt; w = Math.round(w * k); hgt = Math.round(hgt * k); }
      const k = hgt / sp.height;
      const foot = spriteFoot(e.speciesId) ?? sp.height - 4;
      const by = p.y + Math.round((sp.height - foot) * k);
      // うごき（待機・攻撃・被弾・戦闘不能）
      const still = this.app.settings.reduceMotion;
      const pose = v.dead ? motionPose('faint', now - v.deadT)
        : now - v.hitT < MOTION_LENGTH.hit ? motionPose('hit', now - v.hitT)
        : now - v.actT < MOTION_LENGTH.attack && !still ? motionPose('attack', now - v.actT)
        : still ? motionPose('idle', 0) : motionPose('idle', now, e.slot * 20);
      if (still) { pose.dx = 0; pose.dy = Math.min(pose.dy, 0); }
      g.save();
      g.fillStyle = 'rgba(0,0,0,.28)';
      g.globalAlpha = pose.alpha;
      g.beginPath();
      g.ellipse(p.x, p.y - 2, w * 0.3 * pose.sx, 7 * p.s, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
      // 伝説級は ほのかに ひかる
      const def2 = MONSTER2_BY_ID[e.speciesId];
      if (def2?.legendary && !v.dead) {
        const gl = g.createRadialGradient(p.x, p.y - hgt * 0.35, 4, p.x, p.y - hgt * 0.35, hgt * 0.6);
        const a = 0.25 + 0.12 * Math.sin(now / 10);
        gl.addColorStop(0, `rgba(255,240,170,${a})`); gl.addColorStop(1, 'rgba(255,240,170,0)');
        g.fillStyle = gl; g.fillRect(p.x - hgt, p.y - hgt * 1.2, hgt * 2, hgt * 1.4);
      }
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      drawWithPose(g, sp, flashSprite(sp), p.x, by, w, hgt, pose);
      g.imageSmoothingEnabled = false;
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
    this.drawAllies(now);
    // ダメージの数字
    this.pops = this.pops.filter((pp) => now - pp.t0 < 40);
    for (const pp of this.pops) {
      const e = this.st.enemies.find((x) => x.key === pp.key);
      const ai = this.st.allies.findIndex((x) => x.key === pp.key);
      if (!e && ai < 0) continue;
      const p = e ? this.enemyPos(e) : this.allyPos(ai);
      const y = p.y - (e ? 60 : 50) * p.s - Math.min(12, (now - pp.t0) * 1.2);
      g.font = 'bold 22px "DotGothic16", monospace';
      g.textAlign = 'center';
      g.lineWidth = 4;
      g.strokeStyle = '#140c1c';
      g.strokeText(pp.text, p.x, y);
      g.fillStyle = pp.color;
      g.fillText(pp.text, p.x, y);
    }
    // とくべつな せんとうの バナー
    if (this.banner) {
      const left = this.banner.until - now;
      if (left <= 0) this.banner = null;
      else {
        const a = Math.min(1, left / 18, (120 - left) / 10 + 0.2);
        const hh = 18 + this.banner.lines.length * 22;
        g.save();
        g.globalAlpha = Math.max(0, a);
        g.fillStyle = 'rgba(12,10,30,.82)';
        g.fillRect(0, 22, BW, hh);
        g.fillStyle = '#ffd860'; g.fillRect(0, 22, BW, 2); g.fillRect(0, 22 + hh - 2, BW, 2);
        g.textAlign = 'center';
        g.font = 'bold 18px "DotGothic16", monospace';
        this.banner.lines.forEach((t, i) => { g.fillStyle = i ? '#ffffff' : '#ffd860'; g.fillText(t, BW / 2, 22 + 28 + i * 22); });
        g.restore();
      }
    }
    g.restore();
  }

  /** 場面の 高さを 表示わくに あわせる（たて長の 画面で 上が あかない） */
  private fitCanvas = () => {
    const r = this.cv.parentElement?.getBoundingClientRect();
    if (!r || !r.width || !r.height) return;
    const hh = Math.max(BH, Math.min(620, Math.round((BW * r.height) / r.width)));
    if (this.cv.height !== hh) { this.cv.height = hh; this.g.imageSmoothingEnabled = false; }
  };

  // ---------------------------------------------------------------- コマンド
  private setCmds(buttons: HTMLElement[], cls = '') {
    clear(this.cmds);
    clear(this.pin);
    this.cmds.className = `cmds ${cls}`;
    // リストの ときは「もどる」「ぼうぎょ」を 下に 固定（とくぎが おおくても スクロールせずに おせる）
    if (!cls.includes('grid2')) {
      const pinned = buttons.filter((b) => /^(もどる|ぼうぎょ)$/.test(b.textContent ?? ''));
      buttons = buttons.filter((b) => !pinned.includes(b));
      this.pin.append(...pinned);
    }
    this.cmds.scrollTop = 0;
    // 縦の コマンド（ふだん）は ログの 右、えらぶ リストは ログの かわりに ひろく
    this.mid.classList.toggle('wide', !cls.includes('grid2') && buttons.length > 0);
    this.cmds.append(...buttons);
    // キーボード: 1つ目のボタンを A、もどるを B に
    this.keyHandler = (k) => {
      const bs = [...this.cmds.querySelectorAll('button:not([disabled])'), ...this.pin.querySelectorAll('button:not([disabled])')] as HTMLButtonElement[];
      if (k === 'a' && bs[0]) bs[0].click();
      if (k === 'b') bs.find((b) => b.textContent?.includes('もどる'))?.click();
    };
  }

  /** busy＝ターンの 再生中（おなじ コマンドを うすく 出したまま、おせない ように する） */
  private commandPhase(busy = false) {
    this.activeAlly = -1;
    this.renderParty();
    const st = this.st;
    const hasMeat = ITEM_LIST.some((i) => i.category === 'meat' && (this.game.state.inventory[i.id] ?? 0) > 0);
    const hasItem = ITEM_LIST.some((i) => i.battle && i.category !== 'meat' && (this.game.state.inventory[i.id] ?? 0) > 0);
    const tset = new Set(this.st.allies.map((c) => c.tactic ?? this.st.tactic));
    const tacLabel = tset.size === 1 ? TACTICS.find((t) => t.id === [...tset][0])!.short : 'こべつ';
    // 参考画像3：たたかう／にく、めいれい／さくせん、どうぐ／にげる の 2れつ
    this.setCmds([
      btn('たたかう', () => this.run({ mode: 'auto', player: { kind: 'none' } }), 'primary'),
      btn('にく', () => this.meatPhase(), st.canRecruit && hasMeat ? '' : 'off'),
      btn('めいれい', () => this.orderPhase([], 0)),
      btn(h('span', { class: 'tac' }, 'さくせん', h('span', { class: 'hl' }, tacLabel)), () => this.tacticPhase()),
      btn('どうぐ', () => this.itemPhase(), st.canUseItems && hasItem ? '' : 'off'),
      btn('にげる', () => this.run({ mode: 'auto', player: { kind: 'escape' } }), st.canEscape ? '' : 'off'),
    ], busy ? 'grid2 busy' : 'grid2');
    for (const b of this.cmds.querySelectorAll(busy ? 'button' : '.off')) (b as HTMLButtonElement).disabled = true;
    if (busy) this.keyHandler = null;
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
    this.commandPhase(true);
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
        const av = this.views.get(ev.actor);
        if (av) av.actT = this.frame;
        const s = getSkill(ev.skillId);
        sfx(s.category === 'magic' || s.category === 'breath' ? 'magic' : s.category === 'heal' || s.category === 'revive' ? 'heal' : 'cursor');
        break;
      }
      case 'damage':
        if (v) {
          v.hp = ev.hp;
          v.hitT = this.frame;
          this.pops.push({ key: ev.target, text: String(ev.amount), color: isEnemy ? (ev.weak ? '#ffe040' : '#ffffff') : '#ff9a8a', t0: this.frame });
          if (isEnemy) this.renderEnemies();
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
        if (ev.t === 'heal') this.pops.push({ key: ev.target, text: `+${ev.amount}`, color: '#80ff9a', t0: this.frame });
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
      case 'summon':
        // 台本で ふえた 敵（再生中の 画面にも すぐ 出す）
        this.st.enemies.push(structuredClone(ev.combatant));
        this.views.set(ev.target, this.viewOf(ev.combatant));
        sfx('status');
        break;
      case 'phase': {
        const e = this.st.enemies.find((x) => x.key === ev.target);
        if (e) e.name = ev.name;
        if (v) v.hitT = this.frame;
        sfx('magic');
        break;
      }
      case 'end':
        break;
    }
    if ('text' in ev && ev.text) this.log(ev.text);
    // 待ち時間: こうげきの 連続は みじかく、見せ場（ひっさつ・ひんし）は ふつうに。せつめいだけの イベントは 待たない
    let w = ev.t === 'act' ? 0.5 : ev.t === 'damage' ? (this.hitsAfterAct > 0 ? 0.45 : 0.75) : ev.t === 'faint' ? 0.9 : ev.t === 'end' ? 0 : ev.t === 'miss' ? 0.5 : 0.7;
    if (ev.t === 'act') this.hitsAfterAct = 0; else if (ev.t === 'damage') this.hitsAfterAct++;
    if (!('text' in ev && ev.text) && ev.t !== 'damage') w = Math.min(w, 0.2);
    if (w > 0) await sleep(this.delay * w);
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
      // けっかは まとめて ひょうじ（けいけんち・ゴールド・レベルアップを すくない タップで）
      const special = this.session.firstBoss || this.session.firstSeen.length > 0;
      const lines: string[] = [];
      if (sum.exp) lines.push(`みんなで けいけんちを ${sum.exp} わけあった！`);
      if (sum.gold) lines.push(`${sum.gold}ゴールドを てにいれた！`);
      for (const lu of sum.levelUps) {
        const last = lu.events[lu.events.length - 1];
        const gains = lu.events.reduce((acc, e) => { for (const k of Object.keys(e.gains) as (keyof typeof e.gains)[]) acc[k] = (acc[k] ?? 0) + e.gains[k]; return acc; }, {} as Record<string, number>);
        const gtxt = Object.entries(gains).filter(([, n]) => n > 0).map(([k, n]) => `${STAT_LABEL[k as keyof typeof STAT_LABEL]}+${n}`).join(' ');
        lines.push(`${lu.name}は Lv${last.level}に あがった！\n${gtxt}`);
        for (const e of lu.events) {
          for (const sk of e.learned) lines.push(`${lu.name}は ${getSkill(sk).name}を おぼえた！`);
          for (const u of e.upgraded) lines.push(`${lu.name}の ${getSkill(u.from).name}が ${getSkill(u.to).name}に しんかした！`);
        }
      }
      if (sum.levelUps.length) sfx('levelup');
      const cap = special ? 3 : 4; // 1ページに のせる ぎょうすう
      const pages: string[] = [];
      let cur: string[] = [], n = 0;
      for (const l of lines) {
        const k = l.split('\n').length;
        if (n + k > cap && cur.length) { pages.push(cur.join('\n')); cur = []; n = 0; }
        cur.push(l); n += k;
      }
      if (cur.length) pages.push(cur.join('\n'));
      await say(pages);
      for (const lu of sum.levelUps) {
        const m = this.game.monster(lu.monsterId);
        if (m?.pendingSkills.length) await resolvePending(this.app, m);
      }
      if (sum.recruitBlocked) await say('モンスターが なかまに なりたそうに していたが、ぼくじょうが いっぱいだった…。');
      if (sum.recruit) {
        const rc = sum.recruit;
        await say(`${rc.name}が おきあがって ちかよってきた。\nなかまに なりたいようだ！`);
        if (await this.app.confirm(`${rc.name}を なかまに しますか？`)) {
          const first = !this.game.state.ownedSpeciesIds.includes(rc.speciesId);
          const r = this.game.acceptRecruit(rc.speciesId, rc.level);
          if (r.ok) {
            await recruitFx(this.app, rc.speciesId, first);
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
        if (sum.boss.story.length) await say(sum.boss.story);
      }
    } else if (outcome === 'lose') {
      sfx('lose');
      if (ctx.kind === 'arena') await say(['まけてしまった…。', 'モンスターたちは てあてを うけて げんきに なった。']);
      else await say(['めのまえが まっくらに なった…。', `……${this.game.currentTownMap().name}で めを さました。${sum.goldLost ? `\nおかねを ${sum.goldLost}ゴールド なくしてしまった…。` : ''}`]);
    }
    for (const a of sum.unlocked.areas) await say(`たびのとびらの しんでんの ちかへ すすめるように なった！\n（あたらしい とびら「${getArea(a).name}」）`);
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
