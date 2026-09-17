"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const WARRIOR_QUOTES = [
  { text: "La victoria pertenece al más perseverante.", author: "Napoleón" },
  { text: "Un guerrero no se rinde. Un guerrero trasciende.", author: "V.M. Samael Aun Weor" },
  { text: "No te detengas cuando estés cansado; detente cuando hayas terminado.", author: "David Goggins" },
  { text: "No hay camino al poder. El camino ES el poder.", author: "Miyamoto Musashi" },
  { text: "El dolor es la prueba de que sigues vivo; forjá una mente que no pueda ser doblegada.", author: "David Goggins" },
  { text: "El auténtico guerrero forja su alma en el crisol de la voluntad y la templanza.", author: "V.M. Samael Aun Weor" },
  { text: "Tienes poder sobre tu mente, no sobre los acontecimientos. Comprende esto y hallarás fuerza invencible.", author: "Marco Aurelio" },
  { text: "El hierro cura todo. El hierro nunca te miente.", author: "Henry Rollins" },
  { text: "El guerrero victorioso gana primero en su espíritu, y luego marcha a la batalla.", author: "Sun Tzu" },
  { text: "No temas a quien practica 10.000 patadas una vez. Teme a quien practica una patada 10.000 veces.", author: "Bruce Lee" },
  { text: "Cuando creas que has llegado a tu límite, apenas estás al 40% de tu capacidad real.", author: "David Goggins" },
  { text: "El cuerpo logra lo que la mente cree y sostiene con disciplina.", author: "Proverbio Espartano" },
  { text: "No hay nada imposible para aquel que tiene la osadía y el coraje de intentar.", author: "Alejandro Magno" },
  { text: "Percibe aquello que no puede ser visto con los ojos carnales.", author: "Miyamoto Musashi" },
  { text: "La espada y la mente deben ser una sola cosa indivisible.", author: "Miyamoto Musashi" },
  { text: "El espartano jamás pregunta cuántos son los enemigos, sino en qué coordenadas se encuentran.", author: "Rey Leónidas de Esparta" },
  { text: "Lo que no me mata, me hace infinitamente más fuerte.", author: "Friedrich Nietzsche" },
  { text: "Miguel, Príncipe de los Ejércitos Celestiales, defiéndenos en la batalla del Ser.", author: "Oración a San Miguel" },
];

