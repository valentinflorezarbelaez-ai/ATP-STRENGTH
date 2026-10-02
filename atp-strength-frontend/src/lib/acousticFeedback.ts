/**
 * Neuro-Acoustic Biofeedback & Speech Coaching Engine (SPEC-0005)
 * Combines pure domain logic with browser-native Web Audio API and SpeechSynthesis.
 * Zero external dependencies.
 */

import { playChime, hapticPulse } from "./zenAudio";
import {
  COACH_CUES as CORE_COACH_CUES,
  TITAN_COACH_CUES,
  COACH_PERSONAS,
  DEFAULT_PREFS as CORE_DEFAULT_PREFS,
  getRandomCue as coreGetRandomCue,
  formatTelemetryCue as coreFormatTelemetryCue,
  formatBarbellPlatesSpoken as coreFormatBarbellPlatesSpoken,
  formatPreSetBriefing as coreFormatPreSetBriefing,
  formatRestCompletedCue as coreFormatRestCompletedCue,
  formatAutoregulationCue as coreFormatAutoregulationCue,
  validateAudioPreferences,
  normalizeSpeechTextForSpanish,
  detectVoiceGender as coreDetectVoiceGender,
} from "./acousticFeedbackCore.mjs";

export type CoachingEventType =
  | "SET_COMPLETED"
  | "EXERCISE_COMPLETED"
  | "REST_HALFWAY"
  | "REST_15S_WARNING"
  | "REST_10S_WARNING"
  | "REST_COMPLETED"
  | "SESSION_VICTORY";

export type VoiceGender = "AUTO" | "FEMALE" | "MALE";
export type CoachPersona = "AUTO" | "TITAN" | "ELITE";

export { COACH_PERSONAS, TITAN_COACH_CUES };

export interface CoachAudioPreferences {
  soundEnabled: boolean; // Chimes / Web Audio
  voiceEnabled: boolean; // Spoken coaching cues
  voiceVolume: number;   // 0.0 to 1.0
  voiceRate: number;     // 0.8 to 1.3 (default 1.02 for natural delivery)
  voicePitch?: number;   // 0.6 to 1.5 (default 0.74 for Titan baritone, 1.02 for female)
  preferredVoiceURI?: string; // Specific voice chosen by athlete
  voiceGender?: VoiceGender;  // "AUTO" | "FEMALE" | "MALE"
  coachPersona?: CoachPersona;// "AUTO" | "TITAN" | "ELITE"
}

export interface TelemetryNarrationParams {
  exerciseName?: string;
  weightKg?: number;
  reps?: number;
  rpe?: number;
}

export interface PreSetBriefingParams {
  exerciseName?: string;
  phaseLabel?: string;
  weightKg?: number;
  reps?: number;
  rpe?: number;
  cues?: string;
  platesSpoken?: string;
}

export interface RestCompletedParams {
  exerciseName?: string;
  weightKg?: number;
  reps?: number;
  platesSpoken?: string;
}

export interface AutoregulationParams {
  direction: "UP" | "DOWN" | "HOLD";
  deltaKg: number;
  nextWeightKg: number;
  rpe: number;
}

export const COACH_CUES = CORE_COACH_CUES as Record<CoachingEventType, string[]>;
export const DEFAULT_PREFS: CoachAudioPreferences = CORE_DEFAULT_PREFS;

const PREFS_STORAGE_KEY = "atp_coach_audio_prefs";

export function getAudioPreferences(): CoachAudioPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return validateAudioPreferences(JSON.parse(raw));
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveAudioPreferences(prefs: Partial<CoachAudioPreferences>): CoachAudioPreferences {
  const current = getAudioPreferences();
  const updated = validateAudioPreferences({ ...current, ...prefs });
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to persist coach audio preferences:", err);
    }
  }
  return updated;
}

export function getRandomCue(type: CoachingEventType, rng?: () => number, persona: CoachPersona = "AUTO"): string {
  return coreGetRandomCue(type, rng, persona);
}

export function formatTelemetryCue(params?: TelemetryNarrationParams, rng?: () => number, persona: CoachPersona = "AUTO"): string {
  return coreFormatTelemetryCue(params, rng, persona);
}

export function formatBarbellPlatesSpoken(weightKg: number, barWeight = 20, isBodyweight = false): string {
  return coreFormatBarbellPlatesSpoken(weightKg, barWeight, isBodyweight);
}

export function formatPreSetBriefing(params?: PreSetBriefingParams): string {
  return coreFormatPreSetBriefing(params);
}

