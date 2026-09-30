"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Zap, Shield, Sparkles } from "lucide-react";
import { UniversalStrengthCalcModal } from "@/app/components/UniversalStrengthCalcModal";

export default function UniversalCalcPage() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-zinc-900">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLVER AL TEMPLO ZEN</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] font-mono text-zinc-400">MOTOR UNIVERSAL ACTIVO</span>
        </div>
      </header>

      {/* Embed the Universal Strength Engine */}
      <div className="flex-1 flex items-center justify-center my-6">
        <UniversalStrengthCalcModal
          isOpen={true}
          onClose={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/";
            }
          }}
          onStartTimer={(sec, title) => {
            console.log("Temporizador solicitado:", sec, title);
          }}
        />
      </div>

      <footer className="max-w-4xl mx-auto w-full py-4 text-center border-t border-zinc-900 text-xs font-mono text-zinc-500">
        ATP-STRENGTH • MOTOR DE FUERZA NEUROMUSCULAR &amp; RESÍNTESIS DE ATP
      </footer>
    </main>
  );
}
