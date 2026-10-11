import type { Rng } from './Random';

/** 個体 ID。時刻＋乱数で衝突しにくく、既存 ID と重ならないことを呼び出し側で保証する。 */
export function newId(prefix: string, rng: Rng, existing?: { has(id: string): boolean }): string {
  for (;;) {
    const id = `${prefix}_${Math.floor(rng.next() * 36 ** 6).toString(36).padStart(6, '0')}${Math.floor(rng.next() * 36 ** 4).toString(36).padStart(4, '0')}`;
    if (!existing || !existing.has(id)) return id;
  }
}
