import { useState, type CSSProperties, type FormEvent } from 'react';
import type { EnvironmentType } from './EnvironmentCards';
import { formatMeasurementDate, localDateTimeInputValue, MEASUREMENT_METRICS, MEASUREMENT_SOURCES } from '../data/measurementConfig';
import type { MeasurementRecord, MeasurementMetricId, MeasurementSource } from '../data/measurementStore';
import { getTheme } from '../utils/themeTokens';

interface RecordMeasurementModalProps {
  environment: EnvironmentType;
  profileId: string;
  onClose: () => void;
  onSave: (records: MeasurementRecord[]) => Promise<void>;
  storageReady: boolean;
  storageError: string | null;
}

export function RecordMeasurementModal({ environment, profileId, onClose, onSave, storageReady, storageError }: RecordMeasurementModalProps) {
  const theme = getTheme(environment);
  const [values, setValues] = useState<Record<MeasurementMetricId, string>>({
    heartRate: '', bloodOxygen: '', bodyTemperature: '', breathingRate: '',
  });
  const [measuredAt, setMeasuredAt] = useState(localDateTimeInputValue());
  const [source, setSource] = useState<MeasurementSource>('manual-entry');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const previewDate = measuredAt ? new Date(measuredAt) : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (source !== 'manual-entry') {
      setError('That source is not connected yet. Choose Manual entry.');
      return;
    }
    const entered = MEASUREMENT_METRICS.filter((metric) => values[metric.id].trim() !== '');
    if (entered.length === 0) {
      setError('Enter at least one measurement. Blank values are not saved as zero.');
      return;
    }

    const localDate = new Date(measuredAt);
    if (!measuredAt || Number.isNaN(localDate.getTime())) {
      setError('Enter a valid measurement date and time.');
      return;
    }
    if (localDate.getTime() > Date.now()) {
      setError('Measurement time cannot be in the future.');
      return;
    }

    for (const metric of entered) {
      const raw = values[metric.id].trim();
      const number = Number(raw);
      if (!Number.isFinite(number)) {
        setError(`${metric.label} must be a valid number.`);
        return;
      }
      if (number < metric.minEntry || number > metric.maxEntry) {
        setError(`${metric.label} must be between ${metric.minEntry} and ${metric.maxEntry} ${metric.unit}. These are entry checks, not clinical alert limits.`);
        return;
      }
    }

    const timestamp = localDate.toISOString();
    const records: MeasurementRecord[] = entered.map((metric) => ({
      id: crypto.randomUUID(),
      profileId,
      environment,
      metric: metric.id,
      value: Number(values[metric.id]),
      unit: metric.unit,
      measuredAt: timestamp,
      source,
      status: 'manually-entered',
    }));

    setIsSaving(true);
    try {
      await onSave(records);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save the measurement. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-measurement-title"
        className={`w-full max-w-[720px] max-h-[92vh] overflow-y-auto ${theme.cardSurface} rounded-[22px] border p-5 sm:p-6 shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b pb-4" style={{ borderColor: theme.cardBorderHex }}>
          <div>
            <span className={`text-[11px] font-mono px-2 py-1 rounded ${theme.tagBadge}`}>MANUAL RECORD · {environment.toUpperCase()}</span>
            <h2 id="record-measurement-title" className="text-[22px] font-semibold mt-2" style={{ color: theme.textPrimary }}>Record new measurement</h2>
            <p className="text-[13px] mt-1" style={{ color: theme.textSecondary }}>Enter values from an appropriate instrument. ASTRA does not read a connected medical device.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close measurement form" className="h-10 w-10 shrink-0 rounded-xl border text-lg" style={{ borderColor: theme.cardBorderHex, color: theme.textPrimary }}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MEASUREMENT_METRICS.map((metric) => (
              <label key={metric.id} className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium" style={{ color: theme.textPrimary }}>{metric.label} <span style={{ color: theme.textMuted }}>({metric.unit})</span></span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={metric.minEntry}
                  max={metric.maxEntry}
                  step={metric.step}
                  value={values[metric.id]}
                  onChange={(event) => setValues((current) => ({ ...current, [metric.id]: event.target.value }))}
                  placeholder="Leave blank if not measured"
                  className="h-11 rounded-xl border px-3 text-sm outline-none focus:ring-2"
                  style={{ backgroundColor: theme.inputBg, borderColor: `${theme.accent}55`, color: theme.textPrimary, '--tw-ring-color': theme.accent } as CSSProperties}
                />
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium" style={{ color: theme.textPrimary }}>Measurement date and time</span>
              <input type="datetime-local" required value={measuredAt} max={localDateTimeInputValue()} onChange={(event) => setMeasuredAt(event.target.value)} className="h-11 rounded-xl border px-3 text-sm outline-none" style={{ backgroundColor: theme.inputBg, borderColor: `${theme.accent}55`, color: theme.textPrimary }} />
              <span className="text-[11px]" style={{ color: theme.textMuted }}>{previewDate && !Number.isNaN(previewDate.getTime()) ? `Local time: ${formatMeasurementDate(previewDate.toISOString())}` : 'Enter a valid date and time.'}</span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium" style={{ color: theme.textPrimary }}>Measurement source</span>
              <select value={source} onChange={(event) => setSource(event.target.value as MeasurementSource)} className="h-11 rounded-xl border px-3 text-sm outline-none" style={{ backgroundColor: theme.inputBg, borderColor: `${theme.accent}55`, color: theme.textPrimary }}>
                {MEASUREMENT_SOURCES.map((item) => <option key={item.id} value={item.id} disabled={!item.available}>{item.label}</option>)}
              </select>
              <span className="text-[11px]" style={{ color: theme.textMuted }}>Profile {profileId} · {environment} · manually entered</span>
            </label>
          </div>

          <div className="rounded-xl border p-3 text-[12px] leading-relaxed" style={{ borderColor: `${theme.warning}55`, backgroundColor: `${theme.warning}10`, color: theme.textSecondary }}>
            Entry bounds only check for likely typing or unit errors; they are not clinical limits. Existing dashboard samples remain marked SIMULATED. No device integrations are connected.
          </div>

          {(error || storageError) && <p role="alert" className="rounded-lg border p-3 text-sm" style={{ color: theme.warning, borderColor: `${theme.warning}55` }}>{error || storageError}</p>}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button type="button" onClick={onClose} className="h-11 rounded-xl border px-5 text-sm font-medium" style={{ borderColor: theme.cardBorderHex, color: theme.textSecondary }}>Cancel</button>
            <button type="submit" disabled={!storageReady || isSaving} className={`h-11 rounded-xl px-5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${theme.buttonPrimary}`}>
              {isSaving ? 'Saving…' : 'Save measurement'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
