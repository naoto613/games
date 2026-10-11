// 章・ステージの 進行と 機能の 解放（データは src/data/world/chapters.ts）。
// すべて 純粋関数：あたらしい 状態と「いま 解放された もの」を かえす（画面は それを 見て 案内を 出す）。
import { CHAPTER_BY_NO, CHAPTERS, STAGE_BY_ID, type FeatureId } from '../../data/world/chapters';
import { err, ok, type Result } from '../../core/Result';

export type ChapterProgress = {
  /** いま すすめている 章（全部 クリアしたら 13） */
  chapter: number;
  /** いま いる（または つぎに むかう）ステージ */
  stage: string;
  clearedStages: string[];
  clearedChapters: number[];
  features: FeatureId[];
  /** 着いた ことの ある 街（旅の扉で いける） */
  towns: string[];
  currentTown: string | null;
};

export type Unlocked = { features: FeatureId[]; towns: string[]; stages: string[]; chapter?: number };

export const initialChapterProgress = (): ChapterProgress => ({
  chapter: 1, stage: '1-1', clearedStages: [], clearedChapters: [], features: [], towns: [], currentTown: null,
});

export const hasFeature = (p: ChapterProgress, f: FeatureId) => p.features.includes(f);

/** その ステージに はいれるか（章の じゅん → 章の なかの じゅん） */
export function canEnterStage(p: ChapterProgress, stageId: string): Result<void> {
  const st = STAGE_BY_ID[stageId];
  if (!st) return err('そんな ばしょは ありません。');
  if (p.clearedStages.includes(stageId)) return ok(undefined); // もういちど いける
  if (st.chapter > p.chapter) return err('まだ その ちほうへは いけない。');
  const prev = CHAPTER_BY_NO[st.chapter].stages[st.index - 1];
  if (prev && !p.clearedStages.includes(prev.id)) return err(`さきに ${prev.name}を こえよう。`);
  return ok(undefined);
}

const addAll = <T,>(xs: T[], ys: readonly T[]) => { const add = ys.filter((y) => !xs.includes(y)); return { list: [...xs, ...add], added: add }; };

/** ステージに 着いた（街なら その 街と 機能を 解放する） */
export function enterStage(p: ChapterProgress, stageId: string): Result<{ progress: ChapterProgress; unlocked: Unlocked }> {
  const can = canEnterStage(p, stageId);
  if (!can.ok) return can;
  const st = STAGE_BY_ID[stageId];
  const f = addAll(p.features, st.unlocks);
  const t = addAll(p.towns, st.townId ? [st.townId] : []);
  return ok({
    progress: { ...p, stage: stageId, features: f.list, towns: t.list, currentTown: st.townId ?? null },
    unlocked: { features: f.added, towns: t.added, stages: [] },
  });
}

/**
 * ステージを クリアした。街の ステージは 着けば クリア（街での 導入イベントは StoryEngine）。
 * 章の 最後の ステージなら 章クリア：機能を 解放して つぎの 章へ。
 */
export function clearStage(p: ChapterProgress, stageId: string): Result<{ progress: ChapterProgress; unlocked: Unlocked }> {
  const can = canEnterStage(p, stageId);
  if (!can.ok) return can;
  const st = STAGE_BY_ID[stageId];
  if (p.clearedStages.includes(stageId)) return ok({ progress: p, unlocked: { features: [], towns: [], stages: [] } });
  // 着いていない 街の ステージを とばして クリアしないように、着いたときの 解放も あわせて おこなう
  const entered = enterStage(p, stageId);
  if (!entered.ok) return entered;
  let next: ChapterProgress = { ...entered.value.progress, clearedStages: [...p.clearedStages, stageId] };
  const unlocked: Unlocked = { ...entered.value.unlocked };
  const ch = CHAPTER_BY_NO[st.chapter];
  const after = ch.stages[st.index + 1];
  if (after) {
    next = { ...next, stage: after.id };
    unlocked.stages.push(after.id);
  } else {
    const f = addAll(next.features, ch.clearUnlocks);
    const nextCh = CHAPTER_BY_NO[ch.no + 1];
    next = { ...next, features: f.list, clearedChapters: [...next.clearedChapters, ch.no], chapter: ch.no + 1, stage: nextCh ? nextCh.stages[0].id : stageId };
    unlocked.features = [...unlocked.features, ...f.added];
    unlocked.chapter = ch.no;
    if (nextCh) unlocked.stages.push(nextCh.stages[0].id);
  }
  return ok({ progress: next, unlocked });
}

/** いまの 章の 推奨レベル */
export const recommendedLevel = (p: ChapterProgress): [number, number] => CHAPTER_BY_NO[Math.min(p.chapter, CHAPTERS.length)].level;

/** 章を すすめた 状態を つくる（テスト・引き継ぎ用）。n 章まで クリアずみ */
export function progressAfterChapters(n: number): ChapterProgress {
  let p = initialChapterProgress();
  for (const c of CHAPTERS.slice(0, n)) {
    for (const s of c.stages) {
      const r = clearStage(p, s.id);
      if (!r.ok) throw new Error(r.error);
      p = r.value.progress;
    }
  }
  return p;
}

/** 章の なかで ステージの 進み具合（画面の 「第2章 2/3」 など） */
export function chapterStatus(p: ChapterProgress): { chapter: number; title: string; cleared: number; total: number } {
  const ch = CHAPTER_BY_NO[Math.min(p.chapter, CHAPTERS.length)];
  return { chapter: ch.no, title: ch.title, cleared: ch.stages.filter((s) => p.clearedStages.includes(s.id)).length, total: ch.stages.length };
}
