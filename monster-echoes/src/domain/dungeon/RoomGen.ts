// 部屋テンプレート型の フロア生成（要確認事項 Q14）。
// 1) 格子（よこ cols × たて rows）の マスに 部屋テンプレートを ひとつずつ おく
// 2) マスどうしを ランダムな 木で つなぎ（＋すこし 回り道）、部屋の とびら（D）を 通路で むすぶ
// 3) スタートから いちばん 遠い 部屋に 階段（さいごの 階は ボス B）、固定イベント・宝箱・泉・隠し部屋を おく
// 4) ギミック（毒の床・水流・氷・スイッチと 扉）を 重ねる
// 5) 到達できるか しらべ、だめなら つくりなおす（同じ シードなら いつも 同じ 形）
import { createRng, randomInt, type Rng } from '../../core/Random';
import { DIRS, isPassable, type Dir, type Pos, type TileMap } from './DungeonEngine';
import type { FloorTheme } from './FloorGen';

export type GimmickKind = 'poison' | 'current' | 'ice' | 'switchGate' | 'wind';
export type Gimmick =
  | { kind: 'poison' }
  | { kind: 'current'; dir: Dir }
  /** 風の 橋（第3章）：のると 風に ながされる（うごきは 水流と おなじ） */
  | { kind: 'wind'; dir: Dir }
  | { kind: 'ice' }
  | { kind: 'switch'; id: string }
  | { kind: 'gate'; id: string };

export type RoomTileMap = TileMap & {
  /** ギミックの 重ね合わせ（"x,y" → ギミック）。下の タイルは ふつうの 床 */
  gimmicks: Record<string, Gimmick>;
  rooms: { x: number; y: number; w: number; h: number; role: RoomRole }[];
  start: Pos;
};
export type RoomRole = 'start' | 'goal' | 'event' | 'gimmick' | 'plain';

export type RoomFloorSpec = {
  id: string;
  theme: FloorTheme;
  first: boolean;
  last: boolean;
  /** 固定イベント（hidden は 隠し扉 Z の 奥に 宝の部屋） */
  events?: { id: string; kind: string; vaultId?: string }[];
  spring: boolean;
  gimmicks?: GimmickKind[];
  /** 格子の 大きさ（省略時は テーマと 階で きめる） */
  grid?: { cols: number; rows: number };
};

// ---------------------------------------------------------------- 部屋テンプレート
// # かべ  . 床  , くさ  I はしら  ~ みず  D とびら（辺の まんなか）  * 置き場（宝箱・イベント・階段）  g ギミックの 場所
export const ROOM_TEMPLATES: { id: string; rows: string[]; gimmick?: boolean }[] = [
  { id: 'small', rows: ['###D###', '#*....#', 'D.....D', '#....*#', '###D###'] },
  { id: 'pillars', rows: ['####D####', '#*......#', '#..I.I..#', 'D.......D', '#..I.I..#', '#......*#', '####D####'] },
  { id: 'meadow', rows: ['####D####', '#,,...,,#', '#,*...*,#', 'D...,...D', '#,.....,#', '#,,...,,#', '####D####'] },
  { id: 'pond', rows: ['####D####', '#*......#', '#..~~~..#', 'D..~~~..D', '#..~~~..#', '#......*#', '####D####'] },
  { id: 'tall', rows: ['##D##', '#*..#', '#...#', 'D...D', '#...#', '#..*#', '##D##'] },
  { id: 'wide', rows: ['####D####', '#*.....*#', 'D.......D', '#...,...#', '####D####'] },
  { id: 'trial', gimmick: true, rows: ['####D####', '#.......#', '#.ggggg.#', 'D.ggggg.D', '#.ggggg.#', '#*.....*#', '####D####'] },
];
const SLOT_W = 11, SLOT_H = 9;

