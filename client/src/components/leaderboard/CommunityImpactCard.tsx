import { Leaf, Route, Sprout, Users } from "lucide-react";
import { Card } from "../Card";
import type { CommunityImpact } from "../../services/leaderboardService";

export function CommunityImpactCard({ impact }: { impact: CommunityImpact | null }) {
  const global = impact?.global;
  return (
    <Card>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neon-green">Community Impact</p>
          <h2 className="mt-1 text-2xl font-black">Compete with friends. Save carbon together.</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Together, your community is turning tiny actions into visible impact.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Impact icon={Leaf} label="CO2 saved" value={`${global?.totalCO2Saved ?? 0} kg`} />
          <Impact icon={Users} label="Users" value={global?.totalUsers ?? 0} />
          <Impact icon={Sprout} label="Trees" value={global?.equivalentTrees ?? 0} />
          <Impact icon={Route} label="Petrol km" value={global?.equivalentPetrolKm ?? 0} />
        </div>
      </div>
    </Card>
  );
}

function Impact({ icon: Icon, label, value }: { icon: typeof Leaf; label: string; value: string | number }) {
  return (
    <div className="min-w-32 rounded-lg border border-white/10 bg-white/[0.05] p-3">
      <Icon size={18} className="text-neon-green" />
      <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
