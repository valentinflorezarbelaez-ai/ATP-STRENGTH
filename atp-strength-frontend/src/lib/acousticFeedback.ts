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
} from "./acousticFeedbackCore.mjs";

export type CoachingEventType =
  | "SET_COMPLETED"
  | "EXERCISE_COMPLETED"
  | "REST_HALFWAY"
  | "REST_15S_WARNING"
  | "REST_10S_WARNING"
  | "REST_COMPLETED"
  | "SESSION_VICTORY";

export interface CoachAudioPreferences {
  soundEnabled: boolean; // Chimes / Web Audio
  voiceEnabled: boolean; // Spoken coaching cues
  voiceVolume: number;   // 0.0 to 1.0
  voiceRate: number;     // 0.8 to 1.3 (default 1.02 for natural delivery)
  voicePitch?: number;   // 0.6 to 1.5 (default 0.92 for warm human chest resonance)
  preferredVoiceURI?: string; // Specific voice chosen by athlete
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

/**
 * Returns available Spanish voices sorted by natural human quality.
 */
export function getAvailableSpanishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const allVoices = window.speechSynthesis.getVoices();
  const spanish = allVoices.filter((v) => v.lang.startsWith("es"));
  const pool = spanish.length > 0 ? spanish : allVoices;

  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    const name = v.name.toLowerCase();
    const uri = v.voiceURI.toLowerCase();
    let score = 0;

    // Highest priority: Neural / Natural / Studio / Enhanced
    if (name.includes("natural") || uri.includes("natural")) score += 120;
    if (name.includes("neural") || uri.includes("neural")) score += 120;
    if (name.includes("enhanced") || uri.includes("enhanced")) score += 90;
    if (name.includes("online") || uri.includes("online")) score += 60;
    if (name.includes("google") || uri.includes("google")) score += 50;

    // Warm, resonant human coach voice names
    if (
      name.includes("pablo") ||
      name.includes("jorge") ||
      name.includes("alvaro") ||
      name.includes("carlos") ||
      name.includes("juan") ||
      name.includes("diego") ||
      name.includes("miguel")
    ) {
      score += 40;
    }

    // Latin American / Neutral Spanish preference
    if (v.lang === "es-mx" || v.lang === "es-us" || v.lang === "es-419") score += 20;
    if (v.lang.startsWith("es")) score += 15;

    // Downrank legacy robotic SAPI / desktop synthesizers
    if (
      name.includes("helena") ||
      name.includes("sabina") ||
      name.includes("desktop") ||
      name.includes("espeak") ||
      uri.includes("desktop")
    ) {
      score -= 30;
    }

    return score;
  };

  return [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

/**
 * Selects the highest quality natural human voice available on the athlete's device.
 */
export function getBestHumanVoice(preferredURI?: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  if (preferredURI) {
    const match = voices.find((v) => v.voiceURI === preferredURI);
    if (match) return match;
  }

  const sorted = getAvailableSpanishVoices();
  return sorted[0] || voices[0] || null;
}

/**
 * Dispatches spoken feedback safely through browser SpeechSynthesis.
 * Prioritizes natural human voices with warm, resonant chest tone.
 */
export function speakText(text: string, customPrefs?: Partial<CoachAudioPreferences>): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (!prefs.voiceEnabled || prefs.voiceVolume <= 0) return;

    const synth = window.speechSynthesis;
    // Cancel any previous queued utterance to prevent audio backlog
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = Math.max(0, Math.min(1, prefs.voiceVolume));
    utterance.rate = Math.max(0.5, Math.min(2.0, prefs.voiceRate ?? 1.0));
    utterance.pitch = Math.max(0.6, Math.min(1.5, prefs.voicePitch ?? 0.92));

    const bestVoice = getBestHumanVoice(prefs.preferredVoiceURI);
    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang = "es-ES";
    }

    synth.speak(utterance);
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
