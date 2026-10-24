// JSON バックアップ・復元、Markdown レポート、CSV 取り込み
import {
  APP_VERSION, SCHEMA_VERSION, STORES, CHILD_STORES, STATUSES, SOURCE_TYPES, CONFIDENCE,
  HYPOTHESIS_STATUSES, INTERVENTION_STATUSES, LEVEL3, OUTCOME_LEVELS, EXPERIMENT_DECISIONS,
  INTERVENTION_CATEGORIES, METRIC_PHASES, RESULT_CERTAINTY, LEARNING_PATTERNS, labelOf,
} from '../constants.js';
import { ENTITIES } from '../domain/entities.js';
import { compareMetric } from '../domain/experiment.js';
import { SUCCESS_FIELDS } from '../domain/initiative.js';
import { cloneBundleOps } from './initiativeService.js';

export const EXPORT_FORMAT = 'org-change-lab';

// ---------- JSON エクスポート ----------

export function buildExport(bundles) {
  const data = { initiatives: [] };
  for (const s of CHILD_STORES) data[s] = [];
  for (const b of bundles) {
    data.initiatives.push(b.initiative);
    for (const s of CHILD_STORES) data[s].push(...(b[s] || []));
  }
  return {
    format: EXPORT_FORMAT,
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    counts: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])),
    data,
  };
}

// ---------- JSON インポート（検証） ----------

/**
 * インポートファイルを検証する。1件でもエラーがあれば読み込みを中止する前提で、
 * エラー箇所（例：data.hypotheses[2].title）を返す。
 */
export function validateImport(json) {
  const errors = [];
  const err = (path, message) => errors.push({ path, message });
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    err('(root)', 'JSON オブジェクトではありません');
    return { ok: false, errors };
  }
  if (json.format !== EXPORT_FORMAT) err('format', `Org Change Lab のエクスポートファイルではありません（format: ${json.format ?? 'なし'}）`);
  if (typeof json.schemaVersion !== 'number') err('schemaVersion', 'スキーマバージョンがありません');
  else if (json.schemaVersion > SCHEMA_VERSION) err('schemaVersion', `このアプリより新しいスキーマ（v${json.schemaVersion}）です。アプリを更新してください`);
  const data = json.data;
  if (!data || typeof data !== 'object') {
    err('data', 'data がありません');
    return { ok: false, errors };
  }
  const out = {};
  const seen = new Map();
  const rawIndex = new Map();
  for (const store of [STORES.initiatives, ...CHILD_STORES]) {
    const rows = data[store] ?? [];
    if (!Array.isArray(rows)) { err(`data.${store}`, '配列ではありません'); continue; }
    out[store] = [];
    rows.forEach((raw, idx) => {
      const path = `data.${store}[${idx}]`;
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return err(path, 'オブジェクトではありません');
      if (typeof raw.id !== 'string' || !raw.id) return err(`${path}.id`, 'ID がありません');
      if (seen.has(raw.id)) return err(`${path}.id`, `ID「${raw.id}」がファイル内で重複しています（${seen.get(raw.id)}）`);
      seen.set(raw.id, path);
      const typeErr = checkTypes(store, raw);
      if (typeErr) return err(`${path}.${typeErr.field}`, typeErr.message);
      const ent = ENTITIES[store];
      const rec = ent.normalize(raw);
      const v = ent.validate(rec);
      for (const [field, message] of Object.entries(v)) err(`${path}.${field}`, message);
      rawIndex.set(rec, idx);
      out[store].push(rec);
    });
  }
  const initiativeIds = new Set((out.initiatives || []).map((i) => i.id));
  for (const s of CHILD_STORES) {
    (out[s] || []).forEach((r) => {
      if (!initiativeIds.has(r.initiativeId)) err(`data.${s}[${rawIndex.get(r)}].initiativeId`, `対応する変革案件（${r.initiativeId ?? 'なし'}）がファイル内にありません`);
    });
  }
  if (!errors.length && !(out.initiatives || []).length) err('data.initiatives', '変革案件が含まれていません');
  return { ok: errors.length === 0, errors, data: out };
}

