import { AppState } from '../domain/types';
import { createInitialAppState } from './default-state';

const STORAGE_KEY = 'NEURO_STRENGTH_APP_STATE_V2';

export class StorageRepository {
  public static loadState(): AppState {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        return createInitialAppState();
      }
      const parsed = JSON.parse(serialized) as AppState;
      const initial = createInitialAppState();
      return {
        ...initial,
        ...parsed,
        exerciseStates: {
          ...initial.exerciseStates,
          ...parsed.exerciseStates
        },
        completedPrepPhases: {
          ...initial.completedPrepPhases,
          ...parsed.completedPrepPhases
        }
      };
    } catch (e) {
      console.warn('Error al cargar estado desde localStorage:', e);
      return createInitialAppState();
    }
  }

  public static saveState(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
      const data = JSON.parse(jsonStr) as AppState;
      if (data && data.exerciseStates) {
        this.saveState(data);
        return data;
      }
    } catch (e) {
      console.error('Error al importar JSON:', e);
    }
    return null;
  }
}
