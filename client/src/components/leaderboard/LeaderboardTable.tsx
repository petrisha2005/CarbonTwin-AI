import { Coins, Flame, Leaf, Medal, TrendingUp, Trophy } from "lucide-react";
import { Card } from "../Card";
import type { LeaderboardResponse, LeaderboardType } from "../../services/leaderboardService";

export function LeaderboardTable({ data, type }: { data: LeaderboardResponse | null; type: LeaderboardType }) {
  const scoreLabel = type === "weekly" ? "Weekly score" : type === "monthly" ? "Monthly score" : "EcoScore";
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Trophy size={21} className="text-amber-300" />
        <h3 className="text-xl font-bold capitalize">{type} leaderboard</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-400">
            <tr>
              <th className="py-3">Rank</th>
              <th>Explorer</th>
              <th>Title</th>
              <th>Level</th>
              <th>CO2 saved</th>
              <th>Streak</th>
              <th>LeafCoins</th>
              <th>{scoreLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data?.topUsers.map((user) => {
              const isCurrent = data.currentUser?.userId === user.userId;
              return (
                <tr key={user.userId} className={`border-t border-white/10 ${isCurrent ? "bg-neon-green/10 text-white shadow-[inset_3px_0_0_#22c55e]" : ""}`}>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-2 font-bold">
                      {user.rank <= 3 ? <Medal size={16} className="text-amber-300" /> : <TrendingUp size={16} className="text-neon-cyan" />}
                      #{user.rank}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg text-sm font-black text-carbon-950" style={{ backgroundColor: user.avatarColor || "#22c55e" }}>
                        {user.displayName.slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold">{user.displayName}</p>
                        <p className="text-xs text-slate-400">{user.collegeName || user.city || "Global"}</p>
                      </div>
                    </div>
                  </td>
                  <td>{user.ecoTitle}</td>
                  <td>Lv {user.level}</td>
                  <td><span className="inline-flex items-center gap-1"><Leaf size={14} className="text-neon-green" /> {user.totalCO2Saved} kg</span></td>
                  <td><span className="inline-flex items-center gap-1"><Flame size={14} className="text-orange-300" /> {user.currentStreak}</span></td>
                  <td><span className="inline-flex items-center gap-1"><Coins size={14} className="text-amber-300" /> {user.leafCoins}</span></td>
                  <td className="font-black text-neon-green">{user.ecoScore}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!data?.topUsers.length && <p className="py-8 text-center text-slate-400">No league entries yet.</p>}
    </Card>
  );
}
