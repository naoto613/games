// 物語の 台詞・解放された 機能・物語から はじまる 戦闘を じゅんに みせる（データは data/story、えらぶのは Game）。
import type { Game } from '../../application/Game';
import type { StoryLine } from '../../data/story/types';
import { FEATURE_NAMES } from '../../data/world/chapters';
import { playBgm, sfx } from '../../infrastructure/audio/Sound';
import type { App } from '../App';
import { startBattle } from './battle';

/** 話し手ごとに まとめて 表示する */
export async function sayLines(app: App, lines: readonly StoryLine[]) {
  let i = 0;
  while (i < lines.length) {
    const sp = lines[i].speaker;
    const group: string[] = [];
    while (i < lines.length && lines[i].speaker === sp) group.push(lines[i++].text);
    await app.say(group, sp ? { speaker: sp } : {});
  }
}

/**
 * Game に たまった 物語を すべて みせる。物語から 戦闘が はじまる ときは 戦闘画面へ うつり true を かえす。
 */
export async function playStory(app: App, game: Game): Promise<boolean> {
  const { story, unlocked, battle } = game.takeStory();
  for (const s of story) {
    if (s.id.endsWith('_defeated') || s.id.startsWith('ch2_')) sfx('discover');
    await sayLines(app, s.lines);
  }
  if (unlocked.length) {
    sfx('levelup');
    await app.say(unlocked.map((f) => `「${FEATURE_NAMES[f]}」が つかえるように なった！`));
  }
  if (battle) {
    sfx('encounter');
    playBgm('battle');
    startBattle(app, game.startWildBattle(battle));
    return true;
  }
  return false;
}
