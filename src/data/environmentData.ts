import type { EnvironmentType } from '../components/EnvironmentCards';

export interface VitalMetric {
  current: number;
  baseline: number;
  unit: string;
  provenance: string;
}

export interface VitalSignsData {
  heartRate: VitalMetric;
  bloodOxygen: VitalMetric;
  bodyTemperature: VitalMetric;
  breathingRate: VitalMetric;
  bloodPressure: {
    systolic: number;
    diastolic: number;
    baselineSystolic: number;
    baselineDiastolic: number;
    unit: string;
    postureNote: string;
    provenance: string;
  };
}

export interface SleepMentalData {
  sleepDurationHours: number;
  sleepDurationMinutes: number;
  sleepGoalHours: number;
  sleepEfficiencyPct: number;
  sleepNote: string;
  energyLevelSelfReport: number; // out of 5
  energyBaseline: number; // out of 5
  currentMood: string;
  stressScorePct: number;
  cognitiveWorkloadPct: number;
  commDelayLabel: string;
  isolationProtocol: string;
  provenance: string;
}

export interface EnvironmentalExposureData {
  gravityLabel: string;
  gravityMps2: number;
  radiationDailyMsv: number;
  radiationCareerLimitPct: number;
  radiationTrend: string;
  dustParticulateLevel: string;
  dustIntegrityPct: number;
  cabinPressureKpa: number;
  cabinPressurePsi: number;
  ambientTempC: number;
  atmosphericO2Pct: number;
  co2LevelPct: number;
  hazardIndexTitle: string;
  hazardIndexDescription: string;
  provenance: string;
}

export interface HistoricalTrendDay {
  dayLabel: string;
  heartRate: number;
  sleepHours: number;
  radiationMsv: number;
  workloadScore: number;
}

export interface AnalyticsData {
  cardiovascularDriftPct: number;
  cardiovascularDriftLabel: string;
  sleepArchitecturePct: number;
  sleepArchitectureLabel: string;
  metabolicExpenditureKcal: number;
  muscleRetentionIndexPct: number;
  cardiovascularStabilityPct: number;
  boneJointIntegrityPct: number;
  cognitiveAcuityPct: number;
  cellularHydrationPct: number;
  boneJointNote: string;
  flightSurgeonNote: string;
  fourteenDayTrend: HistoricalTrendDay[];
}

export interface BodyAssessmentData {
  primaryFocusRegionId: 'knees' | 'ankles' | 'lower_back' | 'cervical_spine' | 'quadriceps';
  primaryFocusRegionName: string;
  secondaryFocusRegionId: string;
  secondaryFocusRegionName: string;
  defaultSymptomType: string;
  defaultSeverity: number;
  defaultNotes: string;
  defaultHotspotLabel: string;
  defaultHotspotSubtext: string;
  anatomicalContextExplanation: string;
}

export interface ActiveAlertData {
  severity: 'WATCH' | 'ADVISORY' | 'NORMAL';
  timestamp: string;
  headline: string;
  description: string;
  recommendedAction: string;
  actionScreen: string;
}

export interface ExerciseData {
  scheduledTime: string;
  prescription: string;
  routineTitle: string;
  notes: string;
}

export interface MedicalProtocol {
  id: string;
  tag: string;
  cadence: string;
  title: string;
  description: string;
  routineLinkText: string;
}

export interface ClinicalReferenceRow {
  condition: string;
  immediateCountermeasure: string;
  medicalKitPack: string;
  telemedicineEscalate: string;
}

export interface MissionReportItem {
  id: string;
  tag: string;
  timestamp: string;
  title: string;
  summary: string;
  category: 'weekly' | 'checkin' | 'eva' | 'dosimetry';
}

export interface PhaseOption {
  id: string;
  number: string;
  label: string;
}

export const PHASES_BY_ENV: Record<EnvironmentType, PhaseOption[]> = {
  Spacecraft: [
    { id: '0', number: '4', label: 'Launch' },
    { id: '1', number: '5', label: 'Orbit' },
    { id: '2', number: '6', label: 'Deep-space transit' },
    { id: '3', number: '7', label: 'Return' },
  ],
  Moon: [
    { id: '0', number: '1', label: 'Lunar transit' },
    { id: '1', number: '2', label: 'Lunar orbit' },
    { id: '2', number: '3', label: 'Lunar surface operations' },
    { id: '3', number: '4', label: 'Return transit' },
  ],
  Mars: [
    { id: '0', number: '1', label: 'Mars transit' },
    { id: '1', number: '2', label: 'Mars orbit' },
    { id: '2', number: '3', label: 'Mars surface operations' },
    { id: '3', number: '4', label: 'Return transit' },
  ],
};

export function getPhaseLabel(env: EnvironmentType, phaseId: string | null): string {
  const phases = PHASES_BY_ENV[env] || PHASES_BY_ENV.Spacecraft;
  const match = phases.find((p) => p.id === phaseId);
  return match ? match.label : phases[2]?.label || 'Operational Phase';
}

export interface EnvironmentMissionData {
  environment: EnvironmentType;
  environmentDisplayName: string;
  locationLabel: string;
  missionEpoch: string;
  commLinkStatus: string;
  commLinkDetails: string;
  phasePriorityTitle: string;
  phasePriorityText: string;
  overallHealthHeadline: string;
  overallHealthSubtext: string;
  todayHealthChecksComplete: number;
  todayHealthChecksTotal: number;
  nextHealthCheckMinutes: number;
  nextHealthCheckTitle: string;
  nextHealthCheckSubtext: string;
  dataProvenanceDisclaimer: string;

