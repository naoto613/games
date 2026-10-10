import { SCHEMA_VERSION, defaultSettings, type SaveData } from '../../application/GameState';
import { err, ok, type Result } from '../../core/Result';

export type MigrationError = 'future' | 'corrupt';

/** バージョンごとの移行関数（v → v+1）。今はまだ v1 だけ。 */
/** v1→v2: モンスターの種族を 図鑑20種に いれかえた（にた役わりの 種族へ） */
export const SPECIES_V1_TO_V2: Record<string, string> = {
  lumipon: 'lunaslime', tsukipon: 'darkeye', auroran: 'greensprite', kogemaru: 'magmadog', homurawolf: 'lightningleo', mitsugashira: 'darkdragon',
  iwatokage: 'stonegolem', haganegame: 'icekrill', suishoryu: 'firedragon', yorufukuro: 'frostbird', kazetsubame: 'windcat', nijikujaku: 'metalspirit',
  mossglow: 'leafant', madoidake: 'kinoborg', morinushi: 'devilcrab', luxdrago: 'chaosdragon',
};
const mapSp = (id: unknown) => (typeof id === 'string' ? SPECIES_V1_TO_V2[id] ?? id : id);
const mapList = (l: unknown) => (Array.isArray(l) ? [...new Set(l.map(mapSp))] : l);

const MIGRATIONS: Record<number, (d: Record<string, unknown>) => Record<string, unknown>> = {
  1: (d) => ({
    ...d,
    monsters: (d.monsters as Record<string, unknown>[]).map((m) => ({ ...m, speciesId: mapSp(m.speciesId), parentSpeciesIds: Array.isArray(m.parentSpeciesIds) ? (m.parentSpeciesIds as unknown[]).map(mapSp) : m.parentSpeciesIds })),
    discoveredSpeciesIds: mapList(d.discoveredSpeciesIds),
    ownedSpeciesIds: mapList(d.ownedSpeciesIds),
    breedingHistory: Array.isArray(d.breedingHistory) ? (d.breedingHistory as Record<string, unknown>[]).map((h) => ({ ...h, childSpeciesId: mapSp(h.childSpeciesId), parents: Array.isArray(h.parents) ? (h.parents as Record<string, unknown>[]).map((x) => ({ ...x, speciesId: mapSp(x.speciesId) })) : h.parents })) : d.breedingHistory,
  }),
};

export function migrate(raw: unknown): Result<SaveData, MigrationError> {
  if (!raw || typeof raw !== 'object') return err('corrupt');
  let d = raw as Record<string, unknown>;
  const v = d.schemaVersion;
  if (typeof v !== 'number') return err('corrupt');
  if (v > SCHEMA_VERSION) return err('future');
  for (let cur = v; cur < SCHEMA_VERSION; cur++) {
    const f = MIGRATIONS[cur];
    if (!f) return err('corrupt');
    d = { ...f(d), schemaVersion: cur + 1 };
  }
  if (!validate(d)) return err('corrupt');
  const s = d as unknown as SaveData;
  // まちが 1まいだった ころの きろく: 新しい まちの まんなかから はじめる
  if (!s.player.townMap) s.player = { ...s.player, townMap: 'town', townPos: { x: 9, y: 10 }, townDir: 'up' };
  // 手作りマップ だった ころの 探索中セーブ: シードを つけて フロアの スタートへ（Game が いちを なおす）
  if (s.expedition && typeof s.expedition.mapSeed !== 'number') s.expedition = { ...s.expedition, mapSeed: 1, pos: { x: -1, y: -1 } };
  return ok({ ...s, settings: { ...defaultSettings(), ...s.settings } });
}

/** 最低限の整合性チェック（壊れたデータで遊びはじめないように） */
export function validate(d: Record<string, unknown>): boolean {
  const s = d as unknown as SaveData;
  if (!Array.isArray(s.monsters) || !Array.isArray(s.partyIds) || !s.player || typeof s.player.gold !== 'number') return false;
  const ids = new Set(s.monsters.map((m) => m.id));
  if (ids.size !== s.monsters.length) return false;
  if (new Set(s.partyIds).size !== s.partyIds.length) return false;
  if (s.partyIds.some((id) => !ids.has(id))) return false;
  if (!s.progress || !Array.isArray(s.progress.unlockedAreas)) return false;
  return true;
}
