import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../Card";
import type { CommunityImpact, MyRanks } from "../../services/leaderboardService";
import type { User } from "../../lib/types";

export function CampusLeagueCard({ user, impact, ranks }: { user: User | null; impact: CommunityImpact | null; ranks: MyRanks | null }) {
  if (!user?.collegeName || !user.department) {
    return (
      <Card>
        <h3 className="flex items-center gap-2 font-bold"><GraduationCap className="text-neon-green" /> Join your Campus Carbon League</h3>
        <p className="mt-2 text-sm text-slate-300">Add your college and department to compete with classmates.</p>
        <Link to="/profile" className="focus-ring mt-4 inline-flex rounded-lg bg-neon-green px-4 py-2 text-sm font-semibold text-carbon-950">Update Profile</Link>
      </Card>
    );
  }
  return (
    <Card>
      <h3 className="flex items-center gap-2 font-bold"><GraduationCap className="text-neon-green" /> {user.collegeName} Carbon League</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric label="Department rank" value={ranks?.department?.rank ? `#${ranks.department.rank}` : "Unranked"} />
        <Metric label="Department saved" value={`${impact?.department?.totalCO2Saved ?? 0} kg`} />
        <Metric label="College saved" value={`${impact?.college?.totalCO2Saved ?? 0} kg`} />
        <Metric label="College quests" value={impact?.college?.totalEcoQuests ?? 0} />
      </div>
      <p className="mt-4 text-sm text-neon-green">Your department is climbing the Carbon League.</p>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-white/[0.05] p-3"><p className="label">{label}</p><p className="mt-1 font-black">{value}</p></div>;
}
