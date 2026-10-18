import { BALANCE } from '../../data/balance';
import { FAMILIES, getSpecies } from '../../data/monsters';
import { getSkill } from '../../data/skills';
import { displayName } from '../../domain/monster/MonsterFactory';
import type { MonsterInstance } from '../../domain/monster/types';
import { sfx } from '../../infrastructure/audio/Sound';
import type { App } from '../App';
import { welcomeMonster } from './menus';
import { btn, h, item, sleep } from '../dom';
import { monIcon, monLabel, plusMark, resistList, statsGrid } from '../components/monster';
import { BREEDING_RECIPES } from '../../data/breeding';
import { maxLevelOf } from '../../domain/monster/Growth';

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
    // 親A・親B の 能力と スキルを ならべて くらべる（仕様 12.4）
    body.append(compareParents(a, b));

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
          h('div', { class: 'small' }, h('span', { class: 'rank' }, '★'.repeat(sp.rank ?? 1)), h('span', { class: 'muted' }, `　ランク${sp.rank ?? 1}`)),
          pv.recipeKind === 'special' ? h('div', { class: 'small hl' }, '◆ とくべつな くみあわせ（特殊配合）') : h('div', { class: 'small muted' }, '通常配合（けっとうの 系統 × ランク）'),
          h('div', { class: 'small' }, `レベルの じょうげん ${pv.maxLevel}`, h('span', { class: 'muted' }, `（+${pv.plusValue}）`)),
          h('div', { class: 'small muted' }, `だい${pv.generation}せだい・Lv1 から そだてなおし`))),
      h('div', { class: 'small muted', style: 'margin-top:6px' }, 'Lv1 の のうりょく（よそう）'),
      statsGrid(pv.stats),
      h('div', { class: 'small muted', style: 'margin-top:6px' }, 'ひきつがれる たいせい（よそう）'),
      resistList(pv.resistances),
      strongerNote(a, b, pv.maxLevel, sp.rank ?? 1)));
    // 生まれる 候補：おやを いれかえた ときの こ も みせる
    const sw = g.breedCheck(b.id, a.id);
    if (sw.ok && sw.value.speciesId !== pv.speciesId) {
      const s2 = getSpecies(sw.value.speciesId);
      const k2 = g.state.ownedSpeciesIds.includes(s2.id) || g.state.discoveredSpeciesIds.includes(s2.id);
      body.append(h('div', { class: 'win small' }, h('div', { class: 'muted' }, 'ほかの 候補（おやA と おやB を いれかえると）'),
        h('div', { class: 'row' }, monIcon(s2.id, 'icon', { silhouette: !k2 }), h('span', null, k2 ? s2.name : '？？？', ' ', h('span', { class: 'rank' }, '★'.repeat(s2.rank ?? 1))))));
    }
    // 未発見レシピの ヒント（おやの どちらかが かかわる 特殊配合で、まだ うまれていない もの）
    const hints = BREEDING_RECIPES.filter((r) => r.kind === 'special' && r.hint && !g.state.ownedSpeciesIds.includes(r.resultSpeciesId)
      && [r.parentA, r.parentB].some((m) => 'speciesId' in m && (m.speciesId === a.speciesId || m.speciesId === b.speciesId)) && r.resultSpeciesId !== pv.speciesId);
    if (hints.length) body.append(h('div', { class: 'win small' }, h('div', { class: 'hl' }, '未発見の 配合の ヒント'), hints.slice(0, 3).map((r) => h('div', { class: 'muted', style: 'margin-top:4px' }, '・' + r.hint))));
    for (const r of pv.nearMiss) if (r.hint) body.append(h('div', { class: 'win small hl' }, '…なにかが たりない きがする。', h('br'), h('span', { class: 'muted' }, r.hint)));

    // 特技の継承
    const sk = pv.skills;
    const box = h('div', { class: 'win' },
      h('h3', null, `うけつぐ とくぎ（${chosen.length}/${sk.slots}）`),
      h('div', { class: 'small muted' }, 'うまれた ときに おぼえている: ', sk.initial.map((s) => getSkill(s).name).join('、') || 'なし'),
      // うけつげる 数が ふえる タイミング（仕様 15：第2章クリアで スキル継承・第5章で 拡張）
      !g.hasFeature('skillInheritPlus') ? h('div', { class: 'small hl' }, g.hasFeature('skillInherit') ? 'もっと うけつげるように なるのは 第5章の 記憶の樹で。' : 'いまは 1つだけ。第2章を クリアすると 3つまで うけつげる。') : null);
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

