// アプリ全体で使う定数・選択肢。表示ラベルは必ずここから引く。

export const APP_VERSION = '1.0.0';
export const SCHEMA_VERSION = 1;
export const DB_NAME = 'org-change-lab';
export const DB_VERSION = 1;

export const STORES = {
  initiatives: 'initiatives',
  observations: 'observations',
  hypotheses: 'hypotheses',
  interventions: 'interventions',
  experimentPlans: 'experimentPlans',
  metricDefinitions: 'metricDefinitions',
  metricObservations: 'metricObservations',
  stakeholders: 'stakeholders',
  decisionRecords: 'decisionRecords',
  learningRecords: 'learningRecords',
  aiAnalyses: 'aiAnalyses',
  settings: 'settings',
};

// initiativeId で紐づく子データのストア
export const CHILD_STORES = [
  'observations', 'hypotheses', 'interventions', 'experimentPlans',
  'metricDefinitions', 'metricObservations', 'stakeholders',
  'decisionRecords', 'learningRecords', 'aiAnalyses',
];

export const STATUSES = [
  { value: 'problem_discovery', label: '問題整理中', desc: '問題と根拠を整理している' },
  { value: 'hypothesis_testing', label: '仮説検証中', desc: '原因仮説の妥当性を確認している' },
  { value: 'intervention_design', label: '施策設計中', desc: '介入案を比較し、実施方法を決めている' },
  { value: 'preparation', label: '実行準備中', desc: '実施内容・責任者・指標などを確定している' },
  { value: 'running', label: '実行中', desc: '施策を運用している' },
  { value: 'verification', label: '効果検証中', desc: '実施結果を測定・評価している' },
  { value: 'completed', label: '完了', desc: '取り組みを終了し、学びを記録した' },
  { value: 'on_hold', label: '保留', desc: '外部条件などにより一時停止している' },
  { value: 'cancelled', label: '中止', desc: '実施しない判断をした' },
];
export const ACTIVE_STATUSES = ['problem_discovery', 'hypothesis_testing', 'intervention_design', 'preparation', 'running', 'verification'];
export const CONFIRM_STATUSES = ['completed', 'cancelled'];

export const SOURCE_TYPES = [
  { value: 'interview', label: 'ヒアリング' },
  { value: 'document', label: '文書・記録' },
  { value: 'metric', label: '指標・データ' },
  { value: 'observation', label: '直接観察' },
  { value: 'other', label: 'その他' },
];

export const CONFIDENCE = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

export const OBSERVATION_STATUS = [
  { value: 'observed', label: '確認済み' },
  { value: 'reported', label: '伝聞（未確認）' },
];

export const HYPOTHESIS_STATUSES = [
  { value: 'unverified', label: '未検証' },
  { value: 'testing', label: '検証中' },
  { value: 'supported', label: '支持された' },
  { value: 'not_supported', label: '支持されなかった' },
  { value: 'pending', label: '判断保留' },
];

export const PRIORITY = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

export const STRUCTURAL_LENSES = [
  { value: 'role', label: '役割と責任範囲' },
  { value: 'decision', label: '意思決定' },
  { value: 'information', label: '情報流通' },
  { value: 'process', label: '開発プロセス' },
  { value: 'technology', label: '技術・システム依存' },
  { value: 'capability', label: '能力形成と権限委譲' },
  { value: 'business', label: '事業目標との接続' },
];

export const INTERVENTION_CATEGORIES = [
  { value: 'role', label: '役割・責任範囲の再設計' },
  { value: 'decision', label: '意思決定方法の変更' },
  { value: 'process', label: '開発プロセスの改善' },
  { value: 'information', label: '情報共有・可視化の改善' },
  { value: 'delegation', label: '権限委譲・育成' },
  { value: 'technology', label: '技術基盤・システム境界の改善' },
  { value: 'collaboration', label: '他チームとの協働方法の改善' },
  { value: 'goals', label: '目標・評価指標の変更' },
];

export const INTERVENTION_STATUSES = [
  { value: 'proposed', label: '検討中' },
  { value: 'adopted', label: '採用' },
  { value: 'on_hold', label: '保留' },
  { value: 'rejected', label: '却下' },
];

