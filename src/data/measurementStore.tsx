import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { EnvironmentType } from '../components/EnvironmentCards';

export type MeasurementMetricId = 'heartRate' | 'bloodOxygen' | 'bodyTemperature' | 'breathingRate';
export type MeasurementSource = 'manual-entry' | 'wearable-device' | 'pulse-oximeter' | 'thermometer' | 'imported-record';
export type MeasurementStatus = 'manually-entered' | 'simulated' | 'device-imported';

export interface AstronautProfile {
  id: string;
  fullName: string;
  role: string;
  missionName: string;
  flightDay: number;
  missionDurationDays: number;
  createdAt: string;
  isDemo?: boolean;
}

export type NewAstronautProfile = Omit<AstronautProfile, 'createdAt' | 'isDemo'>;

export interface MeasurementRecord {
  id: string;
  profileId: string;
  environment: EnvironmentType;
  metric: MeasurementMetricId;
  value: number;
  unit: 'bpm' | '%' | '°C' | 'breaths/min';
  measuredAt: string;
  source: MeasurementSource;
  status: MeasurementStatus;
}

export type SymptomRecordStatus = 'self-reported';

export interface SymptomRecord {
  id: string;
  profileId: string;
  environment: EnvironmentType;
  regionId: string;
  regionName: string;
  symptomType: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  intensity: number;
  notes: string;
  recordedAt: string;
  status: SymptomRecordStatus;
}

export interface MeasurementThreshold {
  id: string;
  profileId: string;
  environment: EnvironmentType;
  metric: MeasurementMetricId;
  minimum?: number;
  maximum?: number;
  updatedAt: string;
}

interface MeasurementContextValue {
  profiles: AstronautProfile[];
  activeProfile: AstronautProfile | null;
  selectProfile: (profileId: string | null) => void;
  createAstronautProfile: (profile: NewAstronautProfile) => Promise<void>;
  records: MeasurementRecord[];
  thresholds: MeasurementThreshold[];
  symptomRecords: SymptomRecord[];
  isLoading: boolean;
  storageError: string | null;
  addMeasurements: (records: MeasurementRecord[]) => Promise<void>;
  saveThresholds: (values: Omit<MeasurementThreshold, 'id' | 'updatedAt'>[]) => Promise<void>;
  addSymptomRecord: (record: SymptomRecord) => Promise<void>;
}

const DATABASE_NAME = 'astra-measurements';
const DATABASE_VERSION = 3;
const RECORDS_STORE = 'measurements';
const THRESHOLDS_STORE = 'thresholds';
const SYMPTOMS_STORE = 'symptomRecords';
const PROFILES_STORE = 'astronautProfiles';
const MeasurementContext = createContext<MeasurementContextValue | null>(null);

function openMeasurementDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser does not support IndexedDB. Measurements cannot be saved here.'));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PROFILES_STORE)) {
        const profiles = database.createObjectStore(PROFILES_STORE, { keyPath: 'id' });
        profiles.createIndex('fullName', 'fullName');
      }
      if (!database.objectStoreNames.contains(RECORDS_STORE)) {
        const records = database.createObjectStore(RECORDS_STORE, { keyPath: 'id' });
        records.createIndex('profileEnvironmentTime', ['profileId', 'environment', 'measuredAt']);
        records.createIndex('profileEnvironmentMetricTime', ['profileId', 'environment', 'metric', 'measuredAt']);
      }
      if (!database.objectStoreNames.contains(SYMPTOMS_STORE)) {
        const symptoms = database.createObjectStore(SYMPTOMS_STORE, { keyPath: 'id' });
        symptoms.createIndex('profileEnvironmentTime', ['profileId', 'environment', 'recordedAt']);
        symptoms.createIndex('profileEnvironmentRegionTime', ['profileId', 'environment', 'regionId', 'recordedAt']);
      }
      if (!database.objectStoreNames.contains(THRESHOLDS_STORE)) {
        const thresholds = database.createObjectStore(THRESHOLDS_STORE, { keyPath: 'id' });
        thresholds.createIndex('profileEnvironment', ['profileId', 'environment']);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open measurement storage.'));
    request.onblocked = () => reject(new Error('Measurement storage is busy in another ASTRA tab. Close the other tab and retry.'));
  });
}

function readStore<T>(database: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const request = transaction.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error ?? new Error('Unable to load saved measurements.'));
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to read measurement storage.'));
  });
}

function writeAstronautProfile(database: IDBDatabase, profile: AstronautProfile): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PROFILES_STORE, 'readwrite');
    transaction.objectStore(PROFILES_STORE).add(profile);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to save this astronaut profile.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Astronaut profile creation was cancelled.'));
  });
}

function writeRecords(database: IDBDatabase, records: MeasurementRecord[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(RECORDS_STORE, 'readwrite');
    const store = transaction.objectStore(RECORDS_STORE);
    records.forEach((record) => store.add(record));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to save the measurement.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Measurement save was cancelled.'));
  });
}

function writeSymptomRecord(database: IDBDatabase, record: SymptomRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(SYMPTOMS_STORE, 'readwrite');
    transaction.objectStore(SYMPTOMS_STORE).add(record);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to save the symptom record.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Symptom record save was cancelled.'));
  });
}

