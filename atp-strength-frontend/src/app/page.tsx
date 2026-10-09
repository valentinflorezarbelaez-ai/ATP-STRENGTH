"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ForgeLanding from "@/app/forge/page";
import { AthleteProfileGate } from "@/app/components/AthleteProfileGate";
import { getActiveAthleteId, setActiveAthleteId, ATHLETE_PROFILES } from "@/lib/athleteProfile";

type Gate = "athlete_gate" | "forge" | "temple";
type ThemeMode = "light" | "dark" | "system";

interface BootState {
  gate: Gate;
  templeMounted: boolean;
  presented: boolean;
  activeAthleteId: "valentin" | "jacobo";
}

function readThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem("neuro_strength_theme");
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    // Private mode or blocked storage keeps the product default.
  }
  return "dark";
}

function prefersDark(mode: ThemeMode): boolean {
  switch (mode) {
    case "dark":
      return true;
    case "light":
      return false;
    case "system":
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return true;
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    default: {
      const unreachable: never = mode;
      return unreachable;
    }
  }
}

function applyThemeClass(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", prefersDark(readThemeMode()));
}

function readBootState(): BootState {
  const isClient = typeof window !== "undefined";
  const skipIntro =
    isClient &&
    ((navigator.webdriver && localStorage.getItem("hasEnteredTemple") === "true") ||
      new URLSearchParams(window.location.search).get("skipIntro") === "true");

  if (isClient && !skipIntro) {
    try {
      localStorage.removeItem("hasEnteredTemple");
    } catch {
      // storage unavailable
    }
  }

  applyThemeClass();

  const savedAthlete = isClient ? (getActiveAthleteId() as "valentin" | "jacobo") : null;
  const initialAthlete = savedAthlete || "valentin";

  // If automated test or skipIntro, jump directly to temple
  if (skipIntro) {
    return {
      gate: "temple",
      templeMounted: true,
      presented: true,
      activeAthleteId: initialAthlete,
    };
  }

  // Real user sessions always start with the Spotify-style Athlete Profile Selector
  return {
    gate: "athlete_gate",
    templeMounted: false,
    presented: false,
    activeAthleteId: initialAthlete,
  };
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function TempleLoading() {
  return (
    <main
      className="min-h-dvh flex items-center justify-center px-6 py-16"
      style={{ backgroundColor: "#0c0d11", color: "#f1f3f7" }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <div
          className="relative mb-8 flex h-14 w-14 items-center justify-center"
          aria-hidden="true"
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{ border: "1px solid rgba(204, 164, 59, 0.28)" }}
          />
          <span
            className="absolute inset-1.5 rounded-full motion-safe:animate-spin"
            style={{
              border: "1px solid transparent",
              borderTopColor: "#cca43b",
            }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "#cca43b" }}
          />
        </div>

        <p
          className="font-mono text-[11px] tracking-[0.22em] sm:tracking-[0.28em]"
          style={{ color: "#cca43b" }}
        >
          NEURO//STRENGTH
        </p>
        <h1
          className="mt-3 text-[1.65rem] font-semibold tracking-tight"
          style={{ color: "#f7f4ec" }}
        >
          Preparando el templo
        </h1>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "#b7b1a6" }}
        >
          El motor Zen se está abriendo. Tus marcas siguen guardadas en este dispositivo.
        </p>
      </div>
    </main>
  );
}

const ZenDashboardClient = dynamic(
  () =>
    import("@/app/components/ZenDashboardClient").then(
      (mod) => mod.ZenDashboardClient
    ),
  {
    ssr: false,
    loading: () => <TempleLoading />,
  }
);

export default function ZenDashboard() {
  const [boot] = useState(readBootState);
  const [gate, setGate] = useState<Gate>(boot.gate);
  const [templeMounted, setTempleMounted] = useState(boot.templeMounted);
  const [presented, setPresented] = useState(boot.presented);
  const [activeAthleteId, setActiveAthleteIdState] = useState<"valentin" | "jacobo">(
    boot.activeAthleteId
  );
  const templeRef = useRef<HTMLDivElement>(null);

  const activeAthleteMeta =
    ATHLETE_PROFILES.find((p) => p.id === activeAthleteId) || ATHLETE_PROFILES[0];

  useEffect(() => {
    applyThemeClass();
    if (typeof window.matchMedia !== "function") return;
    if (readThemeMode() !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyThemeClass();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (gate !== "forge") return;
    void import("@/app/components/ZenDashboardClient");
  }, [gate]);

  useEffect(() => {
    if (gate !== "temple") return;
    const node = templeRef.current;
    if (!node) return;
    if (node.contains(document.activeElement)) return;
    node.focus({ preventScroll: true });
  }, [gate]);

  const handleSelectAthlete = useCallback((id: "valentin" | "jacobo") => {
    setActiveAthleteId(id);
    setActiveAthleteIdState(id);
    setGate("forge");
  }, []);

  const handleOpenAthleteGate = useCallback(() => {
    setPresented(false);
    setGate("athlete_gate");
  }, []);

  const handleEnter = useCallback(() => {
    setTempleMounted(true);
    setGate("temple");
    if (prefersReducedMotion()) {
      setPresented(true);
      return;
    }
    setPresented(false);
    requestAnimationFrame(() => setPresented(true));
  }, []);

  const handleOpenForge = useCallback(() => {
    setPresented(false);
    setGate("forge");
  }, []);

  return (
    <>
      {gate === "athlete_gate" ? (
        <AthleteProfileGate
          onSelectAthlete={handleSelectAthlete}
          currentAthleteId={activeAthleteId}
        />
      ) : null}

      {gate === "forge" ? (
        <ForgeLanding
          onEnterDirect={handleEnter}
          onSwitchAthlete={handleOpenAthleteGate}
          activeAthleteId={activeAthleteId}
          activeAthleteName={activeAthleteMeta.name}
        />
      ) : null}

      {templeMounted ? (
        <div
          ref={templeRef}
          tabIndex={-1}
          hidden={gate !== "temple"}
          className={
            gate === "temple"
              ? `outline-none transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                  presented ? "opacity-100" : "opacity-0"
                }`
              : undefined
          }
        >
          <ZenDashboardClient
            onOpenForge={handleOpenForge}
            onSwitchAthlete={handleOpenAthleteGate}
          />
        </div>
      ) : null}
    </>
  );
}
