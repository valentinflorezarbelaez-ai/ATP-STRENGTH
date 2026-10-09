/**
 * Exercise History & Continuity Storage (SSOT)
 * Preserves athlete exercise history, progressive overload continuity,
 * offline biomechanical cues, INOL calculations, and instant workout resumption.
 */

export interface CompletedSetRecord {
  setNumber: number;
  weight: number;
  reps: number | string;
  phase: string;
  rpe?: number;
  timestamp: string;
}

export interface BiomechanicalCue {
  setup: string[];
  execution: string[];
  breathing: string;
  commonMistake: string;
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
  notes?: string;
}

export const OFFLINE_TECH_CUES: Record<string, BiomechanicalCue> = {
  "press de banca": {
    setup: [
      "Retracción y depresión escapular completa (clavar escápulas en el banco)",
      "Pies plantados firmes detrás de las rodillas para leg drive activo",
      "Agarre firme buscando doblar la barra con las muñecas neutras",
    ],
    execution: [
      "Bajar con codos a 45-70° respecto al torso (evitar codos a 90°)",
      "Tocar suavemente el esternón inferior sin rebotar en la caja torácica",
      "Empujar con los talones y subir la barra en trayectoria de J invertida hacia los ojos",
    ],
    breathing: "Maniobra de Valsalva: inhalar y presurizar abdomen antes de bajar, liberar aire tras pasar el sticking point",
    commonMistake: "Desarmar las escápulas al bloquear arriba o rebotar la barra en el pecho",
  },
  "sentadilla": {
    setup: [
      "Barra firme sobre los trapecios (barra alta) o espina de la escápula (barra baja)",
      "Pies al ancho de hombros con puntas ligeramente rotadas hacia afuera (~15-30°)",
      "Presurizar el core 360° antes de sacar la barra del rack (2-3 pasos de walkout)",
    ],
    execution: [
      "Abrir las rodillas siguiendo la línea de los pies",
      "Romper simultáneamente en caderas y rodillas manteniendo el pecho orgulloso",
      "Alcanzar profundidad con el pliegue de la cadera bajo la parte superior de la rodilla",
      "Empujar el suelo a través de los tres puntos de apoyo del pie (trípode plantar)",
    ],
    breathing: "Inspiración diafragmática profunda, bloquear glotis y mantener presión intraabdominal hasta subir",
    commonMistake: "Colapso de rodillas hacia adentro (valgo) o levantar primero la cadera (buenos días involuntario)",
  },
  "peso muerto": {
    setup: [
      "Barra a 2.5 cm de las espinillas sobre el mediopié, pies al ancho de cadera",
      "Bajar las manos a la barra sin moverla, llevar las espinillas a tocar la barra",
      "Empaquetar dorsales ('proteger las axilas') y sacar toda la holgura de la barra (slack out)",
    ],
    execution: [
      "No dar tirones: empujar el piso como si fuera una prensa de piernas",
      "Barra rozando las espinillas y muslos durante todo el recorrido vertical",
      "Bloqueo firme contrayendo glúteos hacia adelante sin hiperextender la zona lumbar",
    ],
    breathing: "Presurización masiva en el setup; mantener el aire durante todo el levantamiento hasta bloquear",
    commonMistake: "Redondear la espalda lumbar o separar la barra del cuerpo durante el despegue",
  },
  "press militar": {
    setup: [
      "Barra apoyada sobre las clavículas/deltoides anteriores con codos ligeramente adelantados",
      "Glúteos y cuádriceps en tensión isométrica máxima; pelvis neutra",
      "Muñecas rectas sobre los antebrazos verticales",
    ],
    execution: [
      "Retirar ligeramente la cabeza hacia atrás para dar paso a la trayectoria vertical",
      "Empujar la barra en línea recta y meter la cabeza bajo la barra en cuanto pase la frente",
      "Bloquear codos arriba encogiendo levemente los trapecios superiores",
    ],
    breathing: "Inhalar en la base sobre el pecho, exhalar al culminar el bloqueo arriba",
    commonMistake: "Hiperextender la zona lumbar arqueando la espalda para simular un press inclinado",
  },
  "dominadas": {
    setup: [
      "Agarre prono o supino al ancho de hombros con pulgar envolviendo la barra",
      "Iniciar desde cuelgue activo con escápulas deprimidas (no cuelgue pasivo colapsado)",
    ],
    execution: [
      "Tirar guiando con los codos hacia los bolsillos traseros, abriendo el pecho a la barra",
      "Superar la barra con la barbilla o tocar con la parte alta del pecho",
      "Descenso controlado en 2-3 segundos hasta la extensión completa controlada",
    ],
    breathing: "Inhalar abajo, exhalar durante la tracción concéntrica",
    commonMistake: "Kipping/balanceo con piernas y encogimiento de hombros hacia las orejas",
  },
};

