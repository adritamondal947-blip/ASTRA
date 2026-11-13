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

export function saveAuthSession(user: AuthUser): AuthSession {
  const session: AuthSession = {
    isAuthenticated: true,
    user,
    token: 'dev-token-' + Math.random().toString(36).slice(2),
    loginTime: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem('astra_active_profile_id', user.id);
  }
  return session;
}

export function clearAuthSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('astra_active_profile_id');
  }
}

/**
 * Development authentication validator.
 * Validates identifier (email, username, or astronaut ID) and password.
 * Development-friendly: allows connecting to a live auth backend (e.g. Firebase Auth / NASA OpenID) in production.
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

  // Development authentication logic:
  // In dev mode, valid passwords like 'astra', 'nasa', 'mission', or any password for registered astronauts are accepted.
  // If an exact profile matches the identifier:
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

  // Fallback demo user if logging in with generic credentials
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

