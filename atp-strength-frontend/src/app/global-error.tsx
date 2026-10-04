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
          <h1 className="text-xl font-semibold text-white mb-2">
            Algo se interrumpió
          </h1>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Tus marcas siguen en este dispositivo. Volvé a intentar.
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
