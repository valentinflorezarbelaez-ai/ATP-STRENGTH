"use client";

import React, { useState } from "react";
import { ArrowLeft, ExternalLink, Music2, Sparkles, Zap, Flame } from "lucide-react";

interface SpotifyTrainingViewProps {
  onBack: () => void;
}

export function SpotifyTrainingView({ onBack }: SpotifyTrainingViewProps) {
  const [activeTab, setActiveTab] = useState<"playlist1" | "playlist2">("playlist1");

  const playlists = {
    playlist1: {
      name: "Forja & Máximo Poder",
      tag: "Hipertrofia & Fuerza",
      embedUrl:
        "https://open.spotify.com/embed/playlist/4Gn8FuTCHfTrQOhQOvkBjJ?utm_source=generator&si=526afa4cdcc74a4a",
      directUrl:
        "https://open.spotify.com/playlist/4Gn8FuTCHfTrQOhQOvkBjJ?si=pAz-qBSVQyC5G_xyyLDG8w",
      description:
        "Selección de alta intensidad para entrenamientos pesados de sentadilla, banca y peso muerto.",
    },
    playlist2: {
      name: "Furia & Concentración",
      tag: "Potencia Olímpica",
      embedUrl:
        "https://open.spotify.com/embed/playlist/2fTZFN3VN7HJpGJ3o8cvYz?utm_source=generator&si=7adbeda29403427e",
      directUrl:
        "https://open.spotify.com/playlist/2fTZFN3VN7HJpGJ3o8cvYz?si=VSj-uBbjSI-i5DwI-ieA1Q",
      description:
        "Banda sonora inmersiva para sesiones de potencia pura, levantamientos balísticos y enfoque mental inquebrantable.",
    },
  };

  const current = playlists[activeTab];

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 p-4 sm:p-6 md:p-8 font-sans selection:bg-emerald-500/30">
      {/* Top Navigation */}
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all text-xs font-mono tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLVER AL MOTOR ZEN</span>
        </button>

        <a
          href={current.directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-black font-mono font-bold text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(29,185,84,0.35)] hover:shadow-[0_0_30px_rgba(29,185,84,0.6)] cursor-pointer"
        >
          <span>ABRIR EN SPOTIFY</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Hero */}
        <div className="rounded-3xl bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950/80 border border-emerald-500/30 p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] tracking-widest uppercase">
                <Music2 className="w-3 h-3" />
                <span>Playlists Oficiales de Entrenamiento</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-mono text-white flex items-center gap-3">
                <span className="text-white font-black tracking-wide drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                  TEMPLO DEL HIERRO
                </span>
                <span className="text-emerald-400 text-base sm:text-lg font-normal">
                  • SPOTIFY
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                Música calibrada para alta intensidad, sincronización neuromuscular y resíntesis de ATP.
              </p>
            </div>

            {/* Quick stats / badges */}
            <div className="flex gap-2 font-mono text-xs">
              <div className="px-3.5 py-2 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
                <span className="block text-amber-400 font-bold flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3" /> 100%
                </span>
                <span className="text-[10px] text-zinc-500">INTENSIDAD</span>
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
                <span className="block text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3" /> ATP
                </span>
                <span className="text-[10px] text-zinc-500">RESÍNTESIS</span>
              </div>
            </div>
          </div>

          {/* Playlist Tabs */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-zinc-800/80">
            <button
              onClick={() => setActiveTab("playlist1")}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                activeTab === "playlist1"
                  ? "bg-emerald-500/20 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                  : "bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700 text-zinc-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {playlists.playlist1.tag}
                </span>
                {activeTab === "playlist1" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-white truncate font-mono">
                {playlists.playlist1.name}
              </p>
            </button>

            <button
              onClick={() => setActiveTab("playlist2")}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                activeTab === "playlist2"
                  ? "bg-emerald-500/20 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                  : "bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700 text-zinc-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {playlists.playlist2.tag}
                </span>
                {activeTab === "playlist2" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-white truncate font-mono">
                {playlists.playlist2.name}
              </p>
            </button>
          </div>
        </div>

        {/* Embedded Spotify Player Box */}
        <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800 p-4 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                <span className="text-emerald-400">▶</span>
                <span>{current.name}</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">{current.description}</p>
            </div>
            <a
              href={current.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono underline shrink-0 cursor-pointer"
            >
              <span>Abrir en app de Spotify</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Spotify iframe embed */}
          <div className="w-full overflow-hidden rounded-2xl border border-zinc-800/80 shadow-2xl bg-black">
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: "16px" }}
              src={current.embedUrl}
              width="100%"
              height="380"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={current.name}
            />
          </div>
        </div>

        {/* Neuromuscular Acoustic Tip */}
        <div className="rounded-2xl bg-zinc-950/70 border border-amber-500/20 p-4 flex items-start gap-3 text-xs text-zinc-300">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-300 font-mono uppercase tracking-wider text-[11px]">
              Efecto Neuroacústico en la Fuerza
            </p>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Entrenar con bandas sonoras de alta cadencia eleva los niveles de dopamina y adrenalina, facilitando el reclutamiento sincrónico de fibras rápidas tipo IIb y acortando la percepción del esfuerzo (RPE).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
