"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface SoundtrackTrack {
  id: string;
  title: string;
  composer: string;
  src: string;
  tag: string;
}

export const WARRIOR_SOUNDTRACKS: SoundtrackTrack[] = [
  {
    id: "warrior-dakota",
    title: "The Spirit of the Warrior",
    composer: "Markus Schulz presents Dakota",
    src: "/audio/the-spirit-of-the-warrior.mp3",
    tag: "Trance Épico",
  },
  {
    id: "red-warrior",
    title: "Red Warrior",
    composer: "Hans Zimmer • El Último Samurai",
    src: "/audio/red-warrior.mp3",
    tag: "Furia Samurai",
  },
  {
    id: "power-of-excalibur",
    title: "The Power of Excalibur",
    composer: "Daniel Pemberton • King Arthur",
    src: "/audio/power-of-excalibur.mp3",
    tag: "Fuerza Imperial",
  },
  {
    id: "navras",
    title: "Navras",
    composer: "Juno Reactor & Don Davis • The Matrix",
    src: "/audio/navras.mp3",
    tag: "Clímax Sagrado",
  },
  {
    id: "dread-rock",
    title: "Dread Rock",
    composer: "Paul Oakenfold • The Matrix Reloaded",
    src: "/audio/dread-rock.mp3",
    tag: "Ritmo Inquebrantable",
  },
  {
    id: "perseus",
    title: "Perseus",
    composer: "Immediate Music • Furia de Titanes",
    src: "/audio/perseus.mp3",
    tag: "Fuerza Heroica",
  },
  {
    id: "160-bpm",
    title: "160 BPM",
    composer: "Hans Zimmer • Ángeles y Demonios",
    src: "/audio/160-bpm.mp3",
    tag: "Pura Adrenalina",
  },
  {
    id: "ready-steady-go",
    title: "Ready Steady Go",
    composer: "Paul Oakenfold • Bourne Identity",
    src: "/audio/ready-steady-go.mp3",
    tag: "Velocidad & Foco",
  },
  {
    id: "samurai-way-of-life",
    title: "A Way of Life",
    composer: "Hans Zimmer • El Último Samurai",
    src: "/audio/the-last-samurai-a-way-of-life.mp3",
    tag: "Honor Marcial",
  },
  {
    id: "lotr-khazad-dum",
    title: "The Bridge of Khazad-dûm",
    composer: "Howard Shore • El Señor de los Anillos",
    src: "/audio/lotr-bridge-of-khazad-dum.mp3",
    tag: "Batalla Balrog",
  },
  {
    id: "lotr-ring-goes-south",
    title: "The Ring Goes South",
    composer: "Howard Shore • El Señor de los Anillos",
    src: "/audio/lotr-the-ring-goes-south.mp3",
    tag: "Marcha de la Comunidad",
  },
  {
    id: "lotr-hobbits",
    title: "Concerning Hobbits",
    composer: "Howard Shore • El Señor de los Anillos",
    src: "/audio/concerning-hobbits.mp3",
    tag: "Temple & Serenidad",
  },
  {
    id: "lotr-council",
    title: "The Council of Elrond / Aníron",
    composer: "Howard Shore • El Señor de los Anillos",
    src: "/audio/council-of-elrond.mp3",
    tag: "Trascendencia",
  },
];

