import { describe, it, expect } from 'vitest';
import { CollisionSystem, MASK_PLAYER, MASK_NPC } from '../../src/game/world/CollisionSystem';
import { NavGrid } from '../../src/game/world/NavGrid';
import { lakeSdf } from '../../src/game/world/Terrain';
import { CAMPSITE } from '../../src/game/content/areas/campsite';

describe('当たり判定', () => {
  it('円の障害物から押し出される', () => {
    const c = new CollisionSystem(40);
    c.addCircle('rock', 0, 0, 1);
    const p = c.resolve({ x: 0.5, z: 0 }, 0.2, MASK_PLAYER);
    expect(Math.hypot(p.x, p.z)).toBeGreaterThanOrEqual(1.19);
  });
  it('回転した箱から押し出される', () => {
    const c = new CollisionSystem(40);
    c.addBox('wall', 5, 5, 4, 0.4, Math.PI / 4);
    const p = c.resolve({ x: 5, z: 5 }, 0.2, MASK_PLAYER);
    expect(c.blocked(p.x, p.z, 0.19, MASK_PLAYER)).toBe(false);
  });
  it('NPC 用の当たりは主人公を止めない（テーブルの下にもぐれる）', () => {
    const c = new CollisionSystem(40);
    c.addBox('table', 0, 0, 2, 1.6, 0, MASK_NPC);
    expect(c.blocked(0, 0, 0.2, MASK_PLAYER)).toBe(false);
    expect(c.blocked(0, 0, 0.2, MASK_NPC)).toBe(true);
  });
  it('湖には入れないが、ボートなら水の上だけ動ける', () => {
    const c = new CollisionSystem(40);
    const [lx, lz] = CAMPSITE.lake.c;
    const p = c.resolve({ x: lx + 3, z: lz }, 0.2, MASK_PLAYER);
    expect(lakeSdf(p.x, p.z)).toBeGreaterThanOrEqual(0.19);
    const b = c.resolve({ x: lx + 3, z: lz }, 0.5, MASK_PLAYER, true);
    expect(lakeSdf(b.x, b.z)).toBeLessThan(0);
  });
  it('遮蔽物の高さで視線が決まる', () => {
    const c = new CollisionSystem(40);
    c.addCircle('bush', 0, 0, 0.7, MASK_NPC, 1.0);
    // 大人の目線(1.4m)から、茂みの向こうの小さな動物(0.4m)は見えない
    expect(c.lineOfSight(-1.2, 0, 1.4, 1.2, 0, 0.4)).toBe(false);
    // 茂みの横にいれば見える
    expect(c.lineOfSight(-8, 0, 1.4, 0.0, 2, 0.4)).toBe(true);
    // 主人公より低い遮蔽物（高さ 0.3）は視線をさえぎらない
    c.addCircle('stone', 5, 0, 0.5, MASK_NPC, 0.3);
    expect(c.lineOfSight(3, 0, 1.4, 6, 0, 0.4)).toBe(true);
  });
});

describe('経路探索', () => {
  it('障害物を回り込む経路が見つかる', () => {
    const c = new CollisionSystem(40);
    c.addBox('wall', 0, 0, 0.4, 10, 0);
    const nav = new NavGrid(c, MASK_NPC, 0.3);
    const path = nav.find(-3, 0, 3, 0);
    expect(path).not.toBeNull();
    for (const p of path!) expect(c.blocked(p.x, p.z, 0.25, MASK_NPC)).toBe(false);
    expect(path![path!.length - 1]).toEqual({ x: 3, z: 0 });
  });
});
