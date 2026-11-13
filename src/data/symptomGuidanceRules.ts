import type { SymptomRecord } from './measurementStore';

export interface DemonstrationGuidanceRule {
  actions: string[];
}

/** Temporary, non-clinical examples. Replace with reviewed, versioned sources when available. */
export const DEMONSTRATION_GUIDANCE_RULES: Record<SymptomRecord['severity'], DemonstrationGuidanceRule> = {
  Mild: { actions: ['Continue to observe and document the symptom.', 'Contact the mission medical team if it persists, worsens, or becomes concerning.'] },
  Moderate: { actions: ['Note when the discomfort began and what activity preceded it.', 'If it persists, worsens, or affects movement, contact the mission medical team.'] },
  Severe: { actions: ['Pause the activity associated with the symptom and record whether it changes.', 'Contact the mission medical team promptly and follow their instructions.'] },
};
