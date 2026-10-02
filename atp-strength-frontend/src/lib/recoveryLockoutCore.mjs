/**
 * Biomechanical Muscle Recovery & Optimal Inter-Session Lockout Engine (SPEC-0010)
 * Pure L0 Domain Logic implementing Selye's GAS & Soviet Supercompensation doctrine.
 * Enforces 48h / 72h physiological recovery intervals before repeating max-effort exercises.
 */

// Optimal recovery periods in hours based on CNS axial fatigue and muscular cross-sectional trauma
export const RECOVERY_PROFILES = Object.freeze({
  AXIAL_MAXIMAL: 72,      // Squats, Deadlifts, Olympic Lifts (Massive CNS + spinal axial loading)
  UPPER_COMPOUND: 48,     // Bench Press, Overhead Press, Heavy Rows (Pectoral, Lats, Deltoids)
  ACCESSORY_ISOLATION: 36 // Biceps, Triceps, Lateral Delts, Calves, Core
});

export const EXERCISE_RECOVERY_HOURS = Object.freeze({
  // 72-Hour Axial / Severe CNS Tier
  "Sentadilla Trasera": RECOVERY_PROFILES.AXIAL_MAXIMAL,
  "Sentadilla Frontal": RECOVERY_PROFILES.AXIAL_MAXIMAL,
  "Sentadilla Búlgara": RECOVERY_PROFILES.AXIAL_MAXIMAL,
  "Peso Muerto Convencional": RECOVERY_PROFILES.AXIAL_MAXIMAL,
  "Peso Muerto Rumano": RECOVERY_PROFILES.AXIAL_MAXIMAL,
  "Peso Muerto Sumo": RECOVERY_PROFILES.AXIAL_MAXIMAL,
  "Clean & Jerk": RECOVERY_PROFILES.AXIAL_MAXIMAL,
  "Power Clean": RECOVERY_PROFILES.AXIAL_MAXIMAL,
  "Snatch Olímpico": RECOVERY_PROFILES.AXIAL_MAXIMAL,
  "Hip Thrust": RECOVERY_PROFILES.AXIAL_MAXIMAL,

  // 48-Hour Upper Body Compound Tier
  "Press de Banca Plano": RECOVERY_PROFILES.UPPER_COMPOUND,
  "Press de Banca Inclinado": RECOVERY_PROFILES.UPPER_COMPOUND,
  "Press Militar Estricto": RECOVERY_PROFILES.UPPER_COMPOUND,
  "Push Press": RECOVERY_PROFILES.UPPER_COMPOUND,
  "Remo con Barra": RECOVERY_PROFILES.UPPER_COMPOUND,
  "Remo Pendlay": RECOVERY_PROFILES.UPPER_COMPOUND,
  "Dominadas con Lastre": RECOVERY_PROFILES.UPPER_COMPOUND,
  "Fondos en Paralelas": RECOVERY_PROFILES.UPPER_COMPOUND,

  // 36-Hour Accessory Tier
  "Curl de Bíceps con Barra": RECOVERY_PROFILES.ACCESSORY_ISOLATION,
  "Press Francés": RECOVERY_PROFILES.ACCESSORY_ISOLATION,
  "Elevaciones Laterales": RECOVERY_PROFILES.ACCESSORY_ISOLATION,
  "Paseo del Granjero": RECOVERY_PROFILES.ACCESSORY_ISOLATION,
  "Rueda Abdominal": RECOVERY_PROFILES.ACCESSORY_ISOLATION,
});

export function getOptimalRecoveryHours(exerciseName = "") {
  const normalized = exerciseName.trim();
  for (const [key, hours] of Object.entries(EXERCISE_RECOVERY_HOURS)) {
    if (normalized.toLowerCase() === key.toLowerCase()) {
      return hours;
    }
  }
  // Fallback heuristic based on exercise name keywords
  const lower = normalized.toLowerCase();
  if (lower.includes("muerto") || lower.includes("sentadilla") || lower.includes("clean") || lower.includes("snatch")) {
    return RECOVERY_PROFILES.AXIAL_MAXIMAL; // 72h
  }
  if (lower.includes("press") || lower.includes("banca") || lower.includes("remo") || lower.includes("dominada") || lower.includes("fondo")) {
    return RECOVERY_PROFILES.UPPER_COMPOUND; // 48h
  }
  return RECOVERY_PROFILES.ACCESSORY_ISOLATION; // 36h
}

export function getExerciseRecoveryStatus(exerciseName, lastCompletedMs, nowMs = Date.now()) {
  if (!lastCompletedMs || typeof lastCompletedMs !== "number" || lastCompletedMs <= 0) {
    return {
      isLocked: false,
      recoveryHoursTotal: getOptimalRecoveryHours(exerciseName),
      elapsedHours: 0,
      remainingHours: 0,
      remainingMinutes: 0,
      remainingFormatted: "0h 0m",
      recoveryPercent: 100,
      scientificRationale: "Músculo 100% recuperado. Sistema nervioso central listo para esfuerzo máximo.",
      suggestedAlternativeMuscles: [],
    };
  }

  const recoveryHoursTotal = getOptimalRecoveryHours(exerciseName);
  const recoveryMsTotal = recoveryHoursTotal * 3600 * 1000;
  const elapsedMs = Math.max(0, nowMs - lastCompletedMs);
  const remainingMs = Math.max(0, recoveryMsTotal - elapsedMs);

  const isLocked = remainingMs > 0;
  const elapsedHours = Math.round((elapsedMs / (3600 * 1000)) * 10) / 10;
  const remainingTotalMinutes = Math.ceil(remainingMs / (60 * 1000));
  const remainingHours = Math.floor(remainingTotalMinutes / 60);
  const remainingMinutes = remainingTotalMinutes % 60;
  const remainingFormatted = `${remainingHours}h ${remainingMinutes}m`;
  const recoveryPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / recoveryMsTotal) * 100)));

  const isAxial = recoveryHoursTotal === 72;
  const scientificRationale = isAxial
    ? `Este ejercicio recluta el 80% de la masa muscular corporal y genera alta fatiga axial y del SNC. Requiere 72 horas para resíntesis de glucógeno y reparación de miofibrillas tipo IIx.`
    : `Requiere 48 horas de descanso biológico para maximizar la síntesis proteica miofibrilar y prevenir sobrecarga articular en tendones.`;

  const suggestedAlternativeMuscles = isAxial
    ? ["Pectoral & Tríceps (Press de Banca)", "Hombros & Espalda (Press Militar, Remo)"]
    : ["Piernas & Cadena Posterior (Sentadilla, Peso Muerto)", "Core & Accesorios"];

  return {
    isLocked,
    recoveryHoursTotal,
    elapsedHours,
    remainingHours,
    remainingMinutes,
    remainingFormatted,
    recoveryPercent,
    scientificRationale,
    suggestedAlternativeMuscles,
  };
}

export function formatRecoverySpokenNotice(exerciseName, remainingHours, remainingMinutes) {
  let timeStr = "";
  if (remainingHours > 0 && remainingMinutes > 0) {
    timeStr = `${remainingHours} horas y ${remainingMinutes} minutos`;
  } else if (remainingHours > 0) {
    timeStr = `${remainingHours} horas`;
  } else {
    timeStr = `${remainingMinutes} minutos`;
  }

  return `¡Atención atleta! ${exerciseName} completó una carga máxima reciente. Tu sistema muscular y nervioso están en fase de supercompensación activa. Para maximizar tu fuerza y no interrumpir la recuperación, restan ${timeStr} de descanso biológico óptimo. Te sugiero entrenar otro grupo muscular hoy.`;
}
