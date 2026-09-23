"use client";

import React from "react";
import { ArrowLeft, ExternalLink, Music2 } from "lucide-react";

interface SpotifyTrainingViewProps {
  onBack: () => void;
}

const SPOTIFY_WEB_URL = "https://open.spotify.com/playlist/4Gn8FuTCHfTrQOhQOvkBjJ?si=pAz-qBSVQyC5G_xyyLDG8w";
const SPOTIFY_URI = "spotify:playlist:4Gn8FuTCHfTrQOhQOvkBjJ";

export function SpotifyTrainingView({ onBack }: SpotifyTrainingViewProps) {
  const handleOpenSpotify = () => {
    // Attempt deep-link protocol first to open native Spotify app directly
    try {
      window.location.href = SPOTIFY_URI;
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 p-4 sm:p-6 md:p-8 font-sans selection:bg-emerald-500/30 flex flex-col justify-between">
      {/* Top Navigation */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all text-xs font-mono tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLVER AL MOTOR ZEN</span>
        </button>
      </div>

      {/* Main Centered Action Card */}
      <div className="max-w-xl mx-auto w-full my-auto py-12">
        <div className="rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-8 sm:p-12 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1db954]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Spotify Icon Glow */}
            <div className="w-20 h-20 rounded-full bg-[#1db954]/15 border border-[#1db954]/30 flex items-center justify-center text-[#1db954] shadow-[0_0_40px_rgba(29,185,84,0.3)]">
              <Music2 className="w-10 h-10" />
            </div>

            {/* Title & Info */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#1db954]">
                Playlist Oficial de Entrenamiento
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                TEMPLO DEL HIERRO
              </h1>
              <p className="text-xs text-zinc-400 font-mono">
                Forja & Máximo Poder • Hipertrofia & Fuerza
              </p>
            </div>

            {/* Single Action Button directly redirecting to Spotify App */}
            <a
              href={SPOTIFY_WEB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenSpotify}
              className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#1db954] hover:bg-[#1ed760] text-black font-mono font-black text-sm tracking-wider uppercase transition-all shadow-[0_0_30px_rgba(29,185,84,0.4)] hover:shadow-[0_0_50px_rgba(29,185,84,0.7)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Abrir en la App de Spotify</span>
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full text-center text-[10px] font-mono text-zinc-600">
        ATP ZEN ENGINE • SINCRONIZACIÓN DE MÚSICA
      </div>
    </div>
  );
}
