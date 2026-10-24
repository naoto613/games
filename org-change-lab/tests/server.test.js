import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRequest, runAi, setClientForTest } from '../server/routes/ai.js';

class APIError extends Error {}
class RateLimitError extends APIError {}
const Anthropic = { APIError, RateLimitError, AuthenticationError: class extends APIError {}, APIConnectionError: class extends APIError {} };

const valid = {
  analysisType: 'critical_review', summary: '要約', findings: [{ issue: 'i', category: 'other', severity: 'low', target: 't', requiredEvidence: 'r', suggestion: 's' }], limitations: [],
};

function fakeClient(responses, calls = []) {
  return {
    Anthropic,
    client: { beta: { messages: { stream: (params) => { calls.push(params); const r = responses.shift(); return { finalMessage: async () => { if (r instanceof Error) throw r; return r; } }; } } } },
  };
}
const msg = (text, stop = 'end_turn') => ({ model: 'claude-opus-5-5', stop_reason: stop, content: [{ type: 'text', text }] });

process.env.ANTHROPIC_API_KEY = 'test';

test('リクエストの検証：エージェント名・入力・サイズ・許可されていないモデル', () => {
  assert.throws(() => validateRequest({ agent: 'x', input: {} }, 10), /不明なエージェント/);
  assert.throws(() => validateRequest({ agent: 'review' }, 10), /input/);
  assert.throws(() => validateRequest({ agent: 'review', input: {} }, 10 ** 7), /大きすぎ/);
  const r = validateRequest({ agent: 'review', input: { a: 'yamada@example.com' }, model: 'gpt-x' }, 10);
  assert.equal(r.model, 'claude-opus-5-5');
  assert.equal(r.warnings.length, 2);
});

test('構造化出力・適応的思考・フォールバックを指定して呼び出す', async () => {
  const calls = [];
  setClientForTest(fakeClient([msg(JSON.stringify(valid))], calls));
  const out = await runAi({ agent: 'review', input: { target: {} }, model: 'claude-opus-5-5', warnings: [] });
  assert.equal(out.result.summary, '要約');
  assert.equal(calls[0].output_config.format.type, 'json_schema');
  assert.deepEqual(calls[0].thinking, { type: 'adaptive' });
  assert.equal(calls[0].fallbacks, 'default');
});

test('不正な応答は1回だけ再試行し、それでも不正ならエラー', async () => {
  const calls = [];
  setClientForTest(fakeClient([msg('{"x":1}'), msg(JSON.stringify(valid))], calls));
  const ok = await runAi({ agent: 'review', input: {}, model: 'claude-opus-5-5', warnings: [] });
  assert.equal(ok.result.analysisType, 'critical_review');
  assert.ok(calls[1].messages[0].content.includes('前回の出力の問題'));
  setClientForTest(fakeClient([msg('bad'), msg('bad')]));
  await assert.rejects(runAi({ agent: 'review', input: {}, model: 'claude-opus-5-5', warnings: [] }), (e) => e.status === 502 && e.kind === 'invalid');
});

test('拒否・利用上限はそれぞれのエラーにする', async () => {
  setClientForTest(fakeClient([msg('', 'refusal')]));
  await assert.rejects(runAi({ agent: 'review', input: {}, model: 'claude-opus-5-5', warnings: [] }), (e) => e.status === 422);
  setClientForTest(fakeClient([new RateLimitError('429')]));
  await assert.rejects(runAi({ agent: 'review', input: {}, model: 'claude-opus-5-5', warnings: [] }), (e) => e.status === 429 && e.kind === 'limit');
});