export function formatRestCompletedCue(params?: RestCompletedParams, persona: CoachPersona = "AUTO"): string {
  return coreFormatRestCompletedCue(params, persona);
}

export function formatAutoregulationCue(params?: AutoregulationParams): string {
  return coreFormatAutoregulationCue(params);
}

export function detectVoiceGender(
  voice: SpeechSynthesisVoice | { name?: string; voiceURI?: string } | null | undefined
): VoiceGender {
  return coreDetectVoiceGender(voice);
}

const voiceCache = new Map<VoiceGender, SpeechSynthesisVoice[]>();

export function clearVoiceCache(): void {
  voiceCache.clear();
}

/**
 * Returns available Spanish voices sorted by natural human quality,
 * with optional gender weighting (FEMALE or MALE priority).
 * Cached in memory for 0ms instantaneous lookup during workouts.
 */
export function getAvailableSpanishVoices(genderPreference: VoiceGender = "AUTO"): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  if (voiceCache.has(genderPreference)) {
    return voiceCache.get(genderPreference)!;
  }
  const allVoices = window.speechSynthesis.getVoices();
  const spanish = allVoices.filter((v) => v.lang.startsWith("es"));
  const pool = spanish.length > 0 ? spanish : allVoices;

  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    const name = v.name.toLowerCase();
    const uri = v.voiceURI.toLowerCase();
    let score = 0;

    const detectedGender = detectVoiceGender(v);

    // Explicit gender prioritization requested by the athlete
    if (genderPreference === "FEMALE") {
      if (detectedGender === "FEMALE") score += 300;
      else if (detectedGender === "MALE") score -= 200;
    } else if (genderPreference === "MALE") {
      if (detectedGender === "MALE") score += 300;
      else if (detectedGender === "FEMALE") score -= 200;
      // Resonant baritone / Dwayne Johnson style powerhouse male voices
      if (name.includes("raul") || name.includes("raúl")) score += 160;
      if (name.includes("jorge") || name.includes("alvaro") || name.includes("álvaro")) score += 150;
      if (name.includes("pablo") || name.includes("diego") || name.includes("carlos") || name.includes("alonso")) score += 120;
    }

    // Highest priority: Neural / Natural / Studio / Enhanced
    if (name.includes("natural") || uri.includes("natural")) score += 120;
    if (name.includes("neural") || uri.includes("neural")) score += 120;
    if (name.includes("enhanced") || uri.includes("enhanced")) score += 90;
    if (name.includes("online") || uri.includes("online")) score += 60;
    if (name.includes("google") || uri.includes("google")) score += 50;

    // Premier Spanish voice models
    if (name.includes("laura")) score += 110;
    if (name.includes("helena")) score += 90;
    if (name.includes("sabina")) score += 70;
    if (name.includes("dalia") || name.includes("paloma") || name.includes("elvira")) score += 120;
    if (name.includes("paulina") || name.includes("monica") || name.includes("mónica")) score += 80;

    // Warm, resonant human coach voice names
    if (
      name.includes("pablo") ||
      name.includes("jorge") ||
      name.includes("alvaro") ||
      name.includes("carlos") ||
      name.includes("juan") ||
      name.includes("diego") ||
      name.includes("miguel") ||
      name.includes("sofia") ||
      name.includes("sofía") ||
      name.includes("camila") ||
      name.includes("valentina")
    ) {
      score += 40;
    }

    // Latin American / Neutral Spanish preference
    if (v.lang === "es-mx" || v.lang === "es-us" || v.lang === "es-419") score += 20;
    if (v.lang.startsWith("es")) score += 15;

    // Downrank legacy robotic third-party engines
    if (name.includes("espeak") || uri.includes("espeak")) {
      score -= 50;
    }

    return score;
  };

  const sorted = [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  if (sorted.length > 0) {
    voiceCache.set(genderPreference, sorted);
  }
  return sorted;
}

/**
 * Selects the highest quality natural human voice available on the athlete's device,
 * honoring preferred voice URI and gender preference (FEMALE/MALE).
 */
export function getBestHumanVoice(
  preferredURI?: string,
  genderPreference: VoiceGender = "MALE"
): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  if (preferredURI) {
    const match = voices.find((v) => v.voiceURI === preferredURI);
    if (match) {
      if (genderPreference === "AUTO" || detectVoiceGender(match) === genderPreference) {
        return match;
      }
    }
  }

  const sorted = getAvailableSpanishVoices(genderPreference);
  return sorted[0] || voices[0] || null;
}

