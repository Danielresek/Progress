import { useEffect, useMemo, useState } from "react";
import { EXERCISES } from "../data/exercises";
import { useWorkoutApi } from "../api/useWorkoutApi";
import type { LogEntry } from "../types";
import type { WorkoutLogResponse } from "../api/workoutApi";
import { clearLogs } from "../storage/logStorage";

function formatDate(ts: number) {
  try {
    return new Intl.DateTimeFormat("no-NO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleDateString();
  }
}

function formatWeight(value: number) {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function volume(weight: number, reps: number) {
  if (!Number.isFinite(weight) || !Number.isFinite(reps)) return 0;
  if (weight <= 0 || reps <= 0) return 0;
  return weight * reps;
}

/** Simple sparkline without libraries */
function Sparkline({
  values,
  width = 220,
  height = 44,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  const cleaned = values.filter((v) => Number.isFinite(v));
  if (cleaned.length < 2) {
    return (
      <div className="h-11 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-center text-xs text-neutral-500">
        Not enough data for chart
      </div>
    );
  }

  const minV = Math.min(...cleaned);
  const maxV = Math.max(...cleaned);
  const range = maxV - minV || 1;

  const pad = 6;
  const w = width;
  const h = height;

  const points = cleaned.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (cleaned.length - 1);
    const y = pad + (h - pad * 2) * (1 - (v - minV) / range);
    return { x, y };
  });

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const last = points[points.length - 1];

  return (
    <div className="rounded-xl bg-neutral-950/60 border border-neutral-800 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wider text-neutral-500">
          Trend (kg)
        </div>
        <div className="text-xs text-neutral-600">
          {formatWeight(minV)}–{formatWeight(maxV)}
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block">
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          className="text-neutral-300"
          strokeWidth="2"
        />
        <circle cx={last.x} cy={last.y} r="3.5" className="fill-white" />
      </svg>
    </div>
  );
}

export default function ProgressPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const { getLogs, resetLogs: resetLogsRequest } = useWorkoutApi();

  const mapApiLogToLocalLog = (log: WorkoutLogResponse): LogEntry => {
    const parsedTs = Date.parse(log.loggedAtUtc);
    const dayMatch = log.planDayName.match(/(\d+)$/);
    const parsedDay = dayMatch ? Number(dayMatch[1]) : NaN;

    return {
      dayId: Number.isFinite(parsedDay) && parsedDay > 0 ? parsedDay : 1,
      exerciseId: log.exerciseId,
      performedWeight: log.performedWeight,
      performedReps: log.performedReps,
      timestamp: Number.isFinite(parsedTs) ? parsedTs : Date.now(),
      weekIndex: log.weekIndex,
    };
  };

  useEffect(() => {
    let cancelled = false;

    const loadLogs = async () => {
      try {
        const apiLogs = await getLogs();
        if (!cancelled) {
          setLogs(apiLogs.map(mapApiLogToLocalLog));
        }
      } catch (error) {
        console.error("Failed to load workout logs", error);
        if (!cancelled) {
          setLogs([]);
        }
      }
    };

    loadLogs();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // map id -> name
  const exerciseNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of EXERCISES) map.set(e.id, e.name);
    return map;
  }, []);

  const allLogs = useMemo(() => {
    return logs
      .filter(
        (x) =>
          x &&
          typeof x.exerciseId === "string" &&
          typeof x.performedWeight === "number" &&
          typeof x.performedReps === "number" &&
          typeof x.timestamp === "number"
      )
      .map((x) => ({
        ...x,
        performedWeight: Number.isFinite(x.performedWeight) ? x.performedWeight : 0,
        performedReps: Number.isFinite(x.performedReps) ? x.performedReps : 0,
      }))
      .filter((x) => x.exerciseId.length > 0);
  }, [logs]);

  const exercisesWithLogs = useMemo(() => {
    const set = new Set<string>();
    for (const l of allLogs) set.add(l.exerciseId);

    const arr = Array.from(set).map((id) => ({
      id,
      name: exerciseNameById.get(id) ?? id,
    }));

    arr.sort((a, b) => a.name.localeCompare(b.name, "no"));
    return arr;
  }, [allLogs, exerciseNameById]);

  // ensure selected value is valid when logs load / change
  useEffect(() => {
    if (!exercisesWithLogs.length) return;
    setSelectedExerciseId((prev) => {
      const exists = exercisesWithLogs.some((x) => x.id === prev);
      return exists ? prev : exercisesWithLogs[0].id;
    });
  }, [exercisesWithLogs]);

  const safeSelected = useMemo(() => {
    if (!exercisesWithLogs.length) return "";
    const exists = exercisesWithLogs.some((x) => x.id === selectedExerciseId);
    return exists ? selectedExerciseId : exercisesWithLogs[0].id;
  }, [exercisesWithLogs, selectedExerciseId]);

  const selectedName =
    exercisesWithLogs.find((x) => x.id === safeSelected)?.name ?? "Exercise";

  const entries = useMemo(() => {
    return allLogs
      .filter((l) => l.exerciseId === safeSelected)
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [allLogs, safeSelected]);

  // PR flags: only show PR on the log that actually set a new record
  const prFlags = useMemo(() => {
    const chronological = entries
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp); // oldest -> newest

    let bestW = 0;
    let bestR = 0;

    const prWeightTs = new Set<number>();
    const prRepsTs = new Set<number>();

    for (const e of chronological) {
      if (e.performedWeight > bestW) {
        bestW = e.performedWeight;
        prWeightTs.add(e.timestamp);
      }
      if (e.performedReps > bestR) {
        bestR = e.performedReps;
        prRepsTs.add(e.timestamp);
      }
    }

    return { prWeightTs, prRepsTs };
  }, [entries]);

  const stats = useMemo(() => {
    if (!entries.length) {
      return {
        total: 0,
        bestWeight: 0,
        bestReps: 0,
        lastDate: "",
      };
    }

    let bestWeight = 0;
    let bestReps = 0;

    for (const e of entries) {
      bestWeight = Math.max(bestWeight, e.performedWeight);
      bestReps = Math.max(bestReps, e.performedReps);
    }

    return {
      total: entries.length,
      bestWeight,
      bestReps,
      lastDate: formatDate(entries[0].timestamp),
    };
  }, [entries]);

  const strengthScore = useMemo(() => {
  // 1) Best volume set per exercise (all time)
  const bestAllTime = new Map<string, number>();
  for (const l of allLogs) {
    const v = volume(l.performedWeight, l.performedReps);
    const prev = bestAllTime.get(l.exerciseId) ?? 0;
    if (v > prev) bestAllTime.set(l.exerciseId, v);
  }
  const allTimeScore = Array.from(bestAllTime.values()).reduce((a, b) => a + b, 0);

  // 2) Find latest app week from logs (not calendar week)
  const weeks = allLogs
    .map((l) => l.weekIndex)
    .filter((w): w is number => typeof w === "number" && Number.isFinite(w));

  // If weekIndex is missing on logs, fall back to "first week"
  const latestWeek = weeks.length > 0 ? Math.max(...weeks) : 1;
  const prevWeek = latestWeek - 1;

  // 3) Best volume set per exercise (this week / previous week)
  const bestThisWeek = new Map<string, number>();
  const bestLastWeek = new Map<string, number>();

  for (const l of allLogs) {
    const v = volume(l.performedWeight, l.performedReps);

    if ((l.weekIndex ?? -999) === latestWeek) {
      const prev = bestThisWeek.get(l.exerciseId) ?? 0;
      if (v > prev) bestThisWeek.set(l.exerciseId, v);
    }

    if ((l.weekIndex ?? -999) === prevWeek) {
      const prev = bestLastWeek.get(l.exerciseId) ?? 0;
      if (v > prev) bestLastWeek.set(l.exerciseId, v);
    }
  }

  const thisWeekScore = Array.from(bestThisWeek.values()).reduce((a, b) => a + b, 0);
  const lastWeekScore = Array.from(bestLastWeek.values()).reduce((a, b) => a + b, 0);
  const delta = thisWeekScore - lastWeekScore;

  return {
    allTimeScore,
    thisWeekScore,
    lastWeekScore,
    delta,
    latestWeek,
  };
}, [allLogs]);

  const trendValues = useMemo(() => {
    const lastN = entries.slice(0, 12).slice().reverse();
    return lastN.map((x) => x.performedWeight);
  }, [entries]);

  const resetLogs = async () => {
    const ok = window.confirm(
      "This deletes all history and PR data. Cannot be undone.\n\nDo you want to continue?"
    );
    if (!ok) return;

    try {
      await resetLogsRequest();
    } catch (error) {
      console.error("Failed to reset workout logs", error);
      window.alert("Could not reset data right now. Please try again.");
      return;
    }

    clearLogs();
    setLogs([]);
    setSelectedExerciseId("");
  };

  // Empty state: no logs at all
  if (!allLogs.length) {
    return (
      <div className="space-y-4">
        <header className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Progress</h1>
            <p className="text-neutral-400 text-sm">
              After you complete a workout in Today, history appears here.
            </p>
          </div>

          <button
            onClick={resetLogs}
            className="text-xs underline underline-offset-4 text-neutral-600 hover:text-neutral-300"
          >
            Reset data
          </button>
        </header>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
          <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 text-neutral-300 text-sm">
            No logs yet. Start a workout in{" "}
            <span className="font-semibold text-white">Today</span> and press
            "Save and next" to create your first entry.
          </div>
        </div>
      </div>
    );
  }

  if (!safeSelected) {
    return (
      <div className="space-y-4">
        <header className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Progress</h1>
            <p className="text-neutral-400 text-sm">
              Logs found, but no exercise to select.
            </p>
          </div>

          <button
            onClick={resetLogs}
            className="text-xs underline underline-offset-4 text-neutral-600 hover:text-neutral-300"
          >
            Reset data
          </button>
        </header>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Progress</h1>
          <p className="text-neutral-400 text-sm">
            Select an exercise to view PR and history.
          </p>
        </div>

        <button
          onClick={resetLogs}
          className="text-xs underline underline-offset-4 text-neutral-500 hover:text-neutral-300"
        >
          Reset data
        </button>
      </header>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4">
        {/* Select exercise */}
        <div className="space-y-2">
          <div className="text-sm text-neutral-400">Exercise</div>
          <select
            value={safeSelected}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-3 text-white"
          >
            {exercisesWithLogs.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-neutral-950/60 border border-neutral-800 p-4">
            <div className="text-xs uppercase tracking-wider text-neutral-500">
              Best weight
            </div>
            <div className="text-2xl font-bold mt-1">
              {formatWeight(stats.bestWeight)}{" "}
              <span className="text-neutral-400 text-base">kg</span>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-950/60 border border-neutral-800 p-4">
            <div className="text-xs uppercase tracking-wider text-neutral-500">
              Best reps
            </div>
            <div className="text-2xl font-bold mt-1">{stats.bestReps.toFixed(0)}</div>
          </div>

          <div className="rounded-2xl bg-neutral-950/60 border border-neutral-800 p-4">
            <div className="text-xs uppercase tracking-wider text-neutral-500">
              Strength score
            </div>

            <div className="text-2xl font-bold mt-1 text-neutral-100">
              {strengthScore.allTimeScore.toFixed(0)}
            </div>

            {strengthScore.lastWeekScore > 0 ? (
              <div className="text-xs text-neutral-600 mt-1">
                {strengthScore.delta >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(strengthScore.delta).toFixed(0)} this week
              </div>
            ) : (
              <div className="text-xs text-neutral-600 mt-1">
                First week with data (week {strengthScore.latestWeek})
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-neutral-950/60 border border-neutral-800 p-4">
            <div className="text-xs uppercase tracking-wider text-neutral-500">
              Total
            </div>
            <div className="text-lg font-semibold mt-1 text-neutral-100">
              {stats.total}{" "}
              <span className="text-neutral-500 font-normal">logs</span>
            </div>
            <div className="text-xs text-neutral-600 mt-1">
              Last: {stats.lastDate || "—"}
            </div>
          </div>
        </div>

        {/* Trend */}
        <Sparkline values={trendValues} />

        {/* History */}
        <div className="pt-2 border-t border-neutral-800">
          <div className="flex items-end justify-between mb-2">
            <div>
              <div className="text-sm text-neutral-300 font-semibold">History</div>
              <div className="text-xs text-neutral-500">{selectedName}</div>
            </div>

            <div className="text-xs text-neutral-600">
              Showing {Math.min(entries.length, 20)} of {entries.length}
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="text-neutral-400 text-sm">
              No logs yet for this exercise.
            </div>
          ) : (
            <div className="space-y-2">
              {entries.slice(0, 20).map((e, idx) => {
                const vol = e.performedWeight * e.performedReps;

                const isBestWeight = prFlags.prWeightTs.has(e.timestamp);
                const isBestReps = prFlags.prRepsTs.has(e.timestamp);

                return (
                  <div
                    key={e.timestamp + ":" + idx}
                    className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-neutral-300">
                        {formatDate(e.timestamp)}
                      </div>
                      <div className="text-sm font-semibold">
                        {formatWeight(e.performedWeight)} kg ×{" "}
                        {e.performedReps.toFixed(0)}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-xs text-neutral-600">
                        Volume: {Number.isFinite(vol) ? vol.toFixed(0) : "0"}
                      </div>

                      <div className="flex gap-2">
                        {isBestWeight && (
                          <span className="text-xs px-2 py-1 rounded-full border border-neutral-700 text-neutral-200">
                            PR weight
                          </span>
                        )}
                        {isBestReps && (
                          <span className="text-xs px-2 py-1 rounded-full border border-neutral-700 text-neutral-200">
                            PR reps
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-3 text-xs text-neutral-600">
            Tip: PR set is measured as{" "}
            <span className="text-neutral-400">kg × reps</span> on a single logged set.
          </div>
        </div>
      </div>
    </div>
  );
}