const WARRIOR_QUOTES = [
  // --- ESTRATEGIA, CONQUISTA & DOCTRINA DEL HIERRO (NAPOLEÓN & CLÁSICOS) ---
  {
    text: "La victoria pertenece al más perseverante.",
    author: "Napoleón Bonaparte • Emperador & Estratega Militar"
  },
  {
    text: "Imposible es una palabra que solo se encuentra en el diccionario de los necios.",
    author: "Napoleón Bonaparte"
  },
  {
    text: "No hay camino al poder. El camino ES el poder.",
    author: "Miyamoto Musashi • El Santo de la Espada"
  },
  {
    text: "Percibe aquello que no puede ser visto con los ojos carnales. La espada y la mente deben ser una sola cosa indivisible.",
    author: "Miyamoto Musashi"
  },
  {
    text: "El espartano jamás pregunta cuántos son los enemigos, sino en qué coordenadas se encuentran.",
    author: "Rey Leónidas de Esparta"
  },
  {
    text: "No hay nada imposible para aquel que tiene la osadía y el coraje de intentar.",
    author: "Alejandro Magno"
  },
  {
    text: "No temas a quien practica 10.000 patadas una vez. Teme a quien practica una patada 10.000 veces.",
    author: "Bruce Lee"
  },
  {
    text: "El dolor es la prueba de que sigues vivo; forjá una mente que no pueda ser quebrada por nada ni nadie.",
    author: "David Goggins • Navy SEAL & Ultra-Guerrero"
  },
  {
    text: "Cuando creas que has llegado a tu límite, apenas estás al 40% de tu capacidad real. Atraviesa el umbral.",
    author: "David Goggins"
  },
  {
    text: "Tienes poder sobre tu mente, no sobre los acontecimientos. Comprende esto y hallarás fuerza invencible.",
    author: "Marco Aurelio • Emperador Filósofo"
  },
  {
    text: "El hierro cura todo. El hierro nunca te miente: doscientos kilos son doscientos kilos en cualquier rincón del cosmos.",
    author: "Henry Rollins"
  },

  // --- LOS ARCÁNGELES & EL LOGOS SOLAR ---
  {
    text: "¿Quién como Dios? ¡Nadie como Dios! Blandid la espada de la voluntad inquebrantable contra toda debilidad del cuerpo y de la mente.",
    author: "San Miguel Arcángel • Príncipe de la Milicia Celeste"
  },
  {
    text: "El Reino de los Cielos se hace fuerza, y solo los valientes y esforzados lo arrebatan.",
    author: "Jesucristo • El León de Judá"
  },
  {
    text: "No he venido a traer paz de cobardes, sino espada de fuego y discernimiento divino.",
    author: "Jesucristo • El Gran Hierofante"
  },
  {
    text: "El guerrero cósmico sostiene la llama de la pureza en el centro mismo de la tormenta. Sé inamovible como la roca sagrada.",
    author: "Sanat Kumara • Regente del Mundo & Anciano de los Días"
  },
  {
    text: "La iniciación no se pide con palabras ni plegarias huecas: se conquista con el hierro forjado de la voluntad.",
    author: "Sanat Kumara • Avatar de la Llama"
  },

  // --- DOCTRINA GNÓSTICA MARCIAL ---
  {
    text: "Un guerrero no se rinde. Un guerrero trasciende en la fragua de Vulcano, dominando la mente y templando la carne.",
    author: "V.M. Samael Aun Weor • Quinto de los Siete"
  },
  {
    text: "El auténtico guerrero forja su alma en el crisol de la voluntad y la templanza. Quien se vence a sí mismo es el más grande de los héroes.",
    author: "V.M. Samael Aun Weor"
  },
  {
    text: "La fuerza real no proviene del músculo vano, sino del fuego concentrado en el centro motor que jamás se dilapida.",
    author: "V.M. Samael Aun Weor"
  },
  {
    text: "El camino del guerrero de la Gran Logia Blanca es angosto y difícil, como el filo de una navaja.",
    author: "V.M. Samael Aun Weor"
  },

  // --- TITANES DE UFC & ARTES MARCIALES DE COMBATE REAL ---
  {
    text: "No hay atajos para el cinturón. El miedo desaparece cuando tu disciplina, tu preparación y tu potencia de cadera son implacables.",
    author: "Georges St-Pierre (GSP) • Leyenda Invicta UFC"
  },
  {
    text: "¡Golpea con la cadera, el talón y todo el peso de tu existencia! La potencia demoledora no se pide, se descarga.",
    author: "Bas Rutten • Salón de la Fama UFC & Rey de Pancrase"
  },
  {
    text: "El verdadero poder marcial reside en el centro inamovible: calma absoluta, muñecas de acero y fluidez letal para desarticular al oponente.",
    author: "Steven Seagal • 7° Dan Aikido Shihan"
  },
  {
    text: "El cuerpo de un artista marcial debe ser demoledor en el impacto, pero ingrávido y relampagueante en el aire. Eso es poder total.",
    author: "Marko Zaror • Gladiador Marcial & Atleta de Élite"
  },

  // --- JUSTICIEROS & DOCTRINAS TÁCTICAS OPERADOR DELTA ---
  {
    text: "Enfoque absoluto, compromiso total y una determinación de hierro que ningún dolor terrenal puede doblegar.",
    author: "Doctrina John Wick • Baba Yaga"
  },
  {
    text: "Cuando rezas por lluvia, debes lidiar también con el barro. La fuerza física implacable y la justicia deben ser una sola herramienta.",
    author: "Robert McCall • The Equalizer"
  },
  {
    text: "En el fragor de la batalla, la mente fría y la respiración pausada son las armas más letales que existen.",
    author: "Doctrina Nikolai • Fuerza Táctica"
  }
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
  const [trackIdx, setTrackIdx] = useState(0);
  const [fadeClass, setFadeClass] = useState("opacity-100");
  const [entering, setEntering] = useState(false);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentTrack = WARRIOR_SOUNDTRACKS[trackIdx];

  const startAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.85;
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
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

  const handleNextTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTrackIdx((prev) => (prev + 1) % WARRIOR_SOUNDTRACKS.length);
  };

  const handlePrevTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTrackIdx((prev) => (prev - 1 + WARRIOR_SOUNDTRACKS.length) % WARRIOR_SOUNDTRACKS.length);
  };

  // Re-play when trackIdx changes if it was already playing or user explicitly switched
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack.src;
      audioRef.current.load();
      if (isPlaying) {
        startAudio();
      }
    }
  }, [trackIdx, currentTrack.src, startAudio, isPlaying]);

  // Attempt play on mount and listen to first user gesture
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
    // Smooth cinematic audio fade out
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
        src={currentTrack.src}
        onEnded={() => {
          setTrackIdx((prev) => (prev + 1) % WARRIOR_SOUNDTRACKS.length);
        }}
        preload="auto"
      />

      {/* Floating Epic Audio Controller (Jukebox Pill) */}
      <div
        className={`forge-audio-pill ${isPlaying ? "active" : ""}`}
        onClick={(e) => e.stopPropagation()}
        title="Reproductor de Bandas Sonoras de la Forja"
      >
        <button
          onClick={handlePrevTrack}
          className="text-[#cca43b] hover:text-[#ffd700] p-1 text-xs transition-colors cursor-pointer"
          title="Pista anterior"
          aria-label="Pista anterior"
        >
          ⏮
        </button>

        <button
          onClick={toggleAudio}
          className="flex items-center gap-2 cursor-pointer"
          title={isPlaying ? "Pausar música" : "Reproducir música"}
        >
          <div className={`forge-audio-bars ${!isPlaying ? "paused" : ""}`}>
            <div className="forge-audio-bar" />
            <div className="forge-audio-bar" />
            <div className="forge-audio-bar" />
            <div className="forge-audio-bar" />
            <div className="forge-audio-bar" />
          </div>
          <div className="text-left flex flex-col max-w-[150px] sm:max-w-[200px]">
            <span className="text-[10px] font-bold tracking-wider uppercase font-mono text-[#ffd700] truncate">
              {currentTrack.title}
            </span>
            <span className="text-[9px] text-[#cca43b]/80 truncate font-mono">
              {currentTrack.composer}
            </span>
          </div>
          <span className="text-xs text-[#cca43b]">
            {isPlaying ? "🔊" : "🔇"}
          </span>
        </button>

        <button
          onClick={handleNextTrack}
          className="text-[#cca43b] hover:text-[#ffd700] p-1 text-xs transition-colors cursor-pointer"
          title="Siguiente pista"
          aria-label="Siguiente pista"
        >
          ⏭
        </button>
      </div>

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
        <p className="forge-subtitle text-white font-mono font-bold text-xs sm:text-sm tracking-[0.5em] sm:tracking-[0.8em] drop-shadow-[0_0_16px_rgba(255,255,255,0.7)]">
          EL TEMPLO DEL HIERRO
        </p>

        {/* Soundtrack Quick Selector / Play Trigger */}
        <div className="flex flex-wrap items-center justify-center gap-2 my-3 z-20">
          {!isPlaying ? (
            <button
              onClick={toggleAudio}
              className="px-5 py-2.5 rounded-full border border-amber-400/60 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-mono text-xs tracking-widest uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.35)] animate-pulse cursor-pointer transition-all hover:scale-105"
            >
              <span className="text-base">⚔️</span>
              <span>ACTIVAR HIMNO: {currentTrack.title}</span>
              <span className="text-sm">▶</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-black/60 border border-amber-500/30 rounded-full px-4 py-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono text-amber-300 tracking-wider">
                {currentTrack.tag}: <strong className="text-white">{currentTrack.title}</strong>
              </span>
              <button
                onClick={handleNextTrack}
                className="text-xs text-amber-400 hover:text-amber-200 ml-2 font-mono underline cursor-pointer"
              >
                Cambiar pista ⏭
              </button>
            </div>
          )}
        </div>

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
          ⚔️ SAN MIGUEL • SANAT KUMARA • SAMAEL • CRISTO JESÚS • FUERZA SUPREMA DE GUERRERO ⚔️
        </p>
      </div>
    </div>
  );
}
