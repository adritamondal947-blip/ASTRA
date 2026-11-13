import type { MeasurementMetricId, MeasurementSource, AstronautProfile } from './measurementStore';
import type { EnvironmentType } from '../components/EnvironmentCards';

export const MEASUREMENT_METRICS: {
  id: MeasurementMetricId;
  label: string;
  unit: 'bpm' | '%' | '°C' | 'breaths/min';
  minEntry: number;
  maxEntry: number;
  step: string;
}[] = [
  { id: 'heartRate', label: 'Heart rate', unit: 'bpm', minEntry: 1, maxEntry: 300, step: '1' },
  { id: 'bloodOxygen', label: 'Blood oxygen (SpO₂)', unit: '%', minEntry: 1, maxEntry: 100, step: '1' },
  { id: 'bodyTemperature', label: 'Body temperature', unit: '°C', minEntry: 1, maxEntry: 50, step: '0.1' },
  { id: 'breathingRate', label: 'Respiratory rate', unit: 'breaths/min', minEntry: 1, maxEntry: 100, step: '1' },
];

export const MEASUREMENT_SOURCES: { id: MeasurementSource; label: string; available: boolean }[] = [
  { id: 'manual-entry', label: 'Manual entry', available: true },
  { id: 'wearable-device', label: 'Wearable device (not connected)', available: false },
  { id: 'pulse-oximeter', label: 'Pulse oximeter (not connected)', available: false },
  { id: 'thermometer', label: 'Thermometer (not connected)', available: false },
  { id: 'imported-record', label: 'Imported medical record (not connected)', available: false },
];

export function localDateTimeInputValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function formatMeasurementDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export function formatProfileMissionProgress(profile: AstronautProfile | null | undefined, environment: EnvironmentType, fallback: string) {
  if (!profile) return fallback;
  const prefix = environment === 'Moon' ? 'Lunar Day' : environment === 'Mars' ? 'Sol' : 'Flight Day';
  return prefix + ' ' + profile.flightDay + ' / ' + profile.missionDurationDays;
}
