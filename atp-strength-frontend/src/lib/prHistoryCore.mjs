/**
 * SPEC-0009 — PR Historical Persistence & Neuromuscular Supercompensation Engine.
 * Pure ESM module (L0) with zero runtime dependencies.
 * Sovereign client-side storage for 1RM records, set logs, and progression curves.
 */

import { computeEstimated1Rm } from './rpeEngine.mjs';

export const HISTORY_STORAGE_KEY = 'atp_history_records_v1';
export const MAX_HISTORY_RECORDS = 2000;

/**
 * Safely retrieves all history records from storage.
 * @param {Storage|Object} storage
 * @returns {Array<Object>}
 */
export function getAllHistoryRecords(storage) {
  if (!storage || typeof storage.getItem !== 'function') return [];
  try {
    const raw = storage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Normalizes an exercise name for consistent matching.
 * @param {string} name
 * @returns {string}
 */
export function normalizeExerciseName(name) {
  return (name || '').trim().toLowerCase();
}

/**
 * Retrieves history records for a specific exercise, sorted chronologically (oldest to newest).
 * @param {Storage|Object} storage
 * @param {string} exerciseName
 * @returns {Array<Object>}
 */
export function getExerciseHistory(storage, exerciseName) {
  const norm = normalizeExerciseName(exerciseName);
  if (!norm) return [];
  const all = getAllHistoryRecords(storage);
  return all
    .filter((r) => normalizeExerciseName(r.exercise_name) === norm)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Finds the highest historical estimated 1RM for an exercise.
 * @param {Storage|Object} storage
 * @param {string} exerciseName
 * @returns {number}
 */
export function getBestHistoricalE1rm(storage, exerciseName) {
  const history = getExerciseHistory(storage, exerciseName);
  if (!history.length) return 0;
  return history.reduce((max, item) => Math.max(max, item.e1rm || 0), 0);
}

/**
 * Records a completed set into the sovereign history ledger.
 * Automatically computes e1RM, detects personal records (PRs), and bounds record capacity.
 *
 * @param {Storage|Object} storage
 * @param {Object} input
 * @param {string} input.exercise_name
 * @param {number} input.load_kg
 * @param {number} input.completed_reps
 * @param {number} [input.prescribed_reps]
 * @param {number} [input.set_number=1]
 * @param {number} [input.rpe=8.0]
 * @param {number} [input.rir]
 * @param {number} [input.e1rm]
 * @param {string} [input.notes]
 * @param {string} [input.timestamp]
 * @returns {Object} result details with PR status
 */
export function recordSetHistory(storage, input) {
  if (!storage || typeof storage.setItem !== 'function') {
    throw new Error('ERR_STORAGE_UNAVAILABLE: Storage interface missing setItem');
  }

  const exName = (input.exercise_name || '').trim();
  if (!exName) {
    throw new Error('ERR_INVALID_EXERCISE_NAME: Exercise name must be a non-empty string');
  }

  const loadKg = Number(input.load_kg);
  if (!Number.isFinite(loadKg) || loadKg <= 0) {
    throw new Error(`ERR_INVALID_LOAD: load_kg must be > 0. Received: ${input.load_kg}`);
  }

  const reps = Number(input.completed_reps);
  if (!Number.isFinite(reps) || reps <= 0) {
    throw new Error(`ERR_INVALID_REPS: completed_reps must be > 0. Received: ${input.completed_reps}`);
  }

  const rpe = Number(input.rpe) || 8.0;
  const clampedRpe = Math.min(10, Math.max(6.5, Math.round(rpe * 2) / 2));
  const rir = typeof input.rir === 'number' ? input.rir : Math.max(0, 10 - clampedRpe);

  // Compute or validate e1rm
  let computedE1rm = typeof input.e1rm === 'number' && input.e1rm > 0 ? input.e1rm : 0;
  if (!computedE1rm) {
    try {
      const cappedReps = Math.min(10, Math.max(1, Math.round(reps)));
      computedE1rm = computeEstimated1Rm(loadKg, cappedReps, clampedRpe);
    } catch {
      // Fallback Brzycki approximation if out of Tuchscherer matrix
      computedE1rm = Math.round(loadKg * (36 / (37 - Math.min(12, reps))) * 10) / 10;
    }
  }

  const previousBestE1rm = getBestHistoricalE1rm(storage, exName);
  const isNewPr = computedE1rm > previousBestE1rm;
  const newBestE1rm = isNewPr ? computedE1rm : previousBestE1rm;
  const gainKg = isNewPr && previousBestE1rm > 0 ? Math.round((computedE1rm - previousBestE1rm) * 10) / 10 : 0;
  const gainPct = isNewPr && previousBestE1rm > 0 ? Math.round(((computedE1rm - previousBestE1rm) / previousBestE1rm) * 1000) / 10 : 0;

  const timestamp = input.timestamp || new Date().toISOString();
  const id = `set_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const record = {
    id,
    timestamp,
    exercise_name: exName,
    set_number: input.set_number ?? 1,
    load_kg: loadKg,
    completed_reps: reps,
    prescribed_reps: input.prescribed_reps ?? reps,
    rpe: clampedRpe,
    rir,
    e1rm: computedE1rm,
    notes: input.notes || (isNewPr ? '¡Nuevo Récord Personal!' : ''),
    is_pr: isNewPr,
  };

  const all = getAllHistoryRecords(storage);
  const updated = [record, ...all].slice(0, MAX_HISTORY_RECORDS);

  try {
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[ATP_PR_HISTORY] Quota exceeded or storage failure:', err);
  }

  return {
    record,
    isNewPr,
    previousBestE1rm,
    newBestE1rm,
    gainKg,
    gainPct,
  };
}

/**
 * Generates progression curve points for SVG / UI rendering.
 * Aggregates or sequences entries chronologically to plot neuromuscular supercompensation.
 *
 * @param {Storage|Object} storage
 * @param {string} exerciseName
 * @returns {Array<Object>} points with running best and progression delta
 */
export function getE1rmProgressionCurve(storage, exerciseName) {
  const history = getExerciseHistory(storage, exerciseName);
  if (!history.length) return [];

  let runningBest = 0;
  return history.map((item, idx) => {
    const isPr = (item.e1rm || 0) > runningBest;
    if (isPr) runningBest = item.e1rm;

    const dateObj = new Date(item.timestamp);
    const dateFormatted = isNaN(dateObj.getTime())
      ? `S${idx + 1}`
      : `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

    return {
      id: item.id || `pt_${idx}`,
      timestamp: item.timestamp,
      dateFormatted,
      e1rm: item.e1rm,
      load_kg: item.load_kg,
      reps: item.completed_reps,
      rpe: item.rpe,
      isPr,
      runningBest,
    };
  });
}

/**
 * Calculates high-level neuromuscular supercompensation trend status.
 *
 * @param {Storage|Object} storage
 * @param {string} exerciseName
 * @returns {Object}
 */
export function calculateSupercompensationTrend(storage, exerciseName) {
  const history = getExerciseHistory(storage, exerciseName);
  if (!history.length) {
    return {
      totalSets: 0,
      baselineE1rm: 0,
      currentBestE1rm: 0,
      recentE1rm: 0,
      netProgressionKg: 0,
      netProgressionPct: 0,
      status: 'INSUFFICIENT_DATA',
      statusLabel: 'Sin registros aún',
      statusColor: 'text-zinc-500',
    };
  }

  const baselineE1rm = history[0].e1rm || history[0].load_kg || 0;
  const currentBestE1rm = history.reduce((max, h) => Math.max(max, h.e1rm || 0), 0);
  const recentE1rm = history[history.length - 1].e1rm || 0;

  const netProgressionKg = Math.round((currentBestE1rm - baselineE1rm) * 10) / 10;
  const netProgressionPct = baselineE1rm > 0 ? Math.round(((currentBestE1rm - baselineE1rm) / baselineE1rm) * 1000) / 10 : 0;

  // Check last 3 sets for peak or recent PR
  const recentSlice = history.slice(-3);
  const hasRecentPr = recentSlice.some((h) => h.e1rm === currentBestE1rm);

  let status = 'CONSOLIDATING';
  let statusLabel = 'Fuerza Consolidada';
  let statusColor = 'text-cyan-400';

  if (history.length === 1) {
    status = 'BASELINE_ESTABLISHED';
    statusLabel = 'Línea Base Calibrada';
    statusColor = 'text-amber-400';
  } else if (hasRecentPr) {
    status = 'SUPERCOMPENSATION_PEAK';
    statusLabel = 'Supercompensación Activa (PR)';
    statusColor = 'text-emerald-400';
  } else if (recentE1rm >= baselineE1rm) {
    status = 'PROGRESSION_POSITIVE';
    statusLabel = 'Progresión Ascendente';
    statusColor = 'text-emerald-300';
  } else if (currentBestE1rm - recentE1rm > currentBestE1rm * 0.08) {
    status = 'FATIGUE_OVERREACHING';
    statusLabel = 'Sobretensión / Fatiga Neural';
    statusColor = 'text-red-400';
  }

  return {
    totalSets: history.length,
    baselineE1rm,
    currentBestE1rm,
    recentE1rm,
    netProgressionKg,
    netProgressionPct,
    status,
    statusLabel,
    statusColor,
  };
}
