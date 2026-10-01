"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ForgeLanding from "@/app/forge/page";
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

const ZenDashboardClient = dynamic(
  () =>
    import("@/app/components/ZenDashboardClient").then(
      (mod) => mod.ZenDashboardClient
    ),
  {
    ssr: false,
    loading: () => (
      <main className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40" />
          <span className="text-sm font-mono tracking-widest text-amber-400">
            CARGANDO MOTOR ZEN...
          </span>
        </div>
      </main>
    ),
  }
);

function voiceGenderLabel(gender: VoiceGender | undefined): string {
  switch (gender) {
    case "FEMALE":
      return "VOZ MUJER";
    case "MALE":
      return "VOZ HOMBRE";
    case "AUTO":
    case undefined:
      return "VOZ AUTO";
    default: {
      const _exhaustive: never = gender;
      return _exhaustive;
    }
  }
}

function voiceGenderIcon(gender: VoiceGender | undefined): string {
  switch (gender) {
    case "FEMALE":
      return "👩";
    case "MALE":
      return "👨";
    case "AUTO":
    case undefined:
      return "🎙️";
    default: {
      const _exhaustive: never = gender;
      return _exhaustive;
    }
  }
}

function voicePreviewCue(gender: VoiceGender): string {
  switch (gender) {
    case "FEMALE":
      return "¡Voz femenina del coach activada! Vamos con determinación, guerrero.";
    case "MALE":
      return "¡Voz masculina del coach activada! A romperla en la barra.";
    case "AUTO":
      return "Modo automático activado. Uso la mejor voz humana del dispositivo.";
    default: {
      const _exhaustive: never = gender;
      return _exhaustive;
    }
  }
}

function loadSpanishVoices(gender: VoiceGender | undefined): SpeechSynthesisVoice[] {
  return getAvailableSpanishVoices(gender || "AUTO");
}

