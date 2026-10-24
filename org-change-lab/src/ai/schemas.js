// AI出力の JSON Schema（ブラウザとサーバーで共用）。
// Claude の構造化出力でも使えるよう、全オブジェクトを additionalProperties:false・全項目 required にしている。

const S = { type: 'string' };
const SA = { type: 'array', items: { type: 'string' } };
const en = (...values) => ({ type: 'string', enum: values });
const obj = (properties) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const arr = (items) => ({ type: 'array', items });

const LENS = en('role', 'decision', 'information', 'process', 'technology', 'capability', 'business');

export const SCHEMAS = {
  structure: obj({
    analysisType: en('root_cause_analysis'),
    summary: S,
    problemRedefinition: S,
    facts: SA,
    interpretations: SA,
    hypotheses: arr(obj({
      title: S,
      description: S,
      lens: LENS,
      evidence: SA,
      supportStatus: en('partially_supported_by_input', 'needs_verification', 'no_evidence'),
      missingInformation: SA,
      alternativeExplanations: SA,
      verificationMethod: S,
    })),
    structuralPerspectives: arr(obj({ lens: LENS, observation: S })),
    unknowns: SA,
    recommendedNextActions: SA,
    limitations: SA,
  }),
  review: obj({
    analysisType: en('critical_review'),
    summary: S,
    findings: arr(obj({
      issue: S,
      category: en('fact_interpretation_mix', 'reversed_causality', 'not_falsifiable', 'missing_alternative', 'individual_attribution', 'intervention_mismatch', 'other'),
      severity: en('high', 'medium', 'low'),
      target: S,
      requiredEvidence: S,
      suggestion: S,
    })),
    limitations: SA,
  }),
  intervention: obj({
    analysisType: en('intervention_design'),
    summary: S,
    uncertainty: S,
    interventions: arr(obj({
      title: S,
      category: en('role', 'decision', 'process', 'information', 'delegation', 'technology', 'collaboration', 'goals'),
      targetHypothesisRefs: SA,
      description: S,
      expectedBehaviorChange: S,
      expectedOutcomes: SA,
      cost: en('low', 'medium', 'high', 'unknown'),
      stakeholders: SA,
      risks: SA,
      reversibility: en('low', 'medium', 'high', 'unknown'),
      verificationMethod: S,
      stopConditions: SA,
      scale: en('small_experiment', 'structural_change'),
      shortTermEffect: S,
      longTermEffect: S,
    })),
    limitations: SA,
  }),
  stakeholder: obj({
    analysisType: en('stakeholder_analysis'),
    summary: S,
    basedOnConfirmedOpinions: { type: 'boolean' },
    stakeholders: arr(obj({
      role: S,
      interests: SA,
      concerns: SA,
      concernsAreSpeculative: { type: 'boolean' },
      questionsToConfirm: SA,
    })),
    jointDecisions: SA,
    delegatedDecisions: SA,
    decisionProcess: S,
    ifNoAgreement: SA,
    limitations: SA,
  }),
  verification: obj({
    analysisType: en('effect_verification'),
    summary: S,
    implementationStatus: S,
    expectedChanges: SA,
    observedChanges: SA,
    changeDetected: en('yes', 'no', 'mixed', 'insufficient_data'),
    supportingEvidence: SA,
    contradictingEvidence: SA,
    confounders: SA,
    canConclude: SA,
    cannotConclude: SA,
    options: arr(obj({ option: en('continue', 'modify', 'stop'), rationale: S })),
    nextVerification: SA,
    limitations: SA,
  }),
  learning: obj({
    analysisType: en('learning_extraction'),
    summary: S,
    title: S,
    problemStructure: S,
    effectiveInterventions: SA,
    effectiveConditions: SA,
    whatDidNotWork: SA,
    evidence: SA,
    applicableConditions: SA,
    cautions: SA,
    resultCertainty: en('confirmed', 'partial', 'unknown'),
    limitations: SA,
  }),
};
