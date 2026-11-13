import type { EnvironmentType } from './EnvironmentCards';
import { getTheme } from '../utils/themeTokens';

interface EnvironmentPhaseSwitcherProps {
  currentEnv: EnvironmentType;
  currentPhase: string;
  onEnvChange: (env: EnvironmentType) => void;
  onPhaseClick?: () => void;
  devMode?: boolean;
}

export function EnvironmentPhaseSwitcher({
  currentEnv,
  currentPhase,
  onEnvChange,
  onPhaseClick,
  devMode = true,
}: EnvironmentPhaseSwitcherProps) {
  const theme = getTheme(currentEnv);
  const isMoon = currentEnv === 'Moon';
  const isMars = currentEnv === 'Mars';

  const envList: { id: EnvironmentType; label: string }[] = [
    { id: 'Spacecraft', label: 'Spacecraft / In Transit' },
    { id: 'Moon', label: 'Lunar Surface' },
    { id: 'Mars', label: 'Mars Surface' },
  ];

  const defaultPhase = isMoon
    ? 'Lunar surface operations'
    : isMars
    ? 'Mars surface exploration'
    : 'Deep-space transit';

  return (
    <div className={`w-full ${theme.cardSurface} rounded-[18px] px-4 py-2 flex flex-wrap items-center justify-between gap-3`}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="text-[10.5px] font-['Manrope'] font-semibold tracking-wider uppercase mr-1"
          style={{ color: theme.textSecondary }}
        >
          ENVIRONMENT
        </span>

        {envList.map((env) => {
          const isActive = currentEnv === env.id;
          return (
            <button
              type="button"
              key={env.id}
              onClick={() => onEnvChange(env.id)}
              disabled={!devMode && !isActive}
              aria-pressed={isActive}
              title={!devMode && !isActive ? 'Environment switching is locked outside developer mode. Reconfigure the mission to choose another environment.' : undefined}
              className={`h-[38px] px-4 rounded-[12px] text-[13px] font-['Manrope'] font-medium transition-all flex items-center justify-center ${!devMode && !isActive ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'} ${
                isActive
                  ? `${theme.navItemActive}`
                  : `bg-transparent hover:bg-white/5 border border-transparent`
              }`}
              style={{
                color: isActive ? theme.textPrimary : theme.textSecondary,
              }}
            >
              <span>{env.label}{!devMode && !isActive ? ' · Locked' : ''}</span>
            </button>
          );
        })}
      </div>

      {/* Phase Switch Button */}
      <button
        type="button"
        onClick={onPhaseClick}
        className={`rounded-[12px] px-4 py-1.5 flex flex-col items-start min-w-[210px] text-left transition-all cursor-pointer shadow-inner border`}
        style={{
          backgroundColor: isMoon ? 'rgba(16,24,36,0.9)' : isMars ? 'rgba(38,20,24,0.9)' : 'rgba(11,28,50,0.92)',
          borderColor: theme.cardBorderHex,
        }}
      >
        <span className="text-[10px] font-['Manrope'] flex items-center gap-1" style={{ color: theme.textSecondary }}>
          Phase · change <span style={{ color: theme.accent }}>›</span>
        </span>
        <span className="text-[12.5px] font-['Manrope'] font-semibold" style={{ color: theme.textPrimary }}>
          {currentPhase || defaultPhase}
        </span>
      </button>
    </div>
  );
}
