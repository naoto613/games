/* セーブ：IndexedDB に自動保存（使えないときは localStorage） */
'use strict';
(() => {
  const DB = 'petapeta-town', STORE = 'save', KEY = 'main', LSKEY = 'petapeta-town-save';
  const S = (PT.save = { data: null, timer: null, db: null });

  S.fresh = () => ({
    schemaVersion: 1,
    unlockedStageIds: PT.STAGES.map((s) => s.id),
    discoveredReactionIds: {},   // id -> { stage, at }
    unlockedObjectIds: [],       // ごほうびで増えたアイテム
    stageSnapshots: {},          // stageId -> { props:[], chars:[] }
    odaiDone: {},                // odaiId -> true
    storyDone: {},               // storyId -> true
    stamps: {},                  // stageId -> true
    seenTutorial: false,
    settings: { volume: 0.8, sfx: true, bgm: true, speak: true },
  });

  const openDB = () => new Promise((res, rej) => {
    if (!('indexedDB' in window)) { rej(new Error('no idb')); return; }
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });

  const migrate = (d) => {
    const f = S.fresh();
    if (!d || typeof d !== 'object') return f;
    const out = Object.assign(f, d);
    out.settings = Object.assign(S.fresh().settings, d.settings || {});
    // 新しく増えたステージは開放しておく
    PT.STAGES.forEach((s) => { if (!out.unlockedStageIds.includes(s.id)) out.unlockedStageIds.push(s.id); });
    out.schemaVersion = 1;
    return out;
  };

  S.load = async () => {
    let raw = null;
    try {
      S.db = await openDB();
      raw = await new Promise((res, rej) => {
        const tx = S.db.transaction(STORE, 'readonly');
        const q = tx.objectStore(STORE).get(KEY);
        q.onsuccess = () => res(q.result);
        q.onerror = () => rej(q.error);
      });
    } catch (e) {
      S.db = null;
    }
    if (!raw) {
      try { raw = JSON.parse(localStorage.getItem(LSKEY) || 'null'); } catch (e) { raw = null; }
    }
    S.data = migrate(raw);
    return S.data;
  };

  S.writeNow = () => {
    clearTimeout(S.timer); S.timer = null;
    const copy = JSON.parse(JSON.stringify(S.data));
    if (S.db) {
      try {
        const tx = S.db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(copy, KEY);
      } catch (e) { /* 次の保存で再挑戦 */ }
    }
    try { localStorage.setItem(LSKEY, JSON.stringify(copy)); } catch (e) { /* 容量不足など */ }
  };
  S.touch = () => {
    if (S.timer) return;
    S.timer = setTimeout(S.writeNow, 400);
  };

  /* 発見履歴やごほうびまで全部消す（保護者メニューのみ） */
  S.wipe = () => {
    const keepSettings = S.data.settings;
    S.data = S.fresh();
    S.data.settings = keepSettings;
    S.data.seenTutorial = true;
    S.writeNow();
  };

  document.addEventListener('visibilitychange', () => { if (document.hidden && S.data) { PT.bus.emit('beforeSave'); S.writeNow(); } });
  window.addEventListener('pagehide', () => { if (S.data) { PT.bus.emit('beforeSave'); S.writeNow(); } });
})();
