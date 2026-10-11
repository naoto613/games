import type { Tactic } from '../data/types';
import type { BreedingHistoryEntry } from '../domain/breeding/BreedingEngine';
import type { Dir, Pos } from '../domain/dungeon/DungeonEngine';
import type { MonsterInstance } from '../domain/monster/types';
import type { ProgressState } from '../domain/progression/ProgressionEngine';
import type { ChapterProgress } from '../domain/progression/ChapterEngine';

export const SCHEMA_VERSION = 5;
export const GAME_VERSION = '0.1.0';

export type GameSettings = {
  textSpeed: 'slow' | 'normal' | 'fast';
  battleSpeed: 'normal' | 'fast' | 'instant';
  reduceMotion: boolean;
  sound: boolean;
  largeText: boolean;
};
export const defaultSettings = (): GameSettings => ({ textSpeed: 'normal', battleSpeed: 'fast', reduceMotion: false, sound: true, largeText: false });

export type PlayerState = {
  name: string;
  gold: number;
  tactic: Tactic;
  playTimeSec: number;
  /** まちの どの へやに いるか */
  townMap: string;
  townPos: Pos;
  townDir: Dir;
};

/** 探索中の状態（途中でアプリを閉じても再開できるように保存する） */
export type Expedition = {
  areaId: string;
  floorIndex: number;
  /** フロア自動生成の シード（はいるたびに かわる） */
  mapSeed: number;
  pos: Pos;
  dir: Dir;
  openedChests: string[];
  springUsed: boolean;
  stepsSinceBattle: number;
  /** この たびで すでに おわった 固有イベント（かくし とびら・めずらしい すみか など） */
  eventsDone: string[];
  lastLead?: string;
};

export type SaveData = {
  schemaVersion: number;
  gameVersion: string;
  savedAt: number;
  player: PlayerState;
  monsters: MonsterInstance[];
  partyIds: string[];
  /** 牧場にいる個体（monsters から partyIds を除いたもの。読み込み時に再計算する） */
  storageIds: string[];
  capacity: number;
  inventory: Record<string, number>;
  progress: ProgressState;
  /** 戦ったことがある種族 */
  discoveredSpeciesIds: string[];
  /** 仲間にしたことがある種族 */
  ownedSpeciesIds: string[];
  breedingHistory: BreedingHistoryEntry[];
  expedition: Expedition | null;
  settings: GameSettings;
  /** v2 の 章・街・機能の 進行 */
  chapters: ChapterProgress;
  /** 見た 物語イベント・ルナの 反応と、記録室に のこした 伏線 */
  story: StoryLog;
  /** v2 で ふえた 育成・やりこみの 記録（計画書 §6） */
  v2: V2State;
};

export type V2State = {
  /** 装備（Q10：1体 1つの アクセサリー）。もちもの と そうびちゅう（モンスターID → 道具ID） */
  equipment: { owned: Record<string, number>; equipped: Record<string, string> };
  /** 依頼の 進み具合 */
  quests: Record<string, { stage: number; done: boolean }>;
  /** 再戦できる ボス */
  bossRematch: string[];
  /** ゲーム内時計（Q11。分） */
  clock: { minutes: number };
  /** 図鑑：生息地を 知った 種族 → 場所 */
  dexHabitats: Record<string, string[]>;
  /** 旧版からの 引き継ぎ */
  legacy: { fromSchema: number; at: number; inherited: boolean } | null;
};

export const defaultV2State = (): V2State => ({
  equipment: { owned: {}, equipped: {} }, quests: {}, bossRematch: [], clock: { minutes: 0 }, dexHabitats: {}, legacy: null,
});

export type StoryLog = { seen: string[]; records: { id: string; title: string }[] };
