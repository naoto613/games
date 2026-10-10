/* storage.js — localStorage への保存・読み込み・破損時の復旧・保存形式のバージョン管理 */
window.HL = window.HL || {};

HL.storage = (function () {
  'use strict';
  var KEY = 'harmonyland-guide';
  var VERSION = 1;

  var status = { available: true, corrupted: false, lastSaveFailed: false };

  function defaults() {
    return {
      version: VERSION,
      plan: [],      // 行きたい施設・予定 { id, kind:'facility'|'show', refId, startTime, endTime, priority, memo, createdAt }
      visited: [],   // 訪問済みの施設・ショーの ID（kind:refId）
      checked: [],   // 利用者が「公式情報で確認した」とチェックした整理券項目の ID
      memo: ''       // 全体メモ
    };
  }

  function probe() {
    try {
      var k = KEY + '-probe';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  function isStr(v) { return typeof v === 'string'; }

  // 保存形式のバージョン移行。将来 VERSION を上げたらここに変換を追加する。
  function migrate(raw) {
    if (!raw || typeof raw !== 'object') throw new Error('invalid');
    if (raw.version === VERSION) return raw;
    throw new Error('unknown version: ' + raw.version);
  }

  // 型が崩れた項目は捨て、使える部分だけ残す
  function sanitize(raw) {
    var d = defaults();
    if (Array.isArray(raw.plan)) {
      d.plan = raw.plan.filter(function (p) {
        return p && isStr(p.id) && (p.kind === 'facility' || p.kind === 'show') && isStr(p.refId);
      }).map(function (p) {
        return {
          id: p.id, kind: p.kind, refId: p.refId,
          startTime: isStr(p.startTime) ? p.startTime : '',
          endTime: isStr(p.endTime) ? p.endTime : '',
          priority: ['high', 'normal', 'low'].indexOf(p.priority) >= 0 ? p.priority : 'normal',
          memo: isStr(p.memo) ? p.memo : '',
          createdAt: isStr(p.createdAt) ? p.createdAt : ''
        };
      });
    }
    if (Array.isArray(raw.visited)) d.visited = raw.visited.filter(isStr);
    if (Array.isArray(raw.checked)) d.checked = raw.checked.filter(isStr);
    if (isStr(raw.memo)) d.memo = raw.memo;
    return d;
  }

  function load() {
    status.available = probe();
    if (!status.available) return defaults();
    var text;
    try { text = window.localStorage.getItem(KEY); } catch (e) { status.available = false; return defaults(); }
    if (text == null) return defaults();
    try {
      return sanitize(migrate(JSON.parse(text)));
    } catch (e) {
      // 破損：デフォルトで起動し、初期化の選択肢を出す（壊れたデータは上書きするまで残す）
      status.corrupted = true;
      return defaults();
    }
  }

  function save(state) {
    if (!status.available) { status.lastSaveFailed = true; return false; }
    try {
      var out = {
        version: VERSION, plan: state.plan, visited: state.visited, checked: state.checked, memo: state.memo
      };
      window.localStorage.setItem(KEY, JSON.stringify(out));
      status.lastSaveFailed = false;
      status.corrupted = false;
      return true;
    } catch (e) {
      status.lastSaveFailed = true;
      return false;
    }
  }

  function reset() {
    try { window.localStorage.removeItem(KEY); } catch (e) { /* noop */ }
    status.corrupted = false;
    return defaults();
  }

  return { load: load, save: save, reset: reset, defaults: defaults, status: status, VERSION: VERSION };
})();
