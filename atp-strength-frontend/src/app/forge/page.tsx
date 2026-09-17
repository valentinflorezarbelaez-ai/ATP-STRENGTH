"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface SoundtrackTrack {
  id: string;
  title: string;
  composer: string;
  src?: string;
  spotifyId?: string;
  tag: string;
  category: string;
}

export const WARRIOR_SOUNDTRACKS: SoundtrackTrack[] = [
  // --- Himnos Fundacionales de la Forja (Audio Local) ---
  {
    id: "warrior-dakota",
    title: "The Spirit of the Warrior",
    composer: "Markus Schulz presents Dakota",
    src: "/audio/the-spirit-of-the-warrior.mp3",
    tag: "Trance Épico",
    category: "Trance & Maestros",
  },
  {
    id: "samurai-way-of-life",
    title: "A Way of Life",
    composer: "Hans Zimmer • El Último Samurai",
    src: "/audio/the-last-samurai-a-way-of-life.mp3",
    tag: "Honor Marcial",
    category: "Espíritu Samurai",
  },
  {
    id: "lotr-khazad-dum",
    title: "The Bridge of Khazad-dûm",
    composer: "Howard Shore • El Señor de los Anillos",
    src: "/audio/lotr-bridge-of-khazad-dum.mp3",
    tag: "Batalla Balrog",
    category: "El Señor de los Anillos",
  },
  {
    id: "lotr-ring-goes-south",
    title: "The Ring Goes South",
    composer: "Howard Shore • El Señor de los Anillos",
    src: "/audio/lotr-the-ring-goes-south.mp3",
    tag: "Marcha de la Comunidad",
    category: "El Señor de los Anillos",
  },
  {
    id: "lotr-hobbits",
    title: "Concerning Hobbits",
    composer: "Howard Shore • El Señor de los Anillos",
    src: "/audio/concerning-hobbits.mp3",
    tag: "Temple & Serenidad",
    category: "El Señor de los Anillos",
  },
  {
    id: "lotr-council",
    title: "The Council of Elrond / Aníron",
    composer: "Howard Shore • El Señor de los Anillos",
    src: "/audio/council-of-elrond.mp3",
    tag: "Trascendencia",
    category: "El Señor de los Anillos",
  },

  // --- Bandas Sonoras de Poder & Combate Samurai / Leyendas (Spotify) ---
  {
    id: "red-warrior",
    title: "Red Warrior",
    composer: "Hans Zimmer • The Last Samurai",
    spotifyId: "6DPZdDkTOydyM40IXRi70Z",
    tag: "Furia Samurai",
    category: "Espíritu Samurai",
  },
  {
    id: "legend-excalibur",
    title: "The Legend of Excalibur",
    composer: "Daniel Pemberton • King Arthur",
    spotifyId: "4FsYrPHY5YaoqXlAqmxzmQ",
    tag: "Espada de Poder",
    category: "Leyenda & Poder",
  },
  {
    id: "perseus",
    title: "Perseus",
    composer: "Immediate Music",
    spotifyId: "0yXb01kdIoBnVG0I40Omcq",
    tag: "Poder Mitológico",
    category: "Leyenda & Poder",
  },
  {
    id: "light-and-shadow",
    title: "Light and Shadow",
    composer: "Hiroyuki Sawano",
    spotifyId: "48G7vrATULb5uDpXDt1i3n",
    tag: "Fuerza Despierta",
    category: "Fuerza Divina",
  },
  {
    id: "power-excalibur",
    title: "The Power of Excalibur",
    composer: "Daniel Pemberton • King Arthur",
    spotifyId: "1vJ8yYtUeMYXH204wW7Dx0",
    tag: "Fuerza Imperial",
    category: "Leyenda & Poder",
  },
  {
    id: "knife-in-the-dark",
    title: "A Knife in the Dark",
    composer: "Howard Shore • LOTR: Fellowship of the Ring",
    spotifyId: "5GsMJInonlNJWpYEqrmGRQ",
    tag: "Tensión Balrog",
    category: "El Señor de los Anillos",
  },
  {
    id: "god-in-you",
    title: "There Is A God In You",
    composer: "Hiroyuki Sawano",
    spotifyId: "3mXG60bFb4h3LxTb2Q77cK",
    tag: "Divina Presencia",
    category: "Fuerza Divina",
  },
  {
    id: "king-arthur-sword",
    title: "King Arthur: Legend of the Sword",
    composer: "Daniel Pemberton",
    spotifyId: "39rztUjb1lrBakRdaKkxsX",
    tag: "Temple de Acero",
    category: "Leyenda & Poder",
  },
  {
    id: "hunting-shadows",
    title: "Hunting Shadows (Assassin's Creed)",
    composer: "AURORA & Hans Zimmer",
    spotifyId: "2cl38oVhD267DBjURT1zNg",
    tag: "Sigilo & Caza",
    category: "Espíritu Samurai",
  },
  {
    id: "ride-rohirrim",
    title: "The Ride of the Rohirrim",
    composer: "Howard Shore • LOTR: Return of the King",
    spotifyId: "2l0xjJ6Fj72Bw4ReAJBrAo",
    tag: "Carga de Guerra",
    category: "El Señor de los Anillos",
  },
  {
    id: "for-frodo",
    title: "For Frodo (feat. Ben del Maestro)",
    composer: "Howard Shore • LOTR: Return of the King",
    spotifyId: "4g7Ithd2Fpoupsjs5sJxeR",
    tag: "La Puerta Negra",
    category: "El Señor de los Anillos",
  },

  // --- Épica Matrix, Paul Oakenfold & Maestros del Trance ---
  {
    id: "navras",
    title: "Navras",
    composer: "Don Davis & Juno Reactor • Matrix Revolutions",
    spotifyId: "1Bjgk8W01w4wx2SMCldsYZ",
    tag: "Trance Tribal",
    category: "Matrix & Trance",
  },
  {
    id: "mona-lisa-overdrive",
    title: "Mona Lisa Overdrive",
    composer: "Don Davis & Juno Reactor • Matrix Reloaded",
    spotifyId: "6m7mgnkUOpQGzvaqdIeyye",
    tag: "Persecución Matrix",
    category: "Matrix & Trance",
  },
  {
    id: "dread-rock",
    title: "Dread Rock",
    composer: "Paul Oakenfold • The Matrix Reloaded",
    spotifyId: "5vM8xMswH4MzinpWjQ3snK",
    tag: "Épica Oakenfold",
    category: "Matrix & Trance",
  },
  {
    id: "ready-steady-go",
    title: "Ready Steady Go! (Beatman & Ludmilla Edit)",
    composer: "Paul Oakenfold",
    spotifyId: "2pw0P04KK7QHInJZR3J9fr",
    tag: "Adrenalina Máxima",
    category: "Matrix & Trance",
  },
  {
    id: "160-bpm",
    title: "160 BPM",
    composer: "Hans Zimmer • Angels & Demons",
    spotifyId: "2ZV4SBXaW51Xxz7UFNmcBd",
    tag: "Ritmo Cardíaco Puro",
    category: "Fuerza Divina",
  },
  {
    id: "circa-forever",
    title: "Circa-Forever (Markus Schulz Rabbit Hole Remix)",
    composer: "Rapid Eye & Markus Schulz",
    spotifyId: "7mF3V1iMVa8LcKPxW8W2NJ",
    tag: "Trance Sagrado 138",
    category: "Trance & Maestros",
  },
  {
    id: "we-come-1",
    title: "We Come 1 2.0 (Armin van Buuren Remix)",
    composer: "Faithless & Armin van Buuren",
    spotifyId: "7v6zA8UquijCr6gSjkASRS",
    tag: "Himno de Estadios",
    category: "Trance & Maestros",
  },
];

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
  const [trackIdx, setTrackIdx] = useState(0);
  const [fadeClass, setFadeClass] = useState("opacity-100");
  const [entering, setEntering] = useState(false);

  // Catalog Drawer State
  const [showCatalog, setShowCatalog] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentTrack = WARRIOR_SOUNDTRACKS[trackIdx];

  const startAudio = useCallback(() => {
    if (!currentTrack.src || !audioRef.current) return;
    audioRef.current.volume = 0.85;
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [currentTrack.src]);

  const toggleAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentTrack.src) {
      setShowCatalog(true);
      return;
    }
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
      if (currentTrack.src) {
        audioRef.current.src = currentTrack.src;
        audioRef.current.load();
        if (isPlaying) {
          startAudio();
        }
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [trackIdx, currentTrack.src, startAudio, isPlaying]);

  // Attempt play on mount and listen to first user gesture
  useEffect(() => {
    if (currentTrack.src) {
      startAudio();
    }

    const handleUserInteraction = () => {
      if (audioRef.current && audioRef.current.paused && currentTrack.src) {
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
  }, [startAudio, currentTrack.src]);

  // Escape key closes catalog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCatalog) {
        setShowCatalog(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCatalog]);

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

  // Filtering tracks in catalog
  const categories = ["Todas", "Espíritu Samurai", "Leyenda & Poder", "El Señor de los Anillos", "Matrix & Trance", "Fuerza Divina", "Trance & Maestros"];
  const filteredTracks = WARRIOR_SOUNDTRACKS.filter((t) => {
    const matchesCategory = categoryFilter === "Todas" || t.category === categoryFilter;
    const matchesSearch =
      searchQuery === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.composer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      ref={containerRef}
      onClick={() => {
        if (!isPlaying && currentTrack.src) startAudio();
      }}
      className={`forge-container ${entering ? "forge-exit" : ""} cursor-pointer`}
      title={!isPlaying && currentTrack.src ? "Tocar la pantalla para activar el himno" : undefined}
    >
      {/* Audio Engine for local master files */}
      {currentTrack.src && (
        <audio
          ref={audioRef}
          src={currentTrack.src}
          onEnded={() => {
            setTrackIdx((prev) => (prev + 1) % WARRIOR_SOUNDTRACKS.length);
          }}
          preload="auto"
        />
      )}

      {/* Floating Epic Audio Controller (Jukebox Pill) */}
      <div
        className={`forge-audio-pill ${isPlaying || currentTrack.spotifyId ? "active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setShowCatalog(true);
        }}
        title="Hacé clic para ver el catálogo completo de 24 himnos"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevTrack(e);
          }}
          className="text-[#cca43b] hover:text-[#ffd700] p-1 text-xs transition-colors cursor-pointer"
          title="Pista anterior"
          aria-label="Pista anterior"
        >
          ⏮
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleAudio(e);
          }}
          className="flex items-center gap-2 cursor-pointer"
          title={currentTrack.spotifyId ? "Pista oficial de Spotify (hacé clic para ver catálogo)" : isPlaying ? "Pausar música" : "Reproducir música"}
        >
          <div className={`forge-audio-bars ${!isPlaying && !currentTrack.spotifyId ? "paused" : ""}`}>
            <div className="forge-audio-bar" />
            <div className="forge-audio-bar" />
            <div className="forge-audio-bar" />
            <div className="forge-audio-bar" />
            <div className="forge-audio-bar" />
          </div>
          <div className="text-left flex flex-col max-w-[150px] sm:max-w-[200px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-wider uppercase font-mono text-[#ffd700] truncate">
                {currentTrack.title}
              </span>
              {currentTrack.spotifyId && (
                <span className="text-[8px] bg-[#1db954]/20 text-[#1ed760] px-1 rounded font-mono font-bold border border-[#1db954]/40">
                  SPOTIFY
                </span>
              )}
            </div>
            <span className="text-[9px] text-[#cca43b]/80 truncate font-mono">
              {currentTrack.composer}
            </span>
          </div>
          <span className="text-xs text-[#cca43b]">
            {currentTrack.spotifyId ? "🟢" : isPlaying ? "🔊" : "🔇"}
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNextTrack(e);
          }}
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
        <div className={`forge-emblem ${isPlaying || currentTrack.spotifyId ? "playing-anthem" : ""}`}>
          <svg viewBox="0 0 120 120" className="w-24 h-24 md:w-32 md:h-32 transition-all duration-700">
            <line x1="20" y1="100" x2="60" y2="15" stroke="url(#swordGrad)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="35" y1="75" x2="50" y2="80" stroke="url(#swordGrad)" strokeWidth="2" strokeLinecap="round" />
            <line x1="100" y1="100" x2="60" y2="15" stroke="url(#swordGrad)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="85" y1="75" x2="70" y2="80" stroke="url(#swordGrad)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="60" cy="55" r="18" fill="none" stroke="url(#shieldGrad)" strokeWidth="1.5" />
            <circle cx="60" cy="55" r="12" fill="none" stroke="url(#shieldGrad)" strokeWidth="1" opacity="0.5" />
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

        {/* Spotify Dedicated Iframe Player (if active track is from Spotify) */}
        {currentTrack.spotifyId && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg mx-auto my-3 px-2 z-20 transition-all duration-500 animate-fadeIn"
          >
            <iframe
              key={currentTrack.spotifyId}
              data-testid="embed-iframe"
              style={{ borderRadius: "12px", border: "1px solid rgba(229, 184, 66, 0.45)" }}
              src={`https://open.spotify.com/embed/track/${currentTrack.spotifyId}?utm_source=generator&theme=0`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="shadow-[0_0_25px_rgba(229,184,66,0.3)] backdrop-blur-md"
            />
          </div>
        )}

        {/* Soundtrack Quick Selector / Play Trigger */}
        <div className="flex flex-wrap items-center justify-center gap-2 my-3 z-20">
          {currentTrack.src ? (
            !isPlaying ? (
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
            )
          ) : (
            <div className="flex items-center gap-2 bg-black/75 border border-[#1db954]/50 rounded-full px-4 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(29,185,84,0.25)]">
              <span className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-400 tracking-wider">
                {currentTrack.tag}: <strong className="text-white">{currentTrack.title}</strong>
              </span>
              <button
                onClick={handleNextTrack}
                className="text-xs text-[#1ed760] hover:text-white ml-2 font-mono underline cursor-pointer"
              >
                Siguiente pista ⏭
              </button>
            </div>
          )}

          {/* Button to open full catalog */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCatalog(true);
            }}
            className="px-4 py-2 rounded-full border border-amber-500/40 bg-zinc-950/80 hover:bg-amber-500/20 text-amber-300 font-mono text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer transition-all hover:scale-105 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.6)]"
            title="Explorar las 24 bandas sonoras de guerreros"
          >
            <span>📜</span>
            <span>CATÁLOGO ({WARRIOR_SOUNDTRACKS.length} HIMNOS)</span>
          </button>
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

        {/* Enter Temple Action */}
        <button onClick={handleEnter} className="forge-enter-btn group mt-4 z-20">
          <span className="forge-enter-btn-glow" />
          <span className="forge-enter-btn-text flex items-center">
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

      {/* Modal / Drawer: Full Catalog of 24 Warrior Soundtracks */}
      {showCatalog && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowCatalog(false);
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-zinc-950/95 border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(229,184,66,0.25)] flex flex-col max-h-[88vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚔️</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-mono text-amber-300 tracking-wider uppercase">
                    CATÁLOGO DE HIMNOS DE GUERREROS
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    24 Bandas Sonoras para enfoque marcial, combate y resíntesis de ATP
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCatalog(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-mono transition-colors cursor-pointer border border-zinc-700"
              >
                ✕
              </button>
            </div>

            {/* Search & Category Filter Chips */}
            <div className="py-3 space-y-2.5 border-b border-zinc-800/80">
              <input
                type="text"
                placeholder="Buscar por título, compositor o saga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
              />
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                      categoryFilter === cat
                        ? "bg-amber-500/25 text-amber-300 border border-amber-400/50 font-bold"
                        : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Track List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
              {filteredTracks.map((track) => {
                const originalIndex = WARRIOR_SOUNDTRACKS.findIndex((t) => t.id === track.id);
                const isCurrent = trackIdx === originalIndex;

                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      setTrackIdx(originalIndex);
                      setShowCatalog(false);
                    }}
                    className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-amber-500/15 border-amber-500/60 shadow-[0_0_15px_rgba(229,184,66,0.2)]"
                        : "bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/60 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-amber-400/70 w-6 text-center">
                        {String(originalIndex + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-xs font-bold font-mono truncate ${isCurrent ? "text-amber-300" : "text-zinc-100"}`}>
                            {track.title}
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                            {track.tag}
                          </span>
                          {track.spotifyId && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1db954]/20 text-[#1ed760] font-mono font-bold border border-[#1db954]/30">
                              SPOTIFY
                            </span>
                          )}
                          {track.src && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                              MASTER
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">
                          {track.composer} • {track.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                            : "bg-zinc-800 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-700"
                        }`}
                      >
                        {isCurrent ? "ACTIVA" : "ELEGIR"}
                      </button>
                      {track.spotifyId && (
                        <a
                          href={`https://open.spotify.com/track/${track.spotifyId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Abrir en Spotify oficial"
                          className="w-7 h-7 rounded-xl bg-[#1db954]/15 hover:bg-[#1db954]/30 border border-[#1db954]/40 text-[#1ed760] flex items-center justify-center text-xs transition-colors"
                        >
                          ↗
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>{filteredTracks.length} himnos disponibles</span>
              <span className="text-amber-400/80">Presioná [ESC] para cerrar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
