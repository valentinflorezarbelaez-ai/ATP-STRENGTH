/**
 * Workout domain strategies — pure functions and lookup tables.
 * Extracted from page.tsx (First-Principles / Boris Cherny post-green decomposition).
 */

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  cue: string;
}

export interface RoutineDay {
  key: string;
  name: string;
  focus: string;
  isRest: boolean;
  restMessage?: string;
  exercises: Exercise[];
}

export interface PhasePrescriptions {
  phase_1_activation: number;
  phase_2_light: number;
  phase_3_medium: number;
  phase_4_pap: number;
  phase_5_work: number;
}

export interface ExerciseMaxData {
  id: number;
  exercise_name: string;
  one_rep_max: number;
  training_max: number;
  formula: string;
  lifted_weight: number;
  reps_performed: number;
  notes?: string;
  prescriptions: PhasePrescriptions;
}

export interface HistoryItem {
  id: number;
  exercise_name: string;
  set_number: number;
  prescribed_reps: number;
  completed_reps?: number;
  load_kg: number;
  rest_seconds: number;
  notes?: string;
  completed: boolean;
}

export interface SavedSessionProgress {
  completedSetsMap?: { [exerciseName: string]: number[] };
  completedWarmupMap?: { [exerciseName: string]: string[] };
  selectedDayKey?: string;
  activeExerciseIndex?: number;
  currentSet?: number;
  activePhaseStep?: string;
}

import {
  TUCHSCHERER_RPE_MATRIX,
  VALID_RPE_VALUES,
  getPercentage1Rm,
  computeEstimated1Rm,
  calculateTargetLoad,
  computeAutoregulatedAdjustment,
  rpeToRir,
  rirToRpe,
} from './rpeEngine.mjs';

export {
  TUCHSCHERER_RPE_MATRIX,
  VALID_RPE_VALUES,
  getPercentage1Rm,
  computeEstimated1Rm,
  calculateTargetLoad,
  computeAutoregulatedAdjustment,
  rpeToRir,
  rirToRpe,
};

export type ImplementCategory = "olympic_bar" | "ez_bar" | "bodyweight_weighted" | "dumbbells";
export type OneRmFormula = "epley" | "brzycki" | "direct" | "rpe";
export type WarmupPhaseKey = "F1" | "F2" | "F3" | "F4";
export type PhaseStep = WarmupPhaseKey | `${number}`;

