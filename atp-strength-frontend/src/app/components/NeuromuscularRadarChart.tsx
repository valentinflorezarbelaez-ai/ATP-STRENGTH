"use client";

import React, { useMemo } from "react";
import { ShieldCheck, Activity, Award, AlertCircle, ArrowUpRight, Scale } from "lucide-react";

export interface ExerciseMaxRecord {
  one_rep_max: number;
  training_max?: number;
  lifted_weight?: number;
  reps_performed?: number;
}

export interface NeuromuscularRadarChartProps {
  maxesMap?: Record<string, ExerciseMaxRecord>;
  currentWorkingWeight?: number;
  currentExerciseName?: string;
  className?: string;
}

interface PillarMetric {
  key: string;
  name: string;
  shortName: string;
  category: string;
  valKg: number;
  normalizedScore: number; // 0 to 100
  idealRatio: number; // relative to squat (1.0)
}

export function NeuromuscularRadarChart({
  maxesMap = {},
  currentWorkingWeight = 100,
  currentExerciseName,
  className = "",
}: NeuromuscularRadarChartProps) {
  // Helper to extract best matching 1RM for core patterns
  const get1RM = (matchTerms: string[], fallbackKg: number): number => {
    for (const [name, rec] of Object.entries(maxesMap)) {
      const lower = name.toLowerCase();
      if (matchTerms.some((term) => lower.includes(term)) && rec.one_rep_max > 0) {
        return rec.one_rep_max;
      }
    }
    // If active exercise matches, use current working weight or reasonable default
    if (currentExerciseName) {
      const lowerCur = currentExerciseName.toLowerCase();
      if (matchTerms.some((term) => lowerCur.includes(term))) {
        return currentWorkingWeight;
      }
    }
    return fallbackKg;
  };

  // Derive 5 core pillars of athletic power
  const pillars: PillarMetric[] = useMemo(() => {
    const squatKg = get1RM(["sentadilla trasera", "sentadilla"], 120);
    const deadliftKg = get1RM(["peso muerto convencional", "peso muerto"], 145);
    const benchKg = get1RM(["press de banca plano", "press de banca", "banca"], 85);
    const militaryKg = get1RM(["press militar de pie", "press militar", "militar"], 55);
    const pullKg = get1RM(["dominadas lastradas", "dominada", "remo", "pendlay"], 80);

    // Max capacity reference for chart scale normalization
    const maxRef = Math.max(squatKg, deadliftKg, benchKg * 1.35, militaryKg * 2.1, pullKg * 1.45, 150);

    return [
      {
        key: "squat",
        name: "Sentadilla (Cuádriceps)",
        shortName: "SENTADILLA",
        category: "Cadena Anterior",
        valKg: squatKg,
        normalizedScore: Math.min(100, Math.round((squatKg / maxRef) * 100)),
        idealRatio: 1.0,
      },
      {
        key: "deadlift",
        name: "Peso Muerto (Isquios/Glúteo)",
        shortName: "PESO MUERTO",
        category: "Cadena Posterior",
        valKg: deadliftKg,
        normalizedScore: Math.min(100, Math.round((deadliftKg / (maxRef * 1.2)) * 100)),
        idealRatio: 1.2,
      },
      {
        key: "bench",
        name: "Press de Banca (Pectoral)",
        shortName: "BANCA",
        category: "Empuje Horizontal",
        valKg: benchKg,
        normalizedScore: Math.min(100, Math.round((benchKg / (maxRef * 0.75)) * 100)),
        idealRatio: 0.72,
      },
      {
        key: "military",
        name: "Press Militar (Deltoides)",
        shortName: "MILITAR",
        category: "Empuje Vertical",
        valKg: militaryKg,
        normalizedScore: Math.min(100, Math.round((militaryKg / (maxRef * 0.5)) * 100)),
        idealRatio: 0.48,
      },
      {
        key: "pull",
        name: "Tracción / Dominadas (Dorsal)",
        shortName: "TRACCIÓN",
        category: "Tracción & Espalda",
        valKg: pullKg,
        normalizedScore: Math.min(100, Math.round((pullKg / (maxRef * 0.7)) * 100)),
        idealRatio: 0.68,
      },
    ];
  }, [maxesMap, currentWorkingWeight, currentExerciseName]);

  // Biomechanical Ratios Calculation
  const analysis = useMemo(() => {
    const squat = pillars.find((p) => p.key === "squat")?.valKg || 120;
    const deadlift = pillars.find((p) => p.key === "deadlift")?.valKg || 145;
    const bench = pillars.find((p) => p.key === "bench")?.valKg || 85;
    const military = pillars.find((p) => p.key === "military")?.valKg || 55;
    const pull = pillars.find((p) => p.key === "pull")?.valKg || 80;

    // Ratios
    const posteriorChainRatio = Number((deadlift / Math.max(squat, 1)).toFixed(2)); // Ideal: 1.15 - 1.25
    const pushPullRatio = Number((bench / Math.max(pull, 1)).toFixed(2)); // Ideal: 1.0 - 1.15
    const verticalHorizontalRatio = Number((military / Math.max(bench, 1)).toFixed(2)); // Ideal: 0.60 - 0.70

    // Symmetry Score Deviation Calculation
    const devPosterior = Math.abs(posteriorChainRatio - 1.2) / 1.2;
    const devPushPull = Math.abs(pushPullRatio - 1.05) / 1.05;
    const devVertHoriz = Math.abs(verticalHorizontalRatio - 0.65) / 0.65;

    const avgDev = (devPosterior + devPushPull + devVertHoriz) / 3;
    const symmetryScore = Math.max(50, Math.min(100, Math.round((1 - avgDev) * 100)));

    let statusLabel = "ARMONÍA PERFECTA";
    let statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    let recommendation = "Relaciones neuromusculares balanceadas. Máxima transferencia de fuerza con mínimo riesgo articular.";

    if (symmetryScore < 75) {
      statusLabel = "ASIMETRÍA DETECTADA";
      statusColor = "text-rose-400 bg-rose-500/10 border-rose-500/30";
      if (posteriorChainRatio < 1.1) {
        recommendation = "Déficit en cadena posterior: Incrementar volumen en Peso Muerto Rumano y Buenos Días para proteger rodillas.";
      } else if (pushPullRatio > 1.2) {
        recommendation = "Dominancia de empuje pectoral: Aumentar volumen de dominadas y remos para prevenir impacto subacromial.";
      } else {
        recommendation = "Priorizar simetría de tracción y estabilidad glenohumeral en las próximas 3 semanas.";
      }
    } else if (symmetryScore < 88) {
      statusLabel = "EQUILIBRADO";
      statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
      recommendation = "Distribución de fuerza óptima. Continuar progresión secuencial del protocolo ATP.";
    }

    return {
      posteriorChainRatio,
      pushPullRatio,
      verticalHorizontalRatio,
      symmetryScore,
      statusLabel,
      statusColor,
      recommendation,
    };
  }, [pillars]);

  // Pentagon Geometry Constants
  const cx = 175;
  const cy = 170;
  const radius = 115;
  const numVertices = 5;

  // Calculates (x, y) coordinates on regular pentagon given angle index and percentage radius
  const getCoordinates = (index: number, pct: number) => {
    // Start at -90 degrees (top vertex at 12 o'clock)
    const angle = (Math.PI * 2 * index) / numVertices - Math.PI / 2;
    const r = (radius * pct) / 100;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Concentric Rings Polygon Paths
  const rings = [20, 40, 60, 80, 100];
  const ringPolygons = useMemo(() => {
    return rings.map((ringPct) => {
      const points = Array.from({ length: numVertices })
        .map((_, i) => {
          const pt = getCoordinates(i, ringPct);
          return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
        })
        .join(" ");
      return points;
    });
  }, []);

  // Athlete's Actual Strength Polygon Path
  const athletePoints = useMemo(() => {
    return pillars
      .map((pillar, i) => {
        // Minimum score 25 for aesthetic polygon presence
        const score = Math.max(25, pillar.normalizedScore);
        const pt = getCoordinates(i, score);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(" ");
  }, [pillars]);

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col gap-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold font-mono uppercase text-white tracking-wider">
              PENTÁGONO DE SIMETRÍA NEUROMUSCULAR
            </h4>
            <p className="text-[10px] text-zinc-400 font-mono">
              Evaluación bioenergética de los 5 grandes patrones de fuerza
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${analysis.statusColor}`}>
            {analysis.statusLabel} ({analysis.symmetryScore}%)
          </span>
        </div>
      </div>

      {/* SVG Radar Chart and Vertex Data */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Radar Graphic (Left 7 Cols) */}
        <div className="md:col-span-7 flex justify-center items-center py-2 select-none relative">
          <svg
            viewBox="0 0 350 340"
            className="w-full max-w-[320px] aspect-square"
            role="img"
            aria-label="Gráfico de radar de simetría neuromuscular"
          >
            <defs>
              <linearGradient id="radar-athlete-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25" />
              </linearGradient>
              <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Concentric Ring Grid */}
            {ringPolygons.map((pts, idx) => (
              <polygon
                key={idx}
                points={pts}
                fill="none"
                stroke={idx === 4 ? "rgba(245, 158, 11, 0.3)" : "rgba(82, 82, 91, 0.25)"}
                strokeWidth={idx === 4 ? 1.5 : 1}
                strokeDasharray={idx === 4 ? undefined : "3 3"}
              />
            ))}

            {/* Radial Spokes from Center to Vertices */}
            {Array.from({ length: numVertices }).map((_, i) => {
              const pt = getCoordinates(i, 100);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={pt.x}
                  y2={pt.y}
                  stroke="rgba(113, 113, 122, 0.35)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Ideal Symmetry Target Reference (Dashed Cyan Ring at 80%) */}
            <polygon
              points={ringPolygons[3]}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.2"
              strokeDasharray="4 3"
              opacity="0.5"
            />

            {/* Athlete Actual Polygon Area */}
            <polygon
              points={athletePoints}
              fill="url(#radar-athlete-fill)"
              stroke="#f59e0b"
              strokeWidth="2.5"
              filter="url(#radar-glow)"
            />

            {/* Vertex Nodes & Interactive Values */}
            {pillars.map((pillar, i) => {
              const score = Math.max(25, pillar.normalizedScore);
              const pt = getCoordinates(i, score);
              const labelPos = getCoordinates(i, 122);

              return (
                <g key={pillar.key}>
                  {/* Glowing Node */}
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#22d3ee" stroke="#f59e0b" strokeWidth="2" />

                  {/* Label Text around perimeter */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill="#e4e4e7"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {pillar.shortName}
                  </text>
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 11}
                    fill="#f59e0b"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {pillar.valKg} kg
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Symmetry Metrics Breakdown & Diagnostics (Right 5 Cols) */}
        <div className="md:col-span-5 space-y-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Ratio Cadena Post/Ant</span>
              <span className="font-bold text-white">{analysis.posteriorChainRatio}x</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${Math.min(100, (analysis.posteriorChainRatio / 1.4) * 100)}%` }}
              />
            </div>
            <div className="text-[9px] text-zinc-500">
              Ideal: 1.15x - 1.25x (Peso Muerto / Sentadilla)
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Ratio Empuje / Tracción</span>
              <span className="font-bold text-white">{analysis.pushPullRatio}x</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${Math.min(100, (analysis.pushPullRatio / 1.3) * 100)}%` }}
              />
            </div>
            <div className="text-[9px] text-zinc-500">
              Ideal: 1.00x - 1.15x (Banca / Dominadas)
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Ratio Vertical / Horizontal</span>
              <span className="font-bold text-white">{analysis.verticalHorizontalRatio}x</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${Math.min(100, (analysis.verticalHorizontalRatio / 0.8) * 100)}%` }}
              />
            </div>
            <div className="text-[9px] text-zinc-500">
              Ideal: 0.60x - 0.70x (Militar / Banca)
            </div>
          </div>
        </div>
      </div>

      {/* Prescription / Corrective Recommendation Box */}
      <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 flex items-start gap-2.5 text-xs">
        <Activity className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
            DIAGNÓSTICO DEL MOTOR NEUROMUSCULAR:
          </span>
          <p className="text-zinc-300 font-sans leading-relaxed">
            {analysis.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
