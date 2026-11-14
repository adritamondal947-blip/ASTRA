import type { EnvironmentType } from '../components/EnvironmentCards';

export interface HazardProblem {
  id: string;
  label: string;
}

export interface SpaceflightHazard {
  id: string;
  name: string;
  contextLabel: string;
  problems: HazardProblem[];
  source: string;
}

export const SPACEFLIGHT_HAZARDS: SpaceflightHazard[] = [
  {
    id: 'radiation', name: 'Space Radiation', contextLabel: 'Radiation exposure',
    problems: [
      { id: 'radiation-exposure', label: 'I am concerned about a radiation exposure event' },
      { id: 'radiation-symptoms', label: 'I feel unwell after a suspected exposure' },
    ],
    source: 'https://www.nasa.gov/hrp/hazard-space-radiation/',
  },
  {
    id: 'isolation', name: 'Isolation & Confinement', contextLabel: 'Crew wellbeing',
    problems: [
      { id: 'sleep-disruption', label: 'Difficulty sleeping or keeping a sleep schedule' },
      { id: 'stress-mood', label: 'High stress or low mood' },
      { id: 'focus-team', label: 'Trouble focusing or getting along with the crew' },
    ],
    source: 'https://www.nasa.gov/hrp/hazard-isolation-and-confinement/',
  },
  {
    id: 'distance', name: 'Distance from Earth', contextLabel: 'Communication delay',
    problems: [
      { id: 'care-delay', label: 'I cannot get timely help from the ground team' },
      { id: 'supply-limit', label: 'I am concerned about limited medical supplies' },
      { id: 'remote-emergency', label: 'I need help managing a medical concern while remote' },
    ],
    source: 'https://www.nasa.gov/hrp/hazard-distance-from-earth/',
  },
  {
    id: 'gravity', name: 'Gravity Fields', contextLabel: 'Gravity environment',
    problems: [
      { id: 'balance-dizziness', label: 'Dizziness or balance difficulty' },
      { id: 'muscle-weakness', label: 'Muscle weakness or reduced strength' },
      { id: 'joint-bone-pain', label: 'Bone or joint discomfort' },
    ],
    source: 'https://www.nasa.gov/hrp/hazard-gravity-fields/',
  },
  {
    id: 'closed-environment', name: 'Hostile / Closed Environment', contextLabel: 'Habitat conditions',
    problems: [
      { id: 'air-breathing', label: 'Breathing discomfort or air-quality concern' },
      { id: 'temperature', label: 'Uncomfortable or unusual temperature' },
      { id: 'pressure-alarm', label: 'Pressure or life-support warning' },
      { id: 'noise-sleep', label: 'Noise or lighting is disrupting rest' },
    ],
    source: 'https://www.nasa.gov/hrp/hazard-hostile-closed-environments/',
  },
];

export const PROBLEM_GUIDANCE: Record<string, { title: string; actions: string[] }> = {
  'radiation-exposure': { title: 'Radiation exposure concern', actions: ['Follow the mission radiation-event procedure and move to the designated protected area if instructed.', 'Record the time and circumstances, then notify the mission medical and radiation teams.'] },
  'radiation-symptoms': { title: 'Feeling unwell after suspected exposure', actions: ['Report symptoms and the suspected exposure promptly to the mission medical team.', 'Follow crew medical instructions; this checklist cannot determine whether radiation caused the symptoms.'] },
  'sleep-disruption': { title: 'Sleep schedule difficulty', actions: ['Record sleep timing and how long the difficulty has been occurring.', 'Discuss persistent sleep disruption with the mission medical or behavioral health team.'] },
  'stress-mood': { title: 'Stress or low mood', actions: ['Consider using the crew check-in or peer-support process.', 'Contact the behavioral health or medical team if this persists or affects daily tasks.'] },
  'focus-team': { title: 'Focus or team difficulty', actions: ['Pause if safe, note when the difficulty occurs, and use the crew support process.', 'Raise persistent or safety-affecting concerns with the mission lead or behavioral health team.'] },
  'care-delay': { title: 'Delayed ground support', actions: ['Use the mission communication plan and onboard medical procedures for the current urgency.', 'If the situation may be urgent, notify the onboard medical lead immediately rather than waiting for a ground reply.'] },
  'supply-limit': { title: 'Medical supply concern', actions: ['Check the onboard inventory and mission-approved alternatives with the medical lead.', 'Record the item, quantity, and expected need so the crew can plan resupply or alternatives.'] },
  'remote-emergency': { title: 'Medical concern while remote', actions: ['Alert the onboard medical lead and follow the mission emergency procedure.', 'Prepare a concise report of symptoms, timing, measurements, and actions already taken for delayed consultation.'] },
  'balance-dizziness': { title: 'Dizziness or balance difficulty', actions: ['Stop hazardous movement or work and make the area safe.', 'Report onset and related symptoms to the medical team before resuming demanding activity.'] },
  'muscle-weakness': { title: 'Muscle weakness or reduced strength', actions: ['Record when it began and whether it affects routine tasks.', 'Discuss new or worsening weakness with the medical team before changing exercise or workload.'] },
  'joint-bone-pain': { title: 'Bone or joint discomfort', actions: ['Pause activity that worsens the discomfort and record its location and onset.', 'Ask the mission medical team to review persistent, severe, or movement-limiting pain.'] },
  'air-breathing': { title: 'Breathing or air-quality concern', actions: ['Move away from a suspected environmental source if safe and follow the habitat alarm procedure.', 'Notify the crew and life-support/medical leads promptly, especially if breathing is affected.'] },
  'temperature': { title: 'Unusual habitat temperature', actions: ['Check the habitat environmental display and follow the crew procedure for the affected zone.', 'Report symptoms such as feeling faint or unwell to the medical team.'] },
  'pressure-alarm': { title: 'Pressure or life-support warning', actions: ['Treat an active warning as an operational issue and follow the spacecraft emergency checklist.', 'Notify the crew and responsible life-support lead; do not rely on this prototype for emergency instructions.'] },
  'noise-sleep': { title: 'Noise or lighting affecting rest', actions: ['Record when the disturbance occurs and use approved sleep-environment adjustments if available.', 'Raise recurring disruption with the mission lead or medical/behavioral health team.'] },
};

function storageKey(profileId: string, environment: EnvironmentType) {
  return `astra_hazard_concerns:${profileId}:${environment}`;
}

export function getHazardConcerns(profileId: string, environment: EnvironmentType): string[] {
  if (!profileId || typeof localStorage === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey(profileId, environment)) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function saveHazardConcerns(profileId: string, environment: EnvironmentType, concernIds: string[]) {
  if (!profileId || typeof localStorage === 'undefined') return;
  localStorage.setItem(storageKey(profileId, environment), JSON.stringify(concernIds));
}
