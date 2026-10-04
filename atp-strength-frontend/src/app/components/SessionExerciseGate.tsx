"use client";

import { useState } from "react";
import { computeOneRm } from "@/lib/workoutStrategies";
import { findSavedPr } from "@/lib/sessionExercise";

function formatKg(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export function SessionExerciseGate({
  onConfirm,
}: {
  onConfirm: (name: string, pr: number) => void;
}) {
  const [name, setName] = useState("");
  const [prText, setPrText] = useState("");
  const [helperOpen, setHelperOpen] = useState(false);
  const [weightText, setWeightText] = useState("");
  const [repsText, setRepsText] = useState("");

  const saved = findSavedPr(name);
  const pr = Number(prText);
  const helperWeight = Number(weightText);
  const helperReps = Number(repsText);
  const estimateReady = helperWeight > 0 && helperReps >= 1;
  const canConfirm = name.trim().length > 0 && pr > 0;

  const handleNameChange = (value: string) => {
    setName(value);
    const hit = findSavedPr(value);
    if (hit) setPrText(formatKg(hit.pr));
  };

  const applyEstimate = () => {
    if (!estimateReady) return;
    setPrText(formatKg(computeOneRm(helperWeight, helperReps)));
  };

  return (
    <form
      className="p-4 sm:p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canConfirm) return;
        onConfirm(name, pr);
      }}
    >
      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-50 leading-snug">
        Ingresa el ejercicio que vas a realizar y tu PR.
      </h2>

      <div className="space-y-1.5">
        <label htmlFor="session-exercise" className="text-sm font-medium text-zinc-300 block">
          Ejercicio
        </label>
        <input
          id="session-exercise"
          name="ejercicio"
          type="text"
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          autoComplete="off"
          placeholder="Cualquier ejercicio"
          className="w-full min-h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500"
        />
      </div>

      {saved ? (
        <p className="text-sm text-zinc-300 leading-relaxed">
          Ya tenés un PR de {formatKg(saved.pr)} kg en este dispositivo. Podés cambiarlo.
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="session-pr" className="text-sm font-medium text-zinc-300 block">
          Tu PR (kg)
        </label>
        <input
          id="session-pr"
          name="pr"
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={prText}
          onChange={(event) => setPrText(event.target.value)}
          placeholder="0"
          className="w-full min-h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 font-mono text-xl font-semibold text-amber-300 tabular-nums focus:border-amber-500"
        />
      </div>

      <button
        type="button"
        aria-expanded={helperOpen}
        onClick={() => setHelperOpen((open) => !open)}
        className="w-full min-h-11 rounded-xl border border-amber-500/40 bg-amber-500/10 text-sm font-semibold text-amber-200 cursor-pointer"
      >
        Ayudar a sacar el PR
      </button>

      {helperOpen ? (
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="pr-helper-weight" className="text-sm font-medium text-zinc-300 block">
                Peso (kg)
              </label>
              <input
                id="pr-helper-weight"
                name="peso"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={weightText}
                onChange={(event) => setWeightText(event.target.value)}
                className="w-full min-h-11 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 font-mono text-base text-zinc-100 focus:border-amber-500"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pr-helper-reps" className="text-sm font-medium text-zinc-300 block">
                Repeticiones
              </label>
              <input
                id="pr-helper-reps"
                name="repeticiones"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={repsText}
                onChange={(event) => setRepsText(event.target.value)}
                className="w-full min-h-11 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 font-mono text-base text-zinc-100 focus:border-amber-500"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={applyEstimate}
            disabled={!estimateReady}
            className="w-full min-h-11 rounded-xl bg-zinc-100 text-zinc-950 text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Poner este PR
          </button>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!canConfirm}
        className="w-full min-h-11 h-14 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Confirmar
      </button>
    </form>
  );
}
