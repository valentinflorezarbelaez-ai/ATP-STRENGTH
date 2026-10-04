"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Flame, Sparkles,
  RotateCcw, Volume2,
  Eye, Sun, Moon, Laptop, User, Download, Upload, Database, BarChart3
} from "lucide-react";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { OFFLINE_MARKS_NOTE } from "@/app/components/TelemetrySyncBadge";
import { RestClock } from "@/app/components/RestClock";
import { UniversalProtocolModal } from "@/app/components/UniversalProtocolModal";
import { UniversalStrengthCalcModal } from "@/app/components/UniversalStrengthCalcModal";
import { ExerciseVideoModal } from "@/app/components/ExerciseVideoModal";
import { UniversalProtocolCockpit } from "@/app/components/UniversalProtocolCockpit";
import { getExerciseMedia } from "@/lib/exerciseMediaCatalog";
import { playTactileClick } from "@/lib/zenAudio";
import { useWakeLock } from "@/app/hooks/useWakeLock";
import { getAthleteProfile, setAthleteName, type AthleteProfile } from "@/lib/athleteProfile";
import { exportBackupJson, exportHistoryCsv, importBackupJsonFile } from "@/lib/dataPortability";
import type { useZenDashboard } from "@/app/hooks/useZenDashboard";
import {
  acousticEngine,
  getAudioPreferences,
  saveAudioPreferences,
  getAvailableSpanishVoices,
  getBestHumanVoice,
  speakText,
  detectVoiceGender,
  type CoachAudioPreferences,
} from "@/lib/acousticFeedback";

type Dash = ReturnType<typeof useZenDashboard>;

