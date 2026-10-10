// インタラクション対象の共通インターフェース（設計書 7.1）。タッチ入力は InteractionSystem だけが扱う。
import type * as THREE from 'three';
import type { GameContext } from '../core/Context';
import type { CritterAnim } from './CritterModel';

export interface InteractionResult {
  ok: boolean;
  message?: string;
  anim?: CritterAnim;
  animTime?: number;
  noise?: number;       // 物音の大きさ（m）
  theftItem?: string;   // 人の物をとった
  owner?: string[];     // 持ち主（気づく NPC の ID）
}

export interface Interactable {
  id: string;
  type: 'food' | 'pickup' | 'container' | 'npc' | 'door' | 'sign' | 'vehicle' | 'hidden' | 'station' | 'home';
  position: { x: number; y: number; z: number };
  reach: number;
  markerY: number;
  object?: THREE.Object3D;
  label(ctx: GameContext): string;
  icon?: string;
  canInteract(ctx: GameContext): boolean;
  /** 見えているか（取られた物などは false） */
  active(ctx: GameContext): boolean;
  interact(ctx: GameContext): InteractionResult;
}
