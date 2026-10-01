/**
 * Neuro-Acoustic Biofeedback & Speech Coaching Engine (SPEC-0005)
 * Combines pure domain logic with browser-native Web Audio API and SpeechSynthesis.
 * Zero external dependencies.
 */

import { playChime, hapticPulse } from "./zenAudio";
import {
  COACH_CUES as CORE_COACH_CUES,
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
  scoreCoachVoice as coreScoreCoachVoice,
  pickBestCoachVoice as corePickBestCoachVoice,
  resolveDisplayedVoiceGender as coreResolveDisplayedVoiceGender,
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

export interface CoachAudioPreferences {
  soundEnabled: boolean; // Chimes / Web Audio
  voiceEnabled: boolean; // Spoken coaching cues
  voiceVolume: number;   // 0.0 to 1.0
  voiceRate: number;     // 0.8 to 1.3 (default 1.02 for natural delivery)
  voicePitch?: number;   // 0.6 to 1.5 (default 0.92 for warm human chest resonance, 1.02 for female)
  preferredVoiceURI?: string; // Specific voice chosen by athlete
  voiceGender?: VoiceGender;  // "AUTO" | "FEMALE" | "MALE"
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
export const COACH_VOICE_CHANGED_EVENT = "atp-coach-voice-changed";

function emitVoicePrefs(updated: CoachAudioPreferences): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(COACH_VOICE_CHANGED_EVENT, { detail: updated }));
}

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
  emitVoicePrefs(updated);
  return updated;
}

export function getRandomCue(type: CoachingEventType, rng?: () => number): string {
  return coreGetRandomCue(type, rng);
}

export function formatTelemetryCue(params?: TelemetryNarrationParams, rng?: () => number): string {
  return coreFormatTelemetryCue(params, rng);
}

export function formatBarbellPlatesSpoken(weightKg: number, barWeight = 20, isBodyweight = false): string {
  return coreFormatBarbellPlatesSpoken(weightKg, barWeight, isBodyweight);
}

export function formatPreSetBriefing(params?: PreSetBriefingParams): string {
  return coreFormatPreSetBriefing(params);
}

export function formatRestCompletedCue(params?: RestCompletedParams): string {
  return coreFormatRestCompletedCue(params);
}

export function formatAutoregulationCue(params?: AutoregulationParams): string {
  return coreFormatAutoregulationCue(params);
}

export function detectVoiceGender(
  voice: SpeechSynthesisVoice | { name?: string; voiceURI?: string } | null | undefined
): VoiceGender {
  return coreDetectVoiceGender(voice);
}

export function scoreCoachVoice(
  voice: SpeechSynthesisVoice | { name?: string; voiceURI?: string; lang?: string } | null | undefined,
  genderPreference: VoiceGender = "AUTO"
): number {
  return coreScoreCoachVoice(voice, genderPreference);
}

export function resolveDisplayedVoiceGender(
  prefs?: Partial<CoachAudioPreferences> | null,
  voice?: SpeechSynthesisVoice | { name?: string; voiceURI?: string } | null
): VoiceGender {
  return coreResolveDisplayedVoiceGender(prefs || {}, voice || null);
}

/**
 * Returns available Spanish voices sorted by natural human quality,
 * with optional gender weighting (FEMALE or MALE priority).
 */
export function getAvailableSpanishVoices(genderPreference: VoiceGender = "AUTO"): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const allVoices = window.speechSynthesis.getVoices();
  const spanish = allVoices.filter((v) => v.lang.startsWith("es"));
  const pool = spanish.length > 0 ? spanish : allVoices;
  return [...pool].sort(
    (a, b) => scoreCoachVoice(b, genderPreference) - scoreCoachVoice(a, genderPreference)
  );
}

/**
 * Selects the highest quality natural human voice available on the athlete's device,
 * honoring preferred voice URI and gender preference (FEMALE/MALE).
 */
export function getBestHumanVoice(
  preferredURI?: string,
  genderPreference: VoiceGender = "AUTO"
): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return corePickBestCoachVoice(voices, preferredURI, genderPreference);
}

/**
 * Changes coach voice gender ("FEMALE" | "MALE" | "AUTO"), selects the best
 * matching human voice on the device, updates pitch appropriately, and persists to localStorage.
 */
