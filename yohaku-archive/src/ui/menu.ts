// メニュー（状態・スキル・装備・道具・記録・クエスト・世界・セーブ・設定）と店
import type { Game } from '../app/game';
import { CHARS, expToNext, type CharId } from '../data/chars';
import { ITEMS, ITEM_MAP, SHOP_STOCK, type Slot } from '../data/items';
import { SKILLS, SKILL_MAP } from '../data/skills';
import { RECORDS, RECORD_MAP } from '../data/records';
import { PUZZLE_MAP } from '../data/puzzles';
import {
  addItem, canLearn, cond, equip, hasSkill, learn, marginMax, policyName, statsOf, tolerance, useItemField,
} from '../engine/state';
import { evaluate, emptyEdit } from '../engine/causal';
import { deserialize, serialize } from '../engine/save';
import { el, btn, esc, bar } from './dom';
import { sfx } from './audio';
import { CausalEditor } from './editor';

const TABS = ['状態', 'スキル', '装備', '道具', '記録', 'クエスト', '世界', 'セーブ', '設定'] as const;
type Tab = typeof TABS[number];

/** 未発見の記録のありか（観測系スキル「未発見の示唆」） */
const RECORD_HINTS: Record<string, string> = {
  r_bell_log: '記録保管所の左下の棚', r_repair: '記録保管所のヘルド', r_diary: 'パン屋のマルタ', r_work: '帳簿係のオルネ',
  r_gate_duty: '鐘楼の門番', r_smoke: 'ガルトと話したあとのマルタ', r_dran_paper: '宿のテラスの大男', r_gear: '鐘楼一階の机',
  r_mother2: '鐘楼一階の歯車の隙間', r_inscription: '鐘楼二階の石像の台座', r_signal: '鐘楼二階の床（観測14以上か観測薬）',
  r_br_receipt: '運河のそばの老人', r_br_diary: '宿のおかみ', r_br_pillar: '運河のほとり', r_br_collapse: 'ヘルド（橋について調べ始めたら）',
  r_br_forged: '記録保管所の公文書の棚（観測12以上か観測薬）', r_fl_order: '花屋のネリ', r_fl_grave: '広場の隅の献花台',
  r_fl_rumor: '市場の果物売り（ネリの話を聞いたあと）', r_dran_memory: 'ドランを連れて献花台へ', r_vault: '時計組合の見習い（門が開いたあと）',
};

