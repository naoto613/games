import type { Tactic } from '../data/types';
import type { BreedingHistoryEntry } from '../domain/breeding/BreedingEngine';
import type { Dir, Pos } from '../domain/dungeon/DungeonEngine';
import type { MonsterInstance } from '../domain/monster/types';
import type { ProgressState } from '../domain/progression/ProgressionEngine';

export const SCHEMA_VERSION = 1;
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
  pos: Pos;
  dir: Dir;
  openedChests: string[];
  springUsed: boolean;
  stepsSinceBattle: number;
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
};
