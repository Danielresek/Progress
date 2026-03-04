import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { EXERCISES, type Exercise } from "../data/exercises";

type DayExercise = {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  startWeight: number;
};

type Plan = {
  name: string;
  days: string[];
};

const PLAN_KEY = "workouttracker.plan.v1";

export default function PlanDayPage() {
  const { dayId } = useParams();

  const dayNumber = Number(dayId || "1");

  // Key for denne økta (1,2,3 osv)
  const STORAGE_KEY = dayId ? `workouttracker.plan.day.${dayId}.v1` : null;

  const [items, setItems] = useState<DayExercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  // ✅ Økt-navn
  const [dayTitle, setDayTitle] = useState<string>(`Økt ${dayNumber}`);

  // for å unngå at setTimeout bygger seg opp
  const saveTimeoutRef = useRef<number | null>(null);

  // Hjelpefunksjon: lagrer til localStorage
  const persist = (next: DayExercise[]) => {
    if (!STORAGE_KEY) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    // liten “lagrer/lagret” animasjon
    setSaveState("saving");

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      setSaveState("saved");
    }, 250);
  };

  // Last inn økt-navn fra planen (workouttracker.plan.v1)
  useEffect(() => {
    const raw = localStorage.getItem(PLAN_KEY);
    if (!raw) {
      setDayTitle(`Økt ${dayNumber}`);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Plan;
      const title = parsed?.days?.[dayNumber - 1];
      if (typeof title === "string" && title.trim()) {
        setDayTitle(title);
      } else {
        setDayTitle(`Økt ${dayNumber}`);
      }
    } catch {
      setDayTitle(`Økt ${dayNumber}`);
    }
  }, [dayNumber]);

  // Lagre økt-navn inn i plan.days[]
  const saveDayTitle = (nextTitle: string) => {
    const raw = localStorage.getItem(PLAN_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Plan;
      if (!parsed?.days || !Array.isArray(parsed.days)) return;

      const copy = [...parsed.days];
      copy[dayNumber - 1] = nextTitle.trim() || `Økt ${dayNumber}`;

      const nextPlan: Plan = { ...parsed, days: copy };
      localStorage.setItem(PLAN_KEY, JSON.stringify(nextPlan));
    } catch {
    }
  };

  // Last inn fra localStorage når siden åpnes / dayId endres
  useEffect(() => {
    if (!STORAGE_KEY) return;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setItems([]);
      setSaveState("idle");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setItems(Array.isArray(parsed) ? parsed : []);
      setSaveState("idle");
    } catch {
      setItems([]);
      setSaveState("idle");
    }
  }, [STORAGE_KEY]);

  // Rydd opp timeout når komponenten unmountes
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EXERCISES;
    return EXERCISES.filter((e) => e.name.toLowerCase().includes(q));
  }, [query]);

  // Legg til øvelse (med default sets/reps/startvekt)
  const addExercise = (e: Exercise) => {
    if (items.some((x) => x.exerciseId === e.id)) return;

    const next: DayExercise[] = [
      ...items,
      {
        exerciseId: e.id,
        name: e.name,
        sets: 3,
        reps: 8,
        startWeight: 0,
      },
    ];

    setItems(next);
    persist(next);

    setPickerOpen(false);
    setQuery("");
  };

  // Oppdater sets/reps/startvekt for en øvelse
  const updateItem = (id: string, patch: Partial<DayExercise>) => {
    const next = items.map((x) => (x.exerciseId === id ? { ...x, ...patch } : x));
    setItems(next);
    persist(next);
  };

  // Reset dag (slett alle øvelser)
  const resetDay = () => {
    if (!STORAGE_KEY) return;

    const ok = window.confirm("Vil du slette alle øvelser i denne økta?");
    if (!ok) return;

    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
    setSaveState("idle");
  };

  // Fjern øvelse
  const removeItem = (id: string) => {
    const next = items.filter((x) => x.exerciseId !== id);
    setItems(next);
    persist(next);
  };

  // Flytt øvelse opp/ned
  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const next = [...items];
    const temp = next[index];
    next[index] = next[newIndex];
    next[newIndex] = temp;

    setItems(next);
    persist(next);
  };

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <Link to="/plan" className="text-sm text-neutral-400">
            ← Tilbake
          </Link>

          <button
            onClick={resetDay}
            disabled={items.length === 0}
            className={[
              "text-sm underline underline-offset-4",
              items.length === 0
                ? "text-neutral-600 cursor-not-allowed"
                : "text-neutral-300",
            ].join(" ")}
          >
            Reset økt
          </button>
        </div>

        {/* Økt-navn (redigerbart) */}
        <input
          value={dayTitle}
          onChange={(e) => setDayTitle(e.target.value)}
          onBlur={() => saveDayTitle(dayTitle)}
          placeholder={`Økt ${dayNumber}`}
          className="w-full bg-transparent text-2xl font-bold outline-none"
        />

        <p className="text-neutral-400 text-sm">
          Legg til øvelser og sett sets/reps/startvekt (mock).
        </p>

        {saveState !== "idle" && (
          <div className="text-xs text-neutral-500">
            {saveState === "saving" && "Lagrer…"}
            {saveState === "saved" && "Lagret ✅"}
          </div>
        )}
      </header>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-400">Øvelser</div>
          <button
            onClick={() => setPickerOpen(true)}
            className="text-sm font-semibold rounded-xl bg-white text-black px-3 py-2 active:scale-[0.99]"
          >
            + Legg til
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 text-neutral-400 text-sm">
            Ingen øvelser lagt til enda.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((x, index) => (
              <div
                key={x.exerciseId}
                className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 space-y-3"
              >
                {/* Navn til venstre, knapper til høyre */}
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{x.name}</div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0}
                      className={[
                        "h-10 w-10 rounded-xl border border-neutral-800 bg-neutral-900/60",
                        "grid place-items-center text-lg leading-none",
                        "active:scale-[0.98]",
                        index === 0
                          ? "text-neutral-700 cursor-not-allowed"
                          : "text-neutral-200 hover:bg-neutral-900",
                      ].join(" ")}
                      title="Flytt opp"
                      aria-label="Flytt opp"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() => moveItem(index, "down")}
                      disabled={index === items.length - 1}
                      className={[
                        "h-10 w-10 rounded-xl border border-neutral-800 bg-neutral-900/60",
                        "grid place-items-center text-lg leading-none",
                        "active:scale-[0.98]",
                        index === items.length - 1
                          ? "text-neutral-700 cursor-not-allowed"
                          : "text-neutral-200 hover:bg-neutral-900",
                      ].join(" ")}
                      title="Flytt ned"
                      aria-label="Flytt ned"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(x.exerciseId)}
                      className={[
                        "h-10 w-10 rounded-xl border border-neutral-800 bg-neutral-900/60",
                        "grid place-items-center text-lg leading-none",
                        "active:scale-[0.98]",
                        "text-neutral-200 hover:bg-neutral-900 hover:text-white",
                      ].join(" ")}
                      title="Fjern"
                      aria-label={`Fjern ${x.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <div className="text-xs text-neutral-400">Sets</div>
                    <input
                      type="number"
                      min={1}
                      value={x.sets === 0 ? "" : x.sets}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateItem(x.exerciseId, {
                          sets: value === "" ? 0 : Number(value),
                        });
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-full rounded-xl bg-black/40 border border-neutral-800 px-3 py-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-neutral-400">Reps</div>
                    <input
                      type="number"
                      min={1}
                      value={x.reps === 0 ? "" : x.reps}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateItem(x.exerciseId, {
                          reps: value === "" ? 0 : Number(value),
                        });
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-full rounded-xl bg-black/40 border border-neutral-800 px-3 py-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-neutral-400">Start kg</div>
                    <input
                      type="number"
                      min={0}
                      value={x.startWeight === 0 ? "" : x.startWeight}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateItem(x.exerciseId, {
                          startWeight: value === "" ? 0 : Number(value),
                        });
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-full rounded-xl bg-black/40 border border-neutral-800 px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pickerOpen && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Velg øvelse</div>
            <button
              onClick={() => {
                setPickerOpen(false);
                setQuery("");
              }}
              className="text-sm text-neutral-300"
            >
              Lukk
            </button>
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk… (f.eks benk)"
            className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-600"
          />

          <div className="max-h-80 overflow-auto space-y-2">
            {filtered.map((e) => (
              <button
                key={e.id}
                onClick={() => addExercise(e)}
                className="w-full text-left rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 active:scale-[0.99]"
              >
                <div className="font-semibold">{e.name}</div>
                <div className="text-xs text-neutral-400">{e.muscleGroup}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}