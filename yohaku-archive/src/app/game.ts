// ゲーム全体の進行：区域の移動・イベントの実行・戦闘や因果編集画面の切り替え・セーブ
import { MAP_MAP, type ObjDef, type Warp } from '../data/maps';
import { RECORD_MAP } from '../data/records';
import { ITEM_MAP } from '../data/items';
import { QUEST_MAP, QUESTS, DONE } from '../data/quests';
import { PUZZLE_MAP } from '../data/puzzles';
import type { Cmd, Talk } from '../data/script';
import { CHARS } from '../data/chars';
import {
  addItem, addRecord, applyWorld, cond, condTerm, fullHeal, gainExp, joinParty, marginMax, newGame, partyObs, policyName,
  tolerance, hasSkill, statsOf, type GameState,
} from '../engine/state';
import { emptyEdit, type EditEnv } from '../engine/causal';
import { deserialize, metaOf, serialize, type SaveMeta } from '../engine/save';
import { FieldView, type FieldHost } from '../ui/field';
import { DialogUI, setTextSpeed } from '../ui/dialog';
import { CausalEditor } from '../ui/editor';
import { BattleUI } from '../ui/battle';
import { el, btn, esc, bar } from '../ui/dom';
import { sfx, playBgm, playAmbient, setVolume, setWholeness, unlockAudio } from '../ui/audio';
import { MenuUI, ShopUI } from '../ui/menu';
import { TitleUI } from '../ui/title';
import { getSave, putSave, loadSettings, saveSettings, type Settings } from './storage';

class Abort extends Error {}

const AMBIENT: Record<string, string> = { town: 'town', east: 'town', corridor: 'hollow', tower: 'wind', top: 'wind', archive: '', home: '' };

export class Game implements FieldHost {
  s: GameState = newGame();
  readonly root: HTMLDivElement;
  readonly field: FieldView;
  readonly dlg: DialogUI;
  private hud: HTMLDivElement;
  private actBtn: HTMLButtonElement;
  private scripting = 0;
  private overlay = 0;
  private last = performance.now();
  private playing = false;
  settings: Settings = loadSettings();

  constructor(parent: HTMLElement) {
    this.root = el('div', 'game');
    parent.append(this.root);
    this.field = new FieldView(this);
    this.root.append(this.field.canvas);
    this.hud = el('div', 'hud');
    this.actBtn = btn('調べる', 'act-btn', () => { if (!this.busy()) this.field.interactFacing(); });
    this.root.append(this.hud, this.actBtn);
    this.dlg = new DialogUI(this.root);
    setVolume(this.settings.bgm, this.settings.se);
    setTextSpeed(this.settings.textSpeed);
    window.addEventListener('resize', () => this.field.resize());
    window.addEventListener('keydown', e => {
      if ((e.key === 'Escape' || e.key === 'x' || e.key === 'X' || e.key === 'm' || e.key === 'M') && document.body.dataset.mode === 'field' && !this.busy()) { e.preventDefault(); void this.openMenu(); }
    });
    document.addEventListener('pointerdown', () => unlockAudio(), { once: false });
    this.field.resize();
    requestAnimationFrame(this.tick);
    // 定期的な自動保存（探索中のみ）
    setInterval(() => { if (this.playing && !this.busy()) void this.autosave(true); }, 60000);
  }

  // ---------- FieldHost ----------

  state(): GameState { return this.s; }
  busy(): boolean { return this.scripting > 0 || this.overlay > 0 || !this.playing; }

  interact(kind: 'npc' | 'obj', id: string): void {
    if (this.busy()) return;
    const map = this.field.map;
    if (kind === 'npc') {
      const n = map.npcs.find(x => x.id === id)!;
      const t = this.pickTalk(n.talk);
      if (t) void this.runTop(t.ev);
      return;
    }
    const o = map.objs.find(x => x.id === id)!;
    if (o.kind === 'chest') { void this.runTop(this.chestCmds(o)); return; }
    if (o.kind === 'enemy') { this.encounter(o); return; }
    this.s.flags['seen:' + map.id + ':' + o.id] = 1;
    const t = this.pickTalk(o.talk ?? []);
    if (t) void this.runTop(t.ev);
  }

