import { db } from '../db/database.ts';
import crypto from 'node:crypto';
import type { UserSession } from './authService.ts';

export function getAllProfiles(requestingUser?: UserSession | null) {
  // If flight surgeon or medical staff, can see all astronaut profiles
  // If astronaut, can see all crew members in mission
  const profiles = db.prepare(`
    SELECT p.*, u.email
    FROM astronaut_profiles p
    LEFT JOIN users u ON u.id = p.user_id
    ORDER BY p.id ASC
  `).all();

  return profiles;
}

export function getProfileById(profileId: string) {
  return db.prepare(`
    SELECT p.*, u.email
    FROM astronaut_profiles p
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.id = ?
  `).get(profileId);
}

export function updateMissionSetup(
  profileId: string,
  environment: string,
  phase: string,
  user: UserSession
): { success: boolean; error?: string } {
  // Verify astronaut or medical staff permission
  if (user.role === 'astronaut' && user.profileId !== profileId) {
    return { success: false, error: 'Unauthorized: Astronauts can only update their own mission setup.' };
  }

  const validEnvs = ['Spacecraft', 'Moon', 'Mars'];
  if (!validEnvs.includes(environment)) {
    return { success: false, error: `Invalid environment: ${environment}. Must be Spacecraft, Moon, or Mars.` };
  }

  const res = db.prepare(`
    UPDATE astronaut_profiles
    SET current_environment = ?, current_phase = ?
    WHERE id = ?
  `).run(environment, phase, profileId);

  if (res.changes === 0) {
    return { success: false, error: 'Profile not found.' };
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
    'UPDATE_MISSION_SETUP',
    'ASTRONAUT_PROFILE',
    profileId,
    `Updated mission environment to ${environment}, phase to ${phase}`,
    new Date().toISOString()
  );

  return { success: true };
}

export function createProfile(data: {
  id?: string;
  fullName: string;
  role: string;
  missionName: string;
  flightDay?: number;
  missionDurationDays?: number;
  currentEnvironment?: string;
  currentPhase?: string;
}, user: UserSession) {
  const profileId = data.id?.trim().toUpperCase() || 'AST-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO astronaut_profiles (
      id, user_id, full_name, role, mission_name, flight_day, mission_duration_days,
      current_environment, current_phase, is_demo, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    profileId,
    user.userId,
    data.fullName,
    data.role,
    data.missionName,
    data.flightDay || 1,
    data.missionDurationDays || 180,
    data.currentEnvironment || 'Spacecraft',
    data.currentPhase || '2',
    0,
    now
  );

  // Copy default thresholds for the new profile
  const defaultThresholds = [
    { metric: 'heartRate', min: 48, max: 110, env: 'Spacecraft' },
    { metric: 'bloodOxygen', min: 94, max: 100, env: 'Spacecraft' },
    { metric: 'bodyTemperature', min: 35.8, max: 37.8, env: 'Spacecraft' },
    { metric: 'breathingRate', min: 10, max: 22, env: 'Spacecraft' },
    { metric: 'heartRate', min: 50, max: 125, env: 'Moon' },
    { metric: 'bloodOxygen', min: 94, max: 100, env: 'Moon' },
    { metric: 'bodyTemperature', min: 35.8, max: 37.8, env: 'Moon' },
    { metric: 'breathingRate', min: 10, max: 24, env: 'Moon' },
    { metric: 'heartRate', min: 50, max: 130, env: 'Mars' },
    { metric: 'bloodOxygen', min: 93, max: 100, env: 'Mars' },
    { metric: 'bodyTemperature', min: 35.8, max: 37.8, env: 'Mars' },
    { metric: 'breathingRate', min: 10, max: 24, env: 'Mars' },
  ];

  const insertThreshold = db.prepare(`
    INSERT INTO vital_thresholds (id, profile_id, environment, metric, min_value, max_value, approved_by, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of defaultThresholds) {
    insertThreshold.run(
      `thr-${profileId}-${t.env}-${t.metric}`,
      profileId,
      t.env,
      t.metric,
      t.min,
      t.max,
      `${user.name} (${user.role})`,
      now
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
    'CREATE_ASTRONAUT_PROFILE',
    'ASTRONAUT_PROFILE',
    profileId,
    `Created astronaut profile for ${data.fullName}`,
    now
  );

  return getProfileById(profileId);
}
