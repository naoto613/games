import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { SCHEMA_VERSION } from '../../src/application/GameState';
import { Game, newGameState } from '../../src/application/Game';
import { SPECIES_LIST } from '../../src/data/monsters';
import { LEGACY_SPECIES_MAP } from '../../src/data/v2/monsters';
import { createMonster } from '../../src/domain/monster/MonsterFactory';
import { inheritLegacy, toV2Species, unknownLegacySpecies } from '../../src/infrastructure/save/LegacyInherit';
import { migrate } from '../../src/infrastructure/save/SaveMigration';
import { MemorySaveRepository } from '../../src/infrastructure/save/SaveRepository';

/** いまの セーブを 古い 形に もどす（v1〜v4 の セーブを つくる） */
function oldSave(version: number) {
  const s = JSON.parse(JSON.stringify(newGameState('ミナ', createRng(1), 0)));
  s.schemaVersion = version;
  delete s.chapters; delete s.story; delete s.v2;
  for (const m of s.monsters) { delete m.history; delete m.labels; delete m.breedingCount; }
  if (version <= 3) for (const m of s.monsters) { m.stats.wisdom = m.stats.magic; delete m.stats.magic; delete m.stats.spirit; }
  if (version <= 1) { s.monsters[0].speciesId = 'lumipon'; s.discoveredSpeciesIds = ['lumipon', 'magmadog']; s.ownedSpeciesIds = ['lumipon', 'magmadog']; }
  return s;
}

describe('SCHEMA v5：古い セーブを 読みこめる', () => {
  it('現在の SCHEMA は 5', () => expect(SCHEMA_VERSION).toBe(5));
  for (const v of [1, 2, 3, 4]) {
    it(`v${v} → v5`, () => {
      const r = migrate(oldSave(v));
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      const s = r.value;
      expect(s.schemaVersion).toBe(5);
      expect(s.chapters.chapter).toBe(1);
      expect(s.story.seen).toEqual([]);
      expect(s.v2.legacy).toMatchObject({ fromSchema: v, inherited: false });
      expect(s.v2.equipment).toEqual({ owned: {}, equipped: {} });
      for (const m of s.monsters) {
        expect(m.history).toEqual([]);
        expect(m.breedingCount).toBe(0);
        expect(m.stats.magic).toBeGreaterThan(0);
        expect(m.stats.spirit).toBeGreaterThan(0);
      }
      if (v === 1) expect(s.monsters[0].speciesId).toBe('lunaslime');
      // v1 の 進行は いまの 遊べる 内容の ために のこる
      expect(s.progress.unlockedAreas).toContain('forest');
    });
  }
  it('すでに v5 なら そのまま。新しすぎる セーブは future', () => {
    const s = newGameState('ミナ', createRng(1), 0);
    const r = migrate(JSON.parse(JSON.stringify(s)));
    expect(r.ok && r.value).toEqual(s);
    expect(migrate({ ...s, schemaVersion: 99 })).toEqual({ ok: false, error: 'future' });
  });
  it('移行するときは 元の データを バックアップに のこす', async () => {
    const repo = new MemorySaveRepository();
    repo.data = oldSave(3);
    const r = await repo.load();
    expect(r.kind).toBe('ok');
    expect(repo.backups).toHaveLength(1);
    expect((repo.backups[0] as { schemaVersion: number }).schemaVersion).toBe(3);
    // 移行後に 保存して 読みなおしても バックアップは ふえない
    if (r.kind !== 'ok') return;
    const g = new Game(r.data, { rng: createRng(1), sink: repo });
    await g.save();
    await repo.load();
    expect(repo.backups).toHaveLength(1);
  });
});

describe('引き継ぎ（Q9）', () => {
  it('v1 の 40種は すべて v2 に 対応する', () => {
    for (const sp of SPECIES_LIST) expect(LEGACY_SPECIES_MAP[sp.id], sp.id).toMatch(/^m\d{3}$/);
  });
  it('モンスター・道具・お金・図鑑を のこし、種族を v2 に、物語は 第1章から', () => {
    const r = migrate(oldSave(4));
    if (!r.ok) throw new Error('migrate');
    let s = r.value;
    // 育てた 個体と 配合の 記録を つくる
    const bred = { ...createMonster('darkdragon', createRng(5), { level: 18 }), plusValue: 3, nickname: 'クロ', parentSpeciesIds: ['darkeye', 'firedragon'] as [string, string] };
    s = {
      ...s, monsters: [...s.monsters, bred], player: { ...s.player, gold: 999 }, inventory: { ...s.inventory, shard: 4 },
      discoveredSpeciesIds: [...s.discoveredSpeciesIds, 'darkdragon', 'darkeye'], ownedSpeciesIds: [...s.ownedSpeciesIds, 'darkdragon'],
      breedingHistory: [{ childId: bred.id, childSpeciesId: 'darkdragon', parents: [{ id: 'x', speciesId: 'darkeye', level: 12, plusValue: 0 }, { id: 'y', speciesId: 'firedragon', level: 12, plusValue: 0 }], at: 1 }],
      progress: { ...s.progress, unlockedAreas: ['forest', 'cave'], defeatedBossIds: ['boss_forest'] },
    };
    expect(unknownLegacySpecies(s)).toEqual([]);
    const out = inheritLegacy(s, 100);
    expect(out.monsters.map((m) => m.speciesId)).toEqual(['m001', 'm021', 'm165']);
    const kuro = out.monsters[2];
    expect(kuro).toMatchObject({ nickname: 'クロ', level: 18, plusValue: 3, parentSpeciesIds: ['m181', 'm161'] });
    expect(kuro.skills).toEqual(bred.skills);
    expect(kuro.history!.at(-1)!.kind).toBe('inherit');
    expect(out.player.gold).toBe(999);
    expect(out.inventory.shard).toBe(4);
    expect(out.partyIds).toEqual(s.partyIds);
    expect(out.discoveredSpeciesIds).toEqual(['m001', 'm021', 'm165', 'm181']);
    expect(out.breedingHistory[0].parents.map((p) => p.speciesId)).toEqual(['m181', 'm161']);
    expect(out.chapters.chapter).toBe(1);
    expect(out.progress.defeatedBossIds).toEqual([]);
    expect(out.v2.legacy).toEqual({ fromSchema: 4, at: 100, inherited: true });
    // 元の データは かわらない・2回 よんでも おなじ
    expect(s.monsters[0].speciesId).toBe('lunaslime');
    expect(inheritLegacy(out, 200)).toBe(out);
    expect(toV2Species('m010')).toBe('m010');
  });
  it('引き継いだ セーブで ゲームが うごく（パーティで 戦える）', () => {
    const r = migrate(oldSave(2));
    if (!r.ok) throw new Error('migrate');
    const g = new Game(inheritLegacy(r.value), { rng: createRng(3), sink: null });
    expect(g.party.map((m) => m.speciesId)).toEqual(['m001', 'm021']);
    expect(migrate(JSON.parse(JSON.stringify(g.state))).ok).toBe(true);
  });
});
