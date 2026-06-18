import { Target } from "lucide-react";
import { Card } from "../Card";
import type { CoachRecommendation } from "../../services/coachService";

export function CarbonTargetCard({ recommendation }: { recommendation: CoachRecommendation }) {
  const target = recommendation.carbonReductionTarget;
  const percent = target.baselineKg > 0 ? Math.min(100, Math.round((target.targetKg / target.baselineKg) * 100)) : 25;

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Target size={20} className="text-neon-green" />
        <h3 className="font-bold">Carbon Target</h3>
      </div>
      <p className="text-3xl font-black text-white">{target.targetKg} kg</p>
      <p className="mt-1 text-sm text-slate-400">reduction target over {target.timeframe}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-neon-green" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-4 text-sm text-slate-300">{recommendation.motivationalLine}</p>
      <p className="mt-3 text-xs text-slate-500">Baseline: {target.baselineKg} kg CO2</p>
    </Card>
  );
}
