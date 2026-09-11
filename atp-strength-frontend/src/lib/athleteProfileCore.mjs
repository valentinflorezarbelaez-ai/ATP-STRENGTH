/**
 * Athlete Profile Core — SPEC-0006.
 * Manages local athlete tenancy, identity, and profile settings.
 * Zero external dependencies, pure storage injection.
 */

export const ATHLETE_STORAGE_KEY = 'atp_athlete_profile_v1';

export function getOrCreateAthleteProfile(storage) {
  try {
    const raw = storage.getItem(ATHLETE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.id === 'string' && typeof parsed.name === 'string') {
        return parsed;
      }
    }
  } catch {
    // ignore parse error, re-create
  }

  const newProfile = {
    id: `ATH-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: 'Atleta Zen',
    createdAt: new Date().toISOString(),
  };

  storage.setItem(ATHLETE_STORAGE_KEY, JSON.stringify(newProfile));
  return newProfile;
}

export function updateAthleteName(storage, rawName) {
  if (typeof rawName !== 'string') {
    throw new Error('ERR_INVALID_ATHLETE_NAME: Name must be a string');
  }
  const trimmed = rawName.trim();
  if (trimmed.length < 1 || trimmed.length > 50) {
    throw new Error('ERR_INVALID_ATHLETE_NAME: Name must be between 1 and 50 characters');
  }

  const profile = getOrCreateAthleteProfile(storage);
  const updated = {
    ...profile,
    name: trimmed,
    updatedAt: new Date().toISOString(),
  };

  storage.setItem(ATHLETE_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
