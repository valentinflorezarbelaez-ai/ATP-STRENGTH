"use client";

import { enqueueWalEntry } from "@/lib/walSync";
import { playChime } from "@/lib/zenAudio";
import {
  getWarmupRestConfig,
  resolvePhaseAfterNavigation,
  type Exercise,
  type ExerciseMaxData,
  type RoutineDay,
  type WarmupPhaseKey,
} from "@/lib/workoutStrategies";

type SetsMap = { [k: string]: number[] };
type WarmupMap = { [k: string]: string[] };

export interface WorkoutHandlerDeps {
  activeDay: RoutineDay;
  activeExercise: Exercise;
  activeExerciseIndex: number;
  activeExMax: ExerciseMaxData | null;
  activePhaseStep: string;
  completedSetsMap: SetsMap;
  completedWarmupMap: WarmupMap;
  currentSet: number;
  inputRpe: string;
  inputReps: string;
  inputWeight: string;
  selectedDayKey: string;
  setActiveExerciseIndex: (n: number) => void;
  setActivePhaseStep: (s: string) => void;
  setCompletedSetsMap: (m: SetsMap) => void;
  setCompletedWarmupMap: (m: WarmupMap) => void;
  setCurrentSet: (n: number) => void;
  setShowResetModal: (v: boolean) => void;
  setShowVictoryModal: (v: boolean) => void;
  setIsRunning: (v: boolean) => void;
  setRemainingSeconds: (n: number) => void;
  handleStartTimer: (duration: number, title?: string) => void;
  persistSessionProgress: (
    sets: SetsMap,
    warmup: WarmupMap,
    dayKey: string,
    exIdx: number,
    cSet: number,
    phaseStep: string
  ) => void;
  enqueueFlush: () => Promise<void>;
}

