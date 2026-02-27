import { useState } from "react";

type Day = { id: string; name: string; focus?: string };

export default function PlanPage() {
  const [days, setDays] = useState<Day[]>([
    { id: "1", name: "Økt 1", focus: "Push" },
    { id: "2", name: "Økt 2", focus: "Pull" },
    { id: "3", name: "Økt 3", focus: "Legs" },
  ]);

  const addDay = () => {
    const next = days.length + 1;
    setDays([...days, { id: String(next), name: `Økt ${next}` }]);
  };

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Plan</h1>
        <p className="text-neutral-400 text-sm">
          Bygg økter og legg til øvelser (mock).
        </p>
      </header>

      <div className="space-y-3">
        {days.map((d) => (
          <button
            key={d.id}
            className="w-full text-left rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">{d.name}</div>
              <span className="text-xs rounded-full border border-neutral-700 px-3 py-1 text-neutral-300">
                {d.focus ?? "Uten fokus"}
              </span>
            </div>

            <div className="mt-2 text-sm text-neutral-400">
              Trykk for å åpne og legge til øvelser.
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={addDay}
        className="w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold active:scale-[0.99]"
      >
        Legg til ny økt
      </button>
    </div>
  );
}