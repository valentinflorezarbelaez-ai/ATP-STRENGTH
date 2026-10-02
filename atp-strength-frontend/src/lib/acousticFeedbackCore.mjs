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

export const COACH_PERSONAS = Object.freeze({
  TITAN: Object.freeze({
    id: "TITAN",
    name: "La Roca / Titán",
    gender: "MALE",
    icon: "🗿",
    pitch: 0.74,
    rate: 1.02,
    cueStyle: "INTENSE_MOTIVATIONAL",
  }),
  ELITE: Object.freeze({
    id: "ELITE",
    name: "Laura / Élite",
    gender: "FEMALE",
    icon: "⚡",
    pitch: 1.02,
    rate: 1.05,
    cueStyle: "TECHNICAL_PRECISE",
  }),
  AUTO: Object.freeze({
    id: "AUTO",
    name: "Automático",
    gender: "AUTO",
    icon: "⭐",
    pitch: 0.95,
    rate: 1.02,
    cueStyle: "BALANCED",
  }),
});

export const TITAN_COACH_CUES = Object.freeze({
  SET_COMPLETED: Object.freeze([
    "¡Eso es fuerza bruta! A recuperar que todavía falta.",
    "¡Gran serie! El trabajo duro siempre paga. Respira profundo.",
    "¡Potencia pura! Sos el más enfocado de esta sala.",
    "¡Liquidada esa serie! Dominaste la barra por completo.",
    "¡Eso se llama determinación! Aire en el diafragma y a recuperar.",
  ]),
  EXERCISE_COMPLETED: Object.freeze([
    "¡Ejercicio destruido! Excelente ritmo, vamos al siguiente sin aflojar.",
    "¡Movimiento liquidado! Así entrena un verdadero guerrero.",
  ]),
  REST_HALFWAY: Object.freeze([
    "Mitad del descanso. Hidratación, foco y recuperación de ATP.",
    "50% de la recuperación lista. Mente fría y respiración profunda.",
  ]),
  REST_15S_WARNING: Object.freeze([
    "15 segundos. Ajusta el cinturón, la mente fría y el corazón caliente.",
    "15 segundos. Andá a la barra, mostrá quién manda.",
    "15 segundos. Foco total, no viniste a pasear.",
  ]),
  REST_10S_WARNING: Object.freeze([
    "Diez segundos. Posición firme frente a la barra.",
    "Diez segundos. Concentración absoluta.",
  ]),
  REST_COMPLETED: Object.freeze([
    "¡Tiempo cumplido! A la barra con determinación asesina, ¡vamos!",
    "¡Descanso terminado! Momento de atacar los discos con todo.",
    "¡Se acabó el descanso! A romperla en esta serie.",
  ]),
  SESSION_VICTORY: Object.freeze([
    "¡Entrenamiento liquidado! Sangre, sudor y respeto. ¡Orgulloso de esta sesión!",
  ]),
});

export const DEFAULT_PREFS = Object.freeze({
  soundEnabled: true,
  voiceEnabled: true,
  voiceVolume: 1.0,
  voiceRate: 1.05,
  voicePitch: 1.02,
  preferredVoiceURI: "",
  voiceGender: "FEMALE",
  coachPersona: "AUTO",
});

export function getRandomCue(type, rng = Math.random, persona = "AUTO") {
  const bank = (persona === "TITAN" && TITAN_COACH_CUES[type])
    ? TITAN_COACH_CUES[type]
    : COACH_CUES[type];
  if (!bank || bank.length === 0) return "";
  const index = Math.floor(rng() * bank.length);
  return bank[index];
}

