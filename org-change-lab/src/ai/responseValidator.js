// AI応答の検証（ブラウザとサーバーで共用）。不正な出力は保存させない

/** 応答テキストから JSON を取り出す（```json フェンスや前後の文章を許容） */
export function extractJson(text) {
  if (text === null || text === undefined) throw new Error('AIの応答が空です');
  if (typeof text === 'object') return text;
  const src = String(text).trim();
  if (!src) throw new Error('AIの応答が空です');
  const fence = src.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : src;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch { /* 下で失敗扱い */ }
    }
    throw new Error('AIの応答を JSON として読み取れませんでした');
  }
}

/** JSON Schema のサブセット（type / enum / properties / required / items）で検証する */
export function validateSchema(value, schema, path = '$') {
  const errors = [];
  const warnings = [];
  walk(value, schema, path, errors, warnings);
  return { ok: errors.length === 0, errors, warnings };
}

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';
  return typeof v;
}

function walk(v, schema, path, errors, warnings) {
  const t = typeOf(v);
  const expected = schema.type;
  const okType = expected === t || (expected === 'number' && t === 'integer');
  if (expected && !okType) {
    errors.push(`${path}: ${expected} を期待しましたが ${t} でした`);
    return;
  }
  if (schema.enum && !schema.enum.includes(v)) {
    errors.push(`${path}: 「${v}」は許可された値（${schema.enum.join(', ')}）ではありません`);
    return;
  }
  if (t === 'object' && schema.properties) {
    for (const key of schema.required || []) {
      if (!(key in v)) errors.push(`${path}.${key}: 必須項目がありません`);
    }
    for (const [key, sub] of Object.entries(schema.properties)) {
      if (key in v) walk(v[key], sub, `${path}.${key}`, errors, warnings);
    }
    for (const key of Object.keys(v)) {
      if (!(key in schema.properties)) warnings.push(`${path}.${key}: 想定外の項目のため無視します`);
    }
  }
  if (t === 'array' && schema.items) {
    v.forEach((item, i) => walk(item, schema.items, `${path}[${i}]`, errors, warnings));
  }
}

/** スキーマにない項目を取り除いたコピーを返す */
export function stripUnknown(v, schema) {
  if (Array.isArray(v) && schema.items) return v.map((x) => stripUnknown(x, schema.items));
  if (v && typeof v === 'object' && schema.properties) {
    const out = {};
    for (const key of Object.keys(schema.properties)) if (key in v) out[key] = stripUnknown(v[key], schema.properties[key]);
    return out;
  }
  return v;
}

function collectStrings(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => collectStrings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => collectStrings(x, out));
  return out;
}

/**
 * 入力にない数値が出力に含まれていないかを調べる（「入力にない数値や事実を生成してはならない」の機械チェック）。
 * 1桁の数（「2〜3案」など）は対象外。見つかった数値は警告として表示する。
 */
export function findUnsupportedNumbers(result, inputText) {
  const source = String(inputText).replace(/[,，]/g, '');
  const found = new Set();
  for (const s of collectStrings(result)) {
    const matches = s.replace(/[,，]/g, '').match(/\d+(?:\.\d+)?\s*[%％]?/g) || [];
    for (const m of matches) {
      const num = m.replace(/\s*[%％]$/, '').trim();
      const isPercent = /[%％]$/.test(m.trim());
      if (!isPercent && num.length < 2) continue;
      if (!source.includes(num)) found.add(m.trim());
    }
  }
  return [...found];
}

/** スキーマ検証＋数値チェックをまとめて行う */
export function validateAiResult(raw, schema, inputText = '') {
  let parsed;
  try {
    parsed = extractJson(raw);
  } catch (e) {
    return { ok: false, errors: [e.message], warnings: [] };
  }
  const { ok, errors, warnings } = validateSchema(parsed, schema);
  if (!ok) return { ok, errors, warnings };
  const result = stripUnknown(parsed, schema);
  const nums = findUnsupportedNumbers(result, inputText);
  if (nums.length) warnings.push(`入力にない数値が含まれています：${nums.slice(0, 10).join('、')}。根拠を確認してから保存してください`);
  const empty = collectStrings(result).every((s) => s.trim() === '');
  if (empty) return { ok: false, errors: ['AIの応答に内容がありません'], warnings };
  return { ok: true, errors: [], warnings, result };
}
