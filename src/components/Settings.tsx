import type { EnvironmentType } from './EnvironmentCards';
import { getTheme } from '../utils/themeTokens';
import { getEnvironmentData } from '../data/environmentData';
import { useMeasurements } from '../data/measurementStore';
import { formatProfileMissionProgress } from '../data/measurementConfig';

interface SettingsProps {
  currentEnv?: EnvironmentType;
  isCalibrated?: boolean;
  onNavigateToSetup?: () => void;
  devMode?: boolean;
  onToggleDevMode?: (enabled: boolean) => void;
}

export function Settings({
  currentEnv = 'Spacecraft',
  isCalibrated = false,
  onNavigateToSetup,
  devMode = true,
  onToggleDevMode,
}: SettingsProps) {
  const { activeProfile } = useMeasurements();
  const theme = getTheme(currentEnv);
  const envData = getEnvironmentData(currentEnv);

  return (
    <div className="flex flex-col gap-4 w-full animate-fadeIn">
      {/* Title & Description */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-mono px-2 py-0.5 rounded ${theme.tagBadge}`}>
            SYSTEM PREFERENCES · {envData.environmentDisplayName.toUpperCase()}
          </span>
          <span
            className="text-[11px] font-mono px-2 py-0.5 rounded border"
            style={{
              backgroundColor: `${theme.accent}20`,
              borderColor: `${theme.accent}40`,
              color: theme.accent,
            }}
          >
            ASTRA CORE v2.4
          </span>
        </div>
        <h1
          className="text-[26px] sm:text-[28px] font-semibold tracking-tight"
          style={{ color: theme.textPrimary }}
        >
          System & Mission Telemetry Settings
        </h1>
        <p className="text-[14px]" style={{ color: theme.textSecondary }}>
          Configure sensor streaming rates, developer access, encryption protocols, and mission configuration for {envData.locationLabel}.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Section 1: Development & Demonstration Access */}
        <div className={`${theme.cardSurface} rounded-[18px] p-5 shadow-lg flex flex-col justify-between gap-4`}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.accent }}>
                DEVELOPER MODE
              </span>
              <span
                className="text-[11px] font-mono px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: `${theme.accent}20`,
                  borderColor: `${theme.accent}40`,
                  color: theme.accent,
                }}
              >
                {devMode ? 'ACTIVE · ALL ENVIRONMENTS' : 'LOCKED TO MISSION'}
              </span>
            </div>
            <h2 className="text-[18px] font-semibold" style={{ color: theme.textPrimary }}>
              Direct Screen Access & Simulation
            </h2>
            <p className="text-[13px] leading-relaxed" style={{ color: theme.textSecondary }}>
              When enabled, you can switch between all environments for development and demonstration. When disabled, the confirmed environment is locked in the dashboard; use mission setup to select another environment. Demo telemetry is shown where live sensor feeds are unavailable.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: `${theme.accent}30` }}>
            <span className="text-[13px]" style={{ color: theme.textPrimary }}>Developer environment access</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={devMode}
                onChange={(e) => onToggleDevMode?.(e.target.checked)}
                aria-label="Enable developer access to all environments"
                className="sr-only peer"
              />
              <div
                className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{
                  backgroundColor: devMode ? theme.accent : '#1e293b',
                }}
              />
            </label>
          </div>
        </div>

        {/* Section 2: Mission Setup Status */}
        <div className={`${theme.cardSurface} rounded-[18px] p-5 shadow-lg flex flex-col justify-between gap-4`}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.warning }}>
                MISSION ENVIRONMENT
              </span>
              <span
                className="text-[11px] font-mono px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: isCalibrated ? `${theme.accent}20` : `${theme.warning}20`,
                  borderColor: isCalibrated ? `${theme.accent}40` : `${theme.warning}40`,
                  color: isCalibrated ? theme.accent : theme.warning,
                }}
              >
                {isCalibrated ? 'CALIBRATED' : 'SETUP PENDING'}
              </span>
            </div>
            <h2 className="text-[18px] font-semibold" style={{ color: theme.textPrimary }}>
              Environment: {envData.environmentDisplayName}
            </h2>
            <p className="text-[13px] leading-relaxed" style={{ color: theme.textSecondary }}>
              {isCalibrated
                ? `Operational baseline confirmed for ${envData.locationLabel} (${formatProfileMissionProgress(activeProfile, currentEnv, envData.missionEpoch)}). Biometric thresholds are customized to active mission phase.`
                : `Mission setup is currently pending. You can re-run the configuration wizard anytime.`}
            </p>
          </div>

          <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: `${theme.accent}30` }}>
            <span className="text-[12px]" style={{ color: theme.textMuted }}>Mission setup wizard</span>
            <button
              type="button"
              onClick={onNavigateToSetup}
              className={`px-3.5 py-1.5 text-[12.5px] font-medium rounded-lg transition-all cursor-pointer ${theme.buttonSecondary}`}
            >
              Reconfigure Mission Environment ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
