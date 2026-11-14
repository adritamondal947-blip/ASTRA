import { db } from '../db/database.ts';
import crypto from 'node:crypto';
import type { UserSession } from './authService.ts';

export function getActiveAlerts(environment?: string, profileId?: string) {
  let query = `
    SELECT a.*, r.clinical_source, r.rule_version, r.disclaimer
    FROM system_alerts a
    LEFT JOIN medical_knowledge_rules r ON r.rule_code = a.rule_code
    WHERE 1=1
  `;
  const params: any[] = [];

  if (environment) {
    query += ` AND a.environment = ?`;
    params.push(environment);
  }
  if (profileId) {
    query += ` AND (a.profile_id = ? OR a.profile_id IS NULL)`;
    params.push(profileId);
  }

  query += ` ORDER BY CASE a.severity WHEN 'CRITICAL' THEN 1 WHEN 'ADVISORY' THEN 2 ELSE 3 END, a.created_at DESC LIMIT 50`;

  return db.prepare(query).all(...params);
}

export function acknowledgeAlert(alertId: string, user: UserSession): { success: boolean; error?: string } {
  const now = new Date().toISOString();
  const ackBy = `${user.name} (${user.role})`;

  const res = db.prepare(`
    UPDATE system_alerts
    SET status = 'ACKNOWLEDGED', acknowledged_by = ?, acknowledged_at = ?
    WHERE id = ? AND status = 'NEW'
  `).run(ackBy, now, alertId);

  if (res.changes === 0) {
    return { success: false, error: 'Alert not found or already acknowledged.' };
  }

  db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, user_role, action, resource_type, resource_id, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'aud-' + crypto.randomUUID(),
    user.userId,
    user.name,
    user.role,
    'ACKNOWLEDGE_ALERT',
    'SYSTEM_ALERT',
    alertId,
    `Acknowledged alert: ${alertId}`,
    now
  );

  return { success: true };
}

export function surgeonReviewAlert(alertId: string, user: UserSession): { success: boolean; error?: string } {
  if (user.role !== 'flight_surgeon' && user.role !== 'medical_staff') {
    return { success: false, error: 'Unauthorized: Only authorized flight surgeons can mark alerts as clinically reviewed.' };
  }

  const now = new Date().toISOString();
  const reviewBy = `${user.name} (Flight Surgeon)`;

  const res = db.prepare(`
    UPDATE system_alerts
    SET status = 'REVIEWED_BY_SURGEON', acknowledged_by = ?, acknowledged_at = ?
    WHERE id = ?
  `).run(reviewBy, now, alertId);

  if (res.changes === 0) {
    return { success: false, error: 'Alert not found.' };
  }

  db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, user_role, action, resource_type, resource_id, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'aud-' + crypto.randomUUID(),
    user.userId,
    user.name,
    user.role,
    'SURGEON_REVIEW_ALERT',
    'SYSTEM_ALERT',
    alertId,
    `Marked alert as clinically reviewed by flight surgeon.`,
    now
  );

  return { success: true };
}
