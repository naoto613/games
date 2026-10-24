// セーブデータの保存先（IndexedDB）。使えない環境では localStorage、さらにだめならメモリに置く。
const DB = 'yohaku-archive';
const STORE = 'saves';
const mem = new Map<string, string>();

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    try {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) {
      rej(e);
    }
  });
}

export async function putSave(key: string, text: string): Promise<void> {
  mem.set(key, text);
  try {
    const db = await open();
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(text, key);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch {
    try { localStorage.setItem(DB + ':' + key, text); } catch { /* 保存できない環境 */ }
  }
}

export async function getSave(key: string): Promise<string | null> {
  try {
    const db = await open();
    const v = await new Promise<string | undefined>((res, rej) => {
      const tx = db.transaction(STORE, 'readonly');
      const r = tx.objectStore(STORE).get(key);
      r.onsuccess = () => res(r.result as string | undefined);
      r.onerror = () => rej(r.error);
    });
    if (v) return v;
  } catch { /* 下へ */ }
  try {
    const v = localStorage.getItem(DB + ':' + key);
    if (v) return v;
  } catch { /* 下へ */ }
  return mem.get(key) ?? null;
}

export async function deleteSave(key: string): Promise<void> {
  mem.delete(key);
  try {
    const db = await open();
    db.transaction(STORE, 'readwrite').objectStore(STORE).delete(key);
  } catch { /* なし */ }
  try { localStorage.removeItem(DB + ':' + key); } catch { /* なし */ }
}

export interface Settings { bgm: number; se: number; textSpeed: number }
const DEFAULT: Settings = { bgm: 0.5, se: 0.7, textSpeed: 32 };

export function loadSettings(): Settings {
  try {
    const v = localStorage.getItem(DB + ':settings');
    if (v) return { ...DEFAULT, ...JSON.parse(v) };
  } catch { /* 既定値 */ }
  return { ...DEFAULT };
}

export function saveSettings(s: Settings): void {
  try { localStorage.setItem(DB + ':settings', JSON.stringify(s)); } catch { /* 保存できない */ }
}