function writeThresholds(database: IDBDatabase, values: Omit<MeasurementThreshold, 'id' | 'updatedAt'>[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(THRESHOLDS_STORE, 'readwrite');
    const store = transaction.objectStore(THRESHOLDS_STORE);
    const updatedAt = new Date().toISOString();
    values.forEach((value) => {
      const id = `${value.profileId}:${value.environment}:${value.metric}`;
      if (value.minimum === undefined && value.maximum === undefined) {
        store.delete(id);
      } else {
        store.put({ ...value, id, updatedAt } satisfies MeasurementThreshold);
      }
    });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to save threshold settings.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Threshold save was cancelled.'));
  });
}

export function MeasurementProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<AstronautProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('astra_active_profile_id');
    }
    return null;
  });
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? null;
  const [records, setRecords] = useState<MeasurementRecord[]>([]);
  const [thresholds, setThresholds] = useState<MeasurementThreshold[]>([]);
  const [symptomRecords, setSymptomRecords] = useState<SymptomRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [database, setDatabase] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    let isMounted = true;
    let openedDatabase: IDBDatabase | null = null;
    openMeasurementDatabase()
      .then(async (db) => {
        openedDatabase = db;
        const [savedRecords, savedThresholds, savedSymptoms, savedProfiles] = await Promise.all([
          readStore<MeasurementRecord>(db, RECORDS_STORE),
          readStore<MeasurementThreshold>(db, THRESHOLDS_STORE),
          readStore<SymptomRecord>(db, SYMPTOMS_STORE),
          readStore<AstronautProfile>(db, PROFILES_STORE),
        ]);
        if (!isMounted) { db.close(); return; }
        let resolvedProfiles = savedProfiles;
        if (resolvedProfiles.length === 0) {
          const legacyProfile: AstronautProfile = { id: 'AST-7426', fullName: 'Dr. Elena Ramirez', role: 'Mission Specialist', missionName: 'ASTRA', flightDay: 42, missionDurationDays: 180, createdAt: new Date().toISOString(), isDemo: true };
          await writeAstronautProfile(db, legacyProfile);
          resolvedProfiles = [legacyProfile];
        }
        setProfiles(resolvedProfiles);
        const storedProfileId = typeof localStorage !== 'undefined' ? localStorage.getItem('astra_active_profile_id') : null;
        if (storedProfileId && resolvedProfiles.some((p) => p.id === storedProfileId)) {
          setActiveProfileId(storedProfileId);
        }
        setDatabase(db);
        setRecords(savedRecords.sort((a, b) => b.measuredAt.localeCompare(a.measuredAt)));
        setThresholds(savedThresholds);
        setSymptomRecords(savedSymptoms.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)));
        setStorageError(null);
      })
      .catch((error: unknown) => {
        if (isMounted) setStorageError(error instanceof Error ? error.message : 'Unable to access measurement storage.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
      openedDatabase?.close();
    };
  }, []);

  const selectProfile = useCallback((profileId: string | null) => {
    setActiveProfileId(profileId);
    if (typeof localStorage !== 'undefined') {
      if (profileId) {
        localStorage.setItem('astra_active_profile_id', profileId);
      } else {
        localStorage.removeItem('astra_active_profile_id');
      }
    }
  }, []);

  const createAstronautProfile = useCallback(async (input: NewAstronautProfile) => {
    if (!database) throw new Error(storageError || 'Profile storage is not ready.');
    if (profiles.some((profile) => profile.id.toLowerCase() === input.id.toLowerCase())) throw new Error('That astronaut ID is already in use on this device.');
    const profile: AstronautProfile = { ...input, fullName: input.fullName.trim(), role: input.role.trim(), missionName: input.missionName.trim(), createdAt: new Date().toISOString() };
    await writeAstronautProfile(database, profile);
    setProfiles((current) => [...current, profile]);
    selectProfile(profile.id);
  }, [database, storageError, profiles, selectProfile]);

  const addMeasurements = useCallback(async (newRecords: MeasurementRecord[]) => {
    if (!database) throw new Error(storageError || 'Measurement storage is not ready.');
    await writeRecords(database, newRecords);
    setRecords((current) => [...newRecords, ...current].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt)));
  }, [database, storageError]);

  const addSymptomRecord = useCallback(async (record: SymptomRecord) => {
    if (!database) throw new Error(storageError || 'Measurement storage is not ready.');
    await writeSymptomRecord(database, record);
    setSymptomRecords((current) => [record, ...current].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)));
  }, [database, storageError]);

  const saveThresholds = useCallback(async (values: Omit<MeasurementThreshold, 'id' | 'updatedAt'>[]) => {
    if (!database) throw new Error(storageError || 'Measurement storage is not ready.');
    await writeThresholds(database, values);
    const refreshed = await readStore<MeasurementThreshold>(database, THRESHOLDS_STORE);
    setThresholds(refreshed);
  }, [database, storageError]);

  const value = useMemo(() => ({ profiles, activeProfile, selectProfile, createAstronautProfile, records, thresholds, symptomRecords, isLoading, storageError, addMeasurements, saveThresholds, addSymptomRecord }), [profiles, activeProfile, selectProfile, createAstronautProfile, records, thresholds, symptomRecords, isLoading, storageError, addMeasurements, saveThresholds, addSymptomRecord]);
  return <MeasurementContext.Provider value={value}>{children}</MeasurementContext.Provider>;
}

export function useMeasurements() {
  const value = useContext(MeasurementContext);
  if (!value) throw new Error('useMeasurements must be used inside MeasurementProvider.');
  return value;
}
