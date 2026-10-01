"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Volume2, VolumeX } from "lucide-react";
import { playTactileClick } from "@/lib/zenAudio";
import {
  COACH_VOICE_CHANGED_EVENT,
  detectVoiceGender,
  getAudioPreferences,
  getAvailableSpanishVoices,
  getBestHumanVoice,
  resolveDisplayedVoiceGender,
  saveAudioPreferences,
  setVoiceGender,
  speakText,
  type CoachAudioPreferences,
  type VoiceGender,
} from "@/lib/acousticFeedback";

export type CoachVoicePickerVariant = "chip" | "compact" | "panel";

const GENDER_OPTIONS: ReadonlyArray<{ value: VoiceGender; icon: string; label: string }> = [
  { value: "FEMALE", icon: "👩", label: "Mujer" },
  { value: "MALE", icon: "👨", label: "Hombre" },
  { value: "AUTO", icon: "⭐", label: "Auto" },
];

const PREVIEW_LINE =
  "Esta es la voz del coach para tu entrenamiento. Elegí mujer u hombre cuando quieras cambiarla.";

function genderUi(gender: VoiceGender): { icon: string; short: string; chipClass: string } {
  switch (gender) {
    case "FEMALE":
      return {
        icon: "👩",
        short: "MUJER",
        chipClass:
          "bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25 shadow-[0_0_12px_rgba(244,63,94,0.15)]",
      };
    case "MALE":
      return {
        icon: "👨",
        short: "HOMBRE",
        chipClass:
          "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
      };
    case "AUTO":
      return {
        icon: "🎙️",
        short: "AUTO",
        chipClass: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25",
      };
    default: {
      const _exhaustive: never = gender;
      return _exhaustive;
    }
  }
}

function genderButtonClass(active: boolean, value: VoiceGender): string {
  if (!active) return "text-zinc-400 hover:text-zinc-200";
  switch (value) {
    case "FEMALE":
      return "bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm";
    case "MALE":
      return "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm";
    case "AUTO":
      return "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm";
    default: {
      const _exhaustive: never = value;
      return _exhaustive;
    }
  }
}

