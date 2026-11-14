import { useState, useEffect } from 'react';

// Official assets
import imgAstraMissionEnvironmentDesktop from './assets/figma/imgAstraMissionEnvironmentDesktop.png';
import imgLunarResearchStation from './assets/figma/imgLunarResearchStation.png';
import imgMarsSettlement from './assets/figma/imgMarsSettlement.png';
import { AstraLogo } from './components/AstraLogo';
import imgKeyboardHelpIcon from './assets/figma/imgKeyboardHelpIcon.svg';
import imgVoiceAssistanceIcon from './assets/figma/imgVoiceAssistanceIcon.svg';

// Modular Components
import { MissionNavigation } from './components/MissionNavigation';
import { AstronautStatusBar } from './components/AstronautStatusBar';
import { EnvironmentCards, type EnvironmentType } from './components/EnvironmentCards';
import { PhaseConfirmationPanel } from './components/PhaseConfirmationPanel';
import { GuidanceActionDock } from './components/GuidanceActionDock';
import { EnvironmentPhaseSwitcher } from './components/EnvironmentPhaseSwitcher';
import { getPhaseLabel } from './data/environmentData';

// Operational Screens
import { MissionDashboard } from './components/MissionDashboard';
import { BodyAssessment } from './components/BodyAssessment';
import { VitalSigns } from './components/VitalSigns';
import { MentalWellbeing } from './components/MentalWellbeing';
import { HealthAnalytics } from './components/HealthAnalytics';
import { RiskAssessment } from './components/RiskAssessment';
import { MedicalGuidance } from './components/MedicalGuidance';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { AstronautProfileEntry } from './components/AstronautProfileEntry';
import { useMeasurements } from './data/measurementStore';
import { getStoredAuthSession, saveAuthSession, clearAuthSession, type AuthUser } from './auth/authService';

// Slug to Screen mapping for URL hash routing and refresh persistence
const SLUG_TO_SCREEN: Record<string, string> = {
  'dashboard': 'Dashboard',
  'home': 'Dashboard',
  'body-assessment': 'Body Assessment',
  'vital-signs': 'Vital Signs',
  'mental-wellbeing': 'Mental Well-being',
  'health-analytics': 'Health Analytics',
  'risk-assessment': 'Risk Assessment',
  'exercise-recovery': 'Exercise & Recovery',
  'daily-health-routine': 'Daily Health Routine',
  'alert-action-center': 'Alert & Action Center',
  'medical-guidance': 'Medical Guidance',
  'reports': 'Reports',
  'settings': 'Settings',
  'mission-setup': 'Mission setup',
};

const SCREEN_TO_SLUG: Record<string, string> = {
  'Dashboard': 'dashboard',
  'Home': 'dashboard',
  'Body Assessment': 'body-assessment',
  'Vital Signs': 'vital-signs',
  'Mental Well-being': 'mental-wellbeing',
  'Health Analytics': 'health-analytics',
  'Risk Assessment': 'risk-assessment',
  'Exercise & Recovery': 'exercise-recovery',
  'Daily Health Routine': 'daily-health-routine',
  'Alert & Action Center': 'alert-action-center',
  'Medical Guidance': 'medical-guidance',
  'Reports': 'reports',
  'Settings': 'settings',
  'Mission setup': 'mission-setup',
};


function getInitialScreen(): string {
  if (typeof window !== 'undefined') {
    const isCalibrated = localStorage.getItem('astra_is_calibrated') === 'true';
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (hash && SLUG_TO_SCREEN[hash]) {
      return SLUG_TO_SCREEN[hash];
    }
    // A fresh visit to the app root always starts with mission setup.
    if (!hash) {
      return 'Mission setup';
    }
    const saved = localStorage.getItem('astra_active_screen');
    if (saved && (saved === 'Home' || saved === 'Dashboard')) {
      return 'Dashboard';
    }
    if (saved && SCREEN_TO_SLUG[saved]) {
      return saved;
    }
    if (!isCalibrated) {
      return 'Mission setup';
    }
    return 'Dashboard';
  }
  return 'Mission setup';
}

function getInitialEnv(): EnvironmentType {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('astra_selected_env') as EnvironmentType;
    if (saved === 'Spacecraft' || saved === 'Moon' || saved === 'Mars') {
      return saved;
    }
  }
  return 'Spacecraft';
}

function getInitialCalibrated(): boolean {
  if (typeof window !== 'undefined') {
    const profileId = localStorage.getItem('astra_active_profile_id');
    return localStorage.getItem('astra_is_calibrated_' + profileId) === 'true' || (profileId === 'AST-7426' && localStorage.getItem('astra_is_calibrated') === 'true');
  }
  return false;
}

