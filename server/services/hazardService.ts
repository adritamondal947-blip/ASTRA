import { db } from '../db/database.ts';
import crypto from 'node:crypto';
import type { UserSession } from './authService.ts';

export interface HazardReadingInput {
  environment: string;
  hazardType: string;
  sensorName: string;
  value: number;
  unit: string;
  source: string;
  recordedAt?: string;
}

export function recordHazardReading(input: HazardReadingInput, user?: UserSession) {
  const id = 'tel-' + crypto.randomUUID();
  const recordedAt = input.recordedAt || new Date().toISOString();

  // Check limits from environmental_hazards_config
  const config = db.prepare(`
    SELECT * FROM environmental_hazards_config
    WHERE environment = ? AND hazard_type = ? AND is_active = 1
  `).get(input.environment, input.hazardType) as any;

  let status: 'NOMINAL' | 'ADVISORY' | 'CRITICAL' = 'NOMINAL';

  if (config) {
    if (config.min_safe !== null && input.value < config.min_safe) {
      status = 'CRITICAL';
    } else if (config.max_safe !== null && input.value > config.max_safe) {
      status = 'CRITICAL';
    } else if (config.max_safe !== null && input.value > config.max_safe * 0.85) {
      status = 'ADVISORY';
    }
  }

  db.prepare(`
    INSERT INTO environmental_telemetry (
      id, environment, hazard_type, sensor_name, value, unit, status, source, recorded_at, is_live
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(id, input.environment, input.hazardType, input.sensorName, input.value, input.unit, status, input.source, recordedAt);

  // If status is CRITICAL or ADVISORY, trigger alert in system_alerts
  if (status !== 'NOMINAL') {
    db.prepare(`
      INSERT INTO system_alerts (
        id, profile_id, environment, category, severity, headline, description,
        trigger_data, rule_code, status, created_at
      ) VALUES (?, NULL, ?, 'hazard', ?, ?, ?, ?, 'ENV-HAZARD-01', 'NEW', ?)
    `).run(
      'alt-' + crypto.randomUUID(),
      input.environment,
      status === 'CRITICAL' ? 'CRITICAL' : 'ADVISORY',
      `Hazard Limit Warning: ${config?.display_name ?? input.hazardType}`,
      `Sensor "${input.sensorName}" reported ${input.value} ${input.unit} (Approved range: ${config?.min_safe ?? 0} - ${config?.max_safe ?? 'unlimited'} ${input.unit}).`,
      `Sensor: ${input.sensorName} | Reading: ${input.value} ${input.unit} | Status: ${status}`,
      recordedAt
    );
  }

  return { id, status, recordedAt };
}

export function getEnvironmentalTelemetry(environment: string) {
  const configs = db.prepare(`
    SELECT * FROM environmental_hazards_config
    WHERE environment = ? AND is_active = 1
  `).all(environment) as any[];

  const now = new Date().getTime();

  // For each configured hazard type, get latest reading
  const results = configs.map((cfg) => {
    const latest = db.prepare(`
      SELECT * FROM environmental_telemetry
      WHERE environment = ? AND hazard_type = ?
      ORDER BY recorded_at DESC LIMIT 1
    `).get(environment, cfg.hazard_type) as any;

    let freshness: 'LIVE' | 'STALE' | 'OFFLINE' = 'OFFLINE';
    let ageSeconds = 999999;

    if (latest) {
      const recTime = new Date(latest.recorded_at).getTime();
      ageSeconds = Math.max(0, Math.round((now - recTime) / 1000));

      if (ageSeconds < 60) {
        freshness = 'LIVE';
      } else if (ageSeconds < 300) {
        freshness = 'STALE';
      } else {
        freshness = 'OFFLINE';
      }
    }

    return {
      hazardType: cfg.hazard_type,
      displayName: cfg.display_name,
      configuredMin: cfg.min_safe,
      configuredMax: cfg.max_safe,
      unit: cfg.unit,
      currentReading: latest?.value ?? null,
      sensorName: latest?.sensor_name ?? 'Primary Telemetry Transducer',
      source: latest?.source ?? 'ECLSS Bus',
      status: latest?.status ?? 'NOMINAL',
      recordedAt: latest?.recorded_at ?? null,
      ageSeconds,
      freshness,
      feedStatus: freshness === 'LIVE' ? 'Optimal telemetry downlink' : freshness === 'STALE' ? 'Delayed packet transmission' : 'Sensor stream offline / missing',
    };
  });

  return results;
}

export function updateHazardConfig(
  id: string,
  minSafe: number | null,
  maxSafe: number | null,
  isActive: boolean,
  user: UserSession
): { success: boolean; error?: string } {
  if (user.role !== 'flight_surgeon' && user.role !== 'medical_staff') {
    return { success: false, error: 'Unauthorized: Only authorized flight surgeons / safety officers can update hazard limits.' };
  }

  const now = new Date().toISOString();
  const res = db.prepare(`
    UPDATE environmental_hazards_config
    SET min_safe = ?, max_safe = ?, is_active = ?, updated_at = ?
    WHERE id = ?
  `).run(minSafe, maxSafe, isActive ? 1 : 0, now, id);

  if (res.changes === 0) {
    return { success: false, error: 'Hazard configuration not found.' };
  }

  db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, user_role, action, resource_type, resource_id, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'aud-' + crypto.randomUUID(),
    user.userId,
    user.name,
    user.role,
    'UPDATE_HAZARD_CONFIG',
    'HAZARD_CONFIG',
    id,
    `Updated safe range to [${minSafe ?? 'none'}, ${maxSafe ?? 'none'}]`,
    now
  );

  return { success: true };
}
