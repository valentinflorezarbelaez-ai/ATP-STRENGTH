import { PreparationPhaseStep } from '../../domain/types';

export function renderPreparationStepper(
  steps: PreparationPhaseStep[],
  activePhaseTimer: { phase: number; remainingSeconds: number } | null
): string {
  const prepSteps = steps.filter(s => s.phase <= 4);
  const allPrepDone = prepSteps.every(s => s.isCompleted);

  return `
    <div class="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl transition-all duration-300">
      <div class="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
        <div class="flex items-center gap-2">
          <span class="text-amber-500 font-mono-num font-bold text-sm">01//</span>
          <h2 class="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-zinc-100">
            Fase de Preparación Neuromuscular (Paso a Paso)
          </h2>
        </div>
        <span class="text-xs font-mono-num px-3 py-0.5 rounded-full transition-all ${
          allPrepDone 
            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
            : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
        }">
          ${allPrepDone ? '✓ PREPARACIÓN COMPLETA' : 'SECUENCIAL MANDATORIO'}
        </span>
      </div>

      <div class="space-y-3">
        ${prepSteps.map((step, idx) => {
          const isCurrentTimer = activePhaseTimer && activePhaseTimer.phase === step.phase;
          const isUnlocked = idx === 0 || prepSteps[idx - 1].isCompleted;
          const isCompleted = step.isCompleted;

          let statusBg = 'bg-zinc-900/30 border-zinc-800/60 opacity-60';
          let badgeText = 'BLOQUEADO';
          let badgeClass = 'text-zinc-600 bg-zinc-950 border-zinc-800';

          if (isCompleted) {
            statusBg = 'bg-emerald-950/20 border-emerald-900/60 text-emerald-200';
            badgeText = '✓ LISTO';
            badgeClass = 'text-emerald-300 bg-emerald-950 border-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
          } else if (isCurrentTimer) {
            statusBg = 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/30 animate-phase-entry';
            badgeText = `⏳ ${activePhaseTimer.remainingSeconds}s`;
            badgeClass = 'text-amber-300 bg-amber-950 border-amber-400 font-bold animate-pulse';
          } else if (isUnlocked) {
            statusBg = 'bg-zinc-900/90 border-zinc-700 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800/90 animate-phase-entry';
            badgeText = 'INICIAR';
            badgeClass = 'text-zinc-300 bg-zinc-800 border-zinc-600 hover:bg-amber-500 hover:text-black hover:border-amber-400';
          }

          return `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl border ${statusBg} transition-all duration-300 ease-in-out gap-3">
              <div class="flex items-start sm:items-center gap-3.5">
                <div class="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-mono-num text-xs font-bold transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-900 border border-emerald-600 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                    : isUnlocked 
                      ? 'bg-zinc-800 border border-zinc-600 text-white' 
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-600'
                }">
                  ${isCompleted ? '✓' : step.phase}
                </div>
                <div>
                  <div class="flex items-center gap-2.5 flex-wrap">
                    <span class="text-xs sm:text-sm font-semibold font-mono-num ${isCompleted ? 'text-emerald-300' : 'text-zinc-100'}">
                      ${step.name}
                    </span>
                    <span class="text-xs font-mono-num font-bold text-amber-400 bg-black/70 px-2.5 py-0.5 rounded-md border border-zinc-700 shadow-sm">
                      ${step.repsText}
                    </span>
                  </div>
                  <p class="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    ${step.description}
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-end gap-2 mt-1 sm:mt-0 flex-shrink-0">
                ${isCurrentTimer ? `
                  <button
                    data-skip-prep-timer="${step.phase}"
                    class="text-[10px] font-mono-num px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-600 transition-all active:scale-95"
                    title="Avanzar 15s"
                  >
                    ⏩ +15s
                  </button>
                  <button
                    data-complete-prep-step="${step.phase}"
                    class="text-xs font-mono-num px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-extrabold rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all duration-100 active:scale-95 cursor-pointer"
                  >
                    FINALIZAR AHORA
                  </button>
                ` : isUnlocked && !isCompleted ? `
                  <button
                    data-start-prep-step="${step.phase}"
                    class="text-xs font-mono-num px-4 py-2 rounded-xl border border-zinc-600 bg-zinc-800 hover:bg-amber-500 hover:text-black hover:border-amber-400 text-zinc-100 transition-all duration-150 font-bold active:scale-95 shadow-sm cursor-pointer"
                  >
                    ${step.restSeconds > 0 ? `INICIAR (${step.restSeconds}s)` : 'COMPLETAR'}
                  </button>
                ` : `
                  <span class="text-[10px] font-mono-num px-3 py-1 rounded-md border transition-all ${badgeClass}">
                    ${badgeText}
                  </span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
