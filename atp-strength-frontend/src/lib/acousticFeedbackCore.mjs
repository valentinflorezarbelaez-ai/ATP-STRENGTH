/**
 * Pure L0 Domain Logic for Neuro-Acoustic Biofeedback (SPEC-0005)
 * Zero browser dependencies, fully testable in Node.js test runner.
 */

export const COACH_CUES = Object.freeze({
  SET_COMPLETED: Object.freeze([
    '¡Buena serie! A recuperar.',
    '¡Excelente esfuerzo, guerrero!',
    '¡Eso es fuerza pura!',
    '¡Gran serie! Respira profundo.',
    '¡Impecable ejecución! Buen trabajo.',
    '¡Fuerza titánica! Templando el carácter bajo el acero.',
    '¡El cuerpo obedece a la voluntad del espíritu! A recuperar.',
    '¡Excelente empuje! La mente quería parar, pero tu voluntad conquistó la barra.',
    '¡Bien hecho, guerrero! Cada repetición quema la debilidad y forja la armadura interior.',
    '¡Poder y honor! A las grandes alturas solo se llega con sacrificio y disciplina.',
  ]),
  EXERCISE_COMPLETED: Object.freeze([
    '¡Ejercicio liquidado! Gran trabajo, pasamos al siguiente.',
    '¡Excelente ritmo! Un ejercicio menos, seguimos firmes.',
    '¡Liquidado! Prepárate para el próximo movimiento.',
    '¡Batalla ganada! Un ejercicio menos hacia la cima. Seguimos con foco total.',
  ]),
  REST_HALFWAY: Object.freeze([
    'Mitad del descanso. Foco en la respiración y recuperación.',
    '90 segundos. Saturando fosfágenos. Visualizá la barra antes del asalto.',
  ]),
  REST_10S_WARNING: Object.freeze([
    'Diez segundos. Preparate para la barra.',
    '¡Diez segundos, guerrero! Mirada al frente y mente blindada. ¡A la barra!',
    '¡Diez segundos! Postura de combate. El dolor pasa, el carácter queda.',
  ]),
  SESSION_VICTORY: Object.freeze([
    '¡Sesión completada con éxito! Gran entrenamiento hoy, a descansar.',
    '¡Victoria absoluta en el templo! Venciste a la comodidad y forjaste un espíritu inmortal. ¡Honor al guerrero!',
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
  if (!bank || bank.length === 0) return '';
  const index = Math.floor(rng() * bank.length);
  return bank[index];
}

export function formatTelemetryCue(params, rng = Math.random) {
  if (!params) return getRandomCue('SET_COMPLETED', rng);
  const { weightKg, reps, rpe } = params;
  if (weightKg && weightKg > 0 && reps && reps > 0) {
    if (rpe && rpe >= 6.5) {
      return `¡Serie de ${reps} repeticiones con ${weightKg} kilos a RPE ${rpe} completada! A recuperar.`;
    }
    return `¡Serie de ${reps} repeticiones con ${weightKg} kilos completada! Buen trabajo.`;
  }
  return getRandomCue('SET_COMPLETED', rng);
}

export function validateAudioPreferences(prefs = {}) {
  return {
    soundEnabled: typeof prefs.soundEnabled === 'boolean' ? prefs.soundEnabled : DEFAULT_PREFS.soundEnabled,
    voiceEnabled: typeof prefs.voiceEnabled === 'boolean' ? prefs.voiceEnabled : DEFAULT_PREFS.voiceEnabled,
    voiceVolume: typeof prefs.voiceVolume === 'number'
      ? Math.max(0, Math.min(1, prefs.voiceVolume))
      : DEFAULT_PREFS.voiceVolume,
    voiceRate: typeof prefs.voiceRate === 'number'
      ? Math.max(0.5, Math.min(2.0, prefs.voiceRate))
      : DEFAULT_PREFS.voiceRate,
  };
}
