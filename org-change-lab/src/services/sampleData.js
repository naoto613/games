// サンプルデータ（設計書 3.2 の利用シーン A〜C）。実際の実績値ではない
import { STORES } from '../constants.js';
import { ENTITIES } from '../domain/entities.js';
import { createInitiative } from '../domain/initiative.js';

function daysFromToday(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

let clock = 0;
function bundleBuilder(initiativeInput) {
  const initiative = createInitiative({ ...initiativeInput, isSample: true });
  const ops = [{ type: 'put', store: STORES.initiatives, record: initiative }];
  const base = Date.now() - 60000;
  const add = (store, input) => {
    // 登録順に並ぶよう、作成日時を1件ずつずらす
    clock += 1;
    const rec = ENTITIES[store].normalize({ ...input, initiativeId: initiative.id, createdAt: new Date(base + clock * 10).toISOString() });
    ops.push({ type: 'put', store, record: rec });
    return rec;
  };
  return { initiative, ops, add };
}

export function buildSampleOps() {
  const all = [];

  // ---- ケースA：CRMチームの自律性を高める ----
  {
    const { ops, add } = bundleBuilder({
      title: '【サンプル】CRMチームの自律性向上',
      problemStatement: 'CRMチームが施策の実装を中心に動いており、顧客課題を起点とする改善提案が少ない。',
      desiredState: 'メンバーが課題仮説・成功指標・改善案を提案し、チームで優先順位を議論できる。',
      scope: ['CRM'],
      businessContext: '求職者CRMの価値向上',
      status: 'preparation',
      startDate: daysFromToday(-30),
      targetReviewDate: daysFromToday(45),
      background: 'リーダーが施策の方向性や優先順位を考えることが多く、リーダーの負荷とチームの成長の両面で課題がある。',
      openQuestions: ['改善提案が少ない原因は何か', '成功指標を誰が定義しているか', '施策の振り返りはどのように行われているか'],
      problemDetail: {
        what: 'チームの定例で出る議題の多くが実装の進捗で、顧客課題や施策の成果についての提案が少ない',
        since: '少なくとも直近2四半期',
        extent: 'CRMチームの施策企画・振り返り',
        impact: '施策の優先順位づけがリーダーに集中し、施策の改善判断が遅れる',
      },
      expectation: {
        improvedWhen: '企画段階でメンバーが顧客課題と成功指標を提示し、チームで議論している',
        behaviorChanges: 'メンバー起点の改善提案が増える／リーダーが方向性を一人で決める場面が減る',
        businessContribution: 'CRM施策の成果指標の改善',
      },
      successDefinition: {
        problem: '施策の企画と成功指標の定義がリーダーに集中している',
        currentState: '直近の施策では成功指標が実装着手後に決まった',
        behaviorChange: 'メンバーが着手前に顧客課題と成功指標を提示する',
        expectedOutcome: '施策の振り返りと次の改善判断がしやすくなる',
        measurement: '着手前の成功指標定義率、メンバー起点の提案数、振り返りの実施有無',
        period: '次の2施策（約6週間）',
        sideEffects: '企画時の入力負担が増える／形式的な記入になる',
        stopConditions: '企画にかかる時間が大きく増え、メンバーから負担が大きいと複数の声が出た場合はテンプレートを簡素化する',
      },
      agreements: {
        jointDecisions: ['施策の優先順位（CRMリーダーとメンバーで議論）'],
        delegatedDecisions: ['担当施策の成功指標案の作成（担当メンバー）'],
        decisionProcess: '企画レビューで担当メンバーが提案し、リーダーは問いかけ役に回る',
        agreedItems: [],
      },
    });
    const o1 = add('observations', { content: '直近の施策では、成功指標が実装着手後に決まった', interpretation: '施策の成功を共通の基準で評価できていない可能性がある', sourceType: 'document', sourceDescription: '施策の振り返り記録', observedAt: daysFromToday(-20), confidence: 'medium', status: 'observed' });
    const o2 = add('observations', { content: '直近の定例の議題の大半が実装進捗の確認だった', sourceType: 'observation', sourceDescription: 'チーム定例の議事録', observedAt: daysFromToday(-14), confidence: 'high', status: 'observed' });
    const o3 = add('observations', { content: 'メンバーから「施策の背景になった顧客データがどこにあるか分からない」という声があった', sourceType: 'interview', sourceDescription: '1on1', observedAt: daysFromToday(-10), confidence: 'low', status: 'reported' });
    const hA = add('hypotheses', { title: '顧客課題に関する情報が不足している', description: 'メンバーが施策の背景、顧客課題、過去の成果データを参照できていない', supportingObservationIds: [o3.id], missingInformation: ['メンバーが施策の背景、顧客課題、過去の成果データを参照できるか'], verificationMethod: '直近の施策を対象に、企画時点で参照した情報を確認する', priority: 'high', status: 'testing', lens: 'information' });
    const hB = add('hypotheses', { title: '提案しても意思決定に参加できない', description: '提案が採否の議論の場に乗らず、提案する動機が弱まっている', missingInformation: ['メンバーが過去に改善案を提案した事例と、その採否の経緯'], verificationMethod: '過去の意思決定を数件振り返り、提案がどのように扱われたか確認する', priority: 'medium', status: 'unverified', lens: 'decision' });
    const hC = add('hypotheses', { title: '成功指標を定義するタイミングが遅い', description: '施策の目的と評価方法が着手前に合意されていない', supportingObservationIds: [o1.id, o2.id], missingInformation: ['過去の施策で指標を定義したタイミング'], verificationMethod: '過去3施策の企画・着手・振り返り記録を比較する', priority: 'high', status: 'supported', userAssessment: '採用する', assessmentReason: '振り返り記録で着手後に指標が決まった事例を確認できたため。ただし件数は少ない', lens: 'process' });
    const ivA = add('interventions', { title: '施策企画時の仮説・指標定義を標準化', category: 'process', description: '企画テンプレートに「顧客課題」「仮説」「成功指標」「中止条件」を入れ、着手前レビューで担当メンバーが説明する', targetHypothesisIds: [hC.id, hA.id], expectedBehaviorChange: '着手前に顧客課題と成功指標が定義される', expectedOutcomes: ['施策の振り返りが容易になる', '次の施策の改善判断ができる'], costEstimate: 'medium', risks: ['企画時の入力負担が増える', '形式的な記入になる'], reversibility: 'high', verificationPlan: '次の2施策で試行し、実施後に振り返る', stopConditions: ['入力負担が大きいという声が複数出た場合は項目を減らす'], scale: 'small_experiment', ratings: { effect: 'medium', cost: 'medium', risk: 'low', ease: 'high', verifiability: 'high' }, status: 'adopted', decisionReason: '小さく試せ、元に戻しやすい。「成功指標を定義するタイミングが遅い」の検証にもなる' });
    const ivB = add('interventions', { title: 'メンバーが企画から振り返りまで担当', category: 'delegation', description: '1施策を1メンバーが企画・指標定義・振り返りまで通して担当し、リーダーは相談役に回る', targetHypothesisIds: [hB.id], expectedBehaviorChange: 'メンバーが施策の優先順位と成果を自分の言葉で説明する', expectedOutcomes: ['メンバーの事業理解が深まる'], costEstimate: 'high', risks: ['担当者の負荷が偏る', '短期的に施策の質が下がる可能性'], reversibility: 'medium', verificationPlan: '担当施策の振り返りで、判断の根拠を説明できたかを確認する', stopConditions: ['担当者の残業が継続的に増えた場合'], scale: 'structural_change', ratings: { effect: 'high', cost: 'high', risk: 'medium', ease: 'low', verifiability: 'medium' }, status: 'on_hold', decisionReason: '「提案しても意思決定に参加できない」の検証が済んでから判断する' });
    const ivC = add('interventions', { title: 'CRM・マーケ合同の優先順位決定を導入', category: 'collaboration', description: '月1回、CRMとマーケティングで施策の優先順位を合同で決める', targetHypothesisIds: [hB.id], expectedBehaviorChange: '優先順位の根拠が両チームで共有される', expectedOutcomes: ['手戻りの減少（不明）'], costEstimate: 'medium', risks: ['会議が増えるだけになる'], reversibility: 'high', verificationPlan: '不明', stopConditions: [], scale: 'structural_change', ratings: { effect: 'unknown', cost: 'medium', risk: 'medium', ease: 'medium', verifiability: 'low' }, status: 'rejected', decisionReason: '現時点では対応する原因仮説の根拠が弱く、会議の追加で終わる懸念がある' });
    const plan = add('experimentPlans', { interventionId: ivA.id, title: '施策企画テンプレートの試行', scope: 'CRMチームの次の2施策', startDate: daysFromToday(3), reviewDate: daysFromToday(45), owner: 'CRMリーダー', collaborators: ['担当メンバー（2名）', 'EM'], steps: ['企画テンプレートを用意する', '担当メンバーが着手前レビューで説明する', '施策終了後に振り返る'], successCriteria: ['2施策とも着手前に成功指標が定義されている', '担当メンバーが顧客課題を説明できる'], stopConditions: ['入力負担が大きいという声が複数出た場合は項目を減らす'] });
    const m1 = add('metricDefinitions', { planId: plan.id, level: 1, kind: 'quantitative', name: '着手前レビューの実施回数', measurementMethod: 'レビューの記録を数える', unit: '回', dataSource: '議事録', period: '試行期間' });
    const m2 = add('metricDefinitions', { planId: plan.id, level: 2, kind: 'quantitative', name: '着手前の成功指標定義率', description: '実装着手前に成功指標が定義されている対象施策の割合', measurementMethod: '対象施策の記録を確認し、定義済み件数を集計する', unit: '%', dataSource: '施策企画ドキュメント', period: '施策単位' });
    add('metricDefinitions', { planId: plan.id, level: 3, kind: 'qualitative', name: '振り返りでの改善判断のしやすさ', measurementMethod: '振り返り後に担当メンバーとリーダーに聞く', dataSource: '振り返りの記録' });
    add('metricDefinitions', { planId: plan.id, level: 4, kind: 'quantitative', name: '対象施策の成果指標', measurementMethod: '施策ごとに定義した指標を確認する', dataSource: 'CRMの分析ダッシュボード', notes: '短期間では測定できない可能性がある' });
    add('metricObservations', { metricId: m2.id, phase: 'before', value: null, note: '直近の施策では着手後に定義された（件数は未集計）', observedAt: daysFromToday(-20), source: '振り返り記録', reliability: 'low' });
    add('metricObservations', { metricId: m1.id, phase: 'before', value: 0, observedAt: daysFromToday(-5), source: '議事録', reliability: 'high' });
    add('stakeholders', { role: 'CRMリーダー', team: 'CRM', goals: ['施策の成果を出す'], constraints: ['今期の施策リリース日程が決まっている'], concerns: ['企画に時間がかかりリリースが遅れること'], knownOpinion: '試行には前向き', opinionConfirmed: true, decisionRights: 'CRM施策の優先順位' });
    add('stakeholders', { role: 'CRMメンバー', team: 'CRM', goals: ['担当施策を期限内に出す'], constraints: ['実装タスクが多い'], concerns: [], opinionConfirmed: false });
    for (const [iv, label] of [[ivA, '採用'], [ivB, '保留'], [ivC, '却下']]) {
      add('decisionRecords', { type: 'intervention_decision', subjectId: iv.id, title: `介入案「${iv.title}」`, decision: label, reason: iv.decisionReason, decidedAt: daysFromToday(-3) });
    }
    add('decisionRecords', { type: 'hypothesis_assessment', subjectId: hC.id, title: '仮説「成功指標を定義するタイミングが遅い」', decision: '支持された', reason: '振り返り記録で確認。ただし件数は少ない', decidedAt: daysFromToday(-7) });
    all.push(...ops);
  }

  // ---- ケースB：チーム間の共同意思決定改善 ----
  {
    const { ops, add } = bundleBuilder({
      title: '【サンプル】チーム間の共同意思決定改善',
      problemStatement: 'チームをまたぐ施策で、意思決定者や責任範囲が曖昧になる。',
      desiredState: '共同で決める事項と各チームに委ねる事項が明確で、横断施策の意思決定が滞らない。',
      scope: ['CRM', 'LINE連携', 'キャリアポータル'],
      businessContext: '求職者体験の全体最適',
      status: 'problem_discovery',
      startDate: daysFromToday(-5),
      nextAction: '関係者の制約を整理する',
      openQuestions: ['共通の事業課題は何か', '横断施策の意思決定者は誰か'],
    });
    add('observations', { content: '横断施策の仕様決定で、3チームの合意に複数回の会議が必要だった', sourceType: 'observation', sourceDescription: '横断施策の議事録', observedAt: daysFromToday(-12), confidence: 'medium' });
    add('stakeholders', { role: 'LINE連携チームのリーダー', team: 'LINE連携', goals: ['LINE経由の接点を増やす'], constraints: ['外部APIの仕様変更への対応'], opinionConfirmed: false });
    add('stakeholders', { role: 'キャリアポータルのPdM', team: 'キャリアポータル', goals: ['ポータルの利用継続率'], constraints: [], opinionConfirmed: false });
    all.push(...ops);
  }

  // ---- ケースC：Backlog運用の標準化を評価する ----
  {
    const { ops, add } = bundleBuilder({
      title: '【サンプル】Backlog課題テンプレートの効果検証',
      problemStatement: '共通の課題テンプレートを導入したが、仕様理解や手戻りが改善したか分からない。',
      desiredState: '着手前に仕様の不明点が解消され、仕様確認の往復が減る。',
      scope: ['CRM', 'LINE連携'],
      businessContext: '開発リードタイムの短縮',
      status: 'verification',
      startDate: daysFromToday(-60),
      successDefinitionLockedAt: new Date(Date.now() - 50 * 864e5).toISOString(),
      successDefinition: {
        problem: '仕様確認の往復が多く、着手までに時間がかかる',
        currentState: 'テンプレート導入前は課題の記述内容がばらばら',
        behaviorChange: '起票時に背景・受け入れ条件が書かれる',
        expectedOutcome: '仕様確認の往復と着手までの時間が減る',
        measurement: '課題あたりの仕様確認コメント数、起票から着手までの日数',
        period: '導入後4週間',
        sideEffects: '起票の手間が増える',
        stopConditions: '起票数が大きく減った場合は見直す',
      },
    });
    const ivX = add('interventions', { title: '共通課題テンプレートの導入', category: 'process', expectedBehaviorChange: '起票時に背景・受け入れ条件が書かれる', risks: ['記入が形式的になる'], verificationPlan: '導入前後4週間の比較', stopConditions: ['起票数が大きく減る'], status: 'adopted', decisionReason: '低コストで試せる', reversibility: 'high', costEstimate: 'low' });
    const plan = add('experimentPlans', { interventionId: ivX.id, title: '課題テンプレートの運用', scope: 'CRM・LINE連携の課題', startDate: daysFromToday(-50), reviewDate: daysFromToday(-2), owner: 'EM', successCriteria: ['仕様確認コメント数が減る'], status: 'done', evaluation: { implementation: 'テンプレートは導入された', observedChanges: ['受け入れ条件の記入率は上がった'], confounders: ['同時期に大型施策が終わり、課題の種類が変わった'], cannotConclude: ['手戻りの減少がテンプレートによるものか'] } });
    const m1 = add('metricDefinitions', { planId: plan.id, level: 2, kind: 'quantitative', name: '受け入れ条件の記入率', measurementMethod: '起票された課題を確認', unit: '%', dataSource: 'Backlog' });
    const m2 = add('metricDefinitions', { planId: plan.id, level: 3, kind: 'quantitative', name: '課題あたりの仕様確認コメント数', measurementMethod: '課題のコメントのうち仕様確認に当たるものを数える', unit: '件', dataSource: 'Backlog' });
    add('metricObservations', { metricId: m1.id, phase: 'before', value: 30, observedAt: daysFromToday(-55), source: 'Backlog（サンプル値）' });
    add('metricObservations', { metricId: m1.id, phase: 'after', value: 85, observedAt: daysFromToday(-3), source: 'Backlog（サンプル値）' });
    add('metricObservations', { metricId: m2.id, phase: 'before', value: 4.1, observedAt: daysFromToday(-55), source: 'Backlog（サンプル値）' });
    add('metricObservations', { metricId: m2.id, phase: 'after', value: 3.9, observedAt: daysFromToday(-3), source: 'Backlog（サンプル値）' });
    add('learningRecords', { title: 'フォーマットの統一だけでは仕様確認は減らなかった', summary: '記入率は上がったが、仕様確認の往復はほぼ変わらなかった（サンプル）。テンプレートそのものより、起票前の情報不足が残っている可能性がある。', targetProblem: '仕様確認の往復', intervention: '共通課題テンプレート', whatWorked: ['受け入れ条件の記入率は上がった'], whatDidNotWork: ['仕様確認コメント数はほぼ変化しなかった'], evidence: ['記入率と仕様確認コメント数の前後比較（サンプル値）'], limitations: ['課題の種類が変わった時期と重なった'], reusableConditions: ['記述の形式より情報の不足が原因の場合は、テンプレート以外の介入が必要'], cautions: ['記入率だけで効果を判断しない'], resultCertainty: 'partial', pattern: 'failure' });
    all.push(...ops);
  }
  return all;
}

export async function loadSampleData(repo) {
  const ops = buildSampleOps();
  await repo.db.batch(ops);
  return ops.filter((o) => o.store === STORES.initiatives).length;
}

