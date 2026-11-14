import { useEffect, useState, type FormEvent } from 'react';
import type { AstronautProfile, NewAstronautProfile } from '../data/measurementStore';
import { authenticateWithBackendOrFallback } from '../auth/authService';
import { AstraLogo } from './AstraLogo';

interface AstronautProfileEntryProps {
  profiles: AstronautProfile[];
  storageError: string | null;
  isReady: boolean;
  onSelect: (id: string) => void;
  onCreate: (profile: NewAstronautProfile) => Promise<void>;
  onLoginSuccess?: (user: { id: string; name: string; email: string; role: string }) => void;
}

export function AstronautProfileEntry({
  profiles,
  storageError,
  isReady,
  onSelect,
  onCreate,
  onLoginSuccess,
}: AstronautProfileEntryProps) {
  // Mode: 'profiles' (default Figma view), 'credentials' (email/password sign-in), or 'create' (add profile)
  const [activeTab, setActiveTab] = useState<'profiles' | 'credentials'>('profiles');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isReady && profiles.length === 0) setCreating(true);
  }, [isReady, profiles.length]);

  // Credentials sign-in state
  const [identifier, setIdentifier] = useState('elena.ramirez@nasa.gov');
  const [password, setPassword] = useState('astra');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Create Profile state
  const [fullName, setFullName] = useState('');
  const [astronautId, setAstronautId] = useState('');
  const [role, setRole] = useState('');
  const [missionName, setMissionName] = useState('');
  const [flightDay, setFlightDay] = useState('1');
  const [missionDurationDays, setMissionDurationDays] = useState('180');
  const [createError, setCreateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Handle Credentials Sign In
  const handleCredentialLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      // Look for matching profile if any
      const matched = profiles.find(
        (p) =>
          p.id.toLowerCase() === identifier.trim().toLowerCase() ||
          p.fullName.toLowerCase().includes(identifier.trim().toLowerCase())
      );

      const result = await authenticateWithBackendOrFallback(identifier, password, matched);

      if (!result.success || !result.user) {
        setAuthError(result.error || 'Invalid astronaut credentials.');
        setIsAuthenticating(false);
        return;
      }

      // Successfully authenticated
      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      } else {
        onSelect(result.user.id);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Create Profile Submit
  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);
    setSaving(true);
    const generated = 'AST-' + Math.floor(1000 + Math.random() * 9000);
    const profileId = astronautId.trim().toUpperCase() || generated;
    try {
      await onCreate({
        id: profileId,
        fullName: fullName.trim(),
        role: role.trim(),
        missionName: missionName.trim(),
        flightDay: Number(flightDay),
        missionDurationDays: Number(missionDurationDays),
      });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Could not save the astronaut profile.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'AS';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <main className="relative isolate min-h-screen w-full overflow-x-hidden bg-[#02050E] px-4 py-8 text-[#edf3ff] font-['Manrope'] sm:px-6 flex flex-col justify-center items-center">
      {/* Background Layer: Deep Cosmic Space Canvas with Planets */}
      <img
        src="/brand/cosmic-panorama.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-30 h-full w-full object-cover object-center"
      />

      {/* Central Content Container */}
      <div className="relative z-10 w-full max-w-[660px] flex flex-col items-center my-auto py-4">
        {/* Top Header: Floating directly on space */}
        <div className="flex w-full flex-col items-center rounded-[24px] border border-[#9dcaff]/25 bg-[rgba(5,13,31,0.48)] px-5 py-5 text-center shadow-[0_18px_58px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:px-8 sm:py-6">
          {/* Logo Emblem: Astronaut seated on planet */}
          <AstraLogo
            variant="symbol"
            size="xl"
            alt="ASTRA astronaut and orbital planet emblem"
            imgClassName="h-[84px] sm:h-[96px] w-auto transition-transform duration-300 hover:scale-105"
          />

          {/* ASTRA Wordmark */}
          <h1 className="mt-3 font-['Inter'] font-medium text-[30px] sm:text-[34px] tracking-[0.38em] text-white uppercase pl-[0.38em] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            ASTRA
          </h1>

          {/* Space Health Intelligence Caption */}
          <p className="mt-1 text-[10.5px] sm:text-[11.5px] font-medium tracking-[0.26em] text-[#7288aa] uppercase">
            SPACE HEALTH INTELLIGENCE
          </p>

          {/* CREW IDENTITY ACCESS Pill */}
          <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-[#203657] bg-[#071329]/75 px-3.5 py-1 text-[10.5px] font-medium tracking-[0.16em] text-[#8ea6ca] shadow-sm backdrop-blur-sm">
            <svg
              className="w-3.5 h-3.5 text-[#8ea6ca]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>CREW IDENTITY ACCESS</span>
          </div>

          {/* Title */}
          <h2 className="mt-4 text-[24px] sm:text-[27px] font-semibold text-white tracking-tight">
            Welcome to your mission
          </h2>

          {/* Subtitle Description */}
          <p className="mt-1.5 text-xs sm:text-[13px] text-[#7187a8] max-w-[500px]">
            Choose your astronaut profile to enter ASTRA, or set up a new crew profile for this prototype.
          </p>
        </div>

        {storageError && (
          <div
            role="alert"
            className="mt-4 w-full rounded-xl border border-amber-400/40 bg-[#241a1a]/90 p-3 text-xs text-amber-200 backdrop-blur"
          >
            Profile storage restricted: {storageError}
          </div>
        )}

        {/* ========================================================================= */}
        {/* CARD CONTAINER                                                            */}
        {/* ========================================================================= */}
        <div className="mt-6 w-full rounded-[18px] border border-[#1b2d49] bg-[#060e22]/85 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          {/* Subtle Mode Switcher (Profiles vs Credentials) */}
          {!creating && (
            <div className="flex items-center justify-between border-b border-[#1b2d49]/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profiles');
                    setAuthError(null);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'profiles'
                      ? 'bg-[#152e54] text-white border border-[#2b5188]'
                      : 'text-[#6e85a6] hover:text-[#9bb5dc]'
                  }`}
                >
                  Saved Profiles
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('credentials');
                    setAuthError(null);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'credentials'
                      ? 'bg-[#152e54] text-white border border-[#2b5188]'
                      : 'text-[#6e85a6] hover:text-[#9bb5dc]'
                  }`}
                >
                  Password Sign-In
                </button>
              </div>

              <span className="text-[10px] font-mono tracking-wider text-[#4f75a6] uppercase">
                {activeTab === 'profiles' ? 'PROFILE SELECT' : 'CREW AUTH'}
              </span>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 1: SAVED PROFILES (EXACT FIGMA VIEW)                              */}
          {/* --------------------------------------------------------------------- */}
          {!creating && activeTab === 'profiles' && profiles.length > 0 && (
            <div>
              {/* Header */}
              <div>
                <h3 className="mt-1 text-[17px] sm:text-[18px] font-semibold text-white">
                  Saved astronaut profiles
                </h3>
                <p className="mt-0.5 text-xs text-[#6e85a6]">
                  Profiles and their health records stay on this device.
                </p>
              </div>

              {/* Profiles List */}
              <div className="mt-4 flex flex-col gap-3">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="rounded-xl border border-[#1a2d4b] bg-[#07142c]/75 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-colors hover:border-[#2b4c79]"
                  >
                    {/* Left: Avatar & Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Initials Circle */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#243c61] bg-[#0c1a32] text-xs font-semibold text-[#8ca8d0]">
                        {getInitials(profile.fullName)}
                      </div>

                      <div className="min-w-0">
                        <span className="block text-[9.5px] font-semibold tracking-[0.16em] text-[#5577a4] uppercase">
                          {profile.isDemo ? 'DEMO CREW PROFILE' : 'ASTRONAUT PROFILE'}
                        </span>
                        <h4 className="mt-0.5 text-[15px] font-semibold text-white truncate">
                          {profile.fullName}
                        </h4>
                        <p className="mt-0.5 text-[11.5px] text-[#7087a6] truncate">
                          {profile.id} <span className="mx-1 text-[#334b6e]">|</span> {profile.role}
                        </p>
                        <p className="text-[11.5px] text-[#7087a6] truncate">
                          {profile.missionName} <span className="mx-1 text-[#334b6e]">|</span> Day {profile.flightDay}/{profile.missionDurationDays}
                        </p>
                      </div>
                    </div>

                    {/* Right: Simulated Badge & Continue Button */}
                    <div className="flex flex-col sm:items-end justify-between gap-2.5 shrink-0">
                      {profile.isDemo ? (
                        <span className="inline-flex self-start sm:self-end items-center rounded-full border border-[#9b6534] bg-[#9b6534]/10 px-2.5 py-0.5 text-[9.5px] font-medium tracking-wide text-[#d9a473]">
                          SIMULATED DATA PROFILE
                        </span>
                      ) : (
                        <span className="inline-flex self-start sm:self-end items-center rounded-full border border-[#2a4e7a] bg-[#163054]/30 px-2.5 py-0.5 text-[9.5px] font-medium tracking-wide text-[#7ca0ce]">
                          ACTIVE PROFILE
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={!isReady}
                        onClick={() => {
                          if (onLoginSuccess) {
                            onLoginSuccess({
                              id: profile.id,
                              name: profile.fullName,
                              email: `${profile.id.toLowerCase()}@nasa.gov`,
                              role: profile.role,
                            });
                          } else {
                            onSelect(profile.id);
                          }
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#176694] to-[#255084] border border-[#308cc3]/50 px-4 py-2 text-xs sm:text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(23,102,148,0.35)] transition-all duration-200 hover:from-[#1b76ab] hover:to-[#2c5d9a] hover:border-[#38a5e0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#308cc3] disabled:opacity-50 cursor-pointer"
                      >
                        <span>Continue as {profile.fullName.split(' ')[0]}</span>
                        <span aria-hidden="true" className="text-sm font-bold">&rarr;</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer: + Create profile button & slogan */}
              <div className="mt-4 flex items-center justify-between pt-1">
                <button
                  type="button"
                  disabled={!isReady}
                  onClick={() => {
                    setCreateError(null);
                    setCreating(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#213757] bg-transparent px-3.5 py-1.5 text-xs font-medium text-[#88a5cc] transition-colors hover:border-[#365787] hover:text-white cursor-pointer"
                >
                  <span className="text-sm leading-none">+</span>
                  <span>Create astronaut profile</span>
                </button>

                <span className="text-[11px] text-[#4d6382] font-normal tracking-wide">
                  Your Health. Our Mission.
                </span>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 2: CREDENTIALS SIGN-IN (EMAIL/USERNAME & PASSWORD INPUTS)          */}
          {/* --------------------------------------------------------------------- */}
          {!creating && activeTab === 'credentials' && (
            <form onSubmit={handleCredentialLogin} className="flex flex-col gap-3.5">
              <div>
                <span className="block text-[10px] font-bold tracking-[0.2em] text-[#4f75a6] uppercase">
                  MISSION ACCESS CREDENTIALS
                </span>
                <h3 className="mt-1 text-[17px] sm:text-[18px] font-semibold text-white">
                  Astronaut Terminal Sign-In
                </h3>
                <p className="mt-0.5 text-xs text-[#6e85a6]">
                  Enter your mission identifier or official NASA email to authenticate.
                </p>
              </div>

              {authError && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-400/50 bg-rose-500/[0.12] p-2.5 text-xs text-rose-200"
                >
                  {authError}
                </div>
              )}

              {/* Email / Username / Astronaut ID Input */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#8ea6ca]">
                  Email or Astronaut ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. elena.ramirez@nasa.gov or AST-7426"
                    className="h-10 w-full rounded-lg border border-[#203657] bg-[#08152b] px-3.5 text-xs text-white placeholder:text-[#556d8f] focus:border-[#38a5e0] focus:outline-none focus:ring-1 focus:ring-[#38a5e0]"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#8ea6ca]">
                    Password
                  </label>
                  <span className="text-[10px] text-[#5577a4]">
                    Dev Hint: any password or 'astra'
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter mission access password"
                    className="h-10 w-full rounded-lg border border-[#203657] bg-[#08152b] px-3.5 pr-10 text-xs text-white placeholder:text-[#556d8f] focus:border-[#38a5e0] focus:outline-none focus:ring-1 focus:ring-[#38a5e0]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#6e85a6] hover:text-[#9bb5dc] transition cursor-pointer p-1"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#176694] to-[#255084] border border-[#308cc3]/50 px-5 py-2.5 text-xs sm:text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(23,102,148,0.35)] transition hover:from-[#1b76ab] hover:to-[#2c5d9a] disabled:opacity-50 cursor-pointer"
              >
                <span>{isAuthenticating ? 'Authenticating...' : 'Sign In to Terminal'}</span>
                <span aria-hidden="true">&rarr;</span>
              </button>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1b2d49]/60 text-[11px] text-[#6e85a6]">
                <button
                  type="button"
                  onClick={() => setActiveTab('profiles')}
                  className="text-[#88a5cc] hover:underline cursor-pointer"
                >
                  &larr; Switch to saved crew profiles
                </button>
                <span>Mock Auth / Dev Mode</span>
              </div>
            </form>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* CREATE PROFILE FORM                                                   */}
          {/* --------------------------------------------------------------------- */}
          {creating && (
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3.5">
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div>
                  <span className="block text-[10px] font-bold tracking-[0.2em] text-[#4f75a6] uppercase">
                    NEW CREW PROFILE
                  </span>
                  <h3 className="mt-1 text-[17px] sm:text-[18px] font-semibold text-white">
                    Astronaut and mission details
                  </h3>
                  <p className="mt-0.5 text-xs text-[#6e85a6]">
                    Saved locally in this browser prototype.
                  </p>
                </div>

                {profiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="rounded-lg border border-[#213757] px-3 py-1.5 text-xs font-medium text-[#88a5cc] hover:border-[#365787] hover:text-white transition cursor-pointer"
                  >
                    &larr; Back to saved profiles
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-[#8ca4c7]">
                  Full name <span className="text-[#38a5e0]">*</span>
                  <input
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Alex Reed"
                    className="mt-1 h-9 w-full rounded-lg border border-[#203657] bg-[#08152b] px-3 text-xs text-white placeholder:text-[#556d8f] focus:border-[#38a5e0] focus:outline-none focus:ring-1 focus:ring-[#38a5e0]"
                  />
                </label>

                <label className="text-xs text-[#8ca4c7]">
                  Astronaut ID <span className="text-[#556d8f]">(optional)</span>
                  <input
                    value={astronautId}
                    onChange={(e) => setAstronautId(e.target.value)}
                    placeholder="e.g. AST-1002"
                    className="mt-1 h-9 w-full rounded-lg border border-[#203657] bg-[#08152b] px-3 text-xs text-white placeholder:text-[#556d8f] focus:border-[#38a5e0] focus:outline-none focus:ring-1 focus:ring-[#38a5e0]"
                  />
                </label>

                <label className="text-xs text-[#8ca4c7]">
                  Mission role <span className="text-[#38a5e0]">*</span>
                  <input
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Commander"
                    className="mt-1 h-9 w-full rounded-lg border border-[#203657] bg-[#08152b] px-3 text-xs text-white placeholder:text-[#556d8f] focus:border-[#38a5e0] focus:outline-none focus:ring-1 focus:ring-[#38a5e0]"
                  />
                </label>

                <label className="text-xs text-[#8ca4c7]">
                  Mission name <span className="text-[#38a5e0]">*</span>
                  <input
                    required
                    value={missionName}
                    onChange={(e) => setMissionName(e.target.value)}
                    placeholder="e.g. Artemis III"
                    className="mt-1 h-9 w-full rounded-lg border border-[#203657] bg-[#08152b] px-3 text-xs text-white placeholder:text-[#556d8f] focus:border-[#38a5e0] focus:outline-none focus:ring-1 focus:ring-[#38a5e0]"
                  />
                </label>

                <label className="text-xs text-[#8ca4c7]">
                  Current mission day <span className="text-[#38a5e0]">*</span>
                  <input
                    required
                    type="number"
                    min="0"
                    max="10000"
                    value={flightDay}
                    onChange={(e) => setFlightDay(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-[#203657] bg-[#08152b] px-3 text-xs text-white placeholder:text-[#556d8f] focus:border-[#38a5e0] focus:outline-none focus:ring-1 focus:ring-[#38a5e0]"
                  />
                </label>

                <label className="text-xs text-[#8ca4c7]">
                  Planned duration (days) <span className="text-[#38a5e0]">*</span>
                  <input
                    required
                    type="number"
                    min="1"
                    max="10000"
                    value={missionDurationDays}
                    onChange={(e) => setMissionDurationDays(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-[#203657] bg-[#08152b] px-3 text-xs text-white placeholder:text-[#556d8f] focus:border-[#38a5e0] focus:outline-none focus:ring-1 focus:ring-[#38a5e0]"
                  />
                </label>
              </div>

              {createError && (
                <p role="alert" className="text-xs text-rose-300">
                  {createError}
                </p>
              )}

              <div className="mt-2 flex items-center justify-between gap-3 pt-1">
                <button
                  type="submit"
                  disabled={!isReady || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#176694] to-[#255084] border border-[#308cc3]/50 px-5 py-2 text-xs sm:text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(23,102,148,0.35)] transition hover:from-[#1b76ab] hover:to-[#2c5d9a] disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving profile...' : 'Save profile and continue'}
                  <span aria-hidden="true">&rarr;</span>
                </button>

                {profiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="text-xs text-[#7087a6] hover:text-white transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Bottom Lock Advisory */}
        <footer className="mt-5 sm:mt-6 flex items-center justify-center gap-1.5 text-center text-[10.5px] sm:text-[11px] text-[#556d8d]">
          <svg
            className="w-3.5 h-3.5 text-[#556d8d]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>ASTRA prototype / Device-local profiles / No password or live account connection</span>
        </footer>
      </div>
    </main>
  );
}
