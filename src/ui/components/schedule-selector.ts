import { WorkoutDayDefinition, DayId } from '../../domain/types';
import { ELITE_SCHEDULE } from '../../domain/schedule-data';

export function renderScheduleSelector(activeDayId: DayId): string {
  const dayNamesShort: Record<DayId, string> = {
    lunes: 'LUN',
    martes: 'MAR',
    miercoles: 'MIÉ',
    jueves: 'JUE',
    viernes: 'VIE',
    sabado: 'SÁB',
    domingo: 'DOM'
  };

  return `
    <nav class="grid grid-cols-7 gap-1.5 sm:gap-2 mb-6" aria-label="Selector de Días">
      ${ELITE_SCHEDULE.map((day: WorkoutDayDefinition) => {
        const isActive = day.id === activeDayId;
        const isRest = day.isRestDay;
        
        let borderClass = 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80';
        let textClass = 'text-zinc-400';
        let tagClass = 'text-zinc-500';

        if (isActive) {
          if (isRest) {
            borderClass = 'border-rose-600/80 bg-rose-950/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.25)]';
            textClass = 'text-rose-200 font-bold';
            tagClass = 'text-rose-400';
          } else {
            borderClass = 'border-amber-500 bg-amber-950/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]';
            textClass = 'text-white font-bold';
            tagClass = 'text-amber-400 font-semibold';
          }
        } else if (isRest) {
          borderClass = 'border-zinc-900 bg-zinc-950/40 text-zinc-600 opacity-60';
        }

        return `
          <button
            data-day-id="${day.id}"
            class="day-tab-btn flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border ${borderClass} transition-all duration-150 text-center select-none"
          >
            <span class="text-xs font-mono-num ${textClass}">${dayNamesShort[day.id]}</span>
            <span class="text-[10px] font-mono-num uppercase mt-0.5 ${tagClass}">
              ${isRest ? 'OFF' : day.code}
            </span>
          </button>
        `;
      }).join('')}
    </nav>
  `;
}
