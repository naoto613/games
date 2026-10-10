import { describe, it, expect } from 'vitest';
import { SaveSystem, MemoryStorage } from '../../src/game/systems/SaveSystem';
import { newSaveData, migrate, SAVE_VERSION } from '../../src/game/core/GameState';

describe('セーブ・ロード', () => {
  it('保存した内容がそのまま読み込める', async () => {
    const s = new SaveSystem(new MemoryStorage());
    const d = newSaveData();
    d.player.currency = 123;
    d.player.inventory.push({ itemId: 'apple', count: 3 });
    d.world.eventFlags.door_open = true;
    d.progress.completedQuestIds.push('lunch_heist');
    await s.save(d);
    const l = await s.load();
    expect(l?.player.currency).toBe(123);
    expect(l?.player.inventory).toEqual([{ itemId: 'apple', count: 3 }]);
    expect(l?.world.eventFlags.door_open).toBe(true);
    expect(l?.progress.completedQuestIds).toEqual(['lunch_heist']);
    expect(l?.version).toBe(SAVE_VERSION);
  });
  it('古い形式（v1）のセーブを移行できる', () => {
    const v1 = { version: 1, savedAt: '', player: { areaId: 'campsite', position: { x: 1, y: 0, z: 2 }, currency: 9, inventory: [], outfitId: 'none' }, world: { unlockedAreaIds: ['campsite'], objectStates: {}, npcStates: {}, eventFlags: {} }, progress: { completedQuestIds: ['a'], activeQuestIds: [], discoveredItemIds: [], achievements: [] } };
    const m = migrate(v1);
    expect(m.version).toBe(SAVE_VERSION);
    expect(m.player.hunger).toBe(70);
    expect(m.player.currency).toBe(9);
    expect(m.world.clock).toBeGreaterThan(0);
    expect(m.progress.questSteps).toEqual({});
    expect(m.progress.completedQuestIds).toEqual(['a']);
  });
  it('壊れたデータは新しいゲームになる', () => {
    expect(migrate(null).player.currency).toBe(0);
    expect(migrate({ foo: 1 }).version).toBe(SAVE_VERSION);
  });
});
