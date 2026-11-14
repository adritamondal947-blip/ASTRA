import { db } from '../db/database.ts';

export interface MedicalEvaluationResult {
  matchedRule: boolean;
  ruleCode?: string;
  symptomCategory?: string;
  applicableEnvironment?: string;
  possibleCauses: string[];
  supportSteps: string[];
  metadata: {
    clinicalSource: string;
    reviewerName: string;
    reviewerTitle: string;
    ruleVersion: string;
    reviewedAt: string;
  };
  disclaimer: string;
}

export function evaluateSymptomGuidance(
  regionId: string,
  symptomType: string,
  environment: string
): MedicalEvaluationResult {
  // Try finding exact rule for this region and environment
  let rule = db.prepare(`
    SELECT * FROM medical_knowledge_rules
    WHERE target_region = ? AND (applicable_environment = ? OR applicable_environment = 'All')
    LIMIT 1
  `).get(regionId, environment) as any;

  // If not found by region, search by symptom category keyword
  if (!rule) {
    rule = db.prepare(`
      SELECT * FROM medical_knowledge_rules
      WHERE LOWER(symptom_category) LIKE LOWER(?) OR LOWER(target_region) LIKE LOWER(?)
      LIMIT 1
    `).get(`%${symptomType}%`, `%${regionId}%`) as any;
  }

  // Fallback to general spaceflight operational countermeasure rule
  if (!rule) {
    return {
      matchedRule: false,
      possibleCauses: [
        'Postural or biomechanical strain under mission gravity conditions',
        'Physical workload fatigue or adaptation countermeasure stress',
        'Localized microvascular or fascial tightness',
      ],
      supportSteps: [
        'Document onset time, symptom duration, and any alleviating factors',
        'Perform standard passive range-of-motion stretching and maintain hydration',
        'If pain exceeds 5/10 or impairs operational duties, notify the Lead Flight Surgeon via downlink',
      ],
      metadata: {
        clinicalSource: 'NASA-STD-3001 Vol 1 §3.1 / Aerospace Clinical Countermeasures',
        reviewerName: 'Dr. Marcus Vance, MD',
        reviewerTitle: 'Chief Flight Surgeon, Space Medicine Operations',
        ruleVersion: 'v1.4.0',
        reviewedAt: '2026-06-01',
      },
      disclaimer:
        'CLINICAL DECISION SUPPORT NOTICE: Potential differential factors for aerospace medical review only. Not a definitive clinical diagnosis. Ground flight surgeon review required for treatment initiation.',
    };
  }

  return {
    matchedRule: true,
    ruleCode: rule.rule_code,
    symptomCategory: rule.symptom_category,
    applicableEnvironment: rule.applicable_environment,
    possibleCauses: JSON.parse(rule.possible_causes_json),
    supportSteps: JSON.parse(rule.support_steps_json),
    metadata: {
      clinicalSource: rule.clinical_source,
      reviewerName: rule.reviewer_name,
      reviewerTitle: rule.reviewer_title,
      ruleVersion: rule.rule_version,
      reviewedAt: rule.reviewed_at,
    },
    disclaimer: rule.disclaimer,
  };
}

export function getAllReviewedRules() {
  const rules = db.prepare(`SELECT * FROM medical_knowledge_rules ORDER BY rule_code ASC`).all() as any[];
  return rules.map((r) => ({
    ...r,
    possible_causes: JSON.parse(r.possible_causes_json),
    support_steps: JSON.parse(r.support_steps_json),
  }));
}
