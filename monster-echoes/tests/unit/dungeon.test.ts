import { describe, expect, it } from 'vitest';
import { AREAS, ENCOUNTERS } from '../../src/data/areas';
import { MAPS } from '../../src/data/maps';
import { SPECIES } from '../../src/data/monsters';
import { findAll, findTile, isPassable, loadMap, reachable } from '../../src/domain/dungeon/DungeonEngine';
import { TOWN_MAPS } from '../../src/data/town';
import { floorMap } from '../../src/application/Game';

describe('マップデータ', () => {
  it('自動生成フロア: どの シードでも スタートから 全部の 宝箱・出口・ボスに 届き、形が シードで かわる', () => {
    for (const a of AREAS) a.floors.forEach((f, i) => {
      const shapes = new Set<string>();
      for (let seed = 1; seed <= 60; seed++) {
        const m = floorMap(a.id, i, seed * 7919);
        const start = findTile(m, 'S')!;
        expect(start, f.id).toBeTruthy();
        const { walk, touch } = reachable(m, start);
        for (const ch of ['C', '>', 'B', 'E', 'H']) for (const p of findAll(m, ch)) {
          const k = `${p.x},${p.y}`;
          expect(walk.has(k) || touch.has(k), `${f.id} seed${seed} ${ch} at ${k}`).toBe(true);
        }
        expect(findAll(m, 'C').length, f.id).toBeGreaterThanOrEqual(1);
        // 同じ シードなら 同じ 形
        expect(floorMap(a.id, i, seed * 7919).tiles.map((r) => r.join('')).join('/')).toBe(m.tiles.map((r) => r.join('')).join('/'));
        shapes.add(m.tiles.map((r) => r.join('')).join('/'));
      }
      expect(shapes.size, f.id).toBeGreaterThan(55);
    });
  });
  for (const def of Object.values(TOWN_MAPS)) {
    it(`まち ${def.id}: 出入り口・人・旅の扉に たどりつけ、つながる先が 正しい`, () => {
      const m = loadMap(def.id);
      expect(new Set(MAPS[def.id].rows.map((r) => r.length)).size).toBe(1);
      // この部屋に 入ってくる 位置（町は P）
      const entries = Object.values(TOWN_MAPS).flatMap((d) => d.links.filter((l) => l.to === def.id).map((l) => ({ x: l.tx, y: l.ty })));
      const start = def.id === 'town' ? findTile(m, 'P')! : entries[0];
      expect(start, def.id).toBeTruthy();
      for (const e of entries) expect(isPassable(m, e.x, e.y), `${def.id} entry ${e.x},${e.y}`).toBe(true);
      const { walk, touch } = reachable(m, start);
      for (const l of def.links) {
        expect(TOWN_MAPS[l.to], l.to).toBeTruthy();
        expect(touch.has(`${l.x},${l.y}`) || walk.has(`${l.x},${l.y}`), `${def.id} link ${l.x},${l.y}`).toBe(true);
      }
      for (const ch of [...Object.keys(def.npcs), ...(def.gate ? ['G'] : []), 'F']) for (const p of findAll(m, ch)) expect(touch.has(`${p.x},${p.y}`), `${def.id} ${ch}`).toBe(true);
      for (const ch of Object.keys(def.npcs)) expect(findAll(m, ch).length, `${def.id} npc ${ch}`).toBe(1);
      if (def.gate) expect(AREAS.some((a) => a.id === def.gate)).toBe(true);
    });
  }
  it('最終フロアだけにボスがいて、それ以外には次への階段がある', () => {
    for (const a of AREAS) a.floors.forEach((f, i) => {
      const m = floorMap(a.id, i, 12345);
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
