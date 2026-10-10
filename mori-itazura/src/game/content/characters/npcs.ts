// NPC の見た目・性格・一日の行動（ルーチン）
import type { HumanLook, HumanAnim } from '../../entities/HumanModel';
import { CAMPSITE as L, P2 } from '../areas/campsite';

export type NpcRole = 'family' | 'kid' | 'ranger' | 'shop' | 'fisher' | 'camper';

export type RoutineTask =
  | { do: 'goto'; to: P2; run?: boolean }
  | { do: 'sit'; at: P2; face: number; anim: HumanAnim; dur: [number, number] }
  | { do: 'idle'; anim: HumanAnim; dur: [number, number]; face?: number }
  | { do: 'wander'; center: P2; radius: number; dur: [number, number] }
  | { do: 'door' };

export interface NpcDef {
  id: string;
  name: string;
  role: NpcRole;
  look: HumanLook;
  start: P2;
  walkSpeed: number;
  runSpeed: number;
  vision: { range: number; fov: number; rate: number };
  chase: boolean;
  leash?: { center: P2; radius: number };
  callsRanger?: boolean;
  routine: RoutineTask[];
  greet: string; // 気づいたときのひとこと
}

const S = L.spots;

export const NPCS: NpcDef[] = [
  {
    id: 'dad', name: 'ケンジ', role: 'family', start: S.dadSeat, walkSpeed: 1.35, runSpeed: 3.9,
    look: { skin: '#f2c9a5', hair: '#3b2a20', hairStyle: 'short', shirt: '#4f86c6', pants: '#3e4a5c', shoes: '#6b4a32', sleeve: 'short', glasses: true, hat: 'cap', hatColor: '#e0a03c' },
    vision: { range: 10, fov: 120, rate: 42 }, chase: true, leash: { center: [-9, 13], radius: 13 },
    greet: 'あっ！ どうぶつだ！',
    routine: [
      { do: 'sit', at: S.dadSeat, face: 0, anim: 'sitEat', dur: [22, 30] },
      { do: 'goto', to: [-6.6, 11.2] },
      { do: 'idle', anim: 'throw', dur: [1.4, 1.4], face: 0 },
      { do: 'goto', to: S.lakeView },
      { do: 'idle', anim: 'lookAround', dur: [6, 9], face: -2.2 },
      { do: 'goto', to: [-10.4, 11.5] },
    ],
  },
  {
    id: 'mom', name: 'ユキ', role: 'family', start: S.momSeat, walkSpeed: 1.3, runSpeed: 3.6,
    look: { skin: '#f6d2b5', hair: '#7a4128', hairStyle: 'bun', shirt: '#f2efe4', pants: '#e07a5f', dress: '#e07a5f', shoes: '#f2efe4', sleeve: 'short' },
    vision: { range: 10, fov: 120, rate: 40 }, chase: false, callsRanger: true,
    greet: 'まあ！ なにか いるわ！',
    routine: [
      { do: 'sit', at: S.momSeat, face: Math.PI, anim: 'read', dur: [30, 40] },
      { do: 'goto', to: S.shopFront },
      { do: 'idle', anim: 'talk', dur: [6, 8], face: Math.PI / 2 },
      { do: 'goto', to: [-9.6, 14.6] },
    ],
  },
  {
    id: 'kid', name: 'ソラ', role: 'kid', start: [-8, 16], walkSpeed: 1.6, runSpeed: 3.2,
    look: { skin: '#f6d2b5', hair: '#2b1d16', hairStyle: 'pigtails', shirt: '#f2c14e', pants: '#3d77c4', shoes: '#d8453b', sleeve: 'short', scale: 0.78, stripes: '#fbf3df' },
    vision: { range: 9, fov: 140, rate: 0 }, chase: false,
    greet: 'わあ！ どうぶつさんだ！',
    routine: [
      { do: 'wander', center: [-10, 16.5], radius: 4.5, dur: [12, 18] },
      { do: 'idle', anim: 'sad', dur: [4, 6] },
      { do: 'wander', center: [-6, 15], radius: 4, dur: [10, 14] },
      { do: 'sit', at: [-15.3, 17.0], face: 0.4, anim: 'sit', dur: [7, 10] },
    ],
  },
  {
    id: 'ranger', name: 'レンジャーの ガンさん', role: 'ranger', start: S.rangerPorch, walkSpeed: 1.5, runSpeed: 4.25,
    look: { skin: '#e3b48f', hair: '#4a3324', hairStyle: 'short', shirt: '#d9c79e', pants: '#56683f', shoes: '#4f3524', vest: '#6f7f45', badge: true, hat: 'ranger', hatColor: '#9a7848', beard: true },
    vision: { range: 13, fov: 115, rate: 36 }, chase: true,
    greet: 'こらーっ！ まてー！',
    routine: [
      { do: 'goto', to: [17, -9.6] },
      { do: 'goto', to: [18.4, -11.6] },
      { do: 'sit', at: S.rangerDesk, face: Math.PI, anim: 'read', dur: [12, 18] },
      { do: 'goto', to: [17, -9.6] },
      { do: 'goto', to: S.rangerPorch },
      { do: 'idle', anim: 'lookAround', dur: [3, 4] },
      { do: 'goto', to: [1.2, 6] },
      { do: 'idle', anim: 'lookAround', dur: [3, 5] },
      { do: 'goto', to: [-6, 9.5] },
      { do: 'idle', anim: 'idle', dur: [3, 4], face: -1.2 },
      { do: 'goto', to: [-10.6, -2.4] },
      { do: 'idle', anim: 'lookAround', dur: [3, 5], face: -2.4 },
      { do: 'goto', to: [-1.5, -4.6] },
      { do: 'idle', anim: 'idle', dur: [2, 3], face: Math.PI },
      { do: 'goto', to: [9, -3] },
    ],
  },
  {
    id: 'shop', name: 'ばいてんの モモさん', role: 'shop', start: S.shopInside, walkSpeed: 1.2, runSpeed: 2.5,
    look: { skin: '#f2c9a5', hair: '#c7663a', hairStyle: 'bob', shirt: '#7bc3b5', pants: '#3e4a5c', shoes: '#f2efe4', apron: '#f4e3c3', hat: 'bandana', hatColor: '#e2574c' },
    vision: { range: 7, fov: 150, rate: 30 }, chase: false,
    greet: 'あら？ どうぶつ？',
    routine: [
      { do: 'idle', anim: 'idle', dur: [5, 8], face: -Math.PI / 2 },
      { do: 'idle', anim: 'wipe', dur: [4, 6], face: -Math.PI / 2 },
    ],
  },
  {
    id: 'fisher', name: 'つりびとの ジロウ', role: 'fisher', start: S.fisherSeat, walkSpeed: 1.1, runSpeed: 2.5,
    look: { skin: '#e8b994', hair: '#d9d4c7', hairStyle: 'bald', shirt: '#5a7d9a', pants: '#6b5a44', shoes: '#3b3b3b', vest: '#c9a24e', hat: 'bucket', hatColor: '#b9a77a', beard: true },
    vision: { range: 8, fov: 120, rate: 12 }, chase: false,
    greet: 'おや、めずらしい おきゃくさんだ',
    routine: [
      { do: 'sit', at: S.fisherSeat, face: -Math.PI / 2, anim: 'fish', dur: [40, 55] },
      { do: 'idle', anim: 'cheer', dur: [1.6, 1.6], face: -Math.PI / 2 },
    ],
  },
  {
    id: 'camper', name: 'キャンパーの タク', role: 'camper', start: S.guitarLog, walkSpeed: 1.3, runSpeed: 3.5,
    look: { skin: '#d9a07a', hair: '#1d1d1d', hairStyle: 'spiky', shirt: '#2f9c8f', pants: '#c9b28a', shoes: '#f2efe4', sleeve: 'short', backpack: '#e07a3f' },
    vision: { range: 9, fov: 120, rate: 26 }, chase: false, callsRanger: true,
    greet: 'うおっ、なんだ？',
    routine: [
      { do: 'sit', at: S.guitarLog, face: -0.885, anim: 'strum', dur: [25, 35] },
      { do: 'goto', to: [-7.4, -10.2] },
      { do: 'idle', anim: 'idle', dur: [5, 7], face: Math.PI },
      { do: 'goto', to: [0.6, -10.2] },
    ],
  },
];

