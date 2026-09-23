"use client";

import React, { useMemo } from "react";
import { X, Play, CheckCircle2, AlertTriangle, Dumbbell, ShieldCheck, Zap, ExternalLink } from "lucide-react";
import { type ExerciseMedia } from "@/lib/exerciseMediaCatalog";

interface ExerciseVideoModalProps {
  media: ExerciseMedia;
  isOpen: boolean;
  onClose: () => void;
  onStartExercise?: () => void;
}

export function ExerciseVideoModal({
  media,
  isOpen,
  onClose,
  onStartExercise,
}: ExerciseVideoModalProps) {
  const embedUrl = useMemo(() => {
    if (!media) return null;
    let ytId = media.youtubeId;
    if (!ytId && media.videoUrl) {
      const match = media.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) ytId = match[1];
    }
    if (ytId) {
      return `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&enablejsapi=1&rel=0`;
    }
    return null;
  }, [media]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#070709] border border-amber-500/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Play className="w-4 h-4 fill-amber-400" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/90">
                {media.category} • Demo Técnica HD
              </span>
              <h3 id="video-modal-title" className="text-base font-bold text-white tracking-tight">
                {media.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative w-full bg-black aspect-video overflow-hidden border-b border-zinc-900 group">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={media.name}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              
              allowFullScreen
            />
          ) : (
            <video
              src={media.videoUrl}
              poster={media.posterUrl}
              autoPlay
              loop
              muted
              playsInline
              controls
              className="w-full h-full object-cover"
            >
              Tu navegador no soporta reproducción de video HTML5.
            </video>
          )}

          <div className="absolute top-2.5 right-2.5 flex items-center gap-2 opacity-85 group-hover:opacity-100 transition-opacity">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/80 text-amber-400 border border-amber-400/30 backdrop-blur-sm">
              Tempo {media.tempo}
            </span>
            {media.videoUrl.includes("youtube") && (
              <a
                href={media.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600/80 hover:bg-red-600 text-white flex items-center gap-1 backdrop-blur-sm transition-colors"
                title="Abrir en YouTube"
              >
                <span>YouTube</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Target Muscles */}
          <div>
            <div className="flex items-center gap-1.5 text-zinc-400 font-semibold mb-2 text-[11px]">
              <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
              <span>Músculos Activados</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {media.targetMuscles.map((muscle, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          {/* Form Cues */}
          <div>
            <div className="flex items-center gap-1.5 text-zinc-400 font-semibold mb-2 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Claves de Ejecución Técnica (Form Cues)</span>
            </div>
            <ul className="space-y-1.5">
              {media.formCues.map((cue, idx) => (
                <li key={idx} className="flex items-start gap-2 text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Common Mistakes */}
          <div>
            <div className="flex items-center gap-1.5 text-zinc-400 font-semibold mb-2 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Errores Comunes a Evitar</span>
            </div>
            <ul className="space-y-1.5">
              {media.commonMistakes.map((mistake, idx) => (
                <li key={idx} className="flex items-start gap-2 text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/80">
          <button
            onClick={() => {
              if (onStartExercise) onStartExercise();
              onClose();
            }}
            className="w-full h-13 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>¡Entendido! A entrenar este ejercicio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
