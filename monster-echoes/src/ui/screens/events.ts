// ダンジョンの 固有イベントの ひょうじ（メッセージ・ほうしゅう・めずらしい あいてとの せんとう）
import type { Game } from '../../application/Game';
import { playBgm, sfx } from '../../infrastructure/audio/Sound';
import type { App } from '../App';
import { rewardText } from './field';
import { startBattle } from './battle';

/** 固有イベントを おこなう。refresh は マップの ようすが かわった あとに よぶ */
export async function runEvent(app: App, game: Game, eventId: string, refresh: () => void) {
  const r = game.triggerEvent(eventId);
  if (!r) return;
  const kind = r.def.kind;
  sfx(kind === 'hidden' ? 'secret' : kind === 'vault' ? 'chest' : kind === 'nest' ? 'encounter' : 'discover');
  await app.say(r.pages);
  for (const rw of r.rewards) { sfx('chest'); await app.say(`${rewardText(rw)}を てにいれた！`); }
  refresh();
  if (r.battle) {
    playBgm('battle');
    startBattle(app, game.startWildBattle(r.battle));
  }
}
