"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCw, Home, Database } from "lucide-react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime errors for diagnostics
    console.error("[ATP-STRENGTH CRITICAL ENGINE ERROR]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none safe-area-inset">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-rose-500/10 blur-[130px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-[130px]" />
      </div>

      <div className="w-full max-w-md bg-zinc-950/90 border border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 flex flex-col items-center text-center">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5 text-amber-400 shadow-[0_0_25px_rgba(204,164,59,0.15)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Header */}
        <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-3">
          ESCUDO DE RESILIENCIA NEUROMUSCULAR
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
          Estabilización de Emergencia
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
          Se detectó una fluctuación inesperada en la vista. No te preocupes: tus series,
          pesos y marcas históricas permanecen <span className="text-emerald-400 font-semibold">100% blindados</span> en el almacenamiento seguro WAL offline.
        </p>

        {/* Error Details (Folded / Safe) */}
        {error?.message && (
          <div className="w-full mb-6 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-left">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
              Registro del Incidente
            </span>
            <p className="text-xs font-mono text-rose-300/90 break-words line-clamp-3">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin-reverse" />
            <span>Reanudar Entrenamiento</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
            className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-zinc-400" />
            <span>Recargar Aplicación Completa</span>
          </button>

          <Link
            href="/"
            className="w-full py-2.5 px-4 text-xs font-mono text-zinc-400 hover:text-zinc-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Volver al Templo Principal</span>
          </Link>
        </div>

        {/* Footer Guarantee */}
        <div className="mt-6 pt-4 border-t border-zinc-900/80 w-full flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>OFFLINE-FIRST WAL ENGINE • SIN PÉRDIDA DE DATOS</span>
        </div>
      </div>
    </div>
  );
}
