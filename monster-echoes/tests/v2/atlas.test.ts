/// <reference types="node" />
// アトラス（assets/monsters/atlas.json）と うごき（motion）の 検証
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { MONSTERS2 } from '../../src/data/v2/monsters';
import { motionPose, MOTION_LENGTH } from '../../src/ui/gfx/motion';

const dir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../assets/monsters');
const atlas = JSON.parse(fs.readFileSync(path.join(dir, 'atlas.json'), 'utf8')) as { width: number; height: number; cells: Record<string, { x: number; y: number; size: number; foot: number; bbox: number[] }> };
const png = fs.readFileSync(path.join(dir, 'atlas.png'));

describe('アトラス', () => {
  it('200体すべての いちが あり、画像の なかに おさまり、かさならない', () => {
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([atlas.width, atlas.height]);
    const rects = MONSTERS2.map((m) => { const c = atlas.cells[m.id]; expect(c, m.id).toBeTruthy(); return c; });
    for (const c of rects) {
      expect(c.x + c.size).toBeLessThanOrEqual(atlas.width);
      expect(c.y + c.size).toBeLessThanOrEqual(atlas.height);
      const [x0, y0, x1, y1] = c.bbox;
      expect(x0 >= 0 && y0 >= 0 && x1 <= c.size && y1 <= c.size && x1 > x0 && y1 > y0).toBe(true);
      expect(y1).toBeLessThanOrEqual(c.foot + 1);
    }
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], b = rects[j];
      const overlap = a.x < b.x + b.size && b.x < a.x + a.size && a.y < b.y + b.size && b.y < a.y + a.size;
      expect(overlap).toBe(false);
    }
  });
});

describe('うごき（待機・攻撃・被弾・戦闘不能）', () => {
  it('攻撃と被弾は おわると もとの すがたに もどり、戦闘不能は きえる', () => {
    for (const k of ['attack', 'hit'] as const) {
      const p = motionPose(k, MOTION_LENGTH[k]);
      expect(Math.abs(p.dx) + Math.abs(p.dy)).toBeLessThan(0.5);
      expect(p.sx).toBeCloseTo(1, 1); expect(p.sy).toBeCloseTo(1, 1);
    }
    expect(motionPose('faint', MOTION_LENGTH.faint).alpha).toBeLessThanOrEqual(0);
    expect(motionPose('hit', 0).flash).toBe(1);
    expect(motionPose('attack', 9).dy).toBeGreaterThan(5); // まえに ふみこむ
  });
});
