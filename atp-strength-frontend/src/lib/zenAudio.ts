/**
 * Zen audio + haptic helpers (528 Hz ATP chime / victory fanfare).
 * Owns a reusable AudioContext and closes it on dispose (no leaks).
 * Includes iOS Safari touch-unlock & tactile click fallback.
 */

import {
  PHASE_COMPLETE_VIBRATE_PATTERN,
} from './atpTimerEngine.mjs';

let sharedCtx: AudioContext | null = null;
let isUnlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioCtx();
  }
  if (sharedCtx.state === 'suspended') {
    void sharedCtx.resume();
  }
  return sharedCtx;
}

/**
 * Mobile Safari AudioContext unlocker.
 * Plays a silent 1-frame buffer on the first user interaction
 * so future programmatic audio triggers (timer finish, chimes)
 * are not suspended by iOS autoplay policies.
 */
export function initAudioUnlock(): void {
  if (typeof window === 'undefined' || isUnlocked) return;

  const unlock = () => {
    try {
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          void ctx.resume();
        }
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        isUnlocked = true;
      }
    } catch {
      // ignore
    } finally {
      window.removeEventListener('touchstart', unlock, true);
      window.removeEventListener('touchend', unlock, true);
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('click', unlock, true);
    }
  };

  window.addEventListener('touchstart', unlock, { capture: true, once: true });
  window.addEventListener('touchend', unlock, { capture: true, once: true });
  window.addEventListener('pointerdown', unlock, { capture: true, once: true });
  window.addEventListener('click', unlock, { capture: true, once: true });
}

// Auto-register on client load
if (typeof window !== 'undefined') {
  initAudioUnlock();
}

/** Close shared AudioContext — call from hook unmount. */
export function disposeZenAudio(): void {
  if (sharedCtx && sharedCtx.state !== 'closed') {
    void sharedCtx.close();
  }
  sharedCtx = null;
}

/**
 * Micro sensory tactile click synthesized via Web Audio (65 Hz, 25ms thump).
 * Provides physical sensory feedback on iOS Safari where navigator.vibrate is disabled.
 */
export function playTactileClick(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.025);
  } catch {
    // ignore
  }
}

export function playChime(isVictory: boolean = false): void {
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    if (isVictory) {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const startTime = audioCtx.currentTime + idx * 0.12;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.28, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + 1.2);
      });
      hapticPulse([150, 70, 150, 70, 200, 100, 450]);
      return;
    }

    const freqs = [528, 880, 1056];
    const gains = [0.35, 0.14, 0.08];
    const decays = [3.0, 2.2, 1.5];
    freqs.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gains[i], audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + decays[i]);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + decays[i]);
    });
  } catch (err) {
    console.warn('AudioContext or Vibration unavailable:', err);
  }
}

export function hapticPulse(pattern: number | number[] = [...PHASE_COMPLETE_VIBRATE_PATTERN]): void {
  let vibrated = false;
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    vibrated = Boolean(navigator.vibrate(pattern));
  }
  // If navigator.vibrate didn't trigger (iOS Safari or unsupported desktop), fallback to tactile thump
  if (!vibrated) {
    playTactileClick();
  }
}

/**
 * Plays a short audio cue for cadence and tempo guidance (descent / pause / explode).
 */
export function playTempoTone(
  freq: number,
  durationMs: number = 120,
  type: OscillatorType = "sine",
  volume: number = 0.22
): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const durSec = durationMs / 1000;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durSec);
  } catch {
    // ignore
  }
}
