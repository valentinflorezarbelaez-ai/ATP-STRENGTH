/**
 * Biomechanical Muscle Recovery & Optimal Lockout Facade (SPEC-0010)
 * Integrates pure L0 recovery domain logic with browser localStorage persistence.
 */

import {
  RECOVERY_PROFILES as CORE_RECOVERY_PROFILES,
  EXERCISE_RECOVERY_HOURS as CORE_EXERCISE_RECOVERY_HOURS,
  getOptimalRecoveryHours as coreGetOptimalRecoveryHours,
  getExerciseRecoveryStatus as coreGetExerciseRecoveryStatus,
  formatRecoverySpokenNotice as coreFormatRecoverySpokenNotice,
} from "./recoveryLockoutCore.mjs";

export const RECOVERY_PROFILES = CORE_RECOVERY_PROFILES;
export const EXERCISE_RECOVERY_HOURS = CORE_EXERCISE_RECOVERY_HOURS;

export interface ExerciseRecoveryStatus {
  isLocked: boolean;
  recoveryHoursTotal: number;
  elapsedHours: number;
  remainingHours: number;
  remainingMinutes: number;
  remainingFormatted: string;
  recoveryPercent: number;
  scientificRationale: string;
  suggestedAlternativeMuscles: string[];
}

const RECOVERY_STORAGE_KEY = "atp_exercise_recovery_v1";

/**
 * Returns map of exercise completion timestamps { [exerciseName]: timestampMs }
 */
export function getExerciseRecoveryLedger(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(RECOVERY_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Records that an exercise session was completed now, initiating the 48h/72h recovery timer.
 */
export function recordExerciseSessionCompletion(exerciseName: string, timestampMs = Date.now()): void {
  if (typeof window === "undefined" || !exerciseName) return;
  try {
    const ledger = getExerciseRecoveryLedger();
    ledger[exerciseName] = timestampMs;
    localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(ledger));
  } catch (err) {
    console.warn("Failed to record exercise recovery timestamp:", err);
  }
}

/**
 * Checks whether an exercise is currently locked due to ongoing muscle/CNS recovery.
 */
export function checkExerciseRecovery(exerciseName: string, nowMs = Date.now()): ExerciseRecoveryStatus {
  const ledger = getExerciseRecoveryLedger();
  const lastCompleted = ledger[exerciseName] || 0;
  return coreGetExerciseRecoveryStatus(exerciseName, lastCompleted, nowMs);
}

/**
 * Allows the athlete to manually override or reset the recovery lockout (safety bypass).
 */
export function bypassExerciseRecoveryLockout(exerciseName: string): void {
  if (typeof window === "undefined" || !exerciseName) return;
  try {
    const ledger = getExerciseRecoveryLedger();
    delete ledger[exerciseName];
    localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(ledger));
  } catch (err) {
    console.warn("Failed to bypass recovery lockout:", err);
  }
}

export function getOptimalRecoveryHours(exerciseName: string): number {
  return coreGetOptimalRecoveryHours(exerciseName);
}

export function formatRecoverySpokenNotice(exerciseName: string, remainingHours: number, remainingMinutes: number): string {
  return coreFormatRecoverySpokenNotice(exerciseName, remainingHours, remainingMinutes);
}
