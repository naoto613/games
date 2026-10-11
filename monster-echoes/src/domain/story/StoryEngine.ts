// 物語イベント・NPC 会話・ルナスライムの 反応を えらぶ（純粋関数）。実際の 反映（フラグ・道具・仲間）は Game が おこなう。
import type { LunaReaction, LunaSituation, NpcDefinition, StoryCond, StoryEvent, StoryLine, StoryTrigger } from '../../data/story/types';
import type { ChapterProgress } from '../progression/ChapterEngine';

export type StoryContext = {
  chapters: ChapterProgress;
  flags: Record<string, boolean>;
  /** 見た イベント・反応の ID */
  seen: string[];
  partySpecies: string[];
  ownedSpecies: string[];
  playerName: string;
  partnerName: string;
};

export function evalCond(ctx: StoryContext, c: StoryCond): boolean {
  switch (c.type) {
    case 'chapterAtLeast': return ctx.chapters.chapter >= c.n;
    case 'chapterBelow': return ctx.chapters.chapter < c.n;
    case 'stageCleared': return ctx.chapters.clearedStages.includes(c.id);
    case 'stageNotCleared': return !ctx.chapters.clearedStages.includes(c.id);
    case 'flag': return !!ctx.flags[c.id];
    case 'notFlag': return !ctx.flags[c.id];
    case 'feature': return ctx.chapters.features.includes(c.id);
    case 'seen': return ctx.seen.includes(c.id);
    case 'notSeen': return !ctx.seen.includes(c.id);
    case 'inTown': return ctx.chapters.currentTown === c.id;
    case 'partyHas': return ctx.partySpecies.includes(c.speciesId);
    case 'owns': return ctx.ownedSpecies.includes(c.speciesId);
    case 'any': return c.of.some((x) => evalCond(ctx, x));
  }
}
export const allCond = (ctx: StoryContext, cs: StoryCond[]) => cs.every((c) => evalCond(ctx, c));

const sameTrigger = (a: StoryTrigger, b: StoryTrigger) =>
  a.kind === b.kind && a.target === b.target && (a.kind !== 'floor' || (b.kind === 'floor' && a.floor === b.floor));

/** その きっかけで おこる イベント（優先度じゅん）。一度きりで 見たものは のぞく */
export function eventsFor(ctx: StoryContext, events: readonly StoryEvent[], trigger: StoryTrigger): StoryEvent[] {
  return events
    .filter((e) => sameTrigger(e.trigger, trigger))
    .filter((e) => e.once === false || !ctx.seen.includes(e.id))
    .filter((e) => allCond(ctx, e.conditions))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

/** 台詞の {name}・{luna} を おきかえる */
export function renderLines(ctx: StoryContext, lines: readonly StoryLine[]): StoryLine[] {
  const f = (s: string) => s.replaceAll('{name}', ctx.playerName).replaceAll('{luna}', ctx.partnerName);
  return lines.map((l) => ({ speaker: f(l.speaker), text: f(l.text) }));
}

/** イベントを 見た ことに する（一度きりの 判定と「見た」条件に つかう） */
export function markSeen(seen: readonly string[], id: string): string[] {
  return seen.includes(id) ? [...seen] : [...seen, id];
}

/** NPC の いまの 台詞（章ごとに かわる）。あう ものが なければ null */
export function npcLines(ctx: StoryContext, npc: NpcDefinition): StoryLine[] | null {
  const talk = npc.talks
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => allCond(ctx, t.conditions))
    .sort((a, b) => (b.t.priority ?? 0) - (a.t.priority ?? 0) || b.i - a.i)[0];
  return talk ? renderLines(ctx, talk.t.lines.map((l) => ({ ...l, speaker: l.speaker || npc.name }))) : null;
}

/** ルナスライムの 反応。相棒が パーティに いない ときは 反応しない */
export function lunaReaction(ctx: StoryContext, reactions: readonly LunaReaction[], situation: LunaSituation, partnerSpecies = 'm001'): LunaReaction | null {
  if (!ctx.partySpecies.includes(partnerSpecies)) return null;
  const r = reactions
    .filter((x) => x.situation === situation)
    .filter((x) => !x.once || !ctx.seen.includes(x.id))
    .filter((x) => allCond(ctx, x.conditions))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0];
  return r ? { ...r, text: renderLines(ctx, [{ speaker: '', text: r.text }])[0].text } : null;
}
