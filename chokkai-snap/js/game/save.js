// セーブ（41/42/137 章）：IndexedDB を基本に LocalStorage へバックアップ。schemaVersion とマイグレーション。
// GlobalProgress（過去のプレイ結果）と StageRunState（今回のラン）は別のキーに保存する。

export const SCHEMA_VERSION = 3;
const DB = 'chokkai-snap';
const STORE = 'kv';
const LS = 'chokkai-snap:';

export const DEFAULT_SETTINGS = {
  difficulty: 'NORMAL',       // EASY / NORMAL / CLASSIC（53章）
  assistPause: false,         // 図鑑・メニュー表示中に時間を止める（32章）
  fontSize: 'M',              // 字幕サイズ
  highContrast: false, reducedMotion: false, reducedFlash: false,
  zoomCap: 4, longPress: true, doubleTap: true, camSensitivity: 1, hintLevel: 3, extendedTimer: false,
  bgm: 0.5, se: 0.8, debug: false,
};

export function defaultProgress() {
  return { schemaVersion: SCHEMA_VERSION, unlockedStages: ['S1'], completedStages: [], bestScores: {}, eventCollection: {}, tutorialDone: false, settings: { ...DEFAULT_SETTINGS } };
}

// 旧形式からの移行（v1: 配列の discovered、v2: settings なし）
export function migrate(data) {
  if (!data || typeof data !== 'object') return defaultProgress();
  let d = { ...data };
  const v = d.schemaVersion || 1;
  if (v < 2) {
    const col = {};
    for (const id of d.discovered || []) col[id] = { eventId: id, discovered: true, completedCount: 1, firstDiscoveredAt: null, bestRouteScoreContribution: 0 };
    d = { schemaVersion: 2, unlockedStages: d.unlockedStages || ['S1'], completedStages: d.completedStages || [], bestScores: d.bestScores || {}, eventCollection: col };
  }
  if ((d.schemaVersion || 2) < 3) { d.settings = { ...DEFAULT_SETTINGS }; d.tutorialDone = !!d.tutorialDone; d.schemaVersion = 3; }
  d.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
  if (!Array.isArray(d.unlockedStages) || !d.unlockedStages.includes('S1')) d.unlockedStages = ['S1', ...(d.unlockedStages || [])];
  d.eventCollection = d.eventCollection || {};
  d.bestScores = d.bestScores || {};
  d.completedStages = d.completedStages || [];
  return d;
}

function openDb() {
  return new Promise((res, rej) => {
    if (typeof indexedDB === 'undefined') return rej(new Error('no idb'));
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export class SaveSystem {
  constructor() { this.dbp = openDb().catch(() => null); }
  async _get(key) {
    const db = await this.dbp;
    if (!db) return undefined;
    return new Promise(res => {
      try {
        const tx = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
        tx.onsuccess = () => res(tx.result); tx.onerror = () => res(undefined);
      } catch { res(undefined); }
    });
  }
  async _put(key, val) {
    try { localStorage.setItem(LS + key, JSON.stringify(val)); } catch { /* 容量超過などは無視 */ }
    const db = await this.dbp;
    if (!db) return;
    await new Promise(res => {
      try {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(val, key);
        tx.oncomplete = res; tx.onerror = res; tx.onabort = res;
      } catch { res(); }
    });
  }
  async _del(key) {
    try { localStorage.removeItem(LS + key); } catch { /* noop */ }
    const db = await this.dbp;
    if (!db) return;
    await new Promise(res => { try { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(key); tx.oncomplete = res; tx.onerror = res; } catch { res(); } });
  }
  _ls(key) { try { const s = localStorage.getItem(LS + key); return s ? JSON.parse(s) : undefined; } catch { return undefined; } }

  // 破損時は LocalStorage のバックアップ → 初期値の順にフォールバック
  async loadProgress() {
    for (const src of [await this._get('progress'), this._ls('progress')]) {
      try { if (src && typeof src === 'object' && src.unlockedStages) return migrate(src); } catch { /* 次へ */ }
    }
    return defaultProgress();
  }
  saveProgress(p) { return this._put('progress', p); }
  async loadRun() {
    const r = (await this._get('run')) || this._ls('run');
    return r && r.stageId && r.state ? r : null;
  }
  saveRun(stageId, state) { return this._put('run', { schemaVersion: SCHEMA_VERSION, stageId, state, savedAt: Date.now() }); }
  clearRun() { return this._del('run'); }
}
