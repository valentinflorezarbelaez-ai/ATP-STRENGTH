import { AppState, ExerciseProgress } from '../domain/types';
import { createInitialAppState } from './default-state';

export const STORAGE_KEY_V3 = 'NEURO_STRENGTH_APP_STATE_V3';
export const STORAGE_KEY_V2 = 'NEURO_STRENGTH_APP_STATE_V2';

export class StorageRepository {
  /**
   * Loads state from localStorage with seamless V2 -> V3 migration.
   */
  public static loadState(): AppState {
    try {
      if (typeof localStorage === 'undefined') {
        return createInitialAppState();
      }

      // 1. Try loading V3 state
      const serializedV3 = localStorage.getItem(STORAGE_KEY_V3);
      if (serializedV3) {
        const parsed = JSON.parse(serializedV3) as Partial<AppState>;
        return this.normalizeState(parsed);
      }

      // 2. Fallback: Check and migrate legacy V2 state
      const serializedV2 = localStorage.getItem(STORAGE_KEY_V2);
      if (serializedV2) {
        const parsedV2 = JSON.parse(serializedV2) as Partial<AppState>;
        const migrated = this.normalizeState(parsedV2);
        this.saveState(migrated);
        return migrated;
      }

      // 3. Fresh installation
      return createInitialAppState();
    } catch (e) {
      console.warn('Error al cargar estado desde localStorage:', e);
      return createInitialAppState();
    }
  }

  /**
   * Normalizes any partial or legacy state object into a complete, valid V3 AppState.
   */
  public static normalizeState(partial: Partial<AppState>): AppState {
    const initial = createInitialAppState();
    const exerciseStates = {
      ...initial.exerciseStates,
      ...(partial.exerciseStates || {})
    };
    const completedPrepPhases = {
      ...initial.completedPrepPhases,
      ...(partial.completedPrepPhases || {})
    };

    // Migrate or merge progress dictionary
    const progress: Record<string, ExerciseProgress> = {
      ...initial.progress
    };

    if (partial.progress) {
      for (const [exId, prog] of Object.entries(partial.progress)) {
        progress[exId] = {
          ...(initial.progress[exId] || {
            exerciseId: exId,
            trainingMaxPercent: 0.90,
            roundingKg: 2.5,
            records: [],
            updatedAt: Date.now()
          }),
          ...prog,
          records: prog.records || []
        };
      }
    }

    return {
      version: 3,
      activeDayId: partial.activeDayId || initial.activeDayId,
      activeExerciseId: partial.activeExerciseId !== undefined ? partial.activeExerciseId : initial.activeExerciseId,
      exerciseStates,
      completedPrepPhases,
      progress,
      userBodyweightKg: partial.userBodyweightKg ?? initial.userBodyweightKg ?? 75,
      activeAtpTimer: partial.activeAtpTimer || null
    };
  }

  public static saveState(state: AppState): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(state));
      }
    } catch (e) {
      console.error('Error al persistir estado:', e);
    }
  }

  public static resetState(): AppState {
    const fresh = createInitialAppState();
    this.saveState(fresh);
    return fresh;
  }

  public static exportJSON(state: AppState): string {
    return JSON.stringify(state, null, 2);
  }

  public static importJSON(jsonStr: string): AppState | null {
    try {
      const data = JSON.parse(jsonStr) as Partial<AppState>;
      if (data && (data.exerciseStates || data.progress || data.activeDayId)) {
        const normalized = this.normalizeState(data);
        this.saveState(normalized);
        return normalized;
      }
    } catch (e) {
      console.error('Error al importar JSON:', e);
    }
    return null;
  }
}