const shuffle = <T>(rng: Rng, a: T[]) => {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const k = (x: number, y: number) => `${x},${y}`;

function gridOf(spec: RoomFloorSpec, rng: Rng) {
  if (spec.grid) return spec.grid;
  if (spec.last) return { cols: 3, rows: 2 };
  return rng.next() < 0.5 ? { cols: 3, rows: 3 } : { cols: 4, rows: 2 };
}

type Placed = { slot: number; sx: number; sy: number; ox: number; oy: number; w: number; h: number; t: (typeof ROOM_TEMPLATES)[number]; role: RoomRole; doors: Record<Dir, Pos> };

function tryGenerate(spec: RoomFloorSpec, rng: Rng): RoomTileMap | null {
  const { cols, rows } = gridOf(spec, rng);
  const W = cols * SLOT_W + 2, H = rows * SLOT_H + 2;
  const g: string[][] = Array.from({ length: H }, () => Array(W).fill('#'));
  const n = cols * rows;
  const wantGimmicks = (spec.gimmicks ?? []).filter((x) => x !== 'switchGate');

  // 1) どの マスを つかうか（ぜんぶ）と 木（ランダムな 深さ優先）
  const adj: Set<number>[] = Array.from({ length: n }, () => new Set());
  const nbOf = (i: number) => {
    const x = i % cols, y = Math.floor(i / cols);
    return ([[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]] as const).filter(([a, b]) => a >= 0 && b >= 0 && a < cols && b < rows).map(([a, b]) => b * cols + a);
  };
  const seen = new Set<number>([randomInt(rng, 0, n - 1)]);
  const stack = [...seen];
  while (stack.length) {
    const cur = stack[stack.length - 1];
    const nb = shuffle(rng, nbOf(cur).filter((j) => !seen.has(j)));
    if (!nb.length) { stack.pop(); continue; }
    adj[cur].add(nb[0]); adj[nb[0]].add(cur);
    seen.add(nb[0]); stack.push(nb[0]);
  }
  // 回り道（すこしだけ）
  for (let i = 0; i < n; i++) for (const j of nbOf(i)) if (j > i && !adj[i].has(j) && rng.next() < 0.15) { adj[i].add(j); adj[j].add(i); }

  // 2) 役わり：スタートは 葉（つながり 1）、ゴールは いちばん 遠い 部屋
  const leaves = shuffle(rng, [...Array(n).keys()].filter((i) => adj[i].size === 1));
  const startSlot = leaves[0] ?? 0;
  const dist = new Map<number, number>([[startSlot, 0]]);
  const q = [startSlot];
  while (q.length) { const c = q.shift()!; for (const j of adj[c]) if (!dist.has(j)) { dist.set(j, dist.get(c)! + 1); q.push(j); } }
  const goalSlot = [...dist.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
  if (goalSlot === startSlot) return null;
  const roles: RoomRole[] = Array(n).fill('plain');
  roles[startSlot] = 'start';
  roles[goalSlot] = 'goal';
  const others = shuffle(rng, [...Array(n).keys()].filter((i) => roles[i] === 'plain'));
  const visible = (spec.events ?? []).filter((e) => e.kind !== 'hidden');
  // イベントの 部屋（葉を 優先：わき道の おくに ある ほうが 探索の 意味が ある）
  others.sort((a, b) => adj[a].size - adj[b].size);
  const eventSlots = others.splice(0, visible.length);
  if (eventSlots.length < visible.length) return null;
  for (const i of eventSlots) roles[i] = 'event';
  const gimmickSlots = shuffle(rng, others).splice(0, wantGimmicks.length);
  if (gimmickSlots.length < wantGimmicks.length) return null;
  for (const i of gimmickSlots) roles[i] = 'gimmick';

  // 3) 部屋を おく
  const placed: Placed[] = [];
  const plainTemplates = ROOM_TEMPLATES.filter((t) => !t.gimmick);
  for (let i = 0; i < n; i++) {
    const t = roles[i] === 'gimmick' ? ROOM_TEMPLATES.find((x) => x.gimmick)! : plainTemplates[Math.floor(rng.next() * plainTemplates.length)];
    const w = t.rows[0].length, h = t.rows.length;
    const sx = i % cols, sy = Math.floor(i / cols);
    const ox = 1 + sx * SLOT_W + ((SLOT_W - w) >> 1), oy = 1 + sy * SLOT_H + ((SLOT_H - h) >> 1);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g[oy + y][ox + x] = t.rows[y][x];
    const mx = w >> 1, my = h >> 1;
    placed.push({ slot: i, sx, sy, ox, oy, w, h, t, role: roles[i], doors: {
      up: { x: ox + mx, y: oy }, down: { x: ox + mx, y: oy + h - 1 }, left: { x: ox, y: oy + my }, right: { x: ox + w - 1, y: oy + my },
    } });
  }

  // 4) 通路で つなぐ（L字。とちゅうの 曲がりは マスの さかいめ＝部屋の そと）
  const carve = (x: number, y: number) => { if (g[y][x] === '#' || g[y][x] === 'D') g[y][x] = '.'; };
  const used = new Set<string>();
  for (let i = 0; i < n; i++) for (const j of adj[i]) {
    if (j < i) continue;
    const A = placed[i], B = placed[j];
    if (B.sx === A.sx + 1) {
      const a = A.doors.right, b = B.doors.left, mx = 1 + A.sx * SLOT_W + SLOT_W - 1;
      for (let x = a.x; x <= mx; x++) carve(x, a.y);
      for (let y = Math.min(a.y, b.y); y <= Math.max(a.y, b.y); y++) carve(mx, y);
      for (let x = mx; x <= b.x; x++) carve(x, b.y);
      used.add(k(a.x, a.y)); used.add(k(b.x, b.y));
    } else {
      const a = A.doors.down, b = B.doors.up, my = 1 + A.sy * SLOT_H + SLOT_H - 1;
      for (let y = a.y; y <= my; y++) carve(a.x, y);
      for (let x = Math.min(a.x, b.x); x <= Math.max(a.x, b.x); x++) carve(x, my);
      for (let y = my; y <= b.y; y++) carve(b.x, y);
      used.add(k(a.x, a.y)); used.add(k(b.x, b.y));
    }
  }
  const spareDoors: { p: Pos; dir: Dir; room: Placed }[] = [];
  for (const r of placed) for (const [d, p] of Object.entries(r.doors) as [Dir, Pos][]) {
    if (!used.has(k(p.x, p.y))) { g[p.y][p.x] = '#'; spareDoors.push({ p, dir: d, room: r }); }
  }

  // 5) 置き場（*）を つかって 中身を おく
  const sockets = (r: Placed) => {
    const out: Pos[] = [];
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) if (r.t.rows[y][x] === '*') out.push({ x: r.ox + x, y: r.oy + y });
    return shuffle(rng, out);
  };
  const center = (r: Placed): Pos => ({ x: r.ox + (r.w >> 1), y: r.oy + (r.h >> 1) });
  const free = new Map<number, Pos[]>(placed.map((r) => [r.slot, sockets(r)]));
  for (const r of placed) for (const p of free.get(r.slot)!) g[p.y][p.x] = '.';
  const S = placed[startSlot];
  const start = center(S);
  if (g[start.y][start.x] !== '.' && g[start.y][start.x] !== ',') return null;
  g[start.y][start.x] = 'S';
  if (spec.first) {
    // スタートの 部屋の あまった とびらを まちへの でぐちに
    const d = spareDoors.find((x) => x.room === S);
    if (!d) return null;
    g[d.p.y][d.p.x] = 'E';
  }
  const G = placed[goalSlot];
  const goal = center(G);
  if (g[goal.y][goal.x] !== '.' && g[goal.y][goal.x] !== ',') return null;
  g[goal.y][goal.x] = spec.last ? 'B' : '>';

  const events: Record<string, string> = {};
  visible.forEach((e, i) => {
    const r = placed[eventSlots[i]];
    const p = free.get(r.slot)!.pop() ?? center(r);
    g[p.y][p.x] = 'V';
    events[k(p.x, p.y)] = e.id;
  });
  // 泉（スタートと ゴール いがいの 部屋）
  if (spec.spring) {
    const r = placed.find((x) => x.role === 'plain' && free.get(x.slot)!.length) ?? placed.find((x) => x.role === 'gimmick' && free.get(x.slot)!.length);
    if (!r) return null;
    const p = free.get(r.slot)!.pop()!;
    g[p.y][p.x] = 'H';
  }
  // 宝箱
  const chestRooms = shuffle(rng, placed.filter((r) => r.role !== 'start' && free.get(r.slot)!.length));
  const nChest = Math.min(chestRooms.length, spec.last ? randomInt(rng, 1, 2) : randomInt(rng, 2, 4));
  for (let i = 0; i < nChest; i++) { const p = free.get(chestRooms[i].slot)!.pop()!; g[p.y][p.x] = 'C'; }

  // 隠し部屋：あまった とびらを 隠し扉 Z に して、その そとに 宝の V
  const hid = (spec.events ?? []).find((e) => e.kind === 'hidden');
  if (hid?.vaultId) {
    const cand = shuffle(rng, spareDoors.filter((d) => d.room.role !== 'start' && g[d.p.y][d.p.x] === '#'));
    const d = cand.find((x) => { const [dx, dy] = DIRS[x.dir]; return g[x.p.y + dy]?.[x.p.x + dx] === '#'; });
    if (!d) return null;
    const [dx, dy] = DIRS[d.dir];
    g[d.p.y][d.p.x] = 'Z';
    g[d.p.y + dy][d.p.x + dx] = 'V';
    events[k(d.p.x, d.p.y)] = hid.id;
    events[k(d.p.x + dx, d.p.y + dy)] = hid.vaultId;
  }

  // 6) けしき（くさ）
  const grass = { forest: 0.25, highland: 0.35, cave: 0, tower: 0.04, snow: 0.3, volcano: 0.1 }[spec.theme];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === '.' && rng.next() < grass) g[y][x] = ',';

  // 7) ギミック
  const gimmicks: Record<string, Gimmick> = {};
  gimmickSlots.forEach((slot, i) => {
    const r = placed[slot];
    const kind = wantGimmicks[i];
    const dir = (['left', 'right', 'up', 'down'] as Dir[])[randomInt(rng, 0, 3)];
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
      if (r.t.rows[y][x] !== 'g') continue;
      const gx = r.ox + x, gy = r.oy + y;
      g[gy][gx] = '.';
      gimmicks[k(gx, gy)] = kind === 'current' ? { kind: 'current', dir } : kind === 'wind' ? { kind: 'wind', dir } : kind === 'ice' ? { kind: 'ice' } : { kind: 'poison' };
    }
  });
  for (const r of placed) if (!gimmickSlots.includes(r.slot)) for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) if (g[r.oy + y][r.ox + x] === 'g') g[r.oy + y][r.ox + x] = '.';
  if (spec.gimmicks?.includes('switchGate')) {
    // ゴールの 部屋の 入口（つかわれている とびら）を 扉に し、ゴール いがいの 部屋に スイッチ
    for (const p of Object.values(G.doors)) if (used.has(k(p.x, p.y))) gimmicks[k(p.x, p.y)] = { kind: 'gate', id: 'g1' };
    const r = shuffle(rng, placed.filter((x) => x.role !== 'goal' && x.role !== 'start'))[0] ?? S;
    const spots: Pos[] = [];
    for (let y = 1; y < r.h - 1; y++) for (let x = 1; x < r.w - 1; x++) {
      const gx = r.ox + x, gy = r.oy + y;
      if ((g[gy][gx] === '.' || g[gy][gx] === ',') && !gimmicks[k(gx, gy)]) spots.push({ x: gx, y: gy });
    }
    if (!spots.length) return null;
    const p = spots[Math.floor(rng.next() * spots.length)];
    gimmicks[k(p.x, p.y)] = { kind: 'switch', id: 'g1' };
  }

  const m: RoomTileMap = {
    id: spec.id, w: W, h: H, tiles: g, events, gimmicks, start,
    rooms: placed.map((r) => ({ x: r.ox, y: r.oy, w: r.w, h: r.h, role: r.role })),
  };
  return validateFloor(m) ? m : null;
}

