"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  deriveRemainingMs,
  pauseAbsoluteTimer,
  resumeAbsoluteTimer,
  startAbsoluteTimer,
  tickAbsoluteTimer,
  triggerPhaseCompleteHaptic,
} from "@/lib/atpTimerEngine.mjs";
import { disposeZenAudio, playChime } from "@/lib/zenAudio";

type AbsoluteSession = {
  phase: string;
  durationMs: number;
  targetTimestamp: number | null;
  pausedRemainingMs: number | null;
  status: string;
  isHardwareVibrationTriggered: boolean;
  timeRemainingMs?: number;
};

/**
 * High-precision ATP timer — SPEC-0001 target-timestamp drift protection.
 * Remaining = max(0, targetTimestamp - Date.now()); no decrement-by-one ticks.
 * Integrates Media Session API & Web Notifications for zero-latency background recovery.
 */
export function useAtpTimer(initialSeconds = 180) {
  const [timerDuration, setTimerDuration] = useState(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [timerTitle, setTimerTitle] = useState("Resíntesis de ATP-PCr");
  const sessionRef = useRef<AbsoluteSession | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    return () => {
      disposeZenAudio();
    };
  }, []);

  // Synchronize document title with remaining countdown for instant tab visibility
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isRunning && remainingSeconds > 0) {
      document.title = `(${remainingSeconds}s) ${timerTitle} • NEURO//STRENGTH`;
    } else {
      document.title = "NEURO//STRENGTH - ATP Zen Engine";
    }
  }, [isRunning, remainingSeconds, timerTitle]);

  const handleStartTimer = useCallback((duration: number, title = "Resíntesis de ATP-PCr") => {
    const durationMs = Math.max(1, Math.round(duration * 1000));
    const session = startAbsoluteTimer({
      durationMs,
      phase: "ATP_CHARGE",
      now: Date.now(),
    }) as AbsoluteSession;
    sessionRef.current = session;
    completedRef.current = false;
    setTimerTitle(title);
    setTimerDuration(duration);
    setRemainingSeconds(duration);
    setIsRunning(true);

    // Request notification permission smoothly on first explicit timer start
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      void Notification.requestPermission();
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    const session = sessionRef.current;
    if (!session) {
      setIsRunning((v) => !v);
      return;
    }
    if (isRunning) {
      const paused = pauseAbsoluteTimer(session, Date.now()) as AbsoluteSession;
      sessionRef.current = paused;
      setRemainingSeconds(Math.ceil(deriveRemainingMs(paused) / 1000));
      setIsRunning(false);
    } else {
      const resumed = resumeAbsoluteTimer(session, Date.now()) as AbsoluteSession;
      sessionRef.current = resumed;
      setIsRunning(resumed.status === "RUNNING");
      if (resumed.status === "COMPLETE") {
        setRemainingSeconds(0);
        triggerPhaseCompleteHaptic();
        playChime(false);
      }
    }
  }, [isRunning]);

  const handleResetTimer = useCallback(() => {
    sessionRef.current = null;
    setIsRunning(false);
    setRemainingSeconds(timerDuration);
  }, [timerDuration]);

  const skipRest = useCallback(() => {
    sessionRef.current = null;
    setIsRunning(false);
    setRemainingSeconds(0);
  }, []);

  // Synchronize with OS Media Session API (iOS lock screen & Android notification bar)
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

    if (isRunning) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `Resíntesis ATP: ${remainingSeconds}s`,
          artist: "NEURO//STRENGTH",
          album: timerTitle,
          artwork: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          ],
        });

        navigator.mediaSession.setActionHandler("play", () => {
          togglePlayPause();
        });
        navigator.mediaSession.setActionHandler("pause", () => {
          togglePlayPause();
        });
        navigator.mediaSession.setActionHandler("nexttrack", () => {
          skipRest();
        });
      } catch {
        // ignore
      }
    } else {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      } catch {
        // ignore
      }
    }
  }, [isRunning, remainingSeconds, timerTitle, togglePlayPause, skipRest]);

  useEffect(() => {
    if (!isRunning || !sessionRef.current) return undefined;

    completedRef.current = false;
    const id = setInterval(() => {
      const session = sessionRef.current;
      if (!session) return;
      const tick = tickAbsoluteTimer(session, Date.now()) as AbsoluteSession;
      sessionRef.current = tick;
      const secs = Math.ceil((tick.timeRemainingMs ?? 0) / 1000);
      setRemainingSeconds(secs);

      if (tick.status === "COMPLETE" && !completedRef.current) {
        completedRef.current = true;
        setIsRunning(false);
        triggerPhaseCompleteHaptic();
        playChime(false);

        // System notification if athlete minimized tab or locked screen
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted" &&
          document.visibilityState === "hidden"
        ) {
          try {
            new Notification("¡Resíntesis de ATP Completada!", {
              body: "Tu sistema neuromuscular y fosfocreatina están al 100%. ¡Listo para la siguiente serie!",
              icon: "/icon-192.png",
              silent: false,
            });
          } catch {
            // ignore
          }
        }
      }
    }, 250);

    return () => clearInterval(id);
  }, [isRunning]);

  const progressPercent =
    timerDuration > 0 ? ((timerDuration - remainingSeconds) / timerDuration) * 100 : 0;
  const strokeDashoffset = 565.48 - (565.48 * progressPercent) / 100;
  const atpSaturationPercent = Math.min(
    100,
    Math.round(((timerDuration - remainingSeconds) / Math.max(timerDuration, 1)) * 100)
  );

  return {
    timerDuration,
    setTimerDuration,
    remainingSeconds,
    setRemainingSeconds,
    isRunning,
    setIsRunning,
    timerTitle,
    handleStartTimer,
    togglePlayPause,
    handleResetTimer,
    skipRest,
    progressPercent,
    strokeDashoffset,
    atpSaturationPercent,
  };
}
