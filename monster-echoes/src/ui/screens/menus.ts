import { getItem, ITEM_LIST } from '../../data/items';
import { getSkill } from '../../data/skills';
import type { Tactic } from '../../data/types';
import { displayName } from '../../domain/monster/MonsterFactory';
import { isFieldSkill } from '../../domain/monster/FieldSkills';
import type { MonsterInstance } from '../../domain/monster/types';
import { setSoundEnabled, sfx } from '../../infrastructure/audio/Sound';
import { migrate } from '../../infrastructure/save/SaveMigration';
import type { App } from '../App';
import { btn, h, item } from '../dom';
import { hpText, monIcon, monLabel, monsterDetailBody } from '../components/monster';

export const TACTICS: { id: Tactic; name: string; short: string; desc: string }[] = [
  { id: 'attack', name: 'こうげき ゆうせん', short: 'こうげき', desc: 'てきへの ダメージを いちばんに かんがえる' },
  { id: 'skill', name: 'とくぎ かつよう', short: 'とくぎ', desc: 'とくぎや じゅもんを どんどん つかう' },
  { id: 'support', name: 'かいふく・しえん', short: 'しえん', desc: 'みかたの かいふくと ほじょを だいじに する' },
  { id: 'save', name: 'MP せつやく', short: 'せつやく', desc: 'MPを つかう とくぎを ひかえる' },
  { id: 'nomagic', name: 'じゅもん つかうな', short: 'じゅもんなし', desc: 'MPを つかう じゅもん・とくぎを いっさい つかわない' },
];

// ---------------------------------------------------------------- フィールドメニュー
export function openFieldMenu(app: App, onClose: () => void) {
  const g = app.game!;
  app.panel('メニュー', (body) => {
    const inDungeon = !!g.state.expedition;
    body.append(
      h('div', { class: 'win small' }, h('div', null, `${g.state.player.name}  ${g.state.player.gold} G`), h('div', { class: 'muted' }, `さくせん: ${TACTICS.find((t) => t.id === g.state.player.tactic)!.name}`)),
      h('div', { class: 'win list' },
        item('つよさ', () => openParty(app, () => {}, { viewOnly: inDungeon })),
        item('じゅもん', () => openFieldSkills(app)),
        item('どうぐ', () => openItems(app)),
        item('さくせん', () => openTactic(app)),
        inDungeon ? item('まちへ かえる（かえりのはね）', () => returnHome(app), { disabled: !(g.state.inventory.returnwing > 0), meta: `のこり ${g.state.inventory.returnwing ?? 0}` }) : null,
        item('せってい', () => openSettings(app)),
        !inDungeon ? item('きろくする', () => app.saveNow(true)) : null,
      ),
    );
  }, { onClose });
}

async function returnHome(app: App) {
  if (!(await app.confirm('かえりのはねを つかって まちへ もどりますか？'))) return;
  const r = app.game!.useFieldItem('returnwing', null);
  if (!r.ok) return app.toast(r.error);
  app.closeAllPanels();
  await app.say(r.value + '\nからだが ふわりと うきあがった…！');
}

// ---------------------------------------------------------------- 牧場・パーティ
export function openParty(app: App, onClose: () => void, opts: { viewOnly?: boolean } = {}) {
  const g = app.game!;
  app.panel(opts.viewOnly ? 'つよさ' : 'ぼくじょう', (body) => {
    const party = g.party;
    body.append(h('div', { class: 'small muted' }, opts.viewOnly ? 'モンスターを えらぶと くわしく みられます。' : `つれていく モンスター（${party.length}/3）  ぼくじょう ${g.state.monsters.length}/${g.state.capacity}`));
    const slots = h('div', { class: 'win list' });
    for (let i = 0; i < 3; i++) {
      const m = party[i];
      if (m) slots.append(item(h('span', { class: 'row' }, monIcon(m.speciesId), h('span', null, monLabel(m), h('br'), hpText(m), m.pendingSkills.length ? h('span', { class: 'hl small' }, ' ！とくぎ') : null)), () => openDetail(app, m.id, opts)));
      else if (!opts.viewOnly) slots.append(item(h('span', { class: 'muted' }, '（あき）  ＋ くわえる'), () => pickForParty(app, i)));
    }
    body.append(slots);
    if (opts.viewOnly) return;
    const others = g.state.monsters.filter((m) => !g.state.partyIds.includes(m.id));
    body.append(h('div', { class: 'small muted' }, `あずけている モンスター（${others.length}）`));
    const list = h('div', { class: 'win list' });
    if (!others.length) list.append(h('div', { class: 'muted small' }, 'まだ いません。たびのとびらで なかまを さがそう！'));
    for (const m of others) list.append(item(h('span', { class: 'row' }, monIcon(m.speciesId), h('span', null, monLabel(m), h('br'), hpText(m))), () => openDetail(app, m.id, opts)));
    body.append(list);
  }, { onClose });
}

