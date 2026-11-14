/**
 * ASTRA Space Health Intelligence Client
 * Handles authenticated API communication with the ASTRA backend server.
 * Implements an Offline-First fallback for deep-space communication interruptions.
 */

const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://localhost:4000/api'
  : '/api';

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

class AstraApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('astra_auth_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('astra_auth_token', token);
      else localStorage.removeItem('astra_auth_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errMsg = `Server returned ${res.status}`;
      try {
        const errorData = await res.json();
        errMsg = errorData.error || errorData.details || errMsg;
      } catch {
        // use default error message
      }
      throw new Error(errMsg);
    }

    return res.json() as Promise<T>;
  }

  // 1. Auth & Profiles
  async login(identifier: string, password: string): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    const res = await this.request<{ success: boolean; session?: UserSession; error?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    if (res.success && res.session?.token) {
      this.setToken(res.session.token);
    }
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser(): Promise<{ user: UserSession } | null> {
    try {
      return await this.request<{ user: UserSession }>('/auth/me');
    } catch {
      return null;
    }
  }

  async getProfiles(): Promise<any[]> {
    return this.request<any[]>('/profiles');
  }

  async createProfile(data: any): Promise<any> {
    return this.request<any>('/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 2. Mission Setup
  async updateMissionSetup(profileId: string, environment: string, phase: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/profiles/${profileId}/mission`, {
      method: 'PATCH',
      body: JSON.stringify({ environment, phase }),
    });
  }

  // 3. Vitals & Wearables
  async recordVital(vital: {
    profileId: string;
    environment: string;
    metric: string;
    value: number;
    unit: string;
    source: string;
    sensorId?: string;
    dataStatus?: 'real' | 'simulated';
  }): Promise<{ id: string; status: string }> {
    return this.request<{ id: string; status: string }>('/vitals', {
      method: 'POST',
      body: JSON.stringify(vital),
    });
  }

  async ingestWearables(profileId: string, environment: string, readings: any[]): Promise<any> {
    return this.request<any>('/vitals/ingest-wearable', {
      method: 'POST',
      body: JSON.stringify({ profileId, environment, readings }),
    });
  }

  async getVitals(profileId: string, environment?: string, metric?: string): Promise<any[]> {
    const params = new URLSearchParams({ profileId });
    if (environment) params.append('environment', environment);
    if (metric) params.append('metric', metric);
    return this.request<any[]>(`/vitals?${params.toString()}`);
  }

  async getThresholds(profileId: string, environment?: string): Promise<any[]> {
    const params = new URLSearchParams({ profileId });
    if (environment) params.append('environment', environment);
    return this.request<any[]>(`/vitals/thresholds?${params.toString()}`);
  }

  async updateThresholds(profileId: string, thresholds: any[]): Promise<any[]> {
    return this.request<any[]>('/vitals/thresholds', {
      method: 'POST',
      body: JSON.stringify({ profileId, thresholds }),
    });
  }

  // 4. Symptoms & Body Assessment
  async recordSymptom(symptom: {
    profileId: string;
    environment: string;
    regionId: string;
    regionName: string;
    symptomType: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    intensity: number;
    onsetTime: string;
    notes?: string;
  }): Promise<{ id: string; status: string }> {
    return this.request<{ id: string; status: string }>('/symptoms', {
      method: 'POST',
      body: JSON.stringify(symptom),
    });
  }

  async getSymptoms(profileId: string, environment?: string): Promise<any[]> {
    const params = new URLSearchParams({ profileId });
    if (environment) params.append('environment', environment);
    return this.request<any[]>(`/symptoms?${params.toString()}`);
  }

  // 5. Medical Guidance
  async evaluateMedicalGuidance(regionId: string, symptomType: string, environment: string): Promise<any> {
    const params = new URLSearchParams({ regionId, symptomType, environment });
    return this.request<any>(`/medical-guidance/evaluate?${params.toString()}`);
  }

  // 6. Wellbeing
  async recordWellbeing(data: {
    profileId: string;
    environment: string;
    mood: string;
    energyScore: number;
    stressScore: number;
    cognitiveWorkload: number;
    sleepHours: number;
    sleepEfficiency: number;
    notes?: string;
  }): Promise<any> {
    return this.request<any>('/wellbeing', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWellbeingHistory(profileId: string, environment?: string): Promise<any[]> {
    const params = new URLSearchParams({ profileId });
    if (environment) params.append('environment', environment);
    return this.request<any[]>(`/wellbeing?${params.toString()}`);
  }

  async reviewWellbeing(recordId: string, surgeonNotes: string): Promise<any> {
    return this.request<any>(`/wellbeing/${recordId}/review`, {
      method: 'POST',
      body: JSON.stringify({ surgeonNotes }),
    });
  }

  // 7. Analytics & Risks
  async getAnalytics(profileId: string, environment: string): Promise<any> {
    return this.request<any>(`/analytics?profileId=${profileId}&environment=${environment}`);
  }

  async getRiskAssessment(profileId: string, environment: string): Promise<any[]> {
    return this.request<any[]>(`/risk-assessment?profileId=${profileId}&environment=${environment}`);
  }

  // 8. Hazards
  async getHazards(environment: string): Promise<any[]> {
    return this.request<any[]>(`/hazards?environment=${environment}`);
  }

  // 9. Alerts
  async getAlerts(environment?: string, profileId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (environment) params.append('environment', environment);
    if (profileId) params.append('profileId', profileId);
    return this.request<any[]>(`/alerts?${params.toString()}`);
  }

  async acknowledgeAlert(alertId: string): Promise<any> {
    return this.request<any>(`/alerts/${alertId}/acknowledge`, { method: 'POST' });
  }

  async surgeonReviewAlert(alertId: string): Promise<any> {
    return this.request<any>(`/alerts/${alertId}/review`, { method: 'POST' });
  }

  // 10. Reports
  async generateReport(options: {
    profileId: string;
    environment: string;
    includeVitals: boolean;
    includeSymptoms: boolean;
    includeWellbeing: boolean;
    includeHazards: boolean;
    format: 'json' | 'csv' | 'markdown';
  }): Promise<{ format: string; filename: string; data: any }> {
    return this.request<any>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  // 11. Audit Logs
  async getAuditLogs(): Promise<any[]> {
    return this.request<any[]>('/audit-logs');
  }
}

export const astraApi = new AstraApiClient();
