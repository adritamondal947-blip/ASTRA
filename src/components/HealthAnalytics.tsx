import type { EnvironmentType } from './EnvironmentCards';
import { getTheme } from '../utils/themeTokens';
import { getEnvironmentData } from '../data/environmentData';
import { formatProfileMissionProgress } from '../data/measurementConfig';
import { MeasurementHistoryPanel } from './MeasurementHistoryPanel';
import { useMeasurements } from '../data/measurementStore';

interface HealthAnalyticsProps {
  currentEnv?: EnvironmentType;
  isCalibrated?: boolean;
}

export function HealthAnalytics({ currentEnv = 'Spacecraft', isCalibrated = false }: HealthAnalyticsProps) {
  const { activeProfile } = useMeasurements();
  const theme = getTheme(currentEnv);
  const envData = getEnvironmentData(currentEnv);

  return (
    <div className="flex flex-col gap-4 w-full animate-fadeIn">
      {/* Title & Description */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-mono px-2 py-0.5 rounded ${theme.tagBadge}`}>
            HEALTH INTELLIGENCE · {envData.environmentDisplayName.toUpperCase()}
          </span>
          <span className="text-[11px] font-mono text-[#8ba7c2]">
            {formatProfileMissionProgress(activeProfile, currentEnv, envData.missionEpoch)}
          </span>
          {!isCalibrated && (
            <span
              className="text-[11px] font-mono px-2 py-0.5 rounded border"
              style={{
                backgroundColor: `${theme.warning}20`,
                borderColor: `${theme.warning}40`,
                color: theme.warning,
              }}
            >
              DEMO DATA · PRE-SETUP
            </span>
          )}
        </div>
        <h1
          className="text-[26px] sm:text-[28px] font-semibold tracking-tight"
          style={{ color: theme.textPrimary }}
        >
          Longitudinal Health Analytics & Trend Telemetry
        </h1>
        <p className="text-[14px]" style={{ color: theme.textSecondary }}>
          Multi-system physiological trends, circadian rhythms, and adaptive baselines for {envData.locationLabel}.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
        <div className={`${theme.cardSurface} rounded-[14px] p-3.5 shadow-md flex flex-col justify-between`}>
          <span className="text-[11px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
            Cardiovascular Drift
          </span>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-[22px] font-semibold" style={{ color: theme.textPrimary }}>
              +{envData.analytics.cardiovascularDriftPct}%
            </span>
            <span className="text-[11.5px]" style={{ color: theme.accent }}>
              {envData.analytics.cardiovascularDriftLabel.split('·')[1]?.trim() || 'Nominal'}
            </span>
          </div>
          <p className="text-[11px]" style={{ color: theme.textSecondary }}>Resting pulse variability stable</p>
        </div>

        <div className={`${theme.cardSurface} rounded-[14px] p-3.5 shadow-md flex flex-col justify-between`}>
          <span className="text-[11px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
            Sleep Architecture
          </span>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-[22px] font-semibold" style={{ color: theme.warning }}>
              {envData.analytics.sleepArchitecturePct}%
            </span>
            <span className="text-[11.5px]" style={{ color: theme.warning }}>
              {envData.analytics.sleepArchitectureLabel.split('·')[1]?.trim() || 'Watch'}
            </span>
          </div>
          <p className="text-[11px]" style={{ color: theme.textSecondary }}>
            {envData.sleepMental.sleepDurationHours}h {envData.sleepMental.sleepDurationMinutes}m vs {envData.sleepMental.sleepGoalHours}h goal
          </p>
        </div>

        <div className={`${theme.cardSurface} rounded-[14px] p-3.5 shadow-md flex flex-col justify-between`}>
          <span className="text-[11px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
            Metabolic Rate
          </span>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-[22px] font-semibold" style={{ color: theme.textPrimary }}>
              {envData.analytics.metabolicExpenditureKcal.toLocaleString()} kcal
            </span>
            <span className="text-[11.5px]" style={{ color: theme.accent }}>On Track</span>
          </div>
          <p className="text-[11px]" style={{ color: theme.textSecondary }}>Daily nutritional expenditure</p>
        </div>

        <div className={`${theme.cardSurface} rounded-[14px] p-3.5 shadow-md flex flex-col justify-between`}>
          <span className="text-[11px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
            Muscle Retention Index
          </span>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-[22px] font-semibold" style={{ color: theme.textPrimary }}>
              {envData.analytics.muscleRetentionIndexPct}%
            </span>
            <span className="text-[11.5px]" style={{ color: theme.accent }}>Optimal</span>
          </div>
          <p className="text-[11px]" style={{ color: theme.textSecondary }}>Calf & quad volume vs Flight Day 1</p>
        </div>
      </div>

      <MeasurementHistoryPanel environment={currentEnv} showHistory={false} />

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
        {/* Left Column: 14-Day Vitals Trend */}
        <div className={`lg:col-span-8 ${theme.cardSurface} rounded-[18px] p-5 shadow-lg flex flex-col justify-between gap-4`}>
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: `${theme.accent}30` }}>
            <div>
              <h2 className="text-[17px] font-semibold" style={{ color: theme.textPrimary }}>
                14-Day Circadian & Heart Rate Variance · {envData.environmentDisplayName}
              </h2>
              <p className="text-[12px]" style={{ color: theme.textSecondary }}>
                SIMULATED scenario trend. New manual entries are shown in the saved-measurement chart above.
              </p>
            </div>
            <span className={`text-[11.5px] font-mono px-2.5 py-1 rounded-md ${theme.tagBadge}`}>
              {envData.missionEpoch}
            </span>
          </div>

          {/* Graphical visualization representation */}
          <div
            className="w-full h-[220px] flex items-end gap-2 px-2 pt-6 pb-2 rounded-xl border relative overflow-hidden"
            style={{
              backgroundColor: theme.inputBg,
              borderColor: `${theme.accent}30`,
            }}
          >
            {/* Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-3 opacity-20">
              <div className="w-full border-b border-dashed" style={{ borderColor: theme.accent }} />
              <div className="w-full border-b border-dashed" style={{ borderColor: theme.accent }} />
              <div className="w-full border-b border-dashed" style={{ borderColor: theme.accent }} />
            </div>

            {/* Bars for 14 flight/surface days */}
            {envData.analytics.fourteenDayTrend.map((day, idx) => {
              const heightPct = Math.round(((day.heartRate - 55) / 30) * 100);
              const isToday = idx === envData.analytics.fourteenDayTrend.length - 1;
              return (
                <div key={day.dayLabel} className="flex-1 flex flex-col items-center gap-1.5 z-10 group cursor-pointer">
                  <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: theme.textMuted }}>
                    {day.heartRate}bpm
                  </span>
                  <div
                    className="w-full max-w-[28px] transition-colors rounded-t-md relative flex items-end justify-center"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: `${theme.accent}33`,
                    }}
                  >
                    <div
                      className="w-full h-[3px] rounded-t-md"
                      style={{ backgroundColor: isToday ? theme.warning : theme.accent }}
                    />
                  </div>
                  <span
                    className={`text-[9.5px] font-mono ${isToday ? 'font-bold' : ''}`}
                    style={{ color: isToday ? theme.warning : theme.textMuted }}
                  >
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between text-[12px] pt-1" style={{ color: theme.textSecondary }}>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.accent }} /> Baseline (65-72 bpm)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.warning }} /> Current Day ({envData.vitals.heartRate.current} bpm)
              </span>
            </div>
            <span>Adaptive baseline updated 06:00 UTC</span>
          </div>
        </div>

        {/* Right Column: Multi-System Health Radar */}
        <div className={`lg:col-span-4 ${theme.cardSurface} rounded-[18px] p-5 shadow-lg flex flex-col justify-between gap-3`}>
          <h2 className="text-[17px] font-semibold" style={{ color: theme.textPrimary }}>Physiological Systems</h2>

          <div className="flex flex-col gap-3 py-1">
            <div>
              <div className="flex justify-between text-[12.5px] pb-1">
                <span style={{ color: theme.textPrimary }}>Cardiovascular Stability</span>
                <span className="font-mono" style={{ color: theme.accent }}>
                  {envData.analytics.cardiovascularStabilityPct}% Nominal
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.inputBg }}>
                <div className="h-full transition-all duration-700" style={{ width: `${envData.analytics.cardiovascularStabilityPct}%`, backgroundColor: theme.accent }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12.5px] pb-1">
                <span style={{ color: theme.textPrimary }}>Bone & Joint Integrity</span>
                <span className="font-mono" style={{ color: theme.warning }}>
                  {envData.analytics.boneJointIntegrityPct}% Attention
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.inputBg }}>
                <div className="h-full transition-all duration-700" style={{ width: `${envData.analytics.boneJointIntegrityPct}%`, backgroundColor: theme.warning }} />
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: theme.textMuted }}>
                {envData.analytics.boneJointNote}
              </p>
            </div>

            <div>
              <div className="flex justify-between text-[12.5px] pb-1">
                <span style={{ color: theme.textPrimary }}>Cognitive & Neural Acuity</span>
                <span className="font-mono" style={{ color: theme.accent }}>
                  {envData.analytics.cognitiveAcuityPct}% Nominal
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.inputBg }}>
                <div className="h-full transition-all duration-700" style={{ width: `${envData.analytics.cognitiveAcuityPct}%`, backgroundColor: theme.accent }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12.5px] pb-1">
                <span style={{ color: theme.textPrimary }}>Cellular Hydration / Electrolytes</span>
                <span className="font-mono" style={{ color: theme.accent }}>
                  {envData.analytics.cellularHydrationPct}% Nominal
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.inputBg }}>
                <div className="h-full transition-all duration-700" style={{ width: `${envData.analytics.cellularHydrationPct}%`, backgroundColor: theme.accent }} />
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-3 text-[12px] border"
            style={{
              backgroundColor: theme.bannerSurface,
              borderColor: `${theme.accent}40`,
              color: theme.textSecondary,
            }}
          >
            <p className="font-semibold" style={{ color: theme.textPrimary }}>Aerospace Flight Surgeon Note</p>
            <p className="mt-0.5">
              {envData.analytics.flightSurgeonNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
