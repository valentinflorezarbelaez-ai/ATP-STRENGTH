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
  voiceRate: 0.98,
  voicePitch: 1,
  preferredVoiceURI: "",
  voiceGender: "AUTO",
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
  const validGenders = ["AUTO", "FEMALE", "MALE"];
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
  };
}

function foldVoiceText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasVoiceWord(folded, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`).test(folded);
}

const FEMALE_VOICE_WORDS = [
  "female", "mujer", "femenin",
  "dalia", "paloma", "elvira", "laura", "monica", "paulina",
  "angelica", "francisca", "soledad", "jimena", "ximena",
  "sofia", "lucia", "valentina", "camila", "maria",
  "carmen", "elena", "helena", "sabina", "victoria", "raquel", "rosa",
  "conchita", "penelope", "lupe", "hilda", "mia", "samantha", "zira",
  "juana", "ana", "catalina", "isabel", "mariana", "andrea",
];

const MALE_VOICE_WORDS = [
  "male", "hombre", "masculin",
  "pablo", "jorge", "alvaro", "carlos", "juan", "diego",
  "miguel", "raul", "mateo", "enrique", "gonzalo", "antonio",
  "david", "pedro", "fernando", "manuel", "alejandro", "julio", "luis",
  "javier", "alberto", "ignacio", "tomas", "santiago", "alonso",
];

/**
 * Google Cloud / Android Spanish voices encode gender in the variant letter:
 * A and C are female, B and D are male (Standard, WaveNet, Neural2).
 */
function genderFromVoiceVariant(folded) {
  const match = folded.match(
    /(?:standard|wavenet|neural2|news|studio|polyglot|neural)[-_\s]?([a-d])(?![a-z0-9])/
  );
  if (!match) return "AUTO";
  return match[1] === "a" || match[1] === "c" ? "FEMALE" : "MALE";
}

/**
 * Detects whether a browser SpeechSynthesis voice is Female or Male based on
 * international, Spanish, Windows, Apple, and Google voice names and URIs.
 */
export function detectVoiceGender(voice) {
  if (!voice) return "AUTO";
  const folded = foldVoiceText(`${voice.name || ""} ${voice.voiceURI || ""}`);
  if (!folded.trim()) return "AUTO";

  const variant = genderFromVoiceVariant(folded);
  if (variant !== "AUTO") return variant;

  for (const word of FEMALE_VOICE_WORDS) {
    if (hasVoiceWord(folded, word)) return "FEMALE";
  }
  for (const word of MALE_VOICE_WORDS) {
    if (hasVoiceWord(folded, word)) return "MALE";
  }

  const name = foldVoiceText(voice.name);
  if (name.includes("google") && (name.includes("espanol") || name.includes("spanish"))) {
    return "FEMALE";
  }

  return "AUTO";
}

export function isNaturalVoice(voice) {
  if (!voice) return false;
  const folded = foldVoiceText(`${voice.name || ""} ${voice.voiceURI || ""}`);
  return /natural|neural|enhanced|wavenet|premium|studio/.test(folded);
}

/**
 * Legacy builds stored pitch 0.92 / 1.02 and rate 1.05 automatically.
 * Those values pitch-shift neural voices and make weights harder to hear.
 * A pitch or rate outside that set is an explicit athlete choice.
 */
export function resolveSpokenDelivery(voice, prefs = {}) {
  const storedPitch = typeof prefs.voicePitch === "number" ? prefs.voicePitch : 1;
  const storedRate = typeof prefs.voiceRate === "number" ? prefs.voiceRate : DEFAULT_PREFS.voiceRate;
  const legacyPitch = storedPitch === 0.92 || storedPitch === 1.02;
  const legacyRate = storedRate === 1.05 || storedRate === 1.02;
  const pitch = legacyPitch ? 1 : Math.max(0.6, Math.min(1.5, storedPitch));
  const rate = legacyRate ? DEFAULT_PREFS.voiceRate : Math.max(0.5, Math.min(2, storedRate));
  return { pitch, rate, natural: isNaturalVoice(voice) };
}

export function scoreSpanishVoice(voice, genderPreference = "AUTO") {
  if (!voice) return -1000;
  const name = foldVoiceText(voice.name);
  const uri = foldVoiceText(voice.voiceURI);
  const lang = foldVoiceText(voice.lang);
  let score = 0;
  const detected = detectVoiceGender(voice);

  if (genderPreference === "FEMALE") {
    if (detected === "FEMALE") score += 300;
    else if (detected === "MALE") score -= 200;
  } else if (genderPreference === "MALE") {
    if (detected === "MALE") score += 300;
    else if (detected === "FEMALE") score -= 200;
  }

  if (name.includes("natural") || uri.includes("natural")) score += 120;
  if (name.includes("neural") || uri.includes("neural")) score += 120;
  if (name.includes("wavenet") || uri.includes("wavenet")) score += 110;
  if (name.includes("enhanced") || uri.includes("enhanced")) score += 90;
  if (name.includes("premium") || uri.includes("premium")) score += 80;
  if (name.includes("online") || uri.includes("online")) score += 60;
  if (name.includes("google") || uri.includes("google")) score += 50;

  if (
    hasVoiceWord(name, "pablo") || hasVoiceWord(name, "jorge") ||
    hasVoiceWord(name, "alvaro") || hasVoiceWord(name, "dalia") ||
    hasVoiceWord(name, "paulina") || hasVoiceWord(name, "monica") ||
    hasVoiceWord(name, "sabina") || hasVoiceWord(name, "elvira")
  ) {
    score += 40;
  }

  if (lang === "es-mx" || lang === "es-us" || lang === "es-419" || lang === "es-co" || lang === "es-ar") {
    score += 20;
  }
  if (lang.startsWith("es")) score += 15;

  if (!isNaturalVoice(voice) && (name.includes("desktop") || name.includes("espeak") || uri.includes("desktop") || uri.includes("espeak"))) {
    score -= 40;
  }

  return score;
}

export function pickBestVoice(voices, options = {}) {
  const list = Array.isArray(voices) ? voices.filter((voice) => voice && (voice.name || voice.voiceURI)) : [];
  if (list.length === 0) return null;

  const gender = options.gender || "AUTO";
  const preferredURI = options.preferredURI || "";
  if (preferredURI) {
    const match = list.find((voice) => voice.voiceURI === preferredURI);
    if (match) {
      const detected = detectVoiceGender(match);
      if (gender === "AUTO" || detected === gender || detected === "AUTO") return match;
    }
  }

  return [...list].sort(
    (a, b) => scoreSpanishVoice(b, gender) - scoreSpanishVoice(a, gender)
  )[0];
}

export function voiceSwitchCue(gender) {
  if (gender === "FEMALE") return "Voz de mujer lista. Cargá la barra y vamos.";
  if (gender === "MALE") return "Voz de hombre lista. Cargá la barra y vamos.";
  return "Voz automática lista. Uso la más clara de este teléfono.";
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
export function normalizeSpeechTextForSpanish(text) {
  if (!text || typeof text !== "string") return "";

  let res = text;

  // 1. Remove emojis and icons so TTS engines don't read them aloud
  res = res.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, " ");
  res = res.replace(/[🎯⏱️🔥⚡💪🏆✨☕❤️🛡️🏋️🧘✅❌✕]/g, " ");

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

  return res.trim();
}

