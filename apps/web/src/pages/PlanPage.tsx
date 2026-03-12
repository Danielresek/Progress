import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EXERCISES } from "../data/exercises";
import { PLAN_TEMPLATES, type PlanTemplate } from "../data/templates";
import { useWorkoutApi } from "../api/useWorkoutApi";
import type { CreatePlanRequest, PlanResponse } from "../api/workoutApi";
import {
  clearCurrentDay,
  clearAllDayExercises,
  clearAllRunStates,
  clearPlan,
  clearPlanComplete,
  setCurrentDay,
} from "../storage/planStorage";
import { clearLogs } from "../storage/logStorage";
import {
  clearWeekCompletions,
  setWeekDoneFlag,
  setWeekIndex,
  setWeeklyStreak,
} from "../storage/statsStorage";

export default function PlanPage() {
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(true);
  const { createPlan, getActivePlan, resetActivePlan } = useWorkoutApi();

  // form state
  const [planName, setPlanName] = useState("");
  const [dayCount, setDayCount] = useState(3);

  const dayOptions = useMemo(() => [2, 3, 4, 5, 6], []);
  const exerciseNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of EXERCISES) map.set(e.id, e.name);
    return map;
  }, []);

  // Load active plan from backend on mount
  useEffect(() => {
    let cancelled = false;

    setIsPlanLoading(true);

    getActivePlan()
      .then((activePlan) => {
        if (cancelled) return;
        if (!activePlan) {
          setPlan(null);
          return;
        }
        setPlan(activePlan);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error("Failed to load active plan", error);
      })
      .finally(() => {
        if (cancelled) return;
        setIsPlanLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isPlanLoading && !plan) {
    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Plan</h1>
          <p className="text-neutral-400 text-sm">Loading active plan...</p>
        </header>
      </div>
    );
  }

  const createManualPayload = (name: string, workouts: number): CreatePlanRequest => ({
    name,
    days: Array.from({ length: workouts }, (_, i) => ({
      name: `Workout ${i + 1}`,
      dayIndex: i + 1,
      exercises: [],
    })),
  });

  const createTemplatePayload = (template: PlanTemplate): CreatePlanRequest => ({
    name: template.name,
    days: template.days.map((day, dayIndex) => ({
      name: day.name,
      dayIndex: dayIndex + 1,
      exercises: day.exercises.map((exercise, exerciseIndex) => ({
        exerciseId: exercise.exerciseId,
        exerciseName: exerciseNameById.get(exercise.exerciseId) ?? exercise.exerciseId,
        sortOrder: exerciseIndex + 1,
        sets: exercise.sets,
        reps: exercise.reps,
        startWeight: exercise.startWeight ?? 0,
      })),
    })),
  });

  const createManualPlan = async () => {
    const name = planName.trim() || "My workout plan";
    const payload = createManualPayload(name, dayCount);
    const createdPlan = await createPlan(payload);

    setPlan(createdPlan);

    // When creating a new plan: start sequence at 1
    setCurrentDay(1);
    clearPlanComplete();
    clearAllRunStates();
  };

  const createTemplatePlan = async (template: PlanTemplate) => {
    const payload = createTemplatePayload(template);
    const createdPlan = await createPlan(payload);

    setPlan(createdPlan);

    setCurrentDay(1);
    clearPlanComplete();
    clearAllRunStates();
  };

  const handleCreateManualPlan = () => {
    createManualPlan().catch((error) => {
      console.error("Failed to create manual plan", error);
      window.alert("Could not create plan right now. Please try again.");
    });
  };

  const handleCreateTemplatePlan = (template: PlanTemplate) => {
    createTemplatePlan(template).catch((error) => {
      console.error("Failed to create template plan", error);
      window.alert("Could not create plan right now. Please try again.");
    });
  };

  const resetPlan = async () => {
    const ok = window.confirm(
      "This will delete the plan and all workouts/exercises. Are you sure?"
    );
    if (!ok) return;

    try {
      await resetActivePlan();
    } catch (error) {
      console.error("Failed to reset active plan", error);
      window.alert("Could not reset plan right now. Please try again.");
      return;
    }

    // Delete the plan itself
    clearPlan();

    // Delete all per-day exercises and run-state keys for any old plan size
    clearAllDayExercises();
    clearAllRunStates();

    // Delete today sequence + complete flag
    clearCurrentDay();
    clearPlanComplete();

    // Clear weekly progress derived from old plan
    clearWeekCompletions();
    setWeekIndex(1);
    setWeeklyStreak(0);
    setWeekDoneFlag(false);

    // Clear mirrored logs so stale data cannot leak into a new plan
    clearLogs();

    // Reset state/UI
    setPlan(null);
    setPlanName("");
    setDayCount(3);
  };

  if (!plan) {
    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Plan</h1>
          <p className="text-neutral-400 text-sm">
            Create an active plan to get started.
          </p>
        </header>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4">
          <div className="space-y-1">
            <div className="text-sm text-neutral-300 font-semibold">Create manually</div>
            <p className="text-xs text-neutral-500">Create a plan from scratch.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Plan name</label>
            <input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="My workout plan"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Number of workouts</label>
            <div className="grid grid-cols-5 gap-2">
              {dayOptions.map((n) => (
                <button
                  key={n}
                  onClick={() => setDayCount(n)}
                  className={[
                    "rounded-xl py-3 text-sm font-semibold border transition active:scale-[0.99]",
                    n === dayCount
                      ? "bg-white text-black border-white"
                      : "bg-neutral-950 text-neutral-200 border-neutral-800",
                  ].join(" ")}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateManualPlan}
            className="w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold active:scale-[0.99]"
          >
            Create plan
          </button>

          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <div className="text-sm text-neutral-300 font-semibold">Or use template</div>
            <div className="space-y-2">
              {PLAN_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleCreateTemplatePlan(template)}
                  className="w-full text-left rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 active:scale-[0.99]"
                >
                  <div className="font-semibold">{template.name}</div>
                  <div className="text-xs text-neutral-400">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Active plan</h1>

        <button onClick={resetPlan} className="text-sm text-neutral-300 underline">
          Reset plan
        </button>
      </header>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4">
        <div>
          <div className="text-sm text-neutral-400">Name</div>
          <div className="text-lg font-semibold">{plan.name}</div>
        </div>

        <div className="space-y-2">
          {[...plan.days]
            .sort((a, b) => a.dayIndex - b.dayIndex)
            .map((day, index) => (
            <Link
              key={`${day.id}-${index}`}
              to={`/plan/day/${index + 1}`}
              className="block w-full text-left rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 active:scale-[0.99]"
            >
              {day.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}