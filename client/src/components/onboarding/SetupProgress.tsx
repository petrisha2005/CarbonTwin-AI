export function SetupProgress({ step, percent }: { step: string; percent: number }) {
  return (
    <div className="rounded-lg border border-neon-green/20 bg-neon-green/10 p-4">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-neon-green">{step}</span>
        <span className="text-slate-300">{percent}% complete</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-neon-green shadow-glow" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
