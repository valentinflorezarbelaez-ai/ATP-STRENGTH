export function renderPreparationTimerModal(
  phase: number,
  phaseName: string,
  exerciseName: string,
  description: string,
  totalSeconds: number,
  remainingSeconds: number,
  isPaused: boolean = false
): string {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const circumference = 282.74; // 2 * PI * 45
  const progressPercent = totalSeconds > 0 ? Math.max(0, Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100)) : 0;
  const dashoffset = circumference - (circumference * progressPercent) / 100;

  return `
    <div id="prep-timer-modal-backdrop" class="fixed inset-0 z-50 zen-backdrop flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none overflow-hidden transition-all duration-300 animate-fade-in">
      
      <!-- Subtle Ambient Glow -->
      <div class="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <div class="relative z-10 max-w-lg w-full flex flex-col items-center">
        
        <!-- Status Indicator Pill -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-950 border border-amber-500/50 rounded-full text-xs font-mono-num font-bold text-amber-300 uppercase tracking-widest mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <span class="w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-600' : 'bg-amber-400 animate-ping'}"></span>
          <span>${phase === 0 ? 'CRONÓMETRO DE MOVILIDAD' : `PREPARACIÓN // FASE ${phase}`}</span>
        </div>

        <!-- Exercise Focus & Phase Name -->
        <div class="mb-4">
          <span class="text-xs font-mono-num font-bold text-zinc-400 uppercase tracking-widest block mb-1">
            ${exerciseName}
          </span>
          <h2 class="text-xl sm:text-2xl font-display font-bold text-white uppercase tracking-wide">
            ${phaseName}
          </h2>
          <p class="text-xs text-zinc-400 font-mono-num max-w-md mx-auto mt-1 leading-relaxed">
            ${description}
          </p>
        </div>

        <!-- Digital Clock with Reactive Circular Progress Ring -->
        <div class="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center mb-6">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <!-- Background Ring Track -->
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#18181b"
              stroke-width="3"
              fill="transparent"
            />
            <!-- Reactive Continuous Countdown Perimeter Ring -->
            <circle
              id="prep-svg-progress-ring"
              cx="50"
              cy="50"
              r="45"
              stroke="${phase === 0 ? '#f59e0b' : '#10b981'}"
              stroke-width="3.5"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${dashoffset}"
              stroke-linecap="round"
              fill="transparent"
              class="timer-ring-circle shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all duration-300"
            />
          </svg>
          
          <div class="absolute flex flex-col items-center justify-center pointer-events-none">
            <span class="text-6xl sm:text-7xl font-mono-num font-extrabold text-white tracking-tighter drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]" id="prep-clock-digits">
              ${timeFormatted}
            </span>
            <span class="text-[11px] font-mono-num text-amber-400 font-bold uppercase tracking-widest mt-1">
              ${isPaused ? 'EN PAUSA' : (phase === 0 ? 'MOVILIDAD CONTINUA' : 'TIEMPO ACTIVO')}
            </span>
          </div>
        </div>

        <!-- Quick Controls -->
        <div class="flex items-center justify-center gap-2.5 w-full max-w-sm flex-wrap">
          <button
            type="button"
            id="btn-prep-modal-skip-15s"
            class="py-2.5 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-700 text-xs font-mono-num font-semibold transition-all active:scale-95 cursor-pointer"
            title="Avanzar 15 segundos"
          >
            ⏩ +15s
          </button>
          
          <button
            type="button"
            id="btn-prep-modal-toggle-pause"
            class="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-amber-300 rounded-xl border border-amber-500/40 text-xs font-mono-num font-bold transition-all active:scale-95 cursor-pointer"
          >
            ${isPaused ? '▶️ REANUDAR' : '⏸️ PAUSAR'}
          </button>

          <button
            type="button"
            id="btn-prep-modal-complete"
            class="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-extrabold rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] text-xs font-mono-num transition-all active:scale-95 cursor-pointer"
          >
            ✓ FINALIZAR AHORA
          </button>
        </div>

        <!-- Secondary action: minimize to work in background -->
        <button
          type="button"
          id="btn-prep-modal-minimize"
          class="mt-4 text-[11px] font-mono-num text-zinc-500 hover:text-zinc-300 underline cursor-pointer transition-colors"
        >
          Minimizar cronómetro
        </button>

      </div>
    </div>
  `;
}
