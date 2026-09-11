"use client";

import React, { useState } from "react";
import { WARRIOR_APHORISMS, type WarriorAphorism } from "@/lib/warriorWisdom";
import { RefreshCw } from "lucide-react";
import { playTactileClick } from "@/lib/zenAudio";

interface WarriorWisdomWidgetProps {
  className?: string;
}

export function WarriorWisdomWidget({ className = "" }: WarriorWisdomWidgetProps) {
  const [index, setIndex] = useState(0);
  const current: WarriorAphorism = WARRIOR_APHORISMS[index % WARRIOR_APHORISMS.length];

  const handleNext = () => {
    playTactileClick();
    setIndex((prev) => (prev + 1) % WARRIOR_APHORISMS.length);
  };

  return (
    <div className={"p-4 rounded-2xl bg-gradient-to-r " + current.bgGradient + " border border-amber-500/30 text-left space-y-2 shadow-lg transition-all " + className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{current.symbol}</span>
          <div>
            <span className="text-xs font-mono font-bold text-amber-300 block">
              {current.author}
            </span>
            <span className="text-[10px] font-mono text-zinc-400 block">
              {current.tradition} • {current.focus}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 text-[10px] font-mono font-bold border border-zinc-800 transition-all cursor-pointer active:scale-95"
          title="Siguiente máxima iniciática"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Siguiente</span>
        </button>
      </div>

      <p className="text-xs text-zinc-200 italic leading-relaxed">
        &ldquo;{current.quote}&rdquo;
      </p>
    </div>
  );
}
