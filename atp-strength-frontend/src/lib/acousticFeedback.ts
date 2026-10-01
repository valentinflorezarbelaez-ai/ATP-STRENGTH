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
  pickBestVoice as corePickBestVoice,
  scoreSpanishVoice as coreScoreSpanishVoice,
  resolveSpokenDelivery,
  humanVoiceRank,
  voiceSwitchCue as coreVoiceSwitchCue,
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
  voiceRate: number;     // 0.5 to 2.0 (0.96 is the human pace for a neural voice)
  voicePitch?: number;   // 1 keeps neural voices intact; other values are an explicit choice
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

export function detectVoiceGender(
  voice: SpeechSynthesisVoice | { name?: string; voiceURI?: string; lang?: string } | null | undefined
): VoiceGender {
  return coreDetectVoiceGender(voice);
}

export function voiceSwitchCue(gender: VoiceGender): string {
  return coreVoiceSwitchCue(gender);
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
    (a, b) => coreScoreSpanishVoice(b, genderPreference) - coreScoreSpanishVoice(a, genderPreference)
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
  if (voices.length === 0) return null;

  const spanish = voices.filter((v) => v.lang.startsWith("es"));
  const pool = spanish.length > 0 ? spanish : voices;
  return (corePickBestVoice(pool, {
    preferredURI,
    gender: genderPreference,
  }) || voices[0] || null) as SpeechSynthesisVoice | null;
}

/**
 * Changes coach voice gender ("FEMALE" | "MALE" | "AUTO"), selects the best
 * matching human voice on the device, updates pitch appropriately, and persists to localStorage.
 */
export function setVoiceGender(gender: VoiceGender): CoachAudioPreferences {
  const bestMatching = getBestHumanVoice(undefined, gender);

  return saveAudioPreferences({
    voiceGender: gender,
    preferredVoiceURI: bestMatching?.voiceURI || "",
    voicePitch: 1,
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

const VOICE_GENDER_CYCLE: VoiceGender[] = ["AUTO", "FEMALE", "MALE"];

/**
 * Cycles Auto → Mujer → Hombre → Auto and locks the best matching voice.
 */
export function cycleVoiceGender(): CoachAudioPreferences {
  const current = getAudioPreferences();
  const index = VOICE_GENDER_CYCLE.indexOf(current.voiceGender || "AUTO");
  const nextGender = VOICE_GENDER_CYCLE[(index + 1) % VOICE_GENDER_CYCLE.length];
  return setVoiceGender(nextGender);
}

// Module-level reference pool preventing Chromium V8 GC from prematurely collecting
// active utterances mid-sentence (the notorious speech cutoff bug)
const activeUtterances = new Set<SpeechSynthesisUtterance>();

let speakToken = 0;
let pendingSpeak: { text: string; prefs?: Partial<CoachAudioPreferences> } | null = null;
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
let remoteVoiceProbeDone = false;
let remoteVoiceProbeTimer: ReturnType<typeof setTimeout> | null = null;

function stopKeepAlive(): void {
  if (keepAliveTimer !== null) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

// Chromium stops SpeechSynthesis after ~15s unless the queue is nudged.
function armKeepAlive(synth: SpeechSynthesis, token: number): void {
  stopKeepAlive();
  keepAliveTimer = setInterval(() => {
    if (token !== speakToken) {
      stopKeepAlive();
      return;
    }
    if (!synth.speaking) {
      stopKeepAlive();
      return;
    }
    if (!synth.paused) {
      synth.pause();
      synth.resume();
    }
  }, 10000);
}

function bestLoadedVoiceRank(): number {
  return humanVoiceRank(getBestHumanVoice(undefined, "AUTO"));
}

function syncDefaultVoice(): void {
  try {
    if (bestLoadedVoiceRank() >= 3) {
      remoteVoiceProbeDone = true;
      if (remoteVoiceProbeTimer !== null) {
        clearTimeout(remoteVoiceProbeTimer);
        remoteVoiceProbeTimer = null;
      }
    }
    const voicesReady = window.speechSynthesis.getVoices().length > 0;
    if (pendingSpeak && voicesReady && (remoteVoiceProbeDone || bestLoadedVoiceRank() >= 3)) {
      const job = pendingSpeak;
      pendingSpeak = null;
      speakText(job.text, job.prefs);
    }
  } catch {
    // Safe noop if storage or synthesis not ready
  }
}

// Listen for browser voice population to lock in athlete's preferred voice without shift
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener("voiceschanged", syncDefaultVoice);
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
    const token = ++speakToken;
    stopKeepAlive();

    const loadedRank = synth.getVoices().length === 0 ? 0 : bestLoadedVoiceRank();
    const waitingForHumanVoice = loadedRank < 3 && !remoteVoiceProbeDone;
    if (synth.getVoices().length === 0 || waitingForHumanVoice) {
      pendingSpeak = { text: rawText, prefs: customPrefs };
      if (waitingForHumanVoice && remoteVoiceProbeTimer === null) {
        remoteVoiceProbeTimer = setTimeout(() => {
          remoteVoiceProbeTimer = null;
          remoteVoiceProbeDone = true;
          if (!pendingSpeak) return;
          const job = pendingSpeak;
          pendingSpeak = null;
          speakText(job.text, job.prefs);
        }, 700);
      }
      return;
    }

    // Guard against stuck paused state in Chromium
    if (synth.paused) {
      synth.resume();
    }

    // Cancel previous utterance to prevent audio backlog
    synth.cancel();

    // Chromium drops speak() if it follows cancel() immediately.
    setTimeout(() => {
      if (token !== speakToken) return;
      try {
        if (synth.getVoices().length === 0) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = Math.max(0, Math.min(1, prefs.voiceVolume));

        const bestVoice = getBestHumanVoice(undefined, "AUTO");
        const delivery = resolveSpokenDelivery(bestVoice, prefs);
        utterance.rate = delivery.rate;
        utterance.pitch = delivery.pitch;

        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang.startsWith("es") ? bestVoice.lang : "es-MX";
        } else {
          utterance.lang = "es-MX";
        }

        // Chromium Garbage Collection Bug Guard:
        // SpeechSynthesisUtterance gets garbage-collected if no active reference is held,
        // causing speech to abruptly cut off mid-sentence.
        activeUtterances.add(utterance);

        utterance.onend = () => {
          activeUtterances.delete(utterance);
          if (token === speakToken) stopKeepAlive();
        };

        utterance.onerror = (e) => {
          activeUtterances.delete(utterance);
          if (token === speakToken) stopKeepAlive();
          if (e.error !== "interrupted" && e.error !== "canceled") {
            console.warn("SpeechSynthesis utterance error:", e.error);
          }
        };

        pendingSpeak = null;
        synth.speak(utterance);
        armKeepAlive(synth, token);
      } catch (innerErr) {
        console.warn("SpeechSynthesis speak failed:", innerErr);
      }
    }, 80);
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
