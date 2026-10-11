import { AREAS, ARENA_RANKS } from '../../data/areas';
import type { Condition } from '../../data/types';

export type ProgressState = {
  storyFlags: Record<string, boolean>;
  unlockedAreas: string[];
  unlockedArenaRanks: string[];
  clearedArenaRanks: string[];
  defeatedBossIds: string[];
  tutorialFlags: Record<string, boolean>;
};

export const initialProgress = (): ProgressState => ({
  storyFlags: {},
  unlockedAreas: ['forest'],
  unlockedArenaRanks: [],
  clearedArenaRanks: [],
  defeatedBossIds: [],
  tutorialFlags: {},
});

export function conditionMet(p: ProgressState, c: Condition): boolean {
  if (c.type === 'flag') return !!p.storyFlags[c.id];
  if (c.type === 'boss') return p.defeatedBossIds.includes(c.id);
  return p.clearedArenaRanks.includes(c.id);
}
export const allMet = (p: ProgressState, cs: Condition[]) => cs.every((c) => conditionMet(p, c));

export function describeCondition(c: Condition): string {
  if (c.type === 'boss') return { boss_forest: 'はじまりのもりの ゆがみを はらう', boss_cave: 'しずくのどうくつの ゆがみを はらう', boss_highland: 'かぜのこうげんの ゆがみを はらう', boss_tower: 'ひかりのとうを せいはする' }[c.id] ?? c.id;
  if (c.type === 'flag') return { champion: 'ルナフィアたいかいで ゆうしょう', towerClear: 'ひかりのとうを せいはする' }[c.id] ?? c.id;
  return `とうぎじょう ${ARENA_RANKS.find((r) => r.id === c.id)?.name ?? c.id}を ゆうしょう`;
}

/** 条件を満たしたエリア・ランクを解放し、新しく解放されたものを返す */
export function refreshUnlocks(p: ProgressState): { progress: ProgressState; newAreas: string[]; newRanks: string[] } {
  const newAreas = AREAS.filter((a) => !p.unlockedAreas.includes(a.id) && allMet(p, a.unlockConditions)).map((a) => a.id);
  const newRanks = ARENA_RANKS.filter((r) => !p.unlockedArenaRanks.includes(r.id) && allMet(p, r.entryConditions)).map((r) => r.id);
  return {
    progress: { ...p, unlockedAreas: [...p.unlockedAreas, ...newAreas], unlockedArenaRanks: [...p.unlockedArenaRanks, ...newRanks] },
    newAreas,
    newRanks,
  };
}
