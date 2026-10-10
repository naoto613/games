/** 乱数生成器。ゲームロジックには必ずこれを注入し、テストでは固定シードで再現できるようにする。 */
export interface Rng {
  /** 0 以上 1 未満 */
  next(): number;
}

/** mulberry32: 小さく高速なシード付き乱数 */
export function createRng(seed: number): Rng & { getState(): number } {
  let s = seed >>> 0;
  return {
    next() {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    getState: () => s,
  };
}

/** 決められた値を順に返す（テスト用）。尽きたら最後の値をくり返す。 */
export function sequenceRng(values: number[]): Rng {
  let i = 0;
  return { next: () => values[Math.min(i++, values.length - 1)] ?? 0.5 };
}

export const randomBetween = (rng: Rng, min: number, max: number) => min + (max - min) * rng.next();
export const randomInt = (rng: Rng, min: number, maxInclusive: number) =>
  min + Math.floor(rng.next() * (maxInclusive - min + 1));
export const chance = (rng: Rng, p: number) => rng.next() < p;
export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng.next() * arr.length)];
}
export function weightedPick<T>(rng: Rng, entries: readonly { weight: number; value: T }[]): T {
  const total = entries.reduce((a, e) => a + e.weight, 0);
  let r = rng.next() * total;
  for (const e of entries) {
    r -= e.weight;
    if (r < 0) return e.value;
  }
  return entries[entries.length - 1].value;
}
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
