"use client";

import React, { Component, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

interface FallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: FallbackProps) {
  const router = useRouter();

  const handleReset = () => {
    onReset();
    router.push("/");
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-black">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white uppercase">
            Recuperación de Estado
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Se detectó una inconsistencia en los datos temporales de la sesión. Podés restablecer el estado o recargar.
          </p>
          {error?.message && (
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-500 truncate">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTABLECER A DÍA A (RECOMENDADO)</span>
          </button>

          <button
            type="button"
            onClick={handleReload}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>REINTENTAR RECARGA</span>
          </button>
        </div>
      </div>
    </main>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ATP Strength Uncaught Error:", error, errorInfo);
  }

  private handleResetSession = () => {
    try {
      localStorage.removeItem("neuro_strength_session_progress");
      localStorage.removeItem("neuro_strength_coach_mode");
      localStorage.removeItem("neuro_strength_session_history");
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleResetSession}
        />
      );
    }

    return this.props.children;
  }
}
