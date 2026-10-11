// 物語データの まとめ。章が ふえたら ここに たす。
import { CH1_EVENTS } from './ch1';
import type { StoryEvent } from './types';

export const STORY_EVENTS: StoryEvent[] = [...CH1_EVENTS];
export const STORY_EVENT_BY_ID: Record<string, StoryEvent> = Object.fromEntries(STORY_EVENTS.map((e) => [e.id, e]));
export { NPCS, NPC_BY_ID } from './npcs';
export { LUNA_REACTIONS } from './luna';
