import { Clock, Leaf } from "lucide-react";
import { Card } from "../Card";
import type { CoachRecommendation } from "../../services/coachService";

export function QuickActionCard({ actions }: { actions: CoachRecommendation["quickActions"] }) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Leaf size={20} className="text-neon-green" />
        <h3 className="font-bold">Quick Actions</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <div key={action.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <p className="font-semibold text-white">{action.title}</p>
            <p className="mt-2 text-sm text-slate-300">{action.whyThisHelps}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-neon-green/15 px-2 py-1 capitalize text-neon-green">{action.category.replace(/([A-Z])/g, " $1")}</span>
              <span className="rounded-md bg-neon-cyan/15 px-2 py-1 text-neon-cyan">{action.estimatedCO2Saving} kg</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-slate-200">
                <Clock size={13} />
                {action.timeRequired}
              </span>
              <span className="rounded-md bg-white/10 px-2 py-1 text-slate-200">{action.cost.replace("_", " ")}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
