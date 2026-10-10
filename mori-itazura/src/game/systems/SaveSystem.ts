// IndexedDB へのセーブ・ロード（形式はバージョン付きで、読み込み時に移行する）
import { SaveData, migrate, SAVE_VERSION } from '../core/GameState';

export interface SaveStorage {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  del(key: string): Promise<void>;
}

export class IndexedDBStorage implements SaveStorage {
  private dbp: Promise<IDBDatabase> | null = null;
  constructor(private dbName = 'mori-itazura', private store = 'saves') {}
  private db() {
    if (!this.dbp) {
      this.dbp = new Promise((res, rej) => {
        const req = indexedDB.open(this.dbName, 1);
        req.onupgradeneeded = () => { req.result.createObjectStore(this.store); };
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
    }
    return this.dbp;
  }
  private async tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) {
    const db = await this.db();
    return new Promise<T>((res, rej) => {
      const t = db.transaction(this.store, mode);
      const r = fn(t.objectStore(this.store));
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  get(key: string) { return this.tx('readonly', (s) => s.get(key)); }
  async set(key: string, value: unknown) { await this.tx('readwrite', (s) => s.put(value, key)); }
  async del(key: string) { await this.tx('readwrite', (s) => s.delete(key)); }
}

export class MemoryStorage implements SaveStorage {
  m = new Map<string, unknown>();
  async get(k: string) { return this.m.get(k); }
  async set(k: string, v: unknown) { this.m.set(k, JSON.parse(JSON.stringify(v))); }
  async del(k: string) { this.m.delete(k); }
}

export class SaveSystem {
  constructor(private storage: SaveStorage, private slot = 'slot1') {}

  async save(data: SaveData) {
    data.version = SAVE_VERSION;
    data.savedAt = new Date().toISOString();
    // 循環参照や関数を含めない純粋なデータとして保存する
    const plain = JSON.parse(JSON.stringify(data));
    await this.storage.set(this.slot, plain);
  }

  async load(): Promise<SaveData | null> {
    const raw = await this.storage.get(this.slot);
    if (!raw) return null;
    return migrate(raw);
  }

  async exists() { return !!(await this.storage.get(this.slot)); }
  async clear() { await this.storage.del(this.slot); }
}

export function createStorage(): SaveStorage {
  try {
    if (typeof indexedDB !== 'undefined') return new IndexedDBStorage();
  } catch { /* プライベートモード等 */ }
  return new MemoryStorage();
}
