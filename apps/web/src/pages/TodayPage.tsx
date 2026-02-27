export default function TodayPage() {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Today</h1>
        <p className="text-neutral-400 text-sm">
          Dagens økt (mock).
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-400">Økt</div>
            <div className="text-lg font-semibold">Push Day</div>
          </div>
          <span className="text-xs rounded-full border border-neutral-700 px-3 py-1 text-neutral-300">
            Økt 1
          </span>
        </div>

        <div className="text-sm text-neutral-300">
          Neste øvelse:
          <span className="font-semibold text-white"> Benkpress</span>
        </div>

        <div className="rounded-xl bg-black/30 border border-neutral-800 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-400">Plan</span>
            <span>3 x 8</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Sist</span>
            <span>100kg x 8</span>
          </div>
        </div>

        <button className="w-full rounded-2xl bg-white text-black py-4 text-lg font-semibold active:scale-[0.99]">
          Start økta
        </button>

        <button className="w-full rounded-2xl bg-neutral-800 py-4 text-lg font-semibold active:scale-[0.99]">
          Marker øvelse som ferdig
        </button>
      </div>
    </div>
  );
}