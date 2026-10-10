import { FAMILIES, getSpecies } from '../../data/monsters';
import { getSkill } from '../../data/skills';
import { RESIST_KEYS, type ResistKey, type Resistances, type Stats } from '../../data/types';
import { expToNextLevel, maxLevelOf } from '../../domain/monster/Growth';
import { displayName } from '../../domain/monster/MonsterFactory';
import type { MonsterInstance } from '../../domain/monster/types';
import { h } from '../dom';
import { monsterSprite } from '../gfx/monsters';

export function monIcon(speciesId: string, cls = 'icon', opts: { distorted?: boolean; silhouette?: boolean } = {}) {
  const src = monsterSprite(speciesId, { ...opts, small: !/\b(big|mid)\b/.test(cls) });
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  c.getContext('2d')!.drawImage(src, 0, 0);
  c.className = cls + (opts.silhouette ? ' silhouette' : '');
  return c;
}

export const sexMark = (m: Pick<MonsterInstance, 'sex'>) => (m.sex === 'A' ? h('span', { class: 'sexA' }, '♂') : m.sex === 'B' ? h('span', { class: 'sexB' }, '♀') : null);
export const plusMark = (n: number) => (n > 0 ? h('span', { class: 'plus' }, `+${n}`) : null);

export function monLabel(m: MonsterInstance) {
  return h('span', null, displayName(m), ' ', sexMark(m), ' ', h('span', { class: 'muted small' }, `Lv${m.level}`), ' ', plusMark(m.plusValue), m.favorite ? ' ★' : '');
}

export function hpText(m: MonsterInstance) {
  const cls = m.hp <= 0 ? 'bad' : m.hp < m.stats.hp * 0.3 ? 'hl' : '';
  return h('span', { class: cls }, m.hp <= 0 ? 'たおれている' : `HP ${m.hp}/${m.stats.hp}`);
}

export const STAT_LABEL: Record<keyof Stats, string> = { hp: 'HP', mp: 'MP', attack: 'こうげき', defense: 'しゅび', speed: 'すばやさ', wisdom: 'かしこさ' };
export function statsGrid(st: Stats, cur?: { hp: number; mp: number }, compare?: Stats) {
  const cells: (HTMLElement | string)[] = [];
  for (const k of Object.keys(STAT_LABEL) as (keyof Stats)[]) {
    const v = k === 'hp' && cur ? `${cur.hp}/${st.hp}` : k === 'mp' && cur ? `${cur.mp}/${st.mp}` : String(st[k]);
    const diff = compare ? st[k] - compare[k] : 0;
    cells.push(h('span', { class: 'k' }, STAT_LABEL[k]), h('span', null, v, diff ? h('span', { class: diff > 0 ? 'good small' : 'bad small' }, ` ${diff > 0 ? '+' : ''}${diff}`) : null));
  }
  return h('div', { class: 'stats' }, cells);
}

export const RESIST_LABEL: Record<ResistKey, string> = { fire: 'ほのお', ice: 'こおり', wind: 'かぜ', earth: 'だいち', thunder: 'かみなり', light: 'ひかり', sleep: 'ねむり', paralysis: 'まひ', confusion: 'こんらん', poison: 'どく' };
const RES_WORD: Record<string, string> = { '-1': 'よわい', '1': 'つよい', '2': 'とてもつよい', '3': 'むこう' };
export function resistList(r: Resistances) {
  const items = RESIST_KEYS.filter((k) => (r[k] ?? 0) !== 0).map((k) => {
    const v = r[k]!;
    return h('span', { class: `tag ${v < 0 ? 'bad' : 'good'}`, style: `border-color:currentColor` }, `${RESIST_LABEL[k]}:${RES_WORD[String(v)]}`);
  });
  return h('div', { class: 'row wrap', style: 'gap:4px' }, items.length ? items : h('span', { class: 'muted small' }, 'とくに なし'));
}

export function skillLine(id: string, extra?: string) {
  const s = getSkill(id);
  return h('div', { class: 'small' }, h('span', { class: 'hl' }, s.name), s.mpCost ? h('span', { class: 'muted' }, ` MP${s.mpCost}`) : null, extra ? h('span', { class: 'muted' }, ` ${extra}`) : null, h('div', { class: 'muted', style: 'margin-left:1em' }, s.description));
}

/** モンスターの くわしい ようす */
export function monsterDetailBody(m: MonsterInstance) {
  const sp = getSpecies(m.speciesId);
  const next = expToNextLevel(m);
  const wild = m.wildness > 0 ? h('div', { class: 'small' }, 'やせい: ', h('span', { class: m.wildness > 30 ? 'bad' : 'hl' }, m.wildness > 40 ? 'とても つよい' : m.wildness > 15 ? 'すこし のこっている' : 'ほとんど なれた'), h('span', { class: 'muted' }, `（${m.wildness}）`)) : null;
  return h('div', { class: 'list', style: 'gap:10px' },
    h('div', { class: 'row' }, monIcon(m.speciesId, 'icon big'),
      h('div', { class: 'grow' },
        h('div', { style: 'font-size:1.15em' }, displayName(m), ' ', sexMark(m), ' ', plusMark(m.plusValue)),
        h('div', { class: 'muted small' }, `${sp.name}・${FAMILIES[sp.familyId].name}けい`),
        h('div', null, `Lv ${m.level}`, h('span', { class: 'muted small' }, ` / じょうげん ${maxLevelOf(m)}`)),
        h('div', { class: 'small muted' }, next === null ? 'レベルの じょうげんに たっしている' : `つぎの レベルまで ${next}`),
        wild)),
    h('div', { class: 'win' }, statsGrid(m.stats, m)),
    h('div', { class: 'win' }, h('h3', null, `とくぎ（${m.skills.length}/8）`), m.skills.length ? m.skills.map((s) => skillLine(s)) : h('div', { class: 'muted' }, 'なし'),
      m.pendingSkills.length ? h('div', { class: 'hl small' }, `おぼえられなかった とくぎ: ${m.pendingSkills.map((s) => getSkill(s).name).join('、')}`) : null),
    h('div', { class: 'win' }, h('h3', null, 'たいせい'), resistList(m.resistances)),
    h('div', { class: 'win small' }, h('h3', null, 'ルーツ'),
      h('div', null, `だい${m.generation}せだい`),
      m.parentSpeciesIds ? h('div', null, 'おや: ', m.parentSpeciesIds.map((id) => getSpecies(id).name).join(' × ')) : h('div', { class: 'muted' }, m.obtainedFrom === 'gift' ? 'はかせから もらった' : 'やせいで であった'),
      h('div', { class: 'muted' }, sp.description)),
  );
}
