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
const PLAN_COMPLETE_KEY = "workouttracker.planComplete.v1"; // vi bruker ikke dette lenger (men vi rydder det bort)
const LOG_KEY = "workouttracker.logs.v1";
const WEEK_DONE_KEY = "workouttracker.weekJustCompleted.v1";

function getDayKey(dayId: number) {
  return `workouttracker.plan.day.${dayId}.v1`;
}

function getRunKey(dayId: number) {
  return `workouttracker.run.day.${dayId}.v1`;
}

function readLogs(): LogEntry[] {
  const raw = localStorage.getItem(LOG_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LogEntry[]) : [];
  } catch {
    return [];
  }
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

  const [formError, setFormError] = useState<string>("");

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

  // Finn siste logg for denne øvelsen (på tvers av økter/uker)
  const last = useMemo(() => {
    if (!current) return null;

    const logs = readLogs();
    const found = logs
      .filter((l) => l.exerciseId === current.exerciseId)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    return found ?? null;
  }, [current?.exerciseId]);

  // (valgfritt men nice): når vi bytter øvelse, nullstill error og inputs
  useEffect(() => {
    setFormError("");
    setKg("");
    setReps("");
  }, [current?.exerciseId]);

  const toNumberOrNull = (value: string) => {
  const cleaned = value.replace(",", ".").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const setKgSafe = (n: number) => {
  // viser alltid med punktum, men du kan gjøre den mer fancy senere
  setKg(String(n));
};

const applyLast = () => {
  if (!last) return;
  setKgSafe(last.performedWeight);
  setReps(String(last.performedReps));
  setFormError("");
};

const bumpKg = (delta: number) => {
  // 1) prøv kg-feltet
  const currentKg = toNumberOrNull(kg);

  // 2) hvis tom/ugyldig: bruk sist kg om finnes, ellers 0
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

  const saveAndNext = () => {
    if (!current) return;

    const performedWeight = parsePositiveNumber(kg);
    const performedReps = parsePositiveNumber(reps);

    if (performedWeight === null || performedReps === null) {
      setFormError("Fyll inn både kg og reps (tall større enn 0) før du lagrer.");
      return;
    }

    const entry: LogEntry = {
      dayId,
      exerciseId: current.exerciseId,
      performedWeight,
      performedReps,
      timestamp: Date.now(),
    };

    const logs = readLogs();
    logs.push(entry);
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));

    // reset inputs + error
    setKg("");
    setReps("");
    setFormError("");

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
    setFormError("");
  };

  // Lagre og lukk: flytt sekvensen til neste økt (eller loop til økt 1) og gå tilbake til Today
  const saveAndClose = () => {
    const totalDays = plan?.days?.length ?? 0;

    // rydd run-state for denne økta
    localStorage.removeItem(getRunKey(dayId));

    // VIKTIG: sørg for at "plan complete"-visningen aldri trigger
    localStorage.removeItem(PLAN_COMPLETE_KEY);

    if (!totalDays) {
      navigate("/today");
      return;
    }

    const nextDay = dayId + 1;

    if (nextDay > totalDays) {
      // LOOP: ny uke starter
      localStorage.setItem(CURRENT_DAY_KEY, "1");
      localStorage.setItem(WEEK_DONE_KEY, "1"); // toast på Today
    } else {
      localStorage.setItem(CURRENT_DAY_KEY, String(nextDay));
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

          <div className="flex justify-between">
            <span className="text-neutral-400">Sist</span>
            <span>
              {last
                ? `${last.performedWeight} kg × ${last.performedReps}`
                : "—"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-neutral-400">Kg (faktisk)</div>
            <input
              value={kg}
              onChange={(e) => {
                setKg(e.target.value);
                if (formError) setFormError("");
              }}
              inputMode="decimal"
              placeholder="f.eks 100"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-600"
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs text-neutral-400">Reps (faktisk)</div>
            <input
              value={reps}
              onChange={(e) => {
                setReps(e.target.value);
                if (formError) setFormError("");
              }}
              inputMode="numeric"
              placeholder="f.eks 8"
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
            Bruk sist
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
        
        {formError && (
          <div className="text-sm text-red-300">{formError}</div>
        )}

        <button
          onClick={saveAndNext}
          disabled={!canSave}
          className={[
            "w-full rounded-2xl py-4 text-lg font-semibold active:scale-[0.99]",
            canSave
              ? "bg-white text-black"
              : "bg-neutral-800 text-neutral-500 cursor-not-allowed",
          ].join(" ")}
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