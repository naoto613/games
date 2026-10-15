import { FAMILIES, getSpecies } from '../../data/monsters';
import { getSkill } from '../../data/skills';
import { RESIST_KEYS, type ResistKey, type Resistances, type Stats } from '../../data/types';
import { expToNextLevel, maxLevelOf } from '../../domain/monster/Growth';
import { displayName } from '../../domain/monster/MonsterFactory';
import type { MonsterInstance } from '../../domain/monster/types';
import { h } from '../dom';
import { isV2Id, monsterSprite, scale2x } from '../gfx/monsters';

export function monIcon(speciesId: string, cls = 'icon', opts: { distorted?: boolean; silhouette?: boolean } = {}) {
  // v2 の 絵は 原寸が ちいさい（約40px）ので、アイコンは 絵の はんいだけを 切りだして 大きく 見せる（大型でも ちいさく ならない）
  const raw = monsterSprite(speciesId, { ...opts, small: isV2Id(speciesId) || !/\b(big|mid)\b/.test(cls) });
  // v2 の 絵は ドット絵むけの 拡大で なめらかに（アイコンを 大きく 見せても ガタガタしない）
  const src = isV2Id(speciesId) && raw.width > 8 ? scale2x(raw) : raw;
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

export const STAT_LABEL: Record<keyof Stats, string> = { hp: 'HP', mp: 'MP', attack: 'こうげき', defense: 'しゅび', speed: 'すばやさ', magic: 'まりょく', spirit: 'せいしん' };
export function statsGrid(st: Stats, cur?: { hp: number; mp: number }, compare?: Stats) {
  const cells: (HTMLElement | string)[] = [];
  for (const k of Object.keys(STAT_LABEL) as (keyof Stats)[]) {
    const v = k === 'hp' && cur ? `${cur.hp}/${st.hp}` : k === 'mp' && cur ? `${cur.mp}/${st.mp}` : String(st[k]);
    const diff = compare ? st[k] - compare[k] : 0;
    cells.push(h('span', { class: 'k' }, STAT_LABEL[k]), h('span', null, v, diff ? h('span', { class: diff > 0 ? 'good small' : 'bad small' }, ` ${diff > 0 ? '+' : ''}${diff}`) : null));
  }
  return h('div', { class: 'stats' }, cells);
}

export const RESIST_LABEL: Record<ResistKey, string> = { fire: 'ほのお', water: 'みず', ice: 'こおり', wind: 'かぜ', earth: 'だいち', thunder: 'かみなり', light: 'ひかり', shadow: 'かげ', sleep: 'ねむり', paralysis: 'まひ', confusion: 'こんらん', poison: 'どく' };
const RES_WORD: Record<string, string> = { '-1': 'よわい', '1': 'つよい', '2': 'とてもつよい', '3': 'むこう', '4': 'きゅうしゅう' };
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

// ---------------------------------------------------------------- ステータス画面（参考画像3「モンスターのステータス画面」）
export type StatusTab = 'stats' | 'skills' | 'traits';
const ELEM_ICON: Record<ResistKey, [string, string]> = {
  fire: ['火', '#e8503a'], water: ['水', '#3a8ae8'], ice: ['氷', '#5ac8e8'], wind: ['風', '#3ab86a'], earth: ['地', '#c8903a'], thunder: ['雷', '#e8c03a'],
  light: ['光', '#e8d88a'], shadow: ['闇', '#8a5ad8'], sleep: ['眠', '#6a7ad8'], paralysis: ['麻', '#d8b83a'], confusion: ['混', '#d86ab8'], poison: ['毒', '#9a4ad8'],
};
export const elemIcon = (k: ResistKey) => h('span', { class: 'eico', style: `--c:${ELEM_ICON[k][1]}` }, ELEM_ICON[k][0]);
const RES_MARK: Record<string, [string, string]> = { '-1': ['✕', 'bad'], '0': ['－', 'muted'], '1': ['○', 'good'], '2': ['◎', 'good'], '3': ['無', 'hl'], '4': ['吸', 'hl'] };
const ROLE_LABEL: Record<string, string> = { attacker: 'こうげき役', caster: 'じゅもん役', tank: 'まもり役', support: 'ささえ役', status: 'じゃま役', speed: 'はやさ役', special: 'とくしゅ' };
const GROWTH_LABEL: Record<string, string> = { early: 'そうじゅく（はやく そだつ）', late: 'ばんせい（あとから のびる）', balanced: 'へいきん', offense: 'こうげき よりの のび', endure: 'たいりょく よりの のび', variable: 'へんか（ピンチで めざめる）' };
const STAT_LABEL2: Record<keyof Stats, string> = { hp: 'HP', mp: 'MP', attack: '攻撃', defense: '防御', speed: '素早さ', magic: '賢さ', spirit: '精神' };

/** 耐性の 一覧（属性と 状態異常の アイコン ＋ 記号） */
export function resistGrid(r: Resistances) {
  return h('div', { class: 'rgrid' }, RESIST_KEYS.map((k) => {
    const v = String(r[k] ?? 0);
    const [mk, cls] = RES_MARK[v] ?? ['－', 'muted'];
    return h('div', { class: 'rcell' }, elemIcon(k), h('span', { class: 'rk' }, RESIST_LABEL[k]), h('span', { class: `rv ${cls}` }, mk));
  }));
}

export function monsterStatusBody(m: MonsterInstance, tab: StatusTab) {
  const sp = getSpecies(m.speciesId);
  const next = expToNextLevel(m);
  const head = h('div', { class: 'st-head' },
    h('span', { class: 'st-name' }, displayName(m)), sexMark(m), plusMark(m.plusValue), m.favorite ? h('span', { class: 'hl' }, '★') : null,
    h('span', { class: 'st-lv' }, `Lv ${m.level}`));
  const card = h('div', { class: 'st-card' },
    h('div', { class: 'st-portrait' }, monIcon(m.speciesId, 'icon big')),
    h('div', { class: 'st-desc' }, sp.description));
  let main: HTMLElement;
  if (tab === 'stats') {
    const rows = (Object.keys(STAT_LABEL2) as (keyof Stats)[]).map((k) => h('div', { class: 'srow' }, h('span', { class: 'k' }, STAT_LABEL2[k]),
      h('span', { class: 'v' }, k === 'hp' ? `${m.hp} / ${m.stats.hp}` : k === 'mp' ? `${m.mp} / ${m.stats.mp}` : String(m.stats[k]))));
    const info = h('div', { class: 'st-box st-info' },
      h('div', { class: 'irow' }, h('span', { class: 'k' }, '系統'), h('span', null, `${FAMILIES[sp.familyId].name}系`)),
      h('div', { class: 'irow' }, h('span', { class: 'k' }, '属性'), sp.element ? h('span', { class: 'row', style: 'gap:6px' }, elemIcon(sp.element), RESIST_LABEL[sp.element]) : h('span', { class: 'muted' }, 'なし')),
      h('div', { class: 'irow' }, h('span', { class: 'k' }, 'ランク'), h('span', { class: 'rank' }, '★'.repeat(sp.rank ?? Math.min(5, sp.rarity)))),
      h('div', { class: 'irow small' }, h('span', { class: 'k' }, 'つぎのLv'), h('span', null, next === null ? `じょうげん（${maxLevelOf(m)}）` : `あと ${next}`)));
    main = h('div', { class: 'st-main' },
      h('div', { class: 'st-box st-stats' }, rows), info,
      h('div', { class: 'st-box' }, h('div', { class: 'st-cap' }, '耐性'), resistGrid(m.resistances)));
  } else if (tab === 'skills') {
    const learned = new Set(m.skills);
    const ls = [...sp.learnset].sort((a, b) => a.level - b.level);
    main = h('div', { class: 'st-main' },
      h('div', { class: 'st-box' }, h('div', { class: 'st-cap' }, `おぼえている とくぎ（${m.skills.length}/8）`),
        m.skills.length ? m.skills.map((id) => { const s = getSkill(id); return h('div', { class: 'skrow' }, h('span', { class: 'skn' }, s.name), h('span', { class: 'skm' }, s.mpCost ? `MP ${s.mpCost}` : ''), h('div', { class: 'skd' }, s.description)); }) : h('div', { class: 'muted' }, 'なし'),
        m.pendingSkills.length ? h('div', { class: 'hl small' }, `おぼえられなかった とくぎ: ${m.pendingSkills.map((s) => getSkill(s).name).join('、')}`) : null),
      h('div', { class: 'st-box' }, h('div', { class: 'st-cap' }, '習得スキル'),
        ls.map((e) => h('div', { class: `lrow${learned.has(e.skillId) ? ' on' : m.level >= e.level ? '' : ' future'}` }, h('span', { class: 'ldot' }), h('span', { class: 'llv' }, `Lv ${e.level}`), h('span', null, getSkill(e.skillId).name)))));
  } else {
    const wild = m.wildness > 0 ? (m.wildness > 40 ? 'とても つよい' : m.wildness > 15 ? 'すこし のこっている' : 'ほとんど なれた') : 'なれている';
    main = h('div', { class: 'st-main' },
      h('div', { class: 'st-box st-info' },
        h('div', { class: 'irow' }, h('span', { class: 'k' }, 'やくわり'), h('span', null, ROLE_LABEL[sp.role ?? ''] ?? '－')),
        h('div', { class: 'irow' }, h('span', { class: 'k' }, 'そだち'), h('span', null, GROWTH_LABEL[sp.growthType ?? ''] ?? 'へいきん')),
        h('div', { class: 'irow' }, h('span', { class: 'k' }, 'やせい'), h('span', null, wild)),
        h('div', { class: 'irow' }, h('span', { class: 'k' }, 'レベル上限'), h('span', null, String(maxLevelOf(m)))),
        h('div', { class: 'irow' }, h('span', { class: 'k' }, 'せだい'), h('span', null, `だい${m.generation}せだい`)),
        h('div', { class: 'irow' }, h('span', { class: 'k' }, 'ルーツ'), h('span', null, m.parentSpeciesIds ? m.parentSpeciesIds.map((id) => getSpecies(id).name).join(' × ') : m.obtainedFrom === 'gift' ? 'もらった' : 'やせいで であった'))),
      sp.lore ? h('div', { class: 'st-box small' }, h('div', { class: 'st-cap' }, 'いいつたえ'), sp.lore) : h('div'));
  }
  return h('div', { class: 'stscreen' }, head, card, main);
}