export class MenuUI {
  private ov: HTMLDivElement;
  private body!: HTMLDivElement;
  private tab: Tab = '状態';
  private who: CharId = 'seil';
  private done!: () => void;
  private keyH = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); this.close(); } };

  constructor(private parent: HTMLElement, private game: Game) {
    this.ov = el('div', 'menu');
  }

  run(): Promise<void> {
    this.parent.append(this.ov);
    window.addEventListener('keydown', this.keyH);
    this.render();
    return new Promise(r => { this.done = r; });
  }

  private close(): void {
    sfx('cancel');
    window.removeEventListener('keydown', this.keyH);
    this.ov.remove();
    this.done();
  }

  private render(): void {
    const s = this.game.s;
    this.ov.innerHTML = '';
    const head = el('div', 'menu-head');
    head.innerHTML = `<b>余白のアーカイブ</b><span>灰貨 ${s.gold}</span><span>余白 ${s.margin}/${marginMax(s)}</span><span>${formatTime(s.playtime)}</span>`;
    head.append(btn('閉じる ✕', 'small', () => this.close()));
    const tabs = el('div', 'menu-tabs');
    for (const t of TABS) tabs.append(btn(t, 'tab' + (t === this.tab ? ' on' : ''), () => { sfx('blip'); this.tab = t; this.render(); }));
    this.body = el('div', 'menu-body');
    this.ov.append(head, tabs, this.body);
    switch (this.tab) {
      case '状態': this.status(); break;
      case 'スキル': this.skills(); break;
      case '装備': this.equipTab(); break;
      case '道具': this.items(); break;
      case '記録': this.records(); break;
      case 'クエスト': this.quests(); break;
      case '世界': this.world(); break;
      case 'セーブ': void this.saves(); break;
      case '設定': this.settings(); break;
    }
  }

  private whoTabs(): HTMLDivElement {
    const s = this.game.s;
    const row = el('div', 'who-tabs');
    if (!s.party.includes(this.who)) this.who = 'seil';
    for (const c of s.party) row.append(btn(CHARS[c].name, 'tab' + (c === this.who ? ' on' : ''), () => { this.who = c; this.render(); }));
    return row;
  }

  private status(): void {
    const s = this.game.s;
    for (const c of s.party) {
      const m = s.members[c]!;
      const st = statsOf(s, c);
      const card = el('div', 'card');
      card.innerHTML = `<div class="card-h"><b>${CHARS[c].name}</b><span>${CHARS[c].role}　Lv${m.level}</span></div>
        <div class="stat-grid">
          <span>HP</span><b>${m.hp}/${st.hp}</b><span>AP</span><b>${m.ap}/${st.ap}</b>
          <span>ATK</span><b>${st.atk}</b><span>DEF</span><b>${st.def}</b>
          <span>OBS</span><b>${st.obs}</b><span>EDIT</span><b>${st.edit}</b>
        </div>
        ${bar(m.exp, expToNext(m.level), 'exp')}<div class="small">次のレベルまで ${expToNext(m.level) - m.exp}</div>
        <div class="belief">信念：「${esc(CHARS[c].belief)}」</div>`;
      this.body.append(card);
    }
    const info = el('div', 'card');
    info.innerHTML = `<div class="card-h"><b>編纂</b></div>
      <div class="small">余白の上限 ${marginMax(s)}（EDIT が高いほど増える）／矛盾の許容量 ${tolerance(s)}</div>
      <div class="small">使える操作：${s.unlocked.map(o => ({ connect: '接続', cut: '切断', invert: '反転', hold: '保留' }[o])).join('・')}</div>
      <div class="small">OBS が高いほど、隠された調査対象や敵の条件が見える。</div>`;
    this.body.append(info);
  }

  private skills(): void {
    const s = this.game.s;
    this.body.append(this.whoTabs());
    const m = s.members[this.who]!;
    this.body.append(el('div', 'small', `スキルポイント：<b>${m.sp}</b>（レベルアップや物語の節目で得られる）`));
    for (const branch of ['編纂', '観測', '干渉'] as const) {
      const list = SKILLS.filter(k => k.owner === this.who && k.branch === branch);
      if (!list.length) continue;
      this.body.append(el('div', 'sec', `${branch}系`));
      for (const k of list) {
        const owned = m.skills.includes(k.id);
        const chk = canLearn(s, this.who, k.id);
        const row = el('div', 'skill' + (owned ? ' owned' : ''));
        row.innerHTML = `<div><b>${esc(k.name)}</b> <small>${k.passive ? '常時' : `AP${k.ap}`}・SP${k.sp}${k.lv ? `・Lv${k.lv}〜` : ''}${k.req ? `・要「${esc(SKILL_MAP.get(k.req)!.name)}」` : ''}</small><div class="small">${esc(k.desc)}</div></div>`;
        if (owned) row.append(el('span', 'tag', '習得済'));
        else {
          const b = btn('習得', 'small primary', () => { if (learn(s, this.who, k.id)) { sfx('levelup'); this.render(); } });
          b.disabled = !chk.ok;
          if (!chk.ok) b.title = chk.reason ?? '';
          row.append(b);
          if (!chk.ok) row.append(el('span', 'tag off', esc(chk.reason ?? '')));
        }
        this.body.append(row);
      }
    }
  }

  private equipTab(): void {
    const s = this.game.s;
    this.body.append(this.whoTabs());
    const m = s.members[this.who]!;
    const names: Record<Slot, string> = { weapon: '武器', armor: '防具', acc: '装飾' };
    for (const slot of ['weapon', 'armor', 'acc'] as Slot[]) {
      const cur = m.equip[slot] ? ITEM_MAP.get(m.equip[slot]!) : null;
      const row = el('div', 'card');
      row.innerHTML = `<div class="card-h"><b>${names[slot]}</b><span>${cur ? esc(cur.name) : '（なし）'}</span></div>${cur ? `<div class="small">${esc(cur.desc)}</div>` : ''}`;
      const opts = el('div', 'eq-opts');
      for (const it of ITEMS.filter(i => i.slot === slot && (s.inv[i.id] ?? 0) > 0 && (!i.owner || i.owner === this.who))) {
        const st = Object.entries(it.stats ?? {}).map(([k, v]) => `${k.toUpperCase()}${(v as number) > 0 ? '+' : ''}${v}`).join(' ');
        opts.append(btn(`${esc(it.name)}<small>${st}</small>`, 'small', () => { equip(s, this.who, it.id, slot); sfx('select'); this.render(); }));
      }
      if (cur) opts.append(btn('外す', 'small', () => { equip(s, this.who, null, slot); this.render(); }));
      row.append(opts);
      this.body.append(row);
    }
  }

  private items(): void {
    const s = this.game.s;
    const entries = Object.entries(s.inv).filter(([, n]) => n > 0);
    if (!entries.length) this.body.append(el('div', 'hint', '何も持っていない。'));
    for (const [id, n] of entries) {
      const it = ITEM_MAP.get(id);
      if (!it) continue;
      const row = el('div', 'item-row');
      row.innerHTML = `<div><b>${esc(it.name)}</b> ×${n}<div class="small">${esc(it.desc)}</div></div>`;
      if (it.use?.field) {
        if (it.use.target === 'ally') {
          for (const c of s.party) row.append(btn(CHARS[c].name + 'に', 'small', () => this.use(id, c)));
        } else row.append(btn('使う', 'small', () => this.use(id)));
      }
      this.body.append(row);
    }
  }

  private use(id: string, c?: CharId): void {
    const msg = useItemField(this.game.s, id, c);
    if (msg) { sfx('heal'); this.game.dlg.toast(esc(msg)); this.game.field.refresh(); } else { sfx('cancel'); this.game.dlg.toast('今は使っても意味がない。'); }
    this.render();
  }

  private records(): void {
    const s = this.game.s;
    const found = RECORDS.filter(r => s.records.includes(r.id));
    // 仮説
    const hyp = el('div', 'card');
    hyp.innerHTML = `<div class="card-h"><b>因果の仮説</b><span>これまでに編集した因果</span></div>`;
    const row = el('div', 'eq-opts');
    if ((s.quests.mq1 ?? 0) === 2) row.append(btn('仮説を立てる（灰鐘市の朝）', 'small primary', () => { this.close(); void this.game.openHypothesis(); }));
    for (const [id, edit] of Object.entries(s.graphs)) {
      const g = PUZZLE_MAP.get(id);
      if (!g || !s.outcomes[id]) continue;
      row.append(btn(esc(g.title), 'small', async () => {
        const ed = new CausalEditor(this.ov, g, edit, () => this.game.editEnv(), { kind: 'view' }, this.game.worldTerm);
        await ed.open();
      }));
    }
    if (!row.childElementCount) row.append(el('span', 'small', 'まだない。'));
    hyp.append(row);
    this.body.append(hyp);
    // 未解決の矛盾
    const contra = el('div', 'card');
    const lines: string[] = [];
    for (const [id, edit] of Object.entries(s.graphs)) {
      const g = PUZZLE_MAP.get(id);
      if (!g || g.kind === 'hypothesis' || !s.outcomes[id]) continue;
      for (const c of evaluate(g, edit ?? emptyEdit()).contras) lines.push(`⚡ ${esc(c.text)}（${esc(g.title)}）`);
    }
    contra.innerHTML = `<div class="card-h"><b>未解決の矛盾</b><span>${lines.length}</span></div>${lines.map(l => `<div class="small">${l}</div>`).join('') || '<div class="small">なし</div>'}`;
    this.body.append(contra);
    for (const cat of ['人物', '地域', '出来事', '世界'] as const) {
      const list = found.filter(r => r.cat === cat);
      if (!list.length) continue;
      this.body.append(el('div', 'sec', `${cat}（${list.length}）`));
      for (const r of list) {
        const d = el('details', 'rec');
        d.innerHTML = `<summary>${r.key ? '◆ ' : ''}${esc(r.title)}${r.who ? `<small>${esc(r.who)}</small>` : ''}</summary><p>${esc(r.text)}</p>`;
        this.body.append(d);
      }
    }
    if (hasSkill(s, 's_hint')) {
      const missing = RECORDS.filter(r => !s.records.includes(r.id) && RECORD_HINTS[r.id]);
      if (missing.length) {
        this.body.append(el('div', 'sec', '未発見の示唆'));
        for (const r of missing.slice(0, 8)) this.body.append(el('div', 'small', `・どこかに記録がある：${esc(RECORD_HINTS[r.id])}`));
      }
    }
  }

  private quests(): void {
    const qs = this.game.questSummary();
    if (!qs.length) this.body.append(el('div', 'hint', 'まだクエストはない。'));
    for (const kind of ['main', 'side']) {
      const list = qs.filter(q => q.kind === kind);
      if (!list.length) continue;
      this.body.append(el('div', 'sec', kind === 'main' ? 'メインクエスト' : 'サイドクエスト'));
      for (const q of list) {
        const c = el('div', 'card' + (q.done ? ' done' : ''));
        c.innerHTML = `<div class="card-h"><b>${esc(q.title)}</b><span>${q.done ? '達成' : '進行中'}</span></div><div class="small">${esc(q.text)}</div>`;
        this.body.append(c);
      }
    }
  }

  private world(): void {
    const s = this.game.s;
    const w = s.world;
    const c = el('div', 'card');
    c.innerHTML = `<div class="card-h"><b>灰鐘市</b><span>世界の状態</span></div>
      <div class="sum-row"><span>地域の安定度</span>${bar(w.stability, 100, 'stab')}<b>${w.stability}</b></div>
      <div class="sum-row"><span>修復した因果</span><b>${w.repaired}</b></div>
      <div class="sum-row"><span>未解決の矛盾</span><b>${w.contras}</b></div>
      <div class="sum-row"><span>ドランとの信頼</span>${bar(w.trust, 100, 'trust')}<b>${s.party.includes('dran') ? w.trust : '—'}</b></div>
      <div class="sum-row"><span>発見した重要記録</span><b>${s.records.filter(r => RECORD_MAP.get(r)?.key).length}</b></div>
      <div class="sum-row"><span>世界簿への方針</span><b>${esc(policyName(s))}</b></div>
      <div class="small">修復 ${w.policy.restore}／解放 ${w.policy.free}／保持 ${w.policy.keep}</div>
      <div class="small">選択の結果は、住人の台詞・店の品ぞろえ・通れる場所・物語の結末に反映される。</div>`;
    this.body.append(c);
    const ch = el('div', 'card');
    const chosen: string[] = [];
    const o = s.outcomes;
    const label = (pid: string) => { const g = PUZZLE_MAP.get(pid); const oc = g?.outcomes?.find(x => x.id === o[pid]); return g && oc ? `${g.title}：${oc.label}` : ''; };
    for (const pid of ['p_mother', 'p_gate', 'p_gear', 'p_bridge', 'p_florist', 'p_vault', 'p_morning']) if (o[pid]) chosen.push(label(pid));
    ch.innerHTML = `<div class="card-h"><b>重要な選択の履歴</b></div>${chosen.map(c2 => `<div class="small">・${esc(c2)}</div>`).join('') || '<div class="small">まだない。</div>'}`;
    this.body.append(ch);
    void cond;
  }

  private async saves(): Promise<void> {
    const box = this.body;
    box.append(el('div', 'small', '自動セーブは、戦闘・クエスト・重要な選択・区域の移動のたびに行われます。'));
    for (const slot of ['slot1', 'slot2', 'slot3']) {
      const meta = await this.game.slotMeta(slot);
      const row = el('div', 'card');
      row.innerHTML = `<div class="card-h"><b>スロット${slot.slice(4)}</b><span>${meta ? `${esc(meta.chapter)}・Lv${meta.level}・${esc(meta.map)}` : '空き'}</span></div>${meta ? `<div class="small">${new Date(meta.savedAt).toLocaleString('ja-JP')}　プレイ ${formatTime(meta.playtime)}</div>` : ''}`;
      const ops = el('div', 'eq-opts');
      ops.append(btn('ここにセーブ', 'small primary', async () => { await this.game.saveSlot(slot); sfx('record'); this.game.dlg.toast('セーブしました'); this.render(); }));
      if (meta) ops.append(btn('ロード', 'small', async () => { window.removeEventListener('keydown', this.keyH); this.ov.remove(); this.done(); await this.game.loadFrom(slot); }));
      row.append(ops);
      box.append(row);
    }
    const ex = el('div', 'card');
    ex.innerHTML = `<div class="card-h"><b>エクスポート／インポート</b></div><div class="small">ブラウザのデータ消去に備えて、セーブデータを書き出せます。</div>`;
    const ops = el('div', 'eq-opts');
    ops.append(btn('ファイルに書き出す', 'small', () => {
      const blob = new Blob([serialize(this.game.s)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `yohaku-archive-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }));
    ops.append(btn('文字列をコピー', 'small', async () => {
      try { await navigator.clipboard.writeText(serialize(this.game.s)); this.game.dlg.toast('コピーしました'); } catch { this.game.dlg.toast('コピーできませんでした'); }
    }));
    const file = document.createElement('input');
    file.type = 'file'; file.accept = '.json,application/json'; file.style.display = 'none';
    file.addEventListener('change', async () => {
      const f = file.files?.[0];
      if (!f) return;
      const s = deserialize(await f.text());
      if (!s) { this.game.dlg.toast('読み込めませんでした'); return; }
      window.removeEventListener('keydown', this.keyH);
      this.ov.remove(); this.done();
      await this.game.startWith(s);
    });
    ops.append(btn('ファイルから読み込む', 'small', () => file.click()), file);
    ex.append(ops);
    box.append(ex);
  }

  private settings(): void {
    const st = { ...this.game.settings };
    const c = el('div', 'card');
    const slider = (label: string, key: 'bgm' | 'se', ) => {
      const row = el('label', 'set-row', `<span>${label}</span>`);
      const inp = document.createElement('input');
      inp.type = 'range'; inp.min = '0'; inp.max = '1'; inp.step = '0.05'; inp.value = String(st[key]);
      inp.addEventListener('input', () => { st[key] = Number(inp.value); this.game.applySettings(st); });
      row.append(inp);
      return row;
    };
    c.append(slider('音楽', 'bgm'), slider('効果音', 'se'));
    const sp = el('label', 'set-row', '<span>文字の速さ</span>');
    const sel = document.createElement('select');
    for (const [v, l] of [[18, 'ゆっくり'], [32, 'ふつう'], [60, 'はやい'], [400, '一瞬']] as const) {
      const o = document.createElement('option'); o.value = String(v); o.textContent = l; if (st.textSpeed === v) o.selected = true; sel.append(o);
    }
    sel.addEventListener('change', () => { st.textSpeed = Number(sel.value); this.game.applySettings(st); });
    sp.append(sel);
    c.append(sp);
    c.append(el('div', 'small', '操作：タップで移動・調べる／PCは矢印キー・WASDで移動、Enter・Spaceで調べる、Esc・Mでメニュー。'));
    c.append(btn('タイトルへ戻る（自動セーブします）', 'small', async () => { await this.game.autosave(true); window.removeEventListener('keydown', this.keyH); this.ov.remove(); this.done(); await this.game.showTitle(); }));
    this.body.append(c);
  }
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
}

export class ShopUI {
  private ov: HTMLDivElement;
  private done!: () => void;
  constructor(private parent: HTMLElement, private game: Game, private shopId: string) {
    this.ov = el('div', 'menu shop');
  }

  run(): Promise<void> {
    this.parent.append(this.ov);
    this.render();
    return new Promise(r => { this.done = r; });
  }

  private render(): void {
    const s = this.game.s;
    this.ov.innerHTML = '';
    const head = el('div', 'menu-head', `<b>店</b><span>灰貨 ${s.gold}</span>`);
    head.append(btn('店を出る ✕', 'small', () => { this.ov.remove(); this.done(); }));
    const body = el('div', 'menu-body');
    body.append(el('div', 'sec', '買う'));
    for (const id of SHOP_STOCK[this.shopId] ?? []) {
      const it = ITEM_MAP.get(id)!;
      const row = el('div', 'item-row');
      row.innerHTML = `<div><b>${esc(it.name)}</b> <small>${it.price}灰貨・所持${s.inv[id] ?? 0}</small><div class="small">${esc(it.desc)}</div></div>`;
      const b = btn('買う', 'small primary', () => { if (s.gold >= it.price!) { s.gold -= it.price!; addItem(s, id); sfx('select'); this.render(); } });
      b.disabled = s.gold < (it.price ?? 0);
      row.append(b);
      body.append(row);
    }
    body.append(el('div', 'sec', '売る'));
    for (const [id, n] of Object.entries(s.inv)) {
      const it = ITEM_MAP.get(id);
      if (!it || !it.price || n <= 0) continue;
      const row = el('div', 'item-row');
      row.innerHTML = `<div><b>${esc(it.name)}</b> ×${n} <small>${Math.floor(it.price / 2)}灰貨で売れる</small></div>`;
      row.append(btn('売る', 'small', () => { addItem(s, id, -1); s.gold += Math.floor(it.price! / 2); sfx('select'); this.render(); }));
      body.append(row);
    }
    this.ov.append(head, body);
  }
}
