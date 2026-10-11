import { describe, expect, it } from 'vitest';
import { explore, generateRoomFloor, gimmickBlocks, step, validateFloor, type RoomFloorSpec, type RoomTileMap } from '../../src/domain/dungeon/RoomGen';
import { findAll, findTile } from '../../src/domain/dungeon/DungeonEngine';

const SPECS: RoomFloorSpec[] = [
  { id: 'f1', theme: 'forest', first: true, last: false, spring: false },
  { id: 'f2', theme: 'forest', first: false, last: false, spring: true, events: [{ id: 'ev_pollen', kind: 'scene' }, { id: 'ev_stone', kind: 'scene' }] },
  { id: 'f3', theme: 'cave', first: false, last: false, spring: true, gimmicks: ['poison'], events: [{ id: 'ev_trace', kind: 'trace' }] },
  { id: 'f4', theme: 'cave', first: false, last: false, spring: false, gimmicks: ['current', 'ice'], events: [{ id: 'ev_h', kind: 'hidden', vaultId: 'ev_vault' }] },
  { id: 'f5', theme: 'tower', first: false, last: true, spring: false, gimmicks: ['switchGate'], events: [{ id: 'ev_last', kind: 'scene' }] },
];

describe('RoomGen：部屋テンプレート型の フロア', () => {
  it('どの シードでも つくれて、スタートから 階段・宝箱・イベント・泉に とどき、もどれる', () => {
    for (const spec of SPECS) for (let seed = 1; seed <= 120; seed++) {
      const m = generateRoomFloor(spec, seed);
      expect(validateFloor(m), `${spec.id}:${seed}`).toBe(true);
      expect(findTile(m, 'S')).toBeTruthy();
      expect(findTile(m, spec.last ? 'B' : '>'), `${spec.id}:${seed}`).toBeTruthy();
      if (spec.first) expect(findTile(m, 'E')).toBeTruthy();
      if (spec.spring) expect(findAll(m, 'H')).toHaveLength(1);
    }
  });
  it('固定イベントは かならず 置かれる（隠し部屋は 隠し扉の 奥）', () => {
    for (const spec of SPECS) for (let seed = 1; seed <= 120; seed++) {
      const m = generateRoomFloor(spec, seed);
      const placed = Object.values(m.events ?? {});
      for (const e of spec.events ?? []) {
        expect(placed, `${spec.id}:${seed} ${e.id}`).toContain(e.id);
        if (e.vaultId) expect(placed).toContain(e.vaultId);
      }
      if (spec.events?.some((e) => e.kind === 'hidden')) expect(findAll(m, 'Z')).toHaveLength(1);
    }
  });
  it('同じ シードなら 同じ 形、シードが ちがえば 形が かわる', () => {
    const a = generateRoomFloor(SPECS[1], 7), b = generateRoomFloor({ ...SPECS[1] }, 7);
    expect(a.tiles.map((r) => r.join(''))).toEqual(b.tiles.map((r) => r.join('')));
    const shapes = new Set(Array.from({ length: 12 }, (_, i) => generateRoomFloor(SPECS[1], 100 + i).tiles.map((r) => r.join('')).join('\n')));
    expect(shapes.size).toBeGreaterThan(8);
  });
  it('ギミックの 部屋が できる（毒・水流・氷・スイッチと 扉）', () => {
    const kinds = (m: RoomTileMap) => new Set(Object.values(m.gimmicks).map((g) => g.kind));
    expect(kinds(generateRoomFloor(SPECS[2], 3))).toEqual(new Set(['poison']));
    expect(kinds(generateRoomFloor(SPECS[3], 3))).toEqual(new Set(['current', 'ice']));
    const gate = generateRoomFloor(SPECS[4], 3);
    expect(kinds(gate)).toEqual(new Set(['gate', 'switch']));
    // 扉は スイッチを ふむまで しまっていて、ボスには スイッチを ふまないと とどかない
    const boss = findTile(gate, 'B')!;
    const closed = (() => {
      const m2: RoomTileMap = { ...gate, gimmicks: Object.fromEntries(Object.entries(gate.gimmicks).filter(([, g]) => g.kind !== 'switch')) };
      return explore(m2);
    })();
    expect(closed.touch.has(`${boss.x},${boss.y}`)).toBe(false);
    expect(explore(gate).touch.has(`${boss.x},${boss.y}`)).toBe(true);
    expect(explore(gate).switched.has('g1')).toBe(true);
  });
});

describe('ギミックの うごき', () => {
  // 手作りの 小さな マップ
  const map = (rows: string[], gimmicks: RoomTileMap['gimmicks']): RoomTileMap => ({
    id: 't', w: rows[0].length, h: rows.length, tiles: rows.map((r) => r.split('')), events: {}, gimmicks, rooms: [], start: { x: 1, y: 1 },
  });
  it('毒の床は ふんだ 回数を かぞえる', () => {
    const m = map(['#####', '#...#', '#####'], { '2,1': { kind: 'poison' } });
    const r = step(m, { x: 1, y: 1 }, 'right', []);
    expect(r.pos).toEqual({ x: 2, y: 1 });
    expect(r.poisonSteps).toBe(1);
  });
  it('水流は ながれの 向きに おしながす', () => {
    const m = map(['######', '#....#', '#....#', '######'], { '2,1': { kind: 'current', dir: 'down' }, '2,2': { kind: 'current', dir: 'right' } });
    const r = step(m, { x: 1, y: 1 }, 'right', []);
    // (2,1) で 下へ、(2,2) で 右へ ながされ、ながれの ない (3,2) で とまる
    expect(r.pos).toEqual({ x: 3, y: 2 });
    expect(r.path.length).toBe(3);
  });
  it('氷の上は かべか 氷の おわりまで すべる', () => {
    const m = map(['#######', '#.....#', '#######'], { '2,1': { kind: 'ice' }, '3,1': { kind: 'ice' } });
    expect(step(m, { x: 1, y: 1 }, 'right', []).pos).toEqual({ x: 4, y: 1 });
    const wall = map(['#####', '#...#', '#####'], { '2,1': { kind: 'ice' }, '3,1': { kind: 'ice' } });
    expect(step(wall, { x: 1, y: 1 }, 'right', []).pos).toEqual({ x: 3, y: 1 });
  });
  it('スイッチで 扉が ひらく。しまった 扉は とおれない', () => {
    const m = map(['######', '#....#', '######'], { '2,1': { kind: 'switch', id: 'a' }, '3,1': { kind: 'gate', id: 'a' } });
    expect(gimmickBlocks(m, 3, 1, [])).toBe(true);
    const r = step(m, { x: 1, y: 1 }, 'right', []);
    expect(r.switched).toEqual(['a']);
    expect(step(m, r.pos, 'right', []).pos).toEqual(r.pos); // まだ ひらいて いない 状態で よぶと とまる
    expect(step(m, r.pos, 'right', ['a']).pos).toEqual({ x: 3, y: 1 });
  });
});