function pickForParty(app: App, slot: number) {
  const g = app.game!;
  const p = app.panel('つれていく モンスター', (body) => {
    const list = h('div', { class: 'win list' });
    const cands = g.state.monsters.filter((m) => !g.state.partyIds.includes(m.id));
    if (!cands.length) list.append(h('div', { class: 'muted' }, 'あずけている モンスターが いません。'));
    for (const m of cands)
      list.append(item(h('span', { class: 'row' }, monIcon(m.speciesId), h('span', null, monLabel(m), h('br'), hpText(m))), () => {
        const ids = [...g.state.partyIds];
        if (slot < ids.length) ids[slot] = m.id;
        else ids.push(m.id);
        const r = g.setParty(ids);
        if (!r.ok) return app.toast(r.error);
        sfx('ok');
        p.close();
        app.refreshPanels();
      }));
    body.append(list);
  });
}

export function openDetail(app: App, id: string, opts: { viewOnly?: boolean } = {}) {
  const g = app.game!;
  const p = app.panel('モンスターの ようす', (body, foot) => {
    const m = g.monster(id);
    if (!m) return p.close();
    body.append(monsterDetailBody(m));
    if (m.pendingSkills.length) body.prepend(h('div', { class: 'win' }, h('div', { class: 'hl' }, 'あたらしい とくぎを おぼえようとしている！'), btn('とくぎを えらぶ', () => resolvePending(app, m))));
    const nameBtn = btn('なまえ', async () => { await askName(app, m.id); app.refreshPanels(); });
    if (opts.viewOnly) { foot.append(nameBtn); return; }
    const inParty = g.state.partyIds.includes(m.id);
    const meat = ITEM_LIST.filter((i) => i.category === 'meat' && (g.state.inventory[i.id] ?? 0) > 0);
    foot.append(
      btn(inParty ? 'はずす' : 'つれていく', () => {
        const ids = inParty ? g.state.partyIds.filter((x) => x !== m.id) : [...g.state.partyIds, m.id];
        if (!inParty && ids.length > 3) return app.toast('つれていけるのは 3たい までです。');
        const r = g.setParty(ids);
        if (!r.ok) return app.toast(r.error);
        sfx('ok');
        app.refreshPanels();
      }, 'grow'),
      btn('にく', async () => {
        if (!meat.length) return app.toast('にくを もっていません。どうぐやで かえます。');
        const c = await app.ask(`${displayName(m)}に どの にくを あげる？`, meat.map((i) => `${i.name}（${g.state.inventory[i.id]}）`));
        if (c < 0) return;
        const r = g.useFieldItem(meat[c].id, m.id);
        if (!r.ok) return app.toast(r.error);
        sfx('heal');
        await app.say(r.value);
        app.refreshPanels();
      }, 'grow'),
      nameBtn,
      btn('…', async () => {
        const c = await app.ask('どうする？', [m.favorite ? 'おきにいりを はずす' : 'おきにいりに する', 'にがす']);
        if (c === 0) { g.toggleFavorite(m.id); app.refreshPanels(); }
        if (c === 1) {
          if (m.favorite) return app.toast('おきにいりの モンスターは にがせません。');
          if (!(await app.confirm(`ほんとうに ${displayName(m)}を にがしますか？\nもう もどってきません。`, 'にがす', 'やめる'))) return;
          const r = g.release(m.id);
          if (!r.ok) return app.toast(r.error);
          await app.say(`${displayName(m)}は げんきに かえっていった…。`);
          p.close();
          app.refreshPanels();
        }
      }),
    );
  });
}