export function createWorkoutHandlers(d: WorkoutHandlerDeps) {
  const navigateExercise = (nextIdx: number) => {
    const ex = d.activeDay.exercises[nextIdx];
    const done = d.completedSetsMap[ex.name]?.length || 0;
    const nav = resolvePhaseAfterNavigation(done, ex.sets);
    d.setActiveExerciseIndex(nextIdx);
    d.setCurrentSet(nav.set);
    d.setActivePhaseStep(nav.phase);
    d.persistSessionProgress(
      d.completedSetsMap,
      d.completedWarmupMap,
      d.selectedDayKey,
      nextIdx,
      nav.set,
      nav.phase
    );
  };

  const handlePreviousExercise = () => {
    if (d.activeExerciseIndex > 0) navigateExercise(d.activeExerciseIndex - 1);
  };

  const handleNextExercise = () => {
    if (d.activeExerciseIndex < d.activeDay.exercises.length - 1) {
      navigateExercise(d.activeExerciseIndex + 1);
    }
  };

  const handleResetExercise = () => {
    const nextSets = { ...d.completedSetsMap, [d.activeExercise.name]: [] };
    const nextWarmup = { ...d.completedWarmupMap, [d.activeExercise.name]: [] };
    d.setCompletedSetsMap(nextSets);
    d.setCompletedWarmupMap(nextWarmup);
    d.setCurrentSet(1);
    d.setActivePhaseStep("F1");
    d.setShowResetModal(false);
    d.setIsRunning(false);
    d.setRemainingSeconds(d.activeExercise.restSeconds || 180);
    d.persistSessionProgress(
      nextSets,
      nextWarmup,
      d.selectedDayKey,
      d.activeExerciseIndex,
      1,
      "F1"
    );
  };

  const handleResetDay = () => {
    const nextSets = { ...d.completedSetsMap };
    const nextWarmup = { ...d.completedWarmupMap };
    d.activeDay.exercises.forEach((ex) => {
      nextSets[ex.name] = [];
      nextWarmup[ex.name] = [];
    });
    d.setCompletedSetsMap(nextSets);
    d.setCompletedWarmupMap(nextWarmup);
    d.setActiveExerciseIndex(0);
    d.setCurrentSet(1);
    d.setActivePhaseStep("F1");
    d.setShowResetModal(false);
    d.setIsRunning(false);
    d.setRemainingSeconds(d.activeDay.exercises[0]?.restSeconds || 180);
    d.persistSessionProgress(nextSets, nextWarmup, d.selectedDayKey, 0, 1, "F1");
  };

  const handleCompleteWarmupPhase = (phaseKey: WarmupPhaseKey) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }
    const currentList = d.completedWarmupMap[d.activeExercise.name] || [];
    const nextList = currentList.includes(phaseKey) ? currentList : [...currentList, phaseKey];
    const nextWarmupMap = { ...d.completedWarmupMap, [d.activeExercise.name]: nextList };
    d.setCompletedWarmupMap(nextWarmupMap);
    const phaseConfig = getWarmupRestConfig(phaseKey);
    d.handleStartTimer(
      phaseConfig.time,
      `Aclimatación ${phaseKey} Completada (${d.activeExercise.name})`
    );
    d.setActivePhaseStep(phaseConfig.next);
    d.persistSessionProgress(
      d.completedSetsMap,
      nextWarmupMap,
      d.selectedDayKey,
      d.activeExerciseIndex,
      d.currentSet,
      phaseConfig.next
    );
  };

  const handleCompleteSet = async (targetSet?: number) => {
    const setToFinish = targetSet !== undefined ? targetSet : d.currentSet;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }
    const currentList = d.completedSetsMap[d.activeExercise.name] || [];
    const nextList = currentList.includes(setToFinish) ? currentList : [...currentList, setToFinish];
    const nextSetsMap = { ...d.completedSetsMap, [d.activeExercise.name]: nextList };
    d.setCompletedSetsMap(nextSetsMap);

    const restTime = d.activeExercise.restSeconds || 180;
    d.handleStartTimer(restTime, `Descanso ATP: ${d.activeExercise.name}`);

    const numericWeight =
      parseFloat(d.inputWeight) || (d.activeExMax?.prescriptions.phase_5_work ?? 0);
    const numericReps =
      parseInt(d.inputReps, 10) || parseInt(d.activeExercise.reps, 10) || 3;

    let nextExIdx = d.activeExerciseIndex;
    let nextSet = d.currentSet;
    let nextStep = d.activePhaseStep;

    if (setToFinish < d.activeExercise.sets) {
      nextSet = setToFinish + 1;
      nextStep = String(setToFinish + 1);
      d.setCurrentSet(nextSet);
      d.setActivePhaseStep(nextStep);
    } else if (d.activeExerciseIndex < d.activeDay.exercises.length - 1) {
      nextExIdx = d.activeExerciseIndex + 1;
      nextSet = 1;
      nextStep = "F1";
      d.setActiveExerciseIndex(nextExIdx);
      d.setCurrentSet(nextSet);
      d.setActivePhaseStep(nextStep);
    } else {
      d.setShowVictoryModal(true);
      playChime(true);
    }

    d.persistSessionProgress(
      nextSetsMap,
      d.completedWarmupMap,
      d.selectedDayKey,
      nextExIdx,
      nextSet,
      nextStep
    );

    enqueueWalEntry("/api/state/log-set", {
      exercise_name: d.activeExercise.name,
      set_number: setToFinish,
      prescribed_reps: parseInt(d.activeExercise.reps, 10) || 3,
      completed_reps: numericReps,
      load_kg: numericWeight,
      rest_seconds: restTime,
      notes: `RPE ${d.inputRpe}`,
      completed: true,
    });
    void d.enqueueFlush();
  };

  return {
    handlePreviousExercise,
    handleNextExercise,
    handleResetExercise,
    handleResetDay,
    handleCompleteWarmupPhase,
    handleCompleteSet,
  };
}
