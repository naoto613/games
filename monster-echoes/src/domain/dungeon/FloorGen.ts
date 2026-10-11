// ダンジョンの フロアを シードから 自動生成する（はいるたびに 形が かわる。テリワン の 旅の扉と おなじ）。
// 同じ シードなら 同じ マップに なるので、セーブの 再開でも 形は かわらない。
import { createRng, randomInt, type Rng } from '../../core/Random';
import { DIRS, isPassable, reachable, type Pos, type TileMap } from './DungeonEngine';

export type FloorTheme = 'forest' | 'cave' | 'highland' | 'tower';
export type FloorSpec = {
  id: string;
  theme: FloorTheme;
  /** はいってすぐの フロアか（まちへの でぐち E を おく） */
  first: boolean;
  /** さいごの フロアか（ボス B を おく。ちがえば 階段 >） */
  last: boolean;
  /** いやしのいずみ H を おくか */
  spring: boolean;
};

/** フロアの おおきさ（迷路の マス数。タイルは 2倍+1） */
const SIZE: Record<FloorTheme, { cw: [number, number]; ch: [number, number] }> = {
  forest: { cw: [8, 10], ch: [5, 6] },
  cave: { cw: [9, 11], ch: [5, 7] },
  highland: { cw: [9, 11], ch: [5, 7] },
  tower: { cw: [8, 9], ch: [4, 5] },
};

