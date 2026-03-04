import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
const WEEK_DONE_KEY = "workouttracker.weekJustCompleted.v1";

function getDayKey(dayId: number) {
  return `workouttracker.plan.day.${dayId}.v1`;
}

export default function TodayPage() {
  const navigate = useNavigate();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [dayId, setDayId] = useState<number>(1);
  const [dayItems, setDayItems] = useState<DayExercise[]>([]);
  const [planComplete, setPlanComplete] = useState<boolean>(false);
  const [weekJustCompleted, setWeekJustCompleted] = useState(false);

  // Vis "Uka er fullført!"-melding hvis vi nettopp har fullført uka
  useEffect(() => {
    const raw = localStorage.getItem(WEEK_DONE_KEY);
    if (raw === "1") {
      setWeekJustCompleted(true);
      localStorage.removeItem(WEEK_DONE_KEY);
    }
  }, []);

  // 1) Les aktiv plan
  useEffect(() => {
    const raw = localStorage.getItem(PLAN_KEY);
    if (!raw) {
      setPlan(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed?.days || !Array.isArray(parsed.days)) {
        setPlan(null);
        return;
      }
      setPlan(parsed);
    } catch {
      setPlan(null);
    }
  }, []);

  // Les om plan er fullført
  useEffect(() => {
    const raw = localStorage.getItem(PLAN_COMPLETE_KEY);
    setPlanComplete(raw === "1");
  }, []);

  // Les "neste økt" (sekvens)
  useEffect(() => {
    const raw = localStorage.getItem(CURRENT_DAY_KEY);
    if (!raw) {
      setDayId(1);
      return;
    }

    const parsed = Number(raw);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setDayId(parsed);
    } else {
      setDayId(1);
    }
  }, []);

  // Clamp dayId mot antall økter i planen
  useEffect(() => {
    if (!plan) return;

    const max = plan.days.length;

    if (dayId < 1) {
      setDayId(1);
      localStorage.setItem(CURRENT_DAY_KEY, "1");
      return;
    }

    if (dayId > max) {
      setDayId(1);
      localStorage.setItem(CURRENT_DAY_KEY, "1");
    }
  }, [plan, dayId]);

  // Les øvelser for "neste økt"
  useEffect(() => {
    const raw = localStorage.getItem(getDayKey(dayId));
    if (!raw) {
      setDayItems([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setDayItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setDayItems([]);
    }
  }, [dayId]);

  const dayTitle = useMemo(() => {
    if (!plan?.days?.length) return `Økt ${dayId}`;
    return plan.days[dayId - 1] ?? `Økt ${dayId}`;
  }, [plan, dayId]);

  const firstDayTitle = useMemo(() => {
  if (!plan?.days?.length) return "Økt 1";
  return plan.days[0] ?? "Økt 1";
}, [plan]);

  // Reset plan (start på nytt)
  const restartPlan = () => {
    const ok = window.confirm(
      "Dette vil sette deg tilbake til Økt 1. Er du sikker?"
    );
    if (!ok) return;

    localStorage.setItem(CURRENT_DAY_KEY, "1");
    localStorage.removeItem(PLAN_COMPLETE_KEY);

    // Fjern run-state for alle økter
    if (plan?.days?.length) {
      for (let i = 1; i <= plan.days.length; i++) {
        localStorage.removeItem(`workouttracker.run.day.${i}.v1`);
      }
    }

    setPlanComplete(false);
    setDayId(1);
  };

  // Hvis ingen aktiv plan
  if (!plan) {
    return (
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-neutral-400 text-sm">
            Du har ingen aktiv plan enda.
          </p>
        </header>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
          <div className="text-sm text-neutral-300">
            Gå til Plan for å opprette en plan først.
          </div>

          <Link
            to="/plan"
            className="block text-center w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold active:scale-[0.99]"
          >
            Gå til Plan
          </Link>
        </div>
      </div>
    );
  }

  // Hvis planen er markert som fullført
  if (planComplete) {
    return (
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-neutral-400 text-sm">Planen er fullført 🎉</p>
        </header>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
          <div className="text-sm text-neutral-300">
            Bra jobba! Vil du starte planen på nytt fra Økt 1?
          </div>

          <button
            onClick={restartPlan}
            className="w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold active:scale-[0.99]"
          >
            Start planen på nytt
          </button>

          <Link
            to="/plan"
            className="block text-center w-full rounded-2xl bg-neutral-800 py-4 text-lg font-semibold active:scale-[0.99]"
          >
            Rediger plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Today</h1>
        <p className="text-neutral-400 text-sm">Neste økt i planen din.</p>
        {weekJustCompleted && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-3 text-sm text-neutral-200">
            <span className="font-semibold">Uke fullført 🎉</span>{" "}
            Starter på <span className="font-semibold">{firstDayTitle}</span> igjen.
          </div>
        )}
      </header>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
        {/* Økt header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-400">Neste økt</div>
            <div className="text-lg font-semibold">{dayTitle}</div>

            <div className="text-xs text-neutral-500 mt-1">
              Øvelser i økta: {dayItems.length}
            </div>
          </div>

          <span className="text-xs rounded-full border border-neutral-700 px-3 py-1 text-neutral-300">
            Økt {dayId}
          </span>
        </div>

        {/* Øvelser i økta */}
          {dayItems.length > 0 ? (
            <div className="rounded-xl bg-black/30 border border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs uppercase tracking-wider text-neutral-500">
                  Øvelser
                </div>
                <div className="text-xs text-neutral-600">
                  {dayItems.length} totalt
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
              Det ligger ingen øvelser i {dayTitle} enda. Gå til Plan og legg til.
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
          Start økta
        </button>

        <Link
          to={`/plan/day/${dayId}`}
          className="block text-center w-full rounded-2xl bg-neutral-800 py-4 text-lg font-semibold active:scale-[0.99]"
        >
          Rediger denne økta
        </Link>

        {/* Diskret reset */}
        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={restartPlan}
            className="text-xs underline underline-offset-4 transition text-neutral-500 hover:text-neutral-300"
          >
            Start planen på nytt
          </button>
        </div>
      </div>
    </div>
  );
}