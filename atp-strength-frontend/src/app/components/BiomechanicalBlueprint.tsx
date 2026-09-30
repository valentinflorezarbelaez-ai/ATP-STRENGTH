"use client";

import React, { useMemo } from "react";
import { ShieldCheck, Activity, Compass, Cpu, Layers } from "lucide-react";
import { type ExerciseMedia } from "@/lib/exerciseMediaCatalog";

interface BiomechanicalBlueprintProps {
  media: ExerciseMedia;
  className?: string;
}

type MovementPattern = "squat" | "hinge" | "push_horizontal" | "push_vertical" | "pull" | "accessory";

function detectMovementPattern(category: string, name: string): MovementPattern {
  const norm = `${category} ${name}`.toLowerCase();
  if (norm.includes("sentadilla") || norm.includes("prensa") || norm.includes("búlgara") || norm.includes("squat")) {
    return "squat";
  }
  if (norm.includes("muerto") || norm.includes("deadlift") || norm.includes("thrust") || norm.includes("rumano") || norm.includes("buenos días")) {
    return "hinge";
  }
  if (norm.includes("banca") || norm.includes("bench") || norm.includes("pecho") || norm.includes("flexiones") || norm.includes("fondos")) {
    return "push_horizontal";
  }
  if (norm.includes("militar") || norm.includes("overhead") || norm.includes("hombro") || norm.includes("press militar")) {
    return "push_vertical";
  }
  if (norm.includes("remo") || norm.includes("dominada") || norm.includes("jalón") || norm.includes("pull") || norm.includes("espalda")) {
    return "pull";
  }
  return "accessory";
}

