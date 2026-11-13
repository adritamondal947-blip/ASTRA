import imgDrElenaRamirezPortrait from '../assets/figma/imgDrElenaRamirezPortrait.png';
import imgClockIcon from '../assets/figma/imgClockIcon.svg';
import imgSignalIcon from '../assets/figma/imgSignalIcon.svg';
import type { EnvironmentType } from './EnvironmentCards';
import { getTheme } from '../utils/themeTokens';
import { getEnvironmentData } from '../data/environmentData';
import type { AstronautProfile } from '../data/measurementStore';

interface AstronautStatusBarProps {
  timeUtc: string;
  isCalibrated?: boolean;
  environmentName?: string;
  currentEnv?: EnvironmentType;
  profile: AstronautProfile;
  onSwitchProfile: () => void;
  onLogout?: () => void;
}

export function AstronautStatusBar({
  timeUtc,
  isCalibrated = true,
  environmentName,
  currentEnv = 'Spacecraft',
  profile,
  onSwitchProfile,
  onLogout,
}: AstronautStatusBarProps) {
  const theme = getTheme(currentEnv);
  const envData = getEnvironmentData(currentEnv);
  const locationLabel = environmentName || envData.locationLabel;

  return (
    <section className={`w-full ${theme.cardSurface} rounded-[20px] px-5 py-3.5 flex flex-wrap items-center justify-between gap-4`}>
      {/* Astronaut Identity */}
      <div className="flex items-center gap-3.5 min-w-[200px]">
        {profile.isDemo ? <img
          src={imgDrElenaRamirezPortrait}
          alt={profile.fullName}
          className="w-13 h-13 rounded-full border object-cover shrink-0"
          style={{ borderColor: theme.accent, boxShadow: `0 0 10px ${theme.accentGlow}` }}
        /> : <div aria-label={profile.fullName} className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border text-sm font-semibold" style={{ borderColor: theme.accent, color: theme.accent, boxShadow: `0 0 10px ${theme.accentGlow}` }}>{profile.fullName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>}
        <div className="flex flex-col text-[12.5px] leading-[1.35] font-['Manrope']">
          <span className="text-[11.5px]" style={{ color: theme.textSecondary }}>Astronaut</span>
          <span className="text-[14.5px] font-semibold" style={{ color: theme.textPrimary }}>{profile.fullName}</span>
          <span className="text-[11.5px]" style={{ color: theme.textSecondary }}>{profile.role} | {profile.id} | {profile.missionName} | Day {profile.flightDay}/{profile.missionDurationDays}</span>
        </div>
      </div>

      {/* Mission Status Badge */}
      <div className="flex flex-col text-[12.5px] leading-[1.35] min-w-[120px] font-['Manrope']">
        <span className="text-[11.5px]" style={{ color: theme.textSecondary }}>Mission Status</span>
        <span className="text-[14px] font-semibold" style={{ color: theme.accent }}>
          {isCalibrated ? 'Mission Profile Confirmed' : 'Demo - Pre-Setup'}
        </span>
        <span className="text-[11px]" style={{ color: theme.textMuted }}>{envData.environmentDisplayName}</span>
      </div>

      {/* Current Location */}
      <div className="flex flex-col text-[12.5px] leading-[1.35] min-w-[120px] font-['Manrope']">
        <span className="text-[11.5px]" style={{ color: theme.textSecondary }}>Current Location</span>
        <span className="text-[14px] font-semibold" style={{ color: theme.textPrimary }}>
          {locationLabel}
        </span>
        <span className="text-[11px]" style={{ color: theme.textMuted }}>{envData.environmental.gravityLabel}</span>
      </div>

      {/* UTC Timestamp */}
      <div className="flex items-center gap-2.5 font-['Manrope']">
        <img src={imgClockIcon} alt="UTC Time" className="w-5 h-5 shrink-0 opacity-80" />
        <div className="flex flex-col text-[12.5px] leading-[1.35]">
          <span className="text-[14px] font-semibold tabular-nums font-mono" style={{ color: theme.textPrimary }}>
            {timeUtc || '14:37:26 UTC'}
          </span>
          <span className="text-[11.5px]" style={{ color: theme.textSecondary }}>Mon, Apr 28, 2025</span>
        </div>
      </div>

      {/* Comm Link */}
      <div className="flex items-center gap-2.5 font-['Manrope']">
        <img src={imgSignalIcon} alt="Comm Link" className="w-5 h-5 shrink-0 opacity-80" />
        <div className="flex flex-col text-[12.5px] leading-[1.35]">
          <span className="text-[11.5px]" style={{ color: theme.textSecondary }}>Comm Link</span>
          <span className="text-[14px] font-semibold" style={{ color: theme.accent }}>
            {envData.commLinkStatus}
          </span>
          <span className="text-[11px]" style={{ color: theme.textMuted }}>{envData.commLinkDetails}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onSwitchProfile} className="rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-white/5 cursor-pointer" style={{ borderColor: `${theme.accent}55`, color: theme.accent }}>Switch astronaut</button>
        {onLogout && (
          <button type="button" onClick={onLogout} className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20 cursor-pointer">
            Log out
          </button>
        )}
      </div>
    </section>
  );
}
