import { useMemo, useState } from 'react';
import type { EnvironmentType } from './EnvironmentCards';
import { formatMeasurementDate, MEASUREMENT_METRICS } from '../data/measurementConfig';
import type { MeasurementMetricId } from '../data/measurementStore';
import { useMeasurements } from '../data/measurementStore';
import { getTheme } from '../utils/themeTokens';

interface MeasurementHistoryPanelProps {
  environment: EnvironmentType;
  showHistory?: boolean;
}

const RANGE_OPTIONS = [
  { id: '24h', label: '24 hours', days: 1 },
  { id: '7d', label: '7 days', days: 7 },
  { id: '30d', label: '30 days', days: 30 },
  { id: 'all', label: 'All time', days: Infinity },
] as const;

export function MeasurementHistoryPanel({ environment, showHistory = true }: MeasurementHistoryPanelProps) {
  const theme = getTheme(environment);
  const { records, thresholds, activeProfile } = useMeasurements();
  const profileId = activeProfile?.id ?? ''; 
  const [metricId, setMetricId] = useState<MeasurementMetricId>('heartRate');
  const [rangeId, setRangeId] = useState<(typeof RANGE_OPTIONS)[number]['id']>('30d');
  const metric = MEASUREMENT_METRICS.find((item) => item.id === metricId)!;
  const range = RANGE_OPTIONS.find((item) => item.id === rangeId)!;
  const filtered = useMemo(() => {
    const cutoff = range.days === Infinity ? -Infinity : Date.now() - range.days * 86_400_000;
    return records
      .filter((record) => record.profileId === profileId && record.environment === environment && record.metric === metricId && new Date(record.measuredAt).getTime() >= cutoff)
      .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
  }, [records, environment, metricId, range.days, profileId]);
  const visibleRecords = [...filtered].slice(-12);
  const latestFirst = [...filtered].reverse();
  const threshold = thresholds.find((item) => item.profileId === profileId && item.environment === environment && item.metric === metricId);
  const minValue = Math.min(...visibleRecords.map((record) => record.value));
  const maxValue = Math.max(...visibleRecords.map((record) => record.value));

  return (
    <section className={`${theme.cardSurface} rounded-[18px] p-4 sm:p-5 flex flex-col gap-4`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: theme.accent }}>MANUALLY RECORDED · {environment.toUpperCase()}</span>
          <h2 className="text-[18px] font-semibold mt-1" style={{ color: theme.textPrimary }}>Measurement history & trends</h2>
          <p className="text-[12px] mt-1" style={{ color: theme.textSecondary }}>Only saved measurement records appear here; simulated samples are kept separate.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wide" style={{ color: theme.textMuted }}>
            Measurement
            <select value={metricId} onChange={(event) => setMetricId(event.target.value as MeasurementMetricId)} className="h-9 rounded-lg border px-2 text-[12px] normal-case tracking-normal" style={{ backgroundColor: theme.inputBg, borderColor: `${theme.accent}45`, color: theme.textPrimary }}>
              {MEASUREMENT_METRICS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wide" style={{ color: theme.textMuted }}>
            Date range
            <select value={rangeId} onChange={(event) => setRangeId(event.target.value as typeof rangeId)} className="h-9 rounded-lg border px-2 text-[12px] normal-case tracking-normal" style={{ backgroundColor: theme.inputBg, borderColor: `${theme.accent}45`, color: theme.textPrimary }}>
              {RANGE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {visibleRecords.length ? (
        <div className="rounded-xl border p-3" style={{ backgroundColor: theme.inputBg, borderColor: `${theme.accent}35` }}>
          <div className="h-[172px] flex items-end gap-2 sm:gap-3 overflow-x-auto px-1" role="img" aria-label={`${metric.label} measurements over ${range.label}`}>
            {visibleRecords.map((record) => {
              const span = maxValue - minValue;
              const height = span === 0 ? 68 : 30 + ((record.value - minValue) / span) * 58;
              return (
                <div key={record.id} className="min-w-[32px] flex-1 h-full flex flex-col items-center justify-end gap-1.5" title={`${record.value} ${record.unit} · ${formatMeasurementDate(record.measuredAt)}`}>
                  <span className="text-[10px] font-mono" style={{ color: theme.textPrimary }}>{record.value}</span>
                  <div className="w-full max-w-[38px] rounded-t-md transition-all" style={{ height: `${height}%`, backgroundColor: theme.accent, minHeight: 8 }} />
                  <span className="text-[9px] whitespace-nowrap" style={{ color: theme.textMuted }}>{new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(record.measuredAt))}</span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap justify-between gap-2 pt-2 text-[11px]" style={{ color: theme.textMuted }}>
            <span>{filtered.length} saved {filtered.length === 1 ? 'measurement' : 'measurements'} · {metric.unit}</span>
            <span>{threshold ? 'Configured limits apply' : 'No alert limits configured'}</span>
          </div>
        </div>
      ) : (
        <div className="min-h-[96px] rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 px-4 text-center" style={{ borderColor: `${theme.accent}45`, color: theme.textSecondary }}>
          <span className="text-[13px] font-medium">No recorded {metric.label.toLowerCase()} measurements in this range.</span>
          <span className="text-[11px]">Enter a manual measurement to start this history. Missing values are not plotted as zero.</span>
        </div>
      )}

      {showHistory && (
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: `${theme.accent}28` }}>
          <table className="w-full min-w-[540px] text-left text-[12px]">
            <thead style={{ backgroundColor: `${theme.accent}12`, color: theme.textSecondary }}>
              <tr><th className="px-3 py-2 font-medium">Measurement</th><th className="px-3 py-2 font-medium">Value</th><th className="px-3 py-2 font-medium">Measured at</th><th className="px-3 py-2 font-medium">Source / status</th></tr>
            </thead>
            <tbody>
              {latestFirst.slice(0, 12).map((record) => {
                const configured = thresholds.find((item) => item.profileId === record.profileId && item.environment === record.environment && item.metric === record.metric);
                const crossed = Boolean(configured && ((configured.minimum !== undefined && record.value < configured.minimum) || (configured.maximum !== undefined && record.value > configured.maximum)));
                const label = MEASUREMENT_METRICS.find((item) => item.id === record.metric)?.label ?? record.metric;
                return <tr key={record.id} className="border-t" style={{ borderColor: `${theme.accent}20`, color: theme.textPrimary }}><td className="px-3 py-2">{label}</td><td className="px-3 py-2 font-semibold">{record.value} {record.unit}</td><td className="px-3 py-2 whitespace-nowrap">{formatMeasurementDate(record.measuredAt)}</td><td className="px-3 py-2">Manual entry · {crossed ? 'Configured limit crossed' : configured ? 'Within configured limits' : 'No alert limit set'}</td></tr>;
              })}
              {!latestFirst.length && <tr><td colSpan={4} className="px-3 py-4 text-center" style={{ color: theme.textMuted }}>No manual records for this measurement in the selected range.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
