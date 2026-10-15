import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { SCHEMA_VERSION } from '../../src/application/GameState';
import { Game, newGameState } from '../../src/application/Game';
import { SPECIES_V1_LIST as SPECIES_LIST } from '../../src/data/monsters';
import { LEGACY_SPECIES_MAP } from '../../src/data/v2/monsters';
import { createMonster } from '../../src/domain/monster/MonsterFactory';
import { inheritLegacy, toV2Species, unknownLegacySpecies } from '../../src/infrastructure/save/LegacyInherit';
import { migrate } from '../../src/infrastructure/save/SaveMigration';
import type { SaveData } from '../../src/application/GameState';
import { MemorySaveRepository } from '../../src/infrastructure/save/SaveRepository';

/** v1 の 世界（ルナフィアの まち・40種）の セーブを つくる（v1〜v5） */
function oldSave(version: number) {
  const s = JSON.parse(JSON.stringify(newGameState('ミナ', createRng(1), 0)));
  const rng = createRng(2);
  const a = createMonster('lunaslime', rng, { level: 3, sex: 'B', obtainedFrom: 'gift', now: 0 });
  const b = createMonster('magmadog', rng, { level: 3, sex: 'A', obtainedFrom: 'gift', now: 0, existingIds: new Set([a.id]) });
  s.monsters = JSON.parse(JSON.stringify([a, b]));
  s.partyIds = [a.id, b.id];
  s.discoveredSpeciesIds = ['lunaslime', 'magmadog'];
  s.ownedSpeciesIds = ['lunaslime', 'magmadog'];
  s.player.townMap = 'town'; s.player.townPos = { x: 9, y: 10 };
  s.progress.unlockedAreas = ['forest']; s.progress.storyFlags = {};
  s.schemaVersion = version;
  if (version <= 4) { delete s.chapters; delete s.story; delete s.v2; for (const m of s.monsters) { delete m.history; delete m.labels; delete m.breedingCount; } }
  else s.v2.legacy = { fromSchema: 4, at: 0, inherited: false };
  if (version <= 3) for (const m of s.monsters) { m.stats.wisdom = m.stats.magic; delete m.stats.magic; delete m.stats.spirit; }
  if (version <= 1) { s.monsters[0].speciesId = 'lumipon'; s.discoveredSpeciesIds = ['lumipon', 'magmadog']; s.ownedSpeciesIds = ['lumipon', 'magmadog']; }
  return s;
}

describe('SCHEMA v6：古い セーブを 読みこめる（v2 の 世界へ 引き継ぎ）', () => {
  it('現在の SCHEMA は 6', () => expect(SCHEMA_VERSION).toBe(6));
  for (const v of [1, 2, 3, 4, 5]) {
    it(`v${v} → v6`, () => {
      const r = migrate(oldSave(v));
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      const s = r.value;
      expect(s.schemaVersion).toBe(6);
      expect(s.monsters.map((m) => m.speciesId)).toEqual(['m001', 'm021']);
      for (const m of s.monsters) {
        expect(m.stats.magic).toBeGreaterThan(0);
        expect(m.stats.spirit).toBeGreaterThan(0);
        expect(m.history!.at(-1)!.kind).toBe('inherit');
      }
      // 物語は 第1章の はじめ（リーフェル）から
      expect(s.chapters.chapter).toBe(1);
      expect(s.chapters.stage).toBe('1-1');
      expect(s.chapters.features).toContain('save');
      expect(s.story.seen).toEqual(['ch1_night_light', 'ch1_rescue_luna']);
      expect(s.player.townMap).toBe('liefel');
      expect(s.progress.unlockedAreas).toEqual([]);
      expect(s.v2.legacy).toMatchObject({ fromSchema: v === 5 ? 4 : v, inherited: true });
      expect(s.v2.equipment).toEqual({ owned: {}, equipped: {} });
    });
  }
  it('すでに v6 なら そのまま。新しすぎる セーブは future', () => {
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
  it('モンスター・道具・お金・図鑑を のこし、種族を v2 に、物語は 第1章から。たおした ボスの かずで 記念メダル', () => {
    let s = oldSave(5) as SaveData;
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
    expect(out.player.gold).toBe(999);
    expect(out.inventory.shard).toBe(4);
    expect(out.inventory.medal).toBe((s.inventory.medal ?? 0) + 2);
    expect(out.partyIds).toEqual(s.partyIds);
    expect(out.discoveredSpeciesIds).toEqual(['m001', 'm021', 'm165', 'm181']);
    expect(out.breedingHistory[0].parents.map((p) => p.speciesId)).toEqual(['m181', 'm161']);
    expect(out.chapters.chapter).toBe(1);
    expect(out.progress.defeatedBossIds).toEqual([]);
    expect(out.v2.legacy).toEqual({ fromSchema: 4, at: 100, inherited: true });
    expect(s.monsters[0].speciesId).toBe('lunaslime');
    expect(inheritLegacy(out, 200)).toBe(out);
    expect(toV2Species('m010')).toBe('m010');
  });
  it('相棒の ルナスライムを にがしていたら あらためて 仲間に なる', () => {
    const s = oldSave(5) as SaveData;
    const out = inheritLegacy({ ...s, monsters: s.monsters.slice(1), partyIds: s.partyIds.slice(1) }, 100);
    expect(out.monsters.map((m) => m.speciesId)).toEqual(['m021', 'm001']);
    expect(out.partyIds[0]).toBe(out.monsters[1].id);
  });
  it('引き継いだ セーブで ゲームが うごく（リーフェルから、パーティで 戦える）', () => {
    const r = migrate(oldSave(2));
    if (!r.ok) throw new Error('migrate');
    const g = new Game(r.value, { rng: createRng(3), sink: null });
    expect(g.party.map((m) => m.speciesId)).toEqual(['m001', 'm021']);
    expect(g.currentTownMap().id).toBe('liefel');
    expect(migrate(JSON.parse(JSON.stringify(g.state))).ok).toBe(true);
  });
});
