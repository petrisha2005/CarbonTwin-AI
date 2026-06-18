import { CalendarCheck } from "lucide-react";
import { Card } from "../Card";
import type { CoachRecommendation } from "../../services/coachService";

export function WeeklyPlanCard({ plan }: { plan: CoachRecommendation["weeklyPlan"] }) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <CalendarCheck size={20} className="text-neon-green" />
        <h3 className="font-bold">Weekly Plan</h3>
      </div>
      <div className="space-y-3">
        {plan.map((item) => (
          <div key={item.day} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-white">{item.day}</p>
              <span className="rounded-md bg-neon-green/15 px-2 py-1 text-xs capitalize text-neon-green">{item.category.replace(/([A-Z])/g, " $1")}</span>
            </div>
            <p className="mt-2 text-sm text-slate-200">{item.action}</p>
            <p className="mt-2 text-xs text-slate-400">{item.reason}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-white/10 px-2 py-1 text-slate-200">{item.difficulty}</span>
              <span className="rounded-md bg-neon-cyan/15 px-2 py-1 text-neon-cyan">{item.estimatedCO2Saving} kg saved</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