function getInitialPhase(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('astra_selected_phase');
    if (saved) return saved;
  }
  return '2';
}

export default function App() {
  const { profiles, activeProfile, selectProfile, createAstronautProfile, isLoading: isProfileLoading, storageError: profileStorageError } = useMeasurements();
  const [authSession, setAuthSession] = useState(() => getStoredAuthSession());
  const [activeScreen, setActiveScreen] = useState<string>(getInitialScreen);
  const [isFreshEntry, setIsFreshEntry] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.location.hash === '',
  );
  const [selectedEnv, setSelectedEnv] = useState<EnvironmentType>(getInitialEnv);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(getInitialPhase);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(true);
  const [timeUtc, setTimeUtc] = useState<string>(() => `${new Date().toISOString().slice(11, 19)} UTC`);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);
  const [showVoiceHelp, setShowVoiceHelp] = useState<boolean>(false);
  const [isCalibrated, setIsCalibrated] = useState<boolean>(getInitialCalibrated);
  const [devMode, setDevMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('astra_dev_mode');
    return saved === null ? true : saved === 'true';
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize state with URL hash & localStorage for refresh resilience
  const handleNavigate = (screen: string) => {
    setIsFreshEntry(false);
    const normalized = screen === 'Home' || screen === 'Dashboard' ? 'Dashboard' : screen;
    setActiveScreen(normalized);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astra_active_screen', normalized);
      const slug = SCREEN_TO_SLUG[normalized] || 'dashboard';
      if (window.location.hash !== `#${slug}`) {
        window.history.pushState(null, '', `#${slug}`);
      }
    }
  };

  const handleDevModeChange = (enabled: boolean) => {
    setDevMode(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astra_dev_mode', String(enabled));
    }
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (hash && SLUG_TO_SCREEN[hash]) {
        setActiveScreen(SLUG_TO_SCREEN[hash]);
        localStorage.setItem('astra_active_screen', SLUG_TO_SCREEN[hash]);
        setIsFreshEntry(false);
      } else if (!hash) {
        setActiveScreen('Mission setup');
        setIsFreshEntry(true);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Update localStorage when environment or calibration changes
  const handleEnvSelect = (env: EnvironmentType) => {
    setSelectedEnv(env);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astra_selected_env', env);
      if (activeProfile) localStorage.setItem('astra_selected_env_' + activeProfile.id, env);
    }
  };

  // Live UTC Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setTimeUtc(`${hours}:${minutes}:${seconds} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPhase = (phaseId: string) => {
    setSelectedPhase(phaseId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astra_selected_phase', phaseId);
      if (activeProfile) localStorage.setItem('astra_selected_phase_' + activeProfile.id, phaseId);
    }
    setIsConfirmed(false);
  };

  const handleCalibrationContinue = () => {
    if (!selectedPhase || !isConfirmed) return;
    setIsCalibrated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astra_is_calibrated_' + (activeProfile?.id ?? 'unknown'), 'true');
      if (activeProfile?.id === 'AST-7426') localStorage.setItem('astra_is_calibrated', 'true');
      localStorage.setItem('astra_selected_env', selectedEnv);
      if (activeProfile) localStorage.setItem('astra_selected_env_' + activeProfile.id, selectedEnv);
      localStorage.setItem('astra_selected_phase', selectedPhase);
      if (activeProfile) localStorage.setItem('astra_selected_phase_' + activeProfile.id, selectedPhase);
    }
    handleNavigate('Dashboard');
    const phaseLabel = getPhaseLabel(selectedEnv, selectedPhase);
    setToastMessage(`Mission environment confirmed: ${selectedEnv} [${phaseLabel}]. Operational telemetry active.`);
    setTimeout(() => setToastMessage(null), 6000);
  };

  const canContinue = selectedPhase !== null && isConfirmed;
  const isSetupScreen = activeScreen === 'Mission setup';
  const isMoon = selectedEnv === 'Moon';
  const isMars = selectedEnv === 'Mars';

  const handleLogout = () => {
    clearAuthSession();
    setAuthSession({ isAuthenticated: false, user: null, token: null, loginTime: null });
    selectProfile(null);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
  };

  const continueWithProfile = (profileId: string) => {
    const savedEnv = localStorage.getItem('astra_selected_env_' + profileId) as EnvironmentType | null;
    const nextEnv = savedEnv === 'Spacecraft' || savedEnv === 'Moon' || savedEnv === 'Mars' ? savedEnv : 'Spacecraft';
    const savedPhase = localStorage.getItem('astra_selected_phase_' + profileId) || '2';
    const calibrated = localStorage.getItem('astra_is_calibrated_' + profileId) === 'true';
    setSelectedEnv(nextEnv); setSelectedPhase(savedPhase); setIsCalibrated(calibrated);
    setIsFreshEntry(true); setActiveScreen('Mission setup');
    if (typeof window !== 'undefined') { localStorage.setItem('astra_selected_env', nextEnv); localStorage.setItem('astra_selected_phase', savedPhase); localStorage.setItem('astra_active_screen', 'Mission setup'); window.history.replaceState(null, '', '#mission-setup'); }
  };

  if (isProfileLoading) return <main className="min-h-screen bg-[#020b20] p-8 text-center text-[#d8e9f7]">Loading astronaut profiles...</main>;

  // Route protection: When unauthenticated or no active profile, always show the Figma Login / Crew Identity Access page
  if (!authSession.isAuthenticated || !activeProfile) {
    return (
      <AstronautProfileEntry
        profiles={profiles}
        storageError={profileStorageError}
        isReady={!isProfileLoading && !profileStorageError}
        onSelect={(id) => {
          const profile = profiles.find((p) => p.id === id);
          if (profile) {
            const session = saveAuthSession({
              id: profile.id,
              name: profile.fullName,
              email: `${profile.id.toLowerCase()}@nasa.gov`,
              role: profile.role,
              isDemo: profile.isDemo,
            });
            setAuthSession(session);
          }
          selectProfile(id);
          continueWithProfile(id);
        }}
        onLoginSuccess={(user: AuthUser) => {
          const session = saveAuthSession(user);
          setAuthSession(session);
          selectProfile(user.id);
          continueWithProfile(user.id);
        }}
        onCreate={async (profile) => {
          await createAstronautProfile(profile);
          const session = saveAuthSession({
            id: profile.id,
            name: profile.fullName,
            email: `${profile.id.toLowerCase()}@nasa.gov`,
            role: profile.role,
          });
          setAuthSession(session);
          continueWithProfile(profile.id);
        }}
      />
    );
  }

  return (
    <div className={`relative min-h-screen w-full ${isMoon ? 'bg-[#080f1c]' : isMars ? 'bg-[#150c0e]' : 'bg-[#020b20]'} text-[#ecf5ff] flex justify-center items-start p-3 sm:p-5 overflow-x-hidden font-['Manrope'] selection:bg-[#38e1f0]/30 selection:text-white`}>
      {/* Background space backdrop with responsive cover & proper framing */}
      <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${isMoon ? 'bg-[#080f1c]' : isMars ? 'bg-[#150c0e]' : 'bg-[#020b20]'}`}>
        <img
          src={
            isMoon
              ? imgLunarResearchStation
              : isMars
              ? imgMarsSettlement
              : imgAstraMissionEnvironmentDesktop
          }
          alt="ASTRA Mission Environment Background"
          className="w-full h-full object-cover object-[center_top] opacity-45 transition-all duration-700"
        />
        <div
          className={`absolute inset-0 backdrop-blur-[0.5px] ${
            isMoon
              ? 'bg-gradient-to-b from-[rgba(8,15,28,0.25)] via-[rgba(8,15,28,0.55)] to-[rgba(8,15,28,0.92)]'
              : isMars
              ? 'bg-gradient-to-b from-[rgba(21,12,14,0.3)] via-[rgba(21,12,14,0.6)] to-[rgba(21,12,14,0.92)]'
              : 'bg-[#020714]/40'
          }`}
        />
      </div>

      {/* ========================================================================= */}
      {/* SCENARIO A: INITIAL MISSION SETUP ENTRY SCREEN (Figma Node 14:2)          */}
      {/* ========================================================================= */}
      {isSetupScreen ? (
        <div className="relative z-10 w-full max-w-none mx-auto flex flex-col gap-5 py-4 animate-fadeIn">
          {/* Brand & Introduction Header */}
          <section className="w-full bg-[rgba(3,16,38,0.92)] border border-[rgba(33,75,107,0.45)] backdrop-blur-md rounded-[20px] px-6 py-6 flex flex-col items-center justify-center text-center gap-2 shadow-xl relative">
            {isCalibrated && !isFreshEntry && (
              <button
                type="button"
                onClick={() => handleNavigate('Dashboard')}
                className="absolute top-4 left-5 text-[13px] text-[#29c8ef] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                ← Return to Dashboard
              </button>
            )}

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <AstraLogo variant="symbol" className="w-10 h-10 shrink-0" imgClassName="w-10 h-10" />
                <span className="font-['Inter'] font-medium text-[28px] sm:text-[31px] tracking-[8px] sm:tracking-[9.3px] text-[#edf5ff]">
                  ASTRA
                </span>
              </div>
              <span className="text-[13px] sm:text-[14px] font-medium text-[#edf5ff]/80">
                Space Health Intelligence
              </span>
            </div>

            <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#f2f8ff] tracking-tight mt-1">
              Configure Your Mission Environment
            </h1>
            <p className="text-[15px] sm:text-[17px] text-[#dcebfc] max-w-2xl font-normal">
              Choose your environment and mission phase, then confirm to personalize your health guidance.
            </p>
          </section>

          {/* STEP 1: Environment Selection */}
          <section className="flex flex-col gap-3 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#ecf5ff]">
                1 / Select your environment
              </h2>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                  className="bg-[rgba(10,33,59,0.94)] hover:bg-[#123860] border border-[#547c9e] rounded-[10px] h-[44px] px-4 flex items-center justify-center gap-2 text-[14px] font-medium text-[#ecf5ff] transition-all cursor-pointer"
                >
                  <img src={imgKeyboardHelpIcon} alt="" className="w-5 h-5 shrink-0" />
                  <span>Keyboard help</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowVoiceHelp(!showVoiceHelp)}
                  className="bg-[rgba(10,33,59,0.94)] hover:bg-[#123860] border border-[#547c9e] rounded-[10px] h-[44px] px-4 flex items-center justify-center gap-2 text-[14px] font-medium text-[#ecf5ff] transition-all cursor-pointer"
                >
                  <img src={imgVoiceAssistanceIcon} alt="" className="w-5 h-5 shrink-0" />
                  <span>Voice assistance</span>
                </button>
              </div>
            </div>

            {/* Collapsible Accessibility Guidance */}
            {showKeyboardHelp && (
              <div className="bg-[#08223e] border border-[#38e1f0]/60 p-3.5 rounded-[12px] text-[14px] text-[#dcebfc] flex justify-between items-center">
                <span>Keyboard Nav: Use [Tab] to cycle through environments, [Space] to select, [1-4] for phases.</span>
                <button type="button" onClick={() => setShowKeyboardHelp(false)} className="text-[#a8bcd5] hover:text-white ml-2 text-xs">✕ Close</button>
              </div>
            )}
            {showVoiceHelp && (
              <div className="bg-[#08223e] border border-[#04e5d4]/60 p-3.5 rounded-[12px] text-[14px] text-[#dcebfc] flex justify-between items-center">
                <span>Voice Assist Active: Say "Select Spacecraft", "Select Moon", or "Confirm Mission".</span>
                <button type="button" onClick={() => setShowVoiceHelp(false)} className="text-[#a8bcd5] hover:text-white ml-2 text-xs">✕ Close</button>
              </div>
            )}

            {/* Reusable Environment Cards */}
            <EnvironmentCards
              selectedEnv={selectedEnv}
              onSelect={handleEnvSelect}
            />

            <p className="text-[13.5px] text-[#c0d4e8] leading-normal pt-1">
              Operational profiles only — no live gravity, radiation or temperature readings are shown.
            </p>
          </section>

          {/* STEP 2: Mission Phase Confirmation */}
          <PhaseConfirmationPanel
            selectedEnv={selectedEnv}
            selectedPhase={selectedPhase}
            onSelectPhase={handleSelectPhase}
            isConfirmed={isConfirmed}
            onConfirmChange={setIsConfirmed}
          />

          {/* STEP 3: Guidance & Action Dock */}
          <GuidanceActionDock
            canContinue={canContinue}
            selectedPhase={selectedPhase}
            isConfirmed={isConfirmed}
            onContinue={handleCalibrationContinue}
            selectedEnv={selectedEnv}
          />
        </div>
      ) : (
        /* ========================================================================= */
        /* SCENARIO B: OPERATIONAL ASTRA APPLICATION WITH FULL 9-ITEM REGULAR SIDEBAR */
        /* ========================================================================= */
        <div className="relative z-10 w-full max-w-none flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Modular Navigation Rail (Regular 9 ASTRA items, no Mission Setup) */}
          <MissionNavigation
            activeScreen={activeScreen}
            isCalibrated={isCalibrated}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            devMode={devMode}
            currentEnv={selectedEnv}
          />

          {/* Main Operational Workspace */}
          <main className="flex-1 flex flex-col gap-4 min-w-0 w-full">
            
            {/* Top Astronaut Status Header */}
            <AstronautStatusBar
              timeUtc={timeUtc}
              isCalibrated={isCalibrated}
              environmentName={selectedEnv === 'Spacecraft' ? 'Spacecraft / In Transit' : selectedEnv === 'Moon' ? 'Lunar Surface - Active' : 'Mars Surface - Active'}
              currentEnv={selectedEnv}
              profile={activeProfile}
              onSwitchProfile={handleLogout}
              onLogout={handleLogout}
            />

            {/* Persistent Environment & Phase Switcher */}
            <EnvironmentPhaseSwitcher
              currentEnv={selectedEnv}
              currentPhase={getPhaseLabel(selectedEnv, selectedPhase || '2')}
              onEnvChange={handleEnvSelect}
              onPhaseClick={() => handleNavigate('Mission setup')}
              devMode={devMode}
            />

            {/* ===================================================================== */}
            {/* SCREEN ROUTING (ALL 9 SIDEBAR ITEMS PERSISTING SELECTED ENVIRONMENT)   */}
            {/* ===================================================================== */}

            {/* 01: Home / Mission Dashboard */}
            {(activeScreen === 'Dashboard' || activeScreen === 'Home') && (
              <MissionDashboard
                currentEnv={selectedEnv}
                onNavigateToScreen={handleNavigate}
              />
            )}

            {/* 02: Human Body Assessment */}
            {activeScreen === 'Body Assessment' && (
              <BodyAssessment
                currentEnv={selectedEnv}
                onSaveCheckin={(symptom) => {
                  setToastMessage(`Body symptom "${symptom}" logged in astronaut medical record.`);
                  setTimeout(() => setToastMessage(null), 5000);
                }}
              />
            )}

            {/* 03: Vital Signs */}
            {activeScreen === 'Vital Signs' && (
              <VitalSigns
                currentEnv={selectedEnv}
                isCalibrated={isCalibrated}
              />
            )}

            {/* 04: Mental Well-being */}
            {activeScreen === 'Mental Well-being' && (
              <MentalWellbeing
                currentEnv={selectedEnv}
                isCalibrated={isCalibrated}
              />
            )}

            {/* 05: Health Analytics */}
            {activeScreen === 'Health Analytics' && (
              <HealthAnalytics
                currentEnv={selectedEnv}
                isCalibrated={isCalibrated}
              />
            )}

            {/* 06: Risk Assessment */}
            {activeScreen === 'Risk Assessment' && (
              <RiskAssessment
                currentEnv={selectedEnv}
                isCalibrated={isCalibrated}
                onNavigate={handleNavigate}
              />
            )}

            {/* Auxiliary Routes */}
            {activeScreen === 'Exercise & Recovery' && (
              <MedicalGuidance
                currentEnv={selectedEnv}
                isCalibrated={isCalibrated}
              />
            )}

            {activeScreen === 'Daily Health Routine' && (
              <VitalSigns
                currentEnv={selectedEnv}
                isCalibrated={isCalibrated}
              />
            )}

            {activeScreen === 'Alert & Action Center' && (
              <MedicalGuidance
                currentEnv={selectedEnv}
                isCalibrated={isCalibrated}
              />
            )}

            {/* 07: Medical Guidance */}
            {activeScreen === 'Medical Guidance' && (
              <MedicalGuidance
                currentEnv={selectedEnv}
                isCalibrated={isCalibrated}
              />
            )}

            {/* 08: Reports */}
            {activeScreen === 'Reports' && (
              <Reports
                currentEnv={selectedEnv}
                isCalibrated={isCalibrated}
              />
            )}

            {/* 09: Settings */}
            {activeScreen === 'Settings' && (
              <Settings
                currentEnv={selectedEnv}
                isCalibrated={isCalibrated}
                onNavigateToSetup={() => handleNavigate('Mission setup')}
                devMode={devMode}
                onToggleDevMode={handleDevModeChange}
              />
            )}

          </main>
        </div>
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#082a4d] border-2 border-[#38e1f0] text-[#ecf5ff] p-4 rounded-xl shadow-[0_0_30px_rgba(56,225,240,0.4)] flex items-center gap-3 animate-fadeIn">
          <span className="text-2xl">🚀</span>
          <div>
            <p className="font-semibold text-[#38e1f0]">ASTRA Mission Update</p>
            <p className="text-sm text-[#dcebfc]">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
