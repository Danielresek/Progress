import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EXERCISES } from "../data/exercises";
import { PLAN_TEMPLATES, type PlanTemplate } from "../data/templates";

type Plan = {
  name: string;
  days: string[];
};

type DayExercise = {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  startWeight: number;
};

const PLAN_KEY = "workouttracker.plan.v1";
const CURRENT_DAY_KEY = "workouttracker.currentDay.v1";
const PLAN_COMPLETE_KEY = "workouttracker.planComplete.v1";

function getDayKey(dayId: number) {
  return `workouttracker.plan.day.${dayId}.v1`;
}

function getRunKey(dayId: number) {
  return `workouttracker.run.day.${dayId}.v1`;
}

export default function PlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null);

  // form state
  const [planName, setPlanName] = useState("");
  const [dayCount, setDayCount] = useState(3);

  const dayOptions = useMemo(() => [2, 3, 4, 5, 6], []);
  const exerciseNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of EXERCISES) map.set(e.id, e.name);
    return map;
  }, []);

  // Last inn plan fra localStorage ved oppstart
  useEffect(() => {
    const raw = localStorage.getItem(PLAN_KEY);
    if (!raw) return;

    try {
      const parsed: Plan = JSON.parse(raw);
      if (parsed?.name && Array.isArray(parsed.days)) {
        setPlan(parsed);
      }
    } catch {
    }
  }, []);

  // Lagre plan til localStorage når plan endrer seg
  useEffect(() => {
    if (!plan) return;
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  }, [plan]);

  const createPlan = () => {
    const name = planName.trim() || "Min treningsplan";

    setPlan({
      name,
      days: Array.from({ length: dayCount }, (_, i) => `Økt ${i + 1}`),
    });

    // Når man oppretter ny plan: start sekvens fra 1
    localStorage.setItem(CURRENT_DAY_KEY, "1");
    localStorage.removeItem(PLAN_COMPLETE_KEY);
  };

  const createPlanFromTemplate = (template: PlanTemplate) => {
    const nextPlan: Plan = {
      name: template.name,
      days: template.days.map((d) => d.name),
    };

    setPlan(nextPlan);

    template.days.forEach((day, i) => {
      const dayItems: DayExercise[] = day.exercises.map((x) => ({
        exerciseId: x.exerciseId,
        name: exerciseNameById.get(x.exerciseId) ?? x.exerciseId,
        sets: x.sets,
        reps: x.reps,
        startWeight: x.startWeight ?? 0,
      }));

      localStorage.setItem(getDayKey(i + 1), JSON.stringify(dayItems));
      localStorage.removeItem(getRunKey(i + 1));
    });

    localStorage.setItem(CURRENT_DAY_KEY, "1");
    localStorage.removeItem(PLAN_COMPLETE_KEY);
  };

  const resetPlan = () => {
    const ok = window.confirm(
      "Dette vil slette planen og alle økter/øvelser. Er du sikker?"
    );
    if (!ok) return;

    const daysCount = plan?.days?.length ?? 0;

    // Slett selve planen
    localStorage.removeItem(PLAN_KEY);

    // Slett alle øvelser pr økt
    for (let i = 1; i <= daysCount; i++) {
      localStorage.removeItem(getDayKey(i));
    }

    // Slett run-state pr økt
    for (let i = 1; i <= daysCount; i++) {
      localStorage.removeItem(getRunKey(i));
    }

    // Slett today-sekvens + fullført-flagget
    localStorage.removeItem(CURRENT_DAY_KEY);
    localStorage.removeItem(PLAN_COMPLETE_KEY);

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
            Opprett en aktiv plan for å komme i gang.
          </p>
        </header>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4">
          <div className="space-y-1">
            <div className="text-sm text-neutral-300 font-semibold">Lag selv</div>
            <p className="text-xs text-neutral-500">Opprett en plan fra bunnen.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Navn på plan</label>
            <input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Min treningsplan"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Antall økter</label>
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
            onClick={createPlan}
            className="w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold active:scale-[0.99]"
          >
            Opprett plan
          </button>

          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <div className="text-sm text-neutral-300 font-semibold">Eller bruk mal</div>
            <div className="space-y-2">
              {PLAN_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => createPlanFromTemplate(template)}
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
        <h1 className="text-2xl font-bold">Aktiv plan</h1>

        <button onClick={resetPlan} className="text-sm text-neutral-300 underline">
          Reset plan
        </button>
      </header>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4">
        <div>
          <div className="text-sm text-neutral-400">Navn</div>
          <div className="text-lg font-semibold">{plan.name}</div>
        </div>

        <div className="space-y-2">
          {plan.days.map((day, index) => (
            <Link
              key={`${day}-${index}`}
              to={`/plan/day/${index + 1}`}
              className="block w-full text-left rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 active:scale-[0.99]"
            >
              {day}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}