"use client";

import { useEffect, useState } from "react";
import { playChime } from "@/lib/zenAudio";

/** ATP-PCr countdown timer with 528Hz completion cue. */
export function useAtpTimer(initialSeconds = 180) {
  const [timerDuration, setTimerDuration] = useState(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [timerTitle, setTimerTitle] = useState("Resíntesis de ATP-PCr");

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isRunning && remainingSeconds > 0) {
      timer = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playChime(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, remainingSeconds]);

  const handleStartTimer = (duration: number, title = "Resíntesis de ATP-PCr") => {
    setTimerTitle(title);
    setTimerDuration(duration);
    setRemainingSeconds(duration);
    setIsRunning(true);
  };

  const togglePlayPause = () => setIsRunning((v) => !v);

  const handleResetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(timerDuration);
  };

  const skipRest = () => {
    setIsRunning(false);
    setRemainingSeconds(0);
  };

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
