/**
 * Browser adapter for SPEC-0006 Athlete Profile & Multi-Athlete Tenancy.
 * Uses window.localStorage for persistent athlete tenancy.
 */
import {
  getOrCreateAthleteProfile,
  updateAthleteName,
  ATHLETE_STORAGE_KEY,
  ACTIVE_ATHLETE_KEY,
  ATHLETE_PROFILES,
  getActiveAthleteId as getActiveAthleteIdCore,
  setActiveAthleteId as setActiveAthleteIdCore,
  readAthleteScopedItem,
  writeAthleteScopedItem,
} from './athleteProfileCore.mjs';

export interface AthleteProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AthleteProfileMeta {
  id: string;
  name: string;
  role: string;
  subtitle: string;
  initial: string;
  accentColor: string;
  theme: string;
  tag: string;
}

function browserStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function getAthleteProfile(): AthleteProfile {
  const storage = browserStorage();
  if (!storage) {
    return {
      id: 'valentin',
      name: 'Valentín',
      createdAt: new Date().toISOString(),
    };
  }
  return getOrCreateAthleteProfile(storage) as AthleteProfile;
}

export function setAthleteName(name: string): AthleteProfile {
  const storage = browserStorage();
  if (!storage) {
    return { id: 'valentin', name, createdAt: new Date().toISOString() };
  }
  return updateAthleteName(storage, name) as AthleteProfile;
}

export function getActiveAthleteId(): string | null {
  const storage = browserStorage();
  if (!storage) return 'valentin';
  return getActiveAthleteIdCore(storage);
}

export function setActiveAthleteId(id: string): string {
  const storage = browserStorage();
  if (!storage) return 'valentin';
  return setActiveAthleteIdCore(storage, id);
}

export {
  ATHLETE_STORAGE_KEY,
  ACTIVE_ATHLETE_KEY,
  ATHLETE_PROFILES,
  readAthleteScopedItem,
  writeAthleteScopedItem,
};
