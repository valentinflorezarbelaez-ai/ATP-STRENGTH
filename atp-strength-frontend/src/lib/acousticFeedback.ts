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
  applyCoachVoiceProfile,
  latamVoiceBonus,
  COACH_VOICE_PROFILE_ID,
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
  voiceRate: number;     // 0.8 to 1.3 (default 1.0 for natural delivery)
  voicePitch?: number;   // 0.6 to 1.5 (1.0 natural female, 0.92 male chest)
  preferredVoiceURI?: string; // Specific voice chosen by athlete
  voiceGender?: VoiceGender;  // "AUTO" | "FEMALE" | "MALE"
  voiceProfileId?: string; // Coach voice generation; bumps retarget the default voice
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
    const parsed = JSON.parse(raw) as Partial<CoachAudioPreferences>;
    const updated = applyCoachVoiceProfile(parsed);
    if (parsed?.voiceProfileId !== COACH_VOICE_PROFILE_ID) {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
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

export function detectVoiceGender(
  voice: SpeechSynthesisVoice | { name?: string; voiceURI?: string } | null | undefined
): VoiceGender {
  return coreDetectVoiceGender(voice);
}

/**
 * Returns available Spanish voices sorted by natural human quality,
 * with optional gender weighting (FEMALE or MALE priority).
 */
export function getAvailableSpanishVoices(genderPreference: VoiceGender = "AUTO"): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const allVoices = window.speechSynthesis.getVoices();
  const spanish = allVoices.filter((v) => (v.lang || "").toLowerCase().startsWith("es"));
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
    }

    // Highest priority: Neural / Natural / Studio / Enhanced
    if (name.includes("natural") || uri.includes("natural")) score += 120;
    if (name.includes("neural") || uri.includes("neural")) score += 120;
    if (name.includes("enhanced") || uri.includes("enhanced")) score += 90;
    if (name.includes("online") || uri.includes("online")) score += 60;
    if (name.includes("google") || uri.includes("google")) score += 50;

    // Warm, resonant human coach voice names (both male and female elite models)
    if (
      name.includes("pablo") ||
      name.includes("jorge") ||
      name.includes("alvaro") ||
      name.includes("carlos") ||
      name.includes("juan") ||
      name.includes("diego") ||
      name.includes("miguel") ||
      name.includes("paloma") ||
      name.includes("dalia") ||
      name.includes("elvira") ||
      name.includes("laura") ||
      name.includes("paulina") ||
      name.includes("monica") ||
      name.includes("mónica") ||
      name.includes("sofia") ||
      name.includes("sofía") ||
      name.includes("camila") ||
      name.includes("valentina")
    ) {
      score += 40;
    }

    const lang = (v.lang || "").toLowerCase();
    if (lang.startsWith("es")) score += 15;
    score += latamVoiceBonus(v);

    // Downrank legacy robotic SAPI / desktop synthesizers ONLY when not neural/natural
    if (!name.includes("natural") && !name.includes("neural")) {
      if (
        name.includes("desktop") ||
        name.includes("espeak") ||
        uri.includes("desktop")
      ) {
        score -= 40;
      }
    }

    return score;
  };

  return [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a));
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
  if (voices.length === 0) return null;

  if (preferredURI) {
    const match = voices.find((v) => v.voiceURI === preferredURI);
    if (match) {
      // If athlete didn't restrict gender or the preferred voice matches the requested gender, use it!
      if (genderPreference === "AUTO" || detectVoiceGender(match) === genderPreference) {
        return match;
      }
    }
  }

  const sorted = getAvailableSpanishVoices(genderPreference);
  return sorted[0] || voices[0] || null;
}

/**
 * Changes coach voice gender ("FEMALE" | "MALE" | "AUTO"), selects the best
 * matching human voice on the device, updates pitch appropriately, and persists to localStorage.
 */
export function setVoiceGender(gender: VoiceGender): CoachAudioPreferences {
  const bestMatching = getBestHumanVoice(undefined, gender);
  const adaptedPitch = gender === "FEMALE" ? 1.0 : 0.92;

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
          utterance.lang = "es-US";
        }

        // Dynamically tune pitch if user hasn't explicitly overridden it
        const isFemale =
          prefs.voiceGender === "FEMALE" ||
          (bestVoice && detectVoiceGender(bestVoice) === "FEMALE");
        const defaultPitch = isFemale ? 1.0 : 0.92;
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
