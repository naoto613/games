// イベントスクリプト（データとして定義し、app/runner.ts が順に実行する）
import type { Op } from '../engine/causal';

export type Cmd =
  | { t: 'say'; who: string; text: string }
  | { t: 'narr'; text: string }
  | { t: 'scene'; lines: string[]; title?: string }
  | { t: 'choice'; q?: string; opts: { label: string; cond?: string; ev: Cmd[] }[] }
  | { t: 'set'; f: string; v?: number }
  | { t: 'rec'; id: string }
  | { t: 'item'; id: string; n?: number }
  | { t: 'gold'; n: number }
  | { t: 'margin'; n: number | 'full' }
  | { t: 'quest'; id: string; stage: number }
  | { t: 'puzzle'; id: string; out: Record<string, Cmd[]>; cancel?: Cmd[] }
  | { t: 'battle'; id: string; win?: Cmd[]; lose?: Cmd[]; escape?: Cmd[] }
  | { t: 'warp'; map: string; x: number; y: number; dir?: 0 | 1 | 2 | 3 }
  | { t: 'join'; who: 'dran' }
  | { t: 'if'; c: string; then: Cmd[]; else?: Cmd[] }
  | { t: 'world'; key: string; n: number }
  | { t: 'exp'; n: number }
  | { t: 'heal' }
  | { t: 'unlock'; op: Op }
  | { t: 'save' }
  | { t: 'shop'; id: string }
  | { t: 'sound'; id: string }
  | { t: 'end' }
  | { t: 'sp'; n: number }
  | { t: 'toast'; text: string }
  | { t: 'flash' }
  | { t: 'title'; text: string; sub?: string }
  | { t: 'summary' }
  | { t: 'learnHint'; text: string };

export interface Talk { cond?: string; ev: Cmd[] }

export const S = (who: string, text: string): Cmd => ({ t: 'say', who, text });
export const N = (text: string): Cmd => ({ t: 'narr', text });
export const SET = (f: string, v = 1): Cmd => ({ t: 'set', f, v });
export const REC = (id: string): Cmd => ({ t: 'rec', id });
export const ITEM = (id: string, n = 1): Cmd => ({ t: 'item', id, n });
export const Q = (id: string, stage: number): Cmd => ({ t: 'quest', id, stage });
export const IF = (c: string, then: Cmd[], els?: Cmd[]): Cmd => ({ t: 'if', c, then, else: els });
export const W = (key: string, n: number): Cmd => ({ t: 'world', key, n });
export const TOAST = (text: string): Cmd => ({ t: 'toast', text });
export const EXP = (n: number): Cmd => ({ t: 'exp', n });
export const SOUND = (id: string): Cmd => ({ t: 'sound', id });
