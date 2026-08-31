import { ExerciseDefinition, ExerciseProgressState } from '../../domain/types';

export function renderExerciseExecutionCard(
  exercise: ExerciseDefinition,
  progress: ExerciseProgressState
): string {
  const completedSetsCount = progress.completedSetsCount;
  const totalSets = exercise.targetSets;
  const isFinished = completedSetsCount >= totalSets;
  const nextSetNumber = completedSetsCount + 1;
  const restMinutes = Math.round(exercise.defaultRestSeconds / 60);

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
            <span class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-widest block">
              Pauta Obligatoria del Ejercicio
            </span>
            <h3 class="text-2xl sm:text-3xl font-display font-bold text-white uppercase mt-0.5">
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

        <!-- Massive Typography Display: Current Set & Target Reps -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          
          <div class="bg-black/60 border border-zinc-800/90 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-inner">
            <span class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider">
              ${isFinished ? 'ESTADO FINAL' : 'SERIE EN CURSO'}
            </span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-5xl sm:text-6xl font-mono-num font-extrabold text-amber-400 tracking-tight drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                ${isFinished ? totalSets : nextSetNumber}
              </span>
              <span class="text-xl font-mono-num font-bold text-zinc-500">
                / ${totalSets}
              </span>
            </div>
            <span class="text-[10px] font-mono-num text-zinc-400 mt-1 uppercase">
              ${isFinished ? 'Sesión Finalizada' : `Serie Activa #${nextSetNumber}`}
            </span>
          </div>

          <div class="bg-black/60 border border-zinc-800/90 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-inner">
            <span class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider">
              REPETICIONES A REALIZAR
            </span>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-5xl sm:text-6xl font-display font-extrabold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                ${exercise.targetRepsText.split(' ')[0]}
              </span>
            </div>
            <span class="text-[10px] font-mono-num text-amber-400 mt-1 uppercase font-semibold">
              ${exercise.targetRepsText}
            </span>
          </div>

        </div>

        <!-- Minimalist Series State Badges (Neon Amber Transition) -->
        <div class="pt-2 flex flex-col items-center justify-center">
          <span class="text-[10px] font-mono-num text-zinc-500 uppercase tracking-widest mb-2.5">
            PROGRESO DE SERIES EN VIVO
          </span>
          <div class="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
            ${Array.from({ length: totalSets }).map((_, i) => {
              const isDone = i < completedSetsCount;
              const isCurrent = i === completedSetsCount;
              return `
                <div class="w-11 h-11 rounded-xl border-2 flex items-center justify-center font-mono-num text-sm transition-all duration-300 select-none ${
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

      <!-- Giant Action Button with 3D tactile feedback & Glowing Pulse -->
      ${!isFinished ? `
        <button
          type="button"
          id="btn-complete-set"
          class="w-full py-5 sm:py-6 px-6 rounded-2xl bg-amber-500 border-2 border-amber-400 text-black font-display font-extrabold text-base sm:text-xl tracking-wider uppercase btn-glow-pulse transition-all duration-100 ease-out hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 select-none cursor-pointer"
        >
          <span class="drop-shadow">⚡ COMPLETAR SERIE #${nextSetNumber}</span>
          <span class="text-xs font-mono-num font-bold px-2.5 py-1 rounded-md bg-black text-amber-400 shadow">
            BLOQUEO ATP (${restMinutes} MIN)
          </span>
        </button>
      ` : `
        <div class="bg-emerald-950/30 border-2 border-emerald-600/80 rounded-2xl p-6 text-center shadow-[0_0_25px_rgba(16,185,129,0.2)]">
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

      <!-- Series History List -->
      ${progress.history.length > 0 ? `
        <div class="mt-6 pt-4 border-t border-zinc-800/80">
          <span class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block mb-2.5">
            Registro Histórico de la Sesión (${progress.history.length} Series Registradas)
          </span>
          <div class="space-y-2">
            ${[...progress.history].reverse().map(log => {
              const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return `
                <div class="p-3 px-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono-num transition-all">
                  <div class="flex items-center gap-2.5">
                    <span class="font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                      ✓ Serie #${log.setIndex}
                    </span>
                    <span class="text-zinc-200 font-semibold">${log.targetRepsText}</span>
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