/**
 * Returns biomechanical technique cues matching the exercise name, or default cues.
 */
export function getBiomechanicalCues(exerciseName: string): BiomechanicalCue {
  const normalized = exerciseName.toLowerCase().trim();
  for (const [key, cue] of Object.entries(OFFLINE_TECH_CUES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return cue;
    }
  }
  // Generic compound lift cue
  return {
    setup: [
      "Alineación postural estricta antes de iniciar la primera repetición",
      "Agarre o soporte firme con muñecas y articulaciones neutras",
      "Core y suelo pélvico activados en co-contracción isométrica",
    ],
    execution: [
      "Control de tempo: fase excéntrica lenta (2-3s) y concéntrica explosiva",
      "Trayectoria biomecánica natural sin torsiones articulares",
      "Rango de movimiento completo sin recortar repeticiones",
    ],
    breathing: "Presurización diafragmática en la fase preparatoria; exhalación al superar el esfuerzo concéntrico",
    commonMistake: "Priorizar el ego de la carga sobre la calidad motora y el rango articular",
  };
}

/**
 * INOL (Intensity Number of Lifts) Formula based on Prilepin's table:
 * INOL = Reps / (100 - %1RM)
 * Optimal zone for single exercise: 0.4 to 1.0 INOL.
 */
export function calculateInol(reps: number, percent1Rm: number): {
  inol: number;
  status: "insufficient" | "optimal" | "high" | "danger";
  label: string;
} {
  const intensity = Math.min(Math.max(percent1Rm, 50), 99);
  const rawInol = reps / (100 - intensity);
  const inol = Math.round(rawInol * 100) / 100;

  if (inol < 0.4) {
    return { inol, status: "insufficient", label: "Estímulo de descarga o calentamiento (<0.4)" };
  }
  if (inol <= 1.0) {
    return { inol, status: "optimal", label: "Zona Óptima de Fuerza Máxima (0.4 - 1.0)" };
  }
  if (inol <= 1.3) {
    return { inol, status: "high", label: "Fatiga neuromuscular elevada (1.0 - 1.3)" };
  }
  return { inol, status: "danger", label: "Riesgo de sobreentrenamiento SNC (>1.3)" };
}

/**
 * Multi-formula 1RM Estimator (Epley + Brzycki)
 */