export function CoachGuidedView({
  d,
  onShowSpotify,
  onOpenForge,
}: {
  d: Dash;
  onShowSpotify?: () => void;
  onOpenForge?: () => void;
}) {
  const router = useRouter();
  useWakeLock(d.isRunning);

  const {
    remainingSeconds,
    isRunning,
    restActive,
    timerTitle,
    handleStartTimer,
    togglePlayPause,
    skipRest,
    handleResetDay,
    handleResetExercise,
    toggleCoachMode,
  } = d;

  const [selectedVideoExercise, setSelectedVideoExercise] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const hasSpokenHalfway = React.useRef(false);
  const hasSpoken15s = React.useRef(false);
  const wasRunning = React.useRef(false);
  const [athlete, setAthlete] = useState<AthleteProfile>(() => getAthleteProfile());
  const [athleteNameInput, setAthleteNameInput] = useState(() => getAthleteProfile().name);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showUniversalProtocol, setShowUniversalProtocol] = useState(false);
  const [showUniversalCalc, setShowUniversalCalc] = useState(false);
  const [audioPrefs, setAudioPrefs] = useState<CoachAudioPreferences>(() => getAudioPreferences());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const hasSpoken10sWarning = React.useRef(false);

  React.useEffect(() => {
    const updateVoices = () => {
      const list = getAvailableSpanishVoices(audioPrefs.voiceGender || "AUTO");
      setAvailableVoices(list);
    };
    updateVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [audioPrefs.voiceGender]);

  React.useEffect(() => {
    if (isRunning) {
      wasRunning.current = true;
      // 15 seconds warning
      if (remainingSeconds === 15 && !hasSpoken15s.current) {
        hasSpoken15s.current = true;
        acousticEngine.playRest15sWarningCue();
      }
      // 10 seconds warning
      if (remainingSeconds === 10 && !hasSpoken10sWarning.current) {
        hasSpoken10sWarning.current = true;
        acousticEngine.playRestWarningCue();
      }
      // Halfway recovery reminder
      const duration = d.timerDuration || 180;
      const halfway = Math.floor(duration / 2);
      if (remainingSeconds === halfway && !hasSpokenHalfway.current && duration >= 30) {
        hasSpokenHalfway.current = true;
        acousticEngine.playRestHalfwayCue();
      }
    } else {
      hasSpokenHalfway.current = false;
      hasSpoken15s.current = false;
      hasSpoken10sWarning.current = false;

      // When timer hits zero from active countdown, announce ready cue
      if (wasRunning.current && remainingSeconds === 0) {
        wasRunning.current = false;
        acousticEngine.playSetCompleteCue();
      }
    }
  }, [isRunning, remainingSeconds, d.timerDuration]);

  const toggleVoiceCoach = () => {
    const next = saveAudioPreferences({ voiceEnabled: !audioPrefs.voiceEnabled });
    setAudioPrefs(next);
    if (next.voiceEnabled) {
      acousticEngine.playSetCompleteCue();
    }
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden flex flex-col items-center p-4 md:p-6 pb-32 md:pb-20 font-sans selection:bg-pink-500 selection:text-white">
      {/* Ambient Radial Mesh Backgrounds (Apple Music + Tidal Luxury Style) */}
      <div className="ambient-mesh-light" aria-hidden="true">
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
        <div className="ambient-orb-3" />
      </div>

      {/* 1. Top Coach Header (Mobile-First Architecture) */}
      <header className="order-1 w-full max-w-3xl flex flex-col gap-2.5 pb-3 mb-2">
        {/* Top Row: Brand & MODO PRO Button */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-wide text-white uppercase">
                  ATP <span className="text-amber-400">COACH</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  PROTOCOLO PR
                </span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                {d.activeExercise?.name ?? "Tu ejercicio"}
              </p>
            </div>
          </div>

          {/* MODO PRO Button */}
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              toggleCoachMode();
            }}
            className="flex items-center gap-1.5 min-h-11 px-3.5 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-200 hover:border-amber-500/40 hover:text-amber-200 transition-all active:scale-95 cursor-pointer flex-shrink-0"
            title="Cambiar a Modo Pro (Dashboard Analítico)"
          >
            <Eye className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="tracking-wide">MODO PRO</span>
          </button>
        </div>

        </header>

        {d.backendOnline === false && (
          <p className="order-1 w-full max-w-3xl mb-3 text-sm leading-relaxed text-zinc-300" role="status">
            {OFFLINE_MARKS_NOTE}
          </p>
        )}

        {/* Herramientas, debajo de la serie para no competir con el ejercicio */}
        <div className="order-3 mt-6 w-full max-w-3xl flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 flex-nowrap">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              if (onOpenForge) {
                onOpenForge();
              } else {
                router.push("/forge");
              }
            }}
            className="flex items-center gap-1.5 min-h-11 px-3 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-red-500/15 to-amber-500/15 text-amber-300 hover:from-amber-500/25 hover:to-red-500/25 hover:border-amber-400/60 transition-all text-xs font-mono font-bold cursor-pointer shadow-[0_0_14px_rgba(245,158,11,0.2)] active:scale-95 flex-shrink-0"
            title="Entrar a La Forja de los Guerreros y reproducir el Himno"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>FORJA & HIMNO</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setShowUniversalProtocol(true);
            }}
            className="flex items-center gap-1.5 min-h-11 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400/50 transition-all text-xs font-mono font-bold cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.15)] flex-shrink-0"
            title="Guía completa del Protocolo Universal PR"
          >
            <span>⚡</span>
            <span>GUÍA PROTOCOLO</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setShowUniversalCalc(true);
            }}
            className="flex items-center gap-1.5 min-h-11 px-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-amber-400 hover:border-amber-500/50 transition-all text-xs font-mono font-bold cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
            title="Calculadora Universal de Fases Neuromusculares"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>CALC FASES</span>
          </button>

          <a
            href="https://open.spotify.com/intl-es"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (onShowSpotify) {
                e.preventDefault();
                onShowSpotify();
                return;
              }
              playTactileClick();
              try { window.location.href = "spotify:"; } catch {}
            }}
            className="flex items-center gap-1.5 min-h-11 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-all text-xs font-mono font-bold cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.15)] flex-shrink-0"
            title="Abrir Spotify directamente"
          >
            <span>🎵</span>
            <span>SPOTIFY</span>
          </a>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setShowProfileModal(true);
            }}
            className="flex items-center gap-1.5 min-h-11 px-3 rounded-xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 backdrop-blur-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-mono font-medium transition-all active:scale-95 cursor-pointer shadow-sm flex-shrink-0"
            title="Perfil de Atleta y Copias de Seguridad"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-200">{athlete.name}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={d.toggleTheme}
            className="flex items-center gap-1.5 min-h-11 px-3 rounded-xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 backdrop-blur-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-mono font-medium transition-all active:scale-95 cursor-pointer shadow-sm flex-shrink-0"
            title={
              d.themeMode === 'dark'
                ? "Modo Oscuro. Clic para Modo Sistema"
                : d.themeMode === 'light'
                ? "Modo Claro. Clic para Modo Oscuro"
                : "Modo Sistema. Clic para Modo Claro"
            }
          >
            {d.themeMode === 'dark' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-zinc-200">DARK</span>
              </>
            ) : d.themeMode === 'light' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-zinc-800">LIGHT</span>
              </>
            ) : (
              <>
                <Laptop className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-zinc-300">AUTO</span>
              </>
            )}
          </button>

          {/* Voice Coach Toggle Pill */}
          <button
            type="button"
            onClick={toggleVoiceCoach}
            className={`flex items-center gap-1.5 min-h-11 px-3 rounded-xl border text-xs font-mono font-medium transition-all active:scale-95 cursor-pointer flex-shrink-0 ${
              audioPrefs.voiceEnabled
                ? "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-sm"
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
            }`}
            title={audioPrefs.voiceEnabled ? "Voz Coach activada (clic para silenciar)" : "Voz Coach silenciada (clic para activar)"}
          >
            <Volume2 className={`w-3.5 h-3.5 ${audioPrefs.voiceEnabled ? "text-amber-400" : "text-zinc-500"}`} />
            <span>Voz: {audioPrefs.voiceEnabled ? "activada" : "silencio"}</span>
          </button>

          {/* Reset Action */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(!showResetConfirm)}
            className="flex items-center gap-1.5 min-h-11 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-amber-400 transition-all cursor-pointer flex-shrink-0"
            title="Reiniciar progreso"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-xs">Reiniciar</span>
          </button>
        </div>

      {/* PWA Standalone Install Banner */}
      <div className="order-4 w-full max-w-3xl">
        <PwaInstallPrompt />
      </div>

      {/* Reset Popover Menu */}
      {showResetConfirm && (
        <div className="order-2 w-full max-w-3xl mb-4 p-4 rounded-2xl bg-zinc-950 border border-red-500/30 text-sm space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="font-semibold text-zinc-100">¿Reiniciar el entrenamiento de hoy?</p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Se borran las series marcadas de hoy. Las marcas guardadas en este dispositivo se quedan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="min-h-11 shrink-0 px-3 rounded-xl border border-zinc-800 text-sm text-zinc-300 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                handleResetExercise();
                setShowResetConfirm(false);
              }}
              className="flex-1 min-h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 cursor-pointer"
            >
              Este ejercicio
            </button>
            <button
              type="button"
              onClick={() => {
                handleResetDay();
                setShowResetConfirm(false);
              }}
              className="flex-1 min-h-11 px-3 rounded-xl bg-red-950/40 border border-red-500/40 text-sm text-red-200 cursor-pointer"
            >
              Todo el día
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Guided Area: Universal Protocol PR Cockpit or Active Rest Timer */}
      <section className="order-2 w-full max-w-3xl flex-1 flex flex-col justify-center my-2">
        {restActive && (
          <RestClock
            remainingSeconds={remainingSeconds}
            isRunning={isRunning}
            onReady={skipRest}
            onTogglePause={togglePlayPause}
            onAddThirty={() => handleStartTimer(remainingSeconds + 30, timerTitle)}
          />
        )}

        <div className={`w-full space-y-4 ${restActive ? "hidden" : ""}`}>
          <UniversalProtocolCockpit
            onStartTimer={handleStartTimer}
            onOpenVideo={(name) => setSelectedVideoExercise(name)}
          />
        </div>
      </section>

      {/* 3. Athlete Profile & Data Portability Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Perfil</h3>
                  <span className="text-[11px] text-zinc-500">En este dispositivo</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setShowProfileModal(false);
                }}
                aria-label="Cerrar perfil"
                className="min-h-11 min-w-11 px-3 rounded-xl border border-zinc-800 text-sm text-zinc-300 cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2 pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Aspecto</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    d.setThemeMode('light');
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                    d.themeMode === 'light'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-sm font-bold'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Claro</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    d.setThemeMode('dark');
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                    d.themeMode === 'dark'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-sm font-bold'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Oscuro</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    d.setThemeMode('system');
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                    d.themeMode === 'system'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-sm font-bold'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  <span>Sistema</span>
                </button>
              </div>
            </div>

            {/* Audio & Biofeedback Coach Panel */}
            <div className="space-y-2 pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-200">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Sonido</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  const next = saveAudioPreferences({ voiceEnabled: !audioPrefs.voiceEnabled });
                  setAudioPrefs(next);
                  speakText(
                    next.voiceEnabled ? "Voz del coach activada." : "Voz del coach silenciada.",
                    next
                  );
                }}
                className={`w-full min-h-11 px-3 rounded-xl border text-sm font-medium flex items-center justify-between cursor-pointer ${
                  audioPrefs.voiceEnabled
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400"
                }`}
              >
                <span>Voz del coach</span>
                <span>{audioPrefs.voiceEnabled ? "Activada" : "Silencio"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  const next = saveAudioPreferences({ soundEnabled: !audioPrefs.soundEnabled });
                  setAudioPrefs(next);
                }}
                className={`w-full min-h-11 px-3 rounded-xl border text-sm font-medium flex items-center justify-between cursor-pointer ${
                  audioPrefs.soundEnabled
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400"
                }`}
              >
                <span>Campanas</span>
                <span>{audioPrefs.soundEnabled ? "Prendidas" : "Apagadas"}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    acousticEngine.playSetCompleteCue();
                  }}
                  className="min-h-11 px-3 rounded-xl border border-zinc-800 text-sm text-zinc-200 cursor-pointer"
                >
                  Probar campana
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    speakText("Tiempo cumplido. A la barra.", audioPrefs);
                  }}
                  className="min-h-11 px-3 rounded-xl border border-zinc-800 text-sm text-zinc-200 cursor-pointer"
                >
                  Probar voz
                </button>
              </div>

                {availableVoices.length > 0 ? (
                  <select
                    value={audioPrefs.preferredVoiceURI || getBestHumanVoice(undefined, audioPrefs.voiceGender)?.voiceURI || ""}
                    onChange={(e) => {
                      const uri = e.target.value;
                      const selectedVoice = availableVoices.find((v) => v.voiceURI === uri);
                      const detectedGender = selectedVoice ? detectVoiceGender(selectedVoice) : audioPrefs.voiceGender;
                      const next = saveAudioPreferences({
                        preferredVoiceURI: uri,
                        voiceGender: detectedGender !== "AUTO" ? detectedGender : audioPrefs.voiceGender,
                      });
                      setAudioPrefs(next);
                      speakText("Voz de coach configurada.", next);
                    }}
                    className="w-full min-h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 cursor-pointer"
                  >
                    {availableVoices.map((v) => {
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
                ) : (
                  <p className="text-sm text-zinc-500">
                    La voz usa la del teléfono.
                  </p>
                )}
            </div>

            {/* Athlete Name Field */}
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-400 block">
                Nombre
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={athleteNameInput}
                  onChange={(e) => setAthleteNameInput(e.target.value)}
                  className="flex-1 min-h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white"
                  placeholder="Tu nombre"
                />
                <button
                  type="button"
                  onClick={() => {
                    try {
                      playTactileClick();
                      const updated = setAthleteName(athleteNameInput);
                      setAthlete(updated);
                      setBackupMsg("Nombre guardado correctamente");
                      setTimeout(() => setBackupMsg(null), 3000);
                    } catch {}
                  }}
                  className="min-h-11 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-sm font-semibold cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </div>

            {/* Data Portability */}
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <span className="text-sm text-zinc-300 block">
                Copias en este dispositivo
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    exportBackupJson();
                    setBackupMsg("Copia de seguridad (.json) descargada");
                  }}
                  className="min-h-11 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Descargar JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    exportHistoryCsv();
                    setBackupMsg("Historial (.csv) descargado");
                  }}
                  className="min-h-11 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Historial CSV</span>
                </button>
              </div>

              {/* Restore JSON */}
              <label className="w-full min-h-11 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 text-zinc-200 text-sm flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
                <span>Restaurar Copia JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      playTactileClick();
                      const res = await importBackupJsonFile(file);
                      if (res.success) {
                        setBackupMsg("¡Copia restaurada! Recargando datos...");
                        setTimeout(() => window.location.reload(), 1200);
                      }
                    } catch (err: unknown) {
                      setBackupMsg(err instanceof Error ? err.message : "Error de restauración");
                    }
                  }}
                />
              </label>
            </div>

            {/* Direct Access to La Forja & Anthem */}
            <div className="pt-2 border-t border-zinc-900">
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setShowProfileModal(false);
                  if (onOpenForge) {
                    onOpenForge();
                  } else {
                    router.push("/forge");
                  }
                }}
                className="w-full min-h-11 px-3 rounded-xl border border-amber-500/40 text-amber-200 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Ir a la forja</span>
              </button>
            </div>

            {backupMsg && (
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-amber-500/30 text-[11px] font-mono text-amber-300 text-center animate-in fade-in">
                {backupMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exercise Technical Video Demo Modal */}
      {selectedVideoExercise && (
        <ExerciseVideoModal
          media={getExerciseMedia(selectedVideoExercise)}
          isOpen={!!selectedVideoExercise}
          onClose={() => setSelectedVideoExercise(null)}
          onStartExercise={() => {
            setSelectedVideoExercise(null);
          }}
        />
      )}

      {/* Modals for reference & calculations */}
      <UniversalProtocolModal
        isOpen={showUniversalProtocol}
        onClose={() => setShowUniversalProtocol(false)}
        onStartTimer={(seconds, title) => {
          handleStartTimer(seconds, title);
        }}
      />
      <UniversalStrengthCalcModal
        isOpen={showUniversalCalc}
        onClose={() => setShowUniversalCalc(false)}
        onStartTimer={(seconds, title) => {
          setShowUniversalCalc(false);
          handleStartTimer(seconds, title);
        }}
      />

    </main>
  );
}