// ---------------------------------------------------------------- ギミックの うごき
/** ギミックで 通れない ところ（しまった 扉） */
export function gimmickBlocks(m: RoomTileMap, x: number, y: number, opened: readonly string[]): boolean {
  const gm = m.gimmicks[k(x, y)];
  return gm?.kind === 'gate' && !opened.includes(gm.id);
}
export const canWalk = (m: RoomTileMap, x: number, y: number, opened: readonly string[]) => isPassable(m, x, y) && !gimmickBlocks(m, x, y, opened);

export type StepResult = {
  /** うごいた あとの いち（水流・氷で すべった さき） */
  pos: Pos;
  /** すべった みちすじ（アニメーション用） */
  path: Pos[];
  /** 毒の床を ふんだ 回数（ダメージは 呼び出しがわで） */
  poisonSteps: number;
  /** ふんだ スイッチ（扉が ひらく） */
  switched: string[];
};

/** 1歩 すすむ。水流は ながれの 向きに、氷は すすむ 向きに、止まる ところまで すべる */
export function step(m: RoomTileMap, from: Pos, dir: Dir, opened: readonly string[]): StepResult {
  const res: StepResult = { pos: from, path: [], poisonSteps: 0, switched: [] };
  let [dx, dy] = DIRS[dir];
  let p = from;
  const open = [...opened];
  for (let i = 0; i < 40; i++) {
    const nx = p.x + dx, ny = p.y + dy;
    if (!canWalk(m, nx, ny, open)) break;
    p = { x: nx, y: ny };
    res.path.push(p);
    const gm = m.gimmicks[k(p.x, p.y)];
    if (gm?.kind === 'poison') res.poisonSteps++;
    if (gm?.kind === 'switch' && !open.includes(gm.id)) { open.push(gm.id); res.switched.push(gm.id); }
    if (gm?.kind === 'current' || gm?.kind === 'wind') { [dx, dy] = DIRS[gm.dir]; continue; }
    if (gm?.kind === 'ice') continue;
    break;
  }
  res.pos = p;
  return res;
}

