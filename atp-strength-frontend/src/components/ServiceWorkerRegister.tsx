"use client";

import { useEffect } from "react";

/**
 * Global Service Worker registration component.
 * Ensures the PWA engine is registered across all routes (/ , /calc, /forge).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerSw = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      } catch (err) {
        console.warn("[PWA] Service Worker registration failed:", err);
      }
    };

    if (document.readyState === "complete") {
      void registerSw();
    } else {
      window.addEventListener("load", () => {
        void registerSw();
      });
    }
  }, []);

  return null;
}