function VoiceControls({
  prefs,
  voices,
  onPrefsChange,
}: {
  prefs: CoachAudioPreferences;
  voices: SpeechSynthesisVoice[];
  onPrefsChange: (next: CoachAudioPreferences) => void;
}) {
  const selectedUri =
    prefs.preferredVoiceURI || getBestHumanVoice(undefined, prefs.voiceGender)?.voiceURI || "";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            const next = saveAudioPreferences({ voiceEnabled: !prefs.voiceEnabled });
            onPrefsChange(next);
            if (next.voiceEnabled) {
              speakText("Voz del coach activada.", next);
            }
          }}
          className={`py-2 px-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-between cursor-pointer transition-all ${
            prefs.voiceEnabled
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
              : "bg-zinc-900 border-zinc-800 text-zinc-500"
          }`}
        >
          <span>Voz Coach:</span>
          <span className="font-bold">{prefs.voiceEnabled ? "ACTIVA" : "MUTED"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTactileClick();
            const next = saveAudioPreferences({ soundEnabled: !prefs.soundEnabled });
            onPrefsChange(next);
          }}
          className={`py-2 px-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-between cursor-pointer transition-all ${
            prefs.soundEnabled
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
              : "bg-zinc-900 border-zinc-800 text-zinc-500"
          }`}
        >
          <span>Campanas:</span>
          <span className="font-bold">{prefs.soundEnabled ? "ON" : "OFF"}</span>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-400">Timbre del coach</span>
        <button
          type="button"
          onClick={() => {
            playTactileClick();
            speakText(PREVIEW_LINE, prefs);
          }}
          className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>🎙️</span>
          <span>Probar voz</span>
        </button>
      </div>

      <div
        className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono"
        role="group"
        aria-label="Género de la voz del coach"
      >
        {GENDER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              playTactileClick();
              const next = setVoiceGender(option.value);
              onPrefsChange(next);
              switch (option.value) {
                case "FEMALE":
                  speakText("¡Voz femenina activada! Vamos con determinación.", next);
                  break;
                case "MALE":
                  speakText("¡Voz masculina activada! A la barra.", next);
                  break;
                case "AUTO":
                  speakText("Modo automático activado. Elijo la mejor voz del dispositivo.", next);
                  break;
                default: {
                  const _exhaustive: never = option.value;
                  return _exhaustive;
                }
              }
            }}
            className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${genderButtonClass(
              prefs.voiceGender === option.value ||
                (option.value === "AUTO" && !prefs.voiceGender),
              option.value
            )}`}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {voices.length > 0 ? (
        <label className="block space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Voz del dispositivo
          </span>
          <select
            value={selectedUri}
            onChange={(e) => {
              const uri = e.target.value;
              const selectedVoice = voices.find((v) => v.voiceURI === uri);
              const detectedGender = selectedVoice
                ? detectVoiceGender(selectedVoice)
                : prefs.voiceGender;
              const next = saveAudioPreferences({
                preferredVoiceURI: uri,
                voiceGender: detectedGender !== "AUTO" ? detectedGender : prefs.voiceGender,
              });
              onPrefsChange(next);
              speakText("Voz de coach configurada.", next);
            }}
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            {voices.map((v) => {
              const gender = detectVoiceGender(v);
              const icon = gender === "FEMALE" ? "👩" : gender === "MALE" ? "👨" : "🎙️";
              const isTop = v.name.includes("Natural") || v.name.includes("Neural");
              return (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {icon} {isTop ? `⭐ ${v.name}` : v.name} ({v.lang})
                </option>
              );
            })}
          </select>
        </label>
      ) : (
        <p className="text-[10px] text-zinc-500 font-mono">
          Usá Mujer u Hombre para cambiar la voz. El listado del dispositivo aparece cuando el
          navegador carga las voces.
        </p>
      )}
    </div>
  );
}

export function CoachVoicePicker({
  variant = "chip",
  className = "",
  onPrefsChange,
}: {
  variant?: CoachVoicePickerVariant;
  className?: string;
  onPrefsChange?: (prefs: CoachAudioPreferences) => void;
}) {
  const [prefs, setPrefs] = useState<CoachAudioPreferences>(() => getAudioPreferences());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [open, setOpen] = useState(variant === "panel");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const applyPrefs = (next: CoachAudioPreferences) => {
      setPrefs(next);
      onPrefsChange?.(next);
    };

    const syncFromStorage = () => {
      applyPrefs(getAudioPreferences());
    };

    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<CoachAudioPreferences>).detail;
      if (detail) applyPrefs(detail);
      else syncFromStorage();
    };

    window.addEventListener(COACH_VOICE_CHANGED_EVENT, onCustom);
    return () => {
      window.removeEventListener(COACH_VOICE_CHANGED_EVENT, onCustom);
    };
  }, [onPrefsChange]);

  useEffect(() => {
    const updateVoices = () => {
      setAvailableVoices(getAvailableSpanishVoices(prefs.voiceGender || "AUTO"));
    };
    updateVoices();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (typeof window.speechSynthesis.addEventListener === "function") {
      window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
      };
    }
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return undefined;
  }, [prefs.voiceGender]);

  useEffect(() => {
    if (!open || variant === "panel") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, variant]);

  const activeVoice = useMemo(
    () => getBestHumanVoice(prefs.preferredVoiceURI, prefs.voiceGender || "AUTO"),
    [prefs.preferredVoiceURI, prefs.voiceGender]
  );
  const displayedGender = resolveDisplayedVoiceGender(prefs, activeVoice);
  const ui = genderUi(displayedGender);

  const handlePrefsChange = (next: CoachAudioPreferences) => {
    setPrefs(next);
    onPrefsChange?.(next);
  };

  if (variant === "panel") {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-300">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Biofeedback Sonoro & Voz Coach</span>
          </div>
        </div>
        <VoiceControls prefs={prefs} voices={availableVoices} onPrefsChange={handlePrefsChange} />
      </div>
    );
  }

  const chip = (
    <button
      type="button"
      onClick={() => {
        playTactileClick();
        setOpen(true);
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${
        prefs.voiceEnabled ? ui.chipClass : "bg-zinc-900 border-zinc-800 text-zinc-500"
      } ${className}`}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label="Cambiar voz del entrenamiento"
      title="Cambiar voz del entrenamiento (mujer, hombre o voz del dispositivo)"
    >
      {prefs.voiceEnabled ? (
        <Volume2 className="w-3.5 h-3.5" />
      ) : (
        <VolumeX className="w-3.5 h-3.5" />
      )}
      <span className="text-sm" aria-hidden="true">
        {ui.icon}
      </span>
      <span className={variant === "compact" ? "hidden sm:inline" : undefined}>
        VOZ {ui.short}
      </span>
    </button>
  );

  const dialog =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[1000000] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="coach-voice-picker-title"
              className="w-full max-w-md p-5 sm:p-6 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div>
                  <h3
                    id="coach-voice-picker-title"
                    className="text-sm font-bold text-white uppercase tracking-wider"
                  >
                    Voz del entrenamiento
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    Elegí mujer, hombre o una voz concreta del dispositivo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setOpen(false);
                  }}
                  className="text-zinc-500 hover:text-zinc-300 font-mono text-xs cursor-pointer p-1"
                >
                  Cerrar ✕
                </button>
              </div>
              <VoiceControls
                prefs={prefs}
                voices={availableVoices}
                onPrefsChange={handlePrefsChange}
              />
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {chip}
      {dialog}
    </>
  );
}
