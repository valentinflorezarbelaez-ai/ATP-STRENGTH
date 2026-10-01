"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  detectVoiceGender,
  getAudioPreferences,
  getAvailableSpanishVoices,
  getBestHumanVoice,
  saveAudioPreferences,
  setVoiceGender,
  speakText,
  type CoachAudioPreferences,
  type VoiceGender,
} from "@/lib/acousticFeedback";
import { playTactileClick } from "@/lib/zenAudio";

export const TRAINING_VOICE_CHANGED_EVENT = "atp-coach-voice-changed";

export function publishTrainingVoiceChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(TRAINING_VOICE_CHANGED_EVENT));
}

const GENDER_OPTIONS: VoiceGender[] = ["FEMALE", "MALE", "AUTO"];

function labelForGender(gender: VoiceGender): string {
  switch (gender) {
    case "FEMALE":
      return "Mujer";
    case "MALE":
      return "Hombre";
    case "AUTO":
      return "Auto";
    default: {
      const exhaustive: never = gender;
      return exhaustive;
    }
  }
}

function emojiForGender(gender: VoiceGender): string {
  switch (gender) {
    case "FEMALE":
      return "👩";
    case "MALE":
      return "👨";
    case "AUTO":
      return "🎙️";
    default: {
      const exhaustive: never = gender;
      return exhaustive;
    }
  }
}

function activeGender(prefs: CoachAudioPreferences): VoiceGender {
  return prefs.voiceGender || "AUTO";
}

export function TrainingVoicePicker() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<CoachAudioPreferences>(() => getAudioPreferences());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const gender = activeGender(prefs);

  useEffect(() => {
    const refresh = () => {
      const current = getAudioPreferences();
      setPrefs(current);
      setVoices(getAvailableSpanishVoices(current.voiceGender || "AUTO"));
    };

    refresh();

    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    synth.addEventListener("voiceschanged", refresh);
    window.addEventListener(TRAINING_VOICE_CHANGED_EVENT, refresh);
    return () => {
      synth.removeEventListener("voiceschanged", refresh);
      window.removeEventListener(TRAINING_VOICE_CHANGED_EVENT, refresh);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const selectedVoice =
    voices.find((voice) => voice.voiceURI === prefs.preferredVoiceURI) ||
    getBestHumanVoice(prefs.preferredVoiceURI, gender);
  const buttonLabel = selectedVoice?.name || labelForGender(gender);

  const preview = (next: CoachAudioPreferences) => {
    setPrefs(next);
    setVoices(getAvailableSpanishVoices(next.voiceGender || "AUTO"));
    publishTrainingVoiceChange();
    speakText("Esta es la voz de tu entrenamiento.", next);
  };

  const chooseGender = (nextGender: VoiceGender) => {
    playTactileClick();
    preview(setVoiceGender(nextGender));
  };

  const chooseVoice = (uri: string) => {
    const selected = voices.find((voice) => voice.voiceURI === uri);
    const detected = selected ? detectVoiceGender(selected) : gender;
    const nextGender = detected === "AUTO" ? gender : detected;
    const nextPitch = nextGender === "FEMALE" ? 1.02 : nextGender === "MALE" ? 0.92 : prefs.voicePitch;
    const next = saveAudioPreferences({
      preferredVoiceURI: uri,
      voiceGender: nextGender,
      voicePitch: nextPitch,
    });
    preview(next);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          playTactileClick();
          const current = getAudioPreferences();
          setPrefs(current);
          setVoices(getAvailableSpanishVoices(current.voiceGender || "AUTO"));
          setOpen((value) => !value);
        }}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-sm max-w-[14rem] ${
          gender === "FEMALE"
            ? "bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25"
            : gender === "MALE"
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
              : "bg-cyan-500/10 border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/20"
        }`}
        title="Cambiar la voz del entrenamiento"
      >
        <span className="text-sm" aria-hidden="true">
          {emojiForGender(gender)}
        </span>
        <span className="truncate">{buttonLabel}</span>
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-zinc-400">Voz del entrenamiento</span>
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                speakText("Esta es la voz de tu entrenamiento.", prefs);
              }}
              className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
            >
              Probar voz
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1 text-xs font-mono">
            {GENDER_OPTIONS.map((option) => {
              const selected = gender === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => chooseGender(option)}
                  className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                    selected
                      ? option === "FEMALE"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/50"
                        : option === "MALE"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                      : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                  }`}
                >
                  {emojiForGender(option)} {labelForGender(option)}
                </button>
              );
            })}
          </div>

          {voices.length > 0 ? (
            <select
              aria-label="Elegir voz del entrenamiento"
              value={prefs.preferredVoiceURI || selectedVoice?.voiceURI || ""}
              onChange={(event) => chooseVoice(event.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              {voices.map((voice) => {
                const voiceGender = detectVoiceGender(voice);
                const icon = emojiForGender(voiceGender);
                const featured = voice.name.includes("Natural") || voice.name.includes("Neural");
                return (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {icon} {featured ? `⭐ ${voice.name}` : voice.name} ({voice.lang})
                  </option>
                );
              })}
            </select>
          ) : (
            <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
              Este navegador todavía no publicó voces. Mujer, Hombre o Auto se aplican en cuanto haya una disponible.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
