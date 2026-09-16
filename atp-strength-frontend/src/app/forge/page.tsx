"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const WARRIOR_QUOTES = [
  { text: "No hay camino al poder. El camino ES el poder.", author: "Miyamoto Musashi" },
  { text: "La victoria pertenece al más perseverante.", author: "Napoleón" },
  { text: "El hierro cura todo.", author: "Henry Rollins" },
  { text: "El dolor de hoy es la fuerza del mañana.", author: "Anónimo" },
  { text: "Un guerrero no se rinde. Un guerrero trasciende.", author: "V.M. Samael Aun Weor" },
  { text: "El cuerpo logra lo que la mente cree.", author: "Proverbio Espartano" },
  { text: "Percibe aquello que no puede ser visto con los ojos.", author: "Miyamoto Musashi" },
  { text: "No temas a quien practica 10.000 patadas. Teme a quien practica una patada 10.000 veces.", author: "Bruce Lee" },
  { text: "La espada y la mente deben ser una sola cosa.", author: "Miyamoto Musashi" },
  { text: "Miguel, Príncipe de los Ejércitos Celestiales, defiéndenos en la batalla.", author: "Oración a San Miguel" },
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

export default function ForgeLanding() {
  const router = useRouter();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [fadeClass, setFadeClass] = useState("opacity-100");
  const [entering, setEntering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeClass("opacity-0");
      setTimeout(() => {
        setQuoteIdx((prev) => (prev + 1) % WARRIOR_QUOTES.length);
        setFadeClass("opacity-100");
      }, 600);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    setEntering(true);
    setTimeout(() => router.push("/"), 1200);
  };

  const quote = WARRIOR_QUOTES[quoteIdx];

  return (
    <div
      ref={containerRef}
      className={`forge-container ${entering ? "forge-exit" : ""}`}
    >
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
        {/* Crossed Swords Emblem */}
        <div className="forge-emblem">
          <svg viewBox="0 0 120 120" className="w-24 h-24 md:w-32 md:h-32">
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

        {/* Rotating Quotes */}
        <div className="forge-quote-container">
          <div className={`forge-quote transition-opacity duration-500 ${fadeClass}`}>
            <p className="forge-quote-text">&ldquo;{quote.text}&rdquo;</p>
            <p className="forge-quote-author">— {quote.author}</p>
          </div>
        </div>

        {/* Enter Button */}
        <button onClick={handleEnter} className="forge-enter-btn group">
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
