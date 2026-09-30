"use client";

import React, { useState } from "react";
import {
  Calendar, Play, Dumbbell, Timer, Flame, CheckCircle2, ChevronRight,
  Sparkles, Coffee, ArrowRight, Zap
} from "lucide-react";
import type { RoutineDay, Exercise } from "@/lib/workoutStrategies";
import { getExerciseMedia, type ExerciseMedia } from "@/lib/exerciseMediaCatalog";
import { ExerciseVideoModal } from "./ExerciseVideoModal";

interface DailyWorkoutSplitViewProps {
  scheduleDays: RoutineDay[];
  selectedDayKey: string;
  onSelectDay: (key: string) => void;
  onSelectExercise: (exerciseIndex: number) => void;
  completedSetsMap: { [exerciseName: string]: number[] };
  onStartDayWorkout: () => void;
}

export function DailyWorkoutSplitView({
  scheduleDays,
  selectedDayKey,
  onSelectDay,
  onSelectExercise,
  completedSetsMap,
  onStartDayWorkout,
}: DailyWorkoutSplitViewProps) {
  const [selectedMedia, setSelectedMedia] = useState<ExerciseMedia | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [targetExerciseIndex, setTargetExerciseIndex] = useState<number | null>(null);

  const activeDay = scheduleDays.find((d) => d.key === selectedDayKey) || scheduleDays[0];

  const handleOpenVideo = (exercise: Exercise, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const media = getExerciseMedia(exercise.name);
    setSelectedMedia(media);
    setTargetExerciseIndex(idx);
    setIsVideoModalOpen(true);
  };

  const handleStartFromModal = () => {
    if (targetExerciseIndex !== null) {
      onSelectExercise(targetExerciseIndex);
    }
  };

  return (
    <div className="w-full space-y-5 animate-fade-in">
      {/* 1. Anatoly-Style Horizontal Days Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Split Semanal de Entrenamiento</span>
          </div>
          <span className="text-[10px] font-mono text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            {scheduleDays.filter(d => !d.isRest).length} Días de Fuerza
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {scheduleDays.map((day) => {
            const isSelected = day.key === selectedDayKey;
            const completedCount = day.exercises.filter(
              (ex) => (completedSetsMap[ex.name]?.length || 0) >= ex.sets
            ).length;
            const isDayAllDone = day.exercises.length > 0 && completedCount === day.exercises.length;

            return (
              <button
                key={day.key}
                onClick={() => onSelectDay(day.key)}
                className={`flex-shrink-0 px-4 py-3 rounded-2xl border text-left transition-all duration-200 min-w-[125px] ${
                  isSelected
                    ? "bg-gradient-to-b from-amber-500/20 to-amber-500/5 border-amber-500/60 shadow-lg shadow-amber-500/10"
                    : "bg-zinc-950/70 border-zinc-900 hover:border-zinc-800 text-zinc-400"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-xs font-bold truncate ${
                      isSelected ? "text-amber-400" : "text-zinc-200"
                    }`}
                  >
                    {day.name.split("-")[0].trim()}
                  </span>
                  {isDayAllDone && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>

                <div className="text-[10px] text-zinc-400 truncate max-w-[105px]">
                  {day.isRest ? "Descanso" : day.focus.split("&")[0].trim()}
                </div>

                {!day.isRest && (
                  <div className="mt-2 flex items-center gap-1 text-[9px] font-mono text-zinc-500">
                    <span>{completedCount}/{day.exercises.length} hechos</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directiva de Oro del Protocolo Universal PR */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-zinc-950 to-zinc-950 p-4 sm:p-5 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase">
                Directiva Oficial · Protocolo Universal PR
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                Reglas fisiológicas obligatorias para maximizar 1RM y regeneración del SNC
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
            SISTEMA EXCLUSIVO
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Cuántos y Cuáles Ejercicios */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold font-mono">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>1. ¿Cuántos ejercicios hacer?</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
              Exactamente <strong className="text-white">3 ejercicios clave</strong> por sesión:
            </p>
            <ul className="text-[10px] text-zinc-400 font-mono space-y-1 list-disc pl-3.5">
              <li><strong className="text-amber-300">1 Principal Pesado:</strong> 4 series efectivas de 3 a 5 reps (80-85% 1RM).</li>
              <li><strong className="text-zinc-200">1 Secundario Angular:</strong> 3 series efectivas de 5 reps (75-80% 1RM).</li>
              <li><strong className="text-zinc-200">1 Accesorio / Blindaje:</strong> 3 series para tendones y potencia.</li>
            </ul>
          </div>

          {/* Card 2: Cuánto Descansar */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold font-mono">
              <Timer className="w-3.5 h-3.5" />
              <span>2. ¿Cuánto descansar?</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
              Tiempo estricto para <strong className="text-white">resíntesis biológica de ATP-PCr</strong>:
            </p>
            <ul className="text-[10px] text-zinc-400 font-mono space-y-1 list-disc pl-3.5">
              <li><strong className="text-amber-300">4 a 5 min (240-300s):</strong> Series pesadas efectivas (99% ATP restaurado).</li>
              <li><strong className="text-zinc-200">2 a 3 min (120-180s):</strong> Series de aproximación técnica.</li>
              <li><strong className="text-zinc-200">2 min (120s):</strong> Accesorios. 48-72h entre mismos patrones.</li>
            </ul>
          </div>

          {/* Card 3: Y demás (Tempo, RIR, Progresión) */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>3. ¿Y demás? (Tempo & RIR)</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
              Normas de ejecución para no quemar el sistema nervioso:
            </p>
            <ul className="text-[10px] text-zinc-400 font-mono space-y-1 list-disc pl-3.5">
              <li><strong className="text-amber-300">RIR 1-2:</strong> Cero fallo concéntrico para evitar inhibición neural.</li>
              <li><strong className="text-zinc-200">Tempo 3-1-X-1:</strong> 3s bajada, 1s pausa isométrica, explosión concéntrica (CAT).</li>
              <li><strong className="text-zinc-200">Sobrecarga:</strong> +2.5 kg si completás con RPE ≤ 7.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Active Day Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-[#0a0a0c] to-black p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {activeDay.isRest ? "Día de Recuperación" : "Sesión Programada"}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {activeDay.name}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {activeDay.focus}
            </h2>
            <p className="text-xs text-zinc-400 max-w-md">
              {activeDay.isRest
                ? activeDay.restMessage || "Descanso para supercompensación del SNC."
                : "Ejecución de fuerza máxima con temporización de resíntesis ATP-PCr y sobrecarga progresiva."}
            </p>
          </div>

          {!activeDay.isRest && (
            <button
              onClick={onStartDayWorkout}
              className="px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Iniciar Entrenamiento del Día</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Daily Exercise Sequence (Anatoly Fit Card Style) */}
      {!activeDay.isRest && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-zinc-300">
              Ejercicios de la Jornada ({activeDay.exercises.length})
            </span>
            <span className="text-[11px] text-zinc-500">
              Toca la miniatura para ver video demo
            </span>
          </div>

          <div className="grid gap-3">
            {activeDay.exercises.map((ex, idx) => {
              const media = getExerciseMedia(ex.name);
              const doneSets = completedSetsMap[ex.name]?.length || 0;
              const isCompleted = doneSets >= ex.sets;

              return (
                <div
                  key={idx}
                  onClick={() => onSelectExercise(idx)}
                  className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isCompleted
                      ? "bg-zinc-950/40 border-emerald-500/20 hover:border-emerald-500/40"
                      : "bg-[#09090b] border-zinc-900 hover:border-amber-500/30 hover:bg-zinc-900/40"
                  }`}
                >
                  {/* Left: Video Preview Thumbnail */}
                  <div className="flex items-center gap-3.5">
                    <div
                      onClick={(e) => handleOpenVideo(ex, idx, e)}
                      className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 group/thumb"
                      title="Ver técnica en video"
                    >
                      {/* Poster Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={media.posterUrl}
                        alt={media.name}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/thumb:bg-black/20 transition-colors">
                        <span className="w-7 h-7 rounded-full bg-amber-500/90 text-black flex items-center justify-center shadow-md transform group-hover/thumb:scale-110 transition-transform">
                          <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                        </span>
                      </div>
                    </div>

                    {/* Middle: Exercise Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-amber-500/90 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {idx === 0 ? "#1 Principal Pesado" : idx === 1 ? "#2 Secundario Angular" : "#3 Accesorio / Blindaje"}
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                          {ex.name}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className="flex items-center gap-1 font-semibold text-zinc-200">
                          <Dumbbell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{ex.sets} series</span>
                        </span>
                        <span className="text-zinc-400 font-medium">
                          {ex.reps}
                        </span>
                        <span className="flex items-center gap-1 text-amber-400 font-mono text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold shrink-0">
                          <Timer className="w-3 h-3" />
                          <span>{Math.round(ex.restSeconds / 60)} min descanso (ATP-PCr)</span>
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {ex.cue}
                      </p>
                    </div>
                  </div>

                  {/* Right: Status / Action */}
                  <div className="flex items-center gap-2.5 shrink-0 pl-2">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Listo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
                        {doneSets}/{ex.sets}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Video Modal Component */}
      {selectedMedia && (
        <ExerciseVideoModal
          media={selectedMedia}
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          onStartExercise={handleStartFromModal}
        />
      )}
    </div>
  );
}
