"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  ExternalLink,
  Play,
  RotateCcw,
  Send,
  User,
  Volume2,
  X,
} from "lucide-react";
import { formatCoachClock, resolveCoachSubject } from "@/lib/coachKnowledgeBase.mjs";
import {
  speakText,
  getAudioPreferences,
  toggleVoiceGender,
  type CoachAudioPreferences,
} from "@/lib/acousticFeedback";
import { playChime, playTactileClick } from "@/lib/zenAudio";

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

const COACH_TOPICS = [
  "RECOVERY_LOCKOUT",
  "REST_INTER_SESSION",
  "REST_INTRA_SET",
  "TECHNIQUE",
  "MUSCLES",
  "EQUIPMENT",
  "MISTAKES",
  "TEMPO",
  "SUBSTITUTION",
  "PROGRAMMING",
  "PHASE_GUIDANCE",
  "WARMUP",
  "BREATHING",
  "EXPLAIN",
  "PAIN_SAFETY",
  "GENERAL_COACHING",
] as const;

type CoachTopic = (typeof COACH_TOPICS)[number];
type DemoMatch = "exact" | "related";

interface CoachSource {
  label: string;
  url: string;
}

interface CoachDemo {
  exerciseName: string;
  youtubeId: string;
  videoUrl: string;
  title: string;
  caption: string;
  pageUrl: string | null;
  match: DemoMatch;
  channelUrl: string;
}

interface CoachAnswer {
  topic: CoachTopic;
  text: string;
  followUps: string[];
  sources: CoachSource[];
  demo: CoachDemo | null;
  exerciseName: string | null;
}

interface ChatMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  fullText?: string;
  timestamp: string;
  followUps?: string[];
  sources?: CoachSource[];
  demo?: CoachDemo | null;
  topic?: CoachTopic;
  streaming?: boolean;
  status?: "ok" | "error";
  retryQuery?: string;
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

function isCoachTopic(value: string): value is CoachTopic {
  return (COACH_TOPICS as readonly string[]).includes(value);
}

function coachTopicLabel(topic: CoachTopic): string {
  switch (topic) {
    case "RECOVERY_LOCKOUT":
      return "Recuperación";
    case "REST_INTER_SESSION":
      return "Descanso entre días";
    case "REST_INTRA_SET":
      return "Descanso entre series";
    case "TECHNIQUE":
      return "Técnica";
    case "MUSCLES":
      return "Músculos";
    case "EQUIPMENT":
      return "Equipo";
    case "MISTAKES":
      return "Errores";
    case "TEMPO":
      return "Tempo";
    case "SUBSTITUTION":
      return "Alternativa";
    case "PROGRAMMING":
      return "Programación";
    case "PHASE_GUIDANCE":
      return "Esta serie";
    case "WARMUP":
      return "Entrada en calor";
    case "BREATHING":
      return "Respiración";
    case "EXPLAIN":
      return "Concepto";
    case "PAIN_SAFETY":
      return "Dolor";
    case "GENERAL_COACHING":
      return "Coach";
    default: {
      const exhaustive: never = topic;
      return exhaustive;
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readSources(value: unknown): CoachSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.label !== "string" || typeof item.url !== "string") return [];
    if (!/^https:\/\//.test(item.url)) return [];
    return [{ label: item.label, url: item.url }];
  });
}

function readDemo(value: unknown): CoachDemo | null {
  if (value == null) return null;
  if (!isRecord(value)) return null;
  if (typeof value.youtubeId !== "string" || !YOUTUBE_ID.test(value.youtubeId)) return null;
  if (typeof value.videoUrl !== "string" || typeof value.title !== "string" || typeof value.caption !== "string") return null;
  if (typeof value.exerciseName !== "string" || typeof value.channelUrl !== "string") return null;
  if (value.match !== "exact" && value.match !== "related") return null;
  return {
    exerciseName: value.exerciseName,
    youtubeId: value.youtubeId,
    videoUrl: value.videoUrl,
    title: value.title,
    caption: value.caption,
    pageUrl: typeof value.pageUrl === "string" ? value.pageUrl : null,
    match: value.match,
    channelUrl: value.channelUrl,
  };
}

