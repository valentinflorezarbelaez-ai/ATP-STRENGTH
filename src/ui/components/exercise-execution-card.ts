import { ExerciseDefinition, ExerciseProgressState, ExerciseProgress, LoadPrescription } from '../../domain/types';

export function renderExerciseExecutionCard(
  exercise: ExerciseDefinition,
  progress: ExerciseProgressState,
  exerciseProgress?: ExerciseProgress,
  prescription?: LoadPrescription
): string {
  const completedSetsCount = progress.completedSetsCount;
  const totalSets = exercise.targetSets;
  const isFinished = completedSetsCount >= totalSets;
  const nextSetNumber = completedSetsCount + 1;
  const restMinutes = Math.round(exercise.defaultRestSeconds / 60);

  const defaultReps = parseInt(exercise.targetRepsText.match(/\d+/)?.[0] || '3', 10);
  const targetWeight = prescription && prescription.targetWeightKg > 0 ? prescription.targetWeightKg : '';
  const current1RM = exerciseProgress?.currentOneRepMaxKg;
  const tmKg = current1RM ? current1RM * (exerciseProgress.trainingMaxPercent || 0.90) : null;
  const isBodyweight = prescription?.isBodyweight || false;

  return `
    <div class="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 mb-6 shadow-2xl transition-all duration-300">
      
      <!-- Section Header -->
      <div class="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-5">
        <div class="flex items-center gap-2">
          <span class="text-amber-500 font-mono-num font-bold text-sm">02//</span>
          <h2 class="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-zinc-100">
            Fase de Ejecución: Series de Fuerza Real
          </h2>
        </div>
        <div class="flex items-center gap-2 font-mono-num text-xs">
          <span class="text-zinc-400">Estado:</span>
          <span class="font-bold px-2.5 py-0.5 rounded-md transition-all ${
            isFinished 
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
              : 'bg-amber-950 text-amber-400 border border-amber-800'
          }">
            ${completedSetsCount} / ${totalSets} COMPLETADAS
          </span>
        </div>
      </div>

      <!-- Main Visual Goal Card -->
      <div class="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 mb-6 relative overflow-hidden">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-widest block">
                Pauta Obligatoria del Ejercicio
              </span>
              ${current1RM ? `
                <span class="text-[10px] font-mono-num font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
                  TM: ${tmKg?.toFixed(1)} kg (1RM: ${current1RM.toFixed(1)} kg)
                </span>
              ` : `
                <button
                  type="button"
                  data-action="open-strength-modal"
                  data-exercise-id="${exercise.id}"
                  class="text-[10px] font-mono-num font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  ⚡ Configurar 1RM / Carga Objetivo
                </button>
              `}
            </div>
            <h3 class="text-2xl sm:text-3xl font-display font-bold text-white uppercase mt-1">
              ${exercise.name}
            </h3>
            <p class="text-xs text-zinc-400 font-mono-num mt-1">
              ${exercise.intensityNote}
            </p>
          </div>

          <!-- Rest pill -->
          <div class="flex items-center gap-2 self-start sm:self-center">
            <span class="text-xs font-mono-num text-amber-400 bg-amber-950/60 border border-amber-500/40 px-3.5 py-1.5 rounded-full font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              ⏱️ ${restMinutes} MIN DESCANSO ATP
            </span>
          </div>
        </div>

        <!-- Typography Display: Target Weight, Current Set & Target Reps -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          
          <!-- Card 1: Serie Activa -->
          <div class="bg-black/60 border border-zinc-800/90 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner">
            <span class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider">
              ${isFinished ? 'ESTADO FINAL' : 'SERIE EN CURSO'}
            </span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-4xl sm:text-5xl font-mono-num font-extrabold text-amber-400 tracking-tight drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                ${isFinished ? totalSets : nextSetNumber}
              </span>
              <span class="text-lg font-mono-num font-bold text-zinc-500">
                / ${totalSets}
              </span>
            </div>
            <span class="text-[10px] font-mono-num text-zinc-400 mt-1 uppercase">
              ${isFinished ? 'Sesión Finalizada' : `Serie Activa #${nextSetNumber}`}
            </span>
          </div>

          <!-- Card 2: Reps Pautadas -->
          <div class="bg-black/60 border border-zinc-800/90 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner">
            <span class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider">
              REPETICIONES PAUTADAS
            </span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                ${defaultReps}
              </span>
            </div>
            <span class="text-[10px] font-mono-num text-amber-400 mt-1 uppercase font-semibold">
              ${exercise.targetRepsText}
            </span>
          </div>

          <!-- Card 3: Carga Objetivo Prescrita -->
          <div class="bg-black/60 border border-zinc-800/90 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner">
            <span class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider">
              CARGA OBJETIVO (85% TM)
            </span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-4xl sm:text-5xl font-mono-num font-extrabold ${prescription && prescription.targetWeightKg > 0 ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-zinc-500'}">
                ${prescription && prescription.targetWeightKg > 0 ? (isBodyweight ? `+${prescription.targetWeightKg}` : prescription.targetWeightKg) : '—'}
              </span>
              ${prescription && prescription.targetWeightKg > 0 ? `<span class="text-base font-mono-num font-bold text-zinc-400">kg</span>` : ''}
            </div>
            <span class="text-[10px] font-mono-num text-zinc-400 mt-1 uppercase font-semibold">
              ${prescription && prescription.targetWeightKg > 0 
                ? (isBodyweight ? 'Lastre Calculado' : `Prescrita (85% TM)`) 
                : 'Sin 1RM definido'}
            </span>
          </div>

        </div>

        <!-- Series State Badges -->
        <div class="pt-2 flex flex-col items-center justify-center">
          <span class="text-[10px] font-mono-num text-zinc-500 uppercase tracking-widest mb-2.5">
            PROGRESO DE SERIES EN VIVO
          </span>
          <div class="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
            ${Array.from({ length: totalSets }).map((_, i) => {
              const isDone = i < completedSetsCount;
              const isCurrent = i === completedSetsCount;
              return `
                <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono-num text-sm transition-all duration-300 select-none ${
                  isDone 
                    ? 'bg-amber-400 border-amber-300 text-black shadow-[0_0_16px_rgba(245,158,11,0.7)] font-extrabold scale-105' 
                    : isCurrent 
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 ring-2 ring-amber-500/50 font-bold animate-pulse' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-600 font-semibold'
                }">
                  ${isDone ? '✓' : i + 1}
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>

      <!-- Live Execution Input Box (What I Actually Lifted) -->
      ${!isFinished ? `
        <div class="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 mb-5 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span class="text-xs font-mono-num font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>✍️</span> REGISTRO REAL DE LA SERIE #${nextSetNumber}
            </span>
            <span class="text-[10px] font-mono-num text-zinc-400">
              Registrá qué levantaste realmente
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-num text-xs">
            <div>
              <label class="text-[11px] text-zinc-400 uppercase tracking-wider block mb-1">
                ${isBodyweight ? 'Lastre Usado (kg):' : 'Peso Levantado (kg):'}
              </label>
              <input
                type="number"
                id="input-set-actual-weight"
                step="0.5"
                min="0"
                value="${targetWeight}"
                placeholder="ej: ${targetWeight || '80'}"
                class="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono-num text-base font-bold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>

            <div>
              <label class="text-[11px] text-zinc-400 uppercase tracking-wider block mb-1">
                Repeticiones Completadas:
              </label>
              <input
                type="number"
                id="input-set-actual-reps"
                step="1"
                min="1"
                max="30"
                value="${defaultReps}"
                placeholder="ej: ${defaultReps}"
                class="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono-num text-base font-bold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>

            <div>
              <label class="text-[11px] text-zinc-400 uppercase tracking-wider block mb-1">
                Esfuerzo Percibido (RPE opcional):
              </label>
              <select
                id="select-set-actual-rpe"
                class="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono-num text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="">Sin RPE</option>
                <option value="6.5">RPE 6.5 (Muy ligero - 3+ en reserva)</option>
                <option value="7.0">RPE 7.0 (3 reps en reserva)</option>
                <option value="7.5">RPE 7.5 (2-3 reps en reserva)</option>
                <option value="8.0" selected>RPE 8.0 (2 reps en reserva - Óptimo)</option>
                <option value="8.5">RPE 8.5 (1-2 reps en reserva)</option>
                <option value="9.0">RPE 9.0 (1 rep en reserva - Exigente)</option>
                <option value="9.5">RPE 9.5 (0-1 rep en reserva)</option>
                <option value="10.0">RPE 10.0 (Fallo concéntrico / Máximo)</option>
              </select>
            </div>
          </div>

          <!-- Giant Action Button -->
          <button
            type="button"
            id="btn-complete-set"
            class="w-full py-5 sm:py-6 px-6 rounded-2xl bg-amber-500 border-2 border-amber-400 text-black font-display font-extrabold text-base sm:text-xl tracking-wider uppercase btn-glow-pulse shadow-lg transition-all duration-100 ease-out hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 select-none cursor-pointer mt-2"
          >
            <span class="drop-shadow">⚡ REGISTRAR SERIE #${nextSetNumber}</span>
            <span class="text-xs font-mono-num font-bold px-2.5 py-1 rounded-md bg-black text-amber-400 shadow">
              BLOQUEO ATP (${restMinutes} MIN)
            </span>
          </button>
        </div>
      ` : `
        <div class="bg-emerald-950/30 border-2 border-emerald-600/80 rounded-2xl p-6 text-center shadow-[0_0_25px_rgba(16,185,129,0.2)] mb-5">
          <div class="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-400 flex items-center justify-center text-xl mx-auto mb-2 text-emerald-300 shadow">
            ✓
          </div>
          <span class="text-emerald-300 font-display font-bold text-base sm:text-lg tracking-wider uppercase block">
            TODAS LAS SERIES DE ${exercise.name.toUpperCase()} COMPLETADAS
          </span>
          <p class="text-xs text-zinc-400 mt-1 font-mono-num">
            Pauta finalizada con éxito. Seleccioná el siguiente ejercicio en la barra superior.
          </p>
        </div>
      `}

      <!-- Series History List with Actual Real Executed Weights -->
      ${progress.history.length > 0 ? `
        <div class="pt-4 border-t border-zinc-800/80">
          <span class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block mb-2.5">
            Registro Histórico de la Sesión (${progress.history.length} Series Registradas)
          </span>
          <div class="space-y-2">
            ${[...progress.history].reverse().map(log => {
              const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const weightStr = log.actualWeightKg !== undefined ? `${log.actualWeightKg} kg` : '';
              const repsStr = log.actualReps !== undefined ? `${log.actualReps} reps` : log.targetRepsText;
              const rpeStr = log.rpe ? `RPE ${log.rpe}` : '';

              return `
                <div class="p-3 px-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono-num transition-all">
                  <div class="flex items-center gap-2.5 flex-wrap">
                    <span class="font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                      ✓ Serie #${log.setIndex}
                    </span>
                    ${weightStr ? `
                      <span class="text-white font-bold bg-black/60 px-2 py-0.5 rounded border border-zinc-700">
                        ${weightStr}
                      </span>
                    ` : ''}
                    <span class="text-zinc-200 font-semibold">${repsStr}</span>
                    ${rpeStr ? `
                      <span class="text-[10px] text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-900/40">
                        ${rpeStr}
                      </span>
                    ` : ''}
                  </div>
                  <span class="text-zinc-500 text-[11px]">${timeStr}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

    </div>
  `;
}
