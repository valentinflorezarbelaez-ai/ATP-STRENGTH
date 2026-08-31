export function renderHeader(activeDayTitle: string, isRestDay: boolean): string {
  return `
    <header class="border-b border-zinc-800/80 pb-4 mb-6 flex items-center justify-between">
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

      <div class="flex items-center gap-2">
        <button id="btn-export-data" title="Exportar Sesión" class="p-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors text-xs font-mono-num">
          💾 EXPORTAR
        </button>
        <button id="btn-reset-data" title="Reiniciar Sesión" class="p-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-rose-900 text-zinc-500 hover:text-rose-400 transition-colors text-xs font-mono-num">
          ↺ RESET
        </button>
      </div>
    </header>
  `;
}
