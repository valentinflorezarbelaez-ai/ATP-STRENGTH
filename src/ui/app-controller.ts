import { AppState, DayId, SetExecutionLog } from '../domain/types';
import { ELITE_SCHEDULE } from '../domain/schedule-data';
import { PreparationGuide } from '../domain/preparation-guide';
import { StorageRepository } from '../storage/storage-repository';

import { renderHeader } from './components/header';
import { renderScheduleSelector } from './components/schedule-selector';
import { renderPreparationStepper } from './components/preparation-stepper';
import { renderExerciseExecutionCard } from './components/exercise-execution-card';
import { renderAtpTimerModal, playAtpCompletionChime } from './components/atp-timer-modal';

export class AppController {
  private state: AppState;
  private rootElement: HTMLElement;
  
  // Preparation timer
  private prepTimerInterval: number | null = null;
  private activePrepTimer: { phase: number; remainingSeconds: number } | null = null;
  
  // ATP timer
  private atpTimerInterval: number | null = null;

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

      const completedPhases = this.state.completedPrepPhases[currentExercise.id] || [];
      const prepSteps = PreparationGuide.generatePhases(completedPhases);

      contentHtml = `
        <!-- Exercise Tabs for the Active Day -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          ${activeDay.exercises.map(ex => {
            const isSelected = ex.id === currentExercise.id;
            const exProgress = this.state.exerciseStates[ex.id];
            const isCompleted = exProgress && exProgress.completedSetsCount >= ex.targetSets;

            return `
              <button
                data-exercise-id="${ex.id}"
                class="exercise-tab-btn flex-shrink-0 px-3.5 py-2.5 rounded-xl border text-xs font-mono-num font-semibold transition-all flex items-center gap-2 ${
                  isSelected 
                    ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                    : isCompleted 
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }"
              >
                <span>${ex.name}</span>
                ${isCompleted ? '<span class="text-[10px] font-bold">✓</span>' : `<span class="text-[10px] opacity-70">(${ex.targetSets}x)</span>`}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Section 1: Preparation Stepper (Fases 0 a 4) -->
        ${renderPreparationStepper(prepSteps, this.activePrepTimer)}

        <!-- Section 2: Exercise Execution Card (Fase 5: Series de Fuerza Real) -->
        ${renderExerciseExecutionCard(currentExercise, progress)}
      `;
    }

    // Modal overlay if ATP timer is active
    let modalHtml = '';
    if (this.state.activeAtpTimer && this.state.activeAtpTimer.isRunning) {
      modalHtml = renderAtpTimerModal(
        this.state.activeAtpTimer.exerciseName,
        this.state.activeAtpTimer.durationSeconds,
        this.state.activeAtpTimer.remainingSeconds
      );
    }

    this.rootElement.innerHTML = `
      ${renderHeader(activeDay.title, isRest)}
      ${renderScheduleSelector(this.state.activeDayId)}
      ${contentHtml}
      ${modalHtml}
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

    // 4. Complete Set Button
    const completeSetBtn = this.rootElement.querySelector('#btn-complete-set');
    if (completeSetBtn) {
      completeSetBtn.addEventListener('click', () => {
        this.completeCurrentWorkSet();
      });
    }

    // 5. ATP Timer Modal Controls
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

    // 6. Header Actions (Reset & Export)
    const exportBtn = this.rootElement.querySelector('#btn-export-data');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const json = StorageRepository.exportJSON(this.state);
        navigator.clipboard.writeText(json).then(() => {
          alert('¡Sesión exportada al portapapeles en formato JSON!');
        }).catch(() => {
          prompt('Copia tu sesión JSON:', json);
        });
      });
    }

    const resetBtn = this.rootElement.querySelector('#btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('¿Confirmas el reinicio de la sesión de entrenamiento?')) {
          this.state = StorageRepository.resetState();
          this.initializeDefaultSelections();
          this.render();
        }
      });
    }
  }

  private switchDay(dayId: DayId): void {
    this.state.activeDayId = dayId;
    this.initializeDefaultSelections();
    StorageRepository.saveState(this.state);
    this.render();
  }

  private switchExercise(exerciseId: string): void {
    this.state.activeExerciseId = exerciseId;
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
      remainingSeconds: step.restSeconds
    };

    if (this.prepTimerInterval) {
      clearInterval(this.prepTimerInterval);
    }

    this.prepTimerInterval = window.setInterval(() => {
      if (this.activePrepTimer) {
        this.activePrepTimer.remainingSeconds -= 1;
        if (this.activePrepTimer.remainingSeconds <= 0) {
          if (this.prepTimerInterval) clearInterval(this.prepTimerInterval);
          this.completePreparationPhase(phase);
        } else {
          this.render();
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
    const newLog: SetExecutionLog = {
      id: `${currentExercise.id}-${Date.now()}`,
      exerciseId: currentExercise.id,
      dayId: this.state.activeDayId,
      setIndex: progress.completedSetsCount + 1,
      targetRepsText: currentExercise.targetRepsText,
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
