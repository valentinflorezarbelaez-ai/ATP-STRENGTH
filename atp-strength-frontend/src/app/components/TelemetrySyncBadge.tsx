"use client";

import React from "react";
import { Cloud, HardDrive, CheckCircle2 } from "lucide-react";
import {
  deriveTelemetrySyncState,
  type TelemetrySyncState,
} from "@/lib/workoutStrategies";

export interface TelemetrySyncBadgeProps {
  pendingWalCount: number;
  backendOnline: boolean | null;
  showWalLabel?: boolean;
  showBackendLabel?: boolean;
}

const STATE_STYLES: Record<TelemetrySyncState, { wal: string; dot: string; label: string }> = {
  SYNCED: { wal: "text-emerald-400", dot: "bg-emerald-400", label: "Al día" },
  PENDING: { wal: "text-amber-400", dot: "bg-amber-400", label: "Guardando" },
  OFFLINE: { wal: "text-zinc-300", dot: "bg-zinc-500", label: "Modo Local" },
};

export const OFFLINE_MARKS_NOTE = "Entrenando sin conexión. Tus marcas y progresos quedan 100% guardados en tu teléfono.";

function TelemetrySyncBadgeBase({
  pendingWalCount,
  backendOnline,
  showWalLabel = true,
  showBackendLabel = true,
}: TelemetrySyncBadgeProps) {
  const state = deriveTelemetrySyncState(pendingWalCount, backendOnline);
  const style = STATE_STYLES[state];

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center gap-2">
        {/* Estado del Guardado Local */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono flex-shrink-0 shadow-sm" title="Tus marcas se guardan al instante en este dispositivo">
          <HardDrive className="w-3.5 h-3.5 text-amber-400" />
          {showWalLabel && <span className="text-zinc-400 hidden sm:inline">Guardado:</span>}
          <span className={`flex items-center gap-1 font-medium ${style.wal}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {pendingWalCount > 0 ? `${pendingWalCount} pend.` : style.label}
          </span>
        </div>

        {/* Estado de Conexión */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono flex-shrink-0 shadow-sm" title="Estado de conexión en tiempo real">
          <Cloud className="w-3.5 h-3.5 text-zinc-400" />
          {showBackendLabel && <span className="text-zinc-400 hidden sm:inline">Conexión:</span>}
          {backendOnline === null ? (
            <span className="text-zinc-500">Verificando...</span>
          ) : backendOnline ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              En Línea
            </span>
          ) : (
            <span className="flex items-center gap-1 text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              Offline Seguro
            </span>
          )}
        </div>
      </div>
      {backendOnline === false && (
        <p className="text-xs text-zinc-400 leading-relaxed" role="status">
          {OFFLINE_MARKS_NOTE}
        </p>
      )}
    </div>
  );
}

export const TelemetrySyncBadge = React.memo(TelemetrySyncBadgeBase);
