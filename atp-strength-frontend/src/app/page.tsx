"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ForgeLanding from "@/app/forge/page";

const ZenDashboardClient = dynamic(
  () =>
    import("@/app/components/ZenDashboardClient").then(
      (mod) => mod.ZenDashboardClient
    ),
  {
    ssr: false,
    loading: () => (
      <main className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40" />
          <span className="text-sm font-mono tracking-widest text-amber-400">
            CARGANDO MOTOR ZEN...
          </span>
        </div>
      </main>
    ),
  }
);

export default function ZenDashboard() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== "undefined") {
      // Allow automated headless E2E test suites (Playwright) to bypass intro when pre-seeded
      if (
        (navigator.webdriver && localStorage.getItem("hasEnteredTemple") === "true") ||
        new URLSearchParams(window.location.search).get("skipIntro") === "true"
      ) {
        return false;
      }
      // Clean up legacy permanent lockout from previous builds so real athletes always get the full warrior experience
      try {
        localStorage.removeItem("hasEnteredTemple");
      } catch {}
    }
    // The Forge, Anthem, and Warrior ritual are an essential gateway before starting
    return true;
  });

  const handleEnter = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return <ForgeLanding onEnterDirect={handleEnter} />;
  }

  return <ZenDashboardClient onOpenForge={() => setShowIntro(true)} />;
}
