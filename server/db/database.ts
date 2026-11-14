import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DB_PATH = path.resolve(process.cwd(), 'astra-space-health.db');

export const db = new DatabaseSync(DB_PATH);

// Initialize WAL mode and foreign keys for durability and concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function generateToken(): string {
  return 'astra_sec_' + crypto.randomBytes(32).toString('hex');
}

export function initDatabase() {
  const schemaPath = path.resolve(process.cwd(), 'server/db/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schemaSql);

  seedInitialData();
  console.log(`[ASTRA Database] Initialized successfully at: ${DB_PATH}`);
}

function seedInitialData() {
  // Check if users exist
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existingUsers.count === 0) {
    console.log('[ASTRA Database] Seeding default astronaut and medical staff accounts...');

    // 1. Crew & Medical Staff Accounts
    const defaultUsers = [
      {
        id: 'usr-elena',
        email: 'elena.ramirez@nasa.gov',
        name: 'Dr. Elena Ramirez',
        password: 'astra',
        role: 'astronaut',
        profileId: 'AST-7426',
        profileRole: 'Mission Specialist / Astrobiologist',
        missionName: 'Artemis VII / Cislunar Deep-Space Cruise',
        flightDay: 42,
        duration: 180,
        env: 'Spacecraft',
        phase: '2',
      },
      {
        id: 'usr-vance',
        email: 'marcus.vance@nasa.gov',
        name: 'Dr. Marcus Vance',
        password: 'astra',
        role: 'flight_surgeon',
        profileId: 'MED-1044',
        profileRole: 'Chief Flight Surgeon / Space Medicine Officer',
        missionName: 'Mission Control Center (MCC) Houston',
        flightDay: 42,
        duration: 180,
        env: 'Spacecraft',
        phase: '2',
      },
      {
        id: 'usr-hayes',
        email: 'alex.hayes@nasa.gov',
        name: 'Commander Alex Hayes',
        password: 'astra',
        role: 'astronaut',
        profileId: 'AST-9012',
        profileRole: 'Mission Commander',
        missionName: 'Artemis VII / Lunar Base Expedition',
        flightDay: 84,
        duration: 210,
        env: 'Moon',
        phase: '2',
      },
      {
        id: 'usr-chen',
        email: 'sarah.chen@nasa.gov',
        name: 'Lt. Sarah Chen',
        password: 'astra',
        role: 'astronaut',
        profileId: 'AST-3185',
        profileRole: 'Systems Flight Engineer',
        missionName: 'Ares Pioneer / Martian Outpost Alpha',
        flightDay: 135,
        duration: 540,
        env: 'Mars',
        phase: '2',
      },
    ];

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, salt, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertProfile = db.prepare(`
      INSERT INTO astronaut_profiles (id, user_id, full_name, role, mission_name, flight_day, mission_duration_days, current_environment, current_phase, is_demo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    for (const u of defaultUsers) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword(u.password, salt);
      insertUser.run(u.id, u.email, hash, salt, u.name, u.role, now);

      insertProfile.run(
        u.profileId,
        u.id,
        u.name,
        u.profileRole,
        u.missionName,
        u.flightDay,
        u.duration,
        u.env,
        u.phase,
        0,
        now
      );
    }

    // 2. Seed Default Vital Thresholds
    const insertThreshold = db.prepare(`
      INSERT INTO vital_thresholds (id, profile_id, environment, metric, min_value, max_value, approved_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

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

    for (const p of ['AST-7426', 'AST-9012', 'AST-3185']) {
      for (const t of defaultThresholds) {
        insertThreshold.run(
          `thr-${p}-${t.env}-${t.metric}`,
          p,
          t.env,
          t.metric,
          t.min,
          t.max,
          'Dr. Marcus Vance (Flight Surgeon)',
          now
        );
      }
    }

    // 3. Seed Reviewed Medical Knowledge Base (NASA-STD-3001 compliant rules)
    const insertRule = db.prepare(`
      INSERT INTO medical_knowledge_rules (
        id, rule_code, target_region, symptom_category, applicable_environment,
        possible_causes_json, support_steps_json, clinical_source,
        reviewer_name, reviewer_title, rule_version, reviewed_at, disclaimer
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const rules = [
      {
        id: 'rule-sans-01',
        code: 'AEROMED-SANS-01',
        region: 'head',
        category: 'Vision / Cephalad Fluid Shift',
        env: 'Spacecraft',
        causes: JSON.stringify([
          'Spaceflight-Associated Neuro-ocular Syndrome (SANS) due to persistent cephalad venous congestion',
          'Mild intracranial pressure elevation in 0.00g microgravity',
          'Optic disc edema or choroidal folds secondary to microgravity fluid redistributions',
        ]),
        steps: JSON.stringify([
          'Perform fundoscopy protocol using the onboard retinal camera (Pack MED-OPTIC-2)',
          'Utilize lower body negative pressure (LBNP) suit for 30 minutes at -25 mmHg to draw fluids caudad',
          'Log ocular visual acuity and report any scotomas or hyperopic shifts during evening debrief',
          'Maintain 30-degree head-elevated sleeping posture restraint',
        ]),
        source: 'NASA-STD-3001 Vol 1 §4.2 / Clinical Practice Guideline SANS-CPG-2024',
        reviewer: 'Dr. Rebecca Stone, MD',
        title: 'NASA Chief Medical Officer & Ophthalmic Consultant',
        version: 'v3.2.1',
        reviewedAt: '2026-08-15',
        disclaimer: 'CLINICAL DECISION SUPPORT NOTICE: Potential differential factors for aerospace medical review only. Not a definitive clinical diagnosis. Ground flight surgeon review required for treatment initiation.',
      },
      {
        id: 'rule-spine-02',
        code: 'AEROMED-SPINE-02',
        region: 'lower_back',
        category: 'Musculoskeletal / Spinal Elongation',
        env: 'Spacecraft',
        causes: JSON.stringify([
          'Microgravity intervertebral disc hyperhydration and spinal elongation (up to 5-7 cm increase)',
          'Paraspinal muscle tone deconditioning and intrinsic postural stabilizer fatigue',
          'Lack of compressive axial spinal loading during deep space cruise',
        ]),
        steps: JSON.stringify([
          'Employ fetal tuck position restraint during 15-minute rest periods to decompress posterior lumbar fascia',
          'Perform prescribed axial loading exercises on the Advanced Resistive Exercise Device (ARED)',
          'Verify lumbar support tension in the crew sleep quarters',
          'Review ergonomics of work console translation grips',
        ]),
        source: 'NASA-STD-3001 Vol 2 §8.3 / ESA Human Spaceflight Musculoskeletal Protocol',
        reviewer: 'Dr. Marcus Vance, MD',
        title: 'Lead Flight Surgeon, Exploration Mission Group',
        version: 'v2.8.0',
        reviewedAt: '2026-09-02',
        disclaimer: 'CLINICAL DECISION SUPPORT NOTICE: Potential differential factors for aerospace medical review only. Not a definitive clinical diagnosis. Ground flight surgeon review required for treatment initiation.',
      },
      {
        id: 'rule-lunar-dust-03',
        code: 'AEROMED-DUST-03',
        region: 'chest',
        category: 'Respiratory / Toxic Dust Particulate',
        env: 'Moon',
        causes: JSON.stringify([
          'Sub-micron jagged lunar regolith inhalation following EVA airlock repressurization',
          'Silica-like pulmonary macrophage activation and acute reactive airway constriction',
          'Incomplete electrostatic airlock vacuum cleaning cycle',
        ]),
        steps: JSON.stringify([
          'Verify habitat HEPA / scrub filtration cycling rates and seal integrity',
          'Administer prescribed bronchodilator inhaler (Kit MED-AIRWAY-1) if peak flow drops below 85%',
          'Don respiratory particulate mask until habitat particulate levels register < 0.3 mg/m³',
          'Document respiratory rate and pulse oximetry hourly for 6 hours',
        ]),
        source: 'NASA Lunar Surface Medical Operations Manual (LSMOM) §6.4',
        reviewer: 'Dr. Tyler Howard, MD, FCCP',
        title: 'Pulmonology Flight Surgeon, Lunar Operations Office',
        version: 'v4.1.0',
        reviewedAt: '2026-07-20',
        disclaimer: 'CLINICAL DECISION SUPPORT NOTICE: Potential differential factors for aerospace medical review only. Not a definitive clinical diagnosis. Ground flight surgeon review required for treatment initiation.',
      },
      {
        id: 'rule-rad-04',
        code: 'AEROMED-RAD-04',
        region: 'abdomen',
        category: 'Radiation / Acute Gastrointestinal Exposure',
        env: 'Mars',
        causes: JSON.stringify([
          'Solar Particle Event (SPE) secondary burst during interplanetary cruise or surface transit',
          'Cumulative Galactic Cosmic Radiation (GCR) exposure exceeding mission limits',
          'Mild early prodromal radiation response (nausea, fatigue)',
        ]),
        steps: JSON.stringify([
          'Move crew immediately to designated water-shielded habitat storm shelter',
          'Check active Crew Personal Active Dosimeter (CPAD) readouts for instantaneous dose rates',
          'Administer 5-HT3 receptor antagonist antiemetic (Ondansetron 8mg, Kit MED-PHARM-3) if nausea presents',
          'Calibrate real-time telemetry downlink for Houston Radiation Health Office review',
        ]),
        source: 'NASA Human Exploration Radiation Risk Management Document §5.1 / NCRP Report No. 153',
        reviewer: 'Dr. Gregory Finch, PhD, MD',
        title: 'Radiation Biophysics Directorate, Space Radiation Health Program',
        version: 'v3.5.2',
        reviewedAt: '2026-10-10',
        disclaimer: 'CLINICAL DECISION SUPPORT NOTICE: Potential differential factors for aerospace medical review only. Not a definitive clinical diagnosis. Ground flight surgeon review required for treatment initiation.',
      },
    ];

    for (const r of rules) {
      insertRule.run(
        r.id,
        r.code,
        r.region,
        r.category,
        r.env,
        r.causes,
        r.steps,
        r.source,
        r.reviewer,
        r.title,
        r.version,
        r.reviewedAt,
        r.disclaimer
      );
    }

    // 4. Seed Environmental Hazard Config & Feeds
    const insertHazardConfig = db.prepare(`
      INSERT INTO environmental_hazards_config (id, environment, hazard_type, display_name, min_safe, max_safe, unit, is_active, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const hazardConfigs = [
      { id: 'hc-sc-rad', env: 'Spacecraft', type: 'radiation', name: 'Galactic Cosmic Radiation Rate', min: 0, max: 0.85, unit: 'mSv/day' },
      { id: 'hc-sc-press', env: 'Spacecraft', type: 'cabinPressure', name: 'Habitable Cabin Pressure', min: 95.0, max: 104.0, unit: 'kPa' },
      { id: 'hc-sc-o2', env: 'Spacecraft', type: 'o2', name: 'Atmospheric Oxygen Fraction', min: 20.0, max: 22.5, unit: '%' },
      { id: 'hc-sc-co2', env: 'Spacecraft', type: 'co2', name: 'Carbon Dioxide Partial Pressure', min: 0.0, max: 0.35, unit: '%' },

      { id: 'hc-moon-rad', env: 'Moon', type: 'radiation', name: 'Lunar Surface Radiation Rate', min: 0, max: 1.10, unit: 'mSv/day' },
      { id: 'hc-moon-dust', env: 'Moon', type: 'dustParticulate', name: 'Regolith Particulate Density', min: 0, max: 0.30, unit: 'mg/m³' },
      { id: 'hc-moon-press', env: 'Moon', type: 'cabinPressure', name: 'Lunar Habitat Internal Pressure', min: 65.0, max: 72.0, unit: 'kPa' },

      { id: 'hc-mars-rad', env: 'Mars', type: 'radiation', name: 'Martian Surface Radiation Exposure', min: 0, max: 1.45, unit: 'mSv/day' },
      { id: 'hc-mars-dust', env: 'Mars', type: 'dustParticulate', name: 'Martian Atmospheric Dust Density', min: 0, max: 0.25, unit: 'mg/m³' },
      { id: 'hc-mars-co2', env: 'Mars', type: 'co2', name: 'Hab Scrubbed CO2 Level', min: 0, max: 0.30, unit: '%' },
    ];

    for (const hc of hazardConfigs) {
      insertHazardConfig.run(hc.id, hc.env, hc.type, hc.name, hc.min, hc.max, hc.unit, 1, now);
    }

    // 5. Seed Initial Telemetry Feed Snapshots
    const insertTelemetry = db.prepare(`
      INSERT INTO environmental_telemetry (id, environment, hazard_type, sensor_name, value, unit, status, source, recorded_at, is_live)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialTelemetry = [
      { id: 'tel-1', env: 'Spacecraft', type: 'radiation', sensor: 'CPAD Silicon Dosimeter Array #1', val: 0.48, unit: 'mSv/day', status: 'NOMINAL', source: 'Internal Hab Sensor Cluster A' },
      { id: 'tel-2', env: 'Spacecraft', type: 'cabinPressure', sensor: 'Barometric BaroPod Bar-3', val: 101.3, unit: 'kPa', status: 'NOMINAL', source: 'Life Support ECLSS Bus 1' },
      { id: 'tel-3', env: 'Spacecraft', type: 'co2', sensor: 'Infrared Gas Analyzer IRGA-4', val: 0.22, unit: '%', status: 'NOMINAL', source: 'ECLSS Scrubbing Loop B' },
      { id: 'tel-4', env: 'Spacecraft', type: 'o2', sensor: 'Paramagnetic Oxygen Transducer O2-A', val: 21.2, unit: '%', status: 'NOMINAL', source: 'ECLSS Gas Injection' },

      { id: 'tel-5', env: 'Moon', type: 'radiation', sensor: 'Lunar Base Perimeter RadMonitor', val: 0.72, unit: 'mSv/day', status: 'NOMINAL', source: 'Shackleton Crater Surface Pod' },
      { id: 'tel-6', env: 'Moon', type: 'dustParticulate', sensor: 'Air Particle Laser Counter Dust-L2', val: 0.18, unit: 'mg/m³', status: 'NOMINAL', source: 'Airlock Cleanroom Sensor' },
      { id: 'tel-7', env: 'Moon', type: 'cabinPressure', sensor: 'Dome Barometric Transducer #2', val: 68.4, unit: 'kPa', status: 'NOMINAL', source: 'Habitat Primary ECLSS' },

      { id: 'tel-8', env: 'Mars', type: 'radiation', sensor: 'Martian Surface Radiation Detector (RAD)', val: 0.94, unit: 'mSv/day', status: 'NOMINAL', source: 'Curiosity/Perseverance Telemetry Link' },
      { id: 'tel-9', env: 'Mars', type: 'dustParticulate', sensor: 'Optical Depth Sensor Dust-M1', val: 0.21, unit: 'mg/m³', status: 'NOMINAL', source: 'Hab Perimeter Weather Mast' },
    ];

    for (const t of initialTelemetry) {
      insertTelemetry.run(t.id, t.env, t.type, t.sensor, t.val, t.unit, t.status, t.source, now, 1);
    }

    // 6. Seed Initial Alerts
    const insertAlert = db.prepare(`
      INSERT INTO system_alerts (id, profile_id, environment, category, severity, headline, description, trigger_data, rule_code, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAlert.run(
      'alt-init-01',
      'AST-7426',
      'Spacecraft',
      'health',
      'ADVISORY',
      'Cephalad Fluid Shift Adaptation',
      'Astronaut Dr. Elena Ramirez exhibits nominal microgravity adaptation with mild facial fullness. Rest posture alignment advised.',
      'PPG Vitals nominal | Heart rate 68 bpm | Blood oxygen 99%',
      'AEROMED-SANS-01',
      'NEW',
      now
    );

    insertAlert.run(
      'alt-init-02',
      'AST-9012',
      'Moon',
      'hazard',
      'WATCH',
      'Airlock Dust Particulate Elevated Post-EVA',
      'Post-EVA airlock regolith particulate reached 0.18 mg/m³ following 4-hour surface excursion.',
      'Air particle sensor Dust-L2 reading 0.18 mg/m³ (Limit 0.30 mg/m³)',
      'AEROMED-DUST-03',
      'NEW',
      now
    );

    // 7. Seed Initial Audit Log
    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, user_role, action, resource_type, resource_id, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAudit.run(
      'aud-init-01',
      'system',
      'ASTRA Automated Seeder',
      'medical_staff',
      'SYSTEM_INITIALIZATION',
      'DATABASE',
      'astra-space-health.db',
      'Seeded NASA clinical rules, initial astronaut profiles, and environmental telemetry baselines.',
      now
    );

    console.log('[ASTRA Database] Seeding completed.');
  }
}
