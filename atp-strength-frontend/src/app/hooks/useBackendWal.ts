"use client";

import { useEffect, useState } from "react";
import { flushWalQueue, getPendingWalCount } from "@/lib/walSync";

/** FastAPI health probe + SPEC-0002 WAL flush on reconnect. */
export function useBackendWal(apiUrl: string) {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [pendingWalCount, setPendingWalCount] = useState(() => {
    if (typeof window !== "undefined") return getPendingWalCount();
    return 0;
  });

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${apiUrl}/health`, { method: "GET" });
        if (res.ok) {
          setBackendOnline(true);
          flushWalQueue(apiUrl).then(() => setPendingWalCount(getPendingWalCount()));
        } else {
          setBackendOnline(false);
        }
      } catch {
        setBackendOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 12000);
    const handleOnline = () => {
      checkBackend();
      flushWalQueue(apiUrl).then(() => setPendingWalCount(getPendingWalCount()));
    };
    window.addEventListener("online", handleOnline);
    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
    };
  }, [apiUrl]);

  const refreshPending = () => setPendingWalCount(getPendingWalCount());

  const enqueueFlush = async () => {
    refreshPending();
    if (backendOnline) {
      await flushWalQueue(apiUrl);
      refreshPending();
    }
  };

  return {
    backendOnline,
    pendingWalCount,
    setPendingWalCount,
    refreshPending,
    enqueueFlush,
  };
}
