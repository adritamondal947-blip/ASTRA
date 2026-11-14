import http, { IncomingMessage, ServerResponse } from 'node:http';
import { initDatabase } from './db/database.ts';
import { loginUser, validateSession, logoutUser } from './services/authService.ts';
import { getAllProfiles, getProfileById, updateMissionSetup, createProfile } from './services/missionService.ts';
import { recordVitalSign, ingestWearableBatch, getVitalsHistory, getVitalThresholds, updateVitalThresholds } from './services/vitalsService.ts';
import { recordSymptomAssessment, getSymptomHistory } from './services/symptomsService.ts';
import { evaluateSymptomGuidance, getAllReviewedRules } from './services/medicalSupportService.ts';
import { recordWellbeingCheckin, getWellbeingHistory, reviewWellbeingRecord } from './services/wellbeingService.ts';
import { getCalculatedAnalytics } from './services/analyticsService.ts';
import { evaluateAerospaceRisks } from './services/riskEngine.ts';
import { recordHazardReading, getEnvironmentalTelemetry, updateHazardConfig } from './services/hazardService.ts';
import { getActiveAlerts, acknowledgeAlert, surgeonReviewAlert } from './services/alertsService.ts';
import { generateMissionReport } from './services/reportsService.ts';
import { getAuditLogs } from './services/auditService.ts';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

// Initialize SQLite database
initDatabase();

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

