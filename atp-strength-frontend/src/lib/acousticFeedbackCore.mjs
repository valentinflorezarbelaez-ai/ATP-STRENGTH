/**
 * Pure L0 Domain Logic for Neuro-Acoustic Biofeedback (SPEC-0005)
 * Zero browser dependencies, fully testable in Node.js test runner.
 */

export const COACH_CUES = Object.freeze({
  SET_COMPLETED: Object.freeze([
    "¡Buena serie! A recuperar.",
    "¡Excelente esfuerzo, guerrero!",
    "¡Eso es fuerza pura!",
    "¡Gran serie! Respira profundo.",
    "¡Impecable ejecución! Buen trabajo.",
  ]),
  EXERCISE_COMPLETED: Object.freeze([
    "¡Ejercicio liquidado! Gran trabajo, pasamos al siguiente.",
    "¡Excelente ritmo! Un ejercicio menos, seguimos firmes.",
    "¡Liquidado! Prepárate para el próximo movimiento.",
  ]),
  REST_HALFWAY: Object.freeze([
    "Mitad de la recuperación. Hidrátate y respira hondo.",
    "50% del descanso completado. Relaja los hombros y oxigena.",
    "Mitad del descanso. Foco en la respiración y recuperación de ATP.",
  ]),
  REST_15S_WARNING: Object.freeze([
    "15 segundos restantes. Ajusta tu cinturón y prepárate para la barra.",
    "15 segundos. Foco mental y postura firme.",
    "15 segundos. Acércate a la barra.",
  ]),
  REST_10S_WARNING: Object.freeze([
    "Diez segundos. Prepárate para la barra.",
    "Diez segundos. Posición de inicio.",
  ]),
  REST_COMPLETED: Object.freeze([
    "¡Tiempo de descanso cumplido! A la barra con máxima determinación.",
    "¡Recuperación completa! Momento de atacar la serie.",
    "¡Tiempo! A la barra.",
  ]),
  SESSION_VICTORY: Object.freeze([
    "¡Sesión completada con éxito! Gran entrenamiento hoy, a descansar.",
  ]),
});

export const DEFAULT_PREFS = Object.freeze({
  soundEnabled: true,
  voiceEnabled: true,
  voiceVolume: 1.0,
  voiceRate: 1.05,
});

export function getRandomCue(type, rng = Math.random) {
  const bank = COACH_CUES[type];
  if (!bank || bank.length === 0) return "";
  const index = Math.floor(rng() * bank.length);
  return bank[index];
}

export function formatTelemetryCue(params, rng = Math.random) {
  if (!params) return getRandomCue("SET_COMPLETED", rng);
  const { weightKg, reps, rpe } = params;
  if (weightKg && weightKg > 0 && reps && reps > 0) {
    if (rpe && rpe >= 6.5) {
      return `¡Serie de ${reps} repeticiones con ${weightKg} kilos a RPE ${rpe} completada! A recuperar.`;
    }
    return `¡Serie de ${reps} repeticiones con ${weightKg} kilos completada! Buen trabajo.`;
  }
  return getRandomCue("SET_COMPLETED", rng);
}

export function formatBarbellPlatesSpoken(weightKg, barWeight = 20, isBodyweight = false) {
  if (isBodyweight) {
    if (weightKg > 0) return `Peso corporal con ${weightKg} kilos de lastre en cinturón`;
    return "Carga con peso corporal sin lastre";
  }
  if (weightKg <= barWeight) {
    return `Barra olímpica sola, ${barWeight} kilos`;
  }

  const perSideTarget = Math.round(((weightKg - barWeight) / 2) * 100) / 100;
  let remaining = perSideTarget;
  const plates = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5];
  const items = [];

  for (const p of plates) {
    if (remaining >= p - 0.001) {
      const count = Math.floor((remaining + 0.001) / p);
      if (count > 0) {
        items.push(`${count > 1 ? count + " discos" : "un disco"} de ${p}`);
        remaining = Math.round((remaining - count * p) * 1000) / 1000;
      }
    }
  }

  if (items.length === 0) {
    return `Barra olímpica sola, ${barWeight} kilos`;
  }

  return `Carga por lado: ${items.join(" y ")}`;
}

export function formatPreSetBriefing(params = {}) {
  const {
    exerciseName = "Ejercicio",
    phaseLabel = "",
    weightKg = 0,
    reps = 0,
    rpe = 0,
    cues = "",
    platesSpoken = "",
  } = params;

  let text = `${exerciseName}`;
  if (phaseLabel) text += `, ${phaseLabel}`;
  if (weightKg > 0) text += `. Cargar ${weightKg} kilos`;
  if (reps > 0) text += ` para ${reps} repeticiones`;
  if (rpe > 0) text += ` a RPE ${rpe}`;
  text += ".";

  if (platesSpoken) {
    text += ` ${platesSpoken}.`;
  }
  if (cues) {
    text += ` Clave: ${cues}.`;
  }
  return text;
}

export function formatRestCompletedCue(params = {}) {
  const { exerciseName = "", weightKg = 0, reps = 0, platesSpoken = "" } = params;
  let text = "¡Tiempo de descanso cumplido!";
  if (exerciseName && weightKg > 0) {
    text += ` A la barra en ${exerciseName} con ${weightKg} kilos`;
    if (reps > 0) text += ` para ${reps} repeticiones`;
    text += ".";
  } else if (weightKg > 0) {
    text += ` A la barra con ${weightKg} kilos.`;
  } else {
    text += " A la barra, ¡vamos guerrero!";
  }
  if (platesSpoken) {
    text += ` ${platesSpoken}.`;
  }
  return text;
}

export function formatAutoregulationCue({ direction, deltaKg, nextWeightKg, rpe } = {}) {
  if (direction === "DOWN") {
    return `Fatiga neuromuscular detectada con RPE ${rpe}. Ajustamos la próxima serie a ${nextWeightKg} kilos para sostener la velocidad de la barra.`;
  }
  if (direction === "UP") {
    return `Velocidad óptima y reserva con RPE ${rpe}. Sumamos ${deltaKg} kilos para la próxima serie: ${nextWeightKg} kilos.`;
  }
  return `Carga estable para la próxima serie en ${nextWeightKg} kilos.`;
}

export function validateAudioPreferences(prefs = {}) {
  return {
    soundEnabled: typeof prefs.soundEnabled === "boolean" ? prefs.soundEnabled : DEFAULT_PREFS.soundEnabled,
    voiceEnabled: typeof prefs.voiceEnabled === "boolean" ? prefs.voiceEnabled : DEFAULT_PREFS.voiceEnabled,
    voiceVolume: typeof prefs.voiceVolume === "number"
      ? Math.max(0, Math.min(1, prefs.voiceVolume))
      : DEFAULT_PREFS.voiceVolume,
    voiceRate: typeof prefs.voiceRate === "number"
      ? Math.max(0.5, Math.min(2.0, prefs.voiceRate))
      : DEFAULT_PREFS.voiceRate,
  };
}
