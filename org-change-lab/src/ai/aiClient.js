// AI接続。APIキーはブラウザに置かず、バックエンド（server/）経由で呼び出す
import { SCHEMAS } from './schemas.js';
import { validateAiResult } from './responseValidator.js';
import { buildManualPrompt } from './promptTemplates.js';

export class AiError extends Error {
  constructor(message, { kind = 'error', details = [] } = {}) {
    super(message);
    this.kind = kind; // 'network' | 'invalid' | 'empty' | 'limit' | 'config' | 'error'
    this.details = details;
  }
}

function joinUrl(base, path) {
  return `${String(base || './api').replace(/\/+$/, '')}/${path}`;
}

export async function checkBackend(baseUrl) {
  let res;
  try {
    res = await fetch(joinUrl(baseUrl, 'health'), { headers: { Accept: 'application/json' } });
  } catch (e) {
    throw new AiError(`バックエンドに接続できません（${e.message}）`, { kind: 'network' });
  }
  if (!res.ok) throw new AiError(`バックエンドが応答しません（HTTP ${res.status}）`, { kind: 'network' });
  const body = await res.json().catch(() => null);
  if (!body?.ok) throw new AiError('バックエンドの応答が不正です', { kind: 'invalid' });
  return body; // { ok, configured, model, provider }
}

export async function requestBackend({ baseUrl, agent, input, model, signal }) {
  let res;
  try {
    res = await fetch(joinUrl(baseUrl, 'ai'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ agent, input, model }),
      signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') throw new AiError('AI分析を中止しました', { kind: 'aborted' });
    throw new AiError(`AI APIに接続できませんでした（${e.message}）`, { kind: 'network' });
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.ok) {
    const kind = res.status === 429 ? 'limit' : (body?.kind || 'error');
    throw new AiError(body?.error || `AI APIでエラーが発生しました（HTTP ${res.status}）`, { kind, details: body?.details || [] });
  }
  // サーバーでも検証済みだが、ブラウザ側でも同じスキーマで再検証してから表示する
  return validateOrThrow(agent, body.result, input, body.warnings || [], body.model);
}

export function manualPrompt(agent, input) {
  return buildManualPrompt(agent, input);
}

export function parseManualResponse(agent, text, input) {
  return validateOrThrow(agent, text, input, [], null);
}

function validateOrThrow(agent, raw, input, extraWarnings, model) {
  const schema = SCHEMAS[agent];
  if (!schema) throw new AiError(`不明なエージェントです：${agent}`, { kind: 'config' });
  if (raw === null || raw === undefined || (typeof raw === 'string' && !raw.trim())) {
    throw new AiError('AIの応答が空です。再試行してください', { kind: 'empty' });
  }
  const v = validateAiResult(raw, schema, JSON.stringify(input));
  if (!v.ok) throw new AiError('AIの応答が指定の形式ではありません。修正して再試行してください', { kind: 'invalid', details: v.errors });
  return { result: v.result, warnings: [...extraWarnings, ...v.warnings], model };
}
