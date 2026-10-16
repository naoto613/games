// ぼうけんメモ: つぎの もくひょう（章の 進行から）と、記録室に のこった 伏線（仕様 17.3）
import type { ChapterProgress } from '../../domain/progression/ChapterEngine';
import { CHAPTER_BY_NO, STAGE_BY_ID } from '../../data/world/chapters';
import type { App } from '../App';
import { h } from '../dom';

/** つぎに やると よい ことを ひとこと（章の 進行で かわる） */
export function nextGoal(c: ChapterProgress): string {
  if (c.stage === '1-1' && !c.clearedStages.includes('1-1')) return 'リーフェルの きた、森の 入口の 石碑を しらべよう。';
  const ch = CHAPTER_BY_NO[c.chapter];
  if (!ch) return 'ずかんの コンプリートを めざそう。';
  const st = STAGE_BY_ID[c.stage];
  if (c.chapter === 2 && c.clearedStages.includes('2-1')) return '配合の館で 配合を ためしてみよう。（第2章の つづきは つぎの アップデートで）';
  if (c.chapter === 2) return 'リーフェルの 東の 道から、水辺の街ミズナへ むかおう。';
  return `第${ch.no}章「${ch.title}」：${st?.name ?? ''}${st?.boss ? `（${st.boss}）` : ''}を めざそう。`;
}

export function openNotes(app: App) {
  const g = app.game!;
  app.panel('ぼうけんメモ', (body) => {
    const ch = CHAPTER_BY_NO[g.chapters.chapter];
    body.append(h('div', { class: 'win' },
      ch ? h('div', { class: 'small muted' }, `第${ch.no}章 ${ch.title}（めやす Lv${ch.level[0]}〜${ch.level[1]}）`) : null,
      h('div', { class: 'small muted' }, 'つぎの もくひょう'), h('div', null, nextGoal(g.chapters))));
    const notes = g.story.records;
    body.append(h('div', { class: 'win small' }, h('h3', null, 'わかった こと'),
      notes.length ? notes.map((n) => h('div', { style: 'margin:4px 0' }, '・' + n.title)) : h('div', { class: 'muted' }, 'まだ なにも わかっていない。あやしい ものを しらべてみよう。')));
  });
}