export function setVoiceGender(gender: VoiceGender): CoachAudioPreferences {
  const bestMatching = getBestHumanVoice(undefined, gender);
  let adaptedPitch = 1.0;
  switch (gender) {
    case "FEMALE":
      adaptedPitch = 1.02;
      break;
    case "MALE":
      adaptedPitch = 0.92;
      break;
    case "AUTO":
      adaptedPitch = 1.0;
      break;
    default: {
      const _exhaustive: never = gender;
      return _exhaustive;
    }
  }

  return saveAudioPreferences({
    voiceGender: gender,
    preferredVoiceURI: bestMatching?.voiceURI || "",
    voicePitch: adaptedPitch,
  });
}

/**
 * Toggles coach voice between FEMALE and MALE at will.
 */
export function toggleVoiceGender(): CoachAudioPreferences {
  const current = getAudioPreferences();
  const nextGender: VoiceGender = current.voiceGender === "FEMALE" ? "MALE" : "FEMALE";
  return setVoiceGender(nextGender);
}

// Module-level reference pool preventing Chromium V8 GC from prematurely collecting
// active utterances mid-sentence (the notorious speech cutoff bug)
const activeUtterances = new Set<SpeechSynthesisUtterance>();

// Listen for browser voice population to lock in athlete's preferred voice without shift
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const syncDefaultVoice = () => {
    try {
      const prefs = getAudioPreferences();
      if (!prefs.preferredVoiceURI) {
        const best = getBestHumanVoice(undefined, prefs.voiceGender || "AUTO");
        if (best && best.voiceURI) {
          saveAudioPreferences({ preferredVoiceURI: best.voiceURI });
        }
      }
    } catch {
      // Safe noop if storage or synthesis not ready
    }
  };

  if (typeof window.speechSynthesis.addEventListener === "function") {
    window.speechSynthesis.addEventListener("voiceschanged", syncDefaultVoice);
  } else if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = syncDefaultVoice;
  }
  syncDefaultVoice();
}

/**
 * Dispatches spoken feedback safely through browser SpeechSynthesis.
 * Prioritizes natural human voices with warm, resonant tone.
 * Normalizes athletic text for zero-error Spanish pronunciation,
 * guards against Chromium GC premature termination, and prevents cancel() race conditions.
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

    // Cancel previous utterance to prevent audio backlog
    synth.cancel();

    // Use a small 25ms timeout so synth.cancel() completes its internal buffer cleanup in WebKit/Chromium
    setTimeout(() => {
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

        // Dynamically tune pitch if user hasn't explicitly overridden it
        const isFemale =
          prefs.voiceGender === "FEMALE" ||
          (bestVoice && detectVoiceGender(bestVoice) === "FEMALE");
        const defaultPitch = isFemale ? 1.02 : 0.92;
        utterance.pitch = Math.max(0.6, Math.min(1.5, prefs.voicePitch ?? defaultPitch));

        // Chromium Garbage Collection Bug Guard:
        // SpeechSynthesisUtterance gets garbage-collected if no active reference is held,
        // causing speech to abruptly cut off mid-sentence.
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
    }, 25);
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
      }, 300);
    }
  },

  playSetCompleteCue(params?: TelemetryNarrationParams, customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.soundEnabled) {
      playChime(false);
    }
    if (prefs.voiceEnabled) {
      const cue = formatTelemetryCue(params);
      setTimeout(() => {
        speakText(cue, prefs);
      }, 350);
    }
  },

  playRestHalfwayCue(customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.voiceEnabled) {
      speakText(getRandomCue("REST_HALFWAY"), prefs);
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
        speakText(getRandomCue("REST_15S_WARNING"), prefs);
      }, 200);
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
        speakText(getRandomCue("REST_10S_WARNING"), prefs);
      }, 250);
    }
  },

  playRestCompleteCue(params?: RestCompletedParams, customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.soundEnabled) {
      playChime(true);
      hapticPulse([200, 100, 200]);
    }
    if (prefs.voiceEnabled) {
      const text = formatRestCompletedCue(params);
      setTimeout(() => {
        speakText(text, prefs);
      }, 350);
    }
  },

  playAutoregulationCue(params: AutoregulationParams, customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.voiceEnabled) {
      const text = formatAutoregulationCue(params);
      setTimeout(() => {
        speakText(text, prefs);
      }, 400);
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
        : getRandomCue("EXERCISE_COMPLETED");
      setTimeout(() => {
        speakText(text, prefs);
      }, 400);
    }
  },

  playSessionVictoryCue(customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.soundEnabled) {
      playChime(true);
    }
    if (prefs.voiceEnabled) {
      setTimeout(() => {
        speakText(getRandomCue("SESSION_VICTORY"), prefs);
      }, 500);
    }
  },
};
