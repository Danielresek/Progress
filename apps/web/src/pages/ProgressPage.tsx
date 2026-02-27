import { useMemo, useState } from "react";

type Entry = { date: string; weight: number; reps: number };

const MOCK: Record<string, Entry[]> = {
  Benkpress: [
    { date: "2026-02-01", weight: 80, reps: 8 },
    { date: "2026-02-08", weight: 82.5, reps: 8 },
    { date: "2026-02-15", weight: 85, reps: 7 },
  ],
  "Skulderpress": [
    { date: "2026-02-03", weight: 30, reps: 10 },
    { date: "2026-02-10", weight: 32.5, reps: 9 },
  ],
  "Triceps pushdown": [
    { date: "2026-02-04", weight: 45, reps: 12 },
    { date: "2026-02-11", weight: 47.5, reps: 11 },
  ],
};

export default function ProgressPage() {
  const exercises = useMemo(() => Object.keys(MOCK), []);
  const [selected, setSelected] = useState(exercises[0]);

  const entries = MOCK[selected] ?? [];

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-neutral-400 text-sm">
          Velg øvelse for å se historikk (mock).
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
        <div className="text-sm text-neutral-400">Øvelse</div>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-3 text-white"
        >
          {exercises.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>

        <div className="pt-2 border-t border-neutral-800">
          <div className="text-sm text-neutral-400 mb-2">Historikk</div>

          {entries.length === 0 ? (
            <div className="text-neutral-400 text-sm">
              Ingen logg enda for denne øvelsen.
            </div>
          ) : (
            <div className="space-y-2">
              {entries
                .slice()
                .reverse()
                .map((e) => (
                  <div
                    key={e.date + e.weight + e.reps}
                    className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-3"
                  >
                    <div className="text-sm text-neutral-300">{e.date}</div>
                    <div className="text-sm font-semibold">
                      {e.weight} kg × {e.reps}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}