export function BiomechanicalBlueprint({ media, className = "" }: BiomechanicalBlueprintProps) {
  const pattern = useMemo(() => detectMovementPattern(media.category, media.name), [media.category, media.name]);

  // Biomechanical Kinematic Parameters per Pattern
  const kinMetrics = useMemo(() => {
    switch (pattern) {
      case "squat":
        return {
          kineticChain: "Cerrada (CKC)",
          primaryJoints: "Cadera (110° flex) • Rodilla (85° flex)",
          lumbarMoment: "Control de cizallamiento lumbar neutro",
          barPathVector: "Vertical estricto sobre medio pie (±1.5 cm)",
          rfdFocus: "Reclutamiento de unidades motoras tipo IIX",
          tempoLabel: media.tempo || "3-1-X-1",
        };
      case "hinge":
        return {
          kineticChain: "Cerrada posterior (CKC)",
          primaryJoints: "Cadera (45° flex) • Rodilla (15-20° microflex)",
          lumbarMoment: "Brazo de palanca axial máximo; rigidez lumbopélvica",
          barPathVector: "Línea tangencial pegada a tibias y muslos",
          rfdFocus: "Disparo neural de glúteo mayor e isquiosurales",
          tempoLabel: media.tempo || "3-1-X-0",
        };
      case "push_horizontal":
        return {
          kineticChain: "Cadena mixta con Leg Drive",
          primaryJoints: "Codo (45-75° aducción) • Hombro (escápula retraída)",
          lumbarMoment: "Arco fisiológico torácico sin estrés lumbar",
          barPathVector: "J-curve controlada: esternón bajo a línea ocular",
          rfdFocus: "Velocidad concéntrica máxima sin desaceleración prematura",
          tempoLabel: media.tempo || "2-1-X-1",
        };
      case "push_vertical":
        return {
          kineticChain: "Cadena axial vertical completa",
          primaryJoints: "Hombro (180° flexión completa) • Codo (180° bloqueo)",
          lumbarMoment: "Compresión axial pura; core y glúteos en cerrojo",
          barPathVector: "Esquiva de barbilla y trayectoria lineal sobre corona",
          rfdFocus: "Propagación neuromuscular de cadena cinética total",
          tempoLabel: media.tempo || "2-0-X-1",
        };
      case "pull":
        return {
          kineticChain: "Abierta / Cerrada según variante",
          primaryJoints: "Húmero (extensión/aducción) • Escápula (retracción 100%)",
          lumbarMoment: "Brazo de palanca dorsal sin oscilación inercial",
          barPathVector: "Tracción codo hacia cadera; depresión de cintura escapular",
          rfdFocus: "Tensión mecánica sostenida en punto de máxima contracción",
          tempoLabel: media.tempo || "3-0-1-1",
        };
      default:
        return {
          kineticChain: "Aislamiento analítico articular",
          primaryJoints: "Articulación uniplanar objetivo",
          lumbarMoment: "Neutralización de balanceos de impulso",
          barPathVector: "Arco concéntrico controlado con tensión continua",
          rfdFocus: "Microdaño focal y activación neuromuscular dirigida",
          tempoLabel: media.tempo || "3-0-1-0",
        };
    }
  }, [pattern, media.tempo]);

  return (
    <div className={`relative w-full bg-[#08080c] border border-amber-500/25 rounded-2xl overflow-hidden flex flex-col ${className}`}>
      {/* Blueprint Header HUD */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-950/90 border-b border-zinc-900 text-xs font-mono">
        <div className="flex items-center gap-2 text-amber-400">
          <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span className="font-bold tracking-wider text-[11px] uppercase">
            BLUEPRINT BIOMECÁNICO // {pattern.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            OFFLINE READY
          </span>
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            TEMPO: {kinMetrics.tempoLabel}
          </span>
        </div>
      </div>

      {/* SVG Biomechanical Schematic Container */}
      <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-[#050508] via-[#09090f] to-[#040407] flex items-center justify-center p-3 select-none overflow-hidden">
        {/* Subtle Cyber Grid Background */}
        <svg
          viewBox="0 0 600 340"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Esquema biomecánico de ${media.name}`}
        >
          <defs>
            <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(245, 158, 11, 0.07)" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="vector-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="bar-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="600" height="340" fill="url(#blueprint-grid)" />

          {/* Perimeter Coordinate Markings */}
          <g stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1">
            <line x1="20" y1="20" x2="35" y2="20" />
            <line x1="20" y1="20" x2="20" y2="35" />
            <line x1="580" y1="20" x2="565" y2="20" />
            <line x1="580" y1="20" x2="580" y2="35" />
            <line x1="20" y1="320" x2="35" y2="320" />
            <line x1="20" y1="320" x2="20" y2="305" />
            <line x1="580" y1="320" x2="565" y2="320" />
            <line x1="580" y1="320" x2="580" y2="305" />
          </g>

          {/* Ground Platform Baseline */}
          <line x1="50" y1="300" x2="550" y2="300" stroke="#3f3f46" strokeWidth="2" strokeDasharray="6 4" />
          <text x="545" y="315" fill="#71717a" fontSize="9" fontFamily="monospace" textAnchor="end">
            PLANO DE APOYO // MEDIO PIE
          </text>

          {/* Archetype Specific Kinematic Skeleton */}
          {pattern === "squat" && (
            <g id="kinematic-squat">
              {/* Midfoot Vertical Center of Mass Line */}
              <line x1="280" y1="40" x2="280" y2="300" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
              <text x="285" y="55" fill="#22d3ee" fontSize="9" fontFamily="monospace">LINEA DE CARGA (COM)</text>

              {/* Barbell Path Arrow */}
              <line x1="280" y1="120" x2="280" y2="220" stroke="#10b981" strokeWidth="2.5" strokeDasharray="3 3" />
              <polygon points="280,110 275,122 285,122" fill="#10b981" />

              {/* Human Skeleton in Deep Squat Position */}
              {/* Feet / Tripod */}
              <ellipse cx="280" cy="298" rx="22" ry="5" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="280" cy="295" r="4" fill="#f59e0b" />

              {/* Shin / Tibia (Ankle to Knee) */}
              <line x1="280" y1="295" x2="330" y2="235" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              <circle cx="330" cy="235" r="5" fill="#22d3ee" filter="url(#neon-glow)" />

              {/* Femur (Knee to Hip) - Breaking Parallel */}
              <line x1="330" y1="235" x2="250" y2="245" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              <circle cx="250" cy="245" r="5" fill="#22d3ee" filter="url(#neon-glow)" />

              {/* Spine / Torso (Hip to Shoulder) */}
              <line x1="250" y1="245" x2="280" y2="135" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
              <circle cx="280" cy="135" r="5" fill="#22d3ee" filter="url(#neon-glow)" />

              {/* Head */}
              <circle cx="286" cy="105" r="14" fill="#18181b" stroke="#71717a" strokeWidth="2" />

              {/* Barbell Across Traps */}
              <line x1="220" y1="135" x2="340" y2="135" stroke="url(#bar-grad)" strokeWidth="6" strokeLinecap="round" filter="url(#neon-glow)" />
              <rect x="210" y="123" width="10" height="24" rx="2" fill="#f59e0b" />
              <rect x="340" y="123" width="10" height="24" rx="2" fill="#f59e0b" />

              {/* Joint Angle Callouts */}
              <path d="M 315 220 A 25 25 0 0 1 330 255" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
              <text x="345" y="240" fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold">85° (Paralelo)</text>

              <path d="M 265 240 A 25 25 0 0 0 240 225" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="175" y="245" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">110° Cadera</text>

              {/* Vector Force Annotation */}
              <line x1="280" y1="295" x2="280" y2="245" stroke="#10b981" strokeWidth="2.5" />
              <polygon points="280,240 275,250 285,250" fill="#10b981" />
              <text x="290" y="260" fill="#10b981" fontSize="9" fontFamily="monospace">↑ REACCIÓN SUELO</text>
            </g>
          )}

          {pattern === "hinge" && (
            <g id="kinematic-hinge">
              {/* Midfoot Line */}
              <line x1="290" y1="40" x2="290" y2="300" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
              <text x="295" y="55" fill="#22d3ee" fontSize="9" fontFamily="monospace">EJE DE MEDIO PIE</text>

              {/* Feet */}
              <ellipse cx="290" cy="298" rx="22" ry="5" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="290" cy="295" r="4" fill="#f59e0b" />

              {/* Shin (Vertical in conventional) */}
              <line x1="290" y1="295" x2="300" y2="225" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              <circle cx="300" cy="225" r="5" fill="#22d3ee" filter="url(#neon-glow)" />

              {/* Femur (Hinged backward) */}
              <line x1="300" y1="225" x2="210" y2="200" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              <circle cx="210" cy="200" r="5" fill="#22d3ee" filter="url(#neon-glow)" />

              {/* Torso (Inclined neutral spine) */}
              <line x1="210" y1="200" x2="295" y2="130" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
              <circle cx="295" cy="130" r="5" fill="#22d3ee" filter="url(#neon-glow)" />

              {/* Arms hanging vertical to bar */}
              <line x1="295" y1="130" x2="290" y2="230" stroke="#a1a1aa" strokeWidth="3" strokeDasharray="4 2" />
              <circle cx="290" cy="230" r="4" fill="#f59e0b" />

              {/* Head */}
              <circle cx="315" cy="115" r="14" fill="#18181b" stroke="#71717a" strokeWidth="2" />

              {/* Barbell at Shin Level */}
              <line x1="230" y1="230" x2="350" y2="230" stroke="url(#bar-grad)" strokeWidth="6" strokeLinecap="round" filter="url(#neon-glow)" />
              <circle cx="290" cy="230" r="16" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="2" />

              {/* Hip Angle */}
              <text x="135" y="195" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">HINGE ~45°</text>
              <text x="315" y="215" fill="#22d3ee" fontSize="9" fontFamily="monospace">RODILLA ~15°</text>
            </g>
          )}

          {pattern === "push_horizontal" && (
            <g id="kinematic-bench">
              {/* Bench Structure */}
              <rect x="160" y="220" width="280" height="14" rx="3" fill="#27272a" stroke="#52525b" strokeWidth="1.5" />
              <rect x="180" y="234" width="16" height="66" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
              <rect x="400" y="234" width="16" height="66" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

              {/* Athlete on Bench with Arch */}
              <path d="M 210 216 Q 270 200 330 216" fill="none" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
              <circle cx="340" cy="215" r="5" fill="#22d3ee" filter="url(#neon-glow)" />
              <circle cx="210" cy="216" r="5" fill="#22d3ee" />

              {/* Leg Drive */}
              <line x1="210" y1="216" x2="190" y2="260" stroke="#f59e0b" strokeWidth="4" />
              <line x1="190" y1="260" x2="190" y2="300" stroke="#f59e0b" strokeWidth="4" />
              <ellipse cx="190" cy="300" rx="14" ry="4" fill="#f59e0b" />
              <text x="140" y="280" fill="#10b981" fontSize="9" fontFamily="monospace">LEG DRIVE ↗</text>

              {/* Arms (Chest touch position) */}
              <line x1="320" y1="205" x2="350" y2="235" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round" />
              <line x1="350" y1="235" x2="300" y2="155" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round" />
              <circle cx="350" cy="235" r="5" fill="#f59e0b" />

              {/* Barbell Path */}
              <line x1="300" y1="155" x2="300" y2="90" stroke="#10b981" strokeWidth="2.5" strokeDasharray="3 3" />
              <polygon points="300,80 295,92 305,92" fill="#10b981" />
              <text x="310" y="100" fill="#10b981" fontSize="9" fontFamily="monospace">J-PATH ↑</text>

              {/* Barbell */}
              <line x1="240" y1="155" x2="360" y2="155" stroke="url(#bar-grad)" strokeWidth="6" strokeLinecap="round" filter="url(#neon-glow)" />

              <text x="365" y="245" fill="#22d3ee" fontSize="9" fontFamily="monospace">CODO 60°</text>
              <text x="240" y="195" fill="#f59e0b" fontSize="9" fontFamily="monospace">ESCÁPULAS RETRAÍDAS</text>
            </g>
          )}

          {pattern === "push_vertical" && (
            <g id="kinematic-overhead">
              {/* Vertical Center Axis */}
              <line x1="300" y1="30" x2="300" y2="300" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />

              {/* Standing Feet */}
              <ellipse cx="300" cy="298" rx="25" ry="5" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="1.5" />

              {/* Legs Locked */}
              <line x1="300" y1="295" x2="300" y2="210" stroke="#f59e0b" strokeWidth="4" />
              <circle cx="300" cy="210" r="5" fill="#22d3ee" />

              {/* Torso Straight */}
              <line x1="300" y1="210" x2="300" y2="135" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />

              {/* Arms Fully Locked Overhead */}
              <line x1="300" y1="135" x2="280" y2="90" stroke="#a1a1aa" strokeWidth="3.5" />
              <line x1="280" y1="90" x2="300" y2="55" stroke="#a1a1aa" strokeWidth="3.5" />
              <line x1="300" y1="135" x2="320" y2="90" stroke="#a1a1aa" strokeWidth="3.5" />
              <line x1="320" y1="90" x2="300" y2="55" stroke="#a1a1aa" strokeWidth="3.5" />

              {/* Barbell Overhead */}
              <line x1="230" y1="55" x2="370" y2="55" stroke="url(#bar-grad)" strokeWidth="6" strokeLinecap="round" filter="url(#neon-glow)" />

              {/* Lockout Callout */}
              <text x="380" y="60" fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold">LOCKOUT 180°</text>
              <text x="180" y="175" fill="#f59e0b" fontSize="9" fontFamily="monospace">CORE / GLÚTEO CERROJO</text>
            </g>
          )}

          {pattern === "pull" && (
            <g id="kinematic-pull">
              {/* Pull Bar / Grip Horizon */}
              <line x1="180" y1="70" x2="420" y2="70" stroke="#52525b" strokeWidth="4" strokeLinecap="round" />

              {/* Hands on Bar */}
              <circle cx="240" cy="70" r="6" fill="#f59e0b" />
              <circle cx="360" cy="70" r="6" fill="#f59e0b" />

              {/* Forearms & Upper Arms (Pull Up position) */}
              <line x1="240" y1="70" x2="260" y2="125" stroke="#a1a1aa" strokeWidth="4" />
              <line x1="260" y1="125" x2="285" y2="120" stroke="#a1a1aa" strokeWidth="4" />

              <line x1="360" y1="70" x2="340" y2="125" stroke="#a1a1aa" strokeWidth="4" />
              <line x1="340" y1="125" x2="315" y2="120" stroke="#a1a1aa" strokeWidth="4" />

              {/* Torso & Head */}
              <line x1="300" y1="120" x2="300" y2="210" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
              <circle cx="300" cy="98" r="14" fill="#18181b" stroke="#71717a" strokeWidth="2" />

              {/* Scapular Retraction Vector */}
              <line x1="260" y1="125" x2="300" y2="140" stroke="#10b981" strokeWidth="2" strokeDasharray="2 2" />
              <line x1="340" y1="125" x2="300" y2="140" stroke="#10b981" strokeWidth="2" strokeDasharray="2 2" />

              <text x="300" y="160" fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle">
                RETRACCIÓN ESCAPULAR 100%
              </text>
              <text x="300" y="240" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                SIN BALANCEO INERCIAL
              </text>
            </g>
          )}

          {pattern === "accessory" && (
            <g id="kinematic-accessory">
              <circle cx="300" cy="170" r="60" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="300" cy="170" r="6" fill="#f59e0b" filter="url(#neon-glow)" />

              <line x1="300" y1="170" x2="360" y2="120" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" />
              <circle cx="360" cy="120" r="5" fill="#22d3ee" />

              <text x="300" y="100" fill="#22d3ee" fontSize="10" fontFamily="monospace" textAnchor="middle">
                BRAZO DE MOMENTO AISLADO
              </text>
              <text x="300" y="260" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                TENSIÓN MECÁNICA CONSTANTE
              </text>
            </g>
          )}
        </svg>

        {/* Floating Cyber Vector Tags */}
        <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-black/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
            Fuerza: RFD 100%
          </span>
          <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-black/80 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
            Valsalva 360°
          </span>
        </div>
      </div>

      {/* Kinetic Details Matrix */}
      <div className="p-3 bg-zinc-950/70 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
        <div className="flex items-start gap-1.5 text-zinc-300">
          <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-zinc-500 block text-[9px] uppercase">Cadena & Articulaciones</span>
            <span>{kinMetrics.kineticChain} • {kinMetrics.primaryJoints}</span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 text-zinc-300">
          <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-zinc-500 block text-[9px] uppercase">Trayectoria de Barra</span>
            <span>{kinMetrics.barPathVector}</span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 text-zinc-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-zinc-500 block text-[9px] uppercase">Palanca & Seguridad</span>
            <span>{kinMetrics.lumbarMoment}</span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 text-zinc-300">
          <Activity className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-zinc-500 block text-[9px] uppercase">Enfoque Neural</span>
            <span>{kinMetrics.rfdFocus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
