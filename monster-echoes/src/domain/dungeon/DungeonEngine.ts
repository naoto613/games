import { BALANCE } from '../../data/balance';
import { ENCOUNTERS } from '../../data/areas';
import { MAPS } from '../../data/maps';
import type { EnemySpec } from '../../data/types';
import { randomInt, weightedPick, type Rng } from '../../core/Random';

export type Dir = 'up' | 'down' | 'left' | 'right';
export const DIRS: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

export type Pos = { x: number; y: number };

export type TileMap = { id: string; w: number; h: number; tiles: string[][] };

export function loadMap(id: string): TileMap {
  const m = MAPS[id];
  if (!m) throw new Error(`unknown map: ${id}`);
  const w = Math.max(...m.rows.map((r) => r.length));
  return { id, w, h: m.rows.length, tiles: m.rows.map((r) => r.padEnd(w, '#').split('')) };
}

export const tileAt = (m: TileMap, x: number, y: number) => (x < 0 || y < 0 || x >= m.w || y >= m.h ? '#' : m.tiles[y][x]);

const BLOCK = new Set(['#', '~', 'T', 'R', 'W', 'F', 'C', 'H', 'B', 'G', 'L', 'X', 'K', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
/** 歩けるか（宝箱・人・ボスは「調べる」対象で、上には乗れない） */
export const isPassable = (m: TileMap, x: number, y: number) => !BLOCK.has(tileAt(m, x, y));

export function findTile(m: TileMap, ch: string): Pos | null {
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.tiles[y][x] === ch) return { x, y };
  return null;
}
export function findAll(m: TileMap, ch: string): Pos[] {
  const out: Pos[] = [];
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.tiles[y][x] === ch) out.push({ x, y });
  return out;
}

/** スタートから歩いて行ける・調べられる場所の一覧（データ検証用） */
export function reachable(m: TileMap, start: Pos): { walk: Set<string>; touch: Set<string> } {
  const walk = new Set<string>([`${start.x},${start.y}`]);
  const touch = new Set<string>();
  const q = [start];
  while (q.length) {
    const p = q.shift()!;
    for (const [dx, dy] of Object.values(DIRS)) {
      const x = p.x + dx, y = p.y + dy, k = `${x},${y}`;
      touch.add(k);
      if (!walk.has(k) && isPassable(m, x, y)) { walk.add(k); q.push({ x, y }); }
    }
  }
  return { walk, touch };
}

// ---------------------------------------------------------------- エンカウント
const D = BALANCE.dungeon;
/** 歩数に応じて少しずつ上がる遭遇率 */
export function encounterChance(stepsSinceBattle: number): number {
  if (stepsSinceBattle < D.encounterMinSteps) return 0;
  return Math.min(D.encounterMax, D.encounterBase + (stepsSinceBattle - D.encounterMinSteps) * D.encounterRamp);
}

/** 出現テーブルから敵グループを作る。直前と同じ先頭の種族はなるべく避ける。 */
export function rollEncounter(tableId: string, rng: Rng, lastLeadSpecies?: string): EnemySpec[] {
  const t = ENCOUNTERS[tableId];
  if (!t) throw new Error(`unknown encounter table: ${tableId}`);
  const n = weightedPick(rng, t.groupSize);
  const out: EnemySpec[] = [];
  for (let i = 0; i < n; i++) {
    let e = weightedPick(rng, t.entries.map((x) => ({ weight: x.weight, value: x })));
    if (i === 0 && e.speciesId === lastLeadSpecies) e = weightedPick(rng, t.entries.map((x) => ({ weight: x.weight, value: x })));
    out.push({ speciesId: e.speciesId, level: randomInt(rng, e.minLevel, e.maxLevel) });
  }
  return out;
}

/**
 * 地図タップ用の みちすじ（最短）。目的地に乗れない（人・宝箱など）ときは となりまで歩いて、最後に そちらを向いて ぶつかる。
 */
export function findPath(m: TileMap, from: Pos, to: Pos, maxLen = 60): Dir[] | null {
  if (to.x < 0 || to.y < 0 || to.x >= m.w || to.y >= m.h) return null;
  const goalWalk = isPassable(m, to.x, to.y);
  const key = (x: number, y: number) => y * m.w + x;
  const prev = new Map<number, { k: number; d: Dir } | null>([[key(from.x, from.y), null]]);
  const q: Pos[] = [from];
  let end: Pos | null = null;
  let finalBump: Dir | null = null;
  while (q.length && !end) {
    const p = q.shift()!;
    for (const [d, [dx, dy]] of Object.entries(DIRS) as [Dir, [number, number]][]) {
      const x = p.x + dx, y = p.y + dy;
      if (!goalWalk && x === to.x && y === to.y) { end = p; finalBump = d; break; }
      if (prev.has(key(x, y)) || !isPassable(m, x, y)) continue;
      prev.set(key(x, y), { k: key(p.x, p.y), d });
      if (goalWalk && x === to.x && y === to.y) { end = { x, y }; break; }
      q.push({ x, y });
    }
  }
  if (!end) return null;
  const dirs: Dir[] = [];
  let k = key(end.x, end.y);
  while (prev.get(k)) { const e = prev.get(k)!; dirs.unshift(e.d); k = e.k; }
  if (finalBump) dirs.push(finalBump);
  return dirs.length && dirs.length <= maxLen ? dirs : null;
}
