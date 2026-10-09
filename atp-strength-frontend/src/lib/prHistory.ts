/**
 * TypeScript adapter for SPEC-0009 PR Historical Persistence & Progression.
 * Provides typed access to local storage in browser environments.
 */

import {
  HISTORY_STORAGE_KEY,
  MAX_HISTORY_RECORDS,
  getAllHistoryRecords,
  getExerciseHistory,
  getBestHistoricalE1rm,
  recordSetHistory,
  getE1rmProgressionCurve,
  calculateSupercompensationTrend,
} from './prHistoryCore.mjs';

export interface HistoryRecord {
  id: string;
  timestamp: string;
  exercise_name: string;
  set_number: number;
  load_kg: number;
  completed_reps: number;
  prescribed_reps?: number;
  rpe: number;
  rir: number;
  e1rm: number;
  notes?: string;
  is_pr?: boolean;
}

export interface PrRecordResult {
  record: HistoryRecord;
  isNewPr: boolean;
  previousBestE1rm: number;
  newBestE1rm: number;
  gainKg: number;
  gainPct: number;
}

export interface ProgressionCurvePoint {
  id: string;
  timestamp: string;
  dateFormatted: string;
  e1rm: number;
  load_kg: number;
  reps: number;
  rpe?: number;
  isPr: boolean;
  runningBest: number;
}

export interface SupercompensationTrend {
  totalSets: number;
  baselineE1rm: number;
  currentBestE1rm: number;
  recentE1rm: number;
  netProgressionKg: number;
  netProgressionPct: number;
  status: string;
  statusLabel: string;
  statusColor: string;
}

function browserStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function getLocalExerciseHistory(exerciseName: string, athleteId?: string): HistoryRecord[] {
  const storage = browserStorage();
  if (!storage) return [];
  return getExerciseHistory(storage, exerciseName, athleteId) as HistoryRecord[];
}

export function getLocalBestE1rm(exerciseName: string, athleteId?: string): number {
  const storage = browserStorage();
  if (!storage) return 0;
  return getBestHistoricalE1rm(storage, exerciseName, athleteId);
}

export function logLocalSetHistory(input: {
  exercise_name: string;
  load_kg: number;
  completed_reps: number;
  prescribed_reps?: number;
  set_number?: number;
  rpe?: number;
  rir?: number;
  e1rm?: number;
  notes?: string;
  timestamp?: string;
}, athleteId?: string): PrRecordResult | null {
  const storage = browserStorage();
  if (!storage) return null;
  return recordSetHistory(storage, input, athleteId) as PrRecordResult;
}

function _disabledOldLogLocalSetHistory(input: {
  exercise_name: string;
  load_kg: number;
  completed_reps: number;
  prescribed_reps?: number;
  set_number?: number;
  rpe?: number;
  rir?: number;
  e1rm?: number;
  notes?: string;
  timestamp?: string;
}): PrRecordResult | null {
  const storage = browserStorage();
  if (!storage) return null;
  return recordSetHistory(storage, input) as PrRecordResult;
}

export function getLocalProgressionCurve(exerciseName: string, athleteId?: string): ProgressionCurvePoint[] {
  const storage = browserStorage();
  if (!storage) return [];
  return getE1rmProgressionCurve(storage, exerciseName, athleteId) as ProgressionCurvePoint[];
}

export function getLocalSupercompensationTrend(exerciseName: string, athleteId?: string): SupercompensationTrend {
  const storage = browserStorage();
  if (!storage) {
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
  return calculateSupercompensationTrend(storage, exerciseName, athleteId) as SupercompensationTrend;
}

export {
  HISTORY_STORAGE_KEY,
  MAX_HISTORY_RECORDS,
  getAllHistoryRecords,
  getExerciseHistory,
  getBestHistoricalE1rm,
  recordSetHistory,
  getE1rmProgressionCurve,
  calculateSupercompensationTrend,
};
