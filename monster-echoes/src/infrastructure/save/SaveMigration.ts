import { SCHEMA_VERSION, defaultSettings, type SaveData } from '../../application/GameState';
import { err, ok, type Result } from '../../core/Result';

export type MigrationError = 'future' | 'corrupt';

/** バージョンごとの移行関数（v → v+1）。今はまだ v1 だけ。 */
const MIGRATIONS: Record<number, (d: Record<string, unknown>) => Record<string, unknown>> = {};

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
