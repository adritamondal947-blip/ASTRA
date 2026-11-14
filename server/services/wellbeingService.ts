import { db } from '../db/database.ts';
import crypto from 'node:crypto';
import type { UserSession } from './authService.ts';

export interface WellbeingCheckinInput {
  profileId: string;
  environment: string;
  mood: string;
  energyScore: number; // 1 to 5
  stressScore: number; // 0 to 100
  cognitiveWorkload: number; // 0 to 100
  sleepHours: number;
  sleepEfficiency: number; // 0 to 100
  notes?: string;
  dataStatus?: 'real' | 'simulated';
}

export function recordWellbeingCheckin(input: WellbeingCheckinInput, user: UserSession) {
  const id = 'wb-' + crypto.randomUUID();
  const recordedAt = new Date().toISOString();
  const dataStatus = input.dataStatus || 'real';

  db.prepare(`
    INSERT INTO mental_wellbeing (
      id, profile_id, environment, mood, energy_score, stress_score, cognitive_workload,
      sleep_hours, sleep_efficiency, notes, data_status, recorded_at, reviewed_by_surgeon
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(
    id,
    input.profileId,
    input.environment,
    input.mood,
    input.energyScore,
    input.stressScore,
    input.cognitiveWorkload,
    input.sleepHours,
    input.sleepEfficiency,
    input.notes || '',
    dataStatus,
    recordedAt
  );

  // If high stress (> 75%) or severe sleep deprivation (< 5 hours), flag an alert
  if (input.stressScore > 75 || input.sleepHours < 5.0) {
    db.prepare(`
      INSERT INTO system_alerts (
        id, profile_id, environment, category, severity, headline, description,
        trigger_data, rule_code, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'alt-' + crypto.randomUUID(),
      input.profileId,
      input.environment,
      'mental',
      'WATCH',
      `Cognitive Fatigue / Circadian Rest Deficit`,
      `Astronaut recorded ${input.sleepHours}h sleep (efficiency ${input.sleepEfficiency}%) and stress score ${input.stressScore}%. Recommended tactical rest period.`,
      `Stress: ${input.stressScore}% | Sleep: ${input.sleepHours} hrs | Cognitive workload: ${input.cognitiveWorkload}%`,
      'AEROMED-BEHAVIORAL-01',
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
    'LOG_WELLBEING_CHECKIN',
    'MENTAL_WELLBEING',
    id,
    `Logged mental wellbeing: Mood "${input.mood}", Sleep ${input.sleepHours}h, Stress ${input.stressScore}%`,
    recordedAt
  );

  return { id, recordedAt, status: 'success' };
}

export function getWellbeingHistory(profileId: string, environment?: string, limit: number = 30) {
  let query = `SELECT * FROM mental_wellbeing WHERE profile_id = ?`;
  const params: any[] = [profileId];

  if (environment) {
    query += ` AND environment = ?`;
    params.push(environment);
  }

  query += ` ORDER BY recorded_at DESC LIMIT ?`;
  params.push(limit);

  return db.prepare(query).all(...params);
}

export function reviewWellbeingRecord(
  recordId: string,
  surgeonNotes: string,
  surgeonUser: UserSession
): { success: boolean; error?: string } {
  if (surgeonUser.role !== 'flight_surgeon' && surgeonUser.role !== 'medical_staff') {
    return { success: false, error: 'Access restricted: Only authorized medical staff / flight surgeons can review wellbeing records.' };
  }

  const now = new Date().toISOString();

  const res = db.prepare(`
    UPDATE mental_wellbeing
    SET reviewed_by_surgeon = 1, reviewed_at = ?, surgeon_id = ?, surgeon_notes = ?
    WHERE id = ?
  `).run(now, surgeonUser.userId, surgeonNotes, recordId);

  if (res.changes === 0) {
    return { success: false, error: 'Record not found.' };
  }

  // Audit log
  db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, user_role, action, resource_type, resource_id, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'aud-' + crypto.randomUUID(),
    surgeonUser.userId,
    surgeonUser.name,
    surgeonUser.role,
    'REVIEW_WELLBEING_RECORD',
    'MENTAL_WELLBEING',
    recordId,
    `Flight surgeon review completed with clinical notes.`,
    now
  );

  return { success: true };
}