export const SCHEDULE_DAYS: RoutineDay[] = [
  {
    key: "DAY_A",
    name: "Lunes - Día A",
    focus: "Empuje & Dominancia Cuádriceps",
    isRest: false,
    exercises: [
      { name: "Sentadilla Trasera", sets: 5, reps: "3 reps", restSeconds: 240, cue: "Apoyo trípode, empuje contra el suelo con cadencia explosiva concéntrica." },
      { name: "Press de Banca", sets: 5, reps: "3 reps", restSeconds: 240, cue: "Retracción escapular máxima, arco lumbar biomecánico estable." },
      { name: "Press Militar", sets: 4, reps: "3 reps", restSeconds: 180, cue: "Bloqueo glúteo y core activo, trayectoria vertical limpia." },
      { name: "Fondos en Paralelas", sets: 3, reps: "5 reps", restSeconds: 180, cue: "Codos en 45°, torso con ligera inclinación hacia adelante." },
    ],
  },
  {
    key: "DAY_B",
    name: "Martes - Día B",
    focus: "Tracción & Cadena Posterior",
    isRest: false,
    exercises: [
      { name: "Peso Muerto Convencional", sets: 2, reps: "3 reps", restSeconds: 300, cue: "Tensión de dorsales, tracción de la barra pegada a las tibias." },
      { name: "Dominadas Lastradas", sets: 4, reps: "4 reps", restSeconds: 180, cue: "Rango articular completo, depresión escapular antes de traccionar." },
      { name: "Remo Pendlay", sets: 3, reps: "5 reps", restSeconds: 180, cue: "Torso paralelo al suelo, inicio inerte desde cada repetición." },
      { name: "Peso Muerto Rumano", sets: 3, reps: "5 reps", restSeconds: 180, cue: "Bisagra de cadera profunda, estiramiento isquiosural controlado." },
      { name: "Paseo del Granjero Pesado", sets: 3, reps: "40 metros", restSeconds: 180, cue: "Fuerza de agarre crushing, columna vertebral en extensión neutra." },
    ],
  },
  {
    key: "DAY_REST_WED",
    name: "Miércoles",
    focus: "Descanso Absoluto",
    isRest: true,
    restMessage: "Supercompensación Central Obligatoria: Regeneración del Sistema Nervioso Central (SNC) y resíntesis glucogénica sin carga.",
    exercises: [],
  },
  {
    key: "DAY_C",
    name: "Jueves - Día C",
    focus: "Empuje Supremo & Densidad",
    isRest: false,
    exercises: [
      { name: "Press de Banca", sets: 6, reps: "2 reps", restSeconds: 240, cue: "Potencia elástica y aceleración máxima en fase de ascenso." },
      { name: "Press Militar", sets: 4, reps: "3 reps", restSeconds: 180, cue: "Control excéntrico de 2s, pausa clavicular mínima." },
      { name: "Fondos en Paralelas", sets: 3, reps: "5 reps", restSeconds: 180, cue: "Lastre progresivo preservando rango articular sin dolor acromial." },
      { name: "Planchas Isométricas Pesadas", sets: 4, reps: "30 seg", restSeconds: 120, cue: "Retroversión pélvica, co-contracción máxima abdominal con lastre." },
    ],
  },
  {
    key: "DAY_D",
    name: "Viernes - Día D",
    focus: "Tracción Técnica & Brazos",
    isRest: false,
    exercises: [
      { name: "Sentadilla Trasera Técnica", sets: 3, reps: "3 reps", restSeconds: 180, cue: "Velocidad de ejecución perfecta a 75% 1RM con pausa en paralelo." },
      { name: "Dominadas Lastradas", sets: 4, reps: "4 reps", restSeconds: 180, cue: "Pectoral tocando la barra, descenso de 3 segundos." },
      { name: "Remo Pendlay", sets: 3, reps: "5 reps", restSeconds: 180, cue: "Potencia neuromuscular de la espalda media sin impulso lumbar." },
      { name: "Curl Bíceps Barra Z", sets: 4, reps: "5 reps", restSeconds: 120, cue: "Codos anclados a la caja torácica, supinación sostenida." },
      { name: "Elevaciones Piernas a la Barra", sets: 3, reps: "8 reps", restSeconds: 120, cue: "Flexión espinal activa, sin balanceo de inercia." },
    ],
  },
  {
    key: "DAY_REST_WEEKEND",
    name: "Sábado y Domingo",
    focus: "Descanso Absoluto",
    isRest: true,
    restMessage: "Ventana Anabólica de Recuperación Sistémica: Cero estímulo de carga. Optimización del sueño profundo y resíntesis biológica total.",
    exercises: [],
  },
];

export const ALL_TRACKABLE_EXERCISES = [
  "Sentadilla Trasera",
  "Press de Banca",
  "Press Militar",
  "Fondos en Paralelas",
  "Peso Muerto Convencional",
  "Dominadas Lastradas",
  "Remo Pendlay",
  "Peso Muerto Rumano",
  "Paseo del Granjero Pesado",
  "Sentadilla Trasera Técnica",
  "Curl Bíceps Barra Z",
] as const;

const DEFAULT_BASE_MAXES: { [key: string]: { weight: number; reps: number } } = {
  "Sentadilla Trasera": { weight: 100, reps: 5 },
  "Press de Banca": { weight: 80, reps: 5 },
  "Press Militar": { weight: 50, reps: 5 },
  "Fondos en Paralelas": { weight: 80, reps: 5 },
  "Peso Muerto Convencional": { weight: 130, reps: 3 },
  "Dominadas Lastradas": { weight: 80, reps: 5 },
  "Remo Pendlay": { weight: 70, reps: 5 },
  "Peso Muerto Rumano": { weight: 90, reps: 5 },
  "Paseo del Granjero Pesado": { weight: 60, reps: 5 },
  "Sentadilla Trasera Técnica": { weight: 90, reps: 3 },
  "Curl Bíceps Barra Z": { weight: 35, reps: 5 },
  "Elevaciones Piernas a la Barra": { weight: 0, reps: 8 },
};

/** Category lookup — strategy table over cascading if/includes. */
const CATEGORY_RULES: Array<{ test: (n: string) => boolean; cat: ImplementCategory }> = [
  { test: (n) => /Dominadas|Fondos|Planchas|Elevaciones/.test(n), cat: "bodyweight_weighted" },
  { test: (n) => /Barra Z|Curl/.test(n), cat: "ez_bar" },
  { test: (n) => /Paseo del Granjero/.test(n), cat: "dumbbells" },
];

