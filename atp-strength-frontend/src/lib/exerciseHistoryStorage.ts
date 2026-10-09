/**
 * Exercise History & Continuity Storage (SSOT)
 * Preserves athlete exercise history, progressive overload continuity,
 * and allows instant resumption of past workouts on ATP-STRENGTH.
 */

export interface CompletedSetRecord {
  setNumber: number;
  weight: number;
  reps: number | string;
  phase: string;
  timestamp: string;
}

export interface ExerciseHistoryEntry {
  exerciseName: string;
  oneRepMax: number;
  lastTrainedAt: string;
  totalSetsCompleted: number;
  lastSessionSets: CompletedSetRecord[];
  suggestedNextWeight?: number;
  programDayKey?: string;
  category?: string;
}

const HISTORY_STORAGE_KEY = "atp_exercise_history_v1";
const MAXES_STORAGE_KEY = "neuro_strength_maxes";

export function getExerciseHistory(): ExerciseHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const historyMap: Record<string, ExerciseHistoryEntry> = raw ? JSON.parse(raw) : {};

    // Also blend with saved maxes to ensure continuity even for exercises recorded prior
    const rawMaxes = localStorage.getItem(MAXES_STORAGE_KEY);
    if (rawMaxes) {
      const maxesMap = JSON.parse(rawMaxes);
      for (const [name, data] of Object.entries(maxesMap)) {
        if (typeof data === "object" && data !== null) {
          const typedData = data as { one_rep_max?: number; training_max?: number; exercise_name?: string };
          const pr = typedData.one_rep_max || typedData.training_max || 0;
          if (pr > 0 && !historyMap[name]) {
            historyMap[name] = {
              exerciseName: typedData.exercise_name || name,
              oneRepMax: pr,
              lastTrainedAt: new Date().toISOString(),
              totalSetsCompleted: 0,
              lastSessionSets: [],
              suggestedNextWeight: Math.round((pr * 0.9 + 2.5) * 10) / 10,
            };
          }
        }
      }
    }

    return Object.values(historyMap).sort(
      (a, b) => new Date(b.lastTrainedAt).getTime() - new Date(a.lastTrainedAt).getTime()
    );
  } catch (err) {
    console.error("Error reading exercise history:", err);
    return [];
  }
}

export function recordSetToHistory(params: {
  exerciseName: string;
  oneRepMax: number;
  setNumber: number;
  weight: number;
  reps: number | string;
  phase: string;
  programDayKey?: string;
}): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const historyMap: Record<string, ExerciseHistoryEntry> = raw ? JSON.parse(raw) : {};

    const key = params.exerciseName.trim();
    const existing = historyMap[key];
    const now = new Date().toISOString();

    const newSetRecord: CompletedSetRecord = {
      setNumber: params.setNumber,
      weight: params.weight,
      reps: params.reps,
      phase: params.phase,
      timestamp: now,
    };

    const updatedSets = existing ? [...existing.lastSessionSets, newSetRecord] : [newSetRecord];

    // Progressive overload recommendation: +2.5kg for upper, +5kg for lower when work sets completed
    const isLower = /sentadilla|peso muerto|squat|deadlift/i.test(key);
    const increment = isLower ? 5 : 2.5;
    const suggested = Math.round((params.oneRepMax + increment) * 10) / 10;

    historyMap[key] = {
      exerciseName: key,
      oneRepMax: Math.max(existing?.oneRepMax || 0, params.oneRepMax),
      lastTrainedAt: now,
      totalSetsCompleted: (existing?.totalSetsCompleted || 0) + 1,
      lastSessionSets: updatedSets,
      suggestedNextWeight: suggested,
      programDayKey: params.programDayKey || existing?.programDayKey,
    };

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyMap));
  } catch (err) {
    console.error("Error recording set to history:", err);
  }
}

export function getExerciseContinuity(exerciseName: string): ExerciseHistoryEntry | null {
  const history = getExerciseHistory();
  const found = history.find(
    (entry) => entry.exerciseName.toLowerCase().trim() === exerciseName.toLowerCase().trim()
  );
  return found || null;
}
