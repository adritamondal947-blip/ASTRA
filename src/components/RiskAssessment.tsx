import { useEffect, useState } from 'react';
import type { EnvironmentType } from './EnvironmentCards';
import { getTheme } from '../utils/themeTokens';
import { getEnvironmentData } from '../data/environmentData';
import { useMeasurements } from '../data/measurementStore';
import { formatProfileMissionProgress } from '../data/measurementConfig';
import imgContinueArrow from '../assets/figma/imgContinueArrow.svg';
import { getHazardConcerns, saveHazardConcerns, SPACEFLIGHT_HAZARDS } from '../data/hazardConcerns';

interface RiskAssessmentProps {
  currentEnv?: EnvironmentType;
  isCalibrated?: boolean;
  onNavigate?: (screen: string) => void;
}

export function RiskAssessment({ currentEnv = 'Spacecraft', isCalibrated = false, onNavigate }: RiskAssessmentProps) {
  const { activeProfile } = useMeasurements();
  const theme = getTheme(currentEnv);
  const envData = getEnvironmentData(currentEnv);
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>(() => getHazardConcerns(activeProfile?.id ?? '', currentEnv));

  useEffect(() => {
    setSelectedProblemIds(getHazardConcerns(activeProfile?.id ?? '', currentEnv));
  }, [activeProfile?.id, currentEnv]);

  const toggleProblem = (problemId: string) => {
    const next = selectedProblemIds.includes(problemId)
      ? selectedProblemIds.filter((id) => id !== problemId)
      : [...selectedProblemIds, problemId];
    setSelectedProblemIds(next);
    saveHazardConcerns(activeProfile?.id ?? '', currentEnv, next);
  };

  const hazardContext = (hazardId: string) => {
    switch (hazardId) {
      case 'radiation': return `${envData.environmental.radiationDailyMsv} mSv/day`;
      case 'isolation': return `${envData.sleepMental.stressScorePct}% stress · ${envData.sleepMental.sleepDurationHours}h ${envData.sleepMental.sleepDurationMinutes}m sleep`;
      case 'distance': return envData.commLinkDetails;
      case 'gravity': return envData.environmental.gravityLabel;
      default: return `${envData.environmental.cabinPressureKpa} kPa · ${envData.environmental.ambientTempC} °C`;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-mono px-2 py-0.5 rounded ${theme.tagBadge}`}>
            AEROSPACE RISK ENGINE · {envData.environmentDisplayName.toUpperCase()}
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
              SIMULATED TELEMETRY
            </span>
          )}
        </div>
        <h1
          className="text-[26px] sm:text-[28px] font-semibold tracking-tight"
          style={{ color: theme.textPrimary }}
        >
          Risk Assessment & Environmental Hazard Telemetry
        </h1>
        <p className="text-[14px]" style={{ color: theme.textSecondary }}>
          Select any problems you’re experiencing. ASTRA will use them to find related guidance for this mission.
        </p>
      </div>

      {/* Interactive mission hazard checklist */}
      <section className="flex flex-col gap-3" aria-labelledby="spaceflight-hazards-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="spaceflight-hazards-heading" className="text-[18px] font-semibold" style={{ color: theme.textPrimary }}>What are you experiencing?</h2>
            <p className="text-[12px] mt-1" style={{ color: theme.textSecondary }}>Choose all that apply. Selections are saved for this profile and mission environment.</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded border" style={{ color: theme.warning, borderColor: `${theme.warning}55`, backgroundColor: `${theme.warning}12` }}>DEMO SCENARIO CONTEXT</span>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {SPACEFLIGHT_HAZARDS.map((hazard, index) => {
            const checkedCount = hazard.problems.filter((problem) => selectedProblemIds.includes(problem.id)).length;
            return (
              <article key={hazard.id} className={`${theme.cardSurface} rounded-[18px] p-4 sm:p-5 border shadow-lg`} style={{ borderColor: checkedCount ? `${theme.accent}85` : theme.cardBorderHex }}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold" style={{ color: theme.accent, backgroundColor: `${theme.accent}18` }}>0{index + 1}</span>
                    <div>
                      <h3 className="text-[15px] font-semibold" style={{ color: theme.textPrimary }}>{hazard.name}</h3>
                      <p className="text-[10px] uppercase tracking-wide" style={{ color: theme.textMuted }}>{hazard.contextLabel}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-right" style={{ color: theme.textSecondary }}>{hazardContext(hazard.id)}</span>
                </div>
                <div className="border-t pt-3 flex flex-col gap-2" style={{ borderColor: `${theme.accent}25` }}>
                  {hazard.problems.map((problem) => (
                    <label key={problem.id} className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer hover:bg-white/[0.04] transition-colors">
                      <input type="checkbox" checked={selectedProblemIds.includes(problem.id)} onChange={() => toggleProblem(problem.id)} className="mt-0.5 h-4 w-4 shrink-0 accent-cyan-400" />
                      <span className="text-[12px] leading-relaxed" style={{ color: theme.textPrimary }}>{problem.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t" style={{ borderColor: `${theme.accent}20` }}>
                  <a href={hazard.source} target="_blank" rel="noreferrer" className="text-[10px] underline underline-offset-2" style={{ color: theme.textMuted }}>NASA background</a>
                  <span className="text-[10px] font-medium" style={{ color: checkedCount ? theme.accent : theme.textMuted }}>{checkedCount ? `${checkedCount} selected` : 'No problems selected'}</span>
                </div>
              </article>
            );
          })}
        </div>
        {selectedProblemIds.length > 0 && (
          <button type="button" onClick={() => onNavigate?.('Medical Guidance')} className={`self-start h-11 px-5 rounded-xl ${theme.buttonPrimary} text-sm font-semibold shadow-lg hover:brightness-110 transition-all`}>
            View guidance for {selectedProblemIds.length} selected {selectedProblemIds.length === 1 ? 'problem' : 'problems'} →
          </button>
        )}
      </section>

      {/* Priority Banner */}
      <div
        className="w-full backdrop-blur-md rounded-[16px] px-4 py-3 flex flex-col gap-0.5 shadow-md border"
        style={{
          backgroundColor: theme.bannerSurface,
          borderColor: `${theme.accent}40`,
        }}
      >
        <span
          className="text-[11px] font-semibold tracking-wider uppercase"
          style={{ color: theme.accent }}
        >
          {envData.environmental.hazardIndexTitle}
        </span>
        <p className="text-[15px]" style={{ color: theme.textPrimary }}>
          {envData.environmental.hazardIndexDescription}
        </p>
      </div>

      {/* Grid of Risk Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* Risk 1: Radiation Exposure */}
        <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col justify-between shadow-lg min-h-[220px]`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.accent }}>
                Cumulative Dosimetry
              </span>
              <span className="text-[10px] font-mono text-[#8ba7c2]">
                {envData.environmental.radiationDailyMsv} mSv/d
              </span>
            </div>
            <h3 className="text-[22px] font-semibold mt-1" style={{ color: theme.textPrimary }}>
              {envData.environmental.radiationDailyMsv} mSv / day
            </h3>
            <p className="text-[13px] mt-1" style={{ color: theme.textSecondary }}>
              {envData.environmental.radiationTrend}
            </p>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] pb-1" style={{ color: theme.textMuted }}>
              <span>Career threshold usage</span>
              <span>{envData.environmental.radiationCareerLimitPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.inputBg }}>
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${envData.environmental.radiationCareerLimitPct}%`, backgroundColor: theme.accent }}
              />
            </div>
          </div>
        </div>

        {/* Risk 2: Bone Mineral Density / Joint Strain */}
        <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col justify-between shadow-lg min-h-[220px]`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.warning }}>
                {envData.body.primaryFocusRegionName} Hazard
              </span>
              <span className="text-[10.5px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.warning}20`, color: theme.warning }}>
                WATCH
              </span>
            </div>
            <h3 className="text-[22px] font-semibold mt-1" style={{ color: theme.warning }}>
              {100 - envData.analytics.boneJointIntegrityPct}% Stress Delta
            </h3>
            <p className="text-[13px] mt-1" style={{ color: theme.textSecondary }}>
              {envData.body.defaultNotes}
            </p>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] pb-1" style={{ color: theme.textMuted }}>
              <span>Structural Integrity Score</span>
              <span>{envData.analytics.boneJointIntegrityPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.inputBg }}>
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${envData.analytics.boneJointIntegrityPct}%`, backgroundColor: theme.warning }}
              />
            </div>
          </div>
        </div>

        {/* Risk 3: Cardiovascular Deconditioning / Gravity Adaptation */}
        <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col justify-between shadow-lg min-h-[220px]`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.accent }}>
                Gravity Vector Adaptation
              </span>
              <span className="text-[10.5px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
                {envData.environmental.gravityLabel.split('·')[0].trim()}
              </span>
            </div>
            <h3 className="text-[22px] font-semibold mt-1" style={{ color: theme.textPrimary }}>
              {envData.analytics.cardiovascularStabilityPct}% Stability
            </h3>
            <p className="text-[13px] mt-1" style={{ color: theme.textSecondary }}>
              {envData.analytics.flightSurgeonNote.split('.')[0]}.
            </p>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] pb-1" style={{ color: theme.textMuted }}>
              <span>Cardiovascular reserve</span>
              <span>{envData.analytics.cardiovascularStabilityPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.inputBg }}>
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${envData.analytics.cardiovascularStabilityPct}%`, backgroundColor: theme.accent }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Protocols Action Card */}
      <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl`}>
        <div className="flex flex-col gap-1">
          <h3 className="text-[18px] font-semibold" style={{ color: theme.textPrimary }}>
            Generate {envData.environmentDisplayName} Risk Summary
          </h3>
          <p className="text-[13.5px]" style={{ color: theme.textSecondary }}>
            Export encrypted medical telemetry snapshot for Flight Surgeon review via {envData.commLinkDetails}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => alert(`Mission Control Telemetry Report compiled for ${envData.environmentDisplayName} [${formatProfileMissionProgress(activeProfile, currentEnv, envData.missionEpoch)}] and queued for dispatch.`)}
          className={`h-[50px] px-6 rounded-[14px] ${theme.buttonPrimary} font-semibold text-[14px] flex items-center gap-3 shadow-lg hover:brightness-110 cursor-pointer shrink-0 transition-all`}
        >
          <span>Dispatch to Earth Surgeon</span>
          <img src={imgContinueArrow} alt="" className="w-4 h-4" />
        </button>
      </div>

      {/* Footer NASA Disclaimer */}
      <div className="pt-2 text-[12px]" style={{ color: theme.textMuted }}>
        <p>{envData.dataProvenanceDisclaimer}</p>
        <p style={{ color: theme.warning }}>Illustrative data, not NASA operational measurements. Not a validated diagnostic or treatment system.</p>
      </div>
    </div>
  );
}
