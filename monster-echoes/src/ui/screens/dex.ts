import { AREAS, ENCOUNTERS } from '../../data/areas';
import { BREEDING_RECIPES } from '../../data/breeding';
import { FAMILIES, getSpecies, SPECIES_LIST } from '../../data/monsters';
import { getSkill } from '../../data/skills';
import type { App } from '../App';
import { h } from '../dom';
import { monIcon, resistList } from '../components/monster';
import { speciesResistances } from '../../domain/monster/MonsterFactory';

/** 図鑑: 見つけた種族・出会える場所・配合のヒント */
export function openDex(app: App) {
  const g = app.game!;
  app.panel('モンスターずかん', (body) => {
    const seen = new Set(g.state.discoveredSpeciesIds), owned = new Set(g.state.ownedSpeciesIds);
    body.append(h('div', { class: 'small muted' }, `みつけた かず ${seen.size}/${SPECIES_LIST.length}  なかまにした かず ${owned.size}`));
    const grid = h('div', { class: 'dexgrid' });
    SPECIES_LIST.forEach((sp, i) => {
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
      body.append(h('div', { class: 'win small' }, h('h3', null, 'であえる ばしょ'), where.length ? where.map((a) => h('div', null, g.state.progress.unlockedAreas.includes(a.id) ? a.name : '？？？')) : h('div', { class: 'muted' }, 'やせいでは みかけない。配合で うまれるらしい。')));
      if (known) {
        body.append(h('div', { class: 'win small' }, h('h3', null, 'おぼえる とくぎ'), sp.learnset.map((e) => h('div', null, `Lv${e.level} ${getSkill(e.skillId).name}`))));
        body.append(h('div', { class: 'win small' }, h('h3', null, 'たいせい'), resistList(speciesResistances(sp))));
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
