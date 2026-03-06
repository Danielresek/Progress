import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import type { DayExercise, LogEntry, Plan, WeekCompletion } from "../types";
import {
  clearPlanComplete,
  clearRunState,
  getCurrentDay,
  getDayExercises,
  getPlan,
  isPlanComplete,
  setCurrentDay,
} from "../storage/planStorage";
import { getLogs } from "../storage/logStorage";
import {
  clearWeekCompletions,
  getAndClearWeekDoneFlag,
  getWeekCompletions,
  getWeekIndex,
  getWeeklyStreak,
  setWeekIndex,
  setWeeklyStreak,
} from "../storage/statsStorage";

export default function TodayPage() {
  const navigate = useNavigate();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [dayId, setDayId] = useState<number>(1);
  const [dayItems, setDayItems] = useState<DayExercise[]>([]);
  const [planComplete, setPlanComplete] = useState<boolean>(false);
  const [weekJustCompleted, setWeekJustCompleted] = useState(false);

  // Show "Week completed!" message if the week was just completed
  useEffect(() => {
    if (getAndClearWeekDoneFlag()) {
      setWeekJustCompleted(true);

      confetti({
        particleCount: 140,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, []);

  // 1) Read active plan
  useEffect(() => {
    setPlan(getPlan());
  }, []);

  // Read whether the plan is complete
  useEffect(() => {
    setPlanComplete(isPlanComplete());
  }, []);

  // Read "next workout" (sequence)
  useEffect(() => {
    setDayId(getCurrentDay());
  }, []);

  // Clamp dayId to the number of workouts in the plan
  useEffect(() => {
    if (!plan) return;

    const max = plan.days.length;

    if (dayId < 1) {
      setDayId(1);
      setCurrentDay(1);
      return;
    }

    if (dayId > max) {
      setDayId(1);
      setCurrentDay(1);
    }
  }, [plan, dayId]);

  // Read exercises for the "next workout"
  useEffect(() => {
    setDayItems(getDayExercises(dayId));
  }, [dayId]);

  const dayTitle = useMemo(() => {
    if (!plan?.days?.length) return `Workout ${dayId}`;
    return plan.days[dayId - 1] ?? `Workout ${dayId}`;
  }, [plan, dayId]);

  const firstDayTitle = useMemo(() => {
  if (!plan?.days?.length) return "Workout 1";
  return plan.days[0] ?? "Workout 1";
}, [plan]);

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const totalDays = plan?.days?.length ?? 0;

    const weekIndex = getWeekIndex();
    const streak = getWeeklyStreak();

    const completionsThisWeek = getWeekCompletions().filter(
      (c) => c.weekIndex === weekIndex
    );

    const uniqueCompletedDays = new Set(completionsThisWeek.map((c) => c.dayId));
    const completedCount = uniqueCompletedDays.size;
    const remainingCount = Math.max(0, totalDays - completedCount);

    const progressPct =
      totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

    // PR this week: uses the same PR definition as ProgressPage:
    // - Weight PR: best performedWeight per exercise
    // - Reps PR: best performedReps per exercise
    // Counts how many exercises got a new PR (weight or reps) during "this week"
    const logs = getLogs();

    // Not in use right now
    // const logsThisWeek = logs.filter((l) => l.weekIndex === weekIndex);

    // Best all time per exercise (weight and reps)
    const bestWeightByExercise = new Map<string, { value: number; week: number }>();
    const bestRepsByExercise = new Map<string, { value: number; week: number }>();

    for (const l of logs) {
      // weight
      const prevW = bestWeightByExercise.get(l.exerciseId);
      if (!prevW || l.performedWeight > prevW.value) {
        bestWeightByExercise.set(l.exerciseId, {
          value: l.performedWeight,
          week: l.weekIndex ?? -1,
        });
      }

      // reps
      const prevR = bestRepsByExercise.get(l.exerciseId);
      if (!prevR || l.performedReps > prevR.value) {
        bestRepsByExercise.set(l.exerciseId, {
          value: l.performedReps,
          week: l.weekIndex ?? -1,
        });
      }
    }

    // Count "PR this week" = exercises where PR (weight or reps) has week === weekIndex
    let prCountThisWeek = 0;

    const exercises = new Set<string>([
      ...bestWeightByExercise.keys(),
      ...bestRepsByExercise.keys(),
    ]);

    for (const exId of exercises) {
      const w = bestWeightByExercise.get(exId);
      const r = bestRepsByExercise.get(exId);

      const weightPRThisWeek = w ? w.week === weekIndex : false;
      const repsPRThisWeek = r ? r.week === weekIndex : false;

      if (weightPRThisWeek || repsPRThisWeek) prCountThisWeek += 1;
    }

    return {
      weekIndex,
      streak,
      totalDays,
      completedCount,
      remainingCount,
      progressPct,
      prCountThisWeek,
    };
  }, [plan]);

  // Reset plan (start over)
  const restartPlan = () => {
    const ok = window.confirm(
      "This will set you back to Workout 1. Are you sure?"
    );
    if (!ok) return;

    setCurrentDay(1);
    clearPlanComplete();

    // Weekly stats reset
    setWeekIndex(1);
    setWeeklyStreak(0);
    clearWeekCompletions();

    // Remove run state for all workouts
    if (plan?.days?.length) {
      for (let i = 1; i <= plan.days.length; i++) {
        clearRunState(i);
      }
    }

    setPlanComplete(false);
    setDayId(1);
  };

  // If no active plan
  if (!plan) {
    return (
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-neutral-400 text-sm">
            You do not have an active plan yet.
          </p>
        </header>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
          <div className="text-sm text-neutral-300">
            Go to Plan to create a plan first.
          </div>

          <Link
            to="/plan"
            className="block text-center w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold active:scale-[0.99]"
          >
            Go to Plan
          </Link>
        </div>
      </div>
    );
  }

  // If the plan is marked as complete
  if (planComplete) {
    return (
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-neutral-400 text-sm">Plan completed 🎉</p>
        </header>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
          <div className="text-sm text-neutral-300">
            Great job! Do you want to restart the plan from Workout 1?
          </div>

          <button
            onClick={restartPlan}
            className="w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold active:scale-[0.99]"
          >
            Restart plan
          </button>

          <Link
            to="/plan"
            className="block text-center w-full rounded-2xl bg-neutral-800 py-4 text-lg font-semibold active:scale-[0.99]"
          >
            Edit plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Today</h1>
        <p className="text-neutral-400 text-sm">Next workout in your plan.</p>
        {weekJustCompleted && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-3 text-sm text-neutral-200">
            <span className="font-semibold">Week completed 🎉</span>{" "}
            Starting from <span className="font-semibold">{firstDayTitle}</span> again.
          </div>
        )}
      </header>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-neutral-400">Weekly stats</div>
          <div className="text-lg font-semibold">Week {weeklyStats.weekIndex}</div>
        </div>

        <div className="text-sm text-neutral-300">
          Streak: <span className="font-semibold">{weeklyStats.streak}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Completed</span>
          <span className="text-neutral-200 font-semibold">
            {weeklyStats.completedCount} / {weeklyStats.totalDays}
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
          <div
            className="h-2 bg-white"
            style={{ width: `${weeklyStats.progressPct}%` }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Remaining</span>
          <span className="text-neutral-200 font-semibold">
            {weeklyStats.remainingCount}
          </span>
        </div>

        {/* <div className="flex justify-between text-sm">
          <span className="text-neutral-400">PR this week</span>
          <span className="text-neutral-200 font-semibold">
            {weeklyStats.prCountThisWeek}
          </span>
        </div> */}

      </div>
    </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
        {/* Workout header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-400">Next workout</div>
            <div className="text-lg font-semibold">{dayTitle}</div>

            <div className="text-xs text-neutral-500 mt-1">
              Exercises in workout: {dayItems.length}
            </div>
          </div>

          <span className="text-xs rounded-full border border-neutral-700 px-3 py-1 text-neutral-300">
            Workout {dayId}
          </span>
        </div>

        {/* Exercises in workout */}
          {dayItems.length > 0 ? (
            <div className="rounded-xl bg-black/30 border border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs uppercase tracking-wider text-neutral-500">
                  Exercises
                </div>
                <div className="text-xs text-neutral-600">
                  {dayItems.length} total
                </div>
              </div>

              <div className="divide-y divide-neutral-800">
                {dayItems.map((ex, i) => (
                  <div
                    key={ex.exerciseId}
                    className="py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 text-xs flex items-center justify-center">
                        {i + 1}
                      </div>

                      <span className="text-neutral-200">{ex.name}</span>
                    </div>

                    <span className="text-neutral-500 text-sm">
                      {ex.sets} × {ex.reps}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 text-neutral-400 text-sm">
              There are no exercises in {dayTitle} yet. Go to Plan and add some.
            </div>
          )}

        <button
          onClick={() => navigate(`/today/run/${dayId}`)}
          disabled={dayItems.length === 0}
          className={[
            "w-full rounded-2xl py-4 text-lg font-semibold active:scale-[0.99]",
            dayItems.length === 0
              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              : "bg-white text-black",
          ].join(" ")}
        >
          Start workout
        </button>

        <Link
          to={`/plan/day/${dayId}`}
          className="block text-center w-full rounded-2xl bg-neutral-800 py-4 text-lg font-semibold active:scale-[0.99]"
        >
          Edit this workout
        </Link>

        {/* Subtle reset */}
        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={restartPlan}
            className="text-xs underline underline-offset-4 transition text-neutral-500 hover:text-neutral-300"
          >
            Restart plan
          </button>
        </div>
      </div>
    </div>
  );
}