export function calculateMultiFormula1Rm(weight: number, reps: number): {
  epley: number;
  brzycki: number;
  average: number;
} {
  if (weight <= 0 || reps <= 0) return { epley: 0, brzycki: 0, average: 0 };
  if (reps === 1) return { epley: weight, brzycki: weight, average: weight };

  const epley = Math.round(weight * (1 + reps / 30) * 10) / 10;
  const brzycki = Math.round(weight * (36 / (37 - Math.min(reps, 36))) * 10) / 10;
  const average = Math.round(((epley + brzycki) / 2) * 10) / 10;

  return { epley, brzycki, average };
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

/**
 * Register or update an exercise immediately in the history registry,
 * ensuring continuity even before the first set is completed.
 */
export function registerOrUpdateExerciseInHistory(params: {
  exerciseName: string;
  oneRepMax: number;
  category?: string;
  notes?: string;
}): ExerciseHistoryEntry {
  const key = params.exerciseName.trim();
  const now = new Date().toISOString();

  let historyMap: Record<string, ExerciseHistoryEntry> = {};
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) historyMap = JSON.parse(raw);
    } catch {
      historyMap = {};
    }
  }

  const existing = historyMap[key];
  const isLower = /sentadilla|peso muerto|squat|deadlift/i.test(key);
  const increment = isLower ? 5 : 2.5;
  const suggested = Math.round((params.oneRepMax + increment) * 10) / 10;

  const entry: ExerciseHistoryEntry = {
    exerciseName: key,
    oneRepMax: Math.max(existing?.oneRepMax || 0, params.oneRepMax),
    lastTrainedAt: now,
    totalSetsCompleted: existing?.totalSetsCompleted || 0,
    lastSessionSets: existing?.lastSessionSets || [],
    suggestedNextWeight: suggested,
    programDayKey: existing?.programDayKey,
    category: params.category || existing?.category,
    notes: params.notes || existing?.notes,
  };

  historyMap[key] = entry;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyMap));

      // Also ensure it's mirrored in neuro_strength_maxes
      const rawMaxes = localStorage.getItem(MAXES_STORAGE_KEY);
      const maxesMap = rawMaxes ? JSON.parse(rawMaxes) : {};
      maxesMap[key] = {
        exercise_name: key,
        one_rep_max: entry.oneRepMax,
        training_max: Math.round(entry.oneRepMax * 0.9 * 10) / 10,
        recorded_at: now,
        mode: "direct",
      };
      localStorage.setItem(MAXES_STORAGE_KEY, JSON.stringify(maxesMap));
    } catch (err) {
      console.error("Error persisting exercise entry:", err);
    }
  }

  return entry;
}

export function recordSetToHistory(params: {
  exerciseName: string;
  oneRepMax: number;
  setNumber: number;
  weight: number;
  reps: number | string;
  phase: string;
  rpe?: number;
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
      rpe: params.rpe,
      timestamp: now,
    };

    const updatedSets = existing ? [...existing.lastSessionSets, newSetRecord] : [newSetRecord];

    // Progressive overload recommendation: +2.5kg for upper, +5kg for lower
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

/**
 * Export complete local history to a portable JSON backup file.
 */
export function exportHistoryAsJson(): string {
  if (typeof window === "undefined") return "{}";
  const history = localStorage.getItem(HISTORY_STORAGE_KEY) || "{}";
  const maxes = localStorage.getItem(MAXES_STORAGE_KEY) || "{}";
  const backup = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    history: JSON.parse(history),
    maxes: JSON.parse(maxes),
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Import and merge historical data from a portable JSON backup.
 */
export function importHistoryFromJson(jsonString: string): { success: boolean; count: number } {
  if (typeof window === "undefined") return { success: false, count: 0 };
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== "object") return { success: false, count: 0 };

    let count = 0;
    if (data.history && typeof data.history === "object") {
      const current = localStorage.getItem(HISTORY_STORAGE_KEY);
      const currentMap = current ? JSON.parse(current) : {};
      const merged = { ...currentMap, ...data.history };
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(merged));
      count = Object.keys(data.history).length;
    }

    if (data.maxes && typeof data.maxes === "object") {
      const currentMaxes = localStorage.getItem(MAXES_STORAGE_KEY);
      const maxesMap = currentMaxes ? JSON.parse(currentMaxes) : {};
      const mergedMaxes = { ...maxesMap, ...data.maxes };
      localStorage.setItem(MAXES_STORAGE_KEY, JSON.stringify(mergedMaxes));
    }

    return { success: true, count };
  } catch (err) {
    console.error("Error importing history JSON:", err);
    return { success: false, count: 0 };
  }
}
