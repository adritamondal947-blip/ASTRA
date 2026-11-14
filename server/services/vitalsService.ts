import { db } from '../db/database.ts';
import crypto from 'node:crypto';
import type { UserSession } from './authService.ts';

export interface VitalRecordInput {
  profileId: string;
  environment: string;
  metric: string;
  value: number;
  unit: string;
  source: string; // e.g. 'wearable-device', 'manual-entry', 'biosensor-chest-pod'
  sensorId?: string;
  dataStatus?: 'real' | 'simulated' | 'imported';
  recordedAt?: string;
}

export function recordVitalSign(input: VitalRecordInput, user: UserSession) {
  const id = 'vit-' + crypto.randomUUID();
  const recordedAt = input.recordedAt || new Date().toISOString();
  const dataStatus = input.dataStatus || 'real';
  const sensorId = input.sensorId || (input.source === 'wearable-device' ? 'BIO-WEAR-01' : 'MANUAL-INPUT');

  db.prepare(`
    INSERT INTO vital_signs (
      id, profile_id, environment, metric, value, unit, source, sensor_id, data_status, recorded_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.profileId,
    input.environment,
    input.metric,
    input.value,
    input.unit,
    input.source,
    sensorId,
    dataStatus,
    recordedAt
  );

  // Check against thresholds
  const threshold = db.prepare(`
    SELECT * FROM vital_thresholds
    WHERE profile_id = ? AND environment = ? AND metric = ?
  `).get(input.profileId, input.environment, input.metric) as any;

  if (threshold) {
    let breached = false;
    let headline = '';
    let description = '';

    if (threshold.min_value !== null && input.value < threshold.min_value) {
      breached = true;
      headline = `Low ${input.metric.toUpperCase()} Detected: ${input.value} ${input.unit}`;
      description = `Measured value ${input.value} ${input.unit} is below the approved threshold of ${threshold.min_value} ${input.unit} in ${input.environment}.`;
    } else if (threshold.max_value !== null && input.value > threshold.max_value) {
      breached = true;
      headline = `High ${input.metric.toUpperCase()} Detected: ${input.value} ${input.unit}`;
      description = `Measured value ${input.value} ${input.unit} is above the approved threshold of ${threshold.max_value} ${input.unit} in ${input.environment}.`;
    }

    if (breached) {
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
        'ADVISORY',
        headline,
        description,
        `Metric: ${input.metric} = ${input.value} ${input.unit} (Approved range: ${threshold.min_value ?? 0} - ${threshold.max_value ?? 'unlimited'} ${input.unit}) | Source: ${input.source} [${sensorId}]`,
        'THRESH-EVAL-01',
        'NEW',
        recordedAt
      );
    }
  }

  return { id, recordedAt, status: 'success' };
}

export function ingestWearableBatch(
  profileId: string,
  environment: string,
  readings: Array<{ metric: string; value: number; unit: string; recordedAt?: string; sensorId?: string }>,
  user: UserSession
) {
  const results = [];
  for (const r of readings) {
    const res = recordVitalSign(
      {
        profileId,
        environment,
        metric: r.metric,
        value: r.value,
        unit: r.unit,
        source: 'wearable-device',
        sensorId: r.sensorId || 'ASTRA-WEARABLE-PPG',
        dataStatus: 'imported',
        recordedAt: r.recordedAt,
      },
      user
    );
    results.push(res);
  }

  // Audit log for wearable sync
  db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, user_role, action, resource_type, resource_id, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'aud-' + crypto.randomUUID(),
    user.userId,
    user.name,
    user.role,
    'INGEST_WEARABLE_TELEMETRY',
    'VITAL_SIGNS',
    profileId,
    `Ingested ${readings.length} readings via connected wearable device`,
    new Date().toISOString()
  );

  return results;
}

export function getVitalsHistory(profileId: string, environment?: string, metric?: string, limit: number = 50) {
  let query = `SELECT * FROM vital_signs WHERE profile_id = ?`;
  const params: any[] = [profileId];

  if (environment) {
    query += ` AND environment = ?`;
    params.push(environment);
  }
  if (metric) {
    query += ` AND metric = ?`;
    params.push(metric);
  }

  query += ` ORDER BY recorded_at DESC LIMIT ?`;
  params.push(limit);

  return db.prepare(query).all(...params);
}

export function getVitalThresholds(profileId: string, environment?: string) {
  let query = `SELECT * FROM vital_thresholds WHERE profile_id = ?`;
  const params: any[] = [profileId];

  if (environment) {
    query += ` AND environment = ?`;
    params.push(environment);
  }

  return db.prepare(query).all(...params);
}

export function updateVitalThresholds(
  profileId: string,
  thresholds: Array<{ environment: string; metric: string; minValue?: number; maxValue?: number }>,
  user: UserSession
) {
  const now = new Date().toISOString();
  const approvedBy = `${user.name} (${user.role === 'flight_surgeon' ? 'Authorized Flight Surgeon' : 'Astronaut Self-Configuration'})`;

  const upsert = db.prepare(`
    INSERT INTO vital_thresholds (id, profile_id, environment, metric, min_value, max_value, approved_by, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      min_value = excluded.min_value,
      max_value = excluded.max_value,
      approved_by = excluded.approved_by,
      updated_at = excluded.updated_at
  `);

  for (const t of thresholds) {
    const id = `thr-${profileId}-${t.environment}-${t.metric}`;
    upsert.run(id, profileId, t.environment, t.metric, t.minValue ?? null, t.maxValue ?? null, approvedBy, now);
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
    'UPDATE_VITAL_THRESHOLDS',
    'VITAL_THRESHOLDS',
    profileId,
    `Updated thresholds for ${thresholds.length} metrics. Approved by ${approvedBy}`,
    now
  );

  return getVitalThresholds(profileId);
}