/** あたらしい なかま: ステータス・せいべつを みながら、その場で なまえを つける（閉じるまで待つ） */
export function welcomeMonster(app: App, id: string, title: string): Promise<void> {
  const g = app.game!;
  const m = g.monster(id);
  if (!m) return Promise.resolve();
  const input = h('input', { class: 'name', maxlength: 8, value: m.nickname ?? '', placeholder: `${displayName(m)}（そのまま）` }) as HTMLInputElement;
  const nameBox = h('div', { class: 'win' }, h('h3', null, 'なまえを つける'), input, h('div', { class: 'small muted' }, '8もじまで。からっぽなら しゅぞくの なまえの まま。あとから「つよさ」でも かえられます。'));
  return new Promise((resolve) => {
    const p = app.panel(title, (body, foot) => {
      body.append(nameBox, monsterDetailBody(g.monster(id) ?? m));
      foot.append(btn('けってい', () => { if (input.value.trim()) g.rename(id, input.value); sfx('ok'); p.close(); }, 'primary grow'));
    }, { onClose: () => resolve(), noBack: true });
  });
}

/** なまえを つける（パネルを閉じるまで待つ） */
export function askName(app: App, id: string): Promise<void> {
  const g = app.game!;
  const m = g.monster(id);
  if (!m) return Promise.resolve();
  const input = h('input', { class: 'name', maxlength: 8, value: m.nickname ?? '', placeholder: displayName(m) }) as HTMLInputElement;
  return new Promise((resolve) => {
    const p = app.panel(`${displayName(m)}の なまえ`, (body, foot) => {
      body.append(monIcon(m.speciesId, 'icon big'), h('div', null, 'あたらしい なまえ（8もじまで。からっぽで しゅぞくめいに もどる）'), input,
        h('div', { class: 'small muted' }, 'なまえを つけると、せんとうで てきと みわけやすく なります。'));
      foot.append(btn('けってい', () => { g.rename(id, input.value); sfx('ok'); p.close(); }, 'primary grow'));
    }, { onClose: () => resolve() });
    setTimeout(() => input.focus(), 50);
  });
}

/** おぼえきれなかった とくぎ を、どれと入れかえるか えらぶ */
export async function resolvePending(app: App, m: MonsterInstance) {
  const g = app.game!;
  for (const sk of [...m.pendingSkills]) {
    const cur = g.monster(m.id)!;
    await app.say(`${displayName(cur)}は ${getSkill(sk).name}を おぼえたい…。\nしかし とくぎを 8つ おぼえていて これいじょう おぼえられない！`);
    const c = await app.ask(`どの とくぎを わすれさせますか？`, [...cur.skills.map((s) => getSkill(s).name), `${getSkill(sk).name}を おぼえるのを あきらめる`], { cancel: false });
    const forget = c < cur.skills.length ? cur.skills[c] : null;
    g.resolvePending(m.id, sk, forget);
    await app.say(forget ? `${displayName(cur)}は ${getSkill(forget).name}を わすれて ${getSkill(sk).name}を おぼえた！` : `${displayName(cur)}は ${getSkill(sk).name}を おぼえなかった。`);
  }
  app.refreshPanels();
}