export interface Disguise {
  id: string;
  name: string;
  outfitAssetId: string;
  allowedAreas: string[];
  suspicionModifiers: Record<string, number>;
  unlockCondition?: string;
}

export const DISGUISES: Record<string, Disguise> = {
  none: { id: 'none', name: 'そのまま', outfitAssetId: '', allowedAreas: [], suspicionModifiers: {} },
  camper_outfit: {
    id: 'camper_outfit', name: 'キャンパーふく', outfitAssetId: 'camper_outfit', allowedAreas: ['campsite', 'shop', 'job'],
    suspicionModifiers: { family: 0.12, kid: 0, ranger: 0.3, shop: 0, fisher: 0.05, camper: 0.08 },
  },
  straw_hat: {
    id: 'straw_hat', name: 'むぎわらぼうし', outfitAssetId: 'straw_hat', allowedAreas: ['dock', 'shop'],
    suspicionModifiers: { family: 0.45, kid: 0, ranger: 0.55, shop: 0.2, fisher: 0, camper: 0.4 },
  },
  sunglasses: {
    id: 'sunglasses', name: 'サングラス', outfitAssetId: 'sunglasses', allowedAreas: ['shop'],
    suspicionModifiers: { family: 0.6, kid: 0, ranger: 0.7, shop: 0.3, fisher: 0.5, camper: 0.5 },
  },
  ranger_hat: {
    id: 'ranger_hat', name: 'レンジャーぼうし', outfitAssetId: 'ranger_hat', allowedAreas: ['cabin', 'shop', 'campsite'],
    suspicionModifiers: { family: 0.05, kid: 0, ranger: 1.5, shop: 0.15, fisher: 0.1, camper: 0.05 }, unlockCondition: 'ranger_hat',
  },
};

/** 変装による見られにくさ（1 = そのまま） */
export function disguiseModifier(outfitId: string, role: NpcRole) {
  const d = DISGUISES[outfitId];
  if (!d || outfitId === 'none') return 1;
  return d.suspicionModifiers[role] ?? 1;
}
export function canTalk(outfitId: string, role: NpcRole) {
  if (role === 'kid') return true;
  return disguiseModifier(outfitId, role) < 0.62;
}
export function allows(outfitId: string, area: string) {
  return DISGUISES[outfitId]?.allowedAreas.includes(area) ?? false;
}