/** 親A・親B の 能力と スキルの くらべ */
function compareParents(a: MonsterInstance, b: MonsterInstance) {
  const col = (m: MonsterInstance, label: string) => h('div', { class: 'pcol' },
    h('div', { class: 'small hl' }, label),
    h('div', { class: 'small' }, getSpecies(m.speciesId).name, ' ', h('span', { class: 'rank' }, '★'.repeat(getSpecies(m.speciesId).rank ?? 1))),
    statsGrid(m.stats),
    h('div', { class: 'small muted', style: 'margin-top:4px' }, m.skills.map((id) => getSkill(id).name).join('・') || 'とくぎ なし'));
  return h('div', { class: 'win pcompare' }, col(a, 'おやA の のうりょく'), col(b, 'おやB の のうりょく'));
}

/** 親より 強くなる 可能性（ランク・＋値・レベルの じょうげん で 目安を だす） */
function strongerNote(a: MonsterInstance, b: MonsterInstance, childMax: number, childRank: number) {
  const pr = Math.max(getSpecies(a.speciesId).rank ?? 1, getSpecies(b.speciesId).rank ?? 1);
  const pmax = Math.max(maxLevelOf(a), maxLevelOf(b));
  const score = (childRank > pr ? 2 : childRank === pr ? 1 : 0) + (childMax > pmax ? 1 : 0);
  const [word, cls] = score >= 3 ? ['とても たかい', 'good'] : score === 2 ? ['たかい', 'good'] : score === 1 ? ['ふつう', ''] : ['ひくい', 'bad'];
  return h('div', { class: 'small', style: 'margin-top:6px' }, '親より 強く なる 可能性：', h('span', { class: cls }, word),
    h('span', { class: 'muted' }, `（ランク${childRank}・じょうげん Lv${childMax}）`));
}

async function birth(app: App, child: MonsterInstance, isNew: boolean) {
  sfx('breed');
  const icon = monIcon(child.speciesId, 'icon big birth');
  icon.style.cssText = 'width:160px;height:160px;margin:24px auto 8px;display:block';
  const bp = app.panel('たんじょう！', (body) => {
    body.append(icon, h('div', { style: 'text-align:center;font-size:1.2em' }, `${getSpecies(child.speciesId).name}が うまれた！`));
  }, { noBack: true });
  await sleep(1500);
  await app.say([`${getSpecies(child.speciesId).name}が うまれた！${isNew ? '\n（ずかんに あたらしく とうろくされた！）' : ''}`, child.plusValue ? `この こは +${child.plusValue}。 おやより よく そだつぞ。` : 'たいせつに そだててあげよう。'], { speaker: undefined });
  bp.close();
  // 継承内容と 初期能力（仕様 12.4：配合後に みせる もの）
  const ip = app.panel('うけついだ もの', (body) => {
    body.append(h('div', { class: 'win' }, h('div', { class: 'row' }, monIcon(child.speciesId, 'icon big'), h('div', null, getSpecies(child.speciesId).name, ' ', plusMark(child.plusValue), h('div', { class: 'small muted' }, `Lv1・だい${child.generation}せだい`))),
      h('div', { class: 'small muted', style: 'margin-top:6px' }, 'はじめの のうりょく'), statsGrid(child.stats),
      h('div', { class: 'small muted', style: 'margin-top:6px' }, 'おぼえている とくぎ'), h('div', { class: 'small' }, child.skills.map((id) => getSkill(id).name).join('・') || 'なし'),
      h('div', { class: 'small muted', style: 'margin-top:6px' }, 'たいせい'), resistList(child.resistances)));
  });
  await app.say('うまれた こは、おやの とくぎと たいせいの 一部を うけついでいる。');
  ip.close();
  await welcomeMonster(app, child.id, 'うまれた こ');
}
