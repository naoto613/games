// セーブデータの直列化とバージョン移行（保存先には依存しない）
import { newGame, SAVE_VERSION, type GameState } from './state';

export function serialize(s: GameState): string {
  return JSON.stringify({ ...s, version: SAVE_VERSION });
}

/** 古い形式や欠けた項目を補って読み込む。壊れていれば null */
export function deserialize(text: string): GameState | null {
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== 'object' || typeof raw.map !== 'string' || !raw.members) return null;
  const base = newGame();
  const s = { ...base, ...raw } as GameState;
  s.world = { ...base.world, ...(raw.world as object ?? {}) } as GameState['world'];
  s.world.policy = { ...base.world.policy, ...((raw.world as GameState['world'])?.policy ?? {}) };
  // v1 → v2: 「保留を解いた」記録用の lens が無かった
  if (!s.lens) s.lens = {};
  if (!s.log) s.log = [];
  for (const k of ['flags', 'quests', 'graphs', 'outcomes', 'defeated', 'inv'] as const) if (!s[k]) (s as unknown as Record<string, object>)[k] = {};
  if (!Array.isArray(s.records)) s.records = [];
  if (!Array.isArray(s.unlocked)) s.unlocked = ['connect', 'cut'];
  s.version = SAVE_VERSION;
  return s;
}

export interface SaveMeta { slot: string; savedAt: number; map: string; level: number; playtime: number; chapter: string }

export function metaOf(slot: string, s: GameState, mapName: string): SaveMeta {
  const ch = s.flags.chapter1_done ? '第一章 クリア後' : s.flags.chapter1 ? '第一章 繰り返される街' : '序章 存在しない母親';
  return { slot, savedAt: s.savedAt, map: mapName, level: s.members.seil!.level, playtime: s.playtime, chapter: ch };
}
