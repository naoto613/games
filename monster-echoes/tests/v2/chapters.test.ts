import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { ALL_STORY_FEATURES, CHAPTERS, FEATURE_NAMES, STAGE_BY_ID, TOWN_BY_ID, TOWNS } from '../../src/data/world/chapters';
import { canEnterStage, chapterStatus, clearStage, enterStage, hasFeature, initialChapterProgress, progressAfterChapters, recommendedLevel } from '../../src/domain/progression/ChapterEngine';
import { Game, newGameState } from '../../src/application/Game';
import { MemorySaveRepository } from '../../src/infrastructure/save/SaveRepository';

describe('章の データ（仕様 5・14・15）', () => {
  it('12章 × 3ステージ、ステージID は 一意', () => {
    expect(CHAPTERS.map((c) => c.no)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const c of CHAPTERS) expect(c.stages).toHaveLength(3);
    expect(Object.keys(STAGE_BY_ID)).toHaveLength(36);
  });
  it('大きな 街 6・小さな 拠点 5（Q7）。街の ステージは 街を さす', () => {
    expect(TOWNS.filter((t) => t.kind === 'major')).toHaveLength(6);
    expect(TOWNS.filter((t) => t.kind === 'hub')).toHaveLength(5);
    for (const s of Object.values(STAGE_BY_ID)) if (s.kind === 'town') expect(TOWN_BY_ID[s.townId!], s.id).toBeTruthy();
  });
  it('章ボスは 各章の 最後の ステージに いる。推奨レベルは 章ごとに あがる（Q15）', () => {
    let prev = 0;
    for (const c of CHAPTERS) {
      const last = c.stages[2];
      expect(last.boss, `ch${c.no}`).toBe(c.boss);
      expect(c.level[0]).toBeGreaterThan(prev - 1);
      expect(c.level[1]).toBeGreaterThan(c.level[0]);
      prev = c.level[0];
    }
    expect(CHAPTERS[11].level).toEqual([62, 68]);
  });
  it('機能の 名前が すべて ある', () => {
    for (const f of ALL_STORY_FEATURES) expect(FEATURE_NAMES[f], f).toBeTruthy();
  });
});

describe('章の 進行と 機能の 解放', () => {
  it('はじめは リーフェルの 基本機能だけ。仲間・図鑑は 第1章クリアで 解放', () => {
    let p = initialChapterProgress();
    const r = enterStage(p, '1-1');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    p = r.value.progress;
    expect(r.value.unlocked.towns).toEqual(['liefel']);
    expect(hasFeature(p, 'save')).toBe(true);
    expect(hasFeature(p, 'recruit')).toBe(false);
    for (const id of ['1-1', '1-2']) { const c = clearStage(p, id); if (!c.ok) throw new Error(c.error); p = c.value.progress; }
    expect(hasFeature(p, 'recruit')).toBe(false);
    const c3 = clearStage(p, '1-3');
    if (!c3.ok) throw new Error(c3.error);
    expect(c3.value.unlocked.chapter).toBe(1);
    expect(c3.value.unlocked.features).toEqual(['recruit', 'dex', 'travelDoor']);
    expect(c3.value.progress.chapter).toBe(2);
    expect(c3.value.progress.stage).toBe('2-1');
  });
  it('ステージは じゅんばんに。さきの 章には はいれない', () => {
    const p = initialChapterProgress();
    expect(canEnterStage(p, '1-1').ok).toBe(true);
    expect(canEnterStage(p, '1-2').ok).toBe(false);
    expect(canEnterStage(p, '2-1').ok).toBe(false);
    expect(clearStage(p, '1-3').ok).toBe(false);
    expect(canEnterStage(p, 'x-9').ok).toBe(false);
  });
  it('第2章：ミズナに 着くと 配合と 牧場、クリアで スキル継承（Q8・仕様 15）', () => {
    let p = progressAfterChapters(1);
    expect(hasFeature(p, 'breeding')).toBe(false);
    const e = enterStage(p, '2-1');
    if (!e.ok) throw new Error(e.error);
    p = e.value.progress;
    expect(hasFeature(p, 'breeding')).toBe(true);
    expect(p.currentTown).toBe('mizuna');
    expect(hasFeature(p, 'skillInherit')).toBe(false);
    p = progressAfterChapters(2);
    expect(hasFeature(p, 'skillInherit')).toBe(true);
    expect(p.towns).toEqual(['liefel', 'mizuna']);
  });
  it('クリアずみの ステージには もういちど はいれ、2回 クリアしても かわらない', () => {
    const p = progressAfterChapters(1);
    expect(canEnterStage(p, '1-2').ok).toBe(true);
    const r = clearStage(p, '1-2');
    expect(r.ok && r.value.progress).toEqual(p);
  });
  it('全章クリアで クリア後と 隠しボスが 解放され、すべての 機能が そろう', () => {
    const p = progressAfterChapters(12);
    expect(p.chapter).toBe(13);
    expect(p.clearedChapters).toHaveLength(12);
    expect(hasFeature(p, 'postgame')).toBe(true);
    expect([...p.features].sort()).toEqual([...ALL_STORY_FEATURES].sort());
    expect(p.towns).toHaveLength(11);
    expect(recommendedLevel(p)).toEqual([62, 68]);
  });
  it('章の 進み具合', () => {
    let p = progressAfterChapters(3);
    const r = clearStage(p, '4-1');
    if (!r.ok) throw new Error(r.error);
    p = r.value.progress;
    expect(chapterStatus(p)).toEqual({ chapter: 4, title: '灯火の街道', cleared: 1, total: 3 });
  });
});

describe('Game から 使う', () => {
  it('章の 進行が セーブに のこる', async () => {
    const repo = new MemorySaveRepository();
    const g = new Game(newGameState('テスト', createRng(1), 0), { rng: createRng(2), sink: repo });
    // はじめから リーフェル（1-1）に いて、基本の 機能が つかえる
    expect(g.hasFeature('save')).toBe(true);
    expect(g.hasFeature('recruit')).toBe(false);
    for (const id of ['1-1', '1-2', '1-3']) expect(g.clearStage(id).ok).toBe(true);
    expect(g.hasFeature('recruit')).toBe(true);
    await g.save();
    const loaded = await repo.load();
    if (loaded.kind !== 'ok') throw new Error('load');
    const g2 = new Game(loaded.data, { rng: createRng(3), sink: repo });
    expect(g2.chapters.chapter).toBe(2);
    expect(g2.hasFeature('dex')).toBe(true);
  });
});
