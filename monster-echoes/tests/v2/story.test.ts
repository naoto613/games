import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { ITEMS } from '../../src/data/items';
import { SPECIES } from '../../src/data/monsters';
import { LUNA_REACTIONS, NPCS, STORY_EVENTS } from '../../src/data/story';
import type { StoryCond, StoryEvent } from '../../src/data/story/types';
import { STAGE_BY_ID, TOWN_BY_ID } from '../../src/data/world/chapters';
import { BOSS_SCRIPTS } from '../../src/data/bosses/scripts';
import { evalCond, eventsFor, lunaReaction, npcLines, renderLines, type StoryContext } from '../../src/domain/story/StoryEngine';
import { initialChapterProgress, progressAfterChapters } from '../../src/domain/progression/ChapterEngine';
import { Game, newGameState } from '../../src/application/Game';
import { MemorySaveRepository } from '../../src/infrastructure/save/SaveRepository';

const ctx = (o: Partial<StoryContext> = {}): StoryContext => ({
  chapters: initialChapterProgress(), flags: {}, seen: [], partySpecies: ['m001'], ownedSpecies: ['m001'], playerName: 'アオ', partnerName: 'ルル', ...o,
});
const ev = (id: string, conditions: StoryCond[] = [], once?: boolean, priority = 0): StoryEvent =>
  ({ id, trigger: { kind: 'manual', target: 'x' }, conditions, once, priority, lines: [{ speaker: '', text: id }], actions: [] });

describe('StoryEngine：条件の 評価', () => {
  it('章・ステージ・フラグ・見た・街・パーティ・どれか', () => {
    const c = ctx({ chapters: progressAfterChapters(1), flags: { a: true }, seen: ['e1'] });
    expect(evalCond(c, { type: 'chapterAtLeast', n: 2 })).toBe(true);
    expect(evalCond(c, { type: 'chapterBelow', n: 2 })).toBe(false);
    expect(evalCond(c, { type: 'stageCleared', id: '1-3' })).toBe(true);
    expect(evalCond(c, { type: 'stageNotCleared', id: '2-1' })).toBe(true);
    expect(evalCond(c, { type: 'flag', id: 'a' })).toBe(true);
    expect(evalCond(c, { type: 'notFlag', id: 'a' })).toBe(false);
    expect(evalCond(c, { type: 'feature', id: 'recruit' })).toBe(true);
    expect(evalCond(c, { type: 'seen', id: 'e1' })).toBe(true);
    expect(evalCond(c, { type: 'notSeen', id: 'e1' })).toBe(false);
    expect(evalCond(c, { type: 'partyHas', speciesId: 'm001' })).toBe(true);
    expect(evalCond(c, { type: 'owns', speciesId: 'm002' })).toBe(false);
    expect(evalCond(c, { type: 'any', of: [{ type: 'flag', id: 'b' }, { type: 'flag', id: 'a' }] })).toBe(true);
  });
  it('一度きりの イベントは 見たら おこらない。once:false は 何度でも。優先度じゅん', () => {
    const list = [ev('a'), ev('b', [], false), ev('c', [], undefined, 5), ev('d', [{ type: 'flag', id: 'no' }])];
    expect(eventsFor(ctx(), list, { kind: 'manual', target: 'x' }).map((e) => e.id)).toEqual(['c', 'a', 'b']);
    expect(eventsFor(ctx({ seen: ['a', 'b', 'c'] }), list, { kind: 'manual', target: 'x' }).map((e) => e.id)).toEqual(['b']);
    expect(eventsFor(ctx(), list, { kind: 'manual', target: 'y' })).toEqual([]);
  });
  it('台詞の 名前を おきかえる', () => {
    expect(renderLines(ctx(), [{ speaker: '{name}', text: '{luna}と {name}' }])).toEqual([{ speaker: 'アオ', text: 'ルルと アオ' }]);
  });
  it('NPC の 会話は 章ごとに かわる', () => {
    const sora = NPCS.find((n) => n.id === 'sora')!;
    const l1 = npcLines(ctx(), sora)!;
    const l2 = npcLines(ctx({ chapters: progressAfterChapters(1) }), sora)!;
    const l5 = npcLines(ctx({ chapters: progressAfterChapters(4) }), sora)!;
    expect(l1[0].speaker).toBe('調律師ソラ');
    expect(new Set([l1[0].text, l2[0].text, l5[0].text]).size).toBe(3);
  });
  it('ルナスライムの 反応：パーティに いないと なし、一度きりの 反応が さき', () => {
    expect(lunaReaction(ctx({ partySpecies: [] }), LUNA_REACTIONS, 'distortion')).toBeNull();
    const first = lunaReaction(ctx(), LUNA_REACTIONS, 'distortion')!;
    expect(first.id).toBe('luna_dist_first');
    expect(first.text).toContain('ルル');
    expect(lunaReaction(ctx({ seen: ['luna_dist_first'] }), LUNA_REACTIONS, 'distortion')!.id).toBe('luna_dist_1');
    expect(lunaReaction(ctx({ chapters: progressAfterChapters(9) }), LUNA_REACTIONS, 'primalLight')!.id).toBe('luna_primal_1');
  });
});