  private chestCmds(o: ObjDef): Cmd[] {
    sfx('select');
    return [{ t: 'set', f: 'chest:' + o.id }, { t: 'item', id: o.item!, n: o.n ?? 1 }];
  }

  encounter(o: ObjDef): void {
    if (this.busy()) return;
    if (o.talk?.length) { const t = this.pickTalk(o.talk); if (t) void this.runTop(t.ev); return; }
    void this.runTop([{ t: 'battle', id: o.battle!, win: [] }], () => {
      if (o.respawn) this.field.tempDefeated.add(o.id); else this.s.defeated[o.id] = 1;
    });
  }

  warp(w: Warp): void {
    sfx('door');
    void this.enterMap(w.to, w.tx, w.ty, w.dir ?? this.field.dir, true);
  }

  blocked(text: string): void {
    void this.runTop([{ t: 'narr', text }]);
  }

  focusChanged(label: string | null): void {
    this.actBtn.innerHTML = label ? `調べる<small>${esc(label)}</small>` : '';
    this.actBtn.classList.toggle('on', !!label);
  }

  private pickTalk(list: Talk[]): Talk | undefined {
    return list.find(t => cond(this.s, t.cond));
  }

  // ---------- ループ ----------

  private tick = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (this.playing) {
      this.s.playtime += dt;
      this.field.update(dt);
      this.field.render();
    }
    requestAnimationFrame(this.tick);
  };

  // ---------- 開始 ----------

  async showTitle(): Promise<void> {
    this.playing = false;
    document.body.dataset.mode = 'title';
    this.hud.innerHTML = '';
    playBgm('title');
    const auto = await getSave('auto');
    const t = new TitleUI(this.root, !!auto);
    const choice = await t.run();
    unlockAudio();
    if (choice.kind === 'new') await this.startNew();
    else if (choice.kind === 'continue') await this.loadFrom('auto');
    else if (choice.kind === 'load') await this.loadFrom(choice.slot);
    else if (choice.kind === 'import') { const s = deserialize(choice.text); if (s) await this.startWith(s); else { await this.dlg.panel('<p>セーブデータを読み込めなかった。</p>', ['OK']); await this.showTitle(); } }
  }

  private async startNew(): Promise<void> {
    await this.startWith(newGame());
  }

  async loadFrom(slot: string): Promise<boolean> {
    const text = await getSave(slot);
    const s = text ? deserialize(text) : null;
    if (!s) { await this.dlg.panel('<p>セーブデータがない、または壊れている。</p>', ['OK']); await this.showTitle(); return false; }
    await this.startWith(s);
    return true;
  }

  async startWith(s: GameState): Promise<void> {
    this.s = s;
    this.scripting = 0;
    this.overlay = 0;
    this.playing = true;
    document.body.dataset.mode = 'field';
    await this.enterMap(s.map, s.x, s.y, s.dir, true);
  }

  async enterMap(mapId: string, x: number, y: number, dir: 0 | 1 | 2 | 3, runOnEnter: boolean): Promise<void> {
    const m = MAP_MAP.get(mapId)!;
    this.s.map = mapId; this.s.x = x; this.s.y = y; this.s.dir = dir;
    this.field.load(mapId, x, y, dir);
    this.updateAudio();
    this.renderHud();
    if (runOnEnter) {
      const t = (m.onEnter ?? []).find(o => cond(this.s, o.cond));
      if (t) await this.runTop(t.ev);
      else if (this.playing) void this.autosave(true);
    }
  }

  private updateAudio(): void {
    const m = this.field.map;
    const s = this.s;
    let w = 0.35;
    if (s.flags.end_bell || s.flags.end_share) w = 1;
    else if (s.flags.end_free) w = 0.8;
    else if (s.flags.end_keep) w = 0.55;
    else if (s.flags.chapter1) w = 0.45 + Math.min(0.3, s.world.repaired * 0.05);
    setWholeness(w);
    playBgm(m.bgm);
    playAmbient(this.field.isNight() ? '' : AMBIENT[m.theme] ?? '');
  }

  // ---------- HUD ----------

  renderHud(): void {
    const s = this.s;
    const m = this.field.map;
    const main = QUESTS.filter(q => q.kind === 'main').map(q => ({ q, st: s.quests[q.id] ?? 0 })).filter(x => x.st > 0 && x.st < DONE);
    const cur = main[main.length - 1];
    const obj = cur ? cur.q.stages[cur.st] : s.flags.chapter1_done ? '第一章クリア。街を歩き、残った謎を調べよう。' : s.flags.p_start ? '左奥の棚（第三区の死亡記録）を調べる' : '';
    this.hud.innerHTML = `
      <div class="hud-loc"><b>${esc(m.name)}</b><span>${esc(obj)}</span></div>
      <div class="hud-right"><span class="pill margin">余白 <b>${s.margin}</b>/${marginMax(s)}</span></div>`;
    const mb = btn('☰<small>メニュー</small>', 'menu-btn', () => { if (!this.busy()) void this.openMenu(); });
    this.hud.querySelector('.hud-right')!.append(mb);
    const party = el('div', 'hud-party');
    for (const c of s.party) {
      const mem = s.members[c]!;
      party.append(el('div', 'hp-mini', `<span>${esc(CHARS[c].name)} ${mem.hp}/${statsOf(s, c).hp}</span>${bar(mem.hp, statsOf(s, c).hp, 'hp')}`));
    }
    this.hud.append(party);
  }

  async openMenu(): Promise<void> {
    this.overlay++;
    document.body.dataset.mode = 'menu';
    sfx('select');
    const menu = new MenuUI(this.root, this);
    await menu.run();
    this.overlay--;
    document.body.dataset.mode = 'field';
    this.field.refresh();
    this.renderHud();
  }

  // ---------- セーブ ----------

  async autosave(quiet = false): Promise<void> {
    this.s.savedAt = Date.now();
    await putSave('auto', serialize(this.s));
    if (!quiet) this.dlg.toast('自動セーブしました', 'save');
  }

  async saveSlot(slot: string): Promise<void> {
    this.s.savedAt = Date.now();
    await putSave(slot, serialize(this.s));
    await putSave('meta:' + slot, JSON.stringify(metaOf(slot, this.s, this.field.map.name)));
  }

  async slotMeta(slot: string): Promise<SaveMeta | null> {
    const t = await getSave('meta:' + slot);
    try { return t ? JSON.parse(t) : null; } catch { return null; }
  }

  applySettings(st: Settings): void {
    this.settings = st;
    saveSettings(st);
    setVolume(st.bgm, st.se);
    setTextSpeed(st.textSpeed);
  }

  // ---------- 因果編集の環境 ----------

  editEnv(): EditEnv {
    const s = this.s;
    return {
      records: new Set(s.records),
      obs: partyObs(s),
      margin: s.margin,
      tolerance: tolerance(s),
      unlocked: new Set(s.unlocked),
      costDown: hasSkill(s, 's_costdown') ? 1 : 0,
      shards: s.inv.shard ?? 0,
    };
  }

  /** パズルの結末条件に使う世界の状態（w:keep>=1 など） */
  worldTerm = (t: string): boolean | undefined => (t.startsWith('w:') ? condTerm(this.s, t) : undefined);

  // ---------- イベントの実行 ----------

  async runTop(cmds: Cmd[], after?: () => void): Promise<void> {
    this.scripting++;
    document.body.dataset.mode = 'event';
    this.focusChanged(null);
    try {
      await this.run(cmds);
      after?.();
    } catch (e) {
      if (e instanceof Abort) {
        this.scripting = 0;
        await this.loadFrom('auto');
        return;
      }
      console.error(e);
    } finally {
      if (this.scripting > 0) this.scripting--;
      if (this.scripting === 0 && this.playing) document.body.dataset.mode = this.overlay ? 'menu' : 'field';
      this.field.refresh();
      this.renderHud();
    }
  }

  async run(cmds: Cmd[]): Promise<void> {
    for (const c of cmds) await this.exec(c);
  }

  private async exec(c: Cmd): Promise<void> {
    const s = this.s;
    switch (c.t) {
      case 'say': await this.dlg.say(c.who, c.text); break;
      case 'narr': await this.dlg.say('', c.text); break;
      case 'scene': await this.dlg.scene(c.lines, c.title); break;
      case 'choice': {
        const opts = c.opts.map(o => ({ label: o.label, disabled: !!o.cond && !cond(s, o.cond) }));
        const i = await this.dlg.choice(c.q, opts);
        await this.run(c.opts[i].ev);
        break;
      }
      case 'set': s.flags[c.f] = c.v ?? 1; this.field.refresh(); break;
      case 'rec': {
        if (addRecord(s, c.id)) {
          sfx('record');
          const r = RECORD_MAP.get(c.id)!;
          this.dlg.toast(`<b>記録</b>「${esc(r.title)}」を得た`, 'record');
        }
        break;
      }
      case 'item': {
        const n = c.n ?? 1;
        if (c.id.startsWith('gold')) {
          const g = Number(c.id.slice(4)) || 100;
          s.gold += g;
          this.dlg.toast(`${g}灰貨を手に入れた`);
          sfx('record');
          break;
        }
        addItem(s, c.id, n);
        const it = ITEM_MAP.get(c.id)!;
        sfx('record');
        this.dlg.toast(`<b>入手</b>${esc(it.name)}${n > 1 ? ` ×${n}` : ''}`);
        break;
      }
      case 'gold': s.gold = Math.max(0, s.gold + c.n); break;
      case 'margin': s.margin = c.n === 'full' ? marginMax(s) : Math.max(0, Math.min(marginMax(s), s.margin + c.n)); break;
      case 'quest': {
        const prev = s.quests[c.id] ?? 0;
        if (prev === c.stage) break;
        if (prev === DONE) break;
        s.quests[c.id] = c.stage;
        const q = QUEST_MAP.get(c.id)!;
        if (c.stage === DONE) { this.dlg.toast(`<b>${q.kind === 'main' ? 'メイン' : 'サイド'}クエスト達成</b>${esc(q.title)}`, 'quest'); sfx('levelup'); void this.autosave(true); }
        else if (prev === 0) this.dlg.toast(`<b>新しいクエスト</b>${esc(q.title)}`, 'quest');
        else this.dlg.toast(`<b>クエスト更新</b>${esc(q.stages[c.stage])}`, 'quest');
        break;
      }
      case 'puzzle': await this.puzzle(c); break;
      case 'battle': {
        this.overlay++;
        const ui = new BattleUI(this.root, s, this.dlg, () => void this.autosave(true));
        const r = await ui.run(c.id);
        this.overlay--;
        document.body.dataset.mode = 'event';
        this.updateAudio();
        this.renderHud();
        if (r === 'lose') throw new Abort();
        if (r === 'win') await this.run(c.win ?? []);
        else if (r === 'escape') await this.run(c.escape ?? []);
        break;
      }
      case 'warp': await this.enterMap(c.map, c.x, c.y, c.dir ?? 2, false); break;
      case 'join': joinParty(s, c.who); sfx('levelup'); this.renderHud(); break;
      case 'if': await this.run(cond(s, c.c) ? c.then : c.else ?? []); break;
      case 'world': applyWorld(s, c.key, c.n); break;
      case 'exp': {
        const msgs = gainExp(s, c.n);
        for (const m of msgs) { this.dlg.toast(esc(m), 'level'); sfx('levelup'); }
        break;
      }
      case 'heal': fullHeal(s); break;
      case 'unlock': if (!s.unlocked.includes(c.op)) s.unlocked.push(c.op); sfx('restore'); break;
      case 'save': await this.autosave(); break;
      case 'shop': {
        this.overlay++;
        await new ShopUI(this.root, this, c.id).run();
        this.overlay--;
        break;
      }
      case 'sound': sfx(c.id); break;
      case 'end': await this.chapterEnd(); break;
      case 'sp': for (const p of s.party) s.members[p]!.sp += c.n; this.dlg.toast(`スキルポイント+${c.n}（メニューの「スキル」で習得）`, 'level'); break;
      case 'toast': this.dlg.toast(esc(c.text)); break;
      case 'flash': await this.dlg.flash(); break;
      case 'title': await this.dlg.titleCard(c.text, c.sub); break;
      case 'summary': await this.summary(); break;
      case 'learnHint': this.dlg.toast(esc(c.text)); break;
    }
  }

  private async puzzle(c: Extract<Cmd, { t: 'puzzle' }>): Promise<void> {
    const g = PUZZLE_MAP.get(c.id)!;
    const s = this.s;
    this.overlay++;
    document.body.dataset.mode = 'editor';
    const ed = new CausalEditor(this.root, g, s.graphs[c.id] && !s.outcomes[c.id] ? s.graphs[c.id] : emptyEdit(), () => this.editEnv(), {
      kind: 'puzzle', predict: hasSkill(s, 's_predict'),
    }, this.worldTerm);
    const r = await ed.open();
    this.overlay--;
    document.body.dataset.mode = 'event';
    if (!r) { await this.run(c.cancel ?? []); return; }
    s.graphs[c.id] = r.edit;
    s.outcomes[c.id] = r.outcome;
    s.margin = Math.max(0, s.margin - r.spent);
    if (r.shards) addItem(s, 'shard', -r.shards);
    this.renderHud();
    void this.autosave(true);
    await this.run(c.out[r.outcome] ?? []);
  }

  private async summary(): Promise<void> {
    const s = this.s;
    const w = s.world;
    const html = `<h2>灰鐘市の記録</h2>
      <div class="sum-row"><span>地域の安定度</span>${bar(w.stability, 100, 'stab')}<b>${w.stability}</b></div>
      <div class="sum-row"><span>修復した因果</span><b>${w.repaired}</b></div>
      <div class="sum-row"><span>未解決の矛盾</span><b>${w.contras}</b></div>
      <div class="sum-row"><span>ドランとの信頼</span>${bar(w.trust, 100, 'trust')}<b>${w.trust}</b></div>
      <div class="sum-row"><span>発見した記録</span><b>${s.records.length}</b></div>
      <div class="sum-row"><span>世界簿への方針</span><b>${esc(policyName(s))}</b></div>
      <p class="sum-note">修復 ${w.policy.restore}／解放 ${w.policy.free}／保持 ${w.policy.keep}　——これらの記録は、この先の章で世界簿の扱いに影響する。</p>`;
    await this.dlg.panel(html, ['つづける'], 'summary');
  }

  private async chapterEnd(): Promise<void> {
    playBgm('end');
    const ending = this.s.flags.end_share ? '鐘を合図として分かち合う' : this.s.flags.end_bell ? '鐘の音を復元する' : this.s.flags.end_free ? '鐘から解き放つ' : '今のまま、トワに街を支えてもらう';
    const html = `<div class="end-title">第一章　完</div><div class="end-sub">繰り返される街　——「${esc(ending)}」</div>
      <p>灰鐘市の朝は、あなたの選んだ原因で始まるようになった。</p>
      <p class="next">次章『未来から流れる森』（逆流林）は今後の更新で。<br>このまま灰鐘市を歩き、残ったクエストや記録を集められます。</p>`;
    await this.dlg.panel(html, ['灰鐘市にもどる'], 'chapter-end');
    this.updateAudio();
  }

  questSummary(): { title: string; text: string; done: boolean; kind: string }[] {
    return QUESTS.filter(q => (this.s.quests[q.id] ?? 0) > 0).map(q => {
      const st = this.s.quests[q.id];
      return { title: q.title, text: q.stages[st] ?? '', done: st === DONE, kind: q.kind };
    });
  }

  newGameState(): GameState { return newGame(); }

  /** メニューから仮説ボードを開く */
  async openHypothesis(): Promise<void> {
    await this.runTop([{ t: 'narr', text: '記録を広げ、仮説を立ててみる。' }, {
      t: 'puzzle', id: 'p_town',
      out: { o_solved: [
        { t: 'say', who: 'セイル', text: '鐘の音と住人の行動の因果は切れている。それなのに住人は動いている。……鐘の代わりに何かが、鐘楼の中から街を動かしている' },
        { t: 'set', f: 'hypo_done' }, { t: 'quest', id: 'mq1', stage: 3 }, { t: 'exp', n: 30 },
        { t: 'narr', text: '鐘楼の門を調べてみよう。' },
      ] },
    }]);
  }

  async useLensHere(): Promise<void> {
    this.field.refresh();
  }

  statsLine(id: 'seil' | 'dran'): string {
    return CHARS[id].name;
  }
}
