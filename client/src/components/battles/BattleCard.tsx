import { CalendarDays, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../Button";
import { Card } from "../Card";

export function BattleCard({ battle }: { battle: any }) {
  const leader = battle.leaderboard?.[0];
  const me = battle.leaderboard?.find((row: any) => row.rank === battle.currentUserRank);
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label">{battle.battleCode}</p>
          <h3 className="mt-1 text-xl font-black">{battle.title}</h3>
          <p className="mt-2 text-sm text-slate-400">{battle.description || "Tiny actions. Big battle moves."}</p>
        </div>
        <Trophy className="text-neon-green" size={30} />
      </div>
      <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
        <span className="inline-flex items-center gap-2 rounded-lg bg-white/[0.05] px-3 py-2 text-slate-200"><Users size={16} /> {battle.participants?.length ?? 0}/{battle.maxParticipants} players</span>
        <span className="inline-flex items-center gap-2 rounded-lg bg-white/[0.05] px-3 py-2 text-slate-200"><CalendarDays size={16} /> {timeText(battle)}</span>
      </div>
      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <Info label="Your rank" value={battle.currentUserRank ? `#${battle.currentUserRank}` : "-"} />
        <Info label="Leader" value={leader?.displayName ?? "-"} />
        <Info label="Your score" value={me?.score ?? 0} />
      </div>
      <Link to={`/battles/${battle.id}`} className="mt-5 inline-flex"><Button variant="secondary">Open Battle</Button></Link>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-white/[0.05] p-3"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-bold">{value}</p></div>;
}

function timeText(battle: any) {
  if (battle.status === "completed") return "Completed";
  if (battle.status === "cancelled") return "Cancelled";
  const end = new Date(battle.endDate).getTime();
  const diff = Math.max(0, end - Date.now());
  const days = Math.ceil(diff / 86400000);
  return days <= 1 ? "Ends today" : `${days} days left`;
}