describe('物語データの 整合性', () => {
  it('ID は 一意。参照する ステージ・街・ボス・道具・種族が ある', () => {
    expect(new Set(STORY_EVENTS.map((e) => e.id)).size).toBe(STORY_EVENTS.length);
    expect(new Set(LUNA_REACTIONS.map((e) => e.id)).size).toBe(LUNA_REACTIONS.length);
    for (const e of STORY_EVENTS) {
      const t = e.trigger;
      if (t.kind === 'enterStage' || t.kind === 'clearStage' || t.kind === 'floor') expect(STAGE_BY_ID[t.target], e.id).toBeTruthy();
      if (t.kind === 'floor') expect(t.floor).toBeLessThanOrEqual(STAGE_BY_ID[t.target].floors!);
      if (t.kind === 'bossDefeated') expect(BOSS_SCRIPTS[t.target], e.id).toBeTruthy();
      for (const a of e.actions) {
        if (a.type === 'giveItem') expect(ITEMS[a.itemId], e.id).toBeTruthy();
        if (a.type === 'giveMonster') expect(SPECIES[a.speciesId], e.id).toBeTruthy();
        if (a.type === 'clearStage') expect(STAGE_BY_ID[a.id], e.id).toBeTruthy();
      }
    }
    for (const n of NPCS) expect(TOWN_BY_ID[n.townId], n.id).toBeTruthy();
  });
  it('重要な イベントは ランダムに たよらない（すべて 条件と きっかけで きまる）', () => {
    for (const e of STORY_EVENTS) expect(e.trigger.kind).not.toBe('random');
  });
});

describe('Game：第1章の 流れ', () => {
  it('夜の光 → ルナスライムを たすける → 石碑 → モルグ撃破 → 第2章 ミズナ', async () => {
    const repo = new MemorySaveRepository();
    const g = new Game(newGameState('アオ', createRng(1), 0), { rng: createRng(2), sink: repo });
    g.enterStage('1-1');
    const night = g.runStory({ kind: 'enterStage', target: '1-1' });
    expect(night.map((e) => e.id)).toEqual(['ch1_night_light']);
    expect(night[0].lines[1].text).toContain('アオ');
    // 二度目は おこらない
    expect(g.runStory({ kind: 'enterStage', target: '1-1' })).toEqual([]);
    // 石碑は ルナスライムを たすける まえは 反応しない
    expect(g.runStory({ kind: 'manual', target: 'forest_stone' })).toEqual([]);
    const before = g.state.monsters.length;
    g.runStory({ kind: 'manual', target: 'forest_edge' });
    expect(g.state.monsters.length).toBe(before + 1);
    expect(g.party[0].speciesId).toBe('m001');
    expect(g.talkTo('mio')[0].text).toContain('ルナスライム');
    expect(g.lunaSays('distortion')).toContain('かくれた');
    expect(g.lunaSays('distortion')).toContain('ふるえて');
    const stone = g.runStory({ kind: 'manual', target: 'forest_stone' });
    expect(stone).toHaveLength(1);
    expect(g.chapters.clearedStages).toContain('1-1');
    expect(g.story.records.map((r) => r.id)).toContain('rec_stone_ch1');
    g.clearStage('1-2');
    const morg = g.runStory({ kind: 'bossDefeated', target: 'morg' });
    expect(morg[0].lines.some((l) => l.text.includes('泣いている 光'))).toBe(true);
    expect(g.chapters.chapter).toBe(2);
    expect(g.hasFeature('recruit')).toBe(true);
    g.enterStage('2-1');
    expect(g.runStory({ kind: 'enterStage', target: '2-1' })[0].id).toBe('ch2_mizuna_arrive');
    expect(g.hasFeature('breeding')).toBe(true);
    // 見た ことは セーブに のこる
    await g.save();
    const loaded = await repo.load();
    if (loaded.kind !== 'ok') throw new Error('load');
    const g2 = new Game(loaded.data, { rng: createRng(3), sink: repo });
    expect(g2.story.seen).toContain('ch1_morg_defeated');
    expect(g2.runStory({ kind: 'bossDefeated', target: 'morg' })).toEqual([]);
    expect(g2.talkTo('sora')[0].text).toContain('ミズナ');
  });
});
