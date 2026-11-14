import { useEffect, useState } from 'react';
import type { EnvironmentType } from './EnvironmentCards';
import { getTheme } from '../utils/themeTokens';
import { getEnvironmentData } from '../data/environmentData';
import { formatProfileMissionProgress } from '../data/measurementConfig';
import { useMeasurements } from '../data/measurementStore';
import { formatMeasurementDate } from '../data/measurementConfig';
import { DEMO_GUIDANCE_LABEL, generateSymptomGuidance } from '../data/symptomGuidance';
import { getHazardConcerns, PROBLEM_GUIDANCE, SPACEFLIGHT_HAZARDS } from '../data/hazardConcerns';

interface MedicalGuidanceProps {
  currentEnv?: EnvironmentType;
  isCalibrated?: boolean;
}

export function MedicalGuidance({ currentEnv = 'Spacecraft', isCalibrated = false }: MedicalGuidanceProps) {
  const theme = getTheme(currentEnv);
  const envData = getEnvironmentData(currentEnv);
  const { symptomRecords, activeProfile } = useMeasurements();
  const profileId = activeProfile?.id ?? ''; 
  const healthRecords = symptomRecords.filter((record) => record.profileId === profileId && record.environment === currentEnv);
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>(() => getHazardConcerns(profileId, currentEnv));

  useEffect(() => {
    setSelectedProblemIds(getHazardConcerns(profileId, currentEnv));
  }, [profileId, currentEnv]);

  const selectedProblems = SPACEFLIGHT_HAZARDS.flatMap((hazard) => hazard.problems
    .filter((problem) => selectedProblemIds.includes(problem.id))
    .map((problem) => ({ ...problem, hazardName: hazard.name, guidance: PROBLEM_GUIDANCE[problem.id] })));
  const hasPersonalGuidance = healthRecords.length > 0 || selectedProblems.length > 0;

  return (
    <div className="flex flex-col gap-4 w-full animate-fadeIn">
      {/* Title & Description */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-mono px-2 py-0.5 rounded ${theme.tagBadge}`}>
            CLINICAL PROTOCOLS · {envData.environmentDisplayName.toUpperCase()}
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
          Aerospace Medical Guidance & Clinical Countermeasures
        </h1>
        <p className="text-[14px]" style={{ color: theme.textSecondary }}>
          Review information related to your selected concerns and mission context for {envData.locationLabel}.
        </p>
      </div>

      {selectedProblems.length > 0 && (
        <section className="flex flex-col gap-3" aria-label="Guidance for selected problems">
          <div>
            <h2 className="text-[19px] font-semibold" style={{ color: theme.textPrimary }}>Guidance for the problems you selected</h2>
            <p className="text-[12px]" style={{ color: theme.textSecondary }}>Matched from your hazard checklist for {envData.environmentDisplayName}.</p>
          </div>
          {selectedProblems.map((problem) => (
            <article key={problem.id} className={`${theme.cardSurface} rounded-[18px] p-5 border flex flex-col gap-3`} style={{ borderColor: theme.cardBorderHex }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wide" style={{ color: theme.accent }}>{problem.hazardName}</span>
                  <h3 className="text-[16px] font-semibold" style={{ color: theme.textPrimary }}>{problem.guidance.title}</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded border" style={{ color: theme.warning, borderColor: theme.warning }}>{DEMO_GUIDANCE_LABEL}</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[13px]" style={{ color: theme.textPrimary }}>
                {problem.guidance.actions.map((action) => <li key={action}>{action}</li>)}
              </ul>
              <p className="text-[11px]" style={{ color: theme.textMuted }}>This is general demonstration guidance, not a diagnosis or substitute for your mission medical team.</p>
            </article>
          ))}
        </section>
      )}

      {healthRecords.length > 0 && (
        <section className="flex flex-col gap-3" aria-label="Guidance for saved symptoms">
          <div>
            <h2 className="text-[19px] font-semibold" style={{ color: theme.textPrimary }}>Guidance for your reported symptoms</h2>
            <p className="text-[12px]" style={{ color: theme.textSecondary }}>Generated separately for each saved self-report in {envData.environmentDisplayName}.</p>
          </div>
          {healthRecords.map((record) => {
            const guidance = generateSymptomGuidance(record);
            return (
              <article key={record.id} className={`${theme.cardSurface} rounded-[18px] p-5 border flex flex-col gap-3`} style={{ borderColor: theme.cardBorderHex }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded border" style={{ color: theme.warning, borderColor: theme.warning }}>{DEMO_GUIDANCE_LABEL}</span>
                    <h3 className="text-[16px] font-semibold mt-2" style={{ color: theme.textPrimary }}>{guidance.title}</h3>
                  </div>
                  <span className="text-[11px]" style={{ color: theme.textMuted }}>{formatMeasurementDate(record.recordedAt)} - {record.environment}</span>
                </div>
                <p className="text-[12px]" style={{ color: theme.textSecondary }}>{guidance.explanation}</p>
                <ul className="list-disc pl-5 space-y-1 text-[13px]" style={{ color: theme.textPrimary }}>
                  {guidance.actions.map((action) => <li key={action}>{action}</li>)}
                </ul>
              </article>
            );
          })}
        </section>
      )}

      {!hasPersonalGuidance && <div className="flex flex-col gap-4">
      {/* Recommended Protocols Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {envData.protocols.map((protocol, idx) => {
          const isPrimary = idx === 0;
          return (
            <div
              key={protocol.id}
              className={`${theme.cardSurface} rounded-[18px] p-5 shadow-lg flex flex-col justify-between min-h-[260px]`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: isPrimary ? theme.warning : theme.accent }}
                  >
                    {protocol.tag}
                  </span>
                  <span
                    className="text-[11px] font-mono px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: isPrimary ? `${theme.warning}20` : `${theme.accent}15`,
                      borderColor: isPrimary ? `${theme.warning}40` : `${theme.accent}40`,
                      color: isPrimary ? theme.warning : theme.accent,
                    }}
                  >
                    {protocol.cadence}
                  </span>
                </div>
                <h2 className="text-[18px] font-semibold" style={{ color: theme.textPrimary }}>
                  {protocol.title}
                </h2>
                <p className="text-[13px] leading-relaxed" style={{ color: theme.textSecondary }}>
                  {protocol.description}
                </p>
              </div>
              <div className="pt-3 border-t flex items-center justify-between text-[12.5px]" style={{ borderColor: `${theme.accent}30` }}>
                <span style={{ color: theme.textMuted }}>Protocol ID: {protocol.id}</span>
                <span className="hover:underline cursor-pointer font-medium" style={{ color: theme.accent }}>
                  {protocol.routineLinkText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clinical Reference Table */}
      <div className={`${theme.cardSurface} rounded-[18px] p-5 shadow-lg flex flex-col gap-3`}>
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold" style={{ color: theme.textPrimary }}>
            Operational Space Medicine Quick Reference · {envData.environmentDisplayName}
          </h2>
          <span className="text-[11.5px] font-mono" style={{ color: theme.textMuted }}>
            ECLSS Gravity: {envData.environmental.gravityLabel}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]" style={{ color: theme.textSecondary }}>
            <thead className="border-b font-mono text-[11px] uppercase" style={{ borderColor: `${theme.accent}30`, color: theme.textMuted }}>
              <tr>
                <th className="py-2.5 px-3">Condition / Indication</th>
                <th className="py-2.5 px-3">Immediate Countermeasure</th>
                <th className="py-2.5 px-3">Medical Kit Pack</th>
                <th className="py-2.5 px-3">Telemedicine Escalate</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: `${theme.accent}20` }}>
              {envData.clinicalReference.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-medium" style={{ color: theme.textPrimary }}>
                    {row.condition}
                  </td>
                  <td className="py-3 px-3">
                    {row.immediateCountermeasure}
                  </td>
                  <td className="py-3 px-3 font-mono" style={{ color: theme.accent }}>
                    {row.medicalKitPack}
                  </td>
                  <td className="py-3 px-3">
                    {row.telemedicineEscalate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      </div>}

      {/* Footer NASA Disclaimer */}
      <div className="pt-2 text-[12px]" style={{ color: theme.textMuted }}>
        <p>{envData.dataProvenanceDisclaimer}</p>
        <p style={{ color: theme.warning }}>Illustrative data, not NASA operational measurements. Not a validated diagnostic or treatment system.</p>
      </div>
    </div>
  );
}
