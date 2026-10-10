import type { SaveData } from '../../application/GameState';
import { migrate, type MigrationError } from './SaveMigration';

export type LoadResult =
  | { kind: 'empty' }
  | { kind: 'ok'; data: SaveData }
  | { kind: 'error'; error: MigrationError; raw: unknown };

export interface SaveRepository {
  load(): Promise<LoadResult>;
  save(data: SaveData): Promise<void>;
  /** 壊れた・未来のデータを退避する（消さない） */
  backup(raw: unknown): Promise<void>;
  clear(): Promise<void>;
}

/** テスト・IndexedDB が使えない環境用 */
export class MemorySaveRepository implements SaveRepository {
  data: unknown = null;
  backups: unknown[] = [];
  failNext = false;
  async load(): Promise<LoadResult> {
    if (this.data == null) return { kind: 'empty' };
    const r = migrate(structuredClone(this.data));
    return r.ok ? { kind: 'ok', data: r.value } : { kind: 'error', error: r.error, raw: this.data };
  }
  async save(data: SaveData) {
    if (this.failNext) {
      this.failNext = false;
      throw new Error('save failed');
    }
    this.data = structuredClone(data);
  }
  async backup(raw: unknown) {
    this.backups.push(structuredClone(raw));
  }
  async clear() {
    this.data = null;
  }
}
