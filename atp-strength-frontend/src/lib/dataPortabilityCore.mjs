/**
 * Data Portability & Backup Core — SPEC-0006.
 * Zero-dependency JSON backup/restore and CSV generator.
 */

export const BACKUP_VERSION = '1.0';

export function generateBackupData(storage) {
  const safeGet = (key) => {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    athlete: safeGet('atp_athlete_profile_v1') || { name: 'Atleta Zen' },
    maxes: safeGet('atp_exercise_maxes_v1') || {},
    sessionProgress: safeGet('neuro_strength_session_progress') || null,
    audioPreferences: safeGet('atp_coach_audio_prefs') || null,
  };
}

export function restoreBackupData(storage, rawJson) {
  let parsed;
  try {
    parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
  } catch (err) {
    throw new Error(`ERR_INVALID_BACKUP_PAYLOAD: Malformed JSON (${err.message})`);
  }

  if (!parsed || typeof parsed !== 'object' || parsed.version !== BACKUP_VERSION) {
    throw new Error('ERR_INVALID_BACKUP_PAYLOAD: Missing or unsupported backup version');
  }

  const restored = [];

  if (parsed.athlete && typeof parsed.athlete === 'object') {
    storage.setItem('atp_athlete_profile_v1', JSON.stringify(parsed.athlete));
    restored.push('athlete');
  }

  if (parsed.maxes && typeof parsed.maxes === 'object') {
    storage.setItem('atp_exercise_maxes_v1', JSON.stringify(parsed.maxes));
    restored.push('maxes');
  }

  if (parsed.sessionProgress && typeof parsed.sessionProgress === 'object') {
    storage.setItem('neuro_strength_session_progress', JSON.stringify(parsed.sessionProgress));
    restored.push('sessionProgress');
  }

  if (parsed.audioPreferences && typeof parsed.audioPreferences === 'object') {
    storage.setItem('atp_coach_audio_prefs', JSON.stringify(parsed.audioPreferences));
    restored.push('audioPreferences');
  }

  return {
    success: true,
    restoredKeys: restored,
  };
}

export function generateHistoryCsv(records = []) {
  const header = 'Timestamp,Exercise,Set,Weight_kg,Reps,RPE,RIR,e1RM';
  const rows = records.map((r) => {
    const ts = r.timestamp || '';
    const ex = `"${(r.exercise_name || '').replace(/"/g, '""')}"`;
    const set = r.set_number ?? '';
    const load = r.load_kg ?? 0;
    const reps = r.completed_reps ?? r.prescribed_reps ?? '';
    const rpe = r.rpe ?? '';
    const rir = r.rir ?? '';
    const e1rm = r.e1rm ?? '';
    return `${ts},${ex},${set},${load},${reps},${rpe},${rir},${e1rm}`;
  });

  return [header, ...rows].join('\n');
}