const shuffle = <T>(rng: Rng, a: T[]) => {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

function tryGenerate(spec: FloorSpec, rng: Rng): TileMap | null {
  const sz = SIZE[spec.theme];
  let cw = randomInt(rng, sz.cw[0], sz.cw[1]);
  let ch = randomInt(rng, sz.ch[0], sz.ch[1]);
  if (spec.last) { cw = Math.max(6, cw - 2); ch = Math.max(4, ch - 1); }
  const W = cw * 2 + 1, H = ch * 2 + 1;
  const g: string[][] = Array.from({ length: H }, () => Array(W).fill('#'));
  const cell = (cx: number, cy: number) => ({ x: cx * 2 + 1, y: cy * 2 + 1 });

  // 1) 迷路（あなほり法）
  const seen = new Set<string>();
  const stack: [number, number][] = [[randomInt(rng, 0, cw - 1), randomInt(rng, 0, ch - 1)]];
  seen.add(stack[0].join(','));
  { const p = cell(...stack[0]); g[p.y][p.x] = '.'; }
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const nb = shuffle(rng, Object.values(DIRS).map(([dx, dy]) => [cx + dx, cy + dy, dx, dy] as const))
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < cw && ny < ch && !seen.has(`${nx},${ny}`));
    if (!nb.length) { stack.pop(); continue; }
    const [nx, ny, dx, dy] = nb[0];
    const p = cell(cx, cy);
    g[p.y + dy][p.x + dx] = '.';
    const q = cell(nx, ny);
    g[q.y][q.x] = '.';
    seen.add(`${nx},${ny}`);
    stack.push([nx, ny]);
  }

  // 2) ひろま（ところどころ ひらけた 場所）
  const rooms: { x: number; y: number; w: number; h: number }[] = [];
  const nRooms = randomInt(rng, 2, spec.theme === 'tower' ? 2 : 4);
  for (let i = 0; i < nRooms; i++) {
    const rw = randomInt(rng, 2, 3), rh = randomInt(rng, 1, 2);
    const rx = randomInt(rng, 0, cw - rw), ry = randomInt(rng, 0, ch - rh);
    const a = cell(rx, ry), b = cell(rx + rw - 1, ry + rh - 1);
    for (let y = a.y; y <= b.y; y++) for (let x = a.x; x <= b.x; x++) g[y][x] = '.';
    rooms.push({ x: a.x, y: a.y, w: b.x - a.x + 1, h: b.y - a.y + 1 });
  }

  // 3) いきどまりを すこし つなげて 回り道を つくる
  const isFloor = (x: number, y: number) => y > 0 && x > 0 && y < H - 1 && x < W - 1 && g[y][x] !== '#';
  const deadEnds = () => {
    const out: Pos[] = [];
    for (let cy = 0; cy < ch; cy++) for (let cx = 0; cx < cw; cx++) {
      const p = cell(cx, cy);
      const n = Object.values(DIRS).filter(([dx, dy]) => isFloor(p.x + dx, p.y + dy)).length;
      if (n === 1) out.push(p);
    }
    return out;
  };
  for (const p of deadEnds()) {
    if (rng.next() > 0.3) continue;
    const opts = shuffle(rng, Object.values(DIRS)).filter(([dx, dy]) => !isFloor(p.x + dx, p.y + dy) && isFloor(p.x + dx * 2, p.y + dy * 2));
    if (opts.length) g[p.y + opts[0][1]][p.x + opts[0][0]] = '.';
  }

  // 4) スタート・でぐち
  const ends = shuffle(rng, deadEnds());
  if (ends.length < 3) return null;
  const start = ends.pop()!;
  g[start.y][start.x] = 'S';
  if (spec.first) {
    // S の となりの かべを でぐちに（ほかの ゆかには つながらない ところ）
    const e = shuffle(rng, Object.values(DIRS)).map(([dx, dy]) => ({ x: start.x + dx, y: start.y + dy }))
      .find((q) => g[q.y]?.[q.x] === '#' && Object.values(DIRS).every(([dx, dy]) => {
        const x = q.x + dx, y = q.y + dy;
        return (x === start.x && y === start.y) || g[y]?.[x] === undefined || g[y][x] === '#';
      }));
    if (!e) return null;
    g[e.y][e.x] = 'E';
  }

  // 5) いちばん とおい ところに 階段 / ボス
  const dist = new Map<string, number>([[`${start.x},${start.y}`, 0]]);
  const q: Pos[] = [start];
  while (q.length) {
    const p = q.shift()!;
    for (const [dx, dy] of Object.values(DIRS)) {
      const x = p.x + dx, y = p.y + dy, k = `${x},${y}`;
      if (dist.has(k) || !isFloor(x, y) || g[y][x] === 'E') continue;
      dist.set(k, dist.get(`${p.x},${p.y}`)! + 1);
      q.push({ x, y });
    }
  }
  const d = (p: Pos) => dist.get(`${p.x},${p.y}`) ?? -1;
  ends.sort((a, b) => d(a) - d(b));
  const goal = ends.pop()!;
  if (d(goal) < (spec.last ? 10 : 16)) return null;
  g[goal.y][goal.x] = spec.last ? 'B' : '>';

  // 6) たからばこ・いずみ（いきどまりに おく → 道を ふさがない）
  shuffle(rng, ends);
  if (spec.spring) {
    const i = ends.findIndex((p) => d(p) > d(goal) * 0.3);
    if (i < 0) return null;
    const p = ends.splice(i, 1)[0];
    g[p.y][p.x] = 'H';
  }
  if (ends.length < (spec.last ? 1 : 2)) return null;
  const nChest = Math.min(ends.length, spec.last ? randomInt(rng, 1, 2) : randomInt(rng, 2, 4));
  for (let i = 0; i < nChest; i++) { const p = ends.pop()!; g[p.y][p.x] = 'C'; }

  // 7) けしき（くさ・みず）
  const roomOf = (x: number, y: number) => rooms.find((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
  if (spec.theme === 'cave') {
    // ひろまの まんなかに みずたまり（まわりを 1マス のこすので 道は きれない）
    for (const r of rooms) {
      if (r.w < 5 || r.h < 3 || rng.next() < 0.3) continue;
      for (let y = r.y + 1; y < r.y + r.h - 1; y++) for (let x = r.x + 1; x < r.x + r.w - 1; x++) if (g[y][x] === '.') g[y][x] = '~';
    }
  }
  const grass = { forest: 0.32, highland: 0.5, cave: 0, tower: 0.05 }[spec.theme];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x] !== '.') continue;
    // となりが くさだと くさに なりやすい（まとまりを つくる）
    const near = (g[y - 1]?.[x] === ',' ? 1 : 0) + (g[y]?.[x - 1] === ',' ? 1 : 0);
    if (rng.next() < grass * (1 + near * 0.6) * (roomOf(x, y) ? 1.2 : 1)) g[y][x] = ',';
  }

  const m: TileMap = { id: spec.id, w: W, h: H, tiles: g };
  // けんさ: スタートから ぜんぶに 手が とどくか
  const { walk, touch } = reachable(m, start);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = g[y][x];
    if ('C>BHE'.includes(t) && !touch.has(`${x},${y}`) && !walk.has(`${x},${y}`)) return null;
  }
  if (!isPassable(m, start.x, start.y)) return null;
  return m;
}

const cache = new Map<string, TileMap>();
/** シードから フロアを つくる（同じ シード・フロアなら いつも 同じ 形） */
export function generateFloor(spec: FloorSpec, seed: number): TileMap {
  const key = `${spec.id}:${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rng = createRng((seed ^ hashStr(spec.id)) >>> 0);
  for (let i = 0; i < 200; i++) {
    const m = tryGenerate(spec, rng);
    if (m) {
      if (cache.size > 40) cache.clear();
      cache.set(key, m);
      return m;
    }
  }
  throw new Error(`floor generation failed: ${spec.id}`);
}

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
