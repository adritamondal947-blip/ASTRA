import { db } from '../db/database.ts';
import type { UserSession } from './authService.ts';

export function getAuditLogs(user: UserSession, limit: number = 100) {
  // Flight surgeon can see all audit logs; astronauts can see their own actions
  let query = `SELECT * FROM audit_logs`;
  const params: any[] = [];

  if (user.role === 'astronaut') {
    query += ` WHERE user_id = ?`;
    params.push(user.userId);
  }

  query += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(limit);

  return db.prepare(query).all(...params);
}