// 正規化の前に、明らかな型の不一致を検出する（黙って変換しないため）
const STRING_FIELDS = ['title', 'content', 'name', 'role', 'problemStatement', 'description', 'summary'];
const ARRAY_FIELDS = ['scope', 'supportingObservationIds', 'targetHypothesisIds', 'expectedOutcomes', 'risks', 'whatWorked', 'whatDidNotWork', 'evidence'];
function checkTypes(store, raw) {
  for (const f of STRING_FIELDS) {
    if (f in raw && raw[f] !== null && typeof raw[f] !== 'string') return { field: f, message: `文字列である必要があります（${typeof raw[f]}）` };
  }
  for (const f of ARRAY_FIELDS) {
    if (f === 'scope' && store !== STORES.initiatives) continue;
    if (f in raw && raw[f] !== null && !Array.isArray(raw[f])) return { field: f, message: '配列である必要があります' };
  }
  if (store !== STORES.initiatives && typeof raw.initiativeId !== 'string') {
    return { field: 'initiativeId', message: '文字列である必要があります' };
  }
  for (const f of ['baselineValue', 'targetValue', 'value']) {
    if (f in raw && raw[f] !== null && typeof raw[f] !== 'number') return { field: f, message: '数値または null である必要があります' };
  }
  return null;
}

export function bundlesFromData(data) {
  return (data.initiatives || []).map((initiative) => {
    const b = { initiative };
    for (const s of CHILD_STORES) b[s] = (data[s] || []).filter((r) => r.initiativeId === initiative.id);
    return b;
  });
}

/** 既存データと ID が重なる案件を調べる */
export async function findConflicts(repo, data) {
  const conflicts = [];
  for (const i of data.initiatives) {
    const existing = await repo.get(STORES.initiatives, i.id);
    if (existing) conflicts.push({ id: i.id, title: i.title, existingTitle: existing.title, existingUpdatedAt: existing.updatedAt });
  }
  return conflicts;
}

/**
 * インポートの適用。decisions は { [initiativeId]: 'overwrite' | 'add_new' | 'skip' }。
 * 重複しない案件はそのまま追加する。
 */
export async function applyImport(repo, data, decisions = {}) {
  const result = { added: 0, overwritten: 0, skipped: 0 };
  for (const bundle of bundlesFromData(data)) {
    const id = bundle.initiative.id;
    const exists = await repo.get(STORES.initiatives, id);
    const mode = exists ? (decisions[id] || 'skip') : 'add';
    if (mode === 'skip') { result.skipped += 1; continue; }
    if (mode === 'add_new') {
      const { ops } = cloneBundleOps(bundle, { titleSuffix: '（インポート）' });
      await repo.db.batch(ops);
      result.added += 1;
      continue;
    }
    if (mode === 'overwrite') await repo.deleteInitiative(id);
    const ops = [{ type: 'put', store: STORES.initiatives, record: bundle.initiative }];
    for (const s of CHILD_STORES) for (const r of bundle[s]) ops.push({ type: 'put', store: s, record: r });
    await repo.db.batch(ops);
    if (mode === 'overwrite') result.overwritten += 1; else result.added += 1;
  }
  return result;
}

// ---------- Markdown レポート ----------

const NA = '未評価';
const UNCONFIRMED = '未確認';
const list = (items, empty = UNCONFIRMED) => (items && items.length ? items.map((x) => `- ${x}`).join('\n') : `- ${empty}`);
const val = (v, empty = UNCONFIRMED) => (v === null || v === undefined || String(v).trim() === '' ? empty : String(v));