function FireParticle({ delay, x }: { delay: number; x: number }) {
  return (
    <div
      className="fire-particle"
      style={{
        left: `${x}%`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function EmberParticle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <div
      className="ember-particle"
      style={{
        left: `${x}%`,
        animationDelay: `${delay}s`,
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
}

interface ForgeLandingProps {
  onEnterDirect?: () => void;
}

export default function ForgeLanding({ onEnterDirect }: ForgeLandingProps) {
  const router = useRouter();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [fadeClass, setFadeClass] = useState("opacity-100");
  const [entering, setEntering] = useState(false);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Play audio safely
  const startAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.85;
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, []);

  const toggleAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      startAudio();
    }
  };

  // Attempt play immediately on mount and setup global interaction listener
  useEffect(() => {
    startAudio();

    const handleUserInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        startAudio();
      }
    };

    window.addEventListener("pointerdown", handleUserInteraction);
    window.addEventListener("touchstart", handleUserInteraction);
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      window.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, [startAudio]);

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeClass("opacity-0");
      setTimeout(() => {
        setQuoteIdx((prev) => (prev + 1) % WARRIOR_QUOTES.length);
        setFadeClass("opacity-100");
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleNextQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFadeClass("opacity-0");
    setTimeout(() => {
      setQuoteIdx((prev) => (prev + 1) % WARRIOR_QUOTES.length);
      setFadeClass("opacity-100");
    }, 250);
  };

  const handlePrevQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFadeClass("opacity-0");
    setTimeout(() => {
      setQuoteIdx((prev) => (prev - 1 + WARRIOR_QUOTES.length) % WARRIOR_QUOTES.length);
      setFadeClass("opacity-100");
    }, 250);
  };

  const handleEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEntering(true);
    // Smooth cinematic audio fade out synchronized with exit transition
    if (audioRef.current) {
      const audio = audioRef.current;
      const fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.08);
        } else {
          audio.volume = 0;
          audio.pause();
          clearInterval(fadeInterval);
        }
      }, 60);
    }

    if (onEnterDirect) {
      setTimeout(() => onEnterDirect(), 1100);
    } else {
      setTimeout(() => router.push("/"), 1100);
    }
  };

  const quote = WARRIOR_QUOTES[quoteIdx];

  return (
    <div
      ref={containerRef}
      onClick={() => {
        if (!isPlaying) startAudio();
      }}
      className={`forge-container ${entering ? "forge-exit" : ""} cursor-pointer`}
      title={!isPlaying ? "Tocar la pantalla para activar el himno" : undefined}
    >
      {/* Audio Engine */}
      <audio
        ref={audioRef}
        src="/audio/the-spirit-of-the-warrior.mp3"
        loop
        preload="auto"
      />

      {/* Floating Epic Audio Controller (Pill) */}
      <button
        onClick={toggleAudio}
        className={`forge-audio-pill ${isPlaying ? "active" : ""}`}
        title={isPlaying ? "Pausar Himno" : "Reproducir The Spirit of the Warrior"}
        aria-label="Control de audio de fondo"
      >
        <div className={`forge-audio-bars ${!isPlaying ? "paused" : ""}`}>
          <div className="forge-audio-bar" />
          <div className="forge-audio-bar" />
          <div className="forge-audio-bar" />
          <div className="forge-audio-bar" />
          <div className="forge-audio-bar" />
        </div>
        <span className="text-[10px] tracking-wider uppercase font-mono text-[#ffd700] hidden sm:inline-block">
          {isPlaying ? "The Spirit of the Warrior" : "Música Pausada"}
        </span>
        <span className="text-xs text-[#cca43b]">
          {isPlaying ? "🔊" : "🔇"}
        </span>
      </button>

      {/* Forge Background Layers */}
      <div className="forge-bg-layer forge-bg-hero" />
      <div className="forge-bg-layer forge-bg-vignette" />
      <div className="forge-bg-layer forge-bg-radial" />
      <div className="forge-bg-layer forge-bg-noise" />

      {/* Fire particles from bottom */}
      <div className="forge-fire-container" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <FireParticle key={`f-${i}`} delay={Math.random() * 4} x={Math.random() * 100} />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <EmberParticle key={`e-${i}`} delay={Math.random() * 6} x={Math.random() * 100} size={2 + Math.random() * 4} />
        ))}
      </div>

      {/* Main Content */}
      <div className="forge-content">
        {/* Crossed Swords Emblem with Epic Aura */}
        <div className={`forge-emblem ${isPlaying ? "playing-anthem" : ""}`}>
          <svg viewBox="0 0 120 120" className="w-24 h-24 md:w-32 md:h-32 transition-all duration-700">
            {/* Left Sword */}
            <line x1="20" y1="100" x2="60" y2="15" stroke="url(#swordGrad)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="35" y1="75" x2="50" y2="80" stroke="url(#swordGrad)" strokeWidth="2" strokeLinecap="round" />
            {/* Right Sword */}
            <line x1="100" y1="100" x2="60" y2="15" stroke="url(#swordGrad)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="85" y1="75" x2="70" y2="80" stroke="url(#swordGrad)" strokeWidth="2" strokeLinecap="round" />
            {/* Shield Circle */}
            <circle cx="60" cy="55" r="18" fill="none" stroke="url(#shieldGrad)" strokeWidth="1.5" />
            <circle cx="60" cy="55" r="12" fill="none" stroke="url(#shieldGrad)" strokeWidth="1" opacity="0.5" />
            {/* Center Star */}
            <polygon
              points="60,42 63,52 73,52 65,58 68,68 60,62 52,68 55,58 47,52 57,52"
              fill="url(#starGrad)"
              opacity="0.9"
            />
            <defs>
              <linearGradient id="swordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#cca43b" />
                <stop offset="100%" stopColor="#ffd700" />
              </linearGradient>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#cca43b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#b68d27" stopOpacity="0.4" />
              </linearGradient>
              <radialGradient id="starGrad">
                <stop offset="0%" stopColor="#ffd700" />
                <stop offset="100%" stopColor="#cca43b" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Title */}
        <h1 className="forge-title">
          <span className="forge-title-sub">LA FORJA DE LOS</span>
          <span className="forge-title-main">GUERREROS</span>
        </h1>

        {/* Subtitle */}
        <p className="forge-subtitle">
          EL TEMPLO DEL HIERRO
        </p>

        {/* Prominent Play / Sound Trigger Button */}
        {!isPlaying && (
          <button
            onClick={toggleAudio}
            className="my-3 px-5 py-2.5 rounded-full border border-amber-400/60 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-xs tracking-widest uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-pulse cursor-pointer transition-all hover:scale-105 z-20"
          >
            <span className="text-base">⚔️</span>
            <span>ACTIVAR HIMNO: THE SPIRIT OF THE WARRIOR</span>
            <span className="text-sm">▶</span>
          </button>
        )}

        {/* Rotating Quotes with Manual Navigation Controls */}
        <div className="forge-quote-container relative flex items-center justify-center gap-2 max-w-2xl mx-auto w-full px-4">
          <button
            onClick={handlePrevQuote}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-[#ffd700] flex items-center justify-center text-xs transition-colors cursor-pointer shrink-0 z-20"
            title="Frase anterior"
            aria-label="Frase anterior"
          >
            ◀
          </button>

          <div className={`forge-quote transition-opacity duration-500 flex-1 min-w-0 ${fadeClass}`}>
            <p className="forge-quote-text">&ldquo;{quote.text}&rdquo;</p>
            <p className="forge-quote-author">— {quote.author}</p>
          </div>

          <button
            onClick={handleNextQuote}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-[#ffd700] flex items-center justify-center text-xs transition-colors cursor-pointer shrink-0 z-20"
            title="Siguiente frase"
            aria-label="Siguiente frase"
          >
            ▶
          </button>
        </div>

        {/* Enter Button */}
        <button onClick={handleEnter} className="forge-enter-btn group mt-4 z-20">
          <span className="forge-enter-btn-glow" />
          <span className="forge-enter-btn-text">
            ENTRAR AL TEMPLO
          </span>
          <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Bottom Mantra */}
        <p className="forge-mantra">
          VOLUNTAD • DISCIPLINA • TRASCENDENCIA
        </p>
      </div>
    </div>
  );
}
