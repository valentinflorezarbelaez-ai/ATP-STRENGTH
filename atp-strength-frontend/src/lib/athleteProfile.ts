/**
 * Browser adapter for SPEC-0006 Athlete Profile.
 * Uses window.localStorage for persistent athlete tenancy.
 */
import {
  getOrCreateAthleteProfile,
  updateAthleteName,
  ATHLETE_STORAGE_KEY,
} from './athleteProfileCore.mjs';

export interface AthleteProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

function browserStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function getAthleteProfile(): AthleteProfile {
  const storage = browserStorage();
  if (!storage) {
    return {
      id: 'ATH-DEFAULT',
      name: 'Atleta Zen',
      createdAt: new Date().toISOString(),
    };
  }
  return getOrCreateAthleteProfile(storage) as AthleteProfile;
}

export function setAthleteName(name: string): AthleteProfile {
  const storage = browserStorage();
  if (!storage) {
    return { id: 'ATH-DEFAULT', name, createdAt: new Date().toISOString() };
  }
  return updateAthleteName(storage, name) as AthleteProfile;
}

export { ATHLETE_STORAGE_KEY };
