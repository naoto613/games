// 各システム・インタラクションに渡すゲームの文脈
import type { GameState } from './GameState';
import type { EventBus } from './EventBus';
import type { InventorySystem } from '../systems/InventorySystem';
import type { EconomySystem } from '../systems/EconomySystem';
import type { QuestSystem } from '../systems/QuestSystem';
import type { Player } from '../entities/Player';
import type { NPC } from '../entities/NPC';
import type { WorldManager } from '../world/WorldManager';

export interface GameContext {
  state: GameState;
  bus: EventBus;
  inv: InventorySystem;
  eco: EconomySystem;
  quests: QuestSystem;
  player: Player;
  world: WorldManager;
  npcs: NPC[];
  time: number;
  toast(text: string, kind?: 'info' | 'good' | 'warn'): void;
  say(who: { bubbleAnchor(): { x: number; y: number; z: number } }, text: string, sec?: number, kind?: 'say' | 'think' | 'shout'): void;
  openDialogue(npcId: string): void;
  openShop(mode: 'buy' | 'sell'): void;
  startFishing(): void;
  witnesses(): string[];
  noise(x: number, z: number, radius: number): void;
  isDisguised(): boolean;
  sleep(): void;
  save(reason: string): void;
}
