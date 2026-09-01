import { ExerciseDefinition, ExerciseProgress } from '../../domain/types';
import {
  DEFAULT_ROUNDING_KG,
  DEFAULT_TRAINING_MAX_PERCENT,
  generateAllPhasePrescriptions,
  calculateTrainingMax
} from '../../domain/strength-engine';

export function renderStrengthProgressModal(
  exercises: ExerciseDefinition[],
  selectedExerciseId: string,
  progressMap: Record<string, ExerciseProgress>,
  userBodyweightKg: number = 75
): string {
  const currentEx = exercises.find(e => e.id === selectedExerciseId) || exercises[0];
  const exProgress: ExerciseProgress = progressMap[currentEx.id] || {
    exerciseId: currentEx.id,
    trainingMaxPercent: DEFAULT_TRAINING_MAX_PERCENT,
    roundingKg: DEFAULT_ROUNDING_KG,
    records: [],
    updatedAt: Date.now()
  };

  const isBodyweightEx = currentEx.id.includes('fondos') || currentEx.id.includes('dominadas');
  const current1RM = exProgress.currentOneRepMaxKg || 0;
  const tmPercent = exProgress.trainingMaxPercent || DEFAULT_TRAINING_MAX_PERCENT;
  const roundingKg = exProgress.roundingKg || DEFAULT_ROUNDING_KG;
  const tmKg = calculateTrainingMax(current1RM, tmPercent);

  const prescriptions = generateAllPhasePrescriptions(
    current1RM,
    tmPercent,
    roundingKg,
    exProgress.customPhasePercentages,
    isBodyweightEx,
    userBodyweightKg
  );

  const latestRecord = exProgress.records && exProgress.records.length > 0
    ? exProgress.records[exProgress.records.length - 1]
    : null;

  return `
    <div id="strength-modal-backdrop" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div class="bg-zinc-950 border border-zinc-800 w-full max-w-4xl rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.15)] flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        <!-- Modal Header -->
        <div class="px-5 py-4 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-900/60">
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-8 bg-amber-500 rounded-sm shadow-[0_0_12px_rgba(245,158,11,0.6)]"></div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base sm:text-lg font-display font-bold text-white uppercase tracking-wider">
                  PROGRESO & CARGAS OBJETIVO
                </h2>
                <span class="text-[10px] font-mono-num font-bold bg-amber-950 text-amber-400 border border-amber-800/80 px-2 py-0.5 rounded">
                  MOTOR 1RM / TM
                </span>
              </div>
              <p class="text-xs text-zinc-400 font-mono-num">
                Cálculo fisiológico de cargas para el protocolo secuencial ATP
              </p>
            </div>
          </div>

          <button
            id="btn-close-strength-modal"
            type="button"
            class="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 flex items-center justify-center transition-all cursor-pointer font-bold text-sm"
            title="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <!-- Exercise Selector Strip -->
        <div class="p-3 bg-zinc-900/40 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          ${exercises.map(ex => {
            const isSelected = ex.id === currentEx.id;
            const has1RM = (progressMap[ex.id]?.currentOneRepMaxKg || 0) > 0;
            return `
              <button
                type="button"
                data-modal-select-exercise="${ex.id}"
                class="flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs font-mono-num font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : has1RM
                      ? 'bg-zinc-900 border-emerald-800/60 text-emerald-300 hover:border-emerald-700'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }"
              >
                <span>${ex.name}</span>
                ${has1RM ? '<span class="text-[9px] font-bold">1RM✓</span>' : ''}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Modal Body Scrollable Container -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          <!-- SECTION 1: Status & Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            
            <!-- Card 1: 1RM Actual -->
            <div class="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <span class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block">
                1RM ACTUAL (MÁXIMO)
              </span>
              <div class="my-2">
                <span class="text-3xl sm:text-4xl font-mono-num font-extrabold text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                  ${current1RM > 0 ? `${current1RM.toFixed(1)} <span class="text-lg text-zinc-400 font-bold">kg</span>` : 'Sin registro'}
                </span>
              </div>
              <div class="text-[11px] font-mono-num text-zinc-500">
                ${latestRecord ? `Última marca: ${latestRecord.weightKg}kg × ${latestRecord.reps} (${latestRecord.source.toUpperCase()})` : 'Ingresá una marca para calcular'}
              </div>
            </div>

            <!-- Card 2: Training Max (TM) -->
            <div class="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block">
                  TRAINING MAX (TM)
                </span>
                <span class="text-[10px] font-mono-num font-bold text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded">
                  ${Math.round(tmPercent * 100)}% de 1RM
                </span>
              </div>
              <div class="my-2">
                <span class="text-3xl sm:text-4xl font-mono-num font-extrabold text-white">
                  ${tmKg > 0 ? `${tmKg.toFixed(1)} <span class="text-lg text-zinc-400 font-bold">kg</span>` : '—'}
                </span>
              </div>
              <div class="text-[11px] font-mono-num text-zinc-500">
                Base conservadora para evitar fatiga excesiva
              </div>
            </div>

            <!-- Card 3: Carga Fase 5 (Fuerza Real) -->
            <div class="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block">
                  OBJETIVO FASE 5 (5×3)
                </span>
                <span class="text-[10px] font-mono-num font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
                  85% de TM
                </span>
              </div>
              <div class="my-2">
                <span class="text-3xl sm:text-4xl font-mono-num font-extrabold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  ${prescriptions[5].targetWeightKg > 0 ? `${prescriptions[5].targetWeightKg} <span class="text-lg text-zinc-400 font-bold">kg</span>` : '—'}
                </span>
              </div>
              <div class="text-[11px] font-mono-num text-zinc-500">
                ${prescriptions[5].rawWeightKg > 0 ? `Cálculo exacto: ${prescriptions[5].rawWeightKg.toFixed(2)} kg (redondeo a ${roundingKg} kg)` : 'Redondeo configurado'}
              </div>
            </div>

          </div>

          <!-- SECTION 2: Phase Breakdown Table -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-5">
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
              <div class="flex items-center gap-2">
                <span class="text-amber-500 font-mono-num font-bold text-xs">01//</span>
                <h3 class="text-xs sm:text-sm font-display font-bold text-white uppercase tracking-wider">
                  Prescripción de Cargas por Fase para ${currentEx.name}
                </h3>
              </div>
              <span class="text-[10px] font-mono-num text-zinc-400">
                Redondeo activo: ${roundingKg} kg
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              ${[
                { p: 0, name: 'Fase 0: Movilidad', reps: '120s', pct: '0%' },
                { p: 1, name: 'Fase 1: Activación', reps: '10 reps', pct: '20% TM' },
                { p: 2, name: 'Fase 2: Aprox Ligera', reps: '5 reps', pct: '40% TM' },
                { p: 3, name: 'Fase 3: Aprox Media', reps: '3 reps', pct: '60% TM' },
                { p: 4, name: 'Fase 4: Aprox Pesada', reps: '1 rep', pct: '80% TM' },
                { p: 5, name: 'Fase 5: Fuerza Real', reps: `${currentEx.targetSets}×${currentEx.targetRepsText.split(' ')[0]}`, pct: '85% TM' }
              ].map(item => {
                const presc = prescriptions[item.p];
                const hasWeight = presc && presc.targetWeightKg > 0;
                const isWorkSet = item.p === 5;

                return `
                  <div class="p-3 rounded-lg border flex flex-col justify-between ${
                    isWorkSet 
                      ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/30' 
                      : 'bg-zinc-950 border-zinc-800/80'
                  }">
                    <div>
                      <div class="flex items-center justify-between text-[10px] font-mono-num">
                        <span class="${isWorkSet ? 'text-amber-400 font-bold' : 'text-zinc-400'}">F${item.p}</span>
                        <span class="text-zinc-500">${item.pct}</span>
                      </div>
                      <span class="text-[11px] font-semibold text-zinc-200 block truncate mt-1" title="${item.name}">
                        ${item.name.replace('Fase ' + item.p + ': ', '')}
                      </span>
                      <span class="text-[10px] font-mono-num text-zinc-500 block">
                        ${item.reps}
                      </span>
                    </div>

                    <div class="mt-3 pt-2 border-t border-zinc-800/60">
                      <div class="text-sm sm:text-base font-mono-num font-bold ${isWorkSet ? 'text-amber-300' : hasWeight ? 'text-white' : 'text-zinc-600'}">
                        ${item.p === 0 
                          ? 'Sin carga' 
                          : hasWeight 
                            ? (isBodyweightEx ? `+${presc.targetWeightKg} kg` : `${presc.targetWeightKg} kg`) 
                            : (item.p === 1 ? 'Barra / 0 kg' : '—')}
                      </div>
                      ${hasWeight && presc.rawWeightKg !== presc.targetWeightKg ? `
                        <span class="text-[9px] font-mono-num text-zinc-500 block" title="Valor teórico sin redondear">
                          Teórico: ${presc.rawWeightKg} kg
                        </span>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- SECTION 3: Record Mark Form (Interactive Live Calculator) -->
          <div class="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 sm:p-5">
            <div class="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div class="flex items-center gap-2">
                <span class="text-amber-500 font-mono-num font-bold text-xs">02//</span>
                <h3 class="text-xs sm:text-sm font-display font-bold text-white uppercase tracking-wider">
                  Registrar Marca / Actualizar 1RM para ${currentEx.name}
                </h3>
              </div>
              <span class="text-[10px] font-mono-num text-amber-400 font-semibold">
                FÓRMULA EPLEY / BRZYCKI / DIRECTO
              </span>
            </div>

            <form id="form-register-strength-mark" class="space-y-4">
              <input type="hidden" name="exerciseId" value="${currentEx.id}" />

              <!-- Source / Method Selection -->
              <div>
                <label class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Método de Origen del Dato:
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <label class="flex items-center justify-center p-2.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-mono-num text-zinc-300 cursor-pointer hover:border-amber-500 transition-all has-[:checked]:bg-amber-950/60 has-[:checked]:border-amber-400 has-[:checked]:text-amber-300">
                    <input type="radio" name="calcSource" value="epley" class="sr-only" checked />
                    <span>⚡ Estimación Epley</span>
                  </label>
                  <label class="flex items-center justify-center p-2.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-mono-num text-zinc-300 cursor-pointer hover:border-amber-500 transition-all has-[:checked]:bg-amber-950/60 has-[:checked]:border-amber-400 has-[:checked]:text-amber-300">
                    <input type="radio" name="calcSource" value="brzycki" class="sr-only" />
                    <span>📐 Brzycki</span>
                  </label>
                  <label class="flex items-center justify-center p-2.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-mono-num text-zinc-300 cursor-pointer hover:border-amber-500 transition-all has-[:checked]:bg-amber-950/60 has-[:checked]:border-amber-400 has-[:checked]:text-amber-300">
                    <input type="radio" name="calcSource" value="direct" class="sr-only" />
                    <span>🎯 1RM Directo</span>
                  </label>
                </div>
              </div>

              <!-- Inputs Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block mb-1">
                    ${isBodyweightEx ? 'Carga Externa / Lastre (kg):' : 'Peso Levantado (kg):'}
                  </label>
                  <input
                    type="number"
                    id="input-mark-weight"
                    name="weightKg"
                    step="0.5"
                    min="0"
                    placeholder="ej: 80"
                    value="${latestRecord ? latestRecord.weightKg : ''}"
                    required
                    class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono-num text-base focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                </div>

                <div id="container-reps-input">
                  <label class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block mb-1">
                    Repeticiones Realizadas:
                  </label>
                  <input
                    type="number"
                    id="input-mark-reps"
                    name="reps"
                    step="1"
                    min="1"
                    max="15"
                    placeholder="ej: 5"
                    value="${latestRecord ? latestRecord.reps : 5}"
                    required
                    class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono-num text-base focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                </div>

                <div>
                  <label class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block mb-1">
                    Fecha de la Marca:
                  </label>
                  <input
                    type="date"
                    id="input-mark-date"
                    name="date"
                    value="${new Date().toISOString().split('T')[0]}"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono-num text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <!-- Live Calculation Banner -->
              <div id="live-calculator-preview" class="p-3.5 rounded-xl bg-black/60 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono-num text-xs">
                <div class="flex items-center gap-2 text-zinc-300">
                  <span class="text-amber-400 font-bold">⚡ CÁLCULO EN VIVO:</span>
                  <span>1RM Estimado: <strong id="preview-1rm" class="text-amber-400 text-sm font-bold">0.0 kg</strong></span>
                </div>
                <div class="text-zinc-400">
                  <span>TM (90%): <strong id="preview-tm" class="text-white font-bold">0.0 kg</strong></span>
                  <span class="mx-1.5">•</span>
                  <span>Fase 5 (85%): <strong id="preview-f5" class="text-emerald-400 font-bold">0.0 kg</strong></span>
                </div>
              </div>

              <!-- Notes Input -->
              <div>
                <label class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block mb-1">
                  Observaciones / Sensaciones (opcional):
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="ej: Sensación sólida, RPE 8.5 con cinto"
                  class="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono-num text-xs focus:outline-none focus:border-zinc-600 transition-all"
                />
              </div>

              <!-- Save Button -->
              <button
                type="submit"
                id="btn-save-strength-mark"
                class="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all active:scale-[0.99] cursor-pointer"
              >
                💾 GUARDAR MARCA Y RECALCULAR CARGAS
              </button>
            </form>
          </div>

          <!-- SECTION 4: Training Max & Rounding Config Accordion -->
          <details class="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 group">
            <summary class="flex items-center justify-between text-xs font-mono-num text-zinc-300 font-bold cursor-pointer select-none">
              <span class="flex items-center gap-2">
                ⚙️ AJUSTES DEL PERFIL DE FUERZA (TM % Y REDONDEO)
              </span>
              <span class="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>

            <div class="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block mb-1">
                  Porcentaje de Training Max (% del 1RM):
                </label>
                <div class="flex items-center gap-3">
                  <input
                    type="range"
                    id="slider-tm-percent"
                    min="70"
                    max="95"
                    step="1"
                    value="${Math.round(tmPercent * 100)}"
                    class="flex-1 accent-amber-500"
                  />
                  <span id="label-tm-percent" class="text-xs font-mono-num font-bold text-amber-400 bg-black/60 px-2 py-1 rounded border border-zinc-700 min-w-[50px] text-center">
                    ${Math.round(tmPercent * 100)}%
                  </span>
                </div>
                <p class="text-[10px] font-mono-num text-zinc-500 mt-1">
                  Recomendado: 90% (80% a 90% para programación segura).
                </p>
              </div>

              <div>
                <label class="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block mb-1">
                  Incremento Mínimo de Disco / Redondeo:
                </label>
                <select
                  id="select-rounding-kg"
                  class="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono-num text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="1.25" ${roundingKg === 1.25 ? 'selected' : ''}>1.25 kg (discos fraccionales)</option>
                  <option value="2.5" ${roundingKg === 2.5 ? 'selected' : ''}>2.5 kg (estándar olímpico de 1.25 por lado)</option>
                  <option value="5" ${roundingKg === 5 ? 'selected' : ''}>5.0 kg (discos grandes de 2.5 por lado)</option>
                </select>
                <p class="text-[10px] font-mono-num text-zinc-500 mt-1">
                  Ajusta los saltos de peso a los discos disponibles.
                </p>
              </div>
            </div>

            <div class="mt-4 flex justify-end">
              <button
                type="button"
                id="btn-save-exercise-settings"
                class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-mono-num font-bold border border-zinc-600 transition-all cursor-pointer"
              >
                Aplicar Ajustes
              </button>
            </div>
          </details>

          <!-- SECTION 5: Record History Log -->
          ${exProgress.records && exProgress.records.length > 0 ? `
            <div class="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
              <div class="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
                <span class="text-xs font-mono-num text-zinc-400 uppercase tracking-wider">
                  Historial de Marcas Registradas (${exProgress.records.length})
                </span>
              </div>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                ${[...exProgress.records].reverse().map(rec => `
                  <div class="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs font-mono-num">
                    <div class="flex items-center gap-3">
                      <span class="font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-900/60">
                        ${rec.weightKg} kg × ${rec.reps} reps
                      </span>
                      <span class="text-zinc-200">
                        1RM: <strong>${rec.estimatedOneRepMaxKg.toFixed(1)} kg</strong>
                      </span>
                      <span class="text-[10px] text-zinc-500">
                        (${rec.source})
                      </span>
                      ${rec.notes ? `<span class="text-zinc-400 italic text-[11px]">"${rec.notes}"</span>` : ''}
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-zinc-500 text-[10px]">${rec.date}</span>
                      <button
                        type="button"
                        data-delete-mark-id="${rec.id}"
                        class="text-zinc-600 hover:text-rose-400 p-1 transition-colors"
                        title="Eliminar marca"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

        </div>

      </div>
    </div>
  `;
}
