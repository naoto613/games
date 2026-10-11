// 固有イベント: 配置・発生条件・一度きりの報酬・保存と復元・旧セーブの移行
import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { Game, floorMap, newGameState } from '../../src/application/Game';
import { BOSSES, AREAS } from '../../src/data/areas';
import { EVENT_BY_ID, EVENTS } from '../../src/data/events';
import { findAll, reachable, findTile } from '../../src/domain/dungeon/DungeonEngine';
import { eventAvailable, overlayEvents } from '../../src/domain/events/EventEngine';
import { MemorySaveRepository } from '../../src/infrastructure/save/SaveRepository';
import { migrate } from '../../src/infrastructure/save/SaveMigration';
import { SCHEMA_VERSION } from '../../src/application/GameState';

const newGame = (seed = 1) => {
  const g = new Game(newGameState('テスト', createRng(seed), 0), { rng: createRng(seed + 10), sink: new MemorySaveRepository() });
  g.state.progress.unlockedAreas.push('forest');
  g.startExpedition('forest');
  return g;
};
const st = (g: Game) => ({ flags: g.state.progress.storyFlags, owned: g.state.ownedSpeciesIds, done: g.state.expedition?.eventsDone ?? [] });

describe('固有イベント（はじまりのもり）', () => {
  it('どの シードでも 指定の フロアに 置かれ、スタートから たどりつける', () => {
    const want: Record<number, string[]> = { 0: ['forest_blight', 'forest_trail1'], 1: ['forest_trail2', 'forest_hidden', 'forest_vault'], 2: ['forest_nest'] };
    for (let seed = 1; seed <= 60; seed++) for (const [fl, ids] of Object.entries(want)) {
      const m = floorMap('forest', +fl, seed * 104729);
      const placed = Object.values(m.events ?? {});
      for (const id of ids) expect(placed, `seed${seed} floor${fl} ${id}`).toContain(id);
      const { walk, touch } = reachable(m, findTile(m, 'S')!);
      for (const [pos, id] of Object.entries(m.events ?? {})) {
        if (id === 'forest_vault') continue; // かくし へやの なか（とびらが ひらいてから）
        expect(walk.has(pos) || touch.has(pos), `${id} ${pos}`).toBe(true);
      }
      // かくし とびら Z は 通路に つながり、その おくに ほうもつこ（V）が ある
      if (+fl === 1) {
        const z = findAll(m, 'Z')[0];
        expect(m.tiles[z.y - 1][z.x]).toBe('V');
        expect(m.tiles[z.y + 1][z.x]).not.toBe('#');
      }
    }
  });

  it('ボスの へやや ほかの エリアには 置かれない', () => {
    for (const a of AREAS) a.floors.forEach((f, i) => {
      if (a.id === 'forest' && !f.bossId) return;
      expect(Object.keys(floorMap(a.id, i, 77).events ?? {}), `${a.id}${i}`).toHaveLength(0);
    });
  });

  it('発生条件: あしあと2は あしあと1の あと、すみかは あしあと2の あと、もって いれば でない', () => {
    const g = newGame();
    expect(eventAvailable(EVENT_BY_ID.forest_trail1, st(g))).toBe(true);
    expect(eventAvailable(EVENT_BY_ID.forest_trail2, st(g))).toBe(false);
    expect(eventAvailable(EVENT_BY_ID.forest_nest, st(g))).toBe(false);
    expect(g.triggerEvent('forest_trail2')).toBeNull();
    expect(g.triggerEvent('forest_nest')).toBeNull();
    g.triggerEvent('forest_trail1');
    expect(g.state.progress.storyFlags.foot1).toBe(true);
    expect(eventAvailable(EVENT_BY_ID.forest_trail2, st(g))).toBe(true);
    g.triggerEvent('forest_trail2');
    expect(eventAvailable(EVENT_BY_ID.forest_nest, st(g))).toBe(true);
    // もう もっている なら でない
    g.state.ownedSpeciesIds.push('echoslime');
    expect(eventAvailable(EVENT_BY_ID.forest_nest, st(g))).toBe(false);
  });

  it('一度きりの ほうしゅうは 二重に もらえない', () => {
    const g = newGame();
    const before = g.state.inventory.herb ?? 0;
    const r = g.triggerEvent('forest_blight')!;
    expect(r.rewards).toEqual([{ type: 'item', itemId: 'herb', count: 2 }]);
    expect(g.state.inventory.herb).toBe(before + 2);
    expect(g.triggerEvent('forest_blight')).toBeNull();
    expect(g.state.inventory.herb).toBe(before + 2);
    expect(g.state.progress.storyFlags.forestBlight).toBe(true);
  });

  it('すみか: せんとうに なり、にげても その たびでは もう でない（つぎの たびで また あえる）', () => {
    const g = newGame();
    g.triggerEvent('forest_trail1'); g.triggerEvent('forest_trail2');
    const r = g.triggerEvent('forest_nest')!;
    expect(r.battle).toEqual([{ speciesId: 'echoslime', level: 6, }]);
    expect(g.state.progress.storyFlags.echoMet).toBe(true);
    expect(eventAvailable(EVENT_BY_ID.forest_nest, st(g))).toBe(false); // この たびは おわり
    g.leaveExpedition();
    g.startExpedition('forest');
    expect(eventAvailable(EVENT_BY_ID.forest_nest, st(g))).toBe(true); // つぎの たびで また でる
    const b = g.startWildBattle(r.battle!);
    expect(b.state.enemies[0].speciesId).toBe('echoslime');
    expect(g.state.discoveredSpeciesIds).toContain('echoslime');
  });

  it('かくし とびら: ひらくと とおれて、ほうもつこを とると もう 出ない', () => {
    const g = newGame();
    const door = EVENT_BY_ID.forest_hidden;
    // マップに かさねると、とびらは かべ → ひらくと ゆか
    const raw = floorMap('forest', 1, 5);
    const closed = overlayEvents(raw, st(g));
    const z = findAll(closed, 'Z')[0];
    expect(closed.tiles[z.y][z.x]).toBe('Z');
    expect(g.triggerEvent(door.id)).not.toBeNull();
    const opened = overlayEvents(raw, st(g));
    expect(opened.tiles[z.y][z.x]).toBe('.');
    const medals = g.state.inventory.medal ?? 0;
    expect(g.triggerEvent('forest_vault')).not.toBeNull();
    expect(g.state.inventory.medal).toBe(medals + 2);
    expect(g.state.progress.storyFlags.forestVault).toBe(true);
    // とった あとも、いま ひらいた とびらは ふさがらない（なかに いても だいじょうぶ）。でも あたらしい たびでは かべの まま
    expect(overlayEvents(raw, st(g)).tiles[z.y][z.x]).toBe('.');
    g.leaveExpedition(); g.startExpedition('forest');
    const again = overlayEvents(raw, st(g));
    expect(again.tiles[z.y][z.x]).toBe('#');
    expect(g.triggerEvent('forest_vault')).toBeNull();
  });

  it('保存して 再開しても 進行が のこる', async () => {
    const repo = new MemorySaveRepository();
    const g = new Game(newGameState('テスト', createRng(2), 0), { rng: createRng(3), sink: repo });
    g.state.progress.unlockedAreas.push('forest');
    g.startExpedition('forest');
    g.triggerEvent('forest_trail1'); g.triggerEvent('forest_hidden');
    await g.save();
    const loaded = await repo.load();
    if (loaded.kind !== 'ok') throw new Error('load');
    const g2 = new Game(loaded.data, { rng: createRng(4), sink: repo });
    expect(g2.state.progress.storyFlags.foot1).toBe(true);
    expect(g2.state.expedition!.eventsDone).toEqual(['forest_hidden']);
    expect(g2.triggerEvent('forest_trail1')).toBeNull();
  });

  it('旧セーブ（探索中・v2）を 読み込める', () => {
    const g = newGame();
    const old = JSON.parse(JSON.stringify(g.state));
    old.schemaVersion = 2;
    delete old.expedition.eventsDone;
    const r = migrate(old);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.schemaVersion).toBe(SCHEMA_VERSION);
      expect(r.value.expedition!.eventsDone).toEqual([]);
    }
    const old2 = JSON.parse(JSON.stringify(g.state));
    old2.schemaVersion = 2; old2.expedition = null; delete old2.expedition;
    expect(migrate(old2).ok).toBe(true);
  });

  it('イベントの 定義が 正しい（フロアが ある・ほうしゅうが ある）', () => {
    for (const e of EVENTS) {
      const area = AREAS.find((a) => a.id === e.areaId)!;
      expect(area.floors[e.floorIndex], e.id).toBeTruthy();
      if (e.kind === 'hidden') expect(EVENT_BY_ID[e.vaultId!], e.id).toBeTruthy();
    }
  });
});

describe('ボスの あとの ものがたり', () => {
  it('どの ボスも あらたな じじつを あかし、フラグが たつ', () => {
    for (const b of Object.values(BOSSES)) {
      expect(b.story?.length, b.id).toBeGreaterThanOrEqual(2);
      expect(b.setFlags.some((f) => f.startsWith('truth_')), b.id).toBe(true);
    }
  });
});