export function formatTelemetryCue(params, rng = Math.random, persona = "AUTO") {
  if (!params) return getRandomCue("SET_COMPLETED", rng, persona);
  const { weightKg, reps, rpe } = params;
  if (weightKg && weightKg > 0 && reps && reps > 0) {
    if (persona === "TITAN") {
      if (rpe && rpe >= 8) {
        return `¡Serie brutal de ${reps} repeticiones con ${weightKg} kilos a RPE ${rpe}! Eso es determinación pura. A recuperar.`;
      }
      return `¡Serie de ${reps} repeticiones con ${weightKg} kilos liquidada! A recuperar como un titán.`;
    }
    if (rpe && rpe >= 6.5) {
      return `¡Serie de ${reps} repeticiones con ${weightKg} kilos a RPE ${rpe} completada! A recuperar.`;
    }
    return `¡Serie de ${reps} repeticiones con ${weightKg} kilos completada! Buen trabajo.`;
  }
  return getRandomCue("SET_COMPLETED", rng, persona);
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

export function formatRestCompletedCue(params = {}, persona = "AUTO") {
  const { exerciseName = "", weightKg = 0, reps = 0, platesSpoken = "" } = params;
  let text = "¡Tiempo de descanso cumplido!";
  if (persona === "TITAN") {
    if (exerciseName && weightKg > 0) {
      text = `¡Tiempo cumplido! A la barra en ${exerciseName} con ${weightKg} kilos`;
      if (reps > 0) text += ` para ${reps} repeticiones a pura potencia`;
      text += ".";
    } else if (weightKg > 0) {
      text = `¡A la barra con ${weightKg} kilos, con determinación!`;
    } else {
      text = "¡A la barra, a comerse los discos!";
    }
  } else {
    if (exerciseName && weightKg > 0) {
      text += ` A la barra en ${exerciseName} con ${weightKg} kilos`;
      if (reps > 0) text += ` para ${reps} repeticiones`;
      text += ".";
    } else if (weightKg > 0) {
      text += ` A la barra con ${weightKg} kilos.`;
    } else {
      text += " A la barra, ¡vamos guerrero!";
    }
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
  const validGenders = ["AUTO", "FEMALE", "MALE"];
  const validPersonas = ["AUTO", "TITAN", "ELITE"];
  return {
    soundEnabled: typeof prefs.soundEnabled === "boolean" ? prefs.soundEnabled : DEFAULT_PREFS.soundEnabled,
    voiceEnabled: typeof prefs.voiceEnabled === "boolean" ? prefs.voiceEnabled : DEFAULT_PREFS.voiceEnabled,
    voiceVolume: typeof prefs.voiceVolume === "number"
      ? Math.max(0, Math.min(1, prefs.voiceVolume))
      : DEFAULT_PREFS.voiceVolume,
    voiceRate: typeof prefs.voiceRate === "number"
      ? Math.max(0.5, Math.min(2.0, prefs.voiceRate))
      : DEFAULT_PREFS.voiceRate,
    voicePitch: typeof prefs.voicePitch === "number"
      ? Math.max(0.6, Math.min(1.5, prefs.voicePitch))
      : DEFAULT_PREFS.voicePitch,
    preferredVoiceURI: typeof prefs.preferredVoiceURI === "string"
      ? prefs.preferredVoiceURI
      : DEFAULT_PREFS.preferredVoiceURI,
    voiceGender: validGenders.includes(prefs.voiceGender)
      ? prefs.voiceGender
      : DEFAULT_PREFS.voiceGender,
    coachPersona: validPersonas.includes(prefs.coachPersona)
      ? prefs.coachPersona
      : (prefs.voiceGender === "MALE" ? "TITAN" : (prefs.voiceGender === "FEMALE" ? "ELITE" : DEFAULT_PREFS.coachPersona)),
  };
}

/**
 * Detects whether a browser SpeechSynthesis voice is Female or Male based on
 * international, Spanish, Windows, Apple, and Google voice names and URIs.
 */
export function detectVoiceGender(voice) {
  if (!voice) return "AUTO";
  const name = (voice.name || "").toLowerCase();
  const uri = (voice.voiceURI || "").toLowerCase();
  const combined = `${name} ${uri}`;

  const femaleKeywords = [
    "female", "mujer", "femenin",
    "dalia", "paloma", "elvira", "laura", "monica", "mónica", "paulina",
    "angelica", "angélica", "francisca", "soledad", "jimena", "ximena",
    "sofia", "sofía", "lucia", "lucía", "valentina", "camila", "maria", "maría",
    "carmen", "elena", "helena", "sabina", "victoria", "raquel", "rosa",
    "conchita", "penelope", "lupe", "hilda", "mia", "mía", "samantha", "zira",
    "juana", "ana", "catalina", "isabel", "mariana", "andrea"
  ];

  const maleKeywords = [
    "male", "hombre", "masculin",
    "pablo", "jorge", "alvaro", "álvaro", "carlos", "juan", "diego",
    "miguel", "raul", "raúl", "mateo", "enrique", "gonzalo", "antonio",
    "david", "pedro", "fernando", "manuel", "alejandro", "julio", "luis",
    "javier", "alberto", "ignacio", "tomas", "tomás", "santiago", "alonso"
  ];

  for (const kw of femaleKeywords) {
    if (combined.includes(kw)) return "FEMALE";
  }
  for (const kw of maleKeywords) {
    if (combined.includes(kw)) return "MALE";
  }

  // Google español is typically a natural female voice model on Chromium
  if (name.includes("google") && name.includes("español") && !combined.includes("male")) {
    return "FEMALE";
  }

  return "AUTO";
}

/**
 * Normalizes athletic speech text for flawless Spanish speech synthesis:
 * - Converts number ranges like "10–12" or "10-12" to "10 a 12"
 * - Converts tempos like "TEMPO 3-1-X-1" to "cadencia 3, 1, explosivo, 1"
 * - Converts weights like "17.5 kilos" to "17 kilos y medio"
 * - Converts "0.5" to "medio kilo"
 * - Converts "2.5" to "dos kilos y medio"
 * - Converts RPE "RPE 7.5" to "RPE 7 y medio"
 * - Spells out units ("kg" -> "kilos", "s" -> "segundos", "reps" -> "repeticiones")
 * - Expands acronyms ("ATP" -> "A T P", "SNC" -> "sistema nervioso central", "PR" -> "récord personal")
 * - Cleans HTML tags, symbols, dashes, and emojis so voice never stumbles
 */
const normalizationCache = new Map();
const MAX_CACHE_SIZE = 128;

export function normalizeSpeechTextForSpanish(text) {
  if (!text || typeof text !== "string") return "";

  if (normalizationCache.has(text)) {
    return normalizationCache.get(text);
  }

  let res = text;

  // 1. Remove emojis and icons so TTS engines don't read them aloud
  res = res.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, " ");
  res = res.replace(/[🎯⏱️🔥⚡💪🏆✨☕❤️🛡️🏋️🧘✅❌✕🗿🦁]/g, " ");

  // 2. Clean HTML tags & entities
  res = res.replace(/<[^>]*>/g, " ");
  res = res.replace(/&middot;/g, ", ");
  res = res.replace(/&mdash;/g, ", ");
  res = res.replace(/&amp;/g, " y ");
  res = res.replace(/&bull;/g, ", ");
  res = res.replace(/[·•—]/g, ", ");

  // 3. Tempo normalization (e.g. "tempo 3-1-X-1" or "tempo 2-0-2-0")
  res = res.replace(/\btempo\s*(\d+)[\-–—](\d+)[\-–—]([xX\d]+)[\-–—](\d+)\b/gi, (_, e1, e2, e3, e4) => {
    const third = (e3.toLowerCase() === "x") ? "explosivo" : e3;
    return `cadencia ${e1}, ${e2}, ${third}, ${e4}`;
  });

  // 4. Sets and reps notation (e.g. "3x10", "4x5", "3 x 8") -> "3 por 10"
  res = res.replace(/(\b\d+)\s*[xX]\s*(\d+\b)/g, "$1 por $2");

  // 5. Fractions / Progress notation (e.g. "1/4", "3/5") -> "1 de 4"
  res = res.replace(/(\b\d+)\s*\/\s*(\d+\b)/g, "$1 de $2");

  // 6. Number ranges with hyphen/en-dash (e.g. "10–12 reps", "8-10", "1–2")
  res = res.replace(/(\b\d+)\s*[–—\-]\s*(\d+\b)/g, "$1 a $2");

  // 7. Plus sign before numbers (e.g. "+2.5 kg" -> "más 2.5 kg")
  res = res.replace(/\+\s*(\d+)/g, "más $1");

  // 8. RPE half-values with dot or comma (e.g. "RPE 7.5" or "RPE 7,5" -> "RPE 7 y medio")
  res = res.replace(/\brpe\s*(\d+)[\.,]5\b/gi, "RPE $1 y medio");
  res = res.replace(/\brpe\s*(\d+)[\.,](\d+)\b/gi, "RPE $1 coma $2");

  // 9. Specific athletic weights (.5, .25, .75) with dot or comma
  res = res.replace(/\b0[\.,]5\s*(?:kilos?|kg\.?|kilogramos?)?\b/gi, "medio kilo");
  res = res.replace(/\b2[\.,]5\s*(?:kilos?|kg\.?|kilogramos?)?\b/gi, "dos kilos y medio");
  res = res.replace(/\b1[\.,]25\s*(?:kilos?|kg\.?|kilogramos?)?\b/gi, "un kilo con 250 gramos");
  res = res.replace(/(\b\d+)[\.,]5\s*(?:kilos?|kg\.?|kilogramos?)?\b/gi, "$1 kilos y medio");
  res = res.replace(/(\b\d+)[\.,]25\s*(?:kilos?|kg\.?|kilogramos?)?\b/gi, "$1 kilos con 250 gramos");
  res = res.replace(/(\b\d+)[\.,]75\s*(?:kilos?|kg\.?|kilogramos?)?\b/gi, "$1 kilos con 750 gramos");
  // Any remaining decimal like 13.2 or 13,2 -> 13 coma 2
  res = res.replace(/(\b\d+)[\.,](\d+)\b/g, "$1 coma $2");

  // 10. Abbreviations with numbers (e.g. "45s", "120s", "3min", "10kg", "8reps")
  res = res.replace(/(\b\d+)\s*(?:seg\.?|s)\b/gi, "$1 segundos");
  res = res.replace(/(\b\d+)\s*(?:min\.?|mins)\b/gi, "$1 minutos");
  res = res.replace(/(\b\d+)\s*(?:kg\.?|kgs|kilos)\b/gi, "$1 kilos");
  res = res.replace(/(\b\d+)\s*(?:reps?|rep)\b/gi, "$1 repeticiones");

  // 11. Standalone units without numbers
  res = res.replace(/\bkg\.?\b/gi, "kilos");
  res = res.replace(/\bkgs\b/gi, "kilos");
  res = res.replace(/\breps\b/gi, "repeticiones");
  res = res.replace(/\bsegs\b/gi, "segundos");

  // 12. Singular adjustments
  res = res.replace(/\b1\s*kilos\b/gi, "un kilo");
  res = res.replace(/\b1\s*repeticiones\b/gi, "una repetición");
  res = res.replace(/\b1\s*segundos\b/gi, "un segundo");
  res = res.replace(/\b1\s*minutos\b/gi, "un minuto");

  // 13. Key Athletic Acronyms
  res = res.replace(/\bATP\b/g, "A T P");
  res = res.replace(/\bSNC\b/g, "sistema nervioso central");
  res = res.replace(/\bPR\b/g, "récord personal");
  res = res.replace(/\bPAP\b/g, "P A P");
  res = res.replace(/\b1\s*RM\b/gi, "una repetición máxima");
  res = res.replace(/(\d+)\s*RM\b/gi, "$1 R M");

  // 14. Clean duplicate spaces, extra commas and trim
  res = res.replace(/\s+/g, " ");
  res = res.replace(/\s*,\s*,+/g, ",");
  res = res.replace(/,\s*\./g, ".");
  res = res.replace(/\s+([,.:;?!])/g, "$1");

  const trimmed = res.trim();
  if (normalizationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = normalizationCache.keys().next().value;
    normalizationCache.delete(firstKey);
  }
  normalizationCache.set(text, trimmed);
  return trimmed;
}

