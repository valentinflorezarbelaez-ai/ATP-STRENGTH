/**
 * Zen audio + haptic helpers (528 Hz ATP chime / victory fanfare).
 */

export function playChime(isVictory: boolean = false): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    if (isVictory) {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const startTime = audioCtx.currentTime + idx * 0.12;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.28, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + 1.2);
      });
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([150, 70, 150, 70, 200, 100, 450]);
      }
      return;
    }

    const freqs = [528, 880, 1056];
    const gains = [0.35, 0.14, 0.08];
    const decays = [3.0, 2.2, 1.5];
    freqs.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gains[i], audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + decays[i]);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + decays[i]);
    });
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([300, 150, 300, 150, 500]);
    }
  } catch (err) {
    console.warn("AudioContext or Vibration unavailable:", err);
  }
}

export function hapticPulse(pattern: number | number[]): void {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}
