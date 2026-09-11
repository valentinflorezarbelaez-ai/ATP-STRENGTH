"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Play, Volume2, Check, Zap, Flame, Shield, ArrowUpRight } from "lucide-react";
import { playChime, playTactileClick, playTempoTone, hapticPulse } from "@/lib/zenAudio";
import { BarbellPlateVisualizer } from "./BarbellPlateVisualizer";

interface LiveSetCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  targetWeightKg: number;
  targetReps: number;
  targetRpe: number;
  cueSummary?: string;
  onCompleteSet: (result: { weightKg: number; reps: number; rpe: number }) => void;
}

type LivePhase = "COUNTDOWN" | "LIFTING";

export function LiveSetCoachModal({
  isOpen,
  onClose,
  exerciseName,
  setNumber,
  totalSets,
  targetWeightKg,
  targetReps,
  targetRpe,
  cueSummary = "Postura firme, aire al abdomen y empuje explosivo",
  onCompleteSet,
}: LiveSetCoachModalProps) {
  const [phase, setPhase] = useState<LivePhase>("COUNTDOWN");
  const [countdownSec, setCountdownSec] = useState(3);
  const [currentReps, setCurrentReps] = useState(targetReps);
  const [selectedRpe, setSelectedRpe] = useState(targetRpe);
  const [tempoStep, setTempoStep] = useState<"DESCENT" | "HOLD" | "EXPLODE">("DESCENT");
  const [tempoProgress, setTempoProgress] = useState(0);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tempoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize modal state on open
  useEffect(() => {
    if (isOpen) {
      setPhase("COUNTDOWN");
      setCountdownSec(3);
      setCurrentReps(targetReps);
      setSelectedRpe(targetRpe);
      setTempoStep("DESCENT");
      setTempoProgress(0);

      playTempoTone(440, 150, "sine");

      countdownIntervalRef.current = setInterval(() => {
        setCountdownSec((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            setPhase("LIFTING");
            playChime(false);
            hapticPulse([150, 80, 150]);
            return 0;
          }
          playTempoTone(prev === 2 ? 554.37 : 659.25, 120, "sine");
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (tempoIntervalRef.current) clearInterval(tempoIntervalRef.current);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (tempoIntervalRef.current) clearInterval(tempoIntervalRef.current);
    };
  }, [isOpen, targetReps, targetRpe]);

  // Tempo rhythm loop during LIFTING
  useEffect(() => {
    if (!isOpen || phase !== "LIFTING") return;

    let cycleSec = 0;
    // 3s descent + 1s hold + 1s explode = 5s total cycle
    tempoIntervalRef.current = setInterval(() => {
      cycleSec = (cycleSec + 0.1) % 5.0;

      if (cycleSec < 3.0) {
        setTempoStep("DESCENT");
        setTempoProgress((cycleSec / 3.0) * 100);
        // Beep at each whole second of descent
        if (Math.abs(cycleSec - 1.0) < 0.08 || Math.abs(cycleSec - 2.0) < 0.08) {
          playTempoTone(330, 80, "sine", 0.15);
        }
      } else if (cycleSec < 4.0) {
        if (tempoStep !== "HOLD") {
          playTempoTone(528, 100, "triangle", 0.25);
          hapticPulse(50);
        }
        setTempoStep("HOLD");
        setTempoProgress(100);
      } else {
        if (tempoStep !== "EXPLODE") {
          playTempoTone(880, 180, "triangle", 0.35);
          hapticPulse([100, 50, 100]);
        }
        setTempoStep("EXPLODE");
        setTempoProgress(0);
      }
    }, 100);

    return () => {
      if (tempoIntervalRef.current) clearInterval(tempoIntervalRef.current);
    };
  }, [isOpen, phase, tempoStep]);

  if (!isOpen) return null;

  const handleFinish = () => {
    playTactileClick();
    onCompleteSet({
      weightKg: targetWeightKg,
      reps: currentReps,
      rpe: selectedRpe,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Top Bar: Exercise Context & Dismiss */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
            SERIE {setNumber} / {totalSets}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-xs">
            {exerciseName}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          title="Cerrar modo en vivo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      {phase === "COUNTDOWN" ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400/80 font-bold">
              Prepárate para la barra
            </span>
            <div className="text-8xl sm:text-9xl font-black font-mono text-white tracking-tighter animate-pulse">
              {countdownSec}
            </div>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto italic font-mono pt-2">
              "{cueSummary}"
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              setPhase("LIFTING");
              playChime(false);
            }}
            className="px-6 py-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono font-bold cursor-pointer transition-all active:scale-95"
          >
            Iniciar ya sin esperar ➔
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto space-y-5 py-3">
          {/* Target Load & Plate Visualizer Banner */}
          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4 text-center space-y-2 shadow-inner">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                {targetWeightKg}
              </span>
              <span className="text-sm font-mono text-amber-400 font-bold uppercase">KG</span>
            </div>
            <BarbellPlateVisualizer
              targetWeightKg={targetWeightKg}
              exerciseName={exerciseName}
              className="bg-zinc-950/90"
            />
          </div>

          {/* Dynamic Tempo Coach Guide */}
          <div className="bg-zinc-900/50 border border-zinc-800/70 rounded-2xl p-4 text-center space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              <span>Cadencia / Tempo</span>
              <span className={`font-bold ${
                tempoStep === "DESCENT" ? "text-blue-400" : tempoStep === "HOLD" ? "text-amber-400" : "text-emerald-400 animate-pulse"
              }`}>
                {tempoStep === "DESCENT" && "BAJADA (3s)"}
                {tempoStep === "HOLD" && "PAUSA (1s)"}
                {tempoStep === "EXPLODE" && "¡EXPLOTA! ⚡"}
              </span>
            </div>

            {/* Visual Cadence Progress Bar */}
            <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
              <div
                className={`h-full transition-all duration-100 ${
                  tempoStep === "DESCENT"
                    ? "bg-blue-500"
                    : tempoStep === "HOLD"
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
                style={{ width: `${Math.max(8, tempoProgress)}%` }}
              />
            </div>
          </div>

          {/* Live Rep Counter */}
          <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-3">
            <span className="text-xs font-mono text-zinc-400 font-bold uppercase pl-2">
              Repeticiones:
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setCurrentReps((r) => Math.max(1, r - 1));
                }}
                className="h-10 w-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              >
                -
              </button>
              <span className="text-2xl font-mono font-black text-amber-300 min-w-[48px] text-center">
                {currentReps}
              </span>
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setCurrentReps((r) => r + 1);
                }}
                className="h-10 w-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Fast RPE selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
              <span>Esfuerzo percibido:</span>
              <span className="text-amber-400 font-bold">RPE {selectedRpe}</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {[7, 7.5, 8, 8.5, 9, 9.5].map((rpeVal) => (
                <button
                  key={rpeVal}
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setSelectedRpe(rpeVal);
                  }}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    selectedRpe === rpeVal
                      ? "bg-amber-500/25 border-amber-500/60 text-amber-300 shadow-sm"
                      : "bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {rpeVal}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Giant Action Target */}
      <div className="pt-3 border-t border-zinc-800/80">
        <button
          type="button"
          onClick={handleFinish}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-mono font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>¡SERIE COMPLETADA! REGISTRAR Y DESCANSAR</span>
        </button>
      </div>
    </div>
  );
}
