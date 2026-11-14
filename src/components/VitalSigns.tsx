import { useState, useEffect } from 'react';
import imgContinueArrow from '../assets/figma/imgContinueArrow.svg';
import type { EnvironmentType } from './EnvironmentCards';
import { getTheme } from '../utils/themeTokens';
import { getEnvironmentData } from '../data/environmentData';
import { formatProfileMissionProgress } from '../data/measurementConfig';
import { useMeasurements, type MeasurementMetricId, type MeasurementRecord } from '../data/measurementStore';
import { formatMeasurementDate, MEASUREMENT_METRICS } from '../data/measurementConfig';
import { RecordMeasurementModal } from './RecordMeasurementModal';
import { ConfigureMeasurementThresholdsModal } from './ConfigureMeasurementThresholdsModal';
import { MeasurementHistoryPanel } from './MeasurementHistoryPanel';

interface VitalSignsProps {
  currentEnv?: EnvironmentType;
  isCalibrated?: boolean;
}

const INTERVAL_OPTIONS = [
  { id: '1min', label: 'Every 1 min', desc: 'High-rate EVA / Acute monitoring telemetry', profile: 'Maximum power' },
  { id: '5min', label: 'Every 5 min', desc: 'Standard nominal cadence (Default baseline)', profile: 'Balanced telemetry' },
  { id: '15min', label: 'Every 15 min', desc: 'Power-save mode during low-demand periods', profile: 'Extended battery' },
  { id: '30min', label: 'Every 30 min', desc: 'Sleep & circadian rest window telemetry', profile: 'Passive monitoring' },
];

