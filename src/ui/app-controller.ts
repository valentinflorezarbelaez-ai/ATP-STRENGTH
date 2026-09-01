import { AppState, DayId, ExerciseDefinition, ExerciseProgress, SetExecutionLog, StrengthRecord } from '../domain/types';
import { ELITE_SCHEDULE } from '../domain/schedule-data';
import { PreparationGuide } from '../domain/preparation-guide';
import { StorageRepository } from '../storage/storage-repository';
import {
  DEFAULT_ROUNDING_KG,
  DEFAULT_TRAINING_MAX_PERCENT,
  estimate1RM,
  generateAllPhasePrescriptions,
  calculateTrainingMax,
  roundLoad
} from '../domain/strength-engine';

import { renderHeader } from './components/header';
import { renderScheduleSelector } from './components/schedule-selector';
import { renderPreparationStepper } from './components/preparation-stepper';
import { renderExerciseExecutionCard } from './components/exercise-execution-card';
import { renderAtpTimerModal, playAtpCompletionChime } from './components/atp-timer-modal';
import { renderStrengthProgressModal } from './components/strength-progress-modal';
import { renderPreparationTimerModal } from './components/preparation-timer-modal';

export class AppController {
  private state: AppState;
  private rootElement: HTMLElement;
  
  // Preparation & Mobility timer
  private prepTimerInterval: number | null = null;
  private activePrepTimer: {
    phase: number;
    phaseName: string;
    description: string;
    totalSeconds: number;
    remainingSeconds: number;
    isPaused: boolean;
    isMinimized: boolean;
  } | null = null;
  
  // ATP timer
  private atpTimerInterval: number | null = null;