// ---------------------------------------------------------------- どうぐ
export function openItems(app: App) {
  const g = app.game!;
  app.panel('どうぐ', (body) => {
    const inv = Object.entries(g.state.inventory).filter(([, n]) => n > 0);
    const list = h('div', { class: 'list' });
    if (!inv.length) list.append(h('div', { class: 'muted' }, 'なにも もっていない。'));
    for (const [id, n] of inv) {
      const it = getItem(id);
      const usable = it.field && it.category !== 'key' && it.category !== 'cure' && (it.category !== 'escape' || !!g.state.expedition);
      const row = h('div', { class: 'win' },
        h('div', { class: 'row' }, h('span', { class: 'grow' }, it.name, h('span', { class: 'muted' }, ` ×${n}`)),
          usable ? btn('つかう', () => useItemFlow(app, id), 'primary') : h('span', { class: 'small muted' }, it.category === 'key' ? 'だいじなもの' : it.category === 'escape' ? 'たんけんちゅうに つかう' : 'せんとうで つかう')),
        h('div', { class: 'small muted' }, it.description));
      list.append(row);
    }
    body.append(list);
  });
}

async function useItemFlow(app: App, id: string) {
  const g = app.game!;
  const it = getItem(id);
  if (it.category === 'escape') return returnHome(app);
  const targets = it.category === 'meat' ? g.state.monsters : g.party;
  const c = await app.ask(`${it.name}を だれに つかう？`, targets.map((m) => `${displayName(m)}  ${m.hp <= 0 ? 'たおれている' : `HP${m.hp}/${m.stats.hp} MP${m.mp}/${m.stats.mp}`}`));
  if (c < 0) return;
  const r = g.useFieldItem(id, targets[c].id);
  if (!r.ok) return app.toast(r.error);
  sfx('heal');
  await app.say(r.value);
  app.refreshPanels();
}

// ---------------------------------------------------------------- じゅもん（回復・蘇生）
export function openFieldSkills(app: App) {
  const g = app.game!;
  app.panel('じゅもん', (body) => {
    body.append(h('div', { class: 'small muted' }, 'かいふく・いきかえらせる・どくけしの とくぎを つかえます。'));
    for (const m of g.party) {
      const sks = m.skills.filter(isFieldSkill);
      const box = h('div', { class: 'win' }, h('div', { class: 'row' }, monIcon(m.speciesId), h('span', { class: 'grow' }, displayName(m), h('div', { class: 'small muted' }, `HP ${m.hp}/${m.stats.hp}  MP ${m.mp}/${m.stats.mp}`))));
      if (!sks.length) box.append(h('div', { class: 'small muted' }, 'つかえる じゅもんは ない。'));
      else {
        const row = h('div', { class: 'row wrap', style: 'gap:6px;margin-top:6px' });
        for (const id of sks) {
          const sk = getSkill(id);
          const b = btn(h('span', null, sk.name, h('span', { class: 'small muted' }, ` MP${sk.mpCost}`)), () => castFlow(app, m.id, id));
          b.disabled = m.hp <= 0 || m.mp < sk.mpCost;
          row.append(b);
        }
        box.append(row);
      }
      body.append(box);
    }
  });
}

async function castFlow(app: App, casterId: string, skillId: string) {
  const g = app.game!;
  const sk = getSkill(skillId);
  let target: string | null = null;
  if (sk.target !== 'allAllies') {
    const pool = sk.category === 'revive' ? g.party.filter((m) => m.hp <= 0) : g.party.filter((m) => m.hp > 0);
    if (!pool.length) return app.toast(sk.category === 'revive' ? 'たおれている モンスターは いません。' : 'つかえる あいてが いません。');
    const c = await app.ask(`${sk.name}を だれに つかう？`, pool.map((m) => `${displayName(m)}  ${m.hp <= 0 ? 'たおれている' : `HP${m.hp}/${m.stats.hp}`}`));
    if (c < 0) return;
    target = pool[c].id;
  }
  const r = g.useFieldSkill(casterId, skillId, target);
  if (!r.ok) return app.toast(r.error);
  sfx('heal');
  await app.say(r.value);
  app.refreshPanels();
}

