import { AppState, ExerciseProgress } from '../domain/types';
import { ELITE_SCHEDULE } from '../domain/schedule-data';
import { DEFAULT_ROUNDING_KG, DEFAULT_TRAINING_MAX_PERCENT } from '../domain/strength-engine';

export function createInitialAppState(): AppState {
  const exerciseStates: AppState['exerciseStates'] = {};
  const completedPrepPhases: Record<string, number[]> = {};
  const progress: Record<string, ExerciseProgress> = {};

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
      if (!progress[ex.id]) {
        progress[ex.id] = {
          exerciseId: ex.id,
          trainingMaxPercent: DEFAULT_TRAINING_MAX_PERCENT,
          roundingKg: DEFAULT_ROUNDING_KG,
          records: [],
          updatedAt: Date.now()
        };
      }
      completedPrepPhases[ex.id] = [];
    }
  }

  return {
    version: 3,
    activeDayId: 'lunes',
    activeExerciseId: 'sentadilla-trasera',
    exerciseStates,
    completedPrepPhases,
    progress,
    userBodyweightKg: 75,
    activeAtpTimer: null
  };
}
