"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4 m-0 font-sans select-none">
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-3 inline-block">
            SISTEMA NEUROMUSCULAR
          </span>
          <h1 className="text-xl font-bold text-white mb-2">
            Reinicio del Entorno
          </h1>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Se reinicializó el contenedor visual para garantizar la integridad de la sesión.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 mb-3 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>
          <Link
            href="/"
            className="w-full py-2.5 px-4 text-xs font-mono text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Volver al Inicio</span>
          </Link>
        </div>
      </body>
    </html>
  );
}
