-- ASTRA Aerospace Space Health Intelligence System
-- Database Schema for node:sqlite (Node 24 Native)

-- 1. USERS & CREDENTIALS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('astronaut', 'flight_surgeon', 'medical_staff')),
    created_at TEXT NOT NULL
);

-- 2. SESSIONS & TOKENS
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. ASTRONAUT PROFILES
CREATE TABLE IF NOT EXISTS astronaut_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    mission_name TEXT NOT NULL,
    flight_day INTEGER NOT NULL DEFAULT 1,
    mission_duration_days INTEGER NOT NULL DEFAULT 180,
    current_environment TEXT NOT NULL DEFAULT 'Spacecraft',
    current_phase TEXT NOT NULL DEFAULT '2',
    is_demo INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. VITAL SIGNS TELEMETRY
CREATE TABLE IF NOT EXISTS vital_signs (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    environment TEXT NOT NULL,
    metric TEXT NOT NULL, -- heartRate, bloodOxygen, bodyTemperature, breathingRate, systolicBP, diastolicBP
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    source TEXT NOT NULL, -- wearable-device, manual-entry, biosensor-pod, etc.
    sensor_id TEXT,
    data_status TEXT NOT NULL DEFAULT 'real' CHECK(data_status IN ('real', 'simulated', 'imported')),
    recorded_at TEXT NOT NULL,
    FOREIGN KEY(profile_id) REFERENCES astronaut_profiles(id) ON DELETE CASCADE
);

-- 5. VITAL THRESHOLDS
CREATE TABLE IF NOT EXISTS vital_thresholds (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    environment TEXT NOT NULL,
    metric TEXT NOT NULL,
    min_value REAL,
    max_value REAL,
    approved_by TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(profile_id) REFERENCES astronaut_profiles(id) ON DELETE CASCADE
);

-- 6. BODY & SYMPTOM ASSESSMENTS
CREATE TABLE IF NOT EXISTS symptom_assessments (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    environment TEXT NOT NULL,
    region_id TEXT NOT NULL,
    region_name TEXT NOT NULL,
    symptom_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('Mild', 'Moderate', 'Severe')),
    intensity INTEGER NOT NULL CHECK(intensity BETWEEN 0 AND 10),
    onset_time TEXT NOT NULL,
    notes TEXT,
    data_status TEXT NOT NULL DEFAULT 'real' CHECK(data_status IN ('real', 'simulated')),
    recorded_at TEXT NOT NULL,
    FOREIGN KEY(profile_id) REFERENCES astronaut_profiles(id) ON DELETE CASCADE
);

-- 7. MENTAL WELLBEING & COGNITIVE TELEMETRY
CREATE TABLE IF NOT EXISTS mental_wellbeing (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    environment TEXT NOT NULL,
    mood TEXT NOT NULL,
    energy_score INTEGER NOT NULL CHECK(energy_score BETWEEN 1 AND 5),
    stress_score INTEGER NOT NULL CHECK(stress_score BETWEEN 0 AND 100),
    cognitive_workload INTEGER NOT NULL CHECK(cognitive_workload BETWEEN 0 AND 100),
    sleep_hours REAL NOT NULL,
    sleep_efficiency INTEGER NOT NULL CHECK(sleep_efficiency BETWEEN 0 AND 100),
    notes TEXT,
    data_status TEXT NOT NULL DEFAULT 'real' CHECK(data_status IN ('real', 'simulated')),
    recorded_at TEXT NOT NULL,
    reviewed_by_surgeon INTEGER NOT NULL DEFAULT 0,
    reviewed_at TEXT,
    surgeon_id TEXT,
    surgeon_notes TEXT,
    FOREIGN KEY(profile_id) REFERENCES astronaut_profiles(id) ON DELETE CASCADE
);

-- 8. ENVIRONMENTAL HAZARD TELEMETRY
CREATE TABLE IF NOT EXISTS environmental_telemetry (
    id TEXT PRIMARY KEY,
    environment TEXT NOT NULL,
    hazard_type TEXT NOT NULL, -- radiation, cabinPressure, co2, o2, ambientTemp, dustParticulate
    sensor_name TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('NOMINAL', 'ADVISORY', 'CRITICAL')),
    source TEXT NOT NULL,
    recorded_at TEXT NOT NULL,
    is_live INTEGER NOT NULL DEFAULT 1
);

-- 9. ENVIRONMENTAL HAZARD LIMIT CONFIGURATIONS
CREATE TABLE IF NOT EXISTS environmental_hazards_config (
    id TEXT PRIMARY KEY,
    environment TEXT NOT NULL,
    hazard_type TEXT NOT NULL,
    display_name TEXT NOT NULL,
    min_safe REAL,
    max_safe REAL,
    unit TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL
);

-- 10. REVIEWED MEDICAL KNOWLEDGE BASE & CLINICAL RULES
CREATE TABLE IF NOT EXISTS medical_knowledge_rules (
    id TEXT PRIMARY KEY,
    rule_code TEXT UNIQUE NOT NULL,
    target_region TEXT,
    symptom_category TEXT NOT NULL,
    applicable_environment TEXT NOT NULL, -- All, Spacecraft, Moon, Mars
    possible_causes_json TEXT NOT NULL,
    support_steps_json TEXT NOT NULL,
    clinical_source TEXT NOT NULL, -- e.g. NASA-STD-3001 Vol 1 / ESA Human Spaceflight Guidelines
    reviewer_name TEXT NOT NULL,
    reviewer_title TEXT NOT NULL,
    rule_version TEXT NOT NULL,
    reviewed_at TEXT NOT NULL,
    disclaimer TEXT NOT NULL
);

-- 11. UNIFIED SYSTEM ALERTS & ACTION CENTER
CREATE TABLE IF NOT EXISTS system_alerts (
    id TEXT PRIMARY KEY,
    profile_id TEXT,
    environment TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('health', 'hazard', 'equipment', 'mental')),
    severity TEXT NOT NULL CHECK(severity IN ('WATCH', 'ADVISORY', 'CRITICAL')),
    headline TEXT NOT NULL,
    description TEXT NOT NULL,
    trigger_data TEXT,
    rule_code TEXT,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW', 'ACKNOWLEDGED', 'REVIEWED_BY_SURGEON')),
    acknowledged_by TEXT,
    acknowledged_at TEXT,
    created_at TEXT NOT NULL
);

-- 12. AUDIT TRAIL & SENSITIVE ACCESS LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL, -- VIEW_MEDICAL_RECORDS, EXPORT_REPORT, UPDATE_THRESHOLDS, LOG_SYMPTOM, REVIEW_ALERT
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details TEXT,
    created_at TEXT NOT NULL
);

-- INDEXES FOR FAST TELEMETRY LOOKUPS
CREATE INDEX IF NOT EXISTS idx_vitals_profile_env ON vital_signs(profile_id, environment, recorded_at);
CREATE INDEX IF NOT EXISTS idx_symptoms_profile ON symptom_assessments(profile_id, environment, recorded_at);
CREATE INDEX IF NOT EXISTS idx_wellbeing_profile ON mental_wellbeing(profile_id, environment, recorded_at);
CREATE INDEX IF NOT EXISTS idx_env_telemetry_time ON environmental_telemetry(environment, recorded_at);
CREATE INDEX IF NOT EXISTS idx_alerts_profile ON system_alerts(profile_id, environment, status);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at);
