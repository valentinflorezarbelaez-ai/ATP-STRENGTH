"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Calendar, Play, Dumbbell, Timer, CheckCircle2, ChevronRight, Zap,
  Home, Building2, Sparkles
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
  const [workoutEnvironment, setWorkoutEnvironment] = useState<"GYM" | "HOME">("GYM");

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
    <div className="w-full space-y-5 animate-fade-in text-zinc-100">
      {/* ── CINEMATIC SPLIT BANNER (ANATOLY STYLE) ── */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 shadow-2xl">
        <div className="relative h-36 sm:h-44 w-full">
          <Image
            src="/anatoly/anatoly_split_banner.jpg"
            alt="The Foundry Strength & Conditioning Session"
            fill
            className="object-cover opacity-65 mix-blend-luminosity hover:opacity-80 transition-opacity duration-500"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-[10px] font-black tracking-widest uppercase mb-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>APS Power Training Architecture</span>
            </div>
            <h2 className="text-base sm:text-xl font-black tracking-tight text-white uppercase">
              SPLIT SEMANAL & SOBRECARGA PROGRESIVA
            </h2>
          </div>

          {/* Environment Switcher: Gym vs Home */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/80 border border-zinc-800 backdrop-blur-md">
            <button
              onClick={() => setWorkoutEnvironment("GYM")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                workoutEnvironment === "GYM"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Gimnasio</span>
            </button>
            <button
              onClick={() => setWorkoutEnvironment("HOME")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                workoutEnvironment === "HOME"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Casa / Calistenia</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 1. ANATOLY-STYLE HORIZONTAL DAYS STRIP ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Selección de Jornada</span>
          </div>
          <span className="text-[10px] font-mono text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            {scheduleDays.filter((d) => !d.isRest).length} Días de Fuerza Activa
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
                className={`flex-shrink-0 px-4 py-3 rounded-2xl border text-left transition-all duration-200 min-w-[130px] ${
                  isSelected
                    ? "bg-gradient-to-b from-amber-500/20 to-amber-500/5 border-amber-500/70 shadow-lg shadow-amber-500/10"
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

                <div className="text-[10px] text-zinc-400 truncate max-w-[110px]">
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

      {/* ── 2. ACTIVE DAY HERO CARD ── */}
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
                : workoutEnvironment === "HOME"
                ? "Adaptación a calistenia pesada y mancuernas. Mantén la cadencia y tiempo bajo tensión estricto."
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

      {/* ── 3. DAILY EXERCISE SEQUENCE ── */}
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
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-amber-500/90 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                          {ex.name}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                        <span className="flex items-center gap-1 font-semibold text-zinc-300">
                          <Dumbbell className="w-3 h-3 text-amber-400" />
                          {ex.sets} series × {ex.reps}
                        </span>
                        <span className="flex items-center gap-1 text-zinc-500 font-mono text-[11px]">
                          <Timer className="w-3 h-3" />
                          {Math.round(ex.restSeconds / 60)} min rest
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-800 text-amber-400/90">
                          Tempo: {media.tempo}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-500 line-clamp-1 italic">
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
