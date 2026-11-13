import { useState, type FormEvent } from 'react';
import type { EnvironmentType } from './EnvironmentCards';
import { MEASUREMENT_METRICS } from '../data/measurementConfig';
import type { MeasurementThreshold } from '../data/measurementStore';
import { getTheme } from '../utils/themeTokens';

interface ConfigureMeasurementThresholdsModalProps {
  environment: EnvironmentType;
  profileId: string;
  thresholds: MeasurementThreshold[];
  onClose: () => void;
  onSave: (values: Omit<MeasurementThreshold, 'id' | 'updatedAt'>[]) => Promise<void>;
}

export function ConfigureMeasurementThresholdsModal({ environment, profileId, thresholds, onClose, onSave }: ConfigureMeasurementThresholdsModalProps) {
  const theme = getTheme(environment);
  const [values, setValues] = useState<Record<string, { minimum: string; maximum: string }>>(() =>
    Object.fromEntries(MEASUREMENT_METRICS.map((metric) => {
      const configured = thresholds.find((item) => item.environment === environment && item.profileId === profileId && item.metric === metric.id);
      return [metric.id, { minimum: configured?.minimum?.toString() ?? '', maximum: configured?.maximum?.toString() ?? '' }];
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const updates: Omit<MeasurementThreshold, 'id' | 'updatedAt'>[] = [];
    for (const metric of MEASUREMENT_METRICS) {
      const minimumText = values[metric.id].minimum.trim();
      const maximumText = values[metric.id].maximum.trim();
      const minimum = minimumText ? Number(minimumText) : undefined;
      const maximum = maximumText ? Number(maximumText) : undefined;
      for (const [label, value] of [['Minimum', minimum], ['Maximum', maximum]] as const) {
        if (value !== undefined && (!Number.isFinite(value) || value < metric.minEntry || value > metric.maxEntry)) {
          setError(`${label} ${metric.label.toLowerCase()} must be between ${metric.minEntry} and ${metric.maxEntry} ${metric.unit}.`);
          return;
        }
      }
      if (minimum !== undefined && maximum !== undefined && minimum >= maximum) {
        setError(`Minimum ${metric.label.toLowerCase()} must be lower than its maximum.`);
        return;
      }
      updates.push({ profileId, environment, metric: metric.id, minimum, maximum });
    }

    setIsSaving(true);
    try {
      await onSave(updates);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save threshold settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="thresholds-title" className={`w-full max-w-[720px] max-h-[92vh] overflow-y-auto ${theme.cardSurface} rounded-[22px] border p-5 sm:p-6 shadow-2xl`}>
        <div className="border-b pb-4" style={{ borderColor: theme.cardBorderHex }}>
          <span className={`text-[11px] font-mono px-2 py-1 rounded ${theme.tagBadge}`}>ALERT RULES · {environment.toUpperCase()}</span>
          <h2 id="thresholds-title" className="text-[21px] font-semibold mt-2" style={{ color: theme.textPrimary }}>Configure measurement thresholds</h2>
          <p className="text-[12px] mt-1" style={{ color: theme.textSecondary }}>Enter limits supplied for this astronaut and mission by the responsible medical team. ASTRA does not provide default clinical limits.</p>
          <p className="text-[11px] mt-1" style={{ color: theme.textMuted }}>Profile {profileId} · Unconfigured metrics do not generate threshold alerts.</p>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 flex flex-col gap-4">
          <div className="grid grid-cols-[minmax(0,1fr)_1fr_1fr] gap-2 items-end">
            <span className="text-[11px] uppercase tracking-wide" style={{ color: theme.textMuted }}>Measurement</span>
            <span className="text-[11px] uppercase tracking-wide" style={{ color: theme.textMuted }}>Minimum</span>
            <span className="text-[11px] uppercase tracking-wide" style={{ color: theme.textMuted }}>Maximum</span>
            {MEASUREMENT_METRICS.map((metric) => (
              <div key={metric.id} className="contents">
                <span className="text-[12px] font-medium py-2" style={{ color: theme.textPrimary }}>{metric.label} <span style={{ color: theme.textMuted }}>({metric.unit})</span></span>
                {(['minimum', 'maximum'] as const).map((bound) => (
                  <input key={bound} type="number" inputMode="decimal" min={metric.minEntry} max={metric.maxEntry} step={metric.step} aria-label={`${bound} ${metric.label}`} placeholder="Not set" value={values[metric.id][bound]} onChange={(event) => setValues((current) => ({ ...current, [metric.id]: { ...current[metric.id], [bound]: event.target.value } }))} className="h-10 min-w-0 rounded-lg border px-2 text-sm" style={{ backgroundColor: theme.inputBg, borderColor: `${theme.accent}50`, color: theme.textPrimary }} />
                ))}
              </div>
            ))}
          </div>

          <div className="rounded-xl border p-3 text-[12px] leading-relaxed" style={{ borderColor: `${theme.warning}55`, backgroundColor: `${theme.warning}10`, color: theme.textSecondary }}>
            These are user-configured alert rules, not ASTRA medical advice. Configure only limits approved for this profile and mission. Alerts report a configured limit crossing; they do not diagnose a condition.
          </div>
          {error && <p role="alert" className="text-sm" style={{ color: theme.warning }}>{error}</p>}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button type="button" onClick={onClose} className="h-11 rounded-xl border px-5 text-sm font-medium" style={{ borderColor: theme.cardBorderHex, color: theme.textSecondary }}>Cancel</button>
            <button type="submit" disabled={isSaving} className={`h-11 rounded-xl px-5 text-sm font-semibold disabled:opacity-50 ${theme.buttonPrimary}`}>{isSaving ? 'Saving…' : 'Save alert thresholds'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
