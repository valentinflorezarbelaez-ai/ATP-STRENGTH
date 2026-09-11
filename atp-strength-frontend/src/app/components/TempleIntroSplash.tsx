"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Zap, Sparkles, X } from "lucide-react";
import { getDailyAphorism } from "@/lib/warriorWisdom";
import { playChime, playTactileClick } from "@/lib/zenAudio";

interface TempleIntroSplashProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TempleIntroSplash({ isOpen, onClose }: TempleIntroSplashProps) {
  const [activeTab, setActiveTab] = useState<"titans" | "warriors">("titans");
  const aphorism = getDailyAphorism();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Lightning Flash Effect on Mount */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-amber-500/10 via-transparent to-black animate-pulse opacity-40" />

      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-zinc-950 border-2 border-amber-500/40 shadow-[0_0_80px_rgba(204,164,59,0.25)] p-5 sm:p-7 text-center space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer z-10"
          title="Cerrar Templo"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Heroic Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>El Templo de la Fuerza Iniciática</span>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            Donde se Templa el Carácter
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 italic max-w-lg mx-auto leading-relaxed">
            &ldquo;A las grandes alturas solo se llega con sacrificio, fuego interior y disciplina inquebrantable.&rdquo;
          </p>
        </div>

        {/* Tab Switcher: Titans vs Warriors */}
        <div className="flex gap-2 justify-center pt-1">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab("titans");
            }}
            className={"px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer " + (
              activeTab === "titans"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm"
                : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300"
            )}
          >
            ⚡ Perseo &amp; Hércules
          </button>
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setActiveTab("warriors");
            }}
            className={"px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer " + (
              activeTab === "warriors"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm"
                : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300"
            )}
          >
            ⚔️ Leónidas &amp; Musashi
          </button>
        </div>

        {/* Classical Artwork Showcase */}
        <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-black">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={activeTab === "titans" ? "/images/atp_titans_temple.jpg" : "/images/warriors_musashi_leonidas.jpg"}
              alt={activeTab === "titans" ? "Perseo y Hércules Victoria Divina" : "Miyamoto Musashi y Leónidas Espartano"}
              fill
              className="object-cover transition-opacity duration-300"
              priority
            />
          </div>
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent text-left">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
              {activeTab === "titans" ? "Victoria Divina & Virtus Indomita" : "Vía del Guerrero • El Código del Acero"}
            </span>
            <p className="text-xs text-zinc-200">
              {activeTab === "titans"
                ? "Perseo decapitando la debilidad mental; Hércules transmutando el dolor en poder divino."
                : "Leónidas con temple inquebrantable; Musashi con la espada de la concentración absoluta."}
            </p>
          </div>
        </div>

        {/* Daily Warrior Aphorism Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-black border border-amber-500/30 text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
              <span>{aphorism.symbol}</span>
              <span>{aphorism.author} ({aphorism.tradition})</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase">
              {aphorism.focus}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-200 italic leading-relaxed">
            &ldquo;{aphorism.quote}&rdquo;
          </p>
        </div>

        {/* Enter Temple Action Button */}
        <button
          type="button"
          onClick={() => {
            playChime(true);
            onClose();
          }}
          className="w-full h-15 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black font-black text-sm sm:text-base uppercase tracking-wider shadow-2xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span>Entrar al Templo y Dominar el Acero ⚔️</span>
        </button>
      </div>
    </div>
  );
}
