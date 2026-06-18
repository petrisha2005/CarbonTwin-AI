import { Repeat2 } from "lucide-react";
import { Card } from "../Card";
import type { CoachRecommendation } from "../../services/coachService";

export function HabitSwapCard({ swap }: { swap: CoachRecommendation["habitSwap"] }) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Repeat2 size={20} className="text-neon-green" />
        <h3 className="font-bold">Habit Swap</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-lg border border-red-300/20 bg-red-400/10 p-3">
          <p className="text-xs uppercase tracking-wide text-red-200">From</p>
          <p className="mt-1 text-sm text-white">{swap.from}</p>
        </div>
        <Repeat2 className="hidden text-neon-green sm:block" size={20} />
        <div className="rounded-lg border border-neon-green/30 bg-neon-green/10 p-3">
          <p className="text-xs uppercase tracking-wide text-neon-green">To</p>
          <p className="mt-1 text-sm text-white">{swap.to}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-300">{swap.reason}</p>
      <p className="mt-3 text-sm font-semibold text-neon-cyan">Estimated saving: {swap.estimatedCO2Saving} kg CO2</p>
    </Card>
  );
}