// ---------------------------------------------------------------- けんさ
/**
 * スタートから 歩いて（ギミックの 動きも ふくめて）たどりつける いち。
 * 扉は スイッチを ふむまで しまっている。
 */
export function explore(m: RoomTileMap, opened: readonly string[] = []): { walk: Set<string>; touch: Set<string>; switched: Set<string> } {
  const walk = new Set<string>([k(m.start.x, m.start.y)]);
  const touch = new Set<string>();
  const switched = new Set<string>(opened);
  let changed = true;
  // スイッチを ふむと 扉が ひらくので、ひらいたら もういちど しらべる
  while (changed) {
    changed = false;
    const q: Pos[] = [...walk].map((s) => { const [x, y] = s.split(',').map(Number); return { x, y }; });
    while (q.length) {
      const p = q.shift()!;
      for (const d of Object.keys(DIRS) as Dir[]) {
        const [dx, dy] = DIRS[d];
        touch.add(k(p.x + dx, p.y + dy));
        const r = step(m, p, d, [...switched]);
        for (const s of r.switched) if (!switched.has(s)) { switched.add(s); changed = true; }
        // すべる とちゅうの マスも「調べる」ことが できる
        for (const c of r.path) for (const [ex, ey] of Object.values(DIRS)) touch.add(k(c.x + ex, c.y + ey));
        const key = k(r.pos.x, r.pos.y);
        if (!walk.has(key)) { walk.add(key); q.push(r.pos); }
      }
    }
  }
  return { walk, touch, switched };
}

