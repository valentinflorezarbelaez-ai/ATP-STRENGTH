import { ALL_TRACKABLE_EXERCISES, type ExerciseMaxData } from "@/lib/workoutStrategies";

const MAXES_KEY = "neuro_strength_maxes";

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function sameName(a: string, b: string): boolean {
  return normalizeName(a).toLocaleLowerCase("es") === normalizeName(b).toLocaleLowerCase("es");
}

export function readDeviceMaxes(): Record<string, ExerciseMaxData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MAXES_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, ExerciseMaxData>;
  } catch {
    return {};
  }
}

export function resolveExerciseKey(name: string, extraKeys: readonly string[] = []): string {
  const trimmed = normalizeName(name);
  if (!trimmed) return "";
  const catalog = ALL_TRACKABLE_EXERCISES.find((entry) => sameName(entry, trimmed));
  if (catalog) return catalog;
  const extra = extraKeys.find((entry) => sameName(entry, trimmed));
  if (extra) return extra;
  return trimmed;
}

export function findSavedPr(name: string): { key: string; pr: number } | null {
  const trimmed = normalizeName(name);
  if (!trimmed) return null;
  const saved = readDeviceMaxes();
  const key = resolveExerciseKey(trimmed, Object.keys(saved));
  const pr = saved[key]?.one_rep_max;
  if (typeof pr !== "number" || !(pr > 0)) return null;
  return { key, pr };
}
