"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { enqueueWalEntry } from "@/lib/walSync";
import { useAtpTimer } from "@/app/hooks/useAtpTimer";
import { useBackendWal } from "@/app/hooks/useBackendWal";
import { createWorkoutHandlers } from "@/app/hooks/createWorkoutHandlers";
import {
  SCHEDULE_DAYS,
  ALL_TRACKABLE_EXERCISES,
  computeMetrics,
  getSavedSession,
  getInitialMaxes,
  previewLiveMax,
  calculateSessionStats,
  formatTime,
  writeSessionProgress,
  writeMaxesMap,
  type ExerciseMaxData,
  type HistoryItem,
} from "@/lib/workoutStrategies";
import { playChime } from "@/lib/zenAudio";

export function useZenDashboard() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const timer = useAtpTimer(180);
  const wal = useBackendWal(apiUrl);

  const [selectedDayKey, setSelectedDayKey] = useState(
    () => getSavedSession()?.selectedDayKey || "DAY_A"
  );
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(() => {
    const idx = getSavedSession()?.activeExerciseIndex;
    return typeof idx === "number" ? idx : 0;
  });
  const [currentSet, setCurrentSet] = useState(() => {
    const s = getSavedSession()?.currentSet;
    return typeof s === "number" ? s : 1;
  });
  const [activePhaseStep, setActivePhaseStep] = useState(
    () => getSavedSession()?.activePhaseStep || "F1"
  );
  const [completedSetsMap, setCompletedSetsMap] = useState<{ [k: string]: number[] }>(
    () => getSavedSession()?.completedSetsMap || {}
  );
  const [completedWarmupMap, setCompletedWarmupMap] = useState<{ [k: string]: string[] }>(
    () => getSavedSession()?.completedWarmupMap || {}
  );

  const [zenFocusMode, setZenFocusMode] = useState(false);
  const [showPrepProtocol, setShowPrepProtocol] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [maxesMap, setMaxesMap] = useState<{ [key: string]: ExerciseMaxData }>(getInitialMaxes);
  const [selectedProgressEx, setSelectedProgressEx] = useState("Sentadilla Trasera");
  const [inputOverrides, setInputOverrides] = useState<{
    [name: string]: { weight?: string; reps?: string; quickWeight?: string; quickReps?: string };
  }>({});
  const [inputRpe, setInputRpe] = useState("8.5");
  const [showQuickCalibration, setShowQuickCalibration] = useState(false);
  const [formFormula, setFormFormula] = useState("epley");
  const [formWeight, setFormWeight] = useState("100");
  const [formReps, setFormReps] = useState("5");
  const [formNotes, setFormNotes] = useState("");
  const [isSavingMax, setIsSavingMax] = useState(false);
  const [exerciseHistory, setExerciseHistory] = useState<HistoryItem[]>([]);

  const activeDay = SCHEDULE_DAYS.find((d) => d.key === selectedDayKey) || SCHEDULE_DAYS[0];
  const activeExercise = activeDay.exercises[activeExerciseIndex] || activeDay.exercises[0];
  const activeExMax = activeExercise
    ? maxesMap[activeExercise.name] || computeMetrics(activeExercise.name, 80, 5)
    : null;

  const activeOverrides = (activeExercise && inputOverrides[activeExercise.name]) || {};
  const quickWeight =
    activeOverrides.quickWeight ?? (activeExMax?.lifted_weight ? String(activeExMax.lifted_weight) : "80");
  const quickReps =
    activeOverrides.quickReps ??
    (activeExMax?.reps_performed ? String(activeExMax.reps_performed) : "5");
  const inputWeight =
    activeOverrides.weight ??
    (activeExMax?.prescriptions.phase_5_work ? String(activeExMax.prescriptions.phase_5_work) : "90");
  const inputReps = activeOverrides.reps ?? String(parseInt(activeExercise?.reps, 10) || 3);

  const patchOverride = (field: "weight" | "reps" | "quickWeight" | "quickReps", val: string) => {
    if (!activeExercise) return;
    setInputOverrides((prev) => ({
      ...prev,
      [activeExercise.name]: { ...prev[activeExercise.name], [field]: val },
    }));
  };

  const persistSessionProgress = useCallback(
    (
      sets: { [k: string]: number[] },
      warmup: { [k: string]: string[] },
      dayKey: string,
      exIdx: number,
      cSet: number,
      phaseStep: string
    ) => {
      writeSessionProgress({
        completedSetsMap: sets,
        completedWarmupMap: warmup,
        selectedDayKey: dayKey,
        activeExerciseIndex: exIdx,
        currentSet: cSet,
        activePhaseStep: phaseStep,
      });
    },
    []
  );

  const refreshHistory = useCallback(
    async (exName: string) => {
      try {
        const res = await fetch(
          `${apiUrl}/api/strength/history?exercise_name=${encodeURIComponent(exName)}&limit=10`
        );
        if (res.ok) setExerciseHistory(await res.json());
      } catch {
        setExerciseHistory([]);
      }
    },
    [apiUrl]
  );

  const handleUpdateQuickMax = (wStr: string, rStr: string) => {
    const w = parseFloat(wStr) || 0;
    const r = parseInt(rStr, 10) || 1;
    if (w <= 0 || !activeExercise) return;
    const updated = computeMetrics(activeExercise.name, w, r, "epley");
    setMaxesMap((prev) => {
      const next = { ...prev, [activeExercise.name]: updated };
      writeMaxesMap(next);
      return next;
    });
    patchOverride("weight", String(updated.prescriptions.phase_5_work));
    enqueueWalEntry("/api/strength/maxes", {
      exercise_name: activeExercise.name,
      lifted_weight: w,
      reps_performed: r,
      formula: "epley",
      notes: "Calibración en vivo",
    });
    void wal.enqueueFlush();
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/api/strength/maxes`);
        if (!res.ok || ignore) return;
        const data: ExerciseMaxData[] = await res.json();
        if (ignore) return;
        const map: { [key: string]: ExerciseMaxData } = {};
        data.forEach((item) => {
          map[item.exercise_name] = item;
        });
        setMaxesMap((prev) => {
          const merged = { ...prev, ...map };
          writeMaxesMap(merged);
          return merged;
        });
      } catch {
        /* offline */
      }
    })();
    return () => {
      ignore = true;
    };
  }, [apiUrl]);

  useEffect(() => {
    if (!showProgressModal) return;
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(
          `${apiUrl}/api/strength/history?exercise_name=${encodeURIComponent(selectedProgressEx)}&limit=10`
        );
        if (res.ok && !ignore) setExerciseHistory(await res.json());
      } catch {
        if (!ignore) setExerciseHistory([]);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [selectedProgressEx, showProgressModal, apiUrl]);

  const handlers = useMemo(
    () =>
      createWorkoutHandlers({
        activeDay,
        activeExercise,
        activeExerciseIndex,
        activeExMax,
        activePhaseStep,
        completedSetsMap,
        completedWarmupMap,
        currentSet,
        inputRpe,
        inputReps,
        inputWeight,
        selectedDayKey,
        setActiveExerciseIndex,
        setActivePhaseStep,
        setCompletedSetsMap,
        setCompletedWarmupMap,
        setCurrentSet,
        setShowResetModal,
        setShowVictoryModal,
        setIsRunning: timer.setIsRunning,
        setRemainingSeconds: timer.setRemainingSeconds,
        handleStartTimer: timer.handleStartTimer,
        persistSessionProgress,
        enqueueFlush: wal.enqueueFlush,
      }),
    [
      activeDay,
      activeExercise,
      activeExerciseIndex,
      activeExMax,
      activePhaseStep,
      completedSetsMap,
      completedWarmupMap,
      currentSet,
      inputRpe,
      inputReps,
      inputWeight,
      selectedDayKey,
      persistSessionProgress,
      timer.setIsRunning,
      timer.setRemainingSeconds,
      timer.handleStartTimer,
      wal.enqueueFlush,
    ]
  );

  const handleSaveMax = async () => {
    const w = parseFloat(formWeight);
    const r = parseInt(formReps, 10);
    if (!w || w <= 0 || !r || r <= 0) return;
    setIsSavingMax(true);
    const updated = computeMetrics(selectedProgressEx, w, r, formFormula, formNotes);
    setMaxesMap((prev) => {
      const next = { ...prev, [selectedProgressEx]: updated };
      writeMaxesMap(next);
      return next;
    });
    if (activeExercise?.name === selectedProgressEx) {
      patchOverride("weight", String(updated.prescriptions.phase_5_work));
      patchOverride("quickWeight", String(w));
      patchOverride("quickReps", String(r));
    }
    try {
      enqueueWalEntry("/api/strength/maxes", {
        exercise_name: selectedProgressEx,
        lifted_weight: w,
        reps_performed: r,
        formula: formFormula,
        notes: formNotes,
      });
      await wal.enqueueFlush();
      if (wal.backendOnline) await refreshHistory(selectedProgressEx);
    } catch (err) {
      console.warn("Error saving 1RM:", err);
    } finally {
      setIsSavingMax(false);
    }
  };

  const liveCalc = previewLiveMax(
    parseFloat(formWeight) || 0,
    parseInt(formReps, 10) || 1,
    formFormula
  );
  const currentExMax = maxesMap[selectedProgressEx];
  const totalDaySets = activeDay.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedDaySets = activeDay.exercises.reduce((sum, ex) => {
    const done = completedSetsMap[ex.name]?.length || 0;
    return sum + Math.min(done, ex.sets);
  }, 0);
  const dayProgressPercent =
    totalDaySets > 0 ? Math.round((completedDaySets / totalDaySets) * 100) : 0;
  const isDayFinished = totalDaySets > 0 && completedDaySets >= totalDaySets;

  return {
    selectedDayKey,
    setSelectedDayKey,
    activeExerciseIndex,
    setActiveExerciseIndex,
    currentSet,
    setCurrentSet,
    activePhaseStep,
    setActivePhaseStep,
    completedSetsMap,
    setCompletedSetsMap,
    completedWarmupMap,
    setCompletedWarmupMap,
    backendOnline: wal.backendOnline,
    pendingWalCount: wal.pendingWalCount,
    zenFocusMode,
    setZenFocusMode,
    showPrepProtocol,
    setShowPrepProtocol,
    showProgressModal,
    setShowProgressModal,
    showResetModal,
    setShowResetModal,
    showVictoryModal,
    setShowVictoryModal,
    timerDuration: timer.timerDuration,
    remainingSeconds: timer.remainingSeconds,
    isRunning: timer.isRunning,
    setIsRunning: timer.setIsRunning,
    setRemainingSeconds: timer.setRemainingSeconds,
    timerTitle: timer.timerTitle,
    maxesMap,
    selectedProgressEx,
    setSelectedProgressEx,
    inputOverrides,
    inputRpe,
    setInputRpe,
    showQuickCalibration,
    setShowQuickCalibration,
    formFormula,
    setFormFormula,
    formWeight,
    setFormWeight,
    formReps,
    setFormReps,
    formNotes,
    setFormNotes,
    isSavingMax,
    exerciseHistory,
    activeDay,
    activeExercise,
    activeExMax,
    activeOverrides,
    quickWeight,
    quickReps,
    inputWeight,
    inputReps,
    apiUrl,
    liveCalc,
    currentExMax,
    progressPercent: timer.progressPercent,
    strokeDashoffset: timer.strokeDashoffset,
    atpSaturationPercent: timer.atpSaturationPercent,
    totalDaySets,
    completedDaySets,
    dayProgressPercent,
    isDayFinished,
    persistSessionProgress,
    refreshHistory,
    handleUpdateQuickMax,
    handleStartTimer: timer.handleStartTimer,
    togglePlayPause: timer.togglePlayPause,
    handleResetTimer: timer.handleResetTimer,
    skipRest: timer.skipRest,
    ...handlers,
    handleSaveMax,
    setQuickWeight: (v: string) => patchOverride("quickWeight", v),
    setQuickReps: (v: string) => patchOverride("quickReps", v),
    setInputWeight: (v: string) => patchOverride("weight", v),
    setInputReps: (v: string) => patchOverride("reps", v),
    calculateLive1RM: () =>
      previewLiveMax(parseFloat(formWeight) || 0, parseInt(formReps, 10) || 1, formFormula),
    formatTime,
    calculateSessionStats: () =>
      calculateSessionStats(activeDay, completedSetsMap, completedWarmupMap, maxesMap),
    playChime,
    SCHEDULE_DAYS,
    ALL_TRACKABLE_EXERCISES,
  };
}
