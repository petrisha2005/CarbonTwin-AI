import { Activity } from "lucide-react";
import { Card } from "../Card";

export function BattleActivityFeed({ activities }: { activities: any[] }) {
  return (
    <Card>
      <h2 className="flex items-center gap-2 text-xl font-black"><Activity className="text-neon-green" /> Activity Feed</h2>
      <div className="mt-4 space-y-3">
        {activities.length ? activities.map((activity) => (
          <div key={activity.id} className="rounded-lg bg-white/[0.05] p-3 text-sm">
            <p className="font-semibold">{activity.user?.displayName || activity.user?.name || "Eco Player"} {activity.actionTitle}</p>
            <p className="mt-1 text-slate-400">+{activity.scoreAdded ?? 0} pts • {activity.co2Saved ?? 0} kg CO2 saved</p>
          </div>
        )) : <p className="text-sm text-slate-400">No battle activity yet. Complete an Eco Quest to make the first move.</p>}
      </div>
    </Card>
  );
}
