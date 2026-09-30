"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Trophy,
  Zap,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";
import type { ProgressionCurvePoint, SupercompensationTrend } from "@/lib/prHistory";

export interface NeuromuscularProgressionChartProps {
  exerciseName: string;
  curvePoints: ProgressionCurvePoint[];
  trend: SupercompensationTrend;
  current1Rm?: number;
  className?: string;
}

export function NeuromuscularProgressionChart({
  exerciseName,
  curvePoints,
  trend,
  current1Rm,
  className = "",
}: NeuromuscularProgressionChartProps) {
  const [activePointId, setActivePointId] = useState<string | null>(null);

  const selectedPoint = useMemo(() => {
    if (!curvePoints.length) return null;
    if (activePointId) {
      return curvePoints.find((p) => p.id === activePointId) || curvePoints[curvePoints.length - 1];
    }
    return curvePoints[curvePoints.length - 1];
  }, [curvePoints, activePointId]);

  // SVG Chart Geometry calculations
  const chartData = useMemo(() => {
    if (curvePoints.length < 2) return null;

    const width = 600;
    const height = 220;
    const padding = { top: 25, right: 35, bottom: 35, left: 50 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const values = curvePoints.map((p) => p.e1rm || p.load_kg || 1);
    const minVal = Math.max(0, Math.floor(Math.min(...values) * 0.95));
    const maxVal = Math.ceil(Math.max(...values) * 1.05);
    const valRange = maxVal - minVal || 1;

    const points = curvePoints.map((p, idx) => {
      const x = padding.left + (idx / (curvePoints.length - 1)) * innerWidth;
      const val = p.e1rm || p.load_kg || 0;
      const y = padding.top + innerHeight - ((val - minVal) / valRange) * innerHeight;
      return { ...p, x, y, val };
    });

    // Generate smooth SVG path string
    const linePath = points.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x},${pt.y}`;
      // Smooth cubic bezier through midpoint control points
      const prev = arr[idx - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.y;
      return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${pt.x},${pt.y}`;
    }, "");

    // Area path for gradient fill
    const firstPt = points[0];
    const lastPt = points[points.length - 1];
    const areaPath = `${linePath} L ${lastPt.x},${padding.top + innerHeight} L ${firstPt.x},${padding.top + innerHeight} Z`;

    // Horizontal Y grid ticks (3 ticks: min, mid, max)
    const midVal = Math.round((minVal + maxVal) / 2);
    const yTicks = [
      { val: maxVal, y: padding.top },
      { val: midVal, y: padding.top + innerHeight / 2 },
      { val: minVal, y: padding.top + innerHeight },
    ];

    return {
      width,
      height,
      padding,
      points,
      linePath,
      areaPath,
      yTicks,
      minVal,
      maxVal,
    };
  }, [curvePoints]);

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 ${className}`}>
      {/* Header with Title and Trend Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-zinc-900">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-mono font-bold text-white uppercase tracking-wider">
              CURVA DE SUPERCOMPENSACIÓN NEUROMUSCULAR (e1RM)
            </h3>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-400">
              SPEC-0009
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
            Evolución histórica de 1RM estimada y picos de adaptación para <strong className="text-zinc-200">{exerciseName}</strong>
          </p>
        </div>

        {/* Dynamic Supercompensation Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border bg-zinc-900 ${trend.statusColor} border-zinc-800`}
          >
            {trend.status === "SUPERCOMPENSATION_PEAK" && <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
            {trend.status === "PROGRESSION_POSITIVE" && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
            {trend.status === "CONSOLIDATING" && <Zap className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{trend.statusLabel}</span>
          </span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>PR Histórico</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">
            {trend.currentBestE1rm > 0
              ? `${trend.currentBestE1rm} kg`
              : current1Rm
              ? `${current1Rm} kg`
              : "—"}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">e1RM Máximo</div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Línea Base</div>
          <div className="text-lg sm:text-xl font-black text-zinc-200 mt-0.5">
            {trend.baselineE1rm > 0 ? `${trend.baselineE1rm} kg` : "—"}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Primer Registro</div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Ganancia Neta</div>
          <div
            className={`text-lg sm:text-xl font-black mt-0.5 ${
              trend.netProgressionKg > 0
                ? "text-emerald-400"
                : trend.netProgressionKg < 0
                ? "text-red-400"
                : "text-zinc-400"
            }`}
          >
            {trend.netProgressionKg > 0 ? `+${trend.netProgressionKg} kg` : `${trend.netProgressionKg} kg`}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            {trend.netProgressionPct > 0 ? `+${trend.netProgressionPct}%` : "0%"}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Series Registradas</div>
          <div className="text-lg sm:text-xl font-black text-white mt-0.5">
            {curvePoints.length}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Muestras de Carga</div>
        </div>
      </div>

      {/* Main Progression Curve or Empty State */}
      {curvePoints.length === 0 ? (
        <div className="py-10 px-4 rounded-xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center space-y-2">
          <Info className="w-6 h-6 text-zinc-600 mx-auto" />
          <p className="text-xs font-mono text-zinc-400">
            Aún no hay series registradas en el historial de <strong className="text-amber-400">{exerciseName}</strong>.
          </p>
          <p className="text-[11px] text-zinc-500 max-w-md mx-auto">
            Completá tus series en el Cockpit o registrá una calibración de 1RM para comenzar a visualizar tu curva de supercompensación neuromuscular.
          </p>
        </div>
      ) : curvePoints.length === 1 ? (
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between text-xs font-mono">
          <div className="space-y-1">
            <span className="text-amber-400 font-bold uppercase">Línea Base Única Detectada</span>
            <p className="text-zinc-400 text-[11px]">
              Serie calibrada: <strong>{curvePoints[0].load_kg} kg</strong> × {curvePoints[0].reps} reps (e1RM: {curvePoints[0].e1rm} kg).
              Registrá una segunda serie para activar el trazado continuo de la curva.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
            1/2 Puntos
          </span>
        </div>
      ) : chartData ? (
        <div className="relative space-y-3">
          {/* Interactive SVG Curve Container */}
          <div className="w-full bg-zinc-950/80 rounded-xl border border-zinc-900 p-2 overflow-hidden shadow-inner">
            <svg
              viewBox={`0 0 ${chartData.width} ${chartData.height}`}
              className="w-full h-auto select-none"
            >
              <defs>
                {/* Gradient for area under curve */}
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>

                {/* Filter for PR Star Glow */}
                <filter id="prGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid Lines & Y Axis Labels */}
              {chartData.yTicks.map((tick) => (
                <g key={tick.val}>
                  <line
                    x1={chartData.padding.left}
                    y1={tick.y}
                    x2={chartData.width - chartData.padding.right}
                    y2={tick.y}
                    stroke="#27272a"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={chartData.padding.left - 8}
                    y={tick.y + 4}
                    fill="#71717a"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {tick.val} kg
                  </text>
                </g>
              ))}

              {/* Filled Area */}
              <path d={chartData.areaPath} fill="url(#curveGradient)" />

              {/* Main Curve Stroke */}
              <path
                d={chartData.linePath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {chartData.points.map((pt) => {
                const isSelected = selectedPoint?.id === pt.id;
                return (
                  <g
                    key={pt.id}
                    className="cursor-pointer transition-transform"
                    onClick={() => setActivePointId(pt.id)}
                  >
                    {/* Outer Glow Halo for Selected or PR */}
                    {(pt.isPr || isSelected) && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? 10 : 7}
                        fill={pt.isPr ? "#f59e0b" : "#38bdf8"}
                        fillOpacity="0.25"
                        filter="url(#prGlow)"
                      />
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={pt.isPr ? 5.5 : 4}
                      fill={pt.isPr ? "#f59e0b" : isSelected ? "#38bdf8" : "#09090b"}
                      stroke={pt.isPr ? "#fbbf24" : isSelected ? "#38bdf8" : "#71717a"}
                      strokeWidth={pt.isPr ? "2.5" : "1.5"}
                    />

                    {/* X-axis Date label below point */}
                    <text
                      x={pt.x}
                      y={chartData.height - 8}
                      fill={isSelected ? "#f4f4f5" : "#71717a"}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight={isSelected ? "bold" : "normal"}
                    >
                      {pt.dateFormatted}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Selected Point Inspection Tooltip Card */}
          {selectedPoint && (
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{selectedPoint.dateFormatted}</span>
                </div>
                <div className="text-zinc-200">
                  Carga: <strong className="text-white">{selectedPoint.load_kg} kg</strong> × {selectedPoint.reps} reps
                </div>
                {selectedPoint.rpe && (
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400">
                    RPE {selectedPoint.rpe}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400">e1RM:</span>
                <span className="text-sm font-black text-amber-400">
                  {selectedPoint.e1rm} kg
                </span>
                {selectedPoint.isPr && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    PR Establecido
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