export function VitalSigns({ currentEnv = 'Spacecraft' }: VitalSignsProps) {
  const theme = getTheme(currentEnv);
  const envData = getEnvironmentData(currentEnv);

  const { records, thresholds, activeProfile, isLoading: isStorageLoading, storageError, addMeasurements, saveThresholds } = useMeasurements();
  const profileId = activeProfile?.id ?? '';
  const [isRecordingMeasurement, setIsRecordingMeasurement] = useState(false);
  const [isConfiguringThresholds, setIsConfiguringThresholds] = useState(false);
  const [isConfiguringInterval, setIsConfiguringInterval] = useState(false);
  const [savedInterval, setSavedInterval] = useState('Every 5 min');
  const [pendingInterval, setPendingInterval] = useState('Every 5 min');
  const [intervalNotice, setIntervalNotice] = useState<string | null>(null);
  const missionRecords = records.filter((record) => record.profileId === profileId && record.environment === currentEnv);
  const latestByMetric = new Map<MeasurementMetricId, MeasurementRecord>();
  missionRecords.forEach((record) => {
    if (!latestByMetric.has(record.metric) || record.measuredAt > latestByMetric.get(record.metric)!.measuredAt) {
      latestByMetric.set(record.metric, record);
    }
  });
  const latestMeasurement = missionRecords[0];
  const latestConfiguredAlerts = [...latestByMetric.values()].flatMap((record) => {
    const threshold = thresholds.find((item) => item.profileId === profileId && item.environment === currentEnv && item.metric === record.metric);
    if (!threshold) return [];
    const metric = MEASUREMENT_METRICS.find((item) => item.id === record.metric)!;
    if (threshold.minimum !== undefined && record.value < threshold.minimum) return [`${metric.label}: ${record.value} ${record.unit} is below the configured minimum (${threshold.minimum} ${record.unit}).`];
    if (threshold.maximum !== undefined && record.value > threshold.maximum) return [`${metric.label}: ${record.value} ${record.unit} is above the configured maximum (${threshold.maximum} ${record.unit}).`];
    return [];
  });

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (isConfiguringInterval || isRecordingMeasurement || isConfiguringThresholds)) {
        setIsConfiguringInterval(false);
        setIsRecordingMeasurement(false);
        setIsConfiguringThresholds(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConfiguringInterval, isRecordingMeasurement, isConfiguringThresholds]);

  const handleSaveMeasurements = async (newRecords: MeasurementRecord[]) => {
    await addMeasurements(newRecords);
  };

  const handleOpenIntervalConfig = () => {
    setPendingInterval(savedInterval);
    setIsConfiguringInterval(true);
  };

  const handleSaveInterval = () => {
    setSavedInterval(pendingInterval);
    setIsConfiguringInterval(false);
    setIntervalNotice(`Monitoring interval updated to ${pendingInterval} for ${envData.environmentDisplayName} telemetry feed.`);
    setTimeout(() => setIntervalNotice(null), 6000);
  };

  const handleCancelInterval = () => {
    setPendingInterval(savedInterval);
    setIsConfiguringInterval(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-fadeIn">
      {/* Title & Subtitle */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-mono px-2 py-0.5 rounded ${theme.tagBadge}`}>
            TELEMETRY · {envData.environmentDisplayName.toUpperCase()}
          </span>
          <span className="text-[11px] font-mono text-[#8ba7c2]">
            {formatProfileMissionProgress(activeProfile, currentEnv, envData.missionEpoch)}
          </span>
        </div>
        <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-tight" style={{ color: theme.textPrimary }}>
          Vital Signs & Biometric Telemetry
        </h1>
        <p className="text-[14px]" style={{ color: theme.textSecondary }}>
          Record instrument readings for {envData.locationLabel}. Seeded sample values remain labeled simulated.
        </p>
        {latestMeasurement && <p className="text-[12px]" style={{ color: theme.textMuted }}>Most recent saved measurement: {formatMeasurementDate(latestMeasurement.measuredAt)}</p>}
        <button type="button" onClick={() => setIsRecordingMeasurement(true)} disabled={isStorageLoading || Boolean(storageError)} className={`mt-2 h-11 w-full sm:w-fit rounded-xl px-5 text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${theme.buttonPrimary}`}>
          <span aria-hidden="true">+</span> Record new measurement
        </button>
      </div>

      {latestConfiguredAlerts.length > 0 && (
        <div role="alert" className="rounded-[16px] border p-4 flex flex-col gap-2" style={{ backgroundColor: `${theme.warning}12`, borderColor: `${theme.warning}70`, color: theme.textPrimary }}>
          <span className="text-[13px] font-semibold" style={{ color: theme.warning }}>Configured measurement limit crossed · review needed</span>
          {latestConfiguredAlerts.map((alert) => <p key={alert} className="text-[13px]">{alert}</p>)}
          <p className="text-[11px]" style={{ color: theme.textSecondary }}>This is based on the limit configured for this astronaut and mission. It is not a diagnosis or treatment recommendation.</p>
        </div>
      )}

      {/* Priority Banner */}
      <div className={`w-full ${theme.bannerSurface} rounded-[16px] px-4 py-3 flex flex-col gap-0.5`}>
        <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: theme.accent }}>
          PHASE PRIORITY · {envData.phasePriorityTitle}
        </span>
        <p className="text-[15px]" style={{ color: theme.textPrimary }}>
          {envData.phasePriorityText}
        </p>
      </div>

      {/* 1. Top 4 Live Measured Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Heart Rate */}
        <div className={`${theme.cardSurface} rounded-[18px] p-4 flex flex-col justify-between min-h-[174px]`}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-semibold" style={{ color: theme.textPrimary }}>Heart rate</h3>
              <span className="text-[10.5px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.accent}18`, color: theme.accent }}>
                {latestByMetric.has('heartRate') ? 'MANUAL' : 'SIMULATED'}
              </span>
            </div>
            <p className="text-[22px] font-semibold mt-1" style={{ color: theme.accent }}>
              {latestByMetric.get('heartRate')?.value ?? envData.vitals.heartRate.current} {envData.vitals.heartRate.unit}
            </p>
          </div>
          <div>
            <p className="text-[13px]" style={{ color: theme.textSecondary }}>
              Simulated baseline: {envData.vitals.heartRate.baseline} {envData.vitals.heartRate.unit}
            </p>
            <p className="text-[11px]" style={{ color: theme.textMuted }}>{latestByMetric.has('heartRate') ? formatMeasurementDate(latestByMetric.get('heartRate')!.measuredAt) : 'Simulated demonstration value'}</p>
          </div>
        </div>

        {/* Blood Oxygen */}
        <div className={`${theme.cardSurface} rounded-[18px] p-4 flex flex-col justify-between min-h-[174px]`}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-semibold" style={{ color: theme.textPrimary }}>Blood oxygen</h3>
              <span className="text-[10.5px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.accent}18`, color: theme.accent }}>
                {latestByMetric.has('bloodOxygen') ? 'MANUAL' : 'SIMULATED'}
              </span>
            </div>
            <p className="text-[30px] font-semibold leading-tight mt-1" style={{ color: theme.accent }}>
              {latestByMetric.get('bloodOxygen')?.value ?? envData.vitals.bloodOxygen.current}{envData.vitals.bloodOxygen.unit}
            </p>
          </div>
          <div>
            <p className="text-[13px]" style={{ color: theme.textSecondary }}>
              Simulated baseline: {envData.vitals.bloodOxygen.baseline}{envData.vitals.bloodOxygen.unit}
            </p>
            <p className="text-[11px]" style={{ color: theme.textMuted }}>{latestByMetric.has('bloodOxygen') ? formatMeasurementDate(latestByMetric.get('bloodOxygen')!.measuredAt) : 'Simulated demonstration value'}</p>
          </div>
        </div>

        {/* Body Temperature */}
        <div className={`${theme.cardSurface} rounded-[18px] p-4 flex flex-col justify-between min-h-[174px]`}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-semibold" style={{ color: theme.textPrimary }}>Body temperature</h3>
              <span className="text-[10.5px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.accent}18`, color: theme.accent }}>
                {latestByMetric.has('bodyTemperature') ? 'MANUAL' : 'SIMULATED'}
              </span>
            </div>
            <p className="text-[30px] font-semibold leading-tight mt-1" style={{ color: theme.accent }}>
              {latestByMetric.get('bodyTemperature')?.value ?? envData.vitals.bodyTemperature.current} {envData.vitals.bodyTemperature.unit}
            </p>
          </div>
          <div>
            <p className="text-[13px]" style={{ color: theme.textSecondary }}>
              Simulated baseline: {envData.vitals.bodyTemperature.baseline} {envData.vitals.bodyTemperature.unit}
            </p>
            <p className="text-[11px]" style={{ color: theme.textMuted }}>{latestByMetric.has('bodyTemperature') ? formatMeasurementDate(latestByMetric.get('bodyTemperature')!.measuredAt) : 'Simulated demonstration value'}</p>
          </div>
        </div>

        {/* Breathing Rate */}
        <div className={`${theme.cardSurface} rounded-[18px] p-4 flex flex-col justify-between min-h-[174px]`}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-semibold" style={{ color: theme.textPrimary }}>Breathing rate</h3>
              <span className="text-[10.5px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.accent}18`, color: theme.accent }}>
                {latestByMetric.has('breathingRate') ? 'MANUAL' : 'SIMULATED'}
              </span>
            </div>
            <p className="text-[30px] font-semibold leading-tight mt-1" style={{ color: theme.accent }}>
              {latestByMetric.get('breathingRate')?.value ?? envData.vitals.breathingRate.current} {envData.vitals.breathingRate.unit}
            </p>
          </div>
          <div>
            <p className="text-[13px]" style={{ color: theme.textSecondary }}>
              Simulated baseline: {envData.vitals.breathingRate.baseline} {envData.vitals.breathingRate.unit}
            </p>
            <p className="text-[11px]" style={{ color: theme.textMuted }}>{latestByMetric.has('breathingRate') ? formatMeasurementDate(latestByMetric.get('breathingRate')!.measuredAt) : 'Simulated demonstration value'}</p>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Manual Measurement & Sensor Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {/* Simulated blood pressure reference */}
        <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col justify-between min-h-[340px]`}>
          <div className="flex flex-col gap-1">
            <h2 className="text-[19px] sm:text-[20px] font-semibold" style={{ color: theme.textPrimary }}>
              Blood pressure reference
            </h2>
            <span className="text-[12px] font-medium tracking-wide uppercase" style={{ color: theme.textSecondary }}>
              SIMULATED EXAMPLE · {envData.environmentDisplayName.toUpperCase()} CUFF TELEMETRY
            </span>

            <div className="pt-2">
              <span className="text-[14px]" style={{ color: theme.textSecondary }}>Blood pressure</span>
              <p className="text-[28px] font-semibold" style={{ color: theme.textPrimary }}>
                {envData.vitals.bloodPressure.systolic} / {envData.vitals.bloodPressure.diastolic} {envData.vitals.bloodPressure.unit}
              </p>
              <p className="text-[13px]" style={{ color: theme.textSecondary }}>Example only; this value was not entered or measured now.</p>
              <p className="text-[12.5px]" style={{ color: theme.textMuted }}>
                Baseline: {envData.vitals.bloodPressure.baselineSystolic} / {envData.vitals.bloodPressure.baselineDiastolic} {envData.vitals.bloodPressure.unit}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRecordingMeasurement(true)}
            className={`w-full sm:w-[360px] h-[56px] rounded-[16px] px-5 flex items-center justify-center gap-3 ${theme.buttonPrimary} font-semibold text-[15px] cursor-pointer transition-all mt-4`}
          >
            <span>Record vital measurement</span>
            <img src={imgContinueArrow} alt="" className="w-5 h-5 shrink-0" />
          </button>
        </div>

        {/* Sensor Feed Configuration */}
        <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col justify-between min-h-[340px]`}>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[19px] sm:text-[20px] font-semibold" style={{ color: theme.textPrimary }}>
              Monitoring source & interval
            </h2>
            <span className="text-[12px] font-medium tracking-wide uppercase" style={{ color: theme.textSecondary }}>
              SIMULATED TELEMETRY FEED · {envData.locationLabel}
            </span>
            <p className="text-[14px] pt-1" style={{ color: theme.textSecondary }}>
              These are simulated demonstration values for {envData.environmentDisplayName}. No wearable or medical device connection is active.
            </p>

            <div className="pt-2 flex items-center gap-6">
              <div>
                <span className="text-[12.5px]" style={{ color: theme.textSecondary }}>Sampling rate</span>
                <p className="text-[22px] font-semibold" style={{ color: theme.accent }}>{savedInterval}</p>
              </div>
              <div>
                <span className="text-[12.5px]" style={{ color: theme.textSecondary }}>Gravity field</span>
                <p className="text-[22px] font-semibold" style={{ color: theme.textPrimary }}>{envData.environmental.gravityLabel.split('·')[0].trim()}</p>
              </div>
            </div>

            {intervalNotice && (
              <div
                className="p-2.5 rounded-lg text-[12px] font-mono border mt-2 animate-fadeIn"
                style={{
                  backgroundColor: `${theme.accent}15`,
                  borderColor: `${theme.accent}40`,
                  color: theme.accent,
                }}
              >
                ✓ {intervalNotice}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={handleOpenIntervalConfig}
              className="text-[14px] font-semibold hover:underline text-left cursor-pointer flex items-center gap-1.5"
              style={{ color: theme.accent }}
            >
              <span>Configure monitoring interval</span>
              <span>›</span>
            </button>
            <button type="button" onClick={() => setIsConfiguringThresholds(true)} className="text-[14px] font-semibold hover:underline text-left cursor-pointer" style={{ color: theme.accent }}>
              Configure alert thresholds
            </button>
            <p className="text-[12px]" style={{ color: theme.warning }}>
              No device is connected. Use manual entry for new measurements; missing values are not treated as zero.
            </p>
          </div>
        </div>
      </div>

      <MeasurementHistoryPanel environment={currentEnv} />
      {/* Interval Settings Modal Dialog */}
      {isConfiguringInterval && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
          onClick={handleCancelInterval}
        >
          <div
            className={`w-full max-w-[500px] ${theme.cardSurface} rounded-[22px] p-5 sm:p-6 flex flex-col gap-5 border shadow-2xl relative`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="interval-dialog-title"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b pb-3" style={{ borderColor: theme.cardBorderHex }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${theme.tagBadge}`}>
                    INTERVAL CONFIG
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: theme.textSecondary }}>
                    {envData.environmentDisplayName}
                  </span>
                </div>
                <h2 id="interval-dialog-title" className="text-[20px] font-semibold tracking-tight mt-1" style={{ color: theme.textPrimary }}>
                  Configure monitoring interval
                </h2>
                <p className="text-[12.5px]" style={{ color: theme.textSecondary }}>
              Select a prototype display interval. This setting does not poll or connect to medical hardware.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancelInterval}
                aria-label="Close dialog"
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-[14px] cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: `${theme.accent}40`,
                  color: theme.textPrimary,
                }}
              >
                ✕
              </button>
            </div>

            {/* Options list */}
            <div className="flex flex-col gap-2.5">
              {INTERVAL_OPTIONS.map((opt) => {
                const isSelected = pendingInterval === opt.label;
                return (
                  <label
                    key={opt.id}
                    className="p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all"
                    style={{
                      backgroundColor: isSelected ? `${theme.accent}20` : theme.inputBg,
                      borderColor: isSelected ? theme.accent : `${theme.accent}30`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="monitoringInterval"
                        value={opt.label}
                        checked={isSelected}
                        onChange={() => setPendingInterval(opt.label)}
                        className="mt-1 accent-cyan-400"
                      />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold" style={{ color: isSelected ? theme.accent : theme.textPrimary }}>
                          {opt.label}
                        </span>
                        <span className="text-[12px]" style={{ color: theme.textSecondary }}>
                          {opt.desc}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-[10.5px] font-mono px-2 py-0.5 rounded shrink-0 hidden sm:inline-block"
                      style={{
                        backgroundColor: isSelected ? `${theme.accent}30` : 'rgba(255,255,255,0.06)',
                        color: isSelected ? theme.accent : theme.textMuted,
                      }}
                    >
                      {opt.profile}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Simulated Data Note */}
            <div
              className="p-3 rounded-xl text-[12px] flex flex-col gap-1 border"
              style={{
                backgroundColor: 'rgba(255, 187, 0, 0.08)',
                borderColor: 'rgba(255, 187, 0, 0.3)',
                color: theme.warning,
              }}
            >
              <span className="font-semibold uppercase tracking-wider text-[10.5px]">Simulation Notice</span>
              <p>Biometric values are simulated. Changing this interval updates only the prototype display setting; no sensor polling occurs.</p>
            </div>

            {/* Actions: Save & Cancel */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelInterval}
                className="px-4 h-[42px] rounded-xl border text-[13px] font-medium cursor-pointer transition-colors"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: `${theme.accent}40`,
                  color: theme.textSecondary,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInterval}
                className={`px-5 h-[42px] rounded-xl text-[13px] font-semibold cursor-pointer transition-all shadow-md ${theme.buttonPrimary}`}
              >
                Save monitoring interval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Bottom Row: Recheck Guidance */}
      <div className={`${theme.cardSurface} rounded-[18px] p-5 flex flex-col gap-2`}>
        <span className="text-[14px] font-semibold" style={{ color: theme.accent }}>
          {latestMeasurement ? `Latest manual record: ${formatMeasurementDate(latestMeasurement.measuredAt)}` : 'No manual measurements recorded for this environment'}
        </span>
        <p className="text-[14px] leading-relaxed" style={{ color: theme.textSecondary }}>
          For unexpected readings or symptoms, follow the onboard medical team’s procedures. ASTRA records measurements and configured limit crossings; it does not diagnose or replace medical assessment.
        </p>
        <button
          type="button"
          onClick={() => setIsConfiguringThresholds(true)}
          className="text-[14px] font-semibold hover:underline text-left cursor-pointer pt-1"
          style={{ color: theme.accent }}
        >
          Configure alert thresholds ›
        </button>
      </div>

      {/* Footer NASA Disclaimer */}
      <div className="pt-2 text-[12px]" style={{ color: theme.textMuted }}>
        <p>{envData.dataProvenanceDisclaimer}</p>
        <p style={{ color: theme.warning }}>Illustrative data, not NASA operational measurements. Not a validated diagnostic or treatment system.</p>
      </div>

      {isRecordingMeasurement && (
        <RecordMeasurementModal
          environment={currentEnv}
          profileId={profileId}
          onClose={() => setIsRecordingMeasurement(false)}
          onSave={handleSaveMeasurements}
          storageReady={!isStorageLoading && !storageError}
          storageError={storageError}
        />
      )}
      {isConfiguringThresholds && (
        <ConfigureMeasurementThresholdsModal
          environment={currentEnv}
          profileId={profileId}
          thresholds={thresholds}
          onClose={() => setIsConfiguringThresholds(false)}
          onSave={saveThresholds}
        />
      )}
    </div>
  );
}
