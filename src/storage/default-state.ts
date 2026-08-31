import { AppState } from '../domain/types';
import { ELITE_SCHEDULE } from '../domain/schedule-data';

export function createInitialAppState(): AppState {
  const exerciseStates: AppState['exerciseStates'] = {};
  const completedPrepPhases: Record<string, number[]> = {};

  for (const day of ELITE_SCHEDULE) {
    for (const ex of day.exercises) {
      if (!exerciseStates[ex.id]) {
        exerciseStates[ex.id] = {
          exerciseId: ex.id,
          completedSetsCount: 0,
          history: [],
          lastUpdated: Date.now()
        };
      }
      completedPrepPhases[ex.id] = [];
    }
  }

  return {
    activeDayId: 'lunes',
    activeExerciseId: 'sentadilla-trasera',
    exerciseStates,
    completedPrepPhases,
    activeAtpTimer: null
  };
}
