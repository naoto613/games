// IndexedDB の薄いラッパー。テストや IndexedDB が使えない環境ではメモリ版を使う
import { DB_NAME, DB_VERSION, STORES, CHILD_STORES } from '../constants.js';

function req(r) {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('トランザクションが中断されました'));
  });
}

export async function openIndexedDb(indexedDB = globalThis.indexedDB) {
  if (!indexedDB) throw new Error('このブラウザでは IndexedDB を利用できません');
  const open = indexedDB.open(DB_NAME, DB_VERSION);
  open.onupgradeneeded = () => {
    const db = open.result;
    // スキーマ変更時はここで DB_VERSION ごとの移行処理を追加する
    for (const name of Object.values(STORES)) {
      if (db.objectStoreNames.contains(name)) continue;
      const store = db.createObjectStore(name, { keyPath: 'id' });
      if (CHILD_STORES.includes(name)) store.createIndex('initiativeId', 'initiativeId', { unique: false });
    }
  };
  const db = await req(open);
  return {
    persistent: true,
    async get(store, id) {
      return (await req(db.transaction(store).objectStore(store).get(id))) || null;
    },
    async getAll(store) {
      return req(db.transaction(store).objectStore(store).getAll());
    },
    async getByInitiative(store, initiativeId) {
      return req(db.transaction(store).objectStore(store).index('initiativeId').getAll(initiativeId));
    },
    async put(store, record) {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put(record);
      await txDone(tx);
      return record;
    },
    async delete(store, id) {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).delete(id);
      await txDone(tx);
    },
    // ops: [{ type: 'put'|'delete', store, record|id }] を 1 トランザクションで実行（全件成功か全件失敗）
    async batch(ops) {
      const names = [...new Set(ops.map((o) => o.store))];
      if (!names.length) return;
      const tx = db.transaction(names, 'readwrite');
      for (const op of ops) {
        const s = tx.objectStore(op.store);
        if (op.type === 'put') s.put(op.record);
        else s.delete(op.id);
      }
      await txDone(tx);
    },
    async clearAll() {
      const names = Object.values(STORES);
      const tx = db.transaction(names, 'readwrite');
      for (const n of names) tx.objectStore(n).clear();
      await txDone(tx);
    },
  };
}

export function createMemoryDb() {
  const data = Object.fromEntries(Object.values(STORES).map((n) => [n, new Map()]));
  const clone = (v) => (v == null ? v : structuredClone(v));
  return {
    persistent: false,
    async get(store, id) { return clone(data[store].get(id)) || null; },
    async getAll(store) { return [...data[store].values()].map(clone); },
    async getByInitiative(store, initiativeId) {
      return [...data[store].values()].filter((r) => r.initiativeId === initiativeId).map(clone);
    },
    async put(store, record) { data[store].set(record.id, clone(record)); return record; },
    async delete(store, id) { data[store].delete(id); },
    async batch(ops) {
      for (const op of ops) {
        if (op.type === 'put') data[op.store].set(op.record.id, clone(op.record));
        else data[op.store].delete(op.id);
      }
    },
    async clearAll() { for (const m of Object.values(data)) m.clear(); },
  };
}
