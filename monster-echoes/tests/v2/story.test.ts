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
  it('はじめの 物語 → 石碑 → 木漏れ日の小道 → モルグ撃破 → ミズナ（配合）', async () => {
    const repo = new MemorySaveRepository();
    const g = new Game(newGameState('アオ', createRng(1), 0), { rng: createRng(2), sink: repo });
    // はじめの 物語（夜の光・ルナスライム）は 見た あと。相棒は パーティの 先頭
    expect(g.party.map((m) => m.speciesId)).toEqual(['m001']);
    expect(g.runStory({ kind: 'enterStage', target: '1-1' })).toEqual([]);
    expect(g.talkTo('mio')[0].text).toContain('ルナスライム');
    expect(g.lunaSays('distortion')).toContain('かくれた');
    expect(g.lunaSays('distortion')).toContain('ふるえて');
    // 森の 入口は 石碑を しらべるまで とじている
    expect(g.canStartExpedition('komorebi').ok).toBe(false);
    expect(g.inspect('forest_stone')).toBe(true);
    expect(g.takeStory().story.map((e) => e.id)).toEqual(['ch1_stone_reacts']);
    expect(g.chapters.clearedStages).toContain('1-1');
    expect(g.story.records.map((r) => r.id)).toContain('rec_stone_ch1');
    expect(g.inspect('forest_stone')).toBe(false);
    // 1-2 木漏れ日の小道：出口で ステージクリア
    expect(g.startExpedition('komorebi').ok).toBe(true);
    expect(g.canStartExpedition('sasayaki').ok).toBe(false);
    g.finishStage();
    expect(g.state.expedition).toBeNull();
    expect(g.chapters.clearedStages).toContain('1-2');
    // 1-3 ささやきの森：モルグを たおすと 章クリア
    expect(g.startExpedition('sasayaki').ok).toBe(true);
    const ses = g.startBossBattle('morg');
    ses.state.outcome = 'win';
    for (const e of ses.state.enemies) e.hp = 0;
    const sum = g.finishBattle();
    expect(sum.chapter?.chapter).toBe(1);
    const after = g.takeStory();
    expect(after.story.map((e) => e.id)).toEqual(['ch1_morg_defeated']);
    expect(after.story[0].lines.some((l) => l.text.includes('泣いている 光'))).toBe(true);
    expect(after.unlocked).toEqual(['recruit', 'dex', 'travelDoor']);
    expect(g.chapters.chapter).toBe(2);
    // 東の 道から ミズナへ：着くと 配合が 解放
    g.setTownPos({ x: 24, y: 10 }, 'right');
    expect(g.townMove('right').kind).toBe('warp');
    expect(g.currentTownMap().id).toBe('mizuna');
    const mz = g.takeStory();
    expect(mz.story[0].id).toBe('ch2_mizuna_arrive');
    expect(mz.unlocked).toContain('breeding');
    expect(g.hasFeature('breeding')).toBe(true);
    expect(g.chapters.clearedStages).toContain('2-1');
    // 見た ことは セーブに のこる
    await g.save();
    const loaded = await repo.load();
    if (loaded.kind !== 'ok') throw new Error('load');
    const g2 = new Game(loaded.data, { rng: createRng(3), sink: repo });
    expect(g2.story.seen).toContain('ch1_morg_defeated');
    expect(g2.runStory({ kind: 'bossDefeated', target: 'morg' })).toEqual([]);
    expect(g2.talkTo('sora')[0].text).toContain('ミズナ');
  });
  it('ダンジョンの 物語イベント（石碑の グリーンスプライト）は しらべると 戦闘に なる', () => {
    const g = new Game(newGameState('アオ', createRng(1), 0), { rng: createRng(2), sink: null });
    g.inspect('forest_stone'); g.takeStory();
    g.startExpedition('komorebi');
    g.descend(); g.descend();
    const map = g.currentMap()!;
    expect(Object.values(map.events ?? {})).toContain('ch1_first_recruit');
    expect(g.inspect('ch1_first_recruit')).toBe(true);
    const t = g.takeStory();
    expect(t.battle).toEqual([{ speciesId: 'm043', level: 3 }]);
    expect(g.state.inventory.jerky).toBe(6);
  });
});
