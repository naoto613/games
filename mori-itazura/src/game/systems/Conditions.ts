// クエスト・会話・イベントで共通に使う条件式
import type { GameState } from '../core/GameState';

export type Condition =
  | { questCompleted: string }
  | { questActive: string }
  | { questNotStarted: string }
  | { flag: string; value?: boolean }
  | { hasItem: string; count?: number }
  | { outfit: string | string[] }
  | { disguised: boolean }
  | { money: number }
  | { counter: string; atLeast: number }
  | { not: Condition }
  | { any: Condition[] };

export interface CondCtx {
  state: GameState;
  itemCount: (id: string) => number;
  questStatus: (id: string) => string;
  isDisguised: () => boolean;
}

export function check(c: Condition, ctx: CondCtx): boolean {
  if ('questCompleted' in c) return ctx.questStatus(c.questCompleted) === 'Completed';
  if ('questActive' in c) return ctx.questStatus(c.questActive) === 'Active';
  if ('questNotStarted' in c) { const s = ctx.questStatus(c.questNotStarted); return s === 'Locked' || s === 'Available'; }
  if ('flag' in c) return ctx.state.flag(c.flag) === (c.value ?? true);
  if ('hasItem' in c) return ctx.itemCount(c.hasItem) >= (c.count ?? 1);
  if ('outfit' in c) { const o = ctx.state.player.outfitId; return Array.isArray(c.outfit) ? c.outfit.includes(o) : o === c.outfit; }
  if ('disguised' in c) return ctx.isDisguised() === c.disguised;
  if ('money' in c) return ctx.state.player.currency >= c.money;
  if ('counter' in c) return ctx.state.count(c.counter) >= c.atLeast;
  if ('not' in c) return !check(c.not, ctx);
  if ('any' in c) return c.any.some((x) => check(x, ctx));
  return false;
}

export function checkAll(cs: Condition[] | undefined, ctx: CondCtx) {
  return !cs || cs.every((c) => check(c, ctx));
}
