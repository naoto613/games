import { BALANCE } from '../../data/balance';
import { FAMILIES, getSpecies } from '../../data/monsters';
import { getSkill } from '../../data/skills';
import { displayName } from '../../domain/monster/MonsterFactory';
import type { MonsterInstance } from '../../domain/monster/types';
import { sfx } from '../../infrastructure/audio/Sound';
import type { App } from '../App';
import { askName } from './menus';
import { btn, h, item, sleep } from '../dom';
import { monIcon, monLabel, monsterDetailBody, plusMark, resistList, statsGrid } from '../components/monster';

const MIN = BALANCE.breeding.minLevel;

/** 配合工房: 親A（血統）と親B（相手）を選び、子を確認してから配合する */
export function openBreeding(app: App, onClose: () => void) {
  const g = app.game!;
  let aId: string | null = null;
  let bId: string | null = null;
  let chosen: string[] = [];
  let key = '';

  const p = app.panel('配合', (body, foot) => {
    const a = aId ? g.monster(aId) ?? null : null;
    const b = bId ? g.monster(bId) ?? null : null;
    const card = (m: MonsterInstance | null, label: string, onTap: () => void) =>
      h('div', { class: `win pcard${m ? '' : ' empty'}`, onclick: onTap, role: 'button' },
        h('div', { class: 'small hl' }, label),
        m ? [monIcon(m.speciesId, 'icon big'), h('div', { class: 'small' }, monLabel(m))] : h('div', null, 'タップして', h('br'), 'えらぶ'));
    body.append(h('div', { class: 'parents' },
      card(a, 'けっとう（おやA）', () => pick('A')),
      h('div', { style: 'font-size:1.6em' }, '×'),
      card(b, 'あいて（おやB）', () => pick('B'))));
    if (a && b) body.append(h('div', { class: 'row' }, btn('⇄ おやA と おやB を いれかえる', () => { [aId, bId] = [bId, aId]; sfx('cursor'); p.refresh(); }, 'wide')));
    body.append(h('div', { class: 'small muted' }, `うまれる こは、だいたい けっとう（おやA）の けいとうを うけつぎます。レベル${MIN}いじょうの ♂と♀で 配合できます。`));
    if (!a || !b) return;

    const pr = g.breedCheck(a.id, b.id);
    if (!pr.ok) {
      body.append(h('div', { class: 'win bad' }, pr.error));
      return;
    }
    const pv = pr.value;
    const k = `${a.id}|${b.id}`;
    if (k !== key) { key = k; chosen = [...pv.skills.recommended]; }
    const sp = getSpecies(pv.speciesId);
    const known = g.state.ownedSpeciesIds.includes(sp.id) || g.state.discoveredSpeciesIds.includes(sp.id);
    body.append(h('div', { class: 'win' },
      h('h3', null, 'うまれる こ'),
      h('div', { class: 'child' },
        monIcon(sp.id, 'icon big', { silhouette: !known }),
        h('div', { class: 'grow' },
          h('div', { style: 'font-size:1.15em' }, known ? sp.name : '？？？', ' ', plusMark(pv.plusValue)),
          h('div', { class: 'small muted' }, known ? `${FAMILIES[sp.familyId].name}けい` : 'まだ みたことの ない モンスター！'),
          pv.recipeKind === 'special' ? h('div', { class: 'small hl' }, '★ とくべつな くみあわせ') : null,
          h('div', { class: 'small' }, `レベルの じょうげん ${pv.maxLevel}`, h('span', { class: 'muted' }, `（+${pv.plusValue}）`)),
          h('div', { class: 'small muted' }, `だい${pv.generation}せだい・Lv1 から そだてなおし`))),
      h('div', { class: 'small muted', style: 'margin-top:6px' }, 'Lv1 の のうりょく（よそう）'),
      statsGrid(pv.stats),
      h('div', { class: 'small muted', style: 'margin-top:6px' }, 'たいせい（よそう）'),
      resistList(pv.resistances)));
    for (const r of pv.nearMiss) if (r.hint) body.append(h('div', { class: 'win small hl' }, '…なにかが たりない きがする。', h('br'), h('span', { class: 'muted' }, r.hint)));

    // 特技の継承
    const sk = pv.skills;
    const box = h('div', { class: 'win' },
      h('h3', null, `うけつぐ とくぎ（${chosen.length}/${sk.slots}）`),
      h('div', { class: 'small muted' }, 'うまれた ときに おぼえている: ', sk.initial.map((s) => getSkill(s).name).join('、') || 'なし'));
    if (!sk.candidates.length) box.append(h('div', { class: 'muted small' }, 'うけつげる とくぎは ありません。'));
    for (const id of sk.candidates) {
      const s = getSkill(id);
      const on = chosen.includes(id);
      const full = !on && chosen.length >= sk.slots;
      const later = sk.future.find((f) => f.skillId === id);
      const row = h('div', { class: `check${on ? ' on' : ''}`, role: 'checkbox', 'aria-checked': on, disabled: full },
        h('span', { class: 'box' }),
        h('span', { class: 'grow' }, s.name, h('span', { class: 'muted small' }, ` MP${s.mpCost}`), later ? h('span', { class: 'small hl' }, ` （Lv${later.level}でも おぼえる）`) : null,
          h('div', { class: 'small muted' }, s.description)));
      row.onclick = () => { chosen = on ? chosen.filter((x) => x !== id) : [...chosen, id]; sfx('cursor'); p.refresh(); };
      box.append(row);
    }
    const futures = sk.future.filter((f) => !sk.candidates.includes(f.skillId));
    if (futures.length) box.append(h('div', { class: 'small muted', style: 'margin-top:6px' }, 'そだつと おぼえる: ', futures.map((f) => `${getSkill(f.skillId).name}(Lv${f.level})`).join('、')));
    body.append(box);
    body.append(h('div', { class: 'win small bad' }, `配合すると ${displayName(a)} と ${displayName(b)} は いなくなります。`));
    foot.append(btn('配合する', () => confirmBreed(a, b), 'primary grow'));
  }, { onClose });

  function pick(which: 'A' | 'B') {
    const other = which === 'A' ? (bId ? g.monster(bId) : null) : (aId ? g.monster(aId) : null);
    const lp = app.panel(which === 'A' ? 'けっとう（おやA）を えらぶ' : 'あいて（おやB）を えらぶ', (body) => {
      const list = h('div', { class: 'win list' });
      const ms = [...g.state.monsters].sort((x, y) => y.level - x.level);
      for (const m of ms) {
        let why = '';
        if (m.level < MIN) why = `Lv${MIN}みまん`;
        else if (other && m.id === other.id) why = 'えらびずみ';
        else if (other && m.sex === other.sex) why = 'おなじ せいべつ';
        list.append(item(h('span', { class: 'row' }, monIcon(m.speciesId), h('span', null, monLabel(m), why ? h('div', { class: 'small bad' }, why) : null)), () => {
          if (which === 'A') aId = m.id; else bId = m.id;
          if (other && other.sex === m.sex) { if (which === 'A') bId = null; else aId = null; }
          sfx('ok');
          lp.close();
          p.refresh();
        }, { disabled: !!why && why !== 'おなじ せいべつ' }));
      }
      body.append(list);
    });
  }

  async function confirmBreed(a: MonsterInstance, b: MonsterInstance) {
    if ((a.favorite || b.favorite) && !(await app.confirm('おきにいりの モンスターが ふくまれています。ほんとうに 配合しますか？', '配合する', 'やめる'))) return;
    if (!(await app.confirm(`${displayName(a)} と ${displayName(b)} を 配合します。\nおやの 2たいは いなくなります。よろしいですか？`, '配合する', 'やめる'))) return;
    const pre = g.breedCheck(a.id, b.id);
    const isNew = pre.ok && !g.state.ownedSpeciesIds.includes(pre.value.speciesId);
    const r = g.breed(a.id, b.id, chosen);
    if (!r.ok) return app.toast(r.error, 2500);
    aId = bId = null;
    key = '';
    await app.saveNow();
    await birth(app, r.value, isNew);
    p.refresh();
  }
}

async function birth(app: App, child: MonsterInstance, isNew: boolean) {
  sfx('breed');
  const icon = monIcon(child.speciesId, 'icon big birth');
  icon.style.cssText = 'width:160px;height:160px;margin:24px auto 8px;display:block';
  const bp = app.panel('たんじょう！', (body) => {
    body.append(icon, h('div', { style: 'text-align:center;font-size:1.2em' }, `${getSpecies(child.speciesId).name}が うまれた！`));
  }, { noBack: true });
  await sleep(1500);
  await app.say([`${getSpecies(child.speciesId).name}が うまれた！${isNew ? '\n（はじめて みる モンスターだ！）' : ''}`, child.plusValue ? `この こは +${child.plusValue}。 おやより よく そだつぞ。` : 'たいせつに そだててあげよう。'], { speaker: undefined });
  bp.close();
  if (await app.confirm(`${getSpecies(child.speciesId).name}に なまえを つけますか？`, 'つける', 'あとで')) await askName(app, child.id);
  const born = app.game!.monster(child.id) ?? child;
  app.panel('うまれた こ', (body) => body.append(monsterDetailBody(born)));
}