function TrainingVoiceDock() {
  const [prefs, setPrefs] = useState<CoachAudioPreferences>(() => getAudioPreferences());
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() =>
    loadSpanishVoices(getAudioPreferences().voiceGender)
  );

  const refreshVoices = (gender: VoiceGender | undefined = prefs.voiceGender) => {
    setVoices(loadSpanishVoices(gender));
  };

  const applyGender = (gender: VoiceGender) => {
    const next = setVoiceGender(gender);
    setPrefs(next);
    refreshVoices(gender);
    speakText(voicePreviewCue(gender), next);
  };

  const applySpecificVoice = (uri: string) => {
    const selected = voices.find((voice) => voice.voiceURI === uri);
    const detected = selected ? detectVoiceGender(selected) : prefs.voiceGender;
    const next = saveAudioPreferences({
      preferredVoiceURI: uri,
      voiceGender: detected !== "AUTO" ? detected : prefs.voiceGender,
      voiceEnabled: true,
    });
    setPrefs(next);
    speakText("Voz de coach configurada. Así te voy a acompañar en el entrenamiento.", next);
  };

  const previewCurrentVoice = () => {
    const enabled = prefs.voiceEnabled
      ? prefs
      : saveAudioPreferences({ voiceEnabled: true });
    if (!prefs.voiceEnabled) {
      setPrefs(enabled);
    }
    refreshVoices(enabled.voiceGender);
    speakText(
      "¡Tiempo cumplido! A la barra con máxima determinación, guerrero.",
      enabled
    );
  };

  const toggleCoachVoice = () => {
    const next = saveAudioPreferences({ voiceEnabled: !prefs.voiceEnabled });
    setPrefs(next);
    if (next.voiceEnabled) {
      speakText("Voz del coach activada. Te acompaño en cada serie.", next);
    }
  };

  const activeGender = prefs.voiceGender || "AUTO";
  const selectedVoiceURI =
    prefs.preferredVoiceURI ||
    getBestHumanVoice(undefined, activeGender)?.voiceURI ||
    "";

  return (
    <div className="fixed z-[70] bottom-24 left-3 right-3 md:left-auto md:right-4 md:bottom-8 md:w-[22rem] pointer-events-none">
      <div className="pointer-events-auto ml-auto w-full max-w-md md:max-w-none">
        {open ? (
          <section
            aria-label="Selector de voz del entrenamiento"
            className="rounded-2xl border border-amber-500/40 bg-zinc-950/95 p-3 shadow-2xl shadow-amber-500/10 backdrop-blur-xl space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                  Voz del entrenamiento
                </p>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Elegí mujer, hombre o una voz concreta del dispositivo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-2 py-1 rounded-lg border border-zinc-800 text-[10px] font-mono text-zinc-400 hover:text-zinc-100 cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
              {(["FEMALE", "MALE", "AUTO"] as const).map((gender) => {
                const selected = activeGender === gender;
                return (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => applyGender(gender)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      selected
                        ? gender === "FEMALE"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/50"
                          : gender === "MALE"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                            : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                        : "text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    <span>{voiceGenderIcon(gender)}</span>
                    <span>
                      {gender === "FEMALE" ? "Mujer" : gender === "MALE" ? "Hombre" : "Auto"}
                    </span>
                  </button>
                );
              })}
            </div>

            {voices.length > 0 ? (
              <label className="block space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Timbre concreto
                </span>
                <select
                  value={selectedVoiceURI}
                  onChange={(event) => applySpecificVoice(event.target.value)}
                  onFocus={() => refreshVoices(activeGender)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500/50 cursor-pointer"
                >
                  {voices.map((voice) => {
                    const gender = detectVoiceGender(voice);
                    const icon = voiceGenderIcon(gender);
                    const isTop = voice.name.includes("Natural") || voice.name.includes("Neural");
                    return (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {icon} {isTop ? `⭐ ${voice.name}` : voice.name} ({voice.lang})
                      </option>
                    );
                  })}
                </select>
              </label>
            ) : (
              <button
                type="button"
                onClick={() => refreshVoices(activeGender)}
                className="w-full text-left text-[10px] font-mono text-zinc-500 hover:text-amber-300 cursor-pointer"
              >
                Tocá para cargar las voces humanas del dispositivo.
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={toggleCoachVoice}
                className={`py-2 px-3 rounded-xl border text-[11px] font-mono font-bold cursor-pointer ${
                  prefs.voiceEnabled
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500"
                }`}
              >
                Coach: {prefs.voiceEnabled ? "ON" : "MUTE"}
              </button>
              <button
                type="button"
                onClick={previewCurrentVoice}
                className="py-2 px-3 rounded-xl border border-amber-500/40 bg-amber-500/15 text-[11px] font-mono font-bold text-amber-300 cursor-pointer"
              >
                Probar voz
              </button>
            </div>
          </section>
        ) : (
          <button
            type="button"
            onClick={() => {
              refreshVoices(activeGender);
              setOpen(true);
            }}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/40 bg-zinc-950/95 text-amber-300 shadow-lg shadow-amber-500/10 backdrop-blur-xl text-xs font-mono font-bold cursor-pointer"
            title="Cambiar la voz del coach de entrenamiento"
          >
            <span>{voiceGenderIcon(activeGender)}</span>
            <span>CAMBIAR VOZ</span>
            <span className="text-zinc-500 font-medium">{voiceGenderLabel(activeGender)}</span>
          </button>
        )}
      </div>
    </div>
  );
}

const ClientTrainingVoiceDock = dynamic(
  async () => ({ default: TrainingVoiceDock }),
  { ssr: false }
);

export default function ZenDashboard() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hasEnteredTemple") !== "true";
    }
    return false;
  });

  const handleEnter = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hasEnteredTemple", "true");
    }
    setShowIntro(false);
  };

  if (showIntro) {
    return <ForgeLanding onEnterDirect={handleEnter} />;
  }

  return (
    <>
      <ClientTrainingVoiceDock />
      <ZenDashboardClient />
    </>
  );
}
