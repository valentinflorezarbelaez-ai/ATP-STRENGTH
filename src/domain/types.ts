export type DayId = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface LoadPrescription {
  phase: number;
  percentageOfTrainingMax: number;
  targetWeightKg: number;
  rawWeightKg: number;
  isBodyweight: boolean;
}

export interface PreparationPhaseStep {
  phase: number; // 0, 1, 2, 3, 4, 5
  name: string;
  repsText: string;
  restSeconds: number;
  description: string;
  isCompleted: boolean;
  loadPrescription?: LoadPrescription;
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

export interface StrengthRecord {
  id: string;
  exerciseId: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  weightKg: number;
  reps: number;
  estimatedOneRepMaxKg: number;
  source: 'direct' | 'epley' | 'brzycki';
  isBodyweight?: boolean;
  userBodyweightKg?: number;
  notes?: string;
}

export interface ExerciseProgress {
  exerciseId: string;
  trainingMaxPercent: number; // 0.90 default
  roundingKg: number;          // 1.25, 2.5, 5... default 2.5
  currentOneRepMaxKg?: number;
  customPhasePercentages?: Record<number, number>;
  records: StrengthRecord[];
  updatedAt: number;
}

export interface SetExecutionLog {
  id: string;
  exerciseId: string;
  dayId: DayId;
  setIndex: number;
  targetRepsText: string;
  targetWeightKg?: number;
  actualWeightKg?: number;
  actualReps?: number;
  rpe?: number; // 1-10 optional Borg/RIR RPE scale
  timestamp: number;
  notes?: string;
}

export interface ExerciseProgressState {
  exerciseId: string;
  completedSetsCount: number;
  history: SetExecutionLog[];
  lastUpdated: number;
}

export interface AppState {
  version: number; // 3
  activeDayId: DayId;
  activeExerciseId: string | null;
  exerciseStates: Record<string, ExerciseProgressState>;
  completedPrepPhases: Record<string, number[]>; // exerciseId -> completed phase numbers (0-4)
  progress: Record<string, ExerciseProgress>; // exerciseId -> ExerciseProgress
  userBodyweightKg?: number; // default 75
  activeAtpTimer: {
    exerciseId: string;
    exerciseName: string;
    durationSeconds: number;
    remainingSeconds: number;
    isRunning: boolean;
    startedAt: number;
  } | null;
}
