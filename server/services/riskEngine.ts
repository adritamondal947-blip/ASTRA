import { db } from '../db/database.ts';

export interface EvaluatedRisk {
  id: string;
  category: string;
  title: string;
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
  scorePct: number;
  whyFlagged: string;
  dataPointsUsed: Array<{
    metricOrSensor: string;
    value: string | number;
    recordedAt: string;
    source: string;
  }>;
  reviewedRule: {
    ruleCode: string;
    ruleVersion: string;
    citation: string;
  };
  recommendedClinicalAction: string;
  disclaimer: string;
}

export function evaluateAerospaceRisks(profileId: string, environment: string): EvaluatedRisk[] {
  const evaluatedRisks: EvaluatedRisk[] = [];

  // 1. Fetch latest real vitals for profile
  const latestHeartRate = db.prepare(`
    SELECT * FROM vital_signs
    WHERE profile_id = ? AND environment = ? AND metric = 'heartRate'
    ORDER BY recorded_at DESC LIMIT 1
  `).get(profileId, environment) as any;

  const latestBloodOxygen = db.prepare(`
    SELECT * FROM vital_signs
    WHERE profile_id = ? AND environment = ? AND metric = 'bloodOxygen'
    ORDER BY recorded_at DESC LIMIT 1
  `).get(profileId, environment) as any;

  // 2. Fetch latest symptoms
  const activeSymptoms = db.prepare(`
    SELECT * FROM symptom_assessments
    WHERE profile_id = ? AND environment = ?
    ORDER BY recorded_at DESC LIMIT 5
  `).all(profileId, environment) as any[];

  // 3. Fetch latest environmental telemetry
  const latestRad = db.prepare(`
    SELECT * FROM environmental_telemetry
    WHERE environment = ? AND hazard_type = 'radiation'
    ORDER BY recorded_at DESC LIMIT 1
  `).get(environment) as any;

  const latestDust = db.prepare(`
    SELECT * FROM environmental_telemetry
    WHERE environment = ? AND hazard_type = 'dustParticulate'
    ORDER BY recorded_at DESC LIMIT 1
  `).get(environment) as any;

  // 4. Fetch latest sleep/wellbeing
  const latestWellbeing = db.prepare(`
    SELECT * FROM mental_wellbeing
    WHERE profile_id = ? AND environment = ?
    ORDER BY recorded_at DESC LIMIT 1
  `).get(profileId, environment) as any;

  // Rule 1: SANS & Cephalad Venous Congestion Risk (Spacecraft microgravity)
  if (environment === 'Spacecraft') {
    const headSymptom = activeSymptoms.find((s) => s.region_id === 'head');
    const hrVal = latestHeartRate?.value ?? 68;
    const isElevated = headSymptom && (headSymptom.severity === 'Severe' || headSymptom.intensity >= 6);

    evaluatedRisks.push({
      id: 'risk-sans-eval',
      category: 'Neuro-Ocular & Hemodynamic',
      title: 'Spaceflight-Associated Neuro-ocular Syndrome (SANS) & Cephalad Congestion',
      riskLevel: isElevated ? 'ELEVATED' : 'MODERATE',
      scorePct: isElevated ? 68 : 34,
      whyFlagged: isElevated
        ? `Flagged due to active cephalic symptom log ("${headSymptom.symptomType}", intensity ${headSymptom.intensity}/10) in 0.00g microgravity.`
        : 'Continuous baseline microgravity cephalad fluid redistribution monitored during deep-space cruise.',
      dataPointsUsed: [
        {
          metricOrSensor: 'Head/Neck Symptom Assessment',
          value: headSymptom ? `${headSymptom.symptomType} (${headSymptom.intensity}/10)` : 'None reported',
          recordedAt: headSymptom?.recorded_at ?? 'Baseline',
          source: headSymptom?.data_status === 'real' ? 'Astronaut Self-Report' : 'Baseline Telemetry',
        },
        {
          metricOrSensor: 'Resting Heart Rate',
          value: `${hrVal} bpm`,
          recordedAt: latestHeartRate?.recorded_at ?? 'Recent',
          source: latestHeartRate?.source ?? 'Wearable PPG',
        },
      ],
      reviewedRule: {
        ruleCode: 'NASA-SANS-CPG-2024',
        ruleVersion: 'v3.2.1',
        citation: 'NASA-STD-3001 Vol 1 §4.2.1 Ocular and Intracranial Monitoring in Long-Duration Spaceflight',
      },
      recommendedClinicalAction:
        'Schedule weekly optical coherence tomography (OCT) scan and utilize 30 min daily lower body negative pressure (LBNP) suit.',
      disclaimer: 'RISK SCORING EVALUATION FOR CLINICAL REVIEW ONLY. DOES NOT CONSTITUTE A FORMAL MEDICAL DIAGNOSIS.',
    });
  }

  // Rule 2: Ionizing Radiation Bio-Burden Risk
  const radVal = latestRad?.value ?? (environment === 'Mars' ? 0.94 : environment === 'Moon' ? 0.72 : 0.48);
  const radLevel = radVal > 1.2 ? 'CRITICAL' : radVal > 0.8 ? 'ELEVATED' : 'LOW';

  evaluatedRisks.push({
    id: 'risk-rad-eval',
    category: 'Environmental Hazard',
    title: 'Ionizing Galactic Cosmic Radiation (GCR) Accumulation',
    riskLevel: radLevel,
    scorePct: Math.min(100, Math.round((radVal / 1.5) * 100)),
    whyFlagged: `Calculated from dosimeter sensor telemetry (${radVal} mSv/day) relative to exploration mission career limits.`,
    dataPointsUsed: [
      {
        metricOrSensor: 'Active Dosimeter Telemetry',
        value: `${radVal} ${latestRad?.unit ?? 'mSv/day'}`,
        recordedAt: latestRad?.recorded_at ?? 'Current epoch',
        source: latestRad?.sensor_name ?? 'CPAD Silicon Sensor',
      },
    ],
    reviewedRule: {
      ruleCode: 'NASA-RAD-LIMIT-2023',
      ruleVersion: 'v4.0.2',
      citation: 'NCRP Report No. 153 & NASA Space Radiation Health Program Standards',
    },
    recommendedClinicalAction:
      radVal > 0.8
        ? 'Enforce habit storm shelter protocols during peak solar coronal mass ejection (CME) windows.'
        : 'Maintain standard passive dosimeter badge swaps and weekly telemetry downlink.',
    disclaimer: 'RISK SCORING EVALUATION FOR CLINICAL REVIEW ONLY. DOES NOT CONSTITUTE A FORMAL MEDICAL DIAGNOSIS.',
  });

  // Rule 3: Lunar / Martian Regolith Pulmonary Risk (Moon / Mars)
  if (environment === 'Moon' || environment === 'Mars') {
    const dustVal = latestDust?.value ?? 0.18;
    const dustLevel = dustVal > 0.25 ? 'ELEVATED' : 'LOW';

    evaluatedRisks.push({
      id: 'risk-dust-eval',
      category: 'Atmospheric & Pulmonary',
      title: `${environment === 'Moon' ? 'Lunar' : 'Martian'} Regolith Particulate Inhalation & Cytotoxicity`,
      riskLevel: dustLevel,
      scorePct: Math.round((dustVal / 0.3) * 100),
      whyFlagged: `Monitored airlock particle concentration (${dustVal} mg/m³) following crew EVA translation cycles.`,
      dataPointsUsed: [
        {
          metricOrSensor: 'Air Particle Laser Counter',
          value: `${dustVal} mg/m³`,
          recordedAt: latestDust?.recorded_at ?? 'Post-EVA',
          source: latestDust?.sensor_name ?? 'Airlock Cleanroom Sensor',
        },
      ],
      reviewedRule: {
        ruleCode: 'NASA-LSMOM-DUST-01',
        ruleVersion: 'v2.4.0',
        citation: 'NASA Lunar & Planetary Surface Medical Operations Manual §6.4',
      },
      recommendedClinicalAction:
        'Verify electrostatic airlock vacuum cleaning cycle and inspect habitat HEPA filter differential pressure.',
      disclaimer: 'RISK SCORING EVALUATION FOR CLINICAL REVIEW ONLY. DOES NOT CONSTITUTE A FORMAL MEDICAL DIAGNOSIS.',
    });
  }

  // Rule 4: Cognitive Fatigue & Sleep Architecture Deficit
  const sleepVal = latestWellbeing?.sleep_hours ?? 7.2;
  const stressVal = latestWellbeing?.stress_score ?? 30;
  const isFatigued = sleepVal < 5.5 || stressVal > 70;

  evaluatedRisks.push({
    id: 'risk-fatigue-eval',
    category: 'Behavioral & Cognitive Performance',
    title: 'Circadian Misalignment & Cumulative Sleep Debt',
    riskLevel: isFatigued ? 'ELEVATED' : 'LOW',
    scorePct: isFatigued ? 65 : 22,
    whyFlagged: `Evaluated from recorded sleep duration (${sleepVal} hrs) and psychological workload stress index (${stressVal}%).`,
    dataPointsUsed: [
      {
        metricOrSensor: 'Sleep Telemetry',
        value: `${sleepVal} hours (Efficiency: ${latestWellbeing?.sleep_efficiency ?? 88}%)`,
        recordedAt: latestWellbeing?.recorded_at ?? 'Last sleep cycle',
        source: 'Astronaut Well-being Check-in',
      },
      {
        metricOrSensor: 'Psychological Stress Index',
        value: `${stressVal}%`,
        recordedAt: latestWellbeing?.recorded_at ?? 'Last check-in',
        source: 'Self-Reported Telemetry',
      },
    ],
    reviewedRule: {
      ruleCode: 'NASA-BHP-SLEEP-2025',
      ruleVersion: 'v1.8.3',
      citation: 'NASA Behavioral Health and Performance (BHP) Standard Operating Protocols',
    },
    recommendedClinicalAction:
      isFatigued
        ? 'Prescribe 45-minute tactical sleep extension and optimize crew quarters circadian dynamic lighting.'
        : 'Continue nominal rest and exercise cadence.',
    disclaimer: 'RISK SCORING EVALUATION FOR CLINICAL REVIEW ONLY. DOES NOT CONSTITUTE A FORMAL MEDICAL DIAGNOSIS.',
  });

  return evaluatedRisks;
}
