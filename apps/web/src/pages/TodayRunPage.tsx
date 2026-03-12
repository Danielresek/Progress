import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { DayExercise, LogEntry } from "../types";
import { useWorkoutApi } from "../api/useWorkoutApi";
import type { PlanResponse } from "../api/workoutApi";
import {
  clearPlanComplete,
  clearRunState,
  getDayExercises,
  getRunIndex,
  setCurrentDay,
  setRunIndex,
} from "../storage/planStorage";
import { addLogEntry, getLogs } from "../storage/logStorage";
import {
  getWeekCompletions,
  getWeekIndex,
  getWeeklyStreak,
  saveWeekCompletions,
  setWeekDoneFlag,
  setWeekIndex,
  setWeeklyStreak,
} from "../storage/statsStorage";

type CompletedSet = {
  setNumber: number;
  weight: number;
  reps: number;
};

type HistoricalSet = {
  setNumber: number;
  weight: number;
  reps: number;
};

function createExerciseSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.map((b) => b.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

export default function TodayRunPage() {
  const navigate = useNavigate();
  const params = useParams();
  const dayId = Number(params.dayId || "1");
  const { getActivePlan, createLog } = useWorkoutApi();

  const [activePlan, setActivePlan] = useState<PlanResponse | null>(null);
  const [items, setItems] = useState<DayExercise[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);
  const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);
  const [exerciseSessionId, setExerciseSessionId] = useState<string>(
    createExerciseSessionId()
  );

  const [kg, setKg] = useState<string>("");
  const [reps, setReps] = useState<string>("");

  const [formError, setFormError] = useState<string>("");

  // Load active plan from backend
  useEffect(() => {
    let cancelled = false;

    getActivePlan()
      .then((nextPlan) => {
        if (cancelled) return;
        setActivePlan(nextPlan);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error("Failed to load active plan", error);
        setActivePlan(null);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dayTitle = useMemo(() => {
    const day = activePlan?.days.find((d) => d.dayIndex === dayId);
    return day?.name ?? `Workout ${dayId}`;
  }, [activePlan, dayId]);

  // Load exercises for the day
  useEffect(() => {
    if (!activePlan) {
      setItems(getDayExercises(dayId));
      return;
    }

    const day = activePlan.days.find((d) => d.dayIndex === dayId);
    if (!day) {
      setItems([]);
      return;
    }

    const mappedItems: DayExercise[] = [...day.exercises]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((exercise) => ({
        exerciseId: exercise.exerciseId,
        name: exercise.exerciseName,
        sets: exercise.sets,
        reps: exercise.reps,
        startWeight: exercise.startWeight,
      }));

    setItems(mappedItems);
  }, [activePlan, dayId]);

  // Load "how far you got" in the workout (index)
  useEffect(() => {
    const savedIndex = getRunIndex(dayId);
    if (savedIndex !== null) setIndex(savedIndex);
  }, [dayId]);

  // Persist index when it changes
  useEffect(() => {
    setRunIndex(dayId, index);
  }, [dayId, index]);

  const current = useMemo(() => items[index] ?? null, [items, index]);
  const plannedSetCount = useMemo(
    () => Math.max(1, current?.sets ?? 1),
    [current?.sets]
  );
  const isLastSet = currentSetIndex + 1 >= plannedSetCount;

  const lastWorkoutSets = useMemo<HistoricalSet[]>(() => {
    if (!current) return [];

    const logs = getLogs()
      .filter(
        (l) =>
          l.exerciseId === current.exerciseId &&
          !!l.exerciseSessionId &&
          l.exerciseSessionId !== exerciseSessionId
      )
      .sort((a, b) => b.timestamp - a.timestamp);

    if (!logs.length) return [];

    const latestSessionId = logs[0].exerciseSessionId;
    const sessionLogs = logs
      .filter((log) => log.exerciseSessionId === latestSessionId)
      .sort((a, b) => {
        const aSet = typeof a.setNumber === "number" ? a.setNumber : Number.MAX_SAFE_INTEGER;
        const bSet = typeof b.setNumber === "number" ? b.setNumber : Number.MAX_SAFE_INTEGER;
        if (aSet !== bSet) return aSet - bSet;
        return a.timestamp - b.timestamp;
      });

    return sessionLogs.map((log, i) => ({
      setNumber: log.setNumber ?? i + 1,
      weight: log.performedWeight,
      reps: log.performedReps,
    }));
  }, [current?.exerciseId, exerciseSessionId]);

  const last = useMemo(() => {
    if (!lastWorkoutSets.length) return null;
    const mostRecentSet = lastWorkoutSets[lastWorkoutSets.length - 1];
    return {
      performedWeight: mostRecentSet.weight,
      performedReps: mostRecentSet.reps,
    };
  }, [lastWorkoutSets]);

  // Reset set-by-set state and prefill inputs when exercise changes.
  useEffect(() => {
    setCurrentSetIndex(0);
    setCompletedSets([]);
    setExerciseSessionId(createExerciseSessionId());
    setFormError("");

    if (!current) {
      setKg("");
      setReps("");
      return;
    }

    const suggestedStart = current.startWeight > 0 ? current.startWeight : null;
    setKg(suggestedStart !== null ? String(suggestedStart) : "");
    setReps(current.reps > 0 ? String(current.reps) : "");
  }, [current?.exerciseId, current?.reps, current?.startWeight]);

  const toNumberOrNull = (value: string) => {
  const cleaned = value.replace(",", ".").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const setKgSafe = (n: number) => {
  // Always displays dot decimals; can be enhanced later
  setKg(String(n));
};

const roundKg = (n: number) => Number(n.toFixed(1));

const applyLast = () => {
  if (!last) return;
  setKgSafe(last.performedWeight);
  setReps(String(last.performedReps));
  setFormError("");
};

const suggestion = useMemo(() => {
  if (!current || !last) return null;

  const suggestedWeight =
    last.performedReps >= current.reps
      ? roundKg(last.performedWeight + 2.5)
      : roundKg(last.performedWeight);

  return {
    weight: suggestedWeight,
    reps: current.reps,
  };
}, [current, last]);

const applySuggestion = () => {
  if (!suggestion) return;
  setKgSafe(suggestion.weight);
  setReps(String(suggestion.reps));
  setFormError("");
};

const bumpKg = (delta: number) => {
  // 1) Try kg input first
  const currentKg = toNumberOrNull(kg);

  // 2) If empty/invalid: use last kg if available, otherwise 0
  const base = currentKg ?? last?.performedWeight ?? 0;

  const next = Math.max(0, base + delta);
  setKgSafe(next);
  setFormError("");
};

  const parsePositiveNumber = (value: string) => {
    const cleaned = value.replace(",", ".").trim();
    const n = Number(cleaned);
    if (!Number.isFinite(n)) return null;
    if (n <= 0) return null;
    return n;
  };

  const canSave = useMemo(() => {
    if (!current) return false;
    const w = parsePositiveNumber(kg);
    const r = parsePositiveNumber(reps);
    return w !== null && r !== null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kg, reps, current?.exerciseId]);

  const saveLogToBackend = async (payload: {
    dayIndex: number;
    exercise: DayExercise;
    exerciseSessionId: string;
    setNumber: number;
    performedWeight: number;
    performedReps: number;
    weekIndex: number;
  }) => {
    try {
      const activePlan = await getActivePlan();
      if (!activePlan) {
        return;
      }
      const planDay = activePlan.days.find((day) => day.dayIndex === payload.dayIndex);

      if (!planDay) {
        console.error(
          `Failed to create backend log: no active plan day found for dayIndex=${payload.dayIndex}`
        );
        return;
      }

      await createLog({
        planDayId: planDay.id,
        planDayName: planDay.name,
        exerciseId: payload.exercise.exerciseId,
        exerciseName: payload.exercise.name,
        exerciseSessionId: payload.exerciseSessionId,
        setNumber: payload.setNumber,
        performedWeight: payload.performedWeight,
        performedReps: payload.performedReps,
        weekIndex: payload.weekIndex,
      });
    } catch (error) {
      console.error("Failed to create workout log in backend", error);
    }
  };

  const saveSet = () => {
    if (!current) return;

    const performedWeight = parsePositiveNumber(kg);
    const performedReps = parsePositiveNumber(reps);

    if (performedWeight === null || performedReps === null) {
      setFormError("Fill in both kg and reps (numbers greater than 0) before saving.");
      return;
    }

    const nextSetNumber = currentSetIndex + 1;
    const weekIndex = getWeekIndex();

    const entry: LogEntry = {
      dayId,
      exerciseId: current.exerciseId,
      exerciseSessionId,
      setNumber: nextSetNumber,
      performedWeight,
      performedReps,
      timestamp: Date.now(),
      weekIndex,
    };

    addLogEntry(entry);

    // Save each set immediately. Backend sync remains best-effort.
    void saveLogToBackend({
      dayIndex: dayId,
      exercise: current,
      exerciseSessionId,
      setNumber: nextSetNumber,
      performedWeight,
      performedReps,
      weekIndex,
    });

    const nextCompletedSets: CompletedSet[] = [
      ...completedSets,
      {
        setNumber: nextSetNumber,
        weight: performedWeight,
        reps: performedReps,
      },
    ];

    setCompletedSets(nextCompletedSets);
    setFormError("");

    if (nextSetNumber < plannedSetCount) {
      setCurrentSetIndex(nextSetNumber);
      setKgSafe(performedWeight);
      setReps(current.reps > 0 ? String(current.reps) : String(performedReps));
      return;
    }

    setCurrentSetIndex(0);
    setCompletedSets([]);
    setExerciseSessionId(createExerciseSessionId());
    setKg("");
    setReps("");

    // next exercise
    const nextIndex = index + 1;
    if (nextIndex >= items.length) {
      setIndex(items.length); // done
      return;
    }
    setIndex(nextIndex);
  };

  const resetRun = () => {
    const ok = window.confirm("Do you want to restart this workout?");
    if (!ok) return;

    clearRunState(dayId);
    setIndex(0);
    setCurrentSetIndex(0);
    setCompletedSets([]);
    setExerciseSessionId(createExerciseSessionId());
    setKg("");
    setReps("");
    setFormError("");
  };

  // Save and close: advance to next workout (or loop to workout 1) and go back to Today
  const saveAndClose = () => {
    const totalDays = activePlan?.days?.length ?? 0;

    // clear run state for this workout
    clearRunState(dayId);

    // Weekly stats: register that this workout was completed in active week
    const weekIndex = getWeekIndex();

    const completions = getWeekCompletions();
    const exists = completions.some(
      (c) => c.weekIndex === weekIndex && c.dayId === dayId
    );

    if (!exists) {
      completions.push({ weekIndex, dayId, completedAt: Date.now() });
      saveWeekCompletions(completions);
    }

    // IMPORTANT: ensure the "plan complete" view never triggers
    clearPlanComplete();

    if (!totalDays) {
      navigate("/today");
      return;
    }

    const nextDay = dayId + 1;

    if (nextDay > totalDays) {
      // LOOP: new week starts
      setCurrentDay(1);
      setWeekDoneFlag(true); // toast on Today

      const currentWeek = getWeekIndex();
      setWeekIndex(currentWeek + 1);

      const streak = getWeeklyStreak();
      setWeeklyStreak(streak + 1);
    } else {
      setCurrentDay(nextDay);
    }

    navigate("/today");
  };

  if (!items.length) {
    return (
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Run workout</h1>
          <p className="text-neutral-400 text-sm">
            No exercises found in {dayTitle}. Add exercises in Plan first.
          </p>
        </header>

        <Link
          to={`/plan/day/${dayId}`}
          className="block text-center w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold active:scale-[0.99]"
        >
          Go to Plan for {dayTitle}
        </Link>
      </div>
    );
  }

  // workout completed
  if (index >= items.length) {
    return (
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">{dayTitle} completed ✅</h1>
          <p className="text-neutral-400 text-sm">
            Do you want to save and go back to Today, or restart this workout?
          </p>
        </header>

        <button
          onClick={saveAndClose}
          className="w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold active:scale-[0.99]"
        >
          Save and close
        </button>

        <button
          onClick={resetRun}
          className="w-full rounded-2xl bg-neutral-800 py-4 text-lg font-semibold active:scale-[0.99]"
        >
          Restart workout
        </button>

        <Link
          to="/today"
          className="block text-center w-full rounded-2xl bg-neutral-900 border border-neutral-800 py-4 text-lg font-semibold active:scale-[0.99]"
        >
          Back to Today
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <Link to="/today" className="text-sm text-neutral-400">
          ← Back
        </Link>

        <h1 className="text-2xl font-bold">{dayTitle}</h1>
        <p className="text-neutral-400 text-sm">
          Exercise {index + 1} of {items.length}
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4">
        <div>
          <div className="text-sm text-neutral-400">Exercise</div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-xl font-semibold">{current?.name}</div>
            <div className="rounded-full border border-neutral-700 bg-neutral-950/60 px-2.5 py-1 text-xs text-neutral-300 whitespace-nowrap">
              Set {currentSetIndex + 1} / {plannedSetCount}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-black/30 border border-neutral-800 p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-neutral-400">Last workout</span>
          </div>

          {lastWorkoutSets.length ? (
            <div className="space-y-1">
              {lastWorkoutSets.map((set) => (
                <div key={set.setNumber} className="text-neutral-300">
                  Set {set.setNumber} - {set.weight} kg x {set.reps}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-neutral-500">No previous workout found.</div>
          )}

          {suggestion && (
            <div className="flex items-center justify-between gap-3 border-t border-neutral-800 pt-2 mt-2">
              <span>
                Suggestion: {suggestion.weight} kg x {suggestion.reps}
              </span>
              <button
                type="button"
                onClick={applySuggestion}
                className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-950/60 text-neutral-200 text-xs font-semibold active:scale-[0.99]"
              >
                Use suggestion
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-neutral-400">Kg (actual)</div>
            <input
              value={kg}
              onChange={(e) => {
                setKg(e.target.value);
                if (formError) setFormError("");
              }}
              inputMode="decimal"
              placeholder="e.g. 100"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-600"
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs text-neutral-400">Reps (actual)</div>
            <input
              value={reps}
              onChange={(e) => {
                setReps(e.target.value);
                if (formError) setFormError("");
              }}
              inputMode="numeric"
              placeholder="e.g. 8"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={applyLast}
            disabled={!last}
            className={[
              "px-3 py-2 rounded-xl border text-sm font-semibold transition",
              last
                ? "border-neutral-700 bg-neutral-950/60 text-neutral-200 active:scale-[0.99]"
                : "border-neutral-800 bg-neutral-950/30 text-neutral-600 cursor-not-allowed",
            ].join(" ")}
          >
            Use last
          </button>

          <button
            type="button"
            onClick={() => bumpKg(2.5)}
            className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950/60 text-neutral-200 text-sm font-semibold active:scale-[0.99]"
          >
            +2.5 kg
          </button>

          <button
            type="button"
            onClick={() => bumpKg(5)}
            className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950/60 text-neutral-200 text-sm font-semibold active:scale-[0.99]"
          >
            +5 kg
          </button>
        </div>

        <div className="rounded-xl bg-black/30 border border-neutral-800 p-3 space-y-2">
          <div className="text-sm font-semibold">Completed sets</div>
          {completedSets.length === 0 ? (
            <div className="text-sm text-neutral-500">No sets completed yet.</div>
          ) : (
            <div className="space-y-1">
              {completedSets.map((set) => (
                <div key={set.setNumber} className="text-sm text-neutral-300">
                  Set {set.setNumber} - {set.weight} kg x {set.reps}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {formError && (
          <div className="text-sm text-red-300">{formError}</div>
        )}

        <button
          onClick={saveSet}
          disabled={!canSave}
          className={[
            "w-full rounded-2xl py-4 text-lg font-semibold active:scale-[0.99]",
            canSave
              ? "bg-white text-black"
              : "bg-neutral-800 text-neutral-500 cursor-not-allowed",
          ].join(" ")}
        >
          {isLastSet ? "Save and complete exercise" : "Save and next set"}
        </button>

        <button
          onClick={resetRun}
          className="w-full rounded-2xl bg-neutral-800 py-4 text-lg font-semibold active:scale-[0.99]"
        >
          Restart workout
        </button>
      </div>
    </div>
  );
}