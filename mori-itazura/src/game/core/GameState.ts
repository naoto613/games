// セーブ対象のゲーム状態（設計書 13 の SaveData に、空腹度・時刻・クエストの段階を追加）
import { CAMPSITE } from '../content/areas/campsite';

export const SAVE_VERSION = 2;

export interface InventoryEntry { itemId: string; count: number }

export interface SaveData {
  version: number;
  savedAt: string;
  player: {
    areaId: string;
    position: { x: number; y: number; z: number };
    currency: number;
    inventory: InventoryEntry[];
    outfitId: string;
    hunger: number;
  };
  world: {
    unlockedAreaIds: string[];
    objectStates: Record<string, unknown>;
    npcStates: Record<string, unknown>;
    eventFlags: Record<string, boolean>;
    clock: number;      // 0〜24 の時刻
    day: number;
  };
  progress: {
    completedQuestIds: string[];
    activeQuestIds: string[];
    discoveredItemIds: string[];
    achievements: string[];
    questSteps: Record<string, number>;
    counters: Record<string, number>;
  };
}

export function newSaveData(): SaveData {
  return {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    player: {
      areaId: CAMPSITE.id,
      position: { x: CAMPSITE.spawn[0], y: 0, z: CAMPSITE.spawn[1] },
      currency: 0,
      inventory: [],
      outfitId: 'none',
      hunger: 70,
    },
    world: { unlockedAreaIds: [CAMPSITE.id], objectStates: {}, npcStates: {}, eventFlags: {}, clock: 9.5, day: 1 },
    progress: { completedQuestIds: [], activeQuestIds: [], discoveredItemIds: [], achievements: [], questSteps: {}, counters: {} },
  };
}

/** 古い形式のセーブを最新の形式へ移行する */
export function migrate(raw: any): SaveData {
  const base = newSaveData();
  if (!raw || typeof raw !== 'object') return base;
  let d = raw as any;
  if (!d.version || d.version < 1) return base;
  if (d.version === 1) {
    // v1 → v2：空腹度・時刻・カウンターを追加
    d = { ...d, version: 2 };
    d.player = { hunger: 70, ...d.player };
    d.world = { clock: 9.5, day: 1, ...d.world };
    d.progress = { questSteps: {}, counters: {}, ...d.progress };
  }
  return {
    ...base, ...d,
    player: { ...base.player, ...d.player },
    world: { ...base.world, ...d.world },
    progress: { ...base.progress, ...d.progress },
    version: SAVE_VERSION,
  };
}

export class GameState {
  data: SaveData;
  constructor(d?: SaveData) { this.data = d ?? newSaveData(); }
  get player() { return this.data.player; }
  get world() { return this.data.world; }
  get progress() { return this.data.progress; }
  flag(name: string) { return !!this.data.world.eventFlags[name]; }
  setFlag(name: string, v = true) { this.data.world.eventFlags[name] = v; }
  obj<T = any>(id: string): T | undefined { return this.data.world.objectStates[id] as T; }
  setObj(id: string, v: unknown) { this.data.world.objectStates[id] = v; }
  count(name: string) { return this.data.progress.counters[name] ?? 0; }
  addCount(name: string, n = 1) { this.data.progress.counters[name] = this.count(name) + n; return this.count(name); }
}
