"use client";

import { getPrilepinPrescription } from "@/lib/prilepinEngine.mjs";

const REST_PLACEHOLDER_EXERCISE = {
  name: "Descanso y Supercompensación",
  sets: 0,
  reps: "0 reps",
  restSeconds: 0,
  cue: "Regeneración del Sistema Nervioso Central",
};

import { useState, useEffect, useCallback, useMemo } from "react";
import { enqueueWalEntry } from "@/lib/walSync";
import { useAtpTimer } from "@/app/hooks/useAtpTimer";
import { useBackendWal } from "@/app/hooks/useBackendWal";
import { createWorkoutHandlers } from "@/app/hooks/createWorkoutHandlers";
import { calculateStrengthLevel, evaluateStrengthCoach } from "@/lib/strengthStandards";
import {
  SCHEDULE_DAYS,
  ALL_TRACKABLE_EXERCISES,
  getTrainingProgram,
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
import {
  getLocalExerciseHistory,
  getLocalProgressionCurve,
  getLocalSupercompensationTrend,
  logLocalSetHistory,
} from "@/lib/prHistory";
import { playChime } from "@/lib/zenAudio";
import { readDeviceMaxes, resolveExerciseKey } from "@/lib/sessionExercise";

export function useZenDashboard() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const timer = useAtpTimer(180);
  const wal = useBackendWal(apiUrl);

  const [selectedProgramId, setSelectedProgramId] = useState<string>("universal-pr");

  const currentProgram = getTrainingProgram(selectedProgramId);
  const scheduleDays = currentProgram.days;

  const [selectedDayKey, setSelectedDayKey] = useState(
    () => getSavedSession()?.selectedDayKey || scheduleDays[0].key
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
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const saved = localStorage.getItem('neuro_strength_theme');
      return (saved === 'dark' || saved === 'light' || saved === 'system') ? (saved as 'light' | 'dark' | 'system') : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const applyTheme = () => {
      let isDark = false;
      if (themeMode === 'dark') {
        isDark = true;
      } else if (themeMode === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    try {
      localStorage.setItem('neuro_strength_theme', themeMode);
    } catch {
      // ignore
    }

    if (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [themeMode]);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);
  const [coachMode, setCoachMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const saved = localStorage.getItem("neuro_strength_coach_mode");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleCoachMode = useCallback(() => {
    setCoachMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("neuro_strength_coach_mode", JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);
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
  const [historyRevision, setHistoryRevision] = useState(0);
  const [serverHistory, setServerHistory] = useState<HistoryItem[]>([]);
  const [marksRead, setMarksRead] = useState<"pending" | "ready" | "failed">("pending");

  const [bodyweightKg, setBodyweightKg] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("atp_athlete_bodyweight");
      if (saved) {
        const parsed = parseFloat(saved);
        if (parsed > 0) return parsed;
      }
    }
    return 75;
  });

  const [customExercises, setCustomExercises] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("atp_custom_exercises");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const handleUpdateBodyweight = useCallback((newBw: number) => {
    setBodyweightKg(newBw);
    if (typeof window !== "undefined") {
      localStorage.setItem("atp_athlete_bodyweight", String(newBw));
    }
  }, []);

  const allTrackableExercises = useMemo(() => {
    const set = new Set<string>();
    ALL_TRACKABLE_EXERCISES.forEach((e) => set.add(e));
    Object.keys(maxesMap).forEach((e) => set.add(e));
    customExercises.forEach((e) => set.add(e));
    return Array.from(set);
  }, [maxesMap, customExercises]);

  const localHistory = useMemo(() => {
    void historyRevision;
    return getLocalExerciseHistory(selectedProgressEx);
  }, [selectedProgressEx, historyRevision]);

  const exerciseHistory = useMemo<HistoryItem[]>(() => {
    if (serverHistory.length > 0) return serverHistory;
    return localHistory.map((l) => ({
      id: l.id,
      exercise_name: l.exercise_name,
      set_number: l.set_number,
      prescribed_reps: l.prescribed_reps ?? l.completed_reps,
      completed_reps: l.completed_reps,
      load_kg: l.load_kg,
      rest_seconds: 180,
      notes: l.notes,
      completed: true,
      e1rm: l.e1rm,
      rpe: l.rpe,
      rir: l.rir,
      is_pr: l.is_pr,
      timestamp: l.timestamp,
    }));
  }, [serverHistory, localHistory]);

  const progressionCurve = useMemo(() => {
    void historyRevision;
    return getLocalProgressionCurve(selectedProgressEx);
  }, [selectedProgressEx, historyRevision]);

  const supercompensationTrend = useMemo(() => {
    void historyRevision;
    return getLocalSupercompensationTrend(selectedProgressEx);
  }, [selectedProgressEx, historyRevision]);

  const selectedExMax = maxesMap[selectedProgressEx] || null;
  const current1Rm = selectedExMax?.one_rep_max || (localHistory[0]?.e1rm || 0);

  const strengthStandards = useMemo(() => {
    return calculateStrengthLevel(selectedProgressEx, current1Rm, bodyweightKg);
  }, [selectedProgressEx, current1Rm, bodyweightKg]);

  const coachEvaluation = useMemo(() => {
    return evaluateStrengthCoach(selectedProgressEx, localHistory, current1Rm, strengthStandards);
  }, [selectedProgressEx, localHistory, current1Rm, strengthStandards]);

  const activeDay = scheduleDays.find((d) => d.key === selectedDayKey) || scheduleDays[0];
  const activeExercise = activeDay.exercises[activeExerciseIndex] || activeDay.exercises[0] || REST_PLACEHOLDER_EXERCISE;
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
  const defaultDeterministicReps = activeExMax?.one_rep_max
    ? String(getPrilepinPrescription(parseFloat(inputWeight) || 0, activeExMax.one_rep_max).exactTargetReps)
    : String(parseInt(activeExercise.reps, 10) || 3);
  const inputReps = activeOverrides.reps ?? defaultDeterministicReps;

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

  const handleSelectProgram = useCallback(
    (programId: string) => {
      setSelectedProgramId(programId);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("neuro_strength_selected_program", programId);
        } catch {
          // ignore
        }
      }
      const prog = getTrainingProgram(programId);
      const firstActiveDay = prog.days.find((d) => !d.isRest) || prog.days[0];
      setSelectedDayKey(firstActiveDay.key);
      setActiveExerciseIndex(0);
      const firstEx = firstActiveDay.exercises[0];
      const done = firstEx ? (completedSetsMap[firstEx.name]?.length || 0) : 0;
      const nextSet = done > 0 && done < (firstEx?.sets || 1) ? done + 1 : 1;
      setCurrentSet(nextSet);
      setActivePhaseStep(done === 0 ? "F1" : nextSet.toString());
      persistSessionProgress(
        completedSetsMap,
        completedWarmupMap,
        firstActiveDay.key,
        0,
        nextSet,
        done === 0 ? "F1" : nextSet.toString()
      );
    },
    [completedSetsMap, completedWarmupMap, persistSessionProgress]
  );

  const refreshHistory = useCallback(
    async (exName: string) => {
      setHistoryRevision((v) => v + 1);
      try {
        const res = await fetch(
          `${apiUrl}/api/strength/history?exercise_name=${encodeURIComponent(exName)}&limit=15`
        );
        if (!res.ok) {
          setMarksRead("failed");
          return;
        }
        setServerHistory(await res.json());
        setMarksRead("ready");
      } catch {
        setMarksRead("failed");
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

    // Sovereign PR & set history logging
    logLocalSetHistory({
      exercise_name: activeExercise.name,
      load_kg: w,
      completed_reps: r,
      prescribed_reps: r,
      rpe: 10,
      e1rm: updated.one_rep_max,
      notes: "Calibración en vivo",
    });
    setHistoryRevision((v) => v + 1);

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
          `${apiUrl}/api/strength/history?exercise_name=${encodeURIComponent(selectedProgressEx)}&limit=15`
        );
        if (ignore) return;
        if (!res.ok) {
          setMarksRead("failed");
          return;
        }
        const serverData: HistoryItem[] = await res.json();
        setServerHistory(serverData);
        setMarksRead("ready");
      } catch {
        if (!ignore) setMarksRead("failed");
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

  const commitSessionExercise = useCallback((name: string, pr: number) => {
    const stored = readDeviceMaxes();
    const key = resolveExerciseKey(name, [...Object.keys(stored), ...customExercises]);
    if (!key || !(pr > 0)) return name.trim();
    const updated = computeMetrics(key, pr, 1, "direct", "PR de la sesión");
    writeMaxesMap({ ...stored, [key]: updated });
    setMaxesMap((prev) => ({ ...prev, [key]: updated }));

    const catalogHit = ALL_TRACKABLE_EXERCISES.some((entry) => entry === key);
    if (!catalogHit) {
      setCustomExercises((prev) => {
        if (prev.some((entry) => entry.toLocaleLowerCase("es") === key.toLocaleLowerCase("es"))) {
          return prev;
        }
        const next = [...prev, key];
        try {
          localStorage.setItem("atp_custom_exercises", JSON.stringify(next));
        } catch {
          /* el dispositivo puede rechazar la escritura */
        }
        return next;
      });
    }
    return key;
  }, [customExercises]);

  const handleAddNewExercise = useCallback(
    async (
      name: string,
      initialWeight?: number,
      initialReps?: number,
      formula = "epley",
      notes = "Registro inicial de ejercicio"
    ) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      setCustomExercises((prev) => {
        if (prev.includes(trimmed)) return prev;
        const next = [...prev, trimmed];
        if (typeof window !== "undefined") {
          localStorage.setItem("atp_custom_exercises", JSON.stringify(next));
        }
        return next;
      });

      setSelectedProgressEx(trimmed);

      if (initialWeight && initialWeight > 0 && initialReps && initialReps > 0) {
        const updated = computeMetrics(trimmed, initialWeight, initialReps, formula, notes);
        setMaxesMap((prev) => {
          const next = { ...prev, [trimmed]: updated };
          writeMaxesMap(next);
          return next;
        });

        logLocalSetHistory({
          exercise_name: trimmed,
          load_kg: initialWeight,
          completed_reps: initialReps,
          prescribed_reps: initialReps,
          rpe: 10,
          e1rm: updated.one_rep_max,
          notes: notes || "Calibración inicial",
        });
        setHistoryRevision((v) => v + 1);

        try {
          enqueueWalEntry("/api/strength/maxes", {
            exercise_name: trimmed,
            lifted_weight: initialWeight,
            reps_performed: initialReps,
            formula,
            notes,
          });
          await wal.enqueueFlush();
          if (wal.backendOnline) await refreshHistory(trimmed);
        } catch (err) {
          console.warn("Error registering new exercise:", err);
        }
      }
    },
    [wal, refreshHistory]
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
    // Sovereign PR & set history logging
    logLocalSetHistory({
      exercise_name: selectedProgressEx,
      load_kg: w,
      completed_reps: r,
      prescribed_reps: r,
      rpe: 10,
      e1rm: updated.one_rep_max,
      notes: formNotes || "Calibración Manual 1RM",
    });
    setHistoryRevision((v) => v + 1);

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

  const liveCalc = useMemo(
    () =>
      previewLiveMax(
        parseFloat(formWeight) || 0,
        parseInt(formReps, 10) || 1,
        formFormula
      ),
    [formWeight, formReps, formFormula]
  );

  const currentExMax = useMemo(
    () => maxesMap[selectedProgressEx],
    [maxesMap, selectedProgressEx]
  );

  const { totalDaySets, completedDaySets, dayProgressPercent, isDayFinished } = useMemo(() => {
    const total = (activeDay.exercises || []).reduce((sum, ex) => sum + ex.sets, 0);
    const completed = (activeDay.exercises || []).reduce((sum, ex) => {
      const done = completedSetsMap[ex.name]?.length || 0;
      return sum + Math.min(done, ex.sets);
    }, 0);
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const finished = total > 0 && completed >= total;
    return {
      totalDaySets: total,
      completedDaySets: completed,
      dayProgressPercent: percent,
      isDayFinished: finished,
    };
  }, [activeDay, completedSetsMap]);

  const getSessionStats = useCallback(
    () => calculateSessionStats(activeDay, completedSetsMap, completedWarmupMap, maxesMap),
    [activeDay, completedSetsMap, completedWarmupMap, maxesMap]
  );

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
    themeMode,
    setThemeMode,
    toggleTheme,
    coachMode,
    setCoachMode,
    toggleCoachMode,
    showPrepProtocol,
    setShowPrepProtocol,
    showProgressModal,
    setShowProgressModal,
    showResetModal,
    setShowResetModal,
    showVictoryModal,
    setShowVictoryModal,
    timerDuration: timer.timerDuration,
    restActive: timer.restActive,
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
    progressionCurve,
    supercompensationTrend,
    marksRead,
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
    calculateSessionStats: getSessionStats,
    playChime,
    SCHEDULE_DAYS,
    scheduleDays,
    selectedProgramId,
    setSelectedProgramId,
    handleSelectProgram,
    currentProgram,
    availablePrograms: [currentProgram],
    ALL_TRACKABLE_EXERCISES,
    bodyweightKg,
    handleUpdateBodyweight,
    allTrackableExercises,
    commitSessionExercise,
    handleAddNewExercise,
    strengthStandards,
    coachEvaluation,
  };
}
