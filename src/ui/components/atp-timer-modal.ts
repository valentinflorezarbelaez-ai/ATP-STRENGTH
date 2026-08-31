/**
 * Emite un pulso armónico tipo campana/cuenco tibetano zen de 440Hz con decay suave
 * utilizando Web Audio API
 */
export function playAtpCompletionChime(): void {
  try {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;

    const ctx = new AudioCtxClass();
    const now = ctx.currentTime;

    // Fundamental: 440Hz (La / A4)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, now);

    // Harmonic Overtones: 880Hz & 1320Hz for rich bell resonance
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now);

    // Gain Envelopes (Smooth bell attack and decay)
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.35, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.12, now + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 2.0);
    osc2.stop(now + 2.0);
  } catch (e) {
    console.warn('Audio Context no permitido o silenciado por el navegador:', e);
  }
}

export function renderAtpTimerModal(
  exerciseName: string,
  totalSeconds: number,
  remainingSeconds: number
): string {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Circumference of radius 45 is 2 * PI * 45 ≈ 282.74
  const circumference = 282.74;
  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100));
  const dashoffset = circumference - (circumference * progressPercent) / 100;

  return `
    <div id="atp-screen-lock" class="fixed inset-0 z-50 zen-backdrop flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none overflow-hidden transition-all duration-300">
      
      <!-- Subtle Golden Ambient Aura -->
      <div class="absolute w-[32rem] h-[32rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <div class="relative z-10 max-w-lg w-full flex flex-col items-center">
        
        <!-- Status Indicator Pill -->
        <div class="inline-flex items-center gap-2.5 px-4 py-1.5 bg-zinc-950 border border-amber-500/50 rounded-full text-xs font-mono-num font-bold text-amber-300 uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          <span>AISLAMIENTO ZEN // RESÍNTESIS ATP</span>
        </div>

        <!-- Exercise Focus Name -->
        <span class="text-xs sm:text-sm font-mono-num font-bold text-zinc-400 uppercase tracking-widest mb-3">
          ${exerciseName}
        </span>

        <!-- Massive High-Legibility Digital Clock with Reactive SVG Perimeter Ring -->
        <div class="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center mb-8">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <!-- Perimeter Track Background -->
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#18181b"
              stroke-width="3"
              fill="transparent"
            />
            <!-- Reactive Continuous Countdown Perimeter Ring (60fps transition) -->
            <circle
              id="atp-svg-progress-ring"
              cx="50"
              cy="50"
              r="45"
              stroke="#f59e0b"
              stroke-width="3.5"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${dashoffset}"
              stroke-linecap="round"
              fill="transparent"
              class="timer-ring-circle shadow-[0_0_25px_rgba(245,158,11,0.6)]"
            />
          </svg>
          
          <div class="absolute flex flex-col items-center justify-center pointer-events-none">
            <span class="text-6xl sm:text-7xl lg:text-8xl font-mono-num font-extrabold text-white tracking-tighter drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]" id="atp-clock-digits">
              ${timeFormatted}
            </span>
            <span class="text-xs font-mono-num text-amber-400 font-bold uppercase tracking-widest mt-2">
              RECARGA DEL SNC
            </span>
          </div>
        </div>

        <!-- Mandatory Directive Message -->
        <div class="space-y-1 mb-8">
          <h2 class="text-xl sm:text-2xl font-display font-bold text-zinc-100 uppercase tracking-wide">
            Resíntesis de ATP en progreso.
          </h2>
          <p class="text-sm font-display font-bold text-amber-400 tracking-wider uppercase">
            Mantén el SNC en calma.
          </p>
        </div>

        <!-- Testing / Fast Controls -->
        <div class="flex items-center gap-3 w-full max-w-xs">
          <button
            type="button"
            id="btn-atp-skip-30s"
            class="flex-1 py-2.5 px-3 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 text-xs font-mono-num font-semibold transition-all active:scale-95"
          >
            ⏩ +30s Test
          </button>
          <button
            type="button"
            id="btn-atp-force-finish"
            class="flex-1 py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-400 rounded-xl border border-amber-500/40 text-xs font-mono-num font-bold transition-all active:scale-95"
          >
            Finalizar Descanso
          </button>
        </div>

      </div>
    </div>
  `;
}
