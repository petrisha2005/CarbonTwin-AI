import { Sprout, Trees } from "lucide-react";

export function TreeStage({ stage = "Seed", level = 1 }: { stage?: string; level?: number }) {
  const Icon = level >= 8 ? Trees : Sprout;
  return (
    <div className="rounded-lg border border-neon-green/25 bg-neon-green/10 p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-neon-green text-carbon-950">
          <Icon />
        </span>
        <div>
          <p className="label">CarbonTwin Tree</p>
          <h3 className="text-xl font-black">{stage}</h3>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-300">Your CarbonTwin Tree grows as you complete eco quests.</p>
      <div className="mt-4 h-3 rounded-full bg-white/10">
        <div className="h-3 rounded-full bg-neon-green" style={{ width: `${Math.min(100, ((level % 10) / 10) * 100 || 10)}%` }} />
      </div>
    </div>
  );
}
