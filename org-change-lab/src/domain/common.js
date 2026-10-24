// ドメイン層の共通ユーティリティ（DOM・保存処理に依存しない）

export function newId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isBlank(v) {
  if (v === null || v === undefined) return true;
  if (Array.isArray(v)) return v.filter((x) => !isBlank(x)).length === 0;
  return String(v).trim() === '';
}

export function asList(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (isBlank(v)) return [];
  return String(v).split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
}

export function str(v) {
  return v === null || v === undefined ? '' : String(v).trim();
}

// 数値として解釈できなければ null（推測で補完しない）
export function numOrNull(v) {
  if (v === null || v === undefined || String(v).trim() === '') return null;
  const n = Number(String(v).replace(/[,，%％]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out;
}

// 必須項目チェック。{ field: '表示名' } を渡し、空のものを { field: 'メッセージ' } で返す
export function requireFields(record, fields) {
  const errors = {};
  for (const [key, label] of Object.entries(fields)) {
    if (isBlank(record[key])) errors[key] = `${label}を入力してください`;
  }
  return errors;
}
