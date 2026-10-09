"use client";

import { useEffect, useState, useCallback } from "react";
import { ATHLETE_PROFILES, setActiveAthleteId } from "@/lib/athleteProfile";

interface AthleteProfileGateProps {
  onSelectAthlete: (athleteId: "valentin" | "jacobo") => void;
  currentAthleteId?: string | null;
}

export function AthleteProfileGate({
  onSelectAthlete,
  currentAthleteId,
}: AthleteProfileGateProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [enteringId, setEnteringId] = useState<string | null>(null);

  const handleChoose = useCallback(
    (id: "valentin" | "jacobo") => {
      setEnteringId(id);
      if (typeof window !== "undefined") {
        setActiveAthleteId(id);
      }
      setTimeout(() => {
        onSelectAthlete(id);
      }, 250);
    },
    [onSelectAthlete]
  );

  // Keyboard navigation: 1 for Valentín, 2 for Jacobo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1") {
        handleChoose("valentin");
      } else if (e.key === "2") {
        handleChoose("jacobo");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleChoose]);

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-[#07080c] text-zinc-100 select-none"
      role="region"
      aria-label="Selector de Perfil de Atleta"
    >
      {/* Dynamic Ambient Glows */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[140px] opacity-25 transition-opacity duration-700"
        style={{
          background:
            hoveredId === "valentin"
              ? "radial-gradient(circle, #cca43b 0%, transparent 70%)"
              : "radial-gradient(circle, #b8860b 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[140px] opacity-25 transition-opacity duration-700"
        style={{
          background:
            hoveredId === "jacobo"
              ? "radial-gradient(circle, #10b981 0%, transparent 70%)"
              : "radial-gradient(circle, #059669 0%, transparent 70%)",
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center relative z-10 space-y-10">
        {/* Brand Kicker */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-[0.25em] text-amber-300 uppercase">
              SISTEMA MULTI-ATLETA • PERFILES AISLADOS
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase font-sans">
            ¿Quién está forjando su <span className="text-amber-400">fuerza</span> hoy?
          </h1>

          <p className="max-w-md mx-auto text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Seleccioná tu perfil estilo Spotify. Tus marcas personales, 1RMs, rutinas e historial quedan 100% independientes y guardados en este dispositivo.
          </p>
        </div>

        {/* Profile Cards Grid (Spotify / Netflix Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full max-w-xl">
          {ATHLETE_PROFILES.map((profile, idx) => {
            const isValentin = profile.id === "valentin";
            const isEntering = enteringId === profile.id;
            const isCurrent = currentAthleteId === profile.id;

            return (
              <div
                key={profile.id}
                role="button"
                tabIndex={0}
                onClick={() => handleChoose(profile.id as "valentin" | "jacobo")}
                onMouseEnter={() => setHoveredId(profile.id)}
                onMouseLeave={() => setHoveredId(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleChoose(profile.id as "valentin" | "jacobo");
                  }
                }}
                className={`group relative p-6 sm:p-8 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center ${
                  isValentin
                    ? "border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950/90 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/10"
                    : "border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950/90 hover:border-emerald-500/60 hover:shadow-2xl hover:shadow-emerald-500/10"
                } ${isEntering ? "scale-95 opacity-80" : "hover:scale-[1.03]"} ${
                  isCurrent ? "ring-1 ring-amber-400/40" : ""
                }`}
              >
                {/* Number Key Indicator */}
                <span className="absolute top-3 right-3 text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400">
                  Tecla [{idx + 1}]
                </span>

                {/* Avatar Ring */}
                <div className="relative mb-5">
                  <div
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-105 ${
                      isValentin
                        ? "border-amber-500/40 bg-zinc-900/90 group-hover:border-amber-400 group-hover:shadow-[0_0_30px_rgba(204,164,59,0.25)]"
                        : "border-emerald-500/40 bg-zinc-900/90 group-hover:border-emerald-400 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]"
                    }`}
                  >
                    <span
                      className={`text-3xl sm:text-4xl font-black font-mono tracking-wider ${
                        isValentin ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {profile.initial}
                    </span>
                  </div>

                  {/* Micro badge */}
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold tracking-wider border ${
                      isValentin
                        ? "bg-amber-950/90 text-amber-300 border-amber-500/40"
                        : "bg-emerald-950/90 text-emerald-300 border-emerald-500/40"
                    }`}
                  >
                    {isValentin ? "Titán" : "Olímpico"}
                  </span>
                </div>

                {/* Name & Title */}
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-zinc-50">
                  {profile.name}
                </h2>

                <p className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-wider">
                  {profile.role}
                </p>

                <p className="text-[11px] text-zinc-500 mt-2 max-w-[200px]">
                  {profile.subtitle}
                </p>

                {/* Action CTA */}
                <div className="mt-6 w-full pt-4 border-t border-zinc-800/60">
                  <span
                    className={`inline-block w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
                      isValentin
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-zinc-950"
                        : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-zinc-950"
                    }`}
                  >
                    Entrar como {profile.name} →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Helper */}
        <div className="text-center pt-2">
          <p className="text-[11px] font-mono text-zinc-500">
            💡 Podés cambiar de atleta en cualquier momento con 1 toque desde la barra superior.
          </p>
        </div>
      </div>
    </main>
  );
}