export const LEVEL3 = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
  { value: 'unknown', label: '不明' },
];

export const SCALES = [
  { value: 'small_experiment', label: '小さく試せる案' },
  { value: 'structural_change', label: '構造を大きく変える案' },
  { value: 'unknown', label: '不明' },
];

// 介入案比較の評価軸。good は「高いほど望ましいか」
export const RATING_AXES = [
  { key: 'effect', label: '効果', good: 'high' },
  { key: 'cost', label: 'コスト', good: 'low' },
  { key: 'risk', label: 'リスク', good: 'low' },
  { key: 'ease', label: '実施容易性', good: 'high' },
  { key: 'verifiability', label: '検証可能性', good: 'high' },
];

export const OUTCOME_LEVELS = [
  { value: 1, label: 'レベル1：実施', desc: '施策が実行されたか', example: '新しい施策企画レビューを3回実施した' },
  { value: 2, label: 'レベル2：行動変化', desc: 'メンバーや関係者の行動が変わったか', example: '企画段階でメンバーが顧客課題と成功指標を提示するようになった' },
  { value: 3, label: 'レベル3：開発・組織の成果', desc: '仕事の進め方やチームの能力に変化があったか', example: '仕様確認の往復が減少した' },
  { value: 4, label: 'レベル4：プロダクト・事業成果', desc: '顧客価値や事業指標に変化があったか', example: '対象施策の成果指標が改善した' },
];

export const METRIC_KINDS = [
  { value: 'quantitative', label: '定量' },
  { value: 'qualitative', label: '定性（観察記録）' },
];

export const METRIC_PHASES = [
  { value: 'before', label: '実施前' },
  { value: 'during', label: '実施中' },
  { value: 'after', label: '実施後' },
];

export const PLAN_STATUSES = [
  { value: 'planned', label: '計画中' },
  { value: 'running', label: '実施中' },
  { value: 'done', label: '実施完了' },
  { value: 'stopped', label: '中止' },
];

export const EXPERIMENT_DECISIONS = [
  { value: 'continue', label: '継続' },
  { value: 'modify', label: '修正して継続' },
  { value: 'stop', label: '中止' },
  { value: 'undecided', label: '未判断' },
];

export const RESULT_CERTAINTY = [
  { value: 'confirmed', label: '結果を確認済み' },
  { value: 'partial', label: '一部のみ確認' },
  { value: 'unknown', label: '結果未確認' },
];

export const LEARNING_PATTERNS = [
  { value: 'success', label: '成功パターン' },
  { value: 'failure', label: '失敗パターン' },
  { value: 'mixed', label: '条件付き' },
  { value: 'unknown', label: '判断できない' },
];

export const DECISION_TYPES = [
  { value: 'status_change', label: 'ステータス変更' },
  { value: 'hypothesis_assessment', label: '仮説の判断' },
  { value: 'intervention_decision', label: '介入案の判断' },
  { value: 'experiment_decision', label: '継続・修正・中止の判断' },
  { value: 'success_definition_change', label: '成功条件の変更' },
  { value: 'agreement', label: '関係者との合意' },
  { value: 'other', label: 'その他' },
];

export const AI_MODES = [
  { value: 'manual', label: 'コピー＆ペースト方式（APIキー不要）', desc: 'プロンプトをコピーして手元のAIに貼り付け、返ってきたJSONを貼り戻します。' },
  { value: 'backend', label: 'バックエンド経由（server/）', desc: 'APIキーをサーバー側の環境変数で管理し、AIを直接呼び出します。' },
  { value: 'off', label: 'AIを使わない', desc: 'AI機能を隠し、すべて手動で入力します。' },
];

export const DEFAULT_SETTINGS = {
  id: 'app',
  aiMode: 'manual',
  backendUrl: './api',
  model: 'claude-opus-5-5',
  schemaVersion: SCHEMA_VERSION,
};

export function labelOf(list, value, fallback = '未設定') {
  const found = list.find((o) => o.value === value);
  return found ? found.label : fallback;
}
