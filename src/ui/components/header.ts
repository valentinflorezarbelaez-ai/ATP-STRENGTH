export function renderHeader(activeDayTitle: string, isRestDay: boolean): string {
  return `
    <header class="border-b border-zinc-800/80 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="h-10 w-2 bg-amber-500 rounded-sm shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-display font-bold tracking-wider text-white uppercase">
              NEURO<span class="text-amber-500">//</span>STRENGTH
            </h1>
            <span class="text-[10px] font-mono-num font-semibold bg-zinc-900 text-amber-400 px-2 py-0.5 rounded border border-amber-900/60">
              GUÍA DE EJECUCIÓN
            </span>
          </div>
          <p class="text-xs text-zinc-400 font-mono-num">
            ${isRestDay ? 'SISTEMA NERVIOSO: MODO REGENERACIÓN' : `OBJETIVO: ${activeDayTitle.toUpperCase()}`}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button
          id="btn-open-strength-modal"
          type="button"
          title="Progreso de 1RM y Cargas Objetivo"
          class="p-2 px-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 transition-all text-xs font-mono-num font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.15)] cursor-pointer"
        >
          <span>⚡ FUERZA / PROGRESO</span>
        </button>
        <button
          id="btn-export-data"
          type="button"
          title="Exportar Sesión"
          class="p-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors text-xs font-mono-num cursor-pointer"
        >
          💾 EXPORTAR
        </button>
        <button
          id="btn-reset-data"
          type="button"
          title="Reiniciar Sesión"
          class="p-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-rose-900 text-zinc-500 hover:text-rose-400 transition-colors text-xs font-mono-num cursor-pointer"
        >
          ↺ RESET
        </button>
      </div>
    </header>
  `;
}