  vitals: VitalSignsData;
  sleepMental: SleepMentalData;
  environmental: EnvironmentalExposureData;
  body: BodyAssessmentData;
  analytics: AnalyticsData;
  activeAlert: ActiveAlertData;
  exercise: ExerciseData;
  protocols: MedicalProtocol[];
  clinicalReference: ClinicalReferenceRow[];
  reports: MissionReportItem[];
}

export const ENVIRONMENT_DATASETS: Record<EnvironmentType, EnvironmentMissionData> = {
  // =========================================================================
  // 1. SPACECRAFT / IN TRANSIT (0.00g Microgravity Transit)
  // =========================================================================
  Spacecraft: {
    environment: 'Spacecraft',
    environmentDisplayName: 'Spacecraft / In Transit',
    locationLabel: 'Spacecraft · Deep Space Cruise',
    missionEpoch: 'Flight Day 42 / 180',
    commLinkStatus: 'Optimal',
    commLinkDetails: 'Cislunar Relay · 0.4s light delay',
    phasePriorityTitle: 'MICROGRAVITY TRANSLATION',
    phasePriorityText: 'Reduced gravity: protect muscle, bone and sleep. Counteract cephalad fluid shift.',
    overallHealthHeadline: 'Attention needed',
    overallHealthSubtext: 'Mild postural fatigue on waking. Cephalad fluid shift adaptation steady.',
    todayHealthChecksComplete: 3,
    todayHealthChecksTotal: 5,
    nextHealthCheckMinutes: 28,
    nextHealthCheckTitle: '15:00 UTC · in 28 min (demo snapshot)',
    nextHealthCheckSubtext: 'Lower body negative pressure check + private well-being log',
    dataProvenanceDisclaimer: 'SIMULATED DATA SNAPSHOT: Illustrative scenario telemetry | Mission profile: Deep-space transit cruise',

    vitals: {
      heartRate: {
        current: 68,
        baseline: 65,
        unit: 'bpm',
        provenance: 'Simulated wearable PPG',
      },
      bloodOxygen: {
        current: 99,
        baseline: 98,
        unit: '%',
        provenance: 'Cabin pulse oximetry · nominal',
      },
      bodyTemperature: {
        current: 36.6,
        baseline: 36.6,
        unit: '°C',
        provenance: 'Tympanic sensor · nominal',
      },
      breathingRate: {
        current: 13,
        baseline: 14,
        unit: '/ min',
        provenance: 'Chest impedance telemetry',
      },
      bloodPressure: {
        systolic: 118,
        diastolic: 76,
        baselineSystolic: 116,
        baselineDiastolic: 74,
        unit: 'mmHg',
        postureNote: 'Seated microgravity restraint · 14:30 UTC',
        provenance: 'Oscillometric arm cuff · manual reading',
      },
    },

    sleepMental: {
      sleepDurationHours: 6,
      sleepDurationMinutes: 20,
      sleepGoalHours: 8,
      sleepEfficiencyPct: 82,
      sleepNote: 'Sleeping bag tether restraint. Microgravity nocturnal arousal: 2 events.',
      energyLevelSelfReport: 3,
      energyBaseline: 4,
      currentMood: 'Okay',
      stressScorePct: 28,
      cognitiveWorkloadPct: 42,
      commDelayLabel: '0.4s · Near-Earth DSN',
      isolationProtocol: 'Daily crew communal meal + 15 min earth audio sync.',
      provenance: 'Astronaut daily self-report log',
    },

    environmental: {
      gravityLabel: '0.00g · Microgravity',
      gravityMps2: 0.00,
      radiationDailyMsv: 0.42,
      radiationCareerLimitPct: 42,
      radiationTrend: 'Within standard deep-space transit career threshold (Permissible: 1.0 mSv/day).',
      dustParticulateLevel: '0.00 mg/m³ · Sterile cabin',
      dustIntegrityPct: 100,
      cabinPressureKpa: 101.3,
      cabinPressurePsi: 14.7,
      ambientTempC: 21.5,
      atmosphericO2Pct: 21.0,
      co2LevelPct: 0.28,
      hazardIndexTitle: 'DEEP-SPACE CRUISE HAZARD INDEX',
      hazardIndexDescription: 'Solar particle flux nominal. Zero micro-meteorite decompression alerts detected.',
      provenance: 'Environmental Control and Life Support System (ECLSS) telemetry',
    },

    body: {
      primaryFocusRegionId: 'lower_back',
      primaryFocusRegionName: 'Lumbar Spine',
      secondaryFocusRegionId: 'cervical_spine',
      secondaryFocusRegionName: 'Cervical Spine',
      defaultSymptomType: 'Stiffness',
      defaultSeverity: 3,
      defaultNotes: 'Axial de-loading intervertebral elongation (+3.1 cm expansion). Mild lower-back stiffness upon awakening.',
      defaultHotspotLabel: 'Lumbar spine',
      defaultHotspotSubtext: 'Axial de-loading relief ›',
      anatomicalContextExplanation: 'Absence of axial gravity removes compressive spinal load, leading to intervertebral disc hyper-hydration and expansion.',
    },

    analytics: {
      cardiovascularDriftPct: 2.4,
      cardiovascularDriftLabel: '+2.4% · Nominal',
      sleepArchitecturePct: 82.4,
      sleepArchitectureLabel: '82.4% · Watch',
      metabolicExpenditureKcal: 2510,
      muscleRetentionIndexPct: 96.8,
      cardiovascularStabilityPct: 98,
      boneJointIntegrityPct: 82,
      cognitiveAcuityPct: 96,
      cellularHydrationPct: 93,
      boneJointNote: 'Lumbar spine elongation monitoring active',
      flightSurgeonNote: 'Crew cardiovascular adaptations to microgravity transit remain within safe operating envelopes. Fluid shift adaptation stable.',
      fourteenDayTrend: [
        { dayLabel: 'D29', heartRate: 64, sleepHours: 7.2, radiationMsv: 0.40, workloadScore: 40 },
        { dayLabel: 'D30', heartRate: 65, sleepHours: 7.0, radiationMsv: 0.41, workloadScore: 42 },
        { dayLabel: 'D31', heartRate: 66, sleepHours: 6.8, radiationMsv: 0.43, workloadScore: 45 },
        { dayLabel: 'D32', heartRate: 65, sleepHours: 7.1, radiationMsv: 0.39, workloadScore: 38 },
        { dayLabel: 'D33', heartRate: 67, sleepHours: 6.5, radiationMsv: 0.42, workloadScore: 48 },
        { dayLabel: 'D34', heartRate: 68, sleepHours: 6.2, radiationMsv: 0.44, workloadScore: 50 },
        { dayLabel: 'D35', heartRate: 67, sleepHours: 6.7, radiationMsv: 0.41, workloadScore: 44 },
        { dayLabel: 'D36', heartRate: 66, sleepHours: 7.0, radiationMsv: 0.40, workloadScore: 41 },
        { dayLabel: 'D37', heartRate: 68, sleepHours: 6.4, radiationMsv: 0.42, workloadScore: 46 },
        { dayLabel: 'D38', heartRate: 69, sleepHours: 6.1, radiationMsv: 0.45, workloadScore: 52 },
        { dayLabel: 'D39', heartRate: 68, sleepHours: 6.5, radiationMsv: 0.43, workloadScore: 47 },
        { dayLabel: 'D40', heartRate: 67, sleepHours: 6.8, radiationMsv: 0.41, workloadScore: 43 },
        { dayLabel: 'D41', heartRate: 68, sleepHours: 6.3, radiationMsv: 0.42, workloadScore: 48 },
        { dayLabel: 'D42', heartRate: 68, sleepHours: 6.3, radiationMsv: 0.42, workloadScore: 46 },
      ],
    },

    activeAlert: {
      severity: 'WATCH',
      timestamp: '14:32 UTC',
      headline: 'Sleep below usual pattern & mild lumbar stiffness',
      description: '6 h 20 min logged. Plan a quiet wind-down; execute fetal decompression routine before rest restraint.',
      recommendedAction: 'Review safe actions',
      actionScreen: 'Medical Guidance',
    },

    exercise: {
      scheduledTime: '17:00 UTC',
      prescription: '30 min ARED heavy resistance + 10 min gentle spinal mobility',
      routineTitle: 'Microgravity Axial Loading & Posterior Chain Conditioning',
      notes: 'Use your mission-approved limits. Stop if paresthesia or acute nerve impingement develops.',
    },

    protocols: [
      {
        id: 'MED-SP-04',
        tag: 'ACTIVE RECOMMENDATION',
        cadence: 'DAILY',
        title: 'Lumbar Spinal Elongation Relief',
        description: 'Counteract intervertebral disc hyper-hydration caused by lack of axial gravity. Complete 10 minutes in fetal tuck posture before sleep restraint use.',
        routineLinkText: 'View routine ›',
      },
      {
        id: 'MED-SANS-02',
        tag: 'ROUTINE COUNTERMEASURE',
        cadence: 'POST-WAKE',
        title: 'Chorioretinal & Intracranial Pressure (SANS)',
        description: 'Maintain optimal lower-body negative pressure (LBNP) exposure for 20 minutes if subjective facial puffiness or nasal congestion is detected.',
        routineLinkText: 'View routine ›',
      },
      {
        id: 'MED-EVA-08',
        tag: 'MICROGRAVITY TRANSLATION',
        cadence: 'PRE-EVA',
        title: 'Pressurized Suit Shoulder & Forearm Conditioning',
        description: 'Warm-up forearm flexors, rotator cuffs, and thoracic spine for 15 minutes to prevent glove fatigue and impingement during spacewalk translation.',
        routineLinkText: 'View routine ›',
      },
    ],

    clinicalReference: [
      {
        condition: 'Microgravity Vestibular Adaptation (SAS)',
        immediateCountermeasure: 'Limit abrupt head rotations; align body to visual cues in cabin',
        medicalKitPack: 'Pack Alpha (Promethazine / Caff)',
        telemedicineEscalate: 'If vomiting lasts >24h',
      },
      {
        condition: 'Lumbar Musculoskeletal Tension',
        immediateCountermeasure: '10 min passive fetal decompression + core isometric hold',
        medicalKitPack: 'Pack Beta (Topical Warm Gel)',
        telemedicineEscalate: 'If radicular nerve pain develops',
      },
      {
        condition: 'Cephalad Fluid Redistribution & Nasal Congestion',
        immediateCountermeasure: '30 min LBNP suction chamber + saline nasal flush',
        medicalKitPack: 'Pack Gamma (Decongestant Spray)',
        telemedicineEscalate: 'If visual scotoma or blurriness',
      },
    ],

    reports: [
      {
        id: 'REP-FD42',
        tag: 'FD 42 · WEEKLY',
        timestamp: '14:30 UTC',
        title: 'Flight Surgeon Weekly Health & Acuity Review',
        summary: 'Comprehensive cardiovascular, cognitive, and nutritional status. Elena Ramirez confirmed operational nominal for upcoming translation maintenance.',
        category: 'weekly',
      },
      {
        id: 'REP-FD40',
        tag: 'FD 40 · CHECK-IN',
        timestamp: '09:15 UTC',
        title: 'Lumbar Spine Decompression Log & Symptom Evaluation',
        summary: 'Reported severity 3/10 lumbar stiffness on waking. Fetal tuck countermeasure executed; subsequent morning flexibility score improved by 14%.',
        category: 'checkin',
      },
      {
        id: 'REP-FD36',
        tag: 'FD 36 · EVA CLEARANCE',
        timestamp: '11:00 UTC',
        title: 'External Umbilical Translation Readiness & Physical Clearance',
        summary: 'Cardiovascular stress test pass. Shoulder and forearm strength within 98% nominal. Cleared for airlock translation umbilical check.',
        category: 'eva',
      },
      {
        id: 'REP-FD30',
        tag: 'FD 30 · DOSIMETRY',
        timestamp: '06:00 UTC',
        title: 'Deep-Space Galactic Cosmic Ray (GCR) Dosimetry Dossier',
        summary: 'Cumulative dosimeter assessment: 12.6 mSv over 30 days (0.42 mSv/day). Well below career threshold limits. Zero solar particle event spikes.',
        category: 'dosimetry',
      },
    ],
  },

  // =========================================================================
  // 2. LUNAR SURFACE (0.166g Partial Lunar Gravity Operations)
  // =========================================================================
  Moon: {
    environment: 'Moon',
    environmentDisplayName: 'Lunar Surface',
    locationLabel: 'Lunar Surface · Artemis Research Station',
    missionEpoch: 'Lunar Mission Day 14 / 30',
    commLinkStatus: 'Optimal',
    commLinkDetails: 'Direct Lunar-Earth DSN · 1.28s light delay',
    phasePriorityTitle: 'LUNAR SURFACE OPERATIONS',
    phasePriorityText: 'Surface work: protect joints (knees & ankles) and keep lunar dust outside.',
    overallHealthHeadline: 'Attention needed',
    overallHealthSubtext: 'Bilateral knee stiffness after surface rover traversal. Dust hygiene check pending.',
    todayHealthChecksComplete: 3,
    todayHealthChecksTotal: 5,
    nextHealthCheckMinutes: 23,
    nextHealthCheckTitle: '15:00 UTC · in 23 min (demo snapshot)',
    nextHealthCheckSubtext: 'Body check + private well-being check-in',
    dataProvenanceDisclaimer: 'SIMULATED DATA SNAPSHOT: Illustrative scenario telemetry | Mission profile: Artemis Lunar Research Habitat',

    vitals: {
      heartRate: {
        current: 74,
        baseline: 65,
        unit: 'bpm',
        provenance: 'Simulated biometric chest strap',
      },
      bloodOxygen: {
        current: 98,
        baseline: 98,
        unit: '%',
        provenance: 'Habitat atmospheric pulse oximeter',
      },
      bodyTemperature: {
        current: 36.8,
        baseline: 36.6,
        unit: '°C',
        provenance: 'Post-EVA tympanic sensor reading',
      },
      breathingRate: {
        current: 16,
        baseline: 14,
        unit: '/ min',
        provenance: 'Post-suit egress respiratory monitor',
      },
      bloodPressure: {
        systolic: 122,
        diastolic: 78,
        baselineSystolic: 116,
        baselineDiastolic: 74,
        unit: 'mmHg',
        postureNote: 'Seated lunar habitat rest · 14:30 UTC',
        provenance: 'Automated pressure cuff · manual check',
      },
    },

    sleepMental: {
      sleepDurationHours: 6,
      sleepDurationMinutes: 45,
      sleepGoalHours: 8,
      sleepEfficiencyPct: 84,
      sleepNote: 'Habitat berth sleep post-EVA. Sleep fragmentation from airlock repressurization cycle.',
      energyLevelSelfReport: 3,
      energyBaseline: 4,
      currentMood: 'Okay',
      stressScorePct: 38,
      cognitiveWorkloadPct: 58,
      commDelayLabel: '1.28s · Direct line-of-sight DSN',
      isolationProtocol: 'Lunar habitat crew synchronization + scheduled evening debrief.',
      provenance: 'Astronaut lunar surface daily log',
    },

    environmental: {
      gravityLabel: '0.166g · 1.62 m/s²',
      gravityMps2: 1.62,
      radiationDailyMsv: 0.38,
      radiationCareerLimitPct: 38,
      radiationTrend: 'Planetary mass shields 50% of sky GCR. Secondary neutrons monitored.',
      dustParticulateLevel: '0.04 mg/m³ · Airlock boundary',
      dustIntegrityPct: 99.4,
      cabinPressureKpa: 56.5,
      cabinPressurePsi: 8.2,
      ambientTempC: 22.0,
      atmosphericO2Pct: 34.0,
      co2LevelPct: 0.32,
      hazardIndexTitle: 'LUNAR RECONNAISSANCE HAZARD INDEX',
      hazardIndexDescription: 'Regolith particulate mitigation active. Lunar dust barrier integrity 99.4%. Solar particle flux nominal.',
      provenance: 'Artemis Station Life Support & Airlock Particulate Monitor',
    },

    body: {
      primaryFocusRegionId: 'knees',
      primaryFocusRegionName: 'Knees & Ankles',
      secondaryFocusRegionId: 'ankles',
      secondaryFocusRegionName: 'Ankles',
      defaultSymptomType: 'Stiffness',
      defaultSeverity: 3,
      defaultNotes: 'Mild bilateral patellar tendon tension after 4.2 km rover traverse and regolith slope ascent.',
      defaultHotspotLabel: 'Knees & ankles',
      defaultHotspotSubtext: 'Review comfort ›',
      anatomicalContextExplanation: 'Walking in 1/6th gravity requires continuous low-angle hopping and knee flexion inside stiff pressurized spacesuit joints.',
    },

    analytics: {
      cardiovascularDriftPct: 4.1,
      cardiovascularDriftLabel: '+4.1% · Elevated',
      sleepArchitecturePct: 84.2,
      sleepArchitectureLabel: '84.2% · Watch',
      metabolicExpenditureKcal: 2640,
      muscleRetentionIndexPct: 97.4,
      cardiovascularStabilityPct: 96,
      boneJointIntegrityPct: 79,
      cognitiveAcuityPct: 94,
      cellularHydrationPct: 91,
      boneJointNote: 'Knee & ankle joint load tracking active post-EVA',
      flightSurgeonNote: 'Crew cardiovascular adaptations to 1.62 m/s² lunar gravity remain within safe envelopes. Monitor joint strain post surface EVA.',
      fourteenDayTrend: [
        { dayLabel: 'L1', heartRate: 65, sleepHours: 7.4, radiationMsv: 0.36, workloadScore: 38 },
        { dayLabel: 'L2', heartRate: 66, sleepHours: 7.1, radiationMsv: 0.37, workloadScore: 42 },
        { dayLabel: 'L3', heartRate: 68, sleepHours: 6.9, radiationMsv: 0.38, workloadScore: 50 },
        { dayLabel: 'L4', heartRate: 70, sleepHours: 6.5, radiationMsv: 0.39, workloadScore: 62 },
        { dayLabel: 'L5', heartRate: 72, sleepHours: 6.3, radiationMsv: 0.38, workloadScore: 65 },
        { dayLabel: 'L6', heartRate: 69, sleepHours: 7.0, radiationMsv: 0.37, workloadScore: 48 },
        { dayLabel: 'L7', heartRate: 67, sleepHours: 7.2, radiationMsv: 0.36, workloadScore: 40 },
        { dayLabel: 'L8', heartRate: 71, sleepHours: 6.6, radiationMsv: 0.38, workloadScore: 58 },
        { dayLabel: 'L9', heartRate: 74, sleepHours: 6.4, radiationMsv: 0.40, workloadScore: 70 },
        { dayLabel: 'L10', heartRate: 70, sleepHours: 6.8, radiationMsv: 0.38, workloadScore: 54 },
        { dayLabel: 'L11', heartRate: 68, sleepHours: 7.1, radiationMsv: 0.37, workloadScore: 45 },
        { dayLabel: 'L12', heartRate: 73, sleepHours: 6.5, radiationMsv: 0.39, workloadScore: 66 },
        { dayLabel: 'L13', heartRate: 75, sleepHours: 6.2, radiationMsv: 0.41, workloadScore: 72 },
        { dayLabel: 'L14', heartRate: 74, sleepHours: 6.75, radiationMsv: 0.38, workloadScore: 60 },
      ],
    },

    activeAlert: {
      severity: 'WATCH',
      timestamp: '14:32 UTC',
      headline: 'Knee stiffness after surface activity',
      description: 'Pause strenuous work; check comfort and movement with onboard support.',
      recommendedAction: 'Review safe actions',
      actionScreen: 'Medical Guidance',
    },

    exercise: {
      scheduledTime: '17:00 UTC',
      prescription: '20 min supported strength + 10 min ankle mobility',
      routineTitle: 'Supported Lunar Joint Recovery & Ankle Mobility',
      notes: 'Use your mission-approved limits. Stop if unwell.',
    },

    protocols: [
      {
        id: 'LUN-MOB-01',
        tag: 'ACTIVE RECOMMENDATION',
        cadence: 'DAILY',
        title: 'Knee & Ankle Supported Mobility',
        description: 'Relieve patellofemoral pressure from lunar surface traverse. Perform 20 min non-supported strength + 10 min ankle mobility with onboard support.',
        routineLinkText: 'View routine ›',
      },
      {
        id: 'MED-SANS-02',
        tag: 'ROUTINE COUNTERMEASURE',
        cadence: 'POST-WAKE',
        title: 'Chorioretinal & Intracranial Pressure (SANS)',
        description: 'Maintain optimal lower-body negative pressure (LBNP) exposure for 20 minutes if subjective facial puffiness or nasal congestion is detected.',
        routineLinkText: 'View routine ›',
      },
      {
        id: 'MED-EVA-08',
        tag: 'LUNAR REGOLITH BARRIER',
        cadence: 'PRE-EVA',
        title: 'Dust Hygiene & Suit Ingress Safety',
        description: 'Follow three-stage airlock brush and electrostatic vacuum before suit doffing. Check skin barrier for regolith abrasion.',
        routineLinkText: 'View routine ›',
      },
    ],

    clinicalReference: [
      {
        condition: 'Regolith Inhalation Alert / Mucosal Irritation',
        immediateCountermeasure: 'Check airlock HEPA filtration; rinse nasal passages with sterile saline',
        medicalKitPack: 'Pack Alpha (Respiratory / Saline Wash)',
        telemedicineEscalate: 'If persistent bronchospasm >1h',
      },
      {
        condition: 'Knee / Ankle Tendon Stiffness',
        immediateCountermeasure: '15 min low-impact joint mobilization + compression sleeves',
        medicalKitPack: 'Pack Beta (Topical Warm Gel)',
        telemedicineEscalate: 'If acute localized joint effusion',
      },
      {
        condition: 'Electrostatic Skin Xerosis / Airlock Irritation',
        immediateCountermeasure: 'Apply barrier lipid ceramide cream post-hygiene wipe',
        medicalKitPack: 'Pack Gamma (Ceramide Ointment)',
        telemedicineEscalate: 'If open skin fissures occur',
      },
    ],

    reports: [
      {
        id: 'REP-LMD14',
        tag: 'LMD 14 · WEEKLY',
        timestamp: '14:30 UTC',
        title: 'Flight Surgeon Weekly Health & Acuity Review',
        summary: 'Comprehensive cardiovascular, cognitive, and nutritional status. Elena Ramirez confirmed operational nominal for upcoming Lunar Surface EVA.',
        category: 'weekly',
      },
      {
        id: 'REP-LMD12',
        tag: 'LMD 12 · CHECK-IN',
        timestamp: '09:15 UTC',
        title: 'Lunar Regolith Exposure & Joint Mobility Log',
        summary: 'Reported mild bilateral knee stiffness following 4.2 km regolith rover traverse. Supported ankle mobility executed; flexibility normalized.',
        category: 'checkin',
      },
      {
        id: 'REP-LMD11',
        tag: 'LMD 11 · EVA CLEARANCE',
        timestamp: '13:20 UTC',
        title: 'Surface Exploration Suit Pressurization & Joint Clearance',
        summary: 'Orthostatic tolerance test passed. Knee compression sleeve protocol certified. Cleared for 4-hour South Pole Shackleton Rim geological traverse.',
        category: 'eva',
      },
      {
        id: 'REP-LMD08',
        tag: 'LMD 08 · DOSIMETRY',
        timestamp: '08:45 UTC',
        title: 'Lunar Surface Albedo & Secondary Neutron Radiation Log',
        summary: 'Surface dosimeter readings stable at 0.38 mSv/day. Lunar regolith shielding reduces cosmic ray sky flux by 50%. Hab berm integrity confirmed.',
        category: 'dosimetry',
      },
    ],
  },

  // =========================================================================
  // 3. MARS SURFACE (0.380g Partial Martian Gravity & Long-Delay Isolation)
  // =========================================================================
  Mars: {
    environment: 'Mars',
    environmentDisplayName: 'Mars Surface',
    locationLabel: 'Mars Surface · Jezero Habitat Alpha',
    missionEpoch: 'Sol 84 / 450',
    commLinkStatus: 'Optimal',
    commLinkDetails: 'Deep Space Relay · 14m 22s one-way delay',
    phasePriorityTitle: 'MARS SURFACE OPERATIONS',
    phasePriorityText: 'Partial gravity (0.38g): monitor perchlorate dust isolation, Sol circadian sync, and 14-min comm latency.',
    overallHealthHeadline: 'Attention needed',
    overallHealthSubtext: 'Sol circadian phase adaptation active (+39m diurnal drift). Right Achilles tendon strain under observation.',
    todayHealthChecksComplete: 4,
    todayHealthChecksTotal: 5,
    nextHealthCheckMinutes: 35,
    nextHealthCheckTitle: '15:10 UTC · in 35 min (demo snapshot)',
    nextHealthCheckSubtext: 'Autonomous Sol sleep debrief + calf eccentric loading check',
    dataProvenanceDisclaimer: 'SIMULATED DATA SNAPSHOT: Illustrative scenario telemetry | Mission profile: Mars Jezero Station',

    vitals: {
      heartRate: {
        current: 71,
        baseline: 64,
        unit: 'bpm',
        provenance: 'Habitat biosensor telemetry',
      },
      bloodOxygen: {
        current: 98,
        baseline: 98,
        unit: '%',
        provenance: 'Habitat enriched O2 pulse oximeter',
      },
      bodyTemperature: {
        current: 36.7,
        baseline: 36.6,
        unit: '°C',
        provenance: 'Habitat biosensor continuous monitor',
      },
      breathingRate: {
        current: 14,
        baseline: 14,
        unit: '/ min',
        provenance: 'Thoracic bioimpedance feed',
      },
      bloodPressure: {
        systolic: 120,
        diastolic: 76,
        baselineSystolic: 118,
        baselineDiastolic: 74,
        unit: 'mmHg',
        postureNote: 'Seated Martian habitat rest · 14:30 UTC',
        provenance: 'Automated habitat cuff · manual log',
      },
    },

    sleepMental: {
      sleepDurationHours: 7,
      sleepDurationMinutes: 10,
      sleepGoalHours: 8,
      sleepEfficiencyPct: 88,
      sleepNote: 'Circadian adaptation to 24h 39m Sol diurnal cycle. Melatonin phase delay: +35 min.',
      energyLevelSelfReport: 4,
      energyBaseline: 4,
      currentMood: 'Feeling good',
      stressScorePct: 34,
      cognitiveWorkloadPct: 46,
      commDelayLabel: '14m 22s · Mars-Earth Delay',
      isolationProtocol: 'Autonomous clinical decision tree active. Peer-support crew debrief completed.',
      provenance: 'Astronaut autonomous Sol health log',
    },

    environmental: {
      gravityLabel: '0.380g · 3.72 m/s²',
      gravityMps2: 3.72,
      radiationDailyMsv: 0.54,
      radiationCareerLimitPct: 54,
      radiationTrend: 'GCR flux + thin atmospheric secondary radiation. Habitat regolith berm shielding nominal.',
      dustParticulateLevel: '0.02 mg/m³ · Perchlorate scrubbed',
      dustIntegrityPct: 99.8,
      cabinPressureKpa: 70.3,
      cabinPressurePsi: 10.2,
      ambientTempC: 21.0,
      atmosphericO2Pct: 32.0,
      co2LevelPct: 0.35,
      hazardIndexTitle: 'MARS SURFACE HABITAT HAZARD INDEX',
      hazardIndexDescription: 'Perchlorate chemical isolation active. Atmospheric pressure gradient stable. Cosmic ray shielding optimal.',
      provenance: 'Jezero Alpha ECLSS & Perchlorate Chemical Spectrometer',
    },

    body: {
      primaryFocusRegionId: 'ankles',
      primaryFocusRegionName: 'Right Achilles & Calves',
      secondaryFocusRegionId: 'quadriceps',
      secondaryFocusRegionName: 'Quadriceps',
      defaultSymptomType: 'Soreness',
      defaultSeverity: 3,
      defaultNotes: 'Calf eccentric deceleration fatigue from traversing rocky basalt slopes inside heavy pressurized Mars exploration suit.',
      defaultHotspotLabel: 'Achilles & Calves',
      defaultHotspotSubtext: 'Review mobility ›',
      anatomicalContextExplanation: 'Operating under 0.38g with a 85 kg environmental suit produces high eccentric loading on the gastrocnemius and Achilles tendon.',
    },

    analytics: {
      cardiovascularDriftPct: 1.8,
      cardiovascularDriftLabel: '+1.8% · Nominal',
      sleepArchitecturePct: 88.5,
      sleepArchitectureLabel: '88.5% · Optimal',
      metabolicExpenditureKcal: 2780,
      muscleRetentionIndexPct: 98.1,
      cardiovascularStabilityPct: 97,
      boneJointIntegrityPct: 86,
      cognitiveAcuityPct: 95,
      cellularHydrationPct: 94,
      boneJointNote: 'Partial axial loading (0.38g) preserves lower limb trabecular density',
      flightSurgeonNote: 'Crew adaptations to 3.72 m/s² Martian surface gravity and 24.6h Sol cycle are nominal. Long-delay autonomous telemetry validated.',
      fourteenDayTrend: [
        { dayLabel: 'Sol 71', heartRate: 63, sleepHours: 7.5, radiationMsv: 0.52, workloadScore: 40 },
        { dayLabel: 'Sol 72', heartRate: 64, sleepHours: 7.3, radiationMsv: 0.53, workloadScore: 44 },
        { dayLabel: 'Sol 73', heartRate: 66, sleepHours: 7.1, radiationMsv: 0.54, workloadScore: 48 },
        { dayLabel: 'Sol 74', heartRate: 68, sleepHours: 6.8, radiationMsv: 0.55, workloadScore: 55 },
        { dayLabel: 'Sol 75', heartRate: 67, sleepHours: 7.0, radiationMsv: 0.53, workloadScore: 50 },
        { dayLabel: 'Sol 76', heartRate: 65, sleepHours: 7.4, radiationMsv: 0.52, workloadScore: 42 },
        { dayLabel: 'Sol 77', heartRate: 68, sleepHours: 7.0, radiationMsv: 0.54, workloadScore: 52 },
        { dayLabel: 'Sol 78', heartRate: 70, sleepHours: 6.7, radiationMsv: 0.56, workloadScore: 60 },
        { dayLabel: 'Sol 79', heartRate: 71, sleepHours: 6.9, radiationMsv: 0.54, workloadScore: 58 },
        { dayLabel: 'Sol 80', heartRate: 69, sleepHours: 7.2, radiationMsv: 0.53, workloadScore: 49 },
        { dayLabel: 'Sol 81', heartRate: 67, sleepHours: 7.3, radiationMsv: 0.52, workloadScore: 44 },
        { dayLabel: 'Sol 82', heartRate: 72, sleepHours: 6.8, radiationMsv: 0.55, workloadScore: 64 },
        { dayLabel: 'Sol 83', heartRate: 70, sleepHours: 7.1, radiationMsv: 0.53, workloadScore: 51 },
        { dayLabel: 'Sol 84', heartRate: 71, sleepHours: 7.17, radiationMsv: 0.54, workloadScore: 46 },
      ],
    },

    activeAlert: {
      severity: 'WATCH',
      timestamp: '14:32 UTC',
      headline: 'Sol diurnal shift & perchlorate barrier check',
      description: 'Crew circadian cycle adjusted for Sol (+39 min). Verify habitat suit-lock chemical scrub and monitor right calf strain.',
      recommendedAction: 'Review safe actions',
      actionScreen: 'Medical Guidance',
    },

    exercise: {
      scheduledTime: '16:30 UTC',
      prescription: '45 min Martian gravity harness walk + 15 min calf eccentric loading',
      routineTitle: 'Partial Gravity Deceleration & Calf Eccentric Strengthening',
      notes: 'Use your mission-approved limits. Stop if Achilles pain or acute plantar fascia tension occurs.',
    },

    protocols: [
      {
        id: 'MARS-CIRC-01',
        tag: 'ACTIVE RECOMMENDATION',
        cadence: 'DAILY',
        title: 'Martian Sol Diurnal Synchronization',
        description: 'Synchronize melatonin secretion with the 24h 39m Martian Sol using timed blue-depleted light panels and structured pre-sleep wind-down.',
        routineLinkText: 'View routine ›',
      },
      {
        id: 'MARS-CHEM-03',
        tag: 'PERCHLORATE BARRIER',
        cadence: 'POST-EVA',
        title: 'Perchlorate Dust Chemical Exclusion',
        description: 'Execute double-seal airlock washdown and electrostatic suction. Test suit exterior with fluorescent perchlorate test kit before inner hatch entry.',
        routineLinkText: 'View routine ›',
      },
      {
        id: 'MARS-AUTO-02',
        tag: 'AUTONOMOUS CLINICAL SUPPORT',
        cadence: 'ONGOING',
        title: 'Autonomous Clinical Decision Tree (14m Latency)',
        description: 'When direct Houston Earth consultation has up to 22 min delay, rely on onboard AI diagnostic consensus and autonomous triage pathways.',
        routineLinkText: 'View routine ›',
      },
    ],

    clinicalReference: [
      {
        condition: 'Sol Circadian Desynchrony / Fatigue',
        immediateCountermeasure: 'Administer 0.5 mg melatonin 30 min before Sol sleep window; adjust cabin lighting',
        medicalKitPack: 'Pack Alpha (Melatonin / Chrono-Light)',
        telemedicineEscalate: 'If sleep debt exceeds 10 hours',
      },
      {
        condition: 'Perchlorate Surface Ingress / Skin Irritation',
        immediateCountermeasure: 'Wash skin with reducing rinse solution; replace suit inner garment',
        medicalKitPack: 'Pack Beta (Neutralizing Wash)',
        telemedicineEscalate: 'If systemic thyroid suppression symptoms occur',
      },
      {
        condition: 'Lower Limb / Achilles Tendon Strain (0.38g)',
        immediateCountermeasure: '15 min ice-pack compression + non-weight bearing calf elevation',
        medicalKitPack: 'Pack Gamma (Anti-inflammatory Gel)',
        telemedicineEscalate: 'If severe pain upon weight bearing',
      },
    ],

    reports: [
      {
        id: 'REP-SOL84',
        tag: 'SOL 84 · WEEKLY',
        timestamp: '14:30 UTC',
        title: 'Autonomous Medical Officer Diagnostic Summary',
        summary: 'Comprehensive cardiovascular, cognitive, and nutritional status. Elena Ramirez confirmed operational nominal for upcoming Jezero Crater traverse.',
        category: 'weekly',
      },
      {
        id: 'REP-SOL80',
        tag: 'SOL 80 · CHECK-IN',
        timestamp: '09:15 UTC',
        title: 'Habitat Perchlorate Trace Contaminant & Sol Sync Log',
        summary: 'Airlock scrub verified at 99.8% filtration efficiency. Circadian shift successfully synchronized with Sol diurnal cycle.',
        category: 'checkin',
      },
      {
        id: 'REP-SOL76',
        tag: 'SOL 76 · EVA CLEARANCE',
        timestamp: '16:00 UTC',
        title: 'Jezero Delta Slope Traversal & Suit Barrier Clearance',
        summary: 'Achilles tendon eccentric loading test passed. Double-seal chemical barrier inspected. Cleared for 6-hour scientific sampling at Jezero delta.',
        category: 'eva',
      },
      {
        id: 'REP-SOL70',
        tag: 'SOL 70 · DOSIMETRY',
        timestamp: '07:30 UTC',
        title: 'Martian Atmospheric Cosmic Ray Surface Flux & Berm Log',
        summary: 'Cumulative surface dose tracking 0.54 mSv/day under 7 mbar CO2 atmospheric column. Surface habitat regolith berm provides 72% attenuation.',
        category: 'dosimetry',
      },
    ],
  },
};

export function getEnvironmentData(env: EnvironmentType): EnvironmentMissionData {
  return ENVIRONMENT_DATASETS[env] || ENVIRONMENT_DATASETS.Spacecraft;
}

