// 変革案件の操作（作成・更新・ステータス変更・複製・削除）
import { STORES, CHILD_STORES, STATUSES, labelOf } from '../constants.js';
import { createInitiative, normalizeInitiative, SUCCESS_FIELDS } from '../domain/initiative.js';
import { normalizeDecision, decideIntervention } from '../domain/intervention.js';
import { newId, nowIso } from '../domain/common.js';

const LOCK_STATUSES = ['running', 'verification', 'completed'];

export class InitiativeService {
  constructor(repo) {
    this.repo = repo;
  }

  async create(input) {
    return this.repo.save(STORES.initiatives, createInitiative(input));
  }

  /**
   * 案件の更新。成功条件が実行開始後に変更された場合は、変更内容を意思決定記録に残す
   * （実施後に都合のよい指標へ差し替えることを防ぐ）
   */
  async update(current, patch, reason = '') {
    const next = normalizeInitiative({ ...current, ...patch, updatedAt: nowIso() });
    const items = [{ store: STORES.initiatives, record: next }];
    if (current.successDefinitionLockedAt && patch.successDefinition) {
      const changed = SUCCESS_FIELDS.filter((f) => (current.successDefinition?.[f.key] || '') !== (next.successDefinition[f.key] || ''));
      if (changed.length) {
        items.push({
          store: STORES.decisionRecords,
          record: normalizeDecision({
            initiativeId: current.id,
            type: 'success_definition_change',
            title: '実行開始後の成功条件の変更',
            decision: changed.map((f) => `${f.label}：「${current.successDefinition?.[f.key] || '（空）'}」→「${next.successDefinition[f.key] || '（空）'}」`).join('\n'),
            reason: reason || '（理由未入力）',
          }),
        });
      }
    }
    const [saved] = await this.repo.saveMany(items);
    return saved;
  }

  async changeStatus(current, status, reason = '') {
    const patch = { status };
    if (LOCK_STATUSES.includes(status) && !current.successDefinitionLockedAt) patch.successDefinitionLockedAt = nowIso();
    const next = normalizeInitiative({ ...current, ...patch, updatedAt: nowIso() });
    const decision = normalizeDecision({
      initiativeId: current.id,
      type: 'status_change',
      title: 'ステータス変更',
      decision: `${labelOf(STATUSES, current.status)} → ${labelOf(STATUSES, status)}`,
      reason,
    });
    const [saved] = await this.repo.saveMany([
      { store: STORES.initiatives, record: next },
      { store: STORES.decisionRecords, record: decision },
    ]);
    return saved;
  }

  async setNextAction(current, text, source = 'user') {
    return this.update(current, { nextAction: text || null, nextActionSource: text ? source : null });
  }

  async setArchived(current, archived) {
    return this.update(current, { archived });
  }

  async decideIntervention(bundle, intervention, status, reason) {
    const { intervention: iv, decision } = decideIntervention(intervention, status, reason, bundle.interventions);
    await this.repo.saveMany([
      { store: STORES.interventions, record: iv },
      { store: STORES.decisionRecords, record: decision },
    ]);
    await this.repo.touch(bundle.initiative.id);
    return iv;
  }

  // 子データの保存（案件の更新日時も進める）
  async saveChild(store, record) {
    const saved = await this.repo.save(store, record);
    await this.repo.touch(record.initiativeId);
    return saved;
  }

  async removeChild(store, record) {
    await this.repo.remove(store, record.id);
    await this.repo.touch(record.initiativeId);
  }

  /** 案件を関連データごと複製する。ID を振り直し、案件内の参照も付け替える */
  async duplicate(bundle) {
    const { ops, initiativeId } = cloneBundleOps(bundle, { titleSuffix: '（複製）' });
    await this.repo.db.batch(ops);
    return initiativeId;
  }

  async remove(initiativeId) {
    return this.repo.deleteInitiative(initiativeId);
  }
}

// 参照を持つフィールド（ID の付け替え対象）
const REF_FIELDS = {
  hypotheses: ['supportingObservationIds'],
  interventions: ['targetHypothesisIds'],
  experimentPlans: ['interventionId'],
  metricDefinitions: ['planId'],
  metricObservations: ['metricId'],
  decisionRecords: ['subjectId'],
};

/**
 * バンドルを新しい ID で複製するための書き込み操作を作る（複製・インポートの「別案件として追加」で共用）
 */
export function cloneBundleOps(bundle, { titleSuffix = '' } = {}) {
  const idMap = new Map();
  const prefixOf = (id) => String(id).split('_')[0] || 'id';
  for (const r of [bundle.initiative, ...CHILD_STORES.flatMap((s) => bundle[s] || [])]) {
    idMap.set(r.id, newId(prefixOf(r.id)));
  }
  // バンドル外を指す参照はそのまま残す
  const remap = (id) => (id && idMap.has(id) ? idMap.get(id) : id);
  const t = nowIso();
  const newInitiative = {
    ...bundle.initiative,
    id: remap(bundle.initiative.id),
    title: bundle.initiative.title + titleSuffix,
    createdAt: t,
    updatedAt: t,
  };
  const ops = [{ type: 'put', store: STORES.initiatives, record: newInitiative }];
  for (const s of CHILD_STORES) {
    for (const r of bundle[s] || []) {
      const copy = { ...structuredClone(r), id: remap(r.id), initiativeId: newInitiative.id };
      for (const f of REF_FIELDS[s] || []) {
        copy[f] = Array.isArray(copy[f]) ? copy[f].map((x) => remap(x)) : remap(copy[f]);
      }
      ops.push({ type: 'put', store: s, record: copy });
    }
  }
  return { ops, initiativeId: newInitiative.id };
}
