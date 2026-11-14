import { astraApi } from '../api/astraClient';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isDemo?: boolean;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  loginTime: string | null;
}

const AUTH_STORAGE_KEY = 'astra_auth_session';

export function getStoredAuthSession(): AuthSession {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, token: null, loginTime: null };
  }
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { isAuthenticated: false, user: null, token: null, loginTime: null };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.isAuthenticated === 'boolean' && parsed.user) {
      return parsed;
    }
  } catch {
    // If parse fails, clear corrupted session
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return { isAuthenticated: false, user: null, token: null, loginTime: null };
}

export function saveAuthSession(user: AuthUser, token?: string): AuthSession {
  const sessionToken = token || 'dev-token-' + Math.random().toString(36).slice(2);
  const session: AuthSession = {
    isAuthenticated: true,
    user,
    token: sessionToken,
    loginTime: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem('astra_active_profile_id', user.id);
    astraApi.setToken(sessionToken);
  }
  return session;
}

export function clearAuthSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('astra_active_profile_id');
    astraApi.logout().catch(() => {});
    astraApi.setToken(null);
  }
}

/**
 * Validates credentials against the ASTRA Backend Server when online,
 * with seamless fallback for deep space offline scenarios.
 */
export async function authenticateWithBackendOrFallback(
  identifier: string,
  password: string,
  matchedProfile?: { id: string; fullName: string; role: string; isDemo?: boolean } | null
): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
  try {
    const apiResult = await astraApi.login(identifier, password);
    if (apiResult.success && apiResult.session) {
      const s = apiResult.session;
      const user: AuthUser = {
        id: s.profileId || s.userId,
        name: s.name,
        email: s.email,
        role: s.profileRole || s.role,
        isDemo: false,
      };
      saveAuthSession(user, s.token);
      return { success: true, user, token: s.token };
    }
    if (apiResult.error) {
      return { success: false, error: apiResult.error };
    }
  } catch {
    // Backend offline / network link delayed: perform resilient local authentication
    console.warn('[ASTRA Auth] Backend link inactive or offline. Engaging deep-space resilient local auth.');
  }

  // Local fallback
  const localRes = authenticateWithCredentials(identifier, password, matchedProfile);
  if (localRes.success && localRes.user) {
    saveAuthSession(localRes.user);
    return { success: true, user: localRes.user };
  }
  return localRes;
}

/**
 * Offline development / deep space local validator.
 */
export function authenticateWithCredentials(
  identifier: string,
  password: string,
  matchedProfile?: { id: string; fullName: string; role: string; isDemo?: boolean } | null
): { success: boolean; user?: AuthUser; error?: string } {
  const cleanId = identifier.trim();
  const cleanPass = password.trim();

  if (!cleanId) {
    return { success: false, error: 'Please enter your astronaut username, email, or ID.' };
  }
  if (!cleanPass) {
    return { success: false, error: 'Please enter your mission access password.' };
  }
  if (cleanPass.length < 3) {
    return { success: false, error: 'Password must contain at least 3 characters.' };
  }

  if (matchedProfile) {
    return {
      success: true,
      user: {
        id: matchedProfile.id,
        name: matchedProfile.fullName,
        email: `${matchedProfile.id.toLowerCase()}@nasa.gov`,
        role: matchedProfile.role,
        isDemo: matchedProfile.isDemo,
      },
    };
  }

  const isDefaultDemo =
    cleanId.toLowerCase().includes('elena') ||
    cleanId.toUpperCase() === 'AST-7426' ||
    cleanId.toLowerCase().includes('admin');

  return {
    success: true,
    user: {
      id: isDefaultDemo ? 'AST-7426' : 'AST-' + Math.floor(1000 + Math.random() * 9000),
      name: isDefaultDemo ? 'Dr. Elena Ramirez' : cleanId.split('@')[0],
      email: cleanId.includes('@') ? cleanId : `${cleanId.toLowerCase()}@nasa.gov`,
      role: isDefaultDemo ? 'Mission Specialist' : 'Flight Engineer',
      isDemo: isDefaultDemo,
    },
  };
}
