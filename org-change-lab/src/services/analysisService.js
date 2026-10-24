// AI分析の実行と保存。AIの結果は保存前に必ずユーザーが確認する
import { STORES } from '../constants.js';
import { buildAgentInput, summarizeInput, scanSensitive } from '../ai/agents.js';
import { requestBackend, manualPrompt, parseManualResponse, AiError } from '../ai/aiClient.js';

export class AnalysisService {
  constructor(repo) {
    this.repo = repo;
  }

  /** 送信前の確認用：送る内容・要約・機密情報の警告 */
  prepare(agent, bundle, options = {}) {
    const input = buildAgentInput(agent, bundle, options);
    return {
      agent,
      input,
      summary: summarizeInput(agent, input),
      sensitive: scanSensitive(input),
      manualPrompt: manualPrompt(agent, input),
      size: new Blob([JSON.stringify(input)]).size,
    };
  }

  async runBackend(prepared, settings, signal) {
    if (settings.aiMode !== 'backend') throw new AiError('バックエンド経由のAI接続が無効です', { kind: 'config' });
    return requestBackend({ baseUrl: settings.backendUrl, agent: prepared.agent, input: prepared.input, model: settings.model, signal });
  }

  parseManual(prepared, text) {
    return parseManualResponse(prepared.agent, text, prepared.input);
  }

  async saveAnalysis({ initiativeId, agent, mode, model, result, warnings, userNote }) {
    const saved = await this.repo.save(STORES.aiAnalyses, {
      initiativeId, agent, mode, model, result, warnings, userNote, reviewedByUser: true,
    });
    await this.repo.touch(initiativeId);
    return saved;
  }
}