  // Strength / Progress Modal
  private isStrengthModalOpen: boolean = false;
  private modalSelectedExerciseId: string = 'sentadilla-trasera';

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.state = StorageRepository.loadState();
    this.initializeDefaultSelections();
    this.resumeTimersIfNeeded();
  }

  private initializeDefaultSelections(): void {
    const activeDay = ELITE_SCHEDULE.find(d => d.id === this.state.activeDayId) || ELITE_SCHEDULE[0];
    if (activeDay.exercises.length > 0) {
      if (!this.state.activeExerciseId || !activeDay.exercises.some(e => e.id === this.state.activeExerciseId)) {
        this.state.activeExerciseId = activeDay.exercises[0].id;
      }
    } else {
      this.state.activeExerciseId = null;
    }

    if (this.state.activeExerciseId) {
      this.modalSelectedExerciseId = this.state.activeExerciseId;
    }
  }

  private resumeTimersIfNeeded(): void {
    if (this.state.activeAtpTimer && this.state.activeAtpTimer.isRunning) {
      const elapsed = Math.floor((Date.now() - this.state.activeAtpTimer.startedAt) / 1000);
      const remaining = Math.max(0, this.state.activeAtpTimer.durationSeconds - elapsed);
      if (remaining > 0) {
        this.state.activeAtpTimer.remainingSeconds = remaining;
        this.startAtpCountdown();
      } else {
        this.state.activeAtpTimer = null;
        StorageRepository.saveState(this.state);
      }
    }
  }

  public init(): void {
    this.render();
  }

  /**
   * Returns a deduplicated list of all exercises across all training days
   */
  private getAllExercises(): ExerciseDefinition[] {
    const map = new Map<string, ExerciseDefinition>();
    for (const day of ELITE_SCHEDULE) {
      for (const ex of day.exercises) {
        if (!map.has(ex.id)) {
          map.set(ex.id, ex);
        }
      }
    }
    return Array.from(map.values());
  }

  private render(): void {
    const activeDay = ELITE_SCHEDULE.find(d => d.id === this.state.activeDayId) || ELITE_SCHEDULE[0];
    const isRest = activeDay.isRestDay;

    let contentHtml = '';

    if (isRest) {
      contentHtml = `
        <div class="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950 border-2 border-rose-900/60 rounded-2xl text-center my-6 shadow-[0_0_50px_rgba(244,63,94,0.15)]">
          <div class="w-20 h-20 rounded-full bg-rose-950/40 border border-rose-600 flex items-center justify-center text-3xl mb-4 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            🛑
          </div>
          <span class="text-xs font-mono-num font-bold text-rose-400 uppercase tracking-widest px-3 py-1 bg-rose-950/80 rounded-md border border-rose-800 mb-3">
            DESCANSO ABSOLUTO NEUROMUSCULAR
          </span>
          <h2 class="text-xl sm:text-2xl font-display font-bold text-white uppercase max-w-lg mb-2">
            ${activeDay.title}
          </h2>
          <p class="text-sm text-zinc-400 max-w-md font-mono-num mb-6">
            ${activeDay.restMessage || 'Acceso al entrenamiento bloqueado por el protocolo de regeneración axonal.'}
          </p>
          <div class="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl text-left max-w-md text-xs text-zinc-300 space-y-2 font-mono-num">
            <div class="text-amber-400 font-bold">⚡ ESTADO DEL SISTEMA NERVIOSO CENTRAL:</div>
            <div>• Resíntesis sináptica de Acetilcolina: En progreso (48h requeridas).</div>
            <div>• Reducción de inflamación neural profunda: Activa.</div>
            <div>• Reclutamiento de unidades motoras para la próxima sesión: 100% preservado.</div>
          </div>
        </div>
      `;
    } else {
      // Training Day Layout
      const currentExercise = activeDay.exercises.find(e => e.id === this.state.activeExerciseId) || activeDay.exercises[0];
      const progress = this.state.exerciseStates[currentExercise.id] || {
        exerciseId: currentExercise.id,
        completedSetsCount: 0,
        history: [],
        lastUpdated: Date.now()
      };

      const exProgress: ExerciseProgress = this.state.progress[currentExercise.id] || {
        exerciseId: currentExercise.id,
        trainingMaxPercent: DEFAULT_TRAINING_MAX_PERCENT,
        roundingKg: DEFAULT_ROUNDING_KG,
        records: [],
        updatedAt: Date.now()
      };

      const isBodyweight = currentExercise.id.includes('fondos') || currentExercise.id.includes('dominadas');
      const prescriptions = generateAllPhasePrescriptions(
        exProgress.currentOneRepMaxKg,
        exProgress.trainingMaxPercent,
        exProgress.roundingKg,
        exProgress.customPhasePercentages,
        isBodyweight,
        this.state.userBodyweightKg
      );

      const completedPhases = this.state.completedPrepPhases[currentExercise.id] || [];
      const prepSteps = PreparationGuide.generatePhases(completedPhases, prescriptions);

      contentHtml = `
        <!-- Exercise Tabs for the Active Day -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          ${activeDay.exercises.map(ex => {
            const isSelected = ex.id === currentExercise.id;
            const exProgressState = this.state.exerciseStates[ex.id];
            const isCompleted = exProgressState && exProgressState.completedSetsCount >= ex.targetSets;
            const has1RM = (this.state.progress[ex.id]?.currentOneRepMaxKg || 0) > 0;

            return `
              <button
                data-exercise-id="${ex.id}"
                class="exercise-tab-btn flex-shrink-0 px-3.5 py-2.5 rounded-xl border text-xs font-mono-num font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected 
                    ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                    : isCompleted 
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }"
              >
                <span>${ex.name}</span>
                ${has1RM ? '<span class="text-[9px] font-bold text-amber-300 bg-black/40 px-1 rounded">1RM</span>' : ''}
                ${isCompleted ? '<span class="text-[10px] font-bold">✓</span>' : `<span class="text-[10px] opacity-70">(${ex.targetSets}x)</span>`}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Section 1: Preparation Stepper (Fases 0 a 4) -->
        ${renderPreparationStepper(prepSteps, this.activePrepTimer)}

        <!-- Section 2: Exercise Execution Card (Fase 5: Series de Fuerza Real) -->
        ${renderExerciseExecutionCard(currentExercise, progress, exProgress, prescriptions[5])}
      `;
    }

    // Modal overlay if ATP timer is active
    let atpModalHtml = '';
    if (this.state.activeAtpTimer && this.state.activeAtpTimer.isRunning) {
      atpModalHtml = renderAtpTimerModal(
        this.state.activeAtpTimer.exerciseName,
        this.state.activeAtpTimer.durationSeconds,
        this.state.activeAtpTimer.remainingSeconds
      );
    }

    // Modal overlay if Preparation / Mobility timer is active and not minimized
    let prepTimerModalHtml = '';
    if (this.activePrepTimer && !this.activePrepTimer.isMinimized) {
      const activeDay = ELITE_SCHEDULE.find(d => d.id === this.state.activeDayId);
      const currentExercise = activeDay?.exercises.find(e => e.id === this.state.activeExerciseId) || activeDay?.exercises[0];
      prepTimerModalHtml = renderPreparationTimerModal(
        this.activePrepTimer.phase,
        this.activePrepTimer.phaseName,
        currentExercise?.name || 'EJERCICIO ACTIVO',
        this.activePrepTimer.description,
        this.activePrepTimer.totalSeconds,
        this.activePrepTimer.remainingSeconds,
        this.activePrepTimer.isPaused
      );
    }

    // Modal overlay if Strength Progress Modal is active
    let strengthModalHtml = '';
    if (this.isStrengthModalOpen) {
      const allExercises = this.getAllExercises();
      strengthModalHtml = renderStrengthProgressModal(
        allExercises,
        this.modalSelectedExerciseId,
        this.state.progress,
        this.state.userBodyweightKg
      );
    }

    this.rootElement.innerHTML = `
      ${renderHeader(activeDay.title, isRest)}
      ${renderScheduleSelector(this.state.activeDayId)}
      ${contentHtml}
      ${atpModalHtml}
      ${prepTimerModalHtml}
      ${strengthModalHtml}
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // 1. Day Selector Buttons
    this.rootElement.querySelectorAll('.day-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dayId = (e.currentTarget as HTMLElement).getAttribute('data-day-id') as DayId;
        if (dayId) {
          this.switchDay(dayId);
        }
      });
    });

    // 2. Exercise Selector Buttons
    this.rootElement.querySelectorAll('.exercise-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const exId = (e.currentTarget as HTMLElement).getAttribute('data-exercise-id');
        if (exId) {
          this.switchExercise(exId);
        }
      });
    });

    // 3. Preparation Stepper Actions
    this.rootElement.querySelectorAll('[data-start-prep-step]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const phase = parseInt((e.currentTarget as HTMLElement).getAttribute('data-start-prep-step') || '0', 10);
        this.startPreparationPhase(phase);
      });
    });

    this.rootElement.querySelectorAll('[data-complete-prep-step]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const phase = parseInt((e.currentTarget as HTMLElement).getAttribute('data-complete-prep-step') || '0', 10);
        this.completePreparationPhase(phase);
      });
    });

    this.rootElement.querySelectorAll('[data-skip-prep-timer]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const phase = parseInt((e.currentTarget as HTMLElement).getAttribute('data-skip-prep-timer') || '0', 10);
        this.fastForwardPrepTimer(phase, 15);
      });
    });

    // Preparation Timer Modal Controls
    const prepSkipBtn = this.rootElement.querySelector('#btn-prep-modal-skip-15s');
    if (prepSkipBtn && this.activePrepTimer) {
      prepSkipBtn.addEventListener('click', () => {
        if (this.activePrepTimer) {
          this.fastForwardPrepTimer(this.activePrepTimer.phase, 15);
        }
      });
    }

    const prepPauseBtn = this.rootElement.querySelector('#btn-prep-modal-toggle-pause');
    if (prepPauseBtn && this.activePrepTimer) {
      prepPauseBtn.addEventListener('click', () => {
        if (this.activePrepTimer) {
          this.activePrepTimer.isPaused = !this.activePrepTimer.isPaused;
          this.render();
        }
      });
    }

    const prepCompleteBtn = this.rootElement.querySelector('#btn-prep-modal-complete');
    if (prepCompleteBtn && this.activePrepTimer) {
      prepCompleteBtn.addEventListener('click', () => {
        if (this.activePrepTimer) {
          this.completePreparationPhase(this.activePrepTimer.phase);
        }
      });
    }

    const prepMinimizeBtn = this.rootElement.querySelector('#btn-prep-modal-minimize');
    if (prepMinimizeBtn && this.activePrepTimer) {
      prepMinimizeBtn.addEventListener('click', () => {
        if (this.activePrepTimer) {
          this.activePrepTimer.isMinimized = true;
          this.render();
        }
      });
    }

    // 4. Complete Set Button
    const completeSetBtn = this.rootElement.querySelector('#btn-complete-set');
    if (completeSetBtn) {
      completeSetBtn.addEventListener('click', () => {
        this.completeCurrentWorkSet();
      });
    }

    // 5. Open Strength Modal Triggers
    const openStrengthBtn = this.rootElement.querySelector('#btn-open-strength-modal');
    if (openStrengthBtn) {
      openStrengthBtn.addEventListener('click', () => {
        if (this.state.activeExerciseId) {
          this.modalSelectedExerciseId = this.state.activeExerciseId;
        }
        this.isStrengthModalOpen = true;
        this.render();
      });
    }

    this.rootElement.querySelectorAll('[data-action="open-strength-modal"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const exId = (e.currentTarget as HTMLElement).getAttribute('data-exercise-id');
        if (exId) {
          this.modalSelectedExerciseId = exId;
        }
        this.isStrengthModalOpen = true;
        this.render();
      });
    });

    // 6. Strength Progress Modal Internal Event Listeners
    if (this.isStrengthModalOpen) {
      this.attachStrengthModalListeners();
    }

    // 7. ATP Timer Modal Controls
    const atpSkipBtn = this.rootElement.querySelector('#btn-atp-skip-30s');
    const atpFinishBtn = this.rootElement.querySelector('#btn-atp-force-finish');

    if (atpSkipBtn) {
      atpSkipBtn.addEventListener('click', () => {
        if (this.state.activeAtpTimer) {
          this.state.activeAtpTimer.remainingSeconds = Math.max(0, this.state.activeAtpTimer.remainingSeconds - 30);
          if (this.state.activeAtpTimer.remainingSeconds === 0) {
            this.finishAtpTimer(true);
          } else {
            this.render();
          }
        }
      });
    }

    if (atpFinishBtn) {
      atpFinishBtn.addEventListener('click', () => {
        this.finishAtpTimer(true);
      });
    }

    // 8. Header Actions (Reset & Export)
    const exportBtn = this.rootElement.querySelector('#btn-export-data');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const json = StorageRepository.exportJSON(this.state);
        navigator.clipboard.writeText(json).then(() => {
          alert('¡Sesión exportada al portapapeles en formato JSON con marcas y cargas objetivo!');
        }).catch(() => {
          prompt('Copia tu sesión JSON:', json);
        });
      });
    }

    const resetBtn = this.rootElement.querySelector('#btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('¿Confirmas el reinicio de la sesión de entrenamiento actual? (Tus marcas de 1RM se conservarán).')) {
          const fresh = StorageRepository.resetState();
          // Retain existing progress records across simple reset
          fresh.progress = this.state.progress;
          this.state = fresh;
          StorageRepository.saveState(this.state);
          this.initializeDefaultSelections();
          this.render();
        }
      });
    }
  }

  private attachStrengthModalListeners(): void {
    // Close Modal Button
    const closeBtn = this.rootElement.querySelector('#btn-close-strength-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.isStrengthModalOpen = false;
        this.render();
      });
    }

    // Backdrop Click to close
    const backdrop = this.rootElement.querySelector('#strength-modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.isStrengthModalOpen = false;
          this.render();
        }
      });
    }

    // Switch Exercise inside Modal
    this.rootElement.querySelectorAll('[data-modal-select-exercise]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const exId = (e.currentTarget as HTMLElement).getAttribute('data-modal-select-exercise');
        if (exId) {
          this.modalSelectedExerciseId = exId;
          this.render();
        }
      });
    });

    // Dynamic Live Preview in Form
    const weightInput = this.rootElement.querySelector('#input-mark-weight') as HTMLInputElement | null;
    const repsInput = this.rootElement.querySelector('#input-mark-reps') as HTMLInputElement | null;
    const calcSourceRadios = this.rootElement.querySelectorAll('input[name="calcSource"]');
    const preview1RM = this.rootElement.querySelector('#preview-1rm');
    const previewTM = this.rootElement.querySelector('#preview-tm');
    const previewF5 = this.rootElement.querySelector('#preview-f5');

    const updateLivePreview = () => {
      if (!weightInput || !repsInput || !preview1RM || !previewTM || !previewF5) return;
      const weightKg = parseFloat(weightInput.value);
      const reps = parseInt(repsInput.value, 10);
      let selectedSource: 'direct' | 'epley' | 'brzycki' = 'epley';

      calcSourceRadios.forEach(radio => {
        if ((radio as HTMLInputElement).checked) {
          selectedSource = (radio as HTMLInputElement).value as any;
        }
      });

      const currentProgress = this.state.progress[this.modalSelectedExerciseId] || {
        exerciseId: this.modalSelectedExerciseId,
        trainingMaxPercent: DEFAULT_TRAINING_MAX_PERCENT,
        roundingKg: DEFAULT_ROUNDING_KG,
        records: [],
        updatedAt: Date.now()
      };

      if (!isNaN(weightKg) && weightKg > 0 && !isNaN(reps) && reps >= 1 && reps <= 15) {
        try {
          const rm = estimate1RM(weightKg, reps, selectedSource);
          const tm = calculateTrainingMax(rm, currentProgress.trainingMaxPercent);
          const f5 = roundLoad(tm * 0.85, currentProgress.roundingKg);

          preview1RM.textContent = `${rm.toFixed(1)} kg`;
          previewTM.textContent = `${tm.toFixed(1)} kg`;
          previewF5.textContent = `${f5.toFixed(1)} kg`;
        } catch {
          preview1RM.textContent = '—';
          previewTM.textContent = '—';
          previewF5.textContent = '—';
        }
      } else {
        preview1RM.textContent = '0.0 kg';
        previewTM.textContent = '0.0 kg';
        previewF5.textContent = '0.0 kg';
      }
    };

    if (weightInput) weightInput.addEventListener('input', updateLivePreview);
    if (repsInput) repsInput.addEventListener('input', updateLivePreview);
    calcSourceRadios.forEach(r => r.addEventListener('change', updateLivePreview));
    updateLivePreview();

    // Form Submit: Register Strength Mark
    const form = this.rootElement.querySelector('#form-register-strength-mark') as HTMLFormElement | null;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const exerciseId = formData.get('exerciseId') as string;
        const weightKg = parseFloat(formData.get('weightKg') as string);
        const reps = parseInt(formData.get('reps') as string, 10);
        const calcSource = (formData.get('calcSource') as 'direct' | 'epley' | 'brzycki') || 'epley';
        const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0];
        const notes = (formData.get('notes') as string) || undefined;

        if (isNaN(weightKg) || weightKg <= 0 || isNaN(reps) || reps < 1 || reps > 15) {
          alert('Por favor introduce un peso válido mayor a 0 y repeticiones entre 1 y 15.');
          return;
        }

        const oneRepMax = estimate1RM(weightKg, reps, calcSource);

        if (!this.state.progress[exerciseId]) {
          this.state.progress[exerciseId] = {
            exerciseId,
            trainingMaxPercent: DEFAULT_TRAINING_MAX_PERCENT,
            roundingKg: DEFAULT_ROUNDING_KG,
            records: [],
            updatedAt: Date.now()
          };
        }

        const newRecord: StrengthRecord = {
          id: `mark-${Date.now()}`,
          exerciseId,
          date,
          timestamp: Date.now(),
          weightKg,
          reps,
          estimatedOneRepMaxKg: oneRepMax,
          source: calcSource,
          notes
        };

        this.state.progress[exerciseId].records.push(newRecord);
        this.state.progress[exerciseId].currentOneRepMaxKg = oneRepMax;
        this.state.progress[exerciseId].updatedAt = Date.now();

        StorageRepository.saveState(this.state);
        this.render();
      });
    }

    // TM % Slider & Rounding Settings
    const tmSlider = this.rootElement.querySelector('#slider-tm-percent') as HTMLInputElement | null;
    const tmLabel = this.rootElement.querySelector('#label-tm-percent');
    if (tmSlider && tmLabel) {
      tmSlider.addEventListener('input', () => {
        tmLabel.textContent = `${tmSlider.value}%`;
      });
    }

    const saveSettingsBtn = this.rootElement.querySelector('#btn-save-exercise-settings');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        const roundingSelect = this.rootElement.querySelector('#select-rounding-kg') as HTMLSelectElement | null;
        const tmPct = tmSlider ? parseInt(tmSlider.value, 10) / 100 : DEFAULT_TRAINING_MAX_PERCENT;
        const roundKg = roundingSelect ? parseFloat(roundingSelect.value) : DEFAULT_ROUNDING_KG;

        if (!this.state.progress[this.modalSelectedExerciseId]) {
          this.state.progress[this.modalSelectedExerciseId] = {
            exerciseId: this.modalSelectedExerciseId,
            trainingMaxPercent: tmPct,
            roundingKg: roundKg,
            records: [],
            updatedAt: Date.now()
          };
        } else {
          this.state.progress[this.modalSelectedExerciseId].trainingMaxPercent = tmPct;
          this.state.progress[this.modalSelectedExerciseId].roundingKg = roundKg;
          this.state.progress[this.modalSelectedExerciseId].updatedAt = Date.now();
        }

        StorageRepository.saveState(this.state);
        this.render();
      });
    }

    // Delete Mark
    this.rootElement.querySelectorAll('[data-delete-mark-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const markId = (e.currentTarget as HTMLElement).getAttribute('data-delete-mark-id');
        if (!markId) return;

        if (confirm('¿Deseas eliminar este registro de marca?')) {
          const exProg = this.state.progress[this.modalSelectedExerciseId];
          if (exProg) {
            exProg.records = exProg.records.filter(r => r.id !== markId);
            if (exProg.records.length > 0) {
              exProg.currentOneRepMaxKg = exProg.records[exProg.records.length - 1].estimatedOneRepMaxKg;
            } else {
              exProg.currentOneRepMaxKg = undefined;
            }
            exProg.updatedAt = Date.now();
            StorageRepository.saveState(this.state);
            this.render();
          }
        }
      });
    });
  }

  private switchDay(dayId: DayId): void {
    this.state.activeDayId = dayId;
    this.initializeDefaultSelections();
    StorageRepository.saveState(this.state);
    this.render();
  }

  private switchExercise(exerciseId: string): void {
    this.state.activeExerciseId = exerciseId;
    this.modalSelectedExerciseId = exerciseId;
    StorageRepository.saveState(this.state);
    this.render();
  }

  private startPreparationPhase(phase: number): void {
    const activeDay = ELITE_SCHEDULE.find(d => d.id === this.state.activeDayId);
    const currentExercise = activeDay?.exercises.find(e => e.id === this.state.activeExerciseId);
    if (!currentExercise) return;

    const steps = PreparationGuide.generatePhases();
    const step = steps.find(s => s.phase === phase);
    if (!step) return;

    if (step.restSeconds === 0) {
      this.completePreparationPhase(phase);
      return;
    }

    this.activePrepTimer = {
      phase,
      phaseName: step.name,
      description: step.description,
      totalSeconds: step.restSeconds,
      remainingSeconds: step.restSeconds,
      isPaused: false,
      isMinimized: false
    };

    if (this.prepTimerInterval) {
      clearInterval(this.prepTimerInterval);
    }

    this.prepTimerInterval = window.setInterval(() => {
      if (this.activePrepTimer && !this.activePrepTimer.isPaused) {
        this.activePrepTimer.remainingSeconds -= 1;
        if (this.activePrepTimer.remainingSeconds <= 0) {
          if (this.prepTimerInterval) clearInterval(this.prepTimerInterval);
          playAtpCompletionChime();
          this.completePreparationPhase(phase);
        } else {
          // Update digital clock and SVG ring in DOM if modal is open
          const digitsEl = this.rootElement.querySelector('#prep-clock-digits');
          if (digitsEl) {
            const min = Math.floor(this.activePrepTimer.remainingSeconds / 60);
            const sec = this.activePrepTimer.remainingSeconds % 60;
            digitsEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
          }

          const ringEl = this.rootElement.querySelector('#prep-svg-progress-ring') as SVGCircleElement | null;
          if (ringEl && this.activePrepTimer) {
            const total = this.activePrepTimer.totalSeconds;
            const rem = this.activePrepTimer.remainingSeconds;
            const circumference = 282.74;
            const progress = total > 0 ? (total - rem) / total : 0;
            const offset = circumference - (circumference * progress);
            ringEl.style.strokeDashoffset = `${offset}`;
          }

          // If minimized, re-render to update the row's seconds text
          if (this.activePrepTimer.isMinimized) {
            this.render();
          }
        }
      }
    }, 1000);

    this.render();
  }

  private fastForwardPrepTimer(phase: number, seconds: number): void {
    if (this.activePrepTimer && this.activePrepTimer.phase === phase) {
      this.activePrepTimer.remainingSeconds = Math.max(0, this.activePrepTimer.remainingSeconds - seconds);
      if (this.activePrepTimer.remainingSeconds <= 0) {
        if (this.prepTimerInterval) clearInterval(this.prepTimerInterval);
        playAtpCompletionChime();
        this.completePreparationPhase(phase);
      } else {
        this.render();
      }
    }
  }

  private completePreparationPhase(phase: number): void {
    const currentExId = this.state.activeExerciseId;
    if (!currentExId) return;

    if (!this.state.completedPrepPhases[currentExId]) {
      this.state.completedPrepPhases[currentExId] = [];
    }

    if (!this.state.completedPrepPhases[currentExId].includes(phase)) {
      this.state.completedPrepPhases[currentExId].push(phase);
    }

    this.activePrepTimer = null;
    if (this.prepTimerInterval) {
      clearInterval(this.prepTimerInterval);
      this.prepTimerInterval = null;
    }

    StorageRepository.saveState(this.state);
    this.render();
  }

  private completeCurrentWorkSet(): void {
    const activeDay = ELITE_SCHEDULE.find(d => d.id === this.state.activeDayId);
    const currentExercise = activeDay?.exercises.find(e => e.id === this.state.activeExerciseId);
    if (!currentExercise) return;

    const progress = this.state.exerciseStates[currentExercise.id];
    const exProgress = this.state.progress[currentExercise.id];
    const isBodyweight = currentExercise.id.includes('fondos') || currentExercise.id.includes('dominadas');
    const prescriptions = generateAllPhasePrescriptions(
      exProgress?.currentOneRepMaxKg,
      exProgress?.trainingMaxPercent,
      exProgress?.roundingKg,
      exProgress?.customPhasePercentages,
      isBodyweight,
      this.state.userBodyweightKg
    );
    const targetF5 = prescriptions[5];

    // Read actual execution inputs from DOM
    const actualWeightInput = this.rootElement.querySelector('#input-set-actual-weight') as HTMLInputElement | null;
    const actualRepsInput = this.rootElement.querySelector('#input-set-actual-reps') as HTMLInputElement | null;
    const actualRpeSelect = this.rootElement.querySelector('#select-set-actual-rpe') as HTMLSelectElement | null;

    const actualWeightKg = actualWeightInput && actualWeightInput.value !== '' ? parseFloat(actualWeightInput.value) : (targetF5.targetWeightKg > 0 ? targetF5.targetWeightKg : undefined);
    const defaultReps = parseInt(currentExercise.targetRepsText.match(/\d+/)?.[0] || '3', 10);
    const actualReps = actualRepsInput && actualRepsInput.value !== '' ? parseInt(actualRepsInput.value, 10) : defaultReps;
    const rpe = actualRpeSelect && actualRpeSelect.value !== '' ? parseFloat(actualRpeSelect.value) : undefined;

    const newLog: SetExecutionLog = {
      id: `${currentExercise.id}-${Date.now()}`,
      exerciseId: currentExercise.id,
      dayId: this.state.activeDayId,
      setIndex: progress.completedSetsCount + 1,
      targetRepsText: currentExercise.targetRepsText,
      targetWeightKg: targetF5.targetWeightKg > 0 ? targetF5.targetWeightKg : undefined,
      actualWeightKg,
      actualReps,
      rpe,
      timestamp: Date.now()
    };

    progress.history.push(newLog);
    progress.completedSetsCount += 1;
    progress.lastUpdated = Date.now();

    // Trigger Mandatory Phosphocreatine (ATP) Timer Lock
    const restSeconds = currentExercise.defaultRestSeconds;
    this.state.activeAtpTimer = {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      durationSeconds: restSeconds,
      remainingSeconds: restSeconds,
      isRunning: true,
      startedAt: Date.now()
    };

    StorageRepository.saveState(this.state);
    this.startAtpCountdown();
    this.render();
  }

  private startAtpCountdown(): void {
    if (this.atpTimerInterval) {
      clearInterval(this.atpTimerInterval);
    }

    this.atpTimerInterval = window.setInterval(() => {
      if (this.state.activeAtpTimer && this.state.activeAtpTimer.isRunning) {
        this.state.activeAtpTimer.remainingSeconds -= 1;
        if (this.state.activeAtpTimer.remainingSeconds <= 0) {
          this.finishAtpTimer(true);
        } else {
          // Update digital clock and SVG ring in DOM
          const digitsEl = this.rootElement.querySelector('#atp-clock-digits');
          if (digitsEl) {
            const min = Math.floor(this.state.activeAtpTimer.remainingSeconds / 60);
            const sec = this.state.activeAtpTimer.remainingSeconds % 60;
            digitsEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
          }

          const ringEl = this.rootElement.querySelector('#atp-svg-progress-ring') as SVGCircleElement | null;
          if (ringEl && this.state.activeAtpTimer) {
            const total = this.state.activeAtpTimer.durationSeconds;
            const rem = this.state.activeAtpTimer.remainingSeconds;
            const circumference = 282.74;
            const progress = (total - rem) / total;
            const offset = circumference - (circumference * progress);
            ringEl.style.strokeDashoffset = `${offset}`;
          }
        }
      }
    }, 1000);
  }

  private finishAtpTimer(playChime = false): void {
    if (playChime) {
      playAtpCompletionChime();
    }
    if (this.atpTimerInterval) {
      clearInterval(this.atpTimerInterval);
      this.atpTimerInterval = null;
    }
    this.state.activeAtpTimer = null;
    StorageRepository.saveState(this.state);
    this.render();
  }
}
