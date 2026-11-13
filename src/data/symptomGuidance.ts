import type { SymptomRecord } from './measurementStore';
import { DEMONSTRATION_GUIDANCE_RULES } from './symptomGuidanceRules';

export const DEMO_GUIDANCE_LABEL = 'DEMO GUIDANCE - NOT CLINICALLY VALIDATED';

export interface GeneratedSymptomGuidance {
  title: string;
  explanation: string;
  actions: string[];
}

/** Generation layer kept separate from the UI and rule dataset. */
export function generateSymptomGuidance(record: SymptomRecord): GeneratedSymptomGuidance {
  return {
    title: record.regionName + ' - ' + record.symptomType + ' (' + record.severity.toLowerCase() + ', ' + record.intensity + '/10)',
    explanation: 'This temporary demonstration rule responds only to the self-reported symptom and intensity. It is not a diagnosis or treatment recommendation.',
    actions: [...DEMONSTRATION_GUIDANCE_RULES[record.severity].actions],
  };
}