export function getExerciseCategory(exerciseName: string): ImplementCategory {
  for (const rule of CATEGORY_RULES) {
    if (rule.test(exerciseName)) return rule.cat;
  }
  return "olympic_bar";
}

const round25 = (val: number) => Math.max(0, Math.round(val / 2.5) * 2.5);

const RAMP_STRATEGIES: Record<
  ImplementCategory,
  (tm: number) => { f1: number; f2: number; f3: number; f4: number; f5: number }
> = {
  bodyweight_weighted: (tm) => ({
    f1: 0,
    f2: round25(tm * 0.25),
    f3: round25(tm * 0.5),
    f4: round25(tm * 0.75),
    f5: round25(tm * 0.85),
  }),
  ez_bar: (tm) => {
    const minBar = 10;
    const f5 = Math.max(minBar, round25(tm * 0.85));
    const f4 = Math.max(minBar, round25(tm * 0.75));
    const f3 = Math.max(minBar, round25(tm * 0.55));
    const f2 = Math.max(minBar, round25(tm * 0.35));
    const f1 = minBar;
    return {
      f1,
      f2: Math.max(f1, f2),
      f3: Math.max(Math.max(f1, f2) + 2.5, f3),
      f4: Math.max(Math.max(f2, f3) + 2.5, f4),
      f5,
    };
  },
  dumbbells: (tm) => ({
    f1: round25(tm * 0.25),
    f2: round25(tm * 0.4),
    f3: round25(tm * 0.55),
    f4: round25(tm * 0.75),
    f5: round25(tm * 0.85),
  }),
  olympic_bar: (tm) => {
    const barWeight = 20;
    const f5 = Math.max(barWeight, round25(tm * 0.85));
    const f1 = barWeight;
    let f2 = Math.max(f1, round25(tm * 0.4));
    let f3 = Math.max(f2 + 2.5, round25(tm * 0.6));
    let f4 = Math.max(f3 + 2.5, round25(tm * 0.8));
    if (f5 <= f4) f4 = Math.max(f3, f5 - 2.5);
    if (f4 <= f3) f3 = Math.max(f2, f4 - 2.5);
    if (f3 <= f2) f2 = Math.max(f1, f3 - 2.5);
    return { f1, f2, f3, f4, f5 };
  },
};

export function computeNeuromuscularRamp(exerciseName: string, trainingMax: number) {
  return RAMP_STRATEGIES[getExerciseCategory(exerciseName)](trainingMax);
}

const ONE_RM_FORMULAS: Record<string, (w: number, r: number) => number> = {
  brzycki: (w, r) => (r < 37 ? w * (36 / (37 - r)) : w),
  epley: (w, r) => w * (1 + r / 30),
  direct: (w) => w,
};

export function computeOneRm(
  weight: number,
  reps: number,
  formula: string = "epley",
  rpe: number = 10
): number {
  const w = Math.max(0, weight);
  const r = Math.max(1, reps);
  if (formula === "rpe") {
    const clampedReps = Math.min(10, r);
    const clampedRpe = Math.max(6.5, Math.min(10, Math.round(rpe * 2) / 2));
    return computeEstimated1Rm(w, clampedReps, clampedRpe);
  }
  if (r <= 1 || formula === "direct") return Math.round(w * 10) / 10;
  const fn = ONE_RM_FORMULAS[formula] || ONE_RM_FORMULAS.epley;
  return Math.round(fn(w, r) * 10) / 10;
}

export function computeMetrics(
  exerciseName: string,
  weight: number,
  reps: number,
  formula: string = "epley",
  notes: string = ""
): ExerciseMaxData {
  const oneRm = computeOneRm(weight, reps, formula);
  const trainingMax = Math.round(oneRm * 0.9 * 10) / 10;
  const ramp = computeNeuromuscularRamp(exerciseName, trainingMax);
  return {
    id: Date.now(),
    exercise_name: exerciseName,
    one_rep_max: oneRm,
    training_max: trainingMax,
    formula,
    lifted_weight: Math.max(0, weight),
    reps_performed: Math.max(1, reps),
    notes,
    prescriptions: {
      phase_1_activation: ramp.f1,
      phase_2_light: ramp.f2,
      phase_3_medium: ramp.f3,
      phase_4_pap: ramp.f4,
      phase_5_work: ramp.f5,
    },
  };
}

