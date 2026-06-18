import { Card } from "../Card";

export function EvolutionTimeline({ stages, current, nextGoal }: { stages: string[]; current: string; nextGoal: string }) {
  return (
    <Card>
      <h3 className="text-xl font-black">Evolution Path</h3>
      <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stages.map((stage) => {
          const active = stage === current;
          return (
            <div key={stage} className={`rounded-lg border p-3 text-center text-sm ${active ? "border-neon-green bg-neon-green/15 text-neon-green" : "border-white/10 bg-white/[0.04] text-slate-300"}`}>
              {stage}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-slate-400">{nextGoal}</p>
    </Card>
  );
}
