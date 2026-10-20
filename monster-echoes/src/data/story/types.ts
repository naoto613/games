// 物語イベント・NPC の 会話・ルナスライムの 反応の 型（仕様 3.4・17.3）。
// 台詞の なかの {name} は 主人公の 名前、{luna} は 相棒（ルナスライム）の 名前に おきかわる。
import type { FeatureId } from '../world/chapters';
import type { EnemySpec } from '../types';

export type StoryCond =
  | { type: 'chapterAtLeast'; n: number }
  | { type: 'chapterBelow'; n: number }
  | { type: 'stageCleared'; id: string }
  | { type: 'stageNotCleared'; id: string }
  | { type: 'flag'; id: string }
  | { type: 'notFlag'; id: string }
  | { type: 'feature'; id: FeatureId }
  | { type: 'seen'; id: string }
  | { type: 'notSeen'; id: string }
  | { type: 'inTown'; id: string }
  | { type: 'partyHas'; speciesId: string }
  | { type: 'owns'; speciesId: string }
  | { type: 'any'; of: StoryCond[] };

/** いつ しらべるか（target は ステージ・街・NPC・ボスの ID） */
export type StoryTrigger =
  | { kind: 'enterStage'; target: string }
  | { kind: 'clearStage'; target: string }
  | { kind: 'floor'; target: string; floor: number }
  | { kind: 'bossDefeated'; target: string }
  | { kind: 'talk'; target: string }
  | { kind: 'manual'; target: string };

export type StoryLine = { speaker: string; text: string };

export type StoryAction =
  | { type: 'setFlag'; id: string }
  | { type: 'giveItem'; itemId: string; count: number }
  /** そうび（アクセサリ）を もらう */
  | { type: 'giveEquip'; equipId: string; count: number }
  | { type: 'giveMonster'; speciesId: string; level: number; nickname?: string; partner?: boolean }
  | { type: 'gold'; amount: number }
  | { type: 'heal' }
  | { type: 'clearStage'; id: string }
  /** 記録室に のこす 伏線（あとから 読みかえせる） */
  | { type: 'record'; id: string; title: string }
  /** 台詞の あとで 戦闘に なる（なかま化の 練習 など） */
  | { type: 'battle'; enemies: EnemySpec[] };

export type StoryEvent = {
  id: string;
  trigger: StoryTrigger;
  conditions: StoryCond[];
  /** false なら 条件を みたす たびに おこる（ふつうは 一度きり） */
  once?: boolean;
  /** おおきい ほうが さき */
  priority?: number;
  lines: StoryLine[];
  actions: StoryAction[];
};

/** NPC の 会話表：条件に あう いちばん 優先度の 高い 台詞を つかう（章ごとに かわる） */
export type NpcTalk = { conditions: StoryCond[]; priority?: number; lines: StoryLine[] };
export type NpcDefinition = { id: string; name: string; townId: string; talks: NpcTalk[] };

/** ルナスライムの 反応（歪み・紋章・ボスの 記憶・原初の光 など） */
export type LunaSituation = 'distortion' | 'emblem' | 'bossMemory' | 'primalLight' | 'town' | 'idle';
export type LunaReaction = { id: string; situation: LunaSituation; conditions: StoryCond[]; once?: boolean; priority?: number; text: string };
