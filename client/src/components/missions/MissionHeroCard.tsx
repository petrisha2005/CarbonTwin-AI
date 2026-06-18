import { Coins, Leaf, Medal, Sparkles, Zap } from "lucide-react";
import { Card } from "../Card";
import type { MissionSummary } from "../../services/missionService";

export function MissionHeroCard({ summary }: { summary: MissionSummary | null }) {
  return (
    <Card>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neon-green">Tiny mission. Real impact.</p>
          <h1 className="mt-1 text-3xl font-black">Eco Missions</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Complete small climate-friendly actions, earn rewards, and grow your CarbonTwin.</p>
          {(summary?.totalCompleted ?? 0) === 0 && <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-sm text-slate-300">Start your first mission to earn rewards.</p>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Metric icon={Medal} label="Today" value={summary?.completedToday ?? 0} />
          <Metric icon={Sparkles} label="Active" value={summary?.activeMissions ?? 0} />
          <Metric icon={Leaf} label="CO2 saved" value={`${summary?.co2SavedFromMissions ?? 0} kg`} />
          <Metric icon={Zap} label="XP" value={summary?.xpEarnedFromMissions ?? 0} />
          <Metric icon={Coins} label="LeafCoins" value={summary?.leafCoinsEarnedFromMissions ?? 0} />
        </div>
      </div>
    </Card>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Leaf; label: string; value: string | number }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3"><Icon size={18} className="text-neon-green" /><p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>;
}
