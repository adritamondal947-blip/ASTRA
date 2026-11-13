import { useEffect, useState } from 'react';
import imgContinueArrow from '../assets/figma/imgContinueArrow.svg';
import {
  Examination3DViewer,
  ANATOMICAL_REGIONS,
  type BodyView,
} from './Examination3DViewer';
import type { AnatomicalRegionId } from '../utils/anatomicalModelLoader';
import type { EnvironmentType } from './EnvironmentCards';
import { getTheme } from '../utils/themeTokens';
import { getEnvironmentData } from '../data/environmentData';
import { formatProfileMissionProgress } from '../data/measurementConfig';
import { useMeasurements } from '../data/measurementStore';
import { formatMeasurementDate } from '../data/measurementConfig';

interface BodyAssessmentProps {
  onSaveCheckin?: (symptom: string) => void;
  currentEnv?: EnvironmentType;
}

export function BodyAssessment({ onSaveCheckin, currentEnv = 'Spacecraft' }: BodyAssessmentProps) {
  const theme = getTheme(currentEnv);
  const envData = getEnvironmentData(currentEnv);
  const { symptomRecords, addSymptomRecord, activeProfile, isLoading: isRecordsLoading, storageError } = useMeasurements();
  const profileId = activeProfile?.id ?? '';
  const isMoon = currentEnv === 'Moon';
  const isMars = currentEnv === 'Mars';

  const defaultRegion: AnatomicalRegionId = (envData.body.primaryFocusRegionId as AnatomicalRegionId) || 'lower_back';
  const [selectedRegionId, setSelectedRegionId] = useState<AnatomicalRegionId>(defaultRegion);
  const [bodyView, setBodyView] = useState<BodyView>(isMoon ? 'anterior' : 'posterior');

  // Symptom categories
  const symptomTypes = [
    'Pain',
    'Stiffness',
    'Soreness',
    'Numbness',
    'Tingling',
    'Discomfort',
  ];

  const [activeSymptomType, setActiveSymptomType] = useState<string>(envData.body.defaultSymptomType);
  const [severity, setSeverity] = useState<number>(envData.body.defaultSeverity);
  const [notes, setNotes] = useState<string>(envData.body.defaultNotes);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const freshEnvData = getEnvironmentData(currentEnv);
    setSelectedRegionId((freshEnvData.body.primaryFocusRegionId as AnatomicalRegionId) || 'lower_back');
    setActiveSymptomType(freshEnvData.body.defaultSymptomType);
    setSeverity(freshEnvData.body.defaultSeverity);
    setNotes('');
    setConfirmationNotice(null);
    setSaveError(null);
  }, [currentEnv]);

  const currentRegion = ANATOMICAL_REGIONS[selectedRegionId] || ANATOMICAL_REGIONS.lower_back;
  const environmentRecords = symptomRecords.filter((record) => record.profileId === profileId && record.environment === currentEnv);
  const regionRecord = environmentRecords.find((record) => record.regionId === selectedRegionId);

  const handleSaveCheckin = async () => {
    setSaveError(null);
    try {
      const record = {
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : 'symptom-' + Date.now() + '-' + Math.random().toString(16).slice(2),
        profileId,
        environment: currentEnv,
        regionId: selectedRegionId,
        regionName: currentRegion.name,
        symptomType: activeSymptomType,
        severity: (severity <= 3 ? 'Mild' : severity <= 6 ? 'Moderate' : 'Severe') as 'Mild' | 'Moderate' | 'Severe',
        intensity: severity,
        notes: notes.trim(),
        recordedAt: new Date().toISOString(),
        status: 'self-reported' as const,
      };
      await addSymptomRecord(record);
      setConfirmationNotice('Saved: ' + currentRegion.name + ' - ' + activeSymptomType + ' - ' + record.severity + ' (' + severity + '/10)');
      onSaveCheckin?.(currentRegion.name + ': ' + activeSymptomType + ' (Level ' + severity + ')');
      window.setTimeout(() => setConfirmationNotice(null), 5000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save this anatomical record.');
    }
  };

  const handleSelectRegion = (id: AnatomicalRegionId) => {
    setSelectedRegionId(id);
    setNotes('');
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-fadeIn">
      {/* Title & Subtitle */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-mono px-2 py-0.5 rounded ${theme.tagBadge}`}>
            ANATOMICAL TWIN · {envData.environmentDisplayName.toUpperCase()}
          </span>
          <span className="text-[11px] font-mono text-[#8ba7c2]">
            {formatProfileMissionProgress(activeProfile, currentEnv, envData.missionEpoch)}
          </span>
        </div>
        <h1 className="text-[24px] sm:text-[28px] font-semibold tracking-tight" style={{ color: theme.textPrimary }}>
          Human Body Assessment & Anatomical Examination
        </h1>
        <p className="text-[13.5px] sm:text-[14px]" style={{ color: theme.textSecondary }}>
          {envData.body.anatomicalContextExplanation} Primary focus: <strong style={{ color: theme.accent }}>{envData.body.primaryFocusRegionName}</strong>.
        </p>
      </div>

      {/* Priority Banner */}
      <div className={`w-full ${theme.bannerSurface} rounded-[16px] px-4 py-3 flex flex-col gap-0.5`}>
        <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: theme.accent }}>
          PHASE PRIORITY · {envData.phasePriorityTitle}
        </span>
        <p className="text-[14.5px] sm:text-[15px]" style={{ color: theme.textPrimary }}>
          {envData.phasePriorityText}
        </p>
      </div>

      {/* Operational Workspace Grid (5 cols 3D Viewer / 7 cols Symptom Check-in) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: REALISTIC 3D INTERACTIVE ANATOMICAL EXAMINER                 */}
        {/* ========================================================================= */}
        <div className={`lg:col-span-5 ${theme.cardSurface} rounded-[18px] p-4 sm:p-5 flex flex-col justify-between min-h-[620px]`}>
          <div
            className="flex items-center justify-between gap-2 border-b pb-3"
            style={{ borderColor: theme.cardBorderHex }}
          >
            <div>
              <h2 className="text-[17px] sm:text-[19px] font-semibold flex items-center gap-2" style={{ color: theme.textPrimary }}>
                <span>3D Anatomical Examiner</span>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }} />
              </h2>
              <p className="text-[12px]" style={{ color: theme.textSecondary }}>
                Full 360° rotation · Pinch/wheel zoom · Click region
              </p>
            </div>

            {/* Front / Back Toggle Buttons */}
            <div
              className="flex items-center gap-1.5 p-1 rounded-xl border"
              style={{
                backgroundColor: isMoon ? '#101722' : isMars ? '#221316' : '#0b2945',
                borderColor: `${theme.accent}40`,
              }}
            >
              <button
                type="button"
                onClick={() => setBodyView('anterior')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  bodyView === 'anterior'
                    ? 'shadow-sm'
                    : 'hover:text-white'
                }`}
                style={{
                  backgroundColor: bodyView === 'anterior' ? theme.accent : 'transparent',
                  color: bodyView === 'anterior' ? '#080f1c' : theme.textSecondary,
                }}
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setBodyView('posterior')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  bodyView === 'posterior'
                    ? 'shadow-sm'
                    : 'hover:text-white'
                }`}
                style={{
                  backgroundColor: bodyView === 'posterior' ? theme.accent : 'transparent',
                  color: bodyView === 'posterior' ? '#080f1c' : theme.textSecondary,
                }}
              >
                Posterior
              </button>
            </div>
          </div>

          {/* Interactive 3D WebGL Canvas */}
          <div className="w-full h-[400px] sm:h-[420px] my-1 relative overflow-hidden rounded-xl border border-white/5 bg-black/20">
            <Examination3DViewer
              selectedRegion={selectedRegionId}
              onSelectRegion={handleSelectRegion}
              currentView={bodyView}
              onViewChange={setBodyView}
              currentEnv={currentEnv}
            />
          </div>

          {/* 14 Selectable Anatomical Region Quick Selector Chips */}
          <div
            className="flex flex-col gap-2 border-t pt-3 mt-1"
            style={{ borderColor: theme.cardBorderHex }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                Select Anatomical Region:
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded font-medium" style={{ backgroundColor: `${theme.accent}18`, color: theme.accent }}>
                Active: {currentRegion.name}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
              {(Object.keys(ANATOMICAL_REGIONS) as AnatomicalRegionId[]).map((regId) => {
                const reg = ANATOMICAL_REGIONS[regId];
                const isSelected = selectedRegionId === regId;
                const hasAlert = reg.status === 'Attention needed';

                return (
                  <button
                    type="button"
                    key={regId}
                    onClick={() => {
                      handleSelectRegion(regId);
                      if (reg.defaultView !== bodyView) {
                        setBodyView(reg.defaultView);
                      }
                    }}
                    className="min-h-[30px] px-2.5 py-1 text-[11px] sm:text-[11.5px] rounded-lg border transition-all cursor-pointer flex items-center gap-1.5"
                    style={{
                      backgroundColor: isSelected
                        ? `${theme.accent}25`
                        : hasAlert
                        ? `${theme.warning}15`
                        : 'rgba(255,255,255,0.04)',
                      borderColor: isSelected
                        ? theme.accent
                        : hasAlert
                        ? `${theme.warning}60`
                        : 'rgba(255,255,255,0.12)',
                      color: isSelected
                        ? theme.accentPale
                        : hasAlert
                        ? theme.warning
                        : theme.textSecondary,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: isSelected ? theme.accent : reg.statusColor }}
                    />
                    <span className="whitespace-nowrap">{reg.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: SYMPTOM EXAMINATION & SAFE GUIDANCE (7 COLS)                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* 1. Active Region Title & Status Header */}
          <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col gap-3`}>
            <div
              className="flex flex-wrap items-center justify-between gap-2 border-b pb-3"
              style={{ borderColor: theme.cardBorderHex }}
            >
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: theme.accent }}>
                  {currentRegion.category} · {envData.environmentDisplayName}
                </span>
                <h3 className="text-[20px] sm:text-[22px] font-semibold" style={{ color: theme.textPrimary }}>
                  {currentRegion.name}
                </h3>
              </div>

              <span
                className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border"
                style={{
                  backgroundColor: `${currentRegion.statusColor}15`,
                  borderColor: `${currentRegion.statusColor}60`,
                  color: currentRegion.statusColor,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: currentRegion.statusColor }}
                />
                {currentRegion.status}
              </span>
            </div>

            <p className="text-[13.5px] leading-relaxed" style={{ color: theme.textSecondary }}>
              {currentRegion.description}
            </p>

            {/* Common Symptoms in this Region */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11.5px] font-medium" style={{ color: theme.textSecondary }}>Common observations:</span>
              {currentRegion.commonSymptoms.map((symp, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded-md border"
                  style={{
                    backgroundColor: isMoon ? '#121b27' : isMars ? '#2c1619' : '#0c3156',
                    borderColor: `${theme.accent}30`,
                    color: theme.textPrimary,
                  }}
                >
                  {symp}
                </span>
              ))}
            </div>
          </div>

          {/* 2. Symptom Check-in Form */}
          <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col gap-4`}>
            <div>
              <h3 className="text-[18px] font-semibold" style={{ color: theme.textPrimary }}>
                Symptom Check-in: {currentRegion.name}
              </h3>
              <p className="text-[12.5px]" style={{ color: theme.textSecondary }}>
                Self-report check-in · Specify discomfort type, intensity and flight details for {envData.locationLabel}.
              </p>
            </div>

            {/* Discomfort Type Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {symptomTypes.map((type) => {
                const isSelected = activeSymptomType === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setActiveSymptomType(type)}
                    className="h-[42px] px-3 rounded-[10px] text-[13px] font-semibold transition-all border flex items-center justify-center cursor-pointer"
                    style={{
                      backgroundColor: isSelected
                        ? `${theme.accent}25`
                        : isMoon ? '#111824' : isMars ? '#281418' : '#0c2a48',
                      borderColor: isSelected ? theme.accent : `${theme.accent}30`,
                      color: isSelected ? theme.accent : theme.textPrimary,
                    }}
                  >
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>

            {/* Severity Slider (1 - 10) */}
            <div
              className="flex flex-col gap-1.5 p-3.5 rounded-xl border"
              style={{
                backgroundColor: isMoon ? '#0f1723' : isMars ? '#241215' : '#09223d',
                borderColor: theme.cardBorderHex,
              }}
            >
              <div className="flex items-center justify-between text-[13px]">
                <span style={{ color: theme.textSecondary }}>Severity Intensity:</span>
                <span className="font-semibold font-mono text-[14px]" style={{ color: theme.warning }}>
                  {severity} / 10 {severity <= 3 ? '(Mild)' : severity <= 6 ? '(Moderate)' : '(Severe)'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: theme.accent }}
              />
              <div className="flex justify-between text-[10px]" style={{ color: theme.textMuted }}>
                <span>1 (Barely noticeable)</span>
                <span>5 (Noticeable)</span>
                <span>10 (Severe limit)</span>
              </div>
            </div>

            {/* Additional Details Textarea */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium" style={{ color: theme.textSecondary }}>
                Additional Observations / Notes:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Describe onset, duration, or contextual activity..."
                className="w-full rounded-[10px] p-2.5 text-[13px] focus:outline-none border"
                style={{
                  backgroundColor: isMoon ? '#0c131d' : isMars ? '#1e0e11' : '#081e35',
                  borderColor: theme.cardBorderHex,
                  color: theme.textPrimary,
                }}
              />
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleSaveCheckin}
                className={`w-full sm:w-[320px] h-[52px] rounded-[16px] px-5 flex items-center justify-center gap-3 ${theme.buttonPrimary} font-semibold text-[14.5px] cursor-pointer transition-all active:scale-[0.99]`}
              >
                <span>Save Anatomical Record</span>
                <img src={imgContinueArrow} alt="" className="w-4 h-4 shrink-0" />
              </button>

              <span className="text-[12px] font-medium" style={{ color: theme.accent }}>
                {saveError || confirmationNotice || (isRecordsLoading ? 'Loading saved records...' : regionRecord ? `Latest saved: ${formatMeasurementDate(regionRecord.recordedAt)}` : 'Ready to record')}
              </span>
            </div>
          </div>

          <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col gap-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[17px] font-semibold" style={{ color: theme.textPrimary }}>Saved anatomical records</h3>
              <span className="text-[11px] font-mono" style={{ color: theme.textMuted }}>{environmentRecords.length} self-reported - {envData.environmentDisplayName}</span>
            </div>
            {storageError && <p role="alert" className="text-sm" style={{ color: theme.warning }}>{storageError}</p>}
            {environmentRecords.length === 0 ? <p className="text-[13px]" style={{ color: theme.textSecondary }}>No saved symptom records for this mission environment yet.</p> : (
              <div className="flex flex-col gap-2">{environmentRecords.map((record) => (
                <div key={record.id} className="rounded-xl border p-3 flex flex-wrap items-center justify-between gap-2" style={{ borderColor: theme.cardBorderHex }}>
                  <div><p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>{record.regionName} - {record.symptomType}</p><p className="text-xs" style={{ color: theme.textSecondary }}>{record.severity} - {record.intensity}/10{record.notes ? ' - ' + record.notes : ''}</p></div>
                  <span className="text-[11px]" style={{ color: theme.textMuted }}>{formatMeasurementDate(record.recordedAt)}</span>
                </div>
              ))}</div>
            )}
          </div>

          {/* 3. Safe Guidance & Countermeasures */}
          <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col gap-2.5`}>
            <h4 className="text-[16px] font-semibold flex items-center gap-2" style={{ color: theme.textPrimary }}>
              <span>Safe Countermeasures for {currentRegion.name} ({envData.environmentDisplayName})</span>
            </h4>
            <ul className="text-[13px] space-y-1.5 pl-4 list-disc" style={{ color: theme.textSecondary }}>
              {currentRegion.safeGuidance.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
            <p className="text-[11.5px] pt-1" style={{ color: theme.warning }}>
              Protocol rule: If symptoms escalate beyond mild discomfort, cease physical tasks and initiate flight surgeon telemetry consultation via {envData.commLinkDetails}.
            </p>
          </div>

        </div>

      </div>

      {/* Footer NASA Disclaimer */}
      <div className="pt-2 text-[12px]" style={{ color: theme.textMuted }}>
        <p>{envData.dataProvenanceDisclaimer}</p>
        <p style={{ color: theme.warning }}>Illustrative data, not NASA operational measurements. Not a validated diagnostic or treatment system.</p>
      </div>
    </div>
  );
}
