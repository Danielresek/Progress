import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { EXERCISES, type Exercise } from "../data/exercises";
import { useWorkoutApi } from "../api/useWorkoutApi";
import { useActivePlan } from "../hooks/useActivePlan";
import type { DayExercise } from "../types";

export default function PlanDayPage() {
  const { dayId } = useParams();
  const { updateActivePlanDay } = useWorkoutApi();
  const { plan: activePlan, isLoading: isActivePlanLoading } = useActivePlan();

  const dayNumber = Number(dayId || "1");

  const hasDayId = Boolean(dayId);

  const [items, setItems] = useState<DayExercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Workout title
  const [dayTitle, setDayTitle] = useState<string>(`Workout ${dayNumber}`);

  // Avoid stacking setTimeout calls
  const saveTimeoutRef = useRef<number | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const hasHydratedRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const normalizeTitle = (title: string) => title.trim() || `Workout ${dayNumber}`;

  const mapItemsToRequestExercises = (next: DayExercise[]) =>
    next.map((item, index) => ({
      exerciseId: item.exerciseId,
      exerciseName: item.name,
      sortOrder: index + 1,
      sets: item.sets,
      reps: item.reps,
      startWeight: item.startWeight,
    }));

  const mapApiDayToItems = (
    day: NonNullable<typeof activePlan>["days"][number]
  ): DayExercise[] => {
    return [...day.exercises]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((exercise) => ({
        exerciseId: exercise.exerciseId,
        name: exercise.exerciseName,
        sets: exercise.sets,
        reps: exercise.reps,
        startWeight: exercise.startWeight,
      }));
  };

  // Persist to backend.
  const persist = (next: DayExercise[], titleOverride?: string) => {
    if (!hasDayId) return;

    const titleToSave = normalizeTitle(titleOverride ?? dayTitle);

    // Small "saving/saved" indicator
    setSaveState("saving");

    saveQueueRef.current = saveQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        await updateActivePlanDay(dayNumber, {
          name: titleToSave,
          exercises: mapItemsToRequestExercises(next),
        });

        if (saveTimeoutRef.current) {
          window.clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = window.setTimeout(() => {
          setSaveState("saved");
        }, 250);
      })
      .catch((error) => {
        console.error("Failed to save workout day", error);
        setSaveState("idle");
      });
  };

  // Load workout title from backend active plan.
  useEffect(() => {
    if (!hasDayId) return;
    if (isActivePlanLoading) return;
    if (isEditingTitle) return;

    const activeDay = activePlan?.days.find((d) => d.dayIndex === dayNumber);

    if (activeDay) {
      const title = activeDay.name?.trim() || `Workout ${dayNumber}`;
      setDayTitle(title);
      return;
    }

    setDayTitle(`Workout ${dayNumber}`);
  }, [dayNumber, activePlan, hasDayId, isActivePlanLoading, isEditingTitle]);

  // Save workout title in backend and mirror locally on success
  const saveDayTitle = (nextTitle: string) => {
    const normalized = normalizeTitle(nextTitle);
    setDayTitle(normalized);
    persist(items, normalized);
  };

  // Allow one hydration pass per day route.
  useEffect(() => {
    hasHydratedRef.current = false;
  }, [dayNumber, hasDayId]);

  // Hydrate exercises from backend active plan.
  useEffect(() => {
    if (!hasDayId) return;
    if (isActivePlanLoading) return;
    if (hasHydratedRef.current) return;

    const activeDay = activePlan?.days.find((d) => d.dayIndex === dayNumber);
    if (activeDay) {
      const backendItems = mapApiDayToItems(activeDay);
      setItems(backendItems);
      setSaveState("idle");
      hasHydratedRef.current = true;
      return;
    }

    setItems([]);
    setSaveState("idle");
    hasHydratedRef.current = true;
  }, [dayNumber, hasDayId, activePlan, isActivePlanLoading]);

  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!pickerOpen) return;
    searchInputRef.current?.focus();
  }, [pickerOpen]);

  useEffect(() => {
    if (!isEditingTitle) return;
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [isEditingTitle]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EXERCISES;
    return EXERCISES.filter((e) => e.name.toLowerCase().includes(q));
  }, [query]);

  // Add exercise (with default sets/reps/start weight)
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

  // Update sets/reps/start weight for an exercise
  const updateItem = (id: string, patch: Partial<DayExercise>) => {
    const next = items.map((x) => (x.exerciseId === id ? { ...x, ...patch } : x));
    setItems(next);
    persist(next);
  };

  // Reset day (delete all exercises)
  const resetDay = () => {
    if (!hasDayId) return;

    const ok = window.confirm("Do you want to delete all exercises in this workout?");
    if (!ok) return;

    persist([]);
    setItems([]);
  };

  // Remove exercise
  const removeItem = (id: string) => {
    const next = items.filter((x) => x.exerciseId !== id);
    setItems(next);
    persist(next);
  };

  // Move exercise up/down
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
            ← Back
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
            Reset workout
          </button>
        </div>

        {/* Workout title (editable) */}
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            value={dayTitle}
            onChange={(e) => setDayTitle(e.target.value)}
            onBlur={() => {
              saveDayTitle(dayTitle);
              setIsEditingTitle(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveDayTitle(dayTitle);
                setIsEditingTitle(false);
              }
            }}
            placeholder={`Workout ${dayNumber}`}
            className="w-full bg-transparent text-2xl font-bold outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingTitle(true)}
            className="w-full rounded-xl px-2 py-2 -mx-2 text-left active:scale-[0.99]"
            aria-label="Edit workout title"
          >
            <span className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold">{dayTitle}</span>
              <span className="text-neutral-400 text-base" aria-hidden>
                ✎
              </span>
            </span>
          </button>
        )}

        <p className="text-neutral-400 text-sm">
          Add exercises and set sets/reps/start weight (mock).
        </p>

        {saveState !== "idle" && (
          <div className="text-xs text-neutral-500">
            {saveState === "saving" && "Saving..."}
            {saveState === "saved" && "Saved ✅"}
          </div>
        )}
      </header>

      {pickerOpen && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Select exercise</div>
            <button
              onClick={() => {
                setPickerOpen(false);
                setQuery("");
              }}
              className="text-sm text-neutral-300"
            >
              Close
            </button>
          </div>

          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search... (e.g. bench)"
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

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-400">Exercises</div>
          <button
            onClick={() => setPickerOpen(true)}
            className="text-sm font-semibold rounded-xl bg-white text-black px-3 py-2 active:scale-[0.99]"
          >
            + Add
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 text-neutral-400 text-sm">
            No exercises added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((x, index) => (
              <div
                key={x.exerciseId}
                className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 space-y-3"
              >
                {/* Name on the left, controls on the right */}
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
                      title="Move up"
                      aria-label="Move up"
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
                      title="Move down"
                      aria-label="Move down"
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
                      title="Remove"
                      aria-label={`Remove ${x.name}`}
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

    </div>
  );
}