import { Medal, Trophy } from "lucide-react";
import type { LeaderboardUser } from "../../services/leaderboardService";

const styles = [
  "border-amber-300/50 bg-amber-300/10 text-amber-100",
  "border-slate-300/40 bg-slate-300/10 text-slate-100",
  "border-orange-300/40 bg-orange-300/10 text-orange-100"
];

export function TopThreePodium({ users, currentUserId }: { users: LeaderboardUser[]; currentUserId?: string }) {
  if (!users.length) return null;
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {users.slice(0, 3).map((user, index) => (
        <div key={user.userId} className={`rounded-lg border p-4 ${styles[index]} ${user.userId === currentUserId ? "ring-2 ring-neon-green" : ""}`}>
          <div className="flex items-center justify-between gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-black/20">
              {index === 0 ? <Trophy size={22} /> : <Medal size={22} />}
            </span>
            <span className="text-2xl font-black">#{user.rank}</span>
          </div>
          <p className="mt-4 text-lg font-black">{user.displayName}</p>
          <p className="text-sm opacity-80">{user.ecoTitle}</p>
          <p className="mt-3 text-sm">{user.ecoScore} points</p>
        </div>
      ))}
    </div>
  );
}
