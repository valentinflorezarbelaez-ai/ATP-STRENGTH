/**
 * Athlete Profile Core — SPEC-0006 & Multi-Athlete Tenancy.
 * Manages local athlete tenancy, identity, and profile settings for Valentín and Jacobo.
 * Zero external dependencies, pure storage injection.
 */

export const ATHLETE_STORAGE_KEY = 'atp_athlete_profile_v1';
export const ACTIVE_ATHLETE_KEY = 'atp_active_athlete_id_v1';

export const ATHLETE_PROFILES = [
  {
    id: 'valentin',
    name: 'Valentín',
    role: 'Titán Forjador',
    subtitle: 'Fuerza Pura & Tensión Muscular',
    initial: 'V',
    accentColor: '#cca43b',
    theme: 'amber',
    tag: 'Fuerza Pura',
  },
  {
    id: 'jacobo',
    name: 'Jacobo',
    role: 'Guerrero Olímpico',
    subtitle: 'Potencia Balística & Explosividad',
    initial: 'J',
    accentColor: '#10b981',
    theme: 'emerald',
    tag: 'Potencia & RFD',
  },
];

export function getActiveAthleteId(storage) {
  if (!storage || typeof storage.getItem !== 'function') return 'valentin';
  try {
    const saved = storage.getItem(ACTIVE_ATHLETE_KEY);
    if (saved === 'jacobo' || saved === 'valentin') return saved;
  } catch {
    // ignore
  }
  return null;
}

export function setActiveAthleteId(storage, athleteId) {
  if (!storage || typeof storage.setItem !== 'function') return 'valentin';
  const validId = athleteId === 'jacobo' ? 'jacobo' : 'valentin';
  storage.setItem(ACTIVE_ATHLETE_KEY, validId);
  const match = ATHLETE_PROFILES.find((p) => p.id === validId);
  if (match) {
    try {
      updateAthleteName(storage, match.name);
    } catch {
      // ignore
    }
  }
  return validId;
}

export function readAthleteScopedItem(storage, baseKey, athleteId) {
  if (!storage || typeof storage.getItem !== 'function') return null;
  const id = athleteId || getActiveAthleteId(storage) || 'valentin';
  const scopedKey = `${id}:${baseKey}`;
  try {
    const scopedVal = storage.getItem(scopedKey);
    if (scopedVal !== null) return scopedVal;
    // Seamless fallback for valentin so no legacy marks or history are lost
    if (id === 'valentin') {
      return storage.getItem(baseKey);
    }
  } catch {
    return null;
  }
  return null;
}

export function writeAthleteScopedItem(storage, baseKey, value, athleteId) {
  if (!storage || typeof storage.setItem !== 'function') return;
  const id = athleteId || getActiveAthleteId(storage) || 'valentin';
  const scopedKey = `${id}:${baseKey}`;
  try {
    storage.setItem(scopedKey, value);
    // For valentin, keep legacy baseKey synchronized as backup
    if (id === 'valentin') {
      storage.setItem(baseKey, value);
    }
  } catch {
    // ignore quota/security errors
  }
}

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
