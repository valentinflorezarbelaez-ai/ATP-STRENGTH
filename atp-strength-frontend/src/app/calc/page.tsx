"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UniversalStrengthCalcModal } from "@/app/components/UniversalStrengthCalcModal";
import { RestClock } from "@/app/components/RestClock";

export default function UniversalCalcPage() {
  const router = useRouter();
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [restRunning, setRestRunning] = useState(false);

  useEffect(() => {
    if (!restRunning) return undefined;
    const id = window.setInterval(() => {
      setRestSeconds((current) => {
        if (current === null) return null;
        if (current <= 1) {
          setRestRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [restRunning]);

  const restOpen = restSeconds !== null && (restRunning || restSeconds > 0);

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
          className="inline-flex items-center gap-2 min-h-11 px-3 rounded-xl border border-zinc-800 text-sm text-zinc-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la sesión</span>
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
            router.push("/");
          }}
          onStartTimer={(sec) => {
            setRestSeconds(sec);
            setRestRunning(true);
          }}
        />
        {restOpen && restSeconds !== null ? (
          <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <RestClock
                remainingSeconds={restSeconds}
                isRunning={restRunning}
                onReady={() => {
                  setRestRunning(false);
                  setRestSeconds(null);
                }}
                onTogglePause={() => setRestRunning((running) => !running)}
                onAddThirty={() => setRestSeconds((current) => (current ?? 0) + 30)}
              />
            </div>
          </div>
        ) : null}
      </div>

      <footer className="max-w-4xl mx-auto w-full py-4 text-center border-t border-zinc-900 text-xs font-mono text-zinc-500">
        ATP-STRENGTH • MOTOR DE FUERZA NEUROMUSCULAR &amp; RESÍNTESIS DE ATP
      </footer>
    </main>
  );
}
