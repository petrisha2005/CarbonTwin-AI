import { Medal } from "lucide-react";
import { Card } from "../Card";

export function BattleLeaderboard({ leaderboard, currentUserId }: { leaderboard: any[]; currentUserId?: string }) {
  return (
    <Card>
      <h2 className="flex items-center gap-2 text-2xl font-black"><Medal className="text-neon-green" /> Live Leaderboard</h2>
      <div className="mt-5 space-y-2">
        {leaderboard.length ? leaderboard.map((row) => (
          <div key={row.userId} className={`grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-lg px-3 py-3 text-sm ${row.userId === currentUserId ? "bg-neon-green/15 text-neon-green" : "bg-white/[0.05]"}`}>
            <span className="font-black">#{row.rank}</span>
            <span>{row.displayName ?? row.user?.name ?? "Eco Player"}</span>
            <span className="font-bold">{row.score ?? 0} pts</span>
          </div>
        )) : <p className="text-sm text-slate-400">No scores yet.</p>}
      </div>
    </Card>
  );
}