export function toMarkdown(bundle) {
  const i = bundle.initiative;
  const obs = bundle.observations || [];
  const hyps = bundle.hypotheses || [];
  const ivs = bundle.interventions || [];
  const plans = bundle.experimentPlans || [];
  const metrics = bundle.metricDefinitions || [];
  const mobs = bundle.metricObservations || [];
  const learnings = bundle.learningRecords || [];
  const decisions = bundle.decisionRecords || [];
  const hypTitle = (id) => hyps.find((h) => h.id === id)?.title || id;
  const adopted = ivs.filter((v) => v.status === 'adopted');
  const notAdopted = ivs.filter((v) => v.status !== 'adopted');
  const L = [];

  L.push(`# ${i.title}`, '');
  L.push(`- ステータス：${labelOf(STATUSES, i.status)}`);
  L.push(`- 対象：${i.scope.join('、') || UNCONFIRMED}`);
  L.push(`- 開始日：${val(i.startDate)}`);
  L.push(`- 出力日時：${new Date().toLocaleString('ja-JP')}`);
  L.push('', '> 本レポートは Org Change Lab から出力しました。未入力の項目は「未評価」「未確認」と表示し、AIによる推測で補完していません。', '');

  L.push('## 1. 背景', '', val(i.background), '', `事業・プロダクトとの関係：${val(i.businessContext)}`, '');
  L.push('## 2. 解決したい問題', '', val(i.problemStatement), '');
  L.push(`- 何が起きているか：${val(i.problemDetail.what)}`);
  L.push(`- いつから：${val(i.problemDetail.since)}`);
  L.push(`- 範囲：${val(i.problemDetail.extent)}`);
  L.push(`- 影響：${val(i.problemDetail.impact)}`);
  L.push('', `期待する状態：${val(i.desiredState)}`, '');

  L.push('## 3. 観測された事実', '');
  if (!obs.length) L.push(`- ${UNCONFIRMED}`);
  for (const o of obs) {
    L.push(`- **[事実]** ${o.content}（情報源：${labelOf(SOURCE_TYPES, o.sourceType)}${o.sourceDescription ? `／${o.sourceDescription}` : ''}、確度：${labelOf(CONFIDENCE, o.confidence)}${o.observedAt ? `、${o.observedAt}` : ''}）`);
    if (o.interpretation) L.push(`  - [解釈] ${o.interpretation}`);
  }
  L.push('');

  L.push('## 4. 原因仮説', '');
  if (!hyps.length) L.push(`- ${UNCONFIRMED}`);
  for (const h of hyps) {
    L.push(`### [仮説] ${h.title}（${labelOf(HYPOTHESIS_STATUSES, h.status)}）`, '');
    if (h.description) L.push(h.description, '');
    L.push(`- 根拠となる事実：${h.supportingObservationIds.map((id) => obs.find((o) => o.id === id)?.content || id).join(' ／ ') || '未確認'}`);
    L.push(`- 反証材料：${h.counterEvidence.join(' ／ ') || 'なし（未確認）'}`);
    L.push(`- 不足している情報：${h.missingInformation.join(' ／ ') || UNCONFIRMED}`);
    L.push(`- 確認方法：${val(h.verificationMethod)}`);
    L.push(`- ユーザーの判断：${val(h.userAssessment, '判断なし')}${h.assessmentReason ? `（理由：${h.assessmentReason}）` : ''}`);
    if (h.origin === 'ai') L.push('- ※AIの提案をもとに登録した仮説');
    L.push('');
  }

  L.push('## 5. 採用した介入案', '');
  if (!adopted.length) L.push(`- ${NA}（採用した介入案はまだありません）`);
  for (const v of adopted) {
    L.push(`### ${v.title}`, '');
    L.push(`- カテゴリ：${labelOf(INTERVENTION_CATEGORIES, v.category)}`);
    L.push(`- 対象仮説：${v.targetHypothesisIds.map(hypTitle).join('、') || UNCONFIRMED}`);
    L.push(`- 内容：${val(v.description)}`);
    L.push(`- 期待する成果：${v.expectedOutcomes.join('、') || UNCONFIRMED}`);
    L.push(`- 実施コスト：${labelOf(LEVEL3, v.costEstimate)}／可逆性：${labelOf(LEVEL3, v.reversibility)}`);
    L.push(`- 想定リスク：${v.risks.join('、') || UNCONFIRMED}`);
    L.push(`- 検証方法：${val(v.verificationPlan)}`);
    L.push(`- 中止条件：${v.stopConditions.join('、') || UNCONFIRMED}`, '');
  }

  L.push('## 6. 採用理由と却下した案', '');
  for (const v of adopted) L.push(`- 採用「${v.title}」：${val(v.decisionReason, '理由未記録')}`);
  for (const v of notAdopted) L.push(`- ${labelOf(INTERVENTION_STATUSES, v.status)}「${v.title}」：${val(v.decisionReason, '理由未記録')}`);
  if (!ivs.length) L.push(`- ${NA}`);
  L.push('');

  L.push('## 7. 実行計画', '');
  if (!plans.length) L.push(`- ${NA}`);
  for (const p of plans) {
    L.push(`### ${p.title}`, '');
    L.push(`- 対象範囲：${val(p.scope)}`);
    L.push(`- 期間：${val(p.startDate)} 〜 検証予定 ${val(p.reviewDate)}`);
    L.push(`- 実施責任者：${val(p.owner)}／協力者：${p.collaborators.join('、') || UNCONFIRMED}`);
    L.push('- 実施手順：', list(p.steps).replace(/^/gm, '  '));
    L.push('- 成功条件：', list(p.successCriteria).replace(/^/gm, '  '));
    L.push('- 中止・修正条件：', list(p.stopConditions).replace(/^/gm, '  '), '');
  }
  L.push('#### 施策実施前に定義した成功条件', '');
  for (const f of SUCCESS_FIELDS) L.push(`- ${f.label}：${val(i.successDefinition[f.key])}`);
  if (i.successDefinitionLockedAt) L.push(`- （実行開始時点：${i.successDefinitionLockedAt.slice(0, 10)}。以降の変更は意思決定記録に残しています）`);
  L.push('');

  L.push('## 8. 期待する行動変化', '');
  L.push(val(i.expectation.behaviorChanges || i.successDefinition.behaviorChange));
  for (const v of adopted) L.push(`- ${v.title}：${val(v.expectedBehaviorChange)}`);
  L.push('');

  L.push('## 9. 評価指標', '');
  if (!metrics.length) L.push(`- ${NA}`);
  for (const lv of OUTCOME_LEVELS) {
    const ms = metrics.filter((m) => m.level === lv.value);
    if (!ms.length) continue;
    L.push(`### ${lv.label}`, '');
    for (const m of ms) {
      L.push(`- **${m.name}**${m.definedAfterStart ? '（実行開始後に追加）' : ''}：${val(m.description, '')}`);
      L.push(`  - 測定方法：${val(m.measurementMethod)}／データソース：${val(m.dataSource)}／期間：${val(m.period)}`);
      L.push(`  - 目標：${m.targetValue ?? (m.target || '未設定')}`);
    }
    L.push('');
  }

  L.push('## 10. 実施結果', '');
  if (!metrics.length) L.push(`- ${NA}`);
  for (const m of metrics) {
    const c = compareMetric(m, mobs);
    const unit = m.unit ? ` ${m.unit}` : '';
    const before = c.before !== null ? `${c.before}${unit}` : (c.beforeNote || UNCONFIRMED);
    const after = c.after !== null ? `${c.after}${unit}` : (c.afterNote || NA);
    L.push(`- ${m.name}：実施前 ${before} → 実施後 ${after}${c.diff !== null ? `（差 ${c.diff > 0 ? '+' : ''}${c.diff}${unit}）` : ''}`);
  }
  L.push('');
  for (const p of plans) {
    const e = p.evaluation;
    L.push(`### 「${p.title}」の効果検証`, '');
    L.push(`- 実施状況：${val(e.implementation, NA)}`);
    L.push('- 観測された変化：', list(e.observedChanges, NA).replace(/^/gm, '  '));
    L.push('- 仮説を支持する情報：', list(e.supporting, NA).replace(/^/gm, '  '));
    L.push('- 仮説に反する情報：', list(e.contradicting, NA).replace(/^/gm, '  '));
    L.push('');
  }

  L.push('## 11. 効果と限界', '');
  L.push('> 施策の実施前後に変化があったとしても、施策が変化の唯一の原因だとは限りません。', '');
  for (const p of plans) {
    const e = p.evaluation;
    L.push(`- 判断できること（${p.title}）：`, list(e.canConclude, NA).replace(/^/gm, '  '));
    L.push(`- 判断できないこと（${p.title}）：`, list(e.cannotConclude, NA).replace(/^/gm, '  '));
    L.push('- 外部要因・交絡要因：', list(e.confounders, NA).replace(/^/gm, '  '));
    L.push(`- 判断：${labelOf(EXPERIMENT_DECISIONS, e.decision)}${e.decisionReason ? `（${e.decisionReason}）` : ''}`);
  }
  if (!plans.length) L.push(`- ${NA}`);
  L.push('');

  L.push('## 12. 次の改善', '');
  const next = plans.flatMap((p) => p.evaluation.nextVerification);
  L.push(list([...(i.nextAction ? [`次の行動：${i.nextAction}`] : []), ...next, ...i.openQuestions.map((q) => `未解決の論点：${q}`)], NA));
  L.push('');

  L.push('## 13. 得られた学び', '');
  if (!learnings.length) L.push(`- ${NA}`);
  for (const l of learnings) {
    L.push(`### ${l.title}（${labelOf(LEARNING_PATTERNS, l.pattern)}／${labelOf(RESULT_CERTAINTY, l.resultCertainty)}）`, '');
    L.push(l.summary, '');
    L.push('- うまくいったこと：', list(l.whatWorked, NA).replace(/^/gm, '  '));
    L.push('- うまくいかなかったこと：', list(l.whatDidNotWork, NA).replace(/^/gm, '  '));
    L.push('- 証拠：', list(l.evidence, UNCONFIRMED).replace(/^/gm, '  '));
    L.push('- 再利用できる条件：', list(l.reusableConditions, NA).replace(/^/gm, '  '));
    L.push('- 適用時の注意点：', list(l.cautions, NA).replace(/^/gm, '  '), '');
  }

  if (decisions.length) {
    L.push('## 付録：意思決定の記録', '');
    for (const d of decisions) L.push(`- ${d.decidedAt} ${d.title}：${d.decision.replace(/\n/g, ' ／ ')}${d.reason ? `（理由：${d.reason}）` : ''}`);
    L.push('');
  }
  return L.join('\n');
}

