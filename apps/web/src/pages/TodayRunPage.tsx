import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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

type LogEntry = {
  dayId: number;
  exerciseId: string;
  performedWeight: number;
  performedReps: number;
  timestamp: number;
};

const PLAN_KEY = "workouttracker.plan.v1";
const CURRENT_DAY_KEY = "workouttracker.currentDay.v1";
const PLAN_COMPLETE_KEY = "workouttracker.planComplete.v1";
const LOG_KEY = "workouttracker.logs.v1";

function getDayKey(dayId: number) {
  return `workouttracker.plan.day.${dayId}.v1`;
}

function getRunKey(dayId: number) {
  return `workouttracker.run.day.${dayId}.v1`;
}

function getLogKey() {
  return LOG_KEY;
}

export default function TodayRunPage() {
  const navigate = useNavigate();
  const params = useParams();
  const dayId = Number(params.dayId || "1");

  const [plan, setPlan] = useState<Plan | null>(null);
  const [items, setItems] = useState<DayExercise[]>([]);
  const [index, setIndex] = useState<number>(0);

  const [kg, setKg] = useState<string>("");
  const [reps, setReps] = useState<string>("");

  // Les plan (for å få navn på økta + antall økter)
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

  const dayTitle = useMemo(() => {
    if (!plan?.days?.length) return `Økt ${dayId}`;
    return plan.days[dayId - 1] ?? `Økt ${dayId}`;
  }, [plan, dayId]);

  // Last øvelser for dagen
  useEffect(() => {
    const raw = localStorage.getItem(getDayKey(dayId));
    if (!raw) {
      setItems([]);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setItems([]);
    }
  }, [dayId]);

  // Last "hvor langt du kom" i økta (index)
  useEffect(() => {
    const raw = localStorage.getItem(getRunKey(dayId));
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.index === "number") setIndex(parsed.index);
    } catch {
      // ignore
    }
  }, [dayId]);

  // Når index endrer seg: lagre den
  useEffect(() => {
    localStorage.setItem(getRunKey(dayId), JSON.stringify({ index }));
  }, [dayId, index]);

  const current = useMemo(() => items[index] ?? null, [items, index]);

  // Hent siste logg for øvelsen (på tvers av økter/uker)
  const getLastForExercise = (exerciseId: string) => {
    const raw = localStorage.getItem(getLogKey());
    if (!raw) return null;

    try {
      const logs = JSON.parse(raw) as LogEntry[];
      if (!Array.isArray(logs)) return null;

      const last = logs
        .filter((l) => l.exerciseId === exerciseId)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      return last ?? null;
    } catch {
      return null;
    }
  };

  const last = useMemo(() => {
    if (!current) return null;
    return getLastForExercise(current.exerciseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.exerciseId]);

  const saveAndNext = () => {
    if (!current) return;

    const performedWeight = kg.trim() === "" ? 0 : Number(kg);
    const performedReps = reps.trim() === "" ? 0 : Number(reps);

    const entry: LogEntry = {
      dayId,
      exerciseId: current.exerciseId,
      performedWeight,
      performedReps,
      timestamp: Date.now(),
    };

    const raw = localStorage.getItem(getLogKey());
    let logs: LogEntry[] = [];
    try {
      logs = raw ? (JSON.parse(raw) as LogEntry[]) : [];
      if (!Array.isArray(logs)) logs = [];
    } catch {
      logs = [];
    }

    logs.push(entry);
    localStorage.setItem(getLogKey(), JSON.stringify(logs));

    // reset inputs
    setKg("");
    setReps("");

    // neste øvelse
    const nextIndex = index + 1;
    if (nextIndex >= items.length) {
      setIndex(items.length); // ferdig
      return;
    }
    setIndex(nextIndex);
  };

  const resetRun = () => {
    const ok = window.confirm("Vil du starte økta på nytt?");
    if (!ok) return;

    localStorage.removeItem(getRunKey(dayId));
    setIndex(0);
    setKg("");
    setReps("");
  };

  // Lagre og lukk: flytt sekvensen til neste økt (eller markér plan fullført) og gå tilbake til Today
  const saveAndClose = () => {
    const totalDays = plan?.days?.length ?? 0;

    // uansett: vi er ferdig/avslutter → rydd run-state for denne økta
    localStorage.removeItem(getRunKey(dayId));

    // hvis vi ikke har en plan å støtte oss på: bare tilbake til Today
    if (!totalDays) {
      navigate("/today");
      return;
    }

    const nextDay = dayId + 1;

    if (nextDay > totalDays) {
    // LOOP: ny uke starter
    localStorage.setItem(CURRENT_DAY_KEY, "1");
    localStorage.removeItem(PLAN_COMPLETE_KEY);

    // valgfritt: flagg for en "uke fullført" toast på Today
    localStorage.setItem("workouttracker.weekJustCompleted.v1", "1");
  } else {
    localStorage.setItem(CURRENT_DAY_KEY, String(nextDay));
    localStorage.removeItem(PLAN_COMPLETE_KEY);
  }

  navigate("/today");
  };

  if (!items.length) {
    return (
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Gjennomfør økt</h1>
          <p className="text-neutral-400 text-sm">
            Fant ingen øvelser i {dayTitle}. Legg til øvelser i Plan først.
          </p>
        </header>

        <Link
          to={`/plan/day/${dayId}`}
          className="block text-center w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold active:scale-[0.99]"
        >
          Gå til Plan for {dayTitle}
        </Link>
      </div>
    );
  }

  // ferdig med økta
  if (index >= items.length) {
    return (
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">{dayTitle} fullført ✅</h1>
          <p className="text-neutral-400 text-sm">
            Vil du lagre og gå tilbake til Today, eller starte økta på nytt?
          </p>
        </header>

        <button
          onClick={saveAndClose}
          className="w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold active:scale-[0.99]"
        >
          Lagre og lukk
        </button>

        <button
          onClick={resetRun}
          className="w-full rounded-2xl bg-neutral-800 py-4 text-lg font-semibold active:scale-[0.99]"
        >
          Start økta på nytt
        </button>

        <Link
          to="/today"
          className="block text-center w-full rounded-2xl bg-neutral-900 border border-neutral-800 py-4 text-lg font-semibold active:scale-[0.99]"
        >
          Tilbake til Today
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <Link to="/today" className="text-sm text-neutral-400">
          ← Tilbake
        </Link>

        <h1 className="text-2xl font-bold">{dayTitle}</h1>
        <p className="text-neutral-400 text-sm">
          Øvelse {index + 1} av {items.length}
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4">
        <div>
          <div className="text-sm text-neutral-400">Øvelse</div>
          <div className="text-xl font-semibold">{current?.name}</div>
        </div>

        <div className="rounded-xl bg-black/30 border border-neutral-800 p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-neutral-400">Plan</span>
            <span>
              {current?.sets} x {current?.reps}
            </span>
          </div>

          {/* Bytter ut "Start kg" med "Sist" */}
          <div className="flex justify-between">
            <span className="text-neutral-400">Sist</span>
            <span>
              {last ? `${last.performedWeight || 0} kg × ${last.performedReps || 0}` : "—"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-neutral-400">Kg (faktisk)</div>
            <input
              value={kg}
              onChange={(e) => setKg(e.target.value)}
              inputMode="numeric"
              placeholder="f.eks 100"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-600"
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs text-neutral-400">Reps (faktisk)</div>
            <input
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              inputMode="numeric"
              placeholder="f.eks 8"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-600"
            />
          </div>
        </div>

        <button
          onClick={saveAndNext}
          className="w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold active:scale-[0.99]"
        >
          Lagre og neste
        </button>

        <button
          onClick={resetRun}
          className="w-full rounded-2xl bg-neutral-800 py-4 text-lg font-semibold active:scale-[0.99]"
        >
          Start økta på nytt
        </button>
      </div>
    </div>
  );
}