// 相棒ルナスライムの 反応（仕様 3.4：歪みで 震える／遺跡の 紋章に 反応／ボスの 記憶を 感じとる／終盤で 原初の光を 思いだす）。
import type { LunaReaction } from './types';

export const LUNA_REACTIONS: LunaReaction[] = [
  // 歪み
  { id: 'luna_dist_1', situation: 'distortion', conditions: [{ type: 'chapterBelow', n: 4 }], text: '{luna}が ぷるぷると ふるえている……。この ちかくに 歪みが あるようだ。' },
  { id: 'luna_dist_2', situation: 'distortion', conditions: [{ type: 'chapterAtLeast', n: 4 }], text: '{luna}は ふるえながらも、歪みの ほうを まっすぐ 見つめている。' },
  { id: 'luna_dist_first', situation: 'distortion', conditions: [], once: true, priority: 5, text: '{luna}が {name}の あしもとに かくれた。からだが つめたく ふるえている。' },
  // 紋章
  { id: 'luna_emblem', situation: 'emblem', conditions: [], text: '壁の 紋章が、{luna}の からだと おなじ 色に 光った。' },
  { id: 'luna_emblem_first', situation: 'emblem', conditions: [], once: true, priority: 5, text: '{luna}が 紋章に ふれると、かすかな 歌が きこえた 気が した。' },
  // ボスの 記憶
  { id: 'luna_boss', situation: 'bossMemory', conditions: [], text: '{luna}が しずかに 目を とじた。のこされた 記憶を 感じとっているようだ。' },
  { id: 'luna_boss_late', situation: 'bossMemory', conditions: [{ type: 'chapterAtLeast', n: 9 }], priority: 1, text: '{luna}「……この 記憶、しっている 気が する」' },
  // 原初の光（終盤）
  { id: 'luna_primal_1', situation: 'primalLight', conditions: [{ type: 'chapterAtLeast', n: 10 }], once: true, priority: 2, text: '{luna}の からだの おくで、ちいさな 光が ともった。' },
  { id: 'luna_primal_2', situation: 'primalLight', conditions: [{ type: 'chapterAtLeast', n: 11 }, { type: 'seen', id: 'luna_primal_1' }], once: true, priority: 3, text: '{luna}「{name}……わたし、ずっと まえから ここに いた」' },
  { id: 'luna_primal', situation: 'primalLight', conditions: [{ type: 'chapterAtLeast', n: 10 }], text: '{luna}が 光の ほうを 見上げている。' },
  // 街・ふだん
  { id: 'luna_town', situation: 'town', conditions: [], text: '{luna}は 街の ひとたちに なでられて うれしそうだ。' },
  { id: 'luna_idle', situation: 'idle', conditions: [], text: '{luna}が ぴょんと はねた。' },
];
