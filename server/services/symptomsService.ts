import { db } from '../db/database.ts';
import crypto from 'node:crypto';
import type { UserSession } from './authService.ts';

export interface SymptomAssessmentInput {
  profileId: string;
  environment: string;
  regionId: string;
  regionName: string;
  symptomType: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  intensity: number; // 0 to 10
  onsetTime: string; // e.g. '2 hours ago', or specific ISO timestamp
  notes?: string;
  dataStatus?: 'real' | 'simulated';
}

export function recordSymptomAssessment(input: SymptomAssessmentInput, user: UserSession) {
  const id = 'sym-' + crypto.randomUUID();
  const recordedAt = new Date().toISOString();
  const dataStatus = input.dataStatus || 'real';

  db.prepare(`
    INSERT INTO symptom_assessments (
      id, profile_id, environment, region_id, region_name, symptom_type,
      severity, intensity, onset_time, notes, data_status, recorded_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.profileId,
    input.environment,
    input.regionId,
    input.regionName,
    input.symptomType,
    input.severity,
    input.intensity,
    input.onsetTime,
    input.notes || '',
    dataStatus,
    recordedAt
  );

  // If severe symptom or intensity >= 7, generate alert automatically
  if (input.severity === 'Severe' || input.intensity >= 7) {
    db.prepare(`
      INSERT INTO system_alerts (
        id, profile_id, environment, category, severity, headline, description,
        trigger_data, rule_code, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'alt-' + crypto.randomUUID(),
      input.profileId,
      input.environment,
      'health',
      'CRITICAL',
      `Severe Symptom Logged: ${input.regionName} (${input.symptomType})`,
      `Astronaut recorded intensity ${input.intensity}/10 [${input.severity}] for ${input.regionName}. Onset: ${input.onsetTime}.`,
      `Symptom: ${input.symptomType} | Region: ${input.regionName} | Notes: ${input.notes || 'None'}`,
      'AEROMED-TRIAGE-01',
      'NEW',
      recordedAt
    );
  }

  // Audit log
  db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, user_role, action, resource_type, resource_id, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'aud-' + crypto.randomUUID(),
    user.userId,
    user.name,
    user.role,
    'LOG_SYMPTOM_ASSESSMENT',
    'SYMPTOM_ASSESSMENT',
    id,
    `Logged ${input.severity} symptom for ${input.regionName} (${input.symptomType}, intensity ${input.intensity}/10)`,
    recordedAt
  );

  return { id, recordedAt, status: 'success' };
}

export function getSymptomHistory(profileId: string, environment?: string, limit: number = 50) {
  let query = `SELECT * FROM symptom_assessments WHERE profile_id = ?`;
  const params: any[] = [profileId];

  if (environment) {
    query += ` AND environment = ?`;
    params.push(environment);
  }

  query += ` ORDER BY recorded_at DESC LIMIT ?`;
  params.push(limit);

  return db.prepare(query).all(...params);
}