// ---------------------------------------------------------------- さくせん
export function openTactic(app: App) {
  const g = app.game!;
  const p = app.panel('さくせん', (body) => {
    body.append(h('div', { class: 'small muted' }, '「たたかう」を えらんだ とき、モンスターは それぞれの さくせんで うごきます。'));
    const row = (label: HTMLElement | string, cur: Tactic | null, set: (t: Tactic) => void) =>
      h('div', { class: 'win' }, h('h3', null, label), h('div', { class: 'row wrap', style: 'gap:6px' },
        TACTICS.map((t) => btn(t.short, () => { set(t.id); sfx('ok'); p.refresh(); }, cur === t.id ? 'primary' : ''))));
    const party = g.party;
    const all = new Set(party.map((m) => g.tacticOf(m)));
    body.append(row('みんな', all.size === 1 ? [...all][0] : null, (t) => g.setTactic(t)));
    for (const m of party) body.append(row(h('span', { class: 'row' }, monIcon(m.speciesId), displayName(m)), g.tacticOf(m), (t) => g.setMonsterTactic(m.id, t)));
    body.append(h('div', { class: 'win small' }, TACTICS.map((t) => h('div', null, h('span', { class: 'hl' }, t.short), ` … ${t.desc}`))));
  });
}

// ---------------------------------------------------------------- せってい
export function openSettings(app: App) {
  const g = app.game;
  const p = app.panel('せってい', (body) => {
    const s = app.settings;
    const set = (patch: Partial<typeof s>) => {
      if (g) g.setSettings(patch);
      else Object.assign(s, patch);
      try { localStorage.setItem('me-settings', JSON.stringify({ ...s, ...patch })); } catch { /* ignore */ }
      if (patch.sound !== undefined) setSoundEnabled(patch.sound);
      app.applySettings();
      sfx('cursor');
      p.refresh();
    };
    const opt = <T extends string | boolean>(label: string, cur: T, choices: [T, string][], f: (v: T) => void) =>
      h('div', { class: 'win' }, h('h3', null, label), h('div', { class: 'row wrap' }, choices.map(([v, l]) => btn(l, () => f(v), cur === v ? 'primary' : ''))));
    body.append(
      opt('もじの はやさ', s.textSpeed, [['slow', 'おそい'], ['normal', 'ふつう'], ['fast', 'はやい']], (v) => set({ textSpeed: v })),
      opt('せんとうの はやさ', s.battleSpeed, [['normal', 'ふつう'], ['fast', 'はやい'], ['instant', 'さいそく']], (v) => set({ battleSpeed: v })),
      opt('アニメーション', s.reduceMotion, [[false, 'あり'], [true, 'へらす']], (v) => set({ reduceMotion: v })),
      opt('おと', s.sound, [[true, 'オン'], [false, 'オフ']], (v) => set({ sound: v })),
      opt('もじの おおきさ', s.largeText, [[false, 'ふつう'], [true, 'おおきい']], (v) => set({ largeText: v })),
    );
    if (g)
      body.append(h('div', { class: 'win' }, h('h3', null, 'データ'), h('div', { class: 'row wrap' },
        btn('かきだす', () => exportSave(app)),
        btn('よみこむ', () => importSave(app)),
      ), h('div', { class: 'small muted' }, 'きろくを ファイルに ほぞんしたり、もどしたり できます。')));
  });
}

function exportSave(app: App) {
  const g = app.game!;
  const blob = new Blob([JSON.stringify({ ...g.state, savedAt: Date.now() })], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `monster-echoes-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  app.toast('きろくを かきだしました。');
}
function importSave(app: App) {
  const input = h('input', { type: 'file', accept: 'application/json,.json' }) as HTMLInputElement;
  input.onchange = async () => {
    const f = input.files?.[0];
    if (!f) return;
    try {
      const r = migrate(JSON.parse(await f.text()));
      if (!r.ok) return app.toast(r.error === 'future' ? 'あたらしすぎる きろくです。' : 'こわれた きろくの ようです。', 2500);
      if (!(await app.confirm('いまの きろくを うわがきして よみこみますか？', 'よみこむ', 'やめる'))) return;
      await app.repo.save(r.value);
      location.reload();
    } catch {
      app.toast('よみこめませんでした。', 2500);
    }
  };
  input.click();
}