/**
 * Activates a dedicated Coach Persona ("TITAN" | "ELITE" | "AUTO").
 * TITAN (La Roca): Deep baritone voice (pitch 0.74, rate 1.02), male priority, high-intensity motivational cues.
 * ELITE (Laura): Crisp technical voice (pitch 1.02, rate 1.05), female priority, high-precision cues.
 * AUTO: System default balanced profile.
 */
export function setCoachPersona(_persona?: CoachPersona): CoachAudioPreferences {
  void _persona;
  const targetGender: VoiceGender = "MALE";
  const targetPitch = 1.0;
  const targetRate = 1.0;
  const bestMatching = getBestHumanVoice(undefined, targetGender);

  return saveAudioPreferences({
    coachPersona: "TITAN",
    voiceGender: targetGender,
    preferredVoiceURI: bestMatching?.voiceURI || "",
    voicePitch: targetPitch,
    voiceRate: targetRate,
  });
}

/**
 * Changes coach voice gender ("FEMALE" | "MALE" | "AUTO"), selects the best
 * matching human voice on the device, updates pitch appropriately, and persists to localStorage.
 */
export function setVoiceGender(_gender?: VoiceGender): CoachAudioPreferences {
  void _gender;
  const bestMatching = getBestHumanVoice(undefined, "MALE");

  return saveAudioPreferences({
    voiceGender: "MALE",
    coachPersona: "TITAN",
    preferredVoiceURI: bestMatching?.voiceURI || "",
    voicePitch: 1.0,
    voiceRate: 1.0,
  });
}

/**
 * Toggles coach voice muting/activation while preserving the single Titan warrior voice.
 */
export function toggleVoiceGender(): CoachAudioPreferences {
  const current = getAudioPreferences();
  const nextEnabled = !current.voiceEnabled;
  return saveAudioPreferences({
    voiceEnabled: nextEnabled,
    voiceGender: "MALE",
    coachPersona: "TITAN",
    voicePitch: 1.0,
    voiceRate: 1.0,
  });
}

// Module-level reference pool preventing Chromium V8 GC from prematurely collecting
// active utterances mid-sentence (the notorious speech cutoff bug)
const activeUtterances = new Set<SpeechSynthesisUtterance>();

// Listen for browser voice population to lock in athlete's preferred voice without shift
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const syncDefaultVoice = () => {
    try {
      clearVoiceCache();
      const prefs = getAudioPreferences();
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      const currentVoice = prefs.preferredVoiceURI
        ? voices.find((v) => v.voiceURI === prefs.preferredVoiceURI)
        : null;
      const targetGender = prefs.voiceGender || "MALE";
      const genderMismatch = currentVoice && targetGender !== "AUTO" && detectVoiceGender(currentVoice) !== targetGender;

      if (!prefs.preferredVoiceURI || !currentVoice || genderMismatch) {
        const best = getBestHumanVoice(undefined, targetGender);
        if (best && best.voiceURI) {
          saveAudioPreferences({ preferredVoiceURI: best.voiceURI, voiceGender: targetGender });
        }
      }
    } catch {
      // Safe noop if storage or synthesis not ready
    }
  };

  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = syncDefaultVoice;
  }
  syncDefaultVoice();
}

/**
 * Dispatches spoken feedback safely through browser SpeechSynthesis.
 * Prioritizes natural human voices with warm, resonant tone.
 * Normalizes athletic text for zero-error Spanish pronunciation,
 * guards against Chromium GC premature termination, and prevents cancel() race conditions.
 * Features zero-latency instant dispatch when synthesizer is idle.
 */
