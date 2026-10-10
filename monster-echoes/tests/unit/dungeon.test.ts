import { describe, expect, it } from 'vitest';
import { AREAS, ENCOUNTERS } from '../../src/data/areas';
import { MAPS } from '../../src/data/maps';
import { SPECIES } from '../../src/data/monsters';
import { findAll, findTile, loadMap, reachable } from '../../src/domain/dungeon/DungeonEngine';

describe('マップデータ', () => {
  for (const id of Object.keys(MAPS)) {
    it(`${id}: 長方形で、スタートから全部の宝箱・出口・ボスに届く`, () => {
      const raw = MAPS[id].rows;
      expect(new Set(raw.map((r) => r.length)).size, raw.map((r, i) => `${i}:${r.length}`).join(' ')).toBe(1);
      const m = loadMap(id);
      const start = findTile(m, id === 'town' ? 'P' : 'S')!;
      expect(start).toBeTruthy();
      const { walk, touch } = reachable(m, start);
      const need = id === 'town' ? ['G', 'F', '1', '2', '3', '4', '5', '6', '7'] : ['C', '>', 'B', 'E', 'H'];
      for (const ch of need) for (const p of findAll(m, ch)) {
        const k = `${p.x},${p.y}`;
        expect(walk.has(k) || touch.has(k), `${id} ${ch} at ${k}`).toBe(true);
      }
    });
  }
  it('最終フロアだけにボスがいて、それ以外には次への階段がある', () => {
    for (const a of AREAS) a.floors.forEach((f, i) => {
      const m = loadMap(f.mapTemplateId);
      const last = i === a.floors.length - 1;
      expect(!!findTile(m, 'B'), f.id).toBe(last);
      expect(!!findTile(m, '>'), f.id).toBe(!last);
      expect(!!f.bossId).toBe(last);
      expect(!!findTile(m, 'E')).toBe(i === 0);
    });
  });
  it('出現テーブルの種族が存在する', () => {
    for (const t of Object.values(ENCOUNTERS)) for (const e of t.entries) expect(SPECIES[e.speciesId]).toBeTruthy();
  });
});
