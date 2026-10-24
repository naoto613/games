// POST /api/ai ・ GET /api/health
// APIキーはサーバーの環境変数 ANTHROPIC_API_KEY でのみ扱い、ブラウザには返さない
import { AGENTS, buildPrompt } from '../../src/ai/promptTemplates.js';
import { validateAiResult } from '../../src/ai/responseValidator.js';
import { scanSensitive } from '../../src/ai/agents.js';

export const DEFAULT_MODEL = process.env.OCL_MODEL || 'claude-opus-5-5';
const ALLOWED_MODELS = (process.env.OCL_ALLOWED_MODELS || 'claude-opus-5-5,claude-sonnet-5-5,claude-haiku-5-5,claude-fable-5-1')
  .split(',').map((s) => s.trim()).filter(Boolean);
// サーバー側フォールバック（"default"）を使えるモデル
const FALLBACK_MODELS = new Set(['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-fable-5-1']);
export const MAX_INPUT_BYTES = Number(process.env.OCL_MAX_INPUT_BYTES || 200 * 1024);

let clientPromise = null;
async function getClient() {
  if (!clientPromise) {
    clientPromise = import('@anthropic-ai/sdk').then(({ default: Anthropic }) => ({ Anthropic, client: new Anthropic() }));
  }
  return clientPromise;
}

// テスト用：SDK クライアントを差し替える
export function setClientForTest(fake) {
  clientPromise = Promise.resolve(fake);
}

export function health() {
  return { ok: true, provider: 'anthropic', model: DEFAULT_MODEL, models: ALLOWED_MODELS, configured: Boolean(process.env.ANTHROPIC_API_KEY) };
}

class HttpError extends Error {
  constructor(status, message, kind = 'error', details = []) {
    super(message);
    this.status = status;
    this.kind = kind;
    this.details = details;
  }
}

/** 1. リクエスト形式の検証 2. 入力サイズの制限 3. 機密情報の警告 */
export function validateRequest(body, rawSize) {
  if (rawSize > MAX_INPUT_BYTES) throw new HttpError(413, `入力が大きすぎます（上限 ${Math.round(MAX_INPUT_BYTES / 1024)} KB）`, 'invalid');
  if (!body || typeof body !== 'object') throw new HttpError(400, 'リクエストの形式が不正です', 'invalid');
  if (!AGENTS.includes(body.agent)) throw new HttpError(400, `不明なエージェントです：${body.agent}`, 'invalid');
  if (!body.input || typeof body.input !== 'object' || Array.isArray(body.input)) throw new HttpError(400, 'input がありません', 'invalid');
  const model = body.model && ALLOWED_MODELS.includes(body.model) ? body.model : DEFAULT_MODEL;
  const warnings = [];
  if (body.model && body.model !== model) warnings.push(`モデル「${body.model}」はサーバーで許可されていないため ${model} を使いました`);
  for (const s of scanSensitive(body.input)) warnings.push(`送信内容に${s.label}が含まれていた可能性があります`);
  return { agent: body.agent, input: body.input, model, warnings };
}

function textOf(message) {
  return message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
}

async function callClaude({ client, model, system, user, schema }) {
  const params = {
    model,
    max_tokens: 32000,
    system,
    messages: [{ role: 'user', content: user }],
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high', format: { type: 'json_schema', schema } },
  };
  if (FALLBACK_MODELS.has(model)) {
    params.betas = ['server-side-fallback-2026-07-01'];
    params.fallbacks = 'default';
  }
  const stream = client.beta.messages.stream(params);
  return stream.finalMessage();
}

/** 4. プロンプトの組み立て 5. LLM API の呼び出し 6. 応答の検証（不正なら1回だけ再試行）7. エラーの整形 */
export async function runAi(req) {
  if (!process.env.ANTHROPIC_API_KEY) throw new HttpError(503, 'サーバーに ANTHROPIC_API_KEY が設定されていません', 'config');
  const { Anthropic, client } = await getClient();
  const { system, user, schema } = buildPrompt(req.agent, req.input);
  const inputText = JSON.stringify(req.input);
  let lastErrors = [];
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const prompt = attempt === 0 ? user
      : `${user}\n\n【前回の出力の問題】\n${lastErrors.slice(0, 10).join('\n')}\n指定の JSON 形式に従って出力し直してください。`;
    let message;
    try {
      message = await callClaude({ client, model: req.model, system, user: prompt, schema });
    } catch (e) {
      if (e instanceof Anthropic.RateLimitError) throw new HttpError(429, 'AIの利用上限に達しました。時間をおいて再試行するか、手動入力に切り替えてください', 'limit');
      if (e instanceof Anthropic.AuthenticationError) throw new HttpError(503, 'APIキーが無効です（サーバーの設定を確認してください）', 'config');
      if (e instanceof Anthropic.APIConnectionError) throw new HttpError(502, 'AI APIに接続できませんでした', 'network');
      if (e instanceof Anthropic.APIError) throw new HttpError(502, `AI APIでエラーが発生しました（${e.status ?? ''} ${e.message}）`, 'error');
      throw e;
    }
    if (message.stop_reason === 'refusal') {
      throw new HttpError(422, 'AIがこのリクエストへの回答を控えました。内容を見直すか、手動で入力してください', 'error', [message.stop_details?.explanation].filter(Boolean));
    }
    if (message.stop_reason === 'max_tokens') {
      lastErrors = ['出力が長すぎて途中で切れました。より簡潔に出力してください'];
      continue;
    }
    const v = validateAiResult(textOf(message), schema, inputText);
    if (v.ok) return { result: v.result, warnings: [...req.warnings, ...v.warnings], model: message.model || req.model };
    lastErrors = v.errors;
  }
  throw new HttpError(502, 'AIの応答が指定の形式になりませんでした（再試行済み）。もう一度試すか、手動で入力してください', 'invalid', lastErrors);
}

export { HttpError };