export function calculateLive1RM(weight: number, reps: number, formula: string): number {
  return computeOneRm(weight, reps, formula);
}

export function getBaselineMaxes(): { [key: string]: ExerciseMaxData } {
  const base: { [key: string]: ExerciseMaxData } = {};
  Object.entries(DEFAULT_BASE_MAXES).forEach(([name, def]) => {
    base[name] = computeMetrics(name, def.weight, def.reps);
  });
  return base;
}

export function getSavedSession(): SavedSessionProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("neuro_strength_session_progress");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function getInitialMaxes(): { [key: string]: ExerciseMaxData } {
  const base = getBaselineMaxes();
  if (typeof window === "undefined") return base;
  try {
    const saved = localStorage.getItem("neuro_strength_maxes");
    return saved ? { ...base, ...JSON.parse(saved) } : base;
  } catch {
    return base;
  }
}

export const WARMUP_REST_MAP: Record<WarmupPhaseKey, { time: number; next: PhaseStep; title: string }> = {
  F1: { time: 60, next: "F2", title: "Descanso F1 → F2" },
  F2: { time: 90, next: "F3", title: "Descanso F2 → F3" },
  F3: { time: 120, next: "F4", title: "Descanso F3 → F4 PAP" },
  F4: { time: 180, next: "1", title: "Descanso F4 → Serie 1" },
};

export function getWarmupRestConfig(phase: WarmupPhaseKey) {
  return WARMUP_REST_MAP[phase];
}

export function getAssemblyCue(cat: ImplementCategory, stepWeight: number): string {
  const cues: Record<ImplementCategory, string> = {
    olympic_bar: `Monta la barra olímpica a ${stepWeight} kg`,
    ez_bar: `Carga la Barra Z a ${stepWeight} kg`,
    bodyweight_weighted: stepWeight === 0 ? "Peso corporal (sin lastre)" : `Añade ${stepWeight} kg de lastre`,
    dumbbells: `Toma mancuernas de ${stepWeight} kg c/u`,
  };
  return cues[cat];
}

export function resolveReadyLabel(
  step: string,
  prescriptions: PhasePrescriptions | undefined,
  exerciseReps: string,
  currentSet: number
): string {
  const p = prescriptions;
  const table: Record<string, string> = {
    F2: `LISTO → PASAR A FASE 2 (${p?.phase_2_light ?? 0} kg × 5 reps)`,
    F3: `LISTO → PASAR A FASE 3 (${p?.phase_3_medium ?? 0} kg × 3 reps)`,
    F4: `LISTO → PASAR A FASE 4 PAP (${p?.phase_4_pap ?? 0} kg × 1 rep)`,
    "1": `LISTO → INICIAR SERIE 1 EFECTIVA (${p?.phase_5_work ?? 0} kg × ${exerciseReps})`,
  };
  return table[step] || `LISTO PARA LEVANTAR → SERIE ${currentSet} (${p?.phase_5_work ?? 0} kg × ${exerciseReps})`;
}

