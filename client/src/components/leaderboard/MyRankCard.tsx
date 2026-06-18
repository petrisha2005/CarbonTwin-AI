import { Flame, Trophy } from "lucide-react";
import { Card } from "../Card";
import type { MyRanks } from "../../services/leaderboardService";

export function MyRankCard({ ranks }: { ranks: MyRanks | null }) {
  const global = ranks?.global;
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Trophy size={20} className="text-amber-300" />
        <h3 className="font-bold">My Rank</h3>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(["global", "city", "college", "department"] as const).map((key) => (
          <div key={key} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">{key}</p>
            <p className="mt-1 text-xl font-black">{ranks?.[key]?.rank ? `#${ranks[key].rank}` : "Locked"}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-300">
        {global?.pointsToNextRank
          ? `You need ${global.pointsToNextRank} more EcoScore points to reach the next rank. Complete one Eco Quest and one eco action today.`
          : "Tiny actions. Big leaderboard moves."}
      </p>
      <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-neon-green/10 px-3 py-2 text-sm text-neon-green">
        <Flame size={16} />
        Your streak is pushing you up.
      </p>
    </Card>
  );
}
