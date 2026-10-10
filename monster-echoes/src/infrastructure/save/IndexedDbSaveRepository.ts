import type { SaveData } from '../../application/GameState';
import { migrate } from './SaveMigration';
import type { LoadResult, SaveRepository } from './SaveRepository';

const DB = 'monster-echoes';
const STORE = 'saves';
const KEY = 'slot1';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(db: IDBDatabase, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    // 書き込みはトランザクションの完了まで待つ（途中で閉じても壊れないように）
    t.oncomplete = () => resolve(req.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export class IndexedDbSaveRepository implements SaveRepository {
  private db: Promise<IDBDatabase> | null = null;
  private get conn() {
    return (this.db ??= open());
  }
  async load(): Promise<LoadResult> {
    const raw = await tx(await this.conn, 'readonly', (s) => s.get(KEY));
    if (raw == null) return { kind: 'empty' };
    const r = migrate(structuredClone(raw));
    if (r.ok) {
      if ((raw as SaveData).schemaVersion !== r.value.schemaVersion) await this.backup(raw); // 移行前にバックアップ
      return { kind: 'ok', data: r.value };
    }
    return { kind: 'error', error: r.error, raw };
  }
  async save(data: SaveData) {
    await tx(await this.conn, 'readwrite', (s) => s.put(data, KEY));
  }
  async backup(raw: unknown) {
    await tx(await this.conn, 'readwrite', (s) => s.put(raw, `backup-${Date.now()}`));
  }
  async clear() {
    await tx(await this.conn, 'readwrite', (s) => s.delete(KEY));
  }
}
