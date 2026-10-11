// ぼうけんメモ: これまでに わかった ことと、つぎの もくひょう
import { STORY_NOTES } from '../../data/events';
import type { App } from '../App';
import { h } from '../dom';

/** つぎに やると よい ことを ひとこと（ストーリーの すすみぐあいで かわる） */
export function nextGoal(p: { defeatedBossIds: string[]; clearedArenaRanks: string[]; storyFlags: Record<string, boolean> }): string {
  const b = (id: string) => p.defeatedBossIds.includes(id);
  if (!b('boss_forest')) return 'はじまりのもりの おくの ゆがみを はらおう。';
  if (!b('boss_cave')) return 'しずくのどうくつの ゆがみを はらおう。（とうぎじょう Fランクも ちょうせん できる）';
  if (!b('boss_highland') || !p.clearedArenaRanks.includes('arenaE')) return 'とうぎじょう Eランクで ゆうしょうして、かぜのこうげんへ いこう。';
  if (!p.storyFlags.champion) return 'ルナフィアたいかいで ゆうしょうしよう。';
  if (!p.storyFlags.towerClear) return 'ひかりのとうの さいじょうかいを めざそう。こおりのゆきやまにも いけるように なった。';
  if (!b('boss_volcano')) return 'ほのおのかざんの ゆがみを はらおう。';
  return 'ずかんの コンプリートや マスターたいかいを めざそう。';
}

export function openNotes(app: App) {
  const g = app.game!;
  const f = g.state.progress.storyFlags;
  app.panel('ぼうけんメモ', (body) => {
    body.append(h('div', { class: 'win' }, h('div', { class: 'small muted' }, 'つぎの もくひょう'), h('div', null, nextGoal(g.state.progress))));
    const notes = STORY_NOTES.filter((n) => f[n.flag]);
    body.append(h('div', { class: 'win small' }, h('h3', null, 'わかった こと'),
      notes.length ? notes.map((n) => h('div', { style: 'margin:4px 0' }, '・' + n.text)) : h('div', { class: 'muted' }, 'まだ なにも わかっていない。ダンジョンを たんけんして、あやしい ものを しらべてみよう。')));
  });
}