function getAuthSession(req: IncomingMessage) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return validateSession(token);
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    });
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method?.toUpperCase();

  try {
    // Health Check
    if (method === 'GET' && pathname === '/api/health') {
      return sendJson(res, 200, {
        status: 'ONLINE',
        system: 'ASTRA Space Health Intelligence Backend',
        version: 'v2.4.0-aerospace',
        timeUtc: new Date().toISOString(),
      });
    }

    // 1. AUTHENTICATION & SESSIONS
    if (method === 'POST' && pathname === '/api/auth/login') {
      const body = await parseJsonBody(req);
      const result = loginUser(body.identifier || body.email, body.password);
      if (!result.success) {
        return sendJson(res, 401, { error: result.error });
      }
      return sendJson(res, 200, result);
    }

    if (method === 'POST' && pathname === '/api/auth/logout') {
      const session = getAuthSession(req);
      if (session) logoutUser(session.token);
      return sendJson(res, 200, { success: true });
    }

    if (method === 'GET' && pathname === '/api/auth/me') {
      const session = getAuthSession(req);
      if (!session) return sendJson(res, 401, { error: 'Not authenticated' });
      return sendJson(res, 200, { user: session });
    }

    // Authenticated session context (or demo fallback if in dev mode)
    const session = getAuthSession(req);

    // 2. ASTRONAUT PROFILES & MISSION SETUP
    if (method === 'GET' && pathname === '/api/profiles') {
      const profiles = getAllProfiles(session);
      return sendJson(res, 200, profiles);
    }

    if (method === 'POST' && pathname === '/api/profiles') {
      if (!session) return sendJson(res, 401, { error: 'Authentication required' });
      const body = await parseJsonBody(req);
      const profile = createProfile(body, session);
      return sendJson(res, 201, profile);
    }

    if (method === 'PATCH' && pathname.startsWith('/api/profiles/') && pathname.endsWith('/mission')) {
      if (!session) return sendJson(res, 401, { error: 'Authentication required' });
      const profileId = pathname.split('/')[3];
      const body = await parseJsonBody(req);
      const result = updateMissionSetup(profileId, body.environment, body.phase, session);
      if (!result.success) return sendJson(res, 400, result);
      return sendJson(res, 200, result);
    }

    // 3. VITAL SIGNS & WEARABLES
    if (method === 'POST' && pathname === '/api/vitals') {
      if (!session) return sendJson(res, 401, { error: 'Authentication required' });
      const body = await parseJsonBody(req);
      const result = recordVitalSign(body, session);
      return sendJson(res, 201, result);
    }

    if (method === 'POST' && pathname === '/api/vitals/ingest-wearable') {
      if (!session) return sendJson(res, 401, { error: 'Authentication required' });
      const body = await parseJsonBody(req);
      const result = ingestWearableBatch(body.profileId, body.environment, body.readings, session);
      return sendJson(res, 200, { ingestedCount: result.length, status: 'success' });
    }

    if (method === 'GET' && pathname === '/api/vitals') {
      const profileId = url.searchParams.get('profileId') || session?.profileId || 'AST-7426';
      const environment = url.searchParams.get('environment') || undefined;
      const metric = url.searchParams.get('metric') || undefined;
      const vitals = getVitalsHistory(profileId, environment, metric);
      return sendJson(res, 200, vitals);
    }

    if (method === 'GET' && pathname === '/api/vitals/thresholds') {
      const profileId = url.searchParams.get('profileId') || session?.profileId || 'AST-7426';
      const environment = url.searchParams.get('environment') || undefined;
      const thresholds = getVitalThresholds(profileId, environment);
      return sendJson(res, 200, thresholds);
    }

    if (method === 'POST' && pathname === '/api/vitals/thresholds') {
      if (!session) return sendJson(res, 401, { error: 'Authentication required' });
      const body = await parseJsonBody(req);
      const thresholds = updateVitalThresholds(body.profileId, body.thresholds, session);
      return sendJson(res, 200, thresholds);
    }

    // 4. BODY & SYMPTOM ASSESSMENTS
    if (method === 'POST' && pathname === '/api/symptoms') {
      if (!session) return sendJson(res, 401, { error: 'Authentication required' });
      const body = await parseJsonBody(req);
      const result = recordSymptomAssessment(body, session);
      return sendJson(res, 201, result);
    }

    if (method === 'GET' && pathname === '/api/symptoms') {
      const profileId = url.searchParams.get('profileId') || session?.profileId || 'AST-7426';
      const environment = url.searchParams.get('environment') || undefined;
      const history = getSymptomHistory(profileId, environment);
      return sendJson(res, 200, history);
    }

    // 5. REVIEWED MEDICAL KNOWLEDGE & CLINICAL CAUSES
    if (method === 'GET' && pathname === '/api/medical-guidance/evaluate') {
      const regionId = url.searchParams.get('regionId') || 'head';
      const symptomType = url.searchParams.get('symptomType') || 'Pressure';
      const environment = url.searchParams.get('environment') || 'Spacecraft';
      const guidance = evaluateSymptomGuidance(regionId, symptomType, environment);
      return sendJson(res, 200, guidance);
    }

    if (method === 'GET' && pathname === '/api/medical-guidance/rules') {
      const rules = getAllReviewedRules();
      return sendJson(res, 200, rules);
    }

    // 6. MENTAL WELLBEING
    if (method === 'POST' && pathname === '/api/wellbeing') {
      if (!session) return sendJson(res, 401, { error: 'Authentication required' });
      const body = await parseJsonBody(req);
      const result = recordWellbeingCheckin(body, session);
      return sendJson(res, 201, result);
    }

    if (method === 'GET' && pathname === '/api/wellbeing') {
      const profileId = url.searchParams.get('profileId') || session?.profileId || 'AST-7426';
      const environment = url.searchParams.get('environment') || undefined;
      const history = getWellbeingHistory(profileId, environment);
      return sendJson(res, 200, history);
    }

    if (method === 'POST' && pathname.startsWith('/api/wellbeing/') && pathname.endsWith('/review')) {
      if (!session) return sendJson(res, 401, { error: 'Authentication required' });
      const recordId = pathname.split('/')[3];
      const body = await parseJsonBody(req);
      const result = reviewWellbeingRecord(recordId, body.surgeonNotes, session);
      if (!result.success) return sendJson(res, 403, result);
      return sendJson(res, 200, result);
    }

    // 7. HEALTH ANALYTICS
    if (method === 'GET' && pathname === '/api/analytics') {
      const profileId = url.searchParams.get('profileId') || session?.profileId || 'AST-7426';
      const environment = url.searchParams.get('environment') || 'Spacecraft';
      const analytics = getCalculatedAnalytics(profileId, environment);
      return sendJson(res, 200, analytics);
    }

    // 8. RISK ASSESSMENT ENGINE
    if (method === 'GET' && pathname === '/api/risk-assessment') {
      const profileId = url.searchParams.get('profileId') || session?.profileId || 'AST-7426';
      const environment = url.searchParams.get('environment') || 'Spacecraft';
      const risks = evaluateAerospaceRisks(profileId, environment);
      return sendJson(res, 200, risks);
    }

    // 9. ENVIRONMENTAL HAZARDS TELEMETRY
    if (method === 'GET' && pathname === '/api/hazards') {
      const environment = url.searchParams.get('environment') || 'Spacecraft';
      const telemetry = getEnvironmentalTelemetry(environment);
      return sendJson(res, 200, telemetry);
    }

    if (method === 'POST' && pathname === '/api/hazards/readings') {
      const body = await parseJsonBody(req);
      const result = recordHazardReading(body, session || undefined);
      return sendJson(res, 201, result);
    }

    if (method === 'POST' && pathname === '/api/hazards/config') {
      if (!session) return sendJson(res, 401, { error: 'Authentication required' });
      const body = await parseJsonBody(req);
      const result = updateHazardConfig(body.id, body.minSafe, body.maxSafe, body.isActive, session);
      if (!result.success) return sendJson(res, 403, result);
      return sendJson(res, 200, result);
    }

    // 10. UNIFIED ALERTS & ACTIONS
    if (method === 'GET' && pathname === '/api/alerts') {
      const environment = url.searchParams.get('environment') || undefined;
      const profileId = url.searchParams.get('profileId') || undefined;
      const alerts = getActiveAlerts(environment, profileId);
      return sendJson(res, 200, alerts);
    }

    if (method === 'POST' && pathname.startsWith('/api/alerts/') && pathname.endsWith('/acknowledge')) {
      if (!session) return sendJson(res, 401, { error: 'Authentication required' });
      const alertId = pathname.split('/')[3];
      const result = acknowledgeAlert(alertId, session);
      if (!result.success) return sendJson(res, 400, result);
      return sendJson(res, 200, result);
    }

    if (method === 'POST' && pathname.startsWith('/api/alerts/') && pathname.endsWith('/review')) {
      if (!session) return sendJson(res, 401, { error: 'Authentication required' });
      const alertId = pathname.split('/')[3];
      const result = surgeonReviewAlert(alertId, session);
      if (!result.success) return sendJson(res, 403, result);
      return sendJson(res, 200, result);
    }

    // 11. REPORTS GENERATION & EXPORT
    if (method === 'POST' && pathname === '/api/reports/generate') {
      if (!session) return sendJson(res, 401, { error: 'Authentication required' });
      const body = await parseJsonBody(req);
      try {
        const report = generateMissionReport(body, session);
        return sendJson(res, 200, report);
      } catch (err: any) {
        return sendJson(res, 403, { error: err.message });
      }
    }

    // 12. AUDIT TRAIL
    if (method === 'GET' && pathname === '/api/audit-logs') {
      if (!session) return sendJson(res, 401, { error: 'Authentication required' });
      const logs = getAuditLogs(session);
      return sendJson(res, 200, logs);
    }

    // 404
    return sendJson(res, 404, { error: `Endpoint ${method} ${pathname} not found.` });
  } catch (err: any) {
    console.error(`[ASTRA Server Error] ${err.stack || err.message}`);
    return sendJson(res, 500, { error: 'Internal space health server error', details: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 ASTRA Space Health Intelligence Server Active`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🛡️  Database: node:sqlite (ASTRA Persistent Engine)`);
  console.log(`⏱️  Epoch: ${new Date().toUTCString()}`);
  console.log(`=======================================================`);
});

export default server;