/** スタートから 階段・ボス・宝箱・イベント・泉・でぐちに とどき、ギミックの 部屋から もどれるか */
export function validateFloor(m: RoomTileMap): boolean {
  const { walk, touch } = explore(m);
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const t = m.tiles[y][x];
    if (t === 'V' && m.tiles[y]?.[x] === 'V' && isVault(m, x, y)) continue; // 隠し部屋の なか（Z の 奥）
    if ('CVZ>BHE'.includes(t) && !touch.has(k(x, y)) && !walk.has(k(x, y))) return false;
  }
  // 行ったら もどれない（水流で とじこめられる）場所が ないこと：
  // 扉を ぜんぶ ひらいた 状態で「p から 1歩で q」の 矢印を つくり、スタートへ 逆向きに たどれるか
  const allOpen = Object.values(m.gimmicks).flatMap((g) => (g.kind === 'switch' ? [g.id] : []));
  const rev = new Map<string, string[]>();
  for (const s of walk) {
    const [x, y] = s.split(',').map(Number);
    for (const d of Object.keys(DIRS) as Dir[]) {
      const to = step(m, { x, y }, d, allOpen).pos;
      const tk = k(to.x, to.y);
      if (!rev.has(tk)) rev.set(tk, []);
      rev.get(tk)!.push(s);
    }
  }
  const back = new Set<string>([k(m.start.x, m.start.y)]);
  const q = [k(m.start.x, m.start.y)];
  while (q.length) for (const pr of rev.get(q.shift()!) ?? []) if (!back.has(pr)) { back.add(pr); q.push(pr); }
  for (const s of walk) if (!back.has(s)) return false;
  return true;
}
const isVault = (m: RoomTileMap, x: number, y: number) => Object.values(DIRS).some(([dx, dy]) => m.tiles[y + dy]?.[x + dx] === 'Z');

const cache = new Map<string, RoomTileMap>();
/** シードから 部屋テンプレート型の フロアを つくる */
export function generateRoomFloor(spec: RoomFloorSpec, seed: number): RoomTileMap {
  const key = `${spec.id}:${seed}:${(spec.gimmicks ?? []).join('+')}:${(spec.events ?? []).map((e) => e.id).join('+')}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rng = createRng((seed ^ hashStr(spec.id)) >>> 0);
  for (let i = 0; i < 300; i++) {
    const m = tryGenerate(spec, rng);
    if (m) {
      if (cache.size > 40) cache.clear();
      cache.set(key, m);
      return m;
    }
  }
  throw new Error(`room floor generation failed: ${spec.id}`);
}

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
