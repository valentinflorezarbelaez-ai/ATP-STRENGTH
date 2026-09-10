"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Screen Wake Lock hook conforming to W3C Screen Wake Lock API.
 * Keeps the gym athlete's screen active during rest cycles and heavy sets,
 * preventing screen timeout or sleep while setting up on the rack.
 * Automatically re-acquires on document visibility recovery without causing
 * React cascading re-renders.
 */
export function useWakeLock(active = true) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  const requestLock = useCallback(async () => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    try {
      if (!sentinelRef.current) {
        sentinelRef.current = await navigator.wakeLock.request("screen");
        sentinelRef.current.addEventListener("release", () => {
          sentinelRef.current = null;
        });
      }
    } catch {
      // Ignored: browser may reject in battery saver mode or low battery
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (sentinelRef.current) {
      try {
        await sentinelRef.current.release();
      } catch {
        // ignore
      }
      sentinelRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (active) {
      void requestLock();
    } else {
      void releaseLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && active) {
        void requestLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void releaseLock();
    };
  }, [active, requestLock, releaseLock]);

  return { requestLock, releaseLock };
}
