import { AREAS, ENCOUNTERS } from '../../data/areas';
import { EVENTS } from '../../data/events';
import { BREEDING_RECIPES } from '../../data/breeding';
import { FAMILIES, getSpecies, SPECIES_LIST } from '../../data/monsters';
import { getSkill } from '../../data/skills';
import type { App } from '../App';
import { h } from '../dom';
import { monIcon, resistGrid } from '../components/monster';
import type { FamilyId } from '../../data/types';
import { speciesResistances } from '../../domain/monster/MonsterFactory';

/** 図鑑: 見つけた種族・出会える場所・配合のヒント */
export function openDex(app: App) {
  const g = app.game!;
  // 系統べつ 図鑑（第3章 魔物研究所）：上の タブで 系統を えらぶ
  let fam: FamilyId | 'all' = 'all';
  app.panel('モンスターずかん', (body) => {
    const seen = new Set(g.state.discoveredSpeciesIds), owned = new Set(g.state.ownedSpeciesIds);
    body.append(h('div', { class: 'small muted' }, `みつけた かず ${seen.size}/${SPECIES_LIST.length}  なかまにした かず ${owned.size}`));
    if (g.hasFeature('familyDex')) {
      const fams = Object.keys(FAMILIES) as FamilyId[];
      const tab = (id: FamilyId | 'all', label: string, cnt: string) => {
        const b = h('button', { class: `dtab${fam === id ? ' on' : ''}`, type: 'button' }, label, h('span', { class: 'small' }, cnt));
        b.addEventListener('click', () => { fam = id; app.refreshPanels(); });
        return b;
      };
      const count = (id: FamilyId) => { const l = SPECIES_LIST.filter((sp) => sp.familyId === id); return `${l.filter((sp) => seen.has(sp.id) || owned.has(sp.id)).length}/${l.length}`; };
      body.append(h('div', { class: 'dtabs' }, tab('all', 'すべて', ''), ...fams.map((f) => tab(f, FAMILIES[f].name, count(f)))));
      if (fam !== 'all') {
        const l = SPECIES_LIST.filter((sp) => sp.familyId === fam);
        body.append(h('div', { class: 'small hl' }, `${FAMILIES[fam].name}けい：みつけた ${l.filter((sp) => seen.has(sp.id) || owned.has(sp.id)).length}・なかま ${l.filter((sp) => owned.has(sp.id)).length}／${l.length}しゅ`));
      }
    }
    const grid = h('div', { class: 'dexgrid' });
    SPECIES_LIST.forEach((sp, i) => {
      if (fam !== 'all' && sp.familyId !== fam) return;
      const known = seen.has(sp.id) || owned.has(sp.id);
      const cell = h('div', { class: 'win dexcell', role: 'button' }, monIcon(sp.id, 'icon', { silhouette: !known }), h('div', null, `${String(i + 1).padStart(2, '0')} ${known ? sp.name : '？？？'}`));
      cell.onclick = () => detail(sp.id, known, owned.has(sp.id));
      grid.append(cell);
    });
    body.append(grid);
  });

  function detail(id: string, known: boolean, owned: boolean) {
    const sp = getSpecies(id);
    app.panel(known ? sp.name : '？？？', (body) => {
      body.append(h('div', { class: 'row' }, monIcon(id, 'icon big', { silhouette: !known }), h('div', { class: 'grow' },
        h('div', null, known ? sp.name : '？？？'),
        h('div', { class: 'small muted' }, `${FAMILIES[sp.familyId].name}けい`),
        known ? h('div', { class: 'small' }, sp.description) : h('div', { class: 'small muted' }, 'まだ みたことが ない。'))));
      const where = AREAS.filter((a) => a.floors.some((f) => ENCOUNTERS[f.encounterTableId].entries.some((e) => e.speciesId === id)));
      const spots = EVENTS.filter((e) => e.encounter?.speciesId === id).map((e) => AREAS.find((a) => a.id === e.areaId)!);
      const seenSpot = (a: (typeof spots)[number]) => owned || g.state.progress.storyFlags.echoMet;
      body.append(h('div', { class: 'win small' }, h('h3', null, 'であえる ばしょ'),
        where.map((a) => h('div', null, (a.stageId ? g.canStartExpedition(a.id).ok || g.chapters.clearedStages.includes(a.stageId) : g.state.progress.unlockedAreas.includes(a.id)) ? a.name : '？？？')),
        spots.map((a) => h('div', null, seenSpot(a) ? `${a.name}の おく（ひかる あしあとの さき）` : '？？？ ひかる あしあとが しるべに なるらしい…')),
        !where.length && !spots.length ? h('div', { class: 'muted' }, 'やせいでは みかけない。配合で うまれるらしい。') : null));
      if (known) {
        body.append(h('div', { class: 'win small' }, h('h3', null, 'おぼえる とくぎ'), sp.learnset.map((e) => h('div', null, `Lv${e.level} ${getSkill(e.skillId).name}`))));
        body.append(h('div', { class: 'win small' }, h('h3', null, 'たいせい'), g.hasFeature('resistView') ? resistGrid(speciesResistances(sp)) : h('span', { class: 'muted' }, 'カゼノの 魔物研究所で しらべられるように なる。')));
        if (sp.lore) body.append(h('div', { class: 'win small' }, h('h3', null, 'とくべつな きおく'), owned ? sp.lore : h('span', { class: 'muted' }, 'なかまに すると、ふしぎな ことが わかるかもしれない…。')));
      }
      // 配合のヒント: 親のどちらかを見たことがあれば表示
      const hints = BREEDING_RECIPES.filter((r) => r.kind === 'special' && r.resultSpeciesId === id && r.hint);
      for (const r of hints) {
        const parents = [r.parentA, r.parentB].map((m) => ('speciesId' in m ? m.speciesId : ''));
        const anySeen = parents.some((p) => g.state.discoveredSpeciesIds.includes(p));
        body.append(h('div', { class: 'win small' }, h('h3', null, 'はかせの メモ'), anySeen || owned ? r.hint! : h('span', { class: 'muted' }, 'まだ てがかりが ない…。')));
      }
      if (!hints.length && sp.rarity === 2) body.append(h('div', { class: 'win small' }, h('h3', null, 'はかせの メモ'), `${FAMILIES[sp.familyId].name}けいの モンスターを けっとうにして、ちがう けいとうの あいてと 配合すると うまれる。`));
    });
  }
}