// ---------- CSV ----------

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let k = 0; k < src.length; k += 1) {
    const ch = src[k];
    if (quoted) {
      if (ch === '"' && src[k + 1] === '"') { cell += '"'; k += 1; } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[k + 1] === '\n') k += 1;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const PHASE_ALIASES = { before: 'before', 実施前: 'before', during: 'during', 実施中: 'during', after: 'after', 実施後: 'after' };
export const METRIC_CSV_HEADER = ['metric', 'phase', 'observedAt', 'value', 'note', 'source'];

/**
 * 指標の測定結果 CSV を検証し、保存できる行とエラー行に分ける。
 * 列：metric（指標名）, phase（before/during/after または 実施前/実施中/実施後）, observedAt, value, note, source
 */
export function parseMetricCsv(text, metrics, initiativeId) {
  const rows = parseCsv(text);
  if (!rows.length) return { records: [], errors: [{ line: 1, message: 'データがありません' }] };
  const header = rows[0].map((h) => h.trim());
  const idx = Object.fromEntries(METRIC_CSV_HEADER.map((h) => [h, header.indexOf(h)]));
  if (idx.metric < 0 || idx.phase < 0) {
    return { records: [], errors: [{ line: 1, message: `ヘッダーに metric と phase が必要です（${METRIC_CSV_HEADER.join(',')}）` }] };
  }
  const records = [];
  const errors = [];
  const ent = ENTITIES.metricObservations;
  rows.slice(1).forEach((r, n) => {
    const line = n + 2;
    const get = (k) => (idx[k] >= 0 ? (r[idx[k]] || '').trim() : '');
    const metric = metrics.find((m) => m.name === get('metric'));
    if (!metric) return errors.push({ line, message: `指標「${get('metric')}」が定義されていません` });
    const phase = PHASE_ALIASES[get('phase')];
    if (!phase) return errors.push({ line, message: `phase「${get('phase')}」は ${METRIC_PHASES.map((p) => p.value).join('/')} のいずれかにしてください` });
    const rawValue = get('value');
    if (rawValue && !Number.isFinite(Number(rawValue.replace(/[,%]/g, '')))) return errors.push({ line, message: `value「${rawValue}」は数値ではありません（定性的な記録は note 列へ）` });
    const rec = ent.normalize({ initiativeId, metricId: metric.id, phase, observedAt: get('observedAt'), value: rawValue, note: get('note'), source: get('source') || 'CSV取り込み' });
    const v = ent.validate(rec);
    if (Object.keys(v).length) return errors.push({ line, message: Object.values(v).join(' / ') });
    records.push(rec);
  });
  return { records, errors };
}

export function toCsv(rows) {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(esc).join(',')).join('\n');
}

export function initiativesCsv(initiatives) {
  return toCsv([
    ['id', 'title', 'status', 'scope', 'nextAction', 'startDate', 'updatedAt'],
    ...initiatives.map((i) => [i.id, i.title, labelOf(STATUSES, i.status), i.scope.join(' / '), i.nextAction || '', i.startDate || '', i.updatedAt]),
  ]);
}
