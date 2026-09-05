"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushWalQueue, getPendingWalCount } from "@/lib/walSync";

/**
 * FastAPI health + SPEC-0002 WAL flush on reconnect.
 * No synchronous setState in effect bodies (React 19 purity).
 */
export function useBackendWal(apiUrl: string) {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [pendingWalCount, setPendingWalCount] = useState(() => {
    if (typeof window !== "undefined") return getPendingWalCount();
    return 0;
  });
  const onlineRef = useRef<boolean | null>(null);

  const refreshPending = useCallback(() => {
    setPendingWalCount(getPendingWalCount());
  }, []);

  const enqueueFlush = useCallback(async () => {
    refreshPending();
    if (onlineRef.current) {
      await flushWalQueue(apiUrl);
      refreshPending();
    }
  }, [apiUrl, refreshPending]);

  useEffect(() => {
    let cancelled = false;

    const checkBackend = async () => {
      try {
        const res = await fetch(`${apiUrl}/health`, { method: "GET" });
        if (cancelled) return;
        const ok = res.ok;
        onlineRef.current = ok;
        setBackendOnline(ok);
        if (ok) {
          await flushWalQueue(apiUrl);
          if (!cancelled) refreshPending();
        }
      } catch {
        if (cancelled) return;
        onlineRef.current = false;
        setBackendOnline(false);
      }
    };

    const handleOnline = () => {
      void checkBackend();
    };

    void checkBackend();
    const intervalId = setInterval(() => {
      void checkBackend();
    }, 12_000);
    window.addEventListener("online", handleOnline);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      window.removeEventListener("online", handleOnline);
    };
  }, [apiUrl, refreshPending]);

  return {
    backendOnline,
    pendingWalCount,
    setPendingWalCount,
    refreshPending,
    enqueueFlush,
  };
}
