/**
 * Neuro-Acoustic Biofeedback & Speech Coaching Engine (SPEC-0005)
 * Combines pure domain logic with browser-native Web Audio API and SpeechSynthesis.
 * Zero external dependencies.
 */

import { playChime, hapticPulse } from './zenAudio';
import {
  COACH_CUES as CORE_COACH_CUES,
  DEFAULT_PREFS as CORE_DEFAULT_PREFS,
  getRandomCue as coreGetRandomCue,
  formatTelemetryCue as coreFormatTelemetryCue,
  validateAudioPreferences,
} from './acousticFeedbackCore.mjs';

export type CoachingEventType =
  | 'SET_COMPLETED'
  | 'EXERCISE_COMPLETED'
  | 'REST_HALFWAY'
  | 'REST_10S_WARNING'
  | 'SESSION_VICTORY';

export interface CoachAudioPreferences {
  soundEnabled: boolean; // Chimes / Web Audio
  voiceEnabled: boolean; // Spoken coaching cues
  voiceVolume: number;   // 0.0 to 1.0
  voiceRate: number;     // 0.8 to 1.3 (default 1.05 for energetic delivery)
}

export interface TelemetryNarrationParams {
  exerciseName?: string;
  weightKg?: number;
  reps?: number;
  rpe?: number;
}

export const COACH_CUES = CORE_COACH_CUES as Record<CoachingEventType, string[]>;
export const DEFAULT_PREFS: CoachAudioPreferences = CORE_DEFAULT_PREFS;

const PREFS_STORAGE_KEY = 'atp_coach_audio_prefs';

export function getAudioPreferences(): CoachAudioPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
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
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to persist coach audio preferences:', err);
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

/**
 * Dispatches spoken feedback safely through browser SpeechSynthesis.
 * Resilient against missing API or mobile autoplay restrictions.
 */
export function speakText(text: string, customPrefs?: Partial<CoachAudioPreferences>): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (!prefs.voiceEnabled || prefs.voiceVolume <= 0) return;

    const synth = window.speechSynthesis;
    // Cancel any previous queued utterance to prevent audio backlog
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = Math.max(0, Math.min(1, prefs.voiceVolume));
    utterance.rate = Math.max(0.5, Math.min(2.0, prefs.voiceRate));
    utterance.lang = 'es-ES';

    // Find best matching Spanish voice if available
    const voices = synth.getVoices();
    const spanishVoice = voices.find((v) => v.lang.startsWith('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    synth.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis unavailable or rejected:', err);
  }
}

/**
 * High-level orchestration facade conforming to SPEC-0005.
 */
export const acousticEngine = {
  playSetCompleteCue(params?: TelemetryNarrationParams, customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.soundEnabled) {
      playChime(false);
    }
    if (prefs.voiceEnabled) {
      // 350ms delay lets the instant harmonic chime ring before voice coaching cues in
      const cue = formatTelemetryCue(params);
      setTimeout(() => {
        speakText(cue, prefs);
      }, 350);
    }
  },

  playRestHalfwayCue(customPrefs?: Partial<CoachAudioPreferences>): void {
    const prefs = { ...getAudioPreferences(), ...customPrefs };
    if (prefs.voiceEnabled) {
      speakText(getRandomCue('REST_HALFWAY'), prefs);
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
        speakText(getRandomCue('REST_10S_WARNING'), prefs);
      }, 250);
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
        : getRandomCue('EXERCISE_COMPLETED');
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
        speakText(getRandomCue('SESSION_VICTORY'), prefs);
      }, 500);
    }
  },
};
