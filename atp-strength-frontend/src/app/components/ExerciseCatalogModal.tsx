"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Play,
  Search,
  Dumbbell,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Flame,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import { EXERCISE_MEDIA_CATALOG, type ExerciseMedia } from "@/lib/exerciseMediaCatalog";

interface ExerciseCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForTraining?: (exerciseName: string) => void;
  initialExerciseName?: string | null;
}

const CATEGORIES = [
  { id: "all", label: "Todos (25)" },
  { id: "fuerza", label: "Fuerza Básica", match: ["sentadilla", "banca", "convencional", "militar"] },
  { id: "traccion", label: "Tracción & Espalda", match: ["dominada", "pendlay", "rumano", "déficit", "arrancada (snatch grip"] },
  { id: "halterofilia", label: "Halterofilia & Potencia", match: ["clean", "cargada", "snatch", "arrancada", "jerk", "push press", "high pull"] },
  { id: "brazos_core", label: "Brazos & Core", match: ["curl", "fondo", "plancha", "granjero", "piernas a la barra"] },
  { id: "salto", label: "Pliometría & Salto", match: ["salto"] },
];

export function ExerciseCatalogModal({
  isOpen,
  onClose,
  onSelectForTraining,
  initialExerciseName,
}: ExerciseCatalogModalProps) {
  const allExercises = useMemo(() => Object.values(EXERCISE_MEDIA_CATALOG), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeExercise, setActiveExercise] = useState<ExerciseMedia>(() => {
    if (initialExerciseName) {
      const match = allExercises.find(
        (ex) => ex.name.toLowerCase() === initialExerciseName.toLowerCase()
      );
      if (match) return match;
    }
    return allExercises[0];
  });

  // Sync initial exercise if changed
  useEffect(() => {
    if (initialExerciseName) {
      const match = allExercises.find(
        (ex) => ex.name.toLowerCase() === initialExerciseName.toLowerCase()
      );
      if (match) setActiveExercise(match);
    }
  }, [initialExerciseName, allExercises]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Filtered list
  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      // Category filter
      if (selectedCategory !== "all") {
        const cat = CATEGORIES.find((c) => c.id === selectedCategory);
        if (cat?.match) {
          const matchesCat = cat.match.some((term) =>
            ex.name.toLowerCase().includes(term) || ex.id.toLowerCase().includes(term)
          );
          if (!matchesCat) return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = ex.name.toLowerCase().includes(query);
        const matchesCategory = ex.category.toLowerCase().includes(query);
        const matchesMuscles = ex.targetMuscles.some((m) =>
          m.toLowerCase().includes(query)
        );
        return matchesName || matchesCategory || matchesMuscles;
      }

      return true;
    });
  }, [allExercises, selectedCategory, searchQuery]);

  // Dynamic origin embed URL
  const embedUrl = useMemo(() => {
    if (!activeExercise?.youtubeId) return null;
    const originParam =
      typeof window !== "undefined" &&
      window.location.origin &&
      window.location.origin.startsWith("http")
        ? `&origin=${encodeURIComponent(window.location.origin)}`
        : "";
    return `https://www.youtube.com/embed/${activeExercise.youtubeId}?autoplay=1&mute=1&rel=0${originParam}`;
  }, [activeExercise]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
    >
      <div className="relative w-full max-w-5xl bg-[#09090b] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                  Manual de Operación Técnica
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  25 VIDEOS HD
                </span>
              </div>
              <h2
                id="catalog-modal-title"
                className="text-base sm:text-lg font-black text-white tracking-tight uppercase"
              >
                Biblioteca Técnica de Ejercicios
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-zinc-800"
            aria-label="Cerrar catálogo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Category Filter Toolbar */}
        <div className="px-5 py-3 border-b border-zinc-900 bg-zinc-950/40 flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ejercicio o músculo..."
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                      : "bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area (Split View: Active Video & Details Left, Catalog Grid Right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-900">
          {/* Active Video Player & Cues (Left 7 Cols on Desktop) */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col gap-4 bg-zinc-950/20">
            {/* Player Container */}
            <div className="relative w-full bg-black aspect-video rounded-2xl overflow-hidden border border-zinc-800 shadow-xl group">
              {embedUrl ? (
                <iframe
                  key={activeExercise.youtubeId}
                  src={embedUrl}
                  title={activeExercise.name}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                  Sin video disponible
                </div>
              )}

              {/* Overlay Badges */}
              <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/85 text-amber-400 border border-amber-400/30 backdrop-blur-sm shadow">
                  Tempo {activeExercise.tempo}
                </span>
                {activeExercise.videoUrl && (
                  <a
                    href={activeExercise.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1 backdrop-blur-sm transition-colors shadow"
                    title="Ver en YouTube"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Exercise Header & Meta */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-amber-500/90">
                  {activeExercise.category}
                </span>
                <h3 className="text-lg font-black text-white tracking-tight">
                  {activeExercise.name}
                </h3>
              </div>
              {onSelectForTraining && (
                <button
                  onClick={() => {
                    onSelectForTraining(activeExercise.name);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>Entrenar este</span>
                </button>
              )}
            </div>

            {/* Target Muscles */}
            <div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-semibold mb-1.5 text-[11px]">
                <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                <span>Músculos Activados</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeExercise.targetMuscles.map((muscle, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium text-[11px]"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* Form Cues */}
            <div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-semibold mb-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Claves de Ejecución Técnica (Form Cues)</span>
              </div>
              <ul className="space-y-1 text-xs">
                {activeExercise.formCues.map((cue, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes */}
            <div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-semibold mb-1.5 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Errores Comunes a Evitar</span>
              </div>
              <ul className="space-y-1 text-xs">
                {activeExercise.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Catalog Exercises List (Right 5 Cols on Desktop) */}
          <div className="lg:col-span-5 p-4 flex flex-col gap-2 overflow-y-auto max-h-[400px] lg:max-h-none">
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-zinc-900">
              <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase">
                Listado ({filteredExercises.length} ejercicios)
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Clic para reproducir HD
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {filteredExercises.map((ex) => {
                const isActive = activeExercise.id === ex.id;
                return (
                  <button
                    key={ex.id}
                    onClick={() => setActiveExercise(ex)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                        : "bg-zinc-950/60 hover:bg-zinc-900/60 border-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-amber-500/80 font-bold">
                          {ex.category}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">
                          {ex.tempo}
                        </span>
                      </div>
                      <div
                        className={`text-xs font-bold truncate ${
                          isActive ? "text-amber-400" : "text-zinc-200"
                        }`}
                      >
                        {ex.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {ex.targetMuscles.slice(0, 2).join(", ")}
                      </div>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30"
                          : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
