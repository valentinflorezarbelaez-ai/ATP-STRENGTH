"use client";

import { Server } from "lucide-react";
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
  SYNCED: { wal: "text-emerald-400", dot: "bg-emerald-400", label: "SYNCED" },
  PENDING: { wal: "text-amber-400", dot: "bg-amber-400 animate-pulse", label: "PENDING" },
  OFFLINE: { wal: "text-zinc-400", dot: "bg-zinc-600", label: "OFFLINE" },
};

export function TelemetrySyncBadge({
  pendingWalCount,
  backendOnline,
  showWalLabel = true,
  showBackendLabel = true,
}: TelemetrySyncBadgeProps) {
  const state = deriveTelemetrySyncState(pendingWalCount, backendOnline);
  const style = STATE_STYLES[state];

  return (
    <>
      <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono flex-shrink-0">
        {showWalLabel && <span className="text-zinc-400 hidden sm:inline">WAL:</span>}
        <span className={`flex items-center gap-1 font-medium ${style.wal}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {pendingWalCount > 0 ? `${pendingWalCount} pend.` : style.label}
        </span>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono flex-shrink-0">
        <Server className="w-3.5 h-3.5 text-zinc-400" />
        {showBackendLabel && <span className="text-zinc-400 hidden sm:inline">FastAPI:</span>}
        {backendOnline === null ? (
          <span className="text-zinc-500">...</span>
        ) : backendOnline ? (
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En Línea
          </span>
        ) : (
          <span className="flex items-center gap-1 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            Off
          </span>
        )}
      </div>
    </>
  );
}