export function resolvePhaseAfterNavigation(doneSets: number, totalSets: number): { set: number; phase: string } {
  const nextSet = doneSets < totalSets ? doneSets + 1 : totalSets;
  return { set: nextSet, phase: doneSets === 0 ? "F1" : nextSet.toString() };
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export type TelemetrySyncState = "SYNCED" | "PENDING" | "OFFLINE";

export function deriveTelemetrySyncState(
  pendingWalCount: number,
  backendOnline: boolean | null
): TelemetrySyncState {
  if (backendOnline === false) return "OFFLINE";
  if (pendingWalCount > 0) return "PENDING";
  if (backendOnline === true) return "SYNCED";
  return "PENDING";
}

export interface PhaseInstruction {
  weight: number;
  reps: string;
  rest: number;
  title: string;
  subtitle: string;
  label: string;
  isWarmup: boolean;
}

export function resolvePhaseInstruction(
  step: string,
  prescriptions: PhasePrescriptions | undefined,
  exercise: Exercise,
  currentSet: number,
  isLastExercise: boolean
): PhaseInstruction {
  const p = prescriptions;
  const workKg = p?.phase_5_work ?? 0;
  const warmup: Record<string, PhaseInstruction> = {
    F1: {
      weight: p?.phase_1_activation ?? 20,
      reps: "10 reps",
      rest: 60,
      title: "F1 · Activación",
      subtitle: "Patrón motor sin fatiga",
      label: "Completar Activación F1",
      isWarmup: true,
    },
    F2: {
      weight: p?.phase_2_light ?? 0,
      reps: "5 reps",
      rest: 90,
      title: "F2 · Aproximación",
      subtitle: "Carga ligera de acercamiento",
      label: "Completar Aproximación F2",
      isWarmup: true,
    },
    F3: {
      weight: p?.phase_3_medium ?? 0,
      reps: "3 reps",
      rest: 120,
      title: "F3 · Media",
      subtitle: "Carga intermedia",
      label: "Completar Fase Media F3",
      isWarmup: true,
    },
    F4: {
      weight: p?.phase_4_pap ?? 0,
      reps: "1 rep pesada",
      rest: 180,
      title: "F4 · Potenciación PAP",
      subtitle: "1 rep pesada pre-trabajo",
      label: "Completar PAP F4",
      isWarmup: true,
    },
  };
  if (warmup[step]) return warmup[step];

  const isLastSet = currentSet >= exercise.sets;
  const label = isLastSet
    ? isLastExercise
      ? "Completar última serie · Victoria"
      : "Completar serie · Siguiente ejercicio"
    : `Completar Serie ${currentSet}`;

  return {
    weight: workKg,
    reps: exercise.reps,
    rest: exercise.restSeconds,
    title: `Serie ${currentSet} · Trabajo`,
    subtitle: `Fase 5 · ${exercise.reps}`,
    label,
    isWarmup: false,
  };
}

export function previewLiveMax(weight: number, reps: number, formula: string) {
  const w = weight > 0 ? weight : 0;
  const r = reps > 0 ? reps : 1;
  if (w <= 0) return { oneRm: 0, tm: 0, phase5: 0 };
  const oneRm = computeOneRm(w, r, formula);
  const tm = Math.round(oneRm * 0.9 * 10) / 10;
  const phase5 = Math.round(Math.round((tm * 0.85) / 2.5) * 2.5 * 10) / 10;
  return { oneRm, tm, phase5 };
}

export function calculateSessionStats(
  day: RoutineDay,
  completedSetsMap: { [exerciseName: string]: number[] },
  completedWarmupMap: { [exerciseName: string]: string[] },
  maxesMap: { [key: string]: ExerciseMaxData }
) {
  let totalKg = 0;
  let totalReps = 0;
  let totalEffectiveSets = 0;

  day.exercises.forEach((ex) => {
    const setsDone = completedSetsMap[ex.name] || [];
    const exMax = maxesMap[ex.name];
    const workKg =
      exMax?.prescriptions.phase_5_work ??
      (exMax?.one_rep_max ? Math.round(exMax.one_rep_max * 0.85) : 80);
    const repsCount = parseInt(ex.reps, 10) || 3;

    setsDone.forEach(() => {
      totalKg += workKg * repsCount;
      totalReps += repsCount;
      totalEffectiveSets += 1;
    });

    const warmupDone = completedWarmupMap[ex.name] || [];
    if (warmupDone.includes("F1")) {
      totalKg += (exMax?.prescriptions.phase_1_activation ?? 20) * 10;
      totalReps += 10;
    }
    if (warmupDone.includes("F2")) {
      totalKg += (exMax?.prescriptions.phase_2_light ?? 0) * 5;
      totalReps += 5;
    }
    if (warmupDone.includes("F3")) {
      totalKg += (exMax?.prescriptions.phase_3_medium ?? 0) * 3;
      totalReps += 3;
    }
    if (warmupDone.includes("F4")) {
      totalKg += (exMax?.prescriptions.phase_4_pap ?? 0) * 1;
      totalReps += 1;
    }
  });

  return {
    tonnageKg: Math.round(totalKg),
    totalReps,
    totalEffectiveSets,
  };
}

export function writeSessionProgress(payload: {
  completedSetsMap: { [exerciseName: string]: number[] };
  completedWarmupMap: { [exerciseName: string]: string[] };
  selectedDayKey: string;
  activeExerciseIndex: number;
  currentSet: number;
  activePhaseStep: string;
}) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      "neuro_strength_session_progress",
      JSON.stringify({ ...payload, timestamp: Date.now() })
    );
  } catch (err) {
    console.warn("Error saving session to localStorage:", err);
  }
}

export function writeMaxesMap(next: { [key: string]: ExerciseMaxData }) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("neuro_strength_maxes", JSON.stringify(next));
  } catch {
    /* offline-first: ignore quota errors */
  }
}
