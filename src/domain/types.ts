export type DayId = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface PreparationPhaseStep {
  phase: number; // 0, 1, 2, 3, 4, 5
  name: string;
  repsText: string;
  restSeconds: number;
  description: string;
  isCompleted: boolean;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  targetSets: number;
  targetRepsText: string;
  defaultRestSeconds: number; // Rest duration in seconds (e.g. 5m = 300s)
  isMainCompound: boolean;
  intensityNote: string;
}

export interface WorkoutDayDefinition {
  id: DayId;
  code: string; // 'Día A', 'Día B', etc.
  title: string;
  subtitle: string;
  isRestDay: boolean;
  restMessage?: string;
  exercises: ExerciseDefinition[];
}

export interface SetExecutionLog {
  id: string;
  exerciseId: string;
  dayId: DayId;
  setIndex: number;
  targetRepsText: string;
  timestamp: number;
}

export interface ExerciseProgressState {
  exerciseId: string;
  completedSetsCount: number;
  history: SetExecutionLog[];
  lastUpdated: number;
}

export interface AppState {
  activeDayId: DayId;
  activeExerciseId: string | null;
  exerciseStates: Record<string, ExerciseProgressState>;
  completedPrepPhases: Record<string, number[]>; // exerciseId -> completed phase numbers (0-4)
  activeAtpTimer: {
    exerciseId: string;
    exerciseName: string;
    durationSeconds: number;
    remainingSeconds: number;
    isRunning: boolean;
    startedAt: number;
  } | null;
}
