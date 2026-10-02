"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  Volume2,
  Bot,
  User,
} from "lucide-react";
import { queryCoachKnowledge } from "@/lib/coachKnowledgeBase.mjs";
import {
  speakText,
  getAudioPreferences,
  toggleVoiceGender,
  type CoachAudioPreferences,
} from "@/lib/acousticFeedback";
import { playTactileClick, playChime } from "@/lib/zenAudio";

export interface CoachChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExercise?: string;
  currentWeight?: number;
  currentReps?: string;
  currentRpe?: number;
  isLocked?: boolean;
  remainingHours?: number;
  remainingMinutes?: number;
}

interface ChatMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: string;
  followUps?: string[];
}

export function CoachChatModal({
  isOpen,
  onClose,
  currentExercise = "Sentadilla Trasera",
  currentWeight = 100,
  currentReps = "5",
  currentRpe = 8,
  isLocked = false,
  remainingHours = 48,
  remainingMinutes = 0,
}: CoachChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "m0",
      sender: "coach",
      text: `¡Hola! Soy tu Coach de Fuerza. Estoy acá para guiarte en ${currentExercise}. Podés preguntarme sobre la técnica exacta, cuánto tiempo descansar entre series o sesiones, qué hacer en cada fase o cómo autoregularte.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      followUps: [
        "¿Cómo hago la técnica correcta?",
        "¿Cuánto debo descansar?",
        "¿Qué hago en esta serie?",
        isLocked ? "¿Por qué está bloqueado el ejercicio?" : "¿Cuánto descanso entre días?",
      ].filter(Boolean),
    },
  ]);

  const [input, setInput] = useState("");
  const [audioPrefs, setAudioPrefs] = useState<CoachAudioPreferences>(() => getAudioPreferences());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idCounterRef = useRef(1);

  const isTitan = audioPrefs.coachPersona === "TITAN" || audioPrefs.voiceGender === "MALE";
  const coachIcon = isTitan ? "🗿" : audioPrefs.coachPersona === "ELITE" || audioPrefs.voiceGender === "FEMALE" ? "👩" : "⚡";
  const coachLabel = isTitan ? "COACH TITÁN (LA ROCA)" : "COACH ÉLITE IA";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    playTactileClick();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: ChatMessage = {
      id: `u-${idCounterRef.current++}`,
      sender: "user",
      text: query,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate instant intelligent coaching response
    setTimeout(() => {
      const response = queryCoachKnowledge(query, {
        currentExercise,
        currentWeight,
        currentReps,
        currentRpe,
        isLocked,
        remainingHours,
        remainingMinutes,
      });

      const coachMsg: ChatMessage = {
        id: `c-${idCounterRef.current++}`,
        sender: "coach",
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        followUps: response.followUps,
      };

      setMessages((prev) => [...prev, coachMsg]);
      playChime(false);
    }, 150);
  };

  const handleSpeak = (text: string) => {
    playTactileClick();
    speakText(text, audioPrefs);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-[88vh] max-h-[720px] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-900 bg-zinc-900/60 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${
              isTitan
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                : "bg-rose-500/15 border-rose-500/40 text-rose-400"
            }`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  isTitan ? "text-amber-400" : "text-rose-400"
                }`}>
                  {coachLabel}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    const next = toggleVoiceGender();
                    setAudioPrefs(next);
                    speakText(
                      next.coachPersona === "TITAN" || next.voiceGender === "MALE"
                        ? "¡Voz Titán activada! Estilo La Roca, fuerza bruta."
                        : "¡Voz Élite activada! Precisión total.",
                      next
                    );
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                    isTitan
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30"
                      : "bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30"
                  }`}
                  title="Cambiar entre voz Titán (La Roca) y voz Élite"
                >
                  <span>{coachIcon}</span>
                  <span>{isTitan ? "TITÁN" : "ÉLITE"}</span>
                </button>
              </div>
              <h3 className="text-sm font-bold text-white">
                Asesoría de Biomecánica & Descanso &middot; {currentExercise}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                {!isUser && (
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-sm font-bold shadow-sm ${
                    isTitan
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-rose-500/20 border-rose-500/40 text-rose-300"
                  }`}>
                    {coachIcon}
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 text-xs leading-relaxed ${
                    isUser
                      ? "bg-amber-500 text-black font-semibold rounded-tr-sm shadow-md"
                      : "bg-zinc-900/90 text-zinc-200 border border-zinc-800/80 rounded-tl-sm shadow-sm"
                  }`}
                >
                  <p>{m.text}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-black/10 dark:border-zinc-800/60 text-[10px] opacity-75 font-mono">
                    <span>{m.timestamp}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleSpeak(m.text)}
                        className="hover:text-amber-400 flex items-center gap-1 cursor-pointer font-bold"
                        title="Escuchar al coach hablar esta respuesta"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Escuchar</span>
                      </button>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  {m.followUps && m.followUps.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {m.followUps.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(chip)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/40 text-[11px] font-mono text-amber-300 hover:text-white transition-all text-left cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-300 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input */}
        <div className="p-3 sm:p-4 border-t border-zinc-900 bg-zinc-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Preguntale al coach sobre ${currentExercise}...`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 font-mono focus:outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold transition-all cursor-pointer shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
