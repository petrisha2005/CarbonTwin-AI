export function MissionProgressBar({ progress, target }: { progress: number; target: number }) {
  const percent = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span>Progress</span>
        <span>{progress}/{target}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-neon-green shadow-glow transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
