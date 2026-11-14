import { db } from '../db/database.ts';
import crypto from 'node:crypto';
import type { UserSession } from './authService.ts';

export interface ReportGenerationOptions {
  profileId: string;
  environment: string;
  includeVitals: boolean;
  includeSymptoms: boolean;
  includeWellbeing: boolean;
  includeHazards: boolean;
  startDate?: string;
  endDate?: string;
  format: 'json' | 'csv' | 'markdown';
}

export function generateMissionReport(options: ReportGenerationOptions, user: UserSession) {
  // Authorization check: astronauts can export own records; surgeons can export all
  if (user.role === 'astronaut' && user.profileId !== options.profileId) {
    throw new Error('Access denied: Astronauts may only export their own medical records.');
  }

  const profile = db.prepare(`SELECT * FROM astronaut_profiles WHERE id = ?`).get(options.profileId) as any;
  if (!profile) {
    throw new Error(`Profile ${options.profileId} not found.`);
  }

  const generatedAt = new Date().toISOString();
  const reportId = 'REP-ASTRA-' + Math.floor(100000 + Math.random() * 900000);

  // Vitals
  let vitals: any[] = [];
  if (options.includeVitals) {
    vitals = db.prepare(`
      SELECT metric, value, unit, source, sensor_id, data_status, recorded_at
      FROM vital_signs
      WHERE profile_id = ? AND environment = ?
      ORDER BY recorded_at DESC LIMIT 100
    `).all(options.profileId, options.environment);
  }

  // Symptoms
  let symptoms: any[] = [];
  if (options.includeSymptoms) {
    symptoms = db.prepare(`
      SELECT region_name, symptom_type, severity, intensity, onset_time, notes, recorded_at, data_status
      FROM symptom_assessments
      WHERE profile_id = ? AND environment = ?
      ORDER BY recorded_at DESC LIMIT 50
    `).all(options.profileId, options.environment);
  }

  // Wellbeing
  let wellbeing: any[] = [];
  if (options.includeWellbeing) {
    wellbeing = db.prepare(`
      SELECT mood, energy_score, stress_score, cognitive_workload, sleep_hours, sleep_efficiency, notes, recorded_at, reviewed_by_surgeon, surgeon_notes
      FROM mental_wellbeing
      WHERE profile_id = ? AND environment = ?
      ORDER BY recorded_at DESC LIMIT 30
    `).all(options.profileId, options.environment);
  }

  // Hazards
  let hazards: any[] = [];
  if (options.includeHazards) {
    hazards = db.prepare(`
      SELECT hazard_type, sensor_name, value, unit, status, source, recorded_at
      FROM environmental_telemetry
      WHERE environment = ?
      ORDER BY recorded_at DESC LIMIT 20
    `).all(options.environment);
  }

  // Log to audit trail
  db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, user_role, action, resource_type, resource_id, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'aud-' + crypto.randomUUID(),
    user.userId,
    user.name,
    user.role,
    'EXPORT_MEDICAL_REPORT',
    'MISSION_REPORT',
    reportId,
    `Generated comprehensive medical telemetry report (${options.format.toUpperCase()}) for ${profile.full_name} [${profile.id}]`,
    generatedAt
  );

  const reportData = {
    reportId,
    generatedAt,
    generatedBy: `${user.name} (${user.role})`,
    provenanceClassification: 'OFFICIAL AEROSPACE TELEMETRY RECORD · CONFIDENTIAL',
    astronaut: {
      id: profile.id,
      fullName: profile.full_name,
      role: profile.role,
      missionName: profile.mission_name,
      flightDay: profile.flight_day,
      environment: options.environment,
    },
    sections: {
      vitalSigns: vitals,
      symptoms: symptoms,
      mentalWellbeing: wellbeing,
      environmentalHazards: hazards,
    },
    disclaimer: 'DATA PROVENANCE STATEMENT: All biometrics and sensor telemetry recorded with device attribution, sensor ID, and cryptographic timestamp. Review required by Flight Surgeon.',
  };

  if (options.format === 'csv') {
    // Generate simple multi-section CSV
    let csv = `REPORT_ID,${reportId}\nASTRONAUT,${profile.full_name} (${profile.id})\nGENERATED_AT,${generatedAt}\n\n`;
    csv += `--- VITAL SIGNS ---\nMETRIC,VALUE,UNIT,SOURCE,SENSOR_ID,DATA_STATUS,RECORDED_AT\n`;
    for (const v of vitals) {
      csv += `${v.metric},${v.value},${v.unit},${v.source},${v.sensor_id},${v.data_status},${v.recorded_at}\n`;
    }
    csv += `\n--- SYMPTOM ASSESSMENTS ---\nREGION,SYMPTOM,SEVERITY,INTENSITY,ONSET,NOTES,RECORDED_AT\n`;
    for (const s of symptoms) {
      csv += `"${s.region_name}","${s.symptom_type}",${s.severity},${s.intensity}/10,"${s.onset_time}","${s.notes}",${s.recorded_at}\n`;
    }
    return { format: 'csv', filename: `${reportId}.csv`, data: csv };
  }

  if (options.format === 'markdown') {
    let md = `# ASTRA Mission Medical Flight Report\n`;
    md += `**Report ID:** ${reportId}  \n`;
    md += `**Astronaut:** ${profile.full_name} (${profile.id}) — *${profile.role}*  \n`;
    md += `**Mission:** ${profile.mission_name} | **Environment:** ${options.environment} | **Flight Day:** ${profile.flight_day}  \n`;
    md += `**Generated By:** ${user.name} (${user.role}) at ${generatedAt}  \n\n`;

    md += `## 1. Vital Signs Telemetry (${vitals.length} records)\n`;
    if (vitals.length === 0) md += `*No vital records found for this period.*\n\n`;
    else {
      md += `| Metric | Reading | Unit | Source | Sensor ID | Recorded At |\n|---|---|---|---|---|---|\n`;
      for (const v of vitals.slice(0, 20)) {
        md += `| ${v.metric} | ${v.value} | ${v.unit} | ${v.source} | ${v.sensor_id} | ${v.recorded_at} |\n`;
      }
      md += `\n`;
    }

    md += `## 2. Body & Symptom Assessments (${symptoms.length} records)\n`;
    if (symptoms.length === 0) md += `*Nominal: No symptoms recorded.*\n\n`;
    else {
      for (const s of symptoms) {
        md += `- **${s.region_name}**: ${s.symptom_type} [${s.severity}, ${s.intensity}/10] — Onset: *${s.onset_time}*. Notes: ${s.notes || 'None'} *(Recorded: ${s.recorded_at})*\n`;
      }
      md += `\n`;
    }

    md += `## 3. Environmental Hazard Context\n`;
    for (const h of hazards) {
      md += `- **${h.hazard_type}**: ${h.value} ${h.unit} (${h.status}) via ${h.sensor_name} at ${h.recorded_at}\n`;
    }
    md += `\n---\n*${reportData.disclaimer}*\n`;
    return { format: 'markdown', filename: `${reportId}.md`, data: md };
  }

  return { format: 'json', filename: `${reportId}.json`, data: reportData };
}
