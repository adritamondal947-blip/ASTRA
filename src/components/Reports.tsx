import { useState } from 'react';
import type { EnvironmentType } from './EnvironmentCards';
import { getTheme } from '../utils/themeTokens';
import { getEnvironmentData } from '../data/environmentData';
import { formatProfileMissionProgress } from '../data/measurementConfig';
import { useMeasurements } from '../data/measurementStore';
import { formatMeasurementDate } from '../data/measurementConfig';

interface ReportsProps {
  currentEnv?: EnvironmentType;
  isCalibrated?: boolean;
}

export function Reports({ currentEnv = 'Spacecraft', isCalibrated = false }: ReportsProps) {
  const theme = getTheme(currentEnv);
  const envData = getEnvironmentData(currentEnv);
  const { symptomRecords, activeProfile } = useMeasurements();
  const profileId = activeProfile?.id ?? ''; 
  const healthRecords = symptomRecords.filter((record) => record.profileId === profileId && record.environment === currentEnv);

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [briefingModal, setBriefingModal] = useState<{ title: string; tag: string; summary: string; timestamp: string } | null>(null);

  // Filter reports reactively
  const filteredReports = envData.reports.filter((report) => {
    if (selectedFilter === 'all') return true;
    return report.category === selectedFilter;
  });

  return (
    <div className="flex flex-col gap-4 w-full animate-fadeIn">
      {/* Title & Description */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-mono px-2 py-0.5 rounded ${theme.tagBadge}`}>
            MISSION RECORDS · {envData.environmentDisplayName.toUpperCase()}
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
          Clinical Logs & Mission Health Dossiers
        </h1>
        <p className="text-[14px]" style={{ color: theme.textSecondary }}>
          Archived telemedicine assessments, weekly flight surgeon debriefs, and cumulative dosimetry logs for {envData.locationLabel}.
        </p>
      </div>

      {/* Top Action Bar */}
      <div className={`${theme.cardSurface} rounded-[16px] p-4 flex flex-wrap items-center justify-between gap-3 shadow-md`}>
        <div className="flex items-center gap-3">
          <label htmlFor="reportFilterSelect" className="text-[14px] font-medium" style={{ color: theme.textPrimary }}>
            Filter Archive:
          </label>
          <select
            id="reportFilterSelect"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="rounded-lg px-3 py-1.5 text-[13px] focus:outline-none border cursor-pointer"
            style={{
              backgroundColor: theme.inputBg,
              borderColor: `${theme.accent}50`,
              color: theme.textPrimary,
            }}
          >
            <option value="all">All {envData.environmentDisplayName} Reports</option>
            <option value="weekly">Flight Surgeon Weekly Briefs</option>
            <option value="eva">EVA Physiological Clearances</option>
            <option value="dosimetry">Cumulative Radiation Dosimetry</option>
          </select>

          <span className="text-[12px] font-mono hidden sm:inline-block" style={{ color: theme.textSecondary }}>
            ({filteredReports.length} {filteredReports.length === 1 ? 'record' : 'records'})
          </span>
        </div>

        <button
          type="button"
          onClick={() => alert(`Simulated export of encrypted telemetry archive (PDF/HL7-FHIR) for ${envData.environmentDisplayName} [${formatProfileMissionProgress(activeProfile, currentEnv, envData.missionEpoch)}].`)}
          className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm ${theme.buttonSecondary}`}
        >
          <span>Export Mission Dossier</span>
          <span>↓</span>
        </button>
      </div>

      <section className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col gap-4`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="text-[18px] font-semibold" style={{ color: theme.textPrimary }}>Astronaut-reported anatomical records</h2><p className="text-[12px]" style={{ color: theme.textSecondary }}>Persisted self-reports for {envData.environmentDisplayName}; separate from illustrative archive entries.</p></div>
          <div className="flex gap-3 text-xs" style={{ color: theme.textMuted }}><span>{healthRecords.length} total records</span><span>{healthRecords.filter((record) => record.severity === 'Severe').length} severe</span><span>{healthRecords.length ? (healthRecords.reduce((sum, record) => sum + record.intensity, 0) / healthRecords.length).toFixed(1) : '0.0'} avg intensity</span></div>
        </div>
        {healthRecords.length === 0 ? <p className="text-[13px]" style={{ color: theme.textSecondary }}>No self-reported symptoms saved for this astronaut and mission environment.</p> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-[12px]" style={{ color: theme.textSecondary }}><thead><tr className="border-b" style={{ borderColor: theme.cardBorderHex }}><th className="p-2">Record ID</th><th className="p-2">Region / symptom</th><th className="p-2">Severity / intensity</th><th className="p-2">Date & time</th><th className="p-2">Environment</th><th className="p-2">Status</th></tr></thead><tbody>{healthRecords.map((record) => <tr key={record.id} className="border-b" style={{ borderColor: theme.cardBorderHex }}><td className="p-2 font-mono break-all" style={{ color: theme.accent }}>{record.id}</td><td className="p-2" style={{ color: theme.textPrimary }}>{record.regionName} - {record.symptomType}{record.notes && <p className="text-[11px]" style={{ color: theme.textMuted }}>{record.notes}</p>}</td><td className="p-2">{record.severity} - {record.intensity}/10</td><td className="p-2">{formatMeasurementDate(record.recordedAt)}</td><td className="p-2">{record.environment}</td><td className="p-2">Self-reported</td></tr>)}</tbody></table></div>
        )}
      </section>

      <div className={`rounded-xl border px-4 py-3 text-xs ${theme.cardSurface}`} style={{ borderColor: theme.cardBorderHex, color: theme.textMuted }}>The archive entries below are illustrative demo examples, separate from the astronaut-reported records above.</div>

      {/* Reports List or Empty State */}
      <div className="flex flex-col gap-3 w-full">
        {filteredReports.length === 0 ? (
          <div className={`${theme.cardSurface} rounded-[18px] p-8 text-center flex flex-col items-center justify-center gap-3 border`}>
            <span className="text-[28px]">📄</span>
            <h3 className="text-[17px] font-semibold" style={{ color: theme.textPrimary }}>
              No matching mission reports found
            </h3>
            <p className="text-[13.5px] max-w-md" style={{ color: theme.textSecondary }}>
              No reports in the {envData.environmentDisplayName} archive match the "{selectedFilter}" category filter.
            </p>
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`mt-2 px-4 py-2 rounded-xl text-[13px] font-semibold cursor-pointer shadow-sm ${theme.buttonPrimary}`}
            >
              Reset filter to view all reports
            </button>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className={`${theme.cardSurface} rounded-[16px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md transition-colors`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${theme.tagBadge}`}>
                    {report.tag}
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: theme.textMuted }}>{report.timestamp}</span>
                </div>
                <h2 className="text-[16px] font-semibold" style={{ color: theme.textPrimary }}>
                  {report.title}
                </h2>
                <p className="text-[13px]" style={{ color: theme.textSecondary }}>
                  {report.summary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setBriefingModal(report)}
                className="self-start md:self-center px-3.5 py-1.5 text-[12.5px] font-medium border rounded-lg transition-all cursor-pointer whitespace-nowrap"
                style={{
                  borderColor: `${theme.accent}60`,
                  color: theme.accent,
                }}
              >
                Read Briefing ›
              </button>
            </div>
          ))
        )}
      </div>

      {/* Briefing Modal */}
      {briefingModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
          onClick={() => setBriefingModal(null)}
        >
          <div
            className={`w-full max-w-[520px] ${theme.cardSurface} rounded-[22px] p-5 sm:p-6 flex flex-col gap-4 border shadow-2xl relative`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="briefing-title"
          >
            <div className="flex items-start justify-between border-b pb-3" style={{ borderColor: theme.cardBorderHex }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${theme.tagBadge}`}>
                    {briefingModal.tag}
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: theme.textSecondary }}>
                    {briefingModal.timestamp}
                  </span>
                </div>
                <h2 id="briefing-title" className="text-[19px] font-semibold mt-1" style={{ color: theme.textPrimary }}>
                  {briefingModal.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setBriefingModal(null)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-[14px] cursor-pointer"
                style={{ backgroundColor: theme.inputBg, borderColor: `${theme.accent}40`, color: theme.textPrimary }}
              >
                ✕
              </button>
            </div>

            <p className="text-[14px] leading-relaxed" style={{ color: theme.textSecondary }}>
              {briefingModal.summary}
            </p>

            <div
              className="p-3 rounded-xl text-[12px] border"
              style={{
                backgroundColor: `${theme.accent}10`,
                borderColor: `${theme.accent}30`,
                color: theme.textPrimary,
              }}
            >
              <p className="font-semibold text-[11px] uppercase tracking-wider mb-1" style={{ color: theme.accent }}>
                Clinical Clearance Notice
              </p>
              <p>Certified by Flight Surgeon Dr. Marcus Vance via NASA Deep Space Network. Dossier verified and signed with habitat cryptographic key AST-7426.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBriefingModal(null)}
                className={`px-5 h-[40px] rounded-xl text-[13px] font-semibold cursor-pointer shadow-md ${theme.buttonPrimary}`}
              >
                Close Briefing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer NASA Disclaimer */}
      <div className="pt-2 text-[12px]" style={{ color: theme.textMuted }}>
        <p>{envData.dataProvenanceDisclaimer}</p>
        <p style={{ color: theme.warning }}>Illustrative data, not NASA operational measurements. Not a validated diagnostic or treatment system.</p>
      </div>
    </div>
  );
}
