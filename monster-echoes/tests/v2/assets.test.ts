// モンスター200体の ドット絵アセット（assets/monsters/）の 検証
/// <reference types="node" />
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { MONSTERS2 } from '../../src/data/v2/monsters';

const dir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../assets/monsters');
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')) as { monsters: { id: string; file: string; canvas: number; foot: number; large: boolean; status: string }[] };
/** PNG の 幅・高さ（IHDR） */
const pngSize = (f: string) => { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

describe('モンスターの ドット絵', () => {
  it('200体ぶん あり、データの spriteId と ファイル名が 一致する', () => {
    expect(manifest.monsters).toHaveLength(200);
    MONSTERS2.forEach((m, i) => {
      const a = manifest.monsters[i];
      expect(a.id).toBe(m.id);
      expect(a.file).toBe(`${m.spriteId}.png`);
    });
  });
  it('すべて 完成（placeholder なし）で、64×64（大型は 96×96）の 透過PNG', () => {
    for (const a of manifest.monsters) {
      expect(a.status, a.id).toBe('ok');
      const f = path.join(dir, a.file);
      expect(fs.existsSync(f), a.file).toBe(true);
      expect(pngSize(f), a.file).toEqual([a.canvas, a.canvas]);
      expect(a.canvas).toBe(a.large ? 96 : 64);
      expect(a.foot).toBeLessThan(a.canvas);
    }
  });
});
