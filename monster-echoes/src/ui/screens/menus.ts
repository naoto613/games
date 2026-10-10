import { getItem, ITEM_LIST } from '../../data/items';
import { getSkill } from '../../data/skills';
import type { Tactic } from '../../data/types';
import { displayName } from '../../domain/monster/MonsterFactory';
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
    if (opts.viewOnly) return;
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
      btn('…', async () => {
        const c = await app.ask('どうする？', [m.favorite ? 'おきにいりを はずす' : 'おきにいりに する', 'なまえを つける', 'にがす']);
        if (c === 0) { g.toggleFavorite(m.id); app.refreshPanels(); }
        if (c === 1) renameMonster(app, m);
        if (c === 2) {
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

function renameMonster(app: App, m: MonsterInstance) {
  const g = app.game!;
  const input = h('input', { class: 'name', maxlength: 8, value: m.nickname ?? '', placeholder: displayName(m) }) as HTMLInputElement;
  const p = app.panel('なまえを つける', (body, foot) => {
    body.append(h('div', null, 'あたらしい なまえ（8もじまで。からっぽで もとに もどる）'), input);
    foot.append(btn('けってい', () => { g.rename(m.id, input.value); p.close(); app.refreshPanels(); }, 'primary grow'));
  });
  setTimeout(() => input.focus(), 50);
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
    const list = h('div', { class: 'win list' });
    if (!inv.length) list.append(h('div', { class: 'muted' }, 'なにも もっていない。'));
    for (const [id, n] of inv) {
      const it = getItem(id);
      list.append(item(it.name, async () => {
        await app.say(it.description);
        if (it.category === 'key' || it.category === 'cure') return;
        if (it.category === 'escape') {
          if (!g.state.expedition) return app.toast('いまは つかえません。');
          return returnHome(app);
        }
        const targets = it.category === 'meat' ? g.state.monsters : g.party;
        const c = await app.ask(`${it.name}を だれに つかう？`, targets.map((m) => `${displayName(m)}  ${m.hp <= 0 ? 'たおれている' : `HP${m.hp}/${m.stats.hp} MP${m.mp}/${m.stats.mp}`}`));
        if (c < 0) return;
        const r = g.useFieldItem(id, targets[c].id);
        if (!r.ok) return app.toast(r.error);
        sfx('heal');
        await app.say(r.value);
        app.refreshPanels();
      }, { meta: `×${n}` }));
    }
    body.append(list);
  });
}

// ---------------------------------------------------------------- さくせん
export function openTactic(app: App) {
  const g = app.game!;
  const p = app.panel('さくせん', (body) => {
    body.append(h('div', { class: 'small muted' }, '「たたかう」を えらんだ とき、モンスターたちは この さくせんで うごきます。'));
    const list = h('div', { class: 'win list' });
    for (const t of TACTICS) list.append(item(h('span', null, t.name, h('br'), h('span', { class: 'small muted' }, t.desc)), () => { g.setTactic(t.id); sfx('ok'); p.refresh(); }, { sel: g.state.player.tactic === t.id }));
    body.append(list);
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