function readCoachAnswer(value: unknown): CoachAnswer {
  if (!isRecord(value) || typeof value.topic !== "string" || !isCoachTopic(value.topic)) {
    throw new Error("invalid-topic");
  }
  if (typeof value.text !== "string" || value.text.trim().length === 0) {
    throw new Error("empty-answer");
  }
  const followUps = Array.isArray(value.followUps)
    ? value.followUps.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  return {
    topic: value.topic,
    text: value.text,
    followUps,
    sources: readSources(value.sources),
    demo: readDemo(value.demo),
    exerciseName: typeof value.exerciseName === "string" && value.exerciseName.trim()
      ? value.exerciseName.trim()
      : null,
  };
}

function timeNow(): string {
  return formatCoachClock(new Date());
}

function foldName(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function visibleCoachText(message: ChatMessage): string {
  const caption = message.demo?.caption?.trim();
  if (!caption || message.streaming) return message.text;
  const stripped = message.text
    .split("\n")
    .filter((line) => line.trim() !== caption)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return stripped || message.text;
}

function createGreeting(exercise: string, locked: boolean): ChatMessage {
  return {
    id: "m0",
    sender: "coach",
    topic: "GENERAL_COACHING",
    text: `¡Hola! Soy tu coach de fuerza. Estás en ${exercise}. Preguntame cómo se hace un movimiento, qué músculos usa, cómo programarlo, qué equipo hace falta o cómo descansar. Si me pedís la técnica, te muestro la demo oficial de Rogue Fitness para que veas el patrón.`,
    timestamp: timeNow(),
    followUps: [
      "¿Cómo hago la técnica correcta?",
      "¿Qué músculos trabaja?",
      "¿Cuánto debo descansar?",
      locked ? "¿Por qué está bloqueado el ejercicio?" : "¿Qué equipo necesito?",
    ],
  };
}

function revealEnds(text: string): number[] {
  const ends: number[] = [];
  let words = 0;
  for (let index = 0; index < text.length; index += 1) {
    const current = text[index] ?? "";
    const previous = text[index - 1] ?? "";
    if (/\s/.test(current) && index > 0 && !/\s/.test(previous)) {
      words += 1;
      if (words % 4 === 0) ends.push(index);
    }
  }
  if (ends[ends.length - 1] !== text.length) ends.push(text.length);
  return ends;
}

function safeClick(): void {
  try {
    playTactileClick();
  } catch {
    // El clic háptico no puede frenar la conversación.
  }
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
  const titleId = useId();
  const inputId = useId();
  const noticeId = useId();
  const [trackedExercise, setTrackedExercise] = useState(currentExercise);
  const [discussedName, setDiscussedName] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createGreeting(currentExercise, isLocked)]);
  const [input, setInput] = useState("");
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [audioPrefs, setAudioPrefs] = useState<CoachAudioPreferences>(() => getAudioPreferences());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const idCounterRef = useRef(1);
  const streamTokenRef = useRef(0);
  const streamTimerRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  const finishStreamRef = useRef<() => void>(() => {});
  const messagesRef = useRef(messages);
  const discussedIdRef = useRef<string | null>(null);
  const discussedNameRef = useRef<string | null>(null);

  if (trackedExercise !== currentExercise) {
    setTrackedExercise(currentExercise);
    setDiscussedName(null);
    setMessages((previous) => {
      const onlyGreeting = previous.length === 1 && previous[0]?.id === "m0" && previous[0]?.sender === "coach";
      if (!onlyGreeting) return previous;
      return [createGreeting(currentExercise, isLocked)];
    });
  }

  const clearTimer = () => {
    if (streamTimerRef.current != null) {
      window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
  };

  const finishStream = useCallback(() => {
    streamTokenRef.current += 1;
    if (streamTimerRef.current != null) {
      window.clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setMessages((previous) => previous.map((message) => (
      message.streaming
        ? { ...message, streaming: false, text: message.fullText ?? message.text }
        : message
    )));
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    discussedIdRef.current = null;
    discussedNameRef.current = null;
  }, [currentExercise]);

  useEffect(() => {
    finishStreamRef.current = finishStream;
  }, [finishStream]);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      streamTokenRef.current += 1;
      if (streamTimerRef.current != null) window.clearInterval(streamTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement;
    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finishStreamRef.current();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isOpen, formNotice]);

  const startStream = (answer: CoachAnswer) => {
    const token = streamTokenRef.current + 1;
    streamTokenRef.current = token;
    clearTimer();
    const ends = revealEnds(answer.text);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = `c-${idCounterRef.current++}`;
    const firstEnd = ends[0] ?? answer.text.length;
    const showAll = reduceMotion || ends.length <= 1;
    setMessages((previous) => [
      ...previous,
      {
        id,
        sender: "coach",
        text: showAll ? answer.text : answer.text.slice(0, firstEnd),
        fullText: answer.text,
        timestamp: timeNow(),
        followUps: answer.followUps,
        sources: answer.sources,
        demo: answer.demo,
        topic: answer.topic,
        streaming: !showAll,
        status: "ok",
      },
    ]);
    if (showAll) {
      setAnnouncement(answer.text.slice(0, 420));
      try {
        playChime(false);
      } catch {
        // El sonido de respuesta es opcional.
      }
      return;
    }
    let step = 1;
    streamTimerRef.current = window.setInterval(() => {
      if (streamTokenRef.current !== token) return;
      const end = ends[step] ?? answer.text.length;
      const done = step >= ends.length - 1;
      setMessages((previous) => previous.map((message) => (
        message.id === id
          ? { ...message, text: answer.text.slice(0, end), streaming: !done }
          : message
      )));
      if (done) {
        clearTimer();
        setAnnouncement(answer.text.slice(0, 420));
        try {
          playChime(false);
        } catch {
          // El sonido de respuesta es opcional.
        }
      }
      step += 1;
    }, 32);
  };

  const deliver = async (query: string, retry: boolean) => {
    finishStream();
    safeClick();
    const subject = resolveCoachSubject(query, {
      discussedExerciseId: discussedIdRef.current,
      discussedExerciseName: discussedNameRef.current,
      currentExercise,
    });
    discussedIdRef.current = subject.exerciseId;
    discussedNameRef.current = subject.exerciseName;
    if (subject.exerciseName) setDiscussedName(subject.exerciseName);

    const prior = messagesRef.current
      .filter((message) => message.id !== "m0" && message.status !== "error" && !message.streaming)
      .map((message) => ({
        role: message.sender === "user" ? "user" as const : "assistant" as const,
        content: message.fullText ?? message.text,
      }));
    const transcript = retry ? prior : [...prior, { role: "user" as const, content: query }];

    if (!retry) {
      const userMessage: ChatMessage = {
        id: `u-${idCounterRef.current++}`,
        sender: "user",
        text: query,
        timestamp: timeNow(),
      };
      setMessages((previous) => [...previous, userMessage]);
    } else {
      setMessages((previous) => previous.filter((message) => message.retryQuery !== query || message.status !== "error"));
    }
    setInput("");
    setFormNotice(null);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: transcript,
          discussedExerciseId: subject.exerciseId,
          discussedExerciseName: subject.exerciseName,
          context: {
            currentExercise,
            currentWeight,
            currentReps,
            currentRpe,
            isLocked,
            remainingHours,
            remainingMinutes,
          },
        }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        throw new Error("gateway");
      }
      const answer = readCoachAnswer(payload);
      if (answer.exerciseName) {
        discussedNameRef.current = answer.exerciseName;
        setDiscussedName(answer.exerciseName);
      }
      startStream(answer);
    } catch {
      const errorMessage: ChatMessage = {
        id: `e-${idCounterRef.current++}`,
        sender: "coach",
        status: "error",
        text: "No pude consultar al coach. Tu pregunta sigue acá: reintentá en un momento.",
        timestamp: timeNow(),
        retryQuery: query,
      };
      setMessages((previous) => [...previous, errorMessage]);
      setAnnouncement(errorMessage.text);
    }
  };

  const handleSend = (textToSend?: string, retry = false) => {
    const query = (textToSend ?? input).trim();
    if (!query) {
      setFormNotice("Escribí una pregunta. Puede ser la técnica, los músculos, el equipo, la programación o el descanso.");
      inputRef.current?.focus();
      return;
    }
    deliver(query, retry);
  };

  const handleSpeak = (text: string) => {
    safeClick();
    if (!audioPrefs.voiceEnabled) {
      setFormNotice("La voz está silenciada. Activala arriba para escuchar al coach.");
      return;
    }
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setFormNotice("Este dispositivo no puede leer la respuesta en voz alta.");
      return;
    }
    speakText(text, audioPrefs);
  };

  const closeChat = () => {
    safeClick();
    finishStream();
    onClose();
  };

  if (!isOpen) return null;

  const streaming = messages.some((message) => message.streaming);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeChat();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-xl h-[88vh] max-h-[760px] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
      >
        <div className="p-4 sm:p-5 border-b border-zinc-900 bg-zinc-900/60 backdrop-blur-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl border bg-amber-500/15 border-amber-500/40 text-amber-400 shrink-0">
              <Bot className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  Coach de fuerza
                </span>
                <button
                  type="button"
                  aria-pressed={audioPrefs.voiceEnabled}
                  onClick={() => {
                    safeClick();
                    const next = toggleVoiceGender();
                    setAudioPrefs(next);
                    if (next.voiceEnabled) speakText("Voz del coach activada.", next);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                    audioPrefs.voiceEnabled
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30"
                      : "bg-zinc-800/40 border-zinc-700/60 text-zinc-500 hover:bg-zinc-800"
                  }`}
                >
                  {audioPrefs.voiceEnabled ? "Voz activa" : "Silencio"}
                </button>
              </div>
              <h3 id={titleId} className="text-sm font-bold text-white truncate">
                {discussedName ?? currentExercise}
                {isLocked && foldName(discussedName ?? currentExercise) === foldName(currentExercise) ? " · en recuperación" : ""}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={closeChat}
            aria-label="Cerrar chat del coach"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div
          className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4"
          role="log"
          aria-label="Conversación con el coach"
          aria-busy={streaming}
        >
          {messages.map((message) => {
            const isUser = message.sender === "user";
            const topicLabel = message.topic && isCoachTopic(message.topic) ? coachTopicLabel(message.topic) : null;
            return (
              <div key={message.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0 bg-amber-500/20 border-amber-500/40 text-amber-300" aria-hidden="true">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 text-xs leading-relaxed ${
                    isUser
                      ? "bg-amber-500 text-black font-semibold rounded-tr-sm shadow-md"
                      : message.status === "error"
                        ? "bg-rose-950/80 text-rose-100 border border-rose-500/50 rounded-tl-sm"
                        : "bg-zinc-900/90 text-zinc-200 border border-zinc-800/80 rounded-tl-sm shadow-sm"
                  }`}
                  role={message.status === "error" ? "alert" : undefined}
                >
                  {topicLabel && !isUser && message.status !== "error" && (
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/90">{topicLabel}</p>
                  )}
                  <p className="whitespace-pre-wrap">
                    {visibleCoachText(message)}
                    {message.streaming ? <span aria-hidden="true">▍</span> : null}
                  </p>
                  {message.demo && !isUser && (
                    <CoachDemoCard demo={message.demo} online={online} />
                  )}
                  {message.sources && message.sources.length > 0 && !message.streaming && (
                    <ul className="pt-1 flex flex-col gap-1">
                      {message.sources.map((source) => (
                        <li key={source.url}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 hover:text-white underline-offset-2 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                            {source.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-black/10 text-[10px] font-mono text-current/75">
                    <span>{message.timestamp}</span>
                    {!isUser && message.status !== "error" && !message.streaming && (
                      <button
                        type="button"
                        onClick={() => handleSpeak(message.fullText ?? message.text)}
                        className="hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Escuchar
                      </button>
                    )}
                  </div>
                  {message.status === "error" && message.retryQuery && (
                    <button
                      type="button"
                      onClick={() => handleSend(message.retryQuery, true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-100 font-mono text-[11px] cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      Reintentar
                    </button>
                  )}
                  {message.followUps && message.followUps.length > 0 && !message.streaming && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {message.followUps.map((chip) => (
                        <button
                          key={chip}
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
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-300" aria-hidden="true">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="sr-only" aria-live="polite">{announcement}</div>

        <div className="p-3 sm:p-4 border-t border-zinc-900 bg-zinc-950/80">
          {formNotice && (
            <p id={noticeId} role="alert" className="mb-2 text-[11px] font-mono text-amber-300">
              {formNotice}
            </p>
          )}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <label htmlFor={inputId} className="sr-only">Pregunta para el coach</label>
            <input
              id={inputId}
              ref={inputRef}
              type="text"
              value={input}
              maxLength={500}
              autoComplete="off"
              enterKeyHint="send"
              aria-describedby={formNotice ? noticeId : undefined}
              onChange={(event) => {
                setInput(event.target.value);
                if (formNotice) setFormNotice(null);
              }}
              placeholder={`Preguntale sobre ${discussedName ?? currentExercise} o cualquier ejercicio`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 font-mono focus:outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              aria-disabled={!input.trim()}
              aria-label="Enviar pregunta al coach"
              className={`p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold transition-all cursor-pointer shrink-0 ${
                input.trim() ? "" : "opacity-40"
              }`}
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function CoachDemoCard({ demo, online }: { demo: CoachDemo; online: boolean }) {
  const [playing, setPlaying] = useState(false);
  const embedTitle = `${demo.title} — Rogue Fitness`;

  return (
    <figure className="space-y-2 pt-1">
      <figcaption className="text-[11px] leading-relaxed text-zinc-300">{demo.caption}</figcaption>
      {!online ? (
        <div role="alert" className="rounded-xl border border-rose-500/50 bg-rose-950/70 px-3 py-2 text-[11px] text-rose-100 flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-300" aria-hidden="true" />
          <p>Sin conexión: no pude incrustar la demo oficial. El enlace de YouTube queda listo para cuando vuelva la red.</p>
        </div>
      ) : playing ? (
        <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-zinc-800 bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${demo.youtubeId}?rel=0`}
            title={embedTitle}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="w-full rounded-xl border border-amber-500/40 bg-zinc-950 px-3 py-3 text-left cursor-pointer hover:border-amber-300"
        >
          <span className="flex items-center gap-2 text-amber-300 font-mono text-[11px] font-bold">
            <Play className="w-4 h-4 fill-amber-300" aria-hidden="true" />
            Reproducir demo oficial de Rogue
          </span>
          <span className="mt-1 block text-[10px] text-zinc-400">{demo.title}</span>
        </button>
      )}
      <div className="flex flex-wrap gap-2">
        <a
          href={demo.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 hover:text-white"
        >
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
          Abrir en YouTube
        </a>
        {demo.pageUrl && (
          <a
            href={demo.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 hover:text-white"
          >
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
            Ver en roguefitness.com
          </a>
        )}
      </div>
    </figure>
  );
}
