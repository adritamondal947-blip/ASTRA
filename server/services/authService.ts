import { db, hashPassword, generateToken } from '../db/database.ts';
import crypto from 'node:crypto';

export interface UserSession {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: 'astronaut' | 'flight_surgeon' | 'medical_staff';
  profileId?: string;
  profileRole?: string;
  missionName?: string;
  currentEnvironment?: string;
  currentPhase?: string;
  flightDay?: number;
  missionDurationDays?: number;
}

export function loginUser(emailOrId: string, password: string): { success: boolean; session?: UserSession; error?: string } {
  const cleanId = emailOrId.trim().toLowerCase();
  
  // Find user by email or by astronaut profile ID
  let user = db.prepare(`
    SELECT u.*, p.id as profile_id, p.role as profile_role, p.mission_name, p.current_environment, p.current_phase, p.flight_day, p.mission_duration_days
    FROM users u
    LEFT JOIN astronaut_profiles p ON p.user_id = u.id
    WHERE LOWER(u.email) = ? OR LOWER(p.id) = ?
  `).get(cleanId, cleanId) as any;

  if (!user) {
    // Also check if username matches before '@'
    user = db.prepare(`
      SELECT u.*, p.id as profile_id, p.role as profile_role, p.mission_name, p.current_environment, p.current_phase, p.flight_day, p.mission_duration_days
      FROM users u
      LEFT JOIN astronaut_profiles p ON p.user_id = u.id
      WHERE LOWER(u.email) LIKE ?
    `).get(`${cleanId}@%`) as any;
  }

  if (!user) {
    return { success: false, error: 'User or astronaut profile not found.' };
  }

  // Verify password using scrypt
  const computedHash = hashPassword(password, user.salt);
  if (!crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(user.password_hash, 'hex'))) {
    return { success: false, error: 'Invalid mission access password.' };
  }

  // Create session
  const token = generateToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  db.prepare(`
    INSERT INTO sessions (token, user_id, role, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(token, user.id, user.role, now.toISOString(), expiresAt);

  // Log to audit trail
  db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, user_role, action, resource_type, resource_id, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'aud-' + crypto.randomUUID(),
    user.id,
    user.name,
    user.role,
    'USER_LOGIN',
    'SESSION',
    token,
    `User logged in with role: ${user.role}`,
    now.toISOString()
  );

  return {
    success: true,
    session: {
      token,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profileId: user.profile_id,
      profileRole: user.profile_role,
      missionName: user.mission_name,
      currentEnvironment: user.current_environment,
      currentPhase: user.current_phase,
      flightDay: user.flight_day,
      missionDurationDays: user.mission_duration_days,
    },
  };
}

export function validateSession(token: string | null | undefined): UserSession | null {
  if (!token) return null;

  const session = db.prepare(`
    SELECT s.*, u.email, u.name, u.role as user_role,
           p.id as profile_id, p.role as profile_role, p.mission_name, p.current_environment, p.current_phase, p.flight_day, p.mission_duration_days
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN astronaut_profiles p ON p.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(token) as any;

  if (!session) return null;

  return {
    token: session.token,
    userId: session.user_id,
    email: session.email,
    name: session.name,
    role: session.user_role,
    profileId: session.profile_id,
    profileRole: session.profile_role,
    missionName: session.mission_name,
    currentEnvironment: session.current_environment,
    currentPhase: session.current_phase,
    flightDay: session.flight_day,
    missionDurationDays: session.mission_duration_days,
  };
}

export function logoutUser(token: string): boolean {
  const session = validateSession(token);
  if (session) {
    db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, user_role, action, resource_type, resource_id, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'aud-' + crypto.randomUUID(),
      session.userId,
      session.name,
      session.role,
      'USER_LOGOUT',
      'SESSION',
      token,
      'User logged out',
      new Date().toISOString()
    );
    return true;
  }
  return false;
}