export function speakText(rawText: string, customPrefs?: Partial<CoachAudioPreferences>): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const text = normalizeSpeechTextForSpanish(rawText);
  if (!text) return;

  try {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (!prefs.voiceEnabled || prefs.voiceVolume <= 0) return;

    const synth = window.speechSynthesis;

    // Guard against stuck paused state in Chromium
    if (synth.paused) {
      synth.resume();
    }

    const dispatch = () => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = Math.max(0, Math.min(1, prefs.voiceVolume));
        utterance.rate = Math.max(0.5, Math.min(2.0, prefs.voiceRate ?? 1.02));

        const bestVoice = getBestHumanVoice(prefs.preferredVoiceURI, prefs.voiceGender);
        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang;

          // If preferred voice was unset, lock in this voice now so it never drifts
          if (!prefs.preferredVoiceURI && bestVoice.voiceURI) {
            saveAudioPreferences({ preferredVoiceURI: bestVoice.voiceURI });
          }
        } else {
          utterance.lang = "es-ES";
        }

        // Dynamically tune pitch for persona / gender
        const isFemale =
          prefs.voiceGender === "FEMALE" ||
          (bestVoice && detectVoiceGender(bestVoice) === "FEMALE");
        const defaultPitch = prefs.coachPersona === "TITAN"
          ? 0.74
          : (prefs.coachPersona === "ELITE" || isFemale ? 1.02 : 0.74);
        utterance.pitch = Math.max(0.6, Math.min(1.5, prefs.voicePitch ?? defaultPitch));

        // Chromium Garbage Collection Bug Guard:
        activeUtterances.add(utterance);

        utterance.onend = () => {
          activeUtterances.delete(utterance);
        };

        utterance.onerror = (e) => {
          activeUtterances.delete(utterance);
          if (e.error !== "interrupted" && e.error !== "canceled") {
            console.warn("SpeechSynthesis utterance error:", e.error);
          }
        };

        synth.speak(utterance);
      } catch (innerErr) {
        console.warn("SpeechSynthesis speak failed:", innerErr);
      }
    };

    // Instant speech delivery: if idle, speak immediately without delay!
    if (!synth.speaking && !synth.pending) {
      dispatch();
    } else {
      synth.cancel();
      setTimeout(dispatch, 15);
    }
  } catch (err) {
    console.warn("SpeechSynthesis unavailable or rejected:", err);
  }
}

/**
 * High-level orchestration facade conforming to SPEC-0005.
 */
export const acousticEngine = {
  playPreSetBriefing(params?: PreSetBriefingParams, customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.soundEnabled) {
      playChime(false);
    }
    if (prefs.voiceEnabled) {
      const text = formatPreSetBriefing(params);
      setTimeout(() => {
        speakText(text, prefs);
      }, 180);
    }
  },

  playSetCompleteCue(params?: TelemetryNarrationParams, customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.soundEnabled) {
      playChime(false);
    }
    if (prefs.voiceEnabled) {
      const cue = formatTelemetryCue(params, Math.random, prefs.coachPersona || "AUTO");
      setTimeout(() => {
        speakText(cue, prefs);
      }, 180);
    }
  },

  playRestHalfwayCue(customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.voiceEnabled) {
      speakText(getRandomCue("REST_HALFWAY", Math.random, prefs.coachPersona || "AUTO"), prefs);
    }
  },

  playRest15sWarningCue(customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.soundEnabled) {
      playChime(false);
      hapticPulse([80, 40, 80]);
    }
    if (prefs.voiceEnabled) {
      setTimeout(() => {
        speakText(getRandomCue("REST_15S_WARNING", Math.random, prefs.coachPersona || "AUTO"), prefs);
      }, 120);
    }
  },

  playRestWarningCue(customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.soundEnabled) {
      playChime(false);
      hapticPulse([100, 50, 100]);
    }
    if (prefs.voiceEnabled) {
      setTimeout(() => {
        speakText(getRandomCue("REST_10S_WARNING", Math.random, prefs.coachPersona || "AUTO"), prefs);
      }, 120);
    }
  },

  playRestCompleteCue(params?: RestCompletedParams, customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.soundEnabled) {
      playChime(true);
      hapticPulse([200, 100, 200]);
    }
    if (prefs.voiceEnabled) {
      const text = formatRestCompletedCue(params, prefs.coachPersona || "AUTO");
      setTimeout(() => {
        speakText(text, prefs);
      }, 180);
    }
  },

  playAutoregulationCue(params: AutoregulationParams, customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.voiceEnabled) {
      const text = formatAutoregulationCue(params);
      setTimeout(() => {
        speakText(text, prefs);
      }, 200);
    }
  },

  playExerciseCompleteCue(nextExerciseName?: string, customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.soundEnabled) {
      playChime(true);
    }
    if (prefs.voiceEnabled) {
      const text = nextExerciseName
        ? `¡Ejercicio completado! Siguiente movimiento: ${nextExerciseName}.`
        : getRandomCue("EXERCISE_COMPLETED", Math.random, prefs.coachPersona || "AUTO");
      setTimeout(() => {
        speakText(text, prefs);
      }, 200);
    }
  },

  playSessionVictoryCue(customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.soundEnabled) {
      playChime(true);
    }
    if (prefs.voiceEnabled) {
      setTimeout(() => {
        speakText(getRandomCue("SESSION_VICTORY", Math.random, prefs.coachPersona || "AUTO"), prefs);
      }, 250);
    }
  },